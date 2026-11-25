import io
import os
import base64
from app.config import STATIC_DIR
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.utils import ImageReader

LOGO_FALLBACK = "/9j/4AAQSkZJRgABAQAASABIAAD/4QCMRXhpZgAATU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAABAAAAWgAAAAAAAABIAAAAAQAAAEgAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAAoCgAwAEAAAAAQAAAoAAAAAA/+0AOFBob3Rvc2hvcCAzLjAAOEJJTQQEAAAAAAAAOEJJTQQlAAAAAAAQ1B2M2Y8AsgTpgAmY7PhCfv/AABEIAoACgAMBIgACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIxgUQUQpGhscE/9oADAMBAAIRAxEAP/AP9k="

def _cop(valor) -> str:
    """Pesos redondeados (no truncados): 52.999,6 se imprime $53,000 y no $52,999."""
    return f"${round(float(valor or 0)):,}"


def generar_factura_pdf(documento, items, es_cotizacion=False):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    elements = []

    logo_path = os.path.join(STATIC_DIR, "logo_factura.jpeg")
    if not os.path.exists(logo_path):
        logo_path = os.path.join(STATIC_DIR, "logo.png")

    if os.path.exists(logo_path):
        logo_image = Image(logo_path, width=2.5*inch, height=2.5*inch)
    else:
        logo_data = base64.b64decode(LOGO_FALLBACK)
        logo_image = Image(io.BytesIO(logo_data), width=2.5*inch, height=2.5*inch)

    title_style = ParagraphStyle(
        'TitleStyle', 
        parent=styles['Heading1'], 
        fontName='Helvetica-Bold', 
        fontSize=18, 
        textColor=colors.black, 
        alignment=1,
        spaceBefore=2,
        spaceAfter=2
    )
    
    normal_style = ParagraphStyle(
        'NormalBlack',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.black
    )
    
    account_style = ParagraphStyle(
        'AccountStyle', 
        parent=styles['Normal'], 
        fontName='Helvetica', 
        fontSize=9, 
        leading=13, 
        textColor=colors.black
    )

    num_doc = documento.get("consecutivo_str", str(documento.get("_id", ""))[:8])
    
    if es_cotizacion:
        tipo_doc_titulo = "PEDIDOS"
        label_num = "Pedido N°:"
    elif documento.get("estado_despacho") == "Pendiente":
        tipo_doc_titulo = "FACTURA DE VENTA - [PENDIENTE / PARCIAL]"
        label_num = "Factura N°:"
    else:
        tipo_doc_titulo = "FACTURA DE VENTA"
        label_num = "Factura N°:"

    elements.append(logo_image)
    elements.append(Paragraph("0808 CAFÉ DE ESPECIALIDAD", title_style))
    elements.append(Paragraph(f"<b>{tipo_doc_titulo}</b>", ParagraphStyle('SubTitle', parent=normal_style, alignment=1, fontSize=11, spaceBefore=2, spaceAfter=10)))
    elements.append(Spacer(1, 10))

    info_data = [
        [Paragraph(f"<b>{label_num}</b> {num_doc}", normal_style), Paragraph(f"<b>Fecha:</b> {documento['fecha']}", normal_style)],
        [Paragraph(f"<b>Cliente:</b> {documento.get('cliente', 'General')}", normal_style), Paragraph(f"<b>Método:</b> {documento.get('tipo_pago', 'N/A')}", normal_style)]
    ]
    elements.append(Table(info_data, colWidths=[3.5*inch, 3.5*inch]))
    elements.append(Spacer(1, 15))

    table_data = [["Producto", "Cant.", "Precio Unit.", "Descuento", "Subtotal"]]
    
    es_obsequio = documento.get("tipo_venta") == "Obsequio"
    valor_total_bruto = 0.0
    descuento_total = 0.0
    valor_a_pagar = 0.0

    for item in items:
        cant = item["cantidad"]
        p_unit = float(item["precio_unitario"] or 0.0)
        desc_u = float(item.get("descuento", 0.0) or 0.0)
        pres = item.get("presentacion", "Grano")

        subtotal_bruto = cant * p_unit
        # En un obsequio el descuento es el 100%, así cada fila cierra: Cant x Precio - Descuento = Subtotal
        desc_item_total = subtotal_bruto if es_obsequio else min(subtotal_bruto, desc_u * cant)
        subtotal_neto = subtotal_bruto - desc_item_total

        valor_total_bruto += subtotal_bruto
        descuento_total += desc_item_total
        valor_a_pagar += subtotal_neto

        table_data.append([
            f"{item['nombre']} ({int(item['gramaje'])}g - {pres})",
            str(cant),
            _cop(p_unit),
            _cop(desc_item_total),
            _cop(subtotal_neto),      # ya con el descuento aplicado: la suma de esta columna es el Valor a Pagar
        ])

    prod_table = Table(table_data, colWidths=[3.0*inch, 0.7*inch, 1.1*inch, 1.1*inch, 1.1*inch])
    prod_table.hAlign = 'CENTER'
    prod_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.black),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#333333')),
        ('ALIGN', (1,0), (-1,-1), 'CENTER'),
        ('TEXTCOLOR', (0,1), (-1,-1), colors.black),
    ]))
    elements.append(prod_table)
    elements.append(Spacer(1, 15))

    # --- Pago + totales: un solo bloque centrado, del mismo ancho que la grilla de ítems (7") ---
    # Icono de llave (static/icono_llave.png) antes del texto; si el archivo no existe, no se muestra
    ruta_llave = os.path.join(STATIC_DIR, "icono_llave.png")
    icono_llave = f'<img src="{ruta_llave}" width="9" height="9" valign="-1"/> ' if os.path.exists(ruta_llave) else ""

    texto_cuenta = Paragraph(
        "<b>Datos de Pago:</b><br/>"
        "Cuenta de Ahorros<br/>"
        "Escanea QR o transfiere a:<br/>"
        f"{icono_llave}Llave No. 3012226387<br/>"
        "Elkin Sierra",
        account_style
    )

    # QR de pago (opcional): static/qr_pago.png (o .jpg / .jpeg). Si no existe, la factura sale sin QR.
    qr_celda = ""
    for nombre_qr in ("qr_pago.png", "qr_pago.jpg", "qr_pago.jpeg"):
        ruta_qr = os.path.join(STATIC_DIR, nombre_qr)
        if os.path.exists(ruta_qr):
            lado = 1.15 * inch
            try:
                ancho_px, alto_px = ImageReader(ruta_qr).getSize()
                qr_celda = Image(ruta_qr, width=lado, height=lado * alto_px / ancho_px)
            except Exception:
                qr_celda = ""
            break

    total_data = [
        ["Valor Bruto:", f"{_cop(valor_total_bruto)} COP"],
        ["Descuento Total:", f"-{_cop(descuento_total)} COP"],
        ["Valor a Pagar:", f"{_cop(valor_a_pagar)} COP"],
    ]
    t_totales = Table(total_data, colWidths=[1.6*inch, 1.5*inch])
    t_totales.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'RIGHT'),
        ('FONTNAME', (0,2), (-1,2), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.black),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))

    bloque = Table(
        [[qr_celda, texto_cuenta, t_totales]],
        colWidths=[1.35*inch, 2.4*inch, 3.25*inch],   # suma 7.0" = ancho de la grilla
    )
    bloque.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (0,0), (0,0), 'CENTER'),
        ('ALIGN', (2,0), (2,0), 'RIGHT'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    bloque.hAlign = 'CENTER'
    elements.append(bloque)

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()

"""Plan de recontacto: con las dos últimas compras de cada cliente estima cuándo le toca volver a comprar.

Es cálculo puro (sin IA): días entre las dos últimas compras = ciclo de recompra del cliente.
Con una sola compra se usa un ciclo por defecto. El texto del mensaje sale de una plantilla.
"""
from datetime import date, datetime, timedelta
from urllib.parse import quote

from app.services.documentos import normalizar_celular

CICLO_POR_DEFECTO = 30
CICLO_MIN, CICLO_MAX = 7, 90
DIAS_AVISO_PREVIO = 3          # "le toca pronto": faltan 3 días o menos
DIAS_ENTRE_CONTACTOS = 7       # no volver a escribirle antes de esto
_SIN_CLIENTE = {"", "cliente general"}


def hoy_colombia() -> date:
    return (datetime.utcnow() - timedelta(hours=5)).date()


def _fecha(valor):
    try:
        return date.fromisoformat(str(valor)[:10])
    except (ValueError, TypeError):
        return None


def _producto_principal(venta) -> str:
    items = venta.get("items") or []
    if not items:
        return "nuestro café"
    it = max(items, key=lambda i: (i.get("cantidad") or 0) * (i.get("gramaje") or 0))
    nombre = (it.get("nombre") or "café").strip()
    pres = (it.get("presentacion") or "").strip()
    return f"{nombre} {pres}".strip() if pres and pres.lower() not in nombre.lower() else nombre


def _mensaje(segmento, nombre, producto, dias_desde) -> str:
    primer = (nombre or "").split(" ")[0].strip() or "hola"
    if segmento == "Dormido":
        cuerpo = (f"Hola {primer} ☕ Hace tiempo no te saludamos desde 0808 Café. "
                  f"Tenemos café recién tostado y pensamos en ti: ¿te enviamos tu {producto}?")
    elif segmento == "Atrasado":
        cuerpo = (f"Hola {primer} ☕ Te escribimos de 0808 Café. Calculamos que tu café ya se está acabando. "
                  f"¿Te preparamos otra bolsa de {producto}?")
    else:
        cuerpo = (f"Hola {primer} ☕ Te escribimos de 0808 Café. Pronto se te acabará tu café; "
                  f"¿quieres que te apartemos tu {producto} recién tostado?")
    return cuerpo + "\nSi prefieres no recibir recordatorios, respóndenos NO."


def analizar(ventas, clientes, hoy=None) -> list:
    """Devuelve una fila por cliente, ordenada por urgencia (más atrasado primero)."""
    hoy = hoy or hoy_colombia()
    por_cliente = {}
    for v in ventas:
        if v.get("tipo_venta") in ("Anulado", "Obsequio") or v.get("estado_despacho") == "Anulado":
            continue
        nombre = (v.get("cliente") or "").strip()
        f = _fecha(v.get("fecha"))
        if nombre.lower() in _SIN_CLIENTE or f is None:
            continue
        por_cliente.setdefault(nombre.lower(), {"nombre": nombre, "compras": []})["compras"].append((f, v))

    ficha = {(c.get("nombre") or "").strip().lower(): c for c in clientes}
    filas = []
    for clave, datos in por_cliente.items():
        compras = sorted(datos["compras"], key=lambda t: (t[0], str((t[1].get("creado_en") or ""))))
        fechas = sorted({f for f, _ in compras})
        ultima = fechas[-1]
        ultima_venta = [v for f, v in compras if f == ultima][-1]
        if len(fechas) >= 2:
            ciclo, base = max(CICLO_MIN, min(CICLO_MAX, (fechas[-1] - fechas[-2]).days)), "2 últimas compras"
        else:
            ciclo, base = CICLO_POR_DEFECTO, "1 sola compra (ciclo estimado)"
        proxima = ultima + timedelta(days=ciclo)
        dias_para = (proxima - hoy).days
        dias_desde = (hoy - ultima).days
        if dias_desde > 2 * ciclo:
            segmento = "Dormido"
        elif dias_para < 0:
            segmento = "Atrasado"
        elif dias_para <= DIAS_AVISO_PREVIO:
            segmento = "Le toca pronto"
        else:
            segmento = "Al día"

        c = ficha.get(clave) or {}
        telefono = normalizar_celular(c.get("celular", ""))
        producto = _producto_principal(ultima_venta)
        mensaje = _mensaje(segmento, datos["nombre"], producto, dias_desde)
        ult_contacto = c.get("ultimo_contacto")
        reciente = bool(ult_contacto and (datetime.utcnow() - ult_contacto).days < DIAS_ENTRE_CONTACTOS)
        filas.append({
            "cliente": datos["nombre"],
            "celular": telefono,
            "segmento": segmento,
            "ultima_compra": ultima.isoformat(),
            "dias_desde": dias_desde,
            "ciclo_dias": ciclo,
            "base_ciclo": base,
            "proxima": proxima.isoformat(),
            "dias_para": dias_para,
            "compras": len(fechas),
            "producto": producto,
            "mensaje": mensaje,
            "whatsapp": f"https://wa.me/{telefono}?text={quote(mensaje)}" if telefono else "",
            "acepta_mensajes": c.get("acepta_mensajes", True) is not False,
            "contactado_reciente": reciente,
            "ultimo_contacto": ult_contacto.strftime("%Y-%m-%d") if ult_contacto else "",
            "registrado": bool(c),
        })
    filas.sort(key=lambda r: r["dias_para"])
    return filas

"""Plan de recontacto de clientes.

Personas naturales: se estima cuánto les dura el café según los gramos que compraron
(consumo estándar 20 g/día, ajustado con su propio historial cuando hay datos fiables).
Negocios (cafeterías): se usa el ritmo habitual de sus pedidos (mediana de los últimos intervalos).
Es cálculo puro, sin IA; el texto del mensaje sale de plantillas.
"""
import statistics
import unicodedata
from datetime import date, datetime, timedelta
from urllib.parse import quote

from app.services.documentos import normalizar_celular

CONSUMO_DIA_G = 20.0               # persona natural: ~1 a 1,5 tazas al día
CONSUMO_MIN_G, CONSUMO_MAX_G = 10.0, 45.0
GAP_MIN_PARA_APRENDER = 14         # solo se aprende el consumo real si pasaron >= 14 días entre compras
JUNTAR_COMPRAS_DIAS = 10           # compras de personas con menos de 10 días cuentan como una sola
FRACCION_AVISO = 0.8               # se avisa cuando ya consumió ~80 %
DIAS_SEGUIMIENTO_TRAS_AGOTAR = 7
DIAS_PRIMERA_COMPRA = 10           # "¿cómo te pareció?" a partir de aquí
INTERVALO_NEGOCIO_DEFECTO = 14
FACTOR_ATRASO_NEGOCIO = 1.25
MAX_CONTACTOS = 3                  # sin respuesta tras 3 mensajes, se pausa hasta que vuelva a comprar
DIAS_ENTRE_CONTACTOS = 7
MAX_REACTIVACION_DIA = 10
NEGOCIOS_INICIALES = {"le reve lab", "hortensia cafe", "pie de limon", "jonathan rodriguez"}
_SIN_CLIENTE = {"", "cliente general"}
ORDEN = {"Atrasado": 0, "Le toca pronto": 1, "Primera compra": 2, "Reactivación": 3, "Al día": 4, "Inactivo": 5}


def hoy_colombia() -> date:
    return (datetime.utcnow() - timedelta(hours=5)).date()


def _norm(t: str) -> str:
    t = unicodedata.normalize("NFKD", (t or "").strip().lower())
    return "".join(ch for ch in t if not unicodedata.combining(ch))


def _fecha(valor):
    try:
        return date.fromisoformat(str(valor)[:10])
    except (ValueError, TypeError):
        return None


def _gramos(venta) -> float:
    total = 0.0
    for it in venta.get("items") or []:
        g = it.get("gramos_totales")
        total += float(g) if g else float(it.get("gramaje") or 0) * float(it.get("cantidad") or 0)
    return total


def _producto_principal(ventas) -> str:
    """Producto con más gramos en las compras dadas."""
    acum = {}
    for v in ventas:
        for it in v.get("items") or []:
            nombre = (it.get("nombre") or "café").strip()
            pres = (it.get("presentacion") or "").strip()
            clave = f"{nombre} {pres}".strip() if pres and pres.lower() not in nombre.lower() else nombre
            acum[clave] = acum.get(clave, 0) + float(it.get("gramos_totales") or 0)
    return max(acum, key=acum.get) if acum else "nuestro café"


def _mensaje(tipo, segmento, nombre, producto) -> str:
    primer = (nombre or "").strip() if tipo == "Negocio" else ((nombre or "").split(" ")[0].strip() or "hola")
    if tipo == "Negocio":
        textos = {
            "Le toca pronto": f"Hola {primer}, buen día. Te escribimos de 0808 Café: según tu ritmo de pedidos, ¿armamos el próximo pedido de {producto}?",
            "Atrasado": f"Hola {primer}, ¿cómo vas de café? Quedamos atentos para programar tu próximo pedido de {producto}.",
            "Reactivación": f"Hola {primer}, hace un tiempo no recibimos pedido tuyo en 0808 Café. ¿Hay algo que podamos ajustar? Con gusto te hacemos una propuesta.",
        }
        return textos.get(segmento, textos["Atrasado"])
    textos = {
        "Le toca pronto": f"Hola {primer} ☕ Te escribimos de 0808 Café. Calculamos que tu {producto} se está acabando; ¿te apartamos otra bolsa recién tostada?",
        "Atrasado": f"Hola {primer} ☕ Soy de 0808 Café. ¿Cómo te fue con tu {producto}? Si ya se te acabó, con gusto te preparamos otro pedido.",
        "Primera compra": f"Hola {primer} ☕ Soy de 0808 Café. ¿Cómo te pareció tu {producto}? Cuéntanos y, cuando quieras repetir, te lo preparamos.",
        "Reactivación": f"Hola {primer} ☕ Hace tiempo no sabemos de ti en 0808 Café. Tenemos café recién tostado y varietales especiales bajo pedido. ¿Te cuento?",
    }
    return textos.get(segmento, textos["Atrasado"]) + "\nSi prefieres no recibir mensajes, respóndenos NO."


def _eventos_persona(compras):
    """Junta compras con menos de JUNTAR_COMPRAS_DIAS de diferencia: [(fecha_ultima, gramos, [ventas])]."""
    eventos = []
    for f, v in compras:
        if eventos and (f - eventos[-1][0]).days < JUNTAR_COMPRAS_DIAS:
            eventos[-1] = (f, eventos[-1][1] + _gramos(v), eventos[-1][2] + [v])
        else:
            eventos.append((f, _gramos(v), [v]))
    return eventos


def _analizar_persona(compras, hoy):
    eventos = _eventos_persona(compras)
    ultima, gramos, ventas_ult = eventos[-1]
    consumo, base = CONSUMO_DIA_G, "consumo estándar 20 g/día"
    if len(eventos) >= 2:
        previo_f, previo_g, _ = eventos[-2]
        gap = (ultima - previo_f).days
        if gap >= GAP_MIN_PARA_APRENDER and previo_g > 0:
            consumo = max(CONSUMO_MIN_G, min(CONSUMO_MAX_G, previo_g / gap))
            base = f"consumo real del cliente ({consumo:.0f} g/día)"
    duracion = max(5.0, gramos / consumo)
    dias_desde = (hoy - ultima).days
    aviso = duracion * FRACCION_AVISO
    if dias_desde >= max(180, 3 * duracion):
        segmento = "Inactivo"
    elif dias_desde >= max(60, 2.5 * duracion):
        segmento = "Reactivación"
    elif dias_desde >= duracion + DIAS_SEGUIMIENTO_TRAS_AGOTAR:
        segmento = "Atrasado"
    elif dias_desde >= aviso:
        segmento = "Le toca pronto"
    elif len(eventos) == 1 and dias_desde >= DIAS_PRIMERA_COMPRA:
        segmento = "Primera compra"
    else:
        segmento = "Al día"
    if len(eventos) == 1 and segmento == "Le toca pronto":
        segmento = "Primera compra"      # cliente nuevo: primero se le pregunta cómo le fue
    proxima = ultima + timedelta(days=round(aviso))
    return {
        "ultima": ultima, "gramos": gramos, "segmento": segmento, "dias_desde": dias_desde,
        "ciclo": round(duracion), "base": base, "proxima": proxima,
        "queda_g": max(0.0, gramos - consumo * dias_desde), "producto": _producto_principal(ventas_ult),
        "n": len(eventos),
    }


def _analizar_negocio(compras, hoy):
    fechas = sorted({f for f, _ in compras})
    ultima = fechas[-1]
    ventas_ult = [v for f, v in compras if f == ultima]
    gramos = sum(_gramos(v) for v in ventas_ult)
    ult5 = fechas[-6:]
    intervalos = [(b - a).days for a, b in zip(ult5, ult5[1:]) if (b - a).days > 0]
    if intervalos:
        mediana = max(3, min(60, statistics.median(intervalos)))
        base = f"mediana de {len(intervalos)} intervalos entre pedidos"
    else:
        mediana, base = INTERVALO_NEGOCIO_DEFECTO, "1 solo pedido (ritmo estimado)"
    dias_desde = (hoy - ultima).days
    if dias_desde >= max(45, 3 * mediana):
        segmento = "Reactivación"
    elif dias_desde >= FACTOR_ATRASO_NEGOCIO * mediana:
        segmento = "Atrasado"
    elif dias_desde >= mediana * 0.9:
        segmento = "Le toca pronto"
    else:
        segmento = "Al día"
    compras_prod = [v for f, v in compras if f in fechas[-3:]]
    return {
        "ultima": ultima, "gramos": gramos, "segmento": segmento, "dias_desde": dias_desde,
        "ciclo": round(mediana), "base": base, "proxima": ultima + timedelta(days=round(mediana)),
        "queda_g": None, "producto": _producto_principal(compras_prod), "n": len(fechas),
    }


def analizar(ventas, clientes, hoy=None) -> list:
    """Una fila por cliente, ordenada por urgencia."""
    hoy = hoy or hoy_colombia()
    por_cliente = {}
    for v in ventas:
        if v.get("tipo_venta") in ("Anulado", "Obsequio") or v.get("estado_despacho") == "Anulado":
            continue
        nombre = (v.get("cliente") or "").strip()
        f = _fecha(v.get("fecha"))
        if _norm(nombre) in _SIN_CLIENTE or f is None:
            continue
        por_cliente.setdefault(_norm(nombre), {"nombre": nombre, "compras": []})["compras"].append((f, v))

    ficha = {_norm(c.get("nombre")): c for c in clientes}
    filas = []
    for clave, datos in por_cliente.items():
        compras = sorted(datos["compras"], key=lambda t: (t[0], str(t[1].get("creado_en") or "")))
        c = ficha.get(clave) or {}
        tipo = c.get("tipo_cliente") if c.get("tipo_cliente") in ("Negocio", "Persona") else (
            "Negocio" if clave in NEGOCIOS_INICIALES else "Persona")
        r = _analizar_negocio(compras, hoy) if tipo == "Negocio" else _analizar_persona(compras, hoy)

        telefono = normalizar_celular(c.get("celular", ""))
        ult_contacto = c.get("ultimo_contacto")
        contactos = 0
        if ult_contacto and (ult_contacto - timedelta(hours=5)).date() >= r["ultima"]:
            contactos = int(c.get("contactos") or 0)      # se reinicia cuando el cliente vuelve a comprar
        reciente = bool(ult_contacto and (datetime.utcnow() - ult_contacto).days < DIAS_ENTRE_CONTACTOS)
        mensaje = _mensaje(tipo, r["segmento"], datos["nombre"], r["producto"])
        filas.append({
            "cliente": datos["nombre"], "tipo_cliente": tipo, "celular": telefono,
            "segmento": r["segmento"], "ultima_compra": r["ultima"].isoformat(),
            "gramos_ultima": round(r["gramos"]), "dias_desde": r["dias_desde"],
            "ciclo_dias": r["ciclo"], "base_ciclo": r["base"],
            "queda_g": None if r["queda_g"] is None else round(r["queda_g"]),
            "proxima": r["proxima"].isoformat(), "dias_para": (r["proxima"] - hoy).days,
            "compras": r["n"], "producto": r["producto"], "mensaje": mensaje,
            "whatsapp": f"https://wa.me/{telefono}?text={quote(mensaje)}" if telefono else "",
            "acepta_mensajes": c.get("acepta_mensajes", True) is not False,
            "contactado_reciente": reciente, "contactos": contactos, "pausado": contactos >= MAX_CONTACTOS,
            "ultimo_contacto": ult_contacto.strftime("%Y-%m-%d") if ult_contacto else "",
            "registrado": bool(c), "reactivar_hoy": False,
        })

    # Reactivación: solo los más recientes cada día (tope diario)
    react = sorted([f for f in filas if f["segmento"] == "Reactivación" and f["acepta_mensajes"] and not f["pausado"]
                    and not f["contactado_reciente"]], key=lambda f: f["dias_desde"])
    for f in react[:MAX_REACTIVACION_DIA]:
        f["reactivar_hoy"] = True
    filas.sort(key=lambda f: (ORDEN.get(f["segmento"], 9), f["dias_para"]))
    return filas

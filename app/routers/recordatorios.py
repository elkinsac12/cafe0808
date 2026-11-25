"""Plan de recontacto de clientes (solo administrador)."""
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.database import db
from app.security import require_admin
from app.services.inventario import ahora
from app.services.recordatorios import analizar

router = APIRouter(prefix="/api/recordatorios", tags=["recordatorios"], dependencies=[Depends(require_admin)])


class ClienteRef(BaseModel):
    cliente: str = Field(min_length=1, max_length=120)


class Preferencia(ClienteRef):
    acepta: bool


class TipoCliente(ClienteRef):
    tipo: Literal["Persona", "Negocio"]


def _filtro_cliente(nombre: str) -> dict:
    import re
    return {"nombre": {"$regex": f"^{re.escape(nombre.strip())}$", "$options": "i"}}


@router.get("")
def plan_de_contacto():
    ventas = list(db.ventas.find(
        {"tipo_venta": {"$nin": ["Anulado", "Obsequio"]}},
        {"cliente": 1, "fecha": 1, "items": 1, "tipo_venta": 1, "estado_despacho": 1, "creado_en": 1},
    ))
    clientes = list(db.clientes.find({}, {"nombre": 1, "celular": 1, "ultimo_contacto": 1, "acepta_mensajes": 1, "tipo_cliente": 1, "contactos": 1}))
    return analizar(ventas, clientes)


@router.post("/contactado")
def marcar_contactado(data: ClienteRef):
    res = db.clientes.update_one(_filtro_cliente(data.cliente), {"$set": {"ultimo_contacto": ahora()}, "$inc": {"contactos": 1}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cliente no registrado en el módulo de Clientes")
    return {"mensaje": "Contacto registrado"}


@router.post("/tipo")
def cambiar_tipo(data: TipoCliente):
    res = db.clientes.update_one(_filtro_cliente(data.cliente), {"$set": {"tipo_cliente": data.tipo}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cliente no registrado en el módulo de Clientes")
    return {"mensaje": "Tipo de cliente guardado"}


@router.post("/preferencia")
def cambiar_preferencia(data: Preferencia):
    res = db.clientes.update_one(_filtro_cliente(data.cliente), {"$set": {"acepta_mensajes": data.acepta}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cliente no registrado en el módulo de Clientes")
    return {"mensaje": "Preferencia guardada"}

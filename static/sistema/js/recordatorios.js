/* Plan de recontacto de clientes (solo administrador) */

let recordatoriosCache = [];

function escRec(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

async function cargarRecordatorios() {
    try {
        const res = await fetch('/api/recordatorios');
        recordatoriosCache = res.ok ? await res.json() : [];
    } catch (err) {
        console.error('Error cargando recontacto:', err);
        recordatoriosCache = [];
    }
    renderRecordatorios();
}

function renderRecordatorios() {
    const filtro = document.getElementById('rec-segmento').value;
    const ocultar = document.getElementById('rec-ocultar-recientes').checked;
    const lista = recordatoriosCache.filter(r => {
        if (!r.acepta_mensajes) return filtro === 'todos';
        if (ocultar && r.contactado_reciente) return false;
        if (filtro === 'todos') return true;
        if (filtro === 'accionables') return r.segmento !== 'Al día';
        return r.segmento === filtro;
    });
    const colores = { 'Atrasado': '#ff6b6b', 'Le toca pronto': '#f5a623', 'Dormido': '#9aa0a6', 'Al día': '#2ecc71' };

    renderTablaPaginada('tabla-recordatorios', lista, r => {
        const idx = recordatoriosCache.indexOf(r);
        const cuando = r.dias_para < 0 ? `hace ${-r.dias_para} d` : (r.dias_para === 0 ? 'hoy' : `en ${r.dias_para} d`);
        let accion;
        if (!r.acepta_mensajes) {
            accion = `<span style="opacity:.7;">No acepta mensajes</span>
                <button class="btn-gold" style="padding:4px 8px;width:auto;" onclick="cambiarPreferenciaRec(${idx}, true)">Reactivar</button>`;
        } else if (!r.celular) {
            accion = `<span style="opacity:.7;" title="Registra el celular en el módulo Clientes">Sin celular</span>`;
        } else {
            accion = `<a href="${escRec(r.whatsapp)}" target="_blank" rel="noopener" class="btn-gold" style="display:inline-block;padding:4px 8px;text-decoration:none;" onclick="marcarContactadoRec(${idx})" title="${escRec(r.mensaje)}">💬 WhatsApp</a>
                <button class="btn-danger" style="padding:4px 8px;width:auto;" title="El cliente pidió no recibir mensajes" onclick="cambiarPreferenciaRec(${idx}, false)">🚫</button>`;
        }
        const contactado = r.ultimo_contacto ? `<br><small style="opacity:.7;">Contactado ${escRec(r.ultimo_contacto)}</small>` : '';
        return `<tr>
            <td><strong>${escRec(r.cliente)}</strong>${contactado}</td>
            <td style="color:${colores[r.segmento] || '#fff'}; font-weight:bold;">${escRec(r.segmento)}</td>
            <td>${escRec(r.ultima_compra)}<br><small style="opacity:.7;">hace ${r.dias_desde} d</small></td>
            <td title="${escRec(r.base_ciclo)}">${r.ciclo_dias} d${r.compras < 2 ? ' *' : ''}</td>
            <td>${escRec(r.proxima)}<br><small style="opacity:.7;">${cuando}</small></td>
            <td>${escRec(r.producto)}</td>
            <td>${accion}</td>
        </tr>`;
    }, { pageSize: 15 });
}

async function marcarContactadoRec(idx) {
    const r = recordatoriosCache[idx];
    if (!r) return;
    try {
        await fetch('/api/recordatorios/contactado', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cliente: r.cliente })
        });
        r.contactado_reciente = true;
        r.ultimo_contacto = new Date().toISOString().slice(0, 10);
        setTimeout(renderRecordatorios, 400);
    } catch (err) {
        console.error('No se pudo registrar el contacto:', err);
    }
}

async function cambiarPreferenciaRec(idx, acepta) {
    const r = recordatoriosCache[idx];
    if (!r) return;
    if (!acepta && !confirm(`¿Marcar a ${r.cliente} como "no acepta mensajes"? No volverá a aparecer en el plan.`)) return;
    try {
        const res = await fetch('/api/recordatorios/preferencia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cliente: r.cliente, acepta })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            alert(err.detail || 'No se pudo guardar.');
            return;
        }
        r.acepta_mensajes = acepta;
        renderRecordatorios();
    } catch (err) {
        console.error('Error guardando preferencia:', err);
    }
}

/* Estado global, utilidades, tablas paginadas y navegación */

let carrito = [];
let carritoCotizacion = [];
let cotizacionesCache = [];
let pedidoEditandoId = null;
let productosCache = [];
let clientesCache = [];
let productosUnicos = [];
let otrosGastosCache = [];

let urlPdfActual = '';
let blobPdfActual = null;
let nombrePdfDescarga = 'Documento.pdf';
let origenModalCliente = 'venta';

let usuarioActual = '';
let rolActual = 'ventas';

// Todas las llamadas a la API pasan por aquí:
// - envían la cookie de sesión y la cabecera anti-CSRF que exige el servidor;
// - si el servidor dice 401 (sesión vencida, usuario borrado o sin permisos válidos), se vuelve al login.
const _fetchNativo = window.fetch.bind(window);
window.fetch = async (url, opciones = {}) => {
    const conf = {
        ...opciones,
        credentials: 'same-origin',
        headers: { ...(opciones.headers || {}), 'X-Requested-With': '0808' }
    };
    const res = await _fetchNativo(url, conf);
    const ruta = typeof url === 'string' ? url : (url && url.url) || '';
    if (res.status === 401 && ruta.startsWith('/api/') && ruta !== '/api/login') {
        mostrarLogin('Tu sesión terminó. Vuelve a iniciar sesión.');
    } else if (res.status === 403 && ruta.startsWith('/api/')) {
        res.clone().json().then(d => d && d.detail && console.warn(d.detail)).catch(() => {});
    }
    return res;
};

// Escapa texto antes de insertarlo como HTML
function esc(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fmtCOP(num) {
    const val = Math.round(num || 0);
    const formatted = Math.abs(val).toLocaleString('es-CO');
    return val < 0 ? `$-${formatted}` : `$${formatted}`;
}

const tableStates = {};

function setupTableToolbar(tableId, options = {}) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const tableResponsive = table.closest('.table-responsive');
    if (!tableResponsive) return;

    let toolbar = tableResponsive.previousElementSibling;
    if (!toolbar || !toolbar.classList.contains('table-toolbar')) {
        toolbar = document.createElement('div');
        toolbar.className = 'table-toolbar';
        
        const enableExcel = options.enableExcel || false;
        const excelName = options.excelFileName || `${tableId}.xlsx`;

        toolbar.innerHTML = `
            <div class="search-box">
                <input type="text" id="search-${tableId}" placeholder="🔍 Buscar en la tabla..." oninput="filtrarTablaState('${tableId}')">
            </div>
            <div class="table-toolbar-right">
                ${enableExcel ? `<button type="button" class="btn-excel" onclick="exportarTablaExcel('${tableId}', '${excelName}')">📊 Descargar Excel</button>` : ''}
                <div class="pagination-controls" id="pag-controls-${tableId}">
                    <button type="button" id="btn-prev-${tableId}" onclick="cambiarPaginaTabla('${tableId}', -1)">◀ Ant.</button>
                    <span class="pagination-info" id="pag-info-${tableId}">Pág. 1 de 1</span>
                    <button type="button" id="btn-next-${tableId}" onclick="cambiarPaginaTabla('${tableId}', 1)">Sig. ▶</button>
                </div>
            </div>
        `;
        tableResponsive.parentNode.insertBefore(toolbar, tableResponsive);
    }
}

function renderTablaPaginada(tableId, dataArray, renderRowFn, options = {}) {
    setupTableToolbar(tableId, options);

    const safeData = Array.isArray(dataArray) ? dataArray : [];

    if (!tableStates[tableId]) {
        tableStates[tableId] = { page: 1, search: '', data: safeData, renderFn: renderRowFn, options: options };
    } else {
        tableStates[tableId].data = safeData;
        tableStates[tableId].renderFn = renderRowFn;
        tableStates[tableId].options = options;
    }

    actualizarRenderTabla(tableId);
}

function filtrarTablaState(tableId) {
    const input = document.getElementById(`search-${tableId}`);
    if (!input || !tableStates[tableId]) return;
    tableStates[tableId].search = input.value.trim().toLowerCase();
    tableStates[tableId].page = 1;
    actualizarRenderTabla(tableId);
}

function cambiarPaginaTabla(tableId, delta) {
    if (!tableStates[tableId]) return;
    tableStates[tableId].page += delta;
    actualizarRenderTabla(tableId);
}

function actualizarRenderTabla(tableId) {
    const st = tableStates[tableId];
    if (!st) return;

    let filtered = Array.isArray(st.data) ? st.data : [];
    if (st.search) {
        filtered = filtered.filter(item => {
            return Object.values(item || {}).some(val => 
                val !== null && val !== undefined && String(val).toLowerCase().includes(st.search)
            );
        });
    }

    if (typeof st.options?.onFilter === 'function') {
        st.options.onFilter(filtered);
    }

    const pageSize = st.options?.pageSize || 10;
    const totalPages = Math.ceil(filtered.length / pageSize) || 1;
    
    if (st.page > totalPages) st.page = totalPages;
    if (st.page < 1) st.page = 1;

    const start = (st.page - 1) * pageSize;
    const pageData = filtered.slice(start, start + pageSize);

    const tbody = document.querySelector(`#${tableId} tbody`);
    if (tbody) {
        if (pageData.length === 0) {
            const colCount = document.querySelectorAll(`#${tableId} thead th`).length || 1;
            tbody.innerHTML = `<tr><td colspan="${colCount}" style="text-align:center; color:#aaa;">No se encontraron registros</td></tr>`;
        } else {
            tbody.innerHTML = pageData.map((item, idx) => st.renderFn(item, start + idx)).join('');
        }
    }

    const btnPrev = document.getElementById(`btn-prev-${tableId}`);
    const btnNext = document.getElementById(`btn-next-${tableId}`);
    const pagInfo = document.getElementById(`pag-info-${tableId}`);

    if (btnPrev) btnPrev.disabled = (st.page <= 1);
    if (btnNext) btnNext.disabled = (st.page >= totalPages);
    if (pagInfo) pagInfo.innerText = `Pág. ${st.page} de ${totalPages} (${filtered.length} reg.)`;
}

// Carga SheetJS bajo demanda si el <script defer> del HTML no llegó a cargar (red lenta, bloqueador, caché)
function cargarSheetJS() {
    if (window.XLSX) return Promise.resolve(true);
    return new Promise(resolve => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        s.onload = () => resolve(!!window.XLSX);
        s.onerror = () => resolve(false);
        document.head.appendChild(s);
    });
}

function descargarBlob(blob, nombre) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
}

async function exportarTablaExcel(tableId, filename) {
    try {
        const table = document.getElementById(tableId);
        if (!table) return;
        const st = tableStates[tableId];

        // Copia de la tabla con TODOS los registros filtrados (no solo la página visible)
        const clone = table.cloneNode(false);
        clone.removeAttribute('id');
        clone.appendChild(table.querySelector('thead').cloneNode(true));
        const tbody = document.createElement('tbody');
        if (st && Array.isArray(st.data)) {
            let filas = st.data;
            if (st.search) {
                filas = filas.filter(item => Object.values(item || {}).some(val =>
                    val !== null && val !== undefined && String(val).toLowerCase().includes(st.search)));
            }
            tbody.innerHTML = filas.map((item, idx) => st.renderFn(item, idx)).join('');
        } else {
            tbody.innerHTML = table.querySelector('tbody').innerHTML;
        }
        clone.appendChild(tbody);

        // Se quitan columnas de acción / vista previa
        const quitar = [];
        clone.querySelectorAll('thead th').forEach((th, idx) => {
            const txt = th.textContent.trim().toLowerCase();
            if (txt.includes('acción') || txt.includes('accion') || txt.includes('vista previa')) quitar.push(idx);
        });
        quitar.reverse().forEach(i => clone.querySelectorAll('tr').forEach(row => {
            if (row.children[i]) row.children[i].remove();
        }));

        const nombre = filename || 'Reporte_0808.xlsx';
        if (await cargarSheetJS()) {
            const wb = XLSX.utils.table_to_book(clone, { sheet: 'Reporte' });
            XLSX.writeFile(wb, nombre);
            return;
        }

        // Respaldo sin librerías: CSV que Excel abre directamente
        const csv = [...clone.querySelectorAll('tr')].map(tr =>
            [...tr.children].map(c => '"' + c.textContent.trim().replace(/\s+/g, ' ').replace(/"/g, '""') + '"').join(';')
        ).join('\r\n');
        descargarBlob(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }), nombre.replace(/\.xlsx$/i, '') + '.csv');
        alert('No se pudo cargar la librería de Excel; se descargó un archivo CSV que Excel puede abrir.');
    } catch (err) {
        console.error('Error exportando a Excel:', err);
        alert('No se pudo generar el archivo: ' + (err && err.message ? err.message : err));
    }
}

function ordenarProductosArray(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.sort((a, b) => {
        const cmpNombre = (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' });
        if (cmpNombre !== 0) return cmpNombre;
        return (a.gramaje || 0) - (b.gramaje || 0);
    });
}

function toggleSidebar() {
    document.getElementById('main-sidebar').classList.toggle('mobile-open');
}

function showSection(id, evt) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-button').forEach(b => b.classList.remove('active'));
    
    const targetSec = document.getElementById(id);
    if(targetSec) targetSec.classList.add('active');

    if (evt && evt.target) {
        evt.target.classList.add('active');
    } else {
        const btnNav = document.querySelector(`.nav-button[onclick*="${id}"]`);
        if(btnNav) btnNav.classList.add('active');
    }

    if (window.innerWidth <= 768) {
        document.getElementById('main-sidebar').classList.remove('mobile-open');
    }

    // Al cambiar de módulo, volver al inicio de la página
    window.scrollTo(0, 0);
    const contenedorContenido = document.querySelector('.content');
    if (contenedorContenido) contenedorContenido.scrollTop = 0;

    if(id === 'ventas') cargarVentasData();
    if(id === 'pedidos-sec') cargarCotizacionesData();
    if(id === 'clientes') cargarClientes();
    if(id === 'recordatorios-sec') cargarRecordatorios();
    if(id === 'gastos-sec') cargarModuloGastos();
    if(id === 'parciales-sec') cargarVentasParciales();
    if(id === 'compras') cargarModuloCompras();
    if(id === 'empaques') cargarModuloEmpaques();
    if(id === 'inventario') {
        cargarProductos();
        cargarOpcionesDescuento();
        cargarHistorialAjustes();
    }
    if(id === 'creditos') cargarCreditos();
    if(id === 'reportes') cargarReportes();
    if(id === 'usuarios-sec') cargarUsuarios();
}

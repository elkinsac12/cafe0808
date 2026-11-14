/* Fichas de producto con forma de etiqueta: el cliente marca molienda y tostión
   en los mismos círculos que trae la etiqueta impresa. */
import { PRODUCTOS, TAMANOS, TAMANO_INICIAL, MOLIENDAS, TOSTIONES, TOSTION_FIJA, MAX_POR_LINEA } from "./config.js";
import { $, $$, esc, img, moneda } from "./util.js";
import { t } from "./i18n.js";
import { precioDe } from "./precios.js";
import { agregar } from "./carrito.js";

const circulos = (grupo, lista, marcado, id, dosCol) => `
  <fieldset class="circulos${dosCol ? " dos-col" : ""}">
    <legend data-i18n>${grupo === "molienda" ? "Molienda" : "Tostión"}</legend>
    ${lista.map(v => {
      const bloqueado = grupo === "tostion" && v !== TOSTION_FIJA;   // tostión fija: solo Medio
      return `<label class="circulo${bloqueado ? " bloqueado" : ""}"><input type="radio" name="${grupo}-${id}" value="${esc(v)}"${v === marcado ? " checked" : ""}${bloqueado ? " disabled" : ""}><i></i><span data-i18n>${esc(v)}</span></label>`;
    }).join("")}
  </fieldset>`;

function ficha(p) {
  const nombreCompleto = p.subtitulo ? `${p.nombre} ${p.subtitulo}` : p.nombre;
  return `<article class="ficha" data-id="${p.id}" aria-labelledby="t-${p.id}">
    <figure class="ficha-foto" tabindex="0" role="button" aria-label="${esc(t("Ampliar foto de {n}", { n: nombreCompleto }))}" data-zoom="${p.id}">
      <picture>
        <source srcset="${img(p.img, { sm: true })} 448w, ${img(p.img)} 896w" sizes="(max-width: 860px) 90vw, 42vw" type="image/webp">
        <img src="/assets/img/${p.img}.jpg" alt="${esc(t("Bolsa negra de café 0808 {n} con etiqueta dorada", { n: nombreCompleto }))}" width="896" height="1195" loading="lazy" decoding="async">
      </picture>
      <span class="lupa" data-i18n>Ver etiqueta</span>
    </figure>

    <div class="etiqueta">
      <div class="et-fila et-top">
        <div class="et-campo"><small data-i18n>Origen</small><b data-i18n>${esc(p.origen)}</b></div>
        <div class="et-campo"><small data-i18n>Proceso</small><b data-i18n>${esc(p.proceso)}</b><span data-i18n>${esc(p.acidez)}</span></div>
      </div>
      <div class="et-variedad">
        <div class="et-campo"><small data-i18n>Variedad</small></div>
        <h3 id="t-${p.id}">${esc(p.nombre)}</h3>
        ${p.subtitulo ? `<p data-i18n>${esc(p.subtitulo)}</p>` : ""}
      </div>
      <div class="et-fila et-detalle">
        <div>${circulos("molienda", MOLIENDAS, "Grano", p.id, true)}</div>
        <div class="et-campo"><small data-i18n>Aroma</small><span data-i18n>${esc(p.aroma)}</span><small class="mt" data-i18n>Sabor</small><span data-i18n>${esc(p.sabor)}</span></div>
        <div class="et-campo"><small data-i18n>msnm</small><b class="et-msnm" data-i18n>${p.msnm.toLocaleString("es-CO")}</b></div>
        <div>${circulos("tostion", TOSTIONES, TOSTION_FIJA, p.id, false)}</div>
      </div>
      <div class="et-pie">
        <div class="tamanos" role="radiogroup" aria-label="Tamaño de bolsa" data-i18n-attr="aria-label">
          ${TAMANOS.map(t => `<label><input type="radio" name="tamano-${p.id}" value="${t}"${t === TAMANO_INICIAL ? " checked" : ""}><span>${t}g</span></label>`).join("")}
        </div>
        <div class="precio" aria-live="polite"><strong data-precio>${moneda(precioDe(p.id, TAMANO_INICIAL))}</strong><small data-por>${t("bolsa de {t}g", { t: TAMANO_INICIAL })}</small></div>
        <div class="et-acciones">
          <div class="paso" role="group" aria-label="Cantidad" data-i18n-attr="aria-label">
            <button type="button" data-d="-1" aria-label="Una menos" data-i18n-attr="aria-label">−</button>
            <output data-cant>1</output>
            <button type="button" data-d="1" aria-label="Una más" data-i18n-attr="aria-label">+</button>
          </div>
          <button type="button" class="btn btn-tinta" data-agregar data-i18n>Agregar al pedido</button>
        </div>
      </div>
    </div>
  </article>`;
}

const valor = (art, nombre) => $(`input[name="${nombre}-${art.dataset.id}"]:checked`, art)?.value;

export function actualizarPreciosFichas() {
  $$(".ficha").forEach(art => {
    const tam = Number(valor(art, "tamano"));
    const precio = precioDe(art.dataset.id, tam);
    $("[data-precio]", art).textContent = precio > 0 ? moneda(precio) : t("Consultar");
    $("[data-por]", art).textContent = t("bolsa de {t}g", { t: tam });
  });
}

function traducirAtributosFichas() {
  $$(".ficha").forEach(art => {
    const p = PRODUCTOS.find(x => x.id === art.dataset.id);
    if (!p) return;
    const nombre = p.subtitulo ? `${p.nombre} ${p.subtitulo}` : p.nombre;
    $(".ficha-foto", art).setAttribute("aria-label", t("Ampliar foto de {n}", { n: nombre }));
    $(".ficha-foto img", art).alt = t("Bolsa negra de café 0808 {n} con etiqueta dorada", { n: nombre });
  });
}

export function iniciarFichas() {
  const cont = $("#fichas");
  cont.innerHTML = PRODUCTOS.map(ficha).join("");
  document.addEventListener("idioma", traducirAtributosFichas);

  cont.addEventListener("change", e => {
    if (e.target.name?.startsWith("tamano-")) actualizarPreciosFichas();
  });

  cont.addEventListener("click", e => {
    // Cada clic se procesa una sola vez, aunque este manejador quede registrado dos veces
    if (e.__fichaProcesado) return;
    const art = e.target.closest(".ficha");
    if (!art) return;
    e.__fichaProcesado = true;
    const out = $("[data-cant]", art);
    const paso = e.target.closest("[data-d]");
    if (paso) {
      out.textContent = Math.max(1, Math.min(MAX_POR_LINEA, Number(out.textContent) + Number(paso.dataset.d)));
      return;
    }
    if (e.target.closest("[data-agregar]")) {
      agregar({
        id: art.dataset.id,
        tamano: Number(valor(art, "tamano")),
        molienda: valor(art, "molienda"),
        tostion: TOSTION_FIJA,
        cant: Number(out.textContent)
      });
      out.textContent = "1";
    }
  });

  // Foto ampliada
  const modal = $("#modal");
  let foco = null;
  const abrirFoto = id => {
    const p = PRODUCTOS.find(x => x.id === id);
    foco = document.activeElement;
    $("#modalImg").src = `/assets/img/${p.img}.webp`;
    $("#modalImg").alt = t("Etiqueta de {n}", { n: p.nombre });
    modal.classList.add("abierto");
    $("#modalCerrar").focus();
  };
  const cerrarFoto = () => { modal.classList.remove("abierto"); foco?.focus(); };
  cont.addEventListener("click", e => { const z = e.target.closest("[data-zoom]"); if (z) abrirFoto(z.dataset.zoom); });
  cont.addEventListener("keydown", e => {
    if ((e.key === "Enter" || e.key === " ") && e.target.dataset.zoom) { e.preventDefault(); abrirFoto(e.target.dataset.zoom); }
  });
  modal.addEventListener("click", e => { if (e.target === modal || e.target.closest("#modalCerrar")) cerrarFoto(); });
  addEventListener("keydown", e => { if (e.key === "Escape" && modal.classList.contains("abierto")) cerrarFoto(); });

  // Las fichas aparecen al llegar a ellas
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); }
  }), { threshold: .12 });
  $$(".ficha").forEach(f => io.observe(f));
}

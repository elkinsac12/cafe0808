/* Arranque de la landing */
import { INSTAGRAM, TIKTOK } from "./config.js";
import { $, $$, moneda } from "./util.js";
import { precioMinimo, sincronizarPrecios } from "./precios.js";
import { iniciarCarrito, pintar as pintarCarrito } from "./carrito.js";
import { iniciarFichas, actualizarPreciosFichas } from "./fichas.js";
import { iniciarExtras } from "./extras.js";

document.documentElement.classList.add("js");

function iniciarBarra() {
  const barra = $("#barra"), nav = $("#nav"), btn = $("#menuBtn");
  const alHacerScroll = () => barra.classList.toggle("solida", scrollY > 30);
  addEventListener("scroll", alHacerScroll, { passive: true });
  alHacerScroll();
  const cerrarMenu = () => { nav.classList.remove("abierta"); btn.setAttribute("aria-expanded", "false"); };
  btn.addEventListener("click", () => btn.setAttribute("aria-expanded", nav.classList.toggle("abierta")));
  $$("a", nav).forEach(a => a.addEventListener("click", cerrarMenu));
}

function iniciarEnlaces() {
  // Asignamos de forma segura solo a los elementos que sí existen en el HTML
  const lnkInsta = $("#lnkInstagram");
  if (lnkInsta) lnkInsta.href = INSTAGRAM;
  const pieInsta = $("#pieInstagram");
  if (pieInsta) pieInsta.href = INSTAGRAM;

  const lnkTik = $("#lnkTiktok");
  if (lnkTik) lnkTik.href = TIKTOK;
  const pieTik = $("#pieTiktok");
  if (pieTik) pieTik.href = TIKTOK;

  const anioEl = $("#anio");
  if (anioEl) anioEl.textContent = new Date().getFullYear();
  
  const textoCinta = "Envíos gratis en compras superiores a $150 mil pesos";
  const itemsHTML = Array(8).fill(`<span>${textoCinta}</span>`).join("");
  const cintaEl = $("#cinta");
  if (cintaEl) cintaEl.innerHTML = itemsHTML;
}

function pintarPrecios() {
  const min = precioMinimo();
  const el = $("#precioDesde");
  if (el && min > 0) {
    el.textContent = moneda(min);
  }
  actualizarPreciosFichas();
  pintarCarrito();
}

iniciarBarra();
iniciarEnlaces();
iniciarFichas();
iniciarCarrito();
iniciarExtras();
pintarPrecios();

// Sincroniza con el backend y actualiza los precios al terminar
sincronizarPrecios().then(() => {
  pintarPrecios();
});
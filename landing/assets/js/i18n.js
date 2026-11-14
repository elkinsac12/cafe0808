/* Idioma de la landing (ESP / EN).
   El texto en español del propio código es la "clave": si el idioma es inglés y la frase está
   en el diccionario EN, se muestra la traducción; si no, se deja tal cual (nombres propios, números).
   Para agregar o corregir una traducción solo hay que editar el diccionario EN de este archivo. */

const CLAVE_IDIOMA = "idioma_0808";

export const EN = {
  /* ---- Barra y navegación ---- */
  "0808 Café, ir al inicio": "0808 Café, go to top",
  "Cafés y precios": "Coffees & prices",
  "Tu café ideal": "Your ideal coffee",
  "Molienda": "Grind",
  "Nosotros": "About us",
  "Contacto": "Contact",
  "Tu pedido": "Your order",
  "productos en el pedido": "items in the order",
  "Abrir menú": "Open menu",
  "Cambiar idioma": "Change language",

  /* ---- Hero ---- */
  "Café de altura, tostado con calma": "High-altitude coffee, roasted with care",
  "Orígenes de Antioquia y Huila, cultivados entre 1.950 y 2.090 metros. Escoge entre grano y molido, y te lo hacemos llegar.":
    "Origins from Antioquia and Huila, grown between 1,950 and 2,090 meters. Choose whole bean or ground, and we'll deliver it to you.",
  "Bolsas desde": "Bags from",
  "Ver cafés y precios": "See coffees & prices",
  "Encuentra el tuyo": "Find yours",
  "Envíos gratis en compras superiores a $150 mil pesos": "Free shipping on purchases over COP $150,000",

  /* ---- Cafés ---- */
  "Tres variedades.": "Three varieties.",
  "Marca en la etiqueta cómo lo quieres, elige el tamaño y agrégalo a tu pedido. Al final lo envías por WhatsApp y coordinamos pago y envío.":
    "Mark on the label how you want it, pick a size and add it to your order. At the end you send it via WhatsApp and we arrange payment and shipping.",
  "Ver etiqueta": "View label",
  "Origen": "Origin",
  "Proceso": "Process",
  "Variedad": "Variety",
  "Tostión": "Roast",
  "Aroma": "Aroma",
  "Sabor": "Flavor",
  "msnm": "masl",
  "1.950": "1,950",
  "2.090": "2,090",
  "Tamaño de bolsa": "Bag size",
  "Cantidad": "Quantity",
  "Una menos": "One less",
  "Una más": "One more",
  "Agregar al pedido": "Add to order",
  "Grano": "Beans",
  "Media": "Medium",
  "Fina": "Fine",
  "Gruesa": "Coarse",
  "Claro": "Light",
  "Medio": "Medium",
  "Lavado": "Washed",
  "Acidez baja": "Low acidity",
  "Acidez media": "Medium acidity",
  "Dulce, panela": "Sweet, panela",
  "Frutal, caramelo": "Fruity, caramel",
  "Caramelo dulce": "Sweet caramel",
  "Floral, lima": "Floral, lime",
  "Dulce, miel": "Sweet, honey",
  "Ampliar foto de {n}": "Enlarge photo of {n}",
  "Bolsa negra de café 0808 {n} con etiqueta dorada": "Black 0808 Café bag of {n} with gold label",
  "Etiqueta de {n}": "{n} label",
  "Foto de la bolsa": "Bag photo",
  "Cerrar foto": "Close photo",
  "bolsa de {t}g": "{t}g bag",
  "Consultar": "Ask for price",

  /* ---- Variedades bajo pedido ---- */
  "Bajo pedido · Lotes limitados": "Made to order · Limited lots",
  "Variedades exóticas": "Exotic varieties",
  "Varietal exótico": "Exotic varietals",
  "Además de nuestras tres variedades, trabajamos lotes especiales bajo pedido. Cuéntanos cuál te interesa y te confirmamos disponibilidad, precio y tiempo de entrega.":
    "Besides our three varieties, we work with special lots made to order. Tell us which one interests you and we'll confirm availability, price and delivery time.",
  "Bajo pedido": "Made to order",
  "Floral · Jazmín · Bergamota": "Floral · Jasmine · Bergamot",
  "Cítrico · Grosella negra · Jugoso": "Citrus · Blackcurrant · Juicy",
  "Tropical · Frutal · Aromático": "Tropical · Fruity · Aromatic",
  "Una variedad rara y muy aromática. Taza elegante, de cuerpo ligero, con notas florales y de té.":
    "A rare and highly aromatic variety. An elegant, light-bodied cup with floral and tea-like notes.",
  "De acidez brillante y vibrante, con frutos rojos y una taza compleja y muy limpia.":
    "Bright, vibrant acidity with red fruit and a complex, very clean cup.",
  "Exótico y dulce, con un perfil frutal poco común. Una taza pensada para sorprender.":
    "Exotic and sweet, with an uncommon fruity profile. A cup made to surprise.",
  "Consultar por WhatsApp": "Ask on WhatsApp",
  "Nos escribes por WhatsApp y nos cuentas qué variedad te interesa.": "You message us on WhatsApp and tell us which variety interests you.",
  "Confirmamos disponibilidad del lote, precio y tiempo de entrega.": "We confirm lot availability, price and delivery time.",
  "Tostamos tu pedido y lo enviamos a donde estés.": "We roast your order and ship it wherever you are.",
  "Hola 0808 Café ☕ Quiero consultar la disponibilidad de {n} (bajo pedido).":
    "Hello 0808 Café ☕ I'd like to ask about the availability of {n} (made to order).",

  /* ---- Altura ---- */
  "Más altura, más dulzor": "More altitude, more sweetness",
  "En la montaña el grano madura despacio y concentra azúcares. Así se ven nuestros orígenes sobre el nivel del mar.":
    "Up in the mountains the bean ripens slowly and concentrates sugars. This is how our origins look above sea level.",
  "Altitud de los orígenes: Gigante, Huila, 1.950 msnm; Urrao, Antioquia, 2.090 msnm; Ciudad Bolívar, Antioquia, 1.950 msnm":
    "Altitude of the origins: Gigante, Huila, 1,950 masl; Urrao, Antioquia, 2,090 masl; Ciudad Bolívar, Antioquia, 1,950 masl",

  /* ---- Test ---- */
  "¿Cuál café es para ti?": "Which coffee is right for you?",
  "Tres preguntas sobre cómo tomas el café y te decimos cuál pedir.":
    "Three questions about how you drink your coffee, and we'll tell you which one to order.",
  "¿Cómo tomas tu café normalmente?": "How do you usually drink your coffee?",
  "Con azúcar o panela": "With sugar or panela",
  "Filtrado": "Filtered",
  "Leche": "Milk",
  "¿Qué sabor te provoca más?": "Which flavor appeals to you most?",
  "Chocolate y panela": "Chocolate and panela",
  "Frutas y caramelo": "Fruit and caramel",
  "Flores, cítricos y miel": "Flowers, citrus and honey",
  "¿Qué tanta acidez te gusta?": "How much acidity do you like?",
  "Muy poca, suave y redondo": "Very little, smooth and round",
  "Equilibrada": "Balanced",
  "Viva y fresca": "Bright and fresh",
  "Dulce y frutal, con acidez baja. El proceso honey le da cuerpo suave y notas de caramelo.":
    "Sweet and fruity, with low acidity. The honey process gives it a soft body and caramel notes.",
  "Redondo y achocolatado, con acidez media. Sirve para todos los días y va muy bien con leche.":
    "Round and chocolatey, with medium acidity. Great for every day and works very well with milk.",
  "Floral, con lima y miel. El de mayor altura de los tres, con una acidez viva y limpia.":
    "Floral, with lime and honey. The highest-grown of the three, with a bright, clean acidity.",
  "Pregunta {a} de {b}": "Question {a} of {b}",
  "Tu café es": "Your coffee is",
  "Agregar {t}g al pedido": "Add {t}g to order",
  "Repetir": "Retake",
  "Bolsa de {n}": "{n} bag",

  /* ---- Molienda ---- */
  "¿Cómo lo preparas?": "How do you brew it?",
  "Escoge tu método y te decimos qué molienda marcar en la etiqueta.":
    "Pick your method and we'll tell you which grind to mark on the label.",
  "Métodos de preparación": "Brewing methods",
  "Prensa francesa": "French press",
  "Cafetera de goteo": "Drip coffee maker",
  "Moka / greca": "Moka pot",
  "4 minutos de infusión": "4-minute steep",
  "2 a 3 minutos": "2 to 3 minutes",
  "5 a 6 minutos": "5 to 6 minutes",
  "4 a 5 minutos": "4 to 5 minutes",
  "25 a 30 segundos": "25 to 30 seconds",
  "Molienda gruesa": "Coarse grind",
  "Molienda media": "Medium grind",
  "Molienda fina": "Fine grind",
  "Cuerpo pleno y textura aceitosa. Una molienda gruesa evita que quede turbio y amargo.":
    "Full body and an oily texture. A coarse grind keeps it from turning cloudy and bitter.",
  "Resalta las notas florales y frutales. Ideal para el Chiroso y el Bourbon Rosado.":
    "Brings out the floral and fruity notes. Ideal for the Chiroso and the Bourbon Rosado.",
  "Práctica para varias tazas. Una molienda media da un café equilibrado.":
    "Convenient for several cups. A medium grind gives a balanced coffee.",
  "Intenso y concentrado. Fina, pero sin llegar a polvo, para que no se amargue.":
    "Intense and concentrated. Fine, but not powdery, so it doesn't turn bitter.",
  "Pide molienda fina y ajusta según tu máquina. El Blend se lleva muy bien con leche.":
    "Ask for a fine grind and adjust to your machine. The Blend pairs very well with milk.",

  /* ---- Nosotros ---- */
  "Fundadores de 0808 Café de Especialidad": "Founders of 0808 Specialty Coffee",
  "Acerca de Nosotros": "About Us",
  "En 0808 Café de Especialidad, nuestra pasión por el café nació en el calor del hogar en Barranquilla, donde el aroma mañanero definió nuestras memorias. En 2022, al instalarnos en Medellín, nos adentramos en el universo del café de especialidad; una fascinación constante que nos llevó a explorar perfiles de todas las regiones de Colombia y, finalmente, a dar el paso como fundadores.":
    "At 0808 Specialty Coffee, our passion for coffee was born in the warmth of our home in Barranquilla, where the morning aroma shaped our memories. In 2022, when we settled in Medellín, we dove into the world of specialty coffee; a constant fascination that led us to explore profiles from every region of Colombia and, finally, to take the step of becoming founders.",
  "Sin necesidad de poseer una finca propia, asumimos con orgullo nuestro rol como curadores: recorremos las montañas colombianas en alianza directa con productores locales, evaluamos minuciosamente cada lote y seleccionamos únicamente granos con atributos excepcionales. Desarrollamos tuestes en pequeñas tandas para garantizar máxima frescura, tanto en hogares como en cafeterías aliadas.":
    "Without needing to own a farm, we proudly take on our role as curators: we travel through the Colombian mountains in direct partnership with local producers, carefully evaluate each lot and select only beans with exceptional attributes. We roast in small batches to guarantee maximum freshness, for both homes and partner coffee shops.",
  "El nombre 0808 rinde homenaje al 8 de agosto, fecha de nacimiento de nuestra hija, y al símbolo de la abundancia. Representa nuestro compromiso fundamental: asegurar que en cada mesa abunde un café extraordinario y las razones para compartirlo.":
    "The name 0808 pays tribute to August 8th, our daughter's birthday, and to the symbol of abundance. It represents our fundamental commitment: making sure every table has an extraordinary coffee in abundance, along with reasons to share it.",
  "Actualmente operamos con presencia estratégica en el Valle de Aburrá y Barranquilla, con alcance y envíos a todo el territorio nacional y la proyección de llevar el café de especialidad Colombiano a mercados internacionales.":
    "We currently operate with a strategic presence in the Aburrá Valley and Barranquilla, with reach and shipping across the entire country and the aim of bringing Colombian specialty coffee to international markets.",
  "Lidia Sajonero & Elkin Sierra Fundadores, 0808 Café de Especialidad":
    "Lidia Sajonero & Elkin Sierra, Founders, 0808 Specialty Coffee",
  "orígenes": "origins",
  "metros, el más alto": "meters, the highest",
  "colombiano": "Colombian",

  /* ---- Contacto y pie ---- */
  "¿Dudas antes de pedir?": "Questions before ordering?",
  "Escríbenos y te ayudamos a elegir.": "Write to us and we'll help you choose.",
  "0808 Café de Especialidad. Hecho en Colombia.": "0808 Specialty Coffee. Made in Colombia.",

  /* ---- Pedido (carrito) ---- */
  "Cerrar pedido": "Close order",
  "Total": "Total",
  "El envío se cotiza por WhatsApp según tu ciudad.": "Shipping is quoted via WhatsApp based on your city.",
  "Enviar pedido por WhatsApp": "Send order via WhatsApp",
  "Vaciar pedido": "Clear order",
  "Tu pedido está vacío. Elige un café, marca molienda y tostión, y agrégalo.":
    "Your order is empty. Choose a coffee, mark the grind and roast, and add it.",
  "Ver cafés": "See coffees",
  "Tamaño": "Size",
  "Tamaño de {n}": "Size of {n}",
  "Molienda de {n}": "Grind of {n}",
  "Tostión de {n}": "Roast of {n}",
  "Cantidad de {n}": "Quantity of {n}",
  "Quitar una": "Remove one",
  "Agregar una": "Add one",
  "Quitar": "Remove",
  "Tu nombre (opcional)": "Your name (optional)",
  "Ciudad o barrio (opcional)": "City or neighborhood (optional)",
  "Ver tu pedido ({n})": "View your order ({n})",
  "Escribir por WhatsApp": "Message us on WhatsApp",
  "{n} {t}g agregado": "{n} {t}g added",
  "Ver pedido": "View order",
  "Quitaste {n}": "You removed {n}",
  "Deshacer": "Undo",
  "Vaciaste el pedido": "You cleared the order",

  /* ---- Mensajes de WhatsApp ---- */
  "Hola 0808 Café ☕ Quiero conocer más sobre sus cafés de especialidad.":
    "Hello 0808 Café ☕ I'd like to learn more about your specialty coffees.",
  "Hola 0808 Café ☕ Quiero hacer este pedido:": "Hello 0808 Café ☕ I'd like to place this order:",
  "Hola 0808 Café ☕ Tengo una pregunta sobre sus cafés.": "Hello 0808 Café ☕ I have a question about your coffees.",
  "Total: {x} (sin envío)": "Total: {x} (shipping not included)",
  "Nombre": "Name",
  "Ciudad / barrio": "City / neighborhood",
  "¿Cómo coordinamos el pago y el envío?": "How do we arrange payment and shipping?",

  /* ---- Título de la pestaña ---- */
  "0808 Café de Especialidad · Café de origen colombiano": "0808 Specialty Coffee · Colombian single-origin coffee"
};

const norm = s => String(s ?? "").replace(/\s+/g, " ").trim();

let actual = "es";
try {
  const guardado = localStorage.getItem(CLAVE_IDIOMA);
  if (guardado === "es" || guardado === "en") actual = guardado;
} catch (_) { /* sin almacenamiento: queda en español */ }

export const idioma = () => actual;
export const locale = () => (actual === "en" ? "en-US" : "es-CO");

/** Traduce una frase en español. Las variables van entre llaves: t("Hola {n}", { n: "Ana" }). */
export function t(clave, vars) {
  let s = actual === "en" ? (EN[clave] ?? clave) : clave;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  return s;
}

/* Los textos fijos del HTML se marcan con data-i18n (texto) o data-i18n-attr="aria-label,alt" (atributos).
   El español original se guarda la primera vez para poder volver a él. */
const originales = new WeakMap();
const tituloES = document.title;

export function traducirPagina(raiz = document) {
  raiz.querySelectorAll("[data-i18n]").forEach(el => {
    let o = originales.get(el);
    if (!o) { o = { txt: norm(el.textContent), attrs: {} }; originales.set(el, o); }
    el.textContent = t(o.txt);
  });
  raiz.querySelectorAll("[data-i18n-attr]").forEach(el => {
    let o = originales.get(el);
    if (!o) { o = { txt: null, attrs: {} }; originales.set(el, o); }
    el.dataset.i18nAttr.split(",").map(a => a.trim()).filter(Boolean).forEach(a => {
      if (!(a in o.attrs)) o.attrs[a] = norm(el.getAttribute(a));
      el.setAttribute(a, t(o.attrs[a]));
    });
  });
}

function aplicar() {
  document.documentElement.lang = actual;
  document.title = t(norm(tituloES));
  traducirPagina();
  document.querySelectorAll("#btnIdioma [data-l]").forEach(s => s.classList.toggle("on", s.dataset.l === actual));
  document.getElementById("btnIdioma")?.setAttribute("aria-pressed", String(actual === "en"));
  // Los bloques que se dibujan con JavaScript (pedido, test, molienda, precios) se vuelven a pintar
  document.dispatchEvent(new CustomEvent("idioma", { detail: actual }));
}

export function setIdioma(nuevo) {
  if (nuevo !== "es" && nuevo !== "en") return;
  actual = nuevo;
  try { localStorage.setItem(CLAVE_IDIOMA, nuevo); } catch (_) { /* sin almacenamiento */ }
  aplicar();
}

export function iniciarIdioma() {
  document.getElementById("btnIdioma")?.addEventListener("click", () => setIdioma(actual === "es" ? "en" : "es"));
  aplicar();
}
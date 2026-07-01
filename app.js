/* =============================================================
   EL PAPI BARBERÍA — app.js
   Aquí vive toda la lógica: productos, carrito, formulario y
   el botón de WhatsApp. Está dividido en bloques comentados
   para que puedas ir siguiendo el hilo mientras aprendes.
   ============================================================= */

/* -------------------------------------------------------------
   BLOQUE 0: CONFIGURACIÓN — edita solo estas líneas
   ------------------------------------------------------------- */
const CONFIG = {
  // Número de WhatsApp de la barbería, en formato internacional
  // SIN signos ni espacios: 52 (México) + 10 dígitos.
  whatsappNumber: "417 100 5878", // <-- CAMBIA ESTO por tu número real

  // Datos de EmailJS (los obtienes en https://www.emailjs.com).
  // Explico paso a paso cómo conseguirlos en el mensaje de chat.
  emailJs: {
    publicKey: "uzaXFp26o47JCuzU7",
    serviceId: "service_1ltlm0u",
    templateId: "template_rrxivek",
  },
};

/* -------------------------------------------------------------
   BLOQUE 1: DATOS DEL CATÁLOGO
   Cada producto es un objeto. Para agregar un producto nuevo,
   copia un bloque {} y cambia sus valores — el resto de la
   página (tarjetas, carrito, WhatsApp) se actualiza solo.
   ------------------------------------------------------------- */
const products = [
  {
    id: "cera-mate",
    name: "Cera Mate El Papi",
    category: "Cera para cabello",
    price: 180,
    description: "Fijación fuerte, acabado mate sin brillo. Ideal para peinados con textura.",
    image: "https://placehold.co/400x400/2a1e16/d9ab52?text=Cera+Mate",
  },
  {
    id: "cera-gel",
    name: "Cera Gel El Papi",
    category: "Cera gel para cabello",
    price: 190,
    description: "Combina la fijación de la cera con el brillo del gel. Look definido todo el día.",
    image: "https://placehold.co/400x400/2a1e16/d9ab52?text=Cera+Gel",
  },
  {
    id: "minoxidil",
    name: "Minoxidil El Papi 5%",
    category: "Tratamiento capilar",
    price: 320,
    description: "Frasco de 60ml. Tratamiento tópico para estimular el crecimiento del cabello.",
    image: "https://placehold.co/400x400/2a1e16/d9ab52?text=Minoxidil",
  },
  {
    id: "aceite-barba",
    name: "Aceite para Barba El Papi",
    category: "Cuidado de barba",
    price: 210,
    description: "Suaviza, hidrata y da brillo natural. Aroma amaderado de barbería clásica.",
    image: "https://placehold.co/400x400/2a1e16/d9ab52?text=Aceite+Barba",
  },
];

/* -------------------------------------------------------------
   BLOQUE 2: ESTADO DEL CARRITO
   "cart" es un arreglo de { id, quantity }. Lo guardamos en
   localStorage para que, si el cliente cierra el navegador y
   vuelve, su carrito siga ahí.
   ------------------------------------------------------------- */
let cart = JSON.parse(localStorage.getItem("elpapi_cart")) || [];

function saveCart() {
  localStorage.setItem("elpapi_cart", JSON.stringify(cart));
}

function findProduct(id) {
  return products.find((p) => p.id === id);
}

function addToCart(id) {
  const existing = cart.find((item) => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, quantity: 1 });
  }
  saveCart();
  renderCart();
  openCart();
}

function changeQuantity(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter((i) => i.id !== id);
  }
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter((i) => i.id !== id);
  saveCart();
  renderCart();
}

function cartTotal() {
  return cart.reduce((sum, item) => {
    const product = findProduct(item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
}

function formatPrice(number) {
  return number.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

/* -------------------------------------------------------------
   BLOQUE 3: RENDERIZADO — pintar el catálogo y el carrito en pantalla
   ------------------------------------------------------------- */
function renderProducts() {
  const grid = document.getElementById("productGrid");
  grid.innerHTML = products
    .map(
      (product) => `
      <article class="product-card">
        <div class="product-card__image">
          <img src="${product.image}" alt="${product.name}" loading="lazy" />
        </div>
        <p class="product-card__category">${product.category}</p>
        <h3 class="product-card__name">${product.name}</h3>
        <p class="product-card__desc">${product.description}</p>
        <div class="product-card__footer">
          <button class="product-card__add" data-add="${product.id}">Agregar</button>
          <div class="product-card__price">
            $${product.price}<small>MXN</small>
          </div>
        </div>
      </article>
    `
    )
    .join("");

  // Delegación de eventos: un solo listener para todos los botones "Agregar"
  grid.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.add));
  });
}

function renderCart() {
  const container = document.getElementById("cartItems");
  const countBadge = document.getElementById("cartCount");
  const totalEl = document.getElementById("cartTotal");

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  countBadge.textContent = totalItems;

  if (cart.length === 0) {
    container.innerHTML = `<p class="cart-empty">Tu carrito está vacío.<br>Agrega algún producto del catálogo.</p>`;
  } else {
    container.innerHTML = cart
      .map((item) => {
        const product = findProduct(item.id);
        if (!product) return "";
        return `
          <div class="cart-item">
            <div class="cart-item__image"><img src="${product.image}" alt="${product.name}" /></div>
            <div class="cart-item__info">
              <p class="cart-item__name">${product.name}</p>
              <p class="cart-item__price">${formatPrice(product.price)} c/u</p>
              <div class="cart-item__qty">
                <button data-decrease="${product.id}">−</button>
                <span>${item.quantity}</span>
                <button data-increase="${product.id}">+</button>
                <button class="cart-item__remove" data-remove="${product.id}">Quitar</button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    container.querySelectorAll("[data-increase]").forEach((btn) =>
      btn.addEventListener("click", () => changeQuantity(btn.dataset.increase, 1))
    );
    container.querySelectorAll("[data-decrease]").forEach((btn) =>
      btn.addEventListener("click", () => changeQuantity(btn.dataset.decrease, -1))
    );
    container.querySelectorAll("[data-remove]").forEach((btn) =>
      btn.addEventListener("click", () => removeFromCart(btn.dataset.remove))
    );
  }

  totalEl.textContent = formatPrice(cartTotal());
  updateWhatsappLink();
}

/* -------------------------------------------------------------
   BLOQUE 4: ABRIR / CERRAR EL PANEL DEL CARRITO
   ------------------------------------------------------------- */
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");

function openCart() {
  cartDrawer.classList.add("is-open");
  cartOverlay.classList.add("is-open");
}
function closeCart() {
  cartDrawer.classList.remove("is-open");
  cartOverlay.classList.remove("is-open");
}

document.getElementById("cartToggle").addEventListener("click", openCart);
document.getElementById("cartClose").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

/* -------------------------------------------------------------
   BLOQUE 5: MENÚ MÓVIL (hamburguesa)
   ------------------------------------------------------------- */
const nav = document.getElementById("nav");
const navBurger = document.getElementById("navBurger");

navBurger.addEventListener("click", () => nav.classList.toggle("is-open"));
nav.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => nav.classList.remove("is-open"))
);

/* -------------------------------------------------------------
   BLOQUE 6: BOTÓN FLOTANTE Y CHECKOUT POR WHATSAPP
   Construimos un mensaje con el detalle del pedido y lo mandamos
   como link de wa.me — así el cliente confirma directo contigo.
   ------------------------------------------------------------- */
function buildWhatsappMessage() {
  if (cart.length === 0) {
    return "Hola El Papi, quiero información sobre sus productos.";
  }
  const lines = cart.map((item) => {
    const product = findProduct(item.id);
    return `• ${product.name} x${item.quantity} — ${formatPrice(product.price * item.quantity)}`;
  });
  lines.push("", `Total: ${formatPrice(cartTotal())}`);
  return `Hola El Papi, quiero pedir:\n${lines.join("\n")}`;
}

function updateWhatsappLink() {
  const message = encodeURIComponent(buildWhatsappMessage());
  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${message}`;
  document.getElementById("whatsappFloat").href = url;
  document.getElementById("checkoutBtn").onclick = () => window.open(url, "_blank");
}

/* -------------------------------------------------------------
   BLOQUE 7: FORMULARIO DE CONTACTO CON EMAILJS
   ------------------------------------------------------------- */
emailjs.init(CONFIG.emailJs.publicKey);

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const submitBtn = document.getElementById("contactSubmit");

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando...";
  formStatus.textContent = "";
  formStatus.removeAttribute("data-state");

  emailjs
    .sendForm(CONFIG.emailJs.serviceId, CONFIG.emailJs.templateId, contactForm)
    .then(() => {
      formStatus.textContent = "¡Mensaje enviado! Te contestamos pronto.";
      formStatus.dataset.state = "success";
      contactForm.reset();
    })
    .catch((error) => {
      console.error("Error de EmailJS:", error);
      formStatus.textContent = "No se pudo enviar. Intenta de nuevo o usa WhatsApp.";
      formStatus.dataset.state = "error";
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = "Enviar mensaje";
    });
});

/* -------------------------------------------------------------
   BLOQUE 8: PEQUEÑOS DETALLES FINALES
   ------------------------------------------------------------- */
document.getElementById("year").textContent = new Date().getFullYear();

/* -------------------------------------------------------------
   BLOQUE 9: ARRANQUE — todo empieza aquí
   ------------------------------------------------------------- */
renderProducts();
renderCart();

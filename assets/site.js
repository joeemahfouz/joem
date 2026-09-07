/* ==========================================================================
   SOFIA storefront — application logic (vanilla JS, no build step)
   --------------------------------------------------------------------------
   >>> REPLACE THESE PLACEHOLDER DECISIONS BEFORE GOING LIVE <<<
   They correspond to the six "Before you publish" decisions in the
   Customer Text Pack. Everything else on the site reads from here.
   ========================================================================== */
const CONFIG = {
  brand: "SOFIA",
  tagline: { en: "Shoes & bags", ar: "أحذية وحقائب" },
  whatsapp: "96171041967",          // shop WhatsApp number, digits only, incl. country code
  currency: { code: "USD", symbol: "$" },
  deliveryFee: 3,                    // one flat fee for all of Lebanon
  freeDeliveryOver: null,           // e.g. 100 to offer free delivery over $100, or null
  deliveryDays: { beirut: "1–2", other: "2–4" },
  returnWindowDays: 3,
  instagram: "yourshop",            // TODO: real handle (without @)
};

/* ---- UI micro-copy -------------------------------------------------------- */
const STR = {
  en: {
    dir: "ltr",
    nav_shop: "Shop", nav_size: "Size guide", nav_delivery: "Delivery & payment", nav_returns: "Returns",
    cart: "Cart", added: "Added to bag", colour: "Colour", size: "Size", material: "Material",
    heel: "Heel height", dimensions: "Dimensions", strap: "Strap drop", care: "Care", sku: "SKU",
    choose_size: "Select a size", choose_colour: "Select a colour",
    in_stock: "In stock", low_stock: "Only {n} left", out_stock: "Out of stock", sold_out: "Sold out",
    add_to_bag: "Add to bag", size_guide_link: "Size guide",
    shoes: "Shoes", bags: "Bags", all_products: "All products",
    subtotal: "Subtotal", delivery: "Delivery", total: "Total", free: "Free",
    empty_cart: "Your bag is empty.", continue: "Continue shopping",
    checkout_wa: "Order on WhatsApp", cod_note: "Cash on delivery across Lebanon. We confirm every order by WhatsApp before we send it.",
    remove: "Remove", qty: "Qty", one_size: "One size",
    view_bag: "View bag", est_delivery: "Beirut {b} working days · other areas {o} working days",
    filter_category: "Category", filter_colour: "Colour", filter_all: "All",
    filter_size: "Size", filter_availability: "Availability", in_stock_only: "In stock only",
    clear_filters: "Clear filters", no_results: "No products match these filters.",
    results_one: "1 product", results_many: "{n} products",
  },
  ar: {
    dir: "rtl",
    nav_shop: "المتجر", nav_size: "دليل القياسات", nav_delivery: "التوصيل والدفع", nav_returns: "الإرجاع",
    cart: "السلة", added: "أُضيفت إلى الحقيبة", colour: "اللون", size: "القياس", material: "المادة",
    heel: "ارتفاع الكعب", dimensions: "الأبعاد", strap: "طول الحزام", care: "العناية", sku: "الرمز",
    choose_size: "اختاري القياس", choose_colour: "اختاري اللون",
    in_stock: "متوفّر", low_stock: "بقي {n} فقط", out_stock: "غير متوفّر", sold_out: "نفد المخزون",
    add_to_bag: "أضيفي إلى الحقيبة", size_guide_link: "دليل القياسات",
    shoes: "الأحذية", bags: "الحقائب", all_products: "كل المنتجات",
    subtotal: "المجموع الفرعي", delivery: "التوصيل", total: "الإجمالي", free: "مجاني",
    empty_cart: "حقيبتك فارغة.", continue: "متابعة التسوّق",
    checkout_wa: "اطلبي عبر واتساب", cod_note: "الدفع عند الاستلام في كل لبنان. نؤكّد كل طلب عبر واتساب قبل إرساله.",
    remove: "إزالة", qty: "الكمية", one_size: "قياس واحد",
    view_bag: "عرض الحقيبة", est_delivery: "بيروت {b} يوم عمل · باقي المناطق {o} أيام عمل",
    filter_category: "الفئة", filter_colour: "اللون", filter_all: "الكل",
    filter_size: "القياس", filter_availability: "التوفّر", in_stock_only: "المتوفّر فقط",
    clear_filters: "مسح الفلاتر", no_results: "لا توجد منتجات مطابقة لهذه الفلاتر.",
    results_one: "منتج واحد", results_many: "{n} منتجات",
  },
};

/* ---- state ---------------------------------------------------------------- */
const store = {
  lang: safeGet("sofia_lang") || "en",
  cart: JSON.parse(safeGet("sofia_cart") || "[]"),
  products: [],
};
function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
function t(key, vars) {
  let s = (STR[store.lang] && STR[store.lang][key]) || STR.en[key] || key;
  if (vars) for (const k in vars) s = s.replace("{" + k + "}", vars[k]);
  return s;
}
const L = (obj) => (obj && (obj[store.lang] ?? obj.en)) ?? "";
function money(n) {
  const s = CONFIG.currency.symbol;
  const val = Number(n) % 1 === 0 ? String(n) : Number(n).toFixed(2);
  return store.lang === "ar" ? `${val} ${s}` : `${s}${val}`;
}

/* ---- data ----------------------------------------------------------------- */
async function loadProducts() {
  if (store.products.length) return store.products;
  const res = await fetch(pathTo("data/products.json"));
  const data = await res.json();
  store.products = data.products;
  return store.products;
}
// resolve paths relative to site root regardless of page depth
function pathTo(p) { return (document.body.dataset.root || "") + p; }
const productByHandle = (h) => store.products.find((p) => p.handle === h);
const variantOf = (p, colour, size) => p.variants.find((v) => v.colour === colour && v.size === size);
const stockForColour = (p, colour) => p.variants.filter((v) => v.colour === colour).reduce((a, v) => a + v.stock, 0);
const productInStock = (p) => p.variants.some((v) => v.stock > 0);
const colourMeta = (p, code) => p.colours.find((c) => c.code === code);
const firstImage = (p, colour) => colourMeta(p, colour || p.options.colour[0]).images[0];

/* ---- cart ----------------------------------------------------------------- */
function cartCount() { return store.cart.reduce((a, i) => a + i.qty, 0); }
function saveCart() { safeSet("sofia_cart", JSON.stringify(store.cart)); paintCartCount(); }
function addToCart(sku, qty = 1) {
  const line = store.cart.find((i) => i.sku === sku);
  const max = variantStock(sku);
  if (line) line.qty = Math.min(line.qty + qty, max);
  else store.cart.push({ sku, qty: Math.min(qty, max) });
  saveCart();
}
function setQty(sku, qty) {
  const line = store.cart.find((i) => i.sku === sku);
  if (!line) return;
  line.qty = Math.max(0, Math.min(qty, variantStock(sku)));
  if (line.qty === 0) store.cart = store.cart.filter((i) => i.sku !== sku);
  saveCart();
}
function variantStock(sku) {
  for (const p of store.products) { const v = p.variants.find((v) => v.sku === sku); if (v) return v.stock; }
  return 0;
}
function resolveLine(item) {
  for (const p of store.products) {
    const v = p.variants.find((v) => v.sku === item.sku);
    if (v) return { product: p, variant: v, qty: item.qty };
  }
  return null;
}
function cartTotals() {
  const lines = store.cart.map(resolveLine).filter(Boolean);
  const subtotal = lines.reduce((a, l) => a + l.product.price * l.qty, 0);
  let delivery = subtotal > 0 ? CONFIG.deliveryFee : 0;
  if (CONFIG.freeDeliveryOver && subtotal >= CONFIG.freeDeliveryOver) delivery = 0;
  return { lines, subtotal, delivery, total: subtotal + delivery };
}

/* ---- language / chrome ---------------------------------------------------- */
function setLang(lang) {
  store.lang = lang; safeSet("sofia_lang", lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = STR[lang].dir;
  renderChrome();
  document.dispatchEvent(new CustomEvent("langchange"));
}
function toggleLang() { setLang(store.lang === "en" ? "ar" : "en"); }

function renderChrome() {
  const root = document.body.dataset.root || "";
  const page = document.body.dataset.page || "";
  const link = (href, key, id) =>
    `<a href="${root}${href}" ${page === id ? 'aria-current="page"' : ""}>${t(key)}</a>`;
  const head = document.querySelector("[data-site-head]");
  if (head) head.innerHTML = `
    <div class="site-head"><div class="wrap site-head__row">
      <a class="brand" href="${root}index.html">${CONFIG.brand}<small>${L(CONFIG.tagline)}</small></a>
      <nav class="nav" id="mainnav">
        ${link("index.html", "nav_shop", "shop")}
        ${link("size-guide.html", "nav_size", "size")}
        ${link("delivery.html", "nav_delivery", "delivery")}
        ${link("returns.html", "nav_returns", "returns")}
      </nav>
      <div class="head-tools">
        <button class="lang-toggle" onclick="toggleLang()">${store.lang === "en" ? "العربية" : "EN"}</button>
        <a class="cart-link" href="${root}cart.html" aria-label="${t("cart")}">🛍️<span class="cart-count" data-cart-count hidden>0</span></a>
        <button class="menu-btn" aria-label="Menu" onclick="document.getElementById('mainnav').classList.toggle('open')">☰</button>
      </div>
    </div></div>`;

  const foot = document.querySelector("[data-site-foot]");
  if (foot) foot.innerHTML = `
    <footer class="site-foot">
      <div class="wrap">
        <div>
          <div class="brand" style="font-size:22px">${CONFIG.brand}</div>
          <p class="muted" style="max-width:34ch;font-size:14px">${t("cod_note")}</p>
        </div>
        <div>
          <h4>${t("nav_shop")}</h4>
          <a href="${root}index.html#shoes">${t("shoes")}</a>
          <a href="${root}index.html#bags">${t("bags")}</a>
          <a href="${root}size-guide.html">${t("nav_size")}</a>
        </div>
        <div>
          <h4>${t("nav_delivery")}</h4>
          <a href="${root}delivery.html">${t("nav_delivery")}</a>
          <a href="${root}returns.html">${t("nav_returns")}</a>
          <a href="https://wa.me/${CONFIG.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>
        </div>
      </div>
      <div class="foot-note">© ${new Date().getFullYear()} ${CONFIG.brand} · Beirut, Lebanon</div>
    </footer>`;
  paintCartCount();
}
function paintCartCount() {
  const n = cartCount();
  document.querySelectorAll("[data-cart-count]").forEach((el) => { el.textContent = n; el.hidden = n === 0; });
}

/* ---- toast ---------------------------------------------------------------- */
let toastTimer;
function toast(msg) {
  let el = document.querySelector(".toast");
  if (!el) { el = document.createElement("div"); el.className = "toast"; document.body.appendChild(el); }
  el.textContent = msg; el.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
}

/* ---- WhatsApp checkout ----------------------------------------------------- */
function whatsappOrder() {
  const { lines, subtotal, delivery, total } = cartTotals();
  if (!lines.length) return;
  const ar = store.lang === "ar";
  const rows = lines.map((l) => {
    const name = L(l.product.title), col = L(colourMeta(l.product, l.variant.colour));
    const sz = l.variant.size === "OS" ? "" : (ar ? ` — ${t("size")} ${l.variant.size}` : ` — ${t("size")} ${l.variant.size}`);
    return `• ${name} — ${col}${sz} ×${l.qty} (${money(l.product.price * l.qty)})  [${l.variant.sku}]`;
  }).join("\n");
  const msg = ar
    ? `مرحباً ${CONFIG.brand} 👋 أودّ تأكيد هذا الطلب:\n${rows}\n\nالمجموع الفرعي: ${money(subtotal)}\nالتوصيل: ${delivery ? money(delivery) : t("free")}\nالإجمالي: ${money(total)}\n\nالاسم: \nالعنوان: \nالدفع: عند الاستلام`
    : `Hello ${CONFIG.brand} 👋 I'd like to place this order:\n${rows}\n\nSubtotal: ${money(subtotal)}\nDelivery: ${delivery ? money(delivery) : t("free")}\nTotal: ${money(total)}\n\nName: \nAddress: \nPayment: Cash on delivery`;
  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
}

/* ---- bootstrap ------------------------------------------------------------ */
document.documentElement.lang = store.lang;
document.documentElement.dir = STR[store.lang].dir;
window.addEventListener("DOMContentLoaded", () => {
  renderChrome();
  const page = document.body.dataset.page;
  if (page === "shop") initShop();
  else if (page === "product") initProduct();
  else if (page === "cart") initCart();
  else if (["size", "delivery", "returns"].includes(page)) initDoc(page);
});

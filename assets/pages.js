/* ==========================================================================
   Page renderers — one per data-page. Depends on site.js + content.js globals.
   ========================================================================== */

/* ---- helpers -------------------------------------------------------------- */
function priceHTML(p) {
  if (p.compare_at && p.compare_at > p.price)
    return `<span class="price"><del>${money(p.compare_at)}</del>${money(p.price)}</span>`;
  return `<span class="price">${money(p.price)}</span>`;
}
function swatchDots(p) {
  return `<span class="swatches">${p.colours
    .map((c) => `<span class="dot" style="background:#${c.hex}" title="${L(c)}"></span>`)
    .join("")}</span>`;
}
function productCard(p) {
  const root = document.body.dataset.root || "";
  const sold = !productInStock(p);
  return `
    <a class="card" href="${root}product.html?handle=${p.handle}">
      <div class="card__media"><img src="${root}assets/img/${firstImage(p)}" alt="${L(p.title)}" loading="lazy"></div>
      <div class="card__body">
        <span class="card__type">${L(p.type)}</span>
        <span class="card__title">${L(p.title)}</span>
        <div class="card__foot">
          ${sold ? `<span class="badge-soldout">${t("sold_out")}</span>` : priceHTML(p)}
          ${swatchDots(p)}
        </div>
      </div>
    </a>`;
}

/* ---- shop / home ---------------------------------------------------------- */
async function initShop() {
  await loadProducts();
  const render = () => {
    const shoes = store.products.filter((p) => p.kind === "shoe");
    const bags = store.products.filter((p) => p.kind === "bag");
    const section = (id, title, items) => items.length ? `
      <section id="${id}">
        <div class="section-title"><h2>${title}</h2></div>
        <div class="grid">${items.map(productCard).join("")}</div>
      </section>` : "";
    document.getElementById("app").innerHTML = `
      <section class="hero"><div class="wrap"><div class="hero__inner">
        <h1>${store.lang === "ar" ? "أحذية وحقائب مصنوعة لتُلبَس" : "Shoes & bags, made to be worn"}</h1>
        <p>${t("cod_note")}</p>
        <div class="pill-row">
          <span class="pill">🇱🇧 ${store.lang === "ar" ? "توصيل لكل لبنان" : "Delivery across Lebanon"}</span>
          <span class="pill">💵 ${store.lang === "ar" ? "الدفع عند الاستلام" : "Cash on delivery"}</span>
          <span class="pill">💬 ${store.lang === "ar" ? "تأكيد عبر واتساب" : "WhatsApp confirmation"}</span>
        </div>
      </div></div></section>
      <div class="wrap">
        ${section("shoes", t("shoes"), shoes)}
        ${section("bags", t("bags"), bags)}
      </div>`;
  };
  render();
  document.addEventListener("langchange", render);
}

/* ---- product -------------------------------------------------------------- */
function initProduct() {
  const handle = new URLSearchParams(location.search).get("handle");
  loadProducts().then(() => {
    const p = productByHandle(handle);
    if (!p) { location.replace((document.body.dataset.root || "") + "index.html"); return; }
    document.title = `${L(p.title)} · ${CONFIG.brand}`;
    const isBag = p.kind === "bag";
    // pick a default colour that has stock
    const state = {
      colour: (p.options.colour.find((c) => stockForColour(p, c) > 0)) || p.options.colour[0],
      size: isBag ? "OS" : null,
      img: 0,
    };

    function currentVariant() { return state.size ? variantOf(p, state.colour, state.size) : null; }

    function render() {
      const cm = colourMeta(p, state.colour);
      const root = document.body.dataset.root || "";
      const imgs = cm.images;
      state.img = Math.min(state.img, imgs.length - 1);

      const sizeButtons = isBag ? "" : `
        <div class="opt-group">
          <div class="opt-group__label">${t("size")}
            <span class="link-inline" onclick="location.href='${root}size-guide.html'">${t("size_guide_link")}</span>
          </div>
          <div class="size-grid">
            ${p.options.size.map((s) => {
              const v = variantOf(p, state.colour, s);
              const oos = !v || v.stock <= 0;
              const low = v && v.stock > 0 && v.stock <= 2;
              return `<button class="size-btn" data-size="${s}" ${oos ? "disabled" : ""}
                aria-pressed="${state.size === s}">${s}${low ? `<small>${t("low_stock").replace("{n}", v.stock)}</small>` : ""}</button>`;
            }).join("")}
          </div>
        </div>`;

      // stock line
      let stockHTML = "";
      if (isBag) {
        const v = variantOf(p, state.colour, "OS");
        stockHTML = stockLine(v);
      } else if (state.size) {
        stockHTML = stockLine(currentVariant());
      } else {
        stockHTML = `<div class="stock-line muted">${t("choose_size")}</div>`;
      }

      const v = currentVariant();
      const canAdd = v && v.stock > 0;

      const specRows = [];
      specRows.push([t("material"), L(p.material)]);
      if (isBag) {
        specRows.push([t("dimensions"), L(p.dimensions)]);
        if (p.strap_drop) specRows.push([t("strap"), `${p.strap_drop} cm`]);
        if (p.lining) specRows.push([t("nav_shop") === "المتجر" ? "البطانة" : "Lining", L(p.lining)]);
      } else {
        specRows.push([t("heel"), `${p.heel_cm} cm — ${L(p.heel_band)}`]);
      }
      if (p.care) specRows.push([t("care"), L(p.care)]);
      specRows.push([t("sku"), (v && v.sku) || `${p.style}-${state.colour}-${isBag ? "OS" : "··"}`]);

      document.getElementById("app").innerHTML = `
        <div class="wrap"><div class="pdp">
          <div class="gallery">
            <div class="gallery__main"><img id="mainimg" src="${root}assets/img/${imgs[state.img]}" alt="${L(p.title)} — ${L(cm)}"></div>
            <div class="gallery__thumbs">
              ${imgs.map((im, i) => `<button class="thumb" data-img="${i}" aria-current="${i === state.img}">
                <img src="${root}assets/img/${im}" alt=""></button>`).join("")}
            </div>
          </div>
          <div class="pdp__info">
            <div class="card__type">${L(p.type)}</div>
            <h1 class="pdp__title">${L(p.title)}</h1>
            <div class="pdp__price">${priceHTML(p)}</div>

            <div class="opt-group">
              <div class="opt-group__label">${t("colour")} <span class="opt-group__value">${L(cm)}</span></div>
              <div class="opt-swatches">
                ${p.colours.map((c) => {
                  const oos = stockForColour(p, c.code) <= 0;
                  return `<button class="opt-swatch" data-colour="${c.code}" title="${L(c)}${oos ? " — " + t("sold_out") : ""}"
                    style="background:#${c.hex}${oos ? ";opacity:.45" : ""}" aria-pressed="${state.colour === c.code}"></button>`;
                }).join("")}
              </div>
            </div>

            ${sizeButtons}
            ${stockHTML}

            <div class="pdp__actions">
              <button class="btn btn--accent btn--block" id="addbtn" ${canAdd ? "" : "disabled"}>
                ${canAdd ? t("add_to_bag") : (isBag || state.size ? t("out_stock") : t("choose_size"))}
              </button>
            </div>

            <p class="muted" style="font-size:13.5px">${t("est_delivery").replace("{b}", CONFIG.deliveryDays.beirut).replace("{o}", CONFIG.deliveryDays.other)}</p>

            <div class="spec"><dl>
              ${specRows.map(([k, val]) => `<dt>${k}</dt><dd>${val}</dd>`).join("")}
            </dl></div>
            <p class="muted" style="margin-top:16px">${L(p.description)}</p>
          </div>
        </div></div>`;

      // wire events
      document.querySelectorAll(".thumb").forEach((b) =>
        b.onclick = () => { state.img = +b.dataset.img; render(); });
      document.querySelectorAll(".opt-swatch").forEach((b) =>
        b.onclick = () => {
          state.colour = b.dataset.colour; state.img = 0;
          if (!isBag && state.size && (!variantOf(p, state.colour, state.size) || variantOf(p, state.colour, state.size).stock <= 0)) state.size = null;
          render();
        });
      document.querySelectorAll(".size-btn").forEach((b) =>
        b.onclick = () => { if (b.disabled) return; state.size = b.dataset.size; render(); });
      const add = document.getElementById("addbtn");
      if (add) add.onclick = () => {
        const vv = isBag ? variantOf(p, state.colour, "OS") : currentVariant();
        if (!vv || vv.stock <= 0) return;
        addToCart(vv.sku, 1);
        toast(t("added"));
      };
    }

    function stockLine(v) {
      if (!v || v.stock <= 0) return `<div class="stock-line out">${t("out_stock")}</div>`;
      if (v.stock <= 2) return `<div class="stock-line low">${t("low_stock").replace("{n}", v.stock)}</div>`;
      return `<div class="stock-line in">${t("in_stock")}</div>`;
    }

    render();
    document.addEventListener("langchange", render);
  });
}

/* ---- cart ----------------------------------------------------------------- */
function initCart() {
  loadProducts().then(() => {
    const render = () => {
      const root = document.body.dataset.root || "";
      const { lines, subtotal, delivery, total } = cartTotals();
      const app = document.getElementById("app");
      if (!lines.length) {
        app.innerHTML = `<div class="wrap"><div class="empty">
          <p style="font-size:20px">${t("empty_cart")}</p>
          <a class="btn btn--ghost" href="${root}index.html">${t("continue")}</a>
        </div></div>`;
        return;
      }
      const item = (l) => {
        const cm = colourMeta(l.product, l.variant.colour);
        const sz = l.variant.size === "OS" ? t("one_size") : `${t("size")} ${l.variant.size}`;
        return `<div class="cart-item">
          <div class="cart-item__media"><img src="${root}assets/img/${cm.images[0]}" alt=""></div>
          <div>
            <div style="font-family:var(--serif);font-size:17px">${L(l.product.title)}</div>
            <div class="cart-item__meta">${L(cm)} · ${sz} · ${money(l.product.price)}</div>
            <div class="cart-item__meta" style="margin-top:2px">${l.variant.sku}</div>
            <div style="display:flex;gap:14px;align-items:center;margin-top:8px">
              <span class="qty">
                <button data-dec="${l.variant.sku}" aria-label="−">−</button>
                <span>${l.qty}</span>
                <button data-inc="${l.variant.sku}" aria-label="+" ${l.qty >= l.variant.stock ? "disabled style=opacity:.35" : ""}>+</button>
              </span>
              <button class="remove" data-rm="${l.variant.sku}">${t("remove")}</button>
            </div>
          </div>
          <div class="price">${money(l.product.price * l.qty)}</div>
        </div>`;
      };
      app.innerHTML = `<div class="wrap">
        <h1 style="margin:24px 0 6px">${t("cart")}</h1>
        <div class="cart-wrap">
          <div>${lines.map(item).join("")}</div>
          <aside class="summary">
            <div class="summary__row"><span>${t("subtotal")}</span><span>${money(subtotal)}</span></div>
            <div class="summary__row"><span>${t("delivery")}</span><span>${delivery ? money(delivery) : t("free")}</span></div>
            <div class="summary__row summary__row--total"><span>${t("total")}</span><span>${money(total)}</span></div>
            <button class="btn btn--wa btn--block" id="wabtn" style="margin-top:14px">💬 ${t("checkout_wa")}</button>
            <p class="muted" style="font-size:12.5px;margin-top:10px">${t("cod_note")}</p>
            <a href="${root}index.html" class="link-inline" style="font-size:14px">${t("continue")}</a>
          </aside>
        </div></div>`;
      document.querySelectorAll("[data-inc]").forEach((b) => b.onclick = () => { const l = store.cart.find(i => i.sku === b.dataset.inc); setQty(b.dataset.inc, l.qty + 1); render(); });
      document.querySelectorAll("[data-dec]").forEach((b) => b.onclick = () => { const l = store.cart.find(i => i.sku === b.dataset.dec); setQty(b.dataset.dec, l.qty - 1); render(); });
      document.querySelectorAll("[data-rm]").forEach((b) => b.onclick = () => { setQty(b.dataset.rm, 0); render(); });
      document.getElementById("wabtn").onclick = whatsappOrder;
    };
    render();
    document.addEventListener("langchange", render);
  });
}

/* ---- doc pages ------------------------------------------------------------ */
function initDoc(page) {
  const render = () => { document.getElementById("app").innerHTML =
    `<div class="wrap"><article class="doc">${CONTENT[page][store.lang]()}</article></div>`; };
  render();
  document.addEventListener("langchange", render);
}

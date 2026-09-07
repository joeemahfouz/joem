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
function productCard(p, preferred) {
  const root = document.body.dataset.root || "";
  const sold = !productInStock(p);
  // if a colour filter is active and this product has one, show that colour
  const match = preferred && preferred.size ? p.colours.find((c) => preferred.has(c.code)) : null;
  const img = match ? match.images[0] : firstImage(p);
  const href = `${root}product.html?handle=${p.handle}${match ? "&colour=" + match.code : ""}`;
  return `
    <a class="card" href="${href}">
      <div class="card__media"><img src="${root}assets/img/${img}" alt="${L(p.title)}" loading="lazy"></div>
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

  // facets derived from the actual catalogue (never show a filter that matches nothing)
  const categories = [];
  const catSeen = new Set();
  const colours = [];
  const colSeen = new Set();
  const sizeSet = new Set();
  store.products.forEach((p) => {
    if (!catSeen.has(p.category_code)) { catSeen.add(p.category_code); categories.push({ code: p.category_code, label: p.type }); }
    p.colours.forEach((c) => { if (!colSeen.has(c.code)) { colSeen.add(c.code); colours.push(c); } });
    p.variants.forEach((v) => { if (v.size !== "OS") sizeSet.add(v.size); });
  });
  const sizes = [...sizeSet].sort((a, b) => Number(a) - Number(b));

  // ---- filter state <-> URL query (?cat=…&colour=BLK,BEI&size=35,38&instock=1)
  // openDD tracks which filter dropdown is open (UI-only, not in the URL).
  const state = { cat: "ALL", colours: new Set(), sizes: new Set(), inStock: false, openDD: null };
  const readURL = () => {
    const q = new URLSearchParams(location.search);
    const cat = q.get("cat");
    state.cat = cat && catSeen.has(cat) ? cat : "ALL";
    const pick = (key, allowed) => new Set((q.get(key) || "").split(",").filter((v) => allowed.has(v)));
    state.colours = pick("colour", colSeen);
    state.sizes = pick("size", sizeSet);
    state.inStock = q.get("instock") === "1";
  };
  const writeURL = () => {
    const q = new URLSearchParams();
    if (state.cat !== "ALL") q.set("cat", state.cat);
    if (state.colours.size) q.set("colour", [...state.colours].join(","));
    if (state.sizes.size) q.set("size", [...state.sizes].join(","));
    if (state.inStock) q.set("instock", "1");
    const qs = q.toString();
    history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "") + location.hash);
  };
  const apply = () => { writeURL(); render(); };
  readURL();

  // a product matches if at least one of its variants satisfies every active
  // colour / size / stock constraint at once; category is a product-level facet.
  const matches = (p) => {
    if (state.cat !== "ALL" && p.category_code !== state.cat) return false;
    return p.variants.some((v) =>
      (state.colours.size === 0 || state.colours.has(v.colour)) &&
      (state.sizes.size === 0 || state.sizes.has(v.size)) &&
      (!state.inStock || v.stock > 0));
  };

  const render = () => {
    const active = state.cat !== "ALL" || state.colours.size > 0 || state.sizes.size > 0 || state.inStock;
    const filtered = store.products.filter(matches);
    const shoes = filtered.filter((p) => p.kind === "shoe");
    const bags = filtered.filter((p) => p.kind === "bag");

    const section = (id, title, items) => items.length ? `
      <section id="${id}">
        <div class="section-title"><h2>${title}</h2></div>
        <div class="grid">${items.map((p) => productCard(p, state.colours)).join("")}</div>
      </section>` : "";

    // --- Category dropdown (single-select) ---
    const catLabelOf = (code) => code === "ALL" ? t("filter_all") : L((categories.find((c) => c.code === code) || {}).label || { en: code });
    const catOpts = [{ code: "ALL" }, ...categories.map((c) => ({ code: c.code }))]
      .map((o) => `<button class="dd__opt" data-catopt="${o.code}" aria-selected="${state.cat === o.code}">${catLabelOf(o.code)}${state.cat === o.code ? '<span class="dd__check">✓</span>' : ""}</button>`).join("");
    const catDD = `<div class="filter-group"><span class="filter-label">${t("filter_category")}</span>
      <details class="dd" data-dd="cat" ${state.openDD === "cat" ? "open" : ""}>
        <summary class="dd__btn" data-ddbtn="cat"><span class="cur">${catLabelOf(state.cat)}</span><span class="dd__caret" aria-hidden="true">▾</span></summary>
        <div class="dd__panel">${catOpts}</div>
      </details></div>`;

    // --- Colour dropdown (multi-select) ---
    const colCount = state.colours.size;
    const colSummary = colCount === 0 ? t("filter_all")
      : colCount === 1 ? L(colours.find((c) => state.colours.has(c.code)))
      : t("n_selected").replace("{n}", colCount);
    const colOpts = colours
      .map((c) => `<button class="dd__opt" data-colopt="${c.code}" aria-checked="${state.colours.has(c.code)}"><span class="dot" style="background:#${c.hex}"></span>${L(c)}${state.colours.has(c.code) ? '<span class="dd__check">✓</span>' : ""}</button>`).join("");
    const colDD = `<div class="filter-group"><span class="filter-label">${t("filter_colour")}</span>
      <details class="dd" data-dd="colour" ${state.openDD === "colour" ? "open" : ""}>
        <summary class="dd__btn" data-ddbtn="colour"><span class="cur">${colSummary}</span><span class="dd__caret" aria-hidden="true">▾</span></summary>
        <div class="dd__panel">${colOpts}</div>
      </details></div>`;

    const sizeChips = sizes
      .map((s) => `<button class="chip" data-size="${s}" aria-pressed="${state.sizes.has(s)}">${s}</button>`).join("");
    const sizeGroup = sizes.length
      ? `<div class="filter-group"><span class="filter-label">${t("filter_size")}</span>${sizeChips}</div>` : "";
    const stockGroup = `<div class="filter-group"><span class="filter-label">${t("filter_availability")}</span>
        <button class="chip" data-instock aria-pressed="${state.inStock}">${t("in_stock_only")}</button></div>`;

    const resultsLine = active
      ? `<p class="results-line">${filtered.length === 1 ? t("results_one") : t("results_many").replace("{n}", filtered.length)}</p>`
      : "";
    const body = filtered.length
      ? `${resultsLine}${section("shoes", t("shoes"), shoes)}${section("bags", t("bags"), bags)}`
      : `<div class="empty"><p style="font-size:19px">${t("no_results")}</p>
           <button class="btn btn--ghost" data-clear>${t("clear_filters")}</button></div>`;

    document.getElementById("app").innerHTML = `
      <section class="hero"><div class="wrap"><div class="hero__inner">
        <p class="hero__eyebrow">${store.lang === "ar" ? "منتجات جلدية · بيروت" : "Leather goods · Beirut"}</p>
        <h1>${store.lang === "ar" ? "أحذية وحقائب مصنوعة لتُلبَس" : "Shoes &amp; bags, made to be <em>worn</em>"}</h1>
        <p>${t("cod_note")}</p>
        <div class="pill-row">
          <span class="pill">🇱🇧 ${store.lang === "ar" ? "توصيل لكل لبنان" : "Delivery across Lebanon"}</span>
          <span class="pill">💵 ${store.lang === "ar" ? "الدفع عند الاستلام" : "Cash on delivery"}</span>
          <span class="pill">💬 ${store.lang === "ar" ? "تأكيد عبر واتساب" : "WhatsApp confirmation"}</span>
        </div>
      </div></div></section>
      <div class="wrap">
        <div class="filters">
          ${catDD}
          ${colDD}
          ${sizeGroup}
          ${stockGroup}
          <button class="clear" data-clear ${active ? "" : "hidden"}>${t("clear_filters")}</button>
        </div>
        ${body}
      </div>`;

    document.querySelectorAll("[data-ddbtn]").forEach((b) =>
      b.onclick = (e) => { e.preventDefault(); const dd = b.dataset.ddbtn; state.openDD = state.openDD === dd ? null : dd; render(); });
    document.querySelectorAll("[data-catopt]").forEach((b) =>
      b.onclick = () => { state.cat = b.dataset.catopt; state.openDD = null; apply(); });
    document.querySelectorAll("[data-colopt]").forEach((b) =>
      b.onclick = () => { const c = b.dataset.colopt; state.colours.has(c) ? state.colours.delete(c) : state.colours.add(c); state.openDD = "colour"; apply(); });
    document.querySelectorAll("[data-size]").forEach((b) =>
      b.onclick = () => { const s = b.dataset.size; state.sizes.has(s) ? state.sizes.delete(s) : state.sizes.add(s); apply(); });
    const stockBtn = document.querySelector("[data-instock]");
    if (stockBtn) stockBtn.onclick = () => { state.inStock = !state.inStock; apply(); };
    document.querySelectorAll("[data-clear]").forEach((b) =>
      b.onclick = () => { state.cat = "ALL"; state.colours.clear(); state.sizes.clear(); state.inStock = false; state.openDD = null; apply(); });
  };

  // close an open dropdown on outside click or Escape (a link click still navigates)
  const closeDD = (e) => {
    if (!state.openDD) return;
    if (e.target.closest && e.target.closest(".dd")) return;
    state.openDD = null;
    if (e.target.closest && e.target.closest("a")) return;
    render();
  };
  document.addEventListener("click", closeDD);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && state.openDD) { state.openDD = null; render(); } });

  render();
  document.addEventListener("langchange", render);
  window.addEventListener("popstate", () => { readURL(); render(); });
}

/* ---- product -------------------------------------------------------------- */
function initProduct() {
  const handle = new URLSearchParams(location.search).get("handle");
  loadProducts().then(() => {
    const p = productByHandle(handle);
    if (!p) { location.replace((document.body.dataset.root || "") + "index.html"); return; }
    document.title = `${L(p.title)} · ${CONFIG.brand}`;
    const isBag = p.kind === "bag";
    // colour deep-link: ?colour=CODE preselects it, otherwise the first in-stock colour
    const wanted = new URLSearchParams(location.search).get("colour");
    const state = {
      colour: (wanted && p.options.colour.includes(wanted) ? wanted : null)
        || p.options.colour.find((c) => stockForColour(p, c) > 0) || p.options.colour[0],
      size: isBag ? "OS" : null,
      img: 0,
    };

    // keep the URL in step with the chosen colour (shareable, back/forward-safe)
    function syncColourURL() {
      const root = document.body.dataset.root || "";
      history.replaceState(null, "", `${root}product.html?handle=${p.handle}&colour=${state.colour}`);
    }
    if (wanted && p.options.colour.includes(wanted)) syncColourURL();

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
          syncColourURL(); render();
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
    window.addEventListener("popstate", () => {
      const c = new URLSearchParams(location.search).get("colour");
      if (c && p.options.colour.includes(c) && c !== state.colour) { state.colour = c; state.img = 0; render(); }
    });
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
            <a class="btn btn--wa btn--block" id="wabtn" href="${whatsappHref()}" target="_blank" rel="noopener" style="margin-top:14px">💬 ${t("checkout_wa")}</a>
            <p class="muted" style="font-size:12.5px;margin-top:10px">${t("cod_note")}</p>
            <a href="${root}index.html" class="link-inline" style="font-size:14px">${t("continue")}</a>
          </aside>
        </div></div>`;
      document.querySelectorAll("[data-inc]").forEach((b) => b.onclick = () => { const l = store.cart.find(i => i.sku === b.dataset.inc); setQty(b.dataset.inc, l.qty + 1); render(); });
      document.querySelectorAll("[data-dec]").forEach((b) => b.onclick = () => { const l = store.cart.find(i => i.sku === b.dataset.dec); setQty(b.dataset.dec, l.qty - 1); render(); });
      document.querySelectorAll("[data-rm]").forEach((b) => b.onclick = () => { setQty(b.dataset.rm, 0); render(); });
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

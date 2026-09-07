# SOFIA — bilingual storefront

A static, no-build storefront for a Lebanese shoes & bags shop, built from the
shop-build pack (Foundation Pack, Customer Text Pack, Photography Kit, Counter
Rules, Shopify product template). Fully bilingual **English / Arabic** with
right-to-left support, and a **cash-on-delivery + WhatsApp** checkout — since
Shopify Payments is not available in Lebanon.

## What's here

| Page | File | Notes |
|------|------|-------|
| Shop / home | `index.html` | Hero + product grid (shoes, bags) |
| Product | `product.html?handle=…` | Colour & size variants, live stock, gallery |
| Cart | `cart.html` | Quantities, totals, WhatsApp order |
| Size guide | `size-guide.html` | Measuring steps + EU/cm/UK/US table |
| Delivery & payment | `delivery.html` | From the Customer Text Pack |
| Returns & exchanges | `returns.html` | From the Customer Text Pack |

- `data/products.json` — the two example products (Nora pump, Layla crossbody)
  with per-SKU stock, straight from the Shopify template & Opening Count.

The shop page filters (category, colour, size, in-stock-only) are synced to
the URL query string — e.g. `index.html?cat=HEEL&colour=BLK,BEI&size=38&instock=1`
— so a filtered view can be shared or bookmarked, and the back button works.
Unknown values in the query are ignored.

- `assets/site.js` — config, bilingual UI strings, cart, WhatsApp checkout.
- `assets/content.js` — long-form policy/size-guide copy (EN + AR).
- `assets/pages.js` — page renderers.
- `assets/img/*.svg` — **placeholder** studio images, named `STYLE-COLOUR-N.svg`
  per the Photography Kit. Replace with real photos (same names) when shot.
- `scripts/gen_images.py` — regenerates the placeholder images.

## Run it

It's fully static — open over any web server (needed because it `fetch`es JSON):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000/
```

## Before you go live — replace the placeholders

All six "Before you publish" decisions from the Customer Text Pack live at the
top of **`assets/site.js`** in the `CONFIG` object. Change them there and every
page (copy, checkout, footer) updates:

| Setting | Placeholder | Decision it maps to |
|---------|-------------|---------------------|
| `whatsapp` | `96170000000` | Shop's real WhatsApp number (digits only) |
| `deliveryFee` | `3` | One flat delivery fee |
| `deliveryDays` | 1–2 / 2–4 | Delivery time promise |
| `returnWindowDays` | `3` | Return window |
| `currency` | USD `$` | Price currency |
| `brand` / `instagram` | `SOFIA` / `yourshop` | Shop name & handle |

Return-delivery responsibility (customer pays, except faults) and refund vs.
store-credit are written into `returns.html` copy in `assets/content.js`.

Then swap the placeholder SVGs in `assets/img/` for the real product photos and
add new products to `data/products.json`.

## Adding a product

Append an object to `data/products.json` following the existing shape
(`handle`, `title`/`type`/`material`/`description` as `{en, ar}` pairs,
`options`, `colours`, and one `variants` row per SKU with a `stock` count).
Colour codes and categories follow the locked lists in the Foundation Pack.

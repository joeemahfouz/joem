# Scope — Custom BELLUCCI Shopify theme

**Goal:** rebuild the current BELLUCCI storefront as a real **Shopify Online
Store 2.0 theme (Liquid)**, so the shop gains Shopify's admin + Orders while
keeping the exact look and the "Made in Spain" features. Not headless — a normal
theme you edit in Shopify's Theme Editor, no extra hosting.

The single biggest change: **checkout stops being a WhatsApp deep-link and
becomes real Shopify checkout** (cash on delivery + Whish/OMT as manual
methods). That is the whole point of moving — it's what gives you the Orders
dashboard. A WhatsApp "questions?" button can stay as a helper, not as checkout.

---

## How we'd work (given I can't log into your store)
I build the theme as files in this repo (a Shopify theme folder) and hand you a
theme package to upload via **Shopify CLI** or **admin → Themes → Upload zip**.
I can't push to your store or create the account. You do the Shopify-side config
(metafields, payments, Search & Discovery, translations) — the steps are short
and I'll write them out. You run the test order; I can't reach live checkout.

## What carries over vs. what gets rebuilt

| Current site | In the Shopify theme | Effort |
|---|---|---|
| `site.css` tokens & components | Port almost 1:1 into theme CSS | Low |
| Cormorant + Jost fonts | Theme font loading | Low |
| 3-band header (origin / brand / proof) | Custom `header` section with editable settings | Medium |
| Hero (eyebrow, H1, CTAs, pills) | `hero` section with settings | Low |
| Product grid + **filters** (category/colour/size/in-stock/Made-in-Spain) | Shopify **Search & Discovery** faceted filters from tags/metafields + styled filter UI | **High** |
| Product page (variant picker, gallery, spec, origin row) | `product` template + variant picker | Medium |
| Cart + "Order on WhatsApp" | Shopify cart + **real checkout** (COD + manual) | Medium |
| Origin badge / Made-in-Spain (from JSON) | Product **metafield** `origin` drives badge + filter | Medium |
| Brand wall (Spanish houses) | Section with blocks (name + logo image), merchant-editable | Low |
| EN/AR toggle + RTL (in-page) | Shopify native multi-language (locale files) + RTL CSS | **High** |
| Size guide / delivery / returns | Shopify pages + section templates | Low |
| `products.json` | Shopify products, variants, inventory, metafields | Medium |

## Data model (define once in Shopify)
- **Variant options:** Colour, Size (bags = one size). → Shopify variants.
- **Stock:** Shopify inventory, policy "deny" (already set in the import CSV).
- **Metafields (product):** `origin` (code + label), `heel_height`, `heel_band`,
  `dimensions`, `strap_drop`, `material`, `care`, `brand`. These power the spec
  table, the origin badge, and the filters.
- **Tags:** colour/material/category/origin (the import CSV already writes these).

## Phased plan

| Phase | Work | Rough effort* |
|---|---|---|
| 0 · Prep | Dev store, metafield definitions, Search & Discovery + Translate & Adapt apps, sample data | 0.5–1 day (mostly your side) |
| 1 · Skeleton | OS 2.0 theme scaffold, design tokens/fonts, header (3 bands), footer, hero, base styles | 2–3 days |
| 2 · Collection + filters | Product grid, cards + origin badge, Search & Discovery config, filter UI styling | 3–4 days |
| 3 · Product page | Variant picker, gallery, spec + origin row, add-to-cart | 2–3 days |
| 4 · Content + cart | Brand wall section, size guide / delivery / returns, cart styling | 1–2 days |
| 5 · Bilingual + RTL | Locale files (EN/AR), RTL, translated content | 2–3 days |
| 6 · QA + launch | Cross-device, RTL, accessibility, a real test order, perf, go live | 1–2 days |

*Rough planning ranges for the theme build. Your Shopify-side config and testing
are additional and depend on how fast decisions and photos land. Total build:
roughly **10–16 working days**, phaseable — Phases 1–3 already give a working,
good-looking shop.

## Decisions I need from you
1. **Checkout:** confirm real Shopify checkout (COD + Whish/OMT) replaces the
   WhatsApp deep-link. Keep a WhatsApp contact button? (recommended: yes, as help)
2. **Filters:** Shopify's faceted filtering covers category/colour/size/in-stock
   and a "Made in Spain" facet. The bespoke touches (colour-swatch dropdown, the
   exact variant-level in-stock intersection) are rebuildable with metafields +
   custom section code — confirm that parity matters or a standard filter set is fine.
2b. **Brands & logos:** the final brand list and logo image files.
3. **Photos:** real product photos (the theme can't ship with placeholders).
4. **Origins:** final per-product origin (and whether the two demo "Made in
   Portugal" items stay).
5. **Arabic:** confirm native Shopify multi-language (recommended) over an
   in-page toggle.

## Risks & caveats
- **Checkout can't be previewed by me** without your store — you test the order.
- **Filter parity** is the trickiest item; Shopify filters are strong but the
  exact custom behaviours may need metafields + a custom section.
- **Ongoing cost/maintenance:** Shopify's monthly fee, and theme updates are
  yours to own (a custom theme doesn't auto-update).
- **Not for the Theme Store** — this is a private custom theme; no review needed.

## Out of scope (this phase)
Headless/Hydrogen; apps beyond Search & Discovery + Translate & Adapt; custom
payment-gateway development; marketing/SEO beyond on-page basics; a separate
mobile app.

## Recommendation
OS 2.0 theme · real Shopify checkout (COD + manual) · metafield-driven origin &
specs · Search & Discovery filters · native EN/AR. Start with Phases 1–3 to get
a live, on-brand shop fast, then layer in content, bilingual and QA.

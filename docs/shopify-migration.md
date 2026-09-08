# Moving BELLUCCI to Shopify

This gives you the two things a static site can't: a proper **admin** to add and
edit products, and an **Orders** dashboard that records every checkout. It fits
Lebanon — Shopify Payments isn't available there, so checkout is **cash on
delivery + a manual method (Whish / OMT)**, both free to add.

What I can prepare (done): the product import file and this runbook.
What only you can do: create the account, enter billing, and run the admin
steps below. I can't log into your store.

---

## 1. Create the store
1. Go to shopify.com and start a store (there's a free trial).
2. Set the store currency to **USD** and the address to Lebanon.

## 2. Set up payments (Lebanon)
Shopify Payments won't be offered. Instead, under **Settings → Payments**:
- **Cash on Delivery (COD):** add the built-in "Cash on Delivery (COD)" manual
  payment method. This is your main method.
- **Whish / OMT:** add a **manual payment method** named e.g. "Whish / OMT
  transfer". In its instructions, tell the customer to send payment and reply
  with the reference number (same wording as your Customer Text Pack).

## 3. Import the products
1. **Products → Import**, upload `exports/bellucci-shopify-products.csv`.
2. Import as **draft** (the file already sets Status = draft, Published = FALSE),
   so nothing goes live before you're ready.
3. The file loads all 10 styles with their colours, sizes, per-SKU stock,
   prices, SKUs, tags and SEO. Inventory policy is **deny** (this is what stops
   overselling on COD) and the tracker is **shopify**.

> Re-generating the file: if you change `data/products.json`, run
> `python3 scripts/build_shopify_csv.py` to rebuild the CSV.

## 4. Add photos
The CSV has **no images** on purpose — the current site uses placeholders. Per
product, either:
- open the product in the admin and drag in the real photos (name them per the
  Photography Kit, position 1 = the grid shot, and set each colour's variant
  image), or
- host the photos somewhere public and add their URLs to the CSV's
  `Product image URL` / `Variant image URL` columns before importing.

## 5. Arabic
Add Shopify's free **Translate & Adapt** app and translate titles, descriptions
and theme text to Arabic. Enable Arabic as a store language so the storefront
serves RTL — mirroring what the current bilingual site does.

## 6. The look
Two options:
- Start with a clean Shopify theme (e.g. Dawn) and set the brand fonts/colours
  to match BELLUCCI. Fastest.
- I adapt the current BELLUCCI design (the "Made in Spain" header, brand wall,
  origin badges) into a **custom Shopify theme (Liquid)**. This is a separate,
  larger piece of work — ask me and I'll scope it.

## 7. Go live
When photos and stock are confirmed, set each product to **Active** and
**Published**, connect your domain, and place one test order end to end.

---

## Where your orders live
Every checkout appears under **Orders** in the admin: customer, items, address,
total, and payment/fulfilment status. You mark COD orders paid when the courier
returns the cash, and fulfilled when they ship — the same discipline as your
Counter Rules, now tracked for you. You can still confirm each order on WhatsApp
before dispatch; Shopify just becomes the record of truth.

## Keep the counter rules
The stock accuracy rules from your build pack still apply: one SKU format across
the POS, the site and the count; the weekly spot check; only the count owner
edits a number. Shopify's inventory replaces the spreadsheet, not the routine.

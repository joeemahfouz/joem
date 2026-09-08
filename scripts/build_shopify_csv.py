#!/usr/bin/env python3
"""Generate a Shopify product-import CSV from data/products.json.

Column layout and rules follow the "Shopify CSV Map" tab of the Foundation
Pack: one row per variant, product-level fields on the first row of each
product only, Inventory policy "deny" (stops overselling on COD), tracker
"shopify", status "draft" until photos + stock are confirmed.

Run:  python3 scripts/build_shopify_csv.py
Out:  exports/bellucci-shopify-products.csv
"""
import csv, json, os

ROOT = os.path.join(os.path.dirname(__file__), "..")
OUT_DIR = os.path.join(ROOT, "exports")
os.makedirs(OUT_DIR, exist_ok=True)

VENDOR = "BELLUCCI"            # set to the actual brand (Pepe Moll, etc.) per product if you prefer
SHOE_WEIGHT_G = 800           # sensible defaults — adjust per style in Shopify
BAG_WEIGHT_G = 600

HEADERS = [
    "URL handle", "Title", "Description", "Vendor", "Product category", "Type", "Tags",
    "Published on online store", "Status", "Option1 name", "Option1 value", "Option2 name",
    "Option2 value", "SKU", "Barcode", "Price", "Compare-at price", "Cost per item",
    "Charge tax", "Inventory tracker", "Inventory quantity", "Continue selling when out of stock",
    "Weight value (grams)", "Weight unit for display", "Requires shipping", "Fulfillment service",
    "Product image URL", "Image position", "Image alt text", "Variant image URL", "Gift card",
    "SEO title", "SEO description",
]

MATERIAL_CODE = {
    "Genuine leather": "LTHR", "Faux leather": "FAUX", "Suede": "SUED", "Faux suede": "FSUE",
    "Patent": "PATN", "Canvas": "CANV", "Satin": "SATN", "Mesh / Knit": "KNIT", "Straw / Raffia": "STRW",
}
SHOP_CATEGORY = {
    "shoe": "Apparel & Accessories > Shoes",
    "bag": "Apparel & Accessories > Handbags, Wallets & Cases > Handbags",
}


def heel_band_code(cm):
    if cm is None:
        return None
    if cm <= 1: return "H0"
    if cm <= 4: return "H1"
    if cm <= 7: return "H2"
    if cm <= 10: return "H3"
    return "H4"


def tags_for(p):
    t = [p["category_code"]]
    mat = MATERIAL_CODE.get(p["material"]["en"])
    if mat: t.append(mat)
    if p["kind"] == "shoe":
        hb = heel_band_code(p.get("heel_cm"))
        if hb: t.append(hb)
    t += [c["code"] for c in p["colours"]]
    t.append(p["origin"]["code"])
    if p["origin"]["code"] == "ES":
        t.append("Made in Spain")
    return ",".join(t)


def colour_name(p, code):
    for c in p["colours"]:
        if c["code"] == code:
            return c["en"]
    return code


def main():
    products = json.load(open(os.path.join(ROOT, "data", "products.json"), encoding="utf-8"))["products"]
    rows = []
    for p in products:
        first = True
        weight = SHOE_WEIGHT_G if p["kind"] == "shoe" else BAG_WEIGHT_G
        for v in p["variants"]:
            is_bag = v["size"] == "OS"
            row = {h: "" for h in HEADERS}
            row["URL handle"] = p["handle"]
            row["Option1 name"] = "Colour"
            row["Option1 value"] = colour_name(p, v["colour"])
            if not is_bag:
                row["Option2 name"] = "Size"
                row["Option2 value"] = v["size"]
            row["SKU"] = v["sku"]
            row["Price"] = f"{p['price']:.2f}"
            if p.get("compare_at"):
                row["Compare-at price"] = f"{p['compare_at']:.2f}"
            row["Charge tax"] = "TRUE"
            row["Inventory tracker"] = "shopify"
            row["Inventory quantity"] = v["stock"]
            row["Continue selling when out of stock"] = "deny"
            row["Weight value (grams)"] = weight
            row["Weight unit for display"] = "g"
            row["Requires shipping"] = "TRUE"
            row["Fulfillment service"] = "manual"
            row["Gift card"] = "FALSE"
            if first:
                row["Title"] = p["title"]["en"]
                row["Description"] = f"<p>{p['description']['en']}</p>"
                row["Vendor"] = VENDOR
                row["Product category"] = SHOP_CATEGORY[p["kind"]]
                row["Type"] = p["type"]["en"]
                row["Tags"] = tags_for(p)
                row["Published on online store"] = "FALSE"   # FALSE while loading; TRUE at launch
                row["Status"] = "draft"                       # draft until photos + stock confirmed
                row["SEO title"] = f"{p['title']['en']} | {VENDOR}"
                row["SEO description"] = p["description"]["en"]
                first = False
            rows.append(row)

    out = os.path.join(OUT_DIR, "bellucci-shopify-products.csv")
    with open(out, "w", newline="", encoding="utf-8-sig") as f:  # utf-8-sig so Excel opens it clean
        w = csv.DictWriter(f, fieldnames=HEADERS)
        w.writeheader()
        w.writerows(rows)
    print(f"wrote {out}: {len(rows)} rows from {len(products)} products")


if __name__ == "__main__":
    main()

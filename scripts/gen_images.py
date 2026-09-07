#!/usr/bin/env python3
"""Generate studio-style placeholder SVGs for every product / colour / shot.
Driven by data/products.json so the filenames always match the catalogue.
Each silhouette is built from simple primitives (low risk of broken paths);
real photography-kit photos replace these later under the same names."""
import json, os

ROOT = os.path.join(os.path.dirname(__file__), "..")
OUT = os.path.join(ROOT, "assets", "img")
os.makedirs(OUT, exist_ok=True)

SHOE_LABELS = ["three-quarter", "side profile", "sole", "detail"]
BAG_LABELS = ["front", "side / depth", "interior", "held"]


def stroke_for(hexcol):
    h = hexcol.lstrip("#")
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    return "#3a332b" if lum > 150 else "none"


def darker(hexcol, f=0.72):
    h = hexcol.lstrip("#")
    r, g, b = [int(int(h[i:i+2], 16) * f) for i in (0, 2, 4)]
    return f"#{r:02x}{g:02x}{b:02x}"


def frame(inner, label):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" role="img" aria-label="{label}">
  <defs><radialGradient id="s" cx="50%" cy="38%" r="75%">
    <stop offset="0%" stop-color="#ffffff"/><stop offset="70%" stop-color="#f4f1ec"/><stop offset="100%" stop-color="#e9e4dc"/>
  </radialGradient></defs>
  <rect width="600" height="600" fill="url(#s)"/>
  <ellipse cx="300" cy="474" rx="190" ry="26" fill="#000000" opacity="0.08"/>
  {inner}
  <text x="300" y="558" text-anchor="middle" font-family="Georgia, serif" font-size="21" fill="#8a8175" letter-spacing="1.5">{label}</text>
</svg>'''


# ---- single silhouettes (drawn once, centred ~ x300 / baseline ~ y440) ------
def sil_heel(c):
    st = stroke_for(c); sw = 2.5 if st != "none" else 0
    body = ('M120,398 C185,378 265,370 360,372 C420,373 452,380 470,390 '
            'C477,393 477,401 470,403 L128,406 C116,406 110,402 120,398 Z')
    heel = 'M452,401 L472,401 L446,486 L430,479 Z'
    return (f'<path d="{body}" fill="{c}" stroke="{st}" stroke-width="{sw}"/>'
            f'<path d="{heel}" fill="{c}" stroke="{st}" stroke-width="{sw}"/>'
            f'<path d="M150,392 C215,376 300,372 380,378" fill="none" stroke="#00000022" stroke-width="6"/>')


def sil_flat(c):
    st = stroke_for(c); sw = 2.5 if st != "none" else 0
    body = ('M120,420 C190,398 275,390 365,392 C420,393 452,400 470,410 '
            'C477,413 477,421 470,423 L128,426 C116,426 110,424 120,420 Z')
    return (f'<path d="{body}" fill="{c}" stroke="{st}" stroke-width="{sw}"/>'
            f'<path d="M155,414 C220,398 305,394 388,400" fill="none" stroke="#00000022" stroke-width="6"/>'
            f'<circle cx="182" cy="410" r="9" fill="{darker(c)}"/>')  # little bow


def sil_sneaker(c):
    st = stroke_for(c); sw = 2.5 if st != "none" else 0
    sole = f'<rect x="132" y="404" width="336" height="34" rx="17" fill="{darker(c,0.55)}"/>'
    upper = (f'<path d="M150,406 L150,392 C150,360 200,346 272,346 L300,346 '
             f'C362,348 430,360 452,386 L452,406 Z" fill="{c}" stroke="{st}" stroke-width="{sw}"/>')
    toe = f'<path d="M150,406 C150,374 172,358 200,358 C206,382 196,402 172,406 Z" fill="{darker(c)}"/>'
    laces = ''.join(f'<line x1="{300+i*26}" y1="360" x2="{318+i*26}" y2="386" stroke="#ffffffaa" stroke-width="5"/>' for i in range(3))
    collar = f'<path d="M430,352 C446,356 452,372 448,388" fill="none" stroke="{darker(c)}" stroke-width="8"/>'
    return sole + upper + toe + laces + collar


def sil_sandal(c):
    st = stroke_for(c); sw = 2.5 if st != "none" else 0
    footbed = f'<path d="M150,430 C230,414 360,410 440,420 C452,421 452,432 440,434 L160,438 C148,438 142,434 150,430 Z" fill="{c}" stroke="{st}" stroke-width="{sw}"/>'
    heel = f'<path d="M418,432 L444,432 L438,486 L416,480 Z" fill="{c}" stroke="{st}" stroke-width="{sw}"/>'
    straps = (f'<path d="M196,428 Q262,384 326,420" fill="none" stroke="{c}" stroke-width="14" stroke-linecap="round"/>'
              f'<path d="M250,428 Q312,378 372,418" fill="none" stroke="{c}" stroke-width="14" stroke-linecap="round"/>')
    return footbed + heel + straps


def sil_boot(c):
    st = stroke_for(c); sw = 2.5 if st != "none" else 0
    sole = f'<rect x="140" y="420" width="292" height="24" rx="8" fill="{darker(c,0.55)}"/>'
    body = (f'M150,420 C150,394 182,384 222,384 L300,384 L300,214 '
            f'C300,204 312,198 326,198 L392,198 C406,198 412,206 412,216 L412,420 Z')
    heel = f'<rect x="392" y="418" width="30" height="26" rx="4" fill="{darker(c,0.55)}"/>'
    tab = f'<rect x="398" y="196" width="14" height="30" rx="6" fill="{darker(c)}"/>'
    return f'<path d="{body}" fill="{c}" stroke="{st}" stroke-width="{sw}"/>' + heel + sole + tab


def sil_wedge(c):
    st = stroke_for(c); sw = 2.5 if st != "none" else 0
    cork = "#cdb48c"
    wedge = f'<path d="M150,436 L432,436 L432,352 Z" fill="{cork}" stroke="#00000022" stroke-width="2"/>'
    upper = (f'<path d="M158,430 C210,392 320,382 424,392 L424,360 C330,352 220,360 168,398 Z" '
             f'fill="{c}" stroke="{st}" stroke-width="{sw}"/>')
    band = f'<path d="M170,420 C240,398 340,394 420,404" fill="none" stroke="{darker(c)}" stroke-width="6"/>'
    return wedge + upper + band


def sil_crossbody(c):
    st = stroke_for(c); sw = 2.5 if st != "none" else 0
    strap = f'<path d="M212,300 Q300,150 388,300" fill="none" stroke="{c}" stroke-width="16" stroke-linecap="round" opacity="0.92"/>'
    body = f'<rect x="200" y="296" width="200" height="168" rx="26" fill="{c}" stroke="{st}" stroke-width="{sw}"/>'
    flap = (f'<path d="M200,322 v-4 a26,26 0 0 1 26,-22 h148 a26,26 0 0 1 26,22 v34 '
            f'a18,18 0 0 1 -18,18 h-164 a18,18 0 0 1 -18,-18 z" fill="{c}" stroke="{st}" stroke-width="{sw}"/>')
    clasp = '<rect x="288" y="346" width="24" height="16" rx="4" fill="#c9a227"/>'
    return strap + body + flap + clasp


def sil_tote(c):
    st = stroke_for(c); sw = 2.5 if st != "none" else 0
    h1 = f'<path d="M236,306 Q262,236 300,306" fill="none" stroke="{darker(c,0.6)}" stroke-width="12"/>'
    h2 = f'<path d="M300,306 Q338,236 364,306" fill="none" stroke="{darker(c,0.6)}" stroke-width="12"/>'
    body = f'<path d="M182,306 h236 l-14,164 h-208 z" fill="{c}" stroke="{st}" stroke-width="{sw}"/>'
    seam = f'<line x1="188" y1="330" x2="412" y2="330" stroke="#00000018" stroke-width="4"/>'
    return h1 + h2 + body + seam


def sil_clutch(c):
    st = stroke_for(c); sw = 2.5 if st != "none" else 0
    body = f'<rect x="168" y="330" width="264" height="122" rx="16" fill="{c}" stroke="{st}" stroke-width="{sw}"/>'
    flap = f'<path d="M168,346 v-0 a16,16 0 0 1 16,-16 h232 a16,16 0 0 1 16,16 v34 h-264 z" fill="{darker(c,0.85)}"/>'
    clasp = '<rect x="288" y="356" width="24" height="14" rx="7" fill="#c9a227"/>'
    return body + flap + clasp


def sil_shoulder(c):
    st = stroke_for(c); sw = 2.5 if st != "none" else 0
    strap = f'<path d="M212,300 Q300,208 388,300" fill="none" stroke="{c}" stroke-width="15" stroke-linecap="round"/>'
    body = f'<rect x="190" y="300" width="220" height="172" rx="22" fill="{c}" stroke="{st}" stroke-width="{sw}"/>'
    flap = (f'<path d="M190,326 v-4 a22,22 0 0 1 22,-22 h176 a22,22 0 0 1 22,22 v38 '
            f'a16,16 0 0 1 -16,16 h-188 a16,16 0 0 1 -16,-16 z" fill="{c}" stroke="{st}" stroke-width="{sw}"/>')
    clasp = '<rect x="288" y="350" width="24" height="16" rx="4" fill="#c9a227"/>'
    return strap + body + flap + clasp


SHOE_DRAW = {"HEEL": sil_heel, "FLAT": sil_flat, "SNKR": sil_sneaker, "SAND": sil_sandal,
             "BOOT": sil_boot, "WEDG": sil_wedge, "MULE": sil_flat}
BAG_DRAW = {"CROS": sil_crossbody, "TOTE": sil_tote, "CLCH": sil_clutch, "SHLD": sil_shoulder,
            "BPCK": sil_shoulder, "WLET": sil_clutch}


# ---- shot decorators --------------------------------------------------------
def pairize(inner):
    return (f'<g transform="translate(-40,54) scale(0.94)" opacity="0.5">{inner}</g>'
            f'<g transform="translate(30,-4)">{inner}</g>')


def zoomed(inner):
    return f'<g transform="translate(-150,-140) scale(1.55)">{inner}</g>'


def with_sole(inner):
    return inner + '<path d="M155,392 C235,376 345,372 452,384" fill="none" stroke="#00000030" stroke-width="10" stroke-dasharray="2 12"/>'


def opened(inner):
    return inner + '<rect x="216" y="312" width="168" height="116" rx="12" fill="#efe9df"/><rect x="234" y="332" width="132" height="9" rx="4" fill="#00000018"/><rect x="234" y="356" width="86" height="9" rx="4" fill="#00000012"/>'


def held(inner):
    return f'<line x1="300" y1="66" x2="300" y2="150" stroke="#d8d0c4" stroke-width="40" stroke-linecap="round"/>{inner}'


def build_shoe(draw, c, i):
    s = draw(c)
    if i == 0:
        return pairize(s)
    if i == 2:
        return with_sole(s)
    if i == 3:
        return zoomed(s)
    return s


def build_bag(draw, c, i):
    s = draw(c)
    if i == 2:
        return opened(s)
    if i == 3:
        return held(s)
    return s


products = json.load(open(os.path.join(ROOT, "data", "products.json"), encoding="utf-8"))["products"]
count = 0
for p in products:
    is_bag = p["kind"] == "bag"
    labels = BAG_LABELS if is_bag else SHOE_LABELS
    draw = (BAG_DRAW if is_bag else SHOE_DRAW).get(p["category_code"], sil_crossbody if is_bag else sil_flat)
    for col in p["colours"]:
        c = "#" + col["hex"]
        for i, fn in enumerate(col["images"]):
            inner = build_bag(draw, c, i) if is_bag else build_shoe(draw, c, i)
            open(os.path.join(OUT, fn), "w", encoding="utf-8").write(frame(inner, labels[i]))
            count += 1
print(f"wrote {count} images to assets/img/ for {len(products)} products")

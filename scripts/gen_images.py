#!/usr/bin/env python3
"""Generate studio-style placeholder SVGs for each product / colour / shot.
These stand in for the real photography-kit photos until they are shot.
Every file is named STYLE-COLOUR-N.svg to match the SKU / photo naming rule."""
import os

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "img")
os.makedirs(OUT, exist_ok=True)

# soft studio sweep + grounding shadow, shared by every placeholder
def frame(inner, label, hexcol):
    light = "#f4f1ec"
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" role="img" aria-label="{label}">
  <defs>
    <radialGradient id="sweep" cx="50%" cy="38%" r="75%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="{light}"/>
      <stop offset="100%" stop-color="#e9e4dc"/>
    </radialGradient>
  </defs>
  <rect width="600" height="600" fill="url(#sweep)"/>
  <ellipse cx="300" cy="470" rx="190" ry="26" fill="#000000" opacity="0.08"/>
  {inner}
  <text x="300" y="556" text-anchor="middle" font-family="Georgia, serif" font-size="21"
        fill="#8a8175" letter-spacing="1.5">{label}</text>
</svg>'''

def stroke_for(hexcol):
    # give pale products a readable outline
    h = hexcol.lstrip('#')
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    return "#3a332b" if lum > 150 else "none"

def pump(hexcol, variant):
    """variant: 0=3/4 pair, 1=side, 2=sole, 3=detail"""
    st = stroke_for(hexcol)
    sw = 2.5 if st != "none" else 0
    # side profile pump, toe to the left, visible heel
    body = ('M120,398 C185,378 265,370 360,372 C420,373 452,380 470,390 '
            'C477,393 477,401 470,403 L128,406 C116,406 110,402 120,398 Z')
    heel = 'M452,401 L472,401 L446,486 L430,479 Z'
    topline = ('<path d="M150,392 C215,376 300,372 380,378" fill="none" '
               f'stroke="#00000022" stroke-width="6"/>')
    one = (f'<path d="{body}" fill="{hexcol}" stroke="{st}" stroke-width="{sw}"/>'
           f'<path d="{heel}" fill="{hexcol}" stroke="{st}" stroke-width="{sw}"/>'
           f'{topline}')
    if variant == 0:  # three-quarter pair: two offset shoes
        back = one.replace('398', '398')  # same shape, shifted via group
        return (f'<g transform="translate(-38,52) scale(0.94)" opacity="0.55">{one}</g>'
                f'<g transform="translate(28,-6)">{one}</g>')
    if variant == 2:  # sole view — flip and add sole panel
        return (f'<g transform="translate(0,10)">{one}</g>'
                f'<path d="M150,392 C230,376 340,372 448,384" fill="none" '
                f'stroke="#00000030" stroke-width="10" stroke-dasharray="2 12"/>')
    if variant == 3:  # detail — zoom on heel/vamp
        return f'<g transform="translate(-140,-120) scale(1.7)">{one}</g>'
    return f'<g transform="translate(0,4)">{one}</g>'  # side

def bag(hexcol, variant):
    st = stroke_for(hexcol)
    sw = 2.5 if st != "none" else 0
    strap = ('<path d="M212,296 Q300,150 388,296" fill="none" '
             f'stroke="{hexcol}" stroke-width="16" stroke-linecap="round" '
             f'opacity="0.92"/>')
    bodyrect = f'<rect x="196" y="292" width="208" height="172" rx="26" fill="{hexcol}" stroke="{st}" stroke-width="{sw}"/>'
    flap = ('<path d="M196,318 v-2 a26,26 0 0 1 26,-24 h156 a26,26 0 0 1 26,24 v34 '
            'a18,18 0 0 1 -18,18 h-172 a18,18 0 0 1 -18,-18 z" '
            f'fill="{hexcol}" stroke="{st}" stroke-width="{sw}"/>')
    shade = '<rect x="196" y="292" width="208" height="172" rx="26" fill="#000000" opacity="0.06"/>'
    clasp = '<rect x="288" y="344" width="24" height="16" rx="4" fill="#c9a227"/>'
    if variant == 2:  # interior — open flap, lining
        return (strap + bodyrect
                + '<rect x="212" y="308" width="176" height="120" rx="14" fill="#efe9df"/>'
                + '<rect x="230" y="330" width="140" height="10" rx="5" fill="#00000018"/>'
                + '<rect x="230" y="356" width="90" height="10" rx="5" fill="#00000012"/>'
                + clasp)
    if variant == 1:  # side / depth — narrow body
        return (strap
                + f'<rect x="266" y="292" width="70" height="172" rx="18" fill="{hexcol}" stroke="{st}" stroke-width="{sw}"/>'
                + '<rect x="266" y="292" width="70" height="30" rx="12" fill="#00000018"/>')
    if variant == 3:  # held — with a suggestion of a shoulder line
        return (f'<line x1="300" y1="70" x2="300" y2="150" stroke="#d8d0c4" stroke-width="40" stroke-linecap="round"/>'
                + strap + bodyrect + flap + clasp)
    return strap + bodyrect + flap + clasp  # front

SHOE_LABELS = ["three-quarter", "side profile", "sole", "detail"]
BAG_LABELS = ["front", "side / depth", "interior", "held"]

jobs = [
    ("HL014", "BLK", "111111", pump, SHOE_LABELS),
    ("HL014", "BEI", "D7C4A3", pump, SHOE_LABELS),
    ("BG007", "TAN", "B08D57", bag, BAG_LABELS),
    ("BG007", "BLK", "111111", bag, BAG_LABELS),
]

count = 0
for style, col, hexcol, drawer, labels in jobs:
    for i, lab in enumerate(labels):
        svg = frame(drawer("#" + hexcol, i), lab, hexcol)
        fn = f"{style.lower()}-{col.lower()}-{i+1}.svg"
        with open(os.path.join(OUT, fn), "w", encoding="utf-8") as f:
            f.write(svg)
        count += 1
print(f"wrote {count} images to assets/img/")

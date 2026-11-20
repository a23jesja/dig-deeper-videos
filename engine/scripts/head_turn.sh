#!/usr/bin/env bash
# The turn sheet (the review of step 1): every tenth frame of the three unbroken turns in the film head-turn (headSheet.ts), one row
# each, with the true angle, the drawn angle and whether the shot's mirror image is on.   usage: bash scripts/head_turn.sh <out.jpg>
set -e; OUT="$1"; T="${REMOTION_TMP:-/tmp}/headturn"; mkdir -p "$T"
FR=""; for s in 0 1 2; do for f in 0 10 20 30 40 50 60 70 80; do FR="$FR,$((s * 81 + f))"; done; done
node scripts/stills.mjs HeadTurn "$T/t" "${FR#,}" 0.5 > /dev/null
python - "$T" "$OUT" <<'PY'
import sys
from PIL import Image, ImageDraw, ImageFont
T, OUT = sys.argv[1], sys.argv[2]; cw, ch = 240, 330
F = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 17); FB = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 20)
rows = [("A: 0 -> 80", 0, 80, False), ("B: 0 -> 280", 0, -80, False), ("C: 280 -> 0", -80, 0, True)]
sheet = Image.new("RGB", (cw * 9 + 150, ch * 3), "white"); d = ImageDraw.Draw(sheet)
def drawn(a):
    a = abs(a); return a if a <= 45 else 45 + (a - 45) * 11 / 45 if a <= 90 else 56 + (a - 90) * 54 / 20
for r, (name, d0, d1, mir) in enumerate(rows):
    d.text((8, r * ch + 120), name, fill="black", font=FB); d.text((8, r * ch + 150), "spegling " + ("PÅ" if mir else "av"), fill="black", font=F); d.text((8, r * ch + 172), "(låst för bilden)", fill="black", font=F)
    for c, f in enumerate(range(0, 81, 10)):
        im = Image.open(f"{T}/t{r * 81 + f:04d}.jpg"); w, h = im.size; im = im.crop((int(w * 0.18), int(h * 0.12), int(w * 0.82), int(h * 0.6))).resize((cw, ch - 40))
        sheet.paste(im, (150 + c * cw, r * ch)); deg = d0 + (d1 - d0) * f / 80
        d.text((150 + c * cw + 6, r * ch + ch - 36), f"ruta {f}: {deg % 360:.0f}° (ritad {drawn(deg):.0f}°)", fill="black", font=F)
sheet.save(OUT, quality=92)
PY

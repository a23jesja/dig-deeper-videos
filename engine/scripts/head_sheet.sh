#!/usr/bin/env bash
# The head sheet: renders HeadSheet's 72 frames (Sir every 10 degrees, mouth shut and talking) and lays the heads out as one sheet:
# three rows of 12 per mouth, the angle under each; the angles the motion check bars (motionCheck.ts: the head drawn more than 60 degrees
# from the lens, in profile or from behind) are marked SPÄRRAD in red.   usage: bash scripts/head_sheet.sh <out.jpg>   (run from engine/)
set -eo pipefail
OUT=$1; T=$(mktemp -d)
node scripts/stills.mjs HeadSheet "$T/h" 0-71 0.5 > /dev/null
node scripts/film_info.mjs head-sheet motion | grep -o '^[0-9]*-[a-z]*' | sort -u > "$T/barred.txt" || true
python - "$T" "$OUT" <<'PY'
import sys, glob
from PIL import Image, ImageDraw
T, OUT = sys.argv[1], sys.argv[2]
fs = sorted(glob.glob(T + "/h*.jpg")); barred = set(open(T + "/barred.txt").read().split())
cw, ch = 200, 300
sheet = Image.new("RGB", (cw * 12, ch * 6 + 40 * 0), "white"); d = ImageDraw.Draw(sheet)
for i, f in enumerate(fs):
    im = Image.open(f); w, h = im.size
    head = im.crop((int(w * 0.05), int(h * 0.08), int(w * 0.95), int(h * 0.62))).resize((cw, ch - 24))
    mouth, a = divmod(i, 36); col, row = a % 12, a // 12 + 3 * mouth
    sheet.paste(head, (col * cw, row * ch)); key = f"{a * 10}-{'talking' if mouth else 'shut'}"
    if key in barred: d.rectangle([col * cw + 2, row * ch + 2, col * cw + cw - 3, row * ch + ch - 26], outline="red", width=4); d.text((col * cw + 8, row * ch + 8), "SPÄRRAD", fill="red")
    d.text((col * cw + 6, row * ch + ch - 20), f"{a * 10} deg {'talking' if mouth else 'shut'}", fill="black")
sheet.save(OUT, quality=90)
PY
rm -rf "$T"

# Contact sheets of the stills made by scripts/shot_stills.mjs: one row per shot, shot number and frame burned in.
# usage: python scripts/shot_sheet.py <stillsDir> <outPrefix> [rowsPerSheet=6]
import glob, os, sys
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]
rows_per = int(sys.argv[3]) if len(sys.argv) > 3 else 6
files = sorted(glob.glob(os.path.join(d, "s*_*.jpg")))
shots = {}
for f in files:
    sid = int(os.path.basename(f)[1:4]); shots.setdefault(sid, []).append(f)
ids = sorted(shots)
for s0 in range(0, len(ids), rows_per):
    chunk = ids[s0:s0 + rows_per]
    ims = [[Image.open(f) for f in shots[i]] for i in chunk]
    cw, ch = ims[0][0].size; cols = max(len(r) for r in ims)
    sheet = Image.new("RGB", (cols * cw, len(chunk) * ch), "#202020"); dr = ImageDraw.Draw(sheet)
    for r, (sid, row) in enumerate(zip(chunk, ims)):
        for k, im in enumerate(row):
            sheet.paste(im, (k * cw, r * ch))
            fr = os.path.basename(shots[sid][k])[5:10]
            dr.rectangle([k * cw, r * ch, k * cw + 96, r * ch + 14], fill="#000000"); dr.text((k * cw + 3, r * ch + 1), f"#{sid} f{fr}", fill="#ffff66")
    name = f"{out}{chunk[0]:03d}.jpg"; sheet.save(name, quality=85); print(name)

# Cuts the pose sheets (Sir Digsworth's poses, walk cycle, mouth shapes; officer, gentleman, sailor, lady in a boat)
# into whole pose drawings: one transparent picture per pose, all at the same scale (same head size), feet on the
# bottom edge. Nothing is bent or redrawn.   python scripts/kit2_cut.py
# Needs out/kit2/src/nXXx4.png (the sheets enlarged four times with scripts/comfy_upscale.py).
# Writes public/kit/cards/<name>.png, merges into src/videos/kit/cards.json (w, h, head cx cy r) and out/kit2/poses.jpg
import json, os, sys
sys.path.insert(0, "scripts")
from kit_lib import *
from kit_cut import fit_circle
from PIL import ImageDraw, ImageFont
OUT = "public/kit/cards"; os.makedirs(OUT, exist_ok=True)
R0 = 120.0     # head radius of every figure, px
SHEETS = [
    ("n00", [["sir_point", "sir_cheer", "sir_cap", "sir_shrug", "sir_shock", "sir_think"]]),
    ("n02", [["sir_laugh", "sir_run", "sir_sit", "sir_duck", "sir_watch", "sir_offer"], ["sir_walk0", "sir_walk1", "sir_walk2", "sir_walk3", "sir_walk4", "sir_walk5"]]),
    ("n05", [["sir_front", "sir_34", "sir_side", "sir_back"], None]),
    ("n07", [["mouth_closed", "mouth_slight", "mouth_open", "mouth_wide"], None]),
    ("n11", [["officer_front", "officer_side", "officer_run", "officer_shock", "officer_sad"]]),
    ("n16", [["gent_front", "gent_side", "gent_run", "gent_shock", "gent_sad"]]),
    ("n12", [["sailor_front", "sailor_side", "sailor_run", "sailor_shock", "sailor_sad"]]),
    ("n14", [["lady_boat"]]), ("n17", [["boat_group"]]),
]
MAN = json.load(open("src/videos/kit/cards.json")) if os.path.exists("src/videos/kit/cards.json") else {}
MAN = {k: v for k, v in MAN.items() if k.startswith("fx_")}
allnames = []
for sheet, rows in SHEETS:
    rgba = cut_alpha(load(f"out/kit2/src/{sheet}x4.png"))
    dark = (rgba[..., 3] > 40) & (lum(rgba[..., :3].astype(np.float32)) < 90)
    line = np.where(dark.mean(1) > 0.7)[0]                                           # a drawn ground line right across the sheet
    if len(line) and line.max() - line.min() < 80: rgba[max(0, line.min() - 8):line.max() + 9, :, 3] = 0; print(sheet, "ground line removed at rows", line.min(), line.max())
    lab, cs = comps(rgba, merge=14, min_area=400)
    big = max(c["area"] for c in cs)
    cs = [c for c in cs if c["area"] > 0.1 * big and (c["y1"] - c["y0"]) > 120]
    cs.sort(key=lambda c: (c["y0"] + c["y1"]) / 2)
    groups, cur = [], [cs[0]]
    for c in cs[1:]:
        if (c["y0"] + c["y1"]) / 2 - (cur[-1]["y0"] + cur[-1]["y1"]) / 2 > 500: groups.append(cur); cur = [c]
        else: cur.append(c)
    groups.append(cur)
    print(sheet, [len(g) for g in groups])
    for names, g in zip(rows, groups):
        if names is None: continue
        g.sort(key=lambda c: c["x0"])
        assert len(g) == len(names), (sheet, len(g), names)
        for name, c in zip(names, g):
            im, _ = crop(rgba, lab, [c["i"]], 4)
            a = np.asarray(im).copy()
            if name.startswith("mouth_"):
                cx, cy, r = fit_circle(Image.fromarray(a[: int(a.shape[0] * 0.75)]))
            elif name in ("lady_boat", "boat_group"):
                cx, cy, r = 0, 0, 0
            else:
                top = Image.fromarray(a[: int(a.shape[0] * (0.62 if "duck" in name or "sit" in name else 0.5))])
                cx, cy, r = fit_circle(top)
            s = R0 / r if r else (1150 / im.width if name == "lady_boat" else 1500 / im.width)
            im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
            im.save(f"{OUT}/{name}.png")
            MAN[name] = dict(w=im.width, h=im.height, cx=round(cx * s, 1), cy=round(cy * s, 1), r=round(r * s, 1))
            allnames.append(name)
json.dump(MAN, open("src/videos/kit/cards.json", "w"), indent=0)
f = ImageFont.truetype("arial.ttf", 20)
names = [n for n in allnames if not n.startswith("mouth_")]
C = 8; cw, ch = 300, 420
S = Image.new("RGB", (C * cw, ((len(names) + C - 1) // C) * ch), (70, 130, 180)); d = ImageDraw.Draw(S)
for i, n in enumerate(names):
    im = Image.open(f"{OUT}/{n}.png"); k = min((cw - 10) / im.width, 0.3); im2 = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    x, y = (i % C) * cw, (i // C) * ch
    S.paste(im2, (x + (cw - im2.width) // 2, y + ch - 30 - im2.height), im2); d.text((x + 6, y + ch - 26), n, font=f, fill="white")
S.save("out/kit2/poses.jpg", quality=86)
print({k: (v["w"], v["h"]) for k, v in MAN.items() if not k.startswith("fx_")})

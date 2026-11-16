# Mouth shapes for talking: the open mouths from the "mouth shapes with the pipe" sheet (n07), cut as small patches that
# sit under the moustache of a pose. Only the mouth itself is taken (not the moustache, pipe or eyes).
#   python scripts/kit2_mouths.py -> public/kit/cards/mouthpatch_<shape>.png, offsets in src/videos/kit/mouths.json, check out/kit2/mouths.jpg
import json, sys
sys.path.insert(0, "scripts")
from kit_lib import *
M = json.load(open("src/videos/kit/cards.json")); OUT = {}
def tash(name):
    """centre of the moustache relative to the head centre, in head radii"""
    m = M[name]; a = np.asarray(Image.open(f"public/kit/cards/{name}.png")).astype(np.float32); H, W = a.shape[:2]; yy, xx = np.mgrid[0:H, 0:W]
    L = lum(a[..., :3]); rg = a[..., 0] - a[..., 1]; cx, cy, r = m["cx"], m["cy"], m["r"]
    b = (a[..., 3] > 128) & (rg > 14) & (rg < 46) & (L > 55) & (L < 175) & (yy > cy) & (yy < cy + 0.55 * r) & (np.abs(xx - cx) < 0.75 * r) & (np.hypot(xx - cx, yy - cy) < 0.95 * r)
    b = ndi.binary_opening(b, iterations=2)
    return (float(xx[b].mean() - cx) / r, float(yy[b].mean() - cy) / r)
for shape in ("slight", "open", "wide"):
    m = M[f"mouth_{shape}"]; a = np.asarray(Image.open(f"public/kit/cards/mouth_{shape}.png")).astype(np.float32)
    H, W = a.shape[:2]; yy, xx = np.mgrid[0:H, 0:W]; cx, cy, r = m["cx"], m["cy"], m["r"]
    L = lum(a[..., :3]); rg = a[..., 0] - a[..., 1]
    low = (np.hypot(xx - cx, yy - cy) < 0.9 * r) & (yy > cy + 0.2 * r) & (a[..., 3] > 128)
    rb = a[..., 0] - a[..., 2]
    brown = low & (rg > 5) & (rg < 31) & (rb > 16) & (rb < 70) & (L > 45) & (L < 185)   # moustache and pipe
    brown = ndi.binary_opening(brown, iterations=1)
    core = low & (yy > cy + 0.3 * r) & ((L < 110) | ((rg > 38) & (L > 90))) & ~ndi.binary_dilation(brown, iterations=7)   # ink and the red inside of the mouth
    lab, n = ndi.label(ndi.binary_dilation(core, iterations=3))
    best, bs = 0, 0
    for i in range(1, n + 1):
        k = core & (lab == i); sz = k.sum()
        if sz > bs and abs(xx[k].mean() - cx) < 0.45 * r: best, bs = i, sz
    mouth = ndi.binary_fill_holes(ndi.binary_closing(core & (lab == best), iterations=4)) & ~brown
    ys, xs = np.where(mouth); x0, x1, y0, y1 = xs.min() - 2, xs.max() + 3, ys.min() - 2, ys.max() + 3
    p = a[y0:y1, x0:x1].copy(); p[..., 3] = np.where(mouth[y0:y1, x0:x1], 255, 0)
    Image.fromarray(p.astype(np.uint8)).save(f"public/kit/cards/mouthpatch_{shape}.png")
    OUT[shape] = dict(ox=round(float(x0 - cx), 1), oy=round(float(y0 - cy), 1), w=int(x1 - x0), h=int(y1 - y0)); print(shape, OUT[shape], "area", int(mouth.sum()))
# where the mouth sits on each pose that talks, as a shift from the front-on place (px at head radius 120), set by eye on out/kit2/mouths.jpg
poses = ["sir_point", "sir_cap", "sir_front", "sir_shrug"]
OUT["shift"] = {"sir_point": [2, 0], "sir_front": [0, 0], "sir_cap": [22, 10], "sir_34": [12, 6], "sir_shrug": [17, 2], "sir_think": [4, 0]}
OUT["eyes"] = {}
for pn in ["sir_point", "sir_cap", "sir_front", "sir_shrug", "sir_34"]:
    m = M[pn]; a = np.asarray(Image.open(f"public/kit/cards/{pn}.png")).astype(np.float32); H, W = a.shape[:2]; yy, xx = np.mgrid[0:H, 0:W]
    cx, cy, r = m["cx"], m["cy"], m["r"]; dk = (lum(a[..., :3]) < 70) & (a[..., 3] > 200) & (np.hypot(xx - cx, yy - cy) < 0.78 * r) & (yy > cy - 0.45 * r) & (yy < cy + 0.12 * r)
    lab, n = ndi.label(dk); ev = []
    for i, sl in enumerate(ndi.find_objects(lab), 1):
        h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start; ar = int((lab[sl] == i).sum())
        if 90 < ar < 900 and 8 <= w <= 30 and 12 <= h <= 40 and ar > 0.6 * w * h: ev.append([round((sl[1].start + sl[1].stop) / 2 - cx, 1), round((sl[0].start + sl[0].stop) / 2 - cy, 1), w, h])
    OUT["eyes"][pn] = ev; print(pn, "eyes", ev)
json.dump(OUT, open("src/videos/kit/mouths.json", "w"))
# check: every shape on the heads of the poses that talk
S = Image.new("RGB", (4 * 330, len(poses) * 330), (70, 130, 180))
for j, pn in enumerate(poses):
    pm = M[pn]; base = Image.open(f"public/kit/cards/{pn}.png")
    for i, shape in enumerate(["closed", "slight", "open", "wide"]):
        im = base.copy()
        if shape != "closed":
            o = OUT[shape]; im.alpha_composite(Image.open(f"public/kit/cards/mouthpatch_{shape}.png"), (round(pm["cx"] + o["ox"] + OUT["shift"][pn][0]), round(pm["cy"] + o["oy"] + OUT["shift"][pn][1])))
        c = im.crop((int(pm["cx"] - 165), int(pm["cy"] - 165), int(pm["cx"] + 165), int(pm["cy"] + 165)))
        S.paste(c, (i * 330, j * 330), c)
S.save("out/kit2/mouths.jpg", quality=88)

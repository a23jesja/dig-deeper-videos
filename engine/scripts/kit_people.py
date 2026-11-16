# Whole pose drawings as cards: the plain figure's eight poses at full sharpness (from the 4x sheet), each with a
# hat from the wardrobe set on its head (nothing is bent or turned), and Sir Digsworth's four views.
#   python scripts/kit_people.py -> public/kit/cards/*.png + src/videos/kit/cards.json  (h = picture height, foot = ground line)
import json, os, sys
sys.path.insert(0, "scripts")
from kit_lib import *
OUT = "public/kit/cards"; os.makedirs(OUT, exist_ok=True)
MAN = {}
rgba = cut_alpha(load("out/kit/src/s0x4.png")); lab, cs = comps(rgba, merge=4, min_area=80)
POSES = dict(stand=(70, 500, 170, 740), walk=(200, 500, 340, 740), run=(345, 500, 535, 740), sit=(545, 500, 670, 740), kneel=(695, 500, 840, 740), fall=(845, 500, 1060, 700), cheer=(1045, 495, 1210, 740), despair=(1220, 500, 1340, 740))
def take(box):
    x0, y0, x1, y1 = [v * 4 for v in box]
    ids = [c["i"] for c in cs if x0 <= (c["x0"] + c["x1"]) / 2 <= x1 and y0 <= (c["y0"] + c["y1"]) / 2 <= y1]
    return crop(rgba, lab, ids, 6)[0]
def head_of(im):
    a = np.asarray(im); wh = (a[..., 3] > 200) & (a[..., :3].min(-1) > 190)
    l, n = ndi.label(wh); sizes = ndi.sum(wh, l, range(1, n + 1)); sl = ndi.find_objects(l)[int(np.argmax(sizes))]
    return (sl[1].start + sl[1].stop) / 2, (sl[0].start + sl[0].stop) / 2, (sl[1].stop - sl[1].start + sl[0].stop - sl[0].start) / 4 + 10
def tinted(path, col):
    a = np.asarray(Image.open(path)).astype(np.float32); a[..., :3] *= np.array(col, np.float32) / 255
    return Image.fromarray(a.clip(0, 255).astype(np.uint8))
HATS = dict(officer=(2.85, 0.0, -1.3), flatcap=(2.7, -0.1, -1.2))   # width in head radii, offset: the brim sits above both eyes
WHO = dict(guard=("officer", (79, 110, 168), "tash_walrus"), thief=("flatcap", (138, 118, 96), "tash_thin"))
for pose, box in POSES.items():
    base = take(box)
    # paper caught between an arm and the body is not part of the figure
    a = np.asarray(base).copy(); rgb = a[..., :3].astype(np.float32); paper = (a[..., 3] > 0) & (rgb[..., 0] - rgb[..., 2] > 12) & (rgb.min(-1) > 170)
    pl, pn = ndi.label(paper)
    for i, sl in enumerate(ndi.find_objects(pl), 1):
        if (pl[sl] == i).sum() > 300: a[sl][pl[sl] == i, 3] = 0
    base = Image.fromarray(a); cx, cy, r = head_of(base)
    for who, (hat, col, tash) in WHO.items():
        pad = int(1.2 * r); im = Image.new("RGBA", (base.width + 2 * pad, base.height + pad), (0, 0, 0, 0)); im.alpha_composite(base, (pad, pad))
        if pose in ("stand", "walk", "run", "cheer"):     # faces we can see: a moustache between the eyes and the mouth
            t = Image.open(f"public/kit/wardrobe/{tash}.png"); w = int(1.0 * r); t = t.resize((w, int(w * t.height / t.width)), Image.LANCZOS)
            im.alpha_composite(t, (int(pad + cx - w / 2 + (0.25 * r if pose in ("walk", "run") else 0)), int(pad + cy + 0.22 * r - t.height / 2)))
        hw, hdx, hdy = HATS[hat]; h = tinted(f"public/kit/wardrobe/hat_{hat}.png", col); w = int(hw * r); h = h.resize((w, int(w * h.height / h.width)), Image.LANCZOS)
        im.alpha_composite(h, (int(pad + cx + hdx * r - w / 2), max(0, int(pad + cy + hdy * r - h.height / 2))))
        bb = im.getbbox(); im = im.crop((bb[0], bb[1], bb[2], im.height))
        im.thumbnail((900, 1000), Image.LANCZOS); im.save(f"{OUT}/{who}_{pose}.png"); MAN[f"{who}_{pose}"] = dict(w=im.width, h=im.height)
for v in ("front", "34", "side", "back"):
    im = Image.open(f"public/kit/sir/view_{v}.png"); im.save(f"{OUT}/sir_{v}.png"); MAN[f"sir_{v}"] = dict(w=im.width, h=im.height)
for n in ("dust", "exclaim", "question", "speed_a", "smoke", "impact"):
    im = Image.open(f"public/kit/fx/{n}.png"); im.save(f"{OUT}/fx_{n}.png"); MAN[f"fx_{n}"] = dict(w=im.width, h=im.height)
json.dump(MAN, open("src/videos/kit/cards.json", "w"), indent=0); print(MAN)
names = [k for k in MAN if not k.startswith("fx_")]
S = Image.new("RGB", (len(names) // 2 * 190 + 200, 2 * 330), (70, 130, 180))
for i, k in enumerate(names):
    im = Image.open(f"{OUT}/{k}.png"); im.thumbnail((180, 320)); S.paste(im, ((i // 2) * 190 + 5, (i % 2) * 330 + 325 - im.height), im)
S.save("out/kit/cards.jpg", quality=86)

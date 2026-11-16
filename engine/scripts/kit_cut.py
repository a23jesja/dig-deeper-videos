# Cuts Jesper's six figure sheets (figurblad/) into named, transparent parts, once, for every video.
#   python scripts/kit_cut.py        (needs out/kit/src/*.png, made by the commands in README "The figure kit")
# Output: public/kit/<group>/<name>.png and src/videos/kit/parts.json (size and anchors of every part).
# Removed on the way: paper, ground shadows, text labels and the white sticker rim.
import json, os, sys
sys.path.insert(0, "scripts")
from kit_lib import *

OUT, MAN = "public/kit", {}
NOTES = []

def sheet(name):
    rgba = cut_alpha(load(f"out/kit/src/{name}.png"))
    lab, cs = comps(rgba, merge=2, min_area=20)
    return rgba, lab, cs

def take(sh, box, sc=2, pad=4):
    """all parts whose centre lies in `box` (given in the sheet's 1376-wide space, times sc)"""
    rgba, lab, cs = sh
    x0, y0, x1, y1 = [v * sc for v in box]
    ids = [c["i"] for c in cs if x0 <= (c["x0"] + c["x1"]) / 2 <= x1 and y0 <= (c["y0"] + c["y1"]) / 2 <= y1]
    assert ids, box
    return crop(rgba, lab, ids, pad)[0]

def save(group, name, im, **meta):
    os.makedirs(f"{OUT}/{group}", exist_ok=True)
    im.save(f"{OUT}/{group}/{name}.png", optimize=True)
    MAN[f"{group}/{name}"] = dict(w=im.width, h=im.height, **{k: (round(v, 2) if isinstance(v, float) else v) for k, v in meta.items()})

def A(im): return np.asarray(im).copy()

def fit_circle(im, tries=1500, seed=1):
    """centre and radius of the white head disc (RANSAC on the edge of the white area)"""
    a = A(im); white = (a[..., 3] > 200) & (a[..., :3].min(-1) > 186)
    lab, n = ndi.label(white)
    big = lab == (1 + np.argmax(ndi.sum(white, lab, range(1, n + 1))))
    edge = big & ~ndi.binary_erosion(big)
    ys, xs = np.where(edge); pts = np.stack([xs, ys], 1).astype(np.float64)
    rng = np.random.default_rng(seed); best = (0, None)
    for _ in range(tries):
        p = pts[rng.choice(len(pts), 3, replace=False)]
        (x1, y1), (x2, y2), (x3, y3) = p
        d = 2 * (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2))
        if abs(d) < 1e-6: continue
        ux = ((x1**2 + y1**2) * (y2 - y3) + (x2**2 + y2**2) * (y3 - y1) + (x3**2 + y3**2) * (y1 - y2)) / d
        uy = ((x1**2 + y1**2) * (x3 - x2) + (x2**2 + y2**2) * (x1 - x3) + (x3**2 + y3**2) * (x2 - x1)) / d
        r = np.hypot(x1 - ux, y1 - uy)
        if not (0.2 * im.width < r < 0.7 * im.width): continue
        inl = int((np.abs(np.hypot(pts[:, 0] - ux, pts[:, 1] - uy) - r) < 2.0).sum())
        if inl > best[0]: best = (inl, (ux, uy, r))
    cx, cy, r = best[1]
    return cx, cy, r + 5  # + the ink outline

def flip(im): return im.transpose(Image.FLIP_LEFT_RIGHT)

# ------------------------------------------------------------------ garments: body without sleeves + sleeve data
def split_sleeves(im, cut_legs=False):
    a = A(im); m = a[..., 3] > 60; H, W = m.shape
    def runs(y):
        r, x = [], 0; row = m[y]
        while x < W:
            if row[x]:
                x0 = x
                while x < W and row[x]: x += 1
                r.append((x0, x))
            else: x += 1
        return [q for q in r if q[1] - q[0] > 6]
    R = [runs(y) for y in range(H)]
    mid = W / 2
    info = dict(sleeves=False)
    # armpit: the highest row where a sleeve and the body are separate on both sides
    ya = next((y for y in range(int(H * 0.15), int(H * 0.8)) if len(R[y]) >= 3 and any(q[0] < mid < q[1] for q in R[y]) and R[y][0][1] < mid and R[y][-1][0] > mid
               and all(len(R[yy]) >= 3 for yy in range(y, min(H, y + 12)))), None)
    hem = H
    if cut_legs:
        wmax = max((q[1] - q[0] for y in range(H) for q in R[y] if q[0] < mid < q[1]), default=0)
        body_rows = [y for y in range(H) if any(q[0] < mid < q[1] and q[1] - q[0] > 0.45 * wmax for q in R[y])]
        hem = max(body_rows) + 1
    if ya is not None:
        body = next(q for q in R[ya] if q[0] < mid < q[1])
        xl = (R[ya][0][1] + body[0]) // 2; xr = (body[1] + R[ya][-1][0]) // 2
        cutm = m.copy(); cutm[:ya + 1, xl - 1:xl + 2] = False; cutm[:ya + 1, xr - 1:xr + 2] = False
        lab, n = ndi.label(cutm)
        torso_id = lab[min(H - 1, ya), int(mid)]
        if torso_id == 0: torso_id = np.bincount(lab[:, int(mid)])[1:].argmax() + 1
        keep = lab == torso_id
        slv = m & ~keep & (np.arange(H)[:, None] < hem if cut_legs else True)
        # sleeve width half-way down, sleeve fill colour, shoulder point (where the cut meets the top outline)
        ys = np.where(slv[:, :xl].any(1))[0]; ymid = int((ys.min() + ys.max()) / 2)
        sw = int(slv[ymid, :xl].sum())
        px = a[..., :3][slv & (a[..., :3].sum(-1) > 180)]
        col = np.median(px, 0) if len(px) else np.array([240, 240, 235])
        top_l = np.where(m[:, xl])[0].min(); top_r = np.where(m[:, xr])[0].min()
        info = dict(sleeves=True, shoL=[int(xl), int(top_l)], shoR=[int(xr), int(top_r)], pit=int(ya), sleeveW=int(sw * 0.86),
                    sleeveCol=[int(v) for v in col], sleeveEnd=int(ys.max()))
        a[..., 3] = np.where(keep, a[..., 3], 0)
    if cut_legs: a[hem:, :, 3] = 0
    ys, xs = np.where(a[..., 3] > 0)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    out = Image.fromarray(a[y0:y1, x0:x1])
    if info["sleeves"]:
        info["shoL"] = [info["shoL"][0] - int(x0), info["shoL"][1] - int(y0)]; info["shoR"] = [info["shoR"][0] - int(x0), info["shoR"][1] - int(y0)]
        info["pit"] -= int(y0)
    # neck: centre of the top edge
    cols = np.where(a[y0:y0 + 8, x0:x1, 3].max(0) > 0)[0]
    info["neck"] = [float(cols.mean()) if len(cols) else (x1 - x0) / 2, 0]
    return out, info

def main():
    # ================================================================== the plain figure (sheet s0) and its faces (s4)
    s0 = sheet("s0x2")
    for n, b in dict(body_front=(30, 40, 365, 490), body_side=(366, 40, 432, 490), body_back=(433, 40, 705, 490)).items():
        save("base", n, take(s0, b))
    for n, b in dict(open=(680, 340, 780, 452), pointing=(782, 360, 892, 440), fist=(893, 352, 975, 448), grip=(985, 358, 1092, 432), waving=(1118, 328, 1235, 452), thumb=(1238, 350, 1328, 450)).items():
        save("base", "hand_" + n, take(s0, b))
    for n, b in dict(stand=(70, 500, 170, 740), walk=(200, 500, 340, 740), run=(345, 500, 535, 740), sit=(545, 500, 670, 740), kneel=(695, 500, 840, 740), fall=(845, 500, 1060, 700), cheer=(1045, 495, 1210, 740), despair=(1220, 500, 1340, 740)).items():
        save("base", "pose_" + n, take(s0, b))
    # the hanging mitten from the front body (wrist at the top)
    bf = A(Image.open(f"{OUT}/base/body_front.png")); wh = (bf[..., 3] > 200) & (bf[..., :3].min(-1) > 200)
    lab, n = ndi.label(wh); objs = ndi.find_objects(lab)
    mitts = sorted([(i + 1, o) for i, o in enumerate(objs) if o[0].start > bf.shape[0] * 0.35 and (lab[o] == i + 1).sum() > 800], key=lambda t: t[1][1].start)
    i, o = mitts[0]; reg = ndi.binary_dilation(lab == i, iterations=9); ys, xs = np.where(reg)
    hm = bf[ys.min():ys.max() + 1, xs.min():xs.max() + 1].copy(); hm[..., 3] = np.where(reg[ys.min():ys.max() + 1, xs.min():xs.max() + 1], hm[..., 3], 0)
    save("base", "hand_rest", Image.fromarray(hm))

    hf = take(s0, (705, 60, 905, 265)); hs = take(s0, (930, 60, 1130, 265))
    def disc(im): return dict(cx=im.width / 2, cy=im.height / 2, r=(im.width + im.height) / 4 - 4)
    save("base", "head_front", hf, **disc(hf)); save("base", "head_side", hs, **disc(hs))
    s4 = sheet("s4x2")
    FACES = ["neutral", "smile", "laugh", "sad", "angry", "shock", "worried", "suspicious", "smug", "tired", "dizzy", "cry"]
    for k, n in enumerate(FACES):
        x = [40, 262, 485, 706, 930, 1142][k % 6]; y = [65, 290][k // 6]
        im = take(s4, (x, y, x + 198, y + 198)); save("base", "face_" + n, im, **disc(im))
    MOUTHS = dict(closed=(60, 600, 260, 670), slight=(310, 595, 450, 665), open=(505, 570, 680, 685), wide=(740, 525, 870, 745), oo=(965, 580, 1040, 685), smile=(1105, 585, 1320, 690))
    mouth_im = {}
    for n, b in MOUTHS.items():
        mouth_im[n] = take(s4, b); save("base", "mouth_" + n, mouth_im[n])
    # talking heads: the eyes-only head with each mouth shape set in place (same canvas, so swapping them never jumps)
    d = disc(hf)
    for n, mi in mouth_im.items():
        s = 0.42; mi2 = mi.resize((max(1, round(mi.width * s)), max(1, round(mi.height * s))), Image.LANCZOS)
        im = hf.copy(); im.alpha_composite(mi2, (round(d["cx"] - mi2.width / 2), round(d["cy"] + 0.44 * d["r"] - mi2.height / 2)))
        save("base", "talk_" + n, im, **d)

    # ================================================================== wardrobe (s1)
    s1 = sheet("s1x2")
    HATS = dict(brodie=(55, 55, 228, 172), officer=(285, 50, 445, 175), knight=(520, 40, 655, 178), crown=(730, 50, 885, 176), top=(950, 40, 1105, 178), bowler=(1160, 55, 1325, 176),
                flatcap=(60, 180, 215, 285), sailor=(285, 180, 445, 290), bobby=(530, 180, 645, 300), ushanka=(735, 178, 880, 312), straw=(930, 180, 1130, 285), scarf=(1180, 165, 1310, 318))
    for n, b in HATS.items(): save("wardrobe", "hat_" + n, take(s1, b))
    GARMENTS = dict(uniform=(50, 302, 238, 478), sailor=(270, 305, 458, 478), suit=(498, 305, 684, 478), trench=(720, 300, 902, 478), armour=(942, 302, 1118, 478), tunic=(1155, 305, 1335, 478),
                    dress=(70, 480, 218, 646), smock=(272, 480, 456, 648), chef=(498, 480, 684, 648), greatcoat=(720, 480, 902, 648), striped=(942, 480, 1118, 646), sweater=(1155, 480, 1335, 646))
    for n, b in GARMENTS.items():
        im = take(s1, b); torso, info = split_sleeves(im)
        save("wardrobe", "full_" + n, im); save("wardrobe", "garment_" + n, torso, **info)
        if not info["sleeves"]: NOTES.append(f"garment {n}: no separate sleeves found, worn whole with bare arms")
    HAIR = dict(tash_handlebar=(55, 665, 215, 735), tash_thin=(228, 675, 365, 728), tash_walrus=(375, 665, 545, 735), beard_full=(555, 640, 705, 762), beard_goatee=(730, 650, 862, 764),
                hair_bun=(892, 608, 1030, 762), hair_long=(1045, 606, 1190, 766), hair_short=(1198, 620, 1340, 728))
    for n, b in HAIR.items(): save("wardrobe", n, take(s1, b))

    # ================================================================== effects (s3)
    s3 = sheet("s3x2")
    FX = dict(dust=(40, 70, 262, 268), smoke=(285, 62, 482, 275), impact=(500, 60, 702, 275), burst=(720, 62, 915, 275), bang=(928, 64, 1132, 268), sparkle=(1140, 70, 1340, 268),
              splash=(38, 295, 265, 480), drop=(295, 292, 478, 478), exclaim=(555, 292, 660, 480), question=(745, 292, 882, 480), speed_a=(928, 310, 1130, 462), speed_b=(1142, 315, 1335, 460),
              anger=(68, 500, 238, 678), dizzy=(275, 505, 478, 668), bubble_speech=(505, 500, 698, 676), bubble_thought=(715, 495, 910, 682))
    for n, b in FX.items(): save("fx", n, take(s3, b))

    # ================================================================== Sir Digsworth: main sheet (s2) and parts sheet (s5x4)
    s2 = sheet("s2")
    for n, b in dict(view_front=(110, 25, 330, 470), view_34=(445, 25, 650, 470), view_side=(770, 25, 950, 470), view_back=(1060, 25, 1280, 470)).items():
        save("sir", n, take(s2, b))
    def head_only(im):
        """keep the head, cap, monocle and pipe; drop the bust below the chin"""
        cx, cy, r = fit_circle(im); a = A(im); H, W = a.shape[:2]
        yy, xx = np.mgrid[0:H, 0:W]
        keep = (np.hypot(xx - cx, yy - cy) <= r + 1) | (yy < cy) | ((xx > cx) & (yy < cy + 0.82 * r) & (xx < cx + 1.75 * r) & (np.hypot(xx - cx, yy - cy) > r))
        # the pipe zone must not bring the shoulder with it: keep only what is joined to the head above the chin line
        a[..., 3] = np.where(keep, a[..., 3], 0)
        lab, n = ndi.label(a[..., 3] > 40); main = lab[int(cy), int(cx)]
        a[..., 3] = np.where(lab == main, a[..., 3], 0)
        ys, xs = np.where(a[..., 3] > 0); x0, y0 = xs.min(), ys.min()
        return Image.fromarray(a[y0:ys.max() + 1, x0:xs.max() + 1]), dict(cx=cx - x0, cy=cy - y0, r=r)
    for k, n in enumerate(["neutral", "wink", "surprised", "suspicious", "angry", "laugh"]):
        x = [50, 270, 490, 708, 925, 1140][k]
        im = take(s2, (x, 485, x + 200, 735)); h, meta = head_only(im)
        save("sir", "expr_" + n, h, **meta)

    s5 = sheet("s5x4")
    P = lambda b: take(s5, b, sc=1)
    body = P((40, 60, 560, 730)); torso, info = split_sleeves(body, cut_legs=True)
    save("sir", "body_front_full", body); save("sir", "torso", torso, **info)
    save("sir", "body_side", P((580, 60, 990, 730)))
    save("sir", "pipe", P((1695, 215, 1865, 340))); save("sir", "cane", P((1885, 60, 1995, 430)))
    for n, b in dict(open=(1015, 505, 1165, 675), pointing=(1168, 540, 1328, 652), fist=(1330, 528, 1450, 665), grip=(1465, 480, 1630, 676), waving=(1660, 490, 1840, 672), thumb=(1845, 525, 1975, 665)).items():
        save("sir", "hand_" + n, P(b))
    # heads: the monocle is on the wrong eye on this sheet, so the front heads are mirrored. The side head keeps its eye.
    side = P((1375, 60, 1710, 390)); cx, cy, r = fit_circle(side); save("sir", "head_side", side, cx=cx, cy=cy, r=r)
    front = flip(P((1040, 55, 1352, 385))); bcx, bcy, br = fit_circle(front)
    save("sir", "head_front", front, cx=bcx, cy=bcy, r=br)
    VAR = dict(closed=(50, 760, 350, 1070), slight=(378, 760, 678, 1070), open=(708, 760, 1008, 1070), wide=(1037, 760, 1337, 1070), oo=(1366, 760, 1666, 1070), smile=(1694, 760, 1994, 1070))
    ba = A(front).astype(np.float32); H, W = ba.shape[:2]; yy, xx = np.mgrid[0:H, 0:W]
    low = (np.hypot(xx - bcx, yy - bcy) < 0.86 * br) & (yy > bcy + 0.12 * br) & (np.abs(xx - bcx) < 0.56 * br)
    dark = lum(ba[..., :3]) < 205
    lab, n = ndi.label(dark & low); sizes = ndi.sum(dark & low, lab, range(1, n + 1)); tash = lab == (1 + int(np.argmax(sizes)))
    old_mouth = (dark & low & ~tash)
    skin = np.median(ba[..., :3][low & ~dark], 0)
    clean = ba.copy(); clean[ndi.binary_dilation(old_mouth, iterations=3)] = [*skin, 255]
    tash_d = ndi.binary_dilation(tash, iterations=4)
    for n, b in VAR.items():
        v = flip(P(b)); vx, vy, vr = fit_circle(v); save("sir", "mouthhead_" + n, v, cx=vx, cy=vy, r=vr)
        s = vr / br   # base pixel -> variant pixel
        va = np.asarray(v.transform((W, H), Image.AFFINE, (s, 0, vx - s * bcx, 0, s, vy - s * bcy), Image.BICUBIC)).astype(np.float32)
        L = lum(va[..., :3]); rg = va[..., 0] - va[..., 1]; rb = va[..., 0] - va[..., 2]
        brown = (L > 62) & (L < 175) & (rg > 8) & (rg < 48) & (rb > 22)
        mouth = low & (yy > bcy + 0.3 * br) & ~tash_d & (L < 222) & ~brown & (va[..., 3] > 128)
        lab2, n2 = ndi.label(ndi.binary_dilation(mouth, iterations=2))
        if n2:  # keep only blobs near the middle, under the moustache
            ok = [i for i in range(1, n2 + 1) if abs(ndi.center_of_mass(lab2 == i)[1] - bcx) < 0.3 * br and (lab2 == i).sum() > 40]
            mouth &= np.isin(lab2, ok)
        al = np.clip((232 - L) / 80, 0, 1) * mouth
        out = clean.copy(); out[..., :3] = clean[..., :3] * (1 - al[..., None]) + va[..., :3] * al[..., None]
        save("sir", "talk_" + n, Image.fromarray(out.clip(0, 255).astype(np.uint8)), cx=bcx, cy=bcy, r=br)

    os.makedirs("src/videos/kit", exist_ok=True)
    json.dump(MAN, open("src/videos/kit/parts.json", "w"), indent=0)
    print(len(MAN), "parts"); print("\n".join(NOTES))
    for k in ["sir/torso", "sir/head_front", "sir/expr_neutral", "wardrobe/garment_uniform", "wardrobe/garment_smock", "wardrobe/garment_greatcoat", "wardrobe/garment_trench", "wardrobe/garment_suit"]: print(k, MAN[k])

if __name__ == '__main__':
    main()

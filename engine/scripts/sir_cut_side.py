# Cuts Sir Digsworth's SIDE view on the main sheet into the moving pieces of his side-on puppet.
#   python scripts/sir_cut_side.py  ->  public/kit/sirs/*.png + src/videos/kit/sirs.json
# With every joint at 0 the pieces lie where they were drawn: the rest pose is the sheet's drawing.
import json, os, sys
sys.path.insert(0, "scripts")
from kit_lib import *
from kit_cut import fit_circle  # noqa
from PIL import ImageDraw

V = np.asarray(Image.open("public/kit/sir/view_side.png")).copy()
H, W = V.shape[:2]; yy, xx = np.mgrid[0:H, 0:W]
al = V[..., 3] > 40
L = lum(V[..., :3].astype(np.float32)); ink = (L < 78) & al
INKC = tuple(int(v) for v in np.median(V[..., :3][ink & (L < 50)], 0))
OUT = "public/kit/sirs"; os.makedirs(OUT, exist_ok=True)
J = {"w": W, "h": H, "pieces": {}, "joints": {}}
NEW = []
S8 = np.ones((3, 3))
def comp_at(mask, pt):
    lab, n = ndi.label(mask, structure=S8); i = lab[pt[1], pt[0]]; assert i, pt
    return lab == i
def save(name, mask, rgba=None, z=0, pad=2):
    a = (V if rgba is None else rgba).copy(); a[..., 3] = np.where(mask, a[..., 3], 0)
    ys, xs = np.where(a[..., 3] > 0); x0, y0, x1, y1 = max(xs.min() - pad, 0), max(ys.min() - pad, 0), xs.max() + 1 + pad, ys.max() + 1 + pad
    Image.fromarray(a[y0:y1, x0:x1]).save(f"{OUT}/{name}.png")
    J["pieces"][name] = dict(x=int(x0), y=int(y0), w=int(x1 - x0), h=int(y1 - y0), z=z)
def line_mask(pts, width):
    im = Image.new("L", (W, H), 0); ImageDraw.Draw(im).line([tuple(p) for p in pts], fill=255, width=width, joint="curve")
    return np.asarray(im) > 0
def poly_mask(pts):
    im = Image.new("L", (W, H), 0); ImageDraw.Draw(im).polygon([tuple(p) for p in pts], fill=255)
    return np.asarray(im) > 0
def edge_dist(mask, pt, ang):
    """how far the mask reaches from pt in direction ang (radians)"""
    k = 0
    while k < 60:
        x, y = int(round(pt[0] + (k + 1) * np.cos(ang))), int(round(pt[1] + (k + 1) * np.sin(ang)))
        if not (0 <= x < W and 0 <= y < H) or not mask[y, x]: break
        k += 1
    return float(k)
def paint(rgba, mask, col): rgba[mask] = [*col, 255]
def deink(rgba, region, lines):
    """replace ink pixels in `lines` by the nearest cloth colour"""
    idx = ndi.distance_transform_edt(lines | ~region, return_distances=False, return_indices=True)
    rgba[lines] = rgba[idx[0][lines], idx[1][lines]]

SHO_N, ELB_N, WRI_N = (94, 320), (99, 430), (113, 531)
SHO_F, WRI_F = (150, 340), (262, 472)
HIP, KNEE = (124, 560), (123, 700)

# ------------------------------------------------------------ head (with the cap, monocle, pipe and smoke)
cx, cy, r = fit_circle(Image.fromarray(V[:258])); print("head circle", cx, cy, r)
d = np.hypot(xx - cx, yy - cy)
hm = al & ((d <= r + 1) | (yy < cy) | ((xx > cx + 0.5 * r) & (yy < 262) & (d > r)))
blab, bn = ndi.label(al & ~hm); bs = ndi.sum(al & ~hm, blab, range(1, bn + 1))
hm = hm | (np.isin(blab, [i + 1 for i, v in enumerate(bs) if v < 300]) & (d < r + 9))
save("head", hm, z=50); J["head"] = dict(cx=float(cx), cy=float(cy), r=float(r)); J["joints"]["neck"] = (int(cx), int(cy + r - 6))
body = al & ~hm

# ------------------------------------------------------------ the far arm: sleeve, glove and cane, behind the jacket
front_edge_x = lambda y: 168 + (y - 330) * 0.115          # the jacket's front line (measured on the sheet)
far = comp_at(body & (xx > front_edge_x(yy) + 14) & (yy > 330), (232, 432))
far = far | (ndi.binary_dilation(far, iterations=4) & body & ink & (xx > front_edge_x(yy) + 3))
a = V.copy()
# the part of the far sleeve hidden behind the jacket, up to the shoulder (new, hidden at rest)
dv = np.array(WRI_F, float) - np.array(SHO_F, float); dv /= np.hypot(*dv); nv = np.array([-dv[1], dv[0]])
P = lambda t, o: tuple((np.array(SHO_F) + dv * t + nv * o).astype(int))
tw = tuple(int(v) for v in np.median(V[..., :3][far & ~ink & (L > 95) & (L < 185) & (xx < 250)], 0)); J["tweed"] = list(tw)
# ------------------------------------------------------------ the near arm, drawn on top of the jacket
arc = [(71, 320), (76, 302), (96, 293), (113, 305), (119, 331)]
inner = comp_at(body & ~ink & ~line_mask(arc, 3) & ~far, (100, 450))
glove = comp_at(body & ~ink & ~far, (120, 570))
arm = ndi.binary_fill_holes(ndi.binary_dilation(inner | glove, iterations=6) & body & (ink | inner | glove) & ~far & (yy > 292))
arm = arm & ~((yy < 325) & ~ndi.binary_dilation(inner, iterations=2))     # nothing above the top of the sleeve but its own cloth
arm = comp_at(arm, (100, 450))
d1 = np.array(ELB_N, float) - np.array(SHO_N, float); d1 /= np.hypot(*d1)
d2 = np.array(WRI_N, float) - np.array(ELB_N, float); d2 /= np.hypot(*d2)
beyond_w = (xx - WRI_N[0]) * d2[0] + (yy - WRI_N[1]) * d2[1] > 0
hand = arm & beyond_w; sleeve = arm & ~beyond_w
past_e = (xx - ELB_N[0]) * d1[0] + (yy - ELB_N[1]) * d1[1] > 0
half = float(ndi.distance_transform_edt(sleeve)[ELB_N[1], ELB_N[0]]); re = min(21.0, half - 1.5); de = np.hypot(xx - ELB_N[0], yy - ELB_N[1])
core = ndi.binary_erosion(sleeve, iterations=6)
save("armN_upper", sleeve & (~past_e | ((de < re) & core)), z=70); save("armN_lower", sleeve & (past_e | ((de < re) & core)), z=71)
save("handN_rest", hand, z=68)
au = np.arctan2(d1[1], d1[0]); J["half"] = dict(armN=[edge_dist(sleeve, ELB_N, au + np.pi / 2), edge_dist(sleeve, ELB_N, au - np.pi / 2)])

# ------------------------------------------------------------ the leg (the far leg is the same drawing, behind)
rest = body & ~far & ~arm
legs = comp_at(rest & (yy > 600), (123, 700))
a = V.copy(); ext = line_mask([(HIP[0], HIP[1] - 12), (124, 604)], 11) & ~legs; paint(a, ext, INKC); lg = legs | ext
NEW.append("the top of the leg, which the glove and jacket hide on the sheet (a plain ink line): hidden at rest")
NEW.append("the far leg: the sheet shows one leg from the side, so the far leg is a copy of it, exactly behind it at rest")
dk = np.hypot(xx - KNEE[0], yy - KNEE[1])
for nm, z in (("legN", 12), ("legF", 8)):
    save(nm + "_upper", lg & ((yy < KNEE[1]) | (dk < 6)), a, z=z); save(nm + "_lower", lg & ((yy >= KNEE[1]) | (dk < 6)), a, z=z + 1)

# ------------------------------------------------------------ torso: the jacket, whole under the near arm
t = V.copy(); tm = rest & ~legs
under = arm & (yy < 546)
deink(t, under, ndi.binary_dilation(under & ink, iterations=2) & under)
low = under & (yy >= 520)                                                    # the cuff: jacket cloth there instead
t[low] = t[yy[low] - 30, xx[low]]
hem = line_mask([(92, 545), (134, 546)], 5) & under; paint(t, hem, INKC)
tm = tm & ~(ndi.binary_dilation(hand, iterations=4) & (yy > 546))            # no ghost of the glove's outline
tm = tm | under
NEW.append("the jacket under the near arm (its tweed carried across where the sleeve's lines and cuff were, and the hem line joined up): hidden by the arm at rest")
nk = line_mask([(cx - 10, cy + r - 30), (cx - 6, cy + r + 2)], 26) & ~tm & (d < r - 2); paint(t, nk, (244, 240, 232)); tm = tm | nk
save("torso", tm, t, z=30)
ext = poly_mask([P(-6, -21), P(70, -21), P(70, 21), P(-6, 21)]) & ~far & ndi.binary_erosion(tm, iterations=3)
paint(a, ext, tw); paint(a, (line_mask([P(-6, -21), P(70, -21)], 5) | line_mask([P(-6, 21), P(70, 21)], 5)) & ~far, INKC)
NEW.append("the upper part of the far (cane) arm, which the jacket hides on the sheet (plain tweed colour with an outline): hidden behind the jacket at rest")
save("armF", far | ext, a, z=20)



J["joints"].update(shoN=SHO_N, elbN=ELB_N, wriN=WRI_N, shoF=SHO_F, wriF=WRI_F, hip=HIP, knee=KNEE)
json.dump(J, open("src/videos/kit/sirs.json", "w"), indent=1); json.dump(NEW, open("out/kit/sirs_new.json", "w"), indent=1)
canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
for n, p in sorted(J["pieces"].items(), key=lambda kv: kv[1]["z"]): canvas.alpha_composite(Image.open(f"{OUT}/{n}.png"), (p["x"], p["y"]))
pm = lambda q: np.concatenate([q[..., :3] * (q[..., 3:] / 255.0), q[..., 3:]], -1)
diff = np.abs(pm(np.asarray(canvas).astype(np.float32)) - pm(V.astype(np.float32))).max(-1)
print("rest-pose pixels that differ from the sheet (>24):", int((diff > 24).sum()), "of", int(al.sum()))
m = diff > 24; lab, n = ndi.label(ndi.binary_dilation(m, iterations=3))
for i, sl in enumerate(ndi.find_objects(lab), 1):
    k = int((m[sl] & (lab[sl] == i)).sum())
    if k > 25: print("  ", k, "x", sl[1].start, sl[1].stop, "y", sl[0].start, sl[0].stop)
S = Image.new("RGB", (1500, 840), (70, 130, 180)); x = 8
for n in ["head", "torso", "armN_upper", "armN_lower", "handN_rest", "armF", "legN_upper", "legN_lower"]:
    p = J["pieces"][n]; im = Image.open(f"{OUT}/{n}.png"); S.paste(im, (x, 6 + p["y"]), im); x += im.width + 14
S.paste(canvas, (x, 6), canvas); S.save("out/kit/sirs_pieces.jpg", quality=88)

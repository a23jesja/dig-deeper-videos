# Cuts Sir Digsworth's FRONT view on the main sheet into the moving pieces of his puppet. In the rest pose the
# pieces lie exactly where they were drawn, so the puppet is the sheet's own drawing.
#   python scripts/sir_cut.py  ->  public/kit/sirf/*.png + src/videos/kit/sirf.json (offsets, joints)
# Drawn new (hidden in the rest pose, each one listed in NEW): see the bottom of the file.
import json, os, sys
sys.path.insert(0, "scripts")
from kit_lib import *
from kit_cut import fit_circle  # noqa
from PIL import ImageDraw

V = np.asarray(Image.open("public/kit/sir/view_front.png")).copy()
H, W = V.shape[:2]; yy, xx = np.mgrid[0:H, 0:W]
al = V[..., 3] > 40
L = lum(V[..., :3].astype(np.float32)); ink = (L < 78) & al
OUT = "public/kit/sirf"; os.makedirs(OUT, exist_ok=True)
J = {"w": W, "h": H, "pieces": {}, "joints": {}}
NEW = []

def comp_at(mask, pt):
    lab, n = ndi.label(mask, structure=np.ones((3, 3))); i = lab[pt[1], pt[0]]; assert i, pt
    return lab == i
def save(name, mask, rgba=None, z=0, pad=2):
    a = (V if rgba is None else rgba).copy(); a[..., 3] = np.where(mask, a[..., 3], 0)
    ys, xs = np.where(a[..., 3] > 0); x0, y0, x1, y1 = max(xs.min() - pad, 0), max(ys.min() - pad, 0), xs.max() + 1 + pad, ys.max() + 1 + pad
    Image.fromarray(a[y0:y1, x0:x1]).save(f"{OUT}/{name}.png")
    J["pieces"][name] = dict(x=int(x0), y=int(y0), w=int(x1 - x0), h=int(y1 - y0), z=z)
def line_mask(pts, width):
    im = Image.new("L", (W, H), 0); ImageDraw.Draw(im).line([tuple(p) for p in pts], fill=255, width=width, joint="curve")
    return np.asarray(im) > 0
def edge_dist(mask, pt, ang):
    """how far the mask reaches from pt in direction ang (radians)"""
    k = 0
    while k < 60:
        x, y = int(round(pt[0] + (k + 1) * np.cos(ang))), int(round(pt[1] + (k + 1) * np.sin(ang)))
        if not (0 <= x < W and 0 <= y < H) or not mask[y, x]: break
        k += 1
    return float(k)
def paint(rgba, mask, col):
    rgba[mask] = [*col, 255]

# ------------------------------------------------------------ joints (sheet pixels)
SHO_R, ELB_R, WRI_R = (64, 318), (41, 428), (28, 531)      # the free arm (left in the picture)
SHO_L, ELB_L, WRI_L = (254, 318), (292, 410), (323, 487)   # the cane arm (right in the picture)
HIP_R, KNEE_R, HIP_L, KNEE_L = (119, 546), (118, 688), (210, 546), (212, 688)
J["joints"] = dict(shoR=SHO_R, elbR=ELB_R, wriR=WRI_R, shoL=SHO_L, elbL=ELB_L, wriL=WRI_L, hipR=HIP_R, kneeR=KNEE_R, hipL=HIP_L, kneeL=KNEE_L)

# ------------------------------------------------------------ head, cap
head_im = Image.fromarray(V[:262]); cx, cy, r = fit_circle(head_im); print('head circle', cx, cy, r)
d = np.hypot(xx - cx, yy - cy)
rgb0 = V[..., :3].astype(np.float32)
Z = al & (xx > cx + 0.55 * r) & (yy < 286) & (d > r)                      # where the pipe and its smoke are
tw_ = Z & ~ink & (rgb0[..., 0] - rgb0[..., 1] < 16) & (rgb0[..., 0] - rgb0[..., 2] > 20) & (L > 90) & (L < 185)   # jacket cloth in that zone
tw_ = ndi.binary_opening(tw_, iterations=1)
brown = Z & (rgb0[..., 0] - rgb0[..., 1] > 22) & (L < 150)
jacket = Z & (yy > 262) & (ndi.distance_transform_edt(~tw_) < ndi.distance_transform_edt(~brown))   # nearer the cloth than the pipe
hm = al & ((d <= r + 1) | (yy < cy) | (Z & ~jacket))
blab, bn = ndi.label(al & ~hm); bs = ndi.sum(al & ~hm, blab, range(1, bn + 1))
hm = hm | (np.isin(blab, [i + 1 for i, v in enumerate(bs) if v < 300]) & (d < r + 9))   # slivers of the head's outline
rgb = V[..., :3].astype(np.float32)
tweed = al & ~ink & (rgb[..., 0] - rgb[..., 2] > 18) & (L > 85) & (L < 190) & (yy < cy - 0.25 * r) & hm
tweed = ndi.binary_opening(tweed, iterations=1)
lab, n = ndi.label(tweed); sizes = ndi.sum(tweed, lab, range(1, n + 1)); tweed = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > 400])
cap = ndi.binary_dilation(tweed, iterations=7) & hm & (ink | tweed | ndi.binary_closing(tweed, iterations=6)) & (yy < cy - 0.1 * r)
outside_top = hm & (d > r + 1) & (yy < cy - 0.3 * r)
cap = ndi.binary_fill_holes(cap | outside_top) & hm
# the bare head under the cap: the circle is completed (white, ink ring)
bare = V.copy(); under = (d <= r) & (yy < cy) & hm
skin = np.median(rgb[(d < 0.5 * r) & ~ink & (L > 225)], 0)
paint(bare, under & ndi.binary_dilation(cap, iterations=9) & (yy < cy - 0.3 * r), skin.astype(np.uint8)); paint(bare, (np.abs(d - (r - 2.5)) <= 2.6) & (yy < cy - 0.3 * r) & ndi.binary_dilation(cap, iterations=9), (22, 19, 26))
NEW.append("the top of the head under the cap (white, with the outline continued): only seen when he lifts the cap")
J["head"] = dict(cx=float(cx), cy=float(cy), r=float(r))
save("head", hm & ~outside_top, V, z=50); save("head_bare", hm & ~outside_top, bare, z=50); save("cap", cap, z=60)
J["joints"]["neck"] = (int(cx), int(cy + r - 4)); J["joints"]["cap"] = (int(cx), int(cy - 0.55 * r))

# ------------------------------------------------------------ arms
# The sleeve is drawn joined to the jacket from the shoulder down to the armpit, with one ink line (the seam) between
# them from y = 352. The cut runs just outside that line, so the line stays whole on the jacket; lower down the
# sleeve hangs free and has its own outline.
body = al & ~hm
INKC = tuple(int(v) for v in np.median(V[..., :3][ink & (L < 50)], 0)); print('ink colour', INKC)
def arm(side, cutx, seed, sho, elb, wri, name, z):
    sgn = -1 if side == "R" else 1                       # which way the sleeve lies from the cut
    inside = (xx < cutx) if side == "R" else (xx > cutx)
    # first row where the sleeve hangs free of the jacket
    free = comp_at(body & (yy > 395) & ~((np.abs(xx - cutx) < 1.2) & (yy < 440)), seed)
    y0 = next(y for y in range(396, 440) if not (body[y, int(cutx) - 3:int(cutx) + 4].all()))
    piece = (body & inside & (yy <= y0)) | (free & (yy > y0) & (inside | (yy > y0 + 14)))
    olab, on = ndi.label(body & ~piece, structure=np.ones((3, 3))); osz = ndi.sum(body & ~piece, olab, range(1, on + 1))
    near = ndi.binary_dilation(piece, iterations=3)
    for i, v in enumerate(osz):
        if v < 500 and (near & (olab == i + 1)).any(): piece = piece | (olab == i + 1)
    # joints centred in the sleeve
    edt = ndi.distance_transform_edt(piece)
    def centre(pt, rad=7):
        x, y = pt; win = edt[y - rad:y + rad + 1, x - rad:x + rad + 1]; j = np.unravel_index(win.argmax(), win.shape)
        return (int(x - rad + j[1]), int(y - rad + j[0])), float(win.max())
    elb, half = centre(elb)
    d2 = np.array(wri, float) - np.array(elb, float); d2 /= np.hypot(*d2)
    d1 = np.array(elb, float) - np.array(sho, float); d1 /= np.hypot(*d1)
    beyond_w = (xx - wri[0]) * d2[0] + (yy - wri[1]) * d2[1] > 0
    hand = piece & beyond_w; sleeve = piece & ~beyond_w
    a = V.copy(); rs = 22; ds = np.hypot(xx - sho[0], yy - sho[1])
    sleeve_a = sleeve & ((ds <= rs) | ((xx - sho[0]) * d1[0] + (yy - sho[1]) * d1[1] > 0))
    past_e = (xx - elb[0]) * d1[0] + (yy - elb[1]) * d1[1] > 0
    re = min(21.0, half - 1.5); de = np.hypot(xx - elb[0], yy - elb[1])
    core = ndi.binary_erosion(sleeve_a, iterations=6)                # inside the outline: all that reaches past the elbow
    save(name + "_upper", sleeve_a & (~past_e | ((de < re) & core)), a, z=z); save(name + "_lower", sleeve_a & (past_e | ((de < re) & core)), a, z=z + 1)
    # the sleeve's cut edge gets an outline that fades in as the arm lifts (invisible while it hangs)
    e = V.copy(); ex = cutx + sgn * 2.2
    edge = line_mask([(ex, sho[1] + 14), (ex, y0 - 3)], 5) & sleeve_a
    paint(e, edge, INKC); save(name + "_edge", edge, e, z=z + 2)
    au = np.arctan2(d1[1], d1[0])
    ARM[name] = dict(sleeve=sleeve, sleeve_a=sleeve_a, half=[edge_dist(sleeve_a, elb, au + np.pi / 2), edge_dist(sleeve_a, elb, au - np.pi / 2)], y0=y0, cutx=cutx, sgn=sgn)
    J["joints"]["elb" + side] = elb
    return piece, sleeve, hand
ARM = {}
pR, sleeveR, handR = arm("R", 70.5, (30, 450), SHO_R, ELB_R, WRI_R, "armR", 70)
pL, sleeveL, handL = arm("L", 249.5, (300, 452), SHO_L, ELB_L, WRI_L, "armL", 74)
save("handR_rest", handR, z=68)
save("handL_cane", handL, z=66)   # the glove on the cane, with the cane

# ------------------------------------------------------------ legs
rest = body & ~pR & ~pL
legs = rest & (yy > 562)
llab, ln = ndi.label(legs); big = np.argsort(ndi.sum(legs, llab, range(1, ln + 1)))[-2:] + 1
big = sorted(big, key=lambda i: ndi.center_of_mass(llab == i)[1])
for nm, li, hip in (("legR", big[0], HIP_R), ("legL", big[1], HIP_L)):
    lg = llab == li; a = V.copy(); top = np.where(lg[566])[0]; pt = (int(top.mean()) if len(top) else hip[0], 650); print(nm, "top x", pt[0])
    ext = line_mask([(hip[0], hip[1] - 14), (hip[0] + (pt[0] - hip[0]) * 0.0 + (pt[0] - hip[0]), 568)], 9); paint(a, ext & ~lg, (22, 19, 26)); lg2 = lg | ext
    knee = KNEE_R if nm == "legR" else KNEE_L
    dk = np.hypot(xx - knee[0], yy - knee[1])
    save(nm + "_upper", lg2 & ((yy < knee[1]) | (dk < 5)), a, z=10); save(nm + "_lower", lg2 & ((yy >= knee[1]) | (dk < 5)), a, z=11)
NEW.append("the top 2 cm of each leg, up under the jacket (a plain ink line): hidden behind the jacket")

# ------------------------------------------------------------ torso: the jacket with its shoulders, armholes closed with ink
t = V.copy()
tm = (rest & ~legs)
for nm, sho in (("armR", SHO_R), ("armL", SHO_L)):
    A_ = ARM[nm]; sleeve = A_["sleeve"]; cutx, sgn = A_["cutx"], A_["sgn"]; ds = np.hypot(xx - sho[0], yy - sho[1])
    corner = sleeve & ~A_["sleeve_a"]                                           # the shoulder corner above the joint
    under = sleeve & (ds <= 22)                                                 # jacket cloth under the joint
    tm = tm | corner | under
    # outline of what shows when the arm is away: round under the joint, then down the armhole to the seam line
    ring = sleeve & (np.abs(ds - 20) <= 2.6) & (yy > sho[1] + 4)
    hole = line_mask([(cutx - sgn * 3, sho[1] + 16), (cutx - sgn * 3, 356)], 5) & body
    paint(t, ring | hole, INKC); tm = tm | ring | hole
NEW.append("the outline under each shoulder and down the armhole, where the sleeve is cut from the jacket: hidden by the arm when it hangs")
NEW.append("an outline on the cut edge of each sleeve and round a bent elbow: shown only when the arm is lifted or bent")
# a neck under the head, so no gap opens when the head moves
nk = line_mask([(cx - 6, cy + r - 34), (cx - 6, cy + r + 2)], 20) & ~tm & (d < r - 2)
paint(t, nk, (244, 240, 232)); tm = tm | nk
NEW.append("a plain white neck behind the head and bow tie: hidden by the head at rest")
save("torso", tm, t, z=30)

J["tweed"] = [int(v) for v in np.median(V[..., :3][ARM["armR"]["sleeve_a"] & ~ink], 0)]
J["half"] = dict(armR=ARM["armR"]["half"], armL=ARM["armL"]["half"])
json.dump(J, open("src/videos/kit/sirf.json", "w"), indent=1)
json.dump(NEW, open("out/kit/sirf_new.json", "w"), indent=1)
# rest-pose check: paste every piece back by z and compare with the sheet
canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
for n, p in sorted(J["pieces"].items(), key=lambda kv: kv[1]["z"]):
    if n == "head_bare" or n.endswith("_edge"): continue
    canvas.alpha_composite(Image.open(f"{OUT}/{n}.png"), (p["x"], p["y"]))
pm = lambda q: np.concatenate([q[..., :3] * (q[..., 3:] / 255.0), q[..., 3:]], -1)
c = pm(np.asarray(canvas).astype(np.float32)); diff = np.abs(c - pm(V.astype(np.float32))).max(-1)
print("pieces", list(J["pieces"])); print("rest-pose pixels that differ from the sheet (>24):", int((diff > 24).sum()), "of", int(al.sum()))
dimg = np.zeros((H, W, 3), np.uint8); dimg[al] = 90; dimg[diff > 24] = (255, 0, 0); Image.fromarray(dimg).save("out/kit/sirf_diff.png")
canvas.save("out/kit/sirf_rest.png")

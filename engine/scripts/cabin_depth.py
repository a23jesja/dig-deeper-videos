# 3D step 1, the cabin, check 6: nothing of the room lies nearer the lens than a figure where he is drawn. Every frame: Blender's ray map
# (out/cab3d/<shot>/map*.npz, a ray per 20 x 20 px: what it hits first and how far along the lens) against each figure's outline and depth
# (out/cab3d/figs.json, written by scripts/cabin_check.mjs: his head's circle, trunk and limbs, not a box round him). A thing of the room (a prop, a paper, the map) nearer than the figure's floor
# point by more than 8 cm, inside his outline, fails: the flat figure is drawn over the plate, so it would show him in front of it.
# The floor, the walls and the cabin's air are behind or under him and are not counted.
#   python scripts/cabin_depth.py [--plant]      (--plant: a planted crate 1 m in front of the captain in shot A; must fail)
import glob, json, os, sys
import numpy as np
def contains(P, pts):
    """which points lie inside the polygon P (even-odd rule, vectorised)"""
    x, y = pts[:, 0], pts[:, 1]; c = np.zeros(len(pts), bool); n = len(P)
    for i in range(n):
        (x1, y1), (x2, y2) = P[i], P[i - 1]
        m = (y1 > y) != (y2 > y); xi = (x2 - x1) * (y - y1) / ((y2 - y1) if y2 != y1 else 1e-9) + x1; c ^= m & (x < xi)
    return c
PLANT = "--plant" in sys.argv
F = json.load(open("out/cab3d/figs.json")); faults = []; frames = 0
for sid, rows in F.items():
    chunks = sorted(glob.glob(f"out/cab3d/{sid}/map*.npz")); depth = {}; kind = {}; kinds = None
    for c in chunks:
        z = np.load(c); kinds = list(z["kinds"]); b = os.path.basename(c)[:-4]; f0 = 0 if b == "map" else int(b.split("-")[1])
        for i in range(z["depth"].shape[0]): depth[f0 + i] = z["depth"][i]; kind[f0 + i] = z["kind"][i]
    if len(depth) < len(rows): faults.append(f"{sid}: ray maps for {len(depth)} of {len(rows)} frames"); continue
    solid = [kinds.index(k) + 1 for k in ("prop", "paper", "map") if k in kinds]
    for fr, figs in enumerate(rows):
        frames += 1; D = depth[fr].copy(); K = kind[fr].copy(); ny, nx = D.shape
        if PLANT and sid == "A":      # a crate 1 m in front of the captain, over his middle
            fg = figs[0]; P = np.array(fg["poly"]); cx, cy = P[:, 0].mean(), P[:, 1].mean(); j, i = int(cy // 20), int(cx // 20); D[j - 3:j + 3, i - 3:i + 3] = fg["depth"] - 1.0; K[j - 3:j + 3, i - 3:i + 3] = solid[0]
        ys, xs = np.mgrid[0:ny, 0:nx]; pts = np.stack([(xs.ravel() + 0.5) * 20, (ys.ravel() + 0.5) * 20], 1)
        for fg in figs:
            if fg["sil"]: continue
            inside = np.hypot(pts[:, 0] - fg["head"][0], pts[:, 1] - fg["head"][1]) < fg["head"][2]      # (his shape: head, trunk, limbs)
            inside |= contains(np.array(fg["trunk"], float), pts)
            for (a, b) in fg["limbs"]:
                a, b = np.array(a, float), np.array(b, float); d = b - a; L2 = max(1e-6, d @ d); u = np.clip(((pts - a) @ d) / L2, 0, 1); inside |= np.hypot(*(pts - (a + u[:, None] * d)).T) < fg["lw"] + 10
            inside = inside.reshape(ny, nx)
            bad = inside & np.isin(K, solid) & (D < fg["depth"] - 0.08)
            if bad.any(): faults.append(f"{sid} frame {fr} {fg['name']}: {int(bad.sum())} cells of the room ({', '.join(sorted({kinds[k - 1] for k in K[bad]}))}) nearer than him inside his outline")
print(f"cabin depth{' planted' if PLANT else ''}: {frames} frames, {len(faults)} faults"); [print("  " + f) for f in faults[:12]]
print("CABIN DEPTH FAILED" if faults else "CABIN DEPTH OK"); sys.exit(1 if faults else 0)

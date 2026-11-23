# The checks of Alcatraz in the new style, every frame: the flat figures against Blender's floor and solid map (out/alc3d/<shot>/map.npz,
# one ray per 10 x 10 pixels: the kind of thing it meets first and its depth along the lens) and against the projected floor point.
#   feet:    each planted shoe's lowest drawn point on the floor point (2 px), and the map seeing floor there at the figure's depth
#   depth:   nothing but floor nearer the lens than the figure anywhere on its outline or joints (nothing stands in front of a figure;
#            a figure behind a solid would be drawn in front of it)
#   shadow:  a contact shadow under each figure, centred on the floor point, on floor the map sees
#   motion:  no joint moves more than 45 px in a frame, no face value more than 0.3, no hand changing its drawing while still
#   framing: the whole figure inside the picture with 1 % to spare
#     python scripts/a3d_check.py [dump.json]        (from engine/; scripts/a3d_dump.mjs writes the dump, A3D_PLANT plants a fault)
import json, sys, os
import numpy as np

dump = json.load(open(sys.argv[1] if len(sys.argv) > 1 else "out/alc3d/dump.json"))
W, H, GRID = 1080, 1920, 10
faults, stats = [], {}
for sid, S in dump["shots"].items():
    if not any(S["frames"]): continue
    m = np.load(f"out/alc3d/{sid}/map.npz"); dep, kin, kinds = m["depth"], m["kind"], list(m["kinds"])
    floor_k = kinds.index("floor") + 1
    def cell(fr, x, y):
        i, j = int(x // GRID), int(y // GRID)
        if not (0 <= i < dep.shape[2] and 0 <= j < dep.shape[1]): return None
        return float(dep[min(fr, len(dep) - 1), j, i]), int(kin[min(fr, len(dep) - 1), j, i])
    st = stats.setdefault(sid, {"frames": len(S["frames"]), "foot_px": 0.0, "nearest_in_front_m": None, "shadow_px": 0.0, "joint_px": 0.0})
    prev = {}
    for fr, figs in enumerate(S["frames"]):
        for g in figs:
            n, fx, fy, d = g["name"], g["foot"][0], g["foot"][1], g["depth"]
            # feet
            for side, sh in g["shoes"].items():
                if not sh["planted"]: continue
                dy = sh["bottom"][1] - fy; st["foot_px"] = max(st["foot_px"], abs(dy))
                if dy < -2: faults.append(f"{sid} {fr + 1} {n}: the {side} shoe {-dy:.1f} px above the floor (floating)")
                if dy > 2: faults.append(f"{sid} {fr + 1} {n}: the {side} shoe {dy:.1f} px into the floor")
                c = cell(fr, sh["bottom"][0], sh["bottom"][1] + 4)
                if c and (c[1] != floor_k or abs(c[0] - d) > 0.35): faults.append(f"{sid} {fr + 1} {n}: under the {side} shoe the map sees {kinds[c[1] - 1] if c[1] else 'nothing'} at {c[0]:.2f} m, not floor at {d:.2f} m")
            # depth: nothing but floor in front of him
            for (x, y) in g["box"] + list(g["joints"].values()):
                c = cell(fr, x, y)
                if not c or c[1] == floor_k or c[1] == 0: continue
                if c[0] < d - 0.08:
                    k = kinds[c[1] - 1]; st["nearest_in_front_m"] = min(st["nearest_in_front_m"] or 9, d - c[0])
                    faults.append(f"{sid} {fr + 1} {n}: {k} stands {d - c[0]:.2f} m in front of him at ({x:.0f}, {y:.0f}) but he is drawn over it"); break
            # shadow
            if g["shadow"] is None: faults.append(f"{sid} {fr + 1} {n}: no contact shadow under him")
            else:
                P = np.array(g["shadow"]); cx, cy = P[:, 0].mean(), P[:, 1].mean(); e = float(np.hypot(cx - fx, cy - fy)); st["shadow_px"] = max(st["shadow_px"], e)
                inside = False
                for i in range(len(P)):
                    (xi, yi), (xj, yj) = P[i], P[i - 1]
                    if (yi > fy) != (yj > fy) and fx < (xj - xi) * (fy - yi) / (yj - yi) + xi: inside = not inside
                # (a circle on the floor seen in perspective: its picture's centre lies a little off the projected centre; the floor point must be
                #  inside it and the centre within 12 px)
                if not inside or e > 12: faults.append(f"{sid} {fr + 1} {n}: the contact shadow {e:.1f} px off his floor point" + ("" if inside else " (the floor point outside it)"))
                c = cell(fr, cx, cy)
                if c and c[1] != floor_k: faults.append(f"{sid} {fr + 1} {n}: the contact shadow lies on {kinds[c[1] - 1]}, not floor")
            # motion
            if n in prev:
                p = prev[n]
                for k, q in g["joints"].items():
                    if k in p["joints"]:
                        dj = float(np.hypot(q[0] - p["joints"][k][0], q[1] - p["joints"][k][1])); st["joint_px"] = max(st["joint_px"], dj)
                        if dj > 45: faults.append(f"{sid} {fr + 1} {n}: the joint {k} jumps {dj:.0f} px in a frame"); break
                for k in ("wide", "mouth", "brow", "smile", "lid"):
                    a, b = (g["face"] or {}).get(k, 0) or 0, (p["face"] or {}).get(k, 0) or 0
                    if abs(a - b) > 0.3: faults.append(f"{sid} {fr + 1} {n}: the face's {k} jumps {abs(a - b):.2f} in a frame")
                if g["hands"] != p["hands"]: faults.append(f"{sid} {fr + 1} {n}: a hand changes its drawing {p['hands']} -> {g['hands']}")
            prev[n] = g
            # framing: the whole figure inside the picture, cap, ears, hands and shoes, with 1 % to spare (the review of v3 points 6 and 15:
            #  the cap cut by the top and the shoes by the bottom as the lens went in)
            out = [(x, y) for (x, y) in g["box"] if not (0.01 * W <= x <= 0.99 * W and 0.01 * H <= y <= 0.99 * H)]
            if out: faults.append(f"{sid} {fr + 1} {n}: the figure cut by the picture's edge at ({out[0][0]:.0f}, {out[0][1]:.0f})")

print(f"plant: {dump.get('plant')}")
for sid, st in stats.items():
    mine = [f for f in faults if f.startswith(sid + " ")]
    nf = st["nearest_in_front_m"]; front = "none" if nf is None else f"{nf:.2f} m"
    print(f"== {sid}: {st['frames']} frames; feet at most {st['foot_px']:.2f} px off the floor point; shadow at most {st['shadow_px']:.2f} px off it; "
          f"joints at most {st['joint_px']:.1f} px a frame; a solid in front of a figure: {front}")
    for f in mine[:6]: print("   " + f)
    if len(mine) > 6: print(f"   ... {len(mine) - 6} more")
    print("   A3D CHECK " + ("FAILED (%d)" % len(mine) if mine else "OK"))
sys.exit(1 if faults else 0)

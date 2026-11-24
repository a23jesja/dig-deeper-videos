# The movement check of the new flicker measure (the automation session's decision of 24 Nov, granskning/beslut-fran-molnsessionen.md on
# claude/emu-short-cloud b889695): the rule is unchanged (nothing may blink, shimmer or jump out and back); the measure for MOVEMENT is:
#   - the camera's own movement taken out first, from Blender's camera matrices (each figure's floor point projected with this frame's and
#     the last frame's matrix: what the lens did to it);
#   - a body part (every joint of the arms and legs) may move up to BODY px a frame, but its speed must build up and brake: the speed may
#     change by at most BODY / 3 px from one frame to the next (full speed is reached over at least 3 frames);
#   - the face (the head's middle, where the eyes are) keeps EYE px a frame; eyes, outlines, text and light keep 12 px in the pixel check
#     (scripts/flicker2.py).
# It reads what scripts/cabin_check.mjs writes: out/cab3d/figs.json (every figure's head, trunk and limbs in the picture, frame by frame),
# with the shots (src/craft/cabin3d/shots.json) and the camera matrices (src/craft/cabin3d/cam/<shot>.json).
#
#   usage: python scripts/motion2.py [--root <engine dir>] [--plant jump|snap] [--out report.txt]
#     --plant jump = one hand moved BODY + 5 px for one frame (a jump of more than 40 px): must fail
#     --plant snap = one hand set going at 30 px a frame with no build-up (from rest to full speed in one frame): must fail
#     --plant smooth = one hand moved fast but built up and braked (10, 20, 30, 35, 35, 30, 20, 10 px a frame): must PASS
import json, math, os, sys

BODY, EYE = 40.0, 12.0
ACC = BODY / 3.0      # (speed change per frame: 0 -> 40 px a frame takes at least 3 frames)
# the limbs in figs.json, per side L then R: shoulder-elbow, elbow-wrist, wrist-tip, hip-knee, knee-ankle, ankle-toe, heel-toe
JOINTS = {"sh": (0, 0), "el": (1, 0), "wr": (2, 0), "tip": (2, 1), "hip": (3, 0), "kn": (4, 0), "an": (5, 0), "toe": (5, 1), "heel": (6, 0)}

def proj(P, q):
    v = [P[r][0] * q[0] + P[r][1] * q[1] + P[r][2] * q[2] + P[r][3] for r in range(3)]
    return (v[0] / v[2], v[1] / v[2])

def main():
    a = sys.argv[1:]; root = "."; plant = None; outp = None
    if "--root" in a: i = a.index("--root"); root = a[i + 1]; del a[i:i + 2]
    if "--plant" in a: i = a.index("--plant"); plant = a[i + 1]; del a[i:i + 2]
    if "--out" in a: i = a.index("--out"); outp = a[i + 1]; del a[i:i + 2]
    F = json.load(open(os.path.join(root, "out/cab3d/figs.json"), encoding="utf-8"))
    spec = json.load(open(os.path.join(root, "src/craft/cabin3d/shots.json"), encoding="utf-8"))
    figpos = spec.get("figs", {})
    faults, worst = [], {"body": (0, ""), "acc": (0, ""), "eye": (0, "")}
    planted = None
    for sid, rows in F.items():
        cam = json.load(open(os.path.join(root, f"src/craft/cabin3d/cam/{sid}.json"), encoding="utf-8"))["frames"]
        track = {}      # (figure, joint) -> list of (frame, x, y)
        for fr, figs in enumerate(rows):
            for fg in figs:
                if fg.get("sil"): continue
                nm = fg["name"]
                pts = {"head": (fg["head"][0], fg["head"][1])}
                for side, base in (("L", 0), ("R", 7)):
                    for j, (li, end) in JOINTS.items(): pts[j + side] = tuple(fg["limbs"][base + li][end])
                for j, p in pts.items(): track.setdefault((nm, j), []).append([fr, float(p[0]), float(p[1])])
        # the planted faults, in the longest shot, on the first figure's right hand (wrist and tip), mid-shot
        if plant and planted is None and len(rows) >= 30:
            nm = next(fg["name"] for fg in rows[0] if not fg.get("sil")); k = len(rows) // 2
            for j in ("wrR", "tipR"):
                tr = track[(nm, j)]
                for row in tr:
                    if plant == "jump" and row[0] == k: row[1] += BODY + 5
                    if plant == "snap" and row[0] >= k: row[1] += 30.0 * min(row[0] - k + 1, 6)      # (30 px a frame from the first frame, for 6 frames, then still)
                    if plant == "smooth" and row[0] >= k: row[1] += sum([10, 20, 30, 35, 35, 30, 20, 10][:row[0] - k + 1])      # (a fast move built up and braked: speeds 10, 20, 30, 35, 35, 30, 20, 10 px a frame: must PASS)
            planted = (sid, k, nm)
        for (nm, j), tr in track.items():
            wp = figpos.get(nm)
            prev_v = None
            for i in range(1, len(tr)):
                f0, x0, y0 = tr[i - 1]; f1, x1, y1 = tr[i]
                if f1 != f0 + 1: prev_v = None; continue
                dx, dy = x1 - x0, y1 - y0
                if wp and f1 < len(cam):      # (the lens's own movement of this figure's place on the floor, taken out)
                    a0, a1 = proj(cam[f0], (wp[0], wp[1], 0)), proj(cam[f1], (wp[0], wp[1], 0)); dx -= a1[0] - a0[0]; dy -= a1[1] - a0[1]
                v = (dx, dy); sp = math.hypot(dx, dy)
                where = f"{sid} frame {f1} {nm} {j}"
                if j == "head":
                    if sp > worst["eye"][0]: worst["eye"] = (sp, where)
                    if sp > EYE: faults.append(f"face moves {sp:.1f} px in a frame (at most {EYE:.0f}): {where}")
                else:
                    if sp > worst["body"][0]: worst["body"] = (sp, where)
                    if sp > BODY: faults.append(f"body part moves {sp:.1f} px in a frame (at most {BODY:.0f}): {where}")
                    if prev_v is not None:
                        acc = math.hypot(v[0] - prev_v[0], v[1] - prev_v[1])
                        if acc > worst["acc"][0]: worst["acc"] = (acc, where)
                        if acc > ACC: faults.append(f"body part's speed changes {acc:.1f} px a frame in one frame (at most {ACC:.1f}: build-up over 3 frames): {where}")
                prev_v = v
    L = [f"movement check (the new measure): body parts at most {BODY:.0f} px a frame, their speed changing at most {ACC:.1f} px from frame to frame; the face at most {EYE:.0f} px a frame; the camera's movement taken out by its matrices",
         f"largest: body {worst['body'][0]:.1f} px ({worst['body'][1]}), speed change {worst['acc'][0]:.1f} px ({worst['acc'][1]}), face {worst['eye'][0]:.1f} px ({worst['eye'][1]})"]
    if planted: L.append(f"planted: {plant} on {planted[2]}'s right hand, shot {planted[0]} frame {planted[1]}")
    seen = set(); uniq = []
    for f in faults:
        key = f.split(":")[0].split(" moves ")[0] + f.split(": ")[-1].rsplit(" ", 1)[-1]
        uniq.append(f)
    L.append(f"{'FAIL' if faults else 'PASS'}: {len(faults)} faults"); L += ["  " + f for f in uniq[:20]]
    txt = "\n".join(L) + "\n"
    if outp: open(outp, "w", encoding="utf-8").write(txt)
    print(txt, end=""); sys.exit(1 if faults else 0)

if __name__ == "__main__":
    main()

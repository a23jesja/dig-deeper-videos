# Where the flicker check's pixels lie in a clip (the shot types): scripts/flicker.py counts a pixel that differs from the frames before
# and after while those two are alike, and takes out steady movement of up to 12 px a frame. A figure that fills the picture moves
# 30-100 px a frame in a walk or a gesture, which the check counts too. This sorts each counted pixel by what is in its place:
#   fast   - inside the box of a part (head, torso, an arm, a leg) whose joints moved more than 12 px in the picture that frame, or of a
#            thing the clip moves (the crab, the door's leaf)
#   face   - inside the head's box while the face changes that frame (a blink, the mouth, the gaze)
#   other  - anywhere else: a picture that changes for one frame where nothing moves, which is flicker
# and fails (exit 1) where "other" is over the check's own limits (2000 in the picture, 40 in an eye's circle).
#   python scripts/flicker_parts.py <clip.mp4> <parts.json> <regions.jsonl> [--img out_prefix]      (parts.json and regions.jsonl: scripts/clip_parts.mjs)
import json, sys
import numpy as np
sys.path.insert(0, __file__.rsplit("/", 1)[0].rsplit("\\", 1)[0])
import flicker as FL
a = sys.argv[1:]; V, P, R = a[0], json.load(open(a[1])), {}
for line in open(a[2]):
    r = json.loads(line); R[r["F"]] = r
things = P.get("things", {})
img = a[a.index("--img") + 1] if "--img" in a else None
seq, out, worst = [], [], []
for F, fr in enumerate(FL.frames(V)):
    seq.append(fr)
    if len(seq) < 3: continue
    if len(seq) > 3: seq.pop(0)
    t = F - 1; m = FL.flicker_map(*seq)
    if m.any():
        G = [FL.gray(x) for x in seq]; ys, xs = np.nonzero(m); ok = FL.explained(*G, ys, xs, FL.STEADY); m[ys[ok], xs[ok]] = False
    n = int(m.sum())
    if n == 0 or t >= len(P["frames"]): continue
    fast = np.zeros_like(m); face = np.zeros_like(m); fp = P["frames"][t]
    def box(b, pad=0):
        x0, y0, x1, y1 = b; return slice(max(0, y0 - pad), max(0, y1 + pad)), slice(max(0, x0 - pad), max(0, x1 + pad))
    for k, v in fp.items():
        if k.endswith(".eyes") or k.endswith(".mouth"): continue
        mv = max(v["move"], P["frames"][t + 1][k]["move"] if t + 1 < len(P["frames"]) else 0)
        if mv > FL.STEP: fast[box(v["box"], 40)] = True      # (40 px for the drawing past the joints: the outline, an open hand's fingers)
    for b in things.get(str(t), []): fast[box(b, 20)] = True
    for k, v in fp.items():
        if (k.endswith(".eyes") or k.endswith(".mouth")):
            nx = P["frames"][t + 1][k]["move"] if t + 1 < len(P["frames"]) else 0
            if v["move"] > 0 or nx > 0: face[box(v["box"])] = True
    other = m & ~fast & ~face
    eye = max([FL.in_circle(m & ~face & ~fast, *e) for e in R.get(t, {}).get("eyes", [])] or [0])
    row = (t, n, int((m & fast).sum()), int((m & face & ~fast).sum()), int(other.sum()), eye); out.append(row)
    if img and (row[4] > 0): worst.append((row[4], t, seq[1].copy(), other.copy()))
fails = [r for r in out if r[4] > FL.FRAME_MAX or r[5] > FL.EYE_MAX]
print(f"flicker by place: {V}")
print("frame  counted  in fast parts  in a changing face  other (eye circle)")
for r in out:
    if r[1] > 200 or r[4] > 0: print(f"{r[0]:5d}  {r[1]:7d}  {r[2]:13d}  {r[3]:18d}  {r[4]:5d} ({r[5]})")
print(f"largest other: picture {max([r[4] for r in out] or [0])}, eye circle {max([r[5] for r in out] or [0])}; counted in all {sum(r[1] for r in out)}, of it in fast parts {sum(r[2] for r in out)}, in a changing face {sum(r[3] for r in out)}, other {sum(r[4] for r in out)}")
print("FLICKER OUTSIDE MOVEMENT: OK" if not fails else f"FLICKER OUTSIDE MOVEMENT: FAIL on {len(fails)} frames: " + ", ".join(str(r[0]) for r in fails))
if img and worst:
    from PIL import Image
    for k, (cnt, t, fr, o) in enumerate(sorted(worst, key=lambda w: -w[0])[:3]):
        im = fr.copy(); ys, xs = np.nonzero(o)
        for dy in range(-3, 4):
            for dx in range(-3, 4): im[np.clip(ys + dy, 0, 1919), np.clip(xs + dx, 0, 1079)] = [255, 0, 255]
        Image.fromarray(im).resize((540, 960)).save(f"{img}-{t}.jpg", quality=85)
sys.exit(1 if fails else 0)

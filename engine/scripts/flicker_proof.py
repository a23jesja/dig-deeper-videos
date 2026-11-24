# The flicker check's proof: faults planted in a copy of a render, each where the check found nothing, then the check run on the copy
# (the review, 20 Nov). What must FAIL:
#   a   an empty eye ring on one frame (the eye filled with the skin below it, inside a dark ring)
#   b   a speech bubble 3 px out on one frame and back (a caption where no bubble stands still)
#   c   in a close-up, the face 3 px out on one frame and back (a 360 x 360 square round the eyes moved)
#   d   a caption with one letter changed on one frame (the 60 px of the line with the most ink replaced by 60 px two letters along)
#   e   a pupil 6 px out on one frame and back (the inner half of the eye moved)
#   g   in a close-up, the face 11 px out on one frame and back (inside the 12 px movement step: still a jump there and back)
#   h1-h6  a face 2 px or 3 px out on one frame and back ON TOP OF a movement already going on at 3, 6 or 9 px a frame (the whole
#       picture sliding; the face square moved the extra 2 or 3 px on the middle frame): the weakness case c showed in v1q
#   f2b the whole picture speeding up to 14 px a frame (it goes over the 12 px step: it strobes)
#   f3  v1q-v17's old slide: 5 px a frame from rest, stopped dead, back at 6 px a frame with no braking (a jerk at each end; the reviewer
#       25 Nov: keep it as a fault that must fail)
#   f4  the old speeding-up slide: from rest straight to 6 px a frame, up to 12, stopped dead, back with no braking
#   j, j2  a body part (a square on the torso) 45 and 30 px out on one frame and back
#   (and on the joints, scripts/motion2.py --plant jump|snap|c: a hand 45 px on one frame, a hand from rest to 30 px a frame, the head 3 px
#    out and back)
# What must PASS:
#   k   a fast smooth head turn: the face (a 360 x 360 square round the eyes) moving 1, 2, 3, 4, 5, 6, 6, 5, 4, 3, 2, 1 px a frame, held
#       two frames and back the same way (the reviewer, 25 Nov: after the change a soft, fast head turn must still pass)
#   f   the whole picture sliding 5 px a frame for 8 frames, built up (1, 2, 3, 4) and braked (4, 3, 2, 1) over 4 frames each end
#   f2  the whole picture speeding up 2, 4, 6, 7 ... 12 px a frame and braking 9, 7, 5, 3, 1 (an accelerating turn inside the 12 px step)
# The built-up slides hold two frames where they end and glide back the same way (built up and braked). The eyes and the texts the check
# watches are moved with the picture. Slides go where the film's own faces move at most 2 px a frame, so the slide is the only movement;
# planted frames lie inside one shot, away from the film's own fails.
#
#   usage: python scripts/flicker_proof.py <render.mp4> <regions.jsonl> <its flicker report.txt> <planted.mp4> <proof report.txt>
import importlib, json, math, os, subprocess, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
# (the measure under proof: FLICKER_MODULE=flicker2 for the new one, with FLICKER_ROOT = the engine folder whose camera matrices belong to the render)
fl = importlib.import_module(os.environ.get("FLICKER_MODULE", "flicker"))
ROOT = os.environ.get("FLICKER_ROOT")

W, H = fl.W, fl.H
BACK = 6      # (px a frame the picture glides back after a slide: a steady movement inside the 12 px step)

def main():
    src, regp, rep, dst, outp = sys.argv[1:6]
    regions = {}
    for line in open(regp, encoding="utf-8"):
        if line.startswith("{"): r = json.loads(line); regions[r["F"]] = r
    rows = {}
    for line in open(rep, encoding="utf-8"):
        p = line.rstrip("\n").split("\t")
        if len(p) == 7 and p[0].isdigit(): rows[int(p[0])] = [int(x) for x in p[1:]]
    N = max(regions) + 1
    quiet = {t for t, r in rows.items() if r[0] < 300 and r[1] == 0 and r[2] == 0 and r[3] < 2000 and r[4] <= 40 and r[5] == 0}      # (both measures quiet)
    calm = {t for t, r in rows.items() if r[0] < 500 and r[1] <= 20 and r[2] == 0}      # (the corrected measure well under its limits: for the long slides)
    shot = lambda t: regions.get(t, {}).get("shot")
    big = lambda t, rmin: [e for e in regions.get(t, {}).get("eyes", []) if e[2] >= rmin and e[2] <= e[0] <= W - e[2] and e[2] <= e[1] <= H - e[2]]      # (eyes whole inside the picture: in a shot with the face above the frame (3D step 1 E) a plant there moved nothing and passed)
    taken = set()
    def free(a, b): return all(k not in taken for k in range(a - 4, b + 5))
    def pick(ok, span=1, pool=None, order=None):
        pool = quiet if pool is None else pool
        for t in (order or sorted(pool)):
            if t < 15 or t + span + 2 >= N or not free(t, t + span): continue
            if len({shot(k) for k in range(t - 2, t + span + 2)}) == 1 and all(k in pool for k in range(t - 2, t + span + 2)) and ok(t):
                taken.update(range(t - 2, t + span + 2)); return t
        return None
    # the point cases
    A = pick(lambda t: big(t, 20))
    B = pick(lambda t: regions.get(t, {}).get("bub") and regions.get(t - 1, {}).get("bub") and regions.get(t + 1, {}).get("bub")); BOX = "bub"
    if B is None: B = pick(lambda t: regions.get(t, {}).get("text")); BOX = "text"
    C = pick(lambda t: big(t, 60)) or pick(lambda t: big(t, 35))
    D = pick(lambda t: regions.get(t, {}).get("text") and not regions.get(t, {}).get("bub") and regions.get(t - 1, {}).get("text") == regions[t]["text"] and regions.get(t + 1, {}).get("text") == regions[t]["text"])
    E = pick(lambda t: big(t, 20))
    G = pick(lambda t: big(t, 60)) or pick(lambda t: big(t, 35))
    # (the new measure's own cases: a body part (a 160 x 160 square on the torso, below the face) out on one frame and back, 45 px (more than
    #  the 40 px body step) and 30 px (inside it: a jump out and back is never movement)
    J = pick(lambda t: big(t, 25)); J2 = pick(lambda t: big(t, 25))
    # the slides: (name, steps a frame, the frame of the extra jump in the slide or None, the jump in px, must fail)
    up = lambda v: [max(1, round(v * k / 4)) for k in (1, 2, 3)]      # (built up over 3 frames)
    slides = [("f", [1, 2, 3, 4] + [5] * 8 + [4, 3, 2, 1], None, 0, False, True), ("f2", [2, 4, 6, 7, 8, 9, 10, 11, 12, 9, 7, 5, 3, 1], None, 0, False, True),
              ("f2b", [2, 4, 6, 8, 10, 12, 13, 14, 11, 8, 6, 4, 2], None, 0, True, True), ("f3", [5] * 12, None, 0, True, False), ("f4", list(range(6, 13)), None, 0, True, False)]
    for s in (3, 6, 9):
        for j in (2, 3): slides.append((f"h{sum(1 for q in slides if q[0].startswith('h')) + 1}", up(s) + [s] * 9 + up(s)[::-1], 3 + 4, j, True, True))
    # (h first in the shot with the fastest real head turn of the film, as the review asked; then wherever there is room)
    def eyestep(t):
        a, b = regions.get(t, {}).get("eyes", []), regions.get(t + 1, {}).get("eyes", [])
        return max((min(math.hypot(p[0] - q[0], p[1] - q[1]) for q in b) for p in a), default=0) if a and b and shot(t) == shot(t + 1) else 0
    fast = max(range(N - 1), key=eyestep); fastShot = shot(fast)
    plan, noroom = {}, []
    # k: the face alone turning fast but smoothly (built up and braked), where the film's own faces are still
    kv = [1, 2, 3, 4, 5, 6, 6, 5, 4, 3, 2, 1]; kL = 2 * len(kv) + 2
    kt = pick(lambda t: big(t, 35) and all(eyestep(q) <= 2 and big(q, 35) for q in range(t - 1, t + kL + 1)) and not any(regions.get(q, {}).get("bub") for q in range(t, t + kL)), kL, calm)
    kOff = {}
    if kt is not None:
        o = 0; offs = []
        for v in kv: o += v; offs.append(o)
        offs += [o, o]
        for v in kv: o -= v; offs.append(o)
        kc = face(kt, 35) if False else None
        for i, o in enumerate(offs): kOff[kt + i] = o
    for name, steps, jat, j, bad, ramped in slides:
        total = sum(steps); L = len(steps) + 2 + (len(steps) if ramped else math.ceil(total / BACK))
        still = lambda t, L=L: all(eyestep(k) <= 2 for k in range(t - 1, t + L + 1))      # (the film's own faces nearly still: the slide is the only movement)
        need = (lambda t, jat=jat, still=still: big(t + jat, 25) and still(t)) if jat is not None else (lambda t, steps=steps, still=still: all(big(k, 15) for k in range(t, t + len(steps))) and still(t))      # (faces in the picture all through the slide)
        order = sorted(calm, key=lambda t: (0 if name.startswith("h") and shot(t) == fastShot else 1, t))
        t0 = pick(lambda t: need(t) and not any(regions.get(k, {}).get("bub") for k in range(t, t + L)), L, calm, order)
        if t0 is None: noroom.append(name); continue      # (no quiet window long enough in this film: reported, not run)
        off, k = [], 0
        for st in steps: k += st; off.append(k)
        off += [k, k]
        if ramped:
            for st in steps: k -= st; off.append(k)      # (back the same way: built up and braked)
        else:
            while k > 0: k = max(0, k - BACK); off.append(k)      # (the old way: from standing straight to 6 px a frame)
        plan[name] = (t0, off, jat, j, bad, steps)
    offAt, jumpAt = {}, {}
    for name, (t0, off, jat, j, bad, steps) in plan.items():
        for i, o in enumerate(off): offAt[t0 + i] = o
        if jat is not None: jumpAt[t0 + jat] = j
    # the planted copy
    out = subprocess.Popen(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", "30", "-i", "-",
                            "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", dst], stdin=subprocess.PIPE)
    YY, XX = fl.YY, fl.XX
    face = lambda t, rmin: (lambda es: (int(np.mean([e[0] for e in es])), int(np.mean([e[1] for e in es]))))(big(t, rmin))
    kC = face(kt, 35) if kt is not None else None      # (the face square for k, where the face is when k starts)
    def moveSquare(fr, cx, cy, dx):
        x0, y0, x1, y1 = max(0, cx - 180), max(0, cy - 180), min(W - dx, cx + 180), min(H, cy + 180); fr[y0:y1, x0 + dx:x1 + dx] = fr[y0:y1, x0:x1].copy()
    for F, fr in enumerate(fl.frames(src)):
        fr = fr.copy()
        if F == A:
            x, y, r = big(A, 20)[0]; r = int(r * 0.75); skin = fr[min(H - 1, y + int(1.6 * r)), x].copy(); d = (XX - x) ** 2 + (YY - y) ** 2
            fr[d <= r * r] = skin; fr[(d <= r * r) & (d >= (r - 4) ** 2)] = (20, 16, 18)
        if F == B:
            x0, y0, x1, y1 = regions[B][BOX][0]; x0, y0, x1, y1 = max(0, x0), max(0, y0), min(W - 3, x1), min(H, y1); fr[y0:y1, x0 + 3:x1 + 3] = fr[y0:y1, x0:x1].copy()
        if F == C: moveSquare(fr, *face(C, 35), 3)
        if F == D:
            x0, y0, x1, y1 = regions[D]["text"][0]; x0, x1, y0, y1 = max(0, x0), min(W, x1), max(0, y0), min(H, y1); g = fl.gray(fr[y0:y1, x0:x1])
            ink = np.array([(g[:, i:i + 60] < 60).sum() for i in range(0, max(1, x1 - x0 - 200), 10)]); i0 = x0 + 10 * int(ink.argmax()); j0 = i0 + 130 if i0 + 190 < x1 else i0 - 130
            fr[y0:y1, i0:i0 + 60] = fr[y0:y1, j0:j0 + 60].copy()
        if F == E:
            x, y, r = big(E, 20)[0]; r2 = max(4, int(r * 0.5)); m = (XX - x) ** 2 + (YY - y) ** 2 <= r2 * r2; sh = np.roll(fr, 6, axis=1); fr[m] = sh[m]
        if F == G: moveSquare(fr, *face(G, 35), 11)
        for (TJ, dj) in ((J, 45), (J2, 30)):
            if TJ is not None and F == TJ:
                cx, cy = face(TJ, 25); r0 = big(TJ, 25)[0][2]; ty = min(H - 100, cy + int(3.2 * r0)); x0, y0, x1, y1 = max(0, cx - 80), max(0, ty - 80), min(W - dj, cx + 80), min(H, ty + 80)
                fr[y0:y1, x0 + dj:x1 + dj] = fr[y0:y1, x0:x1].copy()
        if F in kOff and kOff[F]:      # (k: the face square moved kOff px to the left, the picture under it as it was)
            ko = kOff[F]; x0, y0, x1, y1 = max(ko, kC[0] - 180), max(0, kC[1] - 180), min(W, kC[0] + 180), min(H, kC[1] + 180); src0 = fr[y0:y1, x0:x1].copy(); fr[y0:y1, x0 - ko:x1 - ko] = src0
        o = offAt.get(F, 0)
        if o: fr = np.concatenate([fr[:, o:], np.repeat(fr[:, -1:], o, axis=1)], axis=1)      # (the picture slid o px to the left)
        if F in jumpAt:      # (the face the extra j px on, the way the picture moves, on this one frame)
            cx, cy = face(F, 25)
            x0, y0, x1, y1 = max(0, cx - o - 180), max(0, cy - 180), min(W, cx - o + 180), min(H, cy + 180); jj = jumpAt[F]
            fr[y0:y1, x0:x1 - jj] = fr[y0:y1, x0 + jj:x1].copy()
        out.stdin.write(fr.tobytes())
    out.stdin.close(); out.wait()
    # the check, with the eyes and texts moved with the picture
    regP = {}
    for F, r in regions.items():
        o = offAt.get(F, 0); r2 = dict(r)
        ko = kOff.get(F, 0)
        r2["eyes"] = [[e[0] - o - (ko if kC and abs(e[0] - kC[0]) < 180 and abs(e[1] - kC[1]) < 180 else 0), e[1], e[2]] for e in r.get("eyes", [])]; r2["text"] = [[b[0] - o, b[1], b[2] - o, b[3]] for b in r.get("text", [])]
        regP[F] = r2
    rowsP, fails = fl.check(dst, regP, ROOT) if ROOT else fl.check(dst, regP)
    failAt = {t: why for t, why in fails}; raw = {r[0]: r for r in rowsP}
    def report(name, frames, want_fail, desc):
        hit = [(u, failAt[u]) for u in frames if u in failAt]
        rawover = [u for u in frames if u in raw and (raw[u][4] > fl.FRAME_MAX or raw[u][5] > fl.EYE_MAX or raw[u][6] > fl.TEXT_MAX)]
        ok = bool(hit) == want_fail
        lines = [f"{name}) {desc}: frames {frames[0] + 1}-{frames[-1] - 1} ({(frames[0] + 1) / 30:.2f}-{(frames[-1] - 1) / 30:.2f} s, shot {shot(frames[0] + 1)}): {'FAILED' if hit else 'passed'} by the check, it must {'fail' if want_fail else 'pass'} ({'right' if ok else 'WRONG'})"]
        lines += [f"     frame {u} ({u / 30:.2f} s): " + "; ".join(why) for u, why in hit[:4]] + ([f"     ... and {len(hit) - 4} frames more"] if len(hit) > 4 else [])
        lines.append(f"     the raw measure (no movement taken out) is over its limits on frames: {rawover or 'none'}")
        return ok, lines
    L = [f"flicker proof: faults planted in {src} -> {dst}",
         f"parameters: DIFF {fl.DIFF}, SAME {fl.SAME}, picture {fl.FRAME_MAX}, eye {fl.EYE_MAX}, text {fl.TEXT_MAX} pixels; movement step at most {fl.STEP} px, 5 x 5 patch match under {fl.MATCH} grey levels, flat patch under {fl.TEX}, step before and after differ by at most {fl.ACCEL_PART:.2f} of the longer or {fl.ACCEL} px; the fastest real head turn of the film: frame {fast} (shot {fastShot}, {eyestep(fast):.0f} px a frame)", ""]
    allok = True
    point = {"a": (A, "an empty eye ring on one frame"), "b": (B, ("a speech bubble" if BOX == "bub" else "a caption (no quiet frame with a bubble)") + " 3 px out on one frame and back"),
             "c": (C, "a close-up's face 3 px out on one frame and back"), "d": (D, "a caption with one letter changed on one frame"), "e": (E, "a pupil 6 px out on one frame and back"),
             "g": (G, "a close-up's face 11 px out on one frame and back (inside the 12 px movement step)"),
             "j": (J, "a body part (a square on the torso) 45 px out on one frame and back (more than the 40 px body step)"), "j2": (J2, "a body part 30 px out on one frame and back (inside the 40 px body step: a jump out and back)")}
    for name, (t, desc) in point.items():
        if t is None: L.append(f"{name}) {desc}: NO ROOM in this film (not run)"); allok = False; continue
        ok, lines = report(name, list(range(t - 1, t + 2)), True, desc); allok &= ok; L += lines
    descS = {"f": "the whole picture sliding 5 px a frame, built up and braked over 4 frames (1-2-3-4, 5 x 8, 4-3-2-1), back the same way",
             "f2": "the whole picture speeding up 2, 4, 6, 7 ... 12 px a frame and braking 9, 7, 5, 3, 1, back the same way",
             "f2b": "the whole picture speeding up to 14 px a frame (over the 12 px step), built up and braked",
             "f3": "the old slide: from rest straight to 5 px a frame, stopped dead, back at 6 px a frame with no braking (jerks)",
             "f4": "the old speeding-up slide: from rest straight to 6 px a frame, up to 12, stopped dead, back with no braking (jerks)"}
    for name, (t0, off, jat, j, bad, steps) in plan.items():
        desc = descS.get(name) or f"a face {j} px out on one frame and back on top of the whole picture moving {max(steps)} px a frame"
        frames = list(range(t0 - 1, t0 + len(off) + 1)) if jat is None else list(range(t0 + jat - 1, t0 + jat + 2))
        ok, lines = report(name, frames, bad, desc); allok &= ok; L += lines
    if kt is None: L.append("k) a fast smooth head turn: NO ROOM in this film (not run)"); allok = False
    else:
        ok, lines = report("k", list(range(kt - 1, kt + len(kOff) + 1)), False, "a fast smooth head turn: the face moving 1, 2 ... 6, 6 ... 2, 1 px a frame, held two frames and back the same way"); allok &= ok; L += lines
    for name in noroom: L.append(f"{name}) NO ROOM in this film: no quiet window long enough (not run)"); allok = False
    inPlan = set()
    for t in [A, B, C, D, E, G, J, J2]:
        if t is not None: inPlan.update(range(t - 1, t + 2))
    if kt is not None: inPlan.update(range(kt - 1, kt + len(kOff) + 1))
    for name, (t0, off, *_r) in plan.items(): inPlan.update(range(t0 - 1, t0 + len(off) + 1))
    other = sorted(u for u in failAt if u not in inPlan)
    L += ["", f"fails outside the planted frames (the film's own): {other or 'none'}",
          f"RESULT: the planted cases {'all as they must be' if allok else 'NOT all as they must be'}"]
    open(outp, "w", encoding="utf-8").write("\n".join(L) + "\n"); print("\n".join(L))

if __name__ == "__main__":
    main()

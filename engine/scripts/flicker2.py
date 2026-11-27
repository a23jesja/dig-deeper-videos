# The flicker check, new measure (the automation session's decision of 24 Nov, granskning/beslut-fran-molnsessionen.md on claude/emu-short-cloud
# b889695). The RULE is unchanged (DAILY-RULES, Impossible things 9): nothing may blink, shimmer or jump out and back. What changes is how
# movement is told from flicker (scripts/flicker.py is the old measure; this one imports it and changes only that):
#   1. the camera's own movement is taken out first: the frames before and after are warped onto this frame by the camera matrices
#      (src/craft/cabin3d/cam/<shot>.json; an affine map fitted to points round the figures, projected with both frames' matrices);
#   2. a flickering pixel (different from both neighbours while they are alike) is still explained as movement only by a steady step: the
#      frame before matches v0 behind and the frame after v1 ahead, v0 and v1 the same way and close in size (flicker.consistent);
#   3. the step may be up to 12 px for eyes (their circles), text (its boxes) and outlines (the ink's dark colour), as before, and up to
#      40 px for everything else (the body's fills, clothes, the room): a body part may move fast; its build-up over 3 frames is checked by
#      scripts/motion2.py on the figures' joints;
#   4. a jump out and back is never explained, whatever its size (v0 and v1 point opposite ways);
#   1b. a shot with no camera matrices (a flat film): the whole picture's own shift is MEASURED instead (phase correlation on the frame) and
#      taken out the same way; that pan may move at most PAN_MAX px a frame and change speed by at most JERK px from frame to frame
#   5. the faces' own movement is MEASURED in the pixels (the reviewer, 25 Nov: flicker can come from the rendering while the joints stand
#      still): round every eye, the patch of picture is matched from the frame before to this one by phase correlation (to a tenth of a
#      pixel), after the camera's movement is taken out. Along each face's track: at most FACE_MAX px a frame; its speed may change by at
#      most JERK px from one frame to the next (12 px reached in about 3 frames: a jerk fails); and it may never go out and back: the speed
#      change (in x or in y) changing sign twice within 3 frames, the outer changes over OUTBACK px and the middle one over OUTBACK_MID, fails (a 3 px step out and back gives +3,
#      -6, +3; a turn that speeds up and brakes changes sign once).
#
#   usage: python scripts/flicker2.py <video.mp4> <regions.jsonl> --cams <engine dir> [--out report.txt]
import json, math, os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import flicker as fl

W, H = fl.W, fl.H
DIFF, SAME, FRAME_MAX, EYE_MAX, TEXT_MAX, MATCH, PATCH, TEX = fl.DIFF, fl.SAME, fl.FRAME_MAX, fl.EYE_MAX, fl.TEXT_MAX, fl.MATCH, fl.PATCH, fl.TEX
STEP, BODY_STEP = 12, 40
FACE_MAX, JERK, OUTBACK, OUTBACK_MID, FACE_R, CONF, PAN_MAX = 12.0, 4.5, 1.0, 2.5, 12, 15, 12.0      # (CONF: below it the match is not trusted (a blink or a lid changes the patch: v1y's blinks gave 8-12 and false 15-25 px shifts; real matches 17-190); OUTBACK_MID: the middle change of an out-and-back is twice the step (+j, -2j, +j), over the measure's noise of about 1 px)      # (the face track: px a frame, speed change a frame, out-and-back change; eyes smaller than FACE_R px are not tracked)
S12 = fl.STEADY
FACEBIG = {}
S40 = [(dy, dx) for dy in range(-BODY_STEP, BODY_STEP + 1) for dx in range(-BODY_STEP, BODY_STEP + 1)
       if (dy or dx) and dy * dy + dx * dx <= BODY_STEP * BODY_STEP and (dy * dy + dx * dx <= STEP * STEP or (dy % 2 == 0 and dx % 2 == 0))]
INK = np.array([36, 23, 38], np.int16)
# the old measure's own module-level names, used by flicker_proof when this measure is chosen
YY, XX, gray, frames, STEADY, ACCEL, ACCEL_PART = fl.YY, fl.XX, fl.gray, fl.frames, S40, fl.ACCEL, fl.ACCEL_PART

def explained(G0, G1, G2, ys, xs, shifts, chunk=1500):
    """flicker.explained in chunks (the 40 px set has about 1300 steps)"""
    out = np.zeros(len(ys), bool)
    for i in range(0, len(ys), chunk): out[i:i + chunk] = fl.explained(G0, G1, G2, ys[i:i + chunk], xs[i:i + chunk], shifts)
    return out

def affine(P0, P1, pts):
    """the 2 x 3 map taking where the points are in the frame with matrix P0 to where they are with P1 (least squares), fitted only on points
    well in front of the lens that land near the picture in both frames: in v57's B1 and E the captain stands beside or behind the camera, his
    points projected wildly and the fitted map warped the whole frame (the measure's run on v57, 25 Nov); fewer than 3 such points: no map"""
    def pr(P, q): v = P @ np.array([q[0], q[1], q[2], 1.0]); return (v[:2] / v[2], v[2])
    keep = []
    for q in pts:
        (a0, w0), (a1, w1) = pr(P0, q), pr(P1, q)
        if w0 > 0.3 and w1 > 0.3 and all(-W < a[0] < 2 * W and -H < a[1] < 2 * H for a in (a0, a1)): keep.append((a0, a1))
    if len(keep) < 3: return np.array([[1.0, 0.0, 0.0], [0.0, 1.0, 0.0]])
    A = np.array([k[0] for k in keep]); B = np.array([k[1] for k in keep])
    X = np.c_[A, np.ones(len(A))]; M, *_ = np.linalg.lstsq(X, B, rcond=None); return M.T      # (2 x 3)

def warp(img, M):
    """img (from the other frame) seen in this frame: sample the other frame at M^-1 of each pixel (bilinear)"""
    A = np.r_[M, [[0, 0, 1]]]; Ai = np.linalg.inv(A)
    xs = Ai[0, 0] * fl.XX + Ai[0, 1] * fl.YY + Ai[0, 2]; ys = Ai[1, 0] * fl.XX + Ai[1, 1] * fl.YY + Ai[1, 2]
    x0 = np.clip(np.floor(xs).astype(int), 0, W - 2); y0 = np.clip(np.floor(ys).astype(int), 0, H - 2); fx = np.clip(xs - x0, 0, 1)[..., None]; fy = np.clip(ys - y0, 0, 1)[..., None]
    f = img.astype(np.float32)
    out = (f[y0, x0] * (1 - fx) * (1 - fy) + f[y0, x0 + 1] * fx * (1 - fy) + f[y0 + 1, x0] * (1 - fx) * fy + f[y0 + 1, x0 + 1] * fx * fy)
    return np.clip(out + 0.5, 0, 255).astype(np.uint8)

_HANN = {}
def phase_shift(p0, p1):
    """(dx, dy, confidence): how far the picture in p1 lies from p0 (p1 ~ p0 moved by dx, dy), from the peak of the phase correlation, refined to a
    tenth of a pixel by a parabola through the peak and its neighbours"""
    h, w = p0.shape
    if (h, w) not in _HANN: _HANN[(h, w)] = np.outer(np.hanning(h), np.hanning(w)).astype(np.float32)
    win = _HANN[(h, w)]; a = (p0 - p0.mean()) * win; b = (p1 - p1.mean()) * win
    Fa, Fb = np.fft.fft2(a), np.fft.fft2(b); X = Fb * np.conj(Fa); X /= np.abs(X) + 1e-6; r = np.real(np.fft.ifft2(X))
    iy, ix = np.unravel_index(int(np.argmax(r)), r.shape); pk = r[iy, ix]
    def sub(m, c, p):
        d = m - 2 * c + p; return 0.0 if abs(d) < 1e-9 else 0.5 * (m - p) / d
    dy = iy + sub(r[(iy - 1) % h, ix], pk, r[(iy + 1) % h, ix]); dx = ix + sub(r[iy, (ix - 1) % w], pk, r[iy, (ix + 1) % w])
    if dy > h / 2: dy -= h
    if dx > w / 2: dx -= w
    return dx, dy, float(pk / (r.std() + 1e-9))

def face_tracks(meas):
    """meas: {frame: [(x, y, r, dx, dy, conf)]} (each eye's measured move from the frame before). Links each eye to its eye in the frame before
    and applies the three rules along each track. Returns (fails {frame: [why]}, largest {speed, jerk, outback})"""
    fails, big = {}, {"speed": (0, None), "jerk": (0, None), "outback": (0, None)}; tracks = {}
    for t in sorted(meas):
        nxt = {}
        for (x, y, r, dx, dy, cf) in meas[t]:
            prev = tracks.get(t - 1, {}); best = min(prev, key=lambda q: (q[0] - x) ** 2 + (q[1] - y) ** 2, default=None)
            hist = prev[best] if best is not None and (best[0] - x) ** 2 + (best[1] - y) ** 2 <= r * r else []
            if cf < CONF: nxt[(x, y)] = []; continue      # (no clear match: the track starts again)
            hist = hist + [(t, dx, dy)]; nxt[(x, y)] = hist[-4:]
            sp = math.hypot(dx, dy); big["speed"] = (sp, t) if sp > big["speed"][0] else big["speed"]
            if sp > FACE_MAX: fails.setdefault(t, []).append(f"a face moves {sp:.1f} px in a frame (at most {FACE_MAX:.0f})")
            if len(hist) >= 2:
                j = math.hypot(hist[-1][1] - hist[-2][1], hist[-1][2] - hist[-2][2]); big["jerk"] = (j, t) if j > big["jerk"][0] else big["jerk"]
                if j > JERK: fails.setdefault(t, []).append(f"a face's speed changes {j:.1f} px in one frame (at most {JERK:.1f}: 12 px a frame built up over about 3 frames)")
            if len(hist) >= 4:
                for ax in (1, 2):
                    a3 = [hist[i][ax] - hist[i - 1][ax] for i in (1, 2, 3)]
                    if abs(a3[0]) > OUTBACK and abs(a3[2]) > OUTBACK and abs(a3[1]) > OUTBACK_MID and a3[0] * a3[1] < 0 and a3[1] * a3[2] < 0:
                        big["outback"] = (max(abs(q) for q in a3), t) if max(abs(q) for q in a3) > big["outback"][0] else big["outback"]
                        fails.setdefault(hist[-3][0], []).append(f"a face goes out and back: its speed change {', '.join(f'{q:+.1f}' for q in a3)} px in {'xy'[ax - 1]} (sign changes twice in 3 frames; reported on the frame that went out)")
        tracks[t] = nxt
    return fails, big

START = 0
def check(path, regions, root=None, fps=30):
    cams, pts, fpts = {}, {}, {}; FACE = {}; PAN = {}
    if root:
        spec = json.load(open(os.path.join(root, "src/craft/cabin3d/shots.json"), encoding="utf-8")); figs = spec.get("figs", {})
        for s in spec["shots"]:
            p = os.path.join(root, f"src/craft/cabin3d/cam/{s['id']}.json")
            if os.path.exists(p): cams[s["id"]] = [np.array(P, float) for P in json.load(open(p, encoding="utf-8"))["frames"]]
        pts = [(x + dx, y, z) for (x, y) in figs.values() for dx in (-0.5, 0.5) for z in (0.0, 0.9, 1.75)]
        # (per shot, only the figure the camera focuses on: with both figures, points of the one far off to the side went in and out of the
        #  picture from frame to frame and the fitted map jittered (v57's A, 0.27-0.30 s))
        fpts = {s["id"]: [(figs[s["cam"]["focus"]][0] + dx, figs[s["cam"]["focus"]][1], z) for dx in (-0.4, 0.0, 0.4) for z in (0.0, 0.5, 0.9, 1.3, 1.75)]
                for s in spec["shots"] if s.get("cam", {}).get("focus") in figs}
    start = {}
    for F in sorted(regions):
        sh = regions[F].get("shot"); start.setdefault(sh, F)
    seq, idx, rows, fails = [], [], [], []
    first, prev, steps = None, None, []
    for F, fr in enumerate(fl.frames(path), START):      # (--start N: a part of the film rendered from frame N, for a quick check of one place)
        if first is None: first = fr.copy()
        if prev is not None: steps.append(fl.changed(prev, fr))
        prev = fr; seq.append(fr); idx.append(F)
        if len(seq) < 3: continue
        if len(seq) > 3: seq.pop(0); idx.pop(0)
        t = F - 1
        sh = [regions.get(k, {}).get("shot") for k in (t - 1, t, t + 1)]
        a, b, c = seq; a0, c0 = a, c; Mab = None      # (as they are: the captions sit on the screen and do not move with the camera)
        same_shot = sh[1] is not None and sh[0] == sh[1] == sh[2]
        if same_shot and sh[1] in cams and pts:      # (the camera's movement taken out: the frames before and after warped onto this one)
            C = cams[sh[1]]; k = t - start[sh[1]]; pp = fpts.get(sh[1], pts)
            if 1 <= k < len(C) - 1:
                Mab, Mcb = affine(C[k - 1], C[k], pp), affine(C[k + 1], C[k], pp)
                def moves(M):      # (the largest shift the map makes at the picture's corners: under half a pixel it is not applied, since resampling
                    #  alone softens the edges and made flicker of its own, B1 v57 43 px in an eye against 38 unwarped)
                    return max(np.hypot(*(M @ np.array([x, y, 1.0]) - np.array([x, y]))) for x in (0, W) for y in (0, H))
                if moves(Mab) >= 0.5: a = warp(a, Mab)
                if moves(Mcb) >= 0.5: c = warp(c, Mcb)
        if same_shot or (sh[0] == sh[1] and sh[1] is not None):      # (the face track: each eye's patch from the frame before (camera taken out) to this one)
            ga, gb = fl.gray(a0).astype(np.float32), fl.gray(b).astype(np.float32); ms = []      # (the frames as they are, no resampling: the camera's own shift at the face is subtracted below)
            for (ex, ey, er) in regions.get(t, {}).get("eyes", []):
                if er < FACE_R: continue
                hh = int(min(128, max(24, 2.2 * er))); x0, y0 = int(ex) - hh, int(ey) - hh
                if x0 < 0 or y0 < 0 or x0 + 2 * hh > W or y0 + 2 * hh > H: continue
                dx, dy, cf = phase_shift(ga[y0:y0 + 2 * hh, x0:x0 + 2 * hh], gb[y0:y0 + 2 * hh, x0:x0 + 2 * hh])
                if Mab is not None:      # (what the lens alone did to that point: where it was in the frame before, by the inverse map)
                    Ai = np.linalg.inv(np.r_[Mab, [[0, 0, 1]]]); px = Ai @ np.array([ex, ey, 1.0]); dx -= ex - px[0]; dy -= ey - px[1]
                ms.append((ex, ey, er, dx, dy, cf))
            FACE[t] = ms
        if same_shot and not (sh[1] in cams and pts):      # (1b: no camera data: the whole picture's shift measured and taken out)
            g0, g1, g2 = (fl.gray(x).astype(np.float32) for x in (a, b, c))
            s0 = phase_shift(g0[::2, ::2], g1[::2, ::2]); s1 = phase_shift(g1[::2, ::2], g2[::2, ::2])
            v0 = (2 * s0[0], 2 * s0[1]) if s0[2] >= 20 else (0.0, 0.0); v1 = (2 * s1[0], 2 * s1[1]) if s1[2] >= 20 else (0.0, 0.0)
            PAN[t] = v1
            def shift_img(img, dx, dy):
                return warp(img, np.array([[1.0, 0.0, dx], [0.0, 1.0, dy]]))
            # (taken out only when the pan is steady, the step before and after the same way and close in size, so a whole picture that jumps
            #  out and back is never "taken out"; and only when it lowers the flicker: a pan measured on a popping caption or a moving figure
            #  warped the whole frame and made flicker that was not there, round 2 on the eye patch film)
            n0, n1 = math.hypot(*v0), math.hypot(*v1)
            steady = n0 >= 0.5 and n1 >= 0.5 and v0[0] * v1[0] + v0[1] * v1[1] > 0 and math.hypot(v0[0] - v1[0], v0[1] - v1[1]) <= JERK      # (the same way, the change within the jerk limit (a bigger change is the jerk rule's); at 2 px the measuring noise of 0.1-0.2 px left f2's speed-up unexplained)
            if steady:
                a2, c2 = shift_img(a, v0[0], v0[1]), shift_img(c, -v1[0], -v1[1])
                if int(fl.flicker_map(a2, b, c2).sum()) < int(fl.flicker_map(a, b, c).sum()): a, c = a2, c2
                else: PAN[t] = (0.0, 0.0)
            else: PAN[t] = v1 if n1 >= 0.5 and n0 >= 0.5 else (0.0, 0.0)
        reg = regions.get(t, {"eyes": [], "text": []})
        TXT = np.zeros((H, W), bool)
        for (x0, y0, x1, y1) in reg["text"]: TXT[max(0, y0):max(0, y1), max(0, x0):max(0, x1)] = True
        def unexplained(A, C, txt_unwarped):
            """the flickering pixels no steady step explains, with A and C as the frames before and after (the caption boxes on the frames as they are)"""
            raw = fl.flicker_map(A, b, C)
            if txt_unwarped is not None and TXT.any(): raw = np.where(TXT, fl.flicker_map(a0, b, c0), raw)
            if sh[1] is not None and not same_shot: raw[:] = False
            m = raw.copy()
            if raw.any():
                G = [fl.gray(x) for x in (A, b, C)]; G0 = [fl.gray(x) for x in (a0, b, c0)]; ys, xs = np.nonzero(m)
                tight = np.zeros(len(ys), bool)      # (the 12 px class: eyes, text, outlines)
                for (x, y, r) in reg["eyes"]: tight |= (xs - x) ** 2 + (ys - y) ** 2 <= r * r
                for (x0, y0, x1, y1) in reg["text"]: tight |= (xs >= x0) & (xs < x1) & (ys >= y0) & (ys < y1)
                tight |= np.abs(b[ys, xs].astype(np.int16) - INK).max(1) < 30
                ok = np.zeros(len(ys), bool); intxt = TXT[ys, xs]
                for sel, GG in ((~intxt, G), (intxt, G0)):      # (caption pixels explained on the unwarped frames)
                    t12, t40 = sel & tight, sel & ~tight
                    if t12.any(): ok[t12] = explained(*GG, ys[t12], xs[t12], S12)
                    if t40.any(): ok[t40] = explained(*GG, ys[t40], xs[t40], S40)
                m[ys[ok], xs[ok]] = False
            return raw, m
        raw, m = unexplained(a, c, True)
        if a is not a0 or c is not c0:
            # (a pixel flickers only if neither way explains it: with the camera taken out, or as a steady step on the frames as they are;
            #  resampling the warped frames alone softened edges and made flicker of its own, B1 v57 43 px in an eye against 38; a jump out and
            #  back is explained by neither)
            raw_u, m_u = unexplained(a0, c0, None); m = m & m_u; raw = raw & raw_u
        n0 = int(raw.sum()); eye0 = max([fl.in_circle(raw, *e) for e in reg["eyes"]] or [0]); txt0 = max([fl.in_box(raw, bx) for bx in reg["text"]] or [0])
        n = int(m.sum())
        eye = max([fl.in_circle(m, *e) for e in reg["eyes"]] or [0]); txt = max([fl.in_box(m, bx) for bx in reg["text"]] or [0])
        rows.append((t, n, eye, txt, n0, eye0, txt0))
        why = []
        if n > FRAME_MAX: why.append(f"{n} pixels flicker in the picture (at most {FRAME_MAX})")
        if eye > EYE_MAX: why.append(f"{eye} pixels flicker in an eye (at most {EYE_MAX})")
        if txt > TEXT_MAX: why.append(f"{txt} pixels flicker in a text or bubble (at most {TEXT_MAX})")
        if why: fails.append((t, why))
    ffails, fbig = face_tracks(FACE); FACEBIG.update(fbig)
    # (1b: the measured pan, frame to frame: at most PAN_MAX px a frame, its speed changing at most JERK px a frame)
    pk = sorted(PAN); big_pan = (0.0, None)
    for i, t in enumerate(pk):
        sp = math.hypot(*PAN[t]); big_pan = (sp, t) if sp > big_pan[0] else big_pan
        if sp > PAN_MAX: ffails.setdefault(t, []).append(f"the whole picture moves {sp:.1f} px in a frame (at most {PAN_MAX:.0f})")
        if i and pk[i - 1] == t - 1 and math.hypot(PAN[t][0] - PAN[t - 1][0], PAN[t][1] - PAN[t - 1][1]) > JERK and max(sp, math.hypot(*PAN[t - 1])) >= 0.5:
            ffails.setdefault(t, []).append(f"the whole picture's speed changes {math.hypot(PAN[t][0] - PAN[t - 1][0], PAN[t][1] - PAN[t - 1][1]):.1f} px in one frame (at most {JERK:.1f})")
    FACEBIG["pan"] = big_pan
    have = {t for t, _ in fails}
    for t, why in ffails.items():
        if t in have: [w.extend(why) for (u, w) in fails if u == t]
        else: fails.append((t, why))
    fails.sort(key=lambda q: q[0])
    inner = sorted(x for x in steps if x < fl.CUT); p95 = inner[int(0.95 * (len(inner) - 1))] if inner else 0
    seam = fl.changed(prev, first); fl.SEAM.update(seam=seam, p95=p95, median=inner[len(inner) // 2] if inner else 0)
    if seam > max(p95, 0.01): fails.append((F, [f"the loop: {seam * 100:.1f} % of the picture changes from the last frame to the first (95 % of frame changes inside the shots are {p95 * 100:.1f} % or less)"]))
    return rows, fails

def main():
    a = sys.argv[1:]; outp = None; root = None
    if "--out" in a: i = a.index("--out"); outp = a[i + 1]; del a[i:i + 2]
    if "--cams" in a: i = a.index("--cams"); root = a[i + 1]; del a[i:i + 2]
    if "--start" in a: i = a.index("--start"); globals()["START"] = int(a[i + 1]); del a[i:i + 2]
    video = a[0]; regions = {}
    for line in open(a[1], encoding="utf-8"):
        line = line.strip()
        if line.startswith("{"): r = json.loads(line); regions[r["F"]] = r
    rows, fails = check(video, regions, root)
    L = [f"flicker check, new measure: {video}", f"frames checked: {len(rows)}",
         f"the camera's movement taken out by its matrices: {'yes' if root else 'NO (no --cams given)'}",
         f"a pixel flickers when it differs by more than {DIFF} from the frame before and the frame after while those two differ by less than {SAME}; it is movement when a steady step explains it: up to {STEP} px in eyes, text and outlines, up to {BODY_STEP} px elsewhere (the step before and after the same way, close in size); a jump out and back is never movement",
         f"fails: more than {FRAME_MAX} flickering pixels in a frame, more than {EYE_MAX} in an eye's circle, more than {TEXT_MAX} in a box of text",
         f"largest: picture {max(r[1] for r in rows)} (frame {max(rows, key=lambda r: r[1])[0]}), eye {max(r[2] for r in rows)}, text {max(r[3] for r in rows)}; raw: picture {max(r[4] for r in rows)}, eye {max(r[5] for r in rows)}, text {max(r[6] for r in rows)}",
         f"the face track (phase correlation round each eye): largest speed {FACEBIG['speed'][0]:.1f} px a frame (frame {FACEBIG['speed'][1]}), speed change {FACEBIG['jerk'][0]:.1f} (frame {FACEBIG['jerk'][1]}), out and back {FACEBIG['outback'][0]:.1f} (frame {FACEBIG['outback'][1]}); limits {FACE_MAX:.0f} px, speed change {JERK:.1f} px, out and back (outer changes over {OUTBACK:.0f} px, middle over {OUTBACK_MID:.1f}) never",
         f"the loop: {fl.SEAM['seam'] * 100:.1f} % of the picture changes from the last frame to the first (95 % inside the shots {fl.SEAM['p95'] * 100:.1f} % or less)", ""]
    if fails:
        L.append(f"FAIL: {len(fails)} frames"); L += [f"  frame {t} ({t / 30:.2f} s): " + "; ".join(w) for t, w in fails]
    else: L.append("PASS: no frame flickers")
    L += ["", "every frame: frame, picture, eye, text, then the raw picture, eye, text"] + ["\t".join(str(v) for v in r) for r in rows]
    txt = "\n".join(L) + "\n"
    if outp: open(outp, "w", encoding="utf-8").write(txt)
    print("\n".join(L[:9 + (len(fails) + 1 if fails else 1)])); sys.exit(1 if fails else 0)

if __name__ == "__main__":
    main()

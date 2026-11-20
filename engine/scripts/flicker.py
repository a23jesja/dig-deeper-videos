# The flicker check (DAILY-RULES, Impossible things 9, Jesper 2026-11-20 after the eye patch Short): a pixel flickers on frame t when
# it differs from the frame before AND from the frame after, while those two are alike (t-1 and t+1 alike, t different). That is
# what an outline that aliases on and off, an eye drawn as an empty ring for one frame, or a bubble that jumps and jumps back does.
# A change that goes on (a movement, a fade, a cut) is not flicker: there the frame after is not like the frame before.
#
#   usage: python scripts/flicker.py <video.mp4> [regions.jsonl] [--out report.txt] [--plant planted.mp4]
#     regions.jsonl = node scripts/film_info.mjs <film> regions (each figure's eyes and every box of text, per frame)
#     --plant = write a copy of the video with two faults planted in it (an empty eye ring on one frame, a speech bubble or caption
#               moved 3 px on one frame), to show that the check stops them
#
# It fails (exit 1) and names the time when, on any frame:
#   - more than FRAME_MAX pixels flicker in the whole picture, or
#   - more than EYE_MAX pixels flicker inside an eye's circle, or more than TEXT_MAX inside a box of text.
# Compression: a pixel counts only when it differs by more than DIFF from both neighbours (in any of R, G, B) while the neighbours
# differ by less than SAME. At CRF 16-18 the encoder's noise between frames stays under about 10 levels, so it does not count.
# Movement: a thin line or a pupil that moves further in one frame than it is wide is also "there on t and not on t-1 or t+1" (the
# mate's eyes as his head turns 4 px a frame: 80-150 such pixels in an eye on every frame of the turn). That is movement, not
# flicker, and those pixels are taken out (the count before that is kept in the report as "raw"):
#   EXPLAINED BY STEADY MOVEMENT: there are steps v0 and v1 (dy, dx), each at most STEP px long, such that the 5 x 5 patch round the
#   pixel on frame t matches the frame before at the place v0 behind AND the frame after at the place v1 ahead (the mean grey difference
#   of each under MATCH levels), and v0 and v1 go on the same way: they point the same way (v0 . v1 > 0) and differ by at most a quarter
#   (ACCEL_PART) of the longer of them, or ACCEL px (a movement that speeds up or slows down). The same thing has gone on moving. And the patch on frame t has something in it that can be followed
#   (its grey levels vary by at least TEX: an edge, a line, a pupil). A flat patch (skin, sky, an eye filled with skin) is never
#   explained, because a flat patch looks the same wherever it is put.
#   Frames next to a cut are not compared across it.
#   Not explained, and so still flicker: a jump there and back (a bubble 3 px out and in: the frame after is not further on, it is back),
#   an outline that comes and goes in place, a letter changed for one frame, an eye drawn as an empty ring (flat skin where the eye was),
#   and anything that moves more than STEP px in a frame (it strobes).
import json, subprocess, sys
import numpy as np

W, H = 1080, 1920
DIFF, SAME = 40, 16
FRAME_MAX, EYE_MAX, TEXT_MAX = 2000, 40, 150

def frames(path):
    p = subprocess.Popen(["ffmpeg", "-nostdin", "-v", "error", "-i", path, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    n = W * H * 3
    while True:
        b = p.stdout.read(n)
        if len(b) < n: break
        yield np.frombuffer(b, np.uint8).reshape(H, W, 3)
    p.wait()

def flicker_map(a, b, c):
    a, b, c = (x.astype(np.int16) for x in (a, b, c))
    d1 = np.abs(b - a).max(2); d2 = np.abs(b - c).max(2); d0 = np.abs(a - c).max(2)
    return (d1 > DIFF) & (d2 > DIFF) & (d0 < SAME)

STEP, MATCH, PATCH, TEX, ACCEL, ACCEL_PART = 12, 14, 2, 10, 2, 0.25

def gray(f):
    return f.astype(np.float32) @ np.array([0.299, 0.587, 0.114], np.float32)

def explained(G0, G1, G2, ys, xs, shifts):
    """for the pixels (ys, xs): True where some step (dy, dx) in shifts makes the frame before shifted by it and the frame after shifted
    back by it look like this frame (the mean difference over a (2 PATCH + 1)^2 patch under MATCH grey levels)"""
    if len(ys) == 0: return np.zeros(0, bool)
    reach = max(max(abs(v) for v in sh) for sh in shifts); P = reach + PATCH + 1; pads = [np.pad(g, P, mode="edge") for g in (G0, G1, G2)]
    oy, ox = np.mgrid[-PATCH:PATCH + 1, -PATCH:PATCH + 1]; oy, ox = oy.ravel(), ox.ravel()
    Y, X = ys[:, None] + P + oy[None, :], xs[:, None] + P + ox[None, :]
    mid = pads[1][Y, X]; best = np.full(len(ys), np.inf, np.float32)
    live = (mid.max(1) - mid.min(1)) >= TEX      # (a flat patch is never explained)
    if not live.any(): return np.zeros(len(ys), bool)
    Y, X, mid = Y[live], X[live], mid[live]
    # which steps v0 the frame before matches (it was v0 behind) and which steps v1 the frame after matches (it will be v1 ahead)
    M0 = np.stack([np.abs(mid - pads[0][Y - ya, X - xa]).mean(1) < MATCH for (ya, xa) in shifts], 1).astype(np.float32)
    M1 = np.stack([np.abs(mid - pads[2][Y + ya, X + xa]).mean(1) < MATCH for (ya, xa) in shifts], 1)
    ok = ((M0 @ consistent(tuple(shifts))) > 0) & M1
    out = np.zeros(len(ys), bool); out[live] = ok.any(1); return out

_CONS = {}
def consistent(shifts):
    """K x K: the step before v0 and the step after v1 go on the same way (they point the same way and differ by at most ACCEL_PART of the longer one, or ACCEL px): a movement that speeds up or slows down. A step out and a step back point opposite ways and never pass"""
    if shifts not in _CONS:
        v = np.array(shifts, np.float32); n = np.hypot(v[:, 0], v[:, 1]); d = np.hypot(v[:, None, 0] - v[None, :, 0], v[:, None, 1] - v[None, :, 1])
        dot = v[:, None, 0] * v[None, :, 0] + v[:, None, 1] * v[None, :, 1]
        _CONS[shifts] = ((dot > 0) & (d <= np.maximum(ACCEL, ACCEL_PART * np.maximum(n[:, None], n[None, :])))).astype(np.float32)
    return _CONS[shifts]

STEADY = [(dy, dx) for dy in range(-STEP, STEP + 1) for dx in range(-STEP, STEP + 1) if (dy or dx) and dy * dy + dx * dx <= STEP * STEP]

YY, XX = np.mgrid[0:H, 0:W]

def in_circle(m, x, y, r):
    x0, x1, y0, y1 = max(0, x - r), min(W, x + r + 1), max(0, y - r), min(H, y + r + 1)
    if x0 >= x1 or y0 >= y1: return 0
    sub = m[y0:y1, x0:x1]; cy, cx = YY[y0:y1, x0:x1] - y, XX[y0:y1, x0:x1] - x
    return int((sub & (cx * cx + cy * cy <= r * r)).sum())

def in_box(m, b):
    x0, y0, x1, y1 = max(0, b[0]), max(0, b[1]), min(W, b[2]), min(H, b[3])
    return int(m[y0:y1, x0:x1].sum()) if x0 < x1 and y0 < y1 else 0

SEAM_DIFF, CUT = 24, 0.25

def changed(a, b):
    """the share of the picture that changes between two frames (more than SEAM_DIFF in R, G or B)"""
    return float((np.abs(a.astype(np.int16) - b.astype(np.int16)).max(2) > SEAM_DIFF).mean())

SEAM = {}

def check(path, regions, fps=30):
    seq, rows, fails = [], [], []
    first, prev, steps = None, None, []
    for F, fr in enumerate(frames(path)):
        if first is None: first = fr.copy()
        if prev is not None: steps.append(changed(prev, fr))
        prev = fr
        seq.append(fr)
        if len(seq) < 3: continue
        if len(seq) > 3: seq.pop(0)
        t = F - 1; raw = flicker_map(*seq)
        # (a frame next to a cut is not compared across it: there the frames before and after are two different shots, and where both
        #  happen to be dark they look alike; the cut itself is not flicker. Shots from regions.jsonl)
        sh = [regions.get(k, {}).get("shot") for k in (t - 1, t, t + 1)]
        if sh[1] is not None and (sh[0] != sh[1] or sh[2] != sh[1]): raw[:] = False
        n0 = int(raw.sum())
        reg = regions.get(t, {"eyes": [], "text": []})
        eye0 = max([in_circle(raw, *e) for e in reg["eyes"]] or [0]); txt0 = max([in_box(raw, b) for b in reg["text"]] or [0])
        m = raw.copy()
        if n0:
            G = [gray(x) for x in seq]; ys, xs = np.nonzero(m)
            ok = explained(*G, ys, xs, STEADY); m[ys[ok], xs[ok]] = False
        n = int(m.sum())
        eye = max([in_circle(m, *e) for e in reg["eyes"]] or [0]); txt = max([in_box(m, b) for b in reg["text"]] or [0])
        rows.append((t, n, eye, txt, n0, eye0, txt0))
        why = []
        if n > FRAME_MAX: why.append(f"{n} pixels flicker in the picture (at most {FRAME_MAX})")
        if eye > EYE_MAX: why.append(f"{eye} pixels flicker in an eye (at most {EYE_MAX})")
        if txt > TEXT_MAX: why.append(f"{txt} pixels flicker in a text or bubble (at most {TEXT_MAX})")
        if why: fails.append((t, why))
    # the loop: the cut from the last frame to the first, measured as any frame change; it may not be bigger than the frame changes inside
    # the shots are (the cuts between shots, over CUT of the picture, are left out of that measure)
    inner = sorted(x for x in steps if x < CUT); p95 = inner[int(0.95 * (len(inner) - 1))] if inner else 0
    seam = changed(prev, first); SEAM.update(seam=seam, p95=p95, median=inner[len(inner) // 2] if inner else 0)
    if seam > max(p95, 0.01): fails.append((F, [f"the loop: {seam * 100:.1f} % of the picture changes from the last frame to the first (95 % of frame changes inside the shots are {p95 * 100:.1f} % or less)"]))
    return rows, fails

def near_eye(reg, x, y, far=60):
    """the eye in the frame `reg` nearest to (x, y), within `far` px (the same eye a frame before or after)"""
    if not reg or not reg.get("eyes"): return None
    e = min(reg["eyes"], key=lambda q: (q[0] - x) ** 2 + (q[1] - y) ** 2)
    return e if (e[0] - x) ** 2 + (e[1] - y) ** 2 <= far * far else None

def plant(src, dst, regions):
    """two faults planted in a copy: frame A's first eye drawn as an empty ring (skin inside a dark outline), and frame B's first text
    box moved 3 px right; A and B are chosen where an eye and a text are on the picture and nothing flickers already"""
    rows, _ = check(src, regions)
    quiet = {t for t, n, e, x, *_ in rows if n < 200 and e == 0 and x == 0}
    A = next(t for t in sorted(quiet) if regions.get(t, {}).get("eyes") and t > 20)
    # (a speech bubble where there is one standing still, else a caption)
    bub = [t for t in sorted(quiet) if regions.get(t, {}).get("bub") and t > A + 10 and t - 1 in quiet and t + 1 in quiet and regions.get(t - 1, {}).get("bub")]
    B = bub[len(bub) // 2] if bub else next(t for t in sorted(quiet) if regions.get(t, {}).get("text") and t > A + 10 and t - 1 in quiet and t + 1 in quiet)
    box = (regions[B].get("bub") or regions[B]["text"])[0]
    out = subprocess.Popen(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", "30", "-i", "-",
                            "-c:v", "libx264", "-crf", "17", "-pix_fmt", "yuv420p", dst], stdin=subprocess.PIPE)
    for F, fr in enumerate(frames(src)):
        fr = fr.copy()
        if F == A:
            x, y, r = regions[A]["eyes"][0]; r = int(r * 0.8)
            skin = fr[max(0, y + 2 * r), x].copy()      # the cheek below the eye
            d = (XX - x) ** 2 + (YY - y) ** 2
            fr[d <= r * r] = skin; fr[(d <= r * r) & (d >= (r - 3) ** 2)] = (20, 16, 18)
        if F == B:
            x0, y0, x1, y1 = box; x0, y0 = max(0, x0), max(0, y0); x1, y1 = min(W - 3, x1), min(H, y1)
            fr[y0:y1, x0 + 3:x1 + 3] = fr[y0:y1, x0:x1].copy()
        out.stdin.write(fr.tobytes())
    out.stdin.close(); out.wait()
    return A, B

def main():
    a = sys.argv[1:]; outp = None; plant_to = None
    if "--out" in a: i = a.index("--out"); outp = a[i + 1]; del a[i:i + 2]
    if "--plant" in a: i = a.index("--plant"); plant_to = a[i + 1]; del a[i:i + 2]
    video = a[0]; regions = {}
    if len(a) > 1:
        for line in open(a[1], encoding="utf-8"):
            line = line.strip()
            if line.startswith("{"): r = json.loads(line); regions[r["F"]] = r
    if plant_to:
        A, B = plant(video, plant_to, regions)
        print(f"planted: an empty eye ring on frame {A} ({A / 30:.2f} s), {'a speech bubble' if regions[B].get('bub') else 'a caption'} moved 3 px to the right on frame {B} ({B / 30:.2f} s) -> {plant_to}")
        return
    rows, fails = check(video, regions)
    L = [f"flicker check: {video}", f"frames checked: {len(rows)} (1 to {len(rows)}; the first and last have no neighbour on one side)",
         f"a pixel flickers when it differs by more than {DIFF} (of 255, in R, G or B) from the frame before and the frame after, while those two differ by less than {SAME}",
         f"fails: more than {FRAME_MAX} flickering pixels in a frame, more than {EYE_MAX} in an eye's circle, more than {TEXT_MAX} in a box of text",
         f"eye circles per frame: {sum(len(regions.get(t, {}).get('eyes', [])) for t, *_ in rows)} in all; text boxes: {sum(len(regions.get(t, {}).get('text', [])) for t, *_ in rows)}" if regions else "no regions given: the picture as a whole only",
         f"largest: picture {max(r[1] for r in rows)} pixels (frame {max(rows, key=lambda r: r[1])[0]}), eye {max(r[2] for r in rows)} (frame {max(rows, key=lambda r: r[2])[0]}), text {max(r[3] for r in rows)} (frame {max(rows, key=lambda r: r[3])[0]})",
         f"movement taken out: a pixel is movement when steps v0 and v1 of at most {STEP} px explain it (the frame before v0 behind and the frame after v1 ahead both match its 5 x 5 patch, mean grey difference under {MATCH}; v0 and v1 point the same way and differ by at most {ACCEL_PART:.2f} of the longer, or {ACCEL} px) and its patch is not flat (grey levels vary by {TEX} or more)",
         f"raw (before movement is taken out): largest picture {max(r[4] for r in rows)}, eye {max(r[5] for r in rows)}, text {max(r[6] for r in rows)}; frames over the limits raw: {sum(1 for r in rows if r[4] > FRAME_MAX or r[5] > EYE_MAX or r[6] > TEXT_MAX)}",
         f"median picture count: {int(np.median([r[1] for r in rows]))}",
         f"the loop (last frame to first): {SEAM['seam'] * 100:.1f} % of the picture changes; inside the shots the median frame change is {SEAM['median'] * 100:.1f} % and 95 % are {SEAM['p95'] * 100:.1f} % or less (a pixel changes by more than {SEAM_DIFF})", ""]
    if fails:
        L.append(f"FAIL: {len(fails)} frames")
        for t, why in fails: L.append(f"  frame {t} ({t / 30:.2f} s): " + "; ".join(why))
    else: L.append("PASS: no frame flickers")
    # the raw measure, Jesper's rule as written (nothing taken out for movement), frame by frame: it does not decide, it is shown
    rawf = [(r[0], r[4], r[5], r[6]) for r in rows if r[4] > FRAME_MAX or r[5] > EYE_MAX or r[6] > TEXT_MAX]
    L += ["", f"RAW (Jesper's rule as written, no movement taken out; at most {FRAME_MAX} in the picture, {EYE_MAX} in an eye, {TEXT_MAX} in a text): {len(rawf)} frames over"]
    L += [f"  frame {t} ({t / 30:.2f} s): picture {n}, eye {e}, text {x}" for t, n, e, x in rawf]
    L += ["", "every frame: frame, picture, eye, text, then the raw picture, eye, text"] + ["\t".join(str(v) for v in r) for r in rows]
    txt = "\n".join(L) + "\n"
    if outp: open(outp, "w", encoding="utf-8").write(txt)
    print("\n".join(L[:11 + (len(fails) + 1 if fails else 1)]))
    sys.exit(1 if fails else 0)

if __name__ == "__main__":
    main()

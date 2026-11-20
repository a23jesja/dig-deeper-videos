# The flicker check's proof: faults planted in a copy of a clean render, each on frames where the check found nothing, then the check
# run on the copy. Six must fail and one must pass (the review, 20 Nov):
#   a  an empty eye ring on one frame (the eye filled with the skin below it, inside a dark ring)
#   b  a speech bubble 3 px out on one frame and back
#   c  in a close-up, the face's outline 3 px out on one frame and back (a 360 x 360 square round the eyes moved)
#   d  a caption with one letter changed on one frame (a letter-wide slice in the middle of the line, mirrored)
#   e  a pupil 6 px out on one frame and back (the inner half of the eye moved, within the 8 px pupil step)
#   g  in a close-up, the face's outline 11 px out on one frame and back (within the 12 px movement step: still a jump there and back)
#   f  must PASS: the whole close-up sliding steadily 5 px a frame for 12 frames, as a fast steady head turn moves it
#
#   usage: python scripts/flicker_proof.py <clean.mp4> <regions.jsonl> <clean flicker report.txt> <planted.mp4> <proof report.txt>
import json, subprocess, sys
import numpy as np
sys.path.insert(0, __file__.rsplit("\\", 1)[0].rsplit("/", 1)[0])
import flicker as fl

W, H = fl.W, fl.H

def main():
    src, regp, rep, dst, outp = sys.argv[1:6]
    regions = {}
    for line in open(regp, encoding="utf-8"):
        if line.startswith("{"): r = json.loads(line); regions[r["F"]] = r
    rows = {}
    for line in open(rep, encoding="utf-8"):
        p = line.rstrip("\n").split("\t")
        if len(p) == 7 and p[0].isdigit(): rows[int(p[0])] = [int(x) for x in p[1:]]
    quiet = {t for t, r in rows.items() if r[0] < 300 and r[1] == 0 and r[2] == 0 and r[3] < 2000 and r[4] <= 40 and r[5] == 0}
    used = set()
    def pick(ok, span=1):
        for t in sorted(quiet):
            if t < 15 or any(abs(t - u) < 25 for u in used): continue
            if all(k in quiet for k in range(t - 2, t + span + 2)) and ok(t): used.add(t); return t
        raise SystemExit("no quiet frame for a case")
    big = lambda t, rmin: [e for e in regions.get(t, {}).get("eyes", []) if e[2] >= rmin]
    A = pick(lambda t: big(t, 20))
    try: B = pick(lambda t: regions.get(t, {}).get("bub") and regions.get(t - 1, {}).get("bub") and regions.get(t + 1, {}).get("bub")); BOX = "bub"
    except SystemExit: B = pick(lambda t: regions.get(t, {}).get("text")); BOX = "text"      # (no quiet frame with a bubble: a caption moved instead)
    C = pick(lambda t: big(t, 60)); D = pick(lambda t: regions.get(t, {}).get("text") and not regions.get(t, {}).get("bub"))
    E = pick(lambda t: big(t, 20)); G = pick(lambda t: big(t, 60)); Fs = pick(lambda t: all(big(k, 60) for k in range(t, t + 12)), 12)
    cases = {"a": A, "b": B, "c": C, "d": D, "e": E, "g": G, "f": Fs}
    out = subprocess.Popen(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", "30", "-i", "-",
                            "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", dst], stdin=subprocess.PIPE)
    YY, XX = fl.YY, fl.XX
    for F, fr in enumerate(fl.frames(src)):
        fr = fr.copy()
        if F == A:
            x, y, r = big(A, 20)[0]; r = int(r * 0.75); skin = fr[min(H - 1, y + int(1.6 * r)), x].copy(); d = (XX - x) ** 2 + (YY - y) ** 2
            fr[d <= r * r] = skin; fr[(d <= r * r) & (d >= (r - 4) ** 2)] = (20, 16, 18)
        if F == B:
            x0, y0, x1, y1 = regions[B][BOX][0]; x0, y0, x1, y1 = max(0, x0), max(0, y0), min(W - 3, x1), min(H, y1); fr[y0:y1, x0 + 3:x1 + 3] = fr[y0:y1, x0:x1].copy()
        if F == C:
            es = big(C, 60); cx, cy = int(np.mean([e[0] for e in es])), int(np.mean([e[1] for e in es]))
            x0, y0, x1, y1 = max(0, cx - 180), max(0, cy - 180), min(W - 3, cx + 180), min(H, cy + 180); fr[y0:y1, x0 + 3:x1 + 3] = fr[y0:y1, x0:x1].copy()
        if F == D:
            x0, y0, x1, y1 = regions[D]["text"][0]; mx = (x0 + x1) // 2; y0, y1 = max(0, y0), min(H, y1); fr[y0:y1, mx - 35:mx + 35] = fr[y0:y1, mx - 35:mx + 35][:, ::-1].copy()
        if F == E:
            x, y, r = big(E, 20)[0]; r2 = max(4, int(r * 0.5)); m = (XX - x) ** 2 + (YY - y) ** 2 <= r2 * r2; sh = np.roll(fr, 6, axis=1); fr[m] = sh[m]
        if F == G:
            es = big(G, 60); cx, cy = int(np.mean([e[0] for e in es])), int(np.mean([e[1] for e in es]))
            x0, y0, x1, y1 = max(0, cx - 180), max(0, cy - 180), min(W - 11, cx + 180), min(H, cy + 180); fr[y0:y1, x0 + 11:x1 + 11] = fr[y0:y1, x0:x1].copy()
        if Fs <= F < Fs + 12:
            k = 5 * (F - Fs + 1); fr = np.concatenate([fr[:, k:], np.repeat(fr[:, -1:], k, axis=1)], axis=1)
        out.stdin.write(fr.tobytes())
    out.stdin.close(); out.wait()
    rowsP, fails = fl.check(dst, regions)
    failAt = {t: why for t, why in fails}
    raw = {r[0]: r for r in rowsP}
    L = [f"flicker proof: faults planted in {src} -> {dst}", ""]
    desc = {"a": "an empty eye ring on one frame", "b": ("a speech bubble" if BOX == "bub" else "a caption (no quiet frame with a bubble)") + " 3 px out on one frame and back", "c": "a close-up's face outline 3 px out on one frame and back",
            "d": "a caption with one letter changed on one frame", "e": "a pupil 6 px out on one frame and back",
            "g": "a close-up's face outline 11 px out on one frame and back (within the 12 px movement step)", "f": "the whole close-up sliding steadily 5 px a frame for 12 frames (must pass)"}
    allok = True
    for k, t in cases.items():
        span = range(t - 1, t + 13) if k == "f" else range(t - 1, t + 2)
        hit = [(u, failAt[u]) for u in span if u in failAt]
        rawover = [u for u in span if u in raw and (raw[u][4] > fl.FRAME_MAX or raw[u][5] > fl.EYE_MAX or raw[u][6] > fl.TEXT_MAX)]
        want = k != "f"; ok = bool(hit) == want; allok &= ok
        L.append(f"{k}) {desc[k]}: frame {t} ({t / 30:.2f} s){'-' + str(t + 11) if k == 'f' else ''}: {'FAILED' if hit else 'passed'} by the check ({'as it must' if ok else 'WRONG'})")
        for u, why in hit: L.append(f"     frame {u} ({u / 30:.2f} s): " + "; ".join(why))
        L.append(f"     the raw measure (no movement taken out) is over its limits on frames: {rawover or 'none'}")
    other = sorted(u for u in failAt if not any((u in (range(t - 1, t + 13) if k == 'f' else range(t - 1, t + 2))) for k, t in cases.items()))
    L += ["", f"fails outside the planted frames (the film's own): {other or 'none'}", f"RESULT: the seven planted cases {'all as they must be' if allok else 'NOT as they must be'}"]
    open(outp, "w", encoding="utf-8").write("\n".join(L) + "\n"); print("\n".join(L))

if __name__ == "__main__":
    main()

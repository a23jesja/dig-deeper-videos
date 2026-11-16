# Frame-by-frame QA of a rendered vertical short (every frame at 30 fps): specs, loudness, per-frame luma / saturation /
# motion, black-white-frozen-pop detection (ignoring planned flashes and crossfades), per-shot colour stats and 2 s
# contact sheets (60 frames each, frame numbers burned in for the reviewer only).
# Usage: python scripts/short_qa.py <video.mp4> <outdir> [shots.json]
#   shots.json: [{"id":1,"a":0,"b":130}, ...] plus optional {"flash":[130,134], "xfade":[[1131,1137], ...]}
import json, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw

from scipy import ndimage
def white_share(L):
    """share of pixels above 0.95 luma in the lower half of one frame"""
    h = L.shape[0]; return float((L[h // 2: int(h * 0.72), :] > 0.95).mean())   # lower half above the caption band (the white caption letters do not count)
def flat_share(L, thr=0.01, B=8):
    """share of the frame covered by the largest connected flat (low-detail) region, in 8 x 8 blocks"""
    h, w = L.shape[0] // B * B, L.shape[1] // B * B
    blk = L[:h, :w].reshape(h // B, B, w // B, B).transpose(0, 2, 1, 3).reshape(h // B, w // B, B * B).std(2)
    lab, k = ndimage.label(blk < thr)
    return float(np.bincount(lab.ravel())[1:].max() / blk.size) if k else 0.0
WHITE_MAX, FLAT_MAX = 0.03, 1 / 3
if "--selftest" in sys.argv:
    rng = np.random.default_rng(1); tex = rng.random((320, 180)).astype(np.float32) * 0.5 + 0.2
    blown = tex.copy(); blown[160:, :] = 1.0; flat = tex.copy(); flat[:200, :] = 0.3
    ok = white_share(blown) > WHITE_MAX and white_share(tex) <= WHITE_MAX and flat_share(flat) > FLAT_MAX and flat_share(tex) <= FLAT_MAX
    print("SELFTEST short_qa WHITE and BIGFLAT proven" if ok else "SELFTEST short_qa FAILED"); sys.exit(0 if ok else 1)
vid, out = sys.argv[1], sys.argv[2]
meta = json.load(open(sys.argv[3])) if len(sys.argv) > 3 else {}
shots = meta.get("shots", [])
planned = set()
for a, b in meta.get("xfade", []) + meta.get("planned", []) + ([meta["flash"]] if "flash" in meta else []):
    planned.update(range(a - 1, b + 1))
for s in shots:
    planned.update((s["a"] - 1, s["a"]))
os.makedirs(out, exist_ok=True)
run = lambda *a: subprocess.run(a, capture_output=True, text=True)
R = []

pr = json.loads(run("ffprobe", "-v", "error", "-show_entries", "stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames,sample_rate,channels:format=duration", "-of", "json", vid).stdout)
v = next(s for s in pr["streams"] if s["codec_type"] == "video")
au = [s for s in pr["streams"] if s["codec_type"] == "audio"]
R.append(f"SPECS {v['width']}x{v['height']} {v['r_frame_rate']} fps, {v.get('nb_frames')} frames, {float(pr['format']['duration']):.3f} s; audio: "
         + ", ".join(f"{s['codec_name']} {s['sample_rate']} Hz {s['channels']}ch" for s in au) if au else "NONE")
if au:
    e = run("ffmpeg", "-i", vid, "-map", "0:a:0", "-af", "ebur128=peak=true", "-f", "null", "-").stderr
    tail = e[e.rfind("Summary:"):]
    I = [l.strip() for l in tail.splitlines() if l.strip().startswith(("I:", "LRA:", "Peak:"))]
    R.append("LOUDNESS " + " | ".join(I))
    e = run("ffmpeg", "-i", vid, "-map", "0:a:0", "-af", "silencedetect=n=-45dB:d=0.3", "-f", "null", "-").stderr
    R.append("SILENCES " + ("; ".join(l.split("] ")[-1] for l in e.splitlines() if "silence_" in l) or "none"))

W, H = 180, 320
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", vid, "-vf", f"scale={W}:{H}:flags=area", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
n = len(F)
f32 = F.astype(np.float32) / 255
luma = (f32 @ np.array([0.2126, 0.7152, 0.0722], np.float32))
mx, mn = f32.max(-1), f32.min(-1)
sat = np.where(mx > 0.06, (mx - mn) / np.maximum(mx, 1e-6), 0)
L = luma.reshape(n, -1)
stats = {"mean": L.mean(1), "std": L.std(1), "p2": np.percentile(L, 2, 1), "p98": np.percentile(L, 98, 1), "sat": sat.reshape(n, -1).mean(1)}
diff = np.abs(np.diff(F.astype(np.int16), axis=0)).mean(axis=(1, 2, 3))
med = np.array([np.median(diff[max(0, i - 8):i + 9]) for i in range(len(diff))])
pops = [i + 1 for i in range(len(diff)) if diff[i] > 3 * med[i] + 1.0 and (i + 1) not in planned]
black = [i for i in range(n) if stats["mean"][i] < 0.04]
white = [i for i in range(n) if stats["mean"][i] > 0.93 and i not in planned]
frozen, run_start = [], None
for i in range(len(diff)):
    if diff[i] < 0.02:
        run_start = i if run_start is None else run_start
    else:
        if run_start is not None and i - run_start >= 12: frozen.append((run_start, i))
        run_start = None
R.append(f"FRAMES {n}; black {black[:20]}; unplanned white {white[:20]}; frozen spans >=12f {frozen[:20]}")
R.append(f"POPS (unplanned frame-diff spikes > 3x local median): {pops[:40]}")
R.append(f"MOTION mean diff {diff.mean():.2f}; frames with diff<0.3 (held): {int((diff < 0.3).sum())} ({(diff < 0.3).mean() * 100:.0f}%)")

R.append("\nPER SHOT  (luma mean / std / p2 / p98 / saturation mean, medians over the shot)")
for s in shots or [{"id": 0, "a": 0, "b": n}]:
    a, b = s["a"], min(s["b"], n)
    if a >= b: continue
    R.append(f"  shot {s['id']:>2} f{a}-{b - 1}: " + " / ".join(f"{np.median(stats[k][a:b]):.3f}" for k in ("mean", "std", "p2", "p98", "sat")))
# EMPTY: the lower third of a shot must not be a flat empty surface. Local detail = median over 8 x 8 blocks of the luma standard deviation,
# then the median over the shot (calibrated on the old test: its shot 3 = 0.006, shots with planks / water / figures = 0.028 - 0.041; threshold 0.015)
EMPTY_MIN = 0.015
B = 8; y0 = (H * 2 // 3) // B * B; lo = np.concatenate([luma[:, y0:int(H * 0.73) // B * B, : W // B * B], luma[:, int(H * 0.835) // B * B: H // B * B, : W // B * B]], axis=1)   # the caption band (73-83.5 %) does not count as detail
blk = lo.reshape(n, lo.shape[1] // B, B, lo.shape[2] // B, B).transpose(0, 1, 3, 2, 4).reshape(n, -1, B * B).std(2)
empty = []
for s in shots or [{"id": 0, "a": 0, "b": n}]:
    a, b = s["a"], min(s["b"], n)
    if a >= b: continue
    d = float(np.median(np.median(blk[a:b], axis=1)))
    R.append(f"  shot {s['id']:>2} lower-third detail {d:.4f}")
    if d < EMPTY_MIN: empty.append((s["id"], d))
for i, d in empty: R.append(f"EMPTY shot {i}: the lower third is a flat empty surface (local detail {d:.4f} < {EMPTY_MIN})")
if not empty: R.append("EMPTY: none (every shot's lower third has detail)")
# WHITE: the floor must not blow out (lower half above 0.95 luma > 3 % for 6 frames in a row); BIGFLAT: no flat low-detail region over a third of the frame
bad = []
ws = np.array([white_share(luma[i]) for i in range(n)]); fs = np.array([flat_share(luma[i]) for i in range(0, n)])
for s in shots or [{"id": 0, "a": 0, "b": n}]:
    a, b = s["a"], min(s["b"], n)
    if a >= b: continue
    run, mx = 0, 0
    for i in range(a, b):
        run = run + 1 if ws[i] > WHITE_MAX else 0; mx = max(mx, run)
    R.append(f"  shot {s['id']:>2} white (lower half >0.95) max {ws[a:b].max():.3f}, longest run over {WHITE_MAX}: {mx} f; largest flat region median {np.median(fs[a:b]):.2f}")
    if mx >= 6: bad.append(f"WHITE shot {s['id']}: the floor blows out to white ({mx} frames in a row above {WHITE_MAX:.0%} of the lower half)")
    if np.median(fs[a:b]) > FLAT_MAX: bad.append(f"BIGFLAT shot {s['id']}: one flat low-detail region covers {np.median(fs[a:b]):.0%} of the frame (more than a third)")
R += bad
if not bad: R.append("WHITE and BIGFLAT: none")
np.savez(os.path.join(out, "perframe.npz"), diff=diff, **stats)

# 2 s contact sheets, 10 x 6 frames of 108x192 each
cw, ch = 108, 192
for k in range(0, n, 60):
    S = Image.new("RGB", (cw * 10, ch * 6), "black"); d = ImageDraw.Draw(S)
    for j in range(min(60, n - k)):
        x, y = (j % 10) * cw, (j // 10) * ch
        S.paste(Image.fromarray(F[k + j]).resize((cw, ch)), (x, y))
        d.rectangle([x, y, x + 34, y + 12], fill="black"); d.text((x + 2, y + 1), str(k + j), fill="yellow")
    S.save(os.path.join(out, f"sheet_{k:04d}.jpg"), quality=85)
open(os.path.join(out, "report.md"), "w", encoding="utf-8").write("\n".join(R) + "\n")
print("\n".join(R))
sys.exit(1 if (empty or bad) else 0)

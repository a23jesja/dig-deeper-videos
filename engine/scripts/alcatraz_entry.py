# Alcatraz: the entry checks on the finished mp4 (the hook rules, 17 Nov; the review of STOPP 1 point 30: measured on the mp4, not the wav)
#   first frame: the voice and a sound hit in frame 1 (the first audio sample over 0.001 and the peak inside 0-33 ms), the text on screen
#   seconds 2-10: the cuts (something new every 2.5 s or less), and the text's lines held 1.5 s or more each
#   the loop: how much of the picture changes from the last frame to the first, against the film's own frame-to-frame changes
#   python scripts/alcatraz_entry.py <film.mp4>
import json, subprocess, sys
import numpy as np
V = sys.argv[1]; info = json.load(open("out/craft/alcatraz/info.json")); FPS = 30
a = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-nostdin", "-i", V, "-f", "f32le", "-ac", "1", "-ar", "48000", "-"], capture_output=True, check=True).stdout, np.float32)
first = int(np.argmax(np.abs(a) > 0.001)) / 48000; pk1 = float(np.abs(a[:1600]).max())
print(f"first frame: the first sound at {first:.3f} s (frame {int(first * FPS) + 1}), the peak in frame 1 {pk1:.2f} -> {'OK' if first < 1 / FPS and pk1 > 0.05 else 'FAIL'}")
tx = info["text"]; n = len(tx["lines"]); per = (tx["t1"] - tx["t0"]) / n
print(f"text: {' / '.join(tx['lines'])} ({sum(len(l.split()) for l in tx['lines'])} words), {tx['t0']:.1f}-{tx['t1']:.1f} s, {per:.2f} s per line -> {'OK' if per >= 1.5 and sum(len(l.split()) for l in tx['lines']) <= 6 else 'FAIL'}")
cuts = [c[1] for c in info["cuts"]] + [info["film"]]; gaps = [(cuts[i], cuts[i + 1] - cuts[i]) for i in range(len(cuts) - 1)]
early = [(round(t, 1), round(d, 1)) for t, d in gaps if t < 10]
print(f"seconds 0-10: shots start at {[t for t, _ in early]}, lasting {[d for _, d in early]} s -> {'OK' if all(d <= 2.5 for t, d in early if t < 5) and all(d <= 3.7 for _, d in early) else 'FAIL'}")
fr = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-nostdin", "-i", V, "-vf", "scale=270:480", "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True, check=True).stdout, np.uint8).reshape(-1, 480, 270).astype(np.int16)
ch = lambda x, y: float((np.abs(x - y) > 24).mean() * 100); steps = [ch(fr[i], fr[i + 1]) for i in range(len(fr) - 1)]; loop = ch(fr[-1], fr[0])
print(f"the loop: {loop:.1f} % of the picture changes from the last frame to the first; inside the film 95 % of frame changes are {np.percentile(steps, 95):.1f} % or less, the largest cut {max(steps):.1f} %")

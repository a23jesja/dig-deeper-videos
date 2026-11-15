# Finds render glitches: render the same composition twice and compare frame by frame. Rendering is deterministic, so
# two clean renders are identical; a stray tile or fragment shows up as a block that differs in one frame.
# usage: python scripts/frame_diff.py <a.mp4> <b.mp4> [threshold]   -> prints the frames that differ and the block
import subprocess, sys
import numpy as np
a, b = sys.argv[1], sys.argv[2]
thr = float(sys.argv[3]) if len(sys.argv) > 3 else 12.0
W, H, B = 270, 480, 15          # compare at quarter size, in 15 px blocks
def frames(v):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", v, "-vf", f"scale={W}:{H}:flags=area", "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.int16)
A, Bf = frames(a), frames(b)
n = min(len(A), len(Bf)); bad = []
for i in range(n):
    d = np.abs(A[i] - Bf[i]).reshape(H // B, B, W // B, B).mean(axis=(1, 3))
    if d.max() > thr:
        y, x = np.unravel_index(d.argmax(), d.shape)
        bad.append((i, float(d.max()), int(x * B * 1080 / W), int(y * B * 1920 / H)))
print(f"compared {n} frames ({len(A)} vs {len(Bf)}); frames that differ: {len(bad)}")
for i, m, x, y in bad[:60]: print(f"  frame {i}: block difference {m:.0f} near x {x}, y {y}")
sys.exit(1 if bad else 0)

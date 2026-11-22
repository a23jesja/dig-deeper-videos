# Two videos frame by frame: per frame, how many pixels differ by more than T in R, G or B (default 24, the encoder's noise below it), and
# the largest difference.   python scripts/frame_cmp.py <a.mp4> <b.mp4> [T]
import subprocess, sys, numpy as np
def frames(v): return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-nostdin", "-i", v, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout, np.uint8).reshape(-1, 1920, 1080, 3)
A, B = frames(sys.argv[1]), frames(sys.argv[2]); T = int(sys.argv[3]) if len(sys.argv) > 3 else 24
print(f"{sys.argv[1].split('/')[-1]}: {len(A)} frames, {sys.argv[2].split('/')[-1]}: {len(B)} frames")
tot, worst = 0, 0
for f in range(min(len(A), len(B))):
    d = np.abs(A[f].astype(np.int16) - B[f].astype(np.int16)).max(axis=2); n = int((d > T).sum()); worst = max(worst, int(d.max())); tot += n
    if n: print(f"  frame {f:3d}: {n:6d} px differ (largest {int(d.max())})")
print(f"  total {tot} px over {T} in {min(len(A), len(B))} frames, largest difference anywhere {worst}")

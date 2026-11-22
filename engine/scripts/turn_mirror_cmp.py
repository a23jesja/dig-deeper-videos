# The second turn of 03 (v8) is the first turn backwards: frame f of the first and 132 - f of the second stand at the same body angle. Per
# pair, in the box of the torso, arms and watch: how many pixels differ by more than T in R, G or B as rendered, and after the best sideways
# shift of the second (the body stands a few px apart: the upper body's twist leads the turn each way, and the weight settles between).
#   python scripts/turn_mirror_cmp.py <03.mp4> [f0 f1] [T]
import subprocess, sys, numpy as np
V = sys.argv[1]; f0 = int(sys.argv[2]) if len(sys.argv) > 2 else 30; f1 = int(sys.argv[3]) if len(sys.argv) > 3 else 56; T = int(sys.argv[4]) if len(sys.argv) > 4 else 24
A = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-nostdin", "-i", V, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout, np.uint8).reshape(-1, 1920, 1080, 3).astype(np.int16)
X0, X1, Y0, Y1 = 330, 790, 1140, 1680      # (the torso from the collar down, both arms and hands, the watch and its chain)
print(f"box x {X0}-{X1}, y {Y0}-{Y1}; a pixel differs over {T}")
for f in range(f0, f1 + 1):
    g = 132 - f; a = A[f, Y0:Y1, X0:X1]; raw = int((np.abs(a - A[g, Y0:Y1, X0:X1]).max(axis=2) > T).sum())
    best = min(((int((np.abs(a - A[g, Y0:Y1, X0 + s:X1 + s]).max(axis=2) > T).sum()), s) for s in range(-14, 15)))
    print(f"  {f:3d} / {g:3d}: {raw:6d} px differ as rendered; {best[0]:6d} px with the second shifted {best[1]:+d} px")

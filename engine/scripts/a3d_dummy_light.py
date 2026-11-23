# Shot 4 of Alcatraz in the new style: how bright each fake head is, frame by frame, in the delivered file (the mean of a 40 x 40 px patch on
# each head, where the shot's projection puts it), to show the three come up one after another.
#   python scripts/a3d_dummy_light.py <file.mp4>
import json, subprocess, sys
import numpy as np
F = sys.argv[1]; W, H = 1080, 1920
spec = json.load(open("src/craft/alcatraz3d/shots.json")); sh = next(s for s in spec["shots"] if s["id"] == "n04"); f0 = round(sh["t0"] * 30)
P = json.load(open("src/craft/alcatraz3d/cam/n04.json"))["frames"]
heads = [(-0.75, 0.82, 0.75 + k * 2.85) for k in range(3)]      # (v12: the fake head cards, set.py DUMMY)
raw = subprocess.run(["ffmpeg", "-v", "error", "-nostdin", "-i", F, "-vf", f"trim=start_frame={f0}:end_frame={f0 + len(P)},setpts=PTS-STARTPTS", "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True, check=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W)
print(f"{F.split('/')[-1]}, shot 4 (frames {f0 + 1}-{f0 + len(fr)}): the mean brightness (0-255) of a 40 x 40 px patch on each fake head")
print("frame  time  ground  middle  top")
for i in range(0, len(fr), 3):
    vals = []
    for (x, y, z) in heads:
        M = P[min(i, len(P) - 1)]; v = [M[r][0] * x + M[r][1] * y + M[r][2] * z + M[r][3] for r in range(3)]; u, w = int(v[0] / v[2]), int(v[1] / v[2])
        patch = fr[i, max(0, w - 20):w + 20, max(0, u - 20):u + 20]; vals.append(float(patch.mean()) if patch.size else float("nan"))
    print(f"{f0 + i + 1:5d}  {i / 30:4.2f}  {vals[0]:6.0f}  {vals[1]:6.0f}  {vals[2]:5.0f}")

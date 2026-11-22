# A check on the rendered clip: a part of a figure (head, torso, an arm, a leg) whose picture changes much more between two frames than
# its joints moved: a drawing swapped in one frame, a thing changing layer (a clasp over or under an arm), a pose snapping. For each part
# and each frame: the mean change of its pixels (0-255) inside its box (both frames' boxes together), against the part's own usual change
# in the clip. A frame fails where the change is over 3 times the part's median and over 6, while its joints, and those of every part
# overlapping its box (a talking mouth counted; a blink only for the head), moved under 4 px: a picture that changes with nothing moving.
#   python scripts/part_diff.py <clip.mp4> <parts.json> [plant]      (plant: paste a 60 px patch into one arm for one frame, to prove it)
import json, subprocess, sys
import numpy as np
V, P = sys.argv[1], json.load(open(sys.argv[2])); plant = len(sys.argv) > 3 and sys.argv[3] == "plant"
raw = subprocess.run(["ffmpeg", "-v", "error", "-nostdin", "-i", V, "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True, check=True).stdout
A = np.frombuffer(raw, np.uint8).reshape(-1, 1920, 1080).astype(np.int16); n = min(len(A), len(P["frames"]))
if plant:      # a planted fault: a dark patch on one arm in one frame (a thing that pops in for a frame)
    k = sorted(P["frames"][n // 2])[0]; k = [p for p in P["frames"][n // 2] if p.endswith("armR")][0]; x0, y0, x1, y1 = P["frames"][n // 2][k]["box"]
    cx, cy = max(0, (x0 + x1) // 2), max(0, (y0 + y1) // 2); A = A.copy(); under = A[n // 2, cy - 30:cy + 30, cx - 30:cx + 30]; A[n // 2, cy - 30:cy + 30, cx - 30:cx + 30] = 235 if under.mean() < 128 else 20      # (light on dark, dark on light: a dark patch on the dark chest in 04 hardly changed the picture, v4)
parts = sorted(k for k in P["frames"][0].keys() if not (k.endswith(".eyes") or k.endswith(".mouth"))); D = {p: [] for p in parts}
for f in range(1, n):
    for p in parts:
        b0, b1 = P["frames"][f - 1][p]["box"], P["frames"][f][p]["box"]
        x0, y0 = max(0, min(b0[0], b1[0])), max(0, min(b0[1], b1[1])); x1, y1 = min(1080, max(b0[2], b1[2])), min(1920, max(b0[3], b1[3]))
        d = float(np.abs(A[f, y0:y1, x0:x1] - A[f - 1, y0:y1, x0:x1]).mean()) if x1 > x0 and y1 > y0 else 0.0
        # (the motion that can change this box: its own joints and those of every part whose box overlaps it, an arm passing over a leg)
        fr = P["frames"][f]
        mv = max([fr[q]["move"] for q in fr if not (fr[q].get("headOnly") and not p.endswith(".head")) and not (fr[q]["box"][2] < x0 or fr[q]["box"][0] > x1 or fr[q]["box"][3] < y0 or fr[q]["box"][1] > y1)])
        D[p].append((f, d, mv))
fails = []
for p in parts:
    med = float(np.median([d for _, d, _ in D[p]])) or 0.1
    for f, d, mv in D[p]:
        if d > 3 * med and d > 6 and mv < 4: fails.append((f, p, d, med, mv))
for f, p, d, med, mv in sorted(fails): print(f"{f} {p}: the picture changes {d:.1f} (its usual {med:.1f}) while its joints moved {mv:.1f} px")
print(f"PART DIFF {'FAILED: ' + str(len(fails)) if fails else 'OK'} ({V.split('/')[-1]}{', planted' if plant else ''})")

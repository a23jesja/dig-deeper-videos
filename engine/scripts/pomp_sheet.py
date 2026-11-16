# Contact sheet of "I Survived Pompeii: Part 1" for the reviewer: frame 0, ten frames into every other shot, the brightest frame of the blast and the last frame,
# each cell 340 px wide with the frame number burned in (reviewer only), the whole sheet at most 2100 px wide.
# usage: python scripts/pomp_sheet.py <video.mp4> <out.jpg>
import os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "audio"))
from pompeii1b_audio import CUTS as C, BLAST, TOTAL  # noqa: E402

vid, out = sys.argv[1], sys.argv[2]
W, H = 340, 604
def frame(n, w=W, h=H):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", vid, "-vf", f"select=eq(n\,{n}),scale={w}:{h}", "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
    return Image.fromarray(np.frombuffer(raw, np.uint8).reshape(h, w, 3))
# the brightest frame of the blast (mean luma, small copies of frames BLAST .. BLAST + 90)
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", vid, "-vf", f"select=between(n\,{BLAST}\,{BLAST + 90}),scale=36:64", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
A = np.frombuffer(raw, np.uint8).reshape(-1, 64, 36, 3).astype(float).mean((1, 2, 3))
bright = BLAST + int(A.argmax()); print("brightest blast frame", bright, "mean luma %.0f of 255" % A.max())
frames = [0] + [c + 10 for c in C[1:]] + [bright, TOTAL - 1]
frames = sorted(set(frames))[:24]
cols = 6; rows = (len(frames) + cols - 1) // cols
S = Image.new("RGB", (cols * W, rows * H), "black"); d = ImageDraw.Draw(S)
for i, n in enumerate(frames):
    x, y = (i % cols) * W, (i // cols) * H; S.paste(frame(n), (x, y)); d.rectangle([x, y, x + 34, y + 12], fill="black"); d.text((x + 2, y), str(n), fill="yellow")
S.save(out, quality=86); print(S.size, frames)

# Dense review sheets of a rendered video: every Nth frame, frame numbers burned in.
# usage: python scripts/review.py <video.mp4> <outdir> [step=10] [cols=10] [cell width=192] [from] [to]
import os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw
vid, out = sys.argv[1], sys.argv[2]
step = int(sys.argv[3]) if len(sys.argv) > 3 else 10
cols = int(sys.argv[4]) if len(sys.argv) > 4 else 10
cw = int(sys.argv[5]) if len(sys.argv) > 5 else 192
f0 = int(sys.argv[6]) if len(sys.argv) > 6 else 0
f1 = int(sys.argv[7]) if len(sys.argv) > 7 else 10 ** 9
pr0 = subprocess.run(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','csv=p=0',vid],capture_output=True,text=True).stdout.strip().split(',')
ch = round(cw * int(pr0[1]) / int(pr0[0]))
os.makedirs(out, exist_ok=True)
pr = subprocess.run(["ffmpeg", "-v", "error", "-i", vid, "-vf", f"scale={cw}:{ch}:flags=area", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True)
if pr.returncode or not pr.stdout: sys.exit("ffmpeg failed: " + pr.stderr.decode(errors="replace")[-500:])
A = np.frombuffer(pr.stdout, np.uint8).reshape(-1, ch, cw, 3)
idx = [n for n in range(len(A)) if n % step == 0 and f0 <= n <= f1]
F = A[idx]
first = ((f0 + step - 1) // step) * step
per = cols * (3 if ch > cw else 5)
for s in range(0, len(F), per):
    chunk = F[s:s + per]
    rows = (len(chunk) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cw, rows * ch), "#202020")
    d = ImageDraw.Draw(sheet)
    for i, fr in enumerate(chunk):
        x, y = (i % cols) * cw, (i // cols) * ch
        sheet.paste(Image.fromarray(fr), (x, y))
        n = first + (s + i) * step
        d.rectangle([x, y, x + 34, y + 12], fill="#000000"); d.text((x + 2, y), str(n), fill="#ffff66")
    name = os.path.join(out, f"r_{first + s * step:04d}.jpg")
    sheet.save(name, quality=85)
    print(name)

# The beard check (the reviewer, 25 Nov, after the independent review of v6-t13 found a white wedge and a round hole in the captain's beard
# where his arm crossed it): inside the full beard's outline (out/din3d/regions.jsonl "beard", written by dinner_check), shrunk 7 px from its
# ink line, leaving out every arm, hand and body over it (widened) and the mouth, no pixel may be bright: skin, the window or the waistcoat
# showing through a hole. A frame fails with more than MAX bright pixels.
#   python scripts/beard_check.py <video.mp4> [--frames 60,513,555] [--stills <prefix>] [--out report.txt]
#   (--stills out/x/s: reads <prefix>NNNN.jpg for the frames, as scripts/stills.mjs writes them; the planted fault is checked that way)
import json, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

MAX, BRIGHT, SHRINK = 25, 140, 7
a = sys.argv[1:]; vid = a[0] if a and not a[0].startswith("--") else None
opt = lambda k: a[a.index(k) + 1] if k in a else None
frames = [int(x) for x in opt("--frames").split(",")] if opt("--frames") else None
stills = opt("--stills"); outp = opt("--out")
R = {}
for line in open("out/din3d/regions.jsonl", encoding="utf-8"):
    d = json.loads(line)
    if d.get("beard"): R[d["F"]] = d["beard"]
todo = sorted(R) if frames is None else [f for f in frames if f in R]


def grab(f):
    if stills: return np.asarray(Image.open(f"{stills}{f:04d}.jpg").convert("RGB"))
    b = subprocess.run(["ffmpeg", "-v", "error", "-nostdin", "-i", vid, "-vf", f"select=eq(n\\,{f})", "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(b, np.uint8).reshape(1920, 1080, 3)


def all_frames():
    """the whole video once, frame by frame (faster than one ffmpeg per frame)"""
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-nostdin", "-i", vid, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    n = 0
    while True:
        b = p.stdout.read(1920 * 1080 * 3)
        if len(b) < 1920 * 1080 * 3: break
        yield n, np.frombuffer(b, np.uint8).reshape(1920, 1080, 3); n += 1


rows, fails, worst = [], [], (0, -1)
it = ((f, grab(f)) for f in todo) if (stills or frames is not None) else ((f, im) for f, im in all_frames() if f in R)
for f, im in it:
    lum = 0.299 * im[..., 0] + 0.587 * im[..., 1] + 0.114 * im[..., 2]
    total = 0
    for b in R[f]:
        m = Image.new("L", (1080, 1920), 0); dr = ImageDraw.Draw(m); dr.polygon([tuple(q) for q in b["poly"]], fill=255)
        m = m.filter(ImageFilter.MinFilter(2 * SHRINK + 1)); dr = ImageDraw.Draw(m)
        for (x0, y0, x1, y1, r) in b["ex"]:
            dr.line([(x0, y0), (x1, y1)], fill=0, width=int(2 * r)); dr.ellipse([x0 - r, y0 - r, x0 + r, y0 + r], fill=0); dr.ellipse([x1 - r, y1 - r, x1 + r, y1 + r], fill=0)
        dr.rectangle(b["mouth"], fill=0)
        mask = np.asarray(m) > 0
        total += int(((lum > BRIGHT) & mask).sum())
    rows.append((f, total)); worst = max(worst, (total, f))
    if total > MAX: fails.append(f"frame {f}: {total} bright pixels inside the beard (at most {MAX}): skin or the background through it")
txt = "\n".join([f"beard check: {len(rows)} frames with a full beard; inside its outline (7 px in), away from arms, hands, bodies and the mouth, no pixel brighter than {BRIGHT}",
                 f"largest: {worst[0]} (frame {worst[1]})", f"{'FAIL' if fails else 'PASS'}: {len(fails)} frames"] + ["  " + x for x in fails[:40]])
print(txt)
if outp: open(outp, "w", encoding="utf-8").write(txt + "\n")
sys.exit(1 if fails else 0)

# Thumbnail: a film still (1920 x 1080, captions off) with big outlined text, saved at 1280 x 720.
# usage: python scripts/thumb.py <still.jpg> <out.jpg> "<LINE 1|LINE 2>" [x] [y] [size] [crop: x0,y0,x1,y1]
import sys
from PIL import Image, ImageDraw, ImageFont

src, out, text = sys.argv[1], sys.argv[2], sys.argv[3]
x, y, size = (int(sys.argv[4]) if len(sys.argv) > 4 else 60), (int(sys.argv[5]) if len(sys.argv) > 5 else 50), (int(sys.argv[6]) if len(sys.argv) > 6 else 150)
im = Image.open(src).convert("RGB")
if len(sys.argv) > 7: im = im.crop(tuple(int(v) for v in sys.argv[7].split(",")))
im = im.resize((1920, 1080), Image.LANCZOS)
d = ImageDraw.Draw(im)
font = None
for fn in ["C:/Windows/Fonts/ariblk.ttf", "C:/Windows/Fonts/impact.ttf", "C:/Windows/Fonts/arialbd.ttf"]:
    try: font = ImageFont.truetype(fn, size); break
    except OSError: pass
for i, line in enumerate(text.split("|")):
    yy = y + i * int(size * 1.08)
    col = "#ffe14d" if i == 0 else "#ffffff"
    d.text((x + 8, yy + 10), line, font=font, fill="#101014", stroke_width=22, stroke_fill="#101014")
    d.text((x, yy), line, font=font, fill=col, stroke_width=20, stroke_fill="#101014")
im.resize((1280, 720), Image.LANCZOS).save(out, quality=92)
print(out, im.size)

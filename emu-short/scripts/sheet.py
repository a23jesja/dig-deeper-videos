# usage: python3 scripts/sheet.py out.jpg img1 img2 ...  (4 per row, labelled with the frame number)
import sys, re
from PIL import Image, ImageDraw
out, files = sys.argv[1], sys.argv[2:]
ims = [Image.open(f) for f in files]; w, h = ims[0].size; cols = min(4, len(ims)); rows = (len(ims) + cols - 1) // cols
s = Image.new("RGB", (w * cols, h * rows), "#222")
d = ImageDraw.Draw(s)
for i, im in enumerate(ims):
    x, y = (i % cols) * w, (i // cols) * h; s.paste(im, (x, y)); d.rectangle([x, y, x + 70, y + 22], fill="#000"); d.text((x + 4, y + 4), re.findall(r"(\d+)\.jpg", files[i])[0], fill="#fff")
s.save(out, quality=85)

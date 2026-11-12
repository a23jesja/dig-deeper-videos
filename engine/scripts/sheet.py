# Contact sheet of stills: python scripts/sheet.py out.jpg <cols> <cell width> img1 img2 ...  (frame name burned in)
import sys, os
from PIL import Image, ImageDraw
out, cols, cw = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
files = sys.argv[4:]
ims = [Image.open(f).convert("RGB") for f in files]
ch = round(cw * ims[0].height / ims[0].width)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * cw, rows * ch), "#202020")
d = ImageDraw.Draw(sheet)
for i, (im, f) in enumerate(zip(ims, files)):
    x, y = (i % cols) * cw, (i // cols) * ch
    sheet.paste(im.resize((cw, ch), Image.LANCZOS), (x, y))
    name = os.path.splitext(os.path.basename(f))[0]
    d.rectangle([x, y, x + 8 * len(name) + 8, y + 16], fill="#000000")
    d.text((x + 4, y + 2), name, fill="#ffff66")
sheet.save(out, quality=88)

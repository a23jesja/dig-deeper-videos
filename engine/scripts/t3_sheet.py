# usage: python scripts/t3_sheet.py out.jpg cols cellw file1 file2 ...   (contact sheet, frame number from the file name burned in small)
import sys, re
from PIL import Image, ImageDraw
out, cols, cw = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]); files = sys.argv[4:]
ims = [Image.open(f).convert("RGB") for f in files]; ch = int(cw * ims[0].height / ims[0].width)
rows = (len(ims) + cols - 1) // cols; S = Image.new("RGB", (cols * cw, rows * ch), "black"); d = ImageDraw.Draw(S)
for i, im in enumerate(ims):
    x, y = (i % cols) * cw, (i // cols) * ch; S.paste(im.resize((cw, ch), Image.LANCZOS), (x, y))
    m = re.search(r"(\d+)\.(jpg|png)$", files[i]); d.rectangle([x, y, x + 30, y + 11], fill="black"); d.text((x + 2, y), m.group(1) if m else "", fill="yellow")
S.save(out, quality=85); print(S.size)

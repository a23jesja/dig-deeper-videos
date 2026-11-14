# small contact sheet of stills: python scripts/sheet_frames.py <glob> <out.jpg> [cols] [cellw]
import glob, sys
from PIL import Image, ImageDraw
fs = sorted(glob.glob(sys.argv[1])); cols = int(sys.argv[3]) if len(sys.argv) > 3 else 8; tw = int(sys.argv[4]) if len(sys.argv) > 4 else 216
im0 = Image.open(fs[0]); th = round(tw * im0.height / im0.width); rows = (len(fs) + cols - 1) // cols
sh = Image.new("RGB", (tw * cols, th * rows))
for i, f in enumerate(fs):
    im = Image.open(f).convert("RGB").resize((tw, th), Image.LANCZOS)
    d = ImageDraw.Draw(im); d.rectangle((0, 0, 44, 13), fill=(0, 0, 0)); d.text((3, 1), f[-8:-4], fill=(255, 255, 0))
    sh.paste(im, ((i % cols) * tw, (i // cols) * th))
sh.save(sys.argv[2], quality=85)

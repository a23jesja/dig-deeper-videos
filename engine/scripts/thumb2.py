# Thumbnail with a label in the film's own card style: dark ink letters on a cream card with an ink border (the top
# results for most history topics use white or yellow letters on dark pictures, so this stands apart).
# usage: python scripts/thumb2.py <still.jpg> <out.jpg> "<LINE 1|LINE 2>" <x0,y0,x1,y1 of the card in 1920x1080> [tilt degrees] [accent line index]
import sys
from PIL import Image, ImageDraw, ImageFont
src, out, text = sys.argv[1], sys.argv[2], sys.argv[3]
x0, y0, x1, y1 = (int(v) for v in sys.argv[4].split(","))
tilt = float(sys.argv[5]) if len(sys.argv) > 5 else -2.0
accent = int(sys.argv[6]) if len(sys.argv) > 6 else 1
im = Image.open(src).convert("RGB").resize((1920, 1080), Image.LANCZOS)
W, H, pad, bw = x1 - x0, y1 - y0, 34, 14
lines = text.split("|")
def font(sz):
    for fn in ["C:/Windows/Fonts/ariblk.ttf", "C:/Windows/Fonts/impact.ttf", "C:/Windows/Fonts/arialbd.ttf"]:
        try: return ImageFont.truetype(fn, sz)
        except OSError: pass
card = Image.new("RGBA", (W + 80, H + 80), (0, 0, 0, 0)); d = ImageDraw.Draw(card)
d.rounded_rectangle((40 + 12, 40 + 14, 40 + W + 12, 40 + H + 14), 26, fill=(29, 22, 38, 150))
d.rounded_rectangle((40, 40, 40 + W, 40 + H), 26, fill="#fff3c4", outline="#1d1626", width=bw)
slot = (H - 2 * pad) / len(lines)
for i, line in enumerate(lines):
    sz = int(slot * 0.98)
    while sz > 20:
        f = font(sz); l, t, r, b = d.textbbox((0, 0), line, font=f)
        if r - l <= W - 2 * pad - 2 * bw and b - t <= slot * 0.9: break
        sz -= 4
    cx, cy = 40 + W / 2, 40 + pad + slot * (i + 0.5)
    d.text((cx - (r + l) / 2, cy - (b + t) / 2), line, font=f, fill="#c8312b" if i == accent else "#1d1626")
card = card.rotate(tilt, resample=Image.BICUBIC, expand=True)
im.paste(card, (x0 - 40 - (card.width - W - 80) // 2, y0 - 40 - (card.height - H - 80) // 2), card)
im.resize((1280, 720), Image.LANCZOS).save(out, quality=93)
print(out)

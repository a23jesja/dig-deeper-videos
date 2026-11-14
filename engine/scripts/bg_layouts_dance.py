# our own flat layouts for the Dancing Plague backgrounds (832x1472). ComfyUI paints over these (img2img).
from PIL import Image, ImageDraw, ImageChops
W, H = 832, 1472
def new(c): im = Image.new("RGB", (W, H), c); return im, ImageDraw.Draw(im)
def glow(im, x, y, r, a, col=(1, 1, 1)):
    ov = Image.new("RGB", (W, H), (0, 0, 0)); d = ImageDraw.Draw(ov)
    for i in range(30, 0, -1): d.ellipse((x - r * i / 30, y - r * i / 30, x + r * i / 30, y + r * i / 30), fill=tuple(int(a * (1 - i / 30) * c) for c in col))
    return ImageChops.add(im, ov)
def house(d, x0, x1, top, wall, beam=(84, 56, 34)):
    d.polygon([(x0 - 20, top + 150), ((x0 + x1) // 2, top), (x1 + 20, top + 150)], fill=(150, 70, 50))
    d.rectangle((x0, top + 150, x1, 1040), fill=wall)
    for y in (top + 150, top + 420, top + 700): d.rectangle((x0, y, x1, y + 16), fill=beam)
    for x in (x0, (x0 + x1) // 2 - 8, x1 - 16): d.rectangle((x, top + 150, x + 16, 1040), fill=beam)
    for y in (top + 230, top + 500): d.rectangle((x0 + 60, y, x0 + 130, y + 120), fill=(70, 90, 110))
# a street of half-timbered houses, summer day, cobbles
im, d = new((150, 196, 226))
house(d, -60, 250, 260, (232, 214, 170)); house(d, 250, 560, 180, (222, 190, 150)); house(d, 560, 900, 300, (236, 222, 184))
d.rectangle((0, 1040, W, H), fill=(150, 138, 120))
for y in range(1060, H, 60):
    for x in range((y // 60 % 2) * 40, W, 80): d.ellipse((x, y, x + 64, y + 40), outline=(118, 106, 90), width=5)
glow(im, 120, 60, 900, 40, (1, 0.95, 0.7)).save("out/dance/layouts/street.png")
# market square with a wooden stage, cathedral spire behind
im, d = new((150, 196, 226))
d.polygon([(330, 620), (416, 60), (502, 620)], fill=(176, 120, 110)); d.rectangle((300, 620, 532, 1040), fill=(186, 130, 118))
house(d, -80, 230, 380, (232, 214, 170)); house(d, 600, 920, 400, (222, 190, 150))
d.rectangle((0, 1040, W, H), fill=(150, 138, 120))
d.rectangle((40, 1010, 792, 1090), fill=(150, 104, 60)); d.rectangle((40, 1090, 792, 1200), fill=(110, 74, 42))
for x in range(60, 792, 120): d.rectangle((x, 1090, x + 14, 1200), fill=(84, 56, 34))
glow(im, 120, 60, 900, 40, (1, 0.95, 0.7)).save("out/dance/layouts/square.png")
# council chamber: dark panelling, tall window, long table edge
im, d = new((98, 70, 48)); d.rectangle((0, 1060, W, H), fill=(72, 52, 38))
for x in range(0, W, 166): d.rectangle((x + 16, 520, x + 150, 1020), outline=(70, 48, 30), width=8)
d.rectangle((300, 80, 532, 470), fill=(190, 214, 230)); d.rectangle((288, 68, 544, 482), outline=(60, 40, 26), width=16)
d.line((416, 80, 416, 470), fill=(60, 40, 26), width=10); d.line((300, 275, 532, 275), fill=(60, 40, 26), width=10)
glow(im, 416, 270, 760, 70, (1, 0.9, 0.65)).save("out/dance/layouts/council.png")
print("ok")

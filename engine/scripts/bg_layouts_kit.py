# our own flat layout for the kit check picture: a Paris street in 1911, palace wing at the end, morning light from the left
from PIL import Image, ImageDraw, ImageChops
W, H = 832, 1472
im = Image.new("RGB", (W, H), (168, 204, 228)); d = ImageDraw.Draw(im)
def glow(im, x, y, r, a, col):
    ov = Image.new("RGB", (W, H), (0, 0, 0)); dd = ImageDraw.Draw(ov)
    for i in range(30, 0, -1): dd.ellipse((x - r * i / 30, y - r * i / 30, x + r * i / 30, y + r * i / 30), fill=tuple(int(a * (1 - i / 30) * c) for c in col))
    return ImageChops.add(im, ov)
def block(x0, x1, top, wall, roof=(92, 102, 118)):
    d.polygon([(x0, top + 90), (x0 + 24, top), (x1 - 24, top), (x1, top + 90)], fill=roof)       # mansard roof
    for x in range(x0 + 50, x1 - 40, 90): d.rectangle((x, top + 20, x + 34, top + 80), fill=(214, 204, 180))  # dormers
    d.rectangle((x0, top + 90, x1, 1000), fill=wall)
    for y in range(top + 130, 820, 150):
        d.rectangle((x0, y + 112, x1, y + 122), fill=(120, 110, 96))                               # balcony line
        for x in range(x0 + 34, x1 - 50, 86): d.rectangle((x, y, x + 44, y + 104), fill=(86, 104, 122))
    d.rectangle((x0, 850, x1, 1000), fill=tuple(int(c * 0.8) for c in wall))                        # shop floor
    for x in range(x0 + 30, x1 - 80, 150): d.rectangle((x, 880, x + 110, 1000), fill=(70, 60, 54))
# far: long palace wing with a pavilion dome
d.rectangle((250, 640, 600, 1000), fill=(206, 192, 164)); d.polygon([(340, 640), (380, 520), (470, 520), (510, 640)], fill=(110, 118, 132))
for x in range(270, 590, 46): d.rectangle((x, 700, x + 22, 800), fill=(120, 124, 130)); d.rectangle((x, 850, x + 22, 960), fill=(120, 124, 130))
block(-40, 270, 250, (222, 208, 178)); block(585, 880, 300, (198, 180, 150))
d.rectangle((0, 1000, W, H), fill=(156, 146, 132))
for y in range(1016, H, 46):
    for x in range((y // 46 % 2) * 34, W, 68): d.ellipse((x, y, x + 56, y + 32), outline=(126, 116, 102), width=4)
d.rectangle((0, 1000, W, 1014), fill=(190, 182, 168))
# a gas lamp on the right
d.rectangle((706, 520, 718, 1010), fill=(40, 46, 44)); d.polygon([(690, 520), (734, 520), (726, 460), (698, 460)], fill=(238, 220, 150)); d.rectangle((686, 448, 738, 462), fill=(40, 46, 44))
glow(im, 80, 120, 900, 46, (1, 0.9, 0.62)).save("out/kit/layouts/paris.png")

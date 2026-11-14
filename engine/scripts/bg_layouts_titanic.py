# our own flat layouts for the Titanic backgrounds (832x1472). ComfyUI paints over these (img2img).
import random
from PIL import Image, ImageDraw, ImageChops
W, H = 832, 1472
random.seed(4)
def new(c): im = Image.new("RGB", (W, H), c); return im, ImageDraw.Draw(im)
def glow(im, x, y, r, a, col=(1, 1, 1)):
    ov = Image.new("RGB", (W, H), (0, 0, 0)); d = ImageDraw.Draw(ov)
    for i in range(30, 0, -1): d.ellipse((x - r * i / 30, y - r * i / 30, x + r * i / 30, y + r * i / 30), fill=tuple(int(a * (1 - i / 30) * c) for c in col))
    return ImageChops.add(im, ov)
def stars(d, y1):
    for _ in range(160): x, y = random.randint(0, W), random.randint(0, y1); r = random.choice((1, 1, 2)); d.ellipse((x - r, y - r, x + r, y + r), fill=(230, 235, 255))
# night sky over a flat black sea
im, d = new((18, 28, 58)); stars(d, 900); d.rectangle((0, 980, W, H), fill=(10, 22, 40))
for y in range(1000, H, 46): d.line((0, y, W, y + 6), fill=(24, 44, 70), width=5)
glow(im, 416, 960, 700, 34, (0.6, 0.8, 1)).save("out/tit/layouts/sea.png")
# the boat deck at night: white wall with portholes at the left, rail, planks
im, d = new((18, 28, 58)); stars(d, 760); d.rectangle((0, 800, W, 1010), fill=(10, 22, 40))
d.rectangle((0, 1010, W, H), fill=(150, 112, 70))
for x in range(-200, W + 200, 64): d.line((x, 1010, x - 160, H), fill=(112, 80, 48), width=5)
for y in (700, 790, 880): d.rectangle((0, y, W, y + 12), fill=(232, 232, 226))
for x in range(60, W, 190): d.rectangle((x, 700, x + 14, 1010), fill=(232, 232, 226))
d.rectangle((0, 684, W, 706), fill=(120, 84, 52))
d.rectangle((0, 0, 210, 1010), fill=(226, 224, 214))
for y in (240, 520): d.ellipse((70, y, 150, y + 80), fill=(250, 214, 120))
d.rectangle((560, 0, 760, 300), fill=(196, 150, 70)); d.rectangle((560, 0, 760, 70), fill=(20, 20, 24))
glow(im, 110, 420, 620, 40, (1, 0.85, 0.5)).save("out/tit/layouts/deck.png")
# below: riveted steel wall, pipes, steel floor
im, d = new((70, 78, 88)); d.rectangle((0, 1040, W, H), fill=(48, 54, 62))
for x in range(0, W, 208): d.rectangle((x, 0, x + 10, 1040), fill=(52, 58, 68))
for x in range(30, W, 52):
    for y in range(60, 1040, 240): d.ellipse((x, y, x + 12, y + 12), fill=(96, 104, 116))
d.rectangle((0, 150, W, 200), fill=(150, 90, 60)); d.rectangle((0, 260, W, 290), fill=(110, 116, 126))
d.ellipse((600, 420, 760, 580), fill=(40, 44, 52)); d.ellipse((630, 450, 730, 550), fill=(250, 150, 60))
glow(im, 680, 500, 520, 60, (1, 0.6, 0.25)).save("out/tit/layouts/below.png")
# wireless room: wood panels, shelf with apparatus, desk edge
im, d = new((122, 86, 54)); d.rectangle((0, 1060, W, H), fill=(84, 58, 38))
for x in range(0, W, 166): d.rectangle((x + 16, 60, x + 150, 940), outline=(92, 62, 38), width=8)
d.rectangle((40, 430, 790, 462), fill=(70, 46, 28))
for x in (90, 260, 430, 600): d.rectangle((x, 300, x + 120, 430), fill=(44, 44, 50)); d.ellipse((x + 30, 330, x + 90, 390), fill=(214, 170, 70))
d.ellipse((330, 40, 500, 150), fill=(250, 230, 160))
glow(im, 416, 100, 760, 60, (1, 0.9, 0.6)).save("out/tit/layouts/wireless.png")
# chart room: wood wall, big window to the night, brass lamp
im, d = new((112, 78, 50)); d.rectangle((0, 1060, W, H), fill=(78, 54, 36))
d.rectangle((90, 160, 742, 620), fill=(18, 28, 58)); d.rectangle((78, 148, 754, 632), outline=(70, 46, 28), width=18)
for x in (306, 524): d.rectangle((x, 160, x + 12, 620), fill=(70, 46, 28))
d.rectangle((0, 980, W, 1064), fill=(60, 40, 26))
glow(im, 416, 60, 700, 60, (1, 0.85, 0.55)).save("out/tit/layouts/chart.png")
print("ok")

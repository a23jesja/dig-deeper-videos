# our own flat layouts for the painted backgrounds (832x1472, portrait). ComfyUI paints over these (img2img).
from PIL import Image, ImageDraw
W, H = 832, 1472
def new(c): im = Image.new("RGB", (W, H), c); return im, ImageDraw.Draw(im)
def light(im, x=120, y=80, r=900, a=70):
    ov = Image.new("RGB", (W, H), (0, 0, 0)); d = ImageDraw.Draw(ov)
    for i in range(30, 0, -1): d.ellipse((x - r * i / 30, y - r * i / 30, x + r * i / 30, y + r * i / 30), fill=(int(a * (1 - i / 30)),) * 3)
    from PIL import ImageChops
    return ImageChops.add(im, ov)
def frame(d, box, inner):
    d.rectangle(box, fill=(196, 150, 50)); x0, y0, x1, y1 = box; d.rectangle((x0 + 14, y0 + 14, x1 - 14, y1 - 14), fill=inner)
def gallery(side_frames):
    im, d = new((122, 44, 48))
    for y in range(0, 900, 90):
        for x in range((y // 90 % 2) * 60, W, 120): d.ellipse((x - 14, y + 20, x + 14, y + 60), fill=(134, 54, 56))
    d.rectangle((0, 900, W, 1160), fill=(96, 58, 30)); d.rectangle((0, 892, W, 912), fill=(196, 150, 50))
    for x in range(40, W, 250): d.rectangle((x, 950, x + 190, 1120), outline=(70, 40, 20), width=8)
    d.rectangle((0, 1160, W, H), fill=(176, 122, 62))
    for i in range(-8, 16): d.line((i * 90, 1160, i * 90 + 260, H), fill=(150, 98, 46), width=5)
    if side_frames:
        frame(d, (-60, 250, 120, 640), (70, 90, 60)); frame(d, (712, 300, 900, 620), (60, 70, 90)); frame(d, (-40, -30, 300, 150), (90, 80, 50)); frame(d, (560, -40, 880, 170), (60, 80, 70))
    return light(im)
gallery(True).save("out/2d/layouts/gallery.png")
gallery(False).save("out/2d/layouts/wall.png")
# a lodging room: green-grey wall, iron bed at the left, floorboards
im, d = new((118, 130, 106)); d.rectangle((0, 1000, W, H), fill=(140, 100, 62))
for i in range(-4, 12): d.line((i * 120, 1000, i * 120 - 200, H), fill=(110, 76, 44), width=5)
d.rectangle((0, 980, W, 1004), fill=(84, 92, 74)); d.rectangle((-40, 760, 250, 1040), fill=(190, 184, 170)); d.rectangle((-40, 620, 40, 1100), fill=(50, 44, 40))
d.rectangle((560, 180, 760, 480), fill=(180, 200, 214)); d.rectangle((548, 168, 772, 492), outline=(90, 70, 50), width=14)
light(im, 660, 330, 700, 60).save("out/2d/layouts/room.png")
# a police office at night: dark blue wall, filing cabinet, one lamp
im, d = new((52, 60, 80)); d.rectangle((0, 1040, W, H), fill=(84, 70, 58)); d.rectangle((0, 1020, W, 1044), fill=(36, 42, 58))
d.rectangle((600, 520, 800, 1040), fill=(70, 78, 70)); 
for y in (560, 720, 880): d.rectangle((620, y, 780, y + 130), outline=(40, 46, 40), width=8)
d.rectangle((60, 300, 300, 480), fill=(200, 190, 160))
light(im, 416, 200, 760, 90).save("out/2d/layouts/office.png")
# a hotel room in Florence: ochre wall, shuttered window, tiled floor
im, d = new((186, 146, 84)); d.rectangle((0, 1040, W, H), fill=(150, 92, 60))
for x in range(0, W, 104):
    for y in range(1040, H, 104): d.rectangle((x, y, x + 104, y + 104), outline=(120, 70, 44), width=4)
d.rectangle((90, 200, 330, 640), fill=(210, 226, 232)); d.rectangle((60, 200, 96, 640), fill=(70, 110, 80)); d.rectangle((324, 200, 360, 640), fill=(70, 110, 80))
d.rectangle((0, 1020, W, 1044), fill=(130, 96, 50))
light(im, 210, 420, 800, 60).save("out/2d/layouts/hotel.png")
# a desk top seen from above
im, d = new((120, 78, 44))
for y in range(0, H, 46): d.line((0, y, W, y + 20), fill=(100, 62, 34), width=4)
light(im, 100, 100, 1200, 50).save("out/2d/layouts/desk.png")
print("layouts done")

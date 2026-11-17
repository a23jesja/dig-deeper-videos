"""The grip sheet and the close-ups of held things, cut out of rendered frames.
  sheet:  python scripts/grip_sheet.py sheet <spots.json> <frames dir/prefix> <out.jpg> <out-close.jpg>
          lays the pictures of the grip-sheet film out by prop (rows) and use and view (columns), at full size, and makes a second
          picture with every hand enlarged twice
  close:  python scripts/grip_sheet.py close <spots.json> <frames dir/prefix> <out.jpg> [title]
          one enlarged cut-out round every held thing of a film on the frames that were rendered (for the own check of a film)
spots.json comes from `node scripts/film_info.mjs <film> grips spots`; the frames are out/craft/pk_NNNN.jpg from scripts/stills.mjs."""
import sys, json, os
from PIL import Image, ImageDraw, ImageFont
def font(n):
    for f in ("arialbd.ttf", "arial.ttf", "DejaVuSans-Bold.ttf"):
        try: return ImageFont.truetype(f, n)
        except OSError: pass
    return ImageFont.load_default()
mode, spots, pre, out = sys.argv[1], json.load(open(sys.argv[2])), sys.argv[3], sys.argv[4]
frame = lambda n: f"{pre}{n:04d}.jpg"
have = {s["frame"] for s in spots if os.path.exists(frame(s["frame"]))}
def cut(n, x, y, r, k):
    im = Image.open(frame(n)); w, h = im.size; x0 = min(max(0, x - r), w - 2 * r); y0 = min(max(0, y - r), h - 2 * r)
    return im.crop((x0, y0, x0 + 2 * r, y0 + 2 * r)).resize((2 * r * k, 2 * r * k), Image.LANCZOS)
if mode == "sheet":
    PROP = {"spyglass": "KIKARE", "pistol": "PISTOL", "sabre": "SABEL", "mug": "MUGG"}
    USE = {"look": "i bruk: vid ögat", "aim": "i bruk: siktar", "ready": "i bruk: i fästet", "hold": "i bruk: i örat", "lowered": "sänkt", "raised": "höjd", "sheathed": "i skidan vid höften"}
    VIEW = {"front": "framifrån", "side": "från sidan"}
    rows = [("spyglass", ["look", "lowered"]), ("pistol", ["aim", "lowered"]), ("sabre", ["ready", "lowered"]), ("sabre", ["raised", "sheathed"]), ("mug", ["hold", "lowered"])]
    by = {}
    for s in spots:
        if s["frame"] in have: by.setdefault(s["shot"], s)
    one = lambda prop, use, view: by.get(f"{prop}-{use}-{view}")
    W, H, TOP, LAB = 1080, 1500, 150, 70; f1, f2 = font(54), font(38)
    S = Image.new("RGB", (W * 4, TOP + (H + LAB) * len(rows)), "white"); d = ImageDraw.Draw(S)
    d.text((40, 30), "GREPPBLAD: kikare, pistol, sabel och mugg i användarpose och sänkt läge, framifrån och från sidan (ur motorn, full storlek)", fill="black", font=f1)
    C = Image.new("RGB", (800 * 4, TOP + (800 + LAB) * len(rows)), "white"); dc = ImageDraw.Draw(C)
    dc.text((40, 30), "GREPPBLAD, NÄRBILDER: varje hand med sitt föremål, förstorad två gånger", fill="black", font=f1)
    for r, (prop, uses) in enumerate(rows):
        for c, (use, view) in enumerate([(u, v) for u in uses for v in ("front", "side")]):
            s = one(prop, use, view)
            if not s or s["frame"] not in have: continue
            label = f"{PROP[prop]}, {USE[use]}, {VIEW[view]}"
            im = Image.open(frame(s["frame"])).crop((0, 80, W, 80 + H)); x, y = c * W, TOP + r * (H + LAB)
            S.paste(im, (x, y + LAB)); d.rectangle([x, y, x + W - 1, y + LAB - 1], fill="#222"); d.text((x + 16, y + 12), label, fill="white", font=f2)
            x, y = c * 800, TOP + r * (800 + LAB); C.paste(cut(s["frame"], s["x"], s["y"], 200, 2), (x, y + LAB)); dc.rectangle([x, y, x + 799, y + LAB - 1], fill="#222"); dc.text((x + 12, y + 16), label[:44], fill="white", font=font(30))
    S.save(out, quality=88); C.save(sys.argv[5], quality=90); print(out, S.size, sys.argv[5], C.size)
else:
    cells = [s for s in spots if s["frame"] in have and 0 <= s["x"] <= 1080 and 0 <= s["y"] <= 1920]
    cols = 6; R, K, LAB = 150, 2, 40; n = max(1, len(cells)); S = Image.new("RGB", (2 * R * K * cols, 60 + (2 * R * K + LAB) * ((n + cols - 1) // cols)), "white"); d = ImageDraw.Draw(S); f = font(24)
    d.text((16, 14), (sys.argv[5] if len(sys.argv) > 5 else "held things") + ": every held thing on the frames read, enlarged twice", fill="black", font=font(28))
    for i, s in enumerate(cells):
        x, y = (i % cols) * 2 * R * K, 60 + (i // cols) * (2 * R * K + LAB); S.paste(cut(s["frame"], s["x"], s["y"], R, K), (x, y + LAB))
        d.rectangle([x, y, x + 2 * R * K - 1, y + LAB - 1], fill="#222"); d.text((x + 8, y + 8), f'{s["frame"]} {s["frame"] / 30:.2f}s {s["shot"]} {s["holder"]} {s["prop"]}'[:46], fill="white", font=f)
    S.save(out, quality=90); print(out, S.size, len(cells), "cut-outs")

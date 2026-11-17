"""The grip sheet and the close-ups of held things, cut out of rendered frames.
  sheet:  python scripts/grip_sheet.py sheet <spots.json> <frames dir/prefix> <out.jpg> <out-close.jpg> [title]   (CELL_H = the height cut from each frame)
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
import os.path
def cut(n, x, y, r, k):
    im = Image.open(frame(n)); w, h = im.size; x0 = min(max(0, x - r), w - 2 * r); y0 = min(max(0, y - r), h - 2 * r)
    return im.crop((x0, y0, x0 + 2 * r, y0 + 2 * r)).resize((2 * r * k, 2 * r * k), Image.LANCZOS)
if mode == "sheet":
    # the pictures of a grip-sheet film (shots named <prop>-<use>-<view>), one row per prop (four to a row), in the film's order
    title = sys.argv[6] if len(sys.argv) > 6 else "GREPPBLAD"
    PROP = {"spyglass": "KIKARE", "pistol": "PISTOL", "sabre": "SABEL", "mug": "MUGG", "bucket": "HINK", "rope": "LINA", "linstock": "LUNTSTAKE", "chest": "KISTA",
            "fiddle": "FIOL OCH STRÅKE", "cithara": "CITHARA", "grapes": "DRUVKLASE", "bundle": "KNYTE",
            "gladius": "GLADIUS OCH SKÖLD", "trident": "TREUDD", "net": "NÄT", "stick": "DOMARKÄPP", "shield": "SKÖLD", "pole": "STÅNG"}
    USE = {"look": "i bruk: vid ögat", "aim": "i bruk: siktar", "ready": "i bruk: i fästet", "hold": "i bruk: i örat", "lowered": "sänkt", "raised": "höjd", "sheathed": "i skidan, axelgehäng",
           "chop": "hugg: dragen bakåt", "struck": "hugg: genom", "carry": "buren", "haul": "halas", "fire": "mot kanonen", "hand": "i handen", "falling": "släppt, faller", "landed": "landad",
           "play": "spelar", "shoulder": "på axeln", "draw1": "dras 1: handen sluten om fästet", "draw2": "dras 2: fästet upp längs baljan", "draw3": "dras 3: klingan nästan ute",
           "thrust": "stöt", "swing": "uppdraget för kast", "across": "tvärs i båda händerna"}
    USE2 = {("bucket", "raised"): "lyft", ("linstock", "ready"): "redo", ("cithara", "hold"): "i famnen", ("grapes", "hold"): "hålls upp", ("chest", "carry"): "buren av två i handtagen", ("trident", "ready"): "upprätt i ena handen, nätet i den andra", ("trident", "thrust"): "stöt med båda händerna", ("net", "swing"): "uppdraget för kast, treudden i andra handen", ("stick", "ready"): "upprätt i ena handen", ("gladius", "ready"): "i bruk: i fästet, skölden på armen"}
    VIEW = {"front": "framifrån", "side": "från sidan", "scab": "snett från baljans sida", "right": "från sidan, mot höger", "left": "från sidan, mot vänster", "otherside": "från andra sidan (svärdsidan)", "back": "bakifrån", "slant": "snett framifrån"}
    first = {}
    for s in spots:
        if s["frame"] in have: first.setdefault(s["shot"], s)
    order = sorted(first.values(), key=lambda s: s["frame"])
    rows, cur = [], []
    for s in order:
        if cur and (s["shot"].split("-")[0] != cur[0]["shot"].split("-")[0] or len(cur) == 4): rows.append(cur); cur = []
        cur.append(s)
    if cur: rows.append(cur)
    def label(s):
        prop, use, view = (s["shot"].split("-") + ["", ""])[:3]
        v = "snett framifrån" if prop == "chest" and view == "front" else VIEW.get(view, view)
        return f"{PROP.get(prop, prop)}, {USE2.get((prop, use), USE.get(use, use))}, {v}"
    W, H, TOP, LAB = 1080, int(os.environ.get("CELL_H", "1500")), 150, 70; f1, f2 = font(54), font(38)
    S = Image.new("RGB", (W * 4, TOP + (H + LAB) * len(rows)), "white"); d = ImageDraw.Draw(S)
    d.text((40, 30), title, fill="black", font=f1)
    C = Image.new("RGB", (800 * 4, TOP + (800 + LAB) * len(rows)), "white"); dc = ImageDraw.Draw(C)
    dc.text((40, 30), title + ", NÄRBILDER: varje hand med sitt föremål, förstorad två gånger", fill="black", font=f1)
    for r, row in enumerate(rows):
        for c, s in enumerate(row):
            lab = label(s); im = Image.open(frame(s["frame"])).crop((0, 80, W, 80 + H)); x, y = c * W, TOP + r * (H + LAB)
            S.paste(im, (x, y + LAB)); d.rectangle([x, y, x + W - 1, y + LAB - 1], fill="#222"); d.text((x + 16, y + 12), lab, fill="white", font=f2)
            x, y = c * 800, TOP + r * (800 + LAB); C.paste(cut(s["frame"], s["x"], s["y"], 200, 2), (x, y + LAB)); dc.rectangle([x, y, x + 799, y + LAB - 1], fill="#222"); dc.text((x + 12, y + 16), lab[:46], fill="white", font=font(30))
    S.save(out, quality=86); C.save(sys.argv[5], quality=90); print(out, S.size, sys.argv[5], C.size, len(order), "pictures")
    phone = os.environ.get("PHONE")
    if phone:      # every picture as a viewer sees it: the whole frame at phone size
        PW, PH = 360, 640; T = Image.new("RGB", (PW * 4, TOP + (PH + LAB) * len(rows)), "white"); dt = ImageDraw.Draw(T); dt.text((40, 30), title + ", I TELEFONSTORLEK (hela bildrutan, 360x640)", fill="black", font=f1)
        for r, row in enumerate(rows):
            for c, s in enumerate(row):
                x, y = c * PW, TOP + r * (PH + LAB); T.paste(Image.open(frame(s["frame"])).resize((PW, PH), Image.LANCZOS), (x, y + LAB)); dt.rectangle([x, y, x + PW - 1, y + LAB - 1], fill="#222"); dt.text((x + 6, y + 20), label(s)[:30], fill="white", font=font(22))
        T.save(phone, quality=88); print(phone, T.size)
else:
    # each rendered frame takes the check's readings of the nearest frame it made (it reads every tenth of a second)
    rendered = sorted({int(f[-8:-4]) for f in os.listdir(os.path.dirname(pre) or ".") if f.startswith(os.path.basename(pre)) and f.endswith(".jpg")})
    cells = []
    for n in rendered:
        near = [s for s in spots if abs(s["frame"] - n) <= 2]
        if not near: continue
        best = min(abs(s["frame"] - n) for s in near)
        cells += [dict(s, frame=n) for s in near if abs(s["frame"] - n) == best and 0 <= s["x"] <= 1080 and 0 <= s["y"] <= 1920]
    cols = 6; R, K, LAB = 150, 2, 40; n = max(1, len(cells)); S = Image.new("RGB", (2 * R * K * cols, 60 + (2 * R * K + LAB) * ((n + cols - 1) // cols)), "white"); d = ImageDraw.Draw(S); f = font(24)
    d.text((16, 14), (sys.argv[5] if len(sys.argv) > 5 else "held things") + ": every held thing on the frames read, enlarged twice", fill="black", font=font(28))
    for i, s in enumerate(cells):
        x, y = (i % cols) * 2 * R * K, 60 + (i // cols) * (2 * R * K + LAB); S.paste(cut(s["frame"], s["x"], s["y"], R, K), (x, y + LAB))
        d.rectangle([x, y, x + 2 * R * K - 1, y + LAB - 1], fill="#222"); d.text((x + 8, y + 8), f'{s["frame"]} {s["frame"] / 30:.2f}s {s["shot"]} {s["holder"]} {s["prop"]}'[:46], fill="white", font=f)
    S.save(out, quality=90); print(out, S.size, len(cells), "cut-outs")

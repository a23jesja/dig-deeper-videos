# overview of every cut part with its name, on a coloured ground (to check the cut-outs): out/kit/overview_<group>.jpg
import json, sys
from PIL import Image, ImageDraw, ImageFont
man = json.load(open("src/videos/kit/parts.json")); f = ImageFont.truetype("arial.ttf", 15)
groups = sys.argv[1:] or ["sir", "base", "wardrobe", "fx"]
for g in groups:
    names = [k for k in man if k.startswith(g + "/")]
    C, cw, ch = 9, 200, 215
    S = Image.new("RGB", (C * cw, ((len(names) + C - 1) // C) * ch), (70, 130, 180)); d = ImageDraw.Draw(S)
    for i, k in enumerate(names):
        im = Image.open(f"public/kit/{k}.png"); im.thumbnail((cw - 14, ch - 34))
        x, y = (i % C) * cw, (i // C) * ch
        S.paste(im, (x + (cw - im.width) // 2, y + 4 + (ch - 34 - im.height) // 2), im)
        m = man[k]
        if "cx" in m:
            s = im.width / m["w"]; ox, oy = x + (cw - im.width) // 2, y + 4 + (ch - 34 - im.height) // 2
            d.ellipse((ox + (m["cx"] - m["r"]) * s, oy + (m["cy"] - m["r"]) * s, ox + (m["cx"] + m["r"]) * s, oy + (m["cy"] + m["r"]) * s), outline=(255, 60, 60))
        d.text((x + 6, y + ch - 24), k.split("/")[1], font=f, fill="white")
    S.save(f"out/kit/overview_{g}.jpg", quality=84); print(g, S.size)

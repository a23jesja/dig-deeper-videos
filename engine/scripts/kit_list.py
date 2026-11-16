import sys, json
sys.path.insert(0, "scripts")
from kit_lib import *
for s, merge in [("s0",6),("s1",6),("s2",8),("s3",6),("s4",6),("s5x4",8)]:
    rgba = cut_alpha(load(f"out/kit/src/{s}.png"))
    Image.fromarray(rgba).save(f"out/kit/src/{s}_a.png")
    lab, cs = comps(rgba, merge)
    cs.sort(key=lambda c: (c["y0"] // 60, c["x0"]))
    print(s, rgba.shape, len(cs))
    for c in cs: print("  ", c["i"], c["x0"], c["y0"], c["x1"], c["y1"], c["area"])
    # check picture on a coloured ground
    im = Image.fromarray(rgba); bg = Image.new("RGBA", im.size, (70, 130, 180, 255)); bg.alpha_composite(im)
    bg.convert("RGB").resize((1376, 768)).save(f"out/kit/src/{s}_chk.jpg", quality=80)

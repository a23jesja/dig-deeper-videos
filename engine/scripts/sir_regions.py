# colour map of the areas enclosed by ink lines in Sir Digsworth's front and side views (to assign them to puppet parts)
import sys, colorsys
sys.path.insert(0, "scripts")
from kit_lib import *
from PIL import ImageDraw
for n in ["view_front", "view_side"]:
    a = np.asarray(Image.open(f"public/kit/sir/{n}.png")).astype(np.float32)
    ink = lum(a[..., :3]) < 78
    fill = (a[..., 3] > 128) & ~ink
    lab, k = ndi.label(fill)
    np.save(f"out/kit/{n}_lab.npy", lab)
    out = np.zeros(a.shape[:2] + (3,), np.uint8); out[ink & (a[..., 3] > 128)] = 0; out[a[..., 3] <= 128] = (60, 60, 60)
    im = None; txt = []
    for i, sl in enumerate(ndi.find_objects(lab), 1):
        m = lab[sl] == i; ar = int(m.sum())
        if ar < 150: out[sl][m] = (120, 120, 120); continue
        c = colorsys.hsv_to_rgb((i * 0.381) % 1, 0.55, 1); out[sl][m] = [int(v * 255) for v in c]
        cy, cx = ndi.center_of_mass(m); txt.append((i, sl[1].start + cx, sl[0].start + cy, ar, sl))
    im = Image.fromarray(out).resize((out.shape[1] * 2, out.shape[0] * 2), Image.NEAREST); d = ImageDraw.Draw(im)
    for i, x, y, ar, sl in txt:
        d.text((x * 2 - 8, y * 2 - 6), str(i), fill="black"); print(n, i, "area", ar, "x", sl[1].start, sl[1].stop, "y", sl[0].start, sl[0].stop)
    im.save(f"out/kit/{n}_regions.png")

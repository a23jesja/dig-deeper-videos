# Splits a painted background into three depth layers (foreground, middle, background) with Depth Anything V2 Small (Apache-2.0;
# only Small: Base and Large are CC-BY-NC), locally. Run it with ComfyUI's python, which has torch and transformers:
#   ~/ComfyUI/venv/Scripts/python.exe scripts/depth_layers.py <picture.png> <out_dir> [near_cut mid_cut [x0 x1 y0]]
# Writes depth.png (white = near), and far.png / mid.png / near.png (RGBA): `far` is the whole picture (it lies behind the others, so
# that what a nearer layer uncovers as the lens moves is still painted), `mid` what is nearer than mid_cut, `near` what is nearer than
# near_cut (cuts on the depth scaled 0..1, 1 = nearest). Each layer's edge is feathered by a few pixels so that it does not cut hard.
# x0 x1 y0 (fractions of the picture) = where the figures stand: nothing there goes into the near layer, which lies in front of them
# (a floor runs from far to near toward the bottom edge; a near layer over the figures' feet would cut them: no foreground over a figure)
import os, sys
import numpy as np
from PIL import Image, ImageFilter
import torch
from transformers import AutoImageProcessor, AutoModelForDepthEstimation
src, out = sys.argv[1], sys.argv[2]
near_cut, mid_cut = (float(sys.argv[3]), float(sys.argv[4])) if len(sys.argv) > 4 else (0.72, 0.42)
box = [float(x) for x in sys.argv[5:8]] if len(sys.argv) > 7 else None
os.makedirs(out, exist_ok=True)
M = os.path.expanduser("~/ComfyUI/models/geometry_estimation/depth-anything-v2-small-hf")
proc, model = AutoImageProcessor.from_pretrained(M), AutoModelForDepthEstimation.from_pretrained(M).eval()
img = Image.open(src).convert("RGB")
with torch.no_grad():
    d = model(**proc(images=img, return_tensors="pt")).predicted_depth
d = torch.nn.functional.interpolate(d.unsqueeze(1), size=img.size[::-1], mode="bicubic", align_corners=False)[0, 0].numpy()
d = (d - d.min()) / (d.max() - d.min() + 1e-9)
Image.fromarray((d * 255).astype(np.uint8)).save(os.path.join(out, "depth.png"))
rgb = np.asarray(img)
def layer(mask, name):
    a = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(2))
    Image.fromarray(np.dstack([rgb, np.asarray(a)])).save(os.path.join(out, name))
near = d >= near_cut
if box: H, W = d.shape; near[int(box[2] * H):, int(box[0] * W):int(box[1] * W)] = False
layer(np.ones_like(d), "far.png"); layer((d >= mid_cut).astype(float), "mid.png"); layer(near.astype(float), "near.png")
print("cuts", near_cut, mid_cut, "box", box, "| share of the picture: near", round(float(near.mean()), 3), "mid", round(float(((d >= mid_cut) & (d < near_cut)).mean()), 3), "far", round(float((d < mid_cut).mean()), 3))

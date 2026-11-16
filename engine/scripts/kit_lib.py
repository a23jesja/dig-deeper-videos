# shared helpers for cutting Jesper's figure sheets (figurblad/) into transparent parts
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

def load(path):
    return np.asarray(Image.open(path).convert("RGB")).astype(np.float32)

def lum(a):
    return a @ np.array([0.299, 0.587, 0.114], np.float32)

def cut_alpha(rgb, T=140, lo=70, hi=228):
    """Everything reachable from the picture edge without crossing an ink line becomes transparent:
    paper, ground shadows, text-free margins and the white sticker rim. Edge pixels get soft alpha and ink colour."""
    L = lum(rgb)
    light = L > T
    lab, n = ndi.label(light)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    F = np.isin(lab, edge[edge > 0])
    near = ndi.binary_dilation(~F, iterations=3) & F
    alpha = np.where(F, 0.0, 1.0).astype(np.float32)
    alpha[near] = np.clip((hi - L[near]) / (hi - lo), 0, 1)
    out = rgb.copy()
    # fringe pixels take the colour of the nearest solid pixel, so no paper colour is left in the edge
    idx = ndi.distance_transform_edt(F, return_distances=False, return_indices=True)
    out[near] = np.minimum(rgb[idx[0][near], idx[1][near]], rgb[near])
    return np.dstack([out, alpha * 255]).clip(0, 255).astype(np.uint8)

def comps(rgba, merge=6, min_area=60):
    m = rgba[..., 3] > 40
    lab, n = ndi.label(ndi.binary_dilation(m, iterations=merge))
    res = []
    for i, sl in enumerate(ndi.find_objects(lab), 1):
        area = int((m[sl] & (lab[sl] == i)).sum())
        if area < min_area: continue
        res.append(dict(i=i, x0=sl[1].start, y0=sl[0].start, x1=sl[1].stop, y1=sl[0].stop, area=area))
    return lab, res

def crop(rgba, lab, ids, pad=4):
    m = np.isin(lab, ids)
    ys, xs = np.where(m & (rgba[..., 3] > 0))
    y0, y1, x0, x1 = max(ys.min() - pad, 0), ys.max() + pad + 1, max(xs.min() - pad, 0), xs.max() + pad + 1
    out = rgba[y0:y1, x0:x1].copy()
    out[..., 3] = np.where(m[y0:y1, x0:x1], out[..., 3], 0)
    return Image.fromarray(out), (x0, y0)

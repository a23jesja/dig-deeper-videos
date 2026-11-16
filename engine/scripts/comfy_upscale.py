# enlarges a picture 4x locally with ComfyUI and Real-ESRGAN (anime 6B model, BSD-3-Clause)
# usage: python scripts/comfy_upscale.py <input.png> <output.png>
import json, shutil, sys, time, urllib.request, os
src, dst = sys.argv[1], sys.argv[2]
C = os.path.expanduser("~/ComfyUI")
name = "up_" + os.path.basename(src)
shutil.copy(src, os.path.join(C, "input", name))
U = "http://127.0.0.1:8188"
g = {
    "1": {"class_type": "LoadImage", "inputs": {"image": name}},
    "2": {"class_type": "UpscaleModelLoader", "inputs": {"model_name": "RealESRGAN_x4plus_anime_6B.pth"}},
    "3": {"class_type": "ImageUpscaleWithModel", "inputs": {"upscale_model": ["2", 0], "image": ["1", 0]}},
    "4": {"class_type": "SaveImage", "inputs": {"images": ["3", 0], "filename_prefix": "up_out"}},
}
r = urllib.request.Request(U + "/prompt", json.dumps({"prompt": g}).encode(), {"Content-Type": "application/json"})
i = json.load(urllib.request.urlopen(r))["prompt_id"]
while True:
    h = json.load(urllib.request.urlopen(U + "/history/" + i))
    if i in h: break
    time.sleep(1)
for o in h[i]["outputs"].values():
    for im in o.get("images", []):
        shutil.copy(os.path.join(C, "output", im["subfolder"], im["filename"]), dst); print("saved", dst)

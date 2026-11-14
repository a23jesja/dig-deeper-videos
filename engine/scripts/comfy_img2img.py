# paints over one of our own layouts with ComfyUI (SDXL base, licence CreativeML Open RAIL++-M: commercial use allowed)
# usage: python scripts/comfy_img2img.py <layout in ComfyUI/input> <prefix> <denoise> <seed,seed> "<prompt>" ["<negative>"]
import json, sys, time, urllib.request
src, prefix, den, seeds, prompt = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4].split(","), sys.argv[5]
neg = sys.argv[6] if len(sys.argv) > 6 else "people, person, figure, face, text, letters, watermark, signature, photo, photorealistic, 3d render, blurry"
U = "http://127.0.0.1:8188"
def post(g):
    r = urllib.request.Request(U + "/prompt", json.dumps({"prompt": g}).encode(), {"Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(r))["prompt_id"]
ids = []
for s in seeds:
    g = {
        "1": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": "sd_xl_base_1.0.safetensors"}},
        "2": {"class_type": "CLIPTextEncode", "inputs": {"text": prompt, "clip": ["1", 1]}},
        "3": {"class_type": "CLIPTextEncode", "inputs": {"text": neg, "clip": ["1", 1]}},
        "8": {"class_type": "LoadImage", "inputs": {"image": src}},
        "4": {"class_type": "VAEEncode", "inputs": {"pixels": ["8", 0], "vae": ["1", 2]}},
        "5": {"class_type": "KSampler", "inputs": {"seed": int(s), "steps": 30, "cfg": 6.5, "sampler_name": "dpmpp_2m", "scheduler": "karras", "denoise": den, "model": ["1", 0], "positive": ["2", 0], "negative": ["3", 0], "latent_image": ["4", 0]}},
        "6": {"class_type": "VAEDecode", "inputs": {"samples": ["5", 0], "vae": ["1", 2]}},
        "7": {"class_type": "SaveImage", "inputs": {"images": ["6", 0], "filename_prefix": f"{prefix}_{s}"}},
    }
    ids.append(post(g))
for i in ids:
    while True:
        hst = json.load(urllib.request.urlopen(U + "/history/" + i))
        if i in hst: break
        time.sleep(1)
    for o in hst[i]["outputs"].values():
        for im in o.get("images", []): print(im["subfolder"], im["filename"])

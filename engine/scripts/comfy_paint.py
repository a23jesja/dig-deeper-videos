# Paints a picture locally with ComfyUI and SDXL base 1.0 (CreativeML Open RAIL++-M), from a job file, and writes the exact settings
# beside each picture. Only for tests Jesper has asked for (the no-image-services rule has one exception: the painted cabin, 19 Nov).
#   usage: python scripts/comfy_paint.py <job.json> <out_dir>
#   job.json: {"name", "prompt", "negative", "seeds": [..], "width", "height", "steps", "cfg", "sampler", "scheduler"}
# ComfyUI must be running on port 8188 (cd ~/ComfyUI && venv/Scripts/python.exe main.py --port 8188).
import json, os, shutil, sys, time, urllib.request
job, out = json.load(open(sys.argv[1], encoding="utf-8")), sys.argv[2]
os.makedirs(out, exist_ok=True)
C, U = os.path.expanduser("~/ComfyUI"), "http://127.0.0.1:8188"
CKPT = "sd_xl_base_1.0.safetensors"
for seed in job["seeds"]:
    g = {
        "1": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": CKPT}},
        "2": {"class_type": "CLIPTextEncode", "inputs": {"text": job["prompt"], "clip": ["1", 1]}},
        "3": {"class_type": "CLIPTextEncode", "inputs": {"text": job["negative"], "clip": ["1", 1]}},
        "4": {"class_type": "EmptyLatentImage", "inputs": {"width": job["width"], "height": job["height"], "batch_size": 1}},
        "5": {"class_type": "KSampler", "inputs": {"model": ["1", 0], "positive": ["2", 0], "negative": ["3", 0], "latent_image": ["4", 0], "seed": seed,
              "steps": job["steps"], "cfg": job["cfg"], "sampler_name": job["sampler"], "scheduler": job["scheduler"], "denoise": 1.0}},
        "6": {"class_type": "VAEDecode", "inputs": {"samples": ["5", 0], "vae": ["1", 2]}},
        "7": {"class_type": "SaveImage", "inputs": {"images": ["6", 0], "filename_prefix": f"paint_{job['name']}_{seed}"}},
    }
    r = urllib.request.Request(U + "/prompt", json.dumps({"prompt": g}).encode(), {"Content-Type": "application/json"})
    pid = json.load(urllib.request.urlopen(r))["prompt_id"]
    while True:
        h = json.load(urllib.request.urlopen(U + "/history/" + pid))
        if pid in h: break
        time.sleep(1)
    for o in h[pid]["outputs"].values():
        for im in o.get("images", []):
            dst = os.path.join(out, f"{job['name']}-{seed}.png")
            shutil.copy(os.path.join(C, "output", im["subfolder"], im["filename"]), dst)
            rec = {k: job[k] for k in ("prompt", "negative", "width", "height", "steps", "cfg", "sampler", "scheduler")}
            rec.update({"seed": seed, "checkpoint": CKPT, "denoise": 1.0, "comfyui": "local, port 8188"})
            json.dump(rec, open(dst[:-4] + ".json", "w", encoding="utf-8"), indent=2, ensure_ascii=False)
            print("saved", dst)

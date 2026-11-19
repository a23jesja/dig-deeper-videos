# The voice test's other two voices (Jesper 19 Nov: "Rösten låter för syntetisk"; DAILY-RULES "Voice"), each run in its own environment
# under C:\Users\sweje\tts-test (they pin different transformers versions; both borrow ComfyUI's ROCm torch through a .pth file):
#   B  Qwen3-TTS VoiceDesign (Apache-2.0): a designed voice from a text description, no cloning
#   C  Chatterbox (MIT): its default voice (no cloning); every output carries Resemble AI's inaudible watermark
# usage: <venv python> voice/tts_others.py qwen|chatterbox <plan.json> <out_dir>
#   plan.json: {"sentences": [{"i": 0, "text": "..."}, ...], "takes": 3, "describe": "..."}; writes <out_dir>/<i>_<take>.wav (mono)
import json, os, sys, time
import numpy as np, soundfile as sf, torch
which, plan, out = sys.argv[1], json.load(open(sys.argv[2], encoding="utf-8")), sys.argv[3]
os.makedirs(out, exist_ok=True)
dev = "cuda" if torch.cuda.is_available() else "cpu"
t0 = time.time()
if which == "qwen":
    from qwen_tts import Qwen3TTSModel
    m = Qwen3TTSModel.from_pretrained(r"C:\Users\sweje\tts-test\models\Qwen3-TTS-12Hz-1.7B-VoiceDesign", device_map=f"{dev}:0" if dev == "cuda" else "cpu", dtype=torch.bfloat16 if dev == "cuda" else torch.float32)
    def say(text, seed):
        torch.manual_seed(seed); wavs, sr = m.generate_voice_design(text=text, instruct=plan["describe"], language="English", do_sample=True)
        return np.asarray(wavs[0], dtype=np.float32), sr
elif which == "chatterbox":
    from chatterbox.tts import ChatterboxTTS
    m = ChatterboxTTS.from_pretrained(device=dev)
    def say(text, seed):
        torch.manual_seed(seed); w = m.generate(text)
        return w.squeeze().detach().cpu().numpy().astype(np.float32), m.sr
else: raise SystemExit("qwen or chatterbox")
print(f"{which}: loaded on {dev} in {time.time() - t0:.1f} s", flush=True)
for s in plan["sentences"]:
    for k in range(plan.get("takes", 3)):
        t1 = time.time(); x, sr = say(s["text"], 1000 * (s["i"] + 1) + k); sf.write(os.path.join(out, f"{s['i']}_{k}.wav"), x, sr)
        print(f"{which} sentence {s['i']} take {k}: {len(x) / sr:.2f} s audio in {time.time() - t1:.1f} s", flush=True)

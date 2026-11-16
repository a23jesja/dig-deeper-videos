# Appends one line, "Next: Pompeii.", to the existing Titanic part 3 voice (same Kokoro voice and speed); the old lines keep their audio and timing.
import json, os, sys
import numpy as np, soundfile as sf
from math import gcd
from scipy.signal import resample_poly
from kokoro_onnx import Kokoro
here = os.path.dirname(os.path.abspath(__file__)); SR = 48000
k = Kokoro(os.path.join(here, "models", "kokoro-v1.0.onnx"), os.path.join(here, "models", "voices-v1.0.bin"))
v, sr = sf.read(os.path.join(here, "titanic-3", "voice.wav")); assert sr == SR
lines = json.load(open(os.path.join(here, "titanic-3", "lines.json"))); words = json.load(open(os.path.join(here, "titanic-3", "words.json")))
x, s = k.create("Next: Pompeii.", voice="bm_george", speed=1.2, lang="en-gb"); x = np.asarray(x, np.float32)
idx = np.where(np.abs(x) > 0.004)[0]; x = x[max(0, idx[0] - 1440 // 2): idx[-1] + 720]
if s != SR: g = gcd(s, SR); x = resample_poly(x, SR // g, s // g).astype(np.float32)
end = [l for l in lines if l["id"] == "end"][0]
ref = v[int(end["a"] * SR): int(end["b"] * SR)]
x = x * (np.sqrt(np.mean(ref ** 2)) / np.sqrt(np.mean(x ** 2)))
t0 = end["b"] + 0.55
need = int((t0 + len(x) / SR + 0.1) * SR)
out = np.concatenate([v, np.zeros(max(0, need - len(v)))]); out[int(t0 * SR): int(t0 * SR) + len(x)] += x
t1 = t0 + len(x) / SR; mid = t0 + 0.42 * (t1 - t0)
lines.append({"id": "next", "a": round(t0, 3), "b": round(t1, 3), "text": "Next: Pompeii."})
words += [{"w": "Next:", "a": round(t0, 3), "b": round(mid - 0.04, 3), "line": "next"}, {"w": "Pompeii.", "a": round(mid, 3), "b": round(t1, 3), "line": "next"}]
os.makedirs(os.path.join(here, "titanic-3v2"), exist_ok=True)
sf.write(os.path.join(here, "titanic-3v2", "voice.wav"), out, SR, subtype="PCM_16")
json.dump(lines, open(os.path.join(here, "titanic-3v2", "lines.json"), "w"), indent=1); json.dump(words, open(os.path.join(here, "titanic-3v2", "words.json"), "w"), indent=1)
print("next at %.2f-%.2f s, total %.2f s" % (t0, t1, len(out) / SR))

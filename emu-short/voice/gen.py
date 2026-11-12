import json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
k = Kokoro("models/kokoro-v1.0.onnx", "models/voices-v1.0.bin")
LINES = [l.strip() for l in open("script.txt") if l.strip()]
SR = 24000; out = []; marks = []; t = 0.0
for i, l in enumerate(LINES):
    gap = 0.0
    if "|" in l: l, g = l.rsplit("|", 1); gap = float(g)
    a, sr = k.create(l.strip(), voice="bm_george", speed=1.08, lang="en-gb")
    # trim leading/trailing silence
    e = np.abs(a); idx = np.where(e > 0.01)[0]; a = a[max(0, idx[0] - 600): idx[-1] + 1500]
    marks.append({"i": i, "text": l.strip(), "a": round(t, 3), "b": round(t + len(a) / SR, 3)})
    out.append(a); t += len(a) / SR
    p = np.zeros(int(gap * SR), dtype=a.dtype); out.append(p); t += gap
w = np.concatenate(out); sf.write("voice.wav", w, SR); json.dump(marks, open("lines.json", "w"), indent=1)
print(round(t, 2)); [print(m) for m in marks]

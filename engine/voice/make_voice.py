# Sir Digsworth's narration: Kokoro (bm_george, local, free) sentence by sentence, joined with short gaps,
# then word timings from faster-whisper aligned to the known script.
# usage: python voice/make_voice.py <script.json> <outdir>
#   script.json: {"voice": "bm_george", "speed": 1.08, "gap": 0.16, "lines": [{"id": "hook", "text": "...", "gap": 0.2}, ...]}
# writes <outdir>/voice.wav (48 kHz mono), words.json [{w, a, b, line}], lines.json [{id, a, b, text}]
import json, os, re, sys
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

here = os.path.dirname(os.path.abspath(__file__))
spec = json.load(open(sys.argv[1], encoding="utf-8"))
out = sys.argv[2]
os.makedirs(out, exist_ok=True)
k = Kokoro(os.path.join(here, "models", "kokoro-v1.0.onnx"), os.path.join(here, "models", "voices-v1.0.bin"))
SR = 48000

def trim(x, sr, thr=0.004, pad=0.03):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(pad * sr)); b = min(len(x), idx[-1] + int(pad * sr))
    return x[a:b]

def resample(x, sr, to):
    if sr == to:
        return x
    from scipy.signal import resample_poly
    from math import gcd
    g = gcd(sr, to)
    return resample_poly(x, to // g, sr // g).astype(np.float32)

parts, lines, t = [], [], 0.0
lead = spec.get("lead", 0.05)
parts.append(np.zeros(int(lead * SR), np.float32)); t += lead
for ln in spec["lines"]:
    x, sr = k.create(ln.get("say", ln["text"]), voice=spec.get("voice", "bm_george"), speed=ln.get("speed", spec.get("speed", 1.0)), lang="en-gb")
    x = resample(trim(np.asarray(x, np.float32), sr), sr, SR)
    lines.append({"id": ln["id"], "a": round(t, 3), "b": round(t + len(x) / SR, 3), "text": ln["text"]})
    parts.append(x); t += len(x) / SR
    gap = ln.get("gap", spec.get("gap", 0.15))
    parts.append(np.zeros(int(gap * SR), np.float32)); t += gap
voice = np.concatenate(parts)
voice = voice / max(1e-6, np.abs(voice).max()) * 0.89
sf.write(os.path.join(out, "voice.wav"), voice, SR, subtype="PCM_16")
json.dump(lines, open(os.path.join(out, "lines.json"), "w"), indent=1)
print("duration %.2f s" % (len(voice) / SR))

# ---- word timings: whisper per line (so words never drift across lines), aligned to the script words ----
from faster_whisper import WhisperModel
wm = WhisperModel(spec.get("whisper", "small.en"), device="cpu", compute_type="int8")
norm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower())
words = []
for ln in lines:
    a, b = int(ln["a"] * SR), int(ln["b"] * SR)
    seg16 = resample(voice[max(0, a - 2400):b + 2400], SR, 16000)
    off = max(0, a - 2400) / SR
    segs, _ = wm.transcribe(seg16, word_timestamps=True, language="en", initial_prompt=ln["text"], condition_on_previous_text=False, vad_filter=False)
    heard = [(norm(w.word), w.start + off, w.end + off) for s in segs for w in s.words if norm(w.word)]
    script = [w for w in ln["text"].replace("—", " ").replace("...", " ").split() if norm(w)]
    # monotone alignment: match script words to heard words where the text agrees, interpolate the rest
    n, m = len(script), len(heard)
    D = np.full((n + 1, m + 1), 1e9); D[0, 0] = 0
    for i in range(n + 1):
        for j in range(m + 1):
            if i < n and j < m:
                c = 0 if norm(script[i]) == heard[j][0] else 1
                D[i + 1, j + 1] = min(D[i + 1, j + 1], D[i, j] + c)
            if i < n: D[i + 1, j] = min(D[i + 1, j], D[i, j] + 1.2)
            if j < m: D[i, j + 1] = min(D[i, j + 1], D[i, j] + 1.2)
    i, j, pairs = n, m, {}
    while i > 0 or j > 0:
        if i > 0 and j > 0 and D[i, j] == D[i - 1, j - 1] + (0 if norm(script[i - 1]) == heard[j - 1][0] else 1):
            pairs[i - 1] = j - 1; i -= 1; j -= 1
        elif i > 0 and D[i, j] == D[i - 1, j] + 1.2: i -= 1
        else: j -= 1
    tm = [None] * n
    for i2, j2 in pairs.items(): tm[i2] = (heard[j2][1], heard[j2][2])
    # fill gaps by spreading evenly between known neighbours
    known = [(-1, (ln["a"], ln["a"]))] + [(i2, tm[i2]) for i2 in range(n) if tm[i2]] + [(n, (ln["b"], ln["b"]))]
    for (i0, t0), (i1, t1) in zip(known, known[1:]):
        gapn = i1 - i0 - 1
        for q in range(gapn):
            s0 = t0[1] + (t1[0] - t0[1]) * q / gapn; s1 = t0[1] + (t1[0] - t0[1]) * (q + 1) / gapn
            tm[i0 + 1 + q] = (s0, s1)
    bad = n - len(pairs)
    for w, (wa, wb) in zip(script, tm):
        words.append({"w": w, "a": round(max(ln["a"], wa), 3), "b": round(min(ln["b"] + 0.05, wb), 3), "line": ln["id"]})
    print(f"{ln['id']:>8} {ln['a']:6.2f}-{ln['b']:6.2f}  matched {n - bad}/{n}")
json.dump(words, open(os.path.join(out, "words.json"), "w"), indent=0)
print("words", len(words), "rate %.2f w/s" % (len(words) / (len(voice) / SR)))

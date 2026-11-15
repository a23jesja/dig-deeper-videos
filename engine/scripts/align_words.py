# Word timings without Whisper (for machines that cannot download the Whisper model): forced alignment of the
# known script against the voice with pocketsphinx (model bundled in the pip package), line by line.
# usage: python scripts/align_words.py voice/<name>.json voice/<name> [captions.json]
#   reads <outdir>/voice.wav and lines.json (written by voice/make_voice.py before its Whisper step)
#   writes <outdir>/words.json [{w, a, b, line}] and, if given, the captions file the 2D films read
import difflib, json, re, sys
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly
from pocketsphinx import Decoder

spec = json.load(open(sys.argv[1], encoding="utf-8"))
out = sys.argv[2]
lines = json.load(open(f"{out}/lines.json"))
x, sr = sf.read(f"{out}/voice.wav", dtype="float32")
if x.ndim > 1: x = x[:, 0]
norm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower())
EXTRA = {"lifeboat": "L AY F B OW T", "lifeboats": "L AY F B OW T S", "titanic": "T AY T AE N IH K", "iceberg": "AY S B ER G"}

dec = Decoder(samprate=16000, loglevel="FATAL")
words = []
for ln, sp in zip(lines, spec["lines"]):
    said = [norm(w) for w in sp.get("say", sp["text"]).replace("-", " ").replace("—", " ").split() if norm(w)]
    script = [w for w in sp["text"].replace("—", " ").split() if norm(w)]
    for w in set(said):
        if dec.lookup_word(w) is None:
            if w not in EXTRA: raise SystemExit(f"no pronunciation for '{w}': add it to EXTRA")
            dec.add_word(w, EXTRA[w], True)
    pad = int(0.15 * sr)
    a, b = max(0, int(ln["a"] * sr) - pad), min(len(x), int(ln["b"] * sr) + pad)
    seg = resample_poly(x[a:b], 16000, sr)
    pcm = (np.clip(seg, -1, 1) * 32767).astype(np.int16).tobytes()
    dec.set_align_text(" ".join(said))
    dec.start_utt(); dec.process_raw(pcm, full_utt=True); dec.end_utt()
    got = [(s.word, a / sr + s.start_frame / 100, a / sr + (s.end_frame + 1) / 100) for s in dec.seg() if not s.word.startswith("<") and s.word != "(NULL)"]
    got = [(re.sub(r"\(\d+\)$", "", w), t0, t1) for w, t0, t1 in got]
    if [g[0] for g in got] != said: raise SystemExit(f"{ln['id']}: aligned {[g[0] for g in got]} but said {said}")
    # map the spoken words onto the caption words (a number such as "1,178" covers several spoken words)
    sm = difflib.SequenceMatcher(a=[norm(w) for w in script], b=said, autojunk=False)
    for tag, i0, i1, j0, j1 in sm.get_opcodes():
        if tag == "equal":
            for i, j in zip(range(i0, i1), range(j0, j1)): words.append({"w": script[i], "a": got[j][1], "b": got[j][2], "line": ln["id"]})
        elif i1 > i0 and j1 > j0:
            t0, t1, n = got[j0][1], got[j1 - 1][2], i1 - i0
            for q in range(n): words.append({"w": script[i0 + q], "a": t0 + (t1 - t0) * q / n, "b": t0 + (t1 - t0) * (q + 1) / n, "line": ln["id"]})
        elif i1 > i0: raise SystemExit(f"{ln['id']}: caption words {script[i0:i1]} have no spoken words")
    print(f"{ln['id']:>8} {ln['a']:6.2f}-{ln['b']:6.2f}  " + " ".join(f"{w['w']}@{w['a']:.2f}" for w in words if w["line"] == ln["id"]))
# no caption shorter than 0.12 s: a too-short word takes time from the word before it (same line)
for i in range(1, len(words) - 1):
    w, pv, nx = words[i], words[i - 1], words[i + 1]
    if nx["line"] == w["line"] == pv["line"] and nx["a"] - w["a"] < 0.12:
        w["a"] = max(pv["a"] + 0.12, nx["a"] - 0.12); pv["b"] = min(pv["b"], w["a"])
for w in words: w["a"], w["b"] = round(max(0.0, w["a"]), 3), round(w["b"], 3)
json.dump(words, open(f"{out}/words.json", "w"), indent=0)
if len(sys.argv) > 3:
    caps = [{"text": " " + w["w"], "startMs": round(w["a"] * 1000), "endMs": round(w["b"] * 1000), "timestampMs": round((w["a"] + w["b"]) * 500), "confidence": None, "line": w["line"]} for w in words]
    json.dump(caps, open(sys.argv[3], "w"), indent=0)
print("words", len(words))

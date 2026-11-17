# usage: python voice/listen_check.py <film>    (film = folder name under voice/, spec voice/<film>.json with "risk": [...])
# Cuts every occurrence of each risk word/phrase (0.5 s before and after) out of voice/<film>/voice.wav using words.json,
# joins them with 0.3 s silence into voice/<film>/riskord.wav and writes voice/<film>/riskord.md (time in narration, place in the cut file).
import json, os, re, sys
import numpy as np, soundfile as sf
here = os.path.dirname(os.path.abspath(__file__))
film = sys.argv[1]
d = os.path.join(here, film)
spec = json.load(open(os.path.join(here, film + ".json"), encoding="utf-8"))
words = json.load(open(os.path.join(d, "words.json"), encoding="utf-8"))
x, sr = sf.read(os.path.join(d, "voice.wav"), dtype="float32")
if x.ndim > 1: x = x.mean(1)
norm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower())
nw = [norm(w["w"]) for w in words]
PAD, GAP = 0.5, 0.3
parts, rows, t = [], [], 0.0
for r in spec.get("risk", []):
    seq = [norm(p) for p in r.split() if norm(p)]
    hits = [i for i in range(len(nw) - len(seq) + 1) if nw[i:i + len(seq)] == seq]
    if not hits: rows.append((r, None, None, None, None)); continue
    for i in hits:
        a = max(0.0, words[i]["a"] - PAD); b = min(len(x) / sr, words[i + len(seq) - 1]["b"] + PAD)
        seg = x[int(a * sr):int(b * sr)]
        rows.append((r, words[i]["a"], words[i + len(seq) - 1]["b"], t, t + len(seg) / sr))
        parts += [seg, np.zeros(int(GAP * sr), np.float32)]; t += len(seg) / sr + GAP
if parts: sf.write(os.path.join(d, "riskord.wav"), np.concatenate(parts[:-1]), sr, subtype="PCM_16")
L = ["# Risk words: %s" % film, "", "Listen to `riskord.wav` (%.1f s). Each clip = the word with 0.5 s around it, 0.3 s silence between." % max(0, t - GAP), "",
     "| word | in narration (s) | in riskord.wav (s) |", "|---|---|---|"]
for r, a, b, c, e in rows:
    L.append("| %s | %s | %s |" % (r, "NOT FOUND in words.json" if a is None else "%.2f-%.2f" % (a, b), "-" if c is None else "%.2f-%.2f" % (c, e)))
open(os.path.join(d, "riskord.md"), "w", encoding="utf-8").write("\n".join(L) + "\n")
print("\n".join(L))

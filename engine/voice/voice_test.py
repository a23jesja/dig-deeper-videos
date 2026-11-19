# The voice test (Jesper, 19 Nov 2026: "Rösten låter för syntetisk"; DAILY-RULES "Voice"): three voices read the same script with the
# same pauses and the same finishing, and Jesper chooses by ear.
#   A  Kokoro bm_george (the voice the films have), speed 1.0
#   B  Qwen3-TTS VoiceDesign, a voice designed from a description of Sir Digsworth   (voice/tts_others.py, its own environment)
#   C  Chatterbox, its default voice                                                 (voice/tts_others.py, its own environment)
# usage: python voice/voice_test.py <script.json> <out_dir>      (the script as voice/make_voice.py takes it: {"lines": [{"id","text"}]})
# The same for all three:
#   - one sentence at a time; three takes of each (Kokoro gives the same take every time at the same settings: its three are one);
#   - the take is chosen without listening: faster-whisper (small.en, local) hears it, and the take whose words match the script best
#     wins, provided it has no clipping and no silence longer than 0.45 s inside it; a tie goes to the take nearest the median length;
#   - the pauses are set, not left to the voice: 0.15 s at every comma or colon (the gap between the two words whisper hears there is
#     replaced by 0.15 s of silence), 0.35 s after every sentence, 0.6 s before a punchline (PUNCH);
#   - the finishing: loudness to -16 LUFS (ffmpeg loudnorm, true peak -1.5 dB), then light compression (2:1 above -20 dB).
# Writes <out>/<A|B|C>.wav (48 kHz mono), <out>/picks.json (the takes chosen and why) and <out>/rosttest-A-kokoro_B-qwen_C-chatterbox.wav
import json, os, re, subprocess, sys
import numpy as np, soundfile as sf
from scipy.signal import resample_poly
from math import gcd
here = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, here)
spec, out = json.load(open(sys.argv[1], encoding="utf-8")), sys.argv[2]
SR, TAKES = 48000, 3
PUNCH = {"It was an offer.", "It worked."}
DESCRIBE = "A warm, dry, slightly smug English gentleman in his fifties, telling a strange true story to a friend. Clear, unhurried, natural pauses, a hint of amusement."
VENVS = {"B": (r"C:\Users\sweje\tts-test\qwen\Scripts\python.exe", "qwen"), "C": (r"C:\Users\sweje\tts-test\chatterbox\Scripts\python.exe", "chatterbox")}
os.makedirs(out, exist_ok=True)

sentences = []
for ln in spec["lines"]:
    for s in re.split(r"(?<=[.?!])\s+", ln["text"].strip()):
        if s: sentences.append({"i": len(sentences), "text": s, "line": ln["id"]})
json.dump({"sentences": sentences, "takes": TAKES, "describe": DESCRIBE}, open(os.path.join(out, "plan.json"), "w", encoding="utf-8"), indent=1)

def rs(x, sr):
    if sr == SR: return x.astype(np.float32)
    g = gcd(sr, SR); return resample_poly(x, SR // g, sr // g).astype(np.float32)
def trim(x, thr=0.004, pad=0.03):
    idx = np.where(np.abs(x) > thr)[0]
    return x if len(idx) == 0 else x[max(0, idx[0] - int(pad * SR)):min(len(x), idx[-1] + int(pad * SR))]

# ---- the takes ----
def kokoro(d):
    from kokoro_onnx import Kokoro
    import pronunciation
    k, locks = Kokoro(os.path.join(here, "models", "kokoro-v1.0.onnx"), os.path.join(here, "models", "voices-v1.0.bin")), pronunciation.load()
    for s in sentences:
        ph = pronunciation.phonemize_line(k, s["text"], "en-gb", locks)
        x, sr = k.create(s["text"] if ph is None else ph, voice="bm_george", speed=1.0, lang="en-gb", is_phonemes=ph is not None)
        for t in range(TAKES): sf.write(os.path.join(d, f"{s['i']}_{t}.wav"), np.asarray(x, np.float32), sr)
for v in ["A", "B", "C"]:
    d = os.path.join(out, "takes", v); os.makedirs(d, exist_ok=True)
    if all(os.path.exists(os.path.join(d, f"{s['i']}_{t}.wav")) for s in sentences for t in range(TAKES)): continue
    if v == "A": kokoro(d)
    else: py, which = VENVS[v]; subprocess.run([py, os.path.join(here, "tts_others.py"), which, os.path.join(out, "plan.json"), d], check=True)

# ---- choosing a take: whisper hears it ----
from faster_whisper import WhisperModel
wm = WhisperModel("small.en", device="cpu", compute_type="int8")
norm = lambda t: re.sub(r"[^a-z0-9' ]", " ", t.lower()).split()
def wer(ref, hyp):
    r, h = norm(ref), norm(hyp); D = [[i + j if i * j == 0 else 0 for j in range(len(h) + 1)] for i in range(len(r) + 1)]
    for i in range(1, len(r) + 1):
        for j in range(1, len(h) + 1): D[i][j] = min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (r[i - 1] != h[j - 1]))
    return D[len(r)][len(h)] / max(1, len(r))
def inner_silence(x):
    env = np.convolve(np.abs(x), np.ones(480) / 480, mode="same") > 0.006; best = run = 0
    for e in env[int(0.05 * SR):len(env) - int(0.05 * SR)]: run = 0 if e else run + 1; best = max(best, run)
    return best / SR
def hear(x):
    # (faster-whisper takes raw samples at 16 kHz: given 48 kHz it heard nonsense, and every take was chosen on it)
    segs, _ = wm.transcribe(resample_poly(x, 1, 3).astype(np.float32), language="en", word_timestamps=True, beam_size=5)
    words = [w for sg in segs for w in (sg.words or [])]
    return " ".join(w.word.strip() for w in words), words

picks, voices = {}, {}
for v in ["A", "B", "C"]:
    d, parts, rows = os.path.join(out, "takes", v), [], []
    for s in sentences:
        cand = []
        for t in range(TAKES):
            x, sr = sf.read(os.path.join(d, f"{s['i']}_{t}.wav"), dtype="float32"); x = trim(rs(x if x.ndim == 1 else x.mean(1), sr))
            text, words = hear(x); cand.append({"t": t, "x": x, "words": words, "heard": text, "wer": wer(s["text"], text), "clip": float(np.abs(x).max()) > 0.99, "gap": inner_silence(x), "len": len(x) / SR})
        med = float(np.median([c["len"] for c in cand]))
        ok = [c for c in cand if not c["clip"] and c["gap"] <= 0.45] or cand
        best = min(ok, key=lambda c: (round(c["wer"], 3), abs(c["len"] - med)))
        x = best["x"]
        # the comma pauses: the gap between the word before a comma (or colon) and the next becomes 0.15 s of silence
        ref, ws, cuts = s["text"].split(), best["words"], []
        for wi, rw in enumerate(ref[:-1]):
            if rw.endswith((",", ":")) and wi + 1 < len(ws): cuts.append((ws[wi].end, ws[wi + 1].start))
        if len(ws) == len(ref) and cuts:
            segs, last = [], 0
            for a, b in cuts: m = int(((a + b) / 2) * SR); segs += [x[last:int(a * SR)] if b - a > 0.02 else x[last:m], np.zeros(int(0.15 * SR), np.float32)]; last = int(b * SR) if b - a > 0.02 else m
            x = np.concatenate(segs + [x[last:]])
        rows.append({"sentence": s["text"], "take": best["t"], "heard": best["heard"], "wer": round(best["wer"], 3), "inner_silence_s": round(best["gap"], 2), "commas_set": len(cuts) if len(ws) == len(ref) else 0,
                     "others": [{"take": c["t"], "heard": c["heard"], "wer": round(c["wer"], 3), "clip": c["clip"], "inner_silence_s": round(c["gap"], 2)} for c in cand if c is not best]})
        nxt = sentences[s["i"] + 1]["text"] if s["i"] + 1 < len(sentences) else None
        parts += [x, np.zeros(int((0.6 if nxt in PUNCH else 0.35) * SR), np.float32)]
    raw = os.path.join(out, f"{v}-raw.wav"); sf.write(raw, np.concatenate(parts), SR, subtype="PCM_16")
    # the finishing, the same for all three
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", raw, "-af", "loudnorm=I=-16:TP=-1.5:LRA=7,acompressor=threshold=-20dB:ratio=2:attack=10:release=150:makeup=1,loudnorm=I=-16:TP=-1.5:LRA=7", "-ar", str(SR), "-ac", "1", os.path.join(out, f"{v}.wav")], check=True)
    picks[v] = rows; print(v, "done:", f"{sum(len(p) for p in parts) / SR:.1f} s", flush=True)
json.dump(picks, open(os.path.join(out, "picks.json"), "w", encoding="utf-8"), indent=1, ensure_ascii=False)
# the three one after the other, 1.5 s apart
gap = np.zeros(int(1.5 * SR), np.float32); all3 = []
for v in ["A", "B", "C"]: x, _ = sf.read(os.path.join(out, f"{v}.wav"), dtype="float32"); all3 += [x, gap]
sf.write(os.path.join(out, "rosttest-A-kokoro_B-qwen_C-chatterbox.wav"), np.concatenate(all3[:-1]), SR, subtype="PCM_16"); print("all three written")

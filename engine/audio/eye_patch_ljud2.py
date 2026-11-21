# Eye patch v1y, the second sound (Jesper, 21 Nov 2026 evening: "Ta bort alla ljud förutom berättar rösten och när han byter ögonpatchen till
# andra ögat", then "Musiken i bakgrunden kan få va kvar"). The same mix as audio/film_audio.py makes for v1y, with only the voice, the music
# and the whoosh where the patch moves to the other eye: every bed, the taps and any other cue left out.
#   python audio/eye_patch_ljud2.py <out.wav> <report.json>     (run from engine/)
# The voice, the music and the whoosh keep their v1y levels: the effects bus gain and the whole mix's gain are the ones v1y's full mix got
# (worked out here from the full mix, which this file also rebuilds and compares with public/craft/eye-patch.wav). A 3 ms fade in and out,
# so the loop has no click.
import json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, "lib"))
from dsp import SR, ns, dbg, place, pan, st, integrated, true_peak, read_wav, write_wav  # noqa: E402
import craft_sfx, film_music  # noqa: E402
from film_audio import film_info, music_gain_curve, hit_thump, VOICE_LUFS, TARGET_LUFS, MUSIC_UNDER_VOICE_DB, EFFECTS_UNDER_VOICE_DB  # noqa: E402

spec = film_info("eye-patch"); fps = spec["fps"]; total = spec["frames"] / fps; n = ns(total)
def fit(b): return b[:, :n] if b.shape[1] >= n else np.pad(b, ((0, 0), (0, n - b.shape[1])))
# the full v1y effects bus, as film_audio.py makes it, for its gain
r = craft_sfx.rng(spec.get("seed", 7)); full = craft_sfx.effects(spec)
for h in spec.get("hits", []): place(full, pan(hit_thump(r, h.get("amp", 1.0)), 0.0), h["f"] / fps, dbg(-4))
full = fit(full); bus_gain = dbg((VOICE_LUFS - EFFECTS_UNDER_VOICE_DB) - integrated(full))
# the whoosh alone: the same cue, the same seed order is not needed for a whoosh made on its own, so it is made from the full spec's cue list
# with everything else taken out (beds none, hits none); its level is the full bus's gain
keep = [c for c in spec["cues"] if c["k"] == "whoosh"]
only = dict(spec, cues=keep, beds=[], hits=[]); wh = fit(craft_sfx.effects(only)) * bus_gain
# the voice and the music exactly as film_audio.py
x, sr = read_wav(os.path.join(ROOT, spec["voice"]["file"]))
if sr != SR:
    from scipy import signal
    x = signal.resample_poly(x, SR, sr, axis=-1)
x = st(x[0]); x = x * dbg(VOICE_LUFS - integrated(x)); voice = np.zeros((2, n)); place(voice, x, spec["voice"].get("frame", 0) / fps)
lines = json.load(open(os.path.join(ROOT, spec["lines"]), encoding="utf-8"))
m = film_music.music(spec["music"], total, lines)[:, :n]; mus = np.zeros((2, n)); mus[:, :m.shape[1]] = m
gcurve, mask = music_gain_curve(n, lines, total); mus = mus * gcurve; mus = mus * dbg((VOICE_LUFS - MUSIC_UNDER_VOICE_DB) - integrated(mus * mask))
# v1y's whole-mix gain, found as film_audio.py finds it, on the full mix
CEIL = 0.8; raw_full = voice + mus + full * bus_gain; gain = 1.0
for _ in range(14):
    f = np.tanh(raw_full * gain / CEIL) * CEIL; err = TARGET_LUFS - integrated(f)
    if abs(err) < 0.02: break
    gain *= dbg(err)
tp = true_peak(f); trim = dbg(-1.0 - tp - 0.01) if tp > -1.0 else 1.0; v1y_rebuilt = f * trim
old, _ = read_wav(os.path.join(ROOT, "public", "craft", "eye-patch.wav")); L = min(old.shape[1], n)
same = float(np.max(np.abs(old[:, :L] - v1y_rebuilt[:, :L])))
# the new mix: the same gain, the same soft ceiling
G = gain * trim; stems = {"voice": voice * G, "music": mus * G, "whoosh": wh * G}
new = np.tanh((voice + mus + wh) * gain / CEIL) * CEIL * trim
fd = ns(0.003); ramp = np.linspace(0, 1, fd); new[:, :fd] *= ramp; new[:, -fd:] *= ramp[::-1]
write_wav(sys.argv[1], new)
rest = new - sum(stems.values())       # what is in the mix beyond the three stems (only the soft ceiling's rounding)
def db(a): v = float(np.sqrt(np.mean(a ** 2))) if a.size else 0; return round(20 * np.log10(v), 1) if v > 0 else None
def pk(a): v = float(np.max(np.abs(a))) if a.size else 0; return round(20 * np.log10(v), 1) if v > 0 else None
# sections: each line of the voice, the whoosh, and the gaps between (music only)
marks = sorted([(l["a"], l["b"], "voice: " + l["text"]) for l in lines] + [(c["f"] / fps, c["f"] / fps + 0.45, "whoosh") for c in keep])
secs, t = [], 0.0
for a, b, what in marks:
    if a > t + 0.01: secs.append((t, a, "gap"))
    secs.append((a, b, what)); t = max(t, b)
if t < total - 0.01: secs.append((t, total, "gap"))
rows = []
for a, b, what in secs:
    s = slice(ns(a), ns(b)); rows.append({"from": round(a, 2), "to": round(b, 2), "what": what, "mix_rms_dbfs": db(new[:, s]), "voice_rms": db(stems["voice"][:, s]), "music_rms": db(stems["music"][:, s]), "whoosh_rms": db(stems["whoosh"][:, s]), "rest_peak_dbfs": pk(rest[:, s])})
rep = {"rebuilt_v1y_vs_public_eye_patch_wav_max_diff": same, "whoosh_cues": keep, "cues_left_out": [c for c in spec["cues"] if c["k"] != "whoosh"], "beds_left_out": len(spec["beds"]), "bed_kinds_left_out": sorted({b["k"] for b in spec["beds"]}),
       "hits_left_out": len(spec.get("hits", [])), "integrated_lufs": round(float(integrated(new)), 2), "true_peak_db": round(float(true_peak(new)), 2), "v1y_integrated_lufs": round(float(integrated(v1y_rebuilt)), 2),
       "voice_lufs": round(float(integrated(stems["voice"])), 1), "music_lufs": round(float(integrated(stems["music"])), 1), "whoosh_peak_dbfs": pk(stems["whoosh"]),
       "music_under_voice_db_while_speaking": round(float(integrated(stems["voice"]) - integrated(stems["music"] * mask)), 1), "rest_peak_dbfs_whole": pk(rest), "sections": rows}
json.dump(rep, open(sys.argv[2], "w", encoding="utf-8"), indent=1, ensure_ascii=False)
print({k: v for k, v in rep.items() if k != "sections"})

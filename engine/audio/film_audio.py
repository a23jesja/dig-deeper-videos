# The sound of a craft-kit Short, mixed from its own film file:  python audio/film_audio.py <film>   (run from engine/)
#   - node scripts/film_info.mjs <film> audio   gives the cues (each on its frame), the beds, the impacts (hits), the voice, the lines, the music name
#   - craft_sfx.effects()  makes the effects and beds on one bus; a low thump is added for every hit (a camera-shake impact)
#   - film_music.music()   makes the film's music; it sits about 18 dB under the voice while the voice speaks and comes up about 5 dB
#                          in pauses longer than 0.4 s (read from the lines file)
#   - the voice is set to -16 LUFS first; then the whole is brought to -14 LUFS integrated with a true peak at or under -1 dB
#   writes public/craft/<film>.wav and out/craft/<film>-audio.json (integrated LUFS, true peak, the loudness of voice, music and effects
#   as they are in the final mix, the number of cues and beds). A cue that names a sound that does not exist stops the run with a message.
import json, os, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, "lib"))
from dsp import SR, ns, tt, dbg, lp, phase, place, pan, st, integrated, momentary_max, true_peak, read_wav, write_wav, fades  # noqa: E402
import craft_sfx  # noqa: E402
import film_music  # noqa: E402

VOICE_LUFS, TARGET_LUFS, MUSIC_UNDER_VOICE_DB, MUSIC_PAUSE_LIFT_DB, PAUSE_MIN_S, EFFECTS_UNDER_VOICE_DB = -16.0, -14.0, 18.0, 5.0, 0.4, 11.0


def film_info(film):
    p = subprocess.run(["node", "scripts/film_info.mjs", film, "audio"], cwd=ROOT, capture_output=True, text=True, encoding="utf-8", shell=(os.name == "nt"))
    if p.returncode != 0: raise SystemExit(f"FILM INFO FAILED for {film}:\n{p.stderr or p.stdout}")
    if p.stderr.strip(): print(p.stderr.strip())
    return json.loads(p.stdout)


def hit_thump(r, amp=1.0):
    """the low thump under a camera-shake impact: a deep falling sine and a rumble of low noise"""
    t = tt(0.6); nz = r.standard_normal(len(t))
    return fades((np.sin(phase(48 * (1 + 1.0 * np.exp(-t / 0.04)))) * np.exp(-t / 0.16) + 0.5 * lp(nz, 160) * np.exp(-t / 0.08)) * amp, 0.001, 0.1)


def music_gain_curve(n, lines, total_s):
    """1 while the voice speaks (and in pauses of 0.4 s or less), +5 dB in the longer pauses (before the first line and after the last too);
    smoothed over 0.25 s so the music swells rather than jumps. Returns (gain, speech mask)"""
    lines = sorted(lines, key=lambda l: l["a"]); g = np.ones(n); mask = np.zeros(n); edges = [0.0] + [x for l in lines for x in (l["a"], l["b"])] + [total_s]
    for a, b in zip(edges[0::2], edges[1::2]):                 # the pauses: before line 1, between lines, after the last
        if b - a > PAUSE_MIN_S: g[ns(a):ns(b)] = dbg(MUSIC_PAUSE_LIFT_DB)
    for l in lines: mask[ns(l["a"]):ns(l["b"])] = 1.0
    k = ns(0.25); g = np.convolve(np.pad(g, (k, k), mode="edge"), np.ones(k) / k, mode="same")[k:-k]
    return g, mask


def main():
    film = sys.argv[1]; spec = film_info(film); fps = spec["fps"]; total = spec["frames"] / fps
    craft_sfx.check_spec(spec)                                   # stops with a message if a cue or bed names a sound that does not exist
    r = craft_sfx.rng(spec.get("seed", 7))
    bus = craft_sfx.effects(spec); N = bus.shape[1]
    for h in spec.get("hits", []):
        place(bus, pan(hit_thump(r, h.get("amp", 1.0)), 0.0), h["f"] / fps, dbg(-4))
    n = ns(total); bus = bus[:, :n] if bus.shape[1] >= n else np.pad(bus, ((0, 0), (0, n - bus.shape[1])))

    # the voice at -16 LUFS
    x, sr = read_wav(os.path.join(ROOT, spec["voice"]["file"]))
    if sr != SR:
        from scipy import signal
        x = signal.resample_poly(x, SR, sr, axis=-1)
    x = st(x[0]); x = x * dbg(VOICE_LUFS - integrated(x)); voice = np.zeros((2, n)); place(voice, x, spec["voice"].get("frame", 0) / fps)

    # the music, under the voice
    lines = json.load(open(os.path.join(ROOT, spec["lines"]), encoding="utf-8")) if spec.get("lines") else []
    mus = np.zeros((2, n)); mask = np.zeros(n)
    if spec.get("music"):
        m = film_music.music(spec["music"], total, lines)[:, :n]; mus[:, :m.shape[1]] = m
        gcurve, mask = music_gain_curve(n, lines, total); mus = mus * gcurve
        speech_only = mus * mask                                     # what the music is while the voice speaks
        mus = mus * dbg((VOICE_LUFS - MUSIC_UNDER_VOICE_DB) - integrated(speech_only if np.any(mask) else mus))

    # the effects: their integrated level sits EFFECTS_UNDER_VOICE_DB under the voice (the loud single hits stand out above that)
    bus = bus * dbg((VOICE_LUFS - EFFECTS_UNDER_VOICE_DB) - integrated(bus))

    # the whole to -14 LUFS, with a soft ceiling for the highest peaks and a true peak at or under -1 dB
    stems = {"voice": voice, "music": mus, "effects": bus}; raw = sum(stems.values()); gain = 1.0; CEIL = 0.8
    for _ in range(14):                                          # the soft ceiling takes some loudness off, so the gain is found with it in the loop
        final = np.tanh(raw * gain / CEIL) * CEIL; err = TARGET_LUFS - integrated(final)
        if abs(err) < 0.02: break
        gain *= dbg(err)
    tp = true_peak(final); trim = 1.0
    if tp > -1.0: trim = dbg(-1.0 - tp - 0.01); final = final * trim
    out = os.path.join(ROOT, "public", "craft", f"{film}.wav"); os.makedirs(os.path.dirname(out), exist_ok=True); write_wav(out, final)
    # the stems as they stand in the final mix (the same gain; the soft ceiling is not applied to each one)
    G = gain * trim; lv = {k: round(float(integrated(v * G)), 1) for k, v in stems.items() if np.any(v)}
    rep = {"film": film, "file": os.path.relpath(out, ROOT).replace("\\", "/"), "seconds": round(total, 2), "integrated_lufs": round(float(integrated(final)), 2), "true_peak_db": round(float(true_peak(final)), 2),
           "voice_lufs": lv.get("voice"), "music_lufs": lv.get("music"), "effects_lufs": lv.get("effects"),
           "music_under_voice_db_while_speaking": (round(float(integrated(voice * G) - integrated(mus * mask * G)), 1) if np.any(mus) else None),
           "loudest_400ms_lufs": {k: round(float(momentary_max(v * G)), 1) for k, v in stems.items() if np.any(v)},
           "cues": len(spec["cues"]), "beds": len(spec["beds"]), "hits": len(spec.get("hits", [])), "music": spec.get("music")}
    os.makedirs(os.path.join(ROOT, "out", "craft"), exist_ok=True); json.dump(rep, open(os.path.join(ROOT, "out", "craft", f"{film}-audio.json"), "w", encoding="utf-8"), indent=1)
    print(json.dumps(rep, indent=1))


if __name__ == "__main__":
    if len(sys.argv) < 2: raise SystemExit("usage: python audio/film_audio.py <film>   (pirate-plank, rome-pee)")
    main()

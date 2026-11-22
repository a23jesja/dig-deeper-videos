# The sound of Alcatraz 1962: George's twelve lines on their times, every shot's own sounds on its frames (out/craft/alcatraz/info.json, from
# scripts/alcatraz_info.mjs, the same timeline as the picture), beds per scene, and an alarm for the siren. No footsteps, no creaks, nothing
# that can sound like a fart (DAILY-RULES; Jesper 19 and 21 Nov). The voice at -16 LUFS, the whole at -14 LUFS, true peak under -1 dB.
#   python audio/alcatraz_audio.py [A|B|C]      (from engine/; B and C: the hook lab's openings, 5 s)
import json, os, subprocess, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, "lib"))
import craft_sfx as fx  # noqa: E402
from dsp import SR, ns, dbg, rng, place, pan, integrated, true_peak, write_wav, st  # noqa: E402

OPEN = sys.argv[1] if len(sys.argv) > 1 else "A"
INFO = json.load(open("out/craft/alcatraz/info.json"))
LINES = json.load(open("voice/alcatraz/lines.json")); SPANS = json.load(open("voice/alcatraz/spans.json"))
# where each line starts (s): after the line before, a pause that leaves room for the pictures between (0.3 s at least, DAILY-RULES Voice)
STARTS = [0.0, 2.01, 3.57, 5.99, 8.50, 12.06, 15.13, 18.13, 22.65, 25.00, 27.21, 29.22]
DUR = 5.0 if OPEN != "A" else INFO["film"]
FPS = 30

def take(i):
    p = json.load(open(f"voice/alcatraz/s{i:02d}/pick.json")); f = f"voice/alcatraz/s{i:02d}/take{p['take']}.mp3"
    a = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-nostdin", "-i", f, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout, np.float32).astype(np.float64)
    sp = SPANS[i - 1]; a0 = max(0, int((sp["on"] - 0.004) * SR)); a1 = min(len(a), int((sp["off"] + 0.12) * SR)); a = a[a0:a1]
    f_in = min(len(a), int(0.01 * SR)); a[:f_in] *= np.linspace(0, 1, f_in); f_out = min(len(a), int(0.06 * SR)); a[-f_out:] *= np.linspace(1, 0, f_out)
    return a

def siren(dur, r):
    """an alarm: two clean tones taking turns (640 and 860 Hz, 0.32 s each), soft edges, a little vibrato; high and steady, nothing low or
    buzzing"""
    n = ns(dur); t = np.arange(n) / SR; sw = (np.floor(t / 0.32) % 2); f = np.where(sw > 0, 860.0, 640.0) * (1 + 0.004 * np.sin(2 * np.pi * 5.5 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR; x = 0.6 * np.sin(ph) + 0.2 * np.sin(2 * ph)
    edge = np.minimum(1, np.minimum(t / 0.04, (dur - t) / 0.08)); return x * np.clip(edge, 0, 1) * 0.5

def main():
    N = ns(DUR + 0.3); voice = np.zeros(N)
    for i, s0 in enumerate(STARTS, 1):
        if s0 >= DUR: break
        a = take(i); i0 = int(s0 * SR); voice[i0:i0 + len(a)] += a[: max(0, N - i0)]
    voice = voice * dbg(-16 - integrated(st(voice)))
    cuts = INFO["openings"][OPEN]
    # the shots' own sounds on their frames
    cues, beds = [], []
    for k, c in enumerate(cuts):
        sid, t0 = c[0], c[1]; off = c[2] if len(c) > 2 else 0.0; t1 = cuts[k + 1][1] if k + 1 < len(cuts) else INFO["film"]
        for s in INFO["shots"][sid]["sounds"]:
            t = t0 + s["t"] - off
            if t0 - 1e-6 <= t < min(t1, DUR): cues.append({"k": s["k"], "f": int(round(t * FPS)), "g": s.get("g", 1.0), "p": s.get("p", 0.0), **({"dur": s["dur"]} if "dur" in s else {}), **({"big": s["big"]} if "big" in s else {})})
        # beds by scene: the roof and the wall in the wind, the water at night, the bay in the morning
        f0, f1 = int(t0 * FPS), int(min(t1, DUR) * FPS)
        if f1 <= f0: continue
        if sid in ("a08", "a09", "a10"): beds.append({"k": "wind", "f0": f0, "f1": f1, "g": 0.7})
        if sid in ("a11", "a12"): beds.append({"k": "lap", "f0": f0, "f1": f1, "g": 0.9})
        if sid == "a16": beds += [{"k": "surf", "f0": f0, "f1": f1, "g": 0.6}, {"k": "birds", "f0": f0, "f1": f1, "g": 0.5}]
    # the hit in the first frame of every opening (the hook rule: voice and a sound hit on frame 1): the torch's click and a dull knock
    cues = [c for c in cues if not (c["f"] == 0 and c["k"] == "tap")] + [{"k": "tap", "f": 0, "g": 1.6, "p": 0.0}, {"k": "thunk", "f": 0, "g": 0.9, "p": 0.0}]
    spec = {"fps": FPS, "frames": int(DUR * FPS), "seed": 11, "cues": cues, "beds": beds}
    bus = fx.effects(spec)[:, :N] if cues or beds else np.zeros((2, N))
    if bus.shape[1] < N: bus = np.pad(bus, ((0, 0), (0, N - bus.shape[1])))
    r = rng(5)
    # a low, quiet room tone under the night scenes (a big stone building), so the silences are never dead
    tone = fx.rumble(DUR + 0.3, r)[:N] if hasattr(fx, "rumble") else np.zeros(N)
    tone = tone if tone.ndim == 2 else st(tone)
    # the siren while the guard is frightened (shot 14)
    for k, c in enumerate(cuts):
        if c[0] == "a14":
            t1 = cuts[k + 1][1] if k + 1 < len(cuts) else INFO["film"]
            if c[1] < DUR: place(bus, pan(siren(min(t1, DUR) - c[1], r), 0.25), c[1], dbg(-6))
    mix = bus * dbg(-14) + tone[:, :N] * dbg(-36) + st(voice)
    for _ in range(3):
        cur = integrated(mix)
        if np.isfinite(cur): mix = mix * dbg(min(-14 - cur, 12))
        mix = np.tanh(mix / 0.82) * 0.82
    tp = true_peak(mix)
    if tp > -1: mix = mix * dbg(-1 - tp)
    mix = mix[:, : ns(DUR)]
    out = "public/craft/alcatraz.wav" if OPEN == "A" else f"public/craft/alcatraz-hook-{OPEN.lower()}.wav"
    write_wav(out, mix)
    json.dump({"opening": OPEN, "lines": [{"i": i, "text": LINES[i - 1].strip(), "start": s} for i, s in enumerate(STARTS, 1) if s < DUR], "cues": cues, "beds": beds,
               "siren": [c[1] for c in cuts if c[0] == "a14" and c[1] < DUR], "lufs": round(float(integrated(mix)), 1), "true_peak": round(float(true_peak(mix)), 1)},
              open(f"out/craft/alcatraz/sounds-{OPEN}.json", "w"), indent=1)
    print(out, "LUFS", round(float(integrated(mix)), 1), "peak", round(float(true_peak(mix)), 1), "cues", len(cues), "beds", len(beds))

if __name__ == "__main__":
    main()

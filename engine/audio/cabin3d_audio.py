# The sound of 3D step 1, the captain's cabin (7.0 s): the captain's line (George, c01) at 0.7 s, the boy's (Daniel, c02) at 2.6 s, never on
# top of each other; the papers he rummages and sweeps off the table (0.0-1.25 s), the sea outside the stern windows under everything, and a clean two-tone
# sting on the cut to his face as it goes red (5.95 s).
# No footsteps, no creaks, nothing low or buzzing (nothing that can sound like a fart). Voices at -16 LUFS each, the whole at -14 LUFS, true
# peak under -1 dB. Each take is placed from its own start, so its word times (pick.json) are the mouth's times in cabin.ts.
#   python audio/cabin3d_audio.py      (from engine/)
import json, os, subprocess, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, "lib"))
import craft_sfx as fx  # noqa: E402
from dsp import SR, ns, dbg, rng, place, pan, integrated, true_peak, write_wav, st  # noqa: E402

SPEC = json.load(open("src/craft/cabin3d/shots.json")); FPS = SPEC["fps"]; DUR = SPEC["shots"][-1]["t1"]
VOICES = [{"who": "george", "take": "c01", "t": 0.7}, {"who": "daniel", "take": "c02", "t": 2.6}]

def decode(f):
    return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-nostdin", "-i", f, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout, np.float32).astype(np.float64)
def take(name):
    p = json.load(open(f"voice/cabin/{name}/pick.json")); a = decode(f"voice/cabin/{name}/take{p['take']}.mp3")
    a = a[: min(len(a), int((p["words"][-1]["b"] + 0.22) * SR))].copy(); fo = min(len(a), int(0.08 * SR)); a[-fo:] *= np.linspace(1, 0, fo)
    return a, p["line"]
def sting(dur=0.5):
    """the embarrassment: two clean high tones one after the other (1320 then 1760 Hz), soft edges; nothing low or buzzing"""
    n = ns(dur); t = np.arange(n) / SR; f = np.where(t < dur * 0.45, 1320.0, 1760.0); ph = 2 * np.pi * np.cumsum(f) / SR
    env = np.minimum(1, t / 0.01) * np.exp(-t * 4.5); return 0.5 * np.sin(ph) * env

def main():
    N = ns(DUR + 0.3); vg, vd = np.zeros(N), np.zeros(N); placed = []
    for v in VOICES:
        a, line = take(v["take"]); i0 = int(v["t"] * SR); (vg if v["who"] == "george" else vd)[i0:i0 + len(a)] += a[: max(0, N - i0)]
        placed.append({"who": v["who"], "text": line, "start": v["t"], "end": round(v["t"] + len(a) / SR, 3)})
    for a, b in zip(placed, placed[1:]):
        if b["start"] < a["end"] + 0.1: raise SystemExit(f"voices overlap or touch: {a} / {b}")
    voice = vg * dbg(-16 - integrated(st(vg))) + vd * dbg(-16 - integrated(st(vd)))
    C = {s["id"]: s for s in SPEC["shots"]}["D"]      # (the close-up of his red face)
    cues = [{"k": "paper", "f": 0, "g": 1.2, "p": -0.3}, {"k": "paper", "f": 7, "g": 0.9, "p": -0.35}, {"k": "paper", "f": 14, "g": 1.0, "p": -0.3},      # rummaging (frame 1: the hook's sound)
            {"k": "flap", "f": 15, "g": 0.7, "p": -0.4}, {"k": "flap", "f": 19, "g": 0.6, "p": -0.5}, {"k": "flap", "f": 22, "g": 0.6, "p": -0.45},      # the three papers fly off
            {"k": "paper", "f": 34, "g": 0.6, "p": -0.5}, {"k": "paper", "f": 38, "g": 0.5, "p": -0.55}]      # and land on the floor
    beds = [{"k": "lap", "f0": 0, "f1": int(DUR * FPS), "g": 0.55}]
    spec = {"fps": FPS, "frames": int(DUR * FPS), "seed": 23, "cues": cues, "beds": beds}
    bus = fx.effects(spec)[:, :N]
    if bus.shape[1] < N: bus = np.pad(bus, ((0, 0), (0, N - bus.shape[1])))
    t_sting = C["t0"] + 0.05; place(bus, pan(sting(), 0.0), t_sting, dbg(-8))
    mix = bus * dbg(-14) + st(voice)
    for _ in range(3):
        cur = integrated(mix)
        if np.isfinite(cur): mix = mix * dbg(min(-14 - cur, 12))
        mix = np.tanh(mix / 0.82) * 0.82
    tp = true_peak(mix)
    if tp > -1: mix = mix * dbg(-1 - tp)
    mix = mix[:, : ns(DUR)]
    write_wav("public/craft/cabin3d.wav", mix); os.makedirs("out/cab3d", exist_ok=True)
    json.dump({"voices": placed, "cues": cues, "beds": beds, "sting": t_sting, "lufs": round(float(integrated(mix)), 1), "true_peak": round(float(true_peak(mix)), 1)}, open("out/cab3d/sounds.json", "w"), indent=1)
    print("LUFS", round(float(integrated(mix)), 1), "peak", round(float(true_peak(mix)), 1)); [print(p) for p in placed]

if __name__ == "__main__":
    main()

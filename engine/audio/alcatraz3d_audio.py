# The sound of Alcatraz in the new style (the style test: shots n01-n05, 9.3 s): George's lines and the guard's line (Daniel, [OWN]) on the
# times in src/craft/alcatraz3d/shots.json ("voice"), never on top of each other; the torch's click and a dull knock in frame 1 (the hook
# rule), the click when the guard puts his torch out, a far drip, a clean two-tone sting when the inmate freezes, a low room tone.
# No footsteps, no creaks, nothing that can sound like a fart. Voices at -16 LUFS each, the whole at -14 LUFS, true peak under -1 dB.
#   python audio/alcatraz3d_audio.py      (from engine/)
import json, os, subprocess, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, "lib"))
import craft_sfx as fx  # noqa: E402
from dsp import SR, ns, dbg, rng, place, pan, integrated, true_peak, write_wav, st  # noqa: E402

SPEC = json.load(open("src/craft/alcatraz3d/shots.json")); FPS = SPEC["fps"]; DUR = SPEC["shots"][-1]["t1"]
SPANS = json.load(open("voice/alcatraz/spans.json")); LINES = json.load(open("voice/alcatraz/lines.json"))

def decode(f):
    return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-nostdin", "-i", f, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout, np.float32).astype(np.float64)
def trim(a, on, off):
    a0 = max(0, int((on - 0.004) * SR)); a1 = min(len(a), int((off + 0.12) * SR)); a = a[a0:a1].copy()
    f_in = min(len(a), int(0.01 * SR)); a[:f_in] *= np.linspace(0, 1, f_in); f_out = min(len(a), int(0.06 * SR)); a[-f_out:] *= np.linspace(1, 0, f_out); return a
def george(i):
    p = json.load(open(f"voice/alcatraz/s{i:02d}/pick.json")); sp = SPANS[i - 1]
    return trim(decode(f"voice/alcatraz/s{i:02d}/take{p['take']}.mp3"), sp["on"], sp["off"])
def daniel(take):
    p = json.load(open(f"voice/alcatraz3d/{take}/pick.json")); w = p["words"]
    return trim(decode(f"voice/alcatraz3d/{take}/take{p['take']}.mp3"), w[0]["a"], w[-1]["b"] + 0.08)
def sting(dur=0.5):
    """the inmate's fright: two clean high tones one after the other (1320 then 1760 Hz), soft edges; nothing low or buzzing"""
    n = ns(dur); t = np.arange(n) / SR; f = np.where(t < dur * 0.45, 1320.0, 1760.0); ph = 2 * np.pi * np.cumsum(f) / SR
    env = np.minimum(1, t / 0.01) * np.exp(-t * 4.5); return 0.5 * np.sin(ph) * env

def main():
    N = ns(DUR + 0.3); vg, vd = np.zeros(N), np.zeros(N); placed = []
    for v in SPEC["voice"]:
        a = george(v["line"]) if v["who"] == "george" else daniel(v["take"]); i0 = int(v["t"] * SR)
        (vg if v["who"] == "george" else vd)[i0:i0 + len(a)] += a[: max(0, N - i0)]
        placed.append({"who": v["who"], "text": LINES[v["line"] - 1].strip() if v["who"] == "george" else v["text"], "start": v["t"], "end": round(v["t"] + len(a) / SR, 3)})
    placed.sort(key=lambda p: p["start"])
    for a, b in zip(placed, placed[1:]):
        if b["start"] < a["end"] + 0.25: raise SystemExit(f"voices overlap or touch: {a} / {b}")
    voice = vg * dbg(-16 - integrated(st(vg))) + vd * dbg(-16 - integrated(st(vd)))
    S = {s["id"]: s for s in SPEC["shots"]}
    cues = [{"k": "tap", "f": 0, "g": 1.6, "p": 0.0}, {"k": "thunk", "f": 0, "g": 0.9, "p": 0.0},      # frame 1: the torch's click and a knock
            {"k": "tap", "f": int(S["n03"]["t0"] * FPS), "g": 0.9, "p": -0.2},                          # the guard puts his torch out
            {"k": "drip", "f": int(5.4 * FPS), "g": 0.35, "p": 0.4}, {"k": "drip", "f": int(8.6 * FPS), "g": 0.3, "p": -0.3}]
    spec = {"fps": FPS, "frames": int(DUR * FPS), "seed": 11, "cues": cues, "beds": []}
    bus = fx.effects(spec)[:, :N]
    if bus.shape[1] < N: bus = np.pad(bus, ((0, 0), (0, N - bus.shape[1])))
    r = rng(5); tone = fx.rumble(DUR + 0.3, r)[:N] if hasattr(fx, "rumble") else np.zeros(N); tone = tone if tone.ndim == 2 else st(tone)
    t_sting = S["n05"]["t0"] + 0.95; place(bus, pan(sting(), 0.1), t_sting, dbg(-8))
    mix = bus * dbg(-14) + tone[:, :N] * dbg(-36) + st(voice)
    for _ in range(3):
        cur = integrated(mix)
        if np.isfinite(cur): mix = mix * dbg(min(-14 - cur, 12))
        mix = np.tanh(mix / 0.82) * 0.82
    tp = true_peak(mix)
    if tp > -1: mix = mix * dbg(-1 - tp)
    mix = mix[:, : ns(DUR)]
    write_wav("public/craft/alcatraz3d-prov.wav", mix)
    os.makedirs("out/alc3d", exist_ok=True)
    json.dump({"voices": placed, "cues": cues, "sting": t_sting, "lufs": round(float(integrated(mix)), 1), "true_peak": round(float(true_peak(mix)), 1)}, open("out/alc3d/sounds.json", "w"), indent=1)
    print("public/craft/alcatraz3d-prov.wav LUFS", round(float(integrated(mix)), 1), "peak", round(float(true_peak(mix)), 1)); [print(p) for p in placed]

if __name__ == "__main__":
    main()

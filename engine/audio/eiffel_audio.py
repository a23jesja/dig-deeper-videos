# The sound of the Eiffel Tower film: George's lines and Daniel's on their onsets (src/craft/eiffel/timeline.ts LINES, through
# out/craft/eiffel/info.json), every shot's own sounds on its frames, a quiet room tone, the evening street and the sea as beds. The only hit
# in frame 1 is the stamp's contact (shot 1); shot 19 (the stamp coming down) has none. No footsteps, no creaks, nothing that can sound like
# a fart (DAILY-RULES; Jesper 19 and 21 Nov). The voices at -16 LUFS, the whole at -14 LUFS, true peak under -1 dB.
#   python audio/eiffel_audio.py [D|B|C]      (from engine/; B and C: the hook lab's openings, 5 s, each with its own hit in frame 1)
import json, os, subprocess, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, "lib"))
import craft_sfx as fx  # noqa: E402
from dsp import SR, ns, dbg, rng, place, pan, integrated, true_peak, write_wav, st  # noqa: E402

INFO = json.load(open("out/craft/eiffel/info.json")); SP = {x["id"]: x for x in json.load(open("voice/eiffel/spans.json", encoding="utf-8"))}
OPEN = sys.argv[1] if len(sys.argv) > 1 else "D"; O = INFO["openings"][OPEN]
DUR = INFO["film"] if OPEN == "D" else 5.0; FPS = 30

def take(i):
    p = json.load(open(f"voice/eiffel/{i}/pick.json", encoding="utf-8")); f = f"voice/eiffel/{i}/take{p['take']}.mp3"
    a = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-nostdin", "-i", f, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout, np.float32).astype(np.float64)
    sp = SP[i]; a0 = max(0, int((sp["on"] - 0.004) * SR)); a1 = min(len(a), int((sp["off"] + 0.12) * SR)); a = a[a0:a1]
    f_in = min(len(a), int(0.01 * SR)); a[:f_in] *= np.linspace(0, 1, f_in); f_out = min(len(a), int(0.06 * SR)); a[-f_out:] *= np.linspace(1, 0, f_out)
    return a, p["line"].strip()

def main():
    N = ns(DUR + 0.3); vg = np.zeros(N); vd = np.zeros(N); placed = []
    for i, s0 in O["lines"]:
        if s0 >= DUR: continue
        a, text = take(i); i0 = int(s0 * SR); tgt = vd if i.startswith("d") else vg; tgt[i0:i0 + len(a)] += a[: max(0, N - i0)]
        placed.append({"id": i, "who": "daniel" if i.startswith("d") else "george", "text": text, "start": s0, "end": round(s0 + len(a) / SR, 3)})
    for a, b in zip(placed, placed[1:]):
        if b["start"] < a["end"] - 0.12 + 0.25: raise SystemExit(f"voices closer than 0.25 s: {a} / {b}")
    norm = lambda v: v * dbg(-16 - integrated(st(v))) if np.abs(v).max() > 0 else v
    voice = norm(vg) + norm(vd)
    cues, beds = [], []
    cuts = O["cuts"]
    for k, c in enumerate(cuts):
        sid, t0 = c[0], c[1]; off = c[2] if len(c) > 2 else 0.0
        t1 = cuts[k + 1][1] if k + 1 < len(cuts) else DUR
        for s in INFO["shots"][sid]["sounds"]:
            t = t0 + s["t"] - off
            if t0 - 1e-6 <= t < t1: cues.append({"k": s["k"], "f": int(round(t * FPS)), "g": s.get("g", 1.0), "p": s.get("p", 0.0), **({"big": s["big"]} if "big" in s else {})})
        f0, f1 = int(t0 * FPS), int(t1 * FPS)
        if sid in ("e02", "e18"): beds.append({"k": "street", "f0": f0, "f1": f1, "g": 0.35})
        if sid == "e17": beds += [{"k": "sea", "f0": f0, "f1": f1, "g": 0.8}, {"k": "wind", "f0": f0, "f1": f1, "g": 0.4}]
    # (the hit in frame 1 of each opening: D the stamp's contact (shot 1's own); B the cheque's paper slapped on the table; C a short high wood knock)
    if OPEN == "B": cues = [c for c in cues if c["f"] > 10] + [{"k": "paper", "f": 0, "g": 1.2, "p": 0.0}, {"k": "tap", "f": 0, "g": 0.9, "p": 0.0}]
    if OPEN == "C": cues = cues + [{"k": "tap", "f": 0, "g": 1.4, "p": 0.0}]
    spec = {"fps": FPS, "frames": int(DUR * FPS), "seed": 23, "cues": cues, "beds": beds}
    bus = fx.effects(spec)[:, :N]
    if bus.shape[1] < N: bus = np.pad(bus, ((0, 0), (0, N - bus.shape[1])))
    r = rng(7); tone = fx.rumble(DUR + 0.3, r)[:N]; tone = tone if tone.ndim == 2 else st(tone)
    mix = bus * dbg(-14) + tone[:, :N] * dbg(-38) + st(voice)
    for _ in range(3):
        cur = integrated(mix)
        if np.isfinite(cur): mix = mix * dbg(min(-14 - cur, 12))
        mix = np.tanh(mix / 0.82) * 0.82
    tp = true_peak(mix)
    if tp > -1: mix = mix * dbg(-1 - tp)
    mix = mix[:, : ns(DUR)]
    outp = "public/craft/eiffel.wav" if OPEN == "D" else f"public/craft/eiffel-hook-{OPEN.lower()}.wav"; write_wav(outp, mix)
    json.dump({"voices": placed, "cues": cues, "beds": beds, "lufs": round(float(integrated(mix)), 1), "true_peak": round(float(true_peak(mix)), 1)}, open(f"out/craft/eiffel/sounds-{OPEN}.json", "w"), indent=1)
    print(outp, "LUFS", round(float(integrated(mix)), 1), "peak", round(float(true_peak(mix)), 1), "cues", [(c["k"], c["f"]) for c in cues])

if __name__ == "__main__":
    main()

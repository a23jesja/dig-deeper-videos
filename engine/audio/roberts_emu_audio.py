# The sound of Roberts' bedtime (Emu look, 28 Nov): the recorded voices (voice/roberts, 6803662: George narrates, Daniel is the rum pirate,
# Will the young pirate) placed on the timeline, our own synthesised sounds (craft_sfx.py, and a ship's bell made here the same way: decaying
# partials) on the frames where their causes happen in src/videos/robertsEmu/film.tsx, the sea under everything, the party's crowd under the
# party shots, and the "shanty" piece (film_music.py) under the voice. No footsteps, no creaks, nothing low or buzzing. Voices at -16 LUFS,
# the whole at -14 LUFS, true peak under -1 dB.
#   python audio/roberts_emu_audio.py      (from engine/)
import json, os, subprocess, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, "lib"))
import craft_sfx as fx  # noqa: E402
import film_music  # noqa: E402
from dsp import SR, ns, dbg, place, pan, integrated, true_peak, write_wav, st  # noqa: E402

FPS, DUR = 30, 46.0
TL = json.load(open("voice/roberts/timeline.json"))["voices"]
WHO = {"n": "narrator", "d": "rum", "w": "young"}

def decode(f):
    return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-nostdin", "-i", f, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout, np.float32).astype(np.float64)
def take(name):
    p = json.load(open(f"voice/roberts/{name}/pick.json")); a = decode(f"voice/roberts/{name}/take{p['take']}.mp3")
    a = a[: min(len(a), int((p["words"][-1]["b"] + 0.25) * SR))].copy(); fo = min(len(a), int(0.08 * SR)); a[-fo:] *= np.linspace(1, 0, fo)
    return a, p["line"]
def bell(strength=1.0):
    """a ship's bell: a bright strike and four inharmonic partials decaying over about 1.6 s"""
    n = ns(1.8); t = np.arange(n) / SR; out = np.zeros(n)
    for f, a, d in ((523, 1.0, 1.6), (1268, 0.55, 0.9), (1840, 0.35, 0.6), (2730, 0.22, 0.35)): out += a * np.sin(2 * np.pi * f * t) * np.exp(-t / d)
    out[: ns(0.004)] *= np.linspace(0, 1, ns(0.004)); return 0.35 * strength * out

# every sound on its visible cause (film seconds): see film.tsx shot by shot
CUES = [("whoosh", 0.0, 1.0, 0.2),
        ("whoosh", 1.95, 0.5, -0.3), ("snap", 2.25, 0.6, -0.4),                                    # Roberts blows; the barrel's lantern dies
        ("snap", 3.75, 1.0, -0.5), ("snap", 4.1, 1.0, 0.0), ("snap", 4.45, 1.0, 0.5),              # the rail's lanterns out, left to right
        ("whoosh", 6.75, 0.5, 0.2), ("drip", 7.2, 1.2, 0.1),                                       # the mug upside down, the last drop on his nose
        ("thunk", 8.0, 1.3, 0.0), ("whoosh", 8.05, 0.8, 0.3),                                      # the two collide; the mug flies
        ("paper", 8.85, 1.3, 0.0), ("tap", 9.75, 1.2, 0.2),                                        # the articles unrolled; his finger on rule IV
        ("whoosh", 10.4, 0.5, -0.2), ("pour", 11.85, 1.0, 0.1), ("whoosh", 13.05, 0.4, 0.1),       # Roberts points; the tea poured; he blows on it
        ("thunk", 14.05, 1.4, -0.1), ("rope", 14.3, 0.7, -0.1),                                    # the hatch bangs open; they climb
        ("fall", 16.05, 0.8, 0.0), ("thud", 16.3, 1.0, 0.0),                                        # one sits down hard
        ("pour", 17.45, 1.0, 0.1), ("spray", 17.7, 0.9, 0.1),                                      # the gunner pours, it splashes
        ("book", 19.15, 1.5, 0.0), ("paper", 19.4, 0.8, 0.0),                                      # the book lands, its pages flutter
        ("ting", 20.8, 0.8, 0.1), ("whoosh", 22.05, 0.6, 0.2), ("rattle", 22.4, 0.4, 0.2),         # Roberts' hope; the hourglass turned, its sand
        ("whoosh", 23.3, 1.0, 0.0),                                                                # smash cut to the party
        ("ting", 24.75, 1.0, -0.2), ("ting", 24.78, 1.0, 0.2), ("ting", 24.81, 0.9, 0.0), ("spray", 24.8, 1.0, 0.0),      # mugs clash
        ("rope", 25.9, 0.8, -0.3), ("whoosh", 26.2, 0.6, 0.0), ("rope", 26.5, 0.7, 0.2), ("whoosh", 26.8, 0.6, 0.3),   # swinging across
        ("crack", 27.8, 1.0, -0.2), ("crack", 28.3, 1.0, 0.0), ("crack", 28.8, 1.0, 0.2), ("whoosh", 27.7, 0.5, 0.0),   # pistols fired up, hats thrown
        ("thud", 29.9, 1.0, 0.1), ("crack", 30.2, 1.0, 0.0), ("splash", 30.55, 0.5, 0.0),          # the keg set down, its lid knocked in, the dip
        ("ting", 31.02, 0.8, -0.2), ("ting", 31.1, 0.8, 0.0), ("ting", 31.17, 0.8, 0.2), ("rattle", 31.05, 0.6, 0.0),   # the bottles topple
        ("flap", 33.0, 0.9, -0.4), ("flap", 33.25, 0.7, -0.1),                                     # the gull
        ("fall", 37.35, 0.7, 0.2), ("thud", 37.55, 1.0, 0.2),                                       # the drunk falls flat
        ("thunk", 38.0, 0.9, 0.2),                                                                 # the telescope dropped
        ("tap", 40.45, 1.0, -0.2), ("shing", 40.9, 1.2, -0.1),                                     # the cup on the rail; the cutlass drawn
        ("blast", 41.6, 0.5, -0.3), ("blast", 41.72, 0.45, -0.1), ("blast", 41.84, 0.45, 0.1), ("blast", 41.96, 0.45, 0.3), ("splash", 42.05, 1.0, -0.2), ("splash", 42.25, 1.0, 0.2),   # the broadside
        ("rattle", 42.9, 0.4, 0.3), ("ting", 43.35, 1.0, 0.3),                                     # the teacup rattles and falls
        ("whoosh", 43.8, 0.8, 0.0), ("ting", 45.6, 0.7, 0.0), ("whoosh", 45.9, 0.8, 0.2)]        # back to the party; the wink; into the loop
BELLS = [0.02, 2.45, 2.74, 3.03, 3.32, 38.3, 38.58, 38.86, 39.14, 39.42]
BEDS = [("sea", 0.0, DUR, 0.8), ("crowd", 0.0, 4.8, 0.9), ("crowd", 23.3, 31.0, 1.0), ("crowd", 43.8, DUR, 0.9), ("birds", 32.6, 35.2, 0.7)]

def main():
    N = ns(DUR + 0.3); buses = {k: np.zeros(N) for k in ("narrator", "rum", "young")}; placed = []
    for v in TL:
        a, line = take(v["id"]); i0 = int(v["start"] * SR); who = WHO[v["id"][0]]; buses[who][i0:i0 + len(a)] += a[: max(0, N - i0)]
        placed.append({"who": who, "take": v["id"], "text": line, "start": round(v["start"], 3), "end": round(v["start"] + len(a) / SR, 3)})
    for a, b in zip(placed, placed[1:]):
        if b["start"] < a["end"] - 0.02: raise SystemExit(f"voices overlap: {a} / {b}")
    voice = sum(buses[k] * dbg(-16 - integrated(st(buses[k]))) for k in buses)
    spec = {"fps": FPS, "frames": int(DUR * FPS), "seed": 41, "cues": [{"k": k, "f": int(round(t * FPS)), "g": g, "p": p} for k, t, g, p in CUES],
            "beds": [{"k": k, "f0": int(a * FPS), "f1": int(b * FPS), "g": g} for k, a, b, g in BEDS]}
    bus = fx.effects(spec)[:, :N]
    if bus.shape[1] < N: bus = np.pad(bus, ((0, 0), (0, N - bus.shape[1])))
    for t in BELLS: place(bus, pan(bell(), 0.2), t, dbg(-4))
    lines = [{"a": p["start"], "b": p["end"]} for p in placed]
    m = film_music.music("shanty", DUR, lines)[:, :N]
    if m.shape[1] < N: m = np.pad(m, ((0, 0), (0, N - m.shape[1])))
    mix = bus * dbg(-11) + m * dbg(-16 - integrated(m) - 18) + st(voice)
    for _ in range(3):
        cur = integrated(mix)
        if np.isfinite(cur): mix = mix * dbg(min(-14 - cur, 12))
        mix = np.tanh(mix / 0.82) * 0.82
    tp = true_peak(mix)
    if tp > -1: mix = mix * dbg(-1 - tp)
    mix = mix[:, : ns(DUR)]
    os.makedirs("public/craft", exist_ok=True); out = "public/craft/roberts-emu.wav"; write_wav(out, mix); os.makedirs("out/remu", exist_ok=True)
    json.dump({"voices": placed, "cues": spec["cues"], "bells": BELLS, "beds": spec["beds"], "lufs": round(float(integrated(mix)), 1), "true_peak": round(float(true_peak(mix)), 1)}, open("out/remu/sounds.json", "w"), indent=1)
    print(out, "LUFS", round(float(integrated(mix)), 1), "peak", round(float(true_peak(mix)), 1))

if __name__ == "__main__":
    main()

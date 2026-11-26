# The sound of the Short "The captain's dinner" (24 Nov evening): the narrator (George, calm), the captain (George, two short shouted lines),
# the crewman (Daniel), the boy (Will), each take placed so its speech starts on its beat (dinner3d/figures.ts VOICES, the same times as the
# mouths and the words). v6: see the cues below. Our own synthesised sounds only (craft_sfx.py): a swish on frame 1 with the question (the hit), a small plate "ting" as
# the empty plate is revealed (1.2 s), the crewman's snort as he jabs his finger (8.75 s, no words), a dull knock as the captain's hands come
# down on the table (15.3 s), a light swish as the hands go up (22.45 s), the sea under everything, and a swish at the end that runs into the
# loop. No footsteps, no creaks, nothing low or buzzing. Voices at -16 LUFS each kind, the whole at -14 LUFS, true peak under -1 dB.
#   python audio/dinner3d_audio.py      (from engine/)
import json, os, subprocess, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, "lib"))
import craft_sfx as fx  # noqa: E402
from dsp import SR, ns, dbg, place, pan, integrated, true_peak, write_wav, st  # noqa: E402

SPEC = json.load(open("src/craft/dinner3d/shots.json")); FPS = SPEC["fps"]; DUR = SPEC["shots"][-1]["t1"]
VOICES = [("n1", "narrator", -0.05), ("k2", "captain", 1.99), ("n3", "narrator", 2.72), ("d4", "crew", 12.15), ("n5", "narrator", 13.35), ("k6", "captain", 15.4), ("n7", "narrator", 16.75), ("w8", "boy", 22.0), ("aye-crew", "crew", 22.94), ("aye-boy", "boy", 22.99)]      # (the vote: both "Aye!" [OWN] on the fists' beat, the cloud session 25 Nov)
DIR = os.environ.get("DINNER_VOICE_DIR", "voice/dinner"); CAPTAIN = os.environ.get("DINNER_CAPTAIN", "")      # (DINNER_CAPTAIN=-daniel-reserv: the spare)

def decode(f):
    return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-nostdin", "-i", f, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout, np.float32).astype(np.float64)
def take(name):
    p = json.load(open(f"{DIR}/{name}/pick.json")); a = decode(f"{DIR}/{name}/take{p['take']}.mp3")
    a = a[: min(len(a), int((p["words"][-1]["b"] + 0.25) * SR))].copy(); fo = min(len(a), int(0.08 * SR)); a[-fo:] *= np.linspace(1, 0, fo)
    return a, p["line"]

def main():
    N = ns(DUR + 0.3); buses = {k: np.zeros(N) for k in ("narrator", "captain", "crew", "boy")}; placed = []
    for name, who, t in VOICES:
        a, line = take(name + (CAPTAIN if who == "captain" else ""))
        if t < 0: a = a[int(-t * SR):]; t = 0.0
        i0 = int(t * SR); buses[who][i0:i0 + len(a)] += a[: max(0, N - i0)]
        placed.append({"who": who, "take": name + (CAPTAIN if who == "captain" else ""), "text": line, "start": round(t, 3), "end": round(t + len(a) / SR, 3)})
    for a, b in zip(placed, placed[1:]):
        if b["start"] < a["end"] + 0.05 and not (a["take"].startswith("aye-") and b["take"].startswith("aye-")): raise SystemExit(f"voices overlap or touch: {a} / {b}")
    # (George's two parts as one level, the captain's shouts 3 dB over the calm narrator so the two are told apart; Daniel and Will at -16)
    g = buses["narrator"] + buses["captain"] * dbg(3); voice = g * dbg(-16 - integrated(st(buses["narrator"]))) + sum(buses[k] * dbg(-16 - integrated(st(buses[k]))) for k in ("crew", "boy"))
    # (v6: every sound on its visible cause, on the frame it happens: the swish as the pudding is lifted (frame 1), the ting as it leaves the
    #  plate (0.333, the lift's start), the thud of the sailor's hand on the book (2.767, the contact frame), his sniff with the pudding at his
    #  nose (3.85), chewing at each bite (4.83 and 10.60), the captain's fist on the table (15.467, the contact frame), the swish into the loop)
    cues = [{"k": "whoosh", "f": 0, "g": 1.3, "p": 0.2}, {"k": "ting", "f": 10, "g": 0.8, "p": -0.2}, {"k": "book", "f": 87, "g": 1.25, "p": -0.1},
            {"k": "sniff", "f": 116, "g": 1.0, "p": -0.1}, {"k": "munch", "f": 145, "g": 1.0, "p": -0.1}, {"k": "munch", "f": 318, "g": 1.1, "p": 0.0},
            {"k": "thunk", "f": 464, "g": 1.25, "p": 0.1}, {"k": "thunk", "f": 690, "g": 1.35, "p": -0.1}, {"k": "whoosh", "f": 724, "g": 0.9, "p": 0.2}]      # (696: the two fists on the table, the vote)
    beds = [{"k": "lap", "f0": 0, "f1": int(DUR * FPS), "g": 0.55}]
    spec = {"fps": FPS, "frames": int(DUR * FPS), "seed": 31, "cues": cues, "beds": beds}
    bus = fx.effects(spec)[:, :N]
    if bus.shape[1] < N: bus = np.pad(bus, ((0, 0), (0, N - bus.shape[1])))
    mix = bus * dbg(-13) + st(voice)
    for _ in range(3):
        cur = integrated(mix)
        if np.isfinite(cur): mix = mix * dbg(min(-14 - cur, 12))
        mix = np.tanh(mix / 0.82) * 0.82
    tp = true_peak(mix)
    if tp > -1: mix = mix * dbg(-1 - tp)
    mix = mix[:, : ns(DUR)]
    out = "public/craft/dinner3d" + (CAPTAIN or "") + ".wav"; write_wav(out, mix); os.makedirs("out/din3d", exist_ok=True)
    json.dump({"voices": placed, "cues": cues, "beds": beds, "lufs": round(float(integrated(mix)), 1), "true_peak": round(float(true_peak(mix)), 1)}, open("out/din3d/sounds" + (CAPTAIN or "") + ".json", "w"), indent=1)
    print(out, "LUFS", round(float(integrated(mix)), 1), "peak", round(float(true_peak(mix)), 1)); [print(p) for p in placed]

if __name__ == "__main__":
    main()

# Sound for the short "The Town That Couldn't Stop Dancing" (40 s): the house score plus effects, every cue on a word.
# usage: python audio/dance_audio.py -> public/dance/mix.wav
import json, os, re, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import emu_long_audio as el  # noqa: E402
import emu_audio as ea  # noqa: E402
from emu_audio import I, G, F, fr, rng, r_, add, roll, thud, tick, scratch, cut_whoosh, fx  # noqa: E402
from dsp import SR, ns, dbg, place, widen, make_ir, convolve_st, integrated, true_peak, read_wav, write_wav, tt, phase  # noqa: E402

TOTAL = 1205
ea.TOTAL = TOTAL; ea.DUR = TOTAL / 30; ea.N = ns(ea.DUR); N = ea.N
ea.music = {k: np.zeros((2, N)) for k in ("low", "mid", "mel", "drum")}
ea.sfx = np.zeros((2, N))
t = fr
ROOT = os.path.dirname(HERE)
NAME = "dance-short"
WORDS = json.load(open(os.path.join(ROOT, "voice", NAME, "words.json"), encoding="utf-8"))
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
def at(line, word=None, n=0):
    L = [w for w in WORDS if w["line"] == line]
    if word is None: return round(L[0]["a"] * 30)
    return round([w for w in L if norm(w["w"]) == norm(word)][n]["a"] * 30)
def whistle(dur=0.55):
    """a policeman's pea whistle"""
    x = tt(dur); y = np.sin(phase(2750 * (1 + 0.04 * np.sin(2 * np.pi * 34 * x)))) * (0.6 + 0.4 * np.sin(2 * np.pi * 34 * x))
    return y * np.minimum(1, x / 0.02) * np.minimum(1, (dur - x) / 0.05)

# the cuts (same frames as S in src/videos/style2d/dance.tsx)
C = {k: at(k) - 1 for k in ("where", "spread", "doctors", "stage", "worse", "toll", "ban", "over", "why")}

def build_music():
    tim = lambda f, m=43, v=0.75: add("drum", I.timpani(F(m), v, r_()), t(f), 0)
    cym = lambda f, v=0.4: add("drum", I.cymbal(v, r_()), t(f), 0.1)
    glock = lambda f, m, v=0.5: add("mel", I.glock(F(m), v, r_()), t(f), 0.2)
    tim(0); el.stab(2, 0.5); el.gallop(t(6), 2)                                   # she dances
    el.light(t(C["where"] + 2), 3, 0.42)
    el.gallop(t(C["spread"] + 2), 2); glock(at("spread", "thirty") - 1, 88)
    el.sneak(t(C["doctors"] + 2), 2); el.trombone(at("doctors", "More") + 4, 58)
    el.march(t(C["stage"] + 2), 3, 0.5)                                            # the hired band
    el.gallop(t(C["worse"] + 2), 3); tim(at("worse", "four") - 1, 38, 0.85); el.stab(at("worse", "four") - 1, 0.55)
    el.sad(t(C["toll"] + 4), ((0, 2, 62), (2, 2, 59), (4, 2, 55)))
    tim(at("ban", "bans") - 1, 38, 0.85); el.stab(at("ban", "bans") - 1, 0.55, (56, 59, 65)); el.sneak(t(at("ban", "sends")), 1)
    el.light(t(C["over"] + 2), 1, 0.4); glock(at("over", "over") + 2, 91)
    el.pizz(t(C["why"] + 3), [(0, 1, 74), (1, .5, 71), (1.5, .5, 74), (2, 1, 79), (3, 1, 76), (4, 2, 74)], 0.5)
    tb = t(TOTAL - 26); add("low", I.brass(F(43), 0.3, 0.6, r_(), "tuba"), tb, -0.08); el.stab(TOTAL - 26, 0.45); cym(TOTAL - 24, 0.35)
    m = ea.music
    mix = 0.9 * m["low"] + 0.75 * m["mid"] + 0.8 * m["mel"] + 0.7 * m["drum"]
    wet = convolve_st(0.3 * m["mid"] + 0.5 * m["mel"] + 0.35 * m["drum"] + 0.15 * m["low"], make_ir(1.1, 7, hf=0.6))[:, :N]
    return mix + 0.22 * wet

def build_sfx():
    r = rng(518)
    for k in C: cut_whoosh(C[k], r, 0.3)
    for a, b in ((4, C["where"]), (C["where"] + 4, C["doctors"]), (C["worse"] + 4, C["toll"])):   # feet on the cobbles
        for k in range(int((b - a) / 7)): fx(G.boot(r, 0.6), a + k * 7, r.uniform(-0.4, 0.4), 0.16)
    for k in range(int((C["worse"] - C["stage"]) / 9)): fx(thud(r, 95, 0.5), C["stage"] + 6 + k * 9, -0.3, 0.3)   # the drum
    fx(thud(r, 70, 0.9), at("ban", "bans") - 1, 0, 0.55)
    for k in range(3): fx(tick(r, 2600 + 300 * k, 0.02), at("over", "over") + k * 3, 0.2, 0.25)
    return ea.sfx

def main():
    v, sr = read_wav(os.path.join(ROOT, "voice", NAME, "voice.wav")); assert sr == SR
    voice = np.zeros((2, N)); vv = v[0][:N]; voice[:, : len(vv)] = vv
    voice *= dbg(-16.0 - integrated(voice))
    m = build_music(); s = build_sfx()
    m *= dbg(-16.0 - 10.0 - integrated(m)); m *= ea.duck(WORDS, -3.0)[None, :]
    s *= ea.duck(WORDS, -2.0)[None, :]; s *= dbg(-14.0) / max(np.abs(s).max(), 1e-9)
    mix = voice + m + s
    mix *= dbg(-14.0 - integrated(mix)); mix = ea.limiter(mix)
    mix[:, -ns(0.25):] *= np.linspace(1, 0, ns(0.25))[None, :]
    os.makedirs(os.path.join(ROOT, "public", "dance"), exist_ok=True)
    write_wav(os.path.join(ROOT, "public", "dance", "mix.wav"), mix, 16)
    print("mix: %.2f s, %.1f LUFS, true peak %.1f dBTP | voice %.1f, music %.1f, sfx %.1f LUFS" % (mix.shape[1] / SR, integrated(mix), true_peak(mix), integrated(voice), integrated(m), integrated(s)))

if __name__ == "__main__":
    main()

# Sound for the short "The Man Who Sold the Eiffel Tower" (42 s): the house score plus effects, every cue on a word.
# usage: python audio/lustig_short_audio.py -> public/lustig/mix.wav
import json, os, re, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import emu_long_audio as el  # noqa: E402
import emu_audio as ea  # noqa: E402
from emu_audio import I, G, F, Q, fr, rng, r_, add, roll, thud, tick, scratch, cut_whoosh, fx  # noqa: E402
from dsp import SR, ns, dbg, pan, place, widen, make_ir, convolve_st, integrated, true_peak, read_wav, write_wav, lp, tt, phase  # noqa: E402

TOTAL = 1262
ea.TOTAL = TOTAL; ea.DUR = TOTAL / 30; ea.N = ns(ea.DUR); N = ea.N
ea.music = {k: np.zeros((2, N)) for k in ("low", "mid", "mel", "drum")}
ea.sfx = np.zeros((2, N))
t = fr
ROOT = os.path.dirname(HERE)
NAME = "lustig-short"
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

A = {k: at(k) - v for k, v in {"hook2": 4, "who": 5, "news": 4, "pose": 4, "secret": 4, "poisson": 4, "flee": 4, "shame": 4, "again": 4, "end": 5}.items()}
POL = at("again", "police") - 4; ESC = at("again", "escaped") - 6

def build_music():
    tim = lambda f, m=43, v=0.75: add("drum", I.timpani(F(m), v, r_()), t(f), 0)
    cym = lambda f, v=0.4: add("drum", I.cymbal(v, r_()), t(f), 0.1)
    glock = lambda f, m, v=0.5: add("mel", I.glock(F(m), v, r_()), t(f), 0.2)
    tim(0); roll(0.05, t(at("hook1", "sold") - 4), 0.2, 0.5); el.stab(at("hook1", "sold") - 2, 0.5); cym(at("hook1", "sold") + 2)
    el.trombone(at("hook2", "again") + 2, 58)
    el.pizz(t(A["who"] + 4), [(0, 1, 74), (1, .5, 71), (1.5, .5, 74), (2, 1, 79)], 0.5)
    el.sneak(t(A["news"] + 2), 2); glock(at("news", "repaint") + 4, 91)
    el.light(t(A["pose"] + 2), 3, 0.42)
    el.sneak(t(A["secret"] + 2), 2)
    el.pizz(t(A["poisson"] + 2), [(0, 1, 62), (1, 1, 66), (2, 1, 69)], 0.45); glock(at("poisson", "70,000") - 2, 86); el.stab(at("poisson", "70,000") - 2, 0.5, (62, 66, 69))
    el.gallop(t(A["flee"] + 2), 1)
    el.sad(t(A["shame"] + 2), ((0, 2, 62), (2, 2, 59), (4, 2, 55)))
    el.sneak(t(A["again"] + 2), 1); roll(t(POL - 20), t(POL), 0.15, 0.6); tim(POL, 38, 0.85); el.stab(POL, 0.55)
    el.pizz(t(ESC + 4), [(0, .5, 67), (.5, .5, 71), (1, .5, 74), (1.5, 1.5, 79)], 0.5); cym(ESC + 30)
    el.pizz(t(A["end"] + 2), [(0, 1, 74), (1, .5, 71), (1.5, .5, 74), (2, 1, 79), (3, 1, 76), (4, 2, 74)], 0.5)
    tb = t(TOTAL - 24); add("low", I.brass(F(43), 0.3, 0.6, r_(), "tuba"), tb, -0.08); el.stab(TOTAL - 24, 0.45)
    m = ea.music
    mix = 0.9 * m["low"] + 0.75 * m["mid"] + 0.8 * m["mel"] + 0.7 * m["drum"]
    wet = convolve_st(0.3 * m["mid"] + 0.5 * m["mel"] + 0.35 * m["drum"] + 0.15 * m["low"], make_ir(1.1, 7, hf=0.6))[:, :N]
    return mix + 0.22 * wet

def build_sfx():
    r = rng(101)
    place(ea.sfx, G.breeze(ea.DUR, r, 0.35), 0, 0.4)
    place(ea.sfx, pan(G.bird_chirps(ea.DUR, r, 0.25, "blackbird"), -0.4), 0, 0.04)
    for k in ["hook2", "news", "secret", "poisson"]: cut_whoosh(A[k], r, 0.32)
    fx(widen(G.whoosh(0.7, r, peak=0.3, f_lo=600, f_hi=5000), r), A["who"] - 8, 0, 0.5)
    fx(thud(r, 70, 0.8), at("hook1", "sold") - 2, 0, 0.6); fx(thud(r, 70, 0.8), at("hook2", "again") - 3, 0, 0.55)
    fx(scratch(r, 0.25), A["news"] + 6, 0.2, 0.3); fx(thud(r, 60, 0.8), at("news", "expensive") - 3, 0, 0.45)
    fx(tick(r, 2600, 0.02), at("news", "repaint") + 4, 0.2, 0.4)
    for k in range(10): fx(G.boot(r, 0.7), at("pose", "invited") - 4 + int(k * 2.4), r.uniform(-0.3, 0.3), 0.18)
    fx(scratch(r, 0.2), at("pose", "government") - 3, 0, 0.3)
    fx(tick(r, 1800, 0.02), at("secret", "tower") - 3, 0, 0.3)
    fx(thud(r, 85, 0.7), at("poisson", "paid") - 4, 0, 0.55)
    for k in range(4): fx(tick(r, 3000 + 300 * k, 0.02), at("poisson", "70,000") - 2 + k * 3, 0.2, 0.3)
    for k in range(12): fx(G.boot(r, 0.6), A["flee"] + 3 + k * 6, r.uniform(-0.4, 0.4), 0.18)
    for k in range(5): fx(G.boot(r, 0.8), POL + k * 3, -0.3, 0.2)
    fx(whistle(), POL + 6, -0.2, 0.12)
    fx(lp(np.sign(np.sin(phase(np.full(ns(1.1), 98.0)))) * np.sin(np.pi * tt(1.1) / 1.1) ** 0.5, 500, 2), ESC + 8, 0, 0.08)   # the ship's horn
    fx(thud(r, 70, 0.8), at("end", "never") - 3, 0, 0.55)
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
    os.makedirs(os.path.join(ROOT, "public", "lustig"), exist_ok=True)
    write_wav(os.path.join(ROOT, "public", "lustig", "mix.wav"), mix, 16)
    print("mix: %.2f s, %.1f LUFS, true peak %.1f dBTP | voice %.1f, music %.1f, sfx %.1f LUFS" % (mix.shape[1] / SR, integrated(mix), true_peak(mix), integrated(voice), integrated(m), integrated(s)))

if __name__ == "__main__":
    main()

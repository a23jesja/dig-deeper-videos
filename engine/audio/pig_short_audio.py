# Sound for the short "The Pig War" (49 s): the house score plus effects, every cue on a word of the voice.
# usage: python audio/pig_short_audio.py -> public/pig/mix.wav
import json, os, re, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import emu_long_audio as el  # noqa: E402
import emu_audio as ea  # noqa: E402
from emu_audio import I, G, F, Q, fr, rng, r_, add, roll, gunshot, thud, tick, scratch, cut_whoosh, fx  # noqa: E402
from dsp import SR, ns, dbg, pan, place, widen, make_ir, convolve_st, integrated, true_peak, read_wav, write_wav, lp, tt, phase  # noqa: E402

TOTAL = 1480
ea.TOTAL = TOTAL; ea.DUR = TOTAL / 30; ea.N = ns(ea.DUR); N = ea.N
ea.music = {k: np.zeros((2, N)) for k in ("low", "mid", "mel", "drum")}
ea.sfx = np.zeros((2, N))
t = fr
ROOT = os.path.dirname(HERE)
NAME = "pig-short"
WORDS = json.load(open(os.path.join(ROOT, "voice", NAME, "words.json"), encoding="utf-8"))
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
def at(line, word=None, n=0):
    L = [w for w in WORDS if w["line"] == line]
    if word is None: return round(L[0]["a"] * 30)
    return round([w for w in L if norm(w["w"]) == norm(word)][n]["a"] * 30)

def oink(r, f0=230, dur=0.2):
    """a pig: short nasal grunt"""
    x = tt(dur); f = f0 * (1 - 0.25 * x / dur) * (1 + 0.05 * np.sin(2 * np.pi * 38 * x))
    y = np.sign(np.sin(phase(f))) * 0.5 + np.sin(phase(f)) + 0.5 * np.sin(3 * phase(f))
    return lp(y, 1500, 2) * np.sin(np.pi * x / dur) ** 0.6

A = {2: at("hook2") - 4, 3: at("island") - 5, 4: at("shot") - 4, 5: at("money") - 4, 6: at("troops") - 4, 7: at("peak") - 3, 8: at("admiral") - 4,
     9: at("share") - 4, 10: at("sports") - 3, 11: at("kaiser") - 4, 12: at("end") - 5}
BANG = at("shot", "shot") + 2

def build_music():
    tim = lambda f, m=43, v=0.75: add("drum", I.timpani(F(m), v, r_()), t(f), 0)
    cym = lambda f, v=0.4: add("drum", I.cymbal(v, r_()), t(f), 0.1)
    glock = lambda f, m, v=0.5: add("mel", I.glock(F(m), v, r_()), t(f), 0.2)
    tim(0); roll(0.05, t(at("hook1", "over") - 4), 0.2, 0.5); el.stab(at("hook1", "pig") - 2, 0.5)
    el.pizz(t(A[2] + 2), [(0, .5, 67), (1, .5, 71), (2, 1, 74)], 0.5); tim(at("hook2", "The") - 2, 38, 0.8)
    el.pizz(t(A[3] + 4), [(0, 1, 62), (1, 1, 66), (2, 1, 69), (4, 1, 62), (5, 1, 67), (6, 2, 71)], 0.45)        # mine! mine!
    el.sneak(t(A[4] + 2), 2); cym(BANG + 1, 0.45)                                                              # the potato patch
    el.pizz(t(A[5] + 2), [(0, .5, 74), (1, .5, 71), (3, .5, 62), (4, 1, 59)], 0.5)                             # $10 / $100
    el.march(t(A[6] + 2), 2, 0.5)                                                                              # soldiers, warships
    el.tension(t(A[7] + 2), t(A[8] - 4)); roll(t(at("peak", "2,140") - 20), t(A[8] - 6), 0.15, 0.6)
    el.trombone(at("admiral", "refused") + 2, 58)                                                              # the admiral says no
    el.light(t(A[9] + 2), 3, 0.42)                                                                             # twelve years, sports days
    glock(at("sports", "holidays") + 4, 91)
    el.pizz(t(A[11] + 2), [(0, 1, 62), (1, 1, 66), (2, 2, 69)], 0.45); el.stab(at("kaiser", "America") - 3, 0.55, (62, 66, 69)); cym(at("kaiser", "America") - 2)
    el.sad(t(A[12] + 2), ((0, 2, 62), (2, 2, 59), (4, 3, 55)))
    tb = t(TOTAL - 24); add("low", I.brass(F(43), 0.3, 0.6, r_(), "tuba"), tb, -0.08); el.stab(TOTAL - 24, 0.45)
    m = ea.music
    mix = 0.9 * m["low"] + 0.75 * m["mid"] + 0.8 * m["mel"] + 0.7 * m["drum"]
    wet = convolve_st(0.3 * m["mid"] + 0.5 * m["mel"] + 0.35 * m["drum"] + 0.15 * m["low"], make_ir(1.1, 7, hf=0.6))[:, :N]
    return mix + 0.22 * wet

def build_sfx():
    r = rng(91)
    place(ea.sfx, G.breeze(ea.DUR, r, 0.35), 0, 0.5)
    place(ea.sfx, pan(G.bird_chirps(ea.DUR, r, 0.25, "blackbird"), -0.4), 0, 0.05)
    cut_whoosh(at("hook1", "over") - 3, r, 0.4); cut_whoosh(at("sports", "and") - 3, r, 0.35)
    fx(widen(G.whoosh(0.7, r, peak=0.3, f_lo=600, f_hi=5000), r), A[3] - 8, 0, 0.5)
    fx(oink(r), at("hook1", "pig") + 4, 0, 0.5); fx(oink(r, 250, 0.16), at("hook1", "pig") + 11, 0, 0.4)
    fx(oink(r, 280, 0.25), at("hook2", "The") + 12, 0, 0.5)
    for f in [at("island", "claimed") - 2, at("island", "claimed") + 7]: fx(tick(r, 1800, 0.02), f, 0, 0.3)
    for k in range(9): fx(tick(r, 420, 0.03), A[4] + 6 + k * 11, 0.3, 0.2)                    # munching
    fx(oink(r, 210, 0.18), A[4] + 40, 0.3, 0.3)
    for k in range(4): fx(G.boot(r, 0.7), at("shot", "farmer") - 4 + k * 4, -0.3, 0.2)
    fx(gunshot(r, 1.4), BANG, -0.1, 0.9); fx(oink(r, 330, 0.3), BANG + 3, 0.2, 0.5); fx(thud(r, 70, 0.9), BANG + 5, 0.2, 0.6)
    fx(tick(r, 2600, 0.02), at("money", "10") - 2, 0.3, 0.4); fx(tick(r, 2200, 0.02), at("money", "100") - 2, -0.3, 0.45)
    for k in range(10): fx(G.boot(r, 0.8), at("troops", "soldiers") - 6 + int(k * 3.4), r.uniform(-0.3, 0.3), 0.2)
    for k in range(3): fx(widen(G.whoosh(0.6, r, peak=0.2), r), at("troops", "warships") - 5 + k * 5, 0, 0.25)
    for w in ["461", "14", "5", "2,140"]: fx(thud(r, 60, 0.8), at("peak", w) - 2, 0, 0.5)
    fx(scratch(r, 0.2), at("admiral", "refused") - 3, 0, 0.35)
    fx(tick(r, 3000, 0.03), at("sports", "holidays") + 4, 0, 0.5)                              # the mugs
    for k in range(10): fx(G.boot(r, 0.5), at("sports", "held") - 4 + k * 5, r.uniform(-0.4, 0.4), 0.16)
    fx(thud(r, 85, 0.7), at("kaiser", "America") - 3, 0, 0.6)                                  # the stamp
    return ea.sfx

def main():
    v, sr = read_wav(os.path.join(ROOT, "voice", NAME, "voice.wav")); assert sr == SR
    voice = np.zeros((2, N)); vv = v[0][:N]; voice[:, : len(vv)] = vv
    voice *= dbg(-16.0 - integrated(voice))
    m = build_music(); s = build_sfx()
    m *= dbg(-16.0 - 10.0 - integrated(m)); m *= ea.duck(WORDS, -3.0)[None, :]
    s *= ea.duck(WORDS, -2.0)[None, :]; s *= dbg(-8.0) / max(np.abs(s).max(), 1e-9)
    mix = voice + m + s
    mix *= dbg(-14.0 - integrated(mix)); mix = ea.limiter(mix)
    mix[:, -ns(0.25):] *= np.linspace(1, 0, ns(0.25))[None, :]
    os.makedirs(os.path.join(ROOT, "public", "pig"), exist_ok=True)
    write_wav(os.path.join(ROOT, "public", "pig", "mix.wav"), mix, 16)
    print("mix: %.2f s, %.1f LUFS, true peak %.1f dBTP | voice %.1f, music %.1f, sfx %.1f LUFS" % (mix.shape[1] / SR, integrated(mix), true_peak(mix), integrated(voice), integrated(m), integrated(s)))

if __name__ == "__main__":
    main()

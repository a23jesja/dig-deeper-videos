# Sound for the short "I Survived the Titanic: Part 1" (38 s): the house score plus effects, every cue on a word.
# usage: python audio/titanic1_audio.py -> public/titanic/mix-1.wav
import json, os, re, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import emu_long_audio as el  # noqa: E402
import emu_audio as ea  # noqa: E402
from emu_audio import I, G, F, fr, rng, r_, add, roll, thud, tick, scratch, cut_whoosh, fx  # noqa: E402
from dsp import SR, ns, dbg, place, widen, make_ir, convolve_st, integrated, true_peak, read_wav, write_wav, tt, phase  # noqa: E402

TOTAL = 1155
ea.TOTAL = TOTAL; ea.DUR = TOTAL / 30; ea.N = ns(ea.DUR); N = ea.N
ea.music = {k: np.zeros((2, N)) for k in ("low", "mid", "mel", "drum")}
ea.sfx = np.zeros((2, N))
t = fr
ROOT = os.path.dirname(HERE)
NAME = "titanic-1"
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

# the cuts (same frames as S in src/videos/style2d/titanic1.tsx)
C = {"truth": at("truth") - 1, "time": at("time") - 1, "scrape": at("scrape") - 1, "side": at("scrape", "The", 1) - 2, "calm": at("calm") - 1, "below": at("below") - 1,
     "plan": at("below", "She") - 2, "wireless": at("wireless") - 1, "order": at("order") - 1, "count": at("count") - 1, "cliff": at("cliff") - 1}

def build_music():
    tim = lambda f, m=43, v=0.75: add("drum", I.timpani(F(m), v, r_()), t(f), 0)
    cym = lambda f, v=0.4: add("drum", I.cymbal(v, r_()), t(f), 0.1)
    glock = lambda f, m, v=0.5: add("mel", I.glock(F(m), v, r_()), t(f), 0.2)
    tim(0, 38, 0.85); el.stab(2, 0.6, (57, 60, 65)); cym(4, 0.5); el.trombone(at("hook", "Titanic") + 2, 55)
    el.pizz(t(C["truth"] + 3), [(0, 1, 69), (1, .5, 65), (1.5, .5, 69), (2, 1, 72)], 0.45)
    el.sneak(t(C["time"] + 2), 3)
    el.gallop(t(C["scrape"] + 2), 1); tim(at("scrape", "Too") - 1, 36, 0.9); el.stab(at("scrape", "Too") - 1, 0.6, (56, 59, 65)); cym(at("scrape", "Too") + 1, 0.5)
    roll(t(C["side"]), t(C["calm"] - 4), 0.2, 0.5)
    el.light(t(C["calm"] + 2), 2, 0.4)
    el.sneak(t(C["below"] + 2), 1); roll(t(C["below"] + 10), t(C["plan"]), 0.15, 0.55)
    glock(at("below", "four") - 1, 84); el.pizz(t(C["plan"] + 6), [(0, 1, 60), (1, 1, 64), (2, 1, 67)], 0.4); tim(at("below", "five") - 1, 38, 0.85); el.stab(at("below", "five") - 1, 0.55, (56, 59, 65))
    el.sneak(t(C["wireless"] + 2), 2); el.trombone(at("wireless", "four") + 2, 53)
    tim(C["order"], 43, 0.7); el.sad(t(C["order"] + 6), ((0, 2, 62), (2, 2, 59)))
    el.pizz(t(C["count"] + 3), [(0, .5, 62), (.5, .5, 64), (1, .5, 65), (1.5, .5, 67)], 0.45); tim(at("count", "Twenty") - 1, 43, 0.75); el.stab(at("count", "Twenty") - 1, 0.5)
    el.sad(t(at("count", "Room") - 2), ((0, 2, 60), (2, 2, 57)))
    roll(t(C["cliff"] - 8), t(C["cliff"] + 30), 0.2, 0.7); tim(C["cliff"] + 30, 36, 0.9); el.stab(C["cliff"] + 30, 0.6, (56, 59, 65)); cym(C["cliff"] + 32, 0.5)
    tb = t(TOTAL - 26); add("low", I.brass(F(41), 0.3, 0.7, r_(), "tuba"), tb, -0.08); tim(TOTAL - 26, 36, 0.8)
    m = ea.music
    mix = 0.9 * m["low"] + 0.75 * m["mid"] + 0.8 * m["mel"] + 0.7 * m["drum"]
    wet = convolve_st(0.3 * m["mid"] + 0.5 * m["mel"] + 0.35 * m["drum"] + 0.15 * m["low"], make_ir(1.6, 7, hf=0.5))[:, :N]
    return mix + 0.25 * wet

def build_sfx():
    r = rng(412)
    for k in C: cut_whoosh(C[k], r, 0.3)
    place(ea.sfx, G.breeze(ea.DUR, r, 0.3), 0, 0.35)                                               # cold night air
    for k in range(5): fx(thud(r, 60 + 6 * k, 0.6), 6 + k * 14, r.uniform(-0.4, 0.4), 0.3)          # ice landing on deck
    for k in range(3): fx(tick(r, 1500, 0.05), at("time", "night") + 14 + k * 9, 0.3, 0.5)          # the bell
    fx(thud(r, 48, 1.2), at("scrape", "Too") - 1, 0, 0.7)
    for k in range(9): fx(scratch(r, 0.3), C["side"] + k * 6, r.uniform(-0.3, 0.3), 0.4)            # ice along the plates
    fx(widen(G.whoosh(1.6, r, peak=0.3, f_lo=200, f_hi=2500), r), C["below"], 0, 0.6)               # water coming in
    for k in range(6): fx(G.boot(r, 0.6), C["below"] + 6 + k * 7, -0.2, 0.2)
    for k in range(16): fx(tick(r, 2100, 0.03 if k % 3 else 0.09), C["wireless"] + 8 + k * 5, 0.25, 0.3)   # the key
    fx(whistle(), C["order"] + 2, -0.2, 0.12)
    for k in range(4): fx(tick(r, 2600 + 200 * k, 0.02), at("count", "count") + k * 5, 0.2, 0.25)
    fx(widen(G.whoosh(1.2, r, peak=0.25, f_lo=150, f_hi=1800), r), C["cliff"] + 8, 0, 0.5)          # the deck goes
    fx(thud(r, 44, 1.2), C["cliff"] + 30, 0, 0.6)
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
    os.makedirs(os.path.join(ROOT, "public", "titanic"), exist_ok=True)
    write_wav(os.path.join(ROOT, "public", "titanic", "mix-1.wav"), mix, 16)
    print("mix: %.2f s, %.1f LUFS, true peak %.1f dBTP | voice %.1f, music %.1f, sfx %.1f LUFS" % (mix.shape[1] / SR, integrated(mix), true_peak(mix), integrated(voice), integrated(m), integrated(s)))

if __name__ == "__main__":
    main()

# Sound for the short "I Survived the Titanic: Part 2" (37 s): the house score plus effects, every cue on a word.
# usage: python audio/titanic2_audio.py -> public/titanic/mix-2.wav
import json, os, re, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import emu_long_audio as el  # noqa: E402
import emu_audio as ea  # noqa: E402
from emu_audio import I, G, F, fr, rng, r_, add, roll, thud, tick, scratch, cut_whoosh, fx  # noqa: E402
from dsp import SR, ns, dbg, place, widen, make_ir, convolve_st, integrated, true_peak, read_wav, write_wav, tt, phase  # noqa: E402

TOTAL = 1110
ea.TOTAL = TOTAL; ea.DUR = TOTAL / 30; ea.N = ns(ea.DUR); N = ea.N
ea.music = {k: np.zeros((2, N)) for k in ("low", "mid", "mel", "drum")}
ea.sfx = np.zeros((2, N))
t = fr
ROOT = os.path.dirname(HERE)
NAME = "titanic-2"
WORDS = json.load(open(os.path.join(ROOT, "voice", NAME, "words.json"), encoding="utf-8"))
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
def at(line, word=None, n=0):
    L = [w for w in WORDS if w["line"] == line]
    if word is None: return round(L[0]["a"] * 30)
    return round([w for w in L if norm(w["w"]) == norm(word)][n]["a"] * 30)
def whistle(dur=0.55):
    """an officer's pea whistle"""
    x = tt(dur); y = np.sin(phase(2750 * (1 + 0.04 * np.sin(2 * np.pi * 34 * x)))) * (0.6 + 0.4 * np.sin(2 * np.pi * 34 * x))
    return y * np.minimum(1, x / 0.02) * np.minimum(1, (dur - x) / 0.05)

# the cuts (same frames as S in src/videos/style2d/titanic2.tsx)
C = {"truth": at("truth") - 1, "recap": at("recap") - 1, "sink": at("recap", "She") - 2, "order": at("order") - 1, "child": at("child") - 1, "seats": at("seats") - 1,
     "gone": at("gone") - 1, "none": at("gone", "Then") - 2, "help": at("help") - 1, "left": at("left") - 1, "cliff": at("cliff") - 1}

def build_music():
    tim = lambda f, m=43, v=0.75: add("drum", I.timpani(F(m), v, r_()), t(f), 0)
    cym = lambda f, v=0.4: add("drum", I.cymbal(v, r_()), t(f), 0.1)
    glock = lambda f, m, v=0.5: add("mel", I.glock(F(m), v, r_()), t(f), 0.2)
    tim(0, 38, 0.85); el.stab(2, 0.6, (57, 60, 65)); cym(4, 0.5); el.trombone(at("hook", "not") + 2, 55)
    el.pizz(t(C["truth"] + 3), [(0, 1, 69), (1, .5, 65), (1.5, .5, 69), (2, 1, 72)], 0.45)
    tim(C["recap"], 36, 0.9); el.stab(C["recap"], 0.6, (56, 59, 65)); cym(C["recap"] + 2, 0.5)
    el.sad(t(C["sink"] + 2), ((0, 2, 62), (2, 2, 58)))
    tim(C["order"], 43, 0.7); el.sneak(t(C["order"] + 4), 2); el.trombone(at("order", "stay") + 4, 55)
    el.light(t(C["child"] + 2), 2, 0.4); glock(at("child", "boat") + 2, 88)
    el.pizz(t(C["seats"] + 3), [(0, .5, 62), (.5, .5, 64), (1, .5, 65), (1.5, .5, 67)], 0.45); tim(at("seats", "1,178") - 1, 43, 0.75); el.stab(at("seats", "1,178") - 1, 0.5)
    el.sad(t(at("seats", "Only") - 2), ((0, 2, 60), (2, 2, 57))); tim(at("seats", "700") - 1, 38, 0.8)
    el.sad(t(C["gone"] + 3), ((0, 2, 64), (2, 2, 60))); tim(at("gone", "none") - 1, 36, 0.85)
    el.sneak(t(C["help"] + 2), 2); el.trombone(at("help", "four") + 2, 53)
    roll(t(C["left"]), t(at("left", "1,500") - 1), 0.15, 0.6); tim(at("left", "1,500") - 1, 38, 0.9); el.stab(at("left", "1,500") - 1, 0.55, (56, 59, 65))
    roll(t(C["cliff"] - 6), t(at("cliff", "shoes")), 0.2, 0.7); tim(at("cliff", "shoes"), 36, 0.9); el.stab(at("cliff", "shoes"), 0.6, (56, 59, 65)); cym(at("cliff", "shoes") + 2, 0.5)
    tb = t(TOTAL - 34); add("low", I.brass(F(41), 0.3, 0.9, r_(), "tuba"), tb, -0.08); tim(TOTAL - 34, 36, 0.8)
    m = ea.music
    mix = 0.9 * m["low"] + 0.75 * m["mid"] + 0.8 * m["mel"] + 0.7 * m["drum"]
    wet = convolve_st(0.3 * m["mid"] + 0.5 * m["mel"] + 0.35 * m["drum"] + 0.15 * m["low"], make_ir(1.6, 7, hf=0.5))[:, :N]
    return mix + 0.25 * wet

def build_sfx():
    r = rng(413)
    for k in C: cut_whoosh(C[k], r, 0.3)
    place(ea.sfx, G.breeze(ea.DUR, r, 0.3), 0, 0.35)                                                # cold night air
    for k in range(6): fx(scratch(r, 0.28), 4 + k * 13, r.uniform(0.1, 0.5), 0.3)                    # the falls creaking as the boat goes down
    for k in range(4): fx(scratch(r, 0.2), C["truth"] + 8 + k * 16, r.uniform(-0.4, 0.2), 0.2)       # the suitcase sliding
    fx(thud(r, 48, 1.2), C["recap"], 0, 0.7)                                                         # the ice
    fx(widen(G.whoosh(1.5, r, peak=0.25, f_lo=150, f_hi=1800), r), C["sink"] + 4, 0, 0.5)            # the bow going under
    fx(whistle(), C["order"] + 2, 0.2, 0.12)
    for k in range(3): fx(G.boot(r, 0.6), at("order", "So") + k * 6, -0.3, 0.2)                      # he steps back
    fx(widen(G.whoosh(0.7, r, peak=0.2, f_lo=300, f_hi=2600), r), at("child", "lift") - 2, 0.1, 0.4) # up she goes
    fx(thud(r, 90, 0.5), at("child", "boat") + 2, 0.3, 0.3)
    for k in range(5): fx(tick(r, 2600 + 120 * k, 0.02), C["seats"] + 4 + k * 6, 0.2, 0.25)          # the boats counted in
    for k in range(7): fx(widen(G.whoosh(0.5, r, peak=0.12, f_lo=200, f_hi=1400), r), C["gone"] + 4 + k * 11, r.uniform(-0.4, 0.1), 0.35)   # oars
    for k in range(3): fx(scratch(r, 0.3), C["none"] + 6 + k * 13, r.uniform(-0.2, 0.4), 0.25)       # the empty falls
    for k in range(4): fx(tick(r, 1300, 0.02), at("help", "cannot") + k * 8, 0.3, 0.3)               # the clock
    fx(widen(G.whoosh(2.2, r, peak=0.3, f_lo=150, f_hi=2000), r), C["cliff"] + 2, 0, 0.6)            # the sea comes up the deck
    for k in range(3): fx(G.boot(r, 0.5), at("cliff", "shoes") + 2 + k * 7, 0.1, 0.25)
    fx(thud(r, 44, 1.2), at("cliff", "shoes"), 0, 0.6)
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
    write_wav(os.path.join(ROOT, "public", "titanic", "mix-2.wav"), mix, 16)
    print("mix: %.2f s, %.1f LUFS, true peak %.1f dBTP | voice %.1f, music %.1f, sfx %.1f LUFS" % (mix.shape[1] / SR, integrated(mix), true_peak(mix), integrated(voice), integrated(m), integrated(s)))

if __name__ == "__main__":
    main()

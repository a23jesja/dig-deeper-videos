# Sound for the long film "The Pig War" (3 min 3 s): the house score scene by scene, plus effects.
# Every cue sits on a word of the voice, like the picture (src/videos/emu/storyPL.ts).
# usage: python audio/pig_long_audio.py -> public/pig/mix-long.wav
import json, os, re, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import emu_long_audio as el  # noqa: E402
import emu_audio as ea  # noqa: E402
from emu_audio import I, G, F, Q, fr, rng, r_, add, roll, gunshot, thud, tick, scratch, cut_whoosh, fx  # noqa: E402
from dsp import SR, ns, dbg, pan, place, widen, make_ir, convolve_st, integrated, true_peak, read_wav, write_wav, lp, tt, phase  # noqa: E402

TOTAL = 5490
ea.TOTAL = TOTAL; ea.DUR = TOTAL / 30; ea.N = ns(ea.DUR); N = ea.N
ea.music = {k: np.zeros((2, N)) for k in ("low", "mid", "mel", "drum")}
ea.sfx = np.zeros((2, N))
t = fr
ROOT = os.path.dirname(HERE)
NAME = "pig-long"
WORDS = json.load(open(os.path.join(ROOT, "voice", NAME, "words.json"), encoding="utf-8"))
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
def at(line, word=None, n=0):
    L = [w for w in WORDS if w["line"] == line]
    if word is None: return round(L[0]["a"] * 30)
    return round([w for w in L if norm(w["w"]) == norm(word)][n]["a"] * 30)
def oink(r, f0=230, dur=0.2):
    x = tt(dur); f = f0 * (1 - 0.25 * x / dur) * (1 + 0.05 * np.sin(2 * np.pi * 38 * x))
    y = np.sign(np.sin(phase(f))) * 0.5 + np.sin(phase(f)) + 0.5 * np.sin(3 * phase(f))
    return lp(y, 1500, 2) * np.sin(np.pi * x / dur) ** 0.6

OFF = {"hook2": 4, "hook3": 4, "intro": 5, "treaty": 5, "two": 4, "both": 4, "sheep": 5, "settlers": 4, "morning": 4, "bang": 3, "owner": 3, "offer": 3, "quote": 4, "arrest": 4,
       "pickett": 5, "bunker": 3, "ships": 4, "grow": 4, "fort": 4, "order": 5, "baynes": 3, "scott": 5, "deal": 4, "camps": 4, "twelve": 4, "friends": 3, "alcohol": 4, "kaiser": 5,
       "verdict": 4, "leave": 5, "count": 4, "flag": 5, "end": 5, "outro": 4}
A = {k: at(k) - v for k, v in OFF.items()}
BANG = at("bang", "shoots") + 3
RACE = at("friends", "They") - 3

def build_music():
    tim = lambda f, m=43, v=0.75: add("drum", I.timpani(F(m), v, r_()), t(f), 0)
    cym = lambda f, v=0.4: add("drum", I.cymbal(v, r_()), t(f), 0.1)
    glock = lambda f, m, v=0.5: add("mel", I.glock(F(m), v, r_()), t(f), 0.2)
    tim(0); roll(0.05, t(A["hook2"] - 6), 0.15, 0.5)
    for k, w in enumerate(["warships", "cannons", "thousands"]): add("low", I.brass(F([43, 45, 47][k]), 0.4, 0.55, r_(), "tuba"), t(at("hook1", w)), -0.08)
    roll(t(A["hook2"]), t(A["hook3"] - 4), 0.3, 0.7); tim(A["hook3"], 38, 0.9); el.stab(at("hook3", "pig") - 2, 0.55); cym(at("hook3", "pig") + 6)
    el.pizz(t(A["intro"] + 4), [(0, 1, 74), (1, .5, 71), (1.5, .5, 74), (2, 1, 79), (3, 1, 76), (4, 2, 74)])                         # "I'm Sir Digsworth"
    el.light(t(A["treaty"] + 2), 6, 0.4)                                                                                            # the treaty, the map
    el.pizz(t(A["both"] + 2), [(0, 1, 62), (1, 1, 66), (2, 1, 69), (4, 1, 62), (5, 1, 67)], 0.45)                                   # mine! mine!
    el.light(t(A["sheep"] + 2), 4, 0.42)                                                                                            # the sheep farm
    el.march(t(A["settlers"] + 2), 3, 0.45)                                                                                         # the settlers
    el.sneak(t(A["morning"] + 2), 4)                                                                                                # a pig in the potatoes
    cym(BANG + 1, 0.45); tim(BANG + 2, 36, 0.8)
    el.trombone(at("owner", "Griffin") + 6, 56)
    el.pizz(t(A["offer"] + 2), [(0, .5, 74), (1, .5, 71), (3, .5, 62), (4, 1, 59)], 0.5)                                            # $10 / $100
    el.pizz(t(A["quote"] + 4), [(0, 1, 67), (1, 1, 71), (2, 2, 74), (5, 1, 72), (6, 1, 71), (7, 2, 67), (10, .5, 62), (10.5, .5, 66), (11, 1, 69)], 0.42)
    el.tension(t(A["arrest"]), t(A["pickett"] - 4))
    el.march(t(A["pickett"] + 2), 3, 0.52); cym(at("bunker", "Bunker") + 4, 0.4)                                                    # Pickett and his 66
    tim(A["ships"] + 2, 40, 0.6); el.stab(at("ships", "3") - 2, 0.5, (55, 59, 62))
    el.tension(t(A["grow"] + 2), t(A["fort"] - 6), t(at("grow", "5") - 4))                                                          # the build-up
    el.light(t(A["fort"] + 2), 4, 0.4); glock(at("fort", "polite"), 91)                                                             # the fort; Robert's Rules
    el.sneak(t(A["order"] + 2), 2)                                                                                                  # the governor
    el.pizz(t(A["baynes"] + 2), [(0, 1, 62), (1, 1, 66), (2, 2, 69)], 0.45); el.trombone(at("baynes", "refuses") + 2, 58)           # the admiral refuses
    el.pizz(t(at("baynes", "He") - 2), [(0, 1, 67), (1, 1, 64), (2, 1, 62), (4, 1, 59), (5, 1, 62), (6, 2, 67)], 0.42)
    el.march(t(A["scott"] + 2), 2, 0.45)                                                                                            # General Scott
    el.pizz(t(A["deal"] + 2), [(0, 1, 67), (1, 1, 71), (2, 2, 74), (4, 1, 76), (5, 1, 74), (6, 2, 71)], 0.42); glock(at("deal", "100"), 86)
    el.pizz(t(A["camps"] + 2), [(0, 1, 74), (1, 1, 71), (3, 1, 62), (4, 1, 66)], 0.45)
    tim(at("twelve", "12") - 2, 43, 0.7); glock(at("twelve", "12") - 1, 91)
    el.light(t(A["friends"] + 2), 2, 0.42); el.gallop(t(RACE), 1)                                                                   # holidays; the race
    el.trombone(A["alcohol"] + 10, 55); el.sneak(t(A["alcohol"] + 40), 2)                                                           # alcohol
    el.pizz(t(A["kaiser"] + 2), [(0, 1, 62), (1, 1, 66), (2, 2, 69), (4, 1, 74), (5, 1, 72), (6, 2, 69)], 0.45)                      # the referee
    va = at("verdict", "American") - 3
    roll(t(A["verdict"] + 2), t(va - 2), 0.15, 0.6); tim(va, 38, 0.85); el.stab(va, 0.55, (62, 66, 69)); cym(va + 1)
    el.sad(t(A["leave"] + 2), ((0, 2, 62), (2, 2, 59), (4, 3, 55)))                                                                 # the marines sail home
    tim(at("count", "13") - 2, 43, 0.6); tim(at("count", "one") - 2, 38, 0.8); el.stab(at("count", "pig") - 2, 0.5)
    el.light(t(A["flag"] + 2), 4, 0.42)                                                                                             # today
    el.pizz(t(A["end"] + 2), [(0, 1, 74), (1, .5, 71), (1.5, .5, 74), (2, 1, 79), (3, 1, 76), (4, 2, 79)], 0.5)
    el.pizz(t(A["outro"] + 2), [(0, .5, 67), (1, .5, 71), (2, 1, 74)], 0.45)
    tb = t(TOTAL - 22); add("low", I.brass(F(43), 0.3, 0.65, r_(), "tuba"), tb, -0.08); add("drum", I.snare(0.7, r_()), tb, 0.12); el.stab(TOTAL - 22, 0.5)
    m = ea.music
    mix = 0.9 * m["low"] + 0.75 * m["mid"] + 0.8 * m["mel"] + 0.7 * m["drum"]
    wet = convolve_st(0.3 * m["mid"] + 0.5 * m["mel"] + 0.35 * m["drum"] + 0.15 * m["low"], make_ir(1.1, 7, hf=0.6))[:, :N]
    return mix + 0.22 * wet

def build_sfx():
    r = rng(97)
    place(ea.sfx, G.breeze(ea.DUR, r, 0.35), 0, 0.5)
    place(ea.sfx, pan(G.bird_chirps(ea.DUR, r, 0.25, "blackbird"), -0.4), 0, 0.05)
    for k in ["hook3", "two", "bang", "owner", "quote", "bunker", "baynes", "deal", "verdict", "outro"]: cut_whoosh(A[k], r, 0.32)
    cut_whoosh(RACE, r, 0.32); cut_whoosh(at("arrest", "So") - 3, r, 0.32)
    fx(widen(G.whoosh(0.7, r, peak=0.3, f_lo=600, f_hi=5000), r), A["intro"] - 8, 0, 0.5)
    fx(oink(r), at("hook3", "pig") + 2, 0, 0.5); fx(oink(r, 250, 0.16), at("hook3", "pig") + 9, 0, 0.4)
    fx(oink(r, 240, 0.2), at("intro", "Pig") + 4, -0.3, 0.4)
    fx(scratch(r, 0.2), at("treaty", "treaty") - 2, 0, 0.3); fx(thud(r, 85, 0.6), at("treaty", "1846") - 2, 0, 0.4)
    for w in ["two", "San"]: fx(scratch(r, 0.16), at("two", w) - 2, 0.2, 0.3)
    for f in [at("both", "say") - 2, at("both", "say") + 8]: fx(tick(r, 1800, 0.02), f, 0, 0.3)
    for k, f0 in enumerate([520, 470, 500]):                                               # sheep
        x = tt(0.45); y = np.sign(np.sin(phase(f0 * (1 + 0.06 * np.sin(2 * np.pi * 9 * x))))) * np.sin(np.pi * x / 0.45) ** 0.6
        fx(lp(y, 1800, 2), A["sheep"] + 30 + k * 60, 0.4 - 0.4 * k, 0.07)
    lets = at("sheep", "lets") - 4
    for k in range(3): fx(oink(r, 220 + 20 * k, 0.18), lets + 20 + k * 30, 0.3 - 0.3 * k, 0.35)
    for k in range(10): fx(G.boot(r, 0.6), A["settlers"] + 4 + k * 4, r.uniform(-0.3, 0.3), 0.16)
    for k in range(6): fx(tick(r, 1500, 0.02), at("settlers", "plants") - 2 + k * 5, 0, 0.25)
    for k in range(16): fx(tick(r, 420, 0.03), A["morning"] + 8 + k * 13, 0.3, 0.2)        # munching
    fx(oink(r, 210, 0.18), A["morning"] + 60, 0.3, 0.3)
    fx(gunshot(r, 1.4), BANG, -0.1, 0.9); fx(oink(r, 330, 0.3), BANG + 3, 0.2, 0.5); fx(thud(r, 70, 0.9), BANG + 5, 0.2, 0.6)
    for k in range(4): fx(G.boot(r, 0.7), A["owner"] + 2 + k * 4, -0.3, 0.2)
    fx(tick(r, 2600, 0.02), at("offer", "10") - 2, 0.3, 0.4); fx(tick(r, 2200, 0.02), at("offer", "100") - 2, -0.3, 0.45)
    for f in [at("quote", "it") - 2, at("quote", "it", 1) - 2]: fx(tick(r, 1800, 0.02), f, 0, 0.3)
    for k in range(34): fx(G.boot(r, 0.9), A["pickett"] + 2 + k, r.uniform(-0.5, 0.5), 0.16)   # sixty-six pairs of boots
    fx(thud(r, 60, 0.8), at("pickett", "66") - 2, 0, 0.5)
    for k in range(3): fx(widen(G.whoosh(0.6, r, peak=0.2), r), at("ships", "3") - 14 + k * 6, 0, 0.25)
    for w in ["461", "14", "5", "70", "2,140"]: fx(thud(r, 60, 0.8), at("grow", w) - 2, 0, 0.5)
    for k in range(8): fx(tick(r, 300, 0.03), A["fort"] + 6 + k * 9, r.uniform(-0.3, 0.3), 0.25)   # digging
    fx(tick(r, 1100, 0.03), at("fort", "polite") - 3, 0, 0.5); fx(tick(r, 1100, 0.03), at("fort", "polite") + 3, 0, 0.45)   # the gavel
    fx(scratch(r, 0.2), at("baynes", "refuses") - 3, 0, 0.35)
    fx(scratch(r, 0.2), at("deal", "deal") - 2, 0, 0.3); fx(thud(r, 60, 0.7), at("deal", "100") - 2, 0, 0.4)
    fx(tick(r, 3000, 0.03), at("friends", "holidays") + 4, 0, 0.5)                              # the mugs
    for k in range(12): fx(G.boot(r, 0.5), RACE + 2 + k * 5, r.uniform(-0.4, 0.4), 0.16)
    for f in [A["alcohol"] + 30, at("alcohol", "alcohol") - 2]: fx(tick(r, 2400, 0.04), f, -0.2, 0.35)   # hic
    fx(thud(r, 85, 0.7), at("verdict", "American") - 3, 0, 0.6)                                 # the stamp
    fx(widen(G.whoosh(0.9, r, peak=0.2), r), A["leave"] + 6, 0, 0.25)
    for k in range(14): fx(tick(r, 900, 0.015), at("flag", "British") - 10 + k * 5, 0, 0.18)    # the halyard
    fx(oink(r, 240, 0.2), A["outro"] + 30, 0.2, 0.4); fx(oink(r, 260, 0.16), A["outro"] + 50, -0.2, 0.35)
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
    mix[:, -ns(0.3):] *= np.linspace(1, 0, ns(0.3))[None, :]
    os.makedirs(os.path.join(ROOT, "public", "pig"), exist_ok=True)
    write_wav(os.path.join(ROOT, "public", "pig", "mix-long.wav"), mix, 16)
    print("mix: %.2f s, %.1f LUFS, true peak %.1f dBTP | voice %.1f, music %.1f, sfx %.1f LUFS" % (mix.shape[1] / SR, integrated(mix), true_peak(mix), integrated(voice), integrated(m), integrated(s)))

if __name__ == "__main__":
    main()

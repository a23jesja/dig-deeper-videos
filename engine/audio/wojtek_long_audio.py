# Sound for the long Wojtek film (3 min 7 s): the house march score, re-voiced scene by scene, plus effects.
# Every cue is placed on a word of the voice, the same way the picture is (src/videos/emu/storyWL.ts).
# usage: python audio/wojtek_long_audio.py -> public/wojtek/mix-long.wav
import json, os, re, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import emu_long_audio as el  # noqa: E402
import emu_audio as ea  # noqa: E402
from emu_audio import I, G, F, Q, fr, rng, r_, add, roll, gunshot, thud, tick, scratch, cut_whoosh, fx, engine  # noqa: E402
from dsp import SR, ns, dbg, pan, place, widen, make_ir, convolve_st, integrated, true_peak, read_wav, write_wav, lp, tt, phase, fades  # noqa: E402
from wojtek_short_audio import growl  # noqa: E402

TOTAL = 5605
ea.TOTAL = TOTAL; ea.DUR = TOTAL / 30; ea.N = ns(ea.DUR); N = ea.N
ea.music = {k: np.zeros((2, N)) for k in ("low", "mid", "mel", "drum")}
ea.sfx = np.zeros((2, N))
t = fr
ROOT = os.path.dirname(HERE)
WORDS = json.load(open(os.path.join(ROOT, "voice", "wojtek-long", "words.json"), encoding="utf-8"))
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
def at(line, word=None, n=0):
    L = [w for w in WORDS if w["line"] == line]
    if word is None: return round(L[0]["a"] * 30)
    return round([w for w in L if norm(w["w"]) == norm(word)][n]["a"] * 30)
# first frame of the shots (as in storyWL.ts)
A = {1: 0, 2: at("hook3") - 4, 3: at("intro") - 5, 4: at("iran") - 5, 5: at("boy") - 4, 6: at("buy") - 3, 7: at("join") - 4, 8: at("milk") - 3, 9: at("name") - 3, 10: at("menu") - 5,
     11: at("beer") - 3, 12: at("cig") - 3, 13: at("coffee") - 4, 14: at("coffee", "And") - 3, 15: at("copy") - 4, 16: at("travel") - 4, 17: at("problem") - 4, 18: at("ship") - 4,
     19: at("idea") - 3, 20: at("enlist") - 5, 21: at("papers") - 3, 22: at("keepers") - 3, 23: at("tents") - 3, 24: at("tents", "or") - 3, 25: at("sail") - 4, 26: at("cassino") - 6,
     27: at("ninety") - 3, 28: at("job") - 3, 29: at("job", "One") - 3, 30: at("carry") - 4, 31: at("doubt") - 4, 32: at("doubt", "But") - 3, 33: at("badge") - 4, 34: at("corporal") - 3,
     35: at("scot") - 6, 36: at("locals") - 3, 37: at("demob") - 3, 38: at("demob", "Wojtek") - 3, 39: at("visit") - 3, 40: at("throw") - 3, 41: at("tv") - 3, 42: at("polish") - 3,
     43: at("big") - 6, 44: at("died") - 3, 45: at("statues") - 5, 46: at("end1") - 4, 47: TOTAL}
GUNS1 = [at("hook1", "carried") - 2, at("hook1", "guns") + 6, at("hook2", "beer") + 16]
GUNS26 = list(range(A[26] + 12, A[33] - 24, 43))
HE, NV, SET = at("carry", "He") - 3, at("carry", "never") - 4, at("carry", "dropped") + 2

def build_music():
    tim = lambda f, m=43, v=0.75: add("drum", I.timpani(F(m), v, r_()), t(f), 0)
    cym = lambda f, v=0.4: add("drum", I.cymbal(v, r_()), t(f), 0.1)
    glock = lambda f, m, v=0.5: add("mel", I.glock(F(m), v, r_()), t(f), 0.2)
    tim(0, 43, 0.75); roll(0.05, t(A[2] - 6), 0.15, 0.5)
    for k, f in enumerate([at("hook1", "soldier"), at("hook2"), at("hook2", "liked")]): add("low", I.brass(F([43, 45, 47][k]), 0.4, 0.55, r_(), "tuba"), t(f), -0.08)
    tim(A[2], 38, 0.9); el.stab(A[2], 0.55); cym(A[2] + 12)
    el.pizz(t(A[3] + 4), [(0, 1, 74), (1, .5, 71), (1.5, .5, 74), (2, 1, 79), (3, 1, 76), (4, 2, 74), (6, 1, 71), (7, 1, 67)])           # "I'm Sir Digsworth"
    el.light(t(A[4] + 2), 3, 0.42)                                                                                                    # the road through Iran
    el.pizz(t(A[5] + 4), [(0, 1, 67), (1, 1, 71), (2, 2, 74), (4, 1, 72), (5, 1, 71), (6, 2, 69)], 0.42)                              # a boy and a cub
    el.sad(t(at("boy", "Hunters") - 6), ((0, 2, 62), (2, 2, 59), (4, 3, 55)))
    el.pizz(t(A[6] + 2), [(0, .5, 62), (.5, .5, 66), (1, .5, 69), (1.5, 1, 74)], 0.45); glock(at("buy", "cub"), 86)
    el.march(t(A[7] + 2), 2, 0.45)                                                                                                    # the transport company
    el.pizz(t(A[8] + 4), [(0, 1, 67), (1, 1, 71), (2, 2, 74), (4, 1, 72), (5, 1, 71), (6, 2, 67), (8, 1, 66), (9, 1, 67)], 0.4)       # milk
    glock(at("name", "Wojtek"), 86); glock(at("name", "Wojtek") + 6, 91, 0.4)
    el.light(t(A[10] + 2), 4, 0.42)                                                                                                   # the menu, the beer
    el.sneak(t(A[12] + 2), 2)                                                                                                         # cigarettes
    el.pizz(t(A[13] + 2), [(0, .5, 74), (1, .5, 76), (2, 1, 79)], 0.45)                                                               # coffee
    el.sad(t(A[14] + 2), ((0, 2, 67), (2, 2, 64), (4, 3, 62)))                                                                        # cold nights
    el.march(t(A[15] + 2), 3, 0.5); cym(at("copy", "wrestles") + 17, 0.35)                                                            # wrestle, salute, march
    el.gallop(t(A[16] + 2), 2)                                                                                                        # Iraq, Syria, Egypt
    el.trombone(at("problem", "problem") + 6); tim(A[17] + 2, 40, 0.5)
    el.pizz(t(A[18] + 4), [(0, 1, 62), (1, 1, 66), (2, 1, 69), (3, 1, 74)], 0.42)
    el.sad(t(at("ship", "And") - 2), ((0, 2, 62), (2, 2, 59), (4, 3, 55)))                                                            # no pets
    el.pizz(t(A[19] + 2), [(0, .5, 62), (1, .5, 66), (2, .5, 69)], 0.45); glock(at("idea", "idea"), 91)
    el.pizz(t(at("idea", "If") - 2), [(0, 1, 62), (1, 1, 66), (2, 1, 69), (4, .5, 74), (4.5, .5, 76), (5, 1, 78)], 0.45)
    el.stab(at("idea", "soldier") - 2, 0.5, (62, 66, 69)); cym(at("idea", "soldier") + 2)
    el.march(t(A[20] + 2), 3, 0.5); cym(at("enlist", "enlisted") + 1, 0.35)                                                           # enlisted
    for k, w in enumerate(["paybook", "rank", "serial"]): glock(at("papers", w) - 1, [79, 83, 86][k])
    el.sneak(t(A[22] + 2), 2)                                                                                                         # two keepers
    el.light(t(A[23] + 2), 2, 0.4)                                                                                                    # tents, the crate
    el.pizz(t(A[25] + 2), [(0, .5, 67), (.5, .5, 71), (1, .5, 74), (1.5, 1.5, 79)], 0.5); cym(A[25] + 30)                             # sails for Italy
    el.tension(t(A[26]), t(A[28]))                                                                                                    # Monte Cassino
    el.light(t(A[28] + 2), 3, 0.4, False)                                                                                             # the job
    h0 = at("job", "holds") - 2
    for k in range(4): glock(h0 + k * 5, 79 + [0, 2, 4, 7][k], 0.45)                                                                  # four shells
    tim(at("job", "hundred") - 3, 38, 0.7)
    el.march(t(A[30] + 2), 3, 0.52); tim(SET, 43, 0.8); cym(SET + 1)                                                                  # crate after crate
    el.sneak(t(A[31] + 2), 2)                                                                                                         # historians
    el.pizz(t(A[32] + 2), [(0, 1, 62), (1, 1, 66), (2, 1, 69), (4, 1, 74), (5, .5, 72), (5.5, .5, 71), (6, 2, 69)], 0.45)             # the British soldier
    el.pizz(t(A[33] + 2), [(0, 1, 67), (1, 1, 71), (2, 2, 74)], 0.45)
    bd = at("badge", "badge") + 3
    roll(t(bd - 40), t(bd - 2), 0.15, 0.6); tim(bd, 43, 0.8); el.stab(bd, 0.55)
    cw = at("corporal", "corporal") - 3
    tim(cw, 38, 0.85); el.stab(cw, 0.55, (62, 66, 69)); cym(cw + 1)
    el.light(t(A[35] + 2), 4, 0.42)                                                                                                   # Scotland, the locals
    el.sad(t(A[37] + 2), ((0, 3, 62), (3, 1, 59), (4, 4, 55), (8, 3, 57), (11, 1, 55), (12, 4, 50)))                                  # demobilised; the zoo
    el.pizz(t(A[39] + 2), [(0, 1, 67), (1, 1, 71), (2, 2, 74), (4, 1, 76), (5, 1, 74), (6, 2, 71)], 0.42)                             # old comrades
    el.pizz(t(A[40] + 2), [(0, .5, 62), (1, .5, 66), (2, .5, 69), (3, .5, 66), (4, .5, 62), (5, .5, 66), (6, 1, 69)], 0.42)           # cigarettes
    el.pizz(t(A[41] + 2), [(0, .5, 74), (.5, .5, 76), (1, .5, 78), (1.5, 1, 79), (3, .5, 78), (3.5, .5, 76), (4, 1, 74)], 0.45); glock(at("tv", "television"), 91)
    el.pizz(t(A[42] + 2), [(0, 1, 74), (1, .5, 71), (1.5, .5, 74), (2, 1, 79), (3, 1, 76), (4, 2, 79)], 0.5)                          # he still answers
    tim(A[43] + 4, 36, 0.7); add("low", I.brass(F(36), 0.8, 0.5, r_(), "tuba"), t(at("big", "nearly")), -0.08)                        # 500 kilos
    el.sad(t(A[44] + 2), ((0, 3, 67), (3, 1, 66), (4, 3, 62), (7, 1, 64), (8, 4, 67)))                                                # 1963
    el.pizz(t(A[45] + 2), [(0, 1, 67), (1, 1, 71), (2, 1, 74), (3, 1, 79), (4, 2, 76)], 0.45); glock(at("statues", "Krakow"), 91)     # statues
    tim(at("end1", "One"), 43, 0.6); tim(at("end1", "One", 1), 45, 0.65); tim(at("end2", "No"), 47, 0.8); cym(at("end2", "dropped") + 2)
    el.trombone(at("end3") + 4, 55)                                                                                                   # allegedly
    el.pizz(t(at("outro") - 2), [(0, .5, 67), (1, .5, 71), (2, 1, 74), (3, 1, 79)], 0.45)
    tb = t(TOTAL - 22)
    add("low", I.brass(F(43), 0.3, 0.65, r_(), "tuba"), tb, -0.08); add("drum", I.snare(0.7, r_()), tb, 0.12); el.stab(TOTAL - 22, 0.5)
    m = ea.music
    mix = 0.9 * m["low"] + 0.75 * m["mid"] + 0.8 * m["mel"] + 0.7 * m["drum"]
    wet = convolve_st(0.3 * m["mid"] + 0.5 * m["mel"] + 0.35 * m["drum"] + 0.15 * m["low"], make_ir(1.1, 7, hf=0.6))[:, :N]
    return mix + 0.22 * wet

def build_sfx():
    r = rng(83)
    place(ea.sfx, G.breeze(ea.DUR, r, 0.35), 0, 0.5)
    place(ea.sfx, pan(G.bird_chirps(ea.DUR, r, 0.25, "blackbird"), -0.4), 0, 0.05)
    for a, b in [(A[14], A[15]), (A[43], A[45])]: fx(fades(G.crickets(fr(b - a), r, 3), 0.4, 0.4), a, 0.3, 0.035)
    for f in [A[9], A[11], A[21], A[27], A[29], HE, NV, A[32], A[34], A[40]]: cut_whoosh(f, r, 0.35)
    fx(widen(G.whoosh(0.7, r, peak=0.3, f_lo=600, f_hi=5000), r), A[3] - 8, 0, 0.5)
    for f in GUNS1: fx(gunshot(r, 1.4), f, 0.3, 0.7); fx(thud(r, 48, 1.0), f + 18, -0.3, 0.45)
    for f in GUNS26:
        g = 0.75 if f < A[27] or A[28] <= f < A[29] else 0.4 if (A[30] <= f < HE or NV <= f < A[31]) else 0.22
        if not (A[29] <= f < A[30]): fx(gunshot(r, 1.4), f, -0.3, g); fx(thud(r, 48, 1.0), f + 18, 0.3, g * 0.6)
    fx(growl(r, 90, 0.5, True), A[2] + 6, 0, 0.5)                                         # "he was also a bear"
    fx(growl(r, 110, 0.4, True), at("intro", "Wojtek") + 2, 0, 0.35)
    for a, b, f0, f1 in [(A[4], A[5], 30, 34), (A[16], A[17], 40, 46), (A[24], A[25], 28, 32)]:   # the truck on the road
        d = fr(b - a); fx(fades(engine(d, r, [(0, f0), (d, f1)], 0.4), 0.3, 0.3), a, 0, 0.16)
    for k in range(12): fx(G.boot(r, 0.6), A[4] + 6 + int(k * 14), r.uniform(-0.3, 0.3), 0.12)
    fx(tick(r, 2600, 0.02), at("buy", "buys") - 2, 0.2, 0.4)                              # the coin
    fx(growl(r, 200, 0.3, True), at("buy", "cub") + 8, 0, 0.3); fx(growl(r, 190, 0.3, True), at("join", "joins") + 4, 0, 0.3)
    for k in range(6): fx(tick(r, 500, 0.03), at("milk", "feed") + 4 + k * 13, 0, 0.2)   # glug
    g0 = at("menu", "grows") - 2
    fx(thud(r, 70, 0.8), g0, 0, 0.7); fx(growl(r, 95, 0.4, True), g0 + 6, 0, 0.35)
    for w in ["fruit", "marmalade", "honey", "syrup"]: fx(scratch(r, 0.14), at("menu", w) - 2, 0.3, 0.3)     # chalk
    for k in range(4): fx(tick(r, 500, 0.03), at("beer", "beer") + 2 + k * 12, 0, 0.2)
    fx(scratch(r, 0.2), at("beer", "beer", 1) - 2, 0.3, 0.3)
    fx(tick(r, 900, 0.03), at("cig", "eats") - 3, 0, 0.35); fx(tick(r, 700, 0.03), at("cig", "eats") + 3, 0, 0.3)   # chomp
    fx(tick(r, 500, 0.03), at("coffee", "drinks") + 4, 0, 0.2)
    W = at("copy", "wrestles")
    fx(growl(r, 85, 0.5), W + 2, 0, 0.4); fx(thud(r, 60, 1.0), W + 17, 0.3, 0.8)
    M = at("copy", "marches") - 4
    for k in range(9): fx(G.boot(r, 0.8), M + int(k * 7.2), r.uniform(-0.3, 0.3), 0.2)
    for k in range(9): fx(G.boot(r, 0.5), A[18] + 4 + k * 8, 0.3, 0.13)                   # up the gangway
    fx(growl(r, 80, 0.7), at("ship", "no") + 4, 0, 0.35)
    fx(tick(r, 2600, 0.02), at("idea", "idea") - 2, 0.2, 0.4)
    fx(thud(r, 85, 0.7), at("enlist", "enlisted") - 2, -0.2, 0.6)                         # the stamp
    for w in ["paybook", "rank", "serial"]: fx(scratch(r, 0.12), at("papers", w) - 2, 0, 0.25)
    fx(growl(r, 95, 0.5, True), at("keepers", "looking"), 0, 0.35)
    fx(growl(r, 100, 0.4, True), A[25] + 14, 0, 0.3)
    for k in range(4): fx(tick(r, 1800, 0.02), at("job", "holds") - 2 + k * 5, 0, 0.3)
    fx(thud(r, 60, 0.9), at("job", "hundred") - 1, 0.3, 0.5)
    for k in range(7): fx(G.boot(r, 0.9), HE + 3 + k * 9, 0, 0.2)
    for k in range(5): fx(G.boot(r, 0.9), NV + 2 + k * 8, 0, 0.2)
    fx(thud(r, 75, 0.9), HE - 12, 0.3, 0.5); fx(thud(r, 75, 0.9), SET, 0.3, 0.8); fx(growl(r, 100, 0.4, True), SET + 10, 0, 0.4)
    fx(tick(r, 2600, 0.02), at("corporal", "corporal") - 3, 0.2, 0.4)
    for f, f0 in [(A[35] + 30, 520), (A[36] + 50, 470), (A[37] + 24, 500)]:                # sheep
        x = tt(0.45); y = np.sign(np.sin(phase(f0 * (1 + 0.06 * np.sin(2 * np.pi * 9 * x))))) * np.sin(np.pi * x / 0.45) ** 0.6
        fx(lp(y, 1800, 2), f, 0.4, 0.07)
    fx(thud(r, 85, 0.7), at("demob", "demobilised") - 3, 0, 0.55)
    th = [at("throw", "throw") + 1, at("throw", "cigarettes") + 2]
    for f in th: fx(widen(G.whoosh(0.4, r, peak=0.2), r), f, 0, 0.3); fx(tick(r, 900, 0.03), f + 17, 0, 0.3)
    fx(growl(r, 95, 0.4, True), at("throw", "eats"), 0, 0.35)
    for k in range(16): fx(tick(r, 1500, 0.008), A[41] + 6 + k * 6, 0.3, 0.12)            # the film camera turning
    fx(growl(r, 85, 0.6, True), at("polish", "answers") + 2, 0, 0.5)
    fx(thud(r, 50, 1.0), at("big", "nearly") - 2, 0, 0.5)
    return ea.sfx

def main():
    v, sr = read_wav(os.path.join(ROOT, "voice", "wojtek-long", "voice.wav")); assert sr == SR
    voice = np.zeros((2, N)); vv = v[0][:N]; voice[:, : len(vv)] = vv
    voice *= dbg(-16.0 - integrated(voice))
    m = build_music(); s = build_sfx()
    m *= dbg(-16.0 - 10.0 - integrated(m)); m *= ea.duck(WORDS, -3.0)[None, :]
    s *= ea.duck(WORDS, -2.0)[None, :]; s *= dbg(-8.0) / max(np.abs(s).max(), 1e-9)
    mix = voice + m + s
    mix *= dbg(-14.0 - integrated(mix)); mix = ea.limiter(mix)
    mix[:, -ns(0.3):] *= np.linspace(1, 0, ns(0.3))[None, :]
    os.makedirs(os.path.join(ROOT, "public", "wojtek"), exist_ok=True)
    write_wav(os.path.join(ROOT, "public", "wojtek", "mix-long.wav"), mix, 16)
    print("mix: %.2f s, %.1f LUFS, true peak %.1f dBTP | voice %.1f, music %.1f, sfx %.1f LUFS" % (mix.shape[1] / SR, integrated(mix), true_peak(mix), integrated(voice), integrated(m), integrated(s)))

if __name__ == "__main__":
    main()

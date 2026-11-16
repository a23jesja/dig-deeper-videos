# Sound for the long film "The Man Who Stole the Mona Lisa" (10 min 10 s): the house score chapter by chapter, plus
# effects, every cue on a word of the voice. Shot starts come from out/mona/shots.json (scripts/mona_shots.py).
# usage: python audio/mona_long_audio.py -> public/mona/mix-long.wav
import json, os, re, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import emu_long_audio as el  # noqa: E402
import emu_audio as ea  # noqa: E402
from emu_audio import I, G, F, Q, fr, rng, r_, add, roll, thud, tick, scratch, cut_whoosh, fx, patter  # noqa: E402
from dsp import SR, ns, dbg, pan, place, widen, make_ir, convolve_st, integrated, true_peak, read_wav, write_wav, lp, tt, phase  # noqa: E402

TOTAL = 18296
ea.TOTAL = TOTAL; ea.DUR = TOTAL / 30; ea.N = ns(ea.DUR); N = ea.N
ea.music = {k: np.zeros((2, N)) for k in ("low", "mid", "mel", "drum")}
ea.sfx = np.zeros((2, N))
t = fr
ROOT = os.path.dirname(HERE)
NAME = "mona-long"
WORDS = json.load(open(os.path.join(ROOT, "voice", NAME, "words.json"), encoding="utf-8"))
SHOTS = json.load(open(os.path.join(ROOT, "out", "mona", "shots.json"), encoding="utf-8"))
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
def at(line, word=None, n=0):
    L = [w for w in WORDS if w["line"] == line]
    if word is None: return round(L[0]["a"] * 30)
    m = [w for w in L if norm(w["w"]) == norm(word)]
    if len(m) <= n: raise KeyError(f"{line}: {word} ({n})")
    return round(m[n]["a"] * 30)
def end(line): return round([w for w in WORDS if w["line"] == line][-1]["b"] * 30)
BAR = 4 * Q * 30                                    # frames in a bar of four beats (about 57)
def bars(f0, f1, beats=4): return max(1, int((f1 - f0) / (beats * Q * 30)))
def whistle(dur=0.55):
    x = tt(dur); y = np.sin(phase(2750 * (1 + 0.04 * np.sin(2 * np.pi * 34 * x)))) * (0.6 + 0.4 * np.sin(2 * np.pi * 34 * x))
    return y * np.minimum(1, x / 0.02) * np.minimum(1, (dur - x) / 0.05)
def horn(dur=1.1):
    return lp(np.sign(np.sin(phase(np.full(ns(dur), 98.0)))) * np.sin(np.pi * tt(dur) / dur) ** 0.5, 500, 2)
def ring(dur=0.7):
    x = tt(dur); return np.sin(phase(np.full(ns(dur), 1900.0))) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 22 * x))) * np.minimum(1, (dur - x) / 0.05)

def build_music():
    tim = lambda f, m=43, v=0.75: add("drum", I.timpani(F(m), v, r_()), t(f), 0)
    cym = lambda f, v=0.4: add("drum", I.cymbal(v, r_()), t(f), 0.1)
    glock = lambda f, m, v=0.5: add("mel", I.glock(F(m), v, r_()), t(f), 0.2)
    major = (62, 66, 69)
    L = lambda f0, f1, vel=0.4, mel=True: el.light(t(f0), bars(f0, f1), vel, mel)
    M = lambda f0, f1, vel=0.46, mel=True: el.march(t(f0), bars(f0, f1), vel, mel)
    SN = lambda f0, f1: el.sneak(t(f0), bars(f0, f1))
    GA = lambda f0, f1: el.gallop(t(f0), bars(f0, f1, 2))
    SC = lambda f0, f1: el.scurry(t(f0), bars(f0, f1, 2))
    theme = lambda f: el.pizz(t(f), [(0, 1, 74), (1, .5, 71), (1.5, .5, 74), (2, 1, 79), (3, 1, 76), (4, 2, 74)])
    nobody = lambda f: el.trombone(f, 55)             # the running joke: "and nobody notices"
    a = at
    # ---- hook ----
    tim(0); SN(4, a("h_2") - 6); el.stab(a("h_2", "notice") - 2, 0.45)
    el.pizz(t(a("h_3")), [(0, 1, 62), (1, 1, 59), (2, 1, 55), (4, 1, 62), (5, 1, 59), (6, 2, 55)], 0.45)
    roll(t(a("h_4")), t(a("h_4", "famous") - 3), 0.12, 0.55); el.stab(a("h_4", "famous") - 2, 0.55, major); cym(a("h_4", "famous") - 1)
    theme(a("h_5")); L(a("h_5", "This"), end("h_5"), 0.38, False)
    # ---- 1. a small painting ----
    L(a("s1_1"), end("s1_2")); glock(a("s1_1", "smile"), 86); glock(a("s1_2", "Remember") - 2, 91)
    el.pizz(t(a("s1_3")), [(0, 1, 67), (1, 1, 71), (2, 1, 74), (3, 1, 79), (4, 1, 76), (5, 1, 74), (6, 2, 71), (8, 1, 69), (9, 1, 67), (10, 2, 62)], 0.45); glock(a("s1_3", "poplar") - 2, 88)
    M(a("s1_4"), end("s1_4")); cym(a("s1_4", "King") - 2, 0.35)
    el.pizz(t(a("s1_5")), [(0, 1, 74), (1, 1, 78), (2, 2, 81), (4, 1, 79), (5, 1, 78), (6, 2, 74)], 0.42); glock(a("s1_5", "love", 1) - 2, 93)
    L(a("s1_6"), end("s1_6"), 0.38, False)
    SN(a("s1_7"), a("s1_7", "towers") - 4); el.trombone(a("s1_7", "Notre-Dame") + 14, 58); el.pizz(t(a("s1_8")), [(0, .5, 67), (.5, .5, 71), (1, .5, 74), (1.5, 1.5, 79)], 0.5)
    # ---- 2. the man who fitted the glass ----
    L(a("s2_1"), end("s2_2")); el.stab(a("s2_2", "Vincenzo") - 2, 0.42)
    M(a("s2_3"), end("s2_3"), 0.42)
    el.tension(t(a("s2_4")), t(end("s2_4") - 20)); tim(a("s2_4", "fingerprints") - 3, 38, 0.8); glock(a("s2_4", "Remember") - 2, 91)
    SN(a("s2_5"), end("s2_6")); [glock(a("s2_6", "four") - 2 + k * 5, 84 + 2 * k, 0.4) for k in range(4)]
    el.stab(a("s2_7", "Monday") - 2, 0.5); cym(a("s2_7", "closed"), 0.3)
    # ---- 3. Monday morning ----
    tim(a("s3_1") - 4, 40, 0.7); SN(a("s3_1"), end("s3_4")); [glock(a("s3_1", "Seven") - 2 + k * 6, 79, 0.35) for k in range(3)]
    el.pizz(t(a("s3_5")), [(0, 1, 62), (1, 1, 59), (2, 2, 55)], 0.45); el.trombone(a("s3_5", "night") + 4, 56)
    L(a("s3_5", "By"), end("s3_5"), 0.38, False); glock(a("s3_5", "coat") - 2, 91)
    el.tension(t(a("s3_6")), t(end("s3_8") - 10), t(a("s3_6", "lifts") - 30)); cym(a("s3_6", "lifts") - 2, 0.3); glock(a("s3_8", "tucks") - 2, 88)
    SN(a("s3_9"), a("s3_9", "locked") - 6); tim(a("s3_9", "locked") - 3, 38, 0.85); el.stab(a("s3_9", "locked") - 3, 0.55)
    SC(a("s3_10"), a("s3_10", "footsteps") - 8); [tim(a("s3_10", "footsteps") - 3 + k * 9, 36, 0.5 + 0.08 * k) for k in range(4)]
    SN(a("s3_11"), end("s3_11")); el.stab(a("s3_12", "opens") + 6, 0.5, major); glock(a("s3_12", "opens") + 7, 93)
    L(a("s3_13"), end("s3_13"), 0.44); nobody(a("s3_14") + 2)
    # ---- 4. four hooks ----
    L(a("s4_1"), end("s4_1"), 0.38, False); el.pizz(t(a("s4_2")), [(0, 1, 67), (1, 1, 66), (2, 1, 64), (3, 1, 62), (5, 1, 67), (6, 1, 71), (7, 2, 74)], 0.42)
    L(a("s4_3"), a("s4_3", "finds") - 6); el.stab(a("s4_3", "finds") - 2, 0.5); SN(a("s4_4"), end("s4_4")); el.trombone(a("s4_5", "not") + 4, 57)
    el.tension(t(a("s4_6")), t(a("s5_1")), t(a("s4_6", "She") - 6)); tim(a("s5_1") - 2, 38, 0.9); el.stab(a("s5_1") - 2, 0.6); cym(a("s5_1") - 1)
    # ---- 5. the empty wall ----
    GA(a("s5_1") + 4, end("s5_3")); tim(a("s5_2", "Sixty") - 3, 40, 0.7)
    M(a("s5_4"), a("s5_4", "director") - 6); el.trombone(a("s5_4", "loses") + 6, 56)
    el.pizz(t(a("s5_5")), [(0, 1, 62), (1, 1, 64), (2, 1, 66), (3, 1, 67), (5, 1, 71), (6, 2, 74)], 0.45); el.stab(a("s5_5", "Who") - 2, 0.5)
    glock(a("s5_6", "strange") - 2, 86); glock(a("s5_6", "strange") + 8, 91)
    L(a("s5_7"), end("s5_7")); [glock(a("s5_7", "Four") - 2 + k * 5, 84 + 2 * k, 0.4) for k in range(4)]
    el.pizz(t(a("s5_8")), [(0, 1, 69), (1, 1, 72), (2, 2, 76), (4, 1, 74), (5, 1, 72), (6, 2, 69)], 0.42); el.stab(a("s5_8", "Franz") - 2, 0.45)
    L(a("s5_9"), end("s5_9"), 0.42)
    # ---- 6. the wrong men ----
    SN(a("s6_1"), end("s6_2")); el.stab(a("s6_1", "two") - 2, 0.45); tim(a("s6_2", "statues") - 3, 40, 0.6)
    L(a("s6_3"), end("s6_3"), 0.38); el.stab(a("s6_3", "Pablo") - 2, 0.5, major)
    SC(a("s6_4"), end("s6_4"))
    M(a("s6_5"), end("s6_5"), 0.44, False); tim(a("s6_5", "arrest") - 3, 38, 0.85); el.stab(a("s6_5", "arrest") - 3, 0.55)
    el.sad(t(a("s6_6")), ((0, 2, 62), (2, 2, 59), (4, 3, 55)))
    el.tension(t(a("s6_6", "Then")), t(a("s6_7", "never") - 6)); el.trombone(a("s6_7", "before") + 8, 55)
    el.pizz(t(a("s6_8")), [(0, 1, 62), (1, 1, 66), (2, 2, 69), (4, 1, 74), (5, 1, 72), (6, 2, 69)], 0.45)
    L(a("s6_9"), end("s6_9"), 0.4); [glock(a("s6_9", "But") + k * 6, 88 + 3 * k, 0.4) for k in range(2)]
    SN(a("s6_10"), a("s6_10", "knock") - 6)
    # ---- 7. the trunk ----
    SN(a("s7_1"), end("s7_2")); el.stab(a("s7_1", "And") - 2, 0.4)
    tim(a("s7_3") - 2, 38, 0.8); el.stab(a("s7_3") - 2, 0.55, major); glock(a("s7_3", "room") - 2, 93)
    el.pizz(t(a("s7_4")), [(0, 1, 62), (1, 1, 59), (2, 2, 55), (5, 1, 62), (6, 1, 59), (7, 2, 55)], 0.42); el.trombone(a("s7_4", "together") + 6, 56)
    L(a("s7_5"), end("s7_5"), 0.36, False); glock(a("s7_5", "false") - 2, 86); tim(a("s7_5", "most") - 3, 40, 0.6)
    el.sad(t(a("s7_6"))); [glock(a("s7_7") + k * 30, 79 - 2 * k, 0.3) for k in range(2)]
    el.sad(t(a("s7_8") + 20), ((0, 2, 62), (2, 2, 59), (4, 3, 55), (8, 2, 57), (10, 4, 50)))
    # ---- 8. a letter from Leonardo ----
    L(a("s8_1"), end("s8_1"), 0.42); SN(a("s8_2"), a("s8_2", "Leonardo") - 6); glock(a("s8_2", "Leonardo") - 2, 91); el.stab(a("s8_2", "Leonardo") - 2, 0.45, major)
    M(a("s8_3"), end("s8_3"), 0.42); L(a("s8_4"), end("s8_4"), 0.4, False)
    el.pizz(t(a("s8_5")), [(0, 1, 62), (1, 1, 66), (2, 1, 69)], 0.45); tim(a("s8_5", "Five") - 3, 38, 0.8); el.stab(a("s8_5", "Five") - 3, 0.5, major)
    el.tension(t(a("s8_6")), t(a("s8_6", "unwraps") + 14), t(a("s8_6", "lifts"))); cym(a("s8_6", "unwraps") + 14)
    SN(a("s8_7"), end("s8_7")); el.stab(a("s8_8", "real") - 2, 0.6, major); glock(a("s8_8", "real") - 1, 93); cym(a("s8_8", "real") - 1, 0.35)
    SC(a("s8_9"), end("s8_9")); tim(a("s8_10", "arrested") - 3, 38, 0.9); el.stab(a("s8_10", "arrested") - 3, 0.6)
    # ---- 9. why? ----
    el.pizz(t(a("s9_1")), [(0, .5, 62), (.5, .5, 66), (1, 1, 69)], 0.45)
    M(a("s9_2"), end("s9_2"), 0.44); el.trombone(a("s9_3", "never") + 2, 56)
    L(a("s9_3", "Leonardo"), end("s9_3"), 0.38, False)
    SN(a("s9_4"), a("s9_4", "fortune") - 8); glock(a("s9_4", "fortune") - 2, 91); el.stab(a("s9_4", "fortune") - 2, 0.45, major)
    SN(a("s9_5"), end("s9_5")); [glock(a("s9_5", "six") - 2 + k * 3, 79 + k, 0.35) for k in range(6)]
    el.pizz(t(a("s9_6")), [(0, 1, 74), (1, 1, 72), (2, 1, 71), (3, 1, 69)], 0.42); el.trombone(a("s9_6", "1932") + 4, 57)
    [glock(a("s9_6", w) - 2, m, 0.35) for w, m in (("marquis", 84), ("forger", 81), ("single", 77))]
    [el.stab(a("s9_7", w, n) - 2, 0.42, major) for w, n in (("One", 0), ("one", 1), ("painting", 0))]
    M(a("s9_8"), end("s9_8"), 0.48); cym(a("s9_8", "hero") - 2)
    SN(a("s9_9"), a("s9_9", "Soon") - 6); tim(a("s9_9", "one") - 3, 38, 0.8); glock(a("s9_9", "seven") - 2, 88); L(a("s9_9", "So"), end("s9_9") + 20, 0.44)
    # ---- 10. the star ----
    L(a("s10_1"), end("s10_1")); roll(t(a("s10_2")), t(a("s10_2", "returns") + 10), 0.12, 0.6); tim(a("s10_2", "returns") + 12, 38, 0.9); el.stab(a("s10_2", "returns") + 12, 0.6, major); cym(a("s10_2", "returns") + 13)
    [glock(a("s10_3") + 10 + k * 18, 86 + 3 * k, 0.4) for k in range(3)]
    L(a("s10_4"), end("s10_4"), 0.4); M(a("s10_5"), end("s10_5"), 0.48); cym(a("s10_5", "celebrity") - 2); cym(a("s10_5", "Today") - 2, 0.35)
    el.pizz(t(a("s10_6")), [(0, .5, 62), (.5, .5, 66), (1, 1, 69)], 0.42)
    M(a("s10_7"), a("s10_7", "Then") - 4, 0.4, False); el.pizz(t(a("s10_7", "Then")), [(0, 1, 67), (1, 1, 66), (2, 1, 64), (3, 2, 62)], 0.42)
    el.sad(t(a("s10_8")), ((0, 3, 67), (3, 1, 66), (4, 3, 62), (7, 1, 64), (8, 4, 67))); nobody(a("s10_9") + 2)
    el.sad(t(a("s10_10") + 10), ((0, 2, 62), (2, 2, 59), (4, 3, 55), (8, 2, 57), (10, 3, 50)))
    el.pizz(t(a("s10_11")), [(0, 1, 62), (1, 1, 59), (2, 2, 55)], 0.42); el.trombone(a("s10_11", "jail") + 2, 55)
    roll(t(a("s10_12")), t(a("s10_13", "masterpiece") - 3), 0.1, 0.6); el.stab(a("s10_13", "masterpiece") - 2, 0.55, major); cym(a("s10_13", "masterpiece") - 1)
    tim(a("s10_13", "famous") - 3, 38, 0.9); el.stab(a("s10_13", "famous") - 2, 0.6, (62, 66, 69, 74)); cym(a("s10_13", "famous") - 1); glock(a("s10_13", "famous"), 93)
    theme(a("s10_14")); glock(a("s10_14", "Mondays") - 2, 91)
    tb = t(TOTAL - 34); add("low", I.brass(F(43), 0.3, 0.65, r_(), "tuba"), tb, -0.08); add("drum", I.snare(0.7, r_()), tb, 0.12); el.stab(TOTAL - 34, 0.5)
    m = ea.music
    mix = 0.9 * m["low"] + 0.75 * m["mid"] + 0.8 * m["mel"] + 0.7 * m["drum"]
    wet = convolve_st(0.3 * m["mid"] + 0.5 * m["mel"] + 0.35 * m["drum"] + 0.15 * m["low"], make_ir(1.1, 7, hf=0.6))[:, :N]
    return mix + 0.22 * wet

def build_sfx():
    r = rng(211); a = at
    place(ea.sfx, G.breeze(ea.DUR, r, 0.3), 0, 0.3)
    for s in SHOTS:                                   # birds outdoors, a whoosh on every change of place
        if s["zone"] in ("paris", "scot", "dock"): place(ea.sfx, pan(G.bird_chirps((s["b"] - s["a"]) / 30, r, 0.25, "blackbird"), -0.4), t(s["a"]), 0.035)
        if s["x"] and s["id"] > 1: cut_whoosh(s["a"], r, 0.28)
    boots = lambda f0, n, step=8, p=0.0, g=0.16, hard=0.7: [fx(G.boot(r, hard), f0 + int(k * step), p + r.uniform(-0.15, 0.15), g) for k in range(n)]
    bump = lambda f, g=0.5, f0=80: fx(thud(r, f0, 0.8), f, 0, g)
    pip = lambda f, hz=2600, g=0.35: fx(tick(r, hz, 0.02), f, 0.2, g)
    # hook
    boots(2, 16, 9); bump(a("h_1", "Mona") - 3); bump(a("h_2", "more") - 3, 0.45); [pip(f, 1800) for f in (a("h_3") + 6, a("h_3", "more") - 4, a("h_3", "two") - 3)]
    fx(widen(G.whoosh(0.7, r, peak=0.3, f_lo=600, f_hi=5000), r), a("h_5") - 12, 0, 0.5); bump(a("h_5", "stole") - 3)
    # 1
    boots(a("s1_1"), 14, 13, 0, 0.1); pip(a("s1_2", "Seventy-seven") - 3, 2200); pip(a("s1_2", "fifty-three") - 3, 2400)
    fx(scratch(r, 0.2), a("s1_3") + 20, 0.2, 0.25); fx(scratch(r, 0.2), a("s1_3") + 60, 0.2, 0.25); bump(a("s1_3", "canvas") - 3, 0.4); pip(a("s1_3", "poplar") + 3)
    boots(a("s1_4"), 12, 10); bump(a("s1_4", "King") - 3); bump(a("s1_4", "four") - 3, 0.45)
    [pip(a("s1_5", "love", 1) - 3 + k * 5, 3000 + 200 * k, 0.25) for k in range(4)]
    boots(a("s1_6"), 14, 9, 0, 0.1); bump(a("s1_7", "towers") - 4); boots(a("s1_8") + 6, 8, 7); bump(a("s1_8") + 14, 0.4)
    # 2
    boots(a("s2_1"), 12, 11); pip(a("s2_1", "glass") - 3, 3400); bump(a("s2_2", "Vincenzo") - 3)
    bump(a("s2_3", "1881") - 3, 0.4); bump(a("s2_3", "house") - 3, 0.4); pip(a("s2_3", "five") - 3); boots(a("s2_3", "come") - 6, 10, 9)
    pip(a("s2_4", "photograph") - 3, 3600, 0.45); fx(thud(r, 120, 0.5), a("s2_4", "photograph") - 2, 0, 0.4); bump(a("s2_4", "photograph"), 0.4); pip(a("s2_4", "fingerprints") - 3)
    fx(scratch(r, 0.35), a("s2_5", "glass") - 3, 0, 0.3); pip(a("s2_5", "glass") + 31, 3400, 0.4); bump(a("s2_5", "Mona") - 3, 0.4)
    fx(scratch(r, 0.25), a("s2_6", "hangs") - 3, 0, 0.3); [pip(a("s2_6", "four") - 2 + k * 5, 2200 + 200 * k, 0.3) for k in range(4)]; boots(a("s2_6", "back") - 4, 6, 9)
    bump(a("s2_7", "Monday") - 3); boots(a("s2_7") - 4, 8, 9, 0.3)
    # 3
    pip(a("s3_1") + 6, 1800); [pip(a("s3_1", "Seven") - 3 + k * 6, 2000, 0.3) for k in range(3)]; boots(a("s3_1"), 14, 10)
    boots(a("s3_2", "Only") - 4, 20, 6, 0.2, 0.13); pip(a("s3_3", "smock") - 2, 3000); boots(a("s3_3", "walks") - 3, 9, 9, -0.2)
    boots(a("s3_4", "They") + 22, 8, 9, -0.3); pip(a("s3_4", "They") + 5)
    bump(a("s3_5", "cupboard") - 3, 0.4); bump(a("s3_5", "By") - 3, 0.5); boots(a("s3_5", "By"), 14, 9); pip(a("s3_5", "coat") - 3)
    boots(a("s3_6") + 4, 14, 10, -0.3, 0.12); boots(a("s3_6", "Then") - 3, 5, 9, 0.3)
    fx(scratch(r, 0.4), a("s3_6", "lifts") - 3, 0, 0.35); boots(a("s3_6", "carries") - 3, 10, 9, 0.3)
    pip(a("s3_7", "glass") - 3, 3400, 0.4); bump(a("s3_7", "frame") - 3, 0.55, 70); boots(a("s3_7", "leaves") - 3, 4, 9)
    [fx(widen(G.whoosh(0.3, r, peak=0.14), r), a("s3_8") + k * 16, 0, 0.25) for k in range(3)]; fx(scratch(r, 0.4), a("s3_8", "wraps") - 3, 0, 0.3); pip(a("s3_8", "tucks") + 6)
    boots(a("s3_9"), 9, 9, -0.2); [bump(a("s3_9", "locked") - 3 + k * 5, 0.5, 110) for k in range(3)]
    [fx(scratch(r, 0.14), a("s3_10", "screwdriver") - 2 + k * 7, 0.1, 0.28) for k in range(7)]; fx(thud(r, 140, 0.4), a("s3_10", "removes") + 10, 0, 0.45); pip(a("s3_10", "removes") + 16, 1500, 0.3)
    [bump(a("s3_10", "stays") - 2 + k * 6, 0.35, 110) for k in range(2)]; boots(a("s3_10", "footsteps") - 3, 14, 8, 0.4, 0.2, 0.9); boots(a("s3_11"), 10, 9, 0.4, 0.2, 0.9)
    bump(a("s3_11", "Sauvet") - 3, 0.4); pip(a("s3_11", "sees") + 5); boots(a("s3_12") - 20, 9, 8, 0.1, 0.18, 0.9)
    [fx(scratch(r, 0.16), a("s3_12", "opens") - 2 + k * 3, -0.2, 0.3) for k in range(3)]; fx(widen(G.whoosh(0.6, r, peak=0.25, f_lo=500, f_hi=4000), r), a("s3_12", "opens") + 6, -0.2, 0.4)
    boots(a("s3_13") - 4, 18, 9); bump(a("s3_13", "With") - 3)
    # 4
    [pip(a("s4_1", "four") - 2 + k * 4, 2200 + 200 * k, 0.3) for k in range(4)]; boots(a("s4_1", "guards") - 22, 8, 7, 0, 0.14)
    [pip(a("s4_2") + 20 + k * 50, 3600, 0.3) for k in range(3)]; bump(a("s4_2") + 4, 0.35)
    pip(a("s4_3") + 6, 1800); boots(a("s4_3", "painter") - 30, 12, 8, 0.3); bump(a("s4_3", "Louis") - 3, 0.4); bump(a("s4_3", "finds") - 3, 0.55, 100)
    boots(a("s4_4", "goes") - 3, 10, 7, -0.3); bump(a("s4_5") + 6, 0.45)
    pip(a("s4_6") + 6, 1800); [fx(ring(0.5), a("s4_6", "She") - 3 + k * 18, -0.3, 0.05) for k in range(5)]; boots(a("s4_6", "She") - 10, 12, 4, 0, 0.2, 1.0); bump(a("s4_6", "more") - 3)
    # 5
    [fx(whistle(), a("s5_1") + k * 22, r.uniform(-0.4, 0.4), 0.09) for k in range(3)]; boots(a("s5_1") - 6, 30, 3, 0, 0.16, 1.0)
    bump(a("s5_2") + 5, 0.55, 70); boots(a("s5_2", "Sixty") - 3, 30, 2, 0, 0.1, 0.9); bump(a("s5_2", "Sixty") + 2)
    boots(a("s5_2", "They") - 16, 8, 7, -0.3); bump(a("s5_2", "frame") - 3, 0.45, 100); pip(a("s5_2", "thumbprint") - 3, 3200, 0.45)
    bump(a("s5_3") + 6, 0.4); fx(horn(), a("s5_3", "Ships") - 2, 0, 0.06); fx(whistle(0.4), a("s5_3", "trains") - 2, 0.3, 0.07); bump(a("s5_3", "Rewards"), 0.5)
    [fx(widen(G.whoosh(0.35, r, peak=0.2), r), a("s5_4") + 4 + k * 12, 0, 0.3) for k in range(3)]; [bump(a("s5_4") + 8 + k * 12, 0.35, 120) for k in range(3)]
    bump(a("s5_4", "loses") - 3, 0.55, 70); boots(a("s5_4", "loses") + 6, 8, 7, -0.3)
    [pip(a("s5_5") + 8 + k * 5, 1600 + 150 * k, 0.28) for k in range(6)]; bump(a("s5_5", "Who") - 3)
    boots(a("s5_7"), 20, 7, 0, 0.1, 0.6); bump(a("s5_7", "queue") - 3, 0.4); boots(a("s5_7", "People") - 3, 16, 6, 0, 0.12, 0.6); [pip(a("s5_7", "Four") - 2 + k * 4, 2200 + 200 * k, 0.3) for k in range(4)]
    bump(a("s5_8", "writer") - 3, 0.4); bump(a("s5_8", "Franz") - 3, 0.5); bump(a("s5_9") + 6, 0.4); [pip(a("s5_9", "cannot") - 3 + k * 6, 3000, 0.25) for k in range(3)]
    # 6
    [pip(a("s6_1", "two") - 3 + k * 5, 1600, 0.3) for k in range(2)]; bump(a("s6_2") + 8, 0.35); fx(scratch(r, 0.3), a("s6_2", "writes") - 3, 0.2, 0.25); [bump(a("s6_2", "statues") - 3 + k * 5, 0.4, 100) for k in range(3)]
    bump(a("s6_3", "Géry") - 3, 0.45); bump(a("s6_3", "Guillaume") - 3, 0.45); bump(a("s6_3", "Pablo") - 3, 0.5)
    boots(a("s6_4", "They") + 11, 16, 4, -0.3, 0.18, 0.9); bump(a("s6_4", "They") + 27, 0.5, 70)
    boots(a("s6_5", "On") - 11, 10, 5, 0, 0.18, 0.9); fx(whistle(), a("s6_5", "On") - 2, -0.2, 0.08); bump(a("s6_5", "arrest") - 3, 0.6, 70)
    fx(thud(r, 60, 1.0), a("s6_6") + 4, 0, 0.5); boots(a("s6_6", "Then") - 6, 10, 9, 0.3); bump(a("s6_6", "terrified") - 3, 0.4)
    boots(a("s6_7") - 4, 10, 9, -0.3); bump(a("s6_7", "never") - 3, 0.5); bump(a("s6_8", "no") - 3, 0.6, 70); boots(a("s6_8", "Both") - 3, 14, 7)
    [bump(f, 0.5, 70) for f in (a("s6_9", "suspects") - 3, a("s6_9", "suspects") + 3)]; [pip(a("s6_9", "But") - 3 + k * 6, 3000, 0.35) for k in range(2)]
    [fx(thud(r, 150, 0.5), a("s6_10", "knock") - 3 + k * 8, -0.5, 0.6) for k in range(3)]
    # 7
    bump(a("s7_1", "And") - 3, 0.45); boots(a("s7_2") - 4, 12, 8, -0.3); bump(a("s7_2", "asks") - 3, 0.35); pip(a("s7_2", "answer") - 3); pip(a("s7_2", "believes") - 3, 3000); boots(a("s7_2", "leaves") - 3, 14, 8, -0.3)
    fx(scratch(r, 0.5), a("s7_3") + 6, 0, 0.3); pip(a("s7_3") + 26, 3400, 0.45)
    bump(a("s7_4") + 6, 0.4); bump(a("s7_4", "police") - 3, 0.4); pip(a("s7_4", "Nobody") - 3, 1500)
    bump(a("s7_5", "At") - 3, 0.35); fx(scratch(r, 0.3), a("s7_5", "false") - 3, 0, 0.3); bump(a("s7_5", "false") + 13, 0.45, 100); fx(scratch(r, 0.25), a("s7_5", "His", 1) - 3, 0, 0.25); bump(a("s7_5", "most") + 7, 0.6, 70)
    pip(a("s7_6", "Leonardo") - 3, 3200); [pip(f, 1800, 0.35) for f in (a("s7_7") + 4, a("s7_7", "Then") - 3)]
    fx(scratch(r, 0.4), a("s7_8", "hangs") - 3, 0, 0.3); bump(a("s7_8", "hangs") + 27, 0.45, 100); bump(a("s7_8", "Raphael") - 3, 0.4); boots(a("s7_8", "And") - 3, 12, 9, 0, 0.1)
    # 8
    bump(a("s8_1") + 8, 0.4); fx(scratch(r, 0.3), a("s8_1", "opens") - 3, 0.1, 0.3); bump(a("s8_1", "Alfredo") - 3, 0.4)
    pip(a("s8_2", "Mona") - 3); pip(a("s8_2", "home") - 3, 2200); fx(scratch(r, 0.5), a("s8_2", "Leonardo") - 3, 0.1, 0.3)
    boots(a("s8_3") - 10, 10, 7, -0.3); bump(a("s8_3", "Giovanni") - 3, 0.45); bump(a("s8_3", "Together") - 3, 0.35)
    boots(a("s8_4") - 6, 16, 10); [fx(scratch(r, 0.2), a("s8_4") + k * 20, 0.2, 0.18) for k in range(5)]; bump(a("s8_4", "He") + 1, 0.5); boots(a("s8_4", "He") - 3, 10, 9, -0.2)
    bump(a("s8_5", "Five") - 3, 0.5); pip(a("s8_5", "Five") + 5, 3000)
    fx(scratch(r, 0.3), a("s8_6", "opens") - 3, 0, 0.3); bump(a("s8_6", "opens") + 2, 0.4, 100); fx(scratch(r, 0.35), a("s8_6", "lifts") - 3, 0, 0.3); fx(scratch(r, 0.5), a("s8_6", "unwraps") - 3, 0, 0.3)
    bump(a("s8_7", "Uffizi") - 3, 0.4); bump(a("s8_8", "real") - 3, 0.6, 70)
    bump(a("s8_9") + 8, 0.35); [fx(ring(0.5), a("s8_9", "Then") + k * 16, 0.3, 0.05) for k in range(2)]
    boots(a("s8_10") - 4, 14, 4, -0.3, 0.2, 1.0); fx(whistle(), a("s8_10", "arrested") - 8, -0.2, 0.08); bump(a("s8_10", "arrested") - 3, 0.6, 70)
    # 9
    pip(a("s9_1") + 10, 1600); bump(a("s9_2", "patriot") - 3, 0.5); boots(a("s9_2", "Napoleon") + 4, 14, 5, -0.3, 0.16, 0.9); boots(a("s9_2", "brought") - 3, 10, 5, -0.3, 0.16)
    bump(a("s9_3", "never") - 3, 0.6, 70); boots(a("s9_3", "Leonardo") - 13, 14, 10); bump(a("s9_3", "two") - 3, 0.45)
    [pip(a("s9_4", "letters") - 3 + k * 6, 2600 + 200 * k, 0.28) for k in range(3)]; bump(a("s9_4", "letters") - 3, 0.35); fx(scratch(r, 0.5), a("s9_4", "In") + 10, 0.1, 0.25); bump(a("s9_4", "four") - 3, 0.4); pip(a("s9_4", "fortune") - 3, 3200, 0.45)
    bump(a("s9_5") + 8, 0.4); bump(a("s9_5", "marquis") - 3, 0.45); [bump(a("s9_5", "six") - 3 + k * 3, 0.3, 120) for k in range(6)]; [bump(a("s9_5", "six", 1) - 3 + k * 3, 0.3, 90) for k in range(6)]
    bump(a("s9_6", "It", 1) - 3, 0.5); [fx(widen(G.whoosh(0.3, r, peak=0.16), r), a("s9_6", w) - 3, 0, 0.3) for w in ("marquis", "forger", "single")]
    [bump(a("s9_7", w, n) - 3, 0.45, 100) for w, n in (("One", 0), ("one", 1), ("painting", 0))]
    place(ea.sfx, pan(patter((end("s9_8") - a("s9_8")) / 30, r, 22), 0), t(a("s9_8")), 0.05); bump(a("s9_8", "hero") - 3, 0.5)
    bump(a("s9_9") + 8, 0.4); fx(thud(r, 150, 0.5), a("s9_9", "one") - 5, 0, 0.5); bump(a("s9_9", "one") - 3, 0.5); pip(a("s9_9", "seven") - 3, 3000); [pip(f, 1800, 0.3) for f in (a("s9_9", "already") - 3, a("s9_9", "already") + 7)]
    bump(a("s9_9", "So") - 3, 0.5, 70); boots(a("s9_9", "So") - 3, 12, 8, 0.3)
    # 10
    bump(a("s10_1", "Uffizi") - 3, 0.4); boots(a("s10_1", "Uffizi") - 3, 10, 7, 0, 0.1); bump(a("s10_1", "two") - 3, 0.4)
    pip(a("s10_2") + 8, 1800); fx(scratch(r, 0.5), a("s10_2", "returns") - 14, 0, 0.3); bump(a("s10_2", "returns") + 14, 0.5, 100)
    [pip(a("s10_3") + 10 + k * 18, 3200, 0.3) for k in range(3)]
    [fx(widen(G.whoosh(0.3, r, peak=0.16), r), a("s10_4") + 6 + k * 7, 0, 0.25) for k in range(6)]; [pip(a("s10_4", "know") - 3 + k * 4, 2800, 0.25) for k in range(4)]
    bump(a("s10_5", "masterpiece") - 3, 0.4); bump(a("s10_5", "celebrity") - 3, 0.5); [pip(a("s10_5", "celebrity") + 1 + k * 9, 3600, 0.35) for k in range(3)]
    place(ea.sfx, pan(patter((end("s10_5") - a("s10_5", "Today")) / 30, r, 26), 0), t(a("s10_5", "Today")), 0.045); bump(a("s10_5", "Today") - 3, 0.5)
    bump(a("s10_7") + 8, 0.4); boots(a("s10_7", "Then") - 20, 14, 9)
    fx(thud(r, 60, 1.2), a("s10_8", "1925") - 3, 0, 0.45); bump(a("s10_8", "forty-fourth") - 3, 0.4)
    bump(a("s10_10", "1947") - 3, 0.45); pip(a("s10_10", "1947") - 3, 1800); bump(a("s10_10", "Twenty-two") - 3, 0.5); bump(a("s10_10", "another") - 3, 0.4)
    pip(a("s10_11") + 6, 2800); bump(a("s10_11") + 22, 0.45); fx(thud(r, 60, 1.0), a("s10_11", "got") - 3, 0, 0.55)
    bump(a("s10_13", "masterpiece") - 3, 0.45); bump(a("s10_13", "famous") - 3, 0.6, 70); [pip(a("s10_13", "famous") - 3 + k * 10, 3400, 0.4) for k in range(2)]
    pip(a("s10_14", "Especially") - 3, 1800); boots(a("s10_14", "Especially") + 3, 8, 7, -0.4, 0.16); fx(scratch(r, 0.4), a("s10_14", "Mondays") + 24, 0, 0.35); bump(a("s10_14", "Mondays") + 26, 0.5, 100)
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
    mix[:, -ns(0.3):] *= np.linspace(1, 0, ns(0.3))[None, :]
    os.makedirs(os.path.join(ROOT, "public", "mona"), exist_ok=True)
    write_wav(os.path.join(ROOT, "public", "mona", "mix-long.wav"), mix, 16)
    print("mix: %.2f s, %.1f LUFS, true peak %.1f dBTP | voice %.1f, music %.1f, sfx %.1f LUFS" % (mix.shape[1] / SR, integrated(mix), true_peak(mix), integrated(voice), integrated(m), integrated(s)))

if __name__ == "__main__":
    main()

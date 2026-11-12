# Sound for the long film "The Army That Lost a War to Birds" (185 s): the same original bush-march score and
# synthesized effects as the short (emu_audio.py), laid out on the long film's frames (src/videos/emu/storyLong.ts).
# usage: python audio/emu_long_audio.py   ->  public/emu/mix-long.wav
import json, os, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import emu_audio as ea  # noqa: E402
from emu_audio import I, G, F, Q, fr, rng, r_, add, oompah, snare_bar, roll, tune, A1, PROG, SCURRY, G_, C_, D_, Em, gunshot, thud, clack, sproing, tick, patter, emu_boom, engine, scratch, cut_whoosh, fx  # noqa: E402
from dsp import SR, ns, dbg, pan, place, widen, make_ir, convolve_st, integrated, true_peak, read_wav, write_wav, fades  # noqa: E402

TOTAL = 5640
ea.TOTAL = TOTAL; ea.DUR = TOTAL / 30; ea.N = ns(ea.DUR); N = ea.N
ea.music = {k: np.zeros((2, N)) for k in ("low", "mid", "mel", "drum")}
ea.sfx = np.zeros((2, N))
t = fr

def light(t0, bars, vel=0.4, melody=True, prog=PROG):
    """pizzicato bass + light snare, the tune on the fife"""
    for bar in range(bars):
        c = prog[bar % len(prog)]
        for b in range(4): add("low", I.pluck(F(ea.CH[c]["oom"][b % 2]), 0.6, r_(), dur=0.7), t0 + (bar * 4 + b) * Q, -0.1)
        snare_bar(t0 + bar * 4 * Q, "light", 0.33)
    if melody: tune(t0, [n for n in A1 if n[0] < bars * 4], vel, "fife")
def march(t0, bars, vel=0.5, melody=True):
    for bar in range(bars):
        oompah(t0 + bar * 4 * Q, PROG[bar % 8], 0.62, 0.36); snare_bar(t0 + bar * 4 * Q, "march", 0.5)
    if melody: tune(t0, [n for n in A1 if n[0] < bars * 4], vel, "horn", 0.1, gate=0.8)
def scurry(t0, bars):
    ch = [Em, Em, C_, D_, Em, D_, Em, C_, D_, Em, C_, D_]
    for bar in range(bars):
        oompah(t0 + bar * 2 * Q, ch[bar % 12], 0.55, 0.3, beats=2); snare_bar(t0 + bar * 2 * Q, "drive", 0.43, 8)
    for k in range(0, bars * 2, 8): tune(t0 + k * Q, [(b, d, m - (2 if (k // 8) % 2 else 0)) for b, d, m in SCURRY if b + k < bars * 2], 0.44, "fife")
def gallop(t0, bars):
    ch = [G_, G_, C_, D_, G_, Em, C_, D_, G_, C_, D_, D_]
    for bar in range(bars):
        oompah(t0 + bar * 2 * Q, ch[bar % 12], 0.6, 0.34, beats=2, double=bar >= 2); snare_bar(t0 + bar * 2 * Q, "drive" if bar >= 2 else "march", 0.45, 8)
    tune(t0 + 4 * Q, [(b * .5, d * .5, m) for b, d, m in A1], 0.45, "fife")
def tension(t0, t1, roll_from=None):
    k = 0
    while t0 + k * 2 * Q < t1: add("drum", I.timpani(F(40), min(0.6, 0.3 + 0.025 * k), r_()), t0 + k * 2 * Q, 0); k += 1
    notes = [52, 55, 54, 52, 50, 52, 55, 54]
    for i in range(int((t1 - t0) / (4 * Q))): add("low", I.brass(F(notes[i % 8]), 3.5 * Q, 0.3, r_(), "soft"), t0 + i * 4 * Q, -0.1)
    if roll_from: roll(roll_from, t1, 0.12, 0.7)
def sad(t0, notes=((0, 2, 62), (2, 1, 59), (3, 1, 62), (4, 3, 67), (7, 1, 64), (8, 3, 62), (11, 1, 59), (12, 4, 55))):
    for b, d, m in notes: add("mel", I.brass(F(m - 12), d * Q * 0.95, 0.4, r_(), "soft"), t0 + b * Q, -0.1)
    for k in range(8): add("low", I.pluck(F([43, 40, 48, 45, 43, 40, 45, 43][k]), 0.5, r_(), dur=1.4), t0 + k * 2 * Q, -0.1)
def pizz(t0, notes, vel=0.5): tune(t0, notes, vel, "pluck", 0.05)
def sneak(t0, bars):
    """tip-toe bass for the watching leader and the guerrillas"""
    walk = [40, 43, 45, 47, 48, 47, 45, 43]
    for k in range(bars * 4):
        add("low", I.pluck(F(walk[k % 8]), 0.55, r_(), dur=0.5), t0 + k * Q, -0.1)
        if k % 2: add("drum", I.brush(0.3, r_()), t0 + k * Q, 0.15)
    for k in range(0, bars * 4, 8): tune(t0 + k * Q, [(1.5, .5, 71), (2, .5, 72), (3.5, .5, 76), (5.5, .5, 74), (6, 1, 71)], 0.36, "fife")
def trombone(f, base=58):
    for k, m in enumerate([base, base - 1, base - 2, base - 3]): add("mid", I.brass(F(m), 0.2 if k < 3 else 0.6, 0.5, r_(), "soft", scoop=-40, fall=0.4 if k == 3 else 0.0), t(f) + k * 0.2, 0.1)
def stab(f, vel=0.5, notes=(59, 62, 67)):
    for k, m in enumerate(notes): add("mid", I.brass(F(m), 0.3, vel, r_(), "stab"), t(f) + 0.004 * k, 0.25 - 0.1 * k)

def build_music():
    add("drum", I.timpani(F(43), 0.8, r_()), 0.0, 0); roll(0.05, t(116), 0.2, 0.5)
    for k, f in enumerate([47, 71, 104]): add("low", I.brass(F([43, 45, 47][k]), 0.4, 0.6, r_(), "tuba"), t(f), -0.08)
    stab(133, 0.5); roll(t(133), t(186), 0.3, 0.75)
    add("drum", I.timpani(F(38), 0.9, r_()), t(187), 0); add("drum", I.cymbal(0.5, r_()), t(199), 0.1)
    pizz(t(229), [(0, 1, 74), (1, .5, 71), (1.5, .5, 74), (2, 1, 79), (3, 1, 76), (4, 2, 74)])                 # "I'm Sir Digsworth"
    light(t(340), 4)                                                                                           # the land
    sad(t(551))                                                                                                # the Depression
    roll(t(732), t(785), 0.15, 0.6); add("drum", I.timpani(F(38), 0.9, r_()), t(785), 0); stab(785, 0.55); roll(t(790), t(850), 0.5, 0.25)
    light(t(857), 6, 0.42)                                                                                     # the walk to the coast, the wheat
    scurry(t(1174), 5)                                                                                         # fences, rabbits
    pizz(t(1286), [(0, .5, 62), (1, .5, 66), (2, 1, 69), (4, .5, 62), (5, .5, 67), (6, 1, 71), (9, .5, 74), (10, .5, 72), (11, 1, 71)], 0.45)   # the farmers ask
    pizz(t(1434), [(0, 1, 67), (1, 1, 71), (2, 2, 74), (6, .5, 72), (6.5, .5, 71), (7, 1, 69), (9, 1, 66), (10, 2, 67)], 0.45)                 # the minister
    add("mel", I.glock(F(86), 0.5, r_()), t(1466), 0.2)
    march(t(1610), 6); add("drum", I.cymbal(0.45, r_()), t(1740), 0.1)                                         # the army
    pizz(t(1776), [(0, .5, 74), (.5, .5, 76), (1, .5, 78), (1.5, 1, 79)], 0.5)                                 # the cameraman
    light(t(1844), 3, 0.4)                                                                                     # 2 November
    scurry(t(1957), 12)                                                                                        # out of range, herded, split
    tension(t(2190), t(2484), t(2395))                                                                         # the dam
    trombone(2499); add("drum", I.timpani(F(38), 0.6, r_()), t(2529), 0)
    sneak(t(2612), 12)                                                                                         # the leader, the guerrillas
    pizz(t(3063), [(0, .5, 62), (.5, .5, 66), (1, 1, 69)], 0.45); gallop(t(3118), 13)                          # the truck
    sad(t(3340)); sad(t(3574), ((0, 2, 67), (2, 2, 71), (4, 3, 74), (8, 2, 72), (10, 2, 71), (12, 4, 67)))     # six days; no casualties
    sad(t(3721), ((0, 3, 62), (3, 1, 59), (4, 4, 55)))                                                         # called home
    pizz(t(3821), [(0, 1, 67), (2, .5, 71), (2.5, .5, 72), (3, 1, 74), (6, 1, 79), (7, 1, 78), (8, 2, 79)], 0.45)   # tanks
    stab(3944, 0.5, (55, 59, 62))
    pizz(t(3968), [(0, 1, 74), (1, 1, 72), (2, 1, 71), (3, 1, 69), (5, .5, 66), (5.5, .5, 67), (6, 2, 69)], 0.45); trombone(4090, 60)   # the medal
    march(t(4164), 4)                                                                                          # back again, better
    light(t(4392), 2, 0.4, False); pizz(t(4392), [(0, 1, 67), (1, 1, 64), (2, 2, 62)], 0.45)                   # called home for good
    roll(t(4463), t(4518), 0.12, 0.55)
    for f, m, v in [(4521, 43, 0.6), (4536, 45, 0.65), (4552, 47, 0.8)]: add("drum", I.timpani(F(m), v, r_()), t(f), 0)
    roll(t(4590), t(4608), 0.15, 0.6); add("drum", I.timpani(F(38), 0.85, r_()), t(4610), 0); add("drum", I.cymbal(0.4, r_()), t(4610), 0.1)
    trombone(4648, 55)
    for k in range(10): add("mel", I.pluck(F(62 + [0, 2, 4, 5, 7, 9, 11, 12, 14, 16][k]), 0.5, r_(), dur=0.5), t(4692 + k * 2.6), 0.05)   # ten bullets
    add("mel", I.glock(F(91), 0.5, r_()), t(4745), 0.2)
    pizz(t(4779), [(0, 1, 62), (1, 1, 66), (2, 2, 69)], 0.45)
    for f, m in [(4838, 67), (4881, 69), (4933, 71)]: add("mel", I.glock(F(m + 12), 0.5, r_()), t(f), 0.2); add("low", I.pluck(F(m - 24), 0.6, r_(), dur=1.0), t(f), -0.1)
    for k, m in enumerate([62, 59, 55]): add("mid", I.brass(F(m - 12), 0.35, 0.55, r_(), "tuba"), t(5018) + k * 0.22, 0)     # no. no. no.
    march(t(5044), 5, 0.48)                                                                                    # fences, rewards
    add("drum", I.cymbal(0.4, r_()), t(5326), 0.1)
    pizz(t(5370), [(0, 1, 74), (1, .5, 71), (1.5, .5, 74), (2, 1, 79), (3, 1, 76), (4, 1, 74), (5, .5, 71), (5.5, .5, 69), (6, 1, 67)], 0.5)
    for k in range(7): add("low", I.pluck(F([43, 38, 43, 38, 48, 50, 43][k]), 0.55, r_(), dur=0.8), t(5370) + k * Q, -0.1)
    add("drum", I.timpani(F(43), 0.6, r_()), t(5464), 0); add("drum", I.timpani(F(38), 0.85, r_()), t(5494), 0); add("drum", I.cymbal(0.4, r_()), t(5494), 0.1)   # Emus one. Australia nil.
    pizz(t(5532), [(0, .5, 67), (1, .5, 71), (2, 1, 74)], 0.45)
    tb = t(5604)
    add("low", I.brass(F(43), 0.3, 0.65, r_(), "tuba"), tb, -0.08); add("drum", I.snare(0.7, r_()), tb, 0.12); stab(5604, 0.5)
    m = ea.music
    mix = 0.9 * m["low"] + 0.75 * m["mid"] + 0.8 * m["mel"] + 0.7 * m["drum"]
    wet = convolve_st(0.3 * m["mid"] + 0.5 * m["mel"] + 0.35 * m["drum"] + 0.15 * m["low"], make_ir(1.1, 7, hf=0.6))[:, :N]
    return mix + 0.22 * wet

def build_sfx():
    r = rng(78)
    place(ea.sfx, G.breeze(ea.DUR, r, 0.35), 0, 0.5)
    place(ea.sfx, pan(G.bird_chirps(ea.DUR, r, 0.25, "blackbird"), -0.4), 0, 0.05)
    for a, b in [(3338, 3572), (3719, 3819), (5368, 5640)]: fx(fades(G.crickets(fr(b - a), r, 3), 0.4, 0.4), a, 0.3, 0.035)
    for f, g in [(116, 0.5), (187, 0.4), (730, 0.3), (785, 0.5), (968, 0.3), (1087, 0.3), (1122, 0.3), (1172, 0.3), (1899, 0.35), (1957, 0.35), (1988, 0.3), (2102, 0.45), (2292, 0.35), (2391, 0.3), (2450, 0.35),
                 (2485, 0.35), (2529, 0.3), (2668, 0.3), (2862, 0.35), (3223, 0.4), (3264, 0.35), (4590, 0.35)]: cut_whoosh(f, r, g)
    fx(widen(G.whoosh(0.7, r, peak=0.3, f_lo=600, f_hi=5000), r), 219, 0, 0.5)
    # hordes and mobs
    for k in range(60): f = 100 + int(r.uniform(0, 85)); fx(emu_boom(r, int(r.integers(1, 3))), f, r.uniform(-0.8, 0.8), 0.1 * r.uniform(0.5, 1.0))
    fx(emu_boom(r, 2, 82), 203, -0.3, 0.5)
    for k in range(60): f = 790 + int(r.uniform(0, 60)); fx(emu_boom(r, int(r.integers(1, 3))), f, r.uniform(-0.8, 0.8), 0.12 * r.uniform(0.5, 1.0))
    fx(patter(fr(1087 - 857), r, 30, ([0, 1, 6, 7.6], [0.3, 0.8, 0.8, 0.5])), 857, 0, 0.14)
    for f in [1097, 1100, 1108, 1111, 1119]: fx(tick(r, 1500), f, r.uniform(-0.3, 0.3), 0.35)
    fx(patter(fr(50), r, 30, ([0, 0.3, 1.6], [0.4, 1, 0.8])), 1122, 0, 0.2)
    fx(thud(r, 80, 0.8), 1187, 0.1, 0.7); fx(clack(r), 1187, 0.1, 0.25)
    for i in range(5):
        for h in range(4): fx(tick(r, 700, 0.02), 1232 + i * 7 + h * 11, r.uniform(-0.4, 0.4), 0.16)
    for k in range(3): fx(thud(r, 85, 0.5), 478 + k * 2, 0, 0.5); fx(thud(r, 85, 0.5), 1305 + k * 2, 0, 0.5)
    for f in range(604, 640, 4): fx(scratch(r, 0.12), f, 0.2, 0.3)
    fx(scratch(r, 0.2), 686, 0.2, 0.4)
    # the army lands (short frames + 1204), the cameraman
    for f, g, f0 in [(436, 0.7, 70), (465, 0.55, 80), (470, 0.55, 76), (493, 0.6, 95), (499, 0.6, 90), (534, 1.0, 52)]: fx(thud(r, f0, g), f + 1204, 0, 0.8)
    fx(thud(r, 75, 0.7), 1806, -0.3, 0.7)
    for f in range(1814, 1842, 3): fx(tick(r, 2400, 0.008), f, -0.3, 0.14)
    # 2 November: fire that falls short; the split
    for f in range(1957, 2018, 3): fx(gunshot(r, 1.0 if f < 1988 else 0.45), f, -0.35 if (f // 3) % 2 else 0.35, 0.75 if f < 1988 else 0.35)
    fx(patter(fr(2188 - 2030), r, 40, ([0, 0.5, 2.4, 2.9, 5.2], [0.2, 0.5, 0.6, 1, 0.8])), 2030, 0, 0.24)
    # the dam: feet, bursts, the jam
    fx(patter(fr(2391 - 2292), r, 40, ([0, 0.4, 3.0, 3.3], [0.3, 0.9, 1, 0.8]), f0=300), 2292, 0, 0.2)
    for f in [2455, 2460, 2465, 2470, 2475, 2480, 2485, 2489, 2492]: fx(gunshot(r), f, 0, 0.8)
    fx(clack(r), 2495, 0, 0.9); fx(sproing(r), 2497, 0.1, 0.5); fx(thud(r, 110, 0.5), 2510, 0, 0.5); fx(thud(r, 105, 0.5), 2520, 0, 0.5)
    fx(patter(fr(2610 - 2529), r, 50, ([0, 0.3, 2.7], [1, 0.8, 0.2])), 2529, 0, 0.2)
    # the leader's warning, the guerrillas popping up
    fx(emu_boom(r, 3, 70), 2867, 0, 0.7); fx(patter(fr(2901 - 2880), r, 45), 2880, 0, 0.22)
    for f in [2941, 2950, 2962, 2972, 2986, 2996]: fx(tick(r, 900, 0.03), f, r.uniform(-0.5, 0.5), 0.3)
    fx(emu_boom(r, 1, 76), 3008, 0, 0.45)
    # the truck
    fx(thud(r, 58, 1.0), 3135, 0, 0.85); fx(clack(r), 3135, 0, 0.3)
    eng = engine(fr(3338 - 3147), r, [(0, 17), (0.35, 26), (0.6, 30), (2.3, 46), (6.4, 50)], 0.6)
    env = np.interp(np.arange(len(eng)) / SR, [0, 0.2, 0.6, 2.3, 6.0, 6.36], [0, 0.5, 0.6, 1, 1, 0.7])
    fx(widen(eng * env, r), 3147, 0, 0.3)
    fx(patter(fr(3223 - 3162), r, 34, ([0, 0.2, 2.0], [0.5, 1, 0.9])), 3162, -0.2, 0.3)
    for f, g in [(3230, 0.9), (3241, 0.8), (3249, 1.1), (3259, 0.8), (3275, 0.9), (3292, 1.0), (3307, 0.8), (3322, 0.9)]:
        fx(thud(r, 66, g), f, 0, 0.6); fx(clack(r), f + 1, r.uniform(-0.3, 0.3), 0.22)
    # tally, boots, chalk
    for k in range(6): fx(scratch(r), 3342 + k * 3, -0.2, 0.3)
    fx(scratch(r, 0.2), 3549, 0.2, 0.4)
    for k in range(12): fx(G.boot(r, 0.4), 3722 + k * 6, r.uniform(-0.3, 0.3), 0.14 * (1 - k / 16))
    for k in range(10): fx(G.boot(r, 0.8), 4164 + int(k * 9.7), r.uniform(-0.3, 0.3), 0.22)
    for f in range(4242, 4293, 3): fx(gunshot(r), f, -0.35 if (f // 3) % 2 else 0.35, 0.6)
    fx(scratch(r, 0.2), 4343, 0.1, 0.4)
    for f in [4521, 4536, 4552]: fx(scratch(r, 0.22), f, 0.1, 0.45)
    for k in range(4): fx(scratch(r, 0.12), 4610 + k * 3, 0.1, 0.4)
    fx(thud(r, 75, 0.7), 4745, 0.4, 0.7)
    for f in [4838, 4881, 4933]: fx(scratch(r, 0.2), f, 0, 0.4)
    for k in range(3): fx(thud(r, 60, 0.9), 5018 + k * 2, 0, 0.6)
    fx(widen(G.whoosh(0.5, r, peak=0.3), r), 5100, 0, 0.4); fx(thud(r, 70, 0.9), 5118, 0, 0.7)
    for f in range(5288, 5326, 2): fx(tick(r, 2600, 0.008), f, 0.2, 0.16)
    # the end
    fx(patter(fr(5640 - 5405), r, 14, ([0, 0.5, 4], [0, 0.6, 0.5]), f0=900), 5405, 0, 0.08)
    fx(scratch(r, 0.2), 5462, 0.3, 0.4); fx(scratch(r, 0.2), 5492, 0.3, 0.4)
    fx(emu_boom(r, 2, 84), 5436, -0.3, 0.5); fx(emu_boom(r, 1, 84), 5588, -0.3, 0.45)
    return ea.sfx

def main():
    ROOT = os.path.dirname(HERE)
    words = json.load(open(os.path.join(ROOT, "voice", "emu-long", "words.json")))
    v, sr = read_wav(os.path.join(ROOT, "voice", "emu-long", "voice.wav")); assert sr == SR
    voice = np.zeros((2, N)); vv = v[0][:N]; voice[:, : len(vv)] = vv
    voice *= dbg(-16.0 - integrated(voice))
    m = build_music(); s = build_sfx()
    m *= dbg(-16.0 - 10.0 - integrated(m)); m *= ea.duck(words, -3.0)[None, :]
    s *= ea.duck(words, -2.0)[None, :]
    s *= dbg(-8.0) / max(np.abs(s).max(), 1e-9)
    mix = voice + m + s
    mix *= dbg(-14.0 - integrated(mix))
    mix = ea.limiter(mix)
    mix[:, -ns(0.3):] *= np.linspace(1, 0, ns(0.3))[None, :]
    write_wav(os.path.join(ROOT, "public", "emu", "mix-long.wav"), mix, 16)
    print("mix: %.2f s, %.1f LUFS, true peak %.1f dBTP | voice %.1f, music %.1f, sfx %.1f LUFS" % (mix.shape[1] / SR, integrated(mix), true_peak(mix), integrated(voice), integrated(m), integrated(s)))

if __name__ == "__main__":
    main()

# Sound for "The Great Emu War" short: an original light bush-march score and synthesized sound effects, timed to the
# picture's frames (src/videos/emu/story.ts), ducked under Sir Digsworth's voice and mixed to one 48 kHz stereo file.
# Everything is generated here from numpy / scipy (dsp.py, instruments.py and sfx_gen.py come from the MIT-licensed
# claude-animated-shorts engine): no samples, no copyrighted material.
# usage: python audio/emu_audio.py   ->  public/emu/mix.wav (+ audio/out/{music,sfx,voice}.wav)
import json, os, sys
import numpy as np
from scipy import ndimage, signal

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "lib"))
from dsp import SR, TAU, ns, tt, dbg, rng, lp, hp, bp, colored, fades, phase, modal, pan, st, place, widen, make_ir, convolve_st, integrated, true_peak, read_wav, write_wav, smooth_noise  # noqa: E402
import instruments as I  # noqa: E402
import sfx_gen as G  # noqa: E402

ROOT = os.path.dirname(HERE)
FPS, TOTAL = 30, 1650
DUR = TOTAL / FPS
N = ns(DUR)
fr = lambda f: f / FPS
R = rng(1932)
def r_(): return rng(int(R.integers(1 << 30)))
F = lambda m: 440.0 * 2 ** ((m - 69) / 12)

# ---------------------------------------------------------------- music
BPM = 126
Q = 60 / BPM                      # a beat
music = {"low": np.zeros((2, N)), "mid": np.zeros((2, N)), "mel": np.zeros((2, N)), "drum": np.zeros((2, N))}
def add(tr, x, t, p=0.0, g=1.0):
    place(music[tr], pan(x, p) if np.ndim(x) == 1 else x, t, g)

G_, C_, D_, Em = "G", "C", "D", "Em"
CH = {"G": {"oom": (43, 38), "pah": (59, 62, 67)}, "C": {"oom": (48, 43), "pah": (60, 64, 67)}, "D": {"oom": (50, 45), "pah": (57, 62, 66)}, "Em": {"oom": (40, 47), "pah": (59, 64, 67)}}

def oompah(t, chord, vel=0.6, pah=0.36, beats=4, double=False):
    c = CH[chord]
    for b in range(beats):
        add("low", I.brass(F(c["oom"][b % 2]), 0.26, vel * (1.0 if b % 2 == 0 else 0.85), r_(), "tuba"), t + b * Q, -0.08)
        offs = [Q / 2] if not double else [Q / 4, Q / 2, 3 * Q / 4]
        for o in offs:
            for k, m in enumerate(c["pah"]): add("mid", I.brass(F(m), 0.11, pah, r_(), "horn", scoop=-12), t + b * Q + o + 0.004 * k, 0.3 - 0.12 * k)

SN = {"march": [3, 0, 1, 1, 2, 0, 1, 0, 3, 0, 1, 1, 2, 0, 1, 1], "light": [1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 2, 0, 1, 1], "drive": [2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1]}
def snare_bar(t, pat, vel, steps=16):
    for i in range(steps):
        v = SN[pat][i % 16]
        if v: add("drum", I.snare(vel * (0.45 + 0.2 * v), r_()), t + i * Q / 4, 0.12)
def roll(t0, t1, v0, v1):
    for tm, v in I.snare_roll(t0, t1, v0, v1, r_()): add("drum", I.snare(v, r_(), buzz=True), tm, 0.12)
def tune(t, notes, vel=0.5, fn="fife", p=-0.15, tr="mel", gate=0.85):
    """notes: (beats from t, length in beats, midi)"""
    for b, d, m in notes:
        if fn == "fife": x = I.fife(F(m), d * Q * gate, vel, r_())
        elif fn == "pluck": x = I.pluck(F(m), vel, r_(), dur=max(0.5, d * Q * 1.6))
        elif fn == "glock": x = I.glock(F(m), vel, r_())
        else: x = I.brass(F(m), d * Q * gate, vel, r_(), fn)
        add(tr, x, t + b * Q, p)

# our own little march tune in G (two 4-bar phrases)
A1 = [(0, 1, 74), (1, .5, 71), (1.5, .5, 74), (2, 1, 79), (3, 1, 76), (4, 1, 74), (5, .5, 71), (5.5, .5, 67), (6, 2, 69),
      (8, 1, 72), (9, .5, 71), (9.5, .5, 72), (10, 1, 76), (11, 1, 74), (12, .5, 71), (12.5, .5, 69), (13, .5, 66), (13.5, .5, 69), (14, 2, 67)]
PROG = [G_, G_, C_, D_, C_, G_, D_, G_]
SCURRY = [(i * .5, .5, m) for i, m in enumerate([79, 78, 76, 74, 72, 71, 69, 67, 69, 71, 72, 74, 76, 74, 72, 71])]

def build_music():
    t = fr
    # hook (0 - 6.8 s): timpani + roll, two stabs, a cymbal on "won"
    add("drum", I.timpani(F(43), 0.8, r_()), 0.0, 0.0); roll(0.05, t(95), 0.2, 0.5)
    for k, f in enumerate([46, 74, 95]): add("low", I.brass(F([43, 45, 47][k]), 0.4, 0.6, r_(), "tuba"), t(f), -0.08)
    for k, m in enumerate((59, 62, 67)): add("mid", I.brass(F(m), 0.55, 0.5, r_(), "stab"), t(113) + 0.004 * k, 0.25 - 0.1 * k)
    roll(t(113), t(160), 0.3, 0.75)
    add("drum", I.timpani(F(38), 0.9, r_()), t(163), 0); add("drum", I.cymbal(0.5, r_()), t(181), 0.1)
    for k, (b, m) in enumerate([(0, 67), (1, 66), (2, 64), (3, 62)]): add("mid", I.brass(F(m - 12), 0.22, 0.42, r_(), "soft"), t(163) + b * 0.16, 0.15)
    # farm (frame 209 - 405): pizzicato bass + the tune on fife, light
    t0 = t(209)
    for bar in range(3):
        c = PROG[bar]
        for b in range(4): add("low", I.pluck(F(CH[c]["oom"][b % 2]), 0.6, r_(), dur=0.7), t0 + (bar * 4 + b) * Q, -0.1)
        snare_bar(t0 + bar * 4 * Q, "light", 0.35)
    tune(t0, [n for n in A1 if n[0] < 12], 0.42, "fife")
    tune(t0 + 12 * Q, [(0, .5, 72), (.5, .5, 71), (1, .5, 69), (1.5, .5, 66), (2, 1, 67)], 0.42, "pluck", 0.2)
    # the army (408 - 571): the full march, a hit for every thing that lands
    t1 = t(410)
    for bar in range(5):
        oompah(t1 + bar * 4 * Q, PROG[bar], 0.62, 0.36)
        snare_bar(t1 + bar * 4 * Q, "march", 0.5)
    tune(t1, A1, 0.5, "horn", 0.1, gate=0.8)
    tune(t1 + 16 * Q, [(0, 1, 74), (1, 1, 78), (2, 1.5, 79)], 0.55, "horn", 0.1)
    add("drum", I.cymbal(0.45, r_()), t(534), 0.1)
    # "Easy, right?" (571 - 606): everything stops; one raised eyebrow on pizzicato
    tune(t(574), [(0, .5, 62), (1.2, .5, 66), (1.7, 1, 69)], 0.5, "pluck", 0.0)
    # the split (606 - 771): scurry
    t2 = t(608)
    for bar in range(6):
        oompah(t2 + bar * 4 * Q * 0.5, [Em, Em, C_, D_, Em, D_][bar], 0.55, 0.3, beats=2, double=False)
        snare_bar(t2 + bar * 2 * Q, "drive", 0.42, 8)
    for bar in range(5, 11):
        oompah(t2 + bar * 2 * Q, [Em, C_, D_, Em, C_, D_][bar - 5], 0.55, 0.32, beats=2)
        snare_bar(t2 + bar * 2 * Q, "drive", 0.45, 8)
    tune(t(664), SCURRY, 0.45, "fife"); tune(t(664) + 8 * Q, [(b, d, m - 2) for b, d, m in SCURRY[:8]], 0.45, "fife")
    # the dam (771 - 934): hush; soft timpani heartbeat, a roll that swells toward the gun
    for k in range(9): add("drum", I.timpani(F(40), 0.32 + 0.03 * k, r_()), t(775) + k * 2 * Q, 0)
    tune(t(775), [(0, 3.5, 52), (4, 3.5, 55), (8, 3.5, 54), (12, 4, 52)], 0.32, "soft", -0.1, "low")
    roll(t(860), t(916), 0.12, 0.7)
    # the jam (942): a sad trombone slide
    for k, m in enumerate([58, 57, 56, 55]): add("mid", I.brass(F(m), 0.2 if k < 3 else 0.6, 0.5, r_(), "soft", scoop=-40, fall=0.4 if k == 3 else 0.0), t(946) + k * 0.2, 0.1)
    # the truck (971 - 1180): gallop
    t3 = t(985)
    tune(t(972), [(0, .5, 62), (.5, .5, 66), (1, 1, 69)], 0.45, "pluck")
    for bar in range(12):
        oompah(t3 + bar * 2 * Q, [G_, G_, C_, D_, G_, Em, C_, D_, G_, C_, D_, D_][bar], 0.6, 0.34, beats=2, double=bar >= 3)
        snare_bar(t3 + bar * 2 * Q, "drive" if bar >= 3 else "march", 0.45, 8)
    tune(t(1030), [(b * .5, d * .5, m) for b, d, m in A1], 0.45, "fife")
    tune(t(1030) + 8 * Q, [(b * .5, d * .5, m + 2) for b, d, m in A1[:9]], 0.47, "fife")
    # going home (1180 - 1307): the tune, slow and low
    t4 = t(1182)
    for k, (b, d, m) in enumerate([(0, 2, 62), (2, 1, 59), (3, 1, 62), (4, 3, 67), (7, 1, 64), (8, 3, 62)]): add("mel", I.brass(F(m - 12), d * Q * 0.95, 0.4, r_(), "soft"), t4 + b * Q, -0.1)
    for k in range(6): add("low", I.pluck(F([43, 40, 48, 45, 43, 43][k]), 0.5, r_(), dur=1.4), t4 + k * 2 * Q, -0.1)
    # back for a second try (1307 - 1367): two bars of the march
    t5 = t(1309)
    for bar in range(2): oompah(t5 + bar * 4 * Q, [G_, D_][bar], 0.6, 0.36); snare_bar(t5 + bar * 4 * Q, "march", 0.5)
    tune(t5, [n for n in A1 if n[0] < 8], 0.5, "horn", 0.1, gate=0.8)
    # the final score (1367 - 1554): drum roll, a hit for each number
    roll(t(1370), t(1418), 0.12, 0.55)
    for f, m, v in [(1421, 43, 0.6), (1436, 45, 0.65), (1452, 47, 0.8)]: add("drum", I.timpani(F(m), v, r_()), t(f), 0)
    roll(t(1489), t(1505), 0.15, 0.6); add("drum", I.timpani(F(38), 0.85, r_()), t(1507), 0); add("drum", I.cymbal(0.4, r_()), t(1507), 0.1)
    for k, m in enumerate([55, 54, 52, 50]): add("mid", I.brass(F(m), 0.22 if k < 3 else 0.7, 0.45, r_(), "soft", scoop=-30, fall=0.3 if k == 3 else 0.0), t(1527) + k * 0.2, 0.1)
    # the ending (1554 - 1650): the tune once more on pizzicato, a button
    t6 = t(1556)
    tune(t6, [(0, 1, 74), (1, .5, 71), (1.5, .5, 74), (2, 1, 79), (3, 1, 76), (4, 1, 74), (5, .5, 71), (5.5, .5, 69), (6, 1, 67)], 0.5, "pluck", 0.1)
    for k in range(7): add("low", I.pluck(F([43, 38, 43, 38, 48, 50, 43][k]), 0.55, r_(), dur=0.8), t6 + k * Q, -0.1)
    tb = t(1634)
    add("low", I.brass(F(43), 0.3, 0.65, r_(), "tuba"), tb, -0.08); add("drum", I.snare(0.7, r_()), tb, 0.12)
    for k, m in enumerate((59, 62, 67)): add("mid", I.brass(F(m), 0.3, 0.5, r_(), "stab"), tb + 0.004 * k, 0.25 - 0.1 * k)
    mix = 0.9 * music["low"] + 0.75 * music["mid"] + 0.8 * music["mel"] + 0.7 * music["drum"]
    ir = make_ir(1.1, 7, hf=0.6)
    wet = convolve_st(0.3 * music["mid"] + 0.5 * music["mel"] + 0.35 * music["drum"] + 0.15 * music["low"], ir)[:, :N]
    return mix + 0.22 * wet

# ---------------------------------------------------------------- sound effects
sfx = np.zeros((2, N))
def fx(x, f, p=0.0, g=1.0): place(sfx, pan(x, p) if np.ndim(x) == 1 else x, fr(f), g)

def gunshot(r, big=1.0):
    t = tt(0.16); nz = r.standard_normal(len(t))
    crack = hp(nz, 1800) * np.exp(-t / 0.006) * 0.9
    body = bp(nz, 180, 1100, 2) * np.exp(-t / 0.028) * 1.2
    thump = np.sin(phase(120 * (1 + 0.6 * np.exp(-t / 0.01)))) * np.exp(-t / 0.03) * 0.9
    tail = bp(r.standard_normal(len(t)), 400, 2500, 1) * np.exp(-t / 0.06) * 0.18
    return fades((crack + body + thump + tail) * big, 0.0003, 0.02)
def thud(r, f0=62, big=1.0):
    t = tt(0.32); nz = r.standard_normal(len(t))
    return fades((np.sin(phase(f0 * (1 + 0.5 * np.exp(-t / 0.02)))) * np.exp(-t / 0.075) + 0.5 * lp(nz, 350) * np.exp(-t / 0.03) + 0.12 * bp(nz, 700, 3000, 1) * np.exp(-t / 0.012)) * big, 0.0005, 0.03)
def clack(r):
    y = modal(0.3, [(830, 0.7, 0.03), (2140, 0.5, 0.022), (3470, 0.35, 0.014), (5200, 0.25, 0.009)], r)
    t = tt(0.3); return fades(y + hp(r.standard_normal(len(t)), 3000) * np.exp(-t / 0.002) * 0.5, 0.0003, 0.02)
def sproing(r, dur=0.5):
    t = tt(dur); f = 240 + 520 * np.exp(-t / 0.16) + 40 * np.sin(TAU * 19 * t)
    return fades((np.sin(phase(f)) + 0.3 * np.sin(2 * phase(f))) * np.exp(-t / 0.2) * 0.6, 0.002, 0.05)
def tick(r, f0=1300, d=0.011):
    return modal(0.08, [(f0 * r.uniform(0.85, 1.15), 0.6, d), (f0 * 2.2 * r.uniform(0.9, 1.1), 0.35, d * 0.7)], r)
def patter(dur, r, rate, env=None, f0=420):
    """many fast soft footfalls on dry ground"""
    n = ns(dur); y = np.zeros(n); t = 0.0
    while t < dur - 0.06:
        e = 1.0 if env is None else float(np.interp(t, *env))
        if e > 0.01:
            L = ns(0.05); tl = np.arange(L) / SR; nz = r.standard_normal(L)
            k = (np.sin(phase(f0 * r.uniform(0.6, 1.5) * (1 + 0.4 * np.exp(-tl / 0.006)))) * np.exp(-tl / 0.012) + 0.6 * bp(nz, 500, 2600, 1) * np.exp(-tl / 0.006)) * e * r.uniform(0.5, 1.0)
            i = ns(t); y[i:i + L] += k[: max(0, min(L, n - i))]
        t += r.exponential(1 / rate)
    return y
def emu_boom(r, n=2, f0=None):
    """the emu's deep drumming grunt"""
    f0 = f0 or r.uniform(78, 96); out = np.zeros(ns(0.2 * n + 0.2))
    for k in range(n):
        t = tt(0.2); f = f0 * (1 + 0.08 * np.sin(np.pi * t / 0.2))
        x = (np.sin(phase(f)) + 0.5 * np.sin(2 * phase(f)) + 0.25 * np.sin(3 * phase(f))) * np.sin(np.pi * t / 0.2) ** 1.5
        x += 0.05 * lp(r.standard_normal(len(t)), 600) * np.sin(np.pi * t / 0.2)
        i = ns(k * 0.21); out[i:i + len(x)] += x
    return out
def engine(dur, r, f_pts, bumpy=0.0):
    n = ns(dur); t = np.arange(n) / SR
    f = np.interp(t, [p[0] for p in f_pts], [p[1] for p in f_pts])
    ph = np.cumsum(TAU * f / SR)
    y = lp(np.sign(np.sin(ph)) * 0.4 + np.sin(ph) + 0.5 * np.sin(0.5 * ph), 420, 2)
    y *= 0.65 + 0.35 * (np.sin(ph * 0.5) > 0)                          # putt-putt
    rattle = bp(r.standard_normal(n), 900, 4500, 1) * (0.5 + 0.5 * smooth_noise(n, r, 9.0)) * 0.1 * (1 + 2 * bumpy)
    return (y + rattle) * (0.8 + 0.2 * smooth_noise(n, r, 3.0))
def scratch(r, dur=0.16):
    t = tt(dur); nz = r.standard_normal(len(t))
    y = bp(nz, 2500, 9000, 2) * (0.6 + 0.4 * np.sin(TAU * 38 * t)) * np.sin(np.pi * t / dur) ** 0.6 * 0.6
    k = tick(r, 2200); m = min(len(k), len(y)); y[:m] += 0.5 * k[:m]
    return fades(y, 0.002, 0.02)
def cut_whoosh(f, r, g=1.0, dur=0.45): fx(widen(G.whoosh(dur, r, peak=0.16), r), f - 5, 0, g)

def build_sfx():
    r = rng(77)
    # air of the open country all the way through; crickets at golden hour
    place(sfx, G.breeze(DUR, r, 0.35), 0, 0.5)
    place(sfx, pan(G.bird_chirps(DUR, r, 0.25, "blackbird"), -0.4), 0, 0.05)
    for a, b in [(1180, 1307), (1554, 1650)]: fx(fades(G.crickets(fr(b - a), r, 3), 0.4, 0.4), a, 0.3, 0.035)
    # the horde: massed booming + rustle, swelling on "twenty thousand emus"
    for k in range(70): f = 60 + int(r.uniform(0, 140)); fx(emu_boom(r, int(r.integers(1, 3))), f, r.uniform(-0.8, 0.8), (0.05 + 0.1 * (f > 95)) * r.uniform(0.5, 1.0))
    fx(emu_boom(r, 2, 82), 186, 0.0, 0.5)                                # the winner, on "won"
    # cuts
    for f, g in [(95, 0.5), (163, 0.4), (288, 0.3), (359, 0.3), (656, 0.45), (722, 0.4), (843, 0.4), (934, 0.35), (1083, 0.4), (1125, 0.35), (1262, 0.3), (1483, 0.35)]: cut_whoosh(f, r, g)
    fx(widen(G.whoosh(0.7, r, peak=0.3, f_lo=600, f_hi=5000), r), 197, 0, 0.5)   # into the flash
    # farm: the mob trampling in, the farmer's gasp is the fife; pecking ticks in the close-up
    fx(patter(fr(405 - 209), r, 26, ([0, 1, 3.5, 6.5], [0.2, 0.8, 0.8, 0.5])), 209, -0.2, 0.16)
    for f in [369, 372, 380, 383, 391, 394, 399, 402]: fx(tick(r, 1500), f, r.uniform(-0.3, 0.3), 0.35)
    for k in range(10): fx(emu_boom(r, 1), 215 + int(r.uniform(0, 180)), r.uniform(-0.7, 0.7), 0.07)
    # the army: every arrival lands with a thud
    for f, g, f0 in [(436, 0.7, 70), (465, 0.55, 80), (470, 0.55, 76), (493, 0.6, 95), (499, 0.6, 90), (534, 1.0, 52)]: fx(thud(r, f0, g), f, 0, 0.8)
    for k in range(5): fx(tick(r, 3200, 0.02), 548 + k * 2 + int(r.uniform(0, 3)), r.uniform(-0.3, 0.3), 0.3)
    # the guns open fire (two guns, alternating), brass tinkles; the mob bolts
    for f in range(623, 708, 3): fx(gunshot(r, 1.0 if f < 656 else 0.5), f, -0.35 if (f // 3) % 2 else 0.35, 0.75 if f < 656 else 0.4)
    for f in range(626, 656, 6): fx(tick(r, 3600, 0.02), f + 5, r.uniform(-0.5, 0.5), 0.14)
    fx(patter(fr(771 - 664), r, 55, ([0, 0.3, 1.9, 2.0, 3.5], [0, 1, 0.9, 1, 0.8])), 664, 0, 0.26)
    for k in range(8): fx(emu_boom(r, 1, r.uniform(95, 120)), 664 + int(r.uniform(0, 100)), r.uniform(-0.8, 0.8), 0.1)
    # the dam: quiet water, a thousand feet walking up; three bursts, the jam, the spring
    fx(patter(fr(920 - 843), r, 40, ([0, 0.4, 2.3, 2.56], [0.3, 0.9, 1, 0.9]), f0=300), 843, 0, 0.2)
    for f in [916, 919, 922, 925, 928, 931, 934, 937, 940]: fx(gunshot(r), f, 0, 0.8)
    fx(clack(r), 942, 0, 0.9); fx(sproing(r), 944, 0.1, 0.5); fx(thud(r, 110, 0.5), 955, 0, 0.5); fx(thud(r, 105, 0.5), 963, 0, 0.5)
    # the truck: the gun thumps onto the bed, the engine catches, then the chase with every bump
    fx(thud(r, 58, 1.0), 1001, 0, 0.85); fx(clack(r), 1001, 0, 0.3)
    eng = engine(fr(1180 - 1013), r, [(0, 17), (0.35, 26), (0.6, 30), (2.3, 46), (5.6, 50)], 0.6)
    env = np.interp(np.arange(len(eng)) / SR, [0, 0.2, 0.6, 2.3, 5.2, 5.56], [0, 0.5, 0.6, 1, 1, 0.7])
    fx(widen(eng * env, r), 1013, 0, 0.3)
    fx(patter(fr(1083 - 1030), r, 34, ([0, 0.2, 1.7], [0.5, 1, 0.9])), 1030, -0.2, 0.3)
    for f, g in [(1090, 0.9), (1101, 0.8), (1110, 1.1), (1120, 0.8), (1133, 0.9), (1146, 1.0), (1157, 0.8), (1168, 0.9)]:
        fx(thud(r, 66, g), f, 0, 0.6); fx(clack(r), f + 1, r.uniform(-0.3, 0.3), 0.22)
    # golden hour: chalk tally, slow boots walking off
    for k in range(6): fx(scratch(r), 1184 + k * 3, -0.2, 0.3)
    for k in range(9): fx(G.boot(r, 0.4), 1264 + k * 5, r.uniform(-0.3, 0.3), 0.14 * (1 - k / 14))
    # back again: marching boots
    for k in range(8): fx(G.boot(r, 0.8), 1309 + int(k * 7.3), r.uniform(-0.3, 0.3), 0.22)
    # the scoreboard: chalk for every figure
    for f in [1421, 1436, 1452]: fx(scratch(r, 0.22), f, 0.1, 0.45)
    for k in range(4): fx(scratch(r, 0.12), 1507 + k * 3, 0.1, 0.4)
    # the end: the field of pecking, one emu saying hello
    fx(patter(fr(1650 - 1590), r, 14, ([0, 0.5, 2], [0, 0.6, 0.5]), f0=900), 1590, 0, 0.08)
    for k in range(6): fx(emu_boom(r, 1), 1592 + int(r.uniform(0, 30)), r.uniform(-0.7, 0.7), 0.07)
    fx(emu_boom(r, 2, 84), 1622, -0.3, 0.5)
    return sfx

# ---------------------------------------------------------------- mix
def duck(words, depth_db, pre=0.08, post=0.14, att=0.06, rel=0.4):
    ctrl = 1000; nc = int(DUR * ctrl) + 2; va = np.zeros(nc)
    sp = []
    for w in words:
        if sp and w["a"] - sp[-1][1] < 0.35: sp[-1][1] = w["b"]
        else: sp.append([w["a"], w["b"]])
    for s, e in sp: va[max(0, int((s - pre) * ctrl)): int((e + post) * ctrl)] = 1.0
    ka, kr = 1 - np.exp(-1 / (att * ctrl)), 1 - np.exp(-1 / (rel * ctrl)); env = np.zeros(nc); e = 0.0
    for i in range(nc): e += (va[i] - e) * (ka if va[i] > e else kr); env[i] = e
    return dbg(np.interp(np.arange(N) / SR, np.arange(nc) / ctrl, depth_db * env))
def limiter(x, ceil_db=-1.2, look=0.003, rel=0.08):
    c = dbg(ceil_db); n = x.shape[1]
    up = np.abs(signal.resample_poly(x, 4, 1, axis=-1)).max(0)
    pk = np.pad(up, (0, max(0, 4 * n - len(up))))[: 4 * n].reshape(n, 4).max(1)
    gr = np.minimum(1.0, c / np.maximum(pk, 1e-12)); La = max(1, ns(look))
    g = ndimage.minimum_filter1d(gr, 2 * La + 1, mode="nearest")
    kr = 1 - np.exp(-1 / (rel * SR)); out = np.empty(n); cur = 1.0
    idx = np.flatnonzero(g < 1.0)
    if len(idx) == 0: return x
    out[:] = 1.0
    lo, hi = idx[0], min(n, idx[-1] + ns(rel * 10))
    for k in range(lo, hi): cur = min(g[k], cur + (1 - cur) * kr); out[k] = cur
    return x * ndimage.uniform_filter1d(out, 2 * La + 1, mode="nearest")[None, :]

def main():
    words = json.load(open(os.path.join(ROOT, "voice", "emu-short", "words.json")))
    v, sr = read_wav(os.path.join(ROOT, "voice", "emu-short", "voice.wav")); assert sr == SR
    voice = np.zeros((2, N)); vv = v[0][:N]; voice[:, : len(vv)] = vv
    voice *= dbg(-16.0 - integrated(voice))                              # narration at -16 LUFS
    m = build_music(); s = build_sfx()
    # low background music: ~15 dB under the voice while he speaks, a little more room in the gaps
    m *= dbg(-16.0 - 10.0 - integrated(m)); m *= duck(words, -3.0)[None, :]
    s *= duck(words, -2.0)[None, :]
    pk = np.abs(s).max(); s *= dbg(-8.0) / max(pk, 1e-9) * 1.0             # loudest effect peaks ~ -8 dBFS before the limiter
    mix = voice + m + s
    mix *= dbg(-14.0 - integrated(mix))
    mix = limiter(mix)
    mix[:, -ns(0.25):] *= np.linspace(1, 0, ns(0.25))[None, :]
    os.makedirs(os.path.join(HERE, "out"), exist_ok=True); os.makedirs(os.path.join(ROOT, "public", "emu"), exist_ok=True)
    write_wav(os.path.join(ROOT, "public", "emu", "mix.wav"), mix, 16)
    for name, x in [("music", m), ("sfx", s), ("voice", voice)]: write_wav(os.path.join(HERE, "out", name + ".wav"), x, 16)
    print("mix: %.2f s, %.1f LUFS, true peak %.1f dBTP | voice %.1f, music %.1f, sfx %.1f LUFS" % (mix.shape[1] / SR, integrated(mix), true_peak(mix), integrated(voice), integrated(m), integrated(s)))

if __name__ == "__main__":
    main()

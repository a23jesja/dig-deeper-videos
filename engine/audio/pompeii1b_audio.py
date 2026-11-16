# Sound for the rebuilt short "I Survived Pompeii: Part 1" (40.5 s, voice/pompeii-1v2): a light street tune that stops dead at the blast, the rumble of the mountain,
# crowd, fountain, the dog, a cup that rattles off a counter, running feet, coins, falling pumice. Every cue on a word or a cut of src/videos/emu/pompeii1.ts.
# usage: python audio/pompeii1_audio.py -> public/pompeii/mix-1.wav   (voice -16 LUFS, music 10 dB under it, final mix -14 LUFS)
import json, os, re, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import emu_long_audio as el  # noqa: E402
import emu_audio as ea  # noqa: E402
from emu_audio import I, G, F, fr, rng, r_, add, roll, thud, tick, clack, cut_whoosh, fx, gunshot, patter, Q  # noqa: E402
from dsp import modal, SR, ns, tt, dbg, place, widen, make_ir, convolve_st, integrated, true_peak, read_wav, write_wav, lp, hp, bp, colored, fades, smooth_noise  # noqa: E402

ROOT = os.path.dirname(HERE)
TOTAL = len(json.load(open(os.path.join(ROOT, "src", "videos", "emu", "talkP1v2.json"))))
ea.TOTAL = TOTAL; ea.DUR = TOTAL / 30; ea.N = ns(ea.DUR); N = ea.N
ea.music = {k: np.zeros((2, N)) for k in ("low", "mid", "mel", "drum")}
ea.sfx = np.zeros((2, N))
t = fr
NAME = "pompeii-1v2"
WORDS = json.load(open(os.path.join(ROOT, "voice", NAME, "words.json"), encoding="utf-8"))
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
def at(line, word=None, n=0):
    L = [w for w in WORDS if w["line"] == line]
    if word is None: return round(L[0]["a"] * 30)
    return round([w for w in L if norm(w["w"]) == norm(word)][n]["a"] * 30)

# cue frames (30 fps) from the new narration
HOOKEND = 107
MORNING = at("morning") - 2            # 108
BLOWSTART = at("blow") - 2             # 304
BLAST = at("blow", "Vesuvius") - 3 + 5  # 352
STONES0 = at("stones") - 2 + 2         # 897
RIP0 = at("awning", "not") - 4         # 1048
SINK = at("next", "it") - 6            # 1126
LASTQ = at("next", "That") - 2         # 1163
CUTS = [0, 1, MORNING, BLOWSTART, BLAST, 399, 539, 734, 768, 806, 854, 998, 1048, 1094, LASTQ]

def _render():
    mm = ea.music
    mix = 0.9 * mm["low"] + 0.75 * mm["mid"] + 0.8 * mm["mel"] + 0.7 * mm["drum"]
    wet = convolve_st(0.3 * mm["mid"] + 0.5 * mm["mel"] + 0.35 * mm["drum"] + 0.15 * mm["low"], make_ir(1.6, 7, hf=0.5))[:, :N]
    return mix + 0.25 * wet

def rumble(dur, r, hi=70, shake=0.5):
    n = ns(dur); y = lp(colored(n, r, -1.5), hi, 3) * (1 + shake * smooth_noise(n, r, 9.0))
    return y / (np.abs(y).max() + 1e-9)
def wind(dur, r):
    n = ns(dur); y = bp(colored(n, r, -1.0), 250, 1300, 2) * (0.6 + 0.4 * smooth_noise(n, r, 0.3))
    return y / (np.abs(y).max() + 1e-9)
def bark(r, f0=420):
    n = ns(0.2); tm = np.arange(n) / SR; nz = r.standard_normal(n)
    env = np.exp(-tm / 0.05) * np.clip(tm / 0.004, 0, 1); ph = np.cumsum(f0 * (1.25 - 1.0 * tm)) / SR
    return fades(bp((np.sin(2 * np.pi * ph) + 0.5 * np.sin(4 * np.pi * ph)) * 0.6 + 0.5 * bp(nz, 700, 2600, 1), 280, 3000, 1) * env, 0.001, 0.03)
def jar(r, big=1.0):
    n = ns(0.55); tm = np.arange(n) / SR; nz = r.standard_normal(n)
    y = modal(0.5, [(r.uniform(700, 1400) * k, 0.6 / k, 0.05) for k in (1, 1.9, 3.1, 4.4)], r)[:n]
    y = np.pad(y, (0, max(0, n - len(y))))
    return fades((y + hp(nz, 2500) * np.exp(-tm / 0.05) * 0.8 + bp(nz, 500, 2500, 1) * np.exp(-tm / 0.02)) * big, 0.0005, 0.05)
def crack(r):
    n = ns(0.5); tm = np.arange(n) / SR; nz = r.standard_normal(n)
    return fades((hp(nz, 900) * np.exp(-tm / 0.03) * 1.2 + lp(nz, 400) * np.exp(-tm / 0.12) * 0.6), 0.0003, 0.05)
def tear(r, dur=0.7):
    n = ns(dur); nz = r.standard_normal(n); am = np.clip(0.5 + smooth_noise(n, r, 22.0), 0, 1.2)
    return fades(hp(nz, 700) * am * np.hanning(n) ** 0.5, 0.01, 0.05)
def grunt(r):
    n = ns(0.25); tm = np.arange(n) / SR
    return fades(bp(r.standard_normal(n), 180, 700, 2) * np.sin(np.pi * tm / 0.25) ** 2 * 1.2 + np.sin(2 * np.pi * 130 * tm) * np.exp(-tm / 0.08) * 0.6, 0.005, 0.05)

def feet(f0, f1, rate, g, hz=420, pn=0.0):
    r = rng(f0 * 7 + 3); fx(patter(max(0.2, (f1 - f0) / 30), r, rate, None, hz), f0, pn, g)
def crowd_shout(f0, f1, n, g, r):
    for k in range(n):
        f = int(f0 + (f1 - f0) * k / max(1, n)); b = r.uniform(120, 260)
        fx(widen(G.hurrah(r, b, 1.0, kid=(k % 3 == 0)) if k % 2 else G.whoa(r, b), r), f, r.uniform(-0.7, 0.7), g)
def stones(f0, f1, rate, g, r, dull=False):
    f = f0
    while f < f1:
        fx((thud(r, r.uniform(110, 180), 0.35) * 0.6 if dull else clack(r)), int(f), r.uniform(-0.7, 0.7), g * r.uniform(0.6, 1.0))
        f += max(1, r.exponential(30.0 / rate))

def build_music():
    tim = lambda f, m=38, v=0.8: add("drum", I.timpani(F(m), v, r_()), t(f), 0)
    cym = lambda f, v=0.4: add("drum", I.cymbal(v, r_()), t(f), 0.1)
    cut = ns(t(BLAST))
    # before the blast: one hit and tension in the hook, the light street tune, the tune faltering
    tim(1, 36, 1.0); el.stab(2, 0.6, (57, 60, 65)); cym(3, 0.4)
    el.tension(t(12), t(HOOKEND))
    el.light(t(MORNING), 4, 0.42)
    add("mel", I.fife(F(74), 0.4, 0.3, r_()), t(BLOWSTART + 6), 0); add("mel", I.fife(F(71), 0.5, 0.22, r_()), t(BLOWSTART + 22), 0); add("mel", I.fife(F(67), 0.9, 0.18, r_()), t(BLOWSTART + 38), 0)
    pre = _render(); k = ns(0.004)
    pre[:, cut:] = 0.0; pre[:, cut - k:cut] *= np.linspace(1, 0, k)[None, :]           # the tune stops dead: nothing of it, not even its reverb
    for key in ea.music: ea.music[key][:] = 0.0
    # after the blast
    tim(BLAST, 36, 1.0); el.stab(BLAST, 0.6, (55, 58, 62)); cym(BLAST + 1, 0.5)
    el.tension(t(399), t(539))
    roll(t(539), t(733), 0.15, 0.7)
    for f in (596, 782, 806, 897, 1025, 1048): tim(f, 40 - (f % 3) * 2, 0.7)
    el.sneak(t(734), 3)
    el.sad(t(SINK), ((0, 2, 57), (2, 2, 55), (4, 4, 53)))
    add("low", I.pad([F(33), F(40), F(45)], 3.2, 0.5, r_()), t(SINK), 0)                     # the dark drone
    tim(LASTQ, 34, 0.9)
    return pre + _render()

def build_sfx():
    r = rng(2024)
    for f in CUTS[2:]:
        if f not in (BLAST,): cut_whoosh(f, r, 0.12)
    # the blast seen first (0-107): boom, rumble, screams, running
    fx(gunshot(r, 1.0), 1, 0, 0.6); fx(thud(r, 44, 1.3), 2, 0, 0.8); fx(thud(r, 60, 1.0), 14, 0, 0.5)
    crowd_shout(8, 100, 7, 0.4, r); feet(10, 107, 15, 0.5)
    # envelope of the long rumble: strong in the hook, low under the morning, growing from 304, loud from the blast, under everything to the end
    R0 = rumble(ea.DUR, r); R0 = np.stack([R0, R0])
    env = np.interp(np.arange(N) / SR, [0, 0.5, 2.0, t(107), t(MORNING), t(304) - 0.5, t(BLAST), t(BLAST) + 1.2, t(BLAST) + 6, t(539), t(SINK), t(LASTQ), ea.DUR], [1.0, 1.0, 0.5, 0.15, 0.04, 0.04, 0.0, 1.0, 0.7, 0.85, 0.9, 0.25, 0.2])
    ea.sfx += R0 * env[None, :] * 0.8
    # the calm morning 108-303: tune (music), murmur, fountain, dog, rattling things
    d = t(BLOWSTART) - t(MORNING)
    place(ea.sfx, G.water_bed(d, r, 0.3) * 0.5, t(MORNING), 0.25)
    for k in range(6): place(ea.sfx, widen(G.babble(d + 1, r, r.uniform(110, 210), r.uniform(0.9, 1.15), rate=r.uniform(3.2, 4.4)), r), t(MORNING) + r.uniform(0, 0.8), 0.16)
    for f in (190, 205, 222): fx(bark(r), f, -0.2, 0.3)
    fx(G.rattle(1.2, r, 30.0) * 0.5, 230, 0.1, 0.35)
    for f in (252, 262): fx(jar(r, 0.5), f, -0.2, 0.5)
    for f in (278, 300): fx(G.clink(r, 2400), f, 0.2, 0.4)
    # 304: a rumble grows (envelope), jars smash
    for f in (324, 328, 336, 337): fx(jar(r, 0.8), f, r.uniform(-0.5, 0.5), 0.5)
    # the blast
    fx(gunshot(r, 1.0), BLAST, 0, 0.7); fx(thud(r, 40, 1.4), BLAST + 1, 0, 0.9); fx(widen(G.whoosh(1.6, r, peak=0.4, f_lo=90, f_hi=1500), r), BLAST - 6, 0, 0.5)
    # 399-539: the roar of the column, thunder cracks, then panic
    place(ea.sfx, widen(G.whoosh(5.0, r, peak=0.5, f_lo=60, f_hi=900), r), t(399), 0.4)
    for f in (412, 440, 463, 489, 512, 528): fx(crack(r), f, r.uniform(-0.6, 0.6), 0.5)
    crowd_shout(BLAST + 4, 539, 5, 0.35, r)
    crowd_shout(539, 733, 16, 0.4, r); feet(539, 733, 18, 0.5); feet(545, 700, 12, 0.3, 360, 0.5)
    fx(thud(r, 90, 0.9), 596, 0, 0.6); fx(grunt(r), 597, 0, 0.5); fx(grunt(r), 599, 0.3, 0.4); fx(jar(r, 0.8), 620, 0.2, 0.5)
    fx(G.timber_tear(r, 0.8), 621, 0, 0.5); fx(thud(r, 70, 1.0), 626, 0, 0.7); fx(G.wood_crack(r), 629, 0.2, 0.5)
    for f in (640, 644, 648): fx(jar(r, 0.8), f, r.uniform(-0.5, 0.5), 0.5)
    feet(709, 733, 22, 0.9, 380)
    # 734-767 one runner and the loaves; 768-805 heavy feet with armour
    feet(734, 767, 14, 0.6, 400)
    for f in (742, 749, 756, 762): fx(thud(r, 110, 0.35) * 0.6, f, 0.2, 0.4)
    feet(768, 805, 10, 0.8, 300)
    for f in range(770, 805, 4): fx(G.clink(r, 500), f, 0, 0.2)
    fx(thud(r, 80, 1.0), 782, 0, 0.7); fx(grunt(r), 783, 0, 0.4)
    # coins
    for k, f in enumerate(range(806, 829, 3)): fx(G.clink(r, 1700 + 80 * k), f, r.uniform(-0.3, 0.3), 0.35)
    for k, f in enumerate(range(830, 853, 2)): fx(G.clink(r, 2100 + 60 * (k % 5)), f, r.uniform(-0.3, 0.3), 0.25)
    feet(854, 894, 16, 0.6, 400)
    # the stones: sparse, denser to 945, dense to 997; a jar bursts at 964; feet; jump; stones on cloth
    stones(STONES0, 945, 4, 0.22, r); stones(945, 997, 16, 0.3, r); fx(jar(r, 1.0), 964, 0, 0.5)
    stones(997, 1094, 12, 0.25, r)
    feet(998, 1042, 14, 0.6); fx(widen(G.whoosh(0.5, r, peak=0.3, f_lo=300, f_hi=2500), r), 1014, 0, 0.4); fx(thud(r, 85, 1.0), 1025, 0, 0.6)
    stones(1025, 1047, 12, 0.5, r, dull=True)
    # the awning tears and falls
    fx(tear(r, 0.7), RIP0, 0, 0.6); fx(G.timber_tear(r, 0.8), RIP0 + 12, 0, 0.6)
    for f in (1058, 1061, 1063): fx(thud(r, 75, 1.0), f, r.uniform(-0.3, 0.3), 0.7)
    feet(1068, 1126, 14, 0.5)
    feet(1094, 1162, 14, 0.5)
    crowd_shout(1094, SINK, 5, 0.3, r)
    # the quiet end: wind, a far rumble, one drum, embers
    place(ea.sfx, widen(wind(ea.DUR - t(SINK) + 0.2, r), r) * 0.5, t(SINK), 0.35)
    for f in range(LASTQ + 8, TOTAL - 6, 11): fx(tick(r, 2600 + 300 * (f % 3), 0.006), f, r.uniform(-0.6, 0.6), 0.08)
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
    os.makedirs(os.path.join(ROOT, "public", "pompeii"), exist_ok=True)
    write_wav(os.path.join(ROOT, "public", "pompeii", "mix-1.wav"), mix, 16)
    print("mix: %.2f s, %.1f LUFS, true peak %.1f dBTP | voice %.1f, music %.1f, sfx %.1f LUFS" % (mix.shape[1] / SR, integrated(mix), true_peak(mix), integrated(voice), integrated(m), integrated(s)))

if __name__ == "__main__":
    main()

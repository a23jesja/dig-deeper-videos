# Sound for the Wojtek short (50.5 s): the house march score re-voiced for a Polish army camp, plus effects
# on the picture's frames (src/videos/emu/storyW.ts).  usage: python audio/wojtek_short_audio.py -> public/wojtek/mix.wav
import json, os, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import emu_long_audio as el  # noqa: E402  (defines the section helpers; we reset the buffers below)
import emu_audio as ea  # noqa: E402
from emu_audio import I, G, F, Q, fr, rng, r_, add, roll, tune, gunshot, thud, clack, tick, patter, scratch, cut_whoosh, fx  # noqa: E402
from dsp import SR, ns, dbg, pan, place, widen, make_ir, convolve_st, integrated, true_peak, read_wav, write_wav, lp, tt, phase  # noqa: E402

TOTAL = 1515
ea.TOTAL = TOTAL; ea.DUR = TOTAL / 30; ea.N = ns(ea.DUR); N = ea.N
ea.music = {k: np.zeros((2, N)) for k in ("low", "mid", "mel", "drum")}
ea.sfx = np.zeros((2, N))
t = fr

def growl(r, f0=95, dur=0.5, up=False):
    """a friendly bear noise: low voiced grunt"""
    x = tt(dur); f = f0 * (1 + (0.25 if up else -0.15) * x / dur) * (1 + 0.03 * np.sin(2 * np.pi * 31 * x))
    y = np.sign(np.sin(phase(f))) * 0.4 + np.sin(phase(f)) + 0.4 * np.sin(2 * phase(f))
    return lp(y, 520, 2) * np.sin(np.pi * x / dur) ** 0.7

def build_music():
    add("drum", I.timpani(F(43), 0.75, r_()), 0.0, 0); roll(0.05, t(66), 0.2, 0.5); el.stab(88, 0.5)
    el.pizz(t(108), [(0, .5, 67), (1, .5, 71), (2, .5, 74), (4, .5, 72), (5, .5, 76), (6, 1, 79)], 0.5)          # rank, number, beer
    el.light(t(209), 4, 0.4)                                                                                     # the cub
    add("mel", I.glock(F(86), 0.5, r_()), t(464), 0.2)
    el.march(t(493), 5, 0.5)                                                                                     # he copies the soldiers
    el.sad(t(648), ((0, 2, 62), (2, 2, 59), (4, 3, 55)))                                                         # no pets
    el.pizz(t(764), [(0, 1, 62), (1, 1, 66), (2, 1, 69), (4, .5, 74), (4.5, .5, 76), (5, 1, 78), (6, 2, 79)], 0.5)   # private Wojtek
    add("drum", I.cymbal(0.4, r_()), t(832), 0.1)
    el.tension(t(895), t(990)); el.march(t(992), 4, 0.5)                                                         # Monte Cassino
    roll(t(1119), t(1142), 0.15, 0.6); add("drum", I.timpani(F(43), 0.8, r_()), t(1144), 0); el.stab(1144, 0.55); el.stab(1174, 0.5, (62, 66, 69)); add("drum", I.cymbal(0.4, r_()), t(1174), 0.1)
    el.sad(t(1264), ((0, 3, 67), (3, 1, 66), (4, 3, 62), (7, 1, 64), (8, 4, 67)))                                # the zoo
    el.pizz(t(1410), [(0, 1, 74), (1, .5, 71), (1.5, .5, 74), (2, 1, 79), (3, 1, 76), (4, 2, 79)], 0.5)
    tb = t(1484); add("low", I.brass(F(43), 0.3, 0.6, r_(), "tuba"), tb, -0.08); el.stab(1484, 0.45)
    m = ea.music
    mix = 0.9 * m["low"] + 0.75 * m["mid"] + 0.8 * m["mel"] + 0.7 * m["drum"]
    wet = convolve_st(0.3 * m["mid"] + 0.5 * m["mel"] + 0.35 * m["drum"] + 0.15 * m["low"], make_ir(1.1, 7, hf=0.6))[:, :N]
    return mix + 0.22 * wet

def build_sfx():
    r = rng(79)
    place(ea.sfx, G.breeze(ea.DUR, r, 0.35), 0, 0.5)
    place(ea.sfx, pan(G.bird_chirps(ea.DUR, r, 0.25, "blackbird"), -0.4), 0, 0.05)
    for f, g in [(62, 0.4), (990, 0.4)]: cut_whoosh(f, r, g)
    fx(widen(G.whoosh(0.7, r, peak=0.3, f_lo=600, f_hi=5000), r), 199, 0, 0.5)
    fx(growl(r, 90, 0.5, True), 90, 0, 0.5)                    # "a bear"
    for f in [116, 134]: fx(tick(r, 2600, 0.02), f, 0.2, 0.4)
    fx(growl(r, 110, 0.4, True), 188, 0, 0.4)
    fx(growl(r, 190, 0.3, True), 300, 0, 0.35)                 # the cub
    for f in [372, 386, 400, 414, 428]: fx(tick(r, 500, 0.03), f, 0, 0.22)   # glug
    fx(thud(r, 70, 0.8), 512, 0, 0.7)                          # grown up
    fx(thud(r, 60, 1.0), 566, 0.3, 0.8); fx(growl(r, 85, 0.5), 552, 0, 0.45)
    for k in range(7): fx(G.boot(r, 0.8), 597 + int(k * 7.2), r.uniform(-0.3, 0.3), 0.22)
    for k in range(8): fx(G.boot(r, 0.5), 650 + k * 7, 0.3, 0.14)
    fx(growl(r, 80, 0.7), 728, 0, 0.4)                          # not allowed
    fx(tick(r, 2600, 0.02), 825, 0.2, 0.4); fx(scratch(r, 0.2), 866, 0, 0.4)
    for f in [905, 935, 965, 1010, 1050, 1096]: fx(gunshot(r, 1.4), f, 0.2, 0.8 if f < 990 else 0.45); fx(thud(r, 48, 1.0), f + 18, -0.3, 0.5 if f < 990 else 0.3)
    for k in range(11): fx(G.boot(r, 0.9), 998 + k * 8, 0, 0.2)
    fx(thud(r, 75, 0.9), 1088, 0, 0.8); fx(growl(r, 100, 0.4, True), 1100, 0, 0.4)
    fx(tick(r, 2600, 0.02), 1144, 0.2, 0.4)
    fx(growl(r, 85, 0.6, True), 1444, 0, 0.5)                  # he answers
    return ea.sfx

def main():
    ROOT = os.path.dirname(HERE)
    words = json.load(open(os.path.join(ROOT, "voice", "wojtek-short", "words.json")))
    v, sr = read_wav(os.path.join(ROOT, "voice", "wojtek-short", "voice.wav")); assert sr == SR
    voice = np.zeros((2, N)); vv = v[0][:N]; voice[:, : len(vv)] = vv
    voice *= dbg(-16.0 - integrated(voice))
    m = build_music(); s = build_sfx()
    m *= dbg(-16.0 - 10.0 - integrated(m)); m *= ea.duck(words, -3.0)[None, :]
    s *= ea.duck(words, -2.0)[None, :]; s *= dbg(-8.0) / max(np.abs(s).max(), 1e-9)
    mix = voice + m + s
    mix *= dbg(-14.0 - integrated(mix)); mix = ea.limiter(mix)
    mix[:, -ns(0.25):] *= np.linspace(1, 0, ns(0.25))[None, :]
    os.makedirs(os.path.join(ROOT, "public", "wojtek"), exist_ok=True)
    write_wav(os.path.join(ROOT, "public", "wojtek", "mix.wav"), mix, 16)
    print("mix: %.2f s, %.1f LUFS, true peak %.1f dBTP | voice %.1f, music %.1f, sfx %.1f LUFS" % (mix.shape[1] / SR, integrated(mix), true_peak(mix), integrated(voice), integrated(m), integrated(s)))

if __name__ == "__main__":
    main()

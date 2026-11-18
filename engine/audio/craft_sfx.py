# Sound on the picture (step E of the big build, DAILY-RULES "The craft kit" point 4): every sound here is synthesised by this file
# from sines and noise. Nothing is downloaded and nothing comes from a sound library (see audio/SOUNDS.md).
# A film lists its cues with the frame they happen on (a foot landing, a pot hitting the ground); this file makes each sound and puts
# it on that frame, with beds (wind, crowd, fire) under them and the voice on top.
#
#   as a script:   python audio/craft_sfx.py <cues.json> <out.wav>
#   cues.json:     { "fps": 30, "frames": 408,
#                    "voice": { "file": "voice/kit-test/voice.wav", "frame": 172 },           (optional)
#                    "cues":  [ { "f": 31, "k": "step", "g": 1, "p": -0.4, "run": false }, ... ],
#                    "beds":  [ { "k": "wind", "f0": 0, "f1": 408, "g": 0.5 }, ... ] }
#   kinds of cue:  step, scuff, thud, smash, coin, coinroll, blast, crack, tear, creak, whoosh, bark, splash, snap, shing, thunk, flap, rope, rattle,
#                  paper, tap, ting, sack, fall, bubble, spray, drip, book, pour, squelch, scratch, sniff, gavel, munch   (see SOUNDS.md)
#   kinds of bed:  wind, crowd, panic, fire, rumble, sea, surf, lap, flap, flies, street, birds, court
# The mix: voice at -16 LUFS, effects under it, the whole at -14 LUFS with a true peak under -1 dB.
import inspect, json, os, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "lib"))
from dsp import SR, ns, tt, dbg, rng, lp, hp, bp, colored, smooth_noise, fades, phase, modal, pan, st, place, widen, make_ir, convolve_st, integrated, true_peak, norm_to, read_wav, write_wav  # noqa: E402

TAU = 2 * np.pi


# ---------------------------------------------------------------- one-shot sounds (mono)
def step(r, run=False, surface="stone"):
    """a leather sole: on paving a low knock, the click of the heel and a short scrape; on sand soft and dull, with no click;
    on wood the hollow knock of a deck"""
    d = 0.11 if run else 0.16; t = tt(d); nz = r.standard_normal(len(t))
    f0 = r.uniform(95, 130) * (1.15 if run else 1.0)
    if surface == "sand":
        thump = np.sin(phase(f0 * 0.6 * (1 + 0.3 * np.exp(-t / 0.01)))) * np.exp(-t / 0.025) * 0.7
        puff = lp(bp(nz, 250, 1800, 1), 1800) * np.exp(-((t - 0.025) / 0.035) ** 2) * (0.5 if run else 0.45)
        return fades((thump + puff) * (1.2 if run else 1.0), 0.003, 0.03)
    if surface == "wood":
        f = r.uniform(165, 215) * (1.1 if run else 1.0); dw = d + 0.06; tw = tt(dw)
        knock = modal(dw, [(f, 0.9, 0.035), (f * 1.62, 0.5, 0.025), (f * 2.4, 0.25, 0.018)], r) + np.sin(phase(f0 * 0.7 * (1 + 0.5 * np.exp(-tw / 0.01)))) * np.exp(-tw / 0.02) * 0.5
        return fades((knock + hp(r.standard_normal(len(tw)), 1500) * np.exp(-tw / 0.004) * 0.25) * (1.15 if run else 1.0), 0.0005, 0.03)
    knock = np.sin(phase(f0 * (1 + 0.5 * np.exp(-t / 0.008)))) * np.exp(-t / (0.022 if run else 0.03))
    click = hp(nz, 2200) * np.exp(-t / 0.004) * 0.7
    scrape = bp(nz, 500, 2600, 1) * np.exp(-((t - 0.03) / 0.03) ** 2) * (0.22 if run else 0.3)
    return fades((knock * 0.9 + click + scrape) * (1.25 if run else 1.0), 0.0005, 0.02)


def scuff(r, dur=0.22):
    """a shoe sliding on stone (a skid, a stumble)"""
    t = tt(dur); nz = colored(len(t), r, 0.6)
    return fades(bp(nz, 700, 4200, 1) * np.exp(-((t - dur * 0.35) / (dur * 0.3)) ** 2) * 0.6, 0.004, 0.04)


def thud(r, big=1.0, surface=None):
    """a body or a heavy thing hitting the ground (the surface is ignored: it is a low thump on any of them)"""
    t = tt(0.42); nz = r.standard_normal(len(t)); f0 = r.uniform(52, 68)
    y = np.sin(phase(f0 * (1 + 0.7 * np.exp(-t / 0.02)))) * np.exp(-t / 0.09) + 0.55 * lp(nz, 320) * np.exp(-t / 0.035) + 0.16 * bp(nz, 800, 3200, 1) * np.exp(-t / 0.012)
    return fades(y * big, 0.0005, 0.05)


def smash(r, big=1.0):
    """a clay pot breaking: one crack, then the shards ring and scatter"""
    dur = 0.9; t = tt(dur); y = hp(r.standard_normal(len(t)), 1500) * np.exp(-t / 0.006) * 1.1 + bp(r.standard_normal(len(t)), 300, 1200, 1) * np.exp(-t / 0.03) * 0.8
    for i in range(int(9 + 6 * big)):
        at = abs(r.normal(0.02, 0.16)) if i > 2 else r.uniform(0, 0.02); f = r.uniform(1400, 6200) * (0.75 if i % 4 == 0 else 1.0)
        sh = modal(0.25, [(f, 0.6, r.uniform(0.012, 0.045)), (f * r.uniform(1.4, 1.9), 0.4, r.uniform(0.008, 0.03)), (f * r.uniform(2.3, 2.9), 0.25, 0.01)], r)
        k = ns(at); n = min(len(sh), len(y) - k)
        if n > 0: y[k:k + n] += sh[:n] * (0.55 * np.exp(-at / 0.3))
    return fades(y * 0.8 * big, 0.0003, 0.08)


def coin(r):
    """one coin landing on stone"""
    f = r.uniform(4100, 5200)
    return fades(modal(0.3, [(f, 0.6, 0.06), (f * 1.52, 0.45, 0.045), (f * 2.18, 0.3, 0.03), (f * 2.9, 0.2, 0.02)], r) + hp(r.standard_normal(ns(0.3)), 5000) * np.exp(-tt(0.3) / 0.002) * 0.3, 0.0003, 0.05)


def coinroll(r, dur=1.4):
    """a coin rolling away and settling: the taps come faster and faster"""
    y = np.zeros(ns(dur)); f = r.uniform(4300, 5000); t = 0.25 * dur; gap = 0.085
    whirr = bp(colored(ns(dur * 0.3), r, 0.3), 2500, 7000, 1) * np.linspace(0.25, 0.05, ns(dur * 0.3)); y[:len(whirr)] += whirr
    while t < dur - 0.05 and gap > 0.006:
        tk = modal(0.08, [(f, 0.5, 0.02), (f * 1.5, 0.3, 0.014)], r); k = ns(t); n = min(len(tk), len(y) - k); y[k:k + n] += tk[:n] * min(1.0, gap / 0.05)
        t += gap; gap *= 0.86
    return fades(y, 0.002, 0.03)


def blast(r, big=1.0):
    """the mountain going off: a deep punch, a roar, a long tail"""
    dur = 3.2; t = tt(dur); nz = colored(len(t), r, 1.6)
    punch = np.sin(phase(38 * (1 + 1.4 * np.exp(-t / 0.05)))) * np.exp(-t / 0.35)
    roar = lp(nz, 260) * (np.exp(-t / 0.9) + 0.25 * np.exp(-t / 2.2)) * (1 + 0.3 * smooth_noise(len(t), r, 9))
    crack_ = hp(r.standard_normal(len(t)), 900) * np.exp(-t / 0.03) * 0.5
    return fades((punch * 1.2 + roar * 0.9 + crack_) * big, 0.001, 0.4)


def crack(r):
    """wood or stone giving way"""
    t = tt(0.25); nz = r.standard_normal(len(t))
    return fades(hp(nz, 1200) * np.exp(-t / 0.004) + bp(nz, 250, 1400, 1) * np.exp(-t / 0.035) * 0.9 + np.sin(phase(180 * (1 + np.exp(-t / 0.01)))) * np.exp(-t / 0.04) * 0.5, 0.0003, 0.03)


def tear(r, dur=0.6):
    """cloth ripping (an awning)"""
    t = tt(dur); nz = r.standard_normal(len(t)); f = 900 + 2600 * (t / dur)
    grain = (np.sin(phase(60 + 90 * t / dur)) > 0.2).astype(float)
    return fades(bp(nz, 700, 6000, 1) * (0.35 + 0.65 * grain) * np.sin(np.pi * t / dur) ** 0.5 * (0.5 + 0.5 * np.sin(phase(f * 0.02))) * 0.7, 0.01, 0.06)


def creak(r, dur=0.7):
    """a cart or a beam leaning over"""
    t = tt(dur); f = r.uniform(190, 260) * (1 + 0.35 * t / dur + 0.04 * np.sin(TAU * 7 * t))
    saw = 2 * ((phase(f) / TAU) % 1) - 1
    return fades(bp(saw, 300, 2400, 1) * np.sin(np.pi * t / dur) ** 0.7 * 0.5, 0.02, 0.08)


def whoosh(r, dur=0.4):
    """something passing fast (a stone falling, an arm, a runner close to the lens)"""
    t = tt(dur); nz = colored(len(t), r, 0.8); c = 500 + 2500 * np.sin(np.pi * t / dur)
    y = np.zeros(len(t)); step_ = ns(0.01)
    for i in range(0, len(t), step_):
        seg = nz[i:i + step_ * 2]; y[i:i + len(seg)] += bp(np.pad(seg, (64, 64)), max(120, c[i] * 0.6), min(9000, c[i] * 1.5), 1)[64:64 + len(seg)] * 0.5
    return fades(y * np.sin(np.pi * t / dur) ** 1.5 * 0.8, 0.02, 0.05)


def bark(r, f0=430):
    """a dog's bark"""
    t = tt(0.2); f = f0 * (1 + 0.5 * np.exp(-t / 0.03) - 0.25 * t / 0.2)
    src = np.sign(np.sin(phase(f))) * 0.5 + 0.3 * r.standard_normal(len(t))
    return fades((bp(src, 500, 1500, 1) + 0.5 * bp(src, 1800, 3200, 1)) * np.exp(-((t - 0.05) / 0.07) ** 2), 0.004, 0.03)


# ---- the sea, the street and the things people hold
def splash(r, big=1.0):
    """something going into water: a slap, a rush of foam, bubbles rising, drops falling back"""
    dur = 0.8 + 0.5 * min(big, 2); t = tt(dur); nz = r.standard_normal(len(t))
    slap = bp(nz, 500, 5500, 1) * np.exp(-t / (0.07 + 0.05 * big)) * (1 - np.exp(-t / 0.002))
    rush = lp(bp(colored(len(t), r, 0.5), 200, 3200, 1), 3000) * np.exp(-t / (0.25 + 0.15 * big)) * 0.5
    low = np.sin(phase(70 * (1 + 0.6 * np.exp(-t / 0.05)))) * np.exp(-t / 0.12) * 0.5 * min(big, 1.8)
    y = slap * 0.9 + rush + low
    for _ in range(int(5 + 6 * big)):
        at = r.uniform(0.04, dur * 0.7); f = r.uniform(500, 2200); L = ns(r.uniform(0.03, 0.07)); tl = np.arange(L) / SR
        b = np.sin(phase(f * (1 + 1.4 * tl / tl[-1]))) * np.exp(-tl / 0.02) * r.uniform(0.15, 0.4); k = ns(at); n = min(L, len(y) - k)
        if n > 0: y[k:k + n] += b[:n]
    for _ in range(int(6 * big)):
        at = r.uniform(0.15, dur * 0.95); k = ns(at); L = ns(0.012); n = min(L, len(y) - k)
        if n > 0: y[k:k + n] += hp(r.standard_normal(L + 16), 3000)[16:16 + n] * np.exp(-np.arange(n) / (SR * 0.003)) * r.uniform(0.1, 0.35)
    return fades(y * 0.8 * big ** 0.6, 0.001, 0.15)


def snap(r):
    """a shark's jaws clacking shut: two hard knocks, the second softer"""
    t = tt(0.3); y = np.zeros(len(t)); nz = r.standard_normal(len(t))
    for at, g in ((0.0, 1.0), (0.034, 0.5)):
        k = ns(at); L = len(t) - k; tl = np.arange(L) / SR
        knock = modal(L / SR, [(r.uniform(900, 1300), 0.8, 0.012), (r.uniform(2200, 3100), 0.5, 0.008), (r.uniform(300, 420), 0.7, 0.03)], r)
        y[k:] += (knock + hp(nz[:L], 2500) * np.exp(-tl / 0.0025) * 0.9) * g
    return fades(y * 0.8, 0.0003, 0.05)


def shing(r):
    """a blade drawn and ringing: a short scrape, then the steel rings with a shimmer"""
    dur = 1.1; t = tt(dur); nz = r.standard_normal(len(t)); f = r.uniform(2700, 3300)
    scrape = bp(nz, 3000, 11000, 1) * np.exp(-((t - 0.06) / 0.07) ** 2) * 0.5
    ring = modal(dur, [(f, 0.7, 0.55), (f * 2.76, 0.5, 0.4), (f * 5.40, 0.3, 0.25), (f * 8.93, 0.15, 0.12), (f * 1.003, 0.4, 0.5)], r) * (1 + 0.15 * np.sin(TAU * 7 * t)) * (1 - np.exp(-t / 0.04))
    return fades((scrape + ring * 0.55), 0.002, 0.2)


def thunk(r):
    """a dull knock of something solid landing on wood"""
    t = tt(0.25); nz = r.standard_normal(len(t)); f = r.uniform(120, 160)
    return fades(np.sin(phase(f * (1 + 0.4 * np.exp(-t / 0.012)))) * np.exp(-t / 0.045) + lp(nz, 900) * np.exp(-t / 0.012) * 0.6 + hp(nz, 2500) * np.exp(-t / 0.002) * 0.15, 0.0005, 0.04)


def flap(r):
    """a cloth snapping in the wind: a few cracks, each one softer, with a flutter between"""
    dur = 0.55; t = tt(dur); nz = r.standard_normal(len(t)); y = np.zeros(len(t))
    for i, at in enumerate([0.0, 0.09, 0.17, 0.26, 0.37]):
        k = ns(at); L = len(t) - k; tl = np.arange(L) / SR
        y[k:] += (bp(nz[:L], 700, 4800, 1) * np.exp(-tl / 0.012) + hp(r.standard_normal(L), 3000) * np.exp(-tl / 0.003) * 0.5) * (0.9 ** (i * 2)) * r.uniform(0.8, 1)
    y += bp(nz, 300, 2000, 1) * (0.25 + 0.1 * np.sin(TAU * 38 * t)) * np.exp(-t / 0.25) * 0.4
    return fades(y * 0.7, 0.0005, 0.1)


def rope(r):
    """a short creak of rope under strain: a stick-and-slip squeal"""
    dur = 0.38; t = tt(dur); f = r.uniform(140, 190) * (1 + 0.15 * t / dur + 0.03 * np.sin(TAU * 9 * t))
    slip = 0.55 + 0.45 * (np.sin(phase(f * 0.5)) > 0)
    saw = 2 * ((phase(f) / TAU) % 1) - 1
    return fades(bp(saw * slip + 0.25 * r.standard_normal(len(t)), 250, 2200, 1) * np.sin(np.pi * t / dur) ** 0.8 * 0.5, 0.02, 0.07)


def rattle(r, dur=0.8):
    """a box shaken with coins and small things loose inside it"""
    n = ns(dur); t = np.arange(n) / SR; y = np.zeros(n); beat = 0.5 + 0.5 * np.sin(TAU * 7.5 * t)
    for _ in range(int(dur * 70)):
        at = r.uniform(0, dur - 0.05)
        if r.uniform() > 0.25 + 0.75 * beat[min(n - 1, ns(at))]: continue
        k = ns(at); f = r.uniform(1800, 5200); tk = modal(0.06, [(f, 0.6, r.uniform(0.006, 0.02)), (f * 1.5, 0.3, 0.01)], r) * r.uniform(0.2, 1.0); m = min(len(tk), n - k)
        y[k:k + m] += tk[:m]
    y += lp(r.standard_normal(n), 600) * beat * 0.25
    return fades(y * 0.6, 0.02, 0.08)


def paper(r):
    """paper or card slid out and unfolded: a dry rustle with crinkle ticks"""
    dur = 0.4; t = tt(dur); nz = r.standard_normal(len(t))
    ticks = np.zeros(len(t))
    for _ in range(22):
        k = ns(r.uniform(0, dur - 0.03)); L = ns(0.006); ticks[k:k + L] += hp(r.standard_normal(L), 2500)[:L] * r.uniform(0.2, 1.0)
    y = bp(nz, 2200, 9000, 1) * (0.25 + 0.75 * smooth_noise(len(t), r, 25) ** 2) * np.sin(np.pi * t / dur) ** 0.7 * 0.5 + ticks * 0.5
    return fades(y, 0.01, 0.06)


def gavel(r):
    """a judge's gavel struck on its block: a hard, bright wooden crack with the short ring of the block under it"""
    t = tt(0.35); nz = r.standard_normal(len(t))
    body = sum(a * np.sin(phase(f * (1 + 0.05 * np.exp(-t / 0.004)))) * np.exp(-t / d) for f, a, d in ((r.uniform(560, 640), 0.8, 0.05), (r.uniform(1150, 1300), 0.45, 0.03), (r.uniform(190, 230), 0.6, 0.06)))
    y = body + bp(nz, 1500, 7000, 1) * np.exp(-t / 0.004) * 0.9 + lp(nz, 600) * np.exp(-t / 0.01) * 0.4
    return fades(y, 0.0003, 0.05)


def munch(r, dur=0.6):
    """a beetle chewing a leaf, heard close to: quick dry nibbles in a little burst"""
    n = ns(dur); y = np.zeros(n); t0 = 0.0
    while t0 < dur - 0.02:
        k = ns(t0); L = min(ns(0.008), n - k); y[k:k + L] += hp(r.standard_normal(L), 3000)[:L] * np.exp(-np.arange(L) / ns(0.002)) * r.uniform(0.4, 1.0)
        t0 += r.uniform(0.045, 0.085)
    return fades(y * 0.8, 0.005, 0.05)


def tap(r):
    """a fingertip knocking on card, a plank or a forehead"""
    t = tt(0.14); nz = r.standard_normal(len(t)); f = r.uniform(380, 520)
    return fades(np.sin(phase(f * (1 + 0.3 * np.exp(-t / 0.01)))) * np.exp(-t / 0.02) * 0.9 + bp(nz, 900, 3500, 1) * np.exp(-t / 0.006) * 0.5 + hp(nz, 3000) * np.exp(-t / 0.0015) * 0.3, 0.0004, 0.03)


def ting(r):
    """a small bright metal ring"""
    f = r.uniform(3300, 4100)
    return fades(modal(0.7, [(f, 0.7, 0.28), (f * 2.41, 0.4, 0.16), (f * 3.9, 0.2, 0.09), (f * 5.6, 0.1, 0.05)], r) * (1 - np.exp(-tt(0.7) / 0.0008)), 0.0003, 0.1)


def sack(r):
    """a heavy cloth bag dropped: a soft thump, the cloth settling, and the coins inside jingling"""
    dur = 0.8; t = tt(dur); nz = r.standard_normal(len(t))
    thump = np.sin(phase(r.uniform(70, 90) * (1 + 0.5 * np.exp(-t / 0.03)))) * np.exp(-t / 0.07) + lp(nz, 450) * np.exp(-t / 0.05) * 0.5
    y = thump.copy()
    for i in range(9):
        at = 0.02 + abs(r.normal(0.07, 0.1)); k = ns(at); f = r.uniform(3200, 5600); tk = modal(0.2, [(f, 0.5, 0.05), (f * 1.52, 0.3, 0.035)], r) * 0.22 * np.exp(-at / 0.2); m = min(len(tk), len(y) - k)
        if m > 0: y[k:k + m] += tk[:m]
    return fades(y * 0.9, 0.001, 0.12)


def fall(r, dur=1.0):
    """the comic whistle of somebody falling a long way: a thin tone sliding down in pitch, wobbling, fading as it goes"""
    dur = max(0.3, dur); t = tt(dur); u = t / dur; f = 2300 * (180 / 2300) ** (u ** 0.85)
    ph = phase(f * (1 + 0.012 * np.sin(TAU * 7 * t)))
    y = np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.05 * np.sin(3 * ph)
    env = np.minimum(1, t / 0.03) * (1 - 0.8 * u ** 2) * (1 - np.exp(-(dur - t) / 0.04) * 0)
    return fades(y * env * 0.5, 0.01, 0.08)


def bubble(r):
    """bubbles breaking at the surface: three small rising pops"""
    dur = 0.55; y = np.zeros(ns(dur))
    for at in sorted(r.uniform(0, 0.4, 3)):
        L = ns(0.09); tl = np.arange(L) / SR; f = r.uniform(300, 700); b = np.sin(phase(f * (1 + 2.2 * tl / tl[-1]))) * np.exp(-tl / 0.025) * (1 - np.exp(-tl / 0.003)); k = ns(at)
        y[k:k + L] += b[:min(L, len(y) - k)] * r.uniform(0.5, 1.0)
    return fades(y * 0.6, 0.002, 0.05)


def spray(r):
    """water blown or thrown out of a mouth: a wet burst of fine drops"""
    dur = 0.55; t = tt(dur); nz = r.standard_normal(len(t))
    y = hp(nz, 3500) * np.exp(-t / 0.12) * (1 - np.exp(-t / 0.004)) * (0.6 + 0.4 * smooth_noise(len(t), r, 40)) + bp(nz, 800, 3000, 1) * np.exp(-t / 0.05) * 0.4
    return fades(y * 0.6, 0.002, 0.1)


def drip(r):
    """one drop falling into water: a small round plink"""
    t = tt(0.3); f = r.uniform(900, 1500)
    return fades(np.sin(phase(f * (1 + 0.9 * np.exp(-t / 0.03)))) * np.exp(-t / 0.045) * (1 - np.exp(-t / 0.001)) * 0.8 + hp(r.standard_normal(len(t)), 4000) * np.exp(-t / 0.002) * 0.1, 0.0005, 0.05)


def book(r):
    """a book dropped or slapped flat: a soft thwap"""
    t = tt(0.3); nz = r.standard_normal(len(t))
    return fades(lp(nz, 1800) * np.exp(-t / 0.025) * 0.8 + np.sin(phase(r.uniform(95, 125) * (1 + 0.4 * np.exp(-t / 0.02)))) * np.exp(-t / 0.05) * 0.7 + hp(nz, 3500) * np.exp(-t / 0.002) * 0.2, 0.0008, 0.06)


def pour(r, dur=1.0):
    """liquid pouring from a jug into a tub: a steady wet rush with small bubbles in it"""
    dur = max(0.2, dur); n = ns(dur); t = np.arange(n) / SR
    y = bp(colored(n, r, 0.4), 500, 4000, 1) * (0.7 + 0.3 * smooth_noise(n, r, 9)) * 0.55 + lp(r.standard_normal(n), 400) * 0.18
    for _ in range(int(dur * 38)):
        at = r.uniform(0, dur); L = ns(r.uniform(0.012, 0.03)); tl = np.arange(L) / SR; f = r.uniform(700, 2400)
        b = np.sin(phase(f * (1 + 1.5 * tl / tl[-1]))) * np.exp(-tl / 0.01) * r.uniform(0.05, 0.22); k = ns(at); m = min(L, n - k)
        if m > 0: y[k:k + m] += b[:m]
    return fades(y * 0.8, 0.05, 0.12)


def squelch(r):
    """a foot pressed into wet cloth: a low wet suck with a bubble at the end"""
    dur = 0.34; t = tt(dur); nz = r.standard_normal(len(t))
    wet = bp(nz, 250, 1400, 1) * (0.6 + 0.4 * np.sin(TAU * 38 * t)) * np.sin(np.pi * np.minimum(t / 0.2, 1)) ** 1.2 * np.exp(-t / 0.14)
    sweep = np.sin(phase(380 * np.exp(-2.2 * t / dur))) * np.exp(-t / 0.08) * 0.5
    pop = np.sin(phase(r.uniform(500, 800) * (1 + 1.6 * np.clip(t - 0.15, 0, 1) / 0.08))) * np.exp(-np.clip(t - 0.15, 0, 9) / 0.02) * (t > 0.15) * 0.4
    return fades((wet * 1.6 + sweep + pop) * 0.9, 0.004, 0.08)


def scratch(r):
    """a stylus scratching in wax: a thin dry rasp that sweeps"""
    dur = 0.3; t = tt(dur); nz = r.standard_normal(len(t))
    c = 3000 + 2500 * np.sin(np.pi * t / dur); g = 0.5 + 0.5 * np.sin(phase(150 + 60 * t / dur))
    y = np.zeros(len(t)); step_ = ns(0.01)
    for i in range(0, len(t), step_):
        seg = nz[i:i + step_ * 2]; y[i:i + len(seg)] += bp(np.pad(seg, (64, 64)), max(1500, c[i] * 0.7), min(10000, c[i] * 1.5), 1)[64:64 + len(seg)] * 0.5
    return fades(y * (0.4 + 0.6 * g) * np.sin(np.pi * t / dur) ** 0.6 * 0.6, 0.01, 0.06)


def sniff(r):
    """a quick breath in through the nose"""
    dur = 0.24; t = tt(dur); nz = r.standard_normal(len(t))
    y = np.zeros(len(t)); c = 1400 + 2400 * t / dur; step_ = ns(0.01)
    for i in range(0, len(t), step_):
        seg = nz[i:i + step_ * 2]; y[i:i + len(seg)] += bp(np.pad(seg, (64, 64)), c[i] * 0.55, c[i] * 1.6, 1)[64:64 + len(seg)] * 0.5
    return fades(y * np.sin(np.pi * np.minimum(t / dur, 1)) ** 0.8 * (1 - 0.5 * (t / dur)) * 0.9, 0.012, 0.05)


# ---------------------------------------------------------------- beds (stereo)
def wind(dur, r, gust=1.0):
    n = ns(dur); out = []
    for ch in range(2):
        nz = colored(n, r, 1.1); g = 0.55 + 0.45 * smooth_noise(n, r, 0.35) * gust
        out.append((bp(nz, 180, 900, 1) * g + 0.25 * bp(nz, 900, 3000, 1) * np.clip(g - 0.4, 0, 1)) * 0.5)
    return fades(np.stack(out), 0.6, 0.8)


def crowd(dur, r, panic=False, people=22):
    """voices without words: each one a band of noise that opens and closes like speech; in a panic they are higher, faster and they shout"""
    n = ns(dur); out = np.zeros((2, n)); t = np.arange(n) / SR
    for i in range(people):
        f1 = r.uniform(380, 720) * (1.3 if panic else 1.0); f2 = f1 * r.uniform(2.2, 3.4)
        rate = r.uniform(3.0, 5.0) * (1.5 if panic else 1.0)
        syl = np.clip(np.sin(TAU * rate * t + r.uniform(0, TAU)) * 0.8 + 0.5 * smooth_noise(n, r, 1.2), 0, 1) * np.clip(0.6 + 0.6 * smooth_noise(n, r, 0.25), 0, 1)
        buzz = np.sign(np.sin(phase(r.uniform(105, 230) * (1.25 if panic else 1.0) * (1 + 0.08 * smooth_noise(n, r, 2.0))))) * 0.5 + 0.5 * r.standard_normal(n)
        v = (bp(buzz, f1 * 0.8, f1 * 1.25, 1) + 0.6 * bp(buzz, f2 * 0.85, f2 * 1.15, 1)) * syl
        out += pan(v, r.uniform(-0.9, 0.9)) * r.uniform(0.4, 1.0)
    if panic:
        for _ in range(int(dur * 1.6)):
            L = ns(r.uniform(0.25, 0.5)); tl = np.arange(L) / SR; f = r.uniform(420, 760) * (1 + 0.35 * tl / tl[-1])
            sh = bp(np.sign(np.sin(phase(f))) + 0.4 * r.standard_normal(L), 600, 2600, 1) * np.clip(np.sin(np.pi * tl / tl[-1]), 0, None) ** 0.6
            place(out, pan(sh, r.uniform(-0.9, 0.9)), r.uniform(0, max(0.1, dur - 0.6)), r.uniform(0.8, 1.6))
    return fades(out / np.sqrt(people) * 0.9, 0.3, 0.5)


def fire(dur, r):
    n = ns(dur); t = np.arange(n) / SR; out = []
    for ch in range(2):
        roar = lp(colored(n, r, 1.3), 420) * (0.6 + 0.4 * smooth_noise(n, r, 5)) * 0.6
        pops = np.zeros(n)
        for _ in range(int(dur * 14)):
            k = int(r.uniform(0, n - ns(0.02))); L = ns(r.uniform(0.004, 0.02)); pops[k:k + L] += hp(r.standard_normal(L + 32), 2500)[32:] * np.exp(-np.arange(L) / (SR * 0.003)) * r.uniform(0.2, 1.0)
        out.append(roar + pops * 0.5)
    return fades(np.stack(out), 0.4, 0.6)


def rumble(dur, r):
    n = ns(dur); out = []
    for ch in range(2): out.append(lp(colored(n, r, 1.8), 85) * (0.7 + 0.3 * smooth_noise(n, r, 2.5)))
    return fades(np.stack(out) * 1.4, 0.3, 0.8)

def _swells(n, r, period, depth=1.0):
    """slow swell curve in 0..1: the sea rising and falling, not quite regular"""
    t = np.arange(n) / SR; ph = TAU * t / period + 1.5 * smooth_noise(n, r, 0.3) + r.uniform(0, TAU)
    return (0.5 + 0.5 * np.sin(ph)) ** (1.5) * depth + (1 - depth)


def sea(dur, r):
    """waves against a hull: a slow swell of low water noise, foam at the crest, and a slap and gurgle along the planks"""
    n = ns(dur); out = []
    for ch in range(2):
        sw = _swells(n, r, r.uniform(6.5, 8.5)); nz = colored(n, r, 1.0)
        y = bp(nz, 120, 1100, 1) * (0.3 + 0.7 * sw) * 0.6 + hp(colored(n, r, 0.4), 2500) * sw ** 3 * 0.14
        for _ in range(int(dur * 0.9)):
            at = r.uniform(0, max(0.1, dur - 0.5)); k = ns(at); L = ns(r.uniform(0.15, 0.3)); tl = np.arange(L) / SR
            sl = lp(r.standard_normal(L), 500) * np.exp(-tl / 0.06) * (1 - np.exp(-tl / 0.01)) * r.uniform(0.3, 0.9) * (0.4 + sw[min(n - 1, k)])
            m = min(L, n - k); y[k:k + m] += sl[:m]
        out.append(y)
    return fades(np.stack(out) * 0.9, 0.8, 1.0)


def surf(dur, r):
    """small waves breaking and running up a beach: a rise, a hiss of foam, a long draw back"""
    n = ns(dur); out = np.zeros((2, n)); t = 0.0
    while t < dur:
        L = ns(r.uniform(3.6, 5.2)); tl = np.arange(L) / SR; T = tl[-1]
        env = np.sin(np.pi * np.minimum(tl / 1.3, 1) * 0.5) ** 2 * np.exp(-np.maximum(tl - 1.3, 0) / 1.5)
        body = bp(colored(L, r, 0.6), 300, 3500, 1) * env
        hiss = hp(colored(L, r, 0.3), 3500) * np.exp(-np.maximum(tl - 1.0, 0) / 0.8) * env * 0.3
        w = pan(body + hiss, r.uniform(-0.4, 0.4)); k = ns(t); m = min(L, n - k)
        if m > 0: out[:, k:k + m] += w[:, :m] * r.uniform(0.7, 1.0)
        t += r.uniform(3.2, 5.0)
    return fades(out * 0.9, 0.5, 1.0)


def lap(dur, r):
    """water lapping close by: a quick patter of small wet slaps and gurgles"""
    n = ns(dur); out = np.zeros((2, n)); sw = _swells(n, r, 3.5, 0.5)
    for _ in range(int(dur * 9)):
        at = r.uniform(0, max(0.1, dur - 0.2)); k = ns(at); L = ns(r.uniform(0.06, 0.16)); tl = np.arange(L) / SR; f = r.uniform(500, 1800)
        b = (bp(r.standard_normal(L), f * 0.6, f * 1.8, 1) * np.exp(-tl / 0.03) + np.sin(phase(f * 0.5 * (1 + 1.2 * tl / tl[-1]))) * np.exp(-tl / 0.025) * 0.4) * r.uniform(0.3, 1.0) * (0.4 + sw[min(n - 1, k)])
        w = pan(b, r.uniform(-0.8, 0.8)); m = min(L, n - k)
        if m > 0: out[:, k:k + m] += w[:, :m]
    out += np.stack([lp(colored(n, r, 1.2), 300) * 0.25 * (0.5 + 0.5 * sw) for _ in range(2)])
    return fades(out * 0.9, 0.4, 0.8)


def flagbed(dur, r):
    """a flag in the wind: quick flutter in gusts, a snap now and then"""
    n = ns(dur); t = np.arange(n) / SR; out = []
    gust = np.clip(0.55 + 0.7 * smooth_noise(n, r, 0.4), 0, 1)
    for ch in range(2):
        flut = (np.sin(phase(11 + 5 * smooth_noise(n, r, 1.0))) > r.uniform(-0.2, 0.2)).astype(float); flut = lp(flut, 90, 1)
        y = bp(colored(n, r, 0.5), 500, 3800, 1) * flut * gust ** 2 * 0.6 + bp(colored(n, r, 1.0), 150, 700, 1) * gust * 0.15
        for _ in range(int(dur * 0.8)):
            k = ns(r.uniform(0, max(0.1, dur - 0.3))); L = ns(0.06); tl = np.arange(L) / SR; m = min(L, n - k)
            y[k:k + m] += (bp(r.standard_normal(L), 700, 4500, 1) * np.exp(-tl / 0.012))[:m] * gust[min(n - 1, k)] * r.uniform(0.3, 0.9)
        out.append(y)
    return fades(np.stack(out) * 0.9, 0.3, 0.6)


def birds(dur, r):
    """the country by day: now and then a small bird's chirps, near and far, left and right"""
    n = ns(dur); out = np.zeros((2, n)); t0 = r.uniform(0.1, 0.6)
    while t0 < dur - 0.3:
        f0 = r.uniform(2800, 4200); calls = int(r.uniform(2, 5)); g = r.uniform(0.25, 1.0); p = r.uniform(-0.8, 0.8); gap = r.uniform(0.09, 0.15)
        for c in range(calls):
            L = r.uniform(0.05, 0.11); t = tt(L); y = np.sin(phase(f0 * (1 + r.uniform(0.15, 0.4) * t / L))) * np.sin(np.pi * t / L) ** 2 * g
            place(out, pan(y, p), t0 + c * gap, 1.0)
        t0 += r.uniform(0.7, 2.2)
    return fades(out * 0.3, 0.2, 0.3)


def flies(dur, r, count=3):
    """a few flies buzzing round something: each a thin wavering buzz that comes close and goes away"""
    n = ns(dur); out = np.zeros((2, n)); t = np.arange(n) / SR
    for _ in range(count):
        f = r.uniform(150, 230) * (1 + 0.06 * smooth_noise(n, r, 3.0) + 0.02 * np.sin(TAU * 60 * t))
        ph = phase(f); buzz = np.sin(ph) + 0.55 * np.sin(2 * ph + 1) + 0.3 * np.sin(3 * ph + 2) + 0.12 * np.sin(5 * ph)
        buzz = bp(buzz + 0.2 * r.standard_normal(n), 220, 2600, 1)
        near = np.clip(0.55 + 0.6 * smooth_noise(n, r, 0.5), 0, 1) ** 2 * (0.6 + 0.4 * np.sin(TAU * r.uniform(2, 5) * t + r.uniform(0, TAU)))
        pn = np.clip(smooth_noise(n, r, 0.6) * 1.4, -1, 1); th = (pn + 1) * np.pi / 4
        out += np.stack([buzz * near * np.cos(th), buzz * near * np.sin(th)]) * np.sqrt(2)
    return fades(out * 0.28 / np.sqrt(count) * 1.4, 0.3, 0.5)


def street(dur, r):
    """a quiet town street: a few voices far off without words, a little air, now and then something small clinking"""
    n = ns(dur); v = crowd(dur, r, people=6)
    v = np.stack([lp(v[c], 2400) for c in range(2)]) * 0.45
    air = np.stack([bp(colored(n, r, 1.1), 150, 1400, 1) * (0.6 + 0.4 * smooth_noise(n, r, 0.3)) * 0.18 for _ in range(2)])
    out = v + air
    for _ in range(int(dur * 0.25)):
        k = ns(r.uniform(0.5, max(0.6, dur - 0.5))); f = r.uniform(1800, 3200); tk = modal(0.25, [(f, 0.5, 0.05), (f * 1.8, 0.3, 0.03)], r) * 0.05; m = min(len(tk), n - k)
        if m > 0: out[:, k:k + m] += pan(tk[:m], r.uniform(-0.9, 0.9))
    return fades(out, 0.5, 0.8)



ONE = {"step": step, "scuff": scuff, "thud": thud, "smash": smash, "coin": coin, "coinroll": coinroll, "blast": blast, "crack": crack, "tear": tear, "creak": creak, "whoosh": whoosh, "bark": bark,
       "splash": splash, "snap": snap, "shing": shing, "thunk": thunk, "flap": flap, "rope": rope, "rattle": rattle, "paper": paper, "tap": tap, "ting": ting, "sack": sack, "fall": fall,
       "bubble": bubble, "spray": spray, "drip": drip, "book": book, "pour": pour, "squelch": squelch, "scratch": scratch, "sniff": sniff, "gavel": gavel, "munch": munch}
BED = {"wind": lambda d, r: wind(d, r), "crowd": lambda d, r: crowd(d, r), "panic": lambda d, r: crowd(d, r, panic=True), "fire": fire, "rumble": rumble,
       "sea": sea, "surf": surf, "lap": lap, "flap": flagbed, "flies": flies, "street": street, "birds": birds, "court": lambda d, r: crowd(d, r, people=6)}
# how loud each kind sits by itself (dB relative to the effects bus), before the cue's own gain
LEVEL = {"step": -9, "scuff": -12, "thud": -3, "smash": -2, "coin": -12, "coinroll": -12, "blast": 4, "crack": -5, "tear": -8, "creak": -10, "whoosh": -10, "bark": -6,
         "splash": -5, "snap": -6, "shing": -10, "thunk": -7, "flap": -9, "rope": -7, "rattle": -9, "paper": -13, "tap": -9, "ting": -11, "sack": -6, "fall": -8,
         "bubble": -9, "spray": -10, "drip": -9, "book": -8, "pour": -8, "squelch": -9, "scratch": -12, "sniff": -8, "gavel": -4, "munch": -10,
         "wind": -20, "crowd": -17, "panic": -12, "fire": -16, "rumble": -10,
         "sea": -19, "surf": -21, "lap": -21, "flies": -13, "street": -13, "birds": -16, "court": -19}
# the bed "flap" (a flag) shares its name with the one-shot "flap" (a cloth snapping), so the beds have their own level table
BED_LEVEL = {k: LEVEL[k] for k in ("wind", "crowd", "panic", "fire", "rumble", "sea", "surf", "lap", "flies", "street", "birds", "court")}; BED_LEVEL["flap"] = -15


def check_spec(spec):
    """every cue and bed must name a sound that exists; say which one does not, and where"""
    bad = []
    for c in spec.get("cues", []):
        if c.get("k") not in ONE: bad.append(f"cue '{c.get('k')}' at frame {c.get('f')} (shot {c.get('shot', '?')}): no such sound; the sounds are {', '.join(sorted(ONE))}")
    for b in spec.get("beds", []):
        if b.get("k") not in BED: bad.append(f"bed '{b.get('k')}' from frame {b.get('f0')}: no such bed; the beds are {', '.join(sorted(BED))}")
    if bad: raise SystemExit("SOUND SPEC FAILED:" + "".join("\n  " + m for m in bad))


def _only_args(fn, kw):
    """pass a cue's dur, big, run, surface only to the sounds that take them"""
    ok = inspect.signature(fn).parameters
    return {k: v for k, v in kw.items() if k in ok}


def effects(spec):
    """the sounds of a film on one stereo bus (beds and cues placed on their frames, a little room on top), before any mixing"""
    check_spec(spec)
    fps = spec.get("fps", 30); dur = spec["frames"] / fps; N = ns(dur + 0.5); bus = np.zeros((2, N)); r = rng(spec.get("seed", 7))
    for b in spec.get("beds", []):
        d = (b["f1"] - b["f0"]) / fps; place(bus, BED[b["k"]](d, r), b["f0"] / fps, b.get("g", 1.0) * dbg(BED_LEVEL[b["k"]]))
    for c in spec.get("cues", []):
        kw = _only_args(ONE[c["k"]], {k: c[k] for k in ("run", "big", "dur", "surface") if k in c})
        place(bus, pan(ONE[c["k"]](r, **kw), c.get("p", 0.0)), c["f"] / fps, c.get("g", 1.0) * dbg(LEVEL[c["k"]]))
    # a little room on the effects, so they sit in one place
    wet = convolve_st(bus, make_ir(0.5, 3, hf=0.6))[:, :N]
    return bus + 0.12 * wet


def build(spec, root="."):
    fps = spec.get("fps", 30); dur = spec["frames"] / fps
    mix = effects(spec) * dbg(-14)
    v = spec.get("voice")
    if v:
        x, sr = read_wav(os.path.join(root, v["file"]))
        if sr != SR:
            from scipy import signal
            x = signal.resample_poly(x, SR, sr, axis=-1)
        x = st(x[0]); x = x * dbg(-16 - integrated(x))
        place(mix, x, v.get("frame", 0) / fps)
    mix = mix[:, :ns(dur)]
    # bring the whole to -14 LUFS; a soft ceiling rounds off the loudest hits (a blast) so they do not hold everything else down
    for _ in range(3):
        cur = integrated(mix)
        if np.isfinite(cur): mix = mix * dbg(min(-14 - cur, 12))
        mix = np.tanh(mix / 0.82) * 0.82
    tp = true_peak(mix)
    if tp > -1: mix = mix * dbg(-1 - tp)
    return mix


def main():
    spec = json.load(open(sys.argv[1], encoding="utf-8")); root = os.path.dirname(HERE)
    mix = build(spec, root); out = sys.argv[2]; os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    write_wav(out, mix)
    print(f"{out}: {mix.shape[1] / SR:.2f} s, {integrated(mix):.1f} LUFS, true peak {true_peak(mix):.1f} dB, {len(spec.get('cues', []))} cues, {len(spec.get('beds', []))} beds")


if __name__ == "__main__":
    main()

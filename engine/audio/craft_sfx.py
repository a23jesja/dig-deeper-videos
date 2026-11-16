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
#   kinds of cue:  step, scuff, thud, smash, coin, coinroll, blast, rumble, crack, tear, creak, whoosh, bark
#   kinds of bed:  wind, crowd, panic, fire, rumble
# The mix: voice at -16 LUFS, effects under it, the whole at -14 LUFS with a true peak under -1 dB.
import json, os, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "lib"))
from dsp import SR, ns, tt, dbg, rng, lp, hp, bp, colored, smooth_noise, fades, phase, modal, pan, st, place, widen, make_ir, convolve_st, integrated, true_peak, norm_to, read_wav, write_wav  # noqa: E402

TAU = 2 * np.pi


# ---------------------------------------------------------------- one-shot sounds (mono)
def step(r, run=False, surface="stone"):
    """a leather sole on paving: a low knock, the click of the heel, a short scrape"""
    d = 0.11 if run else 0.16; t = tt(d); nz = r.standard_normal(len(t))
    f0 = r.uniform(95, 130) * (1.15 if run else 1.0)
    knock = np.sin(phase(f0 * (1 + 0.5 * np.exp(-t / 0.008)))) * np.exp(-t / (0.022 if run else 0.03))
    click = hp(nz, 2200 if surface == "stone" else 900) * np.exp(-t / 0.004) * (0.7 if surface == "stone" else 0.3)
    scrape = bp(nz, 500, 2600, 1) * np.exp(-((t - 0.03) / 0.03) ** 2) * (0.22 if run else 0.3)
    return fades((knock * 0.9 + click + scrape) * (1.25 if run else 1.0), 0.0005, 0.02)


def scuff(r, dur=0.22):
    """a shoe sliding on stone (a skid, a stumble)"""
    t = tt(dur); nz = colored(len(t), r, 0.6)
    return fades(bp(nz, 700, 4200, 1) * np.exp(-((t - dur * 0.35) / (dur * 0.3)) ** 2) * 0.6, 0.004, 0.04)


def thud(r, big=1.0):
    """a body or a heavy thing hitting the ground"""
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
            sh = bp(np.sign(np.sin(phase(f))) + 0.4 * r.standard_normal(L), 600, 2600, 1) * np.sin(np.pi * tl / tl[-1]) ** 0.6
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


ONE = {"step": step, "scuff": scuff, "thud": thud, "smash": smash, "coin": coin, "coinroll": coinroll, "blast": blast, "crack": crack, "tear": tear, "creak": creak, "whoosh": whoosh, "bark": bark}
BED = {"wind": lambda d, r: wind(d, r), "crowd": lambda d, r: crowd(d, r), "panic": lambda d, r: crowd(d, r, panic=True), "fire": fire, "rumble": rumble}
# how loud each kind sits by itself (dB relative to the effects bus), before the cue's own gain
LEVEL = {"step": -9, "scuff": -12, "thud": -3, "smash": -2, "coin": -12, "coinroll": -12, "blast": 4, "crack": -5, "tear": -8, "creak": -10, "whoosh": -10, "bark": -6,
         "wind": -20, "crowd": -17, "panic": -12, "fire": -16, "rumble": -10}


def build(spec, root="."):
    fps = spec.get("fps", 30); dur = spec["frames"] / fps; N = ns(dur + 0.5); bus = np.zeros((2, N)); r = rng(spec.get("seed", 7))
    for b in spec.get("beds", []):
        d = (b["f1"] - b["f0"]) / fps; place(bus, BED[b["k"]](d, r), b["f0"] / fps, b.get("g", 1.0) * dbg(LEVEL[b["k"]]))
    for c in spec.get("cues", []):
        kw = {k: c[k] for k in ("run", "big", "dur", "surface") if k in c}
        place(bus, pan(ONE[c["k"]](r, **kw), c.get("p", 0.0)), c["f"] / fps, c.get("g", 1.0) * dbg(LEVEL[c["k"]]))
    # a little room on the effects, so they sit in one place
    wet = convolve_st(bus, make_ir(0.5, 3, hf=0.6))[:, :N]; bus = bus + 0.12 * wet
    mix = bus * dbg(-14)
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

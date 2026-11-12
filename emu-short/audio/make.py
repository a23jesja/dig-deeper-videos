# Sound for the emu short: original comic march (synthesised), synthesised SFX timed to the picture, voice on top.
# Output: mix.wav (48 kHz stereo, exact film length) + stems. Everything is generated here: no samples, no copyright.
import numpy as np, soundfile as sf
from scipy.signal import butter, lfilter, resample_poly
SR = 48000; DUR = 1770 / 30; N = int(DUR * SR)
rng = np.random.default_rng(7)
NOTE = {n: i for i, n in enumerate(["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"])}
def hz(n):
    if n == "r": return 0
    return 440 * 2 ** ((NOTE[n[:-1]] + 12 * (int(n[-1]) + 1) - 69) / 12)
def lp(x, fc, o=2): b, a = butter(o, fc / (SR / 2)); return lfilter(b, a, x)
def hp(x, fc, o=2): b, a = butter(o, fc / (SR / 2), "high"); return lfilter(b, a, x)
def env(n, a, d, s=0.0, r=0.02):
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4)) * (s + (1 - s) * np.exp(-t / d))
    rr = int(r * SR); e[-rr:] *= np.linspace(1, 0, rr) if n > rr else 1; return e
def add(buf, x, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    x = x[: N - i]; l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + len(x), 0] += x * g * l * 1.414; buf[i:i + len(x), 1] += x * g * r * 1.414
def tone(f, d, kind):
    n = int(d * SR); t = np.arange(n) / SR
    if kind == "tuba": x = np.sin(2 * np.pi * f * t) + 0.45 * np.sin(4 * np.pi * f * t) + 0.2 * np.sin(6 * np.pi * f * t); return lp(x, 500) * env(n, 0.02, 0.35, 0.25)
    if kind == "pizz": x = sum(np.sin(2 * np.pi * f * k * t) / k ** 1.6 for k in range(1, 7)); return x * env(n, 0.003, 0.12)
    if kind == "clar": x = sum(np.sin(2 * np.pi * f * k * t * (1 + 0.003 * np.sin(2 * np.pi * 5.5 * t))) / k for k in (1, 3, 5, 7)); return lp(x, 2600) * env(n, 0.025, 0.6, 0.6, 0.04)
    if kind == "glock": x = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2.76 * t) + 0.25 * np.sin(2 * np.pi * f * 5.4 * t); return x * env(n, 0.001, 0.25)
    if kind == "bone": x = sum(np.sin(2 * np.pi * f * k * t) / k for k in range(1, 9)); return lp(x, 1400) * env(n, 0.04, 0.9, 0.7, 0.06)
def snare(d=0.12, g=1.0): n = int(d * SR); return hp(rng.standard_normal(n), 1500) * env(n, 0.001, 0.04) * g
def kick(): n = int(0.18 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * (48 + 70 * np.exp(-t / 0.03)) * t) * env(n, 0.001, 0.07)

# ---------------- music ----------------
music = np.zeros((N, 2))
CH = {"F": ["F2", "A3", "C4", "F4"], "Bb": ["Bb1", "Bb3", "D4", "F4"], "C": ["C2", "G3", "Bb3", "E4"], "Gm": ["G1", "G3", "Bb3", "D4"], "Dm": ["D2", "A3", "D4", "F4"], "A": ["A1", "A3", "C#4", "E4"],
      "Fm": ["F2", "Ab3", "C4", "F4"], "Db": ["C#2", "Ab3", "C#4", "F4"], "Bbm": ["Bb1", "Bb3", "C#4", "F4"]}
A_MEL = [[("F4", 1), ("A4", .5), ("C5", .5), ("F5", 1), ("C5", 1)], [("D5", 1), ("Bb4", .5), ("D5", .5), ("C5", 2)], [("A4", 1), ("C5", .5), ("A4", .5), ("G4", 1), ("E4", 1)], [("F4", .5), ("G4", .5), ("A4", .5), ("Bb4", .5), ("C5", 2)],
         [("F4", 1), ("A4", .5), ("C5", .5), ("F5", 1), ("A5", 1)], [("G5", 1), ("F5", .5), ("D5", .5), ("C5", 2)], [("Bb4", 1), ("A4", .5), ("G4", .5), ("A4", 1), ("C5", 1)], [("F4", 1), ("r", 1), ("F5", 1), ("r", 1)]]
A_CH = [["F", "F"], ["Bb", "F"], ["F", "C"], ["F", "C"], ["F", "F"], ["Bb", "F"], ["Gm", "C"], ["F", "F"]]
B_MEL = [[("D5", .5), ("r", .5), ("F5", .5), ("r", .5), ("A5", .5), ("r", .5), ("F5", .5), ("r", .5)], [("E5", .5), ("r", .5), ("C#5", .5), ("r", .5), ("A4", 1), ("r", 1)], [("D5", .5), ("r", .5), ("F5", .5), ("r", .5), ("A5", .5), ("r", .5), ("D6", .5), ("r", .5)], [("C#6", .5), ("r", .5), ("A5", .5), ("r", .5), ("E5", 1), ("r", 1)],
         [("G5", .5), ("r", .5), ("Bb5", .5), ("r", .5), ("G5", .5), ("r", .5), ("D5", .5), ("r", .5)], [("F5", .5), ("r", .5), ("D5", .5), ("r", .5), ("A4", 1), ("r", 1)], [("E5", .5), ("F5", .5), ("E5", .5), ("C#5", .5), ("A4", 1), ("r", 1)], [("D5", 1), ("r", 1), ("D4", 1), ("r", 1)]]
B_CH = [["Dm", "Dm"], ["A", "A"], ["Dm", "Dm"], ["A", "A"], ["Gm", "Gm"], ["Dm", "Dm"], ["A", "A"], ["Dm", "Dm"]]
S_MEL = [[("C5", 2), ("Ab4", 2)], [("F4", 3), ("r", 1)], [("Bb4", 2), ("Ab4", 1), ("G4", 1)], [("F4", 4)]]
S_CH = [["Fm", "Fm"], ["Db", "Db"], ["Bbm", "C"], ["Fm", "Fm"]]
def section(t0, t1, mel, ch, beat, lead="clar", drums=True, g=1.0):
    bar = 4 * beat; nb = int(np.ceil((t1 - t0) / bar))
    for b in range(nb):
        tb = t0 + b * bar; m = mel[b % len(mel)]; c = ch[b % len(ch)]
        for h in range(2):
            cd = CH[c[h]]; th = tb + h * 2 * beat
            if th >= t1: break
            add(music, tone(hz(cd[0]), beat * 0.9, "tuba"), th, 0.55 * g)
            for nn in cd[1:]: add(music, tone(hz(nn), 0.25, "pizz"), th + beat, 0.16 * g, 0.3)
            if drums: add(music, kick(), th, 0.35 * g); add(music, snare(), th + beat, 0.16 * g, -0.2)
        tt = tb
        for n, d in m:
            if n != "r" and tt < t1: add(music, tone(hz(n), d * beat * 0.92, lead), tt, 0.3 * g, -0.25)
            tt += d * beat
section(0.0, 4.9, A_MEL[:2] + A_MEL[6:], A_CH[:2] + A_CH[6:], 0.5, g=0.9)
section(5.07, 18.73, A_MEL, A_CH, 0.4875)
section(18.73, 39.2, B_MEL, B_CH, 0.4265)
section(39.33, 43.7, S_MEL, S_CH, 0.546, lead="bone", drums=False, g=0.9)
section(43.8, 52.4, A_MEL, A_CH, 0.5375)
section(52.5, 55.6, S_MEL, S_CH, 0.39, lead="bone", drums=False, g=0.9)
for n, t in [("F3", 55.79), ("A3", 55.79), ("C4", 55.79), ("F4", 55.79)]: add(music, tone(hz(n), 0.8, "pizz"), t, 0.3)
for i, n in enumerate(["F4", "A4", "C5", "F5"]): add(music, tone(hz(n), 1.6, "clar"), 57.7 + 0.0 * i, 0.16); add(music, tone(hz(n) / 2, 1.6, "tuba"), 57.7, 0.12)

# ---------------- sfx ----------------
sfx = np.zeros((N, 2))
def whoosh(d=0.28):
    n = int(d * SR); x = rng.standard_normal(n); t = np.linspace(0, 1, n); out = np.zeros(n)
    for k in range(6):
        seg = slice(k * n // 6, (k + 1) * n // 6); out[seg] = lp(hp(x, 300 + 500 * k), 1200 + 900 * k)[seg]
    return out * np.sin(np.pi * t) ** 2
def thud(): n = int(0.25 * SR); t = np.arange(n) / SR; return (np.sin(2 * np.pi * (60 + 90 * np.exp(-t / 0.02)) * t) + 0.3 * lp(rng.standard_normal(n), 400)) * env(n, 0.001, 0.07)
def shot(): n = int(0.085 * SR); return (lp(rng.standard_normal(n), 3500) + 0.8 * np.sin(2 * np.pi * 110 * np.arange(n) / SR)) * env(n, 0.0005, 0.02)
def clunk(): n = int(0.3 * SR); t = np.arange(n) / SR; return (np.sin(2 * np.pi * 620 * t) * np.exp(-t / 0.03) + np.sin(2 * np.pi * 233 * t) * np.exp(-t / 0.08) + 0.5 * hp(rng.standard_normal(n), 2000) * np.exp(-t / 0.01))
def hiss(d=0.9): n = int(d * SR); return hp(rng.standard_normal(n), 3000) * env(n, 0.05, 0.3) * 0.5
def ping(f=1800): n = int(0.22 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * f * (1 + 0.5 * np.exp(-t / 0.05)) * t) * np.exp(-t / 0.05)
def tick(f): n = int(0.16 * SR); t = np.arange(n) / SR; return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 3.9 * t)) * np.exp(-t / 0.045)
def boom(): n = int(0.35 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * (70 + 25 * np.exp(-t / 0.05)) * t) * env(n, 0.01, 0.12)
def step(g=1.0): n = int(0.03 * SR); return lp(rng.standard_normal(n), 900) * env(n, 0.001, 0.008) * g
def wah(t0):  # sad trombone slide for "And lost."
    for k, (f0, f1) in enumerate([(233, 220), (220, 196)]):
        n = int(0.32 * SR); t = np.arange(n) / SR; f = np.linspace(f0, f1, n); ph = 2 * np.pi * np.cumsum(f) / SR
        add(sfx, lp(sum(np.sin(ph * h) / h for h in range(1, 8)), 900 + 600 * np.abs(np.sin(8 * t)).mean()) * env(n, 0.03, 0.5, 0.6, 0.05), t0 + k * 0.3, 0.3)
for t in [2.9, 4.17, 5.07, 7.73, 9.87, 11.87, 14.27, 18.73, 22.13, 23.33, 24.87, 26.87, 29.27, 31.2, 31.67, 33.47, 34.77, 36.67, 39.33, 42.4, 43.8, 45.93, 48.4, 50.17, 52.5, 54.4, 55.67]:
    add(sfx, whoosh(), t - 0.14, 0.16, rng.uniform(-0.4, 0.4))
for t, g in [(15.37, 0.6), (16.4, 0.5), (16.67, 0.5), (17.67, 0.7), (17.9, 0.7)]: add(sfx, thud(), t, g)
add(sfx, boom(), 3.4, 0.5); add(sfx, boom(), 3.62, 0.4); add(sfx, boom(), 31.3, 0.5); add(sfx, boom(), 31.5, 0.4)
wah(4.2)
for a, b in [(20.83, 22.1), (29.77, 30.7)]:
    for t in np.arange(a, b, 1 / 9.5): add(sfx, shot(), t + rng.uniform(-0.005, 0.005), 0.55, rng.uniform(-0.15, 0.15))
add(sfx, clunk(), 30.83, 0.6); add(sfx, hiss(), 30.95, 0.25)
for t in np.arange(5.1, 9.8, 0.045): add(sfx, step(rng.uniform(0.3, 1)), t + rng.uniform(0, 0.03), 0.09, rng.uniform(-0.8, 0.8))
for t in np.arange(21.4, 23.3, 0.022): add(sfx, step(rng.uniform(0.4, 1)), t + rng.uniform(0, 0.02), 0.12, rng.uniform(-0.9, 0.9))
for t in np.arange(26.9, 29.2, 0.05): add(sfx, step(rng.uniform(0.3, 1)), t + rng.uniform(0, 0.03), 0.08, rng.uniform(-0.8, 0.8))
# lorry: putt-putt engine, rattles when it gets bumpy
t = np.arange(int(7.6 * SR)) / SR; rate = 11 + 5 * np.clip((t - 1.1) / 1.5, 0, 1); ph = np.cumsum(rate) / SR
eng = lp(np.sign(np.sin(2 * np.pi * ph)) * (0.6 + 0.4 * np.sin(2 * np.pi * ph * 0.5)), 220) + 0.25 * lp(rng.standard_normal(len(t)), 500) * (np.sin(2 * np.pi * ph) > 0.6)
eng *= np.minimum(1, t / 0.3) * np.minimum(1, (7.6 - t) / 0.4); add(sfx, eng, 31.7, 0.22)
for tt in np.arange(34.8, 39.1, 0.23): add(sfx, thud(), tt + rng.uniform(0, 0.05), 0.22 + 0.2 * (tt > 36.6)); add(sfx, tick(rng.uniform(300, 500)), tt + 0.06, 0.08)
t = np.arange(int(3.3 * SR)) / SR; ph = np.cumsum(15 - 3 * t / 3.3) / SR
eng2 = lp(np.sign(np.sin(2 * np.pi * ph)), 220) * np.minimum(1, t / 0.2) * (1 - t / 3.3) ** 1.2; add(sfx, eng2, 52.5, 0.2)
for tt in np.arange(39.45, 41.2, 0.06): add(sfx, tick(rng.uniform(2200, 4200)), tt + rng.uniform(0, 0.04), 0.035, rng.uniform(-0.6, 0.6))
for i in range(10): add(sfx, tick(660 * 2 ** (i / 12)), 46.2 + i * 0.1333, 0.22)
for tt in np.arange(50.3, 52.35, 0.1333): add(sfx, ping(rng.uniform(1500, 2400)), tt, 0.16, rng.uniform(-0.5, 0.5))
for n in ["C6", "E6", "G6"]: add(sfx, tone(hz(n), 0.9, "glock"), 55.85, 0.2)
add(sfx, tone(hz("F2"), 0.5, "tuba"), 56.85, 0.5); add(sfx, tone(hz("E2"), 0.7, "tuba"), 57.1, 0.5)

# ---------------- voice + mix ----------------
v, vsr = sf.read("../voice/voice.wav"); v = resample_poly(v, SR, vsr); v = v / np.abs(v).max() * 0.89
voice = np.zeros((N, 2)); voice[: len(v), 0] = v[:N]; voice[: len(v), 1] = v[:N]
e = lp(np.abs(voice[:, 0]), 6, 1); duck = 1 - 0.5 * np.clip(e / 0.05, 0, 1)
music = hp(music.T, 35).T; music /= np.abs(music).max()
sfx /= max(1e-9, np.abs(sfx).max())
mix = voice + music * 0.19 * duck[:, None] + sfx * 0.5 * (0.75 + 0.25 * duck[:, None])
pk = np.abs(mix).max(); mix = mix / pk * 0.95 if pk > 0.95 else mix
fade = int(0.4 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
sf.write("mix.wav", mix, SR); sf.write("music.wav", music, SR); sf.write("sfx.wav", sfx, SR)
rms = lambda x: 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
print("len", len(mix) / SR, "peak", pk, "voice", rms(voice), "music", rms(music * 0.19), "sfx", rms(sfx * 0.5))

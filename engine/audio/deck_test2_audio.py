# Sound for the ten-second Titanic part 3 test (no voice): sea, a low pad, and the two rockets (whoosh, bang, crackle).
#   python audio/deck_test2_audio.py -> public/env/deck-mix-2.wav
import os, numpy as np, soundfile as sf
from scipy.signal import butter, lfilter
SR, DUR = 48000, 10.0; N = int(SR * DUR); t = np.arange(N) / SR; rng = np.random.default_rng(5)
def filt(x, lo=None, hi=None):
    if hi: b, a = butter(2, hi / (SR / 2)); x = lfilter(b, a, x)
    if lo: b, a = butter(2, lo / (SR / 2), "high"); x = lfilter(b, a, x)
    return x
sea = filt(rng.standard_normal(N), hi=420) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * t + 1)); sea /= np.abs(sea).max()
pad = sum(np.sin(2 * np.pi * f * t + p) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.07 * t + p)) for f, p in ((73.4, 0), (110.0, 1.3), (146.8, 2.1), (174.6, 0.4))) / 4
fxs = np.zeros(N)
def add(x, at):
    k = int(at * SR)
    if k < 0: x = x[-k:]; k = 0      # a sound that began before the film starts
    n = min(len(x), N - k)
    if n > 0: fxs[k:k + n] += x[:n]
def rocket(burst):
    n = int(1.4 * SR); tt = np.arange(n) / SR; wh = filt(rng.standard_normal(n), lo=900, hi=5000) * (tt / 1.4) ** 2 * 0.5; add(wh, burst - 1.4)
    n = int(1.6 * SR); tt = np.arange(n) / SR; bang = filt(rng.standard_normal(n), hi=260) * np.exp(-tt * 3.2) * 2.4 + np.sin(2 * np.pi * 58 * tt) * np.exp(-tt * 5) * 1.5; add(bang, burst)
    n = int(2.6 * SR); tt = np.arange(n) / SR; cr = filt(rng.standard_normal(n), lo=2500) * (rng.random(n) > 0.9985).astype(float); cr = filt(np.convolve(cr, np.exp(-np.arange(400) / 60.0), "same"), lo=1500) * np.exp(-tt * 1.0); add(cr * 2.0, burst + 0.15)
rocket(0.5); rocket(8.25)   # the two bursts: the first rocket bursts at 0.5 s (fired at -0.9 s), the second at 8.25 s
mix = 0.1 * sea + 0.14 * pad + 0.5 * fxs / max(1e-6, np.abs(fxs).max())
mix *= np.minimum(1, np.minimum(t / 0.03, (DUR - t) / 0.4)); mix *= 0.8 / np.abs(mix).max()
os.makedirs("public/env", exist_ok=True); sf.write("public/env/deck-mix-2.wav", np.stack([mix, mix], 1), SR, subtype="PCM_16"); print("ok")

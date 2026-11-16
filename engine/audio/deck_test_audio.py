# Sound for the ten-second deck test: the Kokoro voice, a low synthesised pad and a quiet sea bed under it.
#   python audio/deck_test_audio.py -> public/kit/deck-mix.wav (48 kHz stereo, 10 s)
import os, numpy as np, soundfile as sf
from scipy.signal import butter, lfilter
SR, DUR = 48000, 10.0; N = int(SR * DUR); t = np.arange(N) / SR
v, sr = sf.read("voice/deck-test/voice.wav"); assert sr == SR
voice = np.zeros(N); voice[: len(v)] = v[:N]; voice *= 0.5 / np.sqrt(np.mean(voice[np.abs(voice) > 0.01] ** 2)) * 0.2
rng = np.random.default_rng(3)
def lp(x, fc): b, a = butter(2, fc / (SR / 2)); return lfilter(b, a, x)
sea = lp(rng.standard_normal(N), 500) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * t + 1)) ; sea /= np.abs(sea).max()
pad = sum(np.sin(2 * np.pi * f * t + p) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.07 * t + p)) for f, p in ((73.4, 0), (110.0, 1.3), (146.8, 2.1), (174.6, 0.4))) / 4   # D minor, low
bell = np.zeros(N)
for ts in (0.02, 6.6):   # a soft ship's bell on the first frame and on the last line
    k = int(ts * SR); n = N - k; tt = np.arange(n) / SR; bell[k:] += (np.sin(2 * np.pi * 880 * tt) + 0.5 * np.sin(2 * np.pi * 1320 * tt)) * np.exp(-tt * 3.2)
mix = voice + 0.035 * sea + 0.05 * pad + 0.035 * bell
fade = np.minimum(1, np.minimum(t / 0.05, (DUR - t) / 0.4)); mix *= fade
mix *= 0.89 / np.abs(mix).max()
os.makedirs("public/kit", exist_ok=True); sf.write("public/kit/deck-mix.wav", np.stack([mix, mix], 1), SR, subtype="PCM_16")
print("mix peak %.2f, voice rms %.3f, bed rms %.3f" % (np.abs(mix).max(), np.sqrt(np.mean(voice ** 2)), np.sqrt(np.mean((0.035 * sea + 0.05 * pad) ** 2))))

# A clip's sound from one spoken line, and the mouth track that follows it (the flat 2D shot-type clips, 21 Nov 2026).
#   python audio/voice_clip.py <take.mp3> <t0 seconds> <clip seconds> <out.wav> <mouth.json>     (from engine/)
# The voice is set to -16 LUFS, placed at t0, and the whole brought to -14 LUFS with a true peak under -1 dB; nothing else is in the mix
# (no effects: no footsteps, nothing that could sound like a fart). The mouth: per frame (30 fps) the voice's loudness picks one of three
# shapes, shut 0, half 0.35, open 0.7, each held at least 2 frames so it never flickers.
import json, os, subprocess, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, "lib"))
from dsp import SR, ns, dbg, st, integrated, true_peak, write_wav  # noqa: E402

FPS = 30


def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-nostdin", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)


def main():
    src, t0, secs, out_wav, out_json = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4], sys.argv[5]
    x = load(src); x = x * dbg(-16 - integrated(st(x))); n = ns(secs); mix = np.zeros((2, n)); a = ns(t0); b = min(n, a + len(x))
    mix[:, a:b] = x[: b - a]
    # the whole to -14 LUFS under a soft ceiling (as audio/film_audio.py), then a true peak at or under -1 dB
    raw, gain, CEIL = mix, 1.0, 0.8
    for _ in range(14):
        mix = np.tanh(raw * gain / CEIL) * CEIL; err = -14 - integrated(mix)
        if abs(err) < 0.02: break
        gain *= dbg(err)
    tp = true_peak(mix)
    if tp > -1: mix = mix * dbg(-1 - tp - 0.01)
    fd = ns(0.003); r = np.linspace(0, 1, fd); mix[:, :fd] *= r; mix[:, -fd:] *= r[::-1]
    os.makedirs(os.path.dirname(os.path.abspath(out_wav)), exist_ok=True); write_wav(out_wav, mix)
    # the mouth: frame loudness (RMS over the frame) against the line's loud frames
    F = int(round(secs * FPS)); hop = SR // FPS; v = mix[0]
    rms = np.array([np.sqrt(np.mean(v[f * hop:(f + 1) * hop] ** 2)) if f * hop < len(v) else 0 for f in range(F)])
    db = 20 * np.log10(np.maximum(rms, 1e-9)); top = np.percentile(db[db > -60], 90) if np.any(db > -60) else -20
    raw = np.where(db > top - 9, 0.7, np.where(db > top - 20, 0.35, 0.0))
    m = list(raw); i = 0
    while i < F:                                   # hold each shape at least 2 frames
        j = i
        while j + 1 < F and m[j + 1] == m[i]: j += 1
        if j == i and i + 1 < F: m[i + 1] = m[i]; j = i + 1
        i = j + 1
    words_end = (a + len(x)) / SR
    json.dump({"t0": t0, "len": round(len(x) / SR, 3), "end": round(words_end, 3), "mouth": [float(q) for q in m]}, open(out_json, "w"), indent=0)
    print(f"{out_wav}: {secs:.2f} s, {integrated(mix):.2f} LUFS, true peak {true_peak(mix):.2f} dB; voice {t0:.2f}-{words_end:.2f} s; mouth {sum(1 for q in m if q > 0)} open frames of {F}")


if __name__ == "__main__":
    main()

# The music of the craft-kit Shorts: two short original pieces, each generated to any length, synthesised only from audio/lib
# (plucked strings, a fife, a whistle, brushes, a hand drum). The tunes are our own: nothing here is a known song or shanty.
#
#   music(name, seconds, lines) -> stereo array (2, n) at SR, peak about -3 dB; the mix (film_audio.py) sets the level under the voice
#     "roman"  light and comic, plucked strings and a fife over a soft hand drum, about 104 bpm, D mixolydian
#     "shanty" a rolling 6/8 with plucked bass, a whistle tune and brushes, about 96 bpm dotted-quarter, A dorian, playful
#   Each piece opens with a sting on its first beat (the films open on their most striking picture) and ends with a cadence:
#   the last chord lands on the film's last second (seconds - 1.0) and rings out to the end. The tempo is stretched a few
#   per cent so that a whole number of bars fills the time before that chord.
#   `lines` = [{a, b}, ...] (when the voice speaks, from the film's lines file): the tune is a little softer while it speaks.
import os, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "lib"))
from dsp import SR, ns, tt, dbg, rng, lp, hp, bp, fades, phase, pan, place, make_ir, convolve_st  # noqa: E402
from instruments import m2f, pluck, fife, whistle, brush, triangle  # noqa: E402


# ---------------------------------------------------------------- a hand drum (doum, tek, ka)
def handdrum(kind, vel, r):
    d = 0.3 if kind == "doum" else 0.12; t = tt(d); nz = r.standard_normal(len(t))
    if kind == "doum":
        y = np.sin(phase(88 * (1 + 0.8 * np.exp(-t / 0.025)))) * np.exp(-t / 0.11) + 0.4 * lp(nz, 500) * np.exp(-t / 0.02)
    elif kind == "tek":
        y = bp(nz, 1500, 6000, 1) * np.exp(-t / 0.012) + 0.5 * np.sin(phase(430 * (1 + 0.3 * np.exp(-t / 0.01)))) * np.exp(-t / 0.03)
    else:
        y = bp(nz, 900, 3500, 1) * np.exp(-t / 0.018) * 0.7 + 0.3 * np.sin(phase(300)) * np.exp(-t / 0.02)
    return fades(y * vel * 0.8, 0.0006, 0.02)


class Mix:
    """a stereo bed that sounds are laid into at a time, a pan and a gain"""
    def __init__(self, seconds):
        self.n = ns(seconds); self.buf = np.zeros((2, self.n))

    def add(self, x, t, p=0.0, g=1.0):
        place(self.buf, pan(x, p), t, g)

    def add_st(self, x, t, g=1.0):
        place(self.buf, x, t, g)


def _strum(m, r, notes, t, vel, p, gap=0.012, dur=0.8, bright=0.5, g=1.0):
    for i, n in enumerate(notes):
        m.add(pluck(m2f(n), vel * (0.9 + 0.1 * (i % 2)), r, dur, bright), t + i * gap + r.normal(0, 0.002), p, g)


def _speaking(lines):
    iv = [(l["a"], l["b"]) for l in (lines or [])]
    return lambda t: any(a - 0.05 <= t <= b + 0.05 for a, b in iv)


def _finish(m, seconds, r, wet=0.16, rt=0.9):
    y = m.buf
    y = y + wet * convolve_st(y, make_ir(rt, 11, hf=0.7))[:, :y.shape[1]]
    y = fades(y, 0.0, 0.35)
    return y / (np.abs(y).max() + 1e-9) * dbg(-3)


def _bars(seconds, bar_nom):
    """a whole number of bars before the closing chord, which falls one second before the end"""
    t_end = max(seconds - 1.0, 2 * bar_nom); n = max(3, int(round(t_end / bar_nom)))
    return n, t_end, t_end / n


# ---------------------------------------------------------------- "roman": D mixolydian, 4/4, about 104 bpm
# the tune, per bar: (beat, length in beats, midi). Two eight-bar halves: A (D C G D) and B (D C G A)
_ROMAN_A = [
    [(0, .5, 74), (.5, .5, 78), (1, 1, 81), (2, .5, 78), (2.5, .5, 74), (3, 1, 78)],
    [(0, .5, 76), (.5, .5, 79), (1, 1, 84), (2, .5, 79), (2.5, .5, 76), (3, 1, 72)],
    [(0, .5, 79), (.5, .5, 83), (1, 1, 86), (2, .5, 83), (2.5, .5, 79), (3, 1, 74)],
    [(0, 1, 74), (1, .5, 76), (1.5, .5, 78), (2, 1, 81), (3, 1, 78)],
]
_ROMAN_B = [
    [(0, .5, 81), (.5, .5, 81), (1, .5, 78), (1.5, .5, 81), (2, 1, 83), (3, 1, 81)],
    [(0, .5, 79), (.5, .5, 79), (1, .5, 76), (1.5, .5, 79), (2, 1, 81), (3, 1, 79)],
    [(0, .5, 83), (.5, .5, 79), (1, .5, 83), (1.5, .5, 86), (2, 2, 83)],
    [(0, .5, 76), (.5, .5, 78), (1, .5, 81), (1.5, .5, 78), (2, 1, 76), (3, 1, 73)],      # over the A chord, ends on the leading tone
]
_ROMAN_CH = {"D": (38, 45, [50, 57, 62, 66]), "C": (36, 43, [48, 55, 60, 64]), "G": (43, 50, [47, 55, 62, 67]), "A": (45, 52, [49, 57, 61, 64])}   # bass root, bass fifth, chord tones


def _roman(seconds, lines):
    r = rng(104); bar_nom = 4 * 60 / 104; nb, t_end, bar = _bars(seconds, bar_nom); beat = bar / 4; spk = _speaking(lines); m = Mix(seconds)
    prog = ["D", "C", "G", "D", "D", "C", "G", "A"]
    chords = [prog[i % 8] for i in range(nb)]; chords[-1] = "A"; chords[-2] = "G"
    for i in range(nb):
        t0 = i * bar; ch = _ROMAN_CH[chords[i]]; root, fifth, tones = ch
        # plucked bass on one and three, the fifth between; the chord plucked on the off-beats
        m.add(pluck(m2f(root), 0.8, r, 0.7, 0.3), t0, 0.0, 0.9); m.add(pluck(m2f(fifth), 0.6, r, 0.5, 0.3), t0 + 1.5 * beat, 0.0, 0.7)
        m.add(pluck(m2f(root), 0.7, r, 0.7, 0.3), t0 + 2 * beat, 0.0, 0.8); m.add(pluck(m2f(fifth if i % 2 else root + 12), 0.55, r, 0.5, 0.3), t0 + 3.5 * beat, 0.0, 0.6)
        for k in (0.5, 1.5, 2.5, 3.5):
            _strum(m, r, tones[1:], t0 + k * beat, 0.42 if k != 2.5 else 0.5, -0.3, 0.014, 0.35, 0.6, 0.55)
        # the soft hand drum: doum on one and three, tek between, a light ka now and then
        for k, kind, v in ((0, "doum", 0.8), (1.5, "tek", 0.5), (2, "doum", 0.65), (2.5, "ka", 0.3), (3, "tek", 0.45), (3.5, "tek", 0.35)):
            m.add(handdrum(kind, v, r), t0 + k * beat, 0.05, 0.7)
        if i == nb - 1: continue
        tpl = (_ROMAN_A if (i // 4) % 2 == 0 else _ROMAN_B)[i % 4]
        if i == nb - 2: tpl = _ROMAN_B[2]
        for b0, ln, mid in tpl:
            t = t0 + b0 * beat; v = 0.62 * (0.82 if spk(t) else 1.0) * (1.0 if b0 % 1 == 0 else 0.85)
            m.add(fife(m2f(mid), max(0.08, ln * beat * 0.9), v, r), t, 0.25, 0.5)
    # the last bar: the leading tones lead home
    t0 = (nb - 1) * bar
    for b0, ln, mid in _ROMAN_B[3]: m.add(fife(m2f(mid), max(0.08, ln * beat * 0.9), 0.6, r), t0 + b0 * beat, 0.25, 0.5)
    # the sting on the very first beat: a full strum, drum and triangle, the fife's first note on top
    _strum(m, r, [38, 50, 57, 62, 66, 69, 74], 0.0, 0.95, 0.0, 0.01, 1.0, 0.7, 0.9)
    m.add(handdrum("doum", 1.0, r), 0.0, 0.0, 0.9); m.add(handdrum("tek", 0.8, r), 0.0, 0.1, 0.6); m.add(triangle(0.9, r, 1.4), 0.0, 0.2, 0.7)
    m.add(fife(m2f(86), 0.12, 0.8, r), 0.0, 0.25, 0.5)
    # the cadence: A (dominant) into D, struck full, the fife on the tonic, ringing to the end
    _strum(m, r, [38, 50, 57, 62, 66, 69], t_end, 1.0, 0.0, 0.012, 1.0, 0.7, 0.95)
    m.add(pluck(m2f(26), 0.9, r, 1.2, 0.3), t_end, 0.0, 1.0); m.add(handdrum("doum", 1.0, r), t_end, 0.0, 0.9); m.add(handdrum("tek", 0.7, r), t_end, 0.05, 0.5)
    m.add(fife(m2f(74), 0.85, 0.75, r), t_end, 0.25, 0.55); m.add(triangle(0.7, r, 1.2, 2349.0), t_end, 0.2, 0.5)
    return _finish(m, seconds, r)


# ---------------------------------------------------------------- "shanty": A dorian / minor, 6/8, about 96 dotted-quarter bpm
# the tune, per bar: (eighth 0-5, length in eighths, midi)
_SHANTY = [
    [(0, 3, 81), (3, 1, 84), (4, 1, 83), (5, 1, 81)],
    [(0, 1, 84), (1, 1, 83), (2, 1, 81), (3, 3, 76)],
    [(0, 3, 79), (3, 1, 83), (4, 1, 81), (5, 1, 79)],
    [(0, 2, 81), (2, 1, 79), (3, 3, 76)],
    [(0, 1, 81), (1, 1, 81), (2, 1, 86), (3, 3, 84)],
    [(0, 1, 84), (1, 1, 83), (2, 1, 81), (3, 2, 83), (5, 1, 84)],
    [(0, 2, 83), (2, 1, 80), (3, 3, 83)],
    [(0, 3, 81), (3, 2, 76)],
]
_SHANTY_CH = {"Am": (45, 52, [57, 60, 64]), "G": (43, 50, [55, 59, 62]), "Dm": (50, 45, [57, 62, 65]), "E": (40, 47, [56, 59, 64]), "A": (45, 52, [57, 61, 64])}


def _shanty(seconds, lines):
    r = rng(96); bar_nom = 2 * 60 / 96; nb, t_end, bar = _bars(seconds, bar_nom); e = bar / 6; spk = _speaking(lines); m = Mix(seconds)
    prog = ["Am", "Am", "G", "Am", "Dm", "Am", "E", "Am"]
    chords = [prog[i % 8] for i in range(nb)]; chords[-1] = "E"; chords[-2] = "Dm"
    for i in range(nb):
        t0 = i * bar; root, fifth, tones = _SHANTY_CH[chords[i]]
        # plucked bass: root on the first eighth, fifth on the fourth; the chord rolls on the others (oom-pa-pa)
        m.add(pluck(m2f(root), 0.85, r, 0.8, 0.3), t0, 0.0, 0.9); m.add(pluck(m2f(fifth), 0.7, r, 0.6, 0.3), t0 + 3 * e, 0.0, 0.75)
        for k in (1, 2, 4, 5):
            _strum(m, r, tones, t0 + k * e, 0.36 if k in (2, 5) else 0.3, -0.3, 0.012, 0.4, 0.6, 0.55)
        # brushes: a hit on the two beats, swishes between
        for k in range(6):
            m.add(brush((0.9 if k in (0, 3) else 0.4) * (0.9 + 0.1 * r.uniform()), r, 0.2 if k in (0, 3) else 0.14, swish=(k not in (0, 3))), t0 + k * e, 0.15, 0.7 if k in (0, 3) else 0.5)
    # the tune, a four-bar phrase at a time so that the whistler can breathe
    last = nb - 1; i = 0
    while i < last:
        notes = []
        for j in range(i, min(i + 4, last)):
            tpl = _SHANTY[j % 8]
            if j == last - 1: tpl = [(0, 1, 83), (1, 1, 80), (2, 1, 76), (3, 3, 80)]        # over the E chord: ends on the leading tone
            for k, ln, mid in tpl:
                t = j * bar + k * e; notes.append((t, ln * e * 0.97, mid, 0.78 * (0.85 if spk(t) else 1.0)))
        if notes:
            t0, w = whistle(notes, r, detune=0.0, vib_depth=14.0, breath=0.05); m.add(w, t0, 0.18, 0.5)
        i += 4
    # the sting on the first beat: a rolled Am chord, bass, a brush hit, and a whistle that swoops up to the tune
    _strum(m, r, [33, 45, 52, 57, 60, 64, 69], 0.0, 0.95, 0.0, 0.01, 1.0, 0.7, 0.9)
    m.add(brush(1.0, r, 0.3), 0.0, 0.1, 0.8); m.add(triangle(0.8, r, 1.4), 0.0, 0.2, 0.6)
    t0, w = whistle([(0.0, 0.14, 88, 0.8)], r, scoop=-400.0, jit=0.0); m.add(w, t0, 0.18, 0.4)
    # the cadence: E into A major (the playful turn to the major), the whistle on the tonic, ringing to the end
    _strum(m, r, [33, 45, 52, 57, 61, 64, 69], t_end, 1.0, 0.0, 0.012, 1.0, 0.7, 0.95)
    m.add(pluck(m2f(33), 0.9, r, 1.2, 0.3), t_end, 0.0, 1.0); m.add(brush(1.0, r, 0.4), t_end, 0.1, 0.8)
    t0, w = whistle([(t_end, 0.85, 81, 0.8)], r, jit=0.0); m.add(w, t0, 0.18, 0.55); m.add(triangle(0.7, r, 1.2, 2349.0), t_end, 0.2, 0.4)
    return _finish(m, seconds, r)


PIECES = {"roman": _roman, "shanty": _shanty}


def music(name, seconds, lines=None):
    """the named piece, `seconds` long, as a stereo array; the closing chord falls at seconds - 1.0"""
    if name not in PIECES: raise SystemExit(f"MUSIC FAILED: there is no piece called '{name}'; the pieces are {', '.join(sorted(PIECES))}")
    return PIECES[name](seconds, lines)


if __name__ == "__main__":
    from dsp import write_wav
    nm, sec = sys.argv[1], float(sys.argv[2]); write_wav(sys.argv[3], music(nm, sec, []))
    print(f"{sys.argv[3]}: {nm}, {sec:.1f} s")

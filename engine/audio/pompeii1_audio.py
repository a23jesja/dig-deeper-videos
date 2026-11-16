# Sound for the short "I Survived Pompeii: Part 1" (44.4 s): a light street tune that stops dead at the blast, the rumble of the mountain,
# crowd, fountain, the dog, a cup that rattles off a counter, running feet, coins, falling pumice. Every cue on a word or a cut of src/videos/emu/pompeii1.ts.
# usage: python audio/pompeii1_audio.py -> public/pompeii/mix-1.wav   (voice -16 LUFS, music 10 dB under it, final mix -14 LUFS)
import json, os, re, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import emu_long_audio as el  # noqa: E402
import emu_audio as ea  # noqa: E402
from emu_audio import I, G, F, fr, rng, r_, add, roll, thud, tick, clack, cut_whoosh, fx, gunshot, patter, Q  # noqa: E402
from dsp import SR, ns, tt, dbg, place, widen, make_ir, convolve_st, integrated, true_peak, read_wav, write_wav, lp, hp, bp, colored, fades, smooth_noise  # noqa: E402

ROOT = os.path.dirname(HERE)
TOTAL = len(json.load(open(os.path.join(ROOT, "src", "videos", "emu", "talkP1.json"))))
ea.TOTAL = TOTAL; ea.DUR = TOTAL / 30; ea.N = ns(ea.DUR); N = ea.N
ea.music = {k: np.zeros((2, N)) for k in ("low", "mid", "mel", "drum")}
ea.sfx = np.zeros((2, N))
t = fr
NAME = "pompeii-1"
WORDS = json.load(open(os.path.join(ROOT, "voice", NAME, "words.json"), encoding="utf-8"))
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
def at(line, word=None, n=0):
    L = [w for w in WORDS if w["line"] == line]
    if word is None: return round(L[0]["a"] * 30)
    return round([w for w in L if norm(w["w"]) == norm(word)][n]["a"] * 30)

# the cuts (same frames as BEATS in pompeii1.ts)
C = [0, at("truth") - 2, at("morning") - 2, at("morning", "town"), at("morning", "Fresh") - 2, at("dog") - 2, at("dog", "and") - 2, at("shake") - 2, at("shake", "Nobody") - 2, at("blow") - 2,
     at("pine") - 2, at("pine", "like") - 2, at("pine", "a", 2) - 2, at("pine", "then") - 2, at("ready") - 2, at("run") - 2, at("run", "The", 1) - 2, at("run", "The", 2) - 2, at("run", "I") - 2,
     at("stones") - 2, at("stones", "Not") - 2, at("next") - 2]
BLAST = at("blow", "blows") - 3
STONES0 = at("stones", "sky") - 6
MORNING = at("morning") - 2

def rumble(dur, r, lo=24, hi=70, shake=0.5):
    n = ns(dur); x = colored(n, r, -1.5)
    y = lp(x, hi, 3) * (1 + shake * smooth_noise(n, r, 9.0))
    return y / (np.abs(y).max() + 1e-9)

def _render():
    mm = ea.music
    mix = 0.9 * mm["low"] + 0.75 * mm["mid"] + 0.8 * mm["mel"] + 0.7 * mm["drum"]
    wet = convolve_st(0.3 * mm["mid"] + 0.5 * mm["mel"] + 0.35 * mm["drum"] + 0.15 * mm["low"], make_ir(1.6, 7, hf=0.5))[:, :N]
    return mix + 0.25 * wet

def build_music():
    tim = lambda f, m=38, v=0.8: add("drum", I.timpani(F(m), v, r_()), t(f), 0)
    cym = lambda f, v=0.4: add("drum", I.cymbal(v, r_()), t(f), 0.1)
    cut = ns(t(BLAST))
    # before the blast: the blast of the first frame, the truth, and the light street tune
    tim(1, 36, 0.9); el.stab(2, 0.55, (57, 60, 65)); cym(3, 0.35)
    el.sad(t(C[1] + 4), ((0, 2, 62), (2, 2, 59), (4, 2, 62), (6, 2, 57)))
    el.light(t(MORNING), int((BLAST - MORNING) / 30 / (4 * Q)) + 1, 0.42)
    pre = _render(); k = ns(0.004)
    pre[:, cut:] = 0.0; pre[:, cut - k:cut] *= np.linspace(1, 0, k)[None, :]           # the tune stops dead: nothing of it, not even its reverb, is left
    for key in ea.music: ea.music[key][:] = 0.0
    # after the blast: one hit, then low drums and strings; the dark at the end
    tim(BLAST, 36, 1.0); el.stab(BLAST, 0.6, (55, 58, 62)); cym(BLAST + 1, 0.5)
    el.tension(t(C[10]), t(at("ready") - 4))
    roll(t(at("ready") - 6), t(at("run") - 2), 0.15, 0.7)
    for k2, f in enumerate((at("run"), at("run", "The", 1), at("run", "The", 2), at("run", "I"))): tim(f, 40 - (k2 % 2) * 2, 0.7)
    el.sneak(t(C[19]), 3)
    tim(STONES0 + 6, 36, 0.9); tim(C[20], 34, 0.9)
    el.sad(t(C[21] + 4), ((0, 2, 57), (2, 2, 55), (4, 4, 53)))
    return pre + _render()

def bark(r, f0=420):
    n = ns(0.2); tm = np.arange(n) / SR; nz = r.standard_normal(n)
    env = np.exp(-tm / 0.05) * np.clip(tm / 0.004, 0, 1)
    src = (np.sin(2 * np.pi * np.cumsum(f0 * (1.25 - 1.0 * tm)) / SR) + 0.5 * np.sin(4 * np.pi * np.cumsum(f0 * (1.25 - 1.0 * tm)) / SR)) * 0.6 + 0.5 * bp(nz, 700, 2600, 1)
    return fades(bp(src, 280, 3000, 1) * env, 0.001, 0.03)

def build_sfx():
    r = rng(1979)
    for k, f in enumerate(C[1:], 1):
        if f < BLAST - 3 or f > at("ready") - 3: cut_whoosh(f, r, 0.18)
    # the blast at frame 0 and the rumble that never quite stops
    fx(gunshot(r, 1.0), 1, 0, 0.55); fx(thud(r, 46, 1.2), 2, 0, 0.7)
    R0 = rumble(ea.DUR - t(0), r); R0 = np.stack([R0, np.roll(R0, 400)]) if False else np.stack([R0, R0])
    env0 = np.interp(np.arange(N) / SR, [0, 0.3, 2.5, t(C[1]), t(MORNING) - 1, t(BLAST) - 2, t(BLAST), t(BLAST) + 1.5, t(BLAST) + 8, t(at("run")), t(C[21]), ea.DUR], [0.9, 1.0, 0.35, 0.0, 0.0, 0.0, 0.0, 1.0, 0.65, 0.8, 1.0, 1.0])
    ea.sfx += R0 * env0[None, :] * 0.8
    # morning: the town: voices, the fountain, the oven, a cart, the dog
    place(ea.sfx, G.water_bed(t(BLAST) - t(MORNING), r, 0.3) * 0.5, t(MORNING), 0.25)
    for k in range(7): place(ea.sfx, widen(G.babble(t(BLAST) - t(MORNING) + 1, r, r.uniform(110, 210), r.uniform(0.9, 1.15), rate=r.uniform(3.2, 4.4)), r), t(MORNING) + r.uniform(0, 0.8), 0.18)
    for k in range(12): fx(tick(r, 2300, 0.006), C[4] + 3 + k * 4 + int(r.integers(0, 3)), r.uniform(-0.4, 0.4), 0.12)       # the oven crackles
    for f0 in (C[5] + 12, C[5] + 24, C[5] + 41): fx(bark(r), f0, -0.2, 0.3)                                       # the dog, happy
    # the ground shakes: a cup rattles, falls and breaks
    fx(G.rattle(1.0, r, 34.0) * 0.5, C[7] + 12, 0.1, 0.35); fx(clack(r), C[7] + 36 + 20, -0.2, 0.55); fx(G.clink(r, 1500), C[7] + 36 + 23, -0.2, 0.3)
    fx(G.creak(1.2, r, 80, 140), C[8] + 4, 0.2, 0.25)
    # the blast: a crowd cries out, then everyone runs
    for k, (f0, b) in enumerate(((BLAST + 5, 150), (BLAST + 12, 190), (BLAST + 20, 120), (BLAST + 31, 230), (BLAST + 44, 170))): fx(widen(G.whoa(r, b), r), f0, (-0.5 + 0.25 * k), 0.4)
    fx(widen(G.whoosh(1.4, r, peak=0.4, f_lo=100, f_hi=1500), r), BLAST - 6, 0, 0.5)
    fx(patter(t(at("stones") - at("run")) + 1, r, 16, None, 380), at("run") - 4, 0, 0.5)                              # running feet
    for k in range(8): fx(G.clink(r, 1700 + 90 * k), at("run", "coins") + 3 + 3 * k, r.uniform(-0.3, 0.3), 0.3)          # coins
    for k in range(3): fx(widen(G.hurrah(r, r.uniform(120, 190), 1.0), r) * 0.6, at("run") + 14 + 33 * k, r.uniform(-0.5, 0.5), 0.0)
    # the stones: a few, then a rain of them
    for k in range(110):
        u = (k / 110) ** 1.4; f0 = int(STONES0 + u * (TOTAL - STONES0 - 20))
        fx(clack(r) if k % 3 else thud(r, r.uniform(90, 180), 0.6), f0 + int(r.integers(0, 4)), r.uniform(-0.7, 0.7), 0.22 + 0.2 * u)
    fx(widen(G.whoosh(2.6, r, peak=0.15, f_lo=80, f_hi=700), r), C[21], 0, 0.5)                                      # the wind and the dark
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

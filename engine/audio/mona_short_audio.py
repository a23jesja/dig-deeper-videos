# Sound for the short "Someone stole the Mona Lisa" (50 s): the house score plus effects, every cue on a word.
# usage: python audio/mona_short_audio.py -> public/mona/mix-short.wav
import json, os, re, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import emu_long_audio as el  # noqa: E402
import emu_audio as ea  # noqa: E402
from emu_audio import I, G, F, fr, rng, r_, add, roll, thud, tick, scratch, cut_whoosh, fx  # noqa: E402
from dsp import SR, ns, dbg, widen, make_ir, convolve_st, integrated, true_peak, read_wav, write_wav, tt, phase  # noqa: E402

TOTAL = 1490
ea.TOTAL = TOTAL; ea.DUR = TOTAL / 30; ea.N = ns(ea.DUR); N = ea.N
ea.music = {k: np.zeros((2, N)) for k in ("low", "mid", "mel", "drum")}
ea.sfx = np.zeros((2, N))
t = fr
ROOT = os.path.dirname(HERE)
NAME = "mona-short"
WORDS = json.load(open(os.path.join(ROOT, "voice", NAME, "words.json"), encoding="utf-8"))
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
def at(line, word=None, n=0):
    L = [w for w in WORDS if w["line"] == line]
    if word is None: return round(L[0]["a"] * 30)
    return round([w for w in L if norm(w["w"]) == norm(word)][n]["a"] * 30)
def whistle(dur=0.55):
    """a policeman's pea whistle"""
    x = tt(dur); y = np.sin(phase(2750 * (1 + 0.04 * np.sin(2 * np.pi * 34 * x)))) * (0.6 + 0.4 * np.sin(2 * np.pi * 34 * x))
    return y * np.minimum(1, x / 0.02) * np.minimum(1, (dur - x) / 0.05)

# the cuts (same frames as S in src/videos/style/MonaShort.tsx)
C = {"paris": at("paris") - 1, "who": at("who") - 1, "lift": at("lift") - 1, "guards": at("guards") - 1, "artist": at("artist") - 1, "react": at("artist", "finds") + 1,
     "det": at("police") - 1, "pic": at("police", "Even") - 1, "queue": at("queue") - 1, "trunk": at("trunk") - 1, "letter": at("letter") - 1, "arrest": at("letter", "and") - 1,
     "back": at("back"), "end": at("end")}

def build_music():
    tim = lambda f, m=43, v=0.75: add("drum", I.timpani(F(m), v, r_()), t(f), 0)
    cym = lambda f, v=0.4: add("drum", I.cymbal(v, r_()), t(f), 0.1)
    glock = lambda f, m, v=0.5: add("mel", I.glock(F(m), v, r_()), t(f), 0.2)
    tim(0); el.stab(2, 0.55); cym(4); el.sneak(t(20), 3); el.trombone(at("hook", "nobody") + 2, 58)
    el.pizz(t(C["paris"] + 3), [(0, 1, 74), (1, .5, 71), (1.5, .5, 74), (2, 1, 79)], 0.45); glock(at("paris", "closed") + 2, 86)
    el.sneak(t(C["who"] + 2), 4)
    el.sneak(t(C["lift"] + 2), 2); glock(at("lift", "wraps") + 5, 91); el.gallop(t(at("lift", "walks") - 6), 1)
    el.pizz(t(C["guards"] + 3), [(0, 1, 62), (1, 1, 66), (2, 1, 62), (3, 1, 57)], 0.45); el.trombone(at("guards", "shrug") - 2, 55)
    el.light(t(C["artist"] + 2), 2, 0.42)
    roll(t(C["react"] - 12), t(C["react"]), 0.15, 0.6); tim(C["react"], 38, 0.85); el.stab(C["react"], 0.6); cym(C["react"] + 2, 0.5)
    el.gallop(t(C["det"] + 2), 1)
    el.sad(t(C["pic"] + 4), ((0, 2, 62), (2, 2, 59)))
    tim(at("police", "Wrong") - 1, 43, 0.7); el.pizz(t(at("police", "Wrong") + 4), [(0, .5, 67), (.5, .5, 71), (1, 1, 74)], 0.5)
    el.light(t(C["queue"] + 2), 3, 0.42)
    el.sneak(t(C["trunk"] + 2), 2); glock(at("trunk", "trunk") - 2, 88)
    el.pizz(t(C["letter"] + 3), [(0, 1, 62), (1, 1, 66), (2, 1, 69), (3, 1, 74)], 0.45); glock(at("letter", "Leonardo") + 6, 91)
    roll(t(C["arrest"] - 10), t(C["arrest"]), 0.15, 0.55); tim(C["arrest"], 38, 0.85); el.stab(C["arrest"], 0.55)
    el.light(t(C["back"] + 2), 2, 0.45); cym(at("back", "back") - 2, 0.45)
    el.pizz(t(C["end"] + 2), [(0, 1, 74), (1, .5, 71), (1.5, .5, 74), (2, 1, 79), (3, 1, 76), (4, 2, 74)], 0.5)
    glock(at("end", "famous") + 4, 91)
    tb = t(TOTAL - 26); add("low", I.brass(F(43), 0.3, 0.6, r_(), "tuba"), tb, -0.08); el.stab(TOTAL - 26, 0.45); cym(TOTAL - 24, 0.35)
    m = ea.music
    mix = 0.9 * m["low"] + 0.75 * m["mid"] + 0.8 * m["mel"] + 0.7 * m["drum"]
    wet = convolve_st(0.3 * m["mid"] + 0.5 * m["mel"] + 0.35 * m["drum"] + 0.15 * m["low"], make_ir(1.4, 7, hf=0.6))[:, :N]
    return mix + 0.25 * wet

def build_sfx():
    r = rng(211)
    for k in C: cut_whoosh(C[k], r, 0.3)
    fx(widen(G.whoosh(0.7, r, peak=0.3, f_lo=600, f_hi=5000), r), 0, 0, 0.5)                      # the painting comes off
    fx(scratch(r, 0.25), 8, 0.1, 0.35); fx(thud(r, 70, 0.8), at("hook", "nobody") - 2, 0, 0.5)
    fx(tick(r, 900, 0.03), at("paris", "closed") - 4, 0, 0.4)                                      # the sign swings
    fx(scratch(r, 0.2), at("lift", "lifts"), 0.1, 0.35); fx(thud(r, 85, 0.6), at("lift", "hooks") + 4, 0, 0.35)
    fx(widen(G.whoosh(0.4, r, peak=0.25, f_lo=800, f_hi=6000), r), at("lift", "wraps") + 2, 0, 0.5)
    for k in range(8): fx(G.boot(r, 0.6), at("lift", "walks") - 6 + k * 6, -0.2 - 0.05 * k, 0.2)
    for k in range(10): fx(G.boot(r, 0.6), C["artist"] + 3 + k * 6, 0.3 - 0.04 * k, 0.18)
    fx(thud(r, 60, 0.9), C["react"], 0, 0.55)
    for k in range(6): fx(tick(r, 2400 + 200 * (k % 3), 0.02), C["det"] + 6 + k * 7, r.uniform(-0.4, 0.4), 0.25)
    fx(thud(r, 75, 0.9), at("police", "Wrong") - 1, 0, 0.6)                                         # the stamp
    for k in range(6): fx(G.boot(r, 0.5), C["queue"] + 8 + k * 14, r.uniform(-0.4, 0.4), 0.12)
    fx(scratch(r, 0.3), C["trunk"] + 2, 0, 0.3); fx(thud(r, 65, 0.6), C["trunk"] + 14, 0, 0.35); fx(scratch(r, 0.25), at("trunk", "trunk") - 14, 0.1, 0.3)
    for k in range(7): fx(scratch(r, 0.1), at("letter", "signed") + k * 3, 0.1, 0.22)                # the pen
    fx(whistle(), C["arrest"] + 2, -0.2, 0.12); fx(thud(r, 70, 0.8), C["arrest"], 0, 0.5)
    for k in range(5): fx(tick(r, 3000 + 300 * k, 0.02), at("back", "back") - 2 + k * 3, 0.2, 0.25)
    fx(widen(G.whoosh(0.5, r, peak=0.2, f_lo=500, f_hi=4000), r), at("end", "famous") - 6, 0, 0.35)  # the cap comes off
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
    os.makedirs(os.path.join(ROOT, "public", "mona"), exist_ok=True)
    write_wav(os.path.join(ROOT, "public", "mona", "mix-short.wav"), mix, 16)
    print("mix: %.2f s, %.1f LUFS, true peak %.1f dBTP | voice %.1f, music %.1f, sfx %.1f LUFS" % (mix.shape[1] / SR, integrated(mix), true_peak(mix), integrated(voice), integrated(m), integrated(s)))

if __name__ == "__main__":
    main()

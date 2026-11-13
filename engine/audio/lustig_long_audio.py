# Sound for the long film "The Man Who Sold the Eiffel Tower" (3 min 1 s): the house score scene by scene, plus effects.
# usage: python audio/lustig_long_audio.py -> public/lustig/mix-long.wav
import json, os, re, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import emu_long_audio as el  # noqa: E402
import emu_audio as ea  # noqa: E402
from emu_audio import I, G, F, Q, fr, rng, r_, add, roll, thud, tick, scratch, cut_whoosh, fx  # noqa: E402
from dsp import SR, ns, dbg, pan, place, widen, make_ir, convolve_st, integrated, true_peak, read_wav, write_wav, lp, tt, phase  # noqa: E402

TOTAL = 5480
ea.TOTAL = TOTAL; ea.DUR = TOTAL / 30; ea.N = ns(ea.DUR); N = ea.N
ea.music = {k: np.zeros((2, N)) for k in ("low", "mid", "mel", "drum")}
ea.sfx = np.zeros((2, N))
t = fr
ROOT = os.path.dirname(HERE)
NAME = "lustig-long"
WORDS = json.load(open(os.path.join(ROOT, "voice", NAME, "words.json"), encoding="utf-8"))
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
def at(line, word=None, n=0):
    L = [w for w in WORDS if w["line"] == line]
    if word is None: return round(L[0]["a"] * 30)
    return round([w for w in L if norm(w["w"]) == norm(word)][n]["a"] * 30)
def whistle(dur=0.55):
    x = tt(dur); y = np.sin(phase(2750 * (1 + 0.04 * np.sin(2 * np.pi * 34 * x)))) * (0.6 + 0.4 * np.sin(2 * np.pi * 34 * x))
    return y * np.minimum(1, x / 0.02) * np.minimum(1, (dur - x) / 0.05)
def horn(dur=1.1):
    return lp(np.sign(np.sin(phase(np.full(ns(dur), 98.0)))) * np.sin(np.pi * tt(dur) / dur) ** 0.5, 500, 2)
def ring(r, dur=0.7):
    x = tt(dur); return np.sin(phase(np.full(ns(dur), 1900.0))) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 22 * x))) * np.minimum(1, (dur - x) / 0.05)

A = {k: at(k) - 4 for k in ["hook2", "hook3", "intro", "born", "report", "languages", "liners", "box", "trick", "sell", "sheriff", "paris", "plan", "hotel", "poisson", "austria", "again",
                            "capone", "capone2", "fake", "billy", "key", "escape", "alcatraz", "death", "end", "outro"]}
SAILS = at("again", "Lustig") - 4; POL = at("again", "police") - 6

def build_music():
    tim = lambda f, m=43, v=0.75: add("drum", I.timpani(F(m), v, r_()), t(f), 0)
    cym = lambda f, v=0.4: add("drum", I.cymbal(v, r_()), t(f), 0.1)
    glock = lambda f, m, v=0.5: add("mel", I.glock(F(m), v, r_()), t(f), 0.2)
    tim(0); roll(0.05, t(at("hook1", "sold") - 4), 0.15, 0.5); el.stab(at("hook1", "sold") - 2, 0.5); cym(at("hook1", "sold") + 2)
    el.pizz(t(A["hook2"] + 4), [(0, 1, 62), (1, 1, 59), (3, 1, 62), (4, 1, 67)], 0.45); el.trombone(at("hook3", "again") + 2, 58)
    el.pizz(t(A["intro"] + 4), [(0, 1, 74), (1, .5, 71), (1.5, .5, 74), (2, 1, 79), (3, 1, 76), (4, 2, 74)])
    el.light(t(A["born"] + 2), 4, 0.4)                                                      # Bohemia, school
    el.trombone(at("report", "idiot") + 4, 55)
    el.pizz(t(A["languages"] + 2), [(0, 1, 62), (1, 1, 66), (2, 2, 69)], 0.45)
    for k, w in enumerate(["English", "French", "Italian", "Hungarian"]): glock(at("languages", w) - 2, [79, 83, 86, 91][k])
    el.light(t(A["liners"] + 2), 4, 0.42); el.trombone(at("liners", "There") + 2, 56)       # the liners
    el.sneak(t(A["box"] + 2), 6)                                                            # the money box
    el.stab(at("trick", "out") - 3, 0.45, (62, 66, 69)); glock(at("trick", "out") - 2, 91)
    cym(at("sell", "thousands") - 2, 0.35)
    el.gallop(t(A["sheriff"] + 2), 2); el.trombone(at("sheriff", "fake") + 2, 55)           # Texas to Chicago
    el.light(t(A["paris"] + 2), 4, 0.42)                                                    # Paris
    el.march(t(A["plan"] + 2), 3, 0.45)                                                     # the official
    el.sneak(t(A["hotel"] + 2), 4)                                                          # the secret
    el.pizz(t(A["poisson"] + 2), [(0, 1, 62), (1, 1, 66), (2, 2, 69), (5, 1, 74), (6, 1, 72), (7, 2, 69)], 0.45)
    sev = at("poisson", "70,000") - 2; tim(sev, 38, 0.8); el.stab(sev, 0.55, (62, 66, 69)); cym(sev + 1)
    el.gallop(t(A["austria"] + 2), 1); el.sad(t(at("austria", "Poisson") - 2), ((0, 2, 62), (2, 2, 59), (4, 2, 55)))
    el.sneak(t(A["again"] + 2), 2); roll(t(POL - 20), t(POL), 0.15, 0.6); tim(POL, 38, 0.85); el.stab(POL, 0.55)
    el.pizz(t(SAILS + 4), [(0, .5, 67), (.5, .5, 71), (1, .5, 74), (1.5, 1.5, 79)], 0.5); cym(SAILS + 30)
    el.sneak(t(A["capone"] + 2), 6)                                                         # Capone
    glock(at("capone2", "5,000") - 2, 86); el.stab(at("capone2", "5,000") - 2, 0.45)
    el.march(t(A["fake"] + 2), 4, 0.48)                                                     # printing money
    el.pizz(t(A["billy"] + 2), [(0, 1, 74), (1, 1, 72), (2, 1, 71), (3, 1, 69)], 0.45)
    el.tension(t(A["key"] + 2), t(A["escape"] - 6)); tim(at("key", "51,000") - 4, 38, 0.8); cym(at("key", "51,000") - 3)
    el.gallop(t(A["escape"] + 2), 3)                                                        # the escape
    el.sad(t(A["alcatraz"] + 2), ((0, 2, 62), (2, 2, 59), (4, 3, 55)))
    el.sad(t(A["death"] + 2), ((0, 3, 67), (3, 1, 66), (4, 3, 62), (7, 1, 64), (8, 4, 67)))
    el.pizz(t(A["end"] + 2), [(0, 1, 74), (1, .5, 71), (1.5, .5, 74), (2, 1, 79)], 0.5)
    el.pizz(t(A["outro"] + 2), [(0, .5, 67), (1, .5, 71), (2, 1, 74)], 0.45)
    tb = t(TOTAL - 22); add("low", I.brass(F(43), 0.3, 0.65, r_(), "tuba"), tb, -0.08); add("drum", I.snare(0.7, r_()), tb, 0.12); el.stab(TOTAL - 22, 0.5)
    m = ea.music
    mix = 0.9 * m["low"] + 0.75 * m["mid"] + 0.8 * m["mel"] + 0.7 * m["drum"]
    wet = convolve_st(0.3 * m["mid"] + 0.5 * m["mel"] + 0.35 * m["drum"] + 0.15 * m["low"], make_ir(1.1, 7, hf=0.6))[:, :N]
    return mix + 0.22 * wet

def build_sfx():
    r = rng(103)
    place(ea.sfx, G.breeze(ea.DUR, r, 0.35), 0, 0.4)
    place(ea.sfx, pan(G.bird_chirps(ea.DUR, r, 0.25, "blackbird"), -0.4), 0, 0.04)
    for k in ["hook2", "hook3", "report", "trick", "sell", "plan", "poisson", "capone2", "key", "alcatraz"]: cut_whoosh(A[k], r, 0.32)
    fx(widen(G.whoosh(0.7, r, peak=0.3, f_lo=600, f_hi=5000), r), A["intro"] - 8, 0, 0.5)
    for f in [at("hook1", "sold") - 2, at("hook2", "sold") - 2, at("hook3", "again") - 3]: fx(thud(r, 70, 0.8), f, 0, 0.55)
    fx(thud(r, 85, 0.7), at("born", "expelled") - 3, 0, 0.55); fx(scratch(r, 0.2), at("born", "rude") - 3, 0.2, 0.3)
    fx(thud(r, 85, 0.7), at("report", "idiot") - 3, 0, 0.55)
    fx(horn(), A["liners"] + 8, 0, 0.06); fx(thud(r, 85, 0.7), at("liners", "There") - 3, 0, 0.55)
    fx(tick(r, 900, 0.03), at("trick", "puts") + 10, 0, 0.3)
    six = at("trick", "Six") - 2
    for k in range(12): fx(tick(r, 2200, 0.012), six + k * 4, 0.2, 0.22)                    # the clock
    fx(tick(r, 2600, 0.02), at("trick", "out") - 2, 0.2, 0.4)
    for k in range(8): fx(G.boot(r, 0.8), A["sheriff"] + 4 + k * 4, -0.3, 0.2)
    fx(thud(r, 85, 0.7), at("sheriff", "fake") - 3, 0, 0.55)
    fx(scratch(r, 0.25), A["paris"] + 30, 0.2, 0.3); fx(thud(r, 60, 0.8), at("paris", "expensive") - 3, 0, 0.45); fx(tick(r, 2600, 0.02), at("paris", "repaint") + 4, 0.2, 0.4)
    fx(scratch(r, 0.2), at("plan", "forged") - 2, 0, 0.3)
    for k in range(12): fx(G.boot(r, 0.7), A["hotel"] + 6 + k * 3, r.uniform(-0.3, 0.3), 0.16)
    fx(tick(r, 1800, 0.02), at("hotel", "government") - 3, 0, 0.3)
    for w in ["bribe"]: fx(thud(r, 85, 0.6), at("poisson", w) - 3, 0, 0.45)
    for k in range(4): fx(tick(r, 3000 + 300 * k, 0.02), at("poisson", "70,000") - 2 + k * 3, 0.2, 0.3)
    for k in range(5): fx(G.boot(r, 0.8), POL + k * 3, -0.3, 0.2)
    fx(whistle(), POL + 8, -0.2, 0.1); fx(horn(), SAILS + 8, 0, 0.06)
    fx(thud(r, 60, 0.8), at("capone", "50,000") - 2, 0, 0.45); fx(thud(r, 90, 0.9), at("capone", "safe") - 3, 0.3, 0.5); fx(thud(r, 90, 0.9), at("capone", "gives") - 3, 0.3, 0.45)
    for k in range(18): fx(tick(r, 700, 0.02), A["fake"] + 8 + k * 9, r.uniform(-0.3, 0.3), 0.2)       # the press
    tel = at("billy", "telephones") - 3
    for k in range(2): fx(ring(r), tel - 26 + k * 16, 0.2, 0.05)
    for k in range(8): fx(G.boot(r, 0.8), at("billy", "federal") - 4 + k * 3, -0.3, 0.18)
    fx(tick(r, 3200, 0.03), at("key", "key") - 3, 0, 0.4); fx(thud(r, 90, 0.9), at("key", "51,000") - 6, 0, 0.5)
    cl = at("escape", "climbs") - 3
    for k in range(8): fx(scratch(r, 0.12), cl + 4 + k * 6, 0, 0.25)
    for k in range(8): fx(G.boot(r, 0.6), cl + 52 + k * 5, 0.3, 0.18)
    for k in range(6): fx(G.boot(r, 0.8), A["alcatraz"] + 4 + k * 3, r.uniform(-0.4, 0.4), 0.2)
    fx(thud(r, 90, 1.0), at("alcatraz", "Alcatraz") - 3, 0, 0.5)
    fx(thud(r, 70, 0.8), at("end", "still") - 3, 0, 0.5)
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
    mix[:, -ns(0.3):] *= np.linspace(1, 0, ns(0.3))[None, :]
    os.makedirs(os.path.join(ROOT, "public", "lustig"), exist_ok=True)
    write_wav(os.path.join(ROOT, "public", "lustig", "mix-long.wav"), mix, 16)
    print("mix: %.2f s, %.1f LUFS, true peak %.1f dBTP | voice %.1f, music %.1f, sfx %.1f LUFS" % (mix.shape[1] / SR, integrated(mix), true_peak(mix), integrated(voice), integrated(m), integrated(s)))

if __name__ == "__main__":
    main()

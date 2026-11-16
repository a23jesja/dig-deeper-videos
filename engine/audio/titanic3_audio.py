# Sound for the short "I Survived the Titanic: Part 3" (35.4 s): the house score plus effects, every cue on a word.
# usage: python audio/titanic3_audio.py -> public/titanic/mix-3.wav   (voice -16 LUFS, music 10 dB under it, final mix -14 LUFS)
import json, os, re, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import emu_long_audio as el  # noqa: E402
import emu_audio as ea  # noqa: E402
from emu_audio import I, G, F, fr, rng, r_, add, roll, thud, tick, scratch, cut_whoosh, fx, gunshot  # noqa: E402
from dsp import SR, ns, dbg, place, widen, make_ir, convolve_st, integrated, true_peak, read_wav, write_wav  # noqa: E402

TOTAL = 1062
ea.TOTAL = TOTAL; ea.DUR = TOTAL / 30; ea.N = ns(ea.DUR); N = ea.N
ea.music = {k: np.zeros((2, N)) for k in ("low", "mid", "mel", "drum")}
ea.sfx = np.zeros((2, N))
t = fr
ROOT = os.path.dirname(HERE)
NAME = "titanic-3"
WORDS = json.load(open(os.path.join(ROOT, "voice", NAME, "words.json"), encoding="utf-8"))
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
def at(line, word=None, n=0):
    L = [w for w in WORDS if w["line"] == line]
    if word is None: return round(L[0]["a"] * 30)
    return round([w for w in L if norm(w["w"]) == norm(word)][n]["a"] * 30)

# the cuts (same frames as BEATS in src/videos/emu/titanic3.ts) and the rocket bursts (R_BURST there)
C = {"truth": at("truth") - 2, "recap": at("recap") - 2, "left": at("recap", "About") - 2, "rockets": at("rockets") - 3, "bow": at("bow") - 3, "sea": at("bow", "sea") - 2,
     "gone": at("gone") - 2, "empty": at("gone", "Titanic") - 3, "boat": at("boat") - 2, "men": at("boat", "About") - 2, "dawn": at("dawn") - 3, "count": at("count") - 3, "end": at("end") - 3}
BURST = [17, 330, 389]
GONE = at("gone", "gone")

def build_music():
    tim = lambda f, m=43, v=0.75: add("drum", I.timpani(F(m), v, r_()), t(f), 0)
    cym = lambda f, v=0.4: add("drum", I.cymbal(v, r_()), t(f), 0.1)
    glock = lambda f, m, v=0.5: add("mel", I.glock(F(m), v, r_()), t(f), 0.2)
    tim(2, 38, 0.8); el.stab(3, 0.5, (57, 60, 65))                                  # the sinking, in the first frame
    el.sad(t(C["truth"] + 4), ((0, 2, 62), (2, 2, 59), (4, 2, 62), (6, 2, 57)))     # the truth, low strings
    el.sneak(t(C["recap"] + 2), 2)                                                  # the lifeboats are gone
    roll(t(C["left"]), t(C["rockets"] - 2), 0.15, 0.55)
    for b in BURST[1:]: tim(b, 38, 0.9); el.stab(b, 0.5, (57, 60, 65)); cym(b + 1, 0.4)     # a timpani on each burst
    el.trombone(C["bow"] + 2, 53)
    roll(t(C["bow"] + 8), t(C["gone"]), 0.15, 0.7)
    tim(GONE, 36, 1.0); el.stab(GONE, 0.6, (55, 58, 62)); cym(GONE + 1, 0.5)          # and on "gone"
    el.sad(t(C["empty"] + 6), ((0, 2, 60), (2, 2, 57), (4, 3, 55)))
    el.pizz(t(C["boat"] + 3), [(0, .5, 57), (.5, .5, 60), (1, .5, 62), (1.5, .5, 64)], 0.35)
    el.light(t(C["dawn"] + 2), 3, 0.4)                                              # the light theme at dawn
    glock(at("dawn", "Carpathia") + 2, 88, 0.5)
    el.sad(t(C["count"] + 4), ((0, 2, 62), (2, 2, 59), (4, 4, 55)))
    tb = t(TOTAL - 34); add("low", I.brass(F(41), 0.3, 0.6, r_(), "tuba"), tb, -0.08); tim(TOTAL - 34, 36, 0.7)
    m = ea.music
    mix = 0.9 * m["low"] + 0.75 * m["mid"] + 0.8 * m["mel"] + 0.7 * m["drum"]
    wet = convolve_st(0.3 * m["mid"] + 0.5 * m["mel"] + 0.35 * m["drum"] + 0.15 * m["low"], make_ir(1.6, 7, hf=0.5))[:, :N]
    return mix + 0.25 * wet

def build_sfx():
    r = rng(733)
    for k in C: cut_whoosh(C[k], r, 0.25)
    place(ea.sfx, G.water_bed(ea.DUR, r, 0.45), 0, 0.5)                              # the sea all the way through
    for f0 in (40, 150, 262, 361):                                                  # the ship creaks
        fx(widen(G.creak(1.6, r, 90, 150), r), f0, r.uniform(-0.4, 0.4), 0.35)
    fx(widen(G.chain_groan(3.2, r, 0.2, 0.9), r), C["bow"], 0, 0.3)                   # she goes down by the bow
    for b, rise in ((BURST[1], 1.3), (BURST[2], 1.2)):                              # rocket: whoosh up, bang, crackle
        fx(widen(G.whoosh(rise, r, peak=0.75, f_lo=700, f_hi=5500), r), b - int(rise * 30), 0.2, 0.35)
        fx(gunshot(r, 0.8), b, 0, 0.5); fx(thud(r, 70, 0.8), b, 0, 0.4)
        for k in range(10): fx(tick(r, 3200 + 150 * k, 0.008), b + 4 + k * 4, r.uniform(-0.6, 0.6), 0.1)
    fx(widen(G.whoosh(1.0, r, peak=0.6, f_lo=700, f_hi=5500), r), 0, 0.2, 0.3); fx(gunshot(r, 0.8), BURST[0], 0, 0.45)
    fx(widen(G.whoosh(1.2, r, peak=0.35, f_lo=150, f_hi=1800), r), C["sea"], 0, 0.45)   # the sea comes up the deck
    fx(thud(r, 52, 1.0), at("bow", "under"), 0, 0.5)
    fx(widen(G.splash_big(r), r), at("gone", "gone") - 2, 0, 0.4); fx(thud(r, 44, 1.2), GONE, 0, 0.6)   # gone
    for k in range(6): fx(G.splash_big(r) * 0.3, C["boat"] + 6 + k * 9, r.uniform(-0.4, 0.4), 0.2)      # swimming
    fx(widen(G.creak(1.2, r, 80, 120), r), C["men"], 0.1, 0.3)
    for k in range(5): fx(tick(r, 1700, 0.02), C["dawn"] + 10 + k * 7, 0.3, 0.2)
    fx(widen(G.whoosh(2.4, r, peak=0.2, f_lo=90, f_hi=500), r), at("dawn", "Carpathia") - 4, 0, 0.5)   # the ship's horn
    for f0 in (at("count", "about"), at("count", "About")): fx(scratch(r, 0.4), f0 + 2, 0.4, 0.35)     # chalk on the board
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
    os.makedirs(os.path.join(ROOT, "public", "titanic"), exist_ok=True)
    write_wav(os.path.join(ROOT, "public", "titanic", "mix-3.wav"), mix, 16)
    print("mix: %.2f s, %.1f LUFS, true peak %.1f dBTP | voice %.1f, music %.1f, sfx %.1f LUFS" % (mix.shape[1] / SR, integrated(mix), true_peak(mix), integrated(voice), integrated(m), integrated(s)))

if __name__ == "__main__":
    main()

# Search the cheat per shot (the cloud session's rule, 26 Nov) for shots without a camera: for each shot, its neighbours' places moved (out of the
# picture or aside) together with a few camera intents; the first that the tuner passes (every rule) and cheat_check passes is kept.
# Writes a short summary to out/din3d/search-cheats.txt.
#   python scripts/search_cheats.py 4 8 9 11      (from engine/)
import itertools, json, subprocess, sys

SHOTS = "src/craft/dinner3d/shots.json"; INT = "out/din3d/intents.json"; OUT = "out/din3d/search-cheats.txt"
OWN = {"4": ["crew"], "8": ["crew"], "9": ["captain"], "11": ["captain"]}
WALKING = {"8", "9", "10b", "11"}
OFFS = [None, [0.8, 0.0], [-0.8, 0.0], [1.5, 0.0], [-1.5, 0.0], [0.0, 0.8], [0.0, -0.8]]
INTENTS = {"4": [(10, 8, 26), (-35, 8, 26), (25, 8, 40)], "8": [(-35, 4, 30), (-20, 4, 30), (-60, 4, 30)], "9": [(25, 8, 26), (40, 8, 26), (15, 8, 30)], "11": [(8, 12, 20), (20, 12, 20), (30, 12, 24)]}


def log(s):
    print(s, flush=True); open(OUT, "a", encoding="utf-8").write(s + "\n")


def setcheat(sid, cheat):
    d = json.load(open(SHOTS)); s = next(x for x in d["shots"] if x["id"] == sid)
    if cheat: s["cheat"] = cheat
    else: s.pop("cheat", None)
    json.dump(d, open(SHOTS, "w"), indent=1)


def setintent(sid, az, el, lens):
    I = json.load(open(INT))
    for i in I:
        if i["id"] == sid: i.update(az=az, el=el, lens=lens)
    json.dump(I, open(INT, "w"))


def tune(sid):
    r = subprocess.run(["node", "scripts/dinner_v6_tune.mjs", "--only", sid], capture_output=True, text=True)
    line = next((l for l in r.stdout.splitlines() if l.strip().startswith(f"{sid}:") or f"shot {sid}:" in l), "")
    return line.strip().startswith(f"{sid}: az"), line.strip()[:140]


def cheat_ok():
    r = subprocess.run(["node", "scripts/cheat_check.mjs"], capture_output=True, text=True)
    return r.returncode == 0, [l.strip()[:120] for l in r.stdout.splitlines() if "->" in l and ": the" in l][:3]


for sid in sys.argv[1:]:
    d = json.load(open(SHOTS)); keep = next(x for x in d["shots"] if x["id"] == sid).get("cheat", {})
    others = [n for n in ("captain", "crew", "boy") if n not in OWN[sid] and not (n == "boy" and sid in WALKING)]
    combos = sorted(itertools.product(OFFS, repeat=len(others)), key=lambda c: sum(o is not None for o in c))
    done = False
    for combo in combos:
        cheat = dict(keep); [cheat.pop(n, None) for n in others]
        for n, o in zip(others, combo):
            if o: cheat[n] = o
        setcheat(sid, cheat)
        for (az, el, lens) in INTENTS[sid]:
            setintent(sid, az, el, lens); ok, line = tune(sid)
            if not ok: continue
            cok, why = cheat_ok()
            if cok: log(f"FOUND {sid}: cheat {cheat}, intent {az} {el} {lens}: {line}"); done = True; break
            log(f"  {sid}: cheat {cheat} camera ok but cheat_check: {why}")
        if done: break
    if not done: setcheat(sid, keep); log(f"NONE {sid}: no cheat and camera found ({len(combos)} cheats x {len(INTENTS[sid])} intents)")
log("search done")

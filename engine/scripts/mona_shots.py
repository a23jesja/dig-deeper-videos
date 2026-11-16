# Reads the shot lists of a film written as monaShots*.ts (monaKit-style) and writes its shot table as JSON:
# [{id, name, a, b}], checking that every at("line", "word", n) used anywhere in those files exists in the voice.
# usage: python scripts/mona_shots.py <words.json> <total frames> <out.json> <shots1.ts> [shots2.ts ...]
import json, re, sys
words = json.load(open(sys.argv[1], encoding="utf-8")); total = int(sys.argv[2]); out = sys.argv[3]
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
def at(line, word=None, n=0):
    L = [w for w in words if w["line"] == line]
    if not L: raise KeyError(f"no line {line}")
    if word is None: return round(L[0]["a"] * 30)
    m = [w for w in L if norm(w["w"]) == norm(word)]
    if len(m) <= n: raise KeyError(f'no word "{word}" ({n}) in line {line}: ' + " ".join(w["w"] for w in L))
    return round(m[n]["a"] * 30)
def end(line):
    L = [w for w in words if w["line"] == line]
    if not L: raise KeyError(f"no line {line}")
    return round(L[-1]["b"] * 30)
shots, bad = [], 0
for path in sys.argv[4:]:
    src = open(path, encoding="utf-8").read()
    for m in re.finditer(r'\b(at|end)\(("[^"]*"(?:,\s*"[^"]*")?(?:,\s*\d+)?)\)', src):
        try: eval(f"{m.group(1)}({m.group(2)})")
        except KeyError as e: bad += 1; print("MISSING", path.split("/")[-1], e)
    for m in re.finditer(r'\{ name: "([^"]*)", a: (.*?), zone: "(\w+)"(.*?)cam:', src):
        xm = re.search(r'[ ,]x: (\d+)', m.group(4))
        try: shots.append({"name": m.group(1), "a": int(eval(m.group(2))), "zone": m.group(3), "x": int(xm.group(1)) if xm else 0, "golden": "golden" in m.group(4)})
        except Exception as e: bad += 1; print("BAD START", m.group(1), m.group(2), e)
for i, s in enumerate(shots):
    s["id"] = i + 1; s["b"] = shots[i + 1]["a"] if i + 1 < len(shots) else total
    if i and s["a"] <= shots[i - 1]["a"]: bad += 1; print("ORDER", s["id"], s["name"], s["a"], "<=", shots[i - 1]["a"])
    if s["b"] - s["a"] < 30: print("SHORT", s["id"], s["name"], s["b"] - s["a"], "frames")
if shots: shots[0]["a"] = 0
json.dump(shots, open(out, "w", encoding="utf-8"), indent=0)
print(len(shots), "shots,", bad, "problems; longest", max((s["b"] - s["a"], s["id"]) for s in shots) if shots else None)
sys.exit(1 if bad else 0)

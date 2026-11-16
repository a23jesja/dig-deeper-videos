# Full-size review frames of a film rendered in chunks (scripts/render_film.py): for every shot one frame at its middle
# and one near its end (before the next shot's cross-fade starts), plus a list of the shots with what each should show.
# usage: python scripts/review_frames.py <outDir with chunks/> <shots.json> <reviewDir> [firstShot] [lastShot] [chunk=1500]
import json, os, subprocess, sys
out, shots_file, rv = sys.argv[1], sys.argv[2], sys.argv[3]
first = int(sys.argv[4]) if len(sys.argv) > 4 else 1
last = int(sys.argv[5]) if len(sys.argv) > 5 else 10 ** 6
size = int(sys.argv[6]) if len(sys.argv) > 6 else 1500
os.makedirs(rv, exist_ok=True)
shots = json.load(open(shots_file, encoding="utf-8"))
n = 0
for s in shots:
    if s["id"] < first or s["id"] > last: continue
    L = s["b"] - s["a"]
    frames = sorted(set([s["a"] + L // 2, s["b"] - 9] if L > 40 else [s["b"] - 9]))
    for f in frames:
        k, loc = f // size, f % size
        src = "%s/chunks/c_%02d.mp4" % (out, k)
        if not os.path.exists(src): continue
        dst = "%s/s%03d_f%05d.jpg" % (rv, s["id"], f)
        r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "%.4f" % ((loc + 0.5) / 30), "-i", src, "-frames:v", "1", "-q:v", "3", dst], capture_output=True, text=True)
        if r.stderr.strip(): print(s["id"], f, r.stderr[-200:])
        n += 1
open(rv + "/shots.txt", "w", encoding="utf-8").write("\n".join("%3d  frames %d-%d  %s" % (s["id"], s["a"], s["b"], s["name"]) for s in shots))
print(n, "frames ->", rv)

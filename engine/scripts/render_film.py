# Renders a long film in chunks of frames (video only), then joins the chunks and adds the mixed sound.
# A fix to a few shots only needs the chunks that hold them: pass their numbers and the rest are reused.
# usage: python scripts/render_film.py <CompId> <outDir> <totalFrames> <audio.wav> [chunk=1500] [only: 0,3,7 | all | join]
#   set TEMP/TMP to a scratch folder first (Remotion writes a lot there)
import os, subprocess, sys, time
comp, out, total, audio = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4]
size = int(sys.argv[5]) if len(sys.argv) > 5 else 1500
only = sys.argv[6] if len(sys.argv) > 6 else "all"
chrome = os.environ.get("CHROME", "C:/Program Files/Google/Chrome/Application/chrome.exe")
os.makedirs(out + "/chunks", exist_ok=True)
n = (total + size - 1) // size
todo = [] if only == "join" else list(range(n)) if only == "all" else [int(x) for x in only.split(",")]
for k in todo:
    a, b = k * size, min(total, (k + 1) * size) - 1
    f = "%s/chunks/c_%02d.mp4" % (out, k)
    t0 = time.time()
    r = subprocess.run(["npx", "remotion", "render", "src/index.ts", comp, f, "--frames=%d-%d" % (a, b), "--muted", "--gl=angle", "--codec", "h264", "--crf", "17",
                        "--concurrency", os.environ.get("CONC", "2"), "--browser-executable", chrome, "--log", "error"], shell=True, capture_output=True, text=True)
    ok = r.returncode == 0 and os.path.exists(f)
    print("chunk %02d frames %d-%d %s %.0f s" % (k, a, b, "ok" if ok else "FAILED", time.time() - t0), flush=True)
    if not ok: print((r.stdout + r.stderr)[-1500:], flush=True); sys.exit(1)
missing = [k for k in range(n) if not os.path.exists("%s/chunks/c_%02d.mp4" % (out, k))]
if missing: print("not joined, chunks missing:", missing); sys.exit(0)
lst = out + "/chunks/list.txt"
open(lst, "w").write("".join("file 'c_%02d.mp4'\n" % k for k in range(n)))
r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-i", audio, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k",
                    "-movflags", "+faststart", "-shortest", out + "/final.mp4"], capture_output=True, text=True)
print(r.stderr[-800:] or "joined -> %s/final.mp4" % out)

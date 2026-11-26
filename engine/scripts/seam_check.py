# The seam check (the reviewer, 26 Nov evening, after the independent review of v6: the red sleeve cut notches into the captain's beard in shot 11,
# frames 515-560, and brown beard flecks lay on the sleeve; the old beard_check never failed them). Every boundary between two drawn parts has
# an ink line between them. Where a beard-brown pixel touches a sleeve-red pixel within 2 px with no ink between them, one part has been cut
# into the other. A frame fails when more than MAX such pixels lie near the beard (its outline from out/din3d/regions.jsonl, widened by 20 px).
#   python scripts/seam_check.py <video.mp4> [--frames 515,518] [--out report.txt]
#   the planted fault: v6 itself (leverans/kaptenens-middag/kaptenens-middag-v6.mp4, md5 837784f4), frames 515 518 522 525 550 553 560 must fail
import json, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

MAX, TOL, NEAR = 12, 14, 6
BEARD, SLEEVE = np.array([64, 31, 18]), np.array([101, 19, 29])
a = sys.argv[1:]; vid = a[0]
opt = lambda k: a[a.index(k) + 1] if k in a else None
frames = [int(x) for x in opt("--frames").split(",")] if opt("--frames") else None
outp = opt("--out")
R = {}
for line in open("out/din3d/regions.jsonl", encoding="utf-8"):
    d = json.loads(line)
    if d.get("beard"): R[d["F"]] = d["beard"]


def all_frames():
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-nostdin", "-i", vid, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    n = 0
    while True:
        b = p.stdout.read(1920 * 1080 * 3)
        if len(b) < 1920 * 1080 * 3: break
        yield n, np.frombuffer(b, np.uint8).reshape(1920, 1080, 3); n += 1


def near(m, k):
    """m widened by k px (a square)"""
    o = m.copy()
    for dy in range(-k, k + 1):
        for dx in range(-k, k + 1):
            o |= np.roll(np.roll(m, dy, 0), dx, 1)
    return o


rows, fails, worst = [], [], (0, -1)
for f, im in all_frames():
    if f not in R or (frames is not None and f not in frames): continue
    P = [q for b in R[f] for q in b["poly"]]
    x0, x1 = max(0, int(min(q[0] for q in P)) - 20), min(1080, int(max(q[0] for q in P)) + 21)
    y0, y1 = max(0, int(min(q[1] for q in P)) - 20), min(1920, int(max(q[1] for q in P)) + 21)
    zone = Image.new("L", (x1 - x0, y1 - y0), 0); dr = ImageDraw.Draw(zone)
    for b in R[f]: dr.polygon([(q[0] - x0, q[1] - y0) for q in b["poly"]], fill=255, outline=255, width=40)      # (the outline widened by 20 px)
    c = im[y0:y1, x0:x1].astype(np.int16); z = np.asarray(zone) > 0
    isB = (np.abs(c - BEARD).max(2) < TOL) & z; isR = (np.abs(c - SLEEVE).max(2) < TOL) & z
    ink = near((c[..., 0] < 48) & z, 4)      # (an ink line (R under 48; the beard's R is 64, the sleeve's 100) within 4 px: a drawn boundary, not a cut)
    bad = ((isB & near(isR, NEAR)) | (isR & near(isB, NEAR))) & ~ink
    n = int(bad.sum()); rows.append((f, n)); worst = max(worst, (n, f))
    if n > MAX: fails.append(f"frame {f}: {n} pixels where the beard's brown and the sleeve's red meet within {NEAR} px with no ink line between them (at most {MAX})")
txt = "\n".join([f"seam check: {len(rows)} frames with the captain's beard; beard-brown touching sleeve-red within {NEAR} px with no ink between (a cut-in notch or a fleck)",
                 f"largest: {worst[0]} (frame {worst[1]})", f"{'FAIL' if fails else 'PASS'}: {len(fails)} frames"] + ["  " + x for x in fails[:60]])
print(txt)
if outp: open(outp, "w", encoding="utf-8").write(txt + "\n")
sys.exit(1 if fails else 0)

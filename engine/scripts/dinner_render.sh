#!/bin/bash
# The Short "The captain's dinner": the film (2x, lanczos down, CRF 16, the mix), then the checks on the file: dinner_check (writes the root),
# limb_check, motion2, flicker2 (the new measure) and step 1's depth check, run on the root. One job: nothing else may run beside it.
#   OUT=out/din3d/test-t1.mp4 [WAV=public/craft/dinner3d.wav] bash scripts/dinner_render.sh        (from engine/)
set -e
cd "$(dirname "$0")/.."
OUT=${OUT:?set OUT}; WAV=${WAV:-public/craft/dinner3d.wav}; export REMOTION_TMP="C:/Users/sweje/AppData/Local/Temp/remotion-tmp"
BIG=out/din3d/_2x.mp4; LOG=${OUT%.mp4}
MEM_START=8 MEM_LOG=$LOG.log bash scripts/mem_guard.sh npx remotion render src/index.ts Dinner3D "$BIG" --scale 2 --gl=angle --codec h264 --crf 10 --x264-preset veryfast --concurrency 1 --muted --browser-executable "C:/Program Files/Google/Chrome/Application/chrome.exe" < /dev/null > $LOG.out 2>&1 || { tail -5 $LOG.out; exit 1; }
timeout 600 ffmpeg -nostdin -v error -y -i "$BIG" -i "$WAV" -map 0:v -map 1:a -vf "scale=1080:1920:flags=lanczos:in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p" -c:v libx264 -preset slow -crf 16 -x264-params aq-mode=3 -r 30 -fps_mode cfr -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT" < /dev/null
rm -f "$BIG"
node scripts/dinner_check.mjs > $LOG-check.txt 2>&1 || true; tail -1 $LOG-check.txt
node scripts/limb_check.mjs dinner > $LOG-limb.txt 2>&1 || true; tail -1 $LOG-limb.txt
python scripts/motion2.py --root out/din3d/root --out $LOG-motion2.txt > /dev/null 2>&1 || true; grep -E "^(PASS|FAIL|largest)" $LOG-motion2.txt | head -3
python scripts/flicker2.py "$OUT" out/din3d/regions.jsonl --cams out/din3d/root --out $LOG-flicker2.txt > /dev/null 2>&1 || true
grep -E "^largest|^FAIL|^PASS" $LOG-flicker2.txt; grep -A40 "^FAIL" $LOG-flicker2.txt | grep "  frame" | cut -c1-150 | head -20
python scripts/seam_check.py "$OUT" --out $LOG-seam.txt > /dev/null 2>&1 || true; sed -n 2,3p $LOG-seam.txt      # (the seam check: beard and sleeve meeting with no ink, the review of v6)
python - <<'PY'
import numpy as np, glob, json, os
S = json.load(open('src/craft/dinner3d/shots.json'))
for s in S['shots']:
    p = f'out/din3d/root/out/cab3d/{s["id"]}/map.npz'
    if not os.path.exists(p): continue
    z = np.load(p); n = round((s['t1'] - s['t0']) * 30)
    if z['depth'].shape[0] == 1: np.savez_compressed(p, depth=np.repeat(z['depth'], n, 0), kind=np.repeat(z['kind'], n, 0), kinds=z['kinds'])      # (a held camera: its one map for every frame)
PY
(cd out/din3d/root && python ../../../scripts/dinner_depth.py > ../$(basename $LOG)-depth.txt 2>&1 || true; python ../../../scripts/dinner_depth.py --plant > ../$(basename $LOG)-depth-plant.txt 2>&1 || true; python ../../../scripts/dinner_depth.py --plant-arm > ../$(basename $LOG)-depth-plant-arm.txt 2>&1 || true); tail -1 out/din3d/$(basename $LOG)-depth.txt; tail -1 out/din3d/$(basename $LOG)-depth-plant.txt; tail -1 out/din3d/$(basename $LOG)-depth-plant-arm.txt

#!/bin/bash
# 3D step 2, the movement sheet: a TEST render into out/mov3d (never leverans/), as the cabin's (2x, lanczos down, CRF 16), then the checks:
# moves_check (feet, slides, edges; writes the root for the frozen measures), motion2 (joints) and flicker2 (the new flicker measure) on it.
# One job: nothing else may run beside it.        T=t1 [FRAMES=0-89] bash scripts/moves_test_render.sh        (from engine/)
set -e
cd "$(dirname "$0")/.."
T=${T:?set T, e.g. T=t1}; export REMOTION_TMP="C:/Users/sweje/AppData/Local/Temp/remotion-tmp"
BIG=out/mov3d/test-2x-$T.mp4; F=out/mov3d/test-$T.mp4; FR=${FRAMES:+--frames=$FRAMES}
MEM_START=8 MEM_LOG=out/mov3d/test-$T.log bash scripts/mem_guard.sh npx remotion render src/index.ts Moves3D "$BIG" $FR --scale 2 --gl=angle --codec h264 --crf 10 --x264-preset veryfast --concurrency 1 --muted --browser-executable "C:/Program Files/Google/Chrome/Application/chrome.exe" < /dev/null > out/mov3d/test-$T.out 2>&1 || { tail -5 out/mov3d/test-$T.out; exit 1; }
timeout 600 ffmpeg -nostdin -v error -y -i "$BIG" -vf "scale=1080:1920:flags=lanczos:in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p" -c:v libx264 -preset slow -crf 16 -x264-params aq-mode=3 -r 30 -fps_mode cfr -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -movflags +faststart "$F" < /dev/null
rm -f "$BIG"
node scripts/moves_check.mjs > out/mov3d/test-$T-check.txt 2>&1 || true; tail -1 out/mov3d/test-$T-check.txt
python scripts/motion2.py --root out/mov3d/root --out out/mov3d/test-$T-motion2.txt > /dev/null 2>&1 || true; grep -E "^(PASS|FAIL|largest|worst)" out/mov3d/test-$T-motion2.txt | head -5
python scripts/flicker2.py "$F" out/mov3d/regions.jsonl --cams out/mov3d/root --out out/mov3d/test-$T-flicker2.txt > /dev/null 2>&1 || true
grep -E "^largest|^FAIL|^PASS" out/mov3d/test-$T-flicker2.txt; grep -A40 "^FAIL" out/mov3d/test-$T-flicker2.txt | grep "  frame" | cut -c1-140 | head -20

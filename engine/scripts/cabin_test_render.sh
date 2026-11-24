#!/bin/bash
# 3D step 1: a TEST render of the film into out/cab3d (never leverans/), the same steps as cabin_deliver.sh (2x, lanczos down, CRF 16, the mix),
# then the flicker check on it. For finding faults before a version is delivered. One job: nothing else may run beside it.
#   T=t1 bash scripts/cabin_test_render.sh        (from engine/)
set -e
cd "$(dirname "$0")/.."
T=${T:?set T, e.g. T=t1}; export REMOTION_TMP="C:/Users/sweje/AppData/Local/Temp/remotion-tmp"
BIG=out/cab3d/test-2x-$T.mp4; F=out/cab3d/test-$T.mp4
MEM_START=8 MEM_LOG=out/cab3d/test-$T.log bash scripts/mem_guard.sh npx remotion render src/index.ts Cabin3D "$BIG" --scale 2 --gl=angle --codec h264 --crf 10 --x264-preset veryfast --concurrency 1 --muted --browser-executable "C:/Program Files/Google/Chrome/Application/chrome.exe" < /dev/null > out/cab3d/test-$T.out 2>&1 || { tail -5 out/cab3d/test-$T.out; exit 1; }
timeout 600 ffmpeg -nostdin -v error -y -i "$BIG" -i public/craft/cabin3d.wav -map 0:v -map 1:a -vf "scale=1080:1920:flags=lanczos:in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p" -c:v libx264 -preset slow -crf 16 -x264-params aq-mode=3 -r 30 -fps_mode cfr -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a aac -b:a 192k -shortest -movflags +faststart "$F" < /dev/null
rm -f "$BIG"
node scripts/cabin_check.mjs > /dev/null 2>&1 || true
python scripts/flicker.py "$F" out/cab3d/regions.jsonl --out out/cab3d/test-$T-flicker.txt > /dev/null 2>&1 || true
grep -E "^largest|^FAIL|^PASS" out/cab3d/test-$T-flicker.txt; grep -A40 "^FAIL" out/cab3d/test-$T-flicker.txt | grep "  frame" | cut -c1-120

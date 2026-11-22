#!/bin/bash
# Alcatraz 1962, the delivery: the film rendered at twice the size (CRF 10) under mem_guard, one job; scaled down with lanczos to 1080x1920 at
# CRF 16 (aq-mode 3, BT.709 tv range) with the mix muxed in straight from the wav (Remotion's own mp4 began 41 ms late, its first frame silent,
# the independent review of STOPP 1 point 30); the phone copy at CRF 23 (under 29 MB). Old files are never overwritten: V names the version.
#   V=v1 bash scripts/alcatraz_deliver.sh        (from engine/)
set -e
cd "$(dirname "$0")/.."
V=${V:?set V, e.g. V=v1}; OUT=../leverans/alcatraz; mkdir -p "$OUT" out/craft/alcatraz
F="$OUT/three-men-vanished-from-alcatraz-$V.mp4"; P="$OUT/three-men-vanished-from-alcatraz-$V-telefon.mp4"
test ! -e "$F" || { echo "exists: $F (a new V for a new version)"; exit 1; }
export REMOTION_TMP="C:/Users/sweje/AppData/Local/Temp/remotion-tmp"
BIG=out/craft/alcatraz/render-2x-$V.mp4
MEM_START=8 MEM_LOG=out/craft/alcatraz/render-$V.log bash scripts/mem_guard.sh npx remotion render src/index.ts Alcatraz "$BIG" --scale 2 --gl=angle --codec h264 --crf 10 --x264-preset veryfast --concurrency 1 --muted --browser-executable "C:/Program Files/Google/Chrome/Application/chrome.exe" < /dev/null > out/craft/alcatraz/render-$V.out 2>&1 || { tail -5 out/craft/alcatraz/render-$V.out; exit 1; }
timeout 600 ffmpeg -nostdin -v error -y -i "$BIG" -i public/craft/alcatraz.wav -map 0:v -map 1:a -vf "scale=1080:1920:flags=lanczos:in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p" -c:v libx264 -preset slow -crf 16 -x264-params aq-mode=3 -r 30 -fps_mode cfr -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -c:a aac -b:a 192k -shortest -movflags +faststart "$F" < /dev/null
timeout 600 ffmpeg -nostdin -v error -y -i "$F" -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a copy -movflags +faststart "$P" < /dev/null
test $(stat -c %s "$P") -lt 29000000
ls -la "$F" "$P"; echo "processes left: $(tasklist 2>/dev/null | grep -ciE 'chrome-headless|ffmpeg' || true)"

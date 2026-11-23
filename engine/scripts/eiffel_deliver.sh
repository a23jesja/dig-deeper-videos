#!/bin/bash
# The Eiffel Tower film, the delivery: the film rendered at twice the size (CRF 10) under mem_guard, one job; scaled down with lanczos to 1080x1920 at
# CRF 5 (aq-mode 3, BT.709 tv range; the review of v10: DAILY-RULES asks about 12-16 Mbit/s, and these flat drawings gave 2.6 Mbit/s at CRF 16) with the mix muxed in straight from the wav (Remotion's own mp4 began 41 ms late, its first frame silent,
# the independent review of STOPP 1 point 30); the phone copy at CRF 23 (under 29 MB). Old files are never overwritten: V names the version.
#   V=v1 bash scripts/eiffel_deliver.sh        (from engine/)
set -e
cd "$(dirname "$0")/.."
V=${V:?set V, e.g. V=v1}; OUT=../leverans/eiffel; mkdir -p "$OUT" out/craft/eiffel
F="$OUT/who-sold-the-eiffel-tower-in-1925-$V.mp4"; P="$OUT/who-sold-the-eiffel-tower-in-1925-$V-telefon.mp4"
test ! -e "$F" || test -n "$REPLACE_UNSENT" || { echo "exists: $F (a new V for a new version; REPLACE_UNSENT=1 only for a version never sent)"; exit 1; }
export REMOTION_TMP="C:/Users/sweje/AppData/Local/Temp/remotion-tmp"
BIG=out/craft/eiffel/render-2x-$V.mp4
MEM_START=8 MEM_LOG=out/craft/eiffel/render-$V.log bash scripts/mem_guard.sh npx remotion render src/index.ts Eiffel "$BIG" --scale 2 --gl=angle --codec h264 --crf 10 --x264-preset veryfast --concurrency 1 --muted --browser-executable "C:/Program Files/Google/Chrome/Application/chrome.exe" < /dev/null > out/craft/eiffel/render-$V.out 2>&1 || { tail -5 out/craft/eiffel/render-$V.out; exit 1; }
timeout 600 ffmpeg -nostdin -v error -y -i "$BIG" -i public/craft/eiffel.wav -map 0:v -map 1:a -vf "scale=1080:1920:flags=lanczos:in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p" -c:v libx264 -preset slow -crf 5 -x264-params aq-mode=3 -r 30 -fps_mode cfr -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -c:a aac -b:a 192k -shortest -movflags +faststart "$F" < /dev/null
timeout 600 ffmpeg -nostdin -v error -y -i "$F" -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a copy -movflags +faststart "$P" < /dev/null
test $(stat -c %s "$P") -lt 29000000
ls -la "$F" "$P"; echo "processes left: $(tasklist 2>/dev/null | grep -ciE 'chrome-headless|ffmpeg' || true)"

#!/usr/bin/env bash
# One Short rendered for delivery: the film in full quality, a small version under 20 MB, its thumbnail proposals with a small copy
# of each, and the frame-by-frame check with the loudness.   usage: [SUFFIX=-v2] scripts/deliver.sh <film> <Comp> [what=all|film|thumbs|qa]
# SUFFIX names a new version (<film>-v2.mp4, thumbnail-v2-1.png ...), so that the files of the version before are left as they are
set -e
FILM=$1; COMP=$2; WHAT=${3:-all}; OUT=../leverans/$FILM; V=${SUFFIX:-}; mkdir -p "$OUT" out/craft/qa-$FILM
CHROME="C:/Program Files/Google/Chrome/Application/chrome.exe"
if [ "$WHAT" = all ] || [ "$WHAT" = film ]; then
  node scripts/film_info.mjs $FILM check
  node scripts/no_sheets_check.mjs | tail -1
  # (DAILY-RULES, Impossible things 9, flicker, Jesper 2026-11-20): rendered at twice the size (2160 x 3840, the 3D at twice the pixels
  # too) and scaled down, so that thin outlines and fine lines are averaged instead of stepping from frame to frame; then encoded at CRF 17,
  # constant 30 frames a second, yuv420p in the limited (tv) range, BT.709. Before, Remotion's own file was full range (yuvj420p) at
  # about 5 Mbit/s
  BIG=out/craft/qa-$FILM/render-2x$V.mp4
  npx remotion render src/index.ts $COMP "$BIG" --scale 2 --gl=angle --codec h264 --crf 10 --concurrency 2 --browser-executable "$CHROME" < /dev/null 2>&1 | tail -2
  test -s "$BIG"
  # the sound is copied as it is: re-encoding it beside the picture has stalled ffmpeg for hours on this machine; a stall now fails after ten minutes
  timeout 600 ffmpeg -nostdin -v error -y -i "$BIG" -vf "scale=1080:1920:flags=lanczos:in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p"     -c:v libx264 -preset slow -crf 17 -r 30 -fps_mode cfr -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -c:a copy -movflags +faststart "$OUT/$FILM$V.mp4" < /dev/null
  test -s "$OUT/$FILM$V.mp4"
  # the flicker check stops the delivery (exit 1) and names the times
  node scripts/film_info.mjs $FILM regions > out/craft/qa-$FILM/regions.jsonl
  python scripts/flicker.py "$OUT/$FILM$V.mp4" out/craft/qa-$FILM/regions.jsonl --out out/craft/qa-$FILM/flicker$V.txt
  # the phone copy for review is the only low-bitrate file (under 29 MB: the 30 MB send limit); YouTube gets the full one
  timeout 600 ffmpeg -nostdin -v error -y -i "$OUT/$FILM$V.mp4" -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a copy -movflags +faststart "$OUT/$FILM$V-telefon.mp4" < /dev/null
  test $(stat -c %s "$OUT/$FILM$V-telefon.mp4") -lt 29000000
  timeout 300 ffmpeg -nostdin -v error -y -i "$OUT/$FILM$V.mp4" -vf scale=540:960 -c:v libx264 -crf 25 -preset medium -c:a copy "$OUT/$FILM$V-liten.mp4" < /dev/null
  ls -la "$OUT" | grep mp4
fi
if [ "$WHAT" = all ] || [ "$WHAT" = thumbs ]; then
  node scripts/stills.mjs ${COMP}Thumbs out/craft/th_${FILM}_ 0-2 1 png 2>&1 | grep -v "^\s*at " | tail -1
  FILM="$FILM" OUT="$OUT" V="$V" python - <<'PY'
import os
from PIL import Image
film=os.environ['FILM']; out=os.environ['OUT']; v=os.environ.get('V','')
for i in range(3):
    im=Image.open(f'out/craft/th_{film}_{i:04d}.png').convert('RGB'); assert im.size==(1080,1920), im.size      # a Short's thumbnail is upright
    im.save(f'{out}/thumbnail{v}-{i+1}.png'); im.resize((270,480),Image.LANCZOS).save(f'{out}/thumbnail{v}-{i+1}-liten.jpg',quality=90)
print('thumbnails written')
PY
fi
if [ "$WHAT" = all ] || [ "$WHAT" = qa ]; then
  node scripts/film_info.mjs $FILM shots > out/craft/qa-$FILM/shots-list.json
  python -c "import json; s=json.load(open('out/craft/qa-$FILM/shots-list.json')); json.dump({'shots':s}, open('out/craft/qa-$FILM/shots.json','w'))"
  python scripts/short_qa.py "$OUT/$FILM$V.mp4" out/craft/qa-$FILM out/craft/qa-$FILM/shots.json 2>&1 | tail -25
fi

#!/usr/bin/env bash
# One Short rendered for delivery: the film in full quality, a small version under 20 MB, its thumbnail proposals with a small copy
# of each, and the frame-by-frame check with the loudness.   usage: scripts/deliver.sh <film> <Comp> [what=all|film|thumbs|qa]
set -e
FILM=$1; COMP=$2; WHAT=${3:-all}; OUT=../leverans/$FILM; mkdir -p "$OUT" out/craft/qa-$FILM
CHROME="C:/Program Files/Google/Chrome/Application/chrome.exe"
if [ "$WHAT" = all ] || [ "$WHAT" = film ]; then
  node scripts/film_info.mjs $FILM check
  node scripts/no_sheets_check.mjs | tail -1
  npx remotion render src/index.ts $COMP "$OUT/$FILM.mp4" --gl=angle --codec h264 --crf 17 --concurrency 2 --browser-executable "$CHROME" < /dev/null 2>&1 | tail -2
  test -s "$OUT/$FILM.mp4"
  # the sound is copied as it is: re-encoding it beside the picture has stalled ffmpeg for hours on this machine; a stall now fails after five minutes
  timeout 300 ffmpeg -nostdin -v error -y -i "$OUT/$FILM.mp4" -vf scale=540:960 -c:v libx264 -crf 25 -preset medium -c:a copy "$OUT/$FILM-liten.mp4" < /dev/null
  ls -la "$OUT" | grep mp4
fi
if [ "$WHAT" = all ] || [ "$WHAT" = thumbs ]; then
  node scripts/stills.mjs ${COMP}Thumbs out/craft/th_${FILM}_ 0-2 1 png 2>&1 | grep -v "^\s*at " | tail -1
  FILM="$FILM" OUT="$OUT" python - <<'PY'
import os
from PIL import Image
film=os.environ['FILM']; out=os.environ['OUT']
for i in range(3):
    im=Image.open(f'out/craft/th_{film}_{i:04d}.png').convert('RGB'); assert im.size==(1080,1920), im.size      # a Short's thumbnail is upright
    im.save(f'{out}/thumbnail-{i+1}.png'); im.resize((270,480),Image.LANCZOS).save(f'{out}/thumbnail-{i+1}-liten.jpg',quality=90)
print('thumbnails written')
PY
fi
if [ "$WHAT" = all ] || [ "$WHAT" = qa ]; then
  node scripts/film_info.mjs $FILM shots > out/craft/qa-$FILM/shots-list.json
  python -c "import json; s=json.load(open('out/craft/qa-$FILM/shots-list.json')); json.dump({'shots':s}, open('out/craft/qa-$FILM/shots.json','w'))"
  python scripts/short_qa.py "$OUT/$FILM.mp4" out/craft/qa-$FILM out/craft/qa-$FILM/shots.json 2>&1 | tail -25
fi

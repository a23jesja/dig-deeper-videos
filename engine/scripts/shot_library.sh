#!/usr/bin/env bash
# The shot library (THE QUALITY GATE, gate 2): render the ShotLibrary film once without sound, then cut it into one clip per shot type,
# named by its number and type, and list each clip's md5. Never overwrites: a clip that already exists stops the script.
#   usage: [V=-r2] bash scripts/shot_library.sh        (run from engine/; REMOTION_TMP set to a scratch folder)
set -e
OUT=../granskning/kvalitetsport/bildbibliotek; V=${V:-}; mkdir -p "$OUT" out/craft
CHROME="C:/Program Files/Google/Chrome/Application/chrome.exe"
node scripts/film_info.mjs shot-library check
node scripts/film_info.mjs shot-library grips
FULL=out/craft/shot-library$V.mp4
npx remotion render src/index.ts ShotLibrary "$FULL" --gl=angle --codec h264 --crf 17 --concurrency 1 --muted --browser-executable "$CHROME" < /dev/null 2>&1 | tail -2
test -s "$FULL"
# one clip per shot, cut on the shot's own frames (re-encoded, so that each clip starts on a key frame)
i=0; node scripts/film_info.mjs shot-library json | python -c "import json,sys; [print(s['id'], s['a'], s['b']) for s in json.load(sys.stdin)['shots']]" | while read id a b; do
  i=$((i+1)); f="$OUT/$(printf %02d $i)-$id$V.mp4"; if [ -e "$f" ]; then echo "exists, not overwritten: $f"; exit 1; fi
  timeout 300 ffmpeg -nostdin -v error -i "$FULL" -vf "select=between(n\,$a\,$((b-1))),setpts=PTS-STARTPTS" -an -c:v libx264 -crf 17 -preset medium -pix_fmt yuv420p "$f" < /dev/null
  echo "$(md5sum "$f" | cut -d' ' -f1)  $(ffprobe -v error -select_streams v -show_entries stream=width,height,nb_frames -of csv=p=0 "$f")  $f"
done

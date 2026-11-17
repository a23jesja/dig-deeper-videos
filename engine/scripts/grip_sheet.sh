#!/usr/bin/env bash
# The grip sheet: every held prop in a figure's hand, in its use pose and lowered, from the front and from the side, as the engine
# puts it there (the film src/craft/shorts/gripSheet.ts), with a second picture of the hands enlarged. Run the script check first.
# usage: scripts/grip_sheet.sh [out dir = ../granskning/rattningar]
set -e
OUT=${1:-../granskning/rattningar}; mkdir -p "$OUT" out/craft
node scripts/film_info.mjs grip-sheet grips
node scripts/film_info.mjs grip-sheet grips spots > out/craft/grip_spots.json
rm -f out/craft/pk_*.jpg
PROPS='{"audio":false}' node scripts/stills.mjs GripSheet out/craft/pk_ $(node scripts/film_info.mjs grip-sheet stills) 1 jpeg 2>&1 | grep -v "^\s*at " | tail -1
python scripts/grip_sheet.py sheet out/craft/grip_spots.json out/craft/pk_ "$OUT/grepp.jpg" "$OUT/grepp-nara.jpg"

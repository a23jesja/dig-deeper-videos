#!/usr/bin/env bash
# A grip sheet: every held prop in a figure's hand, as the engine puts it there (the films in src/craft/shorts/gripSheet.ts), with a
# second picture of the hands enlarged. The script check runs first and stops the sheet if it fails.
# usage: scripts/grip_sheet.sh [film = grip-sheet] [composition = GripSheet] [out dir = ../granskning/rattningar] [name = grepp] [title]
set -e
FILM=${1:-grip-sheet}; COMP=${2:-GripSheet}; OUT=${3:-../granskning/rattningar}; NAME=${4:-grepp}
TITLE=${5:-"GREPPBLAD: kikare, pistol, sabel och mugg i användarpose och sänkt läge, framifrån och från sidan (ur motorn, full storlek)"}
mkdir -p "$OUT" out/craft
node scripts/film_info.mjs "$FILM" grips
node scripts/film_info.mjs "$FILM" grips spots > out/craft/grip_spots.json
rm -f out/craft/pk_*.jpg
PROPS='{"audio":false}' node scripts/stills.mjs "$COMP" out/craft/pk_ $(node scripts/film_info.mjs "$FILM" stills) 1 jpeg 2>&1 | grep -v "^\s*at " | tail -1
python scripts/grip_sheet.py sheet out/craft/grip_spots.json out/craft/pk_ "$OUT/$NAME.jpg" "$OUT/$NAME-nara.jpg" "$TITLE"

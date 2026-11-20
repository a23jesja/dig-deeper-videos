#!/usr/bin/env bash
# Joins the parts of a double-size render (render_part.sh) and their sound into one file, without encoding the picture again.
#   usage: scripts/render_join.sh <dir> <N parts> <out.mp4>
set -e
DIR=$1; N=$2; OUTF=$3
: > "$DIR/list.txt"; for i in $(seq 1 $N); do echo "file 'part$i.mp4'" >> "$DIR/list.txt"; done
timeout 600 ffmpeg -nostdin -v error -y -f concat -safe 0 -i "$DIR/list.txt" -i "$DIR/sound.aac" -map 0:v -map 1:a -c copy -shortest "$OUTF" < /dev/null
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames,width,height -of default=nw=1 "$OUTF"

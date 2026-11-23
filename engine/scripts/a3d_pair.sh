#!/bin/sh
# A before/after sheet: the same frames from two films, the old one on top, the new one under it, each frame 360 px wide.
#   sh scripts/a3d_pair.sh <old.mp4> <new.mp4> <out.jpg> <frame> [<frame> ...]
set -e
OLD=$1; NEW=$2; OUT=$3; shift 3
T=$(mktemp -d); i=0
for f in "$@"; do
  ffmpeg -nostdin -v error -y -i "$OLD" -vf "select=eq(n\,$f),scale=360:-1,drawtext=text='$f':x=8:y=8:fontsize=28:fontcolor=white:box=1:boxcolor=black@0.6" -frames:v 1 "$T/o$i.png"
  ffmpeg -nostdin -v error -y -i "$NEW" -vf "select=eq(n\,$f),scale=360:-1" -frames:v 1 "$T/n$i.png"
  i=$((i + 1))
done
ins=""; k=0; while [ $k -lt $i ]; do ins="$ins -i $T/o$k.png"; k=$((k + 1)); done
k=0; while [ $k -lt $i ]; do ins="$ins -i $T/n$k.png"; k=$((k + 1)); done
ffmpeg -nostdin -v error -y $ins -filter_complex "xstack=inputs=$((2 * i)):grid=${i}x2" "$OUT"
rm -rf "$T"; echo "$OUT"

#!/usr/bin/env bash
# One part of a double-size render, for a machine short of memory (20 Nov: a whole double-size render was stopped twice for memory). The
# film is rendered in parts of whole frames, each its own short command in the foreground, then joined (render_join.sh). The sound is
# rendered once on its own, so the joins have no seam in it.
#   usage: scripts/render_part.sh <Comp> <dir> <part 1..N> <N parts> <frames in the film>     (part "audio" renders the sound alone)
# Each part runs under mem_guard.sh (started with MEM_START GB free, default 6; stopped by itself under 2 GB, naming the frame), and
# afterwards it lists any Remotion, ffmpeg or headless Chrome process left from it (there must be none).
set -e
COMP=$1; DIR=$2; I=$3; N=$4; FR=$5; mkdir -p "$DIR"
CHROME="C:/Program Files/Google/Chrome/Application/chrome.exe"
export REMOTION_TMP="${REMOTION_TMP:-$LOCALAPPDATA/Temp/remotion-tmp}"
if [ "$I" = audio ]; then
  OUTF="$DIR/sound.aac"; LOG="$DIR/sound.log"; rm -f "$OUTF"
  MEM_START=${MEM_START:-6} MEM_LOG="$LOG" bash scripts/mem_guard.sh npx remotion render src/index.ts $COMP "$OUTF" --codec aac --concurrency 1 --browser-executable "$CHROME" < /dev/null > "$LOG" 2>&1 || { grep -E "mem_guard|rror" "$LOG" | tail -5; exit 1; }
else
  A=$(( (I - 1) * FR / N )); B=$(( I * FR / N - 1 )); OUTF="$DIR/part$I.mp4"; LOG="$DIR/part$I.log"; rm -f "$OUTF"
  echo "part $I of $N: frames $A-$B"
  MEM_START=${MEM_START:-6} MEM_LOG="$LOG" bash scripts/mem_guard.sh npx remotion render src/index.ts $COMP "$OUTF" --frames=$A-$B --muted --scale 2 --gl=angle --codec h264 --crf 10 --x264-preset veryfast --concurrency 1 --browser-executable "$CHROME" < /dev/null > "$LOG" 2>&1 || { grep -E "mem_guard|rror" "$LOG" | tail -5; exit 1; }
  test "$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$OUTF")" = "$(( B - A + 1 ))"
fi
grep mem_guard "$LOG"; ls -la "$OUTF" | awk '{print $5, $NF}'
sleep 2
powershell -NoProfile -Command "\$p = Get-CimInstance Win32_Process | Where-Object { \$_.Name -notin 'powershell.exe','bash.exe' -and (\$_.CommandLine -match 'remotion|compositor') -or (\$_.Name -eq 'chrome.exe' -and \$_.CommandLine -match 'headless|remotion') }; 'left from this part: ' + (\$p | Measure-Object).Count; \$p | ForEach-Object { '  ' + \$_.ProcessId + ' ' + \$_.Name }; 'free GB: ' + [math]::Round((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory/1MB, 1)"

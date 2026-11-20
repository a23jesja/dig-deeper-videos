#!/usr/bin/env bash
# Runs a long command (a render) only when the machine has memory for it, and stops it itself before the machine runs out (20 Nov: a
# double-size render was killed by Claude Code at 3 GB free and left its ffmpeg holding 3.2 GB).
#   usage: scripts/mem_guard.sh <command> [args...]
#   MEM_START (GB, default 8): wait until this much is free before starting (up to MEM_WAIT minutes, default 10, then give up)
#   MEM_STOP  (GB, default 2): stop the command and everything it started when less than this is free
START=${MEM_START:-8}; STOP=${MEM_STOP:-2}; WAITN=$(( ${MEM_WAIT:-10} * 6 ))
free_gb() { powershell -NoProfile -Command "[math]::Round((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory/1MB, 1)" | tr -d '\r' | tr ',' '.'; }
for i in $(seq 1 $WAITN); do f=$(free_gb); awk -v f="$f" -v s="$START" 'BEGIN{exit !(f>=s)}' && break
  [ "$i" = "$WAITN" ] && { echo "mem_guard: only $f GB free after ${MEM_WAIT:-10} minutes (needs $START): not started"; exit 3; }
  [ $(( i % 30 )) = 1 ] && echo "mem_guard: $f GB free, waiting for $START"; sleep 10; done
echo "mem_guard: $(free_gb) GB free, starting"
"$@" & PID=$!; WPID=$(cat /proc/$PID/winpid 2>/dev/null); low=""
while kill -0 $PID 2>/dev/null; do f=$(free_gb)
  if awk -v f="$f" -v s="$STOP" 'BEGIN{exit !(f<s)}'; then echo "mem_guard: only $f GB free (under $STOP): stopping the command and all it started"; low=1
    [ -n "$WPID" ] && taskkill //PID $WPID //T //F > /dev/null 2>&1; kill $PID 2>/dev/null; break; fi
  sleep 5; done
wait $PID; rc=$?; [ -n "$low" ] && exit 4; exit $rc

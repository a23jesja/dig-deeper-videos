#!/bin/bash
# George for Alcatraz: each line three takes, capped at its own characters x 3 (the approved pre-count: 1 485, at most 1 980 in all)
cd /c/Users/sweje/dig-deeper-videos/engine
python -c "import json; [print(l) for l in json.load(open('voice/alcatraz/lines.json'))]" | { i=0; while IFS= read -r line; do i=$((i+1)); d=$(printf 'voice/alcatraz/s%02d' $i); n=${#line}; echo "== $d ($n)"; python voice/el_line.py "$d" "$line" $((n*3)) || { echo "STOPPED at $d"; exit 1; }; done; }

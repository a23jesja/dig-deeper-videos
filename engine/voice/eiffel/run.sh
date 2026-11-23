#!/bin/bash
# The Eiffel Tower (v4c, approved 23 Nov): George's 19 lines and Daniel's one, three takes each, each capped at its own characters x 3.
# Opening (c)'s "It was never his." uses the take of line 2 (the same words). Approved in all: at most 2 428 characters.
cd /c/Users/sweje/dig-deeper-videos/engine
python -c "import json; [print(l) for l in json.load(open('voice/eiffel/lines.json', encoding='utf-8'))]" | { i=0; while IFS= read -r line; do i=$((i+1)); d=$(printf 'voice/eiffel/g%02d' $i); n=${#line}; echo "== $d ($n)"; python voice/el_line.py "$d" "$line" $((n*3)) || { echo "STOPPED at $d"; exit 1; }; done; }
echo "== voice/eiffel/d01 (15)"; VOICE_FILE=partner.json python voice/el_line.py voice/eiffel/d01 "Do you deliver?" 45 || echo "STOPPED at d01"

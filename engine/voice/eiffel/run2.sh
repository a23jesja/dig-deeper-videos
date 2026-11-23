#!/bin/bash
# The rest after a 429 on the counter read (23 Nov): line 15 and Daniel's takes are there, so they are only picked; lines 16-19 are recorded,
# with a pause between lines. Each still capped at its own characters x 3.
cd /c/Users/sweje/dig-deeper-videos/engine
python voice/el_line.py --pick-only voice/eiffel/g15 "Or so the story goes." 3188
VOICE_FILE=partner.json python voice/el_line.py --pick-only voice/eiffel/d01 "Do you deliver?" 3409
for i in 16 17 18 19; do python -c "import time; time.sleep(8)"; line=$(python -c "import json,sys; sys.stdout.write(json.load(open('voice/eiffel/lines.json', encoding='utf-8'))[$i-1])"); n=${#line}; echo "== voice/eiffel/g$i ($n)"; python voice/el_line.py "voice/eiffel/g$i" "$line" $((n*3)) || { echo "STOPPED at g$i"; exit 1; }; done

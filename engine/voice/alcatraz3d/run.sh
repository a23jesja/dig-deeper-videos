#!/bin/bash
# Daniel (voice/partner.json) for the guard in Alcatraz in the new style: two [OWN] lines, three takes each, capped at characters x 3
# (the approved pre-count: at most 200 characters in all, 22 Nov 2026). The key from the environment variable only.
cd /c/Users/sweje/dig-deeper-videos/engine
export VOICE_FILE=partner.json
python voice/el_line.py voice/alcatraz3d/g01 "Goodnight, sunshine." 60 || exit 1
python voice/el_line.py voice/alcatraz3d/g02 "Rise and shine, sunshine." 75 || exit 1

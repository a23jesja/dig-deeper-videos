#!/usr/bin/env bash
# One still per shot of a Short (the sketch frames), tiled as a contact sheet.   usage: scripts/film_sheet.sh <film> <Comp> [scale=0.5] [frames]
set -e
FILM=$1; COMP=$2; SC=${3:-0.5}; F=${4:-$(node scripts/film_info.mjs $FILM stills)}
PROPS='{"audio":false}' node scripts/stills.mjs $COMP out/craft/${FILM}_ $F $SC jpeg 2>&1 | grep -v "^\s*at " | tail -1
F="$F" FILM="$FILM" python - <<'PY'
import os
from PIL import Image
fr=[int(x) for x in os.environ['F'].split(',')]; film=os.environ['FILM']
ims=[Image.open(f'out/craft/{film}_{n:04d}.jpg') for n in fr]
w,h=ims[0].size; cols=min(6,len(ims)); rows=(len(ims)+cols-1)//cols; k=min(1.0, 324/w); w2,h2=int(w*k),int(h*k)
s=Image.new('RGB',(w2*cols,h2*rows),'white')
for i,im in enumerate(ims): s.paste(im.resize((w2,h2)),((i%cols)*w2,(i//cols)*h2))
s.save(f'out/craft/{film}_sheet.jpg',quality=85); print(s.size)
PY

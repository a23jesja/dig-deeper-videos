#!/usr/bin/env bash
# A quick look at chosen frames of a film while staging it: the frames side by side in one picture, with captions, no sound.
# usage: scripts/peek.sh <Comp> <frames, comma list> [scale=0.4] [out=out/craft/peek.jpg]
set -e
COMP=$1; F=$2; SC=${3:-0.4}; OUT=${4:-out/craft/peek.jpg}
rm -f out/craft/pk_*.jpg
PROPS='{"audio":false}' node scripts/stills.mjs $COMP out/craft/pk_ $F $SC jpeg 2>&1 | grep -v "^\s*at " | tail -1
F="$F" OUT="$OUT" python - <<'PY'
import os
from PIL import Image, ImageDraw
fr=[int(x) for x in os.environ['F'].split(',')]; ims=[Image.open(f'out/craft/pk_{n:04d}.jpg') for n in fr]; w,h=ims[0].size; cols=min(6,len(ims)); rows=(len(ims)+cols-1)//cols
s=Image.new('RGB',(w*cols,h*rows),'white'); d=ImageDraw.Draw(s)
for i,(n,im) in enumerate(zip(fr,ims)): x,y=(i%cols)*w,(i//cols)*h; s.paste(im,(x,y)); d.rectangle([x,y,x+70,y+16],fill='black'); d.text((x+4,y+2),f'{n} {n/30:.2f}s',fill='white')
s.save(os.environ['OUT'],quality=90); print(os.environ['OUT'], s.size)
PY

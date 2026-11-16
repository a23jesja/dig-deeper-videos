#!/usr/bin/env bash
# The own review of a Short before it is sent: two frames a second of the whole film, tiled on sheets with the frame number on each
# picture, to be read against "Staging checks", "Action, not portraits" and "The world look".   usage: scripts/two_fps.sh <film> <Comp> [scale=0.3] [per sheet=18]
set -e
FILM=$1; COMP=$2; SC=${3:-0.3}; PER=${4:-18}
N=$(node scripts/film_info.mjs $FILM json | python -c "import json,sys; print(json.load(sys.stdin)['frames'])")
F=$(python -c "print(','.join(str(i) for i in range(0, $N, 15)))")
PROPS='{"audio":false}' node scripts/stills.mjs $COMP out/craft/tf_${FILM}_ $F $SC jpeg 2>&1 | grep -v "^\s*at " | tail -1
F="$F" FILM="$FILM" PER="$PER" python - <<'PY'
import os
from PIL import Image, ImageDraw
fr=[int(x) for x in os.environ['F'].split(',')]; film=os.environ['FILM']; per=int(os.environ['PER'])
for k in range(0, len(fr), per):
    part=fr[k:k+per]; ims=[Image.open(f'out/craft/tf_{film}_{n:04d}.jpg') for n in part]; w,h=ims[0].size; cols=min(9,len(ims)); rows=(len(ims)+cols-1)//cols
    s=Image.new('RGB',(w*cols,h*rows),'white'); d=ImageDraw.Draw(s)
    for i,(n,im) in enumerate(zip(part,ims)): x,y=(i%cols)*w,(i//cols)*h; s.paste(im,(x,y)); d.rectangle([x,y,x+58,y+18],fill='black'); d.text((x+4,y+3),f'{n} {n/30:.1f}s',fill='white')
    s.save(f'out/craft/tf_{film}_sheet{k//per+1}.jpg',quality=85); print(f'out/craft/tf_{film}_sheet{k//per+1}.jpg', s.size)
PY

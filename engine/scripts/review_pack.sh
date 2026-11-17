#!/usr/bin/env bash
# What the review session gets with a finished Short: sheets cut from the delivered film itself (two frames a second, at phone size
# on one sheet and larger on several, the frame number on each picture), the frame check's report and the sound levels.
# usage: scripts/review_pack.sh <film>     writes ../granskning/<film>/fardig/
set -e
FILM=$1; V=../leverans/$FILM/$FILM.mp4; OUT=../granskning/$FILM/fardig; mkdir -p "$OUT"; rm -f "$OUT"/stor-*.jpg out/craft/rp_${FILM}_f*.jpg
test -s "$V"
timeout 300 ffmpeg -nostdin -v error -y -i "$V" -an -vf "fps=2,scale=540:960" -q:v 3 "out/craft/rp_${FILM}_f%03d.jpg" < /dev/null
FILM="$FILM" OUT="$OUT" python - <<'PY'
import os, glob, shutil
from PIL import Image, ImageDraw
film=os.environ['FILM']; out=os.environ['OUT']; fs=sorted(glob.glob(f'out/craft/rp_{film}_f*.jpg')); ims=[Image.open(f) for f in fs]
def sheet(part, k0, w, h, cols):
    rows=(len(part)+cols-1)//cols; s=Image.new('RGB',(w*cols,h*rows),'white'); d=ImageDraw.Draw(s)
    for i,im in enumerate(part):
        x,y=(i%cols)*w,(i//cols)*h; s.paste(im.resize((w,h),Image.LANCZOS),(x,y)); n=(k0+i)*15; d.rectangle([x,y,x+64,y+15],fill='black'); d.text((x+3,y+2),f'{n} {n/30:.1f}s',fill='white')
    return s
sheet(ims,0,270,480,10).save(f'{out}/kontaktkarta-mobil.jpg',quality=88)
for k in range(0,len(ims),10): sheet(ims[k:k+10],k,432,768,5).save(f'{out}/stor-{k//10+1}.jpg',quality=90)
for a,b in [(f'out/craft/qa-{film}/report.md','kontroll.md'),(f'out/craft/{film}-audio.json','ljud.json')]:
    if os.path.exists(a): shutil.copy(a,f'{out}/{b}')
for f in fs: os.remove(f)
print(len(ims),'frames;',sorted(os.listdir(out)))
PY

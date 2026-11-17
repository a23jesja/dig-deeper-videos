#!/usr/bin/env bash
# Review sheets cut from a rendered film (what the viewer gets, captions and all): two frames a second, the frame number on each.
# usage: scripts/mp4_sheets.sh <file.mp4> <out prefix> [width=360] [cols=5] [rows=2]
set -e
V=$1; P=$2; W=${3:-360}; C=${4:-5}; R=${5:-2}
rm -f ${P}_f*.jpg ${P}_sheet*.jpg
ffmpeg -nostdin -v error -y -i "$V" -vf "fps=2,scale=$W:-2" -q:v 3 "${P}_f%03d.jpg" < /dev/null
P="$P" C="$C" R="$R" python - <<'PY'
import os, glob
from PIL import Image, ImageDraw
p=os.environ['P']; c=int(os.environ['C']); r=int(os.environ['R']); fs=sorted(glob.glob(p+'_f*.jpg')); per=c*r
for k in range(0,len(fs),per):
    ims=[Image.open(f) for f in fs[k:k+per]]; w,h=ims[0].size; s=Image.new('RGB',(w*c,h*r),'white'); d=ImageDraw.Draw(s)
    for i,im in enumerate(ims):
        x,y=(i%c)*w,(i//c)*h; s.paste(im,(x,y)); n=(k+i)*15; d.rectangle([x,y,x+70,y+16],fill='black'); d.text((x+4,y+2),f'{n} {n/30:.1f}s',fill='white')
    s.save(f'{p}_sheet{k//per+1}.jpg',quality=88); print(f'{p}_sheet{k//per+1}.jpg', s.size)
for f in fs: os.remove(f)
PY

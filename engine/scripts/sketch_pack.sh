#!/usr/bin/env bash
# The sketch package of a Short for review: one full-size still per shot, a phone-size contact sheet, a clip of the stills held for
# each shot's length under the voice, and the voice with its timings.   usage: scripts/sketch_pack.sh <film> <Comp>
set -e
FILM=$1; COMP=$2; OUT=../granskning/$FILM/skiss; mkdir -p "$OUT"
F=$(node scripts/film_info.mjs $FILM stills)
PROPS='{"audio":false}' node scripts/stills.mjs $COMP out/craft/sk_${FILM}_ $F 1 jpeg 2>&1 | grep -v "^\s*at " | tail -1
node scripts/film_info.mjs $FILM json > out/craft/$FILM-info.json
FILM="$FILM" OUT="$OUT" python - <<'PY'
import json, subprocess, os, shutil, glob
from PIL import Image
film=os.environ['FILM']; out=os.environ['OUT']
info=json.load(open(f'out/craft/{film}-info.json'))
for f in glob.glob(out+'/bild-*.jpg'): os.remove(f)
ims=[]
for i,s in enumerate(info['shots']):
    src=f"out/craft/sk_{film}_{s['still']:04d}.jpg"; shutil.copy(src,f"{out}/bild-{i+1:02d}-{s['id']}.jpg"); ims.append(Image.open(src))
cols=min(8,(len(ims)+1)//2); rows=(len(ims)+cols-1)//cols
sheet=Image.new('RGB',(270*cols,480*rows),'white')
for i,im in enumerate(ims): sheet.paste(im.resize((270,480),Image.LANCZOS),((i%cols)*270,(i//cols)*480))
sheet.save(f'{out}/kontaktkarta-mobil.jpg',quality=88)
lst=open(f'out/craft/sk_{film}_concat.txt','w')
for s in info['shots']: lst.write(f"file 'sk_{film}_{s['still']:04d}.jpg'\nduration {(s['b']-s['a'])/info['fps']:.4f}\n")
lst.write(f"file 'sk_{film}_{info['shots'][-1]['still']:04d}.jpg'\n"); lst.close()
subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',f'out/craft/sk_{film}_concat.txt','-i',f'voice/{film}/voice.wav','-vf','scale=540:960,fps=30','-c:v','libx264','-crf','23','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-shortest',f'{out}/skiss.mp4'],check=True)
shutil.copy(f'voice/{film}/voice.wav',f'{out}/rost.wav'); shutil.copy(f'voice/{film}/lines.json',f'{out}/radtider.json'); shutil.copy(f'voice/{film}/words.json',f'{out}/ordtider.json')
print(sheet.size, len(ims), 'stills')
PY

# assembles out/style/s_0000..0006.png into the character sheet and a small check image
from PIL import Image, ImageDraw, ImageFont
d='out/style/'
W,H=1920,2160
sheet=Image.new('RGB',(W,H),(20,14,12))
sheet.paste(Image.open(d+'s_0000.png').convert('RGB'),(0,0))
f=ImageFont.truetype('arialbd.ttf',34)
dr=ImageDraw.Draw(sheet)
def lab(x,y,t):
    w=dr.textlength(t,font=f); dr.rectangle((x-w/2-12,y-4,x+w/2+12,y+44),fill=(20,14,12)); dr.text((x-w/2,y),t,font=f,fill=(255,255,255))
for x,t in zip([330,760,1220,1660],['Vakten framifrån','Vakten från sidan','Sir Digsworth framifrån','Sir Digsworth från sidan']): lab(x,1020,t)
names=['Vakten: neutral','Vakten: chock','Vakten: misstänksam','Sir: neutral','Sir: förtjust','Sir: misstänksam']
for i in range(6):
    im=Image.open(d+'s_%04d.png'%(i+1)).convert('RGB')
    c=im.crop((480,135,1440,945)).resize((640,540),Image.LANCZOS)
    x,y=(i%3)*640,1080+(i//3)*540
    sheet.paste(c,(x,y)); lab(x+320,y+490,names[i])
sheet.save(d+'figurblad-v3.png')
sheet.resize((960,1080),Image.LANCZOS).save(d+'check.jpg',quality=85)

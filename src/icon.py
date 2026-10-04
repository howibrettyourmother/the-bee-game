# Home Screen / favicon icons: a cute cartoon bee (with a stinger!) on a sky + honeycomb background. Run: python3 src/icon.py
from PIL import Image, ImageDraw
import os, math
D=os.path.dirname(os.path.abspath(__file__));OUT=os.path.join(D,'..');S=1024
def master(pad=0.0):
    im=Image.new('RGB',(S,S));d=ImageDraw.Draw(im)
    for y in range(S):
        t=y/S;c0=(120,205,255);c1=(255,214,90)
        d.line([(0,y),(S,y)],fill=tuple(int(c0[i]+(c1[i]-c0[i])*t*t) for i in range(3)))
    # honeycomb hexes along the bottom
    r=70
    for row in range(3):
        for col in range(-1,9):
            cx=col*r*1.75+(row%2)*r*0.87;cy=S-40-row*r*1.5
            pts=[(cx+r*math.cos(math.pi/6+i*math.pi/3),cy+r*math.sin(math.pi/6+i*math.pi/3)) for i in range(6)]
            d.polygon(pts,fill=(255,193,40),outline=(214,140,0),width=10)
    k=1-pad
    P=lambda x,y:(S/2+(x-S/2)*k,S/2+(y-S/2)*k)
    def E(x0,y0,x1,y1,**kw):d.ellipse([P(x0,y0),P(x1,y1)],**kw)
    def Pg(pts,**kw):d.polygon([P(*p) for p in pts],**kw)
    def Ln(pts,w,**kw):d.line([P(*p) for p in pts],width=int(w*k),**kw)
    OUTC=(59,42,20)
    # wings
    E(330,170,560,430,fill=(235,248,255),outline=(150,200,230),width=int(12*k))
    E(500,150,700,390,fill=(220,242,255),outline=(150,200,230),width=int(12*k))
    # stinger
    Pg([(215,560),(95,610),(215,650)],fill=OUTC)
    # body with stripes
    body=Image.new('L',(S,S),0);bd=ImageDraw.Draw(body);bd.ellipse([P(200,380),P(720,800)],fill=255)
    stripes=Image.new('RGB',(S,S),(255,210,63));sd=ImageDraw.Draw(stripes)
    for x0 in (330,480):sd.rectangle([P(x0,300),P(x0+80,900)],fill=(43,33,24))
    im.paste(stripes,(0,0),body)
    E(200,380,720,800,outline=OUTC,width=int(18*k))
    # head
    E(560,300,880,620,fill=(255,210,63),outline=OUTC,width=int(18*k))
    E(700,360,800,470,fill='white');E(735,385,795,450,fill=(27,27,27));E(765,395,785,415,fill='white')
    E(640,500,700,535,fill=(255,140,140))
    d.arc([P(700,450),P(820,560)],start=20,end=150,fill=OUTC,width=int(14*k))
    # antennae
    Ln([(650,320),(610,220),(560,200)],14,fill=OUTC,joint='curve');E(530,170,590,230,fill=(43,33,24))
    Ln([(760,310),(800,210),(850,190)],14,fill=OUTC,joint='curve');E(825,160,885,220,fill=(43,33,24))
    # little red cap
    d.chord([P(590,250),P(850,500)],start=180,end=360,fill=(229,57,53))
    d.rectangle([P(720,360),P(905,385)],fill=(229,57,53))
    return im
m=master()
for n,sz in [('apple-touch-icon.png',180),('icon-512.png',512),('icon-192.png',192),('favicon-32.png',32)]:m.resize((sz,sz),Image.LANCZOS).save(os.path.join(OUT,n),optimize=True)
master(pad=0.2).resize((512,512),Image.LANCZOS).save(os.path.join(OUT,'icon-maskable-512.png'),optimize=True)
print('icons written')

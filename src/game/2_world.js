// ================= levels + Michigan backdrops (pre-rendered parallax tiles) =================
const LEVELS=[
 {n:'Meadow Brook Elementary',sub:'School day buzz!',icon:'🏫',speed:116,len:58,int:1.75,gap:250,pool:{posts:3,ball:2,flyer:2,wasp:3,honey:2},boss:'swatter',bossN:'MISTER SWATTER',theme:'school',
  sky:['#5fb8ff','#cdeeff'],ground:'#5cc85a',ground2:'#4fb04d',path:'#d9d4c7',fog:'rgba(205,238,255,0.5)'},
 {n:'Rochester Hills',sub:'Parks & the Paint Creek Trail',icon:'🌳',speed:128,len:60,int:1.6,gap:236,pool:{posts:3,ball:2,flyer:2,wasp:2,mosq:2,honey:2},boss:'skunk',bossN:'STINKY THE SKUNK',theme:'suburb',
  sky:['#6ec2f5','#e6f7e0'],ground:'#62c25a',ground2:'#55ad4e',path:'#cdb48a',fog:'rgba(230,247,224,0.45)'},
 {n:'Detroit',sub:'Riverfront & the RenCen',icon:'🏙️',speed:140,len:62,int:1.45,gap:224,pool:{posts:3,ball:1,flyer:3,wasp:2,mosq:2,beetle:1,honey:2},boss:'robo',bossN:'ROBO-HORNET 3000',theme:'city',
  sky:['#ff9a62','#ffe0a8'],ground:'#a9a39b',ground2:'#9a948c',path:'#b5654c',fog:'rgba(255,214,170,0.4)'},
 {n:'Mackinac Island',sub:'Fudge, horses & the Bridge',icon:'🐴',speed:148,len:64,int:1.38,gap:214,pool:{posts:3,ball:2,flyer:3,wasp:2,mosq:1,beetle:1,honey:2},boss:'gulls',bossN:'THE SEAGULL GANG',theme:'island',
  sky:['#4fb6ff','#d4f3ff'],ground:'#e2c99a',ground2:'#d6bb88',path:'#6cc067',fog:'rgba(212,243,255,0.45)'},
 {n:'Tahquamenon Falls',sub:'Up North in the U.P.',icon:'🌲',speed:156,len:66,int:1.32,gap:206,pool:{posts:3,ball:2,flyer:3,wasp:2,mosq:2,beetle:2,honey:2},boss:'bear',bossN:'KING BEAR',theme:'falls',
  sky:['#7fc3e8','#e9f4e6'],ground:'#4f8a3c',ground2:'#467d35',path:'#7a5a3a',fog:'rgba(233,244,230,0.45)'}];
// ---------- art helpers (draw into whatever X currently is) ----------
function tree(x,y,s,c1,c2){X.fillStyle='#7a5230';X.fillRect(x-4*s,y-30*s,8*s,30*s);circ(x,y-44*s,22*s,c1);circ(x-14*s,y-34*s,15*s,c1);circ(x+14*s,y-34*s,15*s,c1);circ(x-6*s,y-52*s,10*s,c2)}
function pine(x,y,s,c){X.fillStyle='#5b3b22';X.fillRect(x-3*s,y-14*s,6*s,14*s);for(let i=0;i<3;i++)poly([x,y-(70-i*18)*s,x-(18+i*7)*s,y-(30-i*12)*s-12*s,x+(18+i*7)*s,y-(30-i*12)*s-12*s],c)}
function hills(w,h,y0,amp,k,c,ph){X.beginPath();X.moveTo(0,h);for(let x=0;x<=w;x+=8)X.lineTo(x,y0-amp*(0.6*Math.sin(TAU*k*x/w+ph)+0.4*Math.sin(TAU*(k*2+1)*x/w+ph*2)));X.lineTo(w,h);X.closePath();X.fillStyle=c;X.fill()}
function usFlag(x,y,w,h){X.fillStyle='#fff';X.fillRect(x,y,w,h);for(let i=0;i<7;i++){X.fillStyle='#d32f2f';X.fillRect(x,y+i*2*h/13,w,h/13)}X.fillStyle='#283593';X.fillRect(x,y,w*0.42,h*7/13);for(let i=0;i<3;i++)for(let j=0;j<4;j++)circ(x+4+j*w*0.1,y+4+i*h*0.17,1.3,'#fff')}
function winds(x,y,cols,rows,w,h,gx,gy,c,fr){for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const wx=x+i*(w+gx),wy=y+j*(h+gy);if(fr){X.fillStyle=fr;X.fillRect(wx-2,wy-2,w+4,h+4)}X.fillStyle=c;X.fillRect(wx,wy,w,h)}}
function house(x,y,w,h,body,roof){X.fillStyle=body;X.fillRect(x,y-h,w,h);poly([x-10,y-h,x+w/2,y-h-h*0.55,x+w+10,y-h],roof);X.fillStyle='#fff';X.fillRect(x-4,y-h,w+8,4);
  winds(x+12,y-h+14,3,2,18,16,(w-24-54)/2,14,'#a8dcff','#fff');X.fillStyle='#8d4b2b';X.fillRect(x+w/2-9,y-30,18,30);circ(x+w/2+5,y-15,1.5,'#ffd54f');X.fillStyle='#fff';X.fillRect(x+w/2-14,y-34,28,4)}
// ---------- per-level layers: far (parallax .18) and mid (parallax .45), both tiles that repeat seamlessly ----------
function farArt(th,w,h){
  if(th==='school'){hills(w,h,h-70,26,2,'#a5e38c',0.5);for(let i=0;i<14;i++){const x=(i+0.5)*w/14;tree(x,h-62+12*Math.sin(i*2.1),0.8,'#8fd47b','#a9e494')}hills(w,h,h-30,14,3,'#8fd47b',1.4)}
  else if(th==='suburb'){hills(w,h,h-90,30,2,'#8fcf7f',1);for(let i=0;i<22;i++){const x=(i+0.5)*w/22;tree(x,h-70+14*Math.sin(i*1.7),0.9+0.2*Math.sin(i),'#6fbf68','#86cf7c')}hills(w,h,h-34,12,4,'#7fc874',2)}
  else if(th==='city'){// downtown skyline + the Renaissance Center
    const B=[[30,120,70],[110,180,56],[175,140,80],[265,210,62],[335,165,70],[700,190,64],[775,130,90],[875,230,60],[945,160,74],[1030,200,58],[1100,120,80]];
    for(const [bx,bh,bw] of B){if(bx+bw>w-10)continue;X.fillStyle='#7c6f9a';X.fillRect(bx,h-bh,bw,bh);for(let yy=h-bh+10;yy<h-10;yy+=16)for(let xx=bx+8;xx<bx+bw-8;xx+=14){X.fillStyle=((xx*7+yy*3)%5)?'#f6d68a':'#9b8fbd';X.fillRect(xx,yy,6,8)}}
    // Guardian-style stepped tower
    X.fillStyle='#d9774a';X.fillRect(225,h-250,40,250);X.fillRect(232,h-272,26,24);poly([238,h-272,245,h-296,252,h-272],'#d9774a');
    // RenCen: tall middle cylinder + 4 shorter towers (cartoon)
    const rc=(cx,top,rw,c,band)=>{X.fillStyle=c;X.fillRect(cx-rw/2,h-top,rw,top);ell(cx,h-top,rw/2,6,c);for(let yy=h-top+14;yy<h-6;yy+=12){X.fillStyle=band;X.fillRect(cx-rw/2,yy,rw,3)}X.fillStyle='rgba(255,255,255,0.25)';X.fillRect(cx-rw/2+5,h-top,6,top)};
    rc(470,215,46,'#5e7fa6','#7fa0c4');rc(630,215,46,'#5e7fa6','#7fa0c4');rc(500,235,48,'#6c8db3','#8fb0d2');rc(600,235,48,'#6c8db3','#8fb0d2');
    rc(550,320,70,'#7b9dc2','#a2c1e0');X.fillStyle='#4e6a8c';X.fillRect(520,h-330,60,12);X.fillStyle='#e53935';X.fillRect(548,h-345,4,16);
    X.fillStyle='#6a5d8a';X.fillRect(0,h-26,w,26)}
  else if(th==='island'){// Lake Huron + the Mackinac Bridge in the distance
    X.fillStyle='#3d9be0';X.fillRect(0,h-70,w,70);X.fillStyle='rgba(255,255,255,0.5)';for(let i=0;i<40;i++)X.fillRect((i*97)%w,h-60+(i*13)%50,26,2);
    const by=h-96,t1=w*0.3,t2=w*0.62;X.strokeStyle='#5b8f6e';X.lineWidth=3;X.beginPath();X.moveTo(0,by);X.lineTo(w,by);X.stroke();
    X.lineWidth=2;X.beginPath();X.moveTo(0,by-6);X.quadraticCurveTo((t1)/2,by-10,t1,by-110);X.quadraticCurveTo((t1+t2)/2,by+40,t2,by-110);X.quadraticCurveTo((t2+w)/2,by-10,w,by-6);X.stroke();
    for(const t of [t1,t2]){X.fillStyle='#e9e2c8';X.fillRect(t-6,by-118,4,118);X.fillRect(t+2,by-118,4,118);X.fillRect(t-6,by-118,12,4);X.fillRect(t-6,by-80,12,3);X.fillRect(t-6,by-40,12,3)}
    for(let x=0;x<w;x+=16){X.fillStyle='#5b8f6e';X.fillRect(x,by,2,70-26)}
    hills(w,h,h-58,6,3,'#6fbf6f',0.3);X.fillStyle='#3d9be0';X.fillRect(0,h-40,w,40)}
  else {// U.P. pine forest
    for(let i=0;i<26;i++){const x=(i+0.5)*w/26;pine(x,h-30+8*Math.sin(i*2.3),1.5+0.3*Math.sin(i*1.3),'#3f7d5a')}
    for(let i=0;i<20;i++){const x=(i+0.2)*w/20;pine(x,h-6,1.15,'#2f6a47')}X.fillStyle='#2f6a47';X.fillRect(0,h-8,w,8)}}
function midArt(th,w,h){const g=h;
  if(th==='school'){
    // Meadow Brook Elementary: brick school, flagpole, playground, school bus
    const sx=260,sw=520,sh=150;X.fillStyle='#c4573f';X.fillRect(sx,g-sh,sw,sh);X.fillStyle='#8f3a29';X.fillRect(sx-8,g-sh-12,sw+16,14);
    X.fillStyle='rgba(0,0,0,0.08)';for(let yy=g-sh+6;yy<g;yy+=10)X.fillRect(sx,yy,sw,2);
    winds(sx+20,g-sh+22,6,2,40,36,12,22,'#9fd8ff','#fff');winds(sx+sw-20-6*40-5*12,g-sh+22,6,2,40,36,12,22,'#9fd8ff','#fff');
    const ex=sx+sw/2;X.fillStyle='#e8d9b5';X.fillRect(ex-70,g-sh-40,140,sh+40);X.fillStyle='#8f3a29';X.fillRect(ex-78,g-sh-48,156,12);
    rrect(ex-62,g-sh-30,124,46,8);X.fillStyle='#1f6f43';X.fill();txt('MEADOW BROOK',ex,g-sh-16,15,'#fff');txt('ELEMENTARY',ex,g-sh+2,14,'#ffe14d');
    X.fillStyle='#2a6fdb';X.fillRect(ex-30,g-64,28,64);X.fillRect(ex+2,g-64,28,64);X.fillStyle='#bfe6ff';X.fillRect(ex-25,g-58,18,24);X.fillRect(ex+7,g-58,18,24);
    X.fillStyle='#bdb6a6';X.fillRect(ex-50,g-6,100,6);
    // flagpole
    X.fillStyle='#c9ced6';X.fillRect(190,g-290,6,290);circ(193,g-292,6,'#ffd54f');usFlag(197,g-284,70,42);X.fillStyle='#9aa1ab';X.fillRect(178,g-8,30,8);
    // playground: tower + slide + swings
    const px=860;X.fillStyle='#b98a5a';ell(px+110,g-2,150,10,'#b98a5a');X.fillStyle='#e53935';X.fillRect(px,g-120,8,120);X.fillRect(px+60,g-120,8,120);X.fillStyle='#ffca28';X.fillRect(px-4,g-70,76,10);
    poly([px-12,g-120,px+34,g-160,px+80,g-120],'#43a047');X.beginPath();X.moveTo(px+68,g-66);X.quadraticCurveTo(px+120,g-60,px+140,g-4);X.lineWidth=14;X.strokeStyle='#ffb300';X.lineCap='round';X.stroke();
    X.strokeStyle='#1e88e5';X.lineWidth=6;X.beginPath();X.moveTo(px+170,g);X.lineTo(px+200,g-110);X.lineTo(px+290,g-110);X.lineTo(px+320,g);X.stroke();
    X.lineWidth=2;X.strokeStyle='#555';for(const sx2 of [px+225,px+265]){X.beginPath();X.moveTo(sx2-8,g-110);X.lineTo(sx2-8,g-34);X.moveTo(sx2+8,g-110);X.lineTo(sx2+8,g-34);X.stroke();X.fillStyle='#e53935';X.fillRect(sx2-12,g-36,24,6)}
    // school bus
    const bx=40;rrect(bx,g-62,140,52,10);X.fillStyle='#ffc107';X.fill();X.fillStyle='#222';X.fillRect(bx,g-32,140,5);winds(bx+12,g-54,5,1,18,14,6,0,'#bfe6ff');X.fillStyle='#ffc107';rrect(bx+140,g-40,22,30,6);X.fill();
    circ(bx+30,g-8,11,'#333');circ(bx+120,g-8,11,'#333');circ(bx+30,g-8,4,'#bbb');circ(bx+120,g-8,4,'#bbb');
    tree(1180,g,1.1,'#3fae4a','#5cc664');tree(840,g,0.9,'#3fae4a','#5cc664')}
  else if(th==='suburb'){
    // Rochester Hills: tree-lined colonial houses, park, Paint Creek Trail bridge
    house(40,g,150,90,'#f3e2c0','#5d6470');tree(230,g,1.25,'#3d9e48','#56b85e');house(270,g,140,84,'#9fc8e8','#4e5562');tree(445,g,1.3,'#3d9e48','#56b85e');house(490,g,150,92,'#f6c9b3','#5d6470');
    X.fillStyle='#fff';X.fillRect(660,g-46,4,46);X.fillStyle='#2f6fd0';rrect(652,g-60,22,14,4);X.fill();tree(700,g,1.2,'#3d9e48','#56b85e');
    // creek + wooden trail bridge
    X.fillStyle='#4aa3df';X.beginPath();X.ellipse(900,g,150,22,0,Math.PI,TAU);X.fill();X.fillStyle='rgba(255,255,255,0.6)';X.fillRect(820,g-8,40,2);X.fillRect(920,g-14,50,2);
    X.fillStyle='#9c6b3f';X.beginPath();X.moveTo(770,g-6);X.quadraticCurveTo(900,g-50,1030,g-6);X.lineTo(1030,g+2);X.quadraticCurveTo(900,g-40,770,g+2);X.closePath();X.fill();
    X.strokeStyle='#7a4f2b';X.lineWidth=4;X.beginPath();X.moveTo(770,g-34);X.quadraticCurveTo(900,g-78,1030,g-34);X.stroke();for(let i=0;i<=10;i++){const t=i/10,x=lerp(770,1030,t),yb=g-6-44*4*t*(1-t)*0.82,yt=g-34-44*4*t*(1-t)*0.82;X.lineWidth=3;X.beginPath();X.moveTo(x,yb);X.lineTo(x,yt);X.stroke()}
    X.fillStyle='#6b4423';X.fillRect(1060,g-70,6,70);rrect(1030,g-96,96,34,6);X.fillStyle='#7a4f2b';X.fill();txt('PAINT CREEK',1078,g-87,11,'#ffe9a8');txt('TRAIL',1078,g-72,11,'#ffe9a8');
    // park bench + lamp
    X.fillStyle='#8d5b34';X.fillRect(1140,g-22,50,5);X.fillRect(1140,g-34,50,4);X.fillStyle='#333';X.fillRect(1144,g-17,4,17);X.fillRect(1182,g-17,4,17);
    X.fillStyle='#37474f';X.fillRect(1210,g-90,4,90);circ(1212,g-94,7,'#fff59d');tree(w-40,g,1.1,'#3d9e48','#56b85e')}
  else if(th==='city'){
    // Detroit River + riverwalk + Spirit of Detroit (cartoon)
    X.fillStyle='#2f78bd';X.fillRect(0,g-110,w,74);X.fillStyle='rgba(255,255,255,0.45)';for(let i=0;i<46;i++)X.fillRect((i*131)%w,g-104+(i*17)%60,30,2);
    X.fillStyle='#d8cfc0';X.fillRect(0,g-38,w,38);X.fillStyle='#37474f';X.fillRect(0,g-62,w,4);for(let x=6;x<w;x+=22)X.fillRect(x,g-62,3,26);
    for(const lx of [120,420,700,1000]){X.fillStyle='#263238';X.fillRect(lx,g-120,5,84);X.fillRect(lx-10,g-122,25,4);circ(lx-8,g-116,6,'#fff3b0');circ(lx+13,g-116,6,'#fff3b0')}
    // a little freighter on the river
    X.fillStyle='#b71c1c';X.fillRect(520,g-92,120,16);poly([640,g-92,662,g-92,640,g-76],'#b71c1c');X.fillStyle='#fff';X.fillRect(530,g-108,26,16);X.fillStyle='#222';X.fillRect(538,g-122,8,14);
    // Spirit of Detroit: marble wall + pedestal + green seated figure holding a golden sphere
    const s=860;X.fillStyle='#ece6da';X.beginPath();X.arc(s,g-36,92,Math.PI,TAU);X.fill();X.fillStyle='#ddd5c6';X.fillRect(s-62,g-70,124,34);
    X.fillStyle='#2f8f6a';ell(s,g-108,30,36,'#2f8f6a');circ(s,g-158,16,'#2f8f6a');X.fillStyle='#2f8f6a';X.fillRect(s-26,g-84,52,16);
    X.strokeStyle='#2f8f6a';X.lineWidth=9;X.lineCap='round';X.beginPath();X.moveTo(s-24,g-120);X.lineTo(s-46,g-138);X.stroke();X.beginPath();X.moveTo(s+24,g-120);X.lineTo(s+46,g-136);X.stroke();
    circ(s-50,g-150,13,'#ffca28');for(let i=0;i<8;i++){const a=i*TAU/8;X.strokeStyle='#ffd54f';X.lineWidth=2;X.beginPath();X.moveTo(s-50+Math.cos(a)*15,g-150+Math.sin(a)*15);X.lineTo(s-50+Math.cos(a)*22,g-150+Math.sin(a)*22);X.stroke()}
    circ(s+50,g-146,6,'#2f8f6a');circ(s+56,g-148,5,'#2f8f6a');circ(s,g-161,3,'#246f52');
    txt('SPIRIT OF DETROIT',s,g-50,12,'#7a6a52')}
  else if(th==='island'){
    // Grand Hotel: long white porch + columns + yellow awnings + flags
    const hx=60,hw=640,hh=150;X.fillStyle='#4e7d5a';X.fillRect(hx-10,g-hh-26,hw+20,26);poly([hx+hw/2-50,g-hh-26,hx+hw/2,g-hh-70,hx+hw/2+50,g-hh-26],'#4e7d5a');
    X.fillStyle='#fffdf6';X.fillRect(hx,g-hh,hw,hh);X.fillStyle='#fff';X.fillRect(hx+hw/2-14,g-hh-60,28,34);
    for(let i=0;i<5;i++){X.fillStyle='#9e9e9e';X.fillRect(hx+40+i*140,g-hh-60,2,36);usFlag(hx+42+i*140,g-hh-60,22,14)}
    winds(hx+16,g-hh+12,21,2,16,20,13.5,10,'#8ec9ef');
    for(let i=0;i<21;i++){X.fillStyle=i%2?'#ffd54f':'#fff59d';X.fillRect(hx+12+i*29.6,g-hh+64,26,10)}
    X.fillStyle='#e9e4d8';X.fillRect(hx,g-58,hw,6);for(let i=0;i<=32;i++){X.fillStyle='#fff';X.fillRect(hx+i*(hw/32)-2,g-56,5,56)}X.fillStyle='rgba(0,0,0,0.08)';X.fillRect(hx,g-56,hw,56);
    txt('GRAND HOTEL',hx+hw/2,g-hh-12,16,'#fff',{st:'#2e5a3a',sw:4});
    // fudge shops
    const cols=[['#ff9fb2','#e91e63'],['#a5d6a7','#2e7d32'],['#ffe082','#ff8f00']];
    cols.forEach(([c,a],i)=>{const fx=760+i*140;X.fillStyle=c;X.fillRect(fx,g-120,128,120);X.fillStyle='#5d4037';X.fillRect(fx,g-126,128,8);
      for(let k=0;k<8;k++){X.fillStyle=k%2?a:'#fff';X.beginPath();X.moveTo(fx+k*16,g-74);X.lineTo(fx+k*16+16,g-74);X.lineTo(fx+k*16+16,g-62);X.quadraticCurveTo(fx+k*16+8,g-54,fx+k*16,g-62);X.closePath();X.fill()}
      rrect(fx+14,g-112,100,28,6);X.fillStyle='#fff8e1';X.fill();txt(i===1?'FUDGE SHOP':'FUDGE',fx+64,g-98,i===1?14:17,'#6d4c41');X.fillStyle='#bfe6ff';X.fillRect(fx+12,g-50,50,34);X.fillStyle='#6d4c41';X.fillRect(fx+78,g-52,34,52);
      X.fillStyle='#8d6e63';X.fillRect(fx+16,g-30,42,8)});
    // lilac bushes
    for(const lx of [720,1196])for(let k=0;k<5;k++)circ(lx+k*7-14,g-14-((k*13)%9),11,k%2?'#b388ff':'#9575cd')}
  else {
    // Tahquamenon Falls: wide amber "root beer" waterfall between rocky cliffs
    const fx=300,fw=600,lip=g-230;
    X.fillStyle='#6d5b4b';X.beginPath();X.moveTo(fx-160,g);X.lineTo(fx-140,lip-30);X.lineTo(fx+10,lip-24);X.lineTo(fx+10,g);X.closePath();X.fill();
    X.beginPath();X.moveTo(fx+fw-10,g);X.lineTo(fx+fw-10,lip-26);X.lineTo(fx+fw+150,lip-34);X.lineTo(fx+fw+170,g);X.closePath();X.fill();
    const gr=X.createLinearGradient(0,lip,0,g-30);gr.addColorStop(0,'#7a3f10');gr.addColorStop(0.5,'#c7782a');gr.addColorStop(1,'#efc27c');X.fillStyle=gr;X.fillRect(fx,lip,fw,g-30-lip);
    X.fillStyle='rgba(255,240,210,0.55)';for(let i=0;i<34;i++){const x=fx+8+i*17.4;X.fillRect(x,lip+((i*37)%40),3+(i%3),g-60-lip-((i*37)%40))}
    X.fillStyle='#fff7e6';ell(fx+fw/2,lip,fw/2+6,8,'#fff3dc');
    for(let i=0;i<16;i++)circ(fx+20+i*37,g-36+((i*7)%10),22+(i%3)*5,'#fffaf0');
    X.fillStyle='#8a4f1d';X.fillRect(fx-160,g-16,fw+330,16);
    for(const [px,py,s] of [[fx-120,lip-28,1.1],[fx-60,lip-26,1.3],[fx-10,lip-24,0.9],[fx+fw+30,lip-30,1.2],[fx+fw+100,lip-34,1.4]])pine(px,py,s,'#2e6b45');
    // wooden overlook
    X.fillStyle='#8d6e63';X.fillRect(40,g-90,180,8);for(let i=0;i<=6;i++)X.fillRect(40+i*30,g-90,4,90);X.fillRect(40,g-118,180,4);for(let i=0;i<=12;i++)X.fillRect(40+i*15,g-118,3,28);
    pine(w-60,g,1.6,'#2e6b45');pine(w-110,g,1.2,'#357a4f')}}
let BG=null;
function buildBG(lv){const L=LEVELS[lv],TW=Math.max(1280,Math.ceil(W/80)*80),k=clamp((H-TOP-BOT)/640,1,1.5),fh=340,mh=360;
  // tall portrait phones: scale the landmarks up so the Michigan scenery fills more of the screen
  const mk=(h,fn)=>{const c=document.createElement('canvas');c.width=Math.ceil(TW*k*RS);c.height=Math.ceil(h*k*RS);const x=c.getContext('2d');x.scale(RS*k,RS*k);const keep=X;X=x;try{fn(TW,h)}finally{X=keep}return c};
  BG={lv,g:genCache,TW:TW*k,k,fh:fh*k,mh:mh*k,far:mk(fh,(w,h)=>{farArt(L.theme,w,h);X.globalCompositeOperation='source-atop';X.fillStyle=L.fog;X.fillRect(0,0,w,h);X.globalCompositeOperation='source-over'}),mid:mk(mh,(w,h)=>midArt(L.theme,w,h)),sky:null,skyH:0}}
function ensureBG(lv){if(!BG||BG.lv!==lv||BG.g!==genCache||BG.H!==H){buildBG(lv);BG.H=H}}
function drawTile(c,par,y,h){const TW=BG.TW,off=((scroll*par)%TW+TW)%TW;X.drawImage(c,-off,y,TW,h);if(TW-off<W)X.drawImage(c,TW-off,y,TW,h)}
function drawBackdrop(lv){ensureBG(lv);const L=LEVELS[lv],g=GY();
  if(!BG.sky||BG.skyH!==H){const gr=X.createLinearGradient(0,0,0,g);gr.addColorStop(0,L.sky[0]);gr.addColorStop(1,L.sky[1]);BG.sky=gr;BG.skyH=H}
  X.fillStyle=BG.sky;X.fillRect(0,0,W,g+2);
  // sun + drifting clouds (cached sprites)
  const sun=spr('sun'+lv,90,90,()=>{circ(0,0,42,lv===2?'rgba(255,200,120,0.35)':'rgba(255,240,150,0.35)');circ(0,0,30,lv===2?'#ffb74d':'#ffe066')});blit(sun,W-70,TOP+150);
  const cl=spr('cloud',150,64,()=>{X.globalAlpha=0.92;ell(0,10,64,20,'#fff');circ(-30,0,24,'#fff');circ(4,-10,30,'#fff');circ(38,2,20,'#fff');X.globalAlpha=1});
  for(let i=0;i<4;i++){const cx=((i*330-scroll*0.08)%(W+300)+W+300)%(W+300)-150,cy=TOP+120+((i*97)%Math.max(60,(g-BG.mh-TOP-200)))+i*30;blit(cl,cx,cy,0.7+(i%3)*0.2)}
  drawTile(BG.far,0.18,g-BG.fh+6,BG.fh);
  drawTile(BG.mid,0.45,g-BG.mh+2,BG.mh);
  if(L.theme==='falls'){X.globalAlpha=0.5;for(let i=0;i<6;i++){const x=((i*90+T*40-scroll*0.45)%BG.TW+BG.TW)%BG.TW;if(x<W)circ(x,g-30-((T*30+i*20)%40),8+(i%3)*3,'#fff')}X.globalAlpha=1}
  // ground strip (cheap rects; scrolls 1:1 with the action)
  X.fillStyle=L.ground;X.fillRect(0,g,W,H-g);X.fillStyle=L.path;X.fillRect(0,g+14,W,12);
  X.fillStyle=L.ground2;const o=((scroll%60)+60)%60;for(let x=-o;x<W;x+=60){X.fillRect(x,g,30,6);X.fillRect(x+15,g+34,30,6)}
  X.fillStyle='rgba(0,0,0,0.12)';X.fillRect(0,g,W,3)}

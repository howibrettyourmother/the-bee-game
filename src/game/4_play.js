// ================= game state, spawning, collisions, bosses =================
let state='title',T=0,stT=0,TS=1,paused=false,scroll=0;
let lv=0,L=LEVELS[0],dist=0,LEN=1,phase='run',events=[],evI=0,cp={dist:0},spd=100,waitT=0;
let bee={x:80,y:300,ty:300,vy:0,inv:0,tilt:0},objs=[],shots=[],bul=[],warns=[],parts=[],floats=[],boss=null,banner=null;
const MAXH=5,STARTH=4;
let hearts=STARTH,score=0,honey=0,pops=0,hitsTaken=0,runTime=0,lvHits=0,lvStart=0,triple=0,shield=0,shotT=0,shake=0,lastPraise=-9,powT=0,powN=0,levelsDone=[],oopsN=0,lastOuch=-9,endStats=null;
const say=(k,p)=>AUD.say(k,p);
function playH(){return YMAX()-YMIN()}
// ---------- level flow ----------
function newGame(i){score=0;honey=0;pops=0;hitsTaken=0;runTime=0;levelsDone=[];oopsN=0;startLevel(i||0)}
function startLevel(i){lv=i;L=LEVELS[i];LEN=L.speed*L.len;dist=0;phase='run';cp={dist:0};objs=[];shots=[];bul=[];warns=[];parts=[];floats=[];boss=null;banner=null;
  hearts=Math.max(hearts,STARTH);if(i===0)hearts=STARTH;triple=0;shield=0;lvHits=0;lvStart=runTime;genEvents();evI=0;
  bee.x=BX();bee.y=bee.ty=(YMIN()+YMAX())/2;bee.inv=0;state='card';stT=0;
  if(unlockLv<i+1){unlockLv=i+1;LS.set('unlock',unlockLv)}selLv=i;AUD.setTheme(L.theme);setTimeout(()=>say('l'+(i+1),3),350)}
function startPlay(){if(state!=='card')return;state='play';stT=0;if(lv===0&&R()<0.6)say('go',1)}
function genEvents(){seed=1000+lv*7919;events=[];let t=2.6,gc=0.5;const tot=Object.values(L.pool).reduce((a,b)=>a+b,0);let lastK='';
  while(t<L.len-1.2){let r=srand()*tot,k='honey';for(const kk in L.pool){r-=L.pool[kk];if(r<=0){k=kk;break}}
    if(k===lastK&&k!=='posts'&&srand()<0.5)continue;lastK=k;
    const e={at:t*L.speed,k,s:(srand()*1e9)|0};if(k==='posts'){gc=clamp(gc+srr(-0.38,0.38),0.12,0.88);e.gc=gc;e.mode=srand()<0.25?'bot':srand()<0.3?'top':'both'}
    events.push(e);t+=L.int*srr(0.85,1.15)*(k==='honey'?0.7:1)}
  const fx=[[0.2,'triple'],[0.4,'shield'],[0.5,'cp'],[0.62,'heart'],[0.8,'triple']];for(const [f,k] of fx)events.push({at:LEN*f,k:'pow',p:k,s:1});
  events.sort((a,b)=>a.at-b.at)}
function spawnX(){return W+70}
function spawn(e){const x=spawnX(),y0=YMIN(),ph=playH(),th=L.theme;let s=e.s;const lr=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};
  if(e.k==='posts'){const gap=Math.min(L.gap,ph*0.56),gy=y0+gap/2+e.gc*(ph-gap);
    if(e.mode!=='top')objs.push({k:'post',x,y0:gy+gap/2,y1:GY()+4,top:false});
    if(e.mode!=='bot')objs.push({k:'post',x,y0:-20,y1:gy-gap/2,top:true});
    if(lr()<0.6)for(let i=0;i<3;i++)objs.push({k:'honey',x:x-40+i*40,y:gy})}
  else if(e.k==='ball'){const n=lr()<0.4?2:1;for(let i=0;i<n;i++)objs.push({k:'ball',x:x+i*120,r:19,apex:y0+ph*lr()*0.55,ph:lr()*3,vx:-30-lr()*30,rot:0})}
  else if(e.k==='flyer'){const y=y0+20+lr()*(ph-40),n=2+(lr()<0.5?1:0);for(let i=0;i<n;i++)objs.push({k:'flyer',x:x+i*64,y,by:y,ph:i*0.6,vx:-80-lv*8,hp:1,r:15})}
  else if(e.k==='wasp'){const y=y0+60+lr()*(ph-120);for(let i=0;i<3;i++)objs.push({k:'wasp',x:x+i*56,y,by:y,ph:i*0.9,amp:40+lr()*30,vx:-15,hp:1,r:16})}
  else if(e.k==='mosq'){const y=y0+40+lr()*(ph-80);for(let i=0;i<2;i++)objs.push({k:'mosq',x:x+i*80,y,by:y,ph:i*2,vx:-60,hp:1,r:13})}
  else if(e.k==='beetle'){const y=y0+40+lr()*(ph-80);objs.push({k:'beetle',x,y,by:y,ph:0,vx:45,hp:3,r:18,ft:1.2})}
  else if(e.k==='honey'){const y=y0+40+lr()*(ph-80),arc=lr()<0.5;if(lr()<0.22)objs.push({k:'jar',x,y});else for(let i=0;i<5;i++)objs.push({k:'honey',x:x+i*34,y:y+(arc?-Math.sin(i/4*Math.PI)*50:0)})}
  else if(e.k==='pow'){if(e.p==='cp'){objs.push({k:'cp',x,y:GY()});return}let p=e.p;if(p==='heart'&&hearts>=MAXH)p='shield';objs.push({k:'pow',p,x,y:y0+ph*(0.3+0.4*lr()),ph:0})}}
// ---------- particles ----------
function burst(x,y,n,cols,sp,r){for(let i=0;i<n&&parts.length<170;i++){const a=R()*TAU,v=rr(0.3,1)*(sp||160);parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,life:rr(0.4,0.8),r:rr(2,r||5),c:pick(cols)})}}
function float(s,x,y,c){if(floats.length<14)floats.push({s,x,y,t:0,c:c||'#fff'})}
function confetti(n){for(let i=0;i<n&&parts.length<170;i++)parts.push({x:rr(0,W),y:TOP-10,vx:rr(-40,40),vy:rr(60,180),t:0,life:rr(1.6,3),r:rr(3,6),c:pick(['#ffd23f','#ff5d8f','#4fc3f7','#81c784','#ff8a26','#b388ff']),conf:1,rot:rr(0,6)})}
// ---------- damage & pickups ----------
function hurt(){if(bee.inv>0||state!=='play')return;
  if(shield){shield=0;bee.inv=1.4;AUD.SFX.shieldPop();burst(bee.x,bee.y,16,['#ff80ab','#fff','#ffd23f'],220);return}
  hearts--;hitsTaken++;lvHits++;bee.inv=2.2;shake=9;AUD.SFX.hurt();burst(bee.x,bee.y,12,['#ffd23f','#fff'],180);
  if(hearts<=0){state='oops';stT=0;oopsN++;bul=[];warns=[];say('oops',3)}else if(T-lastOuch>9){lastOuch=T;say('ouch',1)}}
function praise(){if(T-lastPraise<7)return;lastPraise=T;say(pick(['g1','g2','g3','g4','g5']),1)}
function collect(o){if(o.k==='honey'){score+=10;honey++;AUD.SFX.honey(false);burst(o.x,o.y,5,['#ffb300','#ffe082'],90,4);if(honey%25===0)say('honey',1)}
  else if(o.k==='jar'){score+=50;honey+=5;AUD.SFX.honey(true);float('+50',o.x,o.y-20,'#ffe14d');burst(o.x,o.y,10,['#ffb300','#ffe082'],140)}
  else if(o.k==='pow'){AUD.SFX.power();if(o.p==='triple'){triple=12;say('triple',2)}else if(o.p==='shield'){shield=1;AUD.SFX.shield();say('shield',2)}else{hearts=Math.min(MAXH,hearts+1);AUD.SFX.heart();say('heart',2)}
    float(o.p==='triple'?'TRIPLE STINGER!':o.p==='shield'?'FLOWER SHIELD!':'+1 HEART',o.x,o.y-30,'#fff');burst(o.x,o.y,14,['#fff','#b3e5fc','#ffd23f'],180)}}
function circRect(cx,cy,r,x,y,w,h){const nx=clamp(cx,x,x+w),ny=clamp(cy,y,y+h);return (cx-nx)**2+(cy-ny)**2<r*r}
const BEE_R=12;
// ---------- bosses ----------
function laneWarn(y,h,dur){warns.push({y,h,t:0,dur});AUD.SFX.warn()}
const BOSS={
 swatter:{hp:30,init(b){b.y=(YMIN()+YMAX())/2;b.sub='idle';b.st2=0;b.lx=0},
  upd(b,dt){const p2=b.hp<b.max/2;b.st2+=dt;const hx=b.hx;
    if(b.sub==='idle'){b.y=lerp(b.y,clamp(bee.y,YMIN()+50,YMAX()-50),dt*1.1);b.x=lerp(b.x,hx,dt*4);if(b.st2>(p2?0.95:1.5)){b.sub='aim';b.st2=0;b.ly=clamp(bee.y,YMIN()+40,YMAX()-40);laneWarn(b.ly,128,0.95)}}
    else if(b.sub==='aim'){b.y=lerp(b.y,b.ly,dt*8);b.x=hx+Math.sin(b.st2*40)*3;if(b.st2>0.95){b.sub='swat';b.st2=0;AUD.SFX.whoosh()}}
    else if(b.sub==='swat'){b.x=lerp(hx,bee.x+24,ease(b.st2/0.26));if(b.st2>0.26){b.sub='hold';b.st2=0;shake=6;AUD.SFX.boing();burst(b.x-55,b.y,8,['#fff','#c5e1a5'],160)}}
    else if(b.sub==='hold'){if(b.st2>0.3){b.sub='back';b.st2=0}}
    else if(b.sub==='back'){b.x=lerp(bee.x+24,hx,ease(b.st2/0.6));if(b.st2>0.6){b.sub=p2&&!b.dbl?'aim2':'idle';b.dbl=b.sub==='aim2';b.st2=0;if(b.sub==='aim2'){b.sub='aim';b.ly=clamp(bee.y,YMIN()+40,YMAX()-40);laneWarn(b.ly,128,0.95)}}}},
  rects(b){return [[b.x-58,b.y-62,116,124]]},
  hurtOn(b){return b.sub==='swat'||b.sub==='hold'||b.sub==='back'},
  draw(b){const fl=b.flash>0;X.fillStyle='#8d5524';X.fillRect(b.x+50,b.y-9,W+120-b.x,18);X.fillStyle='#e53935';X.fillRect(b.x+W*0.25,b.y-11,W,22);
    rrect(b.x-60,b.y-64,120,128,24);X.fillStyle=fl?'#fff':'#43a047';X.fill();strokeC('#1b5e20',5);
    X.strokeStyle='rgba(220,255,200,0.55)';X.lineWidth=2.5;X.beginPath();for(let i=-48;i<=48;i+=16){X.moveTo(b.x+i,b.y-60);X.lineTo(b.x+i,b.y+60);X.moveTo(b.x-56,b.y+i);X.lineTo(b.x+56,b.y+i)}X.stroke();
    const dz=b.down;circ(b.x-22,b.y-14,15,'#fff');circ(b.x+22,b.y-14,15,'#fff');
    if(dz){for(const ex of [-22,22]){X.beginPath();X.arc(b.x+ex,b.y-14,8,0,5);strokeC('#333',3)}}else{circ(b.x-26,b.y-12,7,'#222');circ(b.x+18,b.y-12,7,'#222');X.beginPath();X.moveTo(b.x-40,b.y-36);X.lineTo(b.x-8,b.y-28);X.moveTo(b.x+40,b.y-36);X.lineTo(b.x+8,b.y-28);strokeC('#1b5e20',6)}
    X.beginPath();if(dz)X.arc(b.x,b.y+20,14,0.1,Math.PI-0.1);else{X.moveTo(b.x-18,b.y+26);X.quadraticCurveTo(b.x,b.y+14,b.x+18,b.y+26)}strokeC('#1b5e20',5)}},
 skunk:{hp:38,init(b){b.y=GY()-58;b.sub='idle';b.st2=0;b.n=0;b.jy=0},
  upd(b,dt){const p2=b.hp<b.max/2;b.st2+=dt;b.x=lerp(b.x,b.hx,dt*3);const base=GY()-58;
    if(b.sub==='idle'){b.y=base;if(b.st2>(p2?1.35:1.9)){b.n++;b.st2=0;if(b.n%3===0){b.sub='hop';b.hy=clamp(bee.y+30,YMIN()+120,base)}else{b.sub='puff'}}}
    else if(b.sub==='puff'){if(b.st2>0.35){b.sub='idle';b.st2=0;AUD.SFX.puff();const n=p2?5:4,skip=(R()*n)|0,tx=b.x+40,ty=b.y-150;
      for(let i=0;i<n;i++){if(i===skip&&n>4)continue;const a=lerp(-0.5,0.75,i/(n-1));bul.push({k:'stink',x:tx,y:ty,vx:-Math.cos(a)*150,vy:Math.sin(a)*150+20,r:22,ay:0,wob:R()*6})}}}
    else if(b.sub==='hop'){const k=b.st2/1.5;b.y=lerp(base,b.hy-60,Math.sin(Math.PI*clamp(k,0,1)));if(k>=1){b.sub='idle';b.st2=0;b.y=base;shake=5;AUD.SFX.boing();
      for(let i=0;i<2;i++)bul.push({k:'acorn',x:b.x-60,y:base+40,vx:-160-i*50,vy:-260-i*60,r:13,ay:520,bounce:1})}}},
  rects(b){return [[b.x-78,b.y-36,120,90],[b.x-20,b.y-150,70,120]]},hurtOn(){return true},
  draw(b){const fl=b.flash>0,bk=fl?'#666':'#2d2a3a',wt='#fff',x=b.x,y=b.y,sq=b.sub==='puff'?Math.sin(b.st2*20)*4:0;
    // tail
    X.beginPath();X.moveTo(x+20,y+10);X.bezierCurveTo(x+90,y-20,x+90,y-150,x+20,y-170+sq);X.bezierCurveTo(x-20,y-175,x-10,y-120,x+20,y-120);X.bezierCurveTo(x+40,y-110,x+40,y-40,x-10,y);X.closePath();X.fillStyle=bk;X.fill();
    X.beginPath();X.moveTo(x+30,y-10);X.bezierCurveTo(x+70,y-40,x+72,y-140,x+24,y-158+sq);X.strokeStyle=wt;X.lineWidth=10;X.lineCap='round';X.stroke();
    ell(x,y+10,62,44,bk);X.beginPath();X.moveTo(x-40,y-20);X.quadraticCurveTo(x,y-44,x+40,y-20);strokeC(wt,10);
    ell(x-26,y+52,12,8,bk);ell(x+26,y+52,12,8,bk);
    circ(x-58,y-12,32,bk);poly([x-78,y-38,x-70,y-56,x-60,y-40],bk);poly([x-50,y-40,x-40,y-58,x-34,y-38],bk);X.beginPath();X.moveTo(x-58,y-44);X.lineTo(x-60,y+8);strokeC(wt,7);
    circ(x-70,y-16,8,'#fff');circ(x-46,y-16,8,'#fff');if(b.down){circ(x-70,y-14,3,'#222');circ(x-46,y-14,3,'#222')}else{circ(x-72,y-15,4.5,'#222');circ(x-48,y-15,4.5,'#222')}
    circ(x-88,y-2,6,'#ff8fb1');X.beginPath();X.arc(x-66,y+4,8,0.2,Math.PI-0.2);strokeC('#ff8fb1',3);
    if(b.down){X.fillStyle='#43a047';X.fillRect(x-100,y-20,3,30);for(let i=0;i<6;i++){const a=i*TAU/6;ell(x-98+Math.cos(a)*7,y-24+Math.sin(a)*7,5,3.5,'#ff80ab',a)}circ(x-98,y-24,4,'#ffd23f')}}},
 robo:{hp:46,init(b){b.y=(YMIN()+YMAX())/2;b.sub='idle';b.st2=0;b.n=0;b.tt=0},
  upd(b,dt){const p2=b.hp<b.max/2;b.st2+=dt;const mid=(YMIN()+YMAX())/2,A=playH()*0.36;
    if(b.sub==='idle'||b.sub==='bolts'){b.tt+=dt;b.y=mid+A*Math.sin(b.tt*0.9);b.x=b.hx+20*Math.sin(b.tt*1.8);
      if(b.st2>(p2?1.45:2.0)){b.st2=0;b.n++;if(b.n%3===0){b.sub='aim';b.ly=clamp(bee.y,YMIN()+34,YMAX()-34);laneWarn(b.ly,96,0.9)}
        else{AUD.SFX.beep();const n=p2?5:3,a0=Math.atan2(bee.y-b.y,bee.x-(b.x-50)),sp=p2?195:170;for(let i=0;i<n;i++){const a=a0+(i-(n-1)/2)*0.3;bul.push({k:'bolt',x:b.x-50,y:b.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:10,ay:0})}
          if(p2&&b.n%4===1)for(let i=0;i<2;i++)bul.push({k:'drone',x:b.x-30,y:b.y+(i?50:-50),vx:-80,vy:0,r:15,ay:0,hp:2,shoot:1})}}}
    else if(b.sub==='aim'){b.y=lerp(b.y,b.ly,dt*8);if(b.st2>0.9){b.sub='dash';b.st2=0;AUD.SFX.whoosh()}}
    else if(b.sub==='dash'){b.x=lerp(b.hx,bee.x+30,ease(b.st2/0.3));if(b.st2>0.3){b.sub='back';b.st2=0}}
    else if(b.sub==='back'){if(b.st2>0.25)b.x=lerp(bee.x+30,b.hx,ease((b.st2-0.25)/0.6));if(b.st2>0.85){b.sub='idle';b.st2=0;b.tt=Math.asin(clamp((b.y-mid)/A,-1,1))/0.9}}},
  rects(b){return [[b.x-62,b.y-36,124,72]]},hurtOn(b){return b.sub==='dash'||b.sub==='back'},
  draw(b){const x=b.x,y=b.y,fl=b.flash>0,f=Math.abs(Math.sin(T*40));X.globalAlpha=0.6;ell(x+4,y-40,26,(20-8*f),'#b3e5fc',-0.4);ell(x+30,y-38,22,(16-6*f),'#b3e5fc',0.3);X.globalAlpha=1;
    poly([x+60,y-6,x+92,y+2,x+60,y+10],'#90a4ae');
    X.save();X.beginPath();X.ellipse(x+18,y+4,44,30,0,0,TAU);X.fillStyle=fl?'#fff':'#ffca28';X.fill();X.clip();X.fillStyle='#37474f';X.fillRect(x+2,y-30,12,64);X.fillRect(x+28,y-30,12,64);X.restore();X.beginPath();X.ellipse(x+18,y+4,44,30,0,0,TAU);strokeC('#455a64',3);
    rrect(x-66,y-34,62,58,18);X.fillStyle=fl?'#fff':'#b0bec5';X.fill();strokeC('#455a64',3);rrect(x-60,y-22,50,22,10);X.fillStyle='#263238';X.fill();
    if(b.down){X.font='800 14px '+FONT;heartP(x-47,y-8,7,'#ff4081');heartP(x-23,y-8,7,'#ff4081')}else{X.fillStyle='#4dd0e1';X.fillRect(x-54,y-15,14,8);X.fillRect(x-30,y-15,14,8)}
    X.beginPath();X.moveTo(x-36,y-34);X.lineTo(x-40,y-54);strokeC('#455a64',3);circ(x-40,y-56,5,Math.sin(T*8)>0?'#ff1744':'#ffcdd2');
    X.fillStyle='#455a64';X.fillRect(x-50,y+6,30,4);poly([x-66,y+18,x-88,y+24,x-66,y+30],'#78909c')}},
 gulls:{hp:51,init(b){const nm=['GARY','LARRY','BARRY'];b.g=[0,1,2].map(i=>({i,nm:nm[i],hp:17,st:'bob',t:0,x:b.hx+(i%2)*30,y:0,f:0}));b.st2=0;b.ft=1.2},
  slot(i){return YMIN()+playH()*(0.18+i*0.32)},
  upd(b,dt){const p2=b.hp<b.max/2;b.st2+=dt;b.ft-=dt;const alive=b.g.filter(g=>g.hp>0);
    for(const g of b.g){g.t+=dt;if(g.hp<=0){g.x+=120*dt;g.y-=90*dt;continue}const sy=this.slot(g.i)+Math.sin(T*2+g.i)*12;
      if(g.st==='bob'){g.x=lerp(g.x,b.hx+(g.i%2)*30,dt*3);g.y=lerp(g.y||sy,sy,dt*3)}
      else if(g.st==='aim'){g.y=lerp(g.y,g.ly,dt*7);if(g.t>0.9){g.st='swoop';g.t=0;AUD.SFX.whoosh()}}
      else if(g.st==='swoop'){g.x-=(p2?600:520)*dt;if(g.x<-80){g.st='ret';g.t=0;g.x=W+80;g.y=sy}}
      else if(g.st==='ret'){g.x=lerp(g.x,b.hx+(g.i%2)*30,dt*2.5);g.y=lerp(g.y,sy,dt*3);if(g.t>1.3)g.st='bob'}}
    const bob=alive.filter(g=>g.st==='bob');
    if(b.st2>(p2?1.3:1.85)&&bob.length&&!alive.some(g=>g.st==='aim'||g.st==='swoop')){b.st2=0;const g=pick(bob);g.st='aim';g.t=0;g.ly=clamp(bee.y,YMIN()+26,YMAX()-26);laneWarn(g.ly,78,0.9);AUD.SFX.squawk();float('SQUAWK!',g.x,g.y-34,'#fff')}
    if(b.ft<0&&bob.length){b.ft=p2?1.7:2.4;const g=pick(bob);bul.push({k:'fry',x:g.x-30,y:g.y,vx:-170,vy:-50+R()*60,r:11,ay:90,rot:0})}
    b.hp=b.g.reduce((a,g)=>a+Math.max(0,g.hp),0)},
  rects(b){return b.g.filter(g=>g.hp>0).map(g=>[g.x-28,g.y-20,56,40])},hurtOn(){return true},
  hitPart(b,sx,sy){for(const g of b.g)if(g.hp>0&&circRect(sx,sy,6,g.x-28,g.y-20,56,40)){g.hp--;g.fl=0.08;if(g.hp<=0){AUD.SFX.squawk();burst(g.x,g.y,14,['#fff','#cfd8dc','#ffd23f'],200);float('BYE '+g.nm+'!',g.x,g.y-30,'#fff')}return true}return false},
  draw(b){for(const g of b.g){const x=g.x,y=g.y,f=Math.sin(T*14+g.i),fl=g.fl>0;g.fl=(g.fl||0)-1/60;X.save();X.translate(x,y);if(g.st==='swoop')X.rotate(-0.1);
    ell(4,0,30,17,fl?'#ffe0e0':'#fff');ell(10,-4-f*12,20,8,'#b0bec5',-0.5-f*0.5);ell(26,-2,10,6,'#90a4ae');circ(-20,-10,14,fl?'#ffe0e0':'#fff');poly([-32,-10,-48,-5,-32,-3],'#ffb300');
    if(g.hp<=0){X.fillStyle='#ffd54f';X.fillRect(-52,-8,14,4)}
    if(g.i===0){X.fillStyle='#222';X.fillRect(-30,-16,16,6)}else{circ(-24,-13,3.6,'#222')}if(g.i===2){X.fillStyle='#e53935';X.fillRect(-28,-28,16,5);X.fillRect(-25,-36,10,9)}
    X.strokeStyle='#ffb300';X.lineWidth=2.5;X.beginPath();X.moveTo(0,16);X.lineTo(-2,24);X.moveTo(8,16);X.lineTo(8,24);X.stroke();X.restore();
    if(g.hp>0)txt(g.nm,x,y+30,11,'#fff',{st:'#37474f',sw:3})}}},
 bear:{hp:80,init(b){b.sub='idle';b.st2=0;b.n=0;b.jy=0;b.paw=0;b.y=GY()},
  upd(b,dt){const p2=b.hp<b.max/2;b.st2+=dt;b.x=lerp(b.x,b.hx,dt*3);
    if(b.sub==='idle'){b.jy=lerp(b.jy,0,dt*8);if(b.st2>(p2?1.4:2.0)){b.st2=0;b.n++;const k=b.n%(p2?4:3);if(k===0){b.sub='aim';b.ly=clamp(bee.y,Math.max(YMIN()+30,GY()-300),YMAX()-30);laneWarn(b.ly,84,1.0)}else if(p2&&k===2){b.sub='jump'}else{b.sub='toss'}}}
    else if(b.sub==='toss'){if(b.st2>0.4){b.sub='idle';b.st2=0;AUD.SFX.roar();const n=p2?4:3;for(let i=0;i<n;i++){bul.push({k:'pot',x:b.x-70,y:GY()-210,vx:-rr(150,250),vy:rr(-260,60),r:15,ay:240,rot:0})}}}
    else if(b.sub==='aim'){b.paw=0;if(b.st2>1.0){b.sub='swipe';b.st2=0;AUD.SFX.whoosh()}}
    else if(b.sub==='swipe'){b.paw=ease(b.st2/0.3);if(b.st2>0.6){b.sub='pawback';b.st2=0}}
    else if(b.sub==='pawback'){b.paw=1-ease(b.st2/0.5);if(b.st2>0.5){b.sub='idle';b.st2=0;b.paw=0}}
    else if(b.sub==='jump'){const k=b.st2/1.1;b.jy=-Math.sin(Math.PI*clamp(k,0,1))*120;if(k>=1){b.sub='idle';b.st2=0;b.jy=0;shake=10;AUD.SFX.boing();for(let i=0;i<3;i++)bul.push({k:'cone',x:b.x-90-i*10,y:GY()-20,vx:-150-i*55,vy:-200-i*70,r:14,ay:520,bounce:1})}}},
  pawX(b){return lerp(b.x-100,bee.x+10,b.paw)},
  rects(b){const r=[[b.x-80,GY()-190+b.jy,170,190],[b.x-80,GY()-300+b.jy,130,120]];if(b.paw>0.05)r.push([this.pawX(b)-26,b.ly-26,52,52]);return r},hurtOn(){return true},
  draw(b){const x=b.x,g=GY()+b.jy,fl=b.flash>0,fur=fl?'#d7b48a':'#8d5a2b',lt=fl?'#fff':'#c8955c';
    ell(x+10,g-90,95,100,fur);ell(x-5,g-80,58,66,lt);ell(x-40,g-8,34,18,fur);ell(x+50,g-8,34,18,fur);
    // honey-pot arm / swipe paw
    if(b.paw>0.05){const px=this.pawX(b);X.strokeStyle=fur;X.lineWidth=34;X.lineCap='round';X.beginPath();X.moveTo(x-50,g-150);X.lineTo(px,b.ly);X.stroke();circ(px,b.ly,26,fur);for(let i=0;i<3;i++)circ(px-14,b.ly-12+i*12,6,lt)}
    else{ell(x-80,g-150,26,40,fur,0.5)}
    ell(x+80,g-140,24,44,fur,-0.4);
    const hx=x-30,hy=g-240;circ(hx-46,hy-50,22,fur);circ(hx+46,hy-50,22,fur);circ(hx-46,hy-50,11,lt);circ(hx+46,hy-50,11,lt);circ(hx,hy,62,fur);ell(hx-8,hy+22,32,24,lt);ell(hx-10,hy+8,12,9,'#3e2723');
    if(b.down){X.beginPath();X.arc(hx-30,hy-14,9,Math.PI,TAU);strokeC('#3e2723',4);X.beginPath();X.arc(hx+14,hy-14,9,Math.PI,TAU);strokeC('#3e2723',4)}else{circ(hx-30,hy-14,10,'#fff');circ(hx+14,hy-14,10,'#fff');circ(hx-33,hy-13,5.5,'#222');circ(hx+11,hy-13,5.5,'#222');
      X.beginPath();X.moveTo(hx-44,hy-32);X.lineTo(hx-20,hy-28);X.moveTo(hx+28,hy-32);X.lineTo(hx+4,hy-28);strokeC('#3e2723',5)}
    X.beginPath();X.arc(hx-10,hy+28,14,0.15,Math.PI-0.15);strokeC('#3e2723',4);if(!b.down&&(b.sub==='toss'||b.sub==='aim')){ell(hx-10,hy+36,10,7,'#c62828')}
    // crown
    const cy=hy-58,tilt=b.down?0.25:0;X.save();X.translate(hx,cy);X.rotate(tilt);poly([-40,10,-44,-28,-22,-8,0,-36,22,-8,44,-28,40,10],'#ffd23f');X.fillStyle='#ffb300';X.fillRect(-40,4,80,10);circ(0,-12,6,'#e53935');circ(-26,-2,4,'#4fc3f7');circ(26,-2,4,'#81c784');X.restore();
    if(b.down){rrect(x-120,g-150,60,60,16);X.fillStyle='#ffb300';X.fill();X.fillStyle='#c77700';X.fillRect(x-124,g-158,68,12);txt('HONEY',x-90,g-118,13,'#fff8e1');heartP(hx+70,hy-60-((T*30)%40),10,'#ff4081')}}}};
function spawnBoss(){const def=BOSS[L.boss];boss={k:L.boss,name:L.bossN,max:def.hp,hp:def.hp,x:W+220,hx:W-INR-(L.boss==='bear'?110:L.boss==='skunk'?100:L.boss==='gulls'?70:92),y:300,t:0,st:'enter',flash:0,down:0};def.init(boss);
  phase='boss';cp={dist:LEN,boss:true};AUD.setTheme(L.boss==='bear'?'king':'boss');say('b'+(lv+1),3);banner={s:boss.name,t:0,boss:1};powT=8;powN=0}
function bossUpdate(dt){const b=boss,def=BOSS[b.k];b.t+=dt;b.flash-=dt;
  if(b.st==='enter'){b.x=lerp(W+220,b.hx,ease(b.t/2));if(b.k==='gulls')for(const g of b.g){g.x=b.x+(g.i%2)*30;g.y=def.slot(g.i)}else if(b.k!=='skunk'&&b.k!=='bear')b.y=lerp(b.y,(YMIN()+YMAX())/2,dt*3);
    if(b.t>2){b.st='fight';b.t=0}return}
  if(b.st==='down'){b.down+=dt;if(b.k!=='gulls'&&b.k!=='bear'&&b.down>1.5)b.x+=(b.down-1.5)*220*dt;if(b.k==='gulls')for(const g of b.g){g.x+=120*dt;g.y-=90*dt;g.hp=0};if(R()<dt*6)burst(rr(W*0.4,W),rr(YMIN(),YMAX()),6,['#ffd23f','#ff5d8f','#4fc3f7','#fff'],150);
    if(b.down>4.2)levelClear();return}
  if(state!=='play')return;def.upd.call(def,b,dt);
  if(b.hp<=0){b.hp=0;b.st='down';b.down=0;bul=[];warns=[];AUD.SFX.bossDown();score+=500;float('+500',b.hx-40,(YMIN()+YMAX())/2,'#ffe14d');setTimeout(()=>say('w'+(lv+1),3),700);confetti(60);
    for(let i=0;i<10;i++)objs.push({k:'honey',x:b.hx-40+rr(-40,40),y:rr(YMIN()+30,YMAX()-30),magnet:1});return}
  // boss contact
  if(def.hurtOn(b))for(const r of def.rects(b))if(circRect(bee.x,bee.y,BEE_R,r[0],r[1],r[2],r[3])){hurt();break}
  // power-ups during the fight
  powT-=dt;if(powT<0){powT=12;powN++;const p=powN%2?'triple':(hearts<3?'heart':'shield');objs.push({k:'pow',p,x:W+40,y:YMIN()+playH()*rr(0.2,0.8),ph:0})}}
function levelClear(){if(state==='clear'||state==='win')return;boss=null;levelsDone[lv]=1;if(unlockLv<Math.min(5,lv+2)){unlockLv=Math.min(5,lv+2);LS.set('unlock',unlockLv)}
  if(score>best){best=score;LS.set('best',best)}
  if(lv===4){finish();return}state='clear';stT=0;AUD.SFX.fanfare();AUD.setTheme('win');setTimeout(()=>say('clear',2),300)}
function finish(){state='win';stT=0;boss=null;objs=[];bul=[];warns=[];AUD.setTheme('win');AUD.SFX.fanfare();AUD.SFX.cheer();setTimeout(()=>say('saved',3),500);confetti(120);
  if(score>best){best=score;LS.set('best',best)}unlockLv=5;LS.set('unlock',5);
  const stars=hitsTaken<=6?3:hitsTaken<=14?2:1;const sec=Math.round(runTime);endStats={stars,honey,pops,score,time:Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0'),hits:hitsTaken}}
function respawn(){hearts=STARTH;bee.inv=2.6;objs=objs.filter(o=>o.k==='honey'||o.k==='jar');bul=[];warns=[];shots=[];state='play';stT=0;
  if(cp.boss&&boss){const def=BOSS[boss.k];boss.sub='idle';boss.st2=0;boss.paw=0;if(boss.k==='gulls')for(const g of boss.g)if(g.hp>0){g.st='ret';g.t=0;g.x=W+80}}
  else{dist=cp.dist;evI=events.findIndex(e=>e.at>dist);if(evI<0)evI=events.length;phase='run';boss=null;objs=[]}
  bee.y=bee.ty=(YMIN()+YMAX())/2;banner={s:'GO, BUZZSON!',t:0}}
// ---------- main update ----------
function update(dt){T+=dt;stT+=dt;shake=Math.max(0,shake-dt*30);
  if(state==='title'){scroll+=40*dt;return}
  if(state==='win'){scroll+=30*dt;if(R()<dt*1.5)confetti(8);updParts(dt);return}
  if(paused)return;
  const playing=state==='play';spd=phase==='run'?L.speed:L.speed*0.45;scroll+=spd*dt;if(playing)runTime+=dt;
  if(state==='card'&&stT>2.8)startPlay();
  if(state==='oops'&&stT>2.6)respawn();
  if(state==='clear'&&stT>4.2)startLevel(lv+1);
  // bee movement (smooth follow of the drag target) + keyboard
  const ky=(keys.ArrowDown||keys.KeyS?1:0)-(keys.ArrowUp||keys.KeyW?1:0);if(ky)bee.ty=clamp(bee.ty+ky*460*dt,YMIN(),YMAX());
  bee.ty=clamp(bee.ty,YMIN(),YMAX());bee.x=BX();const dy=bee.ty-bee.y;const mv=clamp(dy*Math.min(1,dt*14),-900*dt,900*dt);bee.y+=mv;bee.tilt=lerp(bee.tilt,clamp(mv/dt/1600,-0.3,0.3),dt*10);bee.inv=Math.max(0,bee.inv-dt);
  if(triple>0)triple=Math.max(0,triple-dt);
  // spawn
  if(playing&&phase==='run'){dist+=spd*dt;while(evI<events.length&&events[evI].at<=dist){const e=events[evI++];spawn(e)}
    if(dist>=LEN){phase='wait';waitT=0}}
  if(phase==='wait'){waitT+=dt;if(waitT>2.4&&!objs.some(o=>o.k==='post'&&o.x>-40))spawnBoss()}
  if(boss)bossUpdate(dt);
  // shooting
  shotT-=dt;if(playing&&firing()&&shotT<=0&&!(boss&&boss.st==='down')){shotT=0.2;const y=bee.y+4,x=bee.x+30;shots.push({x,y,vy:0});if(triple>0){shots.push({x,y,vy:-150});shots.push({x,y,vy:150})}AUD.SFX.shoot()}
  for(const s of shots){s.x+=640*dt;s.y+=s.vy*dt}
  // objects
  const bx=bee.x,by=bee.y;
  for(const o of objs){o.x-=spd*dt;if(o.vx)o.x+=o.vx*dt;
    if(o.k==='ball'){o.ph+=dt*2.2;const g=GY()-o.r;o.y=g-Math.abs(Math.sin(o.ph))*(g-o.apex);o.rot-=dt*4}
    else if(o.k==='flyer'){o.ph+=dt;o.y=o.by+Math.sin(o.ph*3)*10}
    else if(o.k==='wasp'){o.ph+=dt*2.2;if(lv>=2&&o.x>bx+60)o.by+=clamp(by-o.by,-1,1)*(10+lv*6)*dt;o.y=o.by+Math.sin(o.ph)*o.amp}
    else if(o.k==='mosq'){o.ph+=dt*5;o.y=o.by+Math.sin(o.ph)*26+Math.sin(o.ph*0.37)*30}
    else if(o.k==='beetle'){o.ph+=dt;o.y=o.by+Math.sin(o.ph*1.5)*20;o.ft-=dt;if(o.ft<0&&o.x<W-20&&o.x>bx+120&&playing){o.ft=2.2;const a=Math.atan2(by-o.y,bx-o.x);bul.push({k:'seed',x:o.x-16,y:o.y,vx:Math.cos(a)*150,vy:Math.sin(a)*150,r:8,ay:0})}}
    else if(o.k==='pow'){o.ph+=dt;o.y+=Math.sin(o.ph*3)*20*dt}
    if(o.magnet){const d=Math.hypot(bx-o.x,by-o.y);o.x+=(bx-o.x)/d*420*dt;o.y+=(by-o.y)/d*420*dt}
    // hits
    if(o.dead||!playing)continue;
    if(o.k==='honey'||o.k==='jar'||o.k==='pow'){if(Math.hypot(o.x-bx,o.y-by)<(o.k==='pow'?36:30)){o.dead=1;collect(o)}continue}
    if(o.k==='cp'){if(o.x<bx&&!o.done){o.done=1;cp={dist:LEN*0.5};AUD.SFX.check();say('check',2);float('CHECKPOINT!',bx+40,by-40,'#fff');burst(o.x,o.y-150,16,['#ffd23f','#fff','#ff80ab'],200)}continue}
    if(o.k==='post'){if(circRect(bx,by,BEE_R,o.x-20,o.y0+(o.top?0:8),40,o.y1-o.y0-8))hurt();continue}
    if(Math.hypot(o.x-bx,o.y-by)<(o.r||16)*0.8+BEE_R)hurt()}
  // stingers vs enemies / boss / shootable bullets
  for(const s of shots){if(s.dead)continue;
    for(const o of objs){if(o.dead||!o.hp)continue;if(Math.abs(o.x-s.x)<o.r+8&&Math.abs(o.y-s.y)<o.r+8){s.dead=1;o.hp--;if(o.hp<=0){o.dead=1;pops++;score+=o.k==='beetle'?50:25;AUD.SFX.pop();burst(o.x,o.y,10,['#fff','#ffd23f','#ff8a26'],170);float('+'+(o.k==='beetle'?50:25),o.x,o.y-20,'#fff');if(pops%6===0)praise()}else AUD.SFX.zap();break}}
    if(s.dead)continue;
    for(const u of bul){if(u.shoot&&!u.dead&&Math.hypot(u.x-s.x,u.y-s.y)<u.r+8){s.dead=1;u.hp--;if(u.hp<=0){u.dead=1;pops++;score+=25;AUD.SFX.pop();burst(u.x,u.y,10,['#fff','#90a4ae','#4dd0e1'],170)}break}}
    if(s.dead||!boss||boss.st!=='fight')continue;const def=BOSS[boss.k];
    if(def.hitPart){if(def.hitPart(boss,s.x,s.y)){s.dead=1;score+=5;AUD.SFX.bossHit()}}
    else for(const r of def.rects(boss))if(circRect(s.x,s.y,6,r[0],r[1],r[2],r[3])){s.dead=1;boss.hp--;boss.flash=0.07;score+=5;AUD.SFX.bossHit();if(R()<0.4)burst(s.x,s.y,3,['#fff','#ffd23f'],120,3);break}}
  shots=shots.filter(s=>!s.dead&&s.x<W+30&&s.y>-20&&s.y<H+20);
  // boss bullets
  for(const u of bul){u.x+=u.vx*dt;u.y+=u.vy*dt;u.vy+=(u.ay||0)*dt;if(u.rot!=null)u.rot+=dt*6;if(u.wob!=null){u.wob+=dt*3;u.y+=Math.sin(u.wob)*20*dt;u.r=Math.min(30,u.r+dt*3)}
    if(u.k==='drone'){u.vy=clamp((by-u.y)*1.2,-80,80)}
    if(u.bounce&&u.y>GY()-u.r){u.y=GY()-u.r;u.vy=-Math.abs(u.vy)*0.82}
    if(u.k==='pot'&&u.y>GY()-8){u.dead=1;burst(u.x,GY()-6,10,['#ffb300','#ffe082'],140)}
    if(!u.dead&&playing&&Math.hypot(u.x-bx,u.y-by)<u.r*0.8+BEE_R){if(u.k!=='drone')u.dead=1;hurt()}}
  bul=bul.filter(u=>!u.dead&&u.x>-60&&u.x<W+160&&u.y<H+60&&u.y>-200);
  for(const w of warns)w.t+=dt;warns=warns.filter(w=>w.t<w.dur+0.15);
  objs=objs.filter(o=>!o.dead&&o.x>-120);
  if(banner){banner.t+=dt;if(banner.t>2.6)banner=null}
  updParts(dt)}
function updParts(dt){for(const p of parts){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.conf){p.rot+=dt*5;p.vx+=Math.sin(p.t*4)*30*dt}else p.vy+=200*dt}parts=parts.filter(p=>p.t<p.life);
  for(const f of floats){f.t+=dt;f.y-=40*dt}floats=floats.filter(f=>f.t<1.2)}

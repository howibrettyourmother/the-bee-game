// ================= rendering, HUD, screens, loop, test hooks =================
let UI=[],HUDB=[];
function btn(id,x,y,w,h,fn){UI.push({id,x,y,w,h,fn})}
function hbtn(id,x,y,w,h,fn){HUDB.push({id,x,y,w,h,fn})}
function uiTap(p){for(const b of UI)if(inR(p,b)){AUD.SFX.click();b.fn();return}
  if(state==='card')startPlay();else if(state==='clear'&&stT>1.2)startLevel(lv+1);else if(state==='oops'&&stT>1.2)respawn();else if(state==='win'){AUD.SFX.firework();burst(p.x,p.y,30,['#ffd23f','#ff5d8f','#4fc3f7','#fff','#81c784'],260,6)}}
function uiKey(){if(state==='title')newGame(selLv);else if(state==='card')startPlay();else if(state==='clear'&&stT>1.2)startLevel(lv+1);else if(state==='oops'&&stT>1.2)respawn()}
function goTitle(){state='title';paused=false;boss=null;objs=[];bul=[];warns=[];shots=[];parts=[];AUD.setTheme('title');selLv=Math.min(selLv,unlockLv-1)}
function setAuto(v){autoFire=v;LS.set('auto',v?'1':'0')}
// ---------- world drawing ----------
function drawObj(o){const th=L.theme;
  switch(o.k){
    case 'post':drawPost(th,o.x,o.y0,o.y1,o.top);break;
    case 'ball':{const s=spr('ball'+th,44,44,BALLS[th]);X.save();X.translate(o.x,o.y);X.rotate(o.rot);blit(s,0,0);X.restore();break}
    case 'flyer':blit(spr('fly'+th,90,44,FLYERS[th]),o.x,o.y);break;
    case 'wasp':wings(o.x+4,o.y+2,T+o.ph,0.9,'#ffe0cc');blit(spr('wasp',70,50,waspArt),o.x,o.y);break;
    case 'mosq':wings(o.x+6,o.y+8,T*1.3,0.6);blit(spr('mosq',70,56,mosqArt),o.x,o.y);break;
    case 'beetle':blit(spr('beetle',76,56,beetleArt),o.x,o.y);break;
    case 'honey':blit(spr('honey',28,30,honeyArt),o.x,o.y+Math.sin(T*4+o.x*0.05)*3);break;
    case 'jar':blit(spr('jar',34,38,jarArt),o.x,o.y);break;
    case 'pow':{const s=spr('pow'+o.p,48,48,()=>bubbleArt(o.p));blit(s,o.x,o.y,1+Math.sin(T*6)*0.06);break}
    case 'cp':{const g=GY();X.fillStyle='#2e7d32';X.fillRect(o.x-3,g-150,6,150);ell(o.x-14,g-60,14,6,'#43a047',-0.5);for(let i=0;i<12;i++){const a=i*TAU/12+T;ell(o.x+Math.cos(a)*22,g-160+Math.sin(a)*22,11,6,'#ffd23f',a)}circ(o.x,g-160,15,'#6d4c41');
      rrect(o.x+8,g-128,64,24,8);X.fillStyle=o.done?'#43a047':'#ff5d8f';X.fill();txt(o.done?'✓ SAVED':'CHECK',o.x+40,g-116,12,'#fff');break}}}
function drawBul(u){switch(u.k){
  case 'stink':X.globalAlpha=0.85;circ(u.x,u.y,u.r,'#9ccc65');circ(u.x-u.r*0.5,u.y-u.r*0.3,u.r*0.6,'#aed581');circ(u.x+u.r*0.45,u.y+u.r*0.2,u.r*0.55,'#8bc34a');X.globalAlpha=1;circ(u.x-5,u.y-3,2.4,'#33691e');circ(u.x+5,u.y-3,2.4,'#33691e');break;
  case 'acorn':ell(u.x,u.y+2,10,12,'#a1662f');ell(u.x,u.y-7,12,6,'#6d4c41');break;
  case 'bolt':circ(u.x,u.y,u.r+4,'rgba(77,208,225,0.35)');circ(u.x,u.y,u.r,'#4dd0e1');circ(u.x-3,u.y-3,3,'#e0f7fa');break;
  case 'drone':rrect(u.x-14,u.y-11,28,22,8);X.fillStyle='#b0bec5';X.fill();strokeC('#455a64',2);X.fillStyle='#4dd0e1';X.fillRect(u.x-9,u.y-5,7,5);X.fillRect(u.x+2,u.y-5,7,5);X.fillStyle='#90a4ae';X.fillRect(u.x-16,u.y-16,32,3);break;
  case 'fry':X.save();X.translate(u.x,u.y);X.rotate(u.rot);X.fillStyle='#ffd54f';X.fillRect(-12,-3,24,6);X.fillStyle='#ffb300';X.fillRect(-12,-3,24,2);X.restore();break;
  case 'pot':X.save();X.translate(u.x,u.y);X.rotate(u.rot*0.5);blit(spr('jar',34,38,jarArt),0,0,1.05);X.restore();break;
  case 'cone':{const s=spr('ballfalls',44,44,BALLS.falls);X.save();X.translate(u.x,u.y);X.rotate(T*5);blit(s,0,0,0.8);X.restore();break}
  case 'seed':ell(u.x,u.y,8,6,'#795548');ell(u.x-2,u.y-2,3,2,'#a1887f');break}}
function drawWarn(w){const a=0.18+0.14*Math.sin(w.t*24);X.fillStyle=`rgba(255,40,40,${a})`;X.fillRect(0,w.y-w.h/2,W,w.h);X.fillStyle='rgba(255,255,255,0.7)';X.fillRect(0,w.y-w.h/2,W,2);X.fillRect(0,w.y+w.h/2-2,W,2);
  if(Math.sin(w.t*20)>-0.3)for(const x of [W*0.5,W-40]){poly([x,w.y-16,x+16,w.y+12,x-16,w.y+12],'#ffd23f');txt('!',x,w.y+3,16,'#c62828')}}
function drawWorld(){drawBackdrop(lv);
  for(const o of objs)if(o.k==='post'||o.k==='cp')drawObj(o);
  for(const o of objs)if(o.k!=='post'&&o.k!=='cp')drawObj(o);
  for(const w of warns)drawWarn(w);
  if(boss)BOSS[boss.k].draw(boss);
  for(const u of bul)drawBul(u);
  const st=spr('sting',26,10,stingArt);for(const s of shots)blit(st,s.x,s.y);
  if(state!=='title'){const blink=bee.inv>0&&Math.sin(T*30)>0&&state==='play';if(!blink){drawBee(bee.x,bee.y,{rot:bee.tilt});
    if(shield){X.save();X.translate(bee.x,bee.y);X.rotate(T*1.5);for(let i=0;i<8;i++){const a=i*TAU/8;ell(Math.cos(a)*36,Math.sin(a)*36,9,6,i%2?'#ff80ab':'#f48fb1',a)}X.restore();X.beginPath();X.arc(bee.x,bee.y,36,0,TAU);strokeC('rgba(255,255,255,0.5)',2)}
    if(triple>0&&triple<3&&Math.sin(T*16)>0)circ(bee.x+30,bee.y+4,5,'#fff')}}
  drawParts()}
function drawParts(){for(const p of parts){const k=1-p.t/p.life;X.globalAlpha=Math.min(1,k*2);if(p.conf){X.save();X.translate(p.x,p.y);X.rotate(p.rot);X.fillStyle=p.c;X.fillRect(-p.r,-p.r/2,p.r*2,p.r);X.restore()}else circ(p.x,p.y,p.r*(0.4+0.6*k),p.c)}X.globalAlpha=1;
  for(const f of floats){X.globalAlpha=1-Math.max(0,f.t-0.7)/0.5;txt(f.s,f.x,f.y,18,f.c,{st:'rgba(0,0,0,0.55)',sw:4});X.globalAlpha=1}}
// ---------- HUD (always below the status bar / notch) ----------
function drawHUD(){HUDB=[];const t=TOP+8;rrect(8+INL,t,W-16-INL-INR,46,23);X.fillStyle='rgba(255,255,255,0.85)';X.fill();
  for(let i=0;i<MAXH;i++){const on=i<hearts;heartP(30+INL+i*25,t+25,10.5,on?'#ff3b6b':'rgba(0,0,0,0.13)')}
  const hx=30+INL+MAXH*25+6;blit(spr('jar',34,38,jarArt),hx,t+22,0.7);txt(String(score),hx+16,t+24,22,'#5d3a00',{a:'left'});
  if(triple>0){blit(spr('powtriple',48,48,()=>bubbleArt('triple')),W-INR-130,t+23,0.6)}if(shield){blit(spr('powshield',48,48,()=>bubbleArt('shield')),W-INR-156,t+23,0.6)}
  const mx=W-INR-54;circ(mx+18,t+23,19,'#ffd23f');if(AUD.muted){X.beginPath();X.moveTo(mx+8,t+13);X.lineTo(mx+28,t+33);strokeC('#5d3a00',3)}poly([mx+9,t+18,mx+15,t+18,mx+22,t+11,mx+22,t+35,mx+15,t+28,mx+9,t+28],'#5d3a00');
  hbtn('mute',mx-4,t-4,44,54,()=>AUD.setMuted(!AUD.muted));
  const px=W-INR-100;circ(px+18,t+23,19,'#ffd23f');X.fillStyle='#5d3a00';X.fillRect(px+11,t+14,5,18);X.fillRect(px+20,t+14,5,18);hbtn('pause',px-4,t-4,44,54,()=>{paused=true;AUD.SFX.click()});
  const by=t+54;
  if(boss){const w=W-40-INL-INR,x=20+INL;rrect(x,by+12,w,14,7);X.fillStyle='rgba(0,0,0,0.35)';X.fill();const k=boss.hp/boss.max;if(k>0){rrect(x,by+12,Math.max(14,w*k),14,7);X.fillStyle=k>0.5?'#ff5d8f':k>0.25?'#ff8a26':'#e53935';X.fill()}
    txt(boss.name,W/2,by+4,13,'#fff',{st:'rgba(0,0,0,0.55)',sw:4})}
  else{const x=30+INL,w=W-60-INL-INR,k=clamp(dist/LEN,0,1);rrect(x,by+8,w,8,4);X.fillStyle='rgba(255,255,255,0.65)';X.fill();rrect(x,by+8,Math.max(8,w*k),8,4);X.fillStyle='#ffb300';X.fill();
    circ(x+w*0.5,by+12,6,cp.dist>0?'#43a047':'#fff');circ(x+w,by+12,9,'#e53935');txt('!',x+w,by+13,12,'#fff');drawBee(x+w*k,by+10,{s:0.42,key:''})}
  if(!autoFire&&state==='play'){const f=fireBtn(),dn=firing();circ(f.x,f.y,f.r,dn?'rgba(255,138,38,0.9)':'rgba(255,138,38,0.6)');X.beginPath();X.arc(f.x,f.y,f.r,0,TAU);strokeC('#fff',4);
    X.save();X.translate(f.x,f.y-6);X.scale(2,2);stingArt();X.restore();txt('FIRE',f.x,f.y+22,14,'#fff',{st:'#bf360c',sw:4})}}
// ---------- overlays ----------
function panel(w,h,y,c){const x=W/2-w/2;rrect(x,y,w,h,28);X.fillStyle=c||'rgba(255,253,240,0.96)';X.fill();X.lineWidth=6;X.strokeStyle='#ffb300';X.stroke();return x}
function bigBtn(id,x,y,w,h,label,c,fn,size){rrect(x,y,w,h,h/2);X.fillStyle=c;X.fill();X.lineWidth=5;X.strokeStyle='#fff';X.stroke();txt(label,x+w/2,y+h/2+2,size||26,'#fff',{st:'rgba(0,0,0,0.25)',sw:5});btn(id,x,y,w,h,fn)}
function wrapTxt(s,x,y,size,fill,maxW,o){X.font='800 '+size+'px '+FONT;const words=s.split(' ');let line='',lines=[];for(const w of words){const t=line?line+' '+w:w;if(X.measureText(t).width>maxW&&line){lines.push(line);line=w}else line=t}lines.push(line);
  lines.forEach((l,i)=>txt(l,x,y+i*size*1.1,size,fill,o));return lines.length}
function drawCard(){const k=back(stT*2.2),y=Math.max(TOP+110,H*0.28);X.save();X.translate(W/2,y+110);X.scale(k,k);X.translate(-W/2,-(y+110));
  const x=panel(Math.min(340,W-30),220,y);txt('LEVEL '+(lv+1),W/2,y+38,30,'#ff8a26',{st:'#fff',sw:6});wrapTxt(L.n,W/2,y+82,28,'#5d3a00',Math.min(310,W-50));
  txt(L.sub,W/2,y+150,16,'#8d6e63');txt('Tap to fly!',W/2,y+190,18,'#43a047');X.restore()}
function drawBanner(){const b=banner;const k=back(b.t*3),out=b.t>2.2?ease((b.t-2.2)*3):0;X.save();X.globalAlpha=1-out;X.translate(W/2,H*0.36);X.scale(k,k);
  if(b.boss){rrect(-170,-52,340,104,26);X.fillStyle='rgba(255,255,255,0.94)';X.fill();X.lineWidth=6;X.strokeStyle='#e53935';X.stroke();txt('BOSS!',0,-22,22,'#e53935');txt(b.s,0,16,b.s.length>14?24:30,'#5d3a00')}
  else txt(b.s,0,0,34,'#ffd23f',{st:'#5d3a00',sw:7});X.restore()}
function drawOops(){X.fillStyle='rgba(30,20,60,0.35)';X.fillRect(0,0,W,H);const y=Math.max(TOP+120,H*0.3);panel(Math.min(330,W-30),210,y);txt('OOPSIE!',W/2,y+40,34,'#ff5d8f',{st:'#fff',sw:6});
  drawBee(W/2,y+100,{s:1.2,rot:Math.sin(T*6)*0.3});for(let i=0;i<3;i++){const a=T*4+i*TAU/3;star5(W/2+Math.cos(a)*40,y+70+Math.sin(a)*10,7,'#ffd23f')}
  wrapTxt(cp.dist>0||cp.boss?'Back to the checkpoint with full hearts!':'Back to the start of the level with full hearts!',W/2,y+158,17,'#5d3a00',Math.min(300,W-60))}
function drawClear(){X.fillStyle='rgba(30,20,60,0.3)';X.fillRect(0,0,W,H);const k=back(stT*2),y=Math.max(TOP+100,H*0.24);X.save();X.translate(W/2,y+140);X.scale(k,k);X.translate(-W/2,-(y+140));
  panel(Math.min(340,W-30),280,y);txt('LEVEL CLEAR!',W/2,y+40,32,'#43a047',{st:'#fff',sw:6});wrapTxt(L.n,W/2,y+82,20,'#5d3a00',300);
  blit(spr('jar',34,38,jarArt),W/2-50,y+130);txt(String(score),W/2-28,y+132,26,'#5d3a00',{a:'left'});
  const nx=LEVELS[lv+1];txt('NEXT:',W/2,y+180,15,'#8d6e63');wrapTxt(nx.n,W/2,y+204,20,'#ff8a26',300);if(stT>1.2)txt('Tap to go!',W/2,y+250,17,'#43a047');X.restore();if(R()<0.1)confetti(3)}
function drawPause(){UI=[];X.fillStyle='rgba(30,20,60,0.5)';X.fillRect(0,0,W,H);const y=Math.max(TOP+100,H*0.26),pw=Math.min(320,W-30);const x=panel(pw,300,y);txt('PAUSED',W/2,y+40,30,'#ff8a26',{st:'#fff',sw:6});
  bigBtn('resume',W/2-110,y+72,220,64,'RESUME ▶','#43a047',()=>{paused=false});
  bigBtn('auto2',W/2-110,y+148,220,52,'AUTO-FIRE: '+(autoFire?'ON':'OFF'),autoFire?'#ff8a26':'#9e9e9e',()=>setAuto(!autoFire),18);
  bigBtn('home',W/2-110,y+212,220,52,'HOME','#4fc3f7',goTitle,20)}
// ---------- title ----------
function lockIcon(x,y){X.beginPath();X.arc(x,y-5,7,Math.PI,TAU);strokeC('#fff',3);rrect(x-9,y-5,18,15,3);X.fillStyle='#fff';X.fill();circ(x,y+2,2,'#9e9e9e')}
function drawTitle(){UI=[];lv=selLv;L=LEVELS[lv];drawBackdrop(selLv);X.fillStyle='rgba(255,255,255,0.18)';X.fillRect(0,0,W,H);
  const ly=TOP+66;X.save();X.translate(W/2,ly);X.rotate(-0.04+Math.sin(T*1.4)*0.015);txt('THE',0,-30,24,'#fff',{st:'#5d3a00',sw:6});txt('BEE GAME',0,12,Math.min(64,W*0.16),'#ffd23f',{st:'#5d3a00',sw:10});X.restore();
  txt('starring ALEXANDER BUZZSON',W/2,ly+60,17,'#fff',{st:'#5d3a00',sw:5});
  const by=lerp(ly+150,H*0.36,0.5)+Math.sin(T*2.4)*8;drawBee(W/2,by,{s:Math.min(2.4,H/300),rot:Math.sin(T*1.7)*0.08});
  for(let i=0;i<5;i++){const a=T*1.2+i*TAU/5;blit(spr('honey',28,30,honeyArt),W/2+Math.cos(a)*120,by+Math.sin(a)*34)}
  // level select (unlocked levels saved in localStorage)
  const sy=H*0.58,gap=Math.min(70,(W-40)/5),x0=W/2-gap*2;txt('PICK A LEVEL',W/2,sy-46,16,'#fff',{st:'#5d3a00',sw:5});
  for(let i=0;i<5;i++){const x=x0+i*gap,ok=i<unlockLv,sel=i===selLv,r=sel?29:25;circ(x,sy,r+4,sel?'#fff':'rgba(255,255,255,0.6)');circ(x,sy,r,ok?['#ff8a26','#43a047','#7e57c2','#29b6f6','#8d6e63'][i]:'#9e9e9e');
    if(ok)txt(String(i+1),x,sy+2,26,'#fff',{st:'rgba(0,0,0,0.3)',sw:4});else lockIcon(x,sy);
    btn('lv'+(i+1),x-gap/2,sy-34,gap,68,()=>{if(ok){selLv=i;AUD.SFX.boing()}else AUD.SFX.zap()})}
  wrapTxt(LEVELS[selLv].n,W/2,sy+48,19,'#fff',W-30,{st:'#5d3a00',sw:5});
  const py=Math.min(H-BOT-150,sy+80),pulse=1+Math.sin(T*5)*0.04;X.save();X.translate(W/2,py+38);X.scale(pulse,pulse);X.translate(-W/2,-(py+38));bigBtn('play',W/2-110,py,220,76,'PLAY ▶','#43a047',()=>newGame(selLv),38);X.restore();
  const bb=H-BOT-46;bigBtn('auto',14+INL,bb-24,170,48,'AUTO-FIRE: '+(autoFire?'ON':'OFF'),autoFire?'#ff8a26':'#9e9e9e',()=>setAuto(!autoFire),16);
  const mx=W-INR-40;circ(mx,bb,24,'#ffd23f');poly([mx-10,bb-5,mx-4,bb-5,mx+3,bb-12,mx+3,bb+12,mx-4,bb+5,mx-10,bb+5],'#5d3a00');if(AUD.muted){X.beginPath();X.moveTo(mx-14,bb-14);X.lineTo(mx+14,bb+14);strokeC('#c62828',4)}btn('mute',mx-28,bb-28,56,56,()=>AUD.setMuted(!AUD.muted));
  if(best)txt('BEST '+best,W-INR-100,bb,16,'#fff',{st:'#5d3a00',sw:4,a:'right'})}
// ---------- victory ----------
function drawHive(x,y,s){X.save();X.translate(x,y);X.scale(s,s);X.fillStyle='#6d4c41';X.fillRect(-4,-90,8,20);for(let i=0;i<5;i++){const w=50-Math.abs(i-2)*10;ell(0,-62+i*22,w,13,i%2?'#ffb300':'#ffc94a')}ell(0,-10,12,10,'#5d3a00');X.restore()}
function drawWin(){UI=[];lv=4;L=LEVELS[4];drawBackdrop(4);X.fillStyle='rgba(255,240,200,0.25)';X.fillRect(0,0,W,H);
  const y0=TOP+40;txt('ALEXANDER',W/2,y0+10,Math.min(44,W*0.11),'#ffd23f',{st:'#5d3a00',sw:8});txt('BUZZSON',W/2,y0+54,Math.min(44,W*0.11),'#ffd23f',{st:'#5d3a00',sw:8});
  txt('SAVED THE HIVE!',W/2,y0+100,Math.min(32,W*0.08),'#fff',{st:'#e65100',sw:7});
  const sy=Math.min(y0+330,H*0.52),bs=Math.min(0.78,H/1050);X.save();X.translate(W*0.68,sy);X.scale(bs,bs);X.translate(-W*0.68,-GY());BOSS.bear.draw({x:W*0.68,jy:0,paw:0,down:1,flash:0,sub:'idle'});X.restore();
  drawHive(W*0.2,sy-34,1);drawBee(W*0.36,sy-120+Math.sin(T*3)*10,{s:1.4,rot:Math.sin(T*2)*0.1});
  const e=endStats||{stars:3,honey,pops,score,time:'0:00'};const py=sy+20,pw=Math.min(340,W-30);panel(pw,Math.min(250,H-BOT-py-20),py,'rgba(255,253,240,0.95)');
  for(let i=0;i<3;i++){const on=i<e.stars&&stT>0.5+i*0.3;star5(W/2+(i-1)*56,py+36,24,on?'#ffd23f':'#ddd')}
  const rows=[['Honey',e.honey],['Pests popped',e.pops],['Score',e.score],['Time',e.time]];rows.forEach((r,i)=>{txt(r[0],W/2-pw/2+30,py+78+i*28,17,'#5d3a00',{a:'left'});txt(String(r[1]),W/2+pw/2-30,py+78+i*28,19,'#e65100',{a:'right'})});
  const bb=Math.min(H-BOT-80,py+200);bigBtn('again',W/2-150,bb,150,56,'AGAIN ↻','#43a047',()=>newGame(0),22);bigBtn('home',W/2+10,bb,140,56,'HOME','#4fc3f7',goTitle,22)}
// ---------- render ----------
function render(){X.setTransform(RS,0,0,RS,0,0);
  if(state==='title'){drawTitle();drawParts();return}
  if(state==='win'){drawWin();drawParts();return}
  UI=[];X.save();if(shake>0)X.translate(rr(-shake,shake)*0.6,rr(-shake,shake)*0.6);drawWorld();X.restore();
  drawHUD();if(banner)drawBanner();
  if(state==='card')drawCard();else if(state==='oops')drawOops();else if(state==='clear')drawClear();
  if(paused)drawPause();
  if(PERF_OVL){const p=perfStats();txt(`${p.fps}fps work ${p.avg}ms p95 ${p.p95}ms q${QUAL}`,W/2,H-BOT-12,12,'#fff',{st:'#000',sw:3})}}
// ---------- loop + frame-time stats + adaptive quality ----------
const PERF_OVL=/[?&]perf=1/.test(Q),FIXQ=/[?&]q=fixed/.test(Q);const workA=[],rafA=[];let last=performance.now(),acc=0,qWin=[];
function perfStats(){const s=a=>a.slice().sort((x,y)=>x-y);const w=s(workA),r=s(rafA);const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;const pc=(a,p)=>a.length?a[Math.min(a.length-1,(a.length*p)|0)]:0;
  return{n:w.length,avg:+avg(w).toFixed(2),p95:+pc(w,0.95).toFixed(2),max:+pc(w,1).toFixed(2),raf:+avg(r).toFixed(2),rafP95:+pc(r,0.95).toFixed(2),fps:Math.round(1000/(avg(r)||16.7)),q:QUAL}}
function frame(now){const dt=Math.min(0.05,Math.max(0,(now-last)/1000));rafA.push(now-last);if(rafA.length>600)rafA.shift();last=now;acc+=dt*TS;const STEP=1/120;let n=0;const t0=performance.now();
  try{if(DEBUG&&bot.on)botThink();while(acc>=STEP&&n<120){if(DEBUG&&bot.on&&n%4===0)botThink();update(STEP);acc-=STEP;n++}if(n>=120)acc=0;render()}catch(e){console.error(e&&e.stack||e)}
  const wt=performance.now()-t0;if(TS===1){workA.push(wt);if(workA.length>600)workA.shift()}
  // adaptive quality for older iPhones: if frames are consistently heavy, render the backing store at a lower resolution
  if(!FIXQ&&TS===1&&state==='play'&&!paused){qWin.push([wt,dt*1000]);if(qWin.length>=150){const a=qWin.reduce((x,y)=>x+y[0],0)/qWin.length,f=qWin.reduce((x,y)=>x+y[1],0)/qWin.length;qWin=[];
    // heavy JS, or frames arriving slower than ~48fps (GPU/raster bound): step the resolution down (max two steps)
    if((a>10||f>21)&&qualI<QUALS.length-1){qualI++;QUAL=QUALS[qualI];resize()}}}
  requestAnimationFrame(frame)}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='play')paused=true});
// ---------- in-page "kid bot" (debug only): drives the same drag target a finger would ----------
const bot={on:false,t:0,kid:false,last:0};
function botThink(){if(state==='card'){startPlay();return}if(state!=='play'||paused)return;
  // kid mode: slower reactions (~4 decisions/s), shorter look-ahead, sloppy aim and the odd moment of not paying attention
  if(bot.kid){if(T-bot.last<0.24)return;bot.last=T;if(R()<0.12)return}const LA=bot.kid?0.7:1.0;const bx=bee.x,y0=YMIN(),y1=YMAX();let bestY=bee.ty,bestC=1e9;const def=boss&&BOSS[boss.k];
  const brs=boss&&boss.st==='fight'?def.rects(boss):[];
  for(let y=y0;y<=y1;y+=8){let c=Math.abs(y-bee.y)*0.04;
    for(const o of objs){if(o.dead)continue;const tt=(o.x-bx)/Math.max(40,spd-(o.vx||0));
      if(o.k==='post'){if(tt>-0.35&&tt<LA&&y>o.y0-BEE_R-14&&y<o.y1+BEE_R+14)c+=1500;continue}
      if(o.k==='honey'||o.k==='jar'||o.k==='pow'){if(tt>0&&tt<1&&Math.abs(y-o.y)<22)c-=o.k==='pow'?120:30;continue}
      if(o.k==='cp')continue;if(tt<-0.3||tt>LA+0.1)continue;
      let lo=o.y-o.r,hi=o.y+o.r;if(o.k==='ball'){lo=o.apex-o.r;hi=GY()}else if(o.k==='wasp'){lo=o.by-o.amp-o.r;hi=o.by+o.amp+o.r}else if(o.k==='mosq'){lo=o.by-60;hi=o.by+60}else if(o.k==='beetle'){lo=o.by-24-o.r;hi=o.by+24+o.r}
      if(y>lo-BEE_R-12&&y<hi+BEE_R+12)c+=700*(1.2-Math.max(0,tt));if(o.hp&&tt>0.2&&Math.abs(y-o.y)<14)c-=15}
    for(const u of bul){for(let tt=0;tt<=LA;tt+=0.1){const ux=u.x+u.vx*tt,uy=u.y+u.vy*tt+0.5*(u.ay||0)*tt*tt;if(Math.abs(ux-bx)<u.r+BEE_R+14&&Math.abs(uy-y)<u.r+BEE_R+16){c+=900*(1.1-tt);break}}}
    for(const w of warns)if(Math.abs(y-w.y)<w.h/2+BEE_R+10)c+=3000;
    if(def&&boss.st==='fight'){if(def.hurtOn(boss))for(const r of brs)if(y>r[1]-BEE_R-14&&y<r[1]+r[3]+BEE_R+14&&r[0]<bx+60)c+=2500;
      let inside=false,dmin=1e9;for(const r of brs){if(y>r[1]+6&&y<r[1]+r[3]-6)inside=true;dmin=Math.min(dmin,Math.abs(y-(r[1]+r[3]/2)))}c+=inside?-80:dmin*0.15}
    if(c<bestC){bestC=c;bestY=y}}
  bee.ty=bot.kid?clamp(bestY+rr(-22,22),YMIN(),YMAX()):bestY}
AUD.setTheme('title');requestAnimationFrame(frame);
if(OGMODE){selLv=0}
if(DEBUG)window.__B={get state(){return state},get lv(){return lv},get bee(){return bee},get hearts(){return hearts},set hearts(v){hearts=v},get score(){return score},get honey(){return honey},get pops(){return pops},get dist(){return dist},set dist(v){dist=v},get LEN(){return LEN},
  get phase(){return phase},get boss(){return boss},get objs(){return objs},get bul(){return bul},get warns(){return warns},get shots(){return shots},get cp(){return cp},get events(){return events},get triple(){return triple},get shield(){return shield},get paused(){return paused},
  get hitsTaken(){return hitsTaken},get oopsN(){return oopsN},get endStats(){return endStats},get unlockLv(){return unlockLv},get selLv(){return selLv},get autoFire(){return autoFire},get runTime(){return runTime},get levelsDone(){return levelsDone},
  audio:AUD,newGame,startLevel,startPlay,spawnBoss,levelClear,finish,respawn,goTitle,hurt,set TS(v){TS=v},get TS(){return TS},bot(on,kid){bot.on=on;bot.kid=!!kid},
  give(p){collect({k:'pow',p,x:bee.x,y:bee.y})},skipTo(f){dist=LEN*f;evI=events.findIndex(e=>e.at>dist);if(evI<0)evI=events.length;objs=[]},clear(){objs=[];bul=[];warns=[]},
  bossHp(v){if(boss){if(boss.k==='gulls'){let r=v;for(const g of boss.g){g.hp=Math.min(17,Math.max(0,r));r-=g.hp}}boss.hp=v}},
  perf:perfStats,resetPerf(){workA.length=0;rafA.length=0},get qual(){return QUAL},set qual(i){qualI=i;QUAL=QUALS[i];resize()},
  get ui(){return UI.map(b=>({id:b.id,x:b.x+b.w/2,y:b.y+b.h/2}))},get hud(){return HUDB.map(b=>({id:b.id,x:b.x+b.w/2,y:b.y+b.h/2}))},toClient:(x,y)=>({x:x*SC,y:y*SC}),
  get fire(){return fireBtn()},get YMIN(){return YMIN()},get YMAX(){return YMAX()},get TOP(){return TOP},get GY(){return GY()},get W(){return W},get H(){return H},spawnObj(o){objs.push(o)},spawnBul(u){bul.push(u)}};

// ================= characters & things (cached sprites where possible) =================
const OUT='#3b2a14';
function beeBody(o){// Alexander Buzzson facing right, drawn around (0,0)
  o=o||{};const body=o.body||'#ffd23f',str=o.stripe||'#2b2118';
  // stinger
  poly([-22,-4,-36,1,-22,6],'#3b2a14');
  X.save();X.beginPath();X.ellipse(-2,2,23,18,0,0,TAU);X.fillStyle=body;X.fill();X.clip();X.fillStyle=str;X.fillRect(-13,-20,7,44);X.fillRect(1,-20,7,44);X.restore();
  X.beginPath();X.ellipse(-2,2,23,18,0,0,TAU);strokeC(OUT,2.5);
  // head
  circ(20,-6,14,body);X.beginPath();X.arc(20,-6,14,0,TAU);strokeC(OUT,2.5);
  circ(24,-9,6.5,'#fff');circ(26,-9,3.6,'#1b1b1b');circ(27.3,-10.5,1.3,'#fff');
  ell(19,1,4,2.6,'rgba(255,120,120,0.55)');X.beginPath();X.arc(26,-1,5,0.2,Math.PI-0.6);strokeC(OUT,2);
  // antennae
  X.beginPath();X.moveTo(16,-18);X.quadraticCurveTo(12,-30,6,-31);strokeC(OUT,2);circ(6,-31,3,str);
  X.beginPath();X.moveTo(23,-19);X.quadraticCurveTo(26,-32,32,-33);strokeC(OUT,2);circ(32,-33,3,str);
  // little red cap with an "A"
  if(o.cap!==false){X.beginPath();X.arc(19,-13,12,Math.PI*1.02,Math.PI*1.98);X.closePath();X.fillStyle='#e53935';X.fill();X.fillStyle='#e53935';X.fillRect(19,-15,16,4);circ(18,-18,4.6,'#fff');txt('A',18,-17.6,7,'#e53935')}
  // legs
  X.beginPath();X.moveTo(-6,19);X.lineTo(-9,26);X.moveTo(4,19);X.lineTo(3,26);strokeC(OUT,2.2)}
function wings(x,y,t,s,c){s=s||1;const f=Math.abs(Math.sin(t*38));X.globalAlpha=0.75;ell(x-4*s,y-18*s,9*s,(14-6*f)*s,c||'#e6f6ff',-0.5);ell(x+6*s,y-20*s,8*s,(12-5*f)*s,c||'#d7f0ff',0.35);X.globalAlpha=1}
function drawBee(x,y,o){o=o||{};const s=o.s||1;const B=spr('bee'+(o.key||''),84,74,()=>beeBody(o));
  X.save();X.translate(x,y);X.rotate(o.rot||0);X.scale(s,s);wings(0,0,T,1);blit(B,0,0);X.restore()}
// ---------- enemies ----------
function waspArt(){poly([-20,-3,-31,0,-20,4],'#3b2a14');X.save();X.beginPath();X.ellipse(-2,1,19,14,0,0,TAU);X.fillStyle='#ff8a26';X.fill();X.clip();X.fillStyle='#2b2118';X.fillRect(-12,-16,6,34);X.fillRect(0,-16,6,34);X.restore();
  X.beginPath();X.ellipse(-2,1,19,14,0,0,TAU);strokeC(OUT,2);circ(-20,-6,11,'#ff8a26');X.beginPath();X.arc(-20,-6,11,0,TAU);strokeC(OUT,2);
  circ(-24,-8,5,'#fff');circ(-25.5,-8,2.8,'#111');X.beginPath();X.moveTo(-30,-15);X.lineTo(-19,-12);strokeC(OUT,2.4);X.beginPath();X.arc(-23,1,3.5,Math.PI+0.5,TAU-0.5);strokeC(OUT,1.8)}
function mosqArt(){X.strokeStyle='#555';X.lineWidth=1.6;for(const a of [-0.6,0,0.6]){X.beginPath();X.moveTo(0,4);X.lineTo(-6+a*14,18);X.lineTo(-10+a*18,24);X.stroke()}
  ell(4,0,14,6,'#8d8d9a');ell(-10,-2,8,7,'#9e9eab');circ(-12,-4,3.4,'#fff');circ(-13,-4,1.8,'#c62828');X.beginPath();X.moveTo(-17,-1);X.lineTo(-30,3);strokeC('#555',1.8)}
function beetleArt(){circ(-16,2,9,'#2e3b2e');ell(4,0,20,15,'#3fae4a');X.beginPath();X.moveTo(4,-15);X.lineTo(4,15);strokeC('#1f6b2a',2);circ(-2,-6,3,'#1f6b2a');circ(10,5,3.5,'#1f6b2a');circ(0,7,2.5,'#1f6b2a');circ(-19,-1,3.6,'#fff');circ(-20,-1,2,'#111');
  X.strokeStyle='#2e3b2e';X.lineWidth=2;X.beginPath();X.moveTo(-20,-8);X.quadraticCurveTo(-26,-18,-32,-16);X.stroke()}
const FLYERS={
  school:()=>{poly([-22,0,18,-10,6,0],'#ffffff');poly([-22,0,6,0,18,10],'#e3eef8');X.beginPath();X.moveTo(-22,0);X.lineTo(18,-10);X.lineTo(6,0);X.lineTo(18,10);X.closePath();strokeC('#7a8ca3',1.6)},
  suburb:()=>{ell(0,0,22,8,'#ff5d8f');ell(0,-2,14,4,'#ff8fb1');X.beginPath();X.ellipse(0,0,22,8,0,0,TAU);strokeC('#b0285a',1.8)},
  city:()=>{ell(2,2,18,11,'#9ea7b3');circ(-14,-6,8,'#8a939f');ell(10,-2,12,6,'#7d8692',-0.3);circ(-16,-8,2.6,'#fff');circ(-17,-8,1.4,'#111');poly([-22,-6,-28,-4,-22,-2],'#ffb74d');X.fillStyle='#6b7f6b';X.fillRect(-12,-2,4,3)},
  island:()=>{poly([0,-18,14,0,0,18,-14,0],'#ff7043');poly([0,-18,14,0,0,0],'#ffca28');poly([0,0,-14,0,0,18],'#ffca28');X.beginPath();X.moveTo(14,0);X.quadraticCurveTo(24,8,30,0);X.quadraticCurveTo(36,-8,42,0);strokeC('#e53935',1.6)},
  falls:()=>{X.globalAlpha=0.7;ell(-2,-8,10,4,'#c8f0ff',-0.3);ell(6,-8,10,4,'#c8f0ff',0.3);X.globalAlpha=1;ell(4,0,20,4,'#1e88e5');circ(-16,0,6,'#1565c0');circ(-18,-2,2.2,'#fff')}};
const BALLS={
  school:()=>{circ(0,0,18,'#e53935');X.beginPath();X.arc(0,0,18,-0.5,0.5);X.moveTo(-16,-8);X.quadraticCurveTo(0,0,-16,8);strokeC('#b71c1c',2);circ(-6,-7,4,'rgba(255,255,255,0.45)')},
  suburb:()=>{circ(0,0,18,'#fff');X.beginPath();X.arc(0,0,18,0,TAU);strokeC('#333',1.6);const pent=(x,y,r)=>{X.beginPath();for(let i=0;i<5;i++){const a=-Math.PI/2+i*TAU/5;X.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}X.closePath();X.fillStyle='#222';X.fill()};pent(0,0,6);pent(-12,-9,4);pent(12,-9,4);pent(-9,12,4);pent(9,12,4)},
  city:()=>{ell(0,0,20,13,'#8d4a24');X.fillStyle='#fff';X.fillRect(-6,-1.5,12,3);for(let i=-2;i<=2;i++)X.fillRect(i*2.6-0.6,-4,1.2,8);X.beginPath();X.ellipse(0,0,20,13,0,0,TAU);strokeC('#5a2d12',1.6)},
  island:()=>{const C=['#ff5252','#fff','#ffd740','#fff','#40c4ff','#fff'];for(let i=0;i<6;i++){X.beginPath();X.moveTo(0,0);X.arc(0,0,19,i*TAU/6,(i+1)*TAU/6);X.closePath();X.fillStyle=C[i];X.fill()}circ(0,0,4,'#fff');X.beginPath();X.arc(0,0,19,0,TAU);strokeC('#b0bec5',1.4)},
  falls:()=>{ell(0,0,13,19,'#8d5a2b');for(let j=-2;j<=2;j++)for(let i=-1;i<=1;i++)ell(i*7+(j%2?3:0),j*7,4,3,'#6d4320');X.beginPath();X.ellipse(0,0,13,19,0,0,TAU);strokeC('#5a3416',1.4)}};
// ---------- posts (vertical obstacles with a fair gap) ----------
function drawPost(th,x,y0,y1,top){const w=52,h=y1-y0;if(h<=2)return;
  if(th==='school'){// giant pencils
    const c=['#ffca28','#4fc3f7','#81c784','#ff8a65'][(x*0.013|0)&3];
    if(top){X.fillStyle='#f48fb1';X.fillRect(x-w/2,y0,w,14);X.fillStyle='#b0bec5';X.fillRect(x-w/2,y0+14,w,10);X.fillStyle=c;X.fillRect(x-w/2,y0+24,w,h-60);poly([x-w/2,y1-36,x+w/2,y1-36,x,y1],'#f5d6a8');poly([x-8,y1-12,x+8,y1-12,x,y1],'#424242')}
    else{X.fillStyle='#f48fb1';X.fillRect(x-w/2,y1-14,w,14);X.fillStyle='#b0bec5';X.fillRect(x-w/2,y1-24,w,10);X.fillStyle=c;X.fillRect(x-w/2,y0+36,w,h-60);poly([x-w/2,y0+36,x+w/2,y0+36,x,y0],'#f5d6a8');poly([x-8,y0+12,x+8,y0+12,x,y0],'#424242')}
    X.fillStyle='rgba(0,0,0,0.12)';X.fillRect(x+w/2-12,top?y0+24:y0+36,8,h-60)}
  else if(th==='suburb'){// birdhouse poles / hanging flower baskets
    if(top){X.fillStyle='#795548';X.fillRect(x-3,y0,6,h-34);ell(x,y1-22,28,20,'#8d6e63');for(let i=0;i<6;i++)circ(x-22+i*9,y1-30+((i*5)%7),8,['#ff4081','#ffeb3b','#e040fb'][i%3]);circ(x,y1-6,8,'#66bb6a')}
    else{X.fillStyle='#8d6e63';X.fillRect(x-7,y0+40,14,h-40);X.fillStyle='#ff7043';poly([x-32,y0+22,x,y0,x+32,y0+22],'#c62828');X.fillStyle='#ffcc80';X.fillRect(x-24,y0+20,48,30);circ(x,y0+34,7,'#4e342e')}}
  else if(th==='city'){// orange steel girders
    X.fillStyle='#ff8f00';X.fillRect(x-w/2,y0,w,h);X.fillStyle='#e65100';X.fillRect(x-w/2,y0,8,h);X.fillRect(x+w/2-8,y0,8,h);
    X.strokeStyle='#e65100';X.lineWidth=4;X.beginPath();for(let yy=y0;yy<y1-30;yy+=40){X.moveTo(x-w/2+8,yy);X.lineTo(x+w/2-8,yy+40);X.moveTo(x+w/2-8,yy);X.lineTo(x-w/2+8,yy+40)}X.stroke();
    X.fillStyle='#ffb300';X.fillRect(x-w/2-6,top?y1-10:y0,w+12,10)}
  else if(th==='island'){// lighthouse (bottom) / hanging flower baskets (top)
    if(top){X.fillStyle='#455a64';X.fillRect(x-2,y0,4,h-30);ell(x,y1-20,30,18,'#6d4c41');for(let i=0;i<7;i++)circ(x-24+i*8,y1-28+((i*3)%6),7,['#e040fb','#fff','#ff4081'][i%3])}
    else{const tw=w;X.fillStyle='#fff';X.beginPath();X.moveTo(x-tw/2+6,y1);X.lineTo(x-tw/2+12,y0+44);X.lineTo(x+tw/2-12,y0+44);X.lineTo(x+tw/2-6,y1);X.closePath();X.fill();
      X.fillStyle='#d32f2f';for(let yy=y0+60;yy<y1;yy+=48)X.fillRect(x-tw/2+8,yy,tw-16,22);X.fillStyle='#37474f';X.fillRect(x-20,y0+30,40,16);circ(x,y0+28,13,'#fff59d');poly([x-18,y0+18,x,y0,x+18,y0+18],'#d32f2f')}}
  else {// birch logs / hanging pine boughs
    if(top){X.fillStyle='#5d4037';X.fillRect(x-6,y0,12,h-20);for(let yy=y0+30;yy<y1;yy+=30){poly([x,yy-20,x-30,yy+8,x+30,yy+8],'#2e7d4f')}}
    else{X.fillStyle='#f3efe6';X.fillRect(x-w/2+4,y0,w-8,h);X.fillStyle='#3e3a36';for(let yy=y0+16;yy<y1;yy+=26){X.fillRect(x-w/2+8+((yy*7)%18),yy,14,4)}ell(x,y0,w/2-4,7,'#d7ccc8');ell(x,y0,w/2-12,4,'#bcaaa4')}}}
// ---------- pickups ----------
function honeyArt(){X.beginPath();X.moveTo(0,-12);X.bezierCurveTo(9,-2,11,4,9,8);X.arc(0,6,9,0,Math.PI);X.bezierCurveTo(-11,4,-9,-2,0,-12);X.fillStyle='#ffb300';X.fill();strokeC('#c77700',2);ell(-3,3,2.5,4,'rgba(255,255,255,0.7)')}
function jarArt(){rrect(-13,-10,26,26,8);X.fillStyle='#ffb300';X.fill();strokeC('#8d5a00',2);X.fillStyle='#c77700';X.fillRect(-14,-14,28,6);rrect(-9,-2,18,10,3);X.fillStyle='#fff3c4';X.fill();txt('H',0,3.5,9,'#c77700');ell(-6,6,2.2,5,'rgba(255,255,255,0.6)')}
function bubbleArt(kind){circ(0,0,20,'rgba(200,240,255,0.55)');X.beginPath();X.arc(0,0,20,0,TAU);strokeC('#fff',2.5);
  if(kind==='triple'){for(const a of [-0.35,0,0.35]){X.save();X.rotate(a);poly([-10,-2,10,0,-10,2],'#3b2a14');X.restore()}}
  else if(kind==='shield'){for(let i=0;i<6;i++){const a=i*TAU/6;ell(Math.cos(a)*8,Math.sin(a)*8,6,4,'#ff80ab',a)}circ(0,0,5,'#ffd23f')}
  else heartP(0,2,11,'#ff3b6b');ell(-8,-9,4,2.5,'rgba(255,255,255,0.8)',-0.6)}
function stingArt(){poly([-11,-2.6,11,0,-11,2.6],'#3b2a14');circ(-11,0,3,'#ffd23f')}

# Headless Chrome checks + screenshots at iPhone SE and iPhone 13 sizes: audio unlock, title/level select/localStorage,
# real touch input (drag steering, FIRE button, multi-touch), pickups, power-ups, damage, checkpoints, no-game-over continue,
# every level + every boss (real stingers finishing each boss), victory screen, safe-area (notch) layout, no JS errors.
import asyncio,sys,json,os
from playwright.async_api import async_playwright
BASE=sys.argv[1] if len(sys.argv)>1 else 'file:///workspace/the-bee-game/index.html'
OUT='/workspace/the-bee-game/';ok=True;NCLIPS=32
def chk(n,c,i=''):
    global ok;ok&=bool(c);print(('PASS ' if c else 'FAIL ')+n,i,flush=True)
def U(base,q):return base+('&' if '?' in base else '?')+q
async def touch(cdp,typ,pts):
    await cdp.send('Input.dispatchTouchEvent',{'type':typ,'touchPoints':[{'x':x,'y':y,'id':i} for i,(x,y) in enumerate(pts)]})
async def run(p,b,name,dev,sfx):
    errs=[];ctx=await b.new_context(**dev);m=await ctx.new_page();cdp=await ctx.new_cdp_session(m)
    m.on('pageerror',lambda e:errs.append(str(e)));m.on('console',lambda x:errs.append(x.text) if x.type=='error' else None)
    E=m.evaluate;W=lambda ms:m.wait_for_timeout(ms)
    await m.goto(BASE);await W(600);chk(f'[{name}] no debug hook in public build',await E('typeof window.__B')=='undefined')
    await m.goto(U(BASE,'debug=1'));await E('localStorage.clear()');await m.reload();await W(900)
    vp=await E('[innerWidth,innerHeight]')
    await m.touchscreen.tap(vp[0]*0.5,vp[1]*0.18);await W(1300)
    a=await E('({u:__B.audio.unlocked,r:__B.audio.running,c:__B.audio.clipCount,s:__B.state})')
    chk(f'[{name}] first tap unlocks audio (silent-switch <audio> path)',a['u'] and a['r'] and a['s']=='title',str(a));chk(f'[{name}] {NCLIPS} voice clips decoded',a['c']==NCLIPS,str(a['c']))
    async def ui():return {u['id']:u for u in await E('__B.ui')}
    async def tapUI(id):
        u=(await ui())[id];c=await E(f'__B.toClient({u["x"]},{u["y"]})');await m.touchscreen.tap(c['x'],c['y']);await W(250)
    await tapUI('lv3');chk(f'[{name}] locked level can\'t be picked',await E('__B.selLv')==0)
    await tapUI('auto');chk(f'[{name}] auto-fire toggle (saved)',await E('!__B.autoFire&&localStorage.getItem("tbg_auto")==="0"'))
    await tapUI('mute');m1=await E('__B.audio.muted');await tapUI('mute');chk(f'[{name}] mute button',m1 and not await E('__B.audio.muted'))
    await W(300);await m.screenshot(path=OUT+f'screenshot-title{sfx}.png')
    await tapUI('play');await W(400);chk(f'[{name}] PLAY -> Level 1 card',await E('__B.state==="card"&&__B.lv===0'))
    await m.touchscreen.tap(vp[0]*0.5,vp[1]*0.5);await W(300);chk(f'[{name}] tap card -> play',await E('__B.state')=='play')
    await E('__B.clear()')
    # --- touch steering: relative drag anywhere moves the bee
    y0=await E('__B.bee.y');sx,sy=vp[0]*0.6,vp[1]*0.45
    await touch(cdp,'touchStart',[(sx,sy)]);await W(60);await touch(cdp,'touchMove',[(sx,sy+60)]);await W(60);await touch(cdp,'touchMove',[(sx,sy+120)]);await W(500)
    y1=await E('__B.bee.y');await touch(cdp,'touchMove',[(sx,sy-60)]);await W(500);y2=await E('__B.bee.y');await touch(cdp,'touchEnd',[])
    chk(f'[{name}] drag down moves bee down',y1-y0>100,f'{y0:.0f}->{y1:.0f}');chk(f'[{name}] drag up moves bee up',y1-y2>150,f'{y1:.0f}->{y2:.0f}')
    await touch(cdp,'touchStart',[(sx,sy)]);await W(50);await touch(cdp,'touchMove',[(sx,-500)]);await W(600);await touch(cdp,'touchEnd',[])
    chk(f'[{name}] bee stays below the HUD',await E('__B.bee.y>=__B.YMIN-0.5'),str(await E('[__B.bee.y,__B.YMIN]')))
    # --- big FIRE button (auto-fire off) + multi-touch steer while firing
    await E('__B.shots.length=0');await W(400);n0=await E('__B.shots.length')
    f=await E('__B.fire');fc=await E(f'__B.toClient({f["x"]},{f["y"]})')
    await touch(cdp,'touchStart',[(fc['x'],fc['y'])]);await W(700);n1=await E('__B.shots.length')
    by0=await E('__B.bee.y');await touch(cdp,'touchMove',[(fc['x'],fc['y']),(sx,sy)]);await W(60);await touch(cdp,'touchMove',[(fc['x'],fc['y']),(sx,sy+150)]);await W(500)
    by1=await E('__B.bee.y');n2=await E('__B.shots.length');await touch(cdp,'touchEnd',[]);await W(700);await E('__B.shots.length=0');await W(400);n3=await E('__B.shots.length')
    chk(f'[{name}] no shots without FIRE when auto-fire is off',n0==0 and n3==0,f'{n0},{n3}');chk(f'[{name}] hold FIRE button shoots stingers',n1>=2,str(n1))
    chk(f'[{name}] multi-touch: steer with one finger while firing with another',by1-by0>120 and n2>=2,f'dy={by1-by0:.0f} shots={n2}')
    # --- auto-fire on
    await E('__B.bee.inv=0');await m.evaluate('__B.paused=false');ui0=await E('__B.hud');H={u['id']:u for u in ui0}
    pc=await E(f'__B.toClient({H["pause"]["x"]},{H["pause"]["y"]})');await m.touchscreen.tap(pc['x'],pc['y']);await W(300);chk(f'[{name}] pause button',await E('__B.paused'))
    await tapUI('auto2');chk(f'[{name}] auto-fire ON from pause menu',await E('__B.autoFire'))
    await tapUI('resume');chk(f'[{name}] resume',not await E('__B.paused'))
    await E('__B.shots.length=0');await W(600);chk(f'[{name}] auto-fire shoots by itself',await E('__B.shots.length')>=2)
    # --- honey, enemies, power-ups, damage
    s0=await E('__B.score');await E('__B.spawnObj({k:"honey",x:__B.bee.x+60,y:__B.bee.y})');await W(700);chk(f'[{name}] honey pickup +10',await E('__B.score')-s0>=10)
    p0=await E('__B.pops');await E('__B.spawnObj({k:"wasp",x:__B.bee.x+220,y:__B.bee.y,by:__B.bee.y,ph:0,amp:0,vx:0,hp:1,r:16})');await W(900);chk(f'[{name}] stinger pops a grumpy wasp',await E('__B.pops')>p0)
    await E('__B.clear();__B.give("triple")');await E('__B.shots.length=0');await W(260);chk(f'[{name}] Triple Stinger power-up fires 3 at once',await E('__B.triple>0&&__B.shots.length>=3'),str(await E('__B.shots.length')))
    await E('__B.give("shield")');h0=await E('__B.hearts');await E('__B.bee.inv=0;__B.spawnObj({k:"ball",x:__B.bee.x+5,r:19,apex:__B.bee.y,ph:Math.PI/2,vx:0,rot:0})');await W(250)
    chk(f'[{name}] Flower Shield blocks a hit',await E('__B.hearts')==h0 and not await E('__B.shield'),str(await E('[__B.hearts,__B.shield]')))
    await E('__B.clear();__B.bee.inv=0;__B.spawnObj({k:"ball",x:__B.bee.x+5,r:19,apex:__B.bee.y,ph:Math.PI/2,vx:0,rot:0})');await W(250)
    chk(f'[{name}] bump costs one heart + short invincibility',await E('__B.hearts')==h0-1 and await E('__B.bee.inv>0'),str(await E('[__B.hearts,__B.bee.inv]')))
    await E('__B.clear()')
    # --- mid-level checkpoint, then out of hearts -> friendly OOPS -> continue from the checkpoint (no game-over wipe)
    await E('__B.skipTo(0.49)');await W(4200);chk(f'[{name}] reach mid-level checkpoint',await E('__B.cp.dist>0'),str(await E('__B.cp')))
    await E('__B.clear();__B.hearts=1;__B.bee.inv=0;__B.hurt()');await W(300);chk(f'[{name}] out of hearts -> OOPSIE (no game over)',await E('__B.state')=='oops')
    await m.screenshot(path=OUT+f'screenshot-oops{sfx}.png')
    await W(2700);s=await E('({s:__B.state,h:__B.hearts,lv:__B.lv,d:__B.dist,cp:__B.cp.dist})');chk(f'[{name}] continue same level from checkpoint with full hearts',s['s']=='play' and s['h']==4 and s['lv']==0 and s['d']>=s['cp']-1 and s['cp']>0,str(s))
    # --- every level and every boss
    for i in range(5):
        await E(f'__B.startLevel({i});__B.startPlay();__B.bot(true)');await W(300);await E('__B.skipTo(0.4)');await W(4800)
        st=await E('({s:__B.state,lv:__B.lv,n:__B.objs.length})');chk(f'[{name}] level {i+1} plays',st['s']=='play' and st['lv']==i and st['n']>0,str(st))
        await m.screenshot(path=OUT+f'screenshot-level{i+1}{sfx}.png')
        await E('__B.skipTo(0.995)');await W(5600)
        bs=await E('({k:__B.boss&&__B.boss.k,st:__B.boss&&__B.boss.st,ph:__B.phase,cpb:__B.cp.boss})');chk(f'[{name}] boss {i+1} arrives ({bs["k"]}) + boss checkpoint',bs['st']=='fight' and bs['cpb'],str(bs))
        await W(2600 if i!=3 else 1800);await m.screenshot(path=OUT+f'screenshot-boss{i+1}{sfx}.png')
        hp0=await E('__B.boss.hp');await W(1500);hp1=await E('__B.boss.hp');chk(f'[{name}] stingers damage boss {i+1} (health bar)',hp1<hp0,f'{hp0}->{hp1}')
        if i==1:
            await E('__B.hearts=1;__B.bee.inv=0;__B.hurt()');await W(2900);s=await E('({s:__B.state,ph:__B.phase,hp:__B.boss&&__B.boss.hp,h:__B.hearts})')
            chk(f'[{name}] OOPS during boss -> continue at the boss checkpoint (boss keeps its damage)',s['s']=='play' and s['ph']=='boss' and s['hp']<=hp1 and s['h']==4,str(s))
        await E('__B.bossHp(1)')
        for _ in range(40):
            bd=await E('({st:__B.boss&&__B.boss.st,s:__B.state,hp:__B.boss&&__B.boss.hp})')
            if bd['st']=='down' or bd['s'] in('clear','win'):break
            await E('(()=>{const b=__B.boss;if(b&&b.k==="gulls")for(const g of b.g)if(g.hp>0&&g.st!=="bob"){g.st="bob";g.x=b.hx}})()');await W(200)
        chk(f'[{name}] boss {i+1} defeated by stingers',bd['st']=='down' or bd['s'] in('clear','win'),str(bd))
        await W(1300);await m.screenshot(path=OUT+f'screenshot-boss{i+1}-defeated{sfx}.png')
        exp='win' if i==4 else 'clear';got=None
        for _ in range(40):
            got=await E('__B.state')
            if got==exp:break
            await W(250)
        chk(f'[{name}] level {i+1} -> {exp}',got==exp,got)
        if i==0: await m.screenshot(path=OUT+f'screenshot-clear{sfx}.png')
        await E('__B.bot(false)')
    await W(2500);await m.screenshot(path=OUT+f'screenshot-victory-test{sfx}.png')
    es=await E('__B.endStats');chk(f'[{name}] victory: ALEXANDER BUZZSON SAVED THE HIVE! + stats',es and es['stars']>=1 and ':' in es['time'],json.dumps(es))
    vs=await E('__B.audio.stats');chk(f'[{name}] voice lines (one at a time)',vs['voice']>=8,json.dumps({k:vs[k] for k in ('voice','dropped','sfx')}))
    await E('__B.goTitle()');await m.reload();await W(900);s=await E('({u:__B.unlockLv,sel:__B.selLv})');chk(f'[{name}] unlocked levels saved in localStorage',s['u']==5 and s['sel']==4,str(s))
    await m.touchscreen.tap(vp[0]*0.5,vp[1]*0.15);await W(300);await tapUI('lv3');chk(f'[{name}] level select picks unlocked level 3',await E('__B.selLv')==2)
    await tapUI('play');await W(400);chk(f'[{name}] start straight at level 3 (Detroit)',await E('__B.state==="card"&&__B.lv===2'))
    # --- safe area: simulate a notch (47px) + home indicator (34px): HUD and bee stay out of it
    await m.goto(U(BASE,'debug=1&safe=47,34'));await W(900);await m.touchscreen.tap(vp[0]*0.5,vp[1]*0.15);await W(300)
    await E('__B.startLevel(0);__B.startPlay()');await W(1500);g=await E('({top:__B.TOP,ymin:__B.YMIN,sc:__B.toClient(1,1).y,hud:__B.hud,gy:__B.GY,H:__B.H})')
    hudTop=min(u['y'] for u in g['hud'])-27;chk(f'[{name}] notch: HUD + playfield below the status bar',hudTop*g['sc']>=47 and g['ymin']*g['sc']>47+40,f"hudTop={hudTop*g['sc']:.0f}px ymin={g['ymin']*g['sc']:.0f}px")
    chk(f'[{name}] home indicator: ground/FIRE above the bottom inset',(g['H']-g['gy'])*g['sc']>=34,f"{(g['H']-g['gy'])*g['sc']:.0f}px")
    await m.screenshot(path=OUT+f'screenshot-notch{sfx}.png')
    chk(f'[{name}] no JS errors',not errs,str(errs[:3]))
    await ctx.close()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--autoplay-policy=no-user-gesture-required'])
        only=os.environ.get('ONLY')
        if only!='13': await run(p,b,'iPhone SE',p.devices['iPhone SE'],'-se')
        if only!='se': await run(p,b,'iPhone 13',p.devices['iPhone 13'],'')
        await b.close()
    print('ALL OK' if ok else 'SOME FAILED');sys.exit(0 if ok else 1)
asyncio.run(main())

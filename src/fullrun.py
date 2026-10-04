# Simulated start-to-finish run: real tap on PLAY, then the in-page "kid bot" steers the same drag target a finger would
# (dodging posts/balls/bullets/warning lanes, lining up shots on bosses) with auto-fire, at 4x speed, through all 5 levels + 5 bosses.
import asyncio,sys,json,os
from playwright.async_api import async_playwright
BASE=sys.argv[1] if len(sys.argv)>1 else 'file:///workspace/the-bee-game/index.html'
DEV=os.environ.get('DEV','iPhone 13');OUT='/workspace/the-bee-game/';ok=True;SFX=os.environ.get('SFX','');KID='true' if os.environ.get('KID') else 'false'
def chk(n,c,i=''):
    global ok;ok&=bool(c);print(('PASS ' if c else 'FAIL ')+f'[{DEV}{" kid-bot" if KID=="true" else ""}] '+n,i,flush=True)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--autoplay-policy=no-user-gesture-required'])
        ctx=await b.new_context(**p.devices[DEV]);m=await ctx.new_page();errs=[]
        m.on('pageerror',lambda e:errs.append(str(e)));m.on('console',lambda x:errs.append(x.text) if x.type=='error' else None)
        await m.goto(BASE+('&' if '?' in BASE else '?')+'debug=1');await m.evaluate('localStorage.clear()');await m.reload();await m.wait_for_timeout(900)
        vp=await m.evaluate('[innerWidth,innerHeight]');await m.touchscreen.tap(vp[0]*0.5,vp[1]*0.2);await m.wait_for_timeout(600)
        ui={u['id']:u for u in await m.evaluate('__B.ui')};c=await m.evaluate(f'__B.toClient({ui["play"]["x"]},{ui["play"]["y"]})')
        await m.touchscreen.tap(c['x'],c['y']);await m.wait_for_timeout(300);chk('PLAY button starts level 1',await m.evaluate('__B.state==="card"&&__B.lv===0'))
        await m.evaluate(f'__B.bot(true,{KID});__B.TS=4');t0=asyncio.get_event_loop().time();seen=[];bosses=[];shots=set();clears=0;last=None;minH=9;oops=0;cps=set()
        while True:
            s=await m.evaluate('({s:__B.state,lv:__B.lv,d:__B.dist/__B.LEN,h:__B.hearts,b:__B.boss&&__B.boss.k,bh:__B.boss&&__B.boss.hp/__B.boss.max,bst:__B.boss&&__B.boss.st,cp:__B.cp.dist>0,w:__B.warns.length,nb:__B.bul.length})')
            if s['s']=='win' or asyncio.get_event_loop().time()-t0>540:break
            if s['s']=='play':minH=min(minH,s['h'])
            if s['lv'] not in seen:seen.append(s['lv'])
            if s['b'] and s['b'] not in bosses:bosses.append(s['b'])
            if s['cp']:cps.add(s['lv'])
            if s['s']=='clear' and last!='clear':clears+=1
            if s['s']=='oops' and last!='oops':oops+=1
            last=s['s'];k=None
            if s['s']=='play':
                if 0.35<s['d']<0.9 and f'level{s["lv"]+1}' not in shots:k=f'level{s["lv"]+1}'
                if s['b'] and s['bst']=='fight' and s['bh']<0.75 and (s['w'] or s['nb']) and f'boss{s["lv"]+1}' not in shots:k=f'boss{s["lv"]+1}'
            if k:shots.add(k);await m.screenshot(path=OUT+f'screenshot-run-{k}{SFX}.png') if KID=='false' else None
            await m.wait_for_timeout(120)
        r=await m.evaluate('({s:__B.state,score:__B.score,honey:__B.honey,pops:__B.pops,hits:__B.hitsTaken,oops:__B.oopsN,rt:Math.round(__B.runTime),end:__B.endStats,unlock:__B.unlockLv,v:__B.audio.stats})')
        print(json.dumps({k:v for k,v in r.items() if k!='v'}));print('voice',r['v']['voice'],'dropped',r['v']['dropped'],','.join(r['v']['said'][:60]))
        print('levels',seen,'bosses',bosses,'min hearts',minH,'real secs',round(asyncio.get_event_loop().time()-t0),'shots',sorted(shots))
        chk('reached the victory screen (ALEXANDER BUZZSON SAVED THE HIVE!)',r['s']=='win')
        chk('played all 5 levels in order',seen==[0,1,2,3,4],str(seen))
        chk('fought all 5 bosses',bosses==['swatter','skunk','robo','gulls','bear'],str(bosses))
        chk('4 level clears then the final win',clears==4,str(clears))
        if KID=='false':chk('mid-level checkpoint reached in every level',cps=={0,1,2,3,4},str(sorted(cps)))
        chk('no game-over wipe (oops -> continue from checkpoint only)',r['unlock']==5,f"oops={r['oops']} hits={r['hits']}")
        chk('collected honey + popped pests',r['honey']>=60 and r['pops']>=20,f"{r['honey']} honey {r['pops']} pops")
        chk('victory stats',r['end'] and r['end']['stars']>=1,json.dumps(r['end']))
        chk('voice lines one at a time',r['v']['voice']>=15)
        await m.wait_for_timeout(2600)
        if KID=='false':await m.screenshot(path=OUT+f'screenshot-victory{SFX}.png')
        chk('no JS errors',not errs,str(errs[:3]))
        await b.close()
    print('ALL OK' if ok else 'SOME FAILED');sys.exit(0 if ok else 1)
asyncio.run(main())

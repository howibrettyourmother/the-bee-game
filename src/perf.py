# Frame-time check for older iPhones: iPhone SE + iPhone 13 viewports with Chrome CPU throttled 4x (and again unthrottled),
# Throttled runs use the shipping adaptive-quality path (resolution steps down if frames are slow); unthrottled runs pin full quality.
# real-time (TS=1) bot play through every level's busiest part and every boss. Measures JS work per frame (update+render) and rAF pacing.
import asyncio,sys,json,os
from playwright.async_api import async_playwright
BASE=sys.argv[1] if len(sys.argv)>1 else 'file:///workspace/the-bee-game/index.html'
ok=True
def chk(n,c,i=''):
    global ok;ok&=bool(c);print(('PASS ' if c else 'FAIL ')+n,i,flush=True)
async def run(p,b,name,dev,thr):
    ctx=await b.new_context(**dev);m=await ctx.new_page();cdp=await ctx.new_cdp_session(m);errs=[]
    m.on('pageerror',lambda e:errs.append(str(e)))
    await m.goto(BASE+('&' if '?' in BASE else '?')+'debug=1'+('' if thr>1 else '&q=fixed'));await m.wait_for_timeout(800)
    vp=await m.evaluate('[innerWidth,innerHeight]');await m.touchscreen.tap(vp[0]*0.5,vp[1]*0.15);await m.wait_for_timeout(500)
    await cdp.send('Emulation.setCPUThrottlingRate',{'rate':thr})
    tag=f'{name} cpu/{thr}';allw=[]
    if thr>1:
        await m.evaluate('__B.startLevel(0);__B.startPlay();__B.bot(true);__B.skipTo(0.1)');await m.wait_for_timeout(12000)
        print(f'  {tag}: adaptive quality settled at {await m.evaluate("__B.qual")} x device pixel ratio (capped at 2)',flush=True)
    for i in range(5):
        await m.evaluate(f'__B.startLevel({i});__B.startPlay();__B.bot(true);__B.skipTo(0.55)');await m.wait_for_timeout(1500);await m.evaluate('__B.resetPerf()');await m.wait_for_timeout(5000)
        a=await m.evaluate('__B.perf()')
        await m.evaluate('__B.skipTo(0.998)');await m.wait_for_timeout(7000);await m.evaluate('__B.resetPerf()');await m.wait_for_timeout(5000)
        c=await m.evaluate('__B.perf()');n=await m.evaluate('__B.objs.length+__B.bul.length')
        print(f'  {tag} q{a["q"]} L{i+1} level: work avg {a["avg"]}ms p95 {a["p95"]}ms max {a["max"]}ms | raf avg {a["raf"]}ms p95 {a["rafP95"]}ms ~{a["fps"]}fps || boss: work avg {c["avg"]} p95 {c["p95"]} max {c["max"]} | raf p95 {c["rafP95"]} ~{c["fps"]}fps',flush=True)
        allw+= [a,c]
    worst=max(x['p95'] for x in allw);avg=sum(x['avg'] for x in allw)/len(allw);fps=min(x['fps'] for x in allw)
    budget=12 if thr>1 else 6
    chk(f'[{tag}] frame work p95 under {budget}ms in every level + boss',worst<budget,f'worst p95 {worst}ms, mean {avg:.2f}ms')
    chk(f'[{tag}] frame pacing ~60fps (rAF)',fps>=50,f'min {fps}fps')
    chk(f'[{tag}] no JS errors',not errs,str(errs[:2]))
    await ctx.close()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--autoplay-policy=no-user-gesture-required'])
        for dev in ['iPhone SE','iPhone 13']:
            for thr in [4,1]:await run(p,b,dev,p.devices[dev],thr)
        await b.close()
    print('ALL OK' if ok else 'SOME FAILED');sys.exit(0 if ok else 1)
asyncio.run(main())

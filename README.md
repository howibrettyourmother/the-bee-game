# The Bee Game 🐝 — starring ALEXANDER BUZZSON

A cheerful side-scrolling flyer made for Alex (6, almost 7). Fly Alexander Buzzson up and down across Michigan, dodge stuff, sting the pests, grab the honey and beat five goofy bosses to save the hive.

**Play:** https://howibrettyourmother.github.io/the-bee-game/ (portrait on iPhone; Share → Add to Home Screen gives a "Bee Game" icon and full-screen play)

- **Controls for little hands:** drag anywhere to move the bee up/down (relative drag, so the finger never covers the bee). **Auto-fire** is on by default; switch it off on the title or pause screen to get a big **FIRE** button (multi-touch: steer with one finger, fire with another). Keyboard: ↑/↓ + Space.
- **Fair, not punishing:** generous hitboxes, 4 hearts (up to 5), invincibility blink after a bump, a mid-level checkpoint flower and a boss checkpoint. Out of hearts = friendly "Oopsie!" and you continue from the checkpoint with full hearts (bosses keep their damage). No game over.
- **Pickups:** honey drops & honey jars (score), **Triple Stinger**, **Flower Shield**, extra hearts.
- **5 levels:** Meadow Brook Elementary (brick school, flagpole, playground, bus) → Rochester Hills (tree-lined houses, Paint Creek Trail bridge) → Detroit (RenCen skyline, riverfront, Spirit of Detroit) → Mackinac Island (Grand Hotel porch, fudge shops, the Bridge) → Tahquamenon Falls (root-beer waterfall, U.P. pines).
- **5 bosses with health bars and readable, telegraphed attacks:** Mister Swatter (flyswatter), Stinky the Skunk, Robo-Hornet 3000, The Seagull Gang (Gary, Larry & Barry), and **KING BEAR** — who just wants the honey. Victory screen: *ALEXANDER BUZZSON SAVED THE HIVE!*
- **Sound:** original WebAudio chiptune themes per level + boss + victory (no copyrighted tunes), synth SFX, warm voice lines (offline Piper TTS). Works with the iPhone silent switch on. Mute button on the title and HUD.
- Title screen level select (unlocked levels saved in localStorage), best score, iOS safe-area / standalone aware, adaptive resolution for older iPhones.

Dev: `src/gen.sh` (Piper TTS → `/tmp/tbg`), `python3 src/build.py` (inlines clips, font, JS into one `index.html`), `python3 src/icon.py` (icons), `python3 src/test.py` (iPhone SE + iPhone 13 checks & screenshots), `python3 src/fullrun.py` (bot plays all 5 levels + bosses; `KID=1` for a sloppier "kid bot"), `python3 src/perf.py` (frame-time checks, CPU throttled 4x).

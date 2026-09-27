# Chapters: how to build finished shots

The video is `video/studio.html`: 54 storyboard shots (`video/board.js`, readable as `docs/STORYBOARD.md`) on the song's
tempo map, with karaoke subtitles. A chapter file fills finished shots for its board ids; every shot without one plays
a storyboard card, so the reel is always watchable.

## Read first
- `brief/directive.md`: every decision the user has made (newest last). It overrules anything else.
- `docs/STORYBOARD.md` (your shots, their lyrics, timings, look, cast and "In:" transition).
- `demo/README.md`: the drawing API (piece, dline, limb, hand, curvy, oval, U; faces: eyeH, brow, mouthH, faceOf).
- `demo/style.js`: the looks. `look('card')` etc. at the start of every shot.
- The kit's `ANIMATION_GUIDE.md`: timing ("reads"), acting, anticipation, holds. Its medium rules don't apply.
- `video/ch/intro.js` and `video/ch/outro.js`: two finished chapters to copy the pattern from.

## The media (what each look means)
| look | where | meaning |
|---|---|---|
| `ink` | the past | rubber-hose 1930s cartoon: the promise |
| `card` | the present | stop-motion cut-out card: the two of them, now |
| `doodle` | the good future | biro and coloured pencil on lined paper: their hope (in her notebook) |
| `xerox` | the bad future | riso photocopy (blue, pink, yellow drums): the decay; "a copy, but cheaper" |
| `bank` | money and power | banknote engraving, teal ink, colour in the lines: the bosses, the bill, the plant; it can intrude into any of the other four as an overlay |
The train and its windows frame lived experience; her notebook's pages are the way into imagined futures.
Era changes are always physical transitions inside the story (a window, a page, a copier sweep, a stamp, a thrown
object, a burn), never a plain cut. Mixed frames (e.g. a riso street under a bank-engraved plant) are allowed; judge
them critically and fall back to a single look if they clash.

## The bot performance rule (locked by the author)
Every bot sincerely wants to help someone and be useful, even when that help causes harm. No bot is malicious, ever.
For every bot appearance know: who it's helping, what it thinks success looks like, and whose interests or boundaries
it overlooks (one clear task, gesture or relationship is enough on screen). Keep the harm visible, but no bot may enjoy
anyone's pain, humiliation or exclusion: its satisfaction attaches to the completed task, never to the suffering. No
pointing and laughing at the humans, no gloating, no conquest or victory poses, no burglar masks, taunts or predatory
smiles, no red-eyed transformations; decay belongs to the print and the conditions, not to a bot's face. Don't
lip-sync mocking backing vocals ("Taking the piss!") to bots. (A rule for these fictional characters, not a claim about
real AI systems.) The bosses are caricatures of public personas: no villainous flourishes beyond the storyboard.

## A shot
```js
SHOT.V1a = (t, lt, dur) => {          // t = song time, lt = time since the shot's first bar, dur = its length
  look('card');
  const tt = mt(t), l = mt(lt);          // stepped time for card/doodle (stop motion on twos)
  camBegin(960, 540, 1 + .01 * l);       // one camera level; always pair with camEnd()
  officeBack(tt, l, { clock: [9, 0] });
  person(OFFICE.chair[0], OFFICE.chair[1], OFFICE.chair[2], HER_C, { ...emotions(l, [[0, 'neutral'], [1.2, 'surprised']]), seated: true, seatH: OFFICE.chair[3], view: 'q', boilKey: 'her' });
  officeFront(tt, l, {});
  camEnd();
};
```
- Pure functions of t: no state, no Math.random (use `hash`, `jit`, `boilSeed(key)` before each element).
- Time actions to the words: `WT("Five o'clock", 0)` is when that line's first word is sung; `LY(prefix)` gives the
  line (`start`, `end`, `words`, `voice`). Put hits on beats (`bpOf`, `pulse`, `barOf`, `barPulse` follow the song).
- Transitions: a shot owns its INCOMING transition (its board "In:"). To wipe or match from the previous shot, draw it
  with `drawShot(prevId, t)` (any shot can render its neighbour; they're pure functions of time), then your
  transition over it. Your shot's last frame should be clean (the next shot may draw it).
- Keep the bottom ~170 px clear of key action: the subtitles live there.
- Everyone on model: narrators are pair C, `person(x, y, u, HER_C|HIM_C, o)` (her: tomato, bun with pencil, glasses;
  him: mustard parka, beanie). Caricatures: `musk`, `zuck`, `dorsey`, `altman`, `turnbull`, `dario` (public personas,
  white gloves). Bots (white gloves, pie-cut eyes): `grok`, `muse` (bots.js), `copilot`, `gemini`, `codex`, `clawd2`
  (bots2.js); the Codex pets (`codex`) have their own blue nub hands, white gloves only in rubber hose. Read each rig's header for poses, options and anchors.
- Nobody bobs to the beat. People breathe, shift their weight, turn their heads and blink on their own clocks (the
  rigs do it); `feel()`/`emotions()` give a held posture and small, quick takes. Motion a shot wants (a jump, a startle,
  a nod) is explicit: add it (`dy: mood.dy + hop.dy`, `sq: mood.sq + J.sq`). Bots accent the odd bar downbeat and keep
  busy; pass `bounce: 1` (or more) where they should really dance (the B1 rave). Drawing over a person's face or body
  outside the rig (bags, masks)? Pass `idle: 0` to that `person()` call so the overlay stays put.
- Sets: `demo/sets/present.js` (office, her flat, his box room), `carriage.js` (the train), `bunker.js`, `past.js`
  (the 1930s ad: `pastScene`, `burnHole`, `burnReveal`), `banknote.js`, `copies.js` (the riso turbine street),
  `friday.js` (the doodle Friday: `LOOPS.friday`). Concept scenes can be called as they are or taken apart.
- No text or letters in the drawings (the subtitles carry the words). Symbols, pictograms and clock hands are fine.
- Budget: under ~1.5 s per frame at 1x (the render log prints ms/frame).

## Checking your work
Each chapter has a dev page with only its own chapter loaded: `video/dev-<chapter>.html`. Times are SONG times.
```bash
node render.mjs --page=video/dev-verse1.html --sheet=16,17.5,19,20.5 --cols=4 --w=480 --out=out/ch/verse1/v1a.jpg
node render.mjs --page=video/dev-verse1.html --strip=19.2:19.8 --out=out/ch/verse1/strip.jpg          # every frame
node render.mjs --page=video/dev-verse1.html --clip=14.5:31 --out=out/ch/verse1/clip.mp4              # with the song
```
Look at every render (Read tool): sheets for staging, strips for motion and transitions, full-resolution crops for
faces and contacts, and a clip with the song for timing. Check against the storyboard reads and the rules above.

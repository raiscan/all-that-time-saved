# demo/: the drawing layer, the cast and the sets

This folder began as the music video's style test (a 17-second commuter demo, since replaced by the film in `video/`).
What's here now is what the film draws with (the style layer, the cast, the sets, props), plus `dev-*.html` pages that
check each part on its own through its model-sheet loops (each rig's header lists them):

```bash
node render.mjs --page=demo/dev-people.html --loop=pairC --sheet=0.3 --cols=1 --w=1920 --out=out/demo/pair.jpg
node render.mjs --page=demo/dev-lineup.html --loop=lineup --query='who=her&look=xerox' --sheet=0.3 --cols=1 --w=1920 --out=out/demo/her.jpg
```

The kit's [ANIMATION_GUIDE.md](../ANIMATION_GUIDE.md) still holds for timing, acting, transitions, "no text", pure
functions of t and `boilSeed` — **except its medium rules**: the style layer below replaces watercolour p5.brush painting.

## Files

| file | what |
|---|---|
| `style.js` | the style layer: `piece`, `dline`, `limb`, `hand`, `brad`, `eyeH`, `brow`, `mouthH`, `faceOf`, `crescent`, `curvy`, `oval`, `U`, `nudge`, `mt`, palette `NOIR` |
| `props.js` | shared props: `bill()`, `phone()` |
| `cast/commuter.js` | the narrator, `commuter(x, y, u, o)`, with `HPOSE` and `poses()` |
| `cast/musk.js`, `cast/zuck.js` | caricatures |
| `cast/bots.js` | Grok and Muse |
| `sets/carriage.js`, `sets/past.js`, `sets/bunker.js` | the three sets |
| `sheets.js` | model sheets as loops |
| `dev-*.html` | per-part pages (ink, and `-card` for card) so a bug in one part can't break another's renders |

## The style layer (style.js): how to draw anything

Never call the kit's `paint()` with watercolour `fill`s for drawings, and never draw plain p5 shapes. Draw **pieces**:

- `piece(P, col, o)`: one closed shape (P = point list, px). In ink: flat fill + thick even outline (+ optional cel
  shadow and rim light). In card: a scissor-cut card piece with a pale cut edge and a drop shadow.
  - `o.sw` outline weight (use `sw` ≈ `clamp(u / 20, .55, 2.2)` for a character; outer silhouettes ×1.15, details ×.6–.8)
  - `o.ink` outline colour, `null` for none (inner detail pieces: pupils, highlights, beard)
  - `o.shade` cel-shadow colour: a crescent on the side away from the key light; `o.depth` its depth in px
  - `o.rim` rim-light colour: a light edge on the lit side. **Use it on dark figures** (black suits) so they separate
  - `o.key` a stable, unique id per piece (card: its cut and nudge); `o.lift` card drop-shadow offset px (default 5;
    `u * .12` for character pieces, 0–2 for small things lying on a piece); `o.flatCard` skip card paper mottling (small pieces)
- `dline(P, sw, col, curv)`: a detail line on a piece (ink: fine Flash line; card: pencil)
- `limb([root, mid, tip], w0, w1, col, o)`: rubber-hose limb in ink (open root: start it inside or at the edge of the
  body so the join is hidden), two card segments on a brass pin in card. Returns `{ tip, ang }` for the hand.
- `hand(x, y, ang, s, o)`: a cartoon hand at the wrist. `o.pose`: relax | open | point | fist | thumb | hold;
  `o.glove: true` for white gloves (**tech bosses and bots always wear white gloves; the narrator never does**);
  `o.hold(s)` draws a held prop; `o.mirror` for left hands.
- Faces for humans: `eyeH(x, y, w, o)` (whites, iris, lids: `open`, `lower`, `look`, `style` happy|shut|squeeze),
  `brow(x, y, w, [inner, outer], side, col, sw)`, `mouthH(x, y, w, kind, o)` (flat smile frown smirk grin laugh open
  shout grimace o wobble). `faceOf(o)` maps the kit's `feel()`/`emotions()` output to these. Bots may use pie-cut eyes
  (draw their own); humans never do.
- `curvy(P, n)` smooth closed curve through points (use it for every organic outline), `oval(cx, cy, rx, ry, rot)`,
  `U(P, u, ox, oy)` scales unit points, `crescent(P, depth)`, `litEdge(P, inset)`.
- Light: `LIGHT.dir` (toward the key light, default upper left). A character that flips must set the global `XF`
  (`const prevXF = XF; XF = o.flip ? -XF : XF;` … `XF = prevXF;`) so shading mirrors correctly. See `commuter()`.
- Stop motion: shots pass time through `mt(t)` (steps on twos in card); characters call `nudge(key)` once after
  translating to their position (card: a hand-placed offset that re-settles only when the puppet's placement changes,
  and holds while it stands: card is rooted). Card is also rigid: pass body squash through `cardSq(v)` (0 in card) and
  slow drifts through `cardHold(v, q)` (held, moved in steps of q in card); `lifeOf(o, key, t, px)` steps the idle life
  in half-pixel increments in card (px: screen px per u, e.g. `u * drawScale()`). Test bed: `demo/dev-jitter.html`
  (`LOOPS.jitter`). Nothing else changes between styles.
- Boil: call `boilSeed(key)` before each separate element, as the kit's guide says.

## Character conventions (copy commuter.js)

`name(x, y, u, o)`: (x, y) = ground point between the feet, u = unit. Spread `feel()`/`emotions()` into `o` for the
face and posture (`dy`, `sq`, `rot`, `eyes`, `mouth`, `lookX/Y`, `squint`, `emote`…): its `dy`/`sq`/`rot` are the
emotion's held posture plus a small take on each acted change, never a beat bob (that's in `o.groove`, for bouncy rigs
only). People get their idle life from `lifeOf(o, key)` in clawd.js (breathing, weight shifts, head turns, blinks;
`o.idle: 0` switches it off, e.g. under an overlay); bots take their musicality from `botGroove` (accents, or the full
beat bounce when a shot passes `bounce`). Add explicit motion on top: `dy: mood.dy + hop.dy`. Support `view: 'front' | 'q'`,
`flip`, `seated` (skip legs), `pose` (hand targets), `hold`/`holdL` (props in hands), `boilKey`. Draw order: back arms,
legs, body, head, face, front arms, emote. Big rubber-hose heads; push the caricature.

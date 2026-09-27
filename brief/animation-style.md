# Animation style

The user's original brief, verbatim:

> A story of the past, the present and the future. Past is bright with pastel colours, with some, but minimal grit.
> Present is normal colours, standard balance. Any depictions of the bad/dystopian future should be muted colour, more
> grit. Potential depictions of the good utopian future should be clean and vibrant.

This document gathers the rules we've arrived at since, so every scene and every agent works to the same standard.
The decisions and their reasons are in `directive.md`, dated and newest last; if the two ever disagree, the directive wins.
The polish round's checklist, `polish_checklist.md`, is the short version for reviewing a shot.

## 1. One medium per world

| World | Look (`look(mode)`) | What it is |
|---|---|---|
| The past, and its naive promise of the future | `ink` | 1930s rubber hose cartoon: pastels, film grain, a projector's weave and flicker |
| The present | `card` | Stop-motion cut-out card: real paper texture, cut edges, lift shadows |
| The good future | `doodle` | Biro and coloured pencil on lined paper: the notebook the two of them draw in |
| The bad future | `xerox` | Risograph print: blue, fluoro pink and yellow drums; dot screens; toner grit |
| Money and power | `bank` | Banknote engraving: teal house ink; colour in the lines, not the fill; desaturated |

**What the rubber hose look stands for.** The past, and the past's naive expectation of the future. The ad that opens
the film ("Think of all the time you'll save") is a simple, naive picture of how automation will solve our "problems",
and its problems are childish: a gent in a hammock, a robot butler bringing him a cocktail. The user, 2026-09-25: "the
whole point of the ad is that it's a simple, naive expectation of the future and how automation will solve our
'problems', which in the ad are childish like a butler robot. Nothing at all depicted like anything we experience now,
in the bad future, or the good future." So:
- **Keep it naive.** No retro-futurist set dressing (skylines, rockets, monorails), and nothing in it that resembles
  the present, the bad future or the good future. It's a daydream with a robot butler, and the song is the answer to it.
- **Where it appears:**
  - **The ad:** the intro (I1–I3), its cheap copies in her box room (C1f, C2f), and frozen and grey on the phone at the
    end (O1): the promise, stalled.
  - **V3d:** the projected 1930s educational short.
  - **The chase (Z1):** the first panel, with the ad's own robot butler chasing them.

**The through-line: the promise against what they wanted.** The ad's future is a robot solving everything. What the
two of them actually wanted was simpler: more time to enjoy themselves together, like old times. The ending puts the two
side by side: the old ad, frozen and grey on a phone, beside her notebook open at their Friday. So in the good future:
- **The automation is invisible.** No robots, no bots, no screens doing things: it's there only in the time it gives
  back (the Friday morning with no alarm, the long evening together).
- **The one visible trace is wealth and power turned to giving:** the engraved (bank) world handing the hours back, in
  F3 the clock's hours flying out like birds to settle round them, the private island crossed out.

**Her notebook: drawing the good future until she gets it right.** She believed the poster once ("I did..!" is her exasperated answer to it now) and pinned a
copy on her wall. All film long she draws the good future she thinks she wants, modelled on it:
1. **The first pre-chorus (P1a):** just her, relaxing in a hammock under a grinning sun with a drink, the ad's picture,
   but no robot butler: the bots are already in her face in real life.
2. **The second pre-chorus (P2a):** her and him in two hammocks, relaxing as the ad portrays.
3. **The bridge and the ending (F1–F4, Z4, O1):** her and him, and how they really want to spend the time: the Friday,
   the den, talking nonsense half the night. Only at the end does she "get it right".

The hammocks echo the ad on purpose (the hammock, the grinning sun, the drink): her first two drawings are the ad's
promise redrawn by her, and both get stamped.

**The media rule:**
1. **A figure takes the medium of the place it's physically in.**
2. **A picture inside a picture keeps its own medium, bounded by its frame:** a poster, a screen, a phone, a TV, a
   page, a thought bubble. The frame justifies it, and the contents are clipped to the frame. In a riso scene, a bank
   picture on a screen gets a photocopy re-print pass that fades as the camera pushes into it.
3. **Crossing between media happens only at a visible boundary or moment, and the change is shown:**
   - the bill flying from the vault into the train
   - the chase changing at the panel dividers
   - the bots staying riso until their feet leave the phone's screen
   - the copier's light bar
   - a clapperboard's clap

## 2. Motion

- **Puppets on twos, camera on ones.** Characters, props and cut-out pieces step on twos, 12 a second (`mt(t)`).
  Every camera move is computed from continuous time, so it moves every frame: pans, pushes, pulls, drifts, shakes,
  scrolls and parallax. `tools/steps.py` measures it.
- **Card is rigid, rooted and reused,** like real cut-out stop-motion:
  - A piece nobody touches doesn't move: it's pixel-identical frame to frame.
  - Parts move by rotating and sliding on their joints, with very little squash and stretch.
  - Mouths and eyes are replacement pieces: a chart of pre-cut shapes swapped on twos and lip-synced from the lyric,
    each drawn once and reused.
  - Breathing is a slight, stepped rise of the shoulders and head.
- **No beat bob for people.** Idle life (breathing, weight shifts, head turns, irregular blinks) runs on each
  character's own clock, never on the beat. Bots hop only on occasional bar accents; the rave keeps its full bounce.
- **The bank ground doesn't redraw.** Under a still camera the engraved background is pixel-still. Moving subjects
  carry screen-fixed lines; the ground's lines are fixed to the world. Scenery that scrolls moves as solid pieces.
- **No double jumps:** no two big changes within about 0.5 s. Cuts land on words or beats, and every composition
  holds long enough to read.
- **Transitions are finished:** one continuous move where one is intended; no placeholder or washed-out frames.

## 3. Each look in detail

**Rubber hose (`ink`):**
- Characters are translated into the idiom, not the card design with a heavy outline:
  - solid black hose limbs with no outline
  - white puffy gloves, big oval shoes
  - screens as solid black shapes with bold white glyph eyes
  - minimal interior detail
- One clean contour in proportion to the figure's size, with lighter lines inside it.
- Slightly desaturated pastel fills: the ad's palette (NOIR.past*); the cast's own colours are softened into that range when drawn in ink. Reference: `ref/codey_rubberhose_ref.png`.
- Film artefacts (scratches, flicker, falloff) belong to projected film; a printed poster has none.

**Card:**
- Real card: the fibre texture is baked into each piece, the cut edge shows on the lit side, and each piece casts a
  lift shadow.
- Small features (eyes, glasses, earrings) cut clean; the cut's irregularity scales with the piece's size.
- Detail lines use an even pen.

**Doodle:**
- Biro outlines and coloured-pencil fills on lined paper.
- Finished drawings on paper don't boil.
- Page rules never boil.

**Riso (`xerox`):**
- One dot screen for the whole riso world: 4.5 px at 1080p in every riso scene (the user, 2026-09-26: it was sized per
  shot and every scene differed). Too fine and the look dissolves; too coarse and it turns into graphic halftone.
- Its line art holds its weight on screen too (the user, 2026-09-27: on a crash zoom the lines thickened and "the
  details get clobbered"): in the riso world the lines print at their zoom-1 weight whatever the camera does. A print
  inside the story (the stamped poster, her copies of the ad, the phone's picture) is paper being filmed: its lines and
  dots scale with it.
- Printed objects' dots belong to the paper: they grow as the camera pushes in.
- Lines print like a printer: even weight, blue over pink, a page-locked texture, the colour cleared
  under the line, misregistered as a plate.
- Copies of copies degrade: lines thicken, fray and break up, the dots coarsen, and grit gathers.
- The inks are only the riso's own: there's no black drum.

**Banknote (`bank`):**
- **Elaborate, like a real note's art:** guilloche, rosettes, microprint, acanthus, fluted columns, contour-hatched
  modelling, cross-hatched shadows, stipple.
- **Detail level 2 at 4K:** finer, denser lines.
- **Figure and ground, as real notes do it:**
  - **Figures:** deep-engraved in the darkest ink, with form-following contour hatching and stippled skin.
  - **The ground:** a paler, single-direction underprint.
  - **Halos:** a vignette of bare paper round each figure, made by the ground's lines tapering and stopping at a
    staggered oval, not by a wash. It follows the figure's pose.
- **Colour** lives in the lines. The house ink is teal; the bill's red stamp is the accent.

## 4. The cast

- **Tess** (her): a tall "line". Curly bun with a pencil through it, round glasses, tomato-red coat, cream scarf.
  - **Her sketchbook** (one object everywhere: F4 on her lap, Z3/Z4 and O1 on the train table): A4 landscape, about
    30 × 21 cm, spiral-bound on its left short edge, navy card cover. Against the cast: about twice the length of her
    phone and a little narrower than her shoulders (the rig's cartoon hands are small, so the hand is a reference only
    in close-ups drawn at life proportions, as O1: about 1.7 of her hand's length). She draws in biro, holding it as a pen.
  - **Her phone** is the same phone wherever it appears (Z3 flat on the table, O1 on its kickstand).
- **Rowan** (him): a stocky "block". African descent, beanie, mustard parka; no moustache.
- **The bots**, all sincere and helpful, never malicious or menacing (the author's locked rule):
  - **Claude:** Clawd.
  - **Copilot:** goggles, and a disguise as her (her whole look, cheap and sweet).
  - **The Gemini twins:** holding hands with a proper clasp.
  - **Grok.**
  - **Muse:** drawn as Meta Muse's mascot Jolly (`ref/meta_muse_jolly_ref.png`): a cream plush in a hooded onesie, a
    pale-peach face (beady eyes, small smile, blush), stubby arms, short chunky legs. Her own Muse is a mini Jolly on a
    Muse Charm on her wrist, typing on a tiny keyboard.
  - **The Codex pets from the Codex source:** Codey leads Dewey, Seedy, Fireball, Rocky, Stacky, BSOD and Null Signal,
    with Hoot unverified.
- **No hats that hide a design.** The pets' identity is their shape.
- **Caricatures of public figures,** pointed but not cruel, likeness by exaggerating real signature features:
  - Musk, Zuckerberg and Altman, redrawn from reference photos
  - Dorsey, Turnbull (the "Xbox bloke") and Dario (the checkout)

## 5. Craft rules

- **No words in pictures:** pictograms, digit-like ticks and £ only. Subtitles are the only text.
- **Nested pictures are clipped to their frames:** nothing overflows a poster, screen, page, bubble or window.
- **Draw order is right:** hands and props never slip behind what they should be in front of.
- **Arms point where the character means;** a flipped rig's pose targets are mirrored with it.
- **Props go where the characters go:** nothing left behind that should be carried.
- **Attention reads before a reaction:** we see a character notice something (the head and eyes go to it, and the
  camera helps) before they react to it.
- **Crowds:** silhouettes in the place's medium, set back in value and faceless, where the story has a public.
- **Subtitles:** a karaoke banner per phrase, the words filling in the singer's colour as they're sung (her warm red,
  his mustard, in each look's own inks). The banner takes the style of the world the shot is in (`src/karaoke.js`):
  - **ink:** a 1930s sing-along title card with an Art Deco rule, period lettering, and a bouncing ball that lands on
    each word as it starts; it weaves and grains with the projected film.
  - **card:** a strip of cut card; a chip of card in the singer's colour slides under each word as it's sung, on twos.
  - **doodle:** a scrap torn from her notebook; the line is pencilled in her hand, then inked in biro and coloured in
    with the singer's pencil as it's sung.
  - **riso:** a printed slip in the blue drum; the sung words overprint in fluoro pink (her) or yellow (him), out of
    register. There's no black.
  - **bank:** an engraved banderole in the house teal; the sung words print in the singer's ink over fine lines.
  - **Changing style, the text stays put:** every style shares one layout (row splits, baselines, centre, each word's
    slot, the banner's size per phrase), so only the material changes. The change is a quick crossfade (0.3 s; 0.16 s
    in Z1's panel run) or, where the picture sweeps (a copier's light bar, a door, a smear, the tear), a sweep across
    the banner in step with it. The karaoke fill carries straight across; the backing tags restyle in place.
  - **Which look:** the look of the shot's main subject at that moment, from a per-time table (`K_WORLD`). It
    restyles at a cut, or at the visible moment the picture changes medium (the copier's flash, the tear, the pull
    back, the clap). In a mixed shot it takes the singer's own medium; a picture inside a picture sets it only when
    it fills the frame. In Z1's chase it follows Tess through each panel's divider.
  - **Backing tags** are anchored once, when they appear, and don't move until they go.

## 6. Output

- 24 fps, 1920×1080 working size.
- The master is 4K (3840×2160), supersampled at 2× (`--os=2 --ss=4`, Chrome's `msaa_is_slow`): about 50 minutes for
  the whole film.
- Drafts are 1080p at 3× supersampling, rendered whole after each batch of changes, for a fresh viewing.

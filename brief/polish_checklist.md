# Polish round checklist

The standard for the scene-by-scene polish pass. It's built from the issues the user has caught; each item is a
class of problem to hunt for in every shot. See `brief/directive.md` for the decisions behind them.

## Staging and continuity
- **Layering:** a hand, prop or limb must never pass behind something it should be in front of (e.g. the
  schoolmaster's pointing hand behind a pupil). Check draw order wherever figures overlap.
  A hand and its arm go together: hands over a prop with the wrists behind it read as floating hands (the user,
  V2h's life card). Grip at the edges, or draw the whole arm in front.
  And an arm never covers what the character is showing (her drawing in F4); wrists stay straight and relaxed, the
  cuff tapering into the wrist. Check hands at 4K before calling a pose done.
- **Props at their real size** against the characters (a laptop narrower than his shoulders, not the size of his
  torso: the user, V2h). Readability comes from framing, not oversized props.
- **Prop continuity:** props go where the characters go. Nothing is left behind that should be carried (the pupils'
  homework sheets). Nothing pops in or out between cuts without a reason. Things held stay in the hand.
- **Direction:** arms point where the character means (the schoolmaster's arm when flipped), eyelines land on what
  they react to, and a flipped rig's pose targets are mirrored with it.
- **Readable attention:** before a character reacts to something, we see them notice it. The head and eyes go to it,
  and the camera helps if needed (his look at the poster before the eye roll).
- **Emotion changes land on the lyric and read.** A face doesn't switch mood without a beat for it.

## Media and framing
- **The media rule:**
  1. A figure takes the medium of the place it's physically in.
  2. A picture inside a picture keeps its own medium, bounded by its frame.
  3. Crossing between media happens only at a visible boundary or moment.
- **Nested pictures are clipped to their frames** (posters, screens, pages, bubbles, windows): no overflow.
- **Hats and accessories don't hide a design's identity** (the pets' caps are gone).
- **No bills in the good future** (the user): no bill, rent book or bad-world prop in a good-future frame.
- **No words in pictures:** pictograms, digit-like ticks and £ only.

## Motion and timing
- **Puppets on twos, camera on ones.** No camera move computed from stepped time; check with `tools/steps.py`.
- **Card is rigid and rooted:** still pieces are pixel-still, parts move rigidly, little squash and stretch.
- **The bank ground doesn't redraw** under a still camera.
- **No double jumps:** no two big changes within about 0.5 s. Cuts land on words or beats, and each composition
  holds long enough to read.
- **Transitions are finished:** no placeholder frames, no washed-out or empty in-betweens, no hard cut where a
  continuous move was intended.

## Posing and movement (the user, 2026-09-25)
- **No awkward poses.** Look at every held pose and key drawing as a silhouette: clear, with a line of action, weight
  on something. Hunt for: elbows or wrists bent the wrong way, hands at impossible angles, limbs passing through the
  body or a prop, stiff mirror-image "twinning" of both arms or both characters, arms hanging dead through an emotional
  line, a head turned further than a neck allows, feet floating or sliding, contacts that don't land (a hand on a prop,
  a seat, a rail, another character), a character facing away from what they're addressing.
- **Elbows** (the user, 2026-09-26): an elbow bends with the upper arm angled out from the body and the forearm
  folding in front; never bent in toward the body or backward, and never flipping its bend mid-move. An arm doesn't
  stay dead still through a long stretch.
- **No self-cancelling overlaps:** where a limb or ribbon overlaps itself or the body, both stay filled (no even-odd
  holes in the hatching or crayon).
- **Moves and rests suit the character.** Tess: tall, dry, deadpan, economical, the sarcasm in small gestures. Rowan:
  stocky, grounded, grumbling, heavier on his feet. The bots: eager and sincere, bouncy on their accents, busy. The
  bosses: smug, expansive, pleased with themselves. Nobody fidgets without a reason; nobody freezes without one.
- **Moves suit the look.** Card: pieces rotating on their joints, rigid, few in-betweens, a stop-motion hold between
  moves. Rubber hose: bouncy, squash and stretch, follow-through, bendy limbs. Doodle: loose and hand-drawn, on twos.
  Riso: printed copies (the motion is the copy's, and degrades with it). Banknote: stately, solid pieces, the ground
  still.
- **Screens face whoever is using them.** A phone, laptop or tablet in use faces its user (we see its back or edge);
  it turns toward us only when it's shown to us (a reveal, a shove at the lens). Held to an ear: screen to the cheek,
  the hand wrapped naturally round it, no bent-back wrist (the user, on V2a and V2g).
- **To show what's on a screen, cut to its user's point of view** (the user, 2026-09-27): an insert looking down past
  their hand at the screen, as V2e's do-not-disturb insert does. Never turn a screen to the camera to show its content
  (that turns it away from its user), and never float its content out of it in the wide. A screen held low or at a
  side, not in use, can show its face in passing (V2a: the phone lowered to his side).
- Fix by re-posing (the rigs' pose targets and named poses), re-timing a move, or adding the missing anticipation,
  settle or follow-through. Before/after for each.

## Pacing (the user, 2026-09-25: checked per scene)
- **Not too much in too little time.** List each shot's beats (actions, reactions, reveals, camera moves, cuts) with
  their times. A simple action needs about half a second to read; a new idea, a gag's setup or payoff, or a pictogram to
  parse needs about a second; a reaction needs a beat after what it reacts to. Where beats pile up, re-time them within
  the shot (lyric-anchored beats stay on their words), simplify, or move a minor beat somewhere quieter.
- **No dead air.** No stretch of a second or more where nothing new happens and nothing is alive. A hold the user asked
  for (the poster hold, the V2d linger, the Z1 pile-up, the breakdown's stillness, F2's breathing room, the final hold)
  is intended, but it still has life in it: breathing, blinks, a drift of the camera. Resolve true dead air with
  secondary action, a camera move, or by re-timing a beat into it.

## Artefacts
- Stray marks: floating smudges, specks, lines, black corners, tacks pinning nothing, grout crossing a poster,
  shadows over pictures.
- Boundaries that show: a clip edge, a mask shape, a seam.
- The subtitle banner covering the key action: reframe, or move the action up. The banner's height differs by look (it
  takes each world's style), so check it in every shot.

## Who lip-syncs what
- The narrators (Tess, Rowan) sing their lines on screen, music-video style, except where the line quotes someone who
  is on screen: then the quoted character mouths the quote and the narrator narrates, mouth shut (the office, V1a–V1b:
  the boss says "Just show it what you do" and "We won't be needing you"; Tess says only her asides). `lipPart()` in
  `demo/mouths.js`, `o.sing` on `person()`.
- Approved (the user): Muse "You're a great fit", Gemini "No, you're not", Clawd "I hear you". Exception, kept: Tess
  says "If we don't, then China will!" herself, mimicking the boss with her rolled-up flyer for a megaphone.
- Silent reactions keep the mouth shut (an open surprised mouth reads as singing).

## Characters
- **Costumes:**
  - Tess (her): tomato coat, cream scarf, curly bun with a pencil through it, round glasses.
  - Rowan (him): mustard parka, beanie, no moustache.
  - Copilot's disguise: her whole look.
- **The bot rule:** every bot is sincere and helpful, never menacing.
- **Caricatures:** Musk, Zuckerberg and Altman as redrawn; Musk's hair sits on his head.

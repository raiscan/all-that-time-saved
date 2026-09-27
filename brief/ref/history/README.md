# Design history

A curated, dated record of how the film's design evolved: model sheets, looks, and the before/afters the user reacted
to. It's for looking back, not for every render. Our renders live in `out/` (gitignored); the 2026-09-25 cleanup deleted
`out/demo/`, which held the early sheets. Every frame is a pure function of the code at a commit, so the lost sheets
were **re-rendered from the commits that drew them** (each in a throwaway worktree, with that commit's own
`render.mjs`) and checked against the copies the session transcript kept of the originals (most match to within a few
per cent RMSE; the exceptions are noted below). Later milestones that still existed in `out/` were copied from there.
Three images (dated 2026-09-26) show the design now, rendered from HEAD 87014b9, as the other half of the then-and-now
pairs.

Files are `YYYY-MM-DD_<topic>_<what>.jpg`, about 1600 px on the long side (one 4K crop kept at 100% where the detail
was the point). Quotes are from [../../directive.md](../../directive.md) unless marked as the user's words in the chat.
Going forward, a design the user reacts to or chooses gets a copy here when it's decided.

Sources: **re** = re-rendered from the commit shown; **out** = kept from `out/` (rendered while that commit's work was in
progress or just after); **spike** = the untracked pre-git style spike (`spike/`, excluded from git), kept from `out/spike/`.

## Index (chronological)

### 2026-09-24

- `cast/2026-09-24_cast_spike-first-model-sheet.jpg`: the very first model test: the commuter (front, 3/4, side, back) with Copilot, Muse and Clawd for scale. The user: "throwaway model test sheet, go." Fed: "Style: more Neo-Noir / Gothic Rubber House style, with a bit of Newgrounds / Early Flash Aesthetic." (spike, before 7fc9abc)
- `cast/2026-09-24_cast_spike-neo-noir.jpg`: the noir steer: the commuter, the first Musk and a first Grok. The user: "good early drafts. need more caricature and higher quality drawings. arms on the main character look weird". (spike)
- `cast/2026-09-24_cast_commuter-ink-and-card.jpg`: the first commuter on the two-look style layer, noir rubber-hose ink and stop-motion card. Fed: "past = rubber hose, present = the cut-out card concept". (re, 7fc9abc)
- `bots/2026-09-24_bots_first-grok-and-muse.jpg`: the first Grok (a teal parody alien with an antenna, tailpipe and white gloves) and Muse (the blue egg with a propeller), in ink and card. (re, 22f8d6f)
- `caricatures/2026-09-24_caricatures_musk-first.jpg`: the first Musk, ink and card. "There are multiple humans in the story, including Elon Musk, Zuckerberg etc." (re, 22f8d6f)
- `caricatures/2026-09-24_caricatures_zuck-first.jpg`: the first Zuckerberg (the saucer stare), ink and card. (re, 22f8d6f)
- `ad/2026-09-24_ad_1930s-ad-first.jpg`: the first 1930s ad: the gent in his hammock, the robot butler, the sun and the cuckoo clock, ending in the burn. (re, 22f8d6f)
- `looks/2026-09-24_looks_demo-ink-and-card.jpg`: the whole first demo (carriage, ad, bunker) in ink and in card. (re, 22f8d6f)
- `looks/2026-09-24_looks_commuter-doodle-and-engrave.jpg`: the two new looks: doodle (biro and coloured pencil) and engrave (Victorian etching). "good future = hand-drawn doodle on lined paper; bad future = Victorian engraving (proposed, being concepted)." (re, ffe2fe2)
- `looks/2026-09-24_looks_eras.jpg`: the demo with each era in its own medium (present card, past ink, bunker engraved). (re, 383047c)
- `looks/2026-09-24_looks_engraved-turbine-street.jpg`: the engraved turbine street. "the engraving is 'really, really good' but reads as the past (and like banknote styling), not the bad future." The engrave look was dropped; its line work became the banknote. (re, 68d1fca)
- `staging/2026-09-24_staging_karaoke-first.jpg`: the first karaoke banner, filling word by word in the singer's colour. "Subtitles ON, 'like the P(doom) song'". (re, b2aefdb)
- `cast/2026-09-24_narrators_pairs.jpg`, `_pairA`, `_pairB`, `_pairC`, `_pairLooks`: the narrator concepts: A tall and small, B round and sharp, C block and line, and a pair in the four looks. "Narrators: pair C ('block and line') with slightly less height difference; the 3/4 profiles and noses 'look very, very weird' and must be redone." (re, 3688ded)
- `looks/2026-09-24_looks_flip-then-pencil-friday.jpg`: the good future's Friday in the flip look ("slightly better drawn (less doodley, more flip/stop-motion)"), then as pencil animation. "Rolled back: the pencil version 'not looking hand-drawn anymore'." Both dropped for the doodle. (re, c7270f1 and b47d430)
- `cast/2026-09-24_cast_pairC-refined.jpg`: pair C refined: a smaller height gap, 3/4 heads that turn, new noses. (re, 0afb233)
- `cast/2026-09-24_cast_pairC-heads.jpg`: pair C's heads, front and 3/4, after the user's "The side profile and noses look very, very weird." (re, 0afb233)
- `looks/2026-09-24_looks_photocopy-cmyk-and-riso.jpg`: the photocopy look on the three pairs: CMYK process and riso. "like a printer could do C M Y K dot shading". (re, da1a33d)
- `looks/2026-09-24_looks_doodle-friday.jpg`: the doodle Friday in the neon den. "I really like the Friday doodle now"; "longer, softer strokes". (re, f244ed6)
- `looks/2026-09-24_looks_banknote-colour-in-lines.jpg`: the banknote with its colour in the engraved lines, not the fill. "the colour in the banknote should not be from the fill ... it should come from the strokes/lines" (the user). (re, 0d523c1)
- `looks/2026-09-24_looks_photocopy-street-variants.jpg`: the turbine street as a photocopy in five variants (riso, CMYK copier, hivis, mono, degraded) under a banknote plant. "Photocopy = RISO only; the other photocopy variants are dropped." (re, 7d1b55f)
- `looks/2026-09-24_looks_banknote-concept-teal.jpg`: the banknote bunker concept (the note that becomes the bill) in the teal house ink. "Banknote house ink = teal". (re, 6240c5e)
- `bots/2026-09-24_bots_copilot-gemini-codex-clawd.jpg`: the second wave: Copilot, the Gemini twins, the Codex gang (cat, terminal, ghost, crab, dog) and Clawd. "they should be chosen from a pool of characters, eg. claude, copilot, codex, muse, grok, gemini". (re, 1e06b56)
- `bots/2026-09-24_bots_second-wave-in-five-looks.jpg`: the same bots in ink, card, doodle, riso and bank. (re, 1e06b56)
- `staging/2026-09-24_staging_friday-pairC-shot-reverse-shot.jpg`: the Friday as shot/reverse-shot (behind them to the TV; the reverse from the TV), recast with pair C. "they faced away from the TV → restage as shot/reverse-shot". (re, 36f887c)
- `caricatures/2026-09-24_caricatures_dorsey-altman-turnbull-dario.jpg`: the first Dorsey, Altman, Turnbull and Dario (with the red ✗). "caricatured as Matt Turnbull, whose post the lyric refers to"; "Dario Amodei is 'the checkout'". (re, fdf0783; the three from e710cfa)
- `bots/2026-09-24_bots_grok-redesign.jpg`: Grok before and after: the parody alien, then "the current official look (per the user): a white sphere with two black coin-slot eyes (keeping the tailpipe and white gloves)". (re, 22f8d6f and f17641d)

### 2026-09-25

- `looks/2026-09-25_looks_turbine-plant-three-ways.jpg`: the turbine stretch mixed, all banknote and all riso. "the user picked riso: the whole plant is photocopied with his street". (out, dcb0402)
- `staging/2026-09-25_staging_agi-on-a-stick-prizes.jpg`: V2g's AGI on a stick with each prize (current, sparkle, brain, gpu, dots). "The AGI prize: the user picked the brain". (out, 048acad; the pick in da0bfa5)
- `bots/2026-09-25_bots_muse-egg-in-five-looks.jpg`: the egg Muse in the five looks, before Jolly. (out, cec1a81)
- `cast/2026-09-25_cast_lineup-4k-card.jpg`: the whole cast at one scale, from the supersampled 4K lineup the user asked for ("can I get a full shot of each character in the supersampled 4k?"). (out, cec1a81)
- `caricatures/2026-09-25_caricatures_likeness-pass-musk.jpg`: Musk before and after the likeness pass from reference photos, card and bank. "Both Elon and Sam Altman don't look very close". (out, 61d7949; the reference photos cropped away)
- `caricatures/2026-09-25_caricatures_likeness-pass-altman.jpg`: Altman before and after the same pass: "textured hair with a choppy fringe, worried tented brows, narrow face and chin". (out, 61d7949)
- `looks/2026-09-25_looks_banknote-detail-levels-4k.jpg`: banknote detail levels 0 to 3 at 100% of 4K (the one 4K crop). "Banknote 'really cool' but 'a bit sparse in 4K'"; "level 2 or 3 detail both great". (out, 1409416)
- `looks/2026-09-25_looks_banknote-figure-ground.jpg`: Dorsey without and with the figure/ground system (deep-engraved figures, a pale underprint ground, a paper halo). "Banknote main characters must stand apart from the background". (out, 0261b91)
- `looks/2026-09-25_looks_banknote-halos.jpg`: the halo round the figures: the blotchy soft gradient, a crisp cut, and the line-level vignette that became the default. "a touch too blotchy". (out, 896b856)
- `caricatures/2026-09-25_caricatures_musk-hairline.jpg`: Musk's hair perched on his crown, then the hairline below it. "Musk's hair 'floating above his head a bit' (the user half-liked it for laughs)". (out, c6565ba)
- `staging/2026-09-25_staging_v3a-horses-before-after.jpg`: the race horses before and after the rebuild: engraved thoroughbreds cut open on clockwork, Altman losing his grip. "the horse looks really janky"; "lots of moving gears and turning parts which can be seen internally". (out, 896b856)
- `staging/2026-09-25_staging_z1-chase.jpg`: Z1's chase through the four media, the butler turning into the bots at each divider. "no transformation puff"; "The Z1 chase is liked". (out, 3eb6015)
- `bots/2026-09-25_bots_codey-and-the-codex-pets.jpg`: before, the Codex gang; after, Codey and the real Codex pets (model sheet). "Codey ... leads the Codex pets; the other pets are the real Codex pet types". (out, c1ac615)
- `looks/2026-09-25_looks_riso-lines.jpg`: the riso's line art as it was, and "c + auto" (the printed line and the subject-proportional dots). "c + auto looks great". (out, 12b823f)
- `looks/2026-09-25_looks_rubberhose-rethink.jpg`: V3d before and after the rubber-hose rethink (one outline in proportion, lighter inner lines). "the outline is so thick small bots lose their features". (out, 13e7915)
- `bots/2026-09-25_bots_codex-pets-rubberhose.jpg`: the Codex pets in ink before and after the rethink, translated into the idiom. (out, 13e7915; the user's reference panel cropped away)
- `staging/2026-09-25_staging_storyboard-keyframes.jpg`: the storyboard's keyframe sheet from the share pack made for the clean-lyrics work. (out, 307dab8)
- `looks/2026-09-25_looks_pastel.jpg`: the past's cast at three pastel strengths (off, .6, 1). "the colours are too vibrant for the style ... slightly desaturated pastels"; .6 the default. (out, 489aa6d)
- `staging/2026-09-25_staging_v2d-reverse-vs-restaged.jpg`: V2d's reverse angle, and the restage on one axis with the car on the near track. "the reverse angle 'doesn't work'". (out, b7784af)
- `ad/2026-09-25_ad_scenes-original-vs-rubberhose.jpg`, `ad/2026-09-25_ad_gent-original-vs-rubberhose.jpg`, `ad/2026-09-25_ad_butler-original-vs-rubberhose.jpg`: the ad's gent and butler, original then redrawn in rubber hose, across the scenes and in 4K crops. "The ad's gent and butler in rubber hose supersede the originals"; the originals are kept at tag `backup/ad-old-gent-butler`. (out, 8ea2ee7)
- `caricatures/2026-09-25_caricatures_altman-old-new-hybrid.jpg`: V3d's schoolmaster: the old ink Altman, the full rubber-hose redraw, and the hybrid. The user: "What I like from the old altman: head, face. What I like from the new altman: body, eyes"; the hybrid: "perfect". (out, dbf1df0)
- `staging/2026-09-25_staging_karaoke-banners-five-looks.jpg`: the subtitle banner in each world's style (ink sing-along strip, card chips, doodle scrap, riso slip, engraved banderole). "it would have been nice to have it change style along-side the scenes". (out, 886d12a and 670475c)

### 2026-09-26

- `bots/2026-09-26_bots_muse-jolly.jpg`: Muse redrawn as Jolly, Meta Muse's plush mascot, with her wrist Muse. "muse looks very different than that" (the user). (out, df02383)
- `staging/2026-09-26_staging_z3-a-and-b.jpg`: Z3's two treatments: A, the bots' sand wall round her page; B, the drawn couple bumping the page's edge. "the user disliked both A and B: 'go back to the writers room'". (out, 7cf58f4)
- `bots/2026-09-26_bots_muse-charm.jpg`: her Muse as the Muse Charm, a black glossy puck, Jolly leaving it across the screen's edge. "instead of a watch, maybe we should have the muse charm" (the user). (out, 3bbd7e5)
- `staging/2026-09-26_staging_z3-faces-at-the-table.jpg`: Z3/Z4 as "faces at the table": the bill, the bots leaving the phone, the rent book, the counter turned face down, the flip. "Picked pitch 3, 'faces at the table'". (out, be500a4)
- `cast/2026-09-26_cast_lineup-now-card.jpg`: the whole cast now, in card. (re, HEAD 87014b9)
- `cast/2026-09-26_cast_tess-and-rowan-now-five-looks.jpg`: Tess and Rowan now in the five media (each figure drawn to the sheet's height). (re, HEAD 87014b9)
- `staging/2026-09-26_staging_animatic-vs-film.jpg`: the first animatic (2026-09-24, 0e22fa6) above the film at the same twelve times now. (out 0e22fa6; re HEAD 87014b9)

### Notes on fidelity

- The commuter's card sheet is drawn on `demo/card.html`; the original was rendered on the Musk card dev page (a darker backdrop and a stray line; the figure is the same).
- `looks/2026-09-24_looks_eras.jpg` is from 383047c, the commit that carried the per-era wiring; the version shown had lighter engraving (the darker tones landed before it was committed).
- The doodle commuter is ffe2fe2's committed doodle (whites left as paper); the render shown minutes earlier coloured the whites and was never committed.
- The flip Friday is from c7270f1 (4ac5f54 introduced the look; the Friday den in it landed in c7270f1).
- Nothing needed was unrecoverable. The originals of every `out/demo/` sheet are also still in the session transcript (the Read tool kept the image bytes), should an exact copy of a shown-but-never-committed state ever be wanted.

## Credits picks

For the end credits, in order, each with a caption in her hand. Pairs read then → now.

1. `cast/2026-09-24_cast_spike-first-model-sheet.jpg`: "the first sketch, Sept 24"
2. `cast/2026-09-24_narrators_pairs.jpg` → `cast/2026-09-26_cast_lineup-now-card.jpg`: "three pairs, Sept 24" → "Tess and Rowan, Sept 26"
3. `caricatures/2026-09-24_caricatures_musk-first.jpg` → `caricatures/2026-09-25_caricatures_likeness-pass-musk.jpg`: "Musk, take one" → "Musk, from the photos"
4. `bots/2026-09-24_bots_grok-redesign.jpg` (before/after in one): "Grok, before the sphere"
5. `looks/2026-09-24_looks_engraved-turbine-street.jpg` (then; pairs with 16): "engraving: loved, then dropped"
6. `looks/2026-09-24_looks_flip-then-pencil-friday.jpg` (then; pairs with 16): "flip, pencil, back to biro"
7. `looks/2026-09-24_looks_doodle-friday.jpg`: "the Friday doodle, approved"
8. `looks/2026-09-24_looks_photocopy-street-variants.jpg` (then; pairs with 16): "five photocopies; riso won"
9. `staging/2026-09-26_staging_animatic-vs-film.jpg` (then above, now below): "animatic, then the film"
10. `looks/2026-09-25_looks_banknote-figure-ground.jpg` (before/after): "banknote: figure and ground"
11. `staging/2026-09-25_staging_v3a-horses-before-after.jpg` (before/after): "the horses, rebuilt"
12. `bots/2026-09-25_bots_codey-and-the-codex-pets.jpg` (before/after): "the Codex gang, then Codey"
13. `caricatures/2026-09-25_caricatures_altman-old-new-hybrid.jpg`: "Altman: old, new, hybrid"
14. `ad/2026-09-25_ad_gent-original-vs-rubberhose.jpg` (before/after): "the gent, before rubber hose"
15. `bots/2026-09-25_bots_muse-egg-in-five-looks.jpg` → `bots/2026-09-26_bots_muse-jolly.jpg`: "Muse, before Jolly" → "Muse as Jolly"
16. `cast/2026-09-26_cast_tess-and-rowan-now-five-looks.jpg` (now, for 5, 6 and 8): "the final five media"

### 2026-09-26 (the album cover)

- `staging/2026-09-26_cover_five-designs.jpg`: five cover designs rendered in-engine at 3840×2880 (4:3): worlds, promise, note, torn, train, each with and without the title.
- `staging/2026-09-26_cover_worlds.jpg`: the user's pick, worlds (title): "worlds_title_preview is amazing". Embedded as the album art in assets/song.mp3. (video/cover.html, b57b593)
- `staging/2026-09-26_cover_worlds-square.jpg`, `staging/2026-09-26_cover_worlds-9x16.jpg`: worlds reflowed for streaming (3000×3000) and Suno's portrait (1080×1920): the five worlds as three bands and a split, the title down the left. (video/cover.html ?fmt=1x1|9x16, 1a9af90)
- `staging/2026-09-26_I3_point-gesture-versions.jpg`: Tess's "That was the point!" as it went: B (25 Sep, arms at her sides, the forearm out level), C (26 Sep, out of the fold, reaching down and out; its elbow crooked in), D (26 Sep, the presenting gesture, forearm up). The user picked B's gesture (15dde62), then went back to D (the user changed their mind).
- `looks/2026-09-26_bank_ground_A-D_4k.png`, `looks/2026-09-26_bank_ground_A-vs-D_draft.jpg`: the bank look's ground lines, four ways (A the pen, B a width floor, C coarser, D engraved rules) at 4K, and A against D in the full 1080p drafts. The user picked D: "visually a lot clearer, it's not even a contest".
- `staging/2026-09-27_cover_worlds-16x9.jpg`: worlds reflowed for YouTube (16:9, 3840×2160, and the 1280×720 thumbnail): the title across the top, a word per world, the signature over her page, the bottom right clear for the duration badge. (video/cover.html ?fmt=16x9)

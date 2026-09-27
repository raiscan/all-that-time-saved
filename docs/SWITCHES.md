# Page switches

The `?query` parameters the pages still read. Pass them in the URL (`video/studio.html?final&t=120`) or through
`render.mjs --query='k=v&k2=v2'`. Decided questions have no switch: the chosen version is the only one, and the old
versions are in git (tag `backup/pre-switch-cleanup` has every variant that was removed on 2026-09-26).

## Open creative choices

None at present.

## Alternate versions (kept by the user's choice)

- `polka`: the polka credits. The end credits play the user's Suno yodel-polka cover as heard on a cheap radio on a
  resort's reception counter (`assets/credits_polka.mp3`, built by `tools/credits_polka.py`), and radios are doodled in
  the margins of her page playing it; its yodelling is subtitled, a syllable to each sung note, with "(accordion solo)" and "(oom-pah)" captions for the band (`src/polka_lyrics.js`, made by `tools/yodel_subs.py`; drawn by `src/karaoke.js`).
  `PROJECT.creditsPolka` in `video/config.js`. For a full render pass
  `--query='final&polka'` to `--frames`, and `--query=polka` to `--encode` (it picks the credits' music).

## Render and dev tools

Set by `render.mjs`:

- `render`: headless render (no scrub bar).
- `ss=N`: draw at N× and scale down (`--ss`).
- `os=N`: output at N× 1080p; `os=2` is 4K (`--os`).
- `msaaslow`: set with Chrome's `--msaa_is_slow` (the default); skips GPU waits that only help a multisampling canvas.

Any page:

- `final`: the film without the animatic's labels (video pages).
- `t=S`: open the scrub bar at S seconds.
- `loop=NAME`: play a model-sheet loop instead of the timeline (`render.mjs --loop` does the same).

Dev pages and model sheets:

- `look=card|ink|doodle|xerox|bank`: draw a sheet in that look (lineup, bills, crowd, bots, bosses, present, audit,
  jitter; dev-audit also takes `engrave` and `flip`).
- `who=`: which rig. Lineup: a rig name (default `all`). Jitter bed: `trio|her|him|musk`. Horse test beds:
  `altman|musk|zuck|silks`.
- `rig=`, `page=1|2|3`, `e=`: the face and body audits (dev-audit): the rig, the page, the emotion.
- `idle=0`, `blink=0`, `take=1`, `drift=1`, `zoom=`: the jitter bed (dev-jitter): no idle life, eyes held open, an
  emotion change, the office camera's drift, closer.
- `coat=`, `f=`, `s=`, `win=0`, `pose=flag`, `dark=1`: the horse test beds (the coat, the gallop frame, the scale, no
  cut-away windows, the jockey's pose, a dark ground).
- `pets=1`: the crowd bots sheet (`LOOPS.crbots`) with the Codex pets.

Checks:

- `subslook=ink|card|doodle|xerox|bank`: every subtitle phrase in one look.
- `lipslog=1`: log which frames lip-sync (coverage).
- `bankvig=show`: outline the bank look's figure vignettes in red.
- `bankgl=0`: draw the bank look's triangles through p5 instead of the raw WebGL path.
- `crdbg=wall,win,in,out`: leave those layers out of the chorus's commuting crowd (crowdCommute).
- `v3dbg=noarch,onlyarch,noview,nocast`: B1's rave: without (or only) the nave's arch; the club's exterior without
  the view through its window or the two of them.

# The polish round: instructions for the chapter agents

You're polishing one chapter of the music video "All That Time Saved" (repo: `the project root`;
p5.js + p5.brush, rendered headless by `render.mjs`; every frame is a pure function of t). It's a craft pass, not a
creative one: find and fix defects, tighten pacing, and bring anything creative back as a question or a switch.

## Read first
- `brief/polish_checklist.md`: the standard. Every item, every shot. Pacing and lip-sync are new this round.
- `brief/animation-style.md`, `brief/story.md`, and `brief/directive.md` (decisions, newest last: anything the user set
  there is locked unless it's a clear defect; if a fix would change it, ask in your report instead).
- `docs/STORYBOARD.md` for your shots, and your chapter file's header comment and timing tables.

## Locked (don't change)
- Z4's page flip and its timing. The stamp pressed straight down (P1b/P2b). V2d's TD timings and staging (just
  restaged). The V2c thought-bubble timings. The office lip-sync (V1a–V1d). The 1930s ad's default look. The Z1 chase's
  pile-up linger. Cut times (they land on the lyric) unless a cut is clearly broken; ask first.

## Method, per shot
1. Look before you touch: a contact sheet of the shot (`--sheet`), every-frame strips across its transitions and busy
   moments (`--strip=a:b`), crops for details (`--crop=x,y,w,h`), 4K (`--os=2`) where fine detail matters.
2. The checklist, item by item. Write down every defect with its time.
3. Posing and movement: every held pose and key drawing against the checklist's "Posing and movement" (awkward
   poses, moves that don't suit the character or the look). Strips (`--strip`) show the motion; crops show hands.
4. Pacing: list the shot's beats with times (from the code's timing tables and by eye); flag crowding and dead air.
   To find dead air, measure motion: render the chapter as a clip without supersampling
   (`node render.mjs --page=video/studio.html --query=final --clip=a:b --ss=1 --out=out/polish/<ch>/motion.mp4`), then
   `ffmpeg -i <clip> -vf "crop=iw:ih*0.82:0:0,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-" -f null -`
   gives the frame-to-frame difference above the subtitle banner; smooth it over half a second and flag stretches of a
   second or more near zero. (Puppets step on twos, so single zero frames are normal.) Then judge by eye: a hold can
   be intended.
5. Lip-sync: who mouths what in each shot, against the checklist's rule. `lipPart()` for a character's quoted words.
6. Fix: clear defects directly. Re-time beats within a shot (lyric-anchored beats stay on their words). Anything that
   drops or adds a gag, restages a shot or changes a look: behind a `?switch` with the current version the default,
   and in your report as a question.
7. After each fix: the before/after (sheet or strip), in `out/polish/<chapter>/`, named for the shot and the fix.

## Rules
- Never `git stash`, `git checkout -- <file>` or `git restore` on the shared tree: other agents' uncommitted work lives there. For "before" renders use a worktree at HEAD (`git worktree add /tmp/before-<name> HEAD`, symlink `node_modules`).
- Puppets on twos (`mt(t)`), cameras on continuous t; `tools/steps.py` checks. Card rigid. The bank ground doesn't
  redraw. Every bot sincere. No words in pictures.
- If you move a transition, the subtitle banner's style switch may need to move with it (`K_WORLD` in `src/karaoke.js`).
- Keep edits to your chapter file where you can. Shared files (`demo/style.js`, `demo/props.js`, `demo/mouths.js`,
  `demo/cast/*`, `demo/sets/*`, `src/*`): minimal, scoped edits (guarded to your shots where possible); re-read the
  file right before editing (other agents are editing too); check a frame from another chapter is unchanged; commit
  promptly.
- Commits: only your paths (never `git add -A`, `git add .`, `git commit -a`), one per logical fix or per shot, the
  message ending with `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`. A pre-commit hook rejects
  .js that doesn't parse. If you edit `video/board.js` (single-quoted strings: escape apostrophes), run
  `node tools/board_md.mjs`.
- Renders: `node render.mjs --page=video/studio.html --query=final ...`. `--clip=a:b` muxes the song (never add
  `--encode`). The Bash tool's shell is zsh: quote `--query` values containing `&`; use `bash -c` for loops. The GPU is
  shared with other agents: keep renders small (sheets, strips, short clips, `--ss=1` for checks).

## Report (brief)
- Per shot: what you fixed (with the before/after paths), the posing fixes, and the pacing verdict (crowded / dead air / fine) with what
  you did about it.
- Lip-sync changes.
- Questions for the user: anything creative, anything locked you think should change, and the open decisions listed in
  your task.
- A 1080p clip of your whole chapter after the fixes, with the song (`--clip=a:b --ss=2`), in `out/polish/<chapter>/`.

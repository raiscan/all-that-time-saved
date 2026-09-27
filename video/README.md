# The music video

`studio.html` is the video: the song's 54 storyboard shots (`board.js`, see `docs/STORYBOARD.md`) in order, on the
song's tempo map, with the karaoke subtitles. Finished shots come from the chapter files in `ch/` (`SHOT[id]`); every
shot without one plays its concept scene or a storyboard card, so the whole song is always watchable end to end.

After the song come the end credits (`ch/credits.js`, CR on the board), about a minute to their own music: the film's
length is the song's (`PROJECT.duration`, DUR) plus theirs (`PROJECT.credits.len`), FILM_END, and `render.mjs` puts
their music (`PROJECT.credits.audio`) at the song's end. To score them with another track, set `audio` to it and `len`
to its length (and `bpm` and `downbeat`, which time the title's steps); the scroll fits itself to the length. Every
word in them is in `CREDITS_TEXT`, at the top of `ch/credits.js`; the behind-the-scenes prints are in `assets/credits/`.

```bash
# the animatic (12 fps, 1x, fast)
node render.mjs --page=video/studio.html --frames --fps=12 --ss=1 --workers=4
node render.mjs --page=video/studio.html --encode --fps=12 --out=out/video/animatic.mp4
# a section at full quality
node render.mjs --page=video/studio.html --clip=0:15 --out=out/video/intro.mp4
# the song's end into the credits ('end': the film's end)
node render.mjs --page=video/studio.html --query=final --clip=292:end --out=out/credits/clip.mp4
# the final: 4K (add --ss=4 to supersample it), ?final hides the animatic labels
node render.mjs --page=video/studio.html --frames --os=2 --query=final --workers=4 && node render.mjs --page=video/studio.html --encode --out=out/video/all_that_time_saved_4k.mp4
```

(Clear `out/frames` between renders at different sizes or fps: frames are resumable and cached by index.)

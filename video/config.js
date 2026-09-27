// config.js: the music video. Tempo and bars come from the song's tempo map (src/beatmap.js + src/tempo.js).
// credits: the end credits after the song (video/ch/credits.js), `len` seconds from the song's end (DUR) to the film's
// end (FILM_END), with their own music, `audio`, placed at the song's end. To swap in another track: set `audio` to it
// and `len` to its length (the credits' scroll fits itself to len); `bpm` and `downbeat` (its first downbeat, s) time
// the title card's steps and can be left out. The bed is the user's Suno instrumental cut on the song's bar lines
// (tools/credits_bed.py). ?polka (the user's pick, optional: "polka credits"): the credits play the user's Suno
// yodel-polka cover as heard on a cheap radio on a resort's reception counter (tools/credits_polka.py), and radios are
// doodled in the page's margins playing it (credits.js: CRC.polka). render.mjs --encode takes --query=polka for its sound.
const PROJECT = { duration: 299.44, bpm: 136.659, offset: 0.02, audio: 'assets/song.mp3',
  credits: { len: 66.48, audio: 'assets/credits_bed.mp3', bpm: 136.659, downbeat: 0.5 },
  creditsPolka: { polka: true, len: 66.48, audio: 'assets/credits_polka.mp3', bpm: 135.04, downbeat: 0.5 } };   // (bpm: this cut's own, measured: its bass onsets hold within ~30 ms of .5 s + n beats at 135.04 for all 66 s; at 135.794 they drift half a beat late by 40 s)
if (typeof location !== 'undefined' && new URLSearchParams(location.search).has('polka')) PROJECT.credits = PROJECT.creditsPolka;

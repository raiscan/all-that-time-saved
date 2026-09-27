// animatic.js: the whole song, shot by shot from BOARD (board.js), at the real tempo, with the subtitles.
// Shots with a concept scene play it; the rest are storyboard frames: the shot's medium, its characters, and the
// shot's description as a caption (text is fine here: this is a planning reel, not the video).
//   node render.mjs --page=video/studio.html --frames --fps=12 --ss=1 --workers=4 && node render.mjs --page=video/studio.html --encode --fps=12 --out=out/video/animatic.mp4
// Finished shots: chapter files (video/ch/*.js, loaded before this) set SHOT[id] = (t, lt, dur) => { ... } for a board id;
// the reel plays them in place of the storyboard frame. ?final hides the animatic's labels.
const SHOT = window.SHOT || {};
const FINAL = new URLSearchParams(location.search).has('final');
(() => {
  const barT = b => b < BEATMAP.bars.length ? BEATMAP.bars[b] : DUR;
  const first = l => l.split(/[>+]/)[0] === 'all' ? 'card' : l.split(/[>+]/)[0];
  const LOOKNAME = { ink: 'rubber hose · the past', card: 'card · the present', doodle: 'doodle · the good future', xerox: 'riso · the bad future', bank: 'banknote · money', all: 'all four' };
  const MOOD = { 'Intro': 'hopeful', 'Verse 1': 'bored', 'Pre-Chorus': 'determined', 'Chorus': 'angry', 'Verse 2': 'sad', 'Instrumental Break': 'surprised', 'Verse 3': 'determined', 'Breakdown': 'sad', 'Bridge': 'happy', 'Final Chorus': 'determined', 'Outro': 'sad' };

  // ---- scenes: existing concept scenes, fitted to their shot ----
  const SCENES = {
    past: (t, lt) => { look('ink'); pastScene(t, Math.min(lt * .55, 3.2), { still: true }); },
    pastEnd: (t, lt, dur) => { look('ink'); const k = lt / dur; pastScene(t, k < .6 ? 1.2 + k * 2 : lerp(3.26, 4.29, (k - .6) / .4), {}); },
    bunker: (t, lt, dur) => LOOPS.bunker(Math.min(4.27, .6 + lt * (3.67 / dur))),
    copies: (t, lt) => LOOPS.copies(Math.min(lt, 6.9)),
    copies2: (t, lt, dur) => LOOPS.copies(lerp(2.3, 5.7, lt / dur)),
    friday: (t, lt, dur) => LOOPS.friday(Math.min(7.95, lt * (8 / dur))),
  };

  // ---- storyboard frames ----
  const MC = document.createElement('canvas').getContext('2d');
  function wrap(txt, font, maxW) {
    MC.font = font; const out = []; let line = '';
    for (const w of txt.split(' ')) { const tryL = line ? line + ' ' + w : w; if (MC.measureText(tryL).width > maxW && line) { out.push(line); line = w; } else line = tryL; }
    if (line) out.push(line); return out;
  }
  function cast(s, t, lt) {
    const who = s.who, mood = MOOD[s.sec] || 'neutral', figs = [];
    if (/\bHER\b/.test(who)) figs.push(x => person(x, 905, 26, HER_C, { ...feel(mood, t, { seed: 1 }), view: 'q', boilKey: 'her' }));
    if (/\bHIM\b/.test(who)) figs.push(x => person(x, 905, 26, HIM_C, { ...feel(mood, t, { seed: 2 }), view: 'q', flip: true, boilKey: 'him' }));
    if (/Musk/.test(who) && typeof musk === 'function') figs.push(x => musk(x, 905, 24, { ...feel('smug', t), boilKey: 'musk' }));
    if (/Zuckerberg/.test(who) && typeof zuck === 'function') figs.push(x => zuck(x, 905, 26, { ...feel('neutral', t), boilKey: 'zuck' }));
    if (/Clawd/.test(who)) figs.push(x => clawd(x, 905, 20, { ...feel('love', t), boilKey: 'clawd' }));
    if (/Grok/.test(who) && typeof grok === 'function') figs.push(x => grok(x, 905, 30, { ...feel('mischief', t), boilKey: 'grok' }));
    if (/Muse/.test(who) && typeof muse === 'function') figs.push(x => muse(x, 905, 26, { ...feel('happy', t), boilKey: 'muse' }));
    const n = figs.length; figs.forEach((f, i) => f(960 + (i - (n - 1) / 2) * 330));
  }
  function frame(s) {
    return (t, lt, dur) => {
      if (SHOT[s.id]) { SHOT[s.id](t, lt, dur); if (!FINAL) tag(s); return; }   // a finished shot from a chapter file
      if (s.scene && SCENES[s.scene]) { SCENES[s.scene](t, lt, dur); hud(s, t, lt, dur, true); return; }
      look(first(s.look));
      camBegin(960, 540 + 6 * Math.sin(lt * .7), 1 + .01 * lt);
      if (STYLE.mode === 'ink') { paint(rectPts(-60, -60, W + 120, H + 120), { wash: NOIR.pastSky, ink: null }); paint(rectPts(-60, 905, W + 120, 300), { wash: NOIR.pastMint, ink: null }); }   // the past: the faded 1930s palette
      else SHEET.stage(t);
      cast(s, t, lt);
      camEnd();
      if (STYLE.mode === 'xerox') xeroxGrit(t, .5);
      hud(s, t, lt, dur, false);
    };
  }
  // a finished shot's small id tag (animatic only)
  function tag(s) { push(); noStroke(); fill(20, 16, 24, 150); rect(30, 26, 96, 36, 10); pop(); letter(s.id, 78, 45, 22, '#F5B82E', { ink: false, font: '800 22px "Shantell Sans", sans-serif', screen: true }); }
  // the caption and the shot's header (on a dark card so it reads on every medium)
  function hud(s, t, lt, dur, scene) {
    const font = '30px "Shantell Sans", sans-serif';
    const lines = scene ? [] : wrap(s.what, font, 1600), h = 64 + lines.length * 40;
    push(); noStroke(); fill(20, 16, 24, 205); rect(40, 34, 1840, h, 18); pop();
    letter(`${s.id}  ·  ${s.sec}  ·  bars ${s.bar[0]}–${s.bar[1]}  ·  ${s.look.split(/([>+])/).map(p => LOOKNAME[p] || (p === '>' ? ' → ' : ' + ')).join('')}${scene ? '  ·  concept scene' : ''}`,
      70, 66, 26, '#F5B82E', { ink: false, align: 'left', font: '800 26px "Shantell Sans", sans-serif', screen: true });
    lines.forEach((l, i) => letter(l, 70, 112 + i * 40, 30, '#F2ECE0', { ink: false, align: 'left', font, screen: true }));
    push(); noStroke(); fill(245, 184, 46, 220); rect(40, H - 14, (W - 80) * clamp(lt / dur), 6, 3); pop();   // shot progress
  }

  shots(BOARD.map(s => [barT(s.bar[0]), frame(s)]));
})();

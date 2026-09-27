// credits.js: CR, the end credits, after the song: from its end (DUR) to the film's (FILM_END). They run to their own
// music (PROJECT.credits in config.js: `audio`, placed at the song's end, and its length, `len`) and fit themselves to
// its length. The scroll rolls as broadcast credits do, a whole number of pixels every frame, the same step each frame
// (4 px at 1080p: 8 in the 4K master), with a film shutter's blur over half of it (shutter), so the page neither
// judders nor strobes nor shimmers; what fits the time is the page's spacing: the gaps between the groups of credits
// open up until the roll fills it (fitScroll).
//   1. The title card, out of O1's black: the title steps through the film's five media on the downbeats, two beats
//      each (CRT.step): the 1930s rubber hose (irising up, the ad's sun bouncing on the beat), cut card, riso, banknote,
//      then settles in her biro hand on her notebook's page. The words hold their place and size across the steps (one
//      layout, as the subtitles do); only the medium changes, on the cut.
//   2. A slow scroll down the page (the camera, on ones: every frame a step), the credits handwritten in biro (Caveat) on
//      its rules, behind-the-scenes prints taped in, alternately left and right (photos of our own renders: a picture
//      inside a picture keeps its own medium, bounded by its white border), the odd doodle in the margin.
//   3. The last thing on the page: her Friday drawing (the two of them on the bean bags, as in O1), a page from her
//      sketchbook taped in. The camera settles on it; hold; fade to black.
// Every word is in CREDITS_TEXT, below. The page itself follows the doodle look: its rules and margin never boil, and
// what's drawn on it is finished, so nothing on it boils either (stillDrawing).
// ?polka (CRC.polka: the credits play the user's yodel-polka cover, as from a cheap radio on a resort's reception
// counter): little 1960s holiday transistor radios doodled in her margins play it, hopping on its beat, their grilles
// pumping, biro notes floating up out of them (the radios, below). Everything else as without it.
// Check it: node render.mjs --page=video/dev-credits.html --sheet=300,305,320,340,360 --cols=5 --w=384 --out=out/credits/a.jpg
// (the polka credits and their radios: add --query=polka)

// =====================================================================================================================
// CREDITS_TEXT: all the words in the credits, in one place. Edit names and roles here; the layout follows.
//   title   the title card, and the heading of her page
//   lines   the credits, top to bottom, one [kind, text] per handwritten line; [] leaves a ruled line blank. Kinds:
//             'head'  a section heading (bigger, underlined, a blank line above and below it)
//             'role'  a role (small, in pencil)       'name'  a name (big)
//             'line'  an ordinary line                'small' small print
//           A line too long for the column wraps by itself (at a ' · ' if it can). '{frames}' is the song's frame count
//           at 24 fps, worked out from its length. '{usage.…}' fills in Claude's usage on the film (src/credits_usage.js,
//           CREDITS_USAGE, made by tools/usage_stats.py: re-run it for the final render); without it, the lines that use
//           it (and the blank rule above them) are left out. The JavaScript line count is a snapshot: to recount the film's own code
//           (without its generated data), run
//             git ls-files src demo video | grep '\.js$' | grep -v -e lyrics.js -e beatmap.js -e horse_frames.js | xargs cat | wc -l
//   prints  the behind-the-scenes prints (assets/credits/, our own renders), taped in down the page, alternately left
//           and right, in the order they're listed (each print's top is below the one before it). at: the start of
//           the line their top lines up with (or lower, if the prints above need the room); side: 'L' or 'R'; shots:
//           [file, caption] each, and two make a pair, one above the other with an arrow between them (then and now).
//           They should end above 'Every bot in this film means well.', so the last frames hold on her Friday drawing
//           alone: prints lower down push the drawing, and the camera's end, further down the page.
// =====================================================================================================================
const CREDITS_TEXT = {
  title: 'All That Time Saved',
  lines: [
    ['role', 'Directed by'],
    ['name', 'UncleHerbert'],
    [],
    ['role', 'Story and creative direction'],
    ['name', 'UncleHerbert'],
    [],
    ['role', 'The song'],
    ['name', '"All That Time Saved"'],
    ['line', 'a song by UncleHerbert'],
    ['line', 'lyrics by Astra, with UncleHerbert'],
    ['line', 'music generated with Suno v6'],
    [],
    ['role', 'Animation, design and code'],
    ['name', 'Claude'],
    ['line', '(Claude Opus 5.5, by Anthropic)'],
    ['line', 'in Claude Code, directed shot by shot'],
    [],
    ['role', 'Built on'],
    ['name', 'Claude Animation Base'],
    ['line', 'by John Heibel'],
    ['small', 'github.com/JohnHeibel/ClaudeAnimationBase · MIT licence'],
    [],
    ['role', 'Agent control, orchestrated in'],
    ['name', 'T3 Code'],
    ['line', 'by Theo Browne and Julius Marminge'],
    ['small', 'github.com/pingdotgg/t3code · the agent harness control surface Claude Code and its helper agents ran in'],
    [],
    ['role', 'Made with'],
    ['line', 'p5.js · p5.brush'],
    ['line', 'Puppeteer and headless Chromium · FFmpeg'],
    ['role', 'Audio analysis'],
    ['line', 'Demucs (stems) · faster-whisper (word timings)'],
    ['line', 'librosa (tempo and voices)'],
    [],
    ['role', 'Type'],
    ['line', 'Shantell Sans · Limelight · Caveat · Cinzel · Space Grotesk'],
    ['small', 'Shantell Sans © 2022 The Shantell Sans Project Authors · Limelight © 2011 Sorkin Type Co · Caveat © 2014 The Caveat Project Authors · Cinzel © 2020 The Cinzel Project Authors · Space Grotesk © 2020 The Space Grotesk Project Authors · all under the SIL Open Font License 1.1'],
    [],
    ['line', 'Every frame drawn in code:'],
    ['line', '{frames} frames at 24 fps · about 34,000 lines of JavaScript · no footage'],
    ['head', 'Starring'],
    ['name', 'Tess and Rowan'],
    ['line', 'Clawd · Copilot · the Gemini twins · Grok · Muse (Jolly)'],
    ['line', 'Codey and the Codex pets'],
    ['small', '(Dewey, Seedy, Fireball, Rocky, Stacky, BSOD, Null Signal)'],
    ['line', 'the 1930s gent and his robot butler'],
    ['line', 'the boss · the landlord\'s hand'],
    ['head', 'In caricature'],
    ['line', 'Jack Dorsey · Matt Turnbull · Dario Amodei'],
    ['line', 'Elon Musk · Mark Zuckerberg · Sam Altman'],
    ['small', 'caricatures of public figures, for commentary;'],
    ['small', 'none of them was involved in this film'],
    ['head', 'References'],
    ['line', 'Eadweard Muybridge, "The Horse in Motion"'],
    ['small', '(1878): the clockwork horses\' gallop is traced from it'],
    ['line', 'Fleischer Studios\' "Screen Songs": the bouncing ball'],
    ['line', 'Codey and the Codex pets after OpenAI\'s Codex'],
    ['line', 'Muse\'s Jolly after Meta'],
    ['line', 'Clawd after Anthropic'],
    [],
    [],
    ['small', 'Claude, Copilot, Gemini, Grok, Muse and Codex, and their mascots, are trademarks of Anthropic, Microsoft, Google, xAI, Meta and OpenAI respectively.'],
    ['small', 'This film is an independent work of parody and commentary. It is not affiliated with, sponsored or endorsed by any of them.'],
    ['small', 'The bots are the film\'s own caricatures of their mascots, drawn for this film; the public figures are caricatured for satire.'],
    [],
    ['line', 'Every bot in this film means well.'],
    [], [], [], [],
    ['name', '© 2026 UncleHerbert'],
    // Claude's tally (the user: "tally Opus 5.5's usage, hours spent/tokens"), in the small print, on the last frames with
    // her Friday drawing: Opus did the film's work but the song and its lyrics
    [],
    ['small', 'made by Claude Opus 5.5, in Claude Code, {usage.dates}'],
    ['small', 'about {usage.desk} hours at the desk · {usage.helpers} more across {usage.agents} helper agents'],
    ['small', '{usage.read} billion tokens read · {usage.written} million written, {usage.thinking} million of them thinking'],
    ['small', '{usage.requests} requests · {usage.tools} tool calls'],
  ],
  // The design's history, in order down the page (brief/ref/history, its "Credits picks"): the first sketch, the
  // narrators, the looks that were dropped, the animatic, the redesigns, the five media it ended in.
  prints: [
    { at: 'Directed by', side: 'L', shots: [['cr01_first_sketch.jpg', 'the first sketch, Sept 24']] },
    { at: 'Directed by', side: 'R', shots: [['cr02_three_pairs.jpg', 'three pairs, Sept 24'], ['cr03_cast_now.jpg', 'Tess, Rowan and co, Sept 26']] },
    { at: 'The song', side: 'L', shots: [['cr04_engraving.jpg', 'engraving: loved, then dropped']] },
    { at: 'Animation, design', side: 'R', shots: [['cr05_flip_pencil.jpg', 'flip, pencil, back to biro']] },
    { at: 'Built on', side: 'L', shots: [['cr06_photocopies.jpg', 'five photocopies; riso won']] },
    { at: 'Audio analysis', side: 'R', shots: [['cr07_bunker_animatic.jpg', 'animatic, Sept 24'], ['cr08_bunker_film.jpg', 'the film, Sept 26']] },
    { at: 'librosa', side: 'L', shots: [['cr09_grok.jpg', 'Grok, before the sphere']] },
    { at: 'Starring', side: 'R', shots: [['cr10_musk.jpg', 'Musk, redrawn from photos']] },
    { at: 'Tess and Rowan', side: 'L', shots: [['cr11_horses.jpg', 'the horses, rebuilt']] },
    { at: 'the boss', side: 'R', shots: [['cr12_codex.jpg', 'the Codex gang, then Codey']] },
    { at: 'caricatures of public', side: 'L', shots: [['cr13_muse_egg.jpg', 'Muse, before Jolly'], ['cr14_jolly.jpg', 'Muse as Jolly']] },
    { at: 'References', side: 'R', shots: [['cr15_five_media.jpg', 'the final five media']] },
  ],
};

(() => {
  const CRC = PROJECT.credits || {}, LEN = +CRC.len || 0;
  if (!(LEN > 0)) return;   // (no credits in this film)

  // ---------- timing (credits time k = t - DUR) ----------
  // The title's steps land on the credits music's downbeats: its first downbeat (CRC.downbeat) and tempo (CRC.bpm),
  // two beats a medium. The page starts moving once her title has held a moment (from CRT.scroll: a little later if the
  // page is short of the time), reaches her Friday drawing with nine seconds to go, and fades to black over the last
  // three.
  const BTK = 60 / (CRC.bpm || PROJECT.bpm), STEP = 2 * BTK;
  const CRT = { in: CRC.downbeat ?? .5, step: STEP };
  CRT.doodle = CRT.in + 4 * STEP;
  CRT.scroll = CRT.doodle + 2.4;
  CRT.land = Math.max(CRT.scroll + 8, LEN - 9);
  CRT.fade = [LEN - 3.2, LEN - .35];
  const MEDIA = ['ink', 'card', 'xerox', 'bank', 'doodle'];
  const mediumAt = k => k < CRT.in ? null : MEDIA[Math.min(4, Math.floor((k - CRT.in) / STEP + 1e-6))];

  // ---------- the page ----------
  const RULE0 = 130, PITCH = 40;                        // the rules (as linedPaper(): 40 apart, from y 130)
  const PAPER = '#FBF8F0', RULE = '#9DB7DC', MARGIN = '#E08A8A', HOLE = '#E4DED2', PENCIL = '#6F6A78';
  const CX = 1000, CW = 720, TALLY_W = 1000;           // the writing column (world x): the camera looks straight down it; the tally's width
  const PX = { L: 390, R: 1660 }, PW = 400;             // the prints: centre x on each side, and the photo's width
  const TITLE_W = 1240, TITLE_Y = 540;                  // the title: its width (every medium) and its caps' centre (screen)
  const KIND = {
    head: { size: 62, col: BIRO }, role: { size: 33, col: PENCIL }, name: { size: 50, col: BIRO },
    line: { size: 40, col: BIRO }, small: { size: 27, col: BIRO },
  };
  const caveat = s => `700 ${s}px Caveat, cursive`;
  const MC = document.createElement('canvas').getContext('2d');
  const widthOf = (txt, font) => { MC.font = font; return MC.measureText(txt).width; };

  // ---------- the prints: loaded before the first frame ----------
  // (as <img> into a p5.Image: p5's loadImage fetches, and fetch can't read file:// pages, which headless renders are)
  const DIR = (() => { try { return new URL('../../assets/credits/', document.currentScript.src).href; } catch (e) { return '../assets/credits/'; } })();
  const IMG = {};
  async function loadPrints() {
    for (const f of CREDITS_TEXT.prints.flatMap(p => p.shots.map(s => s[0]))) {
      const el = new Image(); el.src = DIR + f;
      try { await el.decode(); } catch (e) { console.warn('credits: no print ' + f); IMG[f] = null; continue; }
      const im = createImage(el.naturalWidth, el.naturalHeight); im.drawingContext.drawImage(el, 0, 0);
      try { im.drawingContext.getImageData(0, 0, 1, 1); } catch (e) { console.warn('credits: print unreadable here (file:// without file access): ' + f); IMG[f] = null; continue; }
      im.modified = true; IMG[f] = im;
    }
  }
  { const _setup = setup; setup = async function () { await loadPrints(); return _setup(); }; }

  // ---------- the tally: CREDITS_USAGE's numbers, for the '{usage.…}' placeholders (null: no data, those lines go) ----------
  const USAGE = (() => {
    if (typeof CREDITS_USAGE === 'undefined' || !CREDITS_USAGE || !CREDITS_USAGE.total) return null;
    const U = CREDITS_USAGE, T = U.total, n = v => Math.round(v).toLocaleString('en-GB');
    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const day = s => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || ''); return m ? { y: +m[1], m: +m[2] - 1, d: +m[3] } : null; };
    const a = day(U.start), b = day(U.end) || a;
    const dates = !a ? null : a.y !== b.y ? `${a.d} ${MONTHS[a.m]} ${a.y} – ${b.d} ${MONTHS[b.m]} ${b.y}` : a.m !== b.m ? `${a.d} ${MONTHS[a.m]} – ${b.d} ${MONTHS[b.m]} ${b.y}`
      : a.d !== b.d ? `${a.d}–${b.d} ${MONTHS[a.m]} ${a.y}` : `${a.d} ${MONTHS[a.m]} ${a.y}`;
    const V = { dates, desk: U.active_h != null ? n(U.active_h) : null, helpers: U.agent_h != null ? n(U.agent_h) : null, agents: U.agents != null ? n(U.agents) : null,
      read: T.all != null ? (T.all / 1e9).toFixed(1) : null, written: T.output != null ? n(T.output / 1e6) : null, thinking: T.thinking != null ? n(T.thinking / 1e6) : null,
      requests: T.requests != null ? n(T.requests) : null, tools: U.tools != null ? n(U.tools) : null };
    return V;
  })();
  // a line's text with its placeholders filled; null if it needs a number that isn't there
  function fillText(raw, frames) {
    let ok = true;
    const txt = raw.replace('{frames}', frames).replace(/\{usage\.(\w+)\}/g, (_, k) => { const v = USAGE && USAGE[k]; if (v == null) { ok = false; return ''; } return v; });
    return ok ? txt : null;
  }
  // the credits' lines, less the tally's if there's nothing to fill them with (and the blank rule above them)
  const LINES = CREDITS_TEXT.lines.filter((e, i, A) => {
    const usesU = f => f && f.length > 1 && /\{usage\./.test(f[1]);
    if (USAGE) return true;
    if (usesU(e)) return false;
    return !(!(e && e.length) && usesU(A[i + 1]));
  });

  // ---------- the layout, worked out once (after the fonts and the prints have loaded) ----------
  // Lines sit on the page's rules, one to a rule, centred in the column (a hand's small unevenness in each: its tilt,
  // its start, its baseline). The prints hang beside the text, top to the line they're `at`, pushed down if the last
  // print on their side is still there.
  function wrap(txt, font, maxW) {
    if (widthOf(txt, font) <= maxW) return [txt];
    const out = [], parts = txt.split(' · ');
    const fill = (units, sep) => { let cur = ''; for (const u of units) { const tr = cur ? cur + sep + u : u; if (cur && widthOf(tr, font) > maxW) { out.push(cur); cur = u; } else cur = tr; } return cur; };
    if (parts.length > 1 && parts.every(p => widthOf(p, font) <= maxW)) { const last = fill(parts, ' · '); if (last) out.push(last); return out; }
    const last = fill(txt.split(' '), ' '); if (last) out.push(last); return out;
  }
  const ruleY = k => RULE0 + k * PITCH;
  // The groups' breaks: a line after a blank rule, and each heading, down to "Every bot in this film means well." (the
  // end group below it, the © line and the tally, stays as it is, and so does the space the bots stand in).
  // layout(air) adds `air` blank rules among them, spread evenly down the page.
  const END_AT = LINES.findIndex(e => e && e[1] && e[1].startsWith('Every bot'));
  const BREAKS = LINES.map((e, i, A) => e && e.length && i > 0 && i < A.length - 1 && (END_AT < 0 || i <= END_AT) && (e[0] === 'head' || !(A[i - 1] && A[i - 1].length)) ? i : -1).filter(i => i >= 0);
  let LAY = null;
  function layout(air = LAY ? LAY.air : 0) {
    if (LAY && LAY.air === air) return LAY;
    const lines = [], at = {}, frames = Math.ceil(DUR * 24).toLocaleString('en-GB');
    const extra = {}; BREAKS.forEach((i, j) => { extra[i] = Math.floor((j + 1) * air / BREAKS.length) - Math.floor(j * air / BREAKS.length); });
    let k = 27, n = 0;                                   // (the first rule below the title's screen)
    for (const [i, e] of LINES.entries()) {
      if (!e || !e.length) { k++; continue; }
      k += extra[i] || 0;
      const [kind, raw] = e, K = KIND[kind] || KIND.line, txt = fillText(raw, frames);
      if (txt == null) continue;
      if (kind === 'head' && lines.length) k++;          // (a blank rule above a heading)
      const rows = wrap(txt, caveat(K.size), /\{usage\./.test(raw) ? TALLY_W : CW);   // (the tally's lines a little wider than the column: whole, not wrapped)
      if (!(raw in at)) at[raw] = ruleY(k);
      rows.forEach(r => {
        const h = hash(++n * 7.31);
        lines.push({ txt: r, kind, size: K.size, col: K.col, x: CX + (hash(n * 3.3) - .5) * 12, y: ruleY(k) - 6 + (h - .5) * 3, rot: (hash(n * 5.9) - .5) * .012, under: kind === 'head' });
        k++;
      });
      if (kind === 'head') k++;                          // (and one below it, under its underline)
    }
    // the prints: each below the last on its side (a gap between them), its top below the previous print's (on the
    // other side), so they read in order down the page
    const prints = [], arrows = [], low = { L: 0, R: 0 }, GAP = 40, STAGGER = 80;
    let prev = -Infinity;
    CREDITS_TEXT.prints.forEach((p, i) => {
      const key = Object.keys(at).find(s => s.startsWith(p.at)); let y = (key ? at[key] : ruleY(27)) - PITCH + 4;
      y = prev = Math.max(y, low[p.side] + GAP, prev + STAGGER);
      p.shots.forEach(([file, cap], j) => {
        const im = IMG[file], ph = PW * (im ? im.height / im.width : 9 / 16), b = 12, h = ph + 2 * b;
        const x = PX[p.side] - (j ? 18 : 0) + (hash(i * 9.1 + j) - .5) * 16;   // (a pair's second a step left: away from the writing on the left, towards it on the right, where there's room)
        const rot = (p.side === 'L' ? -1 : 1) * (j ? -.022 : .03) + (hash(i * 4.7 + j) - .5) * .02;
        const capY = RULE0 + Math.ceil((y + h + 34 - RULE0) / PITCH) * PITCH - 6;
        prints.push({ file, cap, x, y, w: PW + 2 * b, h, b, ph, rot, capY, seed: i * 10 + j, side: p.side });
        y = capY + 16;
        if (j + 1 < p.shots.length) { arrows.push({ x: x + (p.side === 'L' ? 14 : -14), y0: y + 2, y1: y + 44, seed: i }); y += 58; }
      });
      low[p.side] = y;
    });
    // the doodles: a paper plane off the title; the bots who mean well, under their line; a coffee ring by a print
    const last = lines[lines.length - 1], well = lines.find(l => l.txt.startsWith('Every bot'));
    const doodles = { plane: { x: 1640, y: 320 }, bots: well ? { x: CX, y: well.y + 3 * PITCH + 6 } : null };
    // (a mug put down by her Friday den, at the print's lower corner nearer the writing: its rim well clear of the
    // print's caption)
    const sub = prints.find(p => p.file.startsWith('cr05')) || prints[0];
    if (sub) { const cw = widthOf(sub.cap, caveat(27)), capL = sub.x + (hash(sub.seed * 2.1) - .5) * 14 - cw / 2, capR = capL + cw, r = 74, dir = sub.side === 'L' ? 1 : -1;
      doodles.ring = { x: dir < 0 ? Math.min(sub.x - sub.w * .42, capL - 26 - r * 1.04) : Math.max(sub.x + sub.w * .42, capR + 26 + r * 1.04), y: sub.y + sub.h + 6, r }; }
    // her Friday page, below the last line (three rules below, two below the tally's small print; and below every
    // print). The camera ends centred on it, or higher if the frame's top edge would cut into the lines above it: then
    // its top is put above the highest of them that fits over the drawing (its lower edge 40 px in): "Every bot in this
    // film means well." with its bots under it, or the © line, or the tally, whole. (With the tally, "Every bot…" still
    // fits: the drawing sits lower in the last frames)
    const fw = 780, fh = fw * 9 / 16, top = Math.max(last ? last.y + (last.kind === 'small' ? 2 : 3) * PITCH : ruleY(27), low.L + 40, low.R + 40);
    const friday = { x: CX, y: top + fh / 2, w: fw, h: fh, rot: -.02 };
    let end = friday.y;
    if (well) {
      const bx = l => [l.y - l.size * .85, l.y + l.size * .3], after = lines.filter(l => l.y > well.y);
      const tally = after.filter(l => l.kind === 'small'), rest = after.filter(l => l.kind !== 'small');
      const G = [[bx(well)[0], doodles.bots.y + 10], ...rest.map(bx)];   // (the line and its bots, as one)
      if (tally.length) G.push([bx(tally[0])[0], bx(tally[tally.length - 1])[1]]);
      const fBot = friday.y + fh / 2 + 40;
      if (G[0][0] - 30 < end - H / 2) {   // (not all of it in the frame centred on the drawing)
        const j = G.findIndex(([t], i) => (i ? (G[i - 1][1] + t) / 2 : t - 30) + H >= fBot);
        if (j >= 0) end = Math.floor((j ? (G[j - 1][1] + G[j][0]) / 2 : G[0][0] - 30) + H / 2);
      }
    }
    return LAY = { air, lines, prints, arrows, doodles, friday, end };
  }

  // ---------- the camera: a roll at a whole number of pixels a frame ----------
  // Broadcast credits' rule: the page moves the same whole number of output pixels every frame (N world px at 1080p,
  // 2N in the 4K master), so each frame's step is identical (no 3,4,4,4,3 cadence: no judder) and everything on the
  // page lands on the same pixel phase in every frame (nothing shimmers). It starts and stops on whole-pixel steps
  // too: 1, 2 ... N-1 px a frame, RAMP frames each. The fit (fitScroll, once): the slowest N whose roll covers the page
  // between CRT.scroll and CRT.land; then blank rules added among the groups (layout(air)) until the page fills the
  // roll; the last few pixels start it a few frames later. The page's end is rounded to a whole number of steps.
  const RAMP = 6;
  let ROLL = null;
  function fitScroll() {
    if (ROLL) return ROLL;
    const n0 = Math.ceil((DUR + CRT.scroll) * 24 - 1e-6), n1 = Math.round((DUR + CRT.land) * 24), F = n1 - n0;
    const maxD = N => N * F - RAMP * N * (N - 1);   // (the farthest a roll at N px a frame, with its ramps, goes in F frames)
    const dist = air => layout(air).end - TITLE_Y;
    let N = 1; while (maxD(N) < dist(0)) N++;
    let air = Math.min(3 * BREAKS.length, Math.max(0, Math.floor((maxD(N) - dist(0)) / PITCH)));
    while (air > 0 && dist(air) > maxD(N)) air--;
    const L = layout(air), D = N * Math.round((L.end - TITLE_Y) / N);
    L.end = TITLE_Y + D;
    const steps = []; for (let v = 1; v < N; v++) for (let i = 0; i < RAMP; i++) steps.push(v);
    const M = (D - RAMP * N * (N - 1)) / N; for (let i = 0; i < M; i++) steps.push(N);
    for (let v = N - 1; v >= 1; v--) for (let i = 0; i < RAMP; i++) steps.push(v);
    const pos = [0]; for (const v of steps) pos.push(pos[pos.length - 1] + v);
    const start = n1 - steps.length;
    CRT.scroll = start / 24 - DUR; CRT.land = n1 / 24 - DUR;
    return ROLL = { N, air, start, pos, D };
  }
  // the camera's height on the page at credits time k: by the film's frame (every frame a step: on ones)
  function camY(k) {
    const R = fitScroll(), m = Math.round((k + DUR) * 24) - R.start;
    return TITLE_Y + (m <= 0 ? 0 : R.pos[Math.min(m, R.pos.length - 1)]);
  }

  // ---------- drawing the page (world space, under the camera) ----------
  const R4 = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const rotP = (P, cx, cy, a) => { const c = Math.cos(a), s = Math.sin(a); return P.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]); };
  // The paper, its rules, the red margin and the punch holes, over the rows in view (all fixed to the page: its printing
  // never boils). The rules and the margin are printed: solid, even lines RULE_W px wide, their edges on whole pixels
  // (the camera's steps are whole pixels), so their weight doesn't depend on where they land and they hold perfectly
  // still as the page rolls. (In p5.brush's pen, as linedPaper() rules the film's pages, a line this fine prints faint
  // or dark by where it falls on the pixel grid: rolling, the ruling shimmered.)
  const RULE_W = 2;
  function paper(y0, y1) {
    _paint(R4(-80, y0 - 60, W + 80, y1 + 60), { wash: PAPER, ink: null });
    flushBrush();
    push(); noStroke();
    fill(RULE); for (let y = ruleY(Math.ceil((y0 - 40 - RULE0) / PITCH)); y < y1 + 40; y += PITCH) rect(-80, y - RULE_W / 2, W + 160, RULE_W);
    fill(MARGIN); rect(170 - RULE_W / 2, Math.floor(y0) - 60, RULE_W, Math.ceil(y1 - y0) + 120);
    pop();
    for (let hy = Math.floor(y0 / 360) * 360 + 180; hy < y1 + 60; hy += 360) _paint(oval(62, hy, 17, 17, 0, 18), { wash: HOLE, ink: null });
  }
  // A finished drawing on the page: drawn with the clock stopped (it doesn't boil), in biro
  function drawn(key, fn) { stillDrawing(() => { look('doodle'); boilSeed('cr ' + key); fn(); }, 1.5); look('doodle'); }
  function tape(cx, cy, len, ang, seed) {   // a strip of masking tape, its ends torn
    const hw = len / 2, hh = 15, P = [], n = 7;
    for (let i = 0; i <= n; i++) P.push([-hw + (hash(seed + i) - .5) * 5, -hh + i / n * 2 * hh]);
    for (let i = 0; i <= n; i++) P.push([hw + (hash(seed + 20 + i) - .5) * 5, hh - i / n * 2 * hh]);
    const Q = P.map(([x, y]) => [cx + x * Math.cos(ang) - y * Math.sin(ang), cy + x * Math.sin(ang) + y * Math.cos(ang)]);
    _paint(Q, { wash: '#E6D8B4', washOp: 175, ink: null });
    _paint(Q.map(([x, y]) => [x + .8, y + 1.2]), { wash: '#FFFFFF', washOp: 22, ink: null });
  }
  // A photo print: a soft shadow, the white border, the picture (flat: a photo), then its tape
  function print(p) {
    const C = [p.x, p.y + p.h / 2], P = rotP(R4(p.x - p.w / 2, p.y, p.x + p.w / 2, p.y + p.h), ...C, p.rot);
    for (const [d, a] of [[7, 16], [4, 22], [2, 26]]) _paint(P.map(([x, y]) => [x + d * .6, y + d]), { wash: '#3A3020', washOp: a, ink: null });
    flushBrush();
    push(); translate(...C); rotate(p.rot); noStroke(); fill(252, 251, 247); rect(-p.w / 2, -p.h / 2, p.w, p.h);
    const im = IMG[p.file];
    if (im) image(im, -p.w / 2 + p.b, -p.h / 2 + p.b, p.w - 2 * p.b, p.ph);
    else { fill(196, 190, 180); rect(-p.w / 2 + p.b, -p.h / 2 + p.b, p.w - 2 * p.b, p.ph); }
    pop();
    const s = p.seed * 13.7, tl = rotP([[p.x - p.w / 2 + 16, p.y + 6]], ...C, p.rot)[0], tr = rotP([[p.x + p.w / 2 - 16, p.y + 6]], ...C, p.rot)[0];
    if (hash(s) < .5) { tape(tl[0], tl[1], 104, p.rot - .72, s + 1); tape(tr[0], tr[1], 104, p.rot + .72, s + 2); }
    else { const tc = rotP([[p.x + (hash(s + 5) - .5) * 60, p.y + 2]], ...C, p.rot)[0]; tape(tc[0], tc[1], 128, p.rot + (hash(s + 6) - .5) * .2, s + 3); }
  }
  function arrow(a) {   // a biro arrow from one print down to the next: then → now
    drawn('arrow' + a.seed, () => {
      const P = [[a.x - 4, a.y0], [a.x + 5, (a.y0 + a.y1) / 2], [a.x, a.y1]];
      dline(P, 1.6, BIRO, .6);
      dline([[a.x - 12, a.y1 - 13], [a.x, a.y1 + 1], [a.x + 11, a.y1 - 14]], 1.6, BIRO, 0);
    });
  }
  function coffeeRing(d) {   // a mug was put down on the page: a pale stain, darker at its rim, and a drip
    _paint(oval(d.x, d.y, d.r, d.r * .96, .3, 40), { wash: '#C8A57A', washOp: 34, ink: null });
    const rim = []; for (let i = 0; i <= 44; i++) { const a = -.4 + i / 44 * TAU * .86, r = d.r * (1 + .02 * Math.sin(a * 5)); rim.push([d.x + Math.cos(a) * r, d.y + Math.sin(a) * r * .96]); }
    randomSeed(4241); _inkLine(rim, 1.8, '#B8926A', 'rotring', .5);   // (the kit's line: a doodle line would be biro)
    _paint(oval(d.x + d.r * .82, d.y + d.r * .7, 7, 5, .4, 12), { wash: '#B08A60', washOp: 60, ink: null });
  }
  function plane(d) {   // her paper plane, and the loop it flew
    drawn('plane', () => {
      push(); translate(d.x, d.y); scale(1.35); translate(-d.x, -d.y);
      const { x, y } = d, T = [];
      for (let i = 0; i <= 26; i++) { const u = i / 26, a = u * TAU * 1.1; T.push([x - 330 + u * 280 + Math.cos(a - 1.6) * 46 * Math.sin(u * Math.PI), y + 60 - u * 40 + Math.sin(a - 1.6) * 40 * Math.sin(u * Math.PI)]); }
      for (let i = 0; i + 1 < T.length; i += 2) dline([T[i], T[i + 1]], 1.1, BIRO, 0);   // (dashed)
      const B = [[x - 40, y + 6], [x + 58, y - 22], [x - 6, y + 30]];
      piece(B, '#FFFFFF', { sw: 1.3, key: 'crplane' });
      piece([[x - 40, y + 6], [x + 58, y - 22], [x - 22, y + 14]], '#DCE6F2', { sw: 1.1, key: 'crplane2' });
      dline([[x - 22, y + 14], [x - 6, y + 30]], 1, BIRO, 0);
      pop();
    });
  }
  // The bots who mean well, in a row under their line (the user: "where's Grok, Gemini & Copilot?"): Jolly, Codey and
  // Clawd, with Grok and Copilot joining on the left and the twins on the right. x: each one's place (px from the
  // column's middle), the row centred under the line with about 60 px between neighbours; u: its size, so they stand
  // about as tall as one another (~100 px); l, r: how far it reaches left and right of its place, its wave included (the
  // radios keep clear of the row)
  const CR_BOTS = [
    { id: 'grok', x: -395, u: 12, l: 72, r: 48 }, { id: 'copilot', x: -250, u: 11, l: 48, r: 40 }, { id: 'jolly', x: -115, u: 13, l: 42, r: 42 },
    { id: 'codey', x: 32, u: 19, l: 50, r: 52 }, { id: 'clawd', x: 200, u: 10, l: 62, r: 58 }, { id: 'gemini', x: 385, u: 15, l: 76, r: 74 },
  ];
  const CR_BOTS_X = [Math.min(...CR_BOTS.map(b => b.x - b.l)), Math.max(...CR_BOTS.map(b => b.x + b.r))];
  function bots(d) {   // the bots who mean well, waving, in a row: Grok, Copilot, Jolly, Codey (at its prompt: >_), Clawd, the Gemini twins
    drawn('bots', () => {
      const f = feel('happy', 1.5), X = id => d.x + CR_BOTS.find(b => b.id === id).x, U = id => CR_BOTS.find(b => b.id === id).u;
      grok(X('grok'), d.y, U('grok'), { ...f, pose: 'wave', t: 1.5, boilKey: 'crgrok', noShadow: true });
      copilot(X('copilot'), d.y, U('copilot'), { ...f, pose: 'wave', t: 1.5, boilKey: 'crcopilot', noShadow: true });
      muse(X('jolly'), d.y, U('jolly'), { ...f, pose: 'wave', t: 1.5, float: false, boilKey: 'crjolly', noShadow: true });
      // (the twins hand in hand, both waving with their outer hands, not quite in mirror image)
      gemini(X('gemini'), d.y, U('gemini'), { ...f, pose: { O: [-2.35, -4.6, .25, 'open'], I: 'join', OB: [-2.05, -4.95, .2, 'open'] }, t: 1.5, boilKey: 'crgemini', noShadow: true });
      const cd = codex(X('codey'), d.y, U('codey'), { ...f, kind: 'codey', pose: 'wave', screen: 'prompt', t: 1.5, boilKey: 'crcodey', noShadow: true });
      // (its face, simpler than the rig's crayon at this size: a solid black screen with a bold >_ on it)
      if (cd && cd.head) { const [hx, hy] = cd.head, u = U('codey'), sw = 1.12 * u, sh = .8 * u;
        _paint(b2Squircle(hx, hy, sw, sh, 5, 44), { wash: '#16182A', ink: null }); flushBrush();   // (the screen down before its glyphs)
        // (the kit's pen: the doodle look leaves out light lines, as paper showing through)
        randomSeed(5150); _inkLine([[hx - .62 * u, hy - .38 * u], [hx - .2 * u, hy], [hx - .62 * u, hy + .38 * u]], 2.4, '#8FF4FA', 'rotring', 0);
        _inkLine([[hx + .02 * u, hy + .4 * u], [hx + .6 * u, hy + .4 * u]], 2.4, '#8FF4FA', 'rotring', 0); }
      clawd2(X('clawd'), d.y, U('clawd'), { ...f, pose: 'wave', t: 1.5, boilKey: 'crclawd', noShadow: true });
    });
  }
  function underline(l) {   // a heading's biro underline, two quick strokes
    drawn('under' + l.y, () => {
      const w = widthOf(l.txt, caveat(l.size)) / 2 + 14, y = l.y + 12;
      dline([[l.x - w, y + 2], [l.x, y - 1], [l.x + w, y + 3]], 1.5, BIRO, .5);
      dline([[l.x - w * .8, y + 9], [l.x + w * .9, y + 7]], 1.1, BIRO, .5);
    });
  }
  function titleUnder() {   // the title's underline: one long wavy stroke, then a short one under it
    drawn('titleunder', () => {
      const w = TITLE_W / 2, y = titleBase() + 30, P = []; for (let i = 0; i <= 10; i++) P.push([CX - w + i / 10 * 2 * w, y + 5 * Math.sin(i * 1.3) + (i - 5) * .6]);
      dline(P, 2.2, BIRO, .5);
      dline([[CX - w * .55, y + 18], [CX + w * .6, y + 15]], 1.4, BIRO, .5);
    });
  }
  // Her Friday page (screen space: the drawing brings its own camera): a page from her sketchbook, torn off its spiral
  // and taped in: the drawing as in O1, a finished drawing that doesn't boil
  const FRIDAY_AT = 6.1;
  function fridayPage(F, sx, sy) {
    const cx = F.x + sx, cy = F.y + sy, P = rotP(R4(cx - F.w / 2, cy - F.h / 2, cx + F.w / 2, cy + F.h / 2), cx, cy, F.rot);
    for (const [d, a] of [[8, 14], [4, 20]]) _paint(P.map(([x, y]) => [x + d * .6, y + d]), { wash: '#3A3020', washOp: a, ink: null });
    clipPoly(P, () => {
      push(); translate(cx, cy); rotate(F.rot); translate(-F.w / 2, -F.h / 2); scale(F.w / W);
      stillDrawing(() => LOOPS.friday(FRIDAY_AT), FRIDAY_AT);
      pop();
    }, { screen: true });
    look('doodle');
    _inkLine(P.concat([P[0]]), .9, '#A69E90', 'rotring', 0);
    for (let i = 0; i < 9; i++) {   // the spiral's holes along the torn edge
      const [hx, hy] = rotP([[cx - F.w / 2 + 11, cy - F.h / 2 + 26 + i * (F.h - 52) / 8]], cx, cy, F.rot)[0];
      _paint(oval(hx, hy, 5, 7, F.rot, 12), { wash: PAPER, ink: null }); _inkLine(oval(hx, hy, 5, 7, F.rot, 12).concat([oval(hx, hy, 5, 7, F.rot, 12)[0]]), .6, '#A69E90', 'rotring', .5);
    }
    const [a, b] = [rotP([[cx - F.w / 2 + 40, cy - F.h / 2 + 4]], cx, cy, F.rot)[0], rotP([[cx + F.w / 2 - 30, cy - F.h / 2 + 4]], cx, cy, F.rot)[0]];
    tape(a[0], a[1], 120, F.rot - .6, 91); tape(b[0], b[1], 120, F.rot + .65, 92);
  }

  // ---------- ?polka: the radios (CRC.polka) ----------
  // The user: "drawn radios in the margins of the paper playing the music". Small transistor radios, a cheap 1960s
  // holiday set's shape (a rounded case in coloured pencil, a cream face with a round speaker grille, a tuning window and
  // dial, a telescopic aerial, a strap or a carry handle), doodled in biro and pencil as the plane and the bots are.
  // Where (placeRadios, once, from the page's real layout): in the free margin down the page (the prints' columns, and
  // beside the writing), alternately left and right, standing on a rule where one fits (else on a short stroke of its
  // own), clear of every print (its tape and caption), arrow, the coffee ring, the bots, the handwriting and her Friday
  // page, their notes' flight included; below the title card's page and above the last frames' (which hold on her
  // Friday drawing alone). Sizes, colours, a strap or a handle, rocking or not, and one aerial bent, vary down the page.
  // Playing (on twos; the page's scroll stays on ones): on the polka's beat (CRT.in, BTK) each hops and lands squashed
  // on the beat (some rocking foot to foot, a polka's step), its strap and aerial lagging; the speaker's cone pumps out
  // on the beat with a couple of sound arcs; and a biro note (♪ or ♫, drawn) pops out of the grille on most beats,
  // floating up and away, wobbling, fading. The radios are drawn with the clock stopped like the page's other drawings
  // (their lines don't boil: they move as a puppet does), each note too, for its whole flight.
  // a radio's footprint at scale 1, in its own drawing's units (its base, the middle of its feet, at 0, 0; its speaker
  // to -x, facing out): the case with its strap; the aerial (on the inner side); the notes' flight and the sound arcs
  // (on the outer side)
  const RAD = { top: 176, parts: [[-78, -142, 78, 3], [20, -172, 86, -88], [-170, -176, -60, -30]] };
  const RAD_COL = [['#E89A9A', '#9DB7DC'], ['#A6D8C2', '#E89A9A'], ['#F2D27A', '#9DB7DC'], ['#9DB7DC', '#F2D27A'], ['#C4B0DE', '#A6D8C2'], ['#F5B8A0', '#A6D8C2']];   // (the case, the dial knob: pastels, the page's own blue and red among them)
  const NOTE_LIFE = 1.5, NOTE_RISE = 70;
  function placeRadios(L) {
    const ob = [];   // what they keep clear of, as boxes [x0, y0, x1, y1]
    for (const l of L.lines) { const w = widthOf(l.txt, caveat(l.size)) / 2 + 24; ob.push([l.x - w, l.y - l.size * .85 - 8, l.x + w, l.y + l.size * .3 + (l.under ? 22 : 8)]); }   // (a little further from her writing, and a heading's underline)
    for (const p of L.prints) {
      const P = rotP(R4(p.x - p.w / 2, p.y, p.x + p.w / 2, p.y + p.h), p.x, p.y + p.h / 2, p.rot), xs = P.map(q => q[0]), ys = P.map(q => q[1]);
      ob.push([Math.min(...xs) - 26, Math.min(...ys) - 42, Math.max(...xs) + 26, Math.max(...ys) + 10]);   // (its tape, and its shadow)
      const cw = widthOf(p.cap, caveat(27)) / 2, cx = p.x + (hash(p.seed * 2.1) - .5) * 14;
      ob.push([cx - cw, p.capY - 24, cx + cw, p.capY + 9]);
    }
    for (const a of L.arrows) ob.push([a.x - 14, a.y0 - 2, a.x + 14, a.y1 + 2]);
    const d = L.doodles, F = L.friday;
    if (d.ring) ob.push([d.ring.x - d.ring.r - 4, d.ring.y - d.ring.r - 4, d.ring.x + d.ring.r + 12, d.ring.y + d.ring.r + 12]);
    if (d.bots) ob.push([d.bots.x + CR_BOTS_X[0] - 30, d.bots.y - 160, d.bots.x + CR_BOTS_X[1] + 30, d.bots.y + 16]);
    ob.push([F.x - F.w / 2 - 30, F.y - F.h / 2 - 40, F.x + F.w / 2 + 30, F.y + F.h / 2 + 30]);
    // the page's free area: under the title card's page (what's in frame while the title holds), over the last frames'
    // (her Friday page alone), right of the red margin, inside the frame's right edge
    const yMin = TITLE_Y + H / 2 + 12, yMax = L.end - H / 2 - 12, xMin = 184, xMax = CX + W / 2 - 24;
    const gap = (a, b) => Math.hypot(Math.max(0, a[0] - b[2], b[0] - a[2]), Math.max(0, a[1] - b[3], b[1] - a[3]));
    const foot = (x, y, s, dir) => RAD.parts.map(([a, b, c, e]) => { const u = x - a * dir * s, v = x - c * dir * s; return [Math.min(u, v), y + b * s, Math.max(u, v), y + e * s]; });
    const runs = [];
    for (const side of ['L', 'R']) {
      let run = null;
      for (let y = Math.ceil(yMin / 5) * 5; y <= yMax; y += 5) {
        const onRule = Math.abs((y - RULE0) / PITCH - Math.round((y - RULE0) / PITCH)) < 1e-6;
        let best = null;
        for (const s of [1, .9, .8, .72]) for (let x = side === 'L' ? 250 : 1180; x <= (side === 'L' ? 820 : 1750); x += 10) for (const dir of [-1, 1]) {
          const B = foot(x, y, s, dir);
          if (Math.min(...B.map(b => b[1])) < yMin || Math.min(...B.map(b => b[0])) < xMin || Math.max(...B.map(b => b[2])) > xMax) continue;
          let c = Infinity; for (const o of ob) { if (o[3] < y - 240 || o[1] > y + 20) continue; for (const b of B) c = Math.min(c, gap(b, o)); }
          if (c < 12) continue;
          const score = Math.min(c, 50) + 70 * s + (onRule ? 10 : 0) + (dir === (side === 'L' ? -1 : 1) ? 4 : 0) - Math.abs(x - PX[side]) * .02;   // (roomy, big, standing on a rule, facing out, in the prints' column)
          if (!best || score > best.score) best = { x, y, s, dir, side, score, onRule };
        }
        if (best) { if (!run) runs.push(run = []); run.push(best); } else run = null;
      }
    }
    // each run of places a radio fits: its best (the middle one, among equals). Then the set of them down the page,
    // alternately left and right and a good way apart, that's best in all (most radios, then the roomiest and biggest):
    // at most six
    const picks = runs.map(r => { const m = (r.length - 1) / 2, v = i => r[i].score - Math.abs(i - m) * .01; let j = 0; r.forEach((_, i) => { if (v(i) > v(j)) j = i; }); return r[j]; }).sort((a, b) => a.y - b.y);
    const best = picks.map(p => [null, { v: p.score, prev: -1 }]);   // best[i][c]: the best set of c ending with pick i
    picks.forEach((p, i) => { for (let c = 2; c <= 6; c++) for (let j = 0; j < i; j++) { const q = best[j][c - 1];
      if (q && picks[j].side !== p.side && p.y - picks[j].y >= 360 && (!best[i][c] || q.v + p.score > best[i][c].v)) best[i][c] = { v: q.v + p.score, prev: j }; } });
    let end = null; best.forEach((B, i) => B.forEach((b, c) => { if (b && (!end || c > end.c || (c === end.c && b.v > end.v))) end = { i, c, v: b.v }; }));
    const out = []; for (let i = end ? end.i : -1, c = end ? end.c : 0; i >= 0; i = best[i][c--].prev) out.unshift(picks[i]);
    const bent = Math.floor((out.length - 1) / 2);   // (the one in the middle has had its aerial knocked)
    return out.map((p, i) => ({ ...p, i, col: RAD_COL[i % RAD_COL.length][0], knob: RAD_COL[i % RAD_COL.length][1], strap: i % 2 === 0,
      rock: i % 3 === 1 ? 0 : .06, tilt: (hash(i * 5.1 + 2) - .5) * .07, lean: -.25 + .6 * hash(i * 3.9 + 1), bent: i === bent }));
  }
  const radiosOf = L => L.radios || (L.radios = placeRadios(L));
  // a rounded rectangle (clockwise from its top left), top corners rt, bottom rb
  function rrect(x0, y0, x1, y1, rt, rb, n = 5) {
    const P = [], c = (cx, cy, r, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + i / n * Math.PI / 2; P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
    c(x0 + rt, y0 + rt, rt, Math.PI); c(x1 - rt, y0 + rt, rt, -Math.PI / 2); c(x1 - rb, y1 - rb, rb, 0); c(x0 + rb, y1 - rb, rb, Math.PI / 2);
    return P;
  }
  // A band along a path (a strap, a handle), w wide
  function band(C, w) {
    const nrm = i => { const a = C[Math.max(0, i - 1)], b = C[Math.min(C.length - 1, i + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [-(b[1] - a[1]) / l * w / 2, (b[0] - a[0]) / l * w / 2]; };
    return C.map((p, i) => [p[0] + nrm(i)[0], p[1] + nrm(i)[1]]).concat(C.map((p, i) => [p[0] - nrm(i)[0], p[1] - nrm(i)[1]]).reverse());
  }
  // The yodel: the cover's "yodel-ay-ee" run in its bridge (credits time, s; MIDI pitch), measured from its vocal
  // (Demucs's vocal stem, pYIN): a held D, then the voice flipping round a B-flat chord, up into falsetto and down, then
  // a held D again, to YODEL_END. The radio in frame then (yodelRadio) sings it: a biro squiggle unspools from its
  // speaker as the notes are sung, tracing them (each note a stretch of line at its pitch's height, a curl at each leap
  // up, the last note's vibrato), holds, then floats up and fades; the radio leans back into it, and its notes wait.
  // (Its path isn't in placeRadios' footprint: it rises out over the free paper above; checked by eye,
  // out/polka/yodel_*.jpg. A change to the page's top may need a look.)
  // (the run opens on a low chest note, D4, and leaps an octave and more: yodel_subs' pitch track, tools/yodel_subs.py)
  const YODEL = [[11.88, 62.1], [12.56, 72], [12.72, 70.1], [12.92, 76.9], [13, 74], [13.24, 70.1], [13.44, 70], [13.8, 77], [13.88, 74], [14.12, 70],
    [14.24, 65.4], [14.32, 70], [14.44, 74.1], [14.56, 70], [14.68, 67], [14.8, 75], [15, 70], [15.12, 67], [15.2, 70.1], [15.56, 74]], YODEL_END = 16.4;
  const YO = { v: 58, st: 3.2, ang: .62, a: YODEL[0][0] - .2, b: YODEL_END + 1.5 };   // (its pace along its line, px/s; px a semitone; its line's rise; while it's out)
  let YPATH = null;
  function yodelPath() {   // [d, h, t]: along its line (px) and up from it (px), and when the pen's there
    if (YPATH) return YPATH;
    const P = [[-16, 0, YODEL[0][0] - .1]], t00 = YODEL[0][0], D = t => (t - t00) * YO.v, Hh = m => (m - 70) * YO.st;
    YODEL.forEach(([t0, m], j) => {
      const t1 = j + 1 < YODEL.length ? YODEL[j + 1][0] : YODEL_END, h = Hh(m);
      if (j && m - YODEL[j - 1][1] >= 4) for (let i = 0; i <= 8; i++) { const f = i / 8 * TAU; P.push([D(t0) - 6 * Math.sin(f), h + 6 * (1 - Math.cos(f)), t0 + i / 8 * .06]); }   // (a curl on a leap up)
      else P.push([D(t0) + 2, h, t0 + .01]);
      if (j === YODEL.length - 1) for (let i = 1; i <= 12; i++) { const u = i / 12; P.push([D(t0) + (D(t1) - D(t0)) * u, h + 3.5 * Math.sin(u * TAU * 3.5) * (1 - u * .4), t0 + (t1 - t0) * u]); }   // (held, with vibrato)
      else P.push([D(t1) - 3, h, t1 - .02]);
    });
    const Q = [];   // smoothed (Catmull-Rom through them), each point with its time
    for (let i = 0; i + 1 < P.length; i++) {
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      for (let k = 0; k < 4; k++) { const u = k / 4, u2 = u * u, u3 = u2 * u; Q.push([0, 1, 2].map(d => .5 * (2 * p1[d] + (p2[d] - p0[d]) * u + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * u2 + (3 * p1[d] - p0[d] - 3 * p2[d] + p3[d]) * u3))); }
    }
    Q.push(P[P.length - 1]);
    return YPATH = Q;
  }
  // the radio that sings it: the one nearest the frame's middle then
  const yodelRadio = L => { if (L.yodel == null) { const cy = camY((YODEL[0][0] + YODEL_END) / 2); let b = -1; radiosOf(L).forEach((r, i) => { if (b < 0 || Math.abs(r.y - 70 - cy) < Math.abs(radiosOf(L)[b].y - 70 - cy)) b = i; }); L.yodel = b; } return L.yodel; };
  function yodel(r, kw) {
    if (kw < YO.a || kw > YO.b) return;
    const Q = yodelPath(), s = r.s, c = Math.cos(YO.ang), sn = Math.sin(YO.ang), lift = 34 * ease(seg(kw, YODEL_END + .3, YO.b)), fd = ease(seg(kw, YODEL_END + .4, YO.b));
    const O = [r.x + r.dir * 84 * s, r.y - 62 * s - lift], u = [r.dir * c, -sn], nv = [-r.dir * sn, -c];   // (out from the speaker's side, rising)
    const W = ([d, h]) => [O[0] + d * u[0] + h * nv[0], O[1] + d * u[1] + h * nv[1]];
    const pts = []; for (const q of Q) { if (q[2] > kw) break; pts.push(W(q)); }
    if (pts.length < 2 || fd > .95) return;
    const col = mixCol(BIRO, PAPER, fd * .9);
    drawn('yodel', () => { for (let i = 0; i + 1 < pts.length; i += 24) _inkLine(pts.slice(i, i + 25), 1.5 * (1 - .3 * fd), col, 'pen', .3); });   // (in pieces: a long brush stroke fades along its length)
  }
  // the polka's beat at credits time k: the beat's number and how far through it (0 on the beat)
  const beatAt = k => { const b = (k - CRT.in) / BTK, n = Math.floor(b); return { n, p: b - n, b }; };
  function radio(r, kw) {
    const { n, p, b } = beatAt(kw), s = r.s, f = -r.dir;   // (f: drawn with its speaker to the left, mirrored on the right: it faces out)
    // the hop: on the ground round the beat (squashed, most on it), up in between (stretched going up and coming down)
    const air = Math.max(0, (4 * p * (1 - p) - .42) / .58), q = Math.min(p, 1 - p), sq = q < .12 ? 1 - q / .12 : 0, st = air > 0 ? .06 * Math.abs(1 - 2 * p) : 0;
    const sy = 1 - .15 * sq + st, sx = 1 + .11 * sq - .6 * st, hop = 11 * s * air;
    const yo = r.yodel ? ease(seg(kw, YO.a - .3, YO.a)) * (1 - ease(seg(kw, YODEL_END - .1, YODEL_END + .3))) : 0;   // (singing the yodel: it leans back)
    const tilt = r.tilt + r.rock * Math.cos(Math.PI * b) - r.dir * .13 * yo;   // (rocking: it lands on alternate feet)
    const pulse = Math.exp(-p / .18), whip = .16 * Math.sin(TAU * (p - .2)), strapDy = 7 * Math.cos(TAU * p);
    const M = ([x, y]) => [x * f * s * sx, y * s * sy], MP = P => P.map(M);
    const ln = (P, w, col = BIRO, c = 0) => _inkLine(MP(P), w, col, 'pen', c);
    const circ = (cx, cy, rr, m = 18) => oval(cx, cy, rr, rr, 0, m);
    drawn('radio' + r.i, () => {
      const pv = Math.sign(tilt) * 48 * s * sx;   // (it tips on the foot it's leaning onto)
      push(); translate(r.x + pv, r.y - hop); rotate(tilt); translate(-pv, 0);
      // behind the case: the strap (it lags the hop) or the carry handle, and the aerial
      if (r.strap) {
        const C = []; for (let i = 0; i <= 12; i++) { const u = i / 12; C.push([-70 + 140 * u, -84 - (46 - strapDy) * Math.sin(Math.PI * u)]); }
        piece(MP(band(C, 7)), '#C99A62', { sw: 1.1, key: 'crstrap' + r.i });
      } else piece(MP(band([[-44, -92], [-42, -108], [-34, -116], [34, -116], [42, -108], [44, -92]], 6)), '#B8BCCB', { sw: 1.1, key: 'crhandle' + r.i });
      const segs = [27, 24, 21], wid = [2.4, 1.9, 1.4]; let a = r.lean, x = 52, y = -94;
      segs.forEach((L0, j) => {
        a += (j ? whip * .6 : whip * .3) + (r.bent && j === 1 ? -1.25 : 0);
        const x2 = x + Math.sin(a) * L0, y2 = y - Math.cos(a) * L0;
        ln([[x, y], [x2, y2]], wid[j]);
        if (j < 2) ln([[x2 - Math.cos(a) * 2.6, y2 - Math.sin(a) * 2.6], [x2 + Math.cos(a) * 2.6, y2 + Math.sin(a) * 2.6]], 1.1);   // (a collar at each joint)
        x = x2; y = y2;
      });
      piece(MP(circ(x, y, 3.2, 10)), '#8A8FA8', { sw: 1, key: 'crtip' + r.i });
      // the feet, then the case and its cream face
      for (const fx of [-48, 48]) piece(MP(rrect(fx - 10, -9, fx + 10, 0, 3, 3, 2)), '#8A8FA8', { sw: 1, key: 'crfoot' + r.i + fx });
      piece(MP(rrect(-74, -96, 74, -6, 20, 12)), r.col, { sw: 1.5, key: 'crradio' + r.i });
      piece(MP(rrect(-63, -85, 63, -24, 12, 7)), '#FFF6E6', { sw: 1, key: 'crface' + r.i });
      if (r.strap) for (const lx of [-70, 70]) piece(MP(circ(lx, -84, 4, 10)), '#8A8FA8', { sw: .9, key: 'crlug' + r.i + lx });
      piece(MP(circ(52, -95, 4.5, 10)), '#8A8FA8', { sw: .9, key: 'crmount' + r.i });
      // the speaker: its rim, and the grille's mesh, bulging out on the beat
      const gx = -30, gy = -54, gr = 22 * (1 + .14 * pulse), gd = 5 * (1 + .14 * pulse);
      ln(circ(gx, gy, 27, 22).concat([circ(gx, gy, 27, 22)[0]]), 1.2, BIRO, .5);
      for (const th of [Math.PI / 4, -Math.PI / 4]) {
        const tx = Math.cos(th), ty = Math.sin(th);
        for (let o = -gr + gd / 2; o < gr; o += gd) { const h = Math.sqrt(gr * gr - o * o); ln([[gx - ty * o - tx * h, gy + tx * o - ty * h], [gx - ty * o + tx * h, gy + tx * o + ty * h]], .75); }
      }
      ln(circ(gx, gy, gr, 20).concat([circ(gx, gy, gr, 20)[0]]), .9, BIRO, .5);
      // the tuning window (its scale and a red needle) and the dial, knurled
      piece(MP(rrect(4, -80, 58, -65, 3, 3, 2)), '#FFFFFF', { sw: 1, key: 'crwin' + r.i });
      for (let j = 0; j < 7; j++) ln([[10 + j * 7, -78], [10 + j * 7, j % 2 ? -75 : -72.5]], .8);
      _inkLine(MP([[36, -79], [36, -66]]), 1.5, '#D9534A', 'cpencil', 0);
      piece(MP(circ(31, -41, 13, 16)), r.knob, { sw: 1.1, key: 'crknob' + r.i });
      for (let j = 0; j < 12; j++) { const t0 = j / 12 * TAU; ln([[31 + Math.cos(t0) * 13, -41 + Math.sin(t0) * 13], [31 + Math.cos(t0) * 16, -41 + Math.sin(t0) * 16]], .8); }
      ln([[31, -41], [31 + Math.cos(-2.2) * 9, -41 + Math.sin(-2.2) * 9]], 1.2);
      // sound arcs out of the speaker's side, just after the beat
      if (p < .5) for (let j = 0; j < 2; j++) {
        const rr = 50 + j * 11 + 16 * p / .5, A = []; for (let i = 0; i <= 6; i++) { const t0 = Math.PI - .5 + i / 6; A.push([gx + Math.cos(t0) * rr, gy + Math.sin(t0) * rr]); }
        ln(A, 1.1, mixCol(BIRO, PAPER, .15 + .7 * p / .5), .5);
      }
      pop();
    });
    // (off a rule, it stands on a short stroke of its own)
    if (!r.onRule) drawn('ground' + r.i, () => { _inkLine([[r.x - 84 * s, r.y + 1], [r.x + 20 * s, r.y + 2], [r.x + 82 * s, r.y + .5]], 1.3, BIRO, 'pen', .3); _inkLine([[r.x - 50 * s, r.y + 6], [r.x + 34 * s, r.y + 6.5]], .9, BIRO, 'pen', 0); });
    // the notes: one out of the grille on most beats, up and away (on the speaker's side), wobbling, fading
    const x0 = r.x + r.dir * 80 * s, y0 = r.y - 64 * s;   // (off the case's outer corner: they come out of the speaker's side)
    for (let m = n - Math.ceil(NOTE_LIFE / BTK); m <= n; m++) {
      const a = kw - (CRT.in + m * BTK), key = m * 7.13 + r.i * 31.7;
      if (a < 0 || a >= NOTE_LIFE || m < 0 || hash(key) > .8 || (r.yodel && kw - a > YO.a - .5 && kw - a < YO.b)) continue;
      const u = a / NOTE_LIFE, fd = ease(seg(u, .55, 1)); if (fd > .92) continue;
      const nx = x0 + r.dir * s * (4 + 56 * easeOut(u * 1.3)) + 7 * s * Math.sin(TAU * 1.3 * a + hash(key + 1) * 6);
      const ny = y0 - s * (6 + NOTE_RISE * (1 - Math.pow(1 - u, 1.6))), rot = .28 * Math.sin(TAU * 1.1 * a + hash(key + 2) * 6);
      const sc = s * (.55 + .45 * easeOut(a / .12) + .22 * Math.sin(Math.PI * clamp(a / .28)));
      drawn('note' + r.i + ':' + m, () => note(nx, ny, sc, rot, hash(key + 3) < .5, mixCol(BIRO, PAPER, fd * .9), 1.3 * (1 - .35 * fd)));
    }
  }
  // A biro music note, its head at x, y: ♪ (a head, a stem and a flag), or ♫ (two, beamed); the heads scribbled in
  function note(x, y, sc, rot, beamed, col, w) {
    const c = Math.cos(rot), sn = Math.sin(rot), R = ([dx, dy]) => [x + (dx * c - dy * sn) * sc, y + (dx * sn + dy * c) * sc], RP = P => P.map(R);
    const head = (hx, hy) => {
      const e = (ex, ey) => [hx + ex * Math.cos(-.4) - ey * Math.sin(-.4), hy + ex * Math.sin(-.4) + ey * Math.cos(-.4)];
      const O = []; for (let i = 0; i <= 14; i++) { const t0 = i / 14 * TAU; O.push(e(Math.cos(t0) * 5.6, Math.sin(t0) * 4)); }
      _inkLine(RP(O), w, col, 'pen', .3);
      const Z = []; for (let j = -3; j <= 3; j++) { const ey = j * 1.15, hw = 5 * Math.sqrt(Math.max(0, 1 - (ey / 4.2) ** 2)); Z.push(e(j % 2 ? hw : -hw, ey)); }
      _inkLine(RP(Z), w * .9, col, 'pen', 0);
    };
    head(0, 0); _inkLine(RP([[5.1, -2], [5.1, -26]]), w, col, 'pen', 0);
    if (!beamed) { _inkLine(RP([[5.1, -26], [9.5, -21], [12, -15], [10.2, -9]]), w, col, 'pen', .6); return; }
    head(15, -4); _inkLine(RP([[20.1, -6], [20.1, -30]]), w, col, 'pen', 0);
    for (const o of [0, 2.2]) _inkLine(RP([[5.1, -26 + o], [20.1, -30 + o]]), w * 1.1, col, 'pen', 0);
  }

  function page(k, cy) {
    const L = layout(), y0 = cy - H / 2, y1 = cy + H / 2, vis = (a, b) => b > y0 - 80 && a < y1 + 80;
    look('doodle');
    camBegin(CX, cy, 1);
    paper(y0, y1);
    if (L.doodles.ring && vis(L.doodles.ring.y - 90, L.doodles.ring.y + 90)) coffeeRing(L.doodles.ring);
    if (vis(TITLE_Y, 640)) titleUnder();
    if (vis(L.doodles.plane.y - 80, L.doodles.plane.y + 80)) plane(L.doodles.plane);
    for (const l of L.lines) if (l.under && vis(l.y - 60, l.y + 30)) underline(l);
    for (const p of L.prints) if (vis(p.y - 30, p.y + p.h + 30)) print(p);
    for (const a of L.arrows) if (vis(a.y0, a.y1)) arrow(a);
    if (L.doodles.bots && vis(L.doodles.bots.y - 140, L.doodles.bots.y + 10)) bots(L.doodles.bots);
    if (CRC.polka) { const kw = (Math.floor((k + DUR) * 12 + 1e-6) + .5) / 12 - DUR;   // (the radios on twos, at the middle of each drawing's time: a beat's drawing lands on it)
      const yi = yodelRadio(L);
      for (const r of radiosOf(L)) if (vis(r.y - RAD.top * r.s - 60, r.y + 20)) { r.yodel = r.i === yi; radio(r, kw); if (r.yodel) yodel(r, kw); } }
    camEnd();
    const F = L.friday; if (vis(F.y - F.h / 2 - 20, F.y + F.h / 2 + 20)) fridayPage(F, W / 2 - CX, H / 2 - cy);
  }

  // ---------- the title card: the scene under the lettering, per medium (screen space) ----------
  // (The lettering, and the grounds of riso and banknote, are drawn on the compositor with the text: creditsText.)
  const film = k => { const f = Math.floor(k * 24 + 1e-6); return { f, dx: (hash(f * 1.7 + 11) - .5) * 3 + 1.5 * Math.sin(k * 1.9), dy: (hash(f * 2.9 + 13) - .5) * 4 + 1.5 * Math.sin(k * 1.3 + 1), fl: hash(f * 3.1 + 7) - .5 }; };
  function sunTime(k) {   // a song time whose beat phase is the credits' own, so the ad's sun bounces on their beat
    const b = (k - CRT.in) / BTK, j = 40 + Math.floor(b), B = BEATMAP.beats;
    return B[j] + (b - Math.floor(b)) * (B[j + 1] - B[j]);
  }
  function titleScene(k, m) {
    if (!m) { paint(rectPts(-60, -60, W + 120, H + 120), { wash: '#000000', ink: null }); return; }
    if (m === 'ink') {
      look('ink'); const F = film(k);
      paint(rectPts(-100, -100, W + 200, H + 200), { wash: PS.black, ink: null });
      push(); translate(F.dx, F.dy);
      psSky(); psHills(sunTime(k)); psLawn();
      push(); translate(960 - PSX.sun[0], 150 - PSX.sun[1]); psSun(sunTime(k)); pop();
      psDirt(F.f, 1);
      pop();
      boilSeed('cr flicker'); psFlicker(F.f, .7); psVignette(1); psGate();
      return;
    }
    if (m === 'card') {   // the platform's wall, in card: cream tiles, the blue band behind the title
      look('card'); boilSeed('cr card');
      piece(R4(-60, -60, W + 60, H + 60), '#E7DDCA', { ink: null, key: 'crcardbg', lift: 0, edge: false });
      piece(R4(-60, 505, W + 60, 575), '#2E5AA6', { sw: 1.4, key: 'crcardband', lift: 5 });
      piece(R4(-60, 905, W + 60, H + 60), '#5B5A63', { sw: 1.4, key: 'crcardfloor', lift: 6 });
      piece(R4(-60, 890, W + 60, 912), '#F2C230', { ink: null, key: 'crcardedge', lift: 3, flatCard: true });
      return;
    }
    paint(rectPts(-60, -60, W + 120, H + 120), { wash: m === 'xerox' ? '#F1ECDF' : '#EEF1EA', ink: null });   // (riso and banknote: the compositor draws them)
  }

  // ---------- the lettering (and the riso and banknote cards), on the compositor under the paper grain ----------
  // Drawn at the output's own resolution, graded with the frame (the fade), and placed through the page's camera.
  const TITLE_FONT = { ink: ['400', 'Limelight, serif', true], card: ['800', '"Shantell Sans", sans-serif', false], xerox: ['700', '"Space Grotesk", sans-serif', true], bank: ['700', 'Cinzel, serif', true], doodle: ['700', 'Caveat, cursive', false] };
  const TF = {};   // per medium: { font, txt, cap (cap height), size }
  function titleFont(m) {
    if (TF[m]) return TF[m];
    const [wt, fam, up] = TITLE_FONT[m], txt = up ? CREDITS_TEXT.title.toUpperCase() : CREDITS_TEXT.title;
    const size = 100 * TITLE_W / widthOf(txt, `${wt} 100px ${fam}`), font = `${wt} ${size.toFixed(1)}px ${fam}`;
    MC.font = font; const cap = MC.measureText('H').actualBoundingBoxAscent;
    return TF[m] = { font, txt, cap, size };
  }
  // her title on the page: its baseline on the rule nearest where the other media centre their capitals
  const titleBase = () => RULE0 + Math.round((TITLE_Y + titleFont('doodle').cap / 2 - RULE0) / PITCH) * PITCH;
  // biro ink: the colour, a little uneven (a ballpoint's skips), as a pattern fixed to the writing (it scrolls with it)
  const biroPat = {}, biroFill = {};
  function biro(c, col) {
    if (biroFill[col] && biroFill[col].c === c) return biroFill[col].p;
    if (!biroPat[col]) {
      const cv = document.createElement('canvas'); cv.width = cv.height = 96; const x = cv.getContext('2d'), r = lcg(parseInt(col.slice(1), 16) % 9973 + 3);
      x.fillStyle = col; x.fillRect(0, 0, 96, 96); x.globalCompositeOperation = 'destination-out';
      for (let i = 0; i < 700; i++) { x.fillStyle = `rgba(0,0,0,${.08 + .22 * r()})`; x.fillRect(r() * 96, r() * 96, 1 + r() * 2, 1); }
      biroPat[col] = cv;
    }
    biroFill[col] = { c, p: c.createPattern(biroPat[col], 'repeat') }; return biroFill[col].p;
  }
  function hand(c, txt, x, y, font, col, rot = 0) {   // a handwritten line, centred on x, its baseline at y
    c.save(); c.translate(x, y); c.rotate(rot); c.font = font; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    c.fillStyle = biro(c, col); c.fillText(txt, 0, 0); c.restore();
  }
  function inkTitle(c, k) {   // the 1930s title card: a dark Deco plaque, its lettering in the ad's cream; projected
    const F = film(k), T = titleFont('ink'), w = TITLE_W + 150, h = T.cap + 150;
    c.save(); c.translate(960 + F.dx, TITLE_Y + F.dy);
    c.fillStyle = 'rgba(20,14,16,.35)'; kRR(c, -w / 2 + 6, -h / 2 + 9, w, h, 18); c.fill();
    kRR(c, -w / 2, -h / 2, w, h, 18); c.fillStyle = mixCol('#1D181B', '#3A3034', clamp(.12 + F.fl * .18)); c.fill();
    kInkFrame(c, w, h, { rule: '#E9DBBE' });
    c.globalAlpha = .96 + F.fl * .06; c.font = T.font; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    c.fillStyle = '#F2E4C6'; c.fillText(T.txt, 0, T.cap / 2); c.globalAlpha = 1;
    kRR(c, -w / 2, -h / 2, w, h, 18); c.clip();   // the film's grain and dust on the plaque
    const g = kPattern(c, 'filmgrain', cv => kNoise(cv, 256, .22, '255,246,228', .04, .22, 17));
    g.setTransform(new DOMMatrix().translate(hash(F.f * 5.3) * 256, hash(F.f * 7.9) * 256)); c.fillStyle = g; c.fillRect(-w / 2, -h / 2, w, h);
    c.fillStyle = 'rgba(242,228,198,.5)';
    for (let i = 0; i < 4; i++) if (hash(F.f * 1.9 + i * 7) < .35) { c.beginPath(); c.arc((hash(F.f + i * 3.3) - .5) * w, (hash(F.f * 2.2 + i) - .5) * h, 1 + 2 * hash(F.f * .7 + i), 0, TAU); c.fill(); }
    c.restore();
    // out of black: an iris opens on the downbeat, as the ad's did
    const r = easeOut(seg(k, CRT.in, CRT.in + .32)) * 1150;
    if (r < 1150) { c.save(); c.beginPath(); c.rect(-10, -10, W + 20, H + 20); c.arc(960, TITLE_Y, Math.max(0, r), 0, TAU, true); c.fillStyle = '#000'; c.fill('evenodd'); c.restore(); }
  }
  function cardTitle(c) {   // cut card: a dark strip, cream lettering, a chip of her tomato under TIME and his mustard under SAVED
    const T = titleFont('card'), w = TITLE_W + 120, h = T.cap + 118, words = T.txt.split(' ');
    c.save(); c.translate(960, TITLE_Y);
    kCardPiece(c, kCut(w, h, 17, 2.4, 140, 6), '#2B2631', '#5E5568', 'l', 9);
    c.font = T.font; c.textBaseline = 'alphabetic';
    const sp = widthOf(' ', T.font), ws = words.map(s => widthOf(s, T.font)); let x = -TITLE_W / 2;
    const place = []; words.forEach((s, i) => { place.push(x); x += ws[i] + sp; });
    for (const [i, col, rot] of [[2, '#FF6B4A', -.025], [3, '#F5B82E', .02]]) {
      c.save(); c.translate(place[i] + ws[i] / 2, -4); c.rotate(rot);
      kCardPiece(c, kCut(ws[i] + 30, T.cap + 44, 30 + i, 1.4, 70, 3), col, mixCol(col, '#FFFFFF', .35), 'd', 4); c.restore();
    }
    c.textAlign = 'left';
    words.forEach((s, i) => { c.fillStyle = 'rgba(0,0,0,.3)'; c.fillText(s, place[i] + 2, T.cap / 2 + 3); c.fillStyle = i >= 2 ? '#231E28' : '#F6EEDD'; c.fillText(s, place[i], T.cap / 2); });
    c.restore();
  }
  function risoTitle(c, k) {   // a riso print: the blue drum's screen, the pink drum a little out of register, grit
    const T = titleFont('xerox'), blue = '#1E3C8C', pink = '#FF4F9A', seed = 5;
    c.save();
    c.fillStyle = '#F1ECDF'; c.fillRect(-10, -10, W + 20, H + 20);
    c.fillStyle = blue;   // the blue drum's dot screen, heavy at the top and bottom edges and fading in
    for (let y = 0; y < H + 8; y += 8) {
      const tone = Math.max(0, 1 - Math.min(y, H - y) / 330) ** 1.3 * .55; if (tone < .03) continue;
      const r = 4 * Math.sqrt(tone); for (let x = (y / 8 % 2) * 4; x < W + 8; x += 8) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
    }
    c.globalCompositeOperation = 'multiply';
    c.fillStyle = pink;   // the pink drum's screen, at its own angle, rising into the lower right (purple where it crosses the blue)
    { const a = 75 * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), P = 9;
      for (let i = -40; i < 260; i++) for (let j = -230; j < 60; j++) {   // (the rotated grid's rows and columns that cover the frame)
        const x = i * P * ca - j * P * sa, y = i * P * sa + j * P * ca; if (x < -8 || x > W + 8 || y < -8 || y > H + 8) continue;
        const tone = clamp(((x / W) + (y / H) - 1.15) / .85) ** 1.2 * .6; if (tone < .03) continue;
        c.beginPath(); c.arc(x, y, 4.6 * Math.sqrt(tone), 0, TAU); c.fill();
      } }
    const words = T.txt.split(' '), sp = widthOf(' ', T.font), ws = words.map(s => widthOf(s, T.font)); let x = -TITLE_W / 2; const place = []; words.forEach((s, i) => { place.push(x); x += ws[i] + sp; });
    c.translate(960, TITLE_Y);
    c.fillStyle = pink;   // the pink drum: a block behind TIME SAVED, printed a few pixels off
    c.beginPath(); c.moveTo(place[2] - 16 + 5, -T.cap / 2 - 26 - 3); c.lineTo(TITLE_W / 2 + 18 + 5, -T.cap / 2 - 28 - 3); c.lineTo(TITLE_W / 2 + 16 + 5, T.cap / 2 + 26 - 3); c.lineTo(place[2] - 14 + 5, T.cap / 2 + 28 - 3); c.fill();
    c.font = T.font; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    c.fillStyle = pink; c.globalAlpha = .55; c.fillText(T.txt, 4, T.cap / 2 - 3); c.globalAlpha = 1;
    c.fillStyle = blue; c.fillText(T.txt, 0, T.cap / 2);
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = 'rgba(241,236,223,.85)';   // drop-outs in the ink
    for (let i = 0; i < 70; i++) { c.beginPath(); c.arc((kH(seed, i) - .5) * TITLE_W, (kH(seed, i + 300) - .5) * T.cap * 1.1, .6 + 1.4 * kH(seed, i + 600), 0, TAU); c.fill(); }
    c.restore();
    c.save(); c.fillStyle = 'rgba(30,60,140,.5)';   // toner grit, and a drum streak
    for (let i = 0; i < 260; i++) { c.beginPath(); c.arc(kH(seed, i + 900) * W, kH(seed, i + 1300) * H, .4 + 1.3 * kH(seed, i + 1700) ** 2, 0, TAU); c.fill(); }
    c.fillStyle = 'rgba(30,60,140,.07)'; c.fillRect(W * .71, 0, 7, H);
    c.restore();
  }
  function bankTitle(c) {   // a banknote: fine wavy underprint, guilloche rosettes and borders, the title engraved in teal
    const T = titleFont('bank'), ink = '#1F4E55', paper = '#EEF1EA';
    c.save();
    c.fillStyle = paper; c.fillRect(-10, -10, W + 20, H + 20);
    c.strokeStyle = ink; c.globalAlpha = .13; kLines(c, -10, W + 10, 0, H, 6, 2.2, 34, .9); c.globalAlpha = 1;
    c.strokeStyle = ink; c.globalAlpha = .75;
    kGuilloche(c, 40, W - 40, 44, 88, 5, 22, 1); kGuilloche(c, 40, W - 40, H - 88, H - 44, 5, 22, 1);
    c.globalAlpha = 1; c.lineWidth = 2.4; c.strokeRect(24, 24, W - 48, H - 48); c.lineWidth = 1; c.strokeRect(32, 32, W - 64, H - 64);
    const rosette = (rx, ry, r0, r1, n, lobes, lw) => { c.lineWidth = lw;
      for (let i = 0; i < n; i++) { c.beginPath(); for (let s = 0; s <= 360; s++) { const a = s / 360 * TAU, r = r0 + (r1 - r0) * (.5 + .5 * Math.sin(lobes * a + i / n * TAU / lobes * 3)); const X = rx + Math.cos(a) * r, Y = ry + Math.sin(a) * r; s ? c.lineTo(X, Y) : c.moveTo(X, Y); } c.stroke(); } };
    c.globalAlpha = .85;
    for (const sx of [-1, 1]) { rosette(960 + sx * 800, TITLE_Y, 34, 118, 14, 11, .75); rosette(960 + sx * 800, TITLE_Y, 8, 30, 8, 7, .6); }
    c.globalAlpha = .55; kGuilloche(c, 330, W - 330, TITLE_Y - T.cap / 2 - 108, TITLE_Y - T.cap / 2 - 78, 4, 16, .8); kGuilloche(c, 330, W - 330, TITLE_Y + T.cap / 2 + 78, TITLE_Y + T.cap / 2 + 108, 4, 16, .8);
    c.globalAlpha = 1;
    // the banderole: a paler panel with a double rule, the capitals over fine lines
    const w = TITLE_W + 110, h = T.cap + 110;
    c.translate(960, TITLE_Y);
    c.fillStyle = paper; c.fillRect(-w / 2, -h / 2, w, h);
    c.save(); c.beginPath(); c.rect(-w / 2, -h / 2, w, h); c.clip(); c.globalAlpha = .18; kLines(c, -w / 2, w / 2, -h / 2, h / 2, 3.4, .8, 9, .8); c.restore();
    c.lineWidth = 2.2; c.strokeRect(-w / 2, -h / 2, w, h); c.lineWidth = .9; c.strokeRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14);
    c.font = T.font; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillStyle = ink; c.fillText(T.txt, 0, T.cap / 2);
    c.restore();
  }

  // The frame's credits state (set by the shot each frame it draws; the compositor's hook checks it's this frame's)
  let CRF = null;
  function creditsText(c) {
    const { k, m, cy } = CRF;
    c.save(); c.filter = POSTFX || 'none';
    if (m === 'ink') inkTitle(c, k);
    else if (m === 'card') cardTitle(c);
    else if (m === 'xerox') risoTitle(c, k);
    else if (m === 'bank') bankTitle(c);
    else if (m === 'doodle') {
      const L = layout(), sx = W / 2 - CX, sy = H / 2 - cy, y0 = cy - H / 2 - 80, y1 = cy + H / 2 + 80;
      const T = titleFont('doodle');
      if (titleBase() + 60 > y0) hand(c, T.txt, 960, titleBase() + sy, T.font, BIRO, -.008);
      for (const l of L.lines) if (l.y > y0 && l.y - l.size < y1) hand(c, l.txt, l.x + sx, l.y + sy, caveat(l.size), l.col, l.rot);
      for (const p of L.prints) if (p.capY > y0 && p.capY - 40 < y1) hand(c, p.cap, p.x + sx + (hash(p.seed * 2.1) - .5) * 14, p.capY + sy, caveat(27), BIRO, (hash(p.seed * 3.7) - .5) * .02);
    }
    c.restore();
  }
  // A film camera's shutter on the roll: a sharp page stepping 4 px a frame at 24 fps strobes (reads as judder, more so
  // on a 60 Hz screen); film's 180° shutter smears each frame over half its step. So while the page moves, the frame
  // (the page and her writing: everything moves together) is the average of SHUTTER_N copies shifted along the roll
  // over SHUTTER × the frame's step, centred, equal weights (2 px at 1080p for a 4 px step: 3 copies a pixel apart; 4
  // px in the 4K master). The film grain goes on after, sharp. The holds (a step of 0) stay sharp.
  const SHUTTER = .5;
  let SHC = null;
  function shutter(c, step) {
    const b = step * SHUTTER * OS; if (!(b >= .25)) return;
    const cv = c.canvas, n = Math.max(2, Math.ceil(b - 1e-6) + 1);
    if (!SHC || SHC.width !== cv.width || SHC.height !== cv.height) { SHC = document.createElement('canvas'); SHC.width = cv.width; SHC.height = cv.height; }
    const s = SHC.getContext('2d'); s.globalCompositeOperation = 'copy'; s.drawImage(cv, 0, 0);
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.filter = 'none'; c.globalCompositeOperation = 'source-over';
    for (let i = 0; i < n; i++) { c.globalAlpha = 1 / (i + 1); c.drawImage(SHC, 0, -b / 2 + b * i / (n - 1)); }   // (a running average: equal weights)
    c.restore();
  }
  { const _dl = drawLetters; drawLetters = function (c) { _dl(c);
    if (c === outX && CRF && CRF.t === T) { creditsText(c); if (CRF.m === 'doodle') shutter(c, camY(CRF.k) - camY(CRF.k - 1 / 24)); } }; }

  SHOT.CR = t => {
    const k = t - DUR, m = mediumAt(k), cy = m === 'doodle' ? camY(k) : TITLE_Y;
    if (m === 'doodle') page(k, cy); else titleScene(k, m);
    CRF = { t: T, k, m, cy };
    const fade = ease(seg(k, ...CRT.fade)); if (fade > 0) POSTFX = `brightness(${(1 - fade).toFixed(3)})`;
  };
  window.CREDITS = { CRT, layout, camY, fitScroll, radios: () => CRC.polka ? radiosOf(layout()) : [] };   // (for checks: the timings, the page's layout, the scroll and the ?polka radios)
})();

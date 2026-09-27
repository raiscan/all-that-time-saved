// karaoke.js: the subtitles. A banner opens at the bottom of the frame for each phrase, and each word of the line
// fills in its singer's colour exactly as it's sung (word timings from tools/lyrics.py; the voice from tools/voices.py,
// per word where a line changes singer): warm red for Tess (her), mustard for Rowan (him). Backing vocals pop up as a
// small tag above the banner's right end.
//
// The banner takes the style of the world the shot is in (K_WORLD, below: the look of the shot's main subject at that
// moment), and restyles at the same visible moment the picture changes medium:
//   ink     the 1930s sing-along (Fleischer's "Screen Songs"): a dark title-card strip with an Art Deco rule, period
//           lettering (Limelight) in the ad's cream, the words filling in pastel, and the bouncing ball landing on each
//           word as it starts; it's projected film, so it weaves, flickers and grains with the frame (continuous time)
//   card    a strip of cut card (cut edges, fibres, a pale cut edge, a lift shadow); as each word is sung a chip of card
//           in the singer's colour slides out from under the last one behind it, on twos like the puppets
//   doodle  a scrap torn from her notebook (blue rules, red margin): the line pencilled in her hand (Caveat), and each
//           word inked over in biro and coloured in with the singer's coloured pencil as it's sung (on twos)
//   xerox   a riso-printed slip: the text on the blue drum; each sung word overprinted by the fluoro pink (her) or
//           yellow (him) drum, a little out of register, with toner grit and drop-outs; no black drum
//   bank    an engraved banderole: guilloche borders, a fine underprint, roman capitals (Cinzel) in the house teal; each
//           sung word prints in the singer's ink (the stamp's red for her, ochre for him) over an underprint of fine
//           lines in their colour (colour lives in the lines)
// Every look shares one layout (the same rows, baselines and word places: kRef, kLayout), and a change of look is a
// quick transform, not a cut (kChange): the old banner crossfades into the new over ~.3 s from the switch, or follows
// the picture's own sweep across it (the copier's light bar, the door, the tear), while the words hold their place and
// their fill carries on. The ground and the text are drawn on the 2D compositor after the frame (so they're crisp at
// any output size, never graded or grained with the shot, and cost a few milliseconds at most). Backing tags are
// anchored once, when they appear, and hold still until they go (a change of look restyles them in place).
//
// ?subslook=ink|card|doodle|xerox|bank: every phrase in one look (for checking).
// LOOPS.subs: the showcase (each look's banner opening, mid-line and fully sung, over one of its own shots).
// Needs src/lyrics.js (LYRICS). Standalone loops don't get subtitles unless they set LOOPS.x.karaoke = true.
const K_FORCE = new URLSearchParams(location.search).get('subslook');
const KARA = { font: '800 52px "Shantell Sans", "Comic Sans MS", sans-serif', gap: .8 };
const KCTX = document.createElement('canvas').getContext('2d');
const kWidth = (txt, font = KARA.font) => { KCTX.font = font; return KCTX.measureText(txt).width; };

// Main lines, grouped into phrases (lines closer than KARA.gap s share one banner opening; so do lines a backing
// vocal bridges, so the banner doesn't blink shut under the tag).
// ?polka (the polka credits: config.js PROJECT.creditsPolka): her yodelling in the end credits, subtitled a syllable
// to each sung note (src/polka_lyrics.js, made by tools/yodel_subs.py, in credits time k: film time DUR + k). Its lines
// carry their syllables' times (syl: per word, [[on, off], ...]), which the fill and the ball follow (kSylFill,
// kSylLand); its tags are the band's (voice 'N': a neutral ink). In the ink look (the user's pick: the sing-along strip with its
// bouncing ball, over her notebook's scrap). Without ?polka none of this is loaded and nothing changes.
const K_POLKA = typeof POLKA_LYRICS !== 'undefined' && typeof PROJECT !== 'undefined' && PROJECT.credits && PROJECT.credits.polka
  ? POLKA_LYRICS.lines.map(l => ({ ...l, start: DUR + l.start, end: DUR + l.end, words: l.words.map(([a, b]) => [DUR + a, DUR + b]), syl: l.syl && l.syl.map(w => w.map(([a, b]) => [DUR + a, DUR + b])) }))
  : [];
const K_LINES = (typeof LYRICS === 'undefined' ? [] : LYRICS.lines.filter(l => !l.backing)).concat(K_POLKA.filter(l => !l.backing));
const K_BACK = (typeof LYRICS === 'undefined' ? [] : LYRICS.lines.filter(l => l.backing)).concat(K_POLKA.filter(l => l.backing));
const K_PHRASES = [];
for (const l of K_LINES) {
  const p = K_PHRASES[K_PHRASES.length - 1];
  const bridged = p && l.start - p.end < 1.2 && K_BACK.some(b => b.start < l.start && b.end > p.end);
  if (p && (l.start - p.end < KARA.gap || bridged)) { p.lines.push(l); p.end = Math.max(p.end, l.end); } else K_PHRASES.push({ start: l.start, end: l.end, lines: [l] });
}
K_PHRASES.forEach((p, i) => p.id = i);
const kVoiceOf = (l, i) => (l.wordVoice && l.wordVoice[i]) || l.voice || (l.singer || 'F')[0];
const kFillOf = (l, i, t) => { if (l.syl && l.syl[i]) return kSylFill(l, i, t); const [a, b] = l.words[i]; return clamp((t - a) / Math.max(.06, b - a)); };

// ======================================================================================================================
// the world's banner
// ======================================================================================================================
// ---------- fonts (files in assets/fonts/ with their OFL licences, so headless renders are deterministic) ----------
const K_FONT_DIR = (() => { try { return new URL('../assets/fonts/', document.currentScript.src).href; } catch (e) { return '../assets/fonts/'; } })();
const K_FACES = typeof FontFace === 'undefined' ? [] : [
  ['Limelight', 'Limelight-Regular-latin.woff2', '400'], ['Caveat', 'Caveat-Bold-latin.woff2', '400 700'],
  ['Cinzel', 'Cinzel-latin.woff2', '400 900'], ['Space Grotesk', 'SpaceGrotesk-Bold-latin.woff2', '700'],
].map(([fam, file, weight]) => { const f = new FontFace(fam, `url("${K_FONT_DIR}${file}")`, { weight, display: 'block' }); document.fonts.add(f); return f; });

// ---------- which world: the banner's look over the film ----------
// [time, look, change]: from this time on the banner is in this look. Each time is a cut or the visible moment the
// picture changes medium, found frame by frame; the look is that of the shot's main subject at the time:
//   a>b    (a change mid-shot) switches at the moment the picture changes medium: the copier's light bar, the tear,
//          the pull back that shows the frame round a picture, a clapperboard's clap
//   a+b    (two media at once) takes the singer's own medium: the world the singing character is in (Rowan's card
//          beside the bosses' engraved roadster in V2g); a picture inside a picture (a screen, a poster, a thought
//          bubble) never sets it unless it fills the frame (so C1f's tear goes from her riso copy straight to the card
//          platform: the ink original it bares hangs in its frame on the wall)
//   Z1     'all' (the chase through the four panels: ink, card, riso, doodle) runs with Tess, who sings it: the banner
//          takes the medium of the panel she's running through and changes as she crosses each divider (the dividers
//          are the media rule's own visible boundary), ending in the good future's doodle with the bots piled at its edge
// The change itself is a quick transform, never a cut (kChange): the text keeps its place (one layout for every look,
// below) while the old banner crossfades into the new over K_CHANGE s from the switch (K_CHANGE_Z1 in Z1's rapid
// panel changes). Where the picture's own change is a sweep (the copier's light bar, the door, the smear, the tear),
// change: { sweep: [t0, t1, x0, x1, easing], side } carries the banner's change across it in step with the picture:
// the line at x lerp(x0, x1, easing(progress)) at the banner's height, the new look on its `side` ('L' or 'R').
const kWT = (prefix, i = 0) => { const l = K_LINES.find(l => l.text.replace(/^["']/, '').startsWith(prefix)); return l ? l.words[i][0] : 0; };
const kBAR = b => typeof BEATMAP !== 'undefined' && b < BEATMAP.bars.length ? BEATMAP.bars[b] : 0;
const K_CHANGE = .3, K_CHANGE_Z1 = .16;
// A hard cut to a shot in another medium: the change is quicker and straddles the cut (from .09 s before it, over
// .15 s: mostly the new look on the cut frame), so the banner agrees with the picture within a frame or two. (A .3 s
// fade from the cut left the old look on the banner under the new picture: C2c's card train with the brain's engraved
// banner, the user.)
const kAtCut = (t, look) => [t - .09, look, { d: .15 }];
const kSq = u => u * u;
const K_WORLD = [
  [0, 'ink'],          // I1: the 1930s ad
  [8.7, 'card'],       // I2: pulled back through the poster's frame onto the platform
  // V1d: after the copier's flash the light bar sweeps back right to left, printing the riso copy behind it (verse1.js
  // COPY.sweep: the word "Then" + .36 to + .7, on twos): "Then it copied me"
  [kWT('Then it') + .36, 'xerox', { sweep: [kWT('Then it') + .36, kWT('Then it') + .7, W + 140, -140], side: 'R', twos: true }],
  [29.48, 'bank'],     // V1e: money's view (the note)
  [33.1, 'card', { sweep: [33.1, 33.3, 0, W, kSq], side: 'L' }],   // V1f: the office door swings across the note (verse1.js v1DoorSwing)
  [57.65, 'doodle'],   // P1a: the paper plane becomes her biro drawing
  kAtCut(kBAR(35), 'xerox'),   // C1a: the stamp slams (the cut): her drawing printed riso
  [64.7, 'card'],      // C1a: the page shrinks away into the night train
  [68.4, 'bank'],      // C1b: the tilt up the tube into the brain's cathedral
  kAtCut(kBAR(39), 'card'),    // C1c: the cut back to her in the carriage (the sandwich comes down to her)
  [72.2, 'bank'],      // C1c: into the window: the bosses' banquet
  [73.7, 'card'],      // C1c: the bill flies out at us, onto her table
  kAtCut(kWT('Same shit'), 'xerox'),   // C1d: the cut on "Same": her commute copied
  [81.07, 'card'],     // C1f: her box room
  [82.9, 'xerox'],     // C1f: her cheap copy of the poster fills the frame
  // C1f: she tears the copy down; it swings from its right pin and falls, baring the platform (V2a) from the left
  [86.96, 'card', { sweep: [86.96, 87.42, -120, W + 120, u => Math.pow(u, 1.6)], side: 'L' }],
  [103.28, 'xerox', { sweep: [103.28, 103.62, W + 160, -160], side: 'R' }],   // V2e: the light bar prints his street (verse2.js TE.bar)
  // V2g: the exhaust's toner smears off to the left, baring his GP queue beside the bosses' roadster (the singer's medium)
  // (verse2.js TG.smear; the smear's edge leans, so it's ~150 px further right at the banner's height)
  [116.95, 'card', { sweep: [116.95, 117.42, W + 210, -410, easeOut], side: 'R' }],
  [131.75, 'doodle'],  // P2a: her second drawing
  kAtCut(kBAR(77), 'xerox'),   // C2a: the stamps slam (the cut): printed riso
  [139.0, 'card'],     // C2a: into the train
  [142.67, 'bank'],    // C2b: the tilt up to the bigger brain
  kAtCut(kBAR(81), 'card'),    // C2c: the cut back to the two of them in the carriage
  [146.42, 'bank'],    // C2c: into the window: the longer banquet
  [147.96, 'card'],    // C2c: the stack of bills flies out onto the table
  kAtCut(149.41, 'xerox'),     // C2d: the cut on "Same" (the second chorus's): both commutes copied
  [155.37, 'card'],    // C2f: facing box rooms
  [156.7, 'xerox'],    // C2f: the copy of the ad closes in, burning
  [158.0, 'card'],     // C2f: the two of them either side of it
  [162.33, 'xerox'],   // B1: the burn hole opens on the rave
  [179.48, 'bank'],    // V3a: pushed into the bookies' TV: the race
  [181.9, 'card'],     // V3b: his phone, the buses
  [kBAR(104), 'xerox', { sweep: [kBAR(104), kBAR(104) + .42, -140, W + 140], side: 'L' }],   // V3c: the light bar copies the captcha, left to right (verse3.js)
  [189.8, 'card'],     // V3d: the classroom, the projector's leader (V3c's copy rolls out of the gate .5 s after the bar, verse3.js)
  [191.04, 'ink'],     // V3d: the projected 1930s short fills the frame
  [202.37, 'card'],    // V3d: pulled back to the classroom; V3e: his health app
  // V3e: the clapperboard's clap starts the light bar, right to left: printed as an extra (verse3.js V3E.clap)
  [kWT('The rest') + .03, 'xerox', { sweep: [kWT('The rest') + .03, kWT('The rest') + .38, W + 160, -160], side: 'R' }],
  // V3f: the copier's light bar sweeps the riso cutaway of his box room out as card, left to right (verse3.js: bar 121 + 1.09 to + 1.45)
  [kBAR(121) + 1.09, 'card', { sweep: [kBAR(121) + 1.09, kBAR(121) + 1.45, -160, W + 160], side: 'L' }],
  [229.3, 'doodle'],   // F1: through the biro window into her Friday
  [252.6, 'card'],     // F4: pulled back: a drawing in her notebook on the stopped train (with the new line, not mid-"free")
  [262.75, 'ink'],     // Z1: the chase: Tess in the ad's panel with the butler,
  [263.75, 'card', { d: K_CHANGE_Z1 }],     // ... across the first divider onto the platform,
  [264.3, 'xerox', { d: K_CHANGE_Z1 }],     // ... into the riso street,
  [265.05, 'doodle', { d: K_CHANGE_Z1 }],   // ... and into her notebook's good future, the bots piled at its edge
  [267.94, 'card'],    // Z2: the bill, the carriage
  [270.62, 'bank'],    // Z2: the paper plane flies through the window into the bunker
  [274.94, 'card'],    // Z3, Z4 (the cut): one scene at the train table, the two of them, then his hand turning her pages (the pages don't fill the frame: the singer's card)
  [287.24, 'ink'],     // O1: the ad, frozen and grey
  [292.56, 'card'],    // O1: pulled back: the phone on the train table beside her notebook (the table is card; the page doesn't fill the frame, as in Z4) (after "mine")
];
if (K_POLKA.length) K_WORLD.push([DUR, 'ink']);   // ?polka: the credits' yodel (the 1930s sing-along's bouncing ball)
function kWorldAt(t) { let i = 0; while (i + 1 < K_WORLD.length && t >= K_WORLD[i + 1][0]) i++; return i; }
function kLookAt(t) { return K_FORCE && KS[K_FORCE] ? K_FORCE : K_WORLD[kWorldAt(t)][1]; }
// The change in progress at t, if any: { from, to, m } where m is the new look's share: a number (a crossfade), or a
// sweep { X, side } (the line's x at the banner's height and the side the new look is on).
function kChange(t) {
  if (K_FORCE) return null;
  const i = kWorldAt(t), [t0, to, o = {}] = K_WORLD[i]; if (!i) return null;
  const from = K_WORLD[i - 1][1]; if (from === to) return null;
  if (o.sweep) {
    const [a, b, x0, x1, e = u => u] = o.sweep, tt = o.twos ? onTwos(t) : t; if (tt >= b) return null;
    return { from, to, m: { X: lerp(x0, x1, e(seg(tt, a, b))), side: o.side || 'R' } };
  }
  const d = o.d ?? K_CHANGE; if (t >= t0 + d) return null;
  return { from, to, m: ease((t - t0) / d) };
}

// ---------- the looks ----------
// Each look's font (weight, family, base size), inks and backing-tag font. Every look shares one layout (kRef): the
// same rows, baselines and word places, so a change of look never moves the words.
const KS = {
  ink:    { f: ['400', 'Limelight, serif', 50], backFont: '400 32px Limelight, serif',
            card: '#1D181B', rule: '#E9DBBE', text: '#F2E4C6', ball: '#FFF8EA', voice: { F: '#EE9A84', M: '#EDCB7A' } },
  card:   { f: ['800', '"Shantell Sans", sans-serif', 52], backFont: '800 34px "Shantell Sans", sans-serif',
            card: '#2B2631', edge: '#5E5568', text: '#F6EEDD', ink: '#231E28', voice: { F: '#FF6B4A', M: '#F5B82E' } },
  doodle: { f: ['700', 'Caveat, cursive', 72], backFont: '700 44px Caveat, cursive',
            paper: '#FBF8F0', rule: '#9DB7DC', margin: '#E08A8A', pencil: '#6F6A78', biro: '#26358C', voice: { F: '#FF6B4A', M: '#F5B82E' } },
  xerox:  { f: ['700', '"Space Grotesk", sans-serif', 50], backFont: '700 32px "Space Grotesk", sans-serif',
            paper: '#F1ECDF', blue: '#1E3C8C', voice: { F: '#FF4F9A', M: '#FFD23A' } },
  bank:   { f: ['700', 'Cinzel, serif', 46], backFont: '700 30px Cinzel, serif', tail: 62,
            paper: '#EEF1EA', ink: '#1F4E55', voice: { F: '#A8232E', M: '#83570A' }, tint: { F: '#FF6B4A', M: '#F5B82E' } },
};
// a tag that isn't a singer's (?polka's band, voice 'N'): each look's own plain ink (riso: none, just the blue text)
const K_NEUTRAL = { ink: '#F2E4C6', card: '#E7DDCA', doodle: '#C9C4D0', xerox: '#F1ECDF', bank: '#1F4E55' };
// The shared geometry (px at 1080p): the banner's lower edge, a one-row banner's height, the row pitch, the side
// padding, the widest row, and the baseline below each row's centre. The bottom row sits in the same place whatever the
// line; a second row goes above it and the banner grows upward.
const K_BOTTOM = 1062, K_H1 = 100, K_PITCH = 64, K_PAD = 62, K_MAXW = 1500, K_BASE = 16;
const K_ROW0 = K_BOTTOM - K_H1 / 2;   // the bottom row's centre (the origin every look draws its text from)

// ---------- one layout for every look ----------
// Each look's font is sized so its lyric sets to the same overall width as the average of the five (within ±12%), then
// each word gets one slot: its average width across the looks. A look fits its glyphs into the slot with a slight
// horizontal scale (0.88-1.14), centred, so a word stays put when the look changes; row splits, baselines and the
// banner's size are the same in every look.
let K_REF = null;
function kRef() {
  if (K_REF) return K_REF;
  const looks = Object.keys(KS), words = [...new Set(K_LINES.filter(l => !l.polka).flatMap(l => l.text.split(' ')))], sum = a => a.reduce((s, v) => s + v, 0);
  const meas = font => { KCTX.font = font; return words.map(w => KCTX.measureText(w).width); };
  const tot = {}; for (const st of looks) { const [wt, fam, s0] = KS[st].f; tot[st] = sum(meas(`${wt} ${s0}px ${fam}`)); }
  const mean = sum(Object.values(tot)) / looks.length, Wd = {}, R = { w: new Map(), fit: {}, space: 0, size: {} };
  for (const st of looks) {
    const [wt, fam, s0] = KS[st].f, size = Math.round(clamp(s0 * mean / tot[st], s0 * .88, s0 * 1.12) * 2) / 2;
    KS[st].font = `${wt} ${size}px ${fam}`; R.size[st] = size;
    Wd[st] = meas(KS[st].font); KCTX.font = KS[st].font; R.space += KCTX.measureText(' ').width / looks.length;
    R.fit[st] = new Map();
  }
  words.forEach((w, i) => { const ref = sum(looks.map(st => Wd[st][i])) / looks.length; R.w.set(w, ref); for (const st of looks) R.fit[st].set(w, clamp(ref / Wd[st][i], .88, 1.14)); });
  // (?polka's yodel words get their slots the same way, after the fonts are sized from the song's alone: the song's
  // lettering doesn't change with them)
  const yw = [...new Set(K_LINES.filter(l => l.polka).flatMap(l => l.text.split(' ')))].filter(w => !R.w.has(w));
  if (yw.length) {
    const Wy = {}; for (const st of looks) { KCTX.font = KS[st].font; Wy[st] = yw.map(w => KCTX.measureText(w).width); }
    yw.forEach((w, i) => { const ref = sum(looks.map(st => Wy[st][i])) / looks.length; R.w.set(w, ref); for (const st of looks) R.fit[st].set(w, clamp(ref / Wy[st][i], .88, 1.14)); });
  }
  return K_REF = R;
}
// A line's layout: rows of word slots, each { i, x (the slot's left, from the centre), y (its row's centre, from the
// bottom row's), b (its baseline), w (the slot's width) }. Two rows if it's wider than K_MAXW (or two = true, the
// showcase's), split for balance, preferring a break after punctuation (a clause to a row).
function kLayout(l, two = false) {
  const key = two ? '_kl2' : '_kl'; if (l[key]) return l[key];
  const R = kRef(), words = l.text.split(' '), ws = words.map(w => R.w.get(w) ?? kWidth(w)), sp = R.space;
  const rowW = r => r.reduce((s, i) => s + ws[i], 0) + sp * (r.length - 1);
  let rows = [words.map((w, i) => i)];
  if (rowW(rows[0]) > K_MAXW || two) {
    let best = 1, bd = Infinity;
    for (let i = 1; i < words.length; i++) {
      const a = rowW(rows[0].slice(0, i)), b = rowW(rows[0].slice(i)), d = Math.abs(a - b) - (/[.,;:!?"-]$/.test(words[i - 1]) ? .22 * (a + b) : 0) + (Math.max(a, b) > K_MAXW ? 1e5 : 0);
      if (d < bd) { bd = d; best = i; }
    }
    rows = [rows[0].slice(0, best), rows[0].slice(best)];
  }
  const all = [];
  rows.forEach((r, k) => { let x = -rowW(r) / 2; const y = -(rows.length - 1 - k) * K_PITCH; for (const i of r) { all[i] = { i, x, y, b: y + K_BASE, w: ws[i] }; x += ws[i] + sp; } });
  return l[key] = { words, ws: all, n: rows.length, w: Math.max(...rows.map(rowW)) };
}
// The banner's size for a line: { w, h, cy (its centre, from the bottom row's), n (rows) }
const kLineBox = (l, two) => { const L = kLayout(l, two), h = K_H1 + (L.n - 1) * K_PITCH; return { w: L.w + 2 * K_PAD, h, cy: K_H1 / 2 - h / 2, n: L.n }; };
// ... and for a phrase: one size for all its lines, the same in every look (it doesn't resize line to line; a one-row
// line in a two-row banner sits in its middle)
function kPhraseBox(p, two) {
  const key = two ? '_pb2' : '_pb'; if (p[key]) return p[key];
  let w = 0, n = 1; for (const l of p.lines) { const B = kLineBox(l, two); w = Math.max(w, B.w); n = Math.max(n, B.n); }
  const h = K_H1 + (n - 1) * K_PITCH; return p[key] = { w, h, cy: K_H1 / 2 - h / 2, n };
}
// A line's layout inside its phrase's banner (centred in the banner's rows)
function kL(s, l) {
  const nb = kPhraseBox(s.p, s.two).n, L = kLayout(l, s.two); if (L.n >= nb) return L;
  const key = '_klc' + (s.two ? '2' : '') + nb; if (l[key]) return l[key];
  const dy = -(nb - L.n) * K_PITCH / 2; return l[key] = { ...L, ws: L.ws.map(w => ({ ...w, y: w.y + dy, b: w.b + dy })) };
}
// What shows at t: the phrase, its line (the next one takes over .12 s before it starts), the previous line.
function kState(t) {
  const p = K_PHRASES.find(p => t >= p.start - .25 && t < p.end + .5);
  if (!p) return null;
  let i = 0; while (i + 1 < p.lines.length && t >= p.lines[i + 1].start - .12) i++;
  return { p, line: p.lines[i], prev: i ? p.lines[i - 1] : null, tin: t - (p.start - .25), tout: t - (p.end + .3) };
}
// ---------- small 2D helpers ----------
function kPath(c, P) { c.beginPath(); P.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); }
function kRR(c, x, y, w, h, r) { c.beginPath(); c.roundRect ? c.roundRect(x, y, w, h, r) : c.rect(x, y, w, h); }
const kH = (seed, i) => hash(seed * 7.13 + i * 1.371);
// A strip cut by hand with scissors: straight snips a little off true, corners nicked (w × h, centred).
function kCut(w, h, seed, jag = 1.6, snip = 110, nick = 4) {
  const P = [], C = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
  for (let k = 0; k < 4; k++) {
    const a = C[k], b = C[(k + 1) % 4], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / snip)), nx = (b[1] - a[1]) / L, ny = -(b[0] - a[0]) / L;
    const nk = nick * (.5 + kH(seed, k * 3 + 1));
    for (let j = 0; j <= n; j++) {
      const u = j / n, o = (kH(seed, k * 40 + j) - .5) * 2 * jag;
      if (j === 0) { P.push([a[0] + (b[0] - a[0]) * nk / L, a[1] + (b[1] - a[1]) * nk / L]); continue; }
      if (j === n) { P.push([b[0] - (b[0] - a[0]) * nk / L + nx * o * .5, b[1] - (b[1] - a[1]) * nk / L + ny * o * .5]); continue; }
      P.push([lerp(a[0], b[0], u) + nx * o, lerp(a[1], b[1], u) + ny * o]);
    }
  }
  return P;
}
// A torn edge: the outline resampled every ~6 px, each point pushed in or out (amp; the ends tear rougher). The tear
// is fixed along the paper (by distance from its left end), so a scrap that grows keeps its tear.
function kTorn(w, h, seed, amp = 1.8, endAmp = 4) {
  const P = [], C = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
  for (let k = 0; k < 4; k++) {
    const a = C[k], b = C[(k + 1) % 4], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.round(L / 6)), nx = (b[1] - a[1]) / L, ny = -(b[0] - a[0]) / L, A = k % 2 ? endAmp : amp;
    for (let j = 0; j < n; j++) {
      const u = j / n, s = Math.round((k === 2 ? (1 - u) * L : u * L) / 6), o = (kH(seed, k * 500 + s) - .5) * 2 * A + Math.sin(s * 6 / 37 + seed + k) * A * .6;
      P.push([lerp(a[0], b[0], u) + nx * o, lerp(a[1], b[1], u) + ny * o]);
    }
  }
  return P;
}
// A soft shadow under paper lying on the page (a few offset fills; a canvas blur filter costs ~40 ms a frame at 4K)
function kSoft(c, P, dx, dy, a) { c.fillStyle = `rgba(40,30,20,${a / 3})`; for (const k of [.5, 1, 1.5]) { c.save(); c.translate(dx * k, dy * k); kPath(c, P); c.fill(); c.restore(); } }
// cached textures, made once
const K_TEX = {};
function kTex(name, make) { if (!K_TEX[name]) { const cv = document.createElement('canvas'); make(cv); K_TEX[name] = cv; } return K_TEX[name]; }
function kPattern(c, name, make) { const key = name + '|pat'; if (!K_TEX[key]) K_TEX[key] = c.createPattern(kTex(name, make), 'repeat'); return K_TEX[key]; }
const kNoise = (cv, N, dens, col, a0, a1, seed) => { cv.width = cv.height = N; const x = cv.getContext('2d'), r = lcg(seed); for (let i = 0; i < N * N * dens; i++) { x.fillStyle = `rgba(${col},${a0 + (a1 - a0) * r()})`; const s = r() < .8 ? 1 : 2; x.fillRect(Math.floor(r() * N), Math.floor(r() * N), s, s); } };

// The words of a line in a look, each fitted to its slot on the shared baseline: the base colour, then the fill colour
// clipped to the sung part of the slot (f: 0..1). o.clip(c, w, f): the fill's clip (default: a sweep across the slot).
// Typeset punctuation for display (the lyric keeps its straight marks, which the chapters match against): a straight "
// opening a word becomes “ and closing one ”, a straight ' an apostrophe ’ (or ‘ opening a word)
const kTypo = s => s.replace(/(^|[\s(\[])"/g, '$1\u201C').replace(/"/g, '\u201D').replace(/(^|[\s(\[])'/g, '$1\u2018').replace(/'/g, '\u2019');
function kWords(c, L, line, t, st, base, fillCol, o = {}) {
  const S = KS[st], fit = kRef().fit[st];
  c.font = S.font; c.textBaseline = 'alphabetic'; c.textAlign = 'center';
  const word = (w, col, dx = 0, dy = 0) => { const txt = L.words[w.i]; c.save(); c.translate(w.x + w.w / 2 + dx, w.b + dy); c.scale(fit.get(txt) ?? 1, 1); c.fillStyle = col; c.fillText(kTypo(txt), 0, 0); c.restore(); };
  for (const w of L.ws) {
    if (o.shadow) word(w, o.shadow, 2, 3);
    word(w, base);
    const f = kFillOf(line, w.i, t); if (f <= 0 || !fillCol) continue;
    // (the sweep runs past the slot's ends: italic and cursive glyphs overhang their advance, a question mark's hook most)
    c.save(); c.beginPath(); if (o.clip) o.clip(c, w, f); else c.rect(w.x - 20, w.y - 50, (w.w + 40) * f, 96); c.clip();
    word(w, fillCol(kVoiceOf(line, w.i))); c.restore();
  }
}

// ---------- ink: the 1930s sing-along ----------
// The projector's weave and flicker for the film frame at t (24 a second)
const kFilm = t => { const ff = Math.floor(t * 24 + 1e-6); return { ff, dx: (hash(ff * 1.7 + 11) - .5) * 1.4 + .5 * Math.sin(t * 1.9), dy: (hash(ff * 2.9 + 13) - .5) * 1.6 + .5 * Math.sin(t * 1.3 + 1), fl: (hash(ff * 3.1 + 7) - .5) }; };
// The Art Deco frame: a thin outer rule and a heavier inner one with stepped corners, a sunburst at each end.
function kInkFrame(c, w, h, S) {
  c.strokeStyle = S.rule; c.globalAlpha = .75;
  kRR(c, -w / 2 + 7, -h / 2 + 7, w - 14, h - 14, 6); c.lineWidth = 1.2; c.stroke();
  const x0 = -w / 2 + 13, x1 = w / 2 - 13, y0 = -h / 2 + 13, y1 = h / 2 - 13, s = 9;
  kPath(c, [[x0 + s, y0], [x1 - s, y0], [x1 - s, y0 + s], [x1, y0 + s], [x1, y1 - s], [x1 - s, y1 - s], [x1 - s, y1], [x0 + s, y1], [x0 + s, y1 - s], [x0, y1 - s], [x0, y0 + s], [x0 + s, y0 + s]]);
  c.lineWidth = 2.6; c.stroke();
  for (const sx of [-1, 1]) {   // a half sunburst at each end, facing in
    const cx = sx * (w / 2 - 13); c.lineWidth = 1.6;
    for (let k = 0; k < 7; k++) { const a = (k / 6 - .5) * Math.PI * .8; c.beginPath(); c.moveTo(cx - sx * 5 * Math.cos(a), 5 * Math.sin(a)); c.lineTo(cx - sx * 19 * Math.cos(a), 19 * Math.sin(a)); c.stroke(); }
    c.beginPath(); c.arc(cx, 0, 4, sx > 0 ? Math.PI / 2 : -Math.PI / 2, sx > 0 ? Math.PI * 1.5 : Math.PI / 2); c.fillStyle = S.rule; c.fill();
  }
  c.globalAlpha = 1;
}
// The bouncing ball: lands on each word as it starts (a little way in from its left edge), rests on long notes and
// hops the last .45 s to the next one; enters from the strip's left end. { x, y (its bottom), q (squash 0..1), v }
const K_BALL = 9;
// The ball's landings in a word, one per sung syllable, as the Fleischer Screen Songs bounced: [[t, x], ...] (x over the
// middle of the syllable's letters, in the word's slot). Syllables from the spelling (kSyllables); their times from the
// lip-sync's sounds (mouths.js lipWordTimes: each syllable lands on its vowel's onset, the sung beat, the vowels timed inside the
// word, a held last vowel holding the note), or spread evenly if the two don't agree. A fast syllable gets a quick low
// skip, as the hand-moved ball did; only landings closer than .07 s (under two frames) merge.
function kSylLand(line, i, w) {
  const key = '_syl' + i; if (line[key]) return line[key];
  const tok = line.text.split(' ')[i] || '', [a, b] = line.words[i], S = kSyllables(tok);
  const F = KS.ink.f, font = `${F[0]} ${F[2]}px ${F[1]}`, full = kWidth(tok, font) || 1, xAt = j => w.x + kWidth(tok.slice(0, j), font) / full * w.w;
  let T = line.syl && line.syl[i] && line.syl[i].length === S.length ? line.syl[i].map(s => s[0]) : null;   // (?polka's yodel: each note's onset, measured)
  if (!T && S.length > 1 && typeof lipWordTimes === 'function') {
    const segs = lipWordTimes(tok, a, b), V = typeof lipVowel === 'function' ? lipVowel : s => /^(a|aa|o|u|ee)$/.test(s), on = [];
    let prev = 'c', cons = null;
    for (const [s0, , sh] of segs) { if (V(sh)) { if (prev !== 'v') on.push(s0); prev = 'v'; } else prev = 'c'; }   // (each syllable's vowel onset: its sung beat)
    if (on.length === S.length) { on[0] = a; T = on; }
  }
  if (!T) T = S.map((q, k) => a + (b - a) * .75 * k / Math.max(1, S.length - 1));   // (evenly over the word, the last syllable holding)
  const out = [];
  S.forEach((q, k) => { const p = [T[k], (xAt(q[0]) + xAt(q[1])) / 2]; if (out.length && p[0] - out[out.length - 1][0] < .07) return; out.push(p); });
  if (!out.length) out.push([a, w.x + Math.min(w.w * .4, 34)]);
  return line[key] = out;
}
// A word's syllables as character ranges [i0, i1) of the token (punctuation rides with its neighbour): one per vowel
// group, a silent final e (and -es, -ed after most consonants) not counted, a syllabic -le kept; the consonants between
// two vowels split V-CV, VC-CV. Hyphenated parts are syllabified apart; spelled letters (A-G-I) are one each.
function kSyllables(tok) {
  const out = [], parts = []; let p0 = 0;
  for (let j = 0; j <= tok.length; j++) if (j === tok.length || tok[j] === '-') { parts.push([p0, j]); p0 = j + 1; }
  for (const [s0, s1] of parts) {
    const w = tok.slice(s0, s1).toLowerCase(), L = []; for (let j = 0; j < w.length; j++) if (/[a-z]/.test(w[j])) L.push(j);
    if (!L.length) continue;
    const wl = w.replace(/[^a-z']/g, '');
    // n't: a syllable of its own after a consonant (did-n't, was-n't, could-n't), none after a vowel or r (don't, aren't)
    if (/[^aeiour']n't$/.test(wl)) { const j = w.lastIndexOf('n'); out.push(...kSyllables(tok.slice(s0, s0 + j)).map(([a, b]) => [s0 + a, s0 + b]), [s0 + j, s1]); continue; }
    if (L.length === 1 || /n't$/.test(wl) && w.replace(/[^aeiou]/g, '').length <= 2) { out.push([s0, s1]); continue; }   // (a letter; aren't, don't)
    // (digraphs count as one consonant, and a blend stays with the syllable after it)
    const ch = j => w[j], isV = (k) => { const c = ch(L[k]); if (/[aeiou]/.test(c)) return !(c === 'u' && k > 0 && ch(L[k - 1]) === 'q'); return c === 'y' && k > 0 && !/[aeiouy]/.test(ch(L[k - 1])); };
    const DI = /^(ch|sh|th|ph|wh|ck|ng|gh)$/, BL = /^(bl|br|cl|cr|dr|fl|fr|gl|gr|pl|pr|sc|sk|sl|sm|sn|sp|st|sw|tr|tw|wr|qu)$/;
    const G = []; for (let k = 0; k < L.length; k++) if (isV(k)) { if (G.length && G[G.length - 1][1] === k - 1) G[G.length - 1][1] = k; else G.push([k, k]); }
    const last = L.length - 1, lw = w.replace(/[^a-z]/g, '');
    if (G.length > 1) {
      const g = G[G.length - 1];
      const silentE = g[0] === g[1] && g[0] === last && ch(L[last]) === 'e' && !/[^aeiou]le$/.test(lw);
      const silentES = g[0] === g[1] && g[0] === last - 1 && (/[^td]ed$/.test(lw) || (/es$/.test(lw) && !/([szxcg]|sh|ch)es$/.test(lw)));
      if (silentE || silentES) G.pop();
    }
    // a silent e before a suffix (love-ly, move-ment, care-ful): the e's group joins nothing
    // and a silent e between one consonant and more (love-ly, re-place-ment, home-work, ev-ry): V C e C
    for (let n = G.length - 2; n >= 1; n--) { const g = G[n], pg = G[n - 1]; if (g[0] === g[1] && ch(L[g[0]]) === 'e' && g[0] - pg[1] === 2 && !/[aeiouy]/.test(lw[g[0] + 1] || 'a') && !/(er|en|el)[aeiou]/.test(lw.slice(g[0], g[0] + 3))) G.splice(n, 1); }
    if (!G.length) { out.push([s0, s1]); continue; }
    let start = s0;
    for (let n = 0; n < G.length; n++) {
      if (n === G.length - 1) { out.push([start, s1]); break; }
      // the consonants between: none or one: V-CV; two: VC-CV unless they're one sound or a blend; more: the last one (or
      // the last blend) starts the next syllable
      const k0 = G[n][1] + 1, k1 = G[n + 1][0], C = lw.slice(k0, k1);
      let cut = k0;
      if (C.length === 2) cut = DI.test(C) || BL.test(C) ? k0 : k0 + 1;
      else if (C.length > 2) { const e2 = C.slice(-2); cut = DI.test(e2) || BL.test(e2) ? k1 - 2 : k1 - 1; }
      const at = s0 + L[Math.min(cut, L.length - 1)]; out.push([start, at]); start = at;
    }
  }
  return out.length ? out : [[0, tok.length]];
}
// A word sung a syllable to a note (?polka's yodel, line.syl): it fills syllable by syllable, each syllable's letters
// (and the hyphen after them) over its note, holding between notes. Returned as kWords' clip share of the slot (its 20
// px margins included), so each edge lands on the letters' boundary (measured in the ink face, as kSylLand's x).
function kSylFill(l, i, t) {
  const S = l.syl[i]; if (t < S[0][0]) return 0;
  const key = '_sf' + i;
  if (l[key] === undefined) {
    const tok = l.text.split(' ')[i] || '', R = kSyllables(tok), F = KS.ink.f, font = `${F[0]} ${F[2]}px ${F[1]}`, full = kWidth(tok, font) || 1, w = kRef().w.get(tok) ?? kWidth(tok);
    const at = j => (20 + kWidth(tok.slice(0, j), font) / full * w) / (w + 40);
    l[key] = R.length === S.length ? R.map((r, k) => [at(r[0]), k + 1 < R.length ? at(R[k + 1][0]) : 1]) : null;
  }
  const E = l[key]; if (!E) { const [a, b] = l.words[i]; return clamp((t - a) / Math.max(.06, b - a)); }
  let k = 0; while (k + 1 < S.length && t >= S[k + 1][0]) k++;
  const [a, b] = S[k]; return lerp(E[k][0], E[k][1], clamp((t - a) / Math.max(.06, b - a)));
}
function kBall(s, t, B) {
  const L = kL(s, s.line), line = s.line, top = w => w.b - 34 - 5, pts = [];
  if (s.prev) { const P = kL(s, s.prev), j = P.ws.length - 1, w = P.ws[j], sl = kSylLand(s.prev, j, w), q = sl[sl.length - 1]; pts.push([q[0], q[1], top(w), kVoiceOf(s.prev, j)]); }
  else pts.push([line.words[0][0] - .5, -B.w / 2 + 44, top(L.ws[0]), kVoiceOf(line, 0)]);
  L.ws.forEach((w, i) => { for (const [ts, x] of kSylLand(line, i, w)) pts.push([ts, x, top(w), kVoiceOf(line, i)]); });
  let k = 0; while (k + 1 < pts.length && t >= pts[k + 1][0]) k++;
  const land = Math.min(...pts.slice(1).map(p => Math.abs(t - p[0]))), q = clamp(1 - land / .07);
  if (k + 1 >= pts.length || t < pts[0][0]) { const p = pts[t < pts[0][0] ? 0 : k]; return { x: p[1], y: p[2], q, v: p[3] }; }
  const [t0, x0, y0] = pts[k], [t1, x1, y1, v1] = pts[k + 1], hop = Math.min(t1 - t0, .45), u = clamp((t - (t1 - hop)) / hop);
  const hh = clamp(hop * 170, hop < .12 ? 12 : 24, 60)   // (a quick syllable a low skip; the rest a hop that reads) + Math.max(0, y0 - y1) * .6;
  return { x: lerp(x0, x1, u), y: lerp(y0, y1, u) - hh * 4 * u * (1 - u), q, v: u > .5 ? v1 : pts[k][3] };
}
function kInk(c, t, s, B, S) {
  const k = easeOut(clamp(s.tin / .22)) * (1 - ease(clamp(s.tout / .2)));   // an iris in and out
  if (k < .01) return;
  const F = kFilm(t);
  c.save(); c.translate(F.dx, F.dy);
  c.save(); c.beginPath(); c.arc(0, B.cy, k * (Math.hypot(B.w / 2, B.h / 2) + 12), 0, TAU); c.clip();
  c.save(); c.translate(0, B.cy);
  kRR(c, -B.w / 2, -B.h / 2, B.w, B.h, 12); c.fillStyle = mixCol(S.card, '#3A3034', clamp(.12 + F.fl * .18)); c.fill();
  kInkFrame(c, B.w, B.h, S);
  c.restore();
  c.globalAlpha = .96 + F.fl * .06;
  kWords(c, kL(s, s.line), s.line, t, 'ink', S.text, v => S.voice[v]);
  const b = kBall(s, t, B), r = K_BALL;   // the ball: the period's white ball
  c.save(); c.translate(b.x, b.y); c.scale(1 + .3 * b.q, 1 - .28 * b.q);
  c.beginPath(); c.arc(0, -r, r, 0, TAU); c.fillStyle = S.ball; c.fill(); c.lineWidth = 1.8; c.strokeStyle = '#120E10'; c.stroke();
  c.beginPath(); c.arc(2.5, -r + 2.5, r - 2.5, .1 * Math.PI, .75 * Math.PI); c.strokeStyle = 'rgba(160,140,120,.6)'; c.lineWidth = 2; c.stroke();
  c.restore(); c.globalAlpha = 1;
  // the film: grain, dust and the odd scratch, new every frame, on the strip
  c.translate(0, B.cy); kRR(c, -B.w / 2, -B.h / 2, B.w, B.h, 12); c.clip();
  const g = kPattern(c, 'filmgrain', cv => kNoise(cv, 256, .22, '255,246,228', .04, .22, 17));
  g.setTransform(new DOMMatrix().translate(hash(F.ff * 5.3) * 256, hash(F.ff * 7.9) * 256)); c.fillStyle = g; c.fillRect(-B.w / 2, -B.h / 2, B.w, B.h);
  c.fillStyle = 'rgba(242,228,198,.55)';
  for (let i = 0; i < 3; i++) if (hash(F.ff * 1.9 + i * 7) < .35) { c.beginPath(); c.arc((hash(F.ff + i * 3.3) - .5) * B.w, (hash(F.ff * 2.2 + i) - .5) * B.h, .8 + 1.6 * hash(F.ff * .7 + i), 0, TAU); c.fill(); }
  if (hash(F.ff * 4.1 + 2) < .14) { c.fillStyle = 'rgba(242,228,198,.28)'; c.fillRect((hash(F.ff * 6.1) - .5) * B.w, -B.h / 2, 1.2, B.h); }
  c.restore(); c.restore();
}

// ---------- card: cut card, chips on twos ----------
// the card's fibres (light, on the dark strip; dark on the coloured chips)
const kFibres = (dark) => cv => { cv.width = cv.height = 220; const x = cv.getContext('2d'), r = lcg(dark ? 41 : 29); x.lineWidth = 1;
  for (let i = 0; i < 2200; i++) { x.fillStyle = dark ? `rgba(70,50,30,${.05 + .08 * r()})` : `rgba(255,245,228,${.03 + .05 * r()})`; x.fillRect(r() * 220, r() * 220, 1, 1); }
  for (let k = 0; k < 70; k++) { const px = r() * 220, py = r() * 220, l = 6 + r() * 20, a = r() * TAU; x.strokeStyle = dark ? `rgba(80,56,36,${.06 + .08 * r()})` : `rgba(255,245,228,${.04 + .06 * r()})`;
    for (const [ox, oy] of [[0, 0], [-220, 0], [220, 0], [0, -220], [0, 220]]) { x.beginPath(); x.moveTo(px + ox, py + oy); x.quadraticCurveTo(px + ox + Math.cos(a + .5) * l * .5, py + oy + Math.sin(a + .5) * l * .5, px + ox + Math.cos(a) * l, py + oy + Math.sin(a) * l); x.stroke(); } } };
// One card piece: lift shadow, the card, its fibres, the pale cut edge on the lit (upper left) side.
function kCardPiece(c, P, col, edge, fib, lift) {
  c.save(); c.translate(lift * .8, lift); kPath(c, P); c.fillStyle = 'rgba(18,14,18,.34)'; c.fill(); c.restore();
  kPath(c, P); c.fillStyle = col; c.fill();
  c.save(); c.clip(); c.fillStyle = kPattern(c, 'fib' + fib, kFibres(fib === 'd')); c.fillRect(-2000, -400, 4000, 800); c.restore();
  c.strokeStyle = edge; c.lineWidth = 1.1; c.beginPath();
  for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], nx = b[1] - a[1], ny = -(b[0] - a[0]); if (nx * -.62 + ny * -.78 > 0) { c.moveTo(a[0] + .6, a[1] + .6); c.lineTo(b[0] + .6, b[1] + .6); } }
  c.stroke();
}
function kCard(c, t, s, B, S) {
  const tq = onTwos(t), tin = tq - (s.p.start - .25), tout = tq - (s.p.end + .3);   // (the strip is placed and taken by hand: on twos)
  const e = easeOut(clamp(tin / .25)), x = ease(clamp(tout / .2));
  if (e <= 0 || x >= 1) return;
  const seed = s.p.id * 3.1 + 1, dy = ((1 - e) + x) * (B.h + 70);
  c.save(); c.translate(0, dy);
  c.save(); c.translate(0, B.cy); kCardPiece(c, kCut(B.w, B.h, seed, 1.6, 120, 5), S.card, S.edge, 'l', 7); c.restore();
  // the chips: each word's slides out from under the last one's as the word starts, and settles (on twos)
  const L = kL(s, s.line), line = s.line, chips = [];
  for (const w of L.ws) {
    const [a, b] = line.words[w.i], D = clamp(b - a, 2 / 12, 4 / 12), u = clamp((tq - a + 1 / 24) / D);
    if (tq < a - 1 / 24) continue;
    const cs = seed * 13 + w.i, slide = w.i && L.ws[w.i - 1].y === w.y ? Math.min(w.w * .55 + 12, 64) : 22;
    chips.push({ w, P: kCut(w.w + 16, 56, cs, 1.2, 60, 3), x: w.x + w.w / 2 - (1 - ease(u)) * slide, y: w.y + 2 + (kH(cs, 2) - .5) * 4, r: (kH(cs, 3) - .5) * .06, v: kVoiceOf(line, w.i) });
  }
  for (let i = chips.length - 1; i >= 0; i--) { const ch = chips[i]; c.save(); c.translate(ch.x, ch.y); c.rotate(ch.r); kCardPiece(c, ch.P, S.voice[ch.v], mixCol(S.voice[ch.v], '#FFFFFF', .35), 'd', 3); c.restore(); }
  // the text: cream on the strip, ink where it lies over a chip
  kWords(c, L, line, t, 'card', S.text, null, { shadow: 'rgba(0,0,0,.3)' });
  if (chips.length) {
    c.save(); c.beginPath();
    for (const ch of chips) { const cs = Math.cos(ch.r), sn = Math.sin(ch.r); ch.P.forEach(([px, py], i) => { const X = ch.x + px * cs - py * sn, Y = ch.y + px * sn + py * cs; i ? c.lineTo(X, Y) : c.moveTo(X, Y); }); c.closePath(); }
    c.clip(); kWords(c, L, line, t, 'card', S.ink, null); c.restore();
  }
  c.restore();
}

// ---------- doodle: her notebook ----------
// the coloured pencil's grain: the colour with the paper showing through in specks
const kPencil = col => cv => { cv.width = cv.height = 96; const x = cv.getContext('2d'), r = lcg(col.length * 7 + parseInt(col.slice(1), 16) % 997); x.fillStyle = col; x.fillRect(0, 0, 96, 96);
  x.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(0,0,0,${.3 + .7 * r()})`; x.fillRect(r() * 96, r() * 96, 1 + r() * 1.5, 1); } };
function kDoodle(c, t, s, B, S) {
  const tq = onTwos(t), tin = tq - (s.p.start - .25), tout = tq - (s.p.end + .3);   // (paper laid down by hand: on twos)
  const e = easeOut(clamp(tin / .25)), x = ease(clamp(tout / .2));
  if (e <= 0 || x >= 1) return;
  const seed = s.p.id * 5.7 + 3;
  c.save(); c.translate(0, ((1 - e) * .5 + x) * (B.h + 80));
  const P = kTorn(B.w, B.h, seed, 2.2, 5);
  c.save(); c.translate(0, B.cy); kSoft(c, P, 3, 5, .26); kPath(c, P); c.fillStyle = S.paper; c.fill();
  c.save(); c.clip();
  // the rules: the writing sits on them (one at each row's baseline, and on at the page's pitch above and below)
  c.strokeStyle = S.rule; c.lineWidth = 1.3;
  for (let y = K_BASE + 5 - B.cy + K_PITCH * 3; y > -B.h / 2; y -= K_PITCH) if (y < B.h / 2) { c.beginPath(); c.moveTo(-B.w / 2, y); c.lineTo(B.w / 2, y + .4); c.stroke(); }
  c.strokeStyle = S.margin; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-B.w / 2 + 38, -B.h / 2); c.lineTo(-B.w / 2 + 38.6, B.h / 2); c.stroke();
  c.restore(); c.restore();
  // coloured pencil under each word as it's sung: quick zigzag strokes, on twos
  const L = kL(s, s.line), line = s.line;
  for (const w of L.ws) {
    const f = kFillOf(line, w.i, tq); if (f <= 0) continue;
    const v = kVoiceOf(line, w.i), x0 = w.x - 7, x1 = w.x + w.w + 14, y0 = w.y - 22, y1 = w.y + 24, ws = seed * 31 + w.i;
    c.save(); c.beginPath(); c.rect(x0 - 4, y0 - 6, (x1 - x0 + 8) * f, y1 - y0 + 12); c.clip();
    c.strokeStyle = kPattern(c, 'pencil' + v, kPencil(S.voice[v])); c.lineWidth = 4.2; c.lineCap = c.lineJoin = 'round'; c.globalAlpha = .8;
    c.beginPath(); c.moveTo(x0, y1);
    for (let xx = x0, k = 0; xx < x1; xx += 5.5, k++) { const j = (kH(ws, k) - .5) * 4; c.lineTo(xx + 9 + j, (k % 2 ? y1 : y0) + j * .8); }
    c.stroke(); c.restore();
  }
  c.globalAlpha = 1;
  // the words: pencilled in, inked over in biro as they're sung
  kWords(c, L, line, tq, 'doodle', S.pencil, () => S.biro);
  c.restore();
}

// ---------- riso: a printed slip ----------
function kXerox(c, t, s, B, S) {
  const k = easeOut(clamp(s.tin / .22)), x = easeIn(clamp(s.tout / .2));   // fed out of the drum left to right; dropped
  if (k <= 0 || x >= 1) return;
  const seed = s.p.id * 2.3 + 7, P = kCut(B.w, B.h, seed, .8, 160, 1.5), reg = [2.6 * (kH(seed, 1) > .5 ? 1 : -1), -1.8];
  c.save(); c.translate(0, x * (B.h + 90));
  c.beginPath(); c.rect(-B.w / 2 - 20, B.cy - B.h / 2 - 30, (B.w + 40) * k, B.h + 60); c.clip();
  c.save(); c.translate(0, B.cy);
  c.save(); c.translate(3, 4); kPath(c, P); c.fillStyle = 'rgba(20,24,50,.3)'; c.fill(); c.restore();
  kPath(c, P); c.fillStyle = S.paper; c.fill();
  c.clip();
  // the print: two blue rules, then (below) the sung words' pink or yellow blocks, toner grit, the key text
  c.fillStyle = S.blue; c.fillRect(-B.w / 2, -B.h / 2 + 8, B.w, 2.4); c.fillRect(-B.w / 2, B.h / 2 - 10.4, B.w, 2.4);
  c.fillStyle = S.blue;   // a halftone fade at each end of the slip (the blue drum's screen)
  for (const sx of [-1, 1]) for (let gx = 0; gx < 7; gx++) for (let gy = 0; gy * 5 < B.h - 22; gy++) {
    const r = 1.9 * (1 - gx / 7), X = sx * (B.w / 2 - 6 - gx * 5 - (gy % 2) * 2.5), Y = -B.h / 2 + 14 + gy * 5;
    if (r > .3) { c.beginPath(); c.arc(X, Y, r, 0, TAU); c.fill(); }
  }
  c.fillStyle = 'rgba(30,60,140,.55)';   // toner grit
  for (let i = 0; i < 60; i++) { c.beginPath(); c.arc((kH(seed, i + 1300) - .5) * B.w, (kH(seed, i + 1700) - .5) * B.h, .4 + 1.1 * Math.pow(kH(seed, i + 2100), 2), 0, TAU); c.fill(); }
  c.fillStyle = 'rgba(30,60,140,.06)'; c.fillRect((kH(seed, 77) - .5) * B.w, -B.h / 2, 3 + 5 * kH(seed, 78), B.h);   // a drum streak
  c.restore();
  const L = kL(s, s.line), line = s.line;
  c.globalCompositeOperation = 'multiply';
  for (const w of L.ws) {
    const f = kFillOf(line, w.i, t); if (f <= 0) continue;
    const x0 = w.x - 8 + reg[0], y0 = w.y - 27 + reg[1], bw = w.w + 16;
    c.save(); c.beginPath(); c.rect(x0, y0 - 2, bw * f, 58); c.clip();
    c.fillStyle = S.voice[kVoiceOf(line, w.i)]; kPath(c, [[x0, y0 + 1], [x0 + bw, y0], [x0 + bw + 1, y0 + 54], [x0 - 1, y0 + 55]]); c.fill();
    c.restore();
  }
  c.globalCompositeOperation = 'source-over';
  c.fillStyle = 'rgba(241,236,223,.9)';   // drop-outs: specks where the drum didn't lay its ink
  for (const w of L.ws) { const f = kFillOf(line, w.i, t); if (f <= 0) continue; for (let i = 0; i < 10; i++) { const u = kH(seed, w.i * 50 + i); if (u > f) continue; c.beginPath(); c.arc(w.x - 8 + reg[0] + u * (w.w + 16), w.y - 24 + reg[1] + 50 * kH(seed, w.i * 50 + i + 25), .7 + 1.1 * kH(seed, w.i * 70 + i), 0, TAU); c.fill(); } }
  c.globalCompositeOperation = 'multiply';
  kWords(c, L, line, t, 'xerox', S.blue, null);
  c.globalCompositeOperation = 'source-over';
  if (k < 1) { c.fillStyle = S.voice.F; c.globalAlpha = .5; c.fillRect(-B.w / 2 - 20 + (B.w + 40) * k - 4, B.cy - B.h / 2, 4, B.h); c.globalAlpha = 1; }   // the drum's edge
  c.restore();
}

// ---------- bank: an engraved banderole ----------
// A guilloche band: n interlaced sine waves between y0 and y1 across [x0, x1].
function kGuilloche(c, x0, x1, y0, y1, n = 4, per = 13, lw = .8) {
  const m = (y0 + y1) / 2, a = (y1 - y0) / 2; c.lineWidth = lw; c.beginPath();
  for (let j = 0; j < n; j++) for (let x = x0; x <= x1; x += 2) { const y = m + a * Math.sin((x - x0) / per * TAU / 2 + j * Math.PI / n) * Math.cos((x - x0) / (per * 7.3) + j); x === x0 ? c.moveTo(x, y) : c.lineTo(x, y); }
  c.stroke();
}
// fine engraved lines across a box: horizontal, pitch d, each with a gentle wave
function kLines(c, x0, x1, y0, y1, d, amp, wl, lw) {
  c.lineWidth = lw; c.beginPath();
  for (let y = y0, k = 0; y <= y1; y += d, k++) for (let x = x0; x <= x1; x += 4) { const yy = y + amp * Math.sin(x / wl + k * .7); x === x0 ? c.moveTo(x, yy) : c.lineTo(x, yy); }
  c.stroke();
}
function kBank(c, t, s, B, S) {
  const k = easeOut(clamp(s.tin / .24)) * (1 - ease(clamp(s.tout / .2)));   // unfurls from the middle
  if (k < .02) return;
  const w = B.w * k, h = B.h, T = S.tail;
  c.save(); c.translate(0, B.cy);
  c.strokeStyle = S.ink;
  // the tails, folded back behind the face: engraved, a swallowtail notch at each end
  for (const sx of [-1, 1]) {
    const xe = sx * (w / 2), xo = sx * (w / 2 + T), y0 = -h / 2 + 16, y1 = h / 2 + 16;
    const Q = [[xe - sx * 20, y0], [xo, y0], [xo - sx * 22, (y0 + y1) / 2], [xo, y1], [xe - sx * 20, y1]];
    c.save(); c.translate(3, 4); kPath(c, Q); c.fillStyle = 'rgba(10,30,34,.2)'; c.fill(); c.restore();
    kPath(c, Q); c.fillStyle = S.paper; c.fill();
    c.save(); c.clip(); kLines(c, Math.min(xe, xo) - 4, Math.max(xe, xo) + 4, y0, y1, 2.7, .6, 9, .95); c.restore();
    kPath(c, Q); c.lineWidth = 1.6; c.stroke();
    const F = [[xe, h / 2], [xe - sx * 20, h / 2], [xe - sx * 20, y1]];   // the fold
    kPath(c, F); c.fillStyle = S.paper; c.fill(); c.save(); c.clip(); kLines(c, Math.min(xe, xe - sx * 20) - 2, Math.max(xe, xe - sx * 20) + 2, h / 2 - 2, y1 + 2, 1.9, 0, 9, 1.1); c.restore(); kPath(c, F); c.lineWidth = 1.2; c.stroke();
  }
  // the face: paper, a fine underprint, guilloche borders, a double rule
  kRR(c, -w / 2, -h / 2, w, h, 3); c.fillStyle = S.paper; c.fill();
  c.save(); kRR(c, -w / 2, -h / 2, w, h, 3); c.clip();
  c.globalAlpha = .16; kLines(c, -w / 2, w / 2, -h / 2 + 2, h / 2, 4.2, 1.6, 26, .8); c.globalAlpha = .8;
  kGuilloche(c, -w / 2 + 6, w / 2 - 6, -h / 2 + 4, -h / 2 + 13, 4, 11, .75); kGuilloche(c, -w / 2 + 6, w / 2 - 6, h / 2 - 13, h / 2 - 4, 4, 11, .75);
  c.globalAlpha = 1; c.restore();
  kRR(c, -w / 2, -h / 2, w, h, 3); c.lineWidth = 2; c.stroke();
  kRR(c, -w / 2 + 4, -h / 2 + 16, w - 8, h - 32, 2); c.lineWidth = .8; c.stroke();
  c.restore();
  // the words: the singer's colour as fine lines under each sung word, the letters printing in their ink
  c.save(); c.beginPath(); c.rect(-w / 2 + 2, B.cy - h / 2, w - 4, h); c.clip();
  const L = kL(s, s.line), line = s.line;
  for (const wd of L.ws) {
    const f = kFillOf(line, wd.i, t); if (f <= 0) continue;
    c.save(); c.beginPath(); c.rect(wd.x - 7, wd.y - 21, (wd.w + 14) * f, 42); c.clip();
    c.strokeStyle = S.tint[kVoiceOf(line, wd.i)]; c.globalAlpha = .7; kLines(c, wd.x - 8, wd.x + wd.w + 8, wd.y - 21, wd.y + 21, 3.4, .8, 7, 1); c.restore();
  }
  c.globalAlpha = 1;
  kWords(c, L, line, t, 'bank', S.ink, v => S.voice[v]);
  c.restore();
}
const K_DRAW = { ink: kInk, card: kCard, doodle: kDoodle, xerox: kXerox, bank: kBank };

// ---------- backing vocals: a small tag in the look, anchored once ----------
// Its home is fixed when it appears: above the right end of the widest banner shown while it's up, clear of the
// tallest. It holds there until it's gone (a change of look restyles it in place).
function kTagHome(b) {
  if (b._home) return b._home;
  const ps = K_PHRASES.filter(p => p.start - .25 < b.end + .15 && p.end + .5 > b.start);
  if (b.voice === 'N' && !ps.length) return b._home = { x: W / 2, y: K_ROW0 };   // (?polka's band with no one singing: a caption, where the subtitle goes)
  let bw = 0, bh = K_H1; for (const p of ps) { const X = kPhraseBox(p); bw = Math.max(bw, X.w); bh = Math.max(bh, X.h); }
  const tw = Math.max(...Object.values(KS).map(S => kWidth('(' + b.text + ')', S.backFont))) + 48;
  return b._home = { x: Math.min(W - tw / 2 - 34, W / 2 + (bw || 900) / 2 - tw * .3), y: K_BOTTOM - bh - 40 };
}
function kTag(c, t, b, st) {
  const S = KS[st], txt = kTypo('(' + b.text + ')'), H0 = kTagHome(b), v = b.voice || (b.singer || 'F')[0];
  const vc = S.voice[v] || K_NEUTRAL[st];   // (the singer's colour; the band's tags (?polka, voice 'N') a neutral one)
  const onT = st === 'card' || st === 'doodle', tt = onT ? onTwos(t) : t;
  const k = onT ? clamp((tt - b.start + 1 / 24) / (2 / 12)) : backOut(seg(tt, b.start, b.start + .2));
  const out = ease(seg(tt, b.end, b.end + .15)); if (k <= .02 || out >= 1) return;
  c.font = S.backFont; const tw = c.measureText(txt).width, w = tw + 40, h = parseInt(S.backFont.match(/(\d+)px/)[1]) + 26;
  c.save(); c.translate(H0.x, H0.y); c.rotate(-.04);
  if (onT) c.translate(0, (1 - k) * -18 + out * 30); else c.scale(k * (1 - out), k * (1 - out));
  c.textAlign = 'center'; c.textBaseline = 'middle';
  const seed = Math.round(b.start * 10);
  if (st === 'ink') {
    const F = kFilm(t); c.translate(F.dx, F.dy);
    kRR(c, -w / 2, -h / 2, w, h, h / 2); c.fillStyle = S.card; c.fill(); kRR(c, -w / 2 + 5, -h / 2 + 5, w - 10, h - 10, h / 2 - 5); c.strokeStyle = S.rule; c.globalAlpha = .7; c.lineWidth = 1.2; c.stroke(); c.globalAlpha = 1;
    c.fillStyle = vc; c.fillText(txt, 0, 2);
  } else if (st === 'card') {
    kCardPiece(c, kCut(w, h, seed, 1.2, 60, 3), vc, mixCol(vc, '#FFFFFF', .35), 'd', 4);
    c.fillStyle = S.ink; c.fillText(txt, 0, 1);
  } else if (st === 'doodle') {
    const P = kTorn(w, h + 6, seed, 1.3, 2.5);
    kSoft(c, P, 2, 4, .24);
    kPath(c, P); c.fillStyle = S.paper; c.fill();
    c.strokeStyle = kPattern(c, 'pencil' + v, kPencil(vc)); c.lineWidth = 4; c.lineCap = 'round'; c.globalAlpha = .8; c.beginPath(); c.moveTo(-tw / 2 - 4, 14);
    for (let x = -tw / 2 - 4, j = 0; x < tw / 2 + 4; x += 5.5, j++) c.lineTo(x + 9, j % 2 ? 14 : -12); c.stroke(); c.globalAlpha = 1;
    c.fillStyle = S.biro; c.fillText(txt, 0, 2);
  } else if (st === 'xerox') {
    const P = kCut(w, h, seed, .8, 80, 1.5);
    c.save(); c.translate(2, 3); kPath(c, P); c.fillStyle = 'rgba(20,24,50,.28)'; c.fill(); c.restore();
    kPath(c, P); c.fillStyle = S.paper; c.fill(); c.globalCompositeOperation = 'multiply';
    c.fillStyle = vc; c.fillRect(-w / 2 + 7 + 2.5, -h / 2 + 7 - 1.5, w - 14, h - 14);
    c.fillStyle = S.blue; c.fillText(txt, 0, 1); c.globalCompositeOperation = 'source-over';
  } else {
    kRR(c, -w / 2, -h / 2, w, h, h / 2); c.fillStyle = S.paper; c.fill(); c.strokeStyle = S.ink;
    c.save(); c.clip(); c.globalAlpha = .75; kGuilloche(c, -w / 2, w / 2, -h / 2 + 2, -h / 2 + 8, 3, 8, .6); kGuilloche(c, -w / 2, w / 2, h / 2 - 8, h / 2 - 2, 3, 8, .6); c.restore(); c.globalAlpha = 1;
    kRR(c, -w / 2, -h / 2, w, h, h / 2); c.lineWidth = 1.6; c.stroke();
    c.fillStyle = vc; c.fillText(txt, 0, 2);
  }
  c.restore();
}

// ---------- the frame's subtitles ----------
// One look's banner and tag at t: drawn from the bottom row's centre.
function kDrawLook(c, t, st, s, b) {
  c.save();
  if (s) { c.save(); c.translate(W / 2, K_ROW0); K_DRAW[st](c, t, s, kPhraseBox(s.p, s.two), KS[st]); c.restore(); }
  if (b) kTag(c, t, b, st);
  c.restore();
}
// A change of look (kChange): both looks drawn into layers over the banner's band, each masked to its share (the new
// look's m, the old one's 1 - m, across the sweep's feathered line or uniformly) and summed ('lighter' adds the
// premultiplied layers: an exact crossfade that never lets the picture show through where both cover it), then laid
// over the frame. A copier's sweep lights the banner as its bar passes.
const K_BAND = { y0: 700, h: 380, L: [] };
function kLayer(i) {
  let c = K_BAND.L[i];
  if (!c) { const cv = document.createElement('canvas'); cv.width = W * OS; cv.height = K_BAND.h * OS; c = K_BAND.L[i] = cv.getContext('2d'); }
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.clearRect(0, 0, c.canvas.width, c.canvas.height);
  c.setTransform(OS, 0, 0, OS, 0, -K_BAND.y0 * OS);
  return c;
}
function kMask(c, m, share) {   // keep share(m) of the layer: share = the new look's (u => u) or the old one's (u => 1 - u)
  c.save(); c.globalCompositeOperation = 'destination-in';
  if (typeof m === 'number') c.fillStyle = `rgba(0,0,0,${share(m)})`;
  else { const f = 36, g = c.createLinearGradient(m.X - f, 0, m.X + f, 0), a = m.side === 'R' ? [0, 1] : [1, 0]; g.addColorStop(0, `rgba(0,0,0,${share(a[0])})`); g.addColorStop(1, `rgba(0,0,0,${share(a[1])})`); c.fillStyle = g; }
  c.fillRect(-10, K_BAND.y0, W + 20, K_BAND.h); c.restore();
}
function karaokeDraw(c, t, o = {}) {
  const s = o.state !== undefined ? o.state : kState(t), b = o.back !== undefined ? o.back : K_BACK.find(b => t >= b.start && t < b.end + .15);
  if (!s && !b) return;
  const ch = o.look ? null : kChange(t);
  if (!ch) { kDrawLook(c, t, o.look || kLookAt(t), s, b); return; }
  const A = kLayer(0); kDrawLook(A, t, ch.from, s, b); kMask(A, ch.m, u => 1 - u);
  const B = kLayer(1); kDrawLook(B, t, ch.to, s, b); kMask(B, ch.m, u => u);
  B.save(); B.setTransform(1, 0, 0, 1, 0, 0); B.globalCompositeOperation = 'lighter'; B.drawImage(A.canvas, 0, 0); B.restore();
  if (typeof ch.m === 'object' && (ch.from === 'xerox' || ch.to === 'xerox')) {   // the copier's bar lighting the banner as it passes
    const g = B.createLinearGradient(ch.m.X - 40, 0, ch.m.X + 40, 0); g.addColorStop(0, 'rgba(220,255,236,0)'); g.addColorStop(.5, 'rgba(236,255,244,.75)'); g.addColorStop(1, 'rgba(220,255,236,0)');
    B.save(); B.globalCompositeOperation = 'source-atop'; B.fillStyle = g; B.fillRect(ch.m.X - 40, K_BAND.y0, 80, K_BAND.h); B.restore();
  }
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.drawImage(B.canvas, 0, K_BAND.y0 * OS); c.restore();
}

// ---------- the showcase: LOOPS.subs, 1 s per state ----------
// Each look over one of its own shots: opening, mid-line and fully sung, on a two-row line with a backing tag.
//   node render.mjs --loop=subs --sheet=0.5,1.5,...,14.5 --cols=3 --w=640 --out=out/karaoke/showcase.jpg
const K_SHOW = [['ink', 3.2], ['card', 20.5], ['doodle', 240.5], ['xerox', 107.5], ['bank', 31]];
if (typeof LOOPS !== 'undefined') {
  LOOPS.subs = t => {
    const [st, at] = K_SHOW[Math.min(K_SHOW.length - 1, Math.floor(t / 3))];
    let i = 0; while (i + 1 < SHOTS.length && at >= SHOTS[i + 1][0]) i++;
    SHOTS[i][1](at, at - SHOTS[i][0], (SHOTS[i + 1] ? SHOTS[i + 1][0] : DUR) - SHOTS[i][0]); CAM = null;
  };
  LOOPS.subs.len = K_SHOW.length * 3; LOOPS.subs.karaoke = 'show';
}
function karaokeShow(c, lt) {
  const [st] = K_SHOW[Math.min(K_SHOW.length - 1, Math.floor(lt / 3))], state = Math.floor(lt) % 3;
  const line = K_LINES.find(l => l.wordVoice), p = { lines: [line], start: line.start, end: line.end, id: 99 };
  const [a0] = line.words[0], a1 = line.words[line.words.length - 1][1];
  const t = [line.start - .13, lerp(a0, a1, .5), line.end + .2][state];
  const B = kPhraseBox(p, true), b0 = K_BACK.find(b => b.text.startsWith('Wow')), tw = kWidth('(' + b0.text + ')', KS[st].backFont) + 48;
  const back = { ...b0, start: t - .5, end: t + 1, _home: { x: W / 2 + B.w / 2 - tw * .3, y: K_BOTTOM - B.h - 40 } };
  karaokeDraw(c, t, { look: st, state: { p, line, prev: null, two: true, tin: t - (line.start - .25), tout: t - (line.end + .3) }, back: state ? back : null });
}

// ---------- hooks ----------
{
  const _composite = composite, _setup = setup;
  composite = function (t) {   // everything on the compositor, after the frame
    _composite(t);
    if (window.LOOP && window.LOOP.karaoke === 'show') karaokeShow(outX, t);
    else if (!window.LOOP || window.LOOP.karaoke) karaokeDraw(outX, t);
  };
  // the fonts load before the first frame
  setup = async function () { await Promise.all([document.fonts.load(KARA.font), ...K_FACES.map(f => f.load().catch(e => console.warn('karaoke font', e)))]); return _setup(); };
}

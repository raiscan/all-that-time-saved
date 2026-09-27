// mouths.js: replacement mouths and eyes (the cut-out animator's way to act a face, for the card look), the lip-sync
// that picks the mouths from the lyric, and the moustache that goes with a mouth.
//
// In card a mouth or an eye never morphs. It is one of a small chart of pieces, each cut once (a stable key and a fixed
// shape: the same card every time it comes back), held for a while, then swapped for another. Swaps land on the film's
// twos at most (12 a second, as mt) and a shape holds two steps at least (a blink may be one).
//
// Mouths (lipPiece), after the classic lip-sync replacement charts:
//   rest  closed, relaxed               m   M / B / P: the lips pressed     e   slightly open (most consonants)
//   a     open (A / I)                  aa  wide open (a held A; a shout)   o   O: round
//   u     OO / W: small and pursed      ee  E / EE: wide, teeth             fv  F / V: the top teeth on the lower lip
// each in three moods (neutral, :smile, :frown: the corners up or down), plus the acting pieces grin, shout, laugh
// (two pieces, aa:smile and a:smile, alternating on twos), smirk, wobble, grimace. In card mouthH() draws every mouth
// from this chart: its kinds map onto it (flat → rest, smile → rest:smile, open → a, O → shout, o → o, sigh → u...);
// a 'lip:<shape>[:<mood>]' kind draws that piece in any look.
// A moustache is part of the piece (lipTache, o.tache): it sits on the upper lip and lifts with it on the open shapes;
// the mouth opens below it, never through it, and the lower lip and the jaw carry the opening (lipGeo(kind).drop: how
// far below the lip line the lower lip reaches, so a rig can drop the chin to make room: see person()).
//
// Lip-sync (lipAt(t, voice) → a chart shape or null): the words that voice sings (LYRICS: the lines' word timings and
// voices, per word where a line changes singer; backing vocals left out), each word's letters mapped to chart shapes
// (vowels hold the note, consonants are quick, a long A opens wide), laid on the twos by a small dynamic programme that
// keeps every shape two steps at least and loses the least of the words (lip closures and open vowels count most).
// A person whose preset has a voice (HIM_C 'M', HER_C 'F') lip-syncs in card while that voice sings, the shot's mouth
// giving the mood (smile / frown / neutral; a shout opens wider; a grimace sings through gritted teeth; a laugh is
// acting and wins): o.sing:
// false stops it, o.sing: 'M' | 'F' gives a voice, o.sing: lipPart(...) just the words that character speaks.
// Eyes (cardEye): in card an eye's settings snap to a chart too: the lid (open) in tenths, shut below .15 (the blink
// piece), the lower lid, slant and size in steps, and the look to five places across and three up and down.
// Only in card (outside it, the drawn mouths and eyes; a shot may still give a mouth a chart piece: 'lip:' kinds).
// ?lipslog=1 logs which frames lip-sync (for checking coverage).
const LIPS_LOG = new URLSearchParams(location.search).get('lipslog') === '1';
const lipsLive = () => STYLE.card;

// ---------- letters → chart shapes ----------
const LIP_SET = ['rest', 'm', 'e', 'a', 'aa', 'o', 'u', 'ee', 'fv'];
const lipVowel = s => s === 'a' || s === 'aa' || s === 'o' || s === 'u' || s === 'ee';
// words the rules below would get wrong (spelling isn't sound), as sung
const LIP_WORDS = {
  a: ['a'], i: ['a', 'ee'], "i'm": ['a', 'ee', 'm'], "i've": ['a', 'ee', 'fv'], "i'll": ['a', 'ee', 'e'], "i'd": ['a', 'ee', 'e'],
  my: ['m', 'a', 'ee'], by: ['m', 'a', 'ee'], why: ['u', 'a', 'ee'], eye: ['a', 'ee'], buy: ['m', 'a', 'ee'],
  you: ['ee', 'u'], "you're": ['ee', 'u', 'e'], "you'll": ['ee', 'u', 'e'], "you've": ['ee', 'u', 'fv'], your: ['ee', 'o'], yours: ['ee', 'o', 'e'],
  to: ['e', 'u'], do: ['e', 'u'], who: ['e', 'u'], two: ['e', 'u'], too: ['e', 'u'], through: ['e', 'u'], new: ['e', 'u'], knew: ['e', 'u'],
  the: ['e', 'a'], of: ['a', 'fv'], oh: ['o'], ooh: ['u'], ugh: ['a', 'e'], whoah: ['u', 'o'], wow: ['u', 'a', 'u'],
  what: ['u', 'a', 'e'], one: ['u', 'a', 'e'], once: ['u', 'a', 'e'], was: ['u', 'a', 'e'], were: ['u', 'e'], does: ['e', 'a', 'e'], done: ['e', 'a', 'e'],
  are: ['a'], our: ['a', 'u'], hour: ['a', 'u'], hours: ['a', 'u', 'e'], eight: ['ee', 'e'], ai: ['ee', 'a', 'ee'],
  no: ['e', 'o'], so: ['e', 'o'], go: ['e', 'o'], though: ['e', 'o'], know: ['e', 'o'], own: ['o', 'e'],
  there: ['e', 'ee'], where: ['u', 'ee'], they: ['e', 'ee'], their: ['e', 'ee'], be: ['m', 'ee'], me: ['m', 'ee'], we: ['u', 'ee'], he: ['e', 'ee'], she: ['e', 'ee'],
  would: ['u', 'e'], could: ['e', 'u', 'e'], should: ['e', 'u', 'e'], good: ['e', 'u', 'e'], put: ['m', 'u', 'e'], full: ['fv', 'u', 'e'], fully: ['fv', 'u', 'e', 'ee'],
  machines: ['m', 'a', 'e', 'ee', 'e'], machine: ['m', 'a', 'e', 'ee', 'e'], people: ['m', 'ee', 'm', 'e'], says: ['e', 'a', 'e'], said: ['e', 'a', 'e'],
  friday: ['fv', 'e', 'a', 'ee', 'e', 'ee'], monday: ['m', 'a', 'e', 'e', 'ee'], china: ['e', 'a', 'ee', 'e', 'a'], future: ['fv', 'u', 'e', 'a'],
  claude: ['e', 'e', 'o', 'e'], elon: ['ee', 'e', 'o', 'e'], oracle: ['o', 'e', 'a', 'e', 'e'], exhaust: ['ee', 'e', 'o', 'e'], life: ['e', 'a', 'ee', 'fv'],
  time: ['e', 'a', 'ee', 'm'], kind: ['e', 'a', 'ee', 'e'], mind: ['m', 'a', 'ee', 'e'], quite: ['e', 'u', 'a', 'ee', 'e'], nine: ['e', 'a', 'ee', 'e'], five: ['fv', 'a', 'ee', 'fv'],
  "o'clock": ['o', 'e', 'o', 'e'], "doesn't": ['e', 'a', 'e', 'e'], "don't": ['e', 'o', 'e'], "won't": ['u', 'o', 'e'], "can't": ['e', 'a', 'e'], "it's": ['a', 'e'],
  "that's": ['e', 'a', 'e'], "we're": ['u', 'ee', 'e'], "here's": ['e', 'ee', 'e'], "where's": ['u', 'ee', 'e'], "let's": ['e', 'ee', 'e'], "what's": ['u', 'a', 'e'],
  "we've": ['u', 'ee', 'fv'], "they're": ['e', 'ee'], "isn't": ['a', 'e', 'e'], "didn't": ['e', 'a', 'e', 'e'], "there's": ['e', 'ee', 'e'],
};
// a letter said by its name (A-G-I, G-P)
const LIP_LETTER = { a: ['ee'], b: ['m', 'ee'], c: ['e', 'ee'], d: ['e', 'ee'], e: ['ee'], f: ['ee', 'fv'], g: ['e', 'ee'], h: ['ee', 'e'], i: ['a', 'ee'],
  j: ['e', 'ee'], k: ['e', 'ee'], l: ['ee', 'e'], m: ['ee', 'm'], n: ['ee', 'e'], o: ['o'], p: ['m', 'ee'], q: ['e', 'u'], r: ['a'], s: ['ee', 'e'], t: ['e', 'ee'],
  u: ['ee', 'u'], v: ['fv', 'ee'], w: ['e', 'a', 'u'], x: ['ee', 'e'], y: ['u', 'a', 'ee'], z: ['e', 'ee'] };
// A word's chart shapes, in order, from its spelling: vowel sounds (digraphs first: oo → u, ee / ea → ee, ow / ou → o,
// igh → a ee), a silent final e lengthening the vowel before it (time, save), and consonants by where the lips are
// (m b p pressed; f v the lip under the teeth; w and qu pursed; the rest a slightly open e). Runs of consonants that
// look the same are one shape; every sung word opens somewhere.
function lipPhones(tok) {
  let w = String(tok).toLowerCase().replace(/[’`]/g, "'").replace(/[^a-z']/g, '').replace(/^'+|'+$/g, '');
  if (!w) return [];
  if (LIP_WORDS[w]) return LIP_WORDS[w].slice();
  const base = w.replace(/'s$/, ''); if (base !== w && LIP_WORDS[base]) return LIP_WORDS[base].concat(['e']);
  w = w.replace(/'(s|d|ll|re|ve|t|m)$/, (_, s) => ({ s: 's', d: 'd', ll: 'l', re: 'r', ve: 'v', t: 't', m: 'm' })[s]).replace(/'/g, '');
  let long = -1;   // (a_e, i_e, o_e, u_e: the e is silent and the vowel is long)
  const ms = w.length > 3 && w.match(/([aeiou])([^aeiouyw])(e|es)$/);
  if (ms && !/[aeiou]{2}[^aeiou]e?s?$/.test(w)) { long = w.length - ms[0].length; w = w.slice(0, w.length - ms[3].length) + (ms[3] === 'es' ? 's' : ''); }
  else if (w.length > 2 && /[^aeiouyl]e$/.test(w)) w = w.slice(0, -1);   // (other final e's are silent too)
  const out = [], put = s => { for (const x of [].concat(s || [])) { if (!lipVowel(x) && out.length && out[out.length - 1] === x) continue; out.push(x); } };
  for (let i = 0; i < w.length;) {
    const r = w.slice(i), c = w[i], prevV = i > 0 && /[aeiouy]/.test(w[i - 1]);
    if (i === long) { put({ a: 'ee', e: 'ee', i: ['a', 'ee'], o: 'o', u: 'u' }[c]); i++; continue; }
    const two = [['igh', ['a', 'ee'], 3], ['oo', 'u', 2], ['ou', 'o', 2], ['ow', 'o', 2], ['aw', 'o', 2], ['au', 'o', 2], ['ee', 'ee', 2], ['ea', 'ee', 2], ['ie', 'ee', 2],
      ['ei', 'ee', 2], ['ey', 'ee', 2], ['ai', 'ee', 2], ['ay', 'ee', 2], ['oa', 'o', 2], ['oe', 'o', 2], ['oi', ['o', 'ee'], 2], ['oy', ['o', 'ee'], 2], ['ue', 'u', 2],
      ['ui', 'u', 2], ['ew', 'u', 2], ['ph', 'fv', 2], ['wh', 'u', 2], ['qu', 'u', 2], ['th', 'e', 2], ['sh', 'e', 2], ['ch', 'e', 2], ['ck', 'e', 2], ['ng', 'e', 2]].find(([p]) => r.startsWith(p));
    if (two) { put(two[1]); i += two[2]; continue; }
    if (/^al[lkt]/.test(r)) { put('o'); i++; continue; }   // all, talk, salt
    if (r.startsWith('gh')) { if (!prevV) put('e'); i += 2; continue; }   // (silent after a vowel)
    if ((r.startsWith('kn') || r.startsWith('wr')) && i === 0) { i++; continue; }
    if (r === 'mb') { put('m'); i += 2; continue; }
    switch (c) {
      case 'a': case 'i': put('a'); break;
      case 'e': put('ee'); break;
      case 'o': put('o'); break;
      case 'u': put(/^u(ll|sh)/.test(r) ? 'u' : 'a'); break;
      case 'y': put(i === 0 ? 'e' : out.some(lipVowel) ? 'ee' : ['a', 'ee']); break;
      case 'm': case 'b': case 'p': put('m'); break;
      case 'f': case 'v': put('fv'); break;
      case 'w': put('u'); break;
      case 'r': if (!prevV) put('e'); break;   // (after a vowel an r only colours it)
      case 'h': if (i === 0) put('e'); break;
      default: put('e');
    }
    i++;
  }
  if (!out.some(lipVowel)) out.push('a');
  return out;
}
// A sung token (maybe hyphenated: "eight-oh-fucking-three", or spelled out: "A-G-I") → [[shape, share], ...]: each
// part's shapes, a part's share of the word's time by its length.
function lipToken(tok) {
  const parts = String(tok).split('-').filter(p => /[a-z]/i.test(p)), spelled = parts.length > 1 && parts.every(p => p.replace(/[^a-z]/gi, '').length === 1);
  const out = [];
  for (const p of parts) { const ph = spelled ? LIP_LETTER[p.replace(/[^a-z]/gi, '').toLowerCase()] || ['a'] : lipPhones(p), n = Math.max(1, ph.length); for (const s of ph) out.push([s, 1 / n / parts.length]); }
  return out;
}
// A word's shapes laid out over its time [a, b]: consonants quick (≤ 70 ms), the vowels share the rest; on a long word the
// last vowel holds the note, and an A held past a third of a second opens wide (aa) after its start.
function lipWordTimes(tok, a, b) {
  const ph = lipToken(tok).map(p => p[0]); if (!ph.length) return [];
  const d = Math.max(.02, b - a), nV = ph.filter(lipVowel).length, nC = ph.length - nV;
  const cd = nV ? Math.min(.065, d * .35 / Math.max(1, nC)) : d / ph.length, rem = d - cd * nC;
  const lastV = ph.map(lipVowel).lastIndexOf(true), vd = nV > 1 && rem / nV > .12 ? .12 : rem / Math.max(1, nV), vLast = rem - vd * (nV - 1);
  const out = []; let t = a;
  ph.forEach((s, i) => {
    const dt = !lipVowel(s) ? cd : i === lastV ? vLast : vd;
    if (s === 'a' && dt > .32) { out.push([t, t + .14, 'a']); out.push([t + .14, t + dt, 'aa']); }
    else out.push([t, t + dt, s]);
    t += dt;
  });
  return out;
}

// ---------- the twos: a dynamic programme ----------
// How alike two shapes look (open, round, wide, pressed, the lip bitten), and how much it matters to get each right.
const LIP_F = { rest: [0, 0, .3, 0, 0], m: [0, 0, .3, 1, 0], e: [.15, 0, .5, 0, 0], a: [.65, 0, .2, 0, 0], aa: [1, 0, 0, 0, 0], o: [.6, 1, 0, 0, 0], u: [.28, 1, 0, 0, 0], ee: [.3, 0, 1, 0, 0], fv: [.08, 0, .3, 0, 1] };
const LIP_W = { rest: .5, m: 1.3, e: .55, a: 1, aa: 1, o: 1.05, u: 1.05, ee: .95, fv: 1 };
const lipCost = (tg, s) => { if (tg === s) return 0; const A = LIP_F[tg], B = LIP_F[s]; return LIP_W[tg] * (2 * Math.abs(A[0] - B[0]) + 1.2 * Math.abs(A[1] - B[1]) + .6 * Math.abs(A[2] - B[2]) + 1.5 * Math.abs(A[3] - B[3]) + 1.2 * Math.abs(A[4] - B[4])); };
// targets (a shape per step) and weights → the shapes shown: runs of two steps at least, starting from and ending on a
// held rest, the least total cost (plus a little per swap, so near ties don't flicker).
function lipSolve(tg, wt) {
  const N = tg.length, S = LIP_SET.length, INF = 1e18, C = [], B = [], SW = .18;
  for (let n = 0; n < N; n++) { C.push(new Float64Array(S * 2).fill(INF)); B.push(new Int32Array(S * 2).fill(-1)); }
  for (let s = 0; s < S; s++) C[0][s * 2 + (s === 0 ? 1 : 0)] = lipCost(tg[0], LIP_SET[s]) * wt[0] + (s ? SW : 0);
  for (let n = 1; n < N; n++) for (let s = 0; s < S; s++) {
    const c = lipCost(tg[n], LIP_SET[s]) * wt[n], a0 = C[n - 1][s * 2], a1 = C[n - 1][s * 2 + 1];
    C[n][s * 2 + 1] = Math.min(a0, a1) + c; B[n][s * 2 + 1] = a0 <= a1 ? s * 2 : s * 2 + 1;   // held: a run of 1 becomes 2+
    for (let p = 0; p < S; p++) if (p !== s) { const v = C[n - 1][p * 2 + 1] + c + SW; if (v < C[n][s * 2]) { C[n][s * 2] = v; B[n][s * 2] = p * 2 + 1; } }   // swapped in (from a run of 2+)
  }
  let bi = 1, best = C[N - 1][1]; for (let s = 1; s < S; s++) if (C[N - 1][s * 2 + 1] < best) { best = C[N - 1][s * 2 + 1]; bi = s * 2 + 1; }
  if (C[N - 1][0] < best) bi = 0;   // (a rest swapped in on the last step carries on as the rest after)
  const out = new Array(N); for (let n = N - 1; n >= 0; n--) { out[n] = LIP_SET[bi >> 1]; bi = B[n][bi]; }
  return out;
}
// A voice's lip-sync track: its sung words grouped into phrases (gaps under .6 s), each phrase's steps solved once
// (cached: a pure function of the lyric). Shapes lead the sound by LIP_LEAD (the eye reads a mouth a frame early).
const LIP_STEP = 1 / 12, LIP_LEAD = .045, LIP_TRACKS = {};
function lipTrack(voice) {
  if (LIP_TRACKS[voice]) return LIP_TRACKS[voice];
  return LIP_TRACKS[voice] = lipSegs((l, i) => { if (l.backing) return false; const v = l.wordVoice ? l.wordVoice[i] : l.singer === 'FM' ? 'FM' : (l.voice || l.singer); return !!v && v.includes(voice); });
}
// A part: the lip-sync of just the words a character speaks on screen, not all of a voice's (the voice narrating off
// screen while someone else on screen says the quoted line, or only an aside). pick(line, i) → true for each word it
// speaks; backing lines count. Give it to person() as o.sing. Cached by name.
function lipPart(name, pick) {
  const key = 'part ' + name;
  return { name, get segs() { return LIP_TRACKS[key] || (LIP_TRACKS[key] = lipSegs(pick)); } };
}
function lipSegs(pick) {
  const words = [];
  if (typeof LYRICS !== 'undefined') for (const l of LYRICS.lines) {
    const toks = l.text.split(/\s+/).filter(Boolean);
    l.words.forEach(([a, b], i) => { if (pick(l, i)) words.push({ a, b, tok: toks[i] || '' }); });
  }
  words.sort((p, q) => p.a - q.a);
  const segs = [];
  for (let i = 0; i < words.length;) {
    let j = i; while (j + 1 < words.length && words[j + 1].a - words[j].b < .6) j++;
    const W = words.slice(i, j + 1), timed = W.flatMap(w => lipWordTimes(w.tok, w.a, w.b));
    const n0 = Math.floor((W[0].a - LIP_LEAD) / LIP_STEP) - 2, n1 = Math.ceil((W[W.length - 1].b - LIP_LEAD) / LIP_STEP) + 2, tg = [], wt = [];
    for (let n = n0; n < n1; n++) {
      // each step shows what it overlaps most (by how much each shape matters), so a word shorter than a step still counts
      const s0 = n * LIP_STEP + LIP_LEAD, s1 = s0 + LIP_STEP, got = {}; let cov = 0;
      for (const [a, b, s] of timed) { const ov = Math.min(b, s1) - Math.max(a, s0); if (ov > 0) { got[s] = (got[s] || 0) + ov * LIP_W[s]; cov += ov; } }
      const best = Object.keys(got).sort((p, q) => got[q] - got[p])[0];
      if (best && cov > LIP_STEP * .25) { tg.push(best); wt.push(Math.min(1, .4 + cov / LIP_STEP)); continue; }
      // between words: the mouth closes on a real gap, and hardly cares on a short one
      const tc = (s0 + s1) / 2; let gap = Infinity; for (const [a, b] of timed) { if (b <= tc) gap = Math.min(gap, tc - b); if (a > tc) gap = Math.min(gap, a - tc); }
      tg.push(best || 'rest'); wt.push(best ? .5 : gap > .12 ? 1 : .3);
    }
    segs.push({ n0, n1, shapes: lipSolve(tg, wt) });
    i = j + 1;
  }
  return segs;
}
// The chart shape a voice's (or a part's, lipPart) mouth shows at time t (on its step), or null while it isn't singing.
function lipAt(t, voice) {
  if (!voice) return null;
  const segs = typeof voice === 'string' ? lipTrack(voice) : voice.segs, n = Math.floor(t / LIP_STEP + 1e-6);
  let lo = 0, hi = segs.length - 1;
  while (lo <= hi) { const m = (lo + hi) >> 1, s = segs[m]; if (n < s.n0) hi = m - 1; else if (n >= s.n1) lo = m + 1; else return s.shapes[n - s.n0]; }
  return null;
}
// A singer's mouth at t: the chart piece for the sung shape, in the mood of the shot's mouth (base: a mouthH kind), or
// base itself while the voice is silent or the base is acting that must win (a laugh).
const LIP_MOOD = { smile: 'smile', grin: 'smile', laugh: 'smile', cat: 'smile', tongue: 'smile', frown: 'frown', wobble: 'frown', pout: 'frown' };
function singMouth(t, voice, base) {
  if (!lipsLive() || base === 'laugh') return base;
  let s = lipAt(t, voice); if (!s) return base;
  // through gritted teeth (an angry or straining face): clenched between the vowels, the vowels opening, M still pressed
  if (base === 'grimace' || base === 'teeth') return s === 'rest' || s === 'e' ? 'grimace' : 'lip:' + s;
  const md = LIP_MOOD[base];
  if ((base === 'shout' || base === 'wail' || base === 'O') && s === 'a') s = 'aa';
  if (s === 'rest' && !md && (base === 'smirk' || base === 'wobble')) return base;
  if (LIPS_LOG) console.warn(`LIPSYNC ${T.toFixed(3)} ${voice.name || voice} ${base} ${s}`);   // (?lipslog=1: which frames lip-sync, for checking coverage)
  return 'lip:' + s + (md ? ':' + md : '');
}

// ---------- the chart's geometry ----------
// A mouth kind (a chart name, 'lip:<shape>[:<mood>]', or a mouthH kind) → its piece, in mouth widths w (W = w / 2 the
// half-width); y down from the lip line:
//   id (its name on the chart, and its cut) · cw the corners' half-width (× W) · cl [left, right] the corners' lift (× w,
//   - = up) · top / bot the opening's top and bottom at the centre (× w; 0 / 0 = closed) · pw how square its bottom is ·
//   round (o, u: an oval) · tu / tl the upper / lower teeth's depth · tg the tongue · ll the lower lip's depth · line
//   (closed pieces: the parting line's points and weight) · drop (× w: how far below the lip line the lower lip reaches).
const LIP_BASE = {
  rest: { cw: 1, top: 0, bot: 0, ll: .19 }, m: { cw: .88, top: 0, bot: 0, ll: .12, press: 1 },
  e: { cw: .94, top: -.025, bot: .075, pw: .5, tu: .045, ll: .17 }, a: { cw: .8, top: -.045, bot: .3, pw: .72, tu: .06, tg: .5, ll: .15 },
  aa: { cw: .76, top: -.065, bot: .52, pw: .78, tu: .065, tg: .5, ll: .14 }, o: { cw: .5, top: -.07, bot: .31, round: 1, tg: .3, ll: .17 },
  u: { cw: .3, top: -.04, bot: .13, round: 1, ll: .19 }, ee: { cw: 1.06, top: -.03, bot: .13, pw: .42, tu: .065, tl: .04, ll: .13 },
  fv: { cw: .92, top: -.03, bot: .045, pw: .5, tu: .07, ll: .15, bite: 1 },
  grin: { cw: 1.02, top: -.05, bot: .28, pw: .7, tu: .115, ll: .12 }, shout: { cw: .82, top: -.1, bot: .7, pw: .8, tu: .07, tg: .45, ll: .12 }, grimace: { cw: 1.08, top: -.12, bot: .23, pw: .35, tu: .1, tl: .1, ll: .1, clench: 1 },
  smirk: { cw: 1, top: 0, bot: 0, ll: .17 }, wobble: { cw: 1, top: 0, bot: 0, ll: .17 },
};
const LIP_OF = { flat: 'rest', smile: 'rest:smile', frown: 'rest:frown', open: 'a', O: 'shout', wail: 'shout', yawn: 'aa', o: 'o', sigh: 'u', cat: 'rest:smile',
  pout: 'rest:frown', teeth: 'grimace', tongue: 'rest:smile' };
const LIP_GEO = {};
function lipGeo(kind) {
  let k = String(kind || 'flat');
  if (k === 'laugh') k = Math.floor((typeof T === 'number' ? T : 0) * 6 + 1e-6) % 2 ? 'a:smile' : 'aa:smile';   // ha, ha: two pieces on twos
  if (k.startsWith('lip:')) k = k.slice(4); else k = LIP_OF[k] || k;
  if (LIP_GEO[k]) return LIP_GEO[k];
  const [sh, md] = k.split(':'), b = LIP_BASE[sh] || LIP_BASE.rest, g = { id: k, shape: LIP_BASE[sh] ? sh : 'rest', mood: md || '', ...b };
  const up = md === 'smile' ? -1 : md === 'frown' ? 1 : 0;
  g.cl = sh === 'smirk' ? [.03, -.12] : sh === 'grin' ? [-.07, -.07] : sh === 'grimace' ? [.07, .07] : [up * (g.round ? .015 : .075), up * (g.round ? .015 : .075)];
  g.closed = !(g.bot > 0);
  // the closed pieces' parting line (as the old drawn mouths had it: a brush stroke, full in the middle, fine at the corners)
  if (g.closed) g.line = sh === 'm' ? { P: [[-.9, .008], [-.4, .014], [0, .015], [.4, .014], [.9, .008]], wt: .7 }
    : sh === 'smirk' ? { P: [[-.8, .04], [0, .045], [.55, .005], [.95, -.12]], wt: 1.1 }
    : sh === 'wobble' ? { P: [[-1, 0], [-.5, -.05], [0, .02], [.5, -.05], [1, 0]], wt: 1 }
    : up < 0 ? { P: [[-1, -.07], [-.55, .045], [0, .07], [.55, .045], [1, -.07]], wt: 1.1 }
    : up > 0 ? { P: [[-.9, .1], [-.45, -.015], [0, -.035], [.45, -.015], [.9, .1]], wt: 1.1 }
    : { P: [[-.75, .005], [0, .02], [.75, .005]], wt: .85 };
  const lineY = x => { const P = g.line.P; if (x <= P[0][0]) return P[0][1]; for (let i = 1; i < P.length; i++) if (x <= P[i][0]) return lerp(P[i - 1][1], P[i][1], (x - P[i - 1][0]) / (P[i][0] - P[i - 1][0])); return P[P.length - 1][1]; };
  // the opening's top and bottom edges at x (× W, -cw..cw) in w; closed: both on the line
  const clAt = x => lerp(g.cl[0], g.cl[1], clamp((x / g.cw + 1) / 2));
  if (g.closed) { g.topAt = lineY; g.botAt = lineY; }
  else if (g.round) { const cy = (g.top + g.bot) / 2, ry = (g.bot - g.top) / 2; g.topAt = x => cy - ry * Math.sqrt(Math.max(0, 1 - (x / g.cw) ** 2)); g.botAt = x => cy + ry * Math.sqrt(Math.max(0, 1 - (x / g.cw) ** 2)); }
  else { g.topAt = x => { const u = x / g.cw; return clAt(x) * u * u + g.top * Math.pow(Math.max(0, 1 - u * u), .5); }; g.botAt = x => { const u = x / g.cw; return clAt(x) * u * u + g.bot * Math.pow(Math.max(0, 1 - u * u), g.pw ?? .7); }; }
  g.lift = Math.max(0, -Math.min(g.topAt(0), g.topAt(g.cw * .5)));   // how far the upper lip rises (w)
  g.drop = (g.closed ? Math.max(lineY(0), .03) : g.bot) + g.ll * .9;   // the lower lip's bottom (w)
  return LIP_GEO[k] = g;
}

// How far below the lip line a mouth's lower lip reaches (mouth widths): the chart's pieces where they're drawn, or the
// old drawn mouths' (open .42, shout .75...) in the other looks. A rig drops the jaw by the difference from 'flat'.
const LIP_OLD_DROP = { open: .42, shout: .75, O: .75, wail: .75, yawn: .42, o: .22, sigh: .22, grin: .3, laugh: .5, grimace: .245, teeth: .245 };
function lipDrop(kind) {
  const k = String(kind || 'flat');
  return k.startsWith('lip:') || lipsLive() ? lipGeo(k).drop : (LIP_OLD_DROP[k] ?? .02) + .08;
}

// ---------- drawing a chart piece ----------
// lipPiece(x, y, w, kind, o): the mouth centred on its lip line at (x, y), w wide. o: sw, lip / lipLt (lip colours),
// lips (0..1: the lower lip's size; 0 = only a fine line under the mouth), far (3/4: the far half, +x, foreshortened),
// key (the character: each piece's cut is key + its chart id), tache ({ col, lt, h, w }: a moustache h px deep over the
// upper lip, w its half-width, drawn with the piece).
function lipPiece(x, y, w, kind, o = {}) {
  const g = lipGeo(kind), sw = o.sw ?? 1.4, far = clamp(o.far ?? 1, .2, 1), K = (o.key || 'm' + Math.round(x)) + '|' + g.id;
  const W = w / 2, F = P => P.map(([a, b]) => [a > 0 ? a * far : a, b]), pt = (xx, yy) => [xx * W, yy * w];
  const dark = '#3A1418', lipLt = o.lipLt || '#6E4232', lip = o.lip || mixCol(lipLt, NOIR.ink, .25), lipsK = o.lips ?? 0;
  const seed = s => boilSeed('lip ' + K + s);
  const pc = (P, col, s, op = {}) => { seed(s); piece(F(P), col, { ink: null, key: K + s, lift: 0, flatCard: true, fine: true, ...op }); };
  const run = (f, a, b, n = 16) => { const out = []; for (let i = 0; i <= n; i++) { const xx = lerp(a, b, i / n); out.push(pt(xx, f(xx))); } return out; };
  const hole = !g.closed;
  push(); translate(x, y);
  // the lower lip: a crescent under the opening (or under the line), deepest in the middle (under a moustache, a touch
  // lighter on an open mouth: it's what separates the dark opening from the dark hair above)
  const lipSpan = (hole ? g.cw * (g.round ? 1.05 : .86) : .72) * (g.press ? 1.1 : 1), llD = g.ll * (lipsK > 0 ? lipsK : 0);
  if (llD > .01) {
    const top = xx => g.botAt(xx) + (hole ? -.03 : .025), bot = xx => top(xx) + llD * Math.pow(Math.max(0, 1 - (xx / lipSpan) ** 2), .55) + .015;
    pc(curvy(run(top, -lipSpan, lipSpan, 10).concat(run(bot, lipSpan, -lipSpan, 10)), 4), g.press ? mixCol(lip, NOIR.ink, .12) : o.tache && hole ? mixCol(lip, lipLt, .6) : lip, 'll');
    seed('llh'); dline(F(run(xx => top(xx) + llD * .45, -lipSpan * .45, lipSpan * .35, 6)), sw * .5, mixCol(lip, '#FFFFFF', .22), .5);   // its highlight
  } else if (!hole) { seed('llf'); dline(F(run(xx => g.botAt(xx) + .16, -.34, .34, 4)), sw * .6, lipLt, .5); }   // (no lip: a fine line under the mouth)
  // the upper lip, where it shows (no moustache over it): a thin rim over an open mouth, with a dip at the bow (round
  // shapes pushed out: thicker); and on M, the lips pressed together, a band above the line as below it
  const ulD = (g.round ? .075 : g.press ? .06 : .05) * lipsK;
  if (!o.tache && ulD > .01 && (hole || g.press)) {
    const a = hole ? g.cw * (g.round ? 1.06 : .99) : lipSpan, bow = xx => Math.exp(-((xx / (a * .16)) ** 2)) * ulD * .4;
    pc(curvy(run(xx => g.topAt(xx) - ulD * Math.pow(Math.max(0, 1 - (xx / a) ** 2), .45) + bow(xx), -a, a, 12).concat(run(xx => g.topAt(xx) + (hole ? .03 : -.005), a, -a, 12)), 4), mixCol(lip, NOIR.ink, .15), 'ul');
  }
  if (hole) {
    // the opening, the teeth hanging from its top (and standing on its bottom), the tongue lying in it
    const E = run(g.topAt, -g.cw, g.cw, 22).concat(run(g.botAt, g.cw, -g.cw, 22).slice(1, -1)), Wc = F(E);
    pc(curvy(E, 3), dark, 'o', { ink: NOIR.ink, sw: sw * .55, lift: 1 });
    const inO = (P, col, s) => { const Q = clipConvex(F(P), Wc); if (Q.length > 2) { seed(s); piece(Q, col, { ink: null, key: K + s, lift: 0, flatCard: true, fine: true, edge: false }); } };
    if (g.tu) { const a = g.cw * .98; inO(run(xx => g.topAt(xx) - .02, -a, a, 12).concat(run(xx => g.topAt(xx) + (g.bite ? g.bot - g.topAt(0) - .012 : g.tu) * Math.pow(Math.max(0, 1 - (xx / a) ** 2), .25), a, -a, 12)), '#F4EEE4', 'tu'); }
    if (g.tl) { const a = g.cw * .9; inO(run(xx => g.botAt(xx) - g.tl * Math.pow(Math.max(0, 1 - (xx / a) ** 2), .3), -a, a, 12).concat(run(xx => g.botAt(xx) + .02, a, -a, 12)), '#F4EEE4', 'tl'); }
    if (g.tg) { const h = g.bot - g.top, cy = g.bot - h * .12; inO(oval(0, cy * w, g.cw * W * g.tg * 1.25, h * w * .36, 0, 20), '#C4566A', 'tg'); }
    if (g.clench) { seed('cl'); dline(F(run(xx => (g.topAt(xx) + g.botAt(xx)) / 2, -g.cw * .9, g.cw * .9, 10)), sw * .5, NOIR.ink, .3); for (const tx of [-.6, -.3, 0, .3, .6]) dline(F([pt(tx * g.cw, g.topAt(tx * g.cw) + .02), pt(tx * g.cw * 1.02, g.botAt(tx * g.cw) - .02)]), sw * .35, '#9A8E86', 0); }
    else if (g.tu && g.tu > .09) for (const tx of [-.3, 0, .3]) { seed('tt' + tx); dline(F([pt(tx * g.cw, g.topAt(tx * g.cw) + .01), pt(tx * g.cw, g.topAt(tx * g.cw) + g.tu * .8)]), sw * .3, '#B9AEA6', 0); }
  } else {
    // the parting line
    const L = g.line, P = L.P.map(([a, b]) => pt(a, b)), wt = sw * L.wt;
    seed('ln'); faceStroke(F(P), t => wt * 2.7 * (.32 + .68 * Math.pow(Math.sin(Math.PI * t), .7)), wt, K + 'ln');
    if (g.press) for (const s of [-1, 1]) { seed('pr' + s); dline(F([pt(s * .93, -.03), pt(s * 1.0, .015), pt(s * .94, .06)]), sw * .45, NOIR.ink, .5); }
    if (g.shape === 'smirk') { seed('sk'); dline(F([pt(.88, -.19), pt(1.02, -.12), pt(.98, -.05)]), sw * .5, NOIR.ink, .5); }
  }
  if (o.tache) lipTache(0, 0, w, g, { ...o.tache, far, sw, key: K });
  pop();
}
// The moustache for a mouth (g: its lipGeo), on the lip line at (x, y): its lower edge IS the upper lip, following the
// opening's top between the corners (and lifting with it) and falling past the corners to the tips; its upper edge an
// arch tucked under the nose (with a notch under the septum). o: col, lt (hair lines), h (depth at the centre, px),
// w (its half-width, px), far, sw, key. Drawn over the mouth, so the opening never shows through it; the nose goes over
// its top.
function lipTache(x, y, w, g, o = {}) {
  const W = w / 2, far = clamp(o.far ?? 1, .2, 1), sw = o.sw ?? 1.4, h = o.h ?? w * .2, TW = o.w ?? W * 1.12, lift = g.lift * w;
  const F = P => P.map(([a, b]) => [x + (a > 0 ? a * far : a), y + b]);
  const cwX = Math.min(W * .96, TW * .9), ov = w * .025;   // (the lower edge overlaps the opening a hair: no gap)
  const lineAt = xx => lerp(g.cl[0], g.cl[1], clamp((xx / W + 1) / 2)) * w * Math.min(1, (xx / W) ** 2);   // the lip line as it rests, bent by the mood
  // the lower edge between the corners: the lip line, pushed up wherever the opening's top rises above it (an open
  // mouth lifts the whole lip; an O only its middle, so the O shows whole below it)
  const edge = xx => Math.abs(xx) <= g.cw * W ? Math.min(g.topAt(xx / W) * w, lineAt(xx)) : lineAt(xx);
  const low = [], n = 16;
  // left tip → left corner → along the lip → right corner → right tip (the tips just past the corners, a little below
  // the lip line, following the mood)
  const tip = s => [s * TW, Math.max(edge(s * cwX), 0) + h * .16 + (g.cl[s < 0 ? 0 : 1] * w) * 1.1];
  for (let i = 0; i <= 4; i++) { const k = i / 4, tp = tip(-1); low.push([lerp(tp[0], -cwX, k), lerp(tp[1], edge(-cwX) + ov, Math.pow(k, .7))]); }
  for (let i = 1; i < n; i++) { const xx = lerp(-cwX, cwX, i / n); low.push([xx, edge(xx) + ov]); }
  for (let i = 0; i <= 4; i++) { const k = i / 4, tp = tip(1); low.push([lerp(cwX, tp[0], k), lerp(edge(cwX) + ov, tp[1], Math.pow(k, 1.4))]); }
  // the upper edge, right → left: a band over the lip line as it rests, thickest at the centre (up under the nose, with
  // a notch under the septum) and tapering to the tips; it rides up with the lip (a little less than the lip itself)
  const up = [], m = 18, rise = lift * .75;
  const rest = xx => { const a = Math.abs(xx); if (a <= W) return lineAt(xx); const tp = tip(Math.sign(xx) || 1); return lerp(lineAt(Math.sign(xx) * W), tp[1], Math.pow((a - W) / Math.max(1, TW - W), 1.3)); };
  for (let i = 0; i <= m; i++) { const u = 1 - 2 * i / m, xx = u * TW * .985, notch = Math.exp(-((u / .1) ** 2)) * h * .08;
    up.push([xx, rest(xx) - h * .8 * Math.pow(Math.max(0, 1 - u * u), 1.05) * (1 - .25 * u * u) - rise * (1 - u * u) + notch]); }
  const P = low.concat(up);
  boilSeed('tache ' + o.key);
  piece(F(curvy(P, 3)), o.col || '#1E1616', { ink: null, key: (o.key || 'tache') + 'tc', lift: 1, flatCard: true, fine: true });   // (hair: no maxTone, which the print looks read as skin)
  if (o.lt) for (let i = 0; i < 6; i++) {   // a few hairs, combed out from the centre
    const s = i < 3 ? -1 : 1, j = i % 3, x0 = s * (.14 + j * .26) * TW, y0 = -rise - h * (.55 - j * .12);
    boilSeed('tache ' + o.key + 'h' + i); dline(F([[x0, y0], [x0 + s * .14 * TW, y0 + h * .42]]), sw * .4, o.lt, .3);
  }
}

// A laugh's jaw, for the rigs that drop their own (Musk, the bosses): in card two held pieces, ha and HA, swapped on
// twos in step with the laugh's mouths (lipGeo); elsewhere the old bounce. lo / hi: the jaw's range.
function lipLaugh(tm, lo, hi) { return lipsLive() && STYLE.card ? (Math.floor(tm * 6 + 1e-6) % 2 ? lo : hi) : lo + (hi - lo) * Math.abs(Math.sin(tm * TAU * 2.5)); }

// ---------- the eye chart ----------
// eyeH's settings snapped to the chart (card): the lid in tenths (shut below .15: the blink piece), the lower lid and
// the slant in tenths, the size and the iris in twentieths, the look to five places across and three up and down.
function cardEye(o) {
  if (!lipsLive()) return o;
  const q = (v, s) => Math.round(v / s) * s, r = { ...o };
  if (o.open != null) r.open = q(clamp(o.open), .1);
  if ((!r.style || r.style === 'open') && r.open != null && r.open < .15) r.style = 'shut';
  if (o.lower != null) r.lower = q(o.lower, .1);
  if (o.slant != null) r.slant = q(o.slant, .1);
  if (o.tall != null) r.tall = q(o.tall, .05);
  if (o.iris != null) r.iris = q(o.iris, .05);
  if (o.look) { const ly = o.look[1]; r.look = [q(clamp(o.look[0], -1, 1), .5), Math.abs(ly) < .35 ? 0 : Math.sign(ly) * .85]; }
  return r;
}

// sets/copies.js: COPIES, the turbine street (verse 2, his) rebuilt in the bad future's medium, a photocopy.
//   "Elon's cloud has a tailpipe. Hear the gas turbines roar. / No proper permits; plenty of exhaust next door. /
//    The machines don't need to sleep. The people round them do. / Where's the 'do not disturb' for the racket coming through?"
//
// Two media in one frame. The PEOPLE are photocopied (the xerox look: riso by default, the user's pick; toner or drum
// inks, dot screens, grit, misregistration). The things that shout carry the warm colour: the neighbours' lit windows,
// the turbine fire, the stacks' warning lights (in the one-ink variants they're the spot colour, or paper in mono).
// The POWER is printed like money (the bank look): the AI data centre looms over the terrace as a banknote
// vignette, a windowless temple of a building (the Bank of England's blind wall) with a guilloche rosette for the
// cooling fan in its pediment, a guilloche sun rising behind it, and a parapet of gas-turbine stacks whose exhaust is
// engraved in the note's ink (teal here). The photocopied street is pasted in front of it, like a DIY rave flyer.
//
// His terraced house at night. He's at his bedroom window in pyjamas, hugging his pillow, awake, bags under his eyes. On
// the rumble his eyes go to the plant; the turbines ROAR on the beat: the stacks spit fire and smoke, and the photocopied
// layer shakes (the engraving never moves). He takes, then clamps the pillow over his ears; one by one the neighbours'
// windows light up with someone at the glass. He ends staring at us, dead-eyed, while it goes on.
// GENERATION LOSS: every roar is one more copy of a copy. The blacks crush, the dots coarsen, grit and dirt pile up, the
// paper greys and the photocopied layer lands a little crooked on the glass (XEROX is set per frame, then restored).
// In: blank copy paper; the copier's light bar sweeps across and the copy appears behind it, overexposed at first.
// Out: the last roar's exhaust rolls in from the plant and prints the whole frame black with toner.
//
// LOOPS.copies: 16 beats at 136.7 bpm (7.02 s), loop time. The beat clock is the song's tempo (CP.bpm), not the page's
// PROJECT.bpm: cpBp(t) is this scene's bpOf. The photocopy is riso; the plant is printed in the house note's teal.
// Everything is a pure function of t. Geometry of the street (stL, stR, stQuad, stF, stY,
// stBillowPts, stPlume) comes from sets/street.js; everything drawn here goes through piece() so the looks apply.

const CP = {
  bpm: 136.7,
  him: [560, 962, 40],                       // his ground point (hidden below the sill) and unit
  win: { x0: 350, x1: 770, y0: 352, y1: 725 },   // his window opening
  house: { x0: 170, x1: 960, eaves: 235, ridge: 162 },
  lamp: [1150, 1062, 640],                   // the street lamp: x, foot, head
  plant: { x0: 790, x1: 2440, cor: 24, base: 700, px: 1450 },   // the data centre's facade: cornice top, base, pediment x
  stacks: [[905, 66, -118], [1068, 58, -86], [1832, 58, -86], [1995, 66, -118], [2150, 58, -96]],   // gas-turbine stacks: x, width, top
};
CP.B = 60 / CP.bpm;
const cpAt = b => b * CP.B;
const cpBp = t => t / CP.B;
CP.t = {
  bar: [.1, 1.25],                  // in: the light bar sweeps left to right
  rumble: cpAt(4),                  // beat 4: the stacks cough, the glass rattles
  look: cpAt(4.3),                  // ... and his eyes go to the plant
  roar: cpAt(5),                    // beat 5: the first roar (then one every beat)
  clamp: [cpAt(5.55), cpAt(6)],     // the pillow goes over his ears, landing on the second roar
  lights: [6, 7, 8, 9, 10, 11].map(cpAt),   // neighbours' windows, one a beat
  glare: cpAt(11.6),                // he gives up and stares at us
  last: cpAt(13),                   // the last, biggest roar
  out: [cpAt(13.25), cpAt(15.3)],   // its exhaust rolls in and covers the frame
  len: cpAt(16),
};

// ---------- the roar and the copy generations ----------
// k: this beat's blast (1 on the beat, decaying) · gen: roars so far (= copies of copies) · shake
function cpRoar(t) {
  const b = cpBp(t) + 1e-6, n = Math.floor(b), a = (b - n) * CP.B;
  if (n < 4) return { k: 0, on: false, pre: false, age: a, n, gen: 0, shake: 0 };
  if (n === 4) return { k: .45 * Math.exp(-a * 5), on: false, pre: true, age: a, n, gen: 0, shake: .35 * Math.exp(-a * 9) };
  const m = Math.min(n, 13), age = t - cpAt(m), big = m === 13 ? 1.5 : 1;
  return { k: big * Math.exp(-age * (m === 13 ? 2.2 : 5)), on: true, pre: false, age, n: m, gen: m - 4, shake: big * Math.exp(-age * (m === 13 ? 4 : 9)) };
}
// The look's own settings (as style.js leaves them); each frame starts from them.
const CP_X0 = { ...XEROX }, CP_B0 = { ...BANK };
function cpGeneration(g) {
  const b = CP_X0;
  Object.assign(XEROX, b, {
    crush: b.process && !b.process.some(p => p[0] === 'k') ? b.crush : Math.min(Math.max(b.crush, .42), b.crush + .016 * g),   // mid-tones fall into the black
    white: Math.max(b.crush + .26, b.white - .016 * g),            // ... and the light ones blow out to paper
    cell: b.cell + Math.min(3, .34 * g),                           // the dots coarsen
    grit: b.grit * (1 + .3 * g),
    reg: b.reg ? b.reg + .9 * g : 0,                               // the spot drifts further out of register
    paper: mixCol(b.paper, '#A39F95', .035 * g),                   // the paper greys
    lgen: g,                                                       // the line art wears (risoLine: thicker, frayed, broken, blotched)
  });
}
// Each copy lands a little crooked on the glass: a cumulative nudge, rotation and creep per generation (it jolts in on
// the roar that makes it).
function cpDrift(R) {
  let rot = 0, dx = 0, dy = 0;
  for (let i = 1; i <= R.gen; i++) { const k = i === R.gen ? ease(clamp(R.age / .07)) : 1; rot += (hash(i * 3.1 + .7) - .5) * .008 * k; dx += (hash(i * 5.7) - .5) * 14 * k; dy += (hash(i * 7.3) - .35) * 7 * k; }
  return { rot, dx, dy, sc: 1 + .004 * R.gen };
}

// ---------- small helpers ----------
const cpBox = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
// the variant's spot for things that should shout (null in the one-colour variants: they print by tone)
const cpSpot = () => XEROX.spot && XEROX.spot.length ? XEROX.spot[0] : null;
// The street's night colours. The one-ink variants print them by tone (and the spot), so CPC_1 is chosen for its
// greys (the walls stay dot screens until late in the generations); the process variants (colour, riso) print them as
// mixed dots, so CPC_P is a real night palette: cool dusky brick, navy slate and glass, against the warm things that
// shout (amber lit windows, sodium lamp, orange-red turbine fire) and his sky-blue pyjamas.
const CPC_1 = {
  brick: '#8A6052', brickN: '#6E4E46', brickL: '#7E5A4E', brickR: '#6A4C46', roof: '#262A36', chim: '#3A2C2A', pot: '#8A4A36',
  glass: '#1A2030', lit: '#FFB84A', stone: '#D8D2C4', stoneDk: '#B8B0A2', door: '#2A2230', road: '#1E2228', pave: '#7C7A80',
  paveR: '#6C6A70', blaze: '#E8C890', pool: '#8A7A60', lampPole: '#2A2E36', lamp: '#FFD27A', room: '#161820', frame: '#E6E2D8',
  shadow: '#16181E', sil: '#161616', fire: '#FF6A28', fireCore: '#FFF2C8', warn: '#FF2A2A', smear: '#23242A', exh: '#15161A', exhLit: '#6E6A66',
};
const CPC_P = { ...CPC_1,
  brick: '#6E4852', brickN: '#5A3C48', brickL: '#66444E', brickR: '#583A4A', roof: '#1C2238', chim: '#3A2830', pot: '#B0503A',
  glass: '#18203A', lit: '#FFB43C', stone: '#C8C4D0', stoneDk: '#9A96A8', door: '#2A2040', road: '#161C2E', pave: '#4A5068',
  paveR: '#40465C', blaze: '#F0C070', pool: '#8A6A40', lampPole: '#262C40', lamp: '#FFC848', room: '#141A2C', frame: '#D8D4E0',
  shadow: '#10141E', sil: '#141420', fire: '#FF5A1E', fireCore: '#FFE890', warn: '#FF1E3C', smear: '#1E2236', exh: '#121626', exhLit: '#5A5470',
};
// The riso (three drums: blue, fluoro pink, yellow; no black): each drum gets a job. Blue alone for his pyjamas and the
// pavements, blue + pink (violet) for the night's darks and the neighbours' silhouettes, pink + yellow for the brick and
// the fire, yellow alone for the lit windows and the lamp, so the light glows against the violet night.
const CPC_R = { ...CPC_P,
  brick: '#D06A5C', brickN: '#B85A56', brickL: '#C8645A', brickR: '#B05858', roof: '#2C4A98', chim: '#5A3A6A', pot: '#E8784A',
  glass: '#22367A', lit: '#FFE04A', stone: '#ECE6DA', stoneDk: '#C8C0D4', door: '#3A3072', road: '#1E2C6A', pave: '#86A8D8',
  paveR: '#7896C8', blaze: '#FFE070', pool: '#FFD66A', lampPole: '#2A3474', lamp: '#FFE860', room: '#1A2660', frame: '#F0EAF2',
  shadow: '#1A2254', sil: '#2E1E5A', fire: '#FF5A2A', fireCore: '#FFEA5A', warn: '#FF3A6A', smear: '#1E2A62', exh: '#1A2458', exhLit: '#7A6AA8',
};
// his pyjamas per palette: one-ink (a mid tone, so the white pillow stands off them), colour copier, riso (blue drum only)
const CP_PJ = {
  one:  { coat: '#7FA8D8', coatDk: '#1E2A5A', coatLt: '#B8D4F0', cuff: '#1E2A5A', under: '#7FA8D8', button: '#1E2A5A' },
  cmyk: { coat: '#7FB0E4', coatDk: '#1E2A5A', coatLt: '#B8D4F0', cuff: '#1E2A5A', under: '#7FB0E4', button: '#1E2A5A' },
  riso: { coat: '#62C4F2', coatDk: '#2A2A7A', coatLt: '#B0E2F8', cuff: '#2A2A7A', under: '#62C4F2', button: '#2A2A7A' },
};
const cpNoK = () => !!(XEROX.process && !XEROX.process.some(p => p[0] === 'k'));
const CPC = { ...CPC_1 };   // this frame's palette (set in LOOPS.copies)
// The riso's process print has no black drum, and style.js's processPrint prints the darks it crushes as near-paper
// there (see the report): lift those darks just above the crush line, keeping their hue, so they print as dense
// three-drum darks instead. Wraps piece() for the photocopied drawing only.
function cpXeroxDraw(draw) {
  const sp = piece;
  if (cpNoK()) piece = (P, c, o = {}) => {
    const L = lum(c), thr = XEROX.crush * .6 + .012;
    if (L < thr && !(o.spot)) { const f = thr / Math.max(.02, L), v = parseInt(c.slice(1, 7), 16); c = '#' + [v >> 16 & 255, v >> 8 & 255, v & 255].map(x => Math.min(255, Math.round(Math.max(x, 6) * f)).toString(16).padStart(2, '0')).join(''); }
    return sp(P, c, o);
  };
  try { draw(); } finally { piece = sp; }
}
// The banknote ink the plant is printed in: teal (it reads best against the riso street's coral brick and violet night;
// purple sat too close to the violet), BANK_TEAL, applied per frame.
// The top edge of the photocopied layer (world y at x): his roof, the terraces' roofs, the street's end. Bank pieces
// only need drawing above it (plus a margin for the shake and the drift).
function cpSkyline(x) {
  let y = 690;
  if (x < 962) y = Math.min(y, CP.house.ridge);
  if (x >= 880 && x <= 1372) y = Math.min(y, 600 - 474.8 * (1450 - x) / 560);
  if (x >= 1540) y = Math.min(y, 600 - 474.8 * Math.min(1, (x - 1450) / 770));
  return y;
}
// A box's part above the skyline (+ margin), as one polygon.
function cpAbove(x0, y0, x1, y1, margin = 70) {
  const bot = [];
  for (let x = x1; x >= x0 - .1; x -= 16) bot.push([x, clamp(cpSkyline(x) + margin, y0 + 1, y1)]);
  return [[x0, y0], [x1, y0]].concat(bot);
}

// ======================================================================================================================
// THE BANK LAYER: the data centre as a banknote vignette (look('bank'))
// ======================================================================================================================
function cpSky(t) {
  boilSeed('cp sky');
  const { x0, cor, px } = CP.plant, X0 = -200, X1 = 2200;
  // a banknote's sky: fine horizontal rules, closer together toward the top (only where the street doesn't cover it)
  piece([[X0, -320], [X1, -320], [X1, cor + 4], [x0 + 4, cor + 4], [x0 + 4, 240], [X0, 240]], '#E6E4EA', { ink: null, key: 'cpsky' });
  for (const [ya, yb, d] of [[-320, -200, 4.2], [-200, -90, 5.2], [-90, cor + 4, 6.6]]) waveLines(cpBox(X0, ya, X1, yb), d, 0, .9, 260, BANK.ink, .55);
  waveLines(cpBox(X0, cor + 4, x0 + 4, 240), 8.5, 0, .9, 260, BANK.ink, .5);
}
// A guilloche medallion behind the pediment: the rosette of a banknote, the plant's sun, showing through its own smoke.
function cpMedal(t) {
  const { px } = CP.plant;
  boilSeed('cp medal');
  piece(oval(px, -70, 318, 318, 0, 64), '#F0ECEE', { sw: 1.1, key: 'cpmedal' });
  guilloche(px, -70, 150, 268, { n: 22, lobes: 16, w: .5, twist: .25, beat: 4, steps: 320 });
  guilloche(px, -70, 272, 312, { n: 8, lobes: 44, w: .45, steps: 400 });
}
// The plant's colours come from the note's ink (so ?bank=teal re-inks the whole vignette): f > 0 toward paper, < 0 darker.
const cpInk = f => mixCol(BANK.ink, f > 0 ? '#F4F2F6' : '#000000', Math.abs(f));
function cpPlant(t, R) {
  const { x0, x1, cor, base, px } = CP.plant;
  boilSeed('cp plant');
  // the stacks behind the parapet: tall, dark, banded, a lip at the mouth
  for (const [x, w, top] of CP.stacks) {
    const P = [[x - w / 2, cor], [x - w * .42, top + 22], [x - w * .56, top + 8], [x - w * .56, top], [x + w * .56, top], [x + w * .56, top + 8], [x + w * .42, top + 22], [x + w / 2, cor]];
    piece(P, cpInk(0), { sw: 1.3, key: 'cpstack' + x, shade: cpInk(-.35), depth: w * .3 });
    for (const by of [top + 46, top + 84]) dline([[x - w * .45, by], [x + w * .45, by]], 1.2, BANK.ink);
  }
  // the attic and the cornice, with a guilloche frieze
  piece(cpBox(x0 - 20, cor - 34, x1 + 20, cor - 4), cpInk(.2), { sw: 1.2, key: 'cpattic' });
  piece(cpBox(x0 - 34, cor - 6, x1 + 34, cor + 22), cpInk(.9), { sw: 1.3, key: 'cpcornice' });
  guillocheBand(x0 - 30, x1 + 30, cor + 8, 13, { n: 5, wl: 46, w: .45 });
  // the blind wall: no windows, only engaged columns and louvred vents between them (the machines don't need light)
  piece(cpAbove(x0, cor + 22, x1, base), cpInk(.08), { sw: 1.2, key: 'cpwall' });
  for (let x = x0 + 40; x < x1; x += 104) {
    const yb = clamp(cpSkyline(x) + 70, cor + 30, base); if (yb < cor + 60) continue;
    const vx = x + 52, vb = clamp(cpSkyline(vx) + 70, cor + 30, base);
    if (vb > cor + 110) {   // the vent: a recessed panel of louvres
      piece(cpBox(vx - 30, cor + 58, vx + 30, Math.min(vb, cor + 58 + 360)), cpInk(-.25), { sw: 1, key: 'cpvent' + x });
      for (let y = cor + 70; y < Math.min(vb, cor + 410) - 6; y += 12) dline([[vx - 26, y], [vx + 26, y + 3]], 1, BANK.ink);
    }
    piece(cpBox(x - 13, cor + 36, x + 13, yb), cpInk(.92), { sw: 1.1, key: 'cpcol' + x });   // a column
    piece(cpBox(x - 19, cor + 24, x + 19, cor + 40), cpInk(.82), { sw: 1, key: 'cpcap' + x });   // its capital
    dline([[x - 4, cor + 44], [x - 4, yb - 4]], .8, BANK.ink); dline([[x + 5, cor + 44], [x + 5, yb - 4]], .8, BANK.ink);   // flutes
  }
  // the pediment, its tympanum and the cooling fan: a guilloche rosette that spins, faster on every roar
  piece([[px - 262, cor - 30], [px + 262, cor - 30], [px, -176]], cpInk(.88), { sw: 1.4, key: 'cpped' });
  piece([[px - 212, cor - 42], [px + 212, cor - 42], [px, -150]], cpInk(.06), { sw: 1.1, key: 'cptymp' });
  const fx = px, fy = -76, fr = 56;
  piece(oval(fx, fy, fr + 9, fr + 9, 0, 36), cpInk(.94), { sw: 1.2, key: 'cpfanring' });
  const spin = t * 1.6 + (R.on ? 1.1 * (R.n - 5) + 1.1 * easeOut(clamp(R.age / .3)) : 0);
  guilloche(fx, fy, 10, fr, { n: 12, lobes: 5, rot: spin, w: .6, twist: .4, beat: 2, steps: 240 });
  piece(oval(fx, fy, 9, 9, 0, 14), cpInk(0), { sw: 1, key: 'cpfanhub' });
  // the gate at the street's end: a portico, and a blank doorway
  const gy = 690;
  piece(cpBox(px - 110, 430, px + 110, gy), cpInk(.08), { sw: 1.2, key: 'cpgateW' });
  piece(stLancet(px - 44, 470, px + 44, gy, 40), cpInk(.97), { sw: 1.2, key: 'cpgate' });
  for (const gx of [px - 86, px + 86]) piece(cpBox(gx - 10, 440, gx + 10, gy), cpInk(.92), { sw: 1, key: 'cpgc' + gx });
}
// The exhaust: puffs born at each stack's mouth, rising, then blown left over the rooftops (pure in t: every live puff
// comes from its birth time). Drawn as ONE engraved mass (the union of the puffs), the forms inside cut as lines.
function cpPuffs(t) {
  let P = [];
  CP.stacks.forEach(([x, w, top], i) => { P = P.concat(stPlume(t + i * .17, x, top + w * .2, w * .5, .5, 5.6, { v: 70 + 10 * i, acc: 34, sink: 9 })); });
  return P;
}
function cpPall(t, R) {
  boilSeed('cp pall');
  const puffs = cpPuffs(t);
  const half = (p, x) => { const u = (x - p[0]) / p[2]; return Math.abs(u) < 1 ? .8 * p[2] * Math.sqrt(1 - u * u) : -1; };
  const runs = []; let top = [], bot = [];
  for (let x = -300; x <= 2500; x += 10) {
    let a = Infinity, b = -Infinity;
    for (const p of puffs) { const h = half(p, x); if (h >= 0) { a = Math.min(a, p[1] - h); b = Math.max(b, p[1] + h); } }
    if (a < b) { top.push([x, a]); bot.push([x, b]); } else if (top.length) { runs.push([top, bot]); top = []; bot = []; }
  }
  if (top.length) runs.push([top, bot]);
  runs.forEach(([T0, B0], i) => piece(T0.concat(B0.slice().reverse()), cpInk(.45), { sw: 1.3, key: 'cppall' + i }));
  // inner forms: the lower edge of each puff that isn't the underside of the whole
  const bottom = x => { let b = -Infinity; for (const p of puffs) b = Math.max(b, p[1] + half(p, x)); return b; };
  for (const p of puffs) {
    const [cx, cy, r, a] = p; if (a < .4 || cy + .8 * r > bottom(cx) - 16) continue;
    const A = []; for (let k = 0; k <= 8; k++) { const an = Math.PI * (.12 + .76 * k / 8); A.push([cx + Math.cos(an) * r, cy + Math.sin(an) * r * .8]); }
    dline(A, 1.1, BANK.ink, .5);
  }
}
// On a roar: a dark billow punched up out of each stack (engraved) ...
function cpBillows(t, R) {
  if (!(R.on || R.pre) || R.age > .7) return;
  boilSeed('cp billow');
  const a = R.age / .7;
  CP.stacks.forEach(([x, w, top], i) => {
    if (R.pre && i % 2) return;
    const r = w * (.5 + (R.n === 13 ? 1.6 : 1.0) * easeOut(a)) * (R.pre ? .7 : 1), y = top - 30 - 130 * easeOut(a) * (R.pre ? .6 : 1);
    piece(stBillowPts(x - 30 * a, y, r, R.n * 5.1 + i, R.n + a), cpInk(.02), { sw: 1.2, key: 'cpbil' + i });
  });
}
// ... and, printed over the engraving in the photocopy's spot ink, the turbines' fire and their warning lights.
function cpFire(t, R) {
  boilSeed('cp fire');
  const sp = cpSpot();
  CP.stacks.forEach(([x, w, top], i) => {
    // aviation warning lights, blinking on the beat
    const on = frac(cpBp(t) + i * .25) < .5;
    if (on) piece(oval(x, top - 5, 7, 7, 0, 12), CPC.warn, { sw: .9, key: 'cpwarn' + i, spot: sp });
    if (R.k < .07 || (R.pre && i % 2)) return;
    const k = Math.min(1.3, R.k), h = w * (.7 + 3.1 * k), j = hash(R.n * 3.7 + i), y = top;
    const F = curvy([[x - w * .46, y], [x - w * .56, y - h * .35], [x - w * .3, y - h * (.62 + .2 * j)], [x - w * .12, y - h * .48], [x + w * .02, y - h], [x + w * .18, y - h * .55], [x + w * .36, y - h * (.74 - .2 * j)], [x + w * .54, y - h * .3], [x + w * .46, y]], 4);
    piece(F, XEROX.process || sp ? CPC.fire : '#F6F0E4', { sw: 1.3, key: 'cpfire' + i, spot: sp });   // (one-ink, no spot: white fire)
    const F2 = F.map(([fx, fy]) => [x + (fx - x) * .5, y + (fy - y) * .55]);
    piece(F2, CPC.fireCore, { sw: .8, key: 'cpfire2' + i, spot: null });   // the white-hot core
  });
}
// ======================================================================================================================
// THE XEROX LAYER: the people's street, photocopied (look('xerox'))
// ======================================================================================================================
// A neighbour at the lit glass, in silhouette: head and shoulders rising in; 'ears' = hands clamped over them (like him),
// 'phone' = filming the plant, 'peer' = just looking.
function cpNeighbour(x, y, h, w, kind, age, key) {
  const up = easeOut(clamp(age / .3)), s = Math.min(h * .05, w / 10), sy = s * (.35 + .65 * up), f = hash(keyHash(key)) < .5 ? -1 : 1;
  const S = P => P.map(([a, b]) => [x + a * s, y + b * sy]), o = k => ({ ink: null, key: key + k, spot: null });
  const dk = CPC.sil;
  piece(S(curvy([[-4.4, 0], [-4.0, -3.1], [0, -4.4], [4.0, -3.1], [4.4, 0]], 4)), dk, o('b'));
  piece(S(oval(f * .3, -6.4, 2.1, 2.4, 0, 18)), dk, o('h'));
  if (kind === 'ears') for (const sd of [-1, 1]) { piece(S(ribbon([[sd * 3.4, -2.6], [sd * 4.2, -4.8], [sd * 2.6, -6.4]], .9, .8)), dk, o('a' + sd)); piece(S(oval(sd * 2.3, -6.6, .8, 1.1, 0, 10)), dk, o('p' + sd)); }
  if (kind === 'phone') { piece(S(ribbon([[f * 3.4, -2.6], [f * 4.6, -5.6], [f * 3.4, -7.8]], .9, .8)), dk, o('a')); piece(S(cpBox(f * 2.6 - .7, -9.6, f * 2.6 + .7, -7.2)), dk, o('ph')); }
}
// A window in a wall (quad Q: tl tr br bl): dark glass, or lit from t0 (a flicker, then the spot light) with a neighbour.
function cpWindow(Q, t, t0, o = {}) {
  const on = t0 != null && t >= t0 - 1e-6, fl = on && t - t0 < .1 ? Math.floor((t - t0) * 60) % 2 : 1, key = o.key || 'w' + Q[0][0];
  const sw = o.sw ?? 1.2;
  if (on && fl) {
    piece(Q, CPC.lit, { sw, key, spot: cpSpot() });
    const [a, b, c, d] = Q, cx = (a[0] + b[0] + c[0] + d[0]) / 4, h = Math.abs(d[1] - a[1]), w = Math.abs(b[0] - a[0]);
    if (o.who) cpNeighbour(cx + (o.dx || 0) * w, (c[1] + d[1]) / 2 - 1, h, w, o.who, t - t0, key + 'n');
  } else piece(Q, CPC.glass, { sw, key });
  const [a, b, c, d] = Q, m = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  dline([m(a, b), m(d, c)], sw * .9, '#1A1A1A'); dline([m(a, d), m(b, c)], sw * .9, '#1A1A1A');   // the glazing bars
  if (!(on && fl)) { const p = (u, v) => [lerp(lerp(a[0], b[0], u), lerp(d[0], c[0], u), v), lerp(lerp(a[1], b[1], u), lerp(d[1], c[1], u), v)]; piece([p(.08, .08), p(.3, .08), p(.08, .36)], '#8A8C98', { ink: null, key: key + 'gl', spot: null }); }   // a glint of the street light
}
function cpTerraceSide(t, side, lit, who, sgn, key) {
  const n = 9;
  boilSeed('cp terr ' + key);
  // the front (halftone brick, darker with distance), then the roof band, black against the plant
  piece([side(0, 1), side(n, 1), side(n, 0), side(0, 0)], sgn > 0 ? CPC.brickL : CPC.brickR, { sw: 1.3, key: key + 'front' });
  piece([side(0, 1), side(n, 1), side(n, 1.12, 70), side(0, 1.12, 70)], CPC.roof, { sw: 1.3, key: key + 'roof' });
  for (let s = 1; s <= n; s++) dline([side(s, 0), side(s, 1)], 1.1, '#1A1A1A');   // party walls
  for (let s = 0; s < 7; s++) {
    const a = side === stL ? [s + .3, s + .66, s + .76, s + .92] : [s + .34, s + .7, s + .08, s + .24];
    boilSeed('cp tw ' + key + s);
    cpWindow(stQuad(side, a[0], a[1], .55, .88), t, lit[s], { who: who[s], key: key + 'wu' + s, sw: stF(s) * 1.4 + .5 });
    cpWindow(stQuad(side, a[0], a[1], .12, .4), t, lit['d' + s], { key: key + 'wd' + s, sw: stF(s) * 1.4 + .5 });
    piece(stQuad(side, a[0] - .03, a[1] + .03, .5, .54), CPC.stone, { sw: .8, key: key + 'sill' + s });
    piece(stQuad(side, a[2], a[3], 0, .38), CPC.door, { sw: 1, key: key + 'door' + s });
  }
  // chimney stacks along the ridge, standing on it: the ridge runs to the vanishing point, so each stack's foot follows
  // its slope (a flat foot, at the ridge's height mid-stack, left the downhill corner hanging off the roof)
  for (let s = 0; s <= 7; s++) {
    const [x, y] = side(s, 1.12, 70), f = stF(s), w = 70 * f, h = 90 * f, [vx, vy] = STREET.vp, ridge = xx => vy + (xx - vx) * (y - vy) / (x - vx);
    piece([[x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2, ridge(x + w / 2) + 4], [x - w / 2, ridge(x - w / 2) + 4]], CPC.chim, { sw: 1, key: key + 'ch' + s });
    for (let p = -1; p <= 1; p++) piece(cpBox(x + p * w * .3 - w * .1, y - h - 22 * f, x + p * w * .3 + w * .1, y - h), CPC.chim, { sw: .8, key: key + 'pot' + s + p });
  }
}
function cpTerraces(t) {
  const L = CP.t.lights;
  cpTerraceSide(t, stL, { 0: L[0], 1: L[3], 2: L[4], 3: L[5], 5: L[5], d1: L[2], d4: L[5] }, { 0: 'ears', 1: 'phone', 2: 'peer' }, 1, 'L');
  cpTerraceSide(t, stR, { 3: L[2], 4: L[4], 5: L[5], 6: L[5], d4: L[5] }, { 3: 'ears', 4: 'peer' }, -1, 'R');
}
function cpRoad(t) {
  const [vx, vy] = STREET.vp;
  const kl = s => { const f = stF(s); return [vx - 380 * f, stY(0, f)]; }, kr = s => { const f = stF(s); return [vx + 590 * f, stY(0, f)]; };
  boilSeed('cp road');
  piece([stL(-.2, 0), stL(9, 0), kl(9), kl(-.2)], CPC.pave, { sw: 1.2, key: 'cppavL' });
  piece([stR(-.4, 0), stR(9, 0), kr(9), kr(-.4)], CPC.paveR, { sw: 1.2, key: 'cppavR' });
  piece([kl(-.2), kl(9), kr(9), kr(-.4)], CPC.road, { sw: 1.4, key: 'cproad' });
  // the lamp's pool on the wet road: halftone breaking up the black, toward us
  const [lx, ly] = CP.lamp;
  piece(oval(lx + 40, ly + 20, 250, 44, -.02, 28), CPC.pool, { ink: null, key: 'cppool' });
  // the gate's blaze running down the wet road
  for (let s = .1, i = 0; s < 6; s += .16 + s * .06, i++) {
    const f = stF(s), y = stY(0, f) - 2, cx = vx - 60 * f; if (y > H + 40) continue;
    const hw = (8 + 70 * f) * (.4 + .6 * hash(i * 3.1)), ox = (hash(i * 7.3) - .5) * 60 * f, th = 1.5 + 5 * f;
    piece(cpBox(cx + ox - hw, y - th / 2, cx + ox + hw, y + th / 2), CPC.blaze, { ink: null, key: 'cpbl' + i });
  }
  // cobble courses
  for (let s = .1; s < 6; s += .26 + s * .07) { const a = kl(s), b = kr(s); if (a[1] > H + 40) continue; dline([a, b], .9, '#1A1A1A'); }
}
function cpLamp(t, R) {
  const [x, y0, top] = CP.lamp;
  boilSeed('cp lamp');
  piece([[x - 8, y0], [x - 6, top + 30], [x + 6, top + 30], [x + 8, y0]], CPC.lampPole, { sw: 1.1, key: 'cppole' });
  piece(cpBox(x - 14, y0 - 34, x + 14, y0), CPC.lampPole, { sw: 1, key: 'cpbase' });
  const arm = ribbon([[x, top + 40], [x + 6, top - 4], [x + 44, top - 14]], 10, 8);
  piece(arm, CPC.lampPole, { sw: 1, key: 'cparm' });
  piece(curvy([[x + 26, top - 26], [x + 92, top - 24], [x + 96, top - 10], [x + 24, top - 10]], 3), CPC.lampPole, { sw: 1.1, key: 'cphead' });
  piece(curvy([[x + 32, top - 10], [x + 90, top - 10], [x + 82, top - 1], [x + 38, top - 1]], 3), CPC.lamp, { sw: .9, key: 'cplens', spot: null });
}
// His house: the neighbour's front, his, the roof and chimneys. The wall round his window is drawn after him (cpWall).
function cpHouse(t, R) {
  const { x0, x1, eaves, ridge } = CP.house, Wn = CP.win;
  boilSeed('cp house');
  // the neighbour's front, her upstairs window lighting up on the second roar
  piece(cpBox(-260, eaves, x0, 1200), CPC.brickN, { sw: 1.3, key: 'cpnfront' });
  cpWindow([[-90, Wn.y0 + 10], [110, Wn.y0 + 10], [110, Wn.y1], [-90, Wn.y1]], t, CP.t.lights[1], { who: 'ears', dx: .05, key: 'cpnwin', sw: 1.6 });
  piece(cpBox(-104, Wn.y1, 124, Wn.y1 + 22), CPC.stone, { sw: 1.2, key: 'cpnsill' });
  piece(cpBox(-104, Wn.y0 - 22, 124, Wn.y0 + 10), CPC.stoneDk, { sw: 1.2, key: 'cpnlint' });
  // roof, gutter and chimney stacks, black against the plant
  piece([[-260, eaves], [x1 + 10, eaves], [x1 - 14, ridge], [-260, ridge]], CPC.roof, { sw: 1.4, key: 'cproof' });
  piece(cpBox(-260, eaves - 6, x1 + 14, eaves + 10), CPC.stoneDk, { sw: 1.2, key: 'cpgutter' });
  for (const [cx, w] of [[x0, 130], [x1 - 70, 100]]) {   // (the right one clear of the roof's hipped end: at x1 - 40 it overhung it)
    piece(cpBox(cx - w / 2, 58, cx + w / 2, ridge + 6), CPC.chim, { sw: 1.2, key: 'cpstk' + cx });
    piece(cpBox(cx - w / 2 - 8, 46, cx + w / 2 + 8, 62), CPC.stoneDk, { sw: 1.1, key: 'cpstkc' + cx });
    for (let p = 0; p < 3; p++) { const qx = cx - w / 2 + 18 + p * (w - 36) / 2; piece([[qx - 11, 48], [qx - 9, 8], [qx - 13, 2], [qx + 13, 2], [qx + 9, 8], [qx + 11, 48]], CPC.pot, { sw: 1, key: 'cppot' + cx + p }); }
  }
}
// His room: black, the copier's idea of a dark bedroom.
function cpRoom(t) {
  const Wn = CP.win;
  boilSeed('cp room');
  piece(cpBox(Wn.x0 - 10, Wn.y0 - 10, Wn.x1 + 10, Wn.y1 + 10), CPC.room, { ink: null, key: 'cproom' });
}
// The wall round his window (over him: he stands behind it), then the sill, lintel, reveals and the casements, rattling.
function cpWall(t, R) {
  const { x0, x1, eaves } = CP.house, Wn = CP.win, ySill = Wn.y1 + 12;
  boilSeed('cp wall');
  const col = CPC.brick;
  piece([[x0, eaves + 10], [x1, eaves + 10], [x1, ySill], [Wn.x1, ySill], [Wn.x1, Wn.y0], [Wn.x0, Wn.y0], [Wn.x0, ySill], [x0, ySill]], col, { sw: 1.3, key: 'cpwallU' });
  piece(cpBox(x0, ySill, x1, 1200), col, { sw: 1.3, key: 'cpwallL' });
  // brick courses where the street light reaches, and the door below
  for (let y = eaves + 40, r = 0; y < 1180; y += 28, r++) {
    if (y > Wn.y0 - 40 && y < ySill + 30) continue;
    for (let x = x0 + (r % 2) * 40; x < x1 - 20; x += 80) if (hash(x * .37 + y * 1.3) < .45) dline([[x, y], [x + 60, y + 1]], 1, '#1A1A1A');
  }
  piece(cpBox(800, 880, 930, 1200), CPC.door, { sw: 1.2, key: 'cpdoor' });
  piece(cpBox(790, 866, 940, 884), CPC.stone, { sw: 1.1, key: 'cpdoorl' });
  // the lintel, the reveal, the sill
  piece(cpBox(Wn.x0 - 26, Wn.y0 - 38, Wn.x1 + 26, Wn.y0), CPC.stoneDk, { sw: 1.3, key: 'cplint' });
  piece([[Wn.x0 - 30, Wn.y1], [Wn.x1 + 30, Wn.y1], [Wn.x1 + 38, Wn.y1 + 26], [Wn.x0 - 38, Wn.y1 + 26]], CPC.stone, { sw: 1.3, key: 'cpsill' });
  piece(cpBox(Wn.x0 - 34, Wn.y1 + 26, Wn.x1 + 34, Wn.y1 + 38), CPC.shadow, { ink: null, key: 'cpsillsh' });
  // the casements, swung open outward, rattling on the roars
  const rat = R.on || R.pre ? R.shake : 0, jig = s => (hash(Math.floor(t * 30) * 1.3 + s) - .5) * 20 * rat;
  for (const s of [-1, 1]) {
    const hx = s < 0 ? Wn.x0 : Wn.x1, sw = 74 + jig(s * 3), grow = 1 + .1 * (sw / 74);
    const Q = [[hx, Wn.y0 + 2], [hx + s * sw, Wn.y0 - 14 * grow], [hx + s * sw, Wn.y1 + 14 * grow], [hx, Wn.y1 - 2]];
    piece(Q, CPC.frame, { sw: 1.4, key: 'cpcase' + s });
    const G = [[hx + s * 9, Wn.y0 + 12], [hx + s * (sw - 9), Wn.y0 - 2], [hx + s * (sw - 9), Wn.y1 + 2], [hx + s * 9, Wn.y1 - 12]];
    piece(G, CPC.glass, { sw: 1, key: 'cpglass' + s });
    for (const k of [1 / 3, 2 / 3]) piece([[G[0][0], lerp(G[0][1], G[3][1], k) - 2], [G[1][0], lerp(G[1][1], G[2][1], k) - 2], [G[1][0], lerp(G[1][1], G[2][1], k) + 3], [G[0][0], lerp(G[0][1], G[3][1], k) + 3]], CPC.frame, { ink: null, key: 'cpbar' + s + k });
    if (rat > .15) for (const k of [.2, .5, .8]) {   // rattle marks
      const y = lerp(Wn.y0, Wn.y1, k), x = hx + s * (sw + 12), ww = 1.8 * rat + .6;
      dline(through([[x, y - 18], [x + s * 5, y], [x, y + 18]], 4), ww, '#1A1A1A'); dline(through([[x + s * 13, y - 26], [x + s * 19, y], [x + s * 13, y + 26]], 4), ww * .8, '#1A1A1A');
    }
  }
}

// ---------- him ----------
// Pair C's man in pyjamas: a sky-blue button-up top with navy piping (lapels, cuffs, buttons); no beanie in bed.
const CP_HIM = { ...HIM_C, id: 'hCpj',
  hair: { style: 'crop', hairline: -.5 },
  top: { ...HIM_C.top, kind: 'coat', collar: 'lapel', vDepth: 1.45, open: 0, buttons: [[0, 1.9], [0, 2.9], [0, 3.9]], pocket: 9 },
  col: { ...HIM_C.col, coat: '#7FA8D8', coatDk: '#1E2A5A', coatLt: '#B8D4F0', cuff: '#1E2A5A', under: '#7FA8D8', button: '#1E2A5A' } };
// The pillow: a soft slab (s along it, v across: v = 1 is the top / outer face), from a hug at his chest (k 0) to
// folded over his head (k 1): pinched where his hands press it onto his ears, its ends flaring out past his jaw, the
// corners poking out. sq squeezes it on each blast. Body units → px.
function cpPillow(k, sq, Fr, u) {
  const at = (s, v) => {
    const a = Math.abs(s), puff = 1 - s ** 4;
    s *= 1 + .06 * Math.abs(v) ** 4; v *= 1 + .2 * a ** 6;   // the corners poke out
    const hx0 = s * 3.1, hy0 = -7.3 - v * 1.05 * (.72 + .28 * puff);
    const th = -Math.PI / 2 + s * (Math.PI / 2 + .5);
    const w = .72 * (.85 + .25 * puff) - (.26 + .12 * sq) * Math.exp(-(((a - .72) / .1) ** 2)) + .22 * clamp((a - .78) / .22);   // pinched by the hands, the ends bulge
    const r = 3.0 + .75 * clamp((a - .66) / .34) ** 1.5 + v * w;
    const cx = Math.cos(th) * r, cy = Fr.hy + .18 + Math.sin(th) * r * .97;
    return [lerp(hx0, cx, k) * u, (lerp(hy0, cy, k) - 1.6 * 4 * k * (1 - k)) * u];
  };
  const P = [];
  for (let i = 0; i <= 20; i++) P.push(at(-1 + 2 * i / 20, 1));
  for (let i = 1; i < 5; i++) P.push(at(1, 1 - 2 * i / 5));
  for (let i = 0; i <= 20; i++) P.push(at(1 - 2 * i / 20, -1));
  for (let i = 1; i < 5; i++) P.push(at(-1, -1 + 2 * i / 5));
  return { P, at };
}
function cpHim(t, R) {
  const [x, y, u] = CP.him, T_ = CP.t, P = CP_HIM, sw = clamp(u / 20, .55, 2.2);
  // acting: bleary and swaying → the rumble; eyes to the plant → the take on the first roar → pillow over the ears, eyes
  // screwed shut, teeth gritted, squeezed on every blast → gives up and stares at us, dead-eyed
  const mood = emotions(t, [
    [0, 'sleepy', { emote: null }],
    [T_.look, 'nervous', { emote: null }],
    [T_.roar + .08, 'surprised', { emote: null }],   // (a beat of cause before the reaction)
    [T_.clamp[1] - .02, 'angry', { emote: null, eyes: 'squeeze', mouth: 'teeth' }],
    [T_.glare, 'bored', { emote: null }],
  ], { take: .8 });
  mood.lookX = t < T_.look ? .1 + .1 * Math.sin(t * 1.3) : t < T_.glare ? .85 : 0;
  mood.lookY = t < T_.look ? .35 : t < T_.glare ? -.5 : .05;
  if (t < T_.look) { mood.rot = .035 * Math.sin(t * 1.9); mood.dy = (mood.dy || 0) + .08 * Math.sin(t * 3.8); }
  mood.dy = Math.max(mood.dy || 0, -.35); mood.sq = Math.max(mood.sq || 0, -.06);   // the take: his head stays under the lintel
  if (Math.abs(mood.dx || 0) > 0) mood.dx *= .5;
  const clampK = ease(seg(t, T_.clamp[0], T_.clamp[1])), sqz = clampK > .9 && R.on ? Math.min(1, R.k) : 0;
  const hugA = { L: [-1.55, -6.95, .5, -.25], R: [1.6, -6.9, .5, -Math.PI + .25] };
  const clA = { L: [-4.0 + .3 * sqz, -9.9, .6, -Math.PI / 2 + .22], R: [4.0 - .3 * sqz, -9.9, .6, -Math.PI / 2 - .22] };
  const spec = s => { const a = s < 0 ? hugA.L : hugA.R, b = s < 0 ? clA.L : clA.R; return [lerp(a[0], b[0], clampK), lerp(a[1], b[1], clampK) - 1.2 * 4 * clampK * (1 - clampK), lerp(a[2], b[2], clampK), 'none', 1, null, 'u']; };
  // (idle: 0: the bags, pillow and hands below are drawn over the rig in its body space, so the rig's own idle life
  // (breathing, weight shifts, head turns) would drift them off his face; his bleary sway above is his life here)
  const o = { ...mood, view: 'front', pose: { L: spec(-1), R: spec(1) }, legs: false, noShadow: true, boilKey: 'cphim', seed: 2, idle: 0, col: CP_PJ[cpNoK() ? 'riso' : XEROX.process ? 'cmyk' : 'one'] };
  o.tilt = (clampK > .9 ? .05 * sqz : 0) + (t >= T_.glare ? -.05 * ease(seg(t, T_.glare, T_.glare + .5)) : 0);
  // in the xerox look his skin never crushes to toner, however many copies deep (maxTone on every skin piece)
  const lift = c => ['engrave', 'bank', 'xerox'].includes(STYLE.mode) ? mixCol(c, '#F4E8D8', .4) : c;
  const C = P.col, skin = lift(C.skin), skinCols = new Set([skin, lift(C.skinDk), lift(C.skinLt), lift(C.lip), mixCol(skin, lift(C.skinDk), .6)]);
  const sp = piece;   // (process variants lift skin themselves when maxTone is set: leave them their own colour)
  if (!XEROX.process) piece = (Q, c, oo = {}) => sp(Q, c, skinCols.has(c) ? { ...oo, maxTone: oo.maxTone ?? .56 } : oo);
  try {
    person(x, y, u, P, o);
    // over the rig, in its body space: the bags under his eyes, the pillow, his hands on it
    const Fr = personFrame(P, o), sq = ((o.sq || 0) + (o.take || 0)) * .5, b = P.body, shX = P.top.sh[0], aw = b.armW;
    push(); translate(x + (o.dx || 0) * u, y + (o.dy || 0) * 1.1 * u); if (o.rot) rotate(o.rot); scale(1 + sq * .5, 1 - sq);
    const hx = clamp(o.lookX || 0, -1, 1) * .1, headRot = (o.tilt || 0) + (o.rot || 0) * -.4, pv = [hx * u, (Fr.yc - .3) * u];
    push(); translate(...pv); rotate(headRot); translate(-pv[0], -pv[1]);
    boilSeed('cp bags');
    const eyeY = Fr.hy + P.face.eyeY * P.head.h / 2, ew = P.face.eye * P.head.w;
    for (const s of [-1, 1]) {
      const ex = hx + s * P.face.gap * P.head.w;
      dline(U([[ex - ew * .42, eyeY + ew * .5], [ex, eyeY + ew * .72], [ex + ew * .42, eyeY + ew * .5]], u), sw * .7, '#2A1A14', .5);
      dline(U([[ex - ew * .3, eyeY + ew * .74], [ex + ew * .05, eyeY + ew * .88], [ex + ew * .34, eyeY + ew * .72]], u), sw * .5, '#2A1A14', .5);
    }
    pop();
    // the pillow (it rides the head's tilt as it goes on)
    boilSeed('cp pillow');
    push(); translate(...pv); rotate(headRot * clampK); translate(-pv[0] + hx * u * clampK, -pv[1]);
    const pl = cpPillow(clampK, sqz, Fr, u);
    piece(pl.P, '#F4F1EA', { sw: sw * 1.15, shade: '#C8C4BA', depth: .4 * u, key: 'cppillow', spot: null });
    for (const s of [-1, 1]) {   // creases: pinched under the hands, and the stuffing bunched at the ends
      dline([pl.at(s * .66, -.7), pl.at(s * .7, -.1), pl.at(s * .66, .6)], sw * .6, NOIR.ink, .5);
      dline([pl.at(s * .9, -.5), pl.at(s * .86, .1)], sw * .5, NOIR.ink, .5);
      if (clampK < .5) dline([pl.at(s * .3, -.6), pl.at(s * .36, .4)], sw * .5, NOIR.ink, .5);
    }
    pop();
    // his hands on it (where the rig put his wrists)
    for (const s of [-1, 1]) {
      const sp2 = spec(s), root = [s * (shX - aw * .42), Fr.ys + Math.max(P.top.sh[1], .15) + aw * .4];
      const A = ppReach(root, [sp2[0], sp2[1]], b.arm, sp2[2], s), tip = A[2];
      const ang = lerp(s < 0 ? hugA.L[3] : hugA.R[3], s < 0 ? clA.L[3] : clA.R[3], clampK);
      boilSeed('cp hand' + s);
      hand((tip[0] + Math.cos(ang) * .08) * u, (tip[1] + Math.sin(ang) * .08) * u, ang, b.hand * 1.12 * u, { pose: clampK > .5 ? 'open' : 'relax', col: skin, sw, mirror: s < 0, key: 'cph' + s });
    }
    pop();
  } finally { piece = sp; }
}

// ======================================================================================================================
// SCREEN SPACE: grit, dirt, the light bar, the exhaust
// ======================================================================================================================
// Dirt that each copy adds and every later copy keeps, fixed per generation (a copy holds still until the next one
// lands): its toner specks, and the lid's shadow creeping in at the top and bottom. The machine's streaks don't multiply
// (each copy went through the same machine: they print darker with each generation, in xeroxGrit, from XEROX.lgen; a
// new line down the frame for every copy read as a film's scratches).
function cpDirt(g) {
  if (g < 1) return;
  flushBrush();
  push(); noStroke();
  const c = color(XEROX.toner);
  fill(c);
  for (let i = 1; i <= g; i++) for (let j = 0; j < 70; j++) { const h = i * 131 + j; circle(hash(h * 1.3) * W, hash(h * 2.7) * H, .8 + 3.2 * Math.pow(hash(h * .71), 4)); }
  for (let j = 0; j < 3; j++) { c.setAlpha(Math.min(60, 7 * g) * (1 - j / 3)); fill(c); rect(0, 0, W, (2 + 1.2 * g) * (j + 1)); rect(0, H - (1.5 + .9 * g) * (j + 1), W, (1.5 + .9 * g) * (j + 1)); }   // the lid's shadow creeping in
  pop();
}
// The copier's light bar: blank paper ahead of it, the copy appearing behind it (overexposed for a moment).
function cpLightBar(t) {
  const [a, b] = CP.t.bar; if (t > b) return;
  const p = seg(t, a, b), X = lerp(-140, W + 140, p);   // constant speed: it's a machine
  const R = (x0, x1) => [[x0, -80], [x1, -80], [x1, H + 80], [x0, H + 80]];
  boilSeed('cp bar');
  for (let i = 0; i < 6; i++) { const xa = X - 46 * (i + 1), xb = X - 46 * i; if (xb > -80) _paint(R(xa, xb), { wash: XEROX.paper, washOp: 215 * (1 - i / 6), ink: null }); }
  if (X < W + 80) _paint(R(X, W + 200), { wash: XEROX.paper, ink: null });
  for (let y = -40; y < H + 80; y += 110) _glow(X - 10, y, 190, '#9CFFD2', .85);
  _paint(R(X - 16, X + 10), { wash: '#F8FFFA', ink: null });
  _paint(R(X + 10, X + 14), { wash: '#B9C4BE', ink: null });
}
// The exhaust rolls in from the right (toner black), its front a column of billows, halftone on their leading edges,
// with smeared toner streaks dragged ahead of it. side: everything right of X is covered.
function cpExhaust(X, t) {
  const lobes = [];
  for (let i = -1; i < 10; i++) lobes.push([X + 60 * Math.sin(i * 1.7 + t * 1.6) + 40 * hash(i), i * 124 + 30 * Math.sin(i * 2.1), 120 + 50 * hash(i * 3.3), i]);
  const hw = (l, y) => { const u = (y - l[1]) / l[2]; return Math.abs(u) < 1 ? .82 * l[2] * Math.sqrt(1 - u * u) : -1; };
  const front = []; for (let y = -140; y <= H + 140; y += 10) { let f = X; for (const l of lobes) { const h = hw(l, y); if (h >= 0) f = Math.min(f, l[0] - h); } front.push([f, y]); }
  boilSeed('cp exhaust');
  // smeared toner dragged ahead of the front (the drum smear)
  for (let i = 0; i < 26; i++) { const y = hash(i * 3.7) * H, len = 60 + 380 * Math.pow(hash(i * 1.9), 2), th = 2 + 10 * hash(i * 5.1); const fx = front[Math.round((y + 140) / 10)][0] + 30; piece(cpBox(fx - len, y, fx, y + th), CPC.smear, { ink: null, key: 'cpsm' + i, spot: null }); }
  piece([[W + 900, -140]].concat(front, [[W + 900, H + 140]]), CPC.exh, { sw: 2.4, key: 'cpexh', spot: null });
  // the leading billows, each its own rolling form, lit along the top by the street (a broad halftone rim)
  const prev = LIGHT.dir;
  for (const [lx, ly, r, i] of lobes) {
    const P = stBillowPts(lx + r * .25, ly, r * 1.02, i * 5.3 + 11, t * .6 + i);
    piece(P, CPC.exh, { sw: 1.6, key: 'cpexb' + i, spot: null });
    LIGHT.dir = [.75, .66]; const C = crescent(P, r * .38);   // (crescent() is the side away from LIGHT.dir: here the lit leading edge)
    if (C) piece(C, CPC.exhLit, { sw: .9, key: 'cpexc' + i, spot: null });
  }
  LIGHT.dir = prev;
}

// ---------- the shot ----------
LOOPS.copies = t => {
  const T_ = CP.t, R = cpRoar(t);
  const push = ease(seg(t, 1.0, T_.len)), glareK = ease(seg(t, T_.glare, T_.glare + 1));
  const zoom = lerp(.9, .98, push) + .03 * glareK, cx = lerp(985, 900, push) - 20 * glareK, cy = -240 + 540 / zoom;   // the push keeps the stacks' fire in frame
  const covered = t < T_.bar[0] || t >= T_.out[1] - .01;
  const kout = seg(t, T_.out[0], T_.out[1]), Xout = lerp(W + 520, -760, ease(kout));
  Object.assign(CPC, cpNoK() ? CPC_R : XEROX.process ? CPC_P : CPC_1);
  if (!covered) {
    LIGHT.dir = [.55, -.83];   // the key: the plant's glare, up the street to his left
    // the power, printed like money (it never shakes)
    look('bank'); Object.assign(BANK, BANK_TEAL);
    camBegin(cx, cy, zoom);
    cpSky(t);
    cpPall(t, R);
    cpMedal(t);
    const dens0 = BANK.dens; BANK.dens = (dens0 || 1) * 1.5;   // the plant's darks engraved denser than a note's, so it looms
    cpPlant(t, R);
    cpBillows(t, R);
    BANK.dens = dens0;
    look('xerox'); cpGeneration(R.gen);
    cpXeroxDraw(() => cpFire(t, R));
    camEnd();
    // the people, photocopied: shaken by every roar, a copy of a copy
    const [sx, sy] = R.shake > .02 ? shakeXY(t, 10 * R.shake) : [0, 0], D = cpDrift(R);
    camBegin(cx + sx - D.dx, cy + sy - D.dy, zoom * D.sc, D.rot);
    cpXeroxDraw(() => { cpTerraces(t); cpRoad(t); cpLamp(t, R); cpHouse(t, R); cpRoom(t); cpHim(t, R); cpWall(t, R); });
    camEnd();
  } else {   // blank paper before the copy; after it, the exhaust's toner, wall to wall
    look('xerox'); cpGeneration(R.gen); boilSeed('cp cover');
    if (t < T_.bar[0]) _paint(cpBox(-80, -80, W + 80, H + 80), { wash: XEROX.paper, ink: null });
    else cpXeroxDraw(() => piece(cpBox(-80, -80, W + 80, H + 80), CPC.exh, { ink: null, key: 'cpcover', spot: null }));
  }
  if (t > T_.out[0] && !covered) cpXeroxDraw(() => cpExhaust(Xout, t));
  if (t < T_.bar[1]) cpLightBar(t);
  cpDirt(R.gen);
  xeroxGrit(t, 1);   // (the racket prints as each roar's new copy, dirtier: cpDirt, cpGeneration's grit; not as noise pulsing on the copy)
  Object.assign(XEROX, CP_X0); Object.assign(BANK, CP_B0);
};
LOOPS.copies.len = CP.t.len;

// sets/street.js: THE STREET (verse 2, the bad future), a Victorian engraving after Doré's London. "Elon's cloud has a
// tailpipe. Hear the gas turbines roar. / No proper permits; plenty of exhaust next door. / The machines don't need to
// sleep. The people round them do."
//
// Night. A terraced street bends away from us to a vast data centre at its end, drawn as a mill-cathedral of industry:
// tiers of lancet windows glowing with racks of machines, a gable whose rose window is a giant cooling fan, chimneys
// and a parapet of gas-turbine stacks belching smoke that rolls over the rooftops. Our narrator stands at his lit
// bedroom window in his pyjamas (the commuter rig), hugging his pillow, awake, bags under his eyes. The turbines ROAR on
// the beat: the stacks spit, the windows flare, his casements rattle, he clamps the pillow over his ears, and one by
// one the neighbours' windows light up (nightcaps at the glass). He ends staring at us, dead-eyed, while it goes on.
//
// LOOPS.street (6 s, 140 bpm: beats every .4286 s): engrave look, its own camera (a slow push in on him, shaking on
// the roars). In: the smoke rolls away to the left; out: the smoke rolls back in from the right and covers the frame.
// Timeline: STREET.times. Everything is a pure function of t.
//
// Values, the Doré way: black silhouettes (a dark ground cut with fine pale lines, as a wood engraver cuts) against
// smoke lit from below by the mill; lit windows punched out of the dark; his window the brightest, nearest thing.

const STREET = {
  vp: [1450, 600],                        // the vanishing point: eye level is his face
  glow: [1450, 330],                      // the heart of the mill's light, behind the fan
  house: { x0: 180, x1: 960, eaves: 235, ridge: 162, ground: 1150 },
  win: { x0: 380, x1: 740, y0: 352, y1: 725 },   // his window opening
  him: [560, 962, 40],                    // his ground point (below the sill) and unit
  lamp: [1138, 1052, 640],                // the gas lamp: x, foot, lantern
  times: {
    in: [0, .9],          // the smoke rolls away (right to left): mill, street, then him
    rumble: 2.143,         // beat 5: the stacks glow, he looks toward the mill
    roar: 2.571,           // beat 6: the first roar
    clamp: [2.74, 2.96],   // the pillow goes over his head
    lights: [3.0, 3.429, 3.857, 4.286, 4.714, 5.143],   // neighbours' windows, one a beat
    glare: 4.55,           // he gives up and stares at us
    out: [5.4, 6.0], len: 6.0,
  },
};

// ---------- engraving helpers ----------
// Lines are ruled in pieces (a long p5.brush stroke fades out along its length) and on a global grid (so neighbouring
// regions' lines meet).
const ST_INK = E_INK, ST_PAPER = E_PAPER, ST_CUT = '#9C8C74';
// Tone passes: [threshold, angle offset, spacing, weight, grid offset]. Tone 0 = paper, 1 = the densest crosshatch.
const ST_PASSES = [[.05, 0, 7, 1, .5], [.3, 0, 7, 1, 0], [.5, 72, 7, .95, .5], [.7, 72, 7, .95, 0], [.86, -48, 5.6, 1, .5], [.97, -48, 5.6, 1, 0]];
// Scanlines of polygon P at angle a (deg), spacing d: fn(lineIndex, y, xa, xb, back) per inside span (rotated frame).
function stScan(P, d, a, off, fn) {
  const ang = a * Math.PI / 180, c = Math.cos(-ang), s = Math.sin(-ang), ci = Math.cos(ang), si = Math.sin(ang);
  const R = P.map(([x, y]) => [x * c - y * s, x * s + y * c]), back = (x, y) => [x * ci - y * si, x * si + y * ci];
  let y0 = Infinity, y1 = -Infinity; for (const p of R) { if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
  for (let li = Math.ceil(y0 / d - off); (li + off) * d < y1; li++) {
    const y = (li + off) * d;
    for (const [xa, xb] of scanSpans(R, y)) fn(li, y, xa, xb, back);   // (nonzero: style.js scanSpans)
  }
}
// One ruled line from xa to xb (rotated frame), in pieces of at most ~L px with hairline breaks.
function stRule(xa, xb, y, back, w, col, li, L = 120) {
  const n = Math.max(1, Math.round((xb - xa) / L)), sl = (xb - xa) / n;
  for (let j = 0; j < n; j++) {
    const a = xa + j * sl + (j ? 1.5 * hash(li * 3.7 + j) : 0), b = xa + (j + 1) * sl;
    if (b - a > 1.5) _inkLine([back(a, y), back(b, y)], w, col, 'rotring', 0);
  }
}
// Engrave polygon P with a tone field tone(x, y) (or a number): a ground wash, then passes of rule by tone.
// o.a: base angle (follow the plane) · o.wash (null: none) · o.passes · o.col · o.step (sampling px) · o.w · o.d
function stField(P, tone, o = {}) {
  const A = o.a ?? 35, flat = typeof tone === 'number', step = o.step ?? 8, col = o.col || ST_INK, ws = o.w ?? 1;
  if (o.wash !== null) _paint(P, { wash: o.wash ?? (flat ? stWash(tone) : ST_PAPER), ink: null });
  (o.passes || ST_PASSES).forEach(([th, da, d, w, off], pi) => {
    if (flat && tone <= th) return;
    stScan(P, d * (o.d ?? 1), A + da, off, (li, y, xa, xb, back) => {
      if (flat) { stRule(xa, xb, y, back, w * ws, col, li); return; }
      const n = Math.max(1, Math.ceil((xb - xa) / step)); let run = null;
      for (let j = 0; j <= n; j++) {
        const x = Math.min(xb, xa + j * step), p = back(x, y);
        const on = j < n && tone(p[0], p[1]) > th + (hash(li * 13.7 + j * 3.1 + pi * 71.3) - .5) * .14;
        if (on && run === null) run = x;
        if ((!on || j === n) && run !== null) { if (x - run > 3) stRule(run, x, y, back, w * ws, col, li); run = null; }
      }
    });
  });
}
const stWash = k => mixCol(ST_PAPER, '#7E6C56', clamp(k) * .62);
// Engraver's black: a dark ground cut with fine pale lines (o.lines: false for none; o.lw: weight function (x, y) → w).
function stDark(P, o = {}) {
  _paint(P, { wash: o.wash || '#3A2F26', ink: null });
  if (o.lines === false) return;
  const lw = o.lw;
  stScan(P, o.d ?? 5.5, o.a ?? 30, .5, (li, y, xa, xb, back) => {
    if (!lw) { stRule(xa, xb, y, back, o.w ?? .6, o.col || ST_CUT, li); return; }
    const L = 30, n = Math.max(1, Math.round((xb - xa) / L)), sl = (xb - xa) / n;
    for (let j = 0; j < n; j++) { const a = xa + j * sl, b = a + sl - 1, m = back((a + b) / 2, y), w = lw(m[0], m[1]); if (w > .3) _inkLine([back(a, y), back(b, y)], w, o.col || ST_CUT, 'rotring', 0); }
  });
}
// An engraved piece: flat tone and an outline. k > 1: engraver's black.
function stPiece(P, k, o = {}) {
  if (k > 1) stDark(P, o); else stField(P, k, o);
  if (o.ink !== null) _inkLine(P.concat([P[0]]), o.sw ?? 1.1, ST_INK, 'rotring', 0);
}
// A pale edge on the side of a shape that faces the light at (lx, ly) (backlit silhouettes).
function stRim(P, lx, ly, w = 1.2, inset = 2) {
  const [cx, cy] = centroid(P), d = Math.hypot(lx - cx, ly - cy) || 1, prev = LIGHT.dir;
  LIGHT.dir = [(lx - cx) / d, (ly - cy) / d];
  for (const r of litEdge(resample(P, 14), inset, .3)) _inkLine(r, w, '#E4D6BA', 'rotring', 0);
  LIGHT.dir = prev;
}
const stLine = (P, w = 1, col = ST_INK) => _inkLine(P, w, col, 'rotring', 0);
const stBox = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
// A lancet (pointed arch) window: springing at y0 + rise, apex at y0.
function stLancet(x0, y0, x1, y1, rise, n = 6) {
  const hw = (x1 - x0) / 2, P = [[x0, y1]];
  for (let i = 0; i <= n; i++) { const a = Math.PI * .5 * i / n; P.push([x0 + hw * (1 - Math.cos(a)), y0 + rise - rise * Math.sin(a)]); }
  for (let i = n - 1; i >= 0; i--) { const a = Math.PI * .5 * i / n; P.push([x1 - hw * (1 - Math.cos(a)), y0 + rise - rise * Math.sin(a)]); }
  P.push([x1, y1]); return P;
}

// ---------- perspective of the side street ----------
// s: distance down the street in house widths from his corner; v: height (0 ground, 1 eaves). Left side: the terrace
// bending away from his corner; right side: the opposite terrace. out: px (at s = 0) away from the street.
const stF = s => 1 / (1 + .633 * s);
const stY = (v, f) => STREET.vp[1] + ((1150 - 915 * v) - STREET.vp[1]) * f;
const stL = (s, v, out = 0) => { const f = stF(s); return [STREET.vp[0] - (490 + out) * f, stY(v, f)]; };
const stR = (s, v, out = 0) => { const f = stF(s); return [STREET.vp[0] + (700 + out) * f, stY(v, f)]; };
const stQuad = (side, sa, sb, va, vb) => [side(sa, vb), side(sb, vb), side(sb, va), side(sa, va)];

// ---------- the roar ----------
// Roar state at t: k = this beat's blast (1 on the beat, decaying), on = the roaring has started, pre = the rumble.
function stRoar(t) {
  const T_ = STREET.times, b = beatN(t + 1e-6), a = frac(bpOf(t + 1e-6)) * BEAT;
  const on = t >= T_.roar - 1e-6, pre = !on && t >= T_.rumble - 1e-6;
  const k = on ? Math.exp(-a * 5) : pre ? .4 * Math.exp(-a * 5) : .12 * Math.exp(-a * 6);
  return { k, on, pre, age: a, beat: b, shake: on ? Math.exp(-a * 9) : pre ? .3 * Math.exp(-a * 9) : 0 };
}

// ---------- the sky and the smoke ----------
// Smoke lit from below by the mill: luminous over it, darkening outward and up. Ruled like an engraver's sky.
function stSky(t, R) {
  const [gx, gy] = STREET.glow, fl = R.on ? .08 * R.k : 0;
  const tone = (x, y) => clamp(.1 - fl + 1.0 * (1 - Math.exp(-((x - gx) ** 2) / (2 * 600 ** 2) - ((y - gy) ** 2) / (2 * 330 ** 2))) + .15 * clamp(-y / 150), 0, 1);
  stField([[-120, -160], [W + 160, -160], [W + 160, 680], [-120, 680]], tone, { a: -3, wash: '#E8DCC2', step: 10, passes: [[.08, 0, 6.5, 1, .5], [.3, 0, 6.5, 1, 0], [.55, 4, 5.2, 1, .5], [.78, 62, 6.5, .95, .5], [.92, 62, 6.5, .95, 0]] });
}
// A billow of smoke: a lumpy round mass, lit from below by the furnaces: a ruled, lit belly and a black crescent of
// shadow on its crown (the style's crescent(), turned away from the glow).
function stBillowPts(cx, cy, r, seed, rot = 0) {
  const P = [], n = 8;
  for (let i = 0; i < n; i++) {
    const a0 = i / n * TAU + rot, a1 = (i + 1) / n * TAU + rot, rr = r * (.8 + .26 * hash(seed + i * 1.37));
    for (let k = 0; k < 4; k++) { const a = lerp(a0, a1, k / 4), bump = Math.sin(k / 4 * Math.PI) * .2; P.push([cx + Math.cos(a) * rr * (1 + bump), cy + Math.sin(a) * rr * .8 * (1 + bump)]); }
  }
  return P;
}
function stBillow(cx, cy, r, seed, o = {}) {
  const P = stBillowPts(cx, cy, r, seed, o.rot || 0), [gx, gy] = STREET.glow;
  // the body: dark, cut with fine lines along the drift
  stDark(P, { a: o.a ?? -10, d: 5, w: .55, wash: o.dark ?? '#3E3228', col: '#7E6E5A' });
  // the lit rim on the side facing the glow below (the style's crescent, turned toward the light)
  const lx = gx - cx, ly = gy + 300 - cy, d = Math.hypot(lx, ly) || 1, prev = LIGHT.dir;
  if (o.rim !== false) { LIGHT.dir = [-lx / d, -ly / d]; const C = crescent(P, r * (o.depth ?? .34)); LIGHT.dir = prev; if (C) stField(C, o.lit ?? .32, { a: o.a ?? -10, wash: '#CDBEA2' }); }
  if (o.ink !== false) stLine(P.concat([P[0]]), o.sw ?? 1.2);
}
// The pall is the great chimney's plume: puffs born at its crown every `per` s, rising, then blown left and down over
// the roofs, growing as they go (every live puff is computed from its birth time: pure in t). Drawn as ONE dark mass
// (the union of the puffs), its lowest puffs lit on their undersides by the furnaces, the forms inside it cut in pale
// line (as engravers draw inside a black).
function stPlume(t, x0, y0, r0, per, life, o = {}) {
  const out = [];
  for (let n = Math.floor((t - life) / per) + 1; n <= Math.floor(t / per); n++) {
    const a = t - n * per; if (a < 0 || a > life) continue;
    const x = x0 - (o.v ?? 55) * a - (o.acc ?? 44) * a * a, y = y0 - r0 * .8 - 80 * (1 - Math.exp(-2.2 * a)) + (o.sink ?? 26) * a * a * .45;
    out.push([x + 10 * Math.sin(n * 2.1), y + 12 * Math.sin(n * 1.3), r0 * (1 + 1.15 * Math.sqrt(a)) * (.85 + .3 * hash(n * 1.7 + x0)), a, n + x0]);
  }
  return out;
}
function stSmoke(t, R) {
  const puffs = stPlume(t, 1740, 30, 44, .36, 6.6).concat(stPlume(t, 1160, 112, 30, .42, 3.2, { v: 40, acc: 40, sink: 10 }));
  const half = (p, x) => { const u = (x - p[0]) / p[2]; return Math.abs(u) < 1 ? .8 * p[2] * Math.sqrt(1 - u * u) : -1; };
  // the union's outline, as runs of covered x
  const runs = []; let top = [], bot = [];
  for (let x = -360; x <= W + 120; x += 8) {
    let a = Infinity, b = -Infinity;
    for (const p of puffs) { const h = half(p, x); if (h >= 0) { a = Math.min(a, p[1] - h); b = Math.max(b, p[1] + h); } }
    if (a < b) { top.push([x, a]); bot.push([x, b]); } else if (top.length) { runs.push([top, bot]); top = []; bot = []; }
  }
  if (top.length) runs.push([top, bot]);
  for (const [T0, B0] of runs) stDark(T0.concat(B0.slice().reverse()), { a: -9, d: 5, w: .55, wash: '#3A2E25', col: '#7A6A56' });
  const bottom = x => { let b = -Infinity; for (const p of puffs) b = Math.max(b, p[1] + half(p, x)); return b; };
  // the forms inside, cut in pale line: the lower edge of each puff that isn't the underside of the whole
  for (const p of puffs) {
    const [cx, cy, r, a] = p; if (a < .5 || cy + .8 * r > bottom(cx) - 20) continue;
    const A = []; for (let k = 0; k <= 10; k++) { const an = Math.PI * (.1 + .8 * k / 10); A.push([cx + Math.cos(an) * r, cy + Math.sin(an) * r * .8]); }
    stLine(A, 1.4, '#9C8C74');
  }
  // lit undersides of the lowest puffs (brighter on a blast)
  const [gx, gy] = STREET.glow, prev = LIGHT.dir, fl = R.on ? .45 * R.k : 0;
  for (const p of puffs.slice().sort((m, n) => m[1] - n[1])) {
    const [cx, cy, r, a, id] = p; if (a < .7 || cy + .8 * r < bottom(cx) - 12) continue;
    const P = stBillowPts(cx, cy, r, id * 7.7, id * 1.3 + a * .25), lx = gx - cx, ly = gy + 300 - cy, d = Math.hypot(lx, ly) || 1;
    LIGHT.dir = [-lx / d, -ly / d]; const C = crescent(P, r * .2); LIGHT.dir = prev;
    if (C) { stField(C, (x, y) => clamp(.7 - fl - .45 * clamp((y - cy) / r + .3), .2, 1), { a: -9, wash: '#BFB094', step: 8 }); stLine(C.concat([C[0]]), 1); }
  }
  for (const [T0, B0] of runs) { stLine(T0.filter((_, k) => k % 2 === 0), 1.4); stLine(B0.filter((_, k) => k % 2 === 0), 1.4); }
}
// A turbine blast: ragged tongues of flame out of the stack mouth, and a dark puff punched upward into the pall.
function stBlast(x, y, w, R, key) {
  if (R.k < .06) return;
  const k = R.k, h = w * (.5 + 2.1 * k), j = hash(R.beat * 3.7), F = curvy([[x - w * .44, y], [x - w * .5, y - h * .35], [x - w * .28, y - h * (.62 + .2 * j)], [x - w * .12, y - h * .5], [x + w * .02, y - h], [x + w * .16, y - h * .55], [x + w * .34, y - h * (.72 - .2 * j)], [x + w * .5, y - h * .3], [x + w * .44, y]], 4);
  if (R.age < .6) { const a = R.age / .6; stBillow(x - 50 * a, y - h - 30 - 110 * easeOut(a), w * (.45 + 1.0 * easeOut(a)), key + R.beat * 5.1, { rot: R.beat + a, rim: false }); }
  _paint(F, { wash: '#F8F0DE', ink: null }); stLine(F.slice(2, F.length - 3), 1.1);
  glow(x, y - h * .4, w * 2.6 * (.4 + k), '#E9E08E', .75 * k);
  // the roar itself: broken rings of noise spreading from the stack
  if (R.on && R.age < .38) for (let j = 0; j < 3; j++) {
    const g = R.age / .38, rr = w * (.9 + 1.2 * j + 2.2 * easeOut(g)), A = [];
    for (let q = 0; q <= 14; q++) { const an = Math.PI * (1.05 + .9 * q / 14), zz = q % 2 ? 1.12 : 1; A.push([x + Math.cos(an) * rr * zz, y - h * .3 + Math.sin(an) * rr * .75 * zz]); }
    stLine(A, (2.2 - j * .5) * (1 - g) + .4, ST_INK); stLine(A.map(([ax, ay]) => [ax, ay + 4]), (2 - j * .4) * (1 - g) + .3, '#F2E8D2');
  }
}

// ---------- the mill (the data centre) ----------
function stMill(t, R) {
  const [vx] = STREET.vp, [gx, gy] = STREET.glow, cor = 226, base = 664, flare = R.on ? .55 + .9 * R.k : R.pre ? .5 + .35 * R.k : .5;
  // background stacks, hazy with distance
  for (const [x, top, w] of [[880, 112, 50], [2050, 96, 56], [615, 150, 40], [330, 128, 34]]) {
    const P = [[x - w / 2, base], [x - w * .4, top + 14], [x - w * .52, top], [x + w * .52, top], [x + w * .4, top + 14], [x + w / 2, base]];
    stPiece(P, .82, { a: 90, sw: .9 });
  }
  // the main block, in vertical rule (its masonry courses faint)
  stDark(stBox(760, cor, 2170, base), { a: 90, d: 6, wash: '#40352B', w: .55 });
  // three tiers of lancet windows between buttresses, glowing, racks of machines standing in the light
  const bays = []; for (let x = 790; x < 2140; x += 112) bays.push(x);
  const tiers = [[250, 336], [364, 450], [478, 564], [592, 664]];
  for (const bx of bays) for (const [y0, y1] of tiers) {
    if (Math.abs(bx + 44 - vx) < 190 && y0 < 300) continue;   // the gable stands here
    const P = stLancet(bx + 16, y0, bx + 72, y1, 22);
    _paint(P, { wash: '#F2EAD4', ink: null });
    for (const rx of [bx + 28, bx + 44, bx + 60]) stDark(stBox(rx - 5, y0 + 28, rx + 5, y1), { lines: false, wash: '#5A4C3E' });
    stLine([[bx + 18, y0 + 26], [bx + 70, y0 + 26]], .8);
  }
  for (const [y0, y1] of tiers) for (const x of [950, 1450, 1950]) glow(x, (y0 + y1) / 2, 380, '#E4DB86', .35 * flare);
  // buttresses with pinnacles, their edges catching the glow
  for (const bx of bays.concat([bays[bays.length - 1] + 112])) {
    const x = bx - 6, P = [[x - 12, base], [x - 12, cor - 16], [x, cor - 54], [x + 12, cor - 16], [x + 12, base]];
    stDark(P, { lines: false, wash: '#2E251E' }); stRim(P, gx, gy - 200, 1, 1.5);
  }
  // the cornice and the parapet of gas-turbine stacks
  const C = stBox(750, cor - 14, 2180, cor + 6); stDark(C, { lines: false, wash: '#2E251E' }); stLine([[750, cor - 13], [2180, cor - 13]], 1.3, '#D8CAAE');
  for (const x of [1036, 1226, 1800, 1920, 2040]) {
    const P = [[x - 24, cor - 12], [x - 22, cor - 64], [x - 30, cor - 76], [x + 30, cor - 76], [x + 22, cor - 64], [x + 24, cor - 12]];
    stDark(P, { a: 90, d: 7, wash: '#2E251E' }); stRim(P, gx, gy, 1.1);
  }
  // the gable, with a fan for its rose window
  const G = [[1258, cor + 4], [1258, 96], [vx, -120], [1642, 96], [1642, cor + 4]];
  stDark(G, { a: 90, d: 6, wash: '#2E251E', w: .5 }); stRim(G, gx, gy - 500, 1.2);
  const fx = vx, fy = 140, fr = 84;
  stDark(oval(fx, fy, fr + 16, fr + 16, 0, 40), { lines: false, wash: '#241C16' });
  stField(oval(fx, fy, fr, fr, 0, 40), (x, y) => .12 + .5 * clamp(Math.hypot(x - fx, y - fy) / fr - .45), { wash: '#F4ECDA', passes: [[.25, 0, 6, .9, .5]] });
  glow(fx, fy, 230, '#E4DB86', .75 * flare);
  const spin = t * 2.4 + (R.on ? .9 * (R.beat - 5) + .9 * easeOut(clamp(R.age / .25)) : 0);
  for (let i = 0; i < 5; i++) {
    const a = spin + i / 5 * TAU, B = [];
    for (let k = 0; k <= 6; k++) { const r = fr * (.12 + .86 * k / 6), wv = .08 + .3 * Math.sin(k / 6 * Math.PI); B.push([fx + Math.cos(a - wv * .5) * r, fy + Math.sin(a - wv * .5) * r]); }
    for (let k = 6; k >= 0; k--) { const r = fr * (.12 + .86 * k / 6), wv = .08 + .3 * Math.sin(k / 6 * Math.PI); B.push([fx + Math.cos(a + wv * .9) * r, fy + Math.sin(a + wv * .9) * r]); }
    stDark(B, { lines: false, wash: '#2A211A' }); stLine(B.concat([B[0]]), .8);
  }
  stDark(oval(fx, fy, 16, 16, 0, 16), { lines: false });
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; stLine([[fx + Math.cos(a) * (fr + 3), fy + Math.sin(a) * (fr + 3)], [fx + Math.cos(a) * (fr + 14), fy + Math.sin(a) * (fr + 14)]], 1.4, '#8C7C66'); }
  // the great chimneys flanking the gable
  for (const [x, w, top] of [[1160, 72, 112], [1740, 84, 30]]) {
    const P = [[x - w / 2, base], [x - w * .36, top + 26], [x - w * .56, top + 10], [x - w * .56, top], [x + w * .56, top], [x + w * .56, top + 10], [x + w * .36, top + 26], [x + w / 2, base]];
    stDark(P, { a: 90, d: 7, wash: '#2A211A', w: .5 }); stRim(P, gx, gy + 100, 1.3);
    for (const by of [top + 70, top + 150]) stLine([[x - w * .41, by], [x + w * .41, by]], 1.2, '#8C7C66');
  }
  // the gate at the street's end, blazing
  _paint(stLancet(vx - 34, 548, vx + 34, 664, 30), { wash: '#F6EEDC', ink: null });
  glow(vx, 610, 200, '#E4DB86', .8 * flare);
}

// ---------- the terraces down the side street ----------
// A window (quad Q): dark glass, or lit from t0 (it flickers on) with a neighbour's silhouette at the glass.
function stWindow(Q, t, t0, o = {}) {
  const on = t0 != null && t >= t0, fl = on ? (t - t0 < .12 ? (Math.floor((t - t0) * 50) % 2 ? .4 : 1) : 1) : 0;
  if (!on) {
    stDark(Q, { a: o.a ?? 60, d: 6, wash: '#261E18', w: .45 });
    const [a, b, c, d] = Q; stLine([[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], [(c[0] + d[0]) / 2, (c[1] + d[1]) / 2]], 1, '#6E5E4C'); stLine([[(a[0] + d[0]) / 2, (a[1] + d[1]) / 2], [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2]], 1, '#6E5E4C');
    stLine(Q.concat([Q[0]]), 1.1, '#8C7C66'); return;
  }
  _paint(Q, { wash: fl > .5 ? '#F4EAD2' : '#B8A88E', ink: null });
  const [a, b, c, d] = Q, cx = (a[0] + b[0] + c[0] + d[0]) / 4, h = Math.abs(d[1] - a[1]), w = Math.abs(b[0] - a[0]);
  glow(cx, (a[1] + d[1]) / 2, Math.max(w, h) * 1.3, '#FFD68A', .75 * fl);
  if (o.who && fl > .5) stSleeper(cx + (o.dx || 0) * w, (c[1] + d[1]) / 2 - 2, h, w, o.who, t - t0);
  stLine([[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], [(c[0] + d[0]) / 2, (c[1] + d[1]) / 2]], 1.2);
  stLine([[(a[0] + d[0]) / 2, (a[1] + d[1]) / 2], [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2]], 1.2);
  stLine(Q.concat([Q[0]]), 1.2);
}
// A neighbour at the glass in a nightcap: a silhouette rising into the window as they come to look.
function stSleeper(x, y, h, w, kind, age) {
  const up = easeOut(clamp(age / .35)), sy = h * .045 * (.4 + .6 * up), sx = Math.min(h * .045, w / 9.5), f = kind === 'L' ? -1 : 1;
  const S = P => P.map(([a, b]) => [x + a * sx, y + b * sy]), dk = { lines: false, wash: '#30271F' };
  stDark(S(curvy([[-4.2, 0], [-3.8, -3.0], [0, -4.4], [3.8, -3.0], [4.2, 0]], 4)), dk);
  stDark(S(oval(0, -6.3, 2.2, 2.4, 0, 18)), dk);
  stDark(S(curvy([[-2.4, -6.6], [-1.2, -9.2], [f * 1.8, -10], [f * 3.8, -8.0], [f * 2.6, -8.4], [2.4, -6.8]], 3)), dk);
  stDark(S(oval(f * 3.9, -7.7, .7, .7, 0, 10)), dk);
}
function stTerraceSide(t, side, lit, who, sgn) {
  const n = 9, [lx] = STREET.lamp;
  // roof band (black against the smoke), then the front, its brick lit near the lamp
  const roof = [side(0, 1), side(n, 1), side(n, 1.12, 70), side(0, 1.12, 70)];
  stDark(roof, { a: sgn * 22, d: 6, wash: '#2E251E' }); stRim(roof, STREET.glow[0], STREET.glow[1], 1);
  const front = [side(0, 1), side(n, 1), side(n, 0), side(0, 0)];
  stDark(front, { a: 0, d: 7, wash: '#3A2F26', lw: (x, y) => .3 + 1.1 * Math.exp(-((x - lx) ** 2 + (y - 1000) ** 2) / (2 * 190 ** 2)) + .35 * Math.exp(-((x - STREET.vp[0]) ** 2) / (2 * 120 ** 2)) });
  stLine([side(0, 1), side(n, 1)], 1.8, '#9C8C74');
  for (let s = 1; s <= n; s++) { stLine([side(s, 0), side(s, 1)], 1, ST_INK); stLine([side(s, 1), side(s, 1.12, 70)], 1, '#6E5E4C'); }
  for (let s = 0; s < 7; s++) {
    const a = side === stL ? [s + .3, s + .66, s + .76, s + .92] : [s + .34, s + .7, s + .08, s + .24];
    stWindow(stQuad(side, a[0], a[1], .55, .88), t, lit[s], { who: who[s], a: sgn * 60 });
    stWindow(stQuad(side, a[0], a[1], .12, .4), t, lit['d' + s], { a: sgn * 60 });
    for (const v of [.52, .9]) stLine([side(a[0] - .03, v), side(a[1] + .03, v)], 1.5, '#8C7C66');   // sill and lintel
    stDark(stQuad(side, a[2], a[3], 0, .38), { lines: false, wash: '#221B15' });   // the door
  }
  // chimney stacks and pots along the ridge
  for (let s = 0; s <= 7; s++) {
    const [x, y] = side(s, 1.12, 70), f = stF(s), w = 70 * f, h = 90 * f;
    const P = [[x - w / 2, y + 4], [x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2, y + 4]];
    stDark(P, { lines: false, wash: '#2A211A' }); stRim(P, STREET.glow[0], STREET.glow[1], .9);
    for (let p = -1; p <= 1; p++) stDark(stBox(x + p * w * .3 - w * .1, y - h - 22 * f, x + p * w * .3 + w * .1, y - h), { lines: false, wash: '#2A211A' });
  }
}
function stTerraces(t, R) {
  const L = STREET.times.lights;
  stTerraceSide(t, stL, { 0: L[0], 1: L[3], 2: L[4], 3: L[5], 5: L[5], d1: L[2], d4: L[5] }, { 0: 'L', 1: 'R' }, 1);
  stTerraceSide(t, stR, { 3: L[2], 4: L[4], 5: L[5], 6: L[5], d4: L[5] }, { 3: 'L' }, -1);
}

// ---------- the street ----------
function stRoad(t, R) {
  const [vx, vy] = STREET.vp, [lx, ly] = STREET.lamp;
  const kl = s => { const f = stF(s); return [vx - 380 * f, stY(0, f)]; }, kr = s => { const f = stF(s); return [vx + 590 * f, stY(0, f)]; };
  const pool = (x, y) => Math.exp(-((x - lx) ** 2) / (2 * 190 ** 2) - ((y - ly) ** 2) / (2 * 60 ** 2));
  // pavements
  stDark([stL(-.2, 0), stL(9, 0), kl(9), kl(-.2)], { a: 0, d: 7, lw: (x, y) => .4 + 1.6 * pool(x, y) });
  stDark([stR(-.4, 0), stR(9, 0), kr(9), kr(-.4)], { a: 0, d: 7, w: .5 });
  // the wet cobbled road: dark, with the gate's blaze running down it and a pool under the lamp
  const reflect = (x, y) => { const f = clamp((y - vy) / 480), cx = vx - 70 * f; return Math.exp(-((x - cx) ** 2) / (2 * (10 + 90 * f) ** 2)); };
  stDark([kl(-.2), kl(9), kr(9), kr(-.4)], { a: 0, d: 5, lw: (x, y) => .35 + 2.2 * reflect(x, y) + 1.4 * pool(x, y) });
  stLine([kl(-.2), kl(9)], 1.4, '#B8A88E'); stLine([kr(-.4), kr(9)], 1.2, '#8C7C66');
  // the blaze on the wet cobbles: broken pale strokes, widening toward us
  for (let s = .05, i = 0; s < 7; s += .1 + s * .05, i++) {
    const f = stF(s), y = stY(0, f) - 2, cx = vx - 60 * f; if (y > H + 30) continue;
    for (let j = 0; j < 3; j++) { const hw = (8 + 90 * f) * (.35 + .65 * hash(i * 3.1 + j)), ox = (hash(i * 7.3 + j) - .5) * 70 * f; stLine([[cx + ox - hw, y + j * 4 * f], [cx + ox + hw, y + j * 4 * f]], .6 + 2.2 * f * (1 - j * .25), '#E8DCC2'); }
  }
  // cobble courses, crowding toward the end of the street
  for (let s = .1; s < 6; s += .22 + s * .06) {
    const a = kl(s), b = kr(s), f = stF(s); if (a[1] > H + 40) continue;
    const P = []; for (let k = 0; k <= 10; k++) P.push([lerp(a[0], b[0], k / 10), lerp(a[1], b[1], k / 10) + 3 * f * Math.sin(k * 1.9 + s * 7)]);
    stLine(P, 1, '#1E1812');
  }
}

// ---------- the gas lamp at the corner ----------
function stLamp(t, R) {
  const [x, y0, top] = STREET.lamp, fl = .9 + .1 * Math.sin(t * 13) * Math.sin(t * 7.3);
  glow(x, top + 10, 420, '#FFC870', .3 * fl);
  stDark([[x - 7, y0], [x - 5, top + 40], [x + 5, top + 40], [x + 7, y0]], { lines: false, wash: '#221B15' });
  stDark(stBox(x - 13, y0 - 30, x + 13, y0), { lines: false, wash: '#221B15' });
  stLine([[x - 22, top + 34], [x + 22, top + 34]], 2.4);   // the ladder bar
  const Lp = [[x - 18, top + 30], [x - 24, top - 10], [x + 24, top - 10], [x + 18, top + 30]];
  _paint(Lp, { wash: '#FBF4E4', ink: null });
  stLine(Lp.concat([Lp[0]]), 1.4); stLine([[x, top - 10], [x, top + 30]], .9);
  stDark([[x - 30, top - 10], [x, top - 34], [x + 30, top - 10]], { lines: false, wash: '#221B15' });
  glow(x, top + 10, 130, '#FFD68A', .9 * fl);
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + .1, r0 = 42, r1 = 60 + 30 * hash(i); stLine([[x + Math.cos(a) * r0, top + 10 + Math.sin(a) * r0], [x + Math.cos(a) * r1, top + 10 + Math.sin(a) * r1]], .8, '#D8CAAE'); }
}

// ---------- his house ----------
// Brick in shadow: the mortar courses show where light reaches (his window, the lamp at the corner). Drawn within a
// box, on the global grid (so a patch redrawn over his legs matches).
const stHouseLight = (x, y) => .95 * Math.exp(-((x - 1040) ** 2) / (2 * 150 ** 2) - ((y - 720) ** 2) / (2 * 300 ** 2)) + .75 * Math.exp(-((x - 560) ** 2) / (2 * 250 ** 2) - ((y - 560) ** 2) / (2 * 240 ** 2));
function stBrick(x0, y0, x1, y1) {
  stDark(stBox(x0, y0, x1, y1), { lines: false, wash: '#3A2F26' });
  for (let y = Math.ceil(y0 / 15) * 15; y < y1; y += 15) {
    const row = Math.round(y / 15);
    for (let x = Math.floor(x0 / 44) * 44 + (row % 2) * 22; x < x1; x += 44) {
      const a = Math.max(x, x0), b = Math.min(x + 42, x1), lk = stHouseLight(x + 21, y);
      const w = .25 + 1.3 * lk + .25 * hash(x * .37 + y * 1.3); if (w < .35 || b - a < 4) continue;
      stLine([[a, y], [b, y + .5]], w, ST_CUT);
      if (x + 42 < x1 && y + 13 < y1 && x + 42 > x0) stLine([[x + 43, y + 1], [x + 43, y + 13]], w * .8, ST_CUT);
    }
  }
}
function stHouseFront(t, R) {
  const { x0, x1, eaves, ridge } = STREET.house, Wn = STREET.win;
  // the neighbour's front (darker) and his
  stDark(stBox(-140, eaves, x0, 1180), { lines: false, wash: '#30271F' });
  for (let y = eaves + 15; y < 1180; y += 15) stLine([[-140, y], [x0, y]], .45, '#6E5E4C');
  stBrick(x0, eaves, x1, 1180);
  glow(1060, 760, 260, '#FFC870', .28);
  stLine([[x0, eaves], [x0, 1180]], 1.6); stLine([[x1, eaves - 6], [x1, 1180]], 2, '#B8A88E');
  // the neighbour's upstairs window (lights up on the second roar)
  stWindow([[-60, Wn.y0], [120, Wn.y0], [120, Wn.y1], [-60, Wn.y1]], t, STREET.times.lights[1], { who: 'R', dx: .08 });
  stPiece(stBox(-72, Wn.y1, 132, Wn.y1 + 22), .5, { a: 0, sw: 1 });
  stPiece(stBox(-72, Wn.y0 - 30, 132, Wn.y0), .55, { a: 0, sw: 1 });
  // downstairs: his front door with a fanlight, the parlour window, cut off by the frame
  stDark(stBox(792, 860, 930, 1180), { a: 90, d: 9, wash: '#241C16', w: .5 });
  const fan = []; for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI; fan.push([861 + Math.cos(a) * 69, 860 + Math.sin(a) * 50]); }
  stField(fan, .75, { a: 0, wash: '#8E7E68' }); stLine(fan.concat([fan[0]]), 1.2);
  for (let i = 1; i < 5; i++) { const a = Math.PI + i / 5 * Math.PI; stLine([[861, 860], [861 + Math.cos(a) * 69, 860 + Math.sin(a) * 50]], 1); }
  stPiece(stBox(782, 850, 940, 866), .45, { a: 0, sw: 1 });
  stWindow([[Wn.x0, 880], [Wn.x1, 880], [Wn.x1, 1180], [Wn.x0, 1180]], t, null);
  stPiece(stBox(Wn.x0 - 14, 852, Wn.x1 + 14, 882), .45, { a: 0, sw: 1 });
  // roof, gutter and chimney stacks, black against the smoke
  const roof = [[-140, eaves], [x1 + 10, eaves], [x1 - 14, ridge], [-140, ridge]];
  stDark(roof, { a: -16, d: 6, wash: '#2A211A' });
  for (let y = ridge + 12; y < eaves; y += 12) stLine([[-140, y], [x1 - 14 + (y - ridge) * .33, y]], .6, '#6E5E4C');
  stLine([[-140, ridge + 1], [x1 - 14, ridge + 1]], 1.4, '#C8BA9E');
  stPiece(stBox(-140, eaves - 6, x1 + 14, eaves + 10), .6, { a: 0, sw: 1.2 });
  for (const [cx, w] of [[x0, 130], [x1 - 40, 100]]) {
    const S = stBox(cx - w / 2, 58, cx + w / 2, ridge + 6);
    stDark(S, { lines: false, wash: '#2A211A' }); stRim(S, STREET.glow[0], STREET.glow[1], 1.3);
    stDark(stBox(cx - w / 2 - 8, 46, cx + w / 2 + 8, 62), { lines: false, wash: '#2A211A' }); stLine([[cx - w / 2 - 8, 47], [cx + w / 2 + 8, 47]], 1.2, '#C8BA9E');
    for (let p = 0; p < 3; p++) {
      const px = cx - w / 2 + 18 + p * (w - 36) / 2, Pp = [[px - 11, 48], [px - 9, 8], [px - 13, 2], [px + 13, 2], [px + 9, 8], [px + 11, 48]];
      stDark(Pp, { lines: false, wash: '#2A211A' }); stRim(Pp, STREET.glow[0], STREET.glow[1], 1);
    }
  }
}
// His window: the dark room behind him (a candle-lit glimpse of it).
function stRoom(t, R) {
  const Wn = STREET.win;
  stDark(stBox(Wn.x0, Wn.y0, Wn.x1, Wn.y1), { a: 90, d: 11, wash: '#2E251E', col: '#4E4034', w: .9 });
  // the brass bed rail, and a picture on the wall
  stLine([[Wn.x0 + 6, 648], [Wn.x0 + 150, 644]], 2.4, '#8C7A62'); stLine([[Wn.x0 + 60, 648], [Wn.x0 + 60, 700]], 2, '#8C7A62');
  const pic = stBox(Wn.x1 - 112, 420, Wn.x1 - 42, 500); stField(pic, .8, { a: 45, wash: '#7E6E5A' }); stLine(pic.concat([pic[0]]), 2, '#9A8A72');
}
// The wall under his sill, drawn again over him (he stands behind it), then the sill, lintel, reveals and casements.
function stWindowFront(t, R) {
  const Wn = STREET.win, rat = R.on ? R.shake : 0, jig = s => (hash(Math.floor(t * 30) * 1.3 + s) - .5) * 18 * rat;
  stBrick(Wn.x0 - 60, Wn.y1, Wn.x1 + 60, 852);
  stPiece(stBox(-140, 792, 960, 810), .45, { a: 0, sw: 1 });   // the string course
  // lintel with a keystone, the reveal, the sill
  stField([[Wn.x0, Wn.y0], [Wn.x0 + 14, Wn.y0 + 12], [Wn.x0 + 14, Wn.y1], [Wn.x0, Wn.y1]], .55, { a: 90, wash: '#A8977C' });
  stPiece([[Wn.x0 - 22, Wn.y0 - 36], [Wn.x1 + 22, Wn.y0 - 36], [Wn.x1 + 22, Wn.y0], [Wn.x0 - 22, Wn.y0]], .3, { a: 0, sw: 1.3 });
  stPiece([[540, Wn.y0 - 42], [580, Wn.y0 - 42], [572, Wn.y0 + 6], [548, Wn.y0 + 6]], .12, { a: 0, sw: 1.2 });
  stPiece([[Wn.x0 - 26, Wn.y1], [Wn.x1 + 26, Wn.y1], [Wn.x1 + 34, Wn.y1 + 26], [Wn.x0 - 34, Wn.y1 + 26]], .22, { a: 0, sw: 1.3 });
  stDark(stBox(Wn.x0 - 30, Wn.y1 + 26, Wn.x1 + 30, Wn.y1 + 38), { lines: false, wash: '#241C16' });
  // the casements, swung open outward, rattling on the roars
  for (const s of [-1, 1]) {
    const hx = s < 0 ? Wn.x0 : Wn.x1, sw = 70 + jig(s * 3), grow = 1 + .1 * (sw / 70);
    const Q = [[hx, Wn.y0 + 2], [hx + s * sw, Wn.y0 - 14 * grow], [hx + s * sw, Wn.y1 + 14 * grow], [hx, Wn.y1 - 2]];
    stField(Q, .3, { a: s * 60, wash: '#CFC0A4' });
    const G = [[hx + s * 8, Wn.y0 + 12], [hx + s * (sw - 8), Wn.y0 - 2], [hx + s * (sw - 8), Wn.y1 + 2], [hx + s * 8, Wn.y1 - 12]];
    stDark(G, { a: -s * 35, d: 6, wash: '#3A2F26', w: .5 });
    for (const k of [1 / 3, 2 / 3]) stLine([[G[0][0], lerp(G[0][1], G[3][1], k)], [G[1][0], lerp(G[1][1], G[2][1], k)]], 2.2, '#C8BA9E');
    stLine([[(G[0][0] + G[1][0]) / 2, (G[0][1] + G[1][1]) / 2], [(G[2][0] + G[3][0]) / 2, (G[2][1] + G[3][1]) / 2]], 2.2, '#C8BA9E');
    stLine(Q.concat([Q[0]]), 1.4); stLine(G.concat([G[0]]), 1);
    stLine([[G[0][0] + s * 12, G[0][1] + 44], [G[0][0] + s * 26, G[0][1] + 16]], 2.4, '#EFE4CF');   // a glint
    if (rat > .15) for (const k of [.18, .5, .82]) {   // rattle marks
      const y = lerp(Wn.y0, Wn.y1, k), x = hx + s * (sw + 14), ww = 1.4 * rat + .5;
      stLine(through([[x, y - 18], [x + s * 4, y], [x, y + 18]], 4), ww, '#E8DCC2'); stLine(through([[x + s * 12, y - 26], [x + s * 17, y], [x + s * 12, y + 26]], 4), ww * .8, '#E8DCC2');
    }
  }
}
function stCandle(t, R) {
  const x = 420, y = STREET.win.y1, gust = R.on ? R.k : .15 * R.k;
  const fl = .9 + .1 * Math.sin(t * 17) + .06 * Math.sin(t * 29), lean = -1.1 * gust + .08 * Math.sin(t * 5), h = 26 * fl * (1 - .35 * gust);
  glow(x, y - 90, 300, '#FFC870', .45 * fl);
  stPiece(oval(x, y - 4, 26, 6, 0, 20), .45, { a: 0, sw: 1 });
  stPiece([[x - 34, y - 2], [x - 26, y - 14], [x - 20, y - 4]], .45, { a: 0, sw: 1 });   // the chamberstick's handle
  stPiece(stBox(x - 7, y - 58, x + 7, y - 6), .06, { a: 90, sw: 1 });
  const F = curvy([[x + lean * 22, y - 58 - h], [x + 6, y - 66], [x, y - 58], [x - 6, y - 66]], 4);
  _paint(F, { wash: '#FDF8EC', ink: null }); stLine(F.concat([F[0]]), .8);
  glow(x + lean * 8, y - 72, 110, '#FFD68A', 1.0 * fl * (1 - .4 * gust));
}

// ---------- him ----------
// The commuter rig's body transform, replicated (so the pillow and his hands land on him).
function stBodyXf(x, y, u, o) {
  const sq = ((o.sq || 0) + (o.take || 0)) * .55, dy = (o.dy || 0) * 1.2 * u;
  translate(x + (o.dx || 0) * u, y + dy); if (o.rot) rotate(o.rot); scale(1 + sq * .5, 1 - sq);
}
// Where the rig puts a front arm's wrist, and its angle (body space px).
function stArm(spec, s, u) {
  const [hx, hy, bend] = spec, root = [s * 1.9, -7.15], dx = hx - root[0], dyy = hy - root[1], L = Math.hypot(dx, dyy) || 1;
  const sd = bendSide(-dyy / L, dx / L, s, .3), nx = -dyy / L * sd, ny = dx / L * sd;   // (out and down, swinging through straight: core.js bendSide)
  const C = through(U([root, [root[0] + dx * .5 + nx * L * bend, root[1] + dyy * .5 + ny * L * bend], [hx, hy]], u), 10), e = C[C.length - 1], p = C[C.length - 2];
  return { tip: e, ang: Math.atan2(e[1] - p[1], e[0] - p[0]) };
}
// The pillow: a soft slab (s along it, v across), bent from a hug at his chest (k 0) to clamped over his head (k 1).
// sq squeezes its ends onto his ears; headRot follows the head's tilt.
function stPillow(k, sq, headRot, u) {
  const at = (s, v) => {
    s *= 1 + .07 * Math.abs(v) ** 4; v *= 1 + .2 * Math.abs(s) ** 6;   // the corners poke out
    const th0 = 1.0 + .16 * (1 - s ** 4) - .32 * Math.exp(-(((Math.abs(s) - .48) / .14) ** 2));   // puffed, pinched by the hands
    const hx = s * 2.7, hy = -6.95 + v * th0 * .98;
    const th = -Math.PI / 2 + s * (Math.PI / 2 + .3), r = 2.7 + v * .64 * (1 + .32 * (1 - s * s)) - .3 * sq * Math.abs(s) ** 3;
    let cx = Math.cos(th) * r * 1.04, cy = -10.55 + Math.sin(th) * r * 1.12;
    const ear = clamp((Math.abs(s) - .8) / .2); cx += Math.sign(s) * ear * (.3 + .32 * v); cy += ear * (.12 + .12 * v);
    const c = Math.cos(headRot), si = Math.sin(headRot), rx = cx, ry = cy + 8.2;
    cx = rx * c - ry * si; cy = rx * si + ry * c - 8.2;
    return [lerp(hx, cx, k) * u, (lerp(hy, cy, k) - 1.6 * 4 * k * (1 - k)) * u];
  };
  const P = [];
  for (let i = 0; i <= 16; i++) P.push(at(-1 + 2 * i / 16, 1));
  for (let i = 1; i < 5; i++) P.push(at(1, 1 - 2 * i / 5));
  for (let i = 0; i <= 16; i++) P.push(at(1 - 2 * i / 16, -1));
  for (let i = 1; i < 5; i++) P.push(at(-1, -1 + 2 * i / 5));
  return { P, at };
}
function stHim(t, lt, R) {
  const [x, y, u] = STREET.him, T_ = STREET.times, sw = clamp(u / 20, .55, 2.2);
  // acting: bleary and swaying → eyes to the mill on the rumble → the take on the roar → pillow over the ears, eyes
  // screwed shut, teeth gritted, squeezed on every blast → gives up and stares at us, dead-eyed
  const mood = emotions(lt, [
    [0, 'sleepy', { emote: null }],
    [T_.rumble + .05, 'nervous', { emote: null }],
    [T_.roar, 'surprised', { emote: null }],
    [T_.clamp[1] - .02, 'angry', { emote: null, eyes: 'squeeze', mouth: 'teeth' }],
    [T_.glare, 'bored', { emote: null }],
  ], { take: .8 });
  mood.lookX = lt < T_.rumble + .05 ? .12 + .1 * Math.sin(lt * 1.3) : lt < T_.glare ? .85 : 0;
  mood.lookY = lt < T_.rumble + .05 ? .3 : lt < T_.glare ? -.45 : .05;
  if (lt < T_.rumble) { mood.rot = .035 * Math.sin(lt * 1.9); mood.dy = (mood.dy || 0) + .08 * Math.sin(lt * 3.8); }
  if (lt > T_.rumble && lt < T_.roar) mood.dx = 0;
  mood.dy = Math.max(mood.dy || 0, -.3); mood.sq = Math.max(mood.sq || 0, -.06);   // the take: his head stays under the lintel
  // the squeeze on each blast once the pillow is on
  const clampK = ease(seg(lt, T_.clamp[0], T_.clamp[1])), sqz = clampK > .9 ? R.k : 0;
  const hug = { L: [-1.25, -6.6, .45, 'none', 1], R: [1.3, -6.4, .45, 'none', 1] };
  const cl = { L: [-3.25 + .25 * sqz, -9.1, .6, 'none', 1], R: [3.25 - .25 * sqz, -9.1, .6, 'none', 1] };
  const mix = (a, b) => a.map((v, i) => typeof v === 'number' ? lerp(v, b[i], clampK) : v);
  const pose = { L: mix(hug.L, cl.L), R: mix(hug.R, cl.R) };
  const o = { ...mood, view: 'front', pose, seated: true, lanyard: false, pack: false, buds: false, noShadow: true, boilKey: 'him', seed: 2,
    cm: { coat: '#C9CFD6', coatDk: '#7E8A98', coatLt: '#E4E8EC', fur: '#D4D9DF', furDk: '#A4AEB8' } };
  o.tilt = (lt >= T_.clamp[1] ? .05 * sqz : 0) + (lt >= T_.glare ? -.05 * ease(seg(lt, T_.glare, T_.glare + .5)) : 0);
  commuter(x, y, u, o);
  // over the rig, in its body space: the bags under his eyes, the pillow, his hands on it, his pyjama buttons
  push(); stBodyXf(x, y, u, o);
  if (clampK > .6) for (const by of [-7.4, -6.6]) piece(oval(0, by * u, .13 * u, .13 * u, 0, 12), '#E8E4DC', { sw: sw * .5, key: 'stbtn' + by });
  const headRot = (o.tilt || 0) + (o.rot || 0) * -.4, hx = clamp(o.lookX || 0, -1, 1) * .18;
  push(); translate(0, -8.2 * u); rotate(headRot); translate(0, 8.2 * u);
  for (const s of [-1, 1]) {
    const ex = (s * .85 + hx) * u, bag = [];
    for (let i = 0; i <= 8; i++) { const a = i / 8; bag.push([ex + (a - .5) * .92 * u, (-10.24 + .26 * Math.sin(a * Math.PI)) * u]); }
    for (let i = 8; i >= 0; i--) { const a = i / 8; bag.push([ex + (a - .5) * .7 * u, (-10.22 + .14 * Math.sin(a * Math.PI)) * u]); }
    stDark(bag, { lines: false, wash: '#2E221A' });
    stLine(bag.slice(1, 8), 1.1, '#A88A70');
  }
  pop();
  const pl = stPillow(clampK, sqz, headRot, u);
  piece(pl.P, '#F1ECE2', { sw: sw * 1.1, shade: '#C8C0B2', depth: .4 * u, key: 'stpillow' });
  dline([pl.at(-.82, 0), pl.at(-.3, .06), pl.at(.3, .06), pl.at(.82, 0)], sw * .6, NOIR.ink, .5);   // the seam
  for (const s of [-1, 1]) { dline([pl.at(s * .7, -.85), pl.at(s * .56, -.25)], sw * .55, NOIR.ink); dline([pl.at(s * .74, .9), pl.at(s * .6, .35)], sw * .55, NOIR.ink); }
  for (const s of [-1, 1]) {
    const a = stArm(s < 0 ? pose.L : pose.R, s, u);
    hand(a.tip[0] + Math.cos(a.ang) * .05 * u, a.tip[1] + Math.sin(a.ang) * .05 * u, a.ang, .84 * u, { pose: clampK > .5 ? 'open' : 'relax', col: CM_BASE.skin, sw, mirror: s < 0, key: 'sth' + s });
  }
  pop();
}

// ---------- the smoke that rolls across (the transitions), in screen space ----------
// side -1: smoke fills everything left of X (the front bulges right); side 1: everything right of X. Like the pall:
// one dark mass, its front a column of rolling billows lit thinly on their leading edges, inner forms cut in pale line.
function stSmokeWall(X, side, t) {
  const lobes = [];
  for (let i = -1; i < 10; i++) lobes.push([X - side * (55 * Math.sin(i * 1.7 + t * 1.6) + 40 * hash(i)), i * 124 + 30 * Math.sin(i * 2.1), 118 + 52 * hash(i * 3.3), i]);
  const hw = (l, y) => { const u = (y - l[1]) / l[2]; return Math.abs(u) < 1 ? .82 * l[2] * Math.sqrt(1 - u * u) : -1; };
  const front = []; for (let y = -140; y <= H + 140; y += 8) { let f = X; for (const l of lobes) { const h = hw(l, y); if (h >= 0) f = side < 0 ? Math.max(f, l[0] + h) : Math.min(f, l[0] - h); } front.push([f, y]); }
  const far = side < 0 ? -800 : W + 800;
  stDark([[far, -140]].concat(front, [[far, H + 140]]), { a: -12, d: 5, w: .55, wash: '#34291F', col: '#76664F' });
  // the forms behind the front
  for (const [lx, ly, r, i] of lobes) {
    const bx = lx + side * r * 1.1, A = [];
    for (let k = 0; k <= 10; k++) { const an = (side < 0 ? 0 : Math.PI) + (side < 0 ? 1 : -1) * Math.PI * (-.42 + .84 * k / 10); A.push([bx + Math.cos(an) * r * .82, ly + 50 + Math.sin(an) * r]); }
    stLine(A, 1.5, '#9C8C74');
  }
  // lit leading edges
  const prev = LIGHT.dir; LIGHT.dir = [side < 0 ? 1 : -1, .35];
  for (const [lx, ly, r, i] of lobes) {
    const P = stBillowPts(lx, ly, r, i * 5.3 + 11, t * .6 * side + i).map(([x, y]) => [lx + (x - lx) * 1.02, y]);
    LIGHT.dir = [side < 0 ? -1 : 1, -.35]; const C = crescent(P, r * .2); LIGHT.dir = [side < 0 ? 1 : -1, .35];
    if (C) { stField(C, .35, { a: -12, wash: '#C4B498' }); stLine(C.concat([C[0]]), 1); }
  }
  LIGHT.dir = prev;
  stLine(front.filter((_, k) => k % 2 === 0), 1.5);
}

// ---------- the shot ----------
LOOPS.street = t => {
  look('engrave');
  const lt = mt(t), T_ = STREET.times, R = stRoar(lt);
  LIGHT.dir = [.62, -.78];   // the key: the glow at the end of the street, over his left shoulder (screen right)
  const pushK = ease(seg(lt, .6, T_.len)), glareK = ease(seg(lt, T_.glare, T_.glare + 1));
  const [sx, sy] = R.shake > .02 ? shakeXY(lt, 9 * R.shake) : [0, 0];
  const tilt = ease(seg(lt, .5, 2.1)), cx = lerp(900, 760, pushK) - 30 * glareK, cy = lerp(420, 540, tilt) - 15 * pushK, zoom = lerp(1, 1.12, pushK) + .07 * glareK;
  const kin = seg(lt, T_.in[0], T_.in[1]), Xin = lerp(W + 300, -450, .3 * easeOut(kin) + .7 * ease(kin)), Xout = lerp(W + 500, -700, ease(seg(lt, T_.out[0], T_.out[1])));
  const covered = lt < T_.in[0] + .02 || lt >= T_.out[1] - .01;
  if (!covered) {
    camBegin(cx + sx, cy + sy, zoom);
    stSky(lt, R);
    stMill(lt, R);
    stSmoke(lt, R);
    for (const [x, i] of [[1036, 0], [1226, 1], [1800, 2], [1920, 3]]) stBlast(x, 226 - 80, 58, R, 40 + i);
    stTerraces(lt, R);
    stRoad(lt, R);
    stLamp(lt, R);
    stHouseFront(lt, R);
    stRoom(lt, R);
    stHim(lt, lt, R);
    stWindowFront(lt, R);
    stCandle(lt, R);
    camEnd();
  }
  if (lt < T_.in[1]) stSmokeWall(Xin, -1, lt);
  if (lt > T_.out[0]) stSmokeWall(Xout, 1, lt);
};
LOOPS.street.len = STREET.times.len;

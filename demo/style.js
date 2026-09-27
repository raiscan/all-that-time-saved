// style.js: the drawing layer. Characters and sets describe WHAT to draw (closed shapes, detail lines, limbs); this
// file decides HOW, in one of two looks:
//   ink   neo-noir rubber hose, early Flash: flat fills, thick even outlines (finer inside), cel shading from the key
//         light, rim light on dark figures, boiling linework.
//   card  stop-motion cut-out: matte card pieces with scissor-cut edges, a pale cut edge and a drop shadow under every
//         piece, limbs as card segments on brass split pins, nothing boils (it's the same paper every frame), motion steps
//         on twos, and it's rigid and rooted: a puppet is nudged a little only when a hand moves it (then stays put),
//         its parts turn and slide rather than squash, and a piece nobody moves is pixel-identical frame to frame.
//   doodle  blue biro on lined notebook paper: loose sketched lines (straight edges as several imperfect overshooting
//           strokes), coloured-pencil colouring, big areas in sparse tilted-pencil shading (sideShade; o.side / o.density).
//   flip    the good future: pencil animation, every frame a fresh trace of the last (think a-ha's Take On Me): graphite
//           lines and neat coloured-pencil shading over a pale opaque tint, all re-traced on twos so the pencil
//           shimmers while the drawing stays on model. No page flips: the flipbook is how it's made, not what you see.
//   engrave a Victorian engraving, hatched by tone (dark = dense crosshatch) on sepia paper, static.
//   bank    the look of money and power: banknote intaglio. Wavy engraved line shading in one banknote ink (BANK.ink) over
//           dull, desaturated colour (BANK.colour, BANK.sat; colour 0 = pure one-ink), on tinted security paper, guilloche rosettes and borders (guilloche()), static like print.
//   xerox   the bad future: a photocopy of a photocopy, printed riso (three drums: blue, fluoro pink, yellow). Crushed toner blacks, halftone dots for mid-tones, paper white
//           for lights, one spot colour (XEROX.spot), and the marks a print carries, the same every frame (xeroxGrit()).
// Pick the page's look with window.STYLE_MODE ('ink' default; a dev page's ?look= sets it); a shot switches look for
// itself with look('card') at its start (the film's chapters do, shot by shot).
const STYLE = { mode: window.STYLE_MODE || 'ink' };
STYLE.card = STYLE.mode === 'card';

const NOIR = {
  ink: '#16121A', char: '#231E28', shadow: '#342E3A', mid: '#5E5864', light: '#A9A2A0', pale: '#D6CEC2', cream: '#EFE6D6',
  neonC: '#3FE0D0', neonM: '#FF4FA0', lamp: '#FFD98A', red: '#D8343F',
  pastSky: '#F2E4C6', pastRose: '#E7B39B', pastMint: '#A9CBB4', pastTeal: '#7FB0A8', pastInk: '#4A3A34', pastGold: '#F2CE7E',
  bunker: '#4B4A46', bunkerDk: '#302F2D', bunkerLt: '#6D6A62', moss: '#5C6450', rust: '#7A4A34',
};

// ---------- brushes ----------
const _kitBrushes = defineBrushes;
defineBrushes = function () {
  _kitBrushes();
  brush.add('flash', { type: 'default', weight: 5, scatter: .05, sharpness: .95, grain: 60, opacity: 250, spacing: .12, pressure: [1.05, .95], rotate: 'natural', noise: .03 });
  brush.add('graphite', { type: 'default', weight: 2.6, scatter: .12, sharpness: .55, grain: 9, opacity: 200, spacing: .18, pressure: [1.2, .7], rotate: 'natural', noise: .3 });
  brush.add('side', { type: 'default', weight: 7, scatter: .6, sharpness: .12, grain: 3, opacity: 60, spacing: .35, pressure: [.8, 1.1], rotate: 'natural', noise: .7 });   // a pencil held on its side
  brush.add('cpen', { type: 'default', weight: 1.9, scatter: .1, sharpness: .5, grain: 7, opacity: 170, spacing: .2, pressure: [1.1, .8], rotate: 'natural', noise: .35 });
  brush.add('flashfine', { type: 'default', weight: 3, scatter: .04, sharpness: .95, grain: 60, opacity: 240, spacing: .12, pressure: [1.1, .85], rotate: 'natural', noise: .03 });
  // card's pen: a rotring's weight, but an even inked line at 4K (the rotring's dab gaps, scatter and pressure swell bead
  // up on a short thick face line: lashes, creases, nose lines). Dense, faint dabs: they build to solid on a face line
  // and stay as light as the rotring's on a hairline seam.
  // the bank look's fine engraving pens (4K detail levels; bankBrush picks one per line width): the rotring (as scaled by
  // the kit) at about its own dab spacing but more opaque the finer the line, so a sub-pixel hairline prints as dark as the
  // rotring's lines (at 4K supersampled its dabs' sub-pixel gaps close in the downsample: a whole line). Closer dabs cost
  // more than they show: a frame's time goes on its dabs.
  for (const [nm, sp, op] of [['bankfine', .4, 255], ['bankfine2', .45, 235], ['bankfine3', .5, 215], ['bankfine4', .6, 215]])
    brush.add(nm, { type: 'default', weight: .75, scatter: .25, sharpness: .7, grain: .95, opacity: op, spacing: sp, pressure: { curve: [.35, .2], min_max: [1.3, 1] }, rotate: 'natural', noise: .3 });
  brush.add('cardpen', { type: 'default', weight: 1.05, scatter: .05, sharpness: .95, grain: 60, opacity: 90, spacing: .12, pressure: { curve: [.1, .1], min_max: [1.06, .96] }, rotate: 'natural', noise: 0 });
};

// ---------- per-frame state ----------
// XF: +1, or -1 while a flipped character draws (so light-dependent shading mirrors correctly).
// STEP: the stop-motion step (12 a second).
let XF = 1, STEP = 0;
const LIGHT = { dir: [-.62, -.78] };   // unit vector from the subject TOWARD the key light (upper left by default)
const _kitDrawWorld = drawWorld;
drawWorld = function (t) { STEP = Math.floor(t * 12 + 1e-6); NUDGE_BASE = curAffine(); if (!RISO_SHOT.done) risoWrapShots(); RISO_SHOT.length = 0; RISO_PAPER = null; look(LOOK_DEFAULT); XF = 1; LIGHT.dir = [-.62, -.78]; if (!BANK_RIGS_DONE) bankWrapRigs(); BANK_FIGD = 0; BANK_VIG = null; _kitDrawWorld(t); };
const LOOK_DEFAULT = STYLE.mode;
// Switch look (for the rest of this frame): sets the mode and how the linework boils (card and engrave: not at all;
// doodle: 8 drawings a second; ink: the kit's 12).
function look(mode) {
  STYLE.mode = mode; STYLE.card = mode === 'card';
  if (mode === 'xerox') RISO_PAPER = curAffine();   // (a printed object's dots belong to the frame it's printed in: risoScreen)
  if (mode === 'card' && typeof GRAIN_K !== 'undefined') GRAIN_K = Math.min(GRAIN_K, .2);   // card carries its own texture
  BOILN = mode === 'bank' || mode === 'card' || mode === 'engrave' ? 0 : Math.floor(T * (mode === 'doodle' ? 8 : mode === 'flip' ? 12 : BOIL));   // (bank: still: its lines never redraw)
}
// Motion time: on twos for the hand-made looks (card, doodle), continuous otherwise. Shots pass their t through this.
const mt = t => STYLE.card || STYLE.mode === 'doodle' || STYLE.mode === 'flip' ? Math.floor(t * 12 + 1e-6) / 12 : t;
// A hand-placed nudge for a card puppet or piece (px): where the animator's hand left it. It changes only when the
// puppet is moved, and holds while it stands: in real stop-motion a puppet nobody touches doesn't move (the user,
// 2026-09-25: card pieces stay rooted, pixel-identical while still). "Moved" = its placement changed: the transform in
// force when the rig calls nudge() (its x, y, dy and whatever the shot wraps it in), taken relative to the camera, so a
// camera move doesn't count and a puppet carried across the set re-settles every step. Its own posing (arms, face,
// breath) happens after, on the puppet.
const curAffine = () => { const m = p5.instance._renderer.states.uModelMatrix.mat4; return [m[0], m[1], m[4], m[5], m[12], m[13]]; };
const drawScale = () => { const [a, b, c, d] = curAffine(); return Math.sqrt(Math.abs(a * d - b * c)) || 1; };   // screen px (1080p) per local unit here
// A rig's body squash (a posture's slump or stretch, a take, a bot's accent), as the look allows: card is rigid cut card
// and doesn't squash (its puppets move by turning and sliding their pieces), every other look keeps it.
const cardSq = v => STYLE.card ? 0 : v;
// A slowly drifting value (a sway, a lean) held in steps of q in card, so the piece it moves sits still between clean
// moves instead of creeping a fraction of a pixel every step; unchanged in other looks.
const cardHold = (v, q) => STYLE.card ? Math.round(v / q) * q : v;
let NUDGE_BASE = null;   // the frame's own transform (placement is measured from it when no camera is up)
{ const kitCam = camBegin; camBegin = function (...a) { kitCam(...a); CAM.m = curAffine(); }; }
function placeSig() {
  const [a, b, c, d, e, f] = CAM && CAM.m ? CAM.m : NUDGE_BASE || [1, 0, 0, 1, 0, 0], M = curAffine(), det = a * d - b * c || 1;
  const A = d / det, B = -b / det, C = -c / det, D = a / det, E = (c * f - d * e) / det, F = (b * e - a * f) / det;
  const rel = [A * M[0] + C * M[1], B * M[0] + D * M[1], A * M[2] + C * M[3], B * M[2] + D * M[3], A * M[4] + C * M[5] + E, B * M[4] + D * M[5] + F];
  // (quantised: a move under ~.1 px isn't a touch; the odd offset keeps round placements off the rounding boundaries)
  let h = 17; rel.forEach((v, i) => { h = (h * 131 + Math.round(v / (i < 4 ? 1e-3 : .1) + .2371)) % 1000003; });
  return h;
}
function nudge(key, amt = 1.2) {
  if (!STYLE.card) return;
  let h = 7; for (const c of String(key)) h = (h * 31 + c.charCodeAt(0)) % 100003;
  const s = placeSig() % 9973;
  translate((hash(h + s * 1.37) - .5) * 2 * amt, (hash(h * 1.7 + s) - .5) * 2 * amt); rotate((hash(h * 2.3 + s * .7) - .5) * .004 * amt);
}

// ---------- geometry ----------
const U = (P, u, ox = 0, oy = 0) => P.map(([a, b]) => [ox + a * u, oy + b * u]);
// Smooth closed curve through the points (Catmull-Rom), n samples per span.
function curvy(P, n = 6) {
  const N = P.length, out = [];
  for (let i = 0; i < N; i++) {
    const p0 = P[(i - 1 + N) % N], p1 = P[i], p2 = P[(i + 1) % N], p3 = P[(i + 2) % N];
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map(d => .5 * (2 * p1[d] + (p2[d] - p0[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (3 * p1[d] - p0[d] - 3 * p2[d] + p3[d]) * t3)));
    }
  }
  return out;
}
const oval = (cx, cy, rx, ry, rot = 0, n = 32) => { const p = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; const x = Math.cos(a) * rx, y = Math.sin(a) * ry; p.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]); } return p; };
const shiftP = (P, dx, dy) => P.map(([x, y]) => [x + dx, y + dy]);
function centroid(P) { let x = 0, y = 0; for (const p of P) { x += p[0]; y += p[1]; } return [x / P.length, y / P.length]; }
// Outward unit normals of a closed polygon.
function normals(P) {
  const N = P.length, c = centroid(P);
  return P.map((p, i) => {
    const a = P[(i - 1 + N) % N], b = P[(i + 1) % N];
    let nx = b[1] - a[1], ny = -(b[0] - a[0]); const d = Math.hypot(nx, ny) || 1; nx /= d; ny /= d;
    if (nx * (p[0] - c[0]) + ny * (p[1] - c[1]) < 0) { nx = -nx; ny = -ny; }
    return [nx, ny];
  });
}
const lightLocal = () => [LIGHT.dir[0] * XF, LIGHT.dir[1]];
// The shadow side of a convex-ish shape as a crescent: the outline facing away from the light, and the same run pulled
// toward the light by `depth`, tapering to nothing at both ends.
function crescent(P, depth) {
  const [lx, ly] = lightLocal(), Nm = normals(P), N = P.length, w = Nm.map(([nx, ny]) => -(nx * lx + ny * ly));
  let start = 0; for (let i = 1; i < N; i++) if (w[i] < w[start]) start = i;
  let best = [], cur = [];
  for (let k = 0; k <= N; k++) { const i = (start + k) % N; if (k < N && w[i] > .08) cur.push(i); else { if (cur.length > best.length) best = cur; cur = []; } }
  if (best.length < 3) return null;
  // (the inner edge is kept inside the shape: at a hard corner the pull toward the light would poke a spike out past it)
  const outer = best.map(i => P[i]), inner = best.map(i => { const k = ease(clamp((w[i] - .08) / .5)), p = P[i];
    for (const f of [1, .7, .45, .25]) { const q = [p[0] + lx * depth * k * f, p[1] + ly * depth * k * f]; if (inPoly(q[0], q[1], P)) return q; }
    return p; }).reverse();
  return outer.concat(inner);
}
// The lit edge of a shape, inset a little: for rim light.
// oriented: outward by the outline's winding rather than away from its centroid (the same on a convex shape; right on a
// thin curved one, a brow or a strand, whose centroid sits off to one side and flips half its normals).
function litEdge(P, inset, thresh = .4, oriented = false) {
  const [lx, ly] = lightLocal(), Nm = oriented ? normalsOriented(P) : normals(P), N = P.length, runs = []; let cur = [];
  for (let i = 0; i < N; i++) { const f = Nm[i][0] * lx + Nm[i][1] * ly; if (f > thresh) cur.push([P[i][0] - Nm[i][0] * inset, P[i][1] - Nm[i][1] * inset]); else if (cur.length) { runs.push(cur); cur = []; } }
  if (cur.length) runs.push(cur);
  return runs.filter(r => r.length > 2);
}
function normalsOriented(P) {
  const N = P.length; let s = 0; for (let i = 0; i < N; i++) { const a = P[i], b = P[(i + 1) % N]; s += a[0] * b[1] - b[0] * a[1]; }
  const sg = s < 0 ? -1 : 1;
  return P.map((p, i) => { const a = P[(i - 1 + N) % N], b = P[(i + 1) % N], nx = b[1] - a[1], ny = -(b[0] - a[0]), d = Math.hypot(nx, ny) || 1; return [nx / d * sg, ny / d * sg]; });
}
// Evenly resampled closed outline (so straight-edged shapes get vertices along their sides, not just at corners).
function resample(P, spacing) {
  const out = [], N = P.length;
  for (let i = 0; i < N; i++) {
    const a = P[i], b = P[(i + 1) % N], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / spacing));
    for (let k = 0; k < n; k++) out.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]);
  }
  return out;
}
// Scissor cut: the outline re-cut as short straight snips (~14 px) with tiny irregularities, stable per piece.
// The irregularity sits on the snip nodes (vertices at least .6 of a snip apart; a straight edge's snips are all nodes):
// a curve's dense vertices between two nodes ride along with them, so a curve stays one smooth cut instead of fuzzing
// vertex by vertex. And it suits the piece's size: the full ±.7 px on anything 14 px thick or more (bodies, limbs,
// props, sets), shrinking with the square of the thickness below that (eyes, brows, lids, glasses rims, earrings: finely
// cut, crisp at 4K). fine (the face features drawn here): finer still, ±1.5% of the thickness.
function scissor(P, key = 0, fine = false) {
  let h = 11; for (const c of String(key)) h = (h * 31 + c.charCodeAt(0)) % 100003;
  let per = 0; for (let i = 0; i < P.length; i++) { const b = P[(i + 1) % P.length]; per += Math.hypot(b[0] - P[i][0], b[1] - P[i][1]); }
  const sp = Math.max(1.5, Math.min(14, per / 10)), R = resample(P, sp), N = R.length;
  const m = 2 * polyArea(P) / (per || 1);   // thickness: a disc's radius, a strip's width
  let a = .7 * Math.min(1, (m / 14) ** 2); if (fine) a = Math.min(a, .015 * m);
  const off = i => [(hash(h + i * 1.3) - .5) * 2 * a, (hash(h + i * 2.1 + 5) - .5) * 2 * a];
  const S = [0]; for (let i = 1; i <= N; i++) { const p = R[i - 1], q = R[i % N]; S.push(S[i - 1] + Math.hypot(q[0] - p[0], q[1] - p[1])); }
  const nodes = [0]; for (let i = 1; i < N; i++) if (S[i] - S[nodes[nodes.length - 1]] >= sp * .6) nodes.push(i);
  const out = new Array(N);
  nodes.forEach((ia, k) => {
    const ib = k + 1 < nodes.length ? nodes[k + 1] : N, oa = off(ia), ob = off(ib % N), sa = S[ia], L = (S[ib] - sa) || 1;
    for (let i = ia; i < ib; i++) { const t = (S[i] - sa) / L; out[i] = [R[i][0] + lerp(oa[0], ob[0], t), R[i][1] + lerp(oa[1], ob[1], t)]; }
  });
  return out;
}

// ---------- the doodle and engrave looks ----------
const BIRO = '#26358C', E_INK = '#1E1812', E_PAPER = '#EFE4CF', FLIP_INK = '#3C3742';
// banknote inks (set BANK.ink per note: purple like a £20, teal like a £5, red like a £50, olive...) and paper tint
// The engraving's knobs (see fillRegion's bank branch): scale (engraving scale: every engraved line's spacing, weight and
// wave × scale; 1.5 reads at shot scale), cap (a layer's tone, 0..1: bankLayer({ cap: .5 }, set) prints a set light,
// its tones compressed and its outlines finer and paler, so the cast drawn after it at full tone stands out), dens (line
// density: spacing ÷ dens, same tone), ow (outline weight × ow: a cast's bolder outlines), wmin (the finest line printed,
// screen px: finer ones break into dashes at 1x), colour, sat, fill (see fillRegion).
const BANK = { ink: '#1F4E55', paper: '#E8EEE9', tint: '#E9DDC6',   // teal: the house note (the red bill stamp lands hardest on it)
   scale: 1.5, cap: 1, ow: 1, wmin: .7,
   inks: { purple: '#3E2A5C', teal: '#1F4E55', red: '#6A2130', olive: '#3F4A26', brown: '#4A3222' } };
// The engraving's detail at 4K: every engraved line (waveLines: the shading, the underprint, the sets' skies and walls)
// × BANK_DETAIL[0] as many and ÷ [1] as fine (≈ the same tone: the fine pen's dabs cover a little differently at each
// width, so [1] was set by measuring the tone), guilloches and guilloche bands × it as many curves, and the finest line
// printed (BANK.wmin) ÷ it. Only when the output is 4K (os ≥ 2): at 1080p those lines would be under a pixel. Outlines
// keep their weight (they carry the drawing). (Level 2 of the four compared: the user asked for more, finer lines at 4K;
// it reads like a real note, where level 3 starts turning faces to grey tone.)
const BANK_DETAIL = [2, 1.72];
const bankK = () => STYLE.mode === 'bank' && OS >= 2 ? BANK_DETAIL[0] : 1, bankKW = () => STYLE.mode === 'bank' && OS >= 2 ? BANK_DETAIL[1] : 1;
// the house note's inks (teal), to put BANK back to after a scene's own
const BANK_TEAL = { ink: '#1F4E55', paper: '#E8EEE9', tint: '#E9DDC6', dens: 1 };
// photocopy: riso (the user's pick; the mono, hivis, colour and degraded variants were dropped 2026-09-24): toner, paper,
// the spot colour(s) ([hue in degrees, printed colour]: colours near that hue print as spot; none in riso), and the
// drums (process: [channel, ink, screen angle])
const XEROX = { toner: '#1E3C8C', paper: '#F1ECDF', spot: [], spotSat: .55, cell: 6, angle: 45, crush: .24, white: .86, grit: .45, reg: 1.2, lgen: 0,   // (lgen: a copy's generation, for its line art: cpGeneration)
  line: .6, process: [['c', '#2F62C4', 15], ['m', '#FF4F9A', 75], ['y', '#FFD23A', 0]] };
const lum = c => { const v = parseInt(c.slice(1, 7), 16); return (.299 * (v >> 16 & 255) + .587 * (v >> 8 & 255) + .114 * (v & 255)) / 255; };
// Felt-tip version of a colour: more saturated, mid-light.
function vivid(c) {
  const v = parseInt(c.slice(1, 7), 16); let r = (v >> 16 & 255) / 255, g = (v >> 8 & 255) / 255, b = (v & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (d < .04) return c;
  let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360;
  const S = clamp((d / (1 - Math.abs(2 * l - 1))) * 1.25 + .1), L = clamp(l, .3, .62), C = (1 - Math.abs(2 * L - 1)) * S, X = C * (1 - Math.abs((h / 60) % 2 - 1)), m = L - C / 2;
  const [R, G, B] = h < 60 ? [C, X, 0] : h < 120 ? [X, C, 0] : h < 180 ? [0, C, X] : h < 240 ? [0, X, C] : h < 300 ? [X, 0, C] : [C, 0, X];
  return '#' + [R, G, B].map(q => Math.round((q + m) * 255).toString(16).padStart(2, '0')).join('');
}
const keyHash = k => { let h = 7; for (const c of String(k)) h = (h * 31 + c.charCodeAt(0)) % 100003; return h; };
// The spans [[xa, xb], ...] of the horizontal line at height y that lie inside polygon R, by the nonzero winding rule:
// where a shape overlaps itself (a ribbon folding at a sharp corner, a bent limb's inner edge, a crossed strap) the
// overlap is inside, as p5.brush's fills and p5's own polygons have it. (Pairing the crossings off in order, the even-odd
// rule, left every overlap out: a notch of bare paper in the hatching, the user's "line cancels itself out".) On a
// simple polygon the spans are exactly the old pairs.
function scanSpans(R, y) {
  const xs = [];
  for (let i = 0; i < R.length; i++) { const p = R[i], q = R[(i + 1) % R.length]; if ((p[1] <= y) !== (q[1] <= y)) xs.push([p[0] + (y - p[1]) / (q[1] - p[1]) * (q[0] - p[0]), q[1] > p[1] ? 1 : -1]); }
  xs.sort((m, n) => m[0] - n[0]);
  const out = []; let w = 0, x0 = 0;
  for (const [x, d] of xs) { if (!w) x0 = x; w += d; if (!w) out.push([x0, x]); }
  return out;
}
// Hatching, done here rather than by p5.brush (whose hatch silently drops a whole fill when a line meets a vertex).
// Parallel strokes at angle a (degrees) every d px across polygon P; over = overshoot past the edge (felt tip colouring
// outside the lines), rand = wobble of each stroke's spacing (fraction of d).
function hatchLines(P, d, a, br, col, w, over = 0, rand = 0) {
  const ang = a * Math.PI / 180, c = Math.cos(-ang), s = Math.sin(-ang), ci = Math.cos(ang), si = Math.sin(ang);
  const R = P.map(([x, y]) => [x * c - y * s, x * s + y * c]), back = ([x, y]) => [x * ci - y * si, x * si + y * ci];
  let y0 = Infinity, y1 = -Infinity; for (const p of R) { if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
  // lines sit on a shared grid (multiples of d in the rotated frame), so neighbouring pieces' hatching lines up
  for (let y = (Math.floor(y0 / d) + .5) * d; y < y1; y += d) {
    const yy = y + (rand ? jit(d * rand) : 0), sp = scanSpans(R, yy);
    for (let j2 = 0; j2 < sp.length; j2++) {
      const k = 2 * j2, xa = sp[j2][0] - over * (.4 + hash(k + yy)), xb = sp[j2][1] + over * (.4 + hash(k + yy + 3));
      // (p5.brush strokes fade along their length, so long spans are ruled in pieces of 120 px at most)
      const n = Math.ceil((xb - xa) / 120);
      for (let j = 0; j < n; j++) { const u0 = lerp(xa, xb, j / n), u1 = lerp(xa, xb, (j + 1) / n); if (u1 - u0 > 2) _inkLine([back([u0, yy]), back([u1 + (j < n - 1 ? 1 : 0), yy])], w, col, br, 0); }
    }
  }
}
// Polygon area (px²).
function polyArea(P) { let a = 0; for (let i = 0, j = P.length - 1; i < P.length; j = i++) a += (P[j][0] + P[i][0]) * (P[j][1] - P[i][1]); return Math.abs(a / 2); }
// Tilted-pencil shading: broad, soft side-of-the-pencil strokes in one hand direction, broken up and sparse so the
// paper breathes. density 0..1 (≈ how much of the area is covered). For big areas: rooms, walls, floors, skies.
function sideShade(P, col, o = {}) {
  const dens = clamp(o.density ?? .45), a = o.angle ?? -28, d = lerp(22, 8, dens), c = vivid(col);
  const ang = a * Math.PI / 180, cs = Math.cos(-ang), sn = Math.sin(-ang), ci = Math.cos(ang), si = Math.sin(ang);
  const R = P.map(([x, y]) => [x * cs - y * sn, x * sn + y * cs]), back = ([x, y]) => [x * ci - y * si, x * si + y * ci];
  let y0 = Infinity, y1 = -Infinity; for (const p of R) { if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
  for (let y = (Math.floor(y0 / d) + .5) * d; y < y1; y += d) {
    const yy = y + jit(d * .25);
    for (const [xa, xb] of scanSpans(R, yy)) {
      let x = xa + random() * 20;
      while (x < xb - 10) {   // long, soft strokes (a pencil dragged on its side: a band of grainy lines), few lifts
        const len = 90 + random() * 220, x2 = Math.min(xb - random() * 10, x + len);
        if (random() < .45 + .55 * dens) for (let b = 0; b < 3; b++) { const oy = (b - 1) * 2.2 + jit(.6); _inkLine([back([x + jit(4), yy + oy]), back([(x + x2) / 2, yy + oy + jit(1.5)]), back([x2 + jit(4), yy + oy + jit(1)])], .8, c, 'cpencil', .4); }
        x = x2 + 10 + random() * 30 * (1.2 - dens);
      }
    }
  }
}
// A sketched outline: straight runs become several imperfect straight strokes; curves are drawn twice, a little apart.
// Strokes overshoot only at real corners (where two straight runs meet at an angle, like a quick architectural sketch),
// never at the open ends of a line or into a curve, so limbs, necks and joins don't sprout stray lines. closed: the
// path wraps (C's last point repeats its first).
function sketchEdge(C, w, col, curv, closed = false) {
  const n = C.length, runs = [];
  let i = 0;
  while (i < n - 1) {   // split into straight runs and curved stretches
    let j = i + 1;
    while (j + 1 < n) {
      const a = C[i], b = C[j + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, tol = Math.max(1.4, L * .018);
      let ok = true; for (let k = i + 1; k <= j; k++) { const p = C[k]; if (Math.abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])) / L > tol) { ok = false; break; } }
      if (!ok) break; j++;
    }
    const L = Math.hypot(C[j][0] - C[i][0], C[j][1] - C[i][1]), straight = L > 34;
    const last = runs[runs.length - 1];
    if (!straight && last && !last.straight) last.pts.push(...C.slice(i + 1, j + 1));
    else runs.push({ straight, pts: C.slice(i, j + 1), L });
    i = j;
  }
  const dir = r => { const a = r.pts[0], b = r.pts[r.pts.length - 1]; return [(b[0] - a[0]) / (r.L || 1), (b[1] - a[1]) / (r.L || 1)]; };
  const corner = (r1, r2) => r1 && r2 && r1.straight && r2.straight && (() => { const [ax, ay] = dir(r1), [bx, by] = dir(r2); return ax * bx + ay * by < .82; })();   // > ~35°
  runs.forEach((r, k) => {
    if (!r.straight) {
      if (r.pts.length > 1) { _inkLine(r.pts.map(([x, y]) => [x + jit(1.1), y + jit(1.1)]), w, col, 'pen', curv); _inkLine(r.pts.map(([x, y]) => [x + jit(1.6) + .5, y + jit(1.6) - .4]), w * .4, col, 'pen', curv); }
      return;
    }
    const prev = runs[k - 1] || (closed ? runs[runs.length - 1] : null), next = runs[k + 1] || (closed ? runs[0] : null);
    const a = r.pts[0], b = r.pts[r.pts.length - 1], L = r.L, ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L, nx = -uy, ny = ux;
    const os0 = corner(prev, r), os1 = corner(r, next), passes = L > 200 ? 3 : 2;
    for (let q = 0; q < passes; q++) {
      const o0 = os0 ? 2 + random() * Math.min(12, L * .07) : -random() * 2, o1 = os1 ? 2 + random() * Math.min(12, L * .07) : -random() * 2, off = jit(1.4), tilt = jit(1.1);
      _inkLine([[a[0] - ux * o0 + nx * (off - tilt), a[1] - uy * o0 + ny * (off - tilt)], [b[0] + ux * o1 + nx * (off + tilt), b[1] + uy * o1 + ny * (off + tilt)]], q ? w * .5 : w, col, 'pen', 0);
    }
  });
}
// A small shape filled in with a biro, the way you'd colour in a pupil or a mouth: tight scribbled strokes in two
// directions over paper, dense enough to read dark, loose enough to read as pen. col: the pen (BIRO, or a felt tip).
function biroFill(P, col = BIRO) {
  _paint(P, { wash: '#FBF8F0', washOp: 255, ink: null });
  const a = 35 + 30 * hash(keyHash(P.length + ':' + Math.round(P[0][0]) + ',' + Math.round(P[0][1])));
  hatchLines(P, 3.1, a, 'pen', col, 1, 1.2, .35);          // (open enough that the strokes show: it's a pen, not a marker)
  hatchLines(P, 3.8, a - 75, 'pen', col, .9, .8, .35);
  edgeLine(P, 1.1, col, true);
}
// The base colouring of a region, per look.
function fillRegion(P, col, o = {}) {
  if (STYLE.mode === 'bank') {   // tone → engraved wavy line shading in the note's one ink
    if ((o.op ?? 255) < 60) return;
    // Tone: paper where the colour is light, a real dark where it's dark. A layer's BANK.cap compresses its whole range
    // (a set printed light keeps its own light and dark); o.maxTone caps a piece (skin).
    // Strong colours (the bill's red, the share price's green) print as a second ink: lighter, less darkened and more
    // of their own colour, so they read as that colour rather than as a black.
    const sat = hueSat(col)[1], cK = BANK.colour ?? 1, vv = cK * clamp((sat - .45) / .35) * clamp((lum(col) - .18) / .15);
    const cap = BANK.cap ?? 1, k = Math.min(Math.pow(clamp((1 - lum(col) - .12) / .62), .8), o.maxTone ?? 1, 1 - .45 * vv) * cap;
    const ink = BANK.ink;
    // The colour lives in the engraved LINES, as on a colour banknote: each piece's line work is printed in a dull,
    // desaturated, darkened version of its own colour (BANK.colour 0 = every line in the note's one ink). The fill is
    // paper with at most a whisper of tint (BANK.fill, default .04), so the colour never comes from flat fill.
    const dull = desat(col, BANK.sat ?? .7);
    const lineCol = mixCol(ink, mixCol(dull, '#16121A', (.12 + .28 * k) * (1 - .6 * vv)), (.6 + .15 * vv) * cK);   // (own colour capped at .6 (.75 for a strong one): the note's ink always shows)
    let kk = cK > 0 && sat > .25 ? Math.max(k, .22 * cap) : k;   // coloured pieces always carry some line work, or their colour vanishes
    _paint(P, { wash: mixCol(BANK.paper, dull, (BANK.fill ?? .04) * cK), washOp: 255, ink: null });
    // the figure: its own line language, contour hatching and stipple, in the deep ink (see bankFigFill)
    if (bankInFig()) { bankFigFill(P, col, o, kk, lineCol); return; }
    // Intaglio: the lines swell as well as close up in the darks, up to three crossing passes of wavy lines at the
    // engraving scale. Ink coverage rises steeply (≈ .15 at mid tone, ≈ .65 at the darkest), so the lights and mids stay
    // open paper and only the real darks go dense. Coverage doesn't depend on BANK.dens (it only makes the lines finer).
    // A background layer (BANK.cap < 1) is engraved in thinner lines too: a pale underprint behind the cast.
    // The ground under a figure: ruled tints all one way (horizontal), paler, in a narrow light-to-mid band.
    const gr = bankInGround(), f = bankFg(), S = bankS(), rk = lerp(.55, 1, f), D = BANK.dens || 1, a = gr ? 0 : 20 + 25 * hash(keyHash(o.key ?? col));
    const inkG = gr ? bankGroundCol(lineCol, f) : lineCol;
    if (gr) kk = Math.min(kk, lerp(.52, .63, f));
    const pass = (r, d, ang, amp) => { if (r > .02) bankGDFill(() => waveLines(P, d, ang, amp, S * 90, inkG, r * rk * d)); };
    if (kk > .05 + .07 * (1 - f)) pass(.05 + (gr ? .52 : .4) * kk * kk + .1 * vv, S * lerp(7.2, 4, kk) / D, a, S * lerp(1.2, 2.2, kk));   // (a background's palest pieces stay paper; a strong colour gets more lines in its own ink)
    if (gr) return;   // (the ground: one ruled direction only, its darks closer and heavier, never crosshatched)
    if (kk > .55) { const q = (kk - .55) / .45; pass(lerp(.06, .28, q), S * lerp(8, 4.4, q) / D, a - 70, S * 1.4); }
    if (kk > .82) { const q = (kk - .82) / .18; pass(lerp(.05, .18, q), S * lerp(7, 4.8, q) / D, a + 52, S * 1.2); }
    return;
  }
  if (STYLE.mode === 'xerox') {   // toner black, halftone, or paper; spot colours print flat, misregistered
    if ((o.op ?? 255) < 60) return;
    if (XEROX.process) { processPrint(P, col, o); return; }
    const L = lum(col), [hu, sa] = hueSat(col), spot = 'spot' in o ? o.spot : (sa > XEROX.spotSat && L > .3 ? XEROX.spot.find(([h]) => Math.min(Math.abs(hu - h), 360 - Math.abs(hu - h)) < 16) : null);
    _paint(P, { wash: XEROX.paper, washOp: 255, ink: null });
    // spot colours print as a coloured dot screen, a touch out of register; deep tones get a toner screen over it
    if (spot) { halftone(shiftP(P, XEROX.reg, -XEROX.reg * .7), clamp(.45 + (1 - L) * .5, 0, .92), spot[1]); if (L < .4) halftone(P, (.4 - L) * 1.4); return; }
    // skin (o.maxTone) never crushes to toner black: dark skin prints as a mid-tone halftone, never a black mask
    if (o.maxTone != null) { halftone(P, Math.min(o.maxTone * .8, Math.pow(clamp((XEROX.white - L) / (XEROX.white - XEROX.crush)), 1.1) * .8)); return; }
    if (L < XEROX.crush) { _paint(P, { wash: XEROX.toner, washOp: 255, ink: null }); return; }
    if (L < XEROX.white) halftone(P, Math.min(.72, Math.pow((XEROX.white - L) / (XEROX.white - XEROX.crush), 1.1)));
    return;
  }
  if (STYLE.mode === 'flip') {   // a pale opaque tint (so layers don't show through), then coloured pencil, re-hatched each drawing
    if ((o.op ?? 255) < 60) return;
    const L = lum(col), h = keyHash(o.key ?? col), a = 40 + 14 * hash(h) + jit(4);
    _paint(P, { wash: mixCol(col, '#F4EEE2', L < .3 ? .1 : .3), washOp: o.op ?? 255, ink: null });
    hatchLines(P, L < .3 ? 2.2 : 2.8, a, 'cpen', mixCol(col, '#000000', .04), .75, .8, .35);
    if (L < .22 && o.maxTone == null) hatchLines(P, 3.4, a - 70 + jit(4), 'cpen', mixCol(col, '#000000', .18), .7, .5, .35);   // (skin stays one pass)
    return;
  }
  if (STYLE.mode === 'doodle') {
    const L = lum(col); if ((o.op ?? 255) < 60) return;
    if (L > .88) { _paint(P, { wash: '#FBF8F0', washOp: 255, ink: null }); return; }   // white: left uncoloured (the paper)
    if (o.side || (o.side !== false && polyArea(P) > 90000)) { sideShade(P, col, { density: o.density }); return; }   // big areas: sparse tilted pencil
    // occlusion: a piece covers what's behind it (pencil is see-through, so hidden lines would show through), except
    // background areas above, which stay open so the page's ruled lines show. o.seeThrough keeps a piece transparent.
    if (!o.seeThrough) _paint(P, { wash: '#FBF8F0', washOp: 255, ink: null });
    const h = keyHash(o.key ?? col), a = 35 + 25 * hash(h);   // (p5.brush drops near-vertical hatching)
    const c = vivid(col);
    hatchLines(P, L < .25 ? 4 : 5.2, a, 'cpencil', c, 1.25, 3, .15);
    if (L < .35) hatchLines(P, 7, a - 70, 'cpencil', c, 1.1, 2, .2);   // dark colours get a second pass
    // (coloured pencil, not p5.brush's 'marker': marker drops strokes once enough of them queue up)
    return;
  }
  if (STYLE.mode === 'engrave') {
    if ((o.op ?? 255) < 60) return;
    const tn = 1 - lum(col), h = keyHash(o.key ?? col), a = 38 + 14 * hash(h);
    // tone, contrast-stretched: whites stay paper, darks go to dense crosshatch on a dark ground. o.maxTone caps it
    // (faces: keep expressions readable instead of burying them in crosshatch)
    const k = Math.min(Math.pow(clamp((tn - .18) / .6), .8), o.maxTone ?? 1);
    _paint(P, { wash: k > .85 ? mixCol('#5E4E3C', '#3A2F26', (k - .85) / .15) : mixCol(E_PAPER, '#5E4E3C', k * .6), washOp: 255, ink: null });
    if (k > .05) hatchLines(P, lerp(11, 3.4, k), 45, 'rotring', E_INK, .9);
    if (k > .42) hatchLines(P, lerp(12, 3.8, (k - .42) / .58), -45, 'rotring', E_INK, .85);
    if (k > .78) hatchLines(P, lerp(8, 3.6, (k - .78) / .22), 0, 'rotring', E_INK, .8);
    return;
  }
  _paint(P, { wash: col, washOp: o.op ?? 255, ink: null });
}
// A shadow on a region, per look.
function shadeRegion(C, col) {
  if (STYLE.mode === 'bank') {
    if (bankInFig()) { bankFigShade(C, col); return; }
    const S = bankS(), d = S * 4.4 / (BANK.dens || 1), c = mixCol(BANK.ink, desat(col, BANK.sat ?? .45), .5 * (BANK.colour ?? 1));
    waveLines(C, d, bankInGround() ? 0 : -30, S * 1.2, S * 60, bankInGround() ? bankGroundCol(c) : c, d * lerp(.14, .32, bankFg())); return;
  }
  if (STYLE.mode === 'xerox') { halftone(C, .4); return; }
  if (STYLE.mode === 'flip') { hatchLines(C, 2.6, -30 + jit(5), 'cpen', '#4A4452', .6, .4, .35); return; }   // soft graphite shading
  if (STYLE.mode === 'doodle') hatchLines(C, 6, -35, 'pen', BIRO, .5, 1.5, .25);
  else if (STYLE.mode === 'engrave') hatchLines(C, 3.4, -18, 'rotring', E_INK, .8);
  else if (STYLE.card) _paint(C, { wash: col, washOp: 120, ink: null });
  else _paint(C, { wash: col, washOp: 255, ink: null });
}
// An outline, per look (closed = a shape's edge; otherwise an open line). role: ink's line role inside a figure (inkFigSW).
function edgeLine(P, sw, col, closed, curv = 0, role) {
  if (P.length < 2) return;
  const C = closed ? P.concat([P[0]]) : P;
  if (STYLE.mode === 'doodle') {
    sketchEdge(C, Math.max(.55, sw * .62), BIRO, curv, closed);
  } else if (STYLE.mode === 'engrave') _inkLine(C, Math.max(.9, sw * 1.1), E_INK, 'rotring', curv);
  else if (STYLE.mode === 'bank') {   // (bold: the figures' outlines carry the drawing: bolder and darker on a figure, finer and paler on the ground)
    const fg = bankInFig(), gd = bankInGround(), b = bankStroke(sw * 1.3 * (BANK.ow ?? 1) * (fg ? 1.3 : gd ? .82 : 1));
    const g = gd ? bankGLine(b.w, bankGroundCol(b.col)) : null;   // (never under the floor)
    bankVigInk(C, g ? g.w : b.w, fg ? bankFigCol(b.col) : g ? g.col : b.col, 'rotring', curv, C[0][0] * .013 + C[0][1] * .029, 0, closed);
  }
  else if (STYLE.mode === 'xerox') {   // (thin: heavy toner lines swallow small details)
    risoLine(P, Math.max(.5, sw * (XEROX.line ?? .6)), closed, curv); for (let i = 0; i < C.length * 2; i++) random();   // printed (the random stream advanced as the old brush line's jitter did, so what's drawn after is unchanged)
  }
  else if (STYLE.mode === 'flip') {   // a graphite line, re-traced each drawing, with a lighter searching stroke beside it on the big shapes
    const g = FLIP_INK;
    _inkLine(C.map(([x, y]) => [x + jit(.9), y + jit(.9)]), Math.max(.5, sw * .55), g, 'graphite', curv);
    if (sw > 1.3) _inkLine(C.map(([x, y]) => [x + jit(2), y + jit(2)]), Math.max(.3, sw * .22), g, 'graphite', curv);
  }
  else if (closed) _paint(P, { ink: col || NOIR.ink, sw: inkFigSW(sw, role), br: 'flash' });
  else _inkLine(P, inkFigSW(sw, role), col || NOIR.ink, 'flash', curv);
}
// ---------- ink: a figure's line weights (the rubber-hose idiom) ----------
// In the ink look every cast rig draws as one figure (inkWrapRigs). Its contour takes ONE weight, in proportion to the
// figure: 1/INK_R of its height on screen (the user's reference, brief/ref/codey_rubberhose_ref.png: about a fortieth),
// never heavier than the rig's own weight (the people, drawn at about 1/45 of their height, and anything big stay as they
// were) and never under INK_MIN px; its interior lines (the rig's lighter pieces and its detail lines) at most INK_IN of it:
// the contour bold, the inner lines light. Which is which comes from the rig's own sw: a piece from .84 of the rig's sw up
// is contour, a lighter one interior; o.role on a piece (or edgeLine's role) says so outright: 'contour', 'inner', or a
// number (that multiple of the contour weight). Outside a rig (sets, props, the 1930s ad's own figures) nothing changes.
const INK_R = 42, INK_MIN = 1.6, INK_IN = .5;
const INK_PX = { flash: 5.9, flashfine: 3.4 };   // (a brush's line width, px at 1080p per unit of weight: measured)
let INK_FIG = null;   // the figure drawing now: { sw (the rig's base sw), C (its contour, screen px), k (C over the rig's own) }
const inkRH = () => STYLE.mode === 'ink';
const inkFigOn = () => !!INK_FIG && inkRH();
// The past is slightly desaturated pastels (the brief). The 1930s ad is painted in them (NOIR.past*); the cast's own
// colours are brought into that range when they're drawn in ink (V3d's pets, Altman, Z1's two): a strong colour loses
// some of its chroma and lifts toward the ad's cream, its hue kept; pastels, the rubber-hose blacks and whites stay.
// Only inside a rig, so the ad and the sets are untouched. INK_PASTEL: how far (.6: slightly desaturated, identities kept;
// 1 would be the ad's own range, Fireball's flame going beige).
const INK_PASTEL = .6;
function inkPastel(c, s = INK_PASTEL) {
  if (typeof c !== 'string' || c[0] !== '#' || c.length < 7 || !s) return c;
  const v = parseInt(c.slice(1, 7), 16), r = (v >> 16 & 255) / 255, g = (v >> 8 & 255) / 255, b = (v & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), C = mx - mn, L = (mx + mn) / 2;
  if (L < .2 || L > .93) return c;
  const u = clamp((C - .25) / .45), k = u * u * (3 - 2 * u) * s;   // (chroma under .25, the ad's own pastels, doesn't move)
  return mixCol(desat(c, clamp(1 - .45 * k)), NOIR.pastSky, clamp(.28 * k)) + c.slice(7);
}
PAINT_TINT = c => inkFigOn() ? inkPastel(c) : c;
// a line weight (in brush units, here) for weight sw asked for inside the figure
function inkFigSW(sw, role, br = 'flash') {
  const F = INK_FIG; if (!F || !inkRH()) return sw;
  const ds = drawScale(), inner = role === 'inner' || (role == null && sw < F.sw * .84);   // (toppers at .85–.9 of the rig's sw are silhouette; fingers at .8, plates, screens and emblems are inner)
  const px = typeof role === 'number' ? F.C * role : inner ? Math.min(sw * INK_PX[br] * ds * F.k, F.C * INK_IN) : F.C;
  return px / INK_PX[br] / ds;
}
// [height (u, ground to the top of the head), the rig's own base sw] for each cast rig, from its (x, y, u, ..., o) call
const INK_RIGS = {
  person: u => [14, clamp(u / 20, .55, 2.2)], commuter: u => [13.4, clamp(u / 20, .55, 2.2)],
  musk: u => [15.6, clamp(u / 20, .55, 2.2)], zuck: u => [12.8, clamp(u / 20, .55, 2.2)],
  dorsey: u => [14.9, clamp(u * .92 / 20, .55, 2.2)], altman: u => [13.3, clamp(u * .95 / 20, .55, 2.2)],
  turnbull: u => [13.8, clamp(u * .95 / 20, .55, 2.2)], dario: u => [14.4, clamp(u * .95 / 20, .55, 2.2)],
  grok: u => [9.2, clamp(u / 20, .55, 2.2)], muse: u => [9.4, clamp(u / 20, .45, 2.2)],
  copilot: u => [8.6, clamp(u / 20, .55, 2.2)], gemini: u => [8.2, clamp(u / 20, .5, 2.2)], clawd2: u => [8.4, clamp(u / 17, .55, 2.4)],
  codex: u => [4.6, clamp(u / 20, .5, 2.2) * 1.05],   // (the pets are one family at one size: one weight for the row)
};
// The bots whose limbs are bare noodles: in ink they're rubber hose (limb(): solid black, no outline, about 1/32 of the
// figure's height wide). (Copilot keeps its flight suit's sleeves, Clawd its block legs; the Codex pets draw their own.)
const INK_HOSE = ['grok', 'muse', 'gemini'];
function inkWrapRigs() {
  for (const nm in INK_RIGS) {
    const f = window[nm]; if (typeof f !== 'function' || f.inkFig) continue;
    const g = function (...a) {
      if (!inkRH() || typeof a[2] !== 'number') return f.apply(this, a);
      const u = a[2], [h, sw] = INK_RIGS[nm](u), ds = drawScale(), own = sw * INK_PX.flash * ds;
      const C = Math.min(own, Math.max(INK_MIN, h * u * ds / INK_R)), prev = INK_FIG;
      const bot = /grok|muse|copilot|gemini|clawd2|codex/.test(nm);   // (the bots draw flat: no cel crescents, rim lights, glints or glows)
      INK_FIG = { sw, C, k: C / own, rig: nm, bot, flat: bot, hose: INK_HOSE.includes(nm) ? h * u / 32 : 0 };
      try { return f.apply(this, a); } finally { INK_FIG = prev; }
    };
    Object.assign(g, f); g.inkFig = true; window[nm] = g;
  }
}
// The parts of a closed outline P that lie inside any of the shapes Q (open runs): where a part drawn over others
// overlaps them, the crease a cel shows (the inner lines of a puffy glove, a flame's tongues, a cloud's lobes).
function inkInsideRuns(P, Q) {
  const inside = P.map(([x, y]) => Q.some(S => inPoly(x, y, S))), n = P.length, runs = [];
  if (inside.every(Boolean)) return [P.concat([P[0]])];
  const s0 = inside.findIndex(v => !v); let cur = null;
  for (let j = 1; j <= n; j++) { const i = (s0 + j) % n; if (inside[i]) { if (!cur) cur = [P[(i - 1 + n) % n]]; cur.push(P[i]); } else if (cur) { cur.push(P[i]); runs.push(cur); cur = null; } }
  if (cur) runs.push(cur);
  return runs.filter(r => r.length > 2);
}
// A group of overlapping parts drawn as one silhouette (ink): every part's outline first at twice the contour weight, the
// fills over them (so only the union's outer edge shows, at the contour weight), then the creases where later parts
// overlap earlier ones. parts: [[P, col], ...] back to front. o: w (the contour, a multiple of the figure's), inner
// (the creases' multiple), key. Elsewhere (other looks, outside a figure) they're plain pieces.
function inkGroup(parts, o = {}) {
  if (!inkFigOn()) { parts.forEach(([P, col], i) => piece(P, col, { sw: o.sw, key: (o.key || 'ig') + i, lift: o.lift, flatCard: true })); return; }
  const w = o.w ?? 1, ink = o.ink || NOIR.ink;
  for (const [P] of parts) edgeLine(P, 1, ink, true, 0, 2 * w);
  parts.forEach(([P, col], i) => piece(P, col, { ink: null, key: (o.key || 'ig') + i }));
  for (let i = 1; i < parts.length; i++) for (const r of inkInsideRuns(parts[i][0], parts.slice(0, i).map(p => p[0]))) edgeLine(r, 1, ink, false, 0, (o.inner ?? INK_IN) * w);
}
// The kit's own painting (emotes, shadows, irises, anything a set paints directly) follows the look too.
// The page's own printing (the notebook's blue rules and red margin) isn't part of any drawing: it never boils. Any line
// in those colours is printed, not drawn: a solid, even line (pageRuleLine), however it's asked for (linedPaper, a
// shot's own page, dline); the random stream is re-seeded after it for whatever comes next, as when it was drawn.
const PAGE_RULE_COLS = ['#9DB7DC', '#E08A8A'];
const isPageRule = col => typeof col === 'string' && PAGE_RULE_COLS.includes(col.toUpperCase());
function pageRuleSeed(P) { const a = P[0], b = P[P.length - 1]; return (Math.round(a[0] * 7 + a[1] * 13 + b[0] * 17 + b[1] * 29) >>> 0) + 1; }
// A printed rule: solid geometry in the rule's colour as it reads printed (a little towards the paper), sw × K local
// px wide (the pen's weight: the page's lines scale up as a camera pushes in), but never under MIN px on screen however
// far it pulls back (the margin's floor in proportion to its heavier pen). Drawn in the pen, a line this fine is
// thinner than a pixel and printed faint or dark by where it fell on the pixel grid: under a moving camera the whole
// ruling shimmered. Solid, the supersampling anti-aliases it evenly wherever it falls. A piece of a hand-ruled line
// that drifts a fraction of a pixel along its length (rules were ruled in 400 px pieces, the pen's strokes fading
// with length) is straightened to its middle, so the pieces meet without a step.
const PAGE_RULE = { K: 1.7, MIN: 1.5, TINT: .5 };
function pageRuleLine(P, sw = .6, col) {
  const s = bankPx(), w = Math.max(PAGE_RULE.MIN * Math.max(1, sw / .6) / s, sw * PAGE_RULE.K), c = mixCol(col, '#FBF8F0', PAGE_RULE.TINT);
  let Q = P;
  if (P.length === 2) { const [a, b] = P, dx = Math.abs(b[0] - a[0]), dy = Math.abs(b[1] - a[1]);
    if (dy < 1 && dx > 20) { const m = (a[1] + b[1]) / 2; Q = [[a[0], m], [b[0], m]]; }
    else if (dx < 1 && dy > 20) { const m = (a[0] + b[0]) / 2; Q = [[m, a[1]], [m, b[1]]]; } }
  for (let i = 0; i + 1 < Q.length; i++) {
    const [x0, y0] = Q[i], [x1, y1] = Q[i + 1], L = Math.hypot(x1 - x0, y1 - y0); if (L < 1e-6) continue;
    const nx = -(y1 - y0) / L * w / 2, ny = (x1 - x0) / L * w / 2;
    _paint([[x0 + nx, y0 + ny], [x1 + nx, y1 + ny], [x1 - nx, y1 - ny], [x0 - nx, y0 - ny]], { wash: c, ink: null });
  }
}
{ const kitInk = inkLine;
  inkLine = function (pts, sw, col, br, curv) {
    if (!isPageRule(col) || !pts || pts.length < 2) return kitInk(pts, sw, col, br, curv);
    randomSeed(pageRuleSeed(pts)); pageRuleLine(pts, sw, col);
    brush.noFill(); brush.noWash(); brush.noHatch(); brush.set(br || 'ink', col, sw ?? 1);   // (the brush left as the pen left it)
    randomSeed((BOILN * 7919 + pageRuleSeed(pts)) >>> 0);
  }; }
const _paint = paint, _inkLine = inkLine, _glow = glow;
paint = function (pts, o = {}) {
  if (!['doodle', 'engrave', 'bank', 'xerox'].includes(STYLE.mode)) return _paint(pts, o);
  if (o.hatch) return _paint(pts, o);   // (a set asking for p5.brush hatching explicitly)
  const col = o.wash || o.fill, op = o.wash ? (o.washOp ?? 255) : (o.fillOp ?? 170);
  if (col) fillRegion(pts, col, { op: op * (o.wash ? 1 : 1.5) });
  if (o.ink !== null) edgeLine(pts, o.sw ?? 1, o.ink, true);
};
inkLine = function (pts, sw = 1, col = PAL.ink, br = 'ink', curv = .5) {
  if (!['doodle', 'engrave', 'bank', 'xerox'].includes(STYLE.mode)) return _inkLine(pts, sw, col, br, curv);
  if (lum(col) > .78) return;   // light lines (glints, rain) are the paper showing through
  edgeLine(pts, sw, col, false, curv);
};
glow = function (x, y, r, col, a = 1) {
  if (STYLE.mode === 'doodle' || STYLE.mode === 'xerox') return;   // light in a doodle is the paper; a copier can't copy light
  if (STYLE.mode === 'bank') return;
  if (inkFigOn() && INK_FIG.flat) return;   // (ink: a bot's flat rubber-hose drawing has no glows, inkWrapRigs)
  _glow(x, y, r, col, STYLE.mode === 'engrave' ? a * .35 : a);
};
// Tracing registration: each drawing sits a hair off the last, as re-traced pages do. Call once per frame inside the camera.
function flipJitter(amt = .6) { if (STYLE.mode !== 'flip') return; translate((hash(STEP * 1.3 + 7) - .5) * 2 * amt, (hash(STEP * 2.1 + 3) - .5) * 2 * amt); }
// Lined notebook paper: the ground of every doodle.
function linedPaper() {
  _paint(U([[-60, -60], [W + 60, -60], [W + 60, H + 60], [-60, H + 60]], 1), { wash: '#FBF8F0', ink: null });
  for (let y = 130; y < H + 40; y += 40) _inkLine([[-20, y], [W + 20, y]], .6, '#9DB7DC', 'rotring', 0);   // (printed: pageRuleLine)
  _inkLine([[170, -20], [170, H + 20]], .9, '#E08A8A', 'rotring', 0);
  for (const hy of [180, 540, 900]) _paint(oval(62, hy, 17, 17, 0, 18), { wash: '#E4DED2', ink: null });   // punch holes
}

// ---------- bank and xerox helpers ----------
// A colour with its saturation scaled by k (0 = grey, 1 = unchanged), keeping its luminance.
function desat(c, k) { const L = lum(c) * 255, v = parseInt(c.slice(1, 7), 16), ch = [v >> 16 & 255, v >> 8 & 255, v & 255].map(x => Math.round(clamp(L + (x - L) * k, 0, 255)));
  return '#' + ch.map(x => x.toString(16).padStart(2, '0')).join(''); }
// Is (x, y) inside P? By the nonzero winding rule, like scanSpans (a shape's overlaps with itself are inside); on a simple
// polygon the same answer the crossing count gave.
function inPoly(x, y, P) { let w = 0; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) w += a[1] > b[1] ? 1 : -1; } return w !== 0; }
function hueSat(c) { const v = parseInt(c.slice(1, 7), 16), r = (v >> 16 & 255) / 255, g = (v >> 8 & 255) / 255, b = (v & 255) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (d < 1e-6) return [0, 0]; let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; return [h, d / (1 - Math.abs(mx + mn - 1) + 1e-9)]; }
// The bank look's engraving scale, line weights and layers.
// The current drawing scale: screen px per local px (camera zoom × any scale() the shot or rig is inside).
function bankPx() { try { const m = p5.instance._renderer.states.uModelMatrix.mat4; return Math.sqrt(Math.abs(m[0] * m[5] - m[1] * m[4])) || 1; } catch (e) { return 1; } }
// The engraving scale for what's drawn now: BANK.scale, but never finer than .9 on screen (a set printed small inside a
// window keeps lines that read). A layer drawn through an engraving wrapper (banknote.js's bnEngrave, the chorus's
// chEngrave: they replace waveLines) carries its own scale, so gets 1 here.
const BANK_WL0 = waveLines;
function bankS() { return waveLines !== BANK_WL0 ? 1 : Math.max(BANK.scale ?? 1, .9 / bankPx()); }
// How much of a foreground the current layer is (1: the cast, full tone; 0: a set capped at .3 or less).
const bankFg = () => clamp(((BANK.cap ?? 1) - .3) / .7);
// The finest line printed (local px): BANK.wmin on screen (an engraved line, fine: BANK.wmin ÷ the 4K detail).
const bankW = (w, fine = false) => Math.max(w, (BANK.wmin ?? .7) / bankPx() / (fine ? bankKW() : 1));
// The engraving pen for a line w wide (local px): the rotring, or at a 4K detail level the fine engraving pen for its width.
const bankBrush = w => bankK() <= 1 ? 'rotring' : w < .5 ? 'bankfine' : w < .9 ? 'bankfine2' : w < 1.5 ? 'bankfine3' : 'bankfine4';
// An outline or detail line in the bank look: weight × √scale (bolder at engraving scale), finer and paler in a
// background layer, never below BANK.wmin on screen.
function bankStroke(w) {
  const f = bankFg(), S = waveLines !== BANK_WL0 ? 1 : Math.sqrt(bankS());
  return { w: bankW(w * S * lerp(.6, 1, f)), col: f < 1 ? mixCol(BANK.ink, BANK.paper, (1 - f) * .3) : BANK.ink };
}
// Draw fn as one layer of the note with some BANK knobs set, restored after: bankLayer({ cap: .5 }, () => set(t)) prints
// a set light behind a full-tone cast.
function bankLayer(o, fn) { const sv = {}; for (const k in o) sv[k] = BANK[k]; Object.assign(BANK, o); try { fn(); } finally { Object.assign(BANK, sv); } }
// Engraved line shading: parallel lines at angle a, d apart, each with a gentle wave (amp px, wavelength wl px), the
// way banknote engravers model form. Lines share one grid across pieces (where that grid sits: bankGrid).
// On the ground, inside a vignette (bankVignette), each line tapers and ends at the figure's oval.
function waveLines(P, d, a, amp, wl, col, w) {
  const K = bankK(); if (K !== 1) { d /= K; w /= bankKW(); }   // (4K detail: more lines, as much finer)
  w = bankW(w, true);
  if (bankGD()) return bankRules(P, d, a, amp, wl, col, w);   // (the ground: engraved rules)
  const br = bankBrush(w);
  const G = bankGrid(P, a, d), R = P.map(G.fwd), back = G.back, vig = bankVigOn(), run = vig ? bankVigRun(P, d * 7.77 + a * .113) : null;
  let y0 = Infinity, y1 = -Infinity; for (const p of R) { if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
  for (let y = (Math.floor((y0 - G.v0) / d) + .5) * d + G.v0; y < y1; y += d) {
    const row = Math.round((y - G.v0) / d - .5), yl = G.jit ? y + G.jit(row) : y;
    const wave = x => yl + Math.sin(x / wl * TAU + (y - G.v0) / d * .3 + G.wph) * amp;
    for (const [xa, xb] of scanSpans(R, yl)) {
      const pts = []; for (let x = xa; x <= xb; x += 6) pts.push(back([x, wave(x)]));
      pts.push(back([xb, wave(xb)]));
      if (vig) bankVigInk(pts, w, col, br, .3, row * 1.618 + d * 7.77 + a * .113, 20, false, run);
      else for (let j = 0; j + 1 < pts.length; j += 20) _inkLine(pts.slice(j, j + 21), w, col, br, .3);   // (in pieces: long strokes fade)
    }
  }
  if (vig) bankVigRowsEnd(P, d * 7.77 + a * .113);
}
// The ground's engraved lines print as engraved rules (the user's pick, 2026-09-26: "D is visually a lot clearer, it's
// not even a contest"; the pen's lines, a width floor and a coarser screen were the others, in git before this): on the
// ground (fillRegion's and shadeRegion's tints, the sets' skies, walls and underprint) the same lines crisp, as plain
// geometry like the figures' contour lines rather than the pen's dabs (the ground a machine-ruled underprint, as on a
// note), inking what the pen did, never under BANK_GF.floorD output px (paler instead), a piece's lines swelling a
// little away from the key light and thinning toward it, tapering to a point into a figure's vignette; its guilloches
// crisp too; its outlines stay in the pen, never under floorD. Two things broke the pen's fine lines up: a line under
// an output pixel wide prints darker or paler by where it falls on the pixel grid, and the pen itself (p5.brush's dabs:
// each stroke swells and thins along its length, its dabs vary in size and opacity and a few drop out) prints a fine
// line as a row of dashes however finely it's sampled. The figures keep the pen.
// floorD: [1080p, 4K] output px; swellD: the swell across a piece (its lines this much heavier on the side away from
// the light than on the lit side, the piece's tone kept); penTone: a pen outline's colour × (a pale pen line inks more
// than its cover says: p5.brush mixes its colours spectrally; measured, [1080p, 4K]), penGamma: and the paler the more
const BANK_GF = { floorD: [1, 1], swellD: .5, penTone: [.82, .72], penGamma: [1, 1.3] };
const bankGD = () => STYLE.mode === 'bank' && bankInGround();   // (drawing the ground in the bank look)
// The pen's cover: the share of its nominal width a pen line inks (its dabs are round, spaced and a little see-through),
// by its width in output px; measured on flat tints against solid lines. [1080p (the rotring), 4K (the fine pens)].
const BANK_PENK = [[[.7, .72], [.91, .87], [1.34, .96], [2, 1.1], [3, 1.2]], [[.82, .7], [1.06, .76], [1.56, .88], [2.3, .98], [3.5, 1.06]]];
function bankPenK(wo, k4 = OS >= 2) {
  const T = BANK_PENK[k4 ? 1 : 0]; if (wo <= T[0][0]) return T[0][1];
  for (let i = 1; i < T.length; i++) if (wo <= T[i][0]) return lerp(T[i - 1][1], T[i][1], (wo - T[i - 1][0]) / (T[i][0] - T[i - 1][0]));
  return T[T.length - 1][1];
}
const bankOutW = w => w * bankPx() * OS;   // (local px → output px)
// A ground line w wide in col (local px), never under the floor fl (output px): widened to it, and paler by as much as
// it inks more (pen: a pen line, by its cover; else a solid one)
function bankGroundFloor(w, col, fl = BANK_GF.floorD, pen = true) {
  const f = fl[OS >= 2 ? 1 : 0] / OS / bankPx(); if (w >= f) return { w, col };
  const k = OS >= 2 ? 1 : 0;
  return { w: f, col: mixCol(BANK.paper, col, pen ? BANK_GF.penTone[k] * Math.pow(bankPenK(bankOutW(w)) * w / (bankPenK(bankOutW(f)) * f), BANK_GF.penGamma[k]) : w / f) };
}
// The ground's other lines in the pen (outlines, detail lines): never under floorD, paler instead
const bankGLine = (w, col) => bankGD() ? bankGroundFloor(w, col) : { w, col };
// a piece's tint (fillRegion's pass, not a shadow or a set's own lines) swells across the piece
let BANK_GFILL = false;
function bankGDFill(fn) { const sv = BANK_GFILL; BANK_GFILL = true; try { fn(); } finally { BANK_GFILL = sv; } }
// the ground's waveLines rows as crisp ribbons (bankSwell, bankTris) inking what the pen would have (its cover × its weight);
// ended at the frame's vignettes (tapering to a point).
function bankRules(P, d, a, amp, wl, col, w) {
  let wr = bankPenK(bankOutW(w)) * w, sw = null;
  // the swell across a piece: × (1 + swellD · s), s 0 on its lit side to 1 on the far side; its mean kept
  const g = BANK_GFILL ? BANK_GF.swellD : 0;
  if (g) { let cx = 0, cy = 0; for (const [x, y] of P) { cx += x; cy += y; } cx /= P.length; cy /= P.length;
    const Lx = LIGHT.dir[0] * XF, Ly = LIGHT.dir[1], pr = ([x, y]) => -(x - cx) * Lx - (y - cy) * Ly; let r = 1e-6; for (const p of P) r = Math.max(r, Math.abs(pr(p)));
    sw = p => 1 + g * clamp(.5 + .5 * pr(p) / r); wr /= 1 + g / 2; }
  ({ w: wr, col } = bankGroundFloor(wr, col, BANK_GF.floorD, false));
  const G = bankGrid(P, a, d), R = P.map(G.fwd), back = G.back, T = [], lt = bankVigOn() ? bankVigLt() : 0;
  let y0 = Infinity, y1 = -Infinity; for (const p of R) { if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
  for (let y = (Math.floor((y0 - G.v0) / d) + .5) * d + G.v0; y < y1; y += d) {
    const row = Math.round((y - G.v0) / d - .5), yl = G.jit ? y + G.jit(row) : y;
    const wave = x => yl + Math.sin(x / wl * TAU + (y - G.v0) / d * .3 + G.wph) * amp;
    for (const [xa, xb] of scanSpans(R, yl)) {
      const pts = []; for (let x = xa; x < xb; x += 6) pts.push(back([x, wave(x)]));
      pts.push(back([xb, wave(xb)])); if (pts.length < 2) continue;
      bankRibbon(T, pts, pts.map(p => sw ? wr * sw(p) : wr), row * 1.618 + d * 7.77 + a * .113, lt);
    }
  }
  bankTris(T, col);
}
// d: a polyline as a crisp ribbon into T (bankSwell: ws, its width at each point), ended at the frame's vignettes, each
// cut end tapering to a point over BANK_VIG_K.taper px (lt: that in local px, bankVigLt; id: the line's own number)
function bankRibbon(T, pts, ws, id, lt) {
  const runs = bankVigOn() && pts.length > 1 ? bankVigRuns(pts, id) : null;
  if (!runs) { bankSwell(T, pts, ws, 0); return; }
  const wAt = f => { const i = Math.max(0, Math.min(ws.length - 2, Math.floor(f))); return lerp(ws[i], ws[i + 1], f - i); };
  for (const r of runs) {
    const { body, tapers } = bankVigTapers(r, lt);
    if (body && body.P.length > 1) bankSwell(T, body.P, body.f.map(wAt), 0);
    for (const tp of tapers) bankSwell(T, tp.P, tp.k.map((k, j) => k * wAt(tp.f[j])), 0);
  }
}
const bankVigLt = () => { const A = bankScreenAff(); return BANK_VIG_K.taper / (Math.sqrt(Math.abs(A[0] * A[3] - A[1] * A[2])) || 1); };
// d: a ground guilloche's strands (polylines) as crisp ribbons, inking as the pen w wide in col did, never under
// floorD; paler by only the square root of that, as the strands cross each other so often (the pen's built up darker
// where they crossed; solid ones don't)
function bankGRibbons(S, w, col, id) {
  const we = bankPenK(bankOutW(w)) * w, f = BANK_GF.floorD[OS >= 2 ? 1 : 0] / OS / bankPx(), wr = Math.max(we, f);
  const c = mixCol(BANK.paper, col, Math.sqrt(Math.min(1, we / f))), T = [], lt = bankVigOn() ? bankVigLt() : 0;
  S.forEach((pts, i) => bankRibbon(T, pts, pts.map(() => wr), id + i * 3.3, lt));
  bankTris(T, c);
}
// A guilloche: a spirograph band of n interlaced curves between radii r0 and r1 (the security pattern of banknotes).
// lobes = petals round the ring; rx/ry scale for ovals; draws with fine ink lines.
function guilloche(cx, cy, r0, r1, o = {}) {
  const K = bankK(), n = Math.round((o.n ?? 18) * K), lobes = o.lobes ?? 12, w0 = bankW((o.w ?? .5) / bankKW(), true), { w, col } = bankGLine(w0, o.col || BANK.ink), br = bankBrush(w), rx = o.rx ?? 1, ry = o.ry ?? 1, rot = o.rot ?? 0, steps = o.steps ?? 360, rib = bankGD() ? [] : null, run = rib ? null : bankVigRun([[cx, cy]], r1 * .01 + lobes + 1);
  for (let i = 0; i < n; i++) {
    const ph = i / n * TAU / lobes, pts = [];
    for (let k = 0; k <= steps; k++) { const t = k / steps * TAU, r = lerp(r0, r1, .5 + .5 * Math.sin(lobes * t + ph * lobes + (o.twist ?? 0) * Math.sin(t * (o.beat ?? 3)))); pts.push([cx + Math.cos(t + rot) * r * rx, cy + Math.sin(t + rot) * r * ry]); }
    if (rib) { rib.push(pts); continue; }   // (on the ground: crisp, bankGRibbons)
    for (let j = 0; j < pts.length - 1; j += 40) bankVigInk(pts.slice(j, j + 41), w, col, br, .4, i * 3.3 + j * .71 + r1 * .01, 0, false, run);
  }
  if (rib) bankGRibbons(rib, w0, o.col || BANK.ink, r1 * .01);
  bankVigRowsEnd([[cx, cy]], r1 * .01 + lobes);
}
// A band of guilloche waves along a straight edge (note borders): from (x0, y) to (x1, y), height h.
function guillocheBand(x0, x1, y, h, o = {}) {
  const K = bankK(), n = Math.round((o.n ?? 6) * K), w0 = bankW((o.w ?? .5) / bankKW(), true), { w, col } = bankGLine(w0, o.col || BANK.ink), br = bankBrush(w), wl = o.wl ?? 60, rib = bankGD() ? [] : null, run = rib ? null : bankVigRun([[x0, y]], h + n + 1);
  for (let i = 0; i < n; i++) { const ph = i / n * TAU, pts = []; for (let x = x0; x <= x1; x += 5) pts.push([x, y + Math.sin(x / wl * TAU + ph) * h / 2]); if (rib) { rib.push(pts); continue; } for (let j = 0; j < pts.length - 1; j += 24) bankVigInk(pts.slice(j, j + 25), w, col, br, .3, i * 5.1 + j * .37 + y * .01, 0, false, run); }
  if (rib) bankGRibbons(rib, w0, o.col || BANK.ink, y * .01);
  bankVigRowsEnd([[x0, y]], h + n);
}
// Photocopy halftone: dots on a 45° grid, radius by tone (0 = none, 1 = touching), clipped to P, in any ink colour. Mechanical, so drawn
// as plain circles (crisp, fast), after flushing the brush so they land in order.
// The dot screen's pitch (the user's pick, 2026-09-25: "c + auto looks great"; the fixed coarse and fine screens before it
// read as a big artistic halftone at the film's scale): in proportion to the shot's subject (the riso effect "isn't
// proportional to screen size": too fine on a big subject and the look is gone, too coarse on a small one and it's
// an artistic halftone). Each riso shot's print gets one screen, pitch = its main subject's height ÷ RISO_N (the density
// of the 4K lineup stills the user liked: a figure ~800-880 px tall under a 6 px screen, ~135-147 dots), clamped to
// RISO_BAND (1080p px: below the floor the dots stop reading as dots at 1080p, above the ceiling they turn graphic).
// The copies' generation coarsening multiplies on top. Per board shot (RISO_SHOTS, keyed by the shot that's drawing, so
// a neighbour drawn under a transition keeps its own), one of:
//   h  the subject's height on screen (px): a fixed screen for the shot
//   z  its height in the world (px at zoom 1), × the camera's zoom as it plays: a cut to a closer framing gets a coarser
//      screen, and during a zoom the dots scale about the screen's centre with the picture (so they don't swim)
//   p  a printed object in the story (a poster, a copy, a phone's picture): the dots belong to its paper, pitch p in the
//      paper's own units; the paper is whatever frame the shot called look('xerox') in, so they grow with a push-in and
//      ride the sheet as it slides, swings or shrinks, as filming a real print would (within the band: far off, a print
//      keeps the floor's dots, anchored to its sheet, rather than dissolving into a moiré of flat colour)
// Anything riso outside the table (the dev pages) prints at the fine screen (.55 of the cell).
// The line art follows the same split (risoScreen's z, risoLine): on the fixed screen (h) the lines keep their weight on
// screen whatever the camera's zoom (the user, 2026-09-27: in the permit shot's crash zoom the lines swelled with the
// picture, "the details get clobbered"), the weight they print at under a camera at zoom 1, the framing their drawings
// were drawn for; a print in the story (p) keeps its lines on its paper, as its dots are; z scales them with its dots.
// RISO_LZ: the zoom range undone (the camera's own zoom, camBegin's; past hi the lines follow the camera again: V3c's
// lock, seen at 15.7×, prints its lines at twice their weight, where they were 15.7 times it) and the floor (1080p px, the whole width): undoing
// a zoom never takes a line under it, so a fine line seen close keeps a line's weight rather than thinning to a hairline
// that the copies break into dashes (a line already under it is left as the camera draws it). (The user asked for it,
// 2026-09-27; before it every line scaled with the camera: git has it.)
const RISO_LZ = { on: true, lo: .5, hi: 8, floor: 1.8 };
const RISO_N = 135, RISO_BAND = [3.3, 6], RISO_CELL0 = XEROX.cell, RISO_V2ST = 4.5;   // (RISO_V2ST: the turbine street's pitch)
// One screen for the whole film's riso world (the user, 2026-09-26: the disco, outside it, the bookies, the sandbox and the
// high street's doors "all completely different"): every riso scene prints at RISO_FILM on screen, the turbine street's
// 4.5 that the user accepted there; the copies' generation coarsening still multiplies on top. Only prints inside the
// story (the stamped poster, her copies of the ad, the phone's picture) keep dots on their paper (p, below).
const RISO_FILM = RISO_V2ST, RISO_FIX = { h: RISO_FILM * RISO_N };
const RISO_SHOTS = {
  V1d: RISO_FIX, V1e: RISO_FIX,               // her at the desk (u 30): ~600-630 px through the camera's drift
  C1a: { p: 4.8 }, C2a: { p: 4.8 },               // the stamped poster: her lying in the page, 653 page px
  C1d: RISO_FIX, C2d: RISO_FIX,               // the copies on the tray: her ~520-550 (C2d: two half-size sheets)
  C1e: RISO_FIX, C2e: RISO_FIX,               // the sandbox (u 36; the push 1.12-1.26) and the sandcastle (u 34; the pull 1.15-.8)
  C1f: { p: 4.5 }, C2f: { p: 4.5 },               // the 1930s ad as a riso copy: the robot butler, 608 sheet px (tiny on her wall, full frame after the push-in)
  // the turbine street, one print on one screen (the user, 2026-09-26: "a print has one screen"; sized by the camera, it
  // jumped at every cut, from 3.7 in the wide to the 6 ceiling in the close-ups): V2e, V2f, and V2g's riso, which is the
  // street's last frames and its exhaust smeared off (verse 2's other shots print none)
  V2e: RISO_FIX, V2f: RISO_FIX, V2g: RISO_FIX,
  B1: RISO_FIX,         // the rave: the bots (~130-260) then, outside, her (u 38)
  V3a: RISO_FIX, V3c: RISO_FIX, V3d: RISO_FIX,   // the bookies: her (u 26), wide .85 to 2.05; the high street: him (u 30), from the lock (zoom ~16) out to 1
  V3e: RISO_FIX, V3f: RISO_FIX,               // the twins' phone and the film set (no camera); the city (Clawd's tree, the blocks)
  Z1: RISO_FIX,                                 // the chase's riso panel: her (u 34)
  Z3: { p: 3.3 }, Z4: { p: 3.3 },                 // the sandbox on her phone (world px, in the camera: .96 to 1.42)
};
let RISO_SHOT = [], RISO_PAPER = null;   // the shots drawing now (innermost last); the frame of the last look('xerox')
function risoWrapShots() {
  RISO_SHOT.done = true;
  if (!window.SHOT) return;
  for (const id of Object.keys(SHOT)) {
    const f = SHOT[id]; if (typeof f !== 'function' || f.risoShot) continue;
    const g = function (...a) { RISO_SHOT.push(id); try { return f.apply(this, a); } finally { RISO_SHOT.pop(); } };
    Object.assign(g, f); g.risoShot = true; SHOT[id] = g;
  }
}
// The dot screen now: f (the factor on a screen's cell), paper (the paper's frame, or null: the screen), K (the print's
// scale on screen against the fine screen: the line grain and the plates' offsets follow it), cen (centred on the screen),
// z (the camera's zoom the line art undoes: RISO_LZ; 1 for prints and outside the table).
function risoScreen() {
  const e = RISO_SHOTS[RISO_SHOT[RISO_SHOT.length - 1]];
  if (!e) return { f: .55, paper: null, K: 1, cen: false, z: 1 };
  if (e.p != null && RISO_PAPER) {   // (on the paper, kept in the band on screen: a print far off doesn't dissolve to flat colour)
    const [a, b, c, d] = RISO_PAPER, s = Math.sqrt(Math.abs(a * d - b * c)) || 1, pp = clamp(e.p * s, RISO_BAND[0], RISO_BAND[1]) / s;
    return { f: pp / RISO_CELL0, paper: RISO_PAPER, K: pp * s / 3.3, cen: false, z: 1 };
  }
  let h = e.p != null ? e.p * RISO_N : typeof e.z === 'function' ? e.z(T) : e.z ?? e.h;
  if (e.z != null) h *= (CAM || LAST_CAM || { zoom: 1 }).zoom;
  const pitch = clamp(h / RISO_N, RISO_BAND[0], RISO_BAND[1]);
  return { f: pitch / RISO_CELL0, paper: null, K: pitch / 3.3, cen: true, z: RISO_LZ.on && e.p == null && e.z == null && CAM ? clamp(CAM.zoom, RISO_LZ.lo, RISO_LZ.hi) : 1 };
}
// Affine maps [a, b, c, d, e, f] (x' = a x + c y + e, y' = b x + d y + f): inverse, and p ∘ q (q first).
const affInv = ([a, b, c, d, e, f]) => { const det = a * d - b * c || 1e-9; return [d / det, -b / det, -c / det, a / det, (c * f - d * e) / det, (b * e - a * f) / det]; };
const affMul = (p, q) => [p[0] * q[0] + p[2] * q[1], p[1] * q[0] + p[3] * q[1], p[0] * q[2] + p[2] * q[3], p[1] * q[2] + p[3] * q[3], p[0] * q[4] + p[2] * q[5] + p[4], p[1] * q[4] + p[3] * q[5] + p[5]];
function halftone(P, tone, col = XEROX.toner, cell = XEROX.cell, angle = XEROX.angle, noFlush = false) {
  const S = risoScreen();
  cell *= S.f;
  // One textured polygon per screen: a repeating dot tile (area = tone), rotated to the screen angle, multiplied over
  // what's below (so overprinted inks mix and white is transparent). Fast: no per-dot drawing.
  if (tone <= .03 || P.length < 3) return;
  if (!noFlush) flushBrush();
  const lvl = Math.min(24, Math.round(clamp(tone) * 24)), tile = dotTile(col, lvl);
  // The screen is locked to the PAGE (screen space), like a real print: every piece and every character, at any scale
  // or camera move, shares one dot grid per ink, so neighbouring pieces' dots line up and nothing crawls. (reg, below,
  // is the ink's registration offset in screen px.) Centred on the screen (it scales about the middle with a zoom), or on
  // a printed object's own paper.
  const a = angle * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), rx = HT_REG[0] * S.f, ry = HT_REG[1] * S.f;
  push(); noStroke(); blendMode(MULTIPLY); textureMode(NORMAL); textureWrap(REPEAT); texture(tile);
  beginShape();
  if (S.paper) {   // the paper's coordinates: (paper frame)⁻¹ ∘ (this piece's frame)
    const A = affMul(affInv(S.paper), curAffine());
    for (const [x, y] of P) { const sx = A[0] * x + A[2] * y + A[4] + rx, sy = A[1] * x + A[3] * y + A[5] + ry; vertex(x, y, 0, (sx * ca + sy * sa) / cell, (-sx * sa + sy * ca) / cell); }
  } else { const ox = S.cen ? W / 2 : 0, oy = S.cen ? H / 2 : 0; for (const [x, y] of P) { const v = worldToScreen(x, y), sx = v.x - ox + rx, sy = v.y - oy + ry; vertex(x, y, 0, (sx * ca + sy * sa) / cell, (-sx * sa + sy * ca) / cell); } }
  endShape(CLOSE);
  blendMode(BLEND); pop();
}
// The current ink's registration offset (screen px), set by processPrint per drum; [0, 0] otherwise.
let HT_REG = [0, 0];
// A dot-screen tile: one dot of the given ink centred in a white square (the texture repeats it); cached per ink/tone.
const DOT_TILES = {};
function dotTile(col, lvl) {
  const key = col + lvl; if (DOT_TILES[key]) return DOT_TILES[key];
  const g = createGraphics(64, 64); g.pixelDensity(1); const c = g.drawingContext;
  c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, 64, 64);
  const r = 64 * .5642 * Math.sqrt(lvl / 24);
  c.fillStyle = col; c.beginPath(); c.arc(32, 32, r, 0, TAU); c.fill();
  if (r > 32) { for (const [x, y] of [[0, 0], [64, 0], [0, 64], [64, 64]]) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); } }   // dots merging at the tile corners
  return DOT_TILES[key] = g;
}
// Colour-copier / multi-drum riso print: the colour is separated into the look's inks (XEROX.process: [[channel,
// ink colour, screen angle], ...], channels c m y k), each printed as its own dot screen at its own angle and out of
// register, overprinting so the dots mix. Skin (o.maxTone) is lifted and its black capped so it never prints as a mask.
function processPrint(P, col, o = {}) {
  _paint(P, { wash: XEROX.paper, washOp: 255, ink: null });   // each piece lays its own paper down first (its dots mix only with its own inks)
  flushBrush();
  if (o.maxTone != null) col = mixCol(col, '#F4E8D8', .06);   // skin: barely lifted, so brown skin keeps its depth (the k cap below stops it crushing)
  const v = parseInt(col.slice(1, 7), 16), r = (v >> 16 & 255) / 255, g = (v >> 8 & 255) / 255, b = (v & 255) / 255;
  let k = 1 - Math.max(r, g, b); const d = 1 - k || 1;
  const crushed = lum(col) < XEROX.crush * .6;   // only the deepest darks print as solid toner
  k = crushed ? 1 : Math.pow(clamp((k - .08) / .92), 1.35) * .78;   // a copier's curve: mids blow out, darks stay open
  const k0 = 1 - Math.max(r, g, b);
  const ch = crushed ? { c: 1, m: 1, y: 1 } : { c: clamp((1 - r - k0) / d), m: clamp((1 - g - k0) / d), y: clamp((1 - b - k0) / d) };   // (crushed darks: all drums full)
  if (o.maxTone != null) k = Math.min(k0 * .85, .5);   // skin: its own depth (no copier curve), never crushed to toner
  if (!XEROX.process.some(p => p[0] === 'k')) { ch.c = Math.min(1, ch.c + k * .8); ch.m = Math.min(1, ch.m + k * .8); ch.y = Math.min(1, ch.y + k * .6); }   // no black drum: build darks from the colours
  ch.k = k;
  // o.spot: print this piece in one drum only (e.g. fire in the fluoro pink): { channel, tone }
  if (o.spot && o.spot.channel) { const dr = XEROX.process.find(p => p[0] === o.spot.channel); if (dr) { halftone(P, o.spot.tone ?? .8, dr[1], XEROX.cell, dr[2], true); return; } }
  let i = 0;
  for (const [c, ink, ang] of XEROX.process) {
    const t = clamp(ch[c] * (c === 'k' ? 1 : .85)); i++;
    if (t < .04) continue;
    const reg = XEROX.reg * (i === 1 ? 0 : i % 2 ? 1 : -.7);   // the first drum is the key; the others sit a hair off it
    if (c === 'k' && t >= 1) { _paint(P, { wash: ink, washOp: 255, ink: null }); flushBrush(); continue; }
    HT_REG = [reg, -reg * .6];
    halftone(P, Math.min(.95, t), ink, XEROX.cell, ang, true);   // (flushed once above)
    HT_REG = [0, 0];
  }
}
// Photocopier and riso marks over the whole frame (screen space, after camEnd), the way a print carries them: nothing
// here changes from frame to frame (the user, 2026-09-26: fresh specks every frame and streaks that jumped and flickered
// read as a projected film's dust and scratches, the rubber hose look's, not a print's). t is unused (kept for callers).
//   The machine's marks, the same on every print from it (so screen-fixed, and the same in every riso shot; a copy of a
//   copy, XEROX.lgen, prints them darker): the lid's shadow down the left edge (wider at the top, where the lid sits open
//   a little) and a trace of the platen's far edge; a hairline scratch on the drum and a fainter streak, along the feed
//   (the sheet goes through left to right, so they run across the picture, never down it like a film's scratches); a
//   clot of toner on the drum printing again at each turn of it; a feed roller's faint track. They print by darkening
//   (the lighter of the mark and what's there is kept dark: the riso line's MIN), so they show on the paper and the pale
//   tints, not on solid ink, and a shot that draws its neighbour under a transition (both calling this) doesn't print
//   them twice as dark.
//   The print's own toner speckle: fixed to the print, so a held shot's specks hold. amt × XEROX.grit sets how much: a
//   copy of a copy (more grit) keeps the specks it copied and adds its own. print: the print's key, a number or a string
//   (default: the film's shot at the clock); a new key is a new sheet, with its own specks.
const RISO_MARKS = {
  lid: [30, 13, .26], far: [8, .1],                       // the lid's shadow: width at the top and bottom (px), its tone at the edge (toner over paper); the far edge's width, tone
  streaks: [[.366, 1.1, .1, 1.3], [.705, 2, .045, 4.1]],  // the drum's streaks along the feed: y (× H), width (px), tone, phase (of the density along it)
  drum: [.2, .164, 640],                                  // the clot on the drum: x of its first print (× W), y (× H), one turn of the drum (px)
  roller: [.118, 16, .03],                                // a feed roller's track: y (× H), height (px), tone at its middle
};
function risoPrintKey() {
  let s = 0;
  if (!window.LOOP && typeof SHOTS !== 'undefined' && SHOTS.length) { let i = 0; while (i + 1 < SHOTS.length && T >= SHOTS[i + 1][0]) i++; s = SHOTS[i][0]; }
  return s * 1.37;
}
function xeroxGrit(t, amt = 1, print = risoPrintKey()) {
  if (!(amt > 0)) return;
  flushBrush();
  const M = RISO_MARKS, tc = color(XEROX.toner), pc = color(XEROX.paper), TR = [red(tc), green(tc), blue(tc)], PR = [red(pc), green(pc), blue(pc)];
  const gk = Math.min(2.2, 1 + .12 * (XEROX.lgen || 0)) * clamp(amt / .4);   // darker with each copy; gone as a caller fades it out
  const tone = k => { k = clamp(k * gk); fill(PR[0] + (TR[0] - PR[0]) * k, PR[1] + (TR[1] - PR[1]) * k, PR[2] + (TR[2] - PR[2]) * k); };
  push(); noStroke();
  blendMode(DARKEST);
  // a feed roller's faint track along the feed (soft: nested bands, darker to the middle)
  { const [u, hh, a] = M.roller, y = u * H; for (let k = 1; k <= 4; k++) { tone(a * k / 4); const h2 = hh * (5 - k) / 4; rect(0, y - h2 / 2, W, h2); } }
  // the drum's streaks: along the feed, their density rising and falling along them (the scratch wears unevenly)
  for (const [u, w, a, ph] of M.streaks) {
    const y = u * H, n = 80, dx = W / n;
    for (let i = 0; i < n; i++) { const v = (i + .5) / n, m = clamp(.62 + .5 * Math.sin(v * 7.3 + ph) * Math.sin(v * 17.9 + ph * 2.3)); if (m > .02) { tone(a * m); rect(i * dx, y - w / 2, dx + .3, w); } }
  }
  // the clot on the drum, with a short smear dragged behind it, printing again at each turn (fainter as it's used up)
  { const [u, v, turn] = M.drum, y0 = v * H;
    for (let k = 0, x0 = u * W; x0 < W; k++, x0 += turn) {
      const f = Math.pow(.72, k);
      tone(.05 * f); rect(x0 - 30, y0 - 1.4, 30, 2.8); tone(.09 * f); rect(x0 - 16, y0 - 1.1, 16, 2.2); tone(.14 * f); rect(x0 - 7, y0 - .9, 7, 1.8);
      tone(.9 * f); for (let j = 0; j < 7; j++) circle(x0 + (hash(j * 3.7 + 1) - .5) * 7, y0 + (hash(j * 5.3 + 2) - .5) * 4, .9 + 1.6 * hash(j * 1.9));
    } }
  // the lid's shadow down the left edge, and the platen's far edge on the right (soft: nested strips, darker to the edge)
  { const [wt, wb, a] = M.lid, n = 16; for (let k = 1; k <= n; k++) { tone(a * (n + 1 - k) / n); quad(0, 0, wt * k / n, 0, wb * k / n, H, 0, H); } }
  { const [w, a] = M.far, n = 6; for (let k = 1; k <= n; k++) { tone(a * (n + 1 - k) / n); rect(W - w * k / n, 0, w * k / n, H); } }
  blendMode(BLEND);
  // the print's toner speckle: most of it scattered, some in clumps
  { const n = Math.round(150 * amt * XEROX.grit), s0 = (typeof print === 'string' ? keyHash(print) * .013 : print) * 1.618 + 3.3;
    const C = [0, 1, 2, 3].map(j => [hash(s0 + j * 5.1) * W, hash(s0 + j * 7.7 + 1) * H]);
    fill(TR[0], TR[1], TR[2]);
    for (let i = 0; i < n; i++) {
      const h = s0 + i * 2.13, c = hash(h) < .3 ? C[i % 4] : null;
      const x = c ? c[0] + (hash(h + .1) + hash(h + .2) - 1) * 70 : hash(h + .3) * W, y = c ? c[1] + (hash(h + .4) + hash(h + .5) - 1) * 50 : hash(h + .6) * H;
      circle(x, y, .5 + 1.9 * Math.pow(hash(h + .7), 3));
    } }
  pop();
}
// ---------- the riso's line art ----------
// How a printer prints line work (the user, 2026-09-25: the lines "look okay but don't really fit how a printer would
// print"). The line as it comes out of the machine, not a pen laid over the print: one even weight (no brush swell or
// taper; the drawing's own weight changes survive, so a tapered mouth stays tapered), no re-inking boil, and the ink's own
// texture fixed to the page like the dot screen (a held drawing is pixel-still; a moving line passes under the grain).
// Riso, copied (the user's pick, 2026-09-25, over a single-drum riso key, photocopier toner and the old brush line): the
// key printed on two drums (blue and fluoro pink overprinting to a deep violet, each drum its own plate a hair apart, so
// pink and blue fringe the line), solid ink through a stencil (mottled density, pinholes, an edge softened by ink
// spread), and the copier's scatter along it. The colour drums are knocked out under it (as a separation leaves them),
// so it prints clean, and the whole key plate sits a hair out of register with them (one offset for the print, not per
// line): a sliver of bare paper along one side of every line, colour along the other.
// Copies of copies (XEROX.lgen, set by cpGeneration): lines thicken, the edge frays, fine lines break up, toner blotches.
// One ribbon per line straight to WebGL with a small shader (the texture is computed per pixel, no per-dot geometry).
// The treatment: w (weight × the brush's mean width), rag (edge wander, px), soft (edge ramp, px), mot (density mottle),
// voids (pinholes), scat (scatter specks), two (a second drum), off (the key plate's offset × the look's registration,
// screen px), off2 (the second drum's plate against the first), ko/trap (the colour knocked out under the line, a trap
// thinner). Screen px are 1080p px at the fine screen, scaled with the print (risoScreen's K).
const RISO_LT = { w: .85, rag: .24, soft: .4, mot: .12, voids: .035, scat: .45, off: [.5, .33], two: 'm', off2: [-.3, .2], ko: true, trap: .22 };
const RISO_REG0 = XEROX.reg || 1.2;   // the look's registration (screen px at the fine screen)
const RISO_BRUSH_W = 6.2;   // the 'ink' brush's mean width per unit of weight (measured: 8.8 at a stroke's start, 4.5 at its end)
// A smooth path through P (curv as the brush's: 0 = straight segments, .5 = Catmull-Rom), sampled every ~3 screen px.
function risoPath(P, closed, curv, sc) {
  const Q = []; for (const p of P) { const l = Q[Q.length - 1]; if (!l || Math.abs(p[0] - l[0]) + Math.abs(p[1] - l[1]) > 1e-3) Q.push(p); }
  if (closed && Q.length > 2) { const a = Q[0], b = Q[Q.length - 1]; if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) < 1e-3) Q.pop(); }
  if (curv <= 0 || Q.length < 3) return Q;
  const n = Q.length, out = [], at = i => closed ? Q[(i + n) % n] : Q[Math.max(0, Math.min(n - 1, i))], segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2), m1 = [(p2[0] - p0[0]) * curv, (p2[1] - p0[1]) * curv], m2 = [(p3[0] - p1[0]) * curv, (p3[1] - p1[1]) * curv];
    const ns = Math.max(1, Math.min(24, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) * sc / 3)));
    for (let j = 0; j < ns; j++) {
      const u = j / ns, u2 = u * u, u3 = u2 * u, a = 2 * u3 - 3 * u2 + 1, b = u3 - 2 * u2 + u, c = -2 * u3 + 3 * u2, d = u3 - u2;
      out.push([a * p1[0] + b * m1[0] + c * p2[0] + d * m2[0], a * p1[1] + b * m1[1] + c * p2[1] + d * m2[1]]);
    }
  }
  if (!closed) out.push(Q[n - 1]);
  return out;
}
// A printed line along P (local coords): w its weight (local px; hw(i, n) a half-width per point overrides it, for a
// shape drawn tapered), closed or open (round ends). Builds the ribbon (the line plus a margin for the ragged edge, the
// scatter and the plates' offsets) and draws it with the treatment's shader.
function risoLine(P, w, closed, curv = 0, hwOf = null, whole = false, kz = null) {
  const T = RISO_LT; if (!P || P.length < 2) return;
  const [a, b, c, d] = curAffine(), det = a * d - b * c, sc = Math.sqrt(Math.abs(det)) || 1;
  if (!(sc > 1e-6)) return;
  const C = hwOf ? P : risoPath(P, closed, curv, sc), n = C.length; if (n < 2) return;
  const Sc = risoScreen(), K = Sc.K;
  // the copy's generation: set by cpGeneration, or read off how far the screen has coarsened (verse1's v1Gen: .9 px a copy)
  const gen = XEROX.lgen || Math.max(0, (XEROX.cell - RISO_CELL0) / .9);
  // the plates' registration: the look's, drifting a little further with each copy (to half as much again); not
  // XEROX.reg itself, which the copies push to 10+ px (harmless for the dots, a phase; a gulf for a line)
  const reg = RISO_REG0 * Math.min(1.5, 1 + .08 * gen) * K;
  const hw0 = w * RISO_BRUSH_W * T.w / 2;   // local
  let hwMax = 0; const HW = new Float32Array(n); for (let i = 0; i < n; i++) { HW[i] = (hwOf ? hwOf(i, n) : hw0) * sc; hwMax = Math.max(hwMax, HW[i]); }
  // on the fixed screen: the camera's zoom undone (Sc.z), the line at its widest no finer than the floor (RISO_LZ); a
  // taper keeps its shape (kz: the whole line's, for its pieces split at a corner)
  const kl = kz ?? (Sc.z !== 1 && hwMax > 0 ? Math.max(1 / Sc.z, Math.min(1, RISO_LZ.floor / 2 / hwMax)) : 1);
  if (kl !== 1) { for (let i = 0; i < n; i++) HW[i] *= kl; hwMax *= kl; }
  if (hwMax < .04) return;
  const o2 = T.two ? [T.off2[0] * reg, T.off2[1] * reg] : [0, 0];
  // the key plate's offset (screen px → local)
  const ox = T.off[0] * reg, oy = T.off[1] * reg, lx = (d * ox - c * oy) / det, ly = (-b * ox + a * oy) / det;
  const mS = 1.2 + T.rag * K * (1 + .35 * gen) * 2 + (T.scat ? 2.6 * K : 0) + Math.hypot(o2[0], o2[1]) + Math.hypot(ox, oy) + gen * .25 * K + hwMax * .06 * gen;   // margin, screen px
  // Sharp corners. The ribbon joins its segments with a miter, capped at 3× its half-width; on the inside of a corner the
  // join's vertex sits back along each segment by (half-width + margin) × tan(turn / 2), and where that overruns the
  // segment (a turn past ~120°, or a short segment between two corners: a sun ray's little flat tip, a star's point) the
  // ribbon folds over itself and the tip printed as a right-angled hook, a "7" (the user). There the line is printed in
  // pieces split at the corner, each with its own round ends, so the corner prints as a point just rounded by the line's
  // width. (Gentle corners and curves keep the one mitred ribbon.)
  if (!whole && n > 2) {
    const sl = (p, q) => { const vx = q[0] - p[0], vy = q[1] - p[1]; return Math.hypot(a * vx + c * vy, b * vx + d * vy); };
    const turn = new Float32Array(n), side = new Int8Array(n), over = new Float32Array(n);
    for (let i = closed ? 0 : 1; i < (closed ? n : n - 1); i++) {
      const p0 = C[(i - 1 + n) % n], p1 = C[i], p2 = C[(i + 1) % n], ux = p1[0] - p0[0], uy = p1[1] - p0[1], vx = p2[0] - p1[0], vy = p2[1] - p1[1];
      if (Math.hypot(ux, uy) < 1e-9 || Math.hypot(vx, vy) < 1e-9) continue;
      turn[i] = Math.abs(Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy)); side[i] = Math.sign(ux * vy - uy * vx);
      over[i] = (HW[i] + mS) * Math.tan(Math.min(turn[i], 2.5) / 2);
    }
    const folds = j => { const k = (j + 1) % n, L = sl(C[j], C[k]); return (side[j] === side[k] ? over[j] + over[k] : Math.max(over[j], over[k])) > L; };   // (segment j → j + 1)
    const cut = [];
    for (let i = closed ? 0 : 1; i < (closed ? n : n - 1); i++) if (turn[i] > 2.09 || (turn[i] > 1.05 && ((closed || i > 0) && folds((i - 1 + n) % n) || (closed || i < n - 1) && folds(i)))) cut.push(i);
    if (cut.length) {
      const piece = idx => risoLine(idx.map(i => C[i]), w, false, 0, hwOf ? (j => hwOf(idx[j], n)) : null, true, kl);
      const span = (i0, i1) => { const idx = []; for (let i = i0; ; i = (i + 1) % n) { idx.push(i); if (i === i1) break; } return idx; };
      if (closed) { if (cut.length === 1) piece(span(cut[0], (cut[0] - 1 + n) % n).concat([cut[0]])); else for (let j = 0; j < cut.length; j++) piece(span(cut[j], cut[(j + 1) % cut.length])); }
      else { const ends = [0, ...cut, n - 1]; for (let j = 0; j + 1 < ends.length; j++) piece(span(ends[j], ends[j + 1])); }
      return;
    }
  }
  const scr = (x, y) => [a * x + c * y, b * x + d * y];   // local vector → screen vector
  // tangents (local, unit) per point, and the screen arc length
  const m = closed ? n + 1 : n, at = i => C[closed ? i % n : i], S = new Float32Array(m + 2);
  for (let i = 1; i < m; i++) { const p = at(i - 1), q = at(i), v = scr(q[0] - p[0], q[1] - p[1]); S[i] = S[i - 1] + Math.hypot(v[0], v[1]); }
  const len = S[m - 1];
  const tan = i => { const p = at(Math.max(0, i - 1)), q = at(Math.min(m - 1, i + 1)); let tx = q[0] - p[0], ty = q[1] - p[1]; const l = Math.hypot(tx, ty) || 1; return [tx / l, ty / l]; };
  const seg = (i, j) => { const p = at(i), q = at(j); let tx = q[0] - p[0], ty = q[1] - p[1]; const l = Math.hypot(tx, ty) || 1; return [tx / l, ty / l]; };
  const V = [], push7 = (x, y, acr, al, sx, sy, hw) => V.push(x + lx, y + ly, acr, al, sx, sy, hw);
  const vert = (p, nx, ny, k, al, t, hw) => {   // the two ribbon vertices at p: normal (local) × k (the miter), across ±(hw + margin)
    const R = hw + mS, rl = R / sc * k, v = scr(nx, ny), st = scr(t[0], t[1]), sl = Math.hypot(st[0], st[1]) || 1, sx = st[0] / sl, sy = st[1] / sl;
    const sg = (v[0] * -sy + v[1] * sx) >= 0 ? 1 : -1;   // which side of the screen tangent the local normal points to
    push7(p[0] + nx * rl, p[1] + ny * rl, sg * R, al, sx, sy, hw); push7(p[0] - nx * rl, p[1] - ny * rl, -sg * R, al, sx, sy, hw);
  };
  for (let i = 0; i < m; i++) {
    const p = at(i), hw = HW[closed ? i % n : i];
    let t, nx, ny, k = 1;
    const inner = closed || (i > 0 && i < m - 1);
    if (inner) {
      const t0 = seg(closed ? (i - 1 + n) % n : i - 1, closed ? i % n : i), t1 = seg(closed ? i % n : i, closed ? (i + 1) % n : i + 1);
      let mx = -(t0[1] + t1[1]), my = t0[0] + t1[0]; const ml = Math.hypot(mx, my);
      if (ml < 1e-4) { mx = -t0[1]; my = t0[0]; } else { mx /= ml; my /= ml; }
      k = Math.min(3, 1 / Math.max(.2, mx * -t0[1] + my * t0[0])); nx = mx; ny = my; t = tan(i);
    } else { t = tan(i); nx = -t[1]; ny = t[0]; }
    if (!closed && i === 0) { const E = (hw + mS), st = scr(t[0], t[1]), el = E / (Math.hypot(st[0], st[1]) || 1); vert([p[0] - t[0] * el, p[1] - t[1] * el], nx, ny, 1, -E, t, hw); }
    vert(p, nx, ny, k, S[i], t, hw);
    if (!closed && i === m - 1) { const E = (hw + mS), st = scr(t[0], t[1]), el = E / (Math.hypot(st[0], st[1]) || 1); vert([p[0] + t[0] * el, p[1] + t[1] * el], nx, ny, 1, len + E, t, hw); }
  }
  const ink = XEROX.process ? XEROX.process[0][1] : XEROX.toner;
  const ink2 = T.two && XEROX.process ? (XEROX.process.find(p => p[0] === T.two) || [])[1] : null;
  if (BANK_BRUSH_DIRTY) flushBrush();
  // the page's grain: screen px → print px (the screen's, centred like the dots; or the paper's own)
  const s2p = Sc.paper ? (() => { const A = affMul(affInv(Sc.paper), [1, 0, 0, 1, -W / 2, -H / 2]), k = 3.3 / (Sc.f * RISO_CELL0); return A.map(v => v * k); })()
    : [1 / K, 0, 0, 1 / K, Sc.cen ? -W / 2 / K : 0, Sc.cen ? -H / 2 / K : 0];
  risoGL(new Float32Array(V), V.length / 7, { ink, ink2, o1: [ox, oy], o2, T, K, gen, len: closed ? -1 : len, s2p });
}
// A tapered face stroke (a shut eye, a mouth line: strokeShape's path and width), printed.
function risoStroke(P, wf) {
  const C = through(P, 12), m = C.length, D = [0];
  for (let i = 1; i < m; i++) D.push(D[i - 1] + Math.hypot(C[i][0] - C[i - 1][0], C[i][1] - C[i - 1][1]));
  const tot = D[m - 1] || 1;
  risoLine(C, 1, false, 0, i => Math.max(0, wf(D[i] / tot)) / 2);
}
const RISO_GL = { prog: null, vao: null, buf: null, u: null, fail: false };
function risoGL(data, nv, o) {
  if (RISO_GL.fail) return;
  let R, gl;
  try { R = p5.instance._renderer; gl = R.GL; if (!gl || !R.states.uPMatrix || !gl.createVertexArray) throw 0; } catch (e) { RISO_GL.fail = true; console.warn('risoLine: needs WebGL2'); return; }
  if (!RISO_GL.prog) {
    const VS = `#version 300 es
in vec2 aPos; in vec4 aLine; in float aHW;
uniform mat4 uP, uV, uM;
out vec4 vLine; out float vHW;
void main() { vLine = aLine; vHW = aHW; gl_Position = uP * uV * uM * vec4(aPos, 0.0, 1.0); }`;
    // vLine: across (signed screen px from the spine), along (screen px from the start), the screen tangent
    const FS = `#version 300 es
precision highp float;
in vec4 vLine; in float vHW;
uniform vec3 uInk, uInk2; uniform float uTwo; uniform vec2 uOff2;
uniform float uPass; uniform vec2 uOff1; uniform vec3 uPaper; uniform float uTrap;   // pass 0: the knockout (uOff1: the key plate's offset)
uniform vec4 uTex;    // rag, soft, mottle, voids
uniform vec4 uTex2;   // scatter, generation, print scale, length (< 0: closed, no ends)
uniform float uDens, uVpH; uniform vec3 uS2Pa, uS2Pb;   // device px per screen px, the target's height (device px), screen → print
vec2 printAt() { vec3 s = vec3(gl_FragCoord.x / uDens, (uVpH - gl_FragCoord.y) / uDens, 1.); return vec2(dot(uS2Pa, s), dot(uS2Pb, s)); }
out vec4 fragColor;
float h21(vec2 p) { vec3 q = fract(vec3(p.xyx) * .1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(h21(i), h21(i + vec2(1., 0.)), f.x), mix(h21(i + vec2(0., 1.)), h21(i + vec2(1., 1.)), f.x), f.y); }
// ink cover at a point: acr/al its place against the line, p its place on the page (print px), sd the drum's grain
// a round speck in a cell of the page's grain (print px): one candidate per cell, kept with probability prob, radius
// r0..r1 (print px); screen-locked like the dots
float speck(vec2 p, float cell, float sd, float prob, float r0, float r1) {
  vec2 q = p / cell, c = floor(q), f = fract(q);
  if (h21(c + sd) >= prob) return 0.;
  vec2 pt = .25 + .5 * vec2(h21(c + sd + 13.1), h21(c + sd + 27.7));
  float r = r0 + (r1 - r0) * h21(c + sd + 3.3), dd = length(f - pt) * cell;
  return 1. - smoothstep(r - .1, r + .1, dd);
}
float cover(float acr, float al, vec2 p, float sd, out float dOut, out float hwOut) {
  float g = min(uTex2.y, 8.), len = uTex2.w;
  float ax = len < 0. ? 0. : max(0., max(-al, al - len));
  float d = length(vec2(ax, acr));
  // copies: the line thickens, and the ink piles up in blotches along it
  float hw = vHW * (1. + .04 * g) + g * .14 * smoothstep(.62, .92, vn(p / 7. + sd * 5.1));
  float rag = uTex.x * (1. + .25 * g);
  float e = hw + rag * ((vn(p * 1.3 + sd) - .5) * 1.5 + (vn(p * 3.4 + sd * 2.3 + 7.) - .5) * .8);
  float cov = clamp((e - d) / uTex.y + .5, 0., 1.);
  // uneven density: the stencil inks some stretches lighter than others
  float mot = 1. - uTex.z * smoothstep(.25, .85, vn(p / 6. + sd * 1.7 + 3.));
  // pinholes: small round voids, more where it's lighter and in the copies
  float hole = speck(p, 1.1, sd + 71., uTex.w * (1. + .35 * g) * (1.8 - mot), .14, .34);
  // fine lines (under ~1.6 px) break into dashes in the copies
  float brk = 1. - (g > 0. ? smoothstep(.55, .75, vn(p / 2.6 + sd * 9.)) * clamp(g / 8., 0., 1.) * clamp(1. - hw / .8, 0., 1.) : 0.);
  dOut = d; hwOut = hw;
  return cov * mot * (1. - hole) * brk;
}
void ink() {
  vec2 p = printAt();
  float d1, hw1, d2, hw2;
  float a1 = cover(vLine.x, vLine.y, p, 0., d1, hw1);
  vec3 col = mix(vec3(1.), uInk, a1);
  if (uTwo > .5) {   // the second drum: its own plate (offset) and its own stencil grain; the inks overprint
    vec2 t = normalize(vLine.zw), nrm = vec2(-t.y, t.x);
    float a2 = cover(vLine.x - dot(nrm, uOff2), vLine.y - dot(t, uOff2), p, 5.3, d2, hw2);
    col *= mix(vec3(1.), uInk2, a2);
  }
  if (uTex2.x > 0.) {   // toner scatter: specks near the edge, one candidate per 1.5 px cell
    float g = min(uTex2.y, 8.), out1 = d1 - hw1;
    float prob = uTex2.x * (1. + .3 * g) * .5 * exp(-max(0., out1) / (.9 + .15 * g)) * step(.2, out1 + .5);
    col = min(col, mix(vec3(1.), uInk, speck(p, 1.5, 41.2, prob, .15, .42)));
  }
  if (min(col.r, min(col.g, col.b)) > .996) discard;
  fragColor = vec4(col, 1.);
}
void main() {
  if (uPass > .5) { ink(); return; }
  // the knockout: the colour plates leave paper under the line (at their own registration, a trap thinner than the
  // line), so the key prints clean over it; where the key plate sits off them, a hair of paper or colour shows
  vec2 p = printAt(), t = normalize(vLine.zw), nrm = vec2(-t.y, t.x);
  float acr = vLine.x + dot(nrm, uOff1), al = vLine.y + dot(t, uOff1), len = uTex2.w;
  float ax = len < 0. ? 0. : max(0., max(-al, al - len));
  float d = length(vec2(ax, acr)), hw = vHW * (1. + .05 * uTex2.y) - uTrap;
  float e = hw + uTex.x * (vn(p * 1.3) - .5) * 1.2;
  float kn = clamp((e - d) / max(.3, uTex.y * .7) + .5, 0., 1.);
  if (kn < .004) discard;
  fragColor = vec4(uPaper, kn);
}`;
    try {
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
      const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS));
      gl.bindAttribLocation(p, 0, 'aPos'); gl.bindAttribLocation(p, 1, 'aLine'); gl.bindAttribLocation(p, 2, 'aHW'); gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const U = {}; for (const k of ['uP', 'uV', 'uM', 'uInk', 'uInk2', 'uTwo', 'uOff2', 'uTex', 'uTex2', 'uDens', 'uPass', 'uOff1', 'uPaper', 'uTrap', 'uVpH', 'uS2Pa', 'uS2Pb']) U[k] = gl.getUniformLocation(p, k);
      const vao0 = gl.getParameter(gl.VERTEX_ARRAY_BINDING), buf0 = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
      const vao = gl.createVertexArray(), buf = gl.createBuffer(); gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 28, 0);
      gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 28, 8);
      gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 28, 24);
      gl.bindVertexArray(vao0); gl.bindBuffer(gl.ARRAY_BUFFER, buf0);
      Object.assign(RISO_GL, { prog: p, vao, buf, u: U });
    } catch (e) { console.warn('risoLine off:', e.message || e); RISO_GL.fail = true; return; }
  }
  const st = R.states, U = RISO_GL.u, T = o.T, rgb = c => { const v = parseInt(c.slice(1, 7), 16); return [(v >> 16 & 255) / 255, (v >> 8 & 255) / 255, (v & 255) / 255]; };
  const prog0 = gl.getParameter(gl.CURRENT_PROGRAM), vao0 = gl.getParameter(gl.VERTEX_ARRAY_BINDING), buf0 = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
  const bl0 = gl.isEnabled(gl.BLEND), eqR = gl.getParameter(gl.BLEND_EQUATION_RGB), eqA = gl.getParameter(gl.BLEND_EQUATION_ALPHA);
  const fs = [gl.BLEND_SRC_RGB, gl.BLEND_DST_RGB, gl.BLEND_SRC_ALPHA, gl.BLEND_DST_ALPHA].map(k => gl.getParameter(k));
  gl.useProgram(RISO_GL.prog); gl.bindVertexArray(RISO_GL.vao); gl.bindBuffer(gl.ARRAY_BUFFER, RISO_GL.buf); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STREAM_DRAW);
  gl.uniformMatrix4fv(U.uP, false, st.uPMatrix.mat4); gl.uniformMatrix4fv(U.uV, false, st.uViewMatrix.mat4); gl.uniformMatrix4fv(U.uM, false, st.uModelMatrix.mat4);
  gl.uniform3fv(U.uInk, rgb(o.ink)); gl.uniform3fv(U.uInk2, rgb(o.ink2 || '#FFFFFF')); gl.uniform1f(U.uTwo, o.ink2 ? 1 : 0); gl.uniform2f(U.uOff2, o.o2[0], o.o2[1]);
  gl.uniform4f(U.uTex, T.rag * o.K, T.soft * o.K, T.mot, T.voids); gl.uniform4f(U.uTex2, T.scat, o.gen, o.K, o.len);
  const vp = gl.getParameter(gl.VIEWPORT), q = o.s2p; gl.uniform1f(U.uDens, vp[2] / W); gl.uniform1f(U.uVpH, vp[3]);
  gl.uniform3f(U.uS2Pa, q[0], q[2], q[4]); gl.uniform3f(U.uS2Pb, q[1], q[3], q[5]);
  gl.uniform2f(U.uOff1, o.o1[0], o.o1[1]); gl.uniform3fv(U.uPaper, rgb(XEROX.paper)); gl.uniform1f(U.uTrap, (T.trap ?? 0) * o.K);
  gl.enable(gl.BLEND);
  if (T.ko) {   // pass 0: the knockout (paper, over)
    gl.uniform1f(U.uPass, 0); gl.blendEquation(gl.FUNC_ADD); gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, nv);
  }
  gl.uniform1f(U.uPass, 1); gl.blendEquation(gl.MIN);   // pass 1: the ink (darken: it prints over what's there, and a ribbon folding on itself doesn't print twice)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, nv);
  gl.blendEquationSeparate(eqR, eqA); gl.blendFuncSeparate(fs[0], fs[1], fs[2], fs[3]); if (!bl0) gl.disable(gl.BLEND);
  gl.bindVertexArray(vao0); gl.bindBuffer(gl.ARRAY_BUFFER, buf0); gl.useProgram(prog0);
}
// ---------- a picture re-printed in the riso print ----------
// risoReprint(P, k): what's been drawn inside P so far, printed again as part of the shot's riso print (the user,
// 2026-09-25: the engraved race on the bookie's TV clashed with the riso shop round it; "the photocopy should be applied
// on top for when it's on the screen in the photocopy scene"). Its line art (anything darker than the colour round it:
// an engraving's lines) prints as the riso line (its treatment's key plate, RISO_LT: blue over pink, each plate a
// hair out of register), thickened a little by the copying; the colour between the lines is separated into the drums
// (processPrint's copier curve) and printed as their dot screens at the shot's pitch and angles, locked to the page
// with the rest of its print (risoScreen, the drums' HT_REG), each drum's plate off by its registration; paper white is
// the riso paper; a few toner specks, fixed to the page (the frame's xeroxGrit marks land over it as over everything).
// k 0..1: mixed over the picture as it was (fade it out as the camera pushes into the screen). P: a convex polygon (a
// screen's quad) in the current coordinates, or screen px with o.screen; o.fill: the widest gap between the picture's
// lines (screen px), o.thick: the copy's thickening (screen px at the fine screen), o.full: a full-strength line's
// contrast against its ground (the bank ink's on its paper), o.gain: the copy's gain on the line (< 1: heavier), o.tint:
// how much of the ground's mean colour prints as a tint under its lines (0: only the colour between them). Call it right after the picture is
// drawn and before anything in front of it (glass, rain, figures: riso already). One GL pass: the region is copied off
// the canvas into a texture and drawn back over P through a shader (no per-dot geometry).
const RISO_RP = { prog: null, vao: null, buf: null, tex: null, tw: 0, th: 0, u: null, fail: false, checked: false };
function risoReprint(P, k = 1, o = {}) {
  if (!(k > .003) || RISO_RP.fail || !XEROX.process || !P || P.length < 3) return;
  let R, gl;
  try { R = p5.instance._renderer; gl = R.GL; if (!gl || !gl.createVertexArray) throw 0; } catch (e) { RISO_RP.fail = true; console.warn('risoReprint: needs WebGL2'); return; }
  flushBrush();
  // the polygon on the screen (1080p px); its box on the drawing (device px, GL rows from the bottom), with a margin for
  // the samples taken round each pixel
  const M = o.screen ? null : curAffine(), S = P.map(([x, y]) => M ? [M[0] * x + M[2] * y + M[4] + W / 2, M[1] * x + M[3] * y + M[5] + H / 2] : [x, y]);
  const vp = gl.getParameter(gl.VIEWPORT), dens = vp[2] / W, vpH = vp[3], mg = 10;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; for (const [x, y] of S) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const bx = Math.max(0, Math.floor((x0 - mg) * dens)), bx1 = Math.min(vp[2], Math.ceil((x1 + mg) * dens));
  const by = Math.max(0, Math.floor(vpH - (y1 + mg) * dens)), by1 = Math.min(vpH, Math.ceil(vpH - (y0 - mg) * dens)), bw = bx1 - bx, bh = by1 - by;
  if (bw < 2 || bh < 2) return;
  if (!RISO_RP.prog) {
    const VS = `#version 300 es
in vec2 aPos; uniform vec2 uScr;
void main() { gl_Position = vec4(aPos.x / uScr.x * 2. - 1., 1. - aPos.y / uScr.y * 2., 0., 1.); }`;
    const FS = `#version 300 es
precision highp float;
uniform sampler2D uSrc; uniform vec4 uBox; uniform vec2 uTexSz;   // the copied region: its box (device px, GL), the texture's size
uniform float uDens, uVpH, uK;
uniform vec3 uPaper, uToner, uInk0, uInk1, uInk2, uAng, uCh;       // the drums in print order: inks, screen angles, channels (0 c, 1 m, 2 y)
uniform vec2 uReg0, uReg1, uReg2;                                  // each drum's registration (screen px): its plate and its dot screen
uniform float uCell, uCellPx; uniform vec3 uS2Ga, uS2Gb;           // the pitch (grid units; screen px), screen px → the dot grid
uniform float uLMot; uniform vec2 uLOff1, uLOff2;                  // the line: mottle, the key plate's offset, the next plate's against it (screen px)
uniform vec3 uS2Pa, uS2Pb;                                         // screen px → print px (the ink's grain, the specks)
uniform vec4 uCopy;                                                // fill radius, thickening (device px), a full line's contrast, the copy's gain
uniform float uCrush, uTint;
out vec4 fragColor;
const vec2 DIR[8] = vec2[8](vec2(1., 0.), vec2(.7071, .7071), vec2(0., 1.), vec2(-.7071, .7071), vec2(-1., 0.), vec2(-.7071, -.7071), vec2(0., -1.), vec2(.7071, -.7071));
const vec2 DIR2[8] = vec2[8](vec2(.9239, .3827), vec2(.3827, .9239), vec2(-.3827, .9239), vec2(-.9239, .3827), vec2(-.9239, -.3827), vec2(-.3827, -.9239), vec2(.3827, -.9239), vec2(.9239, -.3827));
vec3 src(vec2 d) { d = clamp(d, uBox.xy + .5, uBox.xy + uBox.zw - .5); return texture(uSrc, (d - uBox.xy) / uTexSz).rgb; }
float luma(vec3 c) { return dot(c, vec3(.299, .587, .114)); }
vec2 dev(vec2 s) { return vec2(s.x * uDens, uVpH - s.y * uDens); }
float pick(vec3 t, float ch) { return ch < .5 ? t.x : ch < 1.5 ? t.y : t.z; }   // (a drum's channel's value)
// the colour round a point: the brightest of two rings of samples (the paper or colour between the lines)
// The tone printed there: that colour, or where no strong line is near (the pale underprint of a banknote's ground: its
// ruled sky and turf) partly the picture's mean colour round the point (uTint), so the ground carries a light riso tint
// of its ruling's colour under the lines, as a riso copy of line art over a ground does.
vec3 fillAt(vec2 d, out float fl) {
  vec3 b = src(d), mean = b; fl = luma(b); float mn = fl;
  for (int i = 0; i < 8; i++) {
    vec3 c = src(d + DIR[i] * uCopy.x); float l = luma(c); if (l > fl) { fl = l; b = c; } mn = min(mn, l); mean += c;
    c = src(d + DIR2[i] * uCopy.x * .5); l = luma(c); if (l > fl) { fl = l; b = c; } mn = min(mn, l); mean += c;
  }
  float strong = smoothstep(.55, .75, (fl - mn) / max(fl, .15));
  return mix(b, mean / 17., uTint * (1. - strong));
}
// the line at a point: how much ink the picture has there against the colour round it (fc, luma fl), from the darkest
// within the thickening, as a share of a full-strength line (uCopy.z: its contrast), less the faintest (a copier drops
// them), with the copy's gain (uCopy.w: lines print a little heavier). lc: the ink's own colour (unmixed from fc).
float lineAt(vec2 d, float rd, vec3 fc, float fl, out vec3 lc, out float con) {
  vec3 c = src(d); float m = luma(c);
  if (rd > .05) for (int i = 0; i < 8; i++) { vec3 q = src(d + DIR[i] * rd); float l = luma(q); if (l < m) { m = l; c = q; } }
  con = (fl - m) / max(fl, .15);
  float a = clamp((con / uCopy.z - .06) / .94, 0., 1.);
  lc = clamp(fc + (c - fc) / max(a, .3), 0., 1.);
  return pow(a, uCopy.w);
}
// the drums a line of colour c prints on (c, m, y; each solid or not: line art isn't screened): its hue's drums (teal:
// blue; red: pink and yellow), and the darkest lines (con: their contrast) blue over pink, like the shot's own line
vec3 lineInks(vec3 c, float con) {
  float k0 = 1. - max(c.r, max(c.g, c.b)), d = max(1e-3, 1. - k0);
  float k = pow(clamp((k0 - .08) / .92, 0., 1.), 1.35) * .78;
  vec3 ch = clamp((vec3(1.) - c - k0) / d, 0., 1.) + k * vec3(.8, .8, 0.);
  vec3 sh = smoothstep(.45, .65, ch / max(max(ch.x, max(ch.y, ch.z)), 1e-3));
  float dk = smoothstep(.74, .86, con); return max(sh, vec3(dk, dk, 0.));
}
// a line's coverage on its drums keeping the picture's tone: the ink it replaces against the drums' overprint (three
// drums print far darker than an olive line; one blue a little lighter than the teal)
float lineTone(vec3 lc, vec3 sh) {
  vec3 ov = mix(vec3(1.), uInk0, pick(sh, uCh.x)) * mix(vec3(1.), uInk1, pick(sh, uCh.y)) * mix(vec3(1.), uInk2, pick(sh, uCh.z));
  return clamp((1. - luma(lc)) / max(1. - luma(ov), .1), 0., 1.25);
}
// processPrint's separation: a colour into the drums' tones (c, m, y), the copier's curve, darks built from the colours
vec3 sep(vec3 c) {
  float k0 = 1. - max(c.r, max(c.g, c.b)), d = max(1e-3, 1. - k0), L = luma(c);
  float k = pow(clamp((k0 - .08) / .92, 0., 1.), 1.35) * .78;
  vec3 ch = clamp((vec3(1.) - c - k0) / d, 0., 1.);
  float cr = 1. - smoothstep(uCrush - .01, uCrush + .01, L);   // (crushed darks: every drum full)
  ch = mix(ch, vec3(1.), cr); k = mix(k, 1., cr);
  ch = min(vec3(1.), ch + k * vec3(.8, .8, .6));
  vec3 t = min(ch * .85, vec3(.95));
  return t * smoothstep(.03, .05, t);
}
// a drum's dot at screen point s: the screen's dot grid (angle, pitch, registration), radius by tone (area = tone)
float dotAt(vec2 s, vec2 reg, float ang, float tone) {
  if (tone < .02) return 0.;
  vec3 s3 = vec3(s, 1.); vec2 q = vec2(dot(uS2Ga, s3), dot(uS2Gb, s3)) + reg;
  float ca = cos(ang), sa = sin(ang); vec2 uv = vec2(q.x * ca + q.y * sa, -q.x * sa + q.y * ca) / uCell;
  float dd = length(fract(uv) - .5), r = sqrt(tone / 3.14159265), aa = .55 / (uCellPx * uDens);
  return 1. - smoothstep(r - aa, r + aa, dd);
}
float h21(vec2 p) { vec3 q = fract(vec3(p.xyx) * .1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(h21(i), h21(i + vec2(1., 0.)), f.x), mix(h21(i + vec2(0., 1.)), h21(i + vec2(1., 1.)), f.x), f.y); }
float speck(vec2 p, float cell, float sd, float prob, float r0, float r1) {
  vec2 q = p / cell, c = floor(q), f = fract(q);
  if (h21(c + sd) >= prob) return 0.;
  vec2 pt = .25 + .5 * vec2(h21(c + sd + 13.1), h21(c + sd + 27.7));
  float r = r0 + (r1 - r0) * h21(c + sd + 3.3), dd = length(f - pt) * cell;
  return 1. - smoothstep(r - .15, r + .15, dd);
}
void main() {
  vec2 s = vec2(gl_FragCoord.x / uDens, (uVpH - gl_FragCoord.y) / uDens), d = gl_FragCoord.xy;
  vec3 orig = texelFetch(uSrc, ivec2(d - uBox.xy), 0).rgb;
  vec3 s3 = vec3(s, 1.); vec2 pp = vec2(dot(uS2Pa, s3), dot(uS2Pb, s3));
  float fl, f1, f2;
  vec3 c0 = fillAt(dev(s + uReg0), fl), c1 = fillAt(dev(s + uReg1), f1), c2 = fillAt(dev(s + uReg2), f2);
  // the line art on each drum's plate (the key's where the shot's line prints it, the others a hair off it either
  // side), the ink's grain in it; the colour screens knocked out under the line
  vec3 l0, l1, l2, lk; float q0, q1, q2, qk;
  float ln0 = lineAt(dev(s - uLOff1), uCopy.y, c0, fl, l0, q0) * (1. - uLMot * smoothstep(.25, .85, vn(pp / 6. + 3.)));
  float ln1 = lineAt(dev(s - uLOff1 - uLOff2), uCopy.y, c0, fl, l1, q1) * (1. - uLMot * smoothstep(.25, .85, vn(pp / 6. + 12.01)));
  float ln2 = lineAt(dev(s - uLOff1 + uLOff2), uCopy.y, c0, fl, l2, q2) * (1. - uLMot * smoothstep(.25, .85, vn(pp / 6. + 21.7)));
  float ko = lineAt(dev(s - uLOff1), 0., c0, fl, lk, qk);
  vec3 h0 = lineInks(l0, q0), h1 = lineInks(l1, q1), h2 = lineInks(l2, q2);
  ln0 = clamp(ln0 * pick(h0, uCh.x) * lineTone(l0, h0), 0., 1.); ln1 = clamp(ln1 * pick(h1, uCh.y) * lineTone(l1, h1), 0., 1.); ln2 = clamp(ln2 * pick(h2, uCh.z) * lineTone(l2, h2), 0., 1.);
  // each drum: its dots or its line (one ink, it can't print twice), multiplied over the paper and the other drums
  vec3 col = uPaper;
  col *= mix(vec3(1.), uInk0, max(ln0, dotAt(s, uReg0, uAng.x, pick(sep(c0), uCh.x)) * (1. - ko)));
  col *= mix(vec3(1.), uInk1, max(ln1, dotAt(s, uReg1, uAng.y, pick(sep(c1), uCh.y)) * (1. - ko)));
  col *= mix(vec3(1.), uInk2, max(ln2, dotAt(s, uReg2, uAng.z, pick(sep(c2), uCh.z)) * (1. - ko)));
  col = mix(col, uToner, speck(pp, 7., 19.7, .02, .2, .5));   // (toner specks on the page)
  fragColor = vec4(mix(orig, col, uK), 1.);
}`;
    try {
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
      const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS));
      gl.bindAttribLocation(p, 0, 'aPos'); gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const U = {}; for (const k of ['uScr', 'uSrc', 'uBox', 'uTexSz', 'uDens', 'uVpH', 'uK', 'uPaper', 'uToner', 'uInk0', 'uInk1', 'uInk2', 'uAng', 'uCh', 'uReg0', 'uReg1', 'uReg2', 'uCell', 'uCellPx', 'uS2Ga', 'uS2Gb', 'uLMot', 'uLOff1', 'uLOff2', 'uS2Pa', 'uS2Pb', 'uCopy', 'uCrush', 'uTint']) U[k] = gl.getUniformLocation(p, k);
      const vao0 = gl.getParameter(gl.VERTEX_ARRAY_BINDING), buf0 = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
      const vao = gl.createVertexArray(), buf = gl.createBuffer(); gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
      gl.bindVertexArray(vao0); gl.bindBuffer(gl.ARRAY_BUFFER, buf0);
      Object.assign(RISO_RP, { prog: p, vao, buf, u: U, tex: gl.createTexture() });
    } catch (e) { console.warn('risoReprint off:', e.message || e); RISO_RP.fail = true; return; }
  }
  const U = RISO_RP.u, rgb = c => { const v = parseInt(c.slice(1, 7), 16); return [(v >> 16 & 255) / 255, (v >> 8 & 255) / 255, (v & 255) / 255]; };
  // save
  const prog0 = gl.getParameter(gl.CURRENT_PROGRAM), vao0 = gl.getParameter(gl.VERTEX_ARRAY_BINDING), buf0 = gl.getParameter(gl.ARRAY_BUFFER_BINDING), at0 = gl.getParameter(gl.ACTIVE_TEXTURE);
  gl.activeTexture(gl.TEXTURE0); const tex0 = gl.getParameter(gl.TEXTURE_BINDING_2D), rfb0 = gl.getParameter(gl.READ_FRAMEBUFFER_BINDING), dfb = gl.getParameter(gl.DRAW_FRAMEBUFFER_BINDING);
  const bl0 = gl.isEnabled(gl.BLEND), dt0 = gl.isEnabled(gl.DEPTH_TEST), cf0 = gl.isEnabled(gl.CULL_FACE), dm0 = gl.getParameter(gl.DEPTH_WRITEMASK);
  try {
    // the region, off the canvas (grown as needed, never shrunk)
    gl.bindTexture(gl.TEXTURE_2D, RISO_RP.tex);
    if (bw > RISO_RP.tw || bh > RISO_RP.th) {
      RISO_RP.tw = Math.max(bw, RISO_RP.tw); RISO_RP.th = Math.max(bh, RISO_RP.th);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, RISO_RP.tw, RISO_RP.th, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    if (!RISO_RP.checked) gl.getError();
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, dfb); gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, bx, by, bw, bh); gl.bindFramebuffer(gl.READ_FRAMEBUFFER, rfb0);
    if (!RISO_RP.checked) { RISO_RP.checked = true; const e = gl.getError(); if (e) { console.warn('risoReprint off: the copy failed (GL error ' + e + ')'); RISO_RP.fail = true; return; } }
    // the shot's print: its dot screen (pitch, grid, the drums' registration) and its line
    const Sc = risoScreen(), cell = XEROX.cell * Sc.f, K = Sc.K;
    const psc = Sc.paper ? Math.sqrt(Math.abs(Sc.paper[0] * Sc.paper[3] - Sc.paper[1] * Sc.paper[2])) || 1 : 1;
    const G = Sc.paper ? affMul(affInv(Sc.paper), [1, 0, 0, 1, -W / 2, -H / 2]) : [1, 0, 0, 1, Sc.cen ? -W / 2 : 0, Sc.cen ? -H / 2 : 0];
    const s2p = Sc.paper ? (() => { const kk = 3.3 / (Sc.f * RISO_CELL0); return G.map(v => v * kk); })() : [1 / K, 0, 0, 1 / K, Sc.cen ? -W / 2 / K : 0, Sc.cen ? -H / 2 / K : 0];
    const D = XEROX.process.slice(0, 3); while (D.length < 3) D.push(['y', '#FFFFFF', 0]);
    const regOf = i => { const r = XEROX.reg * (i === 0 ? 0 : (i + 1) % 2 ? 1 : -.7); return [r * Sc.f, -r * .6 * Sc.f]; };   // (processPrint's, drum by drum)
    const T = RISO_LT, gen = 1, lreg = RISO_REG0 * Math.min(1.5, 1 + .08 * gen) * K;   // (the shot's line's plates; a copy: one generation)
    gl.useProgram(RISO_RP.prog); gl.bindVertexArray(RISO_RP.vao); gl.bindBuffer(gl.ARRAY_BUFFER, RISO_RP.buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(S.flat()), gl.STREAM_DRAW);
    gl.uniform2f(U.uScr, W, H); gl.uniform1i(U.uSrc, 0); gl.uniform4f(U.uBox, bx, by, bw, bh); gl.uniform2f(U.uTexSz, RISO_RP.tw, RISO_RP.th);
    gl.uniform1f(U.uDens, dens); gl.uniform1f(U.uVpH, vpH); gl.uniform1f(U.uK, clamp(k));
    gl.uniform3fv(U.uPaper, rgb(XEROX.paper)); gl.uniform3fv(U.uToner, rgb(XEROX.toner));
    [U.uInk0, U.uInk1, U.uInk2].forEach((u, i) => gl.uniform3fv(u, rgb(D[i][1])));
    gl.uniform3f(U.uAng, ...D.map(d => d[2] * Math.PI / 180)); gl.uniform3f(U.uCh, ...D.map(d => Math.max(0, 'cmy'.indexOf(d[0]))));
    [U.uReg0, U.uReg1, U.uReg2].forEach((u, i) => gl.uniform2f(u, ...regOf(i)));
    gl.uniform1f(U.uCell, cell); gl.uniform1f(U.uCellPx, cell * psc);
    gl.uniform3f(U.uS2Ga, G[0], G[2], G[4]); gl.uniform3f(U.uS2Gb, G[1], G[3], G[5]);
    const o2 = (T.off2 || [-.3, .2]).map(v => v * .6);   // (the next plate against the key: the shot's second drum's, or c's; closer, for lines this fine)
    gl.uniform1f(U.uLMot, T.mot); gl.uniform2f(U.uLOff1, T.off[0] * lreg, T.off[1] * lreg); gl.uniform2f(U.uLOff2, o2[0] * lreg, o2[1] * lreg);
    gl.uniform3f(U.uS2Pa, s2p[0], s2p[2], s2p[4]); gl.uniform3f(U.uS2Pb, s2p[1], s2p[3], s2p[5]);
    gl.uniform4f(U.uCopy, (o.fill ?? 2.5) * dens, (o.thick ?? .08) * K * dens, o.full ?? .72, o.gain ?? .8);
    gl.uniform1f(U.uCrush, XEROX.crush * .6); gl.uniform1f(U.uTint, o.tint ?? .7);
    gl.disable(gl.BLEND); gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE); gl.depthMask(false);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, S.length);
  } finally {
    // restore
    if (bl0) gl.enable(gl.BLEND); if (dt0) gl.enable(gl.DEPTH_TEST); if (cf0) gl.enable(gl.CULL_FACE); gl.depthMask(dm0);
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, rfb0);
    gl.bindTexture(gl.TEXTURE_2D, tex0); gl.activeTexture(at0);
    gl.bindVertexArray(vao0); gl.bindBuffer(gl.ARRAY_BUFFER, buf0); gl.useProgram(prog0);
  }
}
// Security paper for a banknote: a pale two-tone wash with fine wavy underprint lines.
function bankPaper(x, y, w, h, o = {}) {
  _paint(U([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], 1), { wash: o.paper || BANK.paper, ink: null });
  const P = U([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], 1);
  waveLines(P, o.d ?? 9, o.a ?? 12, 3, 140, mixCol(o.paper || BANK.paper, o.tint || BANK.tint, .9), .5);
}

// ---------- the bank look: figure and ground ----------
// How a banknote parts its portrait from its ground, as one system (the user, 2026-09-25: the main characters must be
// noticeably different from the background and props behind them):
//   FIGURE  every cast rig (person, commuter, clawd, the bosses, the bots: wrapped on the first frame) and anything drawn
//           inside bankFigure(): deep-engraved, the intaglio layer. The darkest ink, heavier outlines, and its own line
//           language: swelling contour hatching (lines run round the form, bowed, swelling toward the side away from the
//           light and breaking to bare paper in the lights, cross-hatched along the form in the shadows) and, on skin,
//           stipple (dot-punched tone). The full value range, paper to near-black.
//   GROUND  everything else (sets, props): the pale mechanical underprint. Straight ruled tints, all one direction, in a
//           paler tint of the ink, finer paler outlines, a narrow light-to-mid value band.
//   HALO    bankHalo(x, y, rx, ry): the ground fades to bare paper in a soft oval round a figure (the vignetted
//           portrait). Draw it over the ground, before the cast.
// A rig's `table` callback (zuck's: the table and what's on it) is ground again (bankGround).
let BANK_FIGD = 0;
const bankInFig = () => BANK_FIGD > 0 && STYLE.mode === 'bank';
const bankInGround = () => BANK_FIGD === 0 && STYLE.mode === 'bank';
function bankFigure(fn) { const bn = BOILN; BANK_FIGD++; if (STYLE.mode === 'bank') BOILN = 0; try { return fn(); } finally { BANK_FIGD--; BOILN = bn; } }
function bankGround(fn) { const d = BANK_FIGD; BANK_FIGD = 0; try { return fn(); } finally { BANK_FIGD = d; } }
// The cast rigs, wrapped once (on the first frame, after every cast file has loaded): in the bank look a rig draws as a
// figure; in every other look the wrapper just calls through (those frames are unchanged).
const BANK_RIGS = ['person', 'commuter', 'clawd', 'musk', 'zuck', 'dorsey', 'altman', 'turnbull', 'dario', 'grok', 'muse', 'copilot', 'gemini', 'codex', 'clawd2'];
let BANK_RIGS_DONE = false;
function bankWrapRigs() {
  BANK_RIGS_DONE = true;
  bankBrushHooks();
  for (const nm of BANK_RIGS) {
    const f = window[nm]; if (typeof f !== 'function' || f.bankFig) continue;
    const g = function (...a) {
      if (STYLE.mode !== 'bank') return f.apply(this, a);
      const i = a.length - 1, o = a[i];
      if (o && typeof o === 'object' && typeof o.table === 'function') { const tb = o.table; a[i] = { ...o, table: (...b) => bankGround(() => tb(...b)) }; }
      const bn = BOILN; BANK_FIGD++; BOILN = 0;   // (the figure's pen grain: still)
      try { return f.apply(this, a); } finally { BANK_FIGD--; BOILN = bn; }
    };
    Object.assign(g, f); g.bankFig = true; window[nm] = g;
  }
  inkWrapRigs();   // (and the ink look's figure scopes: its line weights, style.js inkFigSW)
}
// The figure's ink: the line colour taken down toward a deep ink (intaglio prints darkest); the ground's: toward paper.
const bankFigCol = c => mixCol(c, mixCol(BANK.ink, '#040A0C', .62), .42);
const bankGroundCol = (c, f = bankFg()) => mixCol(c, BANK.paper, lerp(.22, .08, f));   // (the user, 2026-09-26: the ground's lines a little stronger; was .34, .16)
// Skin: a piece marked o.maxTone, or a light warm colour (Musk's head carries no maxTone).
// (by chroma, max - min channel: the bosses' skins run .2-.3, a red roadster .5, tan leather .4)
function bankSkin(col, o) {
  if (o.maxTone != null) return true;
  const v = parseInt(col.slice(1, 7), 16), r = (v >> 16 & 255) / 255, g = (v >> 8 & 255) / 255, b = (v & 255) / 255, ch = Math.max(r, g, b) - Math.min(r, g, b), h = hueSat(col)[0], L = lum(col);
  return h >= 8 && h <= 40 && ch > .1 && ch < .36 && L > .5 && L < .9;
}
// Triangles, crisp (plain geometry, not the brush: an intaglio line is crisp and swells; and it's far cheaper than dabs).
// The brush's queue is flushed first so the triangles land over what's drawn so far, in order.
function bankTris(T, col) {
  if (T.length < 6) return;
  if (BANK_BRUSH_DIRTY) flushBrush();
  if (BANK_RAWGL && bankTrisGL(T, col)) return;
  push(); noStroke(); fill(col); beginShape(TRIANGLES); for (let i = 0; i < T.length; i += 2) vertex(T[i], T[i + 1]); endShape(); pop();
}
// The brush defers washes and strokes (see core.js flushBrush): a flush is only needed when some are waiting. Every
// brush drawing call marks the queue dirty; a flush (a composite of the whole drawing: ~0.7 ms at supersampled 4K)
// clears it. Only bankTris consults it; everything else flushes as it always did.
let BANK_BRUSH_DIRTY = true;
{ const fb0 = flushBrush; flushBrush = function () { fb0(); BANK_BRUSH_DIRTY = false; }; }
function bankBrushHooks() {
  for (const m of ['polygon', 'spline', 'endShape', 'line', 'rect', 'circle', 'flowLine', 'endStroke', 'plot']) {
    const f = brush[m]; if (typeof f !== 'function' || f.bankDirty) continue;
    const g = function (...a) { BANK_BRUSH_DIRTY = true; return f.apply(this, a); }; g.bankDirty = true; brush[m] = g;
  }
}
// The triangles straight to WebGL (?bankgl=0, a check: through p5's immediate mode instead). p5's beginShape costs ~1.4 µs a
// vertex and an engraved frame can carry half a million. Same canvas, same framebuffer and the same matrices as p5's
// own fill shader; every piece of GL state touched is put back as it was (the program, the array buffer, attribute 0, the blend),
// so p5 and p5.brush carry on unaware. Returns false (the caller falls back to p5) if anything's unavailable.
const BANK_RAWGL = (new URLSearchParams(location.search).get('bankgl') ?? '1') !== '0';
const BANK_GL = { prog: null, buf: null, u: null, fail: false };
function bankTrisGL(T, col) {
  if (BANK_GL.fail) return false;
  let R, gl;
  try { R = p5.instance._renderer; gl = R.GL; if (!gl || !R.states.uPMatrix) throw 0; } catch (e) { BANK_GL.fail = true; return false; }
  if (!BANK_GL.prog) {
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    try {
      const p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, 'attribute vec2 aPos; uniform mat4 uP; uniform mat4 uV; uniform mat4 uM; void main() { gl_Position = uP * uV * uM * vec4(aPos, 0.0, 1.0); }'));
      gl.attachShader(p, sh(gl.FRAGMENT_SHADER, 'precision mediump float; uniform vec4 uC; void main() { gl_FragColor = uC; }'));
      gl.bindAttribLocation(p, 0, 'aPos'); gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      BANK_GL.prog = p; BANK_GL.buf = gl.createBuffer();
      BANK_GL.u = { P: gl.getUniformLocation(p, 'uP'), V: gl.getUniformLocation(p, 'uV'), M: gl.getUniformLocation(p, 'uM'), C: gl.getUniformLocation(p, 'uC') };
    } catch (e) { console.warn('bankTrisGL off:', e.message || e); BANK_GL.fail = true; return false; }
  }
  const st = R.states, v = parseInt(col.slice(1, 7), 16);
  // save
  const prog0 = gl.getParameter(gl.CURRENT_PROGRAM), buf0 = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
  // (the blend too: p5 applies its blend mode lazily, so after glow()'s blendMode(ADD) the GL state stays additive
  // until p5 next draws, and triangles drawn meanwhile printed as light: a rose window's rosette came out white)
  const bl0 = gl.isEnabled(gl.BLEND), bf0 = [gl.BLEND_SRC_RGB, gl.BLEND_DST_RGB, gl.BLEND_SRC_ALPHA, gl.BLEND_DST_ALPHA].map(k => gl.getParameter(k)), be0 = [gl.getParameter(gl.BLEND_EQUATION_RGB), gl.getParameter(gl.BLEND_EQUATION_ALPHA)];
  const en0 = gl.getVertexAttrib(0, gl.VERTEX_ATTRIB_ARRAY_ENABLED), ab0 = gl.getVertexAttrib(0, gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING);
  const sz0 = gl.getVertexAttrib(0, gl.VERTEX_ATTRIB_ARRAY_SIZE), ty0 = gl.getVertexAttrib(0, gl.VERTEX_ATTRIB_ARRAY_TYPE), nm0 = gl.getVertexAttrib(0, gl.VERTEX_ATTRIB_ARRAY_NORMALIZED), sd0 = gl.getVertexAttrib(0, gl.VERTEX_ATTRIB_ARRAY_STRIDE), of0 = gl.getVertexAttribOffset(0, gl.VERTEX_ATTRIB_ARRAY_POINTER);
  const dv0 = gl.VERTEX_ATTRIB_ARRAY_DIVISOR ? gl.getVertexAttrib(0, gl.VERTEX_ATTRIB_ARRAY_DIVISOR) : 0;
  // draw
  gl.useProgram(BANK_GL.prog);
  gl.uniformMatrix4fv(BANK_GL.u.P, false, st.uPMatrix.mat4); gl.uniformMatrix4fv(BANK_GL.u.V, false, st.uViewMatrix.mat4); gl.uniformMatrix4fv(BANK_GL.u.M, false, st.uModelMatrix.mat4);
  gl.uniform4f(BANK_GL.u.C, (v >> 16 & 255) / 255, (v >> 8 & 255) / 255, (v & 255) / 255, 1);
  gl.enable(gl.BLEND); gl.blendEquation(gl.FUNC_ADD); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);   // (opaque ink: the colour itself)
  gl.bindBuffer(gl.ARRAY_BUFFER, BANK_GL.buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(T), gl.STREAM_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); if (dv0) gl.vertexAttribDivisor(0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, T.length / 2);
  // restore
  if (ab0) { gl.bindBuffer(gl.ARRAY_BUFFER, ab0); gl.vertexAttribPointer(0, sz0, ty0, nm0, sd0, of0); }
  if (dv0) gl.vertexAttribDivisor(0, dv0);
  if (!en0) gl.disableVertexAttribArray(0);
  gl.blendEquationSeparate(be0[0], be0[1]); gl.blendFuncSeparate(bf0[0], bf0[1], bf0[2], bf0[3]); if (!bl0) gl.disable(gl.BLEND);
  gl.bindBuffer(gl.ARRAY_BUFFER, buf0); gl.useProgram(prog0);
  return true;
}
// A polyline with a width at each point, as triangles (a swelling line, tapering where the width goes to 0).
function bankSwell(T, pts, ws, wmin) {
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1], wa = ws[i], wb = ws[i + 1];
    if (wa < wmin && wb < wmin) continue;
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    const ha = Math.max(0, wa) / 2, hb = Math.max(0, wb) / 2;
    const A1 = [a[0] + nx * ha, a[1] + ny * ha], A2 = [a[0] - nx * ha, a[1] - ny * ha], B1 = [b[0] + nx * hb, b[1] + ny * hb], B2 = [b[0] - nx * hb, b[1] - ny * hb];
    T.push(A1[0], A1[1], B1[0], B1[1], B2[0], B2[1], A1[0], A1[1], B2[0], B2[1], A2[0], A2[1]);
  }
}
// The piece's frame for modelling: centroid, long axis angle, elongation, size, and the tone at a point (k, darker
// away from the light by lam; LIGHT.dir, mirrored with XF).
function bankForm(P, k, lam = .5) {
  let cx = 0, cy = 0; for (const [x, y] of P) { cx += x; cy += y; } cx /= P.length; cy /= P.length;
  let sxx = 0, syy = 0, sxy = 0; for (const [x, y] of P) { const dx = x - cx, dy = y - cy; sxx += dx * dx; syy += dy * dy; sxy += dx * dy; }
  sxx /= P.length; syy /= P.length; sxy /= P.length;
  const tr = sxx + syy, q = Math.sqrt(Math.max(0, tr * tr / 4 - (sxx * syy - sxy * sxy))), l1 = tr / 2 + q, l2 = Math.max(1e-6, tr / 2 - q);
  const th = .5 * Math.atan2(2 * sxy, sxx - syy), R = Math.sqrt(l1) * 1.7 || 1, Lx = LIGHT.dir[0] * XF, Ly = LIGHT.dir[1];
  return { cx, cy, th, elong: Math.sqrt(l1 / l2), R, Lx, Ly, tone: (x, y) => clamp(k + lam * (-(x - cx) * Lx - (y - cy) * Ly) / R) };
}
// Lines at angle a (deg) every d across P, bowed by bow × the span's half-length toward the side (bs), sampled every
// step: calls line(pts) per span (the parts inside P).
function bankRule(P, d, a, bow, bs, step, line) {
  const G = bankGrid(P, a, d), R = P.map(G.fwd), back = G.back;   // (where the grid sits: bankGrid)
  let y0 = Infinity, y1 = -Infinity; for (const p of R) { if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
  for (let y0r = (Math.floor((y0 - G.v0) / d) + .5) * d + G.v0; y0r < y1; y0r += d) {
    const y = G.jit ? y0r + G.jit(Math.round((y0r - G.v0) / d - .5)) : y0r;
    for (const [xa, xb] of scanSpans(R, y)) {
      const hw = (xb - xa) / 2, xm = (xa + xb) / 2, n = Math.max(2, Math.ceil((xb - xa) / step));
      if (hw < .5) continue;
      const at = x => { const u = (x - xm) / hw; return [x, y + bs * bow * hw * (1 - u * u)]; };
      // (the bow can carry a line out of the piece: a long thin piece hatched along its length (a stamp's rubber pad, a
      // roadster's flank) bowed its lines out past the edge by bow × half its length, and on a round form the lines near
      // the shadow-side edge bowed out past it. So a bowed line is kept to the piece: cut where it crosses the outline,
      // the crossing found along the curve, and split into the runs inside.)
      if (Math.abs(bow * hw) < .25) { const pts = []; for (let i = 0; i <= n; i++) pts.push(back(at(xa + (xb - xa) * i / n))); line(pts); continue; }
      const ins = x => { const q = at(x); return inPoly(q[0], q[1], R); };
      let run = [], prevX = xa, prevIn = true;
      for (let i = 0; i <= n; i++) {
        const x = xa + (xb - xa) * i / n, inside = i === 0 || i === n || ins(x);
        if (inside !== prevIn) {   // the crossing between the last sample and this one
          let lo = prevX, hi = x; for (let j = 0; j < 7; j++) { const m = (lo + hi) / 2; if (ins(m) === prevIn) lo = m; else hi = m; }
          const xc = (lo + hi) / 2;
          if (prevIn) { run.push(back(at(xc))); if (run.length > 1) line(run); run = []; } else run = [back(at(xc))];
        }
        if (inside) run.push(back(at(x)));
        prevX = x; prevIn = inside;
      }
      if (run.length > 1) line(run);
    }
  }
}
// Swelling contour hatching over P (the figure's modelling). k: the piece's tone; d: line spacing (local px); o.from:
// only tones above it print (skin: just the shadow side under the stipple). Returns triangles into T.
function bankContour(T, P, k, d, o = {}) {
  const F = o.form || bankForm(P, k, o.lam ?? .5), px = bankPx(), wmin = .3 / px, from = o.from ?? 0;
  const round = F.elong < 1.35, along = !round && (o.along ?? BANK.figAlong);
  // round forms: lines parallel to the terminator (arcs round the shadow side); long forms: across the long axis, or
  // with BANK.figAlong along it (coachwork: flow lines down the length of a body)
  const a0 = round ? Math.atan2(F.Ly, F.Lx) * 180 / Math.PI + 90 : F.th * 180 / Math.PI + (along ? 0 : 90);
  const sideOf = a => { const r = a * Math.PI / 180; return (-F.Lx * -Math.sin(r) + -F.Ly * Math.cos(r)) >= 0 ? 1 : -1; };   // bow toward the shadow
  const W = (t, lo, sc) => d * sc * Math.pow(clamp((t - lo) / (1 - lo)), 1.15);
  const pass = (a, dd, bow, lo, sc) => bankRule(P, dd, a, bow, sideOf(a), Math.max(dd * 1.9, 3.2 / px), pts => {
    const ws = pts.map(([x, y]) => W(F.tone(x, y), lo, sc)); bankSwell(T, pts, ws, wmin);
  });
  pass(a0, d, round ? .32 : .2, Math.max(from, .04), .64);
  if (k > .3 || from > 0) pass(a0 + 90, d * 1.2, .1, Math.max(from, .52), .46);   // along the form, in the shadows
  if (k > .6) pass(a0 + 45, d * 1.35, .05, .84, .4);                             // the deepest darks
}
// Stipple (dot-punched tone) over P: a hex grid of dots on the drawing's own grid (like the engraved lines; where that
// grid sits: bankGrid), each dot's size by the tone at that point, none in the lights.
function bankStipple(T, P, k, ds, o = {}) {
  const F = o.form || bankForm(P, k, o.lam ?? .55), rmin = .22 / bankPx();
  const G = bankGrid(P, 0, ds), R = P.map(G.fwd), hs = G.hs || 0;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; for (const [x, y] of R) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const dy = ds * .866, u0 = G.u0 || 0, v0 = G.v0;
  for (let j = Math.floor((y0 - v0) / dy); j * dy + v0 <= y1; j++) for (let i = Math.floor((x0 - u0) / ds) - 1; i * ds + u0 <= x1 + ds; i++) {
    const hh = hash(i * 7.13 + j * 3.71 + hs), gu = (i + (j & 1) * .5) * ds + (hh - .5) * ds * .3 + u0, gv = j * dy + (hash(i * 1.93 + j * 5.37 + hs) - .5) * ds * .3 + v0;
    if (gu < x0 || gu > x1) continue;
    const [x, y] = G.back([gu, gv]);
    if (!inPoly(x, y, P)) continue;
    const t = F.tone(x, y); if (t < .07) continue;
    const r = ds * .5 * Math.sqrt(Math.min(1, t * 1.05)) * (.85 + .3 * hh); if (r < rmin) continue;
    const q = hh * TAU, c0 = Math.cos(q) * r * 1.2, s0 = Math.sin(q) * r * 1.2, c1 = Math.cos(q + 2.09) * r * 1.2, s1 = Math.sin(q + 2.09) * r * 1.2, c2 = Math.cos(q + 4.19) * r * 1.2, s2 = Math.sin(q + 4.19) * r * 1.2;
    T.push(x + c0, y + s0, x + c1, y + s1, x + c2, y + s2);   // (a triangle, turned at random: at print size a punched dot, at half the vertices of a lozenge)
  }
}
// The engraving scale for the figure's own geometry: bankS(), or inside an engraving wrapper (bnEngrave, chEngrave:
// they scale waveLines themselves) the wrapper's scale, BANK.engS.
const bankSF = () => waveLines !== BANK_WL0 ? (BANK.engS ?? 1) : bankS();
// A figure piece's modelling: paper, then stipple (skin) or contour hatching, in the figure's ink.
function bankFigFill(P, col, o, kk, lineCol) {
  const f = bankFg(), S = bankSF(), K = bankK(), D = BANK.dens || 1, ink = bankFigCol(lineCol), T = [];
  if (kk <= .03) return;
  const skin = bankSkin(col, o), d = S * lerp(4.4, 3.2, kk) / D / Math.pow(K, .8) * lerp(1.25, 1, f);
  if (skin) {
    const F = bankForm(P, kk * .95, .6);
    bankStipple(T, P, kk, S * 1.9 / D / Math.pow(K, .7), { form: F });
    bankContour(T, P, kk, d * 1.1, { form: F, from: .5 });
  } else bankContour(T, P, kk, d, { lam: lerp(.5, .9, kk) });   // (dark cloth keeps a lit side: thinner lines, not solid)
  bankTris(T, ink);
}
// A figure's shadow crescent: short swelling strokes along the form, cross to its hatching.
function bankFigShade(C, col) {
  const S = bankSF(), K = bankK(), D = BANK.dens || 1, T = [], F = bankForm(C, .6, .2);
  const d = S * 3.6 / D / Math.pow(K, .8), px = bankPx();
  bankRule(C, d, F.th * 180 / Math.PI + 60, .12, 1, Math.max(d * 1.3, 2.5 / px), pts => bankSwell(T, pts, pts.map(([x, y]) => d * .5 * F.tone(x, y)), .3 / px));
  bankTris(T, bankFigCol(mixCol(BANK.ink, desat(col, BANK.sat ?? .45), .5 * (BANK.colour ?? 1))));
}
// The old vignette (bankVignette below replaces it; V3a's grandstand still uses it): a soft radial gradient of paper
// laid over the ground round a figure (world coords, inside the camera), k its strength at the middle. Where it's
// part-transparent it half-erases the ground's lines, so its rim reads blotchy.
const BANK_HALO = {};
function bankHaloTex(col, stops = [[0, 1], [.45, .92], [.7, .55], [.86, .2], [1, 0]], key = col, N = 256) {
  let g = BANK_HALO[key];
  if (!g) {
    g = createGraphics(N, N); g.pixelDensity(1); const c = g.drawingContext, v = parseInt(col.slice(1), 16), rgb = `${v >> 16 & 255},${v >> 8 & 255},${v & 255}`;
    const gr = c.createRadialGradient(N / 2, N / 2, 0, N / 2, N / 2, N / 2);
    stops.forEach(([q, a]) => gr.addColorStop(q, `rgba(${rgb},${a})`));
    c.fillStyle = gr; c.fillRect(0, 0, N, N); BANK_HALO[key] = g;
  }
  return g;
}
function bankHalo(x, y, rx, ry, k = .72, col = BANK.paper) {
  if (STYLE.mode !== 'bank' || k <= .01) return;
  flushBrush(); push(); tint(255, 255 * clamp(k)); image(bankHaloTex(col), x - rx, y - ry, rx * 2, ry * 2); noTint(); pop();
}

// ---------- the bank look: where the engraved lines sit, and so how they move ----------
// Every engraved tint and hatching (waveLines, bankRule: the ground's ruled tints, the figures' contour hatching;
// bankStipple: skin) lays its lines on a grid, d apart. Where the grid is anchored decides what the eye sees when a
// piece or the camera moves (the user, 2026-09-25: "what's easier to track with eyes will be the test"; after the
// screen-lines review: "it'd work a lot better if the background layer doesn't redraw, like the card. Anything actually
// moving can be screen."):
//   figures  one grid fixed to the screen, like riso's dot screen: a moving subject slides under it.
//   ground   the grid in the coordinates the piece is drawn in: a set's lines are fixed to the world (they ride the
//            camera with it), one shared grid across pieces, and never redrawn.
// (Compared and dropped, banktrack: each piece's own lines bound to it, redrawn every 1/8 s like the doodle, and mixes.)
const bankGridScreen = () => bankInFig();
// The current local → screen map (1080p px, the frame's own coordinates): [a, b, c, d, e, f], x' = a x + c y + e.
function bankScreenAff() {
  const [a, b, c, d, e, f] = NUDGE_BASE || [1, 0, 0, 1, 0, 0], M = curAffine(), det = a * d - b * c || 1;
  const A = d / det, B = -b / det, C = -c / det, D = a / det, E = (c * f - d * e) / det, F = (b * e - a * f) / det;
  return [A * M[0] + C * M[1], B * M[0] + D * M[1], A * M[2] + C * M[3], B * M[2] + D * M[3], A * M[4] + C * M[5] + E, B * M[4] + D * M[5] + F];
}
// The grid for region P's lines at angle a (deg, local), d apart: fwd maps a local point to grid coordinates (u along
// the lines, v across, in local px), back maps back; rows at v = (k + .5)·d + v0; jit(k): row k's nudge (null); wph: the
// waves' phase; u0, hs: the stipple's shift and seed (all 0: the lines never redraw).
function bankGrid(P, a, d) {
  const ang = a * Math.PI / 180;
  let G;
  if (bankGridScreen()) {
    const A = bankScreenAff(), sc = Math.sqrt(Math.abs(A[0] * A[3] - A[1] * A[2])) || 1, ca = Math.cos(ang), sa = Math.sin(ang);
    const as = Math.atan2(A[1] * ca + A[3] * sa, A[0] * ca + A[2] * sa), c = Math.cos(-as), s = Math.sin(-as), c2 = Math.cos(as), s2 = Math.sin(as);   // (a, as seen on screen)
    const det = A[0] * A[3] - A[1] * A[2] || 1, I0 = A[3] / det, I1 = -A[1] / det, I2 = -A[2] / det, I3 = A[0] / det;
    G = { fwd: ([x, y]) => { const X = A[0] * x + A[2] * y + A[4], Y = A[1] * x + A[3] * y + A[5]; return [(X * c - Y * s) / sc, (X * s + Y * c) / sc]; },
          back: ([u, v]) => { const X = (u * c2 - v * s2) * sc - A[4], Y = (u * s2 + v * c2) * sc - A[5]; return [I0 * X + I2 * Y, I1 * X + I3 * Y]; } };
  } else {
    const c = Math.cos(-ang), s = Math.sin(-ang), ci = Math.cos(ang), si = Math.sin(ang);
    G = { fwd: ([x, y]) => [x * c - y * s, x * s + y * c], back: ([x, y]) => [x * ci - y * si, x * si + y * ci] };
  }
  G.v0 = 0; G.u0 = 0; G.wph = 0; G.jit = null; G.hs = 0;
  return G;
}

// ---------- the bank look: the figures' vignettes ----------
// A banknote parts its portrait from the ground with a vignette. Not a wash of paper over the lines: the ground's lines
// themselves stop short of the figure, each tapering to a point and ending, their ends staggered along a soft oval, so the
// edge is clean but organic and the portrait sits in bare paper.
//   bankVignette(ovals, cam)  registers the frame's ovals, [[x, y, rx, ry, k], ...] (the figure's vignette: centre and
//     radii, in the current coordinates, or through camera cam { cx, cy, zoom, rot } if given; k ≈ .8, its strength),
//     BEFORE the ground is drawn. Every ground line drawn after it (waveLines' tints, outlines and detail lines,
//     guilloches, bankorn's ornament) ends at the ovals (the lines stop at BANK_VIG_K.q of rx, ry, ± a stagger per line).
//   bankVignetteEnd()  where the ground ends, before the cast: the lines drawn after it (the cast, props in front) are
//     whole again. A scene's figures are a list it fills (bunker.js bkHaloOvals / bkHaloOf for the diners).
// (The user's pick, 2026-09-25, over a crisp paper cut-out and the old radial gradient, blotchy at the rim.)
// q: where the lines stop (× rx, ry); st: each line's stagger (± × that); taper: its length (1080p screen px); snap,
// snapA: an oval's centre steps on a grid this fine (1080p screen px) and its tilt in steps this big (rad), so a figure
// that settles or drifts slowly moves its vignette in held steps, not a re-cut of the ground's line ends every frame
// (and a still one's is exactly still)
const BANK_VIG_K = { q: .74, st: .05, taper: 9, snap: 2, snapA: .02 };
let BANK_VIG = null;   // the frame's vignettes (screen px): { V: [{ c, L (unit → screen), I (screen → unit), q, ph, ex, ey }] }
// An oval may also carry rot (its tilt, rad: a figure's lean, so the oval leans with the body) and id (a stable number
// for its edge's wander, so the stagger rides with the oval as it moves; default its place in the list):
// [x, y, rx, ry, k, rot, id]. A figure's oval comes from its pose each frame (figHalo, below), so it moves with it.
function bankVignette(list, cam) {
  BANK_VIG = null;
  if (STYLE.mode !== 'bank' || !list || !list.length) return;
  const A = cam ? null : bankScreenAff(), V = [], sc = cam ? cam.zoom ?? 1 : Math.sqrt(Math.abs(A[0] * A[3] - A[1] * A[2])) || 1, g = BANK_VIG_K.snap / sc, ga = BANK_VIG_K.snapA;
  list.forEach(([x, y, rx, ry, k = .8, rot = 0, id], i) => {
    if (!(k > .01)) return;
    x = Math.round(x / g) * g; y = Math.round(y / g) * g; rot = Math.round(rot / ga) * ga;   // (held steps: BANK_VIG_K.snap)
    let c, L;   // the oval's centre and its axes on screen (unit circle → screen: p·(L0, L1) + q·(L2, L3))
    const ro = Math.cos(rot), rs = Math.sin(rot), ax = [rx * ro, rx * rs], ay = [-ry * rs, ry * ro];   // (its axes, tilted)
    if (cam) { const z = cam.zoom ?? 1, r = cam.rot || 0, co = Math.cos(r), sn = Math.sin(r); c = toScreen(x, y, { cx: cam.cx, cy: cam.cy, zoom: z, rot: r }); L = [z * (co * ax[0] - sn * ax[1]), z * (sn * ax[0] + co * ax[1]), z * (co * ay[0] - sn * ay[1]), z * (sn * ay[0] + co * ay[1])]; }
    else { c = [A[0] * x + A[2] * y + A[4], A[1] * x + A[3] * y + A[5]]; L = [A[0] * ax[0] + A[2] * ax[1], A[1] * ax[0] + A[3] * ax[1], A[0] * ay[0] + A[2] * ay[1], A[1] * ay[0] + A[3] * ay[1]]; }
    const det = L[0] * L[3] - L[1] * L[2] || 1, q = BANK_VIG_K.q * clamp(k / .8, .2, 1.25);
    V.push({ c, L, I: [L[3] / det, -L[1] / det, -L[2] / det, L[0] / det], q, ph: hash((id ?? i) * 7.31 + 1.7) * TAU,
      ex: Math.hypot(L[0], L[2]) * q * 1.3, ey: Math.hypot(L[1], L[3]) * q * 1.3 });   // (its box: nothing outside it is near)
  });
  if (V.length) BANK_VIG = { V };
  if (BANK_VIG_SHOW) BANK_VIG_SHOW.push(...V);
}
// ?bankvig=show (a check): the frame's vignettes outlined in red over the finished frame (where the lines stop, its
// centre crossed), to see each one sit on its figure through a move.
const BANK_VIG_SHOW = new URLSearchParams(location.search).get('bankvig') === 'show' ? [] : null;
if (BANK_VIG_SHOW && typeof composite === 'function') {
  const c0 = composite;
  composite = t => {
    c0(t); const c = outX;
    for (const h of BANK_VIG_SHOW) {
      c.save(); c.transform(h.L[0], h.L[1], h.L[2], h.L[3], h.c[0], h.c[1]);
      c.beginPath(); c.arc(0, 0, h.q, 0, TAU); c.moveTo(-.1, 0); c.lineTo(.1, 0); c.moveTo(0, -.1); c.lineTo(0, .1); c.restore();
      c.strokeStyle = 'rgba(220,20,20,.85)'; c.lineWidth = 2; c.stroke();
    }
    BANK_VIG_SHOW.length = 0;
  };
}
// A figure's vignette from its pose this frame, as a bankVignette entry. (The user: "the white cut-outs ... need to
// update when they animate/move ... one of them leans back but leaves the cut-out behind".) The oval rides the figure's
// body as its rig draws it: the head's place (dx, dy, a jump, a crouch, a hover, a ride) and the body's tilt (o.rot, its
// idle lean, the bots' groove), and it tilts with the body; so it follows a lean, a lunge, a rise, a step or a ride.
// who: the rig (musk zuck dorsey altman turnbull dario grok muse copilot codex); x, y, u, o: exactly what the shot passes
// the rig (so a shot works its figures' options out once, before the ground, and draws them with the same ones).
// fit (in the caller's u, about the head's middle): dn (the oval's centre that far down the body), dx (that far forward,
// the way the figure faces), rx, ry (its radii), k, id (bankVignette's).
// Only real moves carry it (dx, dy, a jump, a crouch, a ride, the tilt): the pose without its idle life (breathing,
// weight shifts, the bots' accents and drift, a hover's float) or its squash and stretch (a take's long settle crept it a
// fraction of a pixel a frame), so a still figure's vignette is still and the ground's line ends round it don't re-cut
// every frame (the user: the bank look's ground doesn't redraw). bankVignette snaps it to BANK_VIG_K.snap too.
function figHalo(who, x, y, u, o = {}, fit = {}) {
  const F = figFrame(who, x, y, u, o, true), c = Math.cos(F.rot), s = Math.sin(F.rot), a = (fit.dx || 0) * F.fl * u, b = (fit.dn || 0) * u;
  return [F.head[0] + a * c - b * s, F.head[1] + a * s + b * c, (fit.rx ?? 5.4) * u, (fit.ry ?? 7) * u, fit.k ?? .82, F.rot, fit.id];
}
// A figure's frame as its rig draws it this frame: head (the head's middle, world; a bot's: the middle of its body, where
// its oval sits), rot (the body's tilt), fl (1 facing right, -1 flipped). From the rigs' own anchors (mkAnchors,
// bsAnchors) and idle life where they have them, turned by the tilt they leave out; the others follow their rig's
// transform (zuck's body frame; the bots' ground frame, and their body bobbing and leaning about the hips). Limbs aside.
// still: without the idle life (lifeOf's breath and lean; the bots' accent bob, lean drift and float; a full bounce
// stays) or squash and stretch (o.sq, o.take; the bots' takes).
function figFrame(who, x, y, u, o = {}, still = false) {
  if (still) o = { ...o, idle: 0, sq: 0, take: 0 };
  const fl = o.flip ? -1 : 1, key = o.boilKey, seed = o.seed || 0, calm = B => still && !B.full ? { ...B, up: 0, lean: 0, sq: 0, hit: 0, clk: 0 } : B;
  const turn = (p, c, r) => { const dx = p[0] - c[0], dy = p[1] - c[1], co = Math.cos(r), sn = Math.sin(r); return [c[0] + dx * co - dy * sn, c[1] + dx * sn + dy * co]; };
  if (who === 'musk' && typeof mkAnchors === 'function') {
    const U = u * MK_S, rot = (o.rot || 0) + (o.jump || key == null ? 0 : mkLife(o, key).lean);
    return { head: turn(mkAnchors(x, y, u, o).head, [x + (o.dx || 0) * U, y + (o.dy || 0) * 1.2 * U - (o.jump || 0) * 2.4 * U], rot), rot, fl };
  }
  if (typeof BS_WHO !== 'undefined' && BS_WHO[who]) {
    const B = BS_WHO[who], U = u * B.S, ride = bsGeo(B, o).P.rig === 'ride', rot = (o.rot || 0) + (key == null ? 0 : bsLife(B, o, key).lean);
    return { head: turn(bsAnchors(who, x, y, u, o).head, [x + (o.dx || 0) * U, y + (ride ? 0 : (o.dy || 0) * 1.1 * U)], rot), rot, fl };
  }
  if (who === 'zuck') {   // (zuck.js: the body frame ZK_DROP u down, the head's middle 9.9 u up it; his tilt in steps)
    const qz = (v, st) => Math.round(v / st) * st, rot = qz(o.rot || 0, .025), sq = cardSq(((o.sq || 0) + (o.take || 0)) * .3), p = [x + (o.dx || 0) * u, y + qz(o.dy || 0, .2) * .8 * u + ZK_DROP * u];
    return { head: turn([p[0] + fl * (1 + sq * .5) * (o.view === 'q' ? .3 : 0) * u, p[1] - (1 - sq) * 9.9 * u], p, rot), rot, fl };
  }
  // the bots (bots.js, bots2.js): the ground frame at (x, y) + dx, dy (their groove's too) + y0, turned by rot (+ rot0),
  // squashed; the body bobs and leans about the hips (hip, bob, lean, its own squash unless flat), sits dS lower (a seat),
  // and its middle is H u up. Muse's frame is its hovering egg's (flat).
  const bot = (B, { dyK, sqK, hip = 0, bob = 0, lean = 0, H, dS = 0, y0 = 0, rot0 = 0, sq0 = 0, flat = false }) => {
    const G = grooveAdd(o, B.full ? 1 : 0, B.full ? 1 : still ? 0 : .6), sq = cardSq(((o.sq || 0) + G.sq + (o.take || 0)) * sqK) + sq0, rot = (o.rot || 0) + G.rot + rot0;
    const p = [x + ((o.dx || 0) + G.dx) * u, y + ((o.dy || 0) + G.dy) * dyK * u + y0], py = (-H - hip) * (1 - (flat ? 0 : cardSq(B.sq)));
    const m = [-py * Math.sin(lean), hip + dS - bob + py * Math.cos(lean)];   // (the body's middle, bobbed and leant, in u)
    return { head: turn([p[0] + fl * (1 + sq * .5) * m[0] * u, p[1] + (1 - sq) * m[1] * u], p, rot), rot, fl };
  };
  if (who === 'grok') { const B = calm(botGroove(btT(o), o, 1, 'gk' + key + seed)); return bot(B, { dyK: 1.1, sqK: .6, hip: -2.75, bob: B.up * .52, lean: B.lean, H: 7.5 }); }
  if (who === 'muse') {
    const wrist = !!o.wrist, tt = btT(o), B = calm(botGroove(tt, o, wrist ? .5 : 1, 'mu' + key + seed)), alt = wrist ? 0 : (o.alt ?? 3.2), hk = idleHash('mu' + key) % 97;
    const hover = wrist ? 0 : -.5 * B.up + (B.full ? .14 * Math.sin(B.bp * Math.PI / 4) : still ? 0 : .2 * Math.sin(tt * TAU / 3.4 + hk) + .06 * Math.sin(tt * TAU / 1.3 + hk * 2));
    return bot(B, { dyK: .9, sqK: .5, H: 2.8, flat: true, y0: (hover - (wrist ? 0 : alt + 2.5)) * u, rot0: wrist ? 0 : B.lean * .9 + .03 * Math.sin(B.clk * Math.PI / 4), sq0: cardSq(B.sq * .7) });
  }
  if (who === 'copilot') {
    const pn = typeof o.pose === 'string' ? o.pose : '', seated = o.seated ?? pn === 'sit', B = calm(botGroove(b2T(o) - clamp(o.cheap || 0) * .14 * BEAT, o, seated ? .5 : 1, 'cp' + key + seed));
    return bot(B, { dyK: 1.1, sqK: .6, hip: -1.5, dS: seated ? 1.02 - (o.seatH ?? 3.3) : 0, bob: B.up * .42, lean: B.lean, H: 5.2 });
  }
  if (who === 'codex') {
    const pn = typeof o.pose === 'string' ? o.pose : '', run = pn === 'run', sneak = pn === 'sneak', pick = pn === 'pick', K = B2PET[o.kind] || B2PET.cat, q = o.view === 'q';
    const B = calm(botGroove(b2T(o), o, pick ? .25 : run ? .6 : 1, 'cx' + key + seed)), hop = pn === 'cheer' ? -.9 * Math.abs(Math.sin(B.bp * Math.PI)) : run ? -.25 * Math.abs(Math.sin(B.bp * TAU)) : 0;
    const float = o.kind === 'ghost' ? .55 + .15 * Math.sin(B.clk * Math.PI / 2) : 0, bob = B.up * .3 + (sneak ? .28 : 0) + float + (run ? .12 * Math.abs(Math.sin(B.bp * TAU)) : 0);
    return bot(B, { dyK: 1, sqK: .6, hip: K.hip ? K.hip[1] : -1.1, bob, lean: B.lean + (run ? (q ? .16 : 0) : sneak ? (q ? .06 : 0) : 0) + (pick ? .05 : 0), H: 2.4, y0: hop * u, sq0: sneak ? cardSq(.07) : 0 });
  }
  return { head: [x, y - 10 * u], rot: o.rot || 0, fl };   // (another rig: its ground point, as if a person's head)
}
const bankVigOn = () => BANK_VIG !== null && bankInGround();
function bankVignetteEnd() {
  const v = BANK_VIG; BANK_VIG = null;
  if (!v || STYLE.mode !== 'bank') return;
  // Paper laid over the ground in screen space: only the oval's core, clear of every line end (the lines stop at 0.87 of
  // the radius at the least; this is opaque to 0.72 and gone by 0.85), so it touches no line: it only evens out the
  // ground pieces' faint fill tints, which would otherwise show in the bare paper as flat patches.
  flushBrush(); push(); resetMatrix(); { const [a, b, c, d, e, f] = NUDGE_BASE || [1, 0, 0, 1, 0, 0]; applyMatrix(a, b, c, d, e, f); }
  for (const h of v.V) {
    push(); applyMatrix(h.L[0], h.L[1], h.L[2], h.L[3], h.c[0], h.c[1]);
    const r = h.q * .85; image(bankHaloTex(BANK.paper, [[0, 1], [.85, 1], [1, 0]], BANK.paper + 'core', 512), -r, -r, 2 * r, 2 * r);
    pop();
  }
  pop();
}
// How far inside the frame's vignettes a screen point is: < 1 inside. st: the line's stagger. Each oval's edge wanders a
// little (a few slow lobes round it), so the vignette reads engraved, not stamped.
function bankVigG(V, X, Y, st) {
  let m = Infinity;
  for (const h of V) {
    const dx = X - h.c[0], dy = Y - h.c[1];
    if (Math.abs(dx) > h.ex || Math.abs(dy) > h.ey) continue;
    const p = h.I[0] * dx + h.I[2] * dy, q = h.I[1] * dx + h.I[3] * dy, th = Math.atan2(q, p);
    const R = h.q * (1 + .04 * Math.sin(3 * th + h.ph) + .025 * Math.sin(5 * th + 2 + h.ph * 3) + .015 * Math.sin(8 * th + h.ph * 5) + st);
    m = Math.min(m, Math.hypot(p, q) / R);
  }
  return m;
}
// The parts of polyline P (local) outside the frame's vignettes: [{ P, f (each point's place in P, a fractional index),
// e0, e1 (that end was cut by a vignette) }], or null if P doesn't come near one (draw it whole). id: the line's own
// number (its stagger: the same line gets the same one every frame).
function bankVigRuns(P, id) {
  const V = BANK_VIG.V, A = bankScreenAff(), st = BANK_VIG_K.st * (hash(id) * 2 - 1);
  const S = P.map(([x, y]) => [A[0] * x + A[2] * y + A[4], A[1] * x + A[3] * y + A[5]]);
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; for (const [X, Y] of S) { if (X < x0) x0 = X; if (X > x1) x1 = X; if (Y < y0) y0 = Y; if (Y > y1) y1 = Y; }
  const near = (ax0, ax1, ay0, ay1) => V.some(h => ax1 > h.c[0] - h.ex && ax0 < h.c[0] + h.ex && ay1 > h.c[1] - h.ey && ay0 < h.c[1] + h.ey);
  if (!near(x0, x1, y0, y1)) return null;
  const outAt = (X, Y) => bankVigG(V, X, Y, st) >= 1, runs = [];
  let pOut = outAt(S[0][0], S[0][1]), cur = pOut ? { P: [P[0]], f: [0], e0: false, e1: false } : null, cuts = 0;
  for (let i = 1; i < P.length; i++) {
    const a = S[i - 1], b = S[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    // (long segments near a vignette are tested every 3 px, so a line can't step over one)
    const n = L > 3 && near(Math.min(a[0], b[0]), Math.max(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[1], b[1])) ? Math.ceil(L / 3) : 1;
    let t0 = 0;
    for (let k = 1; k <= n; k++) {
      const t = k / n, o = outAt(lerp(a[0], b[0], t), lerp(a[1], b[1], t));
      if (o !== pOut) {
        let lo = t0, hi = t; for (let it = 0; it < 10; it++) { const mm = (lo + hi) / 2; if (outAt(lerp(a[0], b[0], mm), lerp(a[1], b[1], mm)) === pOut) lo = mm; else hi = mm; }
        const tc = (lo + hi) / 2, pc = [lerp(P[i - 1][0], P[i][0], tc), lerp(P[i - 1][1], P[i][1], tc)];
        if (pOut) { cur.P.push(pc); cur.f.push(i - 1 + tc); cur.e1 = true; runs.push(cur); cur = null; }
        else cur = { P: [pc], f: [i - 1 + tc], e0: true, e1: false };
        pOut = o; cuts++;
      }
      t0 = t;
    }
    if (pOut) { cur.P.push(P[i]); cur.f.push(i); }
  }
  if (cur) runs.push(cur);
  return cuts ? runs.filter(r => r.P.length > 1) : pOut ? null : [];
}
// Split a run (P, f) at arc length s: [head, tail].
function bankVigSplit(P, f, s) {
  let acc = 0;
  for (let i = 1; i < P.length; i++) {
    const L = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
    if (acc + L >= s) { const t = L ? (s - acc) / L : 0, p = [lerp(P[i - 1][0], P[i][0], t), lerp(P[i - 1][1], P[i][1], t)], fp = lerp(f[i - 1], f[i], t);
      return [{ P: P.slice(0, i).concat([p]), f: f.slice(0, i).concat([fp]) }, { P: [p].concat(P.slice(i)), f: [fp].concat(f.slice(i)) }]; }
    acc += L;
  }
  return [{ P, f }, { P: [P[P.length - 1]], f: [f[f.length - 1]] }];
}
const bankVigLen = P => { let s = 0; for (let i = 1; i < P.length; i++) s += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return s; };
// A run cut at its vignetted ends: the body, and a taper at each cut end (resampled finely: 6 steps), as { P, f, k (the
// width factor at each point: 1 → 0 at the cut, a slightly full point) }.
function bankVigTapers(r, lt) {
  const len = bankVigLen(r.P), out = { body: { P: r.P, f: r.f }, tapers: [] };
  if (len <= 0) { out.body = null; return out; }
  lt = Math.min(lt, len * (r.e0 && r.e1 ? .5 : 1) * .98);
  const fine = (Q, dir) => {   // dir 1: the cut at the end
    const L = bankVigLen(Q.P), P = [], f = [], k = [];
    for (let j = 0; j <= 6; j++) { const s = L * j / 6, [h] = bankVigSplit(Q.P, Q.f, s), p = h.P[h.P.length - 1]; P.push(p); f.push(h.f[h.f.length - 1]); const u = dir > 0 ? 1 - j / 6 : j / 6; k.push(Math.pow(u, .7)); }
    return { P, f, k };
  };
  if (r.e1) { const [h, t] = bankVigSplit(out.body.P, out.body.f, len - lt); out.body = h; out.tapers.push(fine(t, 1)); }
  if (r.e0) { const [h, t] = bankVigSplit(out.body.P, out.body.f, lt); out.body = t; out.tapers.push(fine(h, -1)); }
  if (out.body && bankVigLen(out.body.P) < 1e-3) out.body = null;
  return out;
}
// A brush line (the engraving's pens) through the frame's vignettes: whole where it's clear of them; cut where it
// enters one, its body in the pen as ever and the last BANK_VIG_K.taper px tapering to a point (the burin lifting out:
// the pen in ever finer strokes). chunk: draw the body in pieces of that many points (long strokes fade); closed: an outline (its
// first and last runs are one stroke through its start).
// A ground line draws its pen grain from its own seed (where it starts, its number, the boil step) and the stream is
// re-seeded the same way after it. The grain came from one stream per layer, so a line cut shorter by a moving vignette
// (or a piece that slides) took a different share of it and re-grained every line drawn after it: the whole sky and plaza
// shimmered whenever a figure moved (the user: the bank look's ground doesn't redraw). Now each line's grain is its own.
const bankLineSeed = (P, id) => (Math.imul(Math.round(P[0][0] * 7 + P[0][1] * 13) | 0, 2654435761) ^ Math.imul(Math.round((id || 0) * 997) | 0, 40503) ^ Math.imul(BOILN + 1, 7919)) >>> 0;
// (Each seed costs ~14 us: p5.brush re-seeds its own generators, where the grain comes from; a frame of the bunker has
// ~17,000 rows. So a run of lines drawn back to back (waveLines' rows, a guilloche's strands: run, from bankVigRun)
// is seeded once at its start and each row draws on from there until the first one a vignette touches; from that one
// on, each row seeds itself (whether it's cut can change frame to frame, and with it its share of the stream). The
// rows before it never change, so neither does their grain; a run that no vignette reaches costs one seed. After the
// run the stream is re-seeded, bankVigRowsEnd. A lone line (an outline, a detail line) is seeded before and after.)
function bankVigInk(P, w, col, br, curv, id, chunk = 0, closed = false, run = null) {
  if (STYLE.mode !== 'bank' || !P.length || !bankInGround()) return bankVigInk0(P, w, col, br, curv, id, chunk, closed);
  const runs = bankVigOn() && P.length > 1 ? bankVigRuns(P, id) : null;
  if (run && !run.on) { if (!runs) return bankVigInk0(P, w, col, br, curv, id, chunk, closed, runs); run.on = true; }
  const s0 = bankLineSeed(P, id);
  randomSeed(s0); bankVigInk0(P, w, col, br, curv, id, chunk, closed, runs);
  if (!run) randomSeed((s0 ^ 0x5bd1e995) >>> 0);
}
function bankVigRun(P, id) { if (STYLE.mode === 'bank' && P.length && bankInGround()) randomSeed(bankLineSeed(P, id)); return { on: false }; }
function bankVigRowsEnd(P, id) { if (STYLE.mode === 'bank' && P.length && bankInGround()) randomSeed((bankLineSeed(P, id) ^ 0x2545f491) >>> 0); }
function bankVigInk0(P, w, col, br, curv, id, chunk = 0, closed = false, runs0) {
  const draw = Q => { if (chunk) for (let j = 0; j + 1 < Q.length; j += chunk) _inkLine(Q.slice(j, j + chunk + 1), w, col, br, curv); else _inkLine(Q, w, col, br, curv); };
  const runs = runs0 !== undefined ? runs0 : bankVigOn() && P.length > 1 ? bankVigRuns(P, id) : null;
  if (!runs) { draw(P); return; }   // (clear of every vignette: drawn exactly as ever)
  if (closed && runs.length > 1 && !runs[0].e0 && !runs[runs.length - 1].e1) { const a = runs.pop(), b = runs.shift(); runs.unshift({ P: a.P.concat(b.P.slice(1)), f: a.f.concat(b.f.slice(1)), e0: a.e0, e1: b.e1 }); }
  const A = bankScreenAff(), sc = Math.sqrt(Math.abs(A[0] * A[3] - A[1] * A[2])) || 1, lt = BANK_VIG_K.taper / sc;
  for (const r of runs) {
    const { body, tapers } = bankVigTapers(r, lt);
    if (body && body.P.length > 1) draw(body.P);
    // the taper in the pen: three ever finer strokes, the line's own texture and no brush flush (a crisp point of
    // triangles looked much the same but flushed the brush each time: ~+0.8 s a bunker frame)
    for (const tp of tapers) for (let j = 0; j < 6; j += 2) _inkLine(tp.P.slice(j, j + 3), w * (tp.k[j] + tp.k[j + 2]) / 2, col, br, 0);
  }
}
// A crisp swelling line (bankSwell's) through the frame's vignettes: cut and tapered as bankVigInk's.
function bankVigSwell(T, P, ws, wmin, id) {
  const runs = bankVigOn() && P.length > 1 ? bankVigRuns(P, id) : null;
  if (!runs) { bankSwell(T, P, ws, wmin); return; }
  const A = bankScreenAff(), sc = Math.sqrt(Math.abs(A[0] * A[3] - A[1] * A[2])) || 1, lt = BANK_VIG_K.taper / sc;
  const wAt = f => { const i = Math.max(0, Math.min(ws.length - 2, Math.floor(f))); return ws.length < 2 ? ws[0] : lerp(ws[i], ws[i + 1], f - i); };
  for (const r of runs) {
    const { body, tapers } = bankVigTapers(r, lt);
    if (body) bankSwell(T, body.P, body.f.map(wAt), wmin);
    for (const tp of tapers) bankSwell(T, tp.P, tp.f.map((f, j) => wAt(f) * tp.k[j]), 0);
  }
}

// Card stock texture, baked into each piece: a repeating fibre tile multiplied over the piece, mapped in the piece's OWN
// coordinates (the current transform), so the grain travels, turns and scales with the piece and the camera, instead of
// staying fixed to the screen. Each piece gets its own offset into the tile, so neighbours don't share a pattern.
let CARD_TILE = null;
function cardTile() {
  if (CARD_TILE) return CARD_TILE;
  const N = 256, g = createGraphics(N, N); g.pixelDensity(1); const c = g.drawingContext, rnd = lcg(29);
  const id = c.createImageData(N, N), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const v = 255 - (rnd() < .6 ? rnd() * rnd() * 30 : 0); d[i] = v; d[i + 1] = v - 1; d[i + 2] = v - 3; d[i + 3] = 255; }
  c.putImageData(id, 0, 0);
  c.lineWidth = 1;
  for (let k = 0; k < 90; k++) {   // fibres (drawn wrapped, so the tile repeats seamlessly)
    const x = rnd() * N, y = rnd() * N, l = 6 + rnd() * 22, a = rnd() * TAU, dk = .04 + rnd() * .07;
    for (const [ox, oy] of [[0, 0], [-N, 0], [N, 0], [0, -N], [0, N]]) {
      c.strokeStyle = `rgba(90,70,50,${dk})`; c.beginPath(); c.moveTo(x + ox, y + oy);
      c.quadraticCurveTo(x + ox + Math.cos(a + .5) * l * .5, y + oy + Math.sin(a + .5) * l * .5, x + ox + Math.cos(a) * l, y + oy + Math.sin(a) * l); c.stroke();
    }
  }
  return CARD_TILE = g;
}
// fr: the piece's own frame [x, y, angle] (a limb segment: its pivot and direction), so its fibres turn and slide with
// it; by default its centroid, so a piece moved about inside its rig (a breath, a slump) carries its fibres along
// rather than sliding over them: the same card, moved.
function cardFibres(Q, key, fr) {
  flushBrush();   // (so the texture lands on this piece, in order with the brush-drawn pieces around it)
  const h = keyHash(key), ox = hash(h) * 256, oy = hash(h + 3) * 256, S = 220;   // one tile ≈ 220 local px
  const [fx, fy, fa] = fr || [...centroid(Q), 0], c = Math.cos(fa), s = Math.sin(fa);
  push(); noStroke(); blendMode(MULTIPLY); textureMode(NORMAL); textureWrap(REPEAT); texture(cardTile());
  beginShape(); for (const [x, y] of Q) { const dx = x - fx, dy = y - fy; vertex(x, y, 0, (dx * c + dy * s + ox) / S, (dy * c - dx * s + oy) / S); } endShape(CLOSE);
  blendMode(BLEND); pop();
}

// ---------- the primitives ----------
// piece(P, col, o): one closed piece.
//   o.sw outline weight (ink) · o.ink outline colour (null = none) · o.shade crescent colour · o.depth crescent depth px
//   o.rim rim-light colour (ink) · o.key identity (card cut + nudge) · o.lift card shadow offset (px, default 5)
//   o.spot: [hue, colour] forces a piece to print in a xerox spot colour (in the drums: { channel: 'm', tone }) (e.g. the bill, a fire), o.spot: null forbids it
//   o.maxTone: 0..1 caps how dark the engrave look hatches this piece (skin: ~.45)
//   o.flatCard: card piece without paper mottling (tiny pieces) · o.edge: false hides the card's pale cut edge (pieces that
//   stand for skin continuing, like eyelids)
function piece(P, col, o = {}) {
  const sw = o.sw ?? 1.6;
  if (!STYLE.card) {
    fillRegion(P, col, o);
    if (inkFigOn() && INK_FIG.flat) o = { ...o, shade: null, rim: null };   // (ink, a bot: flat fills, inkWrapRigs)
    if (o.shade) { const C = crescent(P, o.depth ?? 12); if (C) shadeRegion(C, o.shade); }
    if (o.rim && STYLE.mode === 'ink') { const rw = inkFigOn() ? sw * INK_FIG.k : sw; for (const r of litEdge(P, rw * 1.6)) _inkLine(r, rw * .55, o.rim, 'flashfine', 0); }   // (in a figure: at its scale)
    if (o.ink !== null) edgeLine(P, sw, o.ink, true, 0, o.role);
    return;
  }
  const Q = scissor(P, o.key ?? col, o.fine), lift = o.lift ?? 5;
  if (lift > 0) paint(shiftP(Q, lift * .8 * XF, lift), { wash: '#120E12', washOp: 80, ink: null });
  paint(Q, { wash: col, washOp: o.op ?? 255, ink: null });
  if (!o.flatCard) cardFibres(Q, o.key ?? col, o.texFrame);   // the card's own paper texture, fixed to the piece (it moves with it)
  if (o.shade) { const C = crescent(Q, (o.depth ?? 12) * .8); if (C) paint(C, { wash: o.shade, washOp: 120, ink: null }); }
  // the cut edge of the card: a hair of paler card catching the key light, on the lit side only (the drop shadow does the
  // separating everywhere else), in a lighter tint of the piece's own colour
  if (o.edge !== false) for (const r of litEdge(Q, .4, .35, true)) if (r.length > 2) _inkLine(r, Math.max(.35, sw * .2), mixCol(col, '#FFFFFF', .28), 'flashfine', 0);
}
// dline(P, sw, col): a detail line drawn ON a piece (ink: fine Flash line; card: pencil on the card).
function dline(P, sw = 1, col = NOIR.ink, curv = 0) {
  if (isPageRule(col)) { _inkLine(P, sw * .8, col, 'rotring', curv); return; }   // the page's rules: plain and still in every look
  if (STYLE.card) _inkLine(P, sw * .7, col, 'cardpen', curv);   // a fine pen line drawn on the card
  else if (STYLE.mode === 'ink') _inkLine(P, inkFigSW(sw, 'inner', 'flashfine'), col, 'flashfine', curv);   // (in a figure: an interior line, inkFigSW)
  else if (STYLE.mode === 'bank') {
    const fg = bankInFig(), gd = bankInGround(), b = bankStroke(sw * .9 * (fg ? 1.15 : gd ? .85 : 1));
    bankVigInk(P, b.w, fg ? bankFigCol(b.col) : gd ? bankGroundCol(b.col) : b.col, 'rotring', curv, P.length ? P[0][0] * .013 + P[0][1] * .029 : 0);
  }
  else if (STYLE.mode === 'xerox') { if (lum(col) < .6) risoLine(P, sw * .7, false, curv); }
  else if (STYLE.mode === 'flip') _inkLine(P.map(([x, y]) => [x + jit(.8), y + jit(.8)]), sw * .75, lum(col) < .45 ? col : col, 'graphite', curv);
  else if (lum(col) < .78) edgeLine(P, sw * .8, col, false, curv);
}
// A limb from root to tip with one smooth bend (rubber hose), or, in card, two stiff card segments on a split pin.
// P: [root, mid, tip]. The root end is left open in ink (it tucks into the body); returns { tip, ang } for a hand.
function limb(P, w0, w1, col, o = {}) {
  const sw = o.sw ?? 1.6;
  if (inkFigOn() && INK_FIG.hose) { const hw = INK_FIG.hose; col = NOIR.ink; w0 = Math.min(w0, hw); w1 = Math.min(w1, hw * .9); o = { ...o, ink: null, shade: null }; }   // (ink: a bot's rubber hose, INK_HOSE)
  if (STYLE.card) {
    const seg = (a, b, wa, wb, key) => {
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), L = Math.hypot(b[0] - a[0], b[1] - a[1]), pts = [];
      for (let i = 0; i <= 8; i++) { const t = Math.PI / 2 + i / 8 * Math.PI; pts.push([Math.cos(t) * wa / 2, Math.sin(t) * wa / 2]); }
      for (let i = 0; i <= 8; i++) { const t = -Math.PI / 2 + i / 8 * Math.PI; pts.push([L + Math.cos(t) * wb / 2, Math.sin(t) * wb / 2]); }
      const c = Math.cos(ang), s = Math.sin(ang);
      piece(pts.map(([x, y]) => [a[0] + x * c - y * s, a[1] + x * s + y * c]), col, { ...o, key, shade: null, lift: 4, texFrame: [a[0], a[1], ang] });
    };
    const wm = (w0 + w1) / 2;
    seg(P[0], P[1], w0, wm, (o.key || 'limb') + 'u'); seg(P[1], P[2], wm, w1, (o.key || 'limb') + 'l');
    brad(P[1][0], P[1][1], Math.max(3, wm * .16)); if (o.rootPin) brad(P[0][0], P[0][1], Math.max(3, w0 * .16));
    const d = [P[2][0] - P[1][0], P[2][1] - P[1][1]];
    return { tip: P[2], ang: Math.atan2(d[1], d[0]) };
  }
  const C = through(P, 10), n = C.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = C[Math.max(0, i - 1)], b = C[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, w = lerp(w0, w1, i / (n - 1)) / 2;
    L.push([C[i][0] - dy / d * w, C[i][1] + dx / d * w]); R.push([C[i][0] + dy / d * w, C[i][1] - dx / d * w]);
  }
  { const m = 3 * Math.max(w0, w1), L2 = unloop(L, m), R2 = unloop(R, m); L.splice(0, n, ...L2); R.splice(0, n, ...R2); }   // (a sharp elbow's inner edge folds over itself: core.js unloop)
  const e = C[n - 1], p = C[n - 2], ta = Math.atan2(e[1] - p[1], e[0] - p[0]), cap = [];
  for (let k = 1; k < 8; k++) { const th = ta + Math.PI / 2 - k / 8 * Math.PI; cap.push([e[0] + Math.cos(th) * w1 / 2, e[1] + Math.sin(th) * w1 / 2]); }
  const r0 = C[0], r1 = C[1], ra = Math.atan2(r0[1] - r1[1], r0[0] - r1[0]), rcap = [];
  for (let k = 1; k < 8; k++) { const th = ra + Math.PI / 2 - k / 8 * Math.PI; rcap.push([r0[0] + Math.cos(th) * w0 / 2, r0[1] + Math.sin(th) * w0 / 2]); }
  const body = L.concat(cap, R.slice().reverse(), rcap);
  fillRegion(body, col, o);
  if (inkFigOn() && INK_FIG.flat) o = { ...o, shade: null };   // (ink, a bot: flat)
  if (o.shade) {   // a shadow strip down the side away from the light
    const [lx, ly] = lightLocal(), mid = Math.floor(n / 2), nx = L[mid][0] - C[mid][0], ny = L[mid][1] - C[mid][1];
    const side = (nx * lx + ny * ly) < 0 ? L : R, strip = [];
    for (let i = 0; i < n; i++) { const k = .38 * Math.sin(Math.PI * clamp(i / (n - 1) * 1.1)); strip.push([lerp(side[i][0], C[i][0], k), lerp(side[i][1], C[i][1], k)]); }
    shadeRegion(side.concat(strip.reverse()), o.shade);
  }
  if (o.ink !== null) edgeLine(o.closedRoot ? body : L.concat(cap, R.slice().reverse()), sw, o.ink || NOIR.ink, !!o.closedRoot);
  return { tip: e, ang: ta };
}
// A brass split pin (card joints).
function brad(x, y, r) {
  if (!STYLE.card) return;
  paint(oval(x + .8, y + 1.2, r, r, 0, 14), { wash: '#120E12', washOp: 90, ink: null });
  paint(oval(x, y, r, r, 0, 14), { wash: '#C9A24A', ink: null });
  paint(oval(x - r * .3, y - r * .3, r * .35, r * .35, 0, 8), { wash: '#F4DE9A', ink: null });
}

// ---------- hands ----------
// The rubber-hose glove (the ink look, on a bot or a boss: hand() switches to it): big and puffy, four fat fingers (three
// and a thumb), a flared cuff with two seams, flat white; one silhouette at the figure's contour weight, with light creases
// where the fingers lie over the palm (inkGroup). In hand()'s frame; S, cap: its helpers.
function inkGlove(pose, s, o, S, cap) {
  const col = NOIR.cream, w = .85, r = .21 * s, F = [];
  const cuff = curvy(S([[-.5, -.64], [.08, -.53], [.17, 0], [.08, .53], [-.5, .64], [-.41, 0]]), 3);
  const palm = curvy(S([[.02, -.5], [.55, -.6], [.94, -.43], [1.05, 0], [.94, .45], [.55, .6], [.02, .5], [-.04, 0]]), 4);
  if (pose === 'open') for (const [fy, fa] of [[-.32, -.4], [0, 0], [.32, .4]]) F.push(cap(.86 * s, fy * s, (.86 + Math.cos(fa) * .5) * s, (fy + Math.sin(fa) * .5) * s, r));
  else if (pose === 'point') { F.push(cap(.86 * s, -.26 * s, 1.6 * s, -.3 * s, .17 * s)); for (const fy of [.08, .34]) F.push(cap(.9 * s, fy * s, 1.02 * s, (fy + .06) * s, r)); }
  else if (pose === 'fist' || pose === 'thumb' || pose === 'hold') for (const fy of [-.3, 0, .3]) F.push(cap(.9 * s, fy * s, 1.02 * s, (fy + .05) * s, r));
  else for (const [fy, fa] of [[-.3, .25], [0, .35], [.3, .45]]) F.push(cap(.84 * s, fy * s, (.84 + Math.cos(fa) * .34) * s, (fy + Math.sin(fa) * .34) * s, r));   // relax
  const th = pose === 'thumb' ? cap(.45 * s, -.48 * s, .5 * s, -1.12 * s, .19 * s) : cap(.34 * s, -.46 * s, (pose === 'open' ? .78 : .72) * s, (pose === 'open' ? -.92 : -.7) * s, .19 * s);
  const late = !!o.hold && pose === 'hold';   // (holding: the prop between the palm and the curled fingers)
  inkGroup([[cuff, col], [palm, col], ...(late ? [] : [...F, th].map(f => [f, col]))], { w, key: (o.key || 'hand') + 'ig' });
  for (const x0 of [-.12, -.3]) dline(S([[x0 + .02, -.52], [x0 + .07, 0], [x0 + .02, .52]]), 1, NOIR.ink, .5);   // (the cuff's seams)
  if (o.hold) { push(); translate(.9 * s, 0); o.hold(s); pop(); }
  if (late) for (const f of [...F, th]) piece(f, col, { role: w * .8 });
}
// hand(x, y, ang, s, o): a cartoon hand at the wrist (x, y) pointing along ang, size s (≈ palm length).
//   o.pose: relax | open | tray (palm up, held out flat, seen edge on: the little finger's side toward us) | point | fist | thumb | hold · o.glove (white glove with cuff and stitching) · o.col skin
//   o.sw · o.mirror (thumb on the other side) · o.hold(s) draws a held prop between the palm and the fingers · o.maxTone
//   (bare skin: caps how dark the tone looks may print it, as piece() does)
function hand(x, y, ang, s, o = {}) {
  const pose = o.pose || 'relax', col = o.glove ? NOIR.cream : (o.col || '#7A4A33'), sw = o.sw ?? 1.4, k = o.key || 'hand';
  const shade = o.glove ? '#C9BFB0' : mixCol(col, NOIR.ink, .3);
  push(); translate(x, y); rotate(ang); if (o.mirror) scale(1, -1);
  const S = P => U(P, s), cap = (x0, y0, x1, y1, r) => { const a = Math.atan2(y1 - y0, x1 - x0), p = []; for (let i = 0; i <= 6; i++) { const t = a + Math.PI / 2 + i / 6 * Math.PI; p.push([x0 + Math.cos(t) * r, y0 + Math.sin(t) * r]); } for (let i = 0; i <= 6; i++) { const t = a - Math.PI / 2 + i / 6 * Math.PI; p.push([x1 + Math.cos(t) * r, y1 + Math.sin(t) * r]); } return p; };
  if (o.glove && inkFigOn()) { inkGlove(pose, s, o, S, cap); pop(); return; }   // (ink, on a figure: the rubber-hose glove)
  if (o.glove) piece(curvy(S([[-.35, -.55], [.1, -.62], [.2, 0], [.1, .62], [-.35, .55], [-.25, 0]]), 3), NOIR.cream, { sw, key: k + 'cuff', lift: 3 });
  if (pose === 'tray' && !o.glove) {   // palm up, flat, edge on (-y: the palm's side): the thumb's tip over the far side, the hand's edge, the little finger along it
    piece(cap(.42 * s, -.16 * s, .74 * s, -.3 * s, .11 * s), mixCol(col, NOIR.ink, .12), { sw: sw * .8, key: k + 'thumb', lift: 2, flatCard: true, maxTone: o.maxTone });
    piece(curvy(S([[0, -.19], [.45, -.2], [.9, -.16], [1.25, -.11], [1.46, -.08], [1.53, -.02], [1.48, .05], [1.28, .07], [.98, .09], [.9, .14], [.5, .19], [0, .19]]), 4), col, { sw, shade, depth: s * .12, key: k + 'palm', lift: 3, maxTone: o.maxTone });
    dline(S([[.9, .02], [1.2, .0], [1.44, -.02]]), sw * .45, shade);   // (the little finger along the edge)
    pop(); return;
  }
  const palm = curvy(S([[.05, -.42], [.55, -.5], [.85, -.35], [.92, 0], [.85, .38], [.55, .5], [.05, .42], [0, 0]]), 4);
  const fingers = [];
  if (pose === 'open') for (const [fy, fa] of [[-.3, -.35], [0, 0], [.3, .35]]) fingers.push(cap(.8 * s, fy * s, (.8 + Math.cos(fa) * .6) * s, (fy + Math.sin(fa) * .6) * s, .15 * s));
  else if (pose === 'point') { fingers.push(cap(.8 * s, -.25 * s, 1.55 * s, -.3 * s, .14 * s)); for (const fy of [.05, .3]) fingers.push(cap(.85 * s, fy * s, 1.0 * s, (fy + .08) * s, .16 * s)); }
  else if (pose === 'fist' || pose === 'thumb' || pose === 'hold') for (const fy of [-.28, 0, .28]) fingers.push(cap(.82 * s, fy * s, .98 * s, (fy + .05) * s, .16 * s));
  else for (const [fy, fa] of [[-.28, .25], [0, .35], [.28, .45]]) fingers.push(cap(.8 * s, fy * s, (.8 + Math.cos(fa) * .38) * s, (fy + Math.sin(fa) * .38) * s, .15 * s));   // relax: curled a little
  const thumb = pose === 'thumb' ? cap(.45 * s, -.45 * s, .5 * s, -1.05 * s, .15 * s) : cap(.35 * s, -.42 * s, (pose === 'open' ? .75 : .7) * s, (pose === 'open' ? -.85 : -.62) * s, .15 * s);
  for (const f of fingers) piece(f, col, { sw: sw * .8, key: k + 'f' + fingers.indexOf(f), lift: 2, flatCard: true, maxTone: o.maxTone });
  piece(palm, col, { sw, shade, depth: s * .25, key: k + 'palm', lift: 3, maxTone: o.maxTone });
  if (o.hold) { push(); translate(.85 * s, 0); o.hold(s); pop(); if (pose === 'hold') for (const f of fingers) piece(f, col, { sw: sw * .8, key: k + 'g' + fingers.indexOf(f), lift: 2, flatCard: true, maxTone: o.maxTone }); }
  piece(thumb, col, { sw: sw * .8, key: k + 'thumb', lift: 2, flatCard: true, maxTone: o.maxTone });
  if (o.glove) for (const fy of [-.2, 0, .2]) dline([[.25 * s, fy * s], [.6 * s, fy * 1.15 * s]], sw * .4, '#A89E90');
  pop();
}

// ---------- faces (for humans) ----------
// strokeShape(P, wf, n): a smooth brush stroke along the points P as one closed outline, its width wf(t) at t = 0..1 (by
// length) and a round end at each end (a width near 0 ends in a fine point). Brows, closed-eye lines, creases: anything
// that must taper cleanly at any size (n = samples per span: no facets even at 4K).
function strokeShape(P, wf, n = 12) {
  const C = through(P, n), m = C.length, D = [0];
  for (let i = 1; i < m; i++) D.push(D[i - 1] + Math.hypot(C[i][0] - C[i - 1][0], C[i][1] - C[i - 1][1]));
  const tot = D[m - 1] || 1, L = [], R = [], N = [], Wd = [];
  for (let i = 0; i < m; i++) {
    const a = C[Math.max(0, i - 1)], b = C[Math.min(m - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, w = Math.max(0, wf(D[i] / tot)) / 2;
    N.push([-dy / d, dx / d, dx / d, dy / d]); Wd.push(w);
    L.push([C[i][0] - dy / d * w, C[i][1] + dx / d * w]); R.push([C[i][0] + dy / d * w, C[i][1] - dx / d * w]);
  }
  const cap = (i, back) => { const [nx, ny, tx, ty] = N[i], r = Wd[i], c = C[i], out = [], s = back ? -1 : 1;
    for (let k = 1; k < 8; k++) { const f = k / 8 * Math.PI; out.push([c[0] + s * (nx * r * Math.cos(f)) + s * tx * r * Math.sin(f), c[1] + s * (ny * r * Math.cos(f)) + s * ty * r * Math.sin(f)]); }
    return out; };
  return L.concat(cap(m - 1, false), R.reverse(), cap(0, true));
}
// The outline of a union of ellipses E ([cx, cy, rx, ry], ...) walked by angle round c0 (inside all of them): one soft
// shape from several (a nose's tip and wings). Each point carries its angle as a third value (0 = pointing right, down +).
function ellipseUnion(E, c0, n = 72) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU, ux = Math.cos(a), uy = Math.sin(a); let best = 0;
    for (const [ex0, ey0, erx, ery] of E) {
      const px = (c0[0] - ex0) / erx, py = (c0[1] - ey0) / ery, vx = ux / erx, vy = uy / ery;
      const A = vx * vx + vy * vy, B = 2 * (px * vx + py * vy), Cc = px * px + py * py - 1, D = B * B - 4 * A * Cc;
      if (D >= 0) best = Math.max(best, (-B + Math.sqrt(D)) / (2 * A));
    }
    out.push([c0[0] + ux * best, c0[1] + uy * best, a]);
  }
  return out;
}
// The run of such an outline outside the angles skip(a) says to leave open (e.g. the top of a nose, where the bridge
// runs into it), as an open line.
function openRun(U, skip) {
  const n = U.length, i0 = U.findIndex((p, i) => skip(p[2]) && !skip(U[(i + 1) % n][2])), run = [];
  for (let j = 1; j <= n; j++) { const p = U[(i0 + j + n) % n]; if (skip(p[2])) break; run.push([p[0], p[1]]); }
  return run;
}
// A face line (a closed eye, a squint) drawn as a tapered brush stroke: a solid piece where the look has solid ink (ink,
// card, xerox), a pen line elsewhere. wf: width along it (see strokeShape).
function faceStroke(P, wf, sw, key, col = NOIR.ink) {
  if (STYLE.mode === 'xerox') risoStroke(P, wf);   // printed from the key plate, like every line
  else if (['ink', 'xerox'].includes(STYLE.mode) || STYLE.card) piece(strokeShape(P, wf), col, { ink: null, key, lift: 1, flatCard: true, edge: false, fine: true });
  else dline(P, sw * 1.25, col, .5);
}
// Clip a polygon to a convex one (Sutherland–Hodgman): irises and pupils stay inside the eye's white.
function clipConvex(P, C) {
  let out = P; const n = C.length; let sgn = 0;
  for (let i = 0; i < n; i++) { const a = C[i], b = C[(i + 1) % n], c = C[(i + 2) % n]; sgn += (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]); }
  sgn = Math.sign(sgn) || 1;
  for (let i = 0; i < n && out.length; i++) {
    const a = C[i], b = C[(i + 1) % n], inside = p => sgn * ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])) >= 0, inp = out; out = [];
    for (let j = 0; j < inp.length; j++) {
      const p = inp[j], q = inp[(j + 1) % inp.length], ip = inside(p), iq = inside(q);
      if (ip) out.push(p);
      if (ip !== iq) { const d = (b[0] - a[0]) * (q[1] - p[1]) - (b[1] - a[1]) * (q[0] - p[0]), t = d ? ((b[0] - a[0]) * (a[1] - p[1]) - (b[1] - a[1]) * (a[0] - p[0])) / d : 0; out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
    }
  }
  return out;
}
// eyeH(x, y, s, o): an eye with a white, an iris and lids. s = eye width. o: open 0..1 (upper lid), lower 0..1 (lower lid
// pushed up: smiling or squinting), slant (the upper lid tilts: + angry, the inner corner lower; - sad, the outer corner
// lower), look [x, y] -1..1, iris colour, pupil scale, lash weight, skin (lid colour), style ('open' | 'happy' | 'shut' |
// 'squeeze'), side: -1 the screen-left eye, 1 the screen-right eye (the eye is mirrored so its outer corner points away
// from the nose; squeezed eyes point in at the nose: > <), sx (3/4: the far eye's foreshortening: the whole eye, iris
// and lids squeezed across, so both eyes stay the same eye and their gazes stay parallel). Brows are drawn separately.
function eyeH(x, y, s, o = {}) {
  if (typeof cardEye === 'function' && STYLE.card) o = cardEye(o);   // (card: a replacement eye from the chart, mouths.js)
  const sw = o.sw ?? 1.4, skin = o.skin || '#7A4A33', st = o.style || 'open', sd = o.side || 1, k = o.key || 'eye' + Math.round(x), fx = o.sx ?? 1;
  const rx = s * .5, ry = s * .58 * (o.tall ?? 1), M = P => P.map(([a, b]) => [a * sd * fx, b]);   // model space: +x = the outer corner
  // the eye's shape, t = -1 (inner corner) .. 1 (outer corner): the outer corner a touch higher, the top a round arch
  const cy = t => -ry * .05 * (t + 1), up = t => cy(t) - ry * Math.pow(Math.max(0, 1 - t * t), .5), dn = t => cy(t) + ry * .84 * Math.pow(Math.max(0, 1 - t * t), .62);
  const ts = n => Array.from({ length: n + 1 }, (_, i) => -1 + 2 * i / n);
  push(); translate(x, y);
  if (st === 'happy' || st === 'shut') {   // happy: ∩ (the cheeks push the closed lids up); shut (a blink): ∪, the lid down over the eye
    const P = st === 'happy' ? ts(8).map(t => [t * rx * 1.02, cy(t) + ry * .16 - ry * .56 * (1 - t * t)]) : ts(8).map(t => [t * rx * 1.04, cy(t) + ry * .08 + ry * .3 * (1 - t * t)]);
    faceStroke(M(P), t => s * (.04 + .1 * Math.sin(Math.PI * t)), sw * 1.2, k + 'c'); pop(); return;
  }
  if (st === 'squeeze') {   // squeezed shut: two strokes from an apex at the inner corner, '>' on the left eye, '<' on the right
    const A = [-rx * .62, 0];
    for (const d of [-1, 1]) faceStroke(M([A, [rx * .05, d * ry * .3], [rx * .82, d * ry * .66]]), t => s * lerp(.12, .03, t), sw * 1.2, k + 's' + d);
    pop(); return;
  }
  const white = ts(18).map(t => [t * rx, up(t)]).concat(ts(18).reverse().slice(1, -1).map(t => [t * rx, dn(t)]));
  piece(M(white), '#F4EEE4', { sw: sw * (STYLE.mode === 'ink' ? .45 : .7), ink: STYLE.card ? null : NOIR.ink, key: k + 'w', lift: 2, flatCard: true, fine: true });   // (in ink finer than the lash line)
  // iris, pupil and highlights (the light is the same for both eyes, so the highlights aren't mirrored), kept in the white
  const lk = o.look || [0, 0], ir = s * .3 * (o.iris ?? 1), ix = clamp(lk[0], -1, 1) * rx * .42 * fx, iy = clamp(lk[1], -1, 1) * ry * .3 + ry * .08, Wc = M(white);
  const inW = (P, col, key, lift) => { const Q = clipConvex(P, Wc); if (Q.length > 2) piece(Q, col, { ink: null, key, lift, flatCard: true, fine: true }); };
  const nv = STYLE.card ? 2 : 1;   // (card: rounder cut-outs, no facets on a big 4K eye)
  inW(oval(ix, iy, ir * fx, ir * 1.05, 0, 24 * nv), o.irisCol || '#4A2A1C', k + 'i', 1);
  inW(oval(ix, iy, ir * .55 * (o.pupil ?? 1) * fx, ir * .58 * (o.pupil ?? 1), 0, 18 * nv), '#140C10', k + 'p', 0);
  inW(oval(ix - ir * .38 * fx, iy - ir * .42, ir * .3 * fx, ir * .3, 0, 12 * nv), '#FFFFFF', k + 'h', 0);
  inW(oval(ix + ir * .35 * fx, iy + ir * .38, ir * .13 * fx, ir * .13, 0, 8 * nv), '#FFFFFF', k + 'h2', 0);
  // lids: the upper lid comes down from the top of the eye toward its bottom (open < 1), tilted by slant; the lower lid
  // comes up (lower > 0). Their edges run between the eye's own top and bottom, so they always meet it at the corners.
  const open = clamp(o.open ?? 1), low = clamp(o.lower ?? 0), sl = o.slant || 0;
  const shut = t => clamp(1 - open + sl * .32 * -t - Math.abs(sl) * .06), lidE = t => lerp(up(t), dn(t), shut(t) * .96);
  const lowE = t => lerp(dn(t), up(t), low * .55 * Math.pow(Math.max(0, 1 - t * t), .3));
  const T2 = ts(20), lidOn = open < .98 || Math.abs(sl) > .02;
  if (lidOn) piece(M(T2.map(t => [t * rx * 1.02, lidE(t)]).concat([[rx * 1.3, cy(1) - ry * .2], [rx * 1.3, -ry * 1.5 - s * .2], [-rx * 1.3, -ry * 1.5 - s * .2], [-rx * 1.3, cy(-1) - ry * .2]])), skin, { ink: null, key: k + 'lid', lift: 0, flatCard: true, edge: false, fine: true });
  if (low > .02) {
    piece(M(T2.map(t => [t * rx * 1.02, lowE(t)]).reverse().concat([[-rx * 1.3, cy(-1) + ry * .2], [-rx * 1.3, ry * 1.4 + s * .1], [rx * 1.3, ry * 1.4 + s * .1], [rx * 1.3, cy(1) + ry * .2]])), skin, { ink: null, key: k + 'low', lift: 0, flatCard: true, edge: false, fine: true });
    dline(M(ts(8).map(t => t * .82).map(t => [t * rx, lowE(t) + s * .015])), sw * .5, mixCol(skin, NOIR.ink, .5), .5);
  }
  // the lash line rides the upper lid's edge, a little past the outer corner, with a flick there
  const lash = ts(16).map(t => [t * rx * 1.02, (lidOn ? lidE(t) : up(t)) - s * .01]);
  lash.push([rx * 1.16, lash[lash.length - 1][1] - ry * .14]);
  dline(M(lash), sw * (o.lash ?? 1.3), NOIR.ink, .5);
  pop();
}
// A brow's outline: a smooth stroke through P (inner end first) with a round head w0 wide at the inner end, full for a
// little way, then tapering to a fine point at the outer end (w1 wide there).
function browShape(P, w0, w1 = w0 * .12) {
  return strokeShape(P, t => t < .16 ? w0 * lerp(.8, 1, ease(t / .16)) : lerp(w0, w1, Math.pow((t - .16) / .84, 1.35)), 12);
}
// Draw a brow outline in colour col: solid (no outline) where the look fills solid, with a fine edge elsewhere.
function browPiece(B, col, sw, key) {
  const solid = STYLE.mode === 'ink' || STYLE.card || STYLE.mode === 'xerox';
  piece(B, solid ? mixCol(col, NOIR.ink, .15) : col, { ink: solid ? null : NOIR.ink, sw: sw * .7, key, lift: 1, flatCard: true, fine: true });
}
// Brow: an organic tapered stroke from a round inner end to a fine outer point, arched. s = eye width, raise [inner,
// outer] in eye widths (+ = up); side -1 (screen-left) / 1. Angry (inner down) presses the inner end in; sad (inner up)
// lifts it in a tent. sx: 3/4 foreshortening (the far brow's length squeezed like its eye; its weight and lift kept).
function brow(x, y, s, raise, side, col, sw = 1.4, sx = 1) {
  const [ri, ro] = raise, tilt = ro - ri, arch = s * (.15 - .05 * clamp(Math.abs(tilt) / .7));
  const at = t => { const X = x + side * s * sx * lerp(-.5, .58, t), R = lerp(ri, ro, t) * s, A = arch * Math.sin(Math.PI * Math.pow(t, .8));
    const press = ri < 0 ? -ri * s * .22 * Math.pow(1 - t, 3) : 0, tent = ri > ro ? (ri - ro) * s * .18 * Math.sin(Math.PI * Math.min(1, t * 1.6)) : 0;
    return [X, y - R - A + press - tent + s * .02 * t]; };
  browPiece(browShape([0, .22, .48, .74, 1].map(at), s * .24, s * .028), col, sw, 'brow' + Math.round(x));
}
// A human mouth centred at (x, y), width w. kind: flat smile frown smirk grin open shout grimace o wobble laugh sigh.
// o: sw, lip, lipLt, far 0..1 (3/4 view: the far half, +x, foreshortened), key.
function mouthH(x, y, w, kind, o = {}) {
  // card (and any 'lip:' chart kind): a replacement mouth from the chart, held and swapped rather than morphed (mouths.js)
  if (typeof lipPiece === 'function' && (String(kind).startsWith('lip:') || lipsLive())) { lipPiece(x, y, w, kind, o); return; }
  const sw = o.sw ?? 1.4, lipLt = o.lipLt || '#6E4232', dark = '#3A1418', far = clamp(o.far ?? 1, .2, 1), k = o.key || 'm' + Math.round(x);
  push(); translate(x, y);
  const W = w / 2, F = P => P.map(([a, b]) => [a > 0 ? a * far : a, b]);   // the far half foreshortened
  const line = (P, wt, col = NOIR.ink, c = .5) => dline(F(P), wt, col, c), pc = (P, col, op) => piece(F(P), col, { ...op, fine: true });
  // the mouth's line: a brush stroke, full in the middle and fine at the corners (a pen line in the drawn looks)
  const stroke = (P, wt, key) => faceStroke(F(P), t => wt * 2.7 * (.32 + .68 * Math.pow(Math.sin(Math.PI * t), .7)), wt, k + key);
  const lowerLip = (dy = 0) => line([[-W * .35, w * .16 + dy], [0, w * .2 + dy], [W * .35, w * .16 + dy]], sw * .6, lipLt);
  const corners = (dy, d = 1) => { for (const s of [-1, 1]) line([[s * W * 1.02, dy - w * .05 * d], [s * W * 1.1, dy + w * .01], [s * W * 1.03, dy + w * .06 * d]], sw * .5, NOIR.ink); };
  switch (kind) {
    case 'smile': stroke([[-W, -w * .07], [-W * .55, w * .045], [0, w * .07], [W * .55, w * .045], [W, -w * .07]], sw * 1.1, 'l'); lowerLip(w * .03); break;
    case 'frown': stroke([[-W * .9, w * .1], [-W * .45, -w * .015], [0, -w * .035], [W * .45, -w * .015], [W * .9, w * .1]], sw * 1.1, 'l'); lowerLip(w * .03); break;
    case 'smirk': stroke([[-W * .8, w * .04], [0, w * .045], [W * .55, w * .005], [W * .95, -w * .12]], sw * 1.1, 'l'); line([[W * .88, -w * .19], [W * 1.02, -w * .12], [W * .98, -w * .05]], sw * .5); lowerLip(); break;
    case 'wobble': stroke([[-W, 0], [-W * .5, -w * .05], [0, w * .02], [W * .5, -w * .05], [W, 0]], sw, 'l'); lowerLip(); break;
    case 'o': case 'sigh': pc(oval(kind === 'sigh' ? W * .15 : 0, w * .05, w * .15, w * .17, 0, 20), dark, { sw: sw * .7, key: k + 'o', lift: 1, flatCard: true }); break;
    case 'grin': case 'laugh': {
      const h = kind === 'laugh' ? w * .5 : w * .3;
      pc(curvy([[-W, -w * .05], [0, -w * .02], [W, -w * .05], [W * .6, h * .7], [0, h], [-W * .6, h * .7]], 6), dark, { sw: sw * .6, key: k + 'g', lift: 1, flatCard: true });
      pc(curvy([[-W * .82, -w * .015], [W * .82, -w * .015], [W * .66, w * .1], [0, w * .115], [-W * .66, w * .1]], 4), '#F4EEE4', { ink: null, key: k + 't', lift: 0, flatCard: true });
      if (kind === 'laugh') pc(curvy([[-W * .42, h * .82], [-W * .2, h * .55], [W * .2, h * .55], [W * .42, h * .82], [0, h * .9]], 4), '#C4566A', { ink: null, key: k + 'tg', lift: 0, flatCard: true });
      break;
    }
    case 'open': case 'shout': {
      const h = kind === 'shout' ? w * .75 : w * .42, ww = kind === 'shout' ? W * .8 : W * .6;
      pc(curvy([[-ww, 0], [0, -h * .15], [ww, 0], [ww * .7, h * .75], [0, h], [-ww * .7, h * .75]], 6), dark, { sw: sw * .6, key: k + 's', lift: 1, flatCard: true });
      if (kind === 'shout') pc(curvy([[-ww * .78, -h * .04], [0, -h * .1], [ww * .78, -h * .04], [ww * .6, h * .12], [0, h * .14], [-ww * .6, h * .12]], 4), '#F4EEE4', { ink: null, key: k + 'st', lift: 0, flatCard: true });
      pc(curvy([[-ww * .5, h * .8], [-ww * .25, h * .6], [ww * .25, h * .6], [ww * .5, h * .8], [0, h * .9]], 4), '#C4566A', { ink: null, key: k + 'sg', lift: 0, flatCard: true });
      break;
    }
    case 'grimace': {   // clenched teeth, the lips pulled back and the corners down: a dark snarl with two rows of teeth
      pc(curvy([[-W * 1.08, w * .07], [-W * .78, -w * .1], [0, -w * .135], [W * .78, -w * .1], [W * 1.08, w * .07], [W * .78, w * .21], [0, w * .245], [-W * .78, w * .21]], 6), dark, { sw: sw * .5, key: k + 'gr', lift: 1, flatCard: true });
      pc(curvy([[-W * .86, -w * .06], [0, -w * .1], [W * .86, -w * .06], [W * .9, w * .045], [0, w * .03], [-W * .9, w * .045]], 4), '#F4EEE4', { ink: null, key: k + 'gt', lift: 0, flatCard: true });
      pc(curvy([[-W * .8, w * .085], [0, w * .07], [W * .8, w * .085], [W * .66, w * .18], [0, w * .2], [-W * .66, w * .18]], 4), '#F4EEE4', { ink: null, key: k + 'gb', lift: 0, flatCard: true });
      for (const tx of [-.56, -.2, .2, .56]) line([[tx * W, -w * .085 + Math.abs(tx) * w * .03], [tx * W * 1.02, w * .03]], sw * .35, '#9A8E86', 0);
      for (const tx of [-.4, 0, .4]) line([[tx * W, w * .08], [tx * W * .98, w * .17]], sw * .35, '#9A8E86', 0);
      corners(w * .07);
      break;
    }
    default: stroke([[-W * .75, w * .005], [0, w * .02], [W * .75, w * .005]], sw * .85, 'l'); lowerLip();
  }
  pop();
}
// Map the kit's emotion faces (feel / emotions) to human face settings.
function faceOf(o) {
  const e = Array.isArray(o.eyes) ? o.eyes[1] : (o.eyes || 'normal');
  const F = {
    normal: { open: .92, brow: [0, 0] }, look: { open: .92, brow: [0, 0] }, wide: { open: 1, tall: 1.15, brow: [.45, .4], iris: .85 },
    happy: { style: 'happy', brow: [.25, .15] }, closed: { style: 'shut', brow: [0, 0] }, sleepy: { open: .35, brow: [-.05, -.15] },
    narrow: { open: .5, lower: .2, brow: [-.12, .02] }, angry: { open: .78, lower: .15, slant: .55, brow: [-.4, .22] }, determined: { open: .82, slant: .3, brow: [-.25, .1] },
    sad: { open: .74, slant: -.5, brow: [.4, -.15] }, teary: { open: .78, slant: -.45, brow: [.45, -.12] }, cry: { style: 'squeeze', brow: [.45, -.15] },
    squeeze: { style: 'squeeze', brow: [-.1, .1] }, scared: { open: 1, tall: 1.2, iris: .6, brow: [.55, .3] }, blank: { open: 1, iris: .5, brow: [.1, .1] },
    shine: { open: 1, iris: 1.15, brow: [.3, .2] }, spark: { open: 1, iris: 1.1, brow: [.3, .25] }, heart: { open: 1, brow: [.3, .2] },
    shades: { open: .9, brow: [0, 0] }, x: { style: 'squeeze', brow: [.2, .2] }, swirl: { open: 1, brow: [.3, .1] }, red: { open: .8, slant: .55, brow: [-.45, .25] }, dot: { open: 1, iris: .6, brow: [.1, .1] },
  }[e] || { open: .92, brow: [0, 0] };
  const M = { o: 'o', O: 'shout', smile: 'smile', grin: 'grin', flat: 'flat', wobble: 'wobble', cat: 'smile', frown: 'frown', smirk: 'smirk', laugh: 'laugh', open: 'open', wail: 'shout', teeth: 'grimace', tongue: 'smile', pout: 'frown', yawn: 'open' };
  return { ...F, open: (F.open ?? 1) * (1 - clamp(o.squint || 0)), mouth: o.mouth ? (M[o.mouth] || o.mouth) : 'flat' };
}

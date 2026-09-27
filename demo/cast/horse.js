// cast/horse.js: the engraved thoroughbred (the bank look): V3a's synthetic racehorses, drawn the way an old banknote or
// a bond certificate engraves a horse. An elegant, confident silhouette (a long arched neck, fine legs, a flowing mane
// and tail); the form modelled in swelling lines that follow it (along the barrel, fanning round the quarters, down the
// neck and the legs), cross-hatched in the shadows, the highlights left in paper. They're synthetic, so the machine is
// engraved detail rather than bolts: fine panel seams (the shoulder and quarter plates), a rivet line along the neck
// under the mane, a small maker's plate on the quarter (an ornament, no lettering), a gear turning in a round window at
// the point of the shoulder, pivot caps at the joints, a lens for an eye with an iris of aperture blades, steel shoes.
//
//   engHorse(x, y, s, o)  in profile, facing right. (x, y) = the ground under the girth; s = the unit (px): ~9s to the
//                         withers, ~13s from the buttock to the muzzle. Returns (caller coords) { saddle (the seat's top),
//                         bit (the bit ring), head, withers, dock, poll, hooves: [nearF, farF, nearH, farH], lift (the
//                         body's height over its standing height, px) }.
//     o.ph      gallop phase (cycles); null = standing (o.prance 0..1 lifts the near fore and tosses the head)
//     o.fly     0..1: the flying gallop (the Victorian print's extended pose, held longer; the legs paired; more lift)
//     o.strain  0..1: bolting (the neck stretched out and low, the nose out, ears pinned, nostrils flared, jaw open)
//     o.pitch   rad (+ = nose down) · o.coat: 'jet' | 'steel' | 'brass' | 'copper' · o.key (unique per horse)
//     o.far     0..1: set back (paler ink) · o.wind 0..1 (mane and tail streaming flat; default from the gallop)
//     o.tack    false: no saddle and bridle · o.cloth: the saddle cloth's colour · o.detail 0..1 (default 1)
//   engHorsePose(o)       the pose alone (joints in body units), for composing.
// The engraving primitives (any bank-look drawing can use them):
//   engStroke(P, w, col)  one engraved line through P = [[x, y, pressure], ...]: pressure swells and thins it along its
//                         length (p5.brush's per-point pressure); w = its width at pressure 1 (local px).
//   engStrip(A, B, o)     engraved lines along a strip between two edges A and B (point lists, any lengths: resampled),
//                         shaded by a light as if the strip were a rounded form (A's side faces o.m or away from B, the
//                         middle faces us). The lines nest: their number follows the strip's size on screen in steps of
//                         two, the in-between lines fading in, so a zoom never pops them. Cross-hatched in the darks.
// Line spacing and weights are in screen px (bankPx()), finer at the 4K detail levels (bankK), like waveLines.
// LOOPS.horse / LOOPS.horseRun: model sheets (the gallop cycle, standing and prancing; the coats).

// ======================================================================================================================
// engraving
// ======================================================================================================================
const EQ = {
  d: () => 3.4 / bankK(),   // the target line spacing (screen px); the 4K detail levels engrave finer
  L: [-.52, -.7, .5],       // toward the key light (upper left, a little in front)
  COATS: {
    jet:    { col: '#10141C', dark: .64, k: .66 },     // a black steed (the lead)
    steel:  { col: '#42546A', dark: .3, k: .55 },
    brass:  { col: '#6E5220', dark: .2, k: .66 },
    copper: { col: '#723420', dark: .28, k: .64 },
  },
};
EQ.Ln = (v => { const n = Math.hypot(...v); return v.map(c => c / n); })(EQ.L);
EQ.Hn = (v => { const n = Math.hypot(...v); return v.map(c => c / n); })([EQ.Ln[0], EQ.Ln[1], EQ.Ln[2] + 1]);
EQ.L2 = (v => { const n = Math.hypot(v[0], v[1]); return [v[0] / n, v[1] / n]; })(EQ.L);

// tone 0..1 (paper .. dark) of a surface with unit normal n, a coat's darkness, and a bias
function eqTone(nx, ny, nz, dark, bias = 0) {
  const L = EQ.Ln, Hh = EQ.Hn;
  const d = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
  const sp = Math.pow(Math.max(0, nx * Hh[0] + ny * Hh[1] + nz * Hh[2]), 14);
  return clamp(dark + (.94 - dark) * (1 - (.06 + .94 * d)) + bias - (.62 + .7 * dark) * sp);
}
// ink coverage (line width ÷ spacing) for a tone: paper in the highlights, swelling steeply into the darks
const eqCov = t => t < .08 ? 0 : .04 + .84 * Math.pow((t - .08) / .92, 1.25);
// The finest line printed (screen px), and the pressure that prints a line w screen px wide on a stroke whose width at
// pressure 1 is minW / .77. (p5.brush's per-point pressure: the width goes with its square from ~.85 up; below that the
// dabs thin out and the line breaks up, so a hairline sits at .88 and a line fades out by breaking.)
const eqMinW = () => (BANK.wmin ?? .7) / bankKW();
const eqPress = w => clamp(Math.sqrt(.77 * w / eqMinW()), .88, 1.62);
// weight 0..1 → pressure over the usable range (for detail lines)
const eqP = k => .9 + .7 * clamp(k);

// one engraved line (see the header); drawn round its own centre (p5.brush loses strokes far from the origin)
function engStroke(P, w, col, br) {
  if (P.length < 2 || !(w > 0)) return;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const p of P) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  push(); translate(cx, cy);
  brush.noFill(); brush.noWash(); brush.noHatch(); brush.set(br || bankBrush(w), col, w);
  brush.spline(P.map(p => [p[0] - cx, p[1] - cy, Math.max(.02, p[2] ?? 1)]), .5);
  pop();
}
// a pressured polyline, split where the pressure drops to nothing (a highlight: paper), each piece's ends tapered off,
// ruled in short pieces (p5.brush strokes fade over long spans)
function eqRuns(P, w, col, clipP) {
  let run = [];
  const flush = () => {
    if (run.length >= 2) {
      const n = run.length;
      for (let i = 0; i < Math.min(2, n >> 1); i++) { run[i][2] *= i ? .82 : .52; run[n - 1 - i][2] *= i ? .82 : .52; }
      for (let j = 0; j < n - 1; j += 22) engStroke(run.slice(j, j + 23), w, col);
    }
    run = [];
  };
  for (const p of P) { if (p[2] > .04 && (!clipP || inPoly(p[0], p[1], clipP))) run.push([p[0], p[1], p[2]]); else flush(); }
  flush();
}
// a polyline resampled to n points evenly by arc length
function eqResample(P, n) {
  const d = [0]; for (let i = 1; i < P.length; i++) d.push(d[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const L = d[d.length - 1] || 1, out = []; let j = 0;
  for (let i = 0; i < n; i++) { const s = L * i / (n - 1); while (j < P.length - 2 && d[j + 1] < s) j++; const k = (s - d[j]) / ((d[j + 1] - d[j]) || 1); out.push([lerp(P[j][0], P[j + 1][0], k), lerp(P[j][1], P[j + 1][1], k)]); }
  return out;
}
const eqAt = (A, s) => { const i = clamp(Math.floor(s), 0, A.length - 2), k = clamp(s - i, 0, 1); return [lerp(A[i][0], A[i + 1][0], k), lerp(A[i][1], A[i + 1][1], k)]; };
// a line's rank in the nesting (how many halvings it survives): j's trailing zero bits
const eqRank = j => { let r = 0; while (j % 2 === 0 && r < 10) { j /= 2; r++; } return r; };
// Engraved lines along the strip between edges A and B (see the header). o: px (screen px per local px), col, dark
// (the coat), bias(u, v) (a tone offset), cross (cross-hatch the darks; default on), skew (the cross lines' slant, in
// strip lengths), crossAt (the tone they start at), n0 (lines at the coarsest level), dk (spacing ×), flat (0..1:
// flatten the rounding toward a plane facing us), clip (a polygon).
// Tone is printed the way an engraver cuts it: a line never goes finer than the finest printed line; lighter tones drop
// lines out, finest-first (each line's rank in the nesting), a dropping line breaking up as it goes; darker tones swell them.
function engStrip(A0, B0, o) {
  const M = o.M || 34, A = eqResample(A0, M), B = eqResample(B0, M), px = o.px, d = EQ.d() * (o.dk || 1), minW = eqMinW();
  let wmax = 1e-6; for (let i = 0; i < M; i++) wmax = Math.max(wmax, Math.hypot(A[i][0] - B[i][0], A[i][1] - B[i][1]));
  const n0 = o.n0 || 2, lvl = Math.max(0, Math.log2(wmax * px / (n0 * d))), k = Math.floor(lvl), f = lvl - k, N = n0 * 2 ** k;
  const w0 = minW / .77 / px * (o.k || 1), flat = o.flat || 0;
  const tone = (i, v) => {   // the rounded strip's normal at edge point i, across-fraction v → tone
    const a = A[i], b = B[i]; let mx = a[0] - b[0], my = a[1] - b[1]; const ml = Math.hypot(mx, my) || 1; mx /= ml; my /= ml;
    const ph = Math.PI * lerp(v, .5, flat), c = Math.cos(ph);
    return eqTone(mx * c, my * c, Math.sin(ph), o.dark || 0, o.bias ? o.bias(i / (M - 1), v) : 0);
  };
  // the pressure for a line of rank r (fading in by fd) where the tone is t and the finest spacing is dS (screen px)
  const pressAt = (t, c, dS, r, fd) => {
    if (c <= 0) return 0;
    c *= 1.4;   // (the pens print ~.75 of their nominal width)
    const n = Math.log2(minW / (c * dS)), a = clamp(r - n + 1) * fd;
    if (a <= 0) return 0;
    const p = eqPress(Math.max(minW, c * dS * 2 ** Math.max(0, Math.ceil(n))));
    return a < 1 ? lerp(.42, p, a) : p;
  };
  for (let j = 1; j < 2 * N; j++) {
    const fd = j % 2 ? f : 1; if (fd < .03) continue;
    const v = j / (2 * N), r = j % 2 ? 0 : eqRank(j), P = [];
    for (let i = 0; i < M; i++) {
      const a = A[i], b = B[i], ml = Math.hypot(a[0] - b[0], a[1] - b[1]), t = tone(i, v);
      P.push([lerp(a[0], b[0], v), lerp(a[1], b[1], v), pressAt(t, eqCov(t), ml * px / (2 * N) + 1e-6, r, fd)]);
    }
    eqRuns(P, w0, o.col, o.clip);
  }
  // cross-hatching in the darks: lines across the strip, slanted
  if (o.cross === false) return;
  let len = 0; for (let i = 1; i < M; i++) len += Math.hypot((A[i][0] + B[i][0] - A[i - 1][0] - B[i - 1][0]) / 2, (A[i][1] + B[i][1] - A[i - 1][1] - B[i - 1][1]) / 2);
  const c0 = 2, cl = Math.max(0, Math.log2(len * px / (c0 * d * 1.2))), ck = Math.floor(cl), cf = cl - ck, CN = c0 * 2 ** ck, skew = (o.skew ?? Math.min(.6, .7 * wmax / (len || 1))) * (M - 1);   // (crossing the lines at ~55°)
  const thr = o.crossAt ?? .68, dC = len * px / (2 * CN);
  for (let j = 1; j < 2 * CN; j++) {
    const fd = j % 2 ? cf : 1; if (fd < .03) continue;
    const u0 = j / (2 * CN) * (M - 1) - skew * .5, r = j % 2 ? 0 : eqRank(j), P = [];
    for (let q = 0; q <= 12; q++) {
      const v = q / 12, s = u0 + skew * v; if (s < 0 || s > M - 1) { P.push([0, 0, 0]); continue; }
      const i = Math.round(s), a = eqAt(A, s), b = eqAt(B, s), t = tone(i, v);
      P.push([lerp(a[0], b[0], v), lerp(a[1], b[1], v), t > thr ? pressAt(t, eqCov(t) * .8 * Math.min(1, (t - thr) / (1 - thr) * 1.6), dC, r, fd) : 0]);
    }
    eqRuns(P, w0, o.col, o.clip);
  }
}
// An outline: swelling on the side away from the light (an engraver's contour line). closed: P wraps. w: screen px
// (at pressure 1). o.c: the piece's centre (to face an open edge's normals outward); o.p0 / o.p1: the pressure on the
// lit side / the swell on the shadowed side.
function eqOutline(P, w, col, px, closed = true, o = {}) {
  if (P.length < 2) return;
  { const mx = 22 / px, D = []; const E = closed ? P.concat([P[0]]) : P;   // (subdivided: the spline rounds long spans)
    for (let i = 0; i < E.length - 1; i++) { const a = E[i], b = E[i + 1], k = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / mx)); for (let j = 0; j < k; j++) D.push([lerp(a[0], b[0], j / k), lerp(a[1], b[1], j / k)]); }
    if (!closed) D.push(E[E.length - 1]); P = D; }
  const n = P.length;
  const C = closed ? P.concat([P[0], P[1]]) : P, Q = [];
  // orientation (for the outward normals): the signed area
  let ar = 0; for (let i = 0; i < n; i++) { const a = P[i], b = P[(i + 1) % n]; ar += a[0] * b[1] - b[0] * a[1]; }
  const sg = ar > 0 ? 1 : -1;
  for (let i = 0; i < C.length - (closed ? 1 : 0); i++) {
    const a = C[Math.max(0, i - 1)], b = C[Math.min(C.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], dl = Math.hypot(dx, dy) || 1;
    let nx = dy / dl * sg, ny = -dx / dl * sg;
    if (o.c) { const f = (nx * (C[i][0] - o.c[0]) + ny * (C[i][1] - o.c[1])) < 0 ? -1 : 1; nx *= f; ny *= f; }   // (open edges: outward from the piece's centre)
    const away = Math.max(0, -(nx * EQ.L2[0] + ny * EQ.L2[1]));
    Q.push([C[i][0], C[i][1], (o.p0 ?? .92) + (o.p1 ?? .55) * away]);
  }
  const wl = Math.max(w, eqMinW() / .77) / px;
  for (let j = 0; j < Q.length - 1; j += 17) engStroke(Q.slice(j, j + 18), wl, col, 'rotring');
}
const eqPaper = P => _paint(P, { wash: BANK.paper, washOp: 255, ink: null });

// ======================================================================================================================
// the gallop
// ======================================================================================================================
// joint angles (degrees from straight down, + = forward) for [forearm | gaskin, cannon, pastern] through one stride
// (phase 0 = the flying extension; then the forelegs land and drive, fold; the hind legs swing under, land, push off)
const EQ_FORE = [[0, [64, 74, 96]], [.14, [34, 26, 50]], [.26, [4, 0, 42]], [.38, [-26, -30, 8]], [.49, [-28, -72, -100]], [.62, [8, -118, -150]], [.76, [46, -46, -84]], [.88, [66, 34, 36]]];
const EQ_HIND = [[0, [-58, -76, -92]], [.13, [-40, -24, -10]], [.27, [6, 36, 52]], [.40, [30, 20, 44]], [.52, [16, 2, 40]], [.63, [-12, -18, 16]], [.75, [-38, -50, -34]], [.87, [-54, -70, -78]]];
// the flying gait (the lead flat out: a cartoon bound that never touches down): the Victorian extension, held, and a
// jumper's tuck (the forelegs folded under the chest, the hind legs under the belly), the legs pumping between them
const EQ_FORE_FLY = [[0, [66, 76, 98]], [.2, [62, 14, -24]], [.38, [46, -70, -112]], [.52, [38, -100, -134]], [.68, [52, -40, -70]], [.84, [66, 38, 44]]];
const EQ_HIND_FLY = [[0, [-60, -78, -94]], [.18, [-34, -76, -96]], [.36, [12, -58, -84]], [.52, [28, -46, -72]], [.68, [-6, -54, -78]], [.84, [-44, -72, -90]]];
const EQ_LEN = { fore: [2.36, 1.78, .72], hind: [2.3, 2.52, .72], hoof: .44 };
const eqCR = (p0, p1, p2, p3, t) => .5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (3 * p1 - p0 - 3 * p2 + p3) * t * t * t);
function eqKey(K, q) {
  q = frac(q); const n = K.length; let i = n - 1; for (let k = 0; k < n; k++) if (K[k][0] <= q) i = k;
  const g = m => K[(m + n) % n][1], q1 = K[i][0], q2 = i + 1 < n ? K[i + 1][0] : 1, f = (q - q1) / (q2 - q1);
  return g(i).map((_, j) => eqCR(g(i - 1)[j], g(i)[j], g(i + 1)[j], g(i + 2)[j], f));
}
const eqDir = a => { const r = a * Math.PI / 180; return [Math.sin(r), Math.cos(r)]; };   // degrees from down (+ forward)
const eqAdd = (p, d, l) => [p[0] + d[0] * l, p[1] + d[1] * l];
// a smooth bump in phase (circular distance from c, half-width w)
const eqBump = (q, c, w) => { let d = Math.abs(frac(q - c + .5) - .5); return d >= w ? 0 : Math.pow(Math.cos(d / w * Math.PI / 2), 2); };

// The pose (body units, the body frame: origin on the ground under the girth, before the pitch): legs, neck, head.
function engHorsePose(o = {}) {
  const gal = o.ph != null, fly = clamp(o.fly || 0), st = clamp(o.strain || 0);
  // the flying gallop dwells on the extension (phase 0): the Victorian rocking-horse pose, held
  const q0 = gal ? frac(o.ph) : 0, q = gal ? frac(q0 - (.86 * fly / TAU) * Math.sin(TAU * q0)) : 0;
  const amp = .86 + .14 * fly, off = 1 - .75 * fly;
  const fk = ease(seg(fly, .35, 1));   // (the flying gait takes over as it goes flat out)
  const legA = (K, KF, dq) => { const a = eqKey(K, q + dq), b = eqKey(KF, q + dq * .3); return a.map((v, i) => lerp(v * amp, b[i], fk)); };
  let F = { nf: legA(EQ_FORE, EQ_FORE_FLY, 0), ff: legA(EQ_FORE, EQ_FORE_FLY, -.07 * off), nh: legA(EQ_HIND, EQ_HIND_FLY, 0), fh: legA(EQ_HIND, EQ_HIND_FLY, -.06 * off) };
  if (!gal) {
    const pr = clamp(o.prance || 0);
    F = { nf: [lerp(0, 50, pr), lerp(0, -70, pr), lerp(38, -98, pr)], ff: [-3, -2, 38], nh: [-20, 2, 40], fh: [-15, 4, 42] };
  }
  // the fore: the scapula swings under the withers, the humerus from the point of the shoulder to the elbow
  const fore = a => { const pS = eqAdd([2.35, -8.8], eqDir(30 + .28 * a[0]), 2.85), el = eqAdd(pS, eqDir(-32 + .42 * a[0]), 1.9); return { pS, root: el }; };
  const hind = a => { const st2 = eqAdd([-3.35, -7.25], eqDir(34 + .45 * (a[0] + 22)), 2.25); return { root: st2 }; };
  const chain = (root, a, L) => { const P = [root]; let p = root; for (let i = 0; i < 3; i++) { p = eqAdd(p, eqDir(a[i]), L[i]); P.push(p); } return P; };
  const legs = {};
  for (const k of ['nf', 'ff']) { const r = fore(F[k]); legs[k] = { fore: true, a: F[k], pS: r.pS, J: chain(r.root, F[k], EQ_LEN.fore) }; }
  for (const k of ['nh', 'fh']) { const r = hind(F[k]); legs[k] = { fore: false, a: F[k], J: chain(r.root, F[k], EQ_LEN.hind) }; }
  // the body: pitch (nose down on the fore landing, up on the hind drive), a lift in flight, the back rounding when gathered
  const pitch = (o.pitch || 0) + (gal ? .055 * Math.cos(TAU * (q - .26)) * (.6 + .4 * fly) * (1 - .6 * ease(seg(fly, .35, 1))) : 0);
  const flight = gal ? eqBump(q, .96, .24) : 0, gather = gal ? eqBump(q, .47, .16) : 0;
  // the lowest hoof (after the pitch) stands on the ground, except in flight (the body rises clear)
  const low = Math.max(...['nf', 'ff', 'nh', 'fh'].map(k => { const c = legs[k].J[3], d = eqDir(legs[k].a[2]), hx = c[0] + d[0] * EQ_LEN.hoof, hy = c[1] + d[1] * EQ_LEN.hoof; return hx * Math.sin(pitch) + hy * Math.cos(pitch); }));
  const lift = gal ? lerp(lerp(low, .3 + .8 * fly, flight), 1.15 + .35 * Math.cos(TAU * q), fk) : low;   // (flying: always clear of the ground, highest at the stretch)
  // the neck (angle above the horizontal) and the head (the face line's angle below it)
  const swing = gal ? 7 * Math.cos(TAU * (q - .26)) : 0, toss = gal ? 0 : 7 * clamp(o.prance || 0) * Math.sin((o.t || 0) * 9);
  const neckA = lerp(gal ? 34 : 52, 16, st) + swing * (1 - .5 * st) + toss, headB = lerp(gal ? 40 : 58, 19, st) - swing * .6 - toss * .8;
  return { gal, q, fly, st, legs, pitch, lift, flight, gather, neckA, headB, ph: o.ph || 0 };
}

// ======================================================================================================================
// the horse
// ======================================================================================================================
const SPx = (P, s) => P.map(p => [p[0] * s, p[1] * s]);
const eqUnit = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; };
function engHorse(x, y, s, o = {}) {
  const P0 = engHorsePose(o), coat = EQ.COATS[o.coat || 'steel'], key = 'eq' + (o.key || ''), far = clamp(o.far || 0), det = o.detail ?? 1;
  const ink = mixCol(mixCol(BANK.ink, coat.col, coat.k), BANK.paper, .28 * far), inkFar = mixCol(ink, '#0C0E12', .18);
  const wind = o.wind ?? (P0.gal ? .55 + .45 * P0.fly : 0);
  const M0 = btMat();
  push(); translate(x, y - P0.lift * s); rotate(P0.pitch);
  const px = bankPx(), S = p => [p[0] * s, p[1] * s], SP = P => P.map(S), wOut = 1.3;
  const { legs } = P0;
  const G = { s, px, ink, inkFar, coat, key, far, det, wind, P0, wOut };
  // one engraved piece: paper, the lines along it (A to B), then its edges: [points, weight ×] (default: the whole outline)
  const part = (A, B, oo = {}) => {
    const poly = SP(A.concat(B.slice().reverse())), c = centroid(poly);
    boilSeed(key + (oo.id || ''));
    eqPaper(poly);
    engStrip(SP(A), SP(B), { px, col: oo.col || ink, dark: clamp(coat.dark + (oo.dark || 0)), ...oo });
    for (const [E, k] of oo.edges || [[null, 1]]) { if (k <= 0) continue; if (E) eqOutline(SP(E), wOut * k, oo.col || ink, px, false, { c }); else eqOutline(poly, wOut * k, oo.col || ink, px, true); }
    return poly;
  };

  // ---- the body's landmarks (body units) ----
  const arch = .3 * P0.gather, nf = legs.nf, nh = legs.nh, pS = nf.pS, stifle = nh.J[0];
  const W = [1.95, -9.12 - arch * .3];
  const top = [[3.4, -8.4], [2.65, -8.98], W, [.9, -8.64 - arch * .6], [-.4, -8.54 - arch], [-1.6, -8.6 - arch * .8], [-2.6, -8.82 - arch * .4], [-3.45, -8.98], [-4.4, -8.8], [-5.02, -8.4]];
  const under = [[pS[0] - .1, pS[1] + .2], [4.0, -5.62], [3.25, -4.86], [2.3, -4.6], [1.0, -4.56], [-.3, -4.7], [-1.4, -5.08], [-2.15, -5.6], [-3.3, -5.5], [-4.6, -5.6], [-5.25, -6.6], [-5.38, -7.6]];

  // ---- far legs, behind everything ----
  eqLeg(G, legs.fh, true, 'fh'); eqLeg(G, legs.ff, true, 'ff');
  const neck = eqNeck(P0, W, pS);
  // ---- the barrel (its top and belly are the silhouette; the front and back tuck under the neck and the quarter) ----
  part(top, under, { id: 'body', edges: [[top.slice(1, 8), 1], [under.slice(2, 8), 1]], bias: (u, v) => .1 * eqBump(u, .1, .12) + .12 * Math.max(0, v - .6) * (1 - u) });
  if (det > .3) {   // panel seams: behind the girth; over the loin down to the flank; the maker's plate below the cloth
    boilSeed(key + 'seams');
    eqSeam(G, [[1.2, -8.66], [.98, -7.1], [1.25, -5.4], [1.55, -4.62]]);
    eqSeam(G, [[-1.95, -8.68], [-1.7, -7.3], [-1.62, -5.2]]);
    eqPlate(G, [-.35, -6.05], 1.15, .5);
  }
  // ---- the tail (behind the quarter) ----
  eqTail(G, top[top.length - 1]);
  // ---- near legs ----
  eqLeg(G, nh, false, 'nh');
  eqLeg(G, nf, false, 'nf');
  // ---- the quarter's plate (it covers the gaskin's top and the tail's root): its back is the silhouette ----
  const gk = nh.J, gd = eqUnit(gk[0], gk[1]), gn = [gd[1], -gd[0]];
  const gBack = eqAdd(eqAdd(gk[0], gd, .75), gn, -.95), gFront = eqAdd(eqAdd(gk[0], gd, .5), gn, .36);
  const hipP = [-2.7, -8.5];
  const qA = [hipP, [-3.5, -8.96], [-4.4, -8.8], [-5.02, -8.4], [-5.36, -7.62], [-5.32, -6.7], [-5.02, -5.85], gBack];
  const qB = [hipP, [-2.42, -7.55], [-2.2, -6.55], [stifle[0] + .1, stifle[1] - .25], gFront];
  part(qA, qB, { id: 'quarter', flat: .3, bias: (u, v) => -.1 * Math.max(0, v - .55) - .03, edges: [[qA.slice(1), 1], [qB.slice(0, 4), .42]] });
  if (det > .3) { boilSeed(key + 'qseam'); eqSeam(G, qA.slice(1, 7).map(p => [p[0] + .2, p[1] + .16]), .45); }
  // ---- the neck ----
  part(neck.crest, neck.throat, { id: 'neck', bias: (u, v) => .05 * v, edges: [[neck.crest.slice(1), 1], [neck.throat.slice(1), 1]] });
  if (det > .3) eqRivets(G, neck);
  // ---- the shoulder's plate (it covers the forearm's top and the neck's base): its lower front is the chest ----
  const fl = nf.J, fd = eqUnit(fl[0], fl[1]), fn = [fd[1], -fd[0]];
  const fBack = eqAdd(eqAdd(fl[0], fd, .38), fn, -.56), fFront = eqAdd(eqAdd(fl[0], fd, .55), fn, .52);
  const sA = [[2.05, -9.0], [1.62, -7.75], [1.8, -6.35], [2.2, -5.45], fBack];
  const sB = [[2.75, -8.96], [3.42, -8.28], [pS[0] - .22, pS[1] - .72], [pS[0] + .1, pS[1]], [pS[0] + .02, pS[1] + .72], fFront];
  part(sA, sB, { id: 'shoulder', bias: (u, v) => .04 * (1 - v), edges: [[sA, .42], [sB.slice(0, 3), .42], [sB.slice(2), 1]] });
  if (det > .3) { boilSeed(key + 'sseam'); eqSeam(G, sA.slice(0, 4).map(p => [p[0] + .2, p[1]]), .45); eqGear(G, [pS[0] - .42, pS[1] + .02], .52, P0); }
  // ---- the head, then the mane over the crest ----
  const H = eqHead(G, neck, o);
  if (det > .2) eqMane(G, neck);
  // ---- tack ----
  let seat = [.45, -9.2 - arch];
  if (o.tack !== false) seat = eqTack(G, H, o, arch);
  const out = { saddle: btTo(M0, S(seat)), bit: btTo(M0, S(H.bit)), head: btTo(M0, S(H.eye)), withers: btTo(M0, S(W)), dock: btTo(M0, S(top[top.length - 1])), poll: btTo(M0, S(neck.poll)),
    hooves: ['nf', 'ff', 'nh', 'fh'].map(k => btTo(M0, S(legs[k].J[3]))), lift: P0.lift * s, mouth: btTo(M0, S(H.mouth)) };
  pop();
  return out;
}

// the neck's edges (body units): the crest from the withers to the poll (arched), the throat from the chest to the
// throatlatch; and the head's frame (poll, face direction)
function eqNeck(P0, W, pS) {
  const base = [3.1, -8.05], a = P0.neckA * Math.PI / 180, Ln = 4.6, poll = [base[0] + Math.cos(a) * Ln, base[1] - Math.sin(a) * Ln];
  const b = P0.headB * Math.PI / 180, ex = [Math.cos(b), Math.sin(b)], ey = [-ex[1], ex[0]];
  const HP = ([u, v]) => [poll[0] + ex[0] * u + ey[0] * v, poll[1] + ex[1] * u + ey[1] * v];
  const dx = poll[0] - W[0], dy = poll[1] - W[1], dl = Math.hypot(dx, dy), nx = dy / dl, ny = -dx / dl;
  const up = ny < 0 ? 1 : -1, cr = (t, h) => [W[0] + dx * t + nx * h * up, W[1] + dy * t + ny * h * up];
  const crest = [[W[0] - .25, W[1] + .1], W, cr(.28, .5), cr(.6, .58), cr(.86, .36), HP([-.02, .04])];
  const thr = HP([.42, 1.32]), c0 = [pS[0] + .08, pS[1] - .62];
  const throat = [[c0[0] - .55, c0[1] - .35], c0, [lerp(c0[0], thr[0], .42) + .08, lerp(c0[1], thr[1], .42) + .2], [lerp(c0[0], thr[0], .78), lerp(c0[1], thr[1], .78) + .1], thr];
  return { crest, throat, poll, HP, ex, ey };
}

// a panel seam: a fine double line
function eqSeam(G, P, k = 1) {
  const { s, px, ink } = G, Q = through(P.map(p => [p[0] * s, p[1] * s]), 6);
  const w = Math.max(.55 * k / px, (BANK.wmin ?? .7) / px / bankKW());
  for (const off of [0, 2.4 / px]) engStroke(Q.map((p, i) => [p[0] + off * .7, p[1] + off * .7, (Math.sin(Math.PI * clamp((i + .5) / Q.length)) < .22 ? .5 : off ? .9 : 1.02)]), w, ink);
}
// a rivet line along the neck, under the mane's roots: small domed heads
function eqRivets(G, neck) {
  const { s, px, ink, key } = G, C = eqResample(neck.crest.slice(1), 26);
  boilSeed(key + 'rivets');
  for (let i = 3; i < 23; i += 2) {
    const a = C[i], b = C[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], dl = Math.hypot(dx, dy) || 1, sg = dx > 0 ? 1 : -1, p = [a[0] - dy / dl * .55 * sg, a[1] + dx / dl * .55 * sg];
    const c = [p[0] * s, p[1] * s], r = .07 * s;
    if (r * px < 1) continue;
    _paint(oval(c[0], c[1], r, r, 0, 10), { wash: mixCol(ink, BANK.paper, .15), ink: null });   // a domed head: dark, a glint of paper
    _paint(oval(c[0] - r * .32, c[1] - r * .34, r * .34, r * .34, 0, 8), { wash: BANK.paper, ink: null });
  }
}
// a small maker's plate: a rounded tablet with a double rule, a guilloche band where the name would be (no lettering),
// a screw at each end
function eqPlate(G, c0, w, h) {
  const { s, px, ink, key } = G, c = [c0[0] * s, c0[1] * s], hw = w * s / 2, hh = h * s / 2, r = hh * .45, rot = .04;
  if (hh * px < 4) return;
  boilSeed(key + 'plate');
  const rr = (a, b, rad) => { const P = []; for (const [cx, cy, a0] of [[a - rad, -b + rad, -Math.PI / 2], [a - rad, b - rad, 0], [-a + rad, b - rad, Math.PI / 2], [-a + rad, -b + rad, Math.PI]]) for (let i = 0; i <= 4; i++) { const t = a0 + i / 4 * Math.PI / 2; P.push([cx + Math.cos(t) * rad, cy + Math.sin(t) * rad]); } return P; };
  push(); translate(c[0], c[1]); rotate(rot);
  const O = rr(hw, hh, r), I = rr(hw * .86, hh * .66, r * .7);
  eqPaper(O); eqOutline(O, 1.0, ink, px); eqOutline(I, .5, ink, px);
  // the guilloche band between the screws
  const bw = hw * .62, K = bankK(), n = Math.round(4 * K);
  for (let i = 0; i < n; i++) { const ph = i / n * TAU, P = []; for (let k = 0; k <= 30; k++) { const xx = lerp(-bw, bw, k / 30); P.push([xx, Math.sin(xx / (bw * .16) + ph) * hh * .38, .95]); } engStroke(P, Math.max(.35 / px, (BANK.wmin ?? .7) / px / bankKW()), ink); }
  for (const sx of [-1, 1]) { const q = [sx * hw * .78, 0], sr = hh * .26; eqPaper(oval(q[0], q[1], sr, sr, 0, 10)); eqOutline(oval(q[0], q[1], sr, sr, 0, 12), .6, ink, px); engStroke([[q[0] - sr * .7, q[1] + sr * .3, 1], [q[0] + sr * .7, q[1] - sr * .3, 1]], .55 / px, ink); }
  pop();
}
// a gear in a round window at the point of the shoulder, turning with the stride, and a pinion meshing with it
function eqGear(G, c0, r, P0) {
  const { s, px, ink, key } = G, c = [c0[0] * s, c0[1] * s], R = r * s;
  if (R * px < 7) return;
  boilSeed(key + 'gear');
  const win = oval(c[0], c[1], R, R, 0, 40);
  eqPaper(win);
  engStrip([[c[0] - R, c[1] - R], [c[0] + R, c[1] - R]], [[c[0] - R, c[1] + R], [c[0] + R, c[1] + R]], { px, col: ink, dark: .72, flat: 1, cross: false, M: 10, clip: win });   // the dark inside
  const turn = (P0.gal ? P0.q : 0) * TAU * 1.5 + (P0.ph || 0) * TAU;
  const gear = (gc, gr, n, a0) => { const g = []; for (let i = 0; i < n * 4; i++) { const a = a0 + i / (n * 4) * TAU, tooth = [1, 1, .8, .8][i % 4]; g.push([gc[0] + Math.cos(a) * gr * tooth, gc[1] + Math.sin(a) * gr * tooth]); } return g; };
  const g1 = gear(c, R * .8, 12, turn), pc = [c[0] + R * .62, c[1] + R * .5], g2 = gear(pc, R * .36, 7, -turn * 12 / 7 + .2);
  for (const [g, gc, gr, n, a0] of [[g2, pc, R * .36, 5, -turn * 12 / 7], [g1, c, R * .8, 5, turn]]) {
    const cl = g.filter(p => Math.hypot(p[0] - c[0], p[1] - c[1]) < R * .98);
    if (cl.length < 3) continue;
    eqPaper(g); eqOutline(g, .7, ink, px);
    eqOutline(oval(gc[0], gc[1], gr * .62, gr * .62, 0, 22), .5, ink, px);
    for (let i = 0; i < n; i++) { const a = a0 + i / n * TAU; engStroke([[gc[0] + Math.cos(a) * gr * .2, gc[1] + Math.sin(a) * gr * .2, 1], [gc[0] + Math.cos(a) * gr * .6, gc[1] + Math.sin(a) * gr * .6, .92]], .7 / px, ink); }
    eqOutline(oval(gc[0], gc[1], gr * .18, gr * .18, 0, 10), .7, ink, px);
  }
  // cover what the pinion pokes outside the window: a paper ring round it, then the window's rim and a fine bezel
  const ring = oval(c[0], c[1], R * 1.06, R * 1.06, 0, 40).concat(oval(c[0], c[1], R * 1.5, R * 1.5, 0, 40).reverse());
  void ring;
  eqOutline(win, 1.15, ink, px);
  eqOutline(oval(c[0], c[1], R * 1.13, R * 1.13, 0, 40), .45, ink, px);
}

// A tube along centreline C (body units; smoothed): keys [[t, front, back], ...] give its half-widths along it (t by arc
// length; the front is the side a hanging leg shows forward); o.capEnd rounds the far end (o.hock: with the point of
// the hock behind). Returns { F, B, poly } (body units).
function eqTube(C, keys, o = {}) {
  const P = through(C, 8), n = P.length, d = [0];
  for (let i = 1; i < n; i++) d.push(d[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const L = d[n - 1] || 1, F = [], B = [];
  const wAt = t => { let i = 0; while (i < keys.length - 2 && keys[i + 1][0] < t) i++; const a = keys[i], b = keys[i + 1], k = ease(clamp((t - a[0]) / ((b[0] - a[0]) || 1))); return [lerp(a[1], b[1], k), lerp(a[2], b[2], k)]; };
  for (let i = 0; i < n; i++) {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)], u = eqUnit(a, b), nF = [u[1], -u[0]], [wf, wb] = wAt(d[i] / L);
    F.push(eqAdd(P[i], nF, wf)); B.push(eqAdd(P[i], nF, -wb));
  }
  const cap = [];
  if (o.capEnd !== false) {
    const e = P[n - 1], u = eqUnit(P[n - 2], e), nF = [u[1], -u[0]], [wf, wb] = wAt(1), cc = eqAdd(e, nF, (wf - wb) / 2), r = (wf + wb) / 2;
    for (let j = 1; j < 8; j++) { const th = j / 8 * Math.PI; let p = eqAdd(eqAdd(cc, nF, Math.cos(th) * r), u, Math.sin(th) * r * (o.capK ?? .75)); if (o.hock && th > Math.PI * .55) p = eqAdd(eqAdd(p, nF, -.16 * Math.sin((th - Math.PI * .55) / .45 * Math.PI)), u, -.08); cap.push(p); }
  }
  return { F, B, poly: F.concat(cap, B.slice().reverse()), C: P };
}
// one leg: the lower piece (cannon, fetlock, pastern) with its hoof, then the upper (forearm | gaskin) over its top;
// a pivot pin at the knee | hock and a seam round the cannon (the synthetic horse's joints, engraved fine)
function eqLeg(G, L, isFar, k) {
  const { s, px, key, det, wOut } = G, J = L.J, fore = L.fore, col = isFar ? G.inkFar : G.ink, dk = isFar ? .28 : 0, dark = clamp(G.coat.dark + dk), id = key + k;
  const SP = P => P.map(p => [p[0] * s, p[1] * s]), ow = wOut * (isFar ? .85 : 1);
  const u1 = eqUnit(J[0], J[1]), u2 = eqUnit(J[1], J[2]);
  // the lower piece
  const lowKeys = fore ? [[0, .26, .3], [.1, .2, .25], [.45, .185, .235], [.62, .21, .27], [.7, .25, .35], [.78, .21, .26], [.9, .185, .2], [1, .24, .24]]
                       : [[0, .27, .34], [.1, .21, .29], [.5, .19, .25], [.7, .21, .28], [.77, .25, .36], [.85, .21, .26], [.93, .185, .2], [1, .24, .24]];
  const lo = eqTube([eqAdd(J[1], u2, -.2), J[1], J[2], J[3]], lowKeys, { capEnd: false });
  boilSeed(id + 'lo');
  const lp = SP(lo.poly); eqPaper(lp);
  engStrip(SP(lo.B), SP(lo.F), { px, col, dark, bias: (u, v) => .05 * v, M: 22, crossAt: isFar ? .56 : .7 });
  eqOutline(lp, ow, col, px);
  // the hoof: steel, on the pastern's line (the sole flat when the pastern stands at ~40°), a shoe along the sole
  const c = J[3], hd = eqDir(L.a[2]), hn = [hd[1], -hd[0]];
  const at = (al, fr) => [c[0] + hd[0] * al + hn[0] * fr, c[1] + hd[1] * al + hn[1] * fr];
  const hoof = [at(-.06, -.26), at(-.07, .25), at(.5, .38), at(.55, .3), at(.16, -.33)];
  boilSeed(id + 'hoof');
  const hp = SP(curvy(hoof, 3)); eqPaper(hp);
  engStrip(SP([at(-.05, -.24), at(.16, -.32)]), SP([at(-.05, .24), at(.5, .36)]), { px, col, dark: clamp(dark + .25), skew: .3, M: 8 });
  eqOutline(hp, ow * .95, col, px);
  engStroke(SP([at(.17, -.36), at(.38, .0), at(.57, .33)]).map(p => [p[0], p[1], 1]), Math.max(1.4 / px, .06 * s), col, 'rotring');   // the shoe
  // the coronet band (a fine double line where the hoof meets the pastern)
  if (det > .5) engStroke(SP([at(.02, -.25), at(.0, .0), at(.02, .25)]).map(p => [p[0], p[1], .95]), .5 / px, col);
  // the upper piece: the forearm (a broad muscle tapering to a flat knee) | the gaskin (broad behind, to the hock's point)
  const upKeys = fore ? [[0, .52, .56], [.3, .5, .52], [.66, .34, .31], [.86, .29, .27], [1, .3, .29]]
                      : [[0, .4, .95], [.25, .38, .88], [.55, .3, .52], [.84, .25, .31], [1, .27, .33]];
  const up = eqTube([eqAdd(J[0], u1, fore ? -.6 : -.75), J[0], J[1], eqAdd(J[1], u1, .06)], upKeys, { hock: !fore, capK: fore ? .7 : .8 });
  boilSeed(id + 'up');
  const upp = SP(up.poly); eqPaper(upp);
  engStrip(SP(up.B), SP(up.F), { px, col, dark, bias: (u, v) => .04 * v, M: 20, crossAt: isFar ? .56 : .7 });
  eqOutline(SP(up.F.slice(3).concat(up.poly.slice(up.F.length, up.F.length + 7), up.B.slice(3).reverse())), ow, col, px, false, { c: centroid(upp) });
  // the pivot pin at the knee | hock, and a seam round the top of the cannon
  if (det > .3 && !isFar) {
    const q = eqAdd(J[1], u1, -.05), R = .1 * s;
    if (R * px > 2.5) {
      boilSeed(id + 'pin');
      eqPaper(oval(q[0] * s, q[1] * s, R, R, 0, 16));
      eqOutline(oval(q[0] * s, q[1] * s, R, R, 0, 18), .75, col, px, true, { p0: .9, p1: .6 });
      eqOutline(oval(q[0] * s, q[1] * s, R * .38, R * .38, 0, 10), .55, col, px);
    }
  }
}

// the head: its outline in head units (u along the face line from the poll, v across toward the jaw), the ears, the eye
// (a lens with an iris of aperture blades), the nostril, the mouth (open when bolting), the jowl
function eqHead(G, neck, o) {
  const { s, px, ink, key, coat, det, wOut } = G, HP = neck.HP, st = G.P0.st, jaw = .14 * st + (o.jaw || 0);
  const J = ([u, v]) => [u, v + (u > 2.2 && v > 1.3 ? jaw * (u - 2.2) / 1.5 : 0)];
  const pts = P => P.map(p => HP(J(p)));
  const SP = P => P.map(p => [p[0] * s, p[1] * s]);
  const ear = (side, ang) => {   // side 1: near, -1: far (behind)
    const a = ang * Math.PI / 180, b0 = [.02, .1], b1 = [.5, .0], tipU = [.1 - Math.sin(a) * 1.0, -.08 - Math.cos(a) * 1.0];
    const P = [b0, [lerp(b0[0], tipU[0], .5) - .2, lerp(b0[1], tipU[1], .5)], tipU, [lerp(b1[0], tipU[0], .45) + .14, lerp(b1[1], tipU[1], .45)], b1];
    return P.map(([u, v]) => side < 0 ? [u + .2, v - .05] : [u, v]);
  };
  const earAng = lerp(10, -60, st);   // pinned back when bolting
  boilSeed(key + 'earF');
  const eF = SP(pts(ear(-1, earAng - 8)));
  eqPaper(curvy(eF, 3)); engStrip(eF.slice(0, 3), eF.slice(2).reverse(), { px, col: G.inkFar, dark: clamp(coat.dark + .3), M: 8, cross: false }); eqOutline(curvy(eF, 3), wOut * .8, G.inkFar, px);
  // the head: a fine wedge (a broad forehead, a flat face, a big round jowl, the muzzle tapering)
  const topL = [[-.06, .06], [.38, -.12], [.9, -.15], [1.3, -.06], [2.2, .13], [3.0, .36], [3.5, .58], [3.74, .86]];
  const botL = [[.12, .8], [.42, 1.32], [.8, 1.72], [1.32, 1.9], [1.88, 1.78], [2.45, 1.56], [2.95, 1.56], [3.3, 1.7], [3.52, 1.55], [3.74, 1.12]];
  const tP = pts(topL), bP = pts(botL);
  boilSeed(key + 'head');
  const poly = SP(tP.concat(bP.slice().reverse())), pc = centroid(poly);
  eqPaper(poly);
  engStrip(SP(tP), SP(bP), { px, col: ink, dark: coat.dark, bias: (u, v) => .08 * eqBump(u, .95, .12) - .05 * eqBump(u, .3, .15), M: 26 });
  if (det > .3) {   // the jowl: a round of fine arcs on the cheek
    const jc = HP(J([1.32, 1.2])), th0 = G.P0.headB * Math.PI / 180;
    for (let i = 0; i < 4; i++) { const r = .56 * (.5 + i * .16), A = []; for (let a = -.5; a <= 2.3; a += .2) { const th = a + th0; A.push([(jc[0] + Math.cos(th) * r) * s, (jc[1] + Math.sin(th) * r * .9) * s, .55 + .55 * Math.sin((a + .5) / 2.8 * Math.PI)]); } engStroke(A, Math.max(.45 / px, .012 * s * (1 - i * .15)), ink); }
  }
  eqOutline(SP(tP), wOut, ink, px, false, { c: pc }); eqOutline(SP(bP), wOut, ink, px, false, { c: pc });
  eqOutline(SP([tP[tP.length - 1], bP[bP.length - 1]]), wOut, ink, px, false, { c: pc });
  eqOutline(SP([bP[0], [lerp(bP[0][0], tP[0][0], .5), lerp(bP[0][1], tP[0][1], .5)], tP[0]]), wOut * .45, ink, px, false, { c: pc });   // the jaw's seam onto the neck
  boilSeed(key + 'earN');
  const eN = SP(pts(ear(1, earAng)));
  eqPaper(curvy(eN, 3)); engStrip(eN.slice(0, 3), eN.slice(2).reverse(), { px, col: ink, dark: clamp(coat.dark + .05), M: 8, cross: false }); eqOutline(curvy(eN, 3), wOut * .85, ink, px);
  // the eye: a lens in an almond lid, under the brow; its iris is aperture blades (closing down when it bolts)
  const eye = HP([1.12, .47]), er = .23 * s, ec = [eye[0] * s, eye[1] * s], hb = G.P0.headB * Math.PI / 180;
  boilSeed(key + 'eye');
  eqPaper(oval(ec[0], ec[1], er * 1.2, er * .95, hb, 20));
  const R = er * .8, ap = lerp(.55, .28, st);
  if (R * px > 3) {
    for (let i = 0; i < 6; i++) { const a0 = i / 6 * TAU + .3, a1 = a0 + TAU / 6; engStroke([[ec[0] + Math.cos(a0) * R * ap, ec[1] + Math.sin(a0) * R * ap, .9], [ec[0] + Math.cos(a0 + .45) * R * .98, ec[1] + Math.sin(a0 + .45) * R * .98, 1.05], [ec[0] + Math.cos(a1 + .1) * R * .98, ec[1] + Math.sin(a1 + .1) * R * .98, .88]], Math.max(.4 / px, .012 * s), ink); }
    _paint(oval(ec[0], ec[1], R * ap, R * ap, 0, 14), { wash: mixCol(ink, '#000000', .25), ink: null });
    _paint(oval(ec[0] - R * .36, ec[1] - R * .38, R * .15, R * .15, 0, 8), { wash: BANK.paper, ink: null });   // the glint
  } else _paint(oval(ec[0], ec[1], R * .6, R * .6, 0, 10), { wash: ink, ink: null });
  eqOutline(oval(ec[0], ec[1], R, R, 0, 22), .95, ink, px, true, { p0: .92, p1: .6 });
  engStroke(SP(pts([[.7, .3], [1.1, .1], [1.52, .25]])).map((p, i) => [p[0], p[1], [.6, 1.4, .7][i]]), Math.max(.6 / px, .03 * s), ink);   // the brow
  // the nostril (flared when bolting) and the mouth
  const nfl = 1 + .7 * st;
  engStroke(SP(pts([[3.18, .8 - .06 * nfl], [3.42, .72 - .08 * nfl], [3.56, .88], [3.42, 1.0 + .04 * nfl], [3.22, .97]])).map((p, i) => [p[0], p[1], [.6, 1.1, 1.5, 1.1, .6][i]]), Math.max(.7 / px, .04 * s), ink);
  engStroke(SP(pts([[2.72, 1.46], [3.1, 1.5], [3.52, 1.5]])).map((p, i) => [p[0], p[1], [.6, 1.1, .8][i]]), Math.max(.6 / px, .026 * s), ink);
  // the forelock: a few locks from the poll over the brow, blown back when galloping
  if (det > .2) {
    boilSeed(key + 'forelock');
    for (let i = 0; i < 3; i++) {
      const r0 = [.22 + i * .13, .06], dirA = lerp(1.1, -2.75, G.wind) + i * .16, Lk = .75 + .15 * i;
      eqLock(G, pts([r0, [r0[0] + Math.cos(dirA) * Lk * .5, r0[1] + Math.sin(dirA) * Lk * .5 + .08], [r0[0] + Math.cos(dirA) * Lk, r0[1] + Math.sin(dirA) * Lk]]), .17, ink);
    }
  }
  return { bit: HP(J([2.95, 1.44])), eye, mouth: HP(J([3.1, 1.52])), HP, J };
}

// a lock of hair (mane, tail, forelock): a tapering ribbon of fine strands along P (body units), w wide at the root
function eqLock(G, P, w, col, o = {}) {
  const { s, px } = G, C = through(P, 6), n = C.length; if (n < 2) return;
  const taper = o.taper ?? .9;
  const side = k => C.map((p, i) => { const a = C[Math.max(0, i - 1)], b = C[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], dl = Math.hypot(dx, dy) || 1, t = i / (n - 1), ww = w * (1 - Math.pow(t, 1.3) * taper) * (t < .12 ? .75 + 2 * t : 1) / 2 * k; return [(p[0] - dy / dl * ww) * s, (p[1] + dx / dl * ww) * s]; });
  const A = side(1), B = side(-1), poly = A.concat(B.slice().reverse());
  eqPaper(poly);
  const ns = Math.max(2, Math.min(8, Math.round(w * s * px / (EQ.d() * 1.1))));
  const wl = Math.max(.4 / px, (BANK.wmin ?? .7) / px / bankKW());
  for (let j = 1; j < ns; j++) { const v = j / ns, Q = A.map((a, i) => [lerp(a[0], B[i][0], v), lerp(a[1], B[i][1], v), (Math.sin(Math.PI * Math.min(1, (i + .5) / n * 1.08)) < .2 ? .5 : eqP((.15 + .7 * v) * (o.dark ?? 1)))]); engStroke(Q, wl, col); }
  eqOutline(A, .55, col, px, false, { c: centroid(poly), p0: .9, p1: .45 }); eqOutline(B, .6, col, px, false, { c: centroid(poly), p0: .92, p1: .55 });
}
// the mane: one flowing mass along the crest from the poll to the withers, its strands running along it: lying down the
// neck at rest (scalloped into locks), lifting and streaming back past the withers at speed (wisps flicking off it)
function eqMane(G, neck) {
  const { s, px, key, wind, P0, ink } = G, ph = P0.ph || 0, C = eqResample(neck.crest.slice(1), 24).reverse();   // poll → withers
  boilSeed(key + 'mane');
  const n = C.length, up = [], tg = [];
  for (let i = 0; i < n; i++) { const a = C[Math.max(0, i - 1)], b = C[Math.min(n - 1, i + 1)], t = eqUnit(a, b); tg.push(t); let u = [t[1], -t[0]]; if (u[1] > 0) u = [-u[0], -u[1]]; up.push(u); }
  const U = [], D = [];
  for (let i = 0; i < n; i++) {
    const f = i / (n - 1), sc = Math.abs(Math.sin(f * Math.PI * 7.5 + ph * TAU * 2)) * .3 + .7, wv = Math.sin(ph * TAU * 2 - f * 6) * .12 * wind;
    const hu = (.12 + wind * (.22 + .3 * f)) * sc + wv, hd = lerp(.95, .3, wind) * (.75 + .25 * sc) * (1 - .35 * (1 - f) * (1 - wind));
    U.push(eqAdd(eqAdd(C[i], up[i], hu), tg[i], .1 * wind * f)); D.push(eqAdd(eqAdd(C[i], up[i], -hd), tg[i], wind * .35 * f));
  }
  // at speed the mass streams on past the withers in a plume that narrows to wisps
  const tail = wind * 1.9, te = tg[n - 1], ue = up[n - 1];
  for (let k = 1; k <= 5 && tail > .05; k++) {
    const f = k / 5, w = Math.sin(ph * TAU * 2 - 6 - f * 3) * .25 * f, c = eqAdd(eqAdd(C[n - 1], te, tail * f), ue, w + .15 * f);
    const hh = lerp(.5, .06, f) * (U.length ? 1 : 0);
    U.push(eqAdd(c, ue, hh * .5)); D.push(eqAdd(c, ue, -hh * .5));
  }
  const poly = SPx(U.concat(D.slice().reverse()), s);
  eqPaper(poly);
  engStrip(SPx(U, s), SPx(D, s), { px, col: ink, dark: clamp(G.coat.dark + .12), bias: (u, v) => .1 * v, M: 30, dk: .85 });
  eqOutline(SPx(U, s), .7, ink, px, false, { c: centroid(poly), p0: .92, p1: .4 });
  eqOutline(SPx(D, s), .8, ink, px, false, { c: centroid(poly), p0: .95, p1: .5 });
  // locks parting the mass (at rest) and wisps flicking off its top edge (at speed)
  for (let k = 1; k < 7; k++) {
    const i = Math.round(k / 7 * (n - 1)), a = U[i], b = D[i], d = eqUnit(a, b), c0 = eqAdd(a, d, .05), L = Math.hypot(b[0] - a[0], b[1] - a[1]) * .85;
    if (wind < .6) engStroke(SPx([c0, eqAdd(eqAdd(c0, d, L * .5), tg[i], -.1), eqAdd(eqAdd(c0, d, L), tg[i], .05)], s).map((p, j) => [p[0], p[1], [.6, 1.05, .6][j]]), Math.max(.5 / px, eqMinW() / .77 / px), ink);
    if (wind > .3) { const w0 = U[i], ww = Math.sin(ph * TAU * 3 + k * 1.7) * .25, P = [0, .5, 1].map(f => eqAdd(eqAdd(w0, tg[i], (.4 + .5 * hash(k)) * f * wind * 1.6), up[i], (.15 + ww) * f + .1 * f * f)); engStroke(SPx(P, s).map((p, j) => [p[0], p[1], [.9, 1.05, .5][j]]), Math.max(.5 / px, eqMinW() / .77 / px), ink); }
  }
}
// the tail: a full cascade of locks from the dock: hanging at rest, streaming out behind at speed, a wave running along it
function eqTail(G, dock) {
  const { key, wind, P0 } = G, ph = P0.ph || 0;
  boilSeed(key + 'tail');
  const n = 13;
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1), h = hash(i * 5.3 + 2), ang = lerp(lerp(1.6, 2.15, k), lerp(2.95, 3.3, k), wind) + (h - .5) * .12, Lk = (3.6 + .8 * h) * (1 + .3 * wind);
    const D = [Math.cos(ang), Math.sin(ang)], Nn = [-D[1], D[0]];
    const wv = f => ((Math.sin(ph * TAU * 2 - f * 5 - i * .5) * .5 + .12 * Math.sin(ph * TAU * 5 + i - f * 3)) * (.25 + .75 * wind) + (1 - wind) * .3 * Math.sin(f * 4.5 + h * 6)) * f;
    const r = [dock[0] + .08 - .06 * i, dock[1] + .02 + .07 * i];
    const P = [0, .25, .5, .75, 1].map(f => [r[0] + D[0] * Lk * f + Nn[0] * wv(f), r[1] + D[1] * Lk * f + Nn[1] * wv(f) + (1 - wind) * .5 * f * f]);
    eqLock(G, P, .56 + .14 * h, i % 2 ? G.ink : G.inkFar, { taper: .85, dark: .8 + .4 * h });
  }
}
// tack: a racing saddle on a saddle cloth, the girth, a stirrup; the bridle on the head. Returns the seat (body units).
function eqTack(G, H, o, arch) {
  const { s, px, ink, key, wOut } = G, SP = P => P.map(p => [p[0] * s, p[1] * s]);
  boilSeed(key + 'tack');
  const up = p => [p[0], p[1] - arch * (1 - Math.abs(p[0] + .4) / 2)];
  // the saddle cloth: a rounded panel under the saddle, a border rule and a star (no numbers)
  const clothP = [[1.55, -8.95], [1.45, -7.4], [1.2, -7.08], [-.9, -7.08], [-1.15, -7.4], [-1.15, -8.66]].map(up);
  const cp = SP(curvy(clothP, 4)), ccol = o.cloth || '#8A2A30', cc = mixCol(BANK.ink, ccol, .62);
  eqPaper(cp);
  engStrip(SP([[1.5, -8.95], [-1.1, -8.66]].map(up)), SP([[1.35, -7.12], [-1.05, -7.12]].map(up)), { px, col: cc, dark: .38, M: 12, flat: .6, skew: .25 });
  eqOutline(cp, wOut * .8, ink, px);
  eqOutline(SP(curvy(clothP.map(([a, b]) => [a * .84 + .03, lerp(-7.98, b, .8)]), 4)), .5, cc, px);
  // the girth strap round the barrel, behind the elbow, and its buckle
  const gA = [[1.3, -7.1], [1.45, -5.9], [1.72, -4.62]], gB = [[1.72, -7.1], [1.86, -5.9], [2.12, -4.62]];
  const gp = SP(gA.concat(gB.slice().reverse()));
  eqPaper(gp); engStrip(SP(gA), SP(gB), { px, col: ink, dark: .72, M: 10, flat: .7, cross: false }); eqOutline(gp, .8, ink, px);
  const bk = [1.62 * s, -5.95 * s], bw = .2 * s; eqPaper(box4(bk[0] - bw, bk[1] - bw * 1.1, bk[0] + bw, bk[1] + bw * 1.1)); eqOutline(box4(bk[0] - bw, bk[1] - bw * 1.1, bk[0] + bw, bk[1] + bw * 1.1), .8, ink, px);
  // the saddle: a low racing saddle, its pommel at the front
  const sd = [[1.42, -8.98], [1.28, -9.4], [.9, -9.24], [-.3, -9.1], [-.95, -9.3], [-1.08, -8.88], [-.6, -8.62], [.9, -8.64]].map(up);
  const sp = SP(curvy(sd, 4));
  eqPaper(sp); engStrip(SP([[1.28, -9.38], [-.95, -9.28]].map(up)), SP([[1.1, -8.7], [-.7, -8.67]].map(up)), { px, col: ink, dark: .82, M: 12, flat: .3 }); eqOutline(sp, wOut * .85, ink, px);
  // the stirrup: a leather and a steel iron (swinging with the stride, flying back in the wind)
  const sw2 = G.P0.gal ? .25 * Math.sin((G.P0.ph || 0) * TAU) - .55 * G.wind : 0, t0 = up([.3, -8.75]), bot = [t0[0] + Math.sin(sw2 - .12) * 2.0, t0[1] + Math.cos(sw2 - .12) * 2.0];
  engStroke(SP([t0, bot]).map(p => [p[0], p[1], 1]), Math.max(.8 / px, .07 * s), ink);
  const ia = sw2 - .12, iu = [Math.sin(ia), Math.cos(ia)], inn = [iu[1], -iu[0]], ip = (a, b) => eqAdd(eqAdd(bot, iu, a), inn, b);
  eqOutline(SP([ip(-.06, 0), ip(.05, .26), ip(.42, .22), ip(.44, -.22), ip(.05, -.26)]), 1, ink, px);
  // the bridle: a cheek piece from behind the ear down to the bit ring, the browband, the noseband; the bit ring
  const HP = p => H.HP(H.J(p));
  const strap = (P, w) => { const Q = SP(P.map(HP)); engStroke(Q.map(p => [p[0], p[1], 1]), Math.max(.9 / px, w * s), ink); engStroke(Q.map(p => [p[0], p[1], .95]), Math.max(.4 / px, w * .26 * s), BANK.paper); };
  strap([[.36, .16], [.56, .9], [.95, 1.32], [2.1, 1.38], [2.95, 1.44]], .12);
  strap([[.5, -.02], [.62, .42], [.72, .7]], .1);
  strap([[2.55, .4], [2.6, .95], [2.5, 1.55]], .12);
  const br = HP([2.95, 1.44]);
  eqOutline(oval(br[0] * s, br[1] * s, .15 * s, .15 * s, 0, 14), 1, ink, px);
  return up([.42, -9.2]);
}
const box4 = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

// ======================================================================================================================
// model sheets
// ======================================================================================================================
LOOPS.horse = t => {
  look('bank'); _paint(box4(-60, -60, W + 60, H + 60), { wash: BANK.paper, ink: null });
  const g = [[340, 500, 'jet'], [960, 500, 'steel'], [1580, 500, 'brass'], [340, 1020, 'copper'], [960, 1020, 'jet'], [1580, 1020, 'steel']];
  g.forEach(([x, y, coat], i) => {
    dline([[x - 300, y], [x + 300, y]], 1, BANK.ink);
    const ph = i < 4 ? t * 1.2 + i * .25 : null;
    engHorse(x, y - 10, 30, { ph, fly: i === 0 ? 1 : .3, strain: i === 0 ? 1 : 0, coat, key: 'm' + i, prance: i === 4 ? .5 + .5 * Math.sin(t * 5) : 0, t });
  });
};
LOOPS.horse.len = 2;
// the flying gallop close: one horse, big (4K crops of the engraving)
LOOPS.horseRun = t => {
  look('bank'); _paint(box4(-60, -60, W + 60, H + 60), { wash: BANK.paper, ink: null });
  dline([[0, 900], [W, 900]], 1, BANK.ink);
  engHorse(900, 880, 58, { ph: t * .5, fly: 1, strain: 1, coat: new URLSearchParams(location.search).get('coat') || 'jet', key: 'run', cloth: '#2A5A8A' });
};
LOOPS.horseRun.len = 2;

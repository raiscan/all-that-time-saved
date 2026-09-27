// cast/horse2.js: V3a's racehorses, rebuilt (2026-09-25): a real gallop and banknote engraving.
//
// THE HORSE is Eadweard Muybridge's "Sallie Gardner" (The Horse in Motion, 1878; public domain), traced frame by frame
// (cast/horse_frames.js; out/horse2/work/trace.py): an anatomically right thoroughbred and a true gallop, stepped
// through its 11 frames like the zoopraxiscope; frame 12 (the same mare standing, her rider up) is the standing start.
// She's synthetic (the user: "an outer horselike shell, but on the surface be made of lots of moving gears and turning
// parts which can be seen internally"): the traced silhouette is an engraved shell, cut away in three windows (the
// shoulder, the barrel, the quarters) like a Victorian engineering plate or a watch seen through a skeleton case; the
// movement inside turns with the stride (the gears' angles are functions of the gallop's phase).
//
// STYLE GUIDE: how a banknote engraver cuts a horse (from the references in out/horse2/ref/: the ABNCo and BEP horse
// vignettes, the Mongolian tögrög horses, the stock-certificate racers, the engraving close-ups), as rules this file
// implements:
//   1. Line follows form. Every mass is modelled by lines that run along it, parallel to its contour, the way a burin
//      wraps a cylinder: along the neck, along the barrel and the belly, in arcs round the quarters and the shoulder,
//      down the length of each leg, along the face. The references' way (h2Hatch; picked over the level lines of the
//      silhouette's distance field, nesting inside the outline like echo lines): each mass its own family, collars
//      across the neck bowed toward the chest, lines down the shoulder blade, longitude lines round the ribs, arcs round
//      the point of the hip (left in paper); the head, legs and tail keep the lines that run along them. The families
//      meet at the shell's ribs, so their joins read as the panel seams of a made thing.
//   2. The line swells and tapers; it never changes colour. Tone is the width of the line: fat and close to touching in
//      the shadows, thinning to a hair in the half-tones, breaking to bare paper in the lights (never a grey fill).
//   3. Light from the upper left (LIGHT.dir): each line is widest where its surface turns from the light (the belly, the
//      under-side of the neck, the backs of the legs, the far legs) and vanishes where it faces it (the top line, the
//      croup's highlight, the front of the chest and the forearm).
//   4. Cross-hatching only in the deep shadows (under the belly and the neck, between the legs, the far legs), a second
//      set laid across the first at ~40-60°, lighter; never in the half-tones.
//   5. A clean, confident outline: a single swelling contour, heavier on the shadow side, thinner on the lit side,
//      broken only where a highlight meets the paper.
//   6. Hair is drawn as hair: the mane and the tail as bundles of long tapered strokes following the flow (the level
//      lines inside the tail and the mane's locks run along them, as the strands do).
//   7. Distance is set back in ink, not detail: the pack's horses print paler (o.far), each in its own tint of the note's
//      ink (the lead the darkest: jet; then steel, brass, copper).
//   8. The figure sits on a vignette of paper (bankHalo) over a paler ruled ground; the ground's lines are mechanical
//      (ruled, one direction), the figure's are cut by hand (swelling, following form). The two never mix.
//   9. Machinery is engraved the way a mechanical plate is: turned parts (gears, flywheels, bosses) with concentric
//      lathe rings, spokes shaded on the side away from the light, teeth outlined crisply; cylinders and rods shaded
//      with lines along their length, darkest just inside the shadow edge with a thin reflected light at the rim; the
//      cavity behind the movement is dense cross-hatched dark, so the metal reads light against it.
//  10. The cut edge of the shell shows its thickness: a second line inside the window's edge, the sliver between them
//      section-hatched at 45° (the patent drawing's convention for a cut surface).
//  11. The rider is cut in the same line as his horse (the same level lines, tones and swelling outline), one figure
//      with one outline; only his head is the caricature's, in the bank figure's stipple, sitting on the collar like a
//      portrait on a note.
//
//   horse2(x, y, s, o)  draws a horse facing right. (x, y) = the ground under the middle of the torso; s = px per horse unit
//                       (the mare stands ~9 units at the withers, ~12.6 from the buttock to the muzzle). Returns anchors in
//                       caller coordinates: { body: [cx, cy, pitch], f (the traced frame drawn) }.
//     o.ph      gallop phase (strides; the 11 traced drawings are stepped, Muybridge's own frames); null = standing (frame 12)
//     o.coat    'jet' | 'steel' | 'brass' | 'copper' · o.far 0..1 (set back: paler) · o.key · o.tilt (rad: a bolt's lean)
//     o.turn    the movement's turn (strides; default o.ph × o.speed) · o.speed (the movement's spin ×, e.g. bolting)
//     o.gov     0..1 the governor's balls flung out (speed) · o.windows false: a plain engraved horse (no cut-aways)
//     o.tack    false: no bridle
//   h2Ride(x, y, s, o)  a horse and its jockey (horse2's options, plus): o.who 'altman' | 'musk' | 'zuck' | 'silks' (null:
//                       riderless) · o.J: a pose ({ hip, neck, sh, hand, hand2, foot, knee, lean, headA, seated, stirrup,
//                       stirrupA }, in the horse's body frame), or (Fr, b) => pose; default: seated on this frame
//                       (h2SeatPose, o.lean: the crouch) · o.face: the rig's face options · o.headK (head size ×) · o.silk,
//                       o.hoops · o.reins false (draw your own). Returns { body, f, grip, grip2 (his hands, world), bitW
//                       (the bit ring, world), J, xf (his frame: on()/off()/w(p)), Fr, b }.
//   h2Jockey(J, xf, o)  the jockey alone: engraved in the horse's line (silks, breeches, boots, white gloves), each limb a
//                       rigid part and the body one union field (h2Union), so it's a single figure with one outline.
//   h2Head(who, n, ang, hpx, o)  a caricature's head (the rig's own 'head' layer; Zuckerberg's rig clipped above the
//                       neck) at neck point n, turned ang, hpx tall.
//   h2ClipOn(T) / h2ClipOff()  a stencil clip that writes no colour and nests inside p5's clip (a poster, a screen).
// LOOPS: horse2 (the model sheet: the 11 gallop drawings and the standing frame, with a rider), horse2run (one horse,
// big; ?f= the frame), h2jockey / h2heads (test beds). The race's own cast
// sheet is LOOPS.v3raceCast (video/ch/verse3.js). Fields and line sets are cached per traced frame (H2.cache): each
// frame renders from scratch, but the geometry is computed once.

// ======================================================================================================================
// the engraving engine: distance fields and their level lines, cached per shape
// ======================================================================================================================
const H2 = {
  cache: new Map(),
  d0: .02,      // the finest level spacing (units): the densest a horse is ever cut (the poster close-up at 4K)
  band: 1.3,    // how deep the level lines go (units): the shell's modelling band
  cs: .035,     // the field's grid (units)
  COATS: {      // ink (mixed into the note's ink), base tone, the far side's
    jet:    { col: '#10141C', k: .74, base: .44 },
    steel:  { col: '#3A4C62', k: .55, base: .16 },
    brass:  { col: '#6E5220', k: .66, base: .1 },
    copper: { col: '#723420', k: .64, base: .14 },
    silk:   { col: '#1F2A3A', k: .5, base: .12 },
  },
};
const h2Unit = (x, y) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };
// The squared Euclidean distance transform of a mask (in cells): each inside node's squared distance to the nearest
// outside node (Felzenszwalb & Huttenlocher's two passes of the 1D lower envelope).
function h2EDT(ins, nx, ny) {
  const INF = 1e12, G = new Float64Array(nx * ny), n = Math.max(nx, ny), f = new Float64Array(n), z = new Float64Array(n + 1), v = new Int32Array(n), dd = new Float64Array(n);
  const pass1 = (len, get, set) => {
    for (let q = 0; q < len; q++) f[q] = get(q);
    let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
    for (let q = 1; q < len; q++) { let s; for (;;) { s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); if (s <= z[k]) { k--; if (k < 0) { k = 0; break; } } else break; } k++; v[k] = q; z[k] = s; z[k + 1] = INF; }
    k = 0; for (let q = 0; q < len; q++) { while (z[k + 1] < q) k++; dd[q] = (q - v[k]) * (q - v[k]) + f[v[k]]; }
    for (let q = 0; q < len; q++) set(q, dd[q]);
  };
  for (let i = 0; i < nx; i++) pass1(ny, q => ins[q * nx + i] ? INF : 0, (q, x) => { G[q * nx + i] = x; });
  for (let j = 0; j < ny; j++) pass1(nx, q => G[j * nx + q], (q, x) => { G[j * nx + q] = x; });
  return G;
}
// rings: [[x, y], ...] lists (units; the outline and any holes: even-odd). Returns the cached field:
// { x0, y0, cs, nx, ny, ins, D (signed: + inside, capped at band), NX/NY (the inward normal at each node, from its
// nearest point on the outline), RHO (the local half-thickness: the deepest D nearby), lines: [level j] → polylines }
function h2Field(key, rings, o = {}) {
  const hit = H2.cache.get(key); if (hit) return hit;
  const cs = o.cs ?? H2.cs, R = o.band ?? H2.band, Ro = cs * 3;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const P of rings) for (const [x, y] of P) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  x0 -= Ro + cs; y0 -= Ro + cs; x1 += Ro + cs; y1 += Ro + cs;
  const nx = Math.ceil((x1 - x0) / cs) + 1, ny = Math.ceil((y1 - y0) / cs) + 1, N = nx * ny;
  const ins = new Uint8Array(N), D = new Float32Array(N), NX = new Float32Array(N), NY = new Float32Array(N), B = new Float32Array(N).fill(1e9);
  // inside: even-odd scanlines through the node rows
  const E = []; for (const P of rings) for (let i = 0; i < P.length; i++) E.push([P[i], P[(i + 1) % P.length]]);
  for (let j = 0; j < ny; j++) {
    const y = y0 + j * cs, xs = [];
    for (const [a, b] of E) if ((a[1] <= y) !== (b[1] <= y)) xs.push(a[0] + (y - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
    xs.sort((m, n) => m - n);
    for (let k = 0; k + 1 < xs.length; k += 2) for (let i = Math.max(0, Math.ceil((xs[k] - x0) / cs)); i <= Math.min(nx - 1, Math.floor((xs[k + 1] - x0) / cs)); i++) ins[j * nx + i] = 1;
  }
  // exact distance to the outline within the band (each segment updates the nodes near it)
  for (const [a, b] of E) {
    const ex = b[0] - a[0], ey = b[1] - a[1], el2 = ex * ex + ey * ey || 1e-12;
    const i0 = Math.max(0, Math.floor((Math.min(a[0], b[0]) - R - x0) / cs)), i1 = Math.min(nx - 1, Math.ceil((Math.max(a[0], b[0]) + R - x0) / cs));
    const j0 = Math.max(0, Math.floor((Math.min(a[1], b[1]) - R - y0) / cs)), j1 = Math.min(ny - 1, Math.ceil((Math.max(a[1], b[1]) + R - y0) / cs));
    for (let j = j0; j <= j1; j++) {
      const py = y0 + j * cs;
      for (let i = i0; i <= i1; i++) {
        const k = j * nx + i, px = x0 + i * cs;
        let t = ((px - a[0]) * ex + (py - a[1]) * ey) / el2; t = t < 0 ? 0 : t > 1 ? 1 : t;
        const qx = a[0] + ex * t, qy = a[1] + ey * t, dx = px - qx, dy = py - qy, d2 = dx * dx + dy * dy;
        if (d2 < B[k]) { B[k] = d2; const d = Math.sqrt(d2) || 1e-9, sg = ins[k] ? 1 : -1; NX[k] = sg * dx / d; NY[k] = sg * dy / d; }
      }
    }
  }
  // deeper than the band: the grid's exact Euclidean distance transform (Felzenszwalb), to the nearest outside node
  const G = h2EDT(ins, nx, ny);
  for (let k = 0; k < N; k++) { const d = Math.sqrt(B[k]); D[k] = ins[k] ? (d <= R ? d : Math.max(R, Math.sqrt(G[k]) * cs - cs * .5)) : -Math.min(d, Ro); }
  // the local half-thickness: march inward from each node in the band along its normal to the medial axis (where the
  // distance stops growing); the deepest distance met there is the form's radius at that point
  const RHO = new Float32Array(N);
  const Dat = (x, y) => { const fx = (x - x0) / cs, fy = (y - y0) / cs, i = Math.floor(fx), j = Math.floor(fy); if (i < 0 || j < 0 || i >= nx - 1 || j >= ny - 1) return -1; const u = fx - i, v = fy - j, k = j * nx + i; return D[k] * (1 - u) * (1 - v) + D[k + 1] * u * (1 - v) + D[k + nx] * (1 - u) * v + D[k + nx + 1] * u * v; };
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const k = j * nx + i; if (D[k] <= 0 || D[k] > R + cs) { RHO[k] = Math.max(0, D[k]); continue; }
    let best = D[k], px0 = x0 + i * cs, py0 = y0 + j * cs;
    for (let t = cs; t < 3.2; t += cs) { const v = Dat(px0 + NX[k] * t, py0 + NY[k] * t); if (v < best - cs * .15) break; if (v > best) best = v; }
    RHO[k] = best;
  }
  // (smoothed a little across the grid: the marches from neighbouring nodes land on slightly different axis points)
  { const tmp = new Float32Array(N); for (let pass = 0; pass < 2; pass++) { for (let k = 0; k < N; k++) tmp[k] = RHO[k]; for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) { const k = j * nx + i; if (D[k] <= 0) continue; let acc = 0, c = 0; for (const q of [k, k - 1, k + 1, k - nx, k + nx]) if (D[q] > 0) { acc += tmp[q]; c++; } RHO[k] = Math.max(D[k], acc / c); } } }
  const F = { key, x0, y0, cs, nx, ny, ins, D, NX, NY, RHO, R, rings, lines: null, fill: null };
  H2.cache.set(key, F);
  return F;
}
// the field's values at (x, y) (bilinear): [D, nx, ny, rho]
function h2At(F, x, y) {
  const fx = (x - F.x0) / F.cs, fy = (y - F.y0) / F.cs;
  let i = Math.floor(fx), j = Math.floor(fy);
  if (i < 0 || j < 0 || i >= F.nx - 1 || j >= F.ny - 1) return [-1, 0, 0, 0];
  const u = fx - i, v = fy - j, k = j * F.nx + i, a = (1 - u) * (1 - v), b = u * (1 - v), c = (1 - u) * v, d = u * v;
  const L = A => A[k] * a + A[k + 1] * b + A[k + F.nx] * c + A[k + F.nx + 1] * d;
  return [L(F.D), L(F.NX), L(F.NY), L(F.RHO)];
}
// Marching squares: the level lines D = j·d0 (j = 1 .. band/d0), chained into polylines of [x, y, nx, ny, rho].
function h2Lines(F) {
  if (F.lines) return F.lines;
  const { nx, ny, cs, x0, y0, D, NX, NY, RHO } = F, d0 = H2.d0, J = Math.floor((F.R - 1e-4) / d0);
  const segs = []; for (let j = 0; j <= J; j++) segs.push([]);
  // a crossing on the edge from node p to node q at level L: its point and id
  const cross = (p, q, L, id, out) => {
    const t = (L - D[p]) / (D[q] - D[p]), ip = p % nx, jp = (p - ip) / nx, iq = q % nx, jq = (q - iq) / nx;
    out.push([x0 + (ip + (iq - ip) * t) * cs, y0 + (jp + (jq - jp) * t) * cs, NX[p] + (NX[q] - NX[p]) * t, NY[p] + (NY[q] - NY[p]) * t, RHO[p] + (RHO[q] - RHO[p]) * t, id]);
  };
  for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const k00 = j * nx + i, k10 = k00 + 1, k01 = k00 + nx, k11 = k01 + 1;
    const a = D[k00], b = D[k10], c = D[k11], d = D[k01];
    const lo = Math.min(a, b, c, d), hi = Math.max(a, b, c, d);
    if (hi < d0 || lo > F.R) continue;
    for (let L = Math.max(1, Math.ceil(lo / d0)); L * d0 <= hi && L <= J; L++) {
      const lv = L * d0, P = [];
      // edges: top (k00-k10), right (k10-k11), bottom (k01-k11), left (k00-k01)
      if ((a < lv) !== (b < lv)) cross(k00, k10, lv, 2 * k00, P);
      if ((b < lv) !== (c < lv)) cross(k10, k11, lv, 2 * k10 + 1, P);
      if ((d < lv) !== (c < lv)) cross(k01, k11, lv, 2 * k01, P);
      if ((a < lv) !== (d < lv)) cross(k00, k01, lv, 2 * k00 + 1, P);
      if (P.length === 2) segs[L].push(P);
      else if (P.length === 4) {   // a saddle: pair by the centre's value
        const ctr = (a + b + c + d) / 4, aIn = a >= lv;
        if ((ctr >= lv) === aIn) { segs[L].push([P[0], P[1]]); segs[L].push([P[2], P[3]]); } else { segs[L].push([P[0], P[3]]); segs[L].push([P[1], P[2]]); }
      }
    }
  }
  // chain each level's segments by their shared edge crossings
  const lines = [];
  for (let L = 0; L <= J; L++) {
    const S = segs[L], by = new Map(), used = new Uint8Array(S.length), out = [];
    S.forEach((s, n) => { for (const e of [s[0][5], s[1][5]]) { const l = by.get(e); if (l) l.push(n); else by.set(e, [n]); } });
    for (let n = 0; n < S.length; n++) {
      if (used[n]) continue;
      used[n] = 1;
      const chain = [S[n][0], S[n][1]];
      for (const dir of [1, 0]) {   // grow from the end, then from the start
        for (;;) {
          const endP = dir ? chain[chain.length - 1] : chain[0], cand = by.get(endP[5]) || [];
          let nxt = -1; for (const c of cand) if (!used[c]) { nxt = c; break; }
          if (nxt < 0) break;
          used[nxt] = 1; const s = S[nxt], p = s[0][5] === endP[5] ? s[1] : s[0];
          if (dir) chain.push(p); else chain.unshift(p);
        }
      }
      if (chain.length >= 3) out.push(chain.map(p => [p[0], p[1], p[2], p[3], p[4]]));
    }
    lines.push(out);
  }
  return F.lines = lines;
}
// The paper under a field's shape (marching-squares fill, holes left open): triangles (units), cached. Runs of
// whole cells are merged into one quad per row.
function h2Fill(F) {
  if (F.fill) return F.fill;
  const { nx, ny, cs, x0, y0, D } = F, T = [];
  const P = (i, j) => [x0 + i * cs, y0 + j * cs];
  const lerpE = (ka, kb, pa, pb) => { const t = D[ka] / (D[ka] - D[kb]); return [pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t]; };
  const fan = Q => { for (let q = 1; q + 1 < Q.length; q++) T.push(Q[0][0], Q[0][1], Q[q][0], Q[q][1], Q[q + 1][0], Q[q + 1][1]); };
  for (let j = 0; j < ny - 1; j++) {
    let run = -1;
    const flush = i => { if (run >= 0) { const a = P(run, j), b = P(i, j + 1); T.push(a[0], a[1], b[0], a[1], b[0], b[1], a[0], a[1], b[0], b[1], a[0], b[1]); run = -1; } };
    for (let i = 0; i < nx - 1; i++) {
      const k = [j * nx + i, j * nx + i + 1, (j + 1) * nx + i + 1, (j + 1) * nx + i], p = [P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)];
      const inn = k.map(q => D[q] > 0), nIn = inn.filter(Boolean).length;
      if (nIn === 4) { if (run < 0) run = i; continue; }
      flush(i);
      if (nIn === 0) continue;
      const Q = []; for (let e = 0; e < 4; e++) { const f = (e + 1) % 4; if (inn[e]) Q.push(p[e]); if (inn[e] !== inn[f]) Q.push(lerpE(k[e], k[f], p[e], p[f])); }
      fan(Q);
    }
    flush(nx - 1);
  }
  return F.fill = new Float32Array(T);
}
// A clip by the GL stencil, written with colour off (p5's beginClip here also paints its mask shape into the picture):
// T, triangles in the current coordinates; everything drawn until h2ClipOff lands only inside them. (Brush strokes are
// flushed at both ends, so they're composited through it.)
// It nests inside p5's own clip (a poster on a wall, a screen: p5 marks its region stencil != 0): ours is the top bit,
// written only where the outer clip passes, tested alone; p5 only toggles the stencil test while it draws, so its draws
// in between respect ours too. h2ClipOff clears our bit and puts p5's state back.
let H2CLIP = null;
function h2ClipOn(T) {
  flushBrush();
  const gl = drawingContext, outer = gl.isEnabled(gl.STENCIL_TEST);
  H2CLIP = { outer, func: gl.getParameter(gl.STENCIL_FUNC), ref: gl.getParameter(gl.STENCIL_REF), vm: gl.getParameter(gl.STENCIL_VALUE_MASK),
    fail: gl.getParameter(gl.STENCIL_FAIL), zf: gl.getParameter(gl.STENCIL_PASS_DEPTH_FAIL), zp: gl.getParameter(gl.STENCIL_PASS_DEPTH_PASS), wm: gl.getParameter(gl.STENCIL_WRITEMASK) };
  if (!outer) gl.enable(gl.STENCIL_TEST);
  gl.stencilMask(0x80); gl.clearStencil(0); gl.clear(gl.STENCIL_BUFFER_BIT);   // (our bit only)
  if (!outer) gl.stencilFunc(gl.ALWAYS, 0x80, 0xFF);   // (inside a clip its own test stays in force for the write: our bit is clear, so it passes just where the clip does, p5's or core.js's clipPoly nested any way)
  gl.stencilOp(gl.KEEP, gl.KEEP, gl.INVERT);   // (the write mask keeps it to our bit: 0 -> 1)
  gl.colorMask(false, false, false, false);
  BANK_BRUSH_DIRTY = false; bankTris(T, '#000000');
  gl.colorMask(true, true, true, true);
  gl.stencilMask(0x00); gl.stencilFunc(gl.EQUAL, 0x80, 0x80); gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
}
function h2ClipOff() {
  flushBrush();
  const gl = drawingContext, S = H2CLIP; if (!S) return;
  gl.stencilMask(0x80); gl.clearStencil(0); gl.clear(gl.STENCIL_BUFFER_BIT);
  gl.stencilMask(S.wm); gl.stencilFunc(S.func, S.ref, S.vm); gl.stencilOp(S.fail, S.zf, S.zp);
  if (!S.outer) gl.disable(gl.STENCIL_TEST);
  H2CLIP = null;
}
// a polygon's triangles (a fan from its centroid: fine for the star-shaped clips here)
const h2Fan = Q => { const c = centroid(Q), T = []; for (let i = 0; i < Q.length; i++) { const a = Q[i], b = Q[(i + 1) % Q.length]; T.push(c[0], c[1], a[0], a[1], b[0], b[1]); } return T; };
// fill a triangle list in a colour (bankTris' raw GL path)
const h2Tris = (T, col) => { if (T.length >= 6) bankTris(T, col); };

// ---- tone ----
// The light (toward it; mirrored with XF), a little in front of the page.
const h2Light = () => { const L = [LIGHT.dir[0] * XF, LIGHT.dir[1], .62], n = Math.hypot(...L); return L.map(v => v / n); };
// tone 0..1 (paper .. black) of a line point: the surface as a cylinder of radius rho seen side on (the level line at
// depth d sits where its normal has turned (rho - d)/rho toward the page); base: the coat's darkness; lam: light.
function h2Tone(d, nx, ny, rho, base, L, o = {}) {
  const r = Math.max(rho, d + .01, o.minR ?? .1);
  const u = clamp(1 - d / r), sz = Math.sqrt(1 - u * u), n2 = Math.hypot(nx, ny) || 1;
  const ox = -nx / n2 * u, oy = -ny / n2 * u;   // the outward normal, tilted toward the viewer
  const lam = Math.max(0, ox * L[0] + oy * L[1] + sz * L[2]);
  const sp = Math.pow(Math.max(0, ox * L[0] * .5 + oy * L[1] * .5 + sz * (L[2] + 1) * .5 / Math.hypot(L[0] * .5, L[1] * .5, (L[2] + 1) * .5)), 18);
  return clamp(base + (1 - base) * Math.pow(1 - lam, 1.35) * (o.k ?? 1) - .5 * sp * (o.spec ?? 1) + (o.bias || 0));
}
// ink coverage (line width ÷ spacing) for a tone: none in the lights, swelling into the darks
const h2Cov = t => t < .1 ? 0 : .05 + .62 * Math.pow((t - .1) / .9, 1.25);
// the target line spacing (screen px) and the finest line (screen px): finer at the 4K detail levels
const h2dS = () => 4.4 / Math.pow(bankK(), .8);
const h2wMin = () => (BANK.wmin ?? .7) / bankKW() * .8;

// Engrave a field's level lines into T (units). o: base (tone), L (light), px (screen px per unit), clip(x, y) (a
// point test: false = no ink there), dk (spacing ×), from/to (depth range, units), toneO (h2Tone's options), wk (×)
function h2Engrave(T, F, o) {
  const lines = h2Lines(F), px = o.px, dS = h2dS() * (o.dk || 1), wmin = h2wMin() / px;
  const lv = Math.max(0, Math.log2(dS / (px * H2.d0))), N = 2 ** Math.ceil(lv), fade = N > 1 ? Math.ceil(lv) - lv : 0;
  const from = o.from ?? 0, to = o.to ?? F.R;
  for (let j = 1; j < lines.length; j++) {
    const main = j % N === 0, half = N > 1 && j % (N / 2) === 0 && !main;
    if (!main && !(half && fade > .02)) continue;
    const d = j * H2.d0; if (d < from || d > to) continue;
    const sp = main ? lerp(N, N / 2, fade) * H2.d0 : fade * (N / 2) * H2.d0;   // (the tone stays the same as lines fade in)
    for (const P of lines[j]) {
      let run = [], ws = [];
      const flush = () => { if (run.length >= 2) { const n = run.length; ws[0] *= .3; ws[n - 1] *= .3; if (n > 3) { ws[1] *= .7; ws[n - 2] *= .7; } bankSwell(T, run, ws, wmin); } run = []; ws = []; };
      for (const p of P) {
        if (o.clip && !o.clip(p[0], p[1])) { flush(); continue; }
        const t = h2Tone(d, p[2], p[3], p[4], o.base, o.L, o.toneO), w = sp * h2Cov(t) * (o.wk || 1);
        if (w < wmin * .6) { flush(); continue; }
        run.push([p[0], p[1]]); ws.push(w);
      }
      flush();
    }
  }
}
// Iso-lines of a scalar field phi over a field's shape (the hand-laid hatching's line families): phi(x, y) -> a value,
// or NaN outside the family's mass. Levels phi = j·d0; chained polylines of [x, y], per level j (with its index, for
// nesting like the level lines). Cached under key.
function h2IsoLines(F, key, phi) {
  F.iso = F.iso || {};
  if (F.iso[key]) return F.iso[key];
  const { nx, ny, cs, x0, y0 } = F, d0 = H2.d0, V = new Float32Array(nx * ny);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const k = j * nx + i; V[k] = F.D[k] > 0 ? phi(x0 + i * cs, y0 + j * cs) : NaN; }
  const segs = new Map();
  const at = (p, q, lv, id) => { const t = (lv - V[p]) / (V[q] - V[p]), ip = p % nx, jp = (p - ip) / nx, iq = q % nx, jq = (q - iq) / nx; return [x0 + (ip + (iq - ip) * t) * cs, y0 + (jp + (jq - jp) * t) * cs, id]; };
  for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const k00 = j * nx + i, k10 = k00 + 1, k01 = k00 + nx, k11 = k01 + 1, a = V[k00], b = V[k10], c = V[k11], d = V[k01];
    if (a !== a || b !== b || c !== c || d !== d) continue;
    const lo = Math.min(a, b, c, d), hi = Math.max(a, b, c, d);
    for (let L = Math.ceil(lo / d0); L * d0 <= hi; L++) {
      const lv = L * d0, P = [];
      if ((a < lv) !== (b < lv)) P.push(at(k00, k10, lv, 2 * k00)); if ((b < lv) !== (c < lv)) P.push(at(k10, k11, lv, 2 * k10 + 1));
      if ((d < lv) !== (c < lv)) P.push(at(k01, k11, lv, 2 * k01)); if ((a < lv) !== (d < lv)) P.push(at(k00, k01, lv, 2 * k00 + 1));
      if (P.length < 2) continue;
      let l = segs.get(L); if (!l) segs.set(L, l = []);
      l.push([P[0], P[1]]); if (P.length === 4) l.push([P[2], P[3]]);
    }
  }
  const out = [];
  for (const [L, S] of segs) {
    const by = new Map(); S.forEach((sg, n) => { for (const e of [sg[0][2], sg[1][2]]) { const q = by.get(e); if (q) q.push(n); else by.set(e, [n]); } });
    const used = new Uint8Array(S.length);
    for (let n = 0; n < S.length; n++) {
      if (used[n]) continue; used[n] = 1;
      const ch = [S[n][0], S[n][1]];
      for (const dir of [1, 0]) for (;;) { const e = (dir ? ch[ch.length - 1] : ch[0])[2], c = (by.get(e) || []).find(q => !used[q]); if (c == null) break; used[c] = 1; const sg = S[c], pnt = sg[0][2] === e ? sg[1] : sg[0]; if (dir) ch.push(pnt); else ch.unshift(pnt); }
      if (ch.length >= 3) out.push({ L, P: ch.map(q => [q[0], q[1]]) });
    }
  }
  return F.iso[key] = out;
}
// Draw iso-lines (from h2IsoLines) nested for the screen scale, each weighted by the form's tone at each point
function h2IsoDraw(T, F, lines, o) {
  const px = o.px, dS = h2dS() * (o.dk || 1), wmin = h2wMin() / px;
  const lv = Math.max(0, Math.log2(dS / (px * H2.d0))), N = 2 ** Math.ceil(lv), fade = N > 1 ? Math.ceil(lv) - lv : 0;
  for (const { L, P } of lines) {
    const j = Math.abs(L), main = j % N === 0, half = N > 1 && j % (N / 2) === 0 && !main;
    if (!main && !(half && fade > .02)) continue;
    const sp = main ? lerp(N, N / 2, fade) * H2.d0 : fade * (N / 2) * H2.d0;
    let run = [], ws = [];
    const flush = () => { if (run.length >= 2) { const n = run.length; ws[0] *= .3; ws[n - 1] *= .3; bankSwell(T, run, ws, wmin); } run = []; ws = []; };
    for (const p of P) {
      if (o.clip && !o.clip(p[0], p[1])) { flush(); continue; }
      const f = h2At(F, p[0], p[1]), t = h2Tone(Math.max(0, f[0]), f[1], f[2], f[3], o.base, o.L, o.toneO), w = sp * h2Cov(t);
      if (w < wmin * .6) { flush(); continue; }
      run.push(p); ws.push(w);
    }
    flush();
  }
}
// Treatment B, "hand-laid": each mass cut with its own family of lines, the way a banknote engraver lays them (see
// out/horse2/ref/NOTES.txt): collars across the neck bowed toward the chest, lines down the shoulder blade, lines round
// the ribs like longitude, concentric arcs round the point of the hip; the head, the legs and the tail keep the lines
// that run along them (the level lines). Needs the frame's body and poll (o.Fr).
function h2Hatch(T, F, o) {
  const Fr = o.Fr, b = Fr.src.body, poll = h2L2B(b, ...Fr.src.poll), wth = [1.9, -2.1];
  const ax = h2Unit(poll[0] - wth[0], poll[1] - wth[1]), nL = Math.hypot(poll[0] - wth[0], poll[1] - wth[1]);
  const Ln = H2W.lines;
  const massOf = (u, v, rho) => {
    if (rho < .44 && v > 1.2) return 'thin';                                  // the legs
    if (u < -5.6 && v < 1.4 && rho < .5) return 'thin';                       // the tail
    const s = (u - wth[0]) * ax[0] + (v - wth[1]) * ax[1];
    if (h2LineSD(Ln.neck, u, v) > 0) return s > nL - .85 ? 'thin' : 'neck';   // (the head: along its lines)
    if (h2LineSD(Ln.girth, u, v) < 0) return 'shoulder';
    if (h2LineSD(Ln.flank, u, v) > 0) return 'barrel';
    return 'quarters';
  };
  const fam = {
    neck:     (u, v) => { const s = (u - wth[0]) * ax[0] + (v - wth[1]) * ax[1], t = -(u - wth[0]) * ax[1] + (v - wth[1]) * ax[0]; return s - .12 * t * t; },
    shoulder: (u, v) => h2LineSD(Ln.neck, u, v) - .05 * Math.pow(v + .2, 2),
    barrel:   (u, v) => u + .1 * Math.pow(v - .5, 2),
    quarters: (u, v) => { const r = Math.hypot(u + 4.55, v - .05); return r < .42 ? NaN : r; },   // (the point of the hip left in paper)
  };
  const zoneFn = (nm) => (x, y) => { const f = h2At(F, x, y), [u, v] = h2L2B(b, x, y); return massOf(u, v, f[3]) === nm ? fam[nm](u, v) : NaN; };
  for (const nm of Object.keys(fam)) h2IsoDraw(T, F, h2IsoLines(F, 'B' + nm, zoneFn(nm)), o);
  // the head, legs and tail: the level lines, only there
  const thin = (x, y) => { const f = h2At(F, x, y), [u, v] = h2L2B(b, x, y); return massOf(u, v, f[3]) === 'thin' && (!o.clip || o.clip(x, y)); };
  h2Engrave(T, F, { ...o, clip: thin });
  h2Cross(T, F, o);
}
// Cross-hatching in the darks: straight lines at angle a (rad) across the shape, swelling where the tone passes thr.
function h2Cross(T, F, o) {
  const px = o.px, dS = h2dS() * 1.15 * (o.dk || 1) / px, wmin = h2wMin() / px, a = o.a ?? -.75, ca = Math.cos(a), sa = Math.sin(a), thr = o.thr ?? .6;
  const cx = F.x0 + F.nx * F.cs / 2, cy = F.y0 + F.ny * F.cs / 2, R = Math.hypot(F.nx, F.ny) * F.cs / 2, st = Math.max(F.cs * .8, 2.5 / px);
  for (let v = -R; v <= R; v += dS) {
    let run = [], ws = [];
    const flush = () => { if (run.length >= 2) { ws[0] *= .3; ws[ws.length - 1] *= .3; bankSwell(T, run, ws, wmin); } run = []; ws = []; };
    for (let u = -R; u <= R; u += st) {
      const x = cx + ca * u - sa * v, y = cy + sa * u + ca * v, f = h2At(F, x, y);
      if (f[0] < .01 || (o.clip && !o.clip(x, y))) { flush(); continue; }
      const t = h2Tone(Math.min(f[0], F.R), f[1], f[2], f[3], o.baseAt ? o.baseAt(x, y) : o.base, o.L, o.toneO), w = dS * .75 * h2Cov(t) * clamp((t - thr) / (1 - thr) * 1.5);
      if (w < wmin * .6) { flush(); continue; }
      run.push([x, y]); ws.push(w);
    }
    flush();
  }
}
// A swelling outline along a ring (units): heavier where it faces away from the light. w: screen px at its heaviest.
function h2Outline(T, P, w, px, closed = true, o = {}) {
  const n = P.length; if (n < 2) return;
  let ar = 0; for (let i = 0; i < n; i++) { const a = P[i], b = P[(i + 1) % n]; ar += a[0] * b[1] - b[0] * a[1]; }
  const sg = ar > 0 ? 1 : -1, L = LIGHT.dir, ws = [], Q = closed ? P.concat([P[0]]) : P;
  for (let i = 0; i < Q.length; i++) {
    const a = Q[Math.max(0, i - 1)], b = Q[Math.min(Q.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], dl = Math.hypot(dx, dy) || 1;
    let nx = dy / dl * sg, ny = -dx / dl * sg;   // outward (screen y down: a positive-area ring runs clockwise on screen)
    if (o.c) { const f = (nx * (Q[i][0] - o.c[0]) + ny * (Q[i][1] - o.c[1])) < 0 ? -1 : 1; nx *= f; ny *= f; }
    const away = Math.max(0, -(nx * L[0] * XF + ny * L[1]));
    ws.push((o.lo ?? .42) * w / px + ((1 - (o.lo ?? .42)) * w / px) * away);
  }
  bankSwell(T, Q, ws, h2wMin() / px * .5);
  // round joins: a disc at each vertex (the swelling line's corners close)
  if (o.joins !== false) for (let i = 0; i < Q.length; i++) { const r = ws[i] / 2; if (r * px < .6) continue; const c = Q[i]; for (let k = 0; k < 6; k++) { const a0 = k / 6 * TAU, a1 = (k + 1) / 6 * TAU; T.push(c[0], c[1], c[0] + Math.cos(a0) * r, c[1] + Math.sin(a0) * r, c[0] + Math.cos(a1) * r, c[1] + Math.sin(a1) * r); } }
}
// Chaikin smoothing of a closed ring (the traced outlines' corners rounded for the outline stroke)
function h2Smooth(P, it = 2, closed = true) {
  let Q = P;
  for (let r = 0; r < it; r++) {
    const out = [], n = Q.length;
    for (let i = 0; i < (closed ? n : n - 1); i++) { const a = Q[i], b = Q[(i + 1) % n]; out.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25], [a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75]); }
    if (!closed) { out.unshift(Q[0]); out.push(Q[n - 1]); }
    Q = out;
  }
  return Q;
}
// the ink for a figure (deep, intaglio) or not; o.far sets it back toward paper
const h2Ink = (col, k, far = 0) => { let c = mixCol(BANK.ink, col, k); if (bankInFig()) c = bankFigCol(c); return far > 0 ? mixCol(c, BANK.paper, .42 * far) : c; };

// ======================================================================================================================
// the traced frames
// ======================================================================================================================
// frame f (0..10 the gallop, 'stand'): its rings as point lists, and its fields (cached)
const H2F = { rings: new Map() };
function h2Frame(f) {
  const hit = H2F.rings.get(f); if (hit) return hit;
  const src = f === 'stand' ? HORSE_FRAMES.stand : HORSE_FRAMES.gallop[f];
  const toP = A => { const P = []; for (let i = 0; i < A.length; i += 2) P.push([A[i], A[i + 1]]); return P; };
  const h = src.h.map(toP), r = toP(src.r);
  const out = { src, h, r, hO: h.map(P => h2Smooth(P, 2)), rO: h2Smooth(r, 2), key: 'hf' + f };
  H2F.rings.set(f, out);
  return out;
}
// the gallop's frame at phase ph (cycles): stepped (Muybridge's 11 drawings), index 0..10
const h2FrameAt = ph => ((Math.floor(frac(ph) * 11 + 1e-6) % 11) + 11) % 11;

// ======================================================================================================================
// the shell's windows: where the skin is cut away to show the movement
// ======================================================================================================================
// The windows, in the body frame (units: u forward, v down, from the torso core's centre): one opening inside the
// shell (the silhouette inset by the shell's thickness H2W.t), bounded front and back (the neck, the tail) and split by
// two ribs (the girth behind the shoulder, the flank in front of the quarters): each window is the opening between its
// bounding lines. A line: [u0, v0, u1, v1] (its left side, walking from the first point to the second, is "inside").
const H2W = {
  t: .4, round: .3, rib: .17,
  lines: {
    neck:  [2.05, -2.4, 4.35, 1.0],     // the withers down to the point of the shoulder: the neck is in front
    girth: [1.3, 3.0, 1.5, -2.6],       // the girth, behind the shoulder
    flank: [-2.2, -2.6, -2.45, 3.0],    // the flank, in front of the hip
    tail:  [-6.1, 2.6, -6.1, -2.6],     // the buttock
    belly: [-7, 2.15, 5, 2.15],         // (keeps the tops of the legs shut)
  },
  // each window: [line, side] constraints (side +1: the line's left, -1: its right), inset by a rib's half-width
  wins: {
    shoulder: [['neck', -1, 0], ['girth', -1, 1], ['belly', 1, 0]],
    barrel:   [['girth', 1, 1], ['flank', 1, 1], ['belly', 1, 0]],
    quarters: [['flank', -1, 1], ['tail', -1, 0], ['belly', 1, 0]],
  },
};
// a line's signed distance (body frame; + on its left, walking p0 -> p1: screen y down, so "left" is the -n side)
const h2LineSD = (Lr, u, v) => { const dx = Lr[2] - Lr[0], dy = Lr[3] - Lr[1], l = Math.hypot(dx, dy); return ((u - Lr[0]) * dy - (v - Lr[1]) * dx) / l; };
// the smooth minimum (rounds the window's corners: radius ~k)
const h2Smin = (a, b, k) => (a + b - Math.sqrt((a - b) * (a - b) + k * k)) / 2;
// body frame <-> the horse's local units
const h2B2L = (b, u, v) => { const c = Math.cos(b[2]), s = Math.sin(b[2]); return [b[0] + u * c - v * s, b[1] + u * s + v * c]; };
const h2L2B = (b, x, y) => { const c = Math.cos(b[2]), s = Math.sin(b[2]), dx = x - b[0], dy = y - b[1]; return [dx * c + dy * s, -dx * s + dy * c]; };
// a window's signed "inside" at a local point: > 0 inside the opening
function h2WinAt(F, b, cons, x, y) {
  const [u, v] = h2L2B(b, x, y);
  let w = h2At(F, x, y)[0] - H2W.t;
  for (const [nm, side, rib] of cons) w = h2Smin(w, side * h2LineSD(H2W.lines[nm], u, v) - rib * H2W.rib, H2W.round);
  return w;
}
// Iso-rings of fn over the field's grid (marching squares at level lv, chained, closed ones only): local units
function h2Iso(F, fn, lv, bb) {
  const { cs, x0, y0 } = F;
  const i0 = Math.max(0, Math.floor((bb[0] - x0) / cs) - 1), i1 = Math.min(F.nx - 1, Math.ceil((bb[2] - x0) / cs) + 1);
  const j0 = Math.max(0, Math.floor((bb[1] - y0) / cs) - 1), j1 = Math.min(F.ny - 1, Math.ceil((bb[3] - y0) / cs) + 1);
  const w = i1 - i0 + 1, V = new Float32Array(w * (j1 - j0 + 1));
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) V[(j - j0) * w + i - i0] = (i === i0 || i === i1 || j === j0 || j === j1) ? -1 : fn(x0 + i * cs, y0 + j * cs) - lv;
  const segs = [], at = (p, q, id) => { const t = V[p] / (V[p] - V[q]), ip = p % w, jp = (p - ip) / w, iq = q % w, jq = (q - iq) / w; return [x0 + (i0 + ip + (iq - ip) * t) * cs, y0 + (j0 + jp + (jq - jp) * t) * cs, id]; };
  for (let j = 0; j < j1 - j0; j++) for (let i = 0; i < w - 1; i++) {
    const k00 = j * w + i, k10 = k00 + 1, k01 = k00 + w, k11 = k01 + 1, a = V[k00] > 0, b2 = V[k10] > 0, c = V[k11] > 0, d = V[k01] > 0, P = [];
    if (a !== b2) P.push(at(k00, k10, 2 * k00)); if (b2 !== c) P.push(at(k10, k11, 2 * k10 + 1)); if (d !== c) P.push(at(k01, k11, 2 * k01)); if (a !== d) P.push(at(k00, k01, 2 * k00 + 1));
    if (P.length === 2) segs.push(P); else if (P.length === 4) { segs.push([P[0], P[1]]); segs.push([P[2], P[3]]); }
  }
  const by = new Map(); segs.forEach((sg, n) => { for (const e of [sg[0][2], sg[1][2]]) { const l = by.get(e); if (l) l.push(n); else by.set(e, [n]); } });
  const used = new Uint8Array(segs.length), rings = [];
  for (let n = 0; n < segs.length; n++) {
    if (used[n]) continue; used[n] = 1;
    const ch = [segs[n][0], segs[n][1]];
    for (;;) { const e = ch[ch.length - 1][2], c = (by.get(e) || []).find(q => !used[q]); if (c == null) break; used[c] = 1; const sg = segs[c]; ch.push(sg[0][2] === e ? sg[1] : sg[0]); }
    if (ch.length > 8) rings.push(ch.map(p => [p[0], p[1]]));
  }
  rings.sort((m, n) => n.length - m.length);
  return rings;
}
// a frame's windows (cached): { name: { z, ring (the opening's edge), inner (the cut face's inner edge) } }
function h2Windows(Fr, F) {
  if (Fr.win) return Fr.win;
  const b = Fr.src.body, out = {};
  // (the whole body's bounding box: the fn does the work)
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; for (const [x, y] of Fr.h[0]) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  for (const [nm, cons] of Object.entries(H2W.wins)) {
    const fn = (x, y) => h2WinAt(F, b, cons, x, y);
    const ring = h2Iso(F, fn, 0, [x0, y0, x1, y1])[0], inner = h2Iso(F, fn, .1, [x0, y0, x1, y1])[0];
    if (ring && ring.length > 12) out[nm] = { ring: h2Smooth(ring, 1), inner: inner ? h2Smooth(inner, 1) : null, fn };
  }
  // the legs' slots: along the core of each thin part below the belly (the forearms and gaskins), a rod inside
  const slotFn = (x, y) => { const f = h2At(F, x, y), [u, v] = h2L2B(b, x, y); if (f[0] <= 0) return -1; let w = f[0] - .5 * f[3]; w = h2Smin(w, .58 - f[3], .05); w = h2Smin(w, v - 2.45, .15); w = h2Smin(w, 5.1 - v, .15); w = h2Smin(w, u + 6.0, .1); return w; };
  const slots = h2Iso(F, slotFn, 0, [x0, y0, x1, y1]).filter(r => r.length > 10);
  const rods = h2Iso(F, (x, y) => { const f = h2At(F, x, y); return h2Smin(f[0] - .8 * f[3], slotFn(x, y) + .02, .02); }, 0, [x0, y0, x1, y1]).filter(r => r.length > 6);
  out.slots = { rings: slots.map(r => h2Smooth(r, 1)), rods: rods.map(r => h2Smooth(r, 1)), fn: slotFn };
  return Fr.win = out;
}

// ======================================================================================================================
// the movement: engraved machine parts (body-frame units), each clipped to the windows by a point test
// ======================================================================================================================
// the drawing context for the movement: T (ink triangles), P (paper triangles), px, clip(u, v), ink; parts are drawn
// in layers (h2Flush between them: the paper of a part in front covers the lines behind it)
function h2Flush(M) { h2Tris(M.T, M.ink); M.T = []; }
function h2Paper(M, Q) { const T = []; const c = centroid(Q); for (let i = 0; i < Q.length; i++) { const a = Q[i], b = Q[(i + 1) % Q.length]; T.push(c[0], c[1], a[0], a[1], b[0], b[1]); } h2Flush(M); h2Tris(T, BANK.paper); }
// a swelling line (widths in screen px), clipped
function h2Line(M, P, wpx, o = {}) {
  let run = [], ws = [];
  const wmin = h2wMin() / M.px, flush = () => { if (run.length >= 2) bankSwell(M.T, run, ws, wmin * .5); run = []; ws = []; };
  P.forEach((p, i) => { if (M.clip && !M.clip(p[0], p[1])) { flush(); return; } run.push(p); ws.push((typeof wpx === 'function' ? wpx(i / Math.max(1, P.length - 1), p) : wpx) / M.px); });
  flush();
}
// a circle's points
const h2Circ = (c, r, n = 40, a0 = 0) => { const P = []; for (let i = 0; i <= n; i++) { const a = a0 + i / n * TAU; P.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]); } return P; };
// the light in the body frame (for flat faces: how much a point sits toward the shadow side of a part centred at c)
const h2Away = (M, c, x, y, r) => clamp(.5 - ((x - c[0]) * M.L[0] + (y - c[1]) * M.L[1]) / (2 * r));
// Turned work: concentric lathe rings over an annulus r0..r1 about c, each ring's weight by the face's tone (heavier on
// the side away from the light; a bright band where the turned face catches it)
function h2Lathe(M, c, r0, r1, tone, o = {}) {
  const d = h2dS() * 1.05 * (o.dk || 1) / M.px, n = Math.max(1, Math.floor((r1 - r0) / d));
  for (let k = 0; k < n; k++) {
    const r = r0 + (k + .5) * (r1 - r0) / n, P = h2Circ(c, r, Math.max(16, Math.round(r * M.px / 3)));
    h2Line(M, P, (f, p) => { const aw = h2Away(M, c, p[0], p[1], r), t = clamp(tone + .5 * (aw - .5) + (o.band ? -.35 * Math.exp(-Math.pow((aw - .28) / .1, 2)) : 0)); return d * M.px * h2Cov(t); });
  }
}
// Ruled lines across a polygon Q (a flat face): at angle a, the weight by the face's tone and its side
function h2Rule(M, Q, tone, a = 0, o = {}) {
  const d = h2dS() * (o.dk || 1) / M.px, ca = Math.cos(a), sa = Math.sin(a), c = centroid(Q);
  let r = 0; for (const p of Q) r = Math.max(r, Math.hypot(p[0] - c[0], p[1] - c[1]));
  for (let v = -r; v <= r; v += d) {
    // the chord of Q along this line
    const xs = [];
    for (let i = 0; i < Q.length; i++) { const p = Q[i], q = Q[(i + 1) % Q.length], pv = -(p[0] - c[0]) * sa + (p[1] - c[1]) * ca, qv = -(q[0] - c[0]) * sa + (q[1] - c[1]) * ca; if ((pv <= v) !== (qv <= v)) { const t = (v - pv) / (qv - pv); xs.push((p[0] - c[0]) * ca + (p[1] - c[1]) * sa + t * (((q[0] - c[0]) * ca + (q[1] - c[1]) * sa) - ((p[0] - c[0]) * ca + (p[1] - c[1]) * sa))); } }
    xs.sort((m, n) => m - n);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const L = xs[k + 1] - xs[k], n = Math.max(2, Math.ceil(L * M.px / 6)), P = [];
      for (let i = 0; i <= n; i++) { const uu = xs[k] + L * i / n; P.push([c[0] + uu * ca - v * sa, c[1] + uu * sa + v * ca]); }
      h2Line(M, P, (f, p) => d * M.px * h2Cov(clamp(tone + (o.grad ?? .45) * (h2Away(M, c, p[0], p[1], r) - .5))) * (f < .04 || f > .96 ? .5 : 1));
    }
  }
}
// an outline (closed), swelling on the side away from the light
function h2Edge(M, Q, w = 1.1, closed = true) {
  const c = centroid(Q), P = closed ? Q.concat([Q[0]]) : Q;
  h2Line(M, P, (f, p) => w * (.55 + .9 * h2Away(M, c, p[0], p[1], 1e-3 + Math.hypot(p[0] - c[0], p[1] - c[1]))));
}
// a ring's triangles between two closed point lists of the same length (an annulus: the rim of a wheel)
function h2Strip(A, B) { const T = []; for (let i = 0; i < A.length; i++) { const j = (i + 1) % A.length; T.push(A[i][0], A[i][1], A[j][0], A[j][1], B[j][0], B[j][1], A[i][0], A[i][1], B[j][0], B[j][1], B[i][0], B[i][1]); } return T; }
// A spur gear: n teeth, pitch radius r, turned to angle a. Drawn as its rim (teeth and all), its spokes and its hub,
// each a piece of paper engraved (the cavity shows dark between the spokes); o.spokes (0: a plain web), o.curved,
// o.hub (radius), o.tone
function h2Gear(M, c, r, n, a, o = {}) {
  const td = Math.min(.13, r * .17), rr = r - td * .5, ro = r + td * .5, ns = o.spokes || 0, ri = ns ? r - Math.max(.09, r * .2) : 0, rh = o.hub ?? Math.max(.07, r * .22), tone = o.tone ?? .3;
  const Q = [], I = []; const dA = TAU / n;
  for (let i = 0; i < n; i++) { const a0 = a + i * dA; for (const [f, rad] of [[0, rr], [.18, ro], [.5, ro], [.68, rr]]) { Q.push([c[0] + Math.cos(a0 + f * dA) * rad, c[1] + Math.sin(a0 + f * dA) * rad]); I.push([c[0] + Math.cos(a0 + f * dA) * ri, c[1] + Math.sin(a0 + f * dA) * ri]); } }
  h2Flush(M);
  if (ns) {
    h2Tris(h2Strip(Q, I), BANK.paper);
    // the spokes (straight or curved), each a paper bar with lines along it, shaded on its far side
    const sw = Math.max(.05, r * .075);
    for (let k = 0; k < ns; k++) {
      const a0 = a + k / ns * TAU, pts = [];
      for (let q = 0; q <= 6; q++) { const f = q / 6, rad = lerp(rh * .9, ri + .02, f), bend = o.curved ? .45 * Math.sin(f * Math.PI) * .5 : 0; pts.push([c[0] + Math.cos(a0 + bend) * rad, c[1] + Math.sin(a0 + bend) * rad]); }
      const Lft = [], Rt = [];
      pts.forEach((p, i) => { const q = pts[Math.min(pts.length - 1, i + 1)], pr = pts[Math.max(0, i - 1)], dx = q[0] - pr[0], dy = q[1] - pr[1], l = Math.hypot(dx, dy) || 1, ww = sw * (1.25 - .35 * i / 6); Lft.push([p[0] - dy / l * ww, p[1] + dx / l * ww]); Rt.push([p[0] + dy / l * ww, p[1] - dx / l * ww]); });
      const SP = Lft.concat(Rt.slice().reverse());
      h2Paper(M, SP);
      const nl = Math.max(1, Math.round(2 * sw * M.px / (h2dS() * 1.1)));
      for (let j = 0; j < nl; j++) { const f = (j + .5) / nl, line = Lft.map((p, i) => [lerp(p[0], Rt[i][0], f), lerp(p[1], Rt[i][1], f)]), mid = line[3], side = h2Away(M, pts[3], mid[0], mid[1], sw * 1.5); h2Line(M, line, h2dS() * .9 * h2Cov(clamp(tone - .1 + .7 * (side - .5)))); }
      h2Edge(M, SP, .8);
    }
    h2Lathe(M, c, ri, rr, tone, { band: true });
    h2Edge(M, I.concat([I[0]]), .75, false);
  } else { h2Paper(M, Q); h2Lathe(M, c, rh, rr, tone, { band: true }); }
  h2Edge(M, Q, 1.05);
  // the hub: a boss with its axle, a glint on the lit side
  h2Paper(M, h2Circ(c, rh, 20).slice(0, -1));
  h2Lathe(M, c, rh * .35, rh, tone + .15);
  h2Edge(M, h2Circ(c, rh, 20).slice(0, -1), .9);
  h2Flush(M); const T = [], P = h2Circ(c, rh * .3, 14); for (let i = 0; i < 14; i++) T.push(c[0], c[1], P[i][0], P[i][1], P[i + 1][0], P[i + 1][1]); h2Tris(T, M.ink);
  return { c, r, n, a };
}
// the angle for a gear of n2 teeth meshing gear G (at angle phi from G's centre to its own), so their teeth interleave
const h2MeshA = (G, n2, phi) => { const c1 = .34 * TAU / G.n, c2 = .34 * TAU / n2; return -(G.n / n2) * (G.a - phi + c1) + phi + Math.PI - c2 - Math.PI / n2; };
// a gear meshing G: n2 teeth, at angle phi from G's centre (its pitch radius from G's by the teeth ratio)
function h2GearOn(M, G, n2, phi, o = {}) { const r2 = G.r * n2 / G.n, c = [G.c[0] + Math.cos(phi) * (G.r + r2), G.c[1] + Math.sin(phi) * (G.r + r2)]; return h2Gear(M, c, r2, n2, h2MeshA(G, n2, phi), o); }
// a watch's balance: a thin rim on two arms, swinging back and forth, and its hairspring coiled inside
function h2Balance(M, c, r, a) {
  const rim = h2Circ(c, r, 36).slice(0, -1), rin = h2Circ(c, r * .86, 36).slice(0, -1);
  h2Flush(M); h2Tris(h2Strip(rim, rin), BANK.paper);
  h2Lathe(M, c, r * .86, r, .3); h2Edge(M, rim, .9); h2Edge(M, rin.concat([rin[0]]), .6, false);
  for (const k of [0, Math.PI]) { const e = [c[0] + Math.cos(a + k) * r * .9, c[1] + Math.sin(a + k) * r * .9]; h2Rod(M, c, e, r * .12, { tone: .25 }); }
  const H = []; for (let q = 0; q <= 160; q++) { const f = q / 160, th = a * .3 + f * TAU * 5.5, rad = r * (.12 + .6 * f); H.push([c[0] + Math.cos(th) * rad, c[1] + Math.sin(th) * rad]); }
  h2Line(M, H, .7);
}
// a rod (a flat bar with an eye at each end): from p to q, w wide; pins at the ends
function h2Rod(M, p, q, w, o = {}) {
  const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy * w / 2, ny = ux * w / 2, er = w * .78;
  const Q = [];
  for (let i = 0; i <= 8; i++) { const a = Math.atan2(ny, nx) + i / 8 * Math.PI; Q.push([q[0] + Math.cos(a) * er, q[1] + Math.sin(a) * er]); }
  for (let i = 0; i <= 8; i++) { const a = Math.atan2(-ny, -nx) + i / 8 * Math.PI; Q.push([p[0] + Math.cos(a) * er, p[1] + Math.sin(a) * er]); }
  h2Paper(M, Q);
  // lines along the bar, darker on its shadow edge
  const d = h2dS() / M.px, nL = Math.max(1, Math.floor(w / d));
  for (let k = 0; k < nL; k++) { const f = (k + .5) / nL - .5, sh = clamp(.5 + f * Math.sign(-(nx * M.L[0] + ny * M.L[1]) || 1)); const off = [nx * 2 * f * .8, ny * 2 * f * .8]; h2Line(M, [[p[0] + off[0], p[1] + off[1]], [q[0] + off[0], q[1] + off[1]]], d * M.px * h2Cov(clamp((o.tone ?? .3) + .5 * (sh - .5)))); }
  h2Edge(M, Q, .95);
  for (const e of [p, q]) { h2Paper(M, h2Circ(e, er * .55, 12).slice(0, -1)); h2Edge(M, h2Circ(e, er * .55, 12).slice(0, -1), .8); }
}
// a sphere (a governor's ball): engraved in concentric rings round its shadow side
function h2Ball(M, c, r, tone = .35) {
  const Q = h2Circ(c, r, 24).slice(0, -1); h2Paper(M, Q);
  const d = h2dS() / M.px, sc = [c[0] - M.L[0] * r * .45, c[1] - M.L[1] * r * .45];
  for (let rad = d * .8; rad < r * 1.6; rad += d) {
    const P = h2Circ(sc, rad, Math.max(12, Math.round(rad * M.px / 3))).filter(p => Math.hypot(p[0] - c[0], p[1] - c[1]) < r * .97);
    if (P.length > 2) h2Line(M, P, (f, p) => d * M.px * h2Cov(clamp(tone + .9 * Math.hypot(p[0] - sc[0], p[1] - sc[1]) / (r * 1.5) - .25)));
  }
  h2Edge(M, Q, 1);
}
// a cylinder (a piston's barrel): from p to q, r its radius; lines along the axis, a highlight strip a third across
function h2Cyl(M, p, q, r, tone = .35) {
  const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  const side = (nx * M.L[0] + ny * M.L[1]) > 0 ? 1 : -1;   // +n faces the light
  const Q = [[p[0] + nx * r, p[1] + ny * r], [q[0] + nx * r, q[1] + ny * r], [q[0] - nx * r, q[1] - ny * r], [p[0] - nx * r, p[1] - ny * r]];
  h2Paper(M, Q);
  const d = h2dS() / M.px, n = Math.max(2, Math.floor(2 * r / d));
  for (let k = 0; k < n; k++) {
    const f = (k + .5) / n * 2 - 1, lit = f * side, t = clamp(tone + .55 * (-lit) - .4 * Math.exp(-Math.pow((lit - .35) / .18, 2)) + (Math.abs(f) > .9 ? .15 : 0));
    h2Line(M, [[p[0] + nx * r * f, p[1] + ny * r * f], [q[0] + nx * r * f, q[1] + ny * r * f]], d * M.px * h2Cov(t));
  }
  h2Edge(M, Q, 1);
  // the collars at each end
  for (const e of [p, q]) h2Line(M, [[e[0] + nx * r * 1.12, e[1] + ny * r * 1.12], [e[0] - nx * r * 1.12, e[1] - ny * r * 1.12]], 1.6);
}
// a chain along a closed path (links as small plates, moving along it by s)
function h2Chain(M, P, s, pitch = .13) {
  const d = [0]; for (let i = 1; i < P.length; i++) d.push(d[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const Ltot = d[d.length - 1], at = x => { x = ((x % Ltot) + Ltot) % Ltot; let i = 0; while (i < d.length - 2 && d[i + 1] < x) i++; const k = (x - d[i]) / ((d[i + 1] - d[i]) || 1); return [lerp(P[i][0], P[i + 1][0], k), lerp(P[i][1], P[i + 1][1], k)]; };
  const n = Math.floor(Ltot / pitch);
  for (let k = 0; k < n; k++) {
    const a = at(k * pitch + s), b = at(k * pitch + s + pitch * .9), dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = pitch * (k % 2 ? .36 : .46), nx = -dy / l * w, ny = dx / l * w;
    const Q = [[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]];
    if (!M.clip || (M.clip(a[0], a[1]) && M.clip(b[0], b[1]))) { h2Paper(M, Q); h2Edge(M, Q, .7); }
  }
}
// The cavity behind the movement: dense cross-hatching over a window (the dark the metal reads against)
function h2Cavity(M, ring) {
  const d = h2dS() * .95 / M.px;
  for (const a of [-.35, .8]) {
    const ca = Math.cos(a), sa = Math.sin(a), c = centroid(ring); let r = 0; for (const p of ring) r = Math.max(r, Math.hypot(p[0] - c[0], p[1] - c[1]));
    for (let v = -r; v <= r; v += d) { const P = []; for (let u = -r; u <= r; u += 4 / M.px) P.push([c[0] + u * ca - v * sa, c[1] + u * sa + v * ca]); h2Line(M, P, (f, p) => d * M.px * (a < 0 ? .6 : .42)); }
  }
}

// The movement (body frame), turning with the stride: turn (cycles), gov 0..1 (the governor's balls flying out: speed),
// swing: { fore, hind } (the legs' swing, rad: the rockers follow them)
function h2Movement(M, turn, gov, swing) {
  const A = turn * TAU;
  // ---- furthest back: the chain from the great wheel's sprocket to the hip's (it passes behind the flank's rib) ----
  const sp1 = [-.5, .6], sp2 = [-4.35, .45], sr = .34;
  const chainP = []; for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i / 10 * Math.PI; chainP.push([sp1[0] + Math.cos(a) * sr, sp1[1] + Math.sin(a) * sr]); } for (let i = 0; i <= 10; i++) { const a = Math.PI / 2 + i / 10 * Math.PI; chainP.push([sp2[0] + Math.cos(a) * sr, sp2[1] + Math.sin(a) * sr]); } chainP.push(chainP[0]);
  h2Chain(M, chainP, turn * 1.3);
  // ---- the barrel: a train of gears round the great wheel ----
  const G1 = h2Gear(M, [-.5, .6], 1.08, 36, A, { spokes: 6, curved: true, tone: .26, hub: .24 });
  const G5 = h2GearOn(M, G1, 22, 2.62, { spokes: 4, tone: .32 });            // behind, toward the flank (under its rib)
  const G4 = h2GearOn(M, G1, 16, 1.0, { tone: .3 });                        // below, toward the girth
  const P1 = h2GearOn(M, G1, 12, -.5, { tone: .3 });                        // the pinion, up and forward
  const G2 = h2Gear(M, P1.c, .5, 18, P1.a * 1 + .1, { spokes: 3, tone: .24 });    // on the pinion's arbor
  h2GearOn(M, G2, 14, -2.15, { tone: .32 });                                // up under the saddle
  h2GearOn(M, G5, 12, -2.1, { tone: .3 });
  // the governor: a spindle up by the girth, two balls on arms flying out with speed
  const gs = [1.02, -.95], ga = lerp(.3, 1.2, clamp(gov)), spin = Math.sin(A * 2.2);
  h2Rod(M, [gs[0], gs[1] + 1.35], [gs[0], gs[1] - .05], .08, { tone: .25 });
  for (const sd of [-1, 1]) { const k = .75 + .25 * spin * sd, arm = [gs[0] + sd * Math.sin(ga) * .6 * k, gs[1] + Math.cos(ga) * .6]; h2Rod(M, gs, arm, .055, { tone: .3 }); h2Ball(M, arm, .16, .3); }
  // the crank: a pin on the great wheel, rods to the shoulder's rocker and the hip's rocker (behind the ribs between)
  const cp = [G1.c[0] + Math.cos(A + 1) * .7, G1.c[1] + Math.sin(A + 1) * .7];
  const shR = [2.85, .95], hipR = [-3.95, 1.2];
  const rockF = [shR[0] + Math.sin(swing.fore) * .55, shR[1] - Math.cos(swing.fore) * .55], rockH = [hipR[0] - Math.sin(swing.hind) * .55, hipR[1] - Math.cos(swing.hind) * .55];
  h2Rod(M, cp, rockF, .12, { tone: .24 });
  h2Rod(M, cp, rockH, .12, { tone: .24 });
  // ---- the quarters: the hip's gear train, a cam, the rocker down to the stifle ----
  const H1 = h2Gear(M, [-4.35, .45], .88, 28, A * 1.1, { spokes: 5, curved: true, tone: .28 });
  h2GearOn(M, H1, 14, -.95, { tone: .3 });
  const H3 = h2GearOn(M, H1, 18, 2.2, { spokes: 3, tone: .3 });
  h2GearOn(M, H3, 10, -2.6, { tone: .32 });
  const camC = [-5.15, -.62], camA = A * 1.1, cam = []; for (let i = 0; i < 36; i++) { const a = i / 36 * TAU, rad = .26 + .15 * Math.pow(.5 + .5 * Math.cos(a - camA), 2); cam.push([camC[0] + Math.cos(a) * rad, camC[1] + Math.sin(a) * rad]); }
  h2Paper(M, cam); h2Rule(M, cam, .3, .5); h2Edge(M, cam, 1);
  h2Rod(M, [camC[0] + Math.cos(camA) * .41, camC[1] + Math.sin(camA) * .41], rockH, .08, { tone: .25 });
  h2Rod(M, hipR, rockH, .14, { tone: .22 });
  h2Rod(M, hipR, [hipR[0] - Math.sin(swing.hind) * .15, hipR[1] + 1.5], .15, { tone: .3 });
  // ---- the shoulder: the balance and its hairspring, a piston down the shoulder blade, the gear at its point ----
  h2Balance(M, [2.3, -.55], .46, .9 * Math.sin(A * 2));
  const sb0 = [2.2, .15], sb1 = [3.4, 1.25], ext = .5 + .5 * Math.sin(swing.fore * 2.2);
  h2Cyl(M, sb0, [lerp(sb0[0], sb1[0], .5), lerp(sb0[1], sb1[1], .5)], .17, .3);
  h2Rod(M, [lerp(sb0[0], sb1[0], .45 + .12 * ext), lerp(sb0[1], sb1[1], .45 + .12 * ext)], rockF, .09, { tone: .22 });
  const SG = h2Gear(M, shR, .4, 14, -A * 1.1 * 28 / 14, { spokes: 3, tone: .28 });
  h2GearOn(M, SG, 9, -2.3, { tone: .3 });
  h2Rod(M, shR, rockF, .14, { tone: .22 });
  h2Rod(M, shR, [shR[0] + Math.sin(swing.fore) * .15, shR[1] + 1.4], .15, { tone: .3 });
  h2Flush(M);
}
// the legs' swing through the stride (rad; + = forward), read off Muybridge's frames: the forelegs fold back under the
// chest in frames 1-3 and reach forward in 4-8; the hind legs come under in 2-5 and drive back in 6-9
const h2Swing = ph => ({ fore: .5 * Math.cos(TAU * (ph - .45)), hind: .5 * Math.cos(TAU * (ph - .23)) });

// An engraved leather strap along A (local units): paper between two fine edge lines, the lower edge a little heavier
function h2Strap(A, w, ink, px) {
  const P = through(A, 6), L = [], R = [];
  P.forEach((p, i) => { const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)], u = h2Unit(b[0] - a[0], b[1] - a[1]); L.push([p[0] - u[1] * w / 2, p[1] + u[0] * w / 2]); R.push([p[0] + u[1] * w / 2, p[1] - u[0] * w / 2]); });
  const T0 = []; for (let i = 0; i + 1 < P.length; i++) T0.push(L[i][0], L[i][1], L[i + 1][0], L[i + 1][1], R[i + 1][0], R[i + 1][1], L[i][0], L[i][1], R[i + 1][0], R[i + 1][1], R[i][0], R[i][1]);
  h2Tris(T0, BANK.paper);
  const T = [], lw = Math.max(.6, 1.0) / px; bankSwell(T, L, L.map(() => lw * 1.3), 0); bankSwell(T, R, R.map(() => lw), 0);
  // a stitch line down the middle
  bankSwell(T, P, P.map((_, i) => i % 2 ? 0 : lw * .6), 0);
  h2Tris(T, ink);
}
// The head's frame from the traced poll and muzzle (local units): along the face, and across it toward the jaw
function h2HeadFrame(Fr) {
  const P = Fr.src.poll, M = Fr.src.muzzle, ax = h2Unit(M[0] - P[0], M[1] - P[1]), L = Math.hypot(M[0] - P[0], M[1] - P[1]);
  let n = [-ax[1], ax[0]]; if (n[0] > 0) n = [-n[0], -n[1]];   // (toward the jaw: back and down)
  return { P, M, ax, n, L, at: (f, g) => [P[0] + ax[0] * L * f + n[0] * g, P[1] + ax[1] * L * f + n[1] * g] };
}
// the eye (a lens: an almond lid, an iris of aperture blades, a glint) and the bridle (cheekpiece, browband, noseband,
// the bit's ring), engraved on the shell's head
function h2HeadTack(Fr, px, ink, L, o) {
  const Hf = h2HeadFrame(Fr), T = [], dark = mixCol(ink, '#000000', .25);
  const e = Hf.at(.3, .52), er = .25, ang = Math.atan2(Hf.ax[1], Hf.ax[0]);
  const lid = []; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; lid.push([e[0] + Math.cos(a) * er * 1.25 * Math.cos(ang) - Math.sin(a) * er * .8 * Math.sin(ang), e[1] + Math.cos(a) * er * 1.25 * Math.sin(ang) + Math.sin(a) * er * .8 * Math.cos(ang)]); }
  h2Tris(h2Fan(lid), BANK.paper);
  const M = { T, px, ink, L, clip: null };
  const ap = .45 + .1 * Math.sin((o.ph || 0) * TAU * 2);
  for (let i = 0; i < 6; i++) { const a0 = i / 6 * TAU + ap; bankSwell(T, [[e[0] + Math.cos(a0) * er * .3, e[1] + Math.sin(a0) * er * .3], [e[0] + Math.cos(a0 + .6) * er * .62, e[1] + Math.sin(a0 + .6) * er * .62]], [.02, .035], 0); }
  const Q = h2Circ(e, er * .28, 10); for (let i = 0; i < 10; i++) T.push(e[0], e[1], Q[i][0], Q[i][1], Q[i + 1][0], Q[i + 1][1]);
  h2Edge(M, h2Circ(e, er * .68, 18).slice(0, -1), .9); h2Edge(M, lid, 1.2);
  h2Tris(T, dark);
  if (o.tack === false) return;
  const bit = Hf.at(.8, .72), sc = mixCol(ink, '#000000', .3);
  h2Strap([Hf.at(.02, .18), Hf.at(.16, .5), Hf.at(.45, .72), bit], .13, sc, px);   // the cheekpiece, from behind the ear to the bit
  h2Strap([Hf.at(.06, .05), Hf.at(.1, .28)], .11, sc, px);                         // the browband
  h2Strap([Hf.at(.68, -.02), Hf.at(.7, .4), Hf.at(.68, .78)], .13, sc, px);        // the noseband
  const R = []; bankSwell(R, h2Circ(bit, .13, 14), h2Circ(bit, .13, 14).map(() => .045), 0); h2Tris(R, dark);
}

// ======================================================================================================================
// the horse
// ======================================================================================================================
function horse2(x, y, s, o = {}) {
  const f = o.ph == null ? 'stand' : h2FrameAt(o.ph);
  const Fr = h2Frame(f), coat = H2.COATS[o.coat || 'steel'], far = clamp(o.far || 0);
  const F = h2Field(Fr.key, Fr.h), b = Fr.src.body;
  push(); translate(x, y); scale(s); if (o.tilt) { translate(b[0], b[1]); rotate(o.tilt); translate(-b[0], -b[1]); }
  const px = bankPx(), L = h2Light(), ink = h2Ink(coat.col, coat.k, far);
  h2Tris(h2Fill(F), BANK.paper);
  const win = o.windows === false ? {} : h2Windows(Fr, F), wins = Object.entries(win).filter(([k]) => k !== 'slots').map(([, w]) => w), slots = win.slots;
  const inWin = (xx, yy) => { for (const w of wins) if (w.fn(xx, yy) > 0) return true; return slots ? slots.fn(xx, yy) > 0 : false; };
  // the movement, through the windows (drawn in the body frame, clipped to the openings by a stencil)
  if (wins.length) {
    flushBrush(); push();
    h2ClipOn(wins.flatMap(w => w.tris || (w.tris = h2Fan(w.ring))));
    translate(b[0], b[1]); rotate(b[2]);
    const Lb = [L[0] * Math.cos(-b[2]) - L[1] * Math.sin(-b[2]), L[0] * Math.sin(-b[2]) + L[1] * Math.cos(-b[2])];
    const M = { T: [], px, ink, dark: mixCol(ink, '#000000', .2), L: Lb, clip: null };
    for (const w of wins) h2Cavity(M, w.ring.map(q => h2L2B(b, q[0], q[1])));
    h2Flush(M);
    const ph = o.ph ?? 0;
    h2Movement(M, o.turn ?? ph * (o.speed ?? 1), o.gov ?? (o.ph == null ? 0 : .35), o.ph == null ? { fore: 0, hind: 0 } : h2Swing(ph));
    h2Flush(M);
    h2ClipOff(); pop();
  }
  // the legs' slots: the dark inside, a rod along each, a pivot cap at each end
  if (slots && slots.rings.length) {
    push(); h2ClipOn(slots.rings.flatMap(h2Fan));
    const M = { T: [], px, ink, dark: mixCol(ink, '#000000', .2), L, clip: null };
    for (const r of slots.rings) h2Cavity(M, r);
    h2Flush(M);
    for (const r of slots.rods) { h2Paper(M, r); h2Rule(M, r, .28, 0, { grad: .6 }); h2Edge(M, r, .9); }
    h2Flush(M); h2ClipOff(); pop();
    const T = [];
    for (const r of slots.rings) {
      // the ends: the slot's two farthest-apart points
      let a = 0, bI = 0, best = 0; const step = Math.max(1, Math.floor(r.length / 24));
      for (let i = 0; i < r.length; i += step) for (let j = i + step; j < r.length; j += step) { const d = Math.hypot(r[i][0] - r[j][0], r[i][1] - r[j][1]); if (d > best) { best = d; a = i; bI = j; } }
      if (best < .35) continue;
      for (const q of [r[a], r[bI]]) {
        const f = h2At(F, q[0], q[1]), c = [q[0] + f[1] * .05, q[1] + f[2] * .05], rr = Math.max(.07, Math.min(.13, f[3] * .5));
        h2Tris(h2Fan(h2Circ(c, rr, 14).slice(0, -1)), BANK.paper);
        const M2 = { T, px, ink, L, clip: null }; h2Lathe(M2, c, rr * .3, rr, .3); h2Edge(M2, h2Circ(c, rr, 14).slice(0, -1), .9);
        const Q = h2Circ(c, rr * .28, 8); for (let i = 0; i < 8; i++) T.push(c[0], c[1], Q[i][0], Q[i][1], Q[i + 1][0], Q[i + 1][1]);
      }
      h2Outline(T, r, 1.1, px, true, { lo: .6 });
    }
    h2Tris(T, ink);
  }
  // the shell: its engraving (not in the windows), the cut faces, the outline
  const T = [], clip = wins.length ? (xx, yy) => !inWin(xx, yy) : null;
  h2Hatch(T, F, { px, base: coat.base, L, clip, Fr });   // (hand-laid line families per mass: the pick over the distance field's level lines everywhere)
  for (const w of wins) {
    // the cut face: the shell's thickness between the edge and the inner line, section-hatched at 45°
    if (w.inner) {
      const d = h2dS() * .8 / px, c = centroid(w.ring); let r = 0; for (const q of w.ring) r = Math.max(r, Math.hypot(q[0] - c[0], q[1] - c[1]));
      for (let v = -r * 1.5; v <= r * 1.5; v += d) { const P = []; for (let uu = -r * 1.5; uu <= r * 1.5; uu += 3 / px) P.push([c[0] + (uu - v) * .7071, c[1] + (uu + v) * .7071]); let run = []; const fl = () => { if (run.length > 1) bankSwell(T, run, run.map(() => d * .42), h2wMin() / px * .5); run = []; }; for (const q of P) { const wv = w.fn(q[0], q[1]); if (wv > 0 && wv < .11) run.push(q); else fl(); } fl(); }
      h2Outline(T, w.inner, 1.0, px, true, { lo: .5 });
    }
    h2Outline(T, w.ring, 1.6, px, true, { lo: .55 });
  }
  for (const P of Fr.hO) h2Outline(T, P, 1.7, px);
  h2Tris(T, ink);
  h2HeadTack(Fr, px, ink, L, o);
  pop();
  return { body: [x + b[0] * s, y + b[1] * s, b[2] + (o.tilt || 0)], f };
}

// ======================================================================================================================
// the jockey: an engraved puppet in the horse's own line (silks, breeches, boots, white gloves); only the head is the
// caricature's (the rigs' head layers, drawn over the collar like a portrait on a note)
// ======================================================================================================================
// parts at rest (units, facing right, screen y down): root, tip (the bone), outline; tone (0 paper .. 1 dark), ink
const H2J = {   // (after Muybridge's rider: a slim torso ~1.2 deep, the arm hanging to the waist, the forearm forward)
  torso: { root: [0, 0], tip: [.15, -2.65], P: [[-.42, .12], [-.56, -.45], [-.57, -1.3], [-.47, -2.08], [-.3, -2.5], [-.05, -2.74], [.14, -2.8], [.4, -2.7], [.54, -2.44], [.66, -1.98], [.64, -1.52], [.5, -1.04], [.52, -.5], [.46, .1], [.05, .28]] },
  upper: { root: [0, 0], tip: [0, 1.45], P: [[-.28, -.1], [-.16, -.3], [.16, -.3], [.3, -.06], [.3, .62], [.23, 1.42], [0, 1.56], [-.23, 1.42], [-.29, .62]] },
  fore:  { root: [0, 0], tip: [0, 1.3], P: [[-.21, -.04], [0, -.2], [.21, -.04], [.19, .85], [.2, 1.18], [.16, 1.34], [-.16, 1.34], [-.2, 1.18], [-.18, .85]] },
  glove: { root: [0, 0], tip: [0, .5], P: [[-.17, -.04], [.17, -.04], [.23, .22], [.2, .46], [.05, .56], [-.12, .5], [-.23, .26]] },
  thigh: { root: [0, 0], tip: [2.1, 0], P: [[-.22, -.34], [.6, -.33], [1.5, -.26], [2.12, -.22], [2.36, -.02], [2.2, .22], [1.5, .22], [.7, .28], [-.05, .32], [-.36, .06]] },
  shin:  { root: [0, 0], tip: [0, 2.0], P: [[-.25, -.18], [.1, -.26], [.27, -.04], [.25, .6], [.2, 1.5], [.24, 1.86], [.82, 2.02], [.88, 2.2], [.16, 2.24], [-.2, 2.14], [-.21, 1.5], [-.26, .6]] },
};
// the pose: joint points in the horse's body frame; returns them with the elbow and knee solved (2-bone IK)
function h2IK(A, T, l1, l2, bend) {
  const dx = T[0] - A[0], dy = T[1] - A[1], d = Math.min(Math.hypot(dx, dy), (l1 + l2) * .999), a0 = Math.atan2(dy, dx);
  const k = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const P1 = [A[0] + Math.cos(a0 + k) * l1, A[1] + Math.sin(a0 + k) * l1], P2 = [A[0] + Math.cos(a0 - k) * l1, A[1] + Math.sin(a0 - k) * l1];
  // bend: +1 / -1 (a side), or a function scoring a joint (the higher wins: 'knee forward' = p => p[0], 'elbow down' = p => p[1])
  if (typeof bend === 'function') return bend(P1) >= bend(P2) ? P1 : P2;
  return bend > 0 ? P1 : P2;
}
const H2_KNEE = p => p[0], H2_ELBOW = p => p[1];
const h2Len = P => Math.hypot(P.tip[0] - P.root[0], P.tip[1] - P.root[1]);
// a seated jockey's pose on frame Fr (body frame): hip, neck, shoulder, elbow, hand, knee, foot; o.lean (rad, +
// forward: the racing crouch), o.hand (override the hands' point), o.dy (a bump up out of the saddle)
function h2SeatPose(Fr, o = {}) {
  const b = Fr.src.body, seat = h2L2B(b, ...Fr.src.rSeat), head = h2L2B(b, ...Fr.src.rHead), hand = h2L2B(b, ...Fr.src.rHand);
  const hip = [seat[0] + .5, seat[1] - .32 - (o.dy || 0)];
  const lean0 = Math.atan2(head[0] - hip[0], -(head[1] - hip[1])), lean = lean0 + (o.lean ?? .5);
  const Lt = h2Len(H2J.torso), neck = [hip[0] + Math.sin(lean) * Lt, hip[1] - Math.cos(lean) * Lt];
  const sh = [lerp(hip[0], neck[0], .86) + Math.cos(lean) * .08, lerp(hip[1], neck[1], .86) + Math.sin(lean) * .08];
  const hd = o.hand || [hand[0] - .05, hand[1] + .3];
  const foot = o.foot || [hip[0] + 1.3, hip[1] + 2.75];
  return { hip, neck, sh, hand: hd, foot, lean };
}
// draw one rigid part posed from root to tip (both body frame), engraved (the field cached by part)
function h2Part(nm, root, tip, o) {
  const P = H2J[nm], F = h2Field('J' + nm, [P.P], { cs: .03 }), rest = Math.atan2(P.tip[1] - P.root[1], P.tip[0] - P.root[0]), now = Math.atan2(tip[1] - root[1], tip[0] - root[0]), da = now - rest;
  const sc = o.stretch ? Math.hypot(tip[0] - root[0], tip[1] - root[1]) / h2Len(P) : 1;
  push(); translate(root[0], root[1]); rotate(da); translate(-P.root[0] * sc, -P.root[1]);
  if (sc !== 1) scale(sc, 1);
  const px = bankPx(), L0 = o.L, L = [L0[0] * Math.cos(-da) - L0[1] * Math.sin(-da), L0[0] * Math.sin(-da) + L0[1] * Math.cos(-da), L0[2]];
  h2Tris(h2Fill(F), BANK.paper);
  const T = [];
  const toneO = { k: o.k ?? 1, spec: o.spec ?? .15, minR: .25 };
  h2Engrave(T, F, { px, base: o.base, L, toneO });
  if (o.base > .25) h2Cross(T, F, { px, base: o.base, L, thr: .72, toneO });
  h2Outline(T, h2Smooth(P.P, 2), 1.4, px);
  if (o.deco) o.deco(T, px, L);
  h2Tris(T, o.ink);
  pop();
}
// A union of posed rigid parts as ONE engraved shape (the jockey's body, his arm): each part's cached field, looked up
// through its pose, the deepest one winning at each node; one outline, level lines running on across the joins.
// parts: [{ nm, root, tip, base (tone), ink }] (body frame). Returns a field-like object (h2Lines, h2Fill, h2Iso work
// on it) plus PART (the winning part at each node). Cached under key when given (a seated pose repeats per frame).
const H2U = new Map();
function h2Union(parts, key) {
  if (key && H2U.has(key)) return H2U.get(key);
  const cs = .035, P = parts.map(q => {
    const J = H2J[q.nm], F = h2Field('J' + q.nm, [J.P], { cs: .03 }), rest = Math.atan2(J.tip[1] - J.root[1], J.tip[0] - J.root[0]), da = Math.atan2(q.tip[1] - q.root[1], q.tip[0] - q.root[0]) - rest;
    const c = Math.cos(da), s = Math.sin(da);
    return { ...q, F, c, s, J };
  });
  // the bounding box: each part's outline, posed
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const pose = (q, x, y) => { const dx = x - q.J.root[0], dy = y - q.J.root[1]; return [q.root[0] + dx * q.c - dy * q.s, q.root[1] + dx * q.s + dy * q.c]; };
  for (const q of P) for (const [x, y] of q.J.P) { const w = pose(q, x, y); x0 = Math.min(x0, w[0]); y0 = Math.min(y0, w[1]); x1 = Math.max(x1, w[0]); y1 = Math.max(y1, w[1]); }
  x0 -= .15; y0 -= .15; x1 += .15; y1 += .15;
  const nx = Math.ceil((x1 - x0) / cs) + 1, ny = Math.ceil((y1 - y0) / cs) + 1, N = nx * ny;
  const D = new Float32Array(N).fill(-.1), NX = new Float32Array(N), NY = new Float32Array(N), RHO = new Float32Array(N), PART = new Uint8Array(N), ins = new Uint8Array(N);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const X = x0 + i * cs, Y = y0 + j * cs, k = j * nx + i;
    let best = -1e9, bi = 0, bn = null;
    for (let m = 0; m < P.length; m++) {
      const q = P[m], dx = X - q.root[0], dy = Y - q.root[1], lx = q.J.root[0] + dx * q.c + dy * q.s, ly = q.J.root[1] - dx * q.s + dy * q.c;
      const f = h2At(q.F, lx, ly);
      if (f[0] > best) { best = f[0]; bi = m; bn = f; }
    }
    D[k] = Math.max(-.1, best); PART[k] = bi; ins[k] = best > 0 ? 1 : 0;
    const q = P[bi]; NX[k] = bn[1] * q.c - bn[2] * q.s; NY[k] = bn[1] * q.s + bn[2] * q.c; RHO[k] = bn[3];
  }
  const U = { x0, y0, cs, nx, ny, D, NX, NY, RHO, PART, ins, R: H2.band, parts: P, lines: null, fill: null };
  U.ring = h2Iso(U, (x, y) => h2At(U, x, y)[0], 0, [x0, y0, x1, y1]).map(r => h2Smooth(r, 1));
  if (key) { if (H2U.size > 400) H2U.clear(); H2U.set(key, U); }
  return U;
}
// the part at a point of a union
const h2PartAt = (U, x, y) => { const i = clamp(Math.round((x - U.x0) / U.cs), 0, U.nx - 1), j = clamp(Math.round((y - U.y0) / U.cs), 0, U.ny - 1); return U.PART[j * U.nx + i]; };
// Engrave a union: paper, level lines (each point's tone and ink from its part), cross-hatching in its darks, one outline
function h2UnionDraw(U, o = {}) {
  const px = bankPx(), L = h2Light(), dS = h2dS(), wmin = h2wMin() / px, lines = h2Lines(U), P = U.parts;
  h2Tris(h2Fill(U), BANK.paper);
  const Ts = P.map(() => []);
  const lv = Math.max(0, Math.log2(dS / (px * H2.d0))), N = 2 ** Math.ceil(lv), fade = N > 1 ? Math.ceil(lv) - lv : 0;
  for (let j = 1; j < lines.length; j++) {
    const main = j % N === 0, half = N > 1 && j % (N / 2) === 0 && !main;
    if (!main && !(half && fade > .02)) continue;
    const d = j * H2.d0, sp = main ? lerp(N, N / 2, fade) * H2.d0 : fade * (N / 2) * H2.d0;
    for (const Pl of lines[j]) {
      let run = [], ws = [], cur = -1;
      const flush = () => { if (run.length >= 2) { const n = run.length; ws[0] *= .3; ws[n - 1] *= .3; bankSwell(Ts[cur], run, ws, wmin); } run = []; ws = []; };
      for (const p of Pl) {
        const m = h2PartAt(U, p[0], p[1]);
        if (m !== cur) { if (run.length) { run.push([p[0], p[1]]); ws.push(ws[ws.length - 1]); } flush(); cur = m; }
        const t = h2Tone(d, p[2], p[3], p[4], P[m].base, L, { spec: .15, minR: .25 }), w = sp * Math.min(.92, h2Cov(t) * (P[m].wk ?? 1));
        if (w < wmin * .6) { flush(); continue; }
        run.push([p[0], p[1]]); ws.push(w);
      }
      flush();
    }
  }
  // cross-hatching where it's darkest (the boots, the shadow side of the silks)
  const T2 = []; h2Cross(T2, U, { px, baseAt: (x, y) => P[h2PartAt(U, x, y)].base, L, thr: .7, toneO: { spec: .15, minR: .25 } });
  P.forEach((q, m) => { if (q.deco) q.deco(Ts[m]); h2Tris(Ts[m], q.ink); });
  h2Tris(T2, P[0].ink);
  const To = []; for (const r of U.ring) h2Outline(To, r, 1.5, px); h2Tris(To, o.outline || mixCol(P[0].ink, '#000000', .3));
}
// The jockey. J: the pose, joint points in his horse's body frame ({ hip, neck, sh, hand, foot, lean } from h2SeatPose,
// or any, plus hand2: a free far arm); xf: { on(), off(), w(p) } enters his horse's body frame and maps a body-frame
// point to world px (see h2Ride); o.silk (colour), o.hoops, o.head(neckWorld, ang, pxPerUnit) draws the head.
function h2Jockey(J, xf, o) {
  const L3 = h2Light(), silk = h2Ink(o.silk || '#2A4A7A', .66), dark = h2Ink('#0C0C10', .8), pale = h2Ink('#5A5A64', .5);
  const lu = h2Len(H2J.upper), lf = h2Len(H2J.fore), lt = h2Len(H2J.thigh), ls = h2Len(H2J.shin);
  const knee = J.knee || h2IK(J.hip, J.foot, lt, ls, H2_KNEE), elbow = J.elbow || h2IK(J.sh, J.hand, lu, lf, H2_ELBOW);
  // the parts are rigid: the hand and the foot are where the forearm and the shin reach (toward their targets)
  const reach = (E, T, L) => { const dx = T[0] - E[0], dy = T[1] - E[1], d = Math.hypot(dx, dy) || 1; return [E[0] + dx / d * L, E[1] + dy / d * L]; };
  J = { ...J, hand: reach(elbow, J.hand, lf), foot: reach(knee, J.foot, ls) };
  const st = o.silkTone ?? .62, key = o.key;
  const creaseT = (A, B, pts) => { const Q = through(pts, 5); return T => bankSwell(T, Q, Q.map((_, i) => .04 * Math.sin(Math.PI * (i + .5) / Q.length)), 0); };
  let grip2 = null;
  const glove = (h, e) => h2Part('glove', h, [h[0] + (h[0] - e[0]) * .35, h[1] + (h[1] - e[1]) * .35], { L: L3, base: .02, ink: pale });
  // the head first: the jacket's collar goes over the neck (the neck's base a little down inside the collar)
  if (o.head) { const ld = J.headA ?? (J.lean ?? 0) * .3, nb = [J.neck[0] - Math.sin(J.lean ?? 0) * .4, J.neck[1] + Math.cos(J.lean ?? 0) * .4]; o.head(xf.w(nb), ld + xf.a, nb); }
  xf.on();
  // the far arm (when it's free: flailing) behind everything, a shade paler
  if (J.hand2) {
    const e2 = J.elbow2 || h2IK(J.sh, J.hand2, lu, lf, J.bend2 ?? H2_ELBOW), sk = mixCol(silk, BANK.paper, .3);
    J = { ...J, hand2: reach(e2, J.hand2, lf) };
    grip2 = [J.hand2[0] + (J.hand2[0] - e2[0]) * .35, J.hand2[1] + (J.hand2[1] - e2[1]) * .35];
    h2UnionDraw(h2Union([{ nm: 'upper', root: J.sh, tip: e2, base: st, ink: sk, wk: 1.3 }, { nm: 'fore', root: e2, tip: J.hand2, base: st, ink: sk, wk: 1.3 }]));
    glove(J.hand2, e2);
  }
  if (J.seated === false && J.stirrup) {   // out of the irons: the stirrups flung back in the wind from the saddle
    const top = J.stirrup, a = J.stirrupA ?? .6, ft = [top[0] - Math.sin(a) * 1.7, top[1] + Math.cos(a) * 1.7], T = [];
    const Ls = through([top, [lerp(top[0], ft[0], .5) + .06, lerp(top[1], ft[1], .5) + .1], ft], 5); bankSwell(T, Ls, Ls.map(() => .1), 0);
    const c = Math.cos(a), sn = Math.sin(a), R = (u, v) => [ft[0] + u * c - v * sn, ft[1] + u * sn + v * c];
    const ir = []; for (let i = 0; i <= 12; i++) { const th = Math.PI * i / 12; ir.push(R(-Math.cos(th) * .3, Math.sin(th) * .42)); }
    bankSwell(T, ir, ir.map(() => .075), 0); bankSwell(T, [R(-.34, .38), R(.34, .38)], [.1, .1], 0);
    h2Tris(T, dark);
  }
  if (J.seated !== false) {   // the stirrup: a leather from the saddle's bar down to an iron under the ball of his foot
    const top = [J.hip[0] + .35, J.hip[1] + .2], ft = [J.foot[0] + .35, J.foot[1] + .1], T = [];
    bankSwell(T, [top, ft], [.09, .09], 0);
    const ir = [[ft[0] - .28, ft[1] - .05], [ft[0] - .3, ft[1] + .22], [ft[0] + .32, ft[1] + .22], [ft[0] + .3, ft[1] - .05]];
    bankSwell(T, ir, ir.map(() => .07), 0); h2Tris(T, dark);
  }
  // his body as one figure: silks, breeches, boots (each part its own tone and ink; the boot's top a band)
  h2UnionDraw(h2Union([
    { nm: 'torso', root: J.hip, tip: J.neck, base: st, ink: silk, wk: 1.45, deco: o.hoops ? T => { for (const hv of [-.7, -1.6]) { const a = h2PoseP('torso', J.hip, J.neck, [-.6, hv + .08]), b = h2PoseP('torso', J.hip, J.neck, [.66, hv - .06]); bankSwell(T, [a, b], [.2, .2], 0); } } : null },
    { nm: 'thigh', root: J.hip, tip: knee, base: .12, ink: pale },
    { nm: 'shin', root: knee, tip: J.foot, base: .78, ink: dark, wk: 1.7 },
  ], key && key + 'b'));
  // his near arm, over his body, then the glove
  h2UnionDraw(h2Union([{ nm: 'upper', root: J.sh, tip: elbow, base: st, ink: silk, wk: 1.45 }, { nm: 'fore', root: elbow, tip: J.hand, base: st, ink: silk, wk: 1.45 }], key && key + 'a'));
  glove(J.hand, elbow);
  const g = [J.hand[0] + (J.hand[0] - elbow[0]) * .35, J.hand[1] + (J.hand[1] - elbow[1]) * .35];
  xf.off();
  return { knee, elbow, grip: xf.w(g), gripB: g, grip2: grip2 && xf.w(grip2), grip2B: grip2 };
}
// a point of a part's rest outline, posed from root to tip (body frame)
function h2PoseP(nm, root, tip, p) {
  const J = H2J[nm], da = Math.atan2(tip[1] - root[1], tip[0] - root[0]) - Math.atan2(J.tip[1] - J.root[1], J.tip[0] - J.root[0]), c = Math.cos(da), s = Math.sin(da), dx = p[0] - J.root[0], dy = p[1] - J.root[1];
  return [root[0] + dx * c - dy * s, root[1] + dx * s + dy * c];
}
// The caricature heads (the rigs' own: drawn in the bank figure line), placed by their neck: hh = the head's height
// (chin to crown) and neck = the neck's base above the rig's (x, y), dx its offset, in the rig's u (measured off
// LOOPS.h2heads). Zuckerberg's rig has no head layer: he's drawn seated and clipped above his neck.
const H2HEAD = {
  altman: { hh: 5.6, neck: 6.4, dx: .3, draw: (x, y, u, o) => altman(x, y, u, { layer: 'head', view: 'q', idle: 0, noShadow: true, ...o }) },
  musk:   { hh: 7.0, neck: 7.9, dx: 0, draw: (x, y, u, o) => musk(x, y, u, { layer: 'head', view: 'q', idle: 0, noShadow: true, ...o }) },
  zuck:   { hh: 5.0, neck: 7.15, dx: .1, clip: true, draw: (x, y, u, o) => zuck(x, y, u, { view: 'q', idle: 0, seated: true, pose: 'low', noShadow: true, ...o }) },
};
// a head at the neck point n (world px), turned by ang, hpx tall (chin to crown); o: the rig's options (face, mood)
function h2Head(who, n, ang, hpx, o = {}) {
  const H = H2HEAD[who]; if (!H) return;
  const u = hpx / H.hh;
  flushBrush(); push(); translate(n[0], n[1]); rotate(ang);
  if (H.clip) h2ClipOn(h2Fan([[-5, -16], [5, -16], [5, -.1], [-5, -.1]].map(([cx, cy]) => [cx * u, cy * u])));
  H.draw(-H.dx * u, H.neck * u, u, o);
  if (H.clip) h2ClipOff(); else flushBrush();
  pop();
}
// the red silks' rider (the race from the lyric, no one in particular): an engraved head in a silk cap and goggles
H2J.jhead = { root: [0, 0], tip: [.2, -1.9], P: [[-.3, 0], [-.55, -.5], [-.62, -1.2], [-.4, -1.75], [.1, -1.98], [.55, -1.8], [.72, -1.35], [.95, -1.05], [.78, -.85], [.72, -.45], [.45, -.2], [.25, .05]] };
H2J.jcap = { root: [0, 0], tip: [.2, -1.9], P: [[-.62, -1.2], [-.5, -1.72], [.1, -2.05], [.6, -1.85], [.8, -1.42], [1.35, -1.3], [.75, -1.22], [.1, -1.25]] };
function h2CapHead(n, ang, s, col) {
  // (drawn in the body frame by the caller's xf: n, a body-frame neck point; s unused)
  const L3 = h2Light(), tip = [n[0] + Math.sin(ang) * 1.9, n[1] - Math.cos(ang) * 1.9];
  h2Part('jhead', n, tip, { L: L3, base: .28, ink: h2Ink('#5A4638', .5) });
  h2Part('jcap', n, tip, { L: L3, base: .22, ink: h2Ink(col, .62) });
}
// the bit (body frame): on the head's axis from the poll to the muzzle, back from the tip and down toward the jaw
function h2Bit(Fr) { const q = h2HeadFrame(Fr).at(.8, .72); return h2L2B(Fr.src.body, q[0], q[1]); }
// a rein from a to b (body frame), sagging by slack (units), in the figure's ink
function h2Rein(a, b, slack, px) {
  const P = []; for (let i = 0; i <= 8; i++) { const f = i / 8; P.push([lerp(a[0], b[0], f), lerp(a[1], b[1], f) + Math.sin(f * Math.PI) * slack]); }
  h2Strap(P, Math.max(.07, 2.2 / px), h2Ink('#2E2622', .6), px);
}
// a low racing saddle on a cloth, under the rider's seat (body frame)
function h2Saddle(Fr, J, col) {
  const b = Fr.src.body, seat = h2L2B(b, ...Fr.src.rSeat), L3 = h2Light(), px = bankPx(), F = h2Field(Fr.key, Fr.h);
  // the horse's back line under the seat (body frame): the top of the silhouette, sampled
  const top = u => { for (let v = -3.5; v < 1.5; v += .04) { const q = h2B2L(b, u, v); if (h2At(F, q[0], q[1])[0] > 0) return v; } return seat[1] + .3; };
  const c = seat[0] + .75, U0 = c - 1.15, U1 = c + 1.05, n = 10, back = [];
  for (let i = 0; i <= n; i++) { const u = lerp(U0, U1, i / n); back.push([u, top(u) + .06]); }
  // the cloth (his colours): along the back, hanging ~.75 down; the saddle: low, a little rise at the pommel and cantle
  const cloth = back.slice().concat([[U1 - .1, back[n][1] + .72], [U0 + .15, back[0][1] + .76]]);
  const seatP = [], seatB = [], S0 = U0 + .3, S1 = U1 - .25;
  for (let i = 0; i <= n; i++) { const f = i / n, u = lerp(S0, S1, f); seatP.push([u, top(u) - .1 - .12 * Math.pow(Math.max(0, (f - .8) / .2), 2) - .08 * Math.pow(Math.max(0, (.15 - f) / .15), 2)]); }
  for (let i = n; i >= 0; i--) { const u = lerp(S0 + .1, S1 - .05, i / n); seatB.push([u, top(u) + .16]); }
  const flap = [[c - .45, top(c - .45) + .14], [c + .4, top(c + .4) + .14], [c + .34, top(c + .34) + .55], [c - .4, top(c - .4) + .52]];
  const draw = (Q, col2, t, a) => {
    h2Tris(h2Fan(Q), BANK.paper);
    const M = { T: [], px, ink: col2, L: L3, clip: null }; h2Rule(M, Q, t, a); h2Edge(M, Q, 1.1); h2Tris(M.T, M.ink);
  };
  draw(h2Smooth(cloth, 2), h2Ink(col, .6), .42, 1.45);
  draw(h2Smooth(flap, 2), h2Ink('#3A2A1E', .6), .5, .15);
  draw(h2Smooth(seatP.concat(seatB), 2), h2Ink('#2A1E16', .66), .62, .05);
}
// A horse and its jockey. who: 'altman' | 'musk' | 'zuck' | 'silks' (null: riderless); J: a pose (default: seated on
// this frame, o.lean); o.head: the rig's face options. Returns horse2's anchors plus { grip } (the rein hand, world).
function h2Ride(x, y, s, o = {}) {
  const hz = bankFigure(() => horse2(x, y, s, o));
  if (!o.who) return hz;
  const Fr = h2Frame(hz.f), b0 = Fr.src.body, b = [b0[0], b0[1], b0[2] + (o.tilt || 0)];
  const xf = { a: b[2], on: () => { push(); translate(x, y); scale(s); translate(b[0], b[1]); rotate(b[2]); }, off: () => pop(),
    w: p => { const q = h2B2L(b, p[0], p[1]); return [x + q[0] * s, y + q[1] * s]; } };
  const J = typeof o.J === 'function' ? o.J(Fr, b) : o.J || h2SeatPose(Fr, { lean: o.lean ?? .45 });
  const SILK = { altman: ['#3A5A8A', false], musk: ['#26262E', false], zuck: ['#2A62B0', true], silks: ['#C8323A', true] }[o.who] || ['#3A5A8A', false];
  // the saddle (a low racing saddle on a cloth in his colours) under him, on the shell
  xf.on(); bankFigure(() => h2Saddle(Fr, J, o.silk || SILK[0])); xf.off();
  const out = bankFigure(() => h2Jockey(J, xf, { key: o.J ? null : 'seat' + hz.f + '|' + (o.lean ?? .45) + '|' + o.who + (o.silk || ''), silk: o.silk || SILK[0], hoops: o.hoops ?? SILK[1], silkTone: o.who === 'musk' ? .72 : .62,
    head: o.who === 'silks' ? (nw, ang, nb) => { xf.on(); h2CapHead(nb, J.headA ?? J.lean * .3, s, SILK[0]); xf.off(); } : (nw, ang) => h2Head(o.who, nw, ang, s * (o.headK ?? 2.0), o.face || {}) }));
  // the reins: from his hands to the bit (a pressured engraved line), unless the caller draws its own
  if (o.reins !== false) { const bit = h2Bit(Fr), bw = xf.w(bit); xf.on(); bankFigure(() => h2Rein(out.gripB, bit, o.slack ?? .25, bankPx())); xf.off(); hz.bit = bw; }
  return { ...hz, grip: out.grip, grip2: out.grip2, bitW: xf.w(h2Bit(Fr)), J, xf, Fr, b };
}

// ======================================================================================================================
// model sheets
// ======================================================================================================================
LOOPS.horse2 = t => {
  look('bank'); _paint([[-60, -60], [W + 60, -60], [W + 60, H + 60], [-60, H + 60]], { wash: BANK.paper, ink: null });
  const q = new URLSearchParams(location.search), coat = q.get('coat') || 'jet', who = q.get('who') || 'altman', win = q.get('win') !== '0';
  for (let i = 0; i < 12; i++) {
    const c = i % 4, r = Math.floor(i / 4), x = 270 + c * 465, y = 345 + r * 350, s = 20;
    dline([[x - 215, y], [x + 215, y]], .8, BANK.ink);
    h2Ride(x, y, s, { ph: i < 11 ? i / 11 + .01 : null, coat, who, windows: win, key: 'm' + i });
  }
};
LOOPS.horse2.len = 1;
LOOPS.horse2run = t => {
  look('bank'); _paint([[-60, -60], [W + 60, -60], [W + 60, H + 60], [-60, H + 60]], { wash: BANK.paper, ink: null });
  const q = new URLSearchParams(location.search), coat = q.get('coat') || 'jet', f = +(q.get('f') ?? 6), who = q.get('who') || 'altman';
  dline([[0, 1000], [W, 1000]], 1, BANK.ink);
  h2Ride(900, 1000, +(q.get('s') ?? 64), { ph: f === 11 ? null : f / 11 + .01, coat, who, key: 'run', windows: q.get('win') !== '0' });
};
LOOPS.horse2run.len = 1;
// (a test bed for placing the rigs' heads: each drawn with (x, y) = the cross, u = 40)
LOOPS.h2heads = t => {
  look('bank'); _paint([[-60, -60], [W + 60, -60], [W + 60, H + 60], [-60, H + 60]], { wash: BANK.paper, ink: null });
  const u = 40;
  altman(400, 900, u, { layer: 'head', view: 'q', idle: 0 });
  musk(960, 900, u, { layer: 'head', view: 'q', idle: 0 });
  zuck(1520, 900, u, { view: 'q', idle: 0, seated: true, pose: 'low' });
  for (const x of [400, 960, 1520]) { dline([[x - 400, 900], [x + 400, 900]], .6, '#C00'); dline([[x, 100], [x, 1000]], .6, '#C00'); for (let k = 1; k < 20; k++) dline([[x - 10, 900 - k * u], [x + 10, 900 - k * u]], .6, '#C00'); }
};
LOOPS.h2heads.len = 1;
// (a test bed: the jockey alone, big: ?pose=seat|flag)
LOOPS.h2jockey = t => {
  look('bank'); _paint([[-60, -60], [W + 60, -60], [W + 60, H + 60], [-60, H + 60]], { wash: new URLSearchParams(location.search).get('dark') ? '#806060' : BANK.paper, ink: null });
  const s = 110, x = 700, y = 820, q = new URLSearchParams(location.search);
  const xf = { a: 0, on: () => { push(); translate(x, y); scale(s); }, off: () => pop(), w: p => [x + p[0] * s, y + p[1] * s] };
  const J = q.get('pose') === 'flag' ? { hip: [-2.6, -1.2], neck: [-.1, -1.55], sh: [-.35, -1.5], hand: [1.1, -2.6], hand2: [.3, -.2], foot: [-4.9, -1.6], lean: -1.45, seated: false, headA: -.4 }
    : { hip: [0, 0], neck: [1.1, -2.4], sh: [.95, -2.1], hand: [2.2, -1.2], foot: [1.4, 2.7], lean: .45 };
  bankFigure(() => h2Jockey(J, xf, { silk: '#3A5A8A', silkTone: .62, head: (nw, ang) => h2Head('altman', nw, ang, s * 2.0, {}) }));
};
LOOPS.h2jockey.len = 1;

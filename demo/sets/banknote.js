// sets/banknote.js: THE BANKNOTE, the look of money and power ('bank': banknote intaglio). Capital is printed like
// currency. A note fills the frame: security paper, a guilloche border, rosettes where the numerals would be, microline
// bands where the lettering would be, a windowed security thread, and two engraved portraits in ornate ovals, the way the
// monarch sits on a British note: Musk on the left, Zuckerberg on the right, both in 3/4, facing in. The central vignette
// is the bunker (sets/bunker.js: the real set and cast, engraved). The camera pushes into the vignette and it comes
// alive: the toast and the clink. It freezes back into print, the camera pulls out, the portraits turn to look at us and
// grin, and the note is stamped as a bill (a red rubber stamp: a clock face, no words). Then it's yanked down out of
// frame, to us. Chorus: "You get the bunker; I get the bill." No text anywhere: every place a note would carry words or
// numbers holds ornament instead.
//
// LOOPS.banknote (18 beats: 7.7 s at 140 bpm, 7.9 s at 136.7), loop time, all times in beats (BEAT), look('bank'):
//   0 - 1      the note drops in from above, fluttering, and lands on beat 1
//   1 - 4.5    hold on the whole note (slow drift in): banknote, Musk and Zuck as the portraits, the bunker vignette
//   4.5 - 7    push into the vignette
//   7          ALIVE: the vignette starts to move; Grok pours, Muse hovers
//   8 - 9      they raise their glasses; CLINK on beat 9; Musk laughs
//   10.5       it freezes back into print; the camera pulls out (10.5 - 13)
//   13.4, 14   the portrait's eyes slide round to us, then Musk turns and grins at us; Zuck's eyes snap to us (14.1),
//              his head servos round (14.5), stiff smile, then a shutter blink
//   15, 15.5   the bill's red band is struck across the bank's cartouche, then STAMP: the red clock stamp slams on, the
//              camera shakes
//   17 - 18    the bill lifts a hair and is yanked down out of frame: bare paper, as it began
// Engraving scale: the vignette is the real bunker drawn in its own world coordinates, so at the note's scale its lines
// would be sub-pixel (and cost as much as the full set). bnEngrave() draws a layer at an engraving scale S (every line
// weight, spacing and wave length of the bank look × S, the line grid anchored at a point), caps its tone, sets its
// colour, and inks each piece in the note's ink. Through the push the vignette's lines first magnify with the zoom
// (it's a print), then hold their size on screen, anchored at the zoom's focus, so they never swim or pop.
(() => {
  const B = BEAT;
  const TM = {
    land: 1 * B, push: [4.5 * B, 7 * B], alive: 7 * B, clink: 9 * B, freeze: 10.5 * B, pull: [10.5 * B, 13 * B],
    turnM: 14 * B, turnZ: 14.5 * B, stamp: 15.5 * B, yank: [17 * B, 18 * B], len: 18 * B,
  };
  const INK0 = BANK.ink;   // (the house note's teal)
  const STAMP_INK = '#B5392C';                 // the bill's red: an overprint in a second ink
  // the note's secondary inks (dull; its line work mixes them with the note's ink)
  const TINT = { gold: '#A8843A', green: '#52806A', rose: '#A05A66', blue: '#526C9C' };

  // ---------- geometry ----------
  // The note in note px (origin at its centre; 1 note px = 1 screen px when the whole note is framed). The vignette
  // window [VX0, VX1] × [VY0, VY1] shows the bunker world through WIN (world px): K world px = 1 note px.
  const NW = 1840, NH = 1000, NX0 = -NW / 2, NX1 = NW / 2, NY0 = -NH / 2, NY1 = NH / 2;
  const WIN = { x0: -30, x1: 1950, y0: -22, y1: 1098 };
  const VW = 700, K = (WIN.x1 - WIN.x0) / VW, VH = (WIN.y1 - WIN.y0) / K, VCX = 0, VCY = -14;
  const VX0 = VCX - VW / 2, VX1 = VCX + VW / 2, VY0 = VCY - VH / 2, VY1 = VCY + VH / 2;
  const OX = WIN.x0 - VX0 * K, OY = WIN.y0 - VY0 * K;   // the note's centre in world px
  const Z0 = 1 / K, ZH = Z0 * 1.04;                       // the zoom that frames the note, and after the drift in
  const PORT = { L: { cx: -618, cy: -14, rx: 188, ry: 280 }, R: { cx: 618, cy: -14, rx: 188, ry: 280 } };
  const RING = 26;                                        // the portrait frames' guilloche ring
  const ALIVE = { cx: 972, cy: 566, zoom: 1.3 };          // the framing inside the vignette (world px)
  // the zoom's focus: the world point that stays put on screen through the push and the pull
  const FX = (ALIVE.cx - OX * ZH / ALIVE.zoom) / (1 - ZH / ALIVE.zoom), FY = (ALIVE.cy - OY * ZH / ALIVE.zoom) / (1 - ZH / ALIVE.zoom);
  // the vignette's engraving scale at zoom z: magnifies with the zoom up to ZM, then holds its size on screen
  const S0 = K, ZM = Z0 * 1.75, vigS = z => S0 * Math.min(1, ZM / z);

  // ---------- helpers ----------
  const smooth = x => { x = clamp(x); return x * x * x * (x * (6 * x - 15) + 10); };
  const mat = () => { try { return p5.instance._renderer.states.uModelMatrix.mat4; } catch (e) { return null; } };
  const scr = (x, y) => { const m = mat(); return m ? [m[0] * x + m[4] * y + m[12] + W / 2, m[1] * x + m[5] * y + m[13] + H / 2] : [x, y]; };
  // the ink at a point (local coordinates), and a piece's: the note's ink
  const inkAt = (x, y) => INK0;
  const inkOfP = P => INK0;
  // a secondary ink at a point: the note's ink mixed toward a dull, darkened tint (by k)
  const tintAt = (col, x, y, k = .6) => mixCol(inkAt(x, y), mixCol(desat(col, .7), '#16121A', .22), k);
  // Is a box (local coordinates) on screen? (skips what the camera can't see: the note is enormous inside the vignette)
  const onScreen = (x0, y0, x1, y1) => { const a = scr(x0, y0), b = scr(x1, y1); return Math.max(a[0], b[0]) > -40 && Math.min(a[0], b[0]) < W + 40 && Math.max(a[1], b[1]) > -40 && Math.min(a[1], b[1]) < H + 40; };
  // Draw a layer in the bank look at engraving scale S (line grid anchored at o.at), tone cap, colour (see the header).
  function bnEngrave(o, fn) {
    const S = o.S ?? 1, cap = o.cap ?? 1, [ax, ay] = o.at || [0, 0], ow = o.ow ?? 1;
    const sv = { wl: waveLines, el: edgeLine, dl: dline, fr: fillRegion, ink: BANK.ink, colour: BANK.colour, engS: BANK.engS };
    BANK.colour = o.colour ?? 1; BANK.engS = S;   // (engS: the scale for style.js's figure geometry)
    waveLines = (P, d, a, amp, wl, c, w) => { push(); translate(ax, ay); sv.wl(P.map(([x, y]) => [x - ax, y - ay]), d * S, a, amp * S, wl * S, c, w * S); pop(); };
    fillRegion = (P, c, op = {}) => { BANK.ink = inkOfP(P); sv.fr(P, c, cap < 1 ? { ...op, maxTone: Math.min(op.maxTone ?? 1, cap) } : op); };
    edgeLine = (P, sw = 1, c, closed, curv = 0) => { BANK.ink = inkOfP(P); sv.el(P, sw * S * ow, c, closed, curv); };
    dline = (P, sw = 1, c = NOIR.ink, curv = 0) => { BANK.ink = inkOfP(P); sv.dl(P, sw * S, c, curv); };
    try { fn(); } finally { waveLines = sv.wl; edgeLine = sv.el; dline = sv.dl; fillRegion = sv.fr; BANK.ink = sv.ink; BANK.colour = sv.colour; BANK.engS = sv.engS; }
  }
  // Run fn with the global clock at tf (characters read T for blinks and idles): freezes a layer into print.
  function atT(tf, fn) { const T0 = T; T = tf; try { fn(); } finally { T = T0; } }
  const line = (P, w, col) => { for (let j = 0; j < P.length - 1; j += 24) _inkLine(P.slice(j, j + 25), w, col, 'rotring', .3); };
  const ring = (cx, cy, rx, ry, n = 72) => { const P = oval(cx, cy, rx, ry, 0, n); return P.concat([P[0]]); };
  const wash = (P, col) => _paint(P, { wash: col, washOp: 255, ink: null });
  const paperCol = () => BANK.paper;
  const underCol = () => mixCol(mixCol(BANK.paper, BANK.tint, .9), INK0, .1);
  // A guilloche band along the segment a → b: n interlaced waves, h high, wavelength wl; inked per chunk (col(x, y)).
  function band(a, b, h, o = {}) {
    const n = o.n ?? 5, wl = o.wl ?? 40, w = o.w ?? .55, L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L, nx = -uy, ny = ux;
    const col = o.col || ((x, y) => inkAt(x, y));
    for (let i = 0; i < n; i++) {
      const ph = i / n * TAU, pts = [];
      for (let s = 0; s <= L; s += 5) { const off = Math.sin(s / wl * TAU + ph) * h / 2 * (o.env ? o.env(s / L) : 1); pts.push([a[0] + ux * s + nx * off, a[1] + uy * s + ny * off]); }
      for (let j = 0; j < pts.length - 1; j += 24) { const P = pts.slice(j, j + 25), m = P[P.length >> 1]; _inkLine(P, w, col(m[0], m[1]), 'rotring', .3); }
    }
  }
  // A rosette medallion: an outer guilloche ring and an inner flower in two secondary inks, ink rules; r = outer radius.
  function rosette(cx, cy, r, o = {}) {
    const ink = inkAt(cx, cy), c1 = tintAt(o.c1 || TINT.gold, cx, cy), c2 = tintAt(o.c2 || TINT.rose, cx, cy), w = o.w ?? .5;
    wash(oval(cx, cy, r * 1.03, r * 1.03, 0, 40), paperCol());
    guilloche(cx, cy, r * .7, r * .97, { n: o.n1 ?? 12, lobes: o.lobes1 ?? 18, col: c1, w, steps: 300 });
    guilloche(cx, cy, r * .14, r * .62, { n: o.n2 ?? 9, lobes: o.lobes2 ?? 8, col: c2, w, twist: .8, beat: 4, steps: 240 });
    line(ring(cx, cy, r, r, 60), w * 1.8, ink); line(ring(cx, cy, r * .67, r * .67, 48), w * 1.2, ink);
    line(ring(cx, cy, r * .08, r * .08, 16), w * 1.2, ink);
  }

  // ---------- the camera ----------
  // The note drops in (0 - 1), drifts in slowly, zooms about the focus into the vignette, holds on the live bunker,
  // zooms back out, shakes on the stamp, and is yanked down (17 - 18). Returns { cx, cy, zoom, rot }.
  function bnCam(t) {
    const zN = Z0 * (1 + .04 * ease(seg(t, TM.land, TM.push[0]))), zA = ALIVE.zoom * (1 + .025 * ease(seg(t, TM.alive, TM.freeze)));
    const k = t < TM.pull[0] ? smooth(seg(t, ...TM.push)) : 1 - smooth(seg(t, ...TM.pull));
    let zoom = zN, cx = OX, cy = OY;
    if (k > 0) { zoom = Math.exp(lerp(Math.log(zN), Math.log(zA), k)); cx = FX + (OX - FX) * ZH / zoom; cy = FY + (OY - FY) * ZH / zoom; }
    // the drop: falling in from above (accelerating), a flutter, a small settle on landing
    const f = seg(t, 0, TM.land);
    let dy = -(H + 120) * (1 - f * f) + 10 * spring(t, TM.land, 8, 22), rot = .05 * Math.sin(t * 13) * (1 - f) + .012 * spring(t, TM.land, 7, 26);
    // the yank: a small lift, then down and out
    const ya = seg(t, TM.yank[0] - .5 * B, TM.yank[0]), yb = seg(t, ...TM.yank);
    dy += -16 * ease(ya) * (1 - yb) + (H + 160) * Math.pow(yb, 2.2); rot += -.025 * Math.pow(yb, 2);
    // the stamp's impact
    const sk = t > TM.stamp ? 7 * Math.exp(-(t - TM.stamp) * 14) : 0, [sx, sy] = shakeXY(t, sk);
    return { cx: cx - sx / zoom, cy: cy - (dy + sy) / zoom, zoom, rot };
  }

  // ---------- the vignette: the bunker, engraved ----------
  // Frozen into print before ALIVE and after FREEZE; alive between (the clink lands on beat 9).
  const LT0 = BUNKER.times.clink - (TM.clink - TM.alive);
  const vigLt = t => LT0 + clamp(t, TM.alive, TM.freeze) - TM.alive;
  function vignette(t, cam) {
    const lt = vigLt(t);
    // the hall behind is kept light (its tone capped), the diners and the table print at full strength, so they read
    const o = { S: vigS(cam.zoom), at: [FX, FY], colour: .5 };
    atT(lt, () => { bnEngrave({ ...o, cap: .52 }, () => bunkerBack(lt, lt)); bnEngrave({ ...o, cap: .95, ow: 1.4 }, () => bkCast(lt, lt)); });
  }

  // ---------- the portraits ----------
  function portraitGround(p) {
    const P = oval(p.cx, p.cy, p.rx + 4, p.ry + 4, 0, 64), ink = inkAt(p.cx, p.cy);
    wash(P, paperCol());
    // a ground of fine horizontal engraved lines, doubled toward the crown, as behind a monarch's portrait
    waveLines(P, 4.2, 0, .5, 220, ink, .55);
    waveLines(curvy([[p.cx - p.rx, p.cy - p.ry * .1], [p.cx, p.cy - p.ry * 1.02], [p.cx + p.rx, p.cy - p.ry * .1], [p.cx, p.cy - p.ry * .55]], 6), 4.2, 0, .5, 220, ink, .45);
  }
  function portraits(t) {
    const tf = TM.land;   // print: frozen
    // Musk, left, 3/4 facing in; turns to us on beat 14
    {
      const p = PORT.L, u = 48, turned = t >= TM.turnM, tt = turned ? t : tf;
      if (onScreen(p.cx - p.rx - RING, p.cy - p.ry - RING, p.cx + p.rx + RING, p.cy + p.ry + RING)) {
        const face = turned ? emotions(t, [[0, 'smug'], [TM.turnM, 'happy', { mouth: 'grin' }]], { take: .6 }) : emotions(tf, [[0, 'smug']]);
        const y = p.cy + p.ry + 18 + 4.33 * MK_S * u;
        bnEngrave({ colour: .35 }, () => atT(tt, () => musk(p.cx + (turned ? 0 : -14), y, u, {
          ...face, dy: turned ? face.dy : 0, sq: turned ? face.sq : 0, rot: 0, view: turned ? 'front' : 'q', pose: 'idle', seated: true, noShadow: true,
          lookX: turned ? 0 : lerp(.45, -.7, ease(seg(t, TM.turnM - .6 * B, TM.turnM - .4 * B))), lookY: turned ? .05 : 0, boilKey: 'bnmusk', seed: 1.9,
        })));
      }
    }
    // Zuck, right, 3/4 facing in (flipped); a servo snap round to us on beat 14.5, stiff smile, then a shutter blink
    {
      const p = PORT.R, u = 49, turned = t >= TM.turnZ, tt = turned ? t : tf;
      if (onScreen(p.cx - p.rx - RING, p.cy - p.ry - RING, p.cx + p.rx + RING, p.cy + p.ry + RING)) {
        const face = turned ? emotions(t, [[0, 'neutral'], [TM.turnZ, 'happy']], { take: .3 }) : emotions(tf, [[0, 'neutral']]);
        const y = p.cy + p.ry + 18 + 2.66 * u, bl = t - (TM.turnZ + .75 * B), blink = bl > 0 && bl < .16 ? 1 : 0;
        bnEngrave({ colour: .35 }, () => atT(tt, () => zuck(p.cx + (turned ? 0 : 6), y, u, {
          ...face, dy: 0, sq: turned ? (face.sq || 0) * .5 : 0, rot: 0, view: turned ? 'front' : 'q', flip: !turned, pose: 'low', seated: true, noShadow: true,
          robot: false, zmouth: 'stiff', blink, lookX: turned ? 0 : (t > TM.turnZ - .4 * B ? -.8 : .3), boilKey: 'bnzuck', seed: 2,
        })));
      }
    }
  }

  // ---------- the note's paper: the note minus its three windows (two ovals and the vignette) ----------
  function paperPieces() {
    const out = [], e = 1.5, arc = (p, a0, a1) => { const P = []; for (let i = 0; i <= 28; i++) { const a = lerp(a0, a1, i / 28); P.push([p.cx + Math.cos(a) * p.rx, p.cy + Math.sin(a) * p.ry]); } return P; };
    const L = PORT.L, R = PORT.R, rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    out.push(rect(NX0, NY0, L.cx - L.rx + e, NY1));
    for (const p of [L, R]) {
      out.push([[p.cx - p.rx - e, NY0], [p.cx + p.rx + e, NY0], [p.cx + p.rx + e, p.cy], ...arc(p, TAU, Math.PI), [p.cx - p.rx - e, p.cy]]);
      out.push([[p.cx - p.rx - e, p.cy], ...arc(p, Math.PI, 0), [p.cx + p.rx + e, p.cy], [p.cx + p.rx + e, NY1], [p.cx - p.rx - e, NY1]]);
    }
    out.push(rect(L.cx + L.rx - e, NY0, VX0 + e, NY1));
    out.push(rect(VX0 - e, NY0, VX1 + e, VY0 + e));
    out.push(rect(VX0 - e, VY1 - e, VX1 + e, NY1));
    out.push(rect(VX1 - e, NY0, R.cx - R.rx + e, NY1));
    out.push(rect(R.cx + R.rx - e, NY0, NX1, NY1));
    // the vignette's inverted corners
    const rc = 26;
    for (const [x, y, a0] of [[VX0, VY0, 0], [VX1, VY0, Math.PI / 2], [VX1, VY1, Math.PI], [VX0, VY1, 1.5 * Math.PI]]) {
      const P = [[x, y]]; for (let i = 0; i <= 10; i++) { const a = a0 + i / 10 * Math.PI / 2; P.push([x + Math.cos(a) * rc, y + Math.sin(a) * rc]); }
      out.push(P);
    }
    return out;
  }
  function notePaper() {
    const pc = paperCol(), uc = underCol();
    for (const P of paperPieces()) { wash(P, pc); waveLines(P, 9, 12, 3, 140, uc, .5); }
  }

  // ---------- the note's ornament ----------
  function border() {
    const m0 = 14, m1 = 50, mid = (m0 + m1) / 2, h = m1 - m0 - 6;
    const x0 = NX0 + mid, x1 = NX1 - mid, y0 = NY0 + mid, y1 = NY1 - mid;
    const gold = (x, y) => tintAt(TINT.gold, x, y), green = (x, y) => tintAt(TINT.green, x, y);
    band([x0 + 24, y0], [x1 - 24, y0], h, { n: 6, wl: 36, col: gold }); band([x0 + 24, y1], [x1 - 24, y1], h, { n: 6, wl: 36, col: gold });
    band([x0, y0 + 24], [x0, y1 - 24], h, { n: 6, wl: 36, col: green }); band([x1, y0 + 24], [x1, y1 - 24], h, { n: 6, wl: 36, col: green });
    for (const [x, y] of [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]) rosette(x, y, 24, { n1: 10, lobes1: 12, n2: 6, lobes2: 6, c1: TINT.green, c2: TINT.gold });
    const rule = (m, w) => { for (const [a, b] of [[[NX0 + m, NY0 + m], [NX1 - m, NY0 + m]], [[NX1 - m, NY0 + m], [NX1 - m, NY1 - m]], [[NX1 - m, NY1 - m], [NX0 + m, NY1 - m]], [[NX0 + m, NY1 - m], [NX0 + m, NY0 + m]]]) { const P = []; for (let s = 0; s <= 1; s += 1 / 16) P.push([lerp(a[0], b[0], s), lerp(a[1], b[1], s)]); line(P, w, inkAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)); } };
    rule(m0 - 4, 1.4); rule(m1 + 3, 1.1); rule(m1 + 7, .5);
  }
  // A guilloche ring round an oval: n interlaced lobed curves between offsets o0 and o1 outside the oval (px).
  function ovalGuilloche(p, o0, o1, n, lobes, col, w = .5) {
    for (let i = 0; i < n; i++) {
      const ph = i / n * TAU, pts = [];
      for (let k = 0; k <= 720; k++) { const a = k / 720 * TAU, off = lerp(o0, o1, .5 + .5 * Math.sin(lobes * a + ph)); pts.push([p.cx + Math.cos(a) * (p.rx + off), p.cy + Math.sin(a) * (p.ry + off)]); }
      line(pts, w, col);
    }
  }
  function ovalFrame(p) {
    const ink = inkAt(p.cx, p.cy);
    ovalGuilloche(p, 5, RING - 2, 9, 46, tintAt(TINT.gold, p.cx, p.cy));
    line(ring(p.cx, p.cy, p.rx, p.ry, 96), 1.6, ink);
    line(ring(p.cx, p.cy, p.rx + 4, p.ry + 4, 96), .6, ink);
    line(ring(p.cx, p.cy, p.rx + RING + 2, p.ry + RING + 2, 96), 1.2, ink);
    // beads round the outside, a rosette at the foot and the crown
    for (let i = 0; i < 64; i++) { const a = i / 64 * TAU, x = p.cx + Math.cos(a) * (p.rx + RING + 9), y = p.cy + Math.sin(a) * (p.ry + RING + 9); wash(oval(x, y, 2.2, 2.2, 0, 8), ink); }
    rosette(p.cx, p.cy + p.ry + RING + 4, 30, { n1: 10, lobes1: 14, n2: 7, lobes2: 7 });
    rosette(p.cx, p.cy - p.ry - RING - 4, 22, { n1: 8, lobes1: 12, n2: 6, lobes2: 6 });
  }
  function vignetteFrame() {
    const ink = inkAt(VCX, VCY), g = 16, x0 = VX0 - 6 - g / 2, x1 = VX1 + 6 + g / 2, y0 = VY0 - 6 - g / 2, y1 = VY1 + 6 + g / 2, blue = (x, y) => tintAt(TINT.blue, x, y);
    band([x0 + 30, y0], [x1 - 30, y0], g, { n: 5, wl: 26, col: blue }); band([x0 + 30, y1], [x1 - 30, y1], g, { n: 5, wl: 26, col: blue });
    band([x0, y0 + 30], [x0, y1 - 30], g, { n: 5, wl: 26, col: blue }); band([x1, y0 + 30], [x1, y1 - 30], g, { n: 5, wl: 26, col: blue });
    // the window's edge (with its inverted corners) and the outer rules
    const rc = 26, E = [];
    for (const [x, y, a0] of [[VX0, VY0, Math.PI / 2], [VX1, VY0, Math.PI], [VX1, VY1, 1.5 * Math.PI], [VX0, VY1, 0]]) for (let i = 0; i <= 8; i++) { const a = a0 - i / 8 * Math.PI / 2; E.push([x + Math.cos(a) * rc, y + Math.sin(a) * rc]); }
    E.push(E[0]); line(E, 1.6, ink);
    const rr = (m, w) => { const P = [[VX0 - m, VY0 - m], [VX1 + m, VY0 - m], [VX1 + m, VY1 + m], [VX0 - m, VY1 + m], [VX0 - m, VY0 - m]], Qp = []; for (let i = 0; i < 4; i++) for (let s = 0; s < 1; s += 1 / 12) Qp.push([lerp(P[i][0], P[i + 1][0], s), lerp(P[i][1], P[i + 1][1], s)]); Qp.push(P[0]); line(Qp, w, ink); };
    rr(4, .6); rr(g + 8, 1.3);
    for (const [x, y] of [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]) rosette(x, y, 20, { n1: 8, lobes1: 12, n2: 6, lobes2: 6, c1: TINT.blue });
  }
  function ornaments() {
    // fine wavy-line fields, domed over and under the vignette (a quiet colour ground behind the ornament)
    const fy0 = VY0 - 40, fy1 = VY1 + 40;
    const top = curvy([[-372, fy0], [-330, fy0 - 70], [-180, NY0 + 96], [0, NY0 + 78], [180, NY0 + 96], [330, fy0 - 70], [372, fy0], [0, fy0 + 4]], 8);
    const bot = curvy([[-372, fy1], [0, fy1 - 4], [372, fy1], [330, fy1 + 70], [180, NY1 - 96], [0, NY1 - 78], [-180, NY1 - 96], [-330, fy1 + 70]], 8);
    for (const [P, c] of [[top, TINT.green], [bot, TINT.blue]]) {
      waveLines(P, 4.6, 0, 1.4, 46, mixCol(tintAt(c, 0, 0, .5), BANK.paper, .25), .62); waveLines(P, 9.2, 0, 2.4, 130, mixCol(tintAt(TINT.rose, 0, 0, .5), BANK.paper, .25), .58);
      line(P.concat([P[0]]), .7, mixCol(inkAt(0, 0), BANK.paper, .25));   // a fine rule round the field
    }
    // top: where the bank's name would be, a cartouche of microlines between two rosettes
    const ty = NY0 + 112, tw = 272, th = 26;
    const pill = []; for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + i / 12 * Math.PI; pill.push([tw + Math.cos(a) * th, ty + Math.sin(a) * th]); } for (let i = 0; i <= 12; i++) { const a = Math.PI / 2 + i / 12 * Math.PI; pill.push([-tw + Math.cos(a) * th, ty + Math.sin(a) * th]); }
    wash(pill, paperCol());
    for (let i = 0; i < 9; i++) { const y = ty - 18 + i * 4.5, hw = tw + Math.sqrt(Math.max(0, th * th - (y - ty) ** 2)) - 6, P = []; for (let x = -hw; x <= hw; x += 4) P.push([x, y + Math.sin(x / 8 + i * 1.3) * 1.1]); line(P, .9, tintAt(TINT.rose, 0, ty, .45)); }
    line(pill.concat([pill[0]]), 1.3, inkAt(0, ty));
    const pill2 = pill.map(([x, y]) => [x * (tw + th + 8) / (tw + th), ty + (y - ty) * (th + 8) / th]); line(pill2.concat([pill2[0]]), .5, inkAt(0, ty));
    for (const sd of [-1, 1]) rosette(sd * (tw + th + 44), ty, 30, { n1: 10, lobes1: 14, n2: 7, lobes2: 7 });
    // bottom: a medallion where the serial numbers would be, flanked by microline bands
    const by = NY1 - 118;
    rosette(0, by, 62, { c1: TINT.blue, c2: TINT.gold });
    for (const s of [-1, 1]) {
      band([s < 0 ? -330 : 84, by], [s < 0 ? -84 : 330, by], 34, { n: 9, wl: 64, w: .55, col: (x, y) => tintAt(TINT.rose, x, y) });
      rosette(s * 360, by, 24, { n1: 8, lobes1: 12, n2: 6, lobes2: 6 });
    }
    // the corners, where the numerals would be: two big medallions and two small
    rosette(NX0 + 132, NY0 + 128, 66, { c1: TINT.gold, c2: TINT.green });
    rosette(NX1 - 132, NY1 - 128, 66, { c1: TINT.gold, c2: TINT.green });
    rosette(NX1 - 118, NY0 + 118, 44, { c1: TINT.blue, c2: TINT.rose, n1: 12, lobes1: 16 });
    rosette(NX0 + 118, NY1 - 118, 44, { c1: TINT.blue, c2: TINT.rose, n1: 12, lobes1: 16 });
    // the windowed security thread between Musk's frame and the vignette
    const thx = (PORT.L.cx + PORT.L.rx + RING + VX0 - 30) / 2;
    for (let y = NY0 + 60; y < NY1 - 60; y += 44) {
      const P = [[thx - 5, y], [thx + 5, y], [thx + 5, y + 26], [thx - 5, y + 26]], c = inkAt(thx, y);
      wash(P, mixCol(c, paperCol(), .3));
      for (let k = 0; k < 3; k++) _inkLine([[thx - 4, y + 6 + k * 7], [thx + 4, y + 9 + k * 7]], .5, paperCol(), 'rotring', 0);
    }
  }

  // ---------- the stamp ----------
  // A rubber stamp in red: a double ring round a clock face (ticks, two hands at five to nine), slammed on at an angle.
  function stamp(t) {
    // first the bill's red band, struck across the bank's cartouche (half a beat before the stamp)
    const ab = t - (TM.stamp - .5 * B);
    if (ab >= 0) {
      const ty = NY0 + 112, hw = 392, sb = 1 + .25 * Math.pow(1 - clamp(ab / .06), 2);
      push(); translate(0, ty); rotate(-.012); scale(sb);
      // a letterpress bar: tight red rules, a few worn gaps, a hairline frame
      for (let i = 0; i < 17; i++) { const y = -26 + i * 3.25; for (let x = -hw; x < hw; x += 64) { if (hash(i * 13.1 + x) < .05) continue; _inkLine([[x, y], [Math.min(hw, x + 66), y + (hash(i + x + 1) - .5) * .5]], 3.3, STAMP_INK, 'rotring', 0); } }
      for (const y of [-33, 33]) _inkLine([[-hw - 6, y], [hw + 6, y]], 1.8, STAMP_INK, 'rotring', 0);
      for (const x of [-hw - 6, hw + 6]) _inkLine([[x, -33], [x, 33]], 1.8, STAMP_INK, 'rotring', 0);
      pop();
    }
    const a = t - TM.stamp; if (a < 0) return;
    const cx = 170, cy = 92, r = 198, rot = -.26, s = 1 + .35 * Math.pow(1 - clamp(a / .07), 2);
    push(); translate(cx, cy); rotate(rot); scale(s);
    const ink = STAMP_INK, gap = i => hash(i * 3.7 + 11) < .14;   // where the rubber didn't take the ink
    const arcs = (rad, w, n, key) => { for (let i = 0; i < n; i++) { if (gap(i + key)) continue; const P = []; for (let j = 0; j <= 8; j++) { const q = (i + j / 8 + (hash(i + key) - .5) * .06) / n * TAU; P.push([Math.cos(q) * rad, Math.sin(q) * rad]); } _inkLine(P, w, ink, 'rotring', .4); } };
    arcs(r, 8, 30, 0); arcs(r - 14, 3, 26, 50); arcs(r * .66, 3.2, 22, 90);
    for (let i = 0; i < 60; i++) { if (gap(i + 200)) continue; const q = i / 60 * TAU, L = i % 5 ? 10 : 22; _inkLine([[Math.cos(q) * (r - 26), Math.sin(q) * (r - 26)], [Math.cos(q) * (r - 26 - L), Math.sin(q) * (r - 26 - L)]], i % 5 ? 2.8 : 5.5, ink, 'rotring', 0); }
    // the hands: five to nine (the working day, gone)
    for (const [q, L, w] of [[-Math.PI / 2 + 8.92 / 12 * TAU, r * .4, 11], [-Math.PI / 2 + 55 / 60 * TAU, r * .56, 7]]) { const e = [Math.cos(q) * L, Math.sin(q) * L]; _inkLine([[0, 0], e], w, ink, 'rotring', 0); _paint(starPts(e[0], e[1], w * 1.4, .01, 3, q), { wash: ink, washOp: 255, ink: null }); }
    wash(oval(0, 0, 13, 13, 0, 16), ink);
    // four stars in the band between the rules
    for (let i = 0; i < 4; i++) { const q = (i + .5) / 4 * TAU; _paint(starPts(Math.cos(q) * (r * .83), Math.sin(q) * (r * .83), 14, .42, 5, q), { wash: ink, washOp: 240, ink: null }); }
    // a worn rubber: a few pale scuffs across it
    for (let i = 0; i < 5; i++) { const y = (hash(i * 7.7) - .5) * r * 1.6, x0 = (hash(i * 3.1) - .5) * r; _inkLine([[x0 - 40, y], [x0 + 40, y + 3]], 3, BANK.paper, 'rotring', 0); }
    pop();
    // ink spatter from the slam
    if (a < .6) for (let i = 0; i < 9; i++) { const q = hash(i * 5.3) * TAU, d = r * (1.02 + .25 * hash(i * 2.1)) * (1 + .15 * easeOut(a / .2)); _paint(oval(cx + Math.cos(q) * d, cy + Math.sin(q) * d, 2 + 4 * hash(i), 2 + 4 * hash(i), 0, 10), { wash: STAMP_INK, washOp: 255 * (1 - seg(a, .3, .6)), ink: null }); }
  }

  // ---------- the loop ----------
  function surround() {   // the table the note lands on: plain paper, a shade darker than the note
    _paint(rectPts(-80, -80, W + 160, H + 160), { wash: mixCol(BANK.paper, INK0, .1), washOp: 255, ink: null });
  }
  function noteShadow() {
    const P = [[NX0 + 14, NY1], [NX1, NY1], [NX1, NY0 + 14], [NX1 + 12, NY0 + 22], [NX1 + 12, NY1 + 12], [NX0 + 22, NY1 + 12]];
    wash(P, mixCol(BANK.paper, INK0, .3));
    waveLines(P, 3, 30, .5, 120, INK0, .6);
  }

  LOOPS.banknote = t => {
    look('bank');
    const cam = bnCam(t);
    surround();
    camBegin(cam.cx, cam.cy, cam.zoom, cam.rot);
    const [wx0, wy0] = toScreen(WIN.x0, WIN.y0), [wx1, wy1] = toScreen(WIN.x1, WIN.y1);
    const winSeen = wx1 > 0 && wx0 < W && wy1 > 0 && wy0 < H;
    push(); translate(OX, OY); scale(K);
    const inside = onScreen(NX0, NY0, VX0, NY1) || onScreen(VX1, NY0, NX1, NY1) || onScreen(VX0, NY0, VX1, VY0) || onScreen(VX0, VY1, VX1, NY1);
    if (inside) { boilSeed('bn shadow'); noteShadow(); }
    pop();
    // the vignette's world lies under the note; the note is drawn over it with its windows cut out
    if (winSeen) { boilSeed('bn vignette'); vignette(t, cam); }
    push(); translate(OX, OY); scale(K);
    if (inside) {
      for (const p of [PORT.L, PORT.R]) if (onScreen(p.cx - p.rx, p.cy - p.ry, p.cx + p.rx, p.cy + p.ry)) { boilSeed('bn ground' + p.cx); portraitGround(p); }
      boilSeed('bn portraits'); portraits(t);
      boilSeed('bn paper'); notePaper();
      boilSeed('bn border'); border();
      boilSeed('bn ornaments'); ornaments();
      for (const p of [PORT.L, PORT.R]) { boilSeed('bn frame' + p.cx); ovalFrame(p); }
      boilSeed('bn vframe'); vignetteFrame();
    }
    boilSeed('bn stamp'); stamp(t);
    pop();
    camEnd();
  };
  LOOPS.banknote.len = TM.len;
  window.BANKNOTE = { TM, K, Z0, OX, OY, FX, FY, WIN, PORT, bnCam };
})();

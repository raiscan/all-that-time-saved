// friday.js: the good future. The Bridge, sung by her: "A Friday morning. No alarm. / No office buzzing in my palm. /
// A mate comes round. We put the world to rights, / Then talk pure bollocks halfway through the night."
// The two narrators, finally together, as a doodle: blue biro on lined notebook paper, coloured in with pencil. Her
// place: a modern room, dim (sparse tilted pencil in indigo and plum), lit aqua and magenta: LEDs, a neon palm-and-sunset,
// a lava lamp, the TV. Light in a doodle is the paper, so round every light the dark is left off and the light's own
// colour is pencilled into the halo. She's on a bean bag playing a game on the big TV; a knock, and he bursts in
// (mustard, his can, biscuits held high), cannonballs onto the other bean bag, they clink cans on the bar (fizz!), the
// TV goes from the game to a film, he starts putting the world to rights (a bubble: the globe with sticking plasters),
// it turns to pure nonsense (a rubber duck, a banana, a flying saucer: a new doodle every beat) and they crack up.
// Snacks everywhere, a shisha lazily smoking.
//
// Staged as shot / reverse shot, so they watch the TV and we see them do it: SHOT A from behind them (their backs in
// the foreground, the TV across the room, the door on the left-hand wall); SHOT B the reverse, from the TV (their
// faces, lit by the screen; the back wall behind them; the door on the right-hand wall). She sits frame-right in A and
// frame-left in B; he's the other side. Cuts on beats.
//
// LOOPS.friday (8 s at 140 bpm), loop time, on twos (mt); hits snapped to the 12 fps drawing grid:
//   A 0.00-0.85  the doodle is drawn in: the biro lines in drawing order, then the colouring, then the room shaded in
//   A 0.60-1.25  she's gaming, elbows out; the game runs on the TV; his bean bag empty beside her
//   A 1.25, 1.50 knock, knock (on the beat and the "and") on the door, left: she pauses the game, looks round, reaches
//                down for her can
//   B 1.75       (bar 2, cut) the door bursts open, warm light from the hall: him, biscuits up, his can; she smirks
//   B 2.17-2.58  he crouches, cannonballs across towards us and lands on his bean bag on the beat: it squashes, the
//                popcorn jumps, she bounces
//   B 2.58-3.42  they look at each other; cheers: wind-up, raise, CLINK on the bar (3.42), cans fizz over
//   A 3.86       (cut on the beat) the TV flicks from the paused game to static to a film: both react; he turns to her
//   B 4.71       (cut) he puts the world to rights (bubble: the globe with plasters); she listens, dry
//   B 5.57-7.30  the bubble turns to nonsense, a new doodle every beat; she cracks up, then he does
//   B 7.30-8.00  the colour is rubbed out, back to the biro lines, then the lines too, to the blank page
(() => {
  const LEN = 8, B = BEAT;
  const snap = x => Math.round(x * 12) / 12;   // onto the 12-a-second drawing grid (mt), so a hit gets its own drawing
  const T_KNOCK = [snap(3 * B), snap(3.5 * B)], T_DOOR = snap(4 * B), T_HOP = snap(5 * B), T_LAND = snap(6 * B);
  const TC = snap(8 * B), T_FILM = snap(9 * B), T_TALK = snap(11 * B), T_DUCK = snap(13 * B), T_DRAIN = 7.3, T_BARE = 7.62, T_GONE = 7.96;
  const T_GRAB = T_KNOCK[1] + .08;                                  // she picks up her can
  // the cuts (on beats): A (from behind them, towards the TV) until the door opens; B (the reverse, from the TV) for his
  // arrival and the clink; A as the TV flicks to the film; B for the talk and the laugh
  const SHOTS = [[0, 'A'], [T_DOOR, 'B'], [T_FILM, 'A'], [T_TALK, 'B']];
  const shotAt = t => { let s = SHOTS[0]; for (const k of SHOTS) if (t >= k[0]) s = k; return s; };
  const INK = BIRO, PAPER = '#FBF8F0', RULE = '#9DB7DC';
  // SHOT B (the TV's view: their faces, the back wall behind them, the door on the right-hand wall)
  const U0 = 46, FLOOR = 720;
  const HER_X = 740, HIM_X = 1220, XC = 975, YC = 525;              // her bean bag, his, where the cans meet (at face height)
  const LED_Y = 126, CORNER_B = 1560, DOOR_SPOT = [1668, 752], U_DOOR = 29;   // he's further away in the doorway
  const DOOR_B = [[1606, 330], [1730, 296], [1730, 780], [1606, 742]];        // (far top, near top, near bottom, far bottom)
  // SHOT A (from behind them: their backs in the foreground, the TV across the room, the door on the left-hand wall)
  const UA = 56, GYA = 1200, HER_XA = 1375, HIM_XA = 585, FLOOR_A = 640, CORNER_A = 300;
  const TV = { x0: 700, y0: 150, x1: 1300, y1: 488 };
  const DOOR_A = [[250, 292], [132, 252], [132, 722], [250, 668]];         // (far top, near top, near bottom, far bottom)
  const CAN_A = [1082, 992];                                        // her can on the floor between the bean bags
  const AQUA = '#3FE0D0', MAG = '#FF4FA0';
  const COL = {
    wall: '#3A3270', panel: '#463A7C', floor: '#2C2554', rug: '#5E2A72', door: '#35506A', frame: '#3E3850',   // (the dark pencils are used as they are)
    hall: '#FFD58A', beanHim: '#5B3F8C', beanHimDk: '#3E2A66', beanHer: '#1F8A8A', beanHerDk: '#15605F',
    sun: '#FFC928', sunDk: '#F2861E', sky: '#7EC3F0', hill: '#6BC46A', ocean: '#4A90E2', tea: '#A8662E', clock: '#E2453C',
    bell: '#F2C230', wrapper: '#3F6FD6', biscuit: '#D9A55A', canHim: '#2EC4C4', canHer: '#E8488A', foam: '#FFF6E6',
    pizzaBox: '#C99A5E', cheese: '#F2C14E', crust: '#D8893A', pepperoni: '#C0392B', popcorn: '#FFF1CF', pad: '#2B2F3A',
  };
  // ======================================== THE NARRATORS ========================================
  // Pair C from cast/people.js: HER_C (the tall line: bun with a pencil through it, round glasses, tomato) and HIM_C (the
  // stocky block: beanie, stubble, mustard). Their faces, hair and bodies are the rig's; here they're only
  // dressed for a night in: her coat and scarf off for a tomato jumper (the pencil stays in the bun) and yellow socks;
  // his parka off for a mustard jumper, the beanie kept on.
  const HER_P = { ...HER_C,
    top: { ...HER_C.top, kind: 'jumper', collar: 'crew', rows: [[1.8, 2.1], [1.74, 4.1], [1.7, 4.75, 1]], hemC: .1, band: .45, buttons: [], open: 0 },
    extra: { pencil: HER_C.extra.pencil },
    col: { ...HER_C.col, shoe: '#F4D03F', sole: '#F4D03F', shoeLt: '#E4604E' } };   // (socks: yellow, a red stripe)
  const HIM_P = { ...HIM_C,
    top: { ...HIM_C.top, kind: 'jumper', collar: 'crew', rows: [[3.2, 1.6], [3.15, 3.4], [3.05, 4.55, 1]], band: .5 } };
  const pencilHair = c => lum(c) < .2 ? mixCol('#3A2A22', c, .1) : c;   // (as the rig does in doodle: near-black pencil reads grey)
  // =================================================================================================

  // ---------- drawing helpers ----------
  const pen = (P, sw = 1.6, curv = 0) => edgeLine(P, sw, INK, false, curv);
  const loopPen = (P, sw = 1.6) => edgeLine(P, sw, INK, true);
  // a coloured-pencil line (a dark one is biro; white is the paper, so nothing)
  const line = (P, col, w = 1.5, curv = .5) => { if (PASS.paper) return; if (lum(col) < .3) edgeLine(P, w, INK, false, curv); else if (lum(col) < .88) _inkLine(P, w, vivid(col), 'cpencil', curv); };
  const flat = (P, col, o = {}) => { if (o.op == null) knock([P]); fillRegion(P, col, { key: o.key, op: o.op, side: false }); };   // coloured in, no line (screen pictures)
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const star5 = (cx, cy, r, rot = -Math.PI / 2) => starPts(cx, cy, r, .45, 5, rot);
  const tr = (P, x, y, s = 1, a = 0) => P.map(([px, py]) => [x + (px * Math.cos(a) - py * Math.sin(a)) * s, y + (px * Math.sin(a) + py * Math.cos(a)) * s]);
  // a glowing tube (LEDs, neon): a thick stroke of the colour and a thinner, lighter one along it (the halo is lifted
  // out of the dark room hatch: see lights())
  function tube(P, col, w) { line(P, col, w, .5); line(P, col, w * .8, .5); line(P.map(([x, y]) => [x + 1, y - 1]), mixCol(col, '#FFFFFF', .6), w * .35, .5); }
  // Paper over everything already drawn inside the polygons (world space), and the ruled lines put back.
  function knock(polys) {
    for (const P of polys) _paint(P, { wash: PAPER, ink: null });
    for (let y = 130; y < H + 40; y += 40) {
      const iv = [];
      for (const P of polys) {
        iv.push(...scanSpans(P, y));   // (nonzero: a piece that overlaps itself is paper all through its overlap)
      }
      iv.sort((a, b) => a[0] - b[0]);
      const m = []; for (const v of iv) { if (m.length && v[0] <= m[m.length - 1][1]) m[m.length - 1][1] = Math.max(m[m.length - 1][1], v[1]); else m.push(v.slice()); }
      for (const [a, b] of m) if (b - a > 2) _inkLine([[a - 1, y], [b + 1, y]], .6, RULE, 'rotring', 0);
    }
  }
  // Coloured pencil is see-through, so things drawn over the dark room (or over each other) would muddy. While solid()
  // runs, every piece first gets the paper back under it (the ruled lines too). World-space pieces only; held props use
  // paperUnder() instead (no ruled lines: they're drawn in the hand's rotated space).
  function solid(fn) {
    const P0 = piece;
    piece = function (P, col, o = {}) { knock([P]); return P0(P, col, o); };
    try { fn(); } finally { piece = P0; }
  }
  const paperUnder = P => _paint(P, { wash: PAPER, ink: null });
  // ---------- the doodle drawn in at the start, rubbed out at the end ----------
  // Everything reaches the canvas through p5.brush, so the stages are done there, per stroke: 'pen' strokes are the biro
  // (outlines, detail, biro shading), 'cpencil' / 'side' strokes the colouring, 'rotring' the paper's own ruling (always).
  // The dark room's hatching (STG.room) does its own sweep. S: { lines / cols: how many biro / colour strokes may draw
  // (in drawing order), room: 0..1 the room shaded in, drain: 0..1 colour rubbed out, fade: 0..1 biro rubbed out }
  const STG = { room: false, S: null };
  function stagedDraw(S, draw) {
    const set0 = brush.set, spline0 = brush.spline;
    let cat = 'line', nLine = 0, nCol = 0;
    brush.set = function (br) { cat = br === 'pen' ? 'line' : br === 'cpencil' || br === 'side' ? 'col' : 'paper'; return set0.apply(this, arguments); };
    brush.spline = function () {
      if (!STG.room) {
        if (cat === 'line' && (nLine++ >= S.lines || hash(nLine * 1.618 + 3) < S.fade)) return;
        if (cat === 'col' && (nCol++ >= S.cols || hash(nCol * .7071 + 9) < S.drain)) return;
      }
      return spline0.apply(this, arguments);
    };
    STG.S = S;
    try { draw(); } finally { brush.set = set0; brush.spline = spline0; STG.S = null; }
  }
  // Where the stages are at time t (null = the blank page).
  function stages(t) {
    if (t < 1 / 24 || t >= T_GONE) return null;
    return {
      lines: t < .52 ? 700 * ease(seg(t, .06, .5)) : Infinity,   // (a frame before he arrives draws ~700 biro strokes)
      cols: t < .8 ? 4550 * seg(t, .36, .76) : Infinity,          // (and ~4500 coloured-pencil strokes, the room aside)
      room: ease(seg(t, .46, .86)),
      drain: ease(seg(t, T_DRAIN, T_BARE)), fade: ease(seg(t, T_BARE, T_GONE)),
    };
  }

  // ---------- the dim room: dark pencil, lifted off round the lights ----------
  // The lights of each shot at time t: points { x, y, r, col } and lines { a, b, r, col }.
  const ledCol = (x, t) => mixCol(AQUA, MAG, .5 + .5 * Math.sin(x * .004 - t * 1.3));
  const tvCol = t => t >= T_FILM ? '#9A8BFF' : '#7FD8FF';
  function lightsA(t) {
    const L = [], pl = 1 + .08 * pulse(t, 4);
    L.push({ a: [TV.x0 + 60, (TV.y0 + TV.y1) / 2], b: [TV.x1 - 60, (TV.y0 + TV.y1) / 2], r: 250 * pl, col: tvCol(t) });   // the TV
    L.push({ x: 1420, y: 225, r: 115, col: AQUA }, { x: 1500, y: 262, r: 150 * pl, col: MAG });   // the neon palm and sun
    L.push({ x: 1760, y: 465, r: 125, col: MAG });   // the lava lamp
    L.push({ x: 1580, y: 476, r: 50, col: '#FF9A4A' });   // the shisha's coal
    for (let x = CORNER_A - 60; x < W + 60; x += 240) L.push({ a: [x, 110], b: [x + 240, 110], r: 48, col: ledCol(x + 120, t) });   // LED strip
    L.push({ a: [CORNER_A, 110], b: [-80, 30], r: 48, col: ledCol(100, t) });
    L.push({ a: [CORNER_A, FLOOR_A - 6], b: [W + 60, FLOOR_A - 6], r: 30, col: MAG });   // skirting LEDs
    const k = doorOpen(t);   // the hall light, once he's in
    if (k > .02) { L.push({ a: [190, 330], b: [190, 690], r: 150 * k, col: '#FFD58A' }); L.push({ a: [240, 740], b: [520, 900], r: 90 * k, col: '#FFD58A' }); }
    return L;
  }
  function lightsB(t) {
    const L = [], pl = 1 + .08 * pulse(t, 4);
    L.push({ x: 960, y: 1480, r: 820 * pl, col: tvCol(t) });   // the TV, where the camera is: it lights the floor and them
    L.push({ x: 330, y: 585, r: 125, col: MAG });   // the lava lamp
    L.push({ x: 500, y: 676, r: 50, col: '#FF9A4A' });   // the shisha's coal
    L.push({ a: [130, 446], b: [130, 690], r: 72, col: ledCol(130, t + 2) });   // the light bar
    for (let x = -60; x < CORNER_B; x += 240) L.push({ a: [x, LED_Y], b: [Math.min(CORNER_B, x + 240), LED_Y], r: 48, col: ledCol(x + 120, t) });   // LED strip
    L.push({ a: [CORNER_B, LED_Y], b: [2000, 20], r: 48, col: ledCol(1800, t) });
    L.push({ a: [-60, FLOOR - 6], b: [CORNER_B, FLOOR - 6], r: 30, col: MAG });   // skirting LEDs
    const k = doorOpen(t);
    if (k > .02) { L.push({ a: [1668, 340], b: [1668, 740], r: 170 * k, col: '#FFD58A' }); L.push({ a: [1620, 800], b: [1380, 1060], r: 90 * k, col: '#FFD58A' }); }
    const ca = t - TC; if (ca >= 0 && ca < .4) L.push({ x: XC, y: YC - 40, r: 160 * (1 - ca / .4), col: COL.sun });
    return L;
  }
  function lightAt(L, x, y) {
    let best = 0, col = null;
    for (const l of L) {
      let d;
      if (l.a) { const dx = l.b[0] - l.a[0], dy = l.b[1] - l.a[1], k = clamp(((x - l.a[0]) * dx + (y - l.a[1]) * dy) / (dx * dx + dy * dy)); d = Math.hypot(x - l.a[0] - dx * k, y - l.a[1] - dy * k); }
      else d = Math.hypot(x - l.x, y - l.y);
      const v = Math.pow(clamp(1 - d / l.r), .75); if (v > best) { best = v; col = l.col; }
    }
    return [best, col];
  }
  // Tilted-pencil shading for the room: long, soft strokes of a pencil dragged on its side (each a slightly bowed band
  // of three grainy coloured-pencil lines, a little lighter than the pencil), all in one hand direction, heavier and
  // lighter in loose patches (a slow noise field) so plenty of paper shows; dens ≈ coverage. Along each stroke the
  // lights take over: no shading near a light (the paper is the light), a little of the light's own colour round it;
  // holes (rects [x0, y0, x1, y1] or tests p => bool) are left for the objects that go there.
  function sideBand(P, col, h) {   // P: the stroke's points; h: a 0..1 seed (so what one band draws doesn't move the others)
    const A = P[0], Bp = P[P.length - 1], L = Math.hypot(Bp[0] - A[0], Bp[1] - A[1]) || 1, nx = -(Bp[1] - A[1]) / L, ny = (Bp[0] - A[0]) / L;
    const bow = (hash(h * 71) - .5) * 5, c = mixCol(col, PAPER, .18);
    for (let k = 0; k < 3; k++) {
      const o = (k - 1) * 2.4 + (hash(h * 91 + k) - .5) * .8, s0 = hash(h * 37 + k * 3.1) * .08, s1 = 1 - hash(h * 53 + k * 1.7) * .08;
      const at = u => { const i = u * (P.length - 1), j = Math.min(P.length - 2, Math.floor(i)), f = i - j; return [lerp(P[j][0], P[j + 1][0], f) + nx * (o + bow * Math.sin(u * Math.PI)), lerp(P[j][1], P[j + 1][1], f) + ny * (o + bow * Math.sin(u * Math.PI))]; };
      _inkLine([at(s0), at((s0 + s1) / 2), at(s1)], .9, c, 'cpencil', .4);
    }
  }
  function roomShade(P, col, dens, a, L, holes, key) {
    const d = 9, c = col, kh = keyHash(key), nz = (x, y) => noise(x * .0045 + kh * .01, y * .0045);
    const ang = a * Math.PI / 180, cs = Math.cos(-ang), sn = Math.sin(-ang), ci = Math.cos(ang), si = Math.sin(ang);
    const R = P.map(([x, y]) => [x * cs - y * sn, x * sn + y * cs]), back = ([x, y]) => [x * ci - y * si, x * si + y * ci];
    const inHole = p => holes.some(h => typeof h === 'function' ? h(p) : p[0] > h[0] && p[0] < h[2] && p[1] > h[1] && p[1] < h[3]);
    const S = STG.S, sweep = (x, h) => { if (!S) return true; const q = x / W * .8 + h * .2; return q < S.room * 1.02 && q > S.drain * 1.02 - .02; };
    let y0 = Infinity, y1 = -Infinity; for (const p of R) { if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
    STG.room = true;
    for (let y = (Math.floor(y0 / d) + .5) * d, row = 0; y < y1; y += d, row++) {
      randomSeed(keyHash(key) * 131 + row);   // (each row its own stream, and not the boil's: the shading is held, like a painted
      // background under boiling linework, so the big areas don't shimmer; the lights changing what's drawn move nothing else)
      const yy = y + jit(1.5), xs = [];
      for (let i = 0; i < R.length; i++) { const p = R[i], q = R[(i + 1) % R.length]; if ((p[1] <= yy) !== (q[1] <= yy)) xs.push(p[0] + (yy - p[1]) / (q[1] - p[1]) * (q[0] - p[0])); }
      xs.sort((m, n) => m - n);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        let x = xs[k] + random() * 20;
        while (x < xs[k + 1] - 10) {   // long strokes, few lifts
          const len = 80 + random() * 190, x2 = Math.min(xs[k + 1] - random() * 8, x + len), r1 = random(), r2 = random(), r3 = random(), tilt = (random() - .5) * 8;
          const mid = back([(x + x2) / 2, yy]), patch = nz(mid[0], mid[1]);
          if (r1 < .2 + dens * .9 + (patch - .5) * 2.2 && sweep(mid[0], hash(kh + row * 7.3 + Math.round(x / 40)))) {
            // walk along the stroke: runs of dark pencil, of the light's colour, or nothing (holes, right by a light)
            const n = Math.max(2, Math.ceil((x2 - x) / 24)), pts = [], st = [], lcs = [];
            for (let i = 0; i <= n; i++) {
              const u = i / n, p = back([lerp(x, x2, u), yy + tilt * (u - .5)]), [I, lc] = lightAt(L, p[0], p[1]);
              pts.push(p); lcs.push(lc); st.push(inHole(p) ? 0 : I < .1 ? 1 : I < .75 && r2 < .5 - .5 * I ? 2 : 0);
            }
            for (let i = 0; i < n;) {
              let j = i; while (j + 1 < n && st[j + 1] === st[i]) j++;
              if (st[i] && j + 1 - i >= 1) sideBand(pts.slice(i, j + 2), st[i] === 1 ? c : vivid(lcs[i] || c), hash(r3 * 17 + i));
              i = j + 1;
            }
          }
          x = x2 + 8 + random() * 26;
        }
      }
    }
    STG.room = false;
  }

  // ---------- the person rig, mirrored here (to aim held props, and to put paper behind the figures) ----------
  const GB = 1000, SEAT_H = 2.7, SEAT_A = 2.5;   // shot B: feet on the floor at GB, hips in the bean bags; shot A's seat
  // the rig's transform: world = (x, y + dy) + R(rot) · (sx, sy) · body (body units × u)
  function pcfg(x, y, u, o) {
    const sq = ((o.sq || 0) + (o.take || 0)) * .5, f = o.flip ? -1 : 1;
    return { x: x + (o.dx || 0) * u, y: y + (o.dy || 0) * 1.1 * u, u, f, rot: o.rot || 0, sx: f * (1 + sq * .5), sy: 1 - sq };
  }
  const toW = (C, [px, py]) => { const bx = px * C.u * C.sx, by = py * C.u * C.sy, c = Math.cos(C.rot), s = Math.sin(C.rot); return [C.x + bx * c - by * s, C.y + bx * s + by * c]; };
  const toR = (C, [wx, wy]) => { const dx = wx - C.x, dy = wy - C.y, c = Math.cos(C.rot), s = Math.sin(C.rot); return [(dx * c + dy * s) / (C.u * C.sx), (-dx * s + dy * c) / (C.u * C.sy)]; };
  // where the rig roots a front arm (3/4 view, no stoop), in body units
  function shoulderQ(P, Fr, s) { const tp = P.top, aw = P.body.armW, xx = s * (tp.sh[0] - aw * .42); return [(xx >= 0 ? xx * .97 : xx * .93) + PP_QS, Fr.ys + Math.max(tp.sh[1], .15) + aw * .4]; }
  // An arm spec (body units: the rig's 'u' form) that puts the hand's held prop at body point p, the hand at angle ang
  // (the rig draws the hand .08 u past the arm's tip and holds a prop .85 of the hand further on).
  const holdAt = (P, p, ang, hp = 'hold', bend = .3) => { const d = .08 + .85 * P.body.hand; return [p[0] - Math.cos(ang) * d, p[1] - Math.sin(ang) * d, bend, hp, 1, ang, 'u']; };
  // The key for a held prop: the wrist out from the shoulder at deg (0 = forward, 90 = straight down), k × the arm's
  // length (kept to .7..9: nearer, the rubber-hose arm folds into a hairpin), the hand at angle a.
  function grip(P, Fr, s, deg, k, a, extra = {}) {
    const r = shoulderQ(P, Fr, s), L = P.body.arm, an = deg * Math.PI / 180, d = .08 + .85 * P.body.hand;
    return { p: [r[0] + Math.cos(an) * k * L + Math.cos(a) * d, r[1] + Math.sin(an) * k * L + Math.sin(a) * d], a, pol: { r, L, d, deg, k }, ...extra };
  }
  const reachOK = (P, Fr, s, spec) => { const r = shoulderQ(P, Fr, s); return Math.hypot(spec[0] - r[0], spec[1] - r[1]) < P.body.arm * .97; };
  // Paper behind a figure: the figure drawn once as plain paper (its exact silhouette: coloured pencil is see-through),
  // then drawn for real on top.
  const PASS = { paper: false };
  function paperPass(fn) {
    const F0 = fillRegion, E0 = edgeLine, S0 = shadeRegion, D0 = dline;
    PASS.paper = true; fillRegion = P => _paint(P, { wash: PAPER, ink: null }); edgeLine = () => {}; shadeRegion = () => {}; dline = () => {};
    try { fn(); } finally { fillRegion = F0; edgeLine = E0; shadeRegion = S0; dline = D0; PASS.paper = false; }
  }
  // and each solid piece of it laid on paper too, so its own layers don't show through each other (an arm over the
  // body: the body's outline under the arm)
  // (and her glasses' frame gets a firmer biro line, or the thin brown rims vanish into the pencilled skin)
  function opaque(fn) {
    const F0 = fillRegion, P0 = piece;
    fillRegion = function (P, col, o = {}) { if ((o.op ?? 255) >= 230) _paint(P, { wash: PAPER, ink: null }); return F0(P, col, o); };
    piece = function (P, col, o = {}) {
      if (!/(rim[01]|bridge|arm-?[01])$/.test(o.key || '') || o.ink === null) return P0(P, col, o);
      // a ring or a ribbon (one side, then the other back): its centre line, drawn as one firm biro line
      P0(P, col, { ...o, ink: null }); const N = P.length, mid = []; for (let j = 0; j < N / 2; j++) mid.push([(P[j][0] + P[N - 1 - j][0]) / 2, (P[j][1] + P[N - 1 - j][1]) / 2]);
      _inkLine(mid.map(([x, y]) => [x + jit(.6), y + jit(.6)]), 2.4, BIRO, 'pen', .4);
    };
    try { fn(); } finally { fillRegion = F0; piece = P0; }
  }
  const onPaper = fn => { paperPass(fn); opaque(fn); };
  const mixU = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k), k < .5 ? a[3] : b[3], 1, lerp(a[5], b[5], k), 'u'];
  // a keyed track of arm specs: [[t, spec], ...], each change eased over `bl` s with a rubbery overshoot
  function specTrack(t, keys, bl = .22) {
    let i = 0; while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
    if (i === 0) return keys[0][1];
    return mixU(keys[i - 1][1], keys[i][1], backOut(seg(t, keys[i][0], keys[i][0] + bl)));
  }
  // a keyed track of prop positions (body points, or world points marked w) with per-key easing and arcs
  function propTrack(t, C, keys) {
    const P = k => k.w ? k.p : toW(C, k.p);
    let i = 0; while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
    const cur = keys[i][1];
    if (i + 1 >= keys.length) return { w: P(cur), tilt: cur.tilt || 0, a: cur.a ?? -1 };
    const nxt = keys[i + 1][1], a = keys[i][0], b = keys[i + 1][0], k = (nxt.ease || ease)(seg(t, a, b));
    const pa = P(cur), pb = P(nxt), arc = (nxt.arc || 0) * Math.sin(Math.PI * k), a2 = lerp(cur.a ?? -1, nxt.a ?? -1, k), tilt = lerp(cur.tilt || 0, nxt.tilt || 0, k);
    if (cur.pol && nxt.pol) {   // two reaches: swing round the shoulder (a straight line between them can pass through it)
      const q = cur.pol, deg = lerp(q.deg, nxt.pol.deg, k), kk = lerp(q.k, nxt.pol.k, k), an = deg * Math.PI / 180;
      const pp = [q.r[0] + Math.cos(an) * kk * q.L + Math.cos(a2) * q.d, q.r[1] + Math.sin(an) * kk * q.L + Math.sin(a2) * q.d];
      const w = toW(C, pp); return { w: [w[0], w[1] - arc], tilt, a: a2 };
    }
    return { w: [lerp(pa[0], pb[0], k), lerp(pa[1], pb[1], k) - arc], tilt, a: a2 };
  }
  // feel()/emotions() motion is built for a standing Clawd, so it's scaled down for people sat on bean bags
  function calm(e, flip, k = 1) {
    return { ...e, dy: (e.dy || 0) * .22 * k, sq: (e.sq || 0) * .6, rot: (e.rot || 0) * .5 * (flip ? -1 : 1), dx: 0, emote: null, gloom: 0 };
  }

  // ---------- props ----------
  // A drinks can, upright, centred at (0, 0); s = hand size. fizz 0..1: foam over the top.
  function can(s, col, key, fizz = 0, t = 0) {
    const w = .3 * s, h = .56 * s;
    paperUnder(curvy([[-w, -h * .98], [w, -h * .98], [w * 1.02, h * .96], [-w * 1.02, h * .96]], 2));
    piece(curvy([[-w, -h * .9], [w, -h * .9], [w * 1.02, h * .9], [-w * 1.02, h * .9]], 2), col, { sw: 1.8, shade: mixCol(col, '#101020', .35), depth: w * .5, key: key + 'b' });
    piece(curvy([[-w, -h * .1], [w, -h * .3], [w, h * .15], [-w, h * .35]], 3), mixCol(col, '#FFFFFF', .55), { ink: null, key: key + 'wave', flatCard: true });
    piece(oval(0, -h * .9, w * .98, .1 * s, 0, 16), '#C9CED8', { sw: 1.2, key: key + 'top', flatCard: true });
    piece(oval(0, h * .9, w * .98, .08 * s, 0, 16), '#AEB3C0', { sw: 1, key: key + 'bot', flatCard: true });
    if (fizz > .02) for (let i = 0; i < 4; i++) {
      const a = -Math.PI / 2 + (i - 1.5) * .45, r = (.18 + .22 * fizz) * s, p = [Math.cos(a) * r * .6, -h * .95 + Math.sin(a) * r];
      piece(oval(p[0], p[1], .11 * s * fizz + 2, .09 * s * fizz + 2, 0, 10), COL.foam, { sw: .9, key: key + 'f' + i, flatCard: true });
    }
  }
  // Held props stand upright whatever the hand does: undo the hand's mirror and angle, and the body's lean.
  const CAN_S = 38.6, MS = 1.45;
  const upright = (C, ang, mirror) => { if (mirror) scale(1, -1); rotate(-ang); rotate(-C.rot * C.f); };
  const canHold = (C, ang, tilt, col, key, fizz) => () => { push(); upright(C, ang, false); rotate(tilt); scale(MS); can(CAN_S, col, key, fizz); pop(); };
  // A packet of biscuits, torn open, upright, centred at (0, 0).
  function biscuits(s, key) {
    const w = .44 * s, h = .95 * s;
    paperUnder(curvy([[-w, -h - .45 * s], [w, -h - .45 * s], [w * 1.02, h], [-w * 1.02, h]], 2));
    piece(curvy([[-w, -h], [w, -h], [w * 1.02, h], [-w * 1.02, h]], 2), COL.wrapper, { sw: 1.8, shade: '#2A4A9A', depth: w * .4, key: key + 'p' });
    piece([[-w, -h * .2], [w, -h * .2], [w, h * .25], [-w, h * .25]], COL.bell, { sw: 1.1, key: key + 'band', flatCard: true });
    piece(heartPts(0, h * .02, .15 * s), COL.clock, { ink: null, key: key + 'logo', flatCard: true });
    for (let i = 0; i < 3; i++) piece(oval(0, -h - .06 * s - i * .13 * s, w * .92, .15 * s, 0, 14), COL.biscuit, { sw: 1, key: key + 'b' + i, flatCard: true });
  }
  const biscuitHold = (C, ang, key, shake = 0) => () => { push(); upright(C, ang, true); rotate(shake); translate(0, -CAN_S * .35); scale(1.4); biscuits(CAN_S, key); pop(); };
  const padHold = (C, ang, key) => () => { push(); upright(C, ang, true); controller(0, 0, 0, PAD_W, key); pop(); };
  // Her game controller, centred at (x, y), rotated a, width w.
  function controller(x, y, a, w, key) {
    const P = P0 => tr(P0, x, y, w / 100, a);
    paperUnder(P(curvy([[-50, -12], [-20, -18], [20, -18], [50, -12], [56, 14], [44, 30], [26, 22], [-26, 22], [-44, 30], [-56, 14]], 4)));
    piece(P(curvy([[-50, -12], [-20, -18], [20, -18], [50, -12], [56, 14], [44, 30], [26, 22], [-26, 22], [-44, 30], [-56, 14]], 4)), COL.pad, { sw: 1.8, key: key + 'body' });
    piece(P(rect(-38, -6, -22, 2)), '#5C6272', { ink: null, key: key + 'dh', flatCard: true }); piece(P(rect(-34, -10, -26, 6)), '#5C6272', { ink: null, key: key + 'dv', flatCard: true });
    [[26, -8, AQUA], [34, -2, MAG], [26, 4, COL.bell], [18, -2, '#7CE07C']].forEach(([bx, by, c], i) => piece(P(oval(bx, by, 3.6, 3.6, 0, 8)), c, { ink: null, key: key + 'btn' + i, flatCard: true }));
    for (const sx of [-12, 10]) piece(P(oval(sx, 8, 6, 6, 0, 10)), '#454A58', { sw: 1, key: key + 'st' + sx, flatCard: true });
    piece(P(oval(0, -10, 5, 2.5, 0, 8)), AQUA, { ink: null, key: key + 'led', flatCard: true });
  }

  // ---------- the room ----------
  // SHOT A's room: the TV wall straight on, the left-hand wall (with the front door) in perspective, the floor, a rug.
  function roomA(t) {
    const L = lightsA(t), inRug = ([x, y]) => ((x - 980) / 780) ** 2 + ((y - 830) / 170) ** 2 < 1;
    const holes = [[TV.x0 + 10, TV.y0 + 10, TV.x1 - 10, TV.y1 - 10], [DOOR_A[1][0], DOOR_A[0][1], DOOR_A[0][0], DOOR_A[2][1]]];
    boilSeed('fr-roomA');
    roomShade(rect(CORNER_A, 40, 2000, FLOOR_A), COL.wall, .35, -28, L, holes, 'wallA');
    roomShade([[-80, -80], [CORNER_A, 40], [CORNER_A, FLOOR_A], [-80, 790]], COL.wall, .42, -40, L, holes, 'sideA');
    roomShade([[-80, 790], [CORNER_A, FLOOR_A], [2000, FLOOR_A], [2000, 1140], [-80, 1140]], COL.floor, .38, -14, L, [inRug], 'floorA');
    roomShade(oval(980, 830, 780, 170, 0, 48), COL.rug, .4, -14, L, [], 'rugA');
    loopPen(oval(980, 830, 780, 170, 0, 48), 1.8);
    const ring = oval(980, 830, 680, 136, 0, 48); for (let i = 0; i < 48; i += 2) line([ring[i], ring[i + 1]], AQUA, 3.2, 0);
    pen([[CORNER_A, 40], [CORNER_A, FLOOR_A]], 2); pen([[CORNER_A, FLOOR_A], [2000, FLOOR_A]], 2); pen([[CORNER_A, FLOOR_A], [-80, 790]], 2);
    for (let x = CORNER_A - 60; x < W + 60; x += 120) tube([[Math.max(CORNER_A, x), 110], [x + 122, 110]], ledCol(x, t), 7);
    tube([[CORNER_A, 110], [-80, 30]], ledCol(100, t), 7);
    for (let x = CORNER_A; x < W + 60; x += 160) tube([[x, FLOOR_A - 6], [x + 162, FLOOR_A - 6]], MAG, 5);
  }
  // SHOT B's room: the back wall straight on (a print, a shelf, the lava lamp, the light bar), the right-hand wall (with
  // the front door) in perspective, the floor, the rug.
  function roomB(t) {
    const L = lightsB(t), inRug = ([x, y]) => ((x - 980) / 650) ** 2 + ((y - 930) / 145) ** 2 < 1;
    const holes = [[DOOR_B[0][0], DOOR_B[1][1], DOOR_B[1][0], DOOR_B[2][1]], [760, 190, 1200, 440], [260, 732, 400, 858]];
    boilSeed('fr-roomB');
    roomShade(rect(-80, 40, CORNER_B, FLOOR), COL.wall, .35, -28, L, holes, 'wallB');
    roomShade([[CORNER_B, 40], [2000, -120], [2000, 900], [CORNER_B, FLOOR]], COL.wall, .42, -16, L, holes, 'sideB');
    roomShade([[-80, FLOOR], [CORNER_B, FLOOR], [2000, 900], [2000, 1140], [-80, 1140]], COL.floor, .38, -14, L, [inRug], 'floorB');
    roomShade(oval(980, 930, 660, 150, 0, 48), COL.rug, .4, -14, L, [], 'rugB');
    loopPen(oval(980, 930, 660, 150, 0, 48), 1.8);
    const ring = oval(980, 930, 560, 118, 0, 48); for (let i = 0; i < 48; i += 2) line([ring[i], ring[i + 1]], AQUA, 3.2, 0);
    pen([[-40, FLOOR], [CORNER_B, FLOOR]], 2); pen([[CORNER_B, 40], [CORNER_B, FLOOR]], 2); pen([[CORNER_B, FLOOR], [2000, 900]], 2);
    for (let x = -60; x < CORNER_B; x += 120) tube([[x, LED_Y], [Math.min(CORNER_B, x + 122), LED_Y]], ledCol(x, t), 7);
    tube([[CORNER_B, LED_Y], [2000, 20]], ledCol(1800, t), 7);
    for (let x = -60; x < CORNER_B; x += 160) tube([[x, FLOOR - 6], [Math.min(CORNER_B, x + 162), FLOOR - 6]], MAG, 5);
    // a print on the back wall (a sun over the sea: shapes, no words), a floating shelf with a plant and a speaker
    solid(() => {
      piece(rect(760, 190, 1200, 440), '#F4EEE6', { sw: 2.2, key: 'fr-print', side: false });
      piece(oval(1020, 300, 70, 70, 0, 24), '#FF8A5C', { sw: 1.6, key: 'fr-printsun' });
      piece([[790, 330], [900, 300], [1010, 336], [1120, 300], [1172, 318], [1172, 412], [790, 412]], '#3FB8C0', { sw: 1.6, key: 'fr-printsea', side: false });
      piece([[790, 380], [880, 356], [1000, 386], [1110, 356], [1172, 372], [1172, 412], [790, 412]], '#2A7FA8', { sw: 1.4, key: 'fr-printsea2', side: false });
      piece(rect(170, 380, 470, 396), '#3A3348', { sw: 1.8, key: 'fr-shelf' });
      piece(curvy([[200, 380], [262, 380], [256, 326], [206, 326]], 2), '#2E2840', { sw: 1.6, key: 'fr-speaker' });
      piece(oval(231, 350, 14, 14, 0, 14), '#5E5870', { sw: 1.2, key: 'fr-cone', flatCard: true });
      piece(curvy([[372, 380], [420, 380], [414, 344], [378, 344]], 2), '#D9713E', { sw: 1.6, key: 'fr-plantpot' });
    });
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .5 + .05 * Math.sin(t * 1.5 + i), tip = [396 + Math.cos(a) * 58, 344 + Math.sin(a) * 58]; pen([[396, 344], tip], 1.3, .4); solid(() => piece(tr(oval(14, 0, 16, 8, 0, 12), tip[0], tip[1], 1, a), '#4DB05A', { sw: 1.3, key: 'fr-leaf' + i })); }
    // the light bar
    solid(() => { piece(curvy([[104, 712], [156, 712], [160, 724], [100, 724]], 2), '#1A1622', { sw: 1.6, key: 'fr-lampfoot' }); piece(rect(127, 430, 133, 712), '#2A2434', { sw: 1.2, key: 'fr-lamppole' }); });
    tube([[130, 446], [130, 690]], ledCol(130, t + 2), 12);
  }
  // The front door, on a side wall: Q = its frame (far top, near top, near bottom, far bottom). Knocked on twice (the
  // bursts), then flung open towards us (hinged on the near side) on warm light from the hall.
  const doorOpen = t => clamp(backOut(seg(t, T_DOOR, T_DOOR + .17)), 0, 1.08);
  function drawDoor(t, Q, key, near) {   // near: +1 the near side is to the right (shot B), -1 to the left (shot A)
    const k = doorOpen(t), lerpP = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
    boilSeed(key);
    const fr = Q.map(([x, y], i) => [x + (i === 0 || i === 3 ? -near : near) * 10, y + (i < 2 ? -12 : 0)]);
    piece(fr, COL.frame, { sw: 2.2, key: key + 'frame', side: false });
    piece(Q, k > .02 ? COL.hall : '#141019', { sw: 1.6, key: key + 'way', side: false });
    if (k > .02) { const f0 = lerpP(Q[0], Q[3], .8), f1 = lerpP(Q[1], Q[2], .8); piece([f0, f1, Q[2], Q[3]], '#E8B868', { ink: null, key: key + 'hall', side: false }); pen([f0, f1], 1.4); }
    // the leaf: hinged on the near edge; its far edge swings out towards us, past the near edge (and out of the frame)
    const jolt = T_KNOCK.reduce((a, tk) => a + 5 * Math.max(0, spring(t, tk, 12, 45)), 0) * -near;
    const swing = clamp(k, 0, 1.08), fT = [lerp(Q[0][0], Q[1][0] + near * 260, swing) + jolt, lerp(Q[0][1], Q[1][1] - 90, swing)], fB = [lerp(Q[3][0], Q[2][0] + near * 260, swing) + jolt, lerp(Q[3][1], Q[2][1] + 110, swing)];
    const leaf = [fT, Q[1], Q[2], fB];
    const at = (u, v) => lerpP(lerpP(leaf[0], leaf[1], u), lerpP(leaf[3], leaf[2], u), v);
    piece(leaf, COL.door, { sw: 2.2, key: key + 'leaf', side: false });
    for (const [v0, v1] of [[.08, .44], [.54, .92]]) loopPen([at(.18, v0), at(.82, v0), at(.82, v1), at(.18, v1)], 1.4);
    const kn = at(.12, .52); piece(oval(kn[0], kn[1], 6, 7, 0, 12), COL.bell, { sw: 1.3, key: key + 'knob', flatCard: true });
    // knock, knock: a burst on the door where the knuckles land, with impact lines
    boilSeed(key + 'knocks');
    T_KNOCK.forEach((tk, j) => {
      const a = t - tk; if (a < 0 || a > .26) return;
      const s = (a < 1 / 12 ? 1.15 : 1) * (1 - seg(a, .16, .26)), c = at(.5, j ? .36 : .3);
      piece(star5(c[0], c[1], 30 * s, -Math.PI / 2 + j * .4), COL.sun, { sw: 1.9, key: key + 'knock' + j, flatCard: true });
      for (let i = 0; i < 5; i++) { const an = -Math.PI / 2 + (i - 2) * .55 + j * .3, r0 = 38 * s, r1 = 60 * s; line([[c[0] + Math.cos(an) * r0, c[1] + Math.sin(an) * r0], [c[0] + Math.cos(an) * r1, c[1] + Math.sin(an) * r1]], '#FFD24A', 3, 0); }
    });
  }
  // The neon sign: a palm tree by a setting sun (no letters), humming on the beat.
  function neon(t) {
    boilSeed('fr-neon');
    const cx = 1490, cy = 290;
    const sun = []; for (let i = 0; i <= 14; i++) { const th = Math.PI + i / 14 * Math.PI; sun.push([cx + Math.cos(th) * 70, cy + Math.sin(th) * 70]); }
    tube(sun.concat([sun[0]]), MAG, 3.4);
    for (const [dy, w] of [[16, 60], [30, 50], [44, 36]]) tube([[cx - w, cy + dy], [cx + w, cy + dy]], MAG, 2.8);
    const trunk = [[cx - 96, cy + 70], [cx - 90, cy + 10], [cx - 76, cy - 50], [cx - 60, cy - 92]];
    tube(trunk, AQUA, 3.4);
    for (const [ex, ey] of [[-10, -70], [-18, -122], [-72, -142], [-122, -112], [-128, -64]]) tube([trunk[3], [cx - 60 + (ex + 60) * .5, cy - 92 + (ey + 92) * .5 - 18], [cx + ex, cy + ey]], AQUA, 2.8);
  }
  function lavaLamp(t) {
    boilSeed('fr-lava');
    piece(rect(1600, 720, 1740, 870), '#2E2840', { sw: 2, shade: '#1E1A2A', depth: 20, key: 'fr-cube' });
    const x = 1670, glass = curvy([[x - 20, 520], [x + 20, 520], [x + 34, 650], [x - 34, 650]], 2);
    piece(glass, '#5A1F6A', { sw: 2, key: 'fr-lavaglass' });
    for (let i = 0; i < 4; i++) {   // blobs rising and sinking
      const ph = frac(t * .12 + i * .27), by = 640 - 110 * Math.sin(ph * Math.PI), r = 10 + 5 * hash(i + 2), bx = x + 8 * Math.sin(t * .8 + i * 2);
      const w = lerp(20, 32, (by - 520) / 130);
      if (Math.abs(bx - x) + r < w) piece(oval(bx, by, r, r * (1.2 + .3 * Math.sin(t + i)), 0, 14), '#FF6FC0', { ink: null, key: 'fr-blob' + i, flatCard: true });
    }
    piece(curvy([[x - 36, 650], [x + 36, 650], [x + 44, 716], [x - 44, 716]], 2), '#8A8FA8', { sw: 2, key: 'fr-lavabase' });
    piece(curvy([[x - 20, 520], [x + 20, 520], [x + 12, 500], [x - 12, 500]], 2), '#8A8FA8', { sw: 1.8, key: 'fr-lavacap' });
  }
  // A shisha (it reads as a vapour diffuser, which the user likes) on the floor by her, smoking lazily: glass base, stem,
  // tray, bowl, a glowing coal; no hose (the user: it looked detached).
  function shisha(t) {
    boilSeed('fr-shisha');
    const x = 1440, base = 940;
    piece(curvy([[x - 20, base - 110], [x + 20, base - 110], [x + 52, base - 50], [x + 46, base], [x - 46, base], [x - 52, base - 50]], 4), '#3FB8C0', { sw: 2, shade: '#24808A', depth: 16, key: 'fr-vase' });
    piece(curvy([[x - 44, base - 40], [x + 44, base - 40], [x + 44, base - 4], [x - 44, base - 4]], 2), '#2A8C98', { ink: null, key: 'fr-water', flatCard: true });
    piece(rect(x - 6, base - 250, x + 6, base - 108), '#B8BCCB', { sw: 1.6, key: 'fr-stem' });
    piece(oval(x, base - 196, 30, 7, 0, 18), '#B8BCCB', { sw: 1.5, key: 'fr-tray' });
    piece(curvy([[x - 18, base - 262], [x + 18, base - 262], [x + 10, base - 244], [x - 10, base - 244]], 2), '#C8643A', { sw: 1.5, key: 'fr-bowl' });
    piece(oval(x, base - 265, 12, 5, 0, 12), '#FF9A4A', { sw: 1.2, key: 'fr-coal', flatCard: true });
    for (let i = 0; i < 2; i++) {   // a lazy smoke curl: a ribbon wafting up and off, fading at its tail
      const P = [], ph = t * .5 + i * 1.7;
      for (let k = 0; k <= 8; k++) P.push([x + Math.sin(k * .75 - ph * 2) * (6 + k * 4) + k * (5 + 4 * i), base - 272 - k * (26 + 6 * i)]);
      piece(ribbon(P, 5, 22 + 6 * i), '#B9A6D8', { ink: null, op: 95 - 30 * i, key: 'fr-smoke' + i, flatCard: true });
    }
  }
  // The TV (shot A): on screen a game (paused when she answers the door), static, then a film; below it the console on
  // a low media unit, plugged in, and a spare controller.
  function tv(t) {
    boilSeed('fr-tv');
    const { x0, y0, x1, y1 } = TV, s = { x0: x0 + 14, y0: y0 + 14, x1: x1 - 14, y1: y1 - 14 }, w = s.x1 - s.x0, h = s.y1 - s.y0;
    piece(rect(x0, y0, x1, y1), '#15121C', { sw: 2.4, key: 'fr-tvbezel', side: false });
    const filmOn = t >= T_FILM + 2 / 12, staticOn = t >= T_FILM && !filmOn;
    if (staticOn) {
      for (let i = 0; i < 8; i++) flat(rect(s.x0, s.y0 + i * h / 8, s.x1, s.y0 + (i + 1) * h / 8), mixCol('#303040', '#E8E8F0', hash(i + Math.floor(t * 24) * 3.1)), { key: 'fr-static' + i });
    } else if (!filmOn) tvGame(Math.min(t, T_KNOCK[0]), s, w, h, t >= T_KNOCK[0] + .06);
    else tvFilm(t - T_FILM, s, w, h);
    boilSeed('fr-console');
    piece(rect(740, 560, 1260, 640), '#3A3348', { sw: 2.2, key: 'fr-unit', side: false });
    pen([[1000, 566], [1000, 634]], 1.3); for (const kx of [880, 1120]) piece(oval(kx, 600, 5, 5, 0, 10), '#8A8FA8', { sw: 1, key: 'fr-unitknob' + kx, flatCard: true });
    line([[1040, 540], [1080, 520], [1110, y1 - 4]], '#1A1622', 3, .6);
    // (the console: a black games box, a glossy top, vents and a glowing power light, so it reads as one: pale cream with a
    // stripe, flat on the unit, it read as a pizza box, there before he's brought it: the user)
    piece(curvy([[884, 520], [1036, 520], [1042, 560], [878, 560]], 2), '#23202B', { sw: 2, shade: '#0E0C12', depth: 10, key: 'fr-console', side: false });
    line([[900, 528], [1020, 528]], '#5C5870', 2.4, 0);
    for (let k = 0; k < 5; k++) line([[900 + k * 9, 540], [900 + k * 9, 552]], '#4A4658', 1.6, 0);
    piece(oval(1016, 546, 7, 7, 0, 12), AQUA, { ink: null, key: 'fr-conlight', flatCard: true }); glow(1016, 546, 18, AQUA, .5);
    controller(1170, 548, .1, 70, 'fr-spare');
  }
  function tvGame(gt, s, w, h, paused) {   // a platformer: a round pink hero hopping on the beat, coins, a scrolling world
    const R = rect;
    flat(R(s.x0, s.y0, s.x1, s.y1), '#5A86F0', { key: 'fr-gsky' });
    for (let i = 0; i < 3; i++) { const cx = s.x0 + ((i * 170 + 60 - gt * 25) % (w + 80) + w + 80) % (w + 80) - 40, cy = s.y0 + 30 + 18 * i; if (cx > s.x0 + 30 && cx < s.x1 - 30) flat(curvy([[cx - 26, cy + 6], [cx - 14, cy - 8], [cx + 4, cy - 12], [cx + 22, cy - 4], [cx + 28, cy + 8]], 3), '#FFFFFF', { key: 'fr-gcl' + i }); }
    const hill = []; for (let i = 0; i <= 12; i++) { const x = s.x0 + i / 12 * w; hill.push([x, s.y1 - 70 - 22 * Math.sin(i * .9 + gt * .6)]); }
    flat(hill.concat([[s.x1, s.y1 - 40], [s.x0, s.y1 - 40]]), '#3E9A5A', { key: 'fr-ghill' });
    flat(R(s.x0, s.y1 - 44, s.x1, s.y1), '#8A5A3A', { key: 'fr-gground' });
    flat(R(s.x0, s.y1 - 48, s.x1, s.y1 - 38), '#6BCB5A', { key: 'fr-ggrass' });
    const off = (gt * 150) % 44; for (let x = s.x0 - off + 44; x < s.x1; x += 44) line([[x, s.y1 - 36], [x, s.y1 - 2]], '#6A4028', 2, 0);
    for (let i = 0; i < 5; i++) { const cx = s.x0 + ((i * 96 + 200 - gt * 150) % (w + 60) + w + 60) % (w + 60) - 30, cy = s.y1 - 100 - 26 * (i % 2); if (cx > s.x0 + 14 && cx < s.x1 - 14) { const sq = Math.abs(Math.cos(gt * 5 + i)); flat(oval(cx, cy, 9 * sq + 1.5, 10, 0, 12), COL.sun, { key: 'fr-gcoin' + i }); } }
    const bx = s.x0 + ((380 - gt * 150) % (w + 60) + w + 60) % (w + 60) - 30; if (bx > s.x0 + 20 && bx < s.x1 - 20) flat(R(bx - 16, s.y1 - 80, bx + 16, s.y1 - 48), '#C8643A', { key: 'fr-gbox' });
    const hop = Math.abs(Math.sin(bpOf(gt) * Math.PI)), hx = s.x0 + w * .3, hy = s.y1 - 48 - 16 - hop * 70;
    flat(oval(hx, hy, 17, 16 - 3 * (1 - hop), 0, 16), '#FF6FA8', { key: 'fr-ghero' });
    for (const e of [-6, 6]) flat(oval(hx + 4 + e, hy - 4, 3, 4.5, 0, 8), '#1A1020', { key: 'fr-gheye' + e });
    for (const f of [-8, 8]) flat(oval(hx + f, hy + 14, 7, 4, 0, 8), '#C83A6A', { key: 'fr-ghf' + f });
    if (paused) {   // she's paused it: the picture dims, two bars
      flat(R(s.x0, s.y0, s.x1, s.y1), '#0C0A14', { op: 150, key: 'fr-pausedim' });
      const cx = (s.x0 + s.x1) / 2, cy = (s.y0 + s.y1) / 2;
      for (const d of [-18, 18]) flat(R(cx + d - 9, cy - 34, cx + d + 9, cy + 34), '#F4F0FA', { key: 'fr-pausebar' + d });
    }
  }
  function tvFilm(ft, s, w, h) {   // a sci-fi film, letterboxed: stars, a ringed planet, a ship gliding past
    flat(rect(s.x0, s.y0, s.x1, s.y1), '#0B0C24', { key: 'fr-fsky' });
    for (let i = 0; i < 26; i++) { const x = s.x0 + 8 + hash(i * 3.1) * (w - 16), y = s.y0 + 30 + hash(i * 7.7) * (h - 60), r = 1.2 + 1.6 * hash(i) * (.6 + .4 * Math.sin(ft * 4 + i)); flat(oval(x, y, r, r, 0, 6), '#F4F0FF', { key: 'fr-fst' + i }); }
    const px = s.x0 + w * .7, py = s.y0 + h * .56, pr = h * .26;
    flat(oval(px, py, pr, pr, 0, 30), '#E07A5F', { key: 'fr-fplanet' });
    flat(curvy([[px - pr, py - pr * .1], [px + pr, py - pr * .3], [px + pr * .9, py + pr * .05], [px - pr * .95, py + pr * .2]], 3), '#F2A07A', { key: 'fr-fband' });
    const ring = oval(px, py, pr * 1.7, pr * .38, -.25, 30); line(ring.concat([ring[0]]), '#F6D6A8', 3, .5);
    const sx = s.x0 + w * (.12 + .45 * clamp(ft / 3.6)), sy = s.y0 + h * .34 + 8 * Math.sin(ft * 2);
    flat([[sx + 30, sy], [sx - 20, sy - 12], [sx - 12, sy], [sx - 20, sy + 12]], '#EDEFF8', { key: 'fr-fship' });
    flat(rect(s.x0, s.y0, s.x1, s.y0 + h * .13), '#050508', { key: 'fr-fbar1' }); flat(rect(s.x0, s.y1 - h * .13, s.x1, s.y1), '#050508', { key: 'fr-fbar2' });
  }
  // A bean bag: a big squashy blob, higher at the back (-f side); squash 0..1 flattens it (someone just landed).
  function beanBag(x, f, col, dk, squash, key) {
    const sx = 1 + .16 * squash, sy = 1 - .2 * squash, cy = 900;
    const P = [[-160, 96], [-170, 30], [-150, -40], [-105, -96], [-40, -112], [30, -86], [96, -62], [150, -20], [168, 40], [156, 96], [70, 118], [-70, 118]]
      .map(([a, b]) => [x + a * f * sx, cy + b * sy + 20 * squash]);
    piece(curvy(P, 5), col, { sw: 2.4, shade: dk, depth: 46, key });
    pen(curvy([[x - 60 * f, cy - 30], [x + 20 * f, cy - 12], [x + 90 * f, cy - 30]].map(([a, b]) => [a, b + 10 * squash]), 4).slice(0, 12), 1.6, .5);   // the dent
    line([[x - 120 * f, cy - 50], [x - 80 * f, cy - 88]], mixCol(col, '#FFFFFF', .35), 3, .5);   // a sheen
  }
  // Snacks: behind the characters' feet (popcorn, crisps, her phone) and in front (the pizza box, sweets, dip).
  function snacksBack(t) {
    boilSeed('fr-snacksB');
    // popcorn bucket (it jumps when he lands)
    const bx = 1000, by = 880, a = t - T_LAND, pop = a > 0 && a < .7 ? a : -1;
    piece([[bx - 34, by - 40], [bx + 34, by - 40], [bx + 26, by + 34], [bx - 26, by + 34]], '#F4EEE6', { sw: 2, key: 'fr-bucket' });
    for (let i = -2; i <= 2; i += 2) piece([[bx + i * 12 - 6, by - 40], [bx + i * 12 + 6, by - 40], [bx + i * 9.5 + 5, by + 34], [bx + i * 9.5 - 5, by + 34]], '#D8343F', { ink: null, key: 'fr-stripe' + i, flatCard: true });
    for (let i = 0; i < 7; i++) { const px = bx - 30 + i * 10, py = by - 44 - 8 * hash(i); piece(oval(px, py, 11, 9, i, 10), COL.popcorn, { sw: 1.3, key: 'fr-pc' + i, flatCard: true }); }
    if (pop >= 0) for (let i = 0; i < 7; i++) { const v = [(i - 3) * 60, -560 - 120 * hash(i + 4)], p = [bx + v[0] * pop, by - 50 + v[1] * pop + 1400 * pop * pop]; if (p[1] < by - 30) piece(oval(p[0], p[1], 9, 8, i, 10), COL.popcorn, { sw: 1.2, key: 'fr-pcj' + i, flatCard: true }); }
    // crisps packets, torn open, crisps spilling
    for (const [x, y, c, r, k] of [[655, 1000, '#3FA0E0', -.3, 'a'], [1110, 880, '#6BCB5A', .35, 'b']]) {
      // a packet: crimped top and bottom, torn open at the top, crisps poking out and spilt beside it
      for (let i = 0; i < 3; i++) piece(tr(oval(-14 + i * 14, -40 - 6 * (i % 2), 11, 7, .4 * i, 10), 0, 0, 1, 0).map(([a, b]) => [x + a * Math.cos(r) - b * Math.sin(r), y + a * Math.sin(r) + b * Math.cos(r)]), '#F2C14E', { sw: 1.1, key: 'fr-crispin' + k + i, flatCard: true });
      piece(tr(curvy([[-32, -36], [0, -30], [32, -36], [36, 28], [0, 34], [-36, 28]], 3), x, y, 1, r), c, { sw: 2, shade: mixCol(c, '#101020', .3), depth: 12, key: 'fr-crisps' + k });
      pen(tr([[-34, 22], [-26, 30], [-18, 22], [-10, 30], [-2, 22], [6, 30], [14, 22], [22, 30], [30, 22]], x, y, 1, r), 1.4);
      piece(tr(oval(0, -2, 13, 11, 0, 12), x, y, 1, r), '#F4EEE6', { sw: 1.2, key: 'fr-crisplabel' + k, flatCard: true });
      piece(tr(oval(0, -2, 6, 5, 0, 10), x, y, 1, r), '#F2C14E', { ink: null, key: 'fr-crisplogo' + k, flatCard: true });
      for (let i = 0; i < 3; i++) piece(oval(x + (i - 1) * 16 + 44 * Math.sign(r), y + 34 + 4 * i, 8, 5, i, 10), '#F2C14E', { sw: 1, key: 'fr-crisp' + k + i, flatCard: true });
    }
  }
  function snacksFront(t) {
    boilSeed('fr-snacksF');
    // the pizza box, open, a slice gone
    const px = 985, py = 1046, z = P => P.map(([x, y]) => [px + (x - px) * .8, py + (y - py) * .8]);
    piece(z([[px - 118, py - 76], [px + 118, py - 76], [px + 104, py - 150], [px - 104, py - 150]]), '#D9AE72', { sw: 2, key: 'fr-pizzalid' });
    piece(z([[px - 128, py - 70], [px + 128, py - 70], [px + 150, py + 40], [px - 150, py + 40]]), COL.pizzaBox, { sw: 2.2, key: 'fr-pizzabox' });
    const pz = []; for (let i = 0; i <= 26; i++) { const a = -.5 + i / 26 * (TAU - .95); pz.push([px + Math.cos(a) * 112, py - 14 + Math.sin(a) * 42]); }
    pz.push([px, py - 14]);
    piece(z(pz), COL.crust, { sw: 2, key: 'fr-pizzacrust', flatCard: true });
    piece(z(pz.map(([x, y]) => [lerp(px, x, .86), lerp(py - 14, y, .8)])), COL.cheese, { ink: null, key: 'fr-pizzacheese', flatCard: true });
    for (let i = 0; i < 7; i++) { const a = -.2 + i * .8, r = .55 * (i % 2 ? 1 : .75); piece(z(oval(px + Math.cos(a) * 112 * r, py - 14 + Math.sin(a) * 42 * r, 11, 5, 0, 10)), COL.pepperoni, { sw: .9, key: 'fr-pep' + i, flatCard: true }); }
    // sweets, wrapped, scattered
    [[820, 1010, AQUA], [1150, 1030, MAG], [870, 1060, COL.sun], [1190, 990, '#7CE07C']].forEach(([x, y, c], i) => {
      const a = hash(i + 9) * 2;
      piece(tr(oval(0, 0, 11, 8, 0, 12), x, y, 1, a), c, { sw: 1.2, key: 'fr-sweet' + i, flatCard: true });
      for (const s of [-1, 1]) piece(tr([[s * 10, 0], [s * 20, -7], [s * 20, 7]], x, y, 1, a), c, { sw: 1, key: 'fr-sweetend' + i + s, flatCard: true });
    });
    // a bowl of dip with nachos in it
    const dx = 1260, dy = 1030;
    for (let i = 0; i < 4; i++) { const a = -2.4 + i * .5; piece(tr([[0, 0], [30, -8], [26, 16]], dx + Math.cos(a) * 26, dy - 16 + Math.sin(a) * 8, 1, a - .6), COL.cheese, { sw: 1.2, key: 'fr-nacho' + i, flatCard: true }); }
    piece(curvy([[dx - 50, dy - 18], [dx + 50, dy - 18], [dx + 40, dy + 16], [dx - 40, dy + 16]], 3), '#F4EEE6', { sw: 2, key: 'fr-bowl' });
    piece(oval(dx, dy - 18, 46, 10, 0, 18), '#7BB84A', { sw: 1.4, key: 'fr-guac', flatCard: true });
    // her phone, face down on the rug: nobody's buzzing anybody
    piece(tr(curvy([[-20, -36], [20, -36], [20, 36], [-20, 36]], 2), 1360, 990, 1, 1.2), '#2A2E38', { sw: 1.8, key: 'fr-phone' });
    piece(tr(curvy([[-15, -31], [3, -31], [3, -13], [-15, -13]], 2), 1360, 990, 1, 1.2), '#8E97AA', { sw: 1.1, key: 'fr-cam', flatCard: true });
  }

  // ---------- shot A: the two of them from behind (the rig has front and 3/4 views, so these are drawn here) ----------
  // backView(x, y, u, P, who, o): the preset P from behind, sat in a bean bag (hips SEAT_A above the ground point y).
  // o.turn -1..1 (the head turning to frame-left / right: a lost profile shows on that side), o.dy (u, up -), o.tilt,
  // o.arms { L, R }: each { e: elbow, w: wrist or null (the forearm hidden in front of the body), hold(s), late } in body
  // units (L = frame-left); o.late draws only the arms marked late (an arm reaching down in front of the bean bag).
  function backView(x, y, u, P, who, o = {}) {
    const her = who === 'her', b = P.body, hd = P.head, f = P.face, tp = P.top, hr = P.hair || {}, ex = P.extra || {}, C0 = P.col;
    const hairC = pencilHair(C0.hair), turn = clamp(o.turn || 0, -1, 1), sw = clamp(u / 20, .55, 2.2), S = pts => U(pts, u), key = 'fr-bk' + who;
    const Fr = personFrame(P, { seated: true, seatH: SEAT_A }), ys = Fr.ys, yc = Fr.yc, hw = hd.w, hh = hd.h / 2, hy = Fr.hy, hx = turn * .1 * hw;
    const shX = tp.sh[0], aw = b.armW;
    push(); translate(x, y + (o.dy || 0) * u);
    const arm = (s, A) => {
      if (!A) return;
      boilSeed(key + 'arm' + s);
      const root = [s * (shX - aw * .45), ys + Math.max(tp.sh[1], .15) + aw * .4], e = A.e;
      if (!A.w) { limb(S([root, [lerp(root[0], e[0], .5) + s * .12, lerp(root[1], e[1], .5)], e]), aw * u, aw * .92 * u, C0.coat, { sw, shade: C0.coatDk, key: key + 'arm' + s }); return; }
      const r = limb(S([root, e, A.w]), aw * u, b.wrist * u, C0.coat, { sw, shade: C0.coatDk, key: key + 'arm' + s });
      const ca = r.ang, cw = b.wrist * 1.12, e0 = [r.tip[0] - Math.cos(ca) * .32 * u, r.tip[1] - Math.sin(ca) * .32 * u];
      piece(ppBar(e0, [r.tip[0] + Math.cos(ca) * .04 * u, r.tip[1] + Math.sin(ca) * .04 * u], cw * u, cw * 1.04 * u), C0.cuff || C0.coatDk, { sw, key: key + 'cuff' + s });
      hand(r.tip[0] + Math.cos(ca) * .08 * u, r.tip[1] + Math.sin(ca) * .08 * u, ca, b.hand * u, { pose: A.hold ? 'hold' : 'relax', col: C0.skin, sw, mirror: s < 0, key: key + 'h' + s, hold: A.hold && (hs => { push(); if (s < 0) scale(1, -1); rotate(-ca); A.hold(hs); pop(); }) });
    };
    if (o.late) { for (const [s, A] of [[-1, o.arms.L], [1, o.arms.R]]) if (A && A.late) arm(s, A); pop(); return; }
    for (const [s, A] of [[-1, o.arms && o.arms.L], [1, o.arms && o.arms.R]]) if (A && !A.late) arm(s, A);
    // the jumper's back (its silhouette is the rig's, mirrored), a ribbed collar at the back of the neck
    boilSeed(key + 'torso');
    const TR = [[0, ys - (tp.neckY ?? .15)], [tp.neck ?? .9, ys - .1], [shX, ys + tp.sh[1], tp.sharp ? 1 : 0], ...tp.rows.map(r => [r[0], ys + r[1], r[2] || 0])];
    piece(S(ppShape(ppMirror(TR), 6)), C0.coat, { sw: sw * 1.15, shade: C0.coatDk, depth: .7 * u, key: key + 'torso', side: false });
    dline(S([[-shX * .3, ys + b.torso * .45], [0, ys + b.torso * .47], [shX * .3, ys + b.torso * .45]]), sw * .5, C0.coatDk, .5);   // a fold down the back
    // neck and head (the head's outline is the preset's: from behind it's the front's)
    push(); translate(0, (yc - .3) * u); rotate(o.tilt || 0); translate(0, -(yc - .3) * u);
    boilSeed(key + 'head');
    const nw = hw * (hd.neck ?? .42);
    piece(ppShape(S([[hx * .5 - nw, yc - .6], [hx * .5 + nw, yc - .6], [nw * 1.05, ys + .3], [-nw * 1.05, ys + .3]]), 2), C0.skinDk, { ink: null, key: key + 'neck' });
    for (const s of [-1, 1]) pen(S([[hx * .5 + s * nw, yc - .4], [s * nw * 1.03, ys + .1]]), sw * .9);
    piece(curvy(S([[-nw * 1.55, ys - .12], [nw * 1.55, ys - .12], [nw * 1.3, ys + .38], [0, ys + .32], [-nw * 1.3, ys + .38]]), 4), C0.coatDk, { sw: sw * .8, key: key + 'crew' });
    const R0 = [[0, -1], [hd.crown * .62, -.93], [hd.crown * .95, -.55], [hd.cheek ?? 1, hd.cheekY ?? 0, hd.cheekC ? 1 : 0], [hd.jaw, hd.jawY ?? .55, hd.jawC ? 1 : 0], [hd.chin, .93, hd.chinC ? 1 : 0], [0, 1]];
    const HP = ([a, c, cr]) => [hx + a * hw, hy + c * hh, cr], headO = ppShape(ppMirror(R0).map(HP), 6);
    const earY = hy + lerp(f.eyeY, f.noseY, .52) * hh, earS = f.ear ?? 1, side = Math.sign(turn), tk = clamp((Math.abs(turn) - .3) / .6);
    const ears = () => { for (const s of [-1, 1]) {   // the one on the turning side slides round towards us, the other goes behind
      if (s * turn > .5) continue;
      const exx = hx + s * (ppWidthAt(R0, (earY - hy) / hh) * hw + .1 - Math.max(0, -s * turn) * .9), eh = .58 * earS, ew2 = .36 * earS;
      piece(S(oval(exx, earY, ew2, eh, 0, 16)), C0.skin, { sw: sw * .85, key: key + 'ear' + s });
      if (f.hoops) piece(ppRing(exx * u, (earY + eh * 1.24) * u, .26 * u, .3 * u, .1 * u, -Math.PI / 2), f.hoops, { sw: sw * .25, key: key + 'hoop' + s, flatCard: true });
    } };
    // the lost profile, turning: brow, cheek and chin just past the head's edge (her glasses)
    const W0 = c => ppWidthAt(R0, c) * hw, ex0 = c => hx + side * (W0(c) + (her ? .2 + .25 * tk : .05 + .14 * tk)), yy = c => hy + c * hh;
    const profile = () => { if (tk <= 0) return;   // (her hair covers its top: drawn under it)
      const P2 = [[hx + side * W0(-.2) * .85, yy(-.3)], [ex0(-.15), yy(-.12)], [ex0(f.eyeY) + side * .05, yy(f.eyeY + .12)], [ex0(f.noseY) + side * .28 * tk, yy(f.noseY)], [ex0(f.noseY) - side * .02, yy(f.noseY + .12)], [ex0(f.mouthY) + side * .04, yy(f.mouthY)], [hx + side * W0(.85) * .9, yy(.97)]];
      piece(curvy(S(P2), 3), C0.skin, { sw, key: key + 'cheek' });
    };
    const rimTip = () => { if (tk > 0 && P.glasses) edgeLine(S(oval(ex0(f.eyeY) + side * .1, yy(f.eyeY + .02), .08 + .08 * tk, P.glasses.r * hw * .9, 0, 14)), 1.9, INK, true); };   // her glasses' rim, just past her cheek
    if (her) {
      // big curls over the whole back of the head, down to the nape (her hair's up), the ears' tops under them; the bun,
      // the pencil through it (from behind it leans the other way)
      piece(S(headO), C0.skin, { sw: sw * 1.1, shade: C0.skinDk, depth: .4 * u, key: key + 'head' });   // (below her hair: the nape)
      profile(); ears();
      const hairO = ppBumpy(ppScale(headO, [hx, hy], 1 + (hr.puff || 0) * .2, 1.05), [hx, hy], 14, .05).map(([X, Y]) => [X, Math.min(Y, hy + (.6 - .5 * Math.pow(clamp(Math.abs(X - hx) / (hw * 1.2)), 2)) * hh)]);
      piece(S(hairO), hairC, { sw: sw * 1.1, shade: mixCol(hairC, NOIR.ink, .3), depth: .4 * u, key: key + 'hair' });
      for (let i = 0; i < 12; i++) { const a = hash(i * 7.7 + 1) * TAU, r = Math.sqrt(hash(i * 3.3 + 5)) * .75, cx0 = hx + Math.cos(a) * hw * r, cy0 = hy - .2 * hh + Math.sin(a) * hh * r * .7, a0 = hash(i * 1.9) * TAU, arc = []; for (let j = 0; j <= 6; j++) { const aa = a0 + j / 6 * Math.PI * 1.3; arc.push([cx0 + Math.cos(aa) * .16 * hw, cy0 + Math.sin(aa) * .13 * hw]); } line(S(arc), C0.hairLt, 1.5, .5); }
      if (f.hoops) for (const s of [-1, 1]) { if (s * turn > .5) continue; const exx = hx + s * (ppWidthAt(R0, (earY - hy) / hh) * hw + .1 - Math.max(0, -s * turn) * .9); piece(ppRing(exx * u, (earY + .58 * earS * 1.24) * u, .26 * u, .3 * u, .1 * u, -Math.PI / 2), f.hoops, { sw: sw * .25, key: key + 'hoopF' + s, flatCard: true }); }
      const bn = hr.bun || {}, bc = [hx + (bn.x ?? 0) * hw, hy + (bn.y ?? -1.3) * hh], br = (bn.r ?? 1) * hw, bry = br * (bn.shape === 'tall' ? 1.35 : 1);
      const bunO = ppScallop(bc[0], bc[1], br, bry, 13, .1, -.2);
      piece(S(bunO), hairC, { sw: sw * 1.1, shade: mixCol(hairC, NOIR.ink, .3), depth: .45 * u, key: key + 'bun' });
      for (let i = 0; i < 9; i++) { const a = hash(i * 5.1 + 2) * TAU, r = Math.sqrt(hash(i * 2.7 + 9)) * .68, cx0 = bc[0] + Math.cos(a) * br * r, cy0 = bc[1] + Math.sin(a) * bry * r, a0 = hash(i * 3.9) * TAU, arc = []; for (let j = 0; j <= 6; j++) { const aa = a0 + j / 6 * Math.PI * 1.3; arc.push([cx0 + Math.cos(aa) * .16 * hw, cy0 + Math.sin(aa) * .13 * hw]); } line(S(arc), C0.hairLt, 1.5, .5); }
      if (ex.pencil) {   // (as the rig draws it; mirrored, since we see the bun from behind)
        const pa = Math.PI - (ex.pencil.ang ?? -.5), L2 = br * (ex.pencil.len ?? 2.05), c = [bc[0], bc[1] + bry * .05], d = [Math.cos(pa), Math.sin(pa)];
        const a0 = [c[0] - d[0] * L2 * .5, c[1] - d[1] * L2 * .5], a1 = [c[0] + d[0] * L2 * .5, c[1] + d[1] * L2 * .5], pw = .32;
        piece(S(ppBar(a0, [a1[0] - d[0] * .5, a1[1] - d[1] * .5], pw)), '#F2C230', { sw: sw * .6, key: key + 'pencil' });
        piece(S([[a1[0] - d[0] * .55 - d[1] * pw * .5, a1[1] - d[1] * .55 + d[0] * pw * .5], a1, [a1[0] - d[0] * .55 + d[1] * pw * .5, a1[1] - d[1] * .55 - d[0] * pw * .5]]), '#E8C9A0', { sw: sw * .5, key: key + 'ptip', flatCard: true });
        piece(S(ppBar(a0, [a0[0] + d[0] * .35, a0[1] + d[1] * .35], pw * 1.05)), '#E88A9A', { sw: sw * .5, key: key + 'perase', flatCard: true });
      }
      if (C0.tie) piece(ppScallop(bc[0] * u, (bc[1] + bry * .86) * u, br * .62 * u, .24 * hw * u, 9, .18, 0), C0.tie, { sw: sw * .7, key: key + 'tie', flatCard: true });
      rimTip();
    } else {
      // the back of his head: skin, the crop from the beanie down to the nape, the ears; then the beanie over the top
      profile();
      piece(S(headO), C0.skin, { sw: sw * 1.1, shade: C0.skinDk, depth: .4 * u, key: key + 'head' });
      const yb = hy + (hr.hatY ?? -.44) * hh, nape = X => hy + (.5 - .35 * Math.pow(clamp(Math.abs(X - hx) / hw), 2)) * hh;
      const crop = ppScale(headO, [hx, hy], 1.02, 1.01).filter(([, Y]) => Y > yb - .3).map(([X, Y]) => [X, Math.min(Y, nape(X))]);
      piece(S(crop), hairC, { sw: sw * .8, key: key + 'crop' });
      for (let i = 0; i < 46; i++) {   // close-cropped: a nap of little biro curls (his near-black hair: the pencil alone reads as skin)
        const px = hx + (hash(i * 2.3 + 1) - .5) * 1.75 * hw, py = lerp(yb + .15, nape(px) - .1, hash(i * 4.1 + 3));
        if (((px - hx) / (hw * 1.02)) ** 2 + ((py - hy) / (hh * 1.01)) ** 2 > .92) continue;
        pen(S([[px - .09, py + .04], [px, py - .06], [px + .09, py + .04]]), 1.3, .5);
      }
      ears();
      const c = [hx, hy + .1 * hh], dome0 = ppScale(ppArc(headO, yb, true), c, 1.1, 1.08), topY = Math.min(...dome0.map(p => p[1]));
      const dome = dome0.map(([X, Y]) => [X, Y - (hr.hatH ?? .35) * Math.pow(clamp((yb - Y) / (yb - topY)), 2)]), L0 = dome[0], R1 = dome[dome.length - 1];
      piece(S(dome.concat(through([R1, [hx, yb + .2], L0], 6).slice(1, -1))), C0.hat, { sw: sw * 1.1, shade: C0.hatDk, depth: .35 * u, key: key + 'hat' });
      const cuffH = hr.cuffH ?? .85, yt = yb - cuffH, wAt = Y => ppWidthAt(R0, (Y - hy) / hh) * hw * 1.12;
      const cuff = [[hx - wAt(yt), yt], [hx, yt + .12], [hx + wAt(yt), yt], [hx + wAt(yb) + .05, yb + .05], [hx, yb + .28], [hx - wAt(yb) - .05, yb + .05]];
      piece(S(curvy(cuff, 4)), C0.hat, { sw, shade: C0.hatDk, depth: .15 * u, key: key + 'cuff' });
      for (let i = 1; i < 12; i++) { const xx = lerp(-wAt(yb) * .95, wAt(yb) * .95, i / 12), w = Math.abs(xx) / wAt(yb); dline(S([[hx + xx, yt + .18 + .1 * (1 - w * w)], [hx + xx, yb + .12 + .12 * (1 - w * w)]]), sw * .45, C0.hatDk, 0); }
    }
    pop();
    for (const [s, A] of [[-1, o.arms && o.arms.L], [1, o.arms && o.arms.R]]) if (A && A.front) arm(s, A);
    pop();
  }
  // A bean bag from behind: its back in the foreground, holding whoever's in it.
  function beanBagBack(x, col, dk, key) {
    const P = [[-270, 230], [-282, 110], [-250, 20], [-170, -26], [-60, -38], [60, -38], [170, -26], [250, 20], [282, 110], [270, 230]].map(([a, b]) => [x + a, 975 + b]);
    piece(curvy(P, 5), col, { sw: 2.4, shade: dk, depth: 50, key, side: false });
    line([[x - 190, 1005], [x - 130, 965]], mixCol(col, '#FFFFFF', .35), 3, .5);
    pen(curvy([[x - 90, 1045], [x, 1060], [x + 90, 1045]], 4).slice(0, 12), 1.4, .5);   // a seam
  }
  // Shot A's acting: [her, him] backView options at time t (arm points in body units, from each one's own frame).
  function backStates(t) {
    const Fh = personFrame(HER_P, { seated: true, seatH: SEAT_A }), Fm = personFrame(HIM_P, { seated: true, seatH: SEAT_A });
    const hS = HER_P.top.sh[0], mS = HIM_P.top.sh[0], hy = Fh.ys, my = Fm.ys;
    const canUp = hs => { scale(MS); can(CAN_S, COL.canHer, 'frSa'); };
    // her: gaming (elbows out, mashing on the eighths), the knock (the controller down, her head round to the door on
    // the left), reaching down for her can between the bean bags; later, watching the film with it
    const mash = t < T_KNOCK[0] ? .14 * Math.sin(bpOf(t) * Math.PI * 4) : 0, look = ease(seg(t, T_KNOCK[0] + .02, T_KNOCK[0] + .16));
    let herO;
    if (t < T_FILM) {
      const game = { e: [-(hS + 1.55) - mash, hy + 1.85 + mash], w: null }, gameR = { e: [hS + 1.55 + mash, hy + 1.85 - mash], w: null };
      const rest = { e: [-(hS + .45), hy + 2.7], w: null }, restR = { e: [hS + .45, hy + 2.7], w: null };
      let L = t < T_KNOCK[0] ? game : rest;
      if (t >= T_GRAB - .12) {   // the reach: her left arm out and down to the can, then up with it
        const g = ease(seg(t, T_GRAB - .12, T_GRAB)), lift = ease(seg(t, T_GRAB + .06, T_DOOR));
        const can0 = [(CAN_A[0] - HER_XA) / UA, (CAN_A[1] - GYA) / UA], reachW = [can0[0] + .9, can0[1] + .2], upW = [-(hS + .45), hy + .9];
        const w = t < T_GRAB ? [lerp(-(hS + .6), reachW[0], g), lerp(hy + 3.2, reachW[1], g)] : [lerp(reachW[0], upW[0], lift), lerp(reachW[1], upW[1], lift)];
        L = { e: [lerp(-(hS + 1.0), -(hS + 1.9), g) + 1.0 * lift, lerp(hy + 2.6, hy + 3.1, g) - .3 * lift], w, hold: t >= T_GRAB ? canUp : null, late: true };
      }
      herO = { turn: -.85 * look + .15 * ease(seg(t, T_GRAB + .15, T_DOOR)), dy: t < T_KNOCK[0] ? -.05 * pulse(t, 5) : take(t, T_KNOCK[0], .5).dy * .4, tilt: t < T_KNOCK[0] ? .04 : 0, arms: { L, R: t < T_KNOCK[0] ? gameR : restR } };
    } else {   // watching the TV flick over to the film: a little take, then settling
      herO = { turn: .12 * ease(seg(t, 4.35, 4.55)), dy: -.25 * Math.exp(-Math.max(0, t - T_FILM - .12) * 6) * (t > T_FILM + .12 ? 1 : 0), arms: { L: { e: [-(hS + .9), hy + 2.7], w: [-(hS + .45), hy + .9], hold: canUp }, R: { e: [hS + .45, hy + 2.7], w: null } } };
    }
    // him (only after the cut back: he's in by then): his can on his right, the biscuits on his left; he turns to her
    const himCan = hs => { scale(MS); can(CAN_S, COL.canHim, 'frHa'); };
    const himO = { turn: .75 * ease(seg(t, 4.3, 4.46)), dy: -.25 * Math.exp(-Math.max(0, t - T_FILM - .08) * 6) * (t > T_FILM + .08 ? 1 : 0),
      arms: { L: { e: [-(mS + .35), my + 2.2], w: null }, R: { e: [mS + .6, my + 2.3], w: [mS + .35, my + .75], hold: himCan } } };
    return [herO, himO];
  }

  // ---------- the people (shot B) ----------
  const CANW = 16;   // half a can: the cans' centres sit this far either side of the clink point
  const PAD_W = 100;
  // HIM: behind the door, in the doorway (further off, so smaller), in the air towards us, on his bean bag
  function him(t) {
    const phase = t < T_DOOR + .08 ? 'hidden' : t < T_HOP ? 'door' : t < T_LAND ? 'air' : 'seat';
    const e = calm(emotions(t, [[0, 'excited', { mouth: 'grin', lookX: .8 }], [T_LAND, 'happy', { lookX: .6 }], [T_LAND + .3, 'neutral', { mouth: 'grin', lookX: 1 }],
      [TC - .25, 'excited', { lookX: .8, mouth: 'grin' }], [TC + .4, 'happy', { lookX: .5 }], [T_FILM + .05, 'neutral', { mouth: 'smile', lookX: -.45, lookY: -.3 }],   // (the film: the TV is at the camera)
      [T_TALK - .08, 'determined', { lookX: .85 }], [T_DUCK + .33, 'laugh']]), true, phase === 'door' ? 2 : 1);
    const o = { ...e, view: 'q', flip: true, noShadow: true, boilKey: 'frH', seed: 1, seated: true, seatH: SEAT_H };
    let x = HIM_X, y = GB, u = U0;
    if (phase === 'hidden' || phase === 'door') { [x, y] = DOOR_SPOT; u = U_DOOR; o.seated = false; o.sq += .24 * ease(seg(t, T_HOP - .14, T_HOP)); }
    else if (phase === 'air') {
      const k = seg(t, T_HOP, T_LAND), kx = lerp(k, ease(k), .5);
      x = lerp(DOOR_SPOT[0], HIM_X, kx); y = lerp(DOOR_SPOT[1], GB, k) - 170 * 4 * k * (1 - k); u = lerp(U_DOOR, U0, k);
      o.rot = .2 * Math.sin(k * Math.PI); o.sq = k < .2 ? -.2 : 0;
    } else { const a = t - T_LAND; o.sq += .34 * Math.exp(-a * 7) * Math.cos(a * 18); }
    if (t >= T_TALK - .08 && t < T_DUCK + .33) o.mouth = ['grin', 'flat', 'o', 'smile', 'grin', 'o'][Math.floor(bpOf(t) * 2) % 6];
    const hit = take(t, TC, .45); o.sq += hit.sq * .6; o.dy += hit.dy * .2;
    const lean = .08 * ease(seg(t, 3.0, 3.35)) * (1 - ease(seg(t, 3.6, 4.0)));
    const laughK = ease(seg(t, T_DUCK + .33, T_DUCK + .58));
    o.rot -= lean; o.tilt = -laughK * (.12 + .05 * Math.abs(Math.sin(t * TAU * 2.5)));
    const C = pcfg(x, y, u, o), Fr = personFrame(HIM_P, { seated: o.seated, seatH: SEAT_H, view: 'q' });
    // his can (right hand, towards her): keys by reach (see grip()); the clink is a world point
    const rest = grip(HIM_P, Fr, 1, 62, .91, -.5), up = grip(HIM_P, Fr, 1, -55, .88, -1.35), wind = grip(HIM_P, Fr, 1, 25, .84, -.9, { tilt: -.1 });
    const cheers = grip(HIM_P, Fr, 1, -66, .84, -1.2, { tilt: .05, ease: easeOut, arc: 10 });   // (up, on his own side of the clink)
    const m = propTrack(t, C, [
      [0, up], [T_LAND, up], [T_LAND + .3, rest],
      [2.85, rest], [3.02, wind], [3.24, cheers],
      [TC, { w: 1, p: [XC + CANW, YC], a: -1.1, tilt: .15, ease: easeIn }], [3.6, { w: 1, p: [XC + CANW, YC], a: -1.1, tilt: .15 }], [4.0, grip(HIM_P, Fr, 1, 84, .74, -.85)]]);   // (after the clink, by his hip: at the bar their cans and hands sat on each other)
    if (t >= TC && t < 3.8) m.w[0] += 7 * Math.max(0, spring(t, TC, 7, 22));   // the knock of the clink
    const cb = toR(C, m.w), angR = m.a;
    const R = holdAt(HIM_P, cb, angR, 'hold', .25);
    // the biscuits (left hand): held up high at the door and in the air, on his knee once he's sat, waved when he laughs
    const shake = t > T_DUCK + .33 ? .5 * Math.sin(t * TAU * 5) : 0;
    const gb = (deg, k, a) => { const g = grip(HIM_P, Fr, -1, deg, k, a); return holdAt(HIM_P, g.p, a, 'hold', .2); };
    const L = specTrack(t, [[0, gb(-100, .88, -1.75)], [T_LAND + .1, gb(55, .92, -1.1)], [T_DUCK + .33, gb(-95 + shake * 10, .88, -1.8)]]);
    const fizz = t >= TC ? Math.exp(-(t - TC) * 3) : 0;
    o.pose = { L, R };
    o.hold = canHold(C, angR, m.tilt, COL.canHim, 'frHc', fizz);
    o.holdL = biscuitHold(C, L[5], 'frHb', shake * .15);
    if (window.FR_DEV && (!reachOK(HIM_P, Fr, 1, R) || !reachOK(HIM_P, Fr, -1, L))) console.warn(`friday: his arm can't reach at ${t.toFixed(2)}`);
    return { o, C, Fr, x, y, u, phase, canW: m.w };
  }
  // HER: on her bean bag (shot B starts as he comes in: the controller's in her lap, her can in her hand)
  function her(t) {
    const e = calm(emotions(t, [[0, 'neutral', { lookX: 1, lookY: -.1, mouth: 'flat' }],
      [T_DOOR + .1, 'smug', { lookX: 1 }], [T_LAND + .05, 'happy', { lookX: .8 }], [T_LAND + .45, 'neutral', { mouth: 'smile', lookX: 1 }],
      [TC - .17, 'excited', { lookX: .8 }], [TC + .45, 'neutral', { mouth: 'smirk', lookX: -.45, lookY: -.3 }],   // (the film: at the camera)
      [T_TALK + .3, 'neutral', { mouth: 'smirk', lookX: 1 }], [T_DUCK + .17, 'laugh', { blush: 1 }]]), false);
    const o = { ...e, view: 'q', seated: true, seatH: SEAT_H, noShadow: true, boilKey: 'frS', seed: 4 };
    const bounce = t >= T_LAND ? Math.max(0, spring(t, T_LAND, 6, 16)) : 0;
    o.dy -= .5 * bounce;
    const hit = take(t, TC, .45); o.sq += hit.sq * .6; o.dy += hit.dy * .2;
    const lean = .08 * ease(seg(t, 3.05, 3.38)) * (1 - ease(seg(t, 3.6, 4.0)));
    const laughK = ease(seg(t, T_DUCK + .17, T_DUCK + .4));
    o.rot += lean; o.tilt = -laughK * (.14 + .05 * Math.abs(Math.sin(t * TAU * 2.2 + 1)));
    const C = pcfg(HER_X, GB, U0, o), Fr = personFrame(HER_P, { seated: true, seatH: SEAT_H, view: 'q' }), sL = shoulderQ(HER_P, Fr, -1);
    // her can (left hand, the one towards him): raised to him with a smirk as he comes in, down, cheers, the clink
    const rest = grip(HER_P, Fr, 1, 58, .8, -.55), up = grip(HER_P, Fr, 1, -35, .78, -1.3, { tilt: .12, ease: backOut }), upHold = { ...up, ease: ease };
    const wind = grip(HER_P, Fr, 1, 22, .8, -.9, { tilt: -.1 }), cheers = grip(HER_P, Fr, 1, -62, .8, -1.2, { tilt: .05, ease: easeOut, arc: 8 });
    const m = propTrack(t, C, [
      [0, rest], [T_DOOR + .1, rest], [T_DOOR + .35, up], [T_HOP + .1, upHold], [T_HOP + .4, rest],
      [2.9, rest], [3.08, wind], [3.28, cheers],
      [TC, { w: 1, p: [XC - CANW, YC], a: -1.1, tilt: .15, ease: easeIn }], [3.66, { w: 1, p: [XC - CANW, YC], a: -1.1, tilt: .15 }], [4.05, grip(HER_P, Fr, 1, 86, .72, -.95)]]);   // (after the clink, by her hip, not at the bar under his)
    if (t >= TC && t < 3.8) m.w[0] -= 7 * Math.max(0, spring(t, TC, 7, 22));
    const cb = toR(C, m.w), angR = m.a;
    const R = holdAt(HER_P, cb, angR, 'hold', .25);
    // her other hand: on the controller in her lap; laughing, to her belly (the controller left in her lap)
    const lap = [sL[0] + 2.4, Fr.yh - .45], holding = t < T_DUCK + .22;
    const L = specTrack(t, [[0, holdAt(HER_P, lap, .15, 'hold', .3)], [T_DUCK + .22, [sL[0] + 2.3, Fr.ys + 3.1, .3, 'relax', 1, .3, 'u']]], .2);   // (low on her belly, the elbow at her side: held up under her chest the arm folded into a V)
    const fizz = t >= TC ? Math.exp(-(t - TC) * 3) : 0;
    o.pose = { L, R };
    o.hold = canHold(C, angR, m.tilt, COL.canHer, 'frSc', fizz);
    if (holding) o.holdL = padHold(C, L[5], 'fr-pad');
    if (window.FR_DEV && (!reachOK(HER_P, Fr, 1, R) || !reachOK(HER_P, Fr, -1, L))) console.warn(`friday: her arm can't reach at ${t.toFixed(2)}`);
    return { o, C, Fr, canW: m.w, padW: holding ? null : toW(C, lap), slop: bounce };
  }

  // ---------- speech bubbles (pictures, never words) ----------
  function bubble(cx, cy, rx, ry, tip, k, key, content) {
    if (k <= .01) return;
    boilSeed(key);
    push(); translate(cx, cy); scale(k); translate(-cx, -cy);
    const ta = Math.atan2(tip[1] - cy, tip[0] - cx), P = [], n = 40, gap = .2;
    for (let i = 0; i <= n; i++) { const a = ta + gap + i / n * (TAU - 2 * gap), w = 1 + .05 * Math.sin(a * 5 + keyHash(key)); P.push([cx + Math.cos(a) * rx * w, cy + Math.sin(a) * ry * w]); }
    P.push(tip);
    knock([P]); loopPen(P, 2.2);
    content();
    pop();
  }
  // the world, put to rights: a globe with two sticking plasters on it
  function globe(x, y, r, t, key) {
    push(); translate(x, y); rotate(.1 * Math.sin(t * 2.5));
    piece(oval(0, 0, r, r, 0, 28), COL.ocean, { sw: 2, key: key + 'g' });
    for (const [lx, ly, s, a] of [[-.35, -.3, .42, .3], [.4, .25, .36, -.4], [-.1, .55, .22, 0]]) {
      const L = oval(lx * r, ly * r, s * r, s * r * .7, a, 12).map(([px, py], i) => [px * (1 + .2 * hash(i + lx * 9)), py * (1 + .2 * hash(i + ly * 7))]);
      piece(curvy(L, 3), COL.hill, { sw: 1.1, key: key + 'c' + lx, flatCard: true });
    }
    for (const a of [-.75, .75]) {
      piece(tr(curvy([[-r * .9, -r * .2], [r * .9, -r * .2], [r * .9, r * .2], [-r * .9, r * .2]], 3), 0, 0, 1, a), '#E9B58A', { sw: 1.4, key: key + 'p' + a, flatCard: true });
      piece(tr([[-r * .25, -r * .17], [r * .25, -r * .17], [r * .25, r * .17], [-r * .25, r * .17]], 0, 0, 1, a), '#D08C5E', { sw: .9, key: key + 'pp' + a, flatCard: true });
    }
    pop();
    for (let i = 0; i < 3; i++) { const a = -2.4 + i * .5; pen([[x + Math.cos(a) * (r + 10), y + Math.sin(a) * (r + 10)], [x + Math.cos(a) * (r + 22), y + Math.sin(a) * (r + 22)]], 1.5); }
  }
  // his talk: the world (put to rights) for two beats, then nonsense, a different doodle every beat
  function talk(x, y, t, key) {
    const bf = (t - T_TALK) / B, bi = Math.floor(bf + .1), k = backOut(seg(bf - bi + .1, 0, .35));
    if (bi <= 1) { globe(x, y, 56, t, key + 'gl'); return; }
    const item = (bi - 2) % 4;
    push(); translate(x, y); scale(1.5 * (.7 + .3 * k)); rotate(.12 * Math.sin(bi * 2.1));
    if (item === 0) {   // a rubber duck
      piece(curvy([[-34, 4], [-10, -4], [18, 0], [30, 14], [14, 30], [-26, 28], [-38, 14]], 4), COL.sun, { sw: 1.8, key: key + 'dk' });
      piece(oval(14, -16, 17, 16, 0, 18), COL.sun, { sw: 1.8, key: key + 'dh' });
      piece([[28, -18], [44, -14], [28, -8]], COL.sunDk, { sw: 1.4, key: key + 'db' });
      piece(oval(18, -20, 3, 3, 0, 8), '#221C28', { ink: null, key: key + 'de', flatCard: true });
      pen([[-18, 10], [-4, 16], [8, 10]], 1.3, .5);
    } else if (item === 1) {   // a banana
      const P = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * (.15 + .7 * i / 12); P.push([Math.cos(a) * -40, Math.sin(a) * 32 - 16]); }
      for (let i = 12; i >= 0; i--) { const a = Math.PI * (.15 + .7 * i / 12); P.push([Math.cos(a) * -32, Math.sin(a) * 14 - 10]); }
      piece(P, COL.sun, { sw: 1.8, key: key + 'bn' });
      piece(oval(-34, -3, 4, 4, 0, 8), '#6A4A2A', { sw: .8, key: key + 'bt', flatCard: true });
    } else if (item === 2) {   // a flying saucer
      piece(oval(0, -8, 18, 16, 0, 18), COL.sky, { sw: 1.6, key: key + 'ud' });
      piece(oval(0, 4, 46, 13, 0, 24), '#B0A6D8', { sw: 1.9, key: key + 'us' });
      for (const lx of [-26, 0, 26]) piece(oval(lx, 6, 4, 4, 0, 8), COL.sun, { sw: .8, key: key + 'ul' + lx, flatCard: true });
      for (const s of [-1, 1]) pen([[s * 12, 20], [s * 24, 40]], 1.1);
    } else {   // a spiral and a star
      const S = []; for (let i = 0; i < 40; i++) { const a = i * .42, r = 2 + i * .75; S.push([-14 + Math.cos(a) * r, Math.sin(a) * r]); }
      pen(S, 1.8, .6);
      piece(star5(30, -10, 16), COL.sun, { sw: 1.5, key: key + 'st' });
    }
    pop();
  }

  // ---------- the clink: a burst, and both cans fizz over ----------
  function clinkFX(t, at) {
    const a = t - TC; if (a < 0 || a > .75) return;
    boilSeed('fr-clink');
    const k = (a < 1 / 12 ? 1.25 : 1) * (1 - ease(seg(a, .2, .4)));
    if (k > .15) {
      piece(star5(at[0], at[1] - 44, 28 * k, -Math.PI / 2 + .3), COL.sun, { sw: 1.7, key: 'fr-burst', flatCard: true });
      for (let i = 0; i < 8; i++) { const an = -Math.PI / 2 + (i - 3.5) * .42, r0 = 42 * k, r1 = (64 + 12 * (i % 2)) * k; line([[at[0] + Math.cos(an) * r0, at[1] - 44 + Math.sin(an) * r0], [at[0] + Math.cos(an) * r1, at[1] - 44 + Math.sin(an) * r1]], '#FFE9A8', 3, 0); }
    }
    for (let i = 0; i < 6; i++) {   // fizz spraying up and falling back
      const v = [(i - 2.5) * 110, -340 - 70 * hash(i)], s = a * 1.1, p = [at[0] + v[0] * s, at[1] - 30 + v[1] * s + 950 * s * s];
      if (s > .55) continue;
      piece(oval(p[0], p[1], 6 + 2 * hash(i + 3), 5 + 2 * hash(i + 5), i, 10), i % 2 ? COL.foam : '#CFF6FF', { sw: 1, key: 'fr-fizz' + i, flatCard: true });
    }
  }

  // ---------- the two shots ----------
  // SHOT A: from behind them, towards the TV.
  function sceneA(t) {
    const [herO, himO] = backStates(t), inA2 = t >= T_FILM;
    roomA(t);
    solid(() => { drawDoor(t, DOOR_A, 'fr-doorA', -1); tv(t); push(); translate(90, -120); lavaLamp(t); pop(); });
    neon(t);
    solid(() => { push(); translate(140, -200); shisha(t); pop(); push(); translate(0, -240); snacksBack(t); snacksFront(t); pop(); });
    if (t < T_GRAB) { boilSeed('fr-canA'); push(); translate(CAN_A[0], CAN_A[1]); scale(MS); can(CAN_S, COL.canHer, 'frSa'); pop(); }
    // him (once he's in) on the left, her on the right: their backs (paper first), then their bean bags in front
    if (inA2) onPaper(() => backView(HIM_XA, GYA, UA, HIM_P, 'him', himO));
    onPaper(() => backView(HER_XA, GYA, UA, HER_P, 'her', herO));
    solid(() => { beanBagBack(HIM_XA, COL.beanHim, COL.beanHimDk, 'fr-bbH'); beanBagBack(HER_XA, COL.beanHer, COL.beanHerDk, 'fr-bbS'); });
    onPaper(() => backView(HER_XA, GYA, UA, HER_P, 'her', { ...herO, late: true }));   // (her arm reaching down past her bean bag)
  }
  // SHOT B: the reverse, from the TV: their faces (the TV is where the camera is), the back wall behind them.
  function sceneB(t, M, S) {
    roomB(t);
    solid(() => { drawDoor(t, DOOR_B, 'fr-doorB', 1); push(); translate(-1340, 0); lavaLamp(t); pop(); });
    const land = M.phase === 'seat' ? Math.max(0, .9 * Math.exp(-(t - T_LAND) * 6) * Math.cos((t - T_LAND) * 14)) : 0;
    solid(() => {
      beanBag(HIM_X, -1, COL.beanHim, COL.beanHimDk, land, 'fr-beanH');
      beanBag(HER_X, 1, COL.beanHer, COL.beanHerDk, .3 * S.slop, 'fr-beanS');
      push(); translate(-940, 0); shisha(t); pop();
      snacksBack(t);
    });
    // her (lit from the TV, below the camera), the controller in her lap once she lets go of it
    LIGHT.dir = [.3, -.95];
    onPaper(() => person(HER_X, GB, U0, HER_P, S.o));
    if (S.padW) { boilSeed('fr-padlap'); onPaper(() => controller(S.padW[0], S.padW[1] - 6, .1, PAD_W, 'fr-padlap')); }
    if (S.slop > .05 && t < T_LAND + .5 && S.canW) { const a = t - T_LAND; piece(oval(S.canW[0] + 10 + a * 50, S.canW[1] - 36 - 260 * a + 900 * a * a, 6, 5, 0, 10), COL.foam, { sw: 1, key: 'fr-slop', flatCard: true }); }
    // him
    LIGHT.dir = [-.3, -.95];
    if (M.phase !== 'hidden') onPaper(() => person(M.x, M.y, M.u, HIM_P, M.o));
    LIGHT.dir = [-.62, -.78];
    // the TV's light on the bean bags' fronts: a few strokes of its colour (it's where we are). (Not on their jumpers: its
    // strokes on her red jumper read as a hole cut in it, the bean bag showing through: the user)
    for (const [x, f, k] of [[HER_X, 1, 'fr-tvbS'], [HIM_X, -1, 'fr-tvbH']]) roomShade([[-150, 40], [150, 40], [160, 100], [70, 118], [-70, 118], [-160, 96]].map(([a, b]) => [x + a * f, 900 + b]), vivid(tvCol(t)), .3, -28, [], [], k);
    solid(() => { snacksFront(t); clinkFX(t, [XC, YC]); });
    // his talk: the world, then nonsense
    const kb = backOut(seg(t, T_TALK, T_TALK + .2));
    bubble(1430, 290, 140, 104, [1272, 430], kb, 'fr-talk', () => talk(1430, 290, t, 'fr-t'));
  }

  LOOPS.friday = t0 => {
    look('doodle');
    // (the drawing on twos, t; the camera's drift and push on ones, t0; the cut between set-ups on the drawing's step)
    const t = mt(t0), St = stages(t), [t0s, shot] = shotAt(t), t1s = (SHOTS.find(k => k[0] > t0s) || [LEN])[0], k = ease(seg(t0, t0s, t1s));
    if (shot === 'A') camBegin(975 + 8 * Math.sin(t0 * .5), 560 + 4 * Math.sin(t0 * .37), 1.05 + .03 * k);
    else camBegin(960 + 6 * Math.sin(t0 * .5), 585 + 4 * Math.sin(t0 * .37), 1.08 + .04 * k);
    boilSeed('fr-paper'); linedPaper();   // (the page moves with the camera: we're filming the notebook)
    if (St) {   // (otherwise the blank page: before the first mark and after the last)
      if (shot === 'A') stagedDraw(St, () => sceneA(t));
      else {
        const M = him(t), S = her(t);
        stagedDraw(St, () => sceneB(t, M, S));
      }
    }
    camEnd();
  };
  LOOPS.friday.len = LEN;
})();

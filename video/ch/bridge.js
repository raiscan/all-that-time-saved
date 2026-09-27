// bridge.js: the breakdown and the bridge (bars 122–146). His box room goes dark; a biro scratches a window of morning
// light into the dark; he reaches in and pulls it open, and we're in the doodle: her Friday. At the end we pull back out
// of the page and it's her notebook, on her lap, on a stopped train outside a city she can't get into.
//   D1  (217.2–229.0) the end of his rant: he slams his crumb down on the bed on "boom", then the anger drains out of him;
//       "Don't tell me I hate the future…": the room sinks to black round him; a biro (hers: see F4)
//       creeps in and scratches a window into the dark; morning comes up in it; "I still fucking do": he reaches in
//   F1  (229.0–237.8) his hand pulls the window open: her flat, doodled, a Friday morning. The alarm clock is asleep
//       too; the phone buzzes and she lobs it over her shoulder
//   F2  (237.8–246.6) night falls (a pencil sweeps it in): the Friday den, friday.js's acting retimed to the words: the
//       knock, the biscuits, the cannonball, the clink, the world put to rights, pure bollocks, the laugh
//   F3  (246.6–251.9) an engraved private island drifts into the den; the biro crosses it out; then an empire; then an
//       engraved clock whose hours fly out as birds and land round them
//   F4  (251.9–261.0) pull back out of the page: her notebook, on her lap, on the stopped night train; outside the
//       window, a gleaming engraved city behind a shut gate. The turn: she slams the notebook shut
(() => {
  // ---------- helpers ----------
  // Clip what's drawn next to polygons (a list of point lists; world coords, or screen coords with screen = true), or
  // to everything outside them (invert). Always close with clipEnd().
  function clipTo(polys, screen = false, invert = false) {
    flushBrush(); push();
    beginClip({ invert }); push(); if (screen) { resetMatrix(); translate(-W / 2, -H / 2); } noStroke(); fill(0);
    for (const P of polys) { beginShape(); for (const [x, y] of P) vertex(x, y); endShape(CLOSE); }
    pop(); endClip();
  }
  function clipEnd() { flushBrush(); pop(); }
  // A set piece drawn still: the doodle's line boil (its pen and pencil grain redrawn 8 times a second, BOILN) held, so a
  // finished drawing that doesn't move is pixel-still under a still camera (the user: the den's wall "keeps
  // flickering/redrawing"). Only what moves (the two of them, their cans, the bubbles, the birds) boils.
  const setStill = fn => { const b = BOILN; BOILN = 0; try { return fn(); } finally { BOILN = b; } };
  const R4 = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const PAPER = '#FBF8F0', RULE = '#9DB7DC';
  // A lined page covering [x0, x1] × [y0, y1] (world): paper, the ruled lines (world-anchored, 40 apart, as linedPaper()).
  function page(x0, y0, x1, y1) {
    _paint(R4(x0, y0, x1, y1), { wash: PAPER, ink: null });
    for (let y = Math.ceil((y0 - 130) / 40) * 40 + 130; y < y1; y += 40) for (let x = x0; x < x1; x += 400) _inkLine([[x, y], [Math.min(x1, x + 410), y + .3]], .6, RULE, 'rotring', 0);
  }
  // Points along a polyline by arc length: the first `len` px of P.
  function polyLen(P) { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; }
  function polyUpTo(P, len) {
    const out = [P[0]]; let acc = 0;
    for (let i = 1; i < P.length; i++) {
      const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
      if (acc + d >= len) { const k = (len - acc) / (d || 1); out.push([lerp(P[i - 1][0], P[i][0], k), lerp(P[i - 1][1], P[i][1], k)]); return out; }
      out.push(P[i]); acc += d;
    }
    return out;
  }
  // A long line in pieces (p5.brush strokes fade along their length), each piece ≤ step px.
  function longLine(P, sw, col, br = 'rotring', step = 110) {
    const R = []; for (let i = 0; i < P.length - 1; i++) { const a = P[i], b = P[i + 1], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step)); for (let k = 0; k < n; k++) R.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]); }
    R.push(P[P.length - 1]);
    for (let i = 0; i < R.length - 1; i++) _inkLine([R[i], R[i + 1]], sw, col, br, 0);
  }
  // Word-accurate mouth flaps for a singer: 'open' on each sung word's first half, else the given mouth.
  function singing(t, lines, base, open = 'open') {
    for (const l of lines) { if (!l || t < l.start - .02 || t > l.end + .05) continue;
      for (const [a, b] of l.words) if (t >= a - .02 && t < a + Math.min(.22, (b - a) * .6 + .05)) return open; }
    return base;
  }

  // In her doodled Friday (F1-F3, and F4 until the pull-back reaches the train) nobody talks: she narrates it from
  // outside (the user, 2026-09-25). The speech bubbles carry the conversation, comic-strip style; faces keep their
  // expressions (smiles, the laugh), but no mouth reads as speaking or singing.

  // ---------- the biro (a real pen: card, the same in every shot; it's hers, as F4 shows) ----------
  // tip at (x, y); the barrel runs back from the tip at angle a (rad, screen: 0 = to the right); s = length.
  function biro(x, y, a, s, key = 'biro') {
    const w = s * .075;
    push(); translate(x, y); rotate(a);
    const L = (x0, x1, w0, w1) => [[x0, -w0 / 2], [x1, -w1 / 2], [x1, w1 / 2], [x0, w0 / 2]];
    piece(L(s * .02, s * .13, w * .18, w * .62), '#B9BDC4', { sw: .9, key: key + 'cone', lift: 6, flatCard: true });
    piece(L(s * .13, s * .8, w * .95, w), '#E9ECEB', { sw: 1, shade: '#B7BDC0', depth: w * .35, key: key + 'barrel', lift: 7 });
    piece(L(s * .16, s * .78, w * .16, w * .16), '#2B3A92', { ink: null, key: key + 'refill', lift: 0, flatCard: true, edge: false });
    piece(L(s * .72, s * 1.0, w * 1.08, w * 1.1), '#26358C', { sw: 1, key: key + 'cap', lift: 7 });
    piece(L(s * .76, s * .99, w * .22, w * .22).map(([px, py]) => [px, py - w * .72]), '#26358C', { sw: .8, key: key + 'clip', lift: 8, flatCard: true });
    piece(oval(s * .015, 0, w * .12, w * .12, 0, 8), '#1A1A22', { ink: null, key: key + 'ball', lift: 1, flatCard: true });
    pop();
  }

  // =====================================================================================================================
  // D1: the breakdown. His box room (card), then only him, the bed and the bulb; then the biro's window.
  // =====================================================================================================================
  const D = {
    t0: BAR(122), t1: BAR(128),
    boom: WT("There's my cut", 6), l1: WT("Don't tell me"), hate: WT("Don't tell me", 3), l1e: LY("Don't tell me").end,
    l2: WT('I wanted Friday'), monday: WT('I wanted Friday', 8), l3: WT('I wanted this'), l4: WT('I still fucking'),
    fk: WT('I still fucking', 2), doW: WT('I still fucking', 3),
  };
  D.lines = [LY("Don't tell me"), LY('I wanted Friday'), LY('I wanted this'), LY('I still fucking')];
  // the F of "fucking", held (the user, 2026-09-27: the vocal "really emphasises it with an impassioned yearning"). In the
  // vocal stem the F is a long fricative swelling into the vowel, 227.83–228.29, right after "still" (the lyric's word
  // timing starts the word at 228.25, so the lip-sync gave the F two drawings, the mouth shut before them). He holds it,
  // the lower lip under the top teeth, from the drawing it's heard in (the lip-sync's lead, .045 s, early) until the
  // vowel bursts out, six drawings; the lip-sync carries on from there
  D.fv = [Math.floor((227.83 - .045) * 12) / 12, (Math.floor((228.29 - .045) * 12) + 1) / 12];
  D.dim = [D.boom + .45, D.l1 - .1];
  // His rant's end (the user, 2026-09-26: "productivity... BOOM" is shouted, with anger and passion). V3f's thrust carries
  // on (verse3.js v3fRant: the same drawings; it starts there on "-tivity", D.thrust), the crumb held up at us on his flat
  // palm, shaking with rage through the held breath before "boom"; he winds up (two drawings: the hand up and back, rising,
  // a breath in) and slams it down onto the bed on "boom" (D.slam: the drawing the word starts in): the crumb bounces off
  // his palm onto the bed (CRUMB_BED), the camera jolts, the bulb swings; he shouts it, leaning into the slam. As the
  // shout falls away the anger drains (D.drain): the brows go up, the lean comes back, a breath out and the shoulders sink,
  // into the sad "Don't tell me".
  D.thrust = Math.floor((D.t0 - .17) * 12 + 1e-6) / 12; D.slam = Math.floor(D.boom * 12 + 1e-6) / 12; D.drain = D.boom + .6;
  D.penIn = D.l1e + .15;                 // the pen appears (221.3)
  D.close = 224.6;                       // the window's outline closes
  D.open = [D.close + .08, D.close + .62];   // the dark inside it is scratched away
  // the window (D1 world): its outline is exactly the outer edge of her flat's sash window in F1 (FW), scaled by DW.k
  const FW = { x0: 112, y0: 132, x1: 508, y1: 594 };           // F1 world: the sash window's frame, outer edge
  const DW = { x0: 1070, y0: 226, h: 404 }; DW.k = DW.h / (FW.y1 - FW.y0); DW.w = (FW.x1 - FW.x0) * DW.k; DW.x1 = DW.x0 + DW.w; DW.y1 = DW.y0 + DW.h;
  DW.cx = (DW.x0 + DW.x1) / 2; DW.cy = (DW.y0 + DW.y1) / 2;
  // the pen's path: in along the floor from the right, up to the window's bottom-right corner, then round it
  const PEN = [[2080, 712], [1860, 700], [1690, 688], [1560, 668], [1470, 650], [DW.x1, DW.y1], [DW.x1, DW.y0], [DW.x0, DW.y0], [DW.x0, DW.y1], [DW.x1, DW.y1]];
  const PEN_K = [D.penIn, 221.75, 222.1, 222.45, 222.75, 223.05, 223.55, 223.98, 224.3, D.close];
  // where the pen is at t: along the path, each leg eased (a hand slows into corners)
  function penAt(t) {
    if (t <= PEN_K[0]) return { i: 0, k: 0, p: PEN[0] };
    for (let i = 1; i < PEN.length; i++) if (t < PEN_K[i]) { const k = seg(t, PEN_K[i - 1], PEN_K[i]), e = i < 5 ? lerp(k, ease(k), .5) : ease(k); return { i, k: e, p: [lerp(PEN[i - 1][0], PEN[i][0], e), lerp(PEN[i - 1][1], PEN[i][1], e)] }; }
    return { i: PEN.length, k: 1, p: PEN[PEN.length - 1] };
  }
  const penDrawn = t => { const s = penAt(t); return PEN.slice(0, s.i).concat([s.p]); };
  // the camera (world = the box room at zoom 1): in to him as the room goes; out for the pen; in again for the reach
  function d1Cam(t) {
    return kf(t, [[D.t0, [960, 540, 1]], [D.l1 - .15, [806, 548, 1.4]], [D.penIn + .5, [816, 548, 1.42]], [223.0, [950, 520, 1.1]],
      [D.l3 - .1, [968, 508, 1.13]], [D.t1, [1000, 478, 1.3]]], ease);
  }
  // the wobble on the scratched line (stable per point)
  const wob = (P, a) => P.map(([x, y], i) => [x + (hash(i * 3.1 + x * .01) - .5) * a, y + (hash(i * 5.3 + y * .01) - .5) * a]);
  // arm specs blended with a plain ease (a slow, deliberate reach: no overshoot)
  // keys: [[t, blend s, { L, R }], ...]; specs keep every field (a 'u' spec stays one); ez: the easing (ease: no overshoot)
  // A normalised hand spec (shoulder half-widths, 0..1 shoulder → hip) as body units ('u'), for a preset P and its person
  // options o (seated, seatH, view), so a key in either form blends cleanly with one in the other.
  function specU(sp, P, o) {
    if (!sp || sp[6] === 'u') return sp;
    const Fr = personFrame(P, o), q = o.view === 'q', r = sp.slice(0, 6);
    r[0] = sp[0] * P.top.sh[0] + (q ? PP_QS : 0); r[1] = sp[1] >= 0 ? Fr.ys + sp[1] * (Fr.yh - Fr.ys) : Fr.ys + sp[1] * (Fr.ys - Fr.top); r[6] = 'u';
    return r;
  }
  function poseTrack(t, keys, ez = ease, P = null, po = null) {
    let i = 0; while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
    const cv = S => P ? { L: specU(S.L, P, po), R: specU(S.R, P, po) } : S;
    if (i === 0) return cv(keys[0][2]);
    const [t1, d, B0] = keys[i], A = cv(keys[i - 1][2]), B = cv(B0), k = ez(seg(t, t1, t1 + d));
    const mix = (a, b) => b.map((v, j) => typeof v === 'number' && typeof a[j] === 'number' ? lerp(a[j], v, k) : (k < .5 ? a[j] : v));
    return { L: mix(A.L, B.L), R: mix(A.R, B.R) };
  }
  // the window's position in his body units (for the reach)
  const bu = (x, y) => [(x - 760) / 50, (y - 890) / 50];
  // the rant's hands ('u' specs; verse3.js V3F_THRUST, V3F_KNEEF: the same): the crumb on his flat palm ('tray') held up
  // at us beside his face; the wind-up, up and back; the slam, his hand flat on the bed; the other a fist on his knee
  const R_THRUST = [4.6, -8.7, .2, 'tray', 1, -.12, 'u'], R_WIND = [3.0, -11.0, .25, 'tray', 1, -.45, 'u'], R_SLAM = [4.9, -3.0, -.04, 'open', 1, .55, 'u'];   // (the slam: the arm locked straight, near its full length; the fingers clear of where the crumb lands)
  const L_FIST = [-.64, .96, .4, 'fist', 1, 1.55];
  // the rage in a held arm: the hand shaking, in a new place each drawing (verse3.js v3fRage: the same)
  const d1Rage = (ts, a) => { const n = Math.round(ts * 12); return [(hash(n * 1.37) - .5) * 2 * a, (hash(n * 2.91 + 5) - .5) * 2 * a]; };
  // his rant, drawing by drawing (t stepped), until the drain: the hands and the body (sq: the shoulders up or down, as
  // card does it; rot: the lean; tilt: the head)
  function d1Rant(t) {
    const n = Math.round((t - D.slam) * 12), g = d1Rage(t, .2);
    if (n <= -3) return { L: L_FIST, R: [R_THRUST[0] + g[0], R_THRUST[1] + g[1], ...R_THRUST.slice(2)], sq: -.15, rot: .02, tilt: (hash(Math.round(t * 12) * 4.1) - .5) * .05 };
    // (the wind-up goes the other way from the slam: up and in by his temple, leaning away; his arm can't reach over his head)
    if (n === -2) return { L: L_FIST, R: R_THRUST.map((v, j) => typeof v === 'number' ? lerp(v, R_WIND[j], .55) : v), sq: -.25, rot: -.02, tilt: -.03 };
    if (n === -1) return { L: L_FIST, R: R_WIND, sq: -.32, rot: -.045, tilt: -.06 };
    // the slam, and the shout held over it, trembling (the hand bounces a little off the bed on the drawing after)
    const h = n >= 2 ? hash(n * 3.3) - .5 : 0;
    return { L: L_FIST, R: n === 1 ? [R_SLAM[0], R_SLAM[1] - .14, ...R_SLAM.slice(2)] : R_SLAM, sq: .3, rot: n === 0 ? .075 : .065 + .01 * h, tilt: .05 + .03 * h };
  }
  // his mouth through the rant: the lip-sync, shouted (wide on the open vowels; "boom" a shout, closing as it falls away),
  // clenched teeth between the words, a breath in on the wind-up
  function d1Shout(t, base) {
    const s = typeof lipAt === 'function' ? lipAt(t, 'M') : null, n = Math.round((t - D.slam) * 12);
    if (n === -1) return 'lip:a';
    if (!s || s === 'rest') return t < D.drain ? 'teeth' : base;
    if (s === 'u' || s === 'o') return n <= 4 ? 'lip:shout' : n <= 6 ? 'lip:o' : 'lip:u';
    return 'lip:' + (s === 'a' ? 'aa' : s);
  }
  function d1Him(t) {
    const q = t >= D.l3 - .12;   // he turns to the window on "I wanted this"
    const e = emotions(t, [[D.t0 - 1, 'angry', { lookX: 0, lookY: 0 }], [D.drain, 'sad', { lookY: .6, lookX: -.1, mouth: 'flat' }],
      [D.l1 - .25, 'sad', { eyes: 'teary', squint: .3, lookX: 0, lookY: .12, mouth: 'flat' }],
      [D.l2 - .1, 'sad', { squint: .2, lookX: -.5, lookY: .4, mouth: 'flat' }], [222.5, 'neutral', { eyes: 'normal', lookX: .8, lookY: .2, mouth: 'flat' }],
      [223.3, 'sad', { eyes: 'teary', squint: .2, lookX: 1, lookY: -.1, mouth: 'flat' }], [D.open[0] + .1, 'surprised', { lookX: 1, lookY: -.25, mouth: 'flat' }],   // (silent: the mouth stays shut, or it reads as speaking)
      [D.l3 - .12, 'hopeful', { lookX: 1, lookY: -.2 }], [D.l4 - .05, 'sad', { eyes: 'teary', squint: .12, lookX: 1, lookY: -.2, mouth: 'flat' }]], { take: .3 });
    e.emote = null; e.gloom = 0; e.tint = null;
    const cf = lerp(1, .3, seg(t, D.t0, D.boom + .6));   // (V3f hands over its full idle; it calms down as the room goes)
    e.dy = (e.dy || 0) * cf; e.sq = (e.sq || 0) * lerp(1, .5, seg(t, D.t0, D.boom + .6)); e.rot = (e.rot || 0) * cf; e.dx = 0;
    // a slow head shake on "Don't tell me"
    const shake = t > D.l1 && t < D.l1 + 1 ? .06 * Math.sin((t - D.l1) * TAU * 1.6) * (1 - seg(t, D.l1, D.l1 + 1)) : 0;
    // the rant (until the drain), then the anger drains: he comes up out of the lean with a breath in, and sighs it out, the
    // shoulders sinking and coming back up by "Don't tell me"
    const rant = t < D.drain ? d1Rant(t) : null, dr = D.drain;
    const rsq = rant ? rant.sq : t < dr + .3 ? lerp(.3, -.06, ease(seg(t, dr, dr + .3))) : -.06 * (1 - seg(t, dr + .3, dr + .6)) + .32 * Math.sin(Math.PI * seg(t, dr + .3, dr + 1.2));
    const rrot = rant ? rant.rot : .065 * (1 - ease(seg(t, dr, dr + .45))), rtilt = rant ? rant.tilt : .05 * (1 - ease(seg(t, dr, dr + .4)));
    // leaning toward the window: a little on "I wanted this", more as he reaches; and through the held F a yearning
    // (yn: it swells with the F, and lets half go as the vowel bursts): he leans on in toward it, his chest rising on the
    // breath (the shoulders up), the eyes narrowing a little under the raised brows
    const yf = seg(t, D.fv[0] - .08, D.fv[1]), yr = ease(seg(t, D.fv[1], D.fv[1] + .4)), yn = ease(yf) * (1 - .5 * yr), ys = ease(yf) * (1 - yr);
    const lean = .04 * ease(seg(t, D.l3 - .1, D.l3 + .6)) + .09 * ease(seg(t, D.l4 + .05, D.doW)) + .045 * yn;
    if (ys > 0) { e.squint = Math.max(e.squint || 0, .22 * ys); e.lookY = (e.lookY || 0) - .15 * ys; }
    const fv = t > D.fv[0] - 1e-6 && t < D.fv[1] - 1e-6;
    const ranting = t < D.drain + .15, mouth = fv ? 'lip:fv' : ranting ? d1Shout(t, e.mouth) : singing(t, D.lines, e.mouth, 'o');
    const w0 = bu(DW.x0 - 30, DW.cy + 10), w1 = bu(DW.x0 + 6, DW.cy - 6), w2 = bu(DW.x0 + 60, DW.cy - 16);
    // (the reach is his far arm, R, out to his right: the near one would cross his face)
    // (never mirror images: "Don't tell me" is one open hand, palm up, the other on his knee; the rests either side of it
    // (from when the crumb's gone, and after the line) have one hand on his knee and the other planted on the bed beside
    // him. Both hands hanging together in his lap read as twinned, and as hands on his groin)
    const kL = [-.64, .96, .4, 'relax', 1, 1.55];   // (over his knee, the fingers down over it: pointing in, it read as on his groin)
    // (knees: the other hand planted on the bed out beside him, his weight on it: the arm near straight, the elbow bowed
    // out only a little (bend -.05: a quarter of the way out; the user, 3:43: at -.1, front on, the elbow bowed right out
    // and up, the upper arm near level, "bends too far"; in 3/4 from 225.65 the far arm's arc straightens it anyway)
    const S = { slam: { L: L_FIST, R: R_SLAM },
      plead: { L: kL, R: [1.4, .55, .45, 'open', 1, -.25] },
      knees: { L: kL, R: [1.9, 1.08, -.05, 'open', 1, 1.45] },
      lift: { L: kL, R: [4.4, -7.6, .3, 'relax', 1, -.5, 'u'] },
      touch: { L: kL, R: [w0[0], w0[1], .12, 'open', 1, -.25, 'u'] },
      into: { L: kL, R: [w1[0], w1[1], .08, 'open', 1, -.12, 'u'] },
      deep: { L: kL, R: [w2[0], w2[1], .06, 'open', 1, -.08, 'u'] } };
    // (from the drain the hand on the bed slides down over its edge and the fist on his knee opens)
    const pose = rant ? { L: rant.L, R: rant.R } : poseTrack(t, [[D.t0, 0, S.slam], [D.drain, .5, S.knees], [D.hate - .15, .35, S.plead], [D.l1e + .1, .45, S.knees], [D.l4 + .02, .5, S.lift], [D.l4 + .5, .4, S.touch], [D.fk + .05, .35, S.into], [D.doW + .05, .2, S.deep]], ease, HIM_C, { seated: true, seatH: 3.3, view: q ? 'q' : 'front' });
    // (through the held F his eyes stay open, on the window: no blink)
    return { ...e, mouth, sing: ranting || fv ? false : undefined, tilt: shake + rtilt, rot: lean + rrot, sq: e.sq + rsq - .12 * ys, dy: e.dy, blink: fv ? 0 : undefined, view: q ? 'q' : 'front', pose, boilKey: 'v3himbox', seated: true, seatH: 3.3 };
  }
  // where the crumb sits on his palm (its centre) for his rig state o (d1Him's) at t (stepped), in world px, and its turn:
  // placed as person() places his hand (his ground point, dy, the lean and the idle weight shift; the 'u' wrist target, the
  // hand .08u past it along the wrist angle), then the spot on the palm: on a flat hand ('tray') on top of it, two thirds
  // along; on an open one, in it by the fingers (verse3.js v3fPalm: the same)
  function d1Palm(o, t) {
    const R = o.pose.R, u = 50, a = R[5], s = HIM_C.body.hand * u, tray = R[3] === 'tray';
    const rot = (o.rot || 0) + lifeOf(o, 'hCv3himbox|0', t, u * drawScale()).lean * .4;
    const al = .08 * u + (tray ? .95 : .55) * s, up = tray ? .19 * s + 7 : .45 * s;   // (the crumb's centre is 7 px over its base)
    const lx = R[0] * u + Math.cos(a) * al + Math.sin(a) * up, ly = R[1] * u + Math.sin(a) * al - Math.cos(a) * up;
    return { p: [760 + lx * Math.cos(rot) - ly * Math.sin(rot), 890 + (o.dy || 0) * 1.1 * u + lx * Math.sin(rot) + ly * Math.cos(rot)], a: a + rot + (tray ? 0 : .22) };
  }
  // the crumb (from V3f): on his palm (carried with the live hand, shaking), until his hand hits the bed on "boom"; then it
  // bounces off his palm, up and over (five drawings in the air, turning), onto the bed, clear of where his hand comes to
  // rest on it, hops once and stays there (the bed stays lit as the room goes). t: stepped; o: his rig state at t
  const CRUMB_BED = [1112, 742];
  function d1Crumb(t, o) {
    const n = Math.round((t - D.slam) * 12);
    let cx, cy, a;
    if (n < 0) { const h = d1Palm(o, t); [cx, cy] = h.p; a = h.a; }
    else {
      const h = d1Palm(d1Him(D.slam), D.slam), k = Math.min(1, (n + .35) / 5.35), hop = n === 6 ? 12 : 0;
      cx = lerp(h.p[0], CRUMB_BED[0], k); cy = lerp(h.p[1], CRUMB_BED[1], k) - 360 * k * (1 - k) - hop; a = lerp(h.a, 4.6, k);
    }
    boilSeed('d1crumb');
    push(); translate(cx, cy); rotate(a); translate(-cx, -cy);
    piece(curvy([[cx - 13, cy - 8], [cx + 3, cy - 14], [cx + 14, cy - 4], [cx + 9, cy + 7], [cx - 10, cy + 7]], 3), '#D8A860', { sw: 1.3, shade: '#A87830', depth: 5, key: 'v3crumb', lift: 3 });
    pop();
  }
  // the window's inside: F1's world (her flat, the sun coming up) mapped onto the window. poly: the clip (default the
  // whole window); him: his options, to draw his hand where it's through the window, as doodle
  // (all of F1's world, not just its window wall: the curtains and the sunbeam reach into the window's frame, and F1
  // opens on exactly this picture)
  function d1Window(t, polys, him) {
    clipTo(polys || [R4(DW.x0, DW.y0, DW.x1, DW.y1)]);
    push(); translate(DW.x0 - FW.x0 * DW.k, DW.y0 - FW.y0 * DW.k); scale(DW.k); f1World(t); pop();
    if (him) d1HandD(him);
    look('card');
    clipEnd();
  }
  // his hand where it's through the window: him in doodle, clipped by the caller
  function d1HandD(him) { look('doodle'); person(760, 890, 50, HIM_C, { ...him, boilKey: 'd1himD' }); }
  // D1's world. o.content: false leaves the window dark (F1 draws its own content over it as it pulls open)
  function d1World(t, o = {}) {
    // (the light is on ones, like the camera: the room fading to black and the morning coming up through the window are
    // lighting, not puppets; stepped, the whole frame changed on twos)
    const tt = mt(t), l = tt - D.t0, dim = ease(seg(t, ...D.dim));
    const rev = seg(tt, ...D.open), lit = ease(seg(t, D.open[0], D.open[1] + .4));
    look('card');
    // (the bulb swings: gently, and hard from the slam, dying away)
    const swing = 5 * Math.sin(tt * 1.3) + (tt >= D.slam ? 46 * Math.exp(-(tt - D.slam) * 1.3) * Math.sin((tt - D.slam) * TAU * .75) : 0);
    boxroomBack(tt, l, { dim, squeeze: 0, bedUp: 0, bulb: 1, swing });
    // him (lit from the window once it's open)
    const hs = d1Him(tt);
    if (o.handR) hs.pose = { L: hs.pose.L, R: o.handR(hs.pose.R, hs) };   // (F1: his hand grips the window's edge and drags it open)
    if (lit > .05) LIGHT.dir = [.85, -.5];
    person(760, 890, 50, HIM_C, hs);
    LIGHT.dir = [-.62, -.78];
    d1Crumb(tt, hs);
    // the light it lets in, over him and the dark
    if (lit > 0) { glow(DW.cx - 40, DW.cy + 40, 520, '#FFE2A8', .42 * lit); glow(760, 560, 380, '#FFD890', .3 * lit); }
    // the window: the dark scratched away in diagonal strokes, one after another, then the whole pane
    if (o.content !== false && rev > 0) {
      let polys = null;
      if (rev < 1) {
        polys = [];
        const n = 9, at = (u, v) => [lerp(DW.x0 - 40, DW.x1 + 40, u), lerp(DW.y0 - 40, DW.y1 + 40, v)];
        for (let i = 0; i < n; i++) {
          const a = seg(rev, i / n * .8, i / n * .8 + .28); if (a <= 0) continue;
          const c = lerp(-.1, 1.1, (i + .5) / n), w = .16, y0 = -.1, y1 = lerp(-.1, 1.15, a);
          const Q = clipConvex([at(c - w + .12 * y0, y0), at(c + w + .12 * y0, y0), at(c + w + .12 * y1, y1), at(c - w + .12 * y1, y1)], R4(DW.x0, DW.y0, DW.x1, DW.y1));
          if (Q.length > 2) polys.push(Q);
        }
      }
      if (!polys || polys.length) d1Window(t, polys, tt >= D.fk - .25 && rev >= 1 ? hs : null);
    }
    if (lit > 0) glow(DW.cx, DW.cy, 190, '#FFF6E0', .35 * lit);
    boxroomFront(tt, l, { bulb: 1 - .6 * lit, swing });
    // the scratched line, then (once it's closed) the window's frame: a cream scratch with the biro's line on it
    boilSeed('d1line');
    const drawn = penDrawn(tt);
    if (tt >= D.penIn && drawn.length > 1) {
      const P = wob(drawn, 3);
      longLine(P, 5.5, '#EFE6D0', 'rotring'); longLine(P.map(([x, y]) => [x + .8, y - .6]), 1.6, '#3A4AA8', 'rotring');
      if (tt < D.close + .3) { const tip = drawn[drawn.length - 1]; glow(tip[0], tip[1], 70, '#FFEFD0', .55); }
    }
    // the pen: in, round the window, then it lifts off and away up to the right
    if (tt >= D.penIn - .3 && tt < D.close + .7) {
      const s = penAt(tt), off = seg(tt, D.close, D.close + .6), lift = easeIn(off);
      const tip = [s.p[0] + 900 * lift, s.p[1] - 26 * Math.sin(Math.PI * Math.min(1, off * 2)) - 500 * lift];
      const a = -1.05 + .12 * Math.sin(tt * 7) - .3 * lift, pre = seg(tt, D.penIn - .3, D.penIn);
      boilSeed('d1pen'); biro(tip[0] + 400 * (1 - pre), tip[1] - 12 * (1 - pre), a, 230, 'd1pen');
    }
    return hs;
  }
  // V3f's punch in on the thrust (verse3.js v3fPunch: the same curve, zooming about the crumb) carried on, and let go after
  // the slam; the slam's jolt (all on ones)
  const D1_PUNCH = [930, 430];
  const d1Punch = t => (.07 * easeOut(seg(t, D.thrust, D.thrust + .25)) + .03 * ease(seg(t, D.thrust + .25, D.t0 + .45))) * (1 - ease(seg(t, D.boom + .1, D.boom + .7)));
  SHOT.D1 = (t, lt, dur) => {
    let [cx, cy, z] = d1Cam(t);
    const jk = t - D.slam, ja = jk >= 0 && jk < .7 ? Math.exp(-jk * 6.5) : 0, m = 1 + d1Punch(t) + .03 * ja, P = D1_PUNCH;
    cx = P[0] - (P[0] - cx) / m; cy = P[1] - (P[1] - cy) / m; z *= m;
    if (ja > 0) { const [sx, sy] = shakeXY(t, 13 * ja); cx += sx / z; cy += sy / z; }
    camBegin(cx, cy, z);
    d1World(t);
    camEnd();
  };

  // =====================================================================================================================
  // F1: her flat, doodled, a Friday morning (FLAT in the doodle look, morning). World = the flat at zoom 1.
  // =====================================================================================================================
  const F1 = {
    t0: BAR(128), t1: BAR(133),
    fri: WT('A Friday morning'), morn: WT('A Friday morning', 2), alarm: WT('A Friday morning', 3),
    off: WT('No office'), buzz: WT('No office', 2), palm: WT('No office', 5),
  };
  F1.open = [F1.t0, F1.t0 + .6];   // his hand grips the window's edge (.2 s) and pulls it open
  // "No office buzzing in my palm" (the user, 2026-09-27: the linger on her and her tea was "visually a bit static"; it's
  // him, not the office: he's coming round (F2's "A mate comes round"), and she'd want her phone to hand). On "No office"
  // she picks her phone up off the seat beside her with her free hand; it buzzes in her palm and she looks down at it; on
  // "buzzing" we cut to her POV (a screen is shown from its user's point of view, looking down at it, never turned to the
  // camera: the user): Rowan's message pops up, his beanie for its avatar, a pizza box and a little running figure ("on
  // my way, bringing pizza"; no words); her thumb taps a thumbs-up back; on "palm" we cut back to her smiling, settling
  // back with her tea, as the night sweeps in. All of it above the subtitle banner.
  const snap12 = x => Math.round(x * 12) / 12;   // (onto the drawing grid)
  F1.pick = [F1.off - .1, F1.off + .16];         // her free hand down to the phone on the seat, and up with it
  F1.buzz0 = snap12(F1.off + .31);               // it buzzes in her palm
  F1.pov = [snap12(236.06), snap12(F1.palm)];    // her POV: from the beat on "buzzing" to "palm"
  F1.msg = F1.pov[0] + .17;                      // his message pops up (the buzz stops)
  F1.tap = 236.96; F1.reply = F1.tap + .06;       // her thumb on the thumbs-up (on the beat); her reply pops up
  // her, at home: dressed for a Friday in (friday.js's outfit: a tomato jumper, the pencil still in her bun)
  const HER_HOME = { ...HER_C,
    top: { ...HER_C.top, kind: 'jumper', collar: 'crew', rows: [[1.8, 2.1], [1.74, 4.1], [1.7, 4.75, 1]], hemC: .1, band: .45, buttons: [], open: 0 },
    extra: { pencil: HER_C.extra.pencil }, col: { ...HER_C.col, shoe: '#F4D03F', sole: '#F4D03F', shoeLt: '#E4604E' } };
  // the sun comes up in her window from when D1's window opens
  const sunK = t => ease(seg(t, D.open[0], F1.t0 + 2.4));
  // her window's view, with my sun (a doodled sun with a face, coming up over the roofs) in place of the set's
  function f1View(t, o) {
    const { x0, y0, x1, y1 } = FLAT.win, G = prR(x0, y0, x1, y1);
    boilSeed('f1 view');
    piece(G, '#BCD8EE', { ink: null, key: 'f1-sky', lift: 0, edge: false, side: false });
    // the sun, rising behind the roofs (drawn before them)
    const k = sunK(t), sx = x0 + 250, sy = lerp(410, 246, k), r = 38;
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + t * .25, r0 = r + 8, r1 = r + 22 + 6 * (i % 2); const p0 = [sx + Math.cos(a) * r0, sy + Math.sin(a) * r0], p1 = [sx + Math.cos(a) * r1, sy + Math.sin(a) * r1]; if (p1[1] < 345 && p1[0] > x0 + 6 && p1[0] < x1 - 6 && p1[1] > y0 + 6) _inkLine([p0, p1], 2.6, vivid('#F2B02A'), 'cpencil', 0); }
    if (sy - r < 352) piece(prClip(oval(sx, sy, r, r, 0, 24), prR(x0, y0, x1, 352)), '#FFC928', { sw: 1.6, key: 'f1-sun' });
    if (sy < 330) { dline([[sx - 14, sy - 6], [sx - 10, sy - 9], [sx - 6, sy - 6]], 1.2, BIRO, .5); dline([[sx + 6, sy - 6], [sx + 10, sy - 9], [sx + 14, sy - 6]], 1.2, BIRO, .5); dline([[sx - 13, sy + 8], [sx, sy + 16], [sx + 13, sy + 8]], 1.3, BIRO, .6); }
    // the terrace opposite, by day
    const roof = [[x0 - 10, 360], [x0 + 60, 360], [x0 + 60, 322], [x0 + 92, 322], [x0 + 92, 352], [x0 + 190, 352], [x0 + 190, 316], [x0 + 226, 316], [x0 + 226, 348], [x1 + 10, 348], [x1 + 10, y1], [x0 - 10, y1]];
    piece(prClip(roof, G), '#C98A6A', { sw: 1.3, key: 'f1-roofs', side: false });
    piece(prClip([[x0 - 10, 360], [x0 + 60, 360], [x0 + 60, 348], [x1 + 10, 348], [x1 + 10, 366], [x0 - 10, 378]], G), '#6E7488', { ink: null, key: 'f1-slates', side: false });
    [[x0 + 28, 380], [x0 + 118, 380], [x0 + 208, 380], [x0 + 298, 380], [x0 + 28, 470], [x0 + 118, 470], [x0 + 208, 470], [x0 + 298, 470]].forEach(([wx, wy], i) => {
      piece(prClip(prR(wx, wy, wx + 40, wy + 56), G), i % 3 ? '#A9C4DA' : '#E8F0F4', { sw: 1, key: 'f1-w' + i, flatCard: true, side: false });
      dline([[wx + 20, wy], [wx + 20, wy + 56]], .8, BIRO);
    });
    // birds going over (a V each)
    for (let i = 0; i < 3; i++) { const bx = x0 + frac(t * .05 + i * .31) * (x1 - x0 + 60) - 30, by = 200 + 30 * i + 6 * Math.sin(t * 3 + i), f = Math.sin(t * 9 + i * 2) * 5; if (bx > x0 + 8 && bx < x1 - 8) dline([[bx - 9, by - f], [bx, by + 2], [bx + 9, by - f]], 1.1, BIRO, .5); }
  }
  // the alarm clock on the side table, asleep: a face with shut eyes, bells, a snore bubble swelling on the beat
  function alarmClock(t, x, y, s) {
    boilSeed('f1 clock');
    const sn = .5 + .5 * Math.sin(bpOf(t) * Math.PI / 2), tilt = .06 * Math.sin(bpOf(t) * Math.PI / 2);
    push(); translate(x, y); rotate(tilt);
    for (const d of [-1, 1]) dline([[d * s * .3, -s * .1], [d * s * .42, s * .06]], 1.6, BIRO, 0);
    for (const d of [-1, 1]) piece(oval(d * s * .42, -s * 1.0, s * .24, s * .18, d * .5, 14), '#F2C230', { sw: 1.3, key: 'f1-bell' + d });
    dline([[-s * .12, -s * .98], [0, -s * 1.08], [s * .12, -s * .98]], 1.4, BIRO, .5);
    piece(oval(0, -s * .52, s * .5, s * .5, 0, 26), '#E2453C', { sw: 1.6, key: 'f1-clockcase' });
    piece(oval(0, -s * .52, s * .38, s * .38, 0, 24), '#FFF6E6', { sw: 1.2, key: 'f1-clockface' });
    for (const d of [-1, 1]) dline([[d * s * .2 - s * .08, -s * .58], [d * s * .2, -s * .52], [d * s * .2 + s * .08, -s * .58]], 1.3, BIRO, .6);   // asleep
    dline([[-s * .08, -s * .36], [0, -s * .32 + s * .03 * sn], [s * .08, -s * .36]], 1.2, BIRO, .6);
    pop();
    // the snore bubble, with a crescent moon in it
    const bx = x + s * .72, by = y - s * 1.5 - 10 * sn, br = s * (.24 + .14 * sn);
    boilSeed('f1 snore');
    piece(oval(x + s * .45, y - s * 1.1, s * .07, s * .07, 0, 10), '#E8F4FA', { sw: 1, key: 'f1-snore0', flatCard: true });
    piece(oval(bx, by, br, br, 0, 22), '#E8F4FA', { sw: 1.2, key: 'f1-snore', side: false });
    const m1 = oval(bx, by, br * .5, br * .5, 0, 18);
    piece(m1.filter(p => Math.hypot(p[0] - bx - br * .24, p[1] - by + br * .14) > br * .42), '#F2C230', { ink: null, key: 'f1-moon', flatCard: true });
  }
  // her mug of tea (upright, centred at the bottom middle), steaming
  function mug(t, s, key, steam = 1) {
    const w = s * .42, h = s * .5;
    piece(ppRing(w * 1.02, -h * .5, s * .16, s * .19, s * .06, Math.PI), '#3FB8C0', { sw: 1.2, key: key + 'h', flatCard: true });
    piece(curvy([[-w, -h], [w, -h], [w * .94, 0], [-w * .94, 0]], 2), '#3FB8C0', { sw: 1.5, shade: '#24808A', depth: w * .3, key: key + 'b' });
    piece([[-w * .97, -h * .62], [w * .97, -h * .62], [w * .96, -h * .42], [-w * .96, -h * .42]], '#FFC928', { ink: null, key: key + 'band', flatCard: true });
    piece(oval(0, -h, w * .96, s * .07, 0, 14), '#A8662E', { sw: 1, key: key + 't', flatCard: true });
    if (steam > 0) for (let i = 0; i < 2; i++) { const ph = frac(t * .6 + i * .5), y0 = -h - s * .15 - ph * s * .6; dline([[-w * .3 + i * w * .6, y0 + s * .3], [-w * .45 + i * w * .6 + Math.sin(ph * 6 + i) * s * .08, y0 + s * .12], [-w * .25 + i * w * .6, y0 - s * .08]], 1.2 * (1 - ph) * steam + .3, '#8A9AB2', .6); }
  }
  // held upright in the right hand (undo the hand's angle)
  const mugHold = (ang, t) => s => { push(); rotate(-ang); translate(-s * .2, s * .62); mug(t, s * 2.5, 'f1mugH'); pop(); };
  // her phone in her free hand (drawn in the hand, between the palm and the fingers: the hand's turn and mirror undone),
  // upright in her palm and tipped back toward her face: its back to us, the screen's light on its edge toward her. Real
  // size: 1.6 of her hand's length. Buzzing: it shakes in her palm, a new place each drawing, doodled buzz lines each side
  // (held up in front of her chest: the elbow out against the sofa's back cushion, the forearm folding across to it)
  const LOOKQ = { x: 1027, y: 704, b: .25, a: -1.68, f: .25 };
  const phoneHold = (ang, t, buzz) => s => {
    const n = Math.round(t * 12), j = buzz ? hash(n * 1.73) - .5 : 0, w = s * .8, h = s * 1.7;
    push(); scale(1, -1); rotate(-ang);
    translate(Math.cos(ang) * s * LOOKQ.f, Math.sin(ang) * s * LOOKQ.f);   // (its lower part in her palm, behind her fingers; its top half clear of them)
    rotate(.2 + j * .16); translate(j * 2.4, 0);
    boilSeed('f1 phoneH');
    piece(b2RoundPoly(R4(-w / 2, -h / 2, w / 2, h / 2), w * .2), '#2A2E38', { sw: 1.2, key: 'f1phoneH' });
    piece(b2RoundPoly(R4(-w * .38, -h * .44, -w * .06, -h * .26), w * .08), '#6E7488', { sw: .8, key: 'f1phoneHcam', flatCard: true });
    dline([[w * .5 + .8, -h * .42], [w * .5 + .8, h * .42]], 1.1, '#BFE0F5', .2);   // (the lit screen's edge, toward her)
    if (buzz) for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) {   // (three arcs each side, a new length each drawing)
      const x = sd * (w / 2 + 4.5 + k * 5), L = h * (.42 - .09 * k) * (n % 2 ? 1 : .8);
      dline([[x - sd * 1, -L], [x + sd * 1.6, 0], [x - sd * 1, L]], 2.2 - .4 * k, BIRO, .5);
    }
    pop();
  };
  // ---------- her POV (F1.pov): looking down at her phone in her hand, her tea in the other; doodle, screen space ----------
  // The phone real size to her hand (1.6 of its length), its screen to her (and so to us: it's her view). On the cut in
  // it's buzzing; his message pops up (F1.msg): his avatar, his beanie on him, and a bubble with a pizza box and a little
  // running figure; her thumb goes to the thumbs-up button and taps it on the beat (F1.tap); her reply, a thumbs-up, pops
  // up on her side. Her lap and the sofa under it; her tea steaming at the left. All above the subtitle banner.
  const POV = { x: 1010, y: 450, r: -.05 };   // the phone's centre and turn (screen)
  function f1Pov(t) {
    const tt = mt(t), n = Math.round(tt * 12), sk = HER_HOME.col.skin, skD = HER_HOME.col.skinDk, JU = HER_HOME.col.coat || PP_TOMATO.coat, JUd = PP_TOMATO.cuff;
    const buzz = tt < F1.msg, j = buzz ? hash(n * 2.3) - .5 : 0, drift = seg(t, F1.pov[0], F1.pov[1]);   // (the camera: the slightest drift down onto it, on ones)
    look('doodle');
    camBegin(W / 2, H / 2 - 10 * drift, 1 + .03 * drift);
    // her lap and the sofa (still: only what moves boils)
    setStill(() => {
      boilSeed('f1pov bg'); page(-200, -200, W + 200, H + 200);
      piece([[-60, -60], [W + 60, -60], [W + 60, 250], [-60, 214]], PRF.floor, { sw: 1.3, key: 'f1pov-floor', side: false });
      for (const y of [60, 140, 212]) dline([[-40, y], [W + 40, y + 26]], 1, PRF.floorLn, .2);
      piece([[-60, 214], [W + 60, 250], [W + 60, H + 60], [-60, H + 60]], PRF.sofa, { sw: 1.4, shade: PRF.sofaDk, depth: 30, key: 'f1pov-seat', side: false });
      // her thighs, foreshortened, the knees at the top, in her trousers; her jumper's hem across the bottom
      piece(curvy([[330, H + 80], [360, 420], [430, 236], [560, 196], [680, 236], [720, 420], [700, H + 80]], 4), HER_HOME.col.trousers, { sw: 1.5, shade: HER_HOME.col.trousersDk, depth: 40, key: 'f1pov-thL', side: false });
      piece(curvy([[760, H + 80], [770, 420], [820, 240], [950, 196], [1080, 232], [1140, 420], [1150, H + 80]], 4), HER_HOME.col.trousers, { sw: 1.5, shade: HER_HOME.col.trousersDk, depth: 40, key: 'f1pov-thR', side: false });
      piece(curvy([[-60, 1000], [500, 972], [1100, 978], [W + 60, 1010], [W + 60, H + 60], [-60, H + 60]], 3), JU, { sw: 1.5, key: 'f1pov-hem', side: false });
    });
    // her tea, in her other hand, steaming
    f1PovMug(tt);
    // the phone in her hand (phone-local coords → screen: its centre, turn, and a shake while it buzzes)
    const px = POV.x + j * 7, py = POV.y + (hash(n * 3.1) - .5) * (buzz ? 5 : 0), rot = POV.r + j * .035;
    const c = Math.cos(rot), s = Math.sin(rot), F = ([a, b]) => [px + a * c - b * s, py + a * s + b * c], M = P => P.map(F);
    boilSeed('f1pov hand');
    // the sleeve and the heel of her hand, behind the phone (the phone rests in her palm)
    piece(ribbon([F([190, 420]), F([330, 620]), F([470, 860])], 190, 260), JU, { sw: 1.6, shade: PP_TOMATO.coatDk, depth: 40, key: 'f1pov-slv' });
    piece(ppBar(F([176, 400]), F([236, 490]), 196, 204), JUd, { sw: 1.4, key: 'f1pov-cuff' });
    piece(M(curvy([[-120, 150], [60, 110], [196, 200], [236, 330], [214, 440], [120, 470], [-40, 420], [-150, 300]], 4)), sk, { sw: 1.5, shade: skD, depth: 40, key: 'f1pov-palm' });
    // the phone
    boilSeed('f1pov phone');
    piece(M(b2RoundPoly(R4(-172, -340, 172, 340), 52)), '#2A2E38', { sw: 1.8, key: 'f1pov-body', side: false });   // (a big piece: without side: false the pencil goes sparse)
    const SCR = M(b2RoundPoly(R4(-152, -318, 152, 318), 38));
    piece(SCR, '#EEF5FA', { sw: .9, key: 'f1pov-scr', side: false });
    piece(M(b2RoundPoly(R4(-34, -310, 34, -294), 8)), '#2A2E38', { ink: null, key: 'f1pov-isl', flatCard: true });
    clipPoly(SCR, () => f1PovScreen(tt, M));
    // buzzing: doodled buzz lines each side (a new length each drawing), until his message is up (under her fingers)
    if (buzz) for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) {
      const x = sd * (200 + (sd < 0 ? 24 : 0) + k * 34), L = 120 - 26 * k + (n % 2 ? 26 : 0);
      dline(M([[x - sd * 8, -L - 90], [x + sd * 12, -90], [x - sd * 8, L - 90]]), 4.2 - k, BIRO, .5);
    }
    // her fingers round its left edge, over the bezel; her thumb from the heel of her hand, resting by the right edge, to
    // the thumbs-up button and back (the tap: pressed on the beat)
    boilSeed('f1pov fingers');
    for (const [fy, len] of [[-24, 1], [62, 1.06], [146, 1], [224, .86]]) piece(M(ppBar([-198 - 8 * len, fy + 10], [-160, fy - 2], 58, 50)), sk, { sw: 1.3, shade: skD, depth: 10, key: 'f1pov-f' + fy });   // (only their tips: curled round the edge from behind)
    const reach = ease(seg(tt, F1.tap - .2, F1.tap - .04)) * (1 - ease(seg(tt, F1.tap + .12, F1.tap + .3))), press = tt >= F1.tap - .04 && tt < F1.tap + .1 ? 1 : 0;
    const root = [206, 360], rest = [168, 190], btn = [104, 262], tip = [lerp(rest[0], btn[0], reach), lerp(rest[1], btn[1], reach) - 30 * Math.sin(Math.PI * reach) * (1 - press)];
    piece(M(ppBar(root, tip, 92, 70 * (1 + .1 * press))), sk, { sw: 1.5, shade: skD, depth: 16, key: 'f1pov-th' });
    const na = Math.atan2(tip[1] - root[1], tip[0] - root[0]);
    piece(M(oval(lerp(root[0], tip[0], .86), lerp(root[1], tip[1], .86), 24, 20, na, 14)), mixCol(sk, '#FFF0E6', .45), { sw: .8, key: 'f1pov-nail', flatCard: true });
    camEnd();
  }
  // the chat on her screen (phone-local coords, M → screen; clipped to the glass): his message, then her reply
  function f1PovScreen(tt, M) {
    const pop = (t0, x0, y0) => { const k = backOut(seg(tt, t0, t0 + .17)); return P => P.map(([a, b]) => [x0 + (a - x0) * k, y0 + (b - y0) * k]); };
    boilSeed('f1pov chat');
    // the bar at the bottom: a message field and the thumbs-up button
    piece(M(b2RoundPoly(R4(-140, 238, 58, 288), 24)), '#FFFFFF', { sw: 1.1, key: 'f1pov-field', side: false });
    const lit = tt >= F1.tap - .04 && tt < F1.tap + .16;
    piece(M(oval(104, 262, 32, 32, 0, 22)), lit ? '#FFD84A' : '#F2C230', { sw: 1.2, key: 'f1pov-btn' });
    f1ThumbsUp(M, 104, 264, 34, 'f1pov-btnu');
    if (tt < F1.msg) return;
    // his message: his avatar (him, in his beanie) and a bubble: a pizza box, open on its pizza, and a little figure running
    const pm = pop(F1.msg, -100, -140), Mm = P => M(pm(P)), A = [-100, -198];
    piece(Mm(oval(A[0], A[1], 50, 50, 0, 28)), '#DCE8F2', { sw: 1.3, key: 'f1pov-av', side: false });
    piece(Mm(oval(A[0], A[1] + 12, 32, 34, 0, 22)), HIM_C.col.skin, { sw: 1.1, key: 'f1pov-avf' });
    piece(Mm(curvy([[A[0] - 35, A[1] + 2], [A[0] - 31, A[1] - 30], [A[0], A[1] - 44], [A[0] + 31, A[1] - 30], [A[0] + 35, A[1] + 2], [A[0], A[1] - 4]], 3)), HIM_C.col.hat || '#3B4250', { sw: 1.2, key: 'f1pov-avh' });
    piece(Mm(R4(A[0] - 37, A[1] - 8, A[0] + 37, A[1] + 3)), mixCol(HIM_C.col.hat || '#3B4250', '#FFFFFF', .2), { sw: 1, key: 'f1pov-avhb', flatCard: true });
    for (const ex of [-12, 12]) piece(Mm(oval(A[0] + ex, A[1] + 14, 3.6, 4.2, 0, 8)), '#2A1A14', { ink: null, key: 'f1pov-ave' + ex, flatCard: true });
    dline(Mm([[A[0] - 11, A[1] + 28], [A[0], A[1] + 34], [A[0] + 11, A[1] + 28]]), 1.8, '#5A2A1E', .5);
    piece(Mm(curvy([[-46, -276], [140, -276], [150, -264], [150, -110], [140, -100], [-34, -100], [-58, -80], [-46, -110], [-46, -264]], 2)), '#FFFFFF', { sw: 1.4, key: 'f1pov-bub' });
    // the pizza box, its lid up behind, the pizza in it
    piece(Mm([[-28, -250], [44, -250], [52, -218], [-36, -218]]), '#D9B77A', { sw: 1.2, key: 'f1pov-lid' });
    piece(Mm([[-38, -218], [54, -218], [54, -132], [-38, -132]]), '#D9B77A', { sw: 1.3, key: 'f1pov-box' });
    piece(Mm(oval(8, -175, 40, 30, 0, 24)), '#F0B84A', { sw: 1.1, key: 'f1pov-pz' });
    for (const [dx, dy] of [[-10, -184], [18, -186], [4, -166], [26, -170], [-16, -166], [8, -194]]) piece(Mm(oval(dx, dy, 5.5, 4.5, 0, 8)), '#C8402E', { ink: null, key: 'f1pov-pp' + dx + dy, flatCard: true });
    // the running figure, with its speed lines
    const RX = 108, RY = -176, R = ([a, b]) => [RX + a * 1.25, RY + b * 1.25], rl = P => dline(Mm(P.map(R)), 3.6, BIRO, .3);
    piece(Mm(oval(RX + 10, RY - 45, 11, 11, 0, 12)), BIRO, { ink: null, key: 'f1pov-rh', flatCard: true });
    rl([[6, -26], [-2, 4]]); rl([[4, -18], [18, -10], [26, -20]]); rl([[4, -18], [-10, -8], [-18, -14]]);
    rl([[-2, 4], [12, 18], [10, 34]]); rl([[-2, 4], [-12, 16], [-26, 18]]);
    for (const [y, L] of [[-24, 14], [-10, 20], [4, 10]]) dline(Mm([R([-30 - L, y]), R([-26, y])]), 2, BIRO, 0);
    if (tt < F1.reply) return;
    // her reply: a thumbs-up, on her side
    const pr = pop(F1.reply, 140, 70), Mr = P => M(pr(P));
    piece(Mr(curvy([[4, -52], [128, -52], [138, -40], [138, 52], [152, 72], [124, 62], [14, 62], [4, 52], [4, -40]], 2)), '#BFE0F5', { sw: 1.4, key: 'f1pov-rep' });
    f1ThumbsUp(Mr, 70, 8, 76, 'f1pov-repu');
  }
  // a thumbs-up pictogram (the emoji's: a fist side on, the curled fingers stacked at its front, the thumb up from its
  // top, a cuff at its wrist) at (x, y), s its height, through M
  function f1ThumbsUp(M, x, y, s, key) {
    const Y = '#F2C230', D = '#9A6A12';
    piece(M(b2RoundPoly(R4(x - s * .5, y - s * .02, x - s * .34, y + s * .5), s * .04)), '#5A8AC8', { sw: 1, key: key + 'c' });   // (the cuff)
    piece(M(ppBar([x - s * .14, y + s * .04], [x - s * .02, y - s * .46], s * .26, s * .2)), Y, { sw: 1.1, key: key + 't' });   // (the thumb)
    piece(M(b2RoundPoly(R4(x - s * .36, y - s * .02, x + s * .2, y + s * .52), s * .1)), Y, { sw: 1.2, key: key + 'f' });   // (the fist)
    for (let k = 0; k < 4; k++) piece(M(b2RoundPoly(R4(x + s * .06, y + s * (.0 + k * .13), x + s * .34, y + s * (.13 + k * .13)), s * .06)), Y, { sw: .9, key: key + 'g' + k });   // (the fingers)
    dline(M([[x - s * .18, y + s * .08], [x - s * .02, y + s * .1]]), 1.2, D, .2);   // (the thumb's crease)
  }
  // her tea, in her other hand (from above: the rim, the tea, steam curling up), lower left
  function f1PovMug(tt) {
    // held by its handle, seen from above: the handle toward her, her fingers through it and her thumb along its top; the
    // tea all in view (a fist clamped over the rim, the tea under it and the steam out of her knuckles, read as holding it
    // weirdly: the user)
    const cx = 340, cy = 690, sk = HER_HOME.col.skin, skD = HER_HOME.col.skinDk, a = 2.45, hx = cx + Math.cos(a) * 126, hy = cy + Math.sin(a) * 116;
    boilSeed('f1pov mug');
    piece(ribbon([[hx - 70, hy + 110], [hx - 150, hy + 250], [hx - 230, hy + 420]], 170, 230), HER_HOME.col.coat || PP_TOMATO.coat, { sw: 1.6, shade: PP_TOMATO.coatDk, depth: 40, key: 'f1pov-slvL' });
    // the back of her hand, knuckles to the handle, the fingers curled through it (under the mug's side)
    piece(curvy([[hx - 118, hy + 96], [hx - 96, hy + 22], [hx - 30, hy - 14], [hx + 30, hy + 8], [hx + 34, hy + 58], [hx - 20, hy + 112], [hx - 84, hy + 128]], 4), sk, { sw: 1.4, shade: skD, depth: 18, key: 'f1pov-hL' });
    for (let k = 0; k < 3; k++) dline([[hx - 60 + k * 26, hy + 14 + k * 12], [hx - 44 + k * 26, hy + 30 + k * 12]], 1.2, skD, .3);   // (knuckle creases)
    piece(oval(cx, cy, 104, 96, 0, 30), '#3FB8C0', { sw: 1.6, shade: '#24808A', depth: 16, key: 'f1pov-mug' });
    piece(oval(cx, cy, 84, 76, 0, 28), '#A8662E', { sw: 1.1, key: 'f1pov-tea' });
    piece(oval(cx - 24, cy - 22, 26, 12, -.4, 14), '#C98A50', { ink: null, key: 'f1pov-tea-hl', flatCard: true });   // (the light on the tea)
    push(); translate(hx, hy); rotate(a - Math.PI / 2); piece(ppRing(0, 0, 30, 40, 13, 0), '#3FB8C0', { sw: 1.2, key: 'f1pov-mh' }); pop();   // the handle, over her fingers
    piece(ppBar([hx - 62, hy + 50], [hx + 14, hy - 22], 36, 30), sk, { sw: 1.2, shade: skD, depth: 8, key: 'f1pov-thL' });   // her thumb along the handle's top
    for (let i = 0; i < 3; i++) { const ph = frac(tt * .5 + i * .34), y0 = cy - 30 - ph * 300, x0 = cx - 44 + i * 44, P = [];   // (soft curls, rising and thinning)
      for (let k = 0; k <= 10; k++) { const v = k / 10; P.push([x0 + Math.sin(v * 5.5 + ph * 4 + i * 1.7) * (14 + 16 * v), y0 + 80 - v * 180]); }
      dline(P, 3.2 * (1 - ph) + .8, '#AFC0D6', .8); }
  }
  // her acting in F1 (front view, the middle of the sofa)
  const HER_S = [1000, 900, 30, 4.3];   // on the sofa's left cushion, 3/4, facing the window (flip)
  const MUG0 = [862, 770], PHONE0 = [1128, 772], CLOCK0 = [336, 594];
  function f1Her(t) {
    const e = emotions(t, [[F1.t0 - 5, 'relieved', { eyes: 'closed', mouth: 'smile', lookY: 0 }], [F1.fri - .08, 'happy', { eyes: 'closed', mouth: 'smile' }],   // (a contented stretch, mouth shut: nobody talks in the doodle)
      [F1.morn + .4, 'happy', { lookX: .1 }], [F1.alarm - .12, 'smug', { lookX: 1, lookY: .05, mouth: 'smile' }], [F1.alarm + .85, 'happy', { lookX: .5, lookY: .3 }],
      [F1.off - .1, 'neutral', { lookX: -.8, lookY: .6, mouth: 'flat' }], [F1.pick[1] + .06, 'neutral', { lookX: -.3, lookY: .85, mouth: 'flat' }],   // (at the phone on the seat; at it in her hand)
      [F1.pov[1] - .1, 'happy', { lookX: -.3, lookY: .6, mouth: 'smile' }], [F1.pov[1] + .32, 'relieved', { eyes: 'closed', mouth: 'smile' }]], { take: .3 });   // (smiling at his message; the sip)
    e.emote = null; e.gloom = 0; e.tint = null; e.dy = (e.dy || 0) * .25; e.sq = (e.sq || 0) * .5; e.rot = (e.rot || 0) * .3; e.dx = 0;
    const [, , , sh] = HER_S;
    const stretch = ease(seg(t, F1.fri, F1.fri + .45)) * (1 - ease(seg(t, F1.morn + .35, F1.morn + .8)));
    const reach = seg(t, F1.alarm + .95, F1.alarm + 1.3);
    // (3/4, flipped: R is her near hand, reaching toward the window side)
    const bu2 = (x, y) => [-(x - HER_S[0]) / HER_S[2], (y - HER_S[1]) / HER_S[2]];
    const m0 = bu2(MUG0[0] + 18, MUG0[1] - 30);
    // (at rest she lolls: her far arm along the sofa's backrest, the upper arm up from her shoulder, the elbow on the
    // backrest cushions' top, the forearm lying along it, the hand resting there, open; her near hand in her lap. She
    // keeps the far arm there through the morning: the near hand does the mug. The stretch is lopsided, one arm higher:
    // a mirror-image pair of arms reads stiff. (The far arm's target is her wrist on the cushions' top, world
    // (1100, 588); a negative bend puts the elbow up on it, not hanging below.) The reach for the mug keeps the elbow
    // down by her side (it went out flat at shoulder height)
    const back = [-(1100 - HER_S[0]) / HER_S[2], (588 - HER_S[1]) / HER_S[2]];
    const SB = [back[0], back[1], -.05, 'open', 0, Math.PI - .7, 'u'];   // (the hand relaxed over the backrest, the fingers drooping)
    const P = { lap: { L: SB, R: [.35, .95, .4, 'relax', 1, 2.3] },
      up: { L: [-1.95, -2.1, .35, 'open', 0, -2.1], R: [1.45, -2.9, .15, 'open', 0, -1.35] },
      reach: { L: SB, R: [m0[0], m0[1], -.2, 'hold', 1, -1.5, 'u'] },
      hold: { L: SB, R: [.5, .75, .45, 'hold', 1, -1.5] },   // (the mug held low, by her lap, between sips)
      sip: { L: SB, R: [.62, -.06, .5, 'hold', 1, -1.6] },
      down: { L: SB, R: [2.9, .8, .2, 'open', 1, .8] } };   // (out of the stretch, the arm swings down in front of her before it goes to her lap: blended straight from above her head, the hand came down past her shoulder and the arm folded double there for a drawing, the elbow a knot at her shoulder (233.0))
    const po = { seated: true, seatH: sh, view: 'q' };
    // (the tea held low through "No office", the sip once she's sent her reply, as we cut back)
    const pose = poseTrack(t, [[F1.t0 - 5, 0, P.lap], [F1.fri, .4, P.up], [F1.morn + .35, .1, P.down], [F1.morn + .45, .3, P.lap], [F1.alarm + .95, .35, P.reach], [F1.alarm + 1.35, .4, P.hold], [F1.pov[1] - .04, .4, P.sip]], backOut, HER_HOME, po);
    // her free hand and the phone: off the backrest, down to the phone on the seat beside her (the hand closing on it),
    // and up with it into her lap, held upright in her palm, the screen to her, the elbow down by her side
    const ph = bu2(PHONE0[0] - 4, PHONE0[1] - 16), pl = bu2(LOOKQ.x, LOOKQ.y);
    const PICK = [ph[0], ph[1], .1, 'hold', 0, 1.75, 'u'], LOOK = [pl[0], pl[1], LOOKQ.b, 'hold', 1, LOOKQ.a, 'u'];
    if (t >= F1.pick[0]) pose.L = poseTrack(t, [[F1.pick[0] - 1, 0, { L: SB, R: P.hold.R }], [F1.pick[0], .16, { L: PICK, R: P.hold.R }], [F1.pick[1], .24, { L: LOOK, R: P.hold.R }]], backOut, HER_HOME, po).L;
    const holdsMug = t >= F1.alarm + 1.25, ang = pose.R[5] ?? -1.5;
    const o = { ...e, pose, dy: e.dy - .3 * stretch, sq: e.sq - .05 * stretch, seated: true, seatH: sh, view: 'q', flip: true, boilKey: 'f1her', noShadow: true, rot: -.06 * Math.sin(Math.PI * reach) };
    if (holdsMug) o.hold = mugHold(ang, t);
    if (t >= F1.pick[0] + .12) o.holdL = phoneHold(pose.L[5] ?? -1.25, t, t >= F1.buzz0 && t < F1.pov[0]);
    return o;
  }
  // a morning sunbeam: a few soft rays from the window, the room's shading lifted along them
  function sunbeam(t) {
    boilSeed('f1 beam');
    [[190, 250, 34, 150], [330, 420, 26, 120], [470, 560, 20, 90]].forEach(([ya, yb, w0, w1], i) => {
      const d = [1, .62], L = 1700, a0 = [490, (ya + yb) / 2], n = [-d[1] / Math.hypot(...d), d[0] / Math.hypot(...d)];
      const b0 = [a0[0] + d[0] * L, a0[1] + d[1] * L];
      const P = [[a0[0] + n[0] * w0, a0[1] + n[1] * w0], [b0[0] + n[0] * w1, b0[1] + n[1] * w1], [b0[0] - n[0] * w1, b0[1] - n[1] * w1], [a0[0] - n[0] * w0, a0[1] - n[1] * w0]];
      _paint(P, { wash: '#FFF3C4', washOp: 58, ink: null });
    });
  }
  // F1's world (doodle), in F1 world coords (no camera)
  function f1World(t) {
    look('doodle');
    const tt = mt(t), fo = { morning: 1, rain: 0, lamp: 0, fairy: 0 };
    const hs = f1Her(tt);
    setStill(() => {   // (the set: still; only she, and what moves, boils)
      boilSeed('f1 page'); page(-900, -700, W + 900, H + 700);
      const view0 = prFlatView; prFlatView = f1View;   // (the set's window draws my view: the sun coming up)
      try {
        prFlatRoom(tt, fo); prFlatWindow(tt, fo);
        alarmClock(tt, CLOCK0[0], CLOCK0[1], 58);
        prFlatCorner(tt, fo);   // (no pile of post: no bills in the good future, the user)
      } finally { prFlatView = view0; }
      prSofa(tt, fo);
      sunbeam(tt);
      // the phone, face down on the seat beside her, until she picks it up
      // (real size, as in her hand: about 37 px long; it was drawn 82)
      if (!hs.holdL) { boilSeed('f1 phone'); push(); translate(...PHONE0); rotate(.08);   // face down on the cushion: its back, a camera bump
        piece(curvy([[-18, -6], [17, -6.5], [19, 3.5], [-17, 4.5]], 2), '#2A2E38', { sw: 1.3, key: 'f1phone' }); piece(curvy([[-13.5, -4], [-7, -4.2], [-6.8, .2], [-13.5, .6]], 2), '#6E7488', { sw: .8, key: 'f1cam', flatCard: true });
        pop(); }
      if (!hs.hold) { boilSeed('f1 mug'); push(); translate(...MUG0); mug(tt, 58, 'f1mug', .6); pop(); }
    });
    const [hx, hy, hu] = HER_S;
    person(hx, hy, hu, HER_HOME, hs);
  }
  // F1's camera: the window close-up, then across the room to her
  const F1C0 = { cx: (FW.x0 + FW.x1) / 2, cy: (FW.y0 + FW.y1) / 2, zoom: H / (FW.y1 - FW.y0) };
  // (then one slow push in on her, through the morning and on under the night's sweep: F1's gentle life, on ones)
  function f1Cam(t) {
    const k = kf(t, [[F1.open[1] + .5, [F1C0.cx, F1C0.cy, F1C0.zoom]], [F1.fri - .5, [720, 556, 1.62]], [F1.t1 + .62, [812, 584, 1.9]]], ease);
    return { cx: k[0], cy: k[1], zoom: k[2] };
  }
  function f1Frame(t) { const C = f1Cam(t); camBegin(C.cx, C.cy, C.zoom); f1World(t); camEnd(); }
  SHOT.F1 = (t, lt, dur) => {
    if (t >= F1.pov[0] && t < F1.pov[1]) { f1Pov(t); look('doodle'); return; }
    const C = f1Cam(t), open = seg(t, ...F1.open);
    if (open >= 1) { f1Frame(t); look('doodle'); return; }
    // in: one continuous action (the user: "the arm is doing multiple weird things"). His hand, in through the window at
    // the end of D1 (doodle inside it, card outside: its edge is the boundary), comes back out to its left edge and grips
    // it from the front, the fingers curled round onto the frame (GRIP, 0.3 s); then he pulls it toward himself (PULL):
    // the window swings open toward him and the camera, its left edge following his fist, his arm bending (the upper arm
    // out, the forearm coming back up to the fist) as he leans back; the camera pushes in on the window, so he slides out
    // of the frame to the left, until the window fills the frame (F1 takes over on the same frame as before). Every frame
    // his arm runs shoulder, elbow, wrist, hand: the window's edge stays at his fist, so it never covers him.
    // (the grip: four drawings, evenly spaced, so the hand travels back out and down to the edge without a jump)
    const grip = seg(mt(t), F1.t0, F1.t0 + .3), kg = lerp(grip, ease(grip), .4), o2 = seg(t, F1.t0 + .2, F1.open[1]), e = easeIn(o2) * .35 + ease(o2) * .65;
    const pull = ease(seg(t, F1.t0 + .22, F1.open[1] - .1));
    // the edge he holds (D1 world): the window's left edge, low, a little below his shoulder (like a door's handle: his
    // upper arm down, the forearm up to it); he pulls it 40 px toward himself
    const G = [DW.x0 - 40 * pull, DW.cy + 90];
    // the camera: D1's, pushing in on the window as the window opens, so that his fist (on the edge) reaches the frame's
    // left edge as the window fills the frame
    const [cx0, cy0, z0] = d1Cam(t), z1 = 2.4, zz = Math.exp(lerp(Math.log(z0), Math.log(z1), e));
    const cx1 = G[0] + (W / 2 + 4) / z1, cy1 = DW.cy, dx = lerp(cx0, cx1, e), dy = lerp(cy0, cy1, e), dz = zz;
    const sx = x => W / 2 + (x - dx) * dz, sy = y => H / 2 + (y - dy) * dz;
    // the opening (screen): the window's rect under this camera, growing to the frame; its left edge at his fist's knuckles
    const r0 = [sx(DW.x0), sy(DW.y0), sx(DW.x1), sy(DW.y1)], r = [sx(G[0]), lerp(r0[1], -4, e), lerp(r0[2], W + 4, e), lerp(r0[3], H + 4, e)];
    // his far hand: from inside the window (D1's last pose) out to a fist round the edge, as you'd hold a door's edge: the
    // hand upright, in line with the forearm (the wrist a little below and left of the edge, the fist's side against it),
    // the fingers wrapping round onto its front (drawn below); world → his body units through his lean, as person()
    // places him. He leans back as he pulls
    const handR = (R, o) => {
      o.rot = lerp(o.rot || 0, .02, pull);
      const a = -(o.rot || 0), px = G[0] - 26 - 760, py = G[1] + 40 - 890 - (o.dy || 0) * 1.1 * 50, g = [(px * Math.cos(a) - py * Math.sin(a)) / 50, (px * Math.sin(a) + py * Math.cos(a)) / 50];
      return [lerp(R[0], g[0], kg), lerp(R[1], g[1], kg), lerp(R[2], .1, kg), kg < .5 ? R[3] : 'fist', 1, lerp(R[5] ?? 0, -1.2 - (o.rot || 0), kg), 'u'];
    };
    camBegin(dx, dy, dz); const hs = d1World(t, { content: false, handR }); camEnd();
    // the picture in the opening: from mapped into the window (as D1 draws it) to F1's camera
    const a0 = dz * DW.k, bx0 = sx(DW.x0) - FW.x0 * a0, by0 = sy(DW.y0) - FW.y0 * a0, a1 = C.zoom, bx1 = W / 2 - C.cx * a1, by1 = H / 2 - C.cy * a1;
    const a = Math.exp(lerp(Math.log(a0), Math.log(a1), e)), bx = lerp(bx0, bx1, e), by = lerp(by0, by1, e);
    clipTo([R4(...r)], true);
    push(); resetMatrix(); translate(-W / 2, -H / 2); translate(bx, by); scale(a); f1World(t); pop();
    clipEnd();
    // while his hand is still in through the window: that part of him doodle, clipped to the opening (as in D1); once his
    // fist is at the edge (the last grip drawing on) it's all in the room, card
    if (kg < .8) { camBegin(dx, dy, dz); look('doodle'); clipPoly(R4(...r).map(([x, y]) => [(x - W / 2) / dz + dx, (y - H / 2) / dz + dy]), () => d1HandD(hs)); camEnd(); look('card'); }
    // the window's frame (D1's scratched line: cream, the biro on it), round the opening
    const FP = wob(PEN, 3).slice(5).map(([x, y]) => [lerp(r[0], r[2], (x - DW.x0) / (DW.x1 - DW.x0)), lerp(r[1], r[3], (y - DW.y0) / (DW.y1 - DW.y0))]);
    look('card'); boilSeed('f1 edge');
    push(); resetMatrix(); translate(-W / 2, -H / 2);
    longLine(FP, 5.5 * dz, '#EFE6D0', 'rotring'); longLine(FP.map(([x, y]) => [x + .8 * dz, y - .6 * dz]), 1.6 * dz, '#3A4AA8', 'rotring');
    pop();
    // his fingers wrapped round the edge onto its front, from when his grip closes (card, his hand's size): three
    // fingertips from the edge, level with his fist, a little fanned, the middle one longest
    if (kg > .9) {
      const s = HIM_C.body.hand * 50, ca = Math.cos(.05), sa = Math.sin(.05), at = (x, y) => [G[0] + x * ca - y * sa, G[1] + 16 + x * sa + y * ca];
      camBegin(dx, dy, dz); look('card'); boilSeed('f1 grip');
      for (const [fy, len, fa] of [[-.27, .3, -.08], [0, .36, 0], [.27, .31, .1]]) {
        const w = .125 * s, x0 = -.04 * s, x1 = x0 + len * s, y0 = fy * s, y1 = y0 + Math.sin(fa) * len * s, P = [];
        for (let i = 0; i <= 8; i++) { const q = Math.PI / 2 + i / 8 * Math.PI; P.push(at(x0 + Math.cos(q) * w, y0 + Math.sin(q) * w)); }
        for (let i = 0; i <= 8; i++) { const q = -Math.PI / 2 + i / 8 * Math.PI; P.push(at(x1 + Math.cos(q) * w * .92, y1 + Math.sin(q) * w * .92)); }
        piece(P, HIM_C.col.skin, { sw: 1.2, key: 'f1grip' + fy, lift: 2, flatCard: true, maxTone: .45 });
      }
      camEnd();
    }
    look(e < .5 ? 'card' : 'doodle');
  };

  // =====================================================================================================================
  // THE DEN (F2, F3): the Friday of demo/sets/friday.js, copied here so its acting can be timed to the words and carried
  // on into F3. The drawing is friday.js's, unchanged; the changes are marked "bridge.js": the talk starts on "world"
  // and turns to nonsense on "bollocks", no film cutaway and no rub-out, the laugh settles (T_CALM), the bubble pops,
  // and EXTRA holds F3's acting (more emotion keys, arm tracks, overrides) and its layer over shot B (the island, the
  // clock, the birds). DEN.frame(t) draws the frame at F2 time t (s since bar 133); o.cam(t) overrides shot B's camera.
  // =====================================================================================================================
  const DEN = (() => {
    const EXTRA = { him: [], her: [] };
  const LEN = 8, B = BEAT;
  const snap = x => Math.round(x * 12) / 12;   // onto the 12-a-second drawing grid (mt), so a hit gets its own drawing
  const T_KNOCK = [snap(3 * B), snap(3.5 * B)], T_DOOR = snap(4 * B), T_HOP = snap(5 * B), T_LAND = snap(6 * B);
  // (bridge.js: times are F2 time (s since bar 133): the clink on "rights", then the talk on the next beat (cannonball,
  // clink, bubble: one at a time). The talk is theirs, not his: two bubbles, pictures only, nobody's mouth moving (she
  // narrates the doodle from outside: the user). He puts the world to rights (the patched globe, T_TALK); she comes back
  // with her own idea for it (T_REPLY); on "bollocks" (T_DUCK) it turns to nonsense, the two bubbles alternating every
  // half beat, talking over each other, building to the laugh (T_LAUGH), where the bubbles pop; the laugh runs on into
  // F3 and settles (T_CALM); no rub-out at the end)
  const TC = snap(8 * B), T_FILM = snap(9 * B), T_TALK = snap(9 * B), T_REPLY = snap(10.5 * B), T_DUCK = snap(12 * B), T_LAUGH = snap(15 * B), T_POP = T_LAUGH + .17, T_CALM = 7.75, T_DRAIN = Infinity, T_BARE = Infinity, T_GONE = Infinity;
  const T_GRAB = T_KNOCK[1] + .08;                                  // she picks up her can
  // the cuts (on beats): A (from behind them, towards the TV) until the door opens; B (the reverse, from the TV) for his
  // arrival and the clink; A as the TV flicks to the film; B for the talk and the laugh
  const SHOTS = [[0, 'A'], [T_DOOR, 'B']];
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
    const L = [], pl = 1;   // (bridge.js: no beat pulse: it flipped the room's pencil strokes near its edge on and off)
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
    const L = [], pl = 1;
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
  // The pizza (bridge.js: he brings it, the user: "make sure Rowan actually brings the pizza": F1's message said so, and it
  // was there before he came). No pizza in the den until he's in; he comes in with the box tucked flat under his near arm
  // (his can in that hand, the biscuits up in the other), cannonballs onto his bean bag, and as he stops dead on it the box
  // carries on out from under his arm (PZ.out), sails down (three drawings) and lands flat on the floor in the pizza's
  // place between them (PZ.land), shut; on the next drawing its lid springs open (PZ.open): from then on it's the den's
  // pizza, as the Friday drawing has it. (Sat in a bean bag he can't reach the floor in front of it: the landing delivers
  // it. The pizza's place is behind the subtitle banner in this shot, as it always was: the box drops behind the banner
  // and its lid springs up over it)
  const PZ = { out: T_LAND, land: T_LAND + 3 / 12, open: T_LAND + 4 / 12, x: 985, y: 1046 };
  // the box shut, as the open one sits (its top face in the same perspective), at (cx, cy) its spot, k its size, a a turn,
  // sq a squash (the landing)
  function pizzaShut(cx, cy, k, a, sq, key) {
    const T = P => P.map(([x, y]) => { const X = x * .8 * k, Y = (y * .8 + 12) * k * (1 - sq); return [cx + X * Math.cos(a) - Y * Math.sin(a), cy - 12 * k + X * Math.sin(a) + Y * Math.cos(a)]; });
    piece(T([[-150, 40], [150, 40], [150, 60], [-150, 60]]), COL.pizzaBox, { sw: 2, key: key + 'f' });
    piece(T([[-128, -70], [128, -70], [150, 40], [-150, 40]]), '#D9AE72', { sw: 2.2, key: key + 't' });
    piece(T(oval(0, -14, 44, 22, 0, 18)), '#F4EEE6', { sw: 1.2, key: key + 'lg', flatCard: true });   // (a pizza on its lid: no words)
    piece(T([[0, -14], [36, -26], [30, -2]]), COL.cheese, { sw: 1, key: key + 'sl', flatCard: true });
    piece(T(oval(22, -16, 5, 3, 0, 8)), COL.pepperoni, { ink: null, key: key + 'sp', flatCard: true });
  }
  // the box under his arm (in his rig's space, px: c the clamp point between his upper arm and his side, u his body unit):
  // a flat box seen edge on, its front end out ahead of him
  function pizzaTucked(c, u, key) {
    const w = 4.3 * u, th = .62 * u, x0 = c[0] - .42 * w, x1 = c[0] + .58 * w, y0 = c[1] - th / 2, y1 = c[1] + th / 2;
    piece([[x0 + .04 * w, y0 - .16 * u], [x1 + .02 * w, y0 - .16 * u], [x1, y0], [x0, y0]], '#D9AE72', { sw: 1.4, key: key + 'top' });
    piece([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], COL.pizzaBox, { sw: 1.6, key: key + 'side' });
    pen([[x0 + .03 * w, y0 + th * .3], [x1 - .03 * w, y0 + th * .3]], 1.2, .3);   // (the lid's edge)
    const lx = x1 - .2 * w, ly = y0 + th * .64, r = th * .3;   // (a pizza on its side, no words)
    piece(oval(lx, ly, r * 1.5, r, 0, 12), COL.cheese, { sw: .9, key: key + 'lg', flatCard: true });
    piece(oval(lx + r * .3, ly - r * .1, r * .4, r * .3, 0, 8), COL.pepperoni, { ink: null, key: key + 'lp', flatCard: true });
  }
  function snacksFront(t, pizza = true, lidUp = 0) {
    boilSeed('fr-snacksF');
    // the pizza box, open, a slice gone (lidUp: the lid sprung up past its rest, as it pops open)
    const px = PZ.x, py = PZ.y, z = P => P.map(([x, y]) => [px + (x - px) * .8, py + (y - py) * .8]);
    if (pizza) {
    piece(z([[px - 118, py - 76], [px + 118, py - 76], [px + 104 - lidUp * .3, py - 150 - lidUp], [px - 104 + lidUp * .3, py - 150 - lidUp]]), '#D9AE72', { sw: 2, key: 'fr-pizzalid' });
    piece(z([[px - 128, py - 70], [px + 128, py - 70], [px + 150, py + 40], [px - 150, py + 40]]), COL.pizzaBox, { sw: 2.2, key: 'fr-pizzabox' });
    const pz = []; for (let i = 0; i <= 26; i++) { const a = -.5 + i / 26 * (TAU - .95); pz.push([px + Math.cos(a) * 112, py - 14 + Math.sin(a) * 42]); }
    pz.push([px, py - 14]);
    piece(z(pz), COL.crust, { sw: 2, key: 'fr-pizzacrust', flatCard: true });
    piece(z(pz.map(([x, y]) => [lerp(px, x, .86), lerp(py - 14, y, .8)])), COL.cheese, { ink: null, key: 'fr-pizzacheese', flatCard: true });
    for (let i = 0; i < 7; i++) { const a = -.2 + i * .8, r = .55 * (i % 2 ? 1 : .75); piece(z(oval(px + Math.cos(a) * 112 * r, py - 14 + Math.sin(a) * 42 * r, 11, 5, 0, 10)), COL.pepperoni, { sw: .9, key: 'fr-pep' + i, flatCard: true }); }
    }
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
    const e = calm(emotions(t, [[0, 'excited', { mouth: 'grin', lookX: .8 }], [T_LAND, 'happy', { lookX: .6 }], [T_TALK - .08, 'determined', { lookX: .85, mouth: 'smile' }],
      [TC - .25, 'excited', { lookX: .8, mouth: 'grin' }], [TC + .4, 'determined', { lookX: .85, mouth: 'smile' }], [T_REPLY + .1, 'happy', { lookX: 1, mouth: 'smile' }], [T_DUCK + .05, 'excited', { lookX: .9, mouth: 'smile' }], [T_LAUGH + .16, 'laugh'], ...EXTRA.him]), true, phase === 'door' ? 2 : 1);
    const o = { ...e, view: 'q', flip: true, noShadow: true, boilKey: 'frH', seed: 1, seated: true, seatH: SEAT_H };
    let x = HIM_X, y = GB, u = U0;
    if (phase === 'hidden' || phase === 'door') { [x, y] = DOOR_SPOT; u = U_DOOR; o.seated = false; o.sq += .24 * ease(seg(t, T_HOP - .14, T_HOP)); }
    else if (phase === 'air') {
      const k = seg(t, T_HOP, T_LAND), kx = lerp(k, ease(k), .5);
      x = lerp(DOOR_SPOT[0], HIM_X, kx); y = lerp(DOOR_SPOT[1], GB, k) - 170 * 4 * k * (1 - k); u = lerp(U_DOOR, U0, k);
      o.rot = .2 * Math.sin(k * Math.PI); o.sq = k < .2 ? -.2 : 0;
    } else { const a = t - T_LAND; o.sq += .34 * Math.exp(-a * 7) * Math.cos(a * 18); }
    // (bridge.js: no talking mouth while the bubble's up: nobody talks in the doodle, the bubble carries it)
    if (EXTRA.himO) Object.assign(o, EXTRA.himO(t, o));
    const hit = take(t, TC, .45); o.sq += hit.sq * .6; o.dy += hit.dy * .2;
    const lean = .08 * ease(seg(t, 3.0, 3.35)) * (1 - ease(seg(t, 3.6, 4.0)));
    const laughK = ease(seg(t, T_LAUGH + .16, T_LAUGH + .41)) * (1 - ease(seg(t, T_CALM, T_CALM + .5)));
    o.rot -= lean; o.tilt = -laughK * (.12 + .05 * Math.abs(Math.sin(t * TAU * 2.5))) + (o.tilt || 0);
    const C = pcfg(x, y, u, o), Fr = personFrame(HIM_P, { seated: o.seated, seatH: SEAT_H, view: 'q' });
    // his can (right hand, towards her): keys by reach (see grip()); the clink is a world point
    const rest = grip(HIM_P, Fr, 1, 62, .91, -.5), up = grip(HIM_P, Fr, 1, -55, .88, -1.35), wind = grip(HIM_P, Fr, 1, 25, .84, -.9, { tilt: -.1 });
    // (bridge.js: after the clink his can rests by his hip (at the bar their two cans and hands sat on each other for
    // ten seconds); he makes his point with it as he puts the world to rights, and again on "bollocks")
    const knee = grip(HIM_P, Fr, 1, 84, .74, -.85), point = grip(HIM_P, Fr, 1, -48, .66, -1.3, { tilt: -.08, ease: backOut }), point2 = grip(HIM_P, Fr, 1, -62, .7, -1.45, { tilt: -.12, ease: backOut });   // (raised, on his own side: reaching out to her the two arms met over the bar)
    const cheers = grip(HIM_P, Fr, 1, -66, .84, -1.2, { tilt: .05, ease: easeOut, arc: 10 });   // (up, on his own side of the clink)
    // (bridge.js: in the door and the air his can's held in front of his chest, not up: the pizza box is tucked under that
    // arm, the upper arm down against his side)
    const carry = grip(HIM_P, Fr, 1, 72, .72, -1.4);   // (the upper arm down his side, clamping the box; the forearm forward, the can at his waist)
    const m = propTrack(t, C, [
      [0, carry], [T_LAND, carry], [T_LAND + .3, rest],
      [2.85, rest], [3.02, wind], [3.24, cheers],
      [TC, { w: 1, p: [XC + CANW, YC], a: -1.1, tilt: .15, ease: easeIn }], [3.6, { w: 1, p: [XC + CANW, YC], a: -1.1, tilt: .15 }],
      [T_TALK, point], [T_TALK + .5, point], [T_TALK + .85, knee], [T_DUCK - .05, knee], [T_DUCK + .2, point2], [T_DUCK + .6, point2], [T_DUCK + 1.0, knee], ...(EXTRA.himCan ? EXTRA.himCan(knee, Fr, grip) : [])]);
    if (t >= TC && t < 3.8) m.w[0] += 7 * Math.max(0, spring(t, TC, 7, 22));   // the knock of the clink
    const cb = toR(C, m.w), angR = m.a;
    const R = holdAt(HIM_P, cb, angR, 'hold', .25);
    // the biscuits (left hand): held up high at the door and in the air, on his knee once he's sat, waved when he laughs
    const shake = t > T_LAUGH + .16 && t < T_CALM ? .5 * Math.sin(t * TAU * 5) * (1 - seg(t, T_CALM - .3, T_CALM)) : 0;
    const gb = (deg, k, a) => { const g = grip(HIM_P, Fr, -1, deg, k, a); return holdAt(HIM_P, g.p, a, 'hold', .2); };
    const L = EXTRA.himL ? EXTRA.himL(t, { gb, shake, specTrack }) : specTrack(t, [[0, gb(-100, .88, -1.75)], [T_LAND + .1, gb(55, .92, -1.1)], [T_LAUGH + .16, gb(-95 + shake * 10, .88, -1.8)], [T_CALM, gb(55, .92, -1.1)]]);
    const fizz = t >= TC ? Math.exp(-(t - TC) * 3) : 0;
    o.pose = { L, R };
    o.hold = canHold(C, angR, m.tilt, COL.canHim, 'frHc', fizz);
    o.holdL = biscuitHold(C, L[5], 'frHb', shake * .15);
    if (window.FR_DEV && (!reachOK(HIM_P, Fr, 1, R) || !reachOK(HIM_P, Fr, -1, L))) console.warn(`friday: his arm can't reach at ${t.toFixed(2)}`);
    return { o, C, Fr, x, y, u, phase, canW: m.w, pizza: phase !== 'hidden' && t < PZ.out };
  }
  // HER: on her bean bag (shot B starts as he comes in: the controller's in her lap, her can in her hand)
  function her(t) {
    const e = calm(emotions(t, [[0, 'neutral', { lookX: 1, lookY: -.1, mouth: 'flat' }],
      [T_DOOR + .1, 'smug', { lookX: 1 }], [T_LAND + .05, 'happy', { lookX: .8 }], [T_LAND + .45, 'neutral', { mouth: 'smile', lookX: 1 }],
      [TC - .17, 'excited', { lookX: .8, mouth: 'grin' }], [TC + .45, 'neutral', { mouth: 'smirk', lookX: 1 }], [T_REPLY - .1, 'smug', { lookX: 1, mouth: 'smirk' }], [T_DUCK + .25, 'happy', { lookX: 1, mouth: 'smile' }], [T_LAUGH, 'laugh', { blush: 1 }], ...EXTRA.her]), false);
    const o = { ...e, view: 'q', seated: true, seatH: SEAT_H, noShadow: true, boilKey: 'frS', seed: 4 };
    const bounce = t >= T_LAND ? Math.max(0, spring(t, T_LAND, 6, 16)) : 0;
    o.dy -= .5 * bounce;
    const hit = take(t, TC, .45); o.sq += hit.sq * .6; o.dy += hit.dy * .2;
    const lean = .08 * ease(seg(t, 3.05, 3.38)) * (1 - ease(seg(t, 3.6, 4.0)));
    const laughK = ease(seg(t, T_LAUGH, T_LAUGH + .23)) * (1 - ease(seg(t, T_CALM - .15, T_CALM + .35)));
    o.rot += lean; o.tilt = -laughK * (.14 + .05 * Math.abs(Math.sin(t * TAU * 2.2 + 1)));
    if (EXTRA.herO) Object.assign(o, EXTRA.herO(t, o));
    const C = pcfg(HER_X, GB, U0, o), Fr = personFrame(HER_P, { seated: true, seatH: SEAT_H, view: 'q' }), sL = shoulderQ(HER_P, Fr, -1);
    // her can (left hand, the one towards him): raised to him with a smirk as he comes in, down, cheers, the clink
    const rest = grip(HER_P, Fr, 1, 58, .8, -.55), up = grip(HER_P, Fr, 1, -35, .78, -1.3, { tilt: .12, ease: backOut }), upHold = { ...up, ease: ease };
    // (bridge.js: after the clink her can rests by her hip, not at the bar under his; she lifts it at him as she comes
    // back with her own idea (her bubble); EXTRA.herCan: F3's)
    const knee = grip(HER_P, Fr, 1, 86, .72, -.95), reply = grip(HER_P, Fr, 1, -40, .64, -1.25, { tilt: .06, ease: backOut });   // (raised, on her own side)
    const wind = grip(HER_P, Fr, 1, 22, .8, -.9, { tilt: -.1 }), cheers = grip(HER_P, Fr, 1, -62, .8, -1.2, { tilt: .05, ease: easeOut, arc: 8 });
    const m = propTrack(t, C, [
      [0, rest], [T_DOOR + .1, rest], [T_DOOR + .35, up], [T_HOP + .1, upHold], [T_HOP + .4, rest],
      [2.9, rest], [3.08, wind], [3.28, cheers],
      [TC, { w: 1, p: [XC - CANW, YC], a: -1.1, tilt: .15, ease: easeIn }], [3.66, { w: 1, p: [XC - CANW, YC], a: -1.1, tilt: .15 }], [4.05, knee],
      [T_REPLY - .12, knee], [T_REPLY + .1, reply], [T_REPLY + .55, reply], [T_REPLY + .9, knee], ...(EXTRA.herCan ? EXTRA.herCan(knee, Fr, grip) : [])]);
    if (t >= TC && t < 3.8) m.w[0] -= 7 * Math.max(0, spring(t, TC, 7, 22));
    const cb = toR(C, m.w), angR = m.a;
    const R = holdAt(HER_P, cb, angR, 'hold', .25);
    // her other hand: on the controller in her lap; laughing, to her belly (the controller left in her lap)
    const lap = [sL[0] + 2.4, Fr.yh - .45], holding = t < T_LAUGH + .05;
    const L = EXTRA.herL ? EXTRA.herL(t, { holdAt, lap, sL, Fr, specTrack }) : specTrack(t, [[0, holdAt(HER_P, lap, .15, 'hold', .3)], [T_LAUGH + .05, [sL[0] + 1.35, Fr.ys + 2.1, .45, 'relax', 1, .25, 'u']]], .2);
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
  // her idea for the world: a light bulb whose glass is a little globe, its rays out
  function bulbGlobe(x, y, t, key) {
    push(); translate(x, y + 6); rotate(.08 * Math.sin(t * 2.3));
    piece(curvy([[-11, 14], [11, 14], [9, 30], [-9, 30]], 2), '#B8BCCB', { sw: 1.6, key: key + 'n' });
    for (const yy of [19, 25]) pen([[-10, yy], [10, yy + 1]], 1.1);
    piece(oval(0, 33, 6, 4, 0, 10), '#6E7488', { sw: 1, key: key + 'tip', flatCard: true });
    piece(oval(0, -16, 32, 32, 0, 28), COL.ocean, { sw: 2, key: key + 'g' });
    for (const [lx, ly, r0, a] of [[-12, -24, 11, .4], [10, -8, 9, -.3], [4, -30, 6, 0]]) piece(curvy(oval(lx, ly, r0, r0 * .7, a, 10), 3), COL.hill, { sw: 1.1, key: key + 'c' + lx, flatCard: true });
    pop();
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .55; pen([[x + Math.cos(a) * 44, y - 10 + Math.sin(a) * 44], [x + Math.cos(a) * 58, y - 10 + Math.sin(a) * 58]], 1.6); }
  }
  // the nonsense: a daft doodle; item 0 a rubber duck, 1 a banana, 2 a flying saucer, 3 a spiral and a star, 4 a sock
  function nonsense(item, key) {
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
    } else if (item === 3) {   // a spiral and a star
      const S = []; for (let i = 0; i < 40; i++) { const a = i * .42, r = 2 + i * .75; S.push([-14 + Math.cos(a) * r, Math.sin(a) * r]); }
      pen(S, 1.8, .6);
      piece(star5(30, -10, 16), COL.sun, { sw: 1.5, key: key + 'st' });
    } else {   // an odd sock, striped
      piece(curvy([[-16, -34], [8, -34], [8, 2], [28, 6], [36, 18], [28, 30], [-4, 30], [-16, 18]], 3), MAG, { sw: 1.8, key: key + 'sk' });
      for (const yy of [-26, -16]) piece([[-16, yy], [8, yy], [8, yy + 5], [-16, yy + 5]], COL.sun, { ink: null, key: key + 'ss' + yy, flatCard: true });
      piece(curvy([[22, 8], [36, 18], [28, 30], [20, 28]], 2), AQUA, { sw: 1.2, key: key + 'st', flatCard: true });
    }
  }
  // what each of them says: before the turn, his patched globe / her bulb; from "bollocks" (his at T_DUCK, hers half a beat
  // later) a new daft doodle every beat, each popping in, so the two alternate every half beat
  const SAYS = { him: { t0: T_DUCK, items: [0, 2, 3] }, her: { t0: T_DUCK + B / 2, items: [1, 4, 0] } };
  function talk(x, y, t, key, who) {
    const W0 = SAYS[who];
    if (t < W0.t0) { if (who === 'him') globe(x, y, 56, t, key + 'gl'); else { push(); translate(x, y + 8); scale(1.45); bulbGlobe(0, 0, t, key + 'bu'); pop(); } return; }
    const bf = (t - W0.t0) / B, bi = Math.floor(bf + .1), k = backOut(seg(bf - bi + .1, 0, .35));
    push(); translate(x, y); scale(1.4 * (.7 + .3 * k)); rotate(.12 * Math.sin(bi * 2.1 + (who === 'her' ? 1 : 0)));
    nonsense(W0.items[bi % W0.items.length], key);
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
    setStill(() => {   // (the set: still)
      roomA(t);
      solid(() => { drawDoor(t, DOOR_A, 'fr-doorA', -1); tv(t); push(); translate(90, -120); lavaLamp(t); pop(); });
      neon(t);
      solid(() => { push(); translate(140, -200); shisha(t); pop(); push(); translate(0, -240); snacksBack(t); snacksFront(t, false); pop(); });   // (no pizza yet: he brings it)
      if (t < T_GRAB) { boilSeed('fr-canA'); push(); translate(CAN_A[0], CAN_A[1]); scale(MS); can(CAN_S, COL.canHer, 'frSa'); pop(); }
    });
    // him (once he's in) on the left, her on the right: their backs (paper first), then their bean bags in front
    if (inA2) onPaper(() => backView(HIM_XA, GYA, UA, HIM_P, 'him', himO));
    onPaper(() => backView(HER_XA, GYA, UA, HER_P, 'her', herO));
    setStill(() => solid(() => { beanBagBack(HIM_XA, COL.beanHim, COL.beanHimDk, 'fr-bbH'); beanBagBack(HER_XA, COL.beanHer, COL.beanHerDk, 'fr-bbS'); }));
    onPaper(() => backView(HER_XA, GYA, UA, HER_P, 'her', { ...herO, late: true }));   // (her arm reaching down past her bean bag)
  }
  // SHOT B: the reverse, from the TV: their faces (the TV is where the camera is), the back wall behind them.
  function sceneB(t, M, S) {
    const land = M.phase === 'seat' ? Math.max(0, .9 * Math.exp(-(t - T_LAND) * 6) * Math.cos((t - T_LAND) * 14)) : 0;
    setStill(() => {   // (the set: still)
      roomB(t);
      solid(() => { drawDoor(t, DOOR_B, 'fr-doorB', 1); push(); translate(-1340, 0); lavaLamp(t); pop(); });
      solid(() => {
        beanBag(HIM_X, -1, COL.beanHim, COL.beanHimDk, land, 'fr-beanH');
        beanBag(HER_X, 1, COL.beanHer, COL.beanHerDk, .3 * S.slop, 'fr-beanS');
        push(); translate(-940, 0); shisha(t); pop();
        snacksBack(t);
      });
    });
    // her (lit from the TV, below the camera), the controller in her lap once she lets go of it
    LIGHT.dir = [.3, -.95];
    onPaper(() => person(HER_X, GB, U0, HER_P, S.o));
    if (S.padW) { boilSeed('fr-padlap'); onPaper(() => controller(S.padW[0], S.padW[1] - 6, .1, PAD_W, 'fr-padlap')); }
    if (S.slop > .05 && t < T_LAND + .5 && S.canW) { const a = t - T_LAND; piece(oval(S.canW[0] + 10 + a * 50, S.canW[1] - 36 - 260 * a + 900 * a * a, 6, 5, 0, 10), COL.foam, { sw: 1, key: 'fr-slop', flatCard: true }); }
    // him
    LIGHT.dir = [-.3, -.95];
    if (M.phase !== 'hidden') {
      // (the box under his near arm, below his armpit: drawn just before that arm, over his side)
      const L0 = limb;
      if (M.pizza) limb = function (P, w0, w1, col, o = {}) { if ((o.key || '') === 'hCfrHarm1') { const c = [P[0][0] + .25 * M.u, P[0][1] + 1.25 * M.u]; boilSeed('fr-pztuck'); pizzaTucked(c, M.u, 'fr-pzt'); } return L0.apply(this, arguments); };
      try { onPaper(() => person(M.x, M.y, M.u, HIM_P, M.o)); } finally { limb = L0; }
    }
    LIGHT.dir = [-.62, -.78];
    // the TV's light on the bean bags' fronts: a few strokes of its colour (it's where we are). (bridge.js: not on their
    // jumpers: its strokes on her red jumper read as a hole cut in it, the bean bag showing through: the user)
    for (const [x, f, k] of [[HER_X, 1, 'fr-tvbS'], [HIM_X, -1, 'fr-tvbH']]) roomShade([[-150, 40], [150, 40], [160, 100], [70, 118], [-70, 118], [-160, 96]].map(([a, b]) => [x + a * f, 900 + b]), vivid(tvCol(t)), .3, -28, [], [], k);
    const lidPop = t >= PZ.open && t < PZ.open + 1 / 12 ? 46 : 0;   // (the lid springs up past its rest for a drawing)
    setStill(() => solid(() => snacksFront(t, t >= PZ.open, lidPop)));
    if (lidPop) solid(() => { boilSeed('fr-pzpop'); for (const sd of [-1, 1]) pen([[PZ.x + sd * 96, PZ.y - 150], [PZ.x + sd * 118, PZ.y - 178]], 2, 0); });
    // the pizza box: out from under his arm as he lands, down onto the floor in its place, shut, and its lid pops open
    if (t >= PZ.out && t < PZ.open) solid(() => {
      boilSeed('fr-pzfly');
      if (t < PZ.land) {
        // (from under his arm, edge on, tipping flat as it falls)
        const H0 = him(PZ.out), a0 = shoulderQ(HIM_P, H0.Fr, 1), S0 = toW(H0.C, [a0[0] + .6, a0[1] + 1.25]), k = (t - PZ.out + 1 / 12) / (PZ.land - PZ.out + 1 / 12);
        pizzaShut(lerp(S0[0], PZ.x, k), lerp(S0[1], PZ.y, k) - 90 * 4 * k * (1 - k), lerp(.8, 1, k), lerp(-.2, 0, k), lerp(.72, 0, k), 'fr-pzs');
      } else {
        pizzaShut(PZ.x, PZ.y, 1, 0, .18, 'fr-pzs');   // (landed, squashed: behind the subtitle banner, where the den's pizza always sat)
      }
    });
    solid(() => clinkFX(t, [XC, YC]));
    // their talk: his bubble (right, the tail to him) and hers (left, the tail to her); both pop as they crack up
    const burst = 1 - easeIn(seg(t, T_POP, T_POP + .18));
    bubble(1430, 290, 140, 104, [1272, 430], backOut(seg(t, T_TALK, T_TALK + .2)) * burst, 'fr-talk', () => talk(1430, 290, t, 'fr-t', 'him'));
    bubble(455, 228, 132, 100, [640, 405], backOut(seg(t, T_REPLY, T_REPLY + .2)) * burst, 'fr-talkS', () => talk(455, 228, t, 'fr-s', 'her'));
    if (EXTRA.over) EXTRA.over(t, M, S);
  }


    function frame(t0, o = {}) {
      look('doodle');
      // (the drawing on twos, t; the camera's drift and push on ones, t0: puppets on twos, camera on ones. The cut
      // between the two set-ups stays on the drawing's step.)
      const t = mt(t0), [t0s, shot] = shotAt(t), t1s = (SHOTS.find(k => k[0] > t0s) || [LEN])[0], k = ease(seg(t0, t0s, t1s));
      if (shot === 'A') camBegin(975 + 8 * Math.sin(t0 * .5), 560 + 4 * Math.sin(t0 * .37), 1.05 + .03 * k);
      else { const c = o.cam ? o.cam(t0) : { cx: 960 + 6 * Math.sin(t0 * .5), cy: 585 + 4 * Math.sin(t0 * .37), zoom: 1.08 + .04 * k }; camBegin(c.cx, c.cy, c.zoom); }
      boilSeed('fr-paper'); linedPaper();
      if (shot === 'A') sceneA(t); else { const M = him(t), S = her(t); sceneB(t, M, S); }
      camEnd();
    }
    return { frame, EXTRA, T: { T_KNOCK, T_DOOR, T_HOP, T_LAND, TC, T_TALK, T_REPLY, T_DUCK, T_LAUGH, T_POP, T_CALM, B }, P: { HER_P, HIM_P, U0, GB, HER_X, HIM_X, SEAT_H, COL, AQUA, MAG },
      fx: { pen, line, loopPen, knock, solid, tr, star5, paperUnder }, rig: { personFrame, pcfg, toW } };
  })();

  // =====================================================================================================================
  // F2: the Friday den. In: night falls on her flat, pencilled in from the left, and under it the den (shot A: her
  // gaming, from behind); then friday.js's acting (DEN), retimed: the knock on "comes round", the door on the bar, the
  // cannonball, the world put to rights (the globe) and the clink on "rights", then nonsense on "bollocks" and the laugh.
  // =====================================================================================================================
  const F2 = { t0: BAR(133), t1: BAR(137) };
  F2.sweep = .62;
  // the night's pencil band at the sweep's front (screen space): dense dark strokes, tilted like the den's shading
  function nightBand(X) {
    look('doodle'); boilSeed('f2 band');
    push(); resetMatrix(); translate(-W / 2, -H / 2);
    for (let y = -30, i = 0; y < H + 40; y += 11, i++) {
      const x0 = X - 150 - 60 * hash(i * 1.3), x1 = X + 20 + 30 * hash(i * 2.1) + 40 * Math.sin(y * .013 + 1);
      for (let k = 0; k < 2; k++) _inkLine([[x0 + k * 20, y + 26], [(x0 + x1) / 2, y + 8 + k * 4], [x1, y - 6 + k * 3]], .9, vivid(k ? '#5E2A72' : '#3A3270'), 'cpencil', .4);
    }
    pop();
  }
  SHOT.F2 = (t, lt, dur) => {
    DEN.frame(lt);
    const sw = seg(lt, 0, F2.sweep);
    if (sw < 1) {
      const X = lerp(-180, W + 220, ease(sw)), edge = [];
      for (let y = H + 60; y >= -60; y -= 45) edge.push([X + 40 * Math.sin(y * .013 + 1) + 24 * hash(y * .7 + 3), y]);
      clipTo([[[W + 80, -60], [W + 80, H + 60]].concat(edge)], true);
      f1Frame(t);
      clipEnd();
      nightBand(X);
    }
    look('doodle');
  };

  // =====================================================================================================================
  // F3: still the den, the laugh settling. "No private island": an engraved island (the banknote look: a picture of the
  // money world, in a biro dream cloud, its frame) drifts in over them; they look up, unimpressed; the biro (hers: F4
  // shows her hand) scribbles it out and it drops. "No empire for me": an engraved tower with a crown rises in its cloud;
  // two strokes; down it goes; she shakes her head at him, smiling. "Just some of the hours your machines could set
  // free": an engraved clock swings down in its cloud; its hour marks shiver, and on "hours" they fly off the face,
  // engraved, and turn biro and coloured pencil as they cross the cloud's rim, and settle round the two of them.
  // Times are F2 time (s since bar 133), like the den's.
  // =====================================================================================================================
  const F3 = { t0: BAR(137), t1: BAR(141) };
  const r2 = x => x - F2.t0;   // song time → F2 time
  const T3 = {
    start: r2(F3.t0), islIn: r2(WT('No private island') - .05), priv: r2(WT('No private island', 1)), isl: r2(WT('No private island', 2)),
    emp: r2(WT('No private island', 3)), empW: r2(WT('No private island', 4)), forMe: r2(WT('No private island', 5)),
    just: r2(WT('Just some of the hours')), hours: r2(WT('Just some of the hours', 4)), free: r2(WT('Just some of the hours', 8)), end: r2(F3.t1),
  };
  // (one thing at a time, each given time to read: the island crossed out on "island" floats off up and away (it used
  // to fall through their faces while the empire came up and was crossed out); the empire comes up on "No empire", holds,
  // and is crossed out on "for me", as she shakes her head at him; it sinks as the clock comes down)
  T3.x1 = [T3.isl, T3.isl + .38];          // the pen crosses out the island
  T3.islGo = [T3.isl + .4, T3.isl + .9];   // and it floats off, up and away
  T3.empUp = [T3.emp, T3.empW + .1];
  T3.x2 = [T3.forMe, T3.forMe + .3];
  T3.empDrop = [T3.forMe + .34, T3.forMe + .85];
  T3.clkIn = [T3.empDrop[1] - .15, T3.just + .3];
  T3.fly = [T3.hours, T3.free + .05];
  // ---------- the engraved things (drawn in the bank look; their colour lives in the lines) ----------
  const ISL = { x: 1150, y: 196, s: 540 }, EMP = { x: 440, y: 265, h: 360 }, CLK = { x: 985, y: 214, r: 128 };   // (the empire's cloud inside the frame, clear of her bun)
  // the engraved things are printed heavier than a note (denser lines, full colour) so they hold against the doodle room
  function engraved(fn) {
    const b0 = { ...BANK }; look('bank'); Object.assign(BANK, { dens: 1.6, colour: 1, sat: 1, ow: .62 });
    try { bankFigure(fn); } finally { Object.assign(BANK, b0); }   // (the only engraving in the frame: printed as a figure; its outlines kept to an engraver's weight)
  }
  function island(t, x, y, s, rot) { engraved(() => island0(t, x, y, s, rot)); }
  function island0(t, x, y, s, rot) {
    push(); translate(x, y); rotate(rot); scale(s / 470);
    boilSeed('f3 island');
    piece(oval(0, 62, 250, 34, 0, 40), '#6FA0A8', { sw: 2.2, key: 'isea' });                                   // the sea round it
    piece(curvy([[-200, 60], [-150, 22], [-60, 4], [60, 0], [160, 16], [214, 58], [120, 76], [-120, 78]], 4), '#E8D6A0', { sw: 2.2, key: 'isand' });
    piece([[-96, 8], [70, 8], [70, -62], [-96, -62]], '#F4F2EC', { sw: 2.2, key: 'ivilla' });                 // the villa
    piece([[-118, -62], [92, -62], [92, -74], [-118, -74]], '#D8D2C6', { sw: 1.2, key: 'iroof' });
    for (let i = 0; i < 4; i++) piece([[-84 + i * 40, -48], [-60 + i * 40, -48], [-60 + i * 40, -14], [-84 + i * 40, -14]], '#4E6E7A', { sw: .9, key: 'iwin' + i });
    piece(oval(40, -80, 34, 8, 0, 20), '#C8C0B0', { sw: 1, key: 'iheli' });                                  // a helipad
    for (const [px, lean, k] of [[-160, -.25, 'a'], [140, .3, 'b']]) {                                        // palms
      const top = [px + lean * 90, -110], base = [px, 30];
      piece(ribbon([base, [lerp(base[0], top[0], .5) - lean * 10, -40], top], 12, 7), '#8A6A44', { sw: 1, key: 'itr' + k });
      for (let j = 0; j < 5; j++) { const a = -Math.PI / 2 + (j - 2) * .62 + .08 * Math.sin(t * 2 + j); piece(ribbon([top, [top[0] + Math.cos(a) * 40, top[1] + Math.sin(a) * 30 - 8], [top[0] + Math.cos(a) * 72, top[1] + Math.sin(a) * 50 + 14]], 14, 3), '#5E8A4E', { sw: .9, key: 'ifr' + k + j }); }
    }
    piece([[150, 70], [262, 70], [240, 94], [160, 94]], '#F4F2EE', { sw: 1.2, key: 'iyacht' });              // a superyacht
    piece([[170, 70], [236, 70], [226, 54], [182, 54]], '#DCD8D0', { sw: 1, key: 'iyacht2' });
    if (typeof BNO !== 'undefined') islandOrn(t);
    pop();
  }
  // The island as a note's vignette (bankorn.js), in its own coordinates: rippling sea, a colonnaded villa with a roof
  // balustrade, window pediments and glazing bars, ringed palm trunks and feathered fronds, helipad rings, the yacht's
  // portholes, rail and mast, and a scrolled ribbon under it all with a line of microprint.
  function islandOrn(t) {
    const B = BNO.batch();
    for (let r = 0; r < 4; r++) { const rx = 262 + r * 16, ry = 38 + r * 6; for (let k = 0; k < 14; k++) { const a0 = k / 14 * Math.PI + .08 + .03 * Math.sin(t * 1.3 + k + r), a1 = a0 + .16; B.line(BNO.arc(0, 64, rx, a0, a1, 5, ry), .45 - r * .06); } }   // ripples round the shore (the near half)
    for (let k = 0; k < 9; k++) { const x = -200 + k * 50, y = 86 + 4 * Math.sin(k * 1.7); B.line([[x - 12, y + 3], [x - 4, y - 2], [x + 4, y + 2], [x + 12, y - 1]], .4); }
    // the villa: pilasters, window pediments and glazing bars, a cornice with dentils, the roof balustrade, a door
    for (let i = 0; i <= 4; i++) { const x = -96 + i * 41.5; B.line([[x, 8], [x, -62]], .5); B.line([[x + 3, 6], [x + 3, -60]], .25); }
    for (let i = 0; i < 4; i++) { const x0 = -84 + i * 40; B.line([[x0 - 2, -50], [x0 + 12, -56], [x0 + 26, -50]], .45); B.line([[x0 + 12, -48], [x0 + 12, -14]], .3); B.line([[x0, -31], [x0 + 24, -31]], .3); }
    B.draw();
    BNO.dentils(-118, 92, -62, 4, { gap: 5, sw: .3 });
    BNO.balustrade(-110, 84, -92, -74, 13, { key: 'ibal', col: '#EDEAE2', psw: .6, sw: .3 });
    for (const [px, lean] of [[-160, -.25], [140, .3]]) {   // palm trunks: rings; fronds: leaflets
      const top = [px + lean * 90, -110], base = [px, 30];
      for (let k = 1; k < 9; k++) { const u = k / 9, x = lerp(base[0], top[0], u) - lean * 10 * Math.sin(u * Math.PI), y = lerp(base[1], top[1], u), w = lerp(6, 3.5, u); B.line([[x - w, y + 2], [x, y - 1], [x + w, y + 2]], .4); }
      for (let j = 0; j < 5; j++) { const a = -Math.PI / 2 + (j - 2) * .62 + .08 * Math.sin(t * 2 + j), sp = [top, [top[0] + Math.cos(a) * 40, top[1] + Math.sin(a) * 30 - 8], [top[0] + Math.cos(a) * 72, top[1] + Math.sin(a) * 50 + 14]], S = BNO.spline(sp, 4);
        for (let k = 2; k < S.length - 1; k++) { const [x, y] = S[k], q = S[k + 1], tx = q[0] - x, ty = q[1] - y, tl = Math.hypot(tx, ty) || 1, L = 9 * (1 - k / S.length) + 3; for (const sd of [-1, 1]) B.line([[x, y], [x - ty / tl * sd * L + tx / tl * L * .6, y + tx / tl * sd * L + ty / tl * L * .6]], .35); } }
    }
    for (const r of [26, 18]) B.line(BNO.ring(40, -80, r, r * .24, 30), .35);   // the helipad's rings
    for (let i = 0; i < 6; i++) B.line(BNO.ring(170 + i * 12, 80, 2.2, 2.2, 8), .35);   // portholes
    B.line([[172, 54], [236, 54]], .3); for (let i = 0; i < 9; i++) B.line([[174 + i * 7.5, 54], [174 + i * 7.5, 49]], .25); B.line([[172, 49], [236, 49]], .3);   // the deck rail
    B.line([[206, 54], [206, 26]], .5); B.line([[200, 34], [214, 34]], .35);   // its mast
    B.line([[152, 76], [258, 76]], .35); B.line([[156, 88], [244, 88]], .3);   // hull stripes
    B.draw();
    // a ribbon banner under the island: a scrolled band, microprint along it
    const RB = BNO.spline([[-170, 124], [-60, 134], [60, 134], [170, 124]], 8);
    piece(RB.map(([x, y]) => [x, y - 9]).concat(RB.slice().reverse().map(([x, y]) => [x, y + 9])), '#EEE8DA', { sw: .9, key: 'iribbon' });
    for (const s of [-1, 1]) { const e = RB[s < 0 ? 0 : RB.length - 1]; piece([[e[0], e[1] - 9], [e[0] + s * 26, e[1] - 12], [e[0] + s * 16, e[1] + 1], [e[0] + s * 26, e[1] + 14], [e[0], e[1] + 9]], '#E2DACA', { sw: .9, key: 'iribend' + s }); }
    BNO.microRule(RB, 5, { k: .85 });
  }
  function empire(t, x, y, h, rot) { engraved(() => empire0(t, x, y, h, rot)); }
  function empire0(t, x, y, h, rot) {
    const s = h / 330;
    push(); translate(x, y); rotate(rot); scale(s);
    boilSeed('f3 empire');
    piece([[-78, 160], [78, 160], [70, 138], [-70, 138]], '#B8B0A0', { sw: 1.2, key: 'eplinth' });
    piece([[-56, 138], [56, 138], [46, -70], [-46, -70]], '#DCD6CA', { sw: 2.2, key: 'etower' });
    for (let i = -2; i <= 2; i++) dline([[i * 20, 132], [i * 17, -64]], 1, BANK.ink);
    for (let j = 0; j < 6; j++) dline([[-50 + j * 1.5, 110 - j * 32], [50 - j * 1.5, 110 - j * 32]], .8, BANK.ink);
    piece(curvy([[-50, -70], [50, -70], [34, -118], [0, -138], [-34, -118]], 4), '#C9D2CE', { sw: 2.2, key: 'edome' });
    piece([[-30, -134], [-22, -170], [-10, -146], [0, -178], [10, -146], [22, -170], [30, -134]], '#D2B25A', { sw: 2.2, key: 'ecrown' });   // the crown
    for (const cx of [-22, 0, 22]) piece(oval(cx, -164 - (cx ? 0 : 8), 5, 5, 0, 10), '#B03A40', { sw: .8, key: 'ejewel' + cx });
    piece(oval(0, 40, 26, 26, 0, 28), '#E8E2D4', { sw: 1, key: 'emed' }); guilloche(0, 40, 6, 22, { n: 8, lobes: 7, w: .4, steps: 160 });
    dline([[0, -178], [0, -226]], 1.2, BANK.ink); piece([[0, -226], [44, -216], [0, -204]], '#8A3A44', { sw: 1, key: 'eflag' });   // a flag, no device
    if (typeof BNO !== 'undefined') {   // (engraved: a portico at the foot, arched windows up the shaft, a balustrade and ribs on the dome)
      const B = BNO.batch();
      for (let i = 0; i < 5; i++) { const x = -40 + i * 20; B.line([[x, 136], [x, 96]], .5); B.line([[x + 2, 134], [x + 2, 98]], .25); }
      B.line([[-48, 96], [0, 80], [48, 96], [-48, 96]], .5);
      for (let j = 0; j < 3; j++) for (const x of [-26, 0, 26]) { const y = 62 - j * 40; B.line([[x - 6, y], [x - 6, y - 16], ...BNO.arc(x, y - 16, 6, Math.PI, TAU, 6).slice(1), [x + 6, y]], .4); }
      for (const k of [-2, -1, 0, 1, 2]) B.line(BNO.arc(k * 8, -70, 50 - Math.abs(k) * 6, Math.PI + .3, TAU - .3, 10, 64).map(([x, y]) => [x * (1 - Math.abs(k) * .15), y]), .3);
      B.draw();
      BNO.balustrade(-46, 46, -84, -70, 8, { key: 'ebal', col: '#E4DED2', psw: .5, sw: .25 });
    }
    pop();
  }
  // the machines' clock: a guilloche rim, the face, hour marks (those still on it), hands whirring; on a chain from above
  function bankClock(t, x, y, r, marks, spin) { engraved(() => bankClock0(t, x, y, r, marks, spin)); }
  function bankClock0(t, x, y, r, marks, spin) {
    boilSeed('f3 clock');
    dline([[x, y - r - 400], [x, y - r - 6]], 2.2, BANK.ink);
    for (let i = 0; i < 9; i++) piece(oval(x, y - r - 30 - i * 40, 6, 13, 0, 12), '#B8A870', { sw: .8, key: 'chain' + i, flatCard: true });
    piece(oval(x, y, r + 16, r + 16, 0, 56), '#C9B87A', { sw: 2.4, key: 'crim' });
    guilloche(x, y, r + 1, r + 15, { n: 7, lobes: 40, w: .45, steps: 360 });
    piece(oval(x, y, r, r, 0, 56), '#F2EEE4', { sw: 2.2, key: 'cface' });
    guilloche(x, y, 10, r * .42, { n: 12, lobes: 9, w: .4, twist: .3, beat: 3, steps: 240 });
    if (typeof BNO !== 'undefined') {   // (engraved: sixty minute ticks, a chapter ring of microprint inside them)
      const B = BNO.batch();
      for (let k = 0; k < 60; k++) { if (k % 5 === 0) continue; const a = k / 60 * TAU; B.line([[x + Math.cos(a) * r * .9, y + Math.sin(a) * r * .9], [x + Math.cos(a) * r * .96, y + Math.sin(a) * r * .96]], .4); }
      B.line(BNO.ring(x, y, r * .88, r * .88, 60), .35); B.line(BNO.ring(x, y, r * .62, r * .62, 60), .35);
      B.draw();
      BNO.microRule(BNO.ring(x, y, r * .66, r * .66, 90), 3.5, { k: .7 });
    }
    for (let i = 0; i < 12; i++) if (marks[i]) { const a = i / 12 * TAU - Math.PI / 2, m = marks[i], p = [x + Math.cos(a) * r * .8 + m.dx, y + Math.sin(a) * r * .8 + m.dy];
      push(); translate(...p); rotate(a + m.rot); piece([[-14, -5], [14, -5], [14, 5], [-14, 5]], '#1F4E55', { sw: .8, key: 'cm' + i, flatCard: true }); pop(); }
    const hA = spin * .08 - 1.2, mA = spin - .3;
    for (const [a, L, w] of [[hA, r * .5, 9], [mA, r * .72, 6]]) piece(ribbon([[x - Math.cos(a) * 12, y - Math.sin(a) * 12], [x + Math.cos(a) * L, y + Math.sin(a) * L]], w, 2), '#1F2E34', { sw: .8, key: 'chand' + L });
    piece(oval(x, y, 9, 9, 0, 14), '#C9B87A', { sw: .8, key: 'cpin' });
  }
  // a bird (biro and coloured pencil), facing dir (1 right, -1 left); flap 0..1 wing phase; perched: wings folded
  const BIRD_COLS = ['#FFC928', '#FF6FA8', '#3FB8C0', '#7CE07C', '#FF8A5C', '#9A8BFF', '#F2C230', '#E8488A', '#2EC4C4', '#6BC46A', '#FFB45E', '#B06FE0'];
  function bird(x, y, s, dir, flap, perched, col, key, lk = 'doodle') {   // (lk: 'bank' for the engraved one, inside the clock's cloud)
    look(lk);
    push(); translate(x, y); scale(dir * s / 30, s / 30);
    if (!perched) { const up = Math.sin(flap * TAU); for (const [dy, k] of [[-1, 'a'], [1, 'b']]) piece([[-4, -2], [10, -2], [4 + 6 * up * (k === 'a' ? 1 : .6), -26 * up * (k === 'a' ? 1 : .7) - 4]], col, { sw: 1.2, key: key + 'w' + k }); }
    piece(curvy([[-18, 2], [-6, -8], [10, -7], [16, 2], [6, 10], [-10, 9]], 3), col, { sw: 1.4, key: key + 'b' });
    piece([[-18, 0], [-28, -6], [-26, 6]], col, { sw: 1.1, key: key + 't' });
    piece(oval(14, -8, 8, 7.5, 0, 14), col, { sw: 1.2, key: key + 'h' });
    piece([[21, -9], [29, -6], [21, -4]], '#FF8A3A', { sw: .9, key: key + 'k', flatCard: true });
    piece(oval(16, -10, 1.6, 1.6, 0, 8), '#1A1622', { ink: null, key: key + 'e', flatCard: true });
    if (perched) { piece(curvy([[-8, -2], [6, -4], [8, 4], [-6, 5]], 2), mixCol(col, '#000000', .12), { sw: 1, key: key + 'f' }); dline([[-2, 10], [-3, 16]], 1.1, BIRO); dline([[4, 10], [4, 16]], 1.1, BIRO); }
    pop();
  }
  // where each hour lands: the two of them (computed from their rigs), the room
  function landSpots(M, S) {
    const { toW } = DEN.rig, hTop = Rg => toW(Rg.C, [Rg.Fr.hx, Rg.Fr.top - .3]);
    const herTop = toW(S.C, [S.Fr.hx - .1, S.Fr.hy - 6.2]), himTop = hTop(M), herL = S.o.pose.L, finger = toW(S.C, [herL[0] + Math.cos(herL[5] || 0) * 1.5, herL[1] + Math.sin(herL[5] || 0) * 1.5]);
    return [herTop, himTop, finger, [1000, 822], [980, 188], [320, 370], [1116, 188], [1340, 876], [128, 440], [870, 970], [540, 940], [1260, 986]];   // (one on her bean bag's far corner, clear of her raised arm)
  }
  // the pen's strokes: over the island (in its own coords, s = 470), over the empire (s = 330 tall)
  const XI = [[[-190, -120], [200, 90]], [[190, -120], [-200, 94]], [[-170, 20], [-110, -40], [-40, 30], [30, -40], [100, 26], [170, -30]]];
  const XE = [[[-70, -150], [60, 150]], [[70, -150], [-70, 150]]];
  function strokes(S, k, sw = 3.2) {   // draw the first k (0..len) of the strokes, biro
    look('doodle');
    let left = k;
    for (const P of S) { if (left <= 0) break; const L = polyLen(P), Q = polyUpTo(P, Math.min(L, left)); if (Q.length > 1) { edgeLine(Q, sw, BIRO, false, 0); edgeLine(Q.map(([x, y]) => [x + 1.5, y - 1]), sw * .6, BIRO, false, 0); } left -= L; }
  }
  const strokesLen = S => S.reduce((a, P) => a + polyLen(P), 0);
  // where the pen's tip is along a set of strokes at progress k (0..1)
  function strokeTip(S, k) { let left = k * strokesLen(S); for (const P of S) { const L = polyLen(P); if (left <= L) { const Q = polyUpTo(P, left); return Q[Q.length - 1]; } left -= L; } const P = S[S.length - 1]; return P[P.length - 1]; }
  // the island's and the empire's positions at t (F2 time)
  function islandAt(t) {
    const kin = easeOut(seg(t, T3.islIn, T3.isl)), kg = easeIn(seg(t, ...T3.islGo));
    return { x: lerp(2350, ISL.x, kin) + 520 * kg, y: ISL.y + 8 * Math.sin(t * 2.2) - 760 * kg, rot: .03 * Math.sin(t * 1.7) + .3 * kg, on: t > T3.islIn && kg < 1 };
  }
  function empireAt(t) {
    const ku = easeOut(seg(t, ...T3.empUp)), kd = seg(t, ...T3.empDrop);
    return { x: EMP.x - 40 * easeIn(kd), y: lerp(1500, EMP.y, ku) + 900 * easeIn(kd), rot: -.03 + .02 * Math.sin(t * 1.9) - .6 * easeIn(kd), on: t > T3.empUp[0] && kd < 1 };
  }
  function clockAt(t) {
    const ki = seg(t, ...T3.clkIn), up = easeIn(seg(t, T3.free - .25, T3.free + .5));
    return { y: lerp(-420, CLK.y, backOut(ki)) - 800 * up + 10 * Math.sin(t * 2.4) * (1 - up), on: ki > 0 && up < 1, spin: t * 1.4 + 9 * easeIn(seg(t, T3.just, T3.hours)) };
  }
  // Each engraved thing is a picture of the money world in a dream cloud drawn in biro: the cloud is the frame that lets
  // it be engraved in the doodled den (styleaudit 2026-09-25: a picture keeps its own medium inside its frame; they used
  // to float loose in the room). The cloud's outline, world px: rx × ry round (cx, cy) in the thing's own frame (x, y, rot)
  function dreamCloud(x, y, rot, cx, cy, rx, ry, key) {
    const P = [], n = 84, puffs = Math.max(8, Math.round((rx + ry) / 40)), ph = keyHash(key) % 7;
    for (let i = 0; i < n; i++) { const a = i / n * TAU, b = Math.abs(Math.sin(a * puffs / 2 + ph)); P.push([cx + Math.cos(a) * rx * (.9 + .13 * b), cy + Math.sin(a) * ry * (.9 + .13 * b)]); }
    return DEN.fx.tr(P, x, y, 1, rot);
  }
  // the picture in its cloud: the page knocked back to paper inside it, the picture clipped to it, the biro rim over it
  function inCloud(P, key, fn) {
    const { knock, loopPen } = DEN.fx;
    look('doodle'); boilSeed(key); knock([P]);
    clipPoly(P, fn);
    look('doodle'); boilSeed(key + ' rim'); loopPen(P, 2.2);
  }
  const CLOUD_OUT = P => [[[-3000, -3000], [5000, -3000], [5000, 5000], [-3000, 5000]], P];   // (a clip to everything outside P)
  // F3's layer over the den (EXTRA.over), inside shot B's camera
  function f3Over(t, M, S) {
    if (t < T3.islIn) return;
    const I = islandAt(t), E = empireAt(t), C = clockAt(t);
    if (E.on) { inCloud(dreamCloud(E.x, E.y, E.rot, 0, -38, 160, 245, 'f3 cloud emp'), 'f3 cloud emp', () => empire(t, E.x, E.y, EMP.h, E.rot)); push(); translate(E.x, E.y); rotate(E.rot); strokes(XE, strokesLen(XE) * seg(t, ...T3.x2)); pop(); }
    if (I.on) {
      inCloud(dreamCloud(I.x, I.y, I.rot, 0, 4, 420, 226, 'f3 cloud isl'), 'f3 cloud isl', () => island(t, I.x, I.y, ISL.s, I.rot));
      push(); translate(I.x, I.y); rotate(I.rot); strokes(XI, strokesLen(XI) * seg(t, ...T3.x1)); pop();
      if (t < T3.isl) { look('doodle'); boilSeed('f3 glint'); const g = .5 + .5 * Math.sin(t * 9); piece(starPts(I.x - 30, I.y - 90, 16 + 8 * g, .3, 4), '#FFF6D0', { sw: 1.2, key: 'f3glint' }); }
    }
    // the clock and its hours
    const spots = landSpots(M, S);
    const fly = seg(t, ...T3.fly), shiver = seg(t, T3.just, T3.hours);
    const CP = C.on ? dreamCloud(CLK.x, C.y, 0, 0, -18, 204, 214, 'f3 cloud clk') : null;   // (the chain hangs inside the cloud)
    if (C.on) {
      const marks = [];
      for (let i = 0; i < 12; i++) marks.push(fly > i / 40 ? null : { dx: 3 * shiver * Math.sin(t * 40 + i * 2), dy: 3 * shiver * Math.cos(t * 37 + i * 3), rot: .3 * shiver * Math.sin(t * 30 + i) });
      inCloud(CP, 'f3 cloud clk', () => bankClock(t, CLK.x, C.y, CLK.r, marks, C.spin));
    }
    // (each hour leaves the face engraved and turns biro and coloured pencil as it crosses the cloud's rim: the rim is the
    // change, as the bezel is for Z3's bots)
    const birdAt = (P, draw) => { if (!P) { draw('doodle'); return; } clipPoly(CLOUD_OUT(P), () => draw('doodle')); clipPoly(P, () => engraved(() => draw('bank'))); };
    for (let i = 0; i < 12; i++) {
      const k = seg(t, T3.fly[0] + i * .03, T3.fly[1] - .1 + i * .02); if (k <= 0) continue;
      const a = i / 12 * TAU - Math.PI / 2, st = [CLK.x + Math.cos(a) * CLK.r * .8, clockAt(T3.fly[0]).y + Math.sin(a) * CLK.r * .8], en = spots[i];
      const c1 = [st[0] + Math.cos(a) * 320, st[1] + Math.sin(a) * 220 - 120], c2 = [en[0] + (hash(i * 3.1) - .5) * 300, en[1] - 260];
      const u = ease(k), p = [0, 1].map(d => Math.pow(1 - u, 3) * st[d] + 3 * Math.pow(1 - u, 2) * u * c1[d] + 3 * (1 - u) * u * u * c2[d] + u * u * u * en[d]);
      const perched = k >= 1, dir = en[0] > st[0] ? 1 : -1, sz = lerp(22, 44, Math.min(1, k * 3));
      birdAt(!perched && CP && Math.hypot(p[0] - CLK.x, p[1] - C.y) < 280 ? CP : null, lk => { boilSeed('f3bird' + i); bird(p[0], p[1] - (perched ? 22 : 0), sz, perched ? (i % 2 ? 1 : -1) : dir, t * 5 + i * .3, perched, BIRD_COLS[i], 'f3b' + i, lk); });
    }
    // the pen: in for the island, hovering, the empire, and off
    const P1 = seg(t, ...T3.x1), P2 = seg(t, ...T3.x2);
    if (t > T3.x1[0] - .35 && t < T3.x2[1] + .5) {
      let tip, lift = 0;
      if (t < T3.x1[0]) tip = [lerp(1900, I.x + XI[0][0][0], ease(seg(t, T3.x1[0] - .35, T3.x1[0]))), lerp(700, I.y + XI[0][0][1], ease(seg(t, T3.x1[0] - .35, T3.x1[0])))];
      else if (t < T3.x1[1]) { const q = strokeTip(XI, P1); tip = [I.x + q[0], I.y + q[1]]; }
      else if (t < T3.x2[0]) { const k = ease(seg(t, T3.x1[1], T3.x2[0])), q0 = [ISL.x + XI[2][5][0], ISL.y + XI[2][5][1]], q1 = [E.x + XE[0][0][0], E.y + XE[0][0][1]]; tip = [lerp(q0[0], q1[0], k), lerp(q0[1], q1[1], k) - 80 * Math.sin(Math.PI * k)]; lift = Math.sin(Math.PI * k); }
      else if (t < T3.x2[1]) { const q = strokeTip(XE, P2); tip = [E.x + q[0], E.y + q[1]]; }
      else { const k = easeIn(seg(t, T3.x2[1], T3.x2[1] + .5)), q0 = [EMP.x + XE[1][1][0], EMP.y + XE[1][1][1]]; tip = [lerp(q0[0], 2000, k), lerp(q0[1], 1300, k)]; lift = k; }
      look('card'); boilSeed('f3pen'); biro(tip[0], tip[1], -1.0 + .15 * Math.sin(t * 8) - .2 * lift, 250, 'f3pen');
    }
    look('doodle');
  }
  DEN.EXTRA.over = f3Over;
  // their F3 acting: the laugh settles, they look up at each thing, share a look on "for me", then the birds
  DEN.EXTRA.her = [[7.62, 'happy', { lookX: 1, mouth: 'smile' }], [T3.priv, 'surprised', { lookX: .8, lookY: -1, mouth: 'flat' }], [T3.priv + .4, 'bored', { lookX: .7, lookY: -1, mouth: 'flat' }],
    [T3.isl + .25, 'smug', { lookX: .6, lookY: -1 }], [T3.emp + .1, 'bored', { lookX: -.4, lookY: -1, mouth: 'flat' }], [T3.forMe - .05, 'happy', { lookX: 1, lookY: 0, mouth: 'smile' }],
    [T3.clkIn[0] + .1, 'surprised', { lookX: .5, lookY: -1, mouth: 'flat' }], [T3.hours + .1, 'excited', { lookX: .5, lookY: -1, mouth: 'smile' }], [T3.free - .3, 'laugh', { blush: 1 }]];
  // (their reactions keep their mouths shut: an open mouth reads as speaking, and nobody talks in the doodle)
  DEN.EXTRA.him = [[7.7, 'happy', { lookX: 1, mouth: 'smile' }], [T3.priv + .12, 'surprised', { lookX: .4, lookY: -1, mouth: 'flat' }], [T3.priv + .5, 'neutral', { lookX: .3, lookY: -1, mouth: 'flat' }],
    [T3.isl + .35, 'happy', { lookX: .3, lookY: -1, mouth: 'smile' }], [T3.emp + .2, 'neutral', { lookX: .9, lookY: -1, mouth: 'flat' }], [T3.forMe + .05, 'happy', { lookX: 1, lookY: 0, mouth: 'smile' }],
    [T3.clkIn[0] + .2, 'surprised', { lookX: .2, lookY: -1, mouth: 'flat' }], [T3.hours + .2, 'excited', { lookX: .3, lookY: -1, mouth: 'smile' }], [T3.free - .2, 'happy', { lookX: 1 }]];
  DEN.EXTRA.herO = (t, o) => ({ tilt: (o.tilt || 0) + (t > T3.forMe && t < T3.forMe + .55 ? .09 * Math.sin((t - T3.forMe) * TAU * 3) * (1 - seg(t, T3.forMe, T3.forMe + .55)) : 0) });
  // her near hand: the controller in her lap, to her belly for the laugh (low on it, the elbow at her side: held up under
  // her chest the arm folded into a V, the elbow jammed down by her hip), down to her knee as it settles, then up, a
  // finger out, for a bird
  // (the bird: her near hand goes up on her own side, the upper arm out and down from her shoulder, the forearm upright,
  // a finger up; it used to go up across her chest, the upper arm lost against her jumper, so the forearm seemed to grow
  // out of her chest, tangled with the can arm)
  DEN.EXTRA.herL = (t, h) => h.specTrack(t, [[0, h.holdAt(DEN.P.HER_P, h.lap, .15, 'hold', .3)], [DEN.T.T_LAUGH + .05, [h.sL[0] + 2.3, h.Fr.ys + 3.1, .3, 'relax', 1, .3, 'u']],
    [DEN.T.T_CALM + .45, [h.sL[0] + 3.3, h.Fr.yh - .7, .25, 'relax', 1, .5, 'u']],
    [T3.hours + .18, [h.sL[0] - 1.1, h.Fr.ys + 4.6, .1, 'relax', 1, 1.5, 'u']], [T3.hours + .4, [h.sL[0] - 2.2, h.sL[1] - 2.0, .2, 'point', 1, -1.75, 'u']]], .3);   // (off her knee to her side first, then up: no jump across her)
  // her can: a dry sip as the island floats off and the empire comes up (bored with both); settled back in her lap as
  // the clock comes down
  // (the way down: the can comes down in front of her chest, across her body (so the elbow hangs down by her side; held
  // close under her shoulder it jutted out flat), then on down to her knee: five drawings, not two. The way up goes by
  // her chest too: straight from her knee to her mouth, the can passed close under her shoulder and the arm folded
  // double with the elbow flared out flat at shoulder height (247.29, the elbow audit))
  DEN.EXTRA.herCan = (knee, Fr, grip) => { const sip = { p: [Fr.hx + 1.2, Fr.hy + 1.0], a: -2.1, tilt: .5, ease }, lap = grip(DEN.P.HER_P, Fr, 1, 66, .68, -.65);
    const chest = { p: [Fr.hx + .4, Fr.ys + 1.4], a: -1.7, tilt: .3, ease };
    return [[T3.isl + .2, knee], [T3.isl + .31, chest], [T3.isl + .42, sip], [T3.isl + .62, sip], [T3.isl + .8, chest], [T3.isl + 1.08, knee], [T3.clkIn[0] + .05, knee], [T3.clkIn[0] + .3, lap]]; };
  // his: raised to her when she shakes her head at him on "for me" (a look between them, and a toast to it)
  DEN.EXTRA.himCan = (knee, Fr, grip) => { const up = grip(DEN.P.HIM_P, Fr, 1, -30, .66, -1.3, { tilt: -.06, ease: backOut });
    return [[T3.forMe + .1, knee], [T3.forMe + .32, up], [T3.forMe + .75, up], [T3.forMe + 1.05, knee]]; };
  // the camera: shot B's, then it pans up to make room over their heads, and settles back as the birds come down
  function f3Cam(t) {
    const d = { cx: 960 + 6 * Math.sin(t * .5), cy: 585 + 4 * Math.sin(t * .37), zoom: 1.08 + .04 * ease(seg(t, DEN.T.T_DOOR, 8)) };
    const k = kf(t, [[T3.start, [0, 470, 1.04]], [T3.priv + .1, [1, 470, 1.04]], [T3.hours, [1, 464, 1.04]], [T3.end, [1, 520, 1.1]]], ease);
    return { cx: lerp(d.cx, 988, k[0]), cy: lerp(d.cy, k[1], k[0]), zoom: lerp(d.zoom, k[2], k[0]) };
  }
  SHOT.F3 = (t, lt, dur) => { DEN.frame(r2(t), { cam: f3Cam }); look('doodle'); };

  // =====================================================================================================================
  // F4: pull back out of the page. The den is the right-hand page of her notebook (a spiral pad folded back), on her lap,
  // on the stopped night train (card), her biro in her hand; outside the window, a gleaming engraved city behind a shut
  // gate and a red signal. "I'm not pissed off that the future arrived": she looks up and out at it. "I'm pissed off I'm
  // still fucking waiting outside": her face sets, and on "fucking" she slams the notebook shut.
  // The carriage is the chorus's (window.CHORUS, from chorus.js, when it's loaded); on a page without it, a stand-in.
  // =====================================================================================================================
  const F4 = {
    t0: BAR(141), t1: BAR(146),
    l1: WT("I'm not pissed off"), fut: WT("I'm not pissed off", 6), arr: WT("I'm not pissed off", 7), l1e: LY("I'm not pissed off").end,
    l2: WT("I'm pissed off I'm"), still: WT("I'm pissed off I'm", 4), fk: WT("I'm pissed off I'm", 5), wait: WT("I'm pissed off I'm", 6),
  };
  F4.back = [F4.t0, F4.t0 + 1.45];    // the page settles into her hands
  F4.slam = [F4.fk - .1, F4.fk + .06];
  // the carriage: the chorus's cutaway (bays 660 wide at x = 960 + i·660, 16:9 windows 540 × 304 from y 280, seats facing
  // over tables, floor y 932). Stand-in constants and colours match it.
  const TR = { FY: 932, SY: 790, TY: 690, WT: 280, WW: 540, WH: 303.75, BW: 660, u: 30 };
  const TRC = { wall: '#39333F', wallDk: '#26222B', trim: '#6A6470', sill: '#57515E', floor: '#2A2630', ceil: '#211E26', strip: '#EDEBDC', table: '#B98C5C', tableLt: '#D2A676', tableDk: '#4A4650', night: '#121726' };   // (the table: O1's woodgrain laminate, the ending's train)
  const trWin = i => ({ x: 960 + i * TR.BW - TR.WW / 2, y: TR.WT, w: TR.WW, h: TR.WH });
  const SEAT_H = (TR.FY - TR.SY) / TR.u;   // her seatH (4.73)
  function standInBack(t, view) {
    boilSeed('f4 night'); piece(R4(-400, -200, W + 400, H + 200), TRC.night, { ink: null, key: 'f4night', lift: 0, flatCard: true, edge: false });
    for (let i = -1; i <= 1; i++) { const w = trWin(i); view(t, i, w); }
    boilSeed('f4 wall');
    const X0 = -400, X1 = W + 400;
    piece(R4(X0, 60, X1, TR.WT), TRC.wall, { ink: null, key: 'f4walltop', lift: 0, edge: false });
    piece(R4(X0, TR.WT + TR.WH, X1, TR.FY), TRC.wall, { ink: null, key: 'f4wallbot', lift: 0, edge: false });
    for (let i = -2; i <= 2; i++) { const x = 960 + (i - .5) * TR.BW; piece(R4(x - (TR.BW - TR.WW) / 2 - 2, TR.WT - 2, x + (TR.BW - TR.WW) / 2 + 2, TR.WT + TR.WH + 2), TRC.wall, { ink: null, key: 'f4pil' + i, lift: 0, edge: false }); }
    for (let i = -1; i <= 1; i++) { const w = trWin(i), G = curvy(rrPts(w.x, w.y, w.w, w.h, 40), 3); dline(G.concat([G[0]]), 1.4, mixCol(TRC.wall, '#FFF7EA', .4), 0); const F = curvy(rrPts(w.x - 20, w.y - 20, w.w + 40, w.h + 40, 56), 3); dline(F.concat([F[0]]), 3.4, TRC.trim, 0); piece(R4(w.x - 30, w.y + w.h + 16, w.x + w.w + 30, w.y + w.h + 30), TRC.sill, { sw: 1.2, key: 'f4sill' + i, lift: 3 }); }
    piece(R4(X0, -200, X1, 64), TRC.ceil, { ink: null, key: 'f4ceil', lift: 0, edge: false }); piece(R4(X0, 52, X1, 64), TRC.strip, { ink: null, key: 'f4strip', lift: 0, flatCard: true, edge: false });
    piece(R4(X0, TR.FY, X1, TR.FY + 400), TRC.floor, { ink: null, key: 'f4floor', lift: 0, edge: false });
    for (const [i, sd] of [[0, -1], [0, 1], [-1, 1], [1, -1]]) { const bx = 960 + i * TR.BW + sd * 312, f = sd;
      piece(curvy([[bx - 34 * f, TR.SY + 60], [bx - 34 * f, 440], [bx - 18 * f, 406], [bx + 20 * f, 402], [bx + 34 * f, 440], [bx + 38 * f, TR.SY + 60]], 3), CAR.moq, { sw: 2, shade: CAR.moqDk, depth: 18, key: 'f4seat' + i + sd, lift: 5 });
      piece(R4(bx - 44, TR.SY + 50, bx + 44, TR.FY), TRC.wallDk, { sw: 1.4, key: 'f4base' + i + sd, lift: 3 }); }
    for (const i of [-1, 0, 1]) { const x = 960 + i * TR.BW; piece(R4(x - 14, TR.TY + 20, x + 14, TR.FY), TRC.tableDk, { sw: 1.4, key: 'f4tl' + i, lift: 3 }); piece(b2RoundPoly(R4(x - 120, TR.TY, x + 120, TR.TY + 22), 9), TRC.table, { sw: 1.8, key: 'f4tt' + i, lift: 5 }); }
  }
  function standInFront(t) {
    for (const [i, sd] of [[0, -1], [0, 1], [-1, 1], [1, -1]]) { const bx = 960 + i * TR.BW + sd * 312, f = sd; boilSeed('f4cush' + i + sd);
      piece(curvy([[bx + 20 * f, TR.SY - 8], [bx + 214 * f, TR.SY - 4], [bx + 228 * f, TR.SY + 30], [bx + 210 * f, TR.SY + 56], [bx + 20 * f, TR.SY + 56]], 3), CAR.moq, { sw: 1.8, shade: CAR.moqDk, depth: 12, key: 'f4c' + i + sd, lift: 4 }); }
  }
  const trainBack = (t, lt, view) => window.CHORUS && CHORUS.carriageBack ? CHORUS.carriageBack(t, lt, { i0: -1, i1: 1, still: true, view, wood: true }) : standInBack(t, view);   // (wood: the ending's train, its tables O1's woodgrain laminate; the chorus's carriages keep theirs)
  const trainFront = (t, lt) => window.CHORUS && CHORUS.carriageFront ? CHORUS.carriageFront(t, lt, { i0: -1, i1: 1 }) : standInFront(t);
  // ---------- outside: the city she can't get into (banknote engraving, bright against the night), a shut gate ----------
  // The city's gold (the user, 4:10: "can we make the sparkles of the 'future' in the bank note style more visible? Maybe
  // they shine glowing gold or yellow... It almost looks like the bank note pearly gates at the moment but without any
  // of the angelic aura"): its sunburst, rays and glints printed in a note's gold ink (the colour in the lines, as the
  // note border's gold guilloche: bankorn noteFrame), the glints twinkling on the beat; and its light spilling into the
  // dark carriage (f4Aura, f4Rim). The engraving stays engraving: no glow inside the picture.
  const F4_GOLD = '#B38A26';
  // a four-point glint in gold ink, L its reach: the long spikes up-down and across, two short on the diagonals, each
  // tapered (three strokes laid over one another, shorter and heavier toward the middle), a heavier core
  function f4Glint(x, y, L, col) {
    for (const [a, l] of [[0, 1], [Math.PI / 2, 1.15], [Math.PI / 4, .42], [-Math.PI / 4, .42]])
      for (const [k, sw] of [[1, .8], [.62, 1.7], [.3, 3]]) { const d = L * l * k, c = Math.cos(a) * d, s = Math.sin(a) * d; _inkLine([[x - c, y - s], [x + c, y + s]], sw, col, 'rotring', 0); }
  }
  function city(t, r, gleam) {
    const b0 = { ...BANK }; look('bank'); Object.assign(BANK, { colour: 1, sat: .9, dens: 1.2 });
    try {
      const { x, y, w, h } = r, cx = x + w / 2, by = y + h * .78;
      boilSeed('f4 city');
      bankPaper(x - 40, y - 40, w + 80, h + 80, { paper: '#EEF2EE', tint: '#DCE6E0' });
      // a guilloche sunburst behind the skyline, turning slowly, in gold ink; rays that brighten on "arrived"
      guilloche(cx + 20, by - 40, 60, 250, { n: 16, lobes: 20, w: .45, rot: t * .05, twist: .3, beat: 3, steps: 320, col: F4_GOLD });
      for (let i = 0; i < 16; i++) { const a = Math.PI + (i + .5) / 16 * Math.PI, L0 = 90, L1 = 230 + 40 * gleam; _inkLine([[cx + 20 + Math.cos(a) * L0, by - 40 + Math.sin(a) * L0], [cx + 20 + Math.cos(a) * L1, by - 40 + Math.sin(a) * L1]], 1.3 + 1.3 * gleam, F4_GOLD, 'rotring', 0); }
      // the skyline: glass towers, a dome, a needle spire (the future, arrived)
      const T = [[-230, 90, 58], [-170, 150, 50], [-110, 110, 44], [-60, 196, 40], [20, 240, 34], [70, 170, 52], [130, 130, 46], [190, 180, 40], [240, 100, 52]];
      T.forEach(([dx, hh, ww], i) => { const x0 = cx + dx - ww / 2; piece(R4(x0, by - hh, x0 + ww, by), ['#9FC4CC', '#B8D0D4', '#8FB4C0', '#C8DCDC'][i % 4], { sw: 1.3, key: 'f4tw' + i });
        for (let j = 1; j < 4; j++) dline([[x0 + ww * j / 4, by - hh + 8], [x0 + ww * j / 4, by - 4]], .7, BANK.ink);
        if (i === 4) { piece([[x0 + ww / 2 - 6, by - hh], [x0 + ww / 2, by - hh - 70], [x0 + ww / 2 + 6, by - hh]], '#D8E4E4', { sw: 1.1, key: 'f4spire' }); } });
      piece(curvy([[cx - 30, by - 150], [cx - 40, by - 190], [cx, by - 226], [cx + 40, by - 190], [cx + 30, by - 150]], 4), '#D6CFA8', { sw: 1.3, key: 'f4dome' });
      // glints on the glass, the spire's tip and the dome, twinkling on the beat: on each beat two of them (in turn across
      // the city) flash, and fade through it; bigger from "arrived"
      // (on the towers she doesn't hide: the two of a beat far apart)
      const GL = [[-58, 176], [20, 312], [74, 150], [236, 80], [-10, 206], [134, 110], [190, 160], [-106, 96]], bp = bpOf(t), bn = Math.floor(bp), age = (bp - bn) * BEAT;
      GL.forEach(([dx, dy], i) => { if (((bn - i) % 4 + 4) % 4) return; const f = Math.exp(-age * 4.2);
        f4Glint(cx + dx, by - dy, (15 + 9 * gleam) * f + 5, F4_GOLD); });
      // the wall round it and the gate across the line: iron railings, a locked rosette
      piece(R4(x - 40, by - 10, x + w + 40, by + 40), '#B8B0A0', { sw: 1.3, key: 'f4wall' });
      for (let gx = x - 30; gx < x + w + 40; gx += 14) { dline([[gx, by - 60], [gx, by + 36]], 1.3, BANK.ink); dline([[gx - 4, by - 56], [gx, by - 66], [gx + 4, by - 56]], 1, BANK.ink); }
      dline([[x - 40, by - 44], [x + w + 40, by - 44]], 1.4, BANK.ink); dline([[x - 40, by + 20], [x + w + 40, by + 20]], 1.4, BANK.ink);
      piece(oval(cx + 20, by - 12, 30, 30, 0, 28), '#D2B25A', { sw: 1.3, key: 'f4lock' }); guilloche(cx + 20, by - 12, 6, 26, { n: 8, lobes: 11, w: .4, steps: 160 });
      // the line, running to the gate
      piece([[x - 40, y + h + 40], [x + w + 40, y + h + 40], [cx + 60, by + 40], [cx - 20, by + 40]], '#8A8474', { sw: 1.1, key: 'f4bed' });
      for (let i = 0; i < 6; i++) { const k = i / 6, yy = lerp(by + 44, y + h + 40, k * k); dline([[lerp(cx - 18, x - 60, k), yy], [lerp(cx + 58, x + w + 60, k), yy]], .8 + k, BANK.ink); }
      dline([[cx - 5, by + 40], [x + 60, y + h + 40]], 1.6, BANK.ink); dline([[cx + 45, by + 40], [x + w - 40, y + h + 40]], 1.6, BANK.ink);
      // the red signal, close to the window, holding the train: engraved with the view it stands in (this window's view is
      // one banknote picture, its own paper edge to edge; the signal used to be card, standing on that paper: styleaudit
      // 2026-09-25), printed as a figure so it holds in front of the city; its lamp still lit
      const sx = x + w * .86, sy = y + h * .28;
      bankFigure(() => {
        boilSeed('f4 signal');
        piece(R4(sx - 5, sy, sx + 5, y + h + 40), '#2A2630', { sw: 1.2, key: 'f4sigpost' });
        piece(curvy(R4(sx - 22, sy - 64, sx + 22, sy + 10), 2), '#1E1A22', { sw: 1.4, key: 'f4sighead' });
        piece(oval(sx, sy - 40, 13, 13, 0, 18), '#FF3A3A', { sw: 1, key: 'f4red' });
        piece(oval(sx, sy - 12, 11, 11, 0, 18), '#2E3A2E', { sw: 1, key: 'f4green' });
      });
      // the lit lamp: a spot of red ink (a note's colour is its ink, like the bill's red stamp), a hot core, its glow
      _paint(oval(sx, sy - 40, 12, 12, 0, 20), { wash: '#E3302C', ink: null }); _paint(oval(sx - 3, sy - 43, 4.5, 4.5, 0, 12), { wash: '#FFC2B0', ink: null });
      glow(sx, sy - 40, 70, '#FF4A3A', .9);
    } finally { Object.assign(BANK, b0); }
    look('card');
  }
  // the view from each window: bay 0 the city; the others the dark (it's stopped: nothing slides)
  function f4View(gleamAt) { return (t, bay, r) => { if (bay === 0) city(t, r, gleamAt); else { look('card'); boilSeed('f4dark' + bay); piece(R4(r.x - 30, r.y - 30, r.x + r.w + 30, r.y + r.h + 30), '#141A2A', { ink: null, key: 'f4dk' + bay, lift: 0, flatCard: true, edge: false }); glow(r.x + r.w * .5, r.y + r.h * .7, 120, '#FFB45E', .25); } }; }
  // ---------- her sketchbook (brief/animation-style.md, the cast: A4 landscape, about 30 × 21 cm, spiral-bound on its
  // left short edge, navy card cover; a little narrower than her shoulders) ----------
  // SH: the open sheet, world px, resting on her lap (its bottom edge on her thighs); PG4: the drawing on it, exactly 16:9
  // (the doodle's frame: the pull-back starts with it filling the frame), inset in the sheet's paper
  // (propped on her lap, forward of her body: its bottom edge just above her thighs, so her forearms pass beneath it)
  const SH = { x0: 800, y1: 748, w: 96 }; SH.h = SH.w / Math.SQRT2; SH.x1 = SH.x0 + SH.w; SH.y0 = SH.y1 - SH.h; SH.cx = SH.x0 + SH.w / 2; SH.cy = SH.y0 + SH.h / 2;
  const PGW = SH.w - 13, PG4 = { x0: SH.x0 + 8 }; PG4.w = PGW; PG4.h = PGW * 9 / 16; PG4.y0 = SH.cy - PG4.h / 2; PG4.x1 = PG4.x0 + PG4.w; PG4.y1 = PG4.y0 + PG4.h; PG4.cx = PG4.x0 + PG4.w / 2; PG4.cy = PG4.y0 + PG4.h / 2;
  const NB = { cover: '#3A4A6A', coverDk: '#2A3650', coil: '#9A9EA6' };
  function notebookBack(shut) {
    boilSeed('f4 nb');
    piece(R4(SH.x0 - 3, SH.y0 - 2, SH.x1 + 3, SH.y1 + 3), NB.cover, { sw: 1.2, key: 'f4cover', lift: 3 });   // the cover folded behind
    piece(R4(SH.x0, SH.y0, SH.x1, SH.y1), '#FBF8F0', { sw: .8, key: 'f4sheet', lift: 1, flatCard: true });   // the sheet: paper round the drawing
  }
  function notebookFront(shut, t) {
    boilSeed('f4 nbf');
    // the cover coming over (the slam): from the spine to the right edge
    if (shut > 0) { const xr = lerp(SH.x0, SH.x1 + 3, shut); piece(R4(SH.x0 - 3, SH.y0 - 2, xr, SH.y1 + 3), NB.cover, { sw: 1.4, shade: NB.coverDk, depth: 6, key: 'f4lid', lift: 4 });
      if (shut >= 1) { piece(R4(SH.x1 - 20, SH.y0 - 2, SH.x1 - 16, SH.y1 + 3), '#1E1A22', { ink: null, key: 'f4band', lift: 1, flatCard: true, edge: false }); } }
    for (let i = 0; i < 9; i++) { const y = SH.y0 + 4 + i * (SH.h - 8) / 8; piece(oval(SH.x0, y, 3.8, 2, 0, 12), NB.coil, { sw: .6, key: 'f4coil' + i, lift: 1, flatCard: true }); }
  }
  // ---------- her ----------
  const HX = 755;   // her seat: bay 0's left seat, facing right (the chorus's SEAT(0, -1))
  const hu = (x, y) => [(x - HX) / TR.u, (y - TR.FY) / TR.u];   // world → her body units
  // How she holds the sketchbook, sitting with it tilted up on her lap: she's finished drawing, so the biro is put away,
  // tucked into her bun beside her pencil (f4BunBiro), and she holds the book up by its two sides to show it, as anyone
  // holds up a sketchbook: each hand round a side edge, the fingers behind the pad, the thumb on its front margin
  // (f4Grip); no arm crosses the page.
  //   her near arm hangs by her side and its forearm comes forward to the spine from beside the book, the hand round it
  //   (f4Arms);
  //   her far arm comes down her far side behind the book, the elbow shows below its lower-right corner, and the forearm
  //   comes up its right edge (foreshortened: it comes toward us), the hand round the edge (f4FarArm; the rig's own far
  //   arm hangs hidden behind her and the book).
  // (the user, 4:13: "what fingers is she using to hold the notebook up? Her hands seem like they might be accidentally
  // mirrored": the near hand was the sleeve running into the spine with a thumb stub on it, no hand; the far hand's
  // three fingers stood up in plain view beside the edge, over the table, the thumb under them)
  // HAND_L: the near wrist, a palm's length short of the spine (the knuckles on its edge); FAR: the far elbow and wrist (world)
  const HAND_L = [SH.x0 - 21, SH.y1 - 13];
  const FAR = { el: [SH.x1 + 7, SH.y1 + 15], wr: [SH.x1 + 9, SH.y0 + 37], elOff: [SH.x1 + 12, SH.y1 + 20], wrOff: [SH.x1 + 16, SH.y0 + 50] };
  F4.away = [F4.slam[0] - .22, F4.slam[1] + .04];   // her far hand off the edge, out of the lid's way
  function f4Her(t) {
    const shut = seg(t, ...F4.slam);
    // (the user, 4:14: "she should probably look frustrated as she says 'I'm not pissed off'. Then 'I'm pissed off' she
    // should definitely look annoyed... She is annoyed moments later, but it's too late"). The line's sarcasm is in her
    // face from its first word, and builds: frustrated on "I'm not pissed off", at her drawing (the brows knit, the eyes
    // a little narrowed, the mouth tight and pulled down between the words, a small shake of the head on "not": insisting
    // she's fine); she looks up at the city and glares at it through "that the future arrived", her eyes rolling up and
    // back on the held "arrived"; annoyed on "I'm pissed off" (the brows hard down), still glaring at it; then through
    // gritted teeth on "fucking", at the book, and the slam
    const e = emotions(t, [[F4.t0 - 2, 'happy', { lookX: .45, lookY: .9, mouth: 'smile' }],
      [F4.l1 - .15, 'determined', { squint: .15, lookX: .45, lookY: .9, mouth: 'frown' }], [F4.fut - .35, 'determined', { squint: .3, lookX: 1, lookY: -.55, mouth: 'frown' }],
      [F4.l2 - .12, 'angry', { lookX: 1, lookY: -.4, mouth: 'frown' }], [F4.fk - .12, 'angry', { lookX: .6, lookY: .8, mouth: 'grimace' }],
      [F4.wait, 'determined', { lookX: 1, lookY: -.45, mouth: 'flat' }]], { take: .35 });
    e.emote = null; e.gloom = 0; e.tint = null; e.dy = (e.dy || 0) * .25; e.sq = (e.sq || 0) * .5; e.rot = 0; e.dx = 0;
    // (the eye roll on "arrived": up and across, and back to the city)
    const roll = Math.sin(Math.PI * seg(t, F4.arr + .35, F4.arr + 1.05));
    if (roll > 0) { e.lookX = lerp(e.lookX, .1, roll); e.lookY = lerp(e.lookY, -1, roll); e.squint = (e.squint || 0) * (1 - roll); }
    // (the lip-sync takes its mood from her mouth: frowning, then through her teeth. It used to be swapped for a plain
    // 'o' at each word's start, which dropped the mood while she sang)
    const shake = t > F4.l1 + .12 && t < F4.l1 + .8 ? .045 * Math.sin((t - F4.l1 - .12) * TAU * 2.2) * (1 - seg(t, F4.l1 + .12, F4.l1 + .8)) : 0;
    // (the slam: her near hand keeps its hold on the spine; her far hand lets go of the edge as the lid swings over and
    // takes the shut book's edge again: f4FarArm)
    const hl = hu(...HAND_L), hdown = hu(816, TR.FY - 90);
    const pose = { L: [hl[0], hl[1], 0, 'none', 1, -.26, 'u'], R: [hdown[0], hdown[1], 0, 'none', 0, 1.5, 'u'] };   // (L's hand: f4Grip, in front of the book; R: hanging behind her, hidden)
    return { ...e, pose, view: 'q', seated: true, seatH: SEAT_H, boilKey: 'f4her', noShadow: true, tilt: (e.tilt || 0) + shake, dy: e.dy + (shut > 0 && shut < 1 ? .3 : 0) };
  }
  // ---------- the shot ----------
  // (t: song time, continuous: the camera on ones; tq: the drawing's stepped time, so the slam's jolt starts on the frame
  // the lid lands)
  function f4Cam(t, tq = t) {
    // (the sketchbook is A4 on her lap: the framing keeps its drawing readable: close on it as it settles, then out to her
    // and the window, and in on her and the book for the slam)
    const k = kf(t, [[F4.t0, [PG4.cx, PG4.cy, 4.6]], [F4.back[1], [852, 692, 3.5]], [F4.l1 + 1.5, [930, 578, 1.45]], [F4.fut, [940, 572, 1.46]], [F4.arr + .5, [1010, 452, 1.85]],
      [F4.l2 - .1, [1000, 458, 1.86]], [F4.still, [876, 636, 2.3]], [F4.slam[1] + .15, [878, 630, 2.34]], [F4.t1, [900, 488, 2.2]]], ease);
    const j = tq > F4.slam[1] ? spring(t, F4.slam[1], 9, 40) * 8 : 0;
    return { cx: k[0], cy: k[1] + j, zoom: k[2] };
  }
  // The city's light in the carriage: warm gold, spilling out of the window onto its frame, the wall and the seat backs
  // round it (outside the glass: the engraving itself isn't lit), strongest round the window's lower edge where she sits
  // (k: 0..1; lighting: on ones)
  function f4Aura(k) {
    if (k <= 0) return;
    const w = trWin(0);
    // (the stencil clip fills even-odd: a big rectangle and the glass inside it leave everything but the glass)
    clipPoly([R4(w.x - 2000, w.y - 2000, w.x + w.w + 2000, w.y + w.h + 2000), rrPts(w.x - 1, w.y - 1, w.w + 2, w.h + 2, 41)], () => {
      glow(w.x + w.w / 2, w.y + w.h * .55, 560, '#FFB84A', .48 * k);
      glow(w.x + w.w / 2, w.y + w.h / 2, 390, '#FFD27A', .22 * k);   // (the frame itself, catching it)
      glow(w.x + w.w * .3, w.y + w.h * .95, 300, '#FFD27A', .3 * k);
    });
  }
  // ...and on her, by the window: a warm rim along her window side (the cut-out's rim light: a pale gold copy of her
  // silhouette a hair toward the window, behind her), only where the window's light reaches her (above the sill)
  function f4Rim(hs, k) {
    if (k <= 0) return;
    const P0 = piece, D0 = dline, R0 = brad, col = '#FFD98C', d = 2.3 * k;
    clipPoly(R4(HX - 400, -400, HX + 400, TR.WT + TR.WH + 34), () => {
      piece = (P, c, o = {}) => P0(P, col, { ink: null, key: (o.key || 'x') + 'rim', lift: 0, flatCard: true, edge: false });
      dline = brad = () => {};
      push(); translate(d, -d * .45);
      try { f4BunBiro(() => person(HX, TR.FY, TR.u, HER_C, hs)); } finally { pop(); piece = P0; dline = D0; brad = R0; }
    });
  }
  function f4Frame(t, lt) {
    const tt = mt(t), C = f4Cam(t, tt), gleam = ease(seg(tt, F4.arr - .3, F4.arr + .3)) * (1 - seg(tt, F4.l2, F4.l2 + 1));
    const e = ease(seg(tt, ...F4.back));
    // the aura: the city's light, always there, swelling on "arrived" (on ones: it's light)
    const aura = .65 + .35 * ease(seg(t, F4.arr - .3, F4.arr + .5)) * (1 - .6 * ease(seg(t, F4.l2, F4.l2 + 1.2)));
    look('card');
    camBegin(C.cx, C.cy, C.zoom);
    trainBack(tt, lt, f4View(gleam));
    f4Aura(aura);
    const hs = f4Her(tt);
    f4Rim(hs, aura);
    f4BunBiro(() => person(HX, TR.FY, TR.u, HER_C, hs));
    trainFront(tt, lt);
    if (e >= .9) f4FarArm(tt, 'back');
    camEnd();
    f4Pad(t, tt, C, hs);
    if (e >= .9) { f4Arms(C, hs); camBegin(C.cx, C.cy, C.zoom); f4FarArm(tt, 'front'); camEnd(); }
    look(e < .5 ? 'doodle' : 'card');
  }
  // her near forearm and thumb in front of the book: the rig's near forearm drawn again over her far side (the same
  // pieces, in the same place), left of the book, and her thumb round the spine
  function f4Arms(C, hs) {
    const P0 = piece, D0 = dline, R0 = brad, L0 = limb, jy = (hs.dy || 0) * 1.1 * TR.u, wr = [HAND_L[0], HAND_L[1] + jy];
    let fa = -.26;   // (the forearm's line, as the rig drew it: the hand goes on in line with it)
    camBegin(C.cx, C.cy, C.zoom); look('card');
    const shut = seg(mt(T), ...F4.slam), grip = !(shut > 0 && shut < 1);
    // (the rig drawn twice: once, keeping nothing, to learn the forearm's line; then, after the hand, just the forearm and
    // the cuff over its wrist)
    const quiet = () => {};
    piece = dline = brad = quiet;
    limb = function (P, w0, w1, col, o = {}) { const r = L0.apply(this, arguments); if (/^rCf4herarm-1/.test(o.key || '')) fa = r.ang; return r; };
    try { person(HX, TR.FY, TR.u, HER_C, hs); } finally { piece = P0; dline = D0; brad = R0; limb = L0; }
    clipPoly(R4(0, 0, SH.x0 - 1, 2000), () => {
      f4Grip(SH.x0 - 3, -1, wr, fa, 'f4gripL', 'back');
      piece = function (P, col, o = {}) { if (/^rCf4her(arm-1l|cuff-1)/.test(o.key || '')) return P0(P, col, o); };
      dline = brad = quiet;   // (the rig's other lines, and the joints' brads)
      try { person(HX, TR.FY, TR.u, HER_C, hs); } finally { piece = P0; dline = D0; brad = R0; }
    });
    if (grip) f4Grip(SH.x0 - 3, -1, wr, fa, 'f4gripL', 'thumb');
    camEnd();
  }
  // Her hand round a side edge of the sketchbook (world; ex: the book's outer edge, side -1 the left edge, 1 the right;
  // wr: the wrist; a: the forearm's line, which the hand carries on: a straight wrist). The fingers are round the back of
  // the pad, so what shows is (pass 'back') the back of the hand beside the edge, cut off where it turns round behind, its
  // knuckles on the edge; and (pass 'thumb') the thumb, from the heel of the hand over the edge onto the front margin,
  // lying up and in along it (its nail toward us), short of the drawing.
  function f4Grip(ex, side, wr, a, key, pass) {
    const s = HER_C.body.hand * TR.u, ww = HER_C.body.wrist * TR.u, C = HER_C.col, sw = clamp(TR.u / 20, .55, 2.2);
    const at = (x, y) => [wr[0] + Math.cos(a) * x - Math.sin(a) * y, wr[1] + Math.sin(a) * x + Math.cos(a) * y];
    if (pass === 'back') {
      // from the wrist (a cuff's width) out to the knuckles and round over them (the book hides the rest)
      const W0 = ww * .5, W1 = ww * .56, back = [[-.12 * s, -W0], [.3 * s, -W1], [.7 * s, -W1 * 1.02], [.92 * s, -W1 * .7], [1.0 * s, 0], [.92 * s, W1 * .7], [.7 * s, W1 * 1.02], [.3 * s, W1], [-.12 * s, W0]].map(([x, y]) => at(x, y));
      boilSeed(key + ' back');
      clipPoly(side < 0 ? R4(ex - 800, -2000, ex, 4000) : R4(ex, -2000, ex + 800, 4000), () => {
        piece(curvy(back, 3), C.skin, { sw, shade: C.skinDk, depth: s * .12, key: key + 'back', lift: 2, maxTone: .45 });
        // the knuckles, where the fingers turn round behind the edge
        dline([at(.62 * s, -W1 * .8), at(.66 * s, 0), at(.62 * s, W1 * .8)], sw * .45, mixCol(C.skin, NOIR.ink, .35), .5);
      });
    } else {
      // the thumb's root (the heel of the hand, just outside the edge, low on the grip) and its line: up, and in over the page
      const root = side < 0 ? [ex - .16 * s, wr[1] - .02 * s] : [ex + .16 * s, wr[1] - .38 * s];
      const ta = side < 0 ? -.92 : -Math.PI + .92, L = .56 * s, tip = [root[0] + Math.cos(ta) * L, root[1] + Math.sin(ta) * L];
      boilSeed(key + ' thumb');
      piece(ppBar(root, tip, .4 * s, .31 * s), C.skin, { sw: sw * .9, key: key + 'thumb', lift: 2, flatCard: true, maxTone: .45 });
      const n0 = [lerp(root[0], tip[0], .62), lerp(root[1], tip[1], .62)];   // (its nail, toward us)
      piece(ppBar(n0, [lerp(root[0], tip[0], .9), lerp(root[1], tip[1], .9)], .2 * s, .19 * s), mixCol(C.skin, '#FFF2E8', .35), { ink: null, key: key + 'nail', lift: 0, flatCard: true, edge: false });
    }
  }
  // her far arm (world, in the camera): pass 'back' before the book (the upper arm going up behind it, the elbow below
  // its corner, the forearm up its right edge, the hand round the edge and the red cuff over its wrist), 'front' after it
  // (the thumb on the front). On the slam the hand lets go and drops a little, open, then grips again (on twos).
  function f4FarArm(tt, pass) {
    const k = ease(seg(tt, F4.away[0], F4.away[0] + .1)) * (1 - ease(seg(tt, F4.slam[1] - .02, F4.slam[1] + .06))), off = k > .5;
    const el = [lerp(FAR.el[0], FAR.elOff[0], k), lerp(FAR.el[1], FAR.elOff[1], k)], wr = [lerp(FAR.wr[0], FAR.wrOff[0], k), lerp(FAR.wr[1], FAR.wrOff[1], k)];
    const u = TR.u, b = HER_C.body, C = HER_C.col, sw = clamp(u / 20, .55, 2.2), fa = Math.atan2(wr[1] - el[1], wr[0] - el[0]);
    if (pass === 'back') {
      boilSeed('f4 fararm');
      const root = [el[0] - 30, el[1] - 26];   // (the upper arm, going up behind the book to her shoulder)
      if (!off) f4Grip(SH.x1 + 3, 1, wr, fa, 'f4gripR', 'back');
      boilSeed('f4 fararm');
      const r = limb([root, el, wr], b.armW * .95 * u, b.wrist * u, C.coat, { sw, shade: C.coatDk, key: 'f4far' });
      const cw = b.wrist * 1.12, e0 = [wr[0] - Math.cos(r.ang) * .32 * u, wr[1] - Math.sin(r.ang) * .32 * u];
      if (off) { const ha = r.ang - .35 + .3 * k; hand(wr[0] + Math.cos(ha) * .08 * u, wr[1] + Math.sin(ha) * .08 * u, ha, b.hand * u, { pose: 'open', col: C.skin, sw, key: 'f4farh', maxTone: .45 }); }   // (let go for the slam)
      piece(ppBar(e0, [wr[0] + Math.cos(r.ang) * .04 * u, wr[1] + Math.sin(r.ang) * .04 * u], cw * u, cw * 1.04 * u), C.cuff || C.coatDk, { sw, key: 'f4farcuff', lift: 2 });
    } else if (!off) f4Grip(SH.x1 + 3, 1, wr, fa, 'f4gripR', 'thumb');
  }
  // the biro, put away: tucked into her bun beside the pencil, crossing it (drawn with the pencil, before the bun, so the
  // hair hides its middle and its two ends poke out)
  function f4BunBiro(fn) {
    const P0 = piece;
    const hook = function (P, col, o = {}) {
      if ((o.key || '') === 'rCf4herpencil') {
        piece = P0;
        try {
          let a = P[0], b = P[0], best = 0;
          for (const p of P) for (const q of P) { const d = Math.hypot(p[0] - q[0], p[1] - q[1]); if (d > best) { best = d; a = p; b = q; } }
          if (b[0] < a[0]) [a, b] = [b, a];
          const an = Math.atan2(b[1] - a[1], b[0] - a[0]) - .3, L = best * .95, c = [(a[0] + b[0]) / 2 + Math.cos(an) * best * .1, (a[1] + b[1]) / 2 + Math.sin(an) * best * .1];   // (the blue cap out at the top)
          biro(c[0] - Math.cos(an) * L / 2, c[1] - Math.sin(an) * L / 2, an, L, 'f4bunbiro');
        } finally { piece = hook; }
      }
      return P0(P, col, o);
    };
    piece = hook;
    try { fn(); } finally { piece = P0; }
  }
  // the pad, in screen space: its drawing starts as the whole frame (F3's den) and settles onto her lap. Everything
  // on it (cover, sheet, spiral) is drawn in lap-world coords through the pad's own transform,
  // which at the end is the camera's. (The pull-back out of the page is a camera move: on ones, eC.)
  function f4Pad(t, tt, C, hs) {
    const shut = seg(tt, ...F4.slam), e = ease(seg(tt, ...F4.back)), eC = ease(seg(t, ...F4.back)), pr = [W / 2 + (PG4.x0 - C.cx) * C.zoom, H / 2 + (PG4.y0 - C.cy) * C.zoom, C.zoom * PG4.w];
    const rw = lerp(W, pr[2], eC), rx = lerp(0, pr[0], eC), ry = lerp(0, pr[1], eC), k = rw / PG4.w;
    const padSpace = fn => { push(); resetMatrix(); translate(-W / 2, -H / 2); translate(rx - PG4.x0 * k, ry - PG4.y0 * k); scale(k); fn(); pop(); };
    const ps = (x, y) => [rx + (x - PG4.x0) * k, ry + (y - PG4.y0) * k];
    look('card');
    padSpace(() => notebookBack(shut));
    if (shut < 1) {
      clipTo([R4(rx, ry, rx + rw, ry + rw * 9 / 16)], true);
      // once the page has settled on her lap it's a drawing on paper: frozen (no boil, no motion) from the settle on
      const settled = t >= F4.back[1], dt = settled ? F4.back[1] : t;
      push(); resetMatrix(); translate(-W / 2, -H / 2); translate(rx, ry); scale(rw / W);
      if (settled) stillDrawing(() => DEN.frame(r2(dt), { cam: f3Cam }), dt); else DEN.frame(r2(t), { cam: f3Cam });
      pop();
      clipEnd();
      // the box she drew round it in biro (its colouring and ruling stop at it: without one, the crayon hatching ended in
      // hard straight lines on the paper); hand-drawn, gone over, the corners crossing, and just outside the drawing, so
      // none of it shows while the drawing still fills the frame
      push(); resetMatrix(); translate(-W / 2, -H / 2); translate(rx, ry); scale(rw / W);
      const box = () => { look('doodle'); boilSeed('f4 box'); edgeLine(R4(-5, -5, W + 5, H + 5), 2.6, BIRO, true); };
      if (settled) stillDrawing(box, dt); else box();
      pop();
    }
    look('card');
    padSpace(() => {
      notebookFront(shut, tt);
      if (tt > F4.slam[1] && tt < F4.slam[1] + .4) { boilSeed('f4 puff'); const a = (tt - F4.slam[1]) / .4; for (let i = 0; i < 6; i++) { const an = Math.PI * (1.1 + i * .16), r0 = 9 + 26 * easeOut(a); dline([[SH.x1 + Math.cos(an) * r0 * .6 - 4, SH.y0 + Math.sin(an) * r0 * .5], [SH.x1 + Math.cos(an) * r0 - 4, SH.y0 + Math.sin(an) * r0 * .8]], 1.2, '#E8E0D0', 0); } }
    });
    return [ps(SH.x0 - 5, SH.y0 - 3), ps(SH.x1 + 4, SH.y0 - 3), ps(SH.x1 + 4, SH.y1 + 4), ps(SH.x0 - 5, SH.y1 + 4)];   // (the book's rect, screen)
  }
  SHOT.F4 = (t, lt, dur) => f4Frame(t, lt);

  // for other chapters (the final chorus's notebook and the outro): her Friday page, as it is in F4 (the den after F3, the
  // birds settled), drawn full frame in the doodle look; put it on a page with push/translate/scale (1920 × 1080 → page)
  window.BRIDGE = { fridayPage: t => stillDrawing(() => DEN.frame(T3.end + .6, { cam: f3Cam }), T3.end + .6), PAGE: { w: W, h: H } };   // (a drawing: static)
})();

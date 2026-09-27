// final.js: the final chorus (bars 146–161), the two of them together. The chorus's motifs come back and they answer
// them, a little: nothing is won.
//   Z1  (261.0–267.9) the train doors open; they run together, left to right, across the frame split into the four
//       media (past, present, bad future, good future), the seams printed like banknote borders. Bots chase them through
//       the media and pile up against the good future's line (the chase, below); on the last beat the AI bill whips in
//       and slaps over the lens ("…and we get this?"), which is Z2's first frame
//   Z2  (267.9–274.9) the bill arrives at her train table: this time she catches it, folds it into a paper plane (the
//       CV's callback) and flies it out of the window into the bunker, where it knocks the coupe tower (a bot catches the
//       toppling glass) and slots back through the vault door. The banquet barely looks up. "Same shit, faster": the
//       slot feeds the bill straight back out, then more
//   Z3  (274.9–278.5) one scene at their table, to the flip: the bill slaps down on her notebook; the camera pulls back to the
//       two of them at the table, her notebook open between them, her phone flat with the bots' sandbox on it; the bots
//       climb out (riso to card at the screen's edge), run along the table and out through the window's open sash
//   Z4  (278.5–287.2) on "rent" the landlord's hand plonks her rent book down on the bill; they look at it, then at each
//       other; Rowan climbs onto the table and sweeps them both off it; her phone lights up, counting the hours saved,
//       buzzing; they look at it; the camera
//       goes in over the table; before his line he turns the phone face down. "I count the life I've spent": his hand
//       turns her pages (the turns: the user's, untouchable)
(() => {
  // ---------- helpers ----------
  // Clip what's drawn next to polygons (world coords, or screen coords with screen = true). The clipped layer must paint
  // its whole region opaque first (p5.brush's layer replaces what was there inside the clip). Close with clipEnd().
  function clipTo(polys, screen = false) {
    flushBrush(); push();
    beginClip(); push(); if (screen) { resetMatrix(); translate(-W / 2, -H / 2); } noStroke(); fill(0);
    for (const P of polys) { beginShape(); for (const [x, y] of P) vertex(x, y); endShape(CLOSE); }
    pop(); endClip();
  }
  function clipEnd() { flushBrush(); pop(); }
  const R4 = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const PAPER = '#FBF8F0', RULE = '#9DB7DC';
  // word i of the final chorus's line starting with prefix (the chorus lines are sung three times: take the one after 258 s)
  const WF = (prefix, i = 0) => { for (let n = 0; n < 6; n++) { const l = LY(prefix, n); if (!l) break; if (l.start > 258) return l.words[Math.min(i, l.words.length - 1)][0]; } return null; };
  const LF = prefix => { for (let n = 0; n < 6; n++) { const l = LY(prefix, n); if (!l) break; if (l.start > 258) return l; } return null; };
  function page(x0, y0, x1, y1) {
    _paint(R4(x0, y0, x1, y1), { wash: PAPER, ink: null });
    for (let y = Math.ceil((y0 - 130) / 40) * 40 + 130; y < y1; y += 40) for (let x = x0; x < x1; x += 400) _inkLine([[x, y], [Math.min(x1, x + 410), y + .3]], .6, RULE, 'rotring', 0);
  }
  // arm specs blended with an easing; keeps every field (a 'u' spec stays one)
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
  const calmE = e => { e.emote = null; e.gloom = 0; e.tint = null; e.dy = (e.dy || 0) * .3; e.sq = (e.sq || 0) * .5; e.rot = (e.rot || 0) * .3; e.dx = 0; return e; };

  // =====================================================================================================================
  // Z1: the doors open; the run across the four media
  // =====================================================================================================================
  const Z1 = { t0: BAR(146), t1: BAR(150), fully: WF('Fully automated'), piss: WF('Fully automated', 4), all: WF('All that intelligence'), intel: WF('All that intelligence', 2), and: WF('All that intelligence', 3) };
  Z1.doors = [Z1.t0 + .42, Z1.t0 + .8];
  Z1.jump = [Z1.t0 + .95, Z1.t0 + 1.3];
  Z1.split = BAR(147);
  Z1.stop = [264.85, 265.55];   // (the chase's heap lands earlier and lingers: the user, 2026-09-25)
  Z1.turn = Z1.all - .15;
  Z1.bill = [Z1.t1 - .36, Z1.t1 - 1 / 24];   // a quick whip at the lens on the last beat, flat over it on Z1's last frame
  // --- A: the stopped train from the trackside (the chorus's red exterior: window.CHORUS.trainOutside), close on the doors;
  // they open on the two of them, and they jump down and run ---
  const TXF = { top: 560, bot: 1010, winY: 620, winH: 150, winW: 196, pitch: 262 };   // (the chorus's train geometry, for the stand-in)
  const TXD = () => { const T = window.CHORUS ? CHORUS.TRAIN : TXF, x0 = 960 - 3 * T.pitch - T.winW / 2, dx = x0 + 4 * T.pitch - 30, dw = (T.winW + 60) / 2; return { T, dx, dw, floor: T.bot - 84, cx: dx + dw }; };
  // each window: a lit carriage, a seat back, and in some a passenger dozing (F4's sleeping bots, the carriage's own
  // silhouettes in its seat colour: the late train's passengers aboard), cut to the window
  const Z1_DOZE = { 1: ['ghost', 1, .38], 3: ['gemini', -1, .6], 5: ['cat', 1, .42], 6: ['grok', -1, .56] };
  function trainWin(t, i, r) {
    boilSeed('z1win' + i);
    piece(curvy([[r.x + r.w * .3, r.y + r.h], [r.x + r.w * .3, r.y + r.h * .45], [r.x + r.w * .42, r.y + r.h * .35], [r.x + r.w * .58, r.y + r.h * .35], [r.x + r.w * .7, r.y + r.h * .45], [r.x + r.w * .7, r.y + r.h]], 3), CAR.moq, { sw: 1.4, key: 'z1ws' + i, lift: 3 });
    const D = Z1_DOZE[i]; if (!D || typeof crowdBot !== 'function') return;
    clipPoly(R4(r.x, r.y, r.x + r.w, r.y + r.h), () => crowdBot(r.x + r.w * D[2], r.y + r.h + 8, D[0] === 'grok' ? 15 : 19, { kind: D[0], pose: 'sit', doze: true, dir: D[1], front: .6, col: TRAIN_COL.seat, t: mt(t), eye: TRAIN_EYE, rim: TRAIN_RIM, rimK: .5, seed: 4100 + i, key: 'z1doze' + i, cull: false }));
    look('card');
  }
  function standInTrain(t, open) {
    const { T, dx, dw } = TXD(), x0 = 960 - 3 * T.pitch - T.winW / 2, B = '#B8303F';
    boilSeed('z1 sky'); piece(R4(-200, -200, W + 400, T.top), '#10141E', { ink: null, key: 'z1sky', lift: 0, flatCard: true, edge: false });
    piece(R4(-200, T.bot, W + 400, H + 400), '#1C2330', { ink: null, key: 'z1gr', lift: 0, flatCard: true, edge: false });
    for (let i = 0; i < 7; i++) { const x = x0 + i * T.pitch; if (i === 4) continue; piece(R4(x, T.winY, x + T.winW, T.winY + T.winH), '#F2DFA8', { ink: null, key: 'z1wi' + i, lift: 0, flatCard: true, edge: false }); trainWin(t, i, { x, y: T.winY, w: T.winW, h: T.winH }); }
    boilSeed('z1 body');
    const L = x0 - 400, R = x0 + 7 * T.pitch + 400;
    piece(R4(L, T.top, R, T.winY), B, { sw: 2.4, key: 'z1bt', lift: 6 }); piece(R4(L, T.winY + T.winH, R, T.bot - 80), B, { sw: 2.4, key: 'z1bb', lift: 6 });
    for (let i = 0; i <= 7; i++) { const x = x0 + i * T.pitch - (T.pitch - T.winW); piece(R4(x - 2, T.winY - 2, x + T.pitch - T.winW + 2, T.winY + T.winH + 2), B, { ink: null, key: 'z1bp' + i, lift: 0 }); }
    piece(R4(L, T.top + 18, R, T.top + 38), '#F2ECE0', { ink: null, key: 'z1st', lift: 2, flatCard: true }); piece(R4(L, T.bot - 80, R, T.bot), '#2A2630', { sw: 2, key: 'z1sk', lift: 4 });
    piece(R4(dx, T.winY - 20, dx + 2 * dw, T.bot - 84), '#F2DFA8', { ink: null, key: 'z1vest', lift: 0, flatCard: true, edge: false });
    const op = ease(clamp(open)) * dw * .95;
    for (const sd of [0, 1]) { const x = dx + sd * dw + (sd ? op : -op); piece(R4(x, T.winY - 20, x + dw, T.bot - 84), '#C83A40', { sw: 2, key: 'z1door' + sd, lift: 4 }); piece(R4(x + 18, T.winY + 6, x + dw - 18, T.winY + 120), '#F2DFA8', { sw: 1.4, key: 'z1dw' + sd, lift: 1 }); }
  }
  // a figure as a flat card silhouette in one colour (op: its opacity), and a figure fading in over its silhouette (k: its
  // pieces' opacity; the ink lines as they are)
  function z1Sil(fn, col, op = 255) {
    const sp = piece, sd = dline, sb = typeof brad === 'function' ? brad : null;
    piece = (P, c, o = {}) => sp(P, col, { key: o.key, sw: o.sw, lift: 0, ink: null, edge: false, flatCard: true, op });
    dline = () => {}; if (sb) brad = () => {};
    try { fn(); } finally { piece = sp; dline = sd; if (sb) brad = sb; }
  }
  // a figure lit by k (0 dark, the silhouette's colour; 1 its own colours): every colour it paints graded toward the
  // dark, opaque all the way (the light coming up on it, not the figure fading in: faded over its silhouette, the pieces
  // went see-through, one over another and the door behind them)
  function z1Lit(fn, k, dark) {
    const pt = PAINT_TINT, sd = dline, sp = piece, a = 1 - k;
    PAINT_TINT = c => mixCol(pt ? pt(c) : c, dark, a);
    dline = (P, sw, col = NOIR.ink, curv) => sd(P, sw, mixCol(col, dark, a), curv);
    piece = (P, c, o = {}) => sp(P, c, k < .6 ? { ...o, edge: false } : o);   // (the card's pale cut edge only in the light)
    try { fn(); } finally { PAINT_TINT = pt; dline = sd; piece = sp; }
  }
  const trainOut = (t, lt, open) => window.CHORUS && CHORUS.trainOutside ? CHORUS.trainOutside(t, lt, { still: true, doors: open, window: trainWin }) : standInTrain(t, open);
  // --- B: the four panels (one world, four media), the seams engraved like a note's border ---
  const PANEL = [['ink', 0, 480], ['card', 480, 960], ['xerox', 960, 1440], ['doodle', 1440, 1920]];
  const GR = 900;   // the ground line (their feet)
  function panelBack(i, t) {
    const [lk, x0, x1] = PANEL[i], tt = mt(t);
    look(lk);
    if (lk === 'ink') {   // the past: the 1930s ad's garden (sky, the grinning sun, hills, fence, lawn)
      psSky(); push(); translate(-450, 30); psSun(tt); pop(); psHills(tt); psFence(); psLawn();
    } else if (lk === 'card') {   // the present: the night by the line, the houses' lit windows, a sodium lamp
      boilSeed('z1p night');
      piece(R4(x0 - 40, -60, x1 + 40, 760), '#141A2A', { ink: null, key: 'z1pn', lift: 0, flatCard: true, edge: false });
      for (let k = 0; k < 3; k++) { const hx = x0 + 20 + k * 160, h = 150 + 60 * hash(k + 4); piece([[hx, 760], [hx, 760 - h], [hx + 70, 760 - h - 60], [hx + 140, 760 - h], [hx + 140, 760]], '#1C2233', { ink: null, key: 'z1ph' + k, lift: 0, flatCard: true, edge: false }); if (k !== 1) { piece(R4(hx + 50, 760 - h + 30, hx + 90, 760 - h + 76), '#E8B85A', { ink: null, key: 'z1phw' + k, lift: 0, flatCard: true, edge: false }); glow(hx + 70, 760 - h + 52, 60, '#FFB45E', .5); } }
      piece(R4(x0 - 40, 740, x1 + 40, H + 60), '#2A2630', { ink: null, key: 'z1pg', lift: 0, edge: false });
      piece(R4(x0 - 40, 740, x1 + 40, 770), '#3A3440', { sw: 1.2, key: 'z1pk', lift: 3 });
      const lx = x0 + 330; piece(R4(lx - 5, 250, lx + 5, 760), '#0C0E14', { ink: null, key: 'z1lamp', lift: 2, flatCard: true }); piece(curvy(R4(lx - 30, 238, lx + 6, 256), 2), '#0C0E14', { ink: null, key: 'z1lh', lift: 2, flatCard: true });
      // (the sodium lamp stutters now and then: life in the panel while the heap piles up next door)
      const fl = [[265.95, .08], [266.12, .06], [267.05, .1]].some(([a, d]) => tt >= a && tt < a + d) ? .35 : 1;
      glow(lx - 12, 262, 170, '#FFB45E', .8 * fl); glow(lx - 12, 262, 40, '#FFE0A0', .9 * fl);
    } else if (lk === 'xerox') {   // the bad future: the riso street, roofs, chimneys, a stack's smoke
      boilSeed('z1p riso');
      _paint(R4(x0 - 40, -60, x1 + 40, H + 60), { wash: XEROX.paper, ink: null });
      piece(R4(x0 - 40, -60, x1 + 40, 520), '#7A6AA8', { key: 'z1rs', ink: null });
      piece([[x0 + 250, 520], [x0 + 262, 150], [x0 + 310, 150], [x0 + 322, 520]], '#1E2C6A', { key: 'z1rstack', sw: 1.2 });
      for (let k = 0; k < 4; k++) { const ph = frac(t * .5 + k * .25), r = 30 + 60 * ph; piece(oval(x0 + 286 - 90 * ph, 130 - 200 * ph, r, r * .8, 0, 20), '#1A2458', { key: 'z1rp' + k, ink: null }); }
      const roof = [[x0 - 40, 560]]; for (let k = 0; k <= 6; k++) { const rx = x0 - 40 + k * 90; roof.push([rx, 520 - (k % 2) * 40], [rx + 20, 520 - (k % 2) * 40]); } roof.push([x1 + 40, 520], [x1 + 40, 760], [x0 - 40, 760]);
      piece(roof, '#D06A5C', { key: 'z1rr', sw: 1.2 });
      for (let k = 0; k < 4; k++) piece(R4(x0 + 30 + k * 120, 600, x0 + 80 + k * 120, 680), k % 2 ? '#FFE04A' : '#22367A', { key: 'z1rw' + k, sw: 1 });
      piece(R4(x0 - 40, 760, x1 + 40, H + 60), '#86A8D8', { key: 'z1rg', sw: 1.2 });
    } else {   // the good future: her notebook's doodle: a sun, green hills, the two trees with a hammock waiting
      boilSeed('z1p doodle');
      page(x0 - 40, -60, x1 + 40, H + 60);
      piece(oval(x0 + 360, 170, 56, 56, 0, 24), '#FFC928', { sw: 1.6, key: 'z1ds' });
      for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + tt * .3; _inkLine([[x0 + 360 + Math.cos(a) * 66, 170 + Math.sin(a) * 66], [x0 + 360 + Math.cos(a) * 88, 170 + Math.sin(a) * 88]], 2.4, vivid('#F2B02A'), 'cpencil', 0); }
      piece(curvy([[x0 - 60, 800], [x0 - 60, 640], [x0 + 150, 590], [x0 + 330, 630], [x1 + 60, 600], [x1 + 60, 800]], 5), '#6BC46A', { sw: 1.6, key: 'z1dh', side: false });
      piece(R4(x0 - 60, 740, x1 + 60, H + 60), '#8FD47A', { sw: 1.4, key: 'z1dg', side: false });
      for (const tx of [x0 + 110, x0 + 390]) { edgeLine([[tx, 740], [tx, 470]], 2.4, BIRO, false); piece(oval(tx, 440, 70, 60, 0, 20), '#3E9A5A', { sw: 1.5, key: 'z1dt' + tx }); }
      // the hammock between them, as the pre-chorus drew it: the pink back of the sling and the cyan front, sagging and
      // swaying a little (a bare biro V, it read as the two trees holding hands: the user)
      const sw = 10 * Math.sin(tt * 2.2), a = [x0 + 110, 556], b = [x0 + 390, 556];
      for (const [hx, hy] of [a, b]) for (const dy of [-6, 2]) edgeLine([[hx - 7, hy + dy - 3], [hx + 7, hy + dy + 3]], 1.6, BIRO, false);   // (tied round the trunks)
      const sl = (dy, n = 14) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, e = Math.sin(Math.PI * u); return [lerp(a[0], b[0], u) + sw * e, a[1] + 78 * e ** .8 + dy * e]; });
      piece(sl(-30).concat(sl(0).reverse()), '#E86A9A', { sw: 1.4, key: 'z1dhb' });
      piece(sl(-10).concat(sl(18).reverse()), '#46C2C8', { sw: 1.5, key: 'z1dhf' });
      for (const dy of [-1, 8]) edgeLine(sl(dy).slice(3, -3), .9, BIRO, false, .5);
      for (let k = 0; k < 6; k++) { const fx = x0 + 40 + k * 80, fy = 790 + 30 * (k % 2); piece(oval(fx, fy, 9, 9, 0, 12), ['#FF6FA8', '#FFC928', '#9A8BFF'][k % 3], { sw: 1, key: 'z1df' + k, flatCard: true }); }
    }
  }
  // the runners: world x of each (she's behind, he's ahead and nearer), their walk phases from the distance run
  const RUN_V = 742, HER_RUN = { ...HER_C, body: { ...HER_C.body, stride: .42 } }, HIM_RUN = { ...HIM_C, body: { ...HIM_C.body, stride: .42 } };
  function runX(t) {
    const a = Z1.split, b = Z1.stop[0], c = Z1.stop[1];
    const q = seg(t, b, c);
    return -300 + RUN_V * (Math.min(t, b) - a) + RUN_V * (c - b) / 2 * (1 - (1 - q) * (1 - q));
  }
  function runners(t) {
    const x = runX(t), turn = t >= Z1.turn, s = seg(t, ...Z1.stop), running = t < Z1.stop[1] - .05;
    const her = { x: x, y: GR - 20, u: 34 }, him = { x: x + 210, y: GR + 16, u: 38 };
    // (the chase: a glance back over the shoulder at the first bump on the glass; on the turn, at the heap, held; then up at the bill,
    // surprised with the mouth shut (outside card their mouths act, and an open O over "and we get" read as singing it).
    // The glance back is under the backing "(Taking the piss!)", which is nobody's: their mouths stay shut through it, her
    // a dry closed smirk, his a closed smile (open grins read as them mouthing it))
    const eH = calmE(emotions(t, [[Z1.split, 'determined', { lookX: 1 }], [Z1.piss - .3, 'happy', { lookX: 1, mouth: 'grin' }], [CH.hit + .04, 'happy', { lookX: -.85, lookY: .15, mouth: 'smirk' }], [Z1.turn, 'neutral', { lookX: .6, lookY: .25 }], [Z1.and - .2, 'surprised', { lookX: .2, lookY: -.6, mouth: 'flat' }]], { take: .3 }));
    const eM = calmE(emotions(t, [[Z1.split, 'excited', { lookX: 1, mouth: 'grin' }], [CH.hit + .1, 'excited', { lookX: -.85, lookY: .15, mouth: 'smile' }], [Z1.turn + .08, 'neutral', { lookX: .6, lookY: .25 }], [Z1.and - .15, 'surprised', { lookX: .2, lookY: -.6, mouth: 'flat' }]], { take: .3 }));
    const lean = running ? .14 : .14 * (1 - ease(s));
    const common = { view: 'q', flip: turn, noShadow: false, rot: turn ? 0 : lean };
    const oH = { ...eH, ...common, boilKey: 'z1her' }, oM = { ...eM, ...common, boilKey: 'z1him' };
    if (!turn) { oH.walk = (x + 300) / (4 * .42 * 6.6 * her.u) + .5 * (1 - s); oM.walk = (x + 300) / (4 * .42 * 3.4 * him.u); }
    else {
      // turned to the heap: she sizes it up, and on "intelligence" presents it with one open hand ("all that
      // intelligence"); he folds his arms (it was her hand up over her face, shading her eyes, which read as a hand over
      // her nose and hid her face; his arms hung dead). (The pose's frame flips with her: her forward hand is R; small
      // and close to her, the glass just in front of her; the other hand at her side)
      const hB = [-.8, 1.7, .3, 'relax'];
      oH.pose = pPoses(t, [[Z1.turn, { L: hB, R: [.8, 1.7, .3, 'relax', 1] }], [Z1.intel - .1, { L: hB, R: [1.6, 1.05, .12, 'open', 1, -.2] }]], .3);
      oM.pose = pPoses(t, [[Z1.turn, 'low'], [Z1.turn + .16, 'cross']], .3);
    }
    return [[her, HER_RUN, oH], [him, HIM_RUN, oM]];
  }
  // (Who sings: the final chorus is both of them, FM. In card person() lip-syncs its preset's voice; the other panels keep
  // their acting mouths: no lip-sync in riso or the doodle, the user's rule. Backing lines are nobody's.)
  // --- the chase (the user, 2026-09-25): bots run after them, eager helpers who only want to help (staff running after a
  // customer who left their change). ONE group on one world path; each panel draws its own cast of that group and the
  // seams cut it hard: the divider IS the change (no puff, no morph), so the butler's front half is already the bots in
  // the next panel. The past: the 1930s ad's robot butler, tray and all. The present: Clawd, the Gemini twins and
  // Copilot in a cheap disguise as HER (its V1 callback: "my replacement"), packed into the butler's footprint (Clawd
  // low under the tray with the twins riding on its back, Copilot's bun where its head is). The bad future: the same three,
  // joined by the rest: a photocopied second Copilot (a copy, but cheaper: the same disguise, worse), Grok, Muse and the
  // Codex gang. The good future's line is a wall: they can't follow; they pile up against it on the riso side, pressed
  // flat like faces on a shop window, and stay cheerful. Pure in t: each bot's run, hop, splat, slide and bounce comes
  // from its place in the group and its moment of contact.
  const CH = { v: 760, hit: 265.3, wall: 1430 };   // (the first bump on the glass: on the beat)
  const chF = t => CH.wall - CH.v * (CH.hit - t);   // the group's front on its free path (world x)
  const chStep = t => chF(t) / 250;                   // the shared stride clock: every bot's feet on one cadence
  const CH_BUTLER = { u: 24, fr: 6.6, gy: 890 };
  // The cast. ox: its ground point's offset from the group's front on the free path (px; left out, it's worked out from
  // its contact); fr: its front's reach ahead of its ground point (u); gy: its lane (depth); z: its place in the heap's
  // drawing order. P, its part in the pile-up: tl (it leaves the run: a hop), tc (contact) at c = [front x, feet y]
  // (H: the hop's height); then pressed flat to rs (x scale, anchored on the glass) and, after stick s, a slide of
  // slide s down to feet y ry; or b: it bounces back off, landing at ground point [x, y] at tb, tipped to rot.
  const CW = CH.wall;   // (the wall: the riso/doodle seam's riso edge)
  const CHC = [
    { id: 'clawd', u: 19, ox: -95, fr: 5, gy: 900, z: 3, in: 'card xerox', P: { tc: CH.hit, c: [CW + 6, 900], rs: .62, lean: .03 } },
    // the twins ride on Clawd's back (hand in hand, waving): when it stops dead at the glass they fly on into it
    { id: 'gem', u: 27, ride: { on: 'clawd', dx: -12, h: 7.7 }, fr: 2.5, z: 4, in: 'card xerox', P: { tl: CH.hit, tc: CH.hit + .13, c: [CW + 2, 732], H: 46, rs: .64, lean: .05 } },
    // Copilot trips over the pair and splats on the glass above them, then slides down onto their heads
    { id: 'cop', u: 34, ox: -205, fr: 1.9, gy: 906, z: 5, in: 'card xerox', P: { tl: CH.hit + .04, tc: CH.hit + .26, c: [CW - 8, 470], H: 60, rs: .68, stick: .12, slide: .2, ry: 566, lean: .03 } },
    { id: 'copy', u: 33, fr: 1.9, gy: 892, z: 2, in: 'xerox', P: { tc: CH.hit + .44, c: [1324, 892], rs: .72, lean: .08 } },
    { id: 'grok', u: 31, fr: 2.7, gy: 894, z: 1, in: 'xerox', P: { tc: CH.hit + .63, c: [1236, 894], rs: .66, b: { tb: CH.hit + .98, x: 1136, y: 900, rot: -.42, H: 170 } } },
    { id: 'muse', u: 25, fr: 2.3, gy: 420, z: 6, in: 'xerox', P: { tl: CH.hit + .56, tc: CH.hit + .76, c: [1352, 505], H: 30, rs: .68, stick: .16, slide: .36, ry: 660, lean: .1 } },   // (into Copilot's back; down onto the copy's head)
    { id: 'codey', u: 34, fr: 1.9, gy: 902, z: 7, in: 'xerox', P: { tc: CH.hit + .86, c: [1238, 902], rs: .72, lean: .08 } },   // (Codey leads the Codex pets: first to the glass)
    { id: 'seedy', u: 31, fr: 1.8, gy: 894, z: 8, in: 'xerox', P: { tl: CH.hit + .94, tc: CH.hit + 1.14, c: [1242, 752], H: 100, rs: .8, stick: .04, slide: .08, ry: 756 } },
    { id: 'dog', u: 34, fr: 1.9, gy: 898, z: 9, in: 'xerox', P: { tc: CH.hit + 1.02, c: [1150, 898], rs: .75, b: { tb: CH.hit + 1.28, x: 1098, y: 716, rot: -1.05, H: 120 } } },
  ];
  const CHB = Object.fromEntries(CHC.map(c => [c.id, c]));
  // (ox for the ones that join in riso: the free path that meets its contact at tc)
  for (const c of CHC) if (c.ox == null && !c.ride) c.ox = c.P.c[0] - c.fr * c.u - chF(c.P.tc);
  // the heap's jolts: every contact, and every landing after a slide, shakes the ones already on it
  const CH_KN = CHC.flatMap(c => [c.P.tc, ...(c.P.ry != null ? [c.P.tc + (c.P.stick || 0) + (c.P.slide || .2)] : [])]);
  const chBob = t => -.35 * Math.abs(Math.sin(chStep(t) * TAU));   // the run's bounce (u)
  // its ground point on the run (a rider: on its mount's back, bouncing with it)
  function chRun(c, t) {
    if (c.ride) { const m = CHB[c.ride.on], [mx, my] = chRun(m, t); return [mx + c.ride.dx, my - c.ride.h * m.u + chBob(t) * m.u]; }
    return [chF(t) + c.ox, c.gy];
  }
  // the impact: a splat that over-squashes and rings back to the pressed shape (0 → 1)
  const chImp = a => a <= 0 ? 0 : a < .05 ? 1.3 * ease(a / .05) : 1 + .3 * Math.exp(-(a - .05) * 11) * Math.cos((a - .05) * 32);
  // Where bot c is at t: its ground point (x, y), its squash (sx, sy about the anchor ax, ay: on the glass, at its feet),
  // its tip (rot), its stage (run | hop | press | fly | down), and the time since contact (age).
  function chState(c, t) {
    const P = c.P, u = c.u, tl = P.tl ?? P.tc;
    if (t < tl) { const [x, y] = chRun(c, t); return { x, y, sx: 1, sy: 1, ax: x, ay: y, rot: 0, stage: 'run', age: t - P.tc }; }
    const xc = P.c[0] - c.fr * u;   // its ground point at contact
    if (t < P.tc) {   // the hop: tipped up by the ones in front stopping dead, on toward the glass
      const k = seg(t, tl, P.tc), [x0, y0] = chRun(c, tl);
      const x = lerp(x0, xc, k), y = lerp(y0, P.c[1], easeOut(k)) - (P.H || 0) * Math.sin(Math.PI * k);
      return { x, y, sx: 1 - .08 * k, sy: 1 + .1 * k, ax: x, ay: y, rot: .12 * k, stage: 'hop', age: t - P.tc };
    }
    const a = t - P.tc;
    let knock = 0; for (const tj of CH_KN) if (tj > P.tc + .02 && t > tj) knock += .06 * Math.exp(-(t - tj) * 13);
    if (P.b) {   // it bounces back off: a squash on the heap, a flight back, a thump on the ground
      const fly = seg(t, P.tc + .07, P.b.tb);
      if (t < P.tc + .07) { const s = 1 - (1 - P.rs) * chImp(a); return { x: xc, y: P.c[1], sx: s, sy: 1 + (1 - s) * .5, ax: P.c[0], ay: P.c[1], rot: 0, stage: 'press', age: a }; }
      const x = lerp(xc, P.b.x, easeOut(fly)), y = lerp(P.c[1], P.b.y, fly) - P.b.H * Math.sin(Math.PI * fly), rot = P.b.rot * ease(fly);
      if (fly < 1) return { x, y, sx: 1 - .1 * Math.sin(Math.PI * fly), sy: 1 + .12 * Math.sin(Math.PI * fly), ax: x, ay: y, rot, stage: 'fly', age: a };
      const l = t - P.b.tb, land = .28 * Math.exp(-l * 9) * Math.cos(l * 26);
      return { x, y, sx: 1 + land * .6, sy: 1 - land, ax: x, ay: y, rot: rot + .08 * Math.exp(-l * 7) * Math.sin(l * 20), stage: 'down', age: a };
    }
    const s = 1 - (1 - P.rs) * chImp(a) - knock, y = P.ry != null ? lerp(P.c[1], P.ry, easeIn(seg(a, P.stick || 0, (P.stick || 0) + (P.slide || .2)))) : P.c[1];
    const thump = P.ry != null && a > (P.stick || 0) + (P.slide || .2) ? .1 * Math.exp(-(a - (P.stick || 0) - (P.slide || .2)) * 12) : 0;
    // leaning into the glass, face mashed on it (P.lean, rad, eased in with the splat)
    return { x: xc, y, sx: s - thump * .5, sy: 1 + (1 - s) * .3 - thump, ax: P.c[0], ay: y, rot: (P.lean || 0) * ease(seg(a, 0, .12)), stage: 'press', age: a };
  }
  // her disguise, as Copilot wears it: the rig's own (her bun wig with the pencil through it, round glasses over the
  // goggles) with her colours borrowed for the flight suit (her tomato coat, belted) and the scarf (her cream one)
  function chDisguised(fn) {
    const k = ['suit', 'suitDk', 'suitLt', 'her', 'herDk'], s0 = k.map(f => B2CP[f]);
    Object.assign(B2CP, { suit: PP_TOMATO.coat, suitDk: PP_TOMATO.coatDk, suitLt: PP_TOMATO.coatLt, her: HER_C.col.scarf, herDk: HER_C.col.scarfDk });
    try { return fn(); } finally { k.forEach((f, i) => { B2CP[f] = s0[i]; }); }
  }
  // the butler faces left in the ad: mirrored here to run right, the tray held out at chest height, the glass on it
  function chButler(t) {
    const { u, fr, gy } = CH_BUTLER, x = chF(t) - fr * u, w = chStep(t) + .5, ph = w * TAU;   // (the shared stride clock; its near foot lands with Copilot's)
    const dy = -.55 * Math.abs(Math.sin(ph)), rot = -.12 + .02 * Math.sin(ph * 2);
    push(); translate(x, 0); scale(-1, 1); translate(-x, 0); const pX = XF; XF = -XF;
    try {
      psRobot(x, gy, u, { walk: w, walkW: 1, dy, rot, turn: 0, look: [-.9, -.15], grin: .9, tray: [x - 5.5 * u, gy - 9.6 * u + 6 * Math.sin(ph)], trayGlass: true,
        antenna: .5 * Math.sin(ph * 2 + .6), bulb: .5 + .5 * Math.sin(ph), htilt: .04 * Math.sin(ph), hdy: .12 * Math.sin(ph * 2), gauge: t * 5 });
    } finally { XF = pX; pop(); }
  }
  // Life in the ad while the heap piles up (its panel had stood empty for 2.5 s): the butler comes back in from the seam,
  // facing his own way again, walks to his place with the tray, stops with a bounce and looks back at the seam (at the
  // heap beyond it), beaming, his antenna wobbling; then he turns to us and gives us the ad's wink (the poster's: the
  // user), before the bill whips in over him. The ad's wink as the intro plays it (its clock at .44): the turn to face us
  // (.23 s), the near eye's shutter coming down (.16 s) as the grin widens and the head tips, the bulb flashing and the
  // antenna ringing, the twinkle popping at the head's corner; the eye stays shut
  const BUTLER_BACK = [CH.hit + .4, CH.hit + 1.3];
  // (the heap look, a hold, the turn, the wink: shut on the beat, 267.5, held until the bill covers him, ~267.8. The turn
  // eases out, so its in-between is most of the way round: halfway, his shoes (scaled through zero as he turns) were two
  // sticks)
  const BUTLER_WINK = { look: [266.7, 266.92], turn: [267.09, 267.25], wink: 267.29 };
  function chButlerBack(t) {
    const { u, gy } = CH_BUTLER, k = seg(t, ...BUTLER_BACK), x = lerp(560, 300, ease(k)), walking = k > 0 && k < 1, w = (560 - x) / 250, ph = w * TAU;
    const land = k >= 1 ? Math.exp(-(t - BUTLER_BACK[1]) * 9) * Math.cos((t - BUTLER_BACK[1]) * 22) : 0, back = ease(seg(t, ...BUTLER_WINK.look));
    const BW = BUTLER_WINK, turn = easeOut(seg(t, ...BW.turn)), wink = seg(t, BW.wink, BW.wink + .16), wb = ease(seg(t, BW.wink - .05, BW.wink + .18));
    const ring = t > BW.wink ? Math.exp(-(t - BW.wink) * 6) * Math.sin((t - BW.wink) * 26) : 0;
    const flash = ease(seg(t, BW.wink, BW.wink + .14));
    psRobot(x, gy, u, { walk: w, walkW: walking ? 1 : 0, land, dy: walking ? -.55 * Math.abs(Math.sin(ph)) : 0, rot: walking ? .06 : 0, turn, look: [lerp(lerp(-.9, .9, back), 0, turn), lerp(-.15, 0, turn)], grin: .9 + .1 * wb, wink, tray: [x - 5.5 * u, gy - 9.6 * u + (walking ? 6 * Math.sin(ph) : 0)], trayGlass: true,
      antenna: .5 * Math.sin(t * 9) * (walking ? 1 : .6 + .4 * Math.exp(-(t - BUTLER_BACK[1]) * 3)) * (1 - turn * .6) + .5 * ring, bulb: Math.max(lerp(.5 + .5 * Math.sin(t * 4), 0, flash), flash), htilt: walking ? .04 * Math.sin(ph) : lerp(.06 * back * (1 - turn), .07, wb), hdy: .12 * Math.sin(ph * 2) - .15 * (t > BW.turn[1] ? Math.exp(-(t - BW.turn[1]) * 8) * Math.sin((t - BW.turn[1]) * 20) : 0), gauge: t * 5 });
    const tw = seg(t, BW.wink + .07, BW.wink + .27);
    if (tw > 0) { boilSeed('z1 twinkle'); psTwinkle(x + 1.9 * u, gy - 14.3 * u, 34 * u / PSX.bot.u, tw); }
  }
  // bot c drawn at state S (its run, hop, splat or tumble), in the current look
  function chBot(c, S, t) {
    const u = c.u, ph = chStep(t), sw = Math.sin(ph * TAU), tc = c.P.tc, run = S.stage === 'run', air = S.stage === 'hop' || S.stage === 'fly';
    // (the bots never sing here: their mouths stay shut, the eyes carrying the excitement and the splat. An open mouth
    // on the run or on the glass read as them singing along, and the heap lands under the backing "(Taking the piss!)",
    // which no bot says. Codey's cursor talks with an open mouth; the twins keep their fixed smile)
    const e = emotions(t, [[0, 'excited', { lookX: 1, mouth: 'smile' }], [tc, 'surprised', { lookX: 1, lookY: -.2, mouth: 'flat' }], [tc + .32, 'happy', { lookX: 1, lookY: -.1, mouth: 'smile' }]], { take: .5 });
    e.emote = null; if (c.id === 'gem') delete e.mouth;
    const o = { ...e, view: 'q', t, boilKey: 'z1c' + c.id, seed: 1 + CHC.indexOf(c) * .77, rot: S.rot, noShadow: !run || c.id === 'muse' };   // (Muse flies high: no shadow on the air)
    const bob = run ? -.35 * Math.abs(sw) : 0, wph = run ? ph : Math.floor(ph) + .25, wave = Math.sin((t - tc) * 11);
    const sit = S.age > .3;   // settled on the heap: a hand on the glass, a wave through it
    if (c.id === 'clawd') return clawd2(S.x, S.y, u, { ...o, walk: run ? ph : null, dy: bob, aL: run ? 1.1 + .25 * sw : 1.25, aR: run ? 1.1 - .25 * sw : sit ? 1.1 + .25 * wave : 1.3, rot: run ? .05 : S.rot });
    // (riding: its mount carries it) the twins hand in hand, not in mirror image: A waves; B reaches out ahead ("wait!"),
    // then on the glass B's free hand is pressed flat to it while A waves on (they used to let go and cheer, both arms up)
    if (c.id === 'gem') { const w2 = .38 * Math.sin(t * 7.4);
      return gemini(S.x, S.y, u, { ...o, pose: { O: [-2.35 - w2, -4.6, .25, 'open'], I: 'join', OB: run ? [-2.6, -2.5 + .2 * sw, .2, 'open'] : [-2.3, -3.3, .12, 'open'] }, rot: run ? -.04 : S.rot, noShadow: true }); }
    if (c.id === 'cop' || c.id === 'copy') {
      // (running, the real one holds up her leaving card from V1, the gold star: "you forgot this!")
      const card = run && c.id === 'cop';
      const pose = run ? { L: [-1.7 - .5 * sw, -3.0, .3, 'fist'], R: [2.9, -5.6 + .2 * sw, .15, card ? 'hold' : 'open', 1] }
        : air ? { L: [-1.2, -6.4, .2, 'open'], R: [2.6, -6.2, .2, 'open', 1] }
        : { L: [2.2, -6.0 + (c.id === 'copy' ? .6 : 0), .25, 'open', 0], R: [2.3, sit ? -4.9 + .5 * wave : -4.4, .25, 'open', 1] };
      const hold = card ? s => { push(); rotate(.95); translate(s * .1, -s * 1.15); rotate(-.12 + .06 * sw); b2LeavingCard(s * 2.3, 'z1lcard', .9); pop(); } : undefined;
      return chDisguised(() => copilot(S.x, S.y, u, { ...o, walk: wph, dy: bob, disguise: true, cheap: c.id === 'copy' ? .75 : 0, rot: run ? .1 : S.rot, pose, hold }));
    }
    if (c.id === 'grok') return grok(S.x, S.y, u, { ...o, walk: run ? ph : null, dy: bob, rot: run ? .08 : S.rot, pose: run ? 'serve' : S.stage === 'down' ? 'wave' : 'shrug', tray: 'canapes' });
    if (c.id === 'muse') return muse(S.x, S.y, u, { ...o, rot: run ? .14 : S.rot, pose: run ? 'tray' : sit ? 'wave' : 'point', tray: 'flutes', dy: run ? .25 * Math.sin(ph * TAU * .5) : 0 });
    return codex(S.x, S.y, u, { ...o, kind: c.id, pose: run ? 'run' : sit ? 'wave' : 'cheer', rot: run ? 0 : S.rot });
  }
  // the heap's bumps: a little burst of strokes off the top of each head as it hits (3 frames), in the riso's red
  const CH_H = { clawd: 8, gem: 5.8, cop: 10.2, copy: 10.2, grok: 8.4, muse: 8.4, codey: 5.0, seedy: 3.95, dog: 4.2 };
  function chBonks(t) {
    for (const c of CHC) {
      const a = t - c.P.tc; if (a < 0 || a > .13) continue;
      const k = a / .13, x = c.P.c[0] - 10, y = c.P.c[1] - CH_H[c.id] * c.u * .96;
      boilSeed('z1bonk' + c.id);
      for (let i = 0; i < 3; i++) { const an = -Math.PI / 2 - .35 - i * .42, r0 = 10 + 26 * k, r1 = r0 + 30 * (1 - k * .7); dline([[x + Math.cos(an) * r0, y + Math.sin(an) * r0], [x + Math.cos(an) * r1, y + Math.sin(an) * r1]], 3.4 * (1 - k * .5), '#E0463A'); }
    }
  }
  // the group, as panel lk sees it (the caller clips to the panel)
  function z1Chase(lk, t) {
    if (t < Z1.split) return;
    if (lk === 'ink') { const f = chF(t); if (f > -20 && f - 11 * CH_BUTLER.u < 500) chButler(t); else if (t >= BUTLER_BACK[0]) chButlerBack(t); return; }
    if (lk === 'doodle') return;   // nothing follows them in
    const [, x0, x1] = PANEL.find(p => p[0] === lk), heap = t >= CH.hit;
    const L = CHC.filter(c => c.in.includes(lk)).map(c => ({ c, S: chState(c, t) }));
    const lane = c => c.ride ? CHB[c.ride.on].gy + .1 : c.gy;   // (a rider draws just after its mount)
    L.sort((a, b) => heap ? a.c.z - b.c.z : lane(a.c) - lane(b.c));
    for (const { c, S } of L) {
      if (S.x + 7 * c.u < x0 || S.x - 7 * c.u > x1) continue;
      push(); translate(S.ax, S.ay); scale(S.sx, S.sy); translate(-S.ax, -S.ay);
      chBot(c, S, t);
      pop();
    }
    if (lk === 'xerox') chBonks(t);
  }
  // the bill (the AI services bill, the card prop Z2 catches) whips in on the last beat: it tumbles in from the top left,
  // flying straight at the lens (so it grows fastest at the end), and slaps flat over it on Z1's last frame, which is
  // exactly Z2's first (bill(960, 540, 2000, 0, 0, sin(tt·17)), its key and seed), so the cut doesn't show. No bills in the
  // good future (the user): in flight it keeps over the past, the present and the bad future, its right edge short of the
  // doodle's seam (at 267.875, its last drawing in flight, 1330 px wide, it reaches x ≈ 1400), and only the slap covers
  // the whole lens. (It flew at the frame's middle, so it crossed the doodle panel for its last three drawings)
  function z1Bill(t, tt) {
    const k = seg(t, ...Z1.bill); if (k <= 0) return;
    const e = easeOut(k), s = 2000 / lerp(8, 1, k), rot = -3.3 * Math.pow(1 - k, 1.5);
    look('card'); boilSeed('z2 billin');
    bill(k < 1 ? lerp(-260, 650, e) : 960, lerp(-240, 540, e), s, rot, 0, Math.sin(tt * 17), 'z2billin');
  }
  SHOT.Z1 = (t, lt, dur) => {
    const tt = mt(t);
    if (tt < Z1.split) {
      // A: close on the doors; they open on the two of them (her in front, him at her shoulder); they step down and run
      const open = clamp(easeOut(seg(tt, ...Z1.doors)), 0, 1), D = TXD();
      camBegin(D.cx + 10, 790, 2.1);
      // They step down from the doorway onto the platform, toward us: not in unison (he goes a drawing after her, heavier,
      // and settles with a sag). While the doors are shut they stand back inside (a little smaller, her bun and his beanie
      // in the door windows); she steps across to the opening as the doors part; in the doorway she's small enough that her
      // bun stays under the door's top. The step: the feet from the doorway's floor down to the platform and a little
      // bigger (nearer), both on one easing, so the head only goes down (it was a jump: the whole figure grew in the
      // doorway, rose 70 px on the hop, her bun past the door's top and the frame's, then dropped 150 px onto the ground
      // off the frame, the last of it in one drawing)
      const jd = { her: 0, him: .09 }, jOf = w => seg(tt, Z1.jump[0] + jd[w], Z1.jump[1] + jd[w]), j = jOf('her'), jM = jOf('him'), e = ease(j), eM = ease(jM), plat = D.T.bot;
      const eH = calmE(emotions(tt, [[Z1.t0 - 1, 'determined', { lookX: 1 }], [Z1.doors[1], 'determined', { lookX: 1, mouth: 'flat' }]], { take: .3 }));
      const eM2 = calmE(emotions(tt, [[Z1.t0 - 1, 'excited', { lookX: 1, mouth: 'grin' }]], { take: .3 }));
      const SC = { her: [.76, .76, .88], him: [.9, .9, 1] };   // (standing back inside, in the doorway, on the platform)
      const bk = ease(seg(tt, Z1.doors[0], Z1.jump[0]));
      const scOf = (w, q) => q > 0 ? lerp(SC[w][1], SC[w][2], q) : lerp(SC[w][0], SC[w][1], bk);
      const walkX = d => 384 * Math.max(0, tt - Z1.jump[1] - d);
      const hx = D.dx + 90 - 26 * (1 - ease(seg(tt, Z1.doors[0] - .05, Z1.doors[1] - .1))) + 150 * e + walkX(0), hy = lerp(D.floor, plat, e);
      const mx = D.dx + 190 + 150 * eM + walkX(jd.him), my = lerp(D.floor, plat, eM);
      const sag = a => a > 0 && a < .3 ? .12 * Math.exp(-a * 12) * Math.cos(a * 24) : 0;   // (his settling)
      const out = j > 0;
      const rk = seg(tt, Z1.jump[1], Z1.split), rkM = seg(tt, Z1.jump[1] + jd.him, Z1.split);
      const her = () => person(hx, hy, 19, HER_C, { ...eH, view: 'q', boilKey: 'z1Aher', walk: rk > 0 ? (tt - Z1.jump[1]) * 2.2 : null, rot: rk > 0 ? .14 * ease(clamp(rk * 6)) : .04 * Math.sin(Math.PI * j), pose: rk > 0 ? null : 'fists', noShadow: true });
      const him = () => person(mx, my, 21, HIM_C, { ...eM2, view: 'q', boilKey: 'z1Ahim', walk: rkM > 0 ? (tt - Z1.jump[1] - jd.him) * 3.4 : null, rot: rkM > 0 ? .14 * ease(clamp(rkM * 6)) : .04 * Math.sin(Math.PI * jM), pose: rkM > 0 ? null : 'fists', sq: (eM2.sq || 0) + sag(tt - Z1.jump[1] - jd.him), noShadow: true });
      // Lit as a lit carriage at night seen from the platform: while they're inside they're dark card silhouettes against
      // its warm light (her line with the bun and the pencil, his block and beanie), seen through the door windows while
      // the doors are shut; backlit in the doorway with a warm rim once they open; the platform's light comes up on their
      // fronts as they step down (a colour grade from the silhouette's dark to their own colours: opaque throughout)
      const DARK = '#2A2231';
      const lit = (fn0, x, y, sc, k, rim) => {
        const fn = () => { push(); translate(x, y); scale(sc); translate(-x, -y); fn0(); pop(); };
        if (rim > 0) { const u = sc * 20, cy = y - 5.2 * u; push(); translate(x, cy); scale(1.05, 1.025); translate(-x, -cy); z1Sil(fn, '#FFF3D4', 255 * rim); pop(); }   // (the rim: the light round their edges)
        if (k <= 0) z1Sil(fn, DARK, 255); else z1Lit(fn, k, DARK);
      };
      const { T, dx, dw } = D, gap = ease(clamp(open)) * dw * .95, rimK = clamp(open * 2.5);
      const herL = () => lit(her, hx, hy, scOf('her', e), e, rimK * (1 - e)), himL = () => lit(him, mx, my, scOf('him', eM), eM, rimK * (1 - eM));
      trainOut(tt, lt, open);
      if (out) { himL(); herL(); }
      else {
        // just inside, behind the doors: seen through the door windows (they slide with the doors) and, as they open, in
        // the doorway, against the vestibule's light
        const wins = [0, 1].map(sd => { const x = dx + sd * dw + (sd ? gap : -gap); return R4(x + 18, T.winY + 6, x + dw - 18, T.winY + 120); });
        clipPoly(gap > 4 ? [...wins, R4(dx + dw - gap, T.winY - 20, dx + dw + gap, T.bot - 84)] : wins, () => {
          look('card'); boilSeed('z1 vest2'); piece(R4(dx - 40, T.winY - 60, dx + 2 * dw + 40, T.bot - 60), '#F2DFA8', { ink: null, key: 'z1vest2', lift: 0, flatCard: true, edge: false }); glow(dx + dw, T.winY + 120, 200, '#FFE2A0', .4);
          himL(); herL();
        });
      }
      camEnd();
      look('card');
      return;
    }
    // B, C: the four panels
    const R = runners(tt);
    for (let i = 0; i < 4; i++) {
      const [lk, x0, x1] = PANEL[i];
      clipTo([R4(x0, -10, x1, H + 10)]);
      panelBack(i, tt);
      look(lk);
      z1Chase(lk, tt);
      look(lk);
      for (const [p, P, o] of R) if (p.x + 5 * p.u > x0 && p.x - 5 * p.u < x1) person(p.x, p.y, p.u, P, o);
      if (lk === 'xerox') xeroxGrit(tt, .5);
      clipEnd();
    }
    // the seams: banknote borders (guilloche bands), the money in every one of them
    // (they print down from the top on the downbeat, like a note going through the press)
    const sp = easeOut(seg(tt, Z1.split, Z1.split + .2)), yb = lerp(-20, H + 20, sp);
    const b0 = { ...BANK }; look('bank');
    for (const [, x0] of PANEL.slice(1)) { boilSeed('z1 seam' + x0); piece(R4(x0 - 10, -20, x0 + 10, yb), '#E8EEE9', { sw: 1.2, key: 'z1seam' + x0 }); for (let k = 0; k < 3; k++) { const P = []; for (let y = -20; y <= yb; y += 8) P.push([x0 + 6 * Math.sin(y / 34 + k * 2.1), y]); for (let q = 0; q < P.length - 1; q += 16) _inkLine(P.slice(q, q + 17), .7, BANK.ink, 'rotring', .3); } }
    Object.assign(BANK, b0);
    z1Bill(t, tt);
    look('card');   // (as Z2 opens)
  };

  // =====================================================================================================================
  // THE TRAIN (Z2–Z4): the chorus's carriage cutaway (window.CHORUS from chorus.js when it's loaded; a stand-in with the
  // same geometry otherwise). Her bay: bay 0, her in the left seat facing right, him across the table facing left.
  // =====================================================================================================================
  const TR = { FY: 932, SY: 790, TY: 690, WT: 280, WW: 540, WH: 303.75, BW: 660, u: 30 };
  const TRC = { wall: '#39333F', wallDk: '#26222B', trim: '#6A6470', sill: '#57515E', floor: '#2A2630', ceil: '#211E26', strip: '#EDEBDC', table: '#B98C5C', tableLt: '#D2A676', tableDk: '#4A4650', night: '#121726' };
  const trWin = i => ({ x: 960 + i * TR.BW - TR.WW / 2, y: TR.WT, w: TR.WW, h: TR.WH });
  const SEAT_H = (TR.FY - TR.SY) / TR.u, HERX = 755, HIMX = 1165;
  function standInBack(t, view) {
    boilSeed('tr night'); piece(R4(-400, -200, W + 400, H + 200), TRC.night, { ink: null, key: 'trnight', lift: 0, flatCard: true, edge: false });
    for (let i = -1; i <= 1; i++) view(t, i, trWin(i));
    boilSeed('tr wall');
    const X0 = -400, X1 = W + 400;
    piece(R4(X0, 60, X1, TR.WT), TRC.wall, { ink: null, key: 'trwalltop', lift: 0, edge: false });
    piece(R4(X0, TR.WT + TR.WH, X1, TR.FY), TRC.wall, { ink: null, key: 'trwallbot', lift: 0, edge: false });
    for (let i = -2; i <= 2; i++) { const x = 960 + (i - .5) * TR.BW; piece(R4(x - (TR.BW - TR.WW) / 2 - 2, TR.WT - 2, x + (TR.BW - TR.WW) / 2 + 2, TR.WT + TR.WH + 2), TRC.wall, { ink: null, key: 'trpil' + i, lift: 0, edge: false }); }
    for (let i = -1; i <= 1; i++) { const w = trWin(i), G = curvy(rrPts(w.x, w.y, w.w, w.h, 40), 3); dline(G.concat([G[0]]), 1.4, mixCol(TRC.wall, '#FFF7EA', .4), 0); const F = curvy(rrPts(w.x - 20, w.y - 20, w.w + 40, w.h + 40, 56), 3); dline(F.concat([F[0]]), 3.4, TRC.trim, 0); piece(R4(w.x - 30, w.y + w.h + 16, w.x + w.w + 30, w.y + w.h + 30), TRC.sill, { sw: 1.2, key: 'trsill' + i, lift: 3 }); }
    piece(R4(X0, -200, X1, 64), TRC.ceil, { ink: null, key: 'trceil', lift: 0, edge: false }); piece(R4(X0, 52, X1, 64), TRC.strip, { ink: null, key: 'trstrip', lift: 0, flatCard: true, edge: false });
    piece(R4(X0, TR.FY, X1, TR.FY + 400), TRC.floor, { ink: null, key: 'trfloor', lift: 0, edge: false });
    for (const [i, sd] of [[0, -1], [0, 1], [-1, 1], [1, -1]]) { const bx = 960 + i * TR.BW + sd * 312, f = sd;
      piece(curvy([[bx - 34 * f, TR.SY + 60], [bx - 34 * f, 440], [bx - 18 * f, 406], [bx + 20 * f, 402], [bx + 34 * f, 440], [bx + 38 * f, TR.SY + 60]], 3), CAR.moq, { sw: 2, shade: CAR.moqDk, depth: 18, key: 'trseat' + i + sd, lift: 5 });
      piece(R4(bx - 44, TR.SY + 50, bx + 44, TR.FY), TRC.wallDk, { sw: 1.4, key: 'trbase' + i + sd, lift: 3 }); }
    for (const i of [-1, 0, 1]) { const x = 960 + i * TR.BW; piece(R4(x - 14, TR.TY + 20, x + 14, TR.FY), TRC.tableDk, { sw: 1.4, key: 'trtl' + i, lift: 3 }); piece(b2RoundPoly(R4(x - 120, TR.TY, x + 120, TR.TY + 22), 9), TRC.table, { sw: 1.8, key: 'trtt' + i, lift: 5 }); }
  }
  function standInFront(t) {
    for (const [i, sd] of [[0, -1], [0, 1], [-1, 1], [1, -1]]) { const bx = 960 + i * TR.BW + sd * 312, f = sd; boilSeed('trcush' + i + sd);
      piece(curvy([[bx + 20 * f, TR.SY - 8], [bx + 214 * f, TR.SY - 4], [bx + 228 * f, TR.SY + 30], [bx + 210 * f, TR.SY + 56], [bx + 20 * f, TR.SY + 56]], 3), CAR.moq, { sw: 1.8, shade: CAR.moqDk, depth: 12, key: 'trc' + i + sd, lift: 4 }); }
  }
  const trainBack = (t, lt, view) => window.CHORUS && CHORUS.carriageBack ? CHORUS.carriageBack(t, lt, { i0: -1, i1: 1, still: true, view, wood: true }) : standInBack(t, view);   // (wood: the ending's train, its tables O1's woodgrain laminate; the chorus's carriages keep theirs)
  const trainFront = (t, lt) => window.CHORUS && CHORUS.carriageFront ? CHORUS.carriageFront(t, lt, { i0: -1, i1: 1 }) : standInFront(t);
  const darkView = (t, bay, r) => { look('card'); boilSeed('trdk' + bay); piece(R4(r.x - 30, r.y - 30, r.x + r.w + 30, r.y + r.h + 30), '#141A2A', { ink: null, key: 'trdk' + bay, lift: 0, flatCard: true, edge: false }); glow(r.x + r.w * .5, r.y + r.h * .7, 120, '#FFB45E', .25); };

  // =====================================================================================================================
  // Z2: the bill, caught, folded, flown back
  // =====================================================================================================================
  const Z2 = { t0: BAR(150), t1: BAR(154), thisW: WF('All that intelligence', 6), you: WF('You get the bunker'), bunker: WF('You get the bunker', 3), I: WF('You get the bunker', 4), billW: WF('You get the bunker', 7),
    same: WF('Same shit, faster'), shit: WF('Same shit, faster', 1), faster: WF('Same shit, faster', 2), what: WF('Same shit, faster', 3) };
  Z2.catch = Z2.t0 + .44;                      // (268.38, on the beat)
  Z2.folds = [Z2.you, Z2.you + .22, Z2.bunker - .12, Z2.bunker + .1];
  Z2.throw = [Z2.bunker + .38, Z2.bunker + .6];   // wind-up, release
  Z2.push = [Z2.throw[1], Z2.throw[1] + .4];   // the camera follows it into the window
  Z2.inB = Z2.push[1];                         // the bunker, full frame
  Z2.knock = Z2.inB + .3, Z2.slot = Z2.billW;
  // --- the bill folding into a plane, in her hands (card). s = the bill's width; stage 0..4 (0 the flat bill, 4 the plane) ---
  function planeFold(x, y, s, stage, a = 0, key = 'z2p') {
    push(); translate(x, y); rotate(a);
    const h = s * 1.3, w = s / 2, st = Math.floor(stage), RED = typeof AIBILL !== 'undefined' ? AIBILL.band : '#C8463A', CREAM = NOIR.cream;   // (the band: the AI bill's header)
    if (st <= 0) bill(0, 0, s, 0, 0, 0, key);
    else if (st === 1) { piece([[-w * .5, -h / 2], [w * .5, -h / 2], [w * .5, h / 2], [-w * .5, h / 2]], CREAM, { sw: 1.2, shade: '#C9BFAE', depth: 6, key: key + '1', lift: 5 }); piece([[-w * .45, -h * .42], [w * .45, -h * .42], [w * .45, -h * .3], [-w * .45, -h * .3]], RED, { ink: null, key: key + '1r', flatCard: true, lift: 0 }); dline([[0, -h / 2], [0, h / 2]], 1, '#A89C88'); }
    else if (st === 2) { piece([[0, -h / 2], [w * .5, -h * .22], [w * .5, h / 2], [-w * .5, h / 2], [-w * .5, -h * .22]], CREAM, { sw: 1.2, shade: '#C9BFAE', depth: 6, key: key + '2', lift: 5 }); piece([[-w * .45, -h * .1], [w * .45, -h * .1], [w * .45, 0], [-w * .45, 0]], RED, { ink: null, key: key + '2r', flatCard: true, lift: 0 }); dline([[0, -h / 2], [-w * .5, -h * .22]], .9, '#A89C88'); dline([[0, -h / 2], [w * .5, -h * .22]], .9, '#A89C88'); }
    else if (st === 3) { piece([[0, -h / 2], [w * .3, -h * .1], [w * .3, h / 2], [-w * .3, h / 2], [-w * .3, -h * .1]], CREAM, { sw: 1.2, shade: '#C9BFAE', depth: 5, key: key + '3', lift: 5 }); piece([[-w * .26, h * .05], [w * .26, h * .05], [w * .26, h * .16], [-w * .26, h * .16]], RED, { ink: null, key: key + '3r', flatCard: true, lift: 0 }); dline([[0, -h / 2], [0, h / 2]], 1, '#A89C88'); }
    else paperPlane(0, 0, h * 1.05, -Math.PI / 2, 0, key);
    pop();
  }
  // a paper plane made from the bill (card): nose along +x (after rotate a), len px; the red band shows on the wing
  function paperPlane(x, y, len, a = 0, roll = 0, key = 'z2plane') {
    push(); translate(x, y); rotate(a);
    const s = len, r = .38 * (1 + roll), r2 = .38 * (1 - roll);
    const up = [[s * .5, 0], [-s * .5, -r * s], [-s * .38, -.02 * s]], lo = [[s * .5, 0], [-s * .38, .02 * s], [-s * .5, r2 * s]];
    piece(lo, '#E3DCCB', { sw: 1.4, key: key + 'lo', lift: 6 });
    piece(up, NOIR.cream, { sw: 1.4, key: key + 'up', lift: 7 });
    piece([[-s * .3, -r * s * .62], [-s * .12, -r * s * .44], [-s * .16, -r * s * .36], [-s * .34, -r * s * .54]], typeof AIBILL !== 'undefined' ? AIBILL.band : '#C8463A', { ink: null, key: key + 'band', lift: 0, flatCard: true });
    if (typeof aiSparkle === 'function') aiSparkle(-s * .23, -r * s * .49, s * .035, AIBILL.spark, key + 'spark');   // (the AI bill's sparkle, on the wing)
    piece(oval(s * .02, -r * s * .2, s * .07, s * .07, 0, 12), '#C8463A', { ink: null, op: 220, key: key + 'stamp', lift: 0, flatCard: true });
    dline([[s * .5, 0], [-s * .44, 0]], 1.1, '#A0A6AE');
    pop();
  }
  // the plane in the engraved world (the media rule: a figure takes the medium of the place it's in): printed like the
  // bunker's cast, its band and sparkle their colour in the lines. It used to stay card all the way to the slot
  function planeEngraved(x, y, len, a, roll, key) {
    const b0 = { ...BANK }; look('bank');
    try { Object.assign(BANK, { cap: 1, colour: .6, ow: 1.25 }); bankFigure(() => paperPlane(x, y, len, a, roll, key)); } finally { Object.assign(BANK, b0); }
  }
  // the carriage's window onto the bunker (bay 0's, as the carriage draws it: the chorus's geometry, trWin): its glass,
  // the engraved world's edge
  const Z2W = { glass: () => { if (window.CHORUS && CHORUS.GLASS) return CHORUS.GLASS(0); const w = trWin(0); return rrPts(w.x, w.y, w.w, w.h, 40); } };   // (the chorus train's glass outline: the same shape its view is clipped to)
  // --- part A: the table ---
  // Her near hand (L) holds the paper from the catch to the release, and it's drawn in that hand (hand()'s hold: between
  // the palm and the thumb), so it goes where the hand goes: pinched, the thumb in front and the fingers behind. (It was
  // drawn over her at a place of its own that her arm couldn't reach: the bill floated above her fist, then sat on her
  // knuckles with no finger on it; the plane sat on her chin, ahead of her hand.) Her shoulder is at about (724, 676) and
  // her arm reaches 163 px: every key below is in reach, so the hand is where its key says.
  const HER_HOLD = (.08 + .85 * HER_C.body.hand) * TR.u;   // (a hand's hold point: from its wrist along the hand, px)
  let Z2CA = null;   // (the carriage's camera, as an affine: the paper in her hand is drawn in world coords through it)
  function z2Her(t, held = false) {
    const e = calmE(emotions(t, [[Z2.t0 - 1, 'determined', { lookX: .2, lookY: -.3 }], [Z2.catch - .05, 'surprised', { lookX: .1, lookY: -.4 }], [Z2.thisW - .1, 'smug', { lookX: 1, lookY: 0, mouth: 'smirk' }],
      [Z2.you, 'determined', { lookX: .3, lookY: .5, mouth: 'flat' }], [Z2.throw[0] - .1, 'determined', { lookX: 1, lookY: -.7, mouth: 'flat' }]], { take: .35 }));
    // hands: the catch (up, out to her right), the bill shown to him, folding in front of her, the plane aimed and thrown at
    // the window
    const hU = (x, y) => [(x - HERX) / TR.u, (y - TR.FY) / TR.u];
    // (the throw is one-handed, a flick from the chest, like a dart: the plane held at chest height, drawn back a little,
    // pushed out and up, so it rises into the window across its lower edge; her other hand goes back to her hip. Both
    // hands used to be up in front of her, and at the release her forearms crossed in an X, one hand lost behind the
    // other's cuff; before that the wind-up lifted her hand over her eye)
    const cp = hU(875, 640), show = hU(872, 660), fold = hU(825, 688), foldR = hU(875, 688), aim = hU(820, 705), wind = hU(795, 712), rel = hU(875, 652);
    const hip = [.6, 1, .4, 'relax', 0, Math.PI - .6];   // (her far hand on her hip: behind her, the elbow out past her side; drawn over her, its upper arm crossed her near arm in an X)
    const keys = [[Z2.t0 - 1, 0, { L: [-.4, 1.0, .4, 'relax', 1, .6], R: hip }],
      [Z2.catch - .2, .18, { L: [cp[0], cp[1], .2, 'relax', 1, -1.35, 'u'], R: hip }],
      [Z2.thisW - .15, .2, { L: [show[0], show[1], .3, 'relax', 1, -1.1, 'u'], R: hip }],
      [Z2.you - .05, .2, { L: [fold[0], fold[1], .3, 'hold', 1, -.9, 'u'], R: [foldR[0], foldR[1], .3, 'hold', 1, -2.25, 'u'] }],   // (folding it in front of her, over the table's end: her elbows down at her sides, the forearms up to its lower corners. The hands were up at her chin, the far arm's elbow out on the table beyond them: a Z)
      [Z2.throw[0] - .25, .15, { L: [aim[0], aim[1], .3, 'relax', 1, -1.3, 'u'], R: hip }],
      [Z2.throw[0], .12, { L: [wind[0], wind[1], .3, 'relax', 1, -1.2, 'u'], R: hip }],
      [Z2.throw[1] - .04, .1, { L: [rel[0], rel[1], .1, 'open', 1, -1.0, 'u'], R: hip }]];
    const o = { ...e, view: 'q', seated: true, seatH: SEAT_H, boilKey: 'z2her', noShadow: true, pose: poseTrack(t, keys, backOut, HER_C, { seated: true, seatH: SEAT_H, view: 'q' }) };
    if (held) o.holdL = () => inWorld(Z2CA, g => { const P = paperAt(t, g); look('card'); boilSeed('z2 paper'); if (P.stage < 4) planeFold(P.x, P.y, P.s, P.stage, P.a, 'z2fold'); else paperPlane(P.x, P.y, P.s * 1.4, P.a, 0, 'z2plane'); });
    return o;
  }
  // Draw fn in world coords from inside a rig's transform (a hand's hold): CA, the world's affine (curAffine() under the
  // camera); fn gets the rig's local origin there, in world coords
  function inWorld(CA, fn) {
    const [, , , , e, f] = curAffine(), [A, B, C, D, E, F] = CA, det = A * D - B * C;
    const g = [(D * (e - E) - C * (f - F)) / det, (-B * (e - E) + A * (f - F)) / det];
    flushBrush(); push(); resetMatrix(); applyMatrix(A, B, C, D, E, F);
    try { fn(g); } finally { flushBrush(); pop(); }
  }
  // her hand's hold point at t, from its key (world; the rig puts the wrist on the key when it's in reach)
  function herGrip(t) { const L = z2Her(t).pose.L; return [HERX + L[0] * TR.u + Math.cos(L[5]) * HER_HOLD, TR.FY + L[1] * TR.u + Math.sin(L[5]) * HER_HOLD]; }
  // The paper in her hand at t (catch ≤ t < release), world coords, with the hand's hold point at g: { x, y, s, stage, a }.
  // The bill pinched at the middle of its lower edge; for the folds, at the fold's place between her two hands (as it was),
  // blended there from the pinch as the hands go to it; the plane, once made, by its keel's lower edge, her hand under it
  function paperAt(t, g) {
    const s = 66, st = t < Z2.folds[1] ? 0 : t < Z2.folds[2] ? 1 : t < Z2.folds[3] ? 2 : t < Z2.throw[0] - .25 ? 3 : 4;
    const w = st < 4 ? ease(seg(t, Z2.you - .05, Z2.you + .15)) : 0;   // (the plane's made in her hand: it's there, pinched, from the first drawing)
    const len = s * 1.4, A = st < 4 ? lerp(-.3, .12, ease(seg(t, Z2.thisW - .15, Z2.thisW + .05))) : -.45 - .45 * ease(seg(t, Z2.throw[0], Z2.throw[1]));
    const gp = st < 4 ? [0, .65 * s - 5] : [-.1 * len, .2 * len], c = Math.cos(A), sn = Math.sin(A);   // (the plane by its keel's lower edge, her hand under it: the wrist and cuff clear of it)
    const x = g[0] - (gp[0] * c - gp[1] * sn), y = g[1] - (gp[0] * sn + gp[1] * c);
    return { x: lerp(x, 850, w), y: lerp(y, 634, w), s, stage: st, a: lerp(A, 0, w) };   // (the fold's place: its lower corners in her two hands)
  }
  function z2Him(t) {
    const e = calmE(emotions(t, [[Z2.t0 - 1, 'surprised', { lookX: 1, lookY: -.4 }], [Z2.catch + .15, 'happy', { lookX: 1, lookY: -.1, mouth: 'grin' }], [Z2.thisW + .1, 'smug', { lookX: 1, mouth: 'grin' }],
      [Z2.throw[1] + .1, 'excited', { lookX: .2, lookY: -.8, mouth: 'grin' }]], { take: .3 }));
    return { ...e, view: 'q', flip: true, seated: true, seatH: SEAT_H, boilKey: 'z2him', noShadow: true, pose: PPOSE.lap };
  }
  // the bill / the plane in part A, in world coords: returns { x, y, s, stage, a } (in her hand: paperAt, through her
  // hand's key; drawn, it's in the hand itself)
  function z2Paper(t) {
    if (t < Z2.catch) { const k = easeIn(seg(t, Z2.t0, Z2.catch)), C = paperAt(Z2.catch, herGrip(Z2.catch)); return { x: lerp(960, C.x, k), y: lerp(540, C.y, k), s: lerp(1400, 66, Math.pow(k, .45)), stage: 0, a: lerp(0, C.a, k), screen: k < .02 }; }
    if (t < Z2.throw[1]) return paperAt(t, herGrip(t));
    // out of her hand, up into the window across its lower edge (Z2W.glass: the engraved world's edge), arcing over to
    // dive left at the tower, as the bunker's first stretch of its flight begins (planeB: pointing down to the left)
    // (out and forward first, climbing slowly, so the glass's edge is seen passing through it over two drawings; then up,
    // settling where the bunker's flight picks it up; it leaves from where her hand let go of it)
    const k = seg(t, Z2.throw[1], Z2.inB), e = ease(k), R0 = paperAt(Z2.throw[1] - .001, herGrip(Z2.throw[1])), q = 1 - ease(Math.min(1, k * 1.6));
    return { x: 955 + 5 * k + 55 * Math.sin(Math.PI * e) + (R0.x - 955) * q, y: 628 - 208 * e + (R0.y - 628) * q, s: lerp(66, 46, k), stage: 4, a: lerp(-.9, -3.7, e), fly: k };
  }
  // --- part B: the bunker (the chorus's banknote bunker) ---
  // the door's slot: shut (doorLt 1.0) until "Same shit, faster", then the chorus's feed sequence, fast
  const doorLt = t => t < Z2.same - .3 ? 1 : kf(t, [[Z2.same - .3, 2.14], [Z2.same - .12, 2.3], [Z2.same, 2.57], [Z2.same + .25, 2.95], [Z2.same + .33, 3.0], [Z2.what - .1, 3.43], [Z2.t1, 4.12]], x => x);
  // the banquet's own clock: the clink lands just after the plane has gone (they carry on), the staff look round at the lamp
  const castLt = t => t < Z2.slot + .5 ? 1.28 + (t - (Z2.slot + .5)) : kf(t, [[Z2.slot + .5, 1.28], [Z2.same - .25, 2.14], [Z2.t1, 3.4]], x => x);
  // the bunker camera: on the tower as the plane comes in, across with it to the door, then back to take in the table
  // (the plane's stretch as it was; then, the bill slotted, it pulls back through "Same shit" to the whole grand hall: the
  // banquet at its biggest carrying on while the slot spits the bills back out). Held still once it's out: a 2% creep on
  // over the last 2.5 s re-drew the hall's every line a fraction of a pixel a frame (the bank look's ground doesn't redraw)
  const bkCamZ = t => { const k = kf(t, [[Z2.inB, [900, 530, 1.3]], [Z2.slot, [1010, 535, 1.26]], [Z2.slot + .12, [1010, 535, 1.26]], [Z2.same - .15, [752, 470, .86]], [Z2.t1, [752, 470, .86]]], ease); return { cx: k[0], cy: k[1], zoom: k[2] }; };
  function z2Coupe(x, y, w, fill, key) {   // (x, y) = its foot; w = the bowl's width
    const h = w * .76, bw = w / 2, rim = y - h;
    piece(curvy([[x - bw * .45, y], [x + bw * .45, y], [x + bw * .12, y - h * .12], [x - bw * .12, y - h * .12]], 2), '#9AB4B4', { sw: 1.6, key: key + 'f' });
    piece([[x - bw * .08, y - h * .1], [x + bw * .08, y - h * .1], [x + bw * .07, y - h * .55], [x - bw * .07, y - h * .55]], '#9AB4B4', { sw: 1.3, key: key + 's' });
    const bowl = []; for (let k = 0; k <= 12; k++) { const a = k / 12 * Math.PI; bowl.push([x + Math.cos(a) * bw, rim + Math.sin(a) * h * .5]); }
    piece(bowl, '#B8CCCC', { sw: 2, key: key + 'b' });
    if (fill > .02) { const P = []; for (let k = 0; k <= 10; k++) { const a = k / 10 * Math.PI; P.push([x + Math.cos(a) * bw * .88, rim + 3 + Math.sin(a) * (h * .5 - 4) * fill]); } piece(P, '#D2A83A', { sw: 1, key: key + 'w' }); }
  }
  // the grand hall's table (bunker.js BQ[2]'s spread), Grok's coupe tower drawn here: its top glass gone once the plane
  // has clipped it (all the glasses printed darker, so they read in the engraving)
  function z2Table(t, lt, knocked) {
    const g0 = [BKC.glass, BKC.wine]; BKC.glass = '#7FA0A2'; BKC.wine = '#C09A3A';
    try {
      bqTable(t, lt, 2, { tower: () => {
        const [tx, ty] = BUNKER.tower, W2 = 44, H2 = W2 * .76;
        boilSeed('bk tower');
        piece(oval(tx, ty + 2, 72, 7, 0, 24), BKC.silver, { sw: 1, shade: BKC.silverDk, depth: 3, key: 'bktwtray', lift: 2 });
        [[3, 0], [2, 1], [1, 2]].forEach(([n, r]) => { if (r === 2 && knocked) return; for (let i = 0; i < n; i++) z2Coupe(tx + (i - (n - 1) / 2) * W2 * 1.02, ty - r * H2 + (r ? 3 : 0), W2, .7, 'z2cp' + r + i); });
      } });
    } finally { [BKC.glass, BKC.wine] = g0; }
  }
  // the top coupe: knocked off the tower, tumbling, caught by Grok's free hand (it keeps pouring)
  const CATCH = [488, 640];
  function coupeAt(t) {
    const [tx, ty] = BUNKER.tower, top = [tx, ty - 2 * 27.4 + 3];
    if (t < Z2.knock) return null;
    const k = seg(t, Z2.knock, Z2.knock + .45);
    if (k < 1) return { x: lerp(top[0], CATCH[0], k), y: lerp(top[1], CATCH[1], k) - 80 * Math.sin(Math.PI * k), rot: -3.2 * k, spill: 1 - k };
    const up = ease(seg(t, Z2.knock + .6, Z2.knock + .95));   // caught, righted, and held up: saved
    return { x: CATCH[0], y: CATCH[1] + 4 * Math.max(0, spring(t, Z2.knock + .45, 7, 30)) - 30 * up, rot: -3.2 * (1 - ease(seg(t, Z2.knock + .5, Z2.knock + .8))), spill: 0, caught: true, up };
  }
  // (engraved as the chorus's bankBunker: the back capped light, the cast a touch denser; dens: the engraving's screen
  // scale, so a small printing inside the window keeps its line spacing on screen)
  function bunkerWorld(t, dens = 1, ext = [-372, -200, W + 80, H + 80], vis = null) {   // (vis: only this much of it is seen, world rect: its ground is printed there alone)
    const lt = castLt(t), dl = doorLt(t), tt = mt(t), knocked = t >= Z2.knock;
    const b0 = { ...BANK }; look('bank');
    try {
      // the grand hall's cast (bunker.js bqCast, BQ[2]), with Grok's free hand going out for the glass, and the staff under
      // the plane's flight line reacting as it goes over (Copilot ducks with its dome, the others look up and after it)
      const C = coupeAt(t);
      const grokCatch = gk => { if (C) { const cy = C.y + 14; gk.pose = { ...GPOSE.pour, L: [(CATCH[0] - BUNKER.grok[0]) / BUNKER.grok[2] - .3, (cy - BUNKER.grok[1]) / BUNKER.grok[2] + .8, .3, C.caught ? 'hold' : 'open', 1] }; gk.lookX = .5; gk.lookY = -.3; if (C.caught && t > Z2.knock + .7) Object.assign(gk, { eyes: 'happy', mouth: 'smile' }); } };
      const tweak = (f, op) => {
        const tp = planePass(f.x); if (tp == null) return op;
        const a = t - tp, k = seg(a, -.14, 0) * (1 - seg(a, .12, .45)), after = ease(seg(a, 0, .2)) * (1 - seg(a, .5, .9));
        if (f.who === 'copilot') return { ...op, dy: (op.dy || 0) + .7 * k, sq: (op.sq || 0) + .22 * k, eyes: k > .3 ? 'closed' : op.eyes, lookX: -.8 * after };
        return { ...op, lookY: lerp(op.lookY ?? 0, -.9, k), lookX: lerp(op.lookX ?? 0, f.flip ? -1 : 1, after), take: (op.take || 0) + .3 * k };
      };
      // (worked out once, before the hall: each figure's options this frame (bunker.js bqPlan) place its vignette and draw
      // it, so the halos follow the diners and staff: the laugh's lean, the hover, Copilot's duck)
      const castO = { grok: grokCatch, tweak }, plan = bqPlan(tt, lt, 2, castO);
      bkHalos(2, 1, [], { plan });   // (bank: the paper's and the hall's lines end in a vignette round each figure: the grand hall's, bqHaloOvals(2))
      { const v = vis || bkView(60) || [-390, -220, W + 100, H + 110]; bankPaper(v[0], v[1], v[2] - v[0], v[3] - v[1]); }   // (what the camera sees: its lines sit on the page's grid)
      Object.assign(BANK, { cap: .4, dens: 1.1 * dens, colour: .45 });   // (the hall: a light background layer)
      bunkerBack(tt, dl, { k: 2, ext, cull: true });   // (the grand hall: the nave beyond the chancel; the wall out to the pull-back's widest frame, or the carriage's neighbouring windows)
      bankVignetteEnd();   // (the cast, over bare paper)
      Object.assign(BANK, { cap: b0.cap, dens: 1.1 * dens, colour: .6, ow: 1.25 });   // (the cast: full tone, bold outlines)
      const onTable = () => {
        if (C) {
          boilSeed('z2 coupe');
          const sv = { cap: BANK.cap, colour: BANK.colour, g: BKC.glass, w: BKC.wine }; Object.assign(BANK, { cap: 1, colour: 1 }); BKC.glass = '#7FA0A2'; BKC.wine = '#C09A3A';
          push(); translate(C.x, C.y); rotate(C.rot); z2Coupe(0, 20, 52, C.caught ? .6 : .7 * (1 - seg(t, Z2.knock, Z2.knock + .3)), 'z2cpf'); pop();
          if (!C.caught) for (let i = 0; i < 3; i++) dline([[C.x + 30 + i * 10, C.y - 30 + i * 16], [C.x + 70 + i * 14, C.y - 50 + i * 16]], 1.6, BANK.ink);   // (its tumble)
          if (C.caught && C.up > 0 && C.up < 1) for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; dline([[C.x + Math.cos(a) * 44, C.y - 20 + Math.sin(a) * 44], [C.x + Math.cos(a) * (60 + 20 * C.up), C.y - 20 + Math.sin(a) * (60 + 20 * C.up)]], 1.8, BANK.ink); }   // saved
          Object.assign(BANK, { cap: sv.cap, colour: sv.colour }); BKC.glass = sv.g; BKC.wine = sv.w;
        }
      };
      bqCast(tt, lt, 2, { ...castO, plan, table: () => z2Table(tt, lt, knocked), onTable });
    } finally { Object.assign(BANK, b0); }
  }
  // when the plane goes over world x on its way across to the door (song time), or null (it doesn't pass there)
  function planePass(x) {
    const X = [610, 900, 1380, BUNKER.slot[0] - 30], K = [Z2.knock, Z2.knock + .15, Z2.slot - .1, Z2.slot];
    for (let i = 0; i < 3; i++) if (x >= X[i] && x <= X[i + 1]) return lerp(K[i], K[i + 1], (x - X[i]) / (X[i + 1] - X[i]));
    return null;
  }
  // the plane's flight through the bunker (world coords of the bunker): from the window (the lens) down over the coupe
  // tower (clipping its top glass), across between the diners and into the letterbox on "bill"
  function planeB(t) {
    const c0 = bkCamZ(Z2.inB), P = [[c0.cx, c0.cy - 60, 150], [610, 650, 110], [900, 560, 100], [1380, 590, 80], [BUNKER.slot[0] - 30, BUNKER.slot[1], 60]];
    const K = [Z2.inB, Z2.knock, Z2.knock + .15, Z2.slot - .1, Z2.slot];
    if (t < K[0] || t > K[4] + .05) return null;
    let i = 0; while (i < K.length - 2 && t >= K[i + 1]) i++;
    const k = seg(t, K[i], K[i + 1]), e = i === 0 ? easeIn(k) : k, a = P[i], b = P[i + 1];
    const x = lerp(a[0], b[0], e), y = lerp(a[1], b[1], e), s = lerp(a[2], b[2], e), ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    return { x, y, s: t > K[4] ? 0 : s, a: ang };
  }
  // extra bills, spat out faster and faster: song time they leave the slot
  const MORE = () => [Z2.shit + .05, Z2.faster + .05, Z2.what - .25];
  function moreBills(t, cam) {
    for (const [j, t0] of MORE().entries()) {
      const k = seg(t, t0, t0 + .7); if (k <= 0 || k >= 1) continue;
      const [sx, sy] = BUNKER.slot, e = easeIn(k), tgt = [cam.cx + (j - 1) * 380, cam.cy - 200 + j * 120];
      boilSeed('z2more' + j);
      bill(lerp(sx, tgt[0], e), lerp(sy + 40, tgt[1], e) - 80 * Math.sin(Math.PI * k), lerp(96, 900, Math.pow(k, 2)), Math.sin(t * 11 + j) * .5, 0, Math.sin(t * 17 + j), 'z2m' + j);
    }
  }
  function bunkerFrame(t, tc = t) {   // (t: the drawing's time, on twos; tc: the camera's, song time: on ones)
    const cam = bkCamZ(tc);
    camBegin(cam.cx, cam.cy, cam.zoom);
    bunkerWorld(t);
    const p = planeB(t);
    if (p && p.s > 0) { boilSeed('z2 planeB'); planeEngraved(p.x, p.y, p.s, p.a + .1 * Math.sin(t * 13), .2 * Math.sin(t * 7), 'z2planeB'); }   // (engraved, like everything in the bunker)
    // the flap bangs open for it and shut behind it
    if (t > Z2.slot - .12 && t < Z2.slot + .35) {
      const [sx, sy] = BUNKER.slot, k = t < Z2.slot ? seg(t, Z2.slot - .12, Z2.slot - .04) : 1 - seg(t, Z2.slot + .08, Z2.slot + .18);
      look('bank'); boilSeed('z2 flap');
      piece(R4(sx - 62, sy - 6, sx + 62, sy + 7), NOIR.ink, { sw: .9, key: 'z2slot', lift: 0, flatCard: true });
      if (k > .1) piece(R4(sx - 66, sy - 8 - 20 * k, sx + 66, sy - 8), BKC.brassDk, { sw: 1.1, key: 'z2flap', lift: 2, flatCard: true });
    }
    look('bank');
    moreBills(t, cam);
    camEnd();
    billBack(tc, cam);
  }
  // The first bill the slot feeds back out, swooping at the lens until it covers it: hers, the AI services bill she
  // folded (bill()'s 'z2b' key: BILL_AI), engraved here. Its path is the chorus's feed (bkBillPath), on ones (a
  // full-frame sheet stepping on twos read as a laggy camera); over its last .3 s it eases onto Z3's first frame (its
  // header at the top of the frame, level: tableBill at BILL.t0), so across the cut only the look changes under it. (It
  // was the banquet's receipt, short of covering the lens, then a different bill in a different place across the cut.)
  function billBack(tc, cam) {
    const p = bkBillPath(doorLt(tc), cam); if (!p.free) return;
    const q = ease(seg(tc, Z2.t1 - .3, Z2.t1 - 1 / 24)), tt = mt(tc);
    const x = lerp((p.x - cam.cx) * cam.zoom + W / 2, 960, q), y = lerp((p.y - cam.cy) * cam.zoom + H / 2, -40 + 1.3 * BILL.S0 / 2, q);
    const S = Math.exp(lerp(Math.log(p.s * cam.zoom), Math.log(BILL.S0), q));
    look('bank'); boilSeed('bk bill'); bill(x, y, S, lerp(p.rot, 0, q), 0, lerp(p.flap, .5 * Math.sin(tt * 20), q), 'z2bback');
  }
  SHOT.Z2 = (t, lt, dur) => {
    const tt = mt(t);
    if (tt >= Z2.inB) { bunkerFrame(tt, t); look('bank'); return; }
    // part A: the table (card), the bunker in the window; the push into the window follows the plane (on ones)
    const pk = ease(seg(t, ...Z2.push)), w0 = trWin(0), zEnd = W / w0.w;
    const cam = { cx: lerp(960, w0.x + w0.w / 2, pk), cy: lerp(560, w0.y + w0.h / 2, pk), zoom: Math.exp(lerp(Math.log(1.9), Math.log(zEnd), pk)) };
    look('card');
    camBegin(cam.cx, cam.cy, cam.zoom);
    // The bunker outside, as it will be when we get there: bay 0's window shows exactly the frame we push into (16:9); the
    // windows either side show the same engraved world carried on past it (each through its own camera, shifted by the
    // windows' pitch, so it runs on continuously behind the pillars), each clipped to its own window. (Bay 0's drawing
    // ran on unclipped into the next window along, and stopped at a hard vertical edge inside that pane, the night
    // beyond it: the user saw it at 268.2-268.6)
    const view = (t2, bay, r) => {
      const c = bkCamZ(Z2.inB), s = r.w / W, zs = s * cam.zoom, C0 = CAM;   // (the carriage's camera, put back after the window's own: the puppets after it are placed relative to it (nudge), not re-nudged every frame of the push)
      // (a neighbour's ground is printed only where the frame sees its window: the frame's edges, carriage world → its window's
      // screen → the bunker world through its camera; a whole neighbouring hall per frame tripled the frame's cost)
      const cx = c.cx + bay * TR.BW / (s * c.zoom), hw = W / 2 / cam.zoom, hh = H / 2 / cam.zoom;
      const X0 = Math.max(r.x, cam.cx - hw), X1 = Math.min(r.x + r.w, cam.cx + hw), Y0 = Math.max(r.y, cam.cy - hh), Y1 = Math.min(r.y + r.h, cam.cy + hh);
      if (X1 <= X0 || Y1 <= Y0) return;
      const toB = (X, Y) => [cx + ((X - r.x) / s - W / 2) / c.zoom, c.cy + ((Y - r.y) / s - H / 2) / c.zoom], m = 40;
      const [bx0, by0] = toB(X0, Y0), [bx1, by1] = toB(X1, Y1), vis = bay ? [bx0 - m, by0 - m, bx1 + m, by1 + m] : null;
      clipPoly(window.CHORUS && CHORUS.GLASS ? CHORUS.GLASS(bay) : R4(r.x - 6, r.y - 6, r.x + r.w + 6, r.y + r.h + 6), () => {   // (each window's own glass, the carriage's clip)
        push(); translate(r.x, r.y); scale(s);
        camBegin(cx, c.cy, c.zoom);
        // (a neighbour's hall: only the guests, diners, staff and table things it can see; the rest of the grand hall's cast
        // is drawn in bay 0's window, and the same figures carry on across the pillar)
        const L0 = BQ[2], inV = (x0, x1 = x0) => !vis || (x1 > vis[0] - 260 && x0 < vis[2] + 260);
        // (and not the nave: it's seen only through the chancel arch, in the middle of bay 0's picture)
        const nave0 = window.bqNave;
        if (vis) { BQ[2] = { ...L0, cast: L0.cast.filter(f => inV(f.x)), rows: L0.rows.filter(r => inV(r.x0, r.x1)), spread: L0.spread.filter(([, x]) => inV(x)) }; window.bqNave = () => {}; }
        try { bunkerWorld(Math.max(tt, Z2.inB - .5), Math.min(1, zs / c.zoom * 1.15), vis || undefined, vis); } finally { BQ[2] = L0; window.bqNave = nave0; }
        camEnd();
        CAM = C0;
        pop();
      });
      look('card');
    };
    trainBack(tt, lt, view);
    const lens = t < Z2.catch, P = z2Paper(Math.max(tt, Z2.catch)), held = !lens && P.fly == null;   // (from the catch to the release it's in her hand: drawn by it)
    Z2CA = curAffine();
    person(HERX, TR.FY, TR.u, HER_C, z2Her(tt, held));
    person(HIMX, TR.FY, TR.u, HIM_C, z2Him(tt));
    trainFront(tt, lt);
    boilSeed('z2 paper');
    if (!lens && !held) {   // thrown: card this side of the window's glass, engraved through it (the glass is the engraved world's edge)
      const G = Z2W.glass();
      clipPoly([R4(-4000, -4000, 6000, 6000), G], () => { look('card'); boilSeed('z2 paper'); paperPlane(P.x, P.y, P.s * 1.4, P.a, 0, 'z2plane'); });   // (even-odd: outside the glass)
      clipPoly(G, () => { boilSeed('z2 paper'); planeEngraved(P.x, P.y, P.s * 1.4, P.a, 0, 'z2plane'); });
      look('card');
    }
    camEnd();
    // the bill falling away from the lens to her hand, over everything: one bill (the carriage's copy was drawn too until
    // the catch), on ones like Z1's whip at the lens (a full-frame sheet stepping on twos read as a laggy camera); it
    // flaps on twos. (It falls away at once: a cubic start held a flat white frame, two jumps)
    if (lens) { const k = Math.pow(seg(t, Z2.t0, Z2.catch), 2), H0 = z2Paper(Z2.catch); boilSeed('z2 billin'); bill(lerp(960, (H0.x - cam.cx) * cam.zoom + W / 2, k), lerp(540, (H0.y - cam.cy) * cam.zoom + H / 2, k), lerp(2000, 66 * cam.zoom, Math.pow(k, .5)), lerp(0, H0.a, k), 0, Math.sin(tt * 17) * (1 - k), 'z2billin'); }
    look('card');
  };

  // =====================================================================================================================
  // THE NOTEBOOK (Z3, Z4): hers, open on the train table, close (the chorus's notebook: a slate cover, ruled pages, the
  // spiral down the middle). World = screen at zoom 1 here. The right-hand page is 16:9; its doodles are drawn in a
  // 1920 × 1080 page frame mapped onto it (the doodle look's own paper).
  // =====================================================================================================================
  const NB = { cover: '#3A4A6A', coverDk: '#2A3650', coil: '#9A9EA6', table: '#B98C5C', tableDk: '#8C6238' };
  // The table: the train's woodgrain laminate, O1's (the user: one train, one table): honey-toned, its grain running across in
  // long wavering lines, a few knots. In nb at O1's scale (its page 830 px wide, nb's 1060: × 1.28), on one fixed grid over
  // the whole table, drawn in one pass over every piece of its top (so it runs on unbroken from one to the next, the same
  // lines every frame; card: they never boil). It was a grey top with a few straight lines
  const WOOD = { top: NB.table, mid: '#A77A4C', dk: NB.tableDk, lt: '#D2A676', edge: '#6E4A2A', knots: [[-980, 1010, 26], [1330, 1030, 20]] };
  // (lw: the lines' weight; the wide shot draws the table at .3, so its lines are drawn heavier there, to print about as
  // O1's do on screen: at their own weight they fell below a pixel, and the knots were left alone, like stray marks. nbTable
  // sets it from the camera's scale, so it changes smoothly through the tilts, and not at their switches)
  function woodGrain(lw = 1) {
    const k = 1.28, X0 = -1500, X1 = 2900, Y0 = -620, Y1 = 1960;
    for (let i = 0; ; i++) {
      const yb = Y0 + i * 38 * k + 14 * k * hash(i); if (yb > Y1) break;
      const P = []; for (let x = X0; x <= X1; x += 60 * k) P.push([x, yb + 7 * k * Math.sin(x / k * .004 + i * 1.7) + 4 * k * Math.sin(x / k * .011 + i)]);
      for (let j = 0; j + 1 < P.length; j += 8) dline(P.slice(j, j + 9), (.8 + .7 * hash(i + 9)) * k * lw, hash(i * 3.3) < .4 ? WOOD.dk : WOOD.mid, .5);   // (in lengths: a whole line's spline came out empty in the wide)
    }
    for (const [kx, ky, kr] of WOOD.knots) for (const [a, b, w] of [[2.2, .7, 1], [1.2, .35, .8]]) { const O = oval(kx, ky, kr * a * k, kr * b * k, 0, 20); dline(O.concat([O[0]]), w * k * lw, WOOD.dk, .5); }
  }
  const PGR = { x0: 520, y0: 150, w: 1060 }; PGR.h = PGR.w * 9 / 16; PGR.x1 = PGR.x0 + PGR.w; PGR.y1 = PGR.y0 + PGR.h; PGR.k = PGR.w / W;
  const PGL = { x0: PGR.x0 - 16 - PGR.w, y0: PGR.y0, x1: PGR.x0 - 16, y1: PGR.y1 };
  // a point on the right page, from its 1920 × 1080 page frame
  const onPage = (x, y) => [PGR.x0 + x * PGR.k, PGR.y0 + y * PGR.k];
  function nbTable(t, sc = 1) {   // (sc: screen px per nb px)
    boilSeed('nb table');
    piece(R4(-100, -100, W + 100, H + 100), NB.table, { ink: null, key: 'nbtbl', lift: 0, edge: false });
    woodGrain(clamp(.5 / sc, 1, 1.7));   // (over this and whatever of the table is drawn under it: tableAll, tableExt, the wide's top)
    piece(R4(PGL.x0 - .043 * PGR.w, PGR.y0 - .026 * PGR.w, PGR.x1 + .034 * PGR.w, PGR.y1 + .043 * PGR.w), NB.cover, { sw: 2, shade: NB.coverDk, depth: 14, key: 'nbcover', lift: 8 });   // (its margins in F4's and O1's proportions)
    piece(R4(PGL.x0, PGL.y0, PGL.x1, PGL.y1), '#F4EFE4', { sw: 1.4, key: 'nbleft', lift: 3 });
    for (let y = 130; y < H; y += 40) dline([[PGL.x0 + 10, PGL.y0 + y * PGR.k], [PGL.x1 - 10, PGL.y0 + y * PGR.k]], .9, RULE);
    // (the left page is plain ruled paper: two biro asterisks, "her old doodles", sat in the same place on it and so on
    // every blank page the flip turns over: the user asked what they were; removed)
  }
  // the bill, back again (Z2's swoop at the lens hands over to it): on Z3's first frame the AI services bill fills the
  // lens, its dark header, sparkle and chart; it drops away onto her notebook's blank left page, slowly at first (it
  // reads), then faster, as the camera pulls back (zCam), and slaps down on the next beat (with "thrill"): a bounce, a
  // settle, a shake. It stays there. (It was a pale giant corner of it held for three frames, then a jump.)
  // (at its real size: Z2's in her hand, 22 cm across: 825 px here, beside her 30 cm page; it was a 5 cm one)
  // (it lands on her notebook's blank left page, turning a quarter turn as it drops to lie across it, its header to the
  // spine's far side, over the page's edges a little: the user. It landed on the table's near half, below the notebook)
  const BILL_AT = [-40, 470], BILL = { t0: BAR(154), S0: 2090, w: 825, rot: -Math.PI / 2 + .09 }; BILL.slap = BILL.t0 + (BAR(155) - BAR(154)) / 4;
  function tableBill(t) {
    boilSeed('tablebill');
    const a = t - BILL.slap;
    if (a >= .3) { const d = sweptBy(t); if (d.gone) return; bill(BILL_AT[0] + d.dx, BILL_AT[1] + d.dy, BILL.w, BILL.rot + d.rot, 0, 0, 'tbill'); return; }
    if (a >= 0) {   // the slap: a bounce and a settle, strokes out from it
      const b = Math.exp(-a * 13) * Math.sin(a * 40);
      bill(BILL_AT[0], BILL_AT[1] - 40 * Math.max(0, b), BILL.w * (1 + .05 * b), BILL.rot + .04 * b, 0, 0, 'tbill');
      if (a < .22) { const q = a / .22; for (let i = 0; i < 6; i++) { const an = -Math.PI * (.08 + i * .17), r0 = BILL.w * .78 + 160 * q, r1 = r0 + 200 * (1 - q); dline([[BILL_AT[0] + Math.cos(an) * r0, BILL_AT[1] + Math.sin(an) * r0 * .8], [BILL_AT[0] + Math.cos(an) * r1, BILL_AT[1] + Math.sin(an) * r1 * .8]], 12 * (1 - q * .5), '#F2ECE0', 0); } }
      return;
    }
    // the drop: its place on screen from the lens down to where it lands (through the camera at this drawing's time, so
    // between drawings the camera, on ones, carries it)
    const q = seg(t, BILL.t0, BILL.slap), e = Math.pow(q, 1.6), c = zCam(t), c1 = zCam(BILL.slap);
    const P1 = [960 + (BILL_AT[0] - c1[0]) * c1[2], 540 + (BILL_AT[1] - c1[1]) * c1[2]], S1 = BILL.w * c1[2];
    const P0 = [960, -40 + 1.3 * BILL.S0 / 2], S = Math.exp(lerp(Math.log(BILL.S0), Math.log(S1), e)), P = mix2(P0, P1, e);
    bill(c[0] + (P[0] - 960) / c[2], c[1] + (P[1] - 540) / c[2], S / c[2], BILL.rot * e + .07 * Math.sin(q * 8) * (1 - e), 0, .5 * Math.sin(t * 20) * (1 - e), 'tbill');
  }
  function nbPaperBack() { boilSeed('nb right'); piece(R4(PGR.x0, PGR.y0, PGR.x1, PGR.y1), PAPER, { sw: 1.4, key: 'nbright', lift: 3 }); }
  // the spiral down the right page's left edge: F4's and O1's nine coils, in their proportions (it was twelve small ones)
  function nbSpiral() { boilSeed('nb coils'); const w = PGR.w; for (let i = 0; i < 9; i++) { const y = PGR.y0 + .034 * w + i * (PGR.h - .068 * w) / 8; piece(oval(PGR.x0 - .0085 * w, y, .0385 * w, .019 * w, 0, 14), NB.coil, { sw: 1.2, key: 'nbcoil' + i, lift: 2, flatCard: true }); } }
  // the page's doodle: the two of them, side by side, hand in hand, under a sun (in the page frame: 1920 × 1080)
  const HER_HOME = { ...HER_C, top: { ...HER_C.top, kind: 'jumper', collar: 'crew', rows: [[1.8, 2.1], [1.74, 4.1], [1.7, 4.75, 1]], hemC: .1, band: .45, buttons: [], open: 0 }, extra: { pencil: HER_C.extra.pencil } };
  function twoOfThem(t, cx, gy, u, o = {}) {
    const e1 = calmE(feel(o.mood || 'happy', t, { seed: 1 })), e2 = calmE(feel(o.mood || 'happy', t, { seed: 2 }));
    const gap = u * 3.1;
    person(cx - gap, gy, u, HER_HOME, { ...e1, view: 'q', boilKey: 'nbher' + (o.key || ''), lookX: .8, pose: { L: [-1.2, 3, .1, 'relax'], R: [gap / u + .2, -9.2 * .55, .3, 'hold', 1, .2, 'u'] }, noShadow: true });
    person(cx + gap, gy, u * 1.02, HIM_C, { ...e2, view: 'q', flip: true, boilKey: 'nbhim' + (o.key || ''), lookX: .8, pose: { L: [-1.2, 3, .1, 'relax'], R: [gap / u - .1, -8.2 * .55, .3, 'hold', 1, .2, 'u'] }, noShadow: true });
  }
  function pageDoodle(t, which = 'us', o = {}) {
    look('doodle');
    _paint(R4(-60, -60, W + 60, H + 60), { wash: PAPER, ink: null });
    for (let y = 130; y < H + 40; y += 40) for (let x = -20; x < W + 20; x += 400) _inkLine([[x, y], [x + 410, y + .3]], .6, RULE, 'rotring', 0);
    _inkLine([[170, -20], [170.5, H + 20]], .9, '#E08A8A', 'rotring', 0);
    boilSeed('pd ' + which);
    if (which === 'us') {   // the two of them, hand in hand, under a sun, on a hill
      piece(oval(1500, 230, 80, 80, 0, 24), '#FFC928', { sw: 1.8, key: 'pdsun' });
      for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + t * .3; _inkLine([[1500 + Math.cos(a) * 92, 230 + Math.sin(a) * 92], [1500 + Math.cos(a) * 124, 230 + Math.sin(a) * 124]], 3, vivid('#F2B02A'), 'cpencil', 0); }
      piece(curvy([[200, 1200], [200, 860], [700, 800], [1300, 820], [1900, 780], [1900, 1200]], 5), '#8FD47A', { sw: 2, key: 'pdhill', side: false });
      if (o.couple) o.couple(t); else twoOfThem(t, 960, 900, 44, { key: 'us' });   // (o.couple: Z3 acts them: usCouple)
    } else if (which === 'hammock') {   // the hammock doodle again (the pre-chorus's), the two of them in it
      for (const tx of [360, 1560]) { edgeLine([[tx, 1000], [tx, 380]], 3.4, BIRO, false); piece(oval(tx, 330, 170, 130, 0, 24), '#3E9A5A', { sw: 2, key: 'pdtr' + tx }); }
      piece(oval(1500, 150, 70, 70, 0, 24), '#FFC928', { sw: 1.6, key: 'pdsun2' });
      const e1 = calmE(feel('relieved', t, { seed: 1 })), e2 = calmE(feel('relieved', t, { seed: 2 }));
      person(760, 690, 30, HER_HOME, { ...e1, eyes: 'closed', rot: -1.42, view: 'front', pose: 'low', boilKey: 'pdham1', noShadow: true });
      person(1240, 700, 32, HIM_C, { ...e2, eyes: 'closed', rot: 1.42, view: 'front', pose: 'low', boilKey: 'pdham2', noShadow: true });
      piece(curvy([[360, 560], [960, 800], [1560, 560], [1400, 700], [960, 830], [520, 700]], 4), '#FF8A5C', { sw: 2, key: 'pdham' });
      for (let k = 0; k < 7; k++) edgeLine([[420 + k * 170, 610 + 60 * Math.sin(k * .5)], [440 + k * 170, 760 + 20 * Math.sin(k)]], 1.4, BIRO, false);
    } else if (which === 'clink' && typeof LOOPS !== 'undefined' && LOOPS.friday) {   // the Friday: the drawing open in O1 and in the credits (friday.js at 6.1 s: the two of them on the bean bags, her controller, his can, the duck, the pizza); it was F3's den as the bridge draws it, a different moment of that evening
      stillDrawing(() => LOOPS.friday(6.1), 6.1); look('doodle');
    } else if (which === 'clink' && window.BRIDGE && BRIDGE.fridayPage) {   // (without friday.js: the bridge's own drawing)
      BRIDGE.fridayPage(t); look('doodle');
    } else if (which === 'clink') {   // (stand-in when the bridge isn't loaded) on the bean bags, cans raised to each other
      piece(R4(-60, 700, W + 60, H + 60), '#5E2A72', { sw: 1.4, key: 'pdrug', side: true, density: .35 });
      piece(curvy([[260, 1000], [250, 860], [360, 760], [560, 740], [700, 820], [720, 1000]], 4), '#1F8A8A', { sw: 2.2, key: 'pdbbS' });
      piece(curvy([[1200, 1000], [1220, 820], [1360, 740], [1560, 760], [1670, 860], [1660, 1000]], 4), '#5B3F8C', { sw: 2.2, key: 'pdbbH' });
      const e1 = calmE(feel('laugh', t, { seed: 1 })), e2 = calmE(feel('happy', t, { seed: 2 }));
      const canP = s0 => { push(); rotate(1.3); piece(R4(-s0 * .3, -s0 * .6, s0 * .3, s0 * .6), '#E8488A', { sw: 1.6, key: 'pdcanS' }); pop(); };
      const canQ = s0 => { push(); rotate(1.3); piece(R4(-s0 * .3, -s0 * .6, s0 * .3, s0 * .6), '#2EC4C4', { sw: 1.6, key: 'pdcanH' }); pop(); };
      person(560, 1000, 40, HER_HOME, { ...e1, seated: true, seatH: 4.6, view: 'q', boilKey: 'pdcl1', noShadow: true, pose: { L: [-.5, 1.05, .4, 'relax', 1, .6], R: [8.6, -12.4, .2, 'hold', 1, -1.3, 'u'] }, hold: canP });
      person(1360, 1000, 42, HIM_C, { ...e2, seated: true, seatH: 4.3, view: 'q', flip: true, boilKey: 'pdcl2', noShadow: true, pose: { L: [-.5, 1.05, .4, 'relax', 1, .6], R: [8.9, -10.6, .2, 'hold', 1, -1.3, 'u'] }, hold: canQ });
      piece(starPts(960, 440, 70, .4, 5), '#FFC928', { sw: 1.8, key: 'pdclink' });
      for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; _inkLine([[960 + Math.cos(a) * 90, 440 + Math.sin(a) * 90], [960 + Math.cos(a) * 130, 440 + Math.sin(a) * 130]], 3, vivid('#FFD24A'), 'cpencil', 0); }
      piece(oval(1600, 200, 60, 60, 0, 20), '#F6F0DC', { sw: 1.6, key: 'pdmoon' });
    } else if (which === 'birds') {
      twoOfThem(t, 960, 960, 42, { key: 'brd', mood: 'excited' });
      for (let k = 0; k < 7; k++) { const bx = 330 + k * 210, by = 260 + 90 * Math.sin(k * 1.7), f = Math.sin(t * 8 + k) * 34, c = ['#FFC928', '#FF6FA8', '#3FB8C0', '#7CE07C', '#FF8A5C', '#9A8BFF', '#E8488A'][k];
        piece([[bx - 70, by - f], [bx - 10, by + 4], [bx + 10, by + 4], [bx + 70, by - f], [bx + 12, by - 14], [bx - 12, by - 14]], c, { sw: 1.8, key: 'pdb' + k }); piece(oval(bx, by - 2, 22, 16, 0, 14), c, { sw: 1.6, key: 'pdbb' + k }); }
    } else if (which === 'run') {
      for (let k = 0; k < 4; k++) { const x0 = k * 480; piece(R4(x0 + 10, 100, x0 + 470, 1000), ['#F2E4C6', '#39333F', '#D06A5C', '#8FD47A'][k], { sw: 1.4, key: 'pdrun' + k, side: false }); }
      const e1 = calmE(feel('excited', t, { seed: 1 })), e2 = calmE(feel('excited', t, { seed: 2 }));
      person(900, 960, 34, HER_HOME, { ...e1, view: 'q', walk: .3, rot: .14, boilKey: 'pdr1', noShadow: true });
      person(1120, 990, 38, HIM_C, { ...e2, view: 'q', walk: .75, rot: .14, boilKey: 'pdr2', noShadow: true });
      for (let k = 0; k < 4; k++) edgeLine([[760 - k * 30, 700 + k * 60], [620 - k * 30, 700 + k * 60]], 2.2, BIRO, false);
    }
  }
  // draw a page doodle onto the right page (clipped to it)
  function onRightPage(t, which, o = {}) {
    clipTo([R4(PGR.x0, PGR.y0, PGR.x1, PGR.y1)]);
    push(); translate(PGR.x0, PGR.y0); scale(PGR.k); pageDoodle(t, which, o); if (o.over) o.over(); pop();
    look('card');
    clipEnd();
  }
  // His hand at its real size against her sketchbook (the style brief: the page about 1.7 of a hand's length; it was
  // 12.5 of his small cartoon hands long). At this size the rig's cartoon hand reads as a mitten, so it's drawn as O1's
  // close-up hand is (outro.js restingHand): the back of the hand, four fingers cut round, nails, knuckle creases, the
  // thumb a second piece. s: the hand's unit (fingertips at ~1.9 s from the wrist). curl 0..1: the fingers curled under
  // (a grip on a page's edge), shorter from above, the nails gone under.
  const HAND_S = PGR.w / 1.7 / 1.93;
  function closeHand(x, y, rot, s, col, key, curl = 0) {
    const skin = col.skin, dk = col.skinDk, lt = col.skinLt;
    const F = [[-.27, -.3, -1.8, .105], [-.075, -.085, -1.93, .11], [.12, .125, -1.86, .105], [.3, .33, -1.64, .095]].map(([yk, yt, tx, hw]) => [yk, lerp(yt, yk, curl * .5), lerp(tx, -1.3, curl), hw * (1 + .12 * curl)]);
    const web = [-1.26, -1.32, -1.29].map(w => lerp(w, -1.12, curl)), P = [[0, .44], [-.5, .47], [-.98, .43]];
    for (let i = F.length - 1; i >= 0; i--) {
      const [yk, yt, tx, hw] = F[i], arc = [];
      for (let j = 0; j <= 6; j++) { const a = Math.PI / 2 - j / 6 * Math.PI; arc.push([tx + .02 - Math.cos(a) * hw * 1.1, yt + Math.sin(a) * hw]); }
      P.push([lerp(-1.0, tx, .55), lerp(yk, yt, .55) + hw], ...arc, [lerp(-1.0, tx, .55), lerp(yk, yt, .55) - hw]);
      if (i > 0) P.push([web[i - 1], (F[i][0] + F[i - 1][0]) / 2]);
    }
    P.push([-1.0, -.41], [-.5, -.46], [0, -.44]);
    push(); translate(x, y); rotate(rot);
    piece(curvy(U(P, s), 2), skin, { sw: 1.8, shade: dk, depth: s * .16, key: key + 'hand', lift: 7 });
    for (const [yk, yt, tx, hw] of F) {
      if (curl < .6) piece(oval((tx + .13) * s, yt * s, .085 * s, hw * .62 * s, 0, 14), mixCol(skin, lt, .6), { sw: .8, key: key + 'nail' + yk, lift: 0, flatCard: true, edge: false });
      else dline([[(tx + .06) * s, (yt - hw * .7) * s], [(tx + .06) * s, (yt + hw * .7) * s]], 1.2, dk, .3);   // (the curled finger's fold)
      dline([[lerp(-1.0, tx, .5) * s, (lerp(yk, yt, .5) - hw * .5) * s], [lerp(-1.0, tx, .52) * s, (lerp(yk, yt, .5) + hw * .5) * s]], 1, dk, .4);
      dline([[-.98 * s, (yk - hw * .4) * s], [-1.02 * s, (yk + hw * .3) * s]], 1, dk, .4);
    }
    push(); translate(-.3 * s, -.4 * s); rotate(-.1 * curl);
    piece(curvy(U([[.05, 0], [-.35, -.14], [-.72, -.24], [-.88, -.2], [-.9, -.1], [-.7, -.02], [-.3, .06]], s), 3), skin, { sw: 1.7, shade: dk, depth: s * .08, key: key + 'thumb', lift: 4 });
    piece(oval(-.8 * s, -.17 * s, .05 * s, .045 * s, -.25, 12), lt, { sw: .8, key: key + 'tnail', lift: 0, flatCard: true, edge: false });
    pop();
    pop();
  }
  // An arm reaching in to a point on the table: the finger pads at (x, y), the forearm running back toward the shoulder at
  // S (off frame), its sleeve and cuff (as O1's: along the forearm, o.len s long, 3.4 by default). Returns the wrist.
  function closeArm(x, y, S, s, col, key, curl = 0, o = {}) {
    const a = Math.atan2(S[1] - y, S[0] - x), f = lerp(1.62, 1.18, curl), wx = x + Math.cos(a) * f * s, wy = y + Math.sin(a) * f * s, L = o.len || Math.max(3.4, Math.hypot(S[0] - wx, S[1] - wy) / s);   // (the sleeve runs on to its shoulder, off the frame)
    const arm = P => P.map(([u, v]) => [wx + (u * Math.cos(a) - v * Math.sin(a)) * s, wy + (u * Math.sin(a) + v * Math.cos(a)) * s]);
    boilSeed(key);
    piece(curvy(arm([[-.04, -.5], [L, -.66], [L, .7], [-.02, .5]]), 2), col.coat, { sw: 2, shade: col.coatDk, depth: 44, key: key + 'sleeve', lift: 10 });
    if (o.flecks) for (let i = 0; i < 10; i++) { const u = .4 + i * .28, v = (i % 3 - 1) * .3; dline(arm([[u, v], [u + .12, v + .08]]), 2.2, o.flecks, .4); }
    piece(curvy(arm([[-.05, -.52], [.22, -.55], [.26, .57], [-.03, .53]]), 2), col.cuff, { sw: 1.6, key: key + 'cuff', lift: 10 });
    closeHand(wx, wy, a, s, col, key, curl);
    return [wx, wy, a];
  }
  const HIM_ARM = { S: [3000, -900], col: HIM_C.col };   // (his shoulder, from above: he sits on the table's right; his arm comes in from the top right, up off the pages, so the turns show them)
  function pageHand(x, y, curl, key) { return closeArm(x, y, HIM_ARM.S, HAND_S, HIM_ARM.col, key, curl); }
  // (the small hand's placements were its wrist; its finger pads sat 55 px on along it, down the frame: the turns' grip,
  // as it was)
  const padOf = (x, y) => [x - .22 * 55, y + .976 * 55];

  // =====================================================================================================================
  // Z3 and Z4: "faces at the table" (the user, 2026-09-26; the sand wall, the page's edge, ?z3 and the bros' odometer are
  // retired). One scene at their table on the stopped train, from the bill landing to the page turns, which play exactly
  // as they always have:
  //   · the bill fills the lens and slaps down on her notebook's blank left page (from above); the camera pulls back and
  //     tilts up to the two of
  //     them at the table (the carriage, Z2's): her notebook open between them at the drawing of the two of them, her
  //     phone flat on the table on her side, left of the notebook (as O1 has it), the bots' sandbox on it (riso, C1e's)
  //   · "Your bots escaped the sandbox": the bots climb out of the phone (riso until their feet leave the screen, card
  //     after) and run off along the table and out through the window's open sash into the night, pleased, off to their
  //     tasks; the two of them watch them go. Tess sings it, and "I can't escape the rent"
  //   · "rent": the landlord's hand (C1f's tweed sleeve and signet ring) plonks her red rent book down on the bill, on her
  //     left page; they look at it, then at each other
  //   · "You keep a count of hours saved": Rowan gets up onto the table, stretched right out over it, and sweeps the two
  //     of them off the page with the back of his hand, down the table and over its near end, out of the frame (the
  //     user); her phone lights up with a
  //     counter rolling upward (the bots reporting back as they finish their tasks: the hours saved) and buzzes on the
  //     table; they look at it; the camera goes in over the table; the count rolls over to a round number inside "saved"
  //     and climbs on, faster and faster
  //   · before "I count the life I've spent" he reaches across and turns her phone face down (F1's "no office buzzing in my
  //     palm"), his hand goes to the page's edge, and the camera settles into the flip's framing by the first turn
  //   · "I count the life I've spent": his hand turns her pages: the birds, the run, the Friday (the user: untouchable:
  //     Z4.turns, pageTurn, PAGES, the grip's path (padOf) and zCam from Z4.life on, exactly as they were)
  // The table top is one world, "nb" (the flip's: her right page 1060 px wide, A4, about 37 px to the cm). In the carriage
  // (Z2's world: the table 240 px across between them, 81 cm) it lies on the table seen from a raised camera: TB maps it
  // there, scaled by TB.a and foreshortened by f (1: straight down; TB.f: the wide shot's tilt).
  // =====================================================================================================================
  const Z3 = { t0: BAR(154), t1: BAR(156), your: WF('Your bots escaped'), bots: WF('Your bots escaped', 1), sandbox: WF('Your bots escaped', 4) };
  Z3.faster = (l => l ? [l.start, l.end] : [Z3.t0 + .7, Z3.your - .02])(LYRICS.lines.find(l => l.backing && l.start > Z3.t0 && l.start < Z3.your));   // "(Same shit, faster!)"
  const RENT = { i: WF("I can't escape"), rent: WF("I can't escape", 4) };
  const Z4 = { t0: BAR(156), t1: BAR(161), keep: WF('You keep a count'), count: WF('You keep a count', 3), saved: WF('You keep a count', 6),
    life: WT('I count the life'), lifeW: WT('I count the life', 3), ive: WT('I count the life', 4), spent: WT('I count the life', 5) };
  Z4.turns = [Z4.life - .05, Z4.lifeW - .05, Z4.ive - .05];
  Z4.push = [Z4.spent - .15, Z4.spent + .45];   // (the camera's push in to the Friday, as it always was)
  const mix2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const def = o => { for (const k in o) if (o[k] === undefined) delete o[k]; return o; };
  const rRect = (x0, y0, x1, y1, r, n = 5) => { const P = []; for (const [cx, cy, a0] of [[x1 - r, y0 + r, -Math.PI / 2], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, Math.PI / 2], [x0 + r, y0 + r, Math.PI]]) for (let i = 0; i <= n; i++) { const a = a0 + i / n * Math.PI / 2; P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return P; };

  // ---------- the table top in the carriage ----------
  // (the wide: the classic train-table two-shot, from the aisle at the table's end, looking along it to the window: her on
  // the left facing right, him on the right facing left, the table between them; the set drawn at the frame's own scale,
  // about 9 px to the cm: the table 9 px/cm across (TB.a) and foreshortened along its length (TB.f))
  // (nbCx: the table's middle, between them, 217 in nb: her phone left of the notebook, the notebook right of the middle;
  // the table 3100 wide (88 cm), its far end 8% narrower, so both lie on it with a margin in the wide. It was 3000 wide
  // about nb 900, the phone on his side, right of the notebook: O1 has it on her side)
  // (nbEnd: the table's near end, nb. It ran on to nbNear (TB.near on screen), taking the frame's whole lower half in the
  // wide: the user found it massive. It ends a hand's width in front of the notebook now (the from-above shots, over the
  // table, still see only table: TABLE_CAM's lower edge is nb 1200), and in the wide the space under it shows, the
  // pedestal and the floor. nbNear and TB.near stay as the plane's anchor, so the tilts are as they were)
  const TB = { a: .3, cx: 960, nbCx: 217, near: 1000, nbNear: 1890, nbEnd: 1215, nbFar: -80, f: .893, taper: .92 }; TB.x0 = TB.nbCx - 1550; TB.x1 = TB.nbCx + 1550;   // (taper: the far end's width against the near end's: the table recedes)
  const toCar = ([x, y], f) => [TB.cx + TB.a * (x - TB.nbCx), TB.near - TB.a * f * (TB.nbNear - y)];
  const nbX = cx => TB.nbCx + (cx - TB.cx) / TB.a;
  function inPlane(f, fn) { push(); translate(TB.cx - TB.a * TB.nbCx, TB.near - TB.a * f * TB.nbNear); scale(TB.a, TB.a * f); try { fn(); } finally { pop(); } }
  // the table's surface past nbTable's edges (the wide frames and the tilt see all of it; its grain: nbTable's woodGrain)
  function tableExt() {
    boilSeed('nb table ext');
    piece(R4(1990, -600, 2900, TB.nbEnd), NB.table, { ink: null, key: 'nbtblx', lift: 0, edge: false });
    piece(R4(TB.x0 - 60, -600, 2900, -70), NB.table, { ink: null, key: 'nbtblt', lift: 0, edge: false });
  }
  function tableAll() {   // (the whole table top, under nbTable and tableExt: its left end and its near side)
    boilSeed('nb table all');
    piece(R4(TB.x0 - 60, TB.nbFar - 60, TB.x1 + 60, TB.nbEnd), NB.table, { ink: null, key: 'nbtblall', lift: 0, edge: false });
  }

  // ---------- the timeline ----------
  const T3 = { pull: [BILL.slap + .3, BILL.slap + 1.05] };
  T3.plonk = RENT.rent; T3.ll = [RENT.rent - .34, RENT.rent, RENT.rent + .3];   // the landlord's hand: in, the plonk, lifted off, gone
  T3.lookBook = RENT.rent + .06; T3.lookEach = RENT.rent + .3;   // (a beat for the book, then half a second for each other)
  T3.push = [RENT.rent + .8, RENT.rent + 1.12];   // his backhand: in to the book, through it
  T3.light = T3.push[1] + .06; T3.lookPhone = T3.light + .15;   // the phone lights up (on "count"); they look at it
  T3.camIn = [T3.light + .55, T3.light + 1.08];   // in over the table
  T3.roll = BAR(158);   // the count's round number: the downbeat inside "saved"
  // (his reach across the table to her phone, turning it over, and his hand across the pages to the page's edge: each a
  // little earlier and longer than when the phone was on his side, for the longer way)
  T3.reach = [Z4.turns[0] - 1.75, Z4.turns[0] - 1.2]; T3.flip = [Z4.turns[0] - 1.15, Z4.turns[0] - .75]; T3.toPage = [Z4.turns[0] - .7, Z4.turns[0] - .1];
  T3.settle = [Z4.turns[0] - .7, Z4.turns[0] - .05];   // the camera into the flip's framing, by the first turn

  // ---------- the cameras (on ones) ----------
  // from above (nb): on the bill as it lands, then over the table (the phone, the notebook) after the tilt in, then the
  // flip's framing; in the carriage: the wide shot of the two of them, and the tilts between
  // (the camera goes and comes along the table's middle, between them: no head crosses the frame; over the table it slides
  // left to her phone: TABLE_CAM takes in the phone and the drawing of the two of them, the phone's turn clear of the
  // frame's edge; then right and in to the flip's framing)
  // (SLAP_CAM: over the bill on her left page, its view kept on the table top: nb -75 to 1195 down it)
  const SLAP_CAM = [BILL_AT[0] + 80, 560, .85], TABLE_CAM = [40, 470, .74], FLIP_CAM = [870, 460, 1.02];
  const zCam = t => kf(t, [[Z3.t0, [BILL_AT[0], BILL_AT[1] - 60, 2.2]], [BILL.slap + .06, SLAP_CAM], [T3.pull[0], SLAP_CAM], [T3.camIn[1], TABLE_CAM], [T3.settle[0], TABLE_CAM], [T3.settle[1], FLIP_CAM],
    [Z4.life, FLIP_CAM], [Z4.push[0], FLIP_CAM], [Z4.push[1] + .3, [1050, 452, 1.5]], [Z4.t1, [1050, 450, 1.55]]], ease);
  const CAMW = { cx: 960, cy: 545, zoom: 1 };   // the wide shot (the set is drawn at the frame's scale)
  const CAMM = { cx: 640, cy: 480, zoom: 1.6 };   // her and her phone (the bots' climb out of it)
  T3.widen = [Z3.bots + .5, Z3.bots + 1.05];   // (out to the wide as they run for the window)
  const tdCam = (c, f) => { const [x, y] = toCar(c, f); return { cx: x, cy: y, zoom: c[2] / TB.a }; };
  // the carriage camera and the table's tilt, or null while the camera is straight down on the table
  function carCam(t) {
    if (t < T3.pull[0] || t >= T3.camIn[1]) return null;
    const lz = (a, b, q) => Math.exp(lerp(Math.log(a), Math.log(b), q));
    // (the pull-back lands on her and her phone (CAMM) for the bots' climb out of it, so the crossing out of its picture
    // reads; it widens to the two of them as they run for the window. It went straight to the wide, where the bots in the
    // phone were a few pixels tall)
    if (t < T3.pull[1]) { const q = ease(seg(t, ...T3.pull)), f = lerp(1, TB.f, q), A = tdCam(SLAP_CAM, f); return { f, cx: lerp(A.cx, CAMM.cx, q), cy: lerp(A.cy, CAMM.cy, q), zoom: lz(A.zoom, CAMM.zoom, q) }; }
    if (t < T3.widen[1]) { const q = ease(seg(t, ...T3.widen)); return { f: TB.f, cx: lerp(CAMM.cx, CAMW.cx, q), cy: lerp(CAMM.cy, CAMW.cy, q), zoom: lz(CAMM.zoom, CAMW.zoom, q) }; }
    const d = seg(t, T3.widen[1], T3.camIn[0]), C = { cx: CAMW.cx, cy: CAMW.cy + 14 * d, zoom: CAMW.zoom * (1 + .04 * d) };   // (a slow drift in through the hold)
    if (t < T3.camIn[0]) return { f: TB.f, ...C };
    const q = ease(seg(t, ...T3.camIn)), f = lerp(TB.f, 1, q), A = tdCam(TABLE_CAM, f);   // (straight to the phone and the drawing: it went in on her blank left page, the counting phone half off the frame, then slid back to it)
    return { f, cx: lerp(C.cx, A.cx, q), cy: lerp(C.cy, A.cy, q), zoom: lz(C.zoom, A.zoom, q) };
  }

  // ---------- her phone, flat on the table ----------
  const PH = { x0: -1162, y0: 252, w: 500 }; PH.h = PH.w * 9 / 16; PH.x1 = PH.x0 + PH.w; PH.y1 = PH.y0 + PH.h; PH.cx = PH.x0 + PH.w / 2; PH.cy = PH.y0 + PH.h / 2;   // (on her side, left of the notebook, as O1 has it; it was right of it, on his)
  // the buzz: bursts while it counts, a shiver on the table (on twos), until it's turned over
  const buzzOn = tt => tt >= T3.light && tt < T3.flip[0] && frac((tt - T3.light) / .55) < .42;
  // turning it over (face down): about its long axis, lifted a little; θ 0..π
  const phoneTurn = tt => Math.PI * ease(seg(tt, ...T3.flip));
  function z3Phone(tt) {
    const { x0, y0, x1, y1 } = PH, b = 12, cz = 7, th = phoneTurn(tt), c = Math.cos(th), lift = 70 * Math.sin(th), bz = buzzOn(tt) ? 5 * (Math.floor(tt * 12) % 2 ? 1 : -1) : 0;
    look('card'); boilSeed('z3 phone');
    piece(rRect(x0 - b - cz + 8, y0 - b - cz + 12, x1 + b + cz + 8, y1 + b + cz + 12, 24), '#000000', { ink: null, op: 50 - 20 * Math.sin(th), key: 'z3phsh', lift: 0, flatCard: true, edge: false });   // its shadow
    push(); translate(PH.cx + bz, PH.cy - lift); scale(1, Math.abs(c) < .02 ? .02 : Math.abs(c)); translate(-PH.cx, -PH.cy);
    piece(rRect(x0 - b - cz, y0 - b - cz, x1 + b + cz, y1 + b + cz, 24), '#7A9278', { sw: 1.6, shade: '#5A7058', depth: 6, key: 'z3phcase', lift: 3 });   // the case (sage: the outro's)
    if (c >= 0) {
      piece(rRect(x0 - b, y0 - b, x1 + b, y1 + b, 18), '#1E1C24', { sw: 1.2, key: 'z3phbody', lift: 1, flatCard: true });
      clipPoly(R4(x0, y0, x1, y1), () => tt >= T3.light ? phoneCount(tt) : sandPic(tt));
      look('card'); boilSeed('z3 phone glass');
      piece([[x0 + PH.w * .58, y0], [x0 + PH.w * .72, y0], [x0 + PH.w * .5, y1], [x0 + PH.w * .36, y1]], '#FFFFFF', { ink: null, op: 14, key: 'z3phgl', lift: 0, flatCard: true, edge: false });   // the glass
      piece(oval(x0 - b / 2, (y0 + y1) / 2, 2.6, 2.6, 0, 10), '#3A3844', { ink: null, key: 'z3phcam', lift: 0, flatCard: true, edge: false });
    } else {   // its back: the case, the camera bump (no logo)
      piece(rRect(x0 + 14, y0 + 16, x0 + 150, y0 + 120, 26), '#5A7058', { sw: 1.2, key: 'z3phbump', lift: 2 });
      for (const [lx, ly] of [[x0 + 50, y0 + 50], [x0 + 110, y0 + 50], [x0 + 50, y0 + 92]]) piece(oval(lx, ly, 17, 17, 0, 14), '#1E1C24', { sw: .9, key: 'z3phlens' + lx + ly, lift: 1, flatCard: true });
    }
    pop();
    if (bz) { boilSeed('z3 buzz'); for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { const x = s < 0 ? x0 - 60 - i * 26 : x1 + 60 + i * 26, r = 40 + i * 30; dline([[x, PH.cy - r], [x + s * 12, PH.cy], [x, PH.cy + r]], 4 - i, '#2A2630', .5); } }   // the buzz, either end
    look('card');
  }
  // C1e's sandbox from above, filling the screen: the sand, their hole and a heap, the planks round the edge; the crew in it
  function sandPic(tt) {
    const { x0, y0, x1, y1 } = PH, p = 26;
    look('xerox'); cpGeneration(2);
    boilSeed('z3 pic');
    piece(R4(x0 - 10, y0 - 10, x1 + 10, y1 + 10), '#F2D27A', { ink: null, key: 'z3psand', lift: 0 });
    for (let i = 0; i < 18; i++) piece(oval(lerp(x0 + p + 6, x1 - p - 6, hash(i * 1.7)), lerp(y0 + p + 6, y1 - p - 6, hash(i * 2.9)), 5, 3.4, 0, 8), '#D8B460', { ink: null, key: 'z3pg' + i, lift: 0 });
    piece(oval(x0 + PH.w * .34, y0 + PH.h * .4, 44, 24, .2, 18), '#C8964A', { ink: null, key: 'z3phole', lift: 0 });
    piece(curvy([[x0 + PH.w * .6, y0 + PH.h * .46], [x0 + PH.w * .64, y0 + PH.h * .3], [x0 + PH.w * .74, y0 + PH.h * .28], [x0 + PH.w * .8, y0 + PH.h * .46]], 3), '#E8C070', { sw: 1.2, key: 'z3pmound', lift: 0 });
    const Pl = [[[x0, y0], [x1, y0], [x1 - p, y0 + p], [x0 + p, y0 + p]], [[x1, y0], [x1, y1], [x1 - p, y1 - p], [x1 - p, y0 + p]], [[x1, y1], [x0, y1], [x0 + p, y1 - p], [x1 - p, y1 - p]], [[x0, y1], [x0, y0], [x0 + p, y0 + p], [x0 + p, y1 - p]]];
    Pl.forEach((P, i) => { piece(P, i % 2 ? '#B07A4A' : '#C08A58', { sw: 1.4, key: 'z3pl' + i, lift: 0 }); for (let j = 1; j < 3; j++) dline([mix2(P[0], P[3], j / 3), mix2(P[1], P[2], j / 3)], .7, '#7A4A2A'); });
    z3Crew(tt, true);
    Object.assign(XEROX, CP_X0);
  }
  // ---------- the count on her phone (riso, the phone's picture): the bots reporting back ----------
  // Six rolling wheels of digit-like figures (the film's engraved numerals' shapes, printed) and an hourglass: from
  // 099,600 when it lights up, faster and faster, to 100,000 on the downbeat inside "saved", then on, faster still.
  const CNT = { Ts: T3.light + .05, vs: 99600, r0: 40, rmax: 26000 };
  CNT.k = (() => { const D = 1e5 - CNT.vs, T = T3.roll - CNT.Ts; let a = .05, b = 20; for (let i = 0; i < 80; i++) { const m = (a + b) / 2; if (CNT.r0 / m * (Math.exp(m * T) - 1) > D) b = m; else a = m; } return (a + b) / 2; })();
  CNT.Tc = CNT.Ts + Math.log(CNT.rmax / CNT.r0) / CNT.k; CNT.vc = CNT.vs + CNT.r0 / CNT.k * (Math.exp(CNT.k * (CNT.Tc - CNT.Ts)) - 1);
  const cntV = t => t <= CNT.Ts ? CNT.vs : t <= CNT.Tc ? CNT.vs + CNT.r0 / CNT.k * (Math.exp(CNT.k * (t - CNT.Ts)) - 1) : CNT.vc + CNT.rmax * (t - CNT.Tc);
  // an odometer's wheel i (0 the units): a wheel turns only while every wheel below it rolls from 9 to 0
  const wheelP = (V, i) => { if (!i) return V; const P = Math.pow(10, i), n = Math.floor(V / P), r = V - n * P; return n + Math.max(0, r - (P - 1)); };
  // the figures: centrelines in a box 1 tall (y down), about .55 wide
  const DIGITS = (() => {
    const ell = (cx, cy, rx, ry, n = 30) => { const P = []; for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + i / n * TAU; P.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return P; };
    const six = [[.19, -.4], [.06, -.47], [-.09, -.45], [-.2, -.33], [-.26, -.1], [-.26, .16], [-.19, .36], [-.04, .47], [.12, .45], [.23, .33], [.26, .15], [.21, -.01], [.07, -.08], [-.08, -.06], [-.2, .03], [-.26, .14]];
    return [
      [ell(0, 0, .25, .46)],
      [[[-.13, -.33], [.03, -.47], [.03, .47]], [[-.16, .47], [.22, .47]]],
      [[[-.21, -.27], [-.15, -.4], [0, -.47], [.15, -.43], [.22, -.28], [.18, -.12], [.03, .05], [-.14, .23], [-.24, .46], [.25, .46]]],
      [[[-.21, -.37], [-.06, -.46], [.1, -.46], [.2, -.36], [.2, -.2], [.1, -.07], [-.05, -.03]], [[.1, -.07], [.22, .05], [.25, .22], [.18, .39], [.02, .47], [-.13, .46], [-.24, .37]]],
      [[[.13, .47], [.13, -.47], [-.26, .17], [.29, .17]]],
      [[[.21, -.46], [-.15, -.46], [-.19, -.05], [-.04, -.12], [.13, -.1], [.24, .04], [.26, .22], [.18, .38], [.02, .47], [-.13, .46], [-.24, .37]]],
      [six],
      [[[-.25, -.34], [-.25, -.46], [.25, -.46], [.17, -.29], [.04, -.05], [-.04, .2], [-.07, .47]]],
      [ell(0, -.24, .18, .21), ell(0, .23, .23, .24)],
      [six.map(([x, y]) => [-x, -y])],
    ];
  })();
  function digit(d, x, y, h, col, sw) { for (const S of DIGITS[d]) dline((S.length > 12 ? S : through(S, 4)).map(([u, v]) => [x + u * h, y + v * h]), sw, col, 0); }
  function phoneCount(tt) {
    const { x0, y0, x1, y1, w, h } = PH, V = cntV(tt), flash = 1 - seg(tt, T3.light, T3.light + .17), BLUE = '#1E2C6A';
    look('xerox'); cpGeneration(2); boilSeed('z3 count');
    piece(R4(x0 - 10, y0 - 10, x1 + 10, y1 + 10), '#F6E9B8', { ink: null, key: 'z3cbg', lift: 0 });   // the lit screen
    if (flash > 0) piece(R4(x0 - 10, y0 - 10, x1 + 10, y1 + 10), '#FFFFFF', { ink: null, op: 255 * flash, key: 'z3cfl', lift: 0 });
    // the hourglass (the hours): two triangles, its sand running
    const hx = x0 + w * .12, hy = y0 + h * .5, hs = h * .3, run = frac(tt * .9);
    piece([[hx - hs * .55, hy - hs], [hx + hs * .55, hy - hs], [hx, hy], [hx + hs * .55, hy + hs], [hx - hs * .55, hy + hs], [hx, hy]], '#E0508A', { sw: 1.4, key: 'z3chg', lift: 0 });
    piece([[hx - hs * .3 * (1 - run), hy - hs * .45 * (1 - run) - hs * .1], [hx + hs * .3 * (1 - run), hy - hs * .45 * (1 - run) - hs * .1], [hx, hy - 4]], '#F2D27A', { ink: null, key: 'z3chs', lift: 0 });
    piece([[hx - hs * .45 * run, hy + hs * .95], [hx + hs * .45 * run, hy + hs * .95], [hx, hy + hs * .95 - hs * .6 * run]], '#F2D27A', { ink: null, key: 'z3chb', lift: 0 });
    // the wheels: six figures, rolling (a comma-like tick between the thousands and the hundreds)
    const n = 6, cw = w * .12, gx = x0 + w * .25, ch = h * .64, cy = y0 + h * .5;
    for (let j = 0; j < n; j++) {
      const i = n - 1 - j, p = wheelP(V, i), base = Math.floor(p), fr = p - base, cx = gx + (j + .5) * cw + (j >= 3 ? cw * .22 : 0);
      clipPoly(R4(cx - cw * .46, cy - ch * .56, cx + cw * .46, cy + ch * .56), () => {
        for (const [k, dd] of [[0, base], [1, base + 1]]) digit(((dd % 10) + 10) % 10, cx, cy + (k - fr) * ch * 1.15, ch * .78, BLUE, ch * .045);
      });
    }
    dline([[gx + 3 * cw + cw * .08, cy + ch * .38], [gx + 3 * cw + cw * .02, cy + ch * .52]], ch * .05, BLUE, 0);
    Object.assign(XEROX, CP_X0);
  }

  // ---------- the crew (C1e's): out of the phone, along the table, out through the window ----------
  // each: its place in the sandbox (the screen's fractions), its size standing on the table in the carriage (cu, px), and
  // where it leaves by (gx: the carriage x at the window's gap)
  const Z3B = [
    { id: 'gem', at: [.8, .66], cu: 9, gx: 1150 },
    { id: 'codey', at: [.2, .7], cu: 11, gx: 950 },
    { id: 'clawd', at: [.44, .78], cu: 8.5, gx: 1030 },
    { id: 'cop', at: [.6, .45], cu: 7.5, gx: 1090 },
    { id: 'grok', at: [.88, .45], cu: 7.5, gx: 1210 },
  ];
  const Z3V = { hop: .26, climb: .2, v: 3600, gap: .12, out: .34, pic: 16 };   // (pic: their unit in the phone's picture, nb px: big enough to see them climb out of it; it was 9)   // the jump down, the climb to the far bezel, their speed on the table (nb px/s), the wave at the gap, the leap out
  Z3B.forEach((b, i) => {
    b.i = i; b.out = Z3.bots + [.1, 0, .2, .28, .36][i];
    b.px = PH.x0 + b.at[0] * PH.w; b.py = PH.y0 + b.at[1] * PH.h; b.land = [b.px + 20, TB.nbFar + 120];   // (off the far bezel onto the table's far strip, then along it to the window's gap: behind the notebook, not across it)
    b.to = [nbX(b.gx), TB.nbFar + 40]; b.arrive = b.out + Z3V.hop + Math.hypot(b.to[0] - b.land[0], b.to[1] - b.land[1]) / Z3V.v;
  });
  // a crew member at t: st (dig | climb | hop | run | gap | out | gone), in (still the phone's picture), g (its ground point,
  // nb), k (the jump's or leap's progress), face (±1 in the carriage), walk (its stride's phase), size (0..1 of cu)
  function crewAt(b, t) {
    const edge = [b.px, PH.y0 + 6];
    if (t < b.out - Z3V.climb) return { st: 'dig', in: true, g: [b.px, b.py], face: b.i % 2 ? -1 : 1 };
    // (the climb to the far bezel and the leap off it are drawn standing on the table (crewTable), across the screen's edge:
    // riso where they're over the screen, card beyond it, so the crossing is seen, the head first as it climbs to the edge,
    // then the rest; at the picture's size (pic) and squashed as the picture is (sq), growing to their own size as they
    // leap. It used to vanish from the picture and appear in card past the phone's edge in one drawing)
    const pic = Z3V.pic * TB.a / b.cu;
    if (t < b.out) { const k = ease(seg(t, b.out - Z3V.climb, b.out)); return { st: 'climb', in: false, g: [b.px, lerp(b.py, edge[1], k)], face: 1, walk: k * 1.4, size: pic, sq: TB.f }; }
    const tl = b.out + Z3V.hop;
    if (t < tl) { const k = seg(t, b.out, tl), g = mix2(edge, b.land, k); return { st: 'hop', in: false, g, k, face: b.to[0] < b.land[0] ? -1 : 1, size: lerp(pic, 1, easeOut(k)), sq: lerp(TB.f, 1, k) }; }   // (riso while its feet are on the screen, card once they're off it)
    if (t < b.arrive) { const k = seg(t, tl, b.arrive), g = mix2(b.land, b.to, k), d = Math.hypot(b.to[0] - b.land[0], b.to[1] - b.land[1]) * k * TB.a; return { st: 'run', in: false, g, face: b.to[0] < b.land[0] ? -1 : 1, walk: d / (b.cu * 3.4), size: 1 }; }
    if (t < b.arrive + Z3V.gap) return { st: 'gap', in: false, g: b.to, face: b.to[0] < b.land[0] ? 1 : -1, size: 1 };   // (a wave back at them, the way they came)
    if (t < b.arrive + Z3V.gap + Z3V.out) return { st: 'out', in: false, g: b.to, k: seg(t, b.arrive + Z3V.gap, b.arrive + Z3V.gap + Z3V.out), face: b.to[0] < b.land[0] ? -1 : 1, size: 1 };
    return { st: 'gone' };
  }
  // the dig: a stroke every half second, frantic under "(Same shit, faster!)", stopped on "Your"
  const z3Dig = t => { t = Math.min(t, Z3.your); const [a, b] = Z3.faster; return 2 * Math.min(t, a) + 5.5 * clamp(t - a, 0, b - a) + 2 * Math.max(0, t - b); };
  const z3Spade = s => { push(); rotate(.8); piece(R4(-.09 * s, -2.1 * s, .09 * s, 0), '#8A5A34', { sw: .9, key: 'z3spH', lift: 2 }); piece([[-.45 * s, -2.1 * s], [.45 * s, -2.1 * s], [.28 * s, -3.1 * s], [-.28 * s, -3.1 * s]], '#E0602E', { sw: .9, key: 'z3spB', lift: 2 }); pop(); };
  // one of them drawn at (x, y) at unit u (the picture's riso or the table's card: the caller sets the look). Their mouths
  // stay shut (nobody here mouths the backing or her line); the eyes carry it
  function crewDraw(b, S, t, x, y, u) {
    const i = b.i, moving = S.st === 'run' || S.st === 'climb', air = S.st === 'hop' || S.st === 'out';
    const beat = Math.abs(Math.sin((z3Dig(t) + i * .37) * Math.PI));
    const e = emotions(t, [[0, 'happy'], [Z3.your - .04 + i * .06, 'surprised', { mouth: 'smile' }], [Z3.your + .24 + i * .06, 'excited', { mouth: 'smile' }]], { take: .5 }); e.emote = null;
    if (S.st === 'run' || S.st === 'gap' || S.st === 'out') Object.assign(e, { eyes: 'happy', mouth: 'smile' });   // (pleased: off to their tasks)
    if (b.id === 'gem') delete e.mouth;   // (the twins' fixed smile)
    const o = { ...e, view: 'q', flip: S.face < 0, boilKey: 'z3b' + b.id, seed: 3 + i * 1.3, t, noShadow: S.in || air, rot: air ? -.15 * Math.sin(Math.PI * S.k) : 0 };
    const walk = moving ? S.walk : null, sw = Math.sin((S.walk || 0) * TAU), wave = S.st === 'gap';
    if (b.id === 'codey') return codex(x, y, u, { ...o, kind: 'codey', walk, pose: S.st === 'dig' ? { L: [-1.6, -2.2, .2, 'fist'], R: [2.0, -2.0 - 2 * beat, .2, 'hold', 1] } : wave ? 'wave' : { L: [-1.6, -2.6 + .4 * sw, .2, 'fist'], R: [1.9, -3.2, .2, 'hold', 1] }, hold: S.st === 'dig' || S.st === 'climb' ? z3Spade : undefined });
    if (b.id === 'cop') return copilot(x, y, u, { ...o, walk, pose: S.st === 'dig' ? { L: [-1.7, -3.0, .3, 'fist'], R: [2.3, -3.2 - 1.6 * beat, .2, 'open', 1] } : wave ? 'wave' : { L: [-1.7, -3.0 - .3 * sw, .3, 'fist'], R: [1.9, -3.0 + .3 * sw, .3, 'fist', 1] } });
    if (b.id === 'grok') return grok(x, y, u, { ...o, walk, pose: wave ? 'wave' : S.st === 'dig' ? { L: [-2.2, -3.8, .3, 'relax'], R: [2.4, -3.6 - 1.4 * beat, .2, 'open', 1] } : 'serve' });
    if (b.id === 'gem') { const w2 = .38 * Math.sin(t * 7.4); return gemini(x, y, u, { ...o, walk, pose: { O: [-2.35 - w2, -4.6, .25, 'open'], I: 'join', OB: moving ? null : [-2.6, -3.0, .12, 'point', 0] } }); }
    return clawd2(x, y, u, def({ ...o, walk, pose: S.st === 'dig' ? 'down' : undefined, aL: moving ? 1.1 + .25 * sw : wave ? 1.2 : undefined, aR: moving ? 1.1 - .25 * sw : wave ? 1.2 + .3 * Math.sin(t * 20) : undefined }));
  }
  // in the phone's picture (riso, nb, clipped to the screen by the caller): digging, climbing to the far bezel, and a jump
  // while its feet are still on the screen
  function z3Crew(t, inPic) {
    if (!inPic) return;
    const L = Z3B.map(b => ({ b, S: crewAt(b, t) })).filter(({ S }) => S.in).sort((p, q) => p.S.g[1] - q.S.g[1]);
    for (const { b, S } of L) { look('xerox'); boilSeed('z3b' + b.id); crewDraw(b, S, t, S.g[0], S.g[1], Z3V.pic); }
    look('xerox');
  }
  // standing on the table (card, the carriage): off the phone's far edge, along the table to the window's gap
  function crewTable(t, f) {
    const L = Z3B.map(b => ({ b, S: crewAt(b, t) })).filter(({ S }) => !S.in && ['climb', 'hop', 'run', 'gap'].includes(S.st)).sort((p, q) => p.S.g[1] - q.S.g[1]);
    const scr = [[PH.x0, PH.y0], [PH.x1, PH.y0], [PH.x1, PH.y1], [PH.x0, PH.y1]].map(p => toCar(p, f));   // (the screen, on the table)
    for (const { b, S } of L) {
      const [x, y0] = toCar(S.g, f), y = y0 - (S.st === 'hop' ? 18 * Math.sin(Math.PI * S.k) : 0), sq = S.sq ?? 1;
      const draw = () => { boilSeed('z3b' + b.id); push(); translate(x, y); scale(1, sq); translate(-x, -y); crewDraw(b, S, t, x, y, b.cu * S.size); pop(); };
      if (S.st === 'climb' || S.st === 'hop') {   // (across the screen's edge: riso inside it, card outside)
        clipPoly(scr, () => { look('xerox'); cpGeneration(2); draw(); Object.assign(XEROX, CP_X0); });
        clipPoly([R4(-4000, -4000, 6000, 6000), scr], () => { look('card'); draw(); });
      } else { look('card'); draw(); }
    }
    look('card');
  }
  // up from the table's far end into the gap under the raised sash (in front, k < .35), then through it and away, dropping
  // out of sight below the sill (behind the window's frame, seen through the glass: front false, clipped to the window)
  function crewOutside(t, front = false) {
    for (const b of Z3B) {
      const S = crewAt(b, t); if (S.st !== 'out' || (S.k < .35) !== front) continue;
      const [x, y0] = toCar(S.g, TB.f), k = S.k, gb = WIN.y1 - 6;
      const y = k < .35 ? lerp(y0, gb, easeOut(k / .35)) - 40 * Math.sin(Math.PI * k / .35) : gb + 260 * Math.pow((k - .35) / .65, 2), sc = k < .35 ? 1 : 1 - .25 * (k - .35) / .65;
      const draw = () => { look('card'); boilSeed('z3b' + b.id); crewDraw(b, S, t, x + 20 * k * S.face, y, b.cu * sc); };
      if (front) draw(); else clipPoly(rRect(WIN.x0, WIN.y0, WIN.x1, WIN.y1, 56, 6), draw);
    }
    look('card');
  }
  // where the bots are, for the two of them to watch (carriage): the phone until they're out, then the pack, then the gap
  function botsAt(t, f) {
    const P = Z3B.map(b => crewAt(b, t)).filter(S => S.st !== 'gone' && S.st !== 'dig' && !S.in).map(S => toCar(S.g, f));
    if (!P.length) return t < Z3.bots ? toCar([PH.cx, PH.cy], f) : [1080, WIN.y1 - 30];
    return [P.reduce((s, p) => s + p[0], 0) / P.length, P.reduce((s, p) => s + p[1], 0) / P.length];
  }

  // ---------- the rent book (C1f's, real size: about 15 × 10 cm) and the landlord's hand ----------
  const BOOK = { w: 555, h: 370, at: [90, 520], rot: -.12 };   // (plonked down on the bill, on her notebook's left page)
  // his sweep: the back of his hand against the stack's right edge, it goes down the table toward us, the rent book on
  // the AI bill, gathering speed (nb offset, turn), over the table's near end and down out of the frame (drop: the fall,
  // screen px, after it leaves the table: on with the speed it left with, and falling). The bill is the bad future on
  // the table: nothing of it is left for the good future's pages
  const T3_HIT = T3.push[0] + .14, SWEEP = { T: .22, d: [-233, 877], g: 7000 };
  function sweptBy(tt) {
    const a = tt - T3_HIT, k = clamp(a / SWEEP.T), sl = k * k, [ddx, ddy] = SWEEP.d;
    const f = Math.max(0, a - SWEEP.T), vx = 2 * ddx * TB.a / SWEEP.T, vy = 2 * ddy * TB.a * TB.f / SWEEP.T;   // (its speed on leaving the table, screen px/s)
    const drop = f > 0 ? [vx * f, vy * f + SWEEP.g * f * f / 2] : [0, 0];
    return { dx: ddx * sl, dy: ddy * sl, rot: .35 * sl + 1.2 * f, drop, gone: drop[1] > 700 };
  }
  function rentBook(x, y, rot, lift = 0) {
    const { w, h } = BOOK;
    look('card'); boilSeed('z3 rentbook');
    piece(R4(-w / 2, -h / 2 + 30, w / 2, h / 2 + 30).map(([u, v]) => [x + u * Math.cos(rot) - v * Math.sin(rot), y + u * Math.sin(rot) + v * Math.cos(rot)]), '#000000', { ink: null, op: 40 + 30 * (1 - Math.min(1, lift / 200)), key: 'z3llsh', lift: 0, flatCard: true, edge: false });   // its shadow on the table
    push(); translate(x, y - lift); rotate(rot);
    piece(R4(-w / 2, -h / 2, w / 2, h / 2), '#A83A30', { sw: 2.2, shade: '#7A2A22', depth: 12, key: 'z3llbook', lift: 6 });
    piece(R4(-w / 2 + 24, -h / 2 + 24, w / 2 - 24, h / 2 - 24), '#C04A3E', { ink: null, key: 'z3llbook2', lift: 0, flatCard: true });
    dline([[-w * .34, -h * .12], [w * .1, -h * .12]], 5, '#F2E0C8'); dline([[-w * .34, h * .1], [-w * .02, h * .1]], 5, '#F2E0C8');
    pop();
  }
  // the landlord (standing in the aisle, beside us): his arm comes in from the frame's bottom right with the book held
  // flat, plonks it down between them on "rent" (a tap), lets go and goes back out. The hand (O1's close-up hand, a
  // signet ring) and the book lie in the table's plane, lifted off it toward us; the tweed sleeve (C1f's, flecked, a white
  // cuff) rises out of the plane to the frame's corner at its real thickness, wider as it comes toward us
  const LL = { col: { coat: '#6A5A48', coatDk: '#4A3E30', cuff: '#E8E0D0', skin: '#D8A888', skinDk: '#B8866A', skinLt: '#EAC0A0' }, from: [1900, 1260] };
  function landlord(tt, f) {
    const [t0, t1, t2] = T3.ll; if (tt < t0 || tt > t2 + .25) return;
    const kin = ease(seg(tt, t0, t1)), kout = easeIn(seg(tt, t1 + .06, t2 + .25)), away = (1 - kin) + kout;
    const up = 60 * (1 - kin) + 40 * ease(seg(tt, t1 + .04, t1 + .22));   // (screen px: the lift off the table)
    const bx = BOOK.at[0], by = BOOK.at[1], gx = bx + BOOK.w * .44, gy = by + BOOK.h * .1, hA = Math.atan2(.55, 1);   // (the grip on the book's right end; the forearm back toward the aisle, down and right)
    const pad = [gx + 1500 * away, gy + 900 * away], W0 = [pad[0] + Math.cos(hA) * 1.25 * HAND_S, pad[1] + Math.sin(hA) * 1.25 * HAND_S];
    const [sx, sy0] = toCar(W0, f), sy = sy0 - up, s = HAND_S * TB.a;
    // the book, held (its shadow on the table under it) until the plonk
    if (tt < t1) inPlane(f, () => rentBook(bx + 1500 * away, by + 900 * away, BOOK.rot, up / (TB.a * f)));
    // the sleeve: from the wrist to the frame's corner, a forearm's thickness at the wrist, wider toward us; the cuff
    const E = [LL.from[0] + 400 * away, LL.from[1] + 200 * away], L = Math.hypot(E[0] - sx, E[1] - sy), dir = [(E[0] - sx) / L, (E[1] - sy) / L];
    look('card'); boilSeed('z3ll sleeve');
    piece(ribbon([[sx + dir[0] * s * .15, sy + dir[1] * s * .15], [E[0], E[1]]], s * 1.25, s * 2.1), LL.col.coat, { sw: 1.8, shade: LL.col.coatDk, depth: 6, key: 'z3llsl', lift: 8 });
    for (let i = 0; i < 14; i++) { const u = s * .6 + i * (L - s) / 14, v = (i % 3 - 1) * s * (.3 + .25 * u / L); dline([[sx + dir[0] * u - dir[1] * v, sy + dir[1] * u + dir[0] * v], [sx + dir[0] * (u + s * .3) - dir[1] * v, sy + dir[1] * (u + s * .3) + dir[0] * v]], 1.6, '#8A7A60'); }   // (tweed flecks)
    piece(ribbon([[sx + dir[0] * s * .05, sy + dir[1] * s * .05], [sx + dir[0] * s * .5, sy + dir[1] * s * .5]], s * 1.2, s * 1.28), LL.col.cuff, { sw: 1.4, key: 'z3llcf', lift: 8 });
    // the hand (gripping the book's end until the plonk, then opening off it), the ring on its ring finger
    push(); translate(0, -up);
    inPlane(f, () => {
      closeHand(W0[0], W0[1], hA, HAND_S, LL.col, 'z3ll', tt < t1 + .06 ? .8 : lerp(.8, .15, seg(tt, t1 + .06, t1 + .2)));   // (its fingers toward the book: closeHand's run back from the wrist, against its forearm's direction)
      const c = Math.cos(hA), sn = Math.sin(hA), u = -1.02, v = .3;
      piece(oval(W0[0] + (u * c - v * sn) * HAND_S, W0[1] + (u * sn + v * c) * HAND_S, .11 * HAND_S, .085 * HAND_S, hA, 14), '#D9A93A', { sw: 1.4, key: 'z3llring', lift: 3 });
    });
    pop();
    if (tt >= t1 && tt < t1 + .16) { const q = (tt - t1) / .16, [cx, cy] = toCar([bx, by], f); boilSeed('z3 plonk'); for (let i = 0; i < 6; i++) { const an = Math.PI * (1.05 + i * .18), r0 = 80 + 18 * q, r1 = r0 + 34 * (1 - q); dline([[cx + Math.cos(an) * r0, cy + Math.sin(an) * r0 * .6], [cx + Math.cos(an) * r1, cy + Math.sin(an) * r1 * .6]], 4 * (1 - q * .5), '#2A2230', 0); } }   // the plonk
    look('card');
  }

  // ---------- the set: their bay, from the aisle at the table's end (card, Z2's carriage: its colours, window, seats) ----------
  const WIN = { x0: 400, x1: 1520, y0: 50, y1: 420, gap: 40 };   // the window behind the table (its lower sash raised: the gap)
  function setBack(tt) {
    look('card'); boilSeed('z3w wall');
    piece(R4(-600, -400, W + 600, H + 400), TRC.wall, { ink: null, key: 'z3wwall', lift: 0, edge: false });
    const G = rRect(WIN.x0, WIN.y0, WIN.x1, WIN.y1, 56, 6);
    piece(G, TRC.night, { ink: null, key: 'z3wnight', lift: 0, edge: false });
    // the night: a far lamp, the dark roofs of the stopped train's siding
    glow(WIN.x0 + 330, WIN.y0 + 170, 160, '#FFB45E', .22); glow(WIN.x1 - 240, WIN.y0 + 250, 110, '#FFB45E', .16);
    piece([[WIN.x0 - 20, WIN.y1 - 70], [WIN.x0 + 220, WIN.y1 - 120], [WIN.x0 + 520, WIN.y1 - 96], [WIN.x0 + 800, WIN.y1 - 132], [WIN.x1 + 20, WIN.y1 - 88], [WIN.x1 + 20, WIN.y1 + 10], [WIN.x0 - 20, WIN.y1 + 10]], '#0C1019', { ink: null, key: 'z3wroofs', lift: 0, edge: false });
    crewOutside(tt);   // (the bots, out through the gap: behind the glass and the sash)
    look('card'); boilSeed('z3w frame');
    const gy = WIN.y1 - WIN.gap;
    piece(R4(WIN.x0 - 10, gy - 16, WIN.x1 + 10, gy), TRC.trim, { sw: 1.4, shade: TRC.wallDk, depth: 4, key: 'z3wsash', lift: 3 });   // the raised sash's rail
    dline(G.concat([G[0]]), 1.6, mixCol(TRC.wall, '#FFF7EA', .4), 0);
    const F = rRect(WIN.x0 - 24, WIN.y0 - 24, WIN.x1 + 24, WIN.y1 + 24, 70, 6); dline(F.concat([F[0]]), 4, TRC.trim, 0);
    piece(R4(WIN.x0 - 40, WIN.y1 + 22, WIN.x1 + 40, WIN.y1 + 44), TRC.sill, { sw: 1.4, key: 'z3wsill', lift: 3 });
    glow(960, 20, 700, '#FFF1D6', .1);   // (the ceiling light)
    // the seat backs either side, their faces toward the table (the chorus's moquette, the red diamonds)
    for (const sd of [-1, 1]) {
      const x = 960 + sd * 760; boilSeed('z3w seat' + sd);
      piece(curvy([[x - 110, H + 40], [x - 110, 250], [x - 70, 190], [x + 70, 190], [x + 110, 250], [x + 110, H + 40]], 3), TRC.moq || CAR.moq, { sw: 2, shade: CAR.moqDk, depth: 22, key: 'z3wseat' + sd, lift: 5 });
      for (let r = 0; r < 8; r++) { const y = 270 + r * 92; if (r % 2) piece(U([[0, -12], [12, 0], [0, 12], [-12, 0]], 1, x + 30 * sd, y), CAR.moqB, { ink: null, key: 'z3wdm' + sd + r, lift: 0, flatCard: true, edge: false }); }
    }
  }
  // the table top in the wide (screen): its near end full width, its far end narrower (it recedes to the window)
  function tableTrap(f) {
    const [x0] = toCar([TB.x0, 0], f), [x1] = toCar([TB.x1, 0], f), yf = toCar([0, TB.nbFar], f)[1], k = lerp(TB.taper, 1, clamp((f - TB.f) / (1 - TB.f)));   // (straight down: no taper)
    const hw = (x1 - x0) / 2, cx = (x0 + x1) / 2, yn = toCar([0, TB.nbEnd], f)[1], kn = lerp(k, 1, (TB.nbEnd - TB.nbFar) / (TB.nbNear - TB.nbFar));   // (the near end: its width on the taper's way to nbNear)
    return [[cx - hw * k, yf], [cx + hw * k, yf], [cx + hw * kn, yn], [cx - hw * kn, yn]];
  }
  function setTableTop(f) {
    const T = tableTrap(f);
    look('card'); boilSeed('z3w top');
    piece(T.map(([x, y]) => [x, y + 10]), '#000000', { ink: null, op: 60, key: 'z3wtsh', lift: 0, flatCard: true, edge: false });   // (its shadow on the wall and the floor)
    piece(T, NB.table, { sw: 1.8, key: 'z3wtop', lift: 4 });
    dline([T[0], T[1]], 2, WOOD.lt, 0); dline([T[3], T[0]], 1.4, WOOD.lt, 0); dline([T[1], T[2]], 1.4, WOOD.lt, 0);
    return T;
  }
  // the table's near end: its thickness, the pedestal, and under it the floor between the seats (in the dark under the
  // table: their shins, and the floor running on toward the window wall)
  function setTableEdge(f) {
    look('card'); boilSeed('z3w table');
    const T = tableTrap(f), [xl, yn] = T[3], xr = T[2][0], [x0] = toCar([TB.x0, 0], 1), [x1] = toCar([TB.x1, 0], 1);
    piece(R4(x0 - 20, yn - 40, x1 + 20, H + 60), TRC.floor, { ink: null, key: 'z3wfloor', lift: 0, edge: false });
    piece(R4(x0 - 20, yn - 40, x1 + 20, yn + 60), mixCol(TRC.floor, '#000000', .35), { ink: null, key: 'z3wunder', lift: 0, flatCard: true, edge: false });   // (the shadow under the table)
    piece(R4(960 - 30, yn + 20, 960 + 30, H + 60), CAR.tableDk, { sw: 1.4, key: 'z3wleg', lift: 3 });
    piece(R4(xl, yn, xr, yn + 26), WOOD.edge, { sw: 1.8, key: 'z3wedge', lift: 5 });   // (the laminate's edge: a darker wood)
  }

  // ---------- the two of them at the table (the wide) ----------
  // look toward a point p from a head at h: lookX along their facing, lookY down
  const lookTo = (h, p, facing) => ({ lookX: clamp(facing * (p[0] - h[0]) / 220, -1, 1), lookY: clamp((p[1] - h[1]) / 240, -.7, .9) });
  const SIT = { u: 47, fy: 1000, her: 350, him: 1575 };   // their unit, floor line and places (their seats either side of the table)
  const HEAD = { her: [400, 220], him: [1525, 245] };
  function z3People(t, tt, f, who) {
    const bots = botsAt(tt, f), book = toCar([BOOK.at[0], BOOK.at[1]], f), phone = toCar([PH.cx, PH.cy], f);
    const watching = tt < RENT.i;
    const tgt = w => tt < T3.lookBook ? (watching ? bots : toCar([400, 450], f)) : tt < T3.lookEach ? book : tt < T3.lookPhone ? HEAD[w === 'her' ? 'him' : 'her'] : phone;
    const flinch = tt >= T3.plonk - .02 && tt < T3.plonk + .1, u = SIT.u, sH = SEAT_H;
    // Tess: she sings her lines (card lip-sync: her voice)
    const eH = calmE(emotions(tt, [[T3.pull[0], 'neutral'], [Z3.bots - .02, 'surprised', { mouth: 'flat' }], [Z3.bots + .5, 'happy', { mouth: 'smirk' }], [RENT.i, 'bored', { mouth: 'flat' }],
      [T3.lookBook, 'bored', { mouth: 'flat' }], [T3.lookEach, 'smug', { mouth: 'smirk' }], [T3.lookPhone, 'surprised', { mouth: 'flat' }]], { take: .3 }));
    // (her arms folded, dry, watching: the notebook is out of her reach now her phone lies between it and her, and a hand on
    // the table by the phone would vanish from the shots from above. It was a hand at the table's end, the forearm stuck
    // straight out, a bar at table height)
    if (who !== 'him') person(SIT.her, SIT.fy, u, HER_C, { ...eH, ...lookTo(HEAD.her, tgt('her'), 1), eyes: flinch ? 'closed' : eH.eyes, view: 'q', seated: true, seatH: sH, boilKey: 'z3her', noShadow: true,
      pose: 'cross' });
    if (who === 'her') return;
    // Rowan: his mouth shut (his line is his hand's, over the pages); his near hand on the table, the other in his lap.
    // His sweep (the user: "have him reach up and onto the table and sweep the bills down off frame. He's a short guy so he
    // might need to really stretch his body onto the table"): the stack lies on her left page, well out of his reach, so
    // he gets up off his seat onto the table, his front on it, tipped right over it and stretched out along it, and his
    // near arm out to the stack; the back of his hand to its right edge, and he sweeps it down the table toward us, the
    // book on the bill, over the near end (sweptBy); then back onto his seat. He's over the table's top and its edge,
    // never through it: nothing of him is hidden but what's under the table (his legs, kneeling on the seat, behind the
    // seat's end). (He used to lean in from his seat, a third as far, to a stack on the table's near half: that part of
    // the table hid his lap, so the lean cut his body and his arm off at a line across the table)
    const eM = calmE(emotions(tt, [[T3.pull[0], 'neutral', { mouth: 'flat' }], [Z3.bots - .02, 'surprised', { mouth: 'flat' }], [Z3.bots + .5, 'happy', { mouth: 'smile' }], [RENT.i, 'neutral', { mouth: 'flat' }],
      [T3.lookBook, 'neutral', { mouth: 'flat' }], [T3.lookEach, 'bored', { mouth: 'smile' }], [T3.push[0] - .3, 'determined', { mouth: 'flat' }], [T3.lookPhone, 'surprised', { mouth: 'flat' }]], { take: .3 }));
    const [p0, p1] = T3.push, uM = u * 1.02, rest = [1365, toCar([0, 900], f)[1]], hip0 = [SIT.him, SIT.fy - sH * uM];
    // his hips (screen) and his tip (rad): up off the seat and onto the table's side, over it; along with the sweep; back
    const BK = [[p0 - .34, [...hip0, 0]], [p0 - .24, [hip0[0] + 8, hip0[1] + 6, .05]], [p0 - .04, [1420, 690, -.6]], [T3_HIT, [1414, 696, -.64]], [p1, [1400, 718, -.76]], [p1 + .1, [1404, 714, -.74]], [p1 + .42, [...hip0, 0]]];
    const [hx, hy, rot] = kf(tt, BK, ease), gx = hx - sH * uM * Math.sin(rot), gy = hy + sH * uM * Math.cos(rot);   // (his ground point, from his hips through his tip)
    // his near hand (screen): from the table by him, over to the stack's right edge (the far corner), down onto the page,
    // down the table with the stack to its near end, a follow-through as the stack goes over; back
    const hM = kf(tt, [[p0 - .34, rest], [p0 - .04, [1062, 572]], [T3_HIT, [1048, 602]], [p1, [988, 788]], [p1 + .1, [995, 768]], [p1 + .42, rest]], ease);
    const lean = clamp(-rot / .9), c = Math.cos(rot), sn = Math.sin(rot), vx = hM[0] - gx, vy = hM[1] - gy;   // (the hand's place in his own frame: tipped, flipped)
    const look = tt > p0 - .3 && tt < p1 + .2 ? lookTo(HEAD.him, toCar(BILL_AT, f), -1) : lookTo(HEAD.him, tgt('him'), -1);   // (on the stack while he goes for it)
    person(gx, gy, uM, HIM_C, { ...eM, ...look, eyes: flinch ? 'closed' : eM.eyes, sing: false, view: 'q', flip: true, seated: true, seatH: sH, boilKey: 'z3him', noShadow: true, rot,
      pose: { L: PPOSE.lap.L, R: [-(vx * c + vy * sn) / uM, (-vx * sn + vy * c) / uM, .12, 'relax', 1, lerp(.05, .35, lean) + rot, 'u'] } });
  }

  // ---------- the frames ----------
  // the table top's things, in nb (both cameras)
  function tableThings(tt, o = {}) {
    nbPaperBack();
    let turned = 0; for (const tk of Z4.turns) if (tt >= tk + .4) turned++;
    const turning = Z4.turns.findIndex(tk => tt >= tk && tt < tk + .4);
    onRightPage(tt, turned === 0 && turning < 0 ? 'us' : PAGES[Math.min(PAGES.length - 1, turned + (turning >= 0 ? 1 : 0))]);
    if (turning >= 0) pageTurn(tt, ease(seg(tt, Z4.turns[turning], Z4.turns[turning] + .4)), PAGES[turning]);
    nbSpiral();
    if (o.phone !== false) z3Phone(tt);
    if (o.stack !== false) tableStack(tt);
    return { turned, turning };
  }
  // the bill, and the rent book on it once it's been plonked down
  function tableStack(tt) {
    if (tt >= BILL.slap) tableBill(tt);
    if (tt >= T3.plonk) { const d = sweptBy(tt); if (!d.gone) rentBook(BOOK.at[0] + d.dx, BOOK.at[1] + d.dy, BOOK.rot + d.rot); }
  }
  // in the wide: drawn over the table top unclipped, so as it's swept over the table's near end it hangs over the edge
  // (in the table's plane, as a sheet does) and then falls, down out of the frame
  function stackCar(tt, f) {
    const d = sweptBy(tt); if (d.gone) return;
    push(); translate(d.drop[0], d.drop[1]); inPlane(f, () => tableStack(tt)); pop();
  }
  // his hand from above: to the phone, turning it face down, to the page's edge, waiting; then the turns (as they always
  // were: the grip's path, padOf); after the last turn it lifts away
  function hisHand(tt, turned, turning) {
    let pad, curl = 0;
    if (turned > 0 || turning >= 0) {
      const turnK = turning >= 0 ? seg(tt, Z4.turns[turning], Z4.turns[turning] + .4) : 0;
      const hx = turning >= 0 ? lerp(PGR.x1 - 60, PGR.x0 - PGR.w * .6, ease(turnK)) : PGR.x0 - 140;
      const hy = turning >= 0 ? PGR.y0 + 220 - 60 * Math.sin(Math.PI * turnK) : PGR.y0 + 240;
      const done = ease(seg(tt, Z4.turns[2] + .45, Z4.turns[2] + .85)), p = padOf(hx, hy);
      pad = [p[0] + 1300 * done, p[1] - 1300 * done]; curl = turning >= 0 ? 1 : 0;   // (after the last turn: back up to his side)
    } else if (tt >= T3.reach[0]) {
      const th = phoneTurn(tt), grip = [PH.cx + 60, PH.cy - (PH.h / 2 - 14) * Math.cos(th) - 70 * Math.sin(th)];   // (its far edge, lifted up and over toward him)
      if (tt < T3.reach[1]) pad = mix2([2900, -200], grip, ease(seg(tt, ...T3.reach)));
      else if (tt < T3.toPage[0]) { pad = grip; curl = .8; }
      else { pad = mix2(grip, TURN0, ease(seg(tt, ...T3.toPage))); curl = lerp(.8, 1, seg(tt, ...T3.toPage)); }   // (it arrives gripping the page's edge, as the first turn takes it: it went flat on the page, then snapped into the grip on the turn)
    } else return;
    pageHand(pad[0], pad[1], curl, 'z3him');
  }
  const TURN0 = padOf(PGR.x1 - 60, PGR.y0 + 220);   // (the first turn's grip)
  // from above (nb): the bill landing, then over the table to the flip
  function tdFrame(t, tt, sk = [0, 0]) {
    const cam = zCam(t), hw = W / 2 / cam[2], hh = H / 2 / cam[2];
    camBegin(cam[0] + sk[0] / cam[2], cam[1] + sk[1] / cam[2], cam[2]);
    look('card');
    if (cam[0] + hw > 1990 || cam[0] - hw < -100 || cam[1] - hh < -95 || cam[1] + hh > 1180) { tableAll(); tableExt(); }
    nbTable(tt, cam[2]);
    const { turned, turning } = tableThings(tt, { phone: cam[0] - hw < PH.x1 + 60 });
    hisHand(tt, turned, turning);
    if (tt < BILL.slap) tableBill(tt);   // (coming down from the lens: over everything)
    camEnd();
  }
  // the wide: the two of them at the table, the table top laid on it
  function carFrame(t, tt, C) {
    const f = C.f;
    camBegin(C.cx, C.cy, C.zoom);
    setBack(tt);
    setTableEdge(f);
    const TT = setTableTop(f);
    clipPoly(TT, () => inPlane(f, () => { nbTable(tt, C.zoom * TB.a); tableThings(tt, { stack: false }); }));
    stackCar(tt, f);
    crewTable(tt, f); crewOutside(tt, true);
    // (the two of them beside the table: their laps go under it, hidden by its top and its edge; below the edge, in the
    // dark under it, her shins)
    { const [x0] = toCar([TB.x0, 0], f), [x1] = toCar([TB.x1, 0], f), yl = toCar([0, 1000], f)[1], yn = toCar([0, TB.nbEnd], f)[1];
      // (him: nothing hidden but what's under the table: as he stretches out over it, he's over its top and its edge)
      clipPoly([R4(-800, -800, W + 800, H + 800), R4(x0 + 4, yl, x1 - 4, yn + 26)], () => z3People(t, tt, f, 'her'));
      clipPoly([R4(-800, -800, W + 800, H + 800), R4(x0 + 4, yn + 26, x1 - 4, H + 800)], () => z3People(t, tt, f, 'him'));
      // the ends of their seats (the aisle ends of the cushions, at their hips), over their legs: the legs are under the table
      look('card');
      for (const [sd, xa, xb] of [[-1, -300, x0 - 2], [1, x1 + 2, W + 300]]) { boilSeed('z3w cushion' + sd);
        piece(curvy([[xa, yl + 22], [xb, yl + 22], [xb, H + 60], [xa, H + 60]], 2), CAR.moq, { sw: 2, shade: CAR.moqDk, depth: 14, key: 'z3wcush' + sd, lift: 6 });
        dline([[xa, yl + 34], [xb, yl + 34]], 1.2, CAR.moqA, 0); } }
    landlord(tt, f);
    camEnd();
    look('card');
  }
  function tableFrame(t) {
    const tt = mt(t), C = carCam(t);
    const sk = t >= BILL.slap && t < BILL.slap + .28 ? shakeXY(t, 9 * (1 - seg(t, BILL.slap, BILL.slap + .28))) : [0, 0];   // (the slap's shake, on ones)
    if (C) carFrame(t, tt, C); else tdFrame(t, tt, sk);
    look('card');
  }
  SHOT.Z3 = (t, lt, dur) => tableFrame(t);
  // a page turning over the spine (right to left): its front (the old doodle) squashed, then its back (bare ruled paper)
  function pageTurn(t, k, fromWhich) {
    const a = k * Math.PI, cw = Math.cos(a), x0 = PGR.x0, w = PGR.w * Math.abs(cw), lift = Math.sin(a) * 40;
    if (cw > 0) {
      const Q = [[x0, PGR.y0 - lift], [x0 + w, PGR.y0 - lift * .4], [x0 + w, PGR.y1 + lift * .4], [x0, PGR.y1 + lift]];
      clipTo([Q]);   // (the first page's front is the plain doodle of the two of them: no loop, no machinery any more)
      push(); translate(x0, PGR.y0); scale(PGR.k * cw, PGR.k); pageDoodle(t, fromWhich); pop();
      clipEnd();
    } else { look('card'); boilSeed('z4 back'); piece([[x0 - w, PGR.y0 - lift * .4], [x0, PGR.y0 - lift], [x0, PGR.y1 + lift], [x0 - w, PGR.y1 + lift * .4]], '#F4EFE4', { sw: 1.4, key: 'z4pback', lift: 12 }); }
    look('card');
  }
  const PAGES = ['us', 'birds', 'run', 'clink'];
  SHOT.Z4 = (t, lt, dur) => tableFrame(t);
  // for the outro (her hand on the notebook open at the Friday): the notebook and its pages, drawn like here
  // the notebook's pages are finished drawings on the table: their lines don't boil (only a line being drawn moves), and
  // nothing on them moves: the birds' wings flapped, the sun's rays turned and the faces blinked in the flip (the user)
  { const live = pageDoodle; pageDoodle = (t, which, o = {}) => stillDrawing(() => live(o.couple ? t : 7, which, o), 7); }
  window.FINAL = { nbTable, nbPaperBack, nbSpiral, onRightPage, pageDoodle, PGR };
})();

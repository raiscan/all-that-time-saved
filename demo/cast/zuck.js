// zuck.js: a satirical caricature of Mark Zuckerberg's public persona, 2024-26: a short, gym-built tech boss with a
// thick neck and blocky MMA shoulders, a grown-out mop of tight curls, pale skin, an oversized black tee and a chunky
// gold chain. The caricature lives in the eyes: huge, perfectly round, wide open, tiny pupils, an unblinking stare,
// over a small, tight, rehearsed closed-lip smile. He moves like a machine: small precise head turns that snap and
// hold, a mechanical shutter blink, a stepped robotic wave. White gloves (tech bosses always wear them).
//
// zuck(x, y, u, o): (x, y) = the ground point between his feet; u = unit (he's ~12.6u tall; the commuter ~13.4u).
// Views: front | q (3/4, facing right; flip: true faces left). Takes feel()/emotions() spreads for the face and body
// life, plus:
//   pose: a name from ZKPOSE (idle low toast sip wave table tableToast tableSip guard hips point), or zkPoses(t, keys)
//   flute / fluteL: true or { fill, clink, tilt }: a champagne flute held upright in the right / left hand
//   hold / holdL: (s) => draws any other prop in hand space (as for commuter())
//   seated (no legs) · table: () => {...} draws in world space between his body and his front arms (a table top his
//   hands rest on) · glasses (chunky smart glasses) · robot: false (no head tics or shutter blinks) · tilt (head, rad)
//   zmouth: force his mouth (stiff flat laugh grin o oh sip, or any mouthH kind) · blink: 0..1 forces the shutter
//   seed (tic phase) · boilKey · noShadow · emote/emoteK/emoteAge (as commuter)
// The recent era (2024-26: grown-out loose curls, black oversized tee, gold chain; a 2010s grey-tee crop was dropped):
// a longish face on a squarer jaw, pale skin, big ears, smallish wide-set pale eyes held in a steady, unblinking stare
// under light straight brows, a long straight nose, a small stiff closed-lip smile.
const ZK = {
  skin: '#E4CDBC', skinDk: '#B4937F', skinLt: '#F3E4D8', skinSh: '#CDB09D', brow: '#7A5A44',
  hair: '#6E4A32', hairDk: '#452D1E', hairLt: '#A27A58',
  tee: '#2B2730', teeDk: '#18141B', teeLt: '#4C4553', rim: '#B3A69C',
  jeans: '#30323C', jeansDk: '#202129', shoe: '#1E1B21', sole: '#E2DACB',
  gold: '#E3B047', goldDk: '#9A6A1C', goldLt: '#FFE8A6',
  iris: '#8FA6B8', irisDk: '#4C5E6E', lip: '#B07F70', lipDk: '#8A5E50', white: '#F7F2EA', frame: '#1A171D',
};
// Short legs: everything above the hips is drawn in a body frame ZK_DROP units lower than the ground frame (so body y
// = world y - ZK_DROP); the tables below are in body units. He stands ~12.6u tall.
const ZK_DROP = .6;
// Hand targets in body units: [x, y, bend, hand pose, front (drawn over the body), elbow (optional, overrides bend)].
const ZKPOSE = {
  idle:       { L: [-3.2, -3.85, .1, 'relax'], R: [3.2, -3.85, .1, 'relax'] },          // lats: the arms hang wide
  low:        { L: [-2.95, -3.55, .06, 'relax'], R: [2.95, -3.55, .06, 'relax'] },
  toast:      { L: [-3.2, -3.85, .1, 'relax'], R: [3.1, -8.7, .3, 'hold', 1] },           // flute raised to head height
  sip:        { L: [-3.2, -3.85, .1, 'relax'], R: 'sip' },                                // flute at the lips (placed from the mouth)
  wave:       { L: [-3.2, -3.85, .1, 'relax'], R: 'wave' },                               // stepped, robotic
  table:      { L: [-1.9, -5.15, .35, 'relax', 1], R: [2.0, -5.1, .35, 'relax', 1] },     // forearms on a table top
  tableToast: { L: [-1.9, -5.15, .35, 'relax', 1], R: [3.1, -8.7, .3, 'hold', 1] },
  tableSip:   { L: [-1.9, -5.15, .35, 'relax', 1], R: 'sipT' },                         // elbow planted on the table
  guard:      { L: [-1.45, -7.75, 0, 'fist', 1, [-2.6, -5.0]], R: [1.6, -7.55, 0, 'fist', 1, [2.7, -4.9]] },    // MMA guard
  hips:       { L: [-2.55, -4.5, .85, 'fist'], R: [2.55, -4.5, .85, 'fist'] },
  point:      { L: [-3.2, -3.85, .1, 'relax'], R: [4.4, -6.7, .12, 'point', 1] },
};
// Snap between poses: each change is a quick servo move (0.2 s) with a tiny overshoot, then a dead-still hold.
// keys = [[t, name or { L, R }], ...]. During a move each hand is ['mix', from, to, k]; zuck() resolves it, blending
// elbows as well as wrists (so the wave and the sip, which place their own elbows, blend cleanly too).
function zkPoses(t, keys, blend = .2) {
  let i = 0; while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
  const get = n => ZKPOSE[n] || n, cur = get(keys[i][1]); if (i === 0 || t >= keys[i][0] + blend) return cur;
  const prev = get(keys[i - 1][1]), k = zkServo(seg(t, keys[i][0], keys[i][0] + blend));
  return { L: ['mix', prev.L, cur.L, k], R: ['mix', prev.R, cur.R, k] };
}
// A servo move 0..1: fast, precise, a 5% overshoot and settle. No ease-in: machines don't anticipate.
function zkServo(x) { x = clamp(x); return x < .6 ? easeOut(x / .6) * 1.05 : 1.05 - .05 * ease((x - .6) / .4); }
// Robot tics at time t: a head turn (-1..1) and tilt (rad) that hold still, then snap to the next of a fixed cycle
// (centre, right, centre, left); and a mechanical shutter blink (0..1), rare and exact.
function zkTic(t, seed = 0) {
  const per = 1.55, p = t / per + seed * .31, i = Math.floor(p), f = frac(p), k = zkServo(seg(f, 0, .13));
  const TURN = [0, .75, 0, -.6, .2, -.2], TILT = [0, .035, -.01, -.03, .02, 0], at = (A, j) => A[((j % A.length) + A.length) % A.length];
  const turn = lerp(at(TURN, i - 1), at(TURN, i), k), tilt = lerp(at(TILT, i - 1), at(TILT, i), k);
  const b = frac(t / 4.3 + seed * .53) * 4.3, blink = b < .05 ? b / .05 : b < .12 ? 1 : b < .17 ? 1 - (b - .12) / .05 : 0;
  return { turn, tilt, blink };
}
// The robotic wave: the forearm ticks between two angles, holding still at each (hand target spec).
function zkWaveSpec(t) {
  const f = frac(t * 1.25), k = f < .5 ? zkServo(seg(f, 0, .16)) : 1 - zkServo(seg(f, .5, .66)), a = lerp(-.1, .4, k);
  const E = [3.75, -6.85], L = 2.25;
  return [E[0] + Math.sin(a) * L, E[1] - Math.cos(a) * L, 0, 'open', 1, E];
}

// A curly edge: walks the path P and turns each of n uneven stretches into a round bump bulging to the left of the
// direction of travel ((dy, -dx): outward, for an outline drawn clockwise on screen). amp ≈ bump height / length.
function zkCurlEdge(P, n, amp, key = 0) {
  const C = through(P, 8), L = [0];
  for (let i = 1; i < C.length; i++) L.push(L[i - 1] + Math.hypot(C[i][0] - C[i - 1][0], C[i][1] - C[i - 1][1]));
  const tot = L[L.length - 1], at = d => { let i = 1; while (i < C.length - 1 && L[i] < d) i++; const k = clamp((d - L[i - 1]) / ((L[i] - L[i - 1]) || 1)); return [lerp(C[i - 1][0], C[i][0], k), lerp(C[i - 1][1], C[i][1], k)]; };
  const ws = []; for (let i = 0; i < n; i++) ws.push(.8 + .45 * hash(i * 7.3 + key)); const wsum = ws.reduce((a, b) => a + b, 0);
  const out = []; let d0 = 0;
  for (let i = 0; i < n; i++) {
    const d1 = d0 + ws[i] / wsum * tot, a = at(d0), b = at(d1), dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    const nx = dy / len, ny = -dx / len, h = amp * len * (.85 + .3 * hash(i * 3.7 + key + 1));
    for (let k = 0; k < 8; k++) { const t = k / 8, s = Math.pow(Math.sin(Math.PI * t), .75); out.push([lerp(a[0], b[0], t) + nx * h * s, lerp(a[1], b[1], t) + ny * h * s]); }
    d0 = d1;
  }
  out.push(at(tot));
  return out;
}
// One tight curl drawn on the hair: a small round arch (the top of a coil catching the light), tipped by rot.
function zkCurl(cx, cy, r, rot, col, sw) {
  const P = []; for (let i = 0; i <= 10; i++) { const a = rot + Math.PI * (.92 + i / 10 * 1.16); P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * .9]); }
  dline(P, sw, col, .4);
}
// A circle segment of radius r (x squashed by sx) cut by the horizontal chord at height h, on the side `side` (-1 above, 1 below).
function zkSegment(r, sx, h, side) {
  h = clamp(h, -r * .999, r * .999);
  const phi = Math.asin(h / r), P = [];
  const a0 = side < 0 ? Math.PI - phi : phi, a1 = side < 0 ? TAU + phi : Math.PI - phi;
  for (let i = 0; i <= 24; i++) { const a = lerp(a0, a1, i / 24); P.push([Math.cos(a) * r * sx, Math.sin(a) * r]); }
  return P;
}
// His eye: big, perfectly round, the whites all the way round a small pale iris and a pin-prick pupil.
// o: sx (3/4 squash), look [x, y], iris (scale), open 0..1 (upper lid), lower 0..1 (lower lid), shut 0..1 (the shutter
// blink: both lids meet dead centre, flat), skin, sw, key.
function zkEye(x, y, r, o = {}) {
  if (STYLE.card && typeof cardEye === 'function') { o = cardEye(o); if (o.shut) o.shut = Math.round(o.shut * 2) / 2; }   // (card: the eye chart, mouths.js; the shutter open, half or shut)
  const sw = o.sw ?? 1.4, sxi = o.sx ?? 1, sx = sxi * (o.ax ?? 1), skin = o.skin || ZK.skin, k = o.key || 'zke';   // (o.ax: the eye's width / height; the iris stays round)
  push(); translate(x, y);
  // the socket: a crease arc above and a faint bag below (the tired, wired stare)
  dline(zkArc(0, 0, r * 1.22 * sx, r * 1.24, Math.PI * 1.2, Math.PI * 1.8), sw * .5, ZK.skinSh, .4);
  dline(zkArc(0, r * .04, r * 1.12 * sx, r * 1.15, Math.PI * .25, Math.PI * .75), sw * .4, ZK.skinSh, .4);
  const shut0 = clamp(o.shut || 0);
  if (shut0 > .98) {   // the shutter closed: a lid disc and one dead-level line
    piece(oval(0, 0, r * sx, r, 0, 40), skin, { sw: sw * .5, key: k + 'w', lift: 1, flatCard: true });
    dline([[-r * sx * 1.02, 0], [r * sx * 1.02, 0]], sw * 1.1, NOIR.ink, 0);
    pop(); return;
  }
  if (STYLE.mode === 'bank') {   // (on the note the white is the bare paper: modelled as a piece, engraved arcs ran through it)
    _paint(oval(0, 0, r * sx, r, 0, 40), { wash: BANK.paper, ink: null });
    dline(oval(0, 0, r * sx, r, 0, 40).concat([[r * sx, 0]]), sw * .5, BANK.ink, 0);
  } else piece(oval(0, 0, r * sx, r, 0, 40), ZK.white, { sw: sw * .5, key: k + 'w', lift: 2, flatCard: true });
  const lk = o.look || [0, 0], ir = r * .56 * (o.iris ?? 1), ix = clamp(lk[0], -1, 1) * r * .5 * sx, iy = clamp(lk[1], -1, 1) * r * .4;
  // (the banknote engraves a piece's tone as hatching: the pale iris printed as a scribble of lines through the eye, and
  // the pin-prick pupil too small to take its lines (the user: "his eyes look a bit funky"). On the note, as the bosses'
  // pupils are: the iris a clean engraved ring, the pupil solid ink)
  if (STYLE.mode === 'bank') {
    dline(oval(ix, iy, ir * sxi, ir, 0, 22).concat([[ix + ir * sxi, iy]]), sw * .55, BANK.ink, 0);
    _paint(oval(ix, iy, ir * .42 * sxi, ir * .42, 0, 14), { wash: BANK.ink, ink: null });
  } else {
    piece(oval(ix, iy, ir * sxi, ir, 0, 22), ZK.iris, { ink: null, key: k + 'i', lift: 1, flatCard: true });
    dline(oval(ix, iy, ir * sxi, ir, 0, 22).concat([[ix + ir * sxi, iy]]), sw * .4, ZK.irisDk, 0);
    piece(oval(ix, iy, ir * .36 * sxi, ir * .36, 0, 12), '#110B0E', { ink: null, key: k + 'p', lift: 0, flatCard: true });
  }
  piece(oval(ix - ir * .42 * sxi, iy - ir * .42, ir * .22 * sxi, ir * .22, 0, 8), '#FFFFFF', { ink: null, key: k + 'h', lift: 0, flatCard: true });
  // lids: flat chords, like a camera shutter
  const shut = clamp(o.shut || 0), low = clamp(o.lower || 0), rl = r - sw * .45;
  let yl = lerp(r, r * .05, low), yu = lerp(yl, -r, clamp(o.open ?? 1));
  yu = lerp(yu, 0, shut); yl = lerp(yl, 0, shut);
  const lid = (h, side, w) => {
    const P = zkSegment(rl, sx, h, side); piece(P, skin, { ink: null, key: k + (side < 0 ? 'lu' : 'll'), lift: 0, flatCard: true, edge: false });
    const hw = Math.sqrt(Math.max(0, r * r - h * h)) * sx; if (w > 0) dline([[-hw, h], [0, h + side * r * .015], [hw, h]], sw * w, NOIR.ink, .2);
  };
  if (yu > -r * .96) lid(yu, -1, shut > .5 ? 1.1 : 1.2);
  else dline(zkArc(0, 0, r * sx, r, Math.PI * 1.1, Math.PI * 1.9, 16), sw * 1.05, NOIR.ink, .3);   // the upper lash line
  if (yl < r * .96) lid(yl, 1, shut > .5 ? 0 : .45);
  pop();
}
const zkArc = (cx, cy, rx, ry, a0, a1, n = 12) => { const P = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); P.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return P; };
// His brows: thin, straight, a little lighter than the hair (a tapered stroke; raise [inner, outer] in brow widths).
function zkBrow(x, y, s, raise, side, sw) {
  const [ri, ro] = raise, at = t => [x + side * s * lerp(-.5, .5, t), y - lerp(ri, ro, t) * s * .8 - s * .07 * Math.sin(Math.PI * t) + s * .04 * t];
  browPiece(browShape([0, .3, .65, 1].map(at), s * .15, s * .05), ZK.brow, sw, 'zkbrow' + Math.round(x));   // (style.js: a smooth taper)
}
// His 3/4 nose (head units through H, facing right), smallish and neat, as its own piece over the head: the ridge from
// the root between the eyes (just under the brows, nearer the far eye) down past the far eye's inner corner, meeting the
// tip along its tangent; the tip breaks the cheek's line a little; the near wing and nostril sit inside the face. One
// line runs down the ridge and round the tip (the head outline's weight where it's out past the head).
function zkNoseQ(H, N, u, sw, headP) {
  const [tx, ty] = N.tip, tr = N.tr, th = N.th, [wx, wy] = N.wing, wr = N.wr, nline = mixCol(ZK.skinDk, NOIR.ink, .45);
  const lp = N.ridge[N.ridge.length - 1], px0 = (lp[0] - tx) / tr, py0 = (lp[1] - ty) / th, dd = Math.hypot(px0, py0);
  const a0 = Math.atan2(py0, px0) + (dd > 1.02 ? Math.acos(1 / dd) : .3), J = [tx + Math.cos(a0) * tr, ty + Math.sin(a0) * th];
  const R = through(N.ridge, 6).concat([[lerp(lp[0], J[0], .5), lerp(lp[1], J[1], .5)], J]), tipArc = zkArc(tx, ty, tr, th, a0, Math.PI * .72, 14).slice(1);
  const wingArc = zkArc(wx, wy, wr, wr * .9, Math.PI * .42, Math.PI * 1.3, 12), n = R.length;
  const back = R.slice(0, Math.floor(n * .8)).map(([a, b], i) => [a - lerp(.05, N.nw, Math.pow(i / (n - 1), .8)), b + lerp(.03, N.nw * .3, i / (n - 1))]).reverse();
  piece(H(R.concat(tipArc, wingArc, back)), ZK.skin, { ink: null, shade: ZK.skinSh, depth: th * .6 * u, key: 'zknoseq', lift: 1, flatCard: true, edge: false });
  piece(ribbon(H(R.slice(Math.floor(n * .2)).map(([a, b], i, A) => [a - lerp(.03, tr * .45, i / (A.length - 1)), b + lerp(.02, th * .25, i / (A.length - 1))])), .02 * u, tr * .7 * u), mixCol(ZK.skin, ZK.skinSh, .7), { ink: null, key: 'zkbridge', lift: 0, flatCard: true, edge: false });
  const P = H(R.concat(tipArc.slice(0, -2)));
  dline(P, sw * .8, nline, .4);
  if (!STYLE.card && headP) {
    let run = [];
    const flush = () => { if (run.length > 1) edgeLine(run, sw * (STYLE.mode === 'ink' ? .8 : 1.1), NOIR.ink, false); run = []; };   // (ink: lighter, or its caps blob)
    P.forEach(p => { if (!inPoly(p[0], p[1], headP)) run.push(p); else { if (run.length) run.push(p); flush(); } });
    flush();
  }
  dline(H(zkArc(wx, wy, wr, wr * .9, -Math.PI * .92, Math.PI * .4, 12)), sw * .55, nline, .5);
  piece(oval(...H([[lerp(wx, tx, .55), ty + th * .72]])[0], wr * .45 * u, wr * .2 * u, -.2, 12), ZK.lipDk, { ink: null, key: 'zknh', lift: 0, flatCard: true, edge: false });
  piece(oval(...H([[tx - tr * .25, ty - th * .45]])[0], tr * .28 * u, th * .18 * u, -.4, 12), ZK.skinLt, { ink: null, key: 'zknhl', lift: 0, flatCard: true, edge: false });
}
// His front nose (head units through H): long and straight: the bridge's shadow down the side away from the light, one
// soft shape for the tip and wings (outlined round the wings and under the tip, open over the top), nostrils, a highlight.
function zkNoseF(H, nx, u, sw) {
  const top = -10.1, ny = -9.08, tw = .25, th = .23, wr = .16, wx = .27, wy = .08, nline = mixCol(ZK.skinDk, NOIR.ink, .4);
  piece(ribbon(H([[nx + .04, top], [nx + tw * .42, lerp(top, ny, .62)], [nx + tw * .78, ny - th * .55]]), .04 * u, tw * .5 * u), mixCol(ZK.skin, ZK.skinSh, .8), { ink: null, key: 'zknbridge', lift: 0, flatCard: true, edge: false, maxTone: .45 });
  const NU = ellipseUnion([[nx, ny, tw, th], [nx - wx, ny + wy, wr, wr * .85], [nx + wx, ny + wy, wr, wr * .85]], [nx, ny + wy * .5]);
  if (STYLE.mode === 'doodle') _paint(H(NU), { wash: '#FBF8F0', ink: null });
  piece(H(NU), ZK.skin, { ink: null, shade: ZK.skinSh, depth: th * .5 * u, key: 'zknose', lift: 1, flatCard: true, maxTone: .45 });
  const skip = a => { const d = ((a + Math.PI / 2) % TAU + TAU) % TAU; return d > TAU - .95 || d < .95; };
  const run = openRun(NU, skip); if (run.length > 2) dline(H(run), sw * .6, nline, .5);
  for (const sd of [-1, 1]) piece(oval(...H([[nx + sd * wx * .52, ny + th * .78]])[0], wr * .42 * u, wr * .22 * u, sd * .45, 14), ZK.lipDk, { ink: null, key: 'zknh' + sd, lift: 0, flatCard: true, edge: false });
  piece(oval(...H([[nx - tw * .35, ny - th * .4]])[0], tw * .28 * u, th * .2 * u, -.5, 12), ZK.skinLt, { ink: null, key: 'zknhl', lift: 0, flatCard: true, edge: false });
}
// His mouth, centred at (x, y), width w; sx squashes it for 3/4. kinds: stiff (the rehearsed closed-lip smile), flat,
// laugh (rehearsed: "ha. ha. ha."), grin (even robot teeth), o, oh, sip; anything else falls through to mouthH().
function zkMouth(x, y, w, kind, o = {}) {
  const sw = o.sw ?? 1.4, W = w / 2;
  push(); translate(x, y); scale(o.sx ?? 1, 1);
  const lowerLip = (dy = 0, k = .32) => dline([[-W * k, w * .17 + dy], [0, w * .2 + dy], [W * k, w * .17 + dy]], sw * .7, ZK.lip, .5);
  switch (kind) {
    case 'stiff': {   // lips pressed into a long thin line, the corners pulled sideways (not up) into bracket dimples
      dline([[-W, -w * .07], [-W * .8, w * .01], [0, w * .03], [W * .8, w * .01], [W, -w * .07]], sw * 1.15, NOIR.ink, .5);
      for (const s of [-1, 1]) dline([[s * W * 1.08, -w * .2], [s * W * 1.2, -w * .05], [s * W * 1.1, w * .1]], sw * .75, ZK.skinDk, .5);
      dline([[-W * .3, w * .15], [0, w * .18], [W * .3, w * .15]], sw * .7, ZK.lip, .5);
      break;
    }
    case 'flat':
      dline([[-W * .8, w * .02], [0, 0], [W * .8, w * .02]], sw * 1.1, NOIR.ink, .3);
      for (const s of [-1, 1]) dline([[s * W * .82, -w * .04], [s * W * .92, w * .04]], sw * .6, ZK.skinDk, .3);
      lowerLip(0, .3);
      break;
    case 'laugh': case 'grin': {   // a wide, even, too-symmetrical mouth: a row of identical teeth
      const h = kind === 'laugh' ? w * .5 : w * .26, top = -w * .08;
      const M = curvy([[-W * 1.08, top - w * .06], [0, top], [W * 1.08, top - w * .06], [W * .8, top + h * .7], [0, top + h], [-W * .8, top + h * .7]], 6);
      piece(M, '#3A1418', { sw: sw * .8, key: 'zkm' + kind, lift: 1, flatCard: true });
      const tb = top + (kind === 'laugh' ? w * .13 : w * .12);
      piece(curvy([[-W * .92, top - w * .03], [W * .92, top - w * .03], [W * .82, tb], [-W * .82, tb]], 3), ZK.white, { ink: null, key: 'zkmt' + kind, lift: 0, flatCard: true });
      for (let i = -3; i <= 3; i++) dline([[i * W * .24, top], [i * W * .24, tb - w * .01]], sw * .4, '#9A9088');
      if (kind === 'grin') { piece(curvy([[-W * .7, top + h * .62], [W * .7, top + h * .62], [W * .55, top + h * .95], [-W * .55, top + h * .95]], 3), ZK.white, { ink: null, key: 'zkmb', lift: 0, flatCard: true }); for (let i = -2; i <= 2; i++) dline([[i * W * .24, top + h * .64], [i * W * .24, top + h * .92]], sw * .4, '#9A9088'); }
      else piece(oval(0, top + h * .74, W * .45, h * .17, 0, 14), '#B85466', { ink: null, key: 'zkmtg', lift: 0, flatCard: true });
      break;
    }
    case 'o': case 'oh': {
      const rx = kind === 'oh' ? w * .2 : w * .13, ry = kind === 'oh' ? w * .3 : w * .15;
      piece(oval(0, w * .06, rx, ry, 0, 18), '#3A1418', { sw: sw * .8, key: 'zkmo', lift: 1, flatCard: true });
      break;
    }
    case 'sip':   // lips pushed out into a small tight ring
      piece(oval(-W * .1, w * .03, w * .17, w * .12, 0, 16), ZK.lip, { sw: sw * .8, key: 'zkms', lift: 1, flatCard: true });
      piece(oval(-W * .1, w * .04, w * .07, w * .04, 0, 10), '#3A1418', { ink: null, key: 'zkmsi', lift: 0, flatCard: true });
      break;
    default: pop(); mouthH(x, y, w, kind, { sw, lip: ZK.lipDk, lipLt: ZK.lip }); return;
  }
  pop();
}
// Map a feel()/emotions() spread to his face. His eyes stay wide open through almost everything (that's the joke);
// laughter and joy never reach them, and a change of expression happens behind a shutter blink.
// Returns { open, lower, iris, scale, shut, brow, mouth }.
function zkFace(o) {
  const F = faceOf(o), e = Array.isArray(o.eyes) ? o.eyes[1] : (o.eyes || 'normal');
  const M = { smile: 'stiff', cat: 'stiff', smirk: 'stiff', flat: 'flat', laugh: 'laugh', grin: 'grin', o: 'o', sigh: 'o', shout: 'oh', open: 'oh', frown: 'frown', wobble: 'wobble', grimace: 'grimace' };
  const R = { open: 1, lower: 0, iris: 1, scale: 1, shut: 0, brow: F.brow || [0, 0], mouth: o.zmouth || M[F.mouth] || F.mouth };
  if (F.style === 'shut' || F.style === 'squeeze') { if (o.mouth === 'laugh') R.brow = [.2, .15]; else R.shut = 1; }
  else if (F.style === 'happy') { R.lower = .22; R.brow = [.12, .06]; }
  else { R.open = (F.open ?? 1) >= .99 ? 1 : (F.open ?? 1) >= .9 ? .9 : lerp(.2, .9, F.open); R.lower = F.lower || 0; }   // (at rest the upper lid sits on the iris: a steady stare; wide opens it all the way)
  if (e === 'wide' || e === 'scared' || e === 'blank' || e === 'dot') { R.scale = e === 'wide' ? 1.14 : 1.08; R.iris = e === 'wide' ? .8 : .7; }
  if (o.mouth === 'laugh') { R.shut = 0; R.open = 1; R.lower = 0; R.iris = .85; }
  R.shut = Math.max(R.shut, clamp(o.squint || 0));   // emotions() swaps his face behind a shutter blink, not a squint
  return R;
}
// The forearm (elbow to wrist) drawn again on its own, so a folded arm's forearm lies over the sleeve. P = the limb's
// [root, mid, tip] in px; matches limb(): the second half of its curve in ink, its lower card segment + pin in card.
function zkForearm(P, w0, w1, col, o = {}) {
  const wm = (w0 + w1) / 2;
  if (!STYLE.card) { const C = through(P, 10); limb([C[10], C[15], C[20]], wm, w1, col, o); return; }
  const [a, b] = [P[1], P[2]], ang = Math.atan2(b[1] - a[1], b[0] - a[0]), L = Math.hypot(b[0] - a[0], b[1] - a[1]), pts = [];
  for (let i = 0; i <= 8; i++) { const t = Math.PI / 2 + i / 8 * Math.PI; pts.push([Math.cos(t) * wm / 2, Math.sin(t) * wm / 2]); }
  for (let i = 0; i <= 8; i++) { const t = -Math.PI / 2 + i / 8 * Math.PI; pts.push([L + Math.cos(t) * w1 / 2, Math.sin(t) * w1 / 2]); }
  const c = Math.cos(ang), sn = Math.sin(ang);
  piece(pts.map(([x, y]) => [a[0] + x * c - y * sn, a[1] + x * sn + y * c]), col, { ...o, key: (o.key || 'limb') + 'l', shade: null, lift: 4 });
  brad(a[0], a[1], Math.max(3, wm * .16));
}
// A flute held upright in a hand: undoes the hand's rotation (and mirror), tilts, and puts the stem in the grip.
function zkFluteHold(f, ang, mirror, key) {
  const fo = f === true ? {} : f;
  return s => { push(); if (mirror) scale(1, -1); rotate(-ang + (fo.tilt || 0)); translate(0, -.62 * s); rotate(Math.PI / 2); flute(s, fo.fill ?? .7, fo.clink ?? 0, key); pop(); };
}

function zuck(x, y, u, o = {}) {
  const id = o.boilKey ?? ++CLAWD_N, rs = p => boilSeed(`zk ${id} ${p}`), S = P => U(P, u);
  const q = o.view === 'q', robot = o.robot !== false, qz = (v, st) => Math.round(v / st) * st;
  // idle life (clawd.js lifeOf), made mechanical: the breath steps between a few levels like a machine's, no weight
  // shifts (his own tics turn the head); the shoulders sit ~7.5u up
  const life = lifeOf(o, 'zk' + id + '|' + (o.seed || 0)), bsq = robot ? qz(-life.breath / 7.5, .004) : -life.breath / 7.5;
  const sq = cardSq(((o.sq || 0) + (o.take || 0)) * .3) + bsq * (o.seated ? .8 : 1), dy = qz(o.dy || 0, .2) * .8 * u, sw = clamp(u / 20, .55, 2.2), lift = u * .12;
  const F = zkFace(o), seed = o.seed || 0, tic = robot ? zkTic(mt(T), seed) : { turn: 0, tilt: 0, blink: 0 };
  const shut = Math.max(F.shut, o.blink ?? (F.shut ? 0 : tic.blink));
  x += (o.dx || 0) * u;
  rs('shadow'); if (!o.seated && !o.noShadow) paint(oval(x, y + .1 * u, 3.3 * u, .45 * u, 0, 24), { wash: NOIR.ink, washOp: STYLE.card ? 110 : 150, ink: null });
  const prevXF = XF, enter = () => { push(); translate(x, y + dy + ZK_DROP * u); nudge('zk' + id, 1); if (o.rot) rotate(qz(o.rot, .025)); scale((o.flip ? -1 : 1) * (1 + sq * .5), 1 - sq); XF = o.flip ? -prevXF : prevXF; };
  const leave = () => { XF = prevXF; pop(); };
  enter();

  const cx0 = q ? .25 : 0, fs = a => a > 0 && q ? a * .84 : a;   // body centre; the far side (+x: he faces right) narrows in 3/4
  const C = P => S(P.map(([a, b]) => [fs(a) + cx0, b]));
  let pose = typeof o.pose === 'object' ? o.pose : ZKPOSE[o.pose || 'idle'] || ZKPOSE.idle;
  // the sip: put the flute's rim on his lips. The mouth (body units, as the head below draws it), the rim's offset from
  // the grip for the flute's tilt, and the grip's offset from the wrist for a forearm pointing up at angle ca.
  const turn = clamp((o.lookX || 0) * .5 + (robot ? tic.turn : 0), -1, 1), HS = 1.07, HSX = .87;
  const hx = (q ? .15 : 0) + turn * .16, fx = hx + (q ? -.08 : 0) + turn * .12;
  const mouthB = [cx0 * .6 + ((q ? fx + 1.3 : fx) - cx0 * .6) * HS * HSX, -7.5 + (-8.28 + 7.5) * HS];
  // Given the elbow E, the forearm points from E at the grip (its length gives, rubber hose).
  const SIPT = -.8, sipSpec = E => {
    const rim = [2.22 * Math.sin(SIPT), -2.22 * Math.cos(SIPT)], g = [mouthB[0] - rim[0], mouthB[1] - rim[1] + .08];
    const ca = Math.atan2(g[1] - E[1], g[0] - E[0]), w = [g[0] - .85 * Math.cos(ca), g[1] - .85 * Math.sin(ca)], oq = q ? .3 : 0;
    const sp = [w[0] - oq, w[1], 0, 'hold', 1, [E[0] - oq, E[1]]]; sp.sip = 1; return sp;
  };
  const spec1 = sp => sp === 'wave' ? zkWaveSpec(mt(T)) : sp === 'sip' ? sipSpec([4.3, -5.3]) : sp === 'sipT' ? sipSpec([2.7, -5.0]) : sp;
  const spec0 = (sp, s) => {
    if (!Array.isArray(sp) || sp[0] !== 'mix') return spec1(sp);
    const a = spec1(sp[1]), b = spec1(sp[2]), k = sp[3], ga = geo(s, a), gb = geo(s, b), oq = q ? .3 : 0;
    const L2 = (p, r) => [lerp(p[0], r[0], k), lerp(p[1], r[1], k)], tip = L2(ga.tip, gb.tip), mid = L2(ga.mid, gb.mid);
    const out = [tip[0] - oq, tip[1], 0, k < .5 ? a[3] : b[3], k < .5 ? a[4] : b[4], [mid[0] - oq, mid[1]]];
    out.sip = lerp(a.sip ? 1 : 0, b.sip ? 1 : 0, clamp(k)); return out;
  };

  // ---- arms: geometry, then the limb + glove, and the tee's wide sleeve drawn separately (over the torso) ----
  const geo = (s, spec) => {
    const [hx, hy, bend] = spec, root = [cx0 + fs(s * 2.8), -6.4];
    const tip = [hx + (q ? .3 : 0), hy], dx = tip[0] - root[0], dyy = tip[1] - root[1], L = Math.hypot(dx, dyy) || 1;
    const sd = bendSide(-dyy / L, dx / L, s, .3), nx = -dyy / L * sd, ny = dx / L * sd;   // (out and down, swinging through straight: core.js bendSide)
    const mid = spec[5] ? [spec[5][0] + (q ? .3 : 0), spec[5][1]] : [root[0] + dx * .5 + nx * L * bend, root[1] + dyy * .5 + ny * L * bend];
    return { root, mid, tip };
  };
  pose = { L: spec0(pose.L, -1), R: spec0(pose.R, 1) };
  const limbHand = (s, spec, between) => {
    rs('arm' + s);
    const { root, mid, tip } = geo(s, spec), far = q && s > 0, hp = spec[3];
    const armO = { sw, shade: far ? ZK.skinDk : ZK.skinSh, key: 'zkarm' + s }, armCol = far ? ZK.skinSh : ZK.skin;
    const r = limb(S([root, mid, tip]), 1.2 * u, .98 * u, armCol, armO);
    if (between) { between(); if (front(spec)) zkForearm(S([root, mid, tip]), 1.2 * u, .98 * u, armCol, armO); }
    const ca = r.ang, h0 = [r.tip[0] + Math.cos(ca) * .02 * u, r.tip[1] + Math.sin(ca) * .02 * u];
    const fl = s > 0 ? o.flute : o.fluteL;
    let hold = s > 0 ? o.hold : o.holdL;
    if (fl) { const f = fl === true ? {} : { ...fl }; if (f.tilt == null && spec.sip) f.tilt = SIPT * spec.sip; hold = zkFluteHold(f, ca, s < 0, 'zkflute' + s); }
    if (hp !== 'none') hand(h0[0], h0[1], ca, 1.0 * u, { pose: fl && hp !== 'hold' ? 'hold' : hp, glove: true, sw: sw * .8, mirror: s < 0, key: 'zkh' + s, hold });
  };
  const sleeve = (s, spec) => {
    rs('sleeve' + s);
    const { root, mid } = geo(s, spec), far = q && s > 0;
    const ux = mid[0] - root[0], uy = mid[1] - root[1], ul = Math.hypot(ux, uy) || 1, ax = ux / ul, ay = uy / ul, px = -ay, py = ax;
    const e = [root[0] + ux * .66, root[1] + uy * .66], w0 = .84, w1 = .8, at = (p, a, n) => [p[0] + ax * a + px * n, p[1] + ay * a + py * n];
    const cap = []; for (let i = 0; i <= 8; i++) { const a = Math.PI / 2 + i / 8 * Math.PI; cap.push(at(root, Math.cos(a) * w0, Math.sin(a) * w0)); }
    const sl = curvy(S([...cap, at(root, ul * .3, -w0 * 1.04), at(e, 0, -w1), at(e, .07, 0), at(e, 0, w1), at(root, ul * .3, w0 * 1.04)]), 3);
    piece(sl, far ? mixCol(ZK.tee, ZK.teeDk, .5) : ZK.tee, { sw, shade: ZK.teeDk, depth: .4 * u, rim: far ? null : ZK.rim, key: 'zksleeve' + s, lift });
    dline(S([at(e, -.16, w1 * .9), at(e, -.13, 0), at(e, -.16, -w1 * .9)]), sw * .55, ZK.teeLt, .4);
  };
  const front = spec => !!spec[4];

  // ---- behind the body: back arms, legs ----
  for (const [s, spec] of q ? [[1, pose.R], [-1, pose.L]] : [[-1, pose.L], [1, pose.R]]) if (!front(spec)) limbHand(s, spec, () => sleeve(s, spec));   // (3/4: the far arm first)
  if (!o.seated) for (const s of (q ? [1, -1] : [-1, 1])) {
    rs('leg' + s);
    const far = q && s > 0, hip = [cx0 + fs(s * 1.0) + (q ? .1 : 0), -3.55], ank = [cx0 + fs(s * 1.08) + (q ? .35 : 0), -.62 - ZK_DROP];
    limb(S([hip, [lerp(hip[0], ank[0], .5) + s * .1, lerp(hip[1], ank[1], .5)], ank]), 1.35 * u, 1.12 * u, far ? ZK.jeansDk : ZK.jeans, { sw, shade: ZK.jeansDk, key: 'zkleg' + s });
    push(); translate(ank[0] * u, ank[1] * u); scale(q ? 1 : s, 1);
    const sh = curvy(S([[-.85, -.48], [.2, -.6], [1.0, -.34], [1.25, .08], [1.1, .34], [-.92, .34], [-1.05, -.05]]), 5);
    piece(sh, ZK.shoe, { sw, shade: '#0E0C10', depth: .25 * u, rim: ZK.rim, key: 'zkshoe' + s, lift });
    piece(curvy(S([[-1.05, .12], [1.22, .08], [1.12, .46], [-.98, .46]]), 3), ZK.sole, { sw: sw * .8, key: 'zksole' + s, lift: 2 });
    dline(S([[-.25, -.3], [.45, -.12]]), sw * .6, '#55505A', .5);
    pop();
  }

  // ---- the tee: oversized and boxy, stretched over a gym-built V: square shoulders, heavy traps, a thick neck ----
  rs('tee');
  const torso = curvy(C([[0, -7.58], [1.5, -7.7], [2.2, -7.42], [2.92, -7.04], [3.32, -6.5], [3.3, -5.85], [2.98, -5.05], [2.5, -4.3], [2.54, -3.45], [1.25, -3.3], [0, -3.26], [-1.25, -3.3], [-2.54, -3.45], [-2.5, -4.3], [-2.98, -5.05], [-3.3, -5.85], [-3.32, -6.5], [-2.92, -7.04], [-2.2, -7.42], [-1.5, -7.7]]), 5);
  piece(torso, ZK.tee, { sw: sw * 1.15, shade: ZK.teeDk, depth: .8 * u, rim: ZK.rim, key: 'zktorso', lift });
  // pecs (a shadow under each), sternum, abs hinted through the cotton, a drape fold at the hem
  for (const s of [-1, 1]) dline(C([[s * .12, -5.95], [s * .45, -5.66], [s * 1.5, -5.62], [s * 2.3, -5.86]]), sw * .6, ZK.teeLt, .5);   // square pecs
  dline(C([[0, -6.75], [.02, -6.2]]), sw * .5, ZK.teeLt, .4);
  dline(C([[-1.7, -3.36], [-1.45, -3.95], [-1.55, -4.3]]), sw * .5, ZK.teeLt, .5);
  dline(C([[1.9, -3.34], [2.02, -3.85]]), sw * .5, ZK.teeLt, .5);

  // ---- neck (thick as a post), collar, the chain ----
  rs('neck');
  const nk = q ? .12 : 0;
  piece(curvy(C([[-1.22 + nk, -8.5], [1.22 + nk, -8.5], [1.5 + nk, -7.55], [0 + nk, -7.0], [-1.5 + nk, -7.55]]), 3), ZK.skinSh, { sw, shade: ZK.skinDk, depth: .3 * u, key: 'zkneck', lift: 2 });
  for (const s of [-1, 1]) dline(C([[s * 1.0 + nk, -8.0], [s * 1.1 + nk, -7.72], [s * .95 + nk, -7.45]]), sw * .5, ZK.skinDk, .5);   // traps into the neck
  const collar = through(C([[-1.64 + nk, -7.6], [-1.1 + nk, -7.1], [0 + nk, -6.92], [1.1 + nk, -7.1], [1.64 + nk, -7.6]]), 5);
  piece(ribbon(collar, .27 * u, .27 * u), ZK.teeDk, { sw: sw * .8, rim: ZK.rim, key: 'zkcollar', lift: 2 });
  rs('chain');
  { // a chunky gold curb chain resting on the chest: one thick gold rope with slanted links
    const ctrl = C([[-1.5 + nk, -7.38], [-1.3 + nk, -6.6], [-.75 + nk, -5.98], [0 + nk, -5.76], [.75 + nk, -5.98], [1.3 + nk, -6.6], [1.5 + nk, -7.38]]);
    piece(ribbon(ctrl, .36 * u, .36 * u), ZK.gold, { sw: sw * .6, shade: ZK.goldDk, depth: .12 * u, key: 'zkchain', lift: 1.5, flatCard: true });
    const mid = through(ctrl, 6);
    for (let i = 1; i < mid.length - 1; i += 2) {
      const [ax, ay] = mid[i - 1], [bx, by] = mid[i + 1], d = Math.hypot(bx - ax, by - ay) || 1, tx = (bx - ax) / d, ty = (by - ay) / d, nx2 = -ty, ny2 = tx, h = .16 * u, sk = .1 * u;
      dline([[mid[i][0] - nx2 * h - tx * sk, mid[i][1] - ny2 * h - ty * sk], [mid[i][0] + nx2 * h + tx * sk, mid[i][1] + ny2 * h + ty * sk]], sw * .5, ZK.goldDk, 0);
    }
    dline(through(ctrl, 4).slice(3, -3).map(([px, py]) => [px - .07 * u, py - .09 * u]), sw * .45, ZK.goldLt, .4);
  }

  // ---- head (big: scaled up about the neck) ----
  push(); translate(cx0 * .6 * u, -7.5 * u); rotate((o.tilt || 0) + (robot ? tic.tilt : 0) + qz(o.rot || 0, .025) * -.4); scale(HS * HSX, HS); translate(-cx0 * .6 * u, 7.5 * u);   // (narrowed: a long face)
  const H = P => S(P.map(([a, b]) => [a + hx, b]));
  rs('ears');
  // big ears standing out from the head (a signature): the rim and the bowl inside
  const ear = (ex, k = 1) => {
    const E = [[-.26, -10.35], [.2, -10.5], [.56, -10.2], [.6, -9.62], [.4, -9.05], [.08, -8.82], [-.2, -8.95]].map(([a, b]) => [ex + a * k, b]);
    piece(curvy(S(E), 5), ZK.skin, { sw: sw * .85, shade: ZK.skinSh, depth: .16 * u, key: 'zkear' + ex, lift: 2 });
    dline(S([[.02, -10.2], [.34, -10.1], [.42, -9.6], [.26, -9.18], [.04, -9.08]].map(([a, b]) => [ex + a * k, b])), sw * .55, ZK.skinDk, .5);
    dline(S([[.08, -9.82], [.2, -9.56], [.08, -9.36]].map(([a, b]) => [ex + a * k, b])), sw * .45, ZK.skinDk, .5);
  };
  if (!q) for (const s of [-1, 1]) ear(s * 2.02 + hx + turn * -.05 * s, s);
  rs('head');
  // (a longish face on a squarer jaw: straight cheeks, the jaw's corners, a firm chin)
  const headF = [[0, -12.4], [1.35, -12.2], [2.0, -11.55], [2.16, -10.65], [2.12, -9.8], [1.96, -9.0], [1.74, -8.3], [1.44, -7.72], [1.02, -7.34], [.52, -7.16], [0, -7.12], [-.52, -7.16], [-1.02, -7.34], [-1.44, -7.72], [-1.74, -8.3], [-1.96, -9.0], [-2.12, -9.8], [-2.16, -10.65], [-2.0, -11.55], [-1.35, -12.2]];
  // (3/4: the cheek runs smooth; the nose is its own piece over it, zkNoseQ, its tip breaking the cheek's line)
  const headQ = [[.2, -12.4], [1.45, -12.2], [2.12, -11.6], [2.34, -10.8], [2.3, -10.25], [2.22, -9.88], [2.28, -9.42], [2.24, -8.92], [2.12, -8.42], [1.98, -7.95], [1.74, -7.5], [1.34, -7.22], [.85, -7.14], [.2, -7.3], [-.6, -7.62], [-1.3, -8.2], [-1.85, -9.0], [-2.1, -9.9], [-2.12, -10.9], [-1.9, -11.7], [-1.1, -12.25]];
  const head = curvy(H(q ? headQ : headF), 5);
  if (STYLE.mode === 'doodle') _paint(head, { wash: '#FBF8F0', ink: null });   // (doodle's open pencil fill: knock the neck out from under the face, as the cast's K.knock)
  piece(head, ZK.skin, { sw: sw * 1.15, shade: ZK.skinSh, depth: .55 * u, key: 'zkhead', lift });
  if (q) ear(-1.52 + hx, -.85);
  // the jaw's corners and the chin
  dline(H(q ? [[1.25, -7.6], [1.55, -7.52], [1.85, -7.62]] : [[-.32, -7.5], [0, -7.44], [.32, -7.5]]), sw * .55, ZK.skinDk, .5);

  rs('hair');
  {
    // grown out: loose light-brown curls at their real volume (not pushed: a truthful likeness, no wig), a few onto the forehead
    const hairF = () => {
      const top = zkCurlEdge(H([[-2.3, -10.3], [-2.44, -11.3], [-2.05, -12.3], [-1.1, -12.86], [0, -12.98], [1.1, -12.86], [2.05, -12.3], [2.44, -11.3], [2.3, -10.3]]), 9, .17, 3);
      const fringe = zkCurlEdge(H([[2.04, -10.5], [1.85, -11.1], [1.3, -11.42], [.6, -11.3], [0, -11.48], [-.62, -11.28], [-1.3, -11.44], [-1.85, -11.1], [-2.04, -10.5]]), 7, .2, 11);
      return top.concat(H([[2.2, -10.0], [2.08, -10.2]]), fringe, H([[-2.08, -10.2], [-2.2, -10.0]]));
    };
    const hairQ = () => {
      const top = zkCurlEdge(H([[-2.32, -9.95], [-2.42, -11.1], [-1.9, -12.25], [-.7, -12.9], [.75, -12.96], [1.9, -12.52], [2.58, -11.75], [2.62, -10.95]]), 9, .17, 5);
      const fringe = zkCurlEdge(H([[2.56, -10.9], [2.1, -11.38], [1.5, -11.5], [.85, -11.36], [.3, -11.46], [-.1, -11.2]]), 5, .22, 13);
      return top.concat(fringe, H([[-.26, -10.9], [-.46, -10.45], [-.6, -10.18], [-.9, -10.34], [-1.35, -10.5], [-1.85, -10.28], [-2.2, -9.9]]));
    };
    piece(q ? hairQ() : hairF(), ZK.hair, { sw, shade: ZK.hairDk, depth: .45 * u, key: 'zkhair', lift: 2 });
    // the curls: little hooks spiralling in, lighter toward the light, a few dark ones for depth
    const rows = q ? [[-12.6, [-1.2, -.3, .6, 1.4]], [-12.1, [-1.8, -.95, -.1, .75, 1.6]], [-11.55, [-1.95, -1.15, 2.2]], [-11.0, [-1.9, -1.35]]]
                   : [[-12.62, [-1.3, -.45, .45, 1.3]], [-12.12, [-1.9, -1.1, -.3, .5, 1.3, 1.95]], [-11.62, [-2.12, 2.12]]];
    let n = 0;
    for (const [ry, xs] of rows) for (const rx of xs) {
      n++; const jx = (hash(n * 5.1 + 2) - .5) * .22, jy = (hash(n * 3.3 + 8) - .5) * .16, lit = rx + ry * .15 < .2;
      zkCurl((rx + hx + jx) * u, (ry + jy) * u, (.18 + .1 * hash(n * 2.9)) * u, (hash(n * 1.7) - .5) * 1.0, lit ? ZK.hairLt : ZK.hairDk, sw * .6);
    }
  }

  // ---- face ----
  rs('face');
  // smallish, wide-set pale eyes, almond-shaped, held open in a steady stare; light straight brows sitting high
  const eyeY = -9.95, er = .4 * F.scale, EA = 1.36;
  const look = [clamp((o.lookX || 0) + turn * .35, -1, 1), clamp(o.lookY || 0, -1, 1)];
  // 3/4: the far eye is the same eye, a touch smaller and squeezed across (so both gazes stay parallel), kept inside the
  // outline, with room between the eyes for the bridge of the nose; [x, squeeze, size]
  const eyes = q ? [[fx + .26, 1, 1], [fx + 1.7, .64, .9]] : [[fx - .98, 1, 1], [fx + .98, 1, 1]];
  const eyesG = eyes.map(([ex, k, rk]) => [ex, k * rk]), erG = er * 1.4;   // (the glasses frame each eye's width)
  if (o.glasses) zkGlassesBack(eyesG, eyeY, erG, u, sw, q, hx);
  eyes.forEach(([ex, k, rk], i) => {
    zkEye(ex * u, eyeY * u, er * rk * u, { sx: k, ax: EA, look, iris: F.iris, open: F.open, lower: F.lower, shut, sw, key: 'zke' + i });
    zkBrow((ex + (q && i ? .02 : 0)) * u, (eyeY - er - .42 + (1 - rk) * er * .8) * u, (q && i ? .62 : .98) * u, [F.brow[0] + .06, F.brow[1] + .04], i ? 1 : -1, sw);
  });
  if (o.glasses) zkGlassesFront(eyesG, eyeY, erG, u, sw, q);
  // nose: long and straight
  const nx = fx - hx;
  if (!q) zkNoseF(H, nx, u, sw);
  else zkNoseQ(H, { ridge: [[1.02, -10.15], [1.12, -9.7], [1.44, -9.3]], tip: [2.18, -9.05], tr: .22, th: .19, wing: [1.9, -8.95], wr: .15, nw: .26 }, u, sw, head);
  // mouth
  zkMouth((q ? fx + 1.3 : fx) * u, -8.28 * u, (q ? .9 : 1.0) * u, F.mouth, { sw, sx: q ? .88 : 1 });
  pop();
  leave();

  // ---- a table (or anything) between his body and his front arms, drawn in world space ----
  if (o.table) { rs('table'); o.table(); }
  // ---- arms in front ----
  enter();
  for (const [s, spec] of [[-1, pose.L], [1, pose.R]]) if (front(spec)) limbHand(s, spec, () => sleeve(s, spec));
  leave();
  rs('emote'); if (o.emote) emote(o.emote, x + (o.flip ? -1 : 1) * 3.0 * u, y + dy - (13.6 - ZK_DROP) * u * (1 - sq), u * .62, o.emoteK ?? 1, o.emoteAge ?? T);
  rs('after');
}
// Smart glasses (chunky black wayfarers with a camera dot at the corner): the frames and the skin seen through the
// lenses go under the eyes...
function zkGlassesBack(eyes, eyeY, er, u, sw, q, hx) {
  const box = (ex, k, hw, t, b) => [[ex - hw * 1.04, t], [ex, t - .04], [ex + hw * 1.04, t], [ex + hw * .98, b - .3], [ex + hw * .6, b], [ex - hw * .6, b], [ex - hw * .98, b - .3]];
  eyes.forEach(([ex, k], i) => {
    const hw = (er + .3) * k, t = eyeY - er - .2, b = eyeY + er + .22;
    piece(curvy(U(box(ex, k, hw, t, b), u), 4), ZK.frame, { sw: sw * .7, key: 'zkgf' + i, lift: 1.5, flatCard: true });
    piece(curvy(U(box(ex, k, hw - .15 * k, t + .15, b - .13), u), 4), ZK.skin, { ink: null, key: 'zkgl' + i, lift: 0, flatCard: true, edge: false });
  });
  const [a, c] = eyes;
  piece(ribbon(U([[a[0] + (er + .2) * a[1], eyeY - er * .72], [(a[0] + c[0]) / 2, eyeY - er * .82], [c[0] - (er + .2) * c[1], eyeY - er * .72]], u), .2 * u, .2 * u), ZK.frame, { sw: sw * .6, key: 'zkgb', lift: 1.5, flatCard: true });
  if (q) piece(ribbon(U([[a[0] - (er + .3), eyeY - er * .7], [hx - 1.0, eyeY - er * .55], [hx - 1.55, eyeY - er * .35]], u), .2 * u, .16 * u), ZK.frame, { sw: sw * .6, key: 'zkgt', lift: 1.5, flatCard: true });
}
// ...and a glare stroke over them (no translucent lens: p5.brush mixes a pale wash over ink into navy).
function zkGlassesFront(eyes, eyeY, er, u, sw, q) {
  eyes.forEach(([ex, k], i) => {
    const hw = (er + .15) * k;
    dline(U([[ex - hw * .62, eyeY - er * .2], [ex - hw * .2, eyeY - er * .78]], u), sw * 1.1, '#FFFFFF', 0);
  });
  const [a] = eyes, cx = a[0] - (er + .3) * a[1] * .9, cy = eyeY - er - .05;
  piece(oval(cx * u, cy * u, .1 * u, .1 * u, 0, 10), '#DDE8EE', { sw: sw * .35, key: 'zkcam', lift: 1, flatCard: true });
}

// ---- model sheets (reference only: labels allowed) ----
(() => {
  LOOPS.zuck = t => {
    const { label, stage, spot } = SHEET;
    stage(t); const tt = mt(t);
    const row = [
      ['front', 'idle', 'neutral', {}],
      ['q', 'toast', 'happy', { flute: { clink: 0 } }],
      ['front', 'wave', 'happy', {}],
      ['q', 'sip', 'neutral', { flute: true, zmouth: 'sip' }],
      ['front', 'guard', 'determined', {}],
      ['q', 'tableToast', 'happy', { flip: true, seated: true, flute: true, table: true }],
    ];
    row.forEach(([v, p, e, extra], i) => {
      const x = 175 + i * 314; spot(x);
      zuck(x, 905, 34, { ...feel(e, tt, { seed: i }), view: v, pose: p, seed: i, boilKey: 'sheet' + i, ...extra, table: extra.table ? () => zkTable(x, 905, 34) : null });
      label(`${v}${extra.flip ? ' flip' : ''} · ${p} · ${e}`, x, 950, 18);
    });
  };
  LOOPS.zuck.len = 4;
  LOOPS.zuckFaces = t => {
    const { label, stage, spot } = SHEET;
    stage(t); const tt = mt(t);
    const faces = [
      ['stare', 'front', feel('neutral', tt), {}],
      ['stiff smile', 'q', feel('happy', tt), {}],
      ['laugh (rehearsed)', 'front', feel('laugh', tt), {}],
      ['surprised', 'q', feel('surprised', tt), {}],
      ['sip', 'q', feel('neutral', tt), { pose: 'sip', flute: true, zmouth: 'sip' }],
      ['blink', 'front', feel('neutral', tt), { blink: 1 }],
    ];
    faces.forEach(([name, v, f, extra], i) => {
      const cx = 320 + (i % 3) * 640, cy = i < 3 ? 250 : 790, u = 72;
      if (i === 3) {   // a clean bust per cell: mask row one's bodies before drawing row two
        boilSeed('zkmask'); paint(rectPts(-60, 540, W + 120, 600), { wash: STYLE.card ? '#B9B2A6' : NOIR.char, ink: null });
        if (!STYLE.card) inkLine([[0, 541], [W, 539]], 1, NOIR.shadow, 'flashfine', 0);
      }
      spot(cx, cy, 300);
      zuck(cx - (v === 'q' ? .6 * u : 0), cy + (10.1 - ZK_DROP) * u, u, { ...f, view: v, pose: 'low', seated: true, seed: i, boilKey: 'face' + i, ...extra });
      label(name, cx, i < 3 ? 522 : 1062, 22);
    });
  };
  LOOPS.zuckFaces.len = 4;
  // Shot C's blocking: seated behind the banquet table, 3/4 facing left (toward Musk): raise, clink, sip, stiff smile.
  LOOPS.zuckTable = t => {
    const { label, stage, spot } = SHEET;
    stage(t); const tt = mt(t);
    const pose = zkPoses(tt, [[0, 'table'], [.4, 'tableToast'], [1.9, 'tableSip'], [3.0, 'table']]);
    const clink = Math.exp(-Math.max(0, tt - 1.07) * 5) * (tt > 1.07 ? 1 : 0);
    const face = emotions(tt, [[0, 'neutral'], [.5, 'happy'], [1.2, 'laugh'], [1.9, 'neutral', { zmouth: 'sip' }], [3.0, 'happy']]);
    [[560, 58, false], [1400, 58, true]].forEach(([x, u, gl], i) => {
      spot(x, 480, 460);
      zuck(x, 1000, u, { ...face, view: 'q', flip: true, seated: true, pose, flute: { clink }, glasses: gl, seed: i, boilKey: 'tbl' + i, table: () => zkTable(x, 1000, u) });
      label(gl ? 'seated · flip · q · glasses' : 'seated · flip · q', x, 1050, 22);
    });
  };
  LOOPS.zuckTable.len = 4;
})();
// A plain table-top stub for the seated model-sheet entry (the real banquet table lives in sets/bunker.js).
function zkTable(x, y, u) {
  boilSeed('zktable');
  const d = ZK_DROP;
  piece(U([[-4.6, -4.9 + d], [4.6, -4.9 + d], [5.0, -4.3 + d], [-5.0, -4.3 + d]], u, x, y), '#6D5A48', { sw: clamp(u / 20, .55, 2.2), key: 'zktable', lift: u * .1 });
  piece(U([[-5.0, -4.3 + d], [5.0, -4.3 + d], [5.0, -2.0], [-5.0, -2.0]], u, x, y), '#4A3C30', { sw: clamp(u / 20, .55, 2.2), key: 'zktablef', lift: u * .1 });
}

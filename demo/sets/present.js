// sets/present.js: THE PRESENT, three card sets (the main look for these is 'card'; each also reads in 'doodle' and
// 'xerox'). World coordinates = screen coordinates at zoom 1 (1920 × 1080). Every set is two layers, like carriage.js:
// xxxBack(t, lt, o) paints the whole frame behind the cast, the shot draws the cast, then xxxFront(t, lt, o) draws what
// stands in front of them. t = time for idles (rain, flicker, the second hand), lt = shot time; pass both through mt()
// in a shot (stop motion on twos). Anchors (below each set) say where the cast stand or sit, and at what u.
//
//   OFFICE   her office (V1a–V1d): officeBack / officeFront, OFFICE anchors, prBox() (her cardboard box)
//   FLAT     her flat, evening (V1g–V1j, P1a): flatBack / flatFront, FLAT anchors (the laptop screen and the notebook
//            page are layers a shot can fill: o.screen(ctx), o.page(ctx))
//   BOXROOM  his box room (C1e, C2e, V3f, D1): boxroomBack / boxroomFront, BOXROOM anchors, boxroomAnchors(o) (the
//            anchors move as the walls close in: o.squeeze)
// No text anywhere: screens, post, signs and paper carry symbols and squiggles only.

// ---------- shared helpers ----------
const prR = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const prL = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
// A point in the quad Q = [tl, tr, br, bl] at (u, v) 0..1 (bilinear), and a sub-quad of it.
const prAt = (Q, u, v) => prL(prL(Q[0], Q[1], u), prL(Q[3], Q[2], u), v);
const prSub = (Q, u0, v0, u1, v1) => [prAt(Q, u0, v0), prAt(Q, u1, v0), prAt(Q, u1, v1), prAt(Q, u0, v1)];
// An inlay: a flat piece lying on another (no cut edge, no drop shadow, no mottling), and a stuck-on piece (a hair of lift).
const prFlat = (P, col, key, o = {}) => piece(P, col, { ink: null, key, lift: 0, flatCard: true, edge: false, ...o });
const prOn = (P, col, key, o = {}) => piece(P, col, { sw: 1.1, key, lift: 1.5, flatCard: true, ...o });
// Clip a shape to a convex window (views through glass stay inside the glass).
const prClip = (P, C) => clipConvex(P, C);
// A wavy line of "text" (never letters): from (x, y), length L, the pen's wobble a.
const prScrib = (x, y, L, a, col, sw = 1, seed = 0) => { const P = []; for (let i = 0; i <= 8; i++) P.push([x + L * i / 8, y + Math.sin(i * 2.1 + seed) * a]); dline(P, sw, col, .5); };
// The context handed to a screen / page callback: the quad, a bilinear at(u, v), and begin()/end() to draw in a frame of
// w × h px (default 1920 × 1080) mapped onto the quad's parallelogram (tl → tr, tl → bl), so a shot can draw any frame there.
function prSurface(Q, t, lt, key, w = W, h = H) {
  const [a, b, , d] = Q, ux = (b[0] - a[0]) / w, uy = (b[1] - a[1]) / w, vx = (d[0] - a[0]) / h, vy = (d[1] - a[1]) / h;
  return { quad: Q, t, lt, key, w, h, at: (u, v) => prAt(Q, u, v), begin() { push(); applyMatrix(ux, uy, vx, vy, a[0], a[1]); }, end() { pop(); } };
}
// The drawn look (doodle) keeps big areas sparse: a pencil held on its side, the paper breathing between strokes.
const prDD = () => STYLE.mode === 'doodle', PR_SPARSE = { density: .22 };
// A soft contact shadow on the floor (card and ink; the drawn looks skip it).
function prShadow(cx, cy, rx, ry, a = 70) { if (STYLE.card || STYLE.mode === 'ink') paint(oval(cx, cy, rx, ry, 0, 28), { wash: '#141018', washOp: a, ink: null }); }

// =====================================================================================================================
// OFFICE: a small open-plan UK office (V1a–V1d). A suspended ceiling with a light panel, greige walls, grey-blue carpet
// tiles; her desk in front of a big window (grey sky, other office blocks, a crane); the wall clock (hands only); the
// photocopier (a lid that opens, a light bar that sweeps); the door (a wired-glass fire door under a green running-man
// sign); a coat stand. Muted, so her tomato coat and the bots pop.
//   officeBack(t, lt, o)   the room, the window, the clock, the copier, the door, the coat stand, her chair's back.
//   officeFront(t, lt, o)  her desk (it hides the lap of whoever sits in her chair) and what's on it, then o.onDesk(t)
//                          (the shot draws hands, the leaving card, the box... over the desk top).
// o: clock [h, m] (default [9, 0]; the second hand ticks with t unless o.seconds === false) · dusk 0..1 (5 o'clock: the
//    sky dims, the blocks' windows light) · copierLid 0..1 (0 shut, 1 up) · copierScan 0..1 (the light bar across the
//    glass; null = off) · copierSheets (paper on the output tray, default 2) · doorOpen 0..1 · chair: false (no chair)
//    · chairX (px, the chair pushed along) · plant / mug: false (packed in her box) · monitor(ctx): fill the monitor's
//    screen (prSurface ctx: begin()/end() map a 1920 × 1080 frame onto it) · screenGlow 0..1.
const PRO = {
  ceil: '#DEDAD0', grid: '#A9A394', panel: '#F4F2E8', panelDk: '#D2CFC4',
  wall: '#CBC3B3', wallDk: '#ADA595', wallLt: '#DCD5C7', skirt: '#8A8478', trunk: '#E4E0D6', trunkDk: '#B9B4A8',
  carpet: '#5E6979', carpetB: '#66717F', carpetLn: '#4A5360',
  sky: '#BCC2C8', skyLt: '#CDD2D6', skyDk: '#A6ADB5', far: '#ABB2B9', mid: '#9098A2', near: '#7A838E', strip: '#626C77', lit: '#F2D98E', crane: '#B8A66A',
  alu: '#A3AAAF', aluDk: '#737A80', sill: '#DCD7CB', blind: '#E6E1D6', blindDk: '#C4BFB2',
  desk: '#CFBD99', deskEdge: '#A8966F', deskDk: '#8A7A5A', steel: '#8D9197', steelDk: '#6B6F75', steelLt: '#B5B9BE',
  chair: '#3D424B', chairDk: '#2A2E35', chairLt: '#555B66',
  mon: '#2A2D33', monLt: '#474B53', scr: '#DCE7EC', scrBar: '#3E5F86', scrInk: '#7D8C98', key: '#3A3E45', keyLt: '#5C616A',
  copier: '#DCD7CC', copierDk: '#B5AFA3', copierLt: '#ECE8DF', base: '#8C9095', baseDk: '#6C7075', lid: '#D2CDC2', pad: '#E8E6DF', glass: '#44626C', beam: '#C8FFE0',
  door: '#BFA47C', doorDk: '#9A8160', doorLt: '#D4BD98', frame: '#9C8A6C', dglass: '#A9BCC4', wire: '#6A7880', kick: '#A4AAB0', corridor: '#6E6A62',
  exit: '#2F9A5C', exitLt: '#F2F6EE',
  plant: '#6F9657', plantDk: '#4D7040', plantLt: '#9CBB7C', pot: '#E9E5DC', potDk: '#BDB7AA',
  mug: '#EEEAE2', mugBand: '#4C7A96', coffee: '#6A4A32',
  clockRim: '#2E3137', clockFace: '#F3F0E8', second: '#C8463A',
  coat: '#8E8676', coatDk: '#6E675A', scarf: '#3F5B74', brolly: '#26282E',
  paper: '#F1EEE6', paperDk: '#CFCABE', note: '#EED66A', kraft: '#B48C5C', kraftDk: '#8C6A42', kraftLt: '#CCA676',
};
// Anchors (world px at zoom 1; u = the narrators' unit here). Pass seated anchors to person() as (x, y, u) with
// { seated: true, seatH }; the desk hides everything of her below its top.
const OFFICE = {
  u: 30, floor: 800,                                   // the wall's foot (the carpet runs from here to the bottom)
  chair: [690, 892, 30, 4.25],                         // her chair, behind the desk: [x, ground y, u, seatH] (front view)
  desk: [1112, 944, 30],                               // standing beside her desk (its right end), facing left
  boss: [1300, 956, 30],                               // the boss's spot, facing left toward the desk
  copilot: [548, 732, 30],                             // Copilot at her elbow, standing ON the desk top (her left)
  copilotFloor: [520, 900, 30],                        // ...or on the floor at her left elbow (the desk hides his legs)
  copier: [1330, 904, 30],                             // standing at the copier (its left side), facing right
  door: [1792, 872, 30],                               // at the door, looking back into the room (flip to face left)
  clock: [1296, 222, 56],                              // [cx, cy, r]
  win: { x0: 170, y0: 140, x1: 1170, y1: 620 },
  deskTop: { x0: 430, x1: 1010, far: 712, front: 742, y: 727 },   // the desk top (y: where things sit on it)
  screen: [[794, 562], [934, 575], [934, 693], [794, 680]],        // the monitor's screen [tl, tr, br, bl] (a parallelogram)
  // the copier: x0..x1, top = the platen's front edge, hinge = the lid's hinge line (the platen's back edge), glass = the
  // platen quad, out = the mouth of the output bay (copies slide out of it to the left), lidTop(k) = the open lid's top y
  copierAt: { x0: 1384, x1: 1642, top: 540, hinge: 526, glass: [[1412, 528], [1606, 528], [1612, 538], [1406, 538]], out: [1400, 604], panel: [1590, 560] },
  doorAt: { x0: 1702, x1: 1882, y0: 232, y1: 804 },
};
OFFICE.copierAt.lidTop = k => { const a = ease(clamp(k)) * 1.32; return OFFICE.copierAt.hinge + 150 * Math.cos(a) * .08 - 150 * Math.sin(a) * .95; };

// the outside: a grey London sky, office blocks with ribbon windows, a tower crane, a far pointed tower
function prOfficeView(t, o) {
  const { x0, y0, x1, y1 } = OFFICE.win, G = prR(x0, y0, x1, y1), dusk = clamp(o.dusk || 0);
  const Cl = P => prClip(P, G);
  boilSeed('pro sky');
  piece(G, mixCol(PRO.sky, '#6F7784', dusk * .7), { ink: null, key: 'pro-sky', lift: 0, edge: false, ...PR_SPARSE });
  prFlat(Cl(prR(x0, y1 - 170, x1, y1)), mixCol(PRO.skyLt, '#8A8F98', dusk * .6), 'pro-haze');
  // overcast: long, soft bands of cloud, a shade lighter or darker than the sky
  for (const [y, h, i, dk] of [[176, 22, 0, .1], [214, 16, 1, .45], [262, 26, 2, 0], [306, 14, 3, .5], [340, 20, 4, .2]]) {
    const P = [], n = 14; for (let k = 0; k <= n; k++) P.push([x0 - 20 + (x1 - x0 + 40) * k / n, y - h * (.5 + .5 * hash(i * 11 + k))]);
    for (let k = n; k >= 0; k--) P.push([x0 - 20 + (x1 - x0 + 40) * k / n, y + h * (.3 + .3 * hash(i * 13 + k))]);
    prFlat(Cl(curvy(P, 3)), mixCol(mixCol(PRO.skyLt, PRO.skyDk, dk), '#5E6672', dusk * .6), 'pro-cloud' + i);
  }
  // far: a pointed tower (pale), then three tiers of blocks, nearer = darker
  boilSeed('pro far');
  prFlat(Cl([[905, 250], [952, 620], [858, 620]]), mixCol(PRO.far, PRO.sky, .35), 'pro-shard');
  dline([[905, 250], [912, 620]], .6, PRO.mid);
  const tiers = [
    { col: PRO.far, blocks: [[180, 380, 300], [420, 300, 150], [600, 420, 130], [1000, 330, 180]] },
    { col: PRO.mid, blocks: [[240, 430, 170], [640, 470, 260], [960, 400, 120], [1090, 450, 130]] },
    { col: PRO.near, blocks: [[150, 500, 140], [420, 520, 190], [790, 510, 140], [1040, 540, 160]] },
  ];
  tiers.forEach(({ col, blocks }, ti) => blocks.forEach(([bx, by, bw], bi) => {
    const k = 'pro-b' + ti + bi, c = mixCol(col, '#4A505A', dusk * .5);
    boilSeed(k);
    piece(Cl(prR(bx, by, bx + bw, y1 + 10)), c, { ink: null, key: k, lift: ti ? 2 : 0, flatCard: ti < 2, edge: ti > 0 });
    if (ti === 2 && bi === 1) prFlat(Cl(prR(bx + 20, by - 26, bx + 70, by)), c, k + 'plant');   // a plant room on the roof
    // ribbon windows: a band per floor; at dusk some of them light
    const fh = 26 + ti * 6;
    for (let f = 0, y = by + 16; y < y1 - 4; f++, y += fh) {
      const lit = dusk > .05 && hash(ti * 31 + bi * 7 + f) < .5 * dusk + .1;
      prFlat(Cl(prR(bx + 8, y, bx + bw - 8, y + fh * .45)), lit ? mixCol(PRO.strip, PRO.lit, dusk) : mixCol(PRO.strip, c, .35 + .15 * (2 - ti)), k + 'w' + f);
    }
    for (let m = bx + 30; m < bx + bw - 10; m += 34 + ti * 6) dline([[m, by + 12], [m, y1]], .5, mixCol(c, '#2E333A', .35));
  }));
  // a tower crane over the near blocks
  boilSeed('pro crane');
  const cx = 690, cT = 236, cc = mixCol(PRO.crane, '#6A6E74', .25 + dusk * .4);
  for (const s of [-1, 1]) dline([[cx + s * 7, cT], [cx + s * 7, y1]], 1.2, cc);
  for (let y = cT + 6; y < 520; y += 16) dline([[cx - 7, y], [cx + 7, y + 16]], .6, cc);
  dline([[cx - 150, cT + 4], [cx + 290, cT + 4]], 1.6, cc); dline([[cx - 150, cT + 14], [cx + 290, cT + 14]], 1, cc);
  for (let x = cx - 150; x < cx + 290; x += 18) dline([[x, cT + 4], [x + 9, cT + 14]], .5, cc);
  dline([[cx, cT - 36], [cx - 150, cT + 4]], .7, cc); dline([[cx, cT - 36], [cx + 290, cT + 4]], .7, cc);
  prFlat(prR(cx - 150, cT + 4, cx - 108, cT + 24), mixCol(PRO.near, '#3C4148', .3), 'pro-cw');
  const hx = cx + 150 + 30 * Math.sin(t * .35);
  dline([[hx, cT + 14], [hx, cT + 120]], .5, cc); prFlat(prR(hx - 10, cT + 120, hx + 10, cT + 130), cc, 'pro-hook');
  if (dusk > .2) { glow(cx, cT - 38, 18, '#FF5A4A', dusk); }   // the aircraft warning light
}

function prOfficeRoom(t, o) {
  // back wall and the cornice; the ceiling (suspended tiles in perspective, a light panel); the carpet tiles
  const F = OFFICE.floor, VX = 960, VY = 330, dusk = clamp(o.dusk || 0);
  boilSeed('pro wall');
  piece(prR(-60, 40, W + 60, F + 6), PRO.wall, { ink: null, key: 'pro-wall', lift: 0, edge: false, ...PR_SPARSE });
  boilSeed('pro ceil');
  piece(prR(-60, -60, W + 60, 70), PRO.ceil, { sw: 1.4, key: 'pro-ceil', lift: 3 });
  for (const y of [34]) dline([[-60, y], [W + 60, y]], .8, PRO.grid);
  for (let i = -8; i <= 8; i++) { const xw = VX + i * 150, k = (VY + 60) / (VY - 70); dline([[xw, 70], [VX + (xw - VX) * k, -60]], .8, PRO.grid); }
  const lp = [[VX - 150, 34], [VX + 150, 34], [VX + 150 * (VY - 34) / (VY - 70), 70], [VX - 150 * (VY - 34) / (VY - 70), 70]];
  piece(lp.map(([x, y]) => [x, y + 1]), PRO.panel, { sw: 1, key: 'pro-light', lift: 1, flatCard: true });
  for (let i = 1; i < 6; i++) dline([prL(lp[0], lp[3], i / 6), prL(lp[1], lp[2], i / 6)], .5, PRO.panelDk);
  glow(VX, 70, 520, '#FFF6E0', .22 * (1 - dusk * .3));
  piece(prR(-60, 66, W + 60, 80), PRO.wallLt, { sw: 1, key: 'pro-cornice', lift: 2, flatCard: true });
  // the carpet: tiles in perspective, laid quarter-turned (every other one a shade lighter)
  boilSeed('pro carpet');
  piece(prR(-60, F, W + 60, H + 60), PRO.carpet, { ink: null, key: 'pro-carpet', lift: 0, edge: false, density: .3 });
  const rows = [0, 1, 2, 3, 4, 5].map(k => VY + (F - VY) / (1 - k * .082)), X = (xw, y) => VX + (xw - VX) * (y - VY) / (F - VY);
  if (!prDD()) for (let r = 0; r < rows.length - 1; r++) for (let i = -9; i <= 8; i++) {
    if ((i + r) % 2) continue;
    const a = VX + i * 120, b = a + 120, y0 = rows[r], y1 = Math.min(rows[r + 1], H + 60);
    const tile = prClip([[X(a, y0), y0], [X(b, y0), y0], [X(b, y1), y1], [X(a, y1), y1]], prR(-40, F, W + 40, H + 40));   // (kept on the frame: far-off vertices upset the brush)
    if (tile.length > 2) prFlat(tile, PRO.carpetB, 'pro-ct' + r + '_' + i);
  }
  for (const y of rows.slice(1)) if (y < H + 40) dline([[-60, y], [W + 60, y]], 1.2, PRO.carpetLn);
  for (let i = -9; i <= 9; i++) { const a = VX + i * 120, x1 = X(a, H + 40); if (Math.abs(X(a, F) - VX) < 1100) dline([[X(a, F), F], [clamp(x1, -200, W + 200), lerp(F, H + 40, clamp((clamp(x1, -200, W + 200) - X(a, F)) / ((x1 - X(a, F)) || 1)))]], 1.2, PRO.carpetLn); }
  // the skirting board and the perimeter trunking under the window (double sockets)
  boilSeed('pro skirt');
  piece(prR(-60, F - 16, W + 60, F + 4), PRO.skirt, { sw: 1.1, key: 'pro-skirt', lift: 2, flatCard: true });
  piece(prR(140, 690, 1200, 716), PRO.trunk, { sw: 1.1, key: 'pro-trunk', lift: 2, flatCard: true });
  for (const sx of [230, 470, 1110]) { prOn(prR(sx, 694, sx + 44, 712), PRO.trunkDk, 'pro-sock' + sx, { lift: 1 }); for (const d of [12, 30]) prFlat(prR(sx + d, 700, sx + d + 4, 706), '#5A5A5A', 'pro-sk' + sx + d); }
}

function prOfficeWindow(t, o) {
  const { x0, y0, x1, y1 } = OFFICE.win, bw = 14, m1 = x0 + (x1 - x0) / 3, m2 = x0 + (x1 - x0) * 2 / 3, tr = y0 + 112;
  clipPoly(prR(x0, y0, x1, y1), () => prOfficeView(t, o));   // (the view stays in the glass: its mullion lines run past it)
  boilSeed('pro winframe');
  const bar = (P, k) => piece(P, PRO.alu, { sw: 1.3, shade: PRO.aluDk, depth: 4, key: k, lift: 3, flatCard: true });
  bar(prR(x0 - bw, y0 - bw, x1 + bw, y0), 'pro-wf-t'); bar(prR(x0 - bw, y0, x0, y1), 'pro-wf-l'); bar(prR(x1, y0, x1 + bw, y1), 'pro-wf-r');
  for (const mx of [m1, m2]) bar(prR(mx - 6, y0, mx + 6, y1), 'pro-wf-m' + Math.round(mx));
  bar(prR(x0, tr - 5, x1, tr + 5), 'pro-wf-tr');
  // the venetian blind, half-pulled in the middle pane
  boilSeed('pro blind');
  const drop = [70, 112, 52];
  [[x0, m1 - 6], [m1 + 6, m2 - 6], [m2 + 6, x1]].forEach(([a, b], i) => {
    const yb = y0 + drop[i];
    piece(prR(a + 2, y0, b - 2, yb), PRO.blind, { sw: 1, key: 'pro-bl' + i, lift: 3, flatCard: true });
    for (let y = y0 + 8; y < yb - 3; y += 8) dline([[a + 4, y], [b - 4, y]], 1.1, PRO.blindDk);
    prOn(prR(a, yb - 5, b, yb + 3), mixCol(PRO.blindDk, PRO.aluDk, .4), 'pro-blr' + i, { lift: 3 });
    dline([[b - 16, yb], [b - 16, yb + 60 + 10 * i]], .6, PRO.aluDk); prOn(oval(b - 16, yb + 64 + 10 * i, 3, 5, 0, 8), PRO.blindDk, 'pro-blc' + i, { lift: 1 });
  });
  boilSeed('pro sill');
  piece(prR(x0 - 26, y1, x1 + 26, y1 + 16), PRO.sill, { sw: 1.3, shade: PRO.wallDk, depth: 5, key: 'pro-sill', lift: 4 });
}

// the wall clock: hands only (no numbers); h, m set the hands; the second hand ticks with t
function prClock(cx, cy, r, h, m, sec) {
  boilSeed('pro clock');
  piece(oval(cx, cy, r, r, 0, 36), PRO.clockRim, { sw: 1.6, key: 'pro-clockrim', lift: 5 });
  piece(oval(cx, cy, r * .86, r * .86, 0, 36), PRO.clockFace, { ink: null, key: 'pro-clockface', lift: 0, flatCard: true, edge: false });
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU, big = i % 3 === 0, r0 = r * (big ? .64 : .7), r1 = r * .8, w = big ? r * .045 : r * .022;
    const c = Math.cos(a), s = Math.sin(a);
    prFlat([[cx + c * r0 - s * w, cy + s * r0 + c * w], [cx + c * r1 - s * w, cy + s * r1 + c * w], [cx + c * r1 + s * w, cy + s * r1 - c * w], [cx + c * r0 + s * w, cy + s * r0 - c * w]], PRO.clockRim, 'pro-tick' + i);
  }
  const hand = (a, L, w0, w1, col, key, back = .14) => {
    const c = Math.cos(a), s = Math.sin(a), n = [-s, c];
    const P = [[cx - c * L * back + n[0] * w0, cy - s * L * back + n[1] * w0], [cx + c * L + n[0] * w1, cy + s * L + n[1] * w1], [cx + c * L * 1.04, cy + s * L * 1.04], [cx + c * L - n[0] * w1, cy + s * L - n[1] * w1], [cx - c * L * back - n[0] * w0, cy - s * L * back - n[1] * w0]];
    piece(P, col, { ink: null, key, lift: 2, flatCard: true, edge: false });
  };
  const ma = (m / 60) * TAU - Math.PI / 2, ha = (((h % 12) + m / 60) / 12) * TAU - Math.PI / 2;
  hand(ha, r * .45, r * .06, r * .04, PRO.clockRim, 'pro-hh');
  hand(ma, r * .7, r * .045, r * .025, PRO.clockRim, 'pro-mh');
  if (sec != null) hand(sec / 60 * TAU - Math.PI / 2, r * .74, r * .014, r * .01, PRO.second, 'pro-sh', .25);
  piece(oval(cx, cy, r * .07, r * .07, 0, 12), sec != null ? PRO.second : PRO.clockRim, { ink: null, key: 'pro-cap', lift: 1, flatCard: true });
}

// the photocopier: a grey base with paper drawers on castors, the printer body with its output bay (printed copies lie in
// the gap under the scanner and slide out to the left), the scanner on top with a tilted control panel, and the lid,
// hinged at the back: lid 0..1 lifts it (its white pad faces us), scan 0..1 sweeps the light bar across the glass
function prCopier(t, o) {
  const C = OFFICE.copierAt, { x0, x1, top, hinge } = C, fl = 840, lid = ease(clamp(o.copierLid || 0)), scan = o.copierScan;
  const lit = scan != null && scan >= 0 && scan <= 1;
  prShadow((x0 + x1) / 2, fl - 2, (x1 - x0) * .58, 14, 90);
  boilSeed('pro copier');
  // base cabinet: three paper drawers, castors
  piece(prR(x0 + 8, 700, x1 - 8, fl - 6), PRO.base, { sw: 1.6, shade: PRO.baseDk, depth: 14, key: 'pro-cpbase', lift: 5 });
  for (let i = 0; i < 3; i++) { const y = 708 + i * 41; prOn(prR(x0 + 18, y, x1 - 18, y + 35), mixCol(PRO.base, '#FFFFFF', .14), 'pro-cpdr' + i); prFlat(prR((x0 + x1) / 2 - 30, y + 13, (x0 + x1) / 2 + 30, y + 20), PRO.baseDk, 'pro-cph' + i); prFlat(prR(x1 - 44, y + 8, x1 - 30, y + 14), '#E8E4DA', 'pro-cplab' + i); }
  for (const cx of [x0 + 24, x1 - 24]) piece(oval(cx, fl - 4, 9, 7, 0, 12), '#2A2C30', { ink: null, key: 'pro-cpw' + cx, lift: 1, flatCard: true });
  // printer body, the front door's seam, a toner-drop symbol
  piece(prR(x0, 606, x1, 704), PRO.copier, { sw: 1.6, shade: PRO.copierDk, depth: 16, key: 'pro-cpbody', lift: 5 });
  dline([[x0 + 12, 690], [x1 - 12, 690]], .7, PRO.copierDk); dline([[x0 + 150, 616], [x0 + 150, 688]], .7, PRO.copierDk);
  prFlat(curvy([[x0 + 76, 632], [x0 + 84, 648], [x0 + 80, 656], [x0 + 72, 656], [x0 + 68, 648]], 3), PRO.copierDk, 'pro-cptoner');
  // the output bay: a dark gap under the scanner, a column on the right holding the scanner up, printed sheets in it
  prFlat(prR(x0 + 4, 578, x1 - 74, 608), '#3C3B3A', 'pro-cpbay');
  piece(prR(x1 - 76, 572, x1, 610), PRO.copier, { sw: 1.3, shade: PRO.copierDk, depth: 8, key: 'pro-cpcol', lift: 3, flatCard: true });
  const ns = o.copierSheets ?? 2;
  for (let i = 0; i < ns; i++) prOn([[x0 - 14 - i * 2, 600 - i * 3], [x1 - 90, 598 - i * 3], [x1 - 86, 606 - i * 3], [x0 - 10 - i * 2, 608 - i * 3]], i % 2 ? '#E8E4DA' : PRO.paper, 'pro-cpsh' + i, { lift: 1 });
  // the scanner unit and its control panel, tilted out at the front right: a symbol screen and buttons
  piece(prR(x0 - 4, top - 2, x1 + 4, 580), PRO.copier, { sw: 1.5, shade: PRO.copierDk, depth: 10, key: 'pro-cpscan', lift: 4 });
  dline([[x0 + 4, top + 12], [x1 - 4, top + 12]], .6, PRO.copierDk);
  boilSeed('pro cppanel');
  const pn = [[x1 - 118, top + 14], [x1 - 10, top + 14], [x1 + 4, top + 42], [x1 - 128, top + 42]];
  piece(pn, PRO.copierDk, { sw: 1.2, key: 'pro-cppan', lift: 4, flatCard: true });
  const sc = prSub(pn, .06, .18, .5, .82);
  prFlat(sc, lit ? '#B8F0CC' : '#8FC7A8', 'pro-cpscr');
  dline([prAt(sc, .12, .5), prAt(sc, .5, .5)], .7, '#3A5A48'); prFlat([prAt(sc, .6, .25), prAt(sc, .85, .5), prAt(sc, .6, .75)], '#3A5A48', 'pro-cpplay');
  for (let i = 0; i < 6; i++) prFlat(oval(...prAt(pn, .58 + (i % 3) * .07, .35 + Math.floor(i / 3) * .32), 2.4, 2, 0, 8), PRO.copierLt, 'pro-cpk' + i);
  prFlat(oval(...prAt(pn, .86, .4), 6.5, 5, 0, 12), '#3FAE6A', 'pro-cpgo'); prFlat(oval(...prAt(pn, .86, .76), 4.5, 3.5, 0, 10), '#C8463A', 'pro-cpstop');
  if (lit) glow(...prAt(pn, .86, .4), 18, '#7CFFA8', .8);
  // the platen: the top surface and its glass, the scan bar and its light
  const Gq = C.glass, topQ = [[x0 + 6, hinge], [x1 - 6, hinge], [x1 + 4, top], [x0 - 4, top]];
  piece(topQ, PRO.copierLt, { sw: 1.2, key: 'pro-cptop', lift: 2, flatCard: true });
  prFlat(Gq, PRO.glass, 'pro-cpglass');
  if (lit) {
    const k = clamp(scan), bx0 = lerp(Gq[0][0], Gq[1][0], k), bx1 = lerp(Gq[3][0], Gq[2][0], k);
    prFlat([[bx0 - 6, Gq[0][1]], [bx0 + 6, Gq[0][1]], [bx1 + 6, Gq[3][1]], [bx1 - 6, Gq[3][1]]], PRO.beam, 'pro-cpbar');
    glow((bx0 + bx1) / 2, (Gq[0][1] + Gq[3][1]) / 2, 40 + 50 * lid, PRO.beam, .9);
  }
  // the lid: shut, a slab on the platen (light leaks out along its front edge while it scans); open, it stands up on its
  // hinges at the back and shows its white pad, lit by the bar
  boilSeed('pro cplid');
  if (lid < .04) {
    piece([[x0 + 2, hinge - 12], [x1 - 2, hinge - 12], [x1 + 6, top - 4], [x0 - 6, top - 4]], PRO.lid, { sw: 1.4, key: 'pro-cplidc', lift: 3 });
    piece(prR(x0 - 6, top - 5, x1 + 6, top + 4), mixCol(PRO.lid, PRO.copierDk, .5), { sw: 1, key: 'pro-cplide', lift: 2, flatCard: true });
    if (lit) { prFlat(prR(x0 + 14, top + 3, x1 - 14, top + 6), PRO.beam, 'pro-cpleak'); glow(lerp(x0, x1, clamp(scan)), top + 4, 70, PRO.beam, .8); }
  } else {
    const fy = C.lidTop(o.copierLid), sp = 6 * Math.cos(lid * 1.32), P = [[x0 + 2 - sp, fy], [x1 - 2 + sp, fy], [x1 - 2, hinge], [x0 + 2, hinge]];
    for (const hx of [x0 + 40, x1 - 40]) prOn(prR(hx - 10, hinge - 6, hx + 10, hinge + 6), PRO.baseDk, 'pro-cphinge' + hx);
    piece(P, PRO.lid, { sw: 1.4, shade: PRO.copierDk, depth: 8, key: 'pro-cplid', lift: 4 });
    if (fy < hinge - 16) {
      prFlat(prSub(P, .07, .2, .93, .88), PRO.pad, 'pro-cppad');
      prFlat(prSub(P, 0, 0, 1, .07), mixCol(PRO.lid, PRO.copierDk, .45), 'pro-cplidedge');
      if (lit) { const k = clamp(scan); prFlat(prSub(P, lerp(.08, .92, k) - .03, .2, lerp(.08, .92, k) + .03, .88), '#E4FFF0', 'pro-cpref'); glow(...prAt(P, lerp(.1, .9, k), .6), 70, PRO.beam, .45); }
    }
  }
}

// the door: a light-wood fire door with a wired-glass vision panel, a lever handle, a kick plate and a closer; the green
// running-man sign above it. open 0..1 swings it away from us on its right-hand hinges (the corridor shows through).
function prDoor(t, o) {
  const { x0, x1, y0, y1 } = OFFICE.doorAt, open = ease(clamp(o.doorOpen || 0)), a = open * 1.25;
  boilSeed('pro door');
  piece(prR(x0 - 18, y0 - 18, x1 + 18, y1 + 2), PRO.frame, { sw: 1.5, shade: PRO.doorDk, depth: 6, key: 'pro-dframe', lift: 3 });
  piece(prR(x0, y0, x1, y1), PRO.corridor, { ink: null, key: 'pro-corr', lift: 0, flatCard: true, edge: false });
  if (open > .02) {   // the corridor: a wall, a strip light, a floor
    prFlat(prR(x0, y1 - 70, x1, y1), mixCol(PRO.corridor, '#2A2A2A', .3), 'pro-cfloor');
    prFlat(prR(x0 + 30, y0 + 20, x1 - 30, y0 + 30), '#F4F2E8', 'pro-clight');
    glow((x0 + x1) / 2, y0 + 30, 200, '#FFF6E0', .5 * open);
  }
  // the panel, foreshortened as it swings (the free edge on the left)
  const w = x1 - x0, fx = x1 - w * Math.cos(a), sh = 18 * Math.sin(a), P = [[fx, y0 + sh], [x1, y0], [x1, y1], [fx, y1 - sh * .6]];
  const Pn = (u, v) => prAt(P, u, v);
  piece(P, open > .02 ? mixCol(PRO.door, PRO.doorDk, .35 * open) : PRO.door, { sw: 1.6, shade: PRO.doorDk, depth: 10, key: 'pro-door', lift: 4 });
  if (Math.cos(a) > .15) {
    const g = [Pn(.1, .12), Pn(.28, .12), Pn(.28, .56), Pn(.1, .56)];
    piece(g, PRO.dglass, { sw: 1.1, key: 'pro-dglass', lift: 1, flatCard: true });
    for (let i = 1; i < 12; i++) dline([prL(g[0], g[3], i / 12), prL(g[1], g[2], i / 12)], .9, PRO.wire);
    for (let i = 1; i < 3; i++) dline([prL(g[0], g[1], i / 3), prL(g[3], g[2], i / 3)], .9, PRO.wire);
    prOn([Pn(.02, .9), Pn(.98, .9), Pn(.98, 1), Pn(.02, 1)], PRO.kick, 'pro-kick', { shade: PRO.steelDk, depth: 3 });
    const hb = Pn(.09, .52);
    prOn(oval(hb[0], hb[1], 8 * Math.cos(a) + 2, 11, 0, 12), PRO.steelLt, 'pro-hbase');
    piece([[hb[0] - 3, hb[1] - 4], [hb[0] + 38 * Math.cos(a), hb[1] - 5], [hb[0] + 38 * Math.cos(a), hb[1] + 3], [hb[0] - 3, hb[1] + 4]], PRO.steel, { sw: 1, key: 'pro-lever', lift: 3, flatCard: true });
  }
  // the closer arm at the top
  const cA = [x1 - 70, y0 + 14], cB = Pn(.55, .02);
  prOn(prR(x1 - 110, y0 + 4, x1 - 40, y0 + 22), PRO.steel, 'pro-closer'); dline([cA, [lerp(cA[0], cB[0], .5), cA[1] + 14], cB], 2, PRO.steelDk, 0);
  // the exit sign: a running man through a doorway, and an arrow (pictograms only)
  boilSeed('pro exit');
  const ex = (x0 + x1) / 2, ey = y0 - 58;
  piece(prR(ex - 64, ey - 24, ex + 64, ey + 24), PRO.exit, { sw: 1.3, key: 'pro-exit', lift: 4, flatCard: true });
  prFlat(prR(ex + 4, ey - 18, ex + 28, ey + 18), PRO.exitLt, 'pro-exd'); prFlat(prR(ex + 8, ey - 14, ex + 24, ey + 18), PRO.exit, 'pro-exd2');
  prFlat(oval(ex - 12, ey - 13, 4, 4, 0, 10), PRO.exitLt, 'pro-exh');
  for (const [P, k] of [[[[ex - 13, ey - 8], [ex - 5, ey + 2]], 't'], [[[ex - 5, ey + 2], [ex + 2, ey + 8], [ex + 1, ey + 17]], 'l1'], [[[ex - 6, ey + 2], [ex - 14, ey + 10], [ex - 24, ey + 10]], 'l2'], [[[ex - 12, ey - 6], [ex - 2, ey - 4], [ex + 3, ey - 9]], 'a1'], [[[ex - 12, ey - 6], [ex - 20, ey], [ex - 27, ey - 4]], 'a2']])
    piece(ribbon(P, 5.5, 5), PRO.exitLt, { ink: null, key: 'pro-exm' + k, lift: 0, flatCard: true, edge: false });
  prFlat([[ex - 56, ey - 3], [ex - 38, ey - 3], [ex - 38, ey - 10], [ex - 29, ey], [ex - 38, ey + 10], [ex - 38, ey + 3], [ex - 56, ey + 3]], PRO.exitLt, 'pro-exa');
  glow(ex, ey, 90, '#8CFFB0', .25);
}

// the coat stand: a pole on a round base, pegs at the top, a mac and a scarf hanging, an umbrella leaning on it
function prCoatStand(t, o) {
  const x = 108, fl = 842, tp = 330;
  prShadow(x, fl, 60, 10, 80);
  boilSeed('pro coatstand');
  piece(curvy([[x - 50, fl - 4], [x + 50, fl - 4], [x + 46, fl + 6], [x - 46, fl + 6]], 2), PRO.brolly, { sw: 1.2, key: 'pro-csbase', lift: 3, flatCard: true });
  piece(prR(x - 6, tp, x + 6, fl), '#5A4632', { sw: 1.3, key: 'pro-cspole', lift: 4, flatCard: true });
  for (const s of [-1, 1]) piece(ribbon([[x, tp + 26], [x + s * 26, tp + 10], [x + s * 34, tp - 4]], 7, 5), '#5A4632', { sw: 1, key: 'pro-cspeg' + s, lift: 3, flatCard: true });
  piece(oval(x, tp - 4, 10, 10, 0, 12), '#5A4632', { sw: 1, key: 'pro-cstop', lift: 3, flatCard: true });
  // the mac: hung by its collar from the left peg
  const mx = x - 30, my = tp + 2;
  piece(curvy([[mx - 14, my], [mx + 16, my], [mx + 42, my + 60], [mx + 50, my + 250], [mx + 20, my + 262], [mx - 22, my + 258], [mx - 52, my + 246], [mx - 44, my + 60]], 4), PRO.coat, { sw: 1.5, shade: PRO.coatDk, depth: 16, key: 'pro-mac', lift: 5 });
  dline([[mx + 2, my + 20], [mx - 2, my + 256]], .9, PRO.coatDk);
  piece(prR(mx - 44, my + 118, mx + 44, my + 132), PRO.coatDk, { sw: 1, key: 'pro-macbelt', lift: 2, flatCard: true });
  for (const by of [my + 70, my + 170]) prFlat(oval(mx + 8, by, 4, 4, 0, 10), '#3A3530', 'pro-macb' + by);
  // the scarf over the right peg
  piece(ribbon([[x + 30, tp + 4], [x + 38, tp + 60], [x + 34, tp + 150]], 22, 20), PRO.scarf, { sw: 1.2, key: 'pro-scarf', lift: 4, flatCard: true });
  for (let i = 0; i < 3; i++) dline([[x + 24, tp + 132 + i * 7], [x + 46, tp + 130 + i * 7]], 1.2, '#C9B99A', 0);
  // the umbrella, furled, leaning
  piece(curvy([[x + 44, fl - 6], [x + 60, fl - 6], [x + 92, fl - 230], [x + 86, fl - 236]], 2), PRO.brolly, { sw: 1.2, key: 'pro-brolly', lift: 4 });
  piece(ribbon([[x + 89, fl - 232], [x + 94, fl - 262], [x + 110, fl - 268], [x + 116, fl - 254]], 5, 5), '#6A4A32', { sw: 1, key: 'pro-brh', lift: 3, flatCard: true });
}

// a motivational poster (a peak and a flag) and a wall calendar (a grid, a picture, no numbers)
function prOfficeWallThings(t, o) {
  boilSeed('pro poster');
  const px = 1222, py = 306;
  piece(prR(px, py, px + 130, py + 176), '#2E3137', { sw: 1.3, key: 'pro-poster', lift: 4, flatCard: true });
  prFlat(prR(px + 8, py + 8, px + 122, py + 128), '#8FA6BC', 'pro-psky');
  prFlat([[px + 8, py + 128], [px + 52, py + 46], [px + 84, py + 92], [px + 98, py + 76], [px + 122, py + 112], [px + 122, py + 128]], '#586A7C', 'pro-pmtn');
  prFlat([[px + 41, py + 66], [px + 52, py + 46], [px + 63, py + 63], [px + 56, py + 60], [px + 48, py + 68]], '#EEF2F4', 'pro-psnow');
  dline([[px + 52, py + 46], [px + 52, py + 27]], .8, '#2E3137'); prFlat([[px + 52, py + 27], [px + 67, py + 32], [px + 52, py + 37]], '#C8463A', 'pro-pflag');
  prScrib(px + 30, py + 152, 70, 1.2, '#8A8E94', 1.4, 2);
}

// the next workstation along (open plan): its monitor's back and an empty chair peeking over a fabric partition screen
function prNeighbour(t, o) {
  const x0 = 214, x1 = 410, y0 = 612, fl = 866;
  boilSeed('pro neighbour');
  piece(prR(270, 552, 380, 624), PRO.mon, { sw: 1.3, key: 'pro-nmon', lift: 3 });
  prFlat(prR(282, 562, 368, 612), PRO.monLt, 'pro-nmonb');
  piece(curvy([[296, 590], [334, 584], [372, 590], [374, 640], [294, 640]], 3), PRO.chair, { sw: 1.3, shade: PRO.chairDk, depth: 8, key: 'pro-nchair', lift: 4 });
  prShadow((x0 + x1) / 2, fl, (x1 - x0) * .55, 9, 70);
  piece(prR(x0, y0, x1, fl), '#6F7E8E', { sw: 1.5, shade: '#58667A', depth: 12, key: 'pro-part', lift: 5 });
  for (let i = 1; i < 9; i++) dline([[x0 + 10, y0 + i * 27], [x1 - 10, y0 + i * 27 + 1]], .45, '#627080');
  for (const [a, b] of [[[x0 - 4, y0 - 6], [x1 + 4, y0 + 4]], [[x0 - 4, y0], [x0 + 6, fl]], [[x1 - 6, y0], [x1 + 4, fl]]]) piece(prR(a[0], a[1], b[0], b[1]), PRO.alu, { sw: 1, key: 'pro-prail' + a[0] + a[1], lift: 3, flatCard: true });
  for (const fx of [x0 + 1, x1 - 1]) piece(prR(fx - 16, fl - 4, fx + 16, fl + 4), PRO.aluDk, { sw: .9, key: 'pro-pfoot' + fx, lift: 2, flatCard: true });
  // a photo and a note pinned to the screen
  prOn(prR(x0 + 26, y0 + 30, x0 + 64, y0 + 60), '#E8E2D4', 'pro-ppin1'); prFlat(prR(x0 + 30, y0 + 34, x0 + 60, y0 + 52), '#A7B89A', 'pro-ppin1p');
  prOn(prR(x1 - 60, y0 + 24, x1 - 30, y0 + 52), PRO.note, 'pro-ppin2'); prScrib(x1 - 56, y0 + 36, 20, .8, '#8A7A3A', .6, 3);
}

// her chair, behind the desk (only its back shows above the desk top; its castors under the modesty panel)
function prChair(t, o) {
  if (o.chair === false) return;
  const x = OFFICE.chair[0] + (o.chairX || 0), seat = 770;
  boilSeed('pro chair');
  for (const [dx, k] of [[-58, 0], [0, 1], [58, 2]]) piece(oval(x + dx, 896, 9, 7, 0, 12), '#1E2024', { ink: null, key: 'pro-chw' + k, lift: 1, flatCard: true });
  piece([[x - 64, 884], [x + 64, 884], [x + 56, 892], [x - 56, 892]], PRO.chairDk, { sw: 1, key: 'pro-chstar', lift: 2, flatCard: true });
  piece(prR(x - 5, seat, x + 5, 886), PRO.steelDk, { sw: .9, key: 'pro-chgas', lift: 2, flatCard: true });
  piece(curvy([[x - 76, seat - 150], [x, seat - 162], [x + 76, seat - 150], [x + 80, seat - 30], [x + 70, seat], [x - 70, seat], [x - 80, seat - 30]], 4), PRO.chair, { sw: 1.5, shade: PRO.chairDk, depth: 14, key: 'pro-chback', lift: 5 });
  dline([[x - 58, seat - 130], [x + 58, seat - 130]], .7, PRO.chairLt, .5);
}

function officeBack(t, lt, o = {}) {
  const [h, m] = o.clock || [9, 0];
  prOfficeRoom(t, o);
  prOfficeWindow(t, o);
  prOfficeWallThings(t, o);
  prClock(OFFICE.clock[0], OFFICE.clock[1], OFFICE.clock[2], h, m, o.seconds === false ? null : Math.floor(t) % 60);
  prDoor(t, o);
  prCoatStand(t, o);
  prNeighbour(t, o);
  prCopier(t, o);
  prChair(t, o);
}

// ---------- her desk (front) ----------
function prMonitor(t, lt, o) {
  const S = OFFICE.screen, b = 9, ex = (P, d) => [[P[0][0] - d, P[0][1] - d], [P[1][0] + d, P[1][1] - d * .9], [P[2][0] + d, P[2][1] + d * .9], [P[3][0] - d, P[3][1] + d]];
  const casing = ex(S, b);
  boilSeed('pro monitor');
  const bx = (S[1][0] + S[0][0]) / 2 + 8, by = OFFICE.deskTop.y;
  piece(curvy([[bx - 40, by - 4], [bx + 40, by - 6], [bx + 44, by + 4], [bx - 44, by + 6]], 3), PRO.mon, { sw: 1.2, key: 'pro-mbase', lift: 2, flatCard: true });
  piece(prR(bx - 9, (S[2][1] + S[3][1]) / 2, bx + 9, by), PRO.monLt, { sw: 1.1, key: 'pro-mneck', lift: 3, flatCard: true });
  piece([casing[1], [casing[1][0] + 12, casing[1][1] + 8], [casing[2][0] + 12, casing[2][1] - 6], casing[2]], PRO.monLt, { sw: 1.1, key: 'pro-mside', lift: 3, flatCard: true });
  piece(casing, PRO.mon, { sw: 1.4, key: 'pro-mcase', lift: 4 });
  prFlat(S, PRO.scr, 'pro-mscr');
  if (o.monitor) { const ctx = prSurface(S, t, lt, 'monitor'); o.monitor(ctx); }
  else {   // a document window: a title bar, a sidebar of icons, a picture, lines of "text", the cursor
    const at = (u, v) => prAt(S, u, v), q = (u0, v0, u1, v1) => prSub(S, u0, v0, u1, v1);
    prFlat(q(0, 0, 1, .12), PRO.scrBar, 'pro-mbar');
    for (let i = 0; i < 3; i++) prFlat(oval(...at(.05 + i * .045, .06), 2.2, 2.2, 0, 8), ['#E86A5A', '#E8C25A', '#6AC27A'][i], 'pro-mdot' + i);
    for (let i = 0; i < 4; i++) prFlat(q(.03, .2 + i * .18, .12, .32 + i * .18), mixCol(PRO.scrInk, PRO.scr, .45), 'pro-mico' + i);
    prFlat(q(.18, .2, .5, .56), '#A9C4D2', 'pro-mpic');
    prFlat([at(.2, .54), at(.3, .34), at(.38, .46), at(.43, .4), at(.49, .54)], '#6E8C6A', 'pro-mpicm');
    prFlat(oval(...at(.42, .3), 4, 4, 0, 10), '#E8C25A', 'pro-mpics');
    for (let i = 0; i < 7; i++) { const v = .22 + i * .1, u1 = i < 4 ? .95 : .92 - .25 * hash(i + 3), u0 = i < 4 ? .56 : .18; dline([at(u0, v), at(lerp(u0, u1, .5), v + .005), at(u1, v)], .9, PRO.scrInk, .5); }
    const c = at(.7, .62); prFlat([[c[0], c[1]], [c[0], c[1] + 14], [c[0] + 4, c[1] + 10], [c[0] + 7, c[1] + 16], [c[0] + 9, c[1] + 15], [c[0] + 6, c[1] + 9], [c[0] + 11, c[1] + 9]], '#1E2024', 'pro-mcur');
  }
  // the bezel over the screen's edge (hides any overdraw from a screen callback)
  for (const [a, bb, k] of [[0, 1, 't'], [1, 2, 'r'], [2, 3, 'b'], [3, 0, 'l']]) {
    const A = S[a], B = S[bb], A2 = casing[a], B2 = casing[bb];
    prFlat([A2, B2, prL(B, B2, -.35), prL(A, A2, -.35)], PRO.mon, 'pro-mbz' + k);
  }
  if ((o.screenGlow ?? 1) > 0) glow((S[0][0] + S[1][0]) / 2, (S[0][1] + S[3][1]) / 2, 120, '#CFE6FF', .18 * (o.screenGlow ?? 1));
  // sticky notes on the bezel
  prOn(prR(casing[1][0] - 22, casing[1][1] + 4, casing[1][0] - 2, casing[1][1] + 24), PRO.note, 'pro-note1', { rot: 0 });
  prOn([[casing[3][0] - 4, casing[3][1] - 30], [casing[3][0] + 16, casing[3][1] - 32], [casing[3][0] + 17, casing[3][1] - 12], [casing[3][0] - 3, casing[3][1] - 10]], '#9AD0E8', 'pro-note2');
  dline([[casing[1][0] - 19, casing[1][1] + 12], [casing[1][0] - 6, casing[1][1] + 13]], .6, '#8A7A3A');
}
// a desk plant in a white pot: a spider plant, its leaves arching out (drawn at the pot's base (x, y), size s ≈ 1)
function prDeskPlant(x, y, s = 1, key = 'pro-plant') {
  boilSeed(key);
  const L = (pts, w, col, k) => piece(ribbon(pts.map(([a, b]) => [x + a * s, y + b * s]), w * s, 1.2 * s), col, { sw: .9, key: key + k, lift: 2, flatCard: true });
  const leaves = [[-1, 60, 30], [1, 64, 28], [-1, 46, 52], [1, 44, 56], [-.2, 70, 8], [.35, 66, 14]];
  leaves.forEach(([d, h, sp], i) => L([[d * 4, -40], [d * sp * .5, -40 - h * .8], [d * sp, -40 - h * .7], [d * (sp + 16), -40 - h * .3]], 7, i % 2 ? PRO.plant : PRO.plantLt, 'l' + i));
  piece([[-22, -44], [22, -44], [17, 0], [-17, 0]].map(([a, b]) => [x + a * s, y + b * s]), PRO.pot, { sw: 1.2, shade: PRO.potDk, depth: 8 * s, key: key + 'pot', lift: 3 });
  piece(prR(x - 24 * s, y - 48 * s, x + 24 * s, y - 40 * s), PRO.pot, { sw: 1, key: key + 'rim', lift: 2, flatCard: true });
}
// an office mug (a coloured band, never a slogan) standing at (x, y), height h; steam 0..1
function prMug(x, y, h = 36, key = 'pro-mug', steam = 0, t = 0, band = PRO.mugBand) {
  boilSeed(key);
  const w = h * .78;
  piece(prRing(x + w * .5, y - h * .5, h * .26, h * .3, h * .09), PRO.mug, { sw: 1, key: key + 'h', lift: 2, flatCard: true });
  piece(curvy([[x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2 - 2, y], [x - w / 2 + 2, y]], 2), PRO.mug, { sw: 1.2, shade: '#C9C3B6', depth: w * .2, key: key + 'b', lift: 3 });
  prFlat(prR(x - w / 2 + 1, y - h * .62, x + w / 2 - 1, y - h * .42), band, key + 'band');
  prFlat(oval(x, y - h + 2, w / 2 - 3, 3, 0, 14), PRO.coffee, key + 'top');
  for (let k = 0; k < 2 && steam > 0; k++) { const ph = frac(t * .45 + k * .5), sy = y - h - 8 - ph * 40; dline([[x - 4 + k * 8, sy + 16], [x - 8 + k * 8 + Math.sin(ph * 6 + k) * 5, sy + 6], [x - 3 + k * 8, sy - 4]], 1.1 * (1 - ph) * steam, '#9A9690', .5); }
}
// a ring (a mug handle): outer radii rx, ry, thickness th, open toward -x
function prRing(cx, cy, rx, ry, th) {
  const O = [], I = [];
  for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + i / 12 * Math.PI; O.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); I.push([cx + Math.cos(a) * (rx - th), cy + Math.sin(a) * (ry - th)]); }
  return O.concat(I.reverse());
}

function officeFront(t, lt, o = {}) {
  const D = OFFICE.deskTop, bot = 906;
  prShadow((D.x0 + D.x1) / 2, bot, (D.x1 - D.x0) * .55, 16, 80);
  boilSeed('pro desk');
  // legs and the modesty panel (a gap underneath shows the chair's castors), the drawer pedestal on the right
  for (const lx of [D.x0 + 10, D.x1 - 30]) piece(prR(lx, D.front, lx + 20, bot), PRO.steel, { sw: 1.2, shade: PRO.steelDk, depth: 6, key: 'pro-dleg' + lx, lift: 4, flatCard: true });
  piece(prR(D.x0 + 30, D.front + 10, D.x1 - 30, 868), PRO.steel, { sw: 1.4, shade: PRO.steelDk, depth: 12, key: 'pro-modesty', lift: 5 });
  for (let i = 0; i < 9; i++) dline([[D.x0 + 60 + i * 8, 846], [D.x0 + 60 + i * 8, 858]], .6, PRO.steelDk);
  const px0 = D.x1 - 190, px1 = D.x1 - 34;
  piece(prR(px0, D.front + 6, px1, bot - 2), PRO.steelLt, { sw: 1.4, shade: PRO.steel, depth: 12, key: 'pro-ped', lift: 6 });
  [[D.front + 16, 40], [D.front + 62, 40], [D.front + 108, 42]].forEach(([y, hh], i) => { prOn(prR(px0 + 8, y, px1 - 8, y + hh), mixCol(PRO.steelLt, '#FFFFFF', .15), 'pro-pdr' + i); prFlat(prR((px0 + px1) / 2 - 20, y + 8, (px0 + px1) / 2 + 20, y + 13), PRO.steelDk, 'pro-pdh' + i); });
  prFlat(oval(px1 - 22, D.front + 26, 4, 4, 0, 10), '#D8C070', 'pro-lock');
  // the top: the surface (seen from a little above) and its front edge
  piece([[D.x0 + 12, D.far], [D.x1 - 12, D.far], [D.x1, D.front], [D.x0, D.front]], PRO.desk, { sw: 1.5, key: 'pro-dtop', lift: 5 });
  piece(prR(D.x0, D.front, D.x1, D.front + 13), PRO.deskEdge, { sw: 1.3, key: 'pro-dedge', lift: 4, flatCard: true });
  dline([[D.x0 + 60, D.far + 10], [D.x0 + 260, D.far + 9]], .6, mixCol(PRO.desk, PRO.deskDk, .4));
  // on the desk: papers, the in-tray, the monitor, keyboard and mouse, the plant, the mug, a pen pot
  boilSeed('pro deskstuff');
  const Dy = D.y;
  piece([[D.x0 + 110, Dy - 6], [D.x0 + 190, Dy - 10], [D.x0 + 196, Dy + 6], [D.x0 + 112, Dy + 10]], PRO.paper, { sw: 1, key: 'pro-paper1', lift: 1.5, flatCard: true });
  prScrib(D.x0 + 124, Dy - 1, 54, .8, PRO.paperDk, .8, 1);
  prMonitor(t, lt, o);
  // keyboard and mouse
  const kx = 612, kw = 158;
  piece([[kx + 6, Dy - 8], [kx + kw - 6, Dy - 8], [kx + kw, Dy + 8], [kx, Dy + 8]], PRO.key, { sw: 1.2, key: 'pro-kb', lift: 2, flatCard: true });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 12; c++) { const y = Dy - 5 + r * 4.4, x = kx + 10 + c * 11.6 + r * 2; prFlat(prR(x, y, x + 8, y + 3), PRO.keyLt, 'pro-k' + r + '_' + c); }
  prOn(oval(806, Dy + 2, 26, 8, 0, 18), '#4E6A84', 'pro-mmat', { lift: .8 });
  piece(oval(806, Dy - 1, 8, 6, 0, 14), PRO.keyLt, { sw: 1, key: 'pro-mouse', lift: 2, flatCard: true });
  // the in-tray on the right: a wire tray with a stack
  const ix = 952;
  for (let i = 0; i < 4; i++) prOn([[ix - 34, Dy - 4 - i * 3], [ix + 34, Dy - 4 - i * 3], [ix + 38, Dy + 4 - i * 3], [ix - 38, Dy + 4 - i * 3]], i % 2 ? PRO.paper : '#E6E0D2', 'pro-in' + i, { lift: .8 });
  piece(prR(ix - 40, Dy - 20, ix + 40, Dy + 6), PRO.steelDk, { sw: 1, key: 'pro-tray', lift: 2, flatCard: true, op: 255 });
  prFlat(prR(ix - 36, Dy - 16, ix + 36, Dy + 2), PRO.paper, 'pro-trayp');
  prScrib(ix - 28, Dy - 9, 50, .7, PRO.paperDk, .7, 4);
  // her things (they go in the box at 5 o'clock)
  if (o.plant !== false) prDeskPlant(468, Dy + 4, 1, 'pro-plant');
  if (o.mug !== false) prMug(588, Dy + 4, 34, 'pro-mug', (o.clock || [9, 0])[0] < 12 ? 1 : 0, t);
  // pen pot
  boilSeed('pro pens');
  for (const [dx, a, c] of [[-4, -.2, '#2E4E9A'], [2, .05, '#1E1E22'], [6, .25, '#C8463A']]) dline([[1000 - 20 + dx, Dy - 20], [1000 - 20 + dx + Math.sin(a) * 30, Dy - 20 - Math.cos(a) * 30]], 2.4, c, 0);
  piece(curvy(prR(967, Dy - 30, 993, Dy + 2), 2), '#8C9095', { sw: 1, key: 'pro-penpot', lift: 2, flatCard: true });
  if (o.onDesk) o.onDesk(t, lt);
}

// Her cardboard box (V1b–V1d): an archive box with a hand-hole, open, her plant and mug poking out. (x, y) = the
// middle of its bottom edge, s = its width px. o: plant / mug (default true), frame (a photo frame, default true), rot.
function prBox(x, y, s, o = {}) {
  const k = o.key || 'prbox', h = s * .62;
  push(); translate(x, y); if (o.rot) rotate(o.rot);
  boilSeed(k);
  const sc = s / 160;
  if (o.frame !== false) { piece([[-s * .36, -h - s * .2], [-s * .1, -h - s * .24], [-s * .08, -h + 10], [-s * .36, -h + 10]], '#3A3530', { sw: 1.1, key: k + 'fr', lift: 2, flatCard: true }); prFlat([[-s * .32, -h - s * .16], [-s * .13, -h - s * .19], [-s * .12, -h], [-s * .32, -h]], '#9AB4C4', k + 'frp'); }
  if (o.plant !== false) prDeskPlant(s * .22, -h + 18 * sc, sc * 1.05, k + 'pl');
  if (o.mug !== false) prMug(-s * .02, -h + 16 * sc, 34 * sc, k + 'mg');
  piece([[-s / 2, -h], [s / 2, -h], [s / 2 - 4, 0], [-s / 2 + 4, 0]], PRO.kraft, { sw: 1.4, shade: PRO.kraftDk, depth: s * .09, key: k + 'b', lift: 5 });
  piece(prR(-s / 2 - 2, -h - 2, s / 2 + 2, -h + s * .08), PRO.kraftLt, { sw: 1.1, key: k + 'rim', lift: 2, flatCard: true });
  piece(curvy([[-s * .14, -h + s * .15], [s * .14, -h + s * .15], [s * .14, -h + s * .22], [-s * .14, -h + s * .22]], 3), '#4A3622', { ink: null, key: k + 'hole', lift: 0, flatCard: true, edge: false });
  dline([[-s * .45, -h * .4], [s * .45, -h * .42]], .8, PRO.kraftDk);
  pop();
}

// The review loops draw in the page's look, or in ?look=doodle | xerox | ink (render.mjs --query=look=xerox).
const PR_LOOK = new URLSearchParams(location.search).get('look');
function prLookBegin() {
  if (!PR_LOOK) return;
  look(PR_LOOK); boilSeed('pr ground');
  if (PR_LOOK === 'doodle') linedPaper(); else if (PR_LOOK === 'xerox') _paint(prR(-60, -60, W + 60, H + 60), { wash: XEROX.paper, ink: null });
}
function prLookEnd(t) { if (PR_LOOK === 'xerox') xeroxGrit(t, .6); }

// ---------- the office review loop ----------
// 0–6 s: the clock hands run 9:00 → 5:00 (and dusk falls), the copier lid lifts and the bar sweeps twice, the door
// opens and shuts. Her at her desk; him standing at the boss's spot for scale.
LOOPS.office = t0 => {
  prLookBegin();
  const t = mt(t0), hrs = lerp(9, 17, ease(seg(t, .5, 4.5))), h = Math.floor(hrs), m = (hrs - h) * 60;
  const lid = seg(t, 1, 1.8) - seg(t, 4.6, 5.4), scan = t > 2 && t < 4.4 ? frac((t - 2) / 1.2) : null;
  const o = { clock: [h, m], dusk: seg(t, 3, 4.5), copierLid: lid, copierScan: scan, doorOpen: seg(t, 3.2, 3.8) - seg(t, 5, 5.6) };
  // the API: from 3 s a shot fills the monitor (here a test card), from 4.5 s her plant and mug are in her box
  if (t > 3 && t < 4.5) o.monitor = ctx => { ctx.begin(); piece(prR(0, 0, W, H), '#2E3A6A', { ink: null, key: 'mtc', lift: 0, flatCard: true, edge: false }); piece(oval(960, 540, 300, 300, 0, 32), '#F4F2E8', { ink: null, key: 'mtc2', lift: 0, flatCard: true, edge: false }); ctx.end(); };
  if (t >= 4.5) { o.plant = false; o.mug = false; o.onDesk = () => prBox(700, OFFICE.deskTop.y + 8, 170, { key: 'prboxL' }); }
  officeBack(t, t, o);
  const [cx, cy, cu, sh] = OFFICE.chair;
  person(cx, cy, cu, HER_C, { ...feel('neutral', t), seated: true, seatH: sh, pose: 'lap', lookX: .4, boilKey: 'prHer' });
  officeFront(t, t, o);
  const [bx, by, bu] = OFFICE.boss;
  person(bx, by, bu, HIM_C, { ...feel('neutral', t), view: 'q', flip: true, boilKey: 'prHim' });
  prLookEnd(t);
};
LOOPS.office.len = 6;

// =====================================================================================================================
// FLAT: her small London rental, evening (V1g–V1j, P1a). Magnolia walls in lamplight, a sash window on the left with
// rain on the glass (the terrace opposite, a street lamp), plum curtains, a panel radiator with socks drying on it and a
// pile of unopened post on the floor under it; a tired teal sofa with a throw and a cushion, fairy lights above it, a
// crooked print; a table lamp; a leggy houseplant with a yellowing leaf. In front, the coffee table: her laptop (turned
// toward her), her notebook open on its doodles, biros, tea, a pot noodle, the phone face down. Cosy but tired.
//   flatBack(t, lt, o)   the room, the window, the sofa (she sits on it between the layers).
//   flatFront(t, lt, o)  the coffee table and everything on it; the laptop's screen and the notebook's page are layers:
// o: rain 0..1 (default 1) · screen(ctx) fills the laptop screen (prSurface ctx: begin()/end() map a 1920 × 1080 frame
//    onto it; ctx.quad / ctx.at(u, v) for placing things) · screenCol (the screen's base colour) · screenGlow 0..1 ·
//    page(ctx) draws on the notebook's right-hand page (same ctx; a 1920 × 1080 frame mapped onto the page) ·
//    doodles: false (a blank page) · lamp 0..1, fairy 0..1 (default on, off in the morning) · morning 0..1 (F1: daylight
//    and a sun in the window, the terrace opposite lit by day, the street lamp and the fairy lights off; set rain: 0 too)
//    · onTable(t, lt) (after the table, for hands and props) · lidAway: the laptop turned to face her on the sofa, its back
//    to us (no screen shown: FLAT.lidAway).
const PRF = {
  wall: '#B7A386', wallDk: '#9A876C', wallLt: '#CDBB9C', skirt: '#D8CFBE', floor: '#665A51', floorLn: '#56493F',
  night: '#1B2233', nightLo: '#3A2E3A', roofs: '#12151E', roofLt: '#20242F', winLit: '#E8B860', winTV: '#6A7AB0', lampC: '#FFB45E',
  sash: '#D6CFC1', sashDk: '#AFA798', curtain: '#7A5A66', curtainDk: '#5A4050', curtainLt: '#96727E',
  rad: '#D8D2C4', radDk: '#B2AB9C', sockA: '#3F5B74', sockB: '#8E8A84',
  sofa: '#4F6E6B', sofaDk: '#3A5250', sofaLt: '#6A8A86', throw: '#DDD0B6', throwDk: '#BBAE92', cushion: '#C9A09A', cushionDk: '#A87E78', wood: '#4A3628',
  rug: '#556E6A', rugLt: '#DCCFB4', rugDk: '#40564F',
  table: '#B08E62', tableDk: '#8A6C46', tableLt: '#C6A67A',
  lap: '#A8ABB0', lapDk: '#7E8288', bezel: '#26282C', lapScr: '#DCE6F0', keys: '#3A3C40',
  paper: '#F2EDE2', paperDk: '#CFC8B8', rule: '#9DB7DC', margin: '#E08A8A', spiral: '#8A8E94', biro: '#26358C',
  env: '#EEE8DA', envDk: '#C9C0AE', manila: '#C8A874', red: '#C8463A',
  shade: '#EFD9A8', shadeLit: '#F6E4B8', lampBase: '#7A8C84', leaf: '#4E7A48', leafDk: '#3A5E36', leafLt: '#6E9A5E', leafSick: '#C8B45A', pot: '#9A5E44', potDk: '#6E3E2C',
  fairy: '#FFD98A', wire: '#3A332C', print: '#3A3530',
};
const FLAT = {
  u: 30, floor: 762,
  sofa: [900, 900, 30, 4.3],        // sitting on the sofa at the laptop: [x, ground y, u, seatH]; view 'q', flip: true (facing the laptop)
  sofaMid: [1090, 900, 30, 4.3],    // the middle of the sofa (front view: the second seat, e.g. Muse or him)
  window: [410, 864, 30],           // standing at the window (in front of the radiator): 3/4, flip: true (facing it)
  win: { x0: 130, y0: 150, x1: 490, y1: 590 },
  screen: [[606, 732], [756, 722], [750, 840], [600, 850]],   // the laptop screen [tl, tr, br, bl] (a parallelogram)
  notebook: { left: [[810, 849], [904, 845], [906, 893], [812, 897]], right: [[904, 845], [1000, 849], [1002, 897], [906, 893]] },   // the open pages, [tl, tr, br, bl] (parallelograms)
  tableTop: { x0: 540, x1: 1190, far: 834, front: 912 },
  // the laptop turned to face her on the sofa (o.lidAway): the lid's back to us [tl, tr, br, bl] (its bottom edge the
  // hinge), the deck running back from the hinge toward her, and face: where the screen's light (and anything coming out
  // of it) shows, off the lid's edge on her side
  lidAway: { lid: [[581, 725], [683, 741], [708, 862], [606, 846]], deck: [[606, 846], [708, 862], [785, 842], [683, 826]], face: [728, 790] },
};

// the night outside the sash window: the terrace across the road (chimneys, lit windows, a TV's blue), a street lamp, rain
function prFlatView(t, o) {
  const { x0, y0, x1, y1 } = FLAT.win, G = prR(x0, y0, x1, y1), Cl = P => prClip(P, G), mo = clamp(o.morning || 0), nt = 1 - mo;
  boilSeed('prf view');
  piece(G, mixCol(PRF.night, '#BCD2E4', mo), { ink: null, key: 'prf-night', lift: 0, edge: false });
  prFlat(Cl(prR(x0, 330, x1, y1)), mixCol(mixCol(PRF.night, PRF.nightLo, .7), '#F2DDB8', mo), 'prf-glowband');
  if (mo > .3) { const sx = x0 + 96, sy = 236 - 30 * mo; piece(oval(sx, sy, 28, 28, 0, 24), '#F6D26A', { ink: null, key: 'prf-sun', lift: 0, flatCard: true, edge: false }); glow(sx, sy, 110, '#FFE8A0', .7 * mo); }
  // the terrace opposite: a roofline with chimney stacks, windows (warm, one TV-blue, some dark)
  const roof = [[x0 - 10, 360], [x0 + 60, 360], [x0 + 60, 322], [x0 + 92, 322], [x0 + 92, 352], [x0 + 190, 352], [x0 + 190, 316], [x0 + 226, 316], [x0 + 226, 348], [x1 + 10, 348], [x1 + 10, y1], [x0 - 10, y1]];
  const roofs = mixCol(PRF.roofs, '#8C6A5C', mo), roofLt = mixCol(PRF.roofLt, '#6A6E78', mo);
  piece(Cl(roof), roofs, { ink: null, key: 'prf-roofs', lift: 0, flatCard: true, edge: false });
  if (mo > .02) prFlat(Cl([[x0 - 10, 360], [x0 + 60, 360], [x0 + 60, 348], [x1 + 10, 348], [x1 + 10, 366], [x0 - 10, 378]]), mixCol(PRF.roofs, '#5E626C', mo), 'prf-slates');
  for (const cx of [x0 + 64, x0 + 72, x0 + 80, x0 + 194, x0 + 204, x0 + 214]) prFlat(Cl(prR(cx, 310 + (cx % 3) * 2, cx + 6, 324)), roofLt, 'prf-pot' + cx);
  prFlat(Cl(prR(x0 - 10, 440, x1 + 10, 446)), roofLt, 'prf-string');
  [[x0 + 28, 380, 'lit'], [x0 + 118, 380, 'dark'], [x0 + 208, 380, 'tv'], [x0 + 298, 380, 'lit'], [x0 + 28, 470, 'dark'], [x0 + 118, 470, 'lit'], [x0 + 208, 470, 'dark'], [x0 + 298, 470, 'lit']].forEach(([wx, wy, k], i) => {
    const col = k === 'lit' ? PRF.winLit : k === 'tv' ? mixCol(PRF.winTV, '#9AAAD8', .5 + .5 * Math.sin(t * 5.3 + Math.sin(t * 13) * .8)) : PRF.roofLt;
    prFlat(Cl(prR(wx, wy, wx + 40, wy + 56)), mixCol(col, i % 3 ? '#8A9AAA' : '#B8C8D6', mo), 'prf-w' + i);
    dline([[wx + 20, wy], [wx + 20, wy + 56]], .8, mixCol(PRF.roofs, '#E8E2D6', mo));
    if (k !== 'dark' && nt > .05) glow(wx + 20, wy + 28, 34, k === 'lit' ? PRF.lampC : '#8AA0FF', .35 * nt);
  });
  // the street lamp: a column and a head, and its sodium halo
  const lx = x1 - 64;
  prFlat(Cl(prR(lx - 3, 300, lx + 3, y1)), mixCol('#0C0E14', '#3A3E46', mo), 'prf-lpost');
  prFlat(Cl(curvy([[lx - 22, 296], [lx + 8, 290], [lx + 10, 302], [lx - 20, 306]], 2)), mixCol('#0C0E14', '#3A3E46', mo), 'prf-lhead');
  prFlat(Cl(oval(lx - 8, 306, 9, 4, 0, 12)), mixCol('#FFC87A', '#B8B0A0', mo), 'prf-lbulb');
  if (nt > .05) { glow(lx - 8, 312, 150, PRF.lampC, .8 * nt); glow(lx - 8, 312, 40, '#FFE0A0', .9 * nt); }
  // rain: streaks running down the glass, beads, a drip trickling down
  const rain = o.rain ?? 1;
  if (rain > 0) {
    boilSeed('prf rain');
    for (let i = 0; i < Math.round(30 * rain); i++) {
      const rx = x0 + 10 + hash(i + 3) * (x1 - x0 - 20), sp = .5 + hash(i + 9) * .7, ry = y0 + frac(hash(i + 50) + t * sp) * (y1 - y0 + 40) - 40, L = 18 + 20 * hash(i + 7);
      if (ry + L > y1) continue;
      dline([[rx, Math.max(y0 + 2, ry)], [rx - 4, ry + L]], .9, '#8E9AB2', 0);
    }
    for (let i = 0; i < Math.round(22 * rain); i++) { const bx = x0 + 12 + hash(i + 70) * (x1 - x0 - 24), by = y0 + 12 + hash(i + 90) * (y1 - y0 - 24); piece(oval(bx, by, 2.6, 3.4, 0, 8), '#6E7C96', { ink: null, op: 220, key: 'prf-bead' + i, lift: 0, flatCard: true, edge: false }); }
    for (let j = 0; j < 3; j++) {   // trickles: a drop slides down, leaving a wet trail
      const ph = frac(t / 2.6 + j * .37), dx = x0 + 60 + j * 110, dy = lerp(y0 + 20, y1 - 30, easeIn(ph));
      dline([[dx, y0 + 20], [dx + 2, (y0 + 20 + dy) / 2], [dx + 1, dy]], .7, '#5A6680', .5);
      piece(oval(dx + 1, dy + 3, 3.4, 4.6, 0, 10), '#8E9AB2', { ink: null, key: 'prf-drop' + j, lift: 0, flatCard: true, edge: false });
    }
  }
}

function prFlatRoom(t, o) {
  const F = FLAT.floor;
  boilSeed('prf wall');
  piece(prR(-60, -60, W + 60, F + 6), PRF.wall, { ink: null, key: 'prf-wall', lift: 0, edge: false, ...PR_SPARSE });
  prFlat(prR(-60, -60, W + 60, 26), PRF.wallLt, 'prf-coving');
  dline([[-60, 26], [W + 60, 26]], .8, PRF.wallDk);
  // the lamp's warm pool on the wall, the dim corners
  const lampK = o.lamp ?? 1 - clamp(o.morning || 0);
  if (lampK > 0) glow(1490, 560, 620, PRF.lampC, .3 * lampK);
  if ((o.morning || 0) > 0) glow(FLAT.win.x1 + 260, 640, 520, '#FFE8B8', .3 * o.morning);   // morning: daylight through the window
  boilSeed('prf floor');
  piece(prR(-60, F, W + 60, H + 60), PRF.floor, { ink: null, key: 'prf-floor', lift: 0, edge: false, density: .3 });
  for (let i = 0; i < 7; i++) { const y = F + 12 + i * i * 7; dline([[-60, y], [W + 60, y + 1]], .5, PRF.floorLn); }
  piece(prR(-60, F - 18, W + 60, F + 3), PRF.skirt, { sw: 1.1, key: 'prf-skirt', lift: 2, flatCard: true });
  // the rug under the table: a border and a row of diamonds
  boilSeed('prf rug');
  const rug = [[430, 880], [1330, 880], [1420, H + 60], [340, H + 60]];
  piece(rug, PRF.rug, { sw: 1.3, key: 'prf-rug', lift: 1 });
  const inner = prSub(rug, .04, .12, .96, 1.2);
  dline(inner.slice(0, 2), 2.2, PRF.rugLt); dline([inner[0], inner[3]], 2.2, PRF.rugLt); dline([inner[1], inner[2]], 2.2, PRF.rugLt);
  for (let i = 0; i < 8; i++) { const c = prAt(rug, .09 + i * .117, .42); prFlat([[c[0], c[1] - 14], [c[0] + 18, c[1]], [c[0], c[1] + 14], [c[0] - 18, c[1]]], i % 2 ? PRF.rugDk : PRF.rugLt, 'prf-rd' + i); }
}

function prFlatWindow(t, o) {
  const { x0, y0, x1, y1 } = FLAT.win, mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  clipPoly(prR(x0, y0, x1, y1), () => prFlatView(t, o));   // (the view stays in the glass: the street lamp's halo reaches 80 px past it)
  boilSeed('prf sash');
  const bar = (P, k, w = 1.3) => piece(P, PRF.sash, { sw: w, shade: PRF.sashDk, depth: 4, key: k, lift: 3, flatCard: true });
  bar(prR(x0 - 18, y0 - 18, x1 + 18, y0 + 4), 'prf-st'); bar(prR(x0 - 18, y0 - 18, x0 + 4, y1 + 4), 'prf-sl'); bar(prR(x1 - 4, y0 - 18, x1 + 18, y1 + 4), 'prf-sr');
  bar(prR(x0, my - 8, x1, my + 10), 'prf-meet', 1.4);   // the meeting rail
  for (const [a, b] of [[y0, my - 8], [my + 10, y1]]) bar(prR(mx - 4, a, mx + 4, b), 'prf-gb' + a, 1);
  bar(prR(x0, y1 - 14, x1, y1), 'prf-bot');
  prOn(prR(mx - 14, my - 12, mx + 14, my - 4), '#B8A77A', 'prf-catch');
  piece(prR(x0 - 34, y1 + 2, x1 + 34, y1 + 20), PRF.sash, { sw: 1.3, shade: PRF.sashDk, depth: 6, key: 'prf-sill', lift: 4 });
  // a mug and a dead tealight on the sill
  prMug(x1 - 20, y1 + 4, 28, 'prf-sillmug', 0, t, '#C8463A');
  // curtains: a rail, the left one half across, the right one tied back
  boilSeed('prf curtains');
  piece(prR(x0 - 70, y0 - 42, x1 + 70, y0 - 32), PRF.wood, { sw: 1, key: 'prf-rail', lift: 3, flatCard: true });
  const folds = (xa, xb, yb, k, tie) => {
    const P = [[xa, y0 - 36]]; for (let i = 0; i <= 6; i++) P.push([lerp(xa, xb, i / 6) + (i % 2 ? 6 : -6), y0 - 40 + (i % 2) * 4]);
    const bot = tie ? [[xb + 4, y0 + 150], [xb - 6, y0 + 228], [xb + 8, yb], [xa - 14, yb], [xa + 34, y0 + 228], [xa + 10, y0 + 150]] : [[xb + 4, yb - 6], [lerp(xa, xb, .5), yb + 6], [xa - 2, yb]];
    const C = P.concat(bot);
    piece(curvy(C, 3), PRF.curtain, { sw: 1.5, shade: PRF.curtainDk, depth: 14, key: 'prf-cur' + k, lift: 5 });
    for (let i = 1; i < 5; i++) { const fx = lerp(xa, xb, i / 5); dline([[fx, y0 - 30], [fx + (tie ? (i - 2.5) * 3 : 3), tie ? y0 + 210 : yb - 20], [fx + (tie ? 0 : 5), yb - 10]], .9, PRF.curtainDk, .5); }
    if (tie) piece(curvy([[xa + 28, y0 + 218], [xb, y0 + 216], [xb + 2, y0 + 238], [xa + 30, y0 + 240]], 2), PRF.curtainLt, { sw: 1, key: 'prf-tie' + k, lift: 3, flatCard: true });
  };
  folds(x0 - 60, x0 + 70, y1 + 60, 'L', false);
  folds(x1 - 20, x1 + 64, y1 + 66, 'R', true);
  // the radiator under the window: fins, a valve, a pipe; socks drying on top
  boilSeed('prf radiator');
  const rx0 = x0 + 10, rx1 = x1 - 10, ry0 = 650, ry1 = 734;
  for (const px of [rx0 - 20, rx1 + 20]) piece(prR(px - 5, ry1 - 30, px + 5, FLAT.floor), PRF.radDk, { sw: 1, key: 'prf-pipe' + px, lift: 2, flatCard: true });
  piece(prR(rx0, ry0, rx1, ry1), PRF.rad, { sw: 1.4, shade: PRF.radDk, depth: 10, key: 'prf-rad', lift: 4 });
  for (let x = rx0 + 14; x < rx1 - 8; x += 14) dline([[x, ry0 + 8], [x, ry1 - 6]], .8, PRF.radDk);
  prOn(prR(rx0 - 26, ry1 - 26, rx0 - 12, ry1 - 4), PRF.radDk, 'prf-valve'); prOn(prR(rx0 - 30, ry1 - 34, rx0 - 8, ry1 - 26), '#E8E2D4', 'prf-valvecap');
  for (const [sx, col, k] of [[rx0 + 50, PRF.sockA, 'a'], [rx0 + 120, PRF.sockB, 'b']]) {
    piece(curvy([[sx, ry0 - 6], [sx + 44, ry0 - 6], [sx + 46, ry0 + 50], [sx + 70, ry0 + 64], [sx + 66, ry0 + 78], [sx + 30, ry0 + 70], [sx + 28, ry0 + 8], [sx + 2, ry0 + 20]], 3), col, { sw: 1.1, key: 'prf-sock' + k, lift: 3, flatCard: true });
    prFlat(prR(sx + 4, ry0 + 14, sx + 40, ry0 + 22), mixCol(col, '#FFFFFF', .35), 'prf-sockst' + k);
    prFlat(curvy([[sx + 52, ry0 + 56], [sx + 70, ry0 + 64], [sx + 66, ry0 + 78], [sx + 50, ry0 + 72]], 3), '#C8463A', 'prf-socktoe' + k);
    prFlat(curvy([[sx + 28, ry0 + 58], [sx + 44, ry0 + 50], [sx + 46, ry0 + 64], [sx + 32, ry0 + 70]], 3), '#C8463A', 'prf-sockheel' + k);
  }
}

// the pile of unopened post: window envelopes, a brown one, one with a red band (the kind you don't open)
// n: how many (the pile grows through her verse); the red ones carry the film's red clock due stamp (the bills motif)
function prPost(x, y, key = 'prf-post', n = Infinity) {
  boilSeed(key);
  const E = [[-70, 0, -.06, PRF.env, 'w'], [-40, -8, .12, PRF.manila, 'm'], [-84, -14, -.18, PRF.env, 'r'], [-50, -22, .05, PRF.env, 'w2'], [-20, -26, -.1, PRF.manila, 'm2'], [-66, -32, .16, PRF.env, 'r2'], [-38, -40, -.04, PRF.env, 'w3'], [-74, -48, .1, PRF.env, 'r3'], [-44, -55, -.14, PRF.manila, 'm3'], [-60, -62, .07, PRF.env, 'r4'], [-30, -68, -.08, PRF.env, 'r5']];
  E.forEach(([dx, dy, rot, col, k], i) => {
    if (i >= n) return;
    push(); translate(x + dx, y + dy); rotate(rot);
    piece(prR(-38, -20, 38, 20), col, { sw: 1, key: key + i, lift: 2, flatCard: true });
    if (k[0] === 'w') { prFlat(prR(-28, -2, 6, 12), '#DCE4EA', key + 'win' + i); prScrib(-24, 3, 24, .6, '#8A8272', .6, i); prScrib(-24, 8, 18, .6, '#8A8272', .6, i + 2); }
    if (k[0] === 'r') { prFlat(prR(-38, -20, 38, -12), PRF.red, key + 'red' + i); const c = [-8, 4]; for (let j = 0; j < 10; j++) { if (j === 3) continue; const a0 = j / 10 * TAU, a1 = (j + .8) / 10 * TAU; dline([[c[0] + Math.cos(a0) * 9, c[1] + Math.sin(a0) * 9], [c[0] + Math.cos(a1) * 9, c[1] + Math.sin(a1) * 9]], 1.1, PRF.red, 0); } dline([c, [c[0] - 4, c[1] + 3]], 1, PRF.red, 0); dline([c, [c[0] + 1, c[1] - 6]], .9, PRF.red, 0); }   // (the red clock: due)
    if (k[0] === 'm') dline([[-38, -20], [0, 2], [38, -20]], .6, mixCol(col, '#000000', .25));
    prFlat(prR(22, -16, 32, -6), k[0] === 'm' ? '#8A6A40' : '#C9B090', key + 'stamp' + i);
    pop();
  });
}

// the sofa, against the back wall: a throw over its left arm, a cushion at the right, sagging seat cushions
function prSofa(t, o) {
  const x0 = 720, x1 = 1400, seat = 771;
  prShadow((x0 + x1) / 2, 874, (x1 - x0) * .55, 14, 100);
  boilSeed('prf sofa');
  for (const fx of [x0 + 20, x1 - 36]) piece(prR(fx, 850, fx + 16, 874), PRF.wood, { sw: 1, key: 'prf-sfoot' + fx, lift: 2, flatCard: true });
  piece(curvy([[x0 + 40, 560], [(x0 + x1) / 2, 552], [x1 - 40, 560], [x1 - 30, 780], [x0 + 30, 780]], 3), PRF.sofa, { sw: 1.6, shade: PRF.sofaDk, depth: 22, key: 'prf-sback', lift: 4 });
  for (const [a, b, k] of [[x0 + 80, (x0 + x1) / 2 - 4, 'L'], [(x0 + x1) / 2 + 4, x1 - 80, 'R']]) piece(curvy([[a, 590], [(a + b) / 2, 582], [b, 590], [b + 4, 700], [(a + b) / 2, 712], [a - 4, 700]], 3), PRF.sofaLt, { sw: 1.3, shade: PRF.sofaDk, depth: 14, key: 'prf-sbc' + k, lift: 3 });
  piece(prR(x0 + 20, seat + 40, x1 - 20, 856), PRF.sofaDk, { sw: 1.4, key: 'prf-sbase', lift: 3 });
  for (const [a, b, k, sag] of [[x0 + 70, (x0 + x1) / 2, 'L', 8], [(x0 + x1) / 2, x1 - 70, 'R', 3]]) piece(curvy([[a, seat - 4], [(a + b) / 2, seat + sag], [b, seat - 4], [b + 2, seat + 42], [a - 2, seat + 42]], 3), PRF.sofa, { sw: 1.3, shade: PRF.sofaDk, depth: 10, key: 'prf-sseat' + k, lift: 3 });
  for (const [a, b, k] of [[x0, x0 + 88, 'L'], [x1 - 88, x1, 'R']]) piece(curvy([[a + 4, 668], [(a + b) / 2, 656], [b - 4, 668], [b, 850], [a, 850]], 3), PRF.sofa, { sw: 1.5, shade: PRF.sofaDk, depth: 16, key: 'prf-sarm' + k, lift: 5 });
  // the throw, draped over the left arm; the cushion, at the right
  piece(curvy([[x0 - 6, 660], [x0 + 70, 650], [x0 + 110, 664], [x0 + 104, 760], [x0 + 86, 820], [x0 + 60, 812], [x0 + 20, 830], [x0 - 10, 800]], 3), PRF.throw, { sw: 1.3, shade: PRF.throwDk, depth: 12, key: 'prf-throw', lift: 4 });
  for (let i = 0; i < 5; i++) dline([[x0 + 4 + i * 18, 668], [x0 + 2 + i * 18, 800]], .7, PRF.throwDk, .4);
  piece(curvy([[x1 - 190, 690], [x1 - 110, 676], [x1 - 96, 766], [x1 - 176, 776]], 3), PRF.cushion, { sw: 1.3, shade: PRF.cushionDk, depth: 10, key: 'prf-cush', lift: 5 });
  piece(oval(x1 - 143, 726, 5, 5, 0, 10), PRF.cushionDk, { ink: null, key: 'prf-cushb', lift: 0, flatCard: true });
}

// the right-hand corner: a side table with the lamp, the leggy houseplant; above the sofa, the fairy lights and a print
function prFlatCorner(t, o) {
  boilSeed('prf print');
  push(); translate(1060, 318); rotate(-.035);
  piece(prR(-96, -70, 96, 70), PRF.print, { sw: 1.3, key: 'prf-print', lift: 4, flatCard: true });
  prFlat(prR(-84, -58, 84, 58), '#E8DCC0', 'prf-mount');
  prFlat(prR(-70, -46, 70, 6), '#9AB4C0', 'prf-psky'); prFlat(prR(-70, 6, 70, 46), '#4E7084', 'prf-psea');
  prFlat(oval(22, 4, 18, 18, 0, 20).filter(p => p[1] <= 6), '#E8B060', 'prf-psun');
  dline([[-70, 6], [70, 6]], .7, '#3E5A6A');
  pop();
  // fairy lights: a wire looping between pins, warm bulbs (twinkling gently)
  const fairy = o.fairy ?? 1 - clamp(o.morning || 0);
  boilSeed('prf fairy');
  const pins = [[680, 430], [930, 446], [1180, 428], [1430, 444]], wire = [];
  for (let s = 0; s < pins.length - 1; s++) { const a = pins[s], b = pins[s + 1]; for (let i = 0; i < 12; i++) { const k = i / 12; wire.push([lerp(a[0], b[0], k), lerp(a[1], b[1], k) + Math.sin(k * Math.PI) * 44]); } }
  wire.push(pins[pins.length - 1]);
  dline(wire, 1, PRF.wire, .5);
  for (const [px, py] of pins) prOn(oval(px, py, 3, 3, 0, 8), '#C9B090', 'prf-pin' + px, { lift: 1 });
  wire.forEach(([bx, by], i) => {
    if (i % 2) return;
    const tw = .65 + .35 * Math.sin(t * 2.1 + i * 1.7) * Math.sin(t * .7 + i);
    piece(oval(bx, by + 5, 3.4, 5, 0, 10), fairy > 0 ? mixCol('#8A7A5A', PRF.fairy, tw * fairy) : '#8A7A5A', { ink: null, key: 'prf-bulb' + i, lift: 1, flatCard: true });
    if (fairy > 0) glow(bx, by + 5, 26, PRF.fairy, .55 * tw * fairy);
  });
  // side table and lamp
  boilSeed('prf lamp');
  const lx = 1492, lamp = o.lamp ?? 1 - clamp(o.morning || 0);
  prShadow(lx, 866, 70, 10, 90);
  for (const dx of [-50, 42]) piece(prR(lx + dx, 690, lx + dx + 8, 866), PRF.wood, { sw: 1, key: 'prf-stl' + dx, lift: 3, flatCard: true });
  piece(prR(lx - 62, 680, lx + 62, 694), mixCol(PRF.wood, '#FFFFFF', .12), { sw: 1.2, key: 'prf-stop', lift: 4, flatCard: true });
  piece(prR(lx - 56, 780, lx + 56, 788), PRF.wood, { sw: 1, key: 'prf-sshelf', lift: 3, flatCard: true });
  for (let i = 0; i < 3; i++) piece(prR(lx - 44 + i * 4, 764 - i * 10, lx + 36 - i * 6, 776 - i * 10), ['#6E4A5A', '#4E6A7A', '#9A8A5A'][i], { sw: .9, key: 'prf-book' + i, lift: 2, flatCard: true });
  piece(curvy([[lx - 16, 680], [lx - 24, 650], [lx - 12, 620], [lx + 12, 620], [lx + 24, 650], [lx + 16, 680]], 3), PRF.lampBase, { sw: 1.2, shade: mixCol(PRF.lampBase, '#000000', .3), depth: 8, key: 'prf-lbase', lift: 4 });
  dline([[lx, 620], [lx, 600]], 1.2, '#3A3530');
  piece([[lx - 44, 540], [lx + 44, 540], [lx + 58, 604], [lx - 58, 604]], lamp > 0 ? PRF.shadeLit : PRF.shade, { sw: 1.3, key: 'prf-shade', lift: 5 });
  if (lamp > 0) { glow(lx, 590, 180, PRF.lampC, .6 * lamp); glow(lx, 612, 70, '#FFF0C8', .8 * lamp); }
  // the houseplant in the corner: a rubber plant gone leggy, big leaves on long stems, one yellowing, one fallen
  boilSeed('prf plant');
  const px = 1700, py = 868;
  prShadow(px, py, 80, 12, 100);
  const stems = [[-60, 470, -.5], [-20, 400, -.15], [30, 380, .15], [70, 450, .45], [-90, 580, -.8], [100, 560, .8], [0, 520, 0], [-40, 640, -.35], [55, 640, .35]];
  stems.forEach(([dx, top], i) => { const base = [px + dx * .15, py - 124], tip = [px + dx, top]; dline([base, [lerp(base[0], tip[0], .4), lerp(base[1], tip[1], .5)], tip], 2.6, PRF.leafDk, .5); });
  stems.forEach(([dx, top, lean], i) => {
    const tip = [px + dx, top], sick = i === 5, droop = i === 4 || i === 5, col = sick ? PRF.leafSick : [PRF.leaf, PRF.leafLt, PRF.leafDk][i % 3];
    const a = droop ? (lean > 0 ? .5 : Math.PI - .5) : -Math.PI / 2 + lean * 1.1, L = 96 - (i % 3) * 10, w = L * .36;
    const ca = Math.cos(a), sa = Math.sin(a), at = (f, side) => [tip[0] + ca * L * f - sa * w * side, tip[1] + sa * L * f + ca * w * side];
    const P = [tip, at(.25, .8), at(.6, 1), at(.88, .5), [tip[0] + ca * L, tip[1] + sa * L], at(.88, -.5), at(.6, -1), at(.25, -.8)];
    piece(curvy(P, 4), col, { sw: 1.2, shade: sick ? '#9A8A40' : mixCol(col, '#000000', .3), depth: 10, key: 'prf-leaf' + i, lift: 3 });
    dline([tip, at(.9, 0)], .8, mixCol(col, '#FFFFFF', .25), .3);
  });
  piece([[px - 62, py - 132], [px + 62, py - 132], [px + 48, py], [px - 48, py]], PRF.pot, { sw: 1.4, shade: PRF.potDk, depth: 14, key: 'prf-pot', lift: 5 });
  piece(prR(px - 66, py - 140, px + 66, py - 120), PRF.pot, { sw: 1.1, key: 'prf-potrim', lift: 3, flatCard: true });
  prFlat(prR(px - 60, py - 146, px + 60, py - 138), '#3A2A20', 'prf-soil');
  piece(curvy([[px + 96, py + 30], [px + 140, py + 16], [px + 168, py + 26], [px + 132, py + 40]], 3), PRF.leafSick, { sw: 1, key: 'prf-fallen', lift: 1, flatCard: true });
  // a paper lantern hanging from the ceiling (off: the lamp does the work)
  boilSeed('prf lantern');
  dline([[1060, -20], [1060, 70]], 1, '#3A3530', 0);
  piece(oval(1060, 118, 52, 48, 0, 28), '#E6DDCB', { sw: 1.3, shade: '#C4B89E', depth: 14, key: 'prf-lantern', lift: 5 });
  for (const f of [-.6, -.2, .2, .6]) dline([[1060 + f * 52 * .7, 76], [1060 + f * 52, 118], [1060 + f * 52 * .7, 162]], 1.1, '#A89C84', .6);
  piece(prR(1048, 62, 1072, 74), '#8A8478', { sw: .9, key: 'prf-lcap', lift: 2, flatCard: true });
}

function flatBack(t, lt, o = {}) {
  prFlatRoom(t, o);
  prFlatWindow(t, o);
  prPost(262, 812, 'prf-post', o.post ?? Infinity);
  prFlatCorner(t, o);
  prSofa(t, o);
}

// ---------- the coffee table (front) ----------
function prLaptop(t, lt, o) {
  if (o.lidAway) { prLaptopAway(o); return; }
  const S = FLAT.screen, e = (P, d) => [[P[0][0] - d, P[0][1] - d], [P[1][0] + d, P[1][1] - d], [P[2][0] + d, P[2][1] + d * .6], [P[3][0] - d, P[3][1] + d * .6]];
  const lid = e(S, 10), hinge = [lid[3], lid[2]];
  boilSeed('prf laptop');
  // the deck on the table (toward her), keys, trackpad
  const deck = [hinge[0], hinge[1], [hinge[1][0] + 40, hinge[1][1] + 30], [hinge[0][0] + 40, hinge[0][1] + 34]];
  piece(deck, PRF.lap, { sw: 1.3, key: 'prf-deck', lift: 3, flatCard: true });
  prFlat(prSub(deck, .08, .12, .92, .55), PRF.keys, 'prf-keys');
  for (let r = 0; r < 3; r++) dline([prAt(deck, .1, .2 + r * .12), prAt(deck, .9, .2 + r * .12)], .5, PRF.lapDk);
  prFlat(prSub(deck, .36, .64, .64, .92), PRF.lapDk, 'prf-pad');
  // the lid: bezel, screen, and whatever is on it
  piece(lid, PRF.bezel, { sw: 1.4, key: 'prf-lid', lift: 4 });
  piece([lid[1], [lid[1][0] + 6, lid[1][1] + 4], [lid[2][0] + 6, lid[2][1] - 2], lid[2]], PRF.lapDk, { sw: .9, key: 'prf-lidside', lift: 3, flatCard: true });
  prFlat(S, o.screenCol || PRF.lapScr, 'prf-scr');
  if (o.screen) { const ctx = prSurface(S, t, lt, 'laptop'); o.screen(ctx); }
  else {   // a jobs board: a header, a column of listings (a logo block and squiggles), a big button (a tick)
    const at = (u, v) => prAt(S, u, v), q = (a, b, c, d) => prSub(S, a, b, c, d);
    prFlat(q(0, 0, 1, .12), '#3E5F86', 'prf-shead');
    prFlat(q(.04, .03, .18, .09), '#DCE6F0', 'prf-slogo');
    for (let i = 0; i < 3; i++) {
      const v = .18 + i * .26;
      prFlat(q(.05, v, .95, v + .2), '#F4F7FA', 'prf-card' + i);
      prFlat(q(.08, v + .03, .2, v + .17), ['#C8A04A', '#6A9A7A', '#9A6A8A'][i], 'prf-clogo' + i);
      dline([at(.26, v + .06), at(.6, v + .065), at(.78, v + .06)], .8, '#6A7886', .5); dline([at(.26, v + .13), at(.5, v + .135)], .7, '#9AA6B2', .5);
      prFlat(q(.8, v + .05, .92, v + .15), i === 0 ? '#5AAE72' : '#C9D2DA', 'prf-cbtn' + i);
    }
    const c = at(.62, .5); prFlat([[c[0], c[1]], [c[0], c[1] + 13], [c[0] + 4, c[1] + 9], [c[0] + 7, c[1] + 15], [c[0] + 9, c[1] + 14], [c[0] + 6, c[1] + 8], [c[0] + 10, c[1] + 8]], '#1E2024', 'prf-cur');
  }
  for (const [a, b, k] of [[0, 1, 't'], [1, 2, 'r'], [2, 3, 'b'], [3, 0, 'l']]) prFlat([lid[a], lid[b], prL(S[b], lid[b], -.3), prL(S[a], lid[a], -.3)], PRF.bezel, 'prf-bz' + k);
  prFlat(oval(...prL(lid[0], lid[1], .5), 1.6, 1.6, 0, 8).map(([x, y]) => [x, y + 5]), '#4A4E56', 'prf-cam');
  const g = o.screenGlow ?? 1;
  if (g > 0) { const c = prAt(S, .5, .5); glow(c[0], c[1], 150, '#BCD4FF', .35 * g); glow(c[0] + 160, c[1] - 40, 120, '#BCD4FF', .12 * g); }
}
// The laptop turned to face her on the sofa (a screen faces its user: V1's wide shots of her at it). Its deck runs back
// from the hinge toward her, the keys up; the lid's plain back is to us, leaning back a little, with a pale disc for a
// badge; its near edge shows the bezel's dark line; the screen's light spills from that edge onto her side.
function prLaptopAway(o) {
  const { lid, deck } = FLAT.lidAway, [, tr, br] = lid;
  boilSeed('prf laptop away');
  piece(deck, PRF.lap, { sw: 1.3, key: 'prf-adeck', lift: 3, flatCard: true });
  prFlat(prSub(deck, .08, .3, .9, .78), PRF.keys, 'prf-akeys');
  for (let r = 0; r < 3; r++) dline([prAt(deck, .1, .4 + r * .12), prAt(deck, .88, .4 + r * .12)], .5, PRF.lapDk);
  // the lid's near edge (its thickness: aluminium, the bezel's dark line along it), then its back
  const ed = [tr, [tr[0] + 7, tr[1] + 3], [br[0] + 7, br[1] + 1], br];
  piece(ed, PRF.lapDk, { sw: 1, key: 'prf-aedge', lift: 3, flatCard: true });
  dline([prL(ed[0], ed[1], .6), prL(ed[3], ed[2], .6)], 1.4, PRF.bezel, 0);
  piece(lid, PRF.lap, { sw: 1.4, shade: PRF.lapDk, depth: 5, key: 'prf-alid', lift: 4 });
  prFlat(prSub(lid, 0, .9, 1, 1), mixCol(PRF.lap, PRF.lapDk, .5), 'prf-ahinge');
  const c = prAt(lid, .5, .45);
  prFlat(oval(c[0], c[1], 9, 10, .12, 16), mixCol(PRF.lap, '#FFFFFF', .35), 'prf-abadge');
  const g = o.screenGlow ?? 1;
  if (g > 0) { const f = FLAT.lidAway.face; glow(f[0] + 20, f[1] - 10, 130, '#BCD4FF', .32 * g); glow(f[0] + 150, f[1] - 90, 150, '#BCD4FF', .12 * g); }
}
// her notebook, open: two ruled pages with a margin, a spiral down the middle, biro doodles on the left page (the
// doodles live here); o.page(ctx) draws on the right page
function prNotebook(t, lt, o) {
  const N = FLAT.notebook, L = N.left, R = N.right;
  boilSeed('prf notebook');
  piece([prL(L[0], L[3], -.06), prL(R[1], R[2], -.06), prL(R[2], R[1], -.08), prL(L[3], L[0], -.08)].map(([x, y]) => [x, y + 2]), '#3A4A6A', { sw: 1.1, key: 'prf-nbcover', lift: 2, flatCard: true });
  for (const [P, k] of [[L, 'l'], [R, 'r']]) {
    piece(P, PRF.paper, { sw: 1, key: 'prf-nb' + k, lift: 1.5, flatCard: true });
    for (let i = 1; i < 6; i++) dline([prAt(P, .04, i / 6), prAt(P, .96, i / 6)], .45, PRF.rule);
  }
  dline([prAt(L, .12, 0), prAt(L, .12, 1)], .5, PRF.margin); dline([prAt(R, .12, 0), prAt(R, .12, 1)], .5, PRF.margin);
  for (let i = 0; i < 7; i++) { const c = prAt(R, 0, (i + .5) / 7); prOn(oval(c[0], c[1], 3.2, 2.2, 0, 8), PRF.spiral, 'prf-coil' + i, { lift: 1, sw: .6 }); }
  if (o.doodles !== false) {   // tiny biro doodles: a sun with a face, a hammock between two trees, stars, a spiral
    const at = (u, v) => prAt(L, u, v), b = PRF.biro;
    const sc = at(.3, .35); dline(oval(sc[0], sc[1], 7, 5, 0, 12).concat([oval(sc[0], sc[1], 7, 5, 0, 12)[0]]), 1, b, .5);
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; dline([[sc[0] + Math.cos(a) * 9, sc[1] + Math.sin(a) * 7], [sc[0] + Math.cos(a) * 13, sc[1] + Math.sin(a) * 9]], .6, b, 0); }
    dline([[sc[0] - 3, sc[1] + 1], [sc[0], sc[1] + 2.5], [sc[0] + 3, sc[1] + 1]], .5, b, .5);
    const t1 = at(.5, .85), t2 = at(.85, .85);
    for (const tp of [t1, t2]) { dline([tp, [tp[0], tp[1] - 16]], 1, b, 0); dline(oval(tp[0], tp[1] - 19, 6, 5, 0, 10).concat([oval(tp[0], tp[1] - 19, 6, 5, 0, 10)[0]]), .9, b, .5); }
    dline([[t1[0], t1[1] - 10], [(t1[0] + t2[0]) / 2, t1[1] - 3], [t2[0], t2[1] - 10]], 1, b, .6);
    for (const [u, v] of [[.72, .25], [.9, .45]]) { const p = at(u, v); dline([[p[0] - 3, p[1]], [p[0] + 3, p[1]]], .5, b, 0); dline([[p[0], p[1] - 3], [p[0], p[1] + 3]], .5, b, 0); }
  }
  if (o.page) { const ctx = prSurface(R, t, lt, 'page'); o.page(ctx); }
}

function flatFront(t, lt, o = {}) {
  const T0 = FLAT.tableTop, { x0, x1, far, front } = T0;
  prShadow((x0 + x1) / 2, 1012, (x1 - x0) * .52, 12, 70);
  boilSeed('prf table');
  for (const lx of [x0 + 30, x1 - 52]) piece(prR(lx, far + 60, lx + 20, 972), mixCol(PRF.tableDk, '#000000', .25), { sw: 1, key: 'prf-bleg' + lx, lift: 2, flatCard: true });
  for (const lx of [x0 + 8, x1 - 34]) piece(prR(lx, front, lx + 26, 1012), PRF.tableDk, { sw: 1.3, shade: mixCol(PRF.tableDk, '#000000', .3), depth: 6, key: 'prf-leg' + lx, lift: 5, flatCard: true });
  piece(prR(x0, front, x1, front + 26), PRF.tableDk, { sw: 1.3, key: 'prf-apron', lift: 4, flatCard: true });
  piece([[x0 + 20, far], [x1 - 20, far], [x1, front], [x0, front]], PRF.table, { sw: 1.5, key: 'prf-top', lift: 5 });
  for (let i = 0; i < 4; i++) dline([[x0 + 60 + i * 140, far + 12 + i * 14], [x0 + 200 + i * 140, far + 14 + i * 14]], .6, PRF.tableDk, .4);
  // a ring stain, the phone face down, the tea, the pot noodle with its fork, biros
  boilSeed('prf tabletop');
  dline(oval(1118, 900, 18, 5, 0, 16).concat([oval(1118, 900, 18, 5, 0, 16)[0]]), .8, PRF.tableDk, .4);
  piece([[960, 892], [1012, 888], [1016, 904], [962, 908]], '#2A2632', { sw: 1, key: 'prf-phone', lift: 2, flatCard: true });
  // o.bills: unopened envelopes with the red band and the red clock stamp (bills she can't pay), stacked at the table's
  // back; V1 passes a count that grows through her verse (then C1f's box room: she's had to downsize). o.billsAt: [x, y,
  // scale] of the pile's foot (default: the back corner, behind the pot noodle). Drawn before the tea, which stands in front
  const [bx0, by0, bs] = o.billsAt || [1150, 846, 1];
  for (let i = 0; i < (o.bills || 0); i++) {
    boilSeed('prf bill' + i); push(); translate(bx0 + (o.billsAt ? 13 : 5) * bs * Math.sin(i * 2.3), by0 - i * 9 * bs); rotate(-.1 + (o.billsAt ? .24 : .14) * Math.sin(i * 1.7)); scale(bs);   // (o.billsAt: a messier pile, each bill's red band peeking out)
    piece(prR(-36, -16, 36, 16), PRF.env, { sw: 1, key: 'prf-bill' + i, lift: 2, flatCard: true });
    prFlat(prR(-36, -16, 36, -9), PRF.red, 'prf-billr' + i);
    for (let j = 0; j < 8; j++) { if (j === 2) continue; const a0 = j / 8 * TAU, a1 = (j + .8) / 8 * TAU; dline([[14 + Math.cos(a0) * 8, 3 + Math.sin(a0) * 8], [14 + Math.cos(a1) * 8, 3 + Math.sin(a1) * 8]], 1, PRF.red, 0); }
    dline([[14, 3], [10, 6]], .9, PRF.red, 0); dline([[14, 3], [15, -3]], .8, PRF.red, 0);
    pop();
  }
  prMug(1060, 884, 36, 'prf-tea', 1, t, '#C9A04A');
  boilSeed('prf noodle');
  piece(curvy([[1110, 832], [1160, 832], [1152, 880], [1118, 880]], 2), '#E8E0CC', { sw: 1.2, shade: '#C4B89E', depth: 8, key: 'prf-pot', lift: 3 });
  prFlat(prR(1112, 846, 1158, 858), '#C8463A', 'prf-potband');
  piece([[1116, 832], [1150, 828], [1170, 806], [1134, 812]], '#D8D2C4', { sw: 1, key: 'prf-potlid', lift: 3, flatCard: true });
  dline([[1128, 836], [1142, 790]], 2, '#A8ABB0', 0); for (const d of [-3, 0, 3]) dline([[1142 + d, 790], [1144 + d, 780]], .8, '#A8ABB0', 0);
  prLaptop(t, lt, o);
  prNotebook(t, lt, o);
  boilSeed('prf biros');
  for (const [a, b, cap, k] of [[[944, 874], [996, 866], '#26358C', 'a'], [[930, 904], [1000, 900], '#1E1E22', 'b']]) {
    piece(ribbon([a, b], 4.6, 4), '#F2EEE6', { sw: .8, key: 'prf-biro' + k, lift: 2, flatCard: true });
    piece(ribbon([prL(a, b, .82), b], 5, 4.4), cap, { ink: null, key: 'prf-cap' + k, lift: 1, flatCard: true });
  }
  if (o.onTable) o.onTable(t, lt);
}

// ---------- the flat review loop ----------
// 0–6 s: rain on the glass, the fairy lights, the TV opposite; the laptop screen filled by a callback half the time (a
// test card of symbols) and the notebook page drawn on from 3 s; from 4.6 s it turns to morning (F1). Her on the sofa
// at the laptop; him at the window.
LOOPS.flat = t0 => {
  prLookBegin();
  const t = mt(t0), fill = t > 1.5 && t < 4.5, mo = seg(t, 4.6, 5.6);
  const o = { morning: mo, rain: 1 - mo,
    screen: fill ? ctx => { ctx.begin(); piece(prR(0, 0, W, H), '#2E3A6A', { ink: null, key: 'tcbg', lift: 0, flatCard: true, edge: false }); for (let i = 0; i < 6; i++) piece(prR(i * 320, 700, i * 320 + 320, H), ['#E8C25A', '#6AC27A', '#5AB4E8', '#E86A9A', '#E86A5A', '#F4F2E8'][i], { ink: null, key: 'tcb' + i, lift: 0, flatCard: true, edge: false }); piece(oval(960, 360, 240, 240, 0, 32), '#F4F2E8', { ink: null, key: 'tcc', lift: 0, flatCard: true, edge: false }); ctx.end(); } : null,
    page: t > 3 ? ctx => { ctx.begin(); dline([[300, 700], [960, 300 + 200 * Math.sin(t)], [1600, 700]], 30, PRF.biro, .6); ctx.end(); } : null,
  };
  flatBack(t, t, o);
  const [sx, sy, su, sh] = FLAT.sofa;
  person(sx, sy, su, HER_C, { ...feel('bored', t), seated: true, seatH: sh, view: 'q', flip: true, pose: 'lap', lookX: .6, lookY: .5, boilKey: 'prfHer' });
  const [wx, wy, wu] = FLAT.window;
  person(wx, wy, wu, HIM_C, { ...feel('neutral', t), view: 'q', flip: true, boilKey: 'prfHim' });
  flatFront(t, t, o);
  prLookEnd(t);
};
LOOPS.flat.len = 6;

// =====================================================================================================================
// BOXROOM: his tiny rented box room (C1e, C2e, V3f, D1), built as a literal box on a dark stage (a dollhouse cut open at
// the front): the back wall with a narrow window (the view: the next building's brick wall, a drainpipe), side walls in
// perspective ending in cut card edges, a low ceiling with a bare bulb, thin carpet. A single bed fills it wall to wall
// (head at the left, a cheap pine headboard); damp and mould creep from the top-left corner, the wallpaper peeling
// there; a clothes rail against the right wall; the phone on the bed on a charger cable that runs all the way from a
// socket on the right wall. Under the bed: dust, a lost sock, a coin.
//   boxroomBack(t, lt, o)   everything, the bed included (whoever sits on it is drawn after).
//   boxroomFront(t, lt, o)  the bare bulb and its light, over the cast; then o.fore(t, lt).
// o: squeeze 0..1 (the side walls slide in: the room and all it holds compress toward x = 960; the dark stage shows
//    beyond the walls' cut edges) · bedUp 0..1 (the bed tips up onto its foot end against the right wall; what was
//    under it shows) · bulb 0..1 (default 1; 0 = off) · swing (px, the bulb's sway; default a slow idle) · dim 0..1 (D1:
//    "one light, no set": the room sinks into the dark, leaving the bed, the bulb and whoever sits there) · her (HER box
//    room, C1f/C2f: the same room with her bedding, her rail at the front left, an airer, mirror, books and her office
//    box at the right; see prHerClutter).
// boxroomAnchors(o) gives the anchors for the current squeeze (BOXROOM holds them at squeeze 0); boxroomX(x, o) maps an
// x into the squeezed room. To squash a cast member with the room: push(); translate(960, 0); scale(boxroomScale(o), 1);
// translate(-960, 0); ...draw...; pop().
const PRB = {
  void: '#141216', wall: '#C4B593', wallDk: '#A99B7B', wallSide: '#B5A686', wallEdge: '#8E8166', stripe: '#BBAC8A', ceil: '#CFC6B1', ceilDk: '#B5AC98',
  carpet: '#6E6052', carpetDk: '#5A4E42', skirt: '#D8CFBE',
  damp: '#7E7A5C', dampDk: '#5A5A44', mould: '#2E3228', peel: '#DCCFB0', peelBack: '#E8E0CC',
  brick: '#7A4A3A', brickDk: '#5E382C', mortar: '#8E8274', pipe: '#2E2E30', sash: '#D8D2C4', sashDk: '#B0A898',
  divan: '#4A5260', divanDk: '#363C48', mattress: '#D8D2C4', tick: '#A8B4C4', duvet: '#8494A6', duvetDk: '#687A8E', duvetLt: '#A2B0C0', pillow: '#E4DDCF', pillowDk: '#C4BCAC', head: '#B08A5C', headDk: '#8A6A44',
  rail: '#B0B4B8', railDk: '#80848A', hoodie: '#6C7278', shirt: '#5E7A94', olive: '#6E744E', jacket: '#3A3A40',
  bulb: '#FFF2C8', flex: '#2A2628', cable: '#ECE8E0', phone: '#2A2632', sock: '#8E8A84', dust: '#9A9388',
};
// The box in one-point perspective: vanishing point (vx, vy); the back wall (depth k = 1) x0..x1, top..floor; the room's
// open front at depth K. prbY(h, k): the screen y of a point h px (back-wall px) above the floor at depth k; prbX(x, k):
// the screen x of a back-wall x at depth k.
const PR_BOX = { vx: 960, vy: 470, x0: 540, x1: 1380, top: 170, floor: 770, K: 1.7 };
const prbY = (h, k) => PR_BOX.vy + (PR_BOX.floor - PR_BOX.vy - h) * k;
const prbX = (x, k) => PR_BOX.vx + (x - PR_BOX.vx) * k;
const BOXROOM = {
  u: 50,
  bed: [760, 890, 50, 3.3],          // him on the edge of the bed: [x, ground y, u, seatH] (front view); for anyone else
  bedTop: 725,                       //   seatH = (ground y - bedTop) / u (her longer legs: about 4.2 at a bigger u)
  window: [930, 905, 52],            // standing at the window (in front of the bed, or where it was): 3/4 (facing right, at it)
  win: { x0: 1030, x1: 1120, y0: 236, y1: 530 },   // (hers: o.her)
  // his: the window the turbine stretch sees from the street (copies.js CP.win: 10.5 u wide, 9.3 u tall at his u, the
  // sill 5.9 u off the floor), the same size here once the back wall's depth is allowed for (the cast stand at about
  // 1.4 × its depth: 50 / 1.4 = 35.7 px a unit on the wall)
  winHis: { x0: 972, x1: 1347, y0: 226, y1: 559 },
  // the bed: its front face (x0..x1, from top to front), its top's back edge against the wall (back, bx0..bx1), and the
  // corner it tips up on (upShift: how far that corner slides as it goes up)
  bedAt: { x0: 448, x1: 1168, top: 720, front: 836, back: 675, bx0: 540, bx1: 1130, pivot: [1168, 836], upShift: 0 },
};
const boxroomScale = o => 1 - .5 * ease(clamp(o.squeeze || 0));
const boxroomX = (x, o) => PR_BOX.vx + (x - PR_BOX.vx) * boxroomScale(o);
function boxroomAnchors(o = {}) {
  const f = boxroomScale(o), m = a => [PR_BOX.vx + (a[0] - PR_BOX.vx) * f, ...a.slice(1)];
  return { bed: m(BOXROOM.bed), window: m(BOXROOM.window), scale: f };
}
const prbP = (x, h, k) => [prbX(x, k), prbY(h, k)];

function prBoxShell(t, o) {
  const { x0, x1, top, floor, K } = PR_BOX, H0 = floor - top;
  boilSeed('prb shell');
  // ceiling, floor, side walls (a shade darker, their paper's stripes running back), then the back wall
  piece([prbP(x0, H0, 1), prbP(x0, H0, K), prbP(x1, H0, K), prbP(x1, H0, 1)], PRB.ceil, { ink: null, key: 'prb-ceil', lift: 0, edge: false, ...PR_SPARSE });
  piece([prbP(x0, 0, 1), prbP(x1, 0, 1), prbP(x1, 0, K), prbP(x0, 0, K)], PRB.carpet, { ink: null, key: 'prb-floor', lift: 0, edge: false, density: .3 });
  for (let i = 1; i < 6; i++) { const k = 1 + i * .12; dline([prbP(x0, 0, k), prbP(x1, 0, k)], .6, PRB.carpetDk); }
  for (const [xa, key] of [[x0, 'prb-wl'], [x1, 'prb-wr']]) {
    piece([prbP(xa, 0, 1), prbP(xa, H0, 1), prbP(xa, H0, K), prbP(xa, 0, K)], PRB.wallSide, { ink: null, key, lift: 0, edge: false, ...PR_SPARSE });
    if (!prDD()) for (let i = 1; i < 9; i++) { const k = 1 + i * .075; prFlat([prbP(xa, 2, k), prbP(xa, H0 - 2, k), prbP(xa, H0 - 2, k + .022), prbP(xa, 2, k + .022)], mixCol(PRB.wallSide, PRB.stripe, .9), key + 's' + i); }
  }
  piece(prR(x0, top, x1, floor), PRB.wall, { sw: 1.3, key: 'prb-back', lift: 2, edge: false, ...PR_SPARSE });
  if (!prDD()) for (let x = x0 + 24; x < x1 - 10; x += 34) prFlat(prR(x, top + 2, x + 11, floor - 2), PRB.stripe, 'prb-str' + x);
  // corners, the ceiling's and floor's edges, skirting
  boilSeed('prb edges');
  for (const xa of [x0, x1]) { dline([[xa, top], [xa, floor]], 1.2, PRB.wallDk); dline([prbP(xa, H0, 1), prbP(xa, H0, K)], 1, PRB.ceilDk); dline([prbP(xa, 0, 1), prbP(xa, 0, K)], 1, PRB.carpetDk); }
  dline([[x0, top], [x1, top]], 1, PRB.ceilDk);
  piece(prR(x0, floor - 14, x1, floor + 1), PRB.skirt, { sw: 1, key: 'prb-skb', lift: 1, flatCard: true });
  for (const xa of [x0, x1]) prFlat([prbP(xa, 14, 1), prbP(xa, 14, K), prbP(xa, 0, K), prbP(xa, 0, 1)], PRB.skirt, 'prb-sks' + xa);
  // the open front: the floor and each side wall end in cut edges (their thickness), with the stage's dark beyond
  const yB = prbY(0, K), yT = prbY(H0, K);
  piece([[prbX(x0, K), yB], [prbX(x1, K), yB], [prbX(x1, K) + 26, yB + 22], [prbX(x0, K) - 26, yB + 22]], mixCol(PRB.carpetDk, '#000000', .2), { sw: 1.4, key: 'prb-cutf', lift: 6 });
  for (const [xa, s] of [[x0, -1], [x1, 1]]) {
    const xe = prbX(xa, K);
    piece([[xe, yT - 40], [xe + s * 26, yT - 50], [xe + s * 26, yB + 22], [xe, yB]], PRB.wallEdge, { sw: 1.4, key: 'prb-cut' + s, lift: 6 });
  }
}

// damp in the top-left corner: a spreading stain on both walls and the ceiling, black mould specks, peeling paper
// her room's own wear (not his damp corner and peeling strip): a tea-brown leak stain spreading on the ceiling from the
// back right, its tide-mark ring and a drip; a long settlement crack down the back wall from the top-right corner, filled
// badly and cracked again; black condensation mould along the right wall's bottom; the skirting kicked in at the front
function prBoxWearHer(t, o) {
  const { x0, x1, top, floor } = PR_BOX, H0 = floor - top;
  boilSeed('prb her wear');
  const sc = prbP(x1 - 190, H0, 1.18), ring = [];
  for (let i = 0; i < 26; i++) { const a = i / 26 * TAU, r = 1 + .16 * Math.sin(a * 3 + 1) + .1 * Math.sin(a * 5 + 2); ring.push([sc[0] + Math.cos(a) * 118 * r, sc[1] + Math.sin(a) * 22 * r]); }
  piece(curvy(ring, 3), '#B89A6A', { ink: null, op: 120, key: 'prh-stain', lift: 0, flatCard: true, edge: false });
  dline(curvy(ring, 3).slice(0, -6), 1.3, '#8A6A3A', .5);
  piece(curvy(ring.map(([x, y]) => [sc[0] + (x - sc[0]) * .55, sc[1] + (y - sc[1]) * .55]), 3), '#A2804E', { ink: null, op: 90, key: 'prh-stain2', lift: 0, flatCard: true, edge: false });
  const dp = (t * .7) % 1;   // a drip forming and falling
  piece(oval(sc[0] + 30, sc[1] + 18 + (dp > .7 ? (dp - .7) * 900 : 0), 3, 3 + 3 * Math.min(1, dp / .7), 0, 8), '#9AB4C8', { ink: null, op: dp > .95 ? 0 : 200, key: 'prh-drip', lift: 0, flatCard: true, edge: false });
  const C = [[x1 - 6, top + 4], [x1 - 40, top + 60], [x1 - 34, top + 112], [x1 - 86, top + 170], [x1 - 80, top + 236], [x1 - 120, top + 300]];
  piece(ribbon(C.slice(1, 5), 9, 7), '#D8CDB6', { ink: null, op: 200, key: 'prh-filler', lift: 0, flatCard: true, edge: false });   // the filler over it
  dline(C, 1.4, '#5A4E3A', .3); dline([C[2], [C[2][0] + 26, C[2][1] + 24]], 1, '#5A4E3A', .3); dline([C[4], [C[4][0] - 24, C[4][1] + 18]], .9, '#5A4E3A', .3);
  for (let i = 0; i < 40; i++) {   // condensation mould along the right wall's bottom, by the window side
    const k = 1 + .45 * hash(i + 21), h = 12 + 70 * Math.pow(hash(i + 9), 2), pt = prbP(x1, h, k);
    piece(oval(pt[0], pt[1], 1.6 + 2.2 * hash(i + 4), 1.4 + 2 * hash(i + 6), 0, 8), PRB.mould, { ink: null, key: 'prh-sp' + i, lift: 0, flatCard: true, edge: false });
  }
  const s0 = prbP(x0 + 200, 0, 1.02), s1 = prbP(x0 + 260, 0, 1.02);   // a dent kicked in the skirting
  piece([[s0[0], s0[1] - 16], [s1[0], s1[1] - 14], [s1[0] - 6, s1[1]], [s0[0] + 4, s0[1]]], '#9A907E', { ink: null, key: 'prh-kick', lift: 0, flatCard: true, edge: false });
}
function prBoxDamp(t, o) {
  if (o.her) { prBoxWearHer(t, o); return; }
  const { x0, top, floor } = PR_BOX, H0 = floor - top;
  boilSeed('prb damp');
  piece(curvy([[x0, top], [x0 + 150, top], [x0 + 128, top + 46], [x0 + 92, top + 64], [x0 + 74, top + 132], [x0 + 34, top + 114], [x0, top + 190]], 4), PRB.damp, { ink: null, op: 150, key: 'prb-dampb', lift: 0, flatCard: true, edge: false });
  piece(curvy([[x0, top], [x0 + 80, top], [x0 + 60, top + 34], [x0 + 22, top + 56], [x0, top + 86]], 4), PRB.dampDk, { ink: null, op: 140, key: 'prb-dampb2', lift: 0, flatCard: true, edge: false });
  piece(curvy([prbP(x0, H0, 1), prbP(x0, H0, 1.45), prbP(x0, H0 - 70, 1.36), prbP(x0, H0 - 150, 1.18), prbP(x0, H0 - 240, 1.04), prbP(x0, H0 - 220, 1)], 4), PRB.damp, { ink: null, op: 150, key: 'prb-damps', lift: 0, flatCard: true, edge: false });
  piece(curvy([prbP(x0, H0, 1), prbP(x0, H0, 1.24), prbP(x0, H0 - 60, 1.16), prbP(x0, H0 - 110, 1.03)], 4), PRB.dampDk, { ink: null, op: 130, key: 'prb-damps2', lift: 0, flatCard: true, edge: false });
  piece(curvy([prbP(x0 + 30, H0, 1.1), prbP(x0 + 190, H0, 1.06), prbP(x0 + 170, H0, 1.35), prbP(x0 + 40, H0, 1.45)], 4), PRB.dampDk, { ink: null, op: 90, key: 'prb-ceilstain', lift: 0, flatCard: true, edge: false });
  for (let i = 0; i < 44; i++) {   // mould specks, densest in the corner
    const r = Math.pow(hash(i + 3), 1.6), a = hash(i + 11) * Math.PI / 2, onSide = i % 3 === 0;
    const pt = onSide ? prbP(x0, H0 - r * 170 * Math.sin(a), 1 + r * .4 * Math.cos(a)) : [x0 + r * 120 * Math.cos(a), top + r * 130 * Math.sin(a)];
    piece(oval(pt[0], pt[1], 1.8 + 2.8 * hash(i + 5), 1.6 + 2.4 * hash(i + 7), 0, 8), PRB.mould, { ink: null, key: 'prb-sp' + i, lift: 0, flatCard: true, edge: false });
  }
  // a strip of wallpaper peeling off the back wall: the bare plaster where it was, the strip hanging away and curling
  piece([[x0 + 40, top + 2], [x0 + 80, top + 2], [x0 + 78, top + 96], [x0 + 42, top + 102]], PRB.peelBack, { ink: null, key: 'prb-bare', lift: 0, flatCard: true, edge: false });
  piece([[x0 + 42, top + 96], [x0 + 80, top + 92], [x0 + 92, top + 150], [x0 + 96, top + 196], [x0 + 60, top + 204], [x0 + 56, top + 150]], PRB.wall, { sw: 1, shade: PRB.wallDk, depth: 8, key: 'prb-peel', lift: 6 });
  prFlat([[x0 + 64, top + 110], [x0 + 72, top + 108], [x0 + 82, top + 190], [x0 + 74, top + 192]], PRB.stripe, 'prb-peelst');
  piece(curvy([[x0 + 58, top + 196], [x0 + 98, top + 190], [x0 + 102, top + 212], [x0 + 80, top + 224], [x0 + 60, top + 214]], 3), PRB.peelBack, { sw: 1, key: 'prb-curl', lift: 6, flatCard: true });
}

// the narrow window (hers, o.her): a white frame, and the view: the next building's brick wall a metre away, a drainpipe
function prBoxWindow(t, o) {
  if (!o.her) return prBoxWindowHis(t, o);
  const { x0, x1, y0, y1 } = BOXROOM.win, G = prR(x0, y0, x1, y1), Cl = P => prClip(P, G);
  boilSeed('prb window');
  piece(G, PRB.brick, { ink: null, key: 'prb-brick', lift: 0, edge: false });
  for (let r = 0, y = y0 + 6; y < y1; r++, y += 16) {
    dline([[x0, y], [x1, y]], 1.2, PRB.mortar);
    for (let x = x0 + (r % 2) * 22 - 22; x < x1; x += 44) if (x > x0) dline([[x, y], [x, Math.min(y1, y + 16)]], 1.1, PRB.mortar);
    if (r % 3 === 1) prFlat(Cl(prR(x0 + 6 + (r * 13) % 30, y + 2, x0 + 36 + (r * 13) % 30, y + 14)), PRB.brickDk, 'prb-bd' + r);
  }
  prFlat(Cl(prR(x1 - 28, y0 - 10, x1 - 16, y1 + 10)), PRB.pipe, 'prb-pipe');
  prFlat(Cl(prR(x1 - 32, y0 + 150, x1 - 12, y0 + 158)), PRB.pipe, 'prb-bracket');
  const bar = (P, k) => piece(P, PRB.sash, { sw: 1.2, shade: PRB.sashDk, depth: 3, key: k, lift: 3, flatCard: true });
  bar(prR(x0 - 12, y0 - 12, x1 + 12, y0 + 2), 'prb-wt'); bar(prR(x0 - 12, y0 - 12, x0 + 2, y1 + 2), 'prb-wl'); bar(prR(x1 - 2, y0 - 12, x1 + 12, y1 + 2), 'prb-wr');
  bar(prR(x0, (y0 + y1) / 2 - 6, x1, (y0 + y1) / 2 + 6), 'prb-wm');
  piece(prR(x0 - 20, y1, x1 + 20, y1 + 12), PRB.sash, { sw: 1.2, shade: PRB.sashDk, depth: 4, key: 'prb-sill', lift: 4 });
  // a net curtain across the top half-pane, and on the sill a mug holding a toothbrush
  piece(curvy([[x0 - 2, y0], [x1 + 2, y0], [x1 + 2, y0 + 70], [x1 - 20, y0 + 78], [(x0 + x1) / 2, y0 + 70], [x0 + 16, y0 + 78], [x0 - 2, y0 + 72]], 3), '#E8E4DA', { sw: .9, key: 'prb-net', lift: 2, op: 200, flatCard: true });
  for (let i = 1; i < 6; i++) dline([[x0 + i * 15, y0 + 4], [x0 + i * 15 + 2, y0 + 70]], .6, '#C9C3B6', .3);
  prMug(x1 - 6, y1 + 2, 26, 'prb-mug', 0, t, '#5E7A94');
  dline([[x1 - 8, y1 - 22], [x1 + 2, y1 - 44]], 2.6, '#5AB4A8', 0);
}
// His window (the default box room): as big as it is from the street in the turbine stretch (BOXROOM.winHis), two
// casements, three panes each, as there. The view is gloomy: the house opposite across the narrow street, close, filling
// most of it: grimy brick, its dark window behind a tired net curtain, a drainpipe; above its roofline and chimney pots,
// the night lit orange by the turbine plant beyond, one of its stacks standing up into it with a red warning light that
// blinks every other beat (as the stacks' lights do on the street).
function prBoxWindowHis(t, o) {
  const { x0, x1, y0, y1 } = BOXROOM.winHis, w = x1 - x0, h = y1 - y0, G = prR(x0, y0, x1, y1), Cl = P => prClip(P, G);
  const X = f => x0 + w * f, yr = y0 + h * .44, mx = (x0 + x1) / 2;
  const F = (P, col, key, oo) => { const Q = Cl(P); if (Q && Q.length > 2) prFlat(Q, col, key, oo); };   // (clipped to the opening)
  boilSeed('prb window his');
  // the night over the roofs, orange with the plant's light nearest the roofline
  piece(G, '#1C2030', { ink: null, key: 'prbh-sky', lift: 0, edge: false });
  for (const [d, col, op, k] of [[118, '#6A3A2C', 150, 'a'], [70, '#B45A2E', 120, 'b'], [30, '#E8873A', 110, 'c']]) F(prR(x0, yr - d, x1, yr), col, 'prbh-glow' + k, { op });
  // the plant's stacks beyond the roofs: a far one, faint; a near one, taller, its warning light on top
  F([[X(.86), yr], [X(.865), y0 + h * .12], [X(.93), y0 + h * .12], [X(.935), yr]], '#3A3038', 'prbh-stack2');
  F([[X(.66), yr], [X(.675), y0 + h * .08], [X(.745), y0 + h * .08], [X(.76), yr]], '#2A2430', 'prbh-stack1');
  F(prR(X(.665), y0 + h * .2, X(.755), y0 + h * .23), '#4A3A3E', 'prbh-stackband');
  const on = frac((typeof bpOf === 'function' ? bpOf(t) : t * 2.28) / 2) < .5, lx = X(.71), ly = y0 + h * .08 - 6;
  piece(oval(lx, ly, 6, 5, 0, 10), on ? '#FF4A3A' : '#6A2A2A', { ink: null, key: 'prbh-red', lift: 1, flatCard: true });
  if (on) glow(lx, ly, 22, '#FF4A3A', .8);
  // the house opposite: its slate roof edge and gutter, a chimney with two pots against the glow
  F(prR(X(.26), yr - 64, X(.4), yr), '#4A3028', 'prbh-chim');
  for (const [a, b] of [[.28, .32], [.34, .38]]) F(prR(X(a), yr - 84, X(b), yr - 64), '#6A4234', 'prbh-pot' + a);
  F([[x0, yr - 14], [x1, yr - 20], [x1, yr + 4], [x0, yr + 4]], '#302C36', 'prbh-roof');
  // its brick front (small courses: across the street, not at arm's length), grimy under the gutter, streaked
  const fy = yr + 4;
  F(prR(x0, fy, x1, y1), '#6A4034', 'prbh-brick');
  for (let r = 0, y = fy + 11; y < y1; r++, y += 12) {
    dline([[x0, y], [x1, y]], 1.1, '#94806E', .2);
    for (let x = x0 + (r % 2) * 16 - 16; x < x1; x += 32) if (x > x0 && hash(x * .7 + r) < .7) dline([[x, y - 12], [x, y]], 1, '#94806E', .2);
    if (r % 3 === 2) F(prR(X(.05 + .31 * hash(r * 1.3)), y - 11, X(.05 + .31 * hash(r * 1.3)) + 30, y - 1), '#58342A', 'prbh-bd' + r);
  }
  F(prR(x0, fy, x1, fy + 34), '#241C1C', 'prbh-grime', { op: 110 });
  for (let i = 0; i < 5; i++) { const sx = X(.08 + .2 * i + .06 * hash(i * 2.1)); F([[sx - 5, fy + 30], [sx + 5, fy + 30], [sx + 3, fy + 40 + 70 * hash(i * 3.7)], [sx - 2, fy + 40 + 70 * hash(i * 3.7)]], '#2E2420', 'prbh-streak' + i, { op: 90 }); }
  F(prR(x0, fy, x1, fy + 14), '#C8642E', 'prbh-rim', { op: 40 });   // (the glow catching the gutter's edge)
  F([[x0, fy], [x1, fy - 3], [x1, fy + 3], [x0, fy + 5]], '#1E1C22', 'prbh-gutter');
  // its window: a stone lintel, a dark pane, a grey net curtain; a drainpipe down past it
  const wx0 = X(.2), wx1 = X(.5), wy0 = fy + 58;
  F(prR(wx0 - 10, wy0 - 16, wx1 + 10, wy0), '#8E8478', 'prbh-lintel');
  F(prR(wx0, wy0, wx1, y1), '#B8B0A2', 'prbh-oframe');
  F(prR(wx0 + 7, wy0 + 7, wx1 - 7, y1), '#15171E', 'prbh-oglass');
  F(curvy([[wx0 + 7, wy0 + 64], [(wx0 + wx1) / 2, wy0 + 56], [wx1 - 7, wy0 + 64], [wx1 - 7, y1], [wx0 + 7, y1]], 3), '#7A7670', 'prbh-onet', { op: 150 });
  F(prR((wx0 + wx1) / 2 - 3, wy0 + 7, (wx0 + wx1) / 2 + 3, y1), '#B8B0A2', 'prbh-obar');
  const px = X(.62);
  F(prR(px - 6, fy, px + 6, y1), '#26262A', 'prbh-pipe');
  F([[px - 8, fy - 2], [px + 8, fy - 2], [px + 6, fy + 12], [px - 6, fy + 12]], '#26262A', 'prbh-hopper');
  for (let y = fy + 70; y < y1; y += 96) F(prR(px - 10, y, px + 10, y + 6), '#1A1A1E', 'prbh-brk' + y);
  // the frame: two casements shut, meeting at a centre stile, two glazing bars each; the sill
  const bar = (P, k) => piece(P, PRB.sash, { sw: 1.2, shade: PRB.sashDk, depth: 3, key: k, lift: 3, flatCard: true });
  bar(prR(x0 - 14, y0 - 14, x1 + 14, y0 + 4), 'prbh-wt'); bar(prR(x0 - 14, y0 - 14, x0 + 4, y1 + 2), 'prbh-wl'); bar(prR(x1 - 4, y0 - 14, x1 + 14, y1 + 2), 'prbh-wr');
  bar(prR(mx - 8, y0, mx + 8, y1), 'prbh-wm'); bar(prR(x0, y1 - 12, x1, y1 + 2), 'prbh-wb');
  for (const f of [1 / 3, 2 / 3]) { const y = y0 + h * f; bar(prR(x0 + 4, y - 5, mx - 8, y + 5), 'prbh-gl' + f); bar(prR(mx + 8, y - 5, x1 - 4, y + 5), 'prbh-gr' + f); }
  piece(prR(x0 - 24, y1, x1 + 24, y1 + 14), PRB.sash, { sw: 1.2, shade: PRB.sashDk, depth: 4, key: 'prbh-sill', lift: 4 });
  // a net curtain bunched to one side (the view's all there is), and on the sill a mug holding a toothbrush
  piece(curvy([[x0 - 4, y0 - 2], [x0 + 62, y0 - 2], [x0 + 44, y0 + h * .4], [x0 + 30, y0 + h * .5], [x0 + 52, y1 - 6], [x0 - 4, y1 - 6]], 3), '#E8E4DA', { sw: .9, key: 'prbh-net', lift: 2, op: 210, flatCard: true });
  for (let i = 1; i < 4; i++) dline([[x0 + i * 14, y0 + 2], [x0 + i * 10 + 4, y0 + h * .45], [x0 + i * 13, y1 - 10]], .6, '#C9C3B6', .3);
  piece(ribbon([[x0 - 6, y0 + h * .47], [x0 + 40, y0 + h * .5]], 7, 6), '#B8B0A2', { sw: .8, key: 'prbh-tie', lift: 3, flatCard: true });
  prMug(x1 - 26, y1 + 2, 26, 'prbh-mug', 0, t, '#5E7A94');
  dline([[x1 - 28, y1 - 22], [x1 - 18, y1 - 44]], 2.6, '#5AB4A8', 0);
}

// the clothes rail against the right wall (receding along it): hoodies, a shirt, a jacket; trainers underneath
function prBoxRail(t, o) {
  if (o.her) return prHerWall(t, o);   // (her rail stands elsewhere: prHerRail)
  const { x1 } = PR_BOX, P = (h, k) => [prbX(x1 - 22, k), prbY(h, k)], k0 = 1.14, k1 = 1.56, rh = 380;
  boilSeed('prb rail');
  for (const k of [k0, k1]) { piece(ribbon([P(0, k), P(rh, k)], 3 * k, 3 * k), PRB.railDk, { sw: .9, key: 'prb-rp' + k, lift: 2, flatCard: true }); piece(oval(...P(0, k), 6 * k, 2.6 * k, 0, 10), '#2A2628', { ink: null, key: 'prb-rw' + k, lift: 1, flatCard: true }); }
  for (const [k, c] of [[1.3, '#E8E2D6'], [1.44, '#E8E2D6']]) { const [sx, sy] = P(0, k); piece(curvy([[sx - 18 * k, sy - 5 * k], [sx + 12 * k, sy - 8 * k], [sx + 20 * k, sy + 1], [sx - 20 * k, sy + 3]], 3), c, { sw: 1, key: 'prb-shoe' + k, lift: 2, flatCard: true }); }
  piece(ribbon([P(rh, k0 - .04), P(rh, k1 + .04)], 5, 7), PRB.rail, { sw: 1, key: 'prb-bar', lift: 3, flatCard: true });
  // garments on hangers, facing us, bunched along the rail (the far ones peek out behind): shoulders, sleeves, a body
  [[1.2, PRB.olive, 'o'], [1.29, PRB.hoodie, 'h'], [1.38, PRB.shirt, 's'], [1.48, PRB.jacket, 'j']].forEach(([k, col, id]) => {
    const [hx, hy] = P(rh, k), w = 34 * k, L = (id === 'j' ? 230 : 190) * k * .8, dk = mixCol(col, '#000000', .3), y1 = hy + 10 * k;
    dline([[hx, hy - 8 * k], [hx + 3 * k, hy - 12 * k], [hx + 5 * k, hy - 6 * k]], .8, '#6A6A6A', .5);
    dline([[hx - w * .45, y1], [hx, hy], [hx + w * .45, y1]], .9, '#6A6A6A', 0);
    for (const sd of [-1, 1]) piece(ribbon([[hx + sd * w * .46, y1 + 4 * k], [hx + sd * w * .62, y1 + L * .35], [hx + sd * w * .6, y1 + L * .62]], 13 * k, 10 * k), dk, { sw: 1, key: 'prb-sl' + id + sd, lift: 3, flatCard: true });
    piece(curvy([[hx - w * .48, y1], [hx - w * .15, y1 - 3 * k], [hx + w * .15, y1 - 3 * k], [hx + w * .48, y1], [hx + w * .46, hy + L], [hx - w * .46, hy + L]], 3), col, { sw: 1.2, shade: dk, depth: 8, key: 'prb-cl' + id, lift: 4 });
    if (id === 'h') { piece(curvy([[hx - w * .28, y1 - 2], [hx + w * .28, y1 - 2], [hx + w * .2, y1 + 26 * k], [hx - w * .2, y1 + 26 * k]], 3), dk, { sw: .9, key: 'prb-hood', lift: 2, flatCard: true }); prFlat(prR(hx - w * .3, hy + L * .62, hx + w * .3, hy + L * .8), dk, 'prb-pouch'); }
    if (id === 's') { for (let bb = 0; bb < 4; bb++) prFlat(oval(hx, y1 + (18 + bb * 20) * k, 1.5 * k, 1.5 * k, 0, 8), '#E8E4DA', 'prb-btn' + bb); dline([[hx, y1 + 6 * k], [hx, hy + L - 4]], .7, dk); }
    if (id === 'j') dline([[hx - 2, y1 + 4 * k], [hx - 2, hy + L - 4]], .9, '#1E1E22');
  });
}

// the bed's transform: it tips up about its front-right foot (the pivot sliding left so the upright bed stays in the room)
function prBedT(o) {
  const B = BOXROOM.bedAt, up = ease(clamp(o.bedUp || 0));
  return { a: up * Math.PI / 2, px: B.pivot[0] + B.upShift * up, py: B.pivot[1] };
}
function prBed(t, o) {
  const B = BOXROOM.bedAt, { x0, x1, front, top, back, bx0, bx1 } = B, T0 = prBedT(o);
  boilSeed('prb bed');
  // the headboard, screwed to the left wall (it stays when the bed goes up); then the bed: top, divan, mattress front
  piece([[x0 - 2, top - 150], [bx0 - 2, back - 118], [bx0 - 2, back + 20], [x0 - 2, front]], PRB.head, { sw: 1.3, shade: PRB.headDk, depth: 8, key: 'prb-head', lift: 5 });
  push(); translate(T0.px, T0.py); rotate(T0.a); translate(-B.pivot[0], -B.pivot[1]);
  piece([[bx0 + 6, back], [bx1, back], [x1, top], [x0 + 8, top]], PRB.mattress, { sw: 1.2, key: 'prb-mtop', lift: 3 });
  piece(prR(x0 + 8, top + 40, x1, front - 12), PRB.divan, { sw: 1.4, shade: PRB.divanDk, depth: 10, key: 'prb-divan', lift: 4 });
  for (const fx of [x0 + 24, x1 - 32]) piece(prR(fx, front - 14, fx + 18, front), '#2A2628', { sw: .9, key: 'prb-foot' + fx, lift: 2, flatCard: true });
  piece(prR(x0 + 8, top, x1, top + 42), PRB.mattress, { sw: 1.2, key: 'prb-mfront', lift: 3 });
  for (let x = x0 + 24; x < x1 - 8; x += 18) dline([[x, top + 4], [x, top + 38]], 1, PRB.tick);
  if (o.her) { prHerBed(t, o); pop(); return; }   // her own bedding on the landlord's divan
  // the pillow; the duvet, turned back from the pillow and hanging over the front
  piece(curvy([[bx0 + 16, back + 6], [bx0 + 120, back + 2], [x0 + 176, top - 6], [x0 + 26, top - 2]], 3), PRB.pillow, { sw: 1.2, shade: PRB.pillowDk, depth: 10, key: 'prb-pillow', lift: 4 });
  const duv = [[bx0 + 150, back + 2], [bx1 - 4, back], [x1 + 4, top + 2], [x1 + 2, top + 76], [x1 - 140, top + 88], [x1 - 300, top + 80], [x1 - 450, top + 90], [x0 + 210, top + 80], [x0 + 196, top + 10], [bx0 + 150, back + 30]];
  piece(curvy(duv, 3), PRB.duvet, { sw: 1.4, shade: PRB.duvetDk, depth: 18, key: 'prb-duvet', lift: 4 });
  piece(curvy([[x0 + 194, top - 6], [bx0 + 146, back + 8], [bx0 + 190, back + 12], [x0 + 236, top + 8]], 3), PRB.duvetLt, { sw: 1, key: 'prb-fold', lift: 3, flatCard: true });
  for (let i = 0; i < 9; i++) prFlat(oval(x0 + 270 + i * 42, top + 44 + (i % 2) * 14, 5, 4, 0, 10), PRB.duvetLt, 'prb-dot' + i);
  // the phone on the bed by the pillow, screen down
  const [phx, phy] = BOXROOM.bedAt.phone;
  piece([[phx - 22, phy - 6], [phx + 22, phy - 10], [phx + 26, phy + 4], [phx - 18, phy + 8]], PRB.phone, { sw: .9, key: 'prb-phone', lift: 2, flatCard: true });
  pop();
}
BOXROOM.bedAt.phone = [BOXROOM.bedAt.x0 + 214, BOXROOM.bedAt.top - 14];
// where the phone is, however the bed is tipped (for the cable)
function prBedPhone(o) {
  const B = BOXROOM.bedAt, T0 = prBedT(o), dx = B.phone[0] - B.pivot[0], dy = B.phone[1] - B.pivot[1];
  return [T0.px + dx * Math.cos(T0.a) - dy * Math.sin(T0.a), T0.py + dx * Math.sin(T0.a) + dy * Math.cos(T0.a)];
}
// under the bed (it shows when the bed stands up): dust, a lost sock, a coin, a flattened box
function prUnderBed(t, o) {
  if ((o.bedUp || 0) < .05) return;
  const B = BOXROOM.bedAt, y0 = PR_BOX.floor, y1 = B.front;
  boilSeed('prb under');
  prFlat([[B.bx0, y0 + 2], [B.bx1, y0 + 2], [B.x1 - 20, y1 - 4], [B.x0 + 20, y1 - 4]], mixCol(PRB.carpet, '#000000', .15), 'prb-underfloor');
  for (let i = 0; i < 6; i++) { const x = B.x0 + 100 + i * 80 + 20 * hash(i), y = lerp(y0, y1, .45 + .4 * hash(i + 4)); piece(curvy(oval(x, y, 14 + 8 * hash(i + 1), 7, 0, 10).map(([a, b], j) => [a + 3 * hash(j + i), b + 2 * hash(j * 3 + i)]), 3), PRB.dust, { ink: null, key: 'prb-dust' + i, lift: 1, flatCard: true }); }
  piece(curvy([[B.x0 + 300, y1 - 30], [B.x0 + 350, y1 - 36], [B.x0 + 364, y1 - 18], [B.x0 + 330, y1 - 12], [B.x0 + 300, y1 - 18]], 3), PRB.sock, { sw: 1, key: 'prb-lostsock', lift: 2, flatCard: true });
  piece(oval(B.x0 + 470, y1 - 26, 9, 4, 0, 14), '#C9A84A', { sw: .8, key: 'prb-coin', lift: 1, flatCard: true });
  piece([[B.x0 + 130, y1 - 76], [B.x0 + 250, y1 - 82], [B.x0 + 260, y1 - 54], [B.x0 + 136, y1 - 48]], '#B48C5C', { sw: 1, key: 'prb-flatbox', lift: 1, flatCard: true });
}
// the charger: a socket low on the right wall, a long white cable down to the floor, along the front of the bed and up to
// wherever the phone is
function prCharger(t, o) {
  const k = 1.1, sx = prbX(PR_BOX.x1, k) - 3, sy = prbY(70, k), ph = prBedPhone(o), up = ease(clamp(o.bedUp || 0)), B = BOXROOM.bedAt, fl = prbY(0, 1.3);
  boilSeed('prb charger');
  piece([[sx - 5, sy - 16], [sx + 9, sy - 20], [sx + 9, sy + 12], [sx - 5, sy + 14]], '#ECE8E0', { sw: .9, key: 'prb-socket', lift: 2, flatCard: true });
  prFlat(prR(sx - 1, sy - 7, sx + 6, sy + 5), '#F8F6F0', 'prb-plug');
  const pts = up < .5
    ? [[sx + 2, sy + 4], [sx - 4, prbY(0, 1.12) - 4], [B.x1 + 40, fl - 4], [900, fl + 10], [B.x0 + 170, fl + 2], [B.x0 + 186, B.front - 24], [B.x0 + 196, B.top + 30], ph]
    : [[sx + 2, sy + 4], [sx - 4, prbY(0, 1.12) - 4], [sx - 30, fl + 8], [lerp(sx - 60, ph[0] + 40, .5), fl + 14], [ph[0] + 36, lerp(fl, ph[1], .5)], ph];
  const pts2 = up < .5 ? pts.map((p, i) => i > 3 ? prL(p, ph, up * 1.6) : p) : pts;
  piece(ribbon(through(pts2, 5), 3.8, 3.4), PRB.cable, { sw: .7, key: 'prb-cable', lift: 1.5, flatCard: true });
}

// floor clutter at the front left: a heap of laundry, a backpack slumped against it
function prBoxClutter(t, o) {
  if (o.her) return prHerClutter(t, o);
  boilSeed('prb clutter');
  const x = 400, y = 930;
  prShadow(x + 20, y + 6, 110, 12, 90);
  piece(curvy([[x - 90, y], [x - 70, y - 44], [x - 20, y - 62], [x + 40, y - 50], [x + 90, y - 18], [x + 96, y + 4]], 4), '#6C7278', { sw: 1.3, shade: '#4E5358', depth: 10, key: 'prb-laundry', lift: 4 });
  piece(curvy([[x - 60, y - 40], [x - 10, y - 70], [x + 30, y - 58], [x + 10, y - 36], [x - 40, y - 28]], 3), '#8E3A3A', { sw: 1.1, key: 'prb-lsock', lift: 3, flatCard: true });
  piece(ribbon([[x - 20, y - 20], [x + 30, y - 30], [x + 80, y - 14]], 16, 12), '#E6E0D2', { sw: 1, key: 'prb-ltee', lift: 3, flatCard: true });
  piece(curvy([[x + 60, y + 4], [x + 64, y - 80], [x + 100, y - 100], [x + 150, y - 86], [x + 160, y + 4]], 3), '#2E3A4A', { sw: 1.3, shade: '#1E2632', depth: 10, key: 'prb-pack', lift: 5 });
  piece(curvy([[x + 78, y - 40], [x + 146, y - 44], [x + 150, y - 6], [x + 80, y - 4]], 3), '#3A4A5E', { sw: 1, key: 'prb-pocket', lift: 2, flatCard: true });
  dline([[x + 80, y - 42], [x + 146, y - 46]], 1.2, '#C9C3B6', 0);
}

// ---------- her box room (o.her: C1f, her half of C2f) ----------
// The same room (shell, damp, window, bulb, the landlord's divan and headboard, the charger), dressed with her things
// instead of his, and no nicer. Her own bedding: a fitted sheet riding up off one corner, two tired pillows and the pink
// cushion from her sofa, a faded mustard duvet sprigged in rust, a granny-square throw, a hot-water bottle in a knitted
// cover. The fairy lights from her flat strung across the back wall. Her clothes rail against the left wall at the
// front, where his laundry heap is: her spare tomato coat, cream and rust knits, a sprigged teal dress, a cream scarf,
// a tote hooked on the end, ankle boots under it. At the right, where his rail stands: a laundry airer in the corner
// (tights, socks, a tea towel), a long mirror leaning on the wall, a stack of library books, and her office box from V1
// (the plant, the photo, her mug with pens in it) doing for a bedside table.
const PRH = {
  sheet: '#E2D0C4', sheetDk: '#C4AEA0',
  duvet: '#C9A24E', duvetDk: '#9A7A34', duvetLt: '#E0C98E', sprig: '#A34E2A', sprigLt: '#F0E4C8',
  pillow: '#EDE4D2', pillowDk: '#CDBFA6', pstripe: '#C98A6A', pillow2: '#A6B294', pillow2Dk: '#84917A',
  cushion: '#C9A09A', cushionDk: '#A87E78', throwEdge: '#4A3628', squares: ['#B0562E', '#3E6E6A', '#E8DCC4', '#D9A93A', '#C9A09A'],
  hwb: '#D86A6A', hwbDk: '#A84A4A', knit: '#6E9A94', knitDk: '#4E7A74', phone: '#7A3E4E',
  coat: '#D8432E', coatDk: '#9C2A1C', cream: '#E4D8BE', creamDk: '#BCAA8A', rust: '#B0562E', rustDk: '#7A381C', dress: '#3E6E6A', dressDk: '#284C48',
  scarf: '#EEE4D0', scarfDk: '#C9BBA0', tote: '#E2D6BC', toteDk: '#BCAC8E', boot: '#7A5234', bootDk: '#4A3020',
  airer: '#E8E4DA', airerDk: '#A8A49A', tights: '#2A2428', glass: '#AEBEC6', glassLt: '#E2EAEC', frame: '#D8CFBE', frameDk: '#A89E8A',
  fairy: '#FFD98A', wire: '#3A332C', books: ['#3E5E8A', '#B0562E', '#5E7A4A', '#D9A93A'],
};
// the back wall: the fairy lights from her flat, looped across it above the window
function prHerWall(t, o) {
  boilSeed('prh wall');
  const L = []; for (let i = 0; i <= 24; i++) { const f = i / 24, x = lerp(930, 1360, f); L.push([x, 196 + 16 * Math.sin(Math.PI * ((f * 3) % 1))]); }
  dline(L, 1.1, PRH.wire, .5);
  for (let i = 1; i < 24; i += 2) { const [x, y] = L[i], on = .75 + .25 * Math.sin(t * 2.1 + i); piece(oval(x, y + 5, 5, 6, 0, 10), mixCol('#A08850', PRH.fairy, on), { ink: null, key: 'prh-lt' + i, lift: 1, flatCard: true }); glow(x, y + 5, 16, PRH.fairy, .25 * on); }
}
// her bedding (inside prBed's tipping transform, over the mattress)
function prHerBed(t, o) {
  const B = BOXROOM.bedAt, { x0, x1, top, back, bx0, bx1 } = B;
  boilSeed('prh bed');
  // the fitted sheet; at the front-left its elastic has ridden up and the mattress ticking shows
  piece([[bx0 + 6, back], [bx1, back], [x1, top], [x0 + 8, top]], PRH.sheet, { sw: 1.1, key: 'prh-sheet', lift: 2 });
  piece(curvy([[x0 + 8, top], [x1, top], [x1, top + 34], [x0 + 200, top + 32], [x0 + 96, top + 18], [x0 + 8, top + 8]], 3), PRH.sheet, { sw: 1, key: 'prh-sheetf', lift: 2, flatCard: true });
  // two pillows: the sage one propped against the headboard, the striped one flat in front of it; the pink cushion
  piece(curvy([[x0 + 22, top - 84], [bx0 + 4, back - 58], [bx0 + 30, back + 8], [x0 + 60, top - 4], [x0 + 14, top - 8]], 3), PRH.pillow2, { sw: 1.2, shade: PRH.pillow2Dk, depth: 8, key: 'prh-pil2', lift: 4 });
  const pl = [[bx0 + 24, back + 4], [bx0 + 128, back], [x0 + 190, top - 4], [x0 + 40, top - 2]];
  piece(curvy(pl, 3), PRH.pillow, { sw: 1.2, shade: PRH.pillowDk, depth: 8, key: 'prh-pil', lift: 4 });
  for (const f of [.3, .55, .8]) dline([prL(pl[0], pl[3], f), prL(pl[1], pl[2], f)], 1.3, PRH.pstripe, 0);
  // the duvet, faded mustard sprigged in rust, pulled up to the pillows and hanging over the front, its top turned back
  const duv = [[bx0 + 128, back + 3], [bx1 - 4, back], [x1 + 4, top + 2], [x1 + 2, top + 72], [x1 - 110, top + 86], [x1 - 240, top + 76], [x1 - 400, top + 94], [x0 + 236, top + 84], [x0 + 218, top + 8], [bx0 + 128, back + 28]];
  piece(curvy(duv, 3), PRH.duvet, { sw: 1.4, shade: PRH.duvetDk, depth: 18, key: 'prh-duvet', lift: 4 });
  piece(curvy([[x0 + 216, top - 4], [bx0 + 124, back + 6], [bx0 + 172, back + 10], [x0 + 262, top + 10]], 3), PRH.duvetLt, { sw: 1, key: 'prh-fold', lift: 3, flatCard: true });
  for (let i = 0; i < 20; i++) {   // the sprigs: a row on the top (foreshortened), two down the front
    const r = i < 6 ? 0 : i < 13 ? 1 : 2, j = r === 0 ? i : r === 1 ? i - 6 : i - 13;
    const x = r === 0 ? 770 + j * 66 : 742 + j * 62 + (r === 2 ? 30 : 0), y = r === 0 ? 693 : r === 1 ? 744 : 776;
    prFlat(oval(x, y, 4.2, r === 0 ? 2.2 : 3.8, 0, 8), i % 3 === 1 ? PRH.sprigLt : PRH.sprig, 'prh-sp' + i);
  }
  // the granny-square throw, lying across the middle and sagging down the front: small squares, a little askew, dark
  // joins, the hem uneven where each square hangs (Gt maps (u, v) on the bed's top, Gf down the front, flaring out)
  const tb0 = 804, tb1 = 934, tf0 = prbX(tb0, 1.22), tf1 = prbX(tb1, 1.22), n = 5;
  const Gt = (u, v) => prL(prL([tb0 + 8, back + 3], [tb1 - 6, back + 2], u), prL([tf0, top], [tf1, top], u), v);
  const Gf = (u, v) => prL(prL([tf0 - 1, top - 2], [tf1 + 1, top - 2], u), prL([tf0 - 16, top + 100], [tf1 + 12, top + 92], u), v);
  const hem = i => 1 + .08 * (hash(i + 31) - .5);
  const edge = [Gt(0, 0), Gt(1, 0), Gt(1, 1), Gf(1, 0)];
  for (let i = n - 1; i >= 0; i--) edge.push(Gf((i + 1) / n, hem(i)), Gf((i + .5) / n, hem(i) + .025), Gf(i / n, hem(i)));
  edge.push(Gf(0, 0), Gt(0, 1));
  piece(curvy(edge, 2), PRH.throwEdge, { sw: 1.1, shade: mixCol(PRH.throwEdge, '#000000', .3), depth: 6, key: 'prh-throw', lift: 4 });
  const sq = (G, u0, v0, u1, v1, c, id) => {   // one square (and its centre), jiggled a px or two
    const j = (p, s) => [p[0] + 1.6 * (hash(s) - .5), p[1] + 1.6 * (hash(s + 7) - .5)], du = (u1 - u0) * .1, dv = (v1 - v0) * .1;
    prFlat([j(G(u0 + du, v0 + dv), c), j(G(u1 - du, v0 + dv), c + 1), j(G(u1 - du, v1 - dv), c + 2), j(G(u0 + du, v1 - dv), c + 3)], PRH.squares[c % 5], id);
    prFlat([G(lerp(u0, u1, .34), lerp(v0, v1, .34)), G(lerp(u0, u1, .66), lerp(v0, v1, .34)), G(lerp(u0, u1, .66), lerp(v0, v1, .66)), G(lerp(u0, u1, .34), lerp(v0, v1, .66))], PRH.squares[(c + 2) % 5], id + 'c');
  };
  for (let i = 0; i < n; i++) {
    sq(Gt, i / n, 0, (i + 1) / n, 1, i * 3 + 1, 'prh-gt' + i);
    for (let r = 0; r < 2; r++) sq(Gf, i / n, r * hem(i) / 2, (i + 1) / n, (r + 1) * hem(i) / 2, i * 2 + r * 3, 'prh-gs' + i + r);
  }
  // a hot-water bottle in a knitted cover, on the turned-back duvet (its neck and stopper to the right)
  push(); translate(738, 688); rotate(.12);
  piece(curvy([[-30, -9], [20, -11], [28, 0], [20, 11], [-30, 9], [-34, 0]], 3), PRH.knit, { sw: 1.1, shade: PRH.knitDk, depth: 5, key: 'prh-hwb', lift: 3 });
  for (const dx of [-18, -6, 6]) dline([[dx, -9], [dx, 9]], 1.4, PRH.sprigLt, 0);
  piece(prR(26, -5, 40, 5), PRH.hwb, { sw: .9, key: 'prh-hwbn', lift: 2, flatCard: true });
  piece(prR(40, -6, 46, 6), PRH.hwbDk, { sw: .8, key: 'prh-hwbs', lift: 2, flatCard: true });
  pop();
  // the pink cushion from her sofa, and her phone by the pillow (the charger reaches it)
  piece(curvy([[560, 706], [640, 694], [652, 748], [572, 760]], 3), PRH.cushion, { sw: 1.3, shade: PRH.cushionDk, depth: 8, key: 'prh-cush', lift: 4 });
  prFlat(oval(606, 727, 4, 4, 0, 10), PRH.cushionDk, 'prh-cushb');
  const [phx, phy] = BOXROOM.bedAt.phone;
  piece([[phx - 22, phy - 6], [phx + 22, phy - 10], [phx + 26, phy + 4], [phx - 18, phy + 8]], PRH.phone, { sw: .9, key: 'prh-phone', lift: 2, flatCard: true });
}
// her clothes rail against the left wall at the front (receding along it), her things bunched on it; boots under it
function prHerRail(t, o) {
  const { x0 } = PR_BOX, P = (h, k) => [prbX(x0 + 22, k), prbY(h, k)], k0 = 1.25, k1 = 1.62, rh = 372;
  boilSeed('prh rail');
  for (const k of [k0, k1]) { piece(ribbon([P(0, k), P(rh, k)], 3 * k, 3 * k), PRB.railDk, { sw: .9, key: 'prh-rp' + k, lift: 2, flatCard: true }); piece(oval(...P(0, k), 6 * k, 2.6 * k, 0, 10), '#2A2628', { ink: null, key: 'prh-rw' + k, lift: 1, flatCard: true }); }
  // ankle boots: one stood up, one slumped over
  [[1.36, 0], [1.46, -1.1]].forEach(([k, a], i) => {
    const [sx, sy] = P(0, k);
    push(); translate(sx + 6 * k, sy); rotate(a); scale(k);
    piece(curvy([[-9, -34], [7, -34], [8, -11], [22, -8], [25, 0], [-11, 0]], 2), PRH.boot, { sw: 1, shade: PRH.bootDk, depth: 4, key: 'prh-boot' + i, lift: 3 });
    prFlat(prR(-11, -3, 25, 0), PRH.bootDk, 'prh-sole' + i);
    pop();
  });
  piece(ribbon([P(rh, k0 - .04), P(rh, k1 + .04)], 5, 7), PRB.rail, { sw: 1, key: 'prh-bar', lift: 3, flatCard: true });
  // garments on hangers, facing us, bunched along the rail (the far ones peek out behind)
  [[1.29, 'coat', PRH.coat, PRH.coatDk, 250], [1.37, 'cream', PRH.cream, PRH.creamDk, 170], [1.45, 'dress', PRH.dress, PRH.dressDk, 236], [1.53, 'rust', PRH.rust, PRH.rustDk, 176]].forEach(([k, id, col, dk, len]) => {
    const [hx, hy] = P(rh, k), w = (id === 'cream' || id === 'rust' ? 38 : 34) * k, L = len * k * .8, y1 = hy + 10 * k;
    dline([[hx, hy - 8 * k], [hx + 3 * k, hy - 12 * k], [hx + 5 * k, hy - 6 * k]], .8, '#6A6A6A', .5);
    dline([[hx - w * .45, y1], [hx, hy], [hx + w * .45, y1]], .9, '#6A6A6A', 0);
    const sl = id === 'dress' ? .18 : 1;
    for (const sd of [-1, 1]) piece(ribbon([[hx + sd * w * .46, y1 + 4 * k], [hx + sd * w * .62, y1 + L * .35 * sl], [hx + sd * w * .6, y1 + L * .62 * sl]], 13 * k, 10 * k), dk, { sw: 1, key: 'prh-sl' + id + sd, lift: 3, flatCard: true });
    const body = id === 'dress'
      ? [[hx - w * .4, y1], [hx - w * .12, y1 - 3 * k], [hx + w * .12, y1 - 3 * k], [hx + w * .4, y1], [hx + w * .32, hy + L * .38], [hx + w * .66, hy + L], [hx - w * .66, hy + L], [hx - w * .32, hy + L * .38]]
      : [[hx - w * .48, y1], [hx - w * .15, y1 - 3 * k], [hx + w * .15, y1 - 3 * k], [hx + w * .48, y1], [hx + w * .46, hy + L], [hx - w * .46, hy + L]];
    piece(curvy(body, 3), col, { sw: 1.2, shade: dk, depth: 8, key: 'prh-cl' + id, lift: 4 });
    if (id === 'coat') {   // lapels, buttons
      for (const sd of [-1, 1]) piece([[hx + sd * w * .12, y1 - 2 * k], [hx + sd * w * .02, y1 + 30 * k], [hx + sd * w * .36, y1 + 6 * k]], dk, { sw: .9, key: 'prh-lap' + sd, lift: 2, flatCard: true });
      for (let b = 0; b < 3; b++) prFlat(oval(hx + w * .1, y1 + (44 + b * 28) * k, 2.2 * k, 2.2 * k, 0, 8), '#F2E6D0', 'prh-cb' + b);
    }
    if (id === 'cream' || id === 'rust') {   // ribbed hem and cuffs; a cable down the cream one, a roll neck on the rust
      prFlat(prR(hx - w * .46, hy + L - 12 * k, hx + w * .46, hy + L), dk, 'prh-rib' + id);
      if (id === 'cream') { const Z = []; for (let i = 0; i <= 8; i++) Z.push([hx + (i % 2 ? 4 : -4) * k, lerp(y1 + 12 * k, hy + L - 16 * k, i / 8)]); dline(Z, 1.4, dk, 0); }
      else piece(curvy([[hx - w * .24, y1 - 7 * k], [hx + w * .24, y1 - 7 * k], [hx + w * .22, y1 + 9 * k], [hx - w * .22, y1 + 9 * k]], 3), dk, { sw: .9, key: 'prh-roll', lift: 2, flatCard: true });
    }
    if (id === 'dress') for (let i = 0; i < 9; i++) prFlat(oval(hx + (hash(i + 21) - .5) * w * (i < 3 ? .5 : 1), lerp(y1 + 14 * k, hy + L - 10 * k, (i + .5) / 9), 2.4 * k, 2 * k, 0, 8), i % 2 ? '#E8C25A' : PRH.sprigLt, 'prh-dd' + i);
    if (id === 'rust') for (const [sd, l] of [[-1, .78], [1, .64]]) {   // the cream scarf, hung round its neck
      piece(ribbon([[hx + sd * 5 * k, y1 - 4 * k], [hx + sd * 7 * k, y1 + L * l]], 11 * k, 10 * k), PRH.scarf, { sw: 1, key: 'prh-scarf' + sd, lift: 3, flatCard: true });
      for (let f = -1; f <= 1; f++) dline([[hx + sd * 7 * k + f * 3 * k, y1 + L * l], [hx + sd * 7 * k + f * 3.4 * k, y1 + L * l + 7 * k]], 1, PRH.scarfDk, 0);
      prFlat(prR(hx + sd * 7 * k - 5 * k, y1 + L * l - 14 * k, hx + sd * 7 * k + 5 * k, y1 + L * l - 10 * k), PRH.coat, 'prh-scst' + sd);
    }
  });
  // a canvas tote hooked on the end of the bar
  const [ex, ey] = P(rh, k1 + .03), k = k1, tw = 30 * k, tt = ey + 26 * k, tb = tt + 62 * k;
  dline([[ex - tw * .55, tt], [ex - 4, ey + 2], [ex + tw * .1, tt]], 1.8, PRH.toteDk, 0);
  dline([[ex - tw * .1, tt], [ex + 4, ey + 4], [ex + tw * .55, tt]], 1.8, PRH.toteDk, 0);
  piece([[ex - tw * .7, tt], [ex + tw * .7, tt], [ex + tw * .76, tb], [ex - tw * .76, tb]], PRH.tote, { sw: 1.1, shade: PRH.toteDk, depth: 6, key: 'prh-tote', lift: 4 });
  prFlat(oval(ex, (tt + tb) / 2 - 4 * k, 11 * k, 11 * k, 0, 16), '#E0A526', 'prh-totep');
  prFlat(prR(ex - tw * .5, (tt + tb) / 2 + 12 * k, ex + tw * .5, (tt + tb) / 2 + 16 * k), PRH.dress, 'prh-totel');
}
// a winged laundry airer in the back-right corner, beside the end of the bed: tights, socks, a tea towel
function prHerAirer(t, o) {
  boilSeed('prh airer');
  const ka = 1.12, xa0 = 1156, xa1 = 1318, ht = 146, A = (x, h, k) => [prbX(x, k), prbY(h, k)];
  const bar = (a, b, key, w = 2.4) => piece(ribbon([a, b], w, w), PRH.airer, { sw: .7, key, lift: 2, flatCard: true });
  for (const x of [xa0, xa1]) for (const s of [-1, 1]) bar(A(x, ht, ka), A(x, 0, ka + s * .09), 'prh-al' + x + s, 3);
  for (let i = 0; i < 4; i++) { const k = ka - .045 + i * .03; bar(A(xa0 - 4, ht, k), A(xa1 + 4, ht, k), 'prh-ar' + i); }
  for (const [x, s] of [[xa0, -1], [xa1, 1]]) for (const k of [ka - .04, ka + .04]) bar(A(x, ht, k), A(x + s * 44, ht - 52, k), 'prh-aw' + s + k);
  for (const s of [-1, 1]) bar(A((s < 0 ? xa0 : xa1) + s * 44, ht - 52, ka - .04), A((s < 0 ? xa0 : xa1) + s * 44, ht - 52, ka + .04), 'prh-awe' + s);
  const kf = ka + .045, R = (x, h) => A(x, h, kf);
  // tights over the front rail, legs hanging
  for (const dx of [0, 13]) piece(ribbon([R(1188 + dx, ht), R(1190 + dx, ht - 60), R(1186 + dx * 1.2, ht - 120), R(1194 + dx * 1.2, ht - 128)], 7, 6), PRH.tights, { sw: .8, key: 'prh-tig' + dx, lift: 3, flatCard: true });
  piece(ribbon([R(1182, ht + 1), R(1210, ht + 1)], 7, 7), PRH.tights, { sw: .8, key: 'prh-tigw', lift: 3, flatCard: true });
  // socks in pairs
  [[1238, '#E0A526', 0], [1256, '#E0A526', 1], [1284, PRH.cushion, 2], [1300, PRH.cushion, 3]].forEach(([x, c, i]) => {
    piece(ribbon([R(x, ht), R(x, ht - 34), R(x + 8, ht - 40)], 8, 7), c, { sw: .8, key: 'prh-sock' + i, lift: 3, flatCard: true });
    prFlat(prR(R(x, ht)[0] - 4, R(x, ht - 12)[1], R(x, ht)[0] + 4, R(x, ht - 16)[1]), PRH.sprigLt, 'prh-sks' + i);
  });
  // a tea towel over the right wing
  const [wx, wy] = A(xa1 + 24, ht - 26, ka + .04);
  piece([[wx - 16, wy - 12], [wx + 18, wy + 6], [wx + 18, wy + 70], [wx - 16, wy + 58]], '#F0EADC', { sw: 1, key: 'prh-towel', lift: 3, flatCard: true });
  for (const f of [.62, .74]) prFlat([[wx - 16, wy - 12 + 70 * f], [wx + 18, wy + 6 + 64 * f], [wx + 18, wy + 10 + 64 * f], [wx - 16, wy - 8 + 70 * f]], '#C8463A', 'prh-tws' + f);
}
// a long mirror leaning on the right wall near the front, its bottom kicked out onto the floor, a crack in one corner
function prHerMirror(t, o) {
  boilSeed('prh mirror');
  const { x1 } = PR_BOX, ka = 1.44, kb = 1.6, hm = 322, kick = 22;
  const TL = prbP(x1, hm, ka), TR = prbP(x1, hm, kb), BR = prbP(x1 - kick, 0, kb), BL = prbP(x1 - kick, 0, ka);
  const G = (u, v) => prL(prL(TL, TR, u), prL(BL, BR, u), v);
  piece([TL, TR, BR, BL], PRH.frame, { sw: 1.3, shade: PRH.frameDk, depth: 6, key: 'prh-mirror', lift: 5 });
  prFlat([G(.16, .03), G(.84, .03), G(.84, .975), G(.16, .975)], PRH.glass, 'prh-glass');
  prFlat([G(.16, .7), G(.84, .7), G(.84, .975), G(.16, .975)], mixCol(PRH.glass, PRB.carpet, .45), 'prh-glfl');
  prFlat([G(.3, .08), G(.52, .08), G(.36, .5), G(.2, .5)], PRH.glassLt, 'prh-glhi', { op: 170 });
  prFlat([G(.6, .12), G(.68, .12), G(.52, .4), G(.46, .4)], PRH.glassLt, 'prh-glhi2', { op: 140 });
  dline([G(.84, .9), G(.66, .93), G(.58, .9), G(.44, .96)], .9, '#5E6A70', 0);
}
// a stack of library books (their spine labels), a notebook on top
function prHerBooks(t, o) {
  boilSeed('prh books');
  const k = 1.47, [bx, by] = prbP(1170, 0, k);
  let y = by;
  [[74, 15, PRH.books[0], 3], [66, 12, PRH.books[1], -5], [70, 16, PRH.books[2], 2], [62, 12, PRH.books[3], -3], [56, 9, '#2A2628', 1]].forEach(([l, th, c, dx], i) => {
    const L = l * k * .9, T = th * k * .9, x = bx + dx * k;
    piece(prR(x - L / 2, y - T, x + L / 2, y), c, { sw: 1, key: 'prh-bk' + i, lift: 3, flatCard: true });
    if (i < 4) prFlat(prR(x + L / 2 - 14 * k, y - T + 2, x + L / 2 - 5 * k, y - 2), '#F2EEE6', 'prh-bkl' + i);
    else { prFlat([[x - L / 2 + 2, y - T], [x + L / 2 - 2, y - T], [x + L / 2 - 6, y - T - 9 * k], [x - L / 2 + 6, y - T - 9 * k]], '#3A3638', 'prh-nbt'); dline([[x + L * .3, y], [x + L * .3, y - T], [x + L * .28, y - T - 9 * k]], 1.2, '#C8463A', 0); }
    y -= T;
  });
}
function prHerClutter(t, o) {
  prHerAirer(t, o);
  prHerMirror(t, o);
  prHerBooks(t, o);
  // her office box (V1), doing for a bedside table: the plant, the photo, her mug with pens in it
  boilSeed('prh box');
  const kb = 1.53, [cx, cy] = prbP(1258, 0, kb), s = 100 * kb, sc = s / 160, h = s * .62;
  prShadow(cx, cy + 2, s * .56, 8, 80);
  prBox(cx, cy, s, { key: 'prh-box' });
  const mx = cx - s * .02, my = cy - h - 18 * sc;
  for (const [dx, a, c] of [[-5, -.28, '#2E4E9A'], [1, .06, '#1E1E22'], [6, .32, '#C8463A']]) dline([[mx + dx * sc, my + 1], [mx + dx * sc + Math.sin(a) * 30 * sc, my + 1 - Math.cos(a) * 30 * sc]], 2.4 * sc, c, 0);
  prHerRail(t, o);
}

function boxroomBack(t, lt, o = {}) {
  const f = boxroomScale(o);
  boilSeed('prb void');
  if (!prDD()) piece(prR(-60, -60, W + 60, H + 60), PRB.void, { ink: null, key: 'prb-void', lift: 0, flatCard: true, edge: false });
  push(); translate(PR_BOX.vx, 0); scale(f, 1); translate(-PR_BOX.vx, 0);
  prBoxShell(t, o);
  prBoxDamp(t, o);
  prBoxWindow(t, o);
  prBoxRail(t, o);
  prUnderBed(t, o);
  prCharger(t, o);
  prBed(t, o);
  prBoxClutter(t, o);
  const dim = clamp(o.dim || 0);
  if (dim > .01) {   // everything sinks into the dark but the bed
    boilSeed('prb dim');
    if (!prDD()) piece(prR(-60 / f - 1000, -60, W + 1000 / f, H + 60), PRB.void, { ink: null, op: 255 * dim, key: 'prb-dim', lift: 0, flatCard: true, edge: false });
    prBed(t, o);
  }
  pop();
}
// the bare bulb on its flex (swinging a little) and its light on everyone: drawn after the cast
function boxroomFront(t, lt, o = {}) {
  const f = boxroomScale(o), bulb = o.bulb ?? 1, sw = o.swing ?? 5 * Math.sin(t * 1.3), by = 214;
  push(); translate(PR_BOX.vx, 0); scale(f, 1); translate(-PR_BOX.vx, 0);
  boilSeed('prb bulb');
  const cx = PR_BOX.vx, cy = prbY(PR_BOX.floor - PR_BOX.top, 1.3), bx = cx + sw;
  prOn(oval(cx, cy + 4, 18, 6, 0, 12), PRB.ceilDk, 'prb-rose', { lift: 2 });
  dline([[cx, cy + 6], [lerp(cx, bx, .5), (cy + by) / 2], [bx, by - 24]], 1.5, PRB.flex, .5);
  piece(prR(bx - 7, by - 27, bx + 7, by - 12), '#8A8478', { sw: .9, key: 'prb-holder', lift: 2, flatCard: true });
  piece(curvy([[bx - 10, by - 12], [bx + 10, by - 12], [bx + 17, by + 6], [bx, by + 21], [bx - 17, by + 6]], 3), bulb > 0 ? PRB.bulb : '#C9C3B6', { sw: 1, key: 'prb-bulb', lift: 2, flatCard: true });
  if (bulb > 0) { glow(bx, by + 4, 60, '#FFF6D8', .9 * bulb); glow(bx, by + 40, 560, '#FFD890', .2 * bulb); }
  pop();
  if (o.fore) o.fore(t, lt);
}

// ---------- the box room review loop ----------
// 0–6 s: the walls close in and open out again (squeeze), the bed tips up onto its end and back down, the bulb swings,
// and at the end the room sinks into the dark (dim). Him on the edge of the bed, then at the window while the bed is up
// (squashed with the room).
LOOPS.boxroom = t0 => {
  prLookBegin();
  const t = mt(t0), sq = seg(t, .4, 1.8) - seg(t, 4.4, 5.4), up = seg(t, 2.2, 3) - seg(t, 3.9, 4.6);
  const o = { squeeze: sq, bedUp: up, dim: seg(t, 5.2, 5.9) };
  boxroomBack(t, t, o);
  const f = boxroomScale(o);
  push(); translate(PR_BOX.vx, 0); scale(f, 1); translate(-PR_BOX.vx, 0);
  if (up < .02) { const [x, y, u, sh] = BOXROOM.bed; person(x, y, u, HIM_C, { ...feel('bored', t), seated: true, seatH: sh, pose: 'lap', boilKey: 'prbHim' }); }
  else { const [x, y, u] = BOXROOM.window; person(x, y, u, HIM_C, { ...feel('sad', t), view: 'q', lookY: -.4, boilKey: 'prbHim', emoteK: 0 }); }
  pop();
  boxroomFront(t, t, o);
  prLookEnd(t);
};
LOOPS.boxroom.len = 6;

// ---------- all three sets in card, doodle and xerox (riso), side by side ----------
// Rows: office, flat, box room; columns: card, doodle, xerox. Each cell draws the whole set (with a narrator) at .3 scale.
function prScene(which, t) {
  if (which === 'office') {
    const o = { clock: [9, 0], copierLid: .8, copierScan: frac(t / 1.5) };
    officeBack(t, t, o);
    const [cx, cy, cu, sh] = OFFICE.chair;
    person(cx, cy, cu, HER_C, { ...feel('neutral', t), seated: true, seatH: sh, pose: 'lap', lookX: .4, boilKey: 'plHer' });
    officeFront(t, t, o);
  } else if (which === 'flat') {
    flatBack(t, t, {});
    const [sx, sy, su, sh] = FLAT.sofa;
    person(sx, sy, su, HER_C, { ...feel('bored', t), seated: true, seatH: sh, view: 'q', flip: true, pose: 'lap', lookX: .6, lookY: .5, boilKey: 'plHerF' });
    flatFront(t, t, {});
  } else {
    const o = { squeeze: .25 };
    boxroomBack(t, t, o);
    const f = boxroomScale(o), [x, y, u, sh] = BOXROOM.bed;
    push(); translate(PR_BOX.vx, 0); scale(f, 1); translate(-PR_BOX.vx, 0);
    person(x, y, u, HIM_C, { ...feel('bored', t), seated: true, seatH: sh, pose: 'lap', boilKey: 'plHim' });
    pop();
    boxroomFront(t, t, o);
  }
}
LOOPS.presentLooks = t0 => {
  const S = .3, cw = W / 3, ch = H / 3, mx = (cw - W * S) / 2, my = (ch - H * S) / 2;
  ['office', 'flat', 'boxroom'].forEach((which, r) => ['card', 'doodle', 'xerox'].forEach((m, c) => {
    look(m); const t = mt(t0);
    push(); translate(c * cw + mx, r * ch + my); scale(S);
    boilSeed('pl ground' + r + c);
    if (m === 'doodle') linedPaper(); else if (m === 'xerox') _paint(prR(-60, -60, W + 60, H + 60), { wash: XEROX.paper, ink: null });
    prScene(which, t);
    if (m === 'xerox') xeroxGrit(t, .5);
    pop();
  }));
  look(LOOK_DEFAULT);
  // the gutters between the cells (covering anything that ran over a cell's edge)
  flushBrush();
  push(); noStroke(); fill('#1B1820');
  for (let c = 0; c <= 3; c++) rect(c * cw - mx, -10, 2 * mx, H + 20);
  for (let r = 0; r <= 3; r++) rect(-10, r * ch - my, W + 20, 2 * my);
  pop();
};
LOOPS.presentLooks.len = 6;

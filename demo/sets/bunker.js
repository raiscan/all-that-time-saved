// sets/bunker.js: THE BUNKER (shot C, the bad future). A billionaires' doomsday bunker as a gothic crypt-cathedral in
// poured concrete: a lancet arcade under a ribbed vault, server racks standing like organ pipes in the chancel niche
// (tiny blinking status lights), iron candelabras and a ring chandelier (the only warmth is candlelight), a long banquet
// table with a white cloth and velvet swags (roast, silver dome, a champagne coupe tower, champagne bucket), and a
// massive round vault door on the right whose letterbox slot feeds out a bill. Muted and gritty: stains, cracks, drips,
// cobwebs, dust falling through the light, a heavy vignette.
//
// Shot C is LOOPS.bunker(lt): it paints the whole frame, opens and closes its own camera (bunkerCam), and composes the
// cast: Grok stands ON the table pouring into the coupe tower, Muse hovers beside Zuck with a canapé tray, Musk (left,
// facing right) and Zuck (right, facing left) toast; both bots turn to the door when its alarm lamp goes.
// The pieces, for a shot that composes its own cast (all inside the same camera):
//   bunkerBack(t, lt, o)   everything behind the diners, full frame: vault, arcade, organ racks, candelabra, chandelier,
//                          the chairs, and the vault door with its slot event (red lamp, flap, the bill feeding out),
//                          which runs on lt (shot time) by itself.
//   bunkerFront(t, lt, o)  = bunkerTable + o.onTable() + bunkerFore: the table (its front edge hides the diners' laps)
//                          and what's on it, then o.onTable (draw the diners' front arms there: Musk's layer 'front'),
//                          then foreground dust and the vignette (screen space). o.vignette: 0..1 (default 1).
//   bunkerTable(t, lt)     just the table and what's on it (e.g. inside zuck()'s `table` callback).
//   bunkerFore(t, lt, o)   just the foreground dust, the light under the chandelier and the vignette.
//   vaultSlot(lt, o)       the bill once it's free of the slot, flying at the camera until it fills the frame. Draw it
//                          LAST (over the cast and the table). Returns bunkerBill(lt). o.cam: the camera (default: the
//                          active one, else bunkerCam(lt)).
//   bunkerBill(lt, cam)    where the bill is, in SCREEN space: { x, y, s, rot, flap, free } (s = width px; bill() is 1.3 s
//                          tall), pure, draws nothing. From lt 4.12 on it covers the frame: { x: 960, y: 540, s: 2500,
//                          rot: 0, flap: 0 } (the hand-off to shot D).
//   bunkerCam(lt)          the shot's camera { cx, cy, zoom } (slow push toward the toast, drifting to the door).
// t = time for idles and flicker, lt = shot time 0..4.28 for the events. Both go through mt() (stop motion in card).
// Anchors: BUNKER (below). Event times: BUNKER.times.

const BKC = {
  vault: '#1F1D1E', wall: NOIR.bunker, wallDk: NOIR.bunkerDk, wallLt: NOIR.bunkerLt, deep: '#1A1819',
  rib: '#595650', ribDk: '#3A3834', ribLt: '#817C71', moss: NOIR.moss, rust: NOIR.rust,
  floor: '#252322', floorLt: '#34312E',
  steel: '#5A5D5B', steelDk: '#3A3D3C', steelLt: '#878984', brass: '#8E7A4A', brassDk: '#5A4C2E', brassLt: '#C2A96E',
  iron: '#211D1E', ironLt: '#433C3A',
  wax: '#D8CEB4', waxDk: '#A0947C', flame: NOIR.lamp, core: '#FFF5DA', warm: '#FFB45E',
  cloth: '#878072', clothDk: '#3A3631', clothLt: '#DDD6C6', clothFold: '#2E2A26', swag: '#4C2624', swagDk: '#2E1716', swagLt: '#6E3A34',
  glass: '#DCE6E6', wine: NOIR.pastGold,
  silver: '#A2A29A', silverDk: '#66665F', silverLt: '#D6D4CA',
  wood: '#33251F', woodDk: '#20171A', velvet: '#552D29', velvetDk: '#39201E',
  rack: '#2A2D30', rackLt: '#3E4246', rackDk: '#1A1C1F', grille: '#131518',
  led: '#8CF2B2', ledA: '#FFC45C', ledR: '#FF5A58', ledOff: '#1E2622',
  roast: '#8A5334', roastDk: '#5C341F', roastLt: '#B98052',
  bottle: '#1D2A23', foil: '#A8905A', ice: '#B8C4C4',
};

// Anchors (world px at zoom 1). seats: [x, y, u] = the ground point to pass a seated character (as if standing) so the
// table top (y 742) crosses him at ~5.2u: Musk sits left facing right, Zuck right facing left. grok: [x, y, u] a ground
// point behind the table's left end (the table hides his feet; y is set so his 'pour' hand clears the coupe tower).
// muse: [x, y, u] the ground point under the hovering Muse (at its default alt), beside Zuck. tower: the champagne
// tower's base on the table (Grok pours into its top coupe, rim at BUNKER.towerTop).
const BUNKER = {
  seats: { left: [780, 904, 31], right: [1140, 904, 31] },
  grok: [412, 773, 30], muse: [1338, 770, 24], tower: [605, 752], towerTop: 674,
  clink: [985, 528],
  door: [1580, 510, 166], slot: [1580, 614], lamp: [1580, 292],
  table: { top: 742, front: 772, x0: 250, x1: 1372, hem: 1012 },
  cols: [150, 570, 1350, 1810], cap: 452, floor: 790,
  bill: 96,   // the bill's width as it leaves the slot
  // shot time (lt). Beats fall at 1.28 (the clink), 1.71, 2.14, 2.57, 3.0, 3.43, 3.86, 4.28.
  times: { reveal: [0, .87], toast: [.87, 2.17], clink: 1.28, lamp: 2.14, flap: 2.3, feed: [2.4, 2.57, 2.79], release: 3.0, swoop: 3.43, cover: 4.12, len: 4.28 },
};

// ---------- helpers ----------
const bkBox = (x0, y0, x1, y1, r = 0, sp = 26) => resample(r > 0 ? rrPts(x0, y0, x1 - x0, y1 - y0, r) : [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], sp);
function bkLit(dir, fn) { const p = LIGHT.dir; LIGHT.dir = dir; fn(); LIGHT.dir = p; }
const bkToward = (x, y, lx = 960, ly = 120) => { const dx = lx - x, dy = ly - y, d = Math.hypot(dx, dy) || 1; return [dx / d, dy / d]; };
// candle flicker, ~.7..1, pure in t
const bkFlick = (t, i) => .84 + .08 * Math.sin(t * 17.3 + i * 4.1) + .05 * Math.sin(t * 31.7 + i * 1.7) + .1 * (noise(t * 3.3, i * 7.3) - .5);
const bkRing = (cx, cy, r, n = 40) => { const P = oval(cx, cy, r, r, 0, n); return P.concat([P[0]]); };
// A pointed (lancet) arch: springers at cx ± hw on the line sy, apex `rise` above it. Open polyline, left → apex → right.
function bkArch(cx, sy, hw, rise, n = 14) {
  const r = Math.max(hw, (rise * rise + hw * hw) / (2 * hw)), c = cx - hw + r, ta = Math.acos(clamp((hw - r) / r, -1, 1)), L = [], R = [];
  for (let k = 0; k <= n; k++) { const th = lerp(Math.PI, ta, k / n); L.push([c + r * Math.cos(th), sy - r * Math.sin(th)]); }
  for (let k = n - 1; k >= 0; k--) { const th = lerp(Math.PI, ta, k / n); R.push([2 * cx - (c + r * Math.cos(th)), sy - r * Math.sin(th)]); }
  return L.concat(R);
}
// The bank look's ornament (demo/bankorn.js): only in the bank look, and only when that file is loaded. The user: bank
// pieces must be elaborate, like a note's art. The hall is the note's architecture: a diaper on the vault, blind tracery
// in the side bays, beaded and jointed arch mouldings, rosette bosses, fluted shafts with foliate capitals and torus
// bases, a chancel balustrade, an engine-turned vault door on a plinth with a microprint band, a paved floor, traceried
// chair backs, banded organ pipes; paper halos behind the diners (bkHalos).
const BKB = () => STYLE.mode === 'bank' && typeof BNO !== 'undefined';
// Concrete grit (ink): pigment mottling over a big flat piece (card mottles every piece already).
function bkGrit(P, col, k = 1) { if (!STYLE.card) paint(P, { fill: mixCol(col, '#0E0C0C', .45), fillOp: 55 * k, tex: .95, bleed: .02, border: .3, ink: null }); }

// ---------- candles ----------
// A candle standing at (x, y) (its base), w wide, h tall, with a flame, a drip and a glow. i: flicker phase.
function bkCandle(x, y, w, h, t, i, key, o = {}) {
  boilSeed('bkc ' + key);
  const sw = o.sw ?? .9, top = y - h;
  piece([[x - w / 2, y], [x - w / 2, top + w * .15], [x - w * .2, top], [x + w * .25, top + w * .08], [x + w / 2, top + w * .2], [x + w / 2, y]], BKC.wax, { sw, shade: BKC.waxDk, depth: w * .35, key: key + 'w', lift: 2, flatCard: true });
  const dx = x + (hash(i * 3.1) - .5) * w * .5;
  piece(curvy([[dx - w * .12, top + w * .1], [dx + w * .12, top + w * .1], [dx + w * .1, top + h * (.25 + .3 * hash(i))], [dx, top + h * (.3 + .3 * hash(i)) + w * .1], [dx - w * .1, top + h * (.25 + .3 * hash(i))]], 3), BKC.wax, { sw: sw * .7, key: key + 'd', lift: 0, flatCard: true });
  bkFlame(x, top - 1, w * 1.05 * (o.fk ?? 1), t, i, key, o);
}
function bkFlame(x, y, s, t, i, key, o = {}) {
  const f = bkFlick(t, i), sway = Math.sin(t * 7.1 + i * 2.3) * .22 + Math.sin(t * 13.3 + i) * .1, hgt = s * 2.3 * f;
  dline([[x, y + s * .1], [x, y - s * .35]], .7, NOIR.ink);
  const P = curvy([[x + sway * s * 1.1, y - hgt], [x + s * .42, y - hgt * .42], [x + s * .38, y - s * .05], [x, y + s * .12], [x - s * .38, y - s * .05], [x - s * .42, y - hgt * .42]], 4);
  piece(P, BKC.flame, { sw: .55, ink: '#6A3414', key: key + 'f', lift: 0, flatCard: true });
  piece(curvy([[x + sway * s * .5, y - hgt * .55], [x + s * .2, y - s * .2], [x, y + s * .02], [x - s * .2, y - s * .2]], 3), BKC.core, { ink: null, key: key + 'fc', lift: 0, flatCard: true, edge: false });
  if (o.glow !== false) { glow(x, y - hgt * .45, s * 3.2 * f, BKC.flame, .9 * (o.ga ?? 1)); glow(x, y - hgt * .4, s * 9 * f, BKC.warm, .28 * (o.ga ?? 1)); }
}

// ---------- the vault and the arcade ----------
// The world rect the active camera sees (m px of margin), or null: for culling what's off screen.
function bkView(m = 80) { if (!CAM) return null; const hw = W / 2 / CAM.zoom + m, hh = H / 2 / CAM.zoom + m; return [CAM.cx - hw, CAM.cy - hh, CAM.cx + hw, CAM.cy + hh]; }
function bkVault(t, ext = [-80, -80, W + 80, H + 80], view = null) {   // (ext: the wall and floor's extent, for a wider frame; view: only
  // what's inside this rect is printed (bkView): the big wall, floor and diaper pieces cost by their area)
  const { cols, cap, floor } = BUNKER, bays = [[-270, 150, 300], [150, 570, 300], [570, 1350, 410], [1350, 1810, 312], [1810, 2230, 300]];
  const [ex0, ey0, ex1, ey1] = view ? [Math.max(ext[0], view[0]), Math.max(ext[1], view[1]), Math.min(ext[2], view[2]), Math.min(ext[3], view[3])] : ext;
  boilSeed('bk vault');
  const all = bkBox(ex0, ey0, ex1, ey1, 0, 200);
  piece(all, BKC.vault, { ink: null, key: 'bkvault', lift: 0 });
  bkGrit(all, BKC.vault, .8);
  if (BKB()) { boilSeed('bk diaper'); BNO.diaper(bkBox(ex0, ey0, ex1, cap + 20, 0, 200), 62, { sw: .42 }); }
  // vault webbing: an outer rib over each bay (the wall rib), the webbing between it and the arch darker
  bays.forEach(([x0, x1, rise], b) => {
    const cx = (x0 + x1) / 2, hw = (x1 - x0) / 2;
    boilSeed('bk web' + b);
    const outer = bkArch(cx, cap, hw + 10, rise + 120), inner = bkArch(cx, cap, hw - 26, rise + 58);
    piece(outer.concat(inner.slice().reverse()), '#262424', { ink: null, key: 'bkweb' + b, lift: 0 });
    const rib = bkArch(cx, cap, hw + 10, rise + 120), ribIn = bkArch(cx, cap, hw - 12, rise + 96);
    bkLit(bkToward(cx, cap - rise), () => piece(rib.concat(ribIn.slice().reverse()), BKC.ribDk, { sw: 1.2, shade: '#2C2A27', depth: 6, key: 'bkwrib' + b, lift: 3 }));
  });
  // the niches (the wall inside each arch), then the arch mouldings
  bays.forEach(([x0, x1, rise], b) => {
    const cx = (x0 + x1) / 2, hw = (x1 - x0) / 2 - 32, A = bkArch(cx, cap, hw, rise), P = A.concat([[cx + hw, floor + 10], [cx - hw, floor + 10]]);
    boilSeed('bk niche' + b);
    const col = b === 2 ? BKC.deep : BKC.wall;
    piece(P, col, { sw: 1.2, key: 'bkniche' + b, lift: 0 });
    bkGrit(P, col, b === 2 ? .6 : 1);
    if (b !== 2 && BKB()) { boilSeed('bk tracery' + b); BNO.tracery(cx, cap, hw * .86, rise * .92, floor - 30, { sw: .6 }); }   // (bank: blind tracery)
    else if (b !== 2) {   // board-formed concrete: faint horizontal pour lines and tie holes
      for (let y = cap - rise + 40; y < floor; y += 38) {
        const half = y < cap ? hw * Math.sqrt(clamp((y - (cap - rise)) / rise)) * .95 : hw;
        if (half < 30) continue;
        dline([[cx - half + 8, y], [cx + half - 8, y + (hash(y + b) - .5) * 3]], .5, mixCol(BKC.wall, BKC.wallDk, .7));
      }
      for (let y = cap - rise + 78; y < floor - 20; y += 76) for (let x = cx - hw + 40; x < cx + hw - 20; x += 72) {
        const half = y < cap ? hw * Math.sqrt(clamp((y - (cap - rise)) / rise)) : hw; if (Math.abs(x - cx) > half - 24) continue;
        piece(oval(x, y, 3, 3, 0, 8), BKC.wallDk, { ink: null, key: 'bkth' + x + y, lift: 0, flatCard: true, edge: false });
      }
    }
    const out = bkArch(cx, cap, hw + 32, rise + 40), inn = bkArch(cx, cap, hw, rise);
    boilSeed('bk arch' + b);
    bkLit(bkToward(cx, cap - rise * .6), () => piece(out.concat(inn.slice().reverse()), BKC.rib, { sw: 1.5, shade: BKC.ribDk, depth: 10, key: 'bkarch' + b, lift: 4 }));
    dline(bkArch(cx, cap, hw + 13, rise + 16), .6, BKC.ribDk);
    if (BKB()) { BNO.beadsAlong(bkArch(cx, cap, hw + 6, rise + 7, 24), 3.4, { sw: .4 }); BNO.joints(bkArch(cx, cap, hw + 32, rise + 40, 30), 13, 34, { sw: .4 }); dline(bkArch(cx, cap, hw + 24, rise + 29), .35, BKC.ribDk); }
    // a carved boss where the moulding meets itself
    const ay = cap - rise - 20;
    piece(curvy([[cx, ay - 16], [cx + 14, ay - 4], [cx + 10, ay + 14], [cx - 10, ay + 14], [cx - 14, ay - 4]], 3), BKC.ribLt, { sw: 1.1, shade: BKC.rib, depth: 6, key: 'bkboss' + b, lift: 3, flatCard: true });
    piece(oval(cx, ay + 1, 5, 5, 0, 10), BKC.ribDk, { ink: null, key: 'bkboss2' + b, lift: 0, flatCard: true, edge: false });
    if (BKB()) guilloche(cx, ay, 3, 13, { n: 6, lobes: 8, w: .35, col: BNO.ink(.8), steps: 120 });
  });
  // cobwebs in the corners where the arches spring
  [[570 + 34, cap - 6, 1, 80], [1810 - 34, cap - 6, -1, 70], [150 + 34, cap - 6, 1, 64]].forEach(([wx, wy, d, r], i) => {
    boilSeed('bk web' + i);
    const col = '#77736A', spokes = [];
    for (let k = 0; k <= 4; k++) { const a = -Math.PI / 2 - d * k / 4 * Math.PI / 2 * .9; spokes.push([Math.cos(a) * r * (k % 2 ? .95 : 1), Math.sin(a) * r * (k % 2 ? .9 : 1)]); }
    for (const [sx0, sy0] of spokes) dline([[wx, wy], [wx + sx0, wy + sy0]], .45, col);
    for (const f of [.35, .6, .85]) dline(spokes.map(([sx0, sy0], k) => { const m = k ? .92 : 1; return [wx + sx0 * f * m, wy + sy0 * f * m]; }), .45, col, .5);
  });
  // floor
  boilSeed('bk floor');
  const F = bkBox(ex0, floor, ex1, ey1, 0, 160);
  piece(F, BKC.floor, { sw: 1.4, key: 'bkfloor', lift: 0 });
  bkGrit(F, BKC.floor, 1);
  if (BKB()) {   // paving in perspective, a border band along the wall
    const Bf = BNO.batch(), V = [960, 330], y1 = ext[3];   // (the paving's geometry from the whole extent, so culling doesn't move it)
    for (let i = -24; i <= 24; i++) { const xb = 960 + i * 110, u = (floor + 14 - V[1]) / (y1 - V[1]); Bf.line([[V[0] + (xb - V[0]) * u, floor + 14], [xb, y1]], .45); }
    for (let j = 0; j < 7; j++) { const y = floor + 14 + (y1 - floor - 14) * (1 - 1 / (1 + j * .3)); Bf.line([[ex0, y], [ex1, y]], .45); }
    Bf.line([[ex0, floor + 4], [ex1, floor + 4]], .6); Bf.line([[ex0, floor + 12], [ex1, floor + 12]], .35);
    Bf.draw();
  } else for (let i = 0; i < 5; i++) dline([[-40, floor + 28 + i * i * 14], [W + 40, floor + 28 + i * i * 14]], .6, '#1A1818');
  // columns: a clustered shaft, capital, abacus and base
  cols.forEach((x, i) => {
    boilSeed('bk col' + i);
    bkLit(bkToward(x, 500), () => {
      for (const s of [-1, 1]) piece(bkBox(x + s * 22 - 8, cap + 30, x + s * 22 + 8, floor - 34, 4), BKC.ribDk, { sw: 1.1, key: 'bkcs' + i + s, lift: 3 });
      piece(bkBox(x - 17, cap + 26, x + 17, floor - 30, 6), BKC.rib, { sw: 1.4, shade: BKC.ribDk, depth: 12, key: 'bkcol' + i, lift: 4 });
      piece(curvy([[x - 30, cap + 2], [x + 30, cap + 2], [x + 20, cap + 34], [x - 20, cap + 34]], 3), BKC.rib, { sw: 1.3, shade: BKC.ribDk, depth: 8, key: 'bkcap' + i, lift: 4 });
      piece(bkBox(x - 42, cap - 10, x + 42, cap + 4, 3, 20), BKC.ribLt, { sw: 1.3, key: 'bkab' + i, lift: 4 });
      piece(bkBox(x - 36, floor - 38, x + 36, floor + 4, 5, 20), BKC.rib, { sw: 1.3, shade: BKC.ribDk, depth: 10, key: 'bkbase' + i, lift: 4 });
      dline([[x - 34, floor - 24], [x + 34, floor - 24]], .6, BKC.ribDk);
      if (BKB()) {
        BNO.flutes(x - 17, x + 17, cap + 38, floor - 36, 5, { sw: .45 });
        BNO.capital(x - 30, x + 30, cap + 2, cap + 34, { key: 'bkcapo' + i, sw: .6 });
        BNO.dentils(x - 40, x + 40, cap - 8, 7, { sw: .35, gap: 7 });
        BNO.torus(x - 36, x + 36, floor - 30, 11, { sw: .45 });
      }
    });
    // the vault shaft rising above the capital into the dark
    boilSeed('bk shaft' + i);
    piece(ribbon([[x, cap - 8], [x + (x - 960) * .02, cap - 180], [x + (x - 960) * .06, -60]], 20, 34), BKC.ribDk, { sw: 1.2, key: 'bksh' + i, lift: 3 });
  });
}

// ---------- stains, cracks and drips (grit) ----------
function bkGrime(t) {
  // water stains weeping down from the vault: darker than what they stain (a light wash over dark paint mixes blue)
  const S = [[262, 200, 26, 360, 'moss'], [468, 250, 16, 250, 'rust'], [1452, 250, 20, 200, 'moss'], [1745, 230, 18, 320, 'soot'], [60, 300, 30, 420, 'soot'], [1878, 300, 26, 380, 'moss'], [150, 520, 12, 220, 'rust'], [1350, 520, 10, 200, 'moss']];
  const SC = { moss: '#262A1F', rust: '#3A2319', soot: '#121012' };
  S.forEach(([x, y, w, h, c], i) => {
    boilSeed('bk stain' + i);
    const col = SC[c], P = [];
    for (let k = 0; k <= 8; k++) { const f = k / 8; P.push([x - w * (.3 + .7 * Math.sin(f * Math.PI * .85)) * (1 + .3 * (hash(i * 9 + k) - .5)), y + f * h]); }
    for (let k = 8; k >= 0; k--) { const f = k / 8; P.push([x + w * (.3 + .7 * Math.sin(f * Math.PI * .85)) * (1 + .3 * (hash(i * 7 + k) - .5)) * .8, y + f * h * (1 - .1 * hash(i + k))]); }
    piece(curvy(P, 3), col, { ink: null, op: 60, key: 'bkst' + i, lift: 0, flatCard: true, edge: false });
  });
  const C = [[[300, 520], [322, 560], [312, 604], [340, 650]], [[1455, 380], [1440, 420], [1462, 452]], [[900, 90], [920, 130], [906, 170]], [[1720, 700], [1745, 730], [1738, 770]], [[520, 330], [540, 362], [532, 400], [552, 430]], [[1880, 520], [1860, 560], [1875, 600]]];
  C.forEach((P, i) => { boilSeed('bk crack' + i); dline(P, .8, NOIR.ink); dline([P[1], [P[1][0] + 16, P[1][1] + 10]], .5, NOIR.ink); });
}
// A drip falling from the vault every `per` s at x, from y0 to the floor (y1), with a ripple where it lands.
function bkDrip(t, x, y0, y1, per, ph, key) {
  const a = frac(t / per + ph) * per, fall = .42, k = a / fall;
  boilSeed('bk drip' + key);
  if (a < .35) { const g = seg(a, 0, .35); piece(curvy([[x, y0], [x + 3 * g, y0 + 6 + 8 * g], [x, y0 + 10 + 10 * g], [x - 3 * g, y0 + 6 + 8 * g]], 3), BKC.ice, { sw: .5, op: 200, key: 'bkdh' + key, lift: 0, flatCard: true }); }
  const b = a - .35;
  if (b > 0 && b < fall) { const y = lerp(y0 + 14, y1, (b / fall) ** 2); piece(curvy([[x, y - 16], [x + 3, y - 2], [x, y + 3], [x - 3, y - 2]], 3), BKC.ice, { sw: .5, op: 220, key: 'bkdd' + key, lift: 0, flatCard: true }); }
  const c = b - fall;
  if (c > 0 && c < .6) { const r = 6 + 40 * easeOut(c / .6); dline(oval(x, y1, r, r * .22, 0, 20).concat([[x + r, y1]]), .7 * (1 - c / .6) + .2, mixCol(BKC.ice, BKC.floor, .3 + c)); }
}

// ---------- the organ: server racks as pipes ----------
function bkOrgan(t) {
  const cx = 960, n = 11, gap = 63, w = 50;
  for (let i = 0; i < n; i++) {
    const d = Math.abs(i - 5) / 5, x = cx + (i - 5) * gap, top = 176 + Math.pow(d, 1.3) * 232, mouth = 468 - (1 - d) * 40, bot = 800;
    boilSeed('bk rack' + i);
    bkLit(bkToward(x, top + 150, 960, 60), () => piece(bkBox(x - w / 2, top, x + w / 2, bot, 5, 30), BKC.rack, { sw: 1.3, shade: BKC.rackDk, depth: 14, key: 'bkrack' + i, lift: 3 }));
    piece(bkBox(x - w / 2 - 5, top - 9, x + w / 2 + 5, top + 5, 3, 14), BKC.rackLt, { sw: 1.1, key: 'bkrcap' + i, lift: 2 });
    piece(curvy([[x, top - 30], [x + 6, top - 12], [x, top - 8], [x - 6, top - 12]], 3), BKC.rackLt, { sw: .9, key: 'bkrfin' + i, lift: 2, flatCard: true });
    // the pipe mouth: a pointed lip over a dark slot, then the vented foot
    const mw = w * .32;
    piece(curvy([[x - mw, mouth + 10], [x - mw * .5, mouth - 1], [x, mouth - 9], [x + mw * .5, mouth - 1], [x + mw, mouth + 10], [x, mouth + 13]], 3), BKC.rackLt, { sw: .8, key: 'bklip' + i, lift: 1, flatCard: true });
    piece(curvy([[x - mw * .78, mouth + 9], [x, mouth + 2], [x + mw * .78, mouth + 9], [x, mouth + 14]], 3), BKC.grille, { ink: null, key: 'bkmouth' + i, lift: 0, flatCard: true, edge: false });
    for (let k = 0; k < 3; k++) dline([[x - mw + 4, mouth + 24 + k * 7], [x + mw - 4, mouth + 24 + k * 7]], .45, '#16181B');
    // units and status lights up the pipe
    for (let y = top + 34; y < mouth - 26; y += 44) dline([[x - w / 2 + 5, y], [x + w / 2 - 5, y]], .45, BKC.rackLt);
    if (BKB()) { const Bp = BNO.batch(); for (const y of [top + 12, mouth - 34]) { Bp.line([[x - w / 2, y], [x + w / 2, y]], .5); Bp.line([[x - w / 2, y + 5], [x + w / 2, y + 5]], .35); for (let k = 0; k < 5; k++) Bp.line(BNO.ring(x - w * .36 + k * w * .18, y + 2.5, 1.6, 1.6, 8), .3); } for (const d of [-1, 1]) Bp.line([[x + d * (w / 2 - 4), top + 20], [x + d * (w / 2 - 4), mouth - 38]], .3); Bp.draw(); }
    let r = 0;
    for (let y = top + 22; y < mouth - 18; y += 15, r++) for (let c = 0; c < 2; c++) {
      const id = i * 97.3 + r * 13.1 + c * 5.7, rate = 1 + 5 * hash(id + .3), on = hash(id + Math.floor(t * rate + hash(id + .7) * 9)) > .42;
      const kind = hash(id + .9), col = kind < .72 ? BKC.led : kind < .94 ? BKC.ledA : BKC.ledR, lx = x - w * .22 + c * w * .44;
      piece(oval(lx, y, 2.6, 2.2, 0, 8), on ? col : BKC.ledOff, { ink: null, key: 'bkled' + id, lift: 0, flatCard: true, edge: false });
      if (on && hash(id + 1.3) > .55) glow(lx, y, 11, col, .55);
    }
  }
  // cables sagging between the pipe tops, like garlands
  for (let i = 0; i < n - 1; i++) {
    if (i === 4 || i === 5) continue;
    const d0 = Math.abs(i - 5) / 5, d1 = Math.abs(i - 4) / 5, x0 = cx + (i - 5) * gap, x1 = x0 + gap;
    const y0 = 176 + Math.pow(d0, 1.3) * 232 + 30, y1 = 176 + Math.pow(d1, 1.3) * 232 + 30;
    boilSeed('bk cable' + i);
    dline([[x0 + 18, y0], [(x0 + x1) / 2, Math.max(y0, y1) + 34 + 10 * hash(i)], [x1 - 18, y1]], 1.3, '#101214', .5);
  }
}

// ---------- iron: candelabra and chandelier ----------
// A floor candelabra standing at (x, y), about 14.5 s tall; five candles on S-curved arms.
function bkCandelabra(x, y, s, t, key, o = {}) {
  const sw = o.sw ?? 1.3, iron = o.iron || BKC.iron, crown = y - 13 * s;
  boilSeed('bk cdb ' + key);
  for (const d of [-1, 0, 1]) piece(ribbon([[x, y - 1.6 * s], [x + d * 1.1 * s, y - .6 * s], [x + d * 1.6 * s, y - .1 * s]], .45 * s, .3 * s), iron, { sw, key: key + 'leg' + d, lift: 4 });
  piece(curvy([[x - .9 * s, y - 1.2 * s], [x, y - 2.3 * s], [x + .9 * s, y - 1.2 * s], [x, y - .9 * s]], 4), iron, { sw, key: key + 'foot', lift: 4 });
  piece(ribbon([[x, y - 2 * s], [x, (y + crown) / 2], [x, crown + .5 * s]], .34 * s, .3 * s), iron, { sw, rim: o.rim, key: key + 'stem', lift: 4 });
  for (const k of [.3, .55, .8]) piece(oval(x, lerp(y - 2 * s, crown, k), .5 * s, .3 * s, 0, 14), iron, { sw: sw * .8, key: key + 'knop' + k, lift: 3, flatCard: true });
  const cups = [[-3.1, -1.1], [-1.6, -1.9], [0, -2.5], [1.6, -1.9], [3.1, -1.1]];
  for (const [ax, ay] of cups) if (ax) piece(ribbon([[x, crown + .3 * s], [x + ax * .55 * s, crown + .9 * s], [x + ax * s, crown + ay * s * .45]], .26 * s, .22 * s), iron, { sw: sw * .9, key: key + 'arm' + ax, lift: 3 });
  // gothic spikes between the cups
  for (const ax of [-2.35, -.8, .8, 2.35]) piece([[x + ax * s - .12 * s, crown - .2 * s], [x + ax * s, crown - 1.5 * s], [x + ax * s + .12 * s, crown - .2 * s]], iron, { sw: sw * .7, key: key + 'sp' + ax, lift: 2, flatCard: true });
  cups.forEach(([ax, ay], i) => {
    const cx = x + ax * s, cy = crown + ay * s * .45 - (ax ? 0 : .3 * s);
    piece(curvy([[cx - .55 * s, cy - .25 * s], [cx + .55 * s, cy - .25 * s], [cx + .3 * s, cy + .15 * s], [cx - .3 * s, cy + .15 * s]], 2), iron, { sw: sw * .8, key: key + 'cup' + i, lift: 3, flatCard: true });
    bkCandle(cx, cy - .22 * s, .44 * s, (1.3 + .6 * hash(i + key.length)) * s, t, i + 3 * key.length, key + 'c' + i, { ga: o.ga, sw: sw * .7 });
  });
}
// The ring chandelier hanging from the vault over the table.
function bkChandelier(t) {
  const x = 960, y = 118, rx = 176, sw = 1.3;
  boilSeed('bk chandelier');
  for (let k = 0; k < 7; k++) piece(oval(x, -30 + k * 11, 3.2, 6, 0, 10), BKC.iron, { sw: .8, key: 'bkch' + k, lift: 2, flatCard: true });
  piece(oval(x, 52, 9, 9, 0, 14), BKC.iron, { sw: .9, key: 'bkchhub', lift: 2, flatCard: true });
  for (const d of [-1, 0, 1]) dline([[x, 56], [x + d * rx * .92, y - 6]], 1.1, BKC.iron, 0);
  // the hoop: a band that sags a little in the middle, with pendant spikes under it
  const top = [], bot = [];
  for (let k = 0; k <= 12; k++) { const f = k / 12, xx = x - rx + f * 2 * rx, sag = Math.sin(f * Math.PI) * 10; top.push([xx, y - 5 + sag]); bot.push([xx, y + 9 + sag]); }
  for (let k = 0; k < 9; k++) { const f = (k + .5) / 9, xx = x - rx + f * 2 * rx, sag = Math.sin(f * Math.PI) * 10; piece([[xx - 7, y + 7 + sag], [xx, y + 26 + sag], [xx + 7, y + 7 + sag]], BKC.iron, { sw: .8, key: 'bkchp' + k, lift: 2, flatCard: true }); }
  piece(top.concat(bot.reverse()), BKC.iron, { sw, rim: BKC.ironLt, key: 'bkhoop', lift: 3 });
  for (let k = 0; k < 7; k++) {
    const f = (k + .5) / 7, xx = x - rx + f * 2 * rx + (k - 3) * 2, sag = Math.sin(f * Math.PI) * 10, h = 26 + 10 * hash(k + 40);
    piece(curvy([[xx - 10, y - 8 + sag], [xx + 10, y - 8 + sag], [xx + 6, y - 2 + sag], [xx - 6, y - 2 + sag]], 2), BKC.iron, { sw: .8, key: 'bkchc' + k, lift: 2, flatCard: true });
    bkCandle(xx, y - 8 + sag, 9, h, t, k + 20, 'bkchk' + k, { ga: .9 });
  }
}

// ---------- the chairs: high gothic backs behind the diners ----------
function bkChair(x, y, u, face, key) {
  const bx = x - face * .7 * u, top = y - 17.3 * u, bot = y - 4.6 * u, hw = 2.75 * u, sw = 1.4;
  boilSeed('bk chair ' + key);
  bkLit(bkToward(bx, top, 960, 120), () => {
    const back = bkArch(bx, top + 3.6 * u, hw, 3.1 * u, 10).concat([[bx + hw, bot], [bx - hw, bot]]);
    piece(back, BKC.wood, { sw: sw * 1.1, shade: BKC.woodDk, depth: .6 * u, key: key + 'back', lift: 5 });
    const pan = bkArch(bx, top + 4 * u, hw - .55 * u, 2.4 * u, 10).concat([[bx + hw - .55 * u, bot], [bx - hw + .55 * u, bot]]);
    piece(pan, BKC.velvet, { sw: sw * .8, shade: BKC.velvetDk, depth: .5 * u, key: key + 'pan', lift: 2 });
    for (let k = 0; k < 4; k++) { const yy = top + (5.2 + k * 2.1) * u; piece(oval(bx, yy, .22 * u, .22 * u, 0, 10), BKC.brassDk, { sw: sw * .5, key: key + 'bt' + k, lift: 1, flatCard: true }); }
    for (const s of [-1, 1]) {
      piece(bkBox(bx + s * hw - .38 * u, top + 2.2 * u, bx + s * hw + .38 * u, bot, 4, 30), BKC.wood, { sw, shade: BKC.woodDk, depth: .25 * u, key: key + 'post' + s, lift: 5 });
      piece(curvy([[bx + s * hw, top + .6 * u], [bx + s * hw + .42 * u, top + 1.7 * u], [bx + s * hw + .3 * u, top + 2.3 * u], [bx + s * hw - .3 * u, top + 2.3 * u], [bx + s * hw - .42 * u, top + 1.7 * u]], 3), BKC.wood, { sw, key: key + 'fin' + s, lift: 5 });
    }
    piece(curvy([[bx, top - .6 * u], [bx + .45 * u, top + .5 * u], [bx, top + .9 * u], [bx - .45 * u, top + .5 * u]], 3), BKC.wood, { sw, key: key + 'crest', lift: 5 });
    if (BKB()) {
      BNO.beadsAlong(bkArch(bx, top + 3.6 * u, hw - .28 * u, 2.8 * u, 16), .13 * u, { sw: .35 });
      const Bc = BNO.batch(), ty = top + 3.5 * u, r = .5 * u;
      for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + k / 3 * TAU; Bc.line(BNO.ring(bx + Math.cos(a) * r * .8, ty + Math.sin(a) * r * .8, r * .6, r * .6, 14), .4); }
      Bc.line(BNO.ring(bx, ty, r * 1.7, r * 1.7, 24), .45); Bc.draw();
      guilloche(bx, top + .15 * u, .08 * u, .36 * u, { n: 5, lobes: 6, w: .3, col: BNO.ink(.8), steps: 90 });
    }
  });
}

// ---------- the vault door and its slot ----------
// Slot event state at shot time lt: lamp (0..1 red), flap (0 shut .. 1 = 90° .. 1.2 flipped up), fed (0..1 how far the
// bill has come out), free (the bill has dropped out of the slot).
function bkSlot(lt) {
  const T_ = BUNKER.times, [f1, f2, f3] = T_.feed;
  const lampOn = seg(lt, T_.lamp, T_.lamp + .06) * (1 - seg(lt, T_.release + .6, T_.release + 1));
  const lamp = lampOn * (.55 + .45 * Math.cos((lt - T_.lamp) * TAU * BPM / 60 * 2));
  let flap = 0;
  if (lt > T_.lamp && lt < T_.flap) flap = .12 * Math.abs(Math.sin((lt - T_.lamp) * 55)) * seg(lt, T_.lamp, T_.lamp + .05);
  if (lt >= T_.flap) flap = 1.2 * backOut(seg(lt, T_.flap, T_.flap + .12));
  if (lt >= T_.release + .1) flap = 1.2 * (1 - easeIn(seg(lt, T_.release + .1, T_.release + .2))) + (lt > T_.release + .2 ? .1 * Math.abs(spring(lt, T_.release + .2, 9, 40)) : 0);
  const fed = clamp(.08 * seg(lt, f1 - .08, f1) + .3 * backOut(seg(lt, f1, f1 + .1)) + .3 * backOut(seg(lt, f2, f2 + .1)) + .32 * backOut(seg(lt, f3, f3 + .1)), 0, 1.06);
  return { lamp, flap, fed, free: lt >= T_.release };
}
function bkDoor(t, lt) {
  const [cx, cy, R] = BUNKER.door, [sx, sy] = BUNKER.slot, S = bkSlot(lt), sw = 1.6, dir = bkToward(cx, cy);
  // a stepped concrete plinth, then the steel frame ring set into the wall
  boilSeed('bk door sill');
  piece(bkBox(cx - 172, cy + R + 44, cx + 172, BUNKER.floor + 6, 4, 30), BKC.ribDk, { sw: 1.4, shade: '#2C2A27', depth: 10, key: 'bkdsill2', lift: 4 });
  piece(bkBox(cx - 128, cy + R + 10, cx + 128, cy + R + 48, 4, 30), BKC.rib, { sw: 1.4, shade: BKC.ribDk, depth: 8, key: 'bkdsill', lift: 4 });
  dline([[cx + 60, cy + R + 50], [cx + 78, cy + R + 70], [cx + 70, cy + R + 96]], .7, NOIR.ink);
  if (BKB()) { BNO.microBand(cx - 112, cx + 112, cy + R + 29, 14, { rows: 2, seed: 5 }); BNO.eggDart(cx - 160, cx + 160, cy + R + 56, 12, { sw: .4 }); }
  boilSeed('bk door ring');
  bkLit(dir, () => piece(oval(cx, cy, R + 26, R + 26, 0, 72), BKC.steelDk, { sw: sw * 1.1, shade: '#2A2C2B', depth: 10, key: 'bkdring', lift: 5 }));
  for (let k = 0; k < 24; k++) { const a = k / 24 * TAU; piece(oval(cx + Math.cos(a) * (R + 13), cy + Math.sin(a) * (R + 13), 4.2, 4.2, 0, 10), BKC.steelLt, { sw: .7, key: 'bkdb' + k, lift: 1, flatCard: true }); }
  // hinges on the left
  for (const hy of [-.55, .55]) {
    const hy0 = cy + hy * R;
    piece(bkBox(cx - R - 40, hy0 - 24, cx - R + 34, hy0 + 24, 6, 20), BKC.steelDk, { sw: 1.3, shade: '#2A2C2B', depth: 8, key: 'bkdh' + hy, lift: 4 });
    piece(bkBox(cx - R - 54, hy0 - 34, cx - R - 30, hy0 + 34, 10, 16), BKC.steel, { sw: 1.3, shade: BKC.steelDk, depth: 8, key: 'bkdk' + hy, lift: 4 });
    for (const d of [-12, 12]) dline([[cx - R - 53, hy0 + d], [cx - R - 31, hy0 + d]], .7, BKC.steelDk);
    for (const d of [-12, 12]) piece(oval(cx - R + 16, hy0 + d, 4, 4, 0, 10), BKC.steelLt, { sw: .6, key: 'bkdhb' + hy + d, lift: 1, flatCard: true });
  }
  // the door
  boilSeed('bk door');
  const D = oval(cx, cy, R, R, 0, 72);
  bkLit(dir, () => piece(D, BKC.steel, { sw: sw * 1.2, shade: BKC.steelDk, depth: 34, rim: BKC.steelLt, key: 'bkdoor', lift: 7 }));
  bkGrit(D, BKC.steel, .7);
  dline(bkRing(cx, cy, R * .8, 60), 1, BKC.steelDk);
  dline(bkRing(cx, cy, R * .77, 60), .6, BKC.steelLt);
  if (BKB()) {   // engine-turned steel: a lathe rosette over the face, a dial of ticks in the band, a rope round the ring
    boilSeed('bk door lathe');
    guilloche(cx, cy, R * .3, R * .74, { n: 5, lobes: 18, w: .4, col: BNO.ink(.8), steps: 360, twist: .5, beat: 3 });
    const Bd = BNO.batch();
    for (let k = 0; k < 120; k++) { const a = k / 120 * TAU, l = k % 10 ? R * .035 : R * .07; Bd.line([[cx + Math.cos(a) * R * .83, cy + Math.sin(a) * R * .83], [cx + Math.cos(a) * (R * .83 + l), cy + Math.sin(a) * (R * .83 + l)]], k % 10 ? .35 : .6); }
    for (let k = 0; k < 90; k++) { const a = k / 90 * TAU, r1 = R + 26 + 4; Bd.line([[cx + Math.cos(a) * r1, cy + Math.sin(a) * r1], [cx + Math.cos(a + .05) * (r1 + 5), cy + Math.sin(a + .05) * (r1 + 5)]], .4); }
    Bd.draw();
  }
  for (let k = 0; k < 16; k++) { const a = (k + .5) / 16 * TAU; piece(oval(cx + Math.cos(a) * R * .9, cy + Math.sin(a) * R * .9, 5, 5, 0, 10), BKC.steelDk, { sw: .7, key: 'bkdr' + k, lift: 1, flatCard: true }); }
  // rust weeping from the rivets
  for (const k of [3, 6, 11]) { const a = (k + .5) / 16 * TAU, rx = cx + Math.cos(a) * R * .9, ry = cy + Math.sin(a) * R * .9; piece(curvy([[rx - 3, ry + 4], [rx + 3, ry + 4], [rx + 2, ry + 40 + 20 * hash(k)], [rx - 1, ry + 46 + 20 * hash(k)]], 2), BKC.rust, { ink: null, op: 120, key: 'bkdrs' + k, lift: 0, flatCard: true, edge: false }); }
  // the wheel: rim, spokes with knobs, hub
  boilSeed('bk wheel');
  const wy = cy - 18, wr = 66;
  for (let k = 0; k < 6; k++) {
    const a = k / 6 * TAU + .26, ex = cx + Math.cos(a) * (wr + 22), ey = wy + Math.sin(a) * (wr + 22);
    piece(ribbon([[cx + Math.cos(a) * 14, wy + Math.sin(a) * 14], [ex, ey]], 9, 8), BKC.steelLt, { sw: 1.1, key: 'bkspk' + k, lift: 3 });
    piece(oval(ex, ey, 9, 9, 0, 12), BKC.steelLt, { sw: 1.1, shade: BKC.steel, depth: 4, key: 'bkknob' + k, lift: 3, flatCard: true });
  }
  const rimO = oval(cx, wy, wr + 7, wr + 7, 0, 48), rimI = oval(cx, wy, wr - 7, wr - 7, 0, 48);
  piece(rimO.concat([rimO[0]], rimI.slice().reverse(), [rimI[rimI.length - 1]]), BKC.steelLt, { sw: 1.2, shade: BKC.steel, depth: 5, key: 'bkwrim', lift: 3 });
  piece(oval(cx, wy, 20, 20, 0, 20), BKC.steelLt, { sw: 1.2, shade: BKC.steel, depth: 6, key: 'bkhub', lift: 3 });
  piece(oval(cx, wy, 7, 7, 0, 12), BKC.steelDk, { sw: .8, key: 'bkhub2', lift: 1, flatCard: true });
  // the letterbox: a brass plate, the dark slot, the flap
  boilSeed('bk slot');
  piece(bkBox(sx - 76, sy - 22, sx + 76, sy + 22, 7, 20), BKC.brass, { sw: 1.3, shade: BKC.brassDk, depth: 8, key: 'bkplate', lift: 3 });
  for (const [px, py] of [[-66, -13], [66, -13], [-66, 13], [66, 13]]) piece(oval(sx + px, sy + py, 3, 3, 0, 8), BKC.brassDk, { ink: null, key: 'bkpr' + px + py, lift: 0, flatCard: true, edge: false });
  piece(bkBox(sx - 62, sy - 6, sx + 62, sy + 7, 3, 20), NOIR.ink, { sw: .9, key: 'bkslot', lift: 0, flatCard: true });
  if (S.flap > .15) glow(sx, sy, 60 + 30 * S.lamp, NOIR.red, .5 * clamp(S.flap));
  // the flap bangs open: a puff of dust out of the slot
  const pa = lt - BUNKER.times.flap;
  if (pa > 0 && pa < .45) for (let k = 0; k < 7; k++) {
    const a = Math.PI * (.1 + .8 * k / 6), d = 18 + 70 * easeOut(pa / .45) * (.6 + .4 * hash(k + 3)), r = (5 + 5 * hash(k)) * (1 - pa / .45 * .6);
    piece(oval(sx + Math.cos(a) * d * 1.3, sy + 8 + Math.sin(a) * d * .5 - 20 * pa, r, r * .85, 0, 12), mixCol('#8A8478', BKC.steel, pa / .45), { sw: .6, key: 'bkpuff' + k, lift: 1, flatCard: true });
  }
  // the bill, feeding out: its top edge held in the slot, drooping down toward us as it comes (a vertical squash)
  if (!S.free && S.fed > .01) {
    const s = BUNKER.bill, h = s * 1.3, k = S.fed, sway = Math.sin(lt * 9) * .03 * seg(lt, BUNKER.times.feed[2] + .1, BUNKER.times.release);
    push(); translate(sx, sy - 2); rotate(sway); scale(1, k); bill(0, h / 2, s, 0, 0, .25 * (1 - k) + .15 * Math.sin(lt * 7), 'bkbill'); pop();
  }
  // the flap: hinged along the slot's top edge; as it swings up toward us we see it shorten, then its underside
  boilSeed('bk flap');
  const fh = 22, ang = S.flap * Math.PI / 2, c = Math.cos(ang), fy = sy - 8;
  if (c > .02) piece(bkBox(sx - 66, fy, sx + 66, fy + fh * c, 4, 20), mixCol(BKC.brassLt, BKC.brass, 1 - c), { sw: 1.1, key: 'bkflap', lift: 2, flatCard: true });
  else if (c < -.02) piece(bkBox(sx - 66, fy + fh * c, sx + 66, fy, 4, 20), BKC.brassDk, { sw: 1.1, key: 'bkflapu', lift: 2, flatCard: true });
  if (c > .5) dline([[sx - 50, fy + fh * c * .55], [sx + 50, fy + fh * c * .55]], .6, BKC.brassDk);
  // two red telltales on the plate, blinking with the lamp
  boilSeed('bk telltales');
  for (const d of [-1, 1]) {
    piece(oval(sx + d * 90, sy, 6, 6, 0, 12), S.lamp > .05 ? mixCol('#5A2424', '#FF7A66', S.lamp) : '#3A2020', { sw: .8, key: 'bktell' + d, lift: 1, flatCard: true });
    if (S.lamp > .05) glow(sx + d * 90, sy, 22, NOIR.red, S.lamp);
  }
  // the red alarm lamp in its iron cage above the door
  boilSeed('bk lamp');
  const [lx, ly] = BUNKER.lamp;
  piece(bkBox(lx - 9, ly - 40, lx + 9, ly - 14, 3, 10), BKC.iron, { sw: 1, key: 'bklb', lift: 2, flatCard: true });
  piece(curvy([[lx - 20, ly - 16], [lx + 20, ly - 16], [lx + 17, ly - 8], [lx - 17, ly - 8]], 2), BKC.ironLt, { sw: 1, key: 'bklb2', lift: 2, flatCard: true });
  piece(oval(lx, ly + 6, 20, 23, 0, 24), S.lamp > .05 ? mixCol('#6A2A2A', '#FF6A5A', S.lamp) : '#4A2626', { sw: 1.1, key: 'bkbulb', lift: 2, flatCard: true });
  piece(oval(lx - 7, ly - 2, 5, 7, -.4, 12), S.lamp > .05 ? '#FFD0C4' : '#7A4A44', { ink: null, key: 'bkbulbhl', lift: 0, flatCard: true, edge: false });
  if (S.lamp > .05) { glow(lx, ly + 6, 70, NOIR.red, S.lamp); glow(lx, ly + 60, 300, NOIR.red, .42 * S.lamp); }
  for (const d of [-1, -.35, .35, 1]) dline([[lx + d * 12, ly - 12], [lx + d * 25, ly + 8], [lx + d * 12, ly + 30]], 1, BKC.iron, .5);
  dline([[lx - 23, ly + 6], [lx + 23, ly + 6]], 1, BKC.iron);
  dline([[lx - 13, ly + 30], [lx + 13, ly + 30]], 1, BKC.iron);
}

// ---------- the table (front layer) ----------
// Clip a closed polygon to the band ya <= y <= yb (Sutherland–Hodgman against two horizontal edges).
function bkClipY(P, ya, yb) {
  const clip = (Q, inside, y) => {
    const out = [];
    for (let i = 0; i < Q.length; i++) {
      const a = Q[i], b = Q[(i + 1) % Q.length], ia = inside(a), ib = inside(b);
      if (ia) out.push(a);
      if (ia !== ib) out.push([lerp(a[0], b[0], (y - a[1]) / (b[1] - a[1])), y]);
    }
    return out;
  };
  return clip(clip(P, p => p[1] >= ya, ya), p => p[1] <= yb, yb);
}
function bkTable(t, tb = BUNKER.table) {   // (tb: another table's extent, as BUNKER.table: the banquet's sizes, BQ)
  const { top, front, x0, x1, hem } = tb, sw = 1.8, NF = Math.max(5, Math.round((x1 - x0) / 86));
  boilSeed('bk table');
  // the front drape: the corners hang lower, the lace hem is scalloped and rides the folds
  const fx = k => lerp(x0 + 30, x1 - 30, (k + .5) / NF) + (hash(k + 5) - .5) * 26;
  const hemY = x => { const f = (x - x0) / (x1 - x0); return hem + 24 * (Math.abs(f - .5) * 2) ** 8 + 5 * Math.sin((x - x0) / (x1 - x0) * NF * TAU); };
  const P = [[x0 - 16, front - 4], [x1 + 16, front - 4], [x1 + 21, (front + hem) / 2]];
  const L0 = x1 + 24, L1 = x0 - 24, NS = Math.round((L0 - L1) / 34), sp = (L0 - L1) / NS;
  for (let k = 0; k < NS; k++) for (let j = 0; j < 4; j++) { const x = L0 - (k + j / 4) * sp; P.push([x, hemY(x) + 10 * Math.sin(j / 4 * Math.PI)]); }
  P.push([L1, hemY(L1)], [x0 - 21, (front + hem) / 2]);
  // it's lit from above: the top catches the light, the drape falls into shadow toward the floor (stepped, like cel)
  piece(P, BKC.cloth, { sw, ink: STYLE.card ? undefined : null, key: 'bkcloth', lift: 6 });
  const NB = x1 - x0 > 1500 ? 6 : 10;   // (a long table's drape: fewer, wider bands, the same fall of light)
  for (let b = 1; b < NB; b++) {
    const ya = lerp(front + 34, hem - 30, (b - 1) / (NB - 1)) + (b === 1 ? 0 : 0), band = bkClipY(P, ya, H + 200);
    if (band.length > 2) piece(band, mixCol(BKC.cloth, BKC.clothDk, ease(b / (NB - 1)) * .85), { ink: null, key: 'bkband' + b, lift: 0, flatCard: true, edge: false });
  }
  // pleats: dark valleys flaring toward the hem, a lit ridge beside each
  for (let k = 0; k < NF; k++) {
    const x = fx(k), w = 12 + 12 * hash(k + 9), yb = hemY(x + w * .4);
    piece(curvy([[x - 2, front + 6], [x + 3, front + 6], [x + w * .45, front + 110], [x + w * .8, yb + 4], [x - w * .6, yb + 6], [x - w * .35, front + 110]], 3), BKC.clothFold, { ink: null, op: 55, key: 'bkfold' + k, lift: 0, flatCard: true, edge: false });
    dline([[x + w * .7, front + 40], [x + w * 1.05, front + 130], [x + w * 1.25, yb - 16]], .6, mixCol(BKC.cloth, BKC.clothLt, .5), .4);
  }
  for (const [ex, d] of [[x0, 1], [x1, -1]]) {
    piece(curvy([[ex - d * 16, front], [ex + d * 4, front], [ex + d * 34, front + 110], [ex + d * 26, hemY(ex) + 20], [ex - d * 20, hemY(ex) + 22]], 3), BKC.clothFold, { ink: null, op: 80, key: 'bkcf' + d, lift: 0, flatCard: true, edge: false });
    dline([[ex + d * 18, front + 8], [ex + d * 40, front + 120], [ex + d * 34, hemY(ex) + 8]], .8, NOIR.ink, .4);
  }
  // lace: a stitched line above the scallops
  dline(P.slice(3, P.length - 2).filter((_, i) => i % 2 === 0).map(([x, y]) => [x, hemY(x) - 12]), .6, mixCol(BKC.clothDk, BKC.cloth, .5), .3);
  if (!STYLE.card) paint(P, { ink: NOIR.ink, sw, br: 'flash' });
  // velvet swags gathered along the top of the drape, pinned with brass rosettes, tassels hanging from the pins
  const NSW = Math.max(2, Math.round((x1 - x0) / 224)), pin = k => lerp(x0 - 6, x1 + 6, k / NSW);
  boilSeed('bk swags');
  for (let k = 0; k < NSW; k++) {
    const xa = pin(k), xb = pin(k + 1), dep = 66, th = 34, Tp = [], Bt = [];
    for (let j = 0; j <= 14; j++) { const f = j / 14, xx = lerp(xa, xb, f), sag = Math.sin(f * Math.PI); Tp.push([xx, front - 3 + (dep - th) * sag]); Bt.push([xx, front + 2 + dep * sag]); }
    bkLit([0, -1], () => piece(Tp.concat(Bt.slice().reverse()), BKC.swag, { sw: 1.4, shade: BKC.swagDk, depth: 12, key: 'bkswag' + k, lift: 3 }));
    for (const f of [.4, .72]) dline(Tp.map(([xx], j) => [xx, lerp(Tp[j][1], Bt[j][1], f)]).slice(2, 13), .7, f < .5 ? BKC.swagLt : BKC.swagDk, .4);
    if (BKB()) { const Bs = BNO.batch(); for (let j = 1; j < Bt.length - 1; j++) for (let q = 0; q < 3; q++) { const [xx, yy] = [lerp(Bt[j][0], Bt[j + 1][0], q / 3), lerp(Bt[j][1], Bt[j + 1][1], q / 3)]; Bs.line([[xx, yy + 1], [xx + .6, yy + 9 + 2 * hash(j * 3 + q)]], .4); } Bs.line(Bt, .35); Bs.draw(); }   // (a bullion fringe)
  }
  for (let k = 0; k <= NSW; k++) {
    const px = pin(k), py = front + 4, sway = Math.sin(t * 1.3 + k * 1.7) * 2;
    dline([[px, py], [px + sway * .5, py + 24], [px + sway, py + 44]], 1.1, BKC.brassDk, .5);
    piece(oval(px + sway * .6, py + 30, 5, 6, 0, 10), BKC.brass, { sw: .8, key: 'bkknot' + k, lift: 2, flatCard: true });
    piece(curvy([[px + sway - 5, py + 36], [px + sway + 5, py + 36], [px + sway + 10, py + 62], [px + sway, py + 66], [px + sway - 10, py + 62]], 3), BKC.brass, { sw: .9, shade: BKC.brassDk, depth: 4, key: 'bktas' + k, lift: 2, flatCard: true });
    for (const d of [-5, 0, 5]) dline([[px + sway + d * .8, py + 44], [px + sway + d, py + 62]], .5, BKC.brassDk);
    piece(oval(px, py, 11, 11, 0, 16), BKC.brass, { sw: 1, shade: BKC.brassDk, depth: 4, key: 'bkros' + k, lift: 3, flatCard: true });
    piece(oval(px, py, 4.5, 4.5, 0, 10), BKC.brassLt, { ink: null, key: 'bkros2' + k, lift: 0, flatCard: true, edge: false });
  }
  // the top, lit by the chandelier, with the cloth's edge rolling over
  piece(bkBox(x0 - 16, top, x1 + 16, front, 5, 30), BKC.clothLt, { sw, key: 'bktop', lift: 4 });
  dline([[x0 - 8, front - 6], [x1 + 8, front - 6]], .6, BKC.cloth);
}
// things on the table, standing on the top at y
function bkPlate(x, y, s, key) {
  boilSeed('bk plate ' + key);
  piece(oval(x, y, s * 1.25, s * .2, 0, 30), BKC.silver, { sw: 1.1, shade: BKC.silverDk, depth: 4, key: key + 'ch', lift: 2 });
  piece(oval(x, y - 1, s * .9, s * .13, 0, 26), BKC.clothLt, { sw: .9, key: key + 'pl', lift: 1, flatCard: true });
}
function bkDome(x, y, s, t, key) {
  boilSeed('bk dome ' + key);
  piece(oval(x, y, s * 1.2, s * .2, 0, 30), BKC.silverDk, { sw: 1.2, key: key + 'tray', lift: 2 });
  const D = []; for (let k = 0; k <= 16; k++) { const a = Math.PI + k / 16 * Math.PI; D.push([x + Math.cos(a) * s, y - 4 + Math.sin(a) * s * .82]); }
  bkLit([0, -1], () => piece(D, BKC.silver, { sw: 1.4, shade: BKC.silverDk, depth: s * .3, key: key + 'dome', lift: 4 }));
  piece(curvy([[x - s * .55, y - s * .42], [x - s * .3, y - s * .68], [x - s * .22, y - s * .6], [x - s * .45, y - s * .36]], 3), BKC.silverLt, { ink: null, key: key + 'hl', lift: 0, flatCard: true, edge: false });
  piece(bkBox(x - s * 1.04, y - 9, x + s * 1.04, y - 1, 3, 20), BKC.silverLt, { sw: 1, key: key + 'rim', lift: 2 });
  piece(oval(x, y - s * .86, s * .14, s * .1, 0, 12), BKC.silverLt, { sw: 1, key: key + 'knob', lift: 2, flatCard: true });
  glow(x - s * .38, y - s * .55, s * .5, BKC.warm, .5 * bkFlick(t, key.length));
}
function bkRoast(x, y, s, t) {
  boilSeed('bk roast');
  piece(oval(x, y, s * 1.55, s * .26, 0, 36), BKC.silver, { sw: 1.3, shade: BKC.silverDk, depth: 6, key: 'bkplatter', lift: 3 });
  dline(bkRing(x, y, s * 1.25, 36).map(([a, b]) => [a, y + (b - y) * .16]), .6, BKC.silverDk);
  for (let k = 0; k < 7; k++) { const gx = x + (k < 4 ? -1 : 1) * s * (1.1 + .1 * (k % 4)), gy = y - 4 - (k % 2) * 7; piece(oval(gx, gy, 6, 6, 0, 10), '#4B3A48', { sw: .7, key: 'bkgr' + k, lift: 1, flatCard: true }); }
  for (const d of [-1, 1]) piece(curvy([[x + d * s * .8, y - 2], [x + d * s * 1.35, y - 16], [x + d * s * 1.45, y - 4]], 3), BKC.moss, { sw: .8, key: 'bkgrn' + d, lift: 1, flatCard: true });
  // the bird: a plump body, drumsticks up with paper frills
  const B = curvy([[x - s * .95, y - 6], [x - s * .9, y - s * .5], [x - s * .4, y - s * .82], [x + s * .3, y - s * .85], [x + s * .88, y - s * .5], [x + s * .95, y - 6]], 5);
  bkLit([-.3, -1], () => piece(B, BKC.roast, { sw: 1.4, shade: BKC.roastDk, depth: s * .25, key: 'bkbird', lift: 4 }));
  piece(curvy([[x - s * .45, y - s * .62], [x + s * .1, y - s * .74], [x + s * .2, y - s * .66], [x - s * .35, y - s * .54]], 3), BKC.roastLt, { ink: null, key: 'bkbirdhl', lift: 0, flatCard: true, edge: false });
  for (const d of [-1, 1]) {
    const r = limb([[x + d * s * .35, y - s * .35], [x + d * s * .75, y - s * .6], [x + d * s * .95, y - s * 1.0]], s * .38, s * .2, BKC.roast, { sw: 1.2, shade: BKC.roastDk, key: 'bkdrum' + d });
    const fx = r.tip[0], fy = r.tip[1], F = [];
    for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * .38 + (d > 0 ? .3 : -.3); F.push([fx + Math.cos(a) * s * (k % 2 ? .18 : .3), fy + Math.sin(a) * s * (k % 2 ? .18 : .3)]); }
    F.push([fx + s * .1, fy + s * .06], [fx - s * .1, fy + s * .06]);
    piece(F, BKC.clothLt, { sw: .8, key: 'bkfrill' + d, lift: 2, flatCard: true });
  }
  glow(x - s * .2, y - s * .7, s * .8, BKC.warm, .35);
}
function bkBucket(x, y, s, t) {
  boilSeed('bk bucket');
  // the bottle leaning out of the ice
  push(); translate(x + s * .1, y - s * .6); rotate(.38);
  piece(curvy(U([[-.28, .6], [-.28, -.55], [-.14, -.85], [-.1, -1.45], [.1, -1.45], [.14, -.85], [.28, -.55], [.28, .6]], s), 3), BKC.bottle, { sw: 1.2, rim: '#4E6A5A', key: 'bkbottle', lift: 3 });
  piece(curvy(U([[-.13, -1.05], [.13, -1.05], [.12, -1.5], [-.12, -1.5]], s), 2), BKC.foil, { sw: .9, key: 'bkfoil', lift: 1, flatCard: true });
  piece(curvy(U([[-.26, -.35], [.26, -.35], [.26, .05], [-.26, .05]], s), 2), BKC.clothLt, { sw: .8, key: 'bklabel', lift: 1, flatCard: true });
  pop();
  for (let k = 0; k < 4; k++) piece(curvy(U([[-.14, -.1], [.14, -.14], [.16, .1], [-.12, .12]], s * .9, x + (k - 1.5) * s * .28, y - s * .8 - (k % 2) * 4), 2), BKC.ice, { sw: .7, key: 'bkice' + k, lift: 1, flatCard: true });
  // the bucket, with ring handles and a napkin over the rim
  const Bk = curvy(U([[-.62, -.82], [.62, -.82], [.5, -.05], [.36, 0], [-.36, 0], [-.5, -.05]], s, x, y), 3);
  bkLit([-.4, -1], () => piece(Bk, BKC.silver, { sw: 1.4, shade: BKC.silverDk, depth: s * .2, key: 'bkbucket', lift: 4 }));
  piece(bkBox(x - s * .68, y - s * .9, x + s * .68, y - s * .76, 4, 16), BKC.silverLt, { sw: 1.1, key: 'bkbrim', lift: 2 });
  for (const d of [-1, 1]) dline(bkRing(x + d * s * .66, y - s * .5, s * .12, 14), 1, BKC.silverDk);
  piece(curvy(U([[-.66, -.86], [-.2, -.9], [-.26, -.5], [-.4, -.2], [-.58, -.35]], s, x, y), 3), BKC.clothLt, { sw: 1, key: 'bknapkin', lift: 2 });
  glow(x - s * .3, y - s * .5, s * .5, BKC.warm, .4);
}

// A champagne coupe standing on its foot at (x, y): w wide, fill 0..1, spill: a dribble running down the bowl.
function bkCoupe(x, y, w, fill, spill, t, key) {
  const h = w * .76, bw = w / 2, rim = y - h, sw = .8;
  piece(curvy([[x - bw * .45, y], [x + bw * .45, y], [x + bw * .12, y - h * .12], [x - bw * .12, y - h * .12]], 2), BKC.glass, { sw, op: 200, key: key + 'ft', lift: 1, flatCard: true });
  piece([[x - bw * .07, y - h * .1], [x + bw * .07, y - h * .1], [x + bw * .06, y - h * .55], [x - bw * .06, y - h * .55]], BKC.glass, { sw: sw * .8, op: 200, key: key + 'st', lift: 1, flatCard: true });
  const bowl = []; for (let k = 0; k <= 10; k++) { const a = k / 10 * Math.PI; bowl.push([x + Math.cos(a) * bw, rim + Math.sin(a) * h * .5]); }
  piece(bowl, BKC.glass, { sw, op: 170, key: key + 'bw', lift: 1, flatCard: true });
  if (fill > .02) { const fy = rim + h * .5 * (1 - fill) * .8, P = []; for (let k = 0; k <= 10; k++) { const a = k / 10 * Math.PI, r = bw * .92 * Math.sqrt(1 - (1 - fill) * .6); P.push([x + Math.cos(a) * r, fy + Math.sin(a) * (rim + h * .47 - fy)]); } piece(P, BKC.wine, { ink: null, key: key + 'wn', lift: 0, flatCard: true, edge: false }); }
  if (spill > .02) for (const d of [-1, 1]) dline([[x + d * bw * .96, rim + 1], [x + d * bw * (.9 + .06 * Math.sin(t * 5 + d)), rim + h * .3 * spill + 2], [x + d * bw * .7, rim + h * .5 * spill]], .9, BKC.wine, .5);
  dline([[x - bw * .6, rim + 3], [x - bw * .35, rim + h * .3]], .6, '#FFFFFF', .5);
}
// A pyramid of coupes (3, 2, 1) on the table at (x, y); pour 0..1 = how much is flowing from the top. rows: the bottom
// row's count (the banquet's bigger towers: 4, 5); key: a prefix, for more than one tower in a frame.
function bkTower(x, y, t, pour, rows = 3, key = 'bk') {
  const w = 36, h = w * .76;
  boilSeed(key + ' tower');
  piece(oval(x, y + 2, rows * w * .67, 7, 0, 24), BKC.silver, { sw: 1, shade: BKC.silverDk, depth: 3, key: key + 'twtray', lift: 2 });
  for (let r = 0; r < rows; r++) {
    const n = rows - r;
    for (let i = 0; i < n; i++) { const cx = x + (i - (n - 1) / 2) * w * 1.02; bkCoupe(cx, y - r * h + (r ? 3 : 0), w, .55 + .35 * (r / (rows - 1)) + .1 * pour, r ? pour : pour * .6, t, key + 'cp' + r + i); }
  }
  glow(x - 20, y - (rows - 1) * h, 50 + 10 * (rows - 3), BKC.flame, .3);
}

// ---------- dust, grit and vignette ----------
// Dust motes drifting and slowly falling; the ones near a flame catch the light.
function bkDust(t, n, x0, x1, y0, y1, key, lights) {
  for (let i = 0; i < n; i++) {
    const h1 = hash(i * 7.7 + key.length), h2 = hash(i * 3.3 + 11), h3 = hash(i * 5.1 + 2);
    const x = x0 + (x1 - x0) * frac(h1 + t * .006 * (h3 - .5)) + 14 * Math.sin(t * (.4 + h2) + i), y = y0 + (y1 - y0) * frac(h2 + t * (.012 + .02 * h3));
    let lit = .2; for (const [lx, ly, r] of lights) lit = Math.max(lit, 1 - Math.hypot(x - lx, y - ly) / r);
    const tw = .6 + .4 * Math.sin(t * (2 + 3 * h3) + i * 2.1), r = (1 + 1.6 * h3) * (STYLE.card ? 1.3 : 1);
    boilSeed('bk dust' + key + i);
    piece(oval(x, y, r, r, 0, 8), mixCol('#8A8478', BKC.core, lit), { ink: null, op: 90 + 150 * lit * tw, key: 'bkd' + key + i, lift: 0, flatCard: true, edge: false });
    if (lit > .45 && tw > .7) glow(x, y, 7 + 6 * h3, BKC.flame, .5 * lit);
  }
}
// A heavy vignette in screen space: the lens darkening toward the edges, MULTIPLIED over the frame (like glow() adds
// light, this takes it away; a painted dark wash would mix muddy). The texture is made once and never changes.
let BK_VIG = null;
function bkVignette(k = 1) {
  if (k <= 0) return;
  if (!BK_VIG) {
    const g = createGraphics(480, 270); g.pixelDensity(1); const c = g.drawingContext;
    c.setTransform(240, 0, 0, 135, 240, 124);
    const gr = c.createRadialGradient(0, 0, 0, 0, 0, 1.5);
    [[0, 255], [.42, 255], [.56, 236], [.68, 196], [.82, 140], [1, 84]].forEach(([s, v]) => gr.addColorStop(s, `rgb(${v},${Math.round(v * .97)},${Math.round(v * .98)})`));
    c.fillStyle = gr; c.fillRect(-3, -3, 6, 6);
    BK_VIG = g;
  }
  flushBrush();
  push(); resetMatrix(); translate(-W / 2, -H / 2); blendMode(MULTIPLY);
  if (k < 1) tint(255, 255 * k);
  image(BK_VIG, -4, -4, W + 8, H + 8); noTint(); blendMode(BLEND); pop();
}

// ---------- the layers ----------
function bunkerBack(t, lt, o = {}) {
  const nave = o.k != null && typeof BQ !== 'undefined' && BQ[o.k].nave;   // (Z2: the chancel opens into the grand hall's nave)
  bkVault(t, o.ext, o.cull ? bkView() : null);
  bkGrime(t);
  // the chancel: the organ racks, lit from the chandelier (or, beyond the arch, the nave with the organ at its far end)
  if (nave) bqNave(t, lt); else bkOrgan(t);
  glow(960, 150, 560, BKC.warm, .22);
  // left bay: a floor candelabra; right bay: the door
  bkCandelabra(268, BUNKER.floor - 4, 23, t, 'bkcdL', { ga: 1 });
  glow(268, 300, 330, BKC.warm, .3 * bkFlick(t, 3));
  bkDoor(t, lt);
  bkDrip(t, 238, 60, BUNKER.floor + 30, 1.9, .1, 'L');
  bkDrip(t, 1868, 40, BUNKER.floor + 40, 2.3, .55, 'R');
  bkChandelier(t);
  glow(960, 110, 300, BKC.warm, .4 * bkFlick(t, 20));
  if (BKB() && !nave) { boilSeed('bk balustrade'); BNO.balustrade(612, 1308, 650, 764, 15, { key: 'bkbal', col: BKC.ribLt, psw: .7 }); }   // (the chancel rail)
  // chairs behind the diners (o.k: the banquet's size, BQ: its guests and every seated boss's chair, bqBack)
  if (o.k != null && typeof bqBack === 'function') bqBack(t, lt, o.k, o);
  else {
    const { left, right } = BUNKER.seats;
    bkChair(left[0], left[1], left[2], 1, 'bkchairL');
    bkChair(right[0], right[1], right[2], -1, 'bkchairR');
  }
  boilSeed('bk back done');
}
// The bank look's vignettes: bare paper round each diner and server, where the hall's engraved lines stop
// (style.js bankVignette: each line tapers to a point and ends on a soft oval). A list the scene fills and registers
// BEFORE it draws the hall, ending it (bankVignetteEnd) under the cast:
//   bkHaloOf(x, y, u, s, amt, up): one figure's oval from its seat (ground) point and unit: the head's middle `up` u above
//     it (10.6 for a seated diner; the bots: 7.5 Grok, 8.5 Muse), 5.4 × 7 u (× s, its size), strength .82 × amt.
//   bkHaloOvals(k, amt, plan): the table's (k: the second chorus: Dorsey, Altman and a second Muse too). With the frame's
//     plan (bqPlan: every figure's options, as the cast is drawn with them) each oval follows its figure's pose.
//   bkHalos(k, amt, extra, at): registers bkHaloOvals(k, amt) plus extra (more diners: [bkHaloOf(...), ...]). at: the
//     frame's { plan } or { t, lt, o } (as bqCast gets them), so the halos move with the diners; without it, from the seats.
const bkHaloOf = (x, y, u, s = 1, amt = 1, up = 10.6) => [x, y - up * u, 5.4 * u * s, 7 * u * s, .82 * amt];
function bkHaloOvals(k = 0, amt = 1, plan = null) {
  if (typeof bqHaloOvals === 'function') return bqHaloOvals(k, amt, plan);   // (the banquet's own layout per level, when it has one)
  const { left, right } = BUNKER.seats, G = BUNKER.grok, M = BUNKER.muse;
  const L = [bkHaloOf(left[0] + 14, left[1], left[2], 1, amt), bkHaloOf(right[0] - 14, right[1], right[2], 1, amt), bkHaloOf(G[0], G[1], G[2], .9, amt, 7.5), bkHaloOf(M[0], M[1], M[2], .85, amt, 8.5)];
  if (k) L.push(bkHaloOf(575, 742 + 5.4 * 27, 27, .95, amt), bkHaloOf(1290, 742 + 4.1 * 29, 29, .95, amt), bkHaloOf(1470, 700, 22, .85, amt, 8.5));
  return L;
}
function bkHalos(k = 0, amt = 1, extra = [], at = null) {
  if (STYLE.mode === 'bank' && typeof bankVignette === 'function') bankVignette(bkHaloOvals(k, amt, at && (at.plan || bqPlan(at.t, at.lt, k, at.o || {}))).concat(extra));
}
function bunkerTable(t, lt) {
  const { top } = BUNKER.table, y = top + 16, { left, right } = BUNKER.seats;
  bkTable(t);
  bkPlate(left[0] + 30, y + 6, 46, 'bkplL');
  bkPlate(right[0] - 30, y + 6, 46, 'bkplR');
  bkRoast(960, y + 2, 60, t);
  bkDome(308, y + 2, 48, t, 'bkdomeL');
  bkTower(BUNKER.tower[0], BUNKER.tower[1], t, bkPourK(lt));
  bkBucket(1318, y + 4, 60, t);
  glow(960, top - 10, 520, BKC.warm, .16);
  boilSeed('bk table done');
}
function bunkerFore(t, lt, o = {}) {
  // a soft column of candlelight under the chandelier, dust falling slowly through it
  for (let k = 0; k < 5; k++) glow(960, 190 + k * 110, 170 + k * 40, BKC.warm, .06);
  bkDust(t, 30, 740, 1180, 60, 720, 'c', [[960, 110, 360], [960, 420, 260], [960, 600, 220]]);
  bkDust(t, 12, 150, 450, 200, 700, 'l', [[268, 320, 260]]);
  bkVignette(o.vignette ?? 1);
  boilSeed('bk fore done');
}
function bunkerFront(t, lt, o = {}) {
  bunkerTable(t, lt);
  if (o.onTable) o.onTable();
  bunkerFore(t, lt, o);
}

// ---------- the bill's flight ----------
// The camera for shot C: a slow push toward the toast, drifting right toward the door once the slot comes alive.
// The banquet's (lv) is held still where the push stood as it comes full frame (bunker time ~1.24: the chorus's window
// push lands on the same framing): the bank look's ground doesn't redraw (the user), and the slow push and drift re-drew
// every line of the hall a fraction of a pixel over each frame, about a fifth of the frame changing frame to frame.
const BQ_CAM_K = .2;
function bunkerCam(lt, lv) {   // (lv: the banquet's size, BQ: its own framing, BQ[lv].cam)
  const k = ease(seg(lt, 0, BUNKER.times.len)), d = ease(seg(lt, 2.0, 3.6)), C = lv != null && typeof BQ !== 'undefined' && BQ[lv].cam;
  if (C) return { cx: C.cx, cy: C.cy + C.dy * BQ_CAM_K, zoom: C.z + C.dz * BQ_CAM_K };
  return { cx: 960 + 60 * d, cy: 506 + 6 * k, zoom: 1.06 + .07 * k };
}
// The bill's path in world space (x, y centre, s width, rot, flap), given the camera (its target is the lens).
function bkBillPath(lt, cam) {
  const T_ = BUNKER.times, [sx, sy] = BUNKER.slot, s0 = BUNKER.bill, h0 = s0 * 1.3;
  const P0 = [sx, sy - 2 + h0 / 2];
  if (lt < T_.release) return { x: P0[0], y: P0[1], s: s0, rot: 0, flap: 0, free: false };
  const a = lt - T_.release, k1 = seg(lt, T_.release, T_.swoop);
  // it drops out, tumbling and fluttering, and drifts off toward the middle
  const P1 = [sx - 150, sy + h0 / 2 - 10], s1 = s0 * 2.1;
  let x = lerp(P0[0], P1[0], ease(k1)) + 18 * Math.sin(a * 13) * (1 - k1), y = lerp(P0[1], P1[1], ease(k1)) + 34 * Math.sin(k1 * Math.PI);
  let s = lerp(s0, s1, ease(k1)), rot = -.45 * Math.sin(a * 9) * Math.exp(-a * 2) - .2 * ease(k1), flap = Math.sin(a * 17);
  if (lt >= T_.swoop) {
    // the swoop at the lens: accelerating, growing exponentially, flattening out as it covers the frame
    const k = seg(lt, T_.swoop, T_.cover), sEnd = 2500 / cam.zoom, tgt = [cam.cx, cam.cy];
    const kp = Math.pow(k, 1.35), q = ease(k);
    const p = arcPt(P1, tgt, 110, q);
    x = p[0]; y = p[1]; s = s1 * Math.pow(sEnd / s1, kp);
    rot = lerp(-.2, 0, ease(k)) + .3 * Math.sin(k * 7) * (1 - k); flap = Math.sin((lt - T_.swoop) * 15) * (1 - k);
  }
  return { x, y, s, rot, flap, free: true };
}
// Where the bill is, in screen space, at shot time lt (pure; draws nothing).
function bunkerBill(lt, cam = bunkerCam(lt)) {
  const p = bkBillPath(lt, cam), [x, y] = toScreen(p.x, p.y, { ...cam, rot: 0 });
  return { x, y, s: p.s * cam.zoom, rot: p.rot, flap: p.flap, free: p.free };
}
// Draw the free bill (call LAST, inside the shot's camera). Returns bunkerBill(lt).
function vaultSlot(lt, o = {}) {
  const cam = o.cam || (CAM ? { cx: CAM.cx, cy: CAM.cy, zoom: CAM.zoom } : bunkerCam(lt)), p = bkBillPath(lt, cam);
  if (p.free) { boilSeed('bk bill'); push(); nudge('bkbill', 1.5); bill(p.x, p.y, p.s, p.rot, 0, p.flap, 'bkbill'); pop(); }
  return bunkerBill(lt, cam);
}

// ---------- stand-ins until the cast exists ----------
function bkStandIn(kind, x, y, u, o = {}) {
  const f = o.flip ? -1 : 1, sw = clamp(u / 20, .55, 2.2);
  boilSeed('bk standin ' + kind);
  if (kind === 'muse') {
    const by = y - 6 * u + Math.sin(T * 2.4) * .4 * u;
    piece(curvy([[x, by - 2.6 * u], [x + 2.2 * u, by - .8 * u], [x + 1.6 * u, by + 1.6 * u], [x - 1.6 * u, by + 1.6 * u], [x - 2.2 * u, by - .8 * u]], 5), '#5A4E7A', { sw, rim: '#9A8EC0', key: 'bksim', lift: 6 });
    glow(x, by, 4 * u, '#9A8EC0', .3); return;
  }
  if (kind === 'grok') {
    piece(curvy([[x - 2.2 * u, y - 4 * u], [x - 2.4 * u, y - 9.5 * u], [x - 1.6 * u, y - 13.5 * u], [x + 1.6 * u, y - 13.5 * u], [x + 2.4 * u, y - 9.5 * u], [x + 2.2 * u, y - 4 * u]], 4), '#2A2A30', { sw, rim: '#6A6A78', key: 'bksig', lift: 6 });
    piece(oval(x + .4 * u, y - 11.5 * u, 1.3 * u, .7 * u, 0, 20), '#C8D4E0', { sw: sw * .7, key: 'bksigv', lift: 2 });
    return;
  }
  const suit = kind === 'musk' ? '#1C1A20' : '#2A2830', skin = kind === 'musk' ? '#C9A088' : '#D8B8A0';
  piece(curvy([[x - 2.6 * u, y - 4 * u], [x - 2.5 * u, y - 8.2 * u], [x - 1.4 * u, y - 9.3 * u], [x + 1.4 * u, y - 9.3 * u], [x + 2.5 * u, y - 8.2 * u], [x + 2.6 * u, y - 4 * u]], 4), suit, { sw: sw * 1.1, rim: '#6A6470', key: 'bksi' + kind, lift: 6 });
  piece(oval(x + f * .4 * u, y - 12 * u, 2.1 * u, 2.6 * u, 0, 30), skin, { sw: sw * 1.1, shade: mixCol(skin, NOIR.ink, .3), depth: .4 * u, key: 'bksih' + kind, lift: 6 });
  const [gx, gy] = o.glass, sh = [x + f * 1.8 * u, y - 8.6 * u];
  limb([sh, [lerp(sh[0], gx, .5), gy + 1.6 * u], [gx - f * .5 * u, gy + 1.2 * u]], .9 * u, .8 * u, suit, { sw, key: 'bksia' + kind });
  push(); translate(gx, gy + .2 * u); rotate(Math.PI / 2 + f * (o.tilt || 0)); flute(.9 * u, .72, o.clink || 0, 'bkfl' + kind); pop();
  hand(gx - f * .5 * u, gy + 1.2 * u, f > 0 ? -.4 : Math.PI + .4, .8 * u, { glove: true, pose: 'fist', mirror: f < 0, sw, key: 'bksihd' + kind });
}

// ---------- the shot (LOOPS.bunker is shot C) ----------
// Arm poses over time with a blend per key: keys [[t, { L, R }, blend], ...]; specs mix number by number (arrays too).
function bkPose(t, keys) {
  let i = 0; while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
  const cur = keys[i][1]; if (i === 0) return cur;
  const prev = keys[i - 1][1], k = backOut(seg(t, keys[i][0], keys[i][0] + (keys[i][2] ?? .3)));
  const mv = (a, b) => typeof a === 'number' && typeof b === 'number' ? lerp(a, b, k) : Array.isArray(a) && Array.isArray(b) ? a.map((v, j) => lerp(v, b[j], k)) : (k < .5 ? a : b);
  const mix = (a, b) => Array.from({ length: Math.max(a.length, b.length) }, (_, j) => mv(a[j], b[j]));
  return { L: mix(prev.L, cur.L), R: mix(prev.R, cur.R) };
}
// The acting: they lift their glasses, Musk winds up and thrusts, the rims meet on the beat (lt 1.28), Musk laughs,
// Zuck holds his glass up like a servo with a stiff smile. Returns the option spreads for musk() and zuck().
function bkActing(lt) {
  const T_ = BUNKER.times, c = T_.clink, clinkK = lt >= c ? Math.exp(-(lt - c) * 4.5) : 0;
  const mL = [-2.1, -5.4, .35, 'relax', 1, .15], mLo = [-2.4, -5.5, .3, 'open', 1, .1];
  const mPose = bkPose(lt, [
    [0, { L: mL, R: [3.1, -7.2, .4, 'hold', 1, -1.25] }],
    [T_.toast[0], { L: mL, R: [3.4, -10.9, .38, 'hold', 1, -1.05] }, .32],
    [c - .2, { L: mL, R: [2.9, -10.3, .42, 'hold', 1, -1.25] }, .1],
    [c - .1, { L: mL, R: [5.5, -9.6, .18, 'hold', 1, -.62] }, .1],
    [c + .28, { L: mLo, R: [3.5, -10.2, .38, 'hold', 1, -1.0] }, .3],
  ]);
  const meet = seg(lt, c - .1, c) * (1 - seg(lt, c + .28, c + .5));
  const mk = {
    ...emotions(lt, [[0, 'smug'], [T_.toast[0], 'happy', { mouth: 'grin' }], [c + .12, 'laugh']]),
    view: 'q', seated: true, pose: mPose, flute: { fill: .72, clink: clinkK, tilt: .22 * meet }, boilKey: 'musk', seed: 1,
  };
  const zL = [-1.9, -5.15, .35, 'relax', 1];
  const zPose = bkPose(lt, [
    [0, { L: zL, R: [2.5, -6.7, .3, 'hold', 1] }],
    [T_.toast[0] + .1, { L: zL, R: [3.1, -8.7, .3, 'hold', 1] }, .2],
    [c - .12, { L: zL, R: [4.3, -8.9, .22, 'hold', 1] }, .12],
    [c + .34, { L: zL, R: [3.1, -8.9, .3, 'hold', 1] }, .2],
  ]);
  const zk = {
    ...emotions(lt, [[0, 'neutral'], [T_.toast[0] + .1, 'happy']]), zmouth: 'stiff',
    view: 'q', flip: true, seated: true, pose: zPose, flute: { fill: .78, tilt: .2 * meet }, boilKey: 'zuck', seed: 2,
  };
  return { mk, zk, clinkK, meet };
}
// Grok pours into the tower until the alarm lamp, then stops to look at the door.
const bkPourK = lt => seg(lt, .05, .3) * (1 - seg(lt, BUNKER.times.lamp + .08, BUNKER.times.lamp + .3));
function bkBots(lt) {
  const T_ = BUNKER.times, look = ease(seg(lt, T_.lamp + .1, T_.lamp + .35)), pk = bkPourK(lt);
  const gk = {
    ...emotions(lt, [[0, 'smug'], [T_.lamp + .1, 'surprised'], [T_.lamp + .9, 'nervous']], { take: .6 }), view: 'q', pose: 'pour',
    bottleTilt: lerp(.7, 2.15, ease(seg(lt, 0, .25))) - 1.3 * ease(seg(lt, T_.lamp + .05, T_.lamp + .3)), pour: pk, pourTo: BUNKER.towerTop,
    lookX: lerp(.3, 1, look), lookY: lerp(.5, -.2, look), boilKey: 'grok', seed: 3,
  };
  const mu = {
    ...emotions(lt, [[0, 'happy'], [T_.lamp + .18, 'surprised']], { take: .6 }), view: 'q', flip: true, pose: 'tray', tray: 'canapes',
    lookX: lerp(.2, -1, look), boilKey: 'muse', seed: 4,
  };
  return { gk, mu };
}
function bkCast(t, lt) {
  const { left, right } = BUNKER.seats, A = bkActing(lt), hasM = typeof musk === 'function', hasZ = typeof zuck === 'function';
  const [clx, cly] = BUNKER.clink;
  // Grok stands behind the table's left end, Muse hovers behind Zuck's shoulder
  const Bt = bkBots(lt);
  if (typeof muse === 'function') muse(BUNKER.muse[0], BUNKER.muse[1], BUNKER.muse[2], Bt.mu); else bkStandIn('muse', ...BUNKER.muse);
  if (hasM) musk(left[0], left[1], left[2], { ...A.mk, layer: 'back' });
  else bkStandIn('musk', left[0], left[1], left[2], { glass: [lerp(clx - 150, clx - 24, A.meet), cly + 20], tilt: .25 * A.meet, clink: A.clinkK });
  const onTable = () => {
    bunkerTable(t, lt);
    if (typeof grok === 'function') { const a = grok(BUNKER.grok[0], BUNKER.grok[1], BUNKER.grok[2], Bt.gk); if (window.BK_PROBE) console.warn('grok', JSON.stringify(a)); } else bkStandIn('grok', ...BUNKER.grok);
    if (hasM) musk(left[0], left[1], left[2], { ...A.mk, layer: 'front' }); };
  if (hasZ) zuck(right[0], right[1], right[2], { ...A.zk, table: onTable });
  else { bkStandIn('zuck', right[0], right[1], right[2], { flip: true, glass: [lerp(clx + 150, clx + 24, A.meet), cly + 20], tilt: .25 * A.meet }); onTable(); }
}
// Shot C, whole frame: camera push, set, cast, table, foreground, and the bill on top. Called with shot time.
LOOPS.bunker = t => {
  const lt = mt(t), cam = bunkerCam(t);   // (the set on twos in card, the camera's push on ones)
  camBegin(cam.cx, cam.cy, cam.zoom);
  bunkerBack(lt, lt);
  bkCast(lt, lt);
  bunkerFore(lt, lt);
  vaultSlot(lt, { cam });
  camEnd();
};
LOOPS.bunker.len = BUNKER.times.len;

// ======================================================================================================================
// THE BANQUET, three sizes (C1c, C2c, Z2). The user: "Can we have the banquet starting small and getting bigger with
// more people?" Each size is a layout, BQ[k]; the chorus (banquet()) and the finale (bunkerWorld()) draw it with
// bunkerBack(t, lt, { k }) (the hall, the grand hall's nave, then bqBack: Musk's and Zuck's thrones, in the hall's light
// layer), bqCast (the guests, the cast round the table, the table and its spread: bqTable) and bkHalos(k) (bkHaloOvals
// hands off to bqHaloOvals). The bunker's camera for a size: bunkerCam(lt, k).
//   0  C1c: intimate. Musk and Zuck at a small table for two; Grok (on its end, the bottle at the ready) and Muse
//      (canapés) wait on them; a modest spread: their plates, one silver dome, two candlesticks, the bucket.
//   1  C2c: bigger. The table runs out of frame; Dorsey and Turnbull join on the left, Altman on the right, all in on
//      the toast; more staff (Grok pouring the coupe tower, three Muses with trays); a loft of engraved silhouette guests
//      behind (crowd.js) raising their glasses; the roast, domes, table candelabra. The camera takes it in wider.
//   2  Z2: the grand hall (bqNave). Every boss but Dario (the checkout, V2c); the new ones on the left, so the plane's
//      corridor (the tower, between Musk and Zuck, the door) stays clear; a bot staff in numbers (Grok, two Muses,
//      Copilot, Codex pets with dishes); two tiers of guests in the side bays; beyond the chancel the nave, its long
//      table and rows of guests receding; towers of coupes; chandeliers. final.js frames it (bkCamZ) and pulls back.
// A layout: table (as BUNKER.table) · cam (bunkerCam's framing: cx, cy, z at lt 0; dx on the drift to the door, dy, dz
// over the shot) · cast [{ who, x, y, u, ... }] (ground points as each rig takes them; the seated bosses from bqSeat;
// at: 'behind' (hovering behind the diners) | 'table' (standing on it) | 'front') · spread [[kind, x, ...]] (bqTable)
// · rows (the guests: bqRows) · nave (Z2: the grand hall's nave instead of the organ).
// ======================================================================================================================
const BQ_TAB = { musk: 5.2, zuck: 5.2, dorsey: 5.4, altman: 4.1, turnbull: 4.7 };   // the table top's height on each seated boss, u above his ground point
const bqSeat = (who, x, u, face, o = {}) => ({ who, x, y: BUNKER.table.top + BQ_TAB[who] * u, u, face, seat: true, ...o });
const BQ_MZ = () => [bqSeat('musk', BUNKER.seats.left[0], BUNKER.seats.left[2], 1, { chair: 'bkchairL' }), bqSeat('zuck', BUNKER.seats.right[0], BUNKER.seats.right[2], -1, { chair: 'bkchairR' })];
const BQ = [
  {   // C1c: a table for two
    table: { top: 742, front: 772, x0: 505, x1: 1305, hem: 1012 },
    cam: { cx: 945, cy: 514, z: 1.12, dx: 60, dy: 6, dz: .07 },
    cast: [
      { who: 'muse', x: BUNKER.muse[0], y: BUNKER.muse[1], u: BUNKER.muse[2], flip: true, tray: 'canapes', at: 'behind' },
      ...BQ_MZ(),
      { who: 'grok', x: 560, y: 773, u: 30, at: 'table', pour: 0 },
    ],
    spread: [['plate', 810], ['plate', 1110], ['dome', 960, 38], ['stick', 885], ['stick', 1035], ['bucket', 1250, 54]],
    rows: [],
  },
  {   // C2c: the long table
    table: { top: 742, front: 772, x0: -380, x1: 1405, hem: 1012 },
    cam: { cx: 858, cy: 500, z: .935, dx: 50, dy: 6, dz: .06 },
    cast: [
      { who: 'muse', x: 1482, y: 700, u: 22, alt: 3, flip: true, tray: 'canapes', at: 'behind' },
      { who: 'muse', x: 596, y: 770, u: 21, alt: 7.4, tray: 'flutes', at: 'behind', key: 2 },
      { who: 'muse', x: 92, y: 770, u: 20, alt: 9.2, tray: 'canapes', at: 'behind', key: 3 },
      bqSeat('dorsey', -25, 28, 1, { d: .12 }),
      bqSeat('turnbull', 196, 29, 1, { d: .04 }),
      ...BQ_MZ(),
      bqSeat('altman', 1322, 29, -1, { d: .08 }),
      { who: 'grok', x: BUNKER.grok[0], y: BUNKER.grok[1], u: BUNKER.grok[2], at: 'table', pour: 1 },
    ],
    spread: [['plate', 15], ['plate', 226], ['plate', 810], ['plate', 1110], ['plate', 1292], ['tower', BUNKER.tower[0], 3, 'bk'], ['roast', 960, 60],
      ['candelabra', 872, 7.2], ['candelabra', 1048, 7.2], ['dome', 100, 44], ['dome', -250, 44], ['bucket', 1215, 54]],
    rows: [{ loft: true, x0: 610, x1: 1310, y: 468, u: 24, n: 6, seed: 3 }, { loft: true, x0: 170, x1: 550, y: 468, u: 24, n: 3, seed: 5 }],
  },
];
BQ.push({   // Z2: the grand hall (final.js frames it: bkCamZ; the plane's flight keeps the corridor from the coupe tower,
  // between Musk and Zuck, to the door clear: every new diner sits on the left, the staff on the table stay under it)
  table: { top: 742, front: 772, x0: -430, x1: 1405, hem: 1012 },
  nave: true,
  cast: [
    { who: 'muse', x: 1482, y: 700, u: 22, alt: 6.6, flip: true, tray: 'canapes', at: 'behind' },
    { who: 'muse', x: 124, y: 770, u: 21, alt: 8.6, tray: 'flutes', at: 'behind', key: 2 },
    bqSeat('altman', -250, 29, 1, { d: .16 }),
    bqSeat('dorsey', -25, 28, 1, { d: .12 }),
    bqSeat('turnbull', 196, 29, 1, { d: .04 }),
    ...BQ_MZ(),
    { who: 'grok', x: BUNKER.grok[0], y: BUNKER.grok[1], u: BUNKER.grok[2], at: 'table', pour: 1 },
    { who: 'copilot', x: 1372, y: 773, u: 25, at: 'table', flip: true },
    { who: 'codex', kind: 'cat', x: -136, y: 773, u: 25, at: 'table', dish: 'canapes' },
    { who: 'codex', kind: 'term', x: 1250, y: 773, u: 25, at: 'table', flip: true, dish: 'dome' },
  ],
  spread: [['plate', -224], ['plate', 0], ['plate', 226], ['plate', 810], ['plate', 1110], ['tower', BUNKER.tower[0], 3, 'bk'], ['tower', 1000, 5, 'bqT5'],
    ['roast', 90, 60], ['candelabra', 318, 7.2], ['candelabra', -372, 7.2], ['bucket', 1330, 54]],
  rows: [{ loft: true, x0: 190, x1: 530, y: 300, u: 19, n: 4, seed: 9 }, { loft: true, x0: -230, x1: 110, y: 300, u: 19, n: 4, seed: 11 },
    { loft: true, x0: 170, x1: 550, y: 468, u: 24, n: 3, seed: 5 }, { loft: true, x0: -250, x1: 130, y: 468, u: 24, n: 3, seed: 7 }],
});

// The extra bosses' part in the toast: glasses up (a flute upright in the far hand) a beat after the first two, a little
// "cheers" toward the middle on the clink; happy, then laughing. f.d staggers them.
const BQ_RAISE = { dorsey: [-5.75, -10.2], altman: [-4.4, -8.5], turnbull: [-5.0, -9.3] };   // the hand's y: on the table, raised
function bqToast(lt, f) {
  const T_ = BUNKER.times, c = T_.clink, d = f.d || 0, [ty, ry] = BQ_RAISE[f.who];
  const P = (x, y, a) => ({ L: [-1.9, ty, .35, 'relax', 1, .15], R: [x, y, .32, 'hold', 1, a] });
  const keys = [[0, P(2.1, ty - .7, -1.4)], [T_.toast[0] + .1 + d, P(2.9, ry, -1.2)], [c - .08 + d * .3, P(3.5, ry - .4, -1.05)], [c + .3 + d, P(2.9, ry, -1.2)]];
  const pose = bsPoses(lt, keys, .28), ang = pose.mix ? lerp(pose.mix[0].R[5], pose.mix[1].R[5], pose.mix[2]) : pose.R[5];
  const mood = { dorsey: [['neutral'], ['happy', { eyes: 'happy' }], ['happy', { eyes: 'happy', mouth: 'smile' }]], turnbull: [['happy', { mouth: 'grin' }], ['happy', { mouth: 'grin' }], ['laugh']], altman: [['neutral'], ['happy'], ['laugh']] }[f.who];
  const e = emotions(lt, [[0, ...mood[0]], [T_.toast[0] + .1 + d, ...mood[1]], [c + .12 + d, ...mood[2]]], { take: .5 });
  return { ...e, emote: null, view: 'q', flip: f.face < 0, seated: true, pose, lookX: .8, lookY: -.1, boilKey: 'bq' + f.who, seed: 5 + f.x % 7,
    hold: zkFluteHold({ fill: .72, tilt: 0 }, ang, false, 'bqfl' + f.who) };
}

// A banquet guest (demo/cast/crowd.js): an engraved silhouette in evening dress, seen to the chest over a table or a
// parapet ((x, y): where it's cut), raising a glass for the toast (o.toast 0..1: the arm up, the flute over the head).
const BQ_DRESS = { tops: ['blazer', 'blazer', 'dress', 'jacket', 'blazer', 'dress'], heads: ['short', 'short', 'bald', 'bun', 'long', 'bob', 'curly', 'short', 'pony', 'afro', 'bun', 'short'] };
function bqGuest(x, y, u, o = {}) {
  if (typeof crowdFig !== 'function') return;
  const seed = o.seed ?? 1, h = i => hash(seed * 5.71 + i * 1.93);
  const build = { top: BQ_DRESS.tops[Math.floor(h(1) * 6)], head: BQ_DRESS.heads[Math.floor(h(2) * 12)], bag: 'none', phone: false, umbrella: false };
  const B = crowdBuild(seed, build), cut = o.cut ?? 6.2, col = o.col || '#2A2830', key = o.key || 'bqg' + seed, fo = { key, hatchKey: o.hatchKey, outline: o.outline };
  crowdFig(x, y, u, { view: 'audience', cut, build, seed, t: o.t, col, key, idle: .7, outline: o.outline, hatchKey: o.hatchKey, cull: o.cull });
  const k = o.toast || 0; if (k < .02) return;
  const sd = B.side, sw = 2.05 * B.broad, shY = CR.sh * B.ht, oy = cut * B.ht, P = (px, py) => [x + px * u, y + (py + oy) * u];
  const S = P(sd * sw * .72, shY + .55), E = P(sd * (sw + .6), lerp(shY + 2.8, shY + 1.3, k)), Wr = P(sd * lerp(sw * .75, sw + .1, k), lerp(shY + 3.6, shY - 1.5, k));
  crPaint(ribbon([S, E, Wr], .8 * u, .6 * u), col, fo, 'tarm');
  crPaint(oval(Wr[0], Wr[1], .36 * u, .38 * u, 0, 10), col, fo, 'thand');
  const gx = Wr[0], gy = Wr[1] - .25 * u;
  crPaint([[gx - .07 * u, gy], [gx + .07 * u, gy], [gx + .07 * u, gy - .95 * u], [gx - .07 * u, gy - .95 * u]], col, fo, 'tstem');
  crPaint(curvy([[gx - .32 * u, gy - 2.5 * u], [gx + .32 * u, gy - 2.5 * u], [gx + .24 * u, gy - 1.35 * u], [gx, gy - .9 * u], [gx - .24 * u, gy - 1.35 * u]], 3), col, fo, 'tbowl');
}
// The guests' glasses: most go up for the toast a little after the bosses' (each on its own delay), held, then down
// again after the lamp; a few carry on talking.
function bqGuestToast(lt, seed) {
  const T_ = BUNKER.times, h = i => hash(seed * 2.31 + i * 7.7);
  if (h(1) < .22) return 0;
  const a = T_.toast[0] + .15 + .5 * h(2), b = T_.lamp + .5 + 1.2 * h(3);
  return ease(seg(lt, a, a + .3)) * (1 - ease(seg(lt, b, b + .4)));
}
// The silhouette rows. A row: { x0, x1, y (where they're cut), u, n, seed, loft (a stone gallery parapet in front of
// them, its top at y), col, cap }. Drawn at the start of the cast's pass (after bankVignetteEnd: the diners' vignettes
// would clear them away with the hall's lines), engraved as figures with a fine outline (bankFigure: contour hatching,
// so they don't melt into the wall's rules) but pale (BANK.cap, default .45): set back in value.
function bqRows(t, lt, rows) {
  const c0 = BANK.cap;
  try { for (const r of rows) { BANK.cap = Math.min(c0 ?? 1, r.cap ?? .45); bqRow(t, lt, r); } } finally { BANK.cap = c0; }
}
function bqRow(t, lt, r) {
  const n = r.n, gp = (r.x1 - r.x0) / n, fig = typeof bankFigure === 'function' ? bankFigure : f => f();
  for (let i = 0; i < n; i++) {
    const s = (r.seed || 1) * 100 + i, x = r.x0 + (i + .5) * gp + (hash(s * 1.7) - .5) * gp * .35, u = r.u * lerp(.95, 1.05, hash(s * 3.1));
    boilSeed('bq guest' + s);
    fig(() => bqGuest(x, r.y + 4, u, { seed: s, t, toast: bqGuestToast(lt, s), key: 'bqg' + s, hatchKey: 'bqrow' + r.seed, col: r.col, outline: .7 }));
  }
  if (r.loft) { const c = BANK.cap; BANK.cap = Math.min(c, .55); bqLoft(r.x0 - 24, r.x1 + 24, r.y, r.u); BANK.cap = c; }
}
// A stone gallery front (the loft the guests sit in): a coping, a traceried parapet, a moulded string course, corbels.
function bqLoft(x0, x1, y, u) {
  const h = 2.6 * u;
  boilSeed('bq loft' + x0);
  piece(bkBox(x0 - 8, y - 6, x1 + 8, y + 8, 3, 30), BKC.ribLt, { sw: 1.3, key: 'bqlcope' + x0, lift: 4 });
  bkLit([0, -1], () => piece(bkBox(x0, y + 8, x1, y + h, 2, 30), BKC.rib, { sw: 1.4, shade: BKC.ribDk, depth: 8, key: 'bqlpar' + x0, lift: 4 }));
  if (BKB()) BNO.balustrade(x0 + 10, x1 - 10, y + 12, y + h - 6, Math.max(4, Math.round((x1 - x0) / 46)), { key: 'bqlbal' + x0, col: BKC.ribLt, psw: .6 });
  piece(bkBox(x0 - 14, y + h, x1 + 14, y + h + 14, 3, 30), BKC.ribDk, { sw: 1.2, key: 'bqlstr' + x0, lift: 4 });
  for (let x = x0 + 30; x < x1 - 10; x += 90) piece(curvy([[x - 12, y + h + 14], [x + 12, y + h + 14], [x + 6, y + h + 44], [x - 6, y + h + 44]], 2), BKC.ribDk, { sw: 1, key: 'bqlcb' + x0 + '_' + x, lift: 3, flatCard: true });
}
// Behind the diners (in the hall's light layer): the grand hall's chandeliers over the side bays; Musk's and Zuck's
// thrones (the others' would be lost in their vignettes).
function bqBack(t, lt, k) {
  if (BQ[k].nave) for (const dx of [-600, -1030]) { push(); translate(dx, 10); bkChandelier(t); pop(); glow(960 + dx, 120, 260, BKC.warm, .3 * bkFlick(t, dx)); }   // (the grand hall: more chandeliers)
  for (const f of BQ[k].cast) if (f.seat && f.chair) bkChair(f.x, f.y, f.u, f.face, f.chair);
}
// A silver candlestick with a lit candle, standing on the table at (x, y).
function bqStick(x, y, t, key) {
  boilSeed('bq stick ' + key);
  piece(oval(x, y, 15, 4, 0, 16), BKC.silver, { sw: 1, shade: BKC.silverDk, depth: 3, key: key + 'ft', lift: 2 });
  piece(curvy([[x - 12, y - 2], [x + 12, y - 2], [x + 4, y - 12], [x + 5, y - 40], [x + 9, y - 46], [x - 9, y - 46], [x - 5, y - 40], [x - 4, y - 12]], 2), BKC.silver, { sw: 1.1, shade: BKC.silverDk, depth: 4, key: key + 'st', lift: 3 });
  bkCandle(x, y - 46, 9, 30, t, key.length + 11, key + 'c', { ga: .7 });
}
// What's on the table: bkTable at the layout's size, then its spread: ['plate', x] · ['dome', x, s] · ['roast', x, s] ·
// ['tower', x, rows, key] · ['bucket', x, s] · ['stick', x] · ['candelabra', x, s]. o.tower: draws Grok's tower instead
// (Z2's knocked one).
function bqTable(t, lt, k, o = {}) {
  const L = BQ[k], y = L.table.top + 16;
  bkTable(t, L.table);
  L.spread.forEach(([kind, x, a, b], i) => {
    if (kind === 'plate') bkPlate(x, y + 6, 46, 'bqpl' + i);
    else if (kind === 'dome') bkDome(x, y + 2, a, t, 'bqdome' + i);
    else if (kind === 'roast') bkRoast(x, y + 2, a, t);
    else if (kind === 'bucket') bkBucket(x, y + 4, a, t);
    else if (kind === 'stick') bqStick(x, y + 4, t, 'bqst' + i);
    else if (kind === 'candelabra') bkCandelabra(x, y + 2, a, t, 'bqcdb' + i, { ga: .6, sw: .9 });
    else if (kind === 'tower') { if (o.tower && b === 'bk') o.tower(); else bkTower(x, BUNKER.tower[1], t, b === 'bk' ? bkPourK(lt) : .3, a, b); }
  });
  glow(960, L.table.top - 10, 520, BKC.warm, .16);
  boilSeed('bk table done');
}
// The cast round the table, far to near: the guests (bqRows; o.noRows leaves them out), the hovering staff behind, the
// diners' backs, the table and its spread (inside zuck()'s table callback), the staff standing on it, the diners' front
// arms. o: staff (the bots' emotion spread),
// grok (gk => changes Grok's options), table (draws the table instead of bqTable), onTable (drawn after the staff on
// the table: Z2's flying coupe), mk / zk (over Musk's / Zuck's acting), tweak ((f, opts) => a staff figure's options,
// e.g. a duck as the plane goes by); plan (bqPlan's, if the scene has it already).
function bqCast(t, lt, k, o = {}) {
  const L = BQ[k], P = o.plan || bqPlan(t, lt, k, o), seated = L.cast.filter(f => f.seat && f.who !== 'zuck');
  const fig = (f, layer, table) => {
    const w = f.who, op = P[L.cast.indexOf(f)];
    if (w === 'musk') musk(f.x, f.y, f.u, { ...op, layer });
    else if (w === 'zuck') zuck(f.x, f.y, f.u, { ...op, table });
    else if (f.seat) window[w](f.x, f.y, f.u, { ...op, layer });
    else if (w === 'grok') grok(f.x, f.y, f.u, op);
    else if (w === 'muse') muse(f.x, f.y, f.u, op);
    else if (w === 'copilot') copilot(f.x, f.y, f.u, op);
    else if (w === 'codex') bqPet(t, f, op);
  };
  if (L.rows.length && !o.noRows) bqRows(t, lt, L.rows);   // (the guests, furthest back)
  L.cast.filter(f => f.at === 'behind').forEach(f => fig(f));
  seated.forEach(f => fig(f, 'back'));
  const onTable = () => {
    if (o.table) o.table(); else bqTable(t, lt, k);
    L.cast.filter(f => f.at === 'table').forEach(f => fig(f));
    if (o.onTable) o.onTable();
    seated.forEach(f => fig(f, 'front'));
  };
  const z = L.cast.find(f => f.who === 'zuck');
  if (z) fig(z, 'all', onTable); else onTable();
  L.cast.filter(f => f.at === 'front').forEach(f => fig(f));
}
// The banquet's pre-pass: every figure's rig options this frame, in BQ[k].cast's order, worked out once and used both to
// draw it (bqCast) and to place its vignette (bqHaloOvals), so a halo can't part from its figure when it leans, laughs,
// hovers or ducks. (t, lt, k, o) as bqCast's.
function bqPlan(t, lt, k, o = {}) {
  const L = BQ[k] || BQ[0], T_ = BUNKER.times, A = bkActing(lt), Bt = bkBots(lt), look = ease(seg(lt, T_.lamp + .1, T_.lamp + .35));
  const staff = o.staff || { ...emotions(lt, [[0, 'happy'], [T_.lamp + .1, 'surprised'], [T_.lamp + .9, 'neutral']], { take: .6 }), emote: null };
  const door = BUNKER.door[0], tw = (f, op) => (o.tweak ? o.tweak(f, op) || op : op);
  return L.cast.map(f => {
    const w = f.who;
    if (w === 'musk') return { ...A.mk, ...o.mk };
    if (w === 'zuck') return { ...A.zk, ...o.zk };
    if (f.seat) return bqToast(lt, f);
    if (w === 'grok') {
      const gk = { ...Bt.gk, ...staff };
      if (f.pour === 0) Object.assign(gk, { pour: 0, bottleTilt: .45 + .08 * Math.sin(lt * 2.1) });   // (the bottle at the ready)
      if (o.grok) o.grok(gk);
      return gk;
    }
    if (w === 'muse') {
      const toDoor = (door > f.x ? 1 : -1) * (f.flip ? -1 : 1);
      return tw(f, { ...Bt.mu, ...staff, flip: !!f.flip, tray: f.tray, alt: f.alt, lookX: lerp(f.flip ? -.2 : .2, toDoor, look), boilKey: 'muse' + (f.key || ''), seed: 4 + (f.key || 0) * 3 });
    }
    if (w === 'copilot') return tw(f, { ...staff, view: 'q', flip: !!f.flip, pose: 'present', card: s => bkDome(0, s * .34, s * .6, t, 'bqcpdome'), boilKey: 'bqcop', seed: 9 });
    if (w === 'codex') return bqPetOpts(lt, f, staff, o.tweak);
    return {};
  });
}
// A Codex pet as a waiter on the table: a dish held up over its head in both hands (no hop: it's carrying, the dish
// sways a little), looking round at the lamp with the rest of the staff. bqPetOpts: its options (bqPlan); bqPet draws it.
function bqPetOpts(lt, f, staff, tweak) {
  const T_ = BUNKER.times, id = f.x, sway = .12 * Math.sin(lt * 2.3 + id), look = ease(seg(lt, T_.lamp + .12, T_.lamp + .4));
  const op = { ...staff, kind: f.kind, view: 'q', flip: !!f.flip, pose: { L: [-1.35, -4.5 + sway, .25, 'open', 1], R: [1.35, -4.5 - sway, .25, 'open', 1] },
    lookY: -.4 * (1 - look), lookX: look * (BUNKER.door[0] > f.x ? 1 : -1) * (f.flip ? -1 : 1), boilKey: 'bqpet' + id, seed: 11 + id % 5 };
  return tweak ? tweak(f, op) || op : op;
}
function bqPet(t, f, op) {
  const id = f.x, a = codex(f.x, f.y, f.u, op);
  const L = a && a.hands && a.hands.L, R = a && a.hands && a.hands.R; if (!L || !R) return;
  const x = (L[0] + R[0]) / 2, y = Math.min(L[1], R[1]) - .15 * f.u, s = f.u;
  boilSeed('bq pet dish' + id);
  piece(oval(x, y, 1.9 * s, .32 * s, 0, 24), BKC.silver, { sw: 1, shade: BKC.silverDk, depth: 3, key: 'bqpdt' + id, lift: 2 });
  if (f.dish === 'dome') bkDome(x, y - 2, 1.3 * s, t, 'bqpdd' + id);
  else if (f.dish === 'flutes') for (let i = -1; i <= 1; i++) { push(); translate(x + i * .8 * s, y - .1 * s); flute(.42 * s, .7, 0, 'bqpdf' + id + i); pop(); }
  else for (let i = 0; i < 5; i++) piece(oval(x + (i - 2) * .62 * s, y - .28 * s - (i % 2) * .18 * s, .32 * s, .22 * s, 0, 10), i % 2 ? BKC.roastLt : BKC.clothLt, { sw: .7, key: 'bqpdc' + id + i, lift: 1, flatCard: true });
}
// ---------- the grand hall (Z2) ----------
// Beyond the chancel arch the hall goes on: a nave in one-point perspective, arcades down both sides, a rib across it at
// every pier, chandeliers over the table, the server-rack organ small at the far end; down the middle a long banquet
// table with rows of guests on both sides, receding, raising their glasses with everyone else, coupe towers and
// candelabra along it. (Its vanishing point sits higher than the front floor's (960, 330): we look down the
// table, so its top recedes as a surface and the rows of heads climb away above the bosses' heads, clear of their
// vignettes.) A nave point: X across and Hr up from the floor, in px at depth d = 1 (the head table's plane); d = how
// far back (the back wall's plane, where the nave opens: 1.248).
const BQN = { vp: 200, g: 736, d0: 1.248, d1: 5.6, hw: 446, cap: 380, arch: 170, vault: 330, tw: 118, th: 161, seat: 180, bays: 6, tn: 1.5, tg: 1.95, tf: 5.1 };
const bqRP = (X, Hr, d) => [960 + X / d, BQN.vp + (BQN.g - Hr) / d];
// Draw fn's pieces (around its own anchor ax, ay) standing at nave point (X, Hr, d), at scale s (as if at d = 1).
function bqNAt(X, Hr, d, s, ax, ay, fn) { const [x, y] = bqRP(X, Hr, d); push(); translate(x, y); scale(s / d); translate(-ax, -ay); fn(); pop(); }
function bqNave(t, lt) {
  const N = BQN, P = bqRP, dj = j => N.d0 * Math.pow(N.d1 / N.d0, j / N.bays), top = N.cap + N.arch + N.vault;
  boilSeed('bq nave');
  // the far wall, the organ on it
  piece([P(-N.hw, 0, N.d1), P(N.hw, 0, N.d1), P(N.hw, top, N.d1), P(-N.hw, top, N.d1)], BKC.wall, { sw: 1, key: 'bqnfw', lift: 0 });
  bqNAt(0, 0, N.d1, 1.248, 960, 800, () => bkOrgan(t));
  glow(...P(0, 300, N.d1), 110, BKC.warm, .3);
  // the floor, its paving running to the vanishing point
  piece([P(-N.hw, 0, N.d0), P(N.hw, 0, N.d0), P(N.hw, 0, N.d1), P(-N.hw, 0, N.d1)], BKC.floor, { sw: 1, key: 'bqnfl', lift: 0 });
  for (let i = -4; i <= 4; i++) dline([P(i * N.hw / 4.5, 0, N.d0), P(i * N.hw / 4.5, 0, N.d1)], .45, BKC.floorLt);
  for (let j = 1; j < 14; j++) { const d = N.d0 * Math.pow(N.d1 / N.d0, j / 14); dline([P(-N.hw, 0, d), P(N.hw, 0, d)], .4, BKC.floorLt); }
  // the side walls: an arch into the dark aisle in every bay, piers between, far to near (a shade deeper than the hall)
  const cA = BANK.cap; BANK.cap = Math.max(cA ?? .4, .52);
  for (const sd of [-1, 1]) {
    const X = sd * N.hw;
    boilSeed('bq nave wall' + sd);
    piece([P(X, 0, N.d0), P(X, 0, N.d1), P(X, top, N.d1), P(X, top, N.d0)], BKC.wall, { sw: 1, key: 'bqnw' + sd, lift: 0 });
    for (let j = N.bays - 1; j >= 0; j--) {
      const a = dj(j) * 1.04, b = dj(j + 1) * .96, A = [P(X, 0, a)];
      for (const [ux, uy] of bkArch(0, 0, 1, 1, 8)) A.push(P(X, N.cap - uy * N.arch, lerp(a, b, (ux + 1) / 2)));
      A.push(P(X, 0, b));
      piece(A, BKC.deep, { sw: .9, key: 'bqna' + sd + j, lift: 0 });
      glow(...P(X - sd * 20, N.cap * .5, (a + b) / 2), 60 / a, BKC.warm, .12);
    }
    for (let j = N.bays; j >= 1; j--) {
      const d = dj(j), w = 24 / d, [x0, y0] = P(X, 0, d), [, y1] = P(X, N.cap + N.arch * .5, d), xi = x0 - sd * w * .7;
      piece([[xi - w, y0], [xi + w, y0], [xi + w, y1], [xi - w, y1]], BKC.rib, { sw: .9, shade: BKC.ribDk, depth: 3 / d, key: 'bqnp' + sd + j, lift: 2 });
    }
  }
  // the vault: a rib across the nave at every pier, the ridge
  for (let j = N.bays; j >= 1; j--) { const d = dj(j), [, cy] = P(0, N.cap + N.arch * .5, d); dline(bkArch(960, cy, N.hw / d, (N.arch * .5 + N.vault) / d, 14), 1.4 / Math.sqrt(d), BKC.ribLt); }
  dline([P(0, top, N.d0), P(0, top, N.d1)], .7, BKC.ribLt);
  BANK.cap = cA;
  // the long table and its guests, far to near: each stretch of table, the guests beside it, what's on it
  const n = 12, dk = k => N.tf * Math.pow(N.tn / N.tf, k / n), c0 = BANK.cap;   // (k 0 far .. n near; guests beside every stretch from BQN.tg back)
  boilSeed('bq nave table');
  for (let k = 0; k < n; k++) {
    const da = dk(k), db = dk(k + 1), g = (da + db) / 2;
    piece([P(-N.tw, N.th, da), P(N.tw, N.th, da), P(N.tw, N.th, db), P(-N.tw, N.th, db)], BKC.clothLt, { sw: .8, key: 'bqnt' + k, lift: 1 });
    BANK.cap = Math.max(c0 ?? .4, .5);   // (the guests a shade darker than the hall they sit in)
    if (g > N.tg) for (const sd of [-1, 1]) {
      const s = 700 + k * 2 + (sd > 0 ? 1 : 0), [gx, gy] = P(sd * N.seat, N.th - 6, g), u = 31 / g * .86, fig = typeof bankFigure === 'function' ? bankFigure : fn => fn();
      boilSeed('bq nave guest' + s);
      fig(() => bqGuest(gx, gy, u, { seed: s, t, toast: bqGuestToast(lt, s), key: 'bqng' + s, hatchKey: 'bqnave' + sd, outline: .6, col: '#2E2C36', cull: false }));
    }
    BANK.cap = c0;
    if (k % 4 === 1) bqNAt(0, N.th, g, 1, 0, 0, () => bkCandelabra(0, 0, 6.5, t, 'bqnc' + k, { ga: .6, sw: .8 }));
    else if (k % 4 === 3) bqNAt(0, N.th, g, 1, 0, 0, () => bkTower(0, 0, t, .2, 3, 'bqnT' + k));
  }
  // the near end's cloth, down to the floor
  piece([P(-N.tw, N.th, N.tn), P(N.tw, N.th, N.tn), P(N.tw + 6, 0, N.tn), P(-N.tw - 6, 0, N.tn)], BKC.cloth, { sw: .9, key: 'bqntend', lift: 2 });
  // chandeliers over the table
  for (const d of [4.4, 3.2, 2.3]) { bqNAt(0, 600, d, .6, 960, 118, () => bkChandelier(t)); glow(...P(0, 520, d), 240 / d, BKC.warm, .3); }
  boilSeed('bq nave done');
}
// The bank look's vignettes for a size (bkHaloOvals hands off here): one oval per figure (the named cast and the staff;
// the silhouette guests have none). With the frame's plan (bqPlan) each is placed from its figure's pose this frame
// (style.js figHalo), so it moves with a lean, a laugh, a hover or a duck; without, from its ground point.
// BQ_HALO: each figure's oval about its head (figHalo's fit, in its u; s: its size), where the seat-placed ovals sat on
// it upright and still, so a still figure's vignette is as it was.
const BQ_HALO = { musk: { dx: -.1, dn: .65 }, zuck: { dx: .15, dn: -1.3 }, dorsey: { dx: -.6, dn: 1.45, s: .95 }, turnbull: { dx: -.5, dn: .3, s: .95 },
  altman: { dx: -.5, dn: -.65, s: .95 }, grok: { s: .9 }, muse: { s: .85 }, copilot: { s: .8 }, codex: { s: .55 } };
function bqHaloOvals(k = 0, amt = 1, plan = null) {
  const L = BQ[k] || BQ[0], out = [];
  if (plan && typeof figHalo === 'function') {
    L.cast.forEach((f, i) => { const h = BQ_HALO[f.who], s = h ? h.s ?? 1 : 1; if (h) out.push(figHalo(f.who, f.x, f.y, f.u, plan[i], { dx: h.dx, dn: h.dn, rx: 5.4 * s, ry: 7 * s, k: .82 * amt })); });
    return out;
  }
  for (const f of L.cast) {
    if (f.seat) out.push(bkHaloOf(f.x + f.face * 14, f.y, f.u, f.who === 'musk' || f.who === 'zuck' ? 1 : .95, amt));
    else if (f.who === 'grok') out.push(bkHaloOf(f.x, f.y, f.u, .9, amt, 7.5));
    else if (f.who === 'muse') out.push(bkHaloOf(f.x, f.y, f.u, .85, amt, 5.3 + (f.alt ?? 3.2)));
    else if (f.who === 'copilot') out.push(bkHaloOf(f.x, f.y, f.u, .8, amt, 5.2));
    else if (f.who === 'codex') out.push(bkHaloOf(f.x, f.y, f.u, .55, amt, 2.4));
  }
  return out;
}
// Model sheet: the banquet's guests (bqGuest) in the bank look as bqRows prints them (pale, engraved as figures, a fine
// outline), over a wall's rules, toasting on a loop: a loft row (u 24) and a nave row (u 14) (render.mjs --loop=bqGuests).
LOOPS.bqGuests = t => {
  look('bank'); bankPaper(0, 0, W, H);
  for (let y = 60; y < H - 40; y += 9) dline([[0, y], [W, y + 3 * Math.sin(y)]], .5, mixCol(BANK.ink, BANK.paper, .55));
  const c0 = BANK.cap; BANK.cap = .45;
  try {
    [[440, 24, 118, 0], [860, 14, 70, 1]].forEach(([y, u, gap, k]) => {
      for (let i = 0; i < Math.floor((W - 160) / gap); i++) { const s = 40 + i + k * 40; boilSeed('bqgs' + s); bankFigure(() => bqGuest(120 + i * gap, y, u * lerp(.95, 1.05, hash(s)), { seed: s, t, toast: bqGuestToast(1.3 + .4 * Math.sin(t), s), key: 'bqgs' + s, hatchKey: 'bqgs' + k, outline: .7 })); }
    });
  } finally { BANK.cap = c0; }
};
LOOPS.bqGuests.len = 4;


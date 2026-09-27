// sets/past.js: THE PROMISE (shot B). A faded 1930s rubber-hose cartoon advert for automated leisure ("Think of all the
// time you'll save"): a sunny garden, a sun with a face bouncing on the beat, two trees with faces swaying, a gent in a
// hammock, a boxy robot butler who strolls in and serves him a cocktail, a cuckoo clock whose hands spin backward and
// whose face breaks into a smile, a wink at camera, then the film jams and burns through.
//
// Palette: the faded two-strip look (NOIR.past*), outlines in NOIR.pastInk. Old film on top: gate weave, flicker,
// scratches, dust, a vignette and the projector's rounded gate. The same code draws both looks (ink and card).
//
//   pastScene(t, lt, o)      the whole 1920×1080 frame. t = video time, lt = time in the shot (0..4.29).
//                            o.still: no jam and no burn (for the small view through the train window).
//                            o.noBurn: skip the burn (then draw burnHole yourself, in screen space, after camEnd()).
//                            o.gate: false hides the projector's rounded gate corners.
//   burnPoly(cx, cy, r, t)   the burn hole's outline: irregular, organic, flickering a little, stable as it grows.
//   burnHole(p, t)           end of shot B, screen space: a blister, then a black hole with a glowing charred edge; the
//                            scorch browns the rest of the frame to black by p = 1.
//   burnReveal(p, t, o)      start of shot C, screen space: the same hole keeps growing with the new shot inside it,
//                            charred black outside, until the frame is clear at p = 1. o.outside(): a picture drawn
//                            round the hole instead of the black (B1 opens with C2f's last frame), the rim's bands over it.
//                            burnHole(1) and burnReveal(0) match everywhere except inside the hole (black → the new shot).
// No camera here (the caller's camera may be active): weave and shake use push()/translate().
// The gent and the butler are drawn in the rubber-hose idiom (psGentRH, psRobotRH): the user, 2026-09-25, superseding the
// original drawings (git tag backup/ad-old-gent-butler is the last commit with them the default).

const PS = {
  sky: NOIR.pastSky, rose: NOIR.pastRose, mint: NOIR.pastMint, teal: NOIR.pastTeal, gold: NOIR.pastGold, ink: NOIR.pastInk,
  black: NOIR.ink,
};
Object.assign(PS, {
  skyHi: mixCol(PS.sky, PS.teal, .34), skyMid: mixCol(PS.sky, PS.teal, .16), cloud: mixCol(PS.sky, '#FFFBF0', .6), cloudDk: mixCol(PS.sky, PS.teal, .28),
  hillFar: mixCol(PS.rose, PS.sky, .5), hillMid: mixCol(PS.mint, PS.sky, .28), hillDk: mixCol(PS.teal, PS.sky, .25),
  lawn: mixCol(PS.mint, PS.gold, .12), lawnDk: mixCol(PS.mint, PS.teal, .55), lawnLt: mixCol(PS.mint, PS.sky, .4),
  bark: mixCol(PS.rose, PS.ink, .4), barkDk: mixCol(PS.rose, PS.ink, .6), barkLt: mixCol(PS.rose, PS.ink, .2),
  leaf: PS.teal, leafDk: mixCol(PS.teal, PS.ink, .3), leafLt: mixCol(PS.mint, PS.sky, .2),
  sunDk: mixCol(PS.gold, PS.rose, .55), cheek: mixCol(PS.rose, '#D0706A', .5), mouth: mixCol(PS.ink, '#6A2A2A', .35), tongue: mixCol(PS.rose, '#C85A5A', .45),
  white: mixCol(PS.sky, '#FFFBF0', .7),
  skin: mixCol(PS.rose, PS.sky, .45), skinDk: mixCol(PS.rose, PS.sky, .05), hair: mixCol(PS.ink, '#2A1E1A', .3),
  straw: mixCol(PS.gold, PS.sky, .3), strawDk: mixCol(PS.gold, PS.ink, .25), flannel: mixCol(PS.sky, '#FFFBF0', .25), flannelDk: mixCol(PS.sky, PS.ink, .16),
  blazer: PS.rose, blazerDk: mixCol(PS.rose, PS.ink, .28),
  brass: mixCol(PS.gold, PS.rose, .18), brassDk: mixCol(PS.gold, PS.ink, .3), brassLt: mixCol(PS.gold, '#FFF6DA', .5),
  steel: mixCol(PS.teal, PS.ink, .35), steelDk: mixCol(PS.teal, PS.ink, .55), tux: mixCol(PS.ink, PS.teal, .25),
  wood: mixCol(PS.rose, PS.ink, .3), woodDk: mixCol(PS.rose, PS.ink, .52), glass: mixCol(PS.sky, PS.teal, .22), drink: mixCol(PS.rose, '#D85A78', .6),
  hot: '#FFE39A', ember: '#E8762E', char: '#2E1C16',
});
// Where things are, in the scene's own 1920×1080 frame.
const PSX = {
  treeL: [215, 928, 545], treeR: [1178, 918, 535], sun: [690, 168, 84],
  hips: [668, 806], g: 40,                        // the gent: his hips (the hammock's low point), unit
  clock: [636, 496, 58],                          // the cuckoo clock's dial centre and radius
  bot: { x0: 2200, x1: 1436, y: 995, u: 38 },     // the robot: enters at x0, stops at x1
  meet: [1080, 596],                              // the handoff: the tray hand's wrist when the gent takes the glass
  under: [1075, 690],                             // (the tray's way there and back, under the right tree's chin)
  burn: [960, 540],
};
// The shot's timeline (lt, s). Shot B starts 12 beats in, so lt and the video share the beat grid.
const PST = {
  enter: .86, stop: 1.5, lean: 1.55, reach: 1.63, meet: 1.82, take: 1.88, back: 1.94, bow: 2.02,
  clock: 2.16, spin0: 2.28, spin1: 2.72, smile: 2.66, turn: 2.86, wink: 3.0, jam: 3.26, burn: 3.6, end: 4.29,
};

// ---------- small helpers ----------
const psSW = 1.7;
const psP = (P, col, o = {}) => piece(P, col, { ink: PS.ink, sw: psSW, ...o });
const psL = (P, sw, col = PS.ink, curv = .5) => dline(P, sw, col, curv);
// An expression mark (closed eyes, a smile, a brow) as a solid tapered stroke, so it reads in both looks: w px thick.
const psStroke = (P, w, col = PS.ink, key = 'stroke') => piece(ribbon(P, w * .55, w), col, { ink: null, key, lift: 1, flatCard: true, edge: false });
// A scalloped blob (clouds, tree crowns): n lobes around an ellipse, each an arc bulging out by ~d, with sharp valleys.
function psScallop(cx, cy, rx, ry, n, d, rot = 0, ph = 0, per = 5, seed = 0) {
  const P = [];
  for (let i = 0; i < n; i++) {
    const a0 = ph + i / n * TAU, a1 = ph + (i + 1) / n * TAU, dd = d * (.75 + .5 * hash(i * 3.1 + seed));
    for (let k = 0; k < per; k++) {
      const u = k / per, a = lerp(a0, a1, u), b = Math.sin(u * Math.PI) * dd, x = Math.cos(a) * (rx + b), y = Math.sin(a) * (ry + b);
      P.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
    }
  }
  return P;
}
// A 1930s pie-cut eye: a white oval and a big dark pupil with a wedge cut out of it. (x, y) centre, w × h the white.
// o.look [-1..1, -1..1], o.open 0..1 (a lid from above, in o.skin), o.happy (a closed ∩ arc), o.pupil scale.
function psPie(x, y, w, h, o = {}) {
  const sw = o.sw ?? psSW * .8, key = o.key || 'pie' + x;
  if (o.happy || (o.open ?? 1) < .12) {
    const d = o.happy ? -1 : 1;
    psStroke([[x - w * .55, y + h * .06 * d], [x - w * .28, y - h * .17 * d], [x, y - h * .25 * d], [x + w * .28, y - h * .17 * d], [x + w * .55, y + h * .06 * d]], Math.max(3, w * .16), PS.ink, key + 'sh'); return;
  }
  psP(oval(x, y, w / 2, h / 2, 0, 20), PS.white, { sw, key: key + 'w', lift: 2, flatCard: true });
  const lk = o.look || [0, 0], pw = w * .34 * (o.pupil ?? 1), ph = h * .34 * (o.pupil ?? 1);
  const px = x + lk[0] * (w / 2 - pw) * .9, py = y + lk[1] * (h / 2 - ph) * .9 + h * .04;
  const P = [[px + pw * .2, py - ph * .2]];
  for (let i = 0; i <= 20; i++) { const a = -.45 + i / 20 * (TAU - .95); P.push([px + Math.cos(a) * pw, py + Math.sin(a) * ph]); }
  psP(P, PS.ink, { ink: null, key: key + 'p', lift: 0, flatCard: true });
  const open = clamp(o.open ?? 1);
  if (open < .97) {
    const ly = lerp(y + h * .5, y - h * .5, open), L = [];
    for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI; L.push([x + Math.cos(a) * w * .56, y + Math.sin(a) * h * .56]); }
    L.push([x + w * .56, ly], [x, ly + h * .08], [x - w * .56, ly]);
    psP(L, o.skin || PS.skin, { ink: null, key: key + 'lid', lift: 0, flatCard: true, edge: false });
    psL([[x - w * .5, ly - h * .02], [x, ly + h * .08], [x + w * .5, ly - h * .02]], sw, PS.ink, .5);
  }
}
// A four-point twinkle ("ting!"), popping in with k 0..1.
function psTwinkle(x, y, r, k) {
  if (k <= .02) return;
  const s = backOut(k) * r;
  psP(starPts(x, y, s, .2, 4, -Math.PI / 2), PS.white, { sw: psSW * .6, key: 'pstw' + x, lift: 2, flatCard: true });
  psP(starPts(x + s * .95, y - s * .75, s * .42, .28, 4, -Math.PI / 2), PS.gold, { sw: psSW * .45, key: 'pstw2' + x, lift: 1, flatCard: true });
}

// ---------- the world ----------
function psSky() {
  boilSeed('ps sky');
  piece([[-160, -160], [W + 160, -160], [W + 160, H + 160], [-160, H + 160]], PS.skyHi, { ink: null, lift: 0, key: 'pssky' });
  const band = (y, a, ph) => { const P = [[-160, H + 160]]; for (let i = 0; i <= 12; i++) P.push([-160 + i / 12 * (W + 320), y + a * Math.sin(i * .9 + ph)]); P.push([W + 160, H + 160]); return P; };
  piece(band(205, 9, 1), PS.skyMid, { ink: null, lift: 0, key: 'psskym' });
  piece(band(372, 7, 2.5), PS.sky, { ink: null, lift: 0, key: 'psskyl' });
}
// The sun bounces like a ball on every beat: up between beats, a squash as it lands.
function psSun(tt) {
  const [x, y, r] = PSX.sun, f = frac(bpOf(tt)), hop = Math.sin(f * Math.PI), land = Math.exp(-f * 7);
  const sq = .12 * land - .05 * hop, dy = -24 * hop + 5 * land;
  boilSeed('ps sun');
  push(); translate(x, y + dy + r); scale(1 + sq, 1 - sq); translate(0, -r); nudge('pssun', 1.5);
  const spin = tt * .3, pump = 1 + .07 * land;
  const rays = (n, r0, r1, off, wk) => { const P = []; for (let i = 0; i < n; i++) { const a = spin + off + i / n * TAU, w = Math.PI / n * wk; P.push([Math.cos(a - w) * r0, Math.sin(a - w) * r0], [Math.cos(a - w * .2) * r1 * .96, Math.sin(a - w * .2) * r1 * .96], [Math.cos(a + w * .2) * r1 * .96, Math.sin(a + w * .2) * r1 * .96], [Math.cos(a + w) * r0, Math.sin(a + w) * r0]); } return P; };
  psP(rays(12, r * .9, r * 1.72 * pump, 0, .62), PS.rose, { key: 'psrays1', lift: 3 });
  psP(rays(12, r * .9, r * 1.4 * pump, Math.PI / 12, .55), PS.gold, { key: 'psrays2', lift: 3 });
  psP(oval(0, 0, r, r, 0, 36), PS.gold, { sw: psSW * 1.15, shade: PS.sunDk, depth: r * .2, key: 'psdisc', lift: 4 });
  for (const s of [-1, 1]) psP(oval(s * r * .54, r * .2, r * .18, r * .11, 0, 16), PS.cheek, { ink: null, key: 'pscheek' + s, lift: 0, flatCard: true });
  const blink = frac(tt / 3.1 + .3) < .035;
  for (const s of [-1, 1]) psPie(s * r * .3, -r * .18, r * .3, r * .44, { look: [.3, .4], happy: blink, key: 'pssune' + s });
  psP(curvy([[-r * .45, r * .22], [0, r * .3], [r * .45, r * .22], [r * .3, r * .55], [0, r * .66], [-r * .3, r * .55]], 5), PS.mouth, { sw: psSW * .8, key: 'psmouth', lift: 1, flatCard: true });
  psP(curvy([[-r * .2, r * .56], [0, r * .47], [r * .2, r * .56], [0, r * .64]], 4), PS.tongue, { ink: null, key: 'pstongue', lift: 0, flatCard: true });
  pop();
}
function psCloud(x, y, s, key, tt) {
  boilSeed('ps cloud ' + key);
  push(); translate(x + 6 * Math.sin(tt * .5 + x), y + 4 * Math.sin(bpOf(tt) * Math.PI / 2 + x)); nudge('pscl' + key, 1);
  psP(psScallop(0, 0, 120 * s, 40 * s, 9, 30 * s, 0, .2, 5, x), PS.cloud, { sw: psSW * .9, shade: PS.cloudDk, depth: 16 * s, key: 'pscloud' + key, lift: 2 });
  pop();
}
function psHills(tt) {
  boilSeed('ps hills');
  const hill = (pts, col, key, lift) => psP(curvy(pts, 6), col, { key, lift, sw: psSW * .9 });
  hill([[-200, 720], [-200, 560], [180, 508], [560, 548], [900, 526], [1260, 500], [1620, 522], [2120, 480], [2120, 720]], PS.hillFar, 'pshillf', 2);
  for (const [lx, ly, s] of [[1480, 518, .9], [1532, 510, 1.1], [1840, 494, .8]]) {   // lollipop trees
    psL([[lx, ly], [lx, ly - 34 * s]], psSW * .9, PS.barkDk, 0);
    psP(oval(lx, ly - 46 * s, 20 * s, 22 * s, 0, 16), PS.hillDk, { sw: psSW * .7, key: 'pslol' + lx, lift: 2, flatCard: true });
  }
  // a cottage on the far hill, smoke curling from its chimney on the beat
  const cx = 1700, cy = 508, puff = frac(bpOf(tt) / 2);
  const sm = []; for (let i = 0; i <= 6; i++) { const k = i / 6; sm.push([cx + 30 - k * 60 + 12 * Math.sin(k * 5 - tt * 4), cy - 96 - k * 90]); }
  psP(ribbon(sm, 12, 30), PS.cloud, { sw: psSW * .55, key: 'pssmoke', lift: 2, flatCard: true });
  psP([[cx + 22, cy - 62], [cx + 22, cy - 94], [cx + 38, cy - 94], [cx + 38, cy - 50]], PS.wood, { sw: psSW * .7, key: 'pschim', lift: 2 });
  psP([[cx - 50, cy], [cx - 50, cy - 40], [cx, cy - 78], [cx + 50, cy - 40], [cx + 50, cy]], PS.white, { sw: psSW * .8, key: 'pscott', lift: 3 });
  psP([[cx - 64, cy - 34], [cx, cy - 88], [cx + 64, cy - 34], [cx + 52, cy - 30], [cx, cy - 72], [cx - 52, cy - 30]], PS.rose, { sw: psSW * .8, key: 'pscroof', lift: 2 });
  psP(rectPts(cx - 12, cy - 30, 24, 30), PS.wood, { sw: psSW * .6, key: 'pscdoor', lift: 1, flatCard: true });
  psP(rectPts(cx + 20, cy - 32, 18, 16), PS.gold, { sw: psSW * .5, key: 'pscwin', lift: 1, flatCard: true });
  hill([[-200, 780], [-200, 612], [300, 630], [700, 602], [1100, 626], [1500, 598], [2120, 620], [2120, 780]], PS.hillMid, 'pshillm', 3);
}
function psFence() {
  boilSeed('ps fence');
  const y0 = 650, y1 = 748, sp = 50, pw = 32, P = [];
  for (const ry of [674, 714]) psP([[-160, ry], [W + 160, ry - 4], [W + 160, ry + 14], [-160, ry + 18]], PS.flannelDk, { sw: psSW * .7, key: 'psrail' + ry, lift: 3 });
  for (let x = -140; x < W + 140; x += sp) { const h = 6 * Math.sin(x * .013); P.push([x, y1 - 4], [x, y0 + 14 + h], [x + pw / 2, y0 + h], [x + pw, y0 + 14 + h], [x + pw, y1 - 4]); }
  P.push([W + 140, y1], [-140, y1]);
  psP(P, PS.flannel, { sw: psSW * .8, key: 'psfence', lift: 4 });
}
function psLawn() {
  boilSeed('ps lawn');
  psP(curvy([[-200, 1240], [-200, 734], [400, 728], [900, 740], [1400, 726], [2120, 738], [2120, 1240]], 6), PS.lawn, { key: 'pslawn', lift: 4, sw: psSW * .9 });
  psP(curvy([[-200, 1240], [-200, 972], [300, 956], [800, 976], [1300, 962], [2120, 970], [2120, 1240]], 6), PS.lawnDk, { key: 'pslawnf', lift: 5, sw: psSW * .9 });
  for (let i = 0; i < 6; i++) {   // stepping stones: the path the robot comes in on
    const k = i / 5, sx = lerp(1990, 1330, k), sy = lerp(1012, 1000, k) + 10 * Math.sin(i * 1.7), rx = 58 - k * 6;
    psP(psScallop(sx, sy, rx, rx * .3, 5, 5, .04 * Math.sin(i * 2.3), i, 4, i * 3), mixCol(PS.flannelDk, PS.lawn, .25), { sw: psSW * .7, key: 'psstone' + i, lift: 2, flatCard: true });
  }
  for (let i = 0; i < 16; i++) {   // grass tufts: three curved blades
    const gx = 60 + hash(i * 7.7) * 1800, gy = 790 + hash(i * 3.3) * 140 + (hash(i * 5.1) > .6 ? 175 : 0), s = .9 + .5 * hash(i), col = gy > 960 ? PS.leafDk : PS.lawnDk;
    for (const b of [-1, 0, 1]) psL([[gx + b * 3 * s, gy], [gx + b * 7 * s, gy - 9 * s], [gx + b * 13 * s, gy - (b ? 14 : 19) * s]], psSW * .55, col, .6);
  }
}
// A tulip that dances on the beat.
function psTulip(x, y, h, col, i, tt) {
  const side = (beatN(tt) + i) % 2 ? 1 : -1, k = lerp(-side, side, easeOut(clamp(frac(bpOf(tt)) * 3))), lean = .16 * k;
  const tip = [x + Math.sin(lean) * h, y - Math.cos(lean) * h], mid = [x + Math.sin(lean) * h * .4 + 4 * k, y - h * .5];
  psL([[x, y], mid, tip], psSW * 1.1, PS.leafDk, .5);
  psP(curvy([[x, y - 4], [x - 22, y - h * .35], [x - 6, y - h * .5], [x - 4, y - 10]], 3), PS.lawnDk, { sw: psSW * .6, key: 'psleaf' + i, lift: 2, flatCard: true });
  push(); translate(tip[0], tip[1]); rotate(lean * 1.3);
  psP(curvy([[-15, -4], [-17, -30], [-8, -22], [0, -36], [8, -22], [17, -30], [15, -4], [0, 8]], 4), col, { sw: psSW * .8, key: 'pstul' + i, lift: 3, flatCard: true });
  pop();
}

// ---------- trees with faces ----------
// The trunk's spine, bending with the sway (−1..1).
function psTreeSpine(x, y, h, sway) {
  const a = sway * .09;
  return [[x, y], [x + Math.sin(a) * h * .2, y - h * .35], [x + Math.sin(a * 1.6) * h * .55, y - h * .72], [x + Math.sin(a * 2) * h * .75, y - h]];
}
function psSpineAt(S, k) { const C = through(S, 8), i = Math.min(C.length - 2, Math.floor(k * (C.length - 1))); const a = C[i], b = C[i + 1]; return { p: a, ang: Math.atan2(b[1] - a[1], b[0] - a[0]) }; }
// psTree(x, y, h, o): (x, y) the trunk's base, h its height. o.sway, o.sq (crown squash), o.look, o.blink, o.brow, o.key,
// o.cw/o.ch crown radii, o.leaf/o.leafDk, o.branch(S) draws before the crown (so the leaves cover its root). Returns the spine.
function psTree(x, y, h, o = {}) {
  const key = o.key || 'tree', S = psTreeSpine(x, y, h, o.sway || 0), C = through(S, 8), n = C.length;
  boilSeed('ps ' + key);
  push(); nudge(key, 1);
  const L = [], R = [];
  for (let i = 0; i < n; i += 3) {
    const a = C[Math.max(0, i - 1)], b = C[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, k = i / (n - 1);
    const w = lerp(46, 30, k) + 30 * Math.pow(1 - k, 7);
    L.push([C[i][0] - dy / d * w, C[i][1] + dx / d * w]); R.push([C[i][0] + dy / d * w, C[i][1] - dx / d * w]);
  }
  const top = C[n - 1];
  // L runs up the right side (normals flip), R up the left: base → top on each
  const trunk = curvy([[x - 92, y + 10], [x - 58, y - 8], ...R.slice(1), [top[0], top[1] - 30], ...L.slice(1).reverse(), [x + 58, y - 6], [x + 88, y + 10], [x + 30, y + 16], [x - 30, y + 16]], 4);
  psP(trunk, PS.bark, { sw: psSW * 1.1, shade: PS.barkDk, depth: 22, key: key + 'trunk', lift: 8 });
  for (const [k, s] of [[.14, -1], [.27, 1], [.88, -1]]) { const { p, ang } = psSpineAt(S, k); push(); translate(p[0], p[1]); rotate(ang + Math.PI / 2); psL([[s * 12, -16], [s * 19, 0], [s * 13, 16]], psSW * .6, PS.barkDk, .6); pop(); }
  if (o.branch) o.branch(S);
  // the crown: a scalloped blob that squashes on the beat
  const sq = o.sq || 0, cw = o.cw || 230, ch = o.ch || 170, ctop = S[3];
  boilSeed('ps ' + key + ' crown');
  push(); translate(ctop[0], ctop[1] + ch * .3); scale(1 + sq, 1 - sq); rotate((o.sway || 0) * .05);
  psP(psScallop(0, -ch * .42, cw, ch, 11, 36, 0, .3, 5, x), o.leaf || PS.leaf, { sw: psSW * 1.15, shade: o.leafDk || PS.leafDk, depth: 46, key: key + 'crown', lift: 8 });
  for (let i = 0; i < 7; i++) { const cx2 = (hash(i * 4.1 + x) - .5) * cw * 1.3, cy2 = -ch * .42 + (hash(i * 2.7 + x) - .62) * ch * 1.1; psL([[cx2 - 16, cy2 + 4], [cx2 - 4, cy2 - 10], [cx2 + 12, cy2 - 6]], psSW * .7, o.leafLt || PS.leafLt, .6); }
  pop();
  // the face on the trunk
  boilSeed('ps ' + key + ' face');
  const { p, ang } = psSpineAt(S, .64);
  push(); translate(p[0], p[1]); rotate(ang + Math.PI / 2);
  const lk = o.look || [0, 0];
  for (const s of [-1, 1]) psPie(s * 21, -14, 30, 44, { look: lk, open: o.blink ? 0 : 1, skin: PS.bark, key: key + 'e' + s });
  for (const s of [-1, 1]) psL([[s * 34, -44 - (o.brow || 0) * 6], [s * 21, -50 - (o.brow || 0) * 9], [s * 8, -46]], psSW * .8, PS.barkDk, .5);
  psP(oval(0, 14, 9, 7, 0, 12), PS.barkDk, { ink: null, key: key + 'nose', lift: 0, flatCard: true });
  psP(curvy([[-28, 25], [0, 36], [28, 25], [17, 46], [0, 52], [-17, 46]], 4), PS.mouth, { sw: psSW * .7, key: key + 'mouth', lift: 1, flatCard: true });
  psP(curvy([[-10, 44], [0, 40], [10, 44], [0, 50]], 3), PS.tongue, { ink: null, key: key + 'tongue', lift: 0, flatCard: true });
  pop();
  pop();
  return S;
}

// ---------- the cuckoo clock ----------
// (x, y) the dial's centre, r its radius. o.min / o.hr (radians clockwise from 12), o.spinV (rad/s, for the smear),
// o.smile 0..1, o.jolt (rotation about the hook), o.hop (px), o.pend (pendulum angle), o.look.
function psClock(x, y, r, o = {}) {
  boilSeed('ps clock');
  const hookY = -r * 2.35;
  push(); translate(x, y + hookY); rotate(o.jolt || 0); translate(0, -hookY + (o.hop || 0)); nudge('psclock', 1);
  // pendulum and pine-cone weights behind the house
  const pa = o.pend || 0, pl = r * 1.05;
  push(); translate(0, r * 1.0); rotate(pa);
  psP([[-2.5, 0], [2.5, 0], [2.5, pl], [-2.5, pl]], PS.brassDk, { sw: psSW * .5, key: 'pspendrod', lift: 2, flatCard: true });
  psP(oval(0, pl, r * .28, r * .28, 0, 18), PS.brass, { sw: psSW * .8, key: 'pspendbob', lift: 3, flatCard: true });
  pop();
  for (const s of [-1, 1]) { const wy = r * (1.3 + .14 * s * Math.sin(pa)); psL([[s * r * .6, r * .9], [s * r * .6, wy]], psSW * .5, PS.brassDk, 0); psP(curvy([[s * r * .6 - 7, wy], [s * r * .6 + 7, wy], [s * r * .6 + 5, wy + 24], [s * r * .6, wy + 30], [s * r * .6 - 5, wy + 24]], 3), PS.woodDk, { sw: psSW * .6, key: 'psweight' + s, lift: 2, flatCard: true }); }
  // the house, its roof and the little door
  const bw = r * 1.2, bt = -r * 1.28, bb = r * 1.12;
  psP(curvy([[-bw, bt], [bw, bt], [bw * 1.03, bb], [bw * .8, bb + r * .1], [-bw * .8, bb + r * .1], [-bw * 1.03, bb]], 2), PS.wood, { sw: psSW, shade: PS.woodDk, depth: r * .2, key: 'pschouse', lift: 5 });
  psP([[-bw * 1.45, bt + r * .22], [0, bt - r * 1.0], [bw * 1.45, bt + r * .22], [bw * 1.22, bt + r * .32], [0, bt - r * .7], [-bw * 1.22, bt + r * .32]], PS.leafDk, { sw: psSW, key: 'pscroof', lift: 4 });
  psP(curvy([[-r * .2, bt - r * .05], [-r * .2, bt - r * .33], [0, bt - r * .5], [r * .2, bt - r * .33], [r * .2, bt - r * .05]], 3), PS.woodDk, { sw: psSW * .6, key: 'pscdoor', lift: 1, flatCard: true });
  for (const s of [-1, 1]) psP(curvy([[s * r * .08, bt - r * .92], [s * r * .55, bt - r * 1.32], [s * r * .36, bt - r * .82]], 3), PS.leaf, { sw: psSW * .6, key: 'pscleaf' + s, lift: 2, flatCard: true });
  // the dial
  psP(oval(0, 0, r, r, 0, 32), PS.brass, { sw: psSW, key: 'psdialrim', lift: 3 });
  psP(oval(0, 0, r * .84, r * .84, 0, 32), PS.white, { ink: null, key: 'psdial', lift: 0, flatCard: true });
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, r0 = r * (i % 3 ? .7 : .6); psL([[Math.sin(a) * r0, -Math.cos(a) * r0], [Math.sin(a) * r * .79, -Math.cos(a) * r * .79]], psSW * (i % 3 ? .45 : .75), PS.ink, 0); }
  // the face: pie eyes low on the dial, a mouth that breaks into a grin (the hands above read as brows)
  const sm = clamp(o.smile || 0), lk = o.look || [0, 0], k = backOut(seg(sm, .2, 1));
  if (sm > .5) for (const s of [-1, 1]) psP(oval(s * r * .5, r * .36, r * .13 * k, r * .08 * k, 0, 12), PS.cheek, { ink: null, key: 'psccheek' + s, lift: 0, flatCard: true });
  for (const s of [-1, 1]) psPie(s * r * .28, r * .1, r * .25, r * .34, { look: lk, happy: sm > .5, key: 'pscle' + s });
  if (sm < .2) psL([[-r * .15, r * .5], [0, r * .53], [r * .15, r * .5]], psSW * .8, PS.ink, .5);
  else {
    const mw = r * lerp(.18, .44, k), mh = r * lerp(.06, .28, k);
    psP(curvy([[-mw, r * .4], [0, r * .46], [mw, r * .4], [mw * .6, r * .42 + mh], [0, r * .45 + mh * 1.1], [-mw * .6, r * .42 + mh]], 4), PS.mouth, { sw: psSW * .6, key: 'pscmouth', lift: 1, flatCard: true });
    if (k > .5) psP(oval(0, r * .43 + mh * .8, mw * .38, mh * .24, 0, 12), PS.tongue, { ink: null, key: 'psctongue', lift: 0, flatCard: true });
  }
  // the hands: tapered blades with spade tips; while they spin backward, ghost hands and a speed arc trail them
  const blade = (a, len, w, col, key) => {
    const dx = Math.sin(a), dy = -Math.cos(a), nx = -dy, ny = dx, at = (q, s) => [dx * len * q + nx * w * s, dy * len * q + ny * w * s];
    psP([at(-.2, .55), at(0, 1), at(.62, .45), at(.7, 1.5), at(1, 0), at(.7, -1.5), at(.62, -.45), at(0, -1), at(-.2, -.55)], col, { sw: psSW * .45, key, lift: 1, flatCard: true });
  };
  const sv = o.spinV || 0;
  if (Math.abs(sv) > 3) for (let g = 3; g >= 1; g--) blade((o.min || 0) - sv * g * .014, r * .72, r * .07, mixCol(PS.white, PS.ink, .5 - g * .12), 'psghost' + g);
  if (Math.abs(sv) > 8) for (const rr of [1.2, 1.36]) { const A = []; for (let i = 0; i <= 10; i++) { const a = (o.min || 0) - Math.sign(sv) * (.3 + i / 10 * 1.5); A.push([Math.sin(a) * r * rr, -Math.cos(a) * r * rr]); } psL(A, psSW * .7, PS.ink, .6); }
  blade(o.hr || 0, r * .46, r * .09, PS.ink, 'pshr');
  blade(o.min || 0, r * .72, r * .07, PS.ink, 'psmin');
  psP(oval(0, 0, r * .08, r * .08, 0, 10), PS.brassDk, { sw: psSW * .4, key: 'pshub', lift: 1, flatCard: true });
  pop();
}

// ---------- the gent in the hammock ----------
// A generic 1930s cartoon gent: boater, striped blazer, bow tie, cream flannels, spectator shoes, a little moustache.
// He lies back in the hammock, head at the right end, one leg crossed over the other knee, one arm behind his head.
// Drawn in a local frame: origin at his hips, unit g, x toward his head. o: eyes ('bliss' | 'open'), look, sh, elbow,
// hand (world points of the near arm's shoulder, elbow and wrist: psGentState; without them, at rest on his chest),
// glassIn, reach, tap 0..1 (the crossed foot), headTurn 0..1 (toward the robot), hatHop.
function psGent(o) { return psGentRH(o); }   // (in the rubber-hose idiom, below)
// A martini glass standing with its foot at (x, y), s tall; a pink drink with a cherry. sip 0..1 lowers the drink.
function psGlass(x, y, s, key = 'psglass', sip = 0) {
  push(); translate(x, y);
  psP(curvy(U([[-.36, 0], [.36, 0], [.3, -.1], [.05, -.12], [.05, -.62], [-.05, -.62], [-.05, -.12], [-.3, -.1]], s), 2), PS.glass, { sw: psSW * .55, key: key + 'stem', lift: 2, flatCard: true });
  psP([[-.56 * s, -1.22 * s], [.56 * s, -1.22 * s], [.06 * s, -.6 * s], [-.06 * s, -.6 * s]], PS.glass, { sw: psSW * .6, key: key + 'bowl', lift: 2, flatCard: true });
  const lv = lerp(1.12, .92, clamp(sip)), hw = .5 * (lv - .6) / .52;
  psP([[-hw * s, -lv * s], [hw * s, -lv * s], [.05 * s, -.66 * s], [-.05 * s, -.66 * s]], PS.drink, { ink: null, key: key + 'drink', lift: 0, flatCard: true });
  psL([[.1 * s, -.8 * s], [.36 * s, -1.42 * s]], psSW * .5, PS.woodDk, 0);
  psP(oval(.1 * s, -.86 * s, .13 * s, .13 * s, 0, 12), PS.cheek, { sw: psSW * .45, key: key + 'cherry', lift: 1, flatCard: true });
  psL([[-.4 * s, -1.12 * s], [-.22 * s, -.8 * s]], psSW * .5, PS.white, 0);
  pop();
}
// The hammock: its back cloth (before the gent), its front cloth, spreader bars and ropes (after). A, B: the ropes' ends
// on the trunks (world).
const PSH = { l: [352, 690], r: [1068, 676], sag: 132, piv: [710, 560] };   // (piv: the swing's pivot)
function psHammockBack() {
  boilSeed('ps hammock back');
  const [l, r] = [PSH.l, PSH.r], my = (l[1] + r[1]) / 2;
  psP(curvy([[l[0], l[1] - 14], [(l[0] + r[0]) / 2, my + PSH.sag * .42], [r[0], r[1] - 14], [r[0], r[1] + 14], [(l[0] + r[0]) / 2, my + PSH.sag * .82], [l[0], l[1] + 14]], 6), mixCol(PS.teal, PS.ink, .12), { key: 'pshamback', lift: 3 });
}
function psHammockFront(A, B) {
  boilSeed('ps hammock front');
  const [l, r] = [PSH.l, PSH.r], xs = [0, .2, .45, .7, 1], sagAt = k => Math.sin(k * Math.PI) ** .8;
  const edge = (dy, sg) => xs.map(k => [lerp(l[0], r[0], k), lerp(l[1], r[1], k) + dy + PSH.sag * sg * sagAt(k)]);
  const top = edge(10, .92), bot = edge(30, 1.28);
  psP(curvy(top.concat(bot.slice().reverse()), 6), PS.white, { shade: mixCol(PS.white, PS.teal, .4), depth: 24, key: 'pshamfront', lift: 5 });
  for (let i = 1; i < 4; i++) { const k = i / 4; psL(through(top.map((p, j) => [lerp(p[0], bot[j][0], k), lerp(p[1], bot[j][1], k)]), 6), psSW * 2.8, PS.teal, .5); }
  boilSeed('ps hammock ropes');
  for (const [s, e, tx, ty] of [[1, l, A[0], A[1]], [-1, r, B[0], B[1]]]) {
    const [sx, sy] = e, ring = [lerp(sx, tx, .6), lerp(sy, ty, .6) + 6];
    for (const dy of [-10, 6, 22, 38]) psL([[sx, sy + dy], ring], psSW * .5, PS.woodDk, 0);
    psL([ring, [tx, ty]], psSW * .9, PS.woodDk, 0);
    psP(oval(ring[0], ring[1], 6, 6, 0, 10), PS.brass, { sw: psSW * .5, key: 'psring' + s, lift: 1, flatCard: true });
    psP(rectPts(sx - 7, sy - 16, 14, 60), PS.wood, { sw: psSW * .7, key: 'psspread' + s, lift: 3, flatCard: true });
  }
}

// ---------- the robot butler ----------
// A boxy 1930s robot: brass box body and head, dial eyes, a grille mouth, an antenna, a bow tie and shirt front,
// rubber-hose arms and legs, white gloves, a napkin over one arm and a tray on the other. (x, y) ground point, u unit
// (he's ~16u tall). o: walk (phase), walkW 0..1, dy (u), rot (lean, pivots at the feet), turn 0 (3/4, facing left)
// .. 1 (front), look, wink 0..1, grin 0..1, tray (world point of the tray hand's wrist), trayGlass, bow 0..1,
// antenna (spring), bulb 0..1, htilt, hdy.
function psRobot(x, y, u, o = {}) { return psRobotRH(x, y, u, o); }   // (in the rubber-hose idiom, below)

// ---------- the gent and the butler in the rubber-hose idiom ----------
// The ad's two figures translated into the idiom the past's cast is drawn in (brief/animation-style.md, "Rubber hose";
// the Codex pets, demo/cast/bots2.js): limbs as hoses (even tubes bent in one smooth curve, no elbows or knees: the
// butler's solid ink, the gent's in his clothes, blazer sleeves and cream flannels), puffy white gloves with a cuff, big
// oval shoes, pie-cut eyes, flat fills (no cel crescents), one contour in proportion to the figure with lighter lines
// inside it (style.js INK_FIG), and the idiom's squash and stretch in their motion. What makes them them stays: the
// boater, the striped blazer, the bow tie, the little moustache, the flannels; the boxy brass butler, his grille grin,
// bow tie, tray and cocktail. The ad's palette is untouched (no inkPastel: it's the past's reference). Every appearance
// draws through psGent and psRobot (the intro, the platform's poster, the riso copies and the burning one, O1, Z1's
// chase), so it carries through all of them.
const PS_HOSE = mixCol(PS.ink, '#1E1410', .6);   // (a hose's solid ink, as dark as the ad's outlines print: the brush lays pastInk down darker than its fill)
const psHoseInk = () => STYLE.mode === 'ink' ? null : PS.ink;   // (no outline in ink; the copies, which don't print it solid, outline it so it reads as a tube)
// fn drawn as one ink figure h units tall at unit u, base weight sw (style.js inkWrapRigs: its contour 1/INK_R of its
// height on screen, never heavier than sw, the inner lines lighter), in the ad's own ink and whites, its colours as they are
function psFig(h, u, sw, key, fn) {
  const pt = PAINT_TINT, ink = NOIR.ink, cream = NOIR.cream, prev = INK_FIG;
  PAINT_TINT = null; NOIR.ink = PS.ink; NOIR.cream = PS.white;
  if (inkRH()) { const ds = drawScale(), own = sw * INK_PX.flash * ds, C = Math.min(own, Math.max(INK_MIN, h * u * ds / INK_R)); INK_FIG = { sw, C, k: C / own, rig: key, bot: false, flat: false, hose: 0 }; }
  try { fn(); } finally { INK_FIG = prev; PAINT_TINT = pt; NOIR.ink = ink; NOIR.cream = cream; }
}
// A puffy rubber-hose glove at the wrist (x, y) pointing along ang, size s (style.js inkGlove: one silhouette with light
// creases in ink; its parts outlined in the other looks). o: pose, mirror, hold, key (as hand()).
function psGlove(x, y, ang, s, o = {}) {
  push(); translate(x, y); rotate(ang); if (o.mirror) scale(1, -1);
  const S = P => U(P, s), cap = (x0, y0, x1, y1, r) => { const a = Math.atan2(y1 - y0, x1 - x0), p = []; for (let i = 0; i <= 6; i++) { const t = a + Math.PI / 2 + i / 6 * Math.PI; p.push([x0 + Math.cos(t) * r, y0 + Math.sin(t) * r]); } for (let i = 0; i <= 6; i++) { const t = a - Math.PI / 2 + i / 6 * Math.PI; p.push([x1 + Math.cos(t) * r, y1 + Math.sin(t) * r]); } return p; };
  inkGlove(o.pose || 'relax', s, o, S, cap);
  pop();
}
// A pie-cut pupil: a tall oval with the wedge toward the upper right cut out (the ad's psPie pupil), centre (x, y) px
function psPiePupil(x, y, rx, ry, key) {
  const P = [[x + rx * .22, y - ry * .2]];
  for (let i = 0; i <= 22; i++) { const a = -.42 + i / 22 * (TAU - .98); P.push([x + Math.cos(a) * rx, y + Math.sin(a) * ry]); }
  psP(P, PS.ink, { ink: null, key, lift: 0, flatCard: true });
}
function psGentRH(o) {
  const [hx0, hy0] = PSX.hips, g = PSX.g, S = P => U(P, g), sw = psSW;
  const hose = (P, w, col, key) => limb(S(P), w * g, w * .94 * g, col, { sw, ink: PS.ink, key });   // a clothed hose: an even tube, one smooth curve
  psFig(13, g, sw, 'psgent', () => {
    push(); translate(hx0, hy0); nudge('psgent', 1);
    // far arm: a blazer hose looping up behind his head, its glove tucked in behind
    boilSeed('ps gent far');
    const fa = hose([[4.1, -2.75], [3.25, -5.2], [4.55, -6.15]], .5, PS.blazerDk, 'psgfar');
    psGlove(fa.tip[0], fa.tip[1], fa.ang, .72 * g, { pose: 'relax', key: 'psgfg' });
    // far leg, knee up in one arch, its foot planted in the hammock
    boilSeed('ps gent legs');
    const r1 = hose([[-.4, -.3], [-2.45, -2.75], [-4.3, -.85]], .68, PS.flannelDk, 'psgleg1');
    psShoeRH(-4.4, -.62, g, -.15, 'psgshoe1', true, r1.ang);
    // torso: the striped blazer, reclining (flat), its stripes as bands
    boilSeed('ps gent torso');
    const torso = curvy(S([[-1.3, .45], [.8, .95], [2.6, .4], [4.0, -.5], [5.0, -1.7], [4.9, -3.0], [4.0, -3.55], [2.5, -2.95], [.8, -2.0], [-.9, -1.3]]), 5);
    psP(torso, PS.blazer, { key: 'psgtorso', lift: 4 });
    for (let i = 0; i < 4; i++) { const k = (i + .5) / 4, a = [lerp(-.9, .9, k), lerp(-1.1, .75, k)], b = [lerp(1.7, 3.3, k), lerp(-2.35, -.6, k)], c = [lerp(3.6, 4.9, k), lerp(-3.4, -1.9, k)];
      piece(ribbon(S([[lerp(a[0], b[0], .1), lerp(a[1], b[1], .1)], b, [lerp(b[0], c[0], .88), lerp(b[1], c[1], .88)]]), .22 * g), PS.white, { ink: null, key: 'psgstripe' + i, lift: 0, flatCard: true, edge: false }); }
    psP(curvy(S([[4.0, -3.5], [4.9, -3.05], [4.75, -2.2], [4.1, -2.5]]), 3), PS.white, { sw: sw * .7, key: 'psgshirt', lift: 2 });
    psL(S([[3.85, -3.45], [3.95, -2.7], [3.6, -2.0]]), sw * .8, PS.ink, .5);
    psP(curvy(S([[4.05, -3.55], [4.35, -3.9], [4.5, -3.35], [4.85, -3.65], [4.95, -3.0], [4.5, -3.2], [4.1, -3.0]]), 2), PS.teal, { sw: sw * .7, key: 'psgbow', lift: 2, flatCard: true });
    // near leg, crossed over the far knee in one curve, the foot tapping on the beat (the shoe squashes as it taps)
    boilSeed('ps gent near leg');
    const r2 = hose([[-.2, -.8], [-2.85, -3.45], [-5.0, -2.4]], .72, PS.flannel, 'psgleg2');
    psShoeRH(-5.12, -2.3, g, .05 - (o.tap || 0) * .5, 'psgshoe2', false, r2.ang, o.tap || 0);
    // head: 3/4, laid back on the arm behind it (lying back in the hammock: upright on the tipped-back body, the neck
    // read as kinked forward), and lifted toward upright, turned to the robot, as he notices it; the notice is a take (the
    // head stretches up with the hat's hop). It pivots at the neck (about its own middle, the turn read as the head
    // twisting on the collar: the user)
    boilSeed('ps gent head');
    const ht = o.headTurn || 0, hc = [5.75, -4.15], hop = o.hatHop || 0;
    push(); translate(hc[0] * g, (hc[1] + 1.7) * g); rotate(-.3 + ht * .26); scale(1 - .1 * hop, 1 + .16 * hop); translate(-hc[0] * g, -(hc[1] + 1.7) * g);
    const H = P => S(P.map(([x, y]) => [x + hc[0], y + hc[1]]));
    psP(oval((hc[0] - 1.55) * g, (hc[1] + .25) * g, .42 * g, .58 * g, 0, 16), PS.skin, { sw, key: 'psgear', lift: 2 });
    psL(H([[-1.6, 0], [-1.45, .25], [-1.6, .5]]), sw * .6, PS.skinDk, .5);
    psP(curvy(H([[-1.5, -1.5], [0, -2.1], [1.55, -1.5], [2.0, -.1], [1.8, 1.25], [.6, 2.0], [-.8, 1.85], [-1.8, .6]]), 5), PS.skin, { sw: sw * 1.1, key: 'psghead', lift: 3 });
    psP(curvy(H([[-1.68, -.5], [-1.35, -1.4], [-.6, -1.8], [-.85, -1.35], [-1.1, -.75], [-1.3, -.2], [-1.62, .05]]), 3), PS.hair, { sw: sw * .6, key: 'psghair', lift: 1, flatCard: true });
    const fx = .25 + ht * .3, eo = o.eyes === 'open', lk = o.look || [0, 0];
    for (const s of [-1, 1]) psP(oval((hc[0] + fx + s * .95 + .15) * g, (hc[1] + .75) * g, .36 * g, .22 * g, 0, 12), PS.cheek, { ink: null, key: 'psgcheek' + s, lift: 0, flatCard: true });
    for (const s of [-1, 1]) {   // pie-cut eyes (the far one a touch narrower), or the blissful closed arcs
      const ex = fx + s * .6 + (s > 0 ? .1 : 0), ey = -.45, ew = s > 0 ? .36 : .3;
      if (eo) psPie((hc[0] + ex) * g, (hc[1] + ey) * g, ew * 2 * g, .95 * g, { look: lk, pupil: 1.1, key: 'psge' + s });
      else psStroke(H([[ex - .32, ey + .06], [ex - .15, ey - .12], [ex, ey - .17], [ex + .15, ey - .12], [ex + .32, ey + .06]]), .16 * g, PS.ink, 'psgbl' + s);
      psStroke(H([[ex - .32, ey - .62 - (eo ? .12 : 0)], [ex, ey - .78 - (eo ? .16 : 0)], [ex + .32, ey - .66 - (eo ? .12 : 0)]]), .13 * g, PS.hair, 'psgbr' + s);
    }
    psP(oval((hc[0] + fx + .55) * g, (hc[1] + .25) * g, .5 * g, .42 * g, 0, 16), mixCol(PS.skin, PS.rose, .55), { sw: sw * .8, key: 'psgnose', lift: 2, flatCard: true });
    psP(curvy(H([[fx - .25, .78], [fx + .5, .66], [fx + 1.25, .8], [fx + .5, .9]]), 3), PS.hair, { ink: null, key: 'psgmous', lift: 0, flatCard: true });
    psStroke(H([[fx - .28, 1.02], [fx + .1, 1.28], [fx + .5, 1.38], [fx + .9, 1.26], [fx + 1.18, 1.0]]), .14 * g, PS.ink, 'psgsmile');
    // the boater, tipped back (flat)
    push(); translate((hc[0] - .05) * g, (hc[1] - 1.75 - hop) * g); rotate(-.28 + hop * .1);
    psP(curvy(U([[-2.5, .05], [0, -.25], [2.6, .05], [2.4, .45], [0, .55], [-2.4, .45]], g), 4), PS.straw, { sw, key: 'psgbrim', lift: 3 });
    psP(curvy(U([[-1.55, .2], [-1.5, -1.25], [0, -1.4], [1.5, -1.25], [1.55, .2], [0, .32]], g), 3), PS.straw, { sw, key: 'psgcrown', lift: 3 });
    psP(curvy(U([[-1.55, .15], [-1.53, -.4], [0, -.32], [1.53, -.4], [1.55, .15], [0, .3]], g), 2), PS.teal, { sw: sw * .7, key: 'psgband', lift: 1, flatCard: true });
    psL(U([[-1.52, -.1], [0, 0], [1.52, -.1]], g), sw * 1.2, PS.rose, .4);
    for (let i = 0; i < 5; i++) psL(U([[-1.2 + i * .6, -1.22], [-1.2 + i * .6, -.52]], g), sw * .45, PS.strawDk, 0);
    pop();
    pop();
    // near arm: a blazer hose from the shoulder, resting on his chest; it reaches up over his shoulder for the drink and
    // brings it down to his side (psGentState: o.sh, o.elbow, o.hand, world points; without them, the rest on his chest)
    boilSeed('ps gent arm');
    const sh = o.sh ? [o.sh[0] - hx0, o.sh[1] - hy0] : [4.1 * g, -2.05 * g], tip = o.hand ? [o.hand[0] - hx0, o.hand[1] - hy0] : [2.3 * g, -1.75 * g];
    const mid = o.elbow ? [o.elbow[0] - hx0, o.elbow[1] - hy0] : psArmRestMid(sh, tip);
    // (it stretches to reach over his hat, and keeps its girth: thinned as the butler's does, it read as a wire)
    const r = limb([sh, mid, tip], .52 * g, .49 * g, PS.blazer, { sw, ink: PS.ink, key: 'psgarm' });
    const ang = r.ang, pose = o.glassIn ? 'hold' : (o.reach > .3 ? 'open' : 'relax');
    psGlove(r.tip[0], r.tip[1], ang, .8 * g, { pose, key: 'psgh', mirror: true,
      hold: o.glassIn ? () => { push(); scale(1, -1); rotate(-ang); psGlass(0, .38 * PSX.bot.u * 1.35, PSX.bot.u * 1.35, 'psgglass'); pop(); } : null });
    pop();
  });
}
// A big round-toed spectator shoe (brown, a cream saddle, a sole line) at the ankle (lx, ly) in gent units, the flannels'
// turn-up over the ankle; ang tilts the foot (toes left, sole down), legAng the shin's direction; tap 0..1 squashes it.
function psShoeRH(lx, ly, g, ang, key, far, legAng = 0, tap = 0) {
  const dk = far ? mixCol(PS.woodDk, PS.ink, .25) : PS.woodDk, sq = .1 * tap;
  push(); translate(lx * g, ly * g); rotate(legAng);
  psP(curvy(U([[-.42, -.45], [.1, -.5], [.1, .5], [-.42, .45]], g), 2), far ? PS.flannelDk : PS.flannel, { sw: psSW * .8, key: key + 'cuff', lift: 2, flatCard: true });   // the turn-up, under the shoe
  pop();
  push(); translate(lx * g, ly * g);
  rotate(ang); scale(-1, 1); translate(-.7 * g, .5 * g); scale(1 + sq, 1 - sq); translate(.7 * g, -.5 * g);
  psP(curvy(U([[-.6, -.52], [.4, -.7], [1.55, -.52], [2.05, .0], [1.85, .52], [-.62, .54], [-.85, .02]], g), 5), dk, { key, lift: 3 });
  psP(curvy(U([[-.3, -.5], [.45, -.64], [1.0, -.54], [.85, .1], [-.2, .14]], g), 3), far ? PS.flannelDk : PS.white, { ink: null, key: key + 'saddle', lift: 0, flatCard: true });
  psL(U([[-.66, .3], [.6, .36], [1.86, .26]], g), psSW * .7, PS.ink, .5);
  pop();
}
function psRobotRH(x, y, u, o = {}) {
  const S = P => U(P, u), sw = clamp(u / 20, .55, 2.2), k = clamp(o.turn || 0), q = 1 - k, lift = u * .12, rot = o.rot || 0;
  // the idiom's bounce: a squash as each foot lands, a stretch at the top of the step (about the feet), one as he stops
  // dead (o.land), and the head following through a beat behind the body
  const w = o.walk || 0, ww = clamp(o.walkW ?? 0), c = frac(w * 2);
  const sq = ww * (.08 * Math.exp(-c * 8) - .035 * Math.sin(Math.PI * c)) + .12 * (o.land || 0);
  boilSeed('ps bot shadow');
  paint(oval(x, y + .15 * u, 3.4 * u * (1 + sq * .8), .5 * u, 0, 24), { wash: PS.ink, washOp: STYLE.card ? 90 : 70, ink: null });
  psFig(16.5, u, sw, 'psbot', () => {
    push(); translate(x, y); nudge('psbot', 1); rotate(rot); scale(1 + sq * .6, 1 - sq); translate(0, (o.dy || 0) * u);
    // ---- legs: solid hoses, big oval patent shoes with a shine ----
    const hipY = -4.9;
    for (const s of [1, -1]) {   // s = 1: the far leg, drawn first
      boilSeed('ps bot leg' + s);
      const ph = frac(w + (s > 0 ? .5 : 0)), stance = ph < .5, st = stance ? ph * 2 : (ph - .5) * 2;
      const fx = lerp(s * .95 - q * .3, stance ? lerp(-3.0, 3.0, st) : lerp(3.0, -3.0, ease(st)), ww), fy = -(stance ? 0 : Math.sin(st * Math.PI) * 1.6) * ww;
      const hip = [s * .95 - q * .35, hipY], foot = [fx, fy - .45], dd = Math.hypot(foot[0] - hip[0], foot[1] - hip[1]), slack = Math.sqrt(Math.max(0, 4.65 * 4.65 / 4 - dd * dd / 4));
      const knee = [lerp(hip[0], foot[0], .5) - slack * .75, lerp(hip[1], foot[1], .5)];
      limb(S([hip, knee, foot]), .54 * u, .5 * u, PS_HOSE, { sw, ink: psHoseInk(), key: 'psbotleg' + s });
      push(); translate(foot[0] * u, (foot[1] + .1) * u); rotate(stance ? 0 : .3 * Math.sin(st * Math.PI) * ww); scale(lerp(1, -1, q), 1);
      const far = s > 0 && q > .5, shoe = far ? mixCol(PS.tux, PS.ink, .3) : PS.tux;
      psP(oval(.3 * u, -.1 * u, 1.45 * u, .68 * u, 0, 32).map(([a, b]) => [a, Math.min(b, .42 * u)]), shoe, { sw, key: 'psbotshoe' + s, lift });
      psStroke(S([[-.2, -.5], [.5, -.62], [1.15, -.42]]), .16 * u, mixCol(PS.white, shoe, .25), 'psbotshine' + s);   // the patent shine
      pop();
    }
    // the tray target in body space (undo the body's translate, lean and squash)
    const tr = o.tray ? [(o.tray[0] - x) / u, (o.tray[1] - y) / u] : [-4.6, -9.1];
    const cr = Math.cos(-rot), sr = Math.sin(-rot), trL = [(tr[0] * cr - tr[1] * sr) / (1 + sq * .6), (tr[0] * sr + tr[1] * cr) / (1 - sq) - (o.dy || 0)];
    // ---- the tray arm (the far arm, from the leading shoulder): a hose up to a glove, the tray on its fingertips ----
    boilSeed('ps bot trayarm');
    const shF = [-2.4 + k * -.2, -8.9], dv = [trL[0] - shF[0], trL[1] - shF[1]], L = Math.hypot(dv[0], dv[1]) || 1, stretch = Math.max(1, L / 4.2), aw = .5 / Math.sqrt(stretch);
    const bend = clamp(1 - (L - 3) / 3.5, .15, 1), elbow = [lerp(shF[0], trL[0], .5) - .9 * bend - .25, lerp(shF[1], trL[1], .5) + 1.5 * bend];
    const ra = limb(S([shF, elbow, trL]), aw * u, aw * .9 * u, PS_HOSE, { sw, ink: psHoseInk(), key: 'psbotarmT' });
    psGlove(ra.tip[0], ra.tip[1], Math.PI + .25, .84 * u, { pose: 'open', key: 'psbotgT' });
    push(); translate(ra.tip[0] - .55 * u, ra.tip[1] - .62 * u); rotate(-rot * .7);
    if (o.trayGlass) psGlass(-.45 * u, -.1 * u, 1.35 * u, 'psbotglass');
    psP(curvy(S([[-1.9, 0], [0, -.3], [1.9, 0], [1.6, .28], [0, .4], [-1.6, .28]]), 4), PS.brassLt, { sw, key: 'psbottray', lift: 3 });
    psL(S([[-1.5, .03], [0, -.16], [1.5, .03]]), sw * .6, PS.brass, .5);
    pop();
    // ---- body: the brass box (flat), shirt front, buttons, gauge, rivets ----
    boilSeed('ps bot body');
    const bx0 = -2.7 - q * .2, bx1 = 2.7 - q * .9, side = q * .7, cx = (bx0 + bx1) / 2;
    // (a solid box seen a little from above: its side face and its lit top recede along one depth (side, -dz), so the
    // turned edge reads as the box's side; the side alone, its top edge sloping away down, read as a flat fin: the user)
    const dzb = side * 1.1;
    if (side > .05) {
      psP(curvy(S([[bx0 - .1, -9.35], [bx1 - .1, -9.4], [bx1 + side, -9.4 - dzb], [bx0 + side, -9.35 - dzb]]), 2), mixCol(PS.brass, '#FFF6D8', .38), { sw, key: 'psbottop', lift });
      psP(curvy(S([[bx1 - .2, -9.4], [bx1 + side, -9.4 - dzb], [bx1 + side + .05, -4.6 - dzb], [bx1 - .2, -4.6]]), 2), mixCol(PS.brass, PS.brassDk, .55), { sw, key: 'psbotside', lift });
    }
    psP(curvy(S([[bx0, -9.5], [bx1, -9.5], [bx1 + .15, -7], [bx1, -4.6], [bx0, -4.6], [bx0 - .15, -7]]), 3), PS.brass, { sw: sw * 1.15, key: 'psbottorso', lift });
    psP(curvy(S([[cx - 1.0, -9.45], [cx + 1.0, -9.45], [cx + .55, -7.4], [cx, -6.9], [cx - .55, -7.4]]), 2), PS.white, { sw: sw * .7, key: 'psbotshirt', lift: 2 });
    for (const by of [-8.6, -7.8]) psP(oval(cx * u, by * u, .15 * u, .15 * u, 0, 8), PS.ink, { ink: null, key: 'psbotbtn' + by, lift: 0, flatCard: true });
    psP(oval((cx - .9) * u, -5.75 * u, .62 * u, .62 * u, 0, 24), PS.white, { sw: sw * .8, key: 'psbotgauge', lift: 2 });
    const gA = -.9 + .6 * Math.sin(o.gauge || 0);
    psL([[(cx - .9) * u, -5.75 * u], [(cx - .9 + Math.sin(gA) * .48) * u, (-5.75 - Math.cos(gA) * .48) * u]], sw * .8, PS.rose, 0);
    for (const [rx, ry] of [[bx0 + .35, -9.1], [bx1 - .35, -9.1], [bx0 + .35, -5.0], [bx1 - .35, -5.0]]) psP(oval(rx * u, ry * u, .12 * u, .12 * u, 0, 8), PS.brassLt, { sw: sw * .4, key: 'psbotriv' + rx + ry, lift: 1, flatCard: true });
    // ---- neck (bellows) and head: the head lags the body's squash a touch (follow-through) ----
    boilSeed('ps bot head');
    push(); translate(cx * u, -9.5 * u); rotate(-(o.bow || 0) * .22 + (o.htilt || 0)); translate(-cx * u, 9.5 * u); translate(0, ((o.hdy || 0) + 1.6 * sq) * u);
    for (let i = 0; i < 3; i++) psP(curvy(S([[cx - .8, -9.55 - i * .32], [cx + .8, -9.55 - i * .32], [cx + .7, -9.82 - i * .32], [cx - .7, -9.82 - i * .32]]), 2), i % 2 ? PS.steelDk : PS.steel, { sw: sw * .6, key: 'psbotneck' + i, lift: 1, flatCard: true });
    const hx0 = cx - 2.15 - q * .1, hx1 = cx + 2.15 - q * .65, ht = -14.4, hb = -10.4, hs = q * .85, hm = (hx0 + hx1) / 2;
    const dzh = hs * 1.1;   // (the head's box: the same depth as the body's)
    // the antenna stands in the middle of the head's top face (drawn over it: from the front edge, behind the top, its
    // stalk was hidden)
    const ant = o.antenna || 0, ab = [hm + hs * .5, ht - dzh * .5], atx = ab[0] + ant * .6, aty = ab[1] - 1.5;
    const antenna = () => {
      psL(S([ab, [ab[0] + ant * .3, ab[1] - .7], [atx, ab[1] - 1.3]]), sw * 1.1, PS.ink, .5);
      psP(oval(atx * u, aty * u, .4 * u, .4 * u, 0, 16), mixCol(PS.rose, PS.hot, .6 * (o.bulb || 0)), { sw, key: 'psbotbulb', lift: 2, flatCard: true });
      if ((o.bulb || 0) > .05) glow(atx * u, aty * u, 1.8 * u, PS.hot, .6 * o.bulb);
    };
    if (hs > .05) {
      psP(curvy(S([[hx0, ht + .05], [hx1 - .1, ht + .05], [hx1 + hs, ht - dzh], [hx0 + hs, ht - dzh]]), 2), mixCol(PS.brass, '#FFF6D8', .38), { sw, key: 'psbotheadtop', lift });
      antenna();
      psP(curvy(S([[hx1 - .2, ht + .1], [hx1 + hs, ht - dzh], [hx1 + hs, hb - dzh], [hx1 - .2, hb]]), 2), mixCol(PS.brass, PS.brassDk, .55), { sw, key: 'psbotheadside', lift });
    } else antenna();
    for (const s of [-1, 1]) { if (q > .5 && s < 0) continue; const ex = s < 0 ? hx0 - .1 : hx1 + hs * .9; psP(oval(ex * u, -12.3 * u, .35 * u, .55 * u, 0, 14), PS.steel, { sw: sw * .8, key: 'psbotear' + s, lift: 2, flatCard: true }); }
    psP(curvy(S([[hx0, ht], [hx1, ht], [hx1 + .08, -12.4], [hx1, hb], [hx0, hb], [hx0 - .08, -12.4]]), 3), PS.brass, { sw: sw * 1.15, key: 'psbothead', lift });
    // face: goggle sockets holding big pie-cut pupils, cheek lamps, the grille grin
    const fx = hm - q * .3, lk = o.look || [0, 0];
    for (const s of [-1, 1]) {
      const ex = fx + s * 1.0 * (1 - q * .1), ey = -12.55, er = .8 * (s < 0 ? 1 - q * .1 : 1), wink = s > 0 ? clamp(o.wink || 0) : 0, E = P => S(P.map(([a, b]) => [a + ex, b + ey]));
      psP(oval(ex * u, ey * u, er * u, er * u, 0, 24), PS.steelDk, { sw, key: 'psboteyerim' + s, lift: 2, flatCard: true });
      if (wink < .98) {
        psP(oval(ex * u, ey * u, er * .8 * u, er * .8 * u, 0, 22), PS.white, { ink: null, key: 'psboteye' + s, lift: 0, flatCard: true });
        psPiePupil((ex + lk[0] * er * .2) * u, (ey + lk[1] * er * .16 + .06) * u, er * .44 * u, er * .58 * u, 'psbotpup' + s);
        if (wink > .02) {   // the shutter comes down
          const ly = ey - er * .82 + wink * er * 1.64, Lp = [];
          for (let i = 0; i <= 16; i++) { const a = Math.PI + i / 16 * Math.PI, py2 = ey + Math.sin(a) * er * .82; Lp.push([(ex + Math.cos(a) * er * .82) * u, Math.min(py2, ly) * u]); }
          psP(Lp, PS.brass, { sw: sw * .7, key: 'psbotlid' + s, lift: 1, flatCard: true });
        }
      } else {
        psP(oval(ex * u, ey * u, er * .8 * u, er * .8 * u, 0, 22), PS.brass, { ink: null, key: 'psboteyeshut' + s, lift: 0, flatCard: true });
        psStroke(E([[-er * .62, .14], [-er * .32, -.14], [0, -.26], [er * .32, -.14], [er * .62, .14]]), .22 * u, PS.ink, 'psbotwink');
      }
    }
    for (const s of [-1, 1]) psP(oval((fx + s * 1.5) * u, -11.3 * u, .32 * u, .24 * u, 0, 12), PS.cheek, { ink: null, key: 'psbotcheek' + s, lift: 0, flatCard: true });
    const gr = clamp(o.grin || 0), mw = lerp(.95, 1.3, gr), mt0 = -11.3, mb = lerp(-10.85, -10.62, gr), up = gr * .28, wk = clamp(o.wink || 0);
    psP(curvy(S([[fx - mw, mt0 - up], [fx, mt0 + .08], [fx + mw, mt0 - up - wk * .25], [fx + mw * .8, mb], [fx, mb + .15], [fx - mw * .8, mb]]), 4), PS.mouth, { sw: sw * .8, key: 'psbotmouth', lift: 1, flatCard: true });
    for (let i = -2; i <= 2; i++) psL(S([[fx + i * mw * .32, mt0 + .1], [fx + i * mw * .3, mb - .02]]), sw * .6, PS.brassDk, 0);
    pop();
    psP(curvy(S([[cx - .9, -9.85], [cx - .15, -9.55], [cx + .15, -9.55], [cx + .9, -9.85], [cx + .95, -9.1], [cx + .15, -9.35], [cx - .15, -9.35], [cx - .95, -9.1]]), 2), PS.rose, { sw: sw * .8, key: 'psbotbow', lift: 2, flatCard: true });
    psP(oval(cx * u, -9.45 * u, .2 * u, .22 * u, 0, 10), PS.cheek, { sw: sw * .5, key: 'psbotknot', lift: 1, flatCard: true });
    // ---- near arm: a hose across his middle to a glove, the napkin draped over it ----
    boilSeed('ps bot napkin arm');
    const shN = [bx1 - .3, -8.8], hN = [cx - .7, -6.9];
    const rn = limb(S([shN, [bx1 + .6, -6.2], hN]), .5 * u, .45 * u, PS_HOSE, { sw, ink: psHoseInk(), key: 'psbotarmN' });
    psGlove(rn.tip[0], rn.tip[1], rn.ang, .8 * u, { pose: 'relax', key: 'psbotgN', mirror: true });
    psP(curvy(S([[cx + .2, -7.35], [cx + 1.55, -7.25], [cx + 1.75, -5.0], [cx + 1.3, -5.4], [cx + .95, -4.8], [cx + .6, -5.6], [cx + .3, -5.3]]), 3), PS.white, { sw, key: 'psbotnapkin', lift: 3 });
    pop();
  });
}

// ---------- old film ----------
const psFilmFrame = t => Math.floor(t * 24 + 1e-6);
// Scratches and dust: they're on the film, so they move with the picture. f = the film frame shown.
function psDirt(f, film = 1) {
  if (film <= 0) return;
  boilSeed('ps dirt');
  for (let i = 0; i < 4; i++) {
    if (hash(i * 13.1 + 2) > film) continue;   // (fading: each mark goes at its own point)
    const life = Math.floor((f + i * 5) / (5 + i * 2)); if (hash(life * 3.7 + i * 11) < .35) continue;
    const x = 80 + hash(life * 1.9 + i * 7) * (W - 160) + Math.sin(f * .7 + i) * 3, y0 = hash(life * 2.3 + i) < .5 ? -20 : hash(life + i * 9) * 500, y1 = y0 + 300 + hash(life * 4.1 + i) * 900;
    inkLine([[x, y0], [x + (hash(life + i * 3) - .5) * 8, (y0 + y1) / 2], [x + (hash(life * 7 + i) - .5) * 6, y1]], .45 + hash(life * 9 + i) * .5, hash(life * 5.3 + i) < .55 ? PS.white : PS.ink, 'inkfine', .5);
  }
  for (let i = 0; i < 6; i++) {
    if (hash(i * 7.9 + 5) > film) continue;
    if (hash(f * 1.31 + i * 17.3) < .4) continue;
    const x = hash(f * 2.77 + i * 3.1) * W, y = hash(f * 3.91 + i * 5.7) * H, r = 2 + hash(f * 5.1 + i) * 6, dark = hash(f * .7 + i * 2.2) < .7;
    if (hash(f * 6.3 + i) < .3) { const P = []; for (let k = 0; k < 7; k++) P.push([x + k * 7 + Math.sin(k * 1.3 + f) * 8, y + Math.cos(k * .9 + i) * 10 + k * 3]); inkLine(P, .6, dark ? PS.ink : PS.white, 'inkfine', .7); }
    else paint(oval(x, y, r, r * (.6 + hash(f + i * 4) * .6), hash(f * 2 + i) * 3, 8), { wash: dark ? PS.ink : PS.white, washOp: 200, ink: null });
  }
}
// The projector's light falls off toward the corners (multiplied over the frame).
let psVigTex = null;
function psVignette(k = 1) {
  const q = Math.round(clamp(k) * 12); if (!q) return;   // (k: its strength, in 12 cached steps; 0 = none)
  psVigTex = psVigTex || {};
  if (!psVigTex[q]) {
    const g = createGraphics(256, 256); g.pixelDensity(1); const c = g.drawingContext, gr = c.createRadialGradient(128, 128, 30, 128, 128, 184);
    const m = (r, gg, b) => `rgb(${Math.round(255 + (r - 255) * q / 12)},${Math.round(255 + (gg - 255) * q / 12)},${Math.round(255 + (b - 255) * q / 12)})`;
    gr.addColorStop(0, m(255, 254, 250)); gr.addColorStop(.5, m(253, 249, 240)); gr.addColorStop(.78, m(226, 208, 186)); gr.addColorStop(1, m(150, 124, 108));
    c.fillStyle = gr; c.fillRect(0, 0, 256, 256); psVigTex[q] = g;
  }
  flushBrush(); push(); blendMode(MULTIPLY); image(psVigTex[q], -40, -40, W + 80, H + 80); blendMode(BLEND); pop();
}
// The projector's gate: rounded dark corners. It's fixed; the picture weaves inside it.
function psGate() {
  boilSeed('ps gate');
  const r = 64;
  for (const [cx, cy, sx, sy] of [[0, 0, 1, 1], [W, 0, -1, 1], [0, H, 1, -1], [W, H, -1, -1]]) {
    const P = [[cx - sx * 60, cy - sy * 60], [cx + sx * (r + 4), cy - sy * 60]];
    for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI / 2; P.push([cx + sx * (r - Math.sin(a) * r), cy + sy * (r - Math.cos(a) * r)]); }
    P.push([cx - sx * 60, cy + sy * (r + 4)]);
    paint(P, { wash: PS.black, washOp: 235, ink: null });
  }
}
// Flicker: the projector's light pumping a little from frame to frame.
function psFlicker(f, amt = 1) {
  const k = (hash(f * 2.71 + 5) - .5) * 2 * amt;
  if (k > .1) paint(rectPts(-80, -80, W + 160, H + 160), { wash: '#FFF6E4', washOp: 24 * k, ink: null });
  else if (k < -.1) paint(rectPts(-80, -80, W + 160, H + 160), { wash: PS.ink, washOp: 26 * -k, ink: null });
}

// ---------- the acting, as pure functions of lt ----------
function psRobotState(lt) {
  const P = PST, { x0, x1, y, u } = PSX.bot;
  // three strutting steps on the eighths; the last one eases out
  const a = .62, v = 2 / (1 + a), wu = seg(lt, P.enter, P.stop), wk = wu <= a ? v * wu : v * a + v * (wu - a) - v * (wu - a) ** 2 / (2 * (1 - a));
  const x = lerp(x0, x1, wk), walk = (x0 - x) / (2 * 6.0 * u) + .07, walking = lt < P.stop;
  const ww = walking ? 1 : 1 - ease(seg(lt, P.stop, P.stop + .12));
  let dy = -.6 * Math.abs(Math.sin((walk - .07) * TAU)) * ww, rot = -.06 * ww;
  dy += .3 * spring(lt, P.stop, 9, 22);
  // serve: lean back (anticipation), lean in, straighten; then a small bow
  rot += .05 * ease(seg(lt, P.lean, P.reach)) * (1 - ease(seg(lt, P.reach, P.reach + .1)));
  rot += -.09 * ease(seg(lt, P.reach, P.meet)) * (1 - ease(seg(lt, P.back, P.back + .14)));
  const bow = Math.sin(Math.PI * seg(lt, P.bow, P.clock));
  rot += -.04 * bow;
  if (lt > P.back + .2) dy += -.16 * Math.abs(Math.sin(bpOf(lt) * Math.PI));   // an idle bob on the beat
  const turn = ease(seg(lt, P.turn, P.turn + .1)), wink = seg(lt, P.wink, P.wink + .07);
  const look = lt < P.stop ? [-.7, .1] : lt < P.turn - .06 ? [-.9, .55] : lt < P.turn ? [lerp(-.9, 0, seg(lt, P.turn - .06, P.turn)), .2] : [0, 0];
  return { x, y, u, walk, walkW: ww, dy, rot, turn, wink, bow, look,
    grin: .35 + .65 * ease(seg(lt, P.wink - .04, P.wink + .1)),
    antenna: .35 * Math.sin(walk * TAU * 2) * ww + ring(lt, [P.stop, P.back, P.wink]) * .5,
    bulb: Math.max(pulse(lt, 5) * .35, ease(seg(lt, P.wink, P.wink + .06)) * (1 - seg(lt, P.wink + .3, P.wink + .6))),
    htilt: .07 * ease(seg(lt, P.wink - .02, P.wink + .08)), hdy: -.15 * spring(lt, P.turn + .1, 8, 20), gauge: lt * 3,
    land: spring(lt, P.stop, 12, 24) };   // (rubber hose: the squash as he stops dead)
}
// The tray hand's wrist (world) along the serve, and whether the glass is still on the tray.
function psTrayPath(lt, rs) {
  // (home: the tray carried a little low, so at rest its rim clears the right tree's chin: at -9.1 it touched it, a tangent)
  // (with the glass on it, from the walk-in to the serve, it rides low and level at his waist (carry): carried at home,
  // the glass sat on the right tree's mouth (the tree leans his way on the beat). The anticipation pulls back, not up)
  // (the handoff is up behind the gent's head, level with his hat, between its brim and the tree's face, for his reach
  // over his shoulder: the tray goes left under the tree's chin, then up; and back the same way, under the chin, not
  // across its face)
  const P = PST, u = rs.u, home = [rs.x - 4.6 * u, rs.y - 8.5 * u + rs.dy * u], meet = PSX.meet, carry = [rs.x - 4.6 * u, rs.y - 7.4 * u];
  const reachK = ease(seg(lt, P.reach, P.meet)), backK = backOut(seg(lt, P.back, P.back + .22));
  const pull = .3 * u * ease(seg(lt, P.lean, P.reach)) * (1 - reachK);
  const bez = (a, c, b, k) => [0, 1].map(d => (1 - k) * (1 - k) * a[d] + 2 * k * (1 - k) * c[d] + k * k * b[d]);
  const out = bez(carry, PSX.under, meet, reachK), bk = bez(meet, [PSX.under[0] + 45, PSX.under[1]], home, backK);
  const p = lt < P.back ? [out[0] + pull, out[1]] : bk;
  return { p, glass: lt < P.take };
}
// The resting near arm's elbow (gent-local px): it bows down, toward the hammock under him (bowed up, a man lying on
// his back had his elbow bent backwards: the user)
function psArmRestMid(sh, tip) {
  const d = [tip[0] - sh[0], tip[1] - sh[1]], L = Math.hypot(d[0], d[1]) || 1, bow = lerp(.42, .12, clamp(L / (5 * PSX.g)));
  const nx = -d[1] / L, ny = d[0] / L, fb = clamp(ny / .34, -1, 1);   // (n: a perpendicular; fb: which way is down, and how far)
  return [sh[0] + d[0] * .5 + nx * fb * L * bow, sh[1] + d[1] * .5 + ny * fb * L * bow];
}
// The hammock's swing (the gent is drawn in it, about PSH.piv; the butler isn't)
const psSwing = tt => .01 * Math.sin(bpOf(tt) * Math.PI / 2 - .6);
// Where the glass's foot stands on the butler's tray at lt (world): psRobotRH's tray and glass, through his lean and squash
function psTrayGlass(lt) {
  const rs = psRobotState(lt), tp = psTrayPath(lt, rs), u = rs.u, r = rs.rot || 0;
  const ww = clamp(rs.walkW ?? 0), c = frac((rs.walk || 0) * 2), sq = ww * (.08 * Math.exp(-c * 8) - .035 * Math.sin(Math.PI * c)) + .12 * (rs.land || 0);
  const b = -.7 * r, gx = -.45 * u, gy = -.1 * u;
  const lx = (-.55 * u + gx * Math.cos(b) - gy * Math.sin(b)) * (1 + sq * .6), ly = (-.62 * u + gx * Math.sin(b) + gy * Math.cos(b)) * (1 - sq);
  return [tp.p[0] + lx * Math.cos(r) - ly * Math.sin(r), tp.p[1] + lx * Math.sin(r) + ly * Math.cos(r)];
}
// A smooth path through keyed values (cubic Hermite, Catmull-Rom tangents in time, still at the first and last keys).
// K: [[t, [v...]], ...]
function psSpline(t, K) {
  const n = K.length;
  if (t <= K[0][0]) return K[0][1].slice();
  if (t >= K[n - 1][0]) return K[n - 1][1].slice();
  let i = 0; while (t > K[i + 1][0]) i++;
  const tan = j => K[j][1].map((_, d) => j <= 0 || j >= n - 1 ? 0 : (K[j + 1][1][d] - K[j - 1][1][d]) / (K[j + 1][0] - K[j - 1][0]));
  const [t0, a] = K[i], [t1, b] = K[i + 1], h = t1 - t0, s = (t - t0) / h, s2 = s * s, s3 = s2 * s, ma = tan(i), mb = tan(i + 1);
  return a.map((v, d) => (2 * s3 - 3 * s2 + 1) * v + (s3 - 2 * s2 + s) * h * ma[d] + (3 * s2 - 2 * s3) * b[d] + (s3 - s2) * h * mb[d]);
}
// The near arm, lazily, over his shoulder (the user, 2026-09-26: "ideally he'd grab the drink over his shoulder then
// move it down and laterally to his side"). He stays lying back. The upper arm rises past the back of his head, the
// elbow comes up above his hat, pointing at the sky, and the forearm drops back behind his head to the glass on the tray
// the butler holds up there; he takes it, brings it back over his shoulder in an arc, and lowers it down and out to his
// side: the elbow down at his side on the hammock's rim, the hand on the rim by his belly, the glass upright. The arm
// never crosses his face. Keyed as the hand's path (the wrist, world) and the upper arm's and forearm's lengths, splined;
// the elbow is solved to one side of the shoulder-hand line always (psIK), so its bend never flips, and the path goes
// round the back of his head both ways.
//   key: [t, wrist (world) | 'rest' | 'grab' | 'side', l1, l2, lift (the shoulder's shrug, 0..1)]
const PSA = {
  sh0: [4.1, -2.05], sh1: [4.05, -2.4],    // the shoulder at rest, and shrugged as the arm goes up (g, from his hips)
  elbow: [852, 440],                      // at the grab, the elbow above his hat (world); the hand from the glass's stem
  side: { elbow: [808, 785], hand: [738, 790] },   // at his side (world)
  reach: [[1.58, 'rest', 0, 0, 0], [1.66, [735, 624], 90, 75, .5], [1.73, [796, 466], 170, 120, 1], [1.79, [925, 446], 215, 150, 1], [1.86, 'grab', 0, 0, 1]],
  back: [[1.9, 'grab', 0, 0, 1], [1.95, [960, 452], 215, 150, 1], [2.0, [835, 438], 190, 140, 1], [2.06, [708, 590], 150, 110, .6], [2.1, [706, 700], 110, 85, .2], [2.14, 'side', 0, 0, 0]],
};
// The elbow, given the shoulder S, the wrist H and the two lengths: always on the same side of the line S→H (a bend
// clockwise on screen, as every pose here has it: the forearm folds in front). Stretched straight if it must reach.
function psIK(S, H, l1, l2) {
  const dx = H[0] - S[0], dy = H[1] - S[1], d = Math.hypot(dx, dy) || 1, k = Math.max(1, d / ((l1 + l2) * .999));
  l1 *= k; l2 *= k;
  const a = Math.atan2(dy, dx) - Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  return [S[0] + l1 * Math.cos(a), S[1] + l1 * Math.sin(a)];
}
let psArmMemo = null;
// The named poses as [wrist x, wrist y, l1, l2]. The grab's wrist puts the glove's grip on the stem of the glass standing
// on the tray at the take (in the hammock's swing), at the angle the hose's own tip makes.
function psArmPoses() {
  if (psArmMemo) return psArmMemo;
  const P = PST, u = PSX.bot.u, g = PSX.g, [hx, hy] = PSX.hips, A = PSA, pt = ([x, y]) => [hx + x * g, hy + y * g];
  const S0 = pt(A.sh0), S1 = pt(A.sh1), dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const m = psArmRestMid([A.sh0[0] * g, A.sh0[1] * g], [2.3 * g, -1.75 * g]), H0 = pt([2.3, -1.75]), E0 = [hx + m[0], hy + m[1]];
  const foot = psTrayGlass(P.take), a = -psSwing(P.take), pv = PSH.piv, fx = foot[0] - pv[0], fy = foot[1] - pv[1];
  const grip = [pv[0] + fx * Math.cos(a) - fy * Math.sin(a), pv[1] + fx * Math.sin(a) + fy * Math.cos(a) - .38 * 1.35 * u], E = A.elbow, reach = .9 * .8 * g;
  let H = [grip[0] - reach, grip[1]];
  for (let i = 0; i < 4; i++) {
    const C = through([S1, E, H], 10), e = C[C.length - 1], q = C[C.length - 2], ang = Math.atan2(e[1] - q[1], e[0] - q[0]);
    H = [grip[0] - reach * Math.cos(ang), grip[1] - reach * Math.sin(ang)];
  }
  const sd = A.side;
  return psArmMemo = { S0, S1, rest: [...H0, dist(S0, E0), dist(E0, H0)], grab: [...H, dist(S1, E), dist(E, H)], side: [...sd.hand, dist(S0, sd.elbow), dist(sd.elbow, sd.hand)] };
}
function psGentState(lt) {
  const P = PST, A = PSA, glassIn = lt >= P.take;
  let arm = null, reach = 0;
  if (lt > A.reach[0][0]) {
    const Q = psArmPoses(), keys = (lt < A.back[0][0] ? A.reach : A.back).map(([t, h, l1, l2, lift]) => [t, typeof h === 'string' ? [...Q[h], lift] : [h[0], h[1], l1, l2, lift]]);
    const [x, y, l1, l2, lift] = psSpline(lt, keys), S = [lerp(Q.S0[0], Q.S1[0], lift), lerp(Q.S0[1], Q.S1[1], lift)], tz = A.back[A.back.length - 1][0];
    // (at his side: it lands with a little give, then the glass keeps time, lifting a touch on each beat)
    const H = [x, y + (lt > tz ? 5 * spring(lt, tz, 10, 28) - 2.5 * Math.max(0, Math.sin(bpOf(lt) * Math.PI)) * ease(seg(lt, tz + .06, tz + .26)) : 0)];
    arm = { S, E: psIK(S, H, l1, l2), H };
    reach = lt < A.back[0][0] ? ease(seg(lt, A.reach[0][0], A.reach[1][0])) : 0;
  }
  const eyes = lt > 1.22 && lt < P.take + .14 ? 'open' : 'bliss';
  const look = lt < A.reach[0][0] ? [.9, -.2] : [.75, -.75];   // (a glance up at the tray as he reaches)
  const headTurn = ease(seg(lt, 1.18, 1.32)) * lerp(1, .5, ease(seg(lt, A.reach[0][0], A.reach[2][0]))) * (1 - ease(seg(lt, 2.0, 2.16)));
  return { hand: arm && arm.H, elbow: arm && arm.E, sh: arm && arm.S, glassIn, reach, eyes, look, headTurn,
    hatHop: Math.max(0, spring(lt, 1.2, 7, 16)) * .6, tap: Math.max(0, Math.sin(bpOf(lt) * Math.PI)) * (lt < 1.2 || lt > 2.2 ? 1 : .3) };
}
function psClockState(lt) {
  const P = PST, e = x => x < .5 ? 2 * x * x : 1 - 2 * (1 - x) ** 2, spin = t => kf(t, [[P.spin0, 0], [P.spin1, 1]], e);
  const settle = lt > P.spin1 ? spring(lt, P.spin1, 7, 26) * .22 : 0;
  const m0 = 10 / 60 * TAU, h0 = (12 + 10 / 60) / 12 * TAU;   // 12:10, rewound two hours to 10:10
  const min = m0 - spin(lt) * 2 * TAU - settle, hr = h0 - spin(lt) * (2 / 12) * TAU - settle * .3;
  const sv = -(spin(lt + .01) - spin(lt)) * 2 * TAU / .01;
  return { min, hr, spinV: sv, jolt: .13 * spring(lt, P.clock, 7, 30) + .04 * spring(lt, P.spin1, 6, 20),
    hop: -10 * Math.max(0, spring(lt, P.clock, 9, 18)) - 8 * Math.max(0, spring(lt, P.smile + .08, 8, 18)), smile: seg(lt, P.smile, P.smile + .14),
    pend: .32 * Math.sin(bpOf(lt) * Math.PI), look: lt > P.spin0 - .05 && lt < P.spin1 ? [Math.sin(min) * .8, -Math.cos(min) * .8] : [.2, .2] };
}

// ---------- the scene ----------
// The picture (the world) at film time lt; t = video time.
function psPicture(t, lt) {
  const tt = mt(lt), bp = bpOf(tt);
  psSky();
  psCloud(1570, 120, .95, 'a', tt); psCloud(1880, 330, .6, 'b', tt); psCloud(1070, 92, .5, 'c', tt);
  psSun(tt);
  psHills(tt);
  psFence();
  psLawn();
  const rs = psRobotState(tt), gs = psGentState(tt), cs = psClockState(tt);
  // the trees sway against each other (never twinned); their eyes follow the story
  const lookL = tt < .9 ? [.3, .3] : tt < 2.18 ? [.9, .1] : tt < 2.95 ? [.9, -.6] : [0, .2];
  const lookR = tt < .9 ? [-.3, .3] : tt < 1.62 ? [.9, .2] : tt < 2.18 ? [-.9, .3] : tt < 2.95 ? [-.9, -.5] : [0, .2];
  let clockAt = null;
  const SL = psTree(PSX.treeL[0], PSX.treeL[1], PSX.treeL[2], { key: 'pstreeL', sway: Math.sin(bp * Math.PI / 2), sq: .05 * pulse(tt, 5), look: lookL, blink: frac(tt / 2.7 + .1) < .04, cw: 232, ch: 168,
    branch: S => {   // a branch reaching out over the hammock; the clock hangs from its tip
      boilSeed('ps branch');
      const b0 = psSpineAt(S, .78).p, tip = [PSX.clock[0] + 16, PSX.clock[1] - PSX.clock[2] * 2.35 - 34];
      limb([b0, [lerp(b0[0], tip[0], .55), lerp(b0[1], tip[1], .55) - 34], tip], 30, 13, PS.bark, { sw: psSW, ink: PS.ink, key: 'psbranch' });
      psL([[tip[0] - 2, tip[1]], [tip[0] + 22, tip[1] + 4], [tip[0] + 34, tip[1] + 16]], psSW * 1.1, PS.barkDk, .5);
      for (const [lx, ly, a] of [[tip[0] + 30, tip[1] + 22, 1.2], [tip[0] + 14, tip[1] - 10, -.6]]) { push(); translate(lx, ly); rotate(a); psP(curvy([[0, 0], [12, -9], [26, 0], [12, 8]], 3), PS.leaf, { sw: psSW * .6, key: 'pstwigleaf' + a, lift: 2, flatCard: true }); pop(); }
      clockAt = tip;
    } });
  const SR = psTree(PSX.treeR[0], PSX.treeR[1], PSX.treeR[2], { key: 'pstreeR', sway: Math.sin(bp * Math.PI / 2 + 2.1) * .8, sq: .05 * pulse(tt + BEAT / 2, 5), look: lookR, blink: frac(tt / 3.3 + .6) < .04, cw: 262, ch: 176, leaf: mixCol(PS.teal, PS.mint, .35), leafDk: PS.teal, brow: cs.smile });
  // the clock on its cord
  boilSeed('ps cord');
  const [ckx, cky, ckr] = PSX.clock, jx = Math.sin(cs.jolt) * ckr * 2.35;
  psL([clockAt, [ckx + jx * .3, cky - ckr * 2.35 + cs.hop]], psSW * .7, PS.woodDk, 0);
  psClock(ckx, cky, ckr, cs);
  // the hammock and the gent, swinging gently
  const A = psSpineAt(SL, .38).p, B = psSpineAt(SR, .36).p;
  push(); translate(PSH.piv[0], PSH.piv[1]); rotate(psSwing(tt)); translate(-PSH.piv[0], -PSH.piv[1]);
  psHammockBack();
  psGent(gs);
  psHammockFront(A, B);
  pop();
  // the robot
  if (tt > PST.enter - .04) {
    const tp = psTrayPath(tt, rs);
    psRobot(rs.x, rs.y, rs.u, { ...rs, tray: tp.p, trayGlass: tp.glass });
    const tw = seg(tt, PST.wink + .03, PST.wink + .12) * (1 - seg(tt, PST.wink + .34, PST.wink + .5));
    if (tw > 0) { boilSeed('ps twinkle'); psTwinkle(rs.x + 1.9 * rs.u, rs.y - 14.3 * rs.u, 34, tw); }
  }
  boilSeed('ps tulips');
  [[60, 1010, 90, PS.rose], [120, 1040, 110, PS.gold], [190, 1018, 80, PS.cheek], [1740, 1030, 100, PS.gold], [1810, 1010, 84, PS.rose], [1872, 1046, 106, PS.cheek]].forEach(([x, y, h, c], i) => psTulip(x, y, h, c, i, tt));
}
// The jam: the film loses its loop. The film time shown, the vertical slip (px), a sideways shake and the flicker.
function psJam(lt) {
  const P = PST;
  if (lt < P.jam) return null;
  if (lt >= P.burn) return { show: P.jam - .02, slip: 0, dx: 0, flick: .8, frozen: true };
  const f = Math.floor((lt - P.jam) * 24 + 1e-6), slips = [16, -8, 64, 18, 170, 46, 300, 120, 34, 10];
  return { show: P.jam - .02 - (f % 2) * .07 - (f % 3 === 2 ? .05 : 0), slip: slips[Math.min(f, slips.length - 1)], dx: (hash(f * 3.3) - .5) * 14, flick: 2.2 };
}
function pastScene(t, lt, o = {}) {
  const jam = o.still ? null : psJam(lt), show = jam ? jam.show : lt, film = o.film ?? 1;   // (film: 0..1, the projection's damage and light)
  const f = jam && jam.frozen ? psFilmFrame(PST.jam) : psFilmFrame(jam ? show : t), ff = psFilmFrame(t);
  // gate weave: the picture drifts a pixel or two, frame to frame
  const wx = (hash(ff * 1.7) - .5) * 3 + 1.5 * Math.sin(t * 1.9), wy = (hash(ff * 2.9 + 3) - .5) * 4 + 1.5 * Math.sin(t * 1.3 + 1);
  const draw = dy => { push(); translate(wx * film + (jam ? jam.dx : 0), wy * film + dy); rotate(.0015 * film * Math.sin(t * 1.1)); psPicture(t, show); psDirt(f, film); pop(); };
  boilSeed('ps base'); paint(rectPts(-100, -100, W + 200, H + 200), { wash: PS.black, ink: null });
  draw(jam ? jam.slip : 0);
  if (jam && Math.abs(jam.slip) > 4) {   // the frame line (and the neighbouring frame) roll into view
    const s = jam.slip, gap = 46, by = s > 0 ? s - gap : H + s;
    if (Math.abs(s) > gap) draw(s > 0 ? s - gap - H : s + gap + H);
    boilSeed('ps frameline'); paint(rectPts(-80, by + wy, W + 160, gap), { wash: PS.black, ink: null });
  }
  boilSeed('ps flicker'); psFlicker(ff, (jam ? jam.flick : .7) * film);
  psVignette(film);
  if (o.gate !== false) psGate();
  if (!o.still && !o.noBurn && lt >= PST.burn) burnHole(seg(lt, PST.burn, PST.end), t);
  boilSeed('ps after');
}

// ---------- the burn (screen space) ----------
// The hole's radius along one parameter s: 0..1 is shot B (burnHole), 1..2 is shot C (burnReveal).
const psBurnR = s => 1750 * Math.pow(clamp((s - .16) / 1.84), 1.9);
const psBurnW = r => .8 + r / 600;   // the rim's rings widen as the hole grows
function burnPoly(cx, cy, r, t) {
  const n = 72, f = Math.floor(t * 24 + 1e-6), P = [], ph = .35 * Math.log(1 + r / 60), fl = Math.min(5, 1 + r * .012);
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU;
    const k = 1 + .15 * Math.sin(3 * a + 1.3 + ph) + .09 * Math.sin(5 * a + 4.1 - ph * .7) + .06 * Math.sin(8 * a + .7 + ph * 1.3) + .035 * Math.sin(13 * a + 2.2);
    const sc = Math.min(1, r / 70) * (4 + r * .02) * (.6 * Math.abs(Math.sin(9 * a + ph)) + .4 * Math.abs(Math.sin(17 * a + 1.1)));
    const jag = (hash(i * 3.71 + 1) - .5) * Math.min(r * .09, 18) + (hash(i * 1.93 + 7) - .5) * Math.min(r * .05, 9);
    const rr = Math.max(0, r * k + sc + jag + (hash(i * 7.3 + f * 1.1) - .5) * fl);
    P.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return P;
}
// The glowing, charred rim around a hole of radius R: rings (char → ember → white-hot at the edge), then its light.
// inside: paint the rings as nested discs (the hole is painted over them); else paint them outside-in with irisShape().
// Bands out from the edge: [inner radius offset, colour]; beyond the last one it's black (burnt through).
// part: 'all', or 'bands' / 'glow' alone (burnReveal's o.outside paints the bands inside a clip and the glow over it)
function psRim(R, t, inside, part = 'all') {
  const [cx, cy] = PSX.burn, w = psBurnW(R), bands = [[0, PS.hot], [2.2 * w, PS.ember], [6 * w, '#8A3A1C'], [13 * w, PS.char], [28 * w, PS.black]];
  if (part !== 'glow') {
    if (inside) for (let i = bands.length - 2; i >= 0; i--) paint(burnPoly(cx, cy, R + bands[i + 1][0], t), { wash: bands[i][1], ink: null });   // nested discs, outer first
    else for (const [d, col] of bands) irisShape(burnPoly(cx, cy, R + d, t), col);   // everything outside each band's inner edge, inner first
  }
  if (part === 'bands') return;
  const f = Math.floor(t * 24 + 1e-6), P = burnPoly(cx, cy, R + 6 * w, t);
  for (let i = 0; i < 12; i++) { const p = P[Math.floor(i / 12 * P.length + hash(i + f * .1) * 5) % P.length]; glow(p[0], p[1], 50 + R * .12, PS.ember, .5 + .4 * hash(i * 3 + f)); }
}
function burnHole(p, t) {
  if (p <= 0) return;
  const [cx, cy] = PSX.burn, R = psBurnR(p), w = psBurnW(R), R0 = R + 28 * w, S = R0 + 60 * Math.sqrt(p) + 1750 * Math.pow(p, 2.6), dk = ease(seg(p, .5, 1));
  const f = Math.floor(t * 24 + 1e-6);
  boilSeed('ps burn');
  // the scorch: the film browns outward from the hole in soft steps, darker toward it
  for (let i = 0; i < 6; i++) {
    const k = 1 - i / 6, r = lerp(R0, S, k * k), col = mixCol('#A87850', '#2A160E', Math.pow(1 - k, .8));
    paint(burnPoly(cx, cy, r, t + i * 7.1), { wash: col, washOp: lerp(70 + 30 * (1 - k), 255, dk * k) , ink: null });
  }
  // the emulsion blisters: cells that swell in the scorched band as it spreads, then pop
  for (let i = 0; i < 34; i++) {
    const a = hash(i * 4.37) * TAU + .02 * Math.sin(f * .9 + i), fr = .08 + .8 * hash(i * 2.21) ** 1.6, d = lerp(R0 * .96, lerp(R0, S, .5), fr);
    const life = clamp((p - hash(i * 5.3) * .5) * 4), br = (5 + 13 * hash(i * 1.7)) * Math.sin(Math.PI * life) * (1 + .15 * (hash(i + f) - .5));
    if (br < 1.5) continue;
    const bx = cx + Math.cos(a) * d, by = cy + Math.sin(a) * d;
    paint(oval(bx, by, br, br * .82, a, 10), { wash: mixCol('#5A301C', PS.black, dk), washOp: 230, ink: mixCol('#D8A878', '#4A2A1A', dk), sw: .45 });
    paint(oval(bx - br * .3, by - br * .3, br * .28, br * .24, 0, 6), { wash: mixCol('#E8C8A0', PS.black, dk), washOp: 200, ink: null });
  }
  if (dk > 0) paint(burnPoly(cx, cy, S * .98, t), { wash: PS.black, washOp: 255 * dk, ink: null });
  // a hot spot before it burns through, then the hole and its glowing rim
  if (R < 2) { glow(cx, cy, 60 + 500 * p, PS.hot, .4 + 4 * p); glow(cx, cy, 30 + 200 * p, '#FFFFFF', 2 * p); return; }
  psRim(R, t, true);
  paint(burnPoly(cx, cy, R, t), { wash: PS.black, ink: null });
}
function burnReveal(p, t, o = {}) {
  if (p >= 1) return;
  boilSeed('ps burn');
  const R = psBurnR(1 + clamp(p));
  if (!o.outside) { psRim(R, t, false); return; }
  // o.outside: the picture round the hole (clipped to outside it), the rim's bands on it as nested discs (no black), the
  // glow over both, as the burn's last shot drew them (C2f: psRim inside, the new shot in the hole)
  const [cx, cy] = PSX.burn;
  clipPoly([rectPts(-200, -200, W + 400, H + 400), burnPoly(cx, cy, R, t)], () => { o.outside(); boilSeed('ps burn'); psRim(R, t, true, 'bands'); }, { screen: true });
  boilSeed('ps burn'); psRim(R, t, true, 'glow');
}

// ---------- review loops ----------
LOOPS.past = t => pastScene(t, t);
LOOPS.past.len = 4.29;
// The cut into shot C with a stand-in for the bunker (dark, candlelit): burnHole to the end of B, then burnReveal.
LOOPS.pastCut = t => {
  const lt = 3.4 + t;
  if (lt < PST.end) { pastScene(lt, lt); return; }
  const p = seg(lt, PST.end, PST.end + .6);
  paint(rectPts(-60, -60, W + 120, H + 120), { wash: NOIR.bunkerDk, ink: null });
  for (let i = 0; i < 5; i++) { paint(rrPts(200 + i * 330, 260, 180, 560, 20), { wash: NOIR.bunker, ink: NOIR.ink, sw: 1.5 }); glow(290 + i * 330, 230, 160, NOIR.lamp, .8); }
  burnReveal(p, lt);
};
LOOPS.pastCut.len = 1.6;
// A seam check: t < .5 draws burnHole(1) over a grey ground, t ≥ .5 burnReveal(0) over a white one, at the same film time.
LOOPS.pastSeam = t => { const T0 = 4.29; paint(rectPts(-60, -60, W + 120, H + 120), { wash: t < .5 ? '#808080' : '#F0F0F0', ink: null }); if (t < .5) burnHole(1, T0); else burnReveal(0, T0); };
LOOPS.pastSeam.len = 1;
// The daydream seen small through a window (as shot A will use it): o.still, scaled into a frame, lt running from −1.
LOOPS.pastSmall = t => {
  paint(rectPts(-60, -60, W + 120, H + 120), { wash: NOIR.char, ink: null });
  push(); translate(160, 140); scale(.5); pastScene(t - 1, t - 1, { still: true }); pop();
  irisShape(rrPts(160, 140, 960, 540, 60), NOIR.char);
};
LOOPS.pastSmall.len = 2;

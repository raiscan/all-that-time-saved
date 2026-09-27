// commuter.js: the narrator. A Black British man in his 30s: a big rubber-hose head, a tight crop with a crisp line-up,
// a short full beard, a mustard parka with a fur-trimmed hood, lanyard, earbuds, backpack, big trainers. Bare hands, eye
// whites and his own features (no minstrel tropes: see brief/directive.md).
//
// commuter(x, y, u, o): (x, y) = the ground point between his feet; u = unit (he's ~13.4u tall). Views: front | q (3/4,
// facing right; flip: true faces left). Takes feel()/emotions() spreads for the face and body life, plus:
//   pose: a name from HPOSE, or { L, R } from poses() · tilt (head, rad) · seated (no legs) · lanyard, pack, buds (bool)
//   hold: (s) => draws a prop in his right hand (held) · holdL: same for the left
//   cm: colour overrides ({ skin, skinDk, hair, coat, ... } from CM_BASE) and beard: false, to build someone else on this rig
const CM_BASE = {
  skin: '#7E5038', skinDk: '#5A3726', skinLt: '#A06A50', hair: '#241A1E', hairLt: '#46363A', beard: '#3A2B2C', beardLt: '#5A4644', lip: '#52301F', lipLt: '#744634',
  coat: '#E0A526', coatDk: '#A36E12', coatLt: '#F4CD6A', fur: '#948A7A', furDk: '#645C50', trousers: '#3E4052', trousersDk: '#2B2D3A',
  shoe: '#46424E', sole: '#D8D0C2', pack: '#3C4350', packDk: '#2C323D', lanyard: '#B8303F', badge: '#E6DED0',
};
// His 3/4 face layout (facing right; x from the head's centre hx, body units), for scenes that draw over his face
// (glasses, lashes, a tongue): eyes [[x, width scale], ...] (the near eye full, the far one foreshortened), eye y and
// width, mouth centre and width, the nose tip (in the head's outline).
const CM_QFACE = { eyes: [[.42, 1], [1.58, .7]], eyeY: -10.85, eyeW: 1.05, mouth: [1.35, -9.08], mouthW: 1.3, noseTip: [2.42, -10.06] };
// Hand targets in body units: [x, y, bend, hand pose, front (drawn over the body)]. Positive bend bows outward.
const HPOSE = {
  idle:    { L: [-2.5, -4.0, .16, 'relax'], R: [2.5, -4.0, .16, 'relax'] },
  low:     { L: [-2.2, -3.6, .08, 'relax'], R: [2.2, -3.6, .08, 'relax'] },
  hips:    { L: [-2.05, -5.1, .8, 'fist'], R: [2.05, -5.1, .8, 'fist'] },
  pockets: { L: [-1.3, -4.75, .3, 'none', 1], R: [1.3, -4.75, .3, 'none', 1] },
  fists:   { L: [-2.6, -4.3, .1, 'fist'], R: [2.6, -4.3, .1, 'fist'] },
  up:      { L: [-3.1, -9.4, .22, 'open'], R: [3.1, -9.4, .22, 'open'] },
  chest:   { L: [-.75, -6.5, .45, 'relax', 1], R: [.75, -6.8, .45, 'relax', 1] },
  shrug:   { L: [-3.4, -7.3, .5, 'open'], R: [3.4, -7.3, .5, 'open'] },
  chin:    { L: [.35, -5.8, .4, 'relax', 1], R: [.6, -8.3, .6, 'fist', 1] },
  phone:   { L: [-2.4, -4.1, .16, 'relax'], R: [1.05, -6.4, .55, 'hold', 1] },
  table:   { L: [-1.2, -4.9, .35, 'relax', 1], R: [1.6, -5.1, .35, 'relax', 1] },
  crumple: { L: [-.45, -6.5, .5, 'fist', 1], R: [.45, -6.6, .5, 'fist', 1] },
};
// Blend between poses over time: keys [[t, name], ...]; each change eases in over `blend` s with a rubbery overshoot.
function poses(t, keys, blend = .3) {
  let i = 0; while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
  const cur = HPOSE[keys[i][1]] || keys[i][1]; if (i === 0) return cur;
  const prev = HPOSE[keys[i - 1][1]] || keys[i - 1][1], k = backOut(seg(t, keys[i][0], keys[i][0] + blend));
  const mix = (a, b) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k), k < .5 ? a[3] : b[3], k < .5 ? a[4] : b[4]];
  return { L: mix(prev.L, cur.L), R: mix(prev.R, cur.R) };
}

function commuter(x, y, u, o = {}) {
  const CM = o.cm ? { ...CM_BASE, ...o.cm } : CM_BASE;   // o.cm: colour overrides (another person built on this rig)
  const id = o.boilKey ?? ++CLAWD_N, rs = p => boilSeed(`cm ${id} ${p}`), S = P => U(P, u);
  const F = faceOf(o), seed = o.seed || 0, life = lifeOf(o, 'cm' + id + '|' + seed);   // idle life, not the beat (clawd.js)
  // breathing: a slight stretch about the feet (the shoulders, ~7.2u up, rise by life.breath); the weight shifts
  const q = o.view === 'q', sq = cardSq(((o.sq || 0) + (o.take || 0)) * .55) - life.breath / 7.2 * (o.seated ? .8 : 1), dy = (o.dy || 0) * 1.2 * u, sw = clamp(u / 20, .55, 2.2), lift = u * .12;
  const rot = (o.rot || 0) + (o.walk != null ? 0 : life.lean * (o.seated ? .4 : 1)), tilt = (o.tilt || 0) + life.tilt;
  const blink = (!F.style || F.style === 'open') && life.blink;
  x += (o.dx || 0) * u;
  rs('shadow'); if (!o.seated && !o.noShadow) paint(oval(x, y + .1 * u, 3.0 * u, .42 * u, 0, 24), { wash: NOIR.ink, washOp: STYLE.card ? 110 : 150, ink: null });
  push(); translate(x, y + dy); nudge('cm' + id, 1); if (rot) rotate(rot); scale((o.flip ? -1 : 1) * (1 + sq * .5), 1 - sq);
  const prevXF = XF; XF = o.flip ? -XF : XF;

  const pose = typeof o.pose === 'object' ? o.pose : HPOSE[o.pose || 'idle'];
  const arm = (s, spec, front) => {
    if (!!spec[4] !== front) return;
    rs('arm' + s);
    const [hx, hy, bend, hp] = spec, root = front ? [s * (q ? (s > 0 ? 1.7 : 1.1) : 1.9), -7.15] : [s * (q && s > 0 ? 1.2 : 1.55), -7.2];   // (3/4: the far arm, +x, tucked further behind)
    const tip = [hx + (q ? .35 : 0), hy], dx = tip[0] - root[0], dyy = tip[1] - root[1], L = Math.hypot(dx, dyy) || 1;
    const nx = -dyy / L, ny = dx / L, sd = bendSide(nx, ny, s, .3);   // (out and down: core.js bendSide)
    const mid = [root[0] + dx * .5 + nx * L * bend * sd, root[1] + dyy * .5 + ny * L * bend * sd];
    const far = q && s > 0 && !front, col = far ? mixCol(CM.coat, CM.coatDk, .55) : CM.coat;   // (facing right, +x is the far side)
    const r = limb(S([root, mid, tip]), .98 * u, .84 * u, col, { sw, shade: CM.coatDk, key: 'cmarm' + s });
    // cuff, then the hand coming out of it
    const ca = r.ang, cx = r.tip[0] - Math.cos(ca) * .32 * u, cy = r.tip[1] - Math.sin(ca) * .32 * u;
    limb([[cx - Math.cos(ca) * .1 * u, cy - Math.sin(ca) * .1 * u], [cx + Math.cos(ca) * .12 * u, cy + Math.sin(ca) * .12 * u], [r.tip[0], r.tip[1]]], .92 * u, .92 * u, CM.coatDk, { sw, key: 'cmcuff' + s, closedRoot: true });
    if (hp !== 'none') hand(r.tip[0] + Math.cos(ca) * .05 * u, r.tip[1] + Math.sin(ca) * .05 * u, ca, .84 * u, { pose: hp, col: far ? CM.skinDk : CM.skin, sw, mirror: s < 0, key: 'cmh' + s, hold: s > 0 ? o.hold : o.holdL, maxTone: .45 });
  };

  // ---- behind the body: arms at the sides, backpack, legs (3/4: the far arm, the pack on his back, then the near arm
  // in front of the pack; the far leg first) ----
  if (q) arm(1, pose.R, false); else { arm(-1, pose.L, false); arm(1, pose.R, false); }
  if (q && o.pack !== false) { rs('pack'); piece(curvy(S([[-3.05, -7.7], [-1.6, -7.9], [-1.4, -4.4], [-2.9, -4.2]]), 3), CM.pack, { sw, shade: CM.packDk, depth: .5 * u, key: 'cmpack', lift }); }
  if (q) arm(-1, pose.L, false);
  if (!o.seated) for (const s of (q ? [1, -1] : [-1, 1])) {
    rs('leg' + s);
    const walk = o.walk != null ? Math.sin(o.walk * TAU + (s > 0 ? Math.PI : 0)) : 0, lift2 = Math.max(0, walk) * .6;
    const hip = [s * .62 + (q ? .3 : 0), -4.1], ank = [s * .9 + (q ? .45 : 0), -.72 - lift2];
    limb(S([hip, [lerp(hip[0], ank[0], .5) + s * .12, -2.4 - lift2 * .5], ank]), 1.08 * u, .9 * u, q && s > 0 ? CM.trousersDk : CM.trousers, { sw, shade: CM.trousersDk, key: 'cmleg' + s });
    push(); translate(ank[0] * u, ank[1] * u); scale(q ? 1 : s, 1);
    const sh = curvy(S([[-.8, -.5], [.25, -.62], [1.05, -.28], [1.2, .12], [1.0, .38], [-.9, .38], [-1.05, 0]]), 5);
    piece(sh, CM.shoe, { sw, shade: NOIR.ink, depth: .25 * u, key: 'cmshoe' + s, lift });
    piece(curvy(S([[-1.0, .12], [1.15, .08], [1.02, .4], [-.92, .4]]), 3), CM.sole, { sw: sw * .8, key: 'cmsole' + s, lift: 2 });
    dline(S([[-.2, -.35], [.5, -.15]]), sw * .6, NOIR.light, .5);
    pop();
  }

  // ---- parka ----
  rs('coat');
  const cx0 = q ? .3 : 0, C = P => S(P.map(([a, b]) => [a + cx0, b]));
  const torso = curvy(C([[0, -8.0], [1.35, -7.9], [2.0, -7.15], [2.3, -5.9], [2.35, -4.6], [2.05, -3.9], [0, -3.72], [-2.05, -3.9], [-2.35, -4.6], [-2.3, -5.9], [-2.0, -7.15], [-1.35, -7.9]]), 5);
  piece(torso, CM.coat, { sw: sw * 1.15, shade: CM.coatDk, depth: .75 * u, key: 'cmtorso', lift });
  piece(curvy(C([[-2.3, -4.55], [0, -4.35], [2.3, -4.55], [2.05, -3.9], [0, -3.72], [-2.05, -3.9]]), 4), CM.coatDk, { sw, key: 'cmhem', lift: 2 });
  const zx = q ? .45 : 0;
  dline(C([[zx, -7.6], [zx + .05, -5.8], [zx, -3.8]]), sw * .7, NOIR.ink, .5);
  for (const s of [-1, 1]) { const w = q && s > 0 ? .6 : 1; dline(C([[s * .8 * w + zx, -5.3], [s * 1.25 * w + zx, -5.38], [s * 1.7 * w + zx, -5.3]]), sw * .7, NOIR.ink, .5); }   // pockets (3/4: the far one foreshortened)
  for (const s of [-1, 1]) { const tx = zx + s * .45; dline(C([[tx, -4.1], [tx + s * .05, -3.5]]), sw * .6, NOIR.ink); piece(oval((tx + cx0 + s * .05) * u, -3.45 * u, .1 * u, .14 * u, 0, 10), CM.badge, { sw: sw * .5, key: 'cmtog' + s, lift: 2, flatCard: true }); }
  if (o.pack !== false) for (const s of [-1, 1]) { const w = q ? (s > 0 ? .85 : 1.08) : 1; piece(curvy(C([[s * 1.3 * w + zx * .5, -7.95], [s * 1.62 * w + zx * .5, -7.9], [s * 1.78 * w + zx * .5, -5.9], [s * 1.5 * w + zx * .5, -5.9]]), 2), CM.pack, { sw: sw * .9, key: 'cmstrap' + s, lift: 2 }); }   // both straps (3/4: the far one foreshortened)
  if (o.lanyard !== false) {
    rs('lanyard'); const bx = zx + .05, sway = Math.sin((STYLE.card ? mt(T) : T) * 2.2) * .04;   // (card: on twos, like the rest of him)
    for (const s of [-1, 1]) dline(C([[s * .55, -7.95], [s * .35 + bx * .5, -7.0], [bx + sway, -6.25]]), sw * 1.3, CM.lanyard, .5);
    push(); translate((bx + cx0 + sway) * u, -5.95 * u); rotate(sway); scale(.72);
    piece(curvy(S([[-.42, -.45], [.42, -.45], [.42, .55], [-.42, .55]]), 2), CM.badge, { sw: sw * .7, key: 'cmbadge', lift: 3 });
    piece(curvy(S([[-.42, -.45], [.42, -.45], [.42, -.15], [-.42, -.15]]), 2), NOIR.pastTeal, { ink: null, key: 'cmbadgestrip', lift: 0, flatCard: true });
    piece(oval(0, .18 * u, .16 * u, .18 * u, 0, 10), CM.skinLt, { ink: null, key: 'cmbadgeface', lift: 0, flatCard: true });
    pop();
  }
  // fur-trimmed hood around the neck
  // the neck goes under the fur ruff (drawn before it, turned with the head), so no neck outline shows on the fur
  push(); translate(cx0 * .6 * u, -8.2 * u); rotate(tilt + rot * -.4); translate(-cx0 * .6 * u, 8.2 * u);
  rs('neck'); piece(curvy(S([[-.62 + cx0, -8.7], [.62 + cx0, -8.7], [.58 + cx0, -7.75], [-.58 + cx0, -7.75]]), 2), CM.skinDk, { sw, key: 'cmneck', lift: 2, maxTone: .45 });
  pop();
  rs('ruff');
  const ruff = []; for (let i = 0; i < 44; i++) { const a = i / 44 * TAU, r = 1 + .07 * Math.sin(a * 13) ** 2; ruff.push([(cx0 * .8 + Math.cos(a) * 2.05 * r) * u, (-8.0 + Math.sin(a) * .78 * r) * u]); }
  piece(ruff, CM.fur, { sw, shade: CM.furDk, depth: .35 * u, key: 'cmruff', lift });

  // ---- head ----
  push(); translate(cx0 * .6 * u, -8.2 * u); rotate(tilt + rot * -.4); translate(-cx0 * .6 * u, 8.2 * u);
  const lx = clamp(o.lookX || 0, -1, 1) * .18 + life.turn * .1, hx = (q ? .12 : 0) + lx;
  const earXs = q ? [-1.55 + hx] : [-2.18 + hx, 2.18 + hx];
  rs('ears');
  for (const ex of earXs) {
    const e = oval(ex * u, -10.3 * u, .4 * u, .62 * u, 0, 20); piece(e, CM.skin, { sw, shade: CM.skinDk, depth: .15 * u, key: 'cmear' + ex, lift: 2, maxTone: .45 });
    dline(S([[ex + Math.sign(ex - hx) * .08, -10.65], [ex + Math.sign(ex - hx) * .2, -10.3], [ex + Math.sign(ex - hx) * .05, -9.95]]), sw * .6, CM.skinDk, .5);
    if (o.buds !== false) { const bx = ex + Math.sign(ex - hx) * .02; piece(curvy(S([[bx - .09, -10.35], [bx + .09, -10.35], [bx + .08, -9.55], [bx - .08, -9.55]]), 2), '#F2EEE6', { sw: sw * .5, key: 'cmbud' + ex, lift: 2, flatCard: true }); piece(oval(bx * u, -10.38 * u, .15 * u, .15 * u, 0, 10), '#F2EEE6', { sw: sw * .5, key: 'cmbudh' + ex, lift: 2, flatCard: true }); }
  }
  rs('head');
  const headF = [[0, -13.15], [1.3, -12.85], [2.0, -12.0], [2.2, -10.8], [2.05, -9.6], [1.6, -8.7], [.85, -8.15], [0, -8.0], [-.85, -8.15], [-1.6, -8.7], [-2.05, -9.6], [-2.2, -10.8], [-2.0, -12.0], [-1.3, -12.85]];
  // 3/4: the far side is the face's profile (brow, a small rounded nose tip breaking the cheek line, the lips, the chin
  // swung round under the mouth); the near side is the back of the skull and the jaw running back to the ear
  const headQ = [[.1, -13.15], [1.35, -12.9], [2.0, -12.1], [2.15, -11.1], [2.12, -10.62], [2.28, -10.3], [2.42, -10.06], [2.3, -9.87], [2.1, -9.78], [2.08, -9.42], [2.02, -9.02], [1.92, -8.6], [1.62, -8.16], [1.2, -7.98], [.35, -8.1], [-.8, -8.45], [-1.6, -8.95], [-2.1, -9.7], [-2.25, -10.9], [-2.05, -12.0], [-1.3, -12.85]];
  const head = curvy(S((q ? headQ : headF).map(([a, b]) => [a + hx, b])), 5);
  piece(head, CM.skin, { sw: sw * 1.15, shade: CM.skinDk, depth: .55 * u, key: 'cmhead', lift, maxTone: .45 });
  // (3/4: the front's shapes wrapped round the turned face: its centre line at mq, the near side stretched back to the ear,
  // the far side foreshortened, and the far cheek's line-up kept below the nose)
  const mq = q ? CM_QFACE.mouth[0] : 0, wrap = a => !q ? a : a < 0 ? a * (1 + .67 * (a / 2.02) ** 2) : a * (.62 - .29 * (a / 2.02) ** 2);
  // beard (short, full, with a crisp line-up on the cheek) and moustache
  if (o.beard !== false) {
  rs('beard');
  const B = P => S(P.map(([a, b]) => [hx + mq + wrap(a), q && a > 1.2 ? Math.max(b, -9.66) : b]));
  const beard = B([[-2.02, -10.05], [-1.96, -9.5], [-1.55, -8.72], [-.84, -8.22], [0, -8.08], [.84, -8.22], [1.55, -8.72], [1.96, -9.5], [2.02, -10.05], [1.86, -9.98], [1.4, -9.25], [.95, -8.95], [.5, -8.62], [0, -8.56], [-.5, -8.62], [-.95, -8.95], [-1.4, -9.25], [-1.86, -9.98]]);
  piece(beard, CM.beard, { ink: null, key: 'cmbeard', lift: 0, flatCard: true });
  for (let i = 0; i < 14; i++) { const a = i / 13 * Math.PI, bx = -Math.cos(a) * 1.55, by = -8.75 + Math.sin(a) * .35 - (1 - Math.sin(a)) * .5; dline(B([[bx, by], [bx + .05, by + .13]]), sw * .45, CM.beardLt); }
  piece(curvy(B([[-.64, -9.12], [-.46, -9.32], [-.18, -9.42], [0, -9.38], [.18, -9.42], [.46, -9.32], [.64, -9.12], [.36, -9.19], [0, -9.21], [-.36, -9.19]]), 4), CM.beard, { ink: null, key: 'cmmou', lift: 0, flatCard: true });   // resting on the upper lip, no wider than the mouth
  }
  // hair: tight crop, crisp line-up at the temples, a little texture
  rs('hair');
  const H = P => S(P.map(([a, b]) => [a + hx + (q ? .12 : 0), b]));
  const hairOuter = through(H([[-2.24, -10.95], [-2.22, -11.95], [-1.48, -12.98], [0, -13.38], [1.48, -12.98], [2.22, -11.95], [2.24, -10.95]]), 6);
  const hairline = H(q ? [[2.05, -10.95], [1.95, -11.55], [1.72, -11.98], [.95, -12.12], [.1, -12.15], [-.8, -12.1], [-1.5, -11.95], [-1.82, -11.5], [-1.95, -10.95]]
                       : [[2.02, -10.95], [1.9, -11.55], [1.62, -11.98], [.8, -12.12], [0, -12.16], [-.8, -12.12], [-1.62, -11.98], [-1.9, -11.55], [-2.02, -10.95]]);
  piece(hairOuter.concat(hairline), CM.hair, { sw, key: 'cmhair', lift: 2 });
  for (let i = 0; i < 26; i++) { const a = Math.PI * (1.12 + hash(i + 3) * .76), r = .35 + .55 * hash(i + 17), px = hx + Math.cos(a) * 2.0 * r * 1.05, py = -12.55 + Math.sin(a) * .7 * r + .15; dline(S([[px - .07, py + .03], [px, py - .05], [px + .07, py + .03]]), sw * .45, CM.hairLt, .5); }
  // face
  rs('face');
  // in 3/4 the near eye is full width and the far one foreshortened, clear inside the silhouette
  const fx = hx + (q ? .55 : 0), eyeY = -10.85, ew = 1.05, eyes = q ? CM_QFACE.eyes.map(([ex, k]) => [hx + ex, k]) : [[-.85 + fx, 1], [.85 + fx, 1]];
  const look = [clamp(o.lookX || 0, -1, 1), clamp(o.lookY || 0, -1, 1)];
  eyes.forEach(([ex, k], i) => {
    const side = i ? 1 : -1;
    eyeH(ex * u, eyeY * u, ew * k * u, { ...F, style: blink ? 'shut' : F.style, look, skin: i === 1 && !q ? CM.skin : CM.skin, sw, side, key: 'cme' + i });
    brow(ex * u, (eyeY - .78) * u, ew * k * u, F.brow, side, CM.hair, sw);
  });
  // nose: broad and rounded, the tip and the nostril wings one soft shape, finely outlined round the wings and under the
  // tip and open over the top where the bridge runs in; in 3/4 the tip breaks the cheek line (it's in the head's outline)
  // and the near wing, a nostril and the bridge's shadow sit inside
  rs('nose');
  const nline = mixCol(CM.skinDk, NOIR.ink, .4), nhole = mixCol(CM.skinDk, NOIR.ink, .6), nlt = CM.skinLt;
  if (!q) {
    const nx = fx, NU = ellipseUnion([[nx, -10.02, .3, .27], [nx - .37, -9.9, .21, .18], [nx + .37, -9.9, .21, .18]], [nx, -9.96]);
    piece(S(ribbon([[nx + .06, -10.85], [nx + .12, -10.55], [nx + .2, -10.25]], .02, .12)), mixCol(CM.skin, CM.skinDk, .5), { ink: null, key: 'cmbridge', lift: 0, flatCard: true, edge: false, maxTone: .45 });
    piece(S(NU.map(p => [p[0], p[1]])), CM.skin, { ink: null, shade: CM.skinDk, depth: .14 * u, key: 'cmnose', lift: 1, flatCard: true, maxTone: .45 });
    dline(S(openRun(NU, a => { const d = ((a + Math.PI / 2) % TAU + TAU) % TAU; return d > TAU - .9 || d < .9; })), sw * .6, nline, .5);
    for (const sd of [-1, 1]) piece(oval((nx + sd * .19) * u, -9.8 * u, .09 * u, .05 * u, sd * .45, 12), nhole, { ink: null, key: 'cmnh' + sd, lift: 0, flatCard: true, edge: false });
    dline(S([[nx - .1, -10.95], [nx - .15, -10.5]]), sw * .5, nlt, .5);
    piece(oval((nx - .1) * u, -10.12 * u, .09 * u, .06 * u, -.5, 10), nlt, { ink: null, key: 'cmnhl', lift: 0, flatCard: true, edge: false });
  } else {
    const X = a => hx + a;
    piece(S(ribbon([[X(1.3), -10.72], [X(1.72), -10.42], [X(2.05), -10.18]], .04, .2)), mixCol(CM.skin, CM.skinDk, .5), { ink: null, key: 'cmbridge', lift: 0, flatCard: true, edge: false, maxTone: .45 });
    dline(S([[X(1.98), -10.2], [X(1.8), -10.08], [X(1.76), -9.92], [X(1.9), -9.8]]), sw * .6, nline, .5);   // the near wing's crease
    piece(oval(X(2.08) * u, -9.85 * u, .08 * u, .045 * u, -.4, 12), nhole, { ink: null, key: 'cmnh', lift: 0, flatCard: true, edge: false });
    piece(oval(X(2.2) * u, -10.14 * u, .08 * u, .05 * u, -.5, 10), nlt, { ink: null, key: 'cmnhl', lift: 0, flatCard: true, edge: false });
  }
  mouthH((hx + mq) * u, -9.08 * u, 1.3 * u, F.mouth, { sw, lip: CM.lip, lipLt: CM.lipLt, far: q ? .6 : 1, key: 'cmm' });
  if (o.blush) for (const bx of q ? [hx + .3] : [fx - 1.25, fx + 1.25]) paint(oval(bx * u, -9.9 * u, .38 * u, .18 * u, 0, 12), { wash: '#B0524A', washOp: 90 * clamp(o.blush), ink: null });
  if (o.gloom > .02) { piece(curvy(S([[-2.1 + hx, -11.1], [2.1 + hx, -11.1], [1.9 + hx, -12.3], [-1.9 + hx, -12.3]]), 3), NOIR.ink, { ink: null, op: 110 * o.gloom, key: 'cmgloom', lift: 0, flatCard: true }); for (let i = 0; i < 6; i++) { const gx = hx - 1.5 + i * .6; dline(S([[gx, -12.1], [gx, -11.3 + .3 * hash(i)]]), sw * .5, NOIR.ink); } }
  pop();

  // ---- arms in front of the body ----
  arm(-1, pose.L, true); arm(1, pose.R, true);
  XF = prevXF;
  pop();
  rs('emote'); if (o.emote) emote(o.emote, x + (o.flip ? -1 : 1) * 2.9 * u, y + dy - 14.2 * u * (1 - sq), u * .62, o.emoteK ?? 1, o.emoteAge ?? T);
  rs('after');
}

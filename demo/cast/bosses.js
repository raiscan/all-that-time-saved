// cast/bosses.js: four satirical caricatures of tech bosses (public personas only: what each is publicly known for).
//
//   dorsey(x, y, u, o)    Jack Dorsey. Lean and ascetic: a shaved egg of a head (or a black beanie), big ears, calm
//                         half-shut meditative eyes, a long straight nose with a ring in it, and the signature pushed
//                         hard: an enormous beard hanging to his belt, grey down the middle. All black, minimal.
//                         V1e (banknote): giant hedge shears through a paper chain of workers; then he rides the share
//                         price up like a surfer. C2c: at the bunker banquet.
//   altman(x, y, u, o)    Sam Altman. Slight and boyish under a big round head; short neat hair gone a bit messy at the
//                         front; the signature pushed: huge earnest eyes under brows tented in permanent sincere worry,
//                         a small anxious mouth. A plain slate jumper. V3d (rubber hose): a 1930s schoolmaster in gown
//                         and mortarboard setting homework; V3a: shouting "if we don't, China will" through a megaphone.
//                         In ink (BS_ALTMAN_HY, the user's pick): his own head and face with pie-cut eyes on a
//                         rubber-hose body (hose limbs, puffy gloves, big shoes, flat fills).
//   turnbull(x, y, u, o)  Matt Turnbull, "the Xbox bloke" (his public LinkedIn photo): fair ruddy skin, a short trimmed
//                         ginger beard on a square jaw, short light-brown hair off a high forehead, deep-set blue eyes,
//                         a long straight nose, and the relentless upbeat LinkedIn grin. A console-green hoodie and a
//                         lanyard (no logos, no text). V1g: on a laptop screen, cheerfully offering a chatbot as comfort.
//   dario(x, y, u, o)     Dario Amodei (V2c: "the checkout"). A round, boyish, earnest face with full cheeks and a soft
//                         jaw under a high forehead; the signature pushed: a big mop of tight dark curls, receding at the
//                         temples, a curly forelock; dark rounded-rectangle glasses; a big rounded nose; a faint shadow
//                         of stubble. A blue button-down shirt (o.hoodie: a grey zip hoodie over a navy tee). V2c: Clawd
//                         brings him a permission request; arms folded, he shakes his head once; bsDenied() pops.
//
// All four wear white gloves (tech bosses always do). (x, y) = the ground point between the feet; u = the commuter's
// unit (Dorsey ~14.7u tall, Altman ~12.6u, Turnbull ~13.6u, Dario ~14.3u). Like musk() and zuck():
//   view: 'front' | 'q' (3/4, facing right) · flip: true faces left · a feel()/emotions() spread (dy sq rot dx eyes
//   mouth lookX lookY squint blush emote emoteK emoteAge) · pose: a pose name (below) or bsPoses(t, keys) · tilt (head,
//   rad) · jaw 0..1 (extra jaw drop) · seated (no legs) · hold / holdL: (s) => draws a prop in the right / left hand (hand
//   space, as commuter(); R = the screen-right hand in the front view, the far hand in 3/4) · blink (force) · boilKey
//   · seed · noShadow · rim (rim-light colour, null = none)
//   layer: 'back' (all but the in-front arms) | 'front' (only the in-front arms, their props and the emote): draw a table
//   between the two calls (same boilKey) · 'head' (head, neck and collar only: portraits, screens, the laptop in V1g)
// Poses (hand targets; see BSD_POSE, BSA_POSE, BST_POSE, BSR_POSE); every boss also has 'table' (seated, hands on a table top):
//   dorsey:   idle point namaste shears (both hands on giant hedge shears; o.snip 0..1 opens the blades) ride (crouched,
//             surfing: the feet stand on a line of angle o.slope (rad, default -.3: rising to his front) through (x, y);
//             the beard streams back, o.wind 0..1) · o.beanie (a black beanie) · o.shears: false hides the shears
//   altman:   idle lecture (finger raised) point shrug megaphone (at his lips; o.megaphone: false hides it) · o.gown (a
//             black academic gown: the arms hang over it in its sleeves) · o.cap (a mortarboard with a swinging tassel)
//   turnbull: idle present (open palms) thumbs (both thumbs up) point offer (holding out a game controller in both hands;
//             o.pad: false hides it) · o.lanyard: false
//   dario:    idle fold (arms folded across the chest) headshake (folded, and one firm shake of the head: a small
//             anticipation, the swing, back past the middle, a settle; the eyes lead it) point present · o.hoodie
//             The shake: o.shake 0..1 (scrub it yourself), or o.shakeAt (a start time, s) with o.shakeDur (default .8 s);
//             otherwise the headshake pose repeats one every 1.6 s (model sheets). o.shake works in any pose.
// bsDenied(x, y, s, k): the red "denied" pop-up for V2c: a red rounded square with a white drawn cross (not a letter), s
// wide, centred at (x, y); k 0..1 pops it in with an overshoot, a little spin and a burst of rays (k >= 1: settled).
// Put it over Dario's head: bsAnchors('dario', ...).head, 6.6u up.
// bsPoses(t, keys, blend) blends between poses (keys [[t, name], ...]), like musk's mkPoses.
// bsAnchors(who, x, y, u, o) (who: 'dorsey' | 'altman' | 'turnbull' | 'dario') returns world points for composing
// (approximate: ignores o.rot and o.tilt; Dario's head follows his shake): head (the face's
// middle), mouth, R / L (wrists), tip (shears: the closed blades' point, plus tipA / tipB / pivot; megaphone: the bell;
// controller: its centre), feet [back, front] (on the ground, or on the ride line).
// Props for hold / holdL, drawn along the hand: bsShears(s, open), bsMegaphone(s), bsController(s).
// Model sheets (LOOPS): bosses, bossFaces, bossLooks, bossPoses (every pose, table layers, props, anchors as dots),
// bossActing (pose blends and emotions); ?look=ink|doodle|xerox|bank (render.mjs --query=look=ink) relooks all but bossLooks.

// ======================================================================================================================
// colours
// ======================================================================================================================
const BS_DC = {   // Dorsey
  skin: '#DDB59C', skinDk: '#B68C74', skinLt: '#F0D6C4', sock: '#C8A08A', line: '#8E6656', lip: '#B4706A', lipDk: '#8A4E4A',
  scalp: '#8E8078', beard: '#6E5949', beardDk: '#42342A', beardLt: '#9C8878', grey: '#C2BAB0', greyDk: '#948C82', brow: '#4A3A30',
  tee: '#25222A', teeDk: '#121015', teeLt: '#45404C', rim: '#B3A7A0',
  trousers: '#29262E', trousersDk: '#17151A', shoe: '#1B191E', sole: '#48444E', shoeLt: '#5E5964',
  beanie: '#25222A', beanieDk: '#111014', beanieLt: '#46414D',
  iris: '#6B5642', ring: '#D8DBE0', ringDk: '#80858E', teeth: '#F4EEE4', mouth: '#3A1418', tongue: '#C4566A',
  blade: '#CDD2D7', bladeDk: '#7E858D', bladeLt: '#F4F6F8', wood: '#A2723F', woodDk: '#6C4726', ferrule: '#5C6068',
};
const BS_AC = {   // Altman
  skin: '#E8C4A8', skinDk: '#C59D82', skinLt: '#F6DECB', line: '#9A7462', lip: '#BE7E70', lipLt: '#CC8E80', bag: '#CFA78E',
  hair: '#4E3A2C', hairDk: '#2E2219', hairLt: '#7E6450', hairGrey: '#8C837C', brow: '#3E2C22',
  jumper: '#6E7E92', jumperDk: '#4C5A6C', jumperLt: '#98A6B8', rib: '#5E6D80',
  jeans: '#3A465C', jeansDk: '#262F40', shoe: '#E6E2DA', sole: '#B8B1A6', shoeLt: '#FFFFFF', rim: '#B8B4B0',
  iris: '#6E8C5C', teeth: '#F4EEE4', mouth: '#3A1418',
  gown: '#211F26', gownDk: '#0F0E12', gownLt: '#403C47', facing: '#7A2638', cap: '#1D1B21', capLt: '#3E3A44', tassel: '#DDAA3A', tasselDk: '#9A6E1E',
  mega: '#EEE6D4', megaDk: '#B9AE9A', megaBand: '#C8453A', megaGrip: '#2F2C34', megaIn: '#3A3440',
};
const BS_TC = {   // Turnbull
  skin: '#EEC0A3', skinDk: '#CF9A80', skinLt: '#F9DAC8', line: '#A2705E', lip: '#C47A6A', lipLt: '#D49080', blush: '#E48676',
  hair: '#8E6844', hairDk: '#5E4329', hairLt: '#BA925E', brow: '#9C6C42',
  beard: '#A26E46', beardDk: '#744A2C', beardLt: '#CC9A6E',
  hoodie: '#2F8F3E', hoodieDk: '#1C672A', hoodieLt: '#62B46E', string: '#EEEBE3',
  strap: '#1E2B22', badge: '#F4F2EC', badgeDk: '#BEB9AE', clip: '#9DA3AB',
  jeans: '#3E4D66', jeansDk: '#29344A', shoe: '#F0EDE6', sole: '#C9C3B8', shoeLt: '#FFFFFF', rim: '#BCCABC',
  iris: '#5C86AA', teeth: '#F6F1E8', mouth: '#3A1418',
  pad: '#2D2C33', padDk: '#17161B', padLt: '#4E4C56',
};

// ======================================================================================================================
// shared helpers
// ======================================================================================================================
// A symmetric outline from its right half R (top → bottom, excluding the centre points top and bot).
const bsSym = (R, top, bot) => [[0, top], ...R, [0, bot], ...R.slice().reverse().map(([a, b]) => [-a, b])];
// A rounded bar from a to b (cuffs, straps, handles).
function bsBar(a, b, w0, w1 = w0) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), c = Math.cos(ang), s = Math.sin(ang), P = [];
  const at = (o, t, w) => [o[0] + Math.cos(t) * w / 2 * c - Math.sin(t) * w / 2 * s, o[1] + Math.cos(t) * w / 2 * s + Math.sin(t) * w / 2 * c];
  for (let i = 0; i <= 6; i++) P.push(at(a, Math.PI / 2 + i / 6 * Math.PI, w0));
  for (let i = 0; i <= 6; i++) P.push(at(b, -Math.PI / 2 + i / 6 * Math.PI, w1));
  return P;
}
const bsArc = (cx, cy, rx, ry, a0, a1, n = 12) => { const P = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); P.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return P; };
// Rim light along the lit side of a rubber-hose limb (ink only).
function bsRim(P, w0, w1, sw, col, from = .2, to = 1) {
  if (STYLE.card || !col || STYLE.mode !== 'ink') return;
  const C = through(P, 10), n = C.length, [lx, ly] = lightLocal(), runs = []; let cur = [];
  for (let i = Math.floor(n * from); i < Math.ceil(n * to); i++) {
    const a = C[Math.max(0, i - 1)], b = C[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
    let nx = -dy / d, ny = dx / d; if (nx * lx + ny * ly < 0) { nx = -nx; ny = -ny; }
    const f = nx * lx + ny * ly, w = lerp(w0, w1, i / (n - 1)) / 2 - sw * 1.6;
    if (f > .3) cur.push([C[i][0] + nx * w, C[i][1] + ny * w]); else if (cur.length) { runs.push(cur); cur = []; }
  }
  if (cur.length) runs.push(cur);
  for (const r of runs) if (r.length > 2) _inkLine(r, sw * .55, col, 'flashfine', 0);
}
// A cel shadow kept inside the shape (crescent() can poke out past a jutting chin or nose).
function bsShade(P, depth, col, key) {
  const C = crescent(P, STYLE.card ? depth * .8 : depth); if (!C) return;
  const n = C.length / 2, out = C.map((p, i) => i < n || inPoly(p[0], p[1], P) ? p : C[2 * n - 1 - i]);
  if (STYLE.card) paint(out, { wash: col, washOp: 120, ink: null }); else shadeRegion(out, col);
}
// An ear (px): centre (x, y), h tall, w wide, sd = its outer side (+1: the rim toward screen right).
function bsEar(K, x, y, h, w, sd, key, shade = true) {
  const { C, sw } = K, eh = h / 2;
  const E = curvy([[0, -eh], [sd * w * .95, -eh * .78], [sd * w * 1.05, -eh * .1], [sd * w * .72, eh * .55], [sd * w * .18, eh], [-sd * w * .38, eh * .8], [-sd * w * .5, eh * .15], [-sd * w * .5, -eh * .55]].map(([a, b]) => [x + a, y + b]), 5);
  piece(E, C.skin, { sw, shade: shade ? C.skinDk : null, depth: w * .3, key, lift: 2, maxTone: .45 });
  dline([[x - sd * w * .1, y - eh * .6], [x + sd * w * .58, y - eh * .48], [x + sd * w * .66, y + eh * .05], [x + sd * w * .28, y + eh * .45]], sw * .55, mixCol(C.skinDk, NOIR.ink, .25), .5);
  dline([[x + sd * w * .02, y - eh * .15], [x + sd * w * .2, y + eh * .08], [x + sd * w * .02, y + eh * .3]], sw * .45, C.skinDk, .5);
}
// A front-view nose (head units through HP): a bridge shadow down the side away from the light and a highlight down the
// lit side, then one soft shape (the tip and both wings merged), outlined round the wings and under the tip but open over
// the top where the bridge runs into it; nostrils; a highlight. N: { tw, th, wr, wx, wy, top (the bridge's root), holes }
function bsNoseF(K, HP, nx, ny, N) {
  const { C, u, sw, kk } = K;
  const nshade = mixCol(C.skin, C.skinDk, .55), nline = mixCol(C.skinDk, NOIR.ink, .4);
  piece(ribbon(HP([[nx + .05, N.top], [nx + N.tw * .42, lerp(N.top, ny, .62)], [nx + N.tw * .78, ny - N.th * .55]]), .04 * u, N.tw * .5 * u), nshade, { ink: null, key: kk('bridge'), lift: 0, flatCard: true, edge: false, maxTone: .45 });
  dline(HP([[nx - .05, lerp(N.top, ny, .2)], [nx - N.tw * .32, lerp(N.top, ny, .72)]]), sw * .5, C.skinLt, .5);
  const tipE = [nx, ny, N.tw, N.th], wings = [[nx - N.wx, ny + N.wy, N.wr, N.wr * .85], [nx + N.wx, ny + N.wy, N.wr, N.wr * .85]];
  const NU = ellipseUnion([tipE, ...wings], [nx, ny + N.wy * .5]);
  piece(HP(NU.map(p => [p[0], p[1]])), C.skin, { ink: null, shade: C.skinDk, depth: N.th * .5 * u, key: kk('nose'), lift: 1, flatCard: true, maxTone: .45 });
  const skip = a => { const d = ((a + Math.PI / 2) % TAU + TAU) % TAU; return d > TAU - .95 || d < .95; };
  const run = openRun(NU, skip); if (run.length > 2) dline(HP(run), sw * .62, nline, .5);
  if (N.holes) for (const sd of [-1, 1]) piece(oval(...HP([[nx + sd * N.wx * .52, ny + N.th * .78]])[0], N.wr * .42 * u, N.wr * .24 * u, sd * .45, 14), mixCol(C.skinDk, NOIR.ink, .55), { ink: null, key: kk('nh' + sd), lift: 0, flatCard: true, edge: false });
  piece(oval(...HP([[nx - N.tw * .35, ny - N.th * .4]])[0], N.tw * .28 * u, N.th * .2 * u, -.5, 12), C.skinLt, { ink: null, key: kk('nhl'), lift: 0, flatCard: true, edge: false });
}
// A 3/4 nose (head units, facing right), its own piece over the head: N.ridge runs from the root (between the eyes, just
// under the brow line, nearer the far eye) down past the far eye's inner corner and out to the top of the tip; the tip
// (N.tip, radii N.tr x N.th) sits about halfway from the eyes to the mouth and may break the cheek's silhouette; the near
// wing (N.wing, radius N.wr) and its nostril sit inside the face. The piece (skin) runs from the ridge back over the near
// side of the nose (N.nw wide at the wing), so where the far eye's inner corner reaches past the ridge it tucks in behind
// the bridge. One line draws the ridge on round the tip and under it (at the head outline's weight where it's out past
// the head, K.headP); the wing gets its crease. Returns the point under the near nostril (for a ring). N.shade 0..1 tones
// the bridge's turning side.
function bsNoseQ(K, HP, N) {
  const { C, u, sw, kk } = K, [tx, ty] = N.tip, tr = N.tr, th = N.th, [wx, wy] = N.wing, wr = N.wr;
  const nline = mixCol(C.skinDk, NOIR.ink, .45), nshade = mixCol(C.skin, C.skinDk, .5);
  // the ridge meets the tip tangentially: from its last point, along the tangent to the tip's far top
  const lp = N.ridge[N.ridge.length - 1], px0 = (lp[0] - tx) / tr, py0 = (lp[1] - ty) / th, dd = Math.hypot(px0, py0);
  // (N.bulb: it meets the tip where it points instead, and the tip swells up out of it: a bulb)
  const a0 = Math.atan2(py0, px0) + (N.bulb ? 0 : dd > 1.02 ? Math.acos(1 / dd) : .3), J = [tx + Math.cos(a0) * tr, ty + Math.sin(a0) * th];
  const R = through(N.ridge, 6).concat([[lerp(lp[0], J[0], .5), lerp(lp[1], J[1], .5)], J]), tipArc = bsArc(tx, ty, tr, th, a0, Math.PI * .72, 14).slice(1);
  const wingArc = bsArc(wx, wy, wr, wr * .9, Math.PI * .42, Math.PI * 1.3, 12);
  // the fill: the ridge, the tip, under it to the wing, round the wing and back up the nose's near side to the root
  const nw = N.nw ?? .3, n = R.length, back = R.slice(0, Math.floor(n * .8)).map(([a, b], i) => [a - lerp(.05, nw, Math.pow(i / (n - 1), .8)), b + lerp(.03, nw * .3, i / (n - 1))]).reverse();
  const fill = R.concat(tipArc, wingArc, back);
  K.knock(HP(fill));
  piece(HP(fill), C.skin, { ink: null, shade: C.skinDk, depth: th * .6 * u, key: kk('noseq'), lift: 1, flatCard: true, edge: false, maxTone: .45 });
  // the bridge's turning side: a soft tone just inside the ridge, fading out toward the root
  piece(ribbon(HP(R.slice(Math.floor(R.length * .2)).map(([a, b], i, A) => [a - lerp(.03, tr * .45, i / (A.length - 1)), b + lerp(.02, th * .25, i / (A.length - 1))])), .02 * u, tr * .7 * u), mixCol(C.skin, nshade, N.shade ?? .7), { ink: null, key: kk('bridge'), lift: 0, flatCard: true, edge: false, maxTone: .45 });
  // the line: ridge → round the tip → under it (heavier where it's the silhouette)
  const line = R.concat(tipArc.slice(0, -2)), P = HP(line);
  dline(P, sw * .8, nline, .4);
  if (!STYLE.card && K.headP) {
    let run = [];
    const flush = () => { if (run.length > 1) edgeLine(run, sw * (STYLE.mode === 'ink' ? .8 : 1.1), NOIR.ink, false); run = []; };   // (ink: lighter, or its caps blob)
    P.forEach(p => { if (!inPoly(p[0], p[1], K.headP)) run.push(p); else { if (run.length) run.push(p); flush(); } });
    flush();
  }
  // the near wing's crease and the nostril under the tip
  dline(HP(bsArc(wx, wy, wr, wr * .9, -Math.PI * .92, Math.PI * .4, 12)), sw * .55, nline, .5);
  const nh = [lerp(wx, tx, .55), ty + th * .72];
  piece(oval(...HP([nh])[0], wr * .45 * u, wr * .2 * u, -.2, 12), mixCol(C.skinDk, NOIR.ink, .6), { ink: null, key: kk('nhq'), lift: 0, flatCard: true, edge: false });
  piece(oval(...HP([[tx - tr * .25, ty - th * .45]])[0], tr * .28 * u, th * .18 * u, -.4, 12), C.skinLt || mixCol(C.skin, '#FFFFFF', .3), { ink: null, key: kk('nhlq'), lift: 0, flatCard: true, edge: false });
  return [wx, wy + wr * .55];
}

// An eye (px), built like style.js's eyeH (the same shape, iris, lash line and closed styles) but with its lids cut to
// the eye's own outline, grown just past its ink: eyeH's lids are big skin-coloured rectangles, which show over hair and
// sockets, and as patches in the print looks. The iris is tone-capped and the pupil prints solid on a banknote (hatched,
// small dark discs read as crosses). o: open lower slant look iris irisCol skin style side tall lash sw key, sx (3/4: the
// far eye squeezed across, iris and lids with it, as eyeH).
function bsEye(x, y, s, o = {}) {
  if (STYLE.card && typeof cardEye === 'function') o = cardEye(o);   // (card: a replacement eye from the chart, mouths.js)
  const st = o.style || 'open';
  if (st === 'happy' || st === 'shut' || st === 'squeeze') { eyeH(x, y, s, o); return; }
  const sw = o.sw ?? 1.4, skin = o.skin || '#E0B89C', sd = o.side || 1, k = o.key || 'bse', fx = o.sx ?? 1;
  const rx = s * .5, ry = s * .58 * (o.tall ?? 1), M = P => P.map(([a, b]) => [x + a * sd * fx, y + b]);
  const cy = t => -ry * .05 * (t + 1), up = t => cy(t) - ry * Math.pow(Math.max(0, 1 - t * t), .5), dn = t => cy(t) + ry * .84 * Math.pow(Math.max(0, 1 - t * t), .62);
  const ts = n => Array.from({ length: n + 1 }, (_, i) => -1 + 2 * i / n);
  const white = ts(18).map(t => [t * rx, up(t)]).concat(ts(18).reverse().slice(1, -1).map(t => [t * rx, dn(t)])), Wc = M(white);
  // (in ink the white's outline would show round the lids as a thin ring: its lower edge is drawn after them instead)
  piece(Wc, '#F4EEE4', { sw: sw * .7, ink: STYLE.card || STYLE.mode === 'ink' ? null : NOIR.ink, key: k + 'w', lift: 2, flatCard: true });
  const lk = o.look || [0, 0], ir = s * .3 * (o.iris ?? 1), ix = x + clamp(lk[0], -1, 1) * rx * .42 * fx, iy = y + clamp(lk[1], -1, 1) * ry * .3 + ry * .08;
  const inW = (P, col, key, lift, ex = {}) => { const Q = clipConvex(P, Wc); if (Q.length > 2) piece(Q, col, { ink: null, key, lift, flatCard: true, ...ex }); return Q; };
  inW(oval(ix, iy, ir * fx, ir * 1.05, 0, 24), o.irisCol || '#4A2A1C', k + 'i', 1, { maxTone: .5 });
  const pu = oval(ix, iy, ir * .55 * (o.pupil ?? 1) * fx, ir * .58 * (o.pupil ?? 1), 0, 18);
  if (STYLE.mode === 'bank') { const Q = clipConvex(pu, Wc); if (Q.length > 2) _paint(Q, { wash: BANK.ink, ink: null }); } else inW(pu, '#140C10', k + 'p', 0);
  inW(oval(ix - ir * .38 * fx, iy - ir * .42, ir * .3 * fx, ir * .3, 0, 12), '#FFFFFF', k + 'h', 0);
  inW(oval(ix + ir * .35 * fx, iy + ir * .38, ir * .13 * fx, ir * .13, 0, 8), '#FFFFFF', k + 'h2', 0);
  // lids: from the eye's own (grown) outline to the lid's edge
  const open = clamp(o.open ?? 1), low = clamp(o.lower ?? 0), sl = o.slant || 0, grow = 1 + sw * 1.1 / rx, growX = 1 + sw * 1.1 / (rx * fx), G = ([a, b]) => [a * growX, b * grow];   // (squeezed: grown as much across)
  const shut = t => clamp(1 - open + sl * .32 * -t - Math.abs(sl) * .06), lidE = t => lerp(up(t), dn(t), shut(t) * .96);
  const lowE = t => lerp(dn(t), up(t), low * .55 * Math.pow(Math.max(0, 1 - t * t), .3));
  const T2 = ts(20), lidOn = open < .98 || Math.abs(sl) > .02;
  if (lidOn) piece(M(T2.map(t => G([t * rx, up(t)])).concat(T2.slice().reverse().map(t => [t * rx * 1.02, lidE(t)]))), skin, { ink: null, key: k + 'lid', lift: 0, flatCard: true, edge: false, maxTone: .45 });
  if (low > .02) {
    piece(M(T2.map(t => G([t * rx, dn(t)])).concat(T2.slice().reverse().map(t => [t * rx * 1.02, lowE(t)]))), skin, { ink: null, key: k + 'low', lift: 0, flatCard: true, edge: false, maxTone: .45 });
    dline(M(ts(8).map(t => t * .82).map(t => [t * rx, lowE(t) + s * .015])), sw * .5, mixCol(skin, NOIR.ink, .5), .5);
  }
  if (STYLE.mode === 'ink' && low <= .02) dline(M(ts(12).map(t => [t * rx, dn(t)])), sw * .45, NOIR.ink, .5);
  const lash = ts(16).map(t => [t * rx * 1.02, (lidOn ? lidE(t) : up(t)) - s * .01]);
  lash.push([rx * 1.16, lash[lash.length - 1][1] - ry * .14]);
  dline(M(lash), sw * (o.lash ?? 1.3), NOIR.ink, .5);
}
// A deep-set eye's socket: a shadowed fold between the eye and the brow (drawn after eyeH, so the lid stays skin).
function bsSocket(K, x, y, s, side, tall = 1, sx = 1) {
  const { C, sw, kk } = K, rx = s * .5 * sx, ry = s * .58 * tall, top = [], bot = [];
  for (let i = 0; i <= 12; i++) { const t = -1 + i / 6, a = Math.max(0, 1 - t * t); top.push([x + side * t * rx * 1.08, y - ry * 1.12 - ry * .5 * Math.pow(a, .7) + ry * .08 * t]); bot.push([x + side * t * rx * 1.02, y - ry * 1.02 - ry * .12 * Math.pow(a, .6)]); }
  piece(top.concat(bot.reverse()), C.sock, { ink: null, key: kk('sock' + side), lift: 0, flatCard: true, edge: false, maxTone: .45 });
  dline(top.slice(2, -1), sw * .45, C.line, .5);
}
// A wavy edge: bumps (locks of hair) along an open path, bulging to its left (outward on a clockwise outline).
function bsWavy(P, n, amp, key = 0) {
  const C = through(P, 8), L = [0]; for (let i = 1; i < C.length; i++) L.push(L[i - 1] + Math.hypot(C[i][0] - C[i - 1][0], C[i][1] - C[i - 1][1]));
  const tot = L[L.length - 1] || 1;
  return C.map((p, i) => { const a = C[Math.max(0, i - 1)], b = C[Math.min(C.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, t = L[i] / tot;
    const k = amp * (.7 + .5 * hash(Math.floor(t * n) * 3.7 + key)) * Math.pow(Math.abs(Math.sin(Math.PI * t * n)), .8); return [p[0] + dy / d * k, p[1] - dx / d * k]; });
}

// ======================================================================================================================
// the shared rig
// ======================================================================================================================
// Blend between poses over time: keys [[t, name], ...]; returns a pose for o.pose (a name, or { mix } while blending).
function bsPoses(t, keys, blend = .3) {
  let i = 0; while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
  if (i === 0 || t >= keys[i][0] + blend) return keys[i][1];
  return { mix: [keys[i - 1][1], keys[i][1], backOut(seg(t, keys[i][0], keys[i][0] + blend))] };
}
// A pose, resolved for a boss: { L, R: { tip, bend, hp, front, ang, elbow }, crouch, rig, prop }.
// Table entries: { L, R: [x, y, bend, hand pose, front, hand angle (rad, optional)], crouch 0..1, rig } in body units,
// x for the front view (3/4 shifts it by the boss's qx). front: 0 behind the body, 1 over it, 2 the arm behind and the
// hand over it (reaching round the body). A rig (shears, mega, pad) places the hands on its prop.
function bsSpec(B, p, o, q) {
  if (p && p.mix) { const [a, b, k] = p.mix; return bsLerpSpec(bsSpec(B, a, o, q), bsSpec(B, b, o, q), k); }
  const P = (p && typeof p === 'object') ? p : B.POSE[p || 'idle'] || B.POSE.idle;
  const out = { crouch: P.crouch || 0, rig: P.rig || null, prop: null, shake: !!P.shake };
  for (const side of ['L', 'R']) { const a = P[side]; out[side] = { tip: [a[0] + (q ? B.qx : 0), a[1]], bend: a[2], hp: a[3], front: a[4] || 0, ang: a[5] ?? null, elbow: null }; }
  if (P.rig && B.rig) B.rig(out, P.rig, o, q);
  return out;
}
function bsLerpSpec(A, B2, k) {
  const out = { crouch: lerp(A.crouch, B2.crouch, k), rig: k < .5 ? A.rig : B2.rig, prop: k < .5 ? A.prop : B2.prop, shake: k < .5 ? A.shake : B2.shake };
  for (const s of ['L', 'R']) {
    const a = A[s], b = B2[s];
    out[s] = { tip: [lerp(a.tip[0], b.tip[0], k), lerp(a.tip[1], b.tip[1], k)], bend: lerp(a.bend, b.bend, k), hp: k < .5 ? a.hp : b.hp, front: k < .5 ? a.front : b.front,
      ang: a.ang != null && b.ang != null ? lerp(a.ang, b.ang, k) : (k < .5 ? a.ang : b.ang), elbow: a.elbow && b.elbow ? [lerp(a.elbow[0], b.elbow[0], k), lerp(a.elbow[1], b.elbow[1], k)] : null };
  }
  return out;
}
// The figure's geometry in body units (arms, crouch): shared by the drawing and bsAnchors.
function bsGeo(B, o) {
  const q = o.view === 'q', P = bsSpec(B, o.pose, o, q), drop = P.crouch * (B.crouchDrop || 1.6), cx0 = q ? B.qx : 0, arms = {};
  for (const s of [-1, 1]) {
    const a = s < 0 ? P.L : P.R;
    if (a.front === 0 && B.armsFront && B.armsFront(o) && !(q && s > 0)) a.front = 1;   // (e.g. a gown's sleeves hang over it)
    const root0 = B.root(q, s, a.front === 1), r = [root0[0], root0[1] + drop], tip = [a.tip[0], a.tip[1] + drop];
    const dx = tip[0] - r[0], dy = tip[1] - r[1], L = Math.hypot(dx, dy) || 1;
    const sd = bendSide(-dy / L, dx / L, s, .3), nx = -dy / L * sd, ny = dx / L * sd;   // (out and down, swinging through straight: core.js bendSide)
    const bend = a.bend + (B.bendAdd ? B.bendAdd(a) : 0);   // (bendAdd: a figure's own extra bow, e.g. the rubber-hose Altman's raised arms clearing his big head)
    const mid = a.elbow ? [a.elbow[0], a.elbow[1] + drop] : [r[0] + dx * .5 + nx * L * bend, r[1] + dy * .5 + ny * L * bend];
    const Cc = through([r, mid, tip], 10), e = Cc[Cc.length - 1], p2 = Cc[Cc.length - 2];
    arms[s] = { root: r, mid, tip, end: Math.atan2(e[1] - p2[1], e[0] - p2[0]), ang: a.ang ?? Math.atan2(e[1] - p2[1], e[0] - p2[0]), hp: a.hp, front: a.front, far: q && s > 0 };
  }
  return { q, P, drop, cx0, arms, sides: q ? [1, -1] : [-1, 1], stance: P.rig === 'ride' ? (q ? 2.1 : 1.6) : 0 };
}
// The body-unit → world transform of a figure (ignores o.rot and the card nudge).
function bsWorld(B, x, y, u, o) {
  u *= B.S; const sq = cardSq(((o.sq || 0) + (o.take || 0)) * .5) + (o.boilKey != null ? bsLife(B, o, o.boilKey).sq : 0), fl = o.flip ? -1 : 1, dy = (o.dy || 0) * 1.1 * u;
  return ([a, b]) => [x + (o.dx || 0) * u + fl * (1 + sq * .5) * a * u, y + dy + (1 - sq) * b * u];
}

// A boss's idle life (clawd.js lifeOf: breathing, weight shifts, head turns, blinks; not the beat). Breathing is a slight
// stretch about the feet (the shoulders rise by life.breath); the lean and the head's tilt ride on o.rot and o.tilt.
function bsLife(B, o, id) {
  const L = lifeOf(o, 'bs' + B.id + id + '|' + (o.seed || 0)), riding = bsGeo(B, o).P.rig === 'ride';
  return { ...L, sq: -L.breath / (Math.abs(B.shY) || 8) * (o.seated ? .8 : 1), lean: riding ? 0 : L.lean * (o.seated ? .4 : 1) };
}
function bsFigure(B, x, y, u, o0 = {}) {
  u *= B.S;
  const id = o0.boilKey ?? ++CLAWD_N, rs = p => boilSeed(`bs ${B.id} ${id} ${p}`), S = P => U(P, u), kk = s => (B.key || B.id[0]) + 'b' + id + s;
  const life = bsLife(B, o0, id), o = { ...o0, rot: (o0.rot || 0) + life.lean, tilt: (o0.tilt || 0) + life.tilt };
  const q = o.view === 'q', sq = cardSq(((o.sq || 0) + (o.take || 0)) * .5) + life.sq, sw = clamp(u / 20, .55, 2.2), lift = u * .12;
  const layer = o.layer || 'all', bust = layer === 'head', bodyOn = layer === 'all' || layer === 'back', headOn = layer !== 'front', frontOn = layer === 'all' || layer === 'front';
  const rim = o.rim === undefined ? B.C.rim : o.rim, tm = mt(T), seed = o.seed || 0;
  const F = B.face(o), blink = o.blink ?? ((!F.style || F.style === 'open') && life.blink);
  const G = bsGeo(B, o), ride = G.P.rig === 'ride';
  x += (o.dx || 0) * u;
  const dy = ride ? 0 : (o.dy || 0) * 1.1 * u;   // riding, the feet stay on the line
  if (bodyOn && !o.seated && !o.noShadow && G.P.rig !== 'ride') { rs('shadow'); paint(oval(x + (q ? .3 * u : 0), y + .1 * u, B.shadowW * u, .42 * u, 0, 24), { wash: NOIR.ink, washOp: STYLE.card ? 110 : 150, ink: null }); }
  push(); translate(x, y + dy); nudge('bs' + B.id + id, 1); if (o.rot) rotate(o.rot); scale((o.flip ? -1 : 1) * (1 + sq * .5), 1 - sq);
  const prevXF = XF; XF = o.flip ? -XF : XF;
  const K = { B, C: B.C, F, u, S, q, sw, lift, rs, kk, o, blink, tm, G, rim, bust,
    knock: P => { if (STYLE.mode === 'doodle') _paint(P, { wash: '#FBF8F0', ink: null }); } };
  if (bodyOn) {
    if (B.behind) { rs('behind'); B.behind(K); }
    for (const s of G.sides) bsArm(K, s, 'back');
    if (!o.seated) bsLegs(K);
    rs('torso'); B.torso(K);
  }
  if (headOn) B.head(K);
  if (frontOn) {
    for (const s of G.sides) bsArm(K, s, 'limb');
    if (B.twoHand) { rs('prop'); B.twoHand(K); }
    for (const s of G.sides) bsArm(K, s, 'hand');
  }
  XF = prevXF;
  pop();
  if (layer !== 'back') { rs('emote'); if (o.emote) emote(o.emote, x + (o.flip ? -1 : 1) * 3.0 * u, y + dy + (B.top - .6 + G.drop) * u * (1 - sq), u * .62, o.emoteK ?? 1, o.emoteAge ?? T); }
  rs('after');
}
// One arm: pass 'back' (arms behind the body, and the limbs of reaching arms), 'limb' (in-front limbs), 'hand' (in-front hands).
function bsArm(K, s, pass) {
  const { B, G, S, u, sw, rs, kk, o, rim } = K, a = G.arms[s];
  const limbOn = pass === 'back' ? a.front !== 1 : pass === 'limb' && a.front === 1;
  const handOn = pass === 'back' ? a.front === 0 : pass === 'hand' && a.front !== 0;
  if (limbOn) {
    rs('arm' + s);
    const [col0, dk] = B.sleeve(K), far = a.far && a.front !== 1, col = far ? mixCol(col0, dk, .45) : col0, P = S([a.root, a.mid, a.tip]);
    limb(P, B.armW[0] * u, B.armW[1] * u, col, { sw, shade: dk, key: kk('arm' + s), ...(B.limbO && B.limbO(K, 'arm')) });   // (limbO: a figure's own limb options, e.g. the rubber-hose Altman's)
    if (!far) bsRim(P, B.armW[0] * u, B.armW[1] * u, sw, rim);
    if (B.cuff) B.cuff(K, s, a, far);
  }
  if (handOn && a.hp !== 'none') {
    rs('hand' + s);
    hand(a.tip[0] * u, a.tip[1] * u, a.ang, B.hand * u, { pose: a.hp, glove: true, sw, mirror: s < 0, key: kk('h' + s), hold: s > 0 ? o.hold : o.holdL });
  }
}
// Legs and shoes (far leg first). Crouched: knees out (front) or forward (3/4); ride: the feet stand on a line of angle
// o.slope through the ground point.
function bsLegs(K) {
  const { B, G, S, u, sw, rs, kk, o, q, rim } = K, L = B.legs, cr = G.P.crouch || 0, ride = G.P.rig === 'ride', sl = ride ? (o.slope ?? -.3) : 0;
  const [lc, ldk] = B.trousers(K);
  for (const s of G.sides) {
    rs('leg' + s);
    const far = q && s > 0, hip = [s * L.gap * (q ? .8 : 1) + G.cx0, L.hip + G.drop];
    let ank;
    if (ride) { const d = s * G.stance + (q ? G.cx0 : 0); ank = [d * Math.cos(sl) + Math.sin(sl) * L.ank, d * Math.sin(sl) - Math.cos(sl) * L.ank]; }
    else ank = [s * (L.gap + L.stance) * (q ? .8 : 1) + G.cx0 + (q ? .25 : 0), -L.ank];
    const knee = [lerp(hip[0], ank[0], .5) + (q ? cr * 1.15 + .05 : s * (.06 + cr * .95)), lerp(hip[1], ank[1], .5) - cr * .25];
    const P = S([hip, knee, ank]);
    limb(P, L.w0 * u, L.w1 * u, far ? ldk : lc, { sw, shade: ldk, key: kk('leg' + s), ...(B.limbO && B.limbO(K, 'leg')) });
    if (!far && B.legRim) bsRim(P, L.w0 * u, L.w1 * u, sw * .8, rim && mixCol(rim, lc, .45), .15, .75);
    bsShoe(K, ank, s, far, sl);
  }
}
function bsShoe(K, ank, s, far, ang = 0) {
  const { B, C, S, u, sw, kk, q, lift, rim } = K;
  push(); translate(ank[0] * u, ank[1] * u); rotate(ang); scale(q ? 1 : s, 1);
  const col = far ? mixCol(C.shoe, NOIR.ink, .15) : C.shoe;
  if (inkFigOn()) {   // the ink look: the rubber-hose shoe, a big round toe and a sole line (style.js inkWrapRigs)
    piece(curvy(S([[-.75, -.5], [.2, -.64], [1.05, -.52], [1.52, -.12], [1.5, .3], [1.22, .44], [-.82, .44], [-.96, 0]]), 5), col, { sw, shade: NOIR.ink, depth: .2 * u, rim, key: kk('shoe' + s), lift });
    dline(S([[-.86, .24], [.3, .28], [1.4, .2]]), sw, lum(col) < .35 ? mixCol(col, '#FFFFFF', .4) : NOIR.ink, .5);
    pop(); return;
  }
  if (B.shoeKind === 'boot') {   // plain black boots
    piece(curvy(S([[-.62, -.72], [.28, -.74], [.4, -.3], [1.02, -.16], [1.3, .12], [1.14, .36], [-.78, .36], [-.8, -.1]]), 5), col, { sw, shade: NOIR.ink, depth: .2 * u, rim, key: kk('shoe' + s), lift });
    piece(curvy(S([[-.84, .2], [1.28, .16], [1.16, .46], [-.78, .48]]), 3), C.sole, { sw: sw * .8, key: kk('sole' + s), lift: 2 });
    dline(S([[.4, -.22], [.95, -.06]]), sw * .5, C.shoeLt, .5);
  } else {   // trainers
    piece(curvy(S([[-.8, -.36], [.25, -.46], [1.05, -.12], [1.22, .26], [1.04, .44], [-.9, .44], [-1.02, .1]]), 5), col, { sw, shade: mixCol(col, NOIR.ink, .3), depth: .22 * u, key: kk('shoe' + s), lift });
    piece(curvy(S([[-1.0, .28], [1.18, .24], [1.06, .58], [-.92, .6]]), 3), C.sole, { sw: sw * .8, key: kk('sole' + s), lift: 2 });
    dline(S([[-.62, .08], [-.1, -.08], [.45, .12]]), sw * .9, mixCol(col, NOIR.ink, .35), .5);
    dline(S([[-.12, -.36], [.45, -.2]]), sw * .6, mixCol(col, NOIR.ink, .3), .5);
  }
  pop();
}
// Eyes and brows for a boss: e = [[x, width, side], ...] in head units (near eye first in 3/4); F from B.face. In 3/4 the
// far eye (width < .85 w0) is drawn as the near eye's own eye, a touch smaller (further away) and squeezed across to its
// width (bsEye's sx), so it keeps its height and both gazes stay parallel; its brow is squeezed the same way.
// o2.extra(px, py, s, side, foreshort, sx) draws per-eye details (s = the eye's full width, sx its squeeze).
function bsEyes(K, HP, eyeY, E, Fe, o2 = {}) {
  const { C, u, sw, kk, o, blink } = K, look = [clamp(o.lookX || 0, -1, 1), clamp(o.lookY || 0, -1, 1)], wN = E[0][1];
  for (const [ex, w, side] of E) {
    const foreshort = w < o2.w0 * .85, full = foreshort ? wN * (o2.farK ?? .9) : w, sx = foreshort ? w / full : 1;
    const [px, py] = HP([[ex, eyeY]])[0], s = full * u;
    bsEye(px, py, s, { ...Fe, style: blink ? 'shut' : Fe.style, look, skin: C.skin, sw, side, sx, tall: (Fe.tall ?? 1) * (o2.tall ?? 1), iris: (Fe.iris ?? 1) * (o2.iris ?? 1), irisCol: C.iris, lash: o2.lash ?? 1.2, key: kk('e' + side) });
    if (o2.extra) o2.extra(px, py, s, side, foreshort, sx);
    const br = Fe.brow || [0, 0], b0 = o2.brow0 || [0, 0];
    const drawBrow = () => bsBrow(px + side * s * sx * (o2.browDx ?? 0), py - (o2.browY ?? .62) * u, s * (o2.browW ?? 1.05), [br[0] + b0[0], br[1] + b0[1]], side, C.brow, sw, o2.browT ?? 1, kk('br' + side), foreshort ? Math.min(1, sx * 1.1) : 1);
    if (o2.lateBrows) o2.lateBrows.push(drawBrow); else drawBrow();   // (late: over glasses)
  }
}
// A brow like style.js's brow() (a smooth tapered stroke, arched; angry presses the inner end in, sad tents it), with a
// thickness factor.
function bsBrow(x, y, s, raise, side, col, sw, thick, key, sx = 1) {
  const [ri, ro] = raise, tilt = ro - ri, arch = s * (.15 - .05 * clamp(Math.abs(tilt) / .7));
  const at = t => { const X = x + side * s * sx * lerp(-.5, .58, t), R = lerp(ri, ro, t) * s, A = arch * Math.sin(Math.PI * Math.pow(t, .8));
    const press = ri < 0 ? -ri * s * .22 * Math.pow(1 - t, 3) : 0, tent = ri > ro ? (ri - ro) * s * .18 * Math.sin(Math.PI * Math.min(1, t * 1.6)) : 0;
    return [X, y - R - A + press - tent + s * .02 * t]; };
  browPiece(browShape([0, .22, .48, .74, 1].map(at), s * .24 * thick, s * .028 * thick), col, sw, key);
}
// A mouth drawn by mouthH at (x, y) head units (keeps its key per boss).
function bsMouthH(K, HP, mx, my, w, kind, far) {
  const { C, u, sw, kk } = K, [px, py] = HP([[mx, my]])[0];
  mouthH(px, py, w * u, kind, { sw, lipLt: C.lipLt, far, key: kk('m') });
}
// A laugh's jaw drop (head units) between lo and hi: in card two held jaws on twos (mouths.js lipLaugh), else a bounce.
const bsLaughJaw = (tm, lo, hi) => typeof lipLaugh === 'function' ? lipLaugh(tm, lo, hi) : lo + (hi - lo) * Math.abs(Math.sin(tm * TAU * 2.5));

// ======================================================================================================================
// props (hand space: drawn around the grip, pointing along +x; s ≈ the hand's size)
// ======================================================================================================================
// Giant hedge shears, drawn from the pivot Pv (px) with the axis at angle a, opened by th (rad), handles Lh and blades Lb
// long (px); each half is one straight piece through the pivot (upper grip → lower blade), so opening the grips spreads
// the blades. Wood handles with a steel ferrule, long bevelled blades, a bolt.
function bsShearsDraw(Pv, a, th, Lh, Lb, sc, sw, key, C = BS_DC) {
  for (const [sg, k] of [[-1, 'B'], [1, 'A']]) {   // B (lower grip, upper blade) behind A
    const ha = a + Math.PI + sg * th / 2, ba = a + sg * th / 2, d = [Math.cos(ha), Math.sin(ha)], e = [Math.cos(ba), Math.sin(ba)];
    const at = (dd, v) => [Pv[0] + dd[0] * v * sc, Pv[1] + dd[1] * v * sc];
    const nx = -e[1], ny = e[0], inner = -sg;   // the cutting edge faces the other blade
    const B = []; for (let i = 0; i <= 10; i++) { const t = i / 10, L = lerp(-.25, Lb, t), w = .52 * Math.pow(1 - t, .75) * (t < .08 ? .9 : 1), back = -inner * w * (1 + .25 * Math.sin(Math.PI * t)); B.push([Pv[0] + (e[0] * L + nx * back) * sc, Pv[1] + (e[1] * L + ny * back) * sc]); }
    for (let i = 10; i >= 0; i--) { const t = i / 10, L = lerp(-.25, Lb, t), w = .1 * (1 - t); B.push([Pv[0] + (e[0] * L + nx * inner * w) * sc, Pv[1] + (e[1] * L + ny * inner * w) * sc]); }
    piece(B, C.blade, { sw, shade: C.bladeDk, depth: .16 * sc, key: key + 'bl' + k, lift: 3 });
    dline([at(e, .5).map((v, j) => v + [nx, ny][j] * -inner * .2 * sc), at(e, Lb * .8).map((v, j) => v + [nx, ny][j] * -inner * .08 * sc)], sw * .5, C.bladeLt, .3);   // the bevel's glint
    piece(bsBar(at(d, .35), at(d, 1.05), .46 * sc, .4 * sc), C.ferrule, { sw, key: key + 'fe' + k, lift: 3 });
    piece(bsBar(at(d, 1.0), at(d, Lh), .4 * sc, .46 * sc), C.wood, { sw, shade: C.woodDk, depth: .1 * sc, key: key + 'wd' + k, lift: 3 });
    dline([at(d, 1.3).map((v, j) => v + [-d[1], d[0]][j] * -.08 * sc), at(d, Lh - .3).map((v, j) => v + [-d[1], d[0]][j] * -.1 * sc)], sw * .45, C.woodDk, .3);
  }
  piece(oval(Pv[0], Pv[1], .2 * sc, .2 * sc, 0, 14), C.ferrule, { sw: sw * .7, key: key + 'bolt', lift: 2, flatCard: true });
  piece(oval(Pv[0] - .05 * sc, Pv[1] - .05 * sc, .07 * sc, .07 * sc, 0, 8), C.bladeLt, { ink: null, key: key + 'boltl', lift: 0, flatCard: true });
}
// The shears as a one-handed hold prop: the grip of one handle in the fist, the shears pointing along +x. open 0..1.
function bsShears(s, open = 0, key = 'bshears') {
  const sc = s * .8, th = lerp(.06, .72, clamp(open)), Lh = 2.4, sw = clamp(s / 22, .5, 2);
  bsShearsDraw([(Lh - .3) * sc, 0], -th / 2, th, Lh, 3.3, sc, sw, key);   // (the handle's end pokes out of the fist)
}
// A megaphone (px): the mouthpiece at P0, the bell along angle a; sc = px per unit. A cream horn with a red band, a dark
// pistol grip underneath. Returns the grip point and the bell's centre.
function bsMegaDraw(P0, a, sc, sw, key, C = BS_AC, drawGrip = true) {
  push(); translate(P0[0], P0[1]); rotate(a);
  const S2 = P => U(P, sc);
  if (drawGrip) {
    piece(curvy(S2([[.6, .3], [1.05, .3], [1.12, 1.35], [.95, 1.5], [.72, 1.42], [.66, .6]]), 3), C.megaGrip, { sw, key: key + 'grip', lift: 3 });
    dline(S2([[1.12, .62], [1.32, .72], [1.25, .95]]), sw * .8, C.megaGrip, .4);   // the trigger guard
  }
  piece(curvy(S2([[-.05, -.22], [.5, -.26], [.5, .26], [-.05, .22]]), 2), C.megaGrip, { sw, key: key + 'mp', lift: 3 });
  piece(curvy(S2([[.45, -.4], [1.15, -.42], [1.15, .42], [.45, .4]]), 2), C.mega, { sw, shade: C.megaDk, depth: .12 * sc, key: key + 'body', lift: 3 });
  const horn = [[1.1, -.38], [2.0, -.72], [3.05, -1.3], [3.2, -1.2], [3.25, 0], [3.2, 1.2], [3.05, 1.3], [2.0, .72], [1.1, .38]];
  piece(curvy(S2(horn), 4), C.mega, { sw, shade: C.megaDk, depth: .35 * sc, key: key + 'horn', lift: 3 });
  piece(curvy(S2([[1.75, -.62], [2.15, -.8], [2.15, .8], [1.75, .62]]), 2), C.megaBand, { sw: sw * .7, key: key + 'band', lift: 1, flatCard: true });
  piece(oval(3.12 * sc, 0, .32 * sc, 1.28 * sc, 0, 28), C.megaDk, { sw, key: key + 'rim', lift: 2 });
  piece(oval(3.16 * sc, 0, .22 * sc, 1.1 * sc, 0, 24), C.megaIn, { ink: null, key: key + 'mouth', lift: 0, flatCard: true });
  pop();
  const R = ([x, yy]) => [P0[0] + (x * Math.cos(a) - yy * Math.sin(a)) * sc, P0[1] + (x * Math.sin(a) + yy * Math.cos(a)) * sc];
  return { grip: R([.88, .95]), bell: R([3.2, 0]) };
}
// The megaphone as a hold prop: the grip in the fist, the bell pointing along +x (hand angle ≈ the direction to shout).
function bsMegaphone(s, key = 'bsmega') { const sc = s * .7; bsMegaDraw([-.88 * sc, -.95 * sc], 0, sc, clamp(s / 22, .5, 2), key); }
// A game controller seen face on (px): centre c, angle a, sc = px per unit. Two grips, two sticks, a d-pad, four face
// buttons (plain colours, no letters), a plain round centre button (no logo).
function bsPadDraw(c, a, sc, sw, key, C = BS_TC) {
  push(); translate(c[0], c[1]); rotate(a);
  const S2 = P => U(P, sc);
  const body = [[-1.35, -.55], [-.6, -.72], [0, -.6], [.6, -.72], [1.35, -.55], [1.62, -.1], [1.72, .5], [1.55, .9], [1.25, .95], [.9, .5], [.4, .35], [-.4, .35], [-.9, .5], [-1.25, .95], [-1.55, .9], [-1.72, .5], [-1.62, -.1]];
  piece(curvy(S2(body), 5), C.pad, { sw, shade: C.padDk, depth: .2 * sc, rim: C.padLt, key: key + 'body', lift: 3 });
  for (const [x, yy] of [[-.95, -.18], [.45, .12]]) { piece(oval(x * sc, yy * sc, .3 * sc, .3 * sc, 0, 16), C.padDk, { sw: sw * .6, key: key + 'st' + x, lift: 1, flatCard: true }); piece(oval(x * sc - .05 * sc, yy * sc - .05 * sc, .18 * sc, .18 * sc, 0, 12), C.padLt, { ink: null, key: key + 'sh' + x, lift: 0, flatCard: true }); }
  piece(S2([[-.62, .02], [-.5, .02], [-.5, .14], [-.38, .14], [-.38, .26], [-.5, .26], [-.5, .38], [-.62, .38], [-.62, .26], [-.74, .26], [-.74, .14], [-.62, .14]]), C.padDk, { sw: sw * .5, key: key + 'dpad', lift: 1, flatCard: true });
  [[1.0, -.42, '#3FAE4A'], [1.22, -.2, '#D8434A'], [.78, -.2, '#3E7FD0'], [1.0, .02, '#E8C03A']].forEach(([x, yy, col], i) => piece(oval(x * sc, yy * sc, .11 * sc, .11 * sc, 0, 12), col, { sw: sw * .45, key: key + 'b' + i, lift: 1, flatCard: true }));
  piece(oval(0, -.3 * sc, .16 * sc, .16 * sc, 0, 14), C.padLt, { sw: sw * .5, key: key + 'guide', lift: 1, flatCard: true });
  pop();
  const R = ([x, yy]) => [c[0] + (x * Math.cos(a) - yy * Math.sin(a)) * sc, c[1] + (x * Math.sin(a) + yy * Math.cos(a)) * sc];
  return { L: R([-1.35, .55]), R: R([1.35, .55]) };
}
// The controller as a one-handed hold prop (held by its right grip).
function bsController(s, key = 'bspad') { const sc = s * .55; bsPadDraw([-1.2 * sc, -.4 * sc], 0, sc, clamp(s / 22, .5, 2), key); }

// ======================================================================================================================
// JACK DORSEY
// ======================================================================================================================
const BSD_POSE = {
  idle:    { L: [-2.5, -5.0, .08, 'relax'], R: [2.5, -5.0, .08, 'relax'] },
  point:   { L: [-2.5, -5.0, .08, 'relax'], R: [5.0, -8.8, .05, 'point', 1, -.1] },
  namaste: { L: [-.28, -7.1, .55, 'open', 1, -1.35], R: [.28, -7.1, .55, 'open', 1, -1.79] },
  shears:  { rig: 'shears', L: [0, 0, .2, 'fist', 1], R: [0, 0, .2, 'fist', 1] },
  ride:    { crouch: 1, rig: 'ride', L: [-3.9, -6.9, .22, 'open', 0, Math.PI + .5], R: [3.9, -8.9, .2, 'open', 1, -.5] },
  table:   { L: [-2.0, -5.75, .35, 'relax', 1, .15], R: [2.0, -5.75, .35, 'relax', 1, Math.PI - .15] },   // hands on a table top at y - 5.4u (sitting)
};
// Head (units from the chin, up negative). Front: a long egg of a skull, gaunt below the cheekbones.
const BSD_HEAD_R = [[.95, -6.16], [1.55, -5.72], [1.88, -5.02], [1.98, -4.2], [1.97, -3.5], [1.86, -2.85], [1.66, -2.25], [1.56, -1.65], [1.46, -1.0], [1.12, -.42], [.6, -.07]];
// 3/4: the far side is the profile (brow ridge, the eye socket, the cheek, under it the beard takes over; the nose is its
// own piece over it, bsNoseQ); the near side runs from the back of the skull down behind the ear to the jaw.
const BSD_HEAD_Q = [[.15, -6.3], [1.25, -6.18], [1.95, -5.72], [2.25, -5.0], [2.34, -4.35], [2.28, -3.98], [2.22, -3.66], [2.3, -3.1], [2.36, -2.5], [2.38, -1.9],
  [2.36, -1.4], [2.3, -.8], [2.02, -.22], [1.4, .04], [.35, -.18], [-.75, -.85], [-1.38, -1.85], [-1.72, -3.0], [-1.92, -4.2], [-1.74, -5.3], [-1.0, -6.02]];
function bsdFace(o) {
  const F = faceOf(o);
  if (F.style === 'happy') Object.assign(F, { style: 'open', open: .42, lower: .38 });   // a serene smile: the lids stay low
  else if (!F.style || F.style === 'open') { const wide = (F.open ?? .92) >= 1; F.open = wide ? 1 : (F.open ?? .92) * .52; F.tall = (F.tall ?? 1) * (wide ? 1.05 : .95); }
  return F;
}
function bsdRig(out, rig, o, q) {
  if (rig !== 'shears') return;
  const th = lerp(.06, .74, clamp(o.snip ?? .5)), a = q ? -.1 : -.16, Pv = q ? [4.35, -6.5] : [2.75, -6.35], Lh = 2.5, Lb = 3.3, hs = BS_DORSEY.hand;
  out.prop = { kind: 'shears', Pv, a, th, Lh, Lb };
  const grip = sg => { const ha = a + Math.PI + sg * th / 2, g = [Pv[0] + Math.cos(ha) * (Lh - .3), Pv[1] + Math.sin(ha) * (Lh - .3)], ang = a + sg * th / 2 + Math.PI / 2 * .75;
    return { tip: [g[0] - Math.cos(ang) * .82 * hs, g[1] - Math.sin(ang) * .82 * hs], ang }; };
  const A = grip(1), B = grip(-1);   // A: the upper handle; B: the lower
  Object.assign(out.R, { tip: A.tip, ang: A.ang, hp: 'fist', front: q ? 2 : 1, bend: .12 });
  Object.assign(out.L, { tip: B.tip, ang: B.ang, hp: 'fist', front: 1, bend: q ? -.1 : .1 });
}
function bsdTwoHand(K) {
  const p = K.G.P.prop; if (!p || p.kind !== 'shears' || K.o.shears === false) return;
  bsShearsDraw(K.S([[p.Pv[0], p.Pv[1] + K.G.drop]])[0], p.a, p.th, p.Lh, p.Lb, K.u, K.sw, K.kk('shears'), K.C);
}
function bsdTorso(K) {
  const { C, S, u, sw, q, kk, rim, lift, G } = K, c = G.cx0, d = G.drop;
  const T = P => S(P.map(([a, b]) => [c + (q && a > 0 ? a * .86 : a), b + d]));
  const R = [[.72, -9.12], [1.5, -8.98], [2.05, -8.7], [2.24, -8.15], [2.1, -7.2], [1.85, -6.2], [1.7, -5.35], [1.78, -4.68], [.95, -4.6]];
  const P = curvy(T(bsSym(R, -9.15, -4.56)), 5);
  K.knock(P); piece(P, C.tee, { sw: sw * 1.15, shade: C.teeDk, depth: .7 * u, rim, key: kk('torso'), lift });
  // the sleeves' seams and a couple of drape folds (the beard covers the middle)
  for (const s of q ? [-1] : [-1, 1]) { dline(T([[s * 1.95, -8.62], [s * 1.78, -7.9]]), sw * .5, C.teeLt, .4); dline(T([[s * 1.35, -4.72], [s * 1.2, -5.3]]), sw * .5, C.teeLt, .4); }
}
function bsdHead(K) {
  const { C, F, u, S, q, sw, rs, kk, o, G, tm, lift } = K, B = BS_DORSEY;
  const H0 = B.H0 + G.drop, hx = (q ? B.hxq : 0) + clamp(o.lookX || 0, -1, 1) * .1;
  const HP = P => S(P.map(([a, b]) => [a + hx, b + H0]));
  const mouth = F.mouth, jd = o.jaw ?? (mouth === 'laugh' ? bsLaughJaw(tm, .22, .36) : mouth === 'shout' ? .2 : mouth === 'open' ? .1 : 0);
  // neck and the tee's crew collar (a bust stops at the collar)
  rs('neck');
  const nx0 = q ? .38 : 0, N = P => S(P.map(([a, b]) => [nx0 + a, b + G.drop]));
  piece(curvy(N([[-.62, -10.6], [.62, -10.6], [.7, -8.75], [-.7, -8.75]]), 2), C.skinDk, { sw, key: kk('neck'), lift: 2, maxTone: .45 });
  if (!K.bust) piece(curvy(N([[-.98, -9.08], [-.55, -8.86], [0, -8.8], [.55, -8.86], [.98, -9.08], [.85, -9.24], [.46, -9.02], [0, -8.97], [-.46, -9.02], [-.85, -9.24]].map(([a, b]) => [a * (q ? .9 : 1), b])), 3), C.teeDk, { sw: sw * .8, rim: K.rim, key: kk('collar'), lift: 2 });
  push(); const px = nx0 * u, py = (B.shY + G.drop) * u; translate(px, py); rotate((o.tilt || 0) + (o.rot || 0) * -.4); translate(-px, -py);
  // ears: big, and they stick out
  rs('ears');
  if (!q) for (const s of [-1, 1]) { const [ex, ey] = HP([[s * 1.98, -3.2]])[0]; bsEar(K, ex + s * .08 * u, ey, 1.45 * u, .62 * u, s, kk('ear' + s)); }
  rs('head');
  const headP = curvy(HP(q ? BSD_HEAD_Q : bsSym(BSD_HEAD_R, -6.3, .05)), 5);
  K.headP = headP; K.knock(headP);
  piece(headP, C.skin, { sw: sw * 1.15, ink: STYLE.card ? undefined : null, key: kk('head'), lift, maxTone: .45 });
  bsShade(headP, .55 * u, C.skinDk);
  if (!STYLE.card) edgeLine(headP, sw * 1.15, NOIR.ink, true);
  if (q) { const [ex, ey] = HP([[-.95, -3.15]])[0]; bsEar(K, ex, ey, 1.4 * u, .55 * u, -1, kk('earq')); }
  // the shaved scalp: a shadow of stubble over the dome down to the old hairline, and a shine on top
  rs('scalp');
  if (!o.beanie) {
    const sc = q ? [[-1.72, -3.6], [-1.95, -4.4], [-1.75, -5.3], [-1.0, -6.02], [.15, -6.3], [1.25, -6.18], [1.95, -5.72], [2.22, -5.0], [1.95, -4.75], [1.2, -5.0], [.5, -4.95], [-.1, -4.6], [-.45, -3.9], [-.75, -3.55]]
                 : [[-1.92, -3.7], [-1.98, -4.5], [-1.88, -5.02], [-1.55, -5.72], [-.95, -6.16], [0, -6.3], [.95, -6.16], [1.55, -5.72], [1.88, -5.02], [1.98, -4.5], [1.92, -3.7], [1.78, -3.75], [1.7, -4.55], [1.2, -5.0], [.5, -4.92], [0, -4.9], [-.5, -4.92], [-1.2, -5.0], [-1.7, -4.55], [-1.78, -3.75]];
    piece(curvy(HP(sc), 4), mixCol(C.skin, C.scalp, .13), { ink: null, maxTone: .3, key: kk('scalp'), lift: 0, flatCard: true, edge: false });
    piece(curvy(HP(q ? [[.2, -5.95], [1.0, -5.9], [1.3, -5.7], [.6, -5.62]] : [[-.95, -5.8], [-.3, -6.05], [.2, -5.98], [-.5, -5.7]]), 4), C.skinLt, { ink: null, key: kk('shine'), lift: 0, flatCard: true, edge: false });
  }
  // eyes: calm, half shut, deep in their sockets; straight low brows
  rs('face');
  const eyeY = -3.55, E = q ? [[.52, 1.06, -1], [1.74, .6, 1]] : [[-.8, .98, -1], [.8, .98, 1]];
  const Fe = { ...F, brow: [(F.brow || [0, 0])[0] - .06, (F.brow || [0, 0])[1] - .1] };
  bsEyes(K, HP, eyeY, E, Fe, { w0: .98, browY: .64, browW: 1.1, lash: 1.1, browT: .62, extra: (px2, py2, s, side, fs, sx) => {
    if (Fe.style !== 'squeeze') bsSocket(K, px2, py2, s, side, Fe.tall ?? 1, sx);
    dline([[px2 - side * s * sx * .45, py2 + s * .42], [px2 + side * s * sx * .05, py2 + s * .56], [px2 + side * s * sx * .48, py2 + s * .4]], sw * .45, C.skinDk, .5);   // hollows under the eyes
  } });
  // nose: long, its tip hooking down a little (3/4), a ring in the near wing
  rs('nose');
  let ringAt;
  if (!q) { bsNoseF(K, HP, 0, -2.08, { tw: .29, th: .27, wr: .19, wx: .32, wy: .1, top: -3.95, holes: 1 }); ringAt = [.33, -1.86]; }
  else ringAt = bsNoseQ(K, HP, { ridge: [[1.36, -3.86], [1.62, -3.36], [2.2, -2.84], [2.6, -2.52]], tip: [2.55, -2.25], tr: .2, th: .24, wing: [2.22, -2.13], wr: .19, nw: .34 });   // long and hooked
  // the beard: from the sideburns down over the jaw and the chest to the belt, the moustache over the mouth
  rs('beard');
  const mc = q ? [1.95, -1.24] : [0, -1.24], far = q ? .55 : 1;
  bsdBeard(K, HP, jd);
  bsdMouth(K, HP, mc[0], mc[1], .62, mouth, far, jd);
  bsdTache(K, HP, mc[0], mc[1], .62, mouth, far);
  // the nose ring, hanging over the moustache
  rs('ring');
  { const [rx, ry] = HP([ringAt])[0], r = .17 * u, P = bsArc(rx, ry + r * .75, r * .8, r, -Math.PI * .35, Math.PI * 1.35, 16);
    piece(strokeShape(P, () => .085 * u), C.ring, { sw: sw * .4, key: kk('ring'), lift: 1, flatCard: true });
    dline(bsArc(rx, ry + r * .75, r * .8, r, Math.PI * .6, Math.PI * .95, 5), sw * .35, '#FFFFFF', .3); }
  if (o.beanie) { rs('beanie'); bsdBeanie(K, HP); }
  if (o.blush) for (const s of q ? [-1] : [-1, 1]) { const [bx, by] = HP([[q ? .1 : s * 1.2, -2.7]])[0]; piece(oval(bx, by, .38 * u, .18 * u, 0, 14), '#D08A84', { ink: null, op: 100 * clamp(o.blush), key: kk('blush' + s), lift: 0, flatCard: true, edge: false }); }
  pop();
}
// The beard (head units): outer edge down to a point near the belt, the top edge along the cheeks and under the nose;
// grey down the middle; strands. jd drops the lower beard with the jaw.
function bsdBeard(K, HP, jd) {
  const { C, u, sw, kk, q, o, G } = K, wind = o.wind ?? (G.P.rig === 'ride' ? .7 : 0), wv = Math.sin(K.tm * TAU * 3);
  const J = ([a, b]) => { const k = Math.pow(clamp((b + 1.0) / 6), 1.3); return [a - wind * k * (2.6 + .25 * wv * k), b + jd * 1.2 * clamp((b + 1.2) / .8) - wind * k * 1.4]; };
  const sideA = q ? [[2.5, -1.78], [2.56, -1.1], [2.54, -.3], [2.52, .5]] : [[1.95, -3.12], [2.06, -2.2], [2.06, -1.2], [2.12, -.2], [2.06, .7]];
  const lowA = q ? [[2.52, .5], [2.32, 1.6], [2.02, 2.6], [1.7, 3.45], [1.42, 4.2], [1.2, 4.85], [1.1, 5.2]] : [[2.06, .7], [1.8, 1.8], [1.45, 2.8], [1.08, 3.6], [.7, 4.3], [.35, 4.85], [.08, 5.2]];
  const lowB = q ? [[1.1, 5.2], [.86, 4.7], [.52, 3.95], [.15, 3.0], [-.2, 1.9], [-.48, .75]] : [[.08, 5.2], [-.28, 4.75], [-.66, 4.15], [-1.08, 3.4], [-1.48, 2.5], [-1.82, 1.5], [-2.06, .6]];
  const sideB = q ? [[-.48, .75], [-.66, -.4], [-.74, -1.45], [-.72, -2.35], [-.6, -3.1]] : [[-2.06, .6], [-2.12, -.3], [-2.04, -1.3], [-2.06, -2.2], [-1.95, -3.12]];
  const outer = through(sideA, 4).concat(bsWavy(lowA, 5, .16, 3).slice(1), bsWavy(lowB, 5, .16, 7).slice(1), through(sideB, 4).slice(1));
  const top = q ? [[-.45, -3.1], [-.25, -2.52], [.3, -2.12], [.95, -1.9], [1.55, -1.8], [2.1, -1.76]]
                : [[-1.84, -3.06], [-1.7, -2.5], [-1.36, -2.1], [-.9, -1.88], [-.45, -1.74], [0, -1.7], [.45, -1.74], [.9, -1.88], [1.36, -2.1], [1.7, -2.5], [1.84, -3.06]];
  const topC = through(top, 4), P = HP(outer.concat(topC).map(J));
  K.knock(P); piece(P, C.beard, { sw, ink: STYLE.card ? undefined : null, shade: C.beardDk, depth: .45 * u, key: kk('beard'), lift: 2 });
  if (!STYLE.card) { edgeLine(HP(outer.map(J)), sw, NOIR.ink, false); dline(HP(topC.map(J)), sw * .6, C.beardDk, .5); }
  // grey down the middle, from under the lip to the point
  const gc = q ? 1.55 : 0, gr = q ? [[gc - .35, -.75], [gc + .38, -.75], [gc + .5, .6], [gc + .22, 2.2], [gc - .1, 3.9], [gc - .32, 2.3], [gc - .5, .7]] : [[-.48, -.72], [.48, -.72], [.52, .7], [.28, 2.3], [.06, 4.1], [-.18, 2.4], [-.42, .8]];
  piece(curvy(HP(gr.map(J)), 5), C.grey, { ink: null, key: kk('grey'), lift: 0, flatCard: true, edge: false });
  // strands: long wavy lines flowing down to the point
  const cx = q ? 1.2 : 0;
  for (let i = 0; i < 9; i++) {
    const f = i / 8 - .5, x0 = cx + f * (q ? 2.2 : 3.0), y0 = -.9 + Math.abs(f) * 1.2, y1 = 4.5 - Math.abs(f) * 3.0, pts = [];
    for (let k = 0; k <= 6; k++) { const t = k / 6, yy = lerp(y0, y1, t); pts.push([lerp(x0, (q ? 1.0 : .05) + f * .45, t * t * .9) + .1 * Math.sin(t * 7 + i), yy]); }
    dline(HP(pts.map(J)), sw * .5, i % 3 === 1 ? C.beardLt : Math.abs(f) < .2 ? C.greyDk : C.beardDk, .5);
  }
}
// His mouth, half hidden: (cx, cy) the parting of the lips (head units), W = half width; far squeezes its far half.
function bsdMouth(K, HP, cx, cy, W, kind, far, jd) {
  const { C, u, sw, kk } = K;
  const P = (x, yy) => HP([[cx + (x > 0 ? x * far : x) * W, cy + yy * W]])[0];
  const run = (f, a, b, n = 14) => { const out = []; for (let i = 0; i <= n; i++) { const xx = lerp(a, b, i / n); out.push(P(xx, f(xx))); } return out; };
  const shape = (top, bot, a = -1, b = 1) => run(top, a, b).concat(run(bot, a, b).reverse());
  const sq1 = x => Math.max(0, 1 - x * x);
  const lower = (y0, a = .62, h = .34) => { piece(shape(x => y0 + .04 * x * x, x => y0 + h * Math.pow(sq1(x / a), .55), -a, a), C.lip, { ink: null, key: kk('lip'), lift: 0, flatCard: true, maxTone: .45 }); dline(run(x => y0 + h * Math.pow(sq1(x / a), .55) + .01, -a * .7, a * .7, 8), sw * .45, C.lipDk, .5); };
  const hole = (top, bot, a = -1, b = 1) => piece(shape(top, bot, a, b), C.mouth, { sw: sw * .7, key: kk('mo'), lift: 1, flatCard: true });
  const teeth = (top, bot, a, b, k) => piece(shape(top, bot, a, b), C.teeth, { ink: null, key: kk('mt' + k), lift: 0, flatCard: true });
  switch (kind) {
    case 'grin': case 'smile': {
      const g = kind === 'grin', h = g ? .55 : .3, top = x => -.08 - .05 * x * x, bot = x => top(x) + h * Math.pow(sq1(x), .7);
      if (g) { hole(top, bot); teeth(x => top(x) + .02, x => top(x) + .26 * Math.pow(sq1(x), .4), -.85, .85, 't'); lower(bot(0) - .02, .55, .26); }
      else lower(.02, .6, .3);
      break;
    }
    case 'laugh': case 'open': {
      const h = (kind === 'laugh' ? .95 : .6) + jd * 1.6, top = x => -.1 - .04 * x * x, bot = x => top(x) + h * Math.pow(sq1(x), .6);
      hole(top, bot);
      teeth(x => top(x) + .02, x => top(x) + .24 * Math.pow(sq1(x), .35), -.8, .8, 't');
      piece(shape(x => bot(x) - h * .35 * Math.sqrt(Math.max(0, 1 - (x / .6) ** 2)), x => bot(x) - .04, -.6, .6), C.tongue, { ink: null, key: kk('tg'), lift: 0, flatCard: true });
      lower(bot(0) - .03, .5, .22);
      break;
    }
    case 'shout': case 'o': case 'sigh': {
      const r = kind === 'shout' ? .42 + jd : .24, h = kind === 'shout' ? .95 + jd * 1.6 : .45;
      hole(x => -.08 - .1 * Math.sqrt(sq1(x / r)) * r, x => -.08 + h * Math.sqrt(sq1(x / r)), -r, r);
      lower(-.08 + h - .04, r * .9, .2);
      break;
    }
    case 'grimace': {
      const top = x => -.08 + .06 * x * x, bot = x => top(x) + .42 * Math.pow(Math.max(0, 1 - x ** 4), .5), mid = x => (top(x) + bot(x)) / 2;
      hole(top, bot, -.95, .95); teeth(x => top(x) + .03, x => bot(x) - .03, -.9, .9, 'c');
      dline(run(mid, -.88, .88, 10), sw * .5, NOIR.ink, .3);
      for (const xx of [-.6, -.3, 0, .3, .6]) dline([P(xx, top(xx) + .03), P(xx * 1.02, bot(xx) - .03)], sw * .35, '#9A8E86', 0);
      break;
    }
    case 'smirk': lower(.04, .5, .26); dline(run(x => .02 - .12 * Math.max(0, x) ** 2, -.5, .75, 8), sw * .7, C.lipDk, .5); break;
    case 'frown': lower(.06, .58, .36); break;
    default: lower(.02, .6, .3); dline(run(x => .01, -.55, .55, 6), sw * .6, C.lipDk, .3);
  }
}
// The moustache: a heavy droop from under the nose over the mouth's corners into the beard; its corners follow the mood.
function bsdTache(K, HP, cx, cy, W, kind, far) {
  const { C, u, sw, kk } = K;
  const up = { grin: .42, smile: .35, laugh: .5, open: .2, shout: .1, smirk: .15, frown: -.2, grimace: .1 }[kind] ?? 0, upR = kind === 'smirk' ? .5 : up;
  const T = ([x, yy]) => [cx + (x > 0 ? x * far : x) * W, cy + yy * W];
  const P = [[-1.85, 1.05 - up * 1.1], [-1.72, .1 - up * .5], [-1.3, -.55], [-.7, -.9], [-.2, -.95], [0, -.82], [.2, -.95], [.7, -.9], [1.3, -.55], [1.72, .1 - upR * .5], [1.85, 1.05 - upR * 1.1], [1.45, .78 - upR * .9], [1.0, .3 - upR * .35], [.5, .1 - up * .08], [0, .05], [-.5, .1 - up * .08], [-1.0, .3 - up * .35], [-1.45, .78 - up * .9]];
  piece(curvy(HP(P.map(T)), 4), mixCol(C.beard, C.beardDk, .35), { sw: sw * .75, shade: C.beardDk, depth: .1 * u, key: kk('tache'), lift: 1, flatCard: true });
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { const x0 = s * (.18 + i * .36), l = s > 0 ? upR : up; dline(HP([[x0, -.72 + i * .08], [x0 + s * .3, -.2 + i * .12 - l * .2], [x0 + s * .5, .2 + i * .2 - l * .5]].map(T)), sw * .45, i % 2 ? C.beardLt : C.beardDk, .5); }
}
function bsdBeanie(K, HP) {
  const { C, u, sw, kk, q, lift } = K;
  const dome = q ? [[-1.98, -4.55], [-2.05, -5.4], [-1.7, -6.3], [-.8, -6.85], [.4, -6.95], [1.5, -6.65], [2.2, -5.95], [2.44, -5.1], [2.42, -4.6]] : [[-2.1, -4.5], [-2.12, -5.35], [-1.8, -6.25], [-1.0, -6.85], [0, -7.0], [1.0, -6.85], [1.8, -6.25], [2.12, -5.35], [2.1, -4.5]];
  const bot = q ? [[2.42, -4.6], [1.2, -4.38], [.2, -4.45], [-1.98, -4.55]] : [[2.1, -4.5], [0, -4.35], [-2.1, -4.5]];
  piece(curvy(HP(dome.concat(bot.slice(1, -1))), 5), C.beanie, { sw: sw * 1.1, shade: C.beanieDk, depth: .4 * u, rim: K.rim, key: kk('hat'), lift });
  const cuffTop = q ? [[-2.02, -5.2], [.2, -5.12], [1.3, -5.05], [2.44, -5.22]] : [[-2.14, -5.25], [0, -5.1], [2.14, -5.25]];
  piece(curvy(HP(cuffTop.concat(bot.slice().reverse().map(([a, b]) => [a * 1.02, b + .08]))), 4), C.beanie, { sw, shade: C.beanieDk, depth: .15 * u, rim: K.rim, key: kk('hatcuff'), lift: 2 });
  const x0 = q ? -1.9 : -2.0, x1 = q ? 2.35 : 2.0;
  for (let i = 1; i < 12; i++) { const xx = lerp(x0, x1, i / 12); dline(HP([[xx, -5.08], [xx, -4.52]]), sw * .45, C.beanieLt, 0); }
  for (let i = 1; i < 6; i++) { const xx = lerp(x0 * .8, x1 * .8, i / 6); dline(HP([[xx, -5.35], [xx * .9, -6.4 + Math.abs(xx) * .25]]), sw * .4, C.beanieLt, .4); }
}
const BS_DORSEY = {
  id: 'dorsey', S: .92, qx: .3, H0: -9.72, shX: 2.1, shY: -8.72, top: -16.1, shadowW: 2.8, crouchDrop: 1.8,
  armW: [.8, .62], hand: 1.12, legs: { hip: -5.0, gap: .6, stance: .22, ank: .72, w0: .84, w1: .64 }, shoeKind: 'boot', legRim: true,
  C: BS_DC, POSE: BSD_POSE, face: bsdFace, torso: bsdTorso, head: bsdHead, rig: bsdRig, twoHand: bsdTwoHand,
  sleeve: K => [K.C.tee, K.C.teeDk], trousers: K => [K.C.trousers, K.C.trousersDk],
  root(q, s, front) { const X = this.shX, Y = this.shY, c = q ? this.qx : 0; return front ? (q ? (s < 0 ? [c - X * .9, Y + .12] : [c + X * .95, Y + .45]) : [s * X * .98, Y + .08]) : (q ? [c + (s < 0 ? -X * .88 : X * .76), Y + .06] : [s * X * .94, Y + .06]); },
  hxq: .2, mouthAt: q => q ? [1.95, -1.24] : [0, -1.24], headAt: q => q ? [.9, -3.4] : [0, -3.4],
};
function dorsey(x, y, u, o = {}) { bsFigure(BS_DORSEY, x, y, u, o); }

// ======================================================================================================================
// SAM ALTMAN
// ======================================================================================================================
const BSA_POSE = {
  idle:      { L: [-2.25, -3.75, .1, 'relax'], R: [2.25, -3.75, .1, 'relax'] },
  lecture:   { L: [-2.25, -3.75, .1, 'relax'], R: [4.35, -9.2, .3, 'point', 1, -Math.PI / 2 + .12] },
  point:     { L: [-2.25, -3.75, .1, 'relax'], R: [4.3, -6.9, .05, 'point', 1, -.12] },
  shrug:     { L: [-3.1, -5.1, .3, 'open', 0, Math.PI + .5], R: [3.1, -5.1, .3, 'open', 0, -.5] },
  megaphone: { rig: 'mega', L: [-2.25, -3.75, .1, 'relax'], R: [2.25, -3.75, .1, 'relax'] },
  table:     { L: [-1.8, -4.4, .35, 'relax', 1, .15], R: [1.8, -4.4, .35, 'relax', 1, Math.PI - .15] },   // hands on a table top at y - 4.1u
};
// (a long, narrow face: the width is up at the temples and cheekbones, the jaw tapering to a small narrow chin)
const BSA_HEAD_R = [[1.1, -5.86], [1.78, -5.42], [2.12, -4.62], [2.22, -3.72], [2.18, -2.86], [2.02, -2.02], [1.74, -1.26], [1.32, -.62], [.84, -.18], [.36, .01]];
const BSA_HEAD_Q = [[.3, -6.0], [1.45, -5.86], [2.15, -5.3], [2.45, -4.5], [2.5, -3.72], [2.4, -3.22], [2.44, -2.76], [2.42, -2.3], [2.34, -1.84], [2.24, -1.4], [2.12, -.98], [1.98, -.6], [1.78, -.26], [1.46, -.02], [1.0, .04],
  [.45, -.1], [-.3, -.5], [-1.0, -1.1], [-1.5, -1.85], [-1.85, -2.7], [-2.05, -3.6], [-2.02, -4.6], [-1.6, -5.45], [-.72, -5.92]];
function bsaFace(o) {
  const F = faceOf(o);
  if (F.style === 'happy') Object.assign(F, { style: 'open', open: .78, lower: .38 });
  F.tall = (F.tall ?? 1) * 1.06;
  return F;
}
function bsaRig(out, rig, o, q, B = BS_ALTMAN) {   // (B: the rubber-hose figure passes itself, BS_ALTMAN_HY)
  if (rig !== 'mega') return;
  const m = B.mouthAt(q), H0 = B.H0, hx = q ? B.hxq : 0;
  const lip = [m[0] + hx + (q ? .55 : .5), H0 + m[1] + (q ? .05 : .02)], a = q ? -.12 : -.42, sc = .95;
  out.prop = { kind: 'mega', P0: lip, a, sc };
  if (o.megaphone === false) return;
  const g = [lip[0] + (.88 * Math.cos(a) - .95 * Math.sin(a)) * sc, lip[1] + (.88 * Math.sin(a) + .95 * Math.cos(a)) * sc], hs = B.hand, ang = a + .25;
  const arm = q ? out.L : out.R;
  Object.assign(arm, { tip: [g[0] - Math.cos(ang) * .8 * hs, g[1] - Math.sin(ang) * .8 * hs], ang, hp: 'fist', front: 1, bend: q ? -.25 : .35 });
}
function bsaTwoHand(K) {
  const p = K.G.P.prop; if (!p || p.kind !== 'mega' || K.o.megaphone === false) return;
  bsMegaDraw(K.S([[p.P0[0], p.P0[1] + K.G.drop]])[0], p.a, p.sc * K.u, K.sw, K.kk('mega'), K.C);
}
// the gown's back panel, behind everything (open at the front)
function bsaBehind(K) {
  if (!K.o.gown) return;
  const { C, S, u, sw, q, kk, lift, G } = K, c = G.cx0;
  const P = q ? [[c - 1.7, -6.95], [c + 1.5, -6.95], [c + 2.2, -4.2], [c + 2.3, -1.5], [c + .5, -1.25], [c - 1.5, -1.3], [c - 2.9, -1.5], [c - 2.4, -4.4]]
              : [[-1.8, -6.95], [1.8, -6.95], [2.55, -4.3], [3.0, -1.5], [1.5, -1.35], [0, -1.3], [-1.5, -1.35], [-3.0, -1.5], [-2.55, -4.3]];
  piece(curvy(S(P), 4), C.gownDk, { sw, rim: K.rim, key: kk('gownB'), lift });
}
function bsaTorso(K) {
  const { C, S, u, sw, q, kk, rim, lift, G, o } = K, c = G.cx0, d = G.drop;
  const T = P => S(P.map(([a, b]) => [c + (q && a > 0 ? a * .86 : a), b + d]));
  const zx = q ? c + .45 : 0, D = P => S(P.map(([a, b]) => [zx + (q ? (a > 0 ? a * .62 : a * 1.02) : a), b + d]));
  const R = [[.72, -6.92], [1.42, -6.8], [1.9, -6.52], [2.04, -5.98], [1.92, -5.05], [1.78, -4.15], [1.74, -3.56], [.95, -3.46]];
  const P = curvy(T(bsSym(R, -6.95, -3.42)), 5);
  K.knock(P); piece(P, C.jumper, { sw: sw * 1.15, shade: C.jumperDk, depth: .6 * u, rim, key: kk('torso'), lift });
  // ribbed hem, a few knit folds
  const hem = q ? [[c - 1.76, -3.98], [c + 1.5, -3.98], [c + 1.48, -3.46], [c - 1.74, -3.46]] : [[-1.76, -3.98], [1.76, -3.98], [1.74, -3.47], [-1.74, -3.47]];
  piece(curvy(S(hem.map(([a, b]) => [a, b + d])), 2), C.rib, { sw: sw * .8, key: kk('hem'), lift: 1 });
  for (let i = 1; i < 14; i++) { const xx = lerp(q ? c - 1.7 : -1.7, q ? c + 1.45 : 1.7, i / 14); dline(S([[xx, -3.92 + d], [xx, -3.52 + d]]), sw * .4, C.jumperDk, 0); }
  for (const s of q ? [-1] : [-1, 1]) dline(D([[s * 1.1, -4.1], [s * .8, -4.6], [s * .9, -5.2]]), sw * .5, C.jumperDk, .5);
  if (o.gown) {   // the gown's front panels hang open over the jumper, a coloured facing down each front edge
    for (const s of q ? [-1, 1] : [-1, 1]) {
      const sh = s < 0 ? (q ? [c - 1.95, -6.7] : [-1.95, -6.7]) : (q ? [c + 1.72, -6.62] : [1.95, -6.7]), inX = s < 0 ? (q ? c - .75 : -.85) : (q ? c + 1.05 : .85), outX = s < 0 ? (q ? c - 2.8 : -2.95) : (q ? c + 2.05 : 2.95);
      if (q && s > 0) { piece(curvy(S([[sh[0] - .25, -6.85], [sh[0] + .15, -6.6], [outX + .15, -1.45], [outX - .45, -1.3], [inX + .45, -3.5]].map(([a, b]) => [a, b + d])), 3), C.gown, { sw, shade: C.gownDk, depth: .3 * u, rim, key: kk('gownR'), lift }); continue; }
      const Pn = [[sh[0] + s * .15, sh[1] - .3], [sh[0] + s * .35, sh[1] + .25], [outX, -1.5], [lerp(outX, inX, .5), -1.32], [inX + s * .05, -1.4], [inX, -4.2], [lerp(inX, 0, .1), -6.72]];
      piece(curvy(S(Pn.map(([a, b]) => [a, b + d])), 3), C.gown, { sw, shade: C.gownDk, depth: .35 * u, rim, key: kk('gown' + s), lift });
      piece(ribbon(S([[lerp(inX, 0, .1) + s * .12, -6.6], [inX + s * .12, -4.2], [inX + s * .17, -1.5]].map(([a, b]) => [a, b + d])), .32 * u, .32 * u), C.facing, { sw: sw * .7, key: kk('facing' + s), lift: 1 });
      for (const f of [.3, .62]) dline(S([[lerp(inX, outX, f), -5.2 + d], [lerp(inX, outX, f) + s * .15, -1.6 + d]]), sw * .5, C.gownLt, .4);
    }
  }
}
function bsaCuff(K, s, a, far) {
  const { C, u, sw, kk, o } = K, S2 = p => [p[0] * u, p[1] * u], dir = [Math.cos(a.end), Math.sin(a.end)];
  if (o.gown) {   // a wide bell sleeve round the forearm's end
    const b0 = [a.tip[0] - dir[0] * 1.3, a.tip[1] - dir[1] * 1.3], b1 = [a.tip[0] - dir[0] * .15, a.tip[1] - dir[1] * .15], n = [-dir[1], dir[0]];
    const P = [[b0[0] + n[0] * .45, b0[1] + n[1] * .45], [b1[0] + n[0] * .85, b1[1] + n[1] * .85], [b1[0] - n[0] * .85, b1[1] - n[1] * .85], [b0[0] - n[0] * .45, b0[1] - n[1] * .45]].map(S2);
    piece(curvy(P, 3), far ? C.gownDk : C.gown, { sw, shade: C.gownDk, depth: .2 * u, rim: far ? null : K.rim, key: kk('bell' + s), lift: 2 });
    return;
  }
  const e0 = [a.tip[0] - dir[0] * .45, a.tip[1] - dir[1] * .45], e1 = [a.tip[0] + dir[0] * .02, a.tip[1] + dir[1] * .02];
  piece(bsBar(S2(e0), S2(e1), .82 * u, .8 * u), far ? mixCol(C.rib, NOIR.ink, .2) : C.rib, { sw: sw * .8, key: kk('cuff' + s), lift: 2 });
}
function bsaHead(K) {
  const { C, F, u, S, q, sw, rs, kk, o, G, tm, lift } = K, B = BS_ALTMAN;
  const H0 = B.H0 + G.drop, hx = (q ? B.hxq : 0) + clamp(o.lookX || 0, -1, 1) * .1;
  const mouth = F.mouth, jd = o.jaw ?? (mouth === 'laugh' ? bsLaughJaw(tm, .22, .34) : mouth === 'shout' ? .26 : mouth === 'open' ? .1 : 0);
  const J = ([a, b]) => [a, b + jd * clamp((b + 1.5) / .9)];
  const HP = P => S(P.map(([a, b]) => [a + hx, b + H0]));
  rs('neck');
  const nx0 = q ? .3 : 0, N = P => S(P.map(([a, b]) => [nx0 + a, b + G.drop]));
  piece(curvy(N([[-.56, -8.2], [.56, -8.2], [.64, -6.5], [-.64, -6.5]]), 2), C.skinDk, { sw, key: kk('neck'), lift: 2, maxTone: .45 });
  dline(N([[-.13, -7.14], [0, -7.24], [.13, -7.14]]), sw * .45, mixCol(C.skinDk, NOIR.ink, .3), .5);   // (an Adam's apple)
  const col = [[-1.0, -6.84], [-.55, -6.58], [0, -6.52], [.55, -6.58], [1.0, -6.84], [.9, -7.05], [.48, -6.8], [0, -6.74], [-.48, -6.8], [-.9, -7.05]];
  piece(curvy(N(col.map(([a, b]) => [a * (q ? .92 : 1), b])), 3), C.rib, { sw: sw * .8, key: kk('collar'), lift: 2 });
  if (o.gown && !K.pie) for (const s of [-1, 1]) { if (q && s > 0) continue; piece(curvy(N([[s * .95, -6.95], [s * 1.25, -7.0], [s * 1.15, -6.3], [s * .75, -6.45]]), 3), C.gown, { sw: sw * .8, rim: K.rim, key: kk('yoke' + s), lift: 2 }); }
  push(); const px = nx0 * u, py = (B.shY + G.drop) * u; translate(px, py); rotate((o.tilt || 0) + (o.rot || 0) * -.4); translate(-px, -py);
  rs('ears');
  if (!q) for (const s of [-1, 1]) { const [ex, ey] = HP([[s * 2.14, -2.5]])[0]; bsEar(K, ex + s * .06 * u, ey, 1.24 * u, .52 * u, s, kk('ear' + s)); }
  rs('head');
  const headP = curvy(HP((q ? BSA_HEAD_Q : bsSym(BSA_HEAD_R, -5.78, .02)).map(J)), 5);
  K.headP = headP; K.knock(headP);
  piece(headP, C.skin, { sw: sw * 1.15, ink: STYLE.card ? undefined : null, key: kk('head'), lift, maxTone: .45 });
  bsShade(headP, .55 * u, C.skinDk);
  if (!STYLE.card) edgeLine(headP, sw * 1.15, NOIR.ink, true);
  if (q) { const [ex, ey] = HP([[-1.08, -2.45]])[0]; bsEar(K, ex, ey, 1.22 * u, .5 * u, -1, kk('earq')); }
  // hair: short and neat at the sides, a little messy at the front (a fringe of short tufts)
  rs('hair');
  bsaHair(K, HP);
  // eyes: huge and earnest, brows tented in sincere worry, tired bags under them
  rs('face');
  const eyeY = -2.95, E = q ? [[.5, 1.06, -1], [1.95, .58, 1]] : [[-.96, .97, -1], [.96, .97, 1]];
  const wide = F.open >= 1, angry = (F.brow || [0, 0])[0] < -.2;
  (K.pie ? bsahEyes : bsEyes)(K, HP, eyeY, E, F, { w0: .97, farK: .84, iris: 1.02, brow0: angry ? [.1, 0] : [.48, -.04], browY: .88, browW: 1.1, browT: 1.15, lash: 1.25, extra: (px2, py2, s, side, fs, sx) => {
    dline([[px2 - side * s * sx * .42, py2 + s * .48], [px2 + side * s * sx * .02, py2 + s * .62], [px2 + side * s * sx * .44, py2 + s * .5]], sw * .5, C.bag, .5);
    if (!fs) dline([[px2 - side * s * .2, py2 + s * .66], [px2 + side * s * .2, py2 + s * .7]], sw * .35, C.bag, .5);
  } });
  rs('nose');
  if (!q) bsNoseF(K, HP, 0, -1.72, { tw: .23, th: .22, wr: .15, wx: .25, wy: .08, top: -2.85, holes: 1 });
  else bsNoseQ(K, HP, { ridge: [[1.44, -3.15], [1.58, -2.62], [1.9, -2.12]], tip: [2.36, -1.8], tr: .23, th: .2, wing: [2.06, -1.7], wr: .15, nw: .3 });   // long and narrow
  rs('mouth');
  const mw = { flat: .8, frown: .78, smile: .92, grin: 1.0, laugh: 1.0 }[mouth] ?? .88;   // (thin-lipped)
  bsMouthH(K, HP, q ? 1.7 : 0, J([0, -.95])[1], mw * (q ? .9 : 1), mouth, q ? .58 : 1);
  // the worry line: his brows live high on his forehead
  if (!angry) { const wx = q ? 1.15 : 0; dline(HP([[wx - .5, -4.14], [wx - .15, -4.26], [wx + .15, -4.26], [wx + .5, -4.14]].map(([a, b]) => [a > wx && q ? wx + (a - wx) * .8 : a, b])), sw * .42, mixCol(C.skinDk, C.skin, .2), .5); }
  if (o.blush) for (const s of q ? [-1] : [-1, 1]) { const [bx, by] = HP([[q ? .35 : s * 1.35, -1.95]])[0]; piece(oval(bx, by, .42 * u, .2 * u, 0, 14), '#E08E86', { ink: null, op: 100 * clamp(o.blush), key: kk('blush' + s), lift: 0, flatCard: true, edge: false }); }
  if (o.cap) { rs('cap'); bsaCap(K, HP); }
  pop();
}
function bsaHair(K, HP) {
  const { C, u, sw, kk, q, lift } = K;
  // short, thick and textured: a wavy top of loose curls (bsWavy), tight at the sides with a fleck of grey at the
  // temples, and a short choppy fringe of chunks falling onto the forehead
  const top = bsWavy(q ? [[-2.34, -4.3], [-1.95, -5.5], [-1.0, -6.3], [.35, -6.56], [1.6, -6.36], [2.4, -5.76], [2.66, -4.95]]
                       : [[-2.32, -4.6], [-2.1, -5.55], [-1.3, -6.25], [0, -6.5], [1.3, -6.25], [2.1, -5.55], [2.32, -4.6]], q ? 9 : 10, .09, 3);
  const P = q ? [[-2.28, -2.95], [-2.34, -4.2], ...top, [2.72, -4.75], [2.45, -4.6], [2.2, -4.84], [1.92, -4.6], [1.62, -4.86], [1.3, -4.62], [1.0, -4.9], [.66, -4.66], [.3, -4.8], [0, -4.52],
                 [-.25, -4.18], [-.4, -3.7], [-.52, -3.25], [-.62, -2.95], [-.85, -3.3], [-1.35, -3.45], [-1.85, -2.75], [-2.1, -2.65]]
            : [[-2.2, -2.95], [-2.3, -3.95], ...top, [2.3, -3.95], [2.2, -2.95],
               [2.08, -3.0], [2.1, -3.8], [1.95, -4.3], [1.72, -4.5], [1.44, -4.74], [1.16, -4.52], [.86, -4.8], [.52, -4.54], [.18, -4.82], [-.18, -4.56], [-.52, -4.84], [-.86, -4.58], [-1.2, -4.8], [-1.5, -4.52], [-1.78, -4.62], [-1.96, -4.3], [-2.1, -3.8], [-2.08, -3.0]];
  const H = curvy(HP(P), 3);
  K.knock(H); piece(H, C.hair, { sw, shade: C.hairDk, depth: .4 * u, key: kk('hair'), lift: 2 });
  // grey at the temples (salt and pepper, lately)
  const G = q ? [[[-1.9, -2.95], [-2.0, -3.5], [-2.1, -4.1]], [[-1.55, -3.35], [-1.7, -3.85], [-1.8, -4.3]], [[-2.18, -3.2], [-2.24, -3.75]]] : [[[-2.14, -3.1], [-2.2, -3.55], [-2.24, -3.95]], [[2.14, -3.1], [2.2, -3.55], [2.24, -3.95]]];
  G.forEach((g, i) => dline(HP(g), sw * .5, mixCol(C.hairGrey, C.hair, .3), .5));
  const L = q ? [[[-1.4, -5.4], [-.4, -6.08], [.9, -6.2]]] : [[[-1.85, -5.15], [-1.1, -5.92], [.1, -6.2]]];   // one streak of light, on the lit side
  L.forEach((p, i) => piece(ribbon(HP(p), .06 * u, .26 * u), C.hairLt, { ink: null, key: kk('hairl' + i), lift: 0, flatCard: true }));
  // the curls' texture: small hooks over the top, and the fringe's chunks parted by short strokes
  const D = q ? [[[1.62, -4.7], [1.5, -5.2], [1.1, -5.7]], [[1.0, -4.8], [.75, -5.35], [.2, -5.8]], [[-.5, -4.4], [-.9, -5.05], [-1.5, -5.45]], [[2.2, -4.85], [2.25, -5.3]], [[.3, -4.9], [.1, -5.3]]]
              : [[[.86, -4.72], [.62, -5.3], [.12, -5.85]], [[1.44, -4.66], [1.25, -5.35], [.75, -5.95]], [[-.52, -4.76], [-.85, -5.4], [-1.4, -5.75]], [[1.9, -4.6], [2.05, -5.1]], [[.18, -4.74], [0, -5.2]], [[-1.2, -4.72], [-1.5, -5.1]]];
  for (const p of D) dline(HP(p), sw * .55, C.hairDk, .5);
  const hooks = q ? [[-1.2, -5.75], [-.3, -6.1], [.7, -6.15], [1.6, -5.9], [-.8, -5.3], [.3, -5.55]] : [[-1.3, -5.8], [-.45, -6.1], [.45, -6.12], [1.3, -5.85], [-.9, -5.35], [.1, -5.55], [.95, -5.4]];
  hooks.forEach(([hx, hy], i) => { const r = .17 + .05 * hash(i * 3.1); dline(HP(bsArc(hx, hy, r, r * .85, Math.PI * .95, Math.PI * 2.05, 8)), sw * .45, i % 2 ? C.hairDk : C.hairLt, .4); });
}
function bsaCap(K, HP0) {   // a mortarboard: a skull cap, a flat square board seen from a little above, a tassel
  const { C, u, sw, kk, q, lift, tm } = K, cx = q ? .7 : 0;
  const HP = P => HP0(P.map(([x, y]) => [x, y - .24]));   // (raised onto the taller head and its hair)
  piece(curvy(HP(q ? [[-2.05, -4.75], [-1.9, -5.9], [-.5, -6.5], [1.2, -6.5], [2.45, -5.8], [2.62, -4.9], [1.2, -5.12], [-.4, -5.0]] : [[-2.45, -4.85], [-2.35, -5.95], [-1.2, -6.5], [1.2, -6.5], [2.35, -5.95], [2.45, -4.85], [0, -5.2]]), 4), C.cap, { sw, rim: K.rim, key: kk('capS'), lift });
  const bd = q ? [[cx - 3.0, -6.3], [cx - .2, -7.05], [cx + 2.8, -6.55], [cx + .1, -5.82]] : [[-3.05, -6.4], [0, -7.0], [3.05, -6.4], [0, -5.8]];
  piece(HP(bd), C.cap, { sw: sw * 1.1, rim: K.rim, key: kk('capB'), lift: lift * 1.4 });
  dline(HP([bd[3], bd[0]]), sw * .5, C.capLt, 0);
  const sway = .12 * Math.sin(tm * TAU * .8), bt = [cx - .05, -6.42], edge = q ? [cx + 1.5, -6.2] : [2.4, -6.1], end = [edge[0] + .15 + sway, edge[1] + 1.25];
  piece(oval(...HP([bt])[0], .16 * u, .1 * u, 0, 10), C.tassel, { sw: sw * .5, key: kk('capBtn'), lift: 1, flatCard: true });
  dline(HP([bt, [lerp(bt[0], edge[0], .5), bt[1] + .05], edge, [edge[0] + .05 + sway * .5, edge[1] + .6], end]), sw * 1.1, C.tasselDk, .5);
  piece(curvy(HP([[end[0] - .12, end[1] - .1], [end[0] + .12, end[1] - .1], [end[0] + .22, end[1] + .7], [end[0] - .2, end[1] + .7]]), 2), C.tassel, { sw: sw * .6, key: kk('tassel'), lift: 1, flatCard: true });
}
const BS_ALTMAN = {
  id: 'altman', S: .95, qx: .25, H0: -7.45, shX: 1.95, shY: -6.62, top: -13.7, shadowW: 2.4, crouchDrop: 1.2,
  armW: [.9, .72], hand: 1.05, legs: { hip: -3.65, gap: .6, stance: .22, ank: .62, w0: .92, w1: .74 }, shoeKind: 'trainer',
  C: BS_AC, POSE: BSA_POSE, face: bsaFace, torso: bsaTorso, head: bsaHead, rig: bsaRig, twoHand: bsaTwoHand, behind: bsaBehind, cuff: bsaCuff, armsFront: o => !!o.gown,
  sleeve: K => K.o.gown ? [K.C.gown, K.C.gownDk] : [K.C.jumper, K.C.jumperDk], trousers: K => [K.C.jeans, K.C.jeansDk],
  root(q, s, front) { const X = this.shX, Y = this.shY, c = q ? this.qx : 0; return front ? (q ? (s < 0 ? [c - X * .9, Y + .12] : [c + X * .95, Y + .4]) : [s * X * .98, Y + .08]) : (q ? [c + (s < 0 ? -X * .88 : X * .76), Y + .06] : [s * X * .94, Y + .06]); },
  hxq: .15, mouthAt: q => q ? [1.7, -.95] : [0, -.95], headAt: q => q ? [.8, -3.0] : [0, -3.0],
};
function altman(x, y, u, o = {}) {
  if (!inkRH()) { bsFigure(BS_ALTMAN, x, y, u, o); return; }
  // the ink look: the rubber-hose caricature (below). It draws flat (style.js INK_FIG); its gloves are bigger, so held
  // props are scaled back to their size in the old glove
  const prev = INK_FIG, k = BS_ALTMAN.hand / BS_ALTMAN_HY.hand, keep = h => h && (s => h(s * k));
  if (prev) INK_FIG = { ...prev, flat: true };
  try { bsFigure(BS_ALTMAN_HY, x, y, u, { ...o, hold: keep(o.hold), holdL: keep(o.holdL) }); } finally { INK_FIG = prev; }
}

// ---- Altman in the rubber-hose idiom (the ink look: V3d's schoolmaster, the ink model sheets) ----
// The body caricatured the way 1930s cartoons did Hollywood stars (Disney's "Mickey's Gala Premier", 1933; Fleischer's
// cameos): hose limbs, puffy gloves, big shoes, flat fills; one contour in proportion to the figure with lighter lines
// inside it (style.js inkWrapRigs); the schoolmaster's gown (o.gown: its sleeves the hoses, a flare at the wrist) and
// mortarboard (o.cap). The same poses, props, layers and anchors as BS_ALTMAN, so all the acting works unchanged. Only
// in ink: card, bank and the rest draw BS_ALTMAN. (A full redraw's head, built of circles and ovals with a button nose,
// lost to the hybrid below.)
// A big pie-cut eye (px): centre (x, y), radii rx × ry (sx: the 3/4 squeeze), side ±1 (+: the screen-right eye); F the
// face (open, lower, slant, style, tall, iris), look [-1..1]. The 1930s way: the lids and lower lids fill inside the
// eye's own outline, a line along their edge; closed, blinking and squeezed eyes are bold strokes.
function bsarEye(K, x, y, rx, ry, side, sx, F, look, key) {
  const st = K.blink || (!F.style && (F.open ?? 1) < .16) ? 'shut' : F.style, ink = NOIR.ink, fx = rx * sx;   // (all but shut, a squint on a take: the closed stroke)
  const stroke = (P, w, k) => piece(strokeShape(P, t => w * (.5 + .5 * Math.sin(Math.PI * t)), 10), ink, { ink: null, key: key + k, lift: 1, flatCard: true, edge: false });
  if (st === 'happy') { stroke([[x - fx, y + ry * .2], [x - fx * .5, y - ry * .38], [x, y - ry * .52], [x + fx * .5, y - ry * .38], [x + fx, y + ry * .2]], ry * .34, 'h'); return; }
  if (st === 'shut') { stroke([[x - fx * 1.02, y - ry * .05], [x - fx * .5, y + ry * .3], [x, y + ry * .4], [x + fx * .5, y + ry * .3], [x + fx * 1.02, y - ry * .05]], ry * .3, 's'); return; }
  if (st === 'squeeze') { const o0 = side;   /* (the apex at the inner corner: > <) */ stroke([[x + o0 * fx * .8, y - ry * .55], [x - o0 * fx * .6, y], [x + o0 * fx * .8, y + ry * .55]], ry * .3, 'q'); return; }
  ry *= F.tall ?? 1;
  const E = oval(x, y, fx, ry, 0, 40);
  piece(E, '#F7F1E6', { ink: null, key: key + 'w', lift: 2, flatCard: true, edge: false });
  // the pupil: a tall oval with the wedge toward the light cut out, riding the look, kept in the white
  const ik = F.iris ?? 1, prx = rx * .56 * ik, pry = ry * .6 * ik, px = x + clamp(look[0], -1, 1) * (rx - prx) * .9 * sx, py = y + clamp(look[1], -1, 1) * (ry - pry) * .8 + ry * .1;
  const [lx, ly] = lightLocal(), aw = Math.atan2(ly, lx) + Math.PI, hw = .42, P = [[px + Math.cos(aw) * prx * .2 * sx, py + Math.sin(aw) * pry * .2]];
  for (let i = 0; i <= 28; i++) { const a = aw + hw + i / 28 * (TAU - 2 * hw); P.push([px + Math.cos(a) * prx * sx, py + Math.sin(a) * pry]); }
  const Q = clipConvex(P, E); if (Q.length > 2) piece(Q, ink, { ink: null, key: key + 'p', lift: 0, flatCard: true, edge: false });
  // lids: the upper from the top down to its edge (open < 1; slant tips it, inner end down for angry); the lower up
  const ts = n => Array.from({ length: n + 1 }, (_, i) => -1 + 2 * i / n), X = t => x + side * t * fx;   // (t: -1 the inner corner .. 1 the outer)
  const top = t => y - ry * Math.sqrt(Math.max(0, 1 - t * t)), bot = t => y + ry * Math.sqrt(Math.max(0, 1 - t * t));
  const open = clamp(F.open ?? 1), low = clamp(F.lower ?? 0), sl = F.slant || 0;
  const shut = t => clamp(1 - open + sl * .32 * -t - Math.abs(sl) * .06), lidE = t => lerp(top(t), bot(t), shut(t) * .96);
  if (open < .98 || Math.abs(sl) > .02) {
    const T2 = ts(24);
    piece(T2.map(t => [X(t), top(t) - 1]).concat(T2.slice().reverse().map(t => [X(t), lidE(t)])), K.C.skin, { ink: null, key: key + 'lid', lift: 0, flatCard: true, edge: false });
    dline(ts(16).map(t => [X(t * .97), lidE(t * .97)]), K.sw * 1.1, ink, .5);
  }
  if (low > .02) {
    const lowE = t => lerp(bot(t), top(t), low * .5 * Math.pow(Math.max(0, 1 - t * t), .3)), T2 = ts(24);
    piece(T2.map(t => [X(t), bot(t) + 1]).concat(T2.slice().reverse().map(t => [X(t), lowE(t)])), K.C.skin, { ink: null, key: key + 'low', lift: 0, flatCard: true, edge: false });
  }
  edgeLine(E, K.sw, ink, true, 0, 'inner');
}
// the body: the gown (one bell-shaped piece, open down the front on the slate jumper, a facing down each edge), or the
// jumper alone (and short denim below it); the far side squeezed in 3/4
function bsarTorso(K) {
  const { C, S, u, sw, q, kk, lift, G, o } = K, c = G.cx0, d = G.drop;
  const T = P => S(P.map(([a, b]) => [c + (q && a > 0 ? a * .86 : a), b + d]));
  const zx = q ? .55 : 0, Z = P => T(P.map(([a, b]) => [zx + a * (q ? .8 : 1), b]));   // (the front's middle: forward in 3/4)
  if (o.gown) {
    piece(curvy(T([[-1.25, -7.08], [-1.78, -6.86], [-2.02, -6.3], [-2.08, -4.8], [-2.35, -3.05], [-1.2, -2.9], [0, -2.86], [1.2, -2.9], [2.35, -3.05], [2.08, -4.8], [2.02, -6.3], [1.78, -6.86], [1.25, -7.08], [0, -7.0]]), 4), C.gown, { sw: sw * 1.1, key: kk('gown'), lift });
    piece(curvy(Z([[-.5, -6.98], [.5, -6.98], [.74, -4.2], [.86, -2.92], [-.86, -2.92], [-.74, -4.2]]), 2), C.jumper, { sw, role: 'inner', key: kk('jumper'), lift: 1 });
    for (const s of [-1, 1]) piece(ribbon(Z([[s * .56, -6.95], [s * .7, -4.8], [s * .9, -2.95]]), .3 * u, .36 * u), C.facing, { sw, role: 'inner', key: kk('facing' + s), lift: 1 });
    return;
  }
  piece(curvy(T([[-1.3, -7.05], [-1.78, -6.8], [-1.98, -6.15], [-1.9, -4.6], [-1.74, -3.52], [0, -3.44], [1.74, -3.52], [1.9, -4.6], [1.98, -6.15], [1.78, -6.8], [1.3, -7.05], [0, -6.95]]), 4), C.jumper, { sw: sw * 1.1, key: kk('torso'), lift });
  piece(curvy(T([[-1.76, -3.98], [1.76, -3.98], [1.74, -3.46], [-1.74, -3.46]]), 2), C.rib, { sw, role: 'inner', key: kk('hem'), lift: 1 });
  piece(curvy(T([[-1.7, -3.5], [1.7, -3.5], [1.72, -2.95], [.2, -2.88], [0, -3.12], [-.2, -2.88], [-1.72, -2.95]]), 2), C.jeans, { sw, key: kk('jeans'), lift: 1 });
}
// the gown's sleeve ends as a flare at the wrist (black on the black hose: a silhouette), or nothing (the glove's cuff)
function bsarCuff(K, s, a, far) {
  if (!K.o.gown) return;
  const { C, u, sw, kk } = K, dir = [Math.cos(a.end), Math.sin(a.end)], n = [-dir[1], dir[0]], S2 = p => [p[0] * u, p[1] * u];
  const b0 = [a.tip[0] - dir[0] * .95, a.tip[1] - dir[1] * .95], b1 = [a.tip[0] - dir[0] * .1, a.tip[1] - dir[1] * .1];
  piece(curvy([[b0[0] + n[0] * .22, b0[1] + n[1] * .22], [b1[0] + n[0] * .56, b1[1] + n[1] * .56], [b1[0] - n[0] * .56, b1[1] - n[1] * .56], [b0[0] - n[0] * .22, b0[1] - n[1] * .22]].map(S2), 3), C.gown, { sw, key: kk('bell' + s), lift: 2 });
}
// ---- the hybrid (the user's pick: "perfect"): the old ink Altman's head and face (its shape and proportions, the
// hair, the ears, the jaw, the brows, the nose, the mouth: the likeness; bsaHead as it was) with pie-cut eyes fitted
// into it, on the rubber-hose body (the gown with its hose sleeves, hose legs, puffy gloves, big shoes, flat fills).
// BSAH: the pie-cut eye in the old eye's place (radii in eye widths: a touch wider and taller than the old eye white),
// the bags under it lowered to clear it (eye widths), and the head's scale on the new body (about the chin)
const BSAH = { rx: .54, ry: .74, bag: .24, scale: 1 };
// the old face's eyes (bsEyes' layout: the same places, the far eye squeezed the same way, the same brows and extras),
// each a big pie-cut eye (bsarEye: looks, blinks, the closed stroke on a squint or a take, lids and lower lids)
function bsahEyes(K, HP, eyeY, E, Fe, o2 = {}) {
  const { C, u, sw, kk, o } = K, look = [clamp(o.lookX || 0, -1, 1), clamp(o.lookY || 0, -1, 1)], wN = E[0][1];
  for (const [ex, w, side] of E) {
    const foreshort = w < o2.w0 * .85, full = foreshort ? wN * (o2.farK ?? .9) : w, sx = foreshort ? w / full : 1;
    const [px, py] = HP([[ex, eyeY]])[0], s = full * u;
    bsarEye(K, px, py, s * BSAH.rx, s * BSAH.ry, side, sx, Fe, look, kk('e' + side));
    if (o2.extra) o2.extra(px, py + s * BSAH.bag, s, side, foreshort, sx);
    const br = Fe.brow || [0, 0], b0 = o2.brow0 || [0, 0];
    bsBrow(px + side * s * sx * (o2.browDx ?? 0), py - (o2.browY ?? .62) * u, s * (o2.browW ?? 1.05), [br[0] + b0[0], br[1] + b0[1]], side, C.brow, sw, o2.browT ?? 1, kk('br' + side), foreshort ? Math.min(1, sx * 1.1) : 1);
  }
}
function bsahHead(K) {
  K.pie = true;   // (bsaHead: the pie-cut eyes; no yokes, the new gown has its own shoulders)
  const k = BSAH.scale; if (k === 1) { bsaHead(K); return; }
  const cy = (BS_ALTMAN.H0 + K.G.drop) * K.u, cx = ((K.q ? .3 : 0) + K.G.cx0 * 0) * K.u;   // (scaled about the chin)
  push(); translate(cx, cy); scale(k); translate(-cx, -cy); bsaHead(K); pop();
}
const BS_ALTMAN_HY = {
  id: 'altman', S: .95, qx: .25, H0: -7.45, shX: 1.72, shY: -6.62, top: BS_ALTMAN.top, shadowW: 2.2, crouchDrop: 1.2,
  armW: [.44, .4], hand: 1.22, legs: { hip: -3.3, gap: .5, stance: .3, ank: .62, w0: .46, w1: .44 }, shoeKind: 'trainer',
  C: { ...BS_AC, rim: null }, POSE: BSA_POSE, face: bsaFace, torso: bsarTorso, head: bsahHead, rig: (out, rig, o, q) => bsaRig(out, rig, o, q, BS_ALTMAN_HY), twoHand: bsaTwoHand, cuff: bsarCuff, armsFront: o => !!o.gown,
  // the limbs: solid ink hoses (no outline, flat); in the gown its sleeves are hoses of the gown's cloth, outlined, so an
  // arm reads over the black gown the way the 1930s drew a black coat's sleeve
  sleeve: K => K.o.gown ? [K.C.gown, K.C.gown] : [NOIR.ink, NOIR.ink], trousers: () => [NOIR.ink, NOIR.ink],
  limbO: (K, part) => part === 'arm' && K.o.gown ? { shade: null } : { ink: null, shade: null },
  bendAdd: a => .16 * clamp((-9.5 - a.tip[1]) / 3),   // (a hand raised above the head: the hose bows out past the big round head)
  root: BS_ALTMAN.root,
  hxq: BS_ALTMAN.hxq, mouthAt: BS_ALTMAN.mouthAt, headAt: BS_ALTMAN.headAt,
};

// ======================================================================================================================
// MATT TURNBULL (the Xbox bloke)
// ======================================================================================================================
const BST_POSE = {
  idle:    { L: [-2.85, -4.35, .1, 'relax'], R: [2.85, -4.35, .1, 'relax'] },
  present: { L: [-3.9, -6.0, .3, 'open', 1, Math.PI + .35], R: [3.9, -6.0, .3, 'open', 1, -.35] },
  thumbs:  { L: [-3.1, -6.5, .45, 'thumb', 1, Math.PI], R: [3.1, -6.5, .45, 'thumb', 1, 0] },
  point:   { L: [-2.85, -4.35, .1, 'relax'], R: [4.8, -7.8, .05, 'point', 1, -.1] },
  offer:   { rig: 'pad', L: [-2.85, -4.35, .1, 'relax'], R: [2.85, -4.35, .1, 'relax'] },
  table:   { L: [-2.2, -5.0, .35, 'relax', 1, .15], R: [2.2, -5.0, .35, 'relax', 1, Math.PI - .15] },   // hands on a table top at y - 4.7u
};
const BST_HEAD_R = [[1.2, -5.33], [1.88, -4.86], [2.2, -4.02], [2.26, -3.1], [2.24, -2.3], [2.22, -1.55], [2.02, -.82], [1.55, -.27], [.85, -.03]];
const BST_HEAD_Q = [[.25, -5.48], [1.45, -5.33], [2.15, -4.85], [2.45, -4.1], [2.52, -3.55], [2.42, -3.12], [2.5, -2.72], [2.53, -2.28], [2.52, -1.82], [2.5, -1.5], [2.46, -1.2], [2.42, -.8], [2.32, -.3], [2.05, .02], [1.25, .06],
  [.35, -.1], [-.6, -.5], [-1.38, -1.1], [-1.8, -2.1], [-2.1, -3.2], [-2.08, -4.3], [-1.6, -5.1], [-.72, -5.45]];
function bstFace(o) {
  const F = faceOf(o);
  if (F.style === 'happy') Object.assign(F, { style: 'open', open: .62, lower: .52 });   // a twinkly LinkedIn squint
  else if (!F.style || F.style === 'open') { F.open = (F.open ?? .92) >= 1 ? 1 : (F.open ?? .92) * .78; F.lower = Math.max(F.lower || 0, .28); }
  if (F.mouth === 'flat') F.mouth = 'smile';   // relentlessly upbeat
  return F;
}
function bstRig(out, rig, o, q) {
  if (rig !== 'pad') return;
  const c = q ? [3.7, -6.3] : [0, -5.7], a = q ? -.08 : 0, sc = .95, hs = BS_TURNBULL.hand;
  out.prop = { kind: 'pad', c, a, sc };
  if (o.pad === false) return;
  const R = ([x, yy]) => [c[0] + (x * Math.cos(a) - yy * Math.sin(a)) * sc, c[1] + (x * Math.sin(a) + yy * Math.cos(a)) * sc];
  const gl = R([-1.3, .55]), gr = R([1.3, .55]), al = -1.25 + a, ar = -1.9 + a;
  Object.assign(out.L, { tip: [gl[0] - Math.cos(al) * .8 * hs, gl[1] - Math.sin(al) * .8 * hs], ang: al, hp: 'hold', front: 1, bend: .25 });
  Object.assign(out.R, { tip: [gr[0] - Math.cos(ar) * .8 * hs, gr[1] - Math.sin(ar) * .8 * hs], ang: ar, hp: 'hold', front: q ? 2 : 1, bend: .25 });
}
function bstTwoHand(K) {
  const p = K.G.P.prop; if (!p || p.kind !== 'pad' || K.o.pad === false) return;
  bsPadDraw(K.S([[p.c[0], p.c[1] + K.G.drop]])[0], p.a, p.sc * K.u, K.sw, K.kk('pad'), K.C);
}
function bstTorso(K) {
  const { C, S, u, sw, q, kk, rim, lift, G, o } = K, c = G.cx0, d = G.drop;
  const T = P => S(P.map(([a, b]) => [c + (q && a > 0 ? a * .86 : a), b + d]));
  const zx = q ? c + .5 : 0, D = P => S(P.map(([a, b]) => [zx + (q ? (a > 0 ? a * .62 : a * 1.02) : a), b + d]));
  const R = [[.85, -8.18], [1.75, -8.05], [2.42, -7.72], [2.62, -7.05], [2.52, -6.0], [2.4, -5.0], [2.34, -4.02], [1.25, -3.92]];
  const P = curvy(T(bsSym(R, -8.2, -3.88)), 5);
  K.knock(P); piece(P, C.hoodie, { sw: sw * 1.15, shade: C.hoodieDk, depth: .7 * u, rim, key: kk('torso'), lift });
  // ribbed hem band, the kangaroo pocket with its openings
  const hw = q ? [c - 2.34, c + 2.0] : [-2.34, 2.34];
  piece(curvy(S([[hw[0], -4.5], [hw[1], -4.5], [hw[1] + .02, -3.92], [hw[0] - .02, -3.92]].map(([a, b]) => [a, b + d])), 2), C.hoodieDk, { sw: sw * .8, key: kk('hem'), lift: 1 });
  piece(curvy(D([[-1.45, -6.0], [1.45, -6.0], [1.9, -4.55], [-1.9, -4.55]]), 2), C.hoodie, { sw: sw * .8, shade: C.hoodieDk, depth: .15 * u, key: kk('pocket'), lift: 1 });
  for (const s of q ? [-1, 1] : [-1, 1]) dline(D([[s * 1.45, -6.0], [s * 1.35, -5.4], [s * 1.62, -4.9], [s * 1.9, -4.55]]), sw * .6, C.hoodieDk, .5);
  for (const s of q ? [-1] : [-1, 1]) dline(T([[s * 2.3, -7.4], [s * 2.05, -6.8]]), sw * .5, C.hoodieDk, .4);
}
function bstCuff(K, s, a, far) {
  const { C, u, sw, kk } = K, S2 = p => [p[0] * u, p[1] * u], dir = [Math.cos(a.end), Math.sin(a.end)];
  const e0 = [a.tip[0] - dir[0] * .5, a.tip[1] - dir[1] * .5], e1 = [a.tip[0] + dir[0] * .02, a.tip[1] + dir[1] * .02];
  piece(bsBar(S2(e0), S2(e1), .92 * u, .9 * u), far ? mixCol(C.hoodieDk, NOIR.ink, .2) : C.hoodieDk, { sw: sw * .8, key: kk('cuff' + s), lift: 2 });
}
function bstHead(K) {
  const { C, F, u, S, q, sw, rs, kk, o, G, tm, lift } = K, B = BS_TURNBULL;
  const H0 = B.H0 + G.drop, hx = (q ? B.hxq : 0) + clamp(o.lookX || 0, -1, 1) * .1;
  const mouth = F.mouth, jd = o.jaw ?? (mouth === 'laugh' ? bsLaughJaw(tm, .22, .34) : mouth === 'shout' ? .26 : mouth === 'open' ? .1 : 0);
  const J = ([a, b]) => [a, b + jd * clamp((b + 1.6) / .9)];
  const HP = P => S(P.map(([a, b]) => [a + hx, b + H0]));
  // the hood lying round the neck, the neck, the hoodie's crossover neckline and drawstrings, the lanyard
  rs('neck');
  const nx0 = q ? .35 : 0, N = P => S(P.map(([a, b]) => [nx0 + a, b + G.drop]));
  piece(curvy(N([[-1.75, -7.85], [-1.55, -8.6], [-.9, -8.95], [0, -9.02], [.9, -8.95], [1.55, -8.6], [1.75, -7.85], [.9, -7.6], [0, -7.5], [-.9, -7.6]].map(([a, b]) => [a * (q ? .92 : 1), b])), 4), C.hoodieDk, { sw, shade: mixCol(C.hoodieDk, NOIR.ink, .3), depth: .2 * u, rim: K.rim, key: kk('hood'), lift: 2 });
  piece(curvy(N([[-.72, -9.3], [.72, -9.3], [.8, -7.9], [-.8, -7.9]]), 2), C.skinDk, { sw, key: kk('neck'), lift: 2, maxTone: .45 });
  piece(curvy(N([[-1.25, -8.1], [-.7, -7.82], [0, -7.35], [.7, -7.82], [1.25, -8.1], [1.35, -7.72], [.4, -7.05], [0, -6.95], [-.4, -7.05], [-1.35, -7.72]].map(([a, b]) => [a * (q ? .9 : 1), b])), 3), C.hoodie, { sw: sw * .9, shade: C.hoodieDk, depth: .15 * u, rim: K.rim, key: kk('neckline'), lift: 2 });
  if (!K.bust) for (const s of q ? [-1, 1] : [-1, 1]) {
    const x0 = s * .42 * (q && s > 0 ? .7 : 1);
    dline(N([[x0, -7.15], [x0 + s * .05, -6.5], [x0 + s * .02, -5.95]]), sw * 1.1, C.string, .5);
    piece(curvy(N([[x0 - .07, -6.0], [x0 + .09, -6.0], [x0 + .08, -5.7], [x0 - .06, -5.7]]), 2), C.clip, { sw: sw * .5, key: kk('aglet' + s), lift: 1, flatCard: true });
  }
  if (o.lanyard !== false && !K.bust) {
    rs('lanyard');
    for (const s of [-1, 1]) { if (q && s > 0) continue; piece(ribbon(N([[s * 1.02, -8.15], [s * .75, -7.3], [s * .18, -6.72]]), .2 * u, .18 * u), C.strap, { sw: sw * .6, key: kk('strap' + s), lift: 1 }); }
    if (q) piece(ribbon(N([[.55, -7.95], [.4, -7.3], [.18, -6.72]]), .16 * u, .16 * u), C.strap, { sw: sw * .6, key: kk('strapq'), lift: 1 });
    piece(curvy(N([[-.14, -6.85], [.14, -6.85], [.14, -6.5], [-.14, -6.5]]), 2), C.clip, { sw: sw * .5, key: kk('clip'), lift: 1, flatCard: true });
    const bx = q ? .1 : 0;
    piece(curvy(N([[bx - .58, -6.55], [bx + .58, -6.55], [bx + .58, -5.0], [bx - .58, -5.0]]), 2), C.badge, { sw: sw * .7, shade: C.badgeDk, depth: .08 * u, key: kk('badge'), lift: 2 });
    piece(N([[bx - .42, -6.35], [bx + .02, -6.35], [bx + .02, -5.85], [bx - .42, -5.85]]), C.badgeDk, { ink: null, key: kk('badgeph'), lift: 0, flatCard: true });
    piece(N([[bx - .5, -5.35], [bx + .5, -5.35], [bx + .5, -5.12], [bx - .5, -5.12]]), C.hoodie, { ink: null, key: kk('badgest'), lift: 0, flatCard: true });
  }
  push(); const px = nx0 * u, py = (B.shY + G.drop) * u; translate(px, py); rotate((o.tilt || 0) + (o.rot || 0) * -.4); translate(-px, -py);
  rs('ears');
  if (!q) for (const s of [-1, 1]) { const [ex, ey] = HP([[s * 2.24, -2.62]])[0]; bsEar(K, ex + s * .06 * u, ey, 1.25 * u, .52 * u, s, kk('ear' + s)); }
  rs('head');
  const headP = curvy(HP((q ? BST_HEAD_Q : bsSym(BST_HEAD_R, -5.48, 0)).map(J)), 5);
  K.headP = headP; K.knock(headP);
  piece(headP, C.skin, { sw: sw * 1.15, ink: STYLE.card ? undefined : null, key: kk('head'), lift, maxTone: .45 });
  bsShade(headP, .5 * u, C.skinDk);
  if (!STYLE.card) edgeLine(headP, sw * 1.15, NOIR.ink, true);
  if (q) { const [ex, ey] = HP([[-1.15, -2.62]])[0]; bsEar(K, ex, ey, 1.2 * u, .48 * u, -1, kk('earq')); }
  // rosy cheeks, always
  for (const s of q ? [-1, 1] : [-1, 1]) { const [bx, by] = HP([[q ? (s < 0 ? .45 : 2.15) : s * 1.35, -2.35]])[0]; piece(oval(bx, by, (q && s > 0 ? .22 : .42) * u, .2 * u, 0, 14), C.blush, { ink: null, op: 70 + 60 * clamp(o.blush || 0), key: kk('cheek' + s), lift: 0, flatCard: true, edge: false }); }
  rs('hair');
  bstHair(K, HP);
  rs('face');
  const eyeY = -3.05, E = q ? [[.52, .88, -1], [1.97, .5, 1]] : [[-.88, .82, -1], [.88, .82, 1]];
  bsEyes(K, HP, eyeY, E, F, { w0: .82, brow0: [.06, .04], browY: .52, browW: 1.25, lash: 1.2, extra: (px2, py2, s, side, fs, sx) => {
    dline([[px2 + side * s * sx * .6, py2 - s * .02], [px2 + side * s * sx * .78, py2 + s * .12]], sw * .45, C.skinDk, .5);   // crow's feet (he smiles a lot)
  } });
  rs('nose');
  if (!q) bsNoseF(K, HP, 0, -2.0, { tw: .28, th: .25, wr: .17, wx: .3, wy: .09, top: -3.35, holes: 1 });
  else bsNoseQ(K, HP, { ridge: [[1.48, -3.36], [1.64, -2.92], [2.0, -2.62]], tip: [2.52, -2.08], tr: .22, th: .2, wing: [2.2, -1.96], wr: .17, nw: .32 });   // long and straight
  // the beard: short and trimmed, from the sideburns along the square jaw, round the mouth
  rs('beard');
  const outer = q ? [[2.56, -1.76], [2.54, -1.2], [2.5, -.75], [2.4, -.26], [2.1, .06], [1.3, .14], [.35, -.02], [-.62, -.44], [-1.45, -1.05], [-1.86, -2.1], [-1.5, -3.0]]
                  : [[2.26, -3.0], [2.28, -2.3], [2.28, -1.5], [2.1, -.76], [1.64, -.16], [.95, .08], [0, .14], [-.95, .08], [-1.64, -.16], [-2.1, -.76], [-2.28, -1.5], [-2.28, -2.3], [-2.26, -3.0]];
  const top = q ? [[-1.28, -3.0], [-1.12, -2.35], [-.72, -1.85], [.1, -1.46], [.95, -1.36], [1.28, -1.55], [1.75, -1.66], [2.45, -1.7]]
                : [[-2.16, -3.0], [-2.04, -2.3], [-1.74, -1.8], [-1.28, -1.46], [-.88, -1.46], [-.55, -1.64], [-.25, -1.62], [0, -1.66], [.25, -1.62], [.55, -1.64], [.88, -1.46], [1.28, -1.46], [1.74, -1.8], [2.04, -2.3], [2.16, -3.0]];
  const outC = through(outer, 4), topC = through(top, 4), beardP = HP(outC.concat(topC).map(J));
  piece(beardP, C.beard, { sw: sw * .9, ink: STYLE.card ? undefined : null, shade: C.beardDk, depth: .3 * u, key: kk('beard'), lift: 1, maxTone: .6 });
  if (!STYLE.card) { edgeLine(HP(outC.map(J)), sw * 1.05, NOIR.ink, false); dline(HP(topC.map(J)), sw * .55, C.beardDk, .5); }
  for (let i = 0; i < 16; i++) { const f = i / 15, pt = outer[Math.round(f * (outer.length - 1))], cc = q ? [1.1, -1.2] : [0, -1.2], d0 = .18 + .1 * hash(i * 3.1); const m = [lerp(pt[0], cc[0], d0), lerp(pt[1], cc[1], d0)]; dline(HP([m, [m[0] + .04, m[1] + .12]].map(J)), sw * .45, i % 2 ? C.beardLt : C.beardDk); }
  // mouth over the beard (the lips show through it), the moustache's lower edge over the top lip
  rs('mouth');
  const mw = { smile: 1.22, grin: 1.38, laugh: 1.35, flat: 1.1, frown: 1.05, smirk: 1.1 }[mouth] ?? 1.15, mx = q ? 1.72 : 0, my = J([0, -1.2])[1];
  if (['smile', 'flat', 'frown', 'smirk', 'wobble'].includes(mouth)) { const lw2 = mw * .28, far = q ? .6 : 1, L2 = ([a, b]) => [mx + (a > 0 ? a * far : a), b]; piece(curvy(HP([[-lw2, my + .08], [0, my + .05], [lw2, my + .08], [lw2 * .7, my + .3], [0, my + .36], [-lw2 * .7, my + .3]].map(L2)), 5), C.lip, { ink: null, key: kk('lip'), lift: 0, flatCard: true, maxTone: .45 }); }
  bsMouthH(K, HP, mx, my, mw * (q ? .9 : 1), mouth, q ? .58 : 1);
  { const far = q ? .6 : 1, T2 = ([a, b]) => [mx + (a > 0 ? a * far : a), b]; dline(HP([[-.72, -1.45], [-.3, -1.56], [0, -1.52], [.3, -1.56], [.72, -1.45]].map(T2)), sw * .6, C.beardDk, .5); }
  pop();
}
function bstHair(K, HP) {
  const { C, u, sw, kk, q } = K;
  // short and cropped, a small quiff at the front, receding a little at the temples (a high forehead)
  const P = q ? [[-2.1, -3.2], [-2.16, -4.25], [-1.75, -5.2], [-.8, -5.74], [.45, -5.98], [1.55, -5.84], [2.22, -5.3], [2.44, -4.72], [2.2, -4.72], [1.85, -4.55], [1.45, -4.78], [.95, -5.0], [.45, -4.92], [.02, -4.62], [-.3, -4.1], [-.5, -3.5], [-.62, -3.15], [-.85, -3.4], [-1.4, -3.5], [-1.85, -2.95]]
              : [[-2.3, -3.2], [-2.34, -4.15], [-2.05, -4.98], [-1.35, -5.62], [-.4, -5.95], [.55, -5.98], [1.4, -5.68], [2.05, -5.02], [2.34, -4.15], [2.3, -3.2],
                 [2.16, -3.22], [2.1, -3.95], [1.88, -4.3], [1.55, -4.55], [1.15, -4.9], [.55, -5.02], [0, -5.0], [-.55, -5.02], [-1.15, -4.9], [-1.55, -4.55], [-1.88, -4.3], [-2.1, -3.95], [-2.16, -3.22]];
  const H = curvy(HP(P), 3);
  piece(H, C.hair, { sw, shade: C.hairDk, depth: .3 * u, key: kk('hair'), lift: 2 });
  const L = q ? [[[-.4, -5.25], [.5, -5.7], [1.6, -5.55]]] : [[[-1.1, -5.15], [-.1, -5.66], [1.1, -5.5]]];
  L.forEach((p, i) => piece(ribbon(HP(p), .06 * u, .24 * u), C.hairLt, { ink: null, key: kk('hairl' + i), lift: 0, flatCard: true }));
  for (const p of q ? [[[.6, -4.9], [1.0, -5.4], [1.5, -5.6]], [[-.9, -4.2], [-1.3, -4.9]]] : [[[-.2, -4.95], [.2, -5.45], [.8, -5.7]], [[1.2, -4.75], [1.6, -5.1]], [[-1.3, -4.75], [-1.7, -5.0]]]) dline(HP(p), sw * .5, C.hairDk, .5);
}
const BS_TURNBULL = {
  id: 'turnbull', S: .95, qx: .3, H0: -8.45, shX: 2.4, shY: -7.9, top: -14.4, shadowW: 3.0, crouchDrop: 1.4,
  armW: [1.05, .86], hand: 1.18, legs: { hip: -4.2, gap: .78, stance: .25, ank: .62, w0: 1.0, w1: .82 }, shoeKind: 'trainer',
  C: BS_TC, POSE: BST_POSE, face: bstFace, torso: bstTorso, head: bstHead, rig: bstRig, twoHand: bstTwoHand, cuff: bstCuff,
  sleeve: K => [K.C.hoodie, K.C.hoodieDk], trousers: K => [K.C.jeans, K.C.jeansDk],
  root(q, s, front) { const X = this.shX, Y = this.shY, c = q ? this.qx : 0; return front ? (q ? (s < 0 ? [c - X * .9, Y + .15] : [c + X * .95, Y + .45]) : [s * X * .98, Y + .1]) : (q ? [c + (s < 0 ? -X * .88 : X * .76), Y + .08] : [s * X * .94, Y + .08]); },
  hxq: .15, mouthAt: q => q ? [1.72, -1.2] : [0, -1.2], headAt: q => q ? [.8, -3.0] : [0, -3.0],
};
function turnbull(x, y, u, o = {}) { bsFigure(BS_TURNBULL, x, y, u, o); }

// ======================================================================================================================
// DARIO AMODEI (V2c: "the checkout")
// ======================================================================================================================
const BS_RC = {   // Dario
  skin: '#E4BB9C', skinDk: '#C29678', skinLt: '#F3D6C2', line: '#9A705C', lip: '#BD7A6A', lipLt: '#CC8C7C', stubble: '#7A6458',
  hair: '#3B291F', hairDk: '#1F140E', hairLt: '#6E513C', brow: '#34241B',
  frame: '#34353D', frameLt: '#6A6C78',
  shirt: '#5072AA', shirtDk: '#36527F', shirtLt: '#809DC8', button: '#ECE8DE',
  hoodie: '#A3A5AB', hoodieDk: '#7B7D85', hoodieLt: '#C6C8CE', tee: '#2A3452', string: '#E6E4DE',
  trousers: '#3E3F48', trousersDk: '#28292F', shoe: '#2F2C33', sole: '#DAD4C8', shoeLt: '#5A5660', rim: '#B8BCC8',
  iris: '#7A6A40', teeth: '#F4EEE4', mouth: '#3A1418',
};
const BSR_POSE = {
  idle:      { L: [-2.85, -4.3, .1, 'relax'], R: [2.85, -4.3, .1, 'relax'] },
  fold:      { rig: 'fold', L: [0, 0, 0, 'none', 1], R: [0, 0, 0, 'relax', 1] },                 // arms folded across the chest
  headshake: { rig: 'fold', shake: true, L: [0, 0, 0, 'none', 1], R: [0, 0, 0, 'relax', 1] },    // folded, and one firm "no"
  point:     { L: [-2.85, -4.3, .1, 'relax'], R: [4.8, -7.5, .05, 'point', 1, -.1] },
  present:   { L: [-3.85, -5.8, .3, 'open', 1, Math.PI + .35], R: [3.85, -5.8, .3, 'open', 1, -.35] },
  table:     { L: [-2.2, -5.0, .35, 'relax', 1, .15], R: [2.2, -5.0, .35, 'relax', 1, Math.PI - .15] },   // hands on a table top at y - 4.7u
};
// A round, full-cheeked face; in 3/4 the far side is the profile (forehead, the brow, the cheek under the glasses, the
// lips, a soft chin; the big rounded nose is its own piece over it, bsNoseQ).
const BSR_HEAD_R = [[1.25, -5.9], [2.0, -5.4], [2.35, -4.325], [2.43, -3.2], [2.41, -2.4], [2.3, -1.7], [2.0, -1], [1.5, -.42], [.8, -.08]];
const BSR_HEAD_Q = [[.3, -6.05], [1.5, -5.9], [2.25, -5.4], [2.6, -4.391], [2.66, -3.466], [2.52, -3], [2.55, -2.62], [2.57, -2.2], [2.53, -1.78], [2.5, -1.42], [2.46, -1.12], [2.4, -.82], [2.28, -.45], [2.05, -.12], [1.6, .04], [.8, .02],
  [-.3, -.28], [-1.2, -.85], [-1.8, -1.6], [-2.1, -2.45], [-2.3, -3.4], [-2.22, -4.788], [-1.7, -5.7], [-.8, -6.03]];
function bsrFace(o) {
  const F = faceOf(o);
  if (F.style === 'happy') Object.assign(F, { style: 'open', open: .58, lower: .52 });   // the big smile squeezes his eyes behind the glasses
  else if (!F.style || F.style === 'open') { F.open = (F.open ?? .92) >= 1 ? 1 : (F.open ?? .92) * .86; F.lower = Math.max(F.lower || 0, .14); }
  return F;
}
// Folded arms: each arm drops to its elbow at the side and its forearm comes back across the chest; the under arm's hand
// tucks under the other arm, the over arm's hand lies on the other upper arm.
function bsrRig(out, rig, o, q) {
  if (rig !== 'fold') return;
  const c = q ? BS_DARIO.qx : 0;
  if (!q) {
    Object.assign(out.L, { tip: [2.05, -5.95], elbow: [-2.62, -5.3], hp: 'none', front: 1, ang: null });
    Object.assign(out.R, { tip: [-1.15, -6.3], elbow: [2.62, -5.2], hp: 'relax', ang: Math.PI + .3, front: 1 });
  } else {
    Object.assign(out.R, { tip: [c - .95, -5.95], elbow: [c + 2.2, -5.3], hp: 'none', front: 1, ang: null });
    Object.assign(out.L, { tip: [c + 1.3, -6.3], elbow: [c - 2.15, -5.2], hp: 'relax', ang: -.3, front: 1 });
  }
}
// One firm "no": a small anticipation one way, the swing to the other, back past the middle, a settle. k 0..1 → turn -1..1.
function bsShake(k) {
  const Kf = [[0, 0], [.1, .22], [.3, -1], [.52, .9], [.72, -.4], [.88, .1], [1, 0]];
  k = clamp(k); let i = 0; while (i < Kf.length - 2 && k > Kf[i + 1][0]) i++;
  const [t0, v0] = Kf[i], [t1, v1] = Kf[i + 1]; return lerp(v0, v1, ease((k - t0) / (t1 - t0)));
}
// The shake's progress: o.shake (0..1) wins; else o.shakeAt (a start time, s) plays one shake lasting o.shakeDur (.8 s);
// else the headshake pose alone repeats one every 1.6 s (for model sheets).
function bsShakeK(o, P, tm) {
  if (o.shake != null) return clamp(o.shake);
  if (o.shakeAt != null) return seg(tm, o.shakeAt, o.shakeAt + (o.shakeDur ?? .8));
  return P.shake ? clamp(frac(tm / 1.6) * 2) : 0;
}
function bsrTorso(K) {
  const { C, S, u, sw, q, kk, rim, lift, G, o } = K, c = G.cx0, d = G.drop, hood = !!o.hoodie;
  const T = P => S(P.map(([a, b]) => [c + (q && a > 0 ? a * .86 : a), b + d]));
  const zx = q ? c + .5 : 0, D = P => S(P.map(([a, b]) => [zx + (q ? (a > 0 ? a * .62 : a * 1.02) : a), b + d]));
  const R = [[.85, -8.1], [1.7, -7.98], [2.3, -7.7], [2.48, -7.1], [2.42, -6.1], [2.42, -5.1], [2.38, -4.25], [2.2, -3.8], [1.3, -3.66], [.6, -3.56]];
  const P = curvy(T(bsSym(R, -8.12, -3.52)), 5);
  K.knock(P); piece(P, hood ? C.hoodie : C.shirt, { sw: sw * 1.15, shade: hood ? C.hoodieDk : C.shirtDk, depth: .7 * u, rim, key: kk('torso'), lift });
  if (hood) {   // a grey zip hoodie hanging open over a navy tee
    piece(curvy(D([[-.62, -8.0], [.62, -8.0], [.52, -3.66], [-.52, -3.66]]), 2), C.tee, { sw: sw * .8, key: kk('tee'), lift: 1 });
    for (const s of [-1, 1]) dline(D([[s * .6, -7.95], [s * .54, -5.8], [s * .5, -3.66]]), sw * .9, C.hoodieLt, .3);
    const hw = q ? [c - 2.3, c + 1.98] : [-2.3, 2.3];   // the ribbed hem band, inside the torso's outline
    piece(curvy(S([[hw[0], -4.2], [hw[1], -4.2], [hw[1] - .16, -3.72], [hw[0] + .16, -3.72]].map(([a, b]) => [a, b + d])), 2), C.hoodieDk, { sw: sw * .8, key: kk('hem'), lift: 1 });
    for (const s of q ? [-1] : [-1, 1]) dline(D([[s * .95, -5.3], [s * 1.35, -4.5]]), sw * .6, C.hoodieDk, .3);   // pocket mouths
  } else {   // a blue button-down shirt, untucked: the placket and its buttons, a shirttail hem, folds
    dline(D([[0, -7.45], [0, -5.5], [0, -3.62]]), sw * .6, C.shirtDk, .2);
    for (const by of [-6.85, -6.05, -5.25, -4.45]) piece(oval(...D([[.14, by]])[0], .1 * u, .1 * u, 0, 10), C.button, { sw: sw * .4, key: kk('btn' + by), lift: 1, flatCard: true });
    for (const s of q ? [-1] : [-1, 1]) dline(T([[s * 2.1, -7.3], [s * 1.8, -6.6]]), sw * .5, C.shirtDk, .4);
    dline(D([[-1.35, -4.45], [-.95, -4.9]]), sw * .5, C.shirtDk, .4);
    dline(D([[1.2, -4.1], [1.6, -4.6]]), sw * .5, C.shirtDk, .4);
  }
}
function bsrCuff(K, s, a, far) {
  const { C, u, sw, kk, o } = K, S2 = p => [p[0] * u, p[1] * u], dir = [Math.cos(a.end), Math.sin(a.end)];
  const e0 = [a.tip[0] - dir[0] * .5, a.tip[1] - dir[1] * .5], e1 = [a.tip[0] + dir[0] * .02, a.tip[1] + dir[1] * .02], col = o.hoodie ? C.hoodieDk : C.shirtDk;
  piece(bsBar(S2(e0), S2(e1), .9 * u, .88 * u), far ? mixCol(col, NOIR.ink, .2) : col, { sw: sw * .8, key: kk('cuff' + s), lift: 2 });
}
// A lens rim (px): a rounded rectangle ring as one closed piece (seam at the bottom), centre (cx, cy), half-sizes hw hh.
function bsLensRing(cx, cy, hw, hh, t, n = 2.7) {
  const pt = (a, w, h) => { const c = Math.cos(a), s2 = Math.sin(a); return [cx + w * Math.sign(c) * Math.pow(Math.abs(c), 2 / n), cy + h * Math.sign(s2) * Math.pow(Math.abs(s2), 2 / n)]; };
  const O = [], I = [];
  for (let j = 0; j <= 40; j++) { const a = Math.PI / 2 + j / 40 * TAU; O.push(pt(a, hw + t / 2, hh + t / 2)); I.push(pt(a, hw - t / 2, hh - t / 2)); }
  return O.concat(I.reverse());
}
// His glasses: dark rounded-rectangle frames over the eyes E ([x, width, side] head units), the bridge on the nose, the near
// temple arm(s) back to the ear(s). ears: [[x, y], ...] head units (skull space, through HH).
// In 3/4 the far lens is foreshortened like its eye (narrower, a touch smaller) and goes on first (part 'far'), before
// the nose, so the bridge of the nose hides its inner rim; then part 'near': the near lens, the temple and the bridge
// of the glasses resting on the nose. (No part: everything, the front view.)
function bsrGlasses(K, HP, HH, E, eyeY, ears, part) {
  const { C, u, sw, kk, q } = K, t = .13 * u, lens = E.map(([ex, w, side], i) => { const far = q && i > 0; return { ex, hw: (q ? .7 : .64) * (far ? w / E[0][1] : 1), hh: .47 * (far ? .9 : 1), side, i }; });
  const fr = { ink: null, key: '', lift: 1.5, flatCard: true }, on = L => !part || (part === 'far') === (L.i > 0);
  // temples, behind the rims: from each visible lens's outer edge back to its ear
  lens.forEach((L, i) => { const ear = ears[i]; if (!ear || !on(L)) return; const a = HP([[L.ex + L.side * L.hw * .98, eyeY - .1]])[0], b = HH([ear])[0]; piece(ribbon([a, [lerp(a[0], b[0], .5), lerp(a[1], b[1], .5) - .04 * u], b], .11 * u, .09 * u), C.frame, { ...fr, key: kk('temple' + i) }); });
  for (const L of lens) { if (!on(L)) continue; const [cx, cy] = HP([[L.ex, eyeY]])[0]; piece(bsLensRing(cx, cy, L.hw * u, L.hh * u, t), C.frame, { ...fr, key: kk('lens' + L.side) }); if (!['ink', 'card'].includes(STYLE.mode) && !STYLE.card) edgeLine(bsLensRing(cx, cy, L.hw * u, L.hh * u, t).slice(0, 41), sw * .5, C.frame, false); }
  const [A, B2] = lens, i0 = [A.ex + (q ? A.hw : A.hw * -A.side), eyeY - .12], i1 = [B2.ex - (q ? B2.hw : B2.hw * B2.side), eyeY - .12];
  if (part !== 'far') piece(ribbon(HP([i0, [lerp(i0[0], i1[0], .5), eyeY - .22], i1]), .11 * u, .11 * u), C.frame, { ...fr, key: kk('bridgeG') });
  if (STYLE.card || STYLE.mode === 'ink') for (const L of lens) { if (!on(L)) continue; const [cx, cy] = HP([[L.ex, eyeY]])[0], w = L.hw * u, h = L.hh * u; dline([[cx - w * .62, cy - h * .15], [cx - w * .25, cy - h * .72]], sw * .9, '#FFFFFF', 0); }
}
// The curly mop: an outline of round bumps, and small curls drawn on it.
function bsCurl(cx, cy, r, rot, col, sw) {
  const P = []; for (let i = 0; i <= 10; i++) { const a = rot + Math.PI * (.9 + i / 10 * 1.2); P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * .9]); }
  dline(P, sw, col, .4);
}
function bsrHair(K, HH) {
  const { C, u, sw, kk, q, lift } = K;
  // (a high forehead: the temples recede deep, a curly forelock comes down in the middle, the sides are cropped short)
  const outer = q ? [[-2.12, -2.6], [-2.42, -3.532], [-2.52, -4.854], [-2.22, -5.95], [-1.42, -6.65], [-.3, -6.99], [.9, -7.01], [1.85, -6.67], [2.42, -6.07], [2.62, -5.65]]
                  : [[-2.34, -3.466], [-2.5, -4.325], [-2.56, -5.3], [-2.3, -6.05], [-1.65, -6.65], [-.75, -6.95], [.25, -7.01], [1.15, -6.85], [1.9, -6.4], [2.4, -5.7], [2.58, -4.854], [2.52, -3.995], [2.34, -3.466]];
  const line = q ? [[2.62, -5.65], [2.4, -5.75], [2.12, -5.5], [1.82, -5.31], [1.5, -5.5], [1.12, -5.77], [.72, -5.75], [.4, -5.47], [.15, -4.92], [-.05, -4.166], [-.25, -3.532], [-.42, -3.2], [-.68, -3.466], [-1.25, -3.638], [-1.8, -2.85], [-2.12, -2.6]]
                 : [[2.26, -3.466], [2.18, -4.193], [2.02, -5.012], [1.78, -5.57], [1.42, -5.83], [1.05, -5.7], [.7, -5.45], [.34, -5.29], [0, -5.39], [-.38, -5.27], [-.72, -5.49], [-1.06, -5.73], [-1.44, -5.83], [-1.8, -5.57], [-2.04, -5.012], [-2.18, -4.193], [-2.26, -3.466]];
  const O = bsWavy(outer, q ? 12 : 14, .2, 5).concat(bsWavy(line, q ? 8 : 9, .1, 9).slice(1));
  const H = HH(O);
  K.knock(H); piece(H, C.hair, { sw, shade: C.hairDk, depth: .4 * u, key: kk('hair'), lift: 2 });
  // curls: little hooks, lighter toward the light, darker in the shadow
  const rows = q ? [[-6.1, [-1.3, -.4, .6, 1.6]], [-5.6, [-1.9, -1.0, -.05, .95, 1.95]], [-5.15, [-1.95, -1.1]], [-4.4, [-2.15, -1.5]], [-3.8, [-2.15]]]
                 : [[-6.12, [-1.1, -.2, .7, 1.5]], [-5.62, [-1.85, -.95, -.05, .85, 1.72]], [-5.2, [-2.2, 2.15]], [-4.4, [-2.36, 2.36]]];
  let n = 0;
  for (const [ry, xs] of rows) for (const rx of xs) { n++; const jx = (hash(n * 5.1 + 2) - .5) * .25, jy = (hash(n * 3.3 + 8) - .5) * .18, lit = rx + ry * .2 < .3; const [cx, cy] = HH([[rx + jx, ry + jy]])[0]; bsCurl(cx, cy, (.17 + .08 * hash(n * 2.9)) * u, (hash(n * 1.7) - .5) * 1.2, lit ? C.hairLt : C.hairDk, sw * .6); }
}
function bsrHead(K) {
  const { C, F, u, S, q, sw, rs, kk, o, G, tm, lift } = K, B = BS_DARIO;
  const tv = bsShake(bsShakeK(o, G.P, tm));   // the head shake: features slide across the face (3/4: the head turns as one)
  const H0 = B.H0 + G.drop, hx0 = (q ? B.hxq : 0) + clamp(o.lookX || 0, -1, 1) * .1, hx = hx0 + tv * (q ? .42 : .38), hs = hx0 + tv * (q ? .42 : .12);   // (3/4: the head turns as one)
  const mouth = F.mouth, jd = o.jaw ?? (mouth === 'laugh' ? bsLaughJaw(tm, .22, .34) : mouth === 'shout' ? .26 : mouth === 'open' ? .1 : 0);
  const J = ([a, b]) => [a, b + jd * clamp((b + 1.55) / .9)];
  const HP = P => S(P.map(([a, b]) => [a + hx, b + H0])), HH = P => S(P.map(([a, b]) => [a + hs, b + H0]));
  // neck and collar: the shirt's collar band behind the neck, the neck in the open collar, the two collar points over it
  rs('neck');
  const nx0 = q ? .35 : 0, N = P => S(P.map(([a, b]) => [nx0 + a, b + G.drop]));
  if (o.hoodie) piece(curvy(N([[-1.7, -7.85], [-1.5, -8.55], [-.9, -8.9], [0, -8.98], [.9, -8.9], [1.5, -8.55], [1.7, -7.85], [.9, -7.62], [0, -7.52], [-.9, -7.62]].map(([a, b]) => [a * (q ? .92 : 1), b])), 4), C.hoodieDk, { sw, shade: mixCol(C.hoodieDk, NOIR.ink, .3), depth: .2 * u, rim: K.rim, key: kk('hood'), lift: 2 });
  else piece(curvy(N([[-.9, -8.0], [-.85, -8.62], [0, -8.74], [.85, -8.62], [.9, -8.0]].map(([a, b]) => [a * (q ? .9 : 1), b])), 3), C.shirtDk, { sw: sw * .8, key: kk('band'), lift: 2, flatCard: true });
  piece(curvy(N(o.hoodie ? [[-.7, -9.2], [.7, -9.2], [.78, -7.9], [-.78, -7.9]] : [[-.7, -9.2], [.7, -9.2], [.76, -8.05], [.3, -7.85], [0, -7.42], [-.3, -7.85], [-.76, -8.05]]), 2), C.skinDk, { sw, key: kk('neck'), lift: 2, maxTone: .45 });
  if (o.hoodie) piece(curvy(N([[-.95, -8.05], [-.55, -7.8], [0, -7.72], [.55, -7.8], [.95, -8.05], [.85, -8.22], [.48, -7.98], [0, -7.9], [-.48, -7.98], [-.85, -8.22]].map(([a, b]) => [a * (q ? .9 : 1), b])), 3), C.tee, { sw: sw * .8, key: kk('crew'), lift: 2, flatCard: true });
  else for (const s of [-1, 1]) { const k2 = q && s > 0 ? .75 : 1; piece(curvy(N([[s * .74 * k2, -8.5], [s * .16, -7.62], [s * .5 * k2, -7.2], [s * 1.12 * k2, -7.62]]), 3), C.shirt, { sw: sw * .85, shade: C.shirtDk, depth: .08 * u, rim: K.rim, key: kk('collar' + s), lift: 2, flatCard: true }); }
  if (o.hoodie && !K.bust) for (const s of [-1, 1]) { const x0 = s * .78 * (q && s > 0 ? .7 : 1); dline(N([[x0, -7.9], [x0 + s * .06, -7.2], [x0 + s * .03, -6.6]]), sw * 1.1, C.string, .5); }
  push(); const px = nx0 * u, py = (B.shY + G.drop) * u; translate(px, py); rotate((o.tilt || 0) + (o.rot || 0) * -.4 + tv * .07); translate(-px, -py);
  rs('ears');
  const earF = s => [s * 2.43 - tv * .08, -2.55];
  if (!q) for (const s of [-1, 1]) { const [ex, ey] = HH([earF(s)])[0]; bsEar(K, ex + s * .06 * u, ey, 1.24 * u, .54 * u, s, kk('ear' + s)); }
  rs('head');
  const headP = curvy(HH((q ? BSR_HEAD_Q : bsSym(BSR_HEAD_R, -6.05, .02)).map(J)), 5);
  K.headP = headP; K.knock(headP);
  piece(headP, C.skin, { sw: sw * 1.15, ink: STYLE.card ? undefined : null, key: kk('head'), lift, maxTone: .45 });
  // a shadow of stubble over the jaw and the upper lip (an opaque tone: a thin wash would mix like pigment)
  const stub = q ? [[-1.4, -2.45], [-.95, -1.9], [-.2, -1.6], [.7, -1.55], [1.3, -1.66], [1.9, -1.72], [2.48, -1.7], [2.47, -1.45], [2.43, -1.12], [2.37, -.82], [2.25, -.47], [2.03, -.16], [1.6, -.02], [.8, -.02], [-.25, -.32], [-1.15, -.88], [-1.72, -1.6], [-1.92, -2.2]]
                 : [[-2.3, -2.55], [-2.0, -1.95], [-1.45, -1.62], [-.85, -1.58], [-.45, -1.72], [0, -1.74], [.45, -1.72], [.85, -1.58], [1.45, -1.62], [2.0, -1.95], [2.3, -2.55], [2.36, -2.4], [2.26, -1.7], [1.97, -1.02], [1.48, -.46], [.8, -.12], [0, -.03], [-.8, -.12], [-1.48, -.46], [-1.97, -1.02], [-2.26, -1.7], [-2.36, -2.4]];
  piece(curvy(HH(stub.map(J)), 4), mixCol(C.skin, C.stubble, .08), { ink: null, key: kk('stubble'), lift: 0, flatCard: true, edge: false, maxTone: .45 });
  bsShade(headP, .5 * u, C.skinDk);
  if (!STYLE.card) edgeLine(headP, sw * 1.15, NOIR.ink, true);
  if (q) { const [ex, ey] = HH([[-1.05, -2.55]])[0]; bsEar(K, ex, ey, 1.2 * u, .5 * u, -1, kk('earq')); }
  rs('hair'); bsrHair(K, HH);
  // eyes (hazel, smallish behind the glasses), the nose, the glasses on it, then the brows over the frames
  rs('face');
  const eyeY = -3.0, E = q ? [[.52, .8, -1], [1.94, .46, 1]] : [[-.92, .74, -1], [.92, .74, 1]], brows = [];
  bsEyes(tv ? { ...K, o: { ...o, lookX: clamp((o.lookX || 0) + tv * .9, -1, 1) } } : K, HP, eyeY, E, F, { w0: .74, brow0: [.1, 0], browY: .74, browW: 1.3, lash: 1.2, browT: 1.05, lateBrows: brows });
  if (q) { rs('glasses'); bsrGlasses(K, HP, HH, E, eyeY, [], 'far'); }
  rs('nose');
  if (!q) bsNoseF(K, HP, 0, -1.98, { tw: .38, th: .33, wr: .22, wx: .38, wy: .1, top: -3.05, holes: 1 });
  else bsNoseQ(K, HP, { ridge: [[1.42, -3.14], [1.62, -2.78], [1.92, -2.46], [2.1, -2.3]], bulb: true, tip: [2.44, -2.02], tr: .38, th: .35, wing: [1.98, -1.9], wr: .26, nw: .4 });   // big and rounded
  rs('glasses'); bsrGlasses(K, HP, HH, E, eyeY, q ? [[-.85, -2.95]] : [[-2.3, -2.95], [2.3, -2.95]], q ? 'near' : undefined);
  rs('brows'); for (const b of brows) b();
  rs('mouth');
  const mw = { smile: 1.25, grin: 1.42, laugh: 1.38, flat: 1.0, frown: 1.0, smirk: 1.1 }[mouth] ?? 1.15;
  bsMouthH(K, HP, q ? 1.72 : 0, J([0, -1.15])[1], mw * (q ? .9 : 1), mouth, q ? .58 : 1);
  if (o.blush) for (const s of q ? [-1] : [-1, 1]) { const [bx, by] = HP([[q ? .4 : s * 1.4, -2.05]])[0]; piece(oval(bx, by, .42 * u, .2 * u, 0, 14), '#E08E86', { ink: null, op: 100 * clamp(o.blush), key: kk('blush' + s), lift: 0, flatCard: true, edge: false }); }
  pop();
}
const BS_DARIO = {
  id: 'dario', key: 'r', S: .95, qx: .3, hxq: .15, H0: -8.45, shX: 2.35, shY: -7.9, top: -15.5, shadowW: 3.0, crouchDrop: 1.4,
  armW: [1.02, .84], hand: 1.15, legs: { hip: -4.2, gap: .78, stance: .22, ank: .62, w0: 1.0, w1: .82 }, shoeKind: 'trainer',
  C: BS_RC, POSE: BSR_POSE, face: bsrFace, torso: bsrTorso, head: bsrHead, rig: bsrRig, cuff: bsrCuff,
  sleeve: K => K.o.hoodie ? [K.C.hoodie, K.C.hoodieDk] : [K.C.shirt, K.C.shirtDk], trousers: K => [K.C.trousers, K.C.trousersDk],
  root(q, s, front) { const X = this.shX, Y = this.shY, c = q ? this.qx : 0; return front ? (q ? (s < 0 ? [c - X * .9, Y + .15] : [c + X * .95, Y + .45]) : [s * X * .98, Y + .1]) : (q ? [c + (s < 0 ? -X * .88 : X * .76), Y + .08] : [s * X * .94, Y + .08]); },
  mouthAt: q => q ? [1.72, -1.15] : [0, -1.15], headAt: q => q ? [.8, -3.0] : [0, -3.0],
};
function dario(x, y, u, o = {}) { bsFigure(BS_DARIO, x, y, u, o); }

// The red "denied" pop-up (V2c: a Claude Code permission prompt turned into the checkout): a red rounded square with a
// white cross drawn as two strokes (never a letter). (x, y) its centre, s its width (px); k 0..1 pops it in with an
// overshoot, a little spin and a burst of rays (k >= 1: settled). Riso prints it in the fluoro pink drum.
function bsDenied(x, y, s, k, key = 'bsdenied') {
  if (k <= 0) return;
  const sc = k >= 1 ? 1 : backOut(clamp(k / .6)), rot = .35 * (1 - easeOut(clamp(k / .6))), sw = clamp(s / 45, .6, 2.4), red = '#D8343F', redDk = '#9A1E2A';
  push(); translate(x, y);
  if (k < .75) {   // the burst: short rays flung out as it lands, gone by k = .75
    const b = seg(k, .08, .75), L0 = s * (.6 + .4 * b), L1 = L0 + s * .24 * Math.sin(Math.PI * b);
    if (L1 - L0 > 1) for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + .2; piece(strokeShape([[Math.cos(a) * L0, Math.sin(a) * L0], [Math.cos(a) * L1, Math.sin(a) * L1]], t => s * .055 * (1 - t * .6)), i % 2 ? '#F2CE7E' : red, { ink: null, key: key + 'ray' + i, lift: 1, flatCard: true }); }
  }
  rotate(rot); scale(Math.max(.01, sc));
  const h = s / 2, Sq = [];
  for (let j = 0; j < 44; j++) { const a = j / 44 * TAU, c = Math.cos(a), sn = Math.sin(a); Sq.push([h * Math.sign(c) * Math.pow(Math.abs(c), .4), h * Math.sign(sn) * Math.pow(Math.abs(sn), .4)]); }
  piece(Sq, red, { sw: sw * 1.2, shade: redDk, depth: s * .12, key: key + 'box', lift: s * .08, ...(STYLE.mode === 'xerox' && XEROX.process ? { spot: { channel: 'm', tone: .95 } } : {}) });
  for (const d of [-1, 1]) piece(strokeShape([[-h * .48, -h * .48 * d], [0, 0], [h * .48, h * .48 * d]], () => s * .15), '#FFFFFF', { ink: null, key: key + 'x' + d, lift: 2, flatCard: true });
  pop();
}

// ======================================================================================================================
// anchors
// ======================================================================================================================
const BS_WHO = { dorsey: BS_DORSEY, altman: BS_ALTMAN, turnbull: BS_TURNBULL, dario: BS_DARIO };
function bsAnchors(who, x, y, u, o = {}) {
  const B = who === 'altman' && inkRH() ? BS_ALTMAN_HY : BS_WHO[who], G = bsGeo(B, o), W2 = bsWorld(B, x, y, u, G.P.rig === 'ride' ? { ...o, dy: 0 } : o), q = G.q;
  const hx = (q ? B.hxq : 0) + clamp(o.lookX || 0, -1, 1) * .1 + (B === BS_DARIO ? bsShake(bsShakeK(o, G.P, mt(T))) * (q ? .42 : .38) : 0);   // (Dario's head follows the shake)
  const head = B.headAt(q), m = B.mouthAt(q), out = { head: W2([head[0] + hx, B.H0 + G.drop + head[1]]), mouth: W2([m[0] + hx, B.H0 + G.drop + m[1]]), R: W2(G.arms[1].tip), L: W2(G.arms[-1].tip) };
  const p = G.P.prop;
  if (p && p.kind === 'shears') { const tip = sg => [p.Pv[0] + Math.cos(p.a + sg * p.th / 2) * p.Lb, p.Pv[1] + G.drop + Math.sin(p.a + sg * p.th / 2) * p.Lb]; out.tip = W2(tip(0 * 1)); out.tipA = W2(tip(1)); out.tipB = W2(tip(-1)); out.pivot = W2([p.Pv[0], p.Pv[1] + G.drop]); }
  if (p && p.kind === 'mega') out.tip = W2([p.P0[0] + Math.cos(p.a) * 3.2 * p.sc, p.P0[1] + G.drop + Math.sin(p.a) * 3.2 * p.sc]);
  if (p && p.kind === 'pad') out.tip = W2([p.c[0], p.c[1] + G.drop]);
  const sl = G.P.rig === 'ride' ? (o.slope ?? -.3) : 0, fx = s => s * G.stance + (q ? G.cx0 : 0);
  out.feet = G.P.rig === 'ride' ? [-1, 1].map(s => W2([fx(s) * Math.cos(sl), fx(s) * Math.sin(sl)])) : [-1, 1].map(s => W2([s * (B.legs.gap + B.legs.stance), 0]));
  return out;
}

// ======================================================================================================================
// model sheets (reference only: labels allowed). ?look=ink|doodle|xerox|bank relooks all but bossLooks.
//   node render.mjs --page=demo/dev-bosses.html --loop=bosses --sheet=0.3 --cols=1 --w=1920 --out=out/demo/bosses/bosses.jpg
// ======================================================================================================================
(() => {
  const BS_LOOK = new URLSearchParams(location.search).get('look');
  const who = { dorsey, altman, turnbull, dario };
  // the share-price line Dorsey rides (V1e): straight under his feet, jagged either side
  const chart = (x, y, sl, u, fl) => {
    boilSeed('bschart' + x); const d = [Math.cos(sl) * fl, Math.sin(sl)], n = [-d[1] * fl, d[0] * fl];
    const P = [[-7, .9], [-5.6, -.5], [-4.2, .4], [-2.6, 0], [2.6, 0], [3.8, -.9], [5.0, .1], [6.6, -1.4]].map(([a, b]) => [x + (d[0] * a + n[0] * b) * u, y + (d[1] * a + n[1] * b) * u + .08 * u]);
    piece(ribbon(P.map(p => [p[0], p[1] + .12 * u]), .3 * u), '#2E8F6E', { sw: 1.2, key: 'bschartl', lift: 3 });
  };
  // Dario's "no" and its denied pop-up, in step: one shake every 1.6 s, the pop-up bursting out as it lands
  const denied = (tt, x, headY, u) => { const ph = frac(tt / 1.6) * 1.6; bsDenied(x, headY - 6.6 * u, 3.4 * u, seg(ph, .35, .9), 'bsdn' + Math.round(x)); };
  LOOPS.bosses = t => {
    if (BS_LOOK) look(BS_LOOK);
    const { label, stage, spot } = SHEET;
    stage(t); const tt = mt(t), snip = .5 + .5 * Math.sin(tt * TAU * 1.2);
    const rows = [
      [505, 22, [
        ['dorsey', 'front', 'idle', 'neutral', {}],
        ['dorsey', 'q', 'shears', 'smug', { snip }],
        ['dorsey', 'q', 'ride', 'happy', { flip: true, slope: -.3 }],
        ['altman', 'front', 'idle', 'neutral', {}],
        ['altman', 'q', 'lecture', 'determined', { gown: true, cap: true }],
        ['altman', 'q', 'shrug', 'confused', { flip: true }],
        ['dario', 'front', 'idle', 'happy', { mouth: 'grin' }],
        ['dario', 'q', 'fold', 'determined', {}],
      ]],
      [1010, 22, [
        ['altman', 'q', 'megaphone', 'angry', { mouth: 'shout' }],
        ['turnbull', 'front', 'idle', 'neutral', {}],
        ['turnbull', 'q', 'present', 'happy', {}],
        ['turnbull', 'q', 'thumbs', 'happy', { flip: true, mouth: 'grin' }],
        ['turnbull', 'front', 'offer', 'happy', { mouth: 'grin' }],
        ['dorsey', 'q', 'point', 'neutral', { beanie: true, flip: true }],
        ['dario', 'q', 'headshake', 'determined', { flip: true, mouth: 'frown' }],
        ['dario', 'front', 'fold', 'smug', { hoodie: true }],
      ]],
    ];
    let n = 0;
    for (const [gy, u, row] of rows) row.forEach(([w, v, p, e, extra], i) => {
      const x = 125 + i * 238; spot(x, gy - 200, 300);
      if (p === 'ride') chart(x, gy, extra.slope ?? -.3, u * BS_DORSEY.S, extra.flip ? -1 : 1);
      const o = { ...feel(e, tt, { seed: n }), view: v, pose: p, seed: n, boilKey: 'bss' + n, ...extra };
      who[w](x, gy, u, o);
      if (p === 'headshake') denied(tt, x, bsAnchors(w, x, gy, u, o).head[1], u);
      label(`${w} · ${v}${extra.flip ? ' flip' : ''} · ${p}${extra.hoodie ? ' · hoodie' : ''}`, x, gy + 28, 14); n++;
    });
  };
  LOOPS.bosses.len = 4;
  // big close-ups: one row per boss (the heads alone, layer 'head'), front and 3/4 alternating
  LOOPS.bossFaces = t => {
    if (BS_LOOK) look(BS_LOOK);
    const { label, stage, spot } = SHEET;
    stage(t); const tt = mt(t);
    const faces = [['neutral', 'neutral', {}], ['grin', 'happy', { mouth: 'grin' }], ['laugh', 'laugh', {}], ['smug', 'smug', {}], ['surprised', 'surprised', {}], ['angry', 'angry', {}]];
    [['altman', 34, 222], ['turnbull', 34, 492], ['dario', 31, 776], ['dorsey', 30, 1020]].forEach(([w, u, chinY], r) => {
      const B = BS_WHO[w];
      faces.forEach(([name, e, ex], i) => {
        const x = 165 + i * 318, v = i % 2 ? 'q' : 'front';
        spot(x, chinY - 120, 170);
        who[w](x - (v === 'q' ? .5 * u : 0), chinY - B.H0 * B.S * u, u, { ...feel(e, tt, { seed: i }), ...ex, view: v, layer: 'head', seed: i + r * 7, boilKey: 'bsf' + r + i, noShadow: true });
        if (r === 0) label(name, x, 24, 18);
      });
    });
  };
  LOOPS.bossFaces.len = 4;
  // every pose of every boss (alternating views), seated behind a table stub, the hold props, the denied pop-up, and
  // bsAnchors' points as dots (head, mouth, wrists, the prop's tip, feet)
  LOOPS.bossPoses = t => {
    if (BS_LOOK) look(BS_LOOK);
    const { label, stage } = SHEET;
    stage(t); const tt = mt(t), u = 14.5, snip = .5 + .5 * Math.sin(tt * TAU * 1.2);
    const rows = [
      ['dorsey', 240, [['idle', {}], ['point', {}], ['namaste', { eyes: 'closed' }], ['shears', { snip }], ['ride', { slope: -.35 }], ['table', { seated: true }], ['idle', { holdL: s => bsShears(s, snip), beanie: true }]]],
      ['altman', 500, [['idle', {}], ['lecture', { gown: true, cap: true }], ['point', {}], ['shrug', {}], ['megaphone', { mouth: 'shout' }], ['table', { seated: true }], ['idle', { hold: s => bsMegaphone(s) }]]],
      ['turnbull', 760, [['idle', {}], ['present', {}], ['thumbs', { mouth: 'grin' }], ['point', {}], ['offer', { mouth: 'grin' }], ['table', { seated: true }], ['idle', { hold: s => bsController(s) }]]],
      ['dario', 1025, [['idle', {}], ['fold', {}], ['headshake', { mouth: 'frown' }], ['point', {}], ['present', { mouth: 'grin' }], ['table', { seated: true }], ['fold', { hoodie: true }]]],
    ];
    rows.forEach(([w, gy, list], r) => list.forEach(([p, extra], i) => {
      const x = 130 + i * 276, v = i % 2 ? 'q' : 'front', B = BS_WHO[w], o = { ...feel(p === 'table' ? 'happy' : 'neutral', tt, { seed: i }), dy: 0, view: v, pose: p, seed: i, boilKey: 'bsp' + r + i, ...extra };
      if (extra.seated) {
        const ty = gy + (B.legs.hip - .45) * B.S * u;
        who[w](x, gy, u, { ...o, layer: 'back', noShadow: true });
        boilSeed('bsptable' + r); piece([[x - 110, ty], [x + 110, ty], [x + 110, gy + 4], [x - 110, gy + 4]], '#D8CFBF', { sw: 1.6, key: 'bspt' + r, lift: 4 });
        who[w](x, gy, u, { ...o, layer: 'front' });
      } else who[w](x, gy, u, o);
      const A = bsAnchors(w, x, gy, u, o);
      if (p === 'headshake') bsDenied(x + 4.2 * u, A.head[1] - 3.2 * u, 2.4 * u, seg(frac(tt / 1.6) * 1.6, .35, .9), 'bspdn');
      boilSeed('bspa' + r + i);
      for (const k of ['head', 'mouth', 'R', 'L', 'tip']) if (A[k]) _paint(oval(A[k][0], A[k][1], 3.5, 3.5, 0, 10), { wash: k === 'tip' ? '#1E7FD0' : '#E0303A', ink: null });
      for (const f of A.feet) _paint(oval(f[0], f[1], 3, 3, 0, 10), { wash: '#20A040', ink: null });
      label(`${p} · ${v}${extra.hoodie ? ' · hoodie' : ''}`, x, gy + 20, 14);
    }));
  };
  LOOPS.bossPoses.len = 4;
  // acting beats for each boss's scenes, through bsPoses blends and emotions(): Dorsey (V1e) snips then rides; Altman
  // lectures (V3d), shouts through the megaphone (V3a), shrugs; Turnbull (V1g) presents, offers the controller, thumbs up;
  // Dario (V2c) folds his arms, shakes his head once, and the denied pop-up bursts out over him
  LOOPS.bossActing = t => {
    if (BS_LOOK) look(BS_LOOK);
    const { label, stage, spot } = SHEET;
    stage(t); const tt = mt(t), u = 27;
    const beats = [
      ['dorsey', 'q', [[0, 'idle'], [.7, 'shears'], [2.5, 'ride']], [[0, 'neutral'], [.7, 'smug'], [2.5, 'happy']], { snip: .5 + .5 * Math.sin(tt * TAU * 2), slope: -.3 * seg(tt, 2.5, 2.8) }],
      ['altman', 'q', [[0, 'idle'], [.6, 'lecture'], [1.8, 'megaphone'], [3.1, 'shrug']], [[0, 'neutral'], [.6, 'determined'], [1.8, 'angry', { mouth: 'shout' }], [3.1, 'confused']], { gown: tt < 1.8, cap: tt < 1.8 }],
      ['turnbull', 'front', [[0, 'idle'], [.6, 'present'], [1.6, 'offer'], [2.8, 'thumbs']], [[0, 'neutral'], [.6, 'happy'], [1.6, 'happy', { mouth: 'grin' }], [2.8, 'excited', { mouth: 'grin' }]], {}],
      ['dario', 'q', [[0, 'idle'], [.5, 'fold']], [[0, 'happy'], [.5, 'neutral'], [1.3, 'determined', { mouth: 'frown' }], [2.9, 'smug']], { flip: true, shakeAt: 1.35 }],
    ];
    beats.forEach(([w, v, poses, emo, extra], i) => {
      const x = 250 + i * 470; spot(x, 520, 420);
      const o = { ...emotions(tt, emo), view: v, pose: bsPoses(tt, poses), seed: i, boilKey: 'bsa' + i, ...extra };
      who[w](x, 905, u, o);
      if (w === 'dario') bsDenied(x, bsAnchors(w, x, 905, u, o).head[1] - 6.6 * u, 3.4 * u, seg(tt, 1.75, 2.3), 'bsadn');
      label(w, x, 950, 20);
    });
  };
  LOOPS.bossActing.len = 4;
  // one row per look (card, ink, doodle, riso, banknote): each boss full length and as a bust
  LOOPS.bossLooks = t => {
    const tt = mt(t), rows = ['card', 'ink', 'doodle', 'xerox', 'bank'], h = H / rows.length;
    rows.forEach((lk, r) => {
      look(lk); const y0 = r * h, R = [[-60, y0], [W + 60, y0], [W + 60, y0 + h], [-60, y0 + h]];
      boilSeed('bslk' + r);
      if (lk === 'card') { paint(R, { wash: '#8E8A84', ink: null }); piece(U([[0, y0 + 2], [W, y0 + 2], [W, y0 + h - 2], [0, y0 + h - 2]], 1), '#B9B2A6', { key: 'bslkbd', lift: 0 }); }
      else if (lk === 'ink') paint(R, { wash: NOIR.char, ink: null });
      else if (lk === 'doodle') { _paint(R, { wash: '#FBF8F0', ink: null }); for (let yy = y0 + 20; yy < y0 + h; yy += 40) for (let xx = -20; xx < W + 20; xx += 400) _inkLine([[xx, yy], [xx + 410, yy + .3]], .6, '#9DB7DC', 'rotring', 0); }
      else if (lk === 'xerox') { _paint(R, { wash: '#FFFFFF', ink: null }); _paint(R, { wash: XEROX.paper, ink: null }); }
      else bankPaper(-60, y0, W + 120, h);
      const e = ['neutral', 'happy', 'smug', 'determined'];
      [['dorsey', { pose: 'shears', snip: .6, view: 'q' }], ['altman', { pose: 'lecture', view: 'q', gown: true, cap: true }], ['turnbull', { pose: 'offer', view: 'front', mouth: 'grin' }], ['dario', { pose: 'fold', view: 'q', mouth: 'frown' }]].forEach(([w, extra], i) => {
        const B = BS_WHO[w], x = 110 + i * 475, gy = y0 + h - 12, u = 12.5;
        who[w](x, gy, u, { ...feel(e[i], tt, { seed: i }), ...extra, seed: i, boilKey: 'bsl' + r + i });
        const ub = 19, v = i % 2 ? 'front' : 'q';
        who[w](x + 240, y0 + 26 - B.top * B.S * ub, ub, { ...feel(e[i], tt, { seed: i + 3 }), view: v, layer: 'head', seed: i + 3, boilKey: 'bslh' + r + i, beanie: false });
        if (w === 'dario') bsDenied(x + 150, y0 + 60, 50, 1, 'bsldn' + r);
      });
      look(LOOK_DEFAULT);
    });
  };
  LOOPS.bossLooks.len = 4;
})();

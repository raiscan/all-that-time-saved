// cast/bots.js: two AI-assistant mascots for the bunker. Our own parody takes, not the companies' artwork.
//
//   grok(x, y, u, o)  after Grok's current look: a white sphere with two black coin-slot eyes, as a rubber-hose bot ~8.2u
//                     tall. The sphere is the body: noodle limbs, big shoes, white gloves, a bow tie, and a little exhaust
//                     pipe on its back that puffs smoke on every beat ("Elon's cloud has a tailpipe"). Every feeling is in
//                     the two slots (plus a small mouth only when a mood needs one).
//   muse(x, y, u, o)  after Meta's Muse and its default companion Jolly (the "Jollybot"): a cream, fluffy plush in a hooded
//                     onesie, roly-poly as a dumpling (~6.6u from its hood to its dangling feet), a smooth pale-peach face in
//                     the hood (beady black eyes, a small smile, rosy blush), stubby rounded arms, short chunky legs under a
//                     round bottom. It floats where it's needed, feet dangling.
//   museCharm(x, y, s, o)  her own Muse: the Muse Charm, a black glossy squircle puck, Jolly small on its screen (typing,
//                     cheering, drooping) until it hops out of the glass (o.out). See the Muse section.
//   bottle(s, tilt, pour, o)  a champagne bottle as a hold prop, pouring a stream that falls straight down.
//
// (x, y) = the ground point under the character (muse with wrist: true: the centre of the device). u = unit, the same
// as the commuter's, so sizes compare directly. Both take feel()/emotions() spreads (dx, dy, sq, take, rot, eyes, mouth,
// lookX/Y, squint, blush, gloom, tint, emote, emoteK, emoteAge, aL/aR for the idle arms) plus:
//   view 'front' | 'q' (3/4, facing right) · flip (face left) · pose (a name from GPOSE / MPOSE, or { L, R } hand targets
//   [x, y, bend, hand pose, front] in u) · hold / holdL (s => draws a prop in the right / left hand) · tilt (head, rad)
//   · boilKey · seed (blink timing) · t (the clock for the bounce, smoke and propeller; default mt(T))
//   · bounce: a number asks for the full rubber-hose bounce on every beat, that size (dances, the rave; 0 = still). Left
//     out, a bot doesn't hop on every beat: small accents on bar downbeats and its own idle business (Grok's hands at
//     work, Muse's hover drift), on clocks of their own (clawd.js botGroove) · noShadow
// grok also: walk (phase, the legs step) · tie (bow tie under its face, default true) · smoke (default true) · bottleTilt,
//   pour, pourTo (the bottle in the 'pour' pose: bottleTilt rad relative to the character, 0 = neck up, default 2.1 =
//   pouring forward; pour 0..1, default 1; pourTo = the y, in the caller's coordinates, where the stream ends, e.g. a
//   flute's rim) · tray ('canapes' | 'bill' | 'flutes', on the palm in 'serve')
//   poses: idle pour serve wave laugh hips shrug point · eyes: every kit eye name (GSLOT) · a mouth shows only for the
//   moods that need one (GMOUTH); smile / grin / cat / flat are said by the slots alone
// muse also: alt (the float: u from the ground to the bottom of its old egg, default 3.2; the body's middle is alt + 2.5 u
//   up, its feet about alt - .8) · view 'back' too · tray ('canapes' | 'bill' | 'flutes' | 'empty'; poses 'tray' (balanced
//   on one hand) and 'serve' (held in front with both)) · type (on the Charm: taps at the keyboard; default while its mood
//   is happy, determined, neutral or thinking; the Charm's) · float (false: no drift) · poses: idle tray serve wave point cheer
//   (charm: true, or the old wrist: true, draws the Charm instead: museCharm(x, y, 3.2u, o))
// Both return anchors in the caller's coordinates (px): { head, hands: { L, R }, bottle: { mouth, end } | null,
//   tray | null, top }, so a shot can put a flute under the stream or a bill on the tray.
const GK = {
  col: '#EFEFEB', mid: '#CDD2DA', dk: '#A7AEBA', lt: '#FFFFFF', slot: '#131317', glint: '#FFFFFF', limb: '#858C98', limbDk: '#5D636E',
  mouth: '#2A1A22', tongue: '#E0527E', tooth: '#F4EEE4', eye: '#F6F1E6', cheek: '#F4B3C5', tear: '#8EC3E6', heart: '#E2476E',
  tie: '#231C2A', tieLt: '#4A3F55', shoe: '#2F2735', shoeLt: '#6E6276', sole: '#4B4252', pipe: '#A9AFB8', pipeDk: '#5E646E', pipeLt: '#E6EAEE',
  smoke: '#9C95A2', smokeDk: '#6F6876', smokeCard: '#A7A0A6',
};
const MU = {
  fur: '#EFE3CB', furDk: '#D4C19F', furLt: '#FBF6EC', tuft: '#C7B08A', face: '#FAE8D9', faceDk: '#ECCFB9', cheek: '#F0969E',
  eye: '#1B1517', mouth: '#5A2331', tongue: '#E8707E', tooth: '#FFF9F0', heart: '#E2476E', tear: '#8EC3E6', shoe: '#2F2735', pad: '#E4D2B4',
  charm: '#2F6FE0', charmDk: '#1C47A0', charmLt: '#8DB3F6', slot: '#142348', kbd: '#3A3844', kbdDk: '#24222A', key: '#D9D3C8', keyLit: '#FFF1B8',
  strap: '#2B3248', strapDk: '#1B2030', strapLt: '#4A5572', tray: '#CDD3DC', trayDk: '#8D95A3', trayLt: '#F4F7FA',
};

// ---------- helpers ----------
// The current model matrix as a 2D affine [a, b, c, d, e, f] (x' = a·x + c·y + e, y' = b·x + d·y + f). Used to hand back
// anchor points in the caller's coordinates and to let a pouring stream fall straight down whatever the hand is doing.
function btMat() {
  try { const m = p5.instance._renderer.states.uModelMatrix.mat4; return [m[0], m[1], m[4], m[5], m[12], m[13]]; }
  catch (e) { return [1, 0, 0, 1, 0, 0]; }
}
const btApply = (M, p) => [M[0] * p[0] + M[2] * p[1] + M[4], M[1] * p[0] + M[3] * p[1] + M[5]];
function btInv(M) { const [a, b, c, d, e, f] = M, det = a * d - b * c || 1e-9; return [d / det, -b / det, -c / det, a / det, (c * f - d * e) / det, (b * e - a * f) / det]; }
const btTo = (M0, p) => btApply(btInv(M0), btApply(btMat(), p));   // a local point, in the frame whose matrix was M0
// Down (the +y of frame M0, or of the screen) as a unit vector in the current local coordinates.
function btDown(M0) {
  const [a, b, c, d] = btMat(), [c0, d0] = M0 ? [M0[2], M0[3]] : [0, 1], det = a * d - b * c || 1e-9;
  const x = (d * c0 - c * d0) / det, y = (a * d0 - b * c0) / det, L = Math.hypot(x, y) || 1;
  return [x / L, y / L];
}
// Undo the rotation (and mirror) added since frame Mc was captured, so a held prop can stand upright in the character.
function btUpright(Mc) {
  const [a, b, c, d] = btMat(), [ia, ib, ic, id] = btInv(Mc), ra = ia * a + ic * b, rb = ib * a + id * b, rc = ia * c + ic * d, rd = ib * c + id * d;
  if (ra * rd - rb * rc < 0) scale(1, -1);
  rotate(-Math.atan2(rb, ra));
}
const btT = o => o.t ?? mt(T);
// The rubber-hose bounce, locked to the beat: the body sinks and squashes on each beat, rises between beats, stretching
// on the way up and down and round at the top, and leans to alternate sides on alternate beats. (The rigs now take their
// musicality from clawd.js botGroove, which gives this only when a shot passes o.bounce.)
function btBounce(t, amt = 1) {
  const bp = bpOf(t), f = frac(bp), hit = pulse(t, 7);
  return { bp, f, hit, up: amt * (.5 - .5 * Math.cos(f * TAU)), sq: amt * (.13 * hit - .055 * Math.abs(Math.sin(f * TAU))), lean: amt * .055 * Math.sin(bp * Math.PI) };
}
// Mood tints shift a palette a little (angry flushes, sad goes blue).
function btTint(P, o, k0 = .28) {
  const tc = o.tint && (TINT[o.tint] || o.tint), k = clamp(o.tintK ?? 1) * k0;
  if (!tc || k <= 0) return P;
  const R = { ...P }; for (const f of ['col', 'dk', 'lt', 'screen']) if (P[f]) R[f] = mixCol(P[f], tc, f === 'screen' ? k * 1.4 : k);
  return R;
}
// Which eye kinds to draw ([left, right]), with blinks and the squint of an acted emotion change folded in.
function btEyeKinds(o, tt, seed) {
  const k = Array.isArray(o.eyes) ? o.eyes : o.eyes === 'wink' ? ['happy', 'normal'] : [o.eyes || 'normal', o.eyes || 'normal'];
  const blink = ((tt * .9 + seed * 1.7) % 3.3) < .1, sqz = clamp(o.squint || 0);
  return k.map(e => ({ kind: e, blink: blink && ['normal', 'look', 'wide', 'shine', 'dot', 'blank'].includes(e), sqz }));
}
// A closed ribbon along a path (a thick drawn stroke as a piece: happy-eye arcs, antenna stalks, pipes).
const btStroke = (P, w0, w1 = w0) => ribbon(P, w0, w1);
// A brush-stroke line as a piece, fat in the middle and thin at the ends (mouth lines: bold in both looks, where a
// dline would be a faint pencil line on card).
function btTaper(P, w) {
  const C = through(P, 8), n = C.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = C[Math.max(0, i - 1)], b = C[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, k = i / (n - 1), ww = w * (.3 + .7 * Math.sin(Math.PI * k)) / 2;
    L.push([C[i][0] - dy / d * ww, C[i][1] + dx / d * ww]); R.push([C[i][0] + dy / d * ww, C[i][1] - dx / d * ww]);
  }
  return L.concat(R.reverse());
}
// A rounded "squircle" (screens): half sizes hw × hh, p = squareness (2 = ellipse).
function btSquircle(cx, cy, hw, hh, p = 4, n = 44) {
  const out = []; for (let i = 0; i < n; i++) { const a = i / n * TAU, c = Math.cos(a), s = Math.sin(a); out.push([cx + hw * Math.sign(c) * Math.pow(Math.abs(c), 2 / p), cy + hh * Math.sign(s) * Math.pow(Math.abs(s), 2 / p)]); }
  return out;
}
// A puff of smoke: the outline of a round cloud made of a big ball and three smaller ones (a cartoon puff).
function btPuff(cx, cy, r, seed) {
  const balls = [[0, 0, 1]]; for (let i = 0; i < 3; i++) { const a = seed + i * 2.1 + .4 * Math.sin(seed * 3 + i); balls.push([Math.cos(a) * .62, Math.sin(a) * .5, .52 + .07 * Math.sin(seed + i * 1.7)]); }
  const P = [];
  for (let i = 0; i < 40; i++) {
    const a = i / 40 * TAU, ux = Math.cos(a), uy = Math.sin(a); let d = 0;
    for (const [bx, by, br] of balls) { const b = bx * ux + by * uy, c = bx * bx + by * by - br * br, D = b * b - c; if (D >= 0) d = Math.max(d, b + Math.sqrt(D)); }
    P.push([cx + ux * d * r, cy + uy * d * r * .9]);
  }
  return P;
}

// ---------- props ----------
// bottle(s, tilt, pour, o): a champagne bottle, drawn around (0, 0) = where the hand grips it, its neck pointing up the
// local -y and turned by tilt (rad; + turns the neck toward +x; ~2.1 = pouring forward and down). s ≈ the hand size.
// Inside a hand's hold callback, straighten up first (grok() does) so tilt is relative to the character, not the hand.
// pour 0..1: the stream runs out of the neck and reaches its full length by 0.5, then thickens. It always falls straight
// down (the screen's down, or o.frame's: a matrix from btMat()). o: len (stream length px, default 2.2s), toY (instead of
// len: end the stream at this y in o.frame's coordinates), key. Returns { mouth, end } (in o.frame's coordinates if given).
function bottle(s, tilt = 0, pour = 0, o = {}) {
  const sw = clamp(s / 22, .5, 1.8), k = o.key || 'bottle', F = o.frame || null, loc = p => F ? btTo(F, p) : p;
  push(); rotate(tilt); translate(0, -.5 * s);
  const S = P => U(P, s);
  const glass = curvy(S([[-.34, .98], [0, 1.02], [.34, .98], [.4, .5], [.4, -.25], [.34, -.62], [.2, -.9], [.13, -1.12], [.13, -1.6], [.16, -1.66], [.16, -1.84], [0, -1.87], [-.16, -1.84], [-.16, -1.66], [-.13, -1.6], [-.13, -1.12], [-.2, -.9], [-.34, -.62], [-.4, -.25], [-.4, .5]]), 3);
  piece(glass, '#2F6A48', { sw, shade: '#1B3D2A', depth: s * .16, key: k + 'glass', lift: 3 });
  piece(curvy(S([[-.2, -.9], [.2, -.9], [.13, -1.12], [.13, -1.6], [.16, -1.66], [.16, -1.84], [0, -1.87], [-.16, -1.84], [-.16, -1.66], [-.13, -1.6], [-.13, -1.12]]), 2), '#D6B04E', { sw: sw * .8, shade: '#9A7628', depth: s * .06, key: k + 'foil', lift: 1, flatCard: true });
  piece(curvy(S([[-.33, -.22], [.33, -.22], [.34, .42], [-.34, .42]]), 2), NOIR.cream, { sw: sw * .7, key: k + 'label', lift: 1, flatCard: true });
  piece(oval(0, .1 * s, .13 * s, .13 * s, 0, 12), NOIR.red, { ink: null, key: k + 'seal', lift: 0, flatCard: true });
  dline(S([[-.28, -.14], [.28, -.14]]), sw * .5, '#B8963E');
  dline(S([[-.28, .34], [.28, .34]]), sw * .5, '#B8963E');
  dline(S([[-.27, .82], [-.3, .5], [-.3, -.5], [-.2, -.78]]), sw * .9, '#9FD2B2', .5);   // glass highlight
  const mouth = [0, -1.9 * s];
  let res = { mouth: loc(mouth), end: loc(mouth) };
  if (pour > .01) {
    const dn = btDown(F), nk = [0, -1], a = .45 * s, reach = ease(clamp(pour * 2)), thick = lerp(.55, 1, clamp(pour * 2 - 1));
    let len = o.len ?? 2.2 * s;
    if (o.toY != null && F) { const e0 = btTo(F, [mouth[0] + nk[0] * a, mouth[1] + nk[1] * a]), e1 = btTo(F, [mouth[0] + nk[0] * a + dn[0], mouth[1] + nk[1] * a + dn[1]]); len = Math.max(.4 * s, (o.toY - e0[1]) / Math.max(.05, e1[1] - e0[1])); }
    const P = []; for (let i = 0; i <= 10; i++) { const kk = i / 10 * reach; P.push([mouth[0] + nk[0] * a * kk + dn[0] * len * kk * kk, mouth[1] + nk[1] * a * kk + dn[1] * len * kk * kk]); }
    piece(btStroke(P, .17 * s * thick, .11 * s * thick), '#F2D27A', { sw: sw * .6, key: k + 'stream', lift: 1, flatCard: true });
    dline(P.slice(1, 8).map(([px, py]) => [px - dn[1] * .03 * s, py + dn[0] * .03 * s]), sw * .5, '#FFF4C8', .5);
    for (let i = 0; i < 3; i++) { const f2 = frac(T * 2.2 + i / 3) * reach, j = Math.min(10, Math.round(f2 * 10)); if (j < 1) continue; piece(oval(P[j][0], P[j][1], .035 * s, .035 * s, 0, 6), '#FFF8DC', { ink: null, key: k + 'bub' + i, lift: 0, flatCard: true }); }
    const end = P[P.length - 1];
    if (reach > .98) for (let i = 0; i < 3; i++) { const ph = frac(T * 3 + i / 3), dx = (i - 1) * .22 * s * ph; piece(oval(end[0] + dx - dn[1] * dx, end[1] - .25 * s * Math.sin(ph * Math.PI), .045 * s, .045 * s, 0, 6), '#F7E09A', { ink: null, key: k + 'spl' + i, lift: 0, flatCard: true }); }
    res = { mouth: loc(mouth), end: loc(end) };
  }
  pop();
  return res;
}
// A silver tray seen a little from above, centred (cx, cy), w wide, with 'canapes', 'bill', 'flutes' or nothing on it.
function btTray(cx, cy, w, what, sw, key = 'tray') {
  const h = w * .3;
  piece(oval(cx, cy + h * .08, w * .5, h * .56, 0, 32), MU.tray, { sw: sw * .8, shade: MU.trayDk, depth: h * .22, key: key + 'rim', lift: 3 });
  piece(oval(cx + w * .01, cy + h * .02, w * .43, h * .38, 0, 32), mixCol(MU.tray, MU.trayDk, .35), { ink: null, key: key + 'top', lift: 0, flatCard: true });
  dline(oval(cx, cy + h * .08, w * .47, h * .5, 0, 32).slice(17, 27), sw * .7, MU.trayLt, .5);
  if (what === 'canapes') {
    const C = [[-.22, -.02, '#E98A6A', '#1E1A1C'], [.2, -.06, '#7E9C4C', '#F2E6C8'], [0, .12, '#F1E4C6', '#E0527E']];
    for (const [ix, iy, top, dot] of C) {
      const bx = cx + ix * w, by = cy + iy * h;
      piece(oval(bx, by, w * .1, h * .2, 0, 14), '#D8B272', { sw: sw * .4, shade: '#A98546', depth: h * .08, key: key + 'cr' + ix, lift: 1, flatCard: true });
      piece(oval(bx, by - h * .07, w * .065, h * .13, 0, 12), top, { sw: sw * .35, key: key + 'tp' + ix, lift: 1, flatCard: true });
      piece(oval(bx + w * .01, by - h * .12, w * .018, h * .045, 0, 8), dot, { ink: null, key: key + 'dt' + ix, lift: 0, flatCard: true });
    }
  } else if (what === 'bill') bill(cx + w * .04, cy - h * .5, w * .3, -.14, 0, 0, key + 'bill');
  else if (what === 'flutes') for (const fx of [-.16, .16]) { const s = w * .13; push(); translate(cx + fx * w, cy - 1.38 * s + h * .05); rotate(Math.PI / 2); flute(s, .75, 0, key + 'fl' + fx); pop(); }
}

// ---------- Grok ----------
// After Grok's current look: a white sphere with two black coin-slot eyes. Our rubber-hose take: the sphere IS the body
// (radius GR, its top ~8.2u up), with noodle arms and legs straight out of it, big shoes, white gloves, a bow tie under
// its face, and a small chrome exhaust on its back that puffs a cloud on every beat. Its whole face is the two slots (and a
// small mouth only when a mood needs one): they squash, stretch, tilt, bend and narrow for every emotion. A sincere
// helper: its idle reads keen and busy, and 'mischief' reads as playful focus on the job, never as scheming.
const GR = 2.9, GCY = -5.3;   // the sphere's radius and the height of its centre (u)
// Hand targets (u, from the ground point, before the flip): [x, y, bend, hand pose, front]. 'idle' swings the arms from
// o.aL / o.aR (the kit's arm angles), so feel() and emotions() move them, with a busy little alternating pump on the beat.
const GPOSE = {
  pour:  { L: [-2.25, -3.25, .75, 'fist'], R: [3.45, -4.25, .2, 'hold', 1] },
  serve: { L: [-2.0, -4.3, .3, 'none'], R: [3.1, -4.25, .3, 'open', 1] },
  wave:  { L: [-3.2, -2.8, .22, 'relax'], R: [3.55, -7.6, .28, 'open', 1] },
  laugh: { L: [-.95, -3.35, .45, 'relax', 1], R: [.95, -3.35, .45, 'relax', 1] },
  hips:  { L: [-2.25, -3.25, .75, 'fist'], R: [2.25, -3.25, .75, 'fist'] },
  shrug: { L: [-3.5, -5.7, .4, 'open'], R: [3.5, -5.7, .4, 'open'] },
  point: { L: [-3.2, -2.8, .22, 'relax'], R: [3.9, -5.9, .15, 'point', 1] },
};
// The coin-slot eyes, per eye kind: h / w (the slot's height and width, x the neutral slot) · cut (0..1 of its height: a
// lid cuts the top off flat: focused, sleepy) · slant (+ the cut dips at the inner corner: cross, determined; - it dips at
// the outer corner: sad) · tilt (rad, + leans the tops apart: droopy) · lift (0..1: the bottom pushed up in an arch, a
// smiling squint) · arc 'up' | 'down' (the slot bent into a ∩ happy / ∪ shut) · chevron (> <) · x · heart · star ·
// shine · swirl · shades · tear · shake
const GSLOT = {
  normal: { h: 1.04 }, look: {}, wide: { h: 1.32, w: 1.14 }, scared: { h: 1.3, w: .8, shake: 1 }, blank: { h: .46, w: .95 }, dot: { h: .5 },
  happy: { arc: 'up' }, closed: { arc: 'down' }, sleepy: { cut: .56, h: .9 }, narrow: { cut: .4, lift: .14, h: 1.02 },
  determined: { cut: .3, slant: .38 }, angry: { cut: .34, slant: .62 }, red: { cut: .34, slant: .62 },
  sad: { cut: .22, slant: -.6, tilt: .17, h: .92 }, teary: { cut: .2, slant: -.55, tilt: .15, h: .94, tear: 1 }, cry: { chevron: 1, tear: 1 },
  squeeze: { chevron: 1 }, x: { x: 1 }, swirl: { swirl: 1 }, heart: { heart: 1 }, spark: { star: 1, h: 1.12 }, shine: { h: 1.16, w: 1.1, shine: 1 },
  shades: { shades: 1 },
};
const GMOUTH = ['laugh', 'open', 'O', 'o', 'shout', 'wail', 'yawn', 'frown', 'wobble', 'teeth', 'grimace', 'tongue', 'pout', 'sigh', 'smirk'];
// Solid shapes (no outline) in the looks that print solid ink; an outlined shape in the drawn ones.
const btSolid = () => STYLE.mode === 'ink' || STYLE.card || STYLE.mode === 'xerox';
// A dark face feature (the slots, the mouth): in the banknote look it prints as solid note ink with its engraved edge
// (fine line shading alone leaves a small dark shape pale, and the face must read at a glance), elsewhere a piece.
function btDark(P, col, o) {
  if (STYLE.mode === 'doodle' && lum(col) < .3) { biroFill(P, BIRO); return; }   // filled in with the pen, like the rest of the doodle
  if (STYLE.mode === 'bank') { _paint(P, { wash: mixCol(BANK.ink, col, .2), washOp: 255, ink: null }); edgeLine(P, o.sw ?? 1, BANK.ink, true); return; }
  piece(P, col, o);
}

// One coin-slot eye at (x, y): w × h the neutral slot. side -1 = the screen-left eye, 1 = the screen-right one.
function btSlotEye(x, y, w, h, side, spec, o) {
  const E = { ...(GSLOT[spec.kind] || {}) }, sw = o.sw, k = o.key, dark = GK.slot, solid = btSolid();
  const put = (P, col = dark, kk = 'p', lift = 1) => btDark(P, col, { ink: solid ? null : NOIR.ink, sw: sw * .5, key: k + kk, lift, flatCard: true });
  const line = (P, wd, kk) => put(strokeShape(P, () => wd, 10), dark, kk);
  const sqz = spec.blink ? 1 : clamp(spec.sqz || 0);
  push(); translate(x + (E.shake ? Math.sin(o.t * 60 + side) * w * .08 : 0), y);
  if (E.arc || E.chevron || E.x || E.swirl) {
    const s = h * .5;
    if (E.arc === 'up') line([[-s * .72, s * .2], [-s * .4, -s * .2], [0, -s * .32], [s * .4, -s * .2], [s * .72, s * .2]], w * .56, 'u');
    else if (E.arc === 'down') line([[-s * .7, -s * .1], [-s * .38, s * .14], [0, s * .2], [s * .38, s * .14], [s * .7, -s * .1]], w * .46, 'd');
    else if (E.chevron) line([[-s * .5 * -side, -s * .52], [s * .38 * -side, 0], [-s * .5 * -side, s * .52]], w * .46, 'c');
    else if (E.x) for (const d of [-1, 1]) line([[-s * .45, -s * .45 * d], [s * .45, s * .45 * d]], w * .4, 'x' + d);
    else { const sp = []; for (let i = 0; i < 18; i++) { const a = i * .72 + o.t * 6 * side, r = i / 18 * s * .62; sp.push([Math.cos(a) * r, Math.sin(a) * r * 1.3]); } dline(sp, sw * .9, dark, .6); }
    if (E.tear) piece(curvy([[s * .1 * -side, s * .45], [s * .42 * -side, s * 1.15], [s * .1 * -side, s * 1.42], [-s * .2 * -side, s * 1.12]], 4), GK.tear, { sw: sw * .5, key: k + 'tr', lift: 1, flatCard: true });
    pop(); return;
  }
  if (E.heart) { piece(heartPts(0, 0, w * 1.02 * (1 + .1 * pulse(o.t))), GK.heart, { ink: solid ? null : NOIR.ink, sw: sw * .5, key: k + 'ht', lift: 1, flatCard: true }); pop(); return; }
  // the slot: a capsule, squashed toward a short flat pill by a squint or a blink, cut by the lid, lifted by the cheek
  const W0 = w * (E.w ?? 1) * lerp(1, 1.5, sqz), H0 = h * (E.h ?? 1) * lerp(1, 0, sqz) + w * .42 * sqz, a = W0 / 2, b = H0 / 2;
  const P = [], r0 = Math.min(a, b);   // a capsule: upright (a slot) or, squashed past round, lying flat (a blink)
  if (b >= a) { for (let i = 0; i <= 20; i++) { const t = Math.PI + i / 20 * Math.PI; P.push([Math.cos(t) * r0, -(b - r0) + Math.sin(t) * r0]); } for (let i = 0; i <= 20; i++) { const t = i / 20 * Math.PI; P.push([Math.cos(t) * r0, (b - r0) + Math.sin(t) * r0]); } }
  else { for (let i = 0; i <= 20; i++) { const t = -Math.PI / 2 + i / 20 * Math.PI; P.push([(a - r0) + Math.cos(t) * r0, Math.sin(t) * r0]); } for (let i = 0; i <= 20; i++) { const t = Math.PI / 2 + i / 20 * Math.PI; P.push([-(a - r0) + Math.cos(t) * r0, Math.sin(t) * r0]); } }
  const cut = clamp((E.cut || 0) * (1 - sqz), 0, .8), sl = (E.slant || 0) * (1 - sqz), lift = (E.lift || 0) * (1 - sqz);
  const top = xx => -b + cut * 2 * b + sl * .3 * 2 * b * (xx * -side / a), bot = xx => b - lift * 2 * b * Math.sqrt(Math.max(0, 1 - (xx / a) ** 2));
  const tl = (E.tilt || 0) * side * (1 - sqz), ct = Math.cos(tl), st = Math.sin(tl);
  const Q = P.map(([px, py]) => { const yy = clamp(py, cut || sl ? top(px) : -1e9, lift ? bot(px) : 1e9); return [px * ct - yy * st, px * st + yy * ct]; });
  put(Q);
  // a glint toward the key light, under the lid
  const [lx] = lightLocal(), gy = Math.max(-b + .27 * H0, (cut || sl ? top(0) : -b) + .16 * H0);
  if (b - gy > .3 * H0 && sqz < .5) {
    const gx = Math.sign(lx || -1) * a * .28, G = ([px, py]) => [px * ct - py * st, px * st + py * ct];
    piece(oval(...G([gx, gy]), a * .32, Math.min(H0 * .11, a * .55), tl, 12), GK.glint, { ink: null, key: k + 'g', lift: 0, flatCard: true });
    if (E.shine) piece(oval(...G([-gx * .6, gy + H0 * .42]), a * .2, a * .2, 0, 10), GK.glint, { ink: null, key: k + 'g2', lift: 0, flatCard: true });
  }
  if (E.star) piece(starPts(0, -b * .15, a * 1.25 * (1 + .12 * Math.sin(o.t * 14)), .38, 4), '#FFF2B8', { ink: null, key: k + 'st', lift: 0, flatCard: true });
  if (E.tear) piece(curvy([[a * .6 * -side, b * .7], [a * 1.4 * -side, b * 1.25], [a * .7 * -side, b * 1.5], [a * .15 * -side, b * 1.22]], 4), GK.tear, { sw: sw * .5, key: k + 'tr', lift: 1, flatCard: true });
  pop();
}
// Grok's small mouth, centred (0, 0), only for the moods that need one (GMOUTH); m ≈ its width (px). qk squeezes the far
// half (+x) in the 3/4 view.
function btGrokMouth(m, kind, sw, qk, key) {
  if (!GMOUTH.includes(kind)) return;
  const X = P => P.map(([a, b]) => [a > 0 ? a * qk : a, b]), dark = GK.mouth, solid = btSolid();
  const hole = (P, tg) => { btDark(X(P), dark, { ink: solid ? null : NOIR.ink, sw: sw * .5, key: key + 'in', lift: 1, flatCard: true }); if (tg) piece(X(oval(0, tg[0], tg[1], tg[2], 0, 14)), GK.tongue, { ink: null, key: key + 'tg', lift: 0, flatCard: true }); };
  const stroke = (P, wt) => faceStroke(X(P), t => wt * (.35 + .65 * Math.pow(Math.sin(Math.PI * t), .7)), sw, key + 'ln');
  const M = m / 2;
  switch (kind) {
    case 'o': case 'pout': case 'sigh': hole(oval(kind === 'sigh' ? M * .15 : 0, 0, M * .3, M * .36, 0, 18)); break;
    case 'O': hole(oval(0, M * .1, M * .46, M * .64, 0, 22), [M * .45, M * .24, M * .14]); break;
    case 'open': hole(oval(0, M * .05, M * .56, M * .48, 0, 22), [M * .3, M * .3, M * .12]); break;
    case 'shout': case 'wail': case 'yawn': hole(oval(0, M * .15, M * .64, M * .78, 0, 22), [M * .6, M * .36, M * .15]); break;
    case 'laugh': hole(curvy([[-M * .9, -M * .2], [0, -M * .26], [M * .9, -M * .2], [M * .62, M * .5], [0, M * .72], [-M * .62, M * .5]], 5), [M * .52, M * .36, M * .14]); break;
    case 'frown': stroke([[-M * .75, M * .26], [-M * .35, -M * .02], [0, -M * .08], [M * .35, -M * .02], [M * .75, M * .26]], M * .22); break;
    case 'wobble': stroke([[-M * .75, 0], [-M * .38, -M * .1], [0, M * .04], [M * .38, -M * .1], [M * .75, 0]], M * .2); break;
    case 'smirk': stroke([[-M * .55, M * .06], [0, M * .14], [M * .45, M * .06], [M * .78, -M * .16]], M * .22); break;
    case 'tongue': stroke([[-M * .7, -M * .1], [0, M * .16], [M * .7, -M * .1]], M * .2); piece(X(curvy([[M * .05, M * .08], [M * .45, M * .08], [M * .4, M * .5], [M * .1, M * .5]], 4)), GK.tongue, { sw: sw * .45, key: key + 'to', lift: 1, flatCard: true }); break;
    case 'teeth': case 'grimace': {   // effort: teeth set, as when straining at a job
      hole(curvy([[-M * .8, -M * .22], [M * .8, -M * .22], [M * .85, M * .24], [-M * .85, M * .24]], 3));
      piece(X(curvy([[-M * .62, -M * .1], [M * .62, -M * .1], [M * .62, M * .1], [-M * .62, M * .1]], 3)), GK.tooth, { ink: null, key: key + 'th', lift: 0, flatCard: true });
      break;
    }
  }
}

function grok(x, y, u, o = {}) {
  const id = o.boilKey ?? ++CLAWD_N, rs = p => boilSeed(`gk ${id} ${p}`), S = P => U(P, u);
  const M0 = btMat(), tt = btT(o), q = o.view === 'q', flip = !!o.flip, seed = o.seed || 0;
  // musicality (clawd.js botGroove): accents on bar downbeats by default, the full beat bounce when a shot passes bounce;
  // the emotion's own beat-locked bob (o.groove) only with the full bounce
  const B = botGroove(tt, o, 1, 'gk' + id + seed), G = grooveAdd(o, B.full ? 1 : 0, B.full ? 1 : .6), tc = ['blue', 'rosy', 'pale'].includes(o.tint) && TINT[o.tint];
  const sq = cardSq(((o.sq || 0) + G.sq + (o.take || 0)) * .6), dy = ((o.dy || 0) + G.dy) * 1.1 * u, sw = clamp(u / 20, .55, 2.2), lift = u * .12, rot = (o.rot || 0) + G.rot;
  const C = { ...GK, dk: tc ? mixCol(GK.dk, tc, .2 * clamp(o.tintK ?? 1)) : GK.dk };   // a mood only cools (sad) or warms (love) the shade; never an angry flush
  const poseName = typeof o.pose === 'string' ? o.pose : o.pose ? 'custom' : 'idle', laughing = poseName === 'laugh';
  const out = { head: null, hands: { L: null, R: null }, bottle: null, tray: null, top: null };
  x += ((o.dx || 0) + G.dx) * u;
  rs('shadow'); if (!o.noShadow) paint(oval(x, y + .1 * u, 2.9 * u, .4 * u, 0, 24), { wash: NOIR.ink, washOp: STYLE.card ? 110 : 150, ink: null });
  push(); translate(x, y + dy); nudge('gk' + id, 1); if (rot) rotate(rot); scale((flip ? -1 : 1) * (1 + sq * .5), 1 - sq);
  const prevXF = XF; XF = flip ? -XF : XF;
  const Mc = btMat();

  // the sphere rides the bounce: it sinks and squashes on the beat about the hips, and leans on alternate beats
  const hipY = -2.75, bob = B.up * .52 + (laughing ? .12 * Math.abs(Math.sin(tt * TAU * 5)) : 0), lean = B.lean + (laughing ? .03 * Math.sin(tt * TAU * 5) : 0), bsq = cardSq(B.sq);
  const UB = (p, Bs = { bob, lean, bsq }) => {   // a point on the sphere's frame (u) → the ground frame (u)
    const px = p[0] * (1 + Bs.bsq * .5), py = (p[1] - hipY) * (1 - Bs.bsq), c = Math.cos(Bs.lean), s = Math.sin(Bs.lean);
    return [px * c - py * s, hipY - Bs.bob + px * s + py * c];
  };

  // ---- smoke from the tailpipe: one puff per beat, born at the pipe and drifting up and back (ground frame) ----
  const pipeTip = [-3.3 + (q ? .25 : 0), -3.72];
  if (o.smoke !== false) {
    const bp = B.bp, n0 = Math.floor(bp), life = 3.6;
    for (let j = 3; j >= 0; j--) {
      const nb = n0 - j, a = bp - nb; if (a > life) continue;
      rs('puff' + j);
      const Bb = botGroove(OFF + nb * BEAT, o, 1, 'gk' + id + seed), p0 = UB(pipeTip, { bob: Bb.up * .52, lean: Bb.lean, bsq: Bb.sq });
      const px = p0[0] - .15 - .36 * a - .03 * a * a + .1 * Math.sin(a * 1.9 + nb), py = p0[1] - .12 * a - .3 * a * a;   // (rising more than drifting)
      // it pops out, grows, then thins away: shrinking and darkening toward the gloom (never see-through: p5.brush mixes
      // translucent washes like pigment, which turns grey smoke blue)
      const r = (.22 + .26 * a) * backOut(clamp(a * 3)) * (1 - ease(seg(a, 2.5, life)));
      if (r < .05) continue;
      const age = seg(a, .6, life), col = STYLE.card ? GK.smokeCard : mixCol(GK.smoke, GK.smokeDk, age * .8);
      piece(btPuff(px * u, py * u, r * u, nb * 1.7), col, { sw: sw * .6 * (1 - age * .5), ink: mixCol(NOIR.ink, GK.smokeDk, age), shade: a < 2 ? GK.smokeDk : null, depth: r * u * .35, key: 'gkpuff' + ((nb % 7 + 7) % 7), lift: 3 });
    }
  }

  // ---- arms (defined here, drawn in the sphere's frame) ----
  const pose = typeof o.pose === 'object' ? o.pose : GPOSE[poseName] || null;
  const reach = a => clamp(-1.05 + ((a ?? .15) - .15) * 1.35, -1.45, 1.45);
  const idleSpec = (s, a) => { const r = reach(a), L = 1.85; return [s * 2.45 + s * Math.cos(r) * L, -4.72 - Math.sin(r) * L, .22, (a ?? .15) > .9 ? 'open' : 'relax']; };
  const spec = s => {
    let sp = pose ? (s < 0 ? pose.L : pose.R) : idleSpec(s, s < 0 ? (o.aL ?? .15) + G.aL : (o.aR ?? .15) + G.aR);
    if (!pose && B.full) {   // idle, dancing: the hands flop behind the bounce and pump alternately on the beat
      const lag = B.lag, pump = .2 * Math.sin(B.bp * Math.PI + (s > 0 ? Math.PI / 2 : 0)) * o.bounce;
      sp = [sp[0] + s * .12 * lag, sp[1] + .3 * lag + pump, sp[2] + .1 * lag, sp[3], sp[4]];
    } else if (!pose) {   // idle, at work: the hands keep busy on their own clock (small quick turns, as if tightening
      // something), the right hand leading the left, easing off to a pause now and then; a flop behind each accent
      const c = B.clk * TAU * .6 + (s > 0 ? 0 : 2.3), busy = clamp(.55 + .6 * Math.sin(B.clk * .7 + seed * 1.3 + (s > 0 ? 0 : .8)));
      sp = [sp[0] + s * .12 * B.lag + .17 * Math.cos(c) * busy, sp[1] + .3 * B.lag - .13 * Math.abs(Math.sin(c)) * busy, sp[2], sp[3], sp[4]];
    }
    if (poseName === 'wave' && s > 0) sp = [sp[0] + .42 * Math.sin(B.clk * TAU), sp[1] + .12 * Math.cos(B.clk * TAU), sp[2], sp[3], sp[4]];
    if (poseName === 'laugh') sp = [sp[0], sp[1] + .1 * Math.sin(tt * TAU * 5 + s), sp[2], sp[3], sp[4]];
    return sp;
  };
  const hs = .95 * u, onSphere = p => Math.hypot(p[0], p[1] - GCY) < GR * .93;
  const arm = (s, front) => {
    const sp = spec(s), far = q && s > 0, [hx, hy, bend, hp] = sp, tip = [hx + (q ? .2 : 0), hy];
    // 3/4 (facing right, +x is the far side): the far arm comes from behind the sphere, so it's drawn behind it unless
    // its hand rests on the sphere's front
    if ((far ? !!sp[4] && onSphere(tip) : !!sp[4]) !== front) return;
    rs('arm' + s);
    const root = q ? (far ? [.86, -3.85] : [-2.5, -4.72]) : [s * 2.52, -4.72];
    const bendMid = r0 => { const ddx = tip[0] - r0[0], ddy = tip[1] - r0[1], L = Math.hypot(ddx, ddy) || 1; const nx = -ddy / L, ny = ddx / L, sd = bendSide(nx, ny, s, .3); return [r0[0] + ddx * .5 + nx * L * bend * sd, r0[1] + ddy * .5 + ny * L * bend * sd]; };   // (out and down: core.js bendSide)
    let mid = bendMid(root);
    // a held prop in a named pose (the pour's bottle, the serve's tray) keeps its hand's angle from the old rig, so props
    // land where the shots expect; a shot's own pose holding something (V2e's request cards) bows the arm like any other
    // (aimed from the old rig's shoulder, the hand in front of the chest hooked the arm up and in over it: the user)
    if ((hp === 'hold' && typeof o.pose !== 'object') || (s > 0 && poseName === 'serve' && o.tray)) {
      const m0 = bendMid([q ? (s > 0 ? .86 : -1.32) : s * 1.28, -3.85]), vx = tip[0] - m0[0], vy = tip[1] - m0[1], Lv = Math.hypot(vx, vy) || 1, D = Math.hypot(tip[0] - root[0], tip[1] - root[1]) * .5;
      mid = [tip[0] - vx / Lv * D, tip[1] - vy / Lv * D];
    }
    const r = limb(S([root, mid, tip]), .44 * u, .4 * u, far ? C.limbDk : C.limb, { sw, shade: C.limbDk, key: 'gkarm' + s });
    if (front && !far) piece(oval(root[0] * u, root[1] * u, .24 * u, .3 * u, 0, 16), C.limbDk, { sw: sw * .7, key: 'gksock' + s, lift: 1, flatCard: true });   // the joint on the sphere
    const ca = r.ang, wx = r.tip[0] + Math.cos(ca) * .05 * u, wy = r.tip[1] + Math.sin(ca) * .05 * u;
    let hold = s > 0 ? o.hold : o.holdL;
    if (s > 0 && poseName === 'pour' && !hold) hold = hsz => { push(); btUpright(Mc); out.bottle = bottle(hsz, o.bottleTilt ?? 2.1, o.pour ?? 1, { frame: M0, toY: o.pourTo, key: 'gkbtl' }); pop(); };
    if (hp !== 'none') hand(wx, wy, ca, hs, { pose: hp, glove: true, sw: sw * .62, mirror: s < 0, key: 'gkh' + s, hold });
    out.hands[s < 0 ? 'L' : 'R'] = btTo(M0, [wx + Math.cos(ca) * hs * .6, wy + Math.sin(ca) * hs * .6]);
    if (s > 0 && poseName === 'serve' && o.tray) { const tx = wx + Math.cos(ca) * hs * .6, ty = wy + Math.sin(ca) * hs * .6 - hs * .75; rs('tray'); btTray(tx, ty, 2.6 * u, o.tray, sw, 'gktray'); out.tray = btTo(M0, [tx, ty]); }
  };

  // ---- legs and big shoes (ground frame: the feet stay planted while the sphere bounces) ----
  const comp = 1 - B.up;
  for (const s of (q ? [1, -1] : [-1, 1])) {   // (3/4: the far leg first)
    rs('leg' + s);
    const far = q && s > 0, walk = o.walk != null ? Math.sin(o.walk * TAU + (s > 0 ? Math.PI : 0)) : 0, lf = Math.max(0, walk) * .55;
    const hip = UB([s * .85 + (q ? .2 : 0), hipY]), ank = [s * .85 + (q ? .35 : 0) + (o.walk != null ? walk * .35 : 0), -.62 - lf];
    const mid = [lerp(hip[0], ank[0], .5) + (q ? .12 : s * (.08 + .22 * comp)), lerp(hip[1], ank[1], .5)];
    limb(S([hip, mid, ank]), .5 * u, .46 * u, far ? C.limbDk : C.limb, { sw, shade: C.limbDk, key: 'gkleg' + s });
    push(); translate(ank[0] * u, ank[1] * u); rotate(-lf * .5 * (q ? 1 : s)); scale(q ? 1 : s, 1);
    piece(curvy(S([[-.72, -.5], [.25, -.64], [1.12, -.4], [1.42, .02], [1.28, .38], [-.76, .38], [-.94, -.02]]), 5), far ? mixCol(GK.shoe, NOIR.ink, .3) : GK.shoe, { sw, shade: NOIR.ink, depth: .22 * u, key: 'gkshoe' + s, lift });
    piece(curvy(S([[-.86, .14], [1.36, .12], [1.22, .42], [-.74, .42]]), 3), GK.sole, { sw: sw * .8, key: 'gksole' + s, lift: 2 });
    dline(S([[.1, -.44], [.62, -.4], [.95, -.26]]), sw * .7, GK.shoeLt, .5);
    pop();
  }

  // ---- the sphere ----
  push(); translate(0, (hipY - bob) * u); rotate(lean); scale(1 + bsq * .5, 1 - bsq); translate(0, -hipY * u);
  if (q) { arm(1, false); arm(-1, false); } else { arm(-1, false); arm(1, false); }
  // the tailpipe, out of its lower back: a car's chrome exhaust with a flared mouth that kicks on the beat
  rs('pipe');
  const kick = 1 + .2 * B.hit, pt = pipeTip, pb = [-1.9 + (q ? .3 : 0), -3.35], pa = Math.atan2(pt[1] - pb[1], pt[0] - pb[0]);
  piece(btStroke(S([pb, [lerp(pb[0], pt[0], .5), lerp(pb[1], pt[1], .5) + .04], pt]), .4 * u, .46 * u), GK.pipe, { sw, shade: GK.pipeDk, depth: .12 * u, key: 'gkpipe', lift });
  dline(S([[lerp(pb[0], pt[0], .55), lerp(pb[1], pt[1], .55) - .1], [pt[0] + .25, pt[1] - .12]]), sw * .6, GK.pipeLt, .3);
  for (const k of [.66, .8]) { const bxk = lerp(pb[0], pt[0], k), byk = lerp(pb[1], pt[1], k), nx = -Math.sin(pa) * .21, ny = Math.cos(pa) * .21; dline(S([[bxk - nx, byk - ny], [bxk + nx, byk + ny]]), sw * .55, GK.pipeDk, 0); }
  piece(oval(pt[0] * u, pt[1] * u, .17 * u * kick, .34 * u * kick, pa, 20), GK.pipe, { sw: sw * .9, key: 'gkpipering', lift: 2, flatCard: true });
  piece(oval((pt[0] - .02) * u, pt[1] * u, .09 * u * kick, .23 * u * kick, pa, 14), NOIR.ink, { ink: null, key: 'gkpipehole', lift: 0, flatCard: true });

  rs('sphere');
  const Sph = oval(0, GCY * u, GR * u, GR * u, 0, 64);
  piece(Sph, C.col, { sw: sw * 1.15, shade: C.mid, depth: GR * .8 * u, key: 'gksphere', lift });
  const core = crescent(Sph, GR * .36 * u);   // a second, deeper step of the cool shade: the sphere turning away
  if (core) piece(core, C.dk, { ink: null, key: 'gkcore', lift: 0, flatCard: true, edge: false });
  piece(oval(-1.12 * u, (GCY - 1.22) * u, .66 * u, .36 * u, -.66, 22), C.lt, { ink: null, key: 'gkhl', lift: 0, flatCard: true });
  out.head = btTo(M0, [0, GCY * u]); out.top = btTo(M0, [0, (GCY - GR) * u]);

  // the face: two coin slots (and a mouth only when one's needed), turned with the sphere
  rs('face');
  const tilt = (o.tilt || 0) + (laughing ? -.14 + .04 * Math.sin(tt * TAU * 5) : 0);
  push(); translate(0, GCY * u); rotate(tilt); translate(0, -GCY * u);
  const kinds = btEyeKinds(o, tt, seed), lkx = clamp(o.lookX || 0, -1, 1), lky = clamp(o.lookY || 0, -1, 1);
  const Fx = (q ? .95 : 0) + lkx * .45, Fy = GCY - .62 + lky * .32, eb = 1 - .07 * B.hit + .04 * B.up;   // (the slots squash on the beat)
  const shades = kinds[0].kind === 'shades' && !kinds[0].sqz && !kinds[0].blink;
  const eyeAt = q ? [[Fx - .6, 1], [Fx + .62, .72]] : [[Fx - .68, 1], [Fx + .68, 1]];   // 3/4: the near eye (-x) full, the far one foreshortened
  if (!shades) eyeAt.forEach(([ex, kw], i) => btSlotEye(ex * u, Fy * u, .6 * kw * u, 1.44 * eb * u, i ? 1 : -1, kinds[i], { sw, key: 'gke' + i, t: tt }));
  else {
    const V = S([[Fx - 1.2, -.45], [Fx, -.52], [Fx + 1.2, -.45], [Fx + 1.08, .28], [Fx + .5, .42], [Fx + .06, .12], [Fx - .06, .12], [Fx - .5, .42], [Fx - 1.08, .28]].map(([a, b]) => [a, Fy + b]));
    piece(curvy(V, 3), GK.slot, { ink: btSolid() ? null : NOIR.ink, sw: sw * .6, key: 'gkshades', lift: 2, flatCard: true });
    for (const s of [-1, 1]) piece(oval((Fx + s * .64 - .25) * u, (Fy - .18) * u, .12 * u, .06 * u, -.5, 10), GK.glint, { ink: null, key: 'gkshg' + s, lift: 0, flatCard: true });
  }
  if ((o.blush || 0) > .15) for (const s of [-1, 1]) { if (q && s > 0) continue; piece(oval((Fx + s * 1.32) * u, (Fy + .72) * u, .3 * u, .15 * u, 0, 16), GK.cheek, { ink: null, key: 'gkbl' + s, lift: 0, flatCard: true }); }
  push(); translate((Fx + (q ? .08 : 0)) * u, (Fy + 1.18) * u); btGrokMouth(.95 * u, o.mouth, sw, q ? .72 : 1, 'gkm'); pop();
  const sadEyes = ['sad', 'teary', 'cry'].includes(kinds[1].kind);   // (gloom only for real sadness: never a scheming shadow)
  if (o.gloom > .02 && sadEyes) { if (!STYLE.card) piece(curvy(S([[Fx - 1.5, GCY - 1.95], [Fx + 1.5, GCY - 1.95], [Fx + 1.05, GCY - 2.55], [Fx - 1.05, GCY - 2.55]]), 3), NOIR.ink, { ink: null, op: 90 * o.gloom, key: 'gkgloom', lift: 0, flatCard: true }); }
  pop();

  // a bow tie under the face
  if (o.tie !== false) {
    rs('tie');
    const tx = Fx * .55, ty = GCY + 1.78, fw = q ? .7 : 1;
    for (const s of [-1, 1]) piece(curvy(S([[tx, ty], [tx + s * .56 * (s > 0 ? fw : 1), ty - .3], [tx + s * .64 * (s > 0 ? fw : 1), ty + .02], [tx + s * .55 * (s > 0 ? fw : 1), ty + .3]]), 3), GK.tie, { sw: sw * .8, key: 'gktie' + s, lift: 2, flatCard: true });
    piece(oval(tx * u, ty * u, .16 * u, .14 * u, 0, 12), GK.tieLt, { sw: sw * .7, key: 'gktiek', lift: 2, flatCard: true });
  }
  arm(-1, true); arm(1, true);
  pop();

  XF = prevXF;
  pop();
  rs('emote'); if (o.emote) emote(o.emote, x + (flip ? -1 : 1) * 2.8 * u, y + dy - 8.9 * u * (1 - sq), u * .55, o.emoteK ?? 1, o.emoteAge ?? T);
  rs('after');
  return out;
}

// ---------- Muse ----------
// Jolly, Meta's Muse companion (the "Jollybot"): a cream, fluffy plush in a hooded onesie, roly-poly as a dumpling, a
// smooth pale-peach face in the hood with beady black eyes, a small upward smile and rosy blush, stubby rounded arms and
// short chunky legs under a round, generous bottom. Cute, cheerful and sincere: it only ever wants to help. Drawn cartoony,
// not as a photo-real plush: a fuzzy silhouette (the fur is a soft scalloped edge) round simple shapes. In each look:
//   card    cream card cut with a soft scalloped edge, the fleece as fibre marks pencilled on it; the face a separate pale
//           disc with blush; the arms and legs are rigid pieces on split pins (stop-motion: they turn, they don't bend)
//   bank    engraved: the fur in fine curling hatch, heavier toward the shadow side; the face left pale paper
//   xerox   printed in the riso's drums
//   ink     the rubber-hose idiom: one clean scalloped contour, flat pastel fills, pie-cut eyes, puffy white gloves on the
//           stubby arms (they stretch a little there, as rubber hose does) and little oval shoes
//   doodle  biro scallops and coloured pencil, a few biro curls for the fleece
// It floats where it's needed (the scenes hover it: alt), its feet dangling a little on their own slow clock. The body's
// frame (u): its middle at (0, 0), where the scenes put the old egg's centre (alt + 2.5 u above the ground point); the
// hood's top at -3.02, the face's middle at (0, -1.3), the shoulders at ±1.46, the feet down to about 3.6.

// Hand targets (u, from the body's middle): [x, y, bend, hand pose, front]. The arms are stubby: a target out of reach is
// reached for (the arm points at it and goes as far as it goes; in card a rigid piece, always the same length).
const MPOSE = {
  tray:  { L: [-2.65, 1.95, .28, 'relax'], R: [2.75, -1.25, .3, 'open', 1] },
  serve: { L: [-1.72, 1.9, .5, 'fist', 1], R: [1.72, 1.9, .5, 'fist', 1] },
  wave:  { L: [-2.45, 2.3, .25, 'relax'], R: [2.75, -2.4, .3, 'open', 1] },
  point: { L: [-2.45, 2.3, .25, 'relax'], R: [3.3, -.6, .15, 'point', 1] },
  cheer: { L: [-2.7, -2.1, .2, 'open', 1], R: [2.7, -2.1, .2, 'open', 1] },
};
const MU_ARM = 1.72, MU_ARMW = .92;   // an arm: shoulder to the mitt's middle, and its thickness (u)
// Jolly's outline (u), clockwise on screen: the hood round the face, a soft pinch at the neck, the dumpling body swelling
// to its round bottom. 3/4 (facing +x): a touch narrower, the rump rounder at the back.
const MJ_R = [[0, -3.02], [.66, -2.94], [1.2, -2.66], [1.6, -2.2], [1.82, -1.62], [1.86, -1.02], [1.76, -.46], [1.66, -.06], [1.78, .42], [1.98, 1.0], [2.08, 1.58], [2.0, 2.08], [1.72, 2.46], [1.18, 2.68], [.52, 2.74]];
function muBodyPts(v) {
  const P = MJ_R.concat([[0, 2.76]], MJ_R.slice(1).reverse().map(([x, y]) => [-x, y]));
  if (v !== 'q') return P;
  return P.map(([x, y]) => { const rump = x < 0 ? .26 * Math.sin(Math.PI * clamp((y - .45) / 2.45)) : 0, belly = x > 0 ? .07 * Math.sin(Math.PI * clamp((y - .3) / 2.1)) : 0; return [x * .95 + .05 - rump + belly, y]; });
}
// A soft scalloped fur edge round the closed outline P: n round tufts bulging outward, a little uneven (fixed by seed: the
// same cut every time). amp: a tuft's height over its length.
function muFur(P, n, amp, seed = 0) {
  const C = curvy(P, 8), m = C.length, L = [0];
  for (let i = 1; i <= m; i++) L.push(L[i - 1] + Math.hypot(C[i % m][0] - C[i - 1][0], C[i % m][1] - C[i - 1][1]));
  const tot = L[m], at = d => { d = ((d % tot) + tot) % tot; let i = 1; while (i < m && L[i] < d) i++; const k = (d - L[i - 1]) / ((L[i] - L[i - 1]) || 1), a = C[i - 1], b = C[i % m]; return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; };
  let A = 0; for (let i = 0; i < m; i++) { const a = C[i], b = C[(i + 1) % m]; A += a[0] * b[1] - b[0] * a[1]; }
  const sg = A >= 0 ? 1 : -1, ws = []; for (let i = 0; i < n; i++) ws.push(.8 + .4 * hash(i * 7.3 + seed)); const wsum = ws.reduce((a, b) => a + b, 0);
  const out = []; let d0 = hash(seed * 3.1 + .7) * tot / n; const eps = tot / n * .02;
  for (let i = 0; i < n; i++) {
    const d1 = d0 + ws[i] / wsum * tot, h = amp * (d1 - d0) * (.75 + .5 * hash(i * 3.7 + seed + 1));
    for (let k = 0; k < 7; k++) {
      const d = lerp(d0, d1, k / 7), p = at(d), p2 = at(d + eps), p1 = at(d - eps), dx = p2[0] - p1[0], dy = p2[1] - p1[1], l = Math.hypot(dx, dy) || 1, s = Math.pow(Math.sin(Math.PI * k / 7), .7);
      out.push([p[0] + sg * dy / l * h * s, p[1] - sg * dx / l * h * s]);
    }
    d0 = d1;
  }
  return out;
}
// how many tufts round an outline (u): one about every .5 u
const muTuftN = P => { let per = 0; for (let i = 0; i < P.length; i++) { const b = P[(i + 1) % P.length]; per += Math.hypot(b[0] - P[i][0], b[1] - P[i][1]); } return Math.max(5, Math.round(per / .5)); };
// Mood tints shift the fleece and the face a little (sad goes blue, proud a touch gold).
function muTint(o) {
  if (STYLE.mode === 'doodle') return MU;   // (the doodle colours the plush with one light pencil: muPencil)
  const tc = o.tint && (TINT[o.tint] || o.tint), k = clamp(o.tintK ?? 1) * .22;
  if (!tc || k <= 0) return MU;
  const R = { ...MU }; for (const f of ['fur', 'furDk', 'furLt', 'face', 'faceDk']) R[f] = mixCol(MU[f], tc, f.startsWith('face') ? k * .7 : k);
  return R;
}
// The face: its middle and half sizes (u) by view (3/4: shifted toward +x, the far side narrower); the eyes, cheeks and
// mouth on it.
function muFaceGeo(v, lk) {
  if (v === 'q') return { q: true, cx: .5 + lk[0] * .07, cy: -1.3 + lk[1] * .06, rn: 1.16, rf: .96, ry: 1.0, eyes: [[-.42, 1], [.46, .78]], cheeks: [[-.8, 1], [.8, .66]], mx: .1, qk: .8 };
  return { q: false, cx: lk[0] * .12, cy: -1.3 + lk[1] * .07, rn: 1.3, rf: 1.3, ry: 1.02, eyes: [[-.5, 1], [.5, 1]], cheeks: [[-.86, 1], [.86, 1]], mx: 0, qk: 1 };
}
function muFacePts(F, n = 48) {   // a soft superellipse, its top a touch flatter; rn / rf the near (-x) and far (+x) halves
  const P = []; for (let i = 0; i < n; i++) { const a = i / n * TAU, c = Math.cos(a), s = Math.sin(a), e = 2 / 2.3; P.push([F.cx + (c < 0 ? F.rn : F.rf) * Math.sign(c) * Math.pow(Math.abs(c), e), F.cy + F.ry * Math.sign(s) * Math.pow(Math.abs(s), e) * (s < 0 ? .96 : 1)]); }
  return P;
}
// a small dark feature (a bead, a lid line, the mouth): btDark, except in the doodle, where it's inked in solid (a
// hatched bead that small reads as a scribble)
function muDark(P, col, o) { if (STYLE.mode === 'doodle' && lum(col) < .3) { _paint(P, { wash: BIRO, washOp: 235, ink: null }); edgeLine(P, .8, BIRO, true); return; } btDark(P, col, o); }
// Jolly's beady eye at (x, y) px: r its half-width. The kit's eye names: a glossy black bead (in ink the 1930s pie-cut
// bead); happy ∩ and shut ∪ as short bold arcs; squeezed > <; hearts; a starry glint (spark, shine); a bigger bead for
// surprise; for fright a white round a small trembling bead; lids in the face's colour for the moods (narrow, angry,
// sad...). side -1 = screen-left, 1 = right. o: sw, key, t, skin (the lid's colour), look [x, y] px, pie (ink)
function muEye(x, y, r, side, spec, o) {
  const dark = MU.eye, k = o.key, t = o.t || 0, sw = o.sw, F = { ink: null, lift: 0, flatCard: true, fine: true, edge: false };
  let e = spec.kind; if (spec.blink || spec.sqz > .85) e = 'closed';
  push(); translate(x + (o.look ? o.look[0] : 0), y + (o.look ? o.look[1] : 0));
  const arc = (P, w) => muDark(strokeShape(P, s => w * (.5 + .5 * Math.sin(Math.PI * s)), 10), dark, { ...F, key: k + 'a' });
  const glint = (gx, gy, gr, kk) => { if (!o.pie) piece(oval(gx, gy, gr, gr, 0, 10), '#FFFFFF', { ...F, key: k + kk }); };
  const bead = (rx, ry, col, kk = 'p') => {
    if (!o.pie) { muDark(oval(0, 0, rx, ry, 0, 20), col, { ...F, key: k + kk }); return; }
    const [lx, ly] = lightLocal(), aw = Math.atan2(ly, lx), hw = .42, P = [[Math.cos(aw) * rx * .2, Math.sin(aw) * ry * .2]];   // (a wedge cut toward the light)
    for (let i = 0; i <= 24; i++) { const a = aw + hw + i / 24 * (TAU - 2 * hw); P.push([Math.cos(a) * rx, Math.sin(a) * ry]); }
    muDark(P, col, { ...F, key: k + kk });
  };
  switch (e) {
    case 'happy': arc([[-r * 1.1, r * .45], [-r * .55, -r * .35], [0, -r * .55], [r * .55, -r * .35], [r * 1.1, r * .45]], r * .62); break;
    case 'closed': case 'sleepy': arc([[-r * 1.1, -r * .2], [-r * .55, r * .38], [0, r * .5], [r * .55, r * .38], [r * 1.1, -r * .2]], r * .56); break;
    case 'squeeze': case 'cry': arc([[-r * .9 * -side, -r * .85], [r * .75 * -side, 0], [-r * .9 * -side, r * .85]], r * .55); if (e === 'cry') piece(curvy([[r * .2 * -side, r * .9], [r * .6 * -side, r * 1.7], [r * .2 * -side, r * 2.0], [-r * .15 * -side, r * 1.65]], 4), MU.tear, { sw: sw * .4, key: k + 'tr', lift: 0, flatCard: true }); break;
    case 'x': for (const d of [-1, 1]) arc([[-r * .8, -r * .8 * d], [r * .8, r * .8 * d]], r * .5); break;
    case 'heart': piece(heartPts(0, 0, r * 1.45 * (1 + .1 * pulse(t))), MU.heart, { sw: sw * .4, key: k + 'h', lift: 0, flatCard: true, fine: true }); break;
    case 'wide': bead(r * 1.22, r * 1.5, dark); glint(-r * .4, -r * .55, r * .42, 'g'); glint(r * .38, r * .55, r * .18, 'g2'); break;
    case 'scared': case 'blank': {
      const sh = e === 'scared' ? Math.sin(t * 60 + side) * r * .12 : 0;
      piece(oval(0, 0, r * 1.3, r * 1.55, 0, 20), '#FFFFFF', { sw: sw * .45, key: k + 'w', lift: 0, flatCard: true, fine: true, role: 'inner' });
      push(); translate(sh, r * .15); bead(r * .55, r * .68, dark); pop();
      break;
    }
    case 'spark': case 'shine': bead(r * 1.12, r * 1.4, dark); if (!o.pie) piece(starPts(-r * .25, -r * .38, r * .72 * (1 + .15 * Math.sin(t * 14)), .4, 4), '#FFFFFF', { ...F, key: k + 'st' }); glint(r * .4, r * .6, r * .16, 'g2'); break;
    case 'swirl': { const sp = []; for (let i = 0; i < 16; i++) { const a = i * .75 + t * 6 * side, rr = i / 16 * r * 1.2; sp.push([Math.cos(a) * rr, Math.sin(a) * rr * 1.2]); } btDark(ribbon(sp, r * .3), dark, { ...F, key: k + 'sw' }); break; }
    case 'shades': btDark(curvy([[-r * 1.5, -r * .8], [r * 1.5, -r * .85], [r * 1.35, r * .7], [0, r * .95], [-r * 1.3, r * .75]], 4), '#1E1A24', { ...F, key: k + 'sh' }); break;
    default: {   // normal, look, dot, and the lidded moods
      const small = e === 'dot' ? .78 : 1, rx = r * small, ry = r * 1.28 * small;
      bead(rx, ry, e === 'red' ? '#B0142C' : dark);
      glint(-rx * .32, -ry * .36, rx * .36, 'g');
      const lid = { narrow: .45, angry: .38, determined: 0, red: .38, sad: .3, teary: .3, bored: .5 }[e] ?? (STYLE.card ? Math.round((spec.sqz || 0) * 2) / 2 : spec.sqz || 0) * .9;
      const sl = { angry: .55, determined: 0, red: .55, sad: -.5, teary: -.45 }[e] || 0;   // (determined: focused, a level lid; Jolly never looks cross at a job)
      if (lid > .02) {
        const yb = lerp(-ry * 1.05, ry * .95, lid), edge = xx => yb + sl * ry * (xx * -side / rx);
        piece(oval(0, 0, rx * 1.5, ry * 1.4, 0, 24).map(([a, b]) => [a, Math.min(b, edge(a))]), o.skin, { ...F, key: k + 'lid' });
        const span = []; for (let i = 0; i <= 8; i++) { const xx = lerp(-rx * 1.25, rx * 1.25, i / 8); span.push([xx, edge(xx)]); }
        muDark(strokeShape(span, s => r * .34 * (.6 + .4 * Math.sin(Math.PI * s)), 6), dark, { ...F, key: k + 'll' });
      }
      if (e === 'teary') piece(curvy([[r * .3 * -side, r * .9], [r * .65 * -side, r * 1.7], [r * .3 * -side, r * 1.95], [-r * .05 * -side, r * 1.65]], 4), MU.tear, { sw: sw * .4, key: k + 'tr', lift: 0, flatCard: true });
    }
  }
  pop();
}
// Jolly's small mouth centred (0, 0), W ≈ its resting half-width px: the smile is small and neat; the open shapes (the
// lip-sync's and the big moods') open wider, so they read. qk squeezes the far half (+x) in 3/4. o: sw, key
function muMouth(W, kind, o = {}) {
  const sw = o.sw ?? 1, key = o.key || 'mum', qk = o.qk ?? 1, Q = P => P.map(([a, b]) => [a > 0 ? a * qk : a, b]), F = { lift: 0, flatCard: true, fine: true };
  const line = (P, w = 1) => muDark(btTaper(Q(P), W * .34 * w), MU.eye, { ...F, ink: null, key: key + 'l', edge: false });
  const hole = (P, tg) => { muDark(Q(P), MU.mouth, { ...F, sw: sw * .5, key: key + 'in', role: 'inner' }); if (tg) piece(Q(oval(0, tg[0], tg[1], tg[2], 0, 14)), MU.tongue, { ...F, ink: null, key: key + 'tg', edge: false }); };
  const teeth = (P) => piece(Q(P), MU.tooth, { ...F, ink: null, key: key + 'th', edge: false });
  const D = (w, top, bot, n = 18) => { const P = []; for (let i = 0; i <= n; i++) { const a = lerp(-1, 1, i / n); P.push([a * w, -top * w * a * a]); } for (let i = n - 1; i > 0; i--) { const a = lerp(-1, 1, i / n); P.push([a * w, -top * w * a * a + bot * w * Math.pow(Math.max(0, 1 - a * a), .7)]); } return P; };
  const V = W * 1.9;   // (the open shapes' half-width: big enough that the lip-sync reads)
  switch (kind) {
    case 'flat': line([[-W * .8, W * .05], [0, W * .08], [W * .8, W * .05]]); break;
    case 'frown': case 'pout': line([[-W * .85, W * .32], [-W * .4, -W * .02], [0, -W * .1], [W * .4, -W * .02], [W * .85, W * .32]]); break;
    case 'cat': line([[-W * 1.05, -W * .12], [-W * .52, W * .3], [0, 0], [W * .52, W * .3], [W * 1.05, -W * .12]], .9); break;
    case 'wobble': line([[-W * .95, W * .05], [-W * .48, -W * .12], [0, W * .08], [W * .48, -W * .12], [W * .95, W * .05]], .85); break;
    case 'smirk': line([[-W * .7, W * .1], [W * .15, W * .18], [W * .7, W * .02], [W * 1.02, -W * .3]]); break;
    case 'tongue': line([[-W, -W * .15], [-W * .5, W * .25], [0, W * .36], [W * .5, W * .25], [W, -W * .15]]); piece(Q(curvy([[W * .05, W * .3], [W * .55, W * .26], [W * .5, W * .8], [W * .18, W * .88]], 4)), MU.tongue, { ...F, sw: sw * .4, key: key + 'to' }); break;
    case 'o': case 'sigh': hole(oval(kind === 'sigh' ? W * .15 : 0, W * .2, W * .5, W * .6, 0, 16)); break;
    case 'O': hole(oval(0, W * .22, V * .44, V * .6, 0, 20), [W * .55, V * .26, V * .12]); break;
    case 'yawn': case 'wail': hole(oval(0, W * .3, V * .5, V * .78, 0, 20), [W * .78, V * .3, V * .14]); break;
    case 'open': hole(D(V * .62, .12, .9), [V * .48, V * .3, V * .12]); break;
    case 'shout': hole(D(V * .78, .05, 1.2), [V * .66, V * .38, V * .16]); teeth(D(V * .6, .05, .22)); break;
    case 'grin': hole(D(V * .78, .3, .72)); teeth(D(V * .66, .3, .28)); break;
    case 'laugh': hole(D(V * .8, .14, 1.05), [V * .62, V * .4, V * .16]); teeth(D(V * .64, .14, .25)); break;
    case 'teeth': case 'grimace': hole(D(V * .74, .08, .62)); teeth(D(V * .62, .08, .3)); teeth(D(V * .6, .08, .62).map(([a, b]) => [a, Math.max(b, V * .74 * .36)])); break;   // (F / V: teeth together in the dark of the mouth)
    default: line([[-W, -W * .12], [-W * .5, W * .26], [0, W * .38], [W * .5, W * .26], [W, -W * .12]]);   // the smile
  }
}
// The fleece, fixed to the figure: short soft strokes where the fur lies (down and out from the crown). Card: a few fibre
// marks pencilled on the card; bank: fine curling hatch, heavier toward the shadow; doodle: a few biro curls; riso and ink:
// a sparse few. P: the outline (u, the frame it's drawn in), F: the face (left bare) or null, n0: a seed.
const MU_TUFTS = {};
function muTuftPts(P, F, step, key) {
  const id = key && key + step; if (id && MU_TUFTS[id]) return MU_TUFTS[id];
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const [x, y] of P) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const out = []; let j = 0;
  for (let y = y0 + step * .5; y < y1; y += step * .87, j++) for (let x = x0 + step * (j % 2 ? .75 : .25); x < x1; x += step) {
    const h = hash(x * 3.7 + y * 11.3 + step), px = x + (h - .5) * step * .6, py = y + (hash(h * 17 + 3) - .5) * step * .6;
    if (!inPoly(px, py, P)) continue;
    if (F && ((px - F.cx) / (Math.max(F.rn, F.rf) + .2)) ** 2 + ((py - F.cy) / (F.ry + .2)) ** 2 < 1) continue;
    out.push([px, py, hash(h * 5.1 + 1), hash(h * 9.7 + 2)]);
  }
  if (id) MU_TUFTS[id] = out;
  return out;
}
function muFleece(P, F, u, sw, C, key, crown = [0, -3.4]) {
  const md = STYLE.mode, card = STYLE.card, px = drawScale() * u;   // (px: the figure's unit on screen)
  if (md === 'bank') {
    const Pp = U(P, u), Fm = bankForm(Pp, .32, .75), bp = bankPx(), T = [], wmin = .25 / bp, W1 = 1.35 / bp / bankKW(), W0 = .3 / bp / bankKW();
    for (const [x, y, h1, h2] of muTuftPts(P, F, .2, key)) {
      const X = x * u, Y = y * u, tn = Fm.tone(X, Y); if (h1 > .22 + .95 * tn) continue;
      const fl = Math.atan2(y - crown[1], x - crown[0]), r = (.075 + .05 * h2) * u, a0 = fl + Math.PI * (.35 + .3 * h1), dir = h2 > .5 ? 1 : -1, pts = [], ws = [], wm = lerp(W0, W1, tn);
      for (let i = 0; i <= 8; i++) { const s = i / 8, a = a0 + dir * s * Math.PI * 1.35, rr = r * (1 - .35 * s); pts.push([X + Math.cos(a) * rr, Y + Math.sin(a) * rr]); ws.push(wm * Math.pow(Math.sin(Math.PI * clamp(s * 1.1)), .6)); }
      bankSwell(T, pts, ws, wmin);
    }
    bankTris(T, bankFigCol(mixCol(BANK.ink, desat(C.tuft, BANK.sat ?? .7), .45 * (BANK.colour ?? 1))));
    return;
  }
  if (px < (card ? 10 : 14) || md === 'ink') return;   // (too small for the marks to read, or ink's minimal interior: the scallops carry the fur)
  const step = card ? .74 : md === 'doodle' ? .78 : md === 'ink' ? 1.25 : .9, col = md === 'doodle' ? BIRO : md === 'ink' ? NOIR.ink : md === 'xerox' ? '#7E6A50' : mixCol(C.tuft, C.fur, .35);
  for (const [x, y, h1, h2] of muTuftPts(P, F, step, key)) {
    if ((md === 'xerox' && h1 > .55) || (md === 'doodle' && (h1 > .5 || y < -.4))) continue;
    if (card && h1 > .7) continue;
    const fl = Math.atan2(y - crown[1], x - crown[0]), L = (card ? .15 + .08 * h2 : .2 + .1 * h2) * (md === 'doodle' ? 1.2 : 1), bow = (h1 - .5) * .5;
    const a = [x - Math.cos(fl) * L * .5, y - Math.sin(fl) * L * .5], b = [x + Math.cos(fl) * L * .5, y + Math.sin(fl) * L * .5], m = [x - Math.sin(fl) * L * bow, y + Math.cos(fl) * L * bow];
    if (md === 'doodle') { const cr = []; for (let i = 0; i <= 6; i++) { const s = i / 6, an = fl + Math.PI * (.2 + 1.2 * s) * (h2 > .5 ? 1 : -1); cr.push([x + Math.cos(an) * L * .45 * (1 - .3 * s), y + Math.sin(an) * L * .45 * (1 - .3 * s)]); } dline(S0(cr, u), sw * .55, col, .5); }
    else dline(S0([a, m, b], u), sw * (card ? .42 : .5), col, .5);
  }
}
const S0 = (P, u) => P.map(([a, b]) => [a * u, b * u]);
// A stubby arm (or leg) in its own frame: a soft sausage along +x from 0 to len, w0 thick at the root, the mitt (or foot)
// a round end w1 across; its outline scalloped. (u)
function muLimbPts(len, w0, w1, seed) {
  const P = []; for (let i = 0; i <= 8; i++) { const a = Math.PI / 2 + i / 8 * Math.PI; P.push([Math.cos(a) * w0 / 2, Math.sin(a) * w0 / 2]); }
  for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + i / 12 * Math.PI; P.push([len + Math.cos(a) * w1 / 2, Math.sin(a) * w1 / 2]); }
  return muFur(P, Math.max(5, Math.round((len * 2 + w1 * 1.6) / .46)), .1, seed);
}
// a limb piece: its outline (its own frame, u) turned to ang at o; in the banknote paper and the fleece's curling hatch
function muLimb(Pc, o0, ang, u, col, po, C) {
  const bank = STYLE.mode === 'bank', P = muXf(Pc, o0, ang, u);
  piece(P, bank ? '#FFFFFF' : STYLE.mode === 'doodle' ? MU.fur : col, { ...po, shade: bank ? null : po.shade, texFrame: [o0[0] * u, o0[1] * u, ang] });
  muPencil(P);
  if (bank) { push(); translate(o0[0] * u, o0[1] * u); rotate(ang); muFleece(Pc, null, u, po.sw, C, null, [-3, 0]); pop(); }
}
// the doodle's cream: a light, loose pass of coloured pencil over the paper-white plush
function muPencil(P) { if (STYLE.mode === 'doodle') hatchLines(P, 7.5, 52, 'cpencil', '#E2BE7E', .85, 1.5, .3); }
const muXf = (P, o, ang, u) => { const c = Math.cos(ang), s = Math.sin(ang); return P.map(([a, b]) => [(o[0] + a * c - b * s) * u, (o[1] + a * s + b * c) * u]); };

// Jolly itself, its middle at (0, 0) of the current frame, unit u (the figure's). J: { o, C (palette), sw, lift, tt, B, G,
// v ('front' | 'q' | 'back'), pose, poseName, seated, typing, out, M0, rs, tag (keys), hold, holdL, trayW }
function muJolly(u, J) {
  const { o, C, sw, lift, tt, B, v, pose, poseName, seated, out, M0, rs, tag } = J, q = v === 'q', back = v === 'back', card = STYLE.card, ink = inkRH();
  const S = P => U(P, u), lk = [clamp(o.lookX || 0, -1, 1), clamp(o.lookY || 0, -1, 1)], F = muFaceGeo(v, back ? [0, 0] : lk);
  const body = muBodyPts(v), bodyF = muFur(body, muTuftN(body), .1, 3.1);
  // ---- the arms' geometry: shoulder → toward the target, as far as a stubby arm goes ----
  const reach = a => clamp(-1.25 + ((a ?? .15) - .15) * 1.5, -1.5, 1.45);
  const idleSpec = (s, a) => { const r = reach(a), L = MU_ARM; return [s * 1.46 + s * Math.cos(r) * L, -.04 - Math.sin(r) * L, .25, (a ?? .15) > .9 ? 'open' : 'relax']; };
  const spec = s => {
    let sp = pose ? (s < 0 ? pose.L : pose.R) : idleSpec(s, s < 0 ? (o.aL ?? .15) + J.G.aL : (o.aR ?? .15) + J.G.aR);
    if (!sp) sp = idleSpec(s, .15);
    if (poseName === 'wave' && s > 0) sp = [sp[0] + .4 * Math.sin(B.clk * TAU), sp[1] + .1 * Math.cos(B.clk * TAU), sp[2], sp[3], sp[4]];
    if (poseName === 'tray' && s > 0) sp = [sp[0], sp[1] + .08 * Math.sin(B.clk * Math.PI), sp[2], sp[3], sp[4]];
    if (J.typing) {   // tapping away: each mitt lifts and taps on its own quick clock, the two alternating, now and then a pause
      const ph = tt * 4.6 + (s > 0 ? .5 : 0), pause = frac(tt / 2.9) > .86 ? 0 : 1;
      sp = [sp[0], sp[1] - .3 * pause * Math.max(0, Math.sin(ph * TAU)), sp[2], sp[3], sp[4]];
    }
    return sp;
  };
  const SH = s => q ? (s < 0 ? [-1.26, -.02] : [1.38, -.1]) : [s * 1.46, -.04];
  const armGeo = s => {
    const sp = spec(s), root = SH(s), tg = [sp[0] + (q ? .2 : 0), sp[1]], dx = tg[0] - root[0], dy = tg[1] - root[1], d = Math.hypot(dx, dy) || 1;
    const len = card ? MU_ARM : ink ? clamp(d, MU_ARM * .75, MU_ARM * 1.4) : clamp(d, MU_ARM * .85, MU_ARM * 1.14);
    return { sp, root, ang: Math.atan2(dy, dx), len, hp: sp[3] || 'relax' };
  };
  const hs = .74 * u;
  const arm = s => {
    const g = armGeo(s), far = q && s > 0, key = tag + 'arm' + s, col = far ? mixCol(C.fur, C.furDk, .35) : C.fur;
    rs('arm' + s);
    const glove = ink && g.hp !== 'none', L = glove ? g.len - .42 : g.len;
    muLimb(muLimbPts(L, MU_ARMW, glove ? MU_ARMW * .86 : MU_ARMW * 1.04, s * 5 + 2), g.root, g.ang, u, col, { sw: sw * .95, shade: C.furDk, depth: .2 * u, key, lift: lift * .8 }, C);
    if (card) brad((g.root[0] + Math.cos(g.ang) * .3) * u, (g.root[1] + Math.sin(g.ang) * .3) * u, Math.max(2, .075 * u));
    const ca = Math.cos(g.ang), sa = Math.sin(g.ang), tip = [(g.root[0] + ca * g.len) * u, (g.root[1] + sa * g.len) * u], hold = s > 0 ? J.hold : J.holdL;
    if (glove) {
      const wx = (g.root[0] + ca * (L + .12)) * u, wy = (g.root[1] + sa * (L + .12)) * u;
      let hp = g.hp, mirror = s < 0; if (hp === 'thumbUp' || hp === 'thumbDown') { mirror = hp === 'thumbDown' ? ca > 0 : ca < 0; hp = 'thumb'; }
      hand(wx, wy, g.ang, hs, { pose: hp, glove: true, sw: sw * .62, mirror, key: key + 'g', hold });
      out.hands[s < 0 ? 'L' : 'R'] = btTo(M0, [wx + ca * hs * .6, wy + sa * hs * .6]);
    } else {
      // the mitt's thumb (and a finger for pointing): small nubs, always toward the top of the mitt
      const up = [-sa * (ca >= 0 ? 1 : -1), ca * (ca >= 0 ? 1 : -1)], upY = up[1] > 0 ? [-up[0], -up[1]] : up, r = MU_ARMW * .52 * u;
      const nub = (a, b, w, kk) => piece(strokeShape([a, b], () => w, 6), col, { sw: sw * .7, key: key + kk, lift: 2, flatCard: true });
      if (hold) { push(); translate(...tip); rotate(g.ang); if (s < 0) scale(1, -1); hold(hs); pop(); }
      if (g.hp === 'thumb' || g.hp === 'thumbUp') nub([tip[0] + s * .05 * u, tip[1] - r * .55], [tip[0] + s * .1 * u, tip[1] - r * 1.45], .36 * u, 'th');
      else if (g.hp === 'point') nub([tip[0] + ca * r * .5, tip[1] + sa * r * .5], [tip[0] + ca * r * 1.55, tip[1] + sa * r * 1.55], .26 * u, 'pt');
      else if (g.hp === 'open') nub([tip[0] + upY[0] * r * .5, tip[1] + upY[1] * r * .5], [tip[0] + (upY[0] * .9 + ca * .45) * r * 1.35, tip[1] + (upY[1] * .9 + sa * .45) * r * 1.35], .3 * u, 'op');
      else if (g.hp === 'hold' || g.hp === 'fist' || hold) piece(oval(tip[0] + upY[0] * r * .62 + ca * r * .1, tip[1] + upY[1] * r * .62 + sa * r * .1, .2 * u, .15 * u, g.ang, 12), col, { sw: sw * .6, key: key + 'tb', lift: 2, flatCard: true });
      out.hands[s < 0 ? 'L' : 'R'] = btTo(M0, [tip[0] + ca * r * .4, tip[1] + sa * r * .4]);
    }
    if (s > 0 && poseName === 'tray') {   // the tray balanced on the upturned mitt
      const tx = tip[0] + ca * .15 * u, ty = tip[1] - .92 * u;
      rs('tray'); btTray(tx, ty, J.trayW, o.tray || 'canapes', sw, tag + 'tray'); out.tray = btTo(M0, [tx, ty]);
    }
  };
  // ---- the legs: short chunky stumps, dangling (they sway a little on their own slow clock) or, seated, forward ----
  const leg = s => {
    const far = q && s > 0, key = tag + 'leg' + s, col = far ? mixCol(C.fur, C.furDk, .4) : C.fur;
    rs('leg' + s);
    const hip = seated ? [s * .78 + (q ? .45 : 0), 1.9] : [s * .8 + (q ? .22 : 0), 2.0];
    const sway = seated ? 0 : .06 * s + .07 * Math.sin(B.clk * TAU * .23 + s * 1.3 + (J.seed || 0)) + (q ? -.1 : 0);
    const len = seated ? .72 : 1.08, ang = Math.PI / 2 + sway + (seated ? (q ? -.55 : s * -.18) : 0);
    muLimb(muLimbPts(len, 1.0, 1.12, s * 3 + 7), hip, ang, u, col, { sw: sw * .95, shade: C.furDk, depth: .2 * u, key, lift: lift * .7 }, C);
    const fx = (hip[0] + Math.cos(ang) * len) * u, fy = (hip[1] + Math.sin(ang) * len) * u;
    if (ink) piece(oval(fx + (q ? .12 * u : 0), fy + .32 * u, .62 * u, .34 * u, q ? .15 : 0, 20), MU.shoe, { sw: sw * .9, key: key + 'shoe', lift: 2, flatCard: true });   // (the idiom's little oval shoe)
    else if (seated) piece(oval(fx, fy + .08 * u, .34 * u, .26 * u, 0, 16), mixCol(C.fur, MU.pad, .7), { sw: sw * .5, key: key + 'pad', lift: 1, flatCard: true, role: 'inner' });   // (a sole toward us)
  };
  // ---- draw: the far arm, the legs, the body, the fleece, the face; the tray held in front; the near arms ----
  if (q && !(spec(1)[4])) arm(1);
  for (const s of (q ? [1, -1] : [-1, 1])) leg(s);
  rs('body');
  if (STYLE.mode === 'bank') piece(S(bodyF), '#FFFFFF', { sw: sw * 1.1, key: tag + 'body', lift });   // (the engraving: paper, and the fur's curling hatch)
  else { piece(S(bodyF), C.fur, { sw: sw * 1.1, shade: ink ? null : C.furDk, depth: .5 * u, key: tag + 'body', lift }); muPencil(S(bodyF)); }
  muFleece(body, back ? null : F, u, sw, C, tag + v);
  if (back) {   // the round, generous bottom: a soft crease, and the hood's seam down the back
    dline(S([[.02, 1.62], [-.04, 2.1], [0, 2.62]]), sw * .7, card ? C.tuft : mixCol(C.furDk, NOIR.ink, .3), .5);
    out.head = btTo(M0, [0, -1.3 * u]);
  } else {
    rs('face');
    const FP = muFacePts(F);
    piece(S(FP), STYLE.mode === 'bank' ? '#FFFFFF' : C.face, { sw: sw * .62, role: 'inner', shade: ink ? null : C.faceDk, depth: .16 * u, key: tag + 'face', lift: Math.max(1, lift * .35) });
    out.head = btTo(M0, [F.cx * u, F.cy * u]);
    // blush, eyes, mouth
    const bl = .45 + .55 * clamp(o.blush || 0);
    F.cheeks.forEach(([cx, kw], i) => piece(oval((F.cx + cx) * u, (F.cy + .38) * u, .27 * kw * u, .16 * u, 0, 16), MU.cheek, { ink: null, op: 150 * bl + 60, key: tag + 'bl' + i, lift: 0, flatCard: true, edge: false }));
    const kinds = btEyeKinds(o, tt, J.seed || 0), eyeLook = [lk[0] * .06 * u, lk[1] * .05 * u];
    F.eyes.forEach(([ex, kw], i) => { push(); translate((F.cx + ex) * u, (F.cy + .02) * u); scale(kw, 1); muEye(0, 0, .15 * u * (ink ? 1.3 : 1), i ? 1 : -1, kinds[i], { sw, key: tag + 'e' + i, t: tt, skin: C.face, look: eyeLook, pie: ink }); pop(); });
    push(); translate((F.cx + F.mx + lk[0] * .03) * u, (F.cy + .44) * u); muMouth(.2 * u, o.mouth, { sw, key: tag + 'm', qk: F.qk }); pop();
    const sadEyes = ['sad', 'teary', 'cry'].includes(kinds[1].kind);   // (gloom only for real sadness: never a scheming shadow)
    if (o.gloom > .02 && sadEyes && !card) piece(S(muFacePts({ ...F, cy: F.cy - .45, ry: .5 })), NOIR.ink, { ink: null, op: 60 * o.gloom, key: tag + 'gloom', lift: 0, flatCard: true });
  }
  out.top = btTo(M0, [0, -3.02 * u]);
  if (seated && J.keyboard) J.keyboard();
  if (poseName === 'serve') { rs('tray'); const ty = 1.82 * u; btTray(q ? .3 * u : 0, ty, J.trayW, o.tray || 'bill', sw, tag + 'tray'); out.tray = btTo(M0, [q ? .3 * u : 0, ty]); }
  if (!q) { arm(-1); arm(1); } else { arm(-1); if (spec(1)[4]) arm(1); }
}

// Her own Muse: the Muse Charm (museCharm), as shown on stage: a black, glossy squircle puck; almost all of its face is
// the screen, a sheen across the top of the glass, a thin silver-grey rim, a camera dot at the top of the screen and a
// tiny button on the side. Jolly lives on the screen (small and full-length, clipped to the glass), typing at a tiny
// keyboard while it works, cheering when it's done, drooping when it's sad. It can leave the screen, as the film's bots
// do (Clawd out of his phone, the bots out of hers): out (0..1) its exit: a crouch, then the jump up and out across the
// screen's top edge, in view (drawn over the rim there, as if coming out of the glass); from 1 the screen is empty, black
// glass, and the shot draws Jolly in the room (charmExit: where it leaves from, and its size).
// museCharm(x, y, s, o): (x, y) the puck's middle, s its width (px). o: the feel()/emotions() spread for Jolly (eyes,
// mouth, emo...) · t · type (typing; default while its mood is happy, determined, neutral or thinking) · out · turn 0..1
// (1: turned to face its user on the left, 3/4: the face narrower, the rim's side showing on the right) · rot · page
// 0..1 (a page rising out of the screen's top edge as it's written) · frame (a matrix from btMat(): the anchors in its
// coordinates) · boilKey. Returns { top: the screen's top middle, exit: Jolly's middle as its feet leave the screen,
// uj: its unit there (px), mid: the puck's middle, page: the page's middle once it's out } in the caller's (or o.frame's)
// coordinates.
const MU_CH = { rim: '#C2C5CB', rimDk: '#8A8E97', rimLt: '#EEF0F3', glass: '#101116', glassLt: '#2A2D36', sheen: '#FFFFFF', cam: '#2C2F38', btn: '#A9ADB5' };
const MU_CH_J = { uj: .102, my: .06, top: -.4 };   // (Jolly's unit, and its middle, as fractions of the puck's width; the screen's top edge)
function museCharm(x, y, s, o = {}) {
  const id = o.boilKey ?? ++CLAWD_N, rs = p => boilSeed(`mc ${id} ${p}`), F0 = o.frame || btMat(), tt = btT(o), turn = clamp(o.turn || 0), kx = 1 - .24 * turn;
  const sw = clamp(s / 60, .45, 1.6), out = clamp(o.out || 0), res = {};
  const sq = (hw, hh, p, n = 48, cx = 0, cy = 0) => { const P = []; for (let i = 0; i < n; i++) { const a = i / n * TAU, c = Math.cos(a), sn = Math.sin(a); P.push([cx + hw * Math.sign(c) * Math.pow(Math.abs(c), 2 / p), cy + hh * Math.sign(sn) * Math.pow(Math.abs(sn), 2 / p)]); } return P; };
  push(); translate(x, y); if (o.rot) rotate(o.rot);
  const hw = .5 * s, hh = .47 * s, SCR = sq(hw * .86 * kx, hh * .87, 3.4, 48, -.03 * s * turn, .01 * s);   // (the glass; turned, it narrows toward its user)
  // the puck: its side (thickness) on the right when it's turned, the rim, the glass
  rs('body');
  if (turn > .02) piece(sq(hw * kx, hh, 3.2, 48, .07 * s * turn, 0), MU_CH.rimDk, { sw, key: 'mcside', lift: 3 });
  piece(sq(hw * kx, hh, 3.2, 48, -.02 * s * turn, 0), MU_CH.rim, { sw, shade: MU_CH.rimDk, depth: .05 * s, key: 'mcrim', lift: 3 });
  if (turn > .02) piece(curvy([[hw * kx + .01 * s, -.2 * s], [hw * kx + .045 * s * turn, -.19 * s], [hw * kx + .045 * s * turn, -.06 * s], [hw * kx + .01 * s, -.07 * s]], 2), MU_CH.btn, { sw: sw * .5, key: 'mcbtn', lift: 1, flatCard: true });   // (the side button)
  else piece(curvy([[hw - .004 * s, -.2 * s], [hw + .02 * s, -.19 * s], [hw + .02 * s, -.06 * s], [hw - .004 * s, -.07 * s]], 2), MU_CH.btn, { sw: sw * .5, key: 'mcbtn', lift: 1, flatCard: true });
  piece(SCR, MU_CH.glass, { sw: sw * .7, key: 'mcglass', lift: 1, role: 'inner' });
  const topY = Math.min(...SCR.map(p => p[1])), botY = Math.max(...SCR.map(p => p[1])), cx0 = -.03 * s * turn;
  res.mid = btTo(F0, [0, 0]); res.top = btTo(F0, [cx0, topY]);
  piece(oval(cx0, topY + .075 * s, .026 * s * kx, .026 * s, 0, 12), MU_CH.cam, { sw: sw * .4, key: 'mccam', lift: 0, flatCard: true, fine: true, role: 'inner' });
  // Jolly on the screen (or leaving it)
  const uj = s * MU_CH_J.uj, typing = o.type ?? ['happy', 'determined', 'neutral', 'thinking'].includes(o.emo);
  const crouch = ease(seg(out, 0, .35)), jump = seg(out, .35, 1), my0 = MU_CH_J.my * s, myOut = topY - 3.62 * uj;
  if (out < 1) {
    const flying = jump > 0, my = flying ? lerp(my0 + .25 * uj, myOut, easeOut(jump)) : my0 + .25 * uj * crouch;
    const rest = { L: [-1.05, 1.5, .2, 'relax', 1], R: [1.05, 1.5, .2, 'relax', 1] }, cheer = { L: [-2.4, -1.9, .2, 'open', 1], R: [2.4, -1.9, .2, 'open', 1] };
    const pose = flying ? cheer : o.emo === 'proud' || o.emo === 'excited' ? cheer : o.emo === 'sad' ? { L: [-1.2, 1.5, .2, 'relax', 1], R: [1.2, 1.5, .2, 'relax', 1] } : rest;
    const J = { o: { ...o, lookX: o.lookX ?? (typing && !out ? .15 : 0), lookY: o.lookY ?? (typing && !out ? .9 : flying ? -.4 : 0) }, C: muTint(o), sw: clamp(uj / 20, .45, 2.2), lift: uj * .12, tt, B: botGroove(tt, o, .5, 'mc' + id), G: { aL: 0, aR: 0 },
      v: 'front', pose, poseName: 'custom', out: { head: null, hands: { L: null, R: null } }, M0: btMat(), rs, tag: 'mcj', seated: !flying, typing: typing && !out, trayW: 0 };
    J.keyboard = () => muKeyboard(uj, J);
    // the screen is Jolly's world: clipped to the glass; leaving, to the glass and everything above its top edge (it comes
    // out across the edge, over the rim)
    const clipP = flying ? (() => { const L = SCR.filter(p => p[1] >= (topY + botY) / 2).sort((a, b) => b[0] - a[0]), xr = Math.max(...SCR.map(p => p[0])), xl = Math.min(...SCR.map(p => p[0])); return [[xr, topY - 40 * s], [xr, (topY + botY) / 2], ...L, [xl, (topY + botY) / 2], [xl, topY - 40 * s]]; })() : SCR;
    rs('jolly');
    clipPoly(clipP, () => {
      push(); translate(cx0, my); scale(kx * (flying ? .94 : 1 + .06 * crouch), flying ? 1.1 : 1 - .1 * crouch);
      if (typing && !out) translate(0, -.05 * uj * Math.abs(Math.sin(tt * TAU * 2.3)));
      muJolly(uj, J);
      pop();
    });
  }
  res.exit = btTo(F0, [cx0, myOut]);
  const ux = btTo(F0, [uj, 0]), u0 = btTo(F0, [0, 0]); res.uj = Math.hypot(ux[0] - u0[0], ux[1] - u0[1]);
  // the glass over it: a sheen across the top
  rs('sheen');
  clipPoly(SCR, () => {
    piece(sq(hw * .8 * kx, hh * .3, 2.4, 36, cx0 - .02 * s, topY + .1 * s), MU_CH.sheen, { ink: null, op: 34, key: 'mcsheen', lift: 0, flatCard: true, edge: false });
    piece(curvy([[cx0 - .3 * s * kx, topY + .045 * s], [cx0, topY + .02 * s], [cx0 + .3 * s * kx, topY + .045 * s], [cx0 + .28 * s * kx, topY + .07 * s], [cx0, topY + .05 * s], [cx0 - .28 * s * kx, topY + .07 * s]], 3), MU_CH.sheen, { ink: null, op: 90, key: 'mcsheen2', lift: 0, flatCard: true, edge: false });
  });
  // the page it's writing, rising out of the screen's top edge (clipped below the edge: it comes out of the glass)
  const pw = .62 * s, ph = pw * 1.3;
  res.page = btTo(F0, [cx0, topY - ph * .5]);   // (where the page stands once it's out, every frame: a shot sends it on from there)
  if (o.page > 0 && typeof b2CV === 'function') {
    const k = clamp(o.page), py = topY - ph * .5 * k;
    rs('page');
    clipPoly([[-2 * s, topY - 3 * s], [2 * s, topY - 3 * s], [2 * s, topY], [-2 * s, topY]], () => { push(); translate(cx0, py); b2CV(pw, 'mcpage', 1.1); pop(); });
  }
  pop();
  return res;
}
// the tiny keyboard on Jolly's lap (Jolly's own frame and unit): a dark slab seen a little from above, pale keys, the one
// under a tapping mitt lit
function muKeyboard(u, J) {
  const { sw, tt } = J, cy = 1.78 * u, w0 = 2.9 * u, w1 = 3.5 * u, h = 1.0 * u, typing = J.typing;   // (seen from a little above: its front edge wider)
  J.rs('kbd');
  piece([[-w0 / 2, cy - h / 2], [w0 / 2, cy - h / 2], [w1 / 2, cy + h / 2], [-w1 / 2, cy + h / 2]], MU.kbd, { sw: sw * .8, shade: MU.kbdDk, depth: h * .22, key: 'mukbd', lift: 2 });
  const lit = typing ? Math.floor(tt * 9.2) % 11 : -1;
  for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) {
    const fy = (r + .5) / 3, y = cy - h / 2 + fy * h * .9 + h * .05, ww = lerp(w0, w1, fy) * .86, x = -ww / 2 + (i + .5) / 6 * ww, kw = ww / 6 * .74, kh = h / 3 * .62, on = (r * 6 + i) % 11 === lit;
    if (r === 2 && i > 1 && i < 4) { if (i === 2) piece([[-ww / 6 - kw / 2 + ww / 12, y - kh / 2], [ww / 6 + kw / 2 - ww / 12, y - kh / 2], [ww / 6 + kw / 2 - ww / 12, y + kh / 2], [-ww / 6 - kw / 2 + ww / 12, y + kh / 2]], MU.key, { ink: null, key: 'mukeysp', lift: 0, flatCard: true, edge: false }); continue; }   // (the space bar)
    piece([[x - kw / 2, y - kh / 2], [x + kw / 2, y - kh / 2], [x + kw / 2, y + kh / 2], [x - kw / 2, y + kh / 2]], on ? MU.keyLit : MU.key, { ink: null, key: 'mukey' + r + i, lift: 0, flatCard: true, edge: false });
  }
}

function muse(x, y, u, o = {}) {
  if (o.wrist || o.charm) return museCharm(x, y, 3.2 * u, o);   // (her Muse: the Charm; wrist: the old name)
  const id = o.boilKey ?? ++CLAWD_N, rs = p => boilSeed(`mu ${id} ${p}`);
  const M0 = btMat(), tt = btT(o), flip = !!o.flip, seed = o.seed || 0, v = o.view === 'q' ? 'q' : o.view === 'back' ? 'back' : 'front';
  // musicality (clawd.js botGroove): accents on bar downbeats by default, the full beat bounce when a shot passes bounce
  const B = botGroove(tt, o, 1, 'mu' + id + seed), G = grooveAdd(o, B.full ? 1 : 0, B.full ? 1 : .6), alt = o.alt ?? 3.2, C = muTint(o);
  const sq = cardSq(((o.sq || 0) + G.sq + (o.take || 0)) * .5), sw = clamp(u / 20, .45, 2.2), lift = u * .12, dy = ((o.dy || 0) + G.dy) * .9 * u;
  const poseName = typeof o.pose === 'string' ? o.pose : o.pose ? 'custom' : o.tray ? 'tray' : 'idle';
  const out = { head: null, hands: { L: null, R: null }, bottle: null, tray: null, top: null };
  x += ((o.dx || 0) + G.dx) * u;
  // the float: dancing, it dips on the beat and drifts over two bars; otherwise it drifts on its own slow clock (never on
  // the beat), dipping only with an accent. o.float false: held where it's put (a shot moving it itself)
  const hk = idleHash('mu' + id) % 97, hover = o.float === false ? 0 : (-.5 * B.up + (B.full ? .14 * Math.sin(B.bp * Math.PI / 4) : .2 * Math.sin(tt * TAU / 3.4 + hk) + .06 * Math.sin(tt * TAU / 1.3 + hk * 2))) * u;
  if (!o.noShadow) { rs('shadow'); const k = 1 / (1 + (alt - hover / u) * .09); paint(oval(x, y + .1 * u, 2.2 * u * k, .36 * u * k, 0, 24), { wash: NOIR.ink, washOp: (STYLE.card ? 100 : 140) * k, ink: null }); }
  push(); translate(x, y + dy - (alt + 2.5) * u + hover); nudge('mu' + id, 1);
  rotate((o.rot || 0) + G.rot + B.lean * .9 + .03 * Math.sin(B.clk * Math.PI / 4));
  const ssq = sq + cardSq(B.sq * .7); scale((flip ? -1 : 1) * (1 + ssq * .5), 1 - ssq);
  const prevXF = XF; XF = flip ? -XF : XF;
  const pose = typeof o.pose === 'object' ? o.pose : MPOSE[poseName] || null;
  muJolly(u, { o, C, sw, lift, tt, B, G, v, pose, poseName, out, M0, rs, tag: 'mu', seed, hold: o.hold, holdL: o.holdL, trayW: (poseName === 'serve' ? 3.7 : 2.7) * u });
  XF = prevXF;
  pop();
  rs('emote'); if (o.emote) emote(o.emote, x + (flip ? -1 : 1) * 2.3 * u, y + dy - (alt + 5.8) * u + hover, u * .5, o.emoteK ?? 1, o.emoteAge ?? T);
  rs('after');
  return out;
}

// ---------- model sheets ----------
//   node render.mjs --page=demo/dev-lineup.html --query=look=ink --loop=bots --sheet=0.3 --cols=1 --w=1920 --out=out/demo/bots/sheet.jpg
(() => {
  const { label, stage, spot } = SHEET;
  LOOPS.bots = t => {
    stage(t); const tt = mt(t), u = 28, G = 905, L = (txt, x) => label(txt, x, 950, 18);
    spot(105); commuter(105, G, u, { ...feel('neutral', tt, { seed: 9 }), pose: 'idle', boilKey: 'cm' }); L('commuter (scale)', 105);
    spot(305); grok(305, G, u, { ...feel('neutral', tt, { seed: 1 }), boilKey: 'g1' }); L('grok · idle', 305);
    spot(530); const fs = .75 * u, g2 = grok(505, G, u, { ...feel('mischief', tt, { seed: 2 }), view: 'q', pose: 'pour', pourTo: G - 2.95 * fs, boilKey: 'g2' });
    if (g2.bottle) { push(); translate(g2.bottle.end[0], G - 1.38 * fs); rotate(Math.PI / 2); flute(fs, .5, 0, 'shflute'); pop(); }
    L('grok · q · pour', 540);
    spot(800); grok(800, G, u, { ...feel('neutral', tt, { seed: 3 }), view: 'q', flip: true, pose: 'serve', tray: 'canapes', boilKey: 'g3' }); L('grok · q · flip · serve', 790);
    spot(1010); grok(1010, G, u, { ...feel('excited', tt, { seed: 4 }), pose: 'wave', boilKey: 'g4' }); L('grok · wave', 1010);
    spot(1215); grok(1215, G, u, { ...feel('laugh', tt, { seed: 5 }), pose: 'laugh', boilKey: 'g5' }); L('grok · laugh', 1215);
    spot(1420); muse(1420, G, u, { ...feel('happy', tt, { seed: 6 }), pose: 'serve', tray: 'bill', boilKey: 'm1' }); L('muse · serve', 1420);
    spot(1610); muse(1610, G, u, { ...feel('neutral', tt, { seed: 7 }), pose: 'tray', tray: 'canapes', boilKey: 'm2' }); L('muse · tray', 1610);
    spot(1830); muse(1830, G, u, { ...feel('excited', tt, { seed: 8 }), view: 'q', flip: true, pose: 'wave', boilKey: 'm3' }); L('muse · q · flip · wave', 1810);
    muse(110, 1030, u * .42, { ...feel('happy', tt, { seed: 10 }), wrist: true, boilKey: 'm4' }); label('wrist', 210, 1022, 18);
  };
  LOOPS.bots.len = 4;
  LOOPS.botsFaces = t => {
    stage(t); const tt = mt(t), calm = { aL: -.2, aR: -.2 };
    ['neutral', 'happy', 'mischief', 'laugh', 'surprised', 'determined', 'sad', 'love'].forEach((e, i) => {
      const x = 122 + i * 239; spot(x, 330, 250);
      grok(x, 560, 40, { ...feel(e, tt, { seed: i }), ...calm, view: i % 2 ? 'q' : 'front', smoke: false, noShadow: true, boilKey: 'gf' + i });
      label(e, x, 590, 20);
    });
    ['neutral', 'happy', 'love', 'excited', 'surprised', 'sad', 'angry', 'sleepy'].forEach((e, i) => {
      const x = 122 + i * 239, u = 44;
      muse(x, 790 + 3.8 * u, u, { ...feel(e, tt, { seed: i }), ...calm, dy: 0, view: i % 2 ? 'q' : 'front', alt: 1.3, noShadow: true, boilKey: 'mf' + i });
      label(e, x, 965, 20);
    });
  };
  LOOPS.botsFaces.len = 4;
})();

// Muse's model sheet (Jolly), one look a sheet (?look=ink | card | doodle | xerox | bank):
//   node render.mjs --page=demo/dev-lineup.html --loop=jolly --query=look=card --sheet=0.3 --cols=1 --w=1920 --out=out/jolly/sheet_card.jpg
// A: the turnaround (front, 3/4, 3/4 flipped, back) and her Muse, the Charm (typing; turned to its user); B: the poses the scenes use (idle,
// wave, point, tray, serve, cheer, the thumbs up, a page held in both mitts, the flutes); C: the faces. LOOPS.jollyMouths:
// the lip-sync mouths (botLip's kinds) and the eyes, big.
(() => {
  const band = (m, y0, y1, G) => { if (typeof b2Band === 'function') b2Band(m, y0, y1, G); else SHEET.stage(0); };
  const lab = (txt, x, y, sz = 16) => inkRH() ? letter(txt, x, y, sz, NOIR.pastInk, { ink: false, alpha: .85 }) : SHEET.label(txt, x, y, sz);
  const lk = () => { const m = new URLSearchParams(location.search).get('look'); if (m) look(m); return STYLE.card ? 'card' : STYLE.mode; };
  const still = { blink: 0, idle: 0 };
  LOOPS.jolly = t => {
    const m = lk(), tt = mt(t);
    band(m, -20, 480, 440); band(m, 480, 770, 735); band(m, 770, 1100, 1100);
    lab('muse · jolly · ' + ({ xerox: 'riso', ink: 'rubber hose' }[m] || m), 150, 30, 20);
    // A: turnaround
    [['front', 190, {}], ['3/4', 470, { view: 'q' }], ['3/4 flipped', 750, { view: 'q', flip: true }], ['back', 1030, { view: 'back' }]].forEach(([n, x, ex], i) => {
      muse(x, 440, 44, { ...feel('happy', tt, { seed: i }), ...still, alt: 1.1, boilKey: 'jt' + i, emote: null, ...ex }); lab(n, x, 462);
    });
    museCharm(1420, 280, 190, { ...emotions(tt, [[0, 'determined']]), ...still, emote: null, boilKey: 'jc1', t: tt }); museCharm(1700, 280, 190, { ...feel('happy', tt), ...still, emote: null, turn: 1, boilKey: 'jc2', t: tt, type: false });
    lab('her Muse: the Muse Charm, Jolly on its screen', 1560, 462);
    // B: poses
    const cv = s => { push(); rotate(-.2); b2CVsafe(s * 2.4, 'jcv'); pop(); };
    [['idle', {}], ['wave', { pose: 'wave', e: 'excited' }], ['point', { pose: 'point', view: 'q' }], ['tray · canapés', { pose: 'tray', tray: 'canapes', view: 'q' }], ['serve · the bill', { pose: 'serve', tray: 'bill' }],
     ['cheer', { pose: 'cheer', e: 'excited' }], ['thumbs up', { pose: { L: [-3.6, .15, .08, 'thumb', 1], R: [2.4, 1.6, .25, 'relax'] }, e: 'hopeful' }], ['a page, both mitts', { pose: { L: [1.4, -.2, .35, 'hold', 1], R: [2.4, -.3, .3, 'hold', 1] }, page: 1, e: 'determined' }],
     ['tray · flutes', { pose: 'tray', tray: 'flutes', view: 'q', flip: true }]].forEach(([n, ex], i) => {
      const x = 115 + i * 212, e = ex.e || 'happy', o = { ...feel(e, tt, { seed: 10 + i }), ...still, alt: 1.1, emote: null, boilKey: 'jp' + i, ...ex };
      delete o.e; delete o.page;
      const A = muse(x, 735, 25, o); lab(n, x, 755, 14);
      if (ex.page) { boilSeed('jpage'); push(); translate(x + 1.67 * 25, 735 - 3.6 * 25 - .67 * 25); b2CVsafe(66, 'jpg'); pop(); }
    });
    // C: faces
    ['neutral', 'happy', 'excited', 'laugh', 'surprised', 'love', 'hopeful', 'determined', 'sad', 'sleepy'].forEach((e, i) => {
      const x = 105 + i * 190, u = 40;
      muse(x, 930 + 1.3 * u + 2.5 * u, u, { ...feel(e, tt, { seed: 20 + i }), ...still, aL: -.3, aR: -.3, alt: 0, noShadow: true, view: i % 3 === 2 ? 'q' : 'front', emote: null, boilKey: 'jf' + i, dx: 0, dy: 0 });
      lab(e, x, 800, 15);
    });
  };
  LOOPS.jolly.len = 4;
  LOOPS.jollyMouths = t => {
    const m = lk(), tt = mt(t);
    band(m, -20, 560, 560); band(m, 540, 1100, 1100);
    lab('muse · jolly · mouths (lip-sync: botLip) and eyes · ' + m, 400, 30, 20);
    ['smile', 'flat', 'grin', 'open', 'shout', 'O', 'o', 'teeth'].forEach((mo, i) => {
      const x = 125 + i * 238, u = 54;
      muse(x, 290 + 2.5 * u, u, { ...feel('happy', tt, { seed: i }), ...still, mouth: mo, eyes: 'normal', aL: -.4, aR: -.4, alt: 0, noShadow: true, emote: null, boilKey: 'jm' + i });
      lab(mo, x, 90, 18);
    });
    ['normal', 'happy', 'closed', 'wide', 'squeeze', 'heart', 'shine', 'narrow', 'angry', 'sad'].forEach((e, i) => {
      const x = 100 + i * 190, u = 48;
      muse(x, 850 + 1.3 * u + 3.8 * u, u, { ...feel('neutral', tt, { seed: i }), ...still, eyes: e, mouth: e === 'sad' ? 'frown' : 'smile', aL: -.4, aR: -.4, alt: 0, noShadow: true, emote: null, view: i % 2 ? 'q' : 'front', boilKey: 'je' + i });
      lab(e, x, 640, 16);
    });
  };
  LOOPS.jollyMouths.len = 4;
  // the Muse Charm: Jolly on its screen (typing, the page coming out, cheering, sad), and its exit (the crouch, crossing
  // the screen's top edge, the empty glass); turned to its user; held in her hand
  LOOPS.jollyCharm = t => {
    const m = lk(), tt = mt(t);
    band(m, -20, 540, 540); band(m, 540, 1100, 1100);
    lab('muse · the muse charm · ' + ({ xerox: 'riso', ink: 'rubber hose' }[m] || m), 170, 30, 20);
    [['typing', { ...feel('determined', tt), page: 0 }], ['writing the page', { ...feel('determined', tt), page: .7 }], ['done: a cheer', { ...feel('proud', tt), type: false }], ['sad', { ...feel('sad', tt), type: false }]]
      .forEach(([n, o], i) => { const x = 240 + i * 480; museCharm(x, 300, 300, { ...o, ...still, emote: null, boilKey: 'jcs' + i, t: tt }); lab(n, x, 500); });
    [['the crouch', .3], ['out across the edge', .62], ['nearly out', .9], ['gone: empty glass', 1]].forEach(([n, k], i) => {
      const x = 240 + i * 480; museCharm(x, 860, 300, { ...feel('excited', tt), ...still, emote: null, out: k, boilKey: 'jcx' + i, t: tt, type: false }); lab(n, x, 1060);
    });
  };
  LOOPS.jollyCharm.len = 4;
  // (the sheets' page prop: bots2.js's CV when the page has it)
  function b2CVsafe(w, key) { if (typeof b2CV === 'function') b2CV(w, key, 1); else piece(oval(0, 0, w * .5, w * .65, 0, 16), '#F7F3EA', { key }); }
})();

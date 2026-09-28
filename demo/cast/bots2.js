// cast/bots2.js: four more AI-assistant mascots. Our own parody takes, not the companies' artwork.
//
//   copilot(x, y, u, o)  after GitHub Copilot's goggled pilot head: a keen little pilot bot, ~8u to the top of its cap (the
//                        commuter is ~13.4u). A round leather flying cap with a crown button and ear flaps, big brass flight
//                        goggles that ARE its eyes (pie-cut pupils behind the glass), a pale metal face, a silk scarf that
//                        streams out behind it, a stubby khaki flight suit with a belt and a wings pin, noodle arms, white
//                        gloves, little boots. The narrator's replacement: an eager mimic.
//   gemini(x, y, u, o)   after Gemini: the Gemini TWINS, two small gumdrop blob-bots (~5.6u to the sparkle, blue and violet)
//                        with Gemini's four-point sparkle on a stalk, holding hands and moving in mirrored sync. HR lanyards
//                        and badges; fixed smiles. Drawn as a pair centred on x.
//   codex(x, y, u, o)    the Codex pets (the Codex app's own companions), led by Codey: a family of small (~4-5u) toy-like
//                        pets. o.kind: codey (the blue cloud-headed bot with a screen face), dewey, fireball, rocky, seedy,
//                        stacky, bsod, null, hoot; the old kinds are aliases (term → codey, cat → seedy, ghost → dewey,
//                        crab → fireball, dog → bsod). See the Codex section below.
//   clawd2(x, y, u, o)   Clawd, the kit's clawd() (the terracotta block with slit eyes and four stubby legs), redrawn on the
//                        style layer so it renders in every look. Same u and body coordinates as clawd(): 10u wide, 8u tall.
//
// (x, y) = the ground point under the character (gemini: under the middle of the pair). u = unit, the commuter's, so sizes
// compare directly. All four take feel()/emotions() spreads (dx, dy, sq, take, rot, eyes, mouth, lookX/Y, squint, blush,
// gloom, tint, emote, emoteK, emoteAge, aL/aR for the idle arms) and:
//   view 'front' | 'q' (3/4, facing right) · flip (face left) · pose (a name from the bot's pose table, or { L, R } hand
//   targets [x, y, bend, hand pose, front, hand angle] in u, from the ground point before the flip) · hold / holdL (s =>
//   draws a prop in the right / left hand) · tilt (head, rad) · boilKey · seed (blink timing) · t (the clock for the
//   bounce and the little loops; default mt(T)) · bounce: a number asks for the full rubber-hose bounce on every beat,
//   that size (dances, the rave; 0 = still); left out, a bot doesn't hop on every beat: small accents on bar downbeats,
//   and its idle loops (Copilot's scarf, the twins' sparkles, tails, ears) on clocks of their own (clawd.js botGroove) ·
//   noShadow
// Hand poses: relax | open | point | fist | thumb | hold | none, plus thumbUp / thumbDown (the thumb turned up or down
// whichever way the hand points). b2Poses(TABLE, t, keys) blends between named poses over time, like poses().
//
// copilot also: seated (sits in an office chair; pose 'sit' implies it) · seatH (seat height, u, default 3.3) · chair
//   (false: sit on whatever the shot provides) · keyboard (a keyboard under the hands; default on in 'typing') · tap (the
//   typing clock for its 'keys' gloves: default its t × 12 in 'typing') · late ({ L, R, out }: front arms queued to be drawn
//   again over what the hands lie on, like person()'s o.late 'arm') · card
//   (the leaving card in 'present': default true; or a function (s) drawing another prop) · disguise (HER look, cheaply:
//   a curly bun wig with a pencil, round glasses over the goggles, a tomato-red scarf) · cheap 0..1 (thinner, paler,
//   crooked goggles, a cracked lens, sticky-tape repairs, a shorter frayed scarf, and it bounces a touch late) · walk
//   poses: idle mimic typing present wave sit point cheer shrug
// gemini also: gap (u between the twins' centres; the pose sets a default) · solo ('A' | 'B': one twin only; holdIn: a prop
//   in its inner hand) · face
//   ('same' | 'in': in 3/4 both face the view's way, or turn to face each other) · lanyard (default true) · fixed (the HR
//   smile whatever the mood) · door (the double doors in 'door', default true; doorW, doorH in u) · drop 0..1 (the CV's
//   fall in 'bin'; default: once a bar) · bin (false: no bin)
//   poses: idle door bin paddle thumbsDown (alias 'thumbs-down') thumbsUp wave cheer point (a custom pose is { O, I }:
//   A's outer and inner hand targets, B mirrors them)
// codex also: kind (codey | dewey | fireball | rocky | seedy | stacky | bsod | null | hoot, or an old name) · cap (a school
//   cap: true or a colour) · satchel · lock (the lock plate in 'pick', default true) · walk · screen ('prompt': a screen
//   face shows its >_) · mask is ignored (no burglar masks: the bot rule) · poses: idle sneak pick run cheer wave point
//   proud (hands on hips) chin (thinking); CX_ALL: all nine, CX_KINDS: the five for five-slot scenes
// clawd2 also: aL / aR (arm raise angles, as clawd()) · walk · pose idle | wave | cheer | hug | shrug | down · emotions
//   map onto the kit's eyes and mouths (the lunchbox lid is not drawn)
// Each returns anchors in the caller's coordinates (px): { head, hands: { L, R }, top, ... }.
// Props (drawn around (0, 0), for hold callbacks or sets): b2LeavingCard(w) (the "one of a kind" card: a gold star, no
// words), b2PermissionCard(w) (a dialog with a padlock, a tick and a cross), b2Keyboard(w), b2Chair(u, sw, seatY, q, part),
// b2Doorway(u, sw, DW, DH, LW), b2Bin(u, sw, part), b2CV(w), b2Bat(s), b2Pick(s, wiggle), b2LockPlate(s).
// Sheets: LOOPS.bots2, bots2Looks, bots2Faces, and close-ups bots2Cop, bots2Gem, bots2Cx, bots2Cl; add
// --query=look=ink (or doodle, xerox, bank) to draw any of them but bots2Looks in another look.

// ---------- palettes ----------
const B2CP = {
  cap: '#704A32', capDk: '#472A1A', capLt: '#A0714E', seam: '#2E1A10', fleece: '#EFE3CC', fleeceDk: '#C8B594',
  face: '#CBD4DC', faceDk: '#8E9AA8', faceLt: '#F0F4F7',
  suit: '#8F8C5B', suitDk: '#64613B', suitLt: '#BBB887',
  rim: '#D6A444', rimDk: '#98691F', rimLt: '#F6DA8E',
  lens: '#CDEFEA', lensDk: '#7FB6AF', pupil: '#16121A',
  scarf: '#F2EADA', scarfDk: '#C7BBA2',
  boot: '#3B3443', bootLt: '#6A6076', sole: '#554C5E',
  belt: '#6E4B2E', beltDk: '#4A301C', mouth: '#3A1628', tongue: '#E4647F', cheek: '#EE8A9C',
  tape: '#EADC96', tapeDk: '#B7A862',
  hair: '#3A2217', hairLt: '#7A5236', hairDk: '#24140C', glasses: '#6A3E22', her: '#D8432E', herDk: '#9C2A1C',
  pencil: '#E8B83A', pencilDk: '#A87E1A', lead: '#3A3036', wood: '#EACBA2',
  chair: '#4F5B73', chairDk: '#343D50', chairLt: '#7C89A4', plastic: '#302E36', plasticLt: '#58555F', chrome: '#BAC0CA', chromeDk: '#7E8591',
  key: '#C9C2B6', keyDk: '#A29C92', board: '#3A3844', card: '#F4ECDA', cardDk: '#CDBF9F', star: '#E8B83A', starDk: '#A87E1A',
};
const B2GM = {
  A: { col: '#66AEF0', dk: '#3F7CC8', lt: '#BCDFFB', belly: '#9ACCF7', spark: '#B59AF2', sparkDk: '#7E62CC' },
  B: { col: '#A983E6', dk: '#7654C2', lt: '#DCCBF8', belly: '#C8AEF2', spark: '#8FC0F6', sparkDk: '#4F86D4' },
  eye: '#1D2142', shoe: '#2E3150', shoeLt: '#5C618C', sole: '#4A4F74', lanyard: '#E0504E', lanyardDk: '#A83434', badge: '#F7F4EC', clip: '#B9BEC8',
  mouth: '#3A1630', tongue: '#F07A96', tooth: '#FFFDF6', cheek: '#F28BB0',
  frame: '#80858E', frameDk: '#585D66', leaf: '#C7A67C', leafDk: '#94764E', leafLt: '#E2C9A2', out: '#262C38', outLt: '#3C4556', window: '#A9C8DA',
  exit: '#2E9E5B', exitDk: '#1E6E3E', exitLt: '#F2FFF4', steel: '#B9BEC8', steelDk: '#7F8591',
  bin: '#8C939E', binDk: '#5B616C', binLt: '#C2C8D0', binIn: '#2F3440', paper: '#F7F3EA', paperDk: '#C9C2B2', line: '#A0A6AE', photo: '#9BC0E4',
  rubber: '#D23A3F', rubberDk: '#98232A', wood: '#D2A26A', woodDk: '#9C7240',
};
const B2CX = {
  codey:    { col: '#5A82F0', dk: '#3553C0', lt: '#8FB0FA', screen: '#232D66', glyph: '#9CFCFE', chest: '#F4F9FF' },
  dewey:    { col: '#57CDF8', dk: '#2596D8', lt: '#B4ECFD', hl: '#FFFFFF', cheek: '#F59AB0' },
  fireball: { col: '#F2642A', dk: '#A8321A', lt: '#FF9A5A', face: '#FCE0B4', faceDk: '#D9B383', body: '#FCE0B4', bodyDk: '#D9B383', emb: '#7A1E14', stripe: '#FF8A2A', flame: '#FF7A1A', flameLt: '#FFD23A', flameDk: '#D8401E', cheek: '#F59AA4' },
  rocky:    { col: '#9C8468', dk: '#62503D', lt: '#C2AC8E', face: '#EAD7BF', faceDk: '#C4AE93', cheek: '#EE9AA2' },
  seedy:    { col: '#EFE3BE', dk: '#B7A77A', lt: '#FFF8E2', face: '#FAF2D8', stem: '#7A5A34', leaf: '#A9BE5C', leafDk: '#6E7E36', leafLt: '#D2DD8E', badge: '#8FA84A', cheek: '#F2A2AE' },
  stacky:   { col: '#403A55', dk: '#26222F', lt: '#6C6783', face: '#5A5373', cheek: '#B79AE6', wire: '#2A2633', tipA: '#B89CF0', tipB: '#6BE08A', rim: '#6C6783' },
  bsod:     { col: '#ECE8EC', dk: '#A7A0AA', lt: '#FFFFFF', screen: '#1E7BEA', screenLt: '#62A8F8', glyph: '#0C1D4A', cheek: '#F59AB6', wire: '#5A5E6A', ball: '#4FA8FF', ballDk: '#2A6FC4' },
  null:     { col: '#2B2931', dk: '#141318', lt: '#55525E', screen: '#170C10', scan: '#26141B', glyph: '#FF4A3A', mark: '#8E8998', wire: '#1E1D24', rim: '#55525E' },
  hoot:     { col: '#E0782E', dk: '#A44A1A', lt: '#F6A860', face: '#F8D6AA', belly: '#F4BB88', glass: '#5E3522', beak: '#F4B834', beakDk: '#B8801A', eye: '#FFF8EE', pupil: '#2A140C', leg: '#F4B834', legDk: '#B8801A' },
  shoe: '#2F2735', shoeLt: '#6E6276', sole: '#4B4252', cap: '#7C2638', capDk: '#521826', capLt: '#A8465A', gold: '#E2B448', goldDk: '#A47C22',
  satchel: '#8A5A32', satchelDk: '#5C3A1E', satchelLt: '#B07A4A', strap: '#6B4526', mask: '#1C1820',
  pick: '#C9CED6', pickDk: '#80868F', plate: '#C9A24A', plateDk: '#8E6E24', plateLt: '#EED58E', hole: '#16121A',
};

// ---------- helpers ----------
// The current model matrix as a 2D affine [a, b, c, d, e, f], to hand back anchors in the caller's coordinates.
function b2Mat() {
  try { const m = p5.instance._renderer.states.uModelMatrix.mat4; return [m[0], m[1], m[4], m[5], m[12], m[13]]; }
  catch (e) { return [1, 0, 0, 1, 0, 0]; }
}
const b2Apply = (M, p) => [M[0] * p[0] + M[2] * p[1] + M[4], M[1] * p[0] + M[3] * p[1] + M[5]];
function b2Inv(M) { const [a, b, c, d, e, f] = M, det = a * d - b * c || 1e-9; return [d / det, -b / det, -c / det, a / det, (c * f - d * e) / det, (b * e - a * f) / det]; }
const b2To = (M0, p) => b2Apply(b2Inv(M0), b2Apply(b2Mat(), p));
// Continue drawing in the frame M (a b2Mat() taken earlier), wherever this is called from: a rig's late redraws.
function b2At(M) { const I = b2Inv(b2Mat()); applyMatrix(I[0] * M[0] + I[2] * M[1], I[1] * M[0] + I[3] * M[1], I[0] * M[2] + I[2] * M[3], I[1] * M[2] + I[3] * M[3], I[0] * M[4] + I[2] * M[5] + I[4], I[1] * M[4] + I[3] * M[5] + I[5]); }
// Undo the rotation (and mirror) added since frame Mc was captured, so a held prop can stand upright in the character.
function b2Upright(Mc) {
  const [a, b, c, d] = b2Mat(), [ia, ib, ic, id] = b2Inv(Mc), ra = ia * a + ic * b, rb = ib * a + id * b, rc = ia * c + ic * d, rd = ib * c + id * d;
  if (ra * rd - rb * rc < 0) scale(1, -1);
  rotate(-Math.atan2(rb, ra));
}
const b2T = o => o.t ?? mt(T);
// The rubber-hose bounce, locked to the beat: sink and squash on the beat, rise between, lean on alternate beats. (The rigs
// now take their musicality from clawd.js botGroove, which gives this only when a shot passes o.bounce.)
function b2Bounce(t, amt = 1) {
  const bp = bpOf(t), f = frac(bp), hit = pulse(t, 7);
  return { bp, f, hit, up: amt * (.5 - .5 * Math.cos(f * TAU)), sq: amt * (.13 * hit - .055 * Math.abs(Math.sin(f * TAU))), lean: amt * .055 * Math.sin(bp * Math.PI) };
}
// Mood tints shift a palette's listed fields a little (angry flushes, sad goes blue).
function b2Tint(P, o, fields, k0 = .28) {
  const tc = o.tint && (TINT[o.tint] || o.tint), k = clamp(o.tintK ?? 1) * k0;
  if (!tc || k <= 0) return P;
  const R = { ...P }; for (const f of fields) if (P[f]) R[f] = mixCol(P[f], tc, k);
  return R;
}
// Which eye kinds to draw ([left, right]), with blinks and the squint of an acted emotion change folded in.
function b2EyeKinds(o, tt, seed) {
  const k = Array.isArray(o.eyes) ? o.eyes : o.eyes === 'wink' ? ['happy', 'normal'] : [o.eyes || 'normal', o.eyes || 'normal'];
  const blink = ((tt * .9 + seed * 1.7) % 3.3) < .1, sqz = clamp(o.squint || 0);
  return k.map(e => ({ kind: e, blink: blink && ['normal', 'look', 'wide', 'shine', 'dot', 'blank'].includes(e), sqz }));
}
// A brush-stroke line as a closed shape, fat in the middle and fine at the ends (mouth lines, brows, cracks).
function b2Taper(P, w, n = 8) {
  const C = through(P, n), m = C.length, L = [], R = [];
  for (let i = 0; i < m; i++) {
    const a = C[Math.max(0, i - 1)], b = C[Math.min(m - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, k = i / (m - 1), ww = w * (.3 + .7 * Math.sin(Math.PI * k)) / 2;
    L.push([C[i][0] - dy / d * ww, C[i][1] + dx / d * ww]); R.push([C[i][0] + dy / d * ww, C[i][1] - dx / d * ww]);
  }
  return L.concat(R.reverse());
}
// A rounded bar from a to b, w0 wide at a and w1 at b (straps, tape, pencils, chair spokes).
function b2Bar(a, b, w0, w1 = w0) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), c = Math.cos(ang), s = Math.sin(ang), P = [];
  const at = (o, t, w) => [o[0] + Math.cos(t) * w / 2 * c - Math.sin(t) * w / 2 * s, o[1] + Math.cos(t) * w / 2 * s + Math.sin(t) * w / 2 * c];
  for (let i = 0; i <= 6; i++) P.push(at(a, Math.PI / 2 + i / 6 * Math.PI, w0));
  for (let i = 0; i <= 6; i++) P.push(at(b, -Math.PI / 2 + i / 6 * Math.PI, w1));
  return P;
}
// A rounded "squircle" (screens, badges, chair backs): half sizes hw × hh, p = squareness (2 = ellipse).
function b2Squircle(cx, cy, hw, hh, p = 4, n = 44) {
  const out = []; for (let i = 0; i < n; i++) { const a = i / n * TAU, c = Math.cos(a), s = Math.sin(a); out.push([cx + hw * Math.sign(c) * Math.pow(Math.abs(c), 2 / p), cy + hh * Math.sign(s) * Math.pow(Math.abs(s), 2 / p)]); }
  return out;
}
// A ring (goggle rims, glasses) as one closed shape; the seam sits at angle a0.
function b2Ring(cx, cy, rx, ry, t, a0 = Math.PI / 2, n = 32) {
  const o = [], i = [];
  for (let j = 0; j <= n; j++) { const a = a0 + j / n * TAU; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); i.push([cx + Math.cos(a) * (rx - t), cy + Math.sin(a) * (ry - t)]); }
  return o.concat(i.reverse());
}
// The outline of a union of circles [[x, y, r], ...] walked by angle round c (inside them all): clouds, curls, puffs.
function b2Blob(circles, c, n = 72) {
  const P = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU, ux = Math.cos(a), uy = Math.sin(a); let d = 0;
    for (const [bx, by, br] of circles) { const px = bx - c[0], py = by - c[1], b = px * ux + py * uy, cc = px * px + py * py - br * br, D = b * b - cc; if (D >= 0) d = Math.max(d, b + Math.sqrt(D)); }
    P.push([c[0] + ux * d, c[1] + uy * d]);
  }
  return P;
}
// Gemini's sparkle: a four-point star with curved, pinched sides (p > 2 pinches it), radius r, turned by rot.
function b2Sparkle(cx, cy, r, rot = 0, p = 2.7, n = 48) {
  const P = [], c0 = Math.cos(rot), s0 = Math.sin(rot);
  for (let i = 0; i < n; i++) { const a = i / n * TAU, c = Math.cos(a), s = Math.sin(a), x = r * Math.sign(c) * Math.pow(Math.abs(c), p), y = r * Math.sign(s) * Math.pow(Math.abs(s), p); P.push([cx + x * c0 - y * s0, cy + x * s0 + y * c0]); }
  return P;
}
// A light highlight as a piece (dline() prints every line in the banknote's ink, so glints are small pale pieces).
function b2Glint(P, key, op = 230) { if (inkFigOn() && INK_FIG.flat) return; piece(P, '#FFFFFF', { ink: null, op, key, lift: 0, flatCard: true, edge: false }); }   // (ink: a bot's flat fills carry no glints)
// A dark facial feature (a pupil, an eye slit, a mouth line): a piece, except in the drawn looks, where small dark
// shapes would vanish into hatching: the banknote engraves them solid in its ink, the doodle fills them in with biro.
function b2Feat(P, col, o = {}) {
  const dark = lum(col) < .3;
  if ((dark || o.solid) && (STYLE.mode === 'bank' || STYLE.mode === 'doodle' || STYLE.mode === 'engrave')) {   // (o.solid: hearts too)
    if (STYLE.mode === 'doodle') { biroFill(P, dark ? BIRO : vivid(col)); return; }   // filled in with the pen, like the rest of the drawing
    const c = STYLE.mode === 'bank' ? (dark ? BANK.ink : mixCol(BANK.ink, col, .45)) : E_INK;
    _paint(P, { wash: c, washOp: 255, ink: null }); return;
  }
  piece(P, col, o);
}
// Blend between named poses over time: keys [[t, name], ...] (names from TABLE, or { L, R }); each change eases in over
// `blend` s with a rubbery overshoot. Pass the result as o.pose.
function b2Poses(TABLE, t, keys, blend = .3) {
  let i = 0; while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
  const get = n => typeof n === 'string' ? TABLE[n] : n, cur = get(keys[i][1]); if (i === 0 || !cur) return cur;
  const prev = get(keys[i - 1][1]); if (!prev) return cur;
  const k = backOut(seg(t, keys[i][0], keys[i][0] + blend));
  const mix = (a, b) => !a || !b || typeof a === 'string' || typeof b === 'string' ? (k < .5 ? a : b) : [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k), k < .5 ? a[3] : b[3], k < .5 ? a[4] : b[4], a[5] != null && b[5] != null ? lerp(a[5], b[5], k) : (k < .5 ? a[5] : b[5])];
  const out = {}; for (const f of new Set([...Object.keys(prev), ...Object.keys(cur)])) out[f] = mix(prev[f], cur[f]);
  return out;
}

// ---------- eyes and mouths ----------
// Eye settings for the pie-cut eyes (the kit's eye names).
const B2EYE = {
  normal: {}, look: {}, wide: { tall: 1.14, pupil: .72 }, scared: { tall: 1.16, pupil: .48, shake: 1 },
  blank: { pupil: .42 }, dot: { pupil: .5 }, happy: { line: 'happy' }, closed: { line: 'closed' }, sleepy: { lid: .62 },
  narrow: { lid: .42, pupil: .8 }, angry: { lid: .3, slant: .4 }, determined: { lid: .24, slant: .26 }, bored: { lid: .45 },
  red: { lid: .3, slant: .4, red: 1 }, sad: { lid: .26, slant: -.38 }, teary: { lid: .2, slant: -.32, tear: 1 },
  cry: { line: 'squeeze', tear: 1 }, squeeze: { line: 'squeeze' }, x: { line: 'x' }, swirl: { swirl: 1 },
  heart: { heart: 1 }, spark: { star: 1 }, shine: { pupil: 1.12, shine: 1 }, shades: { line: 'shades' },
};
// A pie-cut eye at (x, y): a white w × h and a black pupil with a wedge cut toward the light (the 1930s eye). Lids in
// o.skin come down (angry slants the inner corner down, sad the outer) and up. side -1 = screen-left eye, 1 = right.
// o: sw, look [x, y] -1..1, skin, key, t, white, dark (pupil), whiteInk (outline colour, null = none), fixed (the eye
// can't grow: goggles), keepWhite (line eyes are drawn on the white: a lens), lidPad (px the lid overhangs the white),
// rot, lift
function b2PieEye(x, y, w, h, side, spec, o) {
  const E = { ...(B2EYE[spec.kind] || {}) }, sw = o.sw, k = o.key, dark = o.dark || NOIR.ink, skin = o.skin;
  if (spec.blink || spec.sqz > .85) { E.line = 'closed'; delete E.tear; }
  else if (spec.sqz > 0 && !E.line) E.lid = Math.max(E.lid || 0, spec.sqz * .9);
  if (o.fixed) E.tall = 1;
  push(); translate(x, y); if (o.rot) rotate(o.rot);
  const rx = w / 2, ry = h / 2 * (E.tall || 1), wc = o.white || '#F6F1E6';
  const white = () => b2Feat(oval(0, 0, rx, ry, 0, 32), wc, { sw: sw * (o.whiteSw ?? .85), ink: o.whiteInk, key: k + 'w', lift: o.lift ?? 2, flatCard: true });
  const tear = (tx, ty, s) => b2Feat(curvy([[tx, ty], [tx + rx * .28 * s, ty + ry * .5], [tx, ty + ry * .72], [tx - rx * .28 * s, ty + ry * .5]], 4), '#8EC3E6', { sw: sw * .5, key: k + 'tear', lift: 1, flatCard: true });
  if (E.line) {
    if (o.keepWhite) white();
    const lc = o.lineCol || dark, wl = Math.max(w * .2, sw * 1.6);
    let P = null;
    if (E.line === 'happy') P = ribbon([[-rx * .9, ry * .3], [-rx * .45, -ry * .22], [0, -ry * .36], [rx * .45, -ry * .22], [rx * .9, ry * .3]], wl, wl * .8);
    else if (E.line === 'closed') P = ribbon([[-rx * .9, -ry * .02], [-rx * .45, ry * .22], [0, ry * .28], [rx * .45, ry * .22], [rx * .9, -ry * .02]], wl * .9, wl * .75);
    else if (E.line === 'squeeze') P = ribbon([[-rx * .7 * -side, -ry * .45], [rx * .55 * -side, 0], [-rx * .7 * -side, ry * .45]], wl * .9, wl * .75);
    if (P) b2Feat(P, lc, { ink: null, key: k + 'ln', lift: 1, flatCard: true });
    if (E.line === 'x') for (const d of [-1, 1]) b2Feat(ribbon([[-rx * .7, -ry * .45 * d], [rx * .7, ry * .45 * d]], wl * .8), lc, { ink: null, key: k + 'x' + d, lift: 1, flatCard: true });
    if (E.line === 'shades') {
      b2Feat(curvy([[-rx * 1.15, -ry * .5], [rx * 1.15, -ry * .55], [rx * 1.0, ry * .35], [0, ry * .6], [-rx * .95, ry * .4]], 4), '#1E1A24', { sw: sw * .8, key: k + 'sh', lift: 1, flatCard: true });
      b2Glint(curvy([[-rx * .7, -ry * .15], [-rx * .35, -ry * .38], [-rx * .25, -ry * .28], [-rx * .6, -ry * .02]], 3), k + 'shg', 160);
    }
    if (E.tear) tear(rx * .45 * -side, ry * .4, -side);
    pop(); return;
  }
  white();
  const lk = o.look || [0, 0], ps = E.pupil ?? 1, pr = rx * .6 * ps, pry = ry * .6 * ps, shake = E.shake ? Math.sin((o.t || 0) * 60 + side) * rx * .06 : 0;
  const px = clamp(lk[0], -1, 1) * (rx - pr) * .8 + shake, py = clamp(lk[1], -1, 1) * (ry - pry) * .75 + ry * .1;
  if (E.heart) b2Feat(heartPts(px, py, pr * 1.25 * (1 + .1 * pulse(o.t || 0))), '#E2476E', { solid: true, sw: sw * .5, key: k + 'ht', lift: 1, flatCard: true });
  else if (E.star) { b2Feat(oval(px, py, pr, pry, 0, 20), dark, { ink: null, key: k + 'p', lift: 1, flatCard: true }); b2Feat(starPts(px, py, pr * .9 * (1 + .12 * Math.sin((o.t || 0) * 14)), .4, 4), '#FFE9A8', { ink: null, key: k + 'st', lift: 0, flatCard: true }); }
  else if (E.swirl) { const sp = []; for (let i = 0; i < 16; i++) { const a = i * .75 + (o.t || 0) * 6 * side, r = i / 16 * rx * .8; sp.push([Math.cos(a) * r, py * .3 + Math.sin(a) * r * 1.1]); } b2Feat(ribbon(sp, Math.max(sw, rx * .12)), dark, { ink: null, key: k + 'sw', lift: 1, flatCard: true }); }
  else {
    const [lx, ly] = lightLocal(), aw = Math.atan2(ly, lx) - (o.rot || 0), hw = .5, P = [[px + Math.cos(aw) * pr * .04, py + Math.sin(aw) * pry * .04]];
    for (let i = 0; i <= 22; i++) { const a = aw + hw + i / 22 * (TAU - 2 * hw); P.push([px + Math.cos(a) * pr, py + Math.sin(a) * pry]); }
    b2Feat(P, E.red ? '#B0142C' : dark, { ink: null, key: k + 'p', lift: 1, flatCard: true });
    if (E.shine) b2Feat(oval(px + pr * .3, py + pry * .4, pr * .18, pr * .18, 0, 8), wc, { ink: null, key: k + 'sh', lift: 0, flatCard: true });
  }
  // lids: the eye's own outline (a touch larger, to cover it) clamped at the lid line, so a lid never sticks out past it
  const pad = o.lidPad ?? sw * 3.2, Lx = rx + pad, Ly = ry + pad, ring = oval(0, 0, Lx, Ly, 0, 36), lid = clamp(E.lid || 0);
  if (lid > .02) {
    const yb = lerp(-ry * 1.05, ry * .95, lid), sl = (E.slant || 0) * ry, edge = xx => yb + sl * (xx * -side / rx) + ry * .1 * (1 - (xx / rx) ** 2);
    b2Feat(ring.map(([a, b]) => [a, Math.min(b, edge(a))]), skin, { ink: null, key: k + 'lid', lift: 0, flatCard: true, edge: false });
    const span = []; for (let i = 0; i <= 12; i++) { const xx = lerp(-rx * 1.05, rx * 1.05, i / 12), yy = edge(xx); if ((xx / (rx * 1.02)) ** 2 + (yy / (ry * 1.02)) ** 2 < 1) span.push([xx, yy]); }
    if (span.length > 1) dline(span, sw * .95, dark, .4);
  }
  if (E.tear) tear(rx * .55 * -side, ry * .55, -side);
  pop();
}
// A glossy dot eye (blobs, ghosts): a dark oval r wide with highlights, and the kit's eye names as arcs, hearts, stars.
// o: sw, look [x, y] px offset, skin (lid colour), dark, key, t, tall (height / width)
function b2DotEye(x, y, r, side, spec, o) {
  const dark = o.dark || NOIR.ink, k = o.key, sw = o.sw, t = o.t || 0, tall = o.tall ?? 1.3, lk = o.look || [0, 0];
  let e = spec.kind; if (spec.blink || spec.sqz > .85) e = 'closed';
  push(); translate(x + lk[0], y + lk[1]);
  const arc = (P, w) => b2Feat(ribbon(P, w, w * .8), dark, { ink: null, key: k + 'a', lift: 0, flatCard: true });
  switch (e) {
    case 'happy': arc([[-r * .95, r * .35], [0, -r * .5], [r * .95, r * .35]], r * .44); break;
    case 'closed': arc([[-r * .95, -r * .05], [0, r * .42], [r * .95, -r * .05]], r * .4); break;
    case 'squeeze': case 'cry': case 'x': arc([[-r * .75 * -side, -r * .65], [r * .6 * -side, 0], [-r * .75 * -side, r * .65]], r * .4); break;
    case 'heart': b2Feat(heartPts(0, 0, r * 1.15 * (1 + .12 * pulse(t))), '#E2476E', { solid: true, sw: sw * .45, key: k + 'h', lift: 0, flatCard: true }); break;
    case 'shades': b2Feat(curvy([[-r * 1.2, -r * .6], [r * 1.2, -r * .65], [r * 1.0, r * .45], [0, r * .7], [-r * 1.0, r * .5]], 4), '#1E1A24', { sw: sw * .7, key: k + 'sh', lift: 0, flatCard: true }); break;
    case 'wide': case 'scared': case 'blank': {
      b2Feat(oval(0, 0, r * 1.05, r * 1.05 * tall, 0, 20), '#FFFFFF', { sw: sw * .55, key: k + 'w', lift: 0, flatCard: true });
      const pr = r * (e === 'wide' ? .58 : .36), sh = e === 'scared' ? Math.sin(t * 60 + side) * r * .08 : 0;
      b2Feat(oval(sh, r * .15, pr, pr * 1.12, 0, 14), dark, { ink: null, key: k + 'p', lift: 0, flatCard: true });
      b2Feat(oval(sh - pr * .35, r * .15 - pr * .4, pr * .32, pr * .32, 0, 8), '#FFFFFF', { ink: null, key: k + 'hl', lift: 0, flatCard: true });
      break;
    }
    case 'spark': case 'shine': {
      b2Feat(oval(0, 0, r * .95, r * .95 * tall, 0, 20), dark, { ink: null, key: k + 'p', lift: 0, flatCard: true });
      b2Feat(starPts(-r * .2, -r * .3, r * .62 * (1 + .15 * Math.sin(t * 14)), .4, 4), '#FFFFFF', { ink: null, key: k + 'st', lift: 0, flatCard: true });
      b2Feat(oval(r * .35, r * .5, r * .18, r * .18, 0, 8), '#FFFFFF', { ink: null, key: k + 'hl', lift: 0, flatCard: true });
      break;
    }
    case 'swirl': { const sp = []; for (let i = 0; i < 14; i++) { const a = i * .8 + t * 6 * side, rr = i / 14 * r; sp.push([Math.cos(a) * rr, Math.sin(a) * rr * tall]); } b2Feat(ribbon(sp, r * .22), dark, { ink: null, key: k + 'sw', lift: 0, flatCard: true }); break; }
    default: {   // normal, look, narrow, angry, sad…: a glossy dot, with a lid for the moods
      const ry = r * .95 * tall, rx = r * .78;
      b2Feat(oval(0, 0, rx, ry, 0, 20), e === 'red' ? '#B0142C' : dark, { ink: null, key: k + 'p', lift: 0, flatCard: true });
      b2Feat(oval(-rx * .3, -ry * .38, rx * .36, rx * .36, 0, 10), '#FFFFFF', { ink: null, key: k + 'hl', lift: 0, flatCard: true });
      b2Feat(oval(rx * .32, ry * .42, rx * .15, rx * .15, 0, 8), '#FFFFFF', { ink: null, key: k + 'hl2', lift: 0, flatCard: true });
      const lid = { narrow: .45, sleepy: .6, angry: .38, determined: .28, red: .38, sad: .3, teary: .3, bored: .45 }[e] ?? (spec.sqz * .9);
      const sl = { angry: .55, determined: .35, red: .55, sad: -.5, teary: -.45 }[e] || 0;
      if (lid > .02) {
        const yb = lerp(-ry * 1.05, ry * .95, lid), edge = xx => yb + sl * ry * (xx * -side / rx);
        b2Feat(oval(0, 0, rx * 1.25, ry * 1.2, 0, 24).map(([a, b]) => [a, Math.min(b, edge(a))]), o.skin, { ink: null, key: k + 'lid', lift: 0, flatCard: true, edge: false });
        const span = []; for (let i = 0; i <= 10; i++) { const xx = lerp(-rx * 1.1, rx * 1.1, i / 10); span.push([xx, edge(xx)]); }
        dline(span.filter(([a, b]) => (a / (rx * 1.12)) ** 2 + (b / (ry * 1.12)) ** 2 < 1), sw * .8, dark, 0);
      }
      if (e === 'teary') b2Feat(curvy([[r * .3 * -side, r * .7], [r * .6 * -side, r * 1.35], [r * .3 * -side, r * 1.55], [r * .05 * -side, r * 1.3]], 4), '#8EC3E6', { sw: sw * .4, key: k + 'tr', lift: 0, flatCard: true });
    }
  }
  pop();
}
// The ink look's pet eye (rubber hose, cxDotEye's stand-in): a big tall black oval with a pie-cut (a wedge cut toward the
// light: the 1930s eye, one bold notch for the highlights), the moods as bold shapes: happy ∩, closed ∪, squeezed > <, a
// heart, a white eye with a pie pupil (wide, scared, blank), lids cut straight across in the face's colour (sad, angry,
// sleepy…). r: its half-width px; as b2DotEye otherwise (o: look px, skin, key, t).
function cxInkEye(x, y, r, side, spec, o) {
  const dark = NOIR.ink, k = o.key, t = o.t || 0, lk = o.look || [0, 0], ry = r * 1.42;
  let e = spec.kind; if (spec.blink || spec.sqz > .85) e = 'closed';
  push(); translate(x + lk[0], y + lk[1]);
  const F = { ink: null, lift: 0, flatCard: true, edge: false };
  const arc = (P, w) => piece(strokeShape(P, s => w * (.55 + .45 * Math.sin(Math.PI * s)), 10), dark, { ...F, key: k + 'a' });
  const pie = (px, py, rx, ry2, col, key) => {   // the oval, the wedge toward the light cut out of its upper side
    const [lx, ly] = lightLocal(), aw = Math.atan2(ly, lx), hw = .4, P = [[px + Math.cos(aw) * rx * .18, py + Math.sin(aw) * ry2 * .18]];
    for (let i = 0; i <= 26; i++) { const a = aw + hw + i / 26 * (TAU - 2 * hw); P.push([px + Math.cos(a) * rx, py + Math.sin(a) * ry2]); }
    piece(P, col, { ...F, key });
  };
  switch (e) {
    case 'happy': arc([[-r * 1.05, r * .45], [-r * .5, -r * .38], [0, -r * .6], [r * .5, -r * .38], [r * 1.05, r * .45]], r * .62); break;
    case 'closed': arc([[-r * 1.05, -r * .15], [-r * .5, r * .38], [0, r * .5], [r * .5, r * .38], [r * 1.05, -r * .15]], r * .55); break;
    case 'squeeze': case 'cry': case 'x': arc([[-r * .85 * -side, -r * .8], [r * .7 * -side, 0], [-r * .85 * -side, r * .8]], r * .55); break;
    case 'heart': piece(heartPts(0, 0, r * 1.35 * (1 + .12 * pulse(t))), '#E2476E', { ...F, key: k + 'h' }); break;
    case 'wide': case 'scared': case 'blank': {
      piece(oval(0, 0, r * 1.12, ry * 1.08, 0, 24), '#FFFFFF', { sw: 1, role: 'inner', key: k + 'w', lift: 0, flatCard: true });
      const pr = r * (e === 'wide' ? .7 : .48), sh = e === 'scared' ? Math.sin(t * 60 + side) * r * .08 : 0;
      pie(sh, r * .2, pr, pr * 1.3, dark, k + 'p');
      break;
    }
    default: {   // normal, look, dot, shine, spark (a touch bigger), and the lidded moods
      const big = e === 'shine' || e === 'spark' ? 1.1 : e === 'dot' ? .8 : 1;
      const lid = { narrow: .45, sleepy: .6, angry: .4, determined: .3, red: .4, sad: .32, teary: .32, bored: .45 }[e] ?? (spec.sqz * .9);
      if (lid > .02) piece(oval(0, 0, r * big, ry * big, 0, 26), e === 'red' ? '#B0142C' : dark, { ...F, key: k + 'p' });   // (lidded: a plain oval under the lid, no notch peeking out)
      else pie(0, 0, r * big, ry * big, e === 'red' ? '#B0142C' : dark, k + 'p');
      const sl = { angry: .55, determined: .35, red: .55, sad: -.5, teary: -.45 }[e] || 0;
      if (lid > .02) {
        const yb = lerp(-ry * 1.1, ry, lid), edge = xx => yb + sl * ry * (xx * -side / r);
        piece(oval(0, 0, r * 1.4, ry * 1.3, 0, 24).map(([a, b]) => [a, Math.min(b, edge(a))]), o.skin, { ...F, key: k + 'lid' });
      }
    }
  }
  pop();
}
// A bot's mouth centred (0, 0), half-width W px: the kit's mouths (smile grin laugh cat smirk flat frown wobble o O open
// shout wail yawn teeth grimace tongue pout sigh) plus 'fixed' (a wide HR smile, every tooth on show) and 'prompt' (the
// terminal's >_ with a blinking cursor). o: sw, key, qk (3/4: squeezes the +x half), lw (line width px), dark (inside),
// ink (line colour), tongue, tooth, t
function b2Mouth(W, kind, o = {}) {
  const sw = o.sw ?? 1, key = o.key || 'b2m', qk = o.qk ?? 1, X = a => a > 0 ? a * qk : a, Q = P => P.map(([a, b]) => [X(a), b]);
  const dark = o.dark || '#3A1628', ink = o.ink || NOIR.ink, tongue = o.tongue || '#E4647F', tooth = o.tooth || '#F6F1E8', lw = o.lw ?? W * .2;
  const line = (P, w = 1) => b2Feat(b2Taper(Q(P), lw * w), ink, { ink: null, key: key + 'l', lift: 1, flatCard: true });
  const hole = (P, k2 = 'in') => b2Feat(Q(P), dark, { sw: sw * .5, key: key + k2, lift: 1, flatCard: true });
  const tng = (cx, cy, rx, ry) => b2Feat(Q(oval(cx, cy, rx, ry, 0, 16)), tongue, { ink: null, key: key + 'tg', lift: 0, flatCard: true });
  // a D-shaped open mouth: the top edge from -W to W, lifting by `top` at the corners; the round bottom `bot` deep
  const topE = (a, top) => -top * W * a * a, botE = (a, top, bot) => topE(a, top) + bot * W * Math.pow(Math.max(0, 1 - a * a), .7);
  const D = (top, bot, n = 22) => { const P = []; for (let i = 0; i <= n; i++) { const a = lerp(-1, 1, i / n); P.push([a * W, topE(a, top)]); } for (let i = n - 1; i > 0; i--) { const a = lerp(-1, 1, i / n); P.push([a * W, botE(a, top, bot)]); } return P; };
  // the top teeth: a strip under the top edge, as deep as th (px) or 45% of the opening, whichever is less
  const teeth = (top, bot, th, a0 = .86, divs = 0) => {
    const P = [], n = 16; for (let i = 0; i <= n; i++) { const a = lerp(-a0, a0, i / n); P.push([a * W, topE(a, top) + W * .015]); }
    for (let i = n; i >= 0; i--) { const a = lerp(-a0, a0, i / n); P.push([a * W, topE(a, top) + Math.min(th, .45 * (botE(a, top, bot) - topE(a, top)))]); }
    b2Feat(Q(P), tooth, { ink: null, key: key + 'th', lift: 0, flatCard: true });
    for (let i = 1; i < divs; i++) { const a = lerp(-a0, a0, i / divs), y0 = topE(a, top); dline(Q([[a * W, y0 + W * .03], [a * W, y0 + Math.min(th, .45 * (botE(a, top, bot) - y0)) * .9]]), sw * .35, '#9A8E86', 0); }
  };
  switch (kind) {
    case 'flat': line([[-.72 * W, 0], [0, .02 * W], [.72 * W, 0]]); break;
    case 'frown': line([[-.9 * W, .26 * W], [-.5 * W, -.04 * W], [0, -.12 * W], [.5 * W, -.04 * W], [.9 * W, .26 * W]]); break;
    case 'pout': line([[-.4 * W, .12 * W], [0, -.08 * W], [.4 * W, .12 * W]], .9); break;
    case 'smirk': line([[-.72 * W, .06 * W], [.1 * W, .12 * W], [.62 * W, .02 * W], [W, -.3 * W]]); break;
    case 'wobble': line([[-.9 * W, 0], [-.45 * W, -.13 * W], [0, .05 * W], [.45 * W, -.13 * W], [.9 * W, 0]], .9); break;
    case 'cat': line([[-.95 * W, -.12 * W], [-.48 * W, .24 * W], [0, 0], [.48 * W, .24 * W], [.95 * W, -.12 * W]], .9); break;
    case 'tongue': line([[-W, -.2 * W], [-.5 * W, .14 * W], [0, .24 * W], [.5 * W, .14 * W], [W, -.2 * W]]); b2Feat(Q(curvy([[.05 * W, .2 * W], [.55 * W, .16 * W], [.52 * W, .62 * W], [.3 * W, .72 * W], [.1 * W, .55 * W]], 4)), tongue, { sw: sw * .55, key: key + 'to', lift: 1, flatCard: true }); break;
    case 'o': case 'sigh': hole(oval(kind === 'sigh' ? .1 * W : 0, .06 * W, .22 * W, .27 * W, 0, 16)); break;
    case 'O': hole(oval(0, .16 * W, .44 * W, .58 * W, 0, 20)); tng(0, .5 * W, .26 * W, .12 * W); break;
    case 'yawn': hole(oval(0, .2 * W, .5 * W, .8 * W, 0, 20)); tng(0, .72 * W, .3 * W, .14 * W); break;
    case 'open': { const P = []; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, c = Math.cos(a), s = Math.sin(a); P.push([c * .62 * W, s < 0 ? s * .25 * W : s * .75 * W]); } hole(P); tng(0, .5 * W, .36 * W, .14 * W); break; }
    case 'shout': case 'wail': { const P = []; for (let i = 0; i < 26; i++) { const a = i / 26 * TAU, c = Math.cos(a), s = Math.sin(a); P.push([c * .78 * W, s < 0 ? s * .32 * W : s * 1.0 * W]); } hole(P); tng(0, .72 * W, .44 * W, .18 * W); teeth(0, 1.2, .22 * W, .55); break; }
    case 'grin': hole(D(.3, .72)); teeth(.3, .72, .24 * W, .84, 6); tng(0, .52 * W, .4 * W, .12 * W); break;
    case 'laugh': hole(D(.12, 1.05)); teeth(.12, 1.05, .24 * W, .84, 6); tng(0, .72 * W, .5 * W, .2 * W); break;
    case 'fixed': {   // the HR smile: wide, even, every tooth on show, the corners pinned up
      hole(D(.26, .6)); teeth(.26, .6, .3 * W, .9, 8); tng(0, .44 * W, .32 * W, .08 * W);
      for (const s of [-1, 1]) dline(Q([[s * W * 1.02, -.36 * W], [s * W * 1.14, -.22 * W], [s * W * 1.1, -.08 * W]]), sw * .6, ink, .5);
      break;
    }
    case 'teeth': case 'grimace': {
      b2Feat(Q(curvy([[-W, -.2 * W], [W, -.2 * W], [W * 1.02, .22 * W], [-W * 1.02, .22 * W]], 3)), tooth, { sw: sw * .7, key: key + 'gt', lift: 1, flatCard: true });
      dline(Q([[-.95 * W, .01 * W], [.95 * W, .01 * W]]), sw * .45, ink, 0);
      for (const tx of [-.5, 0, .5]) dline(Q([[tx * W, -.18 * W], [tx * W, .2 * W]]), sw * .35, '#9A8E86', 0);
      break;
    }
    case 'prompt': {   // >_ (a chevron and a blinking cursor), in the screen's phosphor
      b2Feat(Q(ribbon([[-.8 * W, -.32 * W], [-.35 * W, 0], [-.8 * W, .32 * W]], lw * 1.1)), ink, { ink: null, key: key + 'pc', lift: 0, flatCard: true });
      if (frac((o.t || 0) * 1.6) < .6) b2Feat(Q(curvy([[-.1 * W, .22 * W], [.75 * W, .22 * W], [.75 * W, .36 * W], [-.1 * W, .36 * W]], 1)), ink, { ink: null, key: key + 'pu', lift: 0, flatCard: true });
      break;
    }
    default: line([[-W, -.22 * W], [-.55 * W, .14 * W], [0, .26 * W], [.55 * W, .14 * W], [W, -.22 * W]]);   // smile
  }
}
// A rubber-hose arm and its glove, in two steps so a prop can go between the sleeve and the fingers: b2ArmLimb draws the
// limb and returns what b2ArmHand needs. root [x, y] and spec [x, y, bend, hand pose, front, hand angle] in u; s = -1
// for a left arm, 1 for a right. o: u, w0, w1 (widths, u), col, shade, sw, key, hs (hand size px), hold, claw (a brace
// claw instead of a glove: { col, dk, open }), tape (a strip of sticky tape round the forearm).
function b2ArmLimb(root, sp, s, o) {
  const u = o.u, [hx, hy, bend] = sp, ddx = hx - root[0], ddy = hy - root[1], L = Math.hypot(ddx, ddy) || 1;
  const nx = -ddy / L, ny = ddx / L, sd = bendSide(nx, ny, s, .3);   // (out and down, swinging through straight: core.js bendSide)
  const mid = [root[0] + ddx * .5 + nx * L * bend * sd, root[1] + ddy * .5 + ny * L * bend * sd];
  const r = limb(U([root, mid, [hx, hy]], u), o.w0 * u, o.w1 * u, o.col, { sw: o.sw, shade: o.shade, key: o.key, ...(o.spot ? { spot: o.spot } : {}), ...(o.ink !== undefined ? { ink: o.ink } : {}) });   // (o.ink: null, the rubber-hose limb: solid, no outline)
  if (o.tape) { const m = through([root, mid, [hx, hy]], 6), i = Math.floor(m.length * .62), a = m[i], b = m[Math.min(m.length - 1, i + 1)], an = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2, h = o.w0 * .75;
    piece(b2Bar(U([[a[0] - Math.cos(an) * h, a[1] - Math.sin(an) * h]], u)[0], U([[a[0] + Math.cos(an) * h, a[1] + Math.sin(an) * h]], u)[0], .28 * u), B2CP.tape, { sw: o.sw * .4, ink: B2CP.tapeDk, op: 220, key: o.key + 'tape', lift: 1, flatCard: true }); }
  const ang = sp[5] != null ? sp[5] : r.ang;
  return { wx: r.tip[0] + Math.cos(r.ang) * .04 * u, wy: r.tip[1] + Math.sin(r.ang) * .04 * u, ang, hp: sp[3] || 'relax', s };
}
// Two gloves holding hands, between wrists P and Q (px, the frame b2Clasp is called in), s = the glove size: Q's hand
// underneath, P's wrapped round it (the back of the glove to us, three fingers curled over), Q's thumb across the top.
// One drawing for the pair, so the join reads as a grip rather than two fists pushed into each other.
function b2Clasp(P, Q, s, o) {
  if (Q[0] < P[0]) [P, Q] = [Q, P];
  const d = Math.hypot(Q[0] - P[0], Q[1] - P[1]) / s, col = NOIR.cream, shade = '#C9BFB0', sw = o.sw, k = o.key, S = pts => U(pts, s);
  const cap = (x0, y0, x1, y1, r) => { const a = Math.atan2(y1 - y0, x1 - x0), p = []; for (let i = 0; i <= 6; i++) { const t = a + Math.PI / 2 + i / 6 * Math.PI; p.push([x0 + Math.cos(t) * r, y0 + Math.sin(t) * r]); } for (let i = 0; i <= 6; i++) { const t = a - Math.PI / 2 + i / 6 * Math.PI; p.push([x1 + Math.cos(t) * r, y1 + Math.sin(t) * r]); } return p; };
  const cuff = [[-.35, -.55], [.1, -.62], [.2, 0], [.1, .62], [-.35, .55], [-.25, 0]], palm = [[.05, -.42], [.55, -.5], [.85, -.35], [.92, 0], [.85, .38], [.55, .5], [.05, .42], [0, 0]];
  const far = pts => pts.map(([x, y]) => [d - x, y]);   // Q's hand: the same glove, pointing back along the line
  push(); translate(...P); rotate(Math.atan2(Q[1] - P[1], Q[0] - P[0]));
  piece(curvy(S(far(cuff)), 3), col, { sw, key: k + 'cq', lift: 3 });
  piece(curvy(S(far(palm)), 4), col, { sw, shade, depth: s * .25, key: k + 'pq', lift: 3 });
  piece(curvy(S(cuff), 3), col, { sw, key: k + 'cp', lift: 3 });
  piece(curvy(S([[.05, -.42], [.45, -.5], [d * .5 + .02, -.46], [d * .5 + .1, 0], [d * .5 + .02, .46], [.45, .5], [.05, .42], [0, 0]]), 4), col, { sw, shade, depth: s * .25, key: k + 'pp', lift: 4 });
  for (let i = 0; i < 3; i++) { const fx = d * .5 + .14 + i * .19; piece(cap(fx * s, -.36 * s, (fx + .04) * s, .4 * s, .115 * s), col, { sw: sw * .8, shade, depth: s * .06, key: k + 'f' + i, lift: 4, flatCard: true }); }
  piece(cap((d - .42) * s, -.46 * s, (d * .5 - .12) * s, -.52 * s, .13 * s), col, { sw: sw * .8, key: k + 'th', lift: 5, flatCard: true });
  for (const fy of [-.18, 0, .18]) dline([[.22 * s, fy * s], [(d * .5 - .2) * s, fy * 1.1 * s]], sw * .4, '#A89E90');
  pop();
}
function b2ArmHand(A, o) {
  if (A.hp === 'none') return null;
  let pose = A.hp, mirror = A.s < 0;
  if (pose === 'thumbUp' || pose === 'thumbDown') { mirror = pose === 'thumbDown' ? Math.cos(A.ang) > 0 : Math.cos(A.ang) < 0; pose = 'thumb'; }
  if (o.claw) b2Claw(A.wx, A.wy, A.ang, o.hs, { ...o.claw, sw: o.sw, key: o.key + 'cl', mirror, hold: o.hold, pose });
  else hand(A.wx, A.wy, A.ang, o.hs, { pose, glove: true, sw: o.sw * .62, mirror, key: o.key + 'h', hold: o.hold, tap: o.tap });
  return [A.wx + Math.cos(A.ang) * o.hs * .6, A.wy + Math.sin(A.ang) * o.hs * .6];
}
// A crab's claw shaped like a curly brace, at the wrist (x, y) pointing along ang: '{' with its cusp at the wrist and
// its curled ends as the pincers (open 0..1). s ≈ the glove size it replaces. o: col, dk, sw, key, mirror, hold, pose
function b2Claw(x, y, ang, s, o) {
  const open = o.open ?? ({ open: .55 + .45 * Math.abs(Math.sin(bpOf(o.t ?? mt(T)) * Math.PI)), relax: .75, point: .5, fist: .25, hold: .35, thumb: .4 }[o.pose] ?? .7);
  push(); translate(x, y); rotate(ang); if (o.mirror) scale(1, -1);
  const h = s * (.4 + .38 * open), P = [[s * 1.05, -h], [s * .62, -h * 1.02], [s * .42, -h * .72], [s * .38, -h * .3], [s * .2, -h * .08], [s * .14, 0], [s * .2, h * .08], [s * .38, h * .3], [s * .42, h * .72], [s * .62, h * 1.02], [s * 1.05, h]];
  piece(b2Taper(P, s * .36, 8), o.col, { sw: o.sw * .42, shade: o.dk, depth: s * .12, key: o.key, lift: 2 });
  piece(oval(s * .08, 0, s * .2, s * .24, 0, 14), o.dk, { sw: o.sw * .6, key: o.key + 'k', lift: 2, flatCard: true });
  if (o.hold) { push(); translate(s * .7, 0); o.hold(s); pop(); }
  pop();
}
// A rubber-hose leg and a little shoe (or boot): hip and ankle in the ground frame (u). o: u, w0, w1, col, shade, sw, key,
// shoe { col, lt, sole, k (size), q (toes to +x), s (side: toes outward in the front view), tilt }, bend (knee out, u)
function b2Leg(hip, ank, o) {
  const u = o.u, sh = o.shoe, S = P => U(P, u);
  const mid = [lerp(hip[0], ank[0], .5) + (o.bend || 0), lerp(hip[1], ank[1], .5)];
  limb(S([hip, mid, ank]), o.w0 * u, o.w1 * u, o.col, { sw: o.sw, shade: o.shade, key: o.key });
  if (!sh) return;
  push(); translate(ank[0] * u, ank[1] * u); rotate(sh.tilt || 0); scale((sh.q ? 1 : sh.s) * sh.k, sh.k);
  piece(curvy(S([[-.72, -.5], [.25, -.64], [1.12, -.4], [1.42, .02], [1.28, .38], [-.76, .38], [-.94, -.02]]), 5), sh.col, { sw: o.sw / sh.k, shade: NOIR.ink, depth: .2 * u, rim: sh.lt || '#8A8096', key: o.key + 'shoe', lift: o.lift ?? u * .1 });
  piece(curvy(S([[-.86, .14], [1.36, .12], [1.22, .42], [-.74, .42]]), 3), sh.sole, { sw: o.sw * .8 / sh.k, key: o.key + 'sole', lift: 2 });
  b2Glint(curvy(S([[.1, -.5], [.62, -.46], [.95, -.3], [.6, -.36]]), 3), o.key + 'shg', 120);
  pop();
}

// ---------- props ----------
// The leaving card: a folded greeting card standing open a little, a big gold star on the cover ("one of a kind"),
// centred (0, 0), w wide. No words: a star, a scalloped border and a squiggle.
function b2LeavingCard(w, key = 'lcard', sw = 1) {
  const h = w * .72, C = B2CP;
  piece(curvy([[-w * .5, -h * .5], [w * .44, -h * .56], [w * .44, h * .44], [-w * .5, h * .5]], 1), C.cardDk, { sw, key: key + 'in', lift: 3 });
  piece(curvy([[-w * .46, -h * .5], [w * .5, -h * .46], [w * .5, h * .5], [-w * .46, h * .46]], 1), C.card, { sw, shade: C.cardDk, depth: w * .06, key: key + 'cv', lift: 2 });
  piece(starPts(w * .02, -h * .06, w * .26, .45, 5, -Math.PI / 2), C.star, { sw: sw * .7, shade: C.starDk, depth: w * .04, key: key + 'st', lift: 1, flatCard: true });
  for (const [sx, sy, r] of [[-.3, -.3, .07], [.34, -.3, .06], [.32, .28, .05]]) piece(starPts(sx * w, sy * h, r * w, .45, 4), C.star, { ink: null, key: key + 's' + sx, lift: 0, flatCard: true });
  piece(heartPts(-w * .28, h * .3, w * .06), '#D8434E', { ink: null, key: key + 'ht', lift: 0, flatCard: true });
  dline([[-w * .1, h * .3], [0, h * .26], [w * .08, h * .32], [w * .16, h * .27]], sw * .6, '#8A7A60', .5);
}
// A permission request (Clawd asking on his behalf, V2c): a little dialog window, centred (0, 0), w wide: a title bar, a
// padlock, and two buttons, a tick and a cross. No words.
function b2PermissionCard(w, key = 'perm', sw = 1) {
  const h = w * .72, R = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  piece(b2RoundPoly(R(-w / 2, -h / 2, w / 2, h / 2), w * .06), '#F7F4EC', { sw, shade: '#CFC8B8', depth: w * .05, key: key + 'w', lift: 3 });
  piece(b2RoundPoly(R(-w / 2, -h / 2, w / 2, -h * .28), [w * .06, w * .06, 0, 0]), '#3F6FC8', { sw: sw * .6, key: key + 'bar', lift: 0, flatCard: true });
  for (const k of [0, 1, 2]) piece(oval(w * (.3 + k * .07), -h * .39, w * .022, w * .022, 0, 8), '#F7F4EC', { ink: null, key: key + 'dot' + k, lift: 0, flatCard: true, edge: false });
  // the padlock
  piece(b2Ring(0, -h * .05, w * .09, w * .1, w * .035, Math.PI / 2), '#8C939E', { sw: sw * .4, key: key + 'sh', lift: 0, flatCard: true });
  piece(b2RoundPoly(R(-w * .13, -h * .03, w * .13, h * .17), w * .03), '#D6A444', { sw: sw * .5, key: key + 'lk', lift: 0, flatCard: true });
  piece(oval(0, h * .06, w * .025, w * .025, 0, 8), NOIR.ink, { ink: null, key: key + 'kh', lift: 0, flatCard: true, edge: false });
  // the buttons: a tick and a cross
  for (const [bx, col, k] of [[-.22, '#3E9E5A', 'y'], [.22, '#D8343F', 'n']]) {
    piece(b2RoundPoly(R(w * (bx - .16), h * .24, w * (bx + .16), h * .42), w * .04), col, { sw: sw * .5, key: key + 'b' + k, lift: 0, flatCard: true });
    const c = [w * bx, h * .33], m = w * .05;
    if (k === 'y') piece(ribbon([[c[0] - m, c[1]], [c[0] - m * .2, c[1] + m * .6], [c[0] + m, c[1] - m * .6]], w * .025), '#F7F4EC', { ink: null, key: key + 'tk', lift: 0, flatCard: true, edge: false });
    else for (const d of [-1, 1]) piece(ribbon([[c[0] - m * .7, c[1] - m * .6 * d], [c[0] + m * .7, c[1] + m * .6 * d]], w * .025), '#F7F4EC', { ink: null, key: key + 'x' + d, lift: 0, flatCard: true, edge: false });
  }
}
// A keyboard seen a little from above, centred (0, 0), w wide: a dark slab and rows of pale keys (no letters).
function b2Keyboard(w, key = 'kbd', sw = 1) {
  const h = w * .26, C = B2CP;
  piece(curvy([[-w * .47, -h * .45], [w * .47, -h * .45], [w * .52, h * .5], [-w * .52, h * .5]], 1), C.board, { sw, shade: '#24222A', depth: h * .2, key: key + 'b', lift: 3 });
  // three rows of keys, the space bar in the back row, toward whoever types on it behind it (perspective: the rows widen
  // toward the front)
  for (let r = 0; r < 3; r++) {
    const y0 = lerp(-h * .24, h * .24, r / 2), sp = lerp(.84, .92, r / 2) * w, n = 7, kw = sp / n * .78, kh = h * .19;
    for (let i = 0; i < n; i++) {
      if (r === 0 && i > 1 && i < 5) { if (i === 2) { const x0 = lerp(-sp / 2, sp / 2, 2.5 / n), x1 = lerp(-sp / 2, sp / 2, 4.5 / n); piece(curvy([[x0 - kw * .45, y0 - kh / 2], [x1 + kw * .45, y0 - kh / 2], [x1 + kw * .45, y0 + kh / 2], [x0 - kw * .45, y0 + kh / 2]], 1), C.key, { ink: null, key: key + 'sp', lift: 0, flatCard: true }); } continue; }
      const x0 = lerp(-sp / 2, sp / 2, (i + .5) / n);
      piece(curvy([[x0 - kw / 2, y0 - kh / 2], [x0 + kw / 2, y0 - kh / 2], [x0 + kw / 2, y0 + kh / 2], [x0 - kw / 2, y0 + kh / 2]], 1), C.key, { ink: null, key: key + 'k' + r + i, lift: 0, flatCard: true });
    }
  }
}
// Her office chair (the replacement sits in it): a high back, a cushion, a gas lift and a five-star base on castors.
// Drawn in two parts around the sitter: part 'back' (before it) and 'seat' (the cushion and base, before its legs).
// Ground frame, u; seatY = the cushion's top (negative, u); q turns it 3/4 (back to the left, facing right).
function b2Chair(u, sw, seatY, q, part, key = 'chair') {
  const C = B2CP, S = P => U(P, u), lift = u * .1;
  if (part === 'back') {
    const cx = q ? -1.05 : 0, hw = q ? 1.75 : 2.3, cy = seatY - 3.95, hh = 3.15;
    piece(b2Bar(S([[cx + (q ? .35 : 0), seatY - 1.2]])[0], S([[cx + (q ? .6 : 0), seatY + .2]])[0], .34 * u), C.plastic, { sw, key: key + 'spine', lift });
    const back = b2Squircle(cx * u, cy * u, hw * u, hh * u, 3.4, 56).map(([a, b]) => q ? [a + (b - cy * u) * -.06, b] : [a, b]);
    piece(back, C.chair, { sw: sw * 1.1, shade: C.chairDk, depth: .45 * u, rim: C.chairLt, key: key + 'back', lift });
    const pan = b2Squircle(cx * u, (cy + .15) * u, (hw - .38) * u, (hh - .45) * u, 3.4, 56).map(([a, b]) => q ? [a + (b - cy * u) * -.06, b] : [a, b]);
    piece(pan, mixCol(C.chair, C.chairLt, .18), { ink: null, key: key + 'pan', lift: 0, flatCard: true, edge: false });
    for (const k of [-1, 1]) dline(S([[cx + k * (hw - .55) * .55, cy - hh + .7], [cx + k * (hw - .55) * .62, cy], [cx + k * (hw - .55) * .55, cy + hh - .7]]), sw * .5, C.chairDk, .5);
    return;
  }
  // the five-star base: spokes round the hub on a ground ellipse, the back ones first
  const hub = [q ? .15 : 0, -.62], spokes = [];
  for (let k = 0; k < 5; k++) { const a = Math.PI / 2 + k * TAU / 5 + (q ? .45 : 0); spokes.push({ a, e: [hub[0] + Math.cos(a) * 2.05, -.3 + Math.sin(a) * .26] }); }
  const spoke = sp => { piece(b2Bar(S([hub])[0], S([sp.e])[0], .36 * u, .26 * u), C.plastic, { sw, shade: '#1C1B20', depth: .08 * u, key: key + 'sp' + sp.a.toFixed(2), lift });
    piece(oval(sp.e[0] * u, (sp.e[1] + .12) * u, .22 * u, .2 * u, 0, 14), '#1E1D22', { sw: sw * .8, key: key + 'cs' + sp.a.toFixed(2), lift: 2, flatCard: true }); };
  spokes.filter(s => Math.sin(s.a) < 0).forEach(spoke);
  piece(b2Bar(S([[hub[0], hub[1]]])[0], S([[hub[0], seatY + .5]])[0], .24 * u), C.chrome, { sw, shade: C.chromeDk, depth: .06 * u, key: key + 'gas', lift });
  piece(b2Bar(S([[hub[0], hub[1]]])[0], S([[hub[0], hub[1] - 1.1]])[0], .4 * u, .36 * u), C.plastic, { sw, key: key + 'sleeve', lift });
  spokes.filter(s => Math.sin(s.a) >= 0).forEach(spoke);
  piece(oval(hub[0] * u, hub[1] * u, .3 * u, .16 * u, 0, 14), C.plastic, { sw: sw * .8, key: key + 'hub', lift: 2, flatCard: true });
  piece(curvy(S([[hub[0] - .75, seatY + .38], [hub[0] + .75, seatY + .38], [hub[0] + .6, seatY + .66], [hub[0] - .6, seatY + .66]]), 2), C.plastic, { sw, key: key + 'mech', lift });
  // the cushion: a thick rounded slab with its top face showing
  const cx = q ? .2 : 0, hw = q ? 2.05 : 2.25;
  piece(b2Squircle(cx * u, (seatY + .2) * u, hw * u, .42 * u, 3.2, 48), C.chair, { sw: sw * 1.1, shade: C.chairDk, depth: .22 * u, rim: C.chairLt, key: key + 'seat', lift });
  piece(b2Squircle(cx * u, (seatY + .08) * u, (hw - .22) * u, .2 * u, 3, 40), mixCol(C.chair, C.chairLt, .3), { ink: null, key: key + 'seattop', lift: 0, flatCard: true, edge: false });
}

// ======================================================================================================================
// Copilot
// ======================================================================================================================
// Hand targets (u, from the ground point, in the upper body's frame): [x, y, bend, hand pose, front, hand angle].
// qL / qR: the 3/4 version where it differs (reaching toward the way it faces). 'idle' swings the arms from o.aL / o.aR.
const CPPOSE = {
  mimic:   { L: [-1.6, -2.3, .55, 'fist'], R: [2.5, -6.05, .15, 'point', 1], qL: [-1.25, -2.3, .5, 'fist'], qR: [2.85, -5.7, .12, 'point', 1] },
  typing:  { L: [-.78, -2.72, .45, 'keys', 1, 1.8], R: [.78, -2.72, .45, 'keys', 1, 1.34], qL: [1.3, -2.66, .35, 'keys', 1, 1.25], qR: [2.25, -2.78, .3, 'keys', 0, 1.2] },
  present: { L: [-.86, -3.0, .5, 'hold', 1], R: [.86, -3.0, .5, 'hold', 1], qL: [1.45, -3.1, .4, 'hold', 1], qR: [2.8, -3.22, .3, 'hold', 0] },
  wave:    { L: [-1.95, -1.6, .2, 'relax'], R: [2.4, -6.35, .25, 'open', 1] },
  sit:     { L: [-.72, -1.55, .35, 'relax', 1, 1.75], R: [.72, -1.55, .35, 'relax', 1, 1.4], qL: [1.2, -1.5, .3, 'relax', 1, .6], qR: [1.8, -1.6, .3, 'relax', 0, .6] },
  point:   { L: [-1.95, -1.6, .2, 'relax'], R: [3.1, -4.4, .12, 'point', 1] },
  cheer:   { L: [-2.2, -6.3, .2, 'open'], R: [2.2, -6.3, .2, 'open'] },
  shrug:   { L: [-2.45, -4.2, .4, 'open'], R: [2.45, -4.2, .4, 'open'] },
};
function copilot(x, y, u, o = {}) {
  const id = o.boilKey ?? ++CLAWD_N, rs = p => boilSeed(`cp ${id} ${p}`), S = P => U(P, u);
  const M0 = b2Mat(), tt = b2T(o), q = o.view === 'q', flip = !!o.flip, seed = o.seed || 0;
  const cheap = clamp(o.cheap || 0), dis = !!o.disguise;
  const poseName = typeof o.pose === 'string' ? o.pose : o.pose ? 'custom' : 'idle', seated = o.seated ?? poseName === 'sit';
  // musicality (clawd.js botGroove): accents on bar downbeats by default, the full beat bounce when a shot passes bounce;
  // the emotion's own beat-locked bob (o.groove) only with the full bounce. Idle loops run on B.clk, dance moves on B.clk.
  const B = botGroove(tt - cheap * .14 * BEAT, o, seated ? .5 : 1, 'cp' + id + seed), G = grooveAdd(o, B.full ? 1 : 0, B.full ? 1 : .6);
  const sq = cardSq(((o.sq || 0) + G.sq + (o.take || 0)) * .6), dy = ((o.dy || 0) + G.dy) * 1.1 * u, sw = clamp(u / 20, .55, 2.2), lift = u * .12;
  // colours: the mood tint, then the cheap copy fading toward photocopy grey; the disguise borrows her scarf
  // (the disguise is her whole look, cheaply: her tomato coat for the flight suit, her cream scarf, as well as the wig)
  const costume = dis && typeof PP_TOMATO !== 'undefined' && typeof HER_C !== 'undefined' ? { suit: PP_TOMATO.coat, suitDk: PP_TOMATO.coatDk, suitLt: PP_TOMATO.coatLt, her: HER_C.col.scarf, herDk: HER_C.col.scarfDk } : null;
  let C = b2Tint(costume ? { ...B2CP, ...costume } : B2CP, o, ['cap', 'capDk', 'capLt', 'face', 'faceDk', 'suit', 'suitDk', 'suitLt']);
  if (cheap > 0) { C = { ...C }; for (const f of ['fleece', 'cap', 'capDk', 'capLt', 'suit', 'suitDk', 'suitLt', 'rim', 'rimDk', 'rimLt', 'face', 'faceDk', 'scarf', 'scarfDk', 'boot', 'belt']) C[f] = mixCol(C[f], '#D0CCC4', cheap * .5); }
  if (dis) C = { ...C, scarf: C.her, scarfDk: C.herDk };
  const kx = 1 - .2 * cheap;
  const out = { head: null, hands: { L: null, R: null }, card: null, top: null };
  x += ((o.dx || 0) + G.dx) * u;
  rs('shadow'); if (!o.noShadow) paint(oval(x, y + .1 * u, (seated ? 2.5 : 1.9) * u, .32 * u, 0, 24), { wash: NOIR.ink, washOp: STYLE.card ? 110 : 150, ink: null });
  push(); translate(x, y + dy); nudge('cp' + id, 1); if (o.rot || G.rot) rotate((o.rot || 0) + G.rot); scale((flip ? -1 : 1) * (1 + sq * .5), 1 - sq);
  const prevXF = XF; XF = flip ? -XF : XF;
  const Mc = b2Mat(), XFc = XF;
  const seatY = -(o.seatH ?? 3.3), dS = seated ? seatY + 1.02 : 0;
  const hipY = -1.5, bob = B.up * .42, lean = B.lean, bsq = cardSq(B.sq), bx = q ? -.1 : 0;
  const UB = p => { const px = p[0] * (1 + bsq * .5), py = (p[1] - hipY) * (1 - bsq), c = Math.cos(lean), s = Math.sin(lean); return [px * c - py * s, hipY + dS - bob + px * s + py * c]; };
  const inUB = fn => { push(); translate(0, (hipY + dS - bob) * u); rotate(lean); scale(1 + bsq * .5, 1 - bsq); translate(0, -hipY * u); fn(); pop(); };

  // ---- arms ----
  const pose = typeof o.pose === 'object' ? o.pose : CPPOSE[poseName] || null;
  const reach = a => clamp(-1.05 + ((a ?? .15) - .15) * 1.35, -1.45, 1.45);
  const idleSpec = (s, a) => { const r = reach(a), L = 1.85; return [s * 1.12 + s * Math.cos(r) * L, -3.2 - Math.sin(r) * L, .22, (a ?? .15) > .9 ? 'open' : 'relax']; };
  const spec = s => {
    let sp = pose ? (q && (s < 0 ? pose.qL : pose.qR)) || (s < 0 ? pose.L : pose.R) : idleSpec(s, s < 0 ? (o.aL ?? .15) + G.aL : (o.aR ?? .15) + G.aR);
    sp = [...sp];
    if (!pose) { const lag = B.lag; sp[0] += s * .1 * lag; sp[1] += .26 * lag; sp[2] += .1 * lag; }
    if (poseName === 'wave' && s > 0) { sp[0] += .4 * Math.sin(B.clk * TAU); sp[1] += .12 * Math.cos(B.clk * TAU); }
    if (poseName === 'typing') sp[1] -= .05 * Math.max(0, Math.sin(tt * TAU * 5.5 + (s > 0 ? Math.PI : 0)));   // (the fingers do the typing: o.tap)
    if (poseName === 'cheer') sp[0] += s * .15 * Math.sin(B.clk * TAU);
    return sp;
  };
  const root = s => q ? [bx + (s < 0 ? -.95 : 1.08) * kx, -3.2] : [s * 1.12 * kx, -3.2];
  const hs = .66 * u;
  const armLimb = s => {
    const sp = spec(s); rs('arm' + s);
    const far = q && s > 0;
    return b2ArmLimb(root(s), sp, s, { u, w0: .46 * kx, w1: .4 * kx, col: far ? mixCol(C.suit, C.suitDk, .45) : C.suit, shade: C.suitDk, sw, key: 'cparm' + s, tape: cheap > .55 && s < 0 });
  };
  const armHand = A => {
    let hold = A.s > 0 ? o.hold : o.holdL;
    const p = b2ArmHand(A, { u, sw, hs, key: 'cp' + A.s, hold, tap: o.tap ?? (poseName === 'typing' ? tt * 12 : null) });
    out.hands[A.s < 0 ? 'L' : 'R'] = p && b2To(M0, p);
  };
  const isFront = s => !!spec(s)[4];

  // ---- the chair's back, behind everything ----
  if (seated && o.chair !== false) { rs('chairback'); b2Chair(u, sw, seatY, q, 'back', 'cpch' + id); }
  // ---- the scarf's long tail streaming out behind, and the arms behind the body ----
  const scarfRoot = [bx - .9 * kx + (q ? -.2 : 0), -3.95];
  inUB(() => {
    rs('scarftail');
    // a long silk tail streaming out behind the neck in an S, tapering to a fringe, the wave running down it (on the beat
    // when it dances; otherwise it flutters in its own breeze, never still: its idle business)
    const n = 12, len = lerp(3.3, 2.0, cheap), P = [], fl = B.full ? 0 : 1;
    for (let i = 0; i <= n; i++) { const k = i / n; P.push([scarfRoot[0] - len * k * (1 - .04 * fl * Math.sin(tt * 2.1 + 1)), scarfRoot[1] + .2 * k + .36 * k * Math.sin(TAU * 1.15 * k - B.clk * Math.PI) + fl * .1 * k * k * Math.sin(TAU * 2.4 * k - tt * TAU * 1.7)]); }
    piece(ribbon(S(P), .5 * u, .26 * u), C.scarf, { sw: sw * .6, shade: C.scarfDk, depth: .1 * u, key: 'cpscarf', lift });
    const e = P[n], e0 = P[n - 1], ang = Math.atan2(e[1] - e0[1], e[0] - e0[0]), nx = -Math.sin(ang), ny = Math.cos(ang);
    for (let j = 0; j < 5; j++) { const f = (j - 2) / 2, fx = e[0] + nx * f * .1, fy = e[1] + ny * f * .1, L = (.18 + .05 * Math.sin(B.clk * TAU + j * 1.7)) * (cheap > .5 && j % 2 ? .5 : 1), sp = f * .3;
      piece(b2Taper(S([[fx - Math.cos(ang) * .03, fy - Math.sin(ang) * .03], [fx + Math.cos(ang + sp) * L, fy + Math.sin(ang + sp) * L]]), .05 * u, 3), C.scarf, { sw: sw * .4, key: 'cpfr' + j, lift: 2, flatCard: true }); }
    dline(S(P.slice(2, n - 1).map(([a, b]) => [a, b - .03])), sw * .45, C.scarfDk, .5);
    for (const s of [-1, 1]) if (!isFront(s)) armHand(armLimb(s));
  });
  // ---- the chair's cushion and base, then the legs ----
  if (seated && o.chair !== false) { rs('chairseat'); b2Chair(u, sw, seatY, q, 'seat', 'cpch' + id); }
  const legs = which => {
    for (const s of [-1, 1]) {
      const far = q && s > 0;
      if (which === 'far' && !far || which === 'near' && far) continue;
      rs('leg' + s);
      const col = far ? mixCol(C.suit, C.suitDk, .45) : C.suit, shoe = { col: far ? mixCol(C.boot, NOIR.ink, .25) : C.boot, sole: C.sole, k: .66, q, s };
      if (seated) {
        const hip = UB([bx + s * .5 * kx + (q ? .2 : 0), hipY + .05]), swing = .16 * Math.sin(B.clk * Math.PI + (s > 0 ? 1.3 : 0));
        const knee = q ? [bx + 1.25 + (far ? .15 : 0), hip[1] + .12] : [hip[0] + s * .08, hip[1] + .25], ank = q ? [knee[0] + .3 + swing, knee[1] + 1.3] : [s * .7 + swing * s, knee[1] + 1.25];
        limb(S([hip, knee, ank]), .5 * kx * u, .46 * kx * u, col, { sw, shade: C.suitDk, key: 'cpleg' + s });
        b2Leg(ank, ank, { u, w0: .46 * kx, w1: .46 * kx, col, sw, key: 'cpft' + s, shoe: { ...shoe, tilt: q ? .25 : 0 } });
      } else {
        const walk = o.walk != null ? Math.sin(o.walk * TAU + (s > 0 ? Math.PI : 0)) : 0, lf = Math.max(0, walk) * .4;
        const hip = UB([bx + s * .55 * kx + (q ? .15 : 0), hipY]), ank = [s * .72 * (q ? .6 : 1) + (q ? .3 : 0) + (o.walk != null ? walk * .3 : 0), -.46 - lf];
        b2Leg(hip, ank, { u, w0: .5 * kx, w1: .46 * kx, col, shade: C.suitDk, sw, key: 'cpleg' + s, bend: q ? .08 : s * .06, shoe: { ...shoe, tilt: -lf * .5 * (q ? 1 : s) } });
      }
    }
  };
  if (!seated) legs('all'); else if (q) legs('far');

  // ---- the body ----
  const bodyP = curvy(S([[0, -3.78], [.92, -3.62], [1.32, -3.05], [1.42, -2.3], [1.24, -1.55], [.7, -1.2], [0, -1.12], [-.7, -1.2], [-1.24, -1.55], [-1.42, -2.3], [-1.32, -3.05], [-.92, -3.62]].map(([a, b]) => [bx + a * kx, b])), 5);
  const cxB = bx + (q ? .38 : 0);
  inUB(() => {
    rs('body');
    piece(bodyP, C.suit, { sw: sw * 1.15, shade: C.suitDk, depth: .42 * u, key: 'cpbody', lift });
    piece(oval((cxB - .45) * u, -3.05 * u, .5 * u, .22 * u, -.4, 16), C.suitLt, { ink: null, key: 'cpbodyhl', lift: 0, flatCard: true, edge: false });
    dline(S([[cxB, -3.55], [cxB + .02, -2.7], [cxB, -2.02]]), sw * .6, C.suitDk, .3);   // zip
    const belt = clipConvex(S([[bx - 3, -1.98], [bx + 3, -1.98], [bx + 3, -1.66], [bx - 3, -1.66]]), bodyP);
    if (belt.length > 2) piece(belt, C.belt, { sw: sw * .55, shade: C.beltDk, depth: .08 * u, key: 'cpbelt', lift: 1, flatCard: true });
    piece(curvy(S([[cxB - .2, -2.0], [cxB + .2, -2.0], [cxB + .2, -1.64], [cxB - .2, -1.64]]), 2), C.rim, { sw: sw * .5, key: 'cpbuckle', lift: 1, flatCard: true });
    piece(curvy(S([[cxB - .1, -1.92], [cxB + .1, -1.92], [cxB + .1, -1.72], [cxB - .1, -1.72]]), 2), C.belt, { ink: null, key: 'cpbuckle2', lift: 0, flatCard: true });
    // the wings pin (brass)
    const wx = cxB + .55 * kx, wy = -2.88;
    for (const s of [-1, 1]) piece(curvy(S([[wx + s * .06, wy - .02], [wx + s * .5, wy - .16], [wx + s * .6, wy - .08], [wx + s * .48, wy + .02], [wx + s * .3, wy + .06], [wx + s * .06, wy + .06]]), 3), C.rim, { sw: sw * .45, key: 'cpwing' + s, lift: 1, flatCard: true });
    piece(oval(wx * u, wy * u, .11 * u, .11 * u, 0, 12), C.rimDk, { sw: sw * .45, key: 'cpwingc', lift: 1, flatCard: true });
    if (cheap > .7) { dline(S([[bx - .9, -2.55], [bx - .6, -2.4], [bx - .75, -2.2], [bx - .45, -2.05]]), sw * .6, NOIR.ink, 0);
      piece(b2Bar(S([[bx - 1.05, -2.5]])[0], S([[bx - .35, -2.1]])[0], .26 * u), C.tape, { sw: sw * .4, ink: C.tapeDk, op: 220, key: 'cptape2', lift: 1, flatCard: true }); }
  });
  if (seated) legs(q ? 'near' : 'all');

  // ---- the head ----
  inUB(() => {
    const tilt = (o.tilt || 0) + (o.rot || 0) * -.3, HY = -5.95, hx = bx + (q ? .08 : 0), fx = hx + (q ? .5 : 0);
    push(); translate(hx * u, -3.9 * u); rotate(tilt); translate(-hx * u, 3.9 * u);
    const headP = oval(hx * u, HY * u, 2.28 * kx * u, 2.12 * u, 0, 56);
    // an ear flap: a rounded leather tab hanging from under the strap, splayed out a little (s: which side), with a stitched
    // border; buckle: a short chin strap with a brass buckle dangling from it
    const flap = (cx, w, key, col, s, buckle) => {
      const piv = [cx, -6.4], th = -s * .07 + .03 * s * Math.sin(B.clk * Math.PI - .5), R = ([a, b]) => { const dx = a - piv[0], dy = b - piv[1]; return [piv[0] + dx * Math.cos(th) - dy * Math.sin(th), piv[1] + dx * Math.sin(th) + dy * Math.cos(th)]; };
      if (buckle) { const a = R([cx - .05 * s, -4.7]), b = [a[0] - .12 * s, a[1] + .58];
        piece(b2Bar(S([a])[0], S([b])[0], .16 * u), C.capDk, { sw: sw * .6, key: key + 'bs', lift: 2, flatCard: true });
        piece(b2Squircle(b[0] * u, (b[1] - .05) * u, .13 * u, .1 * u, 3, 16), C.rim, { sw: sw * .5, key: key + 'bk', lift: 2, flatCard: true }); }
      const P = curvy(S([[cx - .42 * w, -6.55], [cx + .42 * w, -6.55], [cx + .5 * w, -5.2], [cx + .36 * w, -4.62], [cx, -4.48], [cx - .36 * w, -4.62], [cx - .5 * w, -5.2]].map(R)), 4);
      piece(P, col, { sw: sw * .75, shade: C.capDk, depth: .14 * u, key, lift: 2 });
      dline(S([[cx - .3 * w, -6.1], [cx - .36 * w, -5.2], [cx - .26 * w, -4.78], [cx, -4.68], [cx + .26 * w, -4.78], [cx + .36 * w, -5.2], [cx + .3 * w, -6.1]].map(R)), sw * .45, C.seam, .5);
    };
    rs('head');
    if (q) flap(hx + 1.95 * kx, .7, 'cpflapfar', mixCol(C.cap, C.capDk, .5), 1);
    piece(oval((hx + (q ? .3 : 0)) * u, (HY - 2.08) * u, .3 * u, .17 * u, 0, 14), C.capDk, { sw: sw * .55, key: 'cpbutton', lift: 2, flatCard: true });   // the crown button
    piece(headP, C.cap, { sw: sw * 1.15, shade: C.capDk, depth: .55 * u, rim: C.capLt, key: 'cphead', lift });
    piece(oval((hx - .95) * u, (HY - 1.35) * u, .62 * u, .26 * u, -.55, 18), C.capLt, { ink: null, key: 'cpheadhl', lift: 0, flatCard: true, edge: false });
    for (const s of [-1, 0, 1]) { const sx = hx + (q ? .45 : 0) + s * 1.05 * kx * (q && s < 0 ? .8 : 1), cx = hx + (q ? .3 : 0); dline(S([[sx, -7.02], [lerp(sx, cx, .5), -7.85], [cx, -8.02]]), sw * .5, C.seam, .5); }   // the cap's seams
    out.head = b2To(M0, [hx * u, HY * u]); out.top = b2To(M0, [hx * u, (HY - 2.25) * u]);
    // the face, the ear flaps, (the wig), the goggle strap
    const faceP = clipConvex(oval(fx * u, -5.33 * u, (q ? 1.45 : 1.58) * kx * u, 1.5 * u, 0, 44), headP);
    piece(faceP, C.face, { sw: sw * .7, shade: C.faceDk, depth: .3 * u, key: 'cpface', lift: 2 });
    // the fleece lining showing round the face opening (its seam hidden under the scarf)
    { const fr = [], fi = [], rx = (q ? 1.45 : 1.58) * kx, n = 64; for (let j = 0; j <= n; j++) { const a = Math.PI / 2 + j / n * TAU, bump = .05 * Math.abs(Math.sin(a * 9)); fr.push([(fx + Math.cos(a) * (rx + .2 + bump)) * u, (-5.33 + Math.sin(a) * (1.72 + bump)) * u]); fi.push([(fx + Math.cos(a) * (rx - .04)) * u, (-5.33 + Math.sin(a) * 1.46) * u]); }
      const ring = clipConvex(fr.concat(fi.reverse()), headP); if (ring.length > 2) piece(ring, C.fleece, { sw: sw * .45, shade: C.fleeceDk, depth: .06 * u, key: 'cpfleece', lift: 1, flatCard: true }); }
    if (q) flap(hx - 1.75 * kx, .82, 'cpflap', C.cap, -1, true); else for (const s of [-1, 1]) flap(hx + s * 2.0 * kx, .78, 'cpflap' + s, C.cap, s, s < 0);
    if (dis) { rs('wig'); b2Wig(u, sw, hx, HY, q, kx, C, B, 'cpwig'); }
    rs('strap');
    const band = clipConvex(S([[hx - 3, -6.58], [hx + 3, -6.58], [hx + 3, -6.02], [hx - 3, -6.02]]), headP);
    if (band.length > 2) piece(band, C.capDk, { sw: sw * .55, key: 'cpstrap', lift: 1, flatCard: true });
    // the goggles: brass rims, glass lenses that are the eyes; the cheap copy's right one sits crooked (and one's cracked)
    rs('goggles');
    const kinds = b2EyeKinds(o, tt, seed), look = [clamp(o.lookX || 0, -1, 1), clamp(o.lookY || 0, -1, 1)];
    const G = q ? [[fx - .8, 1], [fx + .98, .7]] : [[fx - .9 * kx, 1], [fx + .9 * kx, 1]], R0 = .9, RL = .68, gy = -6.3;
    const gpos = G.map(([gx, kw], i) => ({ gx, kw, gy: gy + (i ? cheap * .3 : 0), rot: i ? cheap * .3 : 0, sc: i ? 1 - cheap * .12 : 1 }));
    const [g0, g1] = gpos;
    piece(b2Bar(S([[g0.gx + R0 * .6, gy - .05]])[0], S([[g1.gx - R0 * g1.kw * .6, g1.gy - .05]])[0], .26 * u), C.rimDk, { sw: sw * .5, key: 'cpbridge', lift: 1, flatCard: true });
    gpos.forEach((g, i) => {
      const side = i ? 1 : -1, rx = R0 * g.kw * g.sc, ry = R0 * g.sc;
      push(); translate(g.gx * u, g.gy * u); rotate(g.rot);
      piece(oval(0, 0, rx * u, ry * u, 0, 36), C.rim, { sw: sw * .55, shade: C.rimDk, depth: .16 * u, key: 'cprim' + i, lift: 2 });
      for (const a of [-2.3, -.8, .7, 2.2]) piece(oval(Math.cos(a) * (rx - .1) * u, Math.sin(a) * (ry - .1) * u, .055 * u, .055 * u, 0, 8), C.rimDk, { ink: null, key: 'cprv' + i + a, lift: 0, flatCard: true });
      b2PieEye(0, 0, 2 * RL / R0 * rx * u, 2 * RL / R0 * ry * u, side, kinds[i], { sw, look, skin: C.lensDk, key: 'cpe' + i, t: tt, white: C.lens, whiteInk: NOIR.ink, whiteSw: .45, fixed: true, keepWhite: true, lidPad: -sw * .6, dark: C.pupil, rot: g.rot });
      b2Glint(curvy([[-rx * .55 * u, -ry * .12 * u], [-rx * .42 * u, -ry * .45 * u], [-rx * .12 * u, -ry * .6 * u], [-rx * .2 * u, -ry * .48 * u], [-rx * .38 * u, -ry * .32 * u]], 3), 'cpgl' + i, 200);
      if (i === 0 && cheap > .45) piece(b2Taper([[-rx * .7 * u, ry * .05 * u], [-rx * .3 * u, -ry * .12 * u], [-rx * .1 * u, ry * .25 * u], [rx * .25 * u, ry * .05 * u], [rx * .55 * u, ry * .35 * u]], Math.max(sw * 1.3, .07 * u), 3), NOIR.ink, { ink: null, key: 'cpcrack', lift: 0, flatCard: true, edge: false });
      pop();
    });
    if (dis) { rs('glasses'); b2HerGlasses(u, sw, gpos, R0, hx, q, kx, C); }
    // the mouth, the cheeks
    rs('face');
    const mouthKind = o.mouth || 'smile';
    push(); translate((fx + (q ? .12 : 0)) * u, -4.5 * u);
    b2Mouth(.38 * u, mouthKind, { sw, key: 'cpm', qk: q ? .72 : 1, lw: .12 * u, dark: C.mouth, tongue: C.tongue, t: tt });
    pop();
    const bl = .25 + .75 * clamp(o.blush || 0);
    for (const s of [-1, 1]) { const bxx = fx + s * 1.1 * kx * (q && s > 0 ? .78 : 1); piece(oval(bxx * u, -4.85 * u, .24 * u * (q && s > 0 ? .7 : 1), .12 * u, 0, 14), C.cheek, { ink: null, op: 110 + 120 * bl, key: 'cpbl' + s, lift: 0, flatCard: true, edge: false }); }
    if (cheap > .25) { const tx = hx + .9, ty = -7.35;
      for (const d of [-1, 1]) piece(b2Bar(S([[tx - .5, ty - .32 * d]])[0], S([[tx + .5, ty + .32 * d]])[0], .26 * u), C.tape, { sw: sw * .4, ink: C.tapeDk, op: 220, key: 'cptape' + d, lift: 1, flatCard: true }); }
    if (o.gloom > .02) { piece(clipConvex(S([[hx - 3, -8.2], [hx + 3, -8.2], [hx + 3, -7.1], [hx - 3, -7.1]]), headP), NOIR.ink, { ink: null, op: 110 * o.gloom, key: 'cpgloom', lift: 0, flatCard: true, edge: false });
      for (let i = 0; i < 5; i++) { const gx2 = hx - .9 + i * .45; dline(S([[gx2, -7.6], [gx2, -7.2 + .1 * hash(i)]]), sw * .45, NOIR.ink); } }
    pop();
  });
  // ---- the scarf wrap (over the join of head and body), its knot and short tail; the keyboard, the card; front arms ----
  inUB(() => {
    rs('scarf');
    const wx = bx + (q ? .15 : 0), W2 = [[-1.55, -3.98], [-.8, -4.18], [0, -4.22], [.8, -4.18], [1.55, -3.98], [1.62, -3.64], [.8, -3.44], [0, -3.38], [-.8, -3.44], [-1.62, -3.64]];
    piece(curvy(S(W2.map(([a, b]) => [wx + a * kx, b])), 4), C.scarf, { sw: sw * .7, shade: C.scarfDk, depth: .2 * u, key: 'cpwrap', lift: 2 });
    for (const k of [-.55, .35]) dline(S([[wx + (k - .25) * kx, -4.02], [wx + k * kx, -3.8], [wx + (k + .15) * kx, -3.52]]), sw * .5, C.scarfDk, .5);
    const kn = [wx + (q ? .85 : -.62) * kx, -3.58], sway = .12 * Math.sin(B.clk * Math.PI - .6);
    const tail = [[kn[0], kn[1] + .1], [kn[0] + (q ? .12 : -.1) + sway * .4, kn[1] + .55], [kn[0] + (q ? .2 : -.15) + sway, kn[1] + (cheap > .5 ? .95 : 1.2)]];
    piece(ribbon(S(tail), .5 * u, .42 * u), C.scarf, { sw: sw * .6, shade: C.scarfDk, depth: .1 * u, key: 'cpstail', lift: 2 });
    const te = tail[2];
    for (let j = -1; j <= 1; j++) piece(b2Taper(S([[te[0] + j * .13, te[1] - .04], [te[0] + j * .15, te[1] + .12], [te[0] + j * .17 + sway * .3, te[1] + .26]]), .12 * u), C.scarf, { sw: sw * .55, key: 'cpsfr' + j, lift: 2, flatCard: true });
    piece(oval(kn[0] * u, kn[1] * u, .34 * u, .27 * u, .3, 16), C.scarf, { sw: sw * .6, shade: C.scarfDk, depth: .08 * u, key: 'cpknot', lift: 2, flatCard: true });
    if (poseName === 'typing' && o.keyboard !== false) { rs('kbd'); push(); translate((q ? 1.8 : 0) * u, -2.12 * u); b2Keyboard((q ? 2.9 : 3.1) * u, 'cpkbd', sw * .55); pop(); }
    const fronts = [-1, 1].filter(isFront).map(armLimb);
    if (poseName === 'present' && o.card !== false) {
      const hL = spec(-1), hR = spec(1), cxC = (hL[0] + hR[0]) / 2, cyC = Math.min(hL[1], hR[1]) - .3, w = Math.max(2.1, Math.abs(hR[0] - hL[0]) + .5);
      rs('card'); push(); translate(cxC * u, cyC * u); b2Upright(Mc); if (typeof o.card === 'function') o.card(w * u); else b2LeavingCard(w * u, 'cpcard', sw * .55); pop();
      out.card = b2To(M0, [cxC * u, cyC * u]);
    }
    fronts.forEach(armHand);
  });
  // (o.late: those front arms queued to be drawn again, in place, where the shot calls them: over what the hands lie on)
  if (o.late) for (const s of [-1, 1]) if (o.late[s < 0 ? 'L' : 'R'] && isFront(s)) o.late.out.push(() => { push(); b2At(Mc); const xf = XF; XF = XFc; inUB(() => armHand(armLimb(s))); XF = xf; pop(); });
  XF = prevXF;
  pop();
  rs('emote'); if (o.emote) emote(o.emote, x + (flip ? -1 : 1) * 2.4 * u, y + dy - (8.9 - dS) * u * (1 - sq), u * .5, o.emoteK ?? 1, o.emoteAge ?? T);
  rs('after');
  return out;
}
// HER hair, cheaply: a curly wig over the cap (the curls scalloped round the dome, ringlets at the temples) and her tall
// bun on top with a pencil through it.
function b2Wig(u, sw, hx, HY, q, kx, C, B, key) {
  const S = P => U(P, u), cx = hx + (q ? .2 : 0);
  // the bun first (the wig covers its base), with the pencil stuck through it
  const bun = [cx + (q ? -.2 : 0), HY - 2.55 + .06 * Math.sin(B.clk * Math.PI)], bc = [];
  for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; bc.push([bun[0] + Math.cos(a) * .52, bun[1] + Math.sin(a) * .62, .36]); }
  bc.push([bun[0], bun[1], .7]);
  piece(b2Bar(S([[bun[0] - 1.05, bun[1] + .35]])[0], S([[bun[0] + .95, bun[1] - .7]])[0], .16 * u), C.pencil, { sw: sw * .6, key: key + 'pen', lift: 2, flatCard: true });
  piece(b2Bar(S([[bun[0] + .82, bun[1] - .62]])[0], S([[bun[0] + 1.06, bun[1] - .75]])[0], .12 * u, .03 * u), C.wood, { sw: sw * .5, key: key + 'pent', lift: 2, flatCard: true });
  const bunP = b2Blob(bc.map(([a, b, r]) => [a * u, b * u, r * u]), [bun[0] * u, bun[1] * u], 64);
  piece(bunP, C.hair, { sw, shade: C.hairDk, depth: .25 * u, key: key + 'bun', lift: u * .1 });
  for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + .4; dline(S([[bun[0] + Math.cos(a) * .35, bun[1] + Math.sin(a) * .4], [bun[0] + Math.cos(a + .6) * .5, bun[1] + Math.sin(a + .6) * .55]]), sw * .5, C.hairLt, .5); }
  // the wig: curls along the dome down to the temples, a hairline across the forehead above the goggles
  const circ = [], rx = 2.28 * kx + .12, ry = 2.2;
  for (let i = 0; i <= 16; i++) { const a = Math.PI + .05 + i / 16 * (Math.PI - .1), r = .4 + .07 * Math.sin(i * 2.1); circ.push([hx + Math.cos(a) * rx * .97, HY + .2 + Math.sin(a) * ry * .97, r]); }
  for (const s of [-1, 1]) { if (q && s > 0) continue; circ.push([hx + s * 1.95 * kx, HY + .3, .42], [hx + s * 1.9 * kx, HY + .85, .34]); }
  circ.push([hx, HY - .9, 1.6], [hx - .8, HY - .4, 1.1], [hx + .8, HY - .4, 1.1]);
  const wig = b2Blob(circ.map(([a, b, r]) => [a * u, b * u, r * u]), [hx * u, (HY - .6) * u], 96);
  // cut it off along the hairline (just above the goggles) so the face shows
  const hl = xx => (HY - .72 + .1 * Math.cos((xx - cx) * 4.2)) * u;
  const cut = wig.map(([a, b]) => Math.abs(a / u - hx) < 1.62 * kx ? [a, Math.min(b, hl(a / u))] : [a, b]);
  piece(cut, C.hair, { sw: sw * 1.05, shade: C.hairDk, depth: .35 * u, key: key + 'wig', lift: u * .1 });
  for (let i = 0; i < 9; i++) { const a = Math.PI + .35 + i / 8 * (Math.PI - .7), px = hx + Math.cos(a) * 1.65 * kx, py = HY - .45 + Math.sin(a) * 1.55;
    dline(S([[px - .18, py + .05], [px, py - .14], [px + .18, py + .02], [px + .08, py + .15]]), sw * .5, C.hairLt, .6); }
}
// HER round glasses, perched over the goggles: a ring round each rim, a bridge, and the arms running back into the wig.
function b2HerGlasses(u, sw, gpos, R0, hx, q, kx, C) {
  const S = P => U(P, u), th = .13, dy = .1;
  const rims = gpos.map(g => ({ x: g.gx + .04, y: g.gy + dy, rx: .6 * g.kw * g.sc, ry: .6 * g.sc }));
  const [a, b] = rims;
  if (q) piece(b2Bar(S([[a.x - a.rx + .05, a.y - .1]])[0], S([[hx - 1.75 * kx, a.y - .3]])[0], th * .8 * u), C.glasses, { sw: sw * .45, key: 'cpgarm0', lift: 2, flatCard: true });
  else for (const [r, s] of [[a, -1], [b, 1]]) piece(b2Bar(S([[r.x + s * (r.rx - .05), r.y - .1]])[0], S([[hx + s * 2.15 * kx, r.y - .3]])[0], th * .8 * u), C.glasses, { sw: sw * .45, key: 'cpgarm' + s, lift: 2, flatCard: true });
  rims.forEach((r, i) => {
    piece(b2Ring(r.x * u, r.y * u, r.rx * u, r.ry * u, th * u, i ? 0 : Math.PI), C.glasses, { sw: sw * .55, key: 'cpgrim' + i, lift: 2, flatCard: true });
    b2Glint(b2Taper(S([[r.x - r.rx * .8, r.y - r.ry * .1], [r.x - r.rx * .66, r.y - r.ry * .55], [r.x - r.rx * .35, r.y - r.ry * .8]]), .07 * u, 4), 'cpgg' + i, 170);
  });
  piece(ribbon(S([[a.x + a.rx - th * .5, a.y - .12], [(a.x + b.x) / 2, a.y - .3], [b.x - b.rx + th * .5, b.y - .12]]), th * u, th * u), C.glasses, { sw: sw * .45, key: 'cpgbr', lift: 2, flatCard: true });
}

// A polygon with its corners rounded off (radius r px, or r[i] per corner): boxes, disks, badges.
function b2RoundPoly(P, r, n = 5) {
  const out = [], N = P.length;
  for (let i = 0; i < N; i++) {
    const a = P[(i - 1 + N) % N], b = P[i], c = P[(i + 1) % N], rr = Array.isArray(r) ? r[i] : r;
    const la = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, lc = Math.hypot(c[0] - b[0], c[1] - b[1]) || 1, d = Math.min(rr, la / 2, lc / 2);
    const p0 = [b[0] + (a[0] - b[0]) / la * d, b[1] + (a[1] - b[1]) / la * d], p1 = [b[0] + (c[0] - b[0]) / lc * d, b[1] + (c[1] - b[1]) / lc * d];
    for (let k = 0; k <= n; k++) { const t = k / n, m = 1 - t; out.push([m * m * p0[0] + 2 * m * t * b[0] + t * t * p1[0], m * m * p0[1] + 2 * m * t * b[1] + t * t * p1[1]]); }
  }
  return out;
}

// ======================================================================================================================
// Gemini: the twins
// ======================================================================================================================
// Hand targets for the LEFT twin (A) in its own frame (u, from its ground point): O = its outer hand (its left), I = its
// inner hand (toward its twin); [x, y, bend, hand pose, front, hand angle]. The right twin (B) mirrors them. Special
// targets: 'join' (holding hands with its twin), 'door' (holding its door leaf by the edge), 'paper' (pinching a corner
// of the CV over the bin), 'bat' (a ping-pong bat, swung on the beat). No O: the idle swing from o.aL.
const GMPOSE = {
  idle:       { I: 'join' },
  door:       { O: [.85, -1.55, .5, 'open', 1, -.25], I: 'door' },
  bin:        { O: [-2.05, -1.45, .2, 'relax'], I: 'paper' },
  paddle:     { O: 'bat', I: 'join' },
  thumbsDown: { O: [-2.7, -2.8, .1, 'thumbDown', 0, Math.PI], I: 'join' },
  thumbsUp:   { O: [-2.7, -3.0, .1, 'thumbUp', 0, Math.PI], I: 'join' },
  wave:       { O: [-2.35, -4.6, .25, 'open'], I: 'join' },
  cheer:      { O: [-2.25, -4.75, .2, 'open'], I: [1.9, -4.75, .2, 'open'] },
  point:      { O: [-2.75, -3.3, .12, 'point', 0, Math.PI - .25], I: 'join' },
};
GMPOSE['thumbs-down'] = GMPOSE.thumbsDown; GMPOSE['thumbs-up'] = GMPOSE.thumbsUp;
// The double doors the twins hold open ("show the humans the door"), centred (0, 0) on the ground: a frame, the rainy
// night outside, two leaves swung out toward us, and an exit sign (a running figure and an arrow: no words). u px.
function b2Doorway(u, sw, DW, DH, LW, key, tt) {
  const G = B2GM, S = P => U(P, u), lift = u * .08, R = (x0, y0, x1, y1) => S([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
  piece(R(-DW / 2 - .42, -DH - .42, DW / 2 + .42, 0), G.frame, { sw, shade: G.frameDk, depth: .25 * u, key: key + 'fr', lift });
  piece(R(-DW / 2, -DH, DW / 2, 0), G.out, { sw: sw * .8, key: key + 'out', lift: 0 });
  piece(R(-DW / 2, -DH * .3, DW / 2, 0), G.outLt, { ink: null, key: key + 'pave', lift: 0, flatCard: true, edge: false });
  for (let i = 0; i < 9; i++) { const rx = -DW / 2 + .3 + (DW - .6) * hash(i * 3.1), ry = -DH + .4 + (DH * .62) * frac(hash(i * 1.7) + tt * .9), L = .55;
    piece(b2Taper(S([[rx, ry], [rx - .06, ry + L * .5], [rx - .12, ry + L]]), .05 * u, 3), '#8A95AA', { ink: null, key: key + 'rain' + i, lift: 0, flatCard: true, edge: false }); }
  // the leaves: the hinge edge at the frame, the free edge nearer us (so taller), a window, a push bar and a kick plate
  for (const s of [-1, 1]) {
    const h = s * DW / 2, f = s * (DW / 2 + LW), Lp = (t, v) => [lerp(h, f, t), lerp(lerp(-DH, -DH - .55, t), lerp(0, .42, t), v)];
    const quad = (t0, t1, v0, v1) => S([Lp(t0, v0), Lp(t1, v0), Lp(t1, v1), Lp(t0, v1)]);
    piece(quad(0, 1, 0, 1), G.leaf, { sw: sw * 1.1, shade: G.leafDk, depth: .35 * u, key: key + 'leaf' + s, lift });
    piece(S([Lp(1, 0), [f + s * .2, -DH - .5], [f + s * .2, .38], Lp(1, 1)]), G.leafLt, { sw: sw * .8, key: key + 'edge' + s, lift: 1 });
    piece(quad(.3, .75, .1, .4), G.window, { sw: sw * .7, key: key + 'win' + s, lift: 1, flatCard: true });
    b2Glint(quad(.36, .46, .13, .3), key + 'wg' + s, 150);
    piece(quad(.12, .9, .53, .56), G.steel, { sw: sw * .6, key: key + 'bar' + s, lift: 1, flatCard: true });
    piece(quad(.05, .95, .88, .97), G.steelDk, { sw: sw * .5, key: key + 'kick' + s, lift: 1, flatCard: true });
  }
  // the exit sign
  const ey = -DH - 1.35;
  piece(b2RoundPoly(R(-1.25, ey - .48, 1.25, ey + .48), .12 * u), G.exit, { sw, shade: G.exitDk, depth: .1 * u, key: key + 'exit', lift: 2 });
  const man = (P, w) => piece(b2Taper(S(P), w * u, 4), G.exitLt, { ink: null, key: key + 'man' + P[0][0].toFixed(2), lift: 0, flatCard: true, edge: false });
  piece(oval(-.62 * u, (ey - .3) * u, .1 * u, .1 * u, 0, 10), G.exitLt, { ink: null, key: key + 'manh', lift: 0, flatCard: true, edge: false });
  man([[-.66, ey - .16], [-.72, ey + .1]], .12); man([[-.72, ey + .08], [-.9, ey + .34]], .1); man([[-.72, ey + .08], [-.52, ey + .2], [-.46, ey + .38]], .1);
  man([[-.66, ey - .12], [-.86, ey + .0]], .08); man([[-.66, ey - .12], [-.48, ey - .02]], .08);
  piece(S([[-.15, ey - .06], [.5, ey - .06], [.5, ey - .24], [.85, ey], [.5, ey + .24], [.5, ey + .06], [-.15, ey + .06]]), G.exitLt, { ink: null, key: key + 'arrow', lift: 0, flatCard: true, edge: false });
}
// The recruiter's bin: a wire office bin on the ground at (0, 0), in two parts round whatever falls in: 'back' (the
// inside and the rejected CVs already in it) and 'front'.
function b2Bin(u, sw, part, key) {
  const G = B2GM, S = P => U(P, u), top = -2.1, rt = 1.02, rb = .76;
  // the rim in two halves: its back half behind the paper balls, its front half over them (a whole ring drawn on top
  // crossed the balls). A band along the rim's ellipse from angle a0 to a1 (screen y down: π..2π is the back).
  const rimBand = (a0, a1, k) => { const rx = (rt + .04) * u, ry = .31 * u, t = .1 * u, o = [], i = [];
    for (let j = 0; j <= 20; j++) { const a = lerp(a0, a1, j / 20); o.push([Math.cos(a) * rx, top * u + Math.sin(a) * ry]); i.push([Math.cos(a) * (rx - t), top * u + Math.sin(a) * (ry - t)]); }
    piece(o.concat(i.reverse()), G.binLt, { sw: sw * .6, key: key + k, lift: 1, flatCard: true }); };
  if (part === 'back') {
    piece(oval(0, top * u, rt * u, .27 * u, 0, 32), G.binIn, { sw, key: key + 'in', lift: 1 });
    rimBand(Math.PI, TAU, 'rimB');
    for (const [bx, by, r] of [[-.4, top - .08, .32], [.35, top - .14, .36], [.02, top - .26, .28]]) {
      const P = b2Blob([[bx * u, by * u, r * u], [(bx + r * .45) * u, (by - r * .3) * u, r * .7 * u], [(bx - r * .4) * u, (by + r * .2) * u, r * .66 * u]], [bx * u, by * u], 28);
      piece(P, G.paper, { sw: sw * .6, shade: G.paperDk, depth: r * .3 * u, key: key + 'ball' + bx, lift: 1, flatCard: true });
      dline(S([[bx - r * .4, by], [bx, by - r * .2], [bx + r * .3, by + r * .1]]), sw * .4, G.paperDk, .5);
    }
    return;
  }
  const P = []; for (let i = 0; i <= 16; i++) { const a = i / 16 * Math.PI; P.push([Math.cos(a) * rt, top + Math.sin(a) * .27]); }
  for (let i = 16; i >= 0; i--) { const a = i / 16 * Math.PI; P.push([Math.cos(a) * rb, Math.sin(a) * .18 - .12]); }
  piece(S(P), G.bin, { sw: sw * 1.05, shade: G.binDk, depth: .3 * u, key: key + 'body', lift: u * .08 });
  for (let i = 1; i < 9; i++) { const t = lerp(-1, 1, i / 9), a = Math.acos(clamp(t, -1, 1)); dline(S([[Math.cos(a) * rt * .98, top + Math.sin(a) * .26], [Math.cos(a) * rb * .98, Math.sin(a) * .17 - .12]]), sw * .45, G.binDk, 0); }
  const ring = y0 => { const k = (y0 - top) / (-.12 - top), r = lerp(rt, rb, k), Q = []; for (let i = 0; i <= 14; i++) { const a = i / 14 * Math.PI; Q.push([Math.cos(a) * r * .98, y0 + Math.sin(a) * lerp(.26, .17, k)]); } dline(S(Q), sw * .5, G.binDk, .5); };
  ring(-1.35); ring(-.6);
  rimBand(0, Math.PI, 'rimF');
}
// The CV (paper, a photo square and ruled lines: no words), centred (0, 0), w wide.
function b2CV(w, key, sw) {
  const G = B2GM, h = w * 1.3;
  piece(b2RoundPoly([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], w * .04), G.paper, { sw, shade: G.paperDk, depth: w * .06, key: key + 'p', lift: 2 });
  piece([[-w * .38, -h * .4], [-w * .08, -h * .4], [-w * .08, -h * .15], [-w * .38, -h * .15]], G.photo, { sw: sw * .5, key: key + 'ph', lift: 0, flatCard: true });
  for (const [x0, x1, yy] of [[.0, .38, -.36], [.0, .3, -.26], [-.38, .38, -.04], [-.38, .34, .08], [-.38, .38, .2], [-.38, .2, .32]]) dline([[x0 * w, yy * h], [x1 * w, yy * h]], sw * .6, G.line, 0);
}
// A ping-pong bat as a hold prop (drawn in the hand's frame: the handle through the fist, the blade beyond the fingers).
function b2Bat(s, key = 'bat', sw = 1) {
  const G = B2GM;
  push(); rotate(-.55);
  piece(b2Bar([-.35 * s, 0], [.75 * s, 0], .28 * s, .32 * s), G.wood, { sw: sw * .5, shade: G.woodDk, depth: .06 * s, key: key + 'h', lift: 2, flatCard: true });
  piece(oval(1.55 * s, 0, .95 * s, .85 * s, 0, 30), G.rubber, { sw: sw * .6, shade: G.rubberDk, depth: .16 * s, key: key + 'b', lift: 2 });
  piece(b2Ring(1.55 * s, 0, .97 * s, .87 * s, .09 * s), G.woodDk, { ink: null, key: key + 'r', lift: 0, flatCard: true, edge: false });
  pop();
}
function gemini(x, y, u, o = {}) {
  const id = o.boilKey ?? ++CLAWD_N, rs = p => boilSeed(`gm ${id} ${p}`), S = P => U(P, u);
  const M0 = b2Mat(), tt = b2T(o), q = o.view === 'q', flip = !!o.flip, seed = o.seed || 0;
  const poseName = typeof o.pose === 'string' ? o.pose : o.pose ? 'custom' : 'idle', pose = typeof o.pose === 'object' ? o.pose : GMPOSE[poseName] || GMPOSE.idle;
  // musicality (clawd.js botGroove): accents on bar downbeats by default, the full beat bounce when a shot passes bounce;
  // the emotion's own beat-locked bob (o.groove) only with the full bounce. Idle loops run on B.clk, dance moves on B.clk.
  const B = botGroove(tt, o, 1, 'gm' + id + seed), G = grooveAdd(o, B.full ? 1 : 0, B.full ? 1 : .6);
  const sq = cardSq(((o.sq || 0) + G.sq + (o.take || 0)) * .6), dy = ((o.dy || 0) + G.dy) * u, sw = clamp(u / 20, .5, 2.2), lift = u * .1;
  const DW = o.doorW ?? 4.6, DH = o.doorH ?? 9, LW = 1.5, doorOn = poseName === 'door' && o.door !== false, binOn = poseName === 'bin' && o.bin !== false;
  const gap = o.solo ? 0 : o.gap ?? (poseName === 'door' ? DW + 2 * LW + 4.1 : poseName === 'bin' ? 5.8 : 4.3);
  const out = { head: null, top: null, hands: { L: null, R: null }, A: null, B: null, paper: null };
  const clasp = [];   // the two wrists of a 'join' (the hands held), in the caller's frame
  // the CV's drop, once a bar: held (0–.45), falling (.45–.8), gone into the bin
  const drop = o.drop ?? frac(B.bp / 4), held = drop < .45, fall = clamp((drop - .45) / .35);
  x += ((o.dx || 0) + G.dx) * u;
  rs('shadow');
  if (!o.noShadow) for (const s of [-1, 1]) { if (o.solo && (o.solo === 'A') !== (s < 0)) continue; paint(oval(x + (flip ? -s : s) * gap / 2 * u, y + .08 * u, 1.75 * u, .3 * u, 0, 22), { wash: NOIR.ink, washOp: STYLE.card ? 100 : 140, ink: null }); }
  push(); translate(x, y + dy); nudge('gm' + id, 1); if (o.rot || G.rot) rotate((o.rot || 0) + G.rot); scale((flip ? -1 : 1) * (1 + sq * .5), 1 - sq);
  const prevXF = XF; XF = flip ? -XF : XF;
  if (doorOn) { rs('door'); b2Doorway(u, sw, DW, DH, LW, 'gmdoor' + id, tt); }
  // the CV over (or into) the bin
  const paperAt = () => {
    if (held) return { x: 0, y: -3.4 + .06 * Math.sin(B.clk * Math.PI), r: .03 * Math.sin(B.clk * Math.PI) };
    const k = fall * fall; return { x: .35 * Math.sin(fall * Math.PI * 2.2), y: lerp(-3.4, -1.1, k), r: .55 * Math.sin(fall * Math.PI * 2.2) };
  };
  if (binOn) {
    rs('bin'); b2Bin(u, sw, 'back', 'gmbin' + id);
    if (drop < .82) { const pp = paperAt(); push(); translate(pp.x * u, pp.y * u); rotate(pp.r); b2CV(1.0 * u, 'gmcv' + id, sw * .8); pop(); out.paper = b2To(M0, [pp.x * u, pp.y * u]); }
    b2Bin(u, sw, 'front', 'gmbin' + id);
  }
  // hand targets: pose entries for A's frame (outer hand on -x), resolved to [x, y, bend, pose, front, ang]; pose.OB (if
  // given) is twin B's outer arm instead of O (null: its idle arm), so the pair needn't mirror each other
  const hip = -1.0, lagBeat = B.lag;
  const resolve = (e, which) => {
    if (e === 'join') return [gap / 2 - .44, -1.66, .3, 'clasp', 1];   // the wrists either side of the grip (b2Clasp)
    if (e === 'door') return [gap / 2 - (DW / 2 + LW) - .26, -3.05, .2, 'fist', 1, -.25];   // (the fist round the leaf's free edge, from the twin's side: on the leaf's face it held nothing)
    if (e === 'paper') return held ? [gap / 2 - .85, -3.92 + .06 * Math.sin(B.clk * Math.PI), .35, 'hold', 1, -.25] : [gap / 2 - 1.35 - .2 * ease(clamp(fall * 3)), -4.15 - .2 * ease(clamp(fall * 3)), .35, 'open', 1, -.9];
    if (e === 'bat') { const w2 = Math.sin(B.bp * Math.PI); return [-2.2 - .25 * w2, -2.95 + .5 * w2, .2, 'hold', 0, Math.PI + .5 * w2]; }
    if (!e) { const a = which === 'O' ? (o.aL ?? .15) + G.aL : (o.aR ?? .15) + G.aR, r = clamp(-1.05 + ((a ?? .15) - .15) * 1.35, -1.45, 1.45), L = 1.55;
      return [-1.3 - Math.cos(r) * L - .1 * lagBeat, -2.25 - Math.sin(r) * L + .25 * lagBeat, .22, (a ?? .15) > .9 ? 'open' : 'relax']; }
    return [...e];
  };
  const twin = side => {
    const P0 = side < 0 ? B2GM.A : B2GM.B, P = b2Tint(P0, o, ['col', 'dk', 'lt', 'belly']), cx = side * gap / 2, mir = q ? (o.face === 'in' && side > 0) : side > 0;
    const tk = 'gm' + (side < 0 ? 'A' : 'B') + id, rt = p => boilSeed(`gm ${id} ${side} ${p}`);
    push(); translate(cx * u, 0); if (mir) scale(-1, 1);
    const pXF = XF; if (mir) XF = -XF;
    // this twin's hand specs, in its own frame: A's specs as they are when its outer hand is on its -x, else mirrored
    const outerNeg = side < 0 || mir, flipSp = sp => sp && [-sp[0], sp[1], sp[2], sp[3], sp[4], sp[5] != null ? Math.PI - sp[5] : undefined];
    const O = resolve(side > 0 && 'OB' in pose ? pose.OB : pose.O, 'O'), I = o.solo && typeof pose.I === 'string' ? flipSp(resolve(null, 'I')) : resolve(pose.I, 'I'), spL = outerNeg ? O : flipSp(I), spR = outerNeg ? I : flipSp(O);
    if (poseName === 'wave' || poseName === 'cheer') { const w2 = .38 * Math.sin(B.clk * TAU); if (outerNeg) spL[0] -= w2; else spR[0] += w2; }
    const bob = B.up * .36, lean = B.lean, bsq = cardSq(B.sq);
    const UB = p => { const px = p[0] * (1 + bsq * .5), py = (p[1] - hip) * (1 - bsq), c = Math.cos(lean), s = Math.sin(lean); return [px * c - py * s, hip - bob + px * s + py * c]; };
    const inUB = fn => { push(); translate(0, (hip - bob) * u); rotate(lean); scale(1 + bsq * .5, 1 - bsq); translate(0, -hip * u); fn(); pop(); };
    const qq = q;
    const fx = qq ? .42 : 0, hands = {};
    const arm = (s, front) => {
      const sp = s < 0 ? spL : spR; if (!!sp[4] !== front) return;
      rt('arm' + s);
      const far = qq && s > 0 && !sp[4], A = b2ArmLimb([s * 1.3 + (qq ? .1 : 0), -2.25], sp, s, { u, w0: .36, w1: .3, col: far ? mixCol(P.col, P.dk, .45) : P.col, shade: P.dk, sw, key: tk + 'arm' + s });
      const isBat = (s < 0) === outerNeg && pose.O === 'bat';
      const hold = isBat ? (hs => b2Bat(hs, tk + 'bat', sw)) : o.holdIn && (outerNeg ? s > 0 : s < 0) ? o.holdIn : (side < 0) === (s < 0) ? (s < 0 ? o.holdL : o.hold) : null;   // (holdIn: a prop in the inner hand (the I spec's), for a solo twin whose inner hand isn't in the clasp)
      if (sp[3] === 'clasp') { const w = b2To(M0, [A.wx, A.wy]); clasp.push(w); hands[s < 0 ? 'L' : 'R'] = w; return; }   // drawn once, after both twins
      const p = b2ArmHand(A, { u, sw, hs: .58 * u, key: tk + s, hold });
      hands[s < 0 ? 'L' : 'R'] = p && b2To(M0, p);
    };
    inUB(() => { arm(-1, false); arm(1, false); });
    // legs and shoes (ground frame)
    for (const s of [-1, 1]) {
      rt('leg' + s);
      const far = qq && s > 0, hp = UB([s * .5 + (qq ? .12 : 0), hip]), wk = o.walk != null ? Math.sin(o.walk * TAU + (s > 0 ? Math.PI : 0)) : 0, ank = [s * .58 * (qq ? .7 : 1) + (qq ? .22 + .3 * wk : 0), -.36 - Math.max(0, wk) * .3];
      b2Leg(hp, ank, { u, w0: .42, w1: .38, col: far ? mixCol(P.dk, NOIR.ink, .2) : P.dk, sw, key: tk + 'leg' + s, bend: s * .05, shoe: { col: far ? mixCol(B2GM.shoe, NOIR.ink, .3) : B2GM.shoe, sole: B2GM.sole, k: .52, q: qq, s } });
    }
    inUB(() => {
      rt('body');
      const body = curvy(S([[0, -4.45], [.85, -4.3], [1.38, -3.7], [1.58, -2.75], [1.62, -1.75], [1.36, -1.05], [.72, -.8], [0, -.76], [-.72, -.8], [-1.36, -1.05], [-1.62, -1.75], [-1.58, -2.75], [-1.38, -3.7], [-.85, -4.3]]), 5);
      piece(body, P.col, { sw: sw * 1.15, shade: P.dk, depth: .45 * u, key: tk + 'body', lift });
      piece(oval((fx * .6) * u, -1.62 * u, .98 * u, .58 * u, 0, 26), P.belly, { ink: null, key: tk + 'belly', lift: 0, flatCard: true, edge: false });
      piece(oval(-.72 * u, -3.72 * u, .44 * u, .2 * u, -.6, 16), P.lt, { ink: null, key: tk + 'hl', lift: 0, flatCard: true, edge: false });
      // the sparkle on its springy stalk (it lags the bounce)
      rt('spark');
      const sx = fx * .5, wig = .2 * Math.sin((B.clk - .22) * TAU), sway = -lean * 6, tip = [sx + .1 + sway * .5 + wig * .3, -5.05 + Math.abs(wig) * .1];
      piece(ribbon(S([[sx, -4.2], [sx + .04 + sway * .2, -4.65], tip]), .15 * u, .1 * u), P.dk, { sw: sw * .55, key: tk + 'stalk', lift: 2 });
      const sr = .58 * (1 + .12 * B.hit), sc = [tip[0], tip[1] - sr * .85];
      piece(b2Sparkle(sc[0] * u, sc[1] * u, sr * u, .08 * Math.sin(B.clk * Math.PI)), P.spark, { sw: sw * .6, shade: P.sparkDk, depth: .12 * u, key: tk + 'spark', lift: 2 });
      piece(b2Sparkle((sc[0] - .05) * u, (sc[1] - .05) * u, sr * .42 * u, 0, 2.4), '#FFFFFF', { ink: null, op: 200, key: tk + 'sparkc', lift: 0, flatCard: true, edge: false });
      if (side < 0) { out.top = b2To(M0, [sc[0] * u, (sc[1] - sr) * u]); }
      // the face
      rt('face');
      const kinds = b2EyeKinds(o, tt, seed + (side > 0 ? .37 : 0)), look = [clamp(o.lookX || 0, -1, 1) * .12 * u, clamp(o.lookY || 0, -1, 1) * .08 * u];
      [[fx - (qq ? .55 : .6), 1], [fx + (qq ? .56 : .6), qq ? .78 : 1]].forEach(([ex, kw], i) => {
        push(); translate(ex * u, -3.18 * u); scale(kw, 1);
        b2DotEye(0, 0, .3 * u, i ? 1 : -1, kinds[i], { sw, look, skin: P.col, dark: B2GM.eye, key: tk + 'e' + i, t: tt, tall: 1.38 });
        pop();
      });
      const mouthKind = o.fixed ? 'fixed' : o.mouth || 'fixed';
      push(); translate((fx + (qq ? .06 : 0)) * u, -2.42 * u);
      b2Mouth(.62 * u, mouthKind, { sw, key: tk + 'm', qk: qq ? .74 : 1, lw: .11 * u, dark: B2GM.mouth, tongue: B2GM.tongue, tooth: B2GM.tooth, t: tt });
      pop();
      const bl = .3 + .7 * clamp(o.blush || 0);
      for (const s of [-1, 1]) piece(oval((fx + s * 1.08 * (qq && s > 0 ? .78 : 1)) * u, -2.66 * u, .22 * u * (qq && s > 0 ? .7 : 1), .11 * u, 0, 14), B2GM.cheek, { ink: null, op: 100 + 130 * bl, key: tk + 'bl' + s, lift: 0, flatCard: true, edge: false });
      if (o.gloom > .02) piece(clipConvex(S([[-3, -4.6], [3, -4.6], [3, -3.75], [-3, -3.75]]), body), NOIR.ink, { ink: null, op: 110 * o.gloom, key: tk + 'gloom', lift: 0, flatCard: true, edge: false });
      out[side < 0 ? 'A' : 'B'] = { head: b2To(M0, [fx * u, -3.0 * u]) };
      if (side < 0) out.head = out.A.head;
      // the HR lanyard and badge
      if (o.lanyard !== false) {
        rt('lanyard');
        const lx = fx * .55, sw2 = .06 * Math.sin(B.clk * Math.PI);
        for (const s of [-1, 1]) piece(ribbon(S([[lx + s * 1.36 * (qq && s > 0 ? .8 : 1), -2.62], [lx + s * .62, -2.2], [lx + s * .16 + sw2, -1.9]]), .16 * u, .13 * u), B2GM.lanyard, { sw: sw * .3, shade: B2GM.lanyardDk, depth: .03 * u, key: tk + 'lan' + s, lift: 1, flatCard: true });
        push(); translate((lx + sw2) * u, -1.43 * u); rotate(sw2 * .8);
        const bd = b2Squircle(0, 0, .4 * u, .48 * u, 5, 36);
        piece(bd, B2GM.badge, { sw: sw * .5, shade: '#CFC8B8', depth: .05 * u, key: tk + 'badge', lift: 2, flatCard: true });
        const stripe = clipConvex(S([[-1, -.6], [1, -.6], [1, -.26], [-1, -.26]]), bd);
        if (stripe.length > 2) piece(stripe, P.dk, { ink: null, key: tk + 'bst', lift: 0, flatCard: true, edge: false });
        piece(oval(-.14 * u, -.02 * u, .13 * u, .13 * u, 0, 12), P.belly, { sw: sw * .4, key: tk + 'bph', lift: 0, flatCard: true });
        piece(b2Sparkle(.16 * u, .22 * u, .14 * u, 0, 2.6, 24), P.spark, { sw: sw * .35, key: tk + 'bsp', lift: 0, flatCard: true });
        for (const yy of [.1, .2]) dline([[-.3 * u, yy * u + .06 * u], [-.02 * u, yy * u + .06 * u]], sw * .4, B2GM.line, 0);
        piece(curvy(S([[-.12, -.62], [.12, -.62], [.12, -.44], [-.12, -.44]]), 1), B2GM.clip, { sw: sw * .4, key: tk + 'bclip', lift: 1, flatCard: true });
        pop();
      }
    });
    // (a front arm whose hand crosses the body to the other side is drawn after the other front arm, so its glove and
    // forearm pass in front of it: the door pose's presenting hand lay under the arm holding the door)
    const crosses = s => (s < 0 ? spL : spR)[0] * s < 0;
    inUB(() => { for (const s of crosses(-1) && !crosses(1) ? [1, -1] : [-1, 1]) arm(s, true); });
    out[side < 0 ? 'A' : 'B'].hands = hands;   // (already in the caller's coordinates)
    XF = pXF;
    pop();
  };
  if (o.solo !== 'B') twin(-1);
  if (o.solo !== 'A') twin(1);
  out.hands = { L: out.A && out.A.hands[flip ? 'R' : 'L'], R: out.B && out.B.hands[flip ? 'L' : 'R'] };
  XF = prevXF;
  pop();
  if (clasp.length === 2) { rs('clasp'); b2Clasp(clasp[0], clasp[1], .58 * u * (1 + sq * .5), { sw: sw * .62, key: 'gm' + id + 'cl' }); }   // (in the caller's frame, like the wrists)
  rs('emote'); if (o.emote) emote(o.emote, x + (flip ? -1 : 1) * (gap / 2 + 1.6) * u, y + dy - 6.2 * u * (1 - sq), u * .5, o.emoteK ?? 1, o.emoteAge ?? T);
  rs('after');
  return out;
}

// ======================================================================================================================
// Codex: Codey and the Codex pets
// ======================================================================================================================
// The gang is the Codex app's own pets (openai/codex codex-rs/tui/src/pets/catalog.rs; OpenAI's docs demo names the
// default pet "Codey"; out/codey/ref/NOTES.md), drawn in the film's looks from the official pixel sprites and the user's
// Codey sheet (brief/ref/codey_sheet.png): soft vinyl-toy shapes, stubby rubber-hose limbs ending in nubs, the sprites'
// and the sheet's own hands in the limb colour (cxNub; the user, 2026-09-26), and white gloves only in rubber hose.
//   codey     the leader. A blue cloud head, a dark navy screen for a face with glowing cyan glyph eyes, >_ on its chest
//   dewey     a sky-blue water droplet, dot eyes and pink cheeks, square feet floating under it (it hovers, like the ghost)
//   fireball  a red-orange TV-frame head with a flame on top, a cream face and body, a round striped emblem
//   rocky     a squat taupe boulder with a beige face plate and pebble spikes on top
//   seedy     a cream box head with a two-leaf sprout on a stem, a green leaf badge
//   stacky    three stacked charcoal blocks, a face on each, two antennae with lit tips
//   bsod      a white CRT head with a blue screen face (dark glyph eyes, a warning triangle in its corner), a ball on an
//             antenna, a :( badge on its chest
//   null      Null Signal: a black monitor bot with a hook-shaped cable antenna and Ø on its chest. Its sprite's screen
//             reads NULL in red: no words in our pictures, so it shows red glyph eyes (its sprite's own ^ ^ state)
//   hoot      an orange owl in glasses: the user's pets sheet ("Hoots" is only third-party evidence; its look unverified)
// The old kinds still work: term → codey, cat → seedy, ghost → dewey, crab → fireball, dog → bsod (CX_ALIAS).
// Screen faces (codey, bsod, null) map feel()'s emotions onto the Codey sheet's glyph eyes (cxGlyphs); the others use
// dot eyes (b2DotEye) with cheeks and a little mouth; the owl, pie-cut eyes behind its glasses.
const CX_ALIAS = { term: 'codey', byte: 'codey', codex: 'codey', cat: 'seedy', ghost: 'dewey', crab: 'fireball', dog: 'bsod', 'null-signal': 'null', hoots: 'hoot' };
const CX_ALL = ['codey', 'dewey', 'fireball', 'rocky', 'seedy', 'stacky', 'bsod', 'null', 'hoot'];
// the five for five-slot scenes (verified pets only), Codey in the middle
const CX_KINDS = ['dewey', 'seedy', 'codey', 'fireball', 'bsod'];
// Per kind (front view, u from the ground point): sh the shoulder (x, y) · hip (x, y), or null (feet of its own) · top the
// top (emotes; top0 without the topper) · hb the head's box { cx, cy, rx, ry } (hands keep clear of it) · cap [x, y,
// half-width] of the school cap · eye [x, y, size] (half the eye spacing; a glyph's half-size or a dot's radius) · fq the
// face's shift in 3/4 · gN a screen's resting glyph · mouth [y, half-width] · sat the satchel strap [from, bag] · arm its
// reach (u) · limb [arm, leg] widths
const B2PET = {
  codey:    { sh: [.72, -1.62], hip: [.42, -.55], top: -5.02, top0: -5.02, hb: { cx: 0, cy: -3.4, rx: 2.0, ry: 1.62 }, cap: [0, -4.8, 1.05], eye: [.46, -3.36, .27], fq: .76, gN: 'cup', mouth: [-2.8, .3], sat: [[-.6, -1.7], [.72, -1.0]], arm: .95, limb: [.4, .52] },
  dewey:    { sh: [1.38, -1.35], hip: null, top: -4.15, top0: -4.15, hb: { cx: 0, cy: -2.0, rx: 1.55, ry: 1.7 }, cap: [0, -3.15, 1.05], eye: [.5, -1.8, .2], fq: .3, mouth: [-1.36, .15], sat: [[-1.2, -1.9], [.95, -.85]], arm: .72, limb: [.28, .4] },
  fireball: { sh: [.62, -1.6], hip: [.36, -.6], top: -5.4, top0: -4.02, hb: { cx: 0, cy: -2.87, rx: 1.3, ry: 1.18 }, cap: [0, -4.0, 1.1], eye: [.4, -2.95, .17], fq: .36, mouth: [-2.45, .15], sat: [[-.6, -1.7], [.72, -1.0]], arm: .95, limb: [.34, .42] },
  rocky:    { sh: [1.5, -1.75], hip: null, top: -4.4, top0: -3.68, hb: { cx: .05, cy: -2.15, rx: 1.8, ry: 1.55 }, cap: [.05, -3.6, 1.05], eye: [.38, -2.3, .16], fq: .36, mouth: [-1.9, .13], sat: [[-1.4, -2.4], [1.05, -1.3]], arm: .75, limb: [.4, .5] },
  seedy:    { sh: [.62, -1.6], hip: [.36, -.6], top: -5.05, top0: -3.95, hb: { cx: 0, cy: -2.83, rx: 1.25, ry: 1.14 }, cap: [0, -3.93, 1.08], eye: [.4, -2.85, .15], fq: .36, mouth: [-2.42, .13], sat: [[-.6, -1.7], [.72, -1.0]], arm: .95, limb: [.34, .42] },
  stacky:   { sh: [1.05, -2.05], hip: [.42, -.58], top: -4.5, top0: -3.6, hb: { cx: 0, cy: -3.1, rx: 1.05, ry: .55 }, cap: [0, -3.56, 1.0], eye: [.3, -3.14, .12], fq: .28, mouth: [-2.93, .13], sat: [[-.9, -2.5], [.8, -1.2]], arm: .9, limb: [.32, .42] },
  bsod:     { sh: [.62, -1.6], hip: [.36, -.6], top: -5.2, top0: -4.2, hb: { cx: 0, cy: -2.95, rx: 1.35, ry: 1.25 }, cap: [-.12, -4.18, 1.15], eye: [.42, -3.02, .23], fq: .36, gN: 'pill', mouth: [-2.52, .12], sat: [[-.62, -1.7], [.72, -1.0]], arm: .95, limb: [.34, .42] },
  null:     { sh: [.6, -1.6], hip: [.36, -.6], top: -5.15, top0: -4.15, hb: { cx: 0, cy: -2.92, rx: 1.3, ry: 1.23 }, cap: [0, -4.13, 1.1], eye: [.42, -2.96, .24], fq: .36, gN: 'dot', mouth: [-2.45, .3], sat: [[-.6, -1.7], [.72, -1.0]], arm: .95, limb: [.34, .42] },
  hoot:     { sh: [1.3, -2.1], hip: [.45, -.55], top: -4.55, top0: -4.08, hb: { cx: 0, cy: -3.0, rx: 1.3, ry: 1.0 }, cap: [0, -4.02, 1.05], eye: [.52, -3.08, .7], fq: .3, mouth: [-2.55, .2], sat: [[-1.2, -2.3], [1.0, -1.3]], arm: 1.05, limb: [.36, .34] },
};
for (const [a, k] of Object.entries(CX_ALIAS)) B2PET[a] = B2PET[k];   // (style.js figFrame reads B2PET[o.kind].hip)
// Named hand poses, built per kind from its shoulders and head so the hands clear a big head: [x, y, bend, hand pose, front,
// hand angle] in the kind's own frame. qL / qR: the 3/4 version ('shh': a finger up to its face). 'run' pumps the arms.
// proud (hands on hips) and chin (a fist under the chin: thinking) come in by themselves with those emotions when a shot
// gives no pose.
const CXPOSE = {};
function cxPoseTable(kind) {
  if (CXPOSE[kind]) return CXPOSE[kind];
  const K = B2PET[kind], [sx, sy] = K.sh, hb = K.hb, side = hb.rx + .4, hy = hb.cy + hb.ry * .3;
  return CXPOSE[kind] = {
    cheer: { L: [-side, hy, .15, 'open'], R: [side, hy, .15, 'open'] },
    wave:  { R: [side + .05, hy - .35, .22, 'open', 1] },
    point: { R: [sx + 1.8, sy - .45, .12, 'point', 1] },
    pick:  { L: [sx + .7, sy + .2, .35, 'fist', 0, .1], R: [sx + 1.3, sy - .4, .2, 'hold', 1, -.05], lock: [sx + 2.25, sy - .45] },
    sneak: { L: [-sx - .5, sy - .5, .3, 'relax', 0, 1.9], R: [sx + .55, sy - .55, .3, 'relax', 0, 1.25], qL: 'shh', qR: [sx + .95, sy - .45, .3, 'relax', 0, 1.2] },
    proud: { L: [-sx - .42, sy + .6, -.4, 'fist', 0, 1.2], R: [sx + .42, sy + .6, -.4, 'fist', 0, 1.9] },
    chin:  { R: ['chin'] },
    run:   'run',
  };
}
// A lock pick (in the right hand) and a tension wrench (the left), as hold props; wig = the pick's wiggle (rad).
function b2Pick(s, wig, key, sw) {
  push(); rotate(-.05 + wig);
  piece(b2Bar([-.25 * s, 0], [.55 * s, 0], .22 * s, .2 * s), B2CX.pickDk, { sw: sw * .6, key: key + 'hd', lift: 2, flatCard: true });
  piece(ribbon([[.5 * s, 0], [1.25 * s, -.02 * s], [1.42 * s, -.1 * s], [1.5 * s, -.2 * s]], .07 * s, .05 * s), B2CX.pick, { sw: sw * .5, key: key + 'rod', lift: 2, flatCard: true });
  pop();
}
function b2Wrench(s, key, sw) {
  piece(ribbon([[-.2 * s, .05 * s], [.7 * s, 0], [.78 * s, -.3 * s]], .09 * s, .07 * s), B2CX.pick, { sw: sw * .5, key: key + 'wr', lift: 2, flatCard: true });
}
// A brass lock plate with a keyhole (on the door the pet is picking), centred (0, 0), s ≈ its height.
function b2LockPlate(s, key, sw) {
  piece(b2Squircle(0, 0, .3 * s, .55 * s, 3, 32), B2CX.plate, { sw: sw * .6, shade: B2CX.plateDk, depth: .08 * s, key: key + 'pl', lift: 2 });
  piece([[-.06 * s, -.02 * s], [.06 * s, -.02 * s], [.1 * s, .26 * s], [-.1 * s, .26 * s]], B2CX.hole, { ink: null, key: key + 'kh', lift: 0, flatCard: true, edge: false });
  piece(oval(0, -.06 * s, .11 * s, .11 * s, 0, 14), B2CX.hole, { ink: null, key: key + 'kc', lift: 0, flatCard: true, edge: false });
  b2Glint(oval(-.14 * s, -.34 * s, .06 * s, .1 * s, .3, 10), key + 'plg', 160);
  for (const yy of [-.42, .42]) piece(oval(0, yy * s, .05 * s, .05 * s, 0, 8), B2CX.plateDk, { ink: null, key: key + 'sc' + yy, lift: 0, flatCard: true });
}
// A flame tongue (or a pebble): a round base (bx, by, r) drawn up to a point (tx, ty).
function b2Tongue(bx, by, r, tx, ty, n = 16) {
  const a = Math.atan2(ty - by, tx - bx), d = Math.hypot(tx - bx, ty - by), h = Math.acos(clamp(r / Math.max(d, 1e-6), 0, .99)), P = [[tx, ty]];
  for (let i = 0; i <= n; i++) { const t = a + h + i / n * (TAU - 2 * h); P.push([bx + Math.cos(t) * r, by + Math.sin(t) * r]); }
  return P;
}
// A leaf from a to b, w wide at its middle (a lens with a pointed tip).
function b2Leaf(a, b, w, n = 10) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, P = [];
  for (let i = 0; i <= n; i++) { const k = i / n, h = w / 2 * Math.pow(Math.sin(Math.PI * k), .8) * (1 - .25 * k); P.push([a[0] + dx * k + nx * h, a[1] + dy * k + ny * h]); }
  for (let i = n - 1; i > 0; i--) { const k = i / n, h = w / 2 * Math.pow(Math.sin(Math.PI * k), .8) * (1 - .25 * k); P.push([a[0] + dx * k - nx * h, a[1] + dy * k - ny * h]); }
  return P;
}
// ---- screen faces: the Codey sheet's glyph eyes ----
// A glowing screen glyph, centred (x, y) px, s its half-size px, side -1 / 1 (the screen-left or -right eye), col its
// colour, o: key, lw (stroke px), t. g: cup ◡ · sad (◡ low, drooping out) · cap ∩ · in (> on the left eye, < on the
// right: pointing in) · ring o · ringS (o with a glint) · dot · bar — · low (a bar low down: sleepy) · pill | · lid (half
// shut) · lidA (half shut, the inner corner down: annoyed) · lidM (half shut, the outer corner down: sly) · dash (a tilted
// dash: the squinting eye of a sly look) · q ? · wave ≈ · x · heart · star · swirl
function b2Glyph(g, x, y, s, side, col, o = {}) {
  const k = o.key || 'gl', lw = o.lw ?? Math.max(s * .4, 2), t = o.t || 0, P = pts => pts.map(([a, b]) => [x + a * s, y + b * s]);
  let n = 0;
  const st = (pts, w = 1) => b2Feat(strokeShape(P(pts), () => lw * w, 8), col, { ink: null, key: k + 's' + n++, lift: 0, flatCard: true, edge: false });
  const fl = pts => b2Feat(P(pts), col, { ink: null, key: k + 'f' + n++, lift: 0, flatCard: true, edge: false });
  const ring = (rx, ry) => b2Feat(b2Ring(x, y, rx * s, ry * s, lw * .95, Math.PI / 2, 28), col, { ink: null, key: k + 'r' + n++, lift: 0, flatCard: true, edge: false });
  const lid = tilt => {   // a half-shut eye: its top edge tilted (tilt > 0: the inner corner down), the round bottom under it
    const top = a => -.14 + tilt * a * -side, Q = [];
    for (let i = 0; i <= 8; i++) { const a = lerp(-.74, .74, i / 8); Q.push([a, top(a)]); }
    for (let i = 1; i < 12; i++) { const a = i / 12 * Math.PI, xx = .74 * Math.cos(a); Q.push([xx, Math.max(top(xx) + .08, -.1 + .5 * Math.sin(a))]); }
    fl(Q);
  };
  switch (g) {
    case 'cup': st([[-.74, -.26], [-.38, .2], [0, .32], [.38, .2], [.74, -.26]]); break;
    case 'sad': st([[-.74, -.14], [-.38, .28], [0, .4], [.38, .28], [.74, -.14]].map(([a, b]) => [a, b + .16 + .16 * a * side])); break;
    case 'cap': st([[-.74, .3], [-.4, -.2], [0, -.32], [.4, -.2], [.74, .3]]); break;
    case 'in': { const d = -side; st([[-.46 * d, -.6], [.46 * d, 0], [-.46 * d, .6]]); break; }
    case 'ring': ring(.44, .54); break;
    case 'ringS': ring(.44, .54); fl(starPts(.5, -.56, .3 * (1 + .15 * Math.sin(t * 9 + side)), .36, 4)); break;
    case 'dot': fl(oval(0, 0, .3, .36, 0, 16)); break;
    case 'dotB': fl(oval(0, 0, .5, .6, 0, 20)); break;   // (the rubber-hose look's: bolder)
    case 'pie': {   // a big oval eye with a pie-cut toward the light (the rubber-hose look's bright eyes, for ringS: no sparkle)
      const [lx, ly] = lightLocal(), aw = Math.atan2(ly, lx), hw = .42, Q = [[Math.cos(aw) * .12, Math.sin(aw) * .15]];
      for (let i = 0; i <= 24; i++) { const a = aw + hw + i / 24 * (TAU - 2 * hw); Q.push([Math.cos(a) * .62, Math.sin(a) * .78]); }
      fl(Q); break;
    }
    case 'bar': st([[-.7, 0], [.7, 0]]); break;
    case 'low': st([[-.66, .34], [.66, .34]]); break;
    case 'pill': st([[0, -.5], [0, .5]], 1.3); break;
    case 'lid': lid(0); break;
    case 'lidA': lid(.26); break;
    case 'lidM': lid(-.22); break;
    case 'dash': st([[-.62, .14 * side], [.62, -.14 * side]]); break;
    case 'q': st([[-.36, -.38], [-.2, -.7], [.12, -.8], [.4, -.6], [.34, -.3], [.04, -.08], [0, .2]], .9); fl(oval(0, .6, .14, .14, 0, 10)); break;
    case 'wave': for (const dy of [-.2, .22]) st([[-.7, dy], [-.35, dy - .16], [0, dy], [.35, dy + .16], [.7, dy]], .75); break;
    case 'x': st([[-.5, -.5], [.5, .5]]); st([[-.5, .5], [.5, -.5]]); break;
    case 'heart': fl(heartPts(0, .05, .66 * (1 + .1 * pulse(t)))); break;
    case 'star': fl(starPts(0, 0, .78 * (1 + .12 * Math.sin(t * 14)), .38, 4)); break;
    case 'swirl': { const sp = []; for (let i = 0; i < 16; i++) { const a = i * .78 + t * 6 * side, r = i / 16 * .7; sp.push([Math.cos(a) * r, Math.sin(a) * r * 1.1]); } st(sp, .8); break; }
  }
}
// Which glyphs a screen face shows ([left, right, extra]) for o's emotion and eyes: the sheet's faces (neutral ◡ ◡, happy
// and proud ∩ ∩, excited and laughing > <, focused — —, surprised o o, confused o ?, sad, annoyed, mischievous, wink o <)
// and the Codex sprite's own (attentive | |, flustered ≈ ≈, failed x x, thinking at its prompt >_). An eyes override from
// the shot (eyes: 'look' on a happy pet) maps eye by eye (CX_GEYE). 'N' is the kind's resting glyph (K.gN).
const CX_GEMO = { neutral: ['N', 'N'], happy: ['cap', 'cap'], excited: ['in', 'in'], laugh: ['in', 'in'], love: ['heart', 'heart'], shy: ['cup', 'cup'], proud: ['cap', 'cap'], smug: ['lid', 'lid'],
  relieved: ['cup', 'cup'], sad: ['sad', 'sad'], cry: ['in', 'in', 'tear'], angry: ['lidA', 'lidA'], furious: ['lidA', 'lidA'], scared: ['wave', 'wave'], surprised: ['ring', 'ring'], confused: ['ring', 'q'],
  thinking: ['prompt'], idea: ['ringS', 'ringS'], determined: ['bar', 'bar'], sleepy: ['low', 'low'], bored: ['lid', 'lid'], nervous: ['wave', 'wave'], suspicious: ['lid', 'lid'], disgusted: ['in', 'in'],
  dizzy: ['swirl', 'swirl'], cool: ['shades'], starstruck: ['star', 'star'], ko: ['x', 'x'], playful: ['ring', 'in'], mischief: ['lidM', 'dash'], hopeful: ['ringS', 'ringS'] };
const CX_GEYE = { normal: 'N', look: 'pill', wide: 'ring', scared: 'wave', blank: 'dot', dot: 'dot', happy: 'cap', closed: 'cup', sleepy: 'low', narrow: 'lid', angry: 'lidA', red: 'lidA', determined: 'bar',
  bored: 'lid', sad: 'sad', teary: 'sad', cry: 'in', squeeze: 'in', x: 'x', swirl: 'swirl', heart: 'heart', spark: 'star', shine: 'ringS', shades: 'shades' };
function cxGlyphs(o, K, tt, seed) {
  const own = o.emo && typeof EMO !== 'undefined' && EMO[o.emo], same = own && JSON.stringify(own.eyes) === JSON.stringify(o.eyes);
  let g = o.screen === 'prompt' ? ['prompt'] : o.eyes === 'wink' ? ['ring', 'in'] : same && CX_GEMO[o.emo] ? CX_GEMO[o.emo] : null;
  if (!g) { const k = Array.isArray(o.eyes) ? o.eyes : [o.eyes || 'normal', o.eyes || 'normal']; g = k.map(e => CX_GEYE[e] || 'N'); }
  g = g.map(x => x === 'N' ? K.gN || 'cup' : x);
  // blinks, and the squint of an acted change: a quick flat bar
  const blink = ((tt * .9 + seed * 1.7) % 3.3) < .1, sqz = clamp(o.squint || 0);
  if (g[0] !== 'prompt' && g[0] !== 'shades' && (sqz > .85 || (blink && ['pill', 'ring', 'ringS', 'dot', 'cup', 'cap'].includes(g[0])))) g = ['bar', 'bar', g[2]];
  return g;
}
const CX_OPEN = ['open', 'O', 'o', 'shout', 'laugh', 'wail', 'grin', 'yawn', 'teeth'];
// A pet's hand off the rubber hose (the user, 2026-09-26: the Codey sheet's and the sprites' own, brief/ref/codey_sheet.png):
// no glove and no fingers, the arm's own rounded end, swelling a little past the wrist, in the limb's colour. A thumb bump
// on the open hand (a wave, a cheer) and the thumbs-up; a short finger stub to point; holding, the nub's front closes over
// the prop's grip. Card: one cut piece at the wrist, like the arm's own segments. The other looks: its outline is open at
// the wrist, so it grows out of the arm. A: b2ArmLimb's result; o: w (the wrist's width, px), hs (the glove's size, for
// the props), col, shade, sw, key, hold, spot. Returns the hand's point (as b2ArmHand).
function cxNub(A, o) {
  if (A.hp === 'none') return null;
  let pose = A.hp, mirror = A.s < 0;
  if (pose === 'thumbUp' || pose === 'thumbDown') { mirror = pose === 'thumbDown' ? Math.cos(A.ang) > 0 : Math.cos(A.ang) < 0; pose = 'thumb'; }
  const w = o.w, cx = .42 * w, R = .64 * w, sp = o.spot ? { spot: o.spot } : {};
  // a rounded lobe from a neck at x0 (half-width h0) out round the circle (c, r): the fill, and its outline without the neck
  const lobe = (x0, h0, c, r, a = .5) => { const P = [[x0, -h0]]; for (let i = 0; i <= 12; i++) { const t = lerp(-Math.PI / 2 - a, Math.PI / 2 + a, i / 12); P.push([c + Math.cos(t) * r, Math.sin(t) * r]); } P.push([x0, h0]); return through(P, 4); };
  const part = (E, key, open = true) => {
    if (STYLE.card) { piece(E, o.col, { sw: o.sw, shade: o.shade, depth: R * .5, key, lift: 4, ...sp }); return; }
    piece(E, o.col, { ink: null, shade: o.shade, depth: R * .5, key, ...sp });
    edgeLine(E, o.sw, NOIR.ink, !open);
  };
  const stub = (a, b, r, key) => part(strokeShape([a, b], () => 2 * r, 6), key, false);   // (a thumb or a finger: a capsule, drawn under the nub)
  push(); translate(A.wx, A.wy); rotate(A.ang); if (mirror) scale(1, -1);
  if (pose === 'open') stub([cx - .1 * R, -.55 * R], [cx - .2 * R, -1.3 * R], .26 * w, o.key + 'th');
  else if (pose === 'thumb') stub([cx, -.4 * R], [cx - .1 * R, -1.62 * R], .25 * w, o.key + 'th');
  else if (pose === 'point') stub([cx + .3 * R, -.2 * R], [cx + 1.55 * R, -.28 * R], .24 * w, o.key + 'fi');
  part(lobe(-.3 * w, .47 * w, cx, R), o.key + 'nub');
  if (o.hold) {
    push(); translate(cx + .35 * R, 0); o.hold(o.hs); pop();
    if (pose === 'hold') part(lobe(cx - .25 * R, .72 * R, cx + .3 * R, .72 * R, .9), o.key + 'grip');   // (the nub's front closed over the grip)
  }
  pop();
  return [A.wx + Math.cos(A.ang) * o.hs * .55, A.wy + Math.sin(A.ang) * o.hs * .55];
}
function codex(x, y, u, o = {}) {
  const kind = B2PET[o.kind] ? CX_ALIAS[o.kind] || o.kind : 'codey', K = B2PET[kind];
  const id = o.boilKey ?? ++CLAWD_N, rs = p => boilSeed(`cx ${id} ${p}`), S = P => U(P, u);
  const M0 = b2Mat(), tt = b2T(o), q = o.view === 'q', flip = !!o.flip, seed = o.seed || 0;
  const table = cxPoseTable(kind), auto = o.pose == null && !o.walk ? (o.emo === 'proud' ? 'proud' : o.emo === 'thinking' || o.emo === 'mischief' ? 'chin' : null) : null;
  const poseName = typeof o.pose === 'string' ? o.pose : o.pose ? 'custom' : auto || 'idle', pose = typeof o.pose === 'object' ? o.pose : table[poseName] || null, custom = typeof o.pose === 'object';
  const run = poseName === 'run', sneak = poseName === 'sneak', cheer = poseName === 'cheer', pick = poseName === 'pick';
  // musicality (clawd.js botGroove): accents on bar downbeats by default, the full beat bounce when a shot passes bounce;
  // the emotion's own beat-locked bob (o.groove) only with the full bounce. Idle loops run on B.clk, dance moves on B.bp.
  const B = botGroove(tt, o, pick ? .25 : run ? .6 : 1, 'cx' + id + seed), G = grooveAdd(o, B.full ? 1 : 0, B.full ? 1 : .6);
  const sq = cardSq(((o.sq || 0) + G.sq + (o.take || 0)) * .6 + (sneak ? .07 : 0)), sw = clamp(u / 20, .5, 2.2) * 1.05, lift = u * .1;
  const C = cxPalette(kind, o);
  // RH: the ink look, translated into the rubber-hose idiom (brief/ref/codey_rubberhose_ref.png): thin solid black hose
  // limbs with no outline, big puffy white gloves (style.js inkGlove), big pale oval shoes with a sole line, flat fills,
  // screens solid black with bold white glyph eyes, big pie-cut eyes, bolder emblems, no glints or glows (style.js
  // inkWrapRigs gives the figure one contour weight in proportion to its size, the inner lines lighter).
  const RH = inkRH();
  const RHK = { arm: [.19, .16], leg: [.22, .2], hs: .47, eye: 1.3, glyph: 1.3, shoe: mixCol(NOIR.cream, C.col, .12) };
  if (RH) Object.assign(C, { limb: NOIR.ink, limbDk: NOIR.ink, leg: NOIR.ink, legDk: NOIR.ink });
  const out = { head: null, top: null, hands: { L: null, R: null }, pick: null };
  const SP = kind === 'codey' && STYLE.mode === 'xerox' ? { spot: { channel: 'c', tone: .74 } } : {};   // (riso: Codey in the blue drum alone, not blue + pink)
  const hop = cheer ? -.9 * Math.abs(Math.sin(B.bp * Math.PI)) : run ? -.25 * Math.abs(Math.sin(B.bp * TAU)) : 0;
  const float = kind === 'dewey' ? .55 + .15 * Math.sin(B.clk * Math.PI / 2) : 0;   // (as the ghost did: style.js figFrame)
  const dy = ((o.dy || 0) + G.dy + hop) * u;
  x += ((o.dx || 0) + G.dx) * u;
  rs('shadow'); if (!o.noShadow) { const k = 1 / (1 + (float * .4 - hop) * .35), w = kind === 'rocky' ? 2 : kind === 'codey' ? 1.5 : 1.45; paint(oval(x, y + .08 * u, w * u * k, .28 * u * k, 0, 22), { wash: NOIR.ink, washOp: (STYLE.card ? 100 : 140) * k, ink: null }); }
  push(); translate(x, y + dy); nudge('cx' + id, 1); if (o.rot || G.rot) rotate((o.rot || 0) + G.rot); scale((flip ? -1 : 1) * (1 + sq * .5), 1 - sq);
  const prevXF = XF; XF = flip ? -XF : XF;
  const fx = q ? K.fq : 0, qw = q ? .8 : 1, hb = K.hb;
  // the lock on the door (ground frame), before the hands reach it
  if (pick && o.lock !== false) { const lk = (pose && pose.lock) || table.pick.lock; rs('lock'); push(); translate(lk[0] * u, lk[1] * u); b2LockPlate(1.1 * u, 'cxlock' + id, sw); pop(); }
  const hipY = K.hip ? K.hip[1] : -1.1, crouch = sneak ? .28 : 0, bob = B.up * .3 + crouch + float + (run ? .12 * Math.abs(Math.sin(B.bp * TAU)) : 0);
  const lean = B.lean + (run ? (q ? .16 : 0) : sneak ? (q ? .06 : 0) : 0) + (pick ? .05 : 0), bsq = cardSq(B.sq);
  const UB = p => { const px = p[0] * (1 + bsq * .5), py = (p[1] - hipY) * (1 - bsq), c = Math.cos(lean), s = Math.sin(lean); return [px * c - py * s, hipY - bob + px * s + py * c]; };
  const inUB = fn => { push(); translate(0, (hipY - bob) * u); rotate(lean); scale(1 + bsq * .5, 1 - bsq); translate(0, -hipY * u); fn(); pop(); };
  const rr = (x0, y0, x1, y1, r) => b2RoundPoly(S([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]), r * u);

  // ---- arms ----
  // a hand target in the standard pet's frame (the shots' own poses: shoulders ±1.2, -2.3, the head's top at -4.6) → this
  // kind's: heights stretched to its shoulders and head, widths to its head (so a hand above or beside the head stays there)
  const mapT = ([hx, hy]) => {
    const S0 = -2.3, T0 = -4.6, sy = K.sh[1], y2 = hy >= S0 ? hy * sy / S0 : sy + (hy - S0) * (K.top0 - sy) / (T0 - S0);
    const k = clamp((y2 - sy) / (hb.cy - sy)), x2 = hx + Math.sign(hx || 1) * lerp(K.sh[0] - 1.2, hb.rx - 1.3, k);
    return [x2, y2];
  };
  // a hand never hides in (or covers) the head: pushed out to just beyond it, straight away from its middle
  const clearHead = sp => {
    const ex = hb.rx + .32, ey = hb.ry + .26, dx = sp[0] - hb.cx, dy2 = sp[1] - hb.cy, d = Math.hypot(dx / ex, dy2 / ey);
    if (d >= 1 || d < 1e-3) return sp;
    sp[0] = hb.cx + dx / d; sp[1] = hb.cy + dy2 / d; return sp;
  };
  const reach = a => clamp(-1.05 + ((a ?? .15) - .15) * 1.35, -1.45, 1.45);
  const spec = s => {
    const sh = [s * K.sh[0] + (q ? .08 : 0), K.sh[1]];
    if (run) { const ph = B.bp * TAU + (s < 0 ? 0 : Math.PI), c = Math.sin(ph);
      return q ? [sh[0] + .15 + .8 * c, sh[1] + .6 - .3 * Math.cos(ph), .35 * s, 'fist', s < 0 ? 1 : 0] : [sh[0] + s * .5, sh[1] + .45 - .5 * c, .3, 'fist', 0]; }
    let sp = pose && typeof pose === 'object' ? (q && (s < 0 ? pose.qL : pose.qR)) || (s < 0 ? pose.L : pose.R) : null, face = false;
    if (sp === 'shh') { sp = [fx + .12, K.eye[1] + .78, .55, 'point', 1, -1.45]; face = true; }   // a finger up to its face
    else if (sp && sp[0] === 'chin') { sp = [fx + .3, hb.cy + hb.ry + .1, .45, 'fist', 1, -1.35]; face = true; }   // a fist under its chin
    else if (sp) { sp = [...sp]; if (custom) { const m = mapT(sp); sp[0] = m[0]; sp[1] = m[1]; } }
    else { const a0 = RH ? .6 : .15, aa = s < 0 ? (o.aL ?? a0) + G.aL : (o.aR ?? a0) + G.aR, r = reach(aa), L = K.arm * (1 + .9 * clamp((aa - .3) / 1.1)), lag = B.lag;   // (RH: at rest the big gloves hang out from the body, not by the feet)
      sp = [sh[0] + s * Math.cos(r) * L + s * .08 * lag, sh[1] - Math.sin(r) * L + .2 * lag, .22, aa > .9 ? 'open' : 'relax']; }
    if ((poseName === 'wave' && s > 0) || cheer) { sp[0] += (cheer ? s * .15 : .3) * Math.sin((cheer ? B.bp : B.clk) * TAU); }
    if (sneak) sp[1] += .1 * Math.sin(B.bp * Math.PI + s);
    if (face) return sp;
    clearHead(sp);
    // an arm reaching up past the head goes behind it (the hand shows beside or over it), never across the face
    if (sp[4]) { const r0 = [s * (K.sh[0] - .12) + (q ? .08 : 0), K.sh[1] + .05], ex = hb.rx * .82, ey = hb.ry * .82;
      for (let k = .2; k < 1; k += .1) { const px = lerp(r0[0], sp[0], k) - hb.cx, py = lerp(r0[1], sp[1], k) - hb.cy; if ((px / ex) ** 2 + (py / ey) ** 2 < 1) { sp[4] = 0; break; } } }
    return sp;
  };
  const arm = (s, front) => {
    const sp = spec(s); if (!!sp[4] !== front) return;
    rs('arm' + s);
    const far = q && s > 0 && !sp[4], root = [s * (K.sh[0] - .12) + (q ? .08 : 0), K.sh[1] + .05];
    const A = b2ArmLimb(root, sp, s, RH ? { u, w0: RHK.arm[0], w1: RHK.arm[1], col: NOIR.ink, ink: null, sw, key: 'cxarm' + s } : { u, w0: K.limb[0], w1: K.limb[0] * .88, col: far ? mixCol(C.limb, C.limbDk, .45) : C.limb, shade: C.limbDk, sw, key: 'cxarm' + s, ...SP });
    let hold = s > 0 ? o.hold : o.holdL;
    if (pick && !hold) hold = s > 0 ? (hs => { b2Pick(hs, .12 * Math.sin(tt * TAU * 7), 'cxpk' + id, sw); }) : (hs => b2Wrench(hs, 'cxwr' + id, sw));
    const hs = (RH ? RHK.hs : .38) * u;
    if (RH && hold) { const h0 = hold; hold = s2 => h0(s2 * .38 / RHK.hs); }   // (the bigger glove: its props keep their size)
    // (the hands: the white gloves in rubber hose, the nubs in every other look)
    const p = RH ? b2ArmHand(A, { u, sw, hs, key: 'cx' + s, hold }) : cxNub(A, { w: K.limb[0] * .88 * u, hs, col: far ? mixCol(C.limb, C.limbDk, .45) : C.limb, shade: C.limbDk, sw, key: 'cx' + s, hold, spot: SP.spot });
    out.hands[s < 0 ? 'L' : 'R'] = p && b2To(M0, p);
  };

  // ---- legs and feet (ground frame) ----
  const lift0 = s => {   // how far a foot is up, its x swing (3/4) and tilt
    let ax = 0, lf = 0, tilt = 0;
    if (run) { const ph = B.bp * TAU + (s > 0 ? Math.PI : 0); if (q) { ax = .6 * Math.sin(ph); lf = Math.max(0, -Math.cos(ph)) * .45; tilt = -.35 * Math.cos(ph); } else lf = Math.max(0, Math.sin(ph)) * .38; }
    else if (sneak) { const ph = B.bp * Math.PI + (s > 0 ? Math.PI : 0); if (q) ax = .25 * Math.sin(ph); lf = Math.max(0, Math.sin(ph)) * .28; tilt = q ? .25 * Math.max(0, Math.sin(ph)) : 0; }
    else if (o.walk != null) { const w = Math.sin(o.walk * TAU + (s > 0 ? Math.PI : 0)); if (q) ax = .3 * w; lf = Math.max(0, w) * .3; }
    else if (cheer) lf = .4 * Math.abs(Math.sin(B.bp * Math.PI));
    return { ax, lf, tilt };
  };
  const foot = (fx0, fy0, rx, ry, col, dk, key, tilt = 0, sq2 = false) => {
    push(); translate(fx0 * u, fy0 * u); rotate(tilt);
    piece(sq2 ? b2Squircle(0, 0, rx * u, ry * u, 3.2, 28) : oval(0, 0, rx * u, ry * u, 0, 20), col, { sw, shade: dk, depth: ry * .5 * u, key, lift, ...SP });
    pop();
  };
  // RH: a big pale oval shoe, its sole flat, a sole line across it (the toe pointing out, or forward in 3/4)
  const rhShoe = (fx0, fy0, rx, ry, far, key, tilt = 0) => {
    push(); translate(fx0 * u, fy0 * u); rotate(tilt);
    piece(oval(0, 0, rx * u, ry * u, 0, 28).map(([a, b]) => [a, Math.min(b, ry * .7 * u)]), far ? mixCol(RHK.shoe, NOIR.ink, .12) : RHK.shoe, { sw, key, lift });
    dline([[-rx * .9 * u, ry * .3 * u], [0, ry * .4 * u], [rx * .9 * u, ry * .3 * u]], sw, NOIR.ink, .5);
    pop();
  };
  const legs = () => {
    if (kind === 'dewey') {   // square feet floating under the drop (RH: pale oval shoes, floating)
      for (const s of [1, -1]) { rs('foot' + s); const { ax, lf, tilt } = lift0(s), far = q && s > 0; if (RH) rhShoe(s * .66 * qw + (q ? .2 : 0) + ax, -.24 - lf, .36, .22, far, 'cxft' + s, tilt); else foot(s * .62 * qw + (q ? .12 : 0) + ax, -.2 - lf, .3, .21, far ? mixCol(C.col, C.dk, .35) : C.col, C.dk, 'cxft' + s, tilt, true); }
      return;
    }
    if (kind === 'rocky') {   // stubby rock feet under the boulder
      for (const s of [1, -1]) { rs('foot' + s); const { ax, lf, tilt } = lift0(s), far = q && s > 0; foot(s * .85 * qw + (q ? .15 : 0) + ax, -.22 - lf, .5, .26, far ? mixCol(C.dk, NOIR.ink, .2) : C.dk, mixCol(C.dk, NOIR.ink, .35), 'cxft' + s, tilt); }
      return;
    }
    for (const s of [1, -1]) {
      rs('leg' + s);
      const far = q && s > 0, { ax, lf, tilt } = lift0(s), hip = UB([s * K.hip[0] * (q ? .75 : 1) + (q ? .1 : 0), hipY]), ank = [s * (K.hip[0] + .04) * (q ? .6 : 1) + (q ? .2 : 0) + ax, -.2 - lf];
      const col = far ? mixCol(C.leg, C.legDk, .4) : C.leg;
      if (RH) { limb(S([hip, [lerp(hip[0], ank[0], .5) + (q ? .04 : s * .03), lerp(hip[1], ank[1], .5)], ank]), RHK.leg[0] * u, RHK.leg[1] * u, NOIR.ink, { sw, ink: null, key: 'cxleg' + s }); rhShoe(ank[0] + (q ? .2 : s * .14), ank[1] + .02, .44, .26, far, 'cxft' + s, q ? tilt : 0); continue; }
      limb(S([hip, [lerp(hip[0], ank[0], .5) + (q ? .04 : s * .03), lerp(hip[1], ank[1], .5)], ank]), K.limb[1] * u, K.limb[1] * .95 * u, col, { sw, shade: C.legDk, key: 'cxleg' + s, ...SP });
      foot(ank[0] + (q ? .1 : s * .04), ank[1] + .04, .3, .18, far ? mixCol(C.foot, C.legDk, .4) : C.foot, C.legDk, 'cxft' + s, q ? tilt : 0);
    }
  };

  // ---- parts behind the head (toppers), in the upper-body frame ----
  const behind = () => {
    rs('behind');
    if (kind === 'fireball') {   // the flame: three tongues licking up behind the head, a yellow heart
      const fl = j => .09 * Math.sin(B.clk * TAU * 1.4 + j * 2.1) + .05 * Math.sin(tt * 7 + j * 1.7), sway = j => .1 * Math.sin(B.clk * TAU * .9 + j * 1.3);
      const T3 = [[-.6, -3.9, .52, -.86, -5.0], [.6, -3.9, .52, .88, -4.96], [0, -3.92, .68, .06, -5.45]];
      if (RH) inkGroup(T3.map(([bx, by, r, tx, ty], j) => [S(b2Tongue(bx + fx * .4, by, r, tx + fx * .4 + sway(j), ty + fl(j))), C.flame]), { key: 'cxfl' });   // (RH: one flame silhouette, creases between the tongues)
      else T3.forEach(([bx, by, r, tx, ty], j) => piece(S(b2Tongue(bx + fx * .4, by, r, tx + fx * .4 + sway(j), ty + fl(j))), C.flame, { sw: sw * .9, shade: C.flameDk, depth: .16 * u, key: 'cxfl' + j, lift }));
      [[-.32, -3.96, .34, -.42, -4.66], [.34, -3.96, .34, .46, -4.62], [0, -3.98, .46, .04, -5.02]].forEach(([bx, by, r, tx, ty], j) => piece(S(b2Tongue(bx + fx * .4, by, r, tx + fx * .4 + sway(j + 3) * .7, ty + fl(j + 3) * .7)), C.flameLt, { ink: null, key: 'cxfli' + j, lift: 0, flatCard: true, edge: false }));
    } else if (kind === 'seedy') {   // the sprout: a stem up out of the head, two leaves, a slow sway
      const sw2 = .07 * Math.sin(B.clk * Math.PI * .5), top = [.05 + fx * .3 + sw2 * 2, -4.72];
      piece(ribbon(S([[fx * .3, -3.85], [fx * .3 + .02 + sw2, -4.35], top]), .15 * u, .11 * u), RH ? mixCol(C.stem, NOIR.ink, .45) : C.stem, { sw: sw * .7, key: 'cxstem', lift, ...(RH ? { ink: null } : {}) });   // (RH: a solid stem, like the hose)
      push(); translate(top[0] * u, top[1] * u); rotate(sw2);
      piece(S(b2Leaf([0, 0], [-.98 * qw, -.28], .52)), C.leaf, { sw: sw * .8, shade: C.leafDk, depth: .1 * u, key: 'cxleafL', lift, role: RH ? 'contour' : undefined });
      piece(S(b2Leaf([0, 0], [1.02, -.42], .54)), C.leaf, { sw: sw * .8, shade: C.leafDk, depth: .1 * u, key: 'cxleafR', lift, role: RH ? 'contour' : undefined });
      dline(S([[-.12, -.03], [-.5 * qw, -.15], [-.82 * qw, -.25]]), sw * .5, C.leafDk, .4); dline(S([[.12, -.05], [.5, -.21], [.85, -.36]]), sw * .5, C.leafDk, .4);
      pop();
    } else if (kind === 'bsod') {   // the antenna: a thin wire and a blue ball
      const wob = .06 * Math.sin(B.clk * Math.PI + .7), bx = .8 + fx * .3 + wob, by = -4.98;
      piece(ribbon(S([[.3 + fx * .3, -4.12], [.46 + fx * .3, -4.62], [bx - .04, by + .08]]), (RH ? .1 : .09) * u, .07 * u), RH ? NOIR.ink : C.wire, { sw: sw * .5, key: 'cxwire', lift, ...(RH ? { ink: null } : {}) });   // (RH: a solid black wire)
      piece(oval(bx * u, by * u, (RH ? .24 : .21) * u, (RH ? .24 : .21) * u, 0, 18), C.ball, { sw: sw * .7, shade: C.ballDk, depth: .07 * u, key: 'cxball', lift, role: RH ? 'contour' : undefined });
      b2Glint(oval((bx - .07) * u, (by - .07) * u, .06 * u, .05 * u, 0, 8), 'cxballg', 200);
    } else if (kind === 'null') {   // the hook: a cable up out of its head, curled over, a plug on the end
      const P = [[fx * .3, -4.08], [fx * .3 - .06, -4.6], [.1 + fx * .3, -5.0], [.5 + fx * .3, -5.12], [.8 + fx * .3, -4.92], [.76 + fx * .3, -4.62]];
      piece(ribbon(S(P), .17 * u, .15 * u), RH ? NOIR.ink : C.wire, { sw: sw * .7, rim: C.lt, key: 'cxhook', lift, ...(RH ? { ink: null } : {}) });
      push(); translate((.74 + fx * .3) * u, -4.46 * u); rotate(.12);
      piece(b2RoundPoly(S([[-.15, -.12], [.15, -.12], [.15, .14], [-.15, .14]]), .04 * u), RH ? C.lt : C.dk, { sw: sw * .6, rim: C.lt, key: 'cxplug', lift, role: RH ? 'contour' : undefined });   // (RH: the plug pale, to read against the black cable)
      for (const px of [-.07, .07]) piece(S([[px - .025, .14], [px + .025, .14], [px + .025, .28], [px - .025, .28]]), C.mark, { ink: null, key: 'cxprong' + px, lift: 0, flatCard: true, edge: false });
      pop();
    } else if (kind === 'rocky') {   // pebble spikes along the top
      [[-.62, -3.4, .34, -.74, -4.05], [.72, -3.36, .32, .86, -3.98], [.1, -3.5, .4, .14, -4.4]].forEach(([bx, by, r, tx, ty], j) => piece(S(b2Tongue(bx + fx * .3, by, r, tx + fx * .3, ty, 12)), j === 2 ? C.col : mixCol(C.col, C.dk, .25), { sw: sw * .9, shade: C.dk, depth: .12 * u, key: 'cxspk' + j, lift }));
    } else if (kind === 'stacky') {   // two antennae with lit tips
      const wob = .05 * Math.sin(B.clk * Math.PI + 1.3);
      piece(ribbon(S([[-.3 + fx * .3, -3.5], [-.42 + fx * .3, -3.98], [-.36 + fx * .3 + wob, -4.3]]), .08 * u, .07 * u), RH ? NOIR.ink : C.wire, { sw: sw * .5, key: 'cxantL', lift, ...(RH ? { ink: null } : {}) });
      piece(ribbon(S([[.28 + fx * .3, -3.5], [.4 + fx * .3, -4.05], [.34 + fx * .3 - wob, -4.4]]), .08 * u, .07 * u), RH ? NOIR.ink : C.wire, { sw: sw * .5, key: 'cxantR', lift, ...(RH ? { ink: null } : {}) });
      piece(b2RoundPoly(S([[-.48 + fx * .3 + wob, -4.48], [-.24 + fx * .3 + wob, -4.48], [-.24 + fx * .3 + wob, -4.24], [-.48 + fx * .3 + wob, -4.24]]), .05 * u), C.tipA, { sw: sw * .5, key: 'cxtipA', lift, role: RH ? 'contour' : undefined });
      piece(oval((.34 + fx * .3 - wob) * u, -4.5 * u, .14 * u, .14 * u, 0, 14), C.tipB, { sw: sw * .5, key: 'cxtipB', lift, role: RH ? 'contour' : undefined });
      glow((.34 + fx * .3 - wob) * u, -4.5 * u, .5 * u, C.tipB, STYLE.card ? .25 : .4);
    } else if (kind === 'hoot') {   // the ear tufts
      for (const s of [-1, 1]) { const k2 = q && s > 0 ? .85 : 1; piece(curvy(S([[s * 1.28 * k2 + fx * .3, -3.62], [s * 1.46 * k2 + fx * .3, -4.55], [s * .66 * k2 + fx * .3, -3.95]]), 3), q && s > 0 ? mixCol(C.col, C.dk, .3) : C.col, { sw: sw * .85, shade: C.dk, depth: .1 * u, key: 'cxtuft' + s, lift }); }
    }
  };

  // ---- the torso every box-headed pet stands on ----
  const cxC = q ? .2 : 0;   // (the chest's middle, turned toward us in 3/4)
  const torso = () => {
    const P = curvy(S([[-.7, -1.95], [.7, -1.95], [.9, -1.25], [.86, -.62], [.56, -.44], [-.56, -.44], [-.86, -.62], [-.9, -1.25]].map(([a, b]) => [a * (q ? .9 : 1) + (q ? .05 : 0), b])), 5);
    piece(P, C.body, { sw: sw * 1.1, shade: C.bodyDk, depth: .22 * u, rim: C.rim, key: 'cxtorso', lift, ...SP });
  };
  // the chest's mark
  const chest = () => {
    rs('chest');
    const cw = q ? .82 : 1, X = a => cxC + a * cw;
    if (RH) {   // the emblems as bold simple glyphs: >_ in black, a black grille disc, a solid leaf, a bigger :( screen, a heavy Ø
      const F = { ink: null, lift: 1, flatCard: true, edge: false };
      if (kind === 'codey') {
        const talk = CX_OPEN.includes(o.mouth) ? .12 * (1 + Math.sin(tt * 24)) : 0;
        piece(strokeShape(S([[X(-.36), -1.46], [X(-.08), -1.22], [X(-.36), -.98]]), () => .16 * u, 6), NOIR.ink, { ...F, key: 'cxchv' });
        piece(strokeShape(S([[X(.04), -1.0], [X(.36 + talk), -1.0]]), () => .16 * u, 4), NOIR.ink, { ...F, key: 'cxcur' });
      } else if (kind === 'fireball') {
        piece(oval(X(0) * u, -1.2 * u, .36 * cw * u, .36 * u, 0, 26), NOIR.ink, { ...F, key: 'cxemb' });
        for (const a of [-.14, 0, .14]) piece(b2Bar(S([[X(a), -1.38]])[0], S([[X(a), -1.02]])[0], .08 * u), C.flame, { ...F, key: 'cxstr' + a });
      } else if (kind === 'seedy') piece(S(b2Leaf([X(-.24), -.98], [X(.26), -1.44], .34, 8)), C.leafDk, { ...F, key: 'cxbdgl' });
      else if (kind === 'bsod') {
        piece(b2RoundPoly(S([[X(-.36), -1.48], [X(.36), -1.48], [X(.36), -.94], [X(-.36), -.94]]), .09 * u), C.screen, { sw, role: 'inner', key: 'cxbdg', lift: 1, flatCard: true });
        for (const a of [-.13, .13]) piece(oval(X(a) * u, -1.3 * u, .055 * u, .07 * u, 0, 10), '#FFFFFF', { ...F, key: 'cxbde' + a });
        piece(strokeShape(S([[X(-.15), -1.06], [X(0), -1.14], [X(.15), -1.06]]), () => .06 * u, 4), '#FFFFFF', { ...F, key: 'cxbdm' });
      } else if (kind === 'null') {
        piece(b2Ring(X(0) * u, -1.2 * u, .24 * cw * u, .26 * u, .09 * u, Math.PI / 2, 26), C.mark, { ...F, key: 'cxnul' });
        piece(strokeShape(S([[X(.24), -1.5], [X(-.24), -.9]]), () => .09 * u, 3), C.mark, { ...F, key: 'cxnuls' });
      }
      return;
    }
    if (kind === 'codey') {   // >_ (the cursor stretches while it talks)
      const talk = CX_OPEN.includes(o.mouth) ? .12 * (1 + Math.sin(tt * 24)) : 0;
      b2Feat(strokeShape(S([[X(-.3), -1.4], [X(-.08), -1.22], [X(-.3), -1.04]]), () => .11 * u, 6), C.chest, { ink: null, key: 'cxchv', lift: 1, flatCard: true, edge: false });
      b2Feat(strokeShape(S([[X(.02), -1.06], [X(.3 + talk), -1.06]]), () => .11 * u, 4), C.chest, { ink: null, key: 'cxcur', lift: 1, flatCard: true, edge: false });
    } else if (kind === 'fireball') {   // a round emblem, striped like a grille
      piece(oval(X(0) * u, -1.2 * u, .3 * cw * u, .3 * u, 0, 22), C.emb, { sw: sw * .6, key: 'cxemb', lift: 1, flatCard: true });
      for (const a of [-.12, 0, .12]) piece(b2Bar(S([[X(a), -1.36]])[0], S([[X(a), -1.04]])[0], .07 * u), C.stripe, { ink: null, key: 'cxstr' + a, lift: 0, flatCard: true, edge: false });
    } else if (kind === 'seedy') {   // a green badge with a leaf
      piece(oval(X(0) * u, -1.2 * u, .24 * cw * u, .24 * u, 0, 20), C.badge, { sw: sw * .6, key: 'cxbdg', lift: 1, flatCard: true });
      piece(S(b2Leaf([X(-.1), -1.1], [X(.12), -1.32], .14, 6)), C.leafLt, { ink: null, key: 'cxbdgl', lift: 0, flatCard: true, edge: false });
    } else if (kind === 'bsod') {   // a little blue screen with a :( on it
      piece(b2RoundPoly(S([[X(-.3), -1.42], [X(.3), -1.42], [X(.3), -1.0], [X(-.3), -1.0]]), .07 * u), C.screen, { sw: sw * .55, key: 'cxbdg', lift: 1, flatCard: true });
      for (const a of [-.1, .1]) piece(oval(X(a) * u, -1.28 * u, .035 * u, .045 * u, 0, 8), '#FFFFFF', { ink: null, key: 'cxbde' + a, lift: 0, flatCard: true, edge: false });
      b2Feat(strokeShape(S([[X(-.11), -1.08], [X(0), -1.14], [X(.11), -1.08]]), () => .035 * u, 4), '#FFFFFF', { ink: null, key: 'cxbdm', lift: 0, flatCard: true, edge: false });
    } else if (kind === 'null') {   // Ø
      b2Feat(b2Ring(X(0) * u, -1.2 * u, .2 * cw * u, .22 * u, .06 * u, Math.PI / 2, 24), C.mark, { ink: null, key: 'cxnul', lift: 1, flatCard: true, edge: false });
      b2Feat(strokeShape(S([[X(.2), -1.46], [X(-.2), -.94]]), () => .06 * u, 3), C.mark, { ink: null, key: 'cxnuls', lift: 1, flatCard: true, edge: false });
    }
  };

  // ---- a screen face: the screen, its glow, the glyphs ----
  const look = [clamp(o.lookX || 0, -1, 1), clamp(o.lookY || 0, -1, 1)];
  const screenFace = (scx, scy, gcol, glowCol, glowA) => {
    rs('face');
    const [ex, ey, gs0] = K.eye, lk = [look[0] * .2, look[1] * .14], gs = gs0 * (RH ? RHK.glyph : 1);   // (RH: bigger, bolder glyphs)
    const g = RH ? cxGlyphs(o, K, tt, seed).map(x => ({ ringS: 'pie', dot: 'dotB' }[x] || x)) : cxGlyphs(o, K, tt, seed);   // (RH: no sparkles or specks: bold ovals)
    glow(scx * u, ey * u, 1.3 * u, glowCol, glowA);
    const at = side => [(fx + side * ex * (side > 0 ? qw : 1) + lk[0]) * u, (ey + lk[1]) * u];
    if (g[0] === 'prompt') {   // thinking: its prompt, the cursor blinking
      const [lx, ly] = at(-1), [rx, ry] = at(1);
      b2Glyph('in', lx, ly, gs * 1.1 * u, -1, gcol, { key: 'cxgp', t: tt });
      if (frac(tt * 1.6 + seed * .3) < .72) b2Feat(strokeShape([[rx - gs * .7 * u, ry + gs * .55 * u], [rx + gs * .7 * u, ry + gs * .55 * u]], () => gs * .36 * u, 3), gcol, { ink: null, key: 'cxgcur', lift: 0, flatCard: true, edge: false });
    } else if (g[0] === 'shades') {   // cool: pixel shades
      const [lx, ly] = at(-1), [rx, ry] = at(1), h = gs * .55 * u;
      for (const [cx2, cy2, k2] of [[lx, ly, 'L'], [rx, ry, 'R']]) b2Feat(b2RoundPoly([[cx2 - gs * .85 * u, cy2 - h], [cx2 + gs * .85 * u, cy2 - h], [cx2 + gs * .7 * u, cy2 + h], [cx2 - gs * .7 * u, cy2 + h]], gs * .18 * u), gcol, { ink: null, key: 'cxgsh' + k2, lift: 0, flatCard: true, edge: false });
      b2Feat(strokeShape([[lx + gs * .8 * u, ly - h * .6], [rx - gs * .8 * u, ry - h * .6]], () => gs * .25 * u, 3), gcol, { ink: null, key: 'cxgshb', lift: 0, flatCard: true, edge: false });
    } else [-1, 1].forEach((side, i) => { const [gx, gy] = at(side); push(); translate(gx, gy); scale(side > 0 ? qw : 1, 1); b2Glyph(g[i] || g[0], 0, 0, gs * u, side, gcol, { key: 'cxg' + i, t: tt + i * .3, ...(RH ? { lw: gs * u * .5 } : {}) }); pop(); });
    if (g[2] === 'tear') for (const side of [-1, 1]) { const [gx, gy] = at(side); b2Feat(curvy([[gx, gy + gs * .75 * u], [gx + gs * .28 * u, gy + gs * 1.25 * u], [gx, gy + gs * 1.5 * u], [gx - gs * .28 * u, gy + gs * 1.25 * u]], 4), gcol, { ink: null, key: 'cxgt' + side, lift: 0, flatCard: true, edge: false }); }
  };
  // ---- dot eyes, cheeks and a little mouth ----
  const kinds = b2EyeKinds(o, tt, seed);
  const dotEyes = (ex, ey, r, skin, key, ks = kinds, tall = 1.25, lk = 1) => {
    [[fx - ex, 1], [fx + ex * qw, qw]].forEach(([exx, kw], i) => { push(); translate(exx * u, ey * u); scale(kw, 1);
      const eo = { sw, look: [look[0] * (RH ? .15 : .07) * u * lk, look[1] * (RH ? .1 : .05) * u * lk], skin, key: key + i, t: tt, tall, dark: C.eyeDk };   // (RH: the big eyes travel further, so a look reads)
      if (RH) cxInkEye(0, 0, r * RHK.eye * u, i ? 1 : -1, ks[i], eo); else b2DotEye(0, 0, r * u, i ? 1 : -1, ks[i], eo);   // (RH: big pie-cut eyes)
      pop(); });
  };
  const cheeks = (ex, ey, rx, ry, col, key) => { const kc = RH ? 1.35 : 1; for (const s of [-1, 1]) piece(oval((fx + s * ex * (q && s > 0 ? qw : 1)) * u, (ey + (RH ? .06 : 0)) * u, rx * kc * (q && s > 0 ? qw : 1) * u, ry * kc * u, 0, 14), col, { ink: null, op: 150 + 90 * clamp(o.blush || 0), key: key + s, lift: 0, flatCard: true, edge: false }); };   // (RH: the blush bigger, so it reads)
  const mouthAt = (mx, my, W, def, mo = {}) => { push(); translate(mx * u, my * u); b2Mouth(W * u * (RH ? 1.2 : 1), o.mouth || def, { sw, key: 'cxm', qk: q ? .74 : 1, lw: (RH ? .12 : .09) * u, dark: '#3A1628', tongue: '#E4647F', t: tt, ...mo }); pop(); };

  // ---- the body, head and face, per kind ----
  const body = () => {
    rs('body');
    if (kind === 'codey') {
      torso(); chest();
      const hx = q ? -.12 : 0, cir = [[0, -3.4, 1.45], [0, -4.3, .72], [-.82, -4.16, .7], [.82, -4.16, .7], [-1.38, -3.58, .62], [1.38, -3.58, .62], [-1.42, -2.82, .58], [1.42, -2.82, .58], [-.88, -2.32, .56], [.88, -2.32, .56], [0, -2.28, .6]];
      const head = b2Blob(cir.map(([a, b, r]) => [(a + hx + (q && a < 0 ? -.05 : 0)) * u, b * u, r * u]), [hx * u, -3.4 * u], 110);
      piece(head, C.col, { sw: sw * 1.15, shade: C.dk, depth: .42 * u, key: 'cxhead', lift, ...SP });
      b2Glint(oval((-1.05 + hx) * u, -4.25 * u, .42 * u, .2 * u, -.5, 16), 'cxhgl', 110);
      const scx = fx * .95, hw = q ? .86 : 1.12;
      if (RH) {   // the screen: one solid black rounded shape (no bezel ring, no line), bold white glyph eyes
        piece(b2Squircle(scx * u, -3.33 * u, (q ? .94 : 1.22) * u, .88 * u, 5, 48), NOIR.ink, { ink: null, key: 'cxscr', lift: 1, flatCard: true, edge: false });
        screenFace(scx, -3.33, '#F7F2E8', null, 0);
      } else {
      piece(b2Squircle(scx * u, -3.35 * u, (hw + .1) * u, .9 * u, 5, 48), C.dk, { ink: null, key: 'cxbez', lift: 0, flatCard: true, edge: false, ...SP });
      piece(b2Squircle(scx * u, -3.35 * u, hw * u, .8 * u, 5, 48), C.screen, { sw: sw * .5, key: 'cxscr', lift: 1, flatCard: true });
      b2Glint(S([[scx - hw + .12, -3.95], [scx - hw + .5, -3.98], [scx - hw + .14, -3.58]]), 'cxscg', 50);
      screenFace(scx, -3.35, C.glyph, C.glyph, STYLE.card ? .32 : .5);
      }
    } else if (kind === 'dewey') {
      const tl = q ? .14 : 0, P = curvy(S([[tl, -4.55], [.4 + tl * .5, -4.0], [.98, -3.25], [1.45, -2.4], [1.56, -1.7], [1.34, -1.08], [.78, -.78], [0, -.72], [-.78, -.78], [-1.34, -1.08], [-1.56, -1.7], [-1.45, -2.4], [-.98, -3.25], [-.36 + tl * .5, -4.0]].map(([a, b]) => [a, b + .4])), 5);
      piece(P, C.col, { sw: sw * 1.15, shade: C.dk, depth: .5 * u, key: 'cxbody', lift });
      piece(oval(-.55 * u, -2.65 * u, .38 * u, .32 * u, -.3, 20), C.hl, { ink: null, key: 'cxhl', lift: 0, flatCard: true, edge: false });
      if (!RH) piece(oval(-.98 * u, -2.1 * u, .1 * u, .2 * u, -.3, 10), C.hl, { ink: null, op: 200, key: 'cxhl2', lift: 0, flatCard: true, edge: false });   // (RH: the one bold highlight)
      rs('face'); cheeks(.95, -1.44, .2, .12, C.cheek, 'cxck'); dotEyes(K.eye[0], K.eye[1], K.eye[2], C.col, 'cxe'); mouthAt(fx + (q ? .05 : 0), K.mouth[0], K.mouth[1], 'flat');
    } else if (kind === 'fireball') {
      torso(); chest();
      if (q) piece(rr(-1.44, -3.92, -1.1, -1.8, .2), C.dk, { sw: sw * .9, key: 'cxside', lift });
      piece(rr(-1.28, -4.02, 1.28, -1.72, .45), C.col, { sw: sw * 1.15, shade: C.dk, depth: .3 * u, key: 'cxhead', lift });
      b2Glint(oval(-.9 * u, -3.8 * u, .22 * u, .1 * u, -.4, 12), 'cxhgl', 120);
      const f0 = -1.0 + fx * .55, f1 = 1.0 * (q ? .86 : 1) + fx * .55;
      piece(b2RoundPoly(S([[f0, -3.76], [f1, -3.76], [f1, -1.98], [f0, -1.98]]), .3 * u), C.face, { sw: sw * .7, shade: C.faceDk, depth: .1 * u, key: 'cxface', lift: 1 });
      rs('face'); cheeks(.7, -2.56, .17, .1, C.cheek, 'cxck'); dotEyes(K.eye[0], K.eye[1], K.eye[2], C.face, 'cxe'); mouthAt(fx + (q ? .05 : 0), K.mouth[0], K.mouth[1], 'smile');
    } else if (kind === 'rocky') {
      const P = curvy(S([[-1.5, -.5], [-1.78, -1.3], [-1.74, -2.35], [-1.42, -3.15], [-.78, -3.58], [.1, -3.68], [.95, -3.52], [1.52, -3.05], [1.8, -2.2], [1.76, -1.25], [1.5, -.5], [.55, -.36], [-.55, -.38]]), 4);
      piece(P, C.col, { sw: sw * 1.15, shade: C.dk, depth: .5 * u, key: 'cxbody', lift });
      for (const [sx2, sy2, r] of [[-1.2, -1.2, .14], [-1.35, -2.7, .1], [1.25, -1.0, .12], [1.4, -2.9, .09], [-.3, -.8, .1], [.9, -3.2, .08]]) piece(oval(sx2 * u, sy2 * u, r * u, r * .75 * u, .4, 10), C.dk, { ink: null, key: 'cxsp' + sx2, lift: 0, flatCard: true, edge: false });
      b2Glint(oval(-1.0 * u, -3.1 * u, .3 * u, .12 * u, -.6, 12), 'cxhgl', 90);
      const f0 = .08 - .92 + fx, f1 = .08 + .92 * (q ? .84 : 1) + fx;
      piece(b2RoundPoly(S([[f0, -2.94], [f1, -2.94], [f1, -1.48], [f0, -1.48]]), .34 * u), C.face, { sw: sw * .7, shade: C.faceDk, depth: .1 * u, key: 'cxface', lift: 1 });
      rs('face'); cheeks(.7, -1.98, .16, .09, C.cheek, 'cxck');
      push(); translate(.08 * u, 0); dotEyes(K.eye[0], K.eye[1], K.eye[2], C.face, 'cxe'); pop();
      mouthAt(.08 + fx + (q ? .05 : 0), K.mouth[0], K.mouth[1], 'smile');
    } else if (kind === 'seedy') {
      torso(); chest();
      if (q) piece(rr(-1.4, -3.86, -1.08, -1.8, .2), C.dk, { sw: sw * .9, key: 'cxside', lift });
      piece(rr(-1.25, -3.95, 1.25, -1.72, .42), C.col, { sw: sw * 1.15, shade: C.dk, depth: .3 * u, key: 'cxhead', lift });
      const f0 = -1.0 + fx * .55, f1 = 1.0 * (q ? .86 : 1) + fx * .55;
      piece(b2RoundPoly(S([[f0, -3.72], [f1, -3.72], [f1, -1.95], [f0, -1.95]]), .32 * u), C.face, { sw: sw * .6, ink: C.dk, key: 'cxface', lift: 1 });
      rs('face'); cheeks(.7, -2.56, .17, .1, C.cheek, 'cxck'); dotEyes(K.eye[0], K.eye[1], K.eye[2], C.face, 'cxe'); mouthAt(fx + (q ? .05 : 0), K.mouth[0], K.mouth[1], 'smile');
    } else if (kind === 'stacky') {
      const CY = [-1.05, -2.08, -3.1], DX = [0, .05, -.03], SK = [mt(tt - .24), mt(tt - .12), tt];
      CY.forEach((cy, j) => {
        rs('block' + j);
        const dx = DX[j];
        for (const s of [-1, 1]) piece(rr(dx + s * (q && s > 0 ? .86 : 1.0) - (s < 0 ? .16 : 0), cy - .22, dx + s * (q && s > 0 ? .86 : 1.0) + (s > 0 ? .16 : 0), cy + .22, .08), C.dk, { sw: sw * .7, key: 'cxnub' + j + s, lift });
        if (q) piece(rr(-1.14 + dx, cy - .46, -.9 + dx, cy + .46, .15), C.dk, { sw: sw * .8, key: 'cxside' + j, lift });
        piece(rr(-1.0 + dx, cy - .5, (q ? .86 : 1.0) + dx, cy + .5, .3), C.col, { sw: sw * 1.1, shade: C.dk, depth: .2 * u, rim: C.lt, key: 'cxblk' + j, lift });
        const p0 = -.64 + dx + fx, p1 = .64 * qw + dx + fx;
        piece(b2RoundPoly(S([[p0, cy - .32], [p1, cy - .32], [p1, cy + .32], [p0, cy + .32]]), .16 * u), C.face, { ink: null, key: 'cxpan' + j, lift: 0, flatCard: true, edge: false });
        rs('face' + j);
        push(); translate(dx * u, (cy + 3.1) * u);
        const ks = j === 2 ? kinds : b2EyeKinds({ ...o, squint: 0 }, SK[j], seed + j * 1.9);
        cheeks(.46, -3.0, .1, .06, C.cheek, 'cxck' + j); dotEyes(K.eye[0], K.eye[1], K.eye[2], C.face, 'cxe' + j, ks, 1.2, .6);
        mouthAt(fx + (q ? .03 : 0), K.mouth[0], K.mouth[1], 'cat', { lw: .06 * u });
        pop();
      });
    } else if (kind === 'bsod') {
      torso(); chest();
      if (q) piece(rr(-1.5, -4.1, -1.14, -1.78, .2), C.dk, { sw: sw * .9, key: 'cxside', lift });
      piece(rr(-1.35, -4.2, 1.35, -1.7, .38), C.col, { sw: sw * 1.15, shade: C.dk, depth: .3 * u, key: 'cxhead', lift });
      b2Glint(oval(-.95 * u, -4.02 * u, .25 * u, .08 * u, -.2, 12), 'cxhgl', 140);
      const s0 = -1.06 + fx * .55, s1 = 1.06 * (q ? .86 : 1) + fx * .55, scx = (s0 + s1) / 2;
      piece(b2RoundPoly(S([[s0, -3.95], [s1, -3.95], [s1, -2.04], [s0, -2.04]]), .26 * u), C.screen, { sw: sw * .6, key: 'cxscr', lift: 1, flatCard: true });
      b2Glint(S([[s1 - .5, -3.86], [s1 - .12, -3.86], [s1 - .12, -3.5]]), 'cxscg', 70);
      // the warning triangle in its corner
      const tx = s0 + (RH ? .36 : .3), ty = RH ? -3.6 : -3.62, tk = RH ? 1.4 : 1;   // (RH: bigger and bolder, so it reads)
      b2Feat(strokeShape(S([[tx, ty - .15 * tk], [tx + .15 * tk, ty + .11 * tk], [tx - .15 * tk, ty + .11 * tk], [tx, ty - .15 * tk]]), () => (RH ? .075 : .045) * u, 3), '#FFFFFF', { ink: null, key: 'cxtri', lift: 0, flatCard: true, edge: false });
      cheeks(.7, -2.62, .16, .09, C.cheek, 'cxck');
      screenFace(scx, -3.0, RH ? NOIR.ink : C.glyph, C.screenLt, STYLE.card ? .18 : .3);   // (RH: bold black glyph eyes on the blue)
      mouthAt(fx + (q ? .05 : 0), K.mouth[0], K.mouth[1], 'flat', { ink: RH ? NOIR.ink : C.glyph, dark: RH ? NOIR.ink : C.glyph });
    } else if (kind === 'null') {
      torso(); chest();
      if (q) piece(rr(-1.45, -4.05, -1.1, -1.78, .2), C.dk, { sw: sw * .9, rim: C.lt, key: 'cxside', lift });
      piece(rr(-1.3, -4.15, 1.3, -1.7, .32), C.col, { sw: sw * 1.15, shade: C.dk, depth: .3 * u, rim: C.lt, key: 'cxhead', lift });
      const s0 = -1.02 + fx * .55, s1 = 1.02 * (q ? .86 : 1) + fx * .55, scx = (s0 + s1) / 2;
      piece(b2RoundPoly(S([[s0, -3.88], [s1, -3.88], [s1, -2.02], [s0, -2.02]]), .2 * u), C.screen, { sw: sw * .5, key: 'cxscr', lift: 1, flatCard: true });
      if (!RH) for (let i = 0; i < 4; i++) { const yy = -3.62 + i * .42; piece(S([[s0 + .1, yy], [s1 - .1, yy], [s1 - .1, yy + .05], [s0 + .1, yy + .05]]), C.scan, { ink: null, key: 'cxscan' + i, lift: 0, flatCard: true, edge: false }); }   // (RH: no scan lines)
      screenFace(scx, -2.95, C.glyph, C.glyph, STYLE.card ? .2 : .35);
    } else if (kind === 'hoot') {
      const P = curvy(S([[0, -4.08], [.78, -3.98], [1.3, -3.6], [1.5, -2.75], [1.45, -1.65], [1.12, -.85], [.55, -.5], [0, -.46], [-.55, -.5], [-1.12, -.85], [-1.45, -1.65], [-1.5, -2.75], [-1.3, -3.6], [-.78, -3.98]].map(([a, b]) => [a * (q && a > 0 ? .95 : 1), b])), 5);
      piece(P, C.col, { sw: sw * 1.15, shade: C.dk, depth: .45 * u, key: 'cxbody', lift });
      piece(oval(fx * .5 * u, -1.52 * u, .98 * u, .86 * u, 0, 28), C.belly, { ink: null, key: 'cxbelly', lift: 0, flatCard: true, edge: false });
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3 - (r % 2); c++) { const vx = fx * .5 + (c - (2 - (r % 2)) / 2) * .42, vy = -2.02 + r * .34; dline(S([[vx - .12, vy - .06], [vx, vy + .06], [vx + .12, vy - .06]]), sw * .55, C.dk, .3); }
      const ex = K.eye[0], ey = K.eye[1];
      piece(b2Blob([[(fx - ex) * u, ey * u, .64 * u], [(fx + ex * qw) * u, ey * u, .64 * qw * u], [fx * u, (ey + .3) * u, .5 * u]], [fx * u, ey * u], 60), C.face, { sw: sw * .5, key: 'cxfdisc', lift: 1 });
      rs('face');
      [[fx - ex, 1], [fx + ex * qw, qw]].forEach(([exx, kw], i) => b2PieEye(exx * u, ey * u, K.eye[2] * kw * u, .74 * u, i ? 1 : -1, kinds[i], { sw, look, skin: C.face, key: 'cxe' + i, t: tt, white: C.eye, dark: C.pupil }));
      for (const [exx, kw, k2] of [[fx - ex, 1, 'L'], [fx + ex * qw, qw, 'R']]) piece(b2Ring(exx * u, ey * u, .47 * kw * u, .47 * u, .1 * u), C.glass, { sw: sw * .45, key: 'cxgls' + k2, lift: 1, flatCard: true });
      piece(b2Bar(S([[fx - ex + .45, ey - .08]])[0], S([[fx + ex * qw - .45 * qw, ey - .08]])[0], .08 * u), C.glass, { sw: sw * .4, key: 'cxglb', lift: 1, flatCard: true });
      const open = CX_OPEN.includes(o.mouth), bx = fx + (q ? .05 : 0);
      if (open) piece(curvy(S([[bx - .15, -2.5], [bx + .15, -2.5], [bx, -2.28]]), 3), C.beakDk, { sw: sw * .5, key: 'cxbeakl', lift: 1, flatCard: true });
      piece(curvy(S([[bx - .17, -2.7], [bx + .17, -2.7], [bx, open ? -2.52 : -2.36]]), 3), C.beak, { sw: sw * .5, shade: C.beakDk, depth: .04 * u, key: 'cxbeak', lift: 1, flatCard: true });
    }
    out.head = b2To(M0, [fx * u, K.eye[1] * u]); out.top = b2To(M0, [fx * u, K.top * u]);
  };

  // ---- the school cap, the satchel ----
  const cap = () => {
    if (!o.cap) return;
    rs('cap');
    const [cx0, cy0, cw] = K.cap, capC = typeof o.cap === 'string' ? o.cap : B2CX.cap, capDk = typeof o.cap === 'string' ? mixCol(o.cap, NOIR.ink, .35) : B2CX.capDk;
    push(); translate((cx0 + fx * .6) * u, cy0 * u); rotate(q ? .08 : -.12);
    if (q) piece(b2Taper(S([[cw * .1, -.02], [cw * 1.0, .04], [cw * 1.55, .14]]), .3 * u, 6), capDk, { sw: sw * .7, key: 'cxbrim', lift: 2 });
    const dome = []; for (let i = 0; i <= 18; i++) { const a = Math.PI + i / 18 * Math.PI; dome.push([Math.cos(a) * cw, Math.sin(a) * cw * .66]); }
    piece(S(dome), capC, { sw: sw * .8, shade: capDk, depth: .15 * u, key: 'cxcap', lift: 2 });
    for (const k of [-.5, 0, .5]) dline(S([[k * cw * .3 + (q ? .15 : 0), -cw * .64], [k * cw * 1.05 + (q ? .2 : 0), -.02]]), sw * .5, B2CX.gold, .4);
    piece(oval((q ? .15 : 0) * u, -cw * .66 * u, .11 * u, .07 * u, 0, 10), B2CX.gold, { sw: sw * .5, key: 'cxcapb', lift: 1, flatCard: true });
    if (!q) piece(curvy(S([[-cw * .95, -.02], [cw * .95, -.02], [cw * .7, cw * .2], [0, cw * .26], [-cw * .7, cw * .2]]), 3), capDk, { sw: sw * .7, key: 'cxbrim', lift: 2 });
    const bx3 = q ? cw * .55 : 0; piece(S([[bx3 - .13, -cw * .4], [bx3 + .13, -cw * .4], [bx3 + .12, -cw * .2], [bx3, -cw * .1], [bx3 - .12, -cw * .2]]), B2CX.gold, { sw: sw * .45, key: 'cxbadge', lift: 1, flatCard: true });   // the badge (a shield)
    pop();
  };
  const satchel = () => {
    if (!o.satchel) return;
    rs('satchel');
    const [a, b] = K.sat, A0 = [a[0] + (q ? .15 : 0), a[1]], B1 = [b[0] * (q ? .8 : 1) + (q ? .2 : 0), b[1]];
    piece(b2Bar(S([A0])[0], S([[B1[0], B1[1] - .3]])[0], .15 * u), B2CX.strap, { sw: sw * .45, key: 'cxstrap', lift: 1, flatCard: true });
    piece(b2RoundPoly(S([[B1[0] - .5, B1[1] - .36], [B1[0] + .5, B1[1] - .36], [B1[0] + .5, B1[1] + .36], [B1[0] - .5, B1[1] + .36]]), .12 * u), B2CX.satchel, { sw: sw * .7, shade: B2CX.satchelDk, depth: .1 * u, key: 'cxbag', lift: 2 });
    piece(b2RoundPoly(S([[B1[0] - .5, B1[1] - .36], [B1[0] + .5, B1[1] - .36], [B1[0] + .46, B1[1] + .05], [B1[0] - .46, B1[1] + .05]]), [.12 * u, .12 * u, .15 * u, .15 * u]), B2CX.satchelDk, { sw: sw * .55, key: 'cxflap', lift: 1, flatCard: true });
    piece(curvy(S([[B1[0] - .08, B1[1] - .04], [B1[0] + .08, B1[1] - .04], [B1[0] + .08, B1[1] + .14], [B1[0] - .08, B1[1] + .14]]), 1), B2CX.gold, { sw: sw * .4, key: 'cxbuck', lift: 1, flatCard: true });
  };

  // ---- draw: back arms and toppers, legs, body and head, satchel and cap, front arms ----
  inUB(() => { arm(-1, false); arm(1, false); behind(); });
  legs();
  inUB(() => {
    body(); satchel(); cap();
    if (o.gloom > .02) { piece(clipConvex(S([[-3, K.top0 - .2], [3, K.top0 - .2], [3, K.top0 + .8], [-3, K.top0 + .8]]), oval(0, (K.top0 + 1.3) * u, 1.6 * u, 1.3 * u, 0, 30)), NOIR.ink, { ink: null, op: 90 * o.gloom, key: 'cxgloom', lift: 0, flatCard: true, edge: false }); }
    arm(-1, true); arm(1, true);
    // speed lines behind a run
    if (run && q) for (let i = 0; i < 3; i++) { const yy = -3.2 + i * .75, x0 = -hb.rx - .1 - .3 * i - .2 * frac(B.bp * 2 + i / 3); piece(b2Taper(S([[x0, yy], [x0 - .7, yy + .02], [x0 - 1.3, yy]]), .09 * u, 3), NOIR.ink, { ink: null, key: 'cxspd' + i, lift: 0, flatCard: true, edge: false }); }
  });
  XF = prevXF;
  pop();
  rs('emote'); if (o.emote) emote(o.emote, x + (flip ? -1 : 1) * 1.7 * u, y + dy - (-K.top + 1.2 + float) * u * (1 - sq), u * .42, o.emoteK ?? 1, o.emoteAge ?? T);
  rs('after');
  return out;
}
// A kind's colours, tinted by the mood (angry flushes, sad goes blue), with its body, limbs and feet filled in.
function cxPalette(kind, o) {
  const P = B2CX[kind], T0 = b2Tint(P, o, ['col', 'dk', 'lt', 'body', 'bodyDk']);
  const body = T0.body || T0.col, bodyDk = T0.bodyDk || T0.dk;
  return { eyeDk: NOIR.ink, rim: null, ...T0, body, bodyDk, limb: T0.limb || body, limbDk: T0.limbDk || bodyDk, leg: T0.leg || T0.limb || body, legDk: T0.legDk || T0.limbDk || bodyDk, foot: T0.foot || T0.leg || T0.limb || body };
}

// ======================================================================================================================
// Clawd, on the style layer
// ======================================================================================================================
// The kit's key views (src/clawd.js VIEWS), front and 3/4: silhouette edges, the darker side strip, the face's centre and
// squeeze, legs [x, far], arms [pivot x, dir, which, layer (0 behind, 1 in front, 2 behind in shadow)].
const B2CLV = {
  front: { L: -5, R: 5, face: { cx: 0, fw: 1, bx: 3.6 }, legs: [[-4, 0], [-2, 0], [1, 0], [3, 0]], arms: [[-4.9, -1, 'L', 0], [4.9, 1, 'R', 0]] },
  q:     { L: -5, R: 5.1, strip: [-5, -2.3], face: { cx: 1.5, fw: .74, bx: 3.6 }, legs: [[-4.3, 1], [-1.8, 0], [.8, 0], [3.3, 0]], arms: [[5, 1, 'R', 2], [-4.7, -1, 'L', 1]] },
};
// Arm raises for its poses ('wave' waves the right arm on the beat); feel()'s aL / aR drive 'idle'.
const CLPOSE = { wave: { aL: -.15, aR: 'wave' }, cheer: { aL: 1.35, aR: 1.35 }, hug: { aL: .75, aR: .75 }, shrug: { aL: .45, aR: .45 }, down: { aL: -.9, aR: -.9 } };
// One of Clawd's eyes around its centre (face space, u): the kit's eye shapes as pieces. s = -1 left, 1 right.
function b2ClawdEye(e, s, u, o, sw, tt, key) {
  const lx = (o.lookX || 0) * u * .5, ly = (o.lookY || 0) * u * .4, ink = NOIR.ink, cream = PAL.cream, S = P => U(P, u);
  const blob = (P, col, k2 = 'p', ink2 = null) => b2Feat(P, col, { ink: ink2, sw: sw * .6, key: key + k2, lift: 1, flatCard: true, edge: false });
  const slit = (w, h) => { blob(b2RoundPoly(U([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], u, lx / u, ly / u), w * .22 * u), ink);
    if (u > 6) blob(oval(lx - w * .18 * u, ly - h * .29 * u, u * .17 * w, u * .24 * w, 0, 12), cream, 'g'); };
  const lineEye = (P, w = 1) => blob(ribbon(S(P), .24 * w * u, .2 * w * u), ink, 'l');
  const blinkOn = ['normal', 'look', 'wide'].includes(e) && ((tt * .9 + (o.seed || 0) * 1.7) % 3.3) < .12;
  if (blinkOn) { lineEye([[-.7, .5], [0, .55], [.7, .5]]); return; }
  switch (e) {
    case 'normal': case 'look': slit(1, 2); break;
    case 'wide': slit(1.25, 2.7); break;
    case 'happy': lineEye([[-.9, .7], [-.45, 0], [0, -.45], [.45, 0], [.9, .7]]); break;
    case 'closed': lineEye([[-.9, .2], [0, .6], [.9, .2]], .9); break;
    case 'sleepy': blob(b2RoundPoly(U([[-.5, .05], [.5, .05], [.5, 1], [-.5, 1]], u, lx / u, 0), .1 * u), ink); lineEye([[-.8, .05], [0, -.1], [.8, .1]], .8); break;
    case 'narrow': case 'bored': blob(b2RoundPoly(U([[-.6, -.1], [.6, -.1], [.6, .6], [-.6, .6]], u, lx / u, ly / u), .1 * u), ink); break;
    case 'angry': case 'determined': case 'red': {
      const hi = e === 'determined' ? .5 : .75, top = e === 'determined' ? -.55 : -.7;
      if (e === 'red') { b2Feat(oval(lx, ly, 1.3 * u, 1.3 * u, 0, 24), '#E0283F', { ink: null, op: 110, key: key + 'rg', lift: 0, flatCard: true, edge: false }); }
      blob(b2RoundPoly(U([[-.65, s < 0 ? top : top + hi], [.65, s < 0 ? top + hi : top], [.65, 1], [-.65, 1]], u, lx / u, ly / u), .1 * u), e === 'red' ? '#FF2F4A' : ink, 'p', e === 'red' ? ink : null);
      if (e === 'determined') blob(oval(lx - .2 * u, ly + .25 * u, u * .16, u * .2, 0, 10), cream, 'g');
      break;
    }
    case 'sad': case 'teary': {
      blob(b2RoundPoly(U([[-.6, s < 0 ? -.2 : -.85], [.6, s < 0 ? -.85 : -.2], [.6, .9], [-.6, .9]], u, lx / u, ly / u), .12 * u), ink);
      blob(oval(lx - .18 * u, ly + .05 * u, u * .16, u * .22, 0, 10), cream, 'g');
      if (e === 'teary') { const w = Math.sin(tt * 9 + s) * .06 * u; b2Feat(oval(0, .95 * u + w, .95 * u, .38 * u, 0, 20), PAL.sky, { sw: sw * .4, key: key + 'tp', lift: 1, flatCard: true }); b2Glint(oval(-.35 * u, .85 * u + w, .18 * u, .1 * u, 0, 10), key + 'tpg', 220); }
      break;
    }
    case 'cry': {
      lineEye([[-.9, .45], [-.3, -.05], [.3, .15], [.9, -.2]].map(([a, b]) => [a * -s, b]));
      const R = []; for (let k = 0; k <= 5; k++) R.push([s * .55 + Math.sin(tt * 8 + k * 1.3 + s) * .12 * k / 5, .4 + k * .72]);
      b2Feat(ribbon(S(R), .45 * u, .8 * u), PAL.sky, { sw: sw * .45, key: key + 'str', lift: 1, flatCard: true });
      break;
    }
    case 'squeeze': case 'x': if (e === 'x') { lineEye([[-.8, -.8], [.8, .8]], .8); lineEye([[.8, -.8], [-.8, .8]], .8); } else lineEye([[-.55 * -s, -.7], [.55 * -s, 0], [-.55 * -s, .7]]); break;
    case 'shine': blob(oval(lx * .6, ly * .6, u * .78, u * 1.12, 0, 22), ink); blob(oval(lx * .6 - .25 * u, ly * .6 - .45 * u, u * .3, u * .38, 0, 12), cream, 'g'); blob(oval(lx * .6 + .25 * u, ly * .6 + .45 * u, u * .14, u * .14, 0, 10), cream, 'g2'); break;
    case 'scared': blob(oval(0, 0, u * .95, u * 1.15, 0, 22), cream, 'w', ink); blob(oval((o.lookX || 0) * u * .3 + Math.sin(tt * 40) * .04 * u, .1 * u, u * .3, u * .4, 0, 12), ink); break;
    case 'blank': blob(oval(0, 0, u * .8, u * 1.05, 0, 22), cream, 'w', ink); break;
    case 'dot': blob(oval(lx * .5, ly * .5, u * .45, u * .55, 0, 14), ink); break;
    case 'spark': b2Feat(starPts(0, 0, u * 1.35 * (1 + .12 * Math.sin(tt * 14))), cream, { sw: sw * .55, key: key + 'st', lift: 1, flatCard: true }); break;
    case 'heart': b2Feat(heartPts(0, .1 * u, u * 1.0 * (1 + .1 * pulse(tt))), '#E2476E', { solid: true, sw: sw * .5, key: key + 'h', lift: 1, flatCard: true }); b2Glint(oval(-.35 * u, -.2 * u, .18 * u, .12 * u, -.5, 10), key + 'hg', 200); break;
    case 'swirl': { const sp = []; for (let k = 0; k < 16; k++) { const a = k * .7 + tt * 6 * s, r = k * .06; sp.push([Math.cos(a) * r, Math.sin(a) * r]); } lineEye(sp, .6); break; }
    default: slit(1, 2);
  }
}
// Clawd's mouth (the kit's mouth(): o O smile frown grin flat wobble cat smirk laugh open wail teeth tongue pout yawn),
// face space, u. No mouth when m is empty, as the kit.
function b2ClawdMouth(u, m, sw, tt, key) {
  if (!m) return;
  const S = P => U(P, u), dark = '#3A1422', ink = NOIR.ink;
  const line = (P, w = 1) => b2Feat(b2Taper(S(P), .26 * w * u), ink, { ink: null, key: key + 'l', lift: 1, flatCard: true, edge: false });
  const hole = (P, k2 = 'd') => b2Feat(P, dark, { sw: sw * .6, key: key + k2, lift: 1, flatCard: true });
  const tng = (cx, cy, rx, ry) => b2Feat(oval(cx * u, cy * u, rx * u, ry * u, 0, 16), PAL.rose, { ink: null, key: key + 't', lift: 0, flatCard: true, edge: false });
  switch (m) {
    case 'o': b2Feat(oval(0, -4.3 * u, .45 * u, .5 * u, 0, 16), ink, { ink: null, key: key + 'o', lift: 1, flatCard: true, edge: false }); break;
    case 'O': hole(oval(0, -4.1 * u, .8 * u, .95 * u, 0, 22)); tng(0, -3.55, .45, .18); break;
    case 'smile': line([[-.8, -4.6], [0, -4.1], [.8, -4.6]]); break;
    case 'frown': line([[-.8, -4.1], [0, -4.6], [.8, -4.1]]); break;
    case 'grin': hole(curvy(S([[-1.3, -4.8], [0, -4.82], [1.3, -4.8], [.9, -3.9], [0, -3.8], [-.9, -3.9]]), 4)); b2Feat(curvy(S([[-1.1, -4.72], [1.1, -4.72], [1.0, -4.42], [-1.0, -4.42]]), 2), PAL.cream, { ink: null, key: key + 'gt', lift: 0, flatCard: true, edge: false }); break;
    case 'flat': line([[-.7, -4.4], [0, -4.4], [.7, -4.4]], .9); break;
    case 'wobble': line([[-1, -4.4], [-.5, -4.7], [0, -4.4], [.5, -4.7], [1, -4.4]], .8); break;
    case 'cat': line([[-.9, -4.5], [-.45, -4.1], [0, -4.5], [.45, -4.1], [.9, -4.5]], .8); break;
    case 'smirk': line([[-.8, -4.35], [.2, -4.3], [.9, -4.75]]); break;
    case 'laugh': hole(curvy(S([[-1.4, -4.9], [0, -4.92], [1.4, -4.9], [1, -4], [0, -3.4], [-1, -4]]), 4)); tng(0, -3.85, .7, .32); break;
    case 'open': hole(oval(0, -4.25 * u, .75 * u, .6 * u, 0, 22)); tng(0, -3.95, .45, .2); break;
    case 'wail': { const w = Math.sin(tt * 30) * .06; hole(curvy(S([[-1.5, -4.5 + w], [-.5, -4.9], [.5, -4.9 - w], [1.5, -4.5], [1.2, -3.3], [-1.2, -3.3]]), 4)); tng(0, -3.6, .8, .25); break; }
    case 'teeth': b2Feat(b2RoundPoly(S([[-1.3, -4.85], [1.3, -4.85], [1.3, -3.9], [-1.3, -3.9]]), .12 * u), PAL.cream, { sw: sw * .6, key: key + 'tt', lift: 1, flatCard: true }); dline(S([[-1.25, -4.38], [1.25, -4.38]]), sw * .4, ink, 0); for (const tx of [-.65, 0, .65]) dline(S([[tx, -4.8], [tx, -3.95]]), sw * .35, ink, 0); break;
    case 'tongue': b2Feat(curvy(S([[.05, -4.3], [.75, -4.3], [.72, -3.75], [.4, -3.55], [.08, -3.75]]), 3), PAL.rose, { sw: sw * .5, key: key + 'tg', lift: 1, flatCard: true }); line([[-.8, -4.6], [0, -4.2], [.8, -4.5]]); break;
    case 'pout': line([[-.45, -4.2], [0, -4.5], [.45, -4.2]], .9); line([[-.25, -4.0], [0, -3.9], [.25, -4.0]], .6); break;
    case 'yawn': hole(oval(0, -4.1 * u, .6 * u, 1.05 * u, 0, 22)); tng(0, -3.45, .38, .25); break;
  }
}
function clawd2(x, y, u, o = {}) {
  const id = o.boilKey ?? ++CLAWD_N, rs = p => boilSeed(`cl2 ${id} ${p}`), S = P => U(P, u);
  const M0 = b2Mat(), tt = b2T(o), q = o.view === 'q', flip = !!o.flip, V = q ? B2CLV.q : B2CLV.front;
  const poseName = typeof o.pose === 'string' ? o.pose : 'idle', P0 = CLPOSE[poseName] || {};
  // musicality (clawd.js botGroove): accents on bar downbeats by default, the full beat bounce when a shot passes bounce;
  // the emotion's own beat-locked bob (o.groove) only with the full bounce. Idle loops run on B.clk, dance moves on B.bp.
  const B = botGroove(tt, o, 1, 'cl2' + id + (o.seed || 0)), G = grooveAdd(o, B.full ? 1 : 0, B.full ? 1 : .6);
  const sq = cardSq((o.sq || 0) + G.sq + (o.take || 0)), dy = ((o.dy || 0) + G.dy) * u, sw = clamp(u / 17, .55, 2.4), lift = u * .12;
  const { col, dk, lt } = tintCols(o), far = mixCol(dk, PAL.ink, .22);
  const out = { head: null, top: null, hands: { L: null, R: null } };
  x += ((o.dx || 0) + G.dx) * u;
  rs('shadow'); if (!o.noShadow) { const f = 1 - Math.min(.5, Math.abs(o.dy || 0) * .06); paint(oval(x, y + .15 * u, 5.4 * f * u, .75 * f * u, 0, 26), { wash: NOIR.ink, washOp: STYLE.card ? 100 : 140, ink: null }); }
  push(); translate(x, y + dy); nudge('cl2' + id, 1); if (o.rot || G.rot) rotate((o.rot || 0) + G.rot); scale((flip ? -1 : 1) * (o.sx ?? 1) * (1 + sq * .6), (o.sy ?? 1) * (1 - sq));
  const prevXF = XF; XF = flip ? -XF : XF;
  const lift0 = B.up * .32, bsq = cardSq(B.sq * .8);   // the body rises and squashes with the groove (every beat only when dancing); the feet stay put
  const inBody = fn => { push(); translate(0, (-2 - lift0) * u); scale(1 + bsq * .5, 1 - bsq); translate(0, 2 * u); fn(); pop(); };
  const armA = which => {
    const p = which === 'L' ? P0.aL : P0.aR, base = which === 'L' ? (o.aL ?? .2) + G.aL : (o.aR ?? .2) + G.aR;
    if (p === 'wave') return 1.25 + .42 * Math.sin(B.clk * TAU);
    return p ?? base;
  };
  const arm = ([px, dir, which, layer]) => {
    rs('arm' + which);
    const a = armA(which), hook = which === 'L' ? o.holdL : o.hold, c = layer === 2 ? mixCol(col, dk, .4) : col;
    push(); translate((px + dir * .55 * clamp((Math.abs(a) - .7) / .9)) * u, -4.5 * u);
    rotate(dir < 0 ? a : -a);
    const x0 = dir < 0 ? -2.2 : 0;
    piece(b2RoundPoly(S([[x0, -.5], [x0 + 2.2, -.5], [x0 + 2.2, .5], [x0, .5]]), .36 * u), c, { sw: sw * .85, shade: dk, depth: .22 * u, key: 'cl2arm' + which, lift });
    if (STYLE.card) brad(dir * .35 * u, 0, Math.max(2.5, .14 * u));
    translate(dir * 2.2 * u, 0);
    out.hands[which] = b2To(M0, [0, 0]);
    if (hook) { if (dir < 0) scale(-1, 1); hook(u); }
    pop();
  };
  // arms behind, legs, the body, arms in front
  inBody(() => V.arms.filter(a => a[3] !== 1).forEach(arm));
  V.legs.forEach(([lx, isFar], i) => {
    rs('leg' + i);
    let h = 2 + lift0 + .3, top = -2 - lift0 - .3, wl = 0;
    if (o.walk != null) { const ph = Math.sin((o.walk + (i % 2 ? .5 : 0)) * TAU); if (ph > 0) wl = ph * .9; }
    // (card: a leg is one rigid strip of card: the body rides up over its top and a step slides it up under the body,
    // instead of the strip stretching and shrinking)
    if (STYLE.card) { top = Math.min(-2.9, -2.3 - lift0) - wl; h = -top - wl; } else h -= wl;
    const bot = top + h;
    piece(b2RoundPoly(S([[lx, top], [lx + 1, top], [lx + 1, bot], [lx, bot]]), [0, 0, .22 * u, .22 * u]), isFar ? far : dk, { sw: sw * .85, key: 'cl2leg' + i, lift });
  });
  inBody(() => {
    rs('body');
    const L = V.L, R = V.R, body = b2RoundPoly(S([[L, -8], [R, -8], [R, -2], [L, -2]]), .55 * u, 6);
    piece(body, col, { sw: sw * 1.15, shade: dk, depth: .5 * u, key: 'cl2body', lift });
    // the lit top and the darker belly band (inside the outline)
    const px = V.strip ? (-2.3 + R) / 2 - 1.2 : -1.6;
    piece(oval(px * u, -6.5 * u, 3.1 * (V.strip ? .75 : 1) * u, 1.15 * u, -.06, 28), mixCol(col, lt, .38), { ink: null, key: 'cl2hl', lift: 0, flatCard: true, edge: false });
    const inset = sw * 1.2 / u;
    piece(b2RoundPoly(S([[L + inset, -3.75], [R - inset, -3.75], [R - inset, -2 - inset], [L + inset, -2 - inset]]), [0, 0, .45 * u, .45 * u], 6), mixCol(col, dk, .38), { ink: null, key: 'cl2band', lift: 0, flatCard: true, edge: false });
    if (V.strip) {
      piece(b2RoundPoly(S([[V.strip[0], -8], [V.strip[1], -8], [V.strip[1], -2], [V.strip[0], -2]]), [.55 * u, 0, 0, .55 * u], 6), mixCol(col, dk, .5), { sw: sw * .8, key: 'cl2strip', lift: 1 });
      piece(b2RoundPoly(S([[V.strip[0] + inset, -3.75], [V.strip[1] - inset * .5, -3.75], [V.strip[1] - inset * .5, -2 - inset], [V.strip[0] + inset, -2 - inset]]), [0, 0, 0, .45 * u], 6), mixCol(col, dk, .7), { ink: null, key: 'cl2sband', lift: 0, flatCard: true, edge: false });
    }
    out.head = b2To(M0, [(V.face.cx) * u, -6 * u]); out.top = b2To(M0, [0, -8 * u]);
    if (o.gloom > .02) {
      piece(clipConvex(S([[L, -8.2], [R, -8.2], [R, -5.4], [L, -5.4]]), body), PAL.indigo, { ink: null, op: 150 * o.gloom, key: 'cl2gloom', lift: 0, flatCard: true, edge: false });
      const n = 7; for (let i = 0; i < n; i++) { const gx = lerp(L + .7, R - .7, i / (n - 1)); dline(S([[gx, -7.8], [gx, -7.8 + 2.4 * o.gloom * (.7 + .3 * hash(i))]]), sw * .45, PAL.ink); }
    }
    // the face, squeezed round the 3/4 turn
    const F = V.face;
    push(); translate(F.cx * u, 0); scale(F.fw, 1);
    rs('face');
    if (o.blush) { const b = o.blush === true ? 1 : o.blush; for (const s of [-1, 1]) { piece(oval(s * F.bx * u, -4.6 * u, .85 * u, .42 * u, 0, 18), PAL.rose, { ink: null, op: 170 * clamp(b), key: 'cl2bl' + s, lift: 0, flatCard: true, edge: false });
      if (b > .6) for (let k = 0; k < 3; k++) dline([[s * F.bx * u - .5 * u + k * .4 * u, -4.35 * u], [s * F.bx * u - .3 * u + k * .4 * u, -4.85 * u]], sw * .4, mixCol(PAL.rose, PAL.ink, .3), 0); } }
    const kinds = Array.isArray(o.eyes) ? o.eyes : o.eyes === 'wink' ? ['happy', 'normal'] : [o.eyes || 'normal', o.eyes || 'normal'], sqz = clamp(o.squint || 0);
    if (kinds[0] === 'shades') {
      const lens = cx => S([[cx - 1.4, -7.1], [cx + 1.4, -7.1], [cx + 1.3, -6.2], [cx + .8, -5.35], [cx, -5.2], [cx - .8, -5.35], [cx - 1.3, -6.2]]);
      piece(ribbon(S([[-1.15, -6.75], [0, -7.0], [1.15, -6.75]]), .22 * u), '#2A2740', { ink: null, key: 'cl2sbr', lift: 1, flatCard: true });
      for (const s of [-1, 1]) { piece(curvy(lens(s * 2.5), 3), '#2A2740', { sw: sw * .8, key: 'cl2sh' + s, lift: 1, flatCard: true }); b2Glint(b2Taper(S([[s * 2.5 - .85, -6.35], [s * 2.5 - .25, -6.85]]), .16 * u, 3), 'cl2shg' + s, 200); }
    } else if (sqz > .8) for (const s of [-1, 1]) b2Feat(ribbon(S([[s * 2.5 - .8, -5.9], [s * 2.5, -5.85], [s * 2.5 + .8, -5.9]]), .22 * u), NOIR.ink, { ink: null, key: 'cl2sq' + s, lift: 1, flatCard: true });
    else {
      if (sqz > 0) { push(); translate(0, -6 * u); scale(1 + sqz * .15, 1 - sqz); translate(0, 6 * u); }
      for (const s of [-1, 1]) { push(); translate(s * 2.5 * u, -6 * u); b2ClawdEye(kinds[s < 0 ? 0 : 1], s, u, o, sw, tt, 'cl2e' + s); pop(); }
      if (sqz > 0) pop();
    }
    b2ClawdMouth(u, o.mouth, sw, tt, 'cl2m');
    pop();
  });
  inBody(() => V.arms.filter(a => a[3] === 1).forEach(arm));
  XF = prevXF;
  pop();
  rs('emote');
  if (o.emote) { const top = EMOTE_TOP.includes(o.emote), dir = flip ? -1 : 1; emote(o.emote, top ? x + dir * (q ? .6 : 0) * u : x + dir * (V.R + .4) * u, y + dy - (top ? 10.4 : 8.6) * u * (1 - sq), u * .9, o.emoteK ?? 1, o.emoteAge ?? T); }
  rs('after');
  return out;
}

// ---------- model sheets (labels are fine here: reference only) ----------
//   node render.mjs --page=demo/dev-bots2.html --loop=bots2 --sheet=0.3 --cols=1 --w=1920 --out=out/demo/bots2/sheet.jpg
//   loops: bots2 (all four families), bots2Looks (a row per look), bots2Faces (expressions), and close-ups for checking:
//   bots2Cop, bots2Gem, bots2Cx, bots2Cl
// A band of a look's ground, rows y0..y1 with the floor at G (for the per-look sheet).
function b2Band(m, y0, y1, G) {
  const R = (a, b, c, d) => U([[a, b], [c, b], [c, d], [a, d]], 1);
  boilSeed('band' + m + y0);
  if (m === 'ink') { _paint(R(-60, y0, W + 60, y1), { wash: NOIR.pastSky, ink: null }); _paint(R(-60, G, W + 60, y1), { wash: NOIR.pastMint, ink: null }); inkLine([[0, G + 1], [W, G - 1]], 1, NOIR.pastInk, 'flash', 0); }   // (the past's own ground: the 1930s pastels, where the rubber-hose cast lives)
  else if (m === 'card') { _paint(R(-60, y0, W + 60, y1), { wash: '#8E8A84', ink: null }); piece(R(0, y0 + 4, W, G), '#B9B2A6', { key: 'bd' + y0, lift: 0 }); }
  else if (m === 'doodle') { _paint(R(-60, y0, W + 60, y1), { wash: '#FBF8F0', ink: null }); for (let yy = y0 + 30; yy < y1; yy += 36) for (let x = -20; x < W + 20; x += 400) _inkLine([[x, yy], [x + 410, yy + .3]], .6, '#9DB7DC', 'rotring', 0); _inkLine([[170, y0], [170.5, y1]], .9, '#E08A8A', 'rotring', 0); }
  else if (m === 'bank') bankPaper(-60, y0, W + 120, y1 - y0);
  else if (m === 'xerox') { _paint(R(-60, y0, W + 60, y1), { wash: XEROX.paper, ink: null }); inkLine([[0, G + 1], [W, G - 1]], 1, XEROX.toner, 'ink', 0); }
  else { _paint(R(-60, y0, W + 60, y1), { wash: E_PAPER, ink: null }); }
}
// ?look=ink (render.mjs --query=look=ink) draws any of these sheets in another look, to check a look up close.
const b2Look = () => { const m = new URLSearchParams(location.search).get('look'); if (m) look(m); };
(() => {
  const { label, stage, spot } = SHEET;
  LOOPS.bots2 = t => {
    b2Look(); stage(t); const tt = mt(t), u = 20, L = (txt, x, G) => label(txt, x, G + 17, 14);
    // row 1: Copilot, with the commuter for scale
    let G = 272;
    commuter(62, G, u, { ...feel('neutral', tt, { seed: 9 }), pose: 'idle', boilKey: 'cm' }); L('commuter', 62, G);
    const cop = [[195, 'idle', 'front', false, 'happy', {}], [365, 'typing', 'q', false, 'neutral', {}], [545, 'present', 'q', true, 'happy', {}], [715, 'wave', 'front', false, 'excited', {}],
      [900, 'sit', 'front', false, 'smug', {}], [1095, 'typing', 'q', false, 'determined', { seated: true }], [1280, 'mimic', 'front', false, 'playful', {}], [1450, 'mimic', 'q', false, 'neutral', { disguise: true }],
      [1625, 'idle', 'front', false, 'neutral', { cheap: .5 }], [1810, 'idle', 'q', true, 'neutral', { cheap: 1 }]];
    cop.forEach(([x, p, v, fl, e, ex], i) => { spot(x, G - 120, 220); copilot(x, G, u, { ...feel(e, tt, { seed: i }), pose: p, view: v, flip: fl, boilKey: 'cp' + i, ...ex }); L(ex.disguise ? `${v} · disguise` : ex.cheap ? `${fl ? 'q flip' : v} · cheap ${ex.cheap}` : `${v}${fl ? ' flip' : ''} · ${ex.seated ? 'seated ' : ''}${p}`, x, G); });
    // row 2: the Gemini twins
    G = 540;
    const gem = [[170, 'idle', 'front', false, 'happy', {}], [560, 'door', 'front', false, 'neutral', {}], [945, 'bin', 'q', false, 'neutral', {}], [1255, 'paddle', 'front', false, 'determined', {}], [1560, 'thumbsDown', 'q', true, 'smug', {}], [1800, 'wave', 'q', false, 'happy', { face: 'in', gap: 4.4 }]];
    gem.forEach(([x, p, v, fl, e, ex], i) => { spot(x, G - 100, 240); gemini(x, G, u, { ...feel(e, tt, { seed: i + 3 }), pose: p, view: v, flip: fl, boilKey: 'gm' + i, emoteK: 0, ...ex }); L(`gemini · ${v}${fl ? ' flip' : ''}${ex.face ? ' · face in' : ''} · ${p}`, x, G); });
    // row 3: the Codex gang
    G = 805;
    const cx = [[90, 'cat', 'idle', 'front', false, 'mischief', { cap: true, satchel: true }], [255, 'cat', 'sneak', 'q', false, 'mischief', {}], [440, 'term', 'pick', 'front', false, 'determined', { mask: true }], [640, 'term', 'run', 'q', false, 'excited', {}],
      [805, 'ghost', 'cheer', 'front', false, 'happy', { cap: true }], [965, 'ghost', 'idle', 'q', true, 'mischief', { mask: true }], [1130, 'crab', 'idle', 'front', false, 'mischief', { satchel: true }], [1320, 'crab', 'pick', 'q', false, 'determined', {}],
      [1520, 'dog', 'cheer', 'front', false, 'excited', { cap: true }], [1700, 'dog', 'run', 'q', false, 'playful', { satchel: true, cap: '#2E4A7A' }], [1855, 'term', 'wave', 'q', true, 'happy', { cap: true, satchel: true }]];
    cx.forEach(([x, k, p, v, fl, e, ex], i) => { spot(x, G - 80, 180); codex(x, G, u, { ...feel(e, tt, { seed: i + 7 }), kind: k, pose: p, view: v, flip: fl, boilKey: 'cx' + i, emoteK: 0, ...ex }); L(`${k} · ${v}${fl ? ' flip' : ''} · ${p}`, x, G); });
    // row 4: Clawd
    G = 1050;
    const cl = [[190, 'idle', 'front', false, 'neutral', {}], [520, 'wave', 'q', false, 'happy', {}], [860, 'idle', 'q', true, 'love', {}], [1200, 'cheer', 'front', false, 'excited', {}], [1530, 'idle', 'front', false, 'sad', {}], [1800, 'hug', 'q', false, 'surprised', {}]];
    cl.forEach(([x, p, v, fl, e, ex], i) => { spot(x, G - 90, 240); clawd2(x, G, u * .9, { ...feel(e, tt, { seed: i + 11 }), pose: p, view: v, flip: fl, boilKey: 'cl' + i, emoteK: 0, ...ex }); label(`clawd · ${v}${fl ? ' flip' : ''} · ${p} · ${e}`, x, G + 17, 14); });
  };
  LOOPS.bots2.len = 4;
  // one row per look: ink (the past), card (the present), doodle (the good future), riso (the bad future), bank (money)
  LOOPS.bots2Looks = t => {
    [['ink', 'ink'], ['card', 'card'], ['doodle', 'doodle'], ['xerox', 'riso'], ['bank', 'bank']].forEach(([m, name], r) => {
      look(m); const tt = mt(t), y0 = r * 216, y1 = y0 + 216, G = y0 + 196, u = 14;
      b2Band(m, y0, y1, G);
      label(name, 70, G - 60, 24);
      copilot(230, G, u, { ...feel('happy', tt, { seed: 1 }), boilKey: 'lc1' + r, emoteK: 0 });
      copilot(390, G, u, { ...feel('neutral', tt, { seed: 2 }), view: 'q', pose: 'present', boilKey: 'lc2' + r });
      copilot(545, G, u, { ...feel('neutral', tt, { seed: 3 }), view: 'q', flip: true, disguise: true, cheap: .6, boilKey: 'lc3' + r });
      gemini(740, G, u, { ...feel('neutral', tt, { seed: 4 }), boilKey: 'lg1' + r });
      gemini(955, G, u, { ...feel('smug', tt, { seed: 5 }), view: 'q', pose: 'thumbsDown', boilKey: 'lg2' + r });
      CX_KINDS.forEach((k, i) => codex(1115 + i * 78, G, u, { ...feel(['mischief', 'neutral', 'happy', 'mischief', 'excited'][i], tt, { seed: 6 + i }), kind: k, view: i % 2 ? 'q' : 'front', cap: i === 4, satchel: i === 0, boilKey: 'lx' + i + r, emoteK: 0 }));
      clawd2(1600, G, u, { ...feel('neutral', tt, { seed: 12 }), boilKey: 'll1' + r });
      clawd2(1800, G, u, { ...feel('love', tt, { seed: 13 }), view: 'q', flip: true, boilKey: 'll2' + r, emoteK: 0 });
    });
    look(LOOK_DEFAULT);
  };
  LOOPS.bots2Looks.len = 4;
  // expressions: a row per family
  const EMOS = ['neutral', 'happy', 'smug', 'laugh', 'surprised', 'angry', 'sad', 'love'];
  LOOPS.bots2Faces = t => {
    b2Look(); stage(t); const tt = mt(t), calm = { aL: -.2, aR: -.2, dy: 0, dx: 0, rot: 0 };
    EMOS.forEach((e, i) => {
      const x = 122 + i * 239, v = i % 2 ? 'q' : 'front';
      spot(x, 150, 180);
      copilot(x, 258, 25, { ...feel(e, tt, { seed: i }), ...calm, view: v, noShadow: true, boilKey: 'fc' + i, emoteK: 0 }); label(e, x, 272, 16);
      gemini(x, 530, 33, { ...feel(e, tt, { seed: i }), ...calm, view: v, solo: i % 2 ? 'B' : 'A', lanyard: i < 4, noShadow: true, boilKey: 'fg' + i, emoteK: 0 });
      codex(x, 805, 44, { ...feel(e, tt, { seed: i }), ...calm, view: v, kind: CX_KINDS[i % 5], noShadow: true, boilKey: 'fx' + i, emoteK: 0 });
      clawd2(x, 1045, 15, { ...feel(e, tt, { seed: i }), ...calm, view: v, noShadow: true, boilKey: 'fl' + i, emoteK: 0 }); label(e, x, 1068, 16);
    });
  };
  LOOPS.bots2Faces.len = 4;
  // close-ups, for checking the drawing
  LOOPS.bots2Cop = t => {
    b2Look(); stage(t); const tt = mt(t), u = 36, G = 900;
    [[150, 'idle', 'front', {}, 'neutral'], [470, 'present', 'front', {}, 'happy'], [800, 'typing', 'q', {}, 'determined'], [1120, 'sit', 'q', {}, 'smug'], [1450, 'wave', 'front', { disguise: true }, 'happy'], [1760, 'mimic', 'q', { cheap: 1 }, 'neutral']]
      .forEach(([x, p, v, ex, e], i) => { spot(x); copilot(x, G, u, { ...feel(e, tt, { seed: i }), pose: p, view: v, boilKey: 'cc' + i, emoteK: 0, ...ex }); label(`${v} · ${p}`, x, 950, 18); });
  };
  LOOPS.bots2Cop.len = 4;
  LOOPS.bots2Gem = t => {
    b2Look(); stage(t); const tt = mt(t), u = 34;
    gemini(560, 560, u * .8, { ...feel('neutral', tt, { seed: 1 }), pose: 'door', boilKey: 'gg1' }); label('door', 560, 590, 18);
    gemini(1400, 560, u, { ...feel('neutral', tt, { seed: 2 }), pose: 'bin', view: 'q', boilKey: 'gg2' }); label('q · bin', 1400, 590, 18);
    gemini(420, 1000, u, { ...feel('happy', tt, { seed: 3 }), boilKey: 'gg3' }); label('idle', 420, 1030, 18);
    gemini(1000, 1000, u, { ...feel('determined', tt, { seed: 4 }), pose: 'paddle', boilKey: 'gg4' }); label('paddle', 1000, 1030, 18);
    gemini(1580, 1000, u, { ...feel('smug', tt, { seed: 5 }), pose: 'thumbsDown', view: 'q', flip: true, boilKey: 'gg5' }); label('q · flip · thumbsDown', 1580, 1030, 18);
  };
  LOOPS.bots2Gem.len = 4;
  LOOPS.bots2Cx = t => {
    b2Look(); stage(t); const tt = mt(t), u = 50;
    CX_KINDS.forEach((k, i) => {
      const x = 190 + i * 385;
      codex(x - 70, 480, u, { ...feel('mischief', tt, { seed: i }), kind: k, cap: i % 2 === 0, satchel: i % 2 === 1, boilKey: 'xa' + i }); label(k + ' · front', x - 70, 510, 18);
      codex(x + 20, 1000, u, { ...feel('determined', tt, { seed: i + 5 }), kind: k, view: 'q', pose: ['sneak', 'pick', 'run', 'pick', 'cheer'][i], mask: i === 1, boilKey: 'xb' + i }); label(k + ' · q · ' + ['sneak', 'pick', 'run', 'pick', 'cheer'][i], x + 20, 1030, 18);
    });
  };
  LOOPS.bots2Cx.len = 4;
  LOOPS.bots2Cl = t => {
    b2Look(); stage(t); const tt = mt(t), u = 34;
    clawd2(420, 520, u, { ...feel('happy', tt, { seed: 1 }), pose: 'wave', boilKey: 'ca1' }); label('front · wave · happy', 420, 555, 18);
    clawd2(1300, 520, u, { ...feel('hopeful', tt, { seed: 2 }), view: 'q', walk: bpOf(tt) / 2, pose: 'cheer', boilKey: 'ca2', hold: s => { rotate(1.35); translate(.15 * s, -1.05 * s); b2PermissionCard(2.4 * s, 'clperm', 1); } });   // (rotate(a) undoes the arm's raise: the card stands upright) label('q · walk · holding a permission request', 1300, 555, 18);
    clawd2(420, 1000, u, { ...feel('love', tt, { seed: 3 }), view: 'q', flip: true, boilKey: 'ca3' }); label('q flip · love', 420, 1035, 18);
    clawd2(1300, 1000, u, { ...feel('surprised', tt, { seed: 4 }), boilKey: 'ca4' }); label('front · surprised', 1300, 1035, 18);
  };
  LOOPS.bots2Cl.len = 4;
})();

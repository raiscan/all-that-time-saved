// cast/people.js: a parametric human rig for the two narrators and the supporting cast, plus the narrators' concepts.
//
// person(x, y, u, P, o): (x, y) = the ground point between the feet; u = unit (the commuter's unit). P = a preset (a
// build, a face, hair, glasses and clothes: see below); o = per frame, like commuter():
//   view: 'front' | 'q' (3/4, facing right) · flip: true faces left · a feel()/emotions() spread (dy sq rot dx eyes mouth
//   lookX lookY squint blush gloom emote emoteK emoteAge) · pose: a PPOSE name or { L, R } from pPoses() · tilt (head,
//   rad) · walk: a phase in cycles (q: a stride; front: alternate lifts); the arms swing unless a pose is given ·
//   seated: true (sits with the hips o.seatH u above the ground, knees forward; the coat stops at the lap) · legs: false
//   (no legs: behind a desk) · hold / holdL: (s) => draws a prop in the right / left hand, as commuter() · boilKey ·
//   noShadow · col: colour overrides · idle (0..1, default 1: the idle life, clawd.js lifeOf: breathing lifts the
//   shoulders and head, the weight shifts from foot to foot, the head turns a little now and then, irregular blinks; never
//   on the beat. 0 when a shot draws over the rig with personFrame, so the overlay stays put) · blink (force: 1 shut, 0 open)
// personFrame(P, o) returns the skeleton in body units (ya ankle, yh hip, ys shoulder line, yc chin, hy head centre,
// top, hx head x); multiply by u and add (x, y) for world points (ignores dy, sq, walk bob).
//
// A preset P (all lengths in body units u; the narrators' presets below are the worked examples):
//   id, name
//   body: leg (hip → ankle), torso (hip → shoulder line), neck, arm (shoulder → wrist), armW / wrist (sleeve width at
//         the shoulder and the cuff), hand, legW / legW1 (at the hip and the ankle), legGap (half the hip spacing),
//         stance (feet apart), stride (walk step, × leg), foot (shoe scale), stoop 0..1 (head forward and down, a hunch
//         in 3/4)
//   head: w (half-width), h (height), and the profile, as fractions of w: crown, cheek (at cheekY, -1 top .. 1 chin),
//         jaw (at jawY), chin; cheekC / jawC / chinC make hard corners (angular faces); neck (neck width ×w)
//   face: eyeY, gap (eye centres ±gap×w), eye (width ×w), tall, lid 0..1 (heavier resting lids: dry), irisS, lash,
//         flicks (lash flicks), browY (above the eye, ×h/2), browW, brow0 [inner, outer] (resting brow),
//         nose: { kind: broad | button | long | point | round (PP_NOSE: a cartoon ball nose), w (width), len (bridge),
//         q (in 3/4, how far the tip sits toward the far cheek, ×w) },
//         noseY, mouthY, mouthW, lips 0..1 (a lower lip), freckles (count), blush 0..1 (always on), ear (size),
//         beard: none | chin (chinstrap + soul patch) | full | box | stubble | tache, nosestud / hoops (colours)
//   hair: style: crop (top: a flat-top's height; lineup: false for a soft hairline; hairline) | bun (bun: { r, y, x,
//         shape: round | point | tall, curls }, puff (curly volume at the sides), curly (bumps on the hairline cap),
//         tendrils (ringlets at the temples), fringe (forehead curls)) | afro | twists (twists: count) | bob | part |
//         long | bald; hat: 'beanie' (hatY, hatH, cuffH)
//   glasses: { r (×w), t (rim), ry } — round, always (the narrator's signature)
//   top: kind: parka | puffer | boxy | coat | hoodie | jumper. The silhouette is a right-hand profile below the
//         shoulder line: neck (collar half-width), sh [x, dy] (the shoulder point), sharp (a hard shoulder), rows
//         [[x, dy, corner], ...] down to the hem (the last row is the hem corner), hemC (the hem's sag at the centre).
//         collar: ruff (fur-trimmed hood: ruff [rx, ry, dy]) | lapel (popped: true for a stand-up collar; vDepth) |
//         round (collarW) | funnel | hood | crew; band (hem band height); quilt (puffer channel height); buttons
//         [[fr, dy], ...]; belt (dy); open (fr of the coat's opening); pocket (dy); stripe (jumper, dy); armsFront:
//         false hangs the arms behind the body (default: over it, so wide coats don't hide them)
//   legs: { kind: trousers | tights | skirt (len × leg, flare) }, shoes: { kind: trainer | boot | point | chunky }
//   extra: { pack (backpack, 3/4 only), buds (earbuds), scarf: { len, w }, pencil: { ang, len } (stuck in the bun) }
//   col: skin skinDk skinLt lip lipLt freckle blush iris hair hairLt hairDk beard beardLt brow coat coatDk coatLt cuff
//        button collar fur furDk under trousers trousersDk skirt skirtDk shoe shoeLt sole hat hatDk glasses tie scarf
//        scarfDk scarfLt pack packDk
// 3/4 view: the head outline turns (brow ridge, eye socket and cheekbone on the far side, the chin swung round under
// the mouth, the near jaw running back to the ear); the far eye is narrower and tucked inside it; the nose sits inside the
// face; the far hairline stops at the temple.
// Looks: engrave, bank and xerox lift skin tones to a mid tone (dense crosshatch would read as black skin); doodle knocks out the paper
// behind big pieces (coloured pencil is see-through) and draws near-black hair in a deep brown pencil.
// No minstrel tropes on any human (natural skin tones, eye whites, their own features, bare hands).
// Cartoon noses (fractions of the head's half-width): a ball tip (tw × th radii), nostril wings (radius wr, centred wx
// out and wy down from the tip), the bridge's length (× half the head height), holes (nostrils show), pt (a pointed tip).
const PP_NOSE = {
  broad:  { tw: .2, th: .16, wr: .13, wx: .25, wy: .07, len: .45, holes: 1 },
  round:  { tw: .21, th: .19, wr: .11, wx: .2, wy: .07, len: .5, holes: 1 },
  button: { tw: .13, th: .12, wr: .07, wx: .13, wy: .05, len: .3, holes: 0 },
  long:   { tw: .13, th: .14, wr: .08, wx: .14, wy: .06, len: .75, holes: 0 },
  point:  { tw: .1, th: .13, wr: .07, wx: .12, wy: .07, len: .85, holes: 0, pt: 1 },
};
const PP_PSI = .45, PP_QS = .3, PP_HPSI = .6;   // how far the 3/4 view turns the body (rad) and shifts the torso (u); how far it turns the face (rad)

// ---------- shape helpers ----------
const ppMirror = R => R.concat(R.slice(1, -1).reverse().map(([x, y, c]) => [-x, y, c]));
// A smooth closed outline through P (like curvy()), except that a point [x, y, 1] is a hard corner.
function ppShape(P, n = 5) {
  const cs = []; P.forEach((p, i) => { if (p[2]) cs.push(i); });
  if (!cs.length) return curvy(P.map(p => [p[0], p[1]]), n);
  const N = P.length, out = [];
  for (let j = 0; j < cs.length; j++) {
    const a = cs[j], b = cs[(j + 1) % cs.length], run = [];
    let i = a; do { run.push([P[i][0], P[i][1]]); i = (i + 1) % N; } while (i !== b); run.push([P[b][0], P[b][1]]);
    const s = run.length > 2 ? through(run, n) : run; s.pop(); out.push(...s);
  }
  return out;
}
// The half-width of a right-hand profile (points top → bottom) at height y.
function ppWidthAt(R, y) {
  for (let i = 0; i + 1 < R.length; i++) { const a = R[i], b = R[i + 1]; if (a[1] !== b[1] && (y - a[1]) * (y - b[1]) <= 0) return lerp(a[0], b[0], (y - a[1]) / (b[1] - a[1])); }
  return y < R[0][1] ? R[0][0] : R[R.length - 1][0];
}
// The run of a closed outline above (or below) y = yb, as one open line (above: left → top → right; below: right →
// bottom → left, for outlines that run clockwise from the top like ppMirror's).
function ppArc(O, yb, above) {
  const N = O.length, ins = i => above ? O[i % N][1] < yb : O[i % N][1] > yb;
  let best = null;   // the longest run (a notch elsewhere must not win)
  for (let i = 0; i < N; i++) if (!ins(i) && ins(i + 1)) { const out = []; for (let j = 1; j <= N && ins(i + j); j++) out.push(O[(i + j) % N]); if (!best || out.length > best.length) best = out; }
  return best || O.slice();
}
// n evenly spaced points along an open line.
function ppResample(A, n) {
  const L = [0]; for (let i = 1; i < A.length; i++) L.push(L[i - 1] + Math.hypot(A[i][0] - A[i - 1][0], A[i][1] - A[i - 1][1]));
  const tot = L[L.length - 1] || 1, out = []; let j = 0;
  for (let i = 0; i < n; i++) { const d = tot * i / (n - 1); while (j < A.length - 2 && L[j + 1] < d) j++; const k = clamp((d - L[j]) / ((L[j + 1] - L[j]) || 1)); out.push([lerp(A[j][0], A[j + 1][0], k), lerp(A[j][1], A[j + 1][1], k)]); }
  return out;
}
// Curly: push an open line out from c in nb round bumps.
function ppBumpy(A, c, nb, amp) {
  const R = ppResample(A, Math.max(12, nb * 8));
  return R.map((p, i) => { const k = 1 + amp * (Math.sqrt(Math.abs(Math.sin(Math.PI * nb * i / (R.length - 1)))) - .35); return [c[0] + (p[0] - c[0]) * k, c[1] + (p[1] - c[1]) * k]; });
}
// A cloud of nb round bumps around an ellipse (curly hair).
function ppScallop(cx, cy, rx, ry, nb, amp, a0 = 0, n = 7) {
  const P = [], N = nb * n;
  for (let i = 0; i < N; i++) { const a = a0 + i / N * TAU, k = 1 - amp + amp * Math.sqrt(Math.abs(Math.sin((a - a0) * nb / 2))); P.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
  return P;
}
// A ring (glasses rims) as one closed shape; the seam sits at angle a0.
function ppRing(cx, cy, rx, ry, t, a0 = 0, n = 30) {
  const o = [], i = [];
  for (let j = 0; j <= n; j++) { const a = a0 + j / n * TAU; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); i.push([cx + Math.cos(a) * (rx - t), cy + Math.sin(a) * (ry - t)]); }
  return o.concat(i.reverse());
}
const ppScale = (P, c, kx, ky = kx) => P.map(([a, b]) => [c[0] + (a - c[0]) * kx, c[1] + (b - c[1]) * ky]);
// A rounded bar from a to b, w wide (cuffs, straps, pencils).
function ppBar(a, b, w0, w1 = w0) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), c = Math.cos(ang), s = Math.sin(ang), P = [];
  const at = (o, t, w) => [o[0] + Math.cos(t) * w / 2 * c - Math.sin(t) * w / 2 * s, o[1] + Math.cos(t) * w / 2 * s + Math.sin(t) * w / 2 * c];
  for (let i = 0; i <= 6; i++) P.push(at(a, Math.PI / 2 + i / 6 * Math.PI, w0));
  for (let i = 0; i <= 6; i++) P.push(at(b, -Math.PI / 2 + i / 6 * Math.PI, w1));
  return P;
}
// A smooth open line through P (like through()), except that a point [x, y, 1] is a hard corner.
function ppOpen(P, n = 5) {
  const out = []; let run = [[P[0][0], P[0][1]]];
  const flush = () => { const s = run.length > 2 ? through(run, n) : run.slice(); if (out.length) s.shift(); out.push(...s); };
  for (let i = 1; i < P.length; i++) { run.push([P[i][0], P[i][1]]); if (P[i][2] && i < P.length - 1) { flush(); run = [[P[i][0], P[i][1]]]; } }
  flush(); return out;
}
// Arm (or leg) IK: root → tip with a length-L hose. Which side the elbow goes comes from the anatomy, not from which side
// of the shoulder the hand happens to be (the user: "elbows should not bend inwards"; V2h's typing flipped it in, out,
// in). Seen from its own outside (ppElbowArc), an arm's elbow sits out beside a low hand (hanging, on the lap, at the hip,
// held out and down: the upper arm angled out, the forearm coming back to the hand, never the upper arm hanging in
// across the body), and under the forearm once the hand is raised past arc.a (held out level, up, at the chin, the
// face or the ear); only a hand over the top of the head and in past arc.b has it out again (hands behind the head).
// At each of the two edges the arm swings through straight over ±PP_RAMP°, so a hand moving across one swings the elbow
// round smoothly instead of flipping it between two drawings. bend > 0 bows it that way (more), bend ≤ -.08 the other
// way (a pose's own choice); in between it swings through straight (a blend into a pose with bend 0 overshoots a little
// below it: that used to flip the elbow for a drawing). Out-of-reach targets straighten the limb toward them, so hanging
// poses work for any build. dir: an arc (default: an arm's, drawn front on), or for a leg a pole [x, y] the knee points
// toward (straightening through it over PP_RAMP likewise).
function ppReach(root, tip, L, bend, s, dir) {
  let dx = tip[0] - root[0], dy = tip[1] - root[1], d = Math.hypot(dx, dy) || 1e-6;
  const dm = L * .97; if (d > dm) { dx *= dm / d; dy *= dm / d; d = dm; }
  const nx = -dy / d, ny = dx / d, R = Math.sin(PP_RAMP * Math.PI / 180);
  let f;   // (which side of the root → tip line, and how far round: ±1 fully bent, 0 straight)
  if (Array.isArray(dir)) f = clamp((nx * dir[0] + ny * dir[1]) / (Math.hypot(dir[0], dir[1]) || 1) / R, -1, 1);
  else { const A = dir || ppElbowArc(s, false), th = Math.atan2(A.o * dx, dy) * 180 / Math.PI; f = -A.o * clamp(Math.min(th - A.b, A.a - th) / PP_RAMP, -1, 1); if (f * A.o < 0 && A.k != null) f *= A.k * clamp((1 - d / L) / .25); }   // (th: from straight down, + toward the arm's outside; k: how much of the elbow's way out is across the page)
  f *= clamp(1 + bend / .04, -1, 1);
  const h = (Math.sqrt(Math.max(0, L * L / 4 - d * d / 4)) * .92 + Math.abs(bend) * d * .22) * f;
  return [root, [root[0] + dx / 2 + nx * h, root[1] + dy / 2 + ny * h], [root[0] + dx, root[1] + dy]];
}
// An arm's arc (the rig's frame, before a flip; s: -1 the arm on the left, 1 on the right): o, its outside (+1 right, -1
// left); a, b: the edges of the hand positions that have the elbow out beside the hand, in degrees from straight down,
// + toward the outside. Front on the outside is the arm's own side, and a hand raised past 23° out has the elbow under it
// (a hand held up by the shoulder: out beside it, the elbow flared up level). In 3/4 (facing right) the far arm's outside
// is ahead of the body on the page, so its elbow goes out that way (I3's palm-up at the poster, V2h's typing, the den's
// cans: not the upper arm hanging in across the chest) until the hand comes up to 53°; the near arm's outside is behind,
// back and down. (Every edge sits in a gap between the film's hand positions, measured over every drawing of every arm,
// so no hand in the film lingers where its elbow is swinging round.) k: the far arm's outside turns away from us, so an
// elbow out beside the hand sits only .6 of its way across the page (full, the upper arm stuck straight out level), and
// less as the arm straightens toward full reach (V2b's reach to the terminal: a straight arm swinging up, its elbow
// bumped up over it).
const PP_ARC = { front: [23, -157], far: [53, -157, .6], near: [35, -147] }, PP_RAMP = 5;
const ppElbowArc = (s, q) => { const [a, b, k] = q ? (s > 0 ? PP_ARC.far : PP_ARC.near) : PP_ARC.front; return { o: q ? (s > 0 ? 1 : -1) : s, a, b, k }; };

// ---------- poses ----------
// Hand targets: [x, y, bend, hand pose, front (drawn over the body), wrist angle (optional), 'u']. x in shoulder
// half-widths (L negative); y from the shoulder line: 0..1 = down to the hip line, below 0 = up toward the crown (-1).
// Targets out of reach straighten the arm toward them, so the same pose fits every build. With 'u' as the 7th field,
// x and y are body units in the person's own frame (ground point = 0, before the flip): for touching another character.
const PPOSE = {
  idle:    { L: [-1.35, 3, .1, 'relax'], R: [1.35, 3, .1, 'relax'] },
  low:     { L: [-1.1, 3, .06, 'relax'], R: [1.1, 3, .06, 'relax'] },
  hips:    { L: [-.92, .78, .9, 'fist'], R: [.92, .78, .9, 'fist'] },
  pockets: { L: [-.6, .98, .4, 'none', 1], R: [.6, .98, .4, 'none', 1] },
  fists:   { L: [-1.2, 1.25, .1, 'fist'], R: [1.2, 1.25, .1, 'fist'] },
  up:      { L: [-1.9, -2.2, .2, 'open'], R: [1.9, -2.2, .2, 'open'] },
  shrug:   { L: [-1.75, .12, .45, 'open'], R: [1.75, .12, .45, 'open'] },
  cross:   { L: [.42, .5, .5, 'fist', 1, -.2], R: [-.42, .44, .5, 'relax', 1, Math.PI + .2] },
  chin:    { L: [.1, .55, .5, 'relax', 1], R: [.28, -.12, .55, 'fist', 1, -1.7] },
  phone:   { L: [-1.3, 3, .1, 'relax'], R: [.35, .4, .5, 'hold', 1, -1.2] },
  wave:    { L: [-1.3, 3, .1, 'relax'], R: [2.1, -1.1, .25, 'open', 0, -1.3] },
  point:   { L: [-1.3, 3, .1, 'relax'], R: [4, .15, .05, 'point', 1] },
  belly:   { L: [-.3, .78, .45, 'relax', 1, .2], R: [.34, .72, .45, 'relax', 1, Math.PI - .2] },
  face:    { L: [-.35, -.3, .5, 'open', 1, -1.3], R: [.35, -.3, .5, 'open', 1, -1.85] },
  mug:     { L: [-.15, .62, .5, 'relax', 1, .1], R: [.22, .38, .5, 'hold', 1, -1.35] },
  lap:     { L: [-.5, 1.05, .4, 'relax', 1, .6], R: [.5, 1.05, .4, 'relax', 1, Math.PI - .6] },
};
// Blend between poses over time: keys [[t, name | { L, R }], ...] (normalised specs only); each change eases in over
// `blend` s with a rubbery overshoot.
function pPoses(t, keys, blend = .3) {
  let i = 0; while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
  const get = v => typeof v === 'string' ? PPOSE[v] : v, cur = get(keys[i][1]); if (i === 0) return cur;
  const prev = get(keys[i - 1][1]), k = backOut(seg(t, keys[i][0], keys[i][0] + blend));
  const ang = (a, b) => a == null || b == null ? (k < .5 ? a : b) : lerp(a, b, k);
  const mix = (a, b) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k), k < .5 ? a[3] : b[3], k < .5 ? a[4] : b[4], ang(a[5], b[5])];
  return { L: mix(prev.L, cur.L), R: mix(prev.R, cur.R) };
}

// ---------- the skeleton ----------
function personFrame(P, o = {}) {
  const b = P.body, h = P.head, st = b.stoop || 0, ya = -(b.foot || 1) * .62;
  const yh = o.seated ? -(o.seatH ?? (b.leg * .52 + .8)) : ya - b.leg, ys = yh - b.torso;
  const yc = ys - (b.neck || 0) + st * .55, hy = yc - h.h / 2;
  return { ya, yh, ys, yc, hy, top: yc - h.h, hx: o.view === 'q' ? PP_QS * .6 + st * 1.1 : 0 };
}
// The widest half-width of a preset's silhouette (for spacing figures on sheets).
const ppHalfW = P => Math.max(P.top.sh[0], ...P.top.rows.map(r => r[0])) + P.body.armW * .6;

function person(x, y, u, P, o = {}) {
  const b = P.body, hd = P.head, f = P.face, hr = P.hair || { style: 'bald' }, tp = P.top, ex = P.extra || {};
  let C = o.col ? { ...P.col, ...o.col } : P.col;
  // engrave and bank hatch by tone, so skin is lifted to a mid tone (dense crosshatch would read as a black mask); the riso
  // photocopy lifts and caps skin itself (maxTone), so a second lift there would print dark skin pale
  if (['engrave', 'bank'].includes(STYLE.mode)) { const lt = c => c && mixCol(c, '#F4E8D8', .4); C = { ...C, skin: lt(C.skin), skinDk: lt(C.skinDk), skinLt: lt(C.skinLt), lip: lt(C.lip) }; }
  if (STYLE.mode === 'doodle') { const br = (c, k2) => c && lum(c) < .2 ? mixCol('#3A2A22', c, k2) : c; C = { ...C, hair: br(C.hair, .1), hairDk: br(C.hairDk || C.hair, .4), beard: br(C.beard, .2), brow: br(C.brow || C.hair, .2) }; }   // near-black pencil reads grey: use a muted deep brown
  const knock = P2 => { if (STYLE.mode === 'doodle') _paint(P2, { wash: '#FBF8F0', ink: null }); };   // coloured pencil is see-through
  const id = o.boilKey ?? ++CLAWD_N, K = (P.id || 'pp') + id, rs = p => boilSeed(`pp ${K} ${p}`), S = pts => U(pts, u), k = s => K + s;
  // (card is rigid: no squash and stretch. The body's squash (a slump, a take's stretch) becomes the shoulders, arms and
  // head dropping or rising as one on the planted legs, below)
  const q = o.view === 'q', sq0 = ((o.sq || 0) + (o.take || 0)) * .5, sq = STYLE.card ? 0 : sq0, sw = clamp(u / 20, .55, 2.2), lift = u * .12;
  const F = faceOf(o), seed = o.seed || 0;
  // singing (card): a preset with a voice (the narrators) lip-syncs the lyric from the replacement mouths while that voice
  // sings, the shot's mouth giving the mood (mouths.js singMouth); o.sing: false stops it, o.sing: 'M' | 'F' gives a voice
  const voice = o.sing === false ? null : typeof o.sing === 'string' || (o.sing && o.sing.segs) ? o.sing : P.voice;   // (o.sing: a lipPart, just its words)
  if (voice && typeof singMouth === 'function') F.mouth = singMouth(mt(T), voice, F.mouth);
  // idle life, not the beat: breathing lifts the shoulders and head, the weight shifts from foot to foot, the head turns a
  // little now and then, blinks come irregularly (lifeOf in clawd.js; each character on its own clocks; in card, in clean
  // steps held between, at this rig's scale on screen)
  const pxu = u * drawScale(), life = lifeOf(o, K + '|' + seed, undefined, pxu), blink = (!F.style || F.style === 'open') && life.blink;
  const walking = o.walk != null && !o.seated, wph = walking ? o.walk * TAU : 0;
  const Fr = personFrame(P, o), st = b.stoop || 0, QS = q ? PP_QS : 0;
  const bob = walking ? -Math.abs(Math.cos(wph)) * .3 : 0;   // up as the legs pass each other
  // (card: the upper body's rise = the breath less the slump (half what the squash would move the shoulders, ≤ .6u), in
  // half-pixel steps)
  const br = STYLE.card ? Math.round((life.breath * (o.seated ? .8 : 1) - clamp(sq0 * .5 * -Fr.ys, -.6, .6)) * pxu * 2) / (pxu * 2) : life.breath * (o.seated ? .8 : 1);
  const rot = (o.rot || 0) + (walking ? 0 : life.lean * (o.seated ? .4 : 1));
  const ya = Fr.ya, yh = Fr.yh + bob, ys = Fr.ys + bob - br, yc = Fr.yc + bob - br, hy = Fr.hy + bob - br, top = Fr.top + bob - br;
  const hw = hd.w, hh = hd.h / 2, hx = Fr.hx + clamp(o.lookX || 0, -1, 1) * .1 + life.turn * .1;
  x += (o.dx || 0) * u;
  const rows0 = tp.rows, hem0 = rows0[rows0.length - 1];
  rs('shadow'); if (!o.seated && !o.noShadow) paint(oval(x + QS * u, y + .1 * u, (Math.max(hem0[0], b.legGap + b.foot) + .7) * u, .42 * u, 0, 24), { wash: NOIR.ink, washOp: STYLE.card ? 110 : 150, ink: null });
  push(); translate(x, y + (o.dy || 0) * 1.1 * u); nudge('pp' + K, 1); if (rot) rotate(rot); scale((o.flip ? -1 : 1) * (1 + sq * .5), 1 - sq);
  const prevXF = XF; XF = o.flip ? -XF : XF;

  // ---- the coat's silhouette: a right-hand profile, mirrored; in 3/4 the far side narrows and a stoop hunches it ----
  const seatCut = o.seated ? b.torso + .7 : Infinity;
  let rows = rows0;
  const TR0 = [[0, ys - (tp.neckY ?? .15)], [tp.neck ?? .9, ys - .1], [tp.sh[0], ys + tp.sh[1], tp.sharp ? 1 : 0], ...rows0.map(r => [r[0], ys + r[1], r[2] || 0])];
  if (hem0[1] > seatCut) rows = rows0.filter(r => r[1] < seatCut - .4).concat([[ppWidthAt(TR0, ys + seatCut), seatCut, 1]]);
  const hemDy = rows[rows.length - 1][1], hemC = tp.hemC ?? .15;
  const TR = [[0, ys - (tp.neckY ?? .15)], [tp.neck ?? .9, ys - .1], [tp.sh[0], ys + tp.sh[1], tp.sharp ? 1 : 0], ...rows.map(r => [r[0], ys + r[1], r[2] || 0]), [0, ys + hemDy + hemC]];
  const lean = yy => q ? st * .8 * clamp((yh - yy) / (yh - ys)) : 0;
  const hump = (xx, yy) => q && xx < 0 ? -st * .55 * Math.sin(Math.PI * clamp((yy - ys + .5) / (b.torso * .8))) : 0;
  const xq = (xx, yy) => q ? (xx >= 0 ? xx * .97 : xx * .93) + QS + lean(yy) + hump(xx, yy) : xx;
  const Q = pts => pts.map(([a, c, cr]) => [xq(a, c), c, cr]);
  const wAt = yy => ppWidthAt(TR, yy);
  // a point on the coat's surface: fr = -1..1 across the front (0 = the centre front), at height yy
  const sx = (fr, yy) => { const w = wAt(yy); return q ? QS + lean(yy) + w * .95 * Math.sin(Math.asin(clamp(fr, -1, 1)) + PP_PSI) : fr * w; };
  const TS = (fr, dyy) => [sx(fr, ys + dyy), ys + dyy];

  // ---- arms ----
  const shX = tp.sh[0], shY = ys + Math.max(tp.sh[1], .15), aw = b.armW, L = b.arm;
  const pose = o.pose ? (typeof o.pose === 'object' ? o.pose : PPOSE[o.pose]) : walking ? null : PPOSE.idle;
  // hand targets hold still while the shoulders breathe (so a prop placed from personFrame stays in the hand)
  const ys0 = ys + br, top0 = top + br, target = spec => spec[6] === 'u' ? [spec[0], spec[1]] : [spec[0] * shX + QS + lean(ys), spec[1] >= 0 ? ys0 + spec[1] * (yh - ys0) : ys0 + spec[1] * (ys0 - top0)];
  const arm = (s, front) => {
    let spec = pose ? (s < 0 ? pose.L : pose.R) : null, swing = null;
    if (!spec) { swing = Math.sin(wph + (s < 0 ? 0 : Math.PI)) * (q ? .42 : .12) + (q ? 0 : s * .12); spec = [0, 0, .1, 'relax', q && s < 0 ? 1 : 0]; }
    const isFront = !!(spec[4] || (tp.armsFront !== false && !(q && s > 0)));   // hanging arms go over wide coats; in 3/4 the far arm stays behind
    if (isFront !== front) return;
    rs('arm' + s);
    const far = q && s > 0 && !front, inset = front ? aw * .42 : aw * .85;
    const root = [xq(s * (shX - inset), shY), shY + aw * .4];
    const tip = swing != null ? [root[0] + Math.sin(swing) * L, root[1] + Math.cos(swing) * L] : target(spec);
    const pts = ppReach(root, tip, L, spec[2] ?? .1, s, ppElbowArc(s, q));
    const col = far ? mixCol(C.coat, C.coatDk, .45) : C.coat;
    const r = limb(S(pts), aw * u, b.wrist * u, col, { sw, shade: C.coatDk, key: k('arm' + s) });
    const ca = spec[5] ?? r.ang, cw = b.wrist * 1.12;
    if (spec[3] !== 'none') hand(r.tip[0] + Math.cos(ca) * .08 * u, r.tip[1] + Math.sin(ca) * .08 * u, ca, b.hand * u, { pose: spec[3], col: far ? C.skinDk : C.skin, sw, mirror: s < 0, key: k('h' + s), hold: s > 0 ? o.hold : o.holdL, maxTone: .45 });
    const ex0 = [r.tip[0] - Math.cos(r.ang) * .32 * u, r.tip[1] - Math.sin(r.ang) * .32 * u];
    piece(ppBar(ex0, [r.tip[0] + Math.cos(r.ang) * .04 * u, r.tip[1] + Math.sin(r.ang) * .04 * u], cw * u, cw * 1.04 * u), far ? mixCol(C.cuff || C.coatDk, NOIR.ink, .15) : (C.cuff || C.coatDk), { sw, key: k('cuff' + s), lift: 2 });
  };

  // ---- legs and shoes ----
  const shoe = (ax, ay, s, far) => {
    const fs = b.foot, kind = (P.shoes || {}).kind || 'trainer', Sf = pts => pts.map(([a, c, cr]) => [a * fs * u, c * fs * u, cr]);
    const col = far ? mixCol(C.shoe, NOIR.ink, .2) : C.shoe;
    push(); translate(ax * u, ay * u); scale(q ? 1 : s, 1);
    if (kind === 'point') {
      piece(ppShape(Sf([[-.62, .3], [-.32, .3], [-.36, .62], [-.58, .62]]), 3), C.sole, { sw: sw * .8, key: k('heel' + s), lift });
      piece(ppShape(Sf([[-.62, -.28], [.2, -.32], [.95, .08], [1.62, .42, 1], [.75, .5], [-.35, .46], [-.66, .12]]), 4), col, { sw, shade: NOIR.ink, depth: .18 * u, key: k('shoe' + s), lift });
      dline(Sf([[.05, -.1], [.45, .05]]), sw * .5, NOIR.light, .5);
    } else if (kind === 'boot' || kind === 'chunky') {
      const ch = kind === 'chunky';
      piece(ppShape(Sf([[-.9, .3], [1.25, .28], [1.18, .62, 1], [-.85, .62, 1]]), 3), C.sole, { sw: sw * .8, key: k('sole' + s), lift });
      piece(ppShape(Sf(ch ? [[-.62, -.95], [.3, -.95], [.4, -.3], [1.05, -.16], [1.36, .18], [1.2, .42], [-.82, .42], [-.86, -.05]] : [[-.55, -1.0], [.3, -1.0], [.36, -.3], [1.0, -.1], [1.25, .22], [1.08, .4], [-.8, .4], [-.78, -.05]]), 4), col, { sw, shade: NOIR.ink, depth: .22 * u, key: k('shoe' + s), lift });
      if (ch) { for (let i = 0; i < 3; i++) dline(Sf([[.12 + i * .2, -.72 + i * .18], [.34 + i * .2, -.62 + i * .18]]), sw * .6, C.shoeLt || NOIR.light, .3); dline(Sf([[-.8, .3], [1.2, .28]]), sw * .45, C.shoeLt || '#D8C890', 0); }
      else dline(Sf([[-.45, -.9], [-.4, -.2]]), sw * .5, NOIR.light, .3);
    } else {
      piece(ppShape(Sf([[-.8, -.36], [.25, -.46], [1.05, -.12], [1.22, .26], [1.04, .46], [-.9, .46], [-1.02, .1]]), 5), col, { sw, shade: mixCol(col, NOIR.ink, .45), depth: .25 * u, key: k('shoe' + s), lift });
      if (C.shoeLt) dline(Sf([[-.62, .12], [-.1, -.04], [.45, .16]]), sw * 1.1, C.shoeLt, .5);
      piece(ppShape(Sf([[-1.0, .3], [1.18, .26], [1.06, .62, 1], [-.92, .62, 1]]), 3), C.sole, { sw: sw * .8, key: k('sole' + s), lift: 2 });
      dline(Sf([[-.15, -.36], [.5, -.18]]), sw * .6, NOIR.light, .5);
    }
    pop();
  };
  const legs = () => {
    if (o.legs === false) return;
    const lc = C.trousers, ldk = C.trousersDk || mixCol(lc, NOIR.ink, .3), w0 = b.legW * u, w1 = (b.legW1 ?? b.legW * .85) * u;
    for (const s of (q ? [1, -1] : [-1, 1])) {
      rs('leg' + s);
      const far = q && s > 0, col = far ? ldk : lc, g = b.legGap, stn = b.stance ?? .25;
      const hip = [xq(s * g * (q ? .75 : 1), yh), yh - .35];
      let P3;
      if (o.seated) {
        if (q) {   // thigh forward, shin down
          const kx = hip[0] + b.leg * .55, knee = [kx, yh + .15], ank = [kx + .15 + (far ? .35 : 0), ya];
          limb(S([hip, [lerp(hip[0], kx, .5), yh + .05], knee]), w0, w0 * .95, col, { sw, shade: ldk, key: k('thigh' + s) });
          P3 = [[knee[0] - .1, knee[1] - .1], [lerp(knee[0], ank[0], .5) + .05, lerp(knee[1], ank[1], .5)], ank];
          limb(S(P3), w0 * .95, w1, col, { sw, shade: ldk, key: k('shin' + s) });
          shoe(ank[0], ank[1], s, far);
        } else {   // thighs toward us: the knees stick out under the lap
          const kn = [s * (g + .12), yh + .55], ank = [s * (g + stn * .6), ya];
          limb(S([[kn[0], kn[1] - .2], [kn[0] + s * .05, lerp(kn[1], ank[1], .5)], ank]), w0 * .95, w1, col, { sw, shade: ldk, key: k('shin' + s) });
          piece(ppShape(S([[kn[0] - s * w0 / u * .55, yh - .1], [kn[0] + s * w0 / u * .55, yh - .1], [kn[0] + s * w0 / u * .6, kn[1] + .25], [kn[0], kn[1] + .45], [kn[0] - s * w0 / u * .6, kn[1] + .25]]), 4), col, { sw, shade: ldk, depth: .2 * u, key: k('knee' + s), lift });
          shoe(ank[0], ank[1], s, far);
        }
        continue;
      }
      let ank, dir = null;
      if (walking && q) {
        const p = frac(o.walk + (s > 0 ? .5 : 0)), A = (b.stride ?? .32) * b.leg;
        const fx = p < .5 ? lerp(A, -A, p * 2) : lerp(-A, A, ease((p - .5) * 2)), lf = p < .5 ? 0 : Math.sin((p - .5) * 2 * Math.PI) * .12 * b.leg;
        ank = [hip[0] + .25 + fx, ya - lf]; dir = [1, 0];
      } else if (walking) {
        const lf = Math.max(0, Math.sin(wph + (s > 0 ? Math.PI : 0))) * .1 * b.leg;
        ank = [s * (g + stn) + (q ? QS + .1 : 0), ya - lf];
      } else ank = [s * (g + stn) * (q ? .8 : 1) + QS + (q ? .1 : 0), ya];
      P3 = dir ? ppReach(hip, ank, b.leg + .35, .1, s, dir) : [hip, [lerp(hip[0], ank[0], .5) + s * .1 * (q ? 0 : 1), lerp(hip[1], ank[1], .5)], ank];
      limb(S(P3), w0, w1, col, { sw, shade: ldk, key: k('leg' + s) });
      shoe(P3[2][0], P3[2][1], s, far);
    }
    if ((P.legs || {}).kind === 'skirt') {   // an A-line skirt over the legs, from the hips to about the knee
      rs('skirt'); const sk = P.legs, w0s = b.legGap + b.legW * .7, len = (sk.len ?? .5) * b.leg, w1s = w0s + (sk.flare ?? .7), y0 = yh - .5;
      piece(ppShape(Q([[w0s * .9, y0, 1], [w1s, yh + len, 1], [0, yh + len + .12], [-w1s, yh + len, 1], [-w0s * .9, y0, 1]]), 4).map(p => [p[0] * u, p[1] * u]), C.skirt, { sw, shade: C.skirtDk || mixCol(C.skirt, NOIR.ink, .3), depth: .3 * u, key: k('skirt'), lift });
      for (const fr of [-.45, .1, .6]) { const a0 = [sx(fr * .6, yh), yh + .2], a1 = [q ? QS + w1s * fr * .9 : w1s * fr, yh + len - .1]; dline(S([a0, a1]), sw * .5, C.skirtDk || NOIR.ink, 0); }
    }
  };

  // ---- behind the body: long hair, back arms, pack, legs ----
  const hairStyle = hr.style || 'bald';
  if (hairStyle === 'long') longBack();
  arm(-1, false); arm(1, false);
  if (q && ex.pack) { rs('pack'); const px = xq(-shX, ys) - .2; piece(curvy(S([[px - .85, ys + .1], [px + .9, ys - .05], [px + 1.0, ys + b.torso * .78], [px - .8, ys + b.torso * .8]]), 3), C.pack, { sw, shade: C.packDk, depth: .5 * u, key: k('pack'), lift }); }
  legs();

  // ---- the top: silhouette, details, collar ----
  rs('coat');
  let O = ppShape(Q(ppMirror(TR)), 6);
  if (tp.quilt) {   // puffer: the sides bulge between the channels
    const ch = tp.quilt, xc = q ? QS + lean(ys) : 0;
    O = O.map(([a, c]) => { const w = Math.abs(a - xc), ww = wAt(c) || 1, e = clamp((w / ww - .55) * 2.2); const bump = (Math.sqrt(Math.abs(Math.sin(Math.PI * (c - ys - .2) / ch))) - .55) * .22 * e; return [a + Math.sign(a - xc) * bump, c]; });
  }
  knock(S(O)); piece(S(O), C.coat, { sw: sw * 1.15, shade: C.coatDk, depth: .8 * u, key: k('torso'), lift });
  const hemY = ys + hemDy, band = tp.band || 0;
  if (band) {   // hem band
    const yb = hemY - band, arcB = ppArc(O, yb, false);
    const topEdge = through([[xq(wAt(yb) * .99, yb), yb], [q ? sx(0, yb) : 0, yb + hemC * .9], [xq(-wAt(yb) * .99, yb), yb]], 8);
    if (arcB.length > 2) piece(S(arcB.concat(topEdge.slice(1, -1).reverse())), C.coatDk, { sw, key: k('band'), lift: 2 });
  }
  const kind = tp.kind || 'parka', op = tp.open ?? 0;
  const lineDown = (fr, d0, d1, wgt = .7) => dline(S([TS(fr, d0), TS(fr, lerp(d0, d1, .5)), TS(fr, d1)]).map((p, i) => i === 2 ? [p[0], p[1] + (fr === 0 ? hemC * u * .8 : 0)] : p), sw * wgt, NOIR.ink, .5);
  if (tp.quilt) for (let dd = tp.quilt; dd < hemDy - band - .2; dd += tp.quilt) {
    const pts = []; for (let i = 0; i <= 8; i++) { const fr = -.97 + i / 8 * 1.94; pts.push([sx(fr, ys + dd) , ys + dd + .16 * Math.cos(fr * Math.PI / 2)]); }
    dline(S(pts), sw * .65, mixCol(C.coatDk, NOIR.ink, .3), .5);
  }
  if (kind === 'parka' || kind === 'puffer' || kind === 'boxy') {
    lineDown(0, .25, hemDy - .05, .7);
    if (kind === 'boxy') {   // storm flap, big patch pockets, chest pockets
      const fw = .16; piece(S([TS(-fw, .15), TS(fw, .15), TS(fw, hemDy - band), TS(-fw, hemDy - band)]), C.coatLt, { sw: sw * .7, key: k('flap'), lift: 2, flatCard: true });
      for (let dd = .7; dd < hemDy - band - .3; dd += .9) piece(oval(...S([TS(0, dd)])[0], .09 * u, .09 * u, 0, 10), C.coatDk, { ink: null, key: k('snap' + dd), lift: 0, flatCard: true });
      for (const s of [-1, 1]) { if (q && s > 0) continue;
        const pk = [TS(s * .3, b.torso * .62), TS(s * .82, b.torso * .62), TS(s * .82, hemDy - band - .15), TS(s * .3, hemDy - band - .15)];
        piece(S(pk), C.coat, { sw: sw * .8, shade: C.coatDk, depth: .15 * u, key: k('pk' + s), lift: 2 });
        piece(S([TS(s * .27, b.torso * .6), TS(s * .85, b.torso * .6), TS(s * .85, b.torso * .6 + .55), TS(s * .27, b.torso * .6 + .55)]), C.coatDk, { sw: sw * .8, key: k('pkf' + s), lift: 2 });
        piece(S([TS(s * .35, 1.15), TS(s * .72, 1.15), TS(s * .72, 1.6), TS(s * .35, 1.6)]), C.coatDk, { sw: sw * .7, key: k('cpk' + s), lift: 1 });
      }
    } else {
      for (const s of [-1, 1]) { if (q && s > 0) continue; const dd = b.torso * .74; dline(S([TS(s * .3, dd), TS(s * .55, dd - .06), TS(s * .8, dd)]), sw * .7, NOIR.ink, .5); }
    }
    if (band) for (const s of [-1, 1]) { const tx = TS(s * .14, hemDy); dline(S([[tx[0], tx[1] - band * .6], [tx[0] + s * .04, tx[1] + .3]]), sw * .6, NOIR.ink); piece(oval(tx[0] * u + s * .04 * u, (tx[1] + .38) * u, .1 * u, .14 * u, 0, 10), C.sole || NOIR.cream, { sw: sw * .5, key: k('tog' + s), lift: 2, flatCard: true }); }
  } else if (kind === 'coat') {
    const vD = tp.vDepth ?? 1.4;
    lineDown(op, vD, hemDy - .05, .75);
    if (tp.belt != null && !o.seated) {
      const by = tp.belt, pts = [TS(-1.02, by - .28), TS(1.02, by - .28), TS(1.02, by + .28), TS(-1.02, by + .28)];
      piece(S(ppShape(pts.map(p => [p[0], p[1]]), 2)), C.coatDk, { sw: sw * .8, key: k('belt'), lift: 2 });
      const bk = TS(op, by); piece(curvy(S([[bk[0] - .32, bk[1] - .36], [bk[0] + .32, bk[1] - .36], [bk[0] + .32, bk[1] + .36], [bk[0] - .32, bk[1] + .36]]), 2), C.coatDk, { sw: sw * .8, key: k('buckle'), lift: 2 });
      dline(S([[bk[0] - .1, bk[1] + .02], [bk[0] + .5, bk[1] + .9]]), sw * 1.2, C.coatDk, .5);
    }
    for (const [fr, dd] of tp.buttons || []) { if (dd > hemDy - .2) continue; const bp = TS(fr, dd); piece(oval(bp[0] * u, bp[1] * u, .17 * u, .17 * u, 0, 12), C.button || C.coatDk, { sw: sw * .5, key: k('btn' + fr + dd), lift: 1, flatCard: true }); }
    for (const s of [-1, 1]) { if (q && s > 0) continue; const dd = tp.pocket ?? b.torso * .9; if (dd < hemDy - .3) dline(S([TS(s * .45, dd - .35), TS(s * .72, dd + .1)]), sw * .8, NOIR.ink, .3); }
  } else {   // hoodie / jumper: ribbed hem, a kangaroo pocket on hoodies
    if (kind === 'hoodie') { const pk = [TS(-.55, b.torso * .6), TS(.55, b.torso * .6), TS(.72, hemDy - band - .1), TS(-.72, hemDy - band - .1)]; piece(S(ppShape(pk.map(p => [p[0], p[1]]), 2)), C.coat, { sw: sw * .8, shade: C.coatDk, depth: .1 * u, key: k('kanga'), lift: 1 }); }
    if (tp.stripe) piece(S([TS(-1.02, tp.stripe), TS(1.02, tp.stripe), TS(1.02, tp.stripe + .5), TS(-1.02, tp.stripe + .5)]), C.coatLt, { sw: sw * .6, key: k('stripe'), lift: 1, flatCard: true });
  }

  // under layer in a coat's V, the neck, then the collar
  const nw = hw * (hd.neck ?? .42), cx = q ? QS + lean(ys) + .22 : 0;
  const collar = tp.collar || 'ruff';
  if (collar === 'lapel' || collar === 'round') {
    rs('under'); const vD = tp.vDepth ?? 1.4;
    piece(S([[cx - nw * 1.25, ys - .12], [cx + nw * 1.25, ys - .12], [sx(op, ys + vD), ys + vD]]), C.under, { sw: sw * .8, key: k('under'), lift: 1 });
  }
  if (collar === 'funnel') { rs('funnel'); piece(ppShape(S([[cx - nw * 1.45, ys + .25, 1], [cx + nw * 1.45, ys + .25, 1], [cx + nw * 1.18, ys - 1.0, 1], [cx - nw * 1.18, ys - 1.0, 1]]), 3), C.coatDk, { sw, key: k('funnelB'), lift: 2 }); }
  if (collar === 'lapel') {
    rs('collarB');
    if (tp.popped) for (const s of [-1, 1]) piece(ppShape(S([[cx + s * nw * 1.0, ys + .15, 1], [cx + s * nw * 1.12, ys - 1.05, 1], [cx + s * nw * 2.55, ys - .4, 1], [cx + s * nw * 2.5, ys + .3, 1]]), 3), C.coatDk, { sw: sw * .8, shade: mixCol(C.coatDk, NOIR.ink, .3), depth: .15 * u, key: k('pop' + s), lift: 2 });
    else piece(ppShape(S([[cx - nw * 1.6, ys - .05, 1], [cx - nw * 1.35, ys - .5, 1], [cx + nw * 1.35, ys - .5, 1], [cx + nw * 1.6, ys - .05, 1], [cx, ys - .2]]), 3), C.coatDk, { sw: sw * .8, key: k('collarB'), lift: 1 });
  }
  if (collar === 'hood') { rs('hood'); piece(curvy(S([[cx - nw * 2.6, ys + .35], [cx - nw * 1.6, ys - .75], [cx + nw * 1.6, ys - .75], [cx + nw * 2.6, ys + .35], [cx, ys + .85]]), 5), C.coatDk, { sw, key: k('hoodB'), lift: 2 }); }
  rs('neck');
  piece(ppShape(S([[hx - nw, yc - .6], [hx + nw, yc - .6], [cx + nw * 1.05, ys + .3], [cx - nw * 1.05, ys + .3]]), 2), C.skinDk, { sw, key: k('neck'), lift: 2, maxTone: .45 });
  if (collar === 'ruff') {
    rs('ruff'); const [rx, ry, rdy] = tp.ruff || [2.0, .78, 0], rcx = q ? QS * .8 + lean(ys) : 0, R = [];
    for (let i = 0; i < 48; i++) { const a = i / 48 * TAU, r = 1 + .075 * Math.sin(a * 13) ** 2; R.push([rcx + Math.cos(a) * rx * r, ys + rdy + Math.sin(a) * ry * r]); }
    knock(S(R)); piece(S(R), C.fur, { sw, shade: C.furDk, depth: .35 * u, key: k('ruff'), lift });
    for (let i = 0; i < 9; i++) { const a = Math.PI * (.12 + i * .095), fx0 = rcx + Math.cos(a) * rx * .78, fy0 = ys + rdy + Math.sin(a) * ry * .62; dline(S([[fx0, fy0 - .1], [fx0 + .06, fy0 + .12]]), sw * .5, C.furDk); }
  } else if (collar === 'lapel') {
    rs('lapel'); const vD = tp.vDepth ?? 1.4, vb = [sx(op, ys + vD), ys + vD];
    for (const s of [-1, 1]) {
      if (q && s > 0) { piece(ppShape(S([[cx + nw * 1.2, ys - .15, 1], [vb[0] + .05, vb[1], 1], [vb[0] + .35, vb[1] - .9]]), 3), C.coatDk, { sw: sw * .8, key: k('lap' + s), lift: 2 }); continue; }
      const ox = xq(s * (tp.neck ?? .9) * 1.9, ys + .9);
      piece(ppShape(S([[cx + s * nw * 1.2, ys - .2, 1], [cx + s * nw * 2.3, ys + .1, 1], [ox, ys + .75, 1], [ox + s * -.1, ys + 1.05, 1], [vb[0], vb[1], 1]]), 3), C.coatDk, { sw: sw * .8, key: k('lap' + s), lift: 2 });
    }
  } else if (collar === 'round') {
    rs('collar'); const cc = C.collar || C.coatLt;
    for (const s of [-1, 1]) {
      if (q && s > 0) { piece(curvy(S([[cx + .1, ys - .2], [cx + nw * 1.9, ys + .05], [cx + nw * 1.7, ys + .75], [cx + .25, ys + .9]]), 5), cc, { sw: sw * .8, shade: mixCol(cc, NOIR.ink, .25), depth: .12 * u, key: k('col' + s), lift: 2 }); continue; }
      const ww = (tp.collarW ?? 1.7) * (q ? 1.1 : 1);
      piece(curvy(S([[cx + s * .05, ys - .25], [cx + s * nw * 1.3, ys - .3], [cx + s * ww, ys + .05], [cx + s * ww * 1.02, ys + .7], [cx + s * ww * .6, ys + 1.12], [cx + s * .1, ys + .95]]), 5), cc, { sw: sw * .8, shade: mixCol(cc, NOIR.ink, .25), depth: .15 * u, key: k('col' + s), lift: 2 });
    }
  } else if (collar === 'funnel') {
    piece(ppShape(S([[cx - nw * 1.45, ys + .25, 1], [cx + nw * 1.45, ys + .25, 1], [cx + nw * 1.25, ys - .45, 1], [cx - nw * 1.25, ys - .45, 1]]), 3), C.coat, { sw, shade: C.coatDk, depth: .2 * u, key: k('funnelF'), lift: 2 });
    dline(S([[cx - nw * 1.2, ys - .12], [cx, ys - .05], [cx + nw * 1.2, ys - .12]]), sw * .6, C.coatDk, .5);
  } else if (collar === 'crew') {
    piece(curvy(S([[cx - nw * 1.5, ys - .15], [cx + nw * 1.5, ys - .15], [cx + nw * 1.2, ys + .35], [cx, ys + .45], [cx - nw * 1.2, ys + .35]]), 4), C.coatDk, { sw: sw * .8, key: k('crew'), lift: 1 });
  } else if (collar === 'hood') {
    for (const s of [-1, 1]) { if (q && s > 0) continue; const dx0 = cx + s * nw * .9; dline(S([[dx0, ys + .2], [dx0 + s * .05, ys + 1.4]]), sw * .8, C.under || NOIR.cream, .3); }
  }
  // scarf: wrapped at the neck, two ends hanging down the front
  if (ex.scarf) {
    rs('scarf'); const scC = C.scarf, scD = C.scarfDk, sL = Math.min(ex.scarf.len ?? 5, o.seated ? seatCut - .5 : Infinity), ww = ex.scarf.w ?? .75;   // (seated: it ends on the lap)
    const endA = [[cx - .25, ys + .1], [cx - .35 + (q ? .15 : 0), ys + sL * .55], [cx - .3 + (q ? .2 : 0), ys + sL]];
    const endB = [[cx + .4, ys + .2], [cx + .55, ys + sL * .4], [cx + .6, ys + sL * .7]];
    for (const [E, kk] of [[endB, 'b'], [endA, 'a']]) {
      const r = ribbon(S(E), ww * u, ww * .95 * u); knock(r);
      piece(r, scC, { sw, shade: scD, depth: .15 * u, key: k('scarf' + kk), lift });
      const e = E[2], e1 = E[1], ang = Math.atan2(e[1] - e1[1], e[0] - e1[0]), nx = -Math.sin(ang), ny = Math.cos(ang);
      for (let i = 0; i < 3; i++) { const t0 = .55 + i * .12, px = lerp(e1[0], e[0], t0), py = lerp(e1[1], e[1], t0); piece(ppBar(S([[px - nx * ww * .5, py - ny * ww * .5]])[0], S([[px + nx * ww * .5, py + ny * ww * .5]])[0], .13 * u), i === 1 ? (C.scarfLt || scD) : scD, { ink: null, key: k('ss' + kk + i), lift: 0, flatCard: true }); }
      for (let i = 0; i < 4; i++) { const fx0 = e[0] + nx * ww * (i / 3 - .5) * .9, fy0 = e[1] + ny * ww * (i / 3 - .5) * .9; dline(S([[fx0, fy0], [fx0 + Math.cos(ang) * .35, fy0 + Math.sin(ang) * .35]]), sw * .7, scD); }
    }
    piece(curvy(S([[cx - nw * 1.9, ys - .45], [cx + nw * 1.9, ys - .45], [cx + nw * 2.1, ys + .25], [cx, ys + .5], [cx - nw * 2.1, ys + .25]]), 4), scC, { sw, shade: scD, depth: .2 * u, key: k('scarfW'), lift });
    for (let i = 0; i < 4; i++) dline(S([[cx - nw * 1.6 + i * nw * 1.05, ys - .3], [cx - nw * 1.5 + i * nw * 1.05, ys + .25]]), sw * .5, scD, .3);
  }

  // ---- the head ----
  push(); translate(hx * u, (yc - .3) * u); rotate((o.tilt || 0) + life.tilt + rot * -.4); translate(-hx * u, -(yc - .3) * u);
  // across the face in 3/4: a point fr (-1..1, front view) on a face that's flatter than a ball, turned by PP_HPSI
  const FX = fr => q ? Math.sin(Math.asin(clamp(fr, -1, 1)) * .8 + PP_HPSI) * .85 : fr;
  const HP = ([a, c, cr]) => [hx + a * hw, hy + c * hh, cr];
  const R0 = [[0, -1], [hd.crown * .62, -.93], [hd.crown * .95, -.55], [hd.cheek ?? 1, hd.cheekY ?? 0, hd.cheekC ? 1 : 0], [hd.jaw, hd.jawY ?? .55, hd.jawC ? 1 : 0], [hd.chin, .93, hd.chinC ? 1 : 0], [0, 1]];
  let HR, farP = R0;
  if (!q) HR = ppMirror(R0);
  else {
    // 3/4 (facing right): the head turns. The far side is the face's profile: temple, the brow ridge, a dip at the eye
    // socket, the cheekbone, then the cheek falls in to a chin that has swung round under the mouth. The near side is
    // the back of the skull, then the near jaw running from below the ear forward to the chin.
    const W0 = y2 => ppWidthAt(R0, y2), fc = FX(0), ch = hd.chin, eY = f.eyeY, nY2 = f.noseY, jY = hd.jawY ?? .55, cC = hd.cheekC ? 1 : 0;
    const chinX = Math.min(fc + ch * .85, W0(nY2) - .1);
    const far = [
      [.05, -1], [W0(-.93) * .98 + .04, -.93], [W0(-.55) + .05, -.55],
      [W0(eY - .26) + .05, eY - .26],                          // brow ridge
      [W0(eY + .04) - .02, eY + .04],                          // eye socket
      [W0(nY2 - .02) + .05, nY2 - .02, cC],                    // cheekbone
      [lerp(W0(nY2 - .02) + .05, chinX, .38) + .03, lerp(nY2, .87, .5)],   // the far cheek, sweeping down
      [chinX, .87, hd.chinC || hd.jawC ? 1 : 0],               // to the chin, swung round under the mouth
      [fc + ch * .2, 1],
    ];
    const near = [
      [fc - ch * .6, .97],
      [-W0(jY) * .68 + .05, jY + .12, hd.jawC ? 1 : 0],        // the near jaw's corner
      [-W0(.3) * .96, .3],                                     // below the ear
      [-W0(-.05) * 1.04 - .02, -.05],                          // back of the skull
      [-W0(-.55) * 1.06 - .02, -.55], [-W0(-.93) * 1.02, -.93],
    ];
    farP = far; HR = far.concat(near);
  }
  // the jaw: an open mouth's lower lip and jaw carry the opening (mouths.js lipDrop: how far below the lip line the lower
  // lip reaches, in mouth widths). The chin drops by what that needs past the room under the resting mouth: a low mouth
  // (his) opens by dropping the jaw; a face with room to spare (hers) keeps its chin. Card keeps the head's own piece (its
  // cut never changes) and lays the dropped jaw over it as a second piece (below); the other looks reshape the head.
  const mW0 = (f.mouthW ?? .55) * hw, mY0 = hy + f.mouthY * hh, dr0 = typeof lipDrop === 'function' ? lipDrop('flat') : 0;
  const jd = dr0 ? Math.max(0, (lipDrop(F.mouth) - dr0) * mW0 - Math.max(0, hh * (1 - f.mouthY) - dr0 * mW0 - .3 * mW0)) : 0;
  const jawW = c => ease(clamp((c - f.mouthY + .02) / .18)), HRj = jd > .005 ? HR.map(([a, c, cr]) => [a, c + jd / hh * jawW(c), cr]) : HR;
  const jawCard = STYLE.card && jd > .005, headO = ppShape((jawCard ? HR : HRj).map(HP), 6), headJ = jd > .005 ? ppShape(HRj.map(HP), 6) : headO;
  const farAt = c => ppWidthAt(farP, c);   // the far silhouette (front: the side) at height c, in head half-widths from hx
  const eyeY = hy + f.eyeY * hh;
  // The nose's size and place, settled before anything that lines up with it. A cartoon ball nose (a tip over two nostril
  // wings), always between the eye line and the mouth, whatever the preset asks. In 3/4 its root is on the turned centre
  // line and the tip is pushed toward the far cheek, but kept inside the silhouette (no tangent with it).
  const NK = PP_NOSE[f.nose.kind || 'broad'] || PP_NOSE.broad, nsw = f.nose.w ?? 1, nxc = hx + FX(0) * hw;
  const tw = NK.tw * nsw * hw, th = NK.th * hw, wr = NK.wr * nsw * hw, wx = NK.wx * nsw * hw, wy = NK.wy * hw, nlen = NK.len * (f.nose.len ?? 1) * hh;
  const eyeRy = f.eye * hw * .58 * (f.tall ?? 1), mouthC = hy + f.mouthY * hh;
  const nY = clamp(hy + f.noseY * hh, eyeY + eyeRy * .62 + th, mouthC - .1 * hh - wy - wr * .85);
  const tx = q ? Math.min(nxc + (f.nose.q ?? .28) * hw * .75, hx + (farAt((nY - hy) / hh) - .14) * hw - tw) : nxc;
  const nBot = nY + Math.max(th, wy + wr * .85);
  // the mouth sits on the centre line under the nose (in 3/4 a little toward the far side, where the muzzle turns)
  const mX = q ? lerp(nxc, tx, .5) : hx, mY = hy + f.mouthY * hh;
  const earY = lerp(eyeY, nY, .52);   // ears span the eye line to the nose

  // hair behind the head (bun, puff, afro mass, bob), then the ears and the head
  rs('hairB');
  const bn = hr.bun || {}, bunC = [hx + (bn.x ?? 0) * hw - (q ? .25 * hw : 0), hy + (bn.y ?? -1.3) * hh], bunR = (bn.r ?? 1) * hw;
  if (hairStyle === 'bun') {
    if (hr.puff) piece(ppScallop(hx * u - (q ? .12 * hw * u : 0), (hy - .3 * hh) * u, hw * (1 + hr.puff * .22) * u, hh * .78 * u, 11, .1, -.3), C.hair, { sw, key: k('puff'), lift });
    bunDraw();
  }
  if (hairStyle === 'afro') piece(S(ppScallop(hx - (q ? .12 * hw : 0), hy - .28 * hh, hw * 1.32, hh * 1.0, 15, .09, .2)), C.hair, { sw, shade: C.hairDk || mixCol(C.hair, NOIR.ink, .3), depth: .4 * u, key: k('afro'), lift });
  if (hairStyle === 'bob') piece(ppShape(S([[hx, hy - 1.1 * hh], [hx + 1.02 * hw, hy - .7 * hh], [hx + 1.16 * hw, hy + .1 * hh], [hx + 1.12 * hw, hy + .78 * hh, 1], [hx + .6 * hw, hy + .7 * hh], [hx - .6 * hw, hy + .7 * hh], [hx - 1.12 * hw, hy + .78 * hh, 1], [hx - 1.16 * hw, hy + .1 * hh], [hx - 1.02 * hw, hy - .7 * hh]]), 5), C.hair, { sw, key: k('bobB'), lift });
  const earS = f.ear ?? 1;
  // an ear: a C of skin, broad at the top and narrowing to the lobe, with the rim's inner curve (the helix) and a hint
  // of the bowl. side -1 = the screen-left ear. In 3/4 the near ear sits on the side of the head, its bowl toward us.
  const ears = earXs => { for (const ex1 of earXs) {
    const side = Math.sign(ex1), exx = q ? hx + ex1 * hw : hx + side * (farAt((earY - hy) / hh) * hw + .36 * earS * .22);   // (front: most of the ear outside the head, or the head's outline swallows it)
    if (hairStyle === 'bob' || hairStyle === 'long') continue;
    const eS = earS * (q ? .9 : 1), eh = .58 * eS, ew2 = .36 * eS, sd = q ? -1 : side;   // sd: the ear's outer (back) side
    const E = ppShape([[0, -eh], [sd * ew2 * .95, -eh * .72], [sd * ew2 * 1.05, -eh * .1], [sd * ew2 * .7, eh * .55], [sd * ew2 * .15, eh], [-sd * ew2 * .45, eh * .82], [-sd * ew2 * .62, eh * .2], [-sd * ew2 * .7, -eh * .5]].map(([a, c]) => [exx + a, earY + c]), 5);
    piece(S(E), C.skin, { sw: sw * .85, shade: C.skinDk, depth: .12 * u, key: k('ear' + ex1), lift: 2, maxTone: .45 });
    dline(S([[exx - sd * ew2 * .15, earY - eh * .62], [exx + sd * ew2 * .55, earY - eh * .45], [exx + sd * ew2 * .62, earY + eh * .05], [exx + sd * ew2 * .25, earY + eh * .45]]), sw * .55, mixCol(C.skinDk, NOIR.ink, .25), .5);
    dline(S([[exx - sd * ew2 * .05, earY - eh * .15], [exx + sd * ew2 * .12, earY + eh * .08], [exx - sd * ew2 * .05, earY + eh * .3]]), sw * .45, C.skinDk, .5);
    if (f.hoops) piece(ppRing(exx * u, (earY + eh * 1.24) * u, .26 * u, .3 * u, .1 * u, -Math.PI / 2), f.hoops, { sw: sw * .25, key: k('hoop' + ex1), lift: 2, flatCard: true });
    if (ex.buds) { const bx = exx + side * .02; piece(curvy(S([[bx - .09, earY - .05], [bx + .09, earY - .05], [bx + .08, earY + .75], [bx - .08, earY + .75]]), 2), '#F2EEE6', { sw: sw * .5, key: k('bud' + ex1), lift: 2, flatCard: true }); piece(oval(bx * u, (earY - .08) * u, .15 * u, .15 * u, 0, 10), '#F2EEE6', { sw: sw * .5, key: k('budh' + ex1), lift: 2, flatCard: true }); }
  } };
  // in 3/4 the near ear goes over the hair at the back of the head (bun hair covers the back of the skull)
  const earQ = -.52, earLate = q && (hairStyle === 'bun' || (hr.hat === 'beanie' && hairStyle === 'crop'));
  rs('ears'); if (!q) ears([-1, 1]);
  rs('head');
  // (card, the jaw dropped: the jaw piece is the dropped head below the mouth line; its shadow goes under the head)
  const jawCut = [[-1e5, (mY0 - .03 * hh) * u], [1e5, (mY0 - .03 * hh) * u], [1e5, 1e5], [-1e5, 1e5]], jawP = jawCard ? clipConvex(S(headJ), jawCut) : null;
  if (jawCard && jawP.length > 2) paint(shiftP(jawP, lift * .8 * XF, lift), { wash: '#120E12', washOp: 80, ink: null });
  knock(S(headO)); piece(S(headO), C.skin, { sw: sw * 1.15, shade: C.skinDk, depth: (q ? .32 : .5) * u, key: k('head'), lift, maxTone: .45 });
  if (jawCard && jawP.length > 2) {   // the same card as the head (its fibres line up across the join), and the head's shade carried on down it
    piece(jawP, C.skin, { ink: null, key: k('head'), lift: 0, edge: false, texFrame: [...centroid(scissor(S(headO), k('head'))), 0] });
    const Cr = crescent(S(headJ), (q ? .32 : .5) * u * .8), Cc = Cr ? clipConvex(Cr, jawCut) : [];
    if (Cc.length > 2) paint(Cc, { wash: C.skinDk, washOp: 120, ink: null });
  }
  rs('ears'); if (q && !earLate) ears([earQ]);

  // beard
  const beard = f.beard || 'none';
  let tache = null;   // (the moustache's settings: it is drawn with the mouth, below)
  if (beard !== 'none') {
    rs('beard');
    const ybB = hy + (f.eyeY + .12) * hh, arcB = ppResample(ppArc(headJ, ybB, false).filter(p => !q || p[0] > hx - .36 * hw), 40), c0 = [q ? mX : hx, hy + .15 * hh];
    const vol = { full: .13, box: .06, chin: .015, stubble: 0, tache: 0 }[beard] ?? .05, thk = { full: [.13, .5], box: [.11, .36], chin: [.06, .16], stubble: [.14, .42] }[beard] || [0, 0];
    if (thk[1] > 0) {
      const outer = arcB.map(([a, c], i) => { const t = i / (arcB.length - 1), bell = Math.sin(Math.PI * t); return [c0[0] + (a - c0[0]) * (1 + vol * bell * (beard === 'box' ? 1.5 : 1)), c + vol * bell * hh * (beard === 'full' ? .9 : beard === 'box' ? .35 : .3)]; });
      if (beard === 'box') { const yb2 = hy + .98 * hh; for (const p of outer) if (p[1] > yb2) p[1] = lerp(p[1], yb2, .75); }
      const inner = arcB.map(([a, c], i) => { const t = i / (arcB.length - 1), bell = Math.pow(Math.sin(Math.PI * t), 1.4), th2 = lerp(thk[0], thk[1], bell) * hh; const dx = c0[0] - a, dy = c0[1] - c, d = Math.hypot(dx, dy) || 1; return [a + dx / d * th2, c + dy / d * th2]; }).reverse();
      const shape = outer.concat(inner);
      if (beard === 'stubble') {   // a shadow of stubble (a light tint; hatched lightly in engrave), plus a few flecks
        if (STYLE.mode !== 'doodle') piece(S(shape), C.beard, { ink: null, op: STYLE.mode === 'flip' ? 45 : 70, maxTone: .22, key: k('stub'), lift: 0, flatCard: true, edge: false });
        for (let i = 1; i < arcB.length - 1; i += 2) { const p = arcB[i], d = [c0[0] - p[0], c0[1] - p[1]], L1 = Math.hypot(...d) || 1, m = [p[0] + d[0] / L1 * (.1 + .2 * hash(i)) * hh, p[1] + d[1] / L1 * (.1 + .2 * hash(i)) * hh]; if (m[1] < nBot + .05 * hh) continue; dline(S([[m[0], m[1]], [m[0] + .02, m[1] + .06]]), sw * .4, C.beardLt || C.hairLt); }
      }
      else {
        piece(S(shape), C.beard, { ink: beard === 'full' || beard === 'box' ? undefined : null, sw: sw * .9, key: k('beard'), lift: beard === 'full' ? 2 : 0, flatCard: true });
        for (let i = 2; i < arcB.length - 2; i += 3) { const p = arcB[i], d = [c0[0] - p[0], c0[1] - p[1]], L1 = Math.hypot(...d) || 1; const m = [p[0] + d[0] / L1 * .25 * hh, p[1] + d[1] / L1 * .25 * hh]; dline(S([[m[0], m[1]], [m[0] + .04, m[1] + .14]]), sw * .45, C.beardLt || C.hairLt); }
      }
    }
    if (beard !== 'stubble') {
      // the moustache: from tucked under the nose down over the whole upper lip, as wide as the mouth and a little more. It is
      // drawn with the mouth (mouths.js lipTache): it sits on the upper lip, lifts with it, and the mouth opens below it
      // (its depth: up to the nose, but no deeper than a third of the mouth's width: under a high nose it sits on the lip
      // with skin above it, never a block filling the gap)
      if (typeof lipTache === 'function') tache = { col: C.beard, lt: C.beardLt || C.hairLt, h: Math.min((mY - nBot + .03 * hh) / .8, (f.mouthW ?? .55) * hw * .36) * u, w: (f.mouthW ?? .55) * hw * .54 * u };
      else {   // (pages without mouths.js: the old one, resting on the upper lip)
        const my = lerp(nBot, mY, .58), mw = (f.mouthW ?? .55) * hw * .52, fr = q ? .62 : 1, mh = Math.min(.17, (mY - nBot) * .5);
        const T = ([a, c]) => [mX + (a > 0 ? a * fr : a) * mw, my + c * mh];
        piece(curvy(S([[-1.04, .72], [-.72, -.35], [-.28, -.95], [0, -.8], [.28, -.95], [.72, -.35], [1.04, .72], [.55, .52], [0, .5], [-.55, .52]].map(T)), 4), C.beard, { ink: null, key: k('tache'), lift: 0, flatCard: true });
      }
      if (beard === 'chin') { const gy = hy + (f.mouthY + .13) * hh + jd; piece(curvy(S([[mX - .1 * hw, gy], [mX + .1 * hw, gy], [mX + .07 * hw, gy + .12 * hh], [mX - .07 * hw, gy + .12 * hh]]), 3), C.beard, { ink: null, key: k('soul'), lift: 0, flatCard: true }); }   // (the soul patch goes down with the jaw)
    }
  }

  // ---- the face ----
  rs('face');
  const look = [clamp(o.lookX || 0, -1, 1), clamp(o.lookY || 0, -1, 1)], ew = f.eye * hw, gap = f.gap;
  // 3/4: the near eye (-x) nearly full size; the far eye is the same eye, a touch smaller (further away) and squeezed
  // across (eyeH's sx), so it keeps its height and both gazes stay parallel; it's kept clear inside the silhouette, with
  // room between the eyes for the bridge of the nose (and of the glasses)
  const eW = f.eye, farK = .9, farSX = .64, nearK = .98, farHW = eW * farK * farSX / 2, farEx = q ? Math.min(FX(gap), farAt(f.eyeY) - farHW - .12) : gap;
  const nearEx = q ? Math.min(FX(-gap), farEx - farHW - .2 - eW * nearK / 2) : -gap;
  const eyes = q ? [[nearEx, nearK, 1], [farEx, farK, farSX]] : [[-gap, 1, 1], [gap, 1, 1]];
  // (a resting lid, f.lid, lowers the lid on the iris; a wide-eyed look lifts it almost clear)
  let Fo = { ...F, open: (F.open ?? 1) >= 1 ? 1 - (f.lid || 0) * .25 : (F.open ?? 1) * (1 - (f.lid || 0)), tall: (F.tall ?? 1) * (f.tall ?? 1), lower: F.lower };
  if (STYLE.card && typeof cardEye === 'function') Fo = cardEye(Fo);   // (card: the eye chart's lid, so the lash flicks sit on it too)
  const browsLate = [], b0 = f.brow0 || [0, 0], browRaise = [(F.brow || [0, 0])[0] + b0[0], (F.brow || [0, 0])[1] + b0[1]];
  eyes.forEach(([exf, sc, esx], i) => {
    const side = i ? 1 : -1, exx = hx + exf * hw;
    eyeH(exx * u, eyeY * u, ew * sc * u, { ...Fo, sx: esx, style: blink ? 'shut' : F.style, look, skin: C.skin, sw, side, iris: (F.iris ?? 1) * (f.irisS ?? 1), irisCol: C.iris, lash: f.lash ?? 1.3, key: k('e' + i) });
    if (f.flicks && !blink && (!F.style || F.style === 'open')) { const lidY = lerp(ew * sc * .58 * .5, -ew * sc * .58, clamp(Fo.open ?? 1)), ox = exx + side * ew * sc * esx * .56; for (let j = 0; j < f.flicks; j++) dline(S([[ox - side * j * .12 * ew * esx, eyeY + lidY * .6 - .02 + j * .05], [ox + side * (.2 - j * .06) * ew * esx, eyeY + lidY * .6 - (.2 - j * .04) * ew]]), sw * .8, NOIR.ink, .3); }
    const drawBrow = () => brow(exx * u, (eyeY - (f.browY ?? .32) * hh) * u, ew * sc * (f.browW ?? 1) * (q ? .92 : 1) * u, browRaise, side, C.brow || C.hair, sw, esx < 1 ? esx * 1.1 : 1);
    if (hr.hat) browsLate.push(drawBrow); else drawBrow();   // under a hat the brows go over its brim, so a raised brow still acts
  });
  // mouth, before the nose (a moustache runs up under it). Card: a replacement piece from the chart (mouths.js), its lower
  // lip and any moustache part of the piece. The other looks: the drawn mouth (a lower lip on a closed one), then the
  // moustache over it. Either way the moustache sits on the upper lip and lifts with it, and the mouth opens below it,
  // the jaw (above) carrying the opening. In 3/4 the far half is foreshortened.
  rs('mouth');
  const mW = (f.mouthW ?? .55) * hw, closed = ['flat', 'smile', 'frown', 'smirk', 'wobble'].includes(F.mouth), mfar = q ? .66 : 1;
  const chart = typeof lipPiece === 'function' && (String(F.mouth).startsWith('lip:') || lipsLive());
  if (f.lips && closed && !chart) { const lw2 = mW * .36 * f.lips, L2 = ([a, c]) => [mX + (a > 0 ? a * mfar : a), c]; piece(curvy(S([[-lw2, mY + .06 * mW], [0, mY + .03 * mW], [lw2, mY + .06 * mW], [lw2 * .7, mY + .24 * mW], [0, mY + .3 * mW], [-lw2 * .7, mY + .24 * mW]].map(L2)), 5), C.lip, { ink: null, key: k('lip'), lift: 0, flatCard: true }); }
  mouthH(mX * u, mY * u, mW * u, F.mouth, { sw, lip: C.lip, lipLt: C.lipLt, lips: f.lips || 0, far: mfar, key: k('m'), tache: chart ? tache : null });
  if (tache && !chart) lipTache(mX * u, mY * u, mW * u, lipGeo(F.mouth), { ...tache, far: mfar, sw, key: k('m') });
  // nose: one soft shape, the tip and the nostril wings merged into a single silhouette (so it never reads as three
  // balls stuck on), outlined finely round the wings and under the tip but left open over the top, where the bridge
  // runs into it; nostrils, a cast shadow and a highlight. In 3/4 the bridge's far side runs down from between the eyes
  // to the tip, the near wing shows and the far one hides behind the tip.
  rs('nose');
  const nline = mixCol(C.skinDk, NOIR.ink, .4), nhole = mixCol(C.skinDk, NOIR.ink, .6), nshade = mixCol(C.skin, C.skinDk, .5), nlt = C.skinLt || mixCol(C.skin, '#FFFFFF', .3);
  const lw = sw * .6;
  const tipE = [tx, nY, tw * (q ? 1.04 : 1), th], wingEs = q ? [[tx - wx * .95, nY + wy, wr, wr * .85]] : [[nxc - wx, nY + wy, wr, wr * .85], [nxc + wx, nY + wy, wr, wr * .85]];
  const NU = NK.pt ? null : ellipseUnion([tipE, ...wingEs], [tx - (q ? wx * .3 : 0), nY + wy * .5]);
  const shapeN = NU ? NU.map(p => [p[0], p[1]]) : ppShape([[0, -th * 1.1], [tw, -th * .25], [tw * .8, th * .6], [q ? tw * .45 : 0, th * 1.15, 1], [-tw * .75, th * .6], [-tw, -th * .25]].map(([a, c, cr]) => [tx + a, nY + c, cr]), 6);
  // the bridge: a shadow down its side away from the light, and (front) a highlight line down the other side
  if (!q) {
    piece(S(ribbon([[nxc + .05 * hw, nY - nlen * .7], [nxc + tw * .3, nY - nlen * .38], [nxc + tw * .62, nY - th * .7]], .02 * hw, .1 * hw)), nshade, { ink: null, key: k('bridge'), lift: 0, flatCard: true, edge: false, maxTone: .45 });
    dline(S([[nxc - .05 * hw, nY - nlen * .55], [nxc - .07 * hw, nY - nlen * .25]]), sw * .55, nlt, .5);
  }
  // 3/4: the bridge's root sits between the eyes, just under the brow line and nearer the far eye; the bridge runs down
  // and out from it to the tip's far side, and one line draws it on round the tip and the near wing (so the tip hangs off
  // the bridge instead of floating), with a soft shadow down the bridge's turning side
  const nRoot = q ? [lerp(hx + eyes[0][0] * hw + ew * eyes[0][1] / 2, hx + eyes[1][0] * hw - ew * eyes[1][1] * eyes[1][2] / 2, .55), eyeY - ew * .08] : null;
  const skipN = a => { const d = ((a + Math.PI / 2) % TAU + TAU) % TAU; return q ? d > TAU - .95 || d < .62 : d > TAU - .9 || d < .9; };
  const runN = NU ? openRun(NU, skipN) : null, nJ = q ? (runN && runN.length > 2 ? runN[0] : [tx + tw * .62, nY - th * .72]) : null;
  // (a slight dip under the root, so it passes under the far eye's inner corner instead of cutting across the eye)
  const nA = q ? [lerp(nRoot[0], nJ[0], .4), lerp(nRoot[1], nJ[1], .56)] : null, bridgeQ = q ? through([nRoot, nA, nJ], 6) : null;
  if (q) piece(S(ribbon([[nRoot[0] - .03 * hw, nRoot[1] + .1 * ew], [nA[0] - tw * .22, nA[1]], [nJ[0] - tw * .45, nJ[1] + th * .15]], .02 * hw, tw * .7)), nshade, { ink: null, key: k('bridge'), lift: 0, flatCard: true, edge: false, maxTone: .45 });
  // (riso, a bearded face: no shadow under the nose. Printed, it was a dark band across the nose's foot over the upper lip
  // that read as a moustache on him; his stubble prints on as before)
  piece(S(shapeN), C.skin, { ink: null, shade: STYLE.mode === 'xerox' && f.beard && f.beard !== 'none' ? null : C.skinDk, depth: th * .5 * u, key: k('nose'), lift: 1, flatCard: true, maxTone: .45 });
  if (NU) {   // the outline, open over the top of the tip (from about 10 to 2 o'clock); in 3/4 the bridge's line runs into it
    if (runN.length > 2) dline(S(q ? bridgeQ.concat(runN.slice(1)) : runN), lw, nline, .5);
  } else { dline(S(shapeN.slice(Math.round(shapeN.length * .2), Math.round(shapeN.length * .85))), lw, nline, .5); if (q) dline(S(bridgeQ), lw, nline, .4); }
  if (NK.holes) for (const [ex0, ey0] of wingEs) { const sd = ex0 < tx ? -1 : 1; piece(oval((lerp(ex0, tx, .5) + sd * wr * .05) * u, (nY + th * .78) * u, wr * .4 * u, wr * .24 * u, sd * .45, 14), nhole, { ink: null, key: k('nh' + sd), lift: 0, flatCard: true, edge: false }); }
  piece(oval((tx - tw * .35) * u, (nY - th * .42) * u, tw * .28 * u, th * .2 * u, -.5, 12), nlt, { ink: null, key: k('nhl'), lift: 0, flatCard: true, edge: false });
  if (f.nosestud) piece(oval((q ? tx - wx * .95 : nxc + wx) * u, (nY + wy - wr * .15) * u, .07 * u, .07 * u, 0, 8), f.nosestud, { ink: null, key: k('stud'), lift: 0, flatCard: true });
  // freckles, blush
  if (f.freckles) { rs('freckles'); for (let i = 0; i < f.freckles; i++) { const a = (hash(i * 3.1 + 7) - .5) * 1.5, c = (nY - hy) / hh - .14 + (hash(i * 5.3 + 2) - .5) * .22 - Math.abs(a) * .1; if (Math.abs(a) < .1) continue; const fx0 = hx + FX(a) * hw, fy0 = hy + c * hh; piece(oval(fx0 * u, fy0 * u, (.05 + .025 * hash(i)) * u, (.045 + .02 * hash(i + 9)) * u, 0, 8), C.freckle, { ink: null, key: k('fr' + i), lift: 0, flatCard: true, edge: false }); } }
  const blushK = Math.max(o.blush || 0, f.blush || 0);
  // (a translucent wash: kept inside the face, since p5.brush mixes it like pigment and it turns navy over a dark ground)
  if (blushK > .02) for (const s of q ? [-1] : [-1, 1]) { const B = oval((hx + FX(s * .6) * hw) * u, (nY + .05 * hh) * u, .28 * hw * u, .14 * hw * u, 0, 20), Bc = q ? B : clipConvex(B, S(headO).map(p => [p[0], p[1]])); if (Bc.length > 2) paint(Bc, { wash: C.blush || '#C0605A', washOp: 85 * clamp(blushK), ink: null }); }
  if (o.gloom > .02) { const g = ppArc(headO, eyeY - .1 * hh, true); if (g.length > 2) piece(S(g), NOIR.ink, { ink: null, op: 100 * o.gloom, key: k('gloom'), lift: 0, flatCard: true, edge: false }); }

  // ---- hair in front, glasses, hat ----
  rs('hairF');
  hairFront();
  if (P.glasses) glasses();
  if (hr.hat === 'beanie') beanie();
  if (browsLate.length) { rs('browsL'); for (const b of browsLate) b(); }
  pop();

  // ---- arms in front of the body ----
  arm(-1, true); arm(1, true);
  XF = prevXF;
  pop();
  rs('emote'); if (o.emote) emote(o.emote, x + (o.flip ? -1 : 1) * (hw + 1.2) * u, y + (o.dy || 0) * 1.1 * u + (top - (hairStyle === 'bun' ? .6 * bunR : 0) - .8) * u * (1 - sq), u * .62, o.emoteK ?? 1, o.emoteAge ?? T);
  rs('after');

  // ======== parts (closures over the frame above) ========
  function bunDraw() {
    const shape = bn.shape || 'round', rx = bunR, ry = bunR * (shape === 'tall' ? 1.35 : 1);
    let B;
    if (shape === 'point') B = ppShape([[0, -1.25, 1], [.42, -.72], [.78, -.12], [.72, .42], [.36, .74], [0, .8], [-.36, .74], [-.72, .42], [-.78, -.12], [-.42, -.72]].map(([a, c, cr]) => [bunC[0] + a * rx + (c < -.5 ? (q ? .12 : .06) * rx * (-c - .5) : 0), bunC[1] + c * ry, cr]), 6);
    else B = ppScallop(bunC[0], bunC[1], rx, ry, shape === 'tall' ? 13 : 12, .1, -.2);
    if (ex.pencil) {   // a pencil stuck THROUGH the bun: drawn behind it, so the hair hides its middle and only its two ends poke out
      const pa = ex.pencil.ang ?? -.5, c = [bunC[0], bunC[1] + ry * .05], d = [Math.cos(pa), Math.sin(pa)], pw = .32;
      const edge = 1 / Math.sqrt((d[0] / rx) ** 2 + (d[1] / ry) ** 2);   // the bun's radius along the pencil
      const a1 = [c[0] + d[0] * (edge + .55 * bunR), c[1] + d[1] * (edge + .55 * bunR)], a0 = [c[0] - d[0] * (edge + .6 * bunR), c[1] - d[1] * (edge + .6 * bunR)];   // both ends clear the bun
      piece(S(ppBar(a0, [a1[0] - d[0] * .5, a1[1] - d[1] * .5], pw)), '#F2C230', { sw: sw * .6, key: k('pencil'), lift: 2 });
      piece(S([[a1[0] - d[0] * .55 - d[1] * pw * .5, a1[1] - d[1] * .55 + d[0] * pw * .5], [a1[0], a1[1]], [a1[0] - d[0] * .55 + d[1] * pw * .5, a1[1] - d[1] * .55 - d[0] * pw * .5]]), '#E8C9A0', { sw: sw * .5, key: k('ptip'), lift: 2, flatCard: true });
      piece(S([[a1[0] - d[0] * .18 - d[1] * .07, a1[1] - d[1] * .18 + d[0] * .07], [a1[0], a1[1]], [a1[0] - d[0] * .18 + d[1] * .07, a1[1] - d[1] * .18 - d[0] * .07]]), '#3A3440', { ink: null, key: k('plead'), lift: 0, flatCard: true });
      piece(S(ppBar(a0, [a0[0] + d[0] * .35, a0[1] + d[1] * .35], pw * 1.05)), '#E88A9A', { sw: sw * .5, key: k('perase'), lift: 2, flatCard: true });
      piece(S(ppBar([a0[0] + d[0] * .35, a0[1] + d[1] * .35], [a0[0] + d[0] * .6, a0[1] + d[1] * .6], pw * 1.08)), '#B8B4AC', { sw: sw * .5, key: k('pband'), lift: 2, flatCard: true });
    }
    knock(S(B)); piece(S(B), C.hair, { sw: sw * 1.1, shade: C.hairDk || mixCol(C.hair, NOIR.ink, .3), depth: .45 * u, key: k('bun'), lift });
    if (ex.pencil) {   // a couple of curls lie over the pencil where it goes in, so it sits in the hair, not on it
      const pa = ex.pencil.ang ?? -.5, c = [bunC[0], bunC[1] + ry * .05], d = [Math.cos(pa), Math.sin(pa)];
      const edge = 1 / Math.sqrt((d[0] / rx) ** 2 + (d[1] / ry) ** 2);
      for (const [sgn, kk] of [[1, 'in1'], [-1, 'in2']]) {
        const e = [c[0] + d[0] * sgn * edge * .9, c[1] + d[1] * sgn * edge * .9], nx = -d[1], ny = d[0], cr = .22 * hw;
        const lock = []; for (let j = 0; j <= 8; j++) { const aa = Math.PI * (.15 + j / 8 * .9); lock.push([e[0] + nx * Math.cos(aa) * cr * 1.3 - d[0] * sgn * Math.sin(aa) * cr * .7, e[1] + ny * Math.cos(aa) * cr * 1.3 - d[1] * sgn * Math.sin(aa) * cr * .7]); }
        piece(S(lock.concat([e])), C.hair, { sw: sw * .7, key: k('plock' + kk), lift: 1, flatCard: true });
      }
    }
    for (let i = 0; i < (bn.curls ?? 9); i++) {   // curl marks
      const a = hash(i * 7.7 + 1) * TAU, r = Math.sqrt(hash(i * 3.3 + 5)) * .68, cx0 = bunC[0] + Math.cos(a) * rx * r, cy0 = bunC[1] + Math.sin(a) * ry * r * (shape === 'point' ? .8 : 1), cr = .16 * hw, a0 = hash(i * 1.9) * TAU;
      const arc = []; for (let j = 0; j <= 6; j++) { const aa = a0 + j / 6 * Math.PI * 1.3; arc.push([cx0 + Math.cos(aa) * cr, cy0 + Math.sin(aa) * cr * .8]); }
      dline(S(arc), sw * .55, C.hairLt, .5);
    }
    if (C.tie) { const ty = bunC[1] + ry * (shape === 'point' ? .72 : .86); piece(ppScallop(bunC[0] * u, ty * u, rx * .62 * u, .24 * hw * u, 9, .18, 0), C.tie, { sw: sw * .7, shade: mixCol(C.tie, NOIR.ink, .3), depth: .08 * u, key: k('tie'), lift: 2 }); }
  }
  function capOuter(yb, pad, curly, ybBack) {   // the hair's outer edge over the top of the head, left → right
    const yy = q && ybBack != null ? Math.max(yb, ybBack) : yb, c = [hx, hy + .1 * hh];
    let arc = ppArc(headO, yy, true);
    if (yy !== yb) { let j = arc.length; while (j > 2 && arc[j - 1][1] > yb && arc[j - 1][0] > hx) j--; arc = arc.slice(0, j); }
    const A = ppScale(arc, c, 1 + pad, 1 + pad * .9);
    return curly ? ppBumpy(A, c, curly, .06) : A;
  }
  function hairFront() {
    const hc = C.hair, hl = C.hairLt, H = (a, c) => [hx + a * hw, hy + c * hh], lt = hl;
    if (hairStyle === 'crop' || hairStyle === 'twists' || hairStyle === 'afro') {
      if (hr.hat === 'beanie' && hairStyle === 'crop') { sideburns(); return; }
      const yb = eyeY - .1 * hh, topH = hr.top || 0;
      let outer = capOuter(q ? hy + (f.eyeY - .36) * hh : yb, hairStyle === 'afro' ? .05 : .045, hairStyle === 'afro' ? 9 : 0, hy + (f.eyeY + .5) * hh);
      if (topH) {   // a flat-top: straight sides up to a flat, slightly rounded top
        const yt = hy - hh - topH, ytop = Math.min(...outer.map(p => p[1]));
        outer = outer.map(([a, c]) => { const k2 = clamp((yb - c) / (yb - ytop)); const w = Math.abs(a - hx), wf = Math.pow(k2, .5); return [hx + (a - hx) * lerp(1, 1.04, wf), lerp(c, yt + (c - ytop) * .35, Math.pow(k2, 1.6))]; });
      }
      if (hairStyle === 'twists') {   // twists: little rounded points around the top
        const R = ppResample(outer, 60), c = [hx, hy + .2 * hh];
        outer = R.map(([a, cc], i) => { const t = i / (R.length - 1), up = clamp((yb - cc) / (hh * .7)), k2 = 1 + .03 * up + .075 * up * Math.sqrt(Math.abs(Math.sin(Math.PI * (hr.twists ?? 9) * t))); return [c[0] + (a - c[0]) * k2, c[1] + (cc - c[1]) * k2]; });
      }
      // the hairline: a crisp line-up with square temple corners (or soft for the afro)
      const lu = hr.lineup !== false && hairStyle !== 'afro', sideY = f.eyeY + .12, hlY = hr.hairline ?? -.5;
      const W = c => ppWidthAt(R0, c) * .97;
      const line = q
        ? [[W(f.eyeY - .36) + .05, f.eyeY - .36], [W(f.eyeY - .36) * .86, f.eyeY - .34, lu ? 1 : 0], [FX(.72), hlY + .06, lu ? 1 : 0], [FX(.35), hlY - .02], [FX(-.2), hlY - .02], [FX(-.62), hlY + .05, lu ? 1 : 0], [-.24, -.2, lu ? 1 : 0], [-.28, sideY + .14, 1], [-.36, sideY + .12], [-.4, f.eyeY - .12], [-.55, f.eyeY - .19], [-.7, f.eyeY - .1], [-.76, f.eyeY + .25], [-.86, f.eyeY + .5]]
        : [[W(sideY), sideY], [W(-.25) * .92, -.28, lu ? 1 : 0], [.74, hlY + .08, lu ? 1 : 0], [.35, hlY - .02], [0, hlY - .03], [-.35, hlY - .02], [-.74, hlY + .08, lu ? 1 : 0], [-W(-.25) * .92, -.28, lu ? 1 : 0], [-W(sideY), sideY]];
      const hl2 = line.map(([a, c, cr]) => [...H(a, c), cr]);
      knock(S(hairLine(outer, hl2))); piece(S(hairLine(outer, hl2)), hc, { sw, shade: C.hairDk || mixCol(hc, NOIR.ink, .3), depth: .25 * u, key: k('hair'), lift: 2 });
      // texture
      const n = hairStyle === 'twists' ? 22 : 26;
      for (let i = 0; i < n; i++) {
        const a = Math.PI * (1.12 + hash(i + 3) * .76), r = .35 + .55 * hash(i + 17), px = hx + Math.cos(a) * hw * .92 * r, py = hy - hh * (.75 + (topH ? topH / hh * .5 : 0)) + Math.sin(a) * hh * .3 * r + .15;
        if (hairStyle === 'twists') dline(S([[px - .05, py + .12], [px + .05, py - .12]]), sw * .5, lt, .5);
        else dline(S([[px - .09, py + .04], [px, py - .07], [px + .09, py + .04]]), sw * .55, lt, .5);
      }
    } else if (hairStyle === 'bun') {
      // (in 3/4 the hair covers the back of the skull down to the nape; the near ear is drawn over it afterwards)
      const yb = eyeY - .05 * hh, outer = capOuter(q ? hy + (f.eyeY - .4) * hh : yb, .05, hr.curly ?? 8, q ? hy + .44 * hh : yb);
      const W = c => ppWidthAt(R0, c) * .97, hlY = hr.hairline ?? -.55;
      const line = (q
        ? [[W(f.eyeY - .4) + .05, f.eyeY - .4], [W(f.eyeY - .4) * .88, f.eyeY - .38], [FX(.55), hlY + .02], [FX(.1), hlY - .06], [FX(-.4), hlY], [-.42, -.3], [-.38, f.eyeY + .06], [-.5, .45]]
        : [[W(f.eyeY), f.eyeY - .05], [W(-.35) * .94, -.38], [.55, hlY + .02], [.15, hlY - .05], [0, hlY - .02], [-.15, hlY - .05], [-.55, hlY + .02], [-W(-.35) * .94, -.38], [-W(f.eyeY), f.eyeY - .05]]).map(([a, c]) => [...H(a, c)]);
      knock(S(hairLine(outer, line))); piece(S(hairLine(outer, line)), hc, { sw, shade: C.hairDk || mixCol(hc, NOIR.ink, .3), depth: .2 * u, key: k('hair'), lift: 2 });
      if (earLate) { rs('earsL'); ears([earQ]); }
      // lines pulled back toward the bun
      for (let i = 0; i < 5; i++) { const t = (i + .5) / 5, sx0 = lerp(-.55, .55, t) + (q ? .2 : 0); dline(S([H(sx0, hlY - .08), H(sx0 * .7 + (bn.x ?? 0) * .3 - (q ? .15 : 0), -.85)]), sw * .5, hl, .5); }
      // ringlets: loose coils falling from the hair at each temple, over the top of the ear (the near side in 3/4), high
      // enough that the ear's lobe and its hoop show below them
      const nRing = Math.round((hr.tendrils ?? 1) * 2);
      for (const sd of q ? [-1] : [-1, 1]) for (let j = 0; j < nRing; j++) {
        const yy2 = f.eyeY - .2 + j * .16, rr = (.15 - j * .025) * hw, xx2 = q ? -.47 + j * .02 : sd * (W(yy2) + .04 - j * .03), c1 = H(xx2, yy2);
        piece(S(ppScallop(c1[0], c1[1], rr, rr * 1.15, 7, .12, j + .5)), hc, { sw: sw * .6, shade: C.hairDk || mixCol(hc, NOIR.ink, .3), depth: rr * .5 * u, key: k('ring' + sd + j), lift: 2, flatCard: true });
        const cr = []; for (let m = 0; m <= 8; m++) { const a = -.6 + m / 8 * 4.2, r2 = rr * (.55 - m * .04); cr.push([c1[0] + Math.cos(a) * r2 * -sd, c1[1] + Math.sin(a) * r2]); }
        dline(S(cr), sw * .5, hl, .5);
      }
      if (hr.fringe) for (let i = 0; i < hr.fringe; i++) {   // a few curls on the forehead
        const fx0 = (i - (hr.fringe - 1) / 2) * .34 + (q ? .15 : 0), c1 = H(FX(fx0), hlY + .04), R = .13 * hw;
        piece(S(ppScallop(c1[0], c1[1] + R * .4, R * 1.2, R * 1.05, 5, .15, i)), hc, { sw: sw * .6, key: k('fr' + i), lift: 2, flatCard: true });
        dline(S([[c1[0] - R * .4, c1[1] + R * .5], [c1[0], c1[1] + R * .9], [c1[0] + R * .45, c1[1] + R * .5]]), sw * .45, hl, .5);
      }
    } else if (hairStyle === 'bob') {
      const outer = capOuter(f.eyeY * hh + hy, .06, 0);
      const line = [[1.02, .1], [.95, -.3], [.6, -.33], [.2, -.3], [-.2, -.34], [-.6, -.3], [-.95, -.3], [-1.02, .1]].map(([a, c]) => H(q ? FX(a * .95) * (a < 0 ? 1.1 : 1) : a, c));
      piece(S(hairLine(outer, line)), hc, { sw, key: k('hair'), lift: 2 });
      for (const s of [-1, 1]) { if (q && s > 0) continue; piece(ppShape(S([H(s * 1.0, -.2), H(s * 1.12, .2), H(s * 1.08, .78, 1), H(s * .78, .7, 1), H(s * .8, .1)].map(p => [p[0], p[1], p[2]])), 4), hc, { sw, key: k('bobS' + s), lift: 2 }); }
      for (let i = 0; i < 6; i++) { const a = -.7 + i * .28; dline(S([H(a, -.95), H(a * 1.05, -.4)]), sw * .5, hl, .5); }
    } else if (hairStyle === 'part') {
      const yb = eyeY - .12 * hh, outer = capOuter(yb, .06, 0).map(([a, c]) => [a, c - (a > hx ? .25 * Math.max(0, (hy - c) / hh) : 0)]);
      const line = (q ? [[.95, -.15], [.8, -.5], [.3, -.62], [-.2, -.45], [-.5, -.2]] : [[.97, -.15], [.8, -.55], [.3, -.68], [-.35, -.55], [-.8, -.45], [-.97, -.15]]).map(([a, c]) => H(q ? FX(a) : a, c));
      piece(S(hairLine(outer, line)), hc, { sw, key: k('hair'), lift: 2 });
      for (let i = 0; i < 5; i++) { const a = -.5 + i * .25; dline(S([H(-.35, -.95), H(a + .2, -.7), H(a + .5, -.55)]), sw * .5, hl, .5); }
    } else if (hairStyle === 'long') {
      const outer = capOuter(eyeY, .06, 0);
      const line = [[.98, .1], [.75, -.55], [.3, -.8], [.05, -.9], [-.05, -.9], [-.3, -.8], [-.75, -.55], [-.98, .1]].map(([a, c]) => H(q ? FX(a) * (a < 0 ? 1.05 : 1) : a, c));
      piece(S(hairLine(outer, line)), hc, { sw, key: k('hair'), lift: 2 });
      for (const s of [-1, 1]) { if (q && s > 0) continue; piece(ppShape(S([H(s * .98, -.3), H(s * 1.12, .3), H(s * 1.1, 1.6), H(s * .92, 2.05, 1), H(s * .72, 1.5), H(s * .82, .5)].map(p => [p[0], p[1]])), 4), hc, { sw, key: k('longF' + s), lift: 2 }); }
    }
  }
  function hairLine(outer, line) {   // outer: left → right over the top; line: the hairline, right → left (corners kept)
    return outer.concat(ppOpen(line, 4));
  }
  function sideburns() {   // the crop showing under a hat: a short sideburn in front of each ear (3/4: and the back of the head, down to the nape)
    const W = c => ppWidthAt(R0, c) * .97, yT = (hr.hatY ?? -.42) - .05, yB = f.eyeY + .04;
    if (q) {
      const back = headO.filter(p => p[0] < hx - .42 * hw && p[1] > hy + yT * hh && p[1] < hy + .4 * hh).sort((a, b) => a[1] - b[1]).map(([a, c]) => [hx + (a - hx) * 1.015, c]);
      const P = through([[hx - .33 * hw, hy + yT * hh], [hx - .345 * hw, hy + (yB - .12) * hh], [hx - .37 * hw, hy + (yB + .06) * hh], [hx - .5 * hw, hy + (yB + .2) * hh], [hx - .64 * hw, hy + .36 * hh]], 4);
      if (back.length > 2) piece(S(P.concat(back.reverse())), C.hair, { sw: sw * .6, key: k('sbq'), lift: 1, flatCard: true });
      for (let i = 0; i < 12; i++) { const px = hx - (.42 + .45 * hash(i * 2.3 + 1)) * hw, py = hy + lerp(yT + .08, yB - .05, hash(i * 4.1 + 3)) * hh; if (px < hx - (farAt(0) * .9) * hw) continue; dline(S([[px - .06, py + .03], [px, py - .04], [px + .06, py + .03]]), sw * .45, C.hairLt, .5); }
    } else for (const [x0, d] of [[-W(f.eyeY), 1], [W(f.eyeY), -1]]) piece(ppShape(S([[hx + x0 * hw, hy + yB * hh, 1], [hx + (x0 - d * .01) * hw, hy + yT * hh, 1], [hx + (x0 + d * .12) * hw, hy + yT * hh, 1], [hx + (x0 + d * .08) * hw, hy + (yB - .08) * hh, 1]]), 3), C.hair, { sw: sw * .6, key: k('sb' + x0), lift: 1, flatCard: true });
    if (earLate) { rs('earsL'); ears([earQ]); }
  }
  function longBack() {
    const H = (a, c) => [(Fr.hx + a * hd.w), Fr.hy + bob + c * hd.h / 2];
    piece(ppShape(S([H(0, -1.1), H(1.05, -.8), H(1.25, .2), H(1.3, 1.5), H(1.15, 2.4, 1), H(0, 2.2), H(-1.15, 2.4, 1), H(-1.3, 1.5), H(-1.25, .2), H(-1.05, -.8)].map(p => [p[0] - (q ? .3 : 0), p[1], p[2]])), 5), C.hair, { sw, shade: C.hairDk || mixCol(C.hair, NOIR.ink, .3), depth: .4 * u, key: k('longB'), lift });
  }
  function glasses() {
    rs('glasses');
    const g = P.glasses, gr = g.r * hw, th = (g.t ?? .1) * hw, gy = eyeY + .03 * hh, col = C.glasses || '#221C22';
    const rims = eyes.map(([exf, sc], i) => ({ x: hx + exf * hw, rx: gr * (q ? (i ? .6 : .86) : 1), ry: gr * (g.ry ?? 1) * (q && i ? .93 : 1) }));   // (3/4: both lenses foreshortened, the far one more, and a touch smaller)
    rims.forEach((r, i) => {
      piece(S(ppRing(r.x, gy, r.rx, r.ry, th, i ? 0 : Math.PI)), col, { sw: sw * .45, key: k('rim' + i), lift: 2, flatCard: true });
      dline(S([[r.x - r.rx * .55, gy - r.ry * .35], [r.x - r.rx * .3, gy - r.ry * .58]]), sw * .9, '#FFFFFF', .3);
    });
    const [r0, r1] = rims, by = gy - gr * .15;
    piece(ribbon(S([[r0.x + r0.rx - th * .5, by], [(r0.x + r1.x) / 2, by - gr * .18], [r1.x - r1.rx + th * .5, by]]), th * u, th * u), col, { sw: sw * .4, key: k('bridge'), lift: 2, flatCard: true });
    if (q) piece(ribbon(S([[r0.x - r0.rx + th * .3, gy - gr * .1], [lerp(r0.x - r0.rx, hx - .5 * hw, .5), gy - gr * .05], [hx - .42 * hw, earY - .1 * hh]]), th * .9 * u, th * .8 * u), col, { sw: sw * .4, key: k('arm0'), lift: 2, flatCard: true });
    else for (const [r, s] of [[r0, -1], [r1, 1]]) { const ex2 = hx + s * ppWidthAt(R0, f.eyeY) * hw; if (Math.abs(ex2 - r.x) > r.rx + .05) piece(ribbon(S([[r.x + s * (r.rx - th * .3), gy - gr * .1], [ex2 + s * .05, gy - gr * .05]]), th * .9 * u, th * .8 * u), col, { sw: sw * .4, key: k('arm' + s), lift: 2, flatCard: true }); }
  }
  function beanie() {
    rs('beanie');
    const yb = hy + (hr.hatY ?? -.42) * hh, c = [hx, hy + .1 * hh], dome0 = ppScale(ppArc(headO, yb, true), c, 1.1, 1.08), topY = Math.min(...dome0.map(p => p[1]));
    const dome = dome0.map(([a, cc]) => [a, cc - (hr.hatH ?? .35) * Math.pow(clamp((yb - cc) / (yb - topY)), 2)]);
    const L0 = dome[0], R1 = dome[dome.length - 1], mx = hx + (q ? FX(0) * hw * .55 : 0);
    piece(S(dome.concat(through([R1, [mx, yb + .2], L0], 6).slice(1, -1))), C.hat, { sw: sw * 1.1, shade: C.hatDk, depth: .35 * u, key: k('hat'), lift });
    const cuffH = hr.cuffH ?? .85, yt = yb - cuffH;
    for (let i = 1; i < 8; i++) { const p = dome[Math.round(i / 8 * (dome.length - 1))]; if (p[1] < yt - .1) dline(S([[lerp(p[0], hx, .08), p[1] + .15], [lerp(p[0], hx, .02), yt - .05]]), sw * .45, C.hatDk, .4); }
    // the folded cuff follows the dome's sides
    let iL = 0; while (iL < dome.length - 1 && dome[iL][1] > yt) iL++;
    let iR = dome.length - 1; while (iR > 0 && dome[iR][1] > yt) iR--;
    const out = (p, e = .05) => [p[0] + Math.sign(p[0] - hx) * e, p[1]];
    const leftRun = dome.slice(0, iL).map(p => out(p)), rightRun = dome.slice(iR + 1).map(p => out(p));
    const cuff = through([out(dome[iL]), [mx, yt + .12], out(dome[iR])], 6).concat(rightRun, through([out(R1, .07), [mx, yb + .26], out(L0, .07)], 6).slice(1, -1), leftRun.reverse().reverse());
    piece(S(cuff), C.hat, { sw, shade: C.hatDk, depth: .2 * u, key: k('hatcuff'), lift: 2 });
    for (let i = 1; i < 14; i++) { const xx = lerp(L0[0], R1[0], i / 14), w = Math.abs(xx - hx) / (Math.abs(R1[0] - L0[0]) / 2); dline(S([[xx, yt + .15 + .12 * (1 - w * w)], [xx, yb + .12 + .12 * (1 - w * w)]]), sw * .45, C.hatDk, 0); }
  }

}

// ======================================================================================================================
// The narrators: three complementary silhouette pairings. His signature is the mustard parka, hers the tomato-red coat,
// round glasses and a big curly bun (with a pencil stuck through it: she's a designer). He is of African descent in all
// three; her heritage varies (A British South Asian, B white British with freckles, C mixed Black and white British).
// ======================================================================================================================
const PP_MUSTARD = { coat: '#E0A526', coatDk: '#A36E12', coatLt: '#F4CD6A', cuff: '#CC9420', fur: '#948A7A', furDk: '#645C50' };
const PP_TOMATO = { coat: '#D8432E', coatDk: '#9C2A1C', coatLt: '#F07A5E', cuff: '#B8321F' };

// ---- A "tall and small": a tall, lanky, stooped question mark in an oversized parka; a short, compact bell with a huge bun
const HIM_A = {
  id: 'hA', name: 'him A: tall',
  body: { leg: 7.2, legW: .82, legW1: .68, legGap: .45, stance: .2, torso: 5.1, neck: .25, arm: 6.2, armW: 1.2, wrist: 1.0, hand: .78, foot: 1.35, stoop: .6, stride: .3 },
  head: { w: 1.95, h: 5.0, crown: .96, cheek: 1, cheekY: -.05, jaw: .8, jawY: .58, chin: .36, neck: .42 },
  face: { eyeY: -.06, gap: .42, eye: .46, tall: .92, lid: .12, lash: 1.2, browY: .33, browW: 1.05, brow0: [.05, 0], nose: { kind: 'broad', w: .95, len: 1.1, q: .3 }, noseY: .3, mouthY: .64, mouthW: .56, lips: .8, beard: 'chin', ear: .95 },
  hair: { style: 'crop', top: .5, hairline: -.5 },
  top: { kind: 'parka', neck: .9, sh: [2.3, .75], rows: [[2.55, 1.9], [2.62, 3.6], [2.55, 5.3], [2.5, 6.1, 1]], hemC: .18, band: .6, collar: 'ruff', ruff: [2.0, .75, -.05] },
  legs: { kind: 'trousers' }, shoes: { kind: 'trainer' }, extra: { buds: true, pack: true },
  col: { ...PP_MUSTARD, skin: '#6B412F', skinDk: '#4C2B1F', skinLt: '#8A5A42', lip: '#4A2620', lipLt: '#6C3D30', iris: '#3A2216', hair: '#1E1618', hairLt: '#5A4A4C', beard: '#261C1C', beardLt: '#4A3A38',
    trousers: '#2B2D3A', trousersDk: '#1D1E28', shoe: '#EDE6DA', shoeLt: '#D8403A', sole: '#C9BFB0', pack: '#3C4350', packDk: '#2C323D', blush: '#9A4A3A' },
};
const HER_A = {
  id: 'rA', name: 'her A: small',
  body: { leg: 3.6, legW: .74, legW1: .64, legGap: .4, stance: .2, torso: 3.6, neck: .15, arm: 4.1, armW: .84, wrist: .68, hand: .7, foot: 1.12, stride: .35 },
  head: { w: 1.96, h: 4.5, crown: .97, cheek: 1, cheekY: .05, jaw: .78, jawY: .6, chin: .3, neck: .36 },
  face: { eyeY: .04, gap: .42, eye: .42, tall: 1.0, lid: .14, lash: 1.6, flicks: 2, browY: .34, browW: 1.1, brow0: [.02, .06], irisS: 1.05, nose: { kind: 'button', w: 1.1, q: .22 }, noseY: .36, mouthY: .64, mouthW: .5, lips: 1, ear: .9, nosestud: '#E8C860', hoops: '#D9A93A', blush: .15 },
  hair: { style: 'bun', bun: { r: 1.22, y: -1.48, shape: 'round', curls: 12 }, puff: .6, curly: 8, tendrils: .9, fringe: 0, hairline: -.5 },
  glasses: { r: .36, t: .085 },
  top: { kind: 'coat', neck: .75, sh: [1.8, .4], rows: [[1.95, 1.3], [2.3, 2.5], [2.9, 3.7], [3.4, 4.75, 1]], hemC: .3, collar: 'round', collarW: 1.8, vDepth: 1.05, buttons: [[0, 1.55], [0, 2.4], [0, 3.25]], pocket: 3.6 },
  legs: { kind: 'tights' }, shoes: { kind: 'chunky' }, extra: { pencil: { ang: -.55 } },
  col: { ...PP_TOMATO, skin: '#A86F4C', skinDk: '#83533A', skinLt: '#C48A64', lip: '#8A3E36', lipLt: '#A85A4C', iris: '#3A2418', hair: '#1A1213', hairLt: '#4E3A34', hairDk: '#0E0A0B', brow: '#1A1213',
    collar: '#9C2A1C', under: '#2E5A5E', button: '#2A2230', trousers: '#2E5A5E', trousersDk: '#1F4043', shoe: '#2A2230', shoeLt: '#E8C860', sole: '#1A151C', tie: '#E0A526', glasses: '#1E1A1E', blush: '#B85A4A' },
};

// ---- B "round and sharp": a big soft bear in a puffy parka; a tall, thin, angular heron in a long belted coat
const HIM_B = {
  id: 'hB', name: 'him B: round',
  body: { leg: 3.9, legW: 1.35, legW1: 1.15, legGap: .78, stance: .2, torso: 4.8, neck: -.1, arm: 4.5, armW: 1.45, wrist: 1.12, hand: .95, foot: 1.4, stride: .3 },
  head: { w: 2.4, h: 4.7, crown: 1.0, cheek: 1.03, cheekY: .15, jaw: .95, jawY: .62, chin: .55, neck: .5 },
  face: { eyeY: -.02, gap: .38, eye: .4, tall: 1.0, lash: 1.2, browY: .3, browW: 1.15, brow0: [.08, 0], nose: { kind: 'round', w: 1.05, q: .3 }, noseY: .28, mouthY: .6, mouthW: .5, lips: .9, beard: 'full', ear: .95, blush: .2 },
  hair: { style: 'twists', hairline: -.52 },
  top: { kind: 'puffer', neck: 1.0, sh: [2.45, .7], rows: [[3.45, 1.7], [3.85, 3.0], [3.6, 4.4], [2.85, 5.35, 0]], hemC: .12, band: .5, quilt: 1.05, collar: 'ruff', ruff: [2.45, .95, -.1] },
  legs: { kind: 'trousers' }, shoes: { kind: 'trainer' }, extra: { buds: true },
  col: { ...PP_MUSTARD, skin: '#7A4A33', skinDk: '#573222', skinLt: '#9C664A', lip: '#4E2A20', lipLt: '#6E4232', iris: '#3E2418', hair: '#221819', hairLt: '#4E3E40', beard: '#2A1E1E', beardLt: '#5A4844',
    trousers: '#3E4052', trousersDk: '#2B2D3A', shoe: '#46424E', shoeLt: '#E0A526', sole: '#D8D0C2', blush: '#A0503E' },
};
const HER_B = {
  id: 'rB', name: 'her B: sharp',
  body: { leg: 6.0, legW: .62, legW1: .5, legGap: .36, stance: .08, torso: 4.5, neck: .75, arm: 5.7, armW: .74, wrist: .56, hand: .72, foot: 1.25, stride: .3 },
  head: { w: 1.72, h: 5.0, crown: .9, cheek: 1, cheekY: -.05, cheekC: 1, jaw: .6, jawY: .52, jawC: 1, chin: .16, neck: .34 },
  face: { eyeY: 0, gap: .44, eye: .48, tall: .9, lid: .3, lash: 1.6, flicks: 2, browY: .3, browW: 1.15, brow0: [-.05, .2], iris: 1, nose: { kind: 'point', w: 1, len: 1.2, q: .26 }, noseY: .33, mouthY: .66, mouthW: .5, lips: .9, freckles: 26, blush: .35, ear: .85, hoops: null },
  hair: { style: 'bun', bun: { r: .88, y: -1.55, x: .05, shape: 'point', curls: 8 }, puff: .2, curly: 9, tendrils: .8, fringe: 0, hairline: -.58 },
  glasses: { r: .36, t: .06 },
  top: { kind: 'coat', neck: .65, sh: [2.3, -.1], sharp: true, rows: [[1.75, 1.3], [1.28, 2.75], [1.62, 4.5], [2.05, 7.9, 1]], hemC: .12, collar: 'lapel', popped: true, vDepth: 2.3, belt: 2.75, open: .12, buttons: [[.12, 3.6]], pocket: 4.6 },
  legs: { kind: 'trousers' }, shoes: { kind: 'point' }, extra: { pencil: { ang: -1.15 } },
  col: { ...PP_TOMATO, skin: '#F0CDB4', skinDk: '#D6A286', skinLt: '#FAE2D0', lip: '#C0504A', lipLt: '#D87A6C', freckle: '#C98A66', blush: '#E8928A', iris: '#557450', hair: '#7A3A20', hairLt: '#AA6038', hairDk: '#4E2210', brow: '#6A3018',
    under: '#26222C', trousers: '#26222C', trousersDk: '#18161C', shoe: '#1E1A20', sole: '#1E1A20', tie: '#26222C', glasses: '#B08A3A' },
};

// ---- C "block and line": a stocky, square block in a boxy parka and a beanie; a long vertical line in an ankle coat
// (no moustache: stubble only; the user, 2026-09-26: off for good)
const HIM_C = {
  id: 'hC', name: 'him C: block', voice: 'M',   // (the male singer: lip-syncs the lyric's M lines in card, mouths.js)
  body: { leg: 3.4, legW: 1.3, legW1: 1.2, legGap: .88, stance: .15, torso: 4.5, neck: -.15, arm: 4.3, armW: 1.35, wrist: 1.1, hand: .92, foot: 1.5, stride: .3 },
  head: { w: 2.35, h: 4.3, crown: .98, cheek: 1, cheekY: 0, jaw: 1.0, jawY: .66, jawC: 1, chin: .66, neck: .55 },
  face: { eyeY: .1, gap: .4, eye: .42, tall: .78, lid: .27, lash: 1.3, browY: .3, browW: 1.15, brow0: [-.02, .03], nose: { kind: 'broad', w: .92, q: .24 }, noseY: .5, mouthY: .79, mouthW: .6, lips: .9, beard: 'stubble', ear: 1 },
  hair: { style: 'crop', hat: 'beanie', hatY: -.44 },
  top: { kind: 'boxy', neck: 1.0, sh: [3.15, .25], sharp: true, rows: [[3.25, 1.6], [3.25, 3.4], [3.2, 5.0, 1]], hemC: .06, band: .5, collar: 'ruff', ruff: [2.3, .7, -.05] },
  legs: { kind: 'trousers' }, shoes: { kind: 'boot' }, extra: {},
  col: { ...PP_MUSTARD, skin: '#7E5038', skinDk: '#5A3726', skinLt: '#A06A50', lip: '#52301F', lipLt: '#744634', iris: '#2E1A12', hair: '#1A1414', hairLt: '#3E3232', beard: '#1E1616', beardLt: '#44383A',
    hat: '#3B4250', hatDk: '#272C36', trousers: '#565B40', trousersDk: '#3C402C', shoe: '#6A4A32', sole: '#2A2220', blush: '#8A4434' },
};
const HER_C = {
  id: 'rC', name: 'her C: line', voice: 'F',   // (the female singer: the F lines)
  body: { leg: 6.6, legW: .6, legW1: .5, legGap: .3, stance: .05, torso: 4.6, neck: .85, arm: 5.6, armW: .72, wrist: .56, hand: .72, foot: 1.1, stride: .3 },
  head: { w: 1.62, h: 4.7, crown: .94, cheek: 1, cheekY: .02, jaw: .76, jawY: .6, chin: .32, neck: .36 },
  face: { eyeY: .02, gap: .43, eye: .5, tall: 1.0, lid: .1, lash: 1.5, flicks: 2, browY: .32, browW: 1.05, brow0: [0, .08], nose: { kind: 'round', w: .8, len: .9, q: .26 }, noseY: .4, mouthY: .66, mouthW: .52, lips: 1.1, ear: .85, hoops: '#D9A93A', blush: .15 },
  hair: { style: 'bun', bun: { r: .92, y: -1.75, shape: 'tall', curls: 10 }, puff: .35, curly: 9, tendrils: 1.3, fringe: 0, hairline: -.55 },
  glasses: { r: .37, t: .11 },
  top: { kind: 'coat', neck: .6, sh: [1.72, .5], rows: [[1.82, 2.1], [1.78, 4.7], [1.9, 10.55, 1]], hemC: .1, collar: 'funnel', open: .15, buttons: [[.15, 1.3], [.15, 2.5], [.15, 3.7], [.15, 4.9]], pocket: 5.3 },
  legs: { kind: 'trousers' }, shoes: { kind: 'trainer' }, extra: { scarf: { len: 6.6, w: .8 }, pencil: { ang: -.32 } },   // (across the bun: tip out one side, eraser the other)
  col: { ...PP_TOMATO, skin: '#C48B63', skinDk: '#A06C4A', skinLt: '#D9A67E', lip: '#9A4A3E', lipLt: '#B8685A', iris: '#4A3020', hair: '#3A2217', hairLt: '#7A5236', hairDk: '#24140C', brow: '#2E1A10',
    scarf: '#E6DAC2', scarfDk: '#BFAE90', scarfLt: '#E0A526', trousers: '#231F26', trousersDk: '#16131A', shoe: '#EEE8DC', sole: '#C9BFB0', tie: '#E0A526', glasses: '#6A3E22', blush: '#B8685A' },
};
const PP_PAIRS = [[HIM_A, HER_A, 'A · tall and small'], [HIM_B, HER_B, 'B · round and sharp'], [HIM_C, HER_C, 'C · block and line']];

// ---------- small props for the sheets ----------
// A mug, held: drawn in hand space, counter-rotated by the hand's angle `ang` so it stands upright.
function ppMug(s, ang, col = '#F2EEE6', key = 'mug') {
  push(); rotate(-ang); translate(-.1 * s, -.15 * s);
  const sw = clamp(s / 30, .5, 1.8);
  piece(ppRing(.62 * s, .05 * s, .32 * s, .34 * s, .12 * s, Math.PI), col, { sw, key: key + 'h', lift: 2, flatCard: true });
  piece(curvy(U([[-.5, -.62], [.5, -.62], [.46, .6], [-.46, .6]], s), 2), col, { sw, shade: '#C9BFAE', depth: .15 * s, key: key + 'b', lift: 2 });
  piece(oval(0, -.62 * s, .48 * s, .12 * s, 0, 14), '#7A4A2A', { sw: sw * .6, key: key + 't', lift: 0, flatCard: true });
  piece(oval(0, .05 * s, .16 * s, .16 * s, 0, 12), NOIR.red, { ink: null, key: key + 'd', lift: 0, flatCard: true });
  pop();
}
// A two-seat sofa, standing on the floor at G (seat top ~2.7u up).
function ppSofa(cx, G, u, w = 12, col = '#4F7482', dk = '#34525E') {
  const sw = clamp(u / 20, .55, 2.2), Z = P => U(P, u, cx, G);
  boilSeed('sofa');
  for (const s of [-1, 1]) piece(curvy(Z([[s * (w / 2 - .6) - .25, -.9], [s * (w / 2 - .6) + .25, -.9], [s * (w / 2 - .6) + .2, 0], [s * (w / 2 - .6) - .2, 0]]), 2), '#3A2A22', { sw, key: 'sofaleg' + s, lift: 3 });
  piece(curvy(Z([[-w / 2 + .4, -7.2], [w / 2 - .4, -7.2], [w / 2 - .2, -2.2], [-w / 2 + .2, -2.2]]), 3), col, { sw: sw * 1.1, shade: dk, depth: .8 * u, key: 'sofaback', lift: 4 });
  for (const s of [-1, 1]) piece(curvy(Z([[s * .1, -6.7], [s * (w / 2 - 1.1), -6.7], [s * (w / 2 - 1.1), -3.2], [s * .1, -3.2]]), 3), mixCol(col, '#FFFFFF', .08), { sw, shade: dk, depth: .4 * u, key: 'sofacush' + s, lift: 2 });
  piece(curvy(Z([[-w / 2 + .3, -2.9], [w / 2 - .3, -2.9], [w / 2 - .3, -.9], [-w / 2 + .3, -.9]]), 3), dk, { sw, key: 'sofabase', lift: 3 });
  for (const s of [-1, 1]) piece(curvy(Z([[s * .1, -3.3], [s * (w / 2 - 1.1), -3.3], [s * (w / 2 - 1.1), -2.2], [s * .1, -2.2]]), 3), col, { sw, shade: dk, depth: .3 * u, key: 'sofaseat' + s, lift: 2 });
  for (const s of [-1, 1]) piece(curvy(Z([[s * (w / 2 - 1.3), -4.9], [s * (w / 2 + .15), -5.1], [s * (w / 2 + .25), -.9], [s * (w / 2 - 1.3), -.9]]), 3), col, { sw: sw * 1.1, shade: dk, depth: .5 * u, key: 'sofaarm' + s, lift: 4 });
}

// ---------- model sheets (labels are fine here: reference only) ----------
//   node render.mjs --page=demo/dev-people.html --loop=pairs --sheet=0.3 --cols=1 --w=1920 --out=out/demo/people/pairs.jpg
// Silhouette test: while draw() runs, every piece is filled flat dark (and pencil lines and pins are skipped).
function ppSilhouette(draw, col = '#2C2630') {
  const sp = piece, sd = dline, sb = brad;
  piece = (P, c, o = {}) => sp(P, col, { key: o.key, sw: o.sw, lift: 0, ink: STYLE.card ? null : col, edge: false, flatCard: true });
  dline = () => {}; brad = () => {};
  try { draw(); } finally { piece = sp; dline = sd; brad = sb; }
}
const PP_FAV = 2;   // pair C, the chosen one   // the pair pairLooks shows (index into PP_PAIRS)
(() => {
  const { label, stage, spot } = SHEET, SIL = '#2C2630';
  // a pair side by side (his left, hers right), each placed by their widest half-width
  const duo = (him, her, cx, G, u, oM, oF, gap = .8) => {
    const wm = ppHalfW(him) * u, wf = ppHalfW(her) * u, g = gap * u, xm = cx - (wm + wf + g) / 2 + wm - wf * 0, xf = xm + wm + g + wf;
    const off = (xm + xf) / 2 - cx;
    person(xm - off, G, u, him, oM); person(xf - off, G, u, her, oF);
    return [xm - off, xf - off];
  };
  LOOPS.pairs = t => {
    stage(t); const tt = mt(t);
    piece(U([[-20, 720], [W + 20, 720], [W + 20, H + 20], [-20, H + 20]], 1), '#D6D0C4', { key: 'silpanel', lift: 4 });
    PP_PAIRS.forEach(([him, her, name], i) => {
      const cx = 320 + i * 640;
      spot(cx);
      duo(him, her, cx, 640, 25, { ...feel('neutral', tt, { seed: i }), boilKey: 'pm' + i, lookX: .35 }, { ...feel('neutral', tt, { seed: i + 3 }), boilKey: 'pf' + i, lookX: -.35 });
      label(name, cx, 690, 24);
      // silhouettes: front, and 3/4 facing each other
      ppSilhouette(() => {
        const sil = { noShadow: true, col: { blush: SIL } };
        duo(him, her, cx - 150, 1050, 13, { ...sil, boilKey: 'sm' + i }, { ...sil, boilKey: 'sf' + i }, .6);
        duo(him, her, cx + 150, 1050, 13, { ...sil, view: 'q', boilKey: 'sqm' + i }, { ...sil, view: 'q', flip: true, boilKey: 'sqf' + i }, .2);
      }, SIL);
    });
  };
  LOOPS.pairs.len = 4;

  // one pair: turnaround, four expressions each, and the two together
  const pairSheet = (him, her, together) => {
    const f = t => {
      stage(t); const tt = mt(t), u1 = 20, G = 530;
      let xx = 30;
      [[him, 'm'], [her, 'f']].forEach(([P, tag]) => {
        [['front', false, 'front'], ['q', false, '3/4'], ['q', true, '3/4 flip']].forEach(([v, fl, name], i) => {
          const hw1 = ppHalfW(P) * u1 + 14, x1 = xx + hw1 + (v === 'q' ? (fl ? -1 : 1) * PP_QS * u1 : 0);
          spot(xx + hw1, 300, 260);
          person(x1, G, u1, P, { ...feel('neutral', tt, { seed: i }), view: v, flip: fl, boilKey: 't' + tag + i });
          label(name, xx + hw1, G + 26, 17); xx += 2 * hw1;
        });
        xx += 40;
      });
      // expressions (busts: the head centre at y = 790), labels on a strip below
      piece(U([[-20, 580], [1262, 580], [1262, H + 20], [-20, H + 20]], 1), '#CFC8BC', { key: 'bustpanel', lift: 4 });
      const E = [['neutral', 'front', 'idle', 0], ['laugh', 'q', 'belly', -.12], ['angry', 'front', 'fists', .06], ['sad', 'q', 'low', .14]];
      [him, her].forEach((P, j) => E.forEach(([e, v, p, tilt], i) => {
        const bx = 84 + (j * 4 + i) * 155, by = 800, ub = 30, Fr = personFrame(P, { view: v });
        person(bx - Fr.hx * ub, by - Fr.hy * ub, ub, P, { ...feel(e, tt, { seed: i + j * 4 }), view: v, pose: p, tilt, noShadow: true, boilKey: 'b' + j + i, emoteK: e === 'sad' ? 0 : 1 });
      }));
      piece(U([[-20, 1022], [1262, 1022], [1262, H + 20], [-20, H + 20]], 1), '#E2DCD0', { key: 'buststrip', lift: 4 });
      [him, her].forEach((P, j) => E.forEach(([e], i) => label(e, 84 + (j * 4 + i) * 155, 1050, 18)));
      together(tt, 1600, 890);
    };
    f.len = 4; return f;
  };
  const u2 = 25;
  LOOPS.pairA = pairSheet(HIM_A, HER_A, (tt, cx, G) => {   // walking side by side: her little legs go twice as fast
    spot(cx, 480, 460);
    const ph = tt / (BEAT * 4);
    person(cx - 120, G - 28, u2 * .97, HIM_A, { ...feel('happy', tt), mouth: 'grin', view: 'q', walk: ph, lookY: .7, lookX: .6, tilt: .14, boilKey: 'wA' });
    person(cx + 70, G, u2, HER_A, { ...feel('smug', tt), mouth: 'open', view: 'q', walk: ph * 2 + .25, lookY: -1, lookX: -.2, tilt: -.1, boilKey: 'wB' });
    SHEET.label('together: walking (2 steps to his 1)', cx, G + 32, 17);
  });
  LOOPS.pairB = pairSheet(HIM_B, HER_B, (tt, cx, G) => {   // the sofa: he sinks in, she perches
    spot(cx, 480, 460);
    ppSofa(cx, G, u2, 14);
    person(cx - 2.7 * u2, G, u2, HIM_B, { ...feel('laugh', tt), seated: true, seatH: 3.45, pose: 'belly', boilKey: 'sB1' });
    person(cx + 3.9 * u2, G, u2, HER_B, { ...feel('smug', tt), seated: true, seatH: 3.85, view: 'q', flip: true, pose: 'mug', hold: s => ppMug(s, -1.35), boilKey: 'sB2', lookX: .3 });
    SHEET.label('together: the sofa', cx, G + 32, 17);
  });
  LOOPS.pairC = pairSheet(HIM_C, HER_C, (tt, cx, G) => {   // she uses him as an armrest
    spot(cx, 480, 460);
    const xm = cx - 95, xf = cx + 80, top = personFrame(HIM_C).top - .7;
    person(xm, G, u2, HIM_C, { ...feel('bored', tt), pose: 'cross', lookX: .6, lookY: -.4, boilKey: 'lC1' });
    person(xf, G, u2, HER_C, { ...feel('smug', tt), pose: { L: [(xm - xf) / u2 + 1.0, top - .3, .12, 'relax', 0, Math.PI + .1, 'u'], R: [.3, .42, .5, 'hold', 1, -1.25] }, hold: s => phone(s, .8), lookX: .2, lookY: .5, boilKey: 'lC2' });
    SHEET.label('together: the armrest', cx, G + 32, 17);
  });

  // close-ups of all six faces (front on top, 3/4 below), for checking the drawing at full resolution
  LOOPS.ppFaces = t => {
    stage(t); const tt = mt(t);
    const six = [HIM_A, HER_A, HIM_B, HER_B, HIM_C, HER_C], ub = 44;
    six.forEach((P, i) => [['front', 300], ['q', 800]].forEach(([v, by], j) => {
      const bx = 160 + i * 320, Fr = personFrame(P, { view: v });
      push(); person(bx - Fr.hx * ub, by - Fr.hy * ub, ub, P, { ...feel(j ? 'smug' : 'neutral', tt, { seed: i }), view: v, pose: 'low', noShadow: true, boilKey: 'fc' + i + j, emoteK: 0 }); pop();
    }));
  };
  LOOPS.ppFaces.len = 4;
  // the rig's range: supporting-cast builds with the other hair, tops and bottoms
  LOOPS.ppCast = t => {
    stage(t); const tt = mt(t);
    PP_CAST.forEach((P, i) => {
      const x = 130 + i * 276; spot(x);
      person(x, 870, 27, P, { ...feel(['neutral', 'happy', 'smug', 'bored', 'neutral', 'happy', 'surprised'][i], tt, { seed: i }), view: i % 2 ? 'q' : 'front', flip: i === 3, boilKey: 'cast' + i, emoteK: 0 });
      label(P.name, x, 925, 18);
    });
  };
  LOOPS.ppCast.len = 4;
  // pair C's faces up close: front and 3/4 (and flipped), neutral and smug, for checking heads and noses
  LOOPS.ppFacesC = t => {
    stage(t); const tt = mt(t), ub = 58;
    [HIM_C, HER_C].forEach((P, j) => [['front', false, 'neutral'], ['q', false, 'neutral'], ['q', true, 'smug']].forEach(([v, fl, e], i) => {
      const bx = 175 + (j * 3 + i) * 314, by = 470, Fr = personFrame(P, { view: v });
      person(bx - (fl ? -1 : 1) * Fr.hx * ub, by - Fr.hy * ub, ub, P, { ...feel(e, tt, { seed: i }), view: v, flip: fl, pose: 'low', noShadow: true, boilKey: 'fcC' + j + i, emoteK: 0 });
    }));
  };
  LOOPS.ppFacesC.len = 4;
  // pair C's heads in all four looks: front and 3/4 for each, a quarter of the frame per look
  LOOPS.ppHeadsC = t => {
    [['ink', 0], ['card', 1], ['flip', 2], ['engrave', 3]].forEach(([m, i]) => {
      look(m); const x0 = i * 480, tt = mt(t);
      boilSeed('hq' + m);
      _paint(U([[x0, -60], [x0 + 480, -60], [x0 + 480, H + 60], [x0, H + 60]], 1), { wash: m === 'ink' ? NOIR.char : m === 'flip' ? '#2A2338' : m === 'engrave' ? E_PAPER : '#B9B2A6', ink: null });
      [[HIM_C, 'front', 290], [HIM_C, 'q', 290], [HER_C, 'front', 790], [HER_C, 'q', 790]].forEach(([P, v, by], j) => {
        const bx = x0 + 125 + (j % 2) * 235, ub = 34, Fr = personFrame(P, { view: v });
        person(bx - Fr.hx * ub, by - Fr.hy * ub, ub, P, { ...feel(j % 2 ? 'smug' : 'neutral', tt, { seed: j }), view: v, pose: 'low', noShadow: true, boilKey: 'hc' + m + j, emoteK: 0 });
      });
    });
    look(LOOK_DEFAULT);
  };
  LOOPS.ppHeadsC.len = 4;
  // the favourite pair in all four looks, a quarter each
  const quarter = (m, x0) => {
    const R = (a, b, c, d) => U([[a, b], [c, b], [c, d], [a, d]], 1), x1 = x0 + 480;
    boilSeed('q' + m);
    if (m === 'ink') { _paint(R(x0, -60, x1, H + 60), { wash: NOIR.char, ink: null }); _paint(R(x0, 905, x1, H + 60), { wash: NOIR.shadow, ink: null }); inkLine([[x0, 906], [x1, 904]], 1.2, NOIR.ink, 'flash', 0); glow(x0 + 240, 560, 380, NOIR.lamp, .3); }
    else if (m === 'card') { _paint(R(x0, -60, x1, H + 60), { wash: '#8E8A84', ink: null }); piece(R(x0, -20, x1, 905), '#B9B2A6', { key: 'bd' + x0, lift: 0 }); }
    else if (m === 'flip') { _paint(R(x0, -60, x1, H + 60), { wash: '#2A2338', ink: null }); _paint(R(x0, 905, x1, H + 60), { wash: '#3A3050', ink: null }); }
    else { _paint(R(x0, -60, x1, H + 60), { wash: E_PAPER, ink: null }); inkLine([[x0, 906], [x1, 904]], 1.2, E_INK, 'ink', 0); }
  };
  LOOPS.pairLooks = t => {
    const [him, her] = PP_PAIRS[PP_FAV];
    [['ink', 'ink · the past'], ['card', 'card · the present'], ['flip', 'flip · the good future'], ['engrave', 'engrave · the bad future']].forEach(([m, name], i) => {
      look(m); const x0 = i * 480, tt = mt(t);
      quarter(m, x0);
      duo(him, her, x0 + 240, 905, 27, { ...feel('neutral', tt, { seed: 1 }), view: 'q', boilKey: 'lk' + i + 'm', lookX: .3 }, { ...feel('smug', tt, { seed: 2 }), view: 'q', flip: true, boilKey: 'lk' + i + 'f' }, .3);
      label(name, x0 + 240, 960, 20);
    });
    look(LOOK_DEFAULT);
  };
  LOOPS.pairLooks.len = 4;
})();

// ---------- a few supporting-cast builds (the rig's range: other hair, tops, bottoms, faces) ----------
function ppMerge(a, b) { const o = { ...a }; for (const k in b) o[k] = b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object' ? ppMerge(a[k], b[k]) : b[k]; return o; }
const PP_BASE = {
  body: { leg: 5.2, legW: .85, legW1: .72, legGap: .5, stance: .2, torso: 4.4, neck: .3, arm: 4.8, armW: .9, wrist: .72, hand: .78, foot: 1.2 },
  head: { w: 2.0, h: 4.6, crown: .96, cheek: 1, cheekY: 0, jaw: .82, jawY: .6, chin: .38, neck: .4 },
  face: { eyeY: 0, gap: .42, eye: .44, lash: 1.3, browY: .32, nose: { kind: 'button', w: 1, q: .24 }, noseY: .32, mouthY: .64, mouthW: .52, lips: .8, ear: .95 },
  top: { kind: 'jumper', neck: .8, sh: [2.1, .45], rows: [[2.2, 1.6], [2.1, 3.2], [2.15, 4.5, 1]], hemC: .1, band: .45, collar: 'crew' },
  legs: { kind: 'trousers' }, shoes: { kind: 'trainer' },
  col: { skin: '#C99A7A', skinDk: '#A87858', skinLt: '#E0B898', lip: '#A0584C', lipLt: '#C07868', iris: '#4A3020', hair: '#3A2A20', hairLt: '#6A5040', beard: '#3A2A20',
    coat: '#5E7F9A', coatDk: '#3E5A72', coatLt: '#8AA8C0', trousers: '#3A3E4E', trousersDk: '#282B38', shoe: '#E8E2D6', sole: '#C0B6A6', under: '#E8E2D6' },
};
const PP_CAST = [
  ppMerge(PP_BASE, { id: 'cs0', name: 'afro · hoodie', hair: { style: 'afro' }, face: { beard: 'stubble' }, top: { kind: 'hoodie', collar: 'hood' },
    col: { skin: '#8A5A40', skinDk: '#6A4230', skinLt: '#A8765A', hair: '#241A18', hairLt: '#4E3C36', beard: '#2A1E1C', coat: '#4A8A6A', coatDk: '#2E6048', coatLt: '#7AB090', under: '#F2EEE6' } }),
  ppMerge(PP_BASE, { id: 'cs1', name: 'bob · skirt', body: { leg: 4.8, torso: 4.0, arm: 4.4 }, head: { w: 1.95, h: 4.3, jaw: .8, chin: .34 }, hair: { style: 'bob' }, glasses: null,
    face: { eyeY: .02, eye: .4, tall: .85, lash: 1.6, flicks: 2, nose: { kind: 'button', w: .9 } }, top: { kind: 'jumper', stripe: 1.2 }, legs: { kind: 'skirt', len: .45, flare: .8 }, shoes: { kind: 'boot' },
    col: { skin: '#E6C2A0', skinDk: '#C9A080', skinLt: '#F2D8BE', hair: '#1C1618', hairLt: '#3E3436', coat: '#E8D8B0', coatDk: '#BCA880', coatLt: '#7A5AA0', skirt: '#5A3E72', skirtDk: '#3E2A52', trousers: '#2A2430', trousersDk: '#1C1820', shoe: '#2A2230', sole: '#1A151C' } }),
  ppMerge(PP_BASE, { id: 'cs2', name: 'part · jumper', body: { leg: 5.6, torso: 4.6 }, head: { w: 1.95, h: 4.8, jaw: .86, chin: .45 }, hair: { style: 'part' }, face: { beard: 'stubble', nose: { kind: 'long', w: .9, q: .3 } },
    col: { skin: '#E8C0A8', skinDk: '#CC9C84', skinLt: '#F4D6C4', hair: '#8A6A40', hairLt: '#B8945E', beard: '#8A6A40', coat: '#8A3A4A', coatDk: '#62283A', coatLt: '#B05A6A', lip: '#B86A5E' } }),
  ppMerge(PP_BASE, { id: 'cs3', name: 'long · coat', body: { leg: 5.6, torso: 4.4 }, head: { w: 1.85, h: 4.7, jaw: .78, chin: .3 }, hair: { style: 'long' }, face: { lash: 1.6, flicks: 2, nose: { kind: 'long', w: .9, q: .26 } },
    top: { kind: 'coat', neck: .7, sh: [2.0, .4], rows: [[2.05, 1.6], [1.9, 3.0], [2.2, 7.4, 1]], collar: 'lapel', vDepth: 1.8, buttons: [[.1, 2.4], [.1, 3.4]] },
    col: { skin: '#D6A882', skinDk: '#B8886A', hair: '#5A3A22', hairLt: '#8A6040', hairDk: '#3A2414', coat: '#6A7A58', coatDk: '#4A5A3C', under: '#E8E0D0', lip: '#A8584A' } }),
  ppMerge(PP_BASE, { id: 'cs4', name: 'bald · beard · parka', body: { leg: 4.6, torso: 4.8 }, head: { w: 2.15, h: 4.6, jaw: .9, chin: .5 }, hair: { style: 'bald' }, face: { beard: 'full', nose: { kind: 'round', w: 1.1, q: .3 }, lid: .15 },
    top: { kind: 'parka', neck: .9, sh: [2.4, .5], rows: [[2.6, 1.6], [2.7, 3.4], [2.6, 5.4, 1]], band: .5, collar: 'ruff', ruff: [2.0, .75, 0] },
    col: { skin: '#B07A58', skinDk: '#8C5C40', skinLt: '#C8946E', beard: '#8A8078', beardLt: '#B8B0A8', hair: '#8A8078', coat: '#3E5060', coatDk: '#2A3844', coatLt: '#6A8090', fur: '#948A7A', furDk: '#645C50' } }),
  ppMerge(PP_BASE, { id: 'cs5', name: 'twists · puffer', body: { leg: 5.0, torso: 4.4 }, hair: { style: 'twists', twists: 11 }, face: { beard: 'tache', eye: .46 },
    top: { kind: 'puffer', neck: .9, sh: [2.3, .6], rows: [[2.8, 1.6], [2.9, 3.0], [2.6, 4.6]], band: .45, quilt: 1.0, collar: 'crew' },
    col: { skin: '#6E4432', skinDk: '#4E2E22', skinLt: '#8E5E46', hair: '#221A1A', hairLt: '#504040', beard: '#221A1A', coat: '#2A2A34', coatDk: '#16161E', coatLt: '#4A4A58', under: '#2A2A34' } }),
  ppMerge(PP_BASE, { id: 'cs6', name: 'crop · glasses', hair: { style: 'crop', lineup: false, hairline: -.55 }, glasses: { r: .34, t: .07 },
    col: { skin: '#D4A47C', skinDk: '#B4845E', hair: '#2A1E16', hairLt: '#4E3E30', coat: '#C8B888', coatDk: '#9A8A5E', coatLt: '#E0D4B0', glasses: '#2A2A2A' } }),
];

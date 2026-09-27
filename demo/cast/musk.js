// cast/musk.js: a satirical caricature of Elon Musk (public persona only). Tall, broad-shouldered and a little gangly;
// a long face on a huge wide jaw with a big cleft chin, broad cheekbones, small deep-set hooded eyes under flat brows,
// a straight longish nose, thick dark hair pushed up and back from a high M-shaped hairline, and the signature: an
// enormous piano-key grin (and an awkward open-mouthed laugh). All black: blazer over a black tee, rim-lit so he
// separates from dark sets. White gloves (tech bosses always wear them).
//
// musk(x, y, u, o): (x, y) = the ground point between his feet; u = unit (the commuter's unit: he's ~15.4u tall to the
// top of his hair, shoulders ~5.5u wide, head ~4.2u wide).
// Views: front | q (3/4, facing right; flip: true faces left). Takes feel()/emotions() spreads for the face and body
// life (dy, sq, rot, dx, eyes, mouth, lookX/Y, squint, emote, blush, gloom), plus:
//   pose: a name from MKPOSE, or { L, R } from mkPoses() · tilt (head, rad) · seated (no legs) · jump 0..1 (airborne,
//   knees tucked) · jaw 0..1 (override the jaw drop) · mouth: any mkMouth kind (grin smile laugh open shout grimace
//   smirk flat frown wobble o) · rim: rim-light colour (null = none) · boilKey · noShadow
//   hold / holdL: (s) => draws a prop in the right / left hand, in hand space (as commuter())
//   flute / fluteL: true | fill | { fill, clink, tilt }: a champagne flute (props.js) held UPRIGHT in that hand
//   layer: 'back' (everything but the in-front arms) | 'front' (only the in-front arms and the emote): draw a banquet
//   table between the two calls so his hands rest on it (give both calls the same boilKey) · 'head' (head, neck and
//   collar only: for the neon ad / portraits)
// mkAnchors(x, y, u, o) returns world points for composing: { R, L } (wrists), { fluteR, fluteL } (rims), head.
const MK = {
  skin: '#D6AC9A', skinDk: '#A87C6E', skinLt: '#ECCDBE', sock: '#C19686', line: '#7E5850', lipLt: '#B27A70', lip: '#C08A80', blush: '#CF8680',
  hair: '#33241B', hairDk: '#1A110C', hairLt: '#5E4838',
  blazer: '#29252E', blazerDk: '#141117', lapel: '#36313C', tee: '#1C191F', rim: '#B3A39C',
  trousers: '#2E2A34', trousersDk: '#1B181F', shoe: '#1A171D', sole: '#4E4854',
  iris: '#5A7C8A', teeth: '#F6F0E4', teethLn: '#8C7F76', mouth: '#3A1418', tongue: '#C4566A',
};
// Hand targets in body units: [x, y, bend, hand pose, front (drawn over the body), hand angle (rad, optional: overrides
// the forearm's direction)]. x/y are for the front view (the q view shifts them a little toward the facing side).
// (Body units: multiply by MK_S for the caller's u.) Shoulders are at about (±2.3, -8.2); for seated poses put the table
// top at about y = -5.3 body units, i.e. y - 4.9u in the caller's units.
const MKPOSE = {
  idle:       { L: [-3.0, -4.8, .14, 'relax'], R: [3.0, -4.8, .14, 'relax'] },
  hips:       { L: [-2.4, -5.7, .85, 'fist'], R: [2.4, -5.7, .85, 'fist'] },
  toast:      { L: [-3.0, -4.8, .14, 'relax'], R: [3.4, -10.9, .38, 'hold', 1, -1.05] },            // glass raised to the side
  clink:      { L: [-3.0, -4.8, .14, 'relax'], R: [4.5, -10.2, .2, 'hold', 1, -.7] },                // glass pushed out to clink
  laugh:      { L: [-.9, -6.3, .5, 'relax', 1, .25], R: [3.7, -7.6, .5, 'open', 1, -.9] },           // hand on belly, the other up to slap
  slap:       { L: [-.9, -6.3, .5, 'relax', 1, .25], R: [3.2, -5.4, .35, 'open', 1, .12] },          // ...and down on the table (alternate on the beat)
  toastLaugh: { L: [-3.2, -5.4, .32, 'open', 1, Math.PI - .12], R: [3.3, -10.0, .4, 'hold', 1, -1.05] },
  point:      { L: [-3.0, -4.8, .14, 'relax'], R: [5.1, -9.2, .06, 'point', 1, -.1] },
  jump:       { L: [-3.5, -13.2, .22, 'open', 0, -1.95], R: [3.5, -13.2, .22, 'open', 0, -1.2] },    // both arms up (jump: pass o.jump)
  shrug:      { L: [-4.1, -6.9, .22, 'open', 0, Math.PI + .4], R: [4.1, -6.9, .22, 'open', 0, -.4] },
  chin:       { L: [.2, -6.8, .45, 'relax', 1, .1], R: [.9, -8.7, .7, 'fist', 1, -1.75] },           // smug chin stroke
  table:      { L: [-2.1, -5.4, .35, 'relax', 1, .15], R: [2.1, -5.4, .35, 'relax', 1, Math.PI - .15] },
};
// Blend between poses over time (like commuter's poses()): keys [[t, name | {L, R}], ...].
function mkPoses(t, keys, blend = .3) {
  let i = 0; while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
  const get = v => typeof v === 'string' ? MKPOSE[v] : v, cur = get(keys[i][1]); if (i === 0) return cur;
  const prev = get(keys[i - 1][1]), k = backOut(seg(t, keys[i][0], keys[i][0] + blend));
  const ang = (a, b) => a == null || b == null ? (k < .5 ? a : b) : lerp(a, b, k);
  const mix = (a, b) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k), k < .5 ? a[3] : b[3], k < .5 ? a[4] : b[4], ang(a[5], b[5])];
  return { L: mix(prev.L, cur.L), R: mix(prev.R, cur.R) };
}
// props.js's flute() says its bowl points up the hand's -y, but it rotates by -PI/2 first, which lays it along -x. Undo
// that here (and nothing, once it's fixed) so his glass stands upright.
const mkFluteFix = () => typeof flute === 'function' && /rotate\(\s*-\s*Math\.PI\s*\/\s*2\s*\)/.test(String(flute)) ? Math.PI / 2 : 0;

// Rim light along the lit side of a rubber-hose limb (ink only): limb() has no rim of its own.
function mkRim(P, w0, w1, sw, col, from = .2, to = 1) {
  if (STYLE.card || !col) return;
  const C = through(P, 10), n = C.length, [lx, ly] = lightLocal(), runs = []; let cur = [];
  for (let i = Math.floor(n * from); i < Math.ceil(n * to); i++) {
    const a = C[Math.max(0, i - 1)], b = C[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
    let nx = -dy / d, ny = dx / d; if (nx * lx + ny * ly < 0) { nx = -nx; ny = -ny; }
    const f = nx * lx + ny * ly, w = lerp(w0, w1, i / (n - 1)) / 2 - sw * 1.6;
    if (f > .3) cur.push([C[i][0] + nx * w, C[i][1] + ny * w]); else if (cur.length) { runs.push(cur); cur = []; }
  }
  if (cur.length) runs.push(cur);
  for (const r of runs) if (r.length > 2) inkLine(r, sw * .55, col, 'flashfine', 0);
}

// A cel shadow like piece()'s o.shade, but kept inside the shape: crescent() pulls its inner edge toward the light, which
// on a jutting chin can poke out past the silhouette; any such point is pinned back onto the outline.
function mkShade(P, depth, col) {
  const C = crescent(P, STYLE.card ? depth * .8 : depth); if (!C) return;
  const n = C.length / 2, inside = ([x, y]) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) if ((P[i][1] > y) !== (P[j][1] > y) && x < (P[j][0] - P[i][0]) * (y - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0]) c = !c; return c; };
  const out = C.map((p, i) => i < n || inside(p) ? p : C[2 * n - 1 - i]);
  paint(out, { wash: col, washOp: STYLE.card ? 120 : 255, ink: null });
}

// His face settings: faceOf() plus his small, narrow, heavy-lidded eyes (smiles squint rather than close; even wide
// open, the hood keeps a little of the lid down).
function mkFaceOf(o) {
  const F = faceOf(o);
  if (F.style === 'happy') Object.assign(F, { style: 'open', open: .74, lower: .5 });
  F.open = (F.open ?? .92) >= 1 ? .9 : (F.open ?? .92) * .7; F.tall = (F.tall ?? 1) * .76; F.lower = Math.max(F.lower || 0, .16);
  return F;
}

// A small, deep-set, hooded eye (drawn here rather than with eyeH() so the lids follow the eye's own outline): a shadowed
// socket under the brow, the white, iris and pupil, a heavy upper lid with its crease, a lower lid, and a bag.
// (x, y) centre, s = eye width px, side -1 = screen left (its outer corner points away from the nose); o.sx (3/4: the far
// eye squeezed across, iris and lids with it, so the two gazes stay parallel).
function mkEye(x, y, s, F, side, o) {
  if (STYLE.card && typeof cardEye === 'function') { F = cardEye(F); if (o.look) o = { ...o, look: cardEye({ look: o.look }).look }; }   // (card: the eye chart, mouths.js)
  const sw = o.sw, rx = s * .5, ry = s * .58 * F.tall, key = o.key, fx = o.sx ?? 1, L = ([a, b]) => [x + side * a * fx, y + b];
  piece(curvy([[-rx * 1.25, ry * .15], [-rx * 1.1, -ry * 1.35], [rx * .25, -ry * 1.85], [rx * 1.4, -ry * 1.25], [rx * 1.55, -ry * .05], [rx * 1.1, ry * .7], [rx * .1, ry * 1.0], [-rx * .85, ry * .75]].map(L), 6), MK.sock, { ink: null, key: key + 'sock', lift: 0, flatCard: true, edge: false });
  const shut = (arch, w = 1.3) => dline([[-rx * 1.05, ry * .2], [0, -ry * arch], [rx * 1.05, ry * .25]].map(L), sw * w, NOIR.ink, .5);
  if (F.style === 'squeeze') {   // laughing (or wincing): shut in arcs, with crow's feet
    shut(.45, 1.35);
    for (const [a, b] of [[-.55, -.12], [-.05, .02], [.45, .14]]) dline([[rx * 1.25, ry * a * .4], [rx * 1.75, ry * (a + b) * 1.1]].map(L), sw * .55, MK.line, 0);
    return;
  }
  if (o.blink || F.style === 'shut') { shut(-.25); return; }
  // the white, a little droopy at the outer corner
  const E = curvy([[-rx, -ry * .08], [-rx * .5, -ry * .95], [rx * .4, -ry * .98], [rx, ry * .06], [rx * .55, ry * .82], [-rx * .45, ry * .8]], 5), N = E.length / 6;
  piece(E.map(L), '#F4EEE4', { ink: null, key: key + 'w', lift: 2, flatCard: true });   // no outline: washes don't hide ink, so lids couldn't cover it
  const lk = o.look || [0, 0], ir = s * .34 * (F.iris ?? 1), ix = x + lk[0] * rx * .4 * fx, iy = y + lk[1] * ry * .3 + ry * .1;
  piece(oval(ix, iy, ir * fx, ir * 1.05, 0, 20), MK.iris, { ink: null, key: key + 'i', lift: 1, flatCard: true });
  piece(oval(ix, iy, ir * .52 * fx, ir * .55, 0, 16), '#140C10', { ink: null, key: key + 'p', lift: 0, flatCard: true });
  piece(oval(ix - ir * .36 * fx, iy - ir * .4, ir * .28 * fx, ir * .28, 0, 10), '#FFFFFF', { ink: null, key: key + 'h', lift: 0, flatCard: true });
  // lids: skin coming down to the lash line and up from below, each cut to the eye's own outline (grown over its ink)
  const grow = 1 + sw * 1.3 / rx, G = P => P.map(([a, b]) => [a * grow, b * grow]);
  const open = clamp(F.open ?? 1), lidY = lerp(ry * .55, -ry * 1.02, open), low = clamp(F.lower || 0);
  const lid = through([[rx * grow, ry * .06], [rx * .5, lidY * .9 + ry * .06], [0, lidY], [-rx * .5, lidY * .96], [-rx * grow, -ry * .08]], 5);
  if (open < .99) piece(G(E.slice(0, 3 * N + 1)).concat(lid).map(L), MK.sock, { ink: null, key: key + 'lid', lift: 0, flatCard: true, edge: false });
  if (low > .02) {
    const ly = lerp(ry * .95, -ry * .15, low), bot = through([[-rx * grow, -ry * .08], [-rx * .5, ly * .92], [0, ly], [rx * .5, ly * .95 + ry * .03], [rx * grow, ry * .06]], 5);
    piece(G(E.slice(3 * N).concat([E[0]])).concat(bot).map(L), MK.sock, { ink: null, key: key + 'low', lift: 0, flatCard: true, edge: false });
    dline(bot.slice(1, -1).map(L), sw * .6, NOIR.ink, .3);
  } else dline(E.slice(3 * N).concat([E[0]]).map(L), sw * .6, NOIR.ink, .3);
  dline(lid.slice().reverse().concat([[rx * 1.18, lidY * .35 + ry * .12]]).map(L), sw * 1.55, NOIR.ink, .3);   // lash line, a flick at the outer corner
  // the hood: a fold of skin that sits low over the lid and droops past the outer corner (his sleepy, heavy-lidded look)
  dline([[-rx * .75, -ry * 1.02], [-rx * .1, -ry * 1.22], [rx * .6, -ry * 1.12], [rx * 1.08, -ry * .6], [rx * 1.3, -ry * .15]].map(L), sw * .6, MK.line, .5);
  dline([[-rx * .5, ry * 1.12], [rx * .3, ry * 1.24], [rx * .95, ry * 1.0]].map(L), sw * .45, MK.skinDk, .5);                          // a bag under it
}
// Low, nearly straight brow: thick at the inner end, a small hump two-thirds out, the outer end dipping toward the
// temple (his brows sit close over the hooded eyes). raise [inner, outer] in brow widths (+ = up).
function mkBrow(x, y, w, raise, side, sw, key) {
  const [ri, ro] = raise, X = d => x + side * d;
  const P = [[X(-w * .5), y - ri * w * .55 + w * .02], [X(-w * .1), y - w * .05 - ri * w * .4 - ro * w * .15], [X(w * .3), y - w * .08 - ro * w * .45 - ri * w * .1], [X(w * .6), y - ro * w * .55 + w * .05]];
  browPiece(browShape(P, w * .19, w * .05), MK.hair, sw, key);   // (style.js: a smooth taper, a round inner end)
}
// His noses, as the cast's (bosses.js bsNoseF / bsNoseQ; musk.js loads without bosses.js, so his own copies). Front: a
// bridge shadow down the side away from the light, then one soft shape (the bulb and both wings merged), outlined round
// the wings and under the tip, open over the top where the bridge runs in; nostrils; a highlight.
// N: { tw, th (the bulb's radii), wr, wx, wy (the wings), top (the bridge's root) }, head units through HP.
function mkNoseF(HP, u, sw, nx, ny, N) {
  const nshade = mixCol(MK.skin, MK.skinDk, .55), nline = mixCol(MK.skinDk, NOIR.ink, .4);
  piece(ribbon(HP([[nx + .05, N.top], [nx + N.tw * .42, lerp(N.top, ny, .62)], [nx + N.tw * .78, ny - N.th * .55]]), .04 * u, N.tw * .5 * u), nshade, { ink: null, key: 'mknbridge', lift: 0, flatCard: true, edge: false, maxTone: .45 });
  dline(HP([[nx - .05, lerp(N.top, ny, .2)], [nx - N.tw * .32, lerp(N.top, ny, .72)]]), sw * .5, MK.skinLt, .5);
  const NU = ellipseUnion([[nx, ny, N.tw, N.th], [nx - N.wx, ny + N.wy, N.wr, N.wr * .85], [nx + N.wx, ny + N.wy, N.wr, N.wr * .85]], [nx, ny + N.wy * .5]);
  if (STYLE.mode === 'doodle') _paint(HP(NU), { wash: '#FBF8F0', ink: null });
  piece(HP(NU), MK.skin, { ink: null, shade: MK.skinDk, depth: N.th * .5 * u, key: 'mknose', lift: 1, flatCard: true, maxTone: .45 });
  const skip = a => { const d = ((a + Math.PI / 2) % TAU + TAU) % TAU; return d > TAU - .95 || d < .95; };
  const run = openRun(NU, skip); if (run.length > 2) dline(HP(run), sw * .62, nline, .5);
  for (const sd of [-1, 1]) piece(oval(...HP([[nx + sd * N.wx * .52, ny + N.th * .78]])[0], N.wr * .42 * u, N.wr * .24 * u, sd * .45, 14), mixCol(MK.skinDk, NOIR.ink, .55), { ink: null, key: 'mknh' + sd, lift: 0, flatCard: true, edge: false });
  piece(oval(...HP([[nx - N.tw * .35, ny - N.th * .4]])[0], N.tw * .28 * u, N.th * .2 * u, -.5, 12), MK.skinLt, { ink: null, key: 'mknhl', lift: 0, flatCard: true, edge: false });
}
// 3/4 (facing right): the ridge grows from the root between the eyes (nearer the far eye, just under the brows), runs
// down past the far eye's inner corner and meets the bulb along its tangent; the bulb breaks the cheek's line; the near
// wing and its nostril sit inside the face. One line runs down the ridge and round the tip (at the outline's weight
// where it's out past the head, headP).
function mkNoseQ(HP, u, sw, headP, N) {
  const [tx, ty] = N.tip, tr = N.tr, th = N.th, [wx, wy] = N.wing, wr = N.wr;
  const nline = mixCol(MK.skinDk, NOIR.ink, .45), nshade = mixCol(MK.skin, MK.skinDk, .5);
  const lp = N.ridge[N.ridge.length - 1], px0 = (lp[0] - tx) / tr, py0 = (lp[1] - ty) / th, dd = Math.hypot(px0, py0);
  const a0 = Math.atan2(py0, px0) + (dd > 1.02 ? Math.acos(1 / dd) : .3), J = [tx + Math.cos(a0) * tr, ty + Math.sin(a0) * th];
  const arc = (cx, cy, rx, ry, b0, b1, n = 12) => { const P = []; for (let i = 0; i <= n; i++) { const a = lerp(b0, b1, i / n); P.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return P; };
  const R = through(N.ridge, 6).concat([[lerp(lp[0], J[0], .5), lerp(lp[1], J[1], .5)], J]), tipArc = arc(tx, ty, tr, th, a0, Math.PI * .72, 14).slice(1);
  const wingArc = arc(wx, wy, wr, wr * .9, Math.PI * .42, Math.PI * 1.3, 12), n = R.length, nw = N.nw ?? .3;
  const back = R.slice(0, Math.floor(n * .8)).map(([a, b], i) => [a - lerp(.05, nw, Math.pow(i / (n - 1), .8)), b + lerp(.03, nw * .3, i / (n - 1))]).reverse();
  const fill = HP(R.concat(tipArc, wingArc, back));
  if (STYLE.mode === 'doodle') _paint(fill, { wash: '#FBF8F0', ink: null });
  piece(fill, MK.skin, { ink: null, shade: MK.skinDk, depth: th * .6 * u, key: 'mknoseq', lift: 1, flatCard: true, edge: false, maxTone: .45 });
  piece(ribbon(HP(R.slice(Math.floor(n * .2)).map(([a, b], i, A) => [a - lerp(.03, tr * .45, i / (A.length - 1)), b + lerp(.02, th * .25, i / (A.length - 1))])), .02 * u, tr * .7 * u), mixCol(MK.skin, nshade, .7), { ink: null, key: 'mknbridgeq', lift: 0, flatCard: true, edge: false, maxTone: .45 });
  const P = HP(R.concat(tipArc.slice(0, -2)));
  dline(P, sw * .8, nline, .4);
  if (!STYLE.card && headP) {
    let run = [];
    const flush = () => { if (run.length > 1) edgeLine(run, sw * (STYLE.mode === 'ink' ? .8 : 1.1), NOIR.ink, false); run = []; };
    P.forEach(p => { if (!inPoly(p[0], p[1], headP)) run.push(p); else { if (run.length) run.push(p); flush(); } });
    flush();
  }
  dline(HP(arc(wx, wy, wr, wr * .9, -Math.PI * .92, Math.PI * .4, 12)), sw * .55, nline, .5);
  piece(oval(...HP([[lerp(wx, tx, .55), ty + th * .72]])[0], wr * .45 * u, wr * .2 * u, -.2, 12), mixCol(MK.skinDk, NOIR.ink, .6), { ink: null, key: 'mknhq', lift: 0, flatCard: true, edge: false });
  piece(oval(...HP([[tx - tr * .25, ty - th * .45]])[0], tr * .28 * u, th * .18 * u, -.4, 12), MK.skinLt, { ink: null, key: 'mknhlq', lift: 0, flatCard: true, edge: false });
}

// His mouth, centred at (cx, cy); W0 = the half-width of his full grin (px); far 0..1 squeezes the right half (3/4).
// kind: grin (a lopsided toothy grin, both rows) smile (upper row) laugh open shout grimace smirk flat frown wobble o sigh.
// The closed mouths are his: pressed thin upper lip over a full, pushed-up lower lip, one corner a touch higher.
const MK_MW = { grin: .92, smile: .86, laugh: .9, open: .8, shout: .42, o: .2, sigh: .2, grimace: .82, smirk: .68, flat: .62, frown: .6, wobble: .58 };
function mkMouth(cx, cy, W0, kind, o = {}) {
  const sw = o.sw ?? 1.4, far = o.far ?? 1, jaw = o.jaw || 0, k = o.key || 'mkm', W = W0 * (MK_MW[kind] ?? .7);
  const P = (x, y) => [cx + (x > 0 ? x * far : x) * W, cy + y * W];
  const run = (f, a, b, n = 16) => { const out = []; for (let i = 0; i <= n; i++) { const xx = lerp(a, b, i / n); out.push(P(xx, f(xx))); } return out; };
  const shape = (top, bot, a = -1, b = 1, n = 16) => run(top, a, b, n).concat(run(bot, a, b, n).reverse());
  const ln = (pts, w, col = NOIR.ink, c = .5) => dline(pts.map(([x, y]) => P(x, y)), w, col, c);
  const keysAt = (top, bot, xs, w = sw * (STYLE.card ? .75 : .42)) => { for (const xx of xs) dline([P(xx, top(xx) + .005), P(xx, bot(xx) - .005)], w, MK.teethLn, 0); };
  const hole = (top, bot) => piece(shape(top, bot), MK.mouth, { sw: sw * .9, key: k + 'o', lift: 1, flatCard: true });
  const teeth = (top, bot, a, b, key) => piece(shape(top, bot, a, b, 14), MK.teeth, { ink: null, key: k + key, lift: 0, flatCard: true });
  const sq1 = x => Math.max(0, 1 - x * x), lowerLip = (y0, a = .45) => ln([[-a, y0], [0, y0 + .06], [a, y0]], sw * .65, MK.lipLt);
  const corners = (y0, d = 1) => { for (const s of [-1, 1]) ln([[s * 1.0, y0 - .13 * d], [s * 1.09, y0], [s * 1.02, y0 + .13 * d]], sw * .6); };
  // the full lower lip: a soft crescent under the mouth line (dx shifts it toward the lifted corner), its shadow below
  const fullLip = (y0, a, h, dx = 0) => { const top = [], bot = []; for (let i = 0; i <= 10; i++) { const t = -1 + i / 5, x = dx + t * a; top.push(P(x, y0 + .02 * t * t)); bot.push(P(x, y0 + h * Math.pow(Math.max(0, 1 - t * t), .7))); }
    piece(top.concat(bot.reverse()), MK.lip, { ink: null, key: k + 'lip', lift: 0, flatCard: true, edge: false, maxTone: .45 }); ln([[dx - a * .55, y0 + h * 1.02], [dx, y0 + h * 1.12], [dx + a * .55, y0 + h * 1.02]], sw * .5, MK.lipLt); };
  const UP = [0, -.18, .18, -.35, .35, -.5, .5, -.63, .63, -.75, .75, -.85, .85];
  switch (kind) {
    case 'grin': case 'smile': {   // the toothy grin, hitched up on the right
      const g = kind === 'grin', h = (g ? .46 : .34) + jaw * .3;
      const top = x => -.02 - .17 * x ** 4 - .07 * x, bot = x => top(x) + h * Math.pow(sq1(x), .7);
      hole(top, bot);
      const tT = x => top(x) + .04, tB = x => top(x) + h * (g ? .52 : .64) * Math.pow(sq1(x), .42);
      teeth(tT, tB, -.92, .92, 't'); keysAt(tT, tB, UP);
      dline(run(tB, -.9, .9, 12), sw * .4, MK.teethLn, .3);
      if (g) {
        const lB = x => bot(x) - .035, lT = x => Math.min(lB(x), bot(x) - h * .3 * Math.sqrt(Math.max(0, 1 - (x / .74) ** 2)));
        teeth(lT, lB, -.74, .74, 'l'); keysAt(lT, lB, [-.13, .13, -.34, .34, -.52, .52]);
      }
      fullLip(bot(0) + .05, .5, .2); corners(top(1));
      break;
    }
    case 'laugh': case 'open': {   // the awkward open-mouthed laugh
      const lg = kind === 'laugh', h = (lg ? .72 : .5) + jaw * .55;
      const top = x => -.06 - .12 * x ** 4 - .06 * sq1(x), bot = x => top(x) + h * Math.pow(sq1(x), .6);
      hole(top, bot);
      const tT = x => top(x) + .04, tB = x => top(x) + .21 * Math.pow(sq1(x), .3);
      teeth(tT, tB, -.9, .9, 't'); keysAt(tT, tB, UP);
      const gB = x => bot(x) - .04, gT = x => Math.min(gB(x), bot(x) - h * .4 * Math.sqrt(Math.max(0, 1 - (x / .62) ** 2)));
      piece(shape(gT, gB, -.62, .62, 12), MK.tongue, { ink: null, key: k + 'g', lift: 0, flatCard: true });
      ln([[0, gT(0) + .06], [0, gT(0) + h * .2]], sw * .45, mixCol(MK.tongue, MK.mouth, .5), 0);
      lowerLip(bot(0) + .14, .38); corners(top(1));
      break;
    }
    case 'shout': {   // surprised: a tall O with the top teeth showing
      const h = 1.0 + jaw * .6, top = x => -.32 * Math.sqrt(sq1(x)), bot = x => top(x) + h * Math.pow(sq1(x), .5);
      hole(top, bot);
      const tT = x => top(x) + .06, tB = x => top(x) + .26 * Math.pow(sq1(x), .3);
      teeth(tT, tB, -.8, .8, 't'); keysAt(tT, tB, [0, -.3, .3, -.56, .56]);
      const gB = x => bot(x) - .05, gT = x => Math.min(gB(x), bot(x) - h * .32 * Math.sqrt(Math.max(0, 1 - (x / .6) ** 2)));
      piece(shape(gT, gB, -.6, .6, 12), MK.tongue, { ink: null, key: k + 'g', lift: 0, flatCard: true });
      break;
    }
    case 'grimace': {   // angry: clenched piano keys, lips pulled back, corners down
      const top = x => -.14 + .13 * x * x, bot = x => top(x) + .36 * Math.pow(Math.max(0, 1 - x ** 4), .5), mid = x => (top(x) + bot(x)) / 2 + .01;
      hole(top, bot);
      const tT = x => top(x) + .035, tB = x => bot(x) - .035;
      teeth(tT, tB, -.95, .95, 't');
      dline(run(mid, -.92, .92, 12), sw * .55, NOIR.ink, .3);
      keysAt(tT, mid, [0, -.2, .2, -.38, .38, -.55, .55, -.7, .7, -.83, .83]); keysAt(mid, tB, [-.1, .1, -.29, .29, -.47, .47, -.63, .63, -.77, .77]);
      for (const s of [-1, 1]) ln([[s * .98, top(1) - .12], [s * 1.1, top(1) + .08], [s * 1.02, top(1) + .28]], sw * .6);
      break;
    }
    case 'smirk':   // smug: pressed lips, the lower lip pushed up, hooked up hard at one corner
      fullLip(.06, .6, .34, .12);
      ln([[-1, .04], [-.45, .06], [.2, .03], [.7, -.1], [1, -.36]], sw * 1.15, NOIR.ink, .5);
      ln([[.9, -.58], [1.12, -.36], [1.07, -.12]], sw * .6, NOIR.ink, .5);
      ln([[-1.02, -.05], [-1.08, .06]], sw * .5, NOIR.ink, 0);
      break;
    case 'frown': fullLip(.06, .56, .3); ln([[-1, .22], [-.45, 0], [.45, 0], [1, .22]], sw * 1.1, NOIR.ink, .5); break;
    case 'wobble': fullLip(.06, .56, .3); ln([[-1, .02], [-.5, -.06], [0, .03], [.5, -.06], [1, .02]], sw, NOIR.ink, .4); break;
    case 'o': case 'sigh': piece(oval(cx + (kind === 'sigh' ? W * .3 : 0), cy + W * .1, W * .9, W * 1.05, 0, 16), MK.mouth, { sw: sw * .8, key: k + 'oo', lift: 1, flatCard: true }); break;
    default:   // flat: lips pressed together, the full lower lip pushed up (a pout), lifted a touch at one corner
      fullLip(.05, .62, .34);
      ln([[-1, .03], [-.55, .04], [0, -.01], [.55, .01], [1, -.1]], sw * 1.1, NOIR.ink, .4);
      for (const sd of [-1, 1]) ln([[sd * 1.02, -.14], [sd * 1.09, -.03], [sd * 1.04, .07]], sw * .5, NOIR.ink, .5);
  }
}

// ---------- the figure ----------
// He's built in body units a touch bigger than the commuter's; MK_S scales them to the caller's u (~15.4u tall).
const MK_S = .93;
// Shoulder (arm root) in body units: in-front arms start at the shoulder's edge so the sleeve reads as coming out of it.
const mkRoot = (q, s, front) => front ? (q ? (s < 0 ? [-2.05, -8.1] : [2.5, -7.7]) : [s * 2.45, -8.1]) : (q ? [.3 + (s < 0 ? -2.05 : 1.95), -8.15] : [s * 2.3, -8.15]);
// Head geometry, in units from the chin (0) up; front and 3/4. The chin sits at y = MK_H0 on the body.
const MK_H0 = -9.1;
// (long, and heavy below: the cheeks run nearly straight down into a broad, fleshy jaw and a wide rounded chin)
const mkSym = (R, top, bot) => [[0, top], ...R, [0, bot], ...R.slice().reverse().map(([a, b]) => [-a, b])];
const MK_HEAD_F = mkSym([[1.15, -6.02], [1.68, -5.62], [1.92, -4.95], [2.02, -4.2], [2.1, -3.45], [2.16, -2.8], [2.22, -2.1], [2.24, -1.5], [2.15, -.95], [1.92, -.5], [1.52, -.2], [1.0, -.03], [.48, .05]], -6.14, .07);
// (3/4: the far side is the brow, the cheek and the heavy jowl, then the chin standing out a little past the mouth; the
// nose is its own piece (mkNoseQ), its long tip breaking the cheek's line; the near side is the jaw back to the ear)
const MK_HEAD_Q = [[.22, -6.14], [1.32, -6.0], [1.95, -5.48], [2.2, -4.75], [2.3, -4.05], [2.26, -3.62], [2.3, -3.1], [2.37, -2.5], [2.44, -1.9], [2.42, -1.42], [2.38, -1.08], [2.46, -.72], [2.5, -.42], [2.4, -.12], [2.14, .06],
                   [1.72, .14], [1.15, .12], [.5, -.04], [-.25, -.34], [-.9, -.78], [-1.4, -1.5], [-1.8, -2.6], [-1.98, -3.8], [-1.88, -4.9], [-1.46, -5.66], [-.72, -6.06]];
// hair: [outline], [light swoop shapes...], [dark flow lines...]. Thick and dark, pushed up and back into a tousled crest
// of tufts, off a high hairline: deep bays at the temples, a forelock island in the middle; short at the sides. (The
// hairline sits below the skull's top everywhere, the bays included, so the hair covers the crown instead of perching on it.)
const MK_HAIR_F = [[[-2.02, -4.5], [-2.1, -5.5], [-2.12, -6.02], [-2.3, -6.3], [-2.02, -6.45], [-1.85, -6.85], [-1.4, -7.12], [-.8, -7.3], [-.38, -7.34], [-.18, -7.58], [.08, -7.36], [.6, -7.32], [1.15, -7.2],
                    [1.5, -7.1], [1.74, -7.22], [1.74, -6.96], [2.0, -6.62], [2.32, -6.44], [2.12, -6.1], [2.1, -5.5], [2.02, -4.5],
                    [1.92, -4.5], [1.84, -5.3], [1.52, -5.72], [1.15, -5.8], [.8, -5.62], [.45, -5.4], [.12, -5.3], [-.22, -5.36], [-.58, -5.52], [-.98, -5.76], [-1.3, -5.8], [-1.62, -5.52], [-1.84, -5.3], [-1.92, -4.5]],
                   [[[-1.72, -6.2], [-1.5, -6.66], [-1.0, -7.0], [-.55, -7.04], [-.95, -6.76], [-1.3, -6.4], [-1.45, -6.12]], [[-.2, -5.75], [-.28, -6.38], [0, -6.94], [.3, -7.08], [.18, -6.72], [.1, -6.22], [.05, -5.68]]],
                   [[[.3, -5.6], [.55, -6.28], [.95, -6.82], [1.1, -7.02]], [[1.15, -6.25], [1.38, -6.62], [1.58, -6.85]], [[-.75, -5.95], [-.85, -6.48], [-.6, -6.96]], [[-1.55, -6.0], [-1.85, -6.36], [-2.0, -6.48]], [[1.72, -6.0], [1.95, -6.3], [2.1, -6.42]]]];
// stray wisps breaking the silhouette (his hair is never tidy): tapered strands from inside the hair out
const MK_STRAY_F = [[[-1.9, -6.45], [-2.25, -6.66], [-2.46, -6.66]], [[.2, -7.2], [.42, -7.6], [.64, -7.72]], [[1.85, -6.62], [2.22, -6.74], [2.44, -6.66]]];
const MK_STRAY_Q = [[[-1.9, -6.45], [-2.32, -6.62], [-2.56, -6.58]], [[.3, -7.3], [.42, -7.7], [.64, -7.84]], [[2.0, -6.72], [2.4, -6.86], [2.62, -6.84]]];
const MK_HAIR_Q = [[[-1.1, -3.86], [-1.6, -3.8], [-1.98, -3.86], [-2.12, -4.7], [-2.18, -5.4], [-2.05, -6.05], [-2.36, -6.3], [-2.0, -6.5], [-1.8, -6.95], [-1.3, -7.25], [-.62, -7.42], [-.32, -7.64], [-.02, -7.42], [.6, -7.38],
                    [1.2, -7.22], [1.6, -7.0], [1.95, -6.8], [2.25, -6.52], [2.52, -6.32], [2.3, -6.05], [2.4, -5.72], [2.3, -5.5],
                    [2.1, -5.5], [1.8, -5.62], [1.45, -5.78], [1.1, -5.6], [.76, -5.36], [.4, -5.4], [.02, -5.7], [-.42, -5.8], [-.78, -5.45], [-.96, -4.95], [-1.04, -4.4], [-1.12, -3.95]],
                   [[[-1.9, -5.3], [-1.75, -6.2], [-1.2, -6.85], [-.7, -7.0], [-1.1, -6.62], [-1.5, -6.0], [-1.62, -5.3]], [[.62, -5.7], [.55, -6.35], [.85, -6.92], [1.2, -7.05], [1.05, -6.7], [.95, -6.2], [.92, -5.65]]],
                   [[[1.35, -5.95], [1.55, -6.45], [1.95, -6.72]], [[2.0, -5.65], [2.18, -6.0], [2.36, -6.18]], [[-.1, -5.95], [-.2, -6.55], [.15, -7.05]], [[-1.3, -4.2], [-1.7, -4.85], [-1.82, -5.5]], [[-.9, -6.1], [-1.4, -6.6], [-1.85, -6.85]]]];

// His idle life (clawd.js lifeOf: breathing, weight shifts, head turns, blinks; not the beat). Breathing is a slight
// stretch about the feet (the shoulders, ~8.2 body units up, rise by life.breath). Anchors match it when o.boilKey is set.
function mkLife(o, id) {
  const L = lifeOf(o, 'mk' + id + '|' + (o.seed || 0));
  return { ...L, sq: -L.breath / 8.2 * (o.seated ? .8 : 1), lean: L.lean * (o.seated ? .4 : 1) };
}
function musk(x, y, u, o = {}) {
  u *= MK_S;
  const id = o.boilKey ?? ++CLAWD_N, rs = p => boilSeed(`mk ${id} ${p}`), S = P => U(P, u);
  const life = mkLife(o, id), q = o.view === 'q', jump = o.jump || 0, sq = cardSq(((o.sq || 0) + (o.take || 0)) * .55) + life.sq, dy = (o.dy || 0) * 1.2 * u - jump * 2.4 * u;
  const sw = clamp(u / 20, .55, 2.2), lift = u * .12, rim = o.rim === undefined ? MK.rim : o.rim, layer = o.layer || 'all';
  const body = layer === 'all' || layer === 'back', head = layer !== 'front', fronts = layer === 'all' || layer === 'front';
  const F = mkFaceOf(o), seed = o.seed || 0, mouth = F.mouth, tm = mt(T);   // his own life (blink, laugh) steps on twos in card
  const blink = (!F.style || F.style === 'open') && life.blink, rot = (o.rot || 0) + (jump ? 0 : life.lean);
  x += (o.dx || 0) * u;
  if (body) { rs('shadow'); if (!o.seated && !o.noShadow) { const k = 1 - jump * .35; paint(oval(x, y + .1 * u, 3.3 * u * k, .45 * u * k, 0, 24), { wash: NOIR.ink, washOp: STYLE.card ? 110 : 150, ink: null }); } }
  push(); translate(x, y + dy); nudge('mk' + id, 1); if (rot) rotate(rot); scale((o.flip ? -1 : 1) * (1 + sq * .5), 1 - sq);
  const prevXF = XF; XF = o.flip ? -XF : XF;
  const pose = typeof o.pose === 'object' ? o.pose : MKPOSE[o.pose || 'idle'] || MKPOSE.idle;
  const cx0 = q ? .3 : 0, sides = q ? [1, -1] : [-1, 1];   // far side first

  const arm = (s, spec, front) => {
    if (!spec || !!spec[4] !== front) return;
    rs('arm' + s);
    const [hx0, hy, bend, hp, , hang] = spec;
    const root = mkRoot(q, s, front);
    const tip = [hx0 + (q ? .35 : 0), hy], ddx = tip[0] - root[0], ddy = tip[1] - root[1], L = Math.hypot(ddx, ddy) || 1;
    const sd = bendSide(-ddy / L, ddx / L, s, .3), nx = -ddy / L * sd, ny = ddx / L * sd;   // (out and down, swinging through straight: core.js bendSide)
    const mid = [root[0] + ddx * .5 + nx * L * bend, root[1] + ddy * .5 + ny * L * bend];
    const far = q && s > 0 && !front, col = far ? mixCol(MK.blazer, MK.blazerDk, .55) : MK.blazer, P = S([root, mid, tip]);
    const r = limb(P, 1.02 * u, .78 * u, col, { sw, shade: MK.blazerDk, key: 'mkarm' + s });
    if (!far) mkRim(P, 1.02 * u, .78 * u, sw, rim);
    if (hp === 'none') return;
    const ang = hang ?? r.ang, fl = s > 0 ? o.flute : o.fluteL;
    let hold = s > 0 ? o.hold : o.holdL;
    if (fl) {
      const f = typeof fl === 'object' ? fl : { fill: typeof fl === 'number' ? fl : .7 };
      hold = hs => { push(); if (s < 0) scale(1, -1); rotate(-ang + (f.tilt || 0) + mkFluteFix()); flute(hs, f.fill ?? .7, f.clink || 0, 'mkfl' + s); pop(); };
    }
    hand(r.tip[0], r.tip[1], ang, 1.25 * u, { pose: hp, glove: true, sw, mirror: s < 0, key: 'mkh' + s, hold });
  };

  if (body) {
    // ---- behind the body: arms at the sides, legs ----
    for (const s of sides) arm(s, s < 0 ? pose.L : pose.R, false);
    if (!o.seated) for (const s of sides) {
      rs('leg' + s);
      const walk = o.walk != null ? Math.sin(o.walk * TAU + (s > 0 ? Math.PI : 0)) : 0, lf = Math.max(0, walk) * .7 + jump * .9;
      const hip = [s * .82 + (q ? .3 : 0), -4.85], ank = [s * (.95 + jump * .55) + (q ? .5 : 0), -.8 - lf];
      const knee = [lerp(hip[0], ank[0], .5) + s * (.1 - jump * .55), lerp(hip[1], ank[1], .5)];
      const far = q && s > 0, LP = S([hip, knee, ank]);
      limb(LP, .95 * u, .76 * u, far ? MK.trousersDk : MK.trousers, { sw, shade: MK.trousersDk, key: 'mkleg' + s });
      if (!far) mkRim(LP, .95 * u, .76 * u, sw * .8, rim && mixCol(rim, MK.trousers, .45), .15, .75);
      push(); translate(ank[0] * u, ank[1] * u); scale(q ? 1 : s, 1);
      piece(curvy(S([[-.72, -.44], [.3, -.54], [1.1, -.33], [1.46, -.02], [1.3, .3], [-.8, .32], [-.94, -.06]]), 5), MK.shoe, { sw, shade: NOIR.ink, depth: .2 * u, rim, key: 'mkshoe' + s, lift });
      piece(curvy(S([[-.94, .12], [1.42, .06], [1.3, .36], [-.84, .38]]), 3), MK.sole, { sw: sw * .8, key: 'mksole' + s, lift: 2 });
      dline(S([[.35, -.38], [.95, -.25]]), sw * .6, MK.rim, .5);
      pop();
    }

    // ---- blazer over a black tee ----
    rs('torso');
    const C = P => S(P.map(([a, b]) => [cx0 + (a > 0 && q ? a * .88 : a), b]));
    const torso = curvy(C([[0, -8.7], [1.45, -8.63], [2.5, -8.45], [2.95, -8.0], [2.85, -7.0], [2.4, -5.95], [2.2, -5.0], [2.3, -4.4], [1.2, -4.27], [0, -4.33],
                           [-1.2, -4.27], [-2.3, -4.4], [-2.2, -5.0], [-2.4, -5.95], [-2.85, -7.0], [-2.95, -8.0], [-2.5, -8.45], [-1.45, -8.63]]), 5);
    piece(torso, MK.blazer, { sw: sw * 1.15, shade: MK.blazerDk, depth: .8 * u, rim, key: 'mktorso', lift });
    const zx = q ? cx0 + .55 : 0, D = P => S(P.map(([a, b]) => [zx + (q ? (a > 0 ? a * .62 : a * 1.02) : a), b]));
    piece(D([[-1.0, -8.68], [1.0, -8.68], [0, -6.05]]), MK.tee, { sw: sw * .8, key: 'mktee', lift: 2 });
    piece(D([[0, -5.6], [.58, -4.33], [-.58, -4.33]]), MK.tee, { sw: sw * .8, key: 'mkteelow', lift: 2 });
    for (const s of [-1, 1]) {
      const lap = [[1.0, -8.7], [1.58, -8.58], [1.86, -7.75], [1.56, -7.62], [1.98, -7.22], [.06, -6.02]].map(([a, b]) => [a * s, b]);
      piece(D(lap), MK.lapel, { sw: sw * .9, rim, key: 'mklap' + s, lift: 3 });
      dline(D([[s * 1.95, -5.15], [s * 1.15, -5.1]]), sw * .6, NOIR.ink, 0);
    }
    dline(D([[1.3, -7.25], [2.05, -7.34]]), sw * .6, NOIR.ink, 0);
    const [bx, by] = D([[0, -5.72]])[0];
    piece(oval(bx, by, .14 * u, .14 * u, 0, 12), '#0E0C10', { sw: sw * .5, key: 'mkbtn', lift: 2, flatCard: true });
  }

  if (head) {
    // ---- neck and head ----
    const nx0 = q ? .5 : 0, px = nx0 * u, py = -8.65 * u;
    push(); translate(px, py); rotate((o.tilt || 0) + life.tilt + rot * -.4 + (F.style === 'squeeze' ? -.05 - .03 * Math.abs(Math.sin(tm * TAU * 2.5)) : 0)); translate(-px, -py);
    const H0 = MK_H0, hx = (q ? .12 : 0) + clamp(o.lookX || 0, -1, 1) * .12;
    const HP = P => S(P.map(([a, b]) => [a + hx, (b > -2.2 ? -2.2 + (b + 2.2) * 1.12 : b) + H0]));   // (the lower face stretched: more chin)
    const jd = o.jaw ?? (mouth === 'laugh' ? (typeof lipLaugh === 'function' ? lipLaugh(tm, .3, .48) : .3 + .18 * Math.abs(Math.sin(tm * TAU * 2.5))) : mouth === 'shout' ? .32 : mouth === 'open' ? .14 : 0);   // (card: two held laugh jaws, mouths.js)
    const MY = -1.5, J = ([a, b]) => [a, b + jd * clamp((b + 1.62) / 1.1)];   // (the mouth sits low: a long upper lip over a heavy chin)
    rs('neck');
    const N = P => S(P.map(([a, b]) => [nx0 + a, b]));
    piece(curvy(N([[-1.08, -9.95], [1.08, -9.95], [1.12, -8.78], [.56, -8.5], [0, -8.4], [-.56, -8.5], [-1.12, -8.78]].map(([a, b]) => [a * (q && b > -9 ? .9 : 1), b])), 3), MK.skinDk, { sw, key: 'mkneck', lift: 2 });   // (a thick neck; its bottom edge runs inside the collar band, so the collar hides it)
    piece(curvy(N([[-1.14, -8.72], [-.66, -8.4], [0, -8.28], [.66, -8.4], [1.14, -8.72], [.98, -8.84], [.54, -8.56], [0, -8.46], [-.54, -8.56], [-.98, -8.84]].map(([a, b]) => [a * (q ? .9 : 1), b])), 3), MK.tee, { sw: sw * .8, rim, key: 'mkcollar', lift: 2 });
    rs('ears');
    const ear = ex => {
      piece(oval((ex + hx) * u, (H0 - 3.0) * u, .34 * u, .62 * u, 0, 20), MK.skin, { sw, shade: q ? null : MK.skinDk, depth: .14 * u, key: 'mkear' + ex, lift: 2 });
      const sd = q ? -1 : Math.sign(ex);
      dline(HP([[ex + sd * .06, -3.38], [ex + sd * .17, -3.0], [ex + sd * .04, -2.57]]), sw * .6, MK.skinDk, .5);
    };
    if (!q) { ear(-2.2); ear(2.2); }
    rs('head');
    const headP = curvy(HP((q ? MK_HEAD_Q : MK_HEAD_F).map(J)), 5);
    if (STYLE.card) { piece(headP, MK.skin, { key: 'mkhead', lift }); mkShade(headP, .72 * u, MK.skinDk); }
    else { if (STYLE.mode === 'doodle') _paint(headP, { wash: '#FBF8F0', ink: null });   // (doodle's open pencil fill: knock the neck out from under the face, as the cast's K.knock)
      piece(headP, MK.skin, { ink: null }); mkShade(headP, .72 * u, MK.skinDk); paint(headP, { ink: NOIR.ink, sw: sw * 1.15, br: 'flash' }); }
    if (q) ear(-1.35);
    // the heavy lower face: the chin's ball under the lower lip, a small cleft, and the jowls either side of the mouth
    rs('chin');
    const soft = mixCol(MK.skinDk, MK.skin, .3);
    if (!q) dline(HP([[-.42, -.98], [0, -1.06], [.42, -.98]].map(J)), sw * .5, soft, .5);
    else dline(HP([[1.45, -.98], [1.8, -1.06], [2.15, -1.0]].map(J)), sw * .5, soft, .5);
    const cl = q ? 2.28 : 0;
    dline(HP([[cl, -.16], [cl + .03, -.26], [cl, -.38]].map(J)), sw * .6, MK.line, .5);
    for (const s of q ? [-1] : [-1, 1]) { const jx = q ? .68 : s * 1.5; dline(HP([[jx, -1.2], [jx + s * .1, -.9], [jx + s * .08, -.66]].map(J)), sw * .45, soft, .5); }

    // hair: thick and dark, pushed up and back off a high M hairline into a tousled crest; short at the sides
    rs('hair');
    const [hairO, hairL, hairD] = q ? MK_HAIR_Q : MK_HAIR_F;
    piece(curvy(HP(hairO), 3), MK.hair, { sw, shade: MK.hairDk, depth: .35 * u, rim, key: 'mkhair', lift: 2 });
    (q ? MK_STRAY_Q : MK_STRAY_F).forEach((P, i) => piece(ribbon(through(HP(P), 4), .13 * u, .01 * u), MK.hair, { sw: sw * .75, key: 'mkstray' + i, lift: 2, flatCard: true }));
    hairL.forEach((P, i) => piece(curvy(HP(P), 4), MK.hairLt, { ink: null, key: 'mkhairhl' + i, lift: 0, flatCard: true }));
    for (const P of hairD) dline(HP(P), sw * .55, mixCol(MK.hairDk, MK.hair, .2), .5);

    // face
    rs('face');
    const eyeY = -3.3, ew = .7 * u, look = [clamp(o.lookX || 0, -1, 1), clamp(o.lookY || 0, -1, 1)];
    // small, close-set, hooded eyes under low brows. (3/4: the far eye is the same eye, a touch smaller and squeezed
    // across: [x, size, side, squeeze])
    const eyes = q ? [[.36, 1, -1, 1], [1.74, .86, 1, .72]] : [[-.8, 1, -1, 1], [.8, 1, 1, 1]];
    eyes.forEach(([ex, k, side, esx]) => {
      const [px2, py2] = HP([[ex, eyeY]])[0];
      mkEye(px2, py2, ew * k, F, side, { sw, look, blink, key: 'mke' + side, sx: esx });
      const br = F.brow || [0, 0];
      mkBrow(px2, py2 - .46 * u, 1.14 * u * (q && side > 0 ? .7 : 1), [br[0] - .04, br[1] - .06], side, sw, 'mkbrow' + side);
    });
    // nose: long and straight, a soft broad bulb at the tip
    rs('nose');
    if (!q) mkNoseF(HP, u, sw, 0, -2.4, { tw: .29, th: .26, wr: .19, wx: .31, wy: .09, top: -3.45 });
    else mkNoseQ(HP, u, sw, headP, { ridge: [[1.2, -3.3], [1.34, -2.86], [1.74, -2.54]], tip: [2.34, -2.32], tr: .25, th: .22, wing: [2.02, -2.2], wr: .17, nw: .3 });
    // mouth, and the cheek creases that frame it
    rs('mouth');
    const mx = q ? 1.74 : 0, mW = (q ? 1.1 : 1.2) * u, mc = HP([[mx, MY]])[0], far = q ? .5 : 1;
    const wk = (q ? 1.1 : 1.2) * (MK_MW[mouth] ?? .7), strong = ['grin', 'smile', 'laugh', 'open'].includes(mouth);
    for (const s of [-1, 1]) {
      const hard = strong || (mouth === 'smirk' && s > 0);
      if (q && s > 0) continue;   // the far crease hides behind the cheek
      const x0 = q ? mx - wk * .62 : s * .52, P = hard ? [[x0, -2.22], [mx + s * (wk * .7 + .4), -1.92], [mx + s * (wk + .2), -1.46], [mx + s * (wk + .12), -1.0]]
                                          : [[x0 - (q ? .1 : 0), -2.2], [mx + s * (wk * .55 + .42), -1.95], [mx + s * (wk * .8 + .25), -1.72]];
      dline(HP(P), sw * (hard ? .8 : .55), hard ? MK.line : mixCol(MK.skinDk, MK.skin, .2), .5);
    }
    mkMouth(mc[0], mc[1], mW, mouth, { sw, far, jaw: jd, key: 'mkm' });
    if (o.blush) for (const s of [-1, 1]) { if (q && s > 0) continue; const [bx2, by2] = HP([[q ? -.25 : s * 1.4, -2.45]])[0]; piece(oval(bx2, by2, .42 * u, .22 * u, 0, 14), MK.blush, { ink: null, op: 110 * clamp(o.blush), key: 'mkblush' + s, lift: 0, flatCard: true, edge: false }); }
    if (o.gloom > .02) { const gq = q ? .3 : 0; piece(curvy(HP([[gq - 1.7, -4.0], [gq + 1.7, -4.0], [gq + 1.4, -5.3], [gq - 1.4, -5.3]]), 3), NOIR.ink, { ink: null, op: 110 * o.gloom, key: 'mkgloom', lift: 0, flatCard: true }); for (let i = 0; i < 5; i++) { const gx = gq - 1.2 + i * .6; dline(HP([[gx, -5.2], [gx, -4.3 + .3 * hash(i)]]), sw * .5, NOIR.ink); } }
    pop();
  }

  // ---- arms in front of the body ----
  if (fronts) for (const s of sides) arm(s, s < 0 ? pose.L : pose.R, true);
  XF = prevXF;
  pop();
  if (layer !== 'back') { rs('emote'); if (o.emote) emote(o.emote, x + (o.flip ? -1 : 1) * 3.1 * u, y + dy - 16.3 * u * (1 - sq), u * .62, o.emoteK ?? 1, o.emoteAge ?? T); }
  rs('after');
}

// World points for composing (approximate: ignores o.rot): wrists R / L, flute rims fluteR / fluteL, head centre.
function mkAnchors(x, y, u, o = {}) {
  u *= MK_S;
  const q = o.view === 'q', sq = cardSq(((o.sq || 0) + (o.take || 0)) * .55) + (o.boilKey != null ? mkLife(o, o.boilKey).sq : 0), dy = (o.dy || 0) * 1.2 * u - (o.jump || 0) * 2.4 * u, fl = o.flip ? -1 : 1;
  const pose = typeof o.pose === 'object' ? o.pose : MKPOSE[o.pose || 'idle'] || MKPOSE.idle, cx0 = q ? .3 : 0;
  const W2 = ([a, b]) => [x + (o.dx || 0) * u + fl * (1 + sq * .5) * a * u, y + dy + (1 - sq) * b * u];
  const out = { head: W2([q ? .6 : 0, MK_H0 - 3.0]) };
  for (const [s, k] of [[1, 'R'], [-1, 'L']]) {
    const sp = pose[k], tip = [sp[0] + (q ? .35 : 0), sp[1]], root = mkRoot(q, s, !!sp[4]);
    const ang = sp[5] ?? Math.atan2(tip[1] - root[1], tip[0] - root[0]);
    out[k] = W2(tip);
    const f = s > 0 ? o.flute : o.fluteL;
    if (f) { const tilt = (typeof f === 'object' && f.tilt) || 0, hs = 1.25, hx = tip[0] + Math.cos(ang) * .85 * hs, hy = tip[1] + Math.sin(ang) * .85 * hs; out['flute' + k] = W2([hx + Math.sin(tilt) * 1.6 * hs, hy - Math.cos(tilt) * 1.6 * hs]); }
  }
  return out;
}

// ---------- model sheets ----------
//   node render.mjs --page=demo/dev-lineup.html --query=look=ink --loop=musk --sheet=0.3 --cols=1 --w=1920 --out=out/demo/musk/sheet.jpg
//   node render.mjs --page=demo/dev-lineup.html --loop=muskFaces --sheet=0.3 --cols=1 --w=1920 --out=out/demo/musk/faces_card.jpg
(() => {
  const { label, stage, spot } = SHEET;
  // a stub of the banquet table, for the seated pose
  const table = (x, y, w) => {
    boilSeed('mktable' + x);
    piece(curvy([[x - w, y - 18], [x + w, y - 18], [x + w + 6, y + 8], [x - w - 6, y + 8]], 2), '#D8CFBF', { sw: 2, shade: '#A89E8E', depth: 10, key: 'mktabletop', lift: 4 });
    piece([[x - w - 6, y + 4], [x + w + 6, y + 4], [x + w + 2, y + 200], [x - w - 2, y + 200]], '#CFC5B4', { sw: 2.2, key: 'mktablefront', lift: 5 });
    for (let i = 1; i < 5; i++) dline([[x - w + i * w * .4, y + 12], [x - w + i * w * .4 + 4, y + 190]], 1, '#A89E8E', .3);
  };
  LOOPS.musk = t => {
    stage(t); const tt = mt(t), u = 33;
    const row = [
      ['front', 'idle', 'neutral', {}],
      ['q', 'toast', 'happy', { mouth: 'grin', flute: { fill: .7, tilt: .1, clink: Math.max(0, 1 - frac(tt / 2) * 3) } }],
      ['front', 'laugh', 'laugh', {}],
      ['q', 'hips', 'smug', { flip: true }],
      ['front', 'jump', 'excited', { jump: .55 + .45 * Math.abs(Math.sin(tt * Math.PI * 2 / (BEAT * 2))) }],
      ['q', 'toastLaugh', 'laugh', { seated: true, flip: true, flute: { fill: .6, tilt: -.1 } }],
    ];
    row.forEach(([v, p, e, extra], i) => {
      const x = 165 + i * 318; spot(x);
      const o = { ...feel(e, tt, { seed: i }), view: v, pose: p, boilKey: 'mks' + i, ...extra };
      if (extra.seated) { const gy = 905 + 1.6 * u; musk(x, gy, u, { ...o, layer: 'back' }); table(x, gy - 4.9 * u, 150); musk(x, gy, u, { ...o, layer: 'front' }); }
      else musk(x, 905, u, o);
      label(`${v}${extra.flip ? ' flip' : ''} · ${p} · ${e}`, x, 950, 20);
    });
  };
  LOOPS.musk.len = 4;
  LOOPS.muskFaces = t => {
    stage(t); const tt = mt(t);
    [['neutral', 'neutral', {}], ['grin', 'happy', { mouth: 'grin' }], ['laugh', 'laugh', {}], ['smug', 'smug', {}], ['surprised', 'surprised', {}], ['angry', 'angry', {}]].forEach(([name, e, ex], i) => {
      const x = 165 + i * 318; spot(x, 400, 300);
      musk(x, 1045, 60, { ...feel(e, tt, { seed: i }), ...ex, view: i % 2 ? 'q' : 'front', pose: 'idle', noShadow: true, boilKey: 'mkf' + i });
      label(name, x, 1050);
    });
  };
  LOOPS.muskFaces.len = 4;
  // every hand pose, for reference (alternating views; the seated ones behind a table stub)
  LOOPS.muskPoses = t => {
    stage(t); const tt = mt(t), u = 24;
    Object.keys(MKPOSE).forEach((p, i) => {
      const x = 165 + (i % 6) * 318, gy = i < 6 ? 470 : 1000, seated = ['slap', 'table', 'toastLaugh'].includes(p), v = i % 2 ? 'q' : 'front';
      const e = { laugh: 'laugh', slap: 'laugh', toastLaugh: 'laugh', toast: 'happy', clink: 'happy', jump: 'excited', point: 'smug', chin: 'smug', shrug: 'confused' }[p] || 'neutral';
      const o = { ...feel(e, tt, { seed: i }), view: v, pose: p, boilKey: 'mkp' + i, flute: ['toast', 'clink', 'toastLaugh'].includes(p) ? { fill: .7, tilt: p === 'clink' ? .25 : 0 } : null, jump: p === 'jump' ? .6 : 0, seated, noShadow: seated };
      if (seated) {
        musk(x, gy + 1.6 * u, u, { ...o, layer: 'back' });
        boilSeed('mkpt' + i); piece([[x - 110, gy - 3.3 * u], [x + 110, gy - 3.3 * u], [x + 110, gy], [x - 110, gy]], '#D8CFBF', { sw: 1.6, key: 'mkpt' + i, lift: 4 });
        musk(x, gy + 1.6 * u, u, { ...o, layer: 'front' });
      } else musk(x, gy, u, o);
      label(`${p} · ${v}`, x, gy + 30, 18);
    });
  };
  LOOPS.muskPoses.len = 4;
})();

// cast/crowd.js: silhouetted crowds for the public places (queues, audiences, platforms, grandstands). The background
// people of the story, never its cast: no faces, one flat tone per depth row, set back toward the background colour.
// British commuters and workers: coats, parkas, puffers, hoodies, blazers, the odd dress; beanies, bobble hats, caps,
// flat caps, hoods, buns, ponytails, long hair, afros, headphones; backpacks, shoulder bags, totes, a wheelie case; a
// phone glanced at (a small lit screen) or held up to film; the odd tall or short figure.
//
// Per look (crPaint): card: dark card cut-outs (the lit cut edge, a small drop shadow, the card's texture on the big
// ones); xerox: one riso drum as a flat dot screen (o.drum, o.tone), like the rave's crowd; bank: the note's engraved
// line tone; doodle: biro hatching; ink: solid 1930s-cinema black (or grey for the far rows).
//
// Life: nobody moves on the beat. Each figure runs its own clocks: lifeOf() (clawd.js: the weight shifting from foot to
// foot, a small head turn now and then), a phone glance for the phone people, the queue shuffling up on its own times,
// a slump when the news is bad. Pass the shot's stepped time as o.t (mt(t) in card and doodle).
//
// API
//   crowdFig(x, y, u, o)       one figure, feet at (x, y); u as person()'s u (a figure stands ~13 u).
//     o.seed   its build and its clocks (any number) · o.col its flat tone · o.key (card cut, boil)
//     o.view   'front' (front or back: the same silhouette) | 'side' (profile; o.dir 1 faces right, -1 left)
//              | 'audience' (head and shoulders from behind: (x, y) is the bottom of the bust, cut flat o.cut u
//              above the feet, default 6.6)
//     o.walk   walk phase in cycles (side view: the legs scissor, the arm swings); null = standing
//     o.phone  1 / 0 forces the phone up / down (default: its own clock, for the phone people) · o.film: held up high
//     o.umbrella · o.slump 0..1 (head and shoulders drop) · o.idle 0 = still · o.t the clock
//     o.drum, o.tone (xerox) · o.flat (card: no texture) · o.lift (card shadow px) · o.light [x, y] (card: the cut
//     edge faces this way, e.g. [0, -1] for heads backlit by a screen) · o.build: override build fields
//   crowdRow(x0, x1, y, u, o)  o.n figures (or one every o.gap u) across x0..x1 on ground line y, jittered in place,
//                              height and spacing; o.seed seeds the row; o.view 'front' | 'side' | 'audience' | 'mix'
//                              (a third in profile, facing o.dir or either way); o.yj: ground jitter (u)
//   crowdRows(rows, o)         depth rows, drawn in order (list them back to front). rows: [{ x0, x1, y, u, n, ...any
//                              crowdRow option }]; o.col the nearest row's tone, o.bg what the far rows sink toward
//                              (row k of N: mixCol(o.col, o.bg, o.fade * (N - 1 - k) / (N - 1)), fade default .55),
//                              o.tone the nearest row's riso tone (the far rows' tones fall to ~.5 of it)
//   crowdQueue(x, y, u, o)     a queue in profile facing o.dir, its head at x, one every o.gap u behind (o.n); o.steps
//                              [times]: it shuffles up a place, rippling back, and the front one walks on (o.exitV u/s)
//                              until it's past o.exitX (keep that off screen); o.closed: from then they give up: they
//                              slump, and all but o.stay turn and drift off the way they came
// Every function takes the same o (the row / queue passes it on to each figure).
const CR = { hip: -5.2, knee: -2.6, waist: -6.9, chest: -8.3, sh: -9.5, hy: -11.4, hrx: 1.12, hry: 1.42,
  tops: ['coat', 'coat', 'jacket', 'jacket', 'parka', 'puffer', 'hoodie', 'blazer', 'dress', 'coat'],
  heads: ['short', 'short', 'short', 'bald', 'beanie', 'bobble', 'cap', 'flatcap', 'hood', 'bun', 'pony', 'long', 'bob', 'afro', 'curly', 'phones'],
  bags: ['none', 'none', 'none', 'none', 'backpack', 'backpack', 'shoulder', 'tote', 'case'],
  // coat hems: [hem y, hem half-width, puff (sleeve bulk), long (the hem covers the hands and the crotch)]
  hem: { coat: [-2.9, 1.98, 0, 1], jacket: [-4.7, 1.8, 0, 0], parka: [-4.3, 1.95, .12, 0], puffer: [-4.8, 2.0, .22, 0], hoodie: [-4.75, 1.78, .05, 0], blazer: [-4.85, 1.68, 0, 0], dress: [-2.75, 2.3, 0, 1] },
};
// A figure's build from its seed (o.build overrides any field).
function crowdBuild(seed, over) {
  const r = i => hash(seed * 7.137 + i * 13.71 + .31), pick = (A, i) => A[Math.floor(r(i) * A.length) % A.length];
  const odd = r(1), top = pick(CR.tops, 3);
  const B = { seed, top, head: pick(CR.heads, 4), bag: pick(CR.bags, 5),
    ht: lerp(.93, 1.05, r(2)) * (odd < .07 ? 1.12 : odd > .94 ? .86 : 1),
    broad: lerp(.92, 1.1, r(6)) * (top === 'puffer' || top === 'parka' ? 1.08 : top === 'dress' ? .9 : 1),
    headW: lerp(.94, 1.06, r(9)), phone: r(7) < .34, side: r(8) < .5 ? -1 : 1, umbrella: false };
  if (B.top === 'hoodie' && r(10) < .5) B.head = 'hood';
  return over ? { ...B, ...over } : B;
}
// The head, hair and hat as a union of ellipses [cx, cy, rx, ry] round the head's centre (side: +x is the front).
function crHeadE(B, side) {
  // an egg: the skull, a narrower jaw below it (forward in profile), the ears
  const rx = CR.hrx * B.headW, ry = CR.hry * B.headW, s = B.side, f = side ? 1 : 0;
  const E = [[side ? -.08 : 0, -.08, rx, ry * .9], [f * rx * .2, ry * .3, rx * .78, ry * .68]];
  const ears = () => { if (side) E.push([-.05, .12, .26, .36]); else E.push([-rx * .98, .12, .22, .34], [rx * .98, .12, .22, .34]); };
  switch (B.head) {
    case 'short': E.push([side ? -.14 : 0, -.2, rx * 1.03, ry * .82]); ears(); break;
    case 'bald': ears(); break;
    case 'beanie': E.push([side ? -.1 : 0, -ry * .42, rx * 1.06, ry * .78], [side ? -.05 : 0, -ry * .2, rx * 1.1, ry * .3]); break;
    case 'bobble': E.push([side ? -.1 : 0, -ry * .42, rx * 1.06, ry * .78], [side ? -.05 : 0, -ry * .2, rx * 1.1, ry * .3], [side ? -.3 : 0, -ry * 1.3, .42, .4]); break;
    case 'cap': E.push([side ? -.05 : 0, -ry * .36, rx * 1.05, ry * .66], side ? [rx * 1.0, -ry * .42, .8, .19] : [s * rx * .95, -ry * .38, rx * .72, .21]); ears(); break;
    case 'flatcap': E.push(side ? [.3, -ry * .6, rx * 1.28, ry * .42] : [0, -ry * .6, rx * 1.24, ry * .42]); ears(); break;
    case 'hood': E.push([side ? -.25 : 0, -.12, rx * 1.3, ry * 1.08], [side ? -.3 : 0, -ry * .78, rx * .6, ry * .42], [side ? -.45 : 0, ry * .75, rx * 1.45, ry * .62]); break;
    case 'bun': E.push([0, -.15, rx * 1.03, ry * .9], side ? [-rx * .6, -ry * .95, .6, .55] : [0, -ry * 1.08, .62, .56]); break;
    case 'pony': E.push([0, -.15, rx * 1.03, ry * .9], side ? [-rx * 1.0, .2, .36, 1.05] : [0, -ry * .98, .45, .4]); if (!side) E.push([s * rx * .8, -ry * .35, .34, .9]); break;
    case 'long': E.push([side ? -.35 : 0, -.1, rx * 1.1, ry * .95], [side ? -.4 : 0, ry * .55, rx * 1.12, ry * 1.08]); break;
    case 'bob': E.push([side ? -.2 : 0, .05, rx * 1.16, ry * 1.0]); break;
    case 'afro': E.push([0, -.3, rx * 1.48, ry * 1.18]); break;
    case 'curly': E.push([0, -.22, rx * 1.26, ry * 1.04]); break;
    case 'phones': E.push([side ? -.14 : 0, -.2, rx * 1.03, ry * .82]); if (side) E.push([-.05, .05, .5, .66]); else E.push([-rx * 1.0, .05, .38, .56], [rx * 1.0, .05, .38, .56]); break;
  }
  if (side && B.head !== 'hood') E.push([rx * 1.0, .12, .22, .26]);   // the nose's bump: it says which way they face
  return E;
}
// The head's outline (unit space, around its centre): from the left jaw over the crown to the right jaw (the neck's gap
// left open at the bottom), turned by tilt.
function crHead(B, side, tilt, n = 44) {
  // (ellipseUnion's angles: 0 right, π/2 down, π left, 3π/2 up; walk from π/2 + w round to 5π/2 - w)
  const E = crHeadE(B, side), U0 = ellipseUnion(E, [0, 0], n), w = side ? .62 : .4, c = Math.cos(tilt), s = Math.sin(tilt), out = [];
  const i0 = Math.ceil(n * (Math.PI / 2 + w) / TAU), i1 = Math.floor(n * (Math.PI * 2.5 - w) / TAU);
  for (let i = i0; i <= i1; i++) { const p = U0[i % n]; out.push([p[0] * c - p[1] * s, p[0] * s + p[1] * c]); }
  return out;
}
// The front (or back) silhouette as one outline, unit space, feet at the origin. P: pose { turn, tilt, breath, arm (the
// side whose arm is up for a phone, 0 none), slump }.
function crFront(B, P) {
  const H = B.ht, [hemY0, hemW, puff, long] = CR.hem[B.top], sw = 2.05 * B.broad, ww = 1.62 * B.broad;
  const Y = y => y * H, br = P.breath || 0, sl = P.slump || 0;
  const hx = (P.turn || 0) * .24 * CR.hrx, hy = Y(CR.hy) + .35 * sl + br * .5 + .2 * (P.down || 0);
  const head = crHead(B, false, (P.tilt || 0) + .08 * (P.turn || 0)).map(([x, y]) => [x + hx, y + hy]);
  const shY = Y(CR.sh) + .22 * sl + br, hemY = Y(hemY0), hipY = Y(CR.hip), kneeY = Y(CR.knee), crotch = long ? hemY + .05 : hipY + .35;
  const dress = B.top === 'dress', lo = dress ? .82 : 1.12, li = dress ? .34 : .22;
  const half = sd => {   // one side (x > 0), from the neck down to the crotch; sd: -1 left, 1 right (for the phone arm)
    // (the neck shows under a head that clears the shoulders; long hair, a hood or an afro comes down onto them)
    const J = sd > 0 ? head[head.length - 1] : head[0], jx = Math.abs(J[0]), neck = J[1] < shY - .45 && jx < .75;
    const armUp = P.arm === sd || P.arm === 2, up = (neck ? [[.5 * B.broad, shY - .42]] : []).concat([[sw * .6, shY - .12], [sw * .88, shY + .02], [sw, shY + .45]]);
    // (the arm hangs down the side to a hand at the thigh; a long coat carries on below it, a jacket's hem is under the arm)
    if (!armUp) { up.push([sw + .12 + puff, shY + 2.0], [sw * .98 + puff * .5, Y(CR.waist) + .6], [sw * .9, hipY + .55]); if (!long) up.push([sw * .72, hipY + .75], [sw * .66, hipY + .35]); }
    else up.push([sw * .93, Y(CR.chest) + .3], [ww, Y(CR.waist) + .3]);
    if (long) up.push([hemW * .94, hipY + (armUp ? .2 : 1.0)], [hemW, hemY]);
    else if (armUp) up.push([hemW, hemY]);
    const legTop = long ? [lo * .98, hemY + .06] : [lo + .1, Math.max(hemY, hipY) + .1];
    const lower = [legTop, [lo * .95, kneeY], [lo * .82, -.45], [lo + .08, -.14], [lo + .05, 0], [li, 0], [li - .02, -.4], [li + .02, crotch + .35]];
    return through(up, 3).concat(lower);
  };
  const R = half(1), L = half(-1).map(([x, y]) => [-x, y]).reverse();
  return head.concat(R, [[0, crotch]], L);
}
// Rotate unit points about the feet by a, scale to px (u), and place at (x, y).
const crPlace = (P, x, y, u, a = 0, fx = 1) => { const c = Math.cos(a), s = Math.sin(a); return P.map(([px, py]) => { const X = px * fx * u, Y = py * u; return [x + X * c - Y * s, y + X * s + Y * c]; }); };
const crRect = (x0, y0, x1, y1, r = .25) => { const P = []; for (const [cx, cy, a0] of [[x1 - r, y0 + r, -Math.PI / 2], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, Math.PI / 2], [x0 + r, y0 + r, Math.PI]]) for (let i = 0; i <= 3; i++) { const a = a0 + i / 3 * Math.PI / 2; P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return P; };
// Paint one part of a silhouette in the current look. o: the figure's options (col, key, drum, tone, flat, lift).
// A rect [x0, y0, x1, y1] (world) kept clear: P cut into the (convex) pieces outside it (left, right, above, below).
function crHoleSplit(P, h) {
  const [x0, y0, x1, y1] = h, F = 1e5, R = (a, b, c, d) => [[a, b], [c, b], [c, d], [a, d]];
  return [R(-F, -F, x0, F), R(x1, -F, F, F), R(x0, -F, x1, y0), R(x0, y1, x1, F)].map(C => clipConvex(P, C)).filter(Q => Q.length > 2);
}
const crInHole = (p, h) => h && p[0] > h[0] && p[0] < h[2] && p[1] > h[1] && p[1] < h[3];
function crPaint(P, col, o, part = '') {
  if (o.clip) { P = clipConvex(P, o.clip); if (P.length < 3) return; }   // seen through a window (a convex clip, world coords)
  if (o.hole) { for (const Q of crHoleSplit(P, o.hole)) crPaint(Q, col, { ...o, hole: null }, part); return; }   // (o.hole: a rect kept clear)
  const key = (o.key || 'cr') + part, m = STYLE.mode;
  if (STYLE.card) { piece(P, col, { ink: null, key, lift: o.lift ?? 2.5, flatCard: o.flat, sw: 1 }); return; }
  if (m === 'xerox') { if (XEROX.process) piece(P, col, { ink: null, key, spot: { channel: o.drum || 'c', tone: o.tone ?? .9 } }); else piece(P, col, { ink: null, key, spot: null }); return; }
  if (m === 'ink') { _paint(P, { wash: col, ink: null }); return; }
  if (m === 'doodle') {   // biro hatching, denser for the darker (nearer) rows, over paper (so it hides what's behind)
    const tn = clamp(1 - lum(col)), a = 50 + 12 * hash(keyHash(o.key || 'cr'));
    _paint(P, { wash: '#FBF8F0', washOp: 255, ink: null });
    hatchLines(P, lerp(8, 2.8, tn), a, 'pen', BIRO, .8, .6, .25);
    if (tn > .55) hatchLines(P, lerp(9, 3.6, tn), a - 80, 'pen', BIRO, .7, .5, .25);
    edgeLine(P, .7, BIRO, true);
    return;
  }
  // bank (and the rest): the look's own tone; one key per figure, so its parts' lines meet. o.outline: a fine engraved
  // outline too (small figures read as shapes by it, set back in a pale tone)
  piece(P, col, { ink: o.outline ? undefined : null, sw: o.outline || 1, key: o.hatchKey || o.key || 'cr' });   // (o.hatchKey: one angle for a whole crowd)
}
// Something lit (a phone's screen) in the current look: paper where the look can't print light.
function crLit(P, o, part) {
  if (o.clip) { P = clipConvex(P, o.clip); if (P.length < 3) return; }
  const m = STYLE.mode;
  if (STYLE.card) { piece(P, '#DCE9F2', { ink: null, key: (o.key || 'cr') + part, lift: 0, flatCard: true, edge: false }); return; }
  if (m === 'xerox') { _paint(P, { wash: XEROX.paper, ink: null }); return; }
  if (m === 'bank') { _paint(P, { wash: BANK.paper, ink: null }); return; }
  if (m === 'doodle') { _paint(P, { wash: '#FBF8F0', ink: null }); return; }
  _paint(P, { wash: '#EDE6CF', ink: null });
}
// The phone-glance clock: 0..1, how far up this figure's phone is at t (its own slots of 4-8 s, up in about half).
function crPhone(B, t) {
  if (!B.phone) return 0;
  const P = 4 + 4 * hash(B.seed * 1.9), s = t / P + hash(B.seed * 3.3), n = Math.floor(s), f = (s - n) * P;
  if (hash(B.seed * 5.1 + n * 2.7) > .55) return 0;
  const a = .3 + 1.2 * hash(B.seed + n * 1.3), b = a + 1.6 + 2.4 * hash(B.seed * 2 + n);
  return ease(seg(f, a, a + .35)) * (1 - ease(seg(f, b, b + .35)));
}

// ---------- the side view (profile), facing +x (the caller mirrors) ----------
function crSide(B, P) {
  const H = B.ht, [hemY0, hemW, puff, long] = CR.hem[B.top], Y = y => y * H, w = P.walk, walking = w != null, th = walking ? w * TAU : 0;
  const bob = walking ? -.2 * (1 - Math.abs(Math.sin(th))) : 0, sl = P.slump || 0, br = P.breath || 0;
  const hip = [0, Y(CR.hip) + bob], shY = Y(CR.sh) + bob + .22 * sl + br, hemY = Y(hemY0) + bob, dress = B.top === 'dress';
  const T1 = 2.55 * H, T2 = 2.45 * H;
  const leg = ph => {
    if (!walking) { const a = ph ? -.07 : .06; return [hip, [hip[0] + Math.sin(a) * T1, hip[1] + Math.cos(a) * T1], [hip[0] + Math.sin(a) * (T1 + T2), -.02]]; }
    const q = th + ph * Math.PI, a = .42 * Math.sin(q), fl = .8 * Math.pow(Math.max(0, Math.cos(q)), 1.5);
    const K = [hip[0] + Math.sin(a) * T1, hip[1] + Math.cos(a) * T1], A = [K[0] + Math.sin(a - fl) * T2, Math.min(-.02, K[1] + Math.cos(a - fl) * T2)];
    return [hip, K, A];
  };
  const parts = [];
  const legPart = (ph, name) => {
    const [Hp, K, A] = leg(ph), foot = [[A[0] - .35, A[1] - .35], [A[0] + .25, A[1] - .42], [A[0] + .95, A[1] - .08], [A[0] + .9, A[1] + .02], [A[0] - .35, A[1] + .02]];
    parts.push([ribbon([Hp, K, A], dress ? .72 : 1.02, dress ? .5 : .74), name], [foot, name + 'f']);
  };
  legPart(1, 'lf'); legPart(0, 'ln');
  // the torso and coat (back edge, hem, front edge), a hood's bulk at the back of the neck
  const fr = 1.05 + puff, bk = -1.1 - puff;
  const torso = curvy([[-.35, shY - .35], [bk + .18, shY + .1], [bk, Y(CR.chest)], [bk + .08, Y(CR.waist) + bob], [bk - (long ? .15 : 0), hemY], [fr + (long ? .2 : .05), hemY], [fr - .1, Y(CR.waist) + bob], [fr + .05, Y(CR.chest) + .2], [.55, shY + .05], [.3, shY - .35]], 4);
  const arm = P.phone || 0, sw = walking ? -.4 * Math.sin(th) : .04 + .03 * sl;
  const S0 = [-.05, shY + .5], E0 = [S0[0] + Math.sin(sw) * 2.2 * H, S0[1] + Math.cos(sw) * 2.2 * H], W0 = [E0[0] + Math.sin(sw + .15) * 2.0 * H, E0[1] + Math.cos(sw + .15) * 2.0 * H];
  const E1 = [.25, Y(CR.chest) + 1.35], W1 = [1.2, Y(CR.chest) + .35], lp = (a, b) => [lerp(a[0], b[0], arm), lerp(a[1], b[1], arm)];
  const E = lp(E0, E1), Wr = lp(W0, W1);
  if (B.bag === 'case' && walking) { const cx = -2.2, cy = 0; parts.push([crRect(cx - 1.1, cy - 2.6, cx + .3, cy - .1, .25), 'case'], [ribbon([[cx - .2, cy - 2.6], [-.8, Y(CR.hip) + .9]], .18, .18), 'handle']); }
  parts.push([ribbon([[-.1, shY + .45], [-.15 - .3 * Math.sin(sw), shY + 2.3], [-.2 - .6 * Math.sin(sw), Y(CR.hip) + .6]], .8, .6), 'af']);   // the far arm, mostly hidden
  if (B.bag === 'backpack') parts.push([crRect(bk - 1.15, shY + .35, bk + .35, Y(CR.waist) + bob + .1, .45), 'pack']);
  parts.push([torso, 'body']);
  if (B.head === 'hood') parts.push([oval(-.55, shY - .15, .85, .55, -.3, 14), 'hoodb']);
  const head = crHead(B, true, (P.tilt || 0) + .3 * sl).map(([x, y]) => [x + .12, y + Y(CR.hy) + bob + .38 * sl + br * .5]);
  parts.push([head, 'head']);
  parts.push([ribbon([S0, E, Wr], .82 + puff, .62), 'arm'], [oval(Wr[0], Wr[1] + .1, .34, .38, 0, 10), 'hand']);
  if (B.bag === 'shoulder') parts.push([crRect(-1.0, Y(CR.hip) - 1.35 + bob, .55, Y(CR.hip) + .25 + bob, .3), 'bag']);
  if (B.bag === 'tote' && arm < .5) parts.push([crRect(Wr[0] - .7, Wr[1] + .1, Wr[0] + .8, Wr[1] + 2.0, .2), 'tote']);
  const screen = arm > .6 ? [[Wr[0] - .25, Wr[1] - .6], [Wr[0] + .5, Wr[1] - .95], [Wr[0] + .62, Wr[1] - .25], [Wr[0] - .1, Wr[1] + .1]] : null;
  return { parts, screen };
}

// ---------- one figure ----------
function crowdFig(x, y, u, o = {}) {
  const seed = o.seed ?? 1, B = crowdBuild(seed, o.build), key = o.key || 'crf' + seed, t = o.t ?? (typeof mt === 'function' ? mt(T) : T);
  if (o.cull !== false && typeof worldToScreen === 'function') {   // off screen: skip (crowds run wide)
    const a = worldToScreen(x - 4 * u, y - 15 * u), b = worldToScreen(x + 4 * u, y + 2 * u);
    if (Math.max(a.x, b.x) < -40 || Math.min(a.x, b.x) > W + 40 || Math.max(a.y, b.y) < -40 || Math.min(a.y, b.y) > H + 40) return;
  }
  const col = o.col || '#1E1C24', fo = { ...o, key };
  const L = o.idle === 0 ? { breath: 0, lean: 0, tilt: 0, turn: 0 } : lifeOf({ idle: o.idle ?? 1 }, 'crowd' + seed, t + 17 * hash(seed));
  const ph = o.phone != null ? o.phone : (o.walk != null ? 0 : crPhone(B, t));
  const sl = o.slump || 0, view = o.view || 'front';
  const lean = cardHold((L.lean * 1.8 + .012 * Math.sin(t * TAU / (5 + 3 * hash(seed * 4.1)) + seed)) * (o.idle ?? 1), .5 / (15 * u * drawScale())) + (o.rot || 0);   // (card: held, moved in half-pixel steps at the head)
  const prevL = LIGHT.dir; if (o.light) LIGHT.dir = o.light;
  boilSeed('crowd ' + key);
  push(); if (STYLE.card) { translate(x, y); nudge(key, .7); translate(-x, -y); }
  if (view === 'side') {
    const dir = o.dir ?? 1, S = crSide(B, { walk: o.walk, phone: ph, slump: sl, breath: L.breath, tilt: L.tilt * .6 + (ph > .5 ? .25 : 0) });
    for (const [P, nm] of S.parts) crPaint(crPlace(P, x, y, u, lean * dir, dir), col, fo, nm);
    if (S.screen) crLit(crPlace(S.screen, x, y, u, lean * dir, dir), fo, 'scr');
    if (o.umbrella || B.umbrella) crUmbrella(x + dir * .3 * u, y - 14.2 * u * B.ht, u, col, fo);
  } else {
    const reach = o.reach || (o.reachP && hash(seed * 2.71 + .5) < o.reachP), up = o.film || reach, arm = o.carry ? 2 : ph > .05 || up ? B.side : 0, k = o.carry ? 0 : up ? 1 : ph;
    const wave = reach && o.wave ? Math.sin(t * TAU / (1.1 + .5 * hash(seed)) + seed) : 0;   // cheering: the arm waves on its own clock
    let F = crFront(B, { turn: L.turn * (1 - k), tilt: L.tilt, breath: L.breath, arm, slump: sl, down: up ? 0 : k });
    let oy = 0;
    if (view === 'audience') {   // cut flat at the chest; (x, y) is the bottom of the bust
      const cut = -(o.cut ?? 6.6) * B.ht;
      F = clipConvex(F, [[-60, -60], [60, -60], [60, cut], [-60, cut]]); oy = -cut;
    }
    const place = P => crPlace(P.map(([px, py]) => [px, py + oy]), x, y, u, lean);
    const sw = 2.05 * B.broad, shY = CR.sh * B.ht, hipY = CR.hip * B.ht;
    if (B.bag === 'backpack' && view !== 'audience') crPaint(place(crRect(-sw * .98 - .15, shY + .55, sw * .98 + .15, shY + 3.7, .6)), col, fo, 'pack');
    crPaint(place(F), col, fo, 'body');
    if (view !== 'audience' && B.bag === 'shoulder') { const bx = -B.side * sw * 1.02; crPaint(place(crRect(bx - .75, hipY - 1.2, bx + .75, hipY + .3, .3)), col, fo, 'bag'); }
    if (view !== 'audience' && B.bag === 'tote' && !arm) { const hx = -B.side * sw * .92; crPaint(place(crRect(hx - .75, hipY + .45, hx + .75, hipY + 2.5, .2)), col, fo, 'tote'); }
    if (view !== 'audience' && B.bag === 'case') { const cx = -B.side * (sw + 1.3); crPaint(place(crRect(cx - .7, -3.0, cx + .7, 0, .22)), col, fo, 'case'); crPaint(place(ribbon([[cx, -3.0], [cx, -4.2], [-B.side * sw * .95, hipY + .8]], .18, .18)), col, fo, 'handle'); }
    if (o.carry) {   // a box held at the chest, the hands at its sides
      const bw = 2.55 * B.broad, y0 = CR.chest * B.ht - .1, y1 = CR.waist * B.ht + 1.3;
      crPaint(place(crRect(-bw, y0, bw, y1, .15)), col, fo, 'box');
      for (const sd of [-1, 1]) crPaint(place(oval(sd * bw, (y0 + y1) / 2, .42, .5, 0, 10)), col, fo, 'bh' + sd);
    } else if (arm) {   // the phone arm: up to the chest to look, or (film) straight up with the phone over the heads
      const sx = arm * sw * .8, S = [sx, shY + .45], ex = up ? arm * (sw + .5) : arm * (sw + .25), E = up ? [ex, shY - 2.6] : [lerp(arm * (sw + .15), ex, k), lerp(hipY + .8, shY + 2.6, k)];
      const Wr = up ? [arm * (sw - .2 + .9 * wave), shY - 5.2 + .3 * Math.abs(wave)] : [lerp(arm * (sw * .9), arm * sw * .28, k), lerp(hipY + .5, shY + 1.5, k)];
      if (reach && o.strap) {   // (o.strap { top, col }: holding a ceiling strap: it hangs from the rail at o.strap.top straight down to the hand, its loop round the fist)
        const [hx, hy] = place([Wr])[0];
        crPaint(ribbon([[hx, o.strap.top], [hx, hy - .6 * u]], .2 * u, .2 * u), o.strap.col, { ...fo, flat: true }, 'strap');
        crPaint(crRect(hx - .5 * u, hy - 1.05 * u, hx + .5 * u, hy - .2 * u, .3 * u), o.strap.col, { ...fo, flat: true }, 'straph');
      }
      crPaint(place(ribbon([S, E, Wr], .85, .62)), col, fo, 'parm');
      crPaint(place(oval(Wr[0], Wr[1], .34, .36, 0, 10)), col, fo, 'phand');
      const sh = o.film ? [.36, 1.25] : [.3, .62];   // the screen: tall when filming (held up to us), a sliver when looked at
      // (o.phoneBack: the phone's back to us, its screen to them: a dark slab, no light)
      if (k > .6 && !reach) { const Q = place([[Wr[0] - sh[0], Wr[1] - .15 - sh[1]], [Wr[0] + sh[0], Wr[1] - .15 - sh[1]], [Wr[0] + sh[0], Wr[1] - .15], [Wr[0] - sh[0], Wr[1] - .15]]); if (o.phoneBack) crPaint(Q, mixCol(col, '#000000', .35), { ...fo, flat: true }, 'scr'); else crLit(Q, fo, 'scr'); }
    }
    if ((o.umbrella || B.umbrella) && view !== 'audience') crUmbrella(x - B.side * .4 * u, y - 14.6 * u * B.ht, u, col, fo);
  }
  pop();
  LIGHT.dir = prevL;
}
function crUmbrella(x, y, u, col, o) {
  const P = []; for (let i = 0; i <= 16; i++) { const a = Math.PI + i / 16 * Math.PI; P.push([x + Math.cos(a) * 3.4 * u, y + Math.sin(a) * 1.9 * u]); }
  for (let i = 5; i >= 0; i--) P.push([x + lerp(-3.4, 3.4, i / 5) * u, y + (i % 2 ? .35 : .05) * u]);   // the scalloped rim
  crPaint(ribbon([[x, y], [x + .1 * u, y + 4.6 * u]], .22 * u, .22 * u), col, o, 'ushaft');
  crPaint(P, col, o, 'umb');
}

// ---------- rows, depth, queues ----------
function crowdRow(x0, x1, y, u, o = {}) {
  const seed = o.seed ?? 1, n = o.n ?? Math.max(1, Math.round((x1 - x0) / ((o.gap ?? 4.4) * u))), gp = (x1 - x0) / n, F = [];
  for (let i = 0; i < n; i++) {
    const h = k => hash(seed * 31.7 + i * 7.3 + k * 1.91), sd = Math.floor(seed * 1000 + i * 17 + 3);
    const view = o.view === 'mix' ? (h(1) < .33 ? 'side' : 'front') : (o.view || 'front');
    F.push({ x: x0 + (i + .5) * gp + (h(2) - .5) * gp * (o.xj ?? .55), y: y + (h(3) - .5) * (o.yj ?? .4) * u, u: u * lerp(.95, 1.05, h(4)), seed: sd, view, dir: o.dir ?? (h(5) < .5 ? -1 : 1) });
  }
  F.sort((a, b) => a.y - b.y);
  for (const f of F) crowdFig(f.x, f.y, f.u, { ...o, seed: f.seed, view: f.view, dir: f.view === 'side' ? f.dir : o.dir, key: (o.key || 'crr' + seed) + '_' + f.seed });
}
function crowdRows(rows, o = {}) {
  const N = rows.length, fade = o.fade ?? .55, col = o.col || '#1E1C24', bg = o.bg || col;
  rows.forEach((r, k) => {
    const d = N > 1 ? (N - 1 - k) / (N - 1) : 0;
    crowdRow(r.x0, r.x1, r.y, r.u, { ...o, col: mixCol(col, bg, fade * d), tone: (o.tone ?? .9) * (1 - .5 * d), seed: (o.seed ?? 1) * 13 + k * 101, ...r });
  });
}
function crowdQueue(x, y, u, o = {}) {
  const n = o.n ?? 6, gap = (o.gap ?? 3.6) * u, dir = o.dir ?? 1, t = o.t ?? (typeof mt === 'function' ? mt(T) : T), seed = o.seed ?? 1, steps = o.steps || [];
  for (let i = n - 1; i >= 0; i--) {
    let pos = i, moving = 0;
    steps.forEach((s, j) => { const d = s + .22 * Math.max(0, i - j), k = ease(seg(t, d, d + .7)); pos -= k; if (k > 0 && k < 1) moving = 1; });
    let fx = x - dir * pos * gap + (hash(seed * 3.1 + i) - .5) * gap * .25, fdir = dir, walk = moving ? (i - pos) * gap / (7 * u) : null, slump = 0;
    if (pos < -.02) {   // served: from its step it walks on past the head of the queue (dropped past o.exitX, or a few places on)
      const lt = steps[Math.min(i, steps.length - 1)], d = (o.exitV ?? 9) * u * Math.max(0, t - lt) * ease(clamp((t - lt) / .4));
      fx = x + dir * d; walk = d / (7 * u);
      if (o.exitX != null ? dir * (fx - o.exitX) > 0 : d > (o.exitAt ?? 3) * gap) continue;
    }
    if (o.closed != null && t > o.closed) {
      const a = t - o.closed - .12 * i;
      slump = ease(seg(a, 0, .5));
      if (i >= (o.stay ?? 2) && a > .7 + .35 * hash(seed + i * 5)) { const g = a - .7 - .35 * hash(seed + i * 5); fdir = -dir; fx -= dir * g * 3.4 * u; walk = g * 3.4 / 7; slump *= .5; }
    }
    crowdFig(fx, y + (hash(seed * 5.3 + i) - .5) * .3 * u, u * lerp(.96, 1.04, hash(seed + i * 2.2)), { ...o, seed: Math.floor(seed * 1000 + i * 17 + 5), view: 'side', dir: fdir, walk, slump: Math.max(slump, o.slump || 0), phone: walk != null ? 0 : o.phone, key: (o.key || 'crq' + seed) + '_' + i });
  }
}

// ======================================================================================================================
// Staging for the shots (kept here so the chapters only need a call)
// ======================================================================================================================
// C1d / C2d (chorus.js commuteScene): the rush hour round her commute. s: the commute's phase (walking in; the doors
// open .02-.16; she boards at .6; they shut .6-.7; the train pulls out from .72). D: the scene's geometry (CD: floor,
// door, top). layer: 'wall' (the next train's crowd along the wall, behind the train: it uncovers them as it goes),
// 'win' (standing passengers packed at the car's windows: o.windows [[x0, y0, x1, y1], ...], drawn with the train),
// 'in' (boarding, in the doorway: behind the door leaves), 'out' (on the platform, in front of the train, behind her).
// Everything runs on s, so every copy has the same rush hour in it, only faster. One riso drum (blue), by depth.
// [x at s = 0, waits at the door until s (null: walking in), speed (px per unit s), u, ground offset, late (misses it)]
const CR_COMMUTE = [[1165, .1, 1500, 30, 5], [1055, .19, 1450, 31, -1], [945, .27, 1500, 29, 3], [650, null, 1480, 31, -2],
  [150, null, 1560, 30, -9, 1], [-230, null, 1640, 31, -5, 1], [-560, null, 1700, 29, -11, 1]];
// ?crdbg=wall,win,in,out (any of them) leaves those layers out, for before/after comparisons
const CR_DBG = new URLSearchParams(location.search).get('crdbg') || '';
function crowdCommute(s, layer, D, o = {}) {
  if (CR_DBG.includes(layer)) return;
  const t = s * 4, base = { t, drum: 'c' };
  if (layer === 'wall') { crowdRow(-100, 1980, D.floor + 12, 23, { ...base, n: 16, seed: 41, view: 'mix', col: '#4A5A9A', tone: .5, key: 'crcw' }); return; }
  if (layer === 'win') {
    (o.windows || []).forEach(([x0, y0, x1, y1], w) => {
      const clip = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
      for (let j = 0; j < 2; j++) { const sd = 500 + w * 11 + j * 5; crowdFig(lerp(x0, x1, .3 + .42 * j) + (hash(sd) - .5) * 24, y1 + 22 + 14 * hash(sd + 1), 21, { ...base, seed: sd, view: 'audience', col: '#3A4A8A', tone: .72, clip, reach: hash(sd + 2) < .35, phone: 0, key: 'crcwin' + w + j }); }
    });
    return;
  }
  CR_COMMUTE.forEach(([x0, wait, v, u, dy, late], i) => {
    let X = wait != null ? (s < wait ? x0 : x0 + v * (s - wait)) : x0 + v * s, walking = wait == null || s > wait, slump = 0;
    if (late) { const stop = D.door - 125 - (i - 4) * 110, sa = (stop - x0) / v; if (X >= stop) { X = stop; walking = false; const s0 = Math.max(sa, .7); slump = ease(seg(s, s0, s0 + .12)); } }
    const inside = !late && X > D.door - 55;
    if (inside !== (layer === 'in') || (inside && X > D.door + 170)) return;
    crowdFig(X, D.floor + 30 + dy, u, { ...base, seed: 300 + i * 7, view: 'side', dir: 1, walk: walking ? X / (7 * u) : null, slump, col: '#2A3A80', tone: .66, phone: walking ? 0 : undefined, key: 'crc' + i });
  });
}

// V3d (verse3.js): the class watching the projected cartoon, cinema-style: heads and shoulders from behind along the
// bottom of the frame, rising into the screen's lower edge (card: near-black card, its cut edge lit from the screen).
// S: the screen { x, y, w, h }; t: the clock. Drawn after the room and her, so they're nearest us.
function crowdClass(t, S, o = {}) {
  crowdRow(S.x - 10, S.x + S.w + 90, S.y + S.h + 345, 56, { view: 'audience', n: 7, seed: 61, col: '#0C0E14', t, light: [.15, -1], lift: 3, xj: .3, yj: .55, cut: 5.6, phone: 0, key: 'crcl', ...o });
}
// V3a (verse3.js raceScene): the grandstand packed with racegoers, tier on tier of heads and shoulders, the back tiers
// paler; from the off (o.cheer) some wave an arm up. x0..x1: the stand's front; tiers: each tier's rail y, top first.
function crowdStand(x0, x1, tiers, t, o = {}) {
  const N = tiers.length;
  tiers.forEach((y, k) => { const d = N > 1 ? (N - 1 - k) / (N - 1) : 0;
    crowdRow(x0, x1, y, lerp(6.8, 5.6, d), { view: 'audience', gap: 2.9, seed: (o.seed ?? 1) * 7 + k, col: mixCol('#7C847E', '#C4C8C0', .7 * d), outline: .55, hatchKey: 'crstand', t, xj: .45, yj: .25, cut: 6.0, phone: 0, reachP: o.cheer ? .22 : 0, wave: 1, key: 'crst' + (o.seed ?? 1) + '_' + k, ...o });
  });
}
// V2g (verse2.js cardHalf): the surgery's standing queue along the back wall, to the hatch. It shuffles up a place each
// time an appointment ticket goes (o.steps: the shot's ticket times; the front one walks off past the counter), and on
// o.closed (the shutter) they give up: they slump, and all but the front two turn and drift off. x: the head of the
// queue (at the counter), y: the floor at the back wall.
function crowdSurgery(t, x, y, o = {}) {
  crowdQueue(x, y, 21, { n: 12, gap: 3.5, dir: 1, seed: 23, col: '#56675A', t, stay: 2, key: 'crsg', ...o });
}
// V1f (verse1.js v1HR): the queue of humans on HR's track runs on behind her as dark cut-outs, each on its stand with its
// box, stepping up with the rest (x: the shot's queue state for this place; stepT: the last step, for the jolt).
function crowdCutout(x, y, u, j, t, stepT, o = {}) {
  const col = o.col || '#5A6470', key = 'crhr' + j;
  crowdFig(x, y, u, { seed: 900 + j * 13, build: { bag: hash(j * 3.7) < .3 ? 'backpack' : 'none' }, view: 'front', col, t, idle: .5, phone: 0, carry: 1, rot: .06 * spring(t, stepT ?? -9, 7, 22), lift: 3, key, ...o });
  boilSeed(key + 'st'); piece([[x - 30, y - 8], [x + 30, y - 8], [x + 30, y + 10], [x - 30, y + 10]], mixCol(col, '#8A6A48', .35), { sw: 1, key: key + 'stand', lift: 2, flatCard: true });
}

// I2 / I3 (intro.js platform): the night tube, sparse: one late-night figure far down the platform by the wall (a phone
// glance now and then), one at the far end looking up the line for the train.
function crowdNight(t, o = {}) {
  const base = { t, col: '#5E5866', lift: 3, ...o };
  crowdFig(1852, 796, 23, { ...base, seed: 811, view: 'front', build: { bag: 'shoulder', phone: true, head: 'beanie' }, key: 'crnt0' });
  crowdFig(46, 808, 24, { ...base, seed: 823, view: 'side', dir: 1, phone: 0, build: { bag: 'backpack', head: 'hood', top: 'hoodie' }, key: 'crnt1' });
}

// ======================================================================================================================
// BOT SILHOUETTES: the cast pool as friendly background shapes (the B1 rave crowd's idea, redrawn): Clawd's box, Grok's
// sphere with its little tailpipe, Muse's Jolly (a hooded plush dumpling on stubby legs, its face a paler oval), Copilot's goggled flying cap and scarf, a Gemini gumdrop with
// its sparkle, the Codex pets (Codey's cloud head on its little body; Dewey's droplet over its floating feet; Fireball's
// flame on a box head; Seedy's sprout; BSOD's monitor and ball antenna; and, by name only, Rocky's spiky boulder, Stacky's
// three blocks, Null Signal's hook cable, Hoot's tufted owl). The old pet names still work and draw the new pets (term →
// codey, cat → seedy, ghost → dewey, crab → fireball, dog → bsod), so the pools and their seeds stay as they were. One flat
// tone; soft pale eyes (round dots, rounded pills, happy ∩ arcs, ∪ when dozing), never slits.
//   crowdBot(x, y, u, o)  (x, y): the ground point (stand), the seat (sit, perch) or the surface under it (lie); u the cast's
//     unit (sizes compare with the rigs). o.kind (default: picked by o.seed) · o.pose 'stand' | 'sit' | 'perch' (on an edge,
//     legs dangling) | 'lie' (on its back, head toward o.dir) · o.dir 1 faces right, -1 left · o.front 0..1 (the face
//     turned to us: the eyes centred) · o.prop 'cup' | 'paper' | 'tablet' (sit / perch: held and used on its own clock: a
//     sip, a page turned, a tap) · o.grip [x, y] (stand: the near hand up to a pole, world px) · o.doze (eyes shut, a slow
//     nod) · o.happy (the chance of happy ∩ eyes, default .35) · o.col · o.eye (eye colour) · o.t (the clock) · o.key · o.idle 0 = still
const BOT_KINDS = ['clawd', 'grok', 'muse', 'copilot', 'gemini', 'cat', 'term', 'ghost', 'crab', 'dog'];
// per kind: hip (the body's bottom above the ground, u), legs (their x, u; [] none), lw (leg width), hw (half width), fx
// (how far the eyes shift toward the facing side, u), eyes (default style), er (eye radius, u)
const CRB = {
  clawd:   { hip: 1.0, legs: [-2.5, -1.1, 1.1, 2.5], lw: .62, hw: 3.4, fx: .5, eyes: 'happy', er: .42 },
  grok:    { hip: 2.9, legs: [-.8, .8], lw: .45, hw: 2.5, fx: .55, eyes: 'pill', er: .36 },
  muse:    { hip: .9, legs: [-.78, .78], lw: .95, hw: 2.05, fx: .4, eyes: 'dot', er: .24 },
  copilot: { hip: 1.25, legs: [-.55, .55], lw: .52, hw: 1.9, fx: .45, eyes: 'goggle', er: .5 },
  gemini:  { hip: 0, legs: [], lw: 0, hw: 1.8, fx: .45, eyes: 'dot', er: .28 },
  codey:    { hip: .6, legs: [-.45, .45], lw: .5, hw: 1.7, fx: .5, eyes: 'dot', er: .26 },
  dewey:    { hip: .3, legs: [], lw: 0, hw: 1.5, fx: .4, eyes: 'dot', er: .28 },
  fireball: { hip: .6, legs: [-.4, .4], lw: .46, hw: 1.3, fx: .45, eyes: 'dot', er: .24 },
  rocky:    { hip: .3, legs: [], lw: 0, hw: 1.75, fx: .4, eyes: 'dot', er: .24 },
  seedy:    { hip: .6, legs: [-.4, .4], lw: .46, hw: 1.25, fx: .45, eyes: 'dot', er: .24 },
  stacky:   { hip: .6, legs: [-.45, .45], lw: .44, hw: 1.1, fx: .35, eyes: 'dot', er: .18 },
  bsod:     { hip: .6, legs: [-.4, .4], lw: .46, hw: 1.35, fx: .45, eyes: 'pill', er: .26 },
  null:     { hip: .6, legs: [-.4, .4], lw: .46, hw: 1.3, fx: .45, eyes: 'dot', er: .22 },
  hoot:     { hip: .45, legs: [-.45, .45], lw: .36, hw: 1.45, fx: .4, eyes: 'goggle', er: .42 },
};
// the old Codex pet names draw the new pets
const CR_ALIAS = { term: 'codey', cat: 'seedy', ghost: 'dewey', crab: 'fireball', dog: 'bsod', 'null-signal': 'null' };
for (const [a, k] of Object.entries(CR_ALIAS)) CRB[a] = CRB[k];   // (the train's pools look sizes up by the old names)
// a cloud: the outline of a union of circles [[x, y, r], ...] walked by angle round c (Codey's head)
function crCloud(circles, c, n = 56) {
  const P = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU, ux = Math.cos(a), uy = Math.sin(a); let d = 0;
    for (const [bx, by, br] of circles) { const px = bx - c[0], py = by - c[1], b = px * ux + py * uy, D = b * b - (px * px + py * py - br * br); if (D >= 0) d = Math.max(d, b + Math.sqrt(D)); }
    P.push([c[0] + ux * d, c[1] + uy * d]);
  }
  return P;
}
const crTorso = () => crRect(-.66, -1.85, .66, -.55, .28);
// A kind's body standing (bottom at -hip), facing +x: { parts: [[poly, name]], eyes: [[x, y]], sh: the near shoulder }
function crBotBody(kind, g) {   // g: the eyes' shift toward the facing side (u)
  switch (kind) {
    case 'clawd': return { parts: [[crRect(-3.4, -5.4, 3.4, -1.0, .2), 'b'], [ribbon([[3.2, -3.6], [3.9, -3.9]], .55, .45), 'nub']], eyes: [[-1.0 + g, -3.7], [1.0 + g, -3.7]], sh: [2.9, -3.3] };
    case 'grok': return { parts: [[oval(0, -5.4, 2.5, 2.5, 0, 28), 'b'], [crRect(-3.25, -4.8, -2.3, -4.1, .15), 'pipe']], eyes: [[-.62 + g, -5.7], [.62 + g, -5.7]], sh: [1.6, -4.4] };
    case 'muse': {   // Jolly: the hood round a paler face, the dumpling body, a fuzzy edge (bots.js muse's outline, bottom at -hip)
      const R = [[0, -3.02], [.66, -2.94], [1.2, -2.66], [1.6, -2.2], [1.82, -1.62], [1.86, -1.02], [1.76, -.46], [1.66, -.06], [1.78, .42], [1.98, 1.0], [2.08, 1.58], [2.0, 2.08], [1.72, 2.46], [1.18, 2.68], [.52, 2.74]];
      const C = curvy(R.concat([[0, 2.76]], R.slice(1).reverse().map(([x, y]) => [-x, y])), 4), c0 = [0, -.1], dy0 = -3.66;
      const b = C.map(([x, y], i) => { const k = 1 + .035 * Math.abs(Math.sin(i * Math.PI / 4)); return [c0[0] + (x - c0[0]) * k, c0[1] + (y - c0[1]) * k + dy0]; });
      return { parts: [[b, 'b']], face: oval(.12 * g, -4.96, 1.22, .98, 0, 22), eyes: [[-.48 + .3 * g, -4.94], [.48 + .3 * g, -4.94]], sh: [1.46, -3.7] };
    }
    case 'copilot': return { parts: [[ribbon([[-.7, -4.55], [-2.1, -4.95], [-2.9, -4.4]], .42, .16), 'scarf'], [crRect(-1.25, -4.7, 1.25, -1.15, .55), 'b'], [oval(0, -6.3, 1.75, 1.7, 0, 24), 'h'], [oval(-.1, -6.75, 1.9, 1.45, 0, 24), 'cap'],
      [oval(-1.55, -5.7, .45, .8, .2, 12), 'flapL'], [oval(1.55, -5.7, .45, .8, -.2, 12), 'flapR'], [oval(-.1, -8.2, .28, .26, 0, 10), 'btn']], eyes: [[-.72 + g, -6.2], [.72 + g, -6.2]], sh: [1.1, -4.2] };
    case 'gemini': return { parts: [[curvy([[-1.75, 0], [-1.85, -1.2], [-1.3, -2.6], [0, -3.3], [1.3, -2.6], [1.85, -1.2], [1.75, 0]], 5), 'b'], [ribbon([[0, -3.2], [.3, -4.2]], .2, .16), 'stalk'], [starPts(.3, -4.65, .6, .36, 4), 'spark']], eyes: [[-.5 + g, -1.9], [.5 + g, -1.9]], sh: [1.5, -1.4] };
    // the Codex pets
    case 'codey': return { parts: [[crTorso(), 'torso'], [crCloud([[0, -2.8, 1.2], [0, -3.5, .6], [-.7, -3.38, .58], [.7, -3.38, .58], [-1.15, -2.9, .52], [1.15, -2.9, .52], [-1.18, -2.3, .48], [1.18, -2.3, .48], [-.72, -1.9, .46], [.72, -1.9, .46], [0, -1.86, .5]], [0, -2.8]), 'b']],
      eyes: [[-.42 + g, -2.8], [.42 + g, -2.8]], sh: [.7, -1.5] };
    case 'dewey': return { parts: [[curvy([[0, -4.05], [.4, -3.5], [.95, -2.8], [1.4, -2.0], [1.48, -1.3], [1.2, -.75], [.6, -.5], [0, -.46], [-.6, -.5], [-1.2, -.75], [-1.48, -1.3], [-1.4, -2.0], [-.95, -2.8], [-.4, -3.5]], 4), 'b'],
      [crRect(-.85, -.28, -.35, .02, .1), 'ftA'], [crRect(.35, -.28, .85, .02, .1), 'ftB']], eyes: [[-.48 + g, -1.75], [.48 + g, -1.75]], sh: [1.35, -1.2] };
    case 'fireball': return { parts: [[crTorso(), 'torso'], [[[-1.0, -3.2], [-.75, -3.85], [-.45, -3.5], [-.05, -4.25], [.35, -3.55], [.7, -3.9], [1.0, -3.2]], 'flame'], [crRect(-1.25, -3.35, 1.25, -1.65, .35), 'b']],
      eyes: [[-.42 + g, -2.55], [.42 + g, -2.55]], sh: [.66, -1.5] };
    case 'rocky': return { parts: [[[[-.9, -3.05], [-.7, -3.75], [-.4, -3.2]], 'spA'], [[[-.2, -3.25], [.1, -4.05], [.45, -3.3]], 'spB'], [[[.55, -3.15], [.85, -3.7], [1.05, -2.95]], 'spC'],
      [curvy([[-1.45, -.45], [-1.72, -1.2], [-1.68, -2.2], [-1.35, -2.95], [-.7, -3.3], [.1, -3.4], [.9, -3.25], [1.45, -2.8], [1.72, -2.0], [1.7, -1.15], [1.45, -.45], [.5, -.33], [-.5, -.35]], 4), 'b'],
      [oval(-.8, -.2, .5, .24, 0, 12), 'ftA'], [oval(.8, -.2, .5, .24, 0, 12), 'ftB']], eyes: [[-.28 + g, -2.05], [.48 + g, -2.05]], sh: [1.5, -1.5] };
    case 'seedy': return { parts: [[crTorso(), 'torso'], [ribbon([[0, -3.5], [.03, -3.95], [.06, -4.2]], .16, .12), 'stem'], [oval(-.45, -4.3, .48, .2, .35, 12), 'leafL'], [oval(.58, -4.38, .5, .2, -.4, 12), 'leafR'], [crRect(-1.2, -3.55, 1.2, -1.65, .32), 'b']],
      eyes: [[-.4 + g, -2.55], [.4 + g, -2.55]], sh: [.66, -1.5] };
    case 'stacky': return { parts: [[ribbon([[-.3, -3.5], [-.4, -3.95], [-.35, -4.2]], .1, .08), 'antL'], [ribbon([[.3, -3.5], [.42, -4.0], [.35, -4.3]], .1, .08), 'antR'], [oval(.35, -4.36, .14, .14, 0, 10), 'tip'],
      [crRect(-1.0, -1.55, 1.0, -.55, .28), 'b'], [crRect(-.95, -2.55, 1.05, -1.6, .28), 'mid'], [crRect(-1.02, -3.55, .98, -2.6, .28), 'top']], eyes: [[-.32 + g, -3.1], [.32 + g, -3.1]], sh: [1.0, -2.1] };
    case 'bsod': return { parts: [[crTorso(), 'torso'], [ribbon([[.3, -3.45], [.45, -3.9], [.72, -4.2]], .1, .08), 'ant'], [oval(.78, -4.28, .2, .2, 0, 12), 'ball'], [crRect(-1.3, -3.5, 1.3, -1.65, .32), 'b']],
      eyes: [[-.42 + g, -2.6], [.42 + g, -2.6]], sh: [.66, -1.5] };
    case 'null': return { parts: [[crTorso(), 'torso'], [ribbon([[0, -3.4], [-.05, -3.85], [.15, -4.2], [.5, -4.25], [.7, -4.0], [.62, -3.75]], .17, .15), 'hook'], [crRect(-1.25, -3.45, 1.25, -1.65, .3), 'b']],
      eyes: [[-.42 + g, -2.55], [.42 + g, -2.55]], sh: [.66, -1.5] };
    case 'hoot': return { parts: [[[[-1.25, -3.1], [-1.4, -3.95], [-.7, -3.4]], 'tuftL'], [[[1.25, -3.1], [1.4, -3.95], [.7, -3.4]], 'tuftR'],
      [curvy([[0, -3.6], [.75, -3.5], [1.25, -3.1], [1.45, -2.3], [1.4, -1.3], [1.05, -.6], [.5, -.45], [0, -.42], [-.5, -.45], [-1.05, -.6], [-1.4, -1.3], [-1.45, -2.3], [-1.25, -3.1], [-.75, -3.5]], 4), 'b']],
      eyes: [[-.5 + g, -2.7], [.5 + g, -2.7]], sh: [1.3, -1.7] };
  }
}
// a pale flat piece in the current look (eyes, a lit screen, paper), colour c where the look can print it
function crPale(P, c, o, part) {
  if (o.clip) { P = clipConvex(P, o.clip); if (P.length < 3) return; }
  if (o.hole) { for (const Q of crHoleSplit(P, o.hole)) crPale(Q, c, { ...o, hole: null }, part); return; }
  const m = STYLE.mode;
  if (STYLE.card) { piece(P, c, { ink: null, key: (o.key || 'cr') + part, lift: 0, flatCard: true, edge: false }); return; }
  if (m === 'xerox') { _paint(P, { wash: XEROX.paper, ink: null }); return; }
  if (m === 'bank') { _paint(P, { wash: BANK.paper, ink: null }); return; }
  if (m === 'doodle') { _paint(P, { wash: '#FBF8F0', ink: null }); return; }
  _paint(P, { wash: c, ink: null });
}
// an eye (unit space): dot, pill (rounded, never a slit), happy ∩, shut ∪ (dozing), goggle (a big round lens)
function crBotEye(x, y, r, style) {
  if (style === 'happy') return strokeShape([[x - r, y + r * .3], [x, y - r * .55], [x + r, y + r * .3]], k => r * (.2 + .32 * Math.sin(Math.PI * k)), 5);
  if (style === 'shut') return strokeShape([[x - r, y - r * .15], [x, y + r * .5], [x + r, y - r * .15]], k => r * (.18 + .28 * Math.sin(Math.PI * k)), 5);
  if (style === 'pill') return oval(x, y, r * .62, r * 1.2, 0, 14);
  return oval(x, y, r * .9, r, 0, 14);
}
// its own clock: 0..1 how far into an occasional gesture (a period of p0..p0+dp s, the gesture `len` s long, in `share`
// of the periods)
function crBeat(seed, t, p0, dp, len, share = 1) {
  const P = p0 + dp * hash(seed * 2.3), s = t / P + hash(seed * 4.1), n = Math.floor(s), f = (s - n) * P;
  if (hash(seed * 1.7 + n * 3.1) > share) return 0;
  const a = .2 + (P - len - .4) * hash(seed * 5.9 + n);
  return clamp((f - a) / len);
}
// A rim of an overhead light along a silhouette's top edges (o.rim: the light's colour, o.rimK: its strength 0..1):
// the lit runs of every part except the legs, left out wherever another part covers them. Unit-space parts, placed by pl.
function crRim(parts, pl, col, u, o) {
  const pL = LIGHT.dir, pX = XF; LIGHT.dir = [0, -1]; XF = 1;
  const w = clamp(.055 * u, .8, 2.2), rc = mixCol(col, o.rim, o.rimK ?? .5);
  try {
    for (const [P, n] of parts) {
      if (/^(leg|ft)/.test(n) || P.length < 3) continue;
      for (const run of litEdge(P, .05, .3)) {
        let cur = [];
        const out = () => { if (cur.length > 1) { const Wp = pl(cur); let seg = []; for (const q of Wp.concat([null])) { if (q && !crInHole(q, o.hole)) seg.push(q); else { if (seg.length > 1) _inkLine(seg, w, rc, 'flashfine', 0); seg = []; } } } cur = []; };
        for (const p of run) { if (parts.some(([Q, m]) => Q !== P && !/^(leg|ft)/.test(m) && inPoly(p[0], p[1], Q))) out(); else cur.push(p); }
        out();
      }
    }
  } finally { LIGHT.dir = pL; XF = pX; }
}
function crowdBot(x, y, u, o = {}) {
  const seed = o.seed ?? 1, kind0 = o.kind || BOT_KINDS[Math.floor(hash(seed * 9.13) * BOT_KINDS.length)], kind = CR_ALIAS[kind0] || kind0, K = CRB[kind], key = o.key || 'crb' + seed;
  const t = o.t ?? (typeof mt === 'function' ? mt(T) : T), pose = o.pose || 'stand', dir = o.dir ?? 1, col = o.col || '#1B1F31', fo = { ...o, key };
  if (o.cull !== false && typeof worldToScreen === 'function') {
    const a = worldToScreen(x - 6 * u, y - 10 * u), b = worldToScreen(x + 6 * u, y + 4 * u);
    if (Math.max(a.x, b.x) < -40 || Math.min(a.x, b.x) > W + 40 || Math.max(a.y, b.y) < -40 || Math.min(a.y, b.y) > H + 40) return;
  }
  const L = o.idle === 0 ? { breath: 0, lean: 0, tilt: 0, turn: 0 } : lifeOf({ idle: o.idle ?? 1 }, 'bot' + seed, t + 13 * hash(seed));
  const front = clamp(o.front ?? 0), g = K.fx * (1 - front) + .25 * K.fx * L.turn;
  const B = crBotBody(kind, g), sat = pose === 'sit' || pose === 'perch', dy = sat ? K.hip : 0;
  const sh = (P, dx = 0, d2 = dy) => P.map(([a, b]) => [a + dx, b + d2]);
  let parts = B.parts.map(([P, n]) => [sh(P), n]);
  // legs: standing (straight down), sitting (forward along the seat), perching (dangling over the edge)
  const legs = [];
  for (const lx of K.legs) {
    let P;
    if (pose === 'stand' || pose === 'lie') P = [[lx * .9, -K.hip - .1], [lx, -.25]];
    else if (pose === 'sit') P = [[lx * .45, -.35], [lx * .45 + 1.2 + .25 * Math.abs(lx), -.25]];
    else P = [[lx * .6, -.2], [lx * .6 + .75, .35], [lx * .6 + .6, 1.5]];
    const e = P[1], foot = pose === 'sit' ? oval(e[0] + .15, e[1] - .12, .42, .3, 0, 10) : oval(e[0] + .25, e[1], .45, .28, 0, 10);
    legs.push([ribbon(P, K.lw * 1.05, K.lw * .9), 'leg' + lx], [foot, 'ft' + lx]);
  }
  parts = legs.concat(parts);
  // the near arm and what it holds: a gesture on the bot's own clock, never the beat
  const S0 = [B.sh[0], B.sh[1] + dy], prop = o.prop, arms = [], props = [], pales = [];
  let hand = null;
  const eyeC = centroid(B.eyes.map(([a, b]) => [a, b + dy]));
  if (pose === 'stand' && o.grip) hand = 'grip';
  else if (prop === 'cup') { const k = crBeat(seed, t, 4.5, 3, 1.6, .8), up = ease(clamp(k * 4)) * (1 - ease(clamp((k - .75) * 4)));
    hand = [lerp(S0[0] + 1.3, eyeC[0] + 1.0, up), lerp(S0[1] + 1.0, eyeC[1] + .7, up)];
    props.push([crRect(hand[0] - .15, hand[1] - .75, hand[0] + .55, hand[1] + .15, .12), 'cup']); }
  else if (prop === 'paper') {   // an open paper held up (its face to us), the fold down the middle; a page turned now and then
    const turn = crBeat(seed, t, 5, 4, .5, .75), fl = Math.cos(turn * Math.PI), pc = mixCol(col, '#C9C7BE', .42), cx = eyeC[0] + .55, cy = eyeC[1] + 1.25;
    hand = [cx - 1.4, cy + .35];
    props.push({ pale: pc, P: [[cx - 1.45, cy - 1.25], [cx + 1.45, cy - 1.35], [cx + 1.5, cy + 1.2], [cx - 1.5, cy + 1.3]], n: 'paper' });
    props.push([[[cx - .05, cy - 1.3], [cx + .05, cy - 1.3], [cx + .05, cy + 1.25], [cx - .05, cy + 1.25]], 'fold']);
    if (turn > 0 && turn < 1) props.push({ pale: mixCol(pc, '#FFFFFF', .3), P: [[cx, cy - 1.3], [cx + 1.45 * fl, cy - 1.45 + .1 * Math.abs(fl)], [cx + 1.5 * fl, cy + 1.25], [cx, cy + 1.25]], n: 'page' }); }
  else if (prop === 'tablet') { const tap = crBeat(seed, t, 1.2, 1.4, .25, .9), b = .12 * Math.sin(tap * Math.PI);
    hand = [S0[0] + 1.1, S0[1] + .75 - b];
    const c = Math.cos(-.18), s = Math.sin(-.18), R = (a, bb) => [hand[0] + .3 + a * c - bb * s, hand[1] - .75 + a * s + bb * c];
    props.push([[R(-1.0, -.72), R(1.0, -.72), R(1.0, .72), R(-1.0, .72)], 'tab']);
    props.push({ pale: o.screen || '#8FA6CC', P: [R(-.82, -.56), R(.82, -.56), R(.82, .56), R(-.82, .56)], n: 'scr', lit: true }); }   // (o.screen: its glow)
  else if (pose !== 'lie') hand = [S0[0] + .7, S0[1] + 1.4 + .1 * L.breath];
  // eyes: dozing shut, else the kind's own (some always happy); the whole bot sways a hair on its own clock
  const doze = o.doze || (pose === 'lie' && hash(seed * 3.7) < .7);
  let est = doze ? 'shut' : hash(seed * 6.1) < (o.happy ?? .35) && K.eyes !== 'goggle' && K.eyes !== 'stalk' ? 'happy' : K.eyes;   // (o.happy: the share with happy ∩ eyes)
  if (o.eyes && K.eyes !== 'goggle' && K.eyes !== 'stalk') est = o.eyes;   // (o.eyes: force a style, e.g. 'happy' when pleased)
  // (lie: on its back along the surface, head toward dir: the standing shape turned a quarter, set down on y)
  let rot = cardHold((L.lean * 1.5 + (doze ? .05 + .03 * Math.sin(t * .9 + seed) : 0)) * (o.idle ?? 1), .5 / (6 * u * drawScale())) - .08 * (o.hop || 0), X = x, Y = y + (pose === 'lie' ? 0 : -L.breath * u * .3) - (o.hop || 0) * u;   // (o.hop: a little lift, u)
  let xf = P => P;
  if (pose === 'lie') {   // (a, b) → (cb - b, amin - a): the head (up) toward +x, the front (+x) up, the back down on y
    const all = parts.flatMap(([P]) => P), amin = Math.min(...all.map(p => p[0])), cb = (Math.min(...all.map(p => p[1])) + Math.max(...all.map(p => p[1]))) / 2;
    xf = P => P.map(([a, b]) => [cb - b, amin - a]);
    rot = 0;
  }
  const place = P => crPlace(xf(P), X, Y, u, rot * dir, dir);
  boilSeed('crbot ' + key);
  push(); if (STYLE.card) { const NY = y - (o.hop || 0) * u; translate(X, NY); nudge(key, .6); translate(-X, -NY); }   // (placed where it stands: its breath isn't a touch)
  for (const [P, n] of parts) crPaint(place(P), col, { ...fo, flat: n !== 'b' }, n);
  if (o.rim && (STYLE.card || STYLE.mode === 'ink')) crRim(parts.map(([P, n]) => [xf(P), n]), P => crPlace(P, X, Y, u, rot * dir, dir), col, u, o);
  let ec = o.eye || mixCol(col, '#E6E8F0', .7);
  if (B.face && pose !== 'lie') { crPale(place(sh(B.face)), mixCol(col, ec, .55), fo, 'face'); ec = col; }   // (Jolly: a paler face, dark bead eyes on it)
  // (upright, even lying: then side by side at the turned head, as if it had rolled its face to us)
  const placeE = P => crPlace(P, X, Y, u, rot * dir, dir);
  const gl = o.glance || [0, 0];   // (o.glance [x, y] u: where it's looking; -x = back over its shoulder, -y = up)
  let E = B.eyes.map(([ex, ey]) => xf([[ex + gl[0], ey + dy + gl[1]]])[0]);
  if (pose === 'lie' && E.length === 2) { const c = centroid(E), sp = Math.abs(B.eyes[1][0] - B.eyes[0][0]) / 2; E = [[c[0] - sp, c[1] - .15], [c[0] + sp, c[1] - .15]]; }
  if (K.eyes === 'stalk') for (const [ex, ey] of E) crPale(placeE(oval(ex, ey, .26, .26, 0, 10)), ec, fo, 'e' + ex);
  else for (const [ex, ey] of E) crPale(placeE(crBotEye(ex, ey, K.er, est === 'goggle' ? 'dot' : est)), ec, fo, 'e' + ex);
  if (K.eyes === 'goggle' && est !== 'shut') for (const [ex, ey] of E) crPaint(placeE(oval(ex + .12, ey + .08, .17, .17, 0, 8)), col, { ...fo, flat: true }, 'pu' + ex);   // a pupil in each lens
  // the near arm, then the prop in the hand
  if (hand === 'grip') { const gp = o.grip, loc = [(gp[0] - X) / u * dir, (gp[1] - Y) / u]; hand = [loc[0], loc[1]]; }
  if (hand) {
    const mid = [lerp(S0[0], hand[0], .5) + .15, lerp(S0[1], hand[1], .5) + .35];
    crPaint(place(ribbon([S0, mid, hand], .48, .38)), col, { ...fo, flat: true }, 'arm');
    for (const p of props) { if (Array.isArray(p)) crPaint(place(p[0]), col, { ...fo, flat: true }, p[1]); else crPale(place(p.P), p.pale, fo, p.n); }
    crPaint(place(oval(hand[0], hand[1], .36, .36, 0, 10)), col, { ...fo, flat: true }, 'hand');
  }
  pop();
}

// C1a–C2c, F4, Z2 (chorus.js carriage()): the night train's passengers, in two stagings.
//   The late train (the default: F4, Z2, the cover): bot passengers asleep in the seats not in play, their backs to the
//     seat back and their heads up at the windows' lower edge, the racks full (asleep, curled up, legs dangling off the
//     edge), the sills perched on. A dusty violet-grey a step lighter than the wall and moquette, soft pale eyes, and a
//     thin rim of the ceiling strip light along every top edge, so they read as a crowd against the dark set.
//   The rush hour (o.commute: C1a–C1c, C2a–C2c): trainCommute, below.
// layer: 'back' (after the shell: racks, sills), 'seats' (after the seat backs, before the tables: the seated), 'front'
// (after the cushions and the crew: the aisle's standers). o.CR: the carriage's geometry; o.i0..i1: bays; o.level: 1
// packed (C1), 2 fuller still (C2); o.skip: bays whose seats stay free (F4, Z2's bay 0: the narrators sit there);
// o.seatSkip: [[bay, side]] seats left for a shot's own passenger; o.rackSkip: racks kept clear; o.rackSlots(i): x offsets
// of rack i's places (default three); o.sills(i) / o.sillX(i, side) / o.sillSkip; o.hole: [x0, y0, x1, y1] world rect
// kept clear (a picture in a window: C1a/C2a's poster as it slides away); o.dozy: the share asleep (default .15).
const TRAIN_COL = { seat: '#46405A', small: '#403B54', rack: '#4A445E', sill: '#46405A' }, TRAIN_EYE = '#B8BBCF', TRAIN_RIM = '#EDEBDC';
// seated passengers: tall kinds first (so heads reach the window's lower edge), sized ≈ 240 px seated, no wider than the seat
// (Copilot kept rare and small: its goggles are big pale lenses, and they stare if they peek out from behind the crew)
const TRAIN_TALL = ['grok', 'muse', 'gemini', 'ghost', 'term', 'dog', 'copilot', 'ghost', 'muse', 'grok', 'gemini', 'clawd', 'cat', 'muse'];
const TRAIN_SIT = { grok: 42, copilot: 30, muse: 42, gemini: 46, ghost: 54, term: 58, dog: 56, clawd: 31, cat: 40, crab: 32 };
const TRAIN_SMALL = ['cat', 'dog', 'crab', 'term', 'gemini', 'ghost', 'clawd'];
const crPick = (h, pool) => pool[Math.floor(h * pool.length) % pool.length];
// one of the rack's bot passengers, at rack place x (dx: its offset from the bay's middle), seed sd: sat on the edge with
// its legs dangling (dangle), stretched out asleep, or curled up asleep
function trainRackBot(x, dx, sd, dangle, b) {
  const h = hash(sd * .37);
  if (dangle) crowdBot(x, 250, 24, { ...b, kind: crPick(h, ['cat', 'ghost', 'gemini', 'dog', 'term', 'crab']), pose: 'perch', dir: dx < 0 ? 1 : -1, front: .6, happy: .6 });
  else if (h < .5) { const kind = crPick(h / .5, ['grok', 'copilot', 'muse', 'ghost']); crowdBot(x, 246, { grok: 19, copilot: 19, muse: 23, ghost: 26 }[kind], { ...b, kind, pose: 'lie', dir: dx < 0 ? -1 : 1 }); }
  else { const kind = crPick((h - .5) / .5, ['cat', 'dog', 'gemini', 'clawd', 'crab']); crowdBot(x, 246, kind === 'clawd' ? 16 : 24, { ...b, kind, pose: 'sit', doze: true, dir: dx < 0 ? 1 : -1, front: .5 }); }
}
function crowdTrain(layer, t, o = {}) {
  if (!(o.level > 0)) return;
  if (o.commute) { trainCommute(layer, t, o); return; }
  const C = o.CR, i0 = o.i0 ?? -2, i1 = o.i1 ?? 2, lv = o.level, skip = o.skip || [], X = i => 960 + i * C.BW;
  const base = { t, eye: TRAIN_EYE, rim: TRAIN_RIM, rimK: .5, hole: o.hole || null, screen: '#7A88B0' };
  if (layer === 'back') {
    for (let i = i0; i <= i1; i++) {
      // the rack: every place taken (asleep stretched out, curled up, or sat on the edge with its legs dangling)
      if (!(o.rackSkip || []).includes(i)) (o.rackSlots ? o.rackSlots(i) : [-205, 0, 205]).forEach((dx, j) => {
        const sd = 3000 + i * 17 + j * 7, x = X(i) + dx + (hash(sd) - .5) * 30;
        trainRackBot(x, dx, sd, lv > 1 ? j === (((i % 2) + 2) % 2) || hash(sd * 1.9) < .4 : hash(sd * 1.9) < .2, { ...base, seed: sd, col: TRAIN_COL.rack, key: 'crtr' + i + '_' + j });
      });
      // the sills, backs to the night (C1: one a window, C2: two)
      if (!(o.sillSkip || skip).includes(i)) for (const sd of o.sills ? o.sills(i) : lv > 1 ? [-1, 1] : [(i & 1) ? 1 : -1]) {
        const sd2 = 3500 + i * 13 + sd * 5, kind = crPick(hash(sd2 * .37), ['cat', 'ghost', 'gemini', 'dog', 'crab', 'term']);
        crowdBot(X(i) + sd * ((o.sillX && o.sillX(i, sd)) ?? 95 + 30 * hash(sd2)), C.WT + C.WH + 18, 25, { ...base, kind, pose: 'perch', dir: -sd, front: .75, seed: sd2, col: TRAIN_COL.sill, happy: .55, key: 'crsl' + i + sd });
      }
    }
    return;
  }
  if (layer !== 'seats') return;
  for (let i = i0; i <= i1; i++) {
    if (skip.includes(i)) continue;
    for (const sd of [-1, 1]) {
      if ((o.seatSkip || []).some(([a, b]) => a === i && b === sd)) continue;   // (o.seatSkip [[bay, side]]: one seat kept for a shot's own passenger)
      const s = 2000 + i * 31 + sd * 7, kind = crPick(hash(s * .71), TRAIN_TALL), K = CRB[kind], u = TRAIN_SIT[kind];
      // the passenger, back against the seat back, with a cup, a paper or a tablet (or dozing)
      const prop = crPick(hash(s * 1.3), ['cup', 'paper', 'tablet', null, 'cup', 'paper']);
      crowdBot(X(i) + sd * (280 - K.hw * u), C.SY - 8, u, { ...base, kind, pose: 'sit', dir: -sd, front: .6, prop, seed: s, col: TRAIN_COL.seat, happy: .5,
        doze: hash(s * 2.9) < (o.dozy ?? .15), key: 'crts' + i + sd });
      // squeezed in beside it: one at the table end (C1: some seats), and (C2) one more between them (three to a seat)
      const extra = lv > 1 ? [1, 0] : hash(s * 4.3) < .55 ? [0] : [];
      for (const k of extra) {
        const s2 = s + 1 + k, k2 = crPick(hash(s2 * .53), TRAIN_SMALL), u2 = k ? 26 : 30, x2 = X(i) + sd * (k ? 205 : 118 + CRB[k2].hw * u2);
        crowdBot(x2, C.SY - 4, u2, { ...base, kind: k2, pose: 'sit', dir: -sd, front: .6, seed: s2, col: TRAIN_COL.small, happy: .6, key: 'crts' + (k ? 3 : 2) + i + sd });
      }
    }
  }
}

// is the world box off screen under the current camera? (crowds run wide: skip what the camera can't see)
function crOff(x0, y0, x1, y1) {
  if (typeof CAM === 'undefined' || !CAM || typeof toScreen !== 'function') return false;
  const a = toScreen(x0, y0), b = toScreen(x1, y1);
  return Math.max(a[0], b[0]) < -40 || Math.min(a[0], b[0]) > W + 40 || Math.max(a[1], b[1]) < -40 || Math.min(a[1], b[1]) > H + 40;
}
// crSide's parts for a seated figure (unit space, standing): the coat and the far arm cut off at the seat (a long coat's
// hem hung below the cushion as a lump), what's left of them kept
function crSeated(parts, H) {
  const cut = CR.hip * H + .55, C = [[-60, -60], [60, -60], [60, cut], [-60, cut]];
  return parts.map(([P, n]) => /^(body|af|pack|hoodb)$/.test(n) ? [clipConvex(P, C), n] : [P, n]).filter(([P]) => P.length > 2);
}
// Sat against a seat back (the user: "people in the seats are leaning so far back, or their head is backing over the top
// of the seat"; "I don't think you can get away with much clipping"): where the hip goes so the figure's back and head
// just touch the seat back's front face and never cross it (face(y): the face's world x at height y; gap px in front),
// and its scale, so the head stays under the headrest's top (maxTop). parts: the upper body round the hip (unit, +x
// forward); dir: the way it faces. Returns { x, u }.
function crSeatFit(parts, x, y, u, dir, face, maxTop, gap = 3) {
  let minY = 0; for (const [P] of parts) for (const p of P) minY = Math.min(minY, p[1]);
  if (maxTop != null && minY < 0) u = Math.min(u, (y - maxTop) / -minY);
  let pen = -Infinity;
  for (const [P] of parts) for (const [px, py] of P) { const wx = x + dir * px * u; pen = Math.max(pen, dir * (face(y + py * u) - wx)); }
  return { x: x + dir * (pen + gap), u };
}
// A commuter sat in a seat, in profile (the rush-hour carriage's passengers): crSide's figure sat down, the hip on the
// cushion at (x, y), facing o.dir, sat up against the seat back (a slight recline at most, o.recline: the back's own), the
// thighs along the seat (the cushion, drawn after, covers the rest). o.act: 'doze' (slumped forward, the head fallen onto
// the chest), 'rest' (asleep sat back, the head resting on the headrest; a doze is sometimes this), 'phone' (bent to it, the
// near hand up at the chest, the phone's screen toward the face: seen edge on, a faint light along its face side, never
// turned to us), 'read' (a paperback held open at the chest, the head down to it), 'look' (sat back, ahead). o.face(y) /
// o.maxTop: the seat back's front face and the headrest's top (crSeatFit: x moves back or forward to sit against it, u
// shrinks to fit under it). o.seed (the build and its clocks), o.col, o.t, o.key, o.rimK (the strip light's rim along its
// top edges), o.hole, o.knee / o.floor (the legs: below).
function crowdSit(x, y, u, o = {}) {
  const seed = o.seed ?? 1, dir = o.dir ?? 1, key = o.key || 'crsit' + seed, t = o.t ?? (typeof mt === 'function' ? mt(T) : T), act = o.act || 'look';
  if (crOff(x - 5 * u, y - 9.5 * u, x + 5 * u, y + 3 * u)) return;
  const B = crowdBuild(seed, { bag: 'none', ...o.build }), H = B.ht, col = o.col || '#46405A', r = i => hash(seed * 3.17 + i * 1.3);
  const L = o.idle === 0 ? { breath: 0, lean: 0, tilt: 0, turn: 0 } : lifeOf({ idle: o.idle ?? .7 }, 'crsit' + seed, t + 11 * hash(seed));
  const doze = act === 'doze' || act === 'rest', busy = act === 'phone' || act === 'read', rest = act === 'rest' || (act === 'doze' && r(1) < .4), rc = o.recline ?? .04;
  const sl = doze ? (rest ? .3 : .8 + .15 * r(2)) : busy ? .3 : .06;
  const br = doze ? .08 * Math.sin(t * TAU / (3.4 + r(3)) + seed) : L.breath;   // (asleep: slow, deep breaths)
  const lean0 = o.lean ?? (doze ? (rest ? rc : -.03) : busy ? -.02 - .03 * r(4) : rc - .02 * r(4));   // (+ reclines: never past the seat back's own)
  const tilt = doze ? (rest ? -.16 : .24) : busy ? .34 + .1 * r(5) : .03 * r(5) + .5 * L.tilt;   // (+ the head down)
  const hipY = CR.hip * H, upAt = a => { const c = Math.cos(-a), s = Math.sin(-a); return ([px, py]) => { const Y = py - hipY; return [px * c - Y * s, px * s + Y * c]; }; };   // (crSide's coords → round the hip, reclined by a)
  const upper = (br, a) => { const f = upAt(a); return crSeated(crSide(B, { slump: sl, breath: br, tilt }).parts, H).filter(([, n]) => !/^(lf|ln|arm|hand)/.test(n)).map(([P, n]) => [P.map(f), n]); };
  // sat against the seat back: placed once from its resting pose (so it doesn't creep as it breathes), then drawn alive
  if (o.face) ({ x, u } = crSeatFit(upper(0, lean0), x, y, u, dir, o.face, o.maxTop));
  const lean = lean0 + .3 * L.lean, up = upAt(lean), parts = upper(br, lean);
  // the near arm, from the shoulder: the hand on the thigh, or up in front of the chest with the phone or the book
  const shY = CR.sh * H + .22 * sl + br, S0 = up([-.05, shY + .5]);
  let Wr, E0;
  if (busy) { const ph = act === 'phone'; Wr = up(ph ? [2.3, CR.chest * H - .3] : [2.3, CR.chest * H + .7]); E0 = up(ph ? [.8, CR.waist * H] : [.6, CR.waist * H + .5]); }
  else { Wr = [1.55, -.35]; E0 = [lerp(S0[0], Wr[0], .45) - .35, lerp(S0[1], Wr[1], .5) + .2]; }
  const arm = [[ribbon([S0, E0, Wr], .82, .62), 'arm'], [oval(Wr[0] + .1, Wr[1] + .05, .36, .34, 0, 10), 'hand']];
  // the legs (the hip at (0, 0), +x forward), the far one a touch back: sat properly (o.knee: the world x of the cushion's
  // front edge, o.floor: the floor's y), the thigh along the seat, the knee over its edge and the shin straight down to the
  // foot flat on the floor, seen under the table's end (the seats are the cast's height: seated, the crowd's legs are drawn
  // at a person's proportions, not its standing figure's short ones); else the thighs along the seat and the shins hanging
  const T1 = 2.55 * H, T2 = 2.45 * H, legs = [];
  for (const [dx, dy, nm] of [[-.25, -.12, 'lfar'], [0, 0, 'lnear']]) {
    const K = o.knee != null ? [Math.abs(o.knee - x) / u + dx, -.15 + dy] : [T1 + dx, .1 + dy], A = o.knee != null ? [K[0] + .3 + .6 * dx, (o.floor - y) / u - .02] : [K[0] + .35, K[1] + T2];
    legs.push([ribbon([[dx * .3, dy * .3], K, A], 1.0, .74), nm], [[[-.35, -.35], [.25, -.42], [.95, -.08], [.9, .02], [-.35, .02]].map(([fx, fy]) => [A[0] + fx, A[1] + fy]), nm + 'f']);
  }
  const pl = P => crPlace(P, x, y, u, 0, dir), fo = { key, lift: o.lift ?? 2.5, hole: o.hole || null };
  boilSeed('crsit ' + key);
  push(); if (STYLE.card) { translate(x, y); nudge(key, .6); translate(-x, -y); }
  for (const [P, n] of legs) crPaint(pl(P), col, fo, n);
  for (const [P, n] of parts) crPaint(pl(P), col, fo, n);
  // what's in the hand, seen side on: the phone a slim slab tipped up to the eyes, the light of its screen a sliver
  // along the face side; the book open, its pages toward the face (a pale wedge of paper over the dark cover)
  const at = (a, n) => ([p, q]) => [Wr[0] + a[0] * p + n[0] * q, Wr[1] + a[1] * p + n[1] * q];
  if (act === 'phone') {
    const a = [Math.cos(-1.05 - lean), Math.sin(-1.05 - lean)], n = [a[1], -a[0]], f = at(a, n);   // (a: up its length; n: toward the face)
    crPaint(pl([f([-.1, -.08]), f([.8, -.08]), f([.8, .06]), f([-.1, .06])]), mixCol(col, '#15121C', .45), { ...fo, flat: true }, 'phone');
    crPale(pl([f([0, .06]), f([.72, .06]), f([.72, .12]), f([0, .12])]), mixCol(col, '#B8CCE8', .55), fo, 'scr');
  } else if (act === 'read') {
    const a = [Math.cos(-.95 - lean), Math.sin(-.95 - lean)], n = [a[1], -a[0]], f = at(a, n);
    crPaint(pl([f([-.15, -.12]), f([1.2, -.12]), f([1.2, .05]), f([-.15, .05])]), mixCol(col, '#15121C', .3), { ...fo, flat: true }, 'cover');
    crPale(pl([f([-.05, .05]), f([1.1, .05]), f([.95, .3]), f([.05, .24])]), mixCol(col, '#D8D2C2', .38), fo, 'pages');
  }
  for (const [P, n] of arm) crPaint(pl(P), col, fo, n);
  if (o.rimK !== 0) crRim(parts.concat(arm), pl, col, u, { rim: TRAIN_RIM, rimK: o.rimK ?? .3, hole: o.hole });
  pop();
}

// ---------- the rush-hour carriage (C1a–C1c, C2a–C2c: chorus.js carriage() with crowd.commute) ----------
// One physically coherent carriage, the same people in the same places in every shot of a chorus. Looking across the aisle
// at the far side: bays of benches facing each other over the tables, the aisle's floor in front of them; the near
// side is cut away (the cutaway's camera stands in it), so nothing along the frame's bottom.
//   The seats ('seats'), every one taken. A bench seats two, the window seat and the aisle seat, one behind the other as
//     we look across: the window seat's commuter a step back (a fainter rim), the aisle seat's in front: hips on the
//     cushion, backs against the seat back, heads in front of the headrest, knees over the cushion's edge and feet on the
//     floor under the table's end (o.seat: the carriage's seat geometry, chorus.js CR_SEAT).
//     o.crewSeats [[bay, side]]: aisle seats a crew bot stands on (the window seat's commuter behind it); o.seatSkip: a
//     gag's own commuter's bench (theirs alone); o.seatAs['bay,side,win']: { act, lean, build } for one of them, or
//     { skip: true }: a window seat under a crew cleaner on the sill (its head would be over the cleaner). Varied builds,
//     faceless: dozing, resting their head on the headrest, on their phones, reading, or sat looking ahead.
//   The racks ('back'): bot passengers (asleep, sat, legs dangling over the edge) among the bags, clear of o.rackKeep
//     [[x0, x1]] (the ghost's story, the porters) and of the shell's own bag (o.rackBag(i): its [x0, x1]). The sills
//     are clear: the crew's cleaners have them.
//   The aisle ('front': after the cushions and the crew, in front of the whole far side; the narrators after them):
//     o.standers [[x, dy, side]]: commuters standing on the aisle's floor (feet at o.aisleY + dy: + nearer) only where no
//     crew is in front of the seats, each holding the ceiling strap straight above them (side: the arm up, -1 its left, 1
//     its right; 0 none: a phone at the chest, its back to us). o.rush [t0, t1] (song time): the roar-in: each pours in
//     from the nearer end of the carriage (o.split: where the two streams meet), flat out in profile on its own clock,
//     arrives between t0 and t1 and jostles into place; until it sets off it isn't aboard. Nobody moves on the beat.
// Quiet: the seated and the standers a step off the set's own values, a faint rim, no faces; the crew and the gags pop.
// the seated commuters' scale: the seats are the cast's (Tess sits in them in F4 and Z2), so the crowd sits at the cast's
// scale too, the heads at about the headrest's height (at 32.5 they came up to its middle, like children)
const CR_SIT_U = 39;
const COMMUTE_COL = { seat: '#46405A', win: '#48425C', stand: '#3E3950', strap: '#4E4862', rack: '#48425B', bags: ['#4C4456', '#3E4656', '#4E4440', '#443C50'] };
function trainCommute(layer, t, o) {
  const C = o.CR, i0 = o.i0 ?? -2, i1 = o.i1 ?? 2, lv = o.level, X = i => 960 + i * C.BW;
  const base = { t, eye: TRAIN_EYE, rim: TRAIN_RIM, rimK: .3, hole: o.hole || null, screen: '#6A7698' };
  if (layer === 'back') {
    const keep = o.rackKeep || [];
    for (let i = i0; i <= i1; i++) {
      if ((o.rackSkip || []).includes(i) || crOff(X(i) - C.BW / 2, 180, X(i) + C.BW / 2, 330)) continue;
      const bag = o.rackBag ? o.rackBag(i) : null;
      (o.rackSlots ? o.rackSlots(i) : [-205, 0, 205]).forEach((dx, j) => {
        const sd = 3000 + i * 17 + j * 7, x = X(i) + dx + (hash(sd) - .5) * 30;
        if (bag && x + 55 > bag[0] && x - 55 < bag[1]) return;   // (the shell's bag has this place)
        if (keep.some(([a, b]) => x + 70 > a && x - 70 < b)) return;
        if (hash(sd * 2.9) < .25) { trainBag(x, 246, sd, i + '_' + j); return; }   // (a bag in it)
        trainRackBot(x, dx, sd, hash(sd * 1.9) < (lv > 1 ? .4 : .2), { ...base, seed: sd, col: COMMUTE_COL.rack, happy: .3, key: 'crtr' + i + '_' + j });
      });
    }
    return;
  }
  if (layer === 'seats') {
    const has = (L, i, sd) => (L || []).some(([a, b]) => a === i && b === sd), acts = ['doze', 'phone', 'read', 'look', 'phone', 'doze', 'look', 'read'];
    for (const win of [1, 0]) for (let i = i0; i <= i1; i++) {   // (the window seats first: behind)
      if ((o.skip || []).includes(i) || crOff(X(i) - C.BW / 2, 400, X(i) + C.BW / 2, 900)) continue;
      for (const sd of [-1, 1]) {
        if (o.only && o.only !== sd) continue;   // (o.only: one side's benches, for the seats' model sheet)
        if (has(o.seatSkip, i, sd) || (!win && has(o.crewSeats, i, sd))) continue;
        const s = 7000 + i * 31 + sd * 7 + win * 3, h = k => hash(s * 1.37 + k * 2.71), as = (o.seatAs || {})[i + ',' + sd + ',' + win] || {};   // (o.seatAs['bay,side,win']: { act, lean, build } for one of them, or skip)
        if (as.skip) continue;
        crowdSit(X(i) + sd * 230, C.SY - (win ? 10 : 8), (o.uSit ?? CR_SIT_U) * lerp(.97, 1.03, h(2)), {
          knee: o.seat ? X(i) + sd * (o.seat.edge + (win ? 10 : 4)) : null, floor: C.FY,
          face: o.seatFace ? yy => o.seatFace(i, sd, yy) : null, maxTop: o.seat ? o.seat.top + o.seat.hr + 8 : null,
          t, seed: s, dir: -sd, act: as.act || crPick(h(3), acts), lean: as.lean, build: as.build, col: win ? COMMUTE_COL.win : COMMUTE_COL.seat, rimK: win ? .26 : .3, hole: o.hole || null, key: 'crse' + i + sd + win });
      }
    }
    return;
  }
  if (layer !== 'front') return;
  // the standers, far ones first
  const fy0 = o.aisleY ?? C.AISLE ?? 1004, split = o.split ?? 930, rush = o.rush;
  const at = (sx, seed, u) => {   // where one of them is at t: at its place (jostling a moment after it arrives), on its way in, or null
    if (!rush) return { x: sx, walk: null, dir: 0, jig: 0 };
    const a = lerp(rush[0], rush[1], hash(seed * 1.93 + .7)), dur = .4 + .3 * hash(seed * 3.1), s = a - dur, dir = sx < split ? 1 : -1;
    if (t < s) return null;
    const D = 1200 + 700 * hash(seed * 5.3), q = clamp((t - s) / dur), e = 1 - Math.pow(1 - q, 2.4);   // flat out, braking at the end
    if (q < 1) return { x: sx - dir * D * (1 - e), walk: (t - s) * 3.4 + hash(seed * 2.2), dir, jig: 0 };
    const j = t - a, k = Math.exp(-j * 6); return { x: sx + dir * .5 * u * k * Math.sin(j * 19), walk: null, dir, jig: .06 * k * Math.sin(j * 15 + seed) };
  };
  const S = (o.standers || []).map(([sx, dy, side]) => ({ sx, fy: fy0 + dy, side, seed: 5000 + Math.round(sx) * 3 })).sort((a, b) => a.fy - b.fy);
  for (const { sx, fy, side, seed } of S) {
    const u = 39 * lerp(.96, 1.04, hash(seed * 1.7)) * (1 + (fy - fy0) * .003), p = at(sx, seed, u), key = 'crst' + seed;
    if (!p || crOff(p.x - 5 * u, fy - 16 * u, p.x + 5 * u, fy)) continue;
    const fo = { ...base, seed, col: COMMUTE_COL.stand, key, t };
    if (p.walk != null) { crowdFig(p.x, fy, u, { ...fo, view: 'side', dir: p.dir, walk: p.walk, rot: .12 * p.dir, phone: 0 }); continue; }
    // (the strap hangs from the ceiling rail straight down to the hand; none across a next-stop board, on the pillars)
    const hx = p.x + side * (2.05 * crowdBuild(seed).broad - .2) * u, dBoard = Math.abs(((hx - 300) % C.BW + C.BW) % C.BW - C.BW / 2), reach = side !== 0 && dBoard > 80;
    crowdFig(p.x, fy, u, { ...fo, view: 'front', rot: p.jig, build: side ? { side } : undefined, reach, strap: reach ? { top: 40, col: COMMUTE_COL.strap } : null, phone: reach ? 0 : undefined, phoneBack: true });
  }
}
// a bag on the luggage rack (its bottom on the rack at y): a holdall, a backpack or a small case, in a muted colour
function trainBag(x, y, sd, key) {
  const k = hash(sd * 4.1), col = crPick(hash(sd * 5.3), COMMUTE_COL.bags), w = k < .45 ? 62 + 20 * hash(sd * 6.1) : k < .75 ? 26 : 44, h = k < .45 ? 30 : k < .75 ? 44 : 34;
  boilSeed('crbag ' + key);
  piece(crRect(x - w, y - h, x + w, y, k < .75 ? 12 : 6), col, { sw: 1.2, key: 'crbag' + key, lift: 3 });
  if (k < .45) dline([[x - w * .35, y - h], [x - w * .25, y - h - 10], [x + w * .25, y - h - 10], [x + w * .35, y - h]], 2.2, mixCol(col, '#15121C', .4), .4);   // (the holdall's handles)
  else if (k < .75) dline([[x - 9, y - h + 2], [x - 6, y - h - 8], [x + 6, y - h - 8], [x + 9, y - h + 2]], 2, mixCol(col, '#15121C', .4), .4);   // (the backpack's loop)
}

// ---------- model sheet: LOOPS.crowd (?look=card|xerox|bank|doodle|ink) ----------
if (typeof LOOPS !== 'undefined') LOOPS.crowd = t => {
  const LK = new URLSearchParams(location.search).get('look') || 'card';
  look(LK); const tt = mt(t);
  const bg = { card: '#8E8A84', ink: NOIR.pastSky, doodle: null, xerox: null, bank: null }[LK];
  if (LK === 'doodle') linedPaper(); else if (LK === 'bank') bankPaper(-60, -60, W + 120, H + 120); else if (LK === 'xerox') _paint(U([[-60, -60], [W + 60, -60], [W + 60, H + 60], [-60, H + 60]], 1), { wash: XEROX.paper, ink: null });
  else piece(U([[-60, -60], [W + 60, -60], [W + 60, H + 60], [-60, H + 60]], 1), bg, { ink: null, key: 'crbg', lift: 0 });
  const dark = LK === 'ink' ? NOIR.ink : '#23212A';
  crowdRows([{ x0: 60, x1: 1860, y: 300, u: 11, view: 'front' }, { x0: 40, x1: 1880, y: 420, u: 14, view: 'mix' }], { col: dark, bg: LK === 'card' ? bg : '#D8D4CC', t: tt, seed: 3 });
  // every head and top, front, and a queue in profile shuffling up, a walker
  for (let i = 0; i < 16; i++) crowdFig(90 + i * 115, 700, 18, { seed: 100 + i, build: { head: CR.heads[i % CR.heads.length], top: CR.tops[i % CR.tops.length], bag: CR.bags[(i * 3) % CR.bags.length] }, col: dark, t: tt, key: 'crm' + i });
  crowdQueue(1500, 1000, 20, { n: 7, gap: 3.8, dir: 1, steps: [1, 3.5, 6], t: tt, col: dark, seed: 7 });
  crowdFig(120 + (tt * 160) % 500, 1000, 20, { seed: 55, view: 'side', dir: 1, walk: tt * 1.1, col: dark, t: tt, build: { bag: 'case' } });
  crowdRow(380, 700, 1080, 22, { view: 'audience', n: 3, col: dark, t: tt, seed: 9 });
};
// ---------- model sheet: LOOPS.crbots, every bot kind in each pose (?look=...) ----------
if (typeof LOOPS !== 'undefined') LOOPS.crbots = t => {
  const LK = new URLSearchParams(location.search).get('look') || 'card';
  look(LK); const tt = mt(t);
  if (LK === 'xerox') _paint(U([[-60, -60], [W + 60, -60], [W + 60, H + 60], [-60, H + 60]], 1), { wash: XEROX.paper, ink: null });
  else piece(U([[-60, -60], [W + 60, -60], [W + 60, H + 60], [-60, H + 60]], 1), '#39333F', { ink: null, key: 'cbbg', lift: 0 });
  piece(U([[-60, 700], [W + 60, 700], [W + 60, 1100], [-60, 1100]], 1), '#2C3450', { ink: null, key: 'cbmoq', lift: 0 });
  const KS = new URLSearchParams(location.search).get('pets') ? ['codey', 'dewey', 'fireball', 'rocky', 'seedy', 'stacky', 'bsod', 'null', 'hoot', 'clawd'] : BOT_KINDS;   // (?pets=1: the Codex pets)
  KS.forEach((kind, i) => {
    const x = 110 + i * 190;
    crowdBot(x, 250, 24, { kind, pose: 'stand', dir: 1, front: .3, t: tt, seed: 10 + i, key: 'cbs' + i, grip: i % 3 === 0 ? [x + 60, 110] : null });
    crowdBot(x, 520, 24, { kind, pose: 'sit', dir: 1, front: .35, prop: ['cup', 'paper', 'tablet', null][i % 4], t: tt, seed: 20 + i, key: 'cbt' + i });
    crowdBot(x, 740, 24, { kind, pose: 'perch', dir: -1, front: .6, t: tt, seed: 30 + i, key: 'cbp' + i });
    crowdBot(x, 1000, 20, { kind, pose: 'lie', dir: i % 2 ? 1 : -1, t: tt, seed: 40 + i, key: 'cbl' + i });
  });
};

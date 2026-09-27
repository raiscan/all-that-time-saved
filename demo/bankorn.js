// bankorn.js: banknote ornament for the bank look (load after style.js). The user (2026-09-25): "anything made for the
// bank note style should be elaborate, just like a bank note's art can be." Everything a note's engraver draws round
// and into a vignette: acanthus leaves and scrolls (rinceaux), volutes, foliate capitals, fluted shafts, mouldings
// (dentils, beads, egg and dart, torus), balusters, blind tracery, diaper and coffers, microprint (lettering-like
// bands and rules, no real letters), cartouches and a full note frame.
// All of it draws in the caller's coordinates and only in the bank look (other looks: nothing). Fine detail lines are
// crisp geometry (style.js bankSwell/bankTris) in the layer's ink: on the ground the pale underprint tint,
// inside bankFigure() the deep ink. Pieces (a leaf with area, a baluster) go through piece(), so they take the layer's
// ruled tint and outline. w: line weight, local px (never below ~.35 px on screen).
// Specimen sheet: node render.mjs --page=video/studio.html --loop=bankorn --sheet=0 --cols=1 --w=1920 --os=2 --ss=4
const BNO = (() => {
  const on = () => STYLE.mode === 'bank';
  const px = () => bankPx();
  // the ornament's ink: the layer's (a background layer's paler), then the figure's or the ground's tint
  function ink(k = 1) {
    const b = bankStroke(1), c = bankInFig() ? bankFigCol(b.col) : bankInGround() ? bankGroundCol(b.col) : b.col;
    return k === 1 ? c : mixCol(BANK.paper, c, k);
  }
  // a batch of crisp lines: add polylines (constant or per-point widths), then draw them in one go (on the ground,
  // inside a figure's vignette, each line ends at it in a taper: style.js bankVigSwell)
  function batch() {
    const T = [], wmin = .34 / px(), id = P => P[0][0] * .017 + P[0][1] * .031;
    return {
      T,
      line(P, w, taper = 0) {
        if (P.length < 2) return;
        const W = Math.max(w, wmin), n = P.length - 1;
        bankVigSwell(T, P, P.map((_, i) => taper ? W * Math.min(1, (taper > 0 ? Math.min(i, n - i) : i) / Math.max(1, n * .3) + .15) : W), 0, id(P));
      },
      swell(P, ws) { if (P.length) bankVigSwell(T, P, ws.map(w => Math.max(w, 0)), wmin * .5, id(P)); },
      draw(k = 1) { bankTris(T, ink(k)); T.length = 0; },
    };
  }
  const ring = (cx, cy, rx, ry, n = 48, rot = 0) => { const P = oval(cx, cy, rx, ry, rot, n); return P.concat([P[0]]); };
  const bez = (a, b, c, d, n = 16) => { const P = []; for (let i = 0; i <= n; i++) { const u = i / n, v = 1 - u; P.push([v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1]]); } return P; };
  // an open Catmull-Rom curve through P, n samples per span
  const spline = (P, n = 6) => { const out = []; for (let i = 0; i < P.length - 1; i++) { const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)]; for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t; out.push([0, 1].map(d => .5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3))); } } out.push(P[P.length - 1]); return out; };
  const arc = (cx, cy, r, a0, a1, n = 16, ry = r) => { const P = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * ry]); } return P; };
  const nrm = (S, i) => { const q = S[Math.min(S.length - 1, i + 1)], r = S[Math.max(0, i - 1)], tx = q[0] - r[0], ty = q[1] - r[1], l = Math.hypot(tx, ty) || 1; return [-ty / l, tx / l]; };

  // ---- leaves and scrolls ----
  // A leaf along the spine S (a polyline from its foot to its tip): width w, n pointed lobes a side. Returns
  // { P (outline), L, R (its edges), tips: [[spine index, edge point], ...] }.
  function leafOf(S, w, n = 4, ph = 0) {
    const N = S.length - 1, L = [], R = [], tips = [];
    for (let i = 0; i <= N; i++) {
      const s = i / N, [nx, ny] = nrm(S, i), env = Math.pow(Math.sin(Math.PI * Math.min(1, s * 1.04 + .03)), .6) * (1 - .5 * s);
      const lb = a => { const q = Math.abs(Math.sin(s * n * Math.PI + a)); return .38 + .56 * Math.pow(q, .32) + .06 * Math.abs(Math.sin(s * n * 3 * Math.PI + a)); };   // deep notches, serrated lobes
      const wl = w * .5 * env * lb(ph), wr = w * .5 * env * lb(ph + .8);
      L.push([S[i][0] + nx * wl, S[i][1] + ny * wl]); R.push([S[i][0] - nx * wr, S[i][1] - ny * wr]);
    }
    for (let m = 0; m < n; m++) for (const [side, a] of [[L, ph], [R, ph + .8]]) { const s = clamp(((m + .5) * Math.PI - a) / (n * Math.PI), .08, .92), i = Math.round(s * N); tips.push([i, side[i]]); }
    return { P: L.concat(R.slice().reverse()), L, R, tips };
  }
  // A finger of acanthus: a pointed lens from b toward dir (unit), L long, curving by bend (± radians), with its vein.
  function finger(B, b, dx, dy, L, sw, bend = 0, fill = null) {
    const c = Math.cos(bend), sn = Math.sin(bend), ex = dx * c - dy * sn, ey = dx * sn + dy * c;
    const tip = [b[0] + (dx + ex) * .5 * L, b[1] + (dy + ey) * .5 * L], m = [b[0] + dx * L * .5, b[1] + dy * L * .5], w = L * .2;
    const nx = -dy, ny = dx, A = spline([b, [m[0] + nx * w, m[1] + ny * w], tip], 4), Bs = spline([b, [m[0] - nx * w * .8, m[1] - ny * w * .8], tip], 4);
    if (fill) fill.push(A.concat(Bs.slice().reverse()));
    B.line(A, sw); B.line(Bs, sw); B.line(spline([b, [m[0] + nx * w * .1, m[1] + ny * w * .1], [lerp(b[0], tip[0], .8), lerp(b[1], tip[1], .8)]], 3), sw * .5, 1);
  }
  // A lobe: a fan of n fingers springing from b, opening from the direction (ox, oy) (out from the stem) toward the
  // direction (tx, ty) (on along it), the middle finger longest; an eye (a small teardrop) where it meets the next.
  function lobe(B, b, ox, oy, tx, ty, L, sw, n = 3, fill = null, o_fan = [.72, 1.42]) {
    for (let k = 0; k < n; k++) {
      const u = n > 1 ? k / (n - 1) : .5, a = lerp(o_fan[0], o_fan[1], u), dx = ox * Math.cos(a) + tx * Math.sin(a), dy = oy * Math.cos(a) + ty * Math.sin(a), l = Math.hypot(dx, dy) || 1;
      finger(B, b, dx / l, dy / l, L * (.78 + .3 * Math.sin(u * Math.PI)), sw, (u - .5) * .35, fill);
    }
    B.line(ring(b[0] + ox * L * .08 + tx * L * .05, b[1] + oy * L * .08 + ty * L * .05, L * .045, L * .07, 8), sw * .6);
  }
  // An acanthus leaf rising from (x, y), h tall, its tip curling over and down toward dir (±1): a tapering midrib, lobes
  // of pointed fingers either side (smaller toward the top), and the turned-over tip hanging its own lobe. Lines only
  // (o.back: a paper-coloured body under it, so it covers what's behind).
  function acanthus(x, y, h, dir = 1, o = {}) {
    if (!on()) return;
    const lean = o.lean ?? 0, B = batch(), sw = (o.sw ?? .8) * .55, fill = [];
    const S = spline([[0, 0], [.02, -.42], [.08 + lean, -.8], [.26 + lean, -1.0], [.46 + lean, -.96], [.54 + lean, -.8]].map(([a, b]) => [x + dir * a * h, y + b * h]), 6);
    const N = S.length - 1, at = f => Math.round(f * N);
    B.swell(S.slice(0, at(.9)), S.slice(0, at(.9)).map((_, i) => h * .022 * (1 - i / N) + sw * .35));
    const nl = o.lobes ?? 4;
    for (let j = 0; j < nl; j++) for (const sd of [-1, 1]) {
      const f = .06 + j * (.56 / nl) + (sd > 0 ? .05 : 0), i = at(f), [nx, ny] = nrm(S, i), q = S[Math.min(N, i + 2)], t = [q[0] - S[i][0], q[1] - S[i][1]], tl = Math.hypot(...t) || 1;
      const b = [S[i][0] + nx * sd * h * .035, S[i][1] + ny * sd * h * .035];
      lobe(B, b, nx * sd, ny * sd, t[0] / tl, t[1] / tl, h * (.3 - j * .035), sw, j < 2 ? 4 : 3, fill);
    }
    // the tip: over the top and hanging, a lobe pointing down and forward
    const it = at(.86);
    lobe(B, S[it], dir * .7, .7, dir * .7, .7, h * .26, sw, 4, fill, [.3, 1.3]);
    B.line(S.slice(at(.6)), sw * .9);
    if (o.back) for (const P of fill) bankTris(P.flatMap((pt, i) => i ? [P[0][0], P[0][1], P[i - 1][0], P[i - 1][1], pt[0], pt[1]] : []).filter((_, k, A) => A.length), BANK.paper);
    B.draw(o.k ?? 1);
  }
  // A small leaf as lines only (for scrolls and sprays): along S, w wide.
  function leafLines(B, S, w, sw, n = 3) {
    const a = S[0], b = S[S.length - 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, tx = (b[0] - a[0]) / L, ty = (b[1] - a[1]) / L;
    B.line(S, sw * .8, -1);
    lobe(B, S[Math.floor(S.length * .3)], -ty, tx, tx, ty, L * .55, sw, n); lobe(B, S[Math.floor(S.length * .45)], ty, -tx, tx, ty, L * .5, sw, n);
    finger(B, S[Math.floor(S.length * .7)], tx, ty, L * .45, sw);
  }
  // A volute (spiral scroll) at (x, y), r its outer radius, turning dir (±1), starting at angle a0.
  function volute(B, x, y, r, dir = 1, a0 = -Math.PI / 2, sw = .6, turns = 1.6) {
    const P = [], Q = [];
    for (let i = 0; i <= 48; i++) { const u = i / 48, a = a0 + dir * u * turns * TAU, rr = r * (1 - .82 * u), r2 = rr * .78; P.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); if (u < .8) Q.push([x + Math.cos(a) * r2, y + Math.sin(a) * r2]); }
    B.line(P, sw); B.line(Q, sw * .6); B.line(ring(x, y, r * .15, r * .15, 10), sw * .7);
  }
  // A rinceau: an acanthus scroll from (x, y), s its size, curling dir (±1), rising (up = -1) or hanging (up = 1):
  // a stem spiralling in to a volute, leaves springing off it alternately.
  function rinceau(x, y, s, dir = 1, o = {}) {
    if (!on()) return;
    const up = o.up ?? -1, rot = o.rot ?? 0, B = batch(), sw = o.sw ?? .6, cs = Math.cos(rot), sn = Math.sin(rot);
    const T = ([a, b]) => [x + a * cs - b * sn, y + a * sn + b * cs];
    // the stem: a spiral from (x, y) about (x + dir·s, y), rising (or hanging) and curling round, closing in to an eye
    const stem = [];
    for (let i = 0; i <= 40; i++) { const u = i / 40, a = Math.PI + u * 1.3 * TAU, rr = s * (1 - .8 * u); stem.push(T([dir * (s + Math.cos(a) * rr), -up * Math.sin(a) * rr])); }
    B.swell(stem, stem.map((_, i) => s * .024 * (1 - i / 50) + sw * .35));
    const e = stem[40], C = T([dir * s, 0]); B.line(ring(e[0], e[1], s * .06, s * .06, 10), sw * .8);
    // leaves springing outward off the stem, each curling on along the stem's way
    for (let j = 0; j < (o.leaves ?? 5); j++) {
      const i = 2 + j * 6, p = stem[i], q = stem[i + 2]; if (!q) break;
      const ox = p[0] - C[0], oy = p[1] - C[1], ol = Math.hypot(ox, oy) || 1, tx = q[0] - p[0], ty = q[1] - p[1], tl = Math.hypot(tx, ty) || 1, L = s * (.8 - j * .1);
      const tip = [p[0] + ox / ol * L * .55 + tx / tl * L * .75, p[1] + oy / ol * L * .55 + ty / tl * L * .75];
      leafLines(B, spline([p, [p[0] + ox / ol * L * .45 + tx / tl * L * .15, p[1] + oy / ol * L * .45 + ty / tl * L * .15], [lerp(p[0], tip[0], .75) + ox / ol * L * .12, lerp(p[1], tip[1], .75) + oy / ol * L * .12], tip], 4), L * .42, sw * .8, 3);
    }
    B.draw(o.k ?? 1);
  }

  // ---- architecture ----
  // Fluting on a round shaft x0..x1 (its silhouette), y0..y1: n flutes seen round the cylinder (bunched toward the
  // edges), each a pair of fillet lines with a shadow line inside, rounded off at the ends.
  function flutes(x0, x1, y0, y1, n = 7, o = {}) {
    if (!on()) return;
    const B = batch(), sw = o.sw ?? .5, cx = (x0 + x1) / 2, r = (x1 - x0) / 2, lx = LIGHT.dir[0] * XF;
    const X = a => cx + Math.sin(a) * r * .94;
    if (o.paper !== false) bankTris([x0, y0, x1, y0, x1, y1, x0, y0, x1, y1, x0, y1], BANK.paper);   // (the flutes carry the shaft's tone)
    for (let i = 0; i < n; i++) {
      const a0 = -Math.PI / 2 + (i + .12) / n * Math.PI, a1 = -Math.PI / 2 + (i + .88) / n * Math.PI, xa = X(a0), xb = X(a1), fw = xb - xa;
      if (fw < .6 / px()) continue;
      const cap = fw * .5;
      B.line([[xa, y0 + cap], [xa, y1 - cap]], sw * .8); B.line([[xb, y0 + cap], [xb, y1 - cap]], sw * .8);
      B.line(arc((xa + xb) / 2, y0 + cap, fw / 2, Math.PI, TAU, 8), sw * .7); B.line(arc((xa + xb) / 2, y1 - cap, fw / 2, 0, Math.PI, 8), sw * .7);
      // the flute's shadow: on the side toward the light (it's a groove), heavier toward the shaft's shadow edge
      const sh = lx < 0 ? xa + fw * .28 : xb - fw * .28, k = .5 + .5 * Math.max(0, -Math.sin((a0 + a1) / 2) * Math.sign(lx || -1));
      B.line([[sh, y0 + cap * 1.4], [sh, y1 - cap * 1.4]], sw * (.45 + .6 * k));
    }
    B.draw(o.k ?? 1);
  }
  // A torus moulding round a shaft: an elliptical band (seen a little from below/above), lines and a shadow.
  function torus(x0, x1, y, h, o = {}) {
    if (!on()) return;
    const B = batch(), sw = o.sw ?? .55, cx = (x0 + x1) / 2, r = (x1 - x0) / 2, e = h * .35;
    B.line(arc(cx, y - h / 2, r, 0, Math.PI, 20, e), sw); B.line(arc(cx, y + h / 2, r, 0, Math.PI, 20, e), sw);
    B.line(arc(cx, y + h * .15, r * .98, .15, Math.PI - .15, 18, e), sw * .6);
    B.draw(o.k ?? 1);
  }
  // A foliate capital on a bell from (x0..x1 at y1, the neck) up to the abacus (y0): acanthus leaves in two rows, volutes
  // at the corners, the abacus mouldings.
  function capital(x0, x1, y0, y1, o = {}) {
    if (!on()) return;
    const cx = (x0 + x1) / 2, w = x1 - x0, h = y1 - y0, key = o.key || 'cap' + Math.round(cx);
    for (const [dx, d, hh, k2] of [[-.36, -1, .75, 'a'], [.36, 1, .75, 'b'], [0, 1, .92, 'c']]) acanthus(cx + dx * w * .7, y1, h * hh, d, { w: w * .34, key: key + k2, sw: o.sw ?? .7, lobes: 3, col: o.col });
    const B = batch(), sw = (o.sw ?? .7) * .6;
    for (const d of [-1, 1]) volute(B, cx + d * w * .44, y0 + h * .22, h * .16, -d, -Math.PI / 2, sw);
    B.line([[x0 - w * .06, y0], [x1 + w * .06, y0]], sw * 1.2); B.line([[x0 - w * .02, y0 + h * .08], [x1 + w * .02, y0 + h * .08]], sw * .7);
    B.line([[x0 + w * .1, y1], [x1 - w * .1, y1]], sw); B.line([[x0 + w * .12, y1 + h * .06], [x1 - w * .12, y1 + h * .06]], sw * .6);
    B.draw(o.k ?? 1);
  }
  // Moulding bands along a straight run x0..x1 at y (h tall): dentils, beads, egg and dart.
  function dentils(x0, x1, y, h, o = {}) {
    if (!on()) return;
    const B = batch(), sw = o.sw ?? .5, g = o.gap ?? h * .9;
    B.line([[x0, y], [x1, y]], sw); B.line([[x0, y + h], [x1, y + h]], sw * .8);
    for (let x = x0 + g * .3; x + g * .6 < x1; x += g) { B.line([[x, y], [x, y + h], [x + g * .6, y + h], [x + g * .6, y]], sw * .7); B.line([[x + g * .6 - g * .12, y + h * .15], [x + g * .6 - g * .12, y + h * .9]], sw * .5); }
    B.draw(o.k ?? 1);
  }
  function beads(x0, x1, y, r, o = {}) {
    if (!on()) return;
    const B = batch(), sw = o.sw ?? .45, g = r * 2.6;
    for (let x = x0 + r; x < x1 - r; x += g) { B.line(ring(x, y, r, r * .8, 12), sw); B.line([[x + r * 1.2, y - r * .5], [x + r * 1.2, y + r * .5]], sw * .8); }
    B.draw(o.k ?? 1);
  }
  function eggDart(x0, x1, y, h, o = {}) {
    if (!on()) return;
    const B = batch(), sw = o.sw ?? .5, g = h * 1.1;
    B.line([[x0, y - h * .55], [x1, y - h * .55]], sw * .8); B.line([[x0, y + h * .6], [x1, y + h * .6]], sw * .8);
    for (let x = x0 + g * .5; x < x1 - g * .4; x += g) {
      B.line(arc(x, y, g * .36, Math.PI, TAU, 10, h * .5).concat(arc(x, y, g * .36, 0, Math.PI, 10, h * .5)), sw);
      B.line(arc(x, y + h * .05, g * .24, Math.PI * 1.1, Math.PI * 1.9, 8, h * .3), sw * .6);
      B.line([[x + g * .5, y - h * .45], [x + g * .5, y + h * .4]], sw * .7); B.line([[x + g * .44, y + h * .1], [x + g * .5, y + h * .45], [x + g * .56, y + h * .1]], sw * .6);
    }
    B.draw(o.k ?? 1);
  }
  // Along a curve P: beads every g (radius r), and joints (ticks from P to its offset by d, every gj: voussoirs).
  function beadsAlong(P, r, o = {}) {
    if (!on()) return;
    const B = batch(), sw = o.sw ?? .45, g = o.g ?? r * 2.7; let acc = g / 2;
    for (let i = 0; i + 1 < P.length; i++) { const a = P[i], b = P[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]); while (acc < L) { const u = acc / L, x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u); B.line(ring(x, y, r, r, 10), sw); acc += g; } acc -= L; }
    B.draw(o.k ?? 1);
  }
  function joints(P, d, gj, o = {}) {
    if (!on()) return;
    const B = batch(), sw = o.sw ?? .45; let acc = gj / 2;
    for (let i = 0; i + 1 < P.length; i++) { const a = P[i], b = P[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = -(b[1] - a[1]) / (L || 1), ny = (b[0] - a[0]) / (L || 1); while (acc < L) { const u = acc / L, x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u); B.line([[x, y], [x + nx * d, y + ny * d]], sw); acc += gj; } acc -= L; }
    B.draw(o.k ?? 1);
  }
  // A balustrade: rail (yT..yT + th), balusters, plinth (to yB); n balusters between x0 and x1. The balusters and
  // rails are pieces (tint + outline); the vase's turnings are lines.
  function balustrade(x0, x1, yT, yB, n, o = {}) {
    if (!on()) return;
    const th = o.rail ?? (yB - yT) * .14, ph = o.plinth ?? (yB - yT) * .14, col = o.col || '#C8C4B6', key = o.key || 'bal' + Math.round(x0);
    const h = yB - yT - th - ph, bw = o.bw ?? Math.min((x1 - x0) / n * .7, h * .32), B = batch(), sw = o.sw ?? .5;
    // the vase: a turned profile (half-width by height, 0 = its foot)
    const prof = [[.5, 0], [.5, .06], [.36, .08], [.3, .12], [.42, .2], [.5, .32], [.46, .44], [.3, .54], [.16, .62], [.2, .7], [.14, .78], [.3, .84], [.34, .9], [.5, .92], [.5, 1]];
    for (let i = 0; i < n; i++) {
      const x = lerp(x0, x1, (i + .5) / n), yb = yB - ph;
      const L = prof.map(([a, b]) => [x - a * bw, yb - b * h]), R = prof.map(([a, b]) => [x + a * bw, yb - b * h]).reverse();
      piece(L.concat(R), col, { sw: o.psw ?? .7, key: key + i, lift: 0 });
      for (const b of [.08, .2, .62, .84]) { const a = prof.find(p => p[1] >= b) || prof[0]; B.line(arc(x, yb - b * h, a[0] * bw, .2, Math.PI - .2, 8, bw * .12), sw * .6); }
    }
    piece([[x0 - bw * .5, yT], [x1 + bw * .5, yT], [x1 + bw * .5, yT + th], [x0 - bw * .5, yT + th]], col, { sw: o.psw ?? .8, key: key + 'rail', lift: 0 });
    piece([[x0 - bw * .5, yB - ph], [x1 + bw * .5, yB - ph], [x1 + bw * .5, yB], [x0 - bw * .5, yB]], col, { sw: o.psw ?? .8, key: key + 'plinth', lift: 0 });
    B.line([[x0 - bw * .5, yT + th * .35], [x1 + bw * .5, yT + th * .35]], sw * .6); B.line([[x0 - bw * .5, yB - ph * .6], [x1 + bw * .5, yB - ph * .6]], sw * .6);
    B.draw(o.k ?? 1);
  }
  // Blind tracery in a pointed niche: two lancets under a quatrefoil in a roundel, cusped, moulded (double lines).
  // (cx, sy) the springing line's middle, hw its half-width, rise the apex's height above it, y1 the panels' foot.
  function tracery(cx, sy, hw, rise, y1, o = {}) {
    if (!on()) return;
    const B = batch(), sw = o.sw ?? .6, g = hw * .08;
    const ls = sy + rise * .25, lr = rise * .55;   // the lancets' springing and rise
    for (const d of [-1, 1]) {
      const x = cx + d * hw * .48, w = hw * .4, A = bkArch(x, ls, w, lr, 10);
      B.line(A.concat([[x + w, y1], [x - w, y1], A[0]]), sw);
      const A2 = bkArch(x, ls, w - g, lr - g * 1.5, 10); B.line(A2.concat([[x + w - g, y1 - g], [x - w + g, y1 - g], A2[0]]), sw * .6);
      // a trefoil in its head
      const hy = ls - lr * .45, r = Math.min(w * .32, lr * .2);
      for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + k / 3 * TAU; B.line(ring(x + Math.cos(a) * r * .75, hy + Math.sin(a) * r * .75, r * .55, r * .55, 14), sw * .55); }
      // panels below: a transom and a cusped foot
      B.line([[x - w + g, lerp(sy, y1, .55)], [x + w - g, lerp(sy, y1, .55)]], sw * .6);
    }
    const ry = sy - rise * .62, R = Math.min(hw * .32, rise * .25);
    B.line(ring(cx, ry, R, R, 40), sw); B.line(ring(cx, ry, R - g, R - g, 40), sw * .6);
    for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + Math.PI / 4; B.line(ring(cx + Math.cos(a) * R * .38, ry + Math.sin(a) * R * .38, R * .36, R * .36, 16), sw * .6); }
    B.line(ring(cx, ry, R * .12, R * .12, 10), sw * .6);
    B.draw(o.k ?? 1);
  }
  // A diaper: a diamond lattice of fine lines across P, a small quatrefoil at each crossing (g the cell size).
  function diaper(P, g, o = {}) {
    if (!on()) return;
    const B = batch(), sw = o.sw ?? .4;
    for (const a of [45, -45]) bankRule(P, g * .707, a, 0, 1, g, pts => B.line(pts, sw));
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; for (const [x, y] of P) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    for (let j = Math.floor(y0 / g); j * g < y1; j++) for (let i = Math.floor(x0 / g); i * g < x1; i++) {
      const x = (i + .5) * g, y = (j + .5) * g; if (!inPoly(x, y, P)) continue;
      for (let k = 0; k < 4; k++) { const a = k / 4 * TAU; B.line(ring(x + Math.cos(a) * g * .09, y + Math.sin(a) * g * .09, g * .08, g * .08, 8), sw * .7); }
    }
    B.draw(o.k ?? 1);
  }
  // Coffers: a grid of recessed square panels in x0..x1 × y0..y1 (nx × ny), each stepped twice with a rosette.
  function coffers(x0, y0, x1, y1, nx, ny, o = {}) {
    if (!on()) return;
    const B = batch(), sw = o.sw ?? .5, cw = (x1 - x0) / nx, ch = (y1 - y0) / ny;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const a = x0 + i * cw, b = y0 + j * ch, m = Math.min(cw, ch);
      for (const [k, ww] of [[.08, 1], [.2, .7], [.3, .5]]) B.line([[a + cw * k, b + ch * k], [a + cw * (1 - k), b + ch * k], [a + cw * (1 - k), b + ch * (1 - k)], [a + cw * k, b + ch * (1 - k)], [a + cw * k, b + ch * k]], sw * ww);
      for (const [p, q] of [[[a + cw * .08, b + ch * .08], [a + cw * .3, b + ch * .3]], [[a + cw * .92, b + ch * .08], [a + cw * .7, b + ch * .3]]]) B.line([p, q], sw * .5);
      const rx = a + cw / 2, ry = b + ch / 2;
      for (let k = 0; k < 8; k++) { const q = k / 8 * TAU; B.line([[rx + Math.cos(q) * m * .04, ry + Math.sin(q) * m * .04], [rx + Math.cos(q + .2) * m * .13, ry + Math.sin(q + .2) * m * .13], [rx + Math.cos(q + .39) * m * .04, ry + Math.sin(q + .39) * m * .04]], sw * .5); }
      // the recess's shadow: the top and the side away from the light, hatched
      for (let t = .1; t < .28; t += .045) B.line([[a + cw * t, b + ch * .1], [a + cw * t, b + ch * .9 - (t - .1) * ch]], sw * .35);
    }
    B.draw(o.k ?? 1);
  }

  // ---- microprint and the note's furniture ----
  // A band of lettering-like microprint between two rules along x0..x1 at y (h tall): tiny marks in word-like runs,
  // no real letters.
  function microBand(x0, x1, y, h, o = {}) {
    if (!on()) return;
    const B = batch(), sw = o.sw ?? h * .09, g = h * .42, rows = o.rows ?? 1, seed = o.seed ?? 3;
    B.line([[x0, y - h * .5], [x1, y - h * .5]], sw * 1.1); B.line([[x0, y + h * .5], [x1, y + h * .5]], sw * 1.1);
    for (let r = 0; r < rows; r++) {
      const yc = y + (r - (rows - 1) / 2) * h * .8 / rows, gh = h * .52 / rows;
      let x = x0 + g, n = 0;
      while (x < x1 - g) {
        const hs = hash(n * 7.31 + r * 13.7 + seed), top = yc - gh / 2, bot = yc + gh / 2, mid = yc;
        if (hs < .1) { x += g * 1.1; n++; continue; }   // a word space
        const kind = Math.floor(hash(n * 3.17 + seed + r) * 6);
        if (kind === 0) B.line([[x, top], [x, bot]], sw);
        else if (kind === 1) B.line(arc(x + g * .3, mid, g * .32, Math.PI * .6, Math.PI * 1.4 + TAU * 0, 6, gh * .5), sw);
        else if (kind === 2) B.line(ring(x + g * .28, mid + gh * .12, g * .28, gh * .36, 8), sw);
        else if (kind === 3) B.line([[x, bot], [x + g * .3, top], [x + g * .6, bot]], sw);
        else if (kind === 4) { B.line([[x, top], [x, bot]], sw); B.line(arc(x + g * .02, mid - gh * .2, g * .3, -Math.PI / 2, Math.PI / 2, 6, gh * .3), sw); }
        else B.line([[x, mid], [x + g * .5, mid], [x + g * .5, bot]], sw);
        x += g * (kind === 0 ? .45 : .85); n++;
      }
    }
    B.draw(o.k ?? 1);
  }
  // A microprint rule: a line of tiny repeated marks (a dash, two dots), along P.
  function microRule(P, h, o = {}) {
    if (!on()) return;
    const B = batch(), sw = o.sw ?? h * .22, g = h * 1.6; let acc = 0;
    for (let i = 0; i + 1 < P.length; i++) {
      const a = P[i], b = P[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / (L || 1), uy = (b[1] - a[1]) / (L || 1), nx = -uy, ny = ux;
      for (let s = (g - acc) % g; s < L; s += g) {
        const x = a[0] + ux * s, y = a[1] + uy * s;
        B.line([[x - ux * g * .3, y - uy * g * .3], [x + ux * g * .05, y + uy * g * .05]], sw);
        for (const d of [-1, 1]) { const px2 = x + ux * g * .3 + nx * d * h * .22, py2 = y + uy * g * .3 + ny * d * h * .22; B.line([[px2 - ux * sw * .5, py2 - uy * sw * .5], [px2 + ux * sw * .5, py2 + uy * sw * .5]], sw); }
      }
      acc = (acc + L) % g;
    }
    B.draw(o.k ?? 1);
  }
  // A cartouche: an oval frame (w × h) with a guilloche band in it, C-scrolls either side, acanthus sprays above and
  // below, a small rosette at its heart (o.fill: false leaves the middle empty for something else).
  function cartouche(x, y, w, h, o = {}) {
    if (!on()) return;
    const rx = w / 2, ry = h / 2, B = batch(), sw = o.sw ?? .6;
    _paint(oval(x, y, rx * 1.02, ry * 1.02, 0, 48), { wash: BANK.paper, washOp: 255, ink: null });
    guilloche(x, y, Math.min(rx, ry) * .74, Math.min(rx, ry) * .97, { n: o.n ?? 8, lobes: o.lobes ?? 24, w: .45, rx: rx / Math.min(rx, ry), ry: ry / Math.min(rx, ry), col: ink(.7), steps: 300 });
    B.line(ring(x, y, rx, ry, 64), sw * 1.5); B.line(ring(x, y, rx * .72, ry * .72, 56), sw);
    B.line(ring(x, y, rx * 1.07, ry * 1.07, 64), sw * .5);
    if (o.fill !== false) guilloche(x, y, Math.min(rx, ry) * .08, Math.min(rx, ry) * .6, { n: 8, lobes: 7, w: .4, twist: .6, beat: 4, rx: rx / Math.min(rx, ry), ry: ry / Math.min(rx, ry), col: ink(.8), steps: 220 });
    for (const d of [-1, 1]) { volute(B, x + d * rx * 1.12, y - ry * .35, ry * .3, d, Math.PI / 2, sw); volute(B, x + d * rx * 1.12, y + ry * .35, ry * .3, -d, -Math.PI / 2, sw); B.line([[x + d * rx * 1.02, y - ry * .06], [x + d * rx * 1.3, y], [x + d * rx * 1.02, y + ry * .06]], sw); }
    for (const d of [-1, 1]) for (const s of [-1, 1]) { const S = bez([x, y + s * ry * 1.08], [x + d * rx * .2, y + s * ry * 1.3], [x + d * rx * .55, y + s * ry * 1.25], [x + d * rx * .8, y + s * ry * 1.05], 12); leafLines(B, S, ry * .22, sw * .7, 3); }
    B.draw(o.k ?? 1);
  }
  // A full note frame (screen space, or any box): a printed border `depth` deep on its own paper, the picture inside it
  // the note's vignette (the user, 2026-09-26: bigger, its inner edge about 8/10 of the way up to the subtitle box's top:
  // 94 px at 1080p; at 48 its fine lines sat over the picture's edge): a heavy outer rule; a guilloche band all round in
  // two inks (top and bottom gold, the sides green) between fine doubles; microprint along its inner edge; a fine rule
  // round the vignette; corner cartouches with rosettes (o.scrolls: acanthus scrolls curling in from each corner; at this
  // depth they spilled into the picture as stray rings, so they're off).
  function noteFrame(x0, y0, x1, y1, o = {}) {
    if (!on()) return;
    const D = o.depth ?? 94, m = D * .5, gh = D * .46, cr = D * .74, gold = o.gold || mixCol(BANK.ink, '#A8843A', .5), green = o.green || mixCol(BANK.ink, '#52806A', .5), B = batch();
    // the border's paper, from the edge to the vignette
    const R4 = (a, b, c, d) => [[a, b], [c, b], [c, d], [a, d]];
    for (const P of [R4(x0 - 2, y0 - 2, x1 + 2, y0 + D), R4(x0 - 2, y1 - D, x1 + 2, y1 + 2), R4(x0 - 2, y0 + D, x0 + D, y1 - D), R4(x1 - D, y0 + D, x1 + 2, y1 - D)]) _paint(P, { wash: BANK.paper, washOp: 255, ink: null });
    // the guilloche band round the frame
    const wl = D * .55;
    for (const y of [y0 + m, y1 - m]) guillocheBand(x0 + m + cr, x1 - m - cr, y, gh, { n: 8, wl, col: gold, w: .7 });
    for (const x of [x0 + m, x1 - m]) { const P = []; for (let y = y0 + m + cr; y <= y1 - m - cr; y += 5) P.push([x, y]); for (let i = 0; i < 8; i++) { const Q = P.map(([px2, py2]) => [x + gh / 2 * Math.sin(py2 / wl * TAU + i / 8 * TAU), py2]); for (let j = 0; j < Q.length - 1; j += 24) _inkLine(Q.slice(j, j + 25), .7, green, 'rotring', .3); } }
    // rules: a heavy outer, fine doubles each side of the band, and the vignette's edge
    for (const [e, w] of [[6, 2.2], [11, .5], [m - gh / 2 - 4, .5], [m + gh / 2 + 4, .9], [m + gh / 2 + 8, .4], [D, .7]]) B.line([[x0 + e, y0 + e], [x1 - e, y0 + e], [x1 - e, y1 - e], [x0 + e, y1 - e], [x0 + e, y0 + e]], w);
    B.draw();
    // microprint along the band's inner edge, all round
    if (o.micro !== false) {
      const yi = (m + gh / 2 + 8 + D) / 2;
      microBand(x0 + m + cr + 30, x1 - m - cr - 30, y0 + yi, 9, { seed: 7 }); microBand(x0 + m + cr + 30, x1 - m - cr - 30, y1 - yi, 9, { seed: 11 });
    }
    // corners: a cartouche-rosette on the band, acanthus scrolls curling in along both edges
    const rs = D * .42;
    for (const [cx, cy, dx, dy] of [[x0 + m, y0 + m, 1, 1], [x1 - m, y0 + m, -1, 1], [x1 - m, y1 - m, -1, -1], [x0 + m, y1 - m, 1, -1]]) {
      _paint(oval(cx, cy, cr, cr, 0, 40), { wash: BANK.paper, washOp: 255, ink: null });
      guilloche(cx, cy, cr * .45, cr * .95, { n: 12, lobes: 16, w: .6, col: gold });
      guilloche(cx, cy, cr * .1, cr * .42, { n: 8, lobes: 7, w: .5, twist: .7, beat: 4, col: green });
      const Bc = batch(); Bc.line(ring(cx, cy, cr, cr, 56), 1.4); Bc.line(ring(cx, cy, cr * 1.06, cr * 1.06, 56), .5); Bc.line(ring(cx, cy, cr * .44, cr * .44, 40), .7); Bc.draw();
      if (o.scrolls) { rinceau(cx + dx * (cr + 8), cy + dy * (gh / 2 + 10), rs, dx, { up: dy > 0 ? 1 : -1, leaves: 3, sw: .6 }); rinceau(cx + dx * (gh / 2 + 10), cy + dy * (cr + 8), rs, dx, { up: dy > 0 ? 1 : -1, leaves: 3, sw: .6, rot: dx * dy * Math.PI / 2 }); }
    }
  }
  return { ink, batch, spline, finger, lobe, beadsAlong, joints, acanthus, leafLines, volute, rinceau, flutes, torus, capital, dentils, beads, eggDart, balustrade, tracery, diaper, coffers, microBand, microRule, cartouche, noteFrame, bez, arc, ring };
})();

// the specimen sheet (every ornament, at a note's scale, in the bank look; most of it is ground)
LOOPS.bankorn = t => {
  look('bank');
  bankPaper(-60, -60, W + 120, H + 120);
  camBegin(960, 540, 1);
  BNO.noteFrame(0, 0, W, H);
  BNO.acanthus(200, 330, 150, 1, { key: 'sa1' }); BNO.acanthus(330, 330, 150, -1, { key: 'sa2' });
  BNO.capital(430, 560, 190, 280, { key: 'scap' });
  piece([[440, 290], [550, 290], [550, 620], [440, 620]], '#D4D0C4', { sw: 1, key: 'sshaft' }); BNO.flutes(440, 550, 292, 618, 7); BNO.torus(430, 560, 630, 18);
  BNO.rinceau(700, 300, 90, 1, { up: -1 }); BNO.rinceau(900, 300, 90, -1, { up: 1 });
  BNO.cartouche(1250, 260, 260, 160);
  BNO.dentils(620, 1080, 440, 16); BNO.beads(620, 1080, 480, 5); BNO.eggDart(620, 1080, 520, 20);
  BNO.microBand(620, 1080, 570, 10, { rows: 2 }); BNO.microRule([[620, 610], [1080, 610]], 6);
  BNO.balustrade(1150, 1700, 450, 640, 9);
  BNO.tracery(350, 820, 150, 170, 1000);
  BNO.diaper(curvy([[620, 700], [1080, 700], [1080, 1000], [620, 1000]], 2), 44);
  BNO.coffers(1150, 700, 1700, 990, 4, 2);
  camEnd();
};
LOOPS.bankorn.len = 1;

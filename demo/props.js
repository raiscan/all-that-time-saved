// props.js: props shared across shots.

// A bill: a sheet of paper with a red band or header, a red clock stamp and lines of "text" (squiggles, never letters).
// (x, y) centre, s = width px, rot, crumple 0..1 (1 = a paper ball), flap -1..1 (the sheet bending as it flies).
function bill(x, y, s, rot = 0, crumple = 0, flap = 0, key = 'bill') {
  push(); translate(x, y); rotate(rot);
  const sw = clamp(s / 90, .6, 2.2), h = s * 1.3;
  if (crumple > .6) {   // a paper ball: a lumpy cream shape with fold lines
    const r = s * lerp(.45, .28, (crumple - .6) / .4), P = [];
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; P.push([Math.cos(a) * r * (1 + .18 * (hash(i + 3) - .5)), Math.sin(a) * r * (1 + .18 * (hash(i + 9) - .5))]); }
    piece(curvy(P, 3), NOIR.cream, { sw, shade: '#B8AE9C', depth: r * .35, key: key + 'ball', lift: 4 });
    for (let i = 0; i < 5; i++) { const a = hash(i + 20) * TAU, b = a + 1 + hash(i + 30); dline([[Math.cos(a) * r * .8, Math.sin(a) * r * .8], [Math.cos((a + b) / 2) * r * .2, Math.sin((a + b) / 2) * r * .2], [Math.cos(b) * r * .75, Math.sin(b) * r * .75]], sw * .5, '#9A907E', .3); }
    dline([[-r * .3, -r * .2], [r * .1, r * .1]], sw * .6, NOIR.red, .3);
    pop(); return;
  }
  const k = crumple / .6, w = s / 2, b = flap * s * .12;
  const P = [[-w, -h / 2], [0, -h / 2 + b * .5], [w, -h / 2], [w + b * .3, 0], [w, h / 2], [0, h / 2 - b * .5], [-w, h / 2], [-w - b * .3, 0]].map(([px, py], i) => [px * (1 - .3 * k) + (hash(i + 40) - .5) * s * .25 * k, py * (1 - .3 * k) + (hash(i + 50) - .5) * s * .25 * k]);
  // (in the bank look the bill is engraved like a note, as the shot's subject: a bank figure)
  const bk = STYLE.mode === 'bank';
  // (mixed, the film's: the banquet's bill, the hero that flies from the vault to her table and becomes the plane, is a
  // restaurant receipt; the piles and streams of bills are household utility bills, each one different)
  // (and the finale's bill, the one she folds into the plane and throws back, is the AI services bill: agentic credits)
  const bstyle = BILL_STYLE === 'mixed' ? (BILL_AI.test(key) ? 'ai' : BILL_HERO.test(key) ? 'receipt' : 'utility') : BILL_STYLE;
  if (k < .7) { const nd = () => billNew(bstyle, s, h, flap, key, bk); if (bk) bankFigure(nd); else nd(); pop(); return; }
  // (crumpling on toward a paper ball: just the sheet)
  const draw = () => piece(P, NOIR.cream, { sw, shade: '#C9BFAE', depth: s * .12, key: key + 'sheet', lift: 5 });
  if (bk) bankFigure(draw); else draw();
  pop();
}
// The designs (receipt, utility, ai): redesigns so it reads as a bill at a glance (the first design, a sheet with a red
// band and seal, read as a certificate). Same footprint (s wide, 1.3 s tall), so every shot, the slot, the slap and the
// plane fold still fit. No words (the film's rule): items are squiggles, prices are digit-like ticks, the £ is the tell.
let BILL_STYLE = 'mixed';   // (the user: both in the film: receipts and utility final demands; billAs draws one design)
// draw a bill in a given design (for the design sheet)
function billAs(style, x, y, s, rot, key) { const b0 = BILL_STYLE; BILL_STYLE = style; try { bill(x, y, s, rot, 0, 0, key); } finally { BILL_STYLE = b0; } }
function billNew(style, s, h, flap, key, bk) {
  const sw = clamp(s / 90, .6, 2.2), INK = '#3A342C', GREY = '#8A8272', RED = NOIR.red, b = flap * s * .12;
  const inRed = fn => bk ? bankLayer({ ink: '#8E2A22', colour: 1, sat: 1 }, fn) : fn();   // (in the bank look the red is its own ink)
  const bend = ([x, y], W2) => [x, y + (y < 0 ? 1 : -1) * b * .5 * (1 - (x / W2) ** 2)];
  // a price: digit-like ticks, right-aligned at x (n digits, two pence after a point); bold for the total
  const price = (x, y, n, bold) => {
    const d = s * (bold ? .026 : .019), hgt = s * (bold ? .05 : .034), w = sw * (bold ? .9 : .5), col = bold ? INK : GREY;
    let cx = x;
    // right to left: two pence digits (i 0, 1), the point (i 2), then n pound digits
    for (let i = 0; i <= n + 2; i++) {
      if (i === 2) { piece(oval(cx - d * .3, y + hgt * .45, w * .9, w * .9, 0, 8), col, { ink: null, key: key + 'pt' + Math.round(x / s * 1000) + '_' + Math.round(y / s * 1000), lift: 0, flatCard: true, edge: false }); cx -= d * .7; continue; }
      const j = hash(i * 3.1 + (y / s) * 70 + (x / s) * 10);   // (seeded in the bill's own units: a bill that scales keeps its prices)
      dline(j < .3 ? [[cx - d * .55, y - hgt * .45], [cx, y - hgt * .5], [cx - d * .1, y + hgt * .5]] : j < .6 ? [[cx - d * .4, y - hgt * .5], [cx - d * .4, y + hgt * .5]] : [[cx - d * .6, y - hgt * .3], [cx - d * .2, y - hgt * .5], [cx - d * .1, y], [cx - d * .6, y + hgt * .5], [cx, y + hgt * .5]], w, col, j < .6 ? 0 : .5);
      cx -= d;
    }
    return cx;
  };
  const pound = (x, y, z, col, w) => {   // a £, as strokes
    dline([[x + z * .34, y - z * .38], [x + z * .16, y - z * .5], [x - z * .08, y - z * .44], [x - z * .14, y - z * .2], [x - z * .12, y + z * .18], [x - z * .26, y + z * .46]], w, col, .5);
    dline([[x - z * .26, y + z * .46], [x + z * .1, y + z * .38], [x + z * .38, y + z * .46]], w, col, .5);
    dline([[x - z * .34, y - z * .02], [x + z * .16, y - z * .02]], w * .8, col, 0);
  };
  const squig = (x0, x1, y, w, col) => { const P = []; for (let i = 0; i <= 8; i++) { const f = i / 8; P.push([lerp(x0, x1, f), y + Math.sin(f * 13 + x0) * s * .006]); } dline(P, w, col, .5); };
  // the due stamp (the chorus's red clock at five to nine), as a rubber stamp's imperfect impression, askew
  const dueStamp = (x, y, r) => inRed(() => {
    push(); translate(x, y); rotate(-.28);
    for (let i = 0; i < 18; i++) { if (hash(i * 5.3 + 2) < .12) continue; const a0 = i / 18 * TAU, a1 = (i + .95) / 18 * TAU, P = []; for (let k = 0; k <= 4; k++) { const a = lerp(a0, a1, k / 4); P.push([Math.cos(a) * r, Math.sin(a) * r]); } dline(P, sw * 2, RED, .5); }
    for (let i = 0; i < 18; i++) { if (hash(i * 4.1 + 9) < .3) continue; const a0 = i / 18 * TAU, a1 = (i + .9) / 18 * TAU, P = []; for (let k = 0; k <= 4; k++) { const a = lerp(a0, a1, k / 4); P.push([Math.cos(a) * r * .88, Math.sin(a) * r * .88]); } dline(P, sw * .7, RED, .5); }
    for (let i = 0; i < 12; i++) { if (hash(i * 2.1 + 7) < .25) continue; const a = i / 12 * TAU; dline([[Math.cos(a) * r * .72, Math.sin(a) * r * .72], [Math.cos(a) * r * .84, Math.sin(a) * r * .84]], sw * .8, RED, 0); }
    dline([[0, 0], [Math.cos(-Math.PI / 2 + 8.92 / 12 * TAU) * r * .38, Math.sin(-Math.PI / 2 + 8.92 / 12 * TAU) * r * .38]], sw * 1.3, RED, 0);
    dline([[0, 0], [Math.cos(-Math.PI / 2 + 55 / 60 * TAU) * r * .6, Math.sin(-Math.PI / 2 + 55 / 60 * TAU) * r * .6]], sw * .9, RED, 0);
    pop();
  });
  if (style === 'receipt') {
    // a restaurant bill off the till: a narrow strip, torn zigzag top and bottom; the house's crest (a cloche); the
    // items with dotted leaders to their prices; a double rule; the total, its £ and its price bold, underlined twice in
    // red; the red due stamp across it
    const W2 = s * .36, H2 = h / 2, n = 10, P = [];
    for (let i = 0; i <= n; i++) P.push([lerp(-W2, W2, i / n), -H2 + (i % 2 ? s * .025 : 0)]);
    for (let i = n; i >= 0; i--) P.push([lerp(-W2, W2, i / n), H2 - (i % 2 ? s * .025 : 0)]);
    piece(P.map(q => bend(q, W2)), '#F6F2E6', { sw: sw * .8, shade: '#CFC6B4', depth: s * .1, key: key + 'rc', lift: 5 });
    const cy = -H2 + s * .16;   // the cloche
    piece([[-s * .08, cy + s * .03], [s * .08, cy + s * .03], [s * .08, cy + s * .045], [-s * .08, cy + s * .045]], INK, { ink: null, key: key + 'clb', lift: 0, flatCard: true, edge: false });
    dline([[-s * .065, cy + s * .03], [-s * .06, cy - s * .01], [-s * .03, cy - s * .04], [0, cy - s * .048], [s * .03, cy - s * .04], [s * .06, cy - s * .01], [s * .065, cy + s * .03]], sw * .9, INK, .5);
    piece(oval(0, cy - s * .057, s * .01, s * .01, 0, 10), INK, { ink: null, key: key + 'clk', lift: 0, flatCard: true, edge: false });
    for (let i = 0; i < 9; i++) dline([[-W2 * .8 + i * W2 * .2, cy + s * .08], [-W2 * .8 + i * W2 * .2 + W2 * .1, cy + s * .08]], sw * .5, GREY, 0);   // a dashed rule
    const items = 7;
    for (let i = 0; i < items; i++) {
      const y = cy + s * .14 + i * s * .075, L = W2 * (.55 + .45 * hash(i * 7.7 + 1));
      squig(-W2 * .8, -W2 * .8 + L * .7, y, sw * .5, GREY);
      const px = price(W2 * .82, y, 1 + Math.floor(hash(i * 3.3) * 2), false);
      for (let dx = -W2 * .8 + L * .7 + s * .02; dx < px - s * .015; dx += s * .022) piece(oval(dx, y + s * .012, sw * .35, sw * .35, 0, 6), GREY, { ink: null, key: key + 'ld' + i + '_' + Math.round(dx), lift: 0, flatCard: true, edge: false });
    }
    const ry = cy + s * .14 + items * s * .075 - s * .02;
    dline([[-W2 * .85, ry], [W2 * .85, ry]], sw * .6, INK, 0); dline([[-W2 * .85, ry + s * .012], [W2 * .85, ry + s * .012]], sw * .6, INK, 0);
    const ty = ry + s * .07;
    squig(-W2 * .8, -W2 * .35, ty, sw * .9, INK);
    const px = price(W2 * .82, ty, 3, true); pound(px - s * .03, ty, s * .075, INK, sw * 1.1);
    inRed(() => { for (const dy of [s * .045, s * .062]) dline([[px - s * .07, ty + dy], [W2 * .84, ty + dy]], sw * .8, RED, 0); });
    if (bk && typeof guillocheBand === 'function') guillocheBand(-W2 * .8, W2 * .8, cy + s * .105, s * .018, { n: 4, wl: s * .05, w: .45 });   // (engraved: a band under the crest)
    dueStamp(-W2 * .3, ty + s * .02, s * .12);
    for (let i = 0; i < 3; i++) squig(-W2 * .5, W2 * .5, ty + s * .13 + i * s * .03, sw * .35, GREY);   // the small print
    return;
  }
  // 'utility': household bills, a family: the same letter layout (the supplier's mark, the address, the big boxed amount
  // due with its £, the account table, a perforated payment slip) with each one's own supplier and details:
  //   electric (a lightning bolt, amber), gas (a flame, blue), internet (wifi arcs, violet), water (a drop, teal),
  //   council tax (a town hall, slate), phone (a handset, rose)
  // The mark moves corner, the box moves side, the table and slip vary, the due stamp changes (the clock ring, a
  // double ring, a boxed clock with a bar), all picked from the bill's key: a pile of bills is all different, and the
  // hero bill (the one that flies from the vault to her table and becomes the plane), drawn as a utility bill, is electric.
  if (style === 'ai') {
    // the AI services bill (agentic credits): a clean, modern statement. A dark header band with the sparkle (the AI mark)
    // and a small companion; a usage chart climbing steeply (the credits it spent on your behalf); line items, each a
    // little bot head × a count of runs, with prices; an auto top-up row (circling arrows); a bold total; a pixel code
    // for the slip; the red due stamp. No words.
    const W2 = s / 2, H2 = h / 2, B = AIBILL;
    const inBand = fn => bk ? bankLayer({ ink: B.band, colour: 1, sat: 1 }, fn) : fn();
    piece([[-W2, -H2], [W2, -H2], [W2, H2], [-W2, H2]].map(q => bend(q, W2)), '#F4F4F0', { sw: sw * .8, shade: '#CFCBC0', depth: s * .1, key: key + 'ai', lift: 5 });
    inBand(() => {
      piece([[-W2 * .96, -H2 + s * .03], [W2 * .96, -H2 + s * .03], [W2 * .96, -H2 + s * .2], [-W2 * .96, -H2 + s * .2]], B.band, { ink: null, key: key + 'aib', lift: 0, flatCard: true, edge: false });
      aiSparkle(-W2 * .72, -H2 + s * .115, s * .058, B.spark, key + 'ais'); aiSparkle(-W2 * .52, -H2 + s * .075, s * .024, B.spark, key + 'ais2');
      for (let i = 0; i < 2; i++) squig(-W2 * .38, -W2 * (.0 - .12 * i), -H2 + s * .095 + i * s * .04, sw * .6, '#C8C4D8');
    });
    // the usage chart: a steep climb (the credits), its area tinted, the last point a red dot
    const cx0 = -W2 * .82, cx1 = W2 * .82, cy1 = -H2 + s * .52, cy0 = -H2 + s * .27, pts = [];
    for (let i = 0; i <= 12; i++) { const f = i / 12; pts.push([lerp(cx0, cx1, f), cy1 - (cy1 - cy0) * (Math.pow(f, 2.6) * .92 + .04 * Math.sin(i * 1.7))]); }
    inBand(() => {
      piece(pts.concat([[cx1, cy1], [cx0, cy1]]), mixCol(B.line, '#F4F4F0', .78), { ink: null, key: key + 'aia', lift: 0, flatCard: true, edge: false });
      dline(pts, sw * 1.1, B.line, .3);
    });
    dline([[cx0, cy1], [cx1, cy1]], sw * .5, GREY, 0); dline([[cx0, cy0 - s * .02], [cx0, cy1]], sw * .5, GREY, 0);
    inRed(() => piece(oval(pts[12][0], pts[12][1], s * .012, s * .012, 0, 10), RED, { ink: null, key: key + 'aid', lift: 0, flatCard: true, edge: false }));
    // the line items: a bot head × a count of runs … price
    for (let i = 0; i < 5; i++) {
      const y = cy1 + s * .07 + i * s * .05, hx = -W2 * .78, hs = s * .016;
      piece([[hx - hs, y - hs], [hx + hs, y - hs], [hx + hs, y + hs], [hx - hs, y + hs]], INK, { ink: null, key: key + 'aih' + i, lift: 0, flatCard: true, edge: false });
      for (const ex of [-.45, .45]) piece(oval(hx + ex * hs, y - hs * .1, hs * .22, hs * .22, 0, 6), '#F4F4F0', { ink: null, key: key + 'aie' + i + ex, lift: 0, flatCard: true, edge: false });
      dline([[hx, y - hs], [hx, y - hs * 1.6]], sw * .5, INK, 0);
      dline([[hx + s * .03, y - s * .008], [hx + s * .045, y + s * .008]], sw * .6, GREY, 0); dline([[hx + s * .045, y - s * .008], [hx + s * .03, y + s * .008]], sw * .6, GREY, 0);   // ×
      price(hx + s * .13, y, 1 + (i % 3), false);
      squig(hx + s * .16, -W2 * .02, y, sw * .4, GREY);
      price(W2 * .82, y, 2 + (i % 2), false);
    }
    // auto top-up: circling arrows, then its price
    const ty0 = cy1 + s * .07 + 5 * s * .05, ax = -W2 * .78, ar = s * .018;
    inBand(() => { const A = []; for (let i = 0; i <= 10; i++) { const a = -.3 + i / 10 * 5.2; A.push([ax + Math.cos(a) * ar, ty0 + Math.sin(a) * ar]); } dline(A, sw * .8, B.line, .5); piece([[ax + ar * 1.3, ty0 - ar * .1], [ax + ar * .7, ty0 - ar * .1], [ax + ar, ty0 + ar * .5]], B.line, { ink: null, key: key + 'aiar', lift: 0, flatCard: true, edge: false }); });
    squig(-W2 * .6, -W2 * .05, ty0, sw * .4, GREY); price(W2 * .82, ty0, 3, false);
    // the total, bold, double rule above
    const ry = ty0 + s * .045;
    dline([[-W2 * .85, ry], [W2 * .85, ry]], sw * .6, INK, 0); dline([[-W2 * .85, ry + s * .012], [W2 * .85, ry + s * .012]], sw * .6, INK, 0);
    const toty = ry + s * .065, tpx = price(W2 * .82, toty, 4, true); pound(tpx - s * .035, toty, s * .085, INK, sw * 1.3);
    // the slip: a pixel code (a small square grid, seeded)
    const qx = -W2 * .78, qy = H2 - s * .2, qs = s * .012;
    for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) { const edge = (i < 3 && j < 3) || (i > 5 && j < 3) || (i < 3 && j > 5); if (edge ? (i % 2 === 1 && j % 2 === 1 && !(i === 1 && j === 1)) : hash(i * 9.1 + j * 3.7 + 11) < .5) continue; piece([[qx + i * qs, qy + j * qs], [qx + (i + 1) * qs, qy + j * qs], [qx + (i + 1) * qs, qy + (j + 1) * qs], [qx + i * qs, qy + (j + 1) * qs]], INK, { ink: null, key: key + 'aiq' + i + '_' + j, lift: 0, flatCard: true, edge: false }); }
    for (let i = 0; i < 3; i++) squig(-W2 * .35, W2 * .5, qy + s * .02 + i * s * .03, sw * .4, GREY);
    dueStamp(-W2 * .45, toty - s * .005, s * .12);   // (left of the total, so the £ reads)
    return;
  }
  if (style === 'utility') { utilityBill(s, h, key, { sw, INK, GREY, RED, bend, inRed, price, pound, squig, dueStamp }); return; }
  // 'demand' (the first single design; ?bill=demand)
  utilityBill(s, h, key, { sw, INK, GREY, RED, bend, inRed, price, pound, squig, dueStamp }, 0, true);
}
const UTILITY = [
  { name: 'electric', col: '#D8962A' }, { name: 'gas', col: '#3A6AB8' }, { name: 'internet', col: '#7A4AA8' }, { name: 'water', col: '#2A8A8A' },
  { name: 'council', col: '#4A5A6A' }, { name: 'phone', col: '#C0506A' },
];
const BILL_HERO = /^(bkbill|cbill|tbill|z2p|z2b|bill)/;
const BILL_AI = /^(bill$|z2b|z2fold|z2p|tbill)/;   // the finale's bill: Z1's, caught and folded in Z2, back on the table in Z3
const AIBILL = { band: '#26243A', spark: '#E8C25A', line: '#6A5AC8' };
// the AI's mark: a four-pointed sparkle at (x, y), radius r
function aiSparkle(x, y, r, col, key) {
  const P = []; for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + i * Math.PI / 4, rr = i % 2 ? r * .28 : r; P.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
  piece(curvy(P, 2), col, { ink: null, key, lift: 0, flatCard: true, edge: false });
}
function utilityBill(s, h, key, T, forceV, plain) {
  const { sw, INK, GREY, RED, bend, inRed, price, pound, squig, dueStamp } = T, W2 = s / 2, H2 = h / 2;
  const kh = keyHash(key), v = forceV ?? (BILL_HERO.test(key) ? 0 : kh % UTILITY.length), U0 = UTILITY[v], r = i => hash(kh * .013 + i * 7.31);
  const ACC = plain ? RED : U0.col, bk = STYLE.mode === 'bank';
  const inAcc = fn => bk ? bankLayer({ ink: mixCol(ACC, '#000000', .35), colour: 1, sat: 1 }, fn) : fn();
  piece([[-W2, -H2], [W2, -H2], [W2, H2], [-W2, H2]].map(q => bend(q, W2)), '#F6F2E6', { sw: sw * .8, shade: '#CFC6B4', depth: s * .1, key: key + 'dm', lift: 5 });
  // a thin band of the supplier's colour along the top (varies: full width, or a short tab)
  const tab = r(1) < .5;
  inAcc(() => piece([[tab ? W2 * .2 : -W2 * .92, -H2 + s * .03], [W2 * .92, -H2 + s * .03], [W2 * .92, -H2 + s * .045], [tab ? W2 * .2 : -W2 * .92, -H2 + s * .045]], ACC, { ink: null, key: key + 'band', lift: 0, flatCard: true, edge: false }));
  // the supplier's mark: its icon in a roundel, top right or top left
  const left = r(2) < .35, mx = left ? -W2 * .66 : W2 * .64, my = -H2 + s * .15, mr = s * .065;
  inAcc(() => {
    piece(oval(mx, my, mr, mr, 0, 22), ACC, { ink: null, key: key + 'mk', lift: 0, flatCard: true, edge: false });
    const P = c => c.map(([a, b]) => [mx + a * mr, my + b * mr]), C = '#F6F2E6';
    if (plain) piece(P([[-.55, .05], [0, -.55], [.55, .05], [.4, .05], [.4, .5], [-.4, .5], [-.4, .05]]), C, { ink: null, key: key + 'ic', lift: 0, flatCard: true, edge: false });
    else if (U0.name === 'electric') piece(P([[.15, -.7], [-.4, .1], [-.02, .1], [-.2, .7], [.42, -.15], [.04, -.15], [.25, -.7]]), C, { ink: null, key: key + 'ic', lift: 0, flatCard: true, edge: false });
    else if (U0.name === 'gas') piece(curvy(P([[0, -.7], [.35, -.15], [.45, .3], [.2, .62], [-.2, .62], [-.45, .3], [-.3, -.1], [-.1, .1]]), 3), C, { ink: null, key: key + 'ic', lift: 0, flatCard: true, edge: false });
    else if (U0.name === 'internet') { for (const [rr, w] of [[.62, .16], [.4, .15], [.18, .14]]) { const A = []; for (let i = 0; i <= 10; i++) { const a = -Math.PI * .8 + i / 10 * Math.PI * .6; A.push([mx + Math.cos(a) * rr * mr, my + .3 * mr + Math.sin(a) * rr * mr]); } dline(A, w * mr, C, .5); } piece(oval(mx, my + .3 * mr, .09 * mr, .09 * mr, 0, 10), C, { ink: null, key: key + 'icd', lift: 0, flatCard: true, edge: false }); }
    else if (U0.name === 'council') { piece(P([[-.6, -.2], [0, -.62], [.6, -.2]]), C, { ink: null, key: key + 'ic', lift: 0, flatCard: true, edge: false }); for (const cx of [-.4, -.13, .13, .4]) piece(P([[cx - .07, -.12], [cx + .07, -.12], [cx + .07, .38], [cx - .07, .38]]), C, { ink: null, key: key + 'icc' + cx, lift: 0, flatCard: true, edge: false }); piece(P([[-.62, .42], [.62, .42], [.62, .55], [-.62, .55]]), C, { ink: null, key: key + 'icb', lift: 0, flatCard: true, edge: false }); }
    else if (U0.name === 'phone') piece(curvy(P([[-.5, -.45], [-.28, -.62], [-.12, -.32], [-.25, -.15], [.1, .25], [.25, .12], [.55, .3], [.4, .55], [.1, .5], [-.35, .05], [-.55, -.2]]), 2), C, { ink: null, key: key + 'ic', lift: 0, flatCard: true, edge: false });
    else piece(curvy(P([[0, -.65], [.38, .05], [.42, .32], [.2, .58], [-.2, .58], [-.42, .32], [-.38, .05]]), 3), C, { ink: null, key: key + 'ic', lift: 0, flatCard: true, edge: false });
  });
  // the address, on the other side from the mark
  const ax = left ? W2 * .05 : -W2 * .8;
  for (let i = 0; i < 3; i++) squig(ax, ax + W2 * (.6 - .15 * r(10 + i)), -H2 + s * .11 + i * s * .042, sw * .55, INK);
  // the amount due, boxed (big), right or left
  const boxR = r(3) < .7, bw = W2 * (.95 + .1 * r(4)), bx0 = boxR ? W2 * .88 - bw : -W2 * .88, bx1 = bx0 + bw, by0 = -H2 + s * (.28 + .03 * r(5)), by1 = by0 + s * .22;
  inAcc(() => piece([[bx0, by0], [bx1, by0], [bx1, by1], [bx0, by1]], mixCol(ACC, '#F6F2E6', .85), { sw: sw * 1.6, ink: ACC, key: key + 'box', lift: 0, flatCard: true }));
  const px = price(bx1 - s * .05, (by0 + by1) / 2, 2 + Math.floor(r(6) * 2), true); inAcc(() => pound(px - s * .04, (by0 + by1) / 2, s * .1, ACC, sw * 1.5));
  const tx = boxR ? -W2 * .8 : W2 * .12;
  squig(tx, tx + W2 * .5, by0 + s * .05, sw * .8, INK); squig(tx, tx + W2 * .38, by0 + s * .12, sw * .5, GREY);
  // the account table (3–5 rows); some bills add a little usage bar chart instead of the last rows
  const rows = 3 + Math.floor(r(7) * 3), chart = !plain && r(8) < .45;
  for (let i = 0; i < (chart ? 2 : rows); i++) { const y = by1 + s * .07 + i * s * .048; squig(-W2 * .8, -W2 * .1, y, sw * .45, GREY); price(W2 * .82, y, 1 + (i % 2), false); }
  if (chart) inAcc(() => { for (let i = 0; i < 6; i++) { const bh = s * (.03 + .09 * r(20 + i)) * (i === 5 ? 1.4 : 1), x = -W2 * .75 + i * s * .07, y = by1 + s * .3; piece([[x, y], [x + s * .045, y], [x + s * .045, y - bh], [x, y - bh]], i === 5 ? ACC : mixCol(ACC, '#F6F2E6', .55), { ink: null, key: key + 'ch' + i, lift: 0, flatCard: true, edge: false }); } });
  // the payment slip: a perforated fold line with scissors, then a barcode (or a row of reference ticks)
  const py = H2 - s * (.27 + .04 * r(9));
  for (let x = -W2 + s * .04; x < W2 - s * .02; x += s * .03) dline([[x, py], [x + s * .015, py]], sw * .5, GREY, 0);
  piece(oval(-W2 + s * .02, py - s * .012, s * .008, s * .008, 0, 8), GREY, { ink: null, key: key + 'sc1', lift: 0, flatCard: true, edge: false });
  piece(oval(-W2 + s * .02, py + s * .012, s * .008, s * .008, 0, 8), GREY, { ink: null, key: key + 'sc2', lift: 0, flatCard: true, edge: false });
  if (r(11) < .6) for (let i = 0; i < 34; i++) { const x = -W2 * .8 + i * W2 * .045, bw2 = sw * (hash(i * 1.9 + v) < .4 ? 1.4 : .6); dline([[x, py + s * .07], [x, py + s * .15]], bw2, INK, 0); }
  else for (let i = 0; i < 3; i++) squig(-W2 * .8, -W2 * .1, py + s * .08 + i * s * .035, sw * .5, INK);
  price(W2 * .82, py + s * .21, 3, true);
  // the due stamp: always the red clock (the chorus's mark), its frame and angle varying
  const sx = (boxR ? -1 : 1) * W2 * (.35 + .15 * r(12)), sy = by1 + s * (.08 + .1 * r(13)), sk = Math.floor(r(14) * 3);
  dueStamp(sx, sy, s * (.12 + .02 * r(15)));
  if (sk === 1) inRed(() => { push(); translate(sx, sy); rotate(-.28); const R2 = s * .165; for (let i = 0; i < 24; i++) { if (hash(i * 3.3 + kh) < .2) continue; const a0 = i / 24 * TAU, a1 = (i + .8) / 24 * TAU; dline([[Math.cos(a0) * R2, Math.sin(a0) * R2], [Math.cos(a1) * R2, Math.sin(a1) * R2]], sw * 1.2, RED, 0); } pop(); });   // a double ring
  if (sk === 2) inRed(() => { push(); translate(sx, sy); rotate(-.2); const b2 = s * .17; for (const [a, b3] of [[[-b2, -b2], [b2, -b2]], [[b2, -b2], [b2, b2 * .9]], [[b2, b2 * .9], [-b2, b2 * .9]], [[-b2, b2 * .9], [-b2, -b2]]]) if (hash(a[0] + kh) > .15) dline([a, b3], sw * 1.6, RED, 0); dline([[-b2 * .8, b2 * .7], [b2 * .8, b2 * .7]], sw * 2.2, RED, 0); pop(); });   // a boxed clock with a bar
}

// A phone, held: drawn around (0, 0) in hand space, screen facing the holder. glow: 0..1 screen light; alert: 0..1 red.
function phone(s, glowK = 1, alert = 0) {
  const sw = clamp(s / 30, .6, 2);
  piece(curvy(U([[-.15, -.7], [1.05, -.7], [1.05, 1.1], [-.15, 1.1]], s), 2), '#2A2632', { sw, key: 'phone', lift: 3 });
  piece(curvy(U([[-.03, -.58], [.93, -.58], [.93, .98], [-.03, .98]], s), 2), mixCol('#9FE8E0', NOIR.red, alert), { ink: null, key: 'phonescreen', lift: 0, flatCard: true });
  if (alert > .05) { piece(oval(.45 * s, .1 * s, .26 * s, .2 * s, 0, 16), NOIR.cream, { sw: sw * .5, key: 'phonebill', lift: 0, flatCard: true }); dline([[.3 * s, .05 * s], [.6 * s, .05 * s]], sw * .5, NOIR.red); }
}

// A champagne flute, held: drawn around (0, 0) in hand space. The rotate(-PI/2) below lays the bowl along the hand's -x
// axis (musk() and zuck() rely on exactly this and counter-rotate to hold it upright; change it and fix them too).
// fill 0..1, clink 0..1 (a sparkle at the rim on impact). s ≈ the hand size.
function flute(s, fill = .7, clink = 0, key = 'flute') {
  const sw = clamp(s / 30, .5, 1.8);
  push(); rotate(-Math.PI / 2);
  piece(curvy(U([[-.08, .1], [.08, .1], [.06, 1.2], [.35, 1.3], [.35, 1.38], [-.35, 1.38], [-.35, 1.3], [-.06, 1.2]], s), 2), '#DCE6E6', { sw, key: key + 'stem', lift: 2, flatCard: true });
  const bowl = curvy(U([[-.32, -1.6], [.32, -1.6], [.26, -.4], [0, .1], [-.26, -.4]], s), 4);
  piece(bowl, '#DCE6E6', { sw, op: 180, key: key + 'bowl', lift: 2, flatCard: true });
  if (fill > .02) piece(curvy(U([[-.28 + .02, -1.6 + 1.5 * (1 - fill)], [.28 - .02, -1.6 + 1.5 * (1 - fill)], [.24, -.45], [0, 0], [-.24, -.45]], s), 3), NOIR.pastGold, { ink: null, key: key + 'wine', lift: 0, flatCard: true });
  for (let i = 0; i < 3; i++) { const by = -.3 - frac(T * .8 + i / 3) * 1.1 * fill; piece(oval(((i - 1) * .1) * s, by * s, .03 * s, .03 * s, 0, 6), NOIR.cream, { ink: null, key: key + 'b' + i, lift: 0, flatCard: true }); }
  if (clink > .02) { glow(0, -1.65 * s, 1.4 * s * clink, NOIR.lamp, clink); emote('spark', 0, -1.9 * s, s * .35 * clink, clink, T); }
  pop();
}

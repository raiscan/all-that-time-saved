// cover.js: the album cover for "All That Time Saved" by UncleHerbert, drawn in the film's own engine: 4:3, at 1920×1440
// (video/cover.html sets PROJECT.size before core.js sizes the frame), written at 3840×2880 (--os=2). Every design is a
// still loop drawn with the film's rigs, sets and looks, and has a version with its lettering (LOOPS.<name>_title):
//   worlds   the five worlds: five panels, the film's media in its story's order (rubber hose, card, banknote, riso, her
//            doodle), the seams printed like a note's border; the two of them walking out of the bad future into her
//            drawing, the eager crew trailing after them through the worlds (the ad's butler; Clawd with the Gemini twins
//            on its back, Copilot disguised as her, Jolly, Codey). The title a word to a world, each in its medium's letters.
//   promise  the promise and what they wanted (O1's ending): on the train's woodgrain table the phone on its kickstand
//            playing the 1930s ad, grey, beside her notebook open at their Friday, her hand on the page, her biro. The
//            title on a strip of cut card lying on the table.
//   note     the banknote: an engraved note, Tess and Rowan in its portrait ovals, the bosses' bunker in the vignette, the
//            bill's red clock stamp (five to nine) across it. Cinzel capitals in the house teal, the artist on a banderole.
//   torn     the torn poster: her riso copy of the ad on the box room's wall, ripped open by her hands to the Friday under
//            it. The lettering is the ad's own headline, in its period letters, printed riso.
//   train    the bots' train: the chorus's night train, its cheerful crew at every job, the two of them at the pole, deadpan
//            to us, her Muse Charm in her hand. The title a card advertising panel above the windows.
// The lettering is drawn on the compositor after the frame (like the subtitles and the credits' title card: crisp at any
// output size), under the paper grain, and typeset in the design's medium (src/karaoke.js's per-look lettering).
//   node render.mjs --page=video/cover.html --loop=note_title --stills=0 --os=2 --ss=3 --out=out/cover/raw/note_title
// (--ss=3, not the film's 4: at 4:3 the drawing at 4× (7680×5760) is larger than Chrome will give a WebGL canvas, and it
// comes out scrambled; 3× (5760×4320) is the most it takes)
// The page's other formats (?fmt=, cover.html; so far only worlds is laid out for them), each drawn at 5760 px on its
// long side:
//   node render.mjs --page=video/cover.html --query=fmt=1x1 --loop=worlds_title --stills=0 --os=1.5625 --ss=3 ...   3000×3000
//   node render.mjs --page=video/cover.html --query=fmt=9x16 --loop=worlds_title --stills=0 --os=1 --ss=3 ...        1080×1920
//   (--os=2: 2160×3840 from the same drawing)
//   node render.mjs --page=video/cover.html --query=fmt=16x9 --loop=worlds_title --stills=0 --os=2 --ss=3 ...        3840×2160
//   node render.mjs --page=video/cover.html --query=fmt=banner --loop=worlds_title --stills=0 --os=1.5 --ss=3 ...    2880×960 (the README banner)
//   (YouTube's: the title card, and its thumbnail, 1280×720 JPEG under 2 MB, downscaled from this with Lanczos)
const COVER = { first: 'worlds', title: 'All That Time Saved', artist: 'UncleHerbert', designs: [], fmt: window.COVER_FMT || '4x3' };
(() => {
  // ---------- the frame's lettering, for the compositor ----------
  // A design with lettering sets CT for its frame: { t (the frame's T), fn(c) (draws it, in 1920×1440 units) }.
  let CT = null;
  { const _dl = drawLetters; drawLetters = function (c) { _dl(c); if (c === outX && CT && CT.t === T) { c.save(); CT.fn(c); c.restore(); } }; }
  // A design: LOOPS[name] (the art) and LOOPS[name + '_title'] (the art and its lettering). art(t, titled) draws the
  // frame (titled: the lettering version, which may clear a place for the words); text(c) letters it. fmts: the page
  // formats it's laid out for (the others don't offer it).
  function design(name, art, text, fmts = ['4x3']) {
    if (!fmts.includes(COVER.fmt)) return;
    COVER.designs.push(name);
    LOOPS[name] = t => { CT = null; art(t, false); }; LOOPS[name].len = 1;
    LOOPS[name + '_title'] = t => { CT = null; art(t, true); CT = { t: T, fn: c => text(c, t) }; }; LOOPS[name + '_title'].len = 1;
  }
  const R4 = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const MC = document.createElement('canvas').getContext('2d');
  const widthOf = (txt, font) => { MC.font = font; return MC.measureText(txt).width; };
  const capOf = font => { MC.font = font; return MC.measureText('H').actualBoundingBoxAscent; };
  // a font sized so txt sets to width w: { font, size, cap }
  function fitFont(txt, w, wt, fam) {
    const size = 100 * w / widthOf(txt, `${wt} 100px ${fam}`), font = `${wt} ${size.toFixed(1)}px ${fam}`;
    return { font, size, cap: capOf(font) };
  }
  // Run fn with the global clock at tf (the rigs read T for blinks and idle life): a still, frozen into print.
  function atT(tf, fn) { const T0 = T; T = tf; try { fn(); } finally { T = T0; } }
  // Draw a picture the film draws as a whole 1920×1080 frame (LOOPS.friday, the ad): its own cameras centred on that
  // frame (core.js's camBegin centres on this page's taller one), in the current coordinates. The caller places and clips it.
  function film1080(fn) {
    const cb = camBegin, cam = CAM, last = LAST_CAM;
    camBegin = function (cx = 960, cy = 540, zoom = 1, rot = 0) { push(); translate(960, 540); rotate(rot); scale(zoom); translate(-cx, -cy); CAM = LAST_CAM = { cx, cy, zoom, rot }; };
    try { fn(); } finally { camBegin = cb; CAM = cam; LAST_CAM = last; }
  }

  // =====================================================================================================================
  // NOTE: the banknote (demo/sets/banknote.js, the film's note, laid out for 4:3). The note in note px, its centre at the
  // frame's; the bunker's world seen through the central vignette (K world px = 1 note px); Tess (left, 3/4, facing in)
  // and Rowan (right, flipped, facing in) in the portrait ovals where Musk and Zuckerberg sit on the film's note; the
  // bill's red clock stamp across the vignette. Everything is print: the rigs frozen, deep-engraved as the figure, the
  // ornament the ground.
  // =====================================================================================================================
  const NT = (() => {
    const NW = 1800, NH = 1320, NX0 = -NW / 2, NX1 = NW / 2, NY0 = -NH / 2, NY1 = NH / 2;
    const WIN = { x0: -30, x1: 1950, y0: -22, y1: 1098 };
    const VW = 600, K = (WIN.x1 - WIN.x0) / VW, VH = (WIN.y1 - WIN.y0) / K, VCX = 0, VCY = 0;
    const VX0 = VCX - VW / 2, VX1 = VCX + VW / 2, VY0 = VCY - VH / 2, VY1 = VCY + VH / 2;
    const OX = WIN.x0 - VX0 * K, OY = WIN.y0 - VY0 * K;
    const PORT = { L: { cx: -606, cy: 12, rx: 208, ry: 316 }, R: { cx: 606, cy: 12, rx: 208, ry: 316 } };
    const TITLE = { cy: NY0 + 150, hw: 470, hh: 60 };   // the cartouche where the bank's name would be (half-width, half-height)
    const BAND = { cy: NY1 - 150, hw: 360, hh: 46 };    // the banderole below the vignette (the artist)
    return { NW, NH, NX0, NX1, NY0, NY1, WIN, VW, K, VH, VCX, VCY, VX0, VX1, VY0, VY1, OX, OY, PORT, RING: 26, TITLE, BAND, rot: -.012,
      INK: BANK.ink, STAMP: '#B5392C', TINT: { gold: '#A8843A', green: '#52806A', rose: '#A05A66', blue: '#526C9C' } };
  })();
  {
    const N = NT, INK0 = N.INK, TINT = N.TINT;
    const inkAt = () => INK0;
    const tintAt = (col, x, y, k = .6) => mixCol(INK0, mixCol(desat(col, .7), '#16121A', .22), k);
    const line = (P, w, col) => { for (let j = 0; j < P.length - 1; j += 24) _inkLine(P.slice(j, j + 25), w, col, 'rotring', .3); };
    const ring = (cx, cy, rx, ry, n = 72) => { const P = oval(cx, cy, rx, ry, 0, n); return P.concat([P[0]]); };
    const wash = (P, col) => _paint(P, { wash: col, washOp: 255, ink: null });
    const paperCol = () => BANK.paper;
    const underCol = () => mixCol(mixCol(BANK.paper, BANK.tint, .9), INK0, .1);
    // (banknote.js's engraving scale: a layer's line weights, spacings and wavelengths × S, the grid anchored at o.at)
    function bnEngrave(o, fn) {
      const S = o.S ?? 1, cap = o.cap ?? 1, [ax, ay] = o.at || [0, 0], ow = o.ow ?? 1;
      const sv = { wl: waveLines, el: edgeLine, dl: dline, fr: fillRegion, ink: BANK.ink, colour: BANK.colour, engS: BANK.engS };
      BANK.colour = o.colour ?? 1; BANK.engS = S;
      waveLines = (P, d, a, amp, wl, c, w) => { push(); translate(ax, ay); sv.wl(P.map(([x, y]) => [x - ax, y - ay]), d * S, a, amp * S, wl * S, c, w * S); pop(); };
      fillRegion = (P, c, op = {}) => { BANK.ink = INK0; sv.fr(P, c, cap < 1 ? { ...op, maxTone: Math.min(op.maxTone ?? 1, cap) } : op); };
      edgeLine = (P, sw = 1, c, closed, curv = 0) => { BANK.ink = INK0; sv.el(P, sw * S * ow, c, closed, curv); };
      dline = (P, sw = 1, c = NOIR.ink, curv = 0) => { BANK.ink = INK0; sv.dl(P, sw * S, c, curv); };
      try { fn(); } finally { waveLines = sv.wl; edgeLine = sv.el; dline = sv.dl; fillRegion = sv.fr; BANK.ink = sv.ink; BANK.colour = sv.colour; BANK.engS = sv.engS; }
    }
    function band(a, b, h, o = {}) {
      const n = o.n ?? 5, wl = o.wl ?? 40, w = o.w ?? .55, L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L, nx = -uy, ny = ux;
      const col = o.col || ((x, y) => inkAt(x, y));
      for (let i = 0; i < n; i++) {
        const ph = i / n * TAU, pts = [];
        for (let s = 0; s <= L; s += 5) { const off = Math.sin(s / wl * TAU + ph) * h / 2 * (o.env ? o.env(s / L) : 1); pts.push([a[0] + ux * s + nx * off, a[1] + uy * s + ny * off]); }
        for (let j = 0; j < pts.length - 1; j += 24) { const P = pts.slice(j, j + 25), m = P[P.length >> 1]; _inkLine(P, w, col(m[0], m[1]), 'rotring', .3); }
      }
    }
    function rosette(cx, cy, r, o = {}) {
      const ink = inkAt(cx, cy), c1 = tintAt(o.c1 || TINT.gold, cx, cy), c2 = tintAt(o.c2 || TINT.rose, cx, cy), w = o.w ?? .5;
      wash(oval(cx, cy, r * 1.03, r * 1.03, 0, 40), paperCol());
      guilloche(cx, cy, r * .7, r * .97, { n: o.n1 ?? 12, lobes: o.lobes1 ?? 18, col: c1, w, steps: 300 });
      guilloche(cx, cy, r * .14, r * .62, { n: o.n2 ?? 9, lobes: o.lobes2 ?? 8, col: c2, w, twist: .8, beat: 4, steps: 240 });
      line(ring(cx, cy, r, r, 60), w * 1.8, ink); line(ring(cx, cy, r * .67, r * .67, 48), w * 1.2, ink);
      line(ring(cx, cy, r * .08, r * .08, 16), w * 1.2, ink);
    }
    // ---- the vignette: the bunker, engraved (the hall kept light, the diners at full strength), frozen at the toast ----
    function vignette(lt) {
      const o = { S: N.K, at: [N.OX, N.OY], colour: .5 };
      atT(lt, () => { bnEngrave({ ...o, cap: .52 }, () => bunkerBack(lt, lt)); bnEngrave({ ...o, cap: .95, ow: 1.4 }, () => bkCast(lt, lt)); });
    }
    // ---- the portraits ----
    function portraitGround(p) {
      const P = oval(p.cx, p.cy, p.rx + 4, p.ry + 4, 0, 64), ink = inkAt(p.cx, p.cy);
      wash(P, paperCol());
      waveLines(P, 4.2, 0, .5, 220, ink, .55);
      waveLines(curvy([[p.cx - p.rx, p.cy - p.ry * .1], [p.cx, p.cy - p.ry * 1.02], [p.cx + p.rx, p.cy - p.ry * .1], [p.cx, p.cy - p.ry * .55]], 6), 4.2, 0, .5, 220, ink, .45);
    }
    // a narrator's bust in an oval: seated (the coat stops at the lap, cut off by the oval), frozen; the head's centre at
    // hy (note px) and x
    const PT = {
      her: { P: HER_C, u: 60, x: -10, hy: 30, o: { view: 'q', lookX: -.12, lookY: -.08, emote: null, mouth: 'smirk', seed: 3 } },
      him: { P: HIM_C, u: 60, x: 10, hy: -30, o: { view: 'q', flip: true, lookX: -.12, lookY: -.14, emote: null, mouth: 'flat', seed: 6 } },
    };
    function bust(p, who, key) {
      const B = PT[who], o = { seated: true, ...B.o }, Fr = personFrame(B.P, o), y = p.cy + B.hy - Fr.hy * B.u;
      const face = feel('neutral', 0, { seed: B.o.seed });
      clipPoly(oval(p.cx, p.cy, p.rx + 6, p.ry + 6, 0, 64), () => bnEngrave({ colour: .35 }, () => atT(0, () => person(p.cx + B.x, y, B.u, B.P, {
        ...face, ...o, dy: 0, sq: 0, rot: 0, pose: 'low', noShadow: true, idle: 0, blink: 0, boilKey: key,
      }))));
    }
    // ---- the paper: the note minus its windows (the two ovals and the vignette, its corners inverted) ----
    function paperPieces() {
      const out = [], e = 1.5, { NX0, NX1, NY0, NY1, VX0, VX1, VY0, VY1 } = N;
      const arc = (p, a0, a1) => { const P = []; for (let i = 0; i <= 28; i++) { const a = lerp(a0, a1, i / 28); P.push([p.cx + Math.cos(a) * p.rx, p.cy + Math.sin(a) * p.ry]); } return P; };
      const L = N.PORT.L, R = N.PORT.R;
      out.push(R4(NX0, NY0, L.cx - L.rx + e, NY1));
      for (const p of [L, R]) {
        out.push([[p.cx - p.rx - e, NY0], [p.cx + p.rx + e, NY0], [p.cx + p.rx + e, p.cy], ...arc(p, TAU, Math.PI), [p.cx - p.rx - e, p.cy]]);
        out.push([[p.cx - p.rx - e, p.cy], ...arc(p, Math.PI, 0), [p.cx + p.rx + e, p.cy], [p.cx + p.rx + e, NY1], [p.cx - p.rx - e, NY1]]);
      }
      out.push(R4(L.cx + L.rx - e, NY0, VX0 + e, NY1));
      out.push(R4(VX0 - e, NY0, VX1 + e, VY0 + e));
      out.push(R4(VX0 - e, VY1 - e, VX1 + e, NY1));
      out.push(R4(VX1 - e, NY0, R.cx - R.rx + e, NY1));
      out.push(R4(R.cx + R.rx - e, NY0, NX1, NY1));
      const rc = 26;
      for (const [x, y, a0] of [[VX0, VY0, 0], [VX1, VY0, Math.PI / 2], [VX1, VY1, Math.PI], [VX0, VY1, 1.5 * Math.PI]]) {
        const P = [[x, y]]; for (let i = 0; i <= 10; i++) { const a = a0 + i / 10 * Math.PI / 2; P.push([x + Math.cos(a) * rc, y + Math.sin(a) * rc]); }
        out.push(P);
      }
      return out;
    }
    function notePaper() { const pc = paperCol(), uc = underCol(); for (const P of paperPieces()) { wash(P, pc); waveLines(P, 9, 12, 3, 140, uc, .5); } }
    // ---- the ornament ----
    function border() {
      const m0 = 14, m1 = 50, mid = (m0 + m1) / 2, h = m1 - m0 - 6, { NX0, NX1, NY0, NY1 } = N;
      const x0 = NX0 + mid, x1 = NX1 - mid, y0 = NY0 + mid, y1 = NY1 - mid;
      const gold = (x, y) => tintAt(TINT.gold, x, y), green = (x, y) => tintAt(TINT.green, x, y);
      band([x0 + 24, y0], [x1 - 24, y0], h, { n: 6, wl: 36, col: gold }); band([x0 + 24, y1], [x1 - 24, y1], h, { n: 6, wl: 36, col: gold });
      band([x0, y0 + 24], [x0, y1 - 24], h, { n: 6, wl: 36, col: green }); band([x1, y0 + 24], [x1, y1 - 24], h, { n: 6, wl: 36, col: green });
      for (const [x, y] of [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]) rosette(x, y, 24, { n1: 10, lobes1: 12, n2: 6, lobes2: 6, c1: TINT.green, c2: TINT.gold });
      const rule = (m, w) => { for (const [a, b] of [[[NX0 + m, NY0 + m], [NX1 - m, NY0 + m]], [[NX1 - m, NY0 + m], [NX1 - m, NY1 - m]], [[NX1 - m, NY1 - m], [NX0 + m, NY1 - m]], [[NX0 + m, NY1 - m], [NX0 + m, NY0 + m]]]) { const P = []; for (let s = 0; s <= 1; s += 1 / 16) P.push([lerp(a[0], b[0], s), lerp(a[1], b[1], s)]); line(P, w, INK0); } };
      rule(m0 - 4, 1.4); rule(m1 + 3, 1.1); rule(m1 + 7, .5);
    }
    function ovalGuilloche(p, o0, o1, n, lobes, col, w = .5) {
      for (let i = 0; i < n; i++) {
        const ph = i / n * TAU, pts = [];
        for (let k = 0; k <= 720; k++) { const a = k / 720 * TAU, off = lerp(o0, o1, .5 + .5 * Math.sin(lobes * a + ph)); pts.push([p.cx + Math.cos(a) * (p.rx + off), p.cy + Math.sin(a) * (p.ry + off)]); }
        line(pts, w, col);
      }
    }
    function ovalFrame(p) {
      const ink = inkAt(p.cx, p.cy), R = N.RING;
      ovalGuilloche(p, 5, R - 2, 9, 50, tintAt(TINT.gold, p.cx, p.cy));
      line(ring(p.cx, p.cy, p.rx, p.ry, 96), 1.6, ink);
      line(ring(p.cx, p.cy, p.rx + 4, p.ry + 4, 96), .6, ink);
      line(ring(p.cx, p.cy, p.rx + R + 2, p.ry + R + 2, 96), 1.2, ink);
      for (let i = 0; i < 72; i++) { const a = i / 72 * TAU, x = p.cx + Math.cos(a) * (p.rx + R + 9), y = p.cy + Math.sin(a) * (p.ry + R + 9); wash(oval(x, y, 2.2, 2.2, 0, 8), ink); }
      rosette(p.cx, p.cy + p.ry + R + 4, 30, { n1: 10, lobes1: 14, n2: 7, lobes2: 7 });
      rosette(p.cx, p.cy - p.ry - R - 4, 22, { n1: 8, lobes1: 12, n2: 6, lobes2: 6 });
    }
    function vignetteFrame() {
      const g = 16, { VX0, VX1, VY0, VY1, VCX, VCY } = N, x0 = VX0 - 6 - g / 2, x1 = VX1 + 6 + g / 2, y0 = VY0 - 6 - g / 2, y1 = VY1 + 6 + g / 2, blue = (x, y) => tintAt(TINT.blue, x, y), ink = inkAt(VCX, VCY);
      band([x0 + 30, y0], [x1 - 30, y0], g, { n: 5, wl: 26, col: blue }); band([x0 + 30, y1], [x1 - 30, y1], g, { n: 5, wl: 26, col: blue });
      band([x0, y0 + 30], [x0, y1 - 30], g, { n: 5, wl: 26, col: blue }); band([x1, y0 + 30], [x1, y1 - 30], g, { n: 5, wl: 26, col: blue });
      const rc = 26, E = [];
      for (const [x, y, a0] of [[VX0, VY0, Math.PI / 2], [VX1, VY0, Math.PI], [VX1, VY1, 1.5 * Math.PI], [VX0, VY1, 0]]) for (let i = 0; i <= 8; i++) { const a = a0 - i / 8 * Math.PI / 2; E.push([x + Math.cos(a) * rc, y + Math.sin(a) * rc]); }
      E.push(E[0]); line(E, 1.6, ink);
      const rr = (m, w) => { const P = [[VX0 - m, VY0 - m], [VX1 + m, VY0 - m], [VX1 + m, VY1 + m], [VX0 - m, VY1 + m], [VX0 - m, VY0 - m]], Qp = []; for (let i = 0; i < 4; i++) for (let s = 0; s < 1; s += 1 / 12) Qp.push([lerp(P[i][0], P[i + 1][0], s), lerp(P[i][1], P[i + 1][1], s)]); Qp.push(P[0]); line(Qp, w, ink); };
      rr(4, .6); rr(g + 8, 1.3);
      for (const [x, y] of [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]) rosette(x, y, 20, { n1: 8, lobes1: 12, n2: 6, lobes2: 6, c1: TINT.blue });
    }
    // a pill (a cartouche: a long box with round ends), centred on (0, cy)
    const pillPts = (cy, hw, hh) => { const P = []; for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + i / 12 * Math.PI; P.push([hw + Math.cos(a) * hh, cy + Math.sin(a) * hh]); } for (let i = 0; i <= 12; i++) { const a = Math.PI / 2 + i / 12 * Math.PI; P.push([-hw + Math.cos(a) * hh, cy + Math.sin(a) * hh]); } return P; };
    function ornaments(titled) {
      const { NX0, NX1, NY0, NY1, VX0, VX1, VY0, VY1 } = N;
      // the fine wavy-line fields, domed over and under the vignette
      const fy0 = VY0 - 40, fy1 = VY1 + 40, hx = VX1 + 42, tb = N.TITLE.cy + N.TITLE.hh + 34, bb = N.BAND.cy - N.BAND.hh - 30;
      const top = curvy([[-hx, fy0], [-hx + 40, fy0 - 60], [-hx * .5, tb + 22], [0, tb], [hx * .5, tb + 22], [hx - 40, fy0 - 60], [hx, fy0], [0, fy0 + 4]], 8);
      const bot = curvy([[-hx, fy1], [0, fy1 - 4], [hx, fy1], [hx - 40, fy1 + 60], [hx * .5, bb - 22], [0, bb], [-hx * .5, bb - 22], [-hx + 40, fy1 + 60]], 8);
      for (const [P, c] of [[top, TINT.green], [bot, TINT.blue]]) {
        waveLines(P, 4.6, 0, 1.4, 46, mixCol(tintAt(c, 0, 0, .5), BANK.paper, .25), .62); waveLines(P, 9.2, 0, 2.4, 130, mixCol(tintAt(TINT.rose, 0, 0, .5), BANK.paper, .25), .58);
        line(P.concat([P[0]]), .7, mixCol(INK0, BANK.paper, .25));
      }
      // top: the cartouche where the bank's name would be (microlines; with the title, a clear panel for its capitals)
      const { cy: ty, hw: tw, hh: th } = N.TITLE, pill = pillPts(ty, tw, th);
      wash(pill, paperCol());
      if (!titled) for (let i = 0; i < 25; i++) { const y = ty - th + 8 + i * (2 * th - 16) / 24, hw = tw + Math.sqrt(Math.max(0, th * th - (y - ty) ** 2)) - 8, P = []; for (let x = -hw; x <= hw; x += 4) P.push([x, y + Math.sin(x / 8 + i * 1.3) * 1.1]); line(P, .9, tintAt(TINT.rose, 0, ty, .45)); }
      else waveLines(pill, 3.4, 0, .8, 9, mixCol(INK0, BANK.paper, .82), .6);   // (a whisper of underprint behind the capitals)
      line(pill.concat([pill[0]]), 1.4, INK0);
      const pill2 = pillPts(ty, tw + 8, th + 8); line(pill2.concat([pill2[0]]), .6, INK0);
      const pill3 = pillPts(ty, tw + 20, th + 20); line(pill3.concat([pill3[0]]), 1.1, INK0);
      for (const sd of [-1, 1]) rosette(sd * (tw + th + 56), ty, 34, { n1: 12, lobes1: 16, n2: 7, lobes2: 7 });
      // bottom: a medallion where the serial numbers would be, flanked by microline bands (with the artist: his banderole,
      // drawn with the lettering, between two rosettes)
      const { cy: by, hw: bw } = N.BAND;
      if (!titled) {
        rosette(0, by, 62, { c1: TINT.blue, c2: TINT.gold });
        for (const s of [-1, 1]) band([s < 0 ? -bw - 60 : 84, by], [s < 0 ? -84 : bw + 60, by], 34, { n: 9, wl: 64, w: .55, col: (x, y) => tintAt(TINT.rose, x, y) });
      }
      for (const s of [-1, 1]) rosette(s * (bw + 110), by, 26, { n1: 8, lobes1: 12, n2: 6, lobes2: 6 });
      // the corners, where the numerals would be
      rosette(NX0 + 132, NY0 + 128, 66, { c1: TINT.gold, c2: TINT.green });
      rosette(NX1 - 132, NY1 - 128, 66, { c1: TINT.gold, c2: TINT.green });
      rosette(NX1 - 122, NY0 + 122, 50, { c1: TINT.blue, c2: TINT.rose, n1: 12, lobes1: 16 });
      rosette(NX0 + 122, NY1 - 122, 50, { c1: TINT.blue, c2: TINT.rose, n1: 12, lobes1: 16 });
      // the windowed security thread between her frame and the vignette
      const L = N.PORT.L, thx = (L.cx + L.rx + N.RING + VX0 - 30) / 2;
      for (let y = N.TITLE.cy + N.TITLE.hh + 40; y < N.BAND.cy - 20; y += 44) {
        const P = [[thx - 4, y], [thx + 4, y], [thx + 4, y + 26], [thx - 4, y + 26]];
        wash(P, mixCol(INK0, paperCol(), .5));
        for (let k = 0; k < 3; k++) _inkLine([[thx - 4, y + 6 + k * 7], [thx + 4, y + 9 + k * 7]], .5, paperCol(), 'rotring', 0);
      }
    }
    // ---- the stamp: the bill's red rubber stamp, a clock at five to nine (banknote.js), slammed on at an angle ----
    function stamp(cx, cy, r, rot) {
      push(); translate(cx, cy); rotate(rot);
      const ink = N.STAMP, gap = i => hash(i * 3.7 + 11) < .14;
      const arcs = (rad, w, n, key) => { for (let i = 0; i < n; i++) { if (gap(i + key)) continue; const P = []; for (let j = 0; j <= 8; j++) { const q = (i + j / 8 + (hash(i + key) - .5) * .06) / n * TAU; P.push([Math.cos(q) * rad, Math.sin(q) * rad]); } _inkLine(P, w, ink, 'rotring', .4); } };
      arcs(r, 8, 30, 0); arcs(r - 14, 3, 26, 50); arcs(r * .66, 3.2, 22, 90);
      for (let i = 0; i < 60; i++) { if (gap(i + 200)) continue; const q = i / 60 * TAU, L = i % 5 ? 10 : 22; _inkLine([[Math.cos(q) * (r - 26), Math.sin(q) * (r - 26)], [Math.cos(q) * (r - 26 - L), Math.sin(q) * (r - 26 - L)]], i % 5 ? 2.8 : 5.5, ink, 'rotring', 0); }
      for (const [q, L, w] of [[-Math.PI / 2 + 8.92 / 12 * TAU, r * .4, 11], [-Math.PI / 2 + 55 / 60 * TAU, r * .56, 7]]) { const e = [Math.cos(q) * L, Math.sin(q) * L]; _inkLine([[0, 0], e], w, ink, 'rotring', 0); _paint(starPts(e[0], e[1], w * 1.4, .01, 3, q), { wash: ink, washOp: 255, ink: null }); }
      wash(oval(0, 0, 13, 13, 0, 16), ink);
      for (let i = 0; i < 4; i++) { const q = (i + .5) / 4 * TAU; _paint(starPts(Math.cos(q) * (r * .83), Math.sin(q) * (r * .83), 14, .42, 5, q), { wash: ink, washOp: 240, ink: null }); }
      for (let i = 0; i < 5; i++) { const y = (hash(i * 7.7) - .5) * r * 1.6, x0 = (hash(i * 3.1) - .5) * r; _inkLine([[x0 - 40, y], [x0 + 40, y + 3]], 3, BANK.paper, 'rotring', 0); }
      pop();
      for (let i = 0; i < 7; i++) { const q = hash(i * 5.3) * TAU, d = r * (1.04 + .2 * hash(i * 2.1)); _paint(oval(cx + Math.cos(q) * d, cy + Math.sin(q) * d, 2 + 3 * hash(i), 2 + 3 * hash(i), 0, 10), { wash: N.STAMP, washOp: 255, ink: null }); }
    }
    N.STAMP_AT = [215, 200, 176, -.28];
    // the desk the note lies on: the house ink's deep teal, a fine engraved ruling in it (so the pale note stands out)
    function surround() {
      const P = rectPts(-80, -80, W + 160, H + 160), deep = mixCol(INK0, '#06100F', .5);
      _paint(P, { wash: deep, washOp: 255, ink: null });
      waveLines(P, 7, 12, 2.5, 160, mixCol(deep, BANK.paper, .16), .6);
    }
    function noteShadow() {
      const { NX0, NX1, NY0, NY1 } = N, P = [[NX0 + 14, NY1], [NX1, NY1], [NX1, NY0 + 14], [NX1 + 12, NY0 + 22], [NX1 + 12, NY1 + 12], [NX0 + 22, NY1 + 12]];
      wash(P, mixCol(INK0, '#040A0A', .7));
    }
    N.art = (t, titled) => {
      look('bank');
      const zoom = 1 / N.K;
      surround();
      camBegin(N.OX, N.OY, zoom, N.rot);
      push(); translate(N.OX, N.OY); scale(N.K);
      boilSeed('nt shadow'); noteShadow();
      pop();
      boilSeed('nt vignette'); vignette(N.VIG_LT);
      push(); translate(N.OX, N.OY); scale(N.K);
      for (const p of [N.PORT.L, N.PORT.R]) { boilSeed('nt ground' + p.cx); portraitGround(p); }
      boilSeed('nt her'); bust(N.PORT.L, 'her', 'ntHer');
      boilSeed('nt him'); bust(N.PORT.R, 'him', 'ntHim');
      boilSeed('nt paper'); notePaper();
      boilSeed('nt border'); border();
      boilSeed('nt ornaments'); ornaments(titled);
      for (const p of [N.PORT.L, N.PORT.R]) { boilSeed('nt frame' + p.cx); ovalFrame(p); }
      boilSeed('nt vframe'); vignetteFrame();
      boilSeed('nt stamp'); stamp(...N.STAMP_AT);
      pop();
      camEnd();
    };
    N.VIG_LT = BUNKER.times.clink + .02;   // the toast: the glasses meeting
    N.PT = PT; N.engrave = bnEngrave; N.rosette = rosette; N.band = band;
  }
  // the note's lettering: engraved capitals in the house teal. The title in the cartouche (shaded: a hairline cast to the
  // lower right, as a note's display capitals are); the artist on a banderole below (karaoke.js's bank banderole: swallow-
  // tailed, guilloche-edged, the capitals over fine lines).
  function noteText(c) {
    const N = NT, ink = N.INK, paper = BANK.paper;
    c.translate(W / 2, H / 2); c.rotate(N.rot);
    // the title
    const T1 = fitFont(COVER.title.toUpperCase(), 2 * N.TITLE.hw - 70, '700', 'Cinzel, serif');
    c.font = T1.font; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    const by = N.TITLE.cy + T1.cap / 2;
    c.lineJoin = 'round'; c.lineWidth = 1.3; c.strokeStyle = mixCol(ink, paper, .35); c.strokeText(COVER.title.toUpperCase(), 3.2, by + 3.2);
    c.fillStyle = ink; c.fillText(COVER.title.toUpperCase(), 0, by);
    // the banderole, and the artist on it
    const { cy, hw, hh } = N.BAND, w = 2 * hw, h = 2 * hh, T = 58;
    c.save(); c.translate(0, cy); c.strokeStyle = ink;
    for (const sx of [-1, 1]) {
      const xe = sx * (w / 2), xo = sx * (w / 2 + T), y0 = -h / 2 + 14, y1 = h / 2 + 14;
      const Q = [[xe - sx * 20, y0], [xo, y0], [xo - sx * 22, (y0 + y1) / 2], [xo, y1], [xe - sx * 20, y1]];
      c.save(); c.translate(3, 4); kPath(c, Q); c.fillStyle = 'rgba(10,30,34,.18)'; c.fill(); c.restore();
      kPath(c, Q); c.fillStyle = paper; c.fill();
      c.save(); c.clip(); kLines(c, Math.min(xe, xo) - 4, Math.max(xe, xo) + 4, y0, y1, 2.7, .6, 9, .95); c.restore();
      kPath(c, Q); c.lineWidth = 1.6; c.stroke();
      const F = [[xe, h / 2], [xe - sx * 20, h / 2], [xe - sx * 20, y1]];
      kPath(c, F); c.fillStyle = paper; c.fill(); c.save(); c.clip(); kLines(c, Math.min(xe, xe - sx * 20) - 2, Math.max(xe, xe - sx * 20) + 2, h / 2 - 2, y1 + 2, 1.9, 0, 9, 1.1); c.restore(); kPath(c, F); c.lineWidth = 1.2; c.stroke();
    }
    kRR(c, -w / 2, -h / 2, w, h, 3); c.fillStyle = paper; c.fill();
    c.save(); kRR(c, -w / 2, -h / 2, w, h, 3); c.clip();
    c.globalAlpha = .16; kLines(c, -w / 2, w / 2, -h / 2 + 2, h / 2, 4.2, 1.6, 26, .8); c.globalAlpha = .8;
    kGuilloche(c, -w / 2 + 6, w / 2 - 6, -h / 2 + 4, -h / 2 + 12, 4, 11, .75); kGuilloche(c, -w / 2 + 6, w / 2 - 6, h / 2 - 12, h / 2 - 4, 4, 11, .75);
    c.globalAlpha = 1; c.restore();
    kRR(c, -w / 2, -h / 2, w, h, 3); c.lineWidth = 2; c.stroke();
    const T2 = fitFont(COVER.artist.toUpperCase(), w - 150, '700', 'Cinzel, serif');
    c.font = T2.font; c.textAlign = 'center'; c.fillStyle = ink; c.fillText(COVER.artist.toUpperCase(), 0, T2.cap / 2);
    c.restore();
  }
  design('note', (t, titled) => NT.art(t, titled), noteText);
  window.COVER_NT = NT;

  // =====================================================================================================================
  // PROMISE: the promise and what they wanted (O1's ending, video/ch/outro.js, recomposed for 4:3). On the stopped night
  // train's woodgrain table: her phone propped on its case's kickstand, playing the 1930s ad (the gent in his hammock,
  // the robot butler just served), frozen and grey; beside it her sketchbook open at their Friday (the two of them on the
  // bean bags, laughing), her hand resting on the page, her tomato sleeve from the right. All card but the pictures in
  // their frames: the ad in ink on the screen, the Friday in biro on the page. Lettering: a strip of cut card lying on
  // the table (karaoke.js's card look: cream capitals on a dark strip, chips of her tomato and his mustard under TIME
  // SAVED), the artist on a small cream strip under it.
  // =====================================================================================================================
  const PR = { FREEZE: 2.16, FRIDAY_AT: 6.1, S: 1.1,
    TABLE: '#B98C5C', TABLE_MID: '#A77A4C', TABLE_DK: '#8C6238', NBK: { cover: '#3A4A6A', coverDk: '#2A3650', coil: '#9A9EA6' } };
  PR.PG = { cx: 975, cy: 470, w: 830, rot: -.035 }; PR.PG.h = PR.PG.w * 9 / 16; PR.PG.s = PR.PG.w / 1920;
  PR.SCR = { x0: 58, y0: 350, w: 384 }; PR.SCR.h = PR.SCR.w * 9 / 16;
  PR.HAND = { x: 1705, y: 812, rot: .22, s: 255 };   // her wrist, the hand's turn and size (O1's)
  PR.BIRO = [690, 880, -.2, 400];   // her biro, lying on the table below the page: tip (x, y), the barrel's angle, its length
  PR.TITLE = { cx: 580, cy: 1140, w: 1000, rot: -.03 }; PR.ARTIST = { cx: 420, cy: 1300, w: 440, rot: .025 };
  {
    const P = PR, oR4 = R4;
    const onPG = ([x, y]) => { const c = Math.cos(P.PG.rot), s = Math.sin(P.PG.rot); return [P.PG.cx + x * c - y * s, P.PG.cy + x * s + y * c]; };
    const corners = (grow = 0) => { const hw = P.PG.w / 2 + grow, hh = P.PG.h / 2 + grow; return [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(onPG); };
    const coverCorners = () => { const hw = P.PG.w / 2, hh = P.PG.h / 2, w = P.PG.w; return [[-hw - .043 * w, -hh - .026 * w], [hw + .034 * w, -hh - .026 * w], [hw + .034 * w, hh + .043 * w], [-hw - .043 * w, hh + .043 * w]].map(onPG); };
    const adGrade = g => `grayscale(${(g * .92).toFixed(3)}) contrast(${(1 + .12 * g).toFixed(3)}) brightness(${(1 - .12 * g).toFixed(3)})`;
    const prRound = (x0, y0, x1, y1, r) => { const Q = []; for (const [cx, cy, a0] of [[x1 - r, y0 + r, -Math.PI / 2], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, Math.PI / 2], [x0 + r, y0 + r, Math.PI]]) for (let i = 0; i <= 6; i++) { const a = a0 + i / 6 * Math.PI / 2; Q.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return Q; };
    // the ad, frozen: the gent with his cocktail, the butler's tray back home (outro.js adPicture, without the weave)
    const adPicture = () => { look('ink'); film1080(() => pastScene(P.FREEZE, P.FREEZE, { still: true, gate: false })); };
    // the phone on its kickstand (outro.js phone()), the ad on its screen, graded grey there only
    function phoneOnStand() {
      const { x0, y0, w, h } = P.SCR, k = w / 384, b = 13 * k, cz = 7 * k;
      look('card'); boilSeed('pr phone');
      piece([[x0 + 40 * k, y0 + h + b + 4], [x0 + w + 60 * k, y0 + h + b + 4], [x0 + w + 130 * k, y0 + h + b + 46 * k], [x0 + 100 * k, y0 + h + b + 46 * k]], '#000000', { ink: null, op: 60, key: 'prphshadow', lift: 0, flatCard: true, edge: false });
      piece([[x0 + w - 70 * k, y0 + h - 10 * k], [x0 + w - 44 * k, y0 + h - 16 * k], [x0 + w + 6 * k, y0 + h + b + 30 * k], [x0 + w - 20 * k, y0 + h + b + 34 * k]], '#4A5A48', { sw: 1.2, key: 'prphstand', lift: 2 });
      piece(prRound(x0 - b - cz, y0 - b - cz, x0 + w + b + cz, y0 + h + b + cz, 26 * k), '#7A9278', { sw: 1.6, shade: '#5A7058', depth: 8 * k, key: 'prphcase', lift: 6 });
      piece(prRound(x0 - b, y0 - b, x0 + w + b, y0 + h + b, 20 * k), '#1E1C24', { sw: 1.2, key: 'prphbody', lift: 2, flatCard: true });
      clipPoly(oR4(x0, y0, x0 + w, y0 + h), () => { push(); translate(x0, y0); scale(w / 1920); adPicture(); pop(); });
      look('card');
      POSTFX_AREAS.push({ P: [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]].map(([x, y]) => toScreen(x, y)), fx: adGrade(1) });
      piece([[x0 + w * .55, y0], [x0 + w * .72, y0], [x0 + w * .5, y0 + h], [x0 + w * .33, y0 + h]], '#FFFFFF', { ink: null, op: 18, key: 'prphglare', lift: 0, flatCard: true, edge: false });
      piece(oval(x0 - b / 2, y0 + h / 2, 2.6 * k, 2.6 * k, 0, 10), '#3A3844', { ink: null, key: 'prphcam', lift: 0, flatCard: true, edge: false });
      glow(x0 + w / 2, y0 + h + 60 * k, 260 * k, '#C8D4DC', .12);
    }
    // her hand at rest (outro.js restingHand): the back of a hand lying flat, from the wrist along -x, four fingers cut
    // round, nails and knuckle creases, the thumb along the top edge
    function restingHand(x, y, rot, s) {
      const skin = HER_C.col.skin, dk = HER_C.col.skinDk, lt = HER_C.col.skinLt;
      const F = [[-.27, -.3, -1.8, .105], [-.075, -.085, -1.93, .11], [.12, .125, -1.86, .105], [.3, .33, -1.64, .095]];
      const web = [-1.26, -1.32, -1.29], Q = [[0, .44], [-.5, .47], [-.98, .43]];
      for (let i = F.length - 1; i >= 0; i--) {
        const [yk, yt, tx, hw] = F[i], arc = [];
        for (let j = 0; j <= 6; j++) { const a = Math.PI / 2 - j / 6 * Math.PI; arc.push([tx + .02 - Math.cos(a) * hw * 1.1, yt + Math.sin(a) * hw]); }
        Q.push([lerp(-1.0, tx, .55), lerp(yk, yt, .55) + hw], ...arc, [lerp(-1.0, tx, .55), lerp(yk, yt, .55) - hw]);
        if (i > 0) Q.push([web[i - 1], (F[i][0] + F[i - 1][0]) / 2]);
      }
      Q.push([-1.0, -.41], [-.5, -.46], [0, -.44]);
      push(); translate(x, y); rotate(rot);
      piece(curvy(U(Q, s), 2), skin, { sw: 1.8, shade: dk, depth: s * .16, key: 'prh-hand', lift: 7 });
      for (const [yk, yt, tx, hw] of F) {
        piece(oval((tx + .13) * s, yt * s, .085 * s, hw * .62 * s, 0, 14), mixCol(skin, lt, .6), { sw: .8, key: 'prh-nail' + tx, lift: 0, flatCard: true, edge: false });
        dline([[lerp(-1.0, tx, .5) * s, (lerp(yk, yt, .5) - hw * .5) * s], [lerp(-1.0, tx, .52) * s, (lerp(yk, yt, .5) + hw * .5) * s]], 1, dk, .4);
        dline([[-.98 * s, (yk - hw * .4) * s], [-1.02 * s, (yk + hw * .3) * s]], 1, dk, .4);
      }
      push(); translate(-.3 * s, -.4 * s);
      piece(curvy(U([[.05, 0], [-.35, -.14], [-.72, -.24], [-.88, -.2], [-.9, -.1], [-.7, -.02], [-.3, .06]], s), 3), skin, { sw: 1.7, shade: dk, depth: s * .08, key: 'prh-thumb', lift: 4 });
      piece(oval(-.8 * s, -.17 * s, .05 * s, .045 * s, -.25, 12), lt, { sw: .8, key: 'prh-tnail', lift: 0, flatCard: true, edge: false });
      pop(); pop();
    }
    // her biro (bridge.js biro(): a real pen, card, hers): tip at (x, y), the barrel back from it at angle a, length s
    function biroPen(x, y, a, s, key) {
      const w = s * .075, L = (x0, x1, w0, w1) => [[x0, -w0 / 2], [x1, -w1 / 2], [x1, w1 / 2], [x0, w0 / 2]];
      push(); translate(x, y); rotate(a);
      piece(L(s * .1, s * 1.02, w * 1.1, w * 1.1).map(([px, py]) => [px + w * .35, py + w * .5]), '#000000', { ink: null, op: 45, key: key + 'sh', lift: 0, flatCard: true, edge: false });   // its shadow on the table
      piece(L(s * .02, s * .13, w * .18, w * .62), '#B9BDC4', { sw: .9, key: key + 'cone', lift: 6, flatCard: true });
      piece(L(s * .13, s * .8, w * .95, w), '#E9ECEB', { sw: 1, shade: '#B7BDC0', depth: w * .35, key: key + 'barrel', lift: 7 });
      piece(L(s * .16, s * .78, w * .16, w * .16), '#2B3A92', { ink: null, key: key + 'refill', lift: 0, flatCard: true, edge: false });
      piece(L(s * .72, s * 1.0, w * 1.08, w * 1.1), '#26358C', { sw: 1, key: key + 'cap', lift: 7 });
      piece(L(s * .76, s * .99, w * .22, w * .22).map(([px, py]) => [px, py - w * .72]), '#26358C', { sw: .8, key: key + 'clip', lift: 8, flatCard: true });
      piece(oval(s * .015, 0, w * .12, w * .12, 0, 8), '#1A1A22', { ink: null, key: key + 'ball', lift: 1, flatCard: true });
      pop();
    }
    P.art = (t, titled) => {
      look('card');
      // the table: the InterCity woodgrain laminate, honey-toned, its grain in long wavering lines, a few knots
      boilSeed('pr table'); piece(oR4(-200, -200, W + 200, H + 200), P.TABLE, { ink: null, key: 'prtable', lift: 0, edge: false });
      for (let i = 0; i < 36; i++) { const y0 = 150 + i * 38 + 14 * hash(i), Q = []; for (let x = -200; x <= W + 200; x += 60) Q.push([x, y0 + 7 * Math.sin(x * .004 + i * 1.7) + 4 * Math.sin(x * .011 + i)]); dline(Q, .8 + .7 * hash(i + 9), hash(i * 3.3) < .4 ? P.TABLE_DK : P.TABLE_MID, .5); }
      for (const [kx, ky, kr] of [[330, 1060, 26], [1760, 300, 20]]) { const O = oval(kx, ky, kr * 2.2, kr * .7, 0, 20), O2 = oval(kx, ky, kr * 1.2, kr * .35, 0, 16); dline(O.concat([O[0]]), 1, P.TABLE_DK, .5); dline(O2.concat([O2[0]]), .8, P.TABLE_DK, .5); }
      // the cover under the page; the Friday on the page (a finished drawing: its lines don't boil)
      boilSeed('pr cover'); piece(coverCorners(), P.NBK.cover, { sw: 1.8, shade: P.NBK.coverDk, depth: 14, key: 'prcover', lift: 8 });
      clipPoly(corners(), () => {
        push(); translate(P.PG.cx, P.PG.cy); rotate(P.PG.rot); translate(-P.PG.w / 2, -P.PG.h / 2); scale(P.PG.s);
        film1080(() => stillDrawing(() => LOOPS.friday(P.FRIDAY_AT), P.FRIDAY_AT));
        pop();
      });
      look('card');
      piece(oR4(-60, -60, W + 60, 110).map(([x, y], i) => i === 3 ? [x, 150] : [x, y]), '#2C3450', { sw: 2, key: 'prseat', lift: 6 });   // the seat back beyond the table
      boilSeed('pr page'); clipPoly([oR4(-100, -100, W + 100, H + 100), corners()], () => piece(corners(4), '#F3EEE3', { ink: null, key: 'prpagerim', lift: 3, op: 0 }));
      const C = corners(); dline(C.concat([C[0]]), 1.4, '#9A9284');
      for (let i = 0; i < 9; i++) { const [x, y] = onPG([-P.PG.w / 2 - .0085 * P.PG.w, -P.PG.h / 2 + .034 * P.PG.w + i * (P.PG.h - .068 * P.PG.w) / 8]); piece(oval(x, y, .0385 * P.PG.w, .019 * P.PG.w, P.PG.rot, 14), P.NBK.coil, { sw: 1.2, key: 'prring' + i, lift: 3, flatCard: true }); }
      phoneOnStand();
      // her sleeve and her hand, resting on their Friday
      const HC = HER_C.col, { x: hx, y: hy, rot, s } = P.HAND;
      const arm = Q => Q.map(([x, y]) => [hx + (x * Math.cos(rot) - y * Math.sin(rot)) * s, hy + (x * Math.sin(rot) + y * Math.cos(rot)) * s]);
      boilSeed('pr sleeve');
      piece(curvy(arm([[-.04, -.47], [3.2, -.62], [3.2, .66], [-.02, .47]]), 2), HC.coat, { sw: 2, shade: HC.coatDk, depth: 44, key: 'prsleeve', lift: 10 });
      piece(curvy(arm([[-.05, -.49], [.2, -.52], [.24, .54], [-.03, .5]]), 2), HC.cuff, { sw: 1.6, key: 'prcuff', lift: 10 });
      boilSeed('pr hand'); restingHand(hx, hy, rot, s);
      boilSeed('pr biro'); biroPen(...P.BIRO, 'prbiro');
      glow(1300, 250, 900, NOIR.lamp, .12);   // the carriage light, warm on the table
    };
  }
  // The strip of card: kCut's scissor-cut strip (karaoke.js), cream lettering on dark card, a chip of her tomato under
  // TIME and his mustard under SAVED (the credits' card title); the artist on a cream strip, dark lettering.
  function cardTitle(c, o) {
    const words = COVER.title.split(' '), F = fitFont(COVER.title, o.w, '800', '"Shantell Sans", sans-serif'), sp = widthOf(' ', F.font), ws = words.map(s => widthOf(s, F.font));
    const place = []; let x = -o.w / 2; words.forEach((s, i) => { place.push(x); x += ws[i] + sp; });
    c.save(); c.translate(o.cx, o.cy); c.rotate(o.rot);
    kCardPiece(c, kCut(o.w + 120, F.cap + 112, 17, 2.4, 140, 6), '#2B2631', '#5E5568', 'l', 10);
    for (const [i, col, rot] of [[2, '#FF6B4A', -.025], [3, '#F5B82E', .02]]) {
      c.save(); c.translate(place[i] + ws[i] / 2, -4); c.rotate(rot);
      kCardPiece(c, kCut(ws[i] + 30, F.cap + 44, 30 + i, 1.4, 70, 3), col, mixCol(col, '#FFFFFF', .35), 'd', 4); c.restore();
    }
    c.font = F.font; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
    words.forEach((s, i) => { c.fillStyle = 'rgba(0,0,0,.3)'; c.fillText(s, place[i] + 2, F.cap / 2 + 3); c.fillStyle = i >= 2 ? '#231E28' : '#F6EEDD'; c.fillText(s, place[i], F.cap / 2); });
    c.restore();
    if (!o.artist) return;
    const A = o.artist, G = fitFont(COVER.artist, A.w, '800', '"Shantell Sans", sans-serif');
    c.save(); c.translate(A.cx, A.cy); c.rotate(A.rot);
    kCardPiece(c, kCut(A.w + 70, G.cap + 64, 23, 1.8, 110, 4), '#F2EADA', '#FFFFFF', 'd', 7);
    c.font = G.font; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillStyle = '#231E28'; c.fillText(COVER.artist, 0, G.cap / 2);
    c.restore();
  }
  design('promise', (t, titled) => PR.art(t, titled), c => cardTitle(c, { ...PR.TITLE, artist: PR.ARTIST }));

  // =====================================================================================================================
  // TRAIN: the bots' train (the chorus's night train, chorus.js, window.CHORUS: the carriage cutaway, its crowd of bot
  // passengers). The two of them squeezed in at the pole in the aisle, big in the foreground, turning their deadpan look
  // on us; around them the cheerful crew doing every job people used to do: Clawd plumping a pillow, Jolly with a tray of
  // flutes, Copilot the inspector punching a ticket, the Gemini twins with the tea, Grok with canapés, Codey squeegeeing
  // the window, the Codex pets on the racks stowing bags. Lettering: a card advertising panel above the windows (the
  // karaoke's card: cut card, a chip of her tomato and his mustard).
  // =====================================================================================================================
  const TR = { cam: [960, 590, 1.32], pole: 962, her: [878, 1086, 33], him: [1098, 1100, 35],
    TITLE: { cx: 960, cy: 118, w: 1180, rot: -.012 }, ARTIST: { cx: 1410, cy: 262, w: 360, rot: .02 } };
  {
    const P = TR, rect = R4;
    const CRr = () => window.CHORUS.CR;
    // the crew's props (chorus.js's, hand space: s ≈ the hand's size; a held stick points up the hand's -y)
    const pillowProp = (s, key = 'pillow') => piece(curvy([[-1.1 * s, -.6 * s], [1.1 * s, -.7 * s], [1.2 * s, .6 * s], [-1.05 * s, .7 * s]], 4), '#E8E0F0', { sw: 1.2, shade: '#B8AECB', depth: .3 * s, key, lift: 2 });
    const teaProp = (s, key = 'tea') => {
      push(); translate(0, -.8 * s);
      piece(curvy(oval(0, .38 * s, 1.05 * s, .22 * s, 0, 14), 2), '#F2EEE4', { sw: 1, key: key + 'sc', lift: 2, flatCard: true });
      piece([[-.62 * s, -.55 * s], [.62 * s, -.55 * s], [.45 * s, .3 * s], [-.45 * s, .3 * s]], '#F7F3EA', { sw: 1.1, key: key + 'cup', lift: 3, flatCard: true });
      piece(rect(-.6 * s, -.55 * s, .6 * s, -.4 * s), '#8A5A34', { ink: null, key: key + 'brew', lift: 0, flatCard: true, edge: false });
      dline([[.58 * s, -.4 * s], [.95 * s, -.32 * s], [.9 * s, 0], [.5 * s, .06 * s]], 1.4, '#C8C2B4', .5);
      for (const d of [-.2, .22]) dline([[d * s, -.8 * s], [(d + .16) * s, -1.2 * s], [(d - .04) * s, -1.62 * s]], 1.3, '#ECE8DE', .6);
      pop();
    };
    const ticketProp = (s, key = 'tkt') => {
      push(); translate(0, -1.15 * s); rotate(.15);
      piece(curvy(rect(-1.0 * s, -.62 * s, 1.0 * s, .62 * s), 2), '#F4EEDC', { sw: 1.1, key: key + 'c', lift: 2, flatCard: true });
      piece(rect(-1.0 * s, -.26 * s, 1.0 * s, .02 * s), '#E0602E', { ink: null, key: key + 'b', lift: 0, flatCard: true, edge: false });
      for (const hx of [.3, .62]) piece(oval(hx * s, .34 * s, .11 * s, .11 * s, 0, 8), '#2A2632', { ink: null, key: key + 'h' + hx, lift: 0, flatCard: true, edge: false });
      pop();
    };
    const punchProp = (s, c = 0, key = 'pch') => {
      const o = .5 * (1 - clamp(c));
      piece([[-o * s - .16 * s, .45 * s], [-.22 * s, -1.25 * s], [-.02 * s, -1.25 * s], [-o * s + .16 * s, .45 * s]], '#C8343A', { sw: 1, key: key + 'a', lift: 2 });
      piece([[o * s - .16 * s, .45 * s], [.02 * s, -1.25 * s], [.22 * s, -1.25 * s], [o * s + .16 * s, .45 * s]], '#C8343A', { sw: 1, key: key + 'b', lift: 2 });
      piece(curvy(rect(-.36 * s, -2.3 * s, .36 * s, -1.15 * s), 2), '#B8BCC4', { sw: 1, shade: '#7A7E88', depth: .12 * s, key: key + 'j', lift: 3 });
    };
    const dusterProp = (s, key = 'dst') => { push(); rotate(-.5); piece(rect(-.1 * s, -1.4 * s, .1 * s, .2 * s), '#8A5A34', { sw: 1, key: key + 's', lift: 1, flatCard: true }); piece(curvy(oval(0, -1.8 * s, .55 * s, .5 * s, 0, 12).map(([x, y], i) => [x + (i % 2 ? .12 * s : 0), y]), 2), '#E88AA8', { sw: 1, key: key + 'f', lift: 1 }); pop(); };
    const squeegeeProp = (s, key = 'sqg') => {
      piece(rect(-.12 * s, -2.0 * s, .12 * s, .4 * s), '#E0B040', { sw: 1, key: key + 'h', lift: 2, flatCard: true });
      piece(curvy(rect(-1.25 * s, -2.36 * s, 1.25 * s, -1.96 * s), 2), '#A8ACB4', { sw: 1, key: key + 'm', lift: 3 });
      piece(rect(-1.25 * s, -2.5 * s, 1.25 * s, -2.36 * s), '#2A2632', { ink: null, key: key + 'r', lift: 0, flatCard: true, edge: false });
    };
    function suitcase(x, y, s, key = 'case') {
      boilSeed(key);
      piece(curvy(rect(x - 1.5 * s, y - 2 * s, x + 1.5 * s, y), 2), '#8A5A3E', { sw: 1.2, shade: '#5E3A28', depth: .25 * s, key: key + 'b', lift: 3 });
      for (const d of [-.8, .8]) piece(rect(x + d * s - .12 * s, y - 2 * s, x + d * s + .12 * s, y), '#D8B060', { ink: null, key: key + 's' + d, lift: 0, flatCard: true, edge: false });
      dline([[x - .5 * s, y - 2 * s], [x - .45 * s, y - 2.5 * s], [x + .45 * s, y - 2.5 * s], [x + .5 * s, y - 2 * s]], 1.8, '#3A2418', .4);
    }
    // a green tick over a job just done (chorus.js doneTick, held at its fullest)
    function doneTick(x, y, key) {
      const r = 22; boilSeed(key);
      piece(oval(x, y, r, r, 0, 16), '#43A047', { sw: 1.2, key: key + 'd', lift: 4, flatCard: true });
      piece([[-.56, .02], [-.33, -.2], [-.1, .04], [.36, -.46], [.58, -.24], [-.1, .44]].map(([a, b]) => [x + a * r, y + b * r]), '#FFFFFF', { ink: null, key: key + 'k', lift: 0, flatCard: true, edge: false });
    }
    const happy = (seed, e = 'happy') => ({ ...feel(e, 1.3 + seed, { seed }), emote: null });
    P.art = (t, titled) => {
      const C = window.CHORUS, CR = C.CR, tt = 0;
      look('card');
      boilSeed('tr bg'); piece(rect(-40, -40, W + 40, H + 40), '#211E26', { ink: null, key: 'trbg', lift: 0, edge: false });
      camBegin(...P.cam);
      // the carriage behind (the night outside, the wall, the racks' sleepers, the next-stop boards lit for home, the bot
      // passengers in the far seats); bay 0's seats are the crew's
      C.carriageBack(tt, 0, { still: true, nightT: 2.3, boards: true, crowd: { level: 1, skip: [-1, 0, 1], sillSkip: [-1, 0, 1], rackSkip: [-1, 1] } });
      // the racks: Codex pets stowing passengers' bags (the porters, chorus.js rackPorter)
      for (const [x, kind, f] of [[330, 'seedy', 1], [1590, 'fireball', -1]]) {
        const y = 244; boilSeed('trrk' + kind);
        const A = codex(x, y, 26, { ...happy(x * .01, 'proud'), kind, view: 'q', flip: f < 0, boilKey: 'trrk' + kind, noShadow: true, pose: { L: [-.9, -5.2, .2, 'hold', 1], R: [.9, -5.2, .2, 'hold', 1] } });
        const h = A && A.hands; if (h && h.L && h.R) suitcase((h.L[0] + h.R[0]) / 2, (h.L[1] + h.R[1]) / 2 - 2, 13, 'trcase' + kind);
      }
      // Codey on bay -1's sill, squeegeeing the glass (the clean track shining behind it)
      { const x = 340, y = CR.WT + CR.WH + 16, u = 30, sh = [x + 16, y - 70], b = -1.3, R = 64, hx = sh[0] + Math.cos(b) * R, hy = sh[1] + Math.sin(b) * R;
        boilSeed('trcln');
        for (const [ox, oy, L, w] of [[-8, 0, 34, 10], [22, 7, 20, 6]]) { const gx = sh[0] + 40 + ox, gy = sh[1] - 60 + oy; piece([[gx - L, gy + L], [gx - L + w, gy + L], [gx + L + w, gy - L], [gx + L, gy - L]], '#C8D4F0', { ink: null, key: 'trst' + ox, lift: 0, flatCard: true, edge: false }); }
        codex(x, y, u, { ...happy(2, 'proud'), kind: 'codey', view: 'q', pose: { R: [(hx - x) / u, (hy - y) / u, .2, 'hold', 1, b + Math.PI / 2] }, hold: s => squeegeeProp(s, 'trsqg'), boilKey: 'trcodey', noShadow: true }); }
      // the seats: Grok with canapés and a pet dusting (left), the Gemini twins with the tea (right of the pole), Copilot
      // the inspector up on bay 1's seat, punching a ticket
      grok(960 - 290, CR.SY - 6, 24, { ...happy(7), view: 'q', pose: 'serve', tray: 'canapes', boilKey: 'trgrok' });
      codex(960 - 660 + 190, CR.SY - 6, 27, { ...happy(5), kind: 'bsod', view: 'q', pose: { R: [2.2, -3.4, .25, 'hold', 1] }, hold: s => dusterProp(s, 'trdust'), boilKey: 'trbsod' });
      gemini(960 + 215, CR.SY - 6, 24, { ...happy(4), view: 'q', flip: true, face: 'same', lanyard: false, pose: { O: [-2.5, -4.2, .2, 'hold', 1], I: 'join' }, hold: s => teaProp(s * 1.5, 'trtea'), holdL: s => teaProp(s * 1.5, 'trteaL'), boilKey: 'trgem' });
      { const x = 960 + 660 - 215, y = CR.SY - 8, A = copilot(x, y, 26, { ...happy(1, 'proud'), view: 'q', flip: true, pose: { L: [2.3, -4.7, .25, 'hold', 1], R: [3.1, -6.0, .2, 'hold', 1] }, lookX: .6, lookY: -.2, boilKey: 'trcop', seed: 2 });
        const tk = A && A.hands && A.hands.R, pk = A && A.hands && A.hands.L;
        if (tk) { boilSeed('trtk'); push(); translate(tk[0], tk[1] + 4); ticketProp(16, 'trtk'); pop(); }
        if (tk && pk) { boilSeed('trpk'); push(); translate(pk[0], pk[1]); rotate(Math.atan2(tk[1] - 16 - pk[1], tk[0] - pk[0]) + Math.PI / 2); punchProp(14, .6, 'trpch'); pop(); }
        if (A && A.top) doneTick(A.top[0] + 8, A.top[1] - 34, 'trtick1'); }
      C.carriageFront(tt, 0, { crowd: { level: 1, skip: [-1, 0, 1] } });
      // the pole, the two of them at it: her hand on it at her brow, his below hers; deadpan, to us. Her other hand holds
      // up her Muse: the Muse Charm, Jolly on its screen typing away (verse1.js: upright on her fist, her thumb on its rim)
      boilSeed('tr pole'); piece(rect(P.pole - 9, 40, P.pole + 9, 1300), '#C8CCD2', { sw: 1.4, rim: '#FFFFFF', key: 'trpole', lift: 6 });
      const flat = { emote: null, mouth: 'flat' };
      { const [x, y, u] = P.him, g = [(x - P.pole) / u - .35, -8.4, .5, 'fist', 1, -1.45, 'u'];
        person(x, y, u, HIM_C, { ...feel('bored', 0, { seed: 6 }), ...flat, eyes: 'narrow', lookX: .3, lookY: .04, view: 'q', flip: true, pose: { L: [-1.2, 2.5, .15, 'relax'], R: g }, idle: 0, blink: 0, sing: false, boilKey: 'trhim', seed: 6 }); }
      { const [x, y, u] = P.her, g = [(P.pole - x) / u + .45, -16.2, .3, 'fist', 1, -1.6, 'u'], Mw = btMat(), CHS = 1.75 * u;
        const holdCharm = s => { push(); btUpright(Mw); rotate(-.06); translate(-.1 * s, -.53 * CHS); museCharm(0, 0, CHS, { ...feel('happy', 1.1), emote: null, t: 1.1, turn: .2, boilKey: 'trcharm', frame: Mw }); pop(); };
        person(x, y, u, HER_C, { ...feel('bored', 0, { seed: 3 }), ...flat, eyes: 'narrow', lookX: -.28, lookY: .04, view: 'q', pose: { L: [.9, -10.4, .6, 'fist', 1, -1.15, 'u'], R: g }, holdL: holdCharm, idle: 0, blink: 0, sing: false, boilKey: 'trher', seed: 3 }); }
      // in the aisle, nearest us: Clawd with a pillow it's plumping for someone (left); Jolly with a tray of flutes (right)
      { const x = 470, y = 1085, u = 21; boilSeed('trclawd');
        clawd2(x, y, u, { ...happy(9), view: 'q', pose: 'cheer', boilKey: 'trclawd' });
        boilSeed('trclawdtray'); btTray(x + .3 * u, y - 8.25 * u, 7.4 * u, null, 1.4, 'trcltray');   // (the tea, balanced on its flat top)
        for (const dx of [-1.7, 1.6]) { boilSeed('trcltea' + dx); push(); translate(x + (.3 + dx) * u, y - 8.3 * u); teaProp(u * .85, 'trcltea' + dx); pop(); }
        doneTick(x + 6.4 * u, y - 11.4 * u, 'trtick2'); }
      muse(1470, 1110, 27, { ...happy(11), view: 'q', flip: true, pose: 'tray', tray: 'flutes', boilKey: 'trmuse' });
      camEnd();
    };
  }
  // the title as an advertising panel above the windows (a card strip, as the promise's), the artist on its own slip
  design('train', (t, titled) => TR.art(t, titled), c => cardTitle(c, { ...TR.TITLE, artist: TR.ARTIST }));

  // =====================================================================================================================
  // WORLDS: the five worlds (Z1's chase, video/ch/final.js, with the fifth medium as a panel of its own). The frame split
  // into five panels, in the film's story's order: the past's naive promise (rubber hose), the present (card), money
  // and power (banknote), the bad future (riso), the good future (her notebook's doodle); the seams printed like a note's
  // border. The two of them walk together out of the bad future into the good one, he a stride ahead, already half in her
  // drawing; she glances back, dry, at the eager crew trailing after them through the worlds: the ad's robot butler with
  // his cocktail, Clawd with the Gemini twins riding on its back, Copilot in its cheap disguise as her holding up her
  // leaving card, Jolly with the flutes, Codey at her heels. One group on one world path: each panel draws its own cast
  // of it, cut hard at the seams (the divider is the change). Lettering: the title a word to a world, each in its own
  // medium's letters (the ink's Deco plaque, a card strip, an engraved banderole, a riso slip), and the artist signing
  // her drawing in biro.
  // Laid out per format (the page's ?fmt=, COVER.fmt; WD.LAYOUT): each figure is drawn as on the 4:3 cover and placed by
  // a scale about its ground point, each world by a map from its 1080-frame units to the frame.
  //   4x3   the album cover (1920×1440): the five panels side by side
  //   1x1   square (1920×1920, written 3000×3000): the same five panels, taller: the cast 1.2× and lower, each world
  //         scaled with it, the title higher, in more sky
  //   9x16  portrait (1080×1920, Suno's): the past, the present and money as three bands down the page, each with its
  //         part of the crew walking across it on the right and its word of the title on the left; the bottom half split
  //         as the cover's last two panels, the bad future | her drawing, the two of them big, walking out of the one
  //         into the other, SAVED above them, the signature on her page. The title reads down a column on the left.
  //         (Not a diagonal: parallel slanting bands leave the past and her drawing as corner wedges too small for the
  //         butler and the two of them, and slanting seams cut the figures across instead of meeting them as they walk.)
  //   16x9  landscape (1920×1080, written 3840×2160: YouTube's title card and thumbnail, which must read at 320×180): the
  //         five panels, shorter, their widths eased to the words (the ink narrower, the riso wider) so the title fills
  //         the tops larger; the cast cropped at the shins, the crew raised with their worlds to fill the middle, the two
  //         of them nearer and bigger, the signature on her page's top in the title's row (the bottom-right corner, where
  //         YouTube prints the video's length, is only grass and his coat)
  // =====================================================================================================================
  const WD = { PW: 384, S: 4 / 3, GB: 1196, GH: 1250 };
  WD.PANEL = [['ink', 0], ['card', 1], ['bank', 2], ['xerox', 3], ['doodle', 4]].map(([lk, i]) => ({ lk, x0: i * WD.PW, x1: (i + 1) * WD.PW }));
  WD.TITLE_Y = 196;
  {
    const P = WD, rect = R4, S = P.S;
    const PAPER = '#FBF8F0', RULE = '#9DB7DC';
    // Each panel's world, in the film's 1080-frame units (the caller maps them to the frame): R the region to cover
    // ({ x0, x1, y0, y1 }); o where its landmarks go (by default the 4:3 cover's, in a strip 288 wide from x0).
    function back(lk, R, o = {}) {
      const { x0, x1 } = R, w = x1 - x0, f = Math.abs(w - 288) < 1e-6 ? 1 : w / 288, y0 = Math.min(-60, R.y0), y1 = Math.max(1200, R.y1);
      look(lk);
      if (lk === 'ink') {   // the ad's garden: its sky, the grinning sun, the hills, the fence, the lawn
        const [sx, sy, ss] = o.sun || [x0 + 150 * f, 395, .78];
        const sun = () => { push(); translate(sx, sy); scale(ss); translate(-PSX.sun[0], -PSX.sun[1]); psSun(.2); pop(); };
        if (R.y0 < -150) { boilSeed('wd sky'); piece(rect(x0 - 40, R.y0 - 20, x1 + 40, -140), PS.skyHi, { ink: null, lift: 0, key: 'wdsky' }); }
        psSky(); if (o.sunLow) sun();   // (low: rising behind the hills)
        psHills(.2); psFence(); psLawn(); if (!o.sunLow) sun();
      } else if (lk === 'card') {   // the night by the line (Z1): houses with lit windows, a sodium lamp
        boilSeed('wd night');
        piece(rect(x0 - 40, y0, x1 + 40, 780), '#141A2A', { ink: null, key: 'wdpn', lift: 0, flatCard: true, edge: false });
        for (let k = 0, n = Math.max(3, Math.ceil((w + 60) / 150)); k < n; k++) { const hx = x0 - 30 + k * 150, h = 170 + 60 * hash(k + 4); piece([[hx, 780], [hx, 780 - h], [hx + 70, 780 - h - 60], [hx + 140, 780 - h], [hx + 140, 780]], '#1C2233', { ink: null, key: 'wdph' + k, lift: 0, flatCard: true, edge: false }); if (k % 3 !== 1) { piece(rect(hx + 50, 780 - h + 30, hx + 90, 780 - h + 76), '#E8B85A', { ink: null, key: 'wdphw' + k, lift: 0, flatCard: true, edge: false }); glow(hx + 70, 780 - h + 52, 60, '#FFB45E', .5); } }
        piece(rect(x0 - 40, 760, x1 + 40, y1), '#2A2630', { ink: null, key: 'wdpg', lift: 0, edge: false });
        piece(rect(x0 - 40, 760, x1 + 40, 790), '#3A3440', { sw: 1.2, key: 'wdpk', lift: 3 });
        (o.lamps || [[x0 + 225 * f, 240]]).forEach(([lx, ly], i) => {
          const q = i || '';
          piece(rect(lx - 5, ly, lx + 5, 780), '#0C0E14', { ink: null, key: 'wdlamp' + q, lift: 2, flatCard: true }); piece(curvy(rect(lx - 30, ly - 12, lx + 6, ly + 6), 2), '#0C0E14', { ink: null, key: 'wdlh' + q, lift: 2, flatCard: true });
          glow(lx - 12, ly + 12, 170, '#FFB45E', .8); glow(lx - 12, ly + 12, 40, '#FFE0A0', .9);
        });
        const [sy0, sy1] = o.starY || [40, 190];
        for (let i = 0, n = o.stars ?? 9; i < n; i++) { const sx = x0 + 20 + hash(i * 3.1) * (w - 28), sy = sy0 + hash(i * 7.3) * (sy1 - sy0); piece(starPts(sx, sy, 5 + 3 * hash(i), .35, 4), '#E8DDB8', { ink: null, key: 'wdstar' + i, lift: 0, flatCard: true, edge: false }); }
      } else if (lk === 'bank') {   // money: a strip of the note itself (its security paper, a medallion, rosettes, bands)
        const cx = (x0 + x1) / 2, T = NT.TINT, gold = () => mixCol(BANK.ink, mixCol(desat(T.gold, .7), '#16121A', .22), .6), rose = () => mixCol(BANK.ink, mixCol(desat(T.rose, .7), '#16121A', .22), .6);
        bankPaper(x0 - 40, y0, w + 80, y1 - y0);
        boilSeed('wd note');
        for (const bx of o.vbands || [x0 + 22, x1 - 22]) NT.band([bx, y0 + 20], [bx, y1], 26, { n: 6, wl: 36, col: gold });
        for (const [rx, ry, r] of o.ros || [[cx, 400, 118]]) NT.rosette(rx, ry, r, { c1: T.gold, c2: T.green });
        for (const [rx, ry, r] of o.ros2 || [[cx, 250, 22]]) NT.rosette(rx, ry, r, { n1: 8, lobes1: 12, n2: 6, lobes2: 6, c1: T.blue, c2: T.rose });
        for (const [ha, hb, hy] of o.hbands || [[x0 + 50, x1 - 50, 720]]) NT.band([ha, hy], [hb, hy], 30, { n: 9, wl: 64, w: .55, col: rose });
        // the floor they run over: a fine ruled tint, a rule at its edge
        const fy = o.floor ?? 850, F = rect(x0 - 40, fy, x1 + 40, y1); _paint(F, { wash: BANK.paper, ink: null }); waveLines(F, 7, 0, 1.5, 180, mixCol(BANK.ink, BANK.paper, .55), .6);
        _inkLine([[x0 - 40, fy], [x1 + 40, fy]], 1.4, BANK.ink, 'rotring', 0);
      } else if (lk === 'xerox') {   // the bad future (Z1): the riso street, roofs, the stack's smoke
        boilSeed('wd riso');
        _paint(rect(x0 - 40, y0, x1 + 40, y1), { wash: XEROX.paper, ink: null });
        piece(rect(x0 - 40, y0, x1 + 40, 540), '#7A6AA8', { key: 'wdrs', ink: null });
        const sx = o.stack ?? x0 + 190 * f;
        piece([[sx, 540], [sx + 12, 170], [sx + 60, 170], [sx + 72, 540]], '#1E2C6A', { key: 'wdrstack', sw: 1.2 });
        for (let k = 0; k < 4; k++) { const ph = frac(k * .25 + .1), r = 30 + 60 * ph; piece(oval(sx + 36 - 90 * ph, 150 - 200 * ph, r, r * .8, 0, 20), '#1A2458', { key: 'wdrp' + k, ink: null }); }
        const roof = [[x0 - 40, 580]]; for (let k = 0, n = Math.max(5, Math.ceil((w + 80) / 90)); k <= n; k++) { const rx = x0 - 40 + k * 90; roof.push([rx, 540 - (k % 2) * 40], [rx + 20, 540 - (k % 2) * 40]); } roof.push([x1 + 40, 540], [x1 + 40, 780], [x0 - 40, 780]);
        piece(roof, '#D06A5C', { key: 'wdrr', sw: 1.2 });
        for (let k = 0, n = o.nwin ?? Math.max(3, Math.ceil((w - 70) / 110) + 1); k < n; k++) piece(rect(x0 + 20 + k * 110, 620, x0 + 70 + k * 110, 700), k % 2 ? '#FFE04A' : '#22367A', { key: 'wdrw' + k, sw: 1 });
        piece(rect(x0 - 40, 780, x1 + 40, y1), '#86A8D8', { key: 'wdrg', sw: 1.2 });
      } else {   // the good future (Z1): her notebook page, a sun, green hills, the two trees with a hammock waiting
        boilSeed('wd doodle');
        _paint(rect(x0 - 40, y0, x1 + 40, y1), { wash: PAPER, ink: null });
        for (let y = o.rule0 ?? 130; y < y1; y += 40) _inkLine([[x0 - 40, y], [x1 + 40, y + .3]], .6, RULE, 'rotring', 0);
        const [dx, dy] = o.dsun || [x0 + 200 * f, 180];
        piece(oval(dx, dy, 56, 56, 0, 24), '#FFC928', { sw: 1.6, key: 'wdds' });
        for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + .3; _inkLine([[dx + Math.cos(a) * 66, dy + Math.sin(a) * 66], [dx + Math.cos(a) * 88, dy + Math.sin(a) * 88]], 2.4, vivid('#F2B02A'), 'cpencil', 0); }
        piece(curvy([[x0 - 60, 820], [x0 - 60, 660], ...(o.hills || [[x0 + 120 * f, 610], [x0 + 250 * f, 650]]), [x1 + 60, 620], [x1 + 60, 820]], 5), '#6BC46A', { sw: 1.6, key: 'wddh', side: false });
        piece(rect(x0 - 60, 760, x1 + 60, y1), '#8FD47A', { sw: 1.4, key: 'wddg', side: false });
        const [t0, t1] = o.trees || [x0 + 60 * f, x0 + 250 * f];
        for (const tx of [t0, t1]) { edgeLine([[tx, 760], [tx, 490]], 2.4, BIRO, false); piece(oval(tx, 460, 70, 60, 0, 20), '#3E9A5A', { sw: 1.5, key: 'wddt' + tx }); }
        edgeLine([[t0, 580], [(t0 + t1) / 2, 650], [t1, 580]], 3, BIRO, false, .6);
        const [fx, fdx, fn, fy] = o.flowers || [x0 + 20, 64, 5, 1110];
        for (let k = 0; k < fn; k++) piece(oval(fx + k * fdx, fy + 30 * (k % 2), 9, 9, 0, 12), ['#FF6FA8', '#FFC928', '#9A8BFF'][k % 3], { sw: 1, key: 'wddf' + k, flatCard: true });
      }
    }
    // Copilot wears her look, cheaply (final.js chDisguised): her tomato for its flight suit, her cream for its scarf
    function disguised(fn) {
      const k = ['suit', 'suitDk', 'suitLt', 'her', 'herDk'], s0 = k.map(f => B2CP[f]);
      Object.assign(B2CP, { suit: PP_TOMATO.coat, suitDk: PP_TOMATO.coatDk, suitLt: PP_TOMATO.coatLt, her: HER_C.col.scarf, herDk: HER_C.col.scarfDk });
      try { return fn(); } finally { k.forEach((f, i) => { B2CP[f] = s0[i]; }); }
    }
    // The chase, as on the 4:3 cover: x its ground point there (its drawings boil on it), w its half-width (the note's
    // halo round it), draw(x, o) (o: a layout's changes to the rig's options). The bots run at the stride's phase ph.
    const ph = .3, sw = Math.sin(ph * TAU), E = (seed, e = 'excited') => ({ ...feel(e, 1.2 + seed, { seed }), emote: null, mouth: 'smile', lookX: 1, blink: 0, idle: 0 });
    const HER_W = { ...HER_C, body: { ...HER_C.body, stride: .36 } }, HIM_W = { ...HIM_C, body: { ...HIM_C.body, stride: .36 } };
    const CAST = {
      butler: { x: 150, w: 200, draw: (x, o) => {   // the ad's robot butler, mirrored to run right, the tray and cocktail held out (final.js chButler)
        const u = 34, gy = P.GB + 6, w = ph + .5, php = w * TAU;
        push(); translate(x, 0); scale(-1, 1); translate(-x, 0); const pX = XF; XF = -XF;
        try { psRobot(x, gy, u, { walk: w, walkW: 1, dy: -.55 * Math.abs(Math.sin(php)), rot: -.12, turn: 0, look: [-.9, -.15], grin: .9, tray: [x - 5.5 * u, gy - 9.6 * u + 6 * Math.sin(php)], trayGlass: true, antenna: .3, bulb: .6, htilt: .02, hdy: .05, gauge: 2, ...o }); }
        finally { XF = pX; pop(); } } },
      // (Copilot before Clawd: it runs a lane behind Clawd, its scarf streaming behind it, not across Clawd's face)
      copilot: { x: 742, w: 150, draw: (x, o) => {   // Copilot, disguised as her, holding up her leaving card ("you forgot this!")
        const u = 40, hold = s => { push(); rotate(.95); translate(s * .1, -s * 1.15); rotate(-.12 + .06 * sw); b2LeavingCard(s * 2.3, 'wdlcard', .9); pop(); };
        disguised(() => copilot(x, P.GB - 4, u, { ...E(3), view: 'q', walk: ph, dy: -.35 * Math.abs(sw), disguise: true, rot: .1, pose: { L: [-1.7 - .5 * sw, -3.0, .3, 'fist'], R: [2.9, -5.6 + .2 * sw, .15, 'hold', 1] }, hold, boilKey: 'wdcop', ...o })); } },
      clawd: { x: 548, w: 170, draw: (x, o) => {   // Clawd, the twins riding on its back, hand in hand (A waving, B reaching ahead: "wait!")
        const u = 27, y = P.GB;
        clawd2(x, y, u, { ...E(1), view: 'q', walk: ph, dy: -.35 * Math.abs(sw), aL: 1.1 + .25 * sw, aR: 1.1 - .25 * sw, rot: .05, boilKey: 'wdclawd', ...o });
        gemini(x - 14, y - 7.7 * u - .35 * Math.abs(sw) * u, 31, { ...E(2, 'happy'), view: 'q', pose: { O: [-2.35, -4.6, .25, 'open'], I: 'join', OB: [-2.6, -2.5, .2, 'open'] }, rot: -.04, noShadow: true, boilKey: 'wdgem' }); } },
      jolly: { x: 962, w: 130, draw: (x, o) => muse(x, P.GB - 44, 36, { ...E(4, 'happy'), view: 'q', rot: .14, pose: 'tray', tray: 'flutes', boilKey: 'wdmuse', ...o }) },
      codey: { x: 1180, w: 90, draw: (x, o) => codex(x, P.GB + 44, 44, { ...E(6), kind: 'codey', view: 'q', pose: 'run', boilKey: 'wdcodey', ...o }) },
      // the two of them: he a stride ahead and nearer, stepping into her drawing; she glances back at the crew, dry
      her: { x: 1330, w: 110, draw: (x, o) => person(x, P.GH - 10, 44, HER_W, { ...feel('neutral', 0, { seed: 1 }), emote: null, mouth: 'smirk', lookX: -.95, lookY: .1, view: 'q', walk: .62, rot: .04, idle: 0, blink: 0, sing: false, boilKey: 'wdher', ...o }) },
      him: { x: 1575, w: 180, draw: (x, o) => person(x, P.GH + 14, 48, HIM_W, { ...feel('happy', 0, { seed: 2 }), emote: null, mouth: 'smile', lookX: 1, lookY: -.1, view: 'q', walk: .14, rot: .05, idle: 0, blink: 0, sing: false, boilKey: 'wdhim', ...o }) },
    };
    const ORDER = ['butler', 'copilot', 'clawd', 'jolly', 'codey', 'her', 'him'];
    // ---- the layouts ----
    // a panel: its world lk, clipped to the polygon Q, its world mapped to the frame by bt = [tx, ty, s] (frame = t + s ×
    // world units), o its landmarks (back(); or titled => them, where the lettering covers some)
    const panel = (lk, Q, bt, o = {}) => { const xs = Q.map(p => p[0]), ys = Q.map(p => p[1]), [tx, ty, s] = bt; return { lk, Q, bt, o, R: { x0: (Math.min(...xs) - tx) / s, x1: (Math.max(...xs) - tx) / s, y0: (Math.min(...ys) - ty) / s, y1: (Math.max(...ys) - ty) / s } }; };
    // a seam: a note's border along the line from O in the unit direction d, t0..t1 along it (key: what it boils on)
    const seam = (O, d, t0, t1, key) => ({ O, d, t0, t1, key });
    // cast: id → { pan (the panels it's drawn in), at: [X, Y, k] (its 4:3 ground point (x, GB) goes to (X, Y), scaled k), o }
    // title: at (the four words' centres), q (their size against the 4:3 cover's); sig: the signature (x, y, q, rot);
    // riso: her height on screen (the riso panel's dot screen: RISO_SHOTS)
    const COVER43 = { butler: 'ink', copilot: 'card bank', clawd: 'card bank', jolly: 'bank', codey: 'bank xerox', her: 'xerox', him: 'xerox doodle' };
    const LAYOUT = {
      '4x3': () => ({
        panels: P.PANEL.map(pn => panel(pn.lk, rect(pn.x0, -10, pn.x1, H + 10), [0, 0, S])),
        seams: P.PANEL.slice(1).map(pn => seam([pn.x0, 0], [0, 1], -20, H + 20, pn.x0)),
        cast: Object.fromEntries(ORDER.map(id => [id, { pan: COVER43[id] }])),
        title: { at: [0, 1, 2, 3].map(i => [(i + .5) * P.PW, P.TITLE_Y]), q: 1 },
        sig: { x: 1536 + P.PW / 2, y: 1368, q: 1, rot: -.035 },
        riso: 760,
      }),
      // square: the cover's panels 1920 tall; the cast and their worlds 1.2× about the ground, which drops to 1650
      '1x1': () => {
        const k = 1.2, Y = 1650, s = S * k, ty = Y - k * P.GB;
        const O = { doodle: { rule0: -90 } };
        return {
          panels: P.PANEL.map(pn => panel(pn.lk, rect(pn.x0, -10, pn.x1, H + 10), [0, ty, s], O[pn.lk])),
          seams: P.PANEL.slice(1).map(pn => seam([pn.x0, 0], [0, 1], -20, H + 20, pn.x0)),
          cast: Object.fromEntries(ORDER.map(id => [id, { pan: COVER43[id], at: [CAST[id].x + (id === 'butler' ? -55 : 0), Y, k] }])),   // (the butler a step back: his cocktail clear of the seam)
          title: { at: [0, 1, 2, 3].map(i => [(i + .5) * P.PW, 215]), q: 1.05 },
          sig: { x: 1536 + P.PW / 2, y: H - 64, q: 1.05, rot: -.035 },
          riso: 760 * k,
        };
      },
      // portrait: three bands (the past, the present, money: the crew on the right, the words on the left), then the
      // bad future | her drawing, the two of them big (each band's world at its own scale, its ground under its cast)
      '9x16': () => {
        const B = [0, 330, 630, 930], MID = 540, kp = .72, sp = S * kp, Yp = 1815 - kp * 54;   // (the pair: her heel on ~1808)
        const band = (s, feet) => [0, feet - s * 897, s];   // (a band's world at scale s, its street (897) under the band's feet)
        return {
          panels: [
            panel('ink', rect(-10, -10, W + 10, B[1]), [120, 312 - .8 * 800, .8], titled => ({ sun: titled ? [560, 520, .5] : [230, 505, .55], sunLow: true })),
            panel('card', rect(-10, B[1], W + 10, B[2]), band(.62, 604), { lamps: [[905, 490]], stars: 0 }),
            panel('bank', rect(-10, B[2], W + 10, B[3]), band(.62, 904), titled => ({ vbands: [], ros: [[titled ? 905 : 420, 600, 92]], ros2: [], hbands: [] })),
            panel('xerox', rect(-10, B[3], MID, H + 10), [0, 1815 - sp * 930, sp], { stack: 440 }),
            panel('doodle', rect(MID, B[3], W + 10, H + 10), [0, 1815 - sp * 930, sp], {}),
          ],
          seams: [seam([MID, 0], [0, 1], B[3], H + 20, 'v'), ...[1, 2, 3].map(i => seam([0, B[i]], [1, 0], -20, W + 20, 'h' + i))],
          cast: {
            butler: { pan: 'ink', at: [790, 309, .52] },
            copilot: { pan: 'bank', at: [690, 904, .6] },
            clawd: { pan: 'card', at: [810, 604, .6] },
            jolly: { pan: 'bank', at: [935, 904, .6] },
            codey: { pan: 'xerox', at: [200, Yp, kp] },
            her: { pan: 'xerox', at: [392, Yp, kp], o: { lookX: -.7, lookY: -.35 } },
            him: { pan: 'xerox doodle', at: [392 + kp * 245, Yp, kp] },
          },
          title: { at: [[270, 165], [270, 480], [270, 780], [270, B[3] + 94]], q: 1.35 },
          sig: { x: 830, y: H - 40, q: 1.25, rot: -.035 },
          riso: 760 * kp,
        };
      },
      // landscape (YouTube's): the panels' edges eased to the words (the plates 1.18×, clear of the seams); the crew at
      // the cover's size, cropped at the shins, the present and money raised 120 with their worlds, Codey on money's
      // floor; the two of them 1.2×; the signature at the top of her page (the bottom-right corner: grass and his coat)
      '16x9': () => {
        const E = [0, 370, 748, 1124, 1536, W], k = 1, Y = 1130, s = S * k, ty = Y - k * P.GB, kp = 1.2, Yp = 1310;
        const up = { card: 120, bank: 120 }, lift = { copilot: 120, clawd: 120, jolly: 120 }, pair = { her: 1, him: 1 };
        const bt = lk => [0, ty - (up[lk] || 0), s], w = (lk, x, y) => [(x - bt(lk)[0]) / s, (y - bt(lk)[1]) / s];   // (a frame point in lk's world)
        const mx = (E[2] + E[3]) / 2;
        const O = {
          card: { lamps: [w('card', E[1] + 300, 254)], starY: [120, 330] },
          bank: titled => ({ ros: [[...w('bank', mx, 440), 85]], ros2: titled ? [] : [[...w('bank', mx, 150), 22]] }),
          doodle: titled => ({ dsun: w('doodle', E[4] + 267, titled ? 330 : 230) }),
        };
        return {
          panels: ['ink', 'card', 'bank', 'xerox', 'doodle'].map((lk, i) => panel(lk, rect(E[i] - (i ? 0 : 10), -10, E[i + 1] + (i === 4 ? 10 : 0), H + 10), bt(lk), O[lk])),
          seams: [1, 2, 3, 4].map(i => seam([E[i], 0], [0, 1], -20, H + 20, E[i])),
          cast: { ...Object.fromEntries(ORDER.map(id => [id, { pan: COVER43[id], at: [CAST[id].x, pair[id] ? Yp : Y - (lift[id] || 0), pair[id] ? kp : k] }])),
            butler: { pan: 'ink', at: [CAST.butler.x - 12, Y, k] }, codey: { pan: 'bank', at: [1030, Y - 60, k] } },
          title: { at: [0, 1, 2, 3].map(i => [(E[i] + E[i + 1]) / 2, 128]), q: 1.18 },
          sig: { x: (E[4] + E[5]) / 2, y: 150, q: 1, rot: -.035 },
          riso: 760 * kp,
        };
      },
      // the README's banner (3:1, the user: "a banner to go at the top of the README"): 16:9's worlds and cast scaled by
      // BAN.f about each panel's centre and set on a ground at BAN.g (so every face fits the strip under the title, which
      // stays a row across the top at full size)
      banner: () => {
        const B = LAYOUT['16x9'](), E = [0, 370, 748, 1124, 1536, 1920], LK = ['ink', 'card', 'bank', 'xerox', 'doodle'], f = BAN.f, G = 1130;
        const cxOf = lk => { const i = LK.indexOf(lk); return (E[i] + E[i + 1]) / 2; };
        const up = lk => BAN.up[lk] || 0, upW = lk => BAN.upW[lk] ?? up(lk);
        const panels = B.panels.map(pn => { const cx = cxOf(pn.lk); return { ...pn, bt: [cx * (1 - f) + f * pn.bt[0], BAN.g - upW(pn.lk) - G * f + f * pn.bt[1], f * pn.bt[2]] }; });
        const cast = Object.fromEntries(Object.entries(B.cast).filter(([id]) => !BAN.omit.includes(id)).map(([id, c]) => { const lk = c.pan.split(' ')[0], cx = cxOf(lk), [X, Y, k] = c.at, [nx, ny] = BAN.nudge[id] || [0, 0];
          return [id, { ...c, at: [cx + f * (X - cx) + nx, BAN.g - up(lk) + f * (Y - G) + ny, k * f] }]; }));
        return { ...B, panels, cast, title: { at: B.title.at.map(([x]) => [x, BAN.ty]), q: BAN.q }, sig: { ...B.sig, y: BAN.ty + 12 }, riso: B.riso * f };
      },
    };
    const BAN = { f: .7, g: 820, ty: 88, q: 1.02, up: { card: 110, bank: 70, doodle: 90 }, upW: { doodle: 20 }, nudge: { copilot: [125, 0], him: [150, 0] }, omit: ['codey'] };   // (up: a panel's world and cast raised; upW: its world alone; nudge: a figure moved; omit: left out, Codey's only a fragment in the strip)   // (the banner: its scale on 16:9, its ground (off the strip's bottom), the title row)
    P.LAYOUT = LAYOUT;
    P.L = (LAYOUT[COVER.fmt] || LAYOUT['4x3'])();
    RISO_SHOTS.COVER_W = { h: P.L.riso };   // (the riso panel's dot screen, sized to her: RISO_N)
    // draw a figure at its place in the layout (the 4:3 cover's own place: as it was)
    function placed(c, fn) {
      const [X, Y, k] = c.at || [c.x, P.GB, 1];
      if (X === c.x && Y === P.GB && k === 1) return fn();
      push(); translate(X, Y); scale(k); translate(-c.x, -P.GB); try { return fn(); } finally { pop(); }
    }
    P.art = (t, titled) => {
      const L = P.L, cast = ORDER.filter(id => L.cast[id]).map(id => ({ ...CAST[id], ...L.cast[id] }));
      for (const pn of L.panels) {
        clipPoly(pn.Q, () => {
          push(); translate(pn.bt[0], pn.bt[1]); scale(pn.bt[2]); back(pn.lk, pn.R, typeof pn.o === 'function' ? pn.o(titled) : pn.o); pop();
          look(pn.lk);
          if (pn.lk === 'xerox') RISO_SHOT.push('COVER_W');
          const here = cast.filter(c => c.pan.includes(pn.lk));
          if (pn.lk === 'bank') for (const c of here) placed(c, () => bankHalo(c.x, c.hy ?? P.GB - 130, c.w * 1.25, 190, .8));
          for (const c of here) { look(pn.lk); boilSeed('wdc' + c.x); placed(c, () => c.draw(c.x, c.o)); }
          if (pn.lk === 'xerox') { xeroxGrit(0, .5); RISO_SHOT.pop(); }
        });
      }
      // the seams: banknote borders (guilloche bands), the money in every one of them
      const b0 = { ...BANK }; look('bank');
      for (const { O, d, t0, t1, key } of L.seams) {
        const at = (u, t) => [O[0] + u * d[1] + t * d[0], O[1] - u * d[0] + t * d[1]];
        boilSeed('wd seam' + key); piece([at(-10, t0), at(10, t0), at(10, t1), at(-10, t1)], '#E8EEE9', { sw: 1.2, key: 'wdseam' + key });
        for (let k = 0; k < 3; k++) { const Q = []; for (let t = t0; t <= t1; t += 8) Q.push(at(6 * Math.sin(t / 34 + k * 2.1), t)); for (let q = 0; q < Q.length - 1; q += 16) _inkLine(Q.slice(q, q + 17), .7, BANK.ink, 'rotring', .3); }
      }
      Object.assign(BANK, b0);
      look('card');
    };
  }
  // The title a word to a world, each in its medium's letters, one cap height (the 4:3 cover's, × the layout's q: each
  // word's plate drawn at the cover's size and scaled); the artist signs her drawing in biro (the good future's page).
  function worldsText(c) {
    const P = WD, L = P.L, words = COVER.title.toUpperCase().split(' '), kinds = ['ink', 'card', 'bank', 'xerox'];
    const FAM = { ink: ['400', 'Limelight, serif'], card: ['800', '"Shantell Sans", sans-serif'], bank: ['700', 'Cinzel, serif'], xerox: ['700', '"Space Grotesk", sans-serif'] };
    // one cap height for all four: the largest at which every word fits a 4:3 panel (with its plate's margins)
    let cap = 1e9; words.forEach((w, i) => { const [wt, fam] = FAM[kinds[i]], f = `${wt} 100px ${fam}`, k = 100 / capOf(f); cap = Math.min(cap, (P.PW - 118) / widthOf(w, f) * 100 / k); });
    words.forEach((w, i) => {
      const lk = kinds[i], [wt, fam] = FAM[lk], k100 = capOf(`${wt} 100px ${fam}`), size = cap * 100 / k100, font = `${wt} ${size.toFixed(1)}px ${fam}`, tw = widthOf(w, font);
      c.save(); c.translate(...L.title.at[i]); if (L.title.q !== 1) c.scale(L.title.q, L.title.q);
      if (lk === 'ink') {   // the 1930s title card: a dark Deco plaque, cream Limelight (karaoke.js kInk)
        const pw = tw + 80, ph = cap + 76;
        c.fillStyle = 'rgba(20,14,16,.35)'; kRR(c, -pw / 2 + 5, -ph / 2 + 7, pw, ph, 12); c.fill();
        kRR(c, -pw / 2, -ph / 2, pw, ph, 12); c.fillStyle = '#231D20'; c.fill();
        kInkFrame(c, pw, ph, KS.ink);
        c.font = font; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillStyle = KS.ink.text; c.fillText(w, 0, cap / 2);
        kRR(c, -pw / 2, -ph / 2, pw, ph, 12); c.clip();
        const g = kPattern(c, 'filmgrain', cv => kNoise(cv, 256, .22, '255,246,228', .04, .22, 17)); c.fillStyle = g; c.fillRect(-pw / 2, -ph / 2, pw, ph);
      } else if (lk === 'card') {   // a strip of cut card, cream lettering (karaoke.js kCard)
        kCardPiece(c, kCut(tw + 64, cap + 70, 31, 1.8, 90, 4), KS.card.card, KS.card.edge, 'l', 8);
        c.font = font; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillStyle = 'rgba(0,0,0,.3)'; c.fillText(w, 2, cap / 2 + 3); c.fillStyle = KS.card.text; c.fillText(w, 0, cap / 2);
      } else if (lk === 'bank') {   // an engraved banderole: paper, a fine underprint, guilloche edges, teal capitals (kBank)
        const bw = tw + 60, bh = cap + 62; c.strokeStyle = KS.bank.ink;
        kRR(c, -bw / 2, -bh / 2, bw, bh, 3); c.fillStyle = KS.bank.paper; c.fill();
        c.save(); kRR(c, -bw / 2, -bh / 2, bw, bh, 3); c.clip(); c.globalAlpha = .16; kLines(c, -bw / 2, bw / 2, -bh / 2 + 2, bh / 2, 4.2, 1.6, 26, .8); c.globalAlpha = .8;
        kGuilloche(c, -bw / 2 + 6, bw / 2 - 6, -bh / 2 + 4, -bh / 2 + 12, 4, 11, .75); kGuilloche(c, -bw / 2 + 6, bw / 2 - 6, bh / 2 - 12, bh / 2 - 4, 4, 11, .75); c.restore();
        kRR(c, -bw / 2, -bh / 2, bw, bh, 3); c.lineWidth = 2; c.stroke(); kRR(c, -bw / 2 + 4, -bh / 2 + 15, bw - 8, bh - 30, 2); c.lineWidth = .8; c.stroke();
        c.font = font; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.lineWidth = 1.1; c.strokeStyle = mixCol(KS.bank.ink, KS.bank.paper, .35); c.strokeText(w, 2.4, cap / 2 + 2.4); c.fillStyle = KS.bank.ink; c.fillText(w, 0, cap / 2);
      } else {   // a riso slip: the blue drum's text, the pink drum's block out of register, grit (kXerox)
        const sw2 = tw + 56, sh = cap + 60, P2 = kCut(sw2, sh, 7, .8, 160, 1.5);
        c.save(); c.translate(3, 4); kPath(c, P2); c.fillStyle = 'rgba(20,24,50,.3)'; c.fill(); c.restore();
        kPath(c, P2); c.fillStyle = KS.xerox.paper; c.fill();
        c.save(); kPath(c, P2); c.clip();
        c.fillStyle = KS.xerox.blue; c.fillRect(-sw2 / 2, -sh / 2 + 7, sw2, 2.4); c.fillRect(-sw2 / 2, sh / 2 - 9.4, sw2, 2.4);
        c.globalCompositeOperation = 'multiply'; c.fillStyle = KS.xerox.voice.F;
        kPath(c, [[-tw / 2 - 12 + 4, -cap / 2 - 14], [tw / 2 + 12 + 4, -cap / 2 - 16], [tw / 2 + 13 + 4, cap / 2 + 12], [-tw / 2 - 11 + 4, cap / 2 + 14]]); c.fill();
        c.font = font; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillStyle = KS.xerox.blue; c.fillText(w, 0, cap / 2);
        c.globalCompositeOperation = 'source-over'; c.fillStyle = 'rgba(241,236,223,.85)';
        for (let j = 0; j < 40; j++) { c.beginPath(); c.arc((kH(9, j) - .5) * tw, (kH(9, j + 300) - .5) * cap * 1.1, .6 + 1.3 * kH(9, j + 600), 0, TAU); c.fill(); }
        c.fillStyle = 'rgba(30,60,140,.5)'; for (let j = 0; j < 50; j++) { c.beginPath(); c.arc((kH(9, j + 900) - .5) * sw2, (kH(9, j + 1300) - .5) * sh, .4 + 1.1 * kH(9, j + 1700) ** 2, 0, TAU); c.fill(); }
        c.restore();
      }
      c.restore();
    });
    // the artist: her biro on the page, a signature with an underline (at the 4:3 cover's size × q)
    const { x, y, q, rot } = L.sig, G = fitFont(COVER.artist, P.PW - 70, '700', 'Caveat, cursive');
    c.save(); c.translate(x, y); c.rotate(rot); if (q !== 1) c.scale(q, q); c.font = G.font; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillStyle = BIRO; c.fillText(COVER.artist, 0, 0);
    c.strokeStyle = BIRO; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(-G.size * 2.3, 16); c.quadraticCurveTo(0, 26, G.size * 2.4, 10); c.stroke();
    c.restore();
  }
  design('worlds', (t, titled) => WD.art(t, titled), worldsText, ['4x3', '1x1', '9x16', '16x9', 'banner']);

  // =====================================================================================================================
  // TORN: the torn poster (C1f's box room, chorus.js). Her cheap riso copy of the 1930s ad, pinned on the box room's
  // wall, the ad's headline band across its top; she has ripped it open down the middle with both hands (her tomato
  // sleeves from below, her fists on the curled lips of the tear), and behind the promise is what they wanted: her Friday
  // (the doodle, a page from her notebook pinned under it: the two of them on the bean bags, laughing). The robot butler
  // and the gent in his hammock are left on the torn flaps. Lettering: the ad's own headline, in its period letters
  // (Limelight), printed by the riso: the blue drum, the pink drum out of register, drop-outs and toner grit.
  // =====================================================================================================================
  const TN = { SH: [58, 38, 1862, 1402], BAND: [58, 38, 1862, 322], PIC: { x0: 62, y0: 330, s: 1796 / 1920 }, FREEZE: 2.16, FRIDAY_AT: 6.1,
    HOLE: { cx: 900, y0: 400, y1: 1336, hw: 380 }, GRIP: [[-1, .66], [1, .63]], FRI: [58, 318, .92] };
  {
    const P = TN, rect = R4;
    RISO_SHOTS.COVER_T = { p: 4.5 };   // (the copy's dots belong to its paper, as C1f's)
    const onPic = fn => { push(); translate(P.PIC.x0, P.PIC.y0); scale(P.PIC.s); fn(); pop(); };
    // the tear: a lens-shaped hole ripped down the middle of the picture, its two jagged edges (top to bottom), pulled
    // apart at the middle where her hands are. q: 0..1 down the tear.
    const tearHW = q => P.HOLE.hw * Math.pow(Math.sin(Math.PI * q), .55);
    function edge(sd) {
      const E = [], n = 70;
      for (let i = 0; i <= n; i++) {
        const q = i / n, y = lerp(P.HOLE.y0, P.HOLE.y1, q), c = P.HOLE.cx + 26 * Math.sin(q * 5.1 + 1) + 12 * Math.sin(q * 13);
        const j = (hash(i * 7.31 + sd * 3.7) - .5) * 22 + (hash(i * 2.13 + sd) < .12 ? sd * 18 : 0);
        E.push([c + sd * (tearHW(q) + (q > .02 && q < .98 ? j : 0)), y]);
      }
      return E;
    }
    const L = edge(-1), R = edge(1), HOLE = [...L, ...R.slice().reverse()];
    // the curled lip along each edge: the paper pulled up off the wall toward us, its back showing, widest where she pulls
    function lip(E, sd) {
      const out = E.map(([x, y], i) => { const q = i / (E.length - 1), w = 12 + 70 * Math.pow(Math.sin(Math.PI * q), 1.4) * (1 + .25 * Math.sin(q * 9 + sd)); return [x + sd * w, y + 6 * Math.sin(Math.PI * q)]; });
      return [...E, ...out.reverse()];
    }
    P.art = (t, titled) => {
      look('card');
      // the box room's wall (her box room: its wallpaper and damp), the sheet pinned on it
      boilSeed('tn wall'); piece(rect(-40, -40, W + 40, H + 40), PRB.wall, { ink: null, key: 'tnwall', lift: 0, edge: false });
      for (let x = -30; x < W + 40; x += 120) piece(rect(x, -40, x + 46, H + 40), PRB.stripe, { ink: null, key: 'tnstripe' + x, lift: 0, flatCard: true, edge: false });
      piece(curvy([[-40, -40], [520, -40], [380, 60], [180, 150], [-40, 240]], 4), PRB.damp, { ink: null, op: 70, key: 'tndamp', lift: 0, flatCard: true, edge: false });
      // the sheet (its shadow on the wall), the headline band printed on it (a Deco rule, sunbursts)
      const [sx0, sy0, sx1, sy1] = P.SH;
      boilSeed('tn sheet'); piece(rect(sx0, sy0, sx1, sy1), XEROX.paper, { ink: null, key: 'tnsheet', lift: 10, edge: false });
      look('xerox'); cpGeneration(2); RISO_SHOT.push('COVER_T');
      { const [bx0, by0, bx1, by1] = P.BAND, blue = XEROX.toner, cy = (by0 + by1) / 2;
        boilSeed('tn band');
        for (const [y, w] of [[by0 + 26, 5], [by0 + 40, 2], [by1 - 40, 2], [by1 - 26, 5]]) dline([[bx0 + 40, y], [bx1 - 40, y]], w, blue, 0);
        for (const sd of [-1, 1]) {   // a half sunburst at each end, facing in (the ad's Deco)
          const x = sd < 0 ? bx0 + 70 : bx1 - 70;
          for (let k = 0; k < 9; k++) { const a = (k / 8 - .5) * Math.PI * .8; dline([[x - sd * 22 * Math.cos(a), cy + 22 * Math.sin(a)], [x - sd * 88 * Math.cos(a), cy + 88 * Math.sin(a)]], 4, blue, 0); }
          piece(oval(x, cy, 18, 18, 0, 16), '#FF4F9A', { sw: 1.4, key: 'tnsb' + sd });
        }
        if (!titled) { piece(oval((bx0 + bx1) / 2, cy, 52, 52, 0, 24), '#FFD23A', { sw: 1.6, key: 'tnsun' }); for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; dline([[(bx0 + bx1) / 2 + Math.cos(a) * 64, cy + Math.sin(a) * 64], [(bx0 + bx1) / 2 + Math.cos(a) * 96, cy + Math.sin(a) * 96]], 4, blue, 0); } }
      }
      // the ad: the picture, her copy (riso, a generation or two down), kept to the sheet with the hole ripped out of it
      const PIC = rect(P.PIC.x0, P.PIC.y0, P.PIC.x0 + 1920 * P.PIC.s, P.PIC.y0 + 1080 * P.PIC.s);
      clipPoly([PIC, HOLE], () => onPic(() => { look('xerox'); cpGeneration(2); film1080(() => pastScene(P.FREEZE, P.FREEZE, { still: true, gate: false, film: 0 })); }));
      boilSeed('tn grit'); xeroxGrit(0, .6);
      Object.assign(XEROX, CP_X0); RISO_SHOT.pop();
      // behind it, in the hole: her Friday, a page of her notebook pinned under the poster (a finished drawing: it doesn't boil)
      clipPoly(HOLE, () => { push(); translate(P.FRI[0], P.FRI[1]); scale(P.FRI[2]); film1080(() => stillDrawing(() => LOOPS.friday(P.FRIDAY_AT), P.FRIDAY_AT)); pop(); });
      look('card');
      // the tear: the lips' shadow on the page, the paper's torn white core along each edge, the curled lips (their backs,
      // the print showing faintly through), the pins at the sheet's corners
      boilSeed('tn tear');
      for (const [E, sd] of [[L, -1], [R, 1]]) {
        const sh = E.map(([x, y], i) => { const q = i / (E.length - 1); return [x - sd * (8 + 30 * Math.sin(Math.PI * q)), y + 12]; });
        piece([...E, ...sh.reverse()], '#000000', { ink: null, op: 60, key: 'tnsh' + sd, lift: 0, flatCard: true, edge: false });
      }
      for (const [E, sd] of [[L, -1], [R, 1]]) {
        const Lp = lip(E, sd);
        piece(Lp, '#EFE8D8', { sw: 1.6, shade: '#CFC5B0', depth: 14, key: 'tnlip' + sd, lift: 8 });
        for (let k = 0; k < 7; k++) { const i = 8 + k * 8, [x, y] = E[i]; dline([[x + sd * 14, y - 12], [x + sd * 40, y + 6]], 2, '#B9B0E0', .4); }   // (the blue drum, faint through the paper)
        dline(E, 2.2, '#FFFFFF', 0);
      }
      for (const [x, y] of [[sx0 + 22, sy0 + 22], [sx1 - 22, sy0 + 22], [sx0 + 22, sy1 - 22], [sx1 - 22, sy1 - 22]]) piece(oval(x, y, 9, 9, 0, 12), '#E0402E', { sw: 1, key: 'tnpin' + x + y, lift: 3 });
      // her hands (C1f's: up from below, her tomato sleeves, the cuffs, fists) gripping the lips, pulling them apart
      for (const [sd, q] of P.GRIP) {
        const E = sd < 0 ? L : R, i = Math.round(q * (E.length - 1)), [ex, ey] = E[i], hx = ex + sd * 34, hy = ey + 10;
        boilSeed('tnarm' + sd);
        limb([[hx + sd * 420, H + 520], [hx + sd * 250, hy + 330], [hx + sd * 40, hy + 110]], 150, 124, HER_C.col.coat, { sw: 2.4, key: 'tnarm' + sd, closedRoot: true });
        piece(ppBar([hx + sd * 44, hy + 128], [hx + sd * 24, hy + 66], 130, 130), HER_C.col.cuff, { sw: 2, key: 'tncuff' + sd, lift: 4 });
        hand(hx, hy + 20, -Math.PI / 2 + sd * .35, 124, { col: HER_C.col.skin, pose: 'fist', sw: 2.4, mirror: sd > 0, key: 'tnhand' + sd });
      }
    };
  }
  // the ad's headline, printed by the riso: Limelight on the blue drum, a pink block and pink letters a few pixels out of
  // register behind it, drop-outs and toner grit; the artist under it, smaller, as the ad's "presented by" line
  function tornText(c) {
    const P = TN, [bx0, by0, bx1, by1] = P.BAND, blue = KS.xerox.blue, pink = KS.xerox.voice.F, paper = KS.xerox.paper;
    const T1 = fitFont(COVER.title.toUpperCase(), bx1 - bx0 - 440, '400', 'Limelight, serif'), T2 = fitFont(COVER.artist.toUpperCase(), 500, '400', 'Limelight, serif');
    const cx = (bx0 + bx1) / 2, y1 = by0 + 44 + T1.cap + 18, y2 = y1 + 18 + T2.cap + 10;
    c.save(); c.globalCompositeOperation = 'multiply';
    c.font = T1.font; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    c.fillStyle = pink; c.globalAlpha = .7; c.fillText(COVER.title.toUpperCase(), cx + 5, y1 - 4); c.globalAlpha = 1;
    c.fillStyle = blue; c.fillText(COVER.title.toUpperCase(), cx, y1);
    c.font = T2.font; const w2 = widthOf(COVER.artist.toUpperCase(), T2.font);
    c.fillStyle = pink; kPath(c, [[cx - w2 / 2 - 18 + 4, y2 - T2.cap - 12], [cx + w2 / 2 + 18 + 4, y2 - T2.cap - 14], [cx + w2 / 2 + 19 + 4, y2 + 10], [cx - w2 / 2 - 17 + 4, y2 + 12]]); c.fill();
    c.fillStyle = blue; c.fillText(COVER.artist.toUpperCase(), cx, y2);
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = paper; c.globalAlpha = .85;   // drop-outs: specks where the drum didn't take
    for (let i = 0; i < 160; i++) { c.beginPath(); c.arc(cx + (kH(21, i) - .5) * (bx1 - bx0 - 400), y1 - T1.cap * kH(21, i + 300), .8 + 1.8 * kH(21, i + 600), 0, TAU); c.fill(); }
    c.globalAlpha = 1; c.fillStyle = 'rgba(30,60,140,.45)';   // toner grit on the band
    for (let i = 0; i < 180; i++) { c.beginPath(); c.arc(bx0 + kH(22, i) * (bx1 - bx0), by0 + kH(22, i + 400) * (by1 - by0), .4 + 1.4 * kH(22, i + 800) ** 2, 0, TAU); c.fill(); }
    c.restore();
  }
  design('torn', (t, titled) => TN.art(t, titled), tornText);
})();

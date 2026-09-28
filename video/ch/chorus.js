// chorus.js: the two pre-choruses and choruses (P1a–C1f, bars 31–49; P2a–C2f, bars 73–91). She sings them. The second
// pass is the first escalated (both of them, busier train, bigger brain, smaller sandwich, more bosses, a wad of bills), so
// every shot is one function run with k = 0 (first pass) or k = 1 (second pass).
//   P1a/P2a  card: her CV plane dives onto her notebook and flattens into the page → doodle: the plane unfolds into a
//            hammock between palms, she sketches in ("Less work?"), the sun grins ("Lovely"). P2a: his life card (V2h) is
//            pushed in on and flips over: its back is her page; a second hammock and he sketch in.
//   P1b/P2b  a shadow on the sand; a banknote-engraved rubber stamp in a white-gloved pinstripe hand swings in on "Less
//            pay?", jerks up on "Get" and slams on "fucked" (the downbeat). P2b: two stamps, one over each of them.
//   C1a/C2a  the impact: the page is now a riso copy with the red clock stamped on it, a poster outside the train window;
//            pull back into the carriage (a side-on cutaway), landing on "Fully": the train run entirely by cheerful bots
//            doing every job (trays, pillows, tea, Copilot the inspector punching tickets, a cleaner squeegeeing the window,
//            the next-stop boards) for a full carriage (commuters in every seat, bots asleep on the racks, a few standers
//            at the straps); on "automated" a ripple of jobs done runs down the carriage to her (a tick each, the boards
//            flip to home); she, with no seat free, standing at the pole, gives us
//            a deadpan look and presses the at-seat call button (C1b grows out of it). C2a: busier, the two of them
//            squashed in at the pole, the ripple bigger and faster.
//   C1b/C2b  the request, the effort, the delivery: in the carriage she holds up an order slip (a sandwich pictogram) to
//            the brass hatch in the ceiling and it's sucked up; on "Taking" outside: the slip shoots up a glass tube from
//            the train's roof, the camera riding with it through the clouds to an engraved cathedral crowned by a brain,
//            into its little service hatch on "All"; lights run up into the brain, pull back to the whole edifice; on
//            "intelligence" it works enormously and earnestly (impulses racing along its folds, lightning, gears, organ
//            pipes steaming, strain marks, sweat, the camera shaking); a ding: down on the hatch, which drops open to present
//            a sad little meal-deal sandwich, which drops into the tube on "we". C2b: bigger, harder, a smaller sandwich.
//   C1c/C2c  the sandwich drops out of the carriage's hatch into her hand; close on her holding it up, deadpan, on "this?"
//            (C2c: the two of them, her squinting at one so small); she looks out: the banknote bunker slides
//            into the window; push in: the banquet (Musk, Zuck; C2c + Dorsey, Altman), attentive bot staff, the clink on
//            "bunker", the vault's lamp, flap and the bill swooping at the lens; under it, back in the carriage: the bill
//            SLAPS onto the table on "bill" (C2c: a wad of them and loose ones raining down).
//   C1d/C2d  her commute as a stack of riso copies slapped onto the output tray on the words, faster and a generation worse
//            each time. C2d: both commutes, side by side.
//   C1e/C2e  a spadeful of sand wipes to a sandbox: each bot gets a task (a pictogram) on "Your bots" and climbs out to do
//            it on "escaped"; she's left sitting in the sand. C2e: an overextended sandcastle for a white-gloved requester,
//            walling the two of them in.
//   C1f/C2f  the sandbox planks shoot up into her box room (a sand-dust burst hides the riso → card change); the walls
//            squeeze on "escape", the landlord taps the rent book on "rent"; on "All that talk" she looks up and we push into
//            the 1930s ad pinned on the wall, a riso copy getting worse; "Is this what you" her hands grip it; she tears it
//            down on "meant": black. C2f: facing box rooms (split); they slide apart to the ad, charring at the edges; the
//            two of them in front of it (she points, he shakes his head); it burns through into B1.
// window.CHORUS (at the end) exposes the train, the stamp and the sandwich for the final chorus.
(() => {
  const K = k => k ? 1 : 0;
  // song time of word i of the k-th line starting with prefix (k = 0: the first chorus, 1: the second)
  const wt = (prefix, i, k) => WT(prefix, i, k) ?? 0;
  const t0Of = id => BAR(BOARD.find(s => s.id === id).bar[0]);   // (not lib.js's SB: the sandbox's SB below shadows it here)
  const snap = x => Math.round(x * 12) / 12;   // onto the 12 fps drawing grid (card and doodle step on twos)
  const PAPER = '#FBF8F0', RULE = '#9DB7DC';
  const BILL_RED = '#B5392C';

  // ======================================================================================================
  // Draw-in: a doodle that sketches itself: only the first pl of fn's biro strokes and the first pc of its coloured-pencil
  // strokes land (in drawing order). Counted in a dry pass first, so the fraction is of this element's own strokes.
  function chIn(pl, pc, key, fn) {
    if (pl <= 0 && pc <= 0) return;
    if (pl >= 1 && pc >= 1) { boilSeed(key); fn(); return; }
    const sp = brush.spline, st = brush.set, pg = brush.polygon;
    let cat = 'line', nL = 0, nC = 0;
    brush.set = function (br) { cat = br === 'pen' ? 'line' : br === 'cpencil' || br === 'side' ? 'col' : 'paper'; return st.apply(this, arguments); };
    brush.spline = function () { if (cat === 'line') nL++; else if (cat === 'col') nC++; };
    brush.polygon = function () {};
    boilSeed(key); try { fn(); } finally { brush.spline = sp; brush.polygon = pg; }
    const mL = Math.floor(nL * clamp(pl)), mC = Math.floor(nC * clamp(pc)); let iL = 0, iC = 0;
    brush.spline = function () {
      if (cat === 'line' && iL++ >= mL) return;
      if (cat === 'col' && iC++ >= mC) return;
      return sp.apply(this, arguments);
    };
    brush.polygon = function () { if (pc > 0) return pg.apply(this, arguments); };
    boilSeed(key); try { fn(); } finally { brush.spline = sp; brush.set = st; brush.polygon = pg; }
  }
  const tr = (P, x, y, s = 1, a = 0) => P.map(([px, py]) => [x + (px * Math.cos(a) - py * Math.sin(a)) * s, y + (px * Math.sin(a) + py * Math.cos(a)) * s]);
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const pen = (P, sw = 1.6, curv = .5) => dline(P, sw, BIRO, curv);

  // ======================================================================================================
  // THE HAMMOCK DOODLE (P1a, P1b, P2a, P2b; and printed as a riso copy in C1a, C2a): drawn in screen space, in the
  // current look (doodle on the page; xerox for the cheap copy). o: k (0 her alone, 1 him in the second hammock),
  // st (draw-in stages, each [lines, colour] 0..1: ground, sun, palms, sling, her, him, drinks), her / him (option
  // spreads for person()), sun (mood 0..1: 1 grin, 0 an 'o'), swing (rad), squash (0..1: flattened by the stamp).
  const HAM = [
    { palms: [[300, 905, .16], [1620, 905, -.16]], hooks: [[405, 520], [1515, 520]], sag: [960, 712], her: 960, sun: [1250, 190, 86] },
    // (the second page's middle palm is shorter (540), so the sun sits clear above its crown: at full height its fronds
    // hid the sun's face, the grin and P2b's 'o' of alarm)
    { palms: [[190, 905, .14], [1010, 905, 0, 540], [1760, 905, -.14]], hooks: [[285, 540], [960, 500], [1060, 500], [1665, 540]], sag: [615, 722], sag2: [1365, 722], her: 612, him: 1368, sun: [1010, 138, 70] },
  ];
  const HER_U = 34, HIM_U = 34;
  const HIM_SLING = '#74C483';   // (his sling's front: a soft green, so his mustard parka reads against it; in yellow he merged into it)
  function hmGround(k) {
    // the horizon (a sea line with little waves), the sand line, shells: all biro
    pen([[0, 640], [1920, 636]], 1.2, 0);
    for (let i = 0; i < 9; i++) { const x = 90 + i * 215 + 40 * hash(i + 3), y = 660 + 30 * hash(i + 7); pen([[x, y], [x + 16, y - 7], [x + 32, y]], .9, .5); }
    pen([[0, 902], [520, 896], [1100, 906], [1920, 898]], 1.4, .5);
    for (let i = 0; i < 26; i++) { const x = 40 + hash(i * 1.7) * 1840, y = 915 + hash(i * 2.3) * 60; pen([[x, y], [x + 3, y + 1]], 1, 0); }
    piece(oval(1780, 930, 24, 13, -.2, 14), '#F2B8A8', { sw: 1.1, key: 'shell1' });
    for (const [bx, by, s] of [[560, 250, 1], [640, 210, .8], [1480, 300, .9]]) pen([[bx - 22 * s, by], [bx - 10 * s, by - 10 * s], [bx, by], [bx + 10 * s, by - 10 * s], [bx + 22 * s, by]], 1.3, .5);
    piece(curvy([[250, 200], [300, 150], [380, 160], [420, 130], [490, 170], [500, 210], [260, 220]], 4), PAPER, { sw: 1.3, key: 'cloud' });
    piece(oval(140, 944, 18, 11, .3, 12), '#F6D58A', { sw: 1, key: 'shell2' });
  }
  // mood: 1 a grin, 0 alarm (wide eyes, an 'o': P1b/P2b under the stamp's shadow), 'o' a little 'o' of waiting (dot eyes,
  // a small 'o': P1a/P2a until "Lovely", when it breaks into the grin). pop 0..1: a small swell as it does (on twos).
  // gaze: [x, y] on the page for the alarmed eyes to follow (the stamp's base, once it's on screen: the user); else up
  function hmSun(k, mood, t, pop = 0, gaze = null) {
    const [x, y, r0] = HAM[k].sun, bob = 6 * Math.sin(bpOf(t) * Math.PI / 2), r = r0 * (1 + .1 * Math.sin(Math.PI * clamp(pop)));
    piece(oval(x, y + bob, r, r, 0, 30), '#FFD23A', { sw: 1.6, key: 'sun' });
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + .1 * Math.sin(t * 2), r0 = r * 1.18, r1 = r * (1.45 + .12 * (i % 2)); pen([[x + Math.cos(a) * r0, y + bob + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + bob + Math.sin(a) * r1]], 1.3, 0); }
    // the face: happy crescent eyes and a grin (mood 1), or wide eyes and an 'o' (mood 0)
    const ey = y + bob - r * .18;
    if (mood === 'x') {   // knocked out by the stamp: crossed eyes, a wobbly flat mouth (the user)
      for (const s of [-1, 1]) { const ex = x + s * r * .3, e = r * .12; pen([[ex - e, ey - e], [ex + e, ey + e]], 1.6, 0); pen([[ex - e, ey + e], [ex + e, ey - e]], 1.6, 0); }
      pen([[x - r * .3, y + bob + r * .4], [x - r * .15, y + bob + r * .35], [x, y + bob + r * .41], [x + r * .15, y + bob + r * .35], [x + r * .3, y + bob + r * .4]], 1.4, .5);
      for (const s of [-1, 1]) piece(oval(x + s * r * .62, y + bob + r * .12, r * .13, r * .08, 0, 10), '#F08A6A', { ink: null, key: 'suncheek' + s });
    } else if (mood === 'o') {
      for (const s of [-1, 1]) piece(oval(x + s * r * .3, ey, r * .075, r * .095, 0, 10), BIRO, { ink: null, key: 'sundot' + s });
      piece(oval(x, y + bob + r * .34, r * .1, r * .12, 0, 12), '#7A2A2A', { sw: 1.1, key: 'sunlo' });
      for (const s of [-1, 1]) piece(oval(x + s * r * .62, y + bob + r * .12, r * .13, r * .08, 0, 10), '#F08A6A', { ink: null, key: 'suncheek' + s });
    } else if (mood > .5) {
      for (const s of [-1, 1]) pen([[x + s * r * .45, ey + 4], [x + s * r * .3, ey - 9], [x + s * r * .15, ey + 4]], 1.5, .6);
      piece([[x - r * .5, y + bob + r * .18], [x + r * .5, y + bob + r * .18], [x + r * .3, y + bob + r * .55], [x, y + bob + r * .64], [x - r * .3, y + bob + r * .55]], '#C84A4A', { sw: 1.3, key: 'sungrin' });
      for (const s of [-1, 1]) piece(oval(x + s * r * .62, y + bob + r * .12, r * .13, r * .08, 0, 10), '#F08A6A', { ink: null, key: 'suncheek' + s });
    } else {
      // (the face turns a little toward what it watches, so the look reads from across the page)
      const fs = gaze ? r * .1 * clamp((gaze[0] - x) / (r * 3), -1, 1) : 0;
      for (const s of [-1, 1]) {
        const ex = x + fs + s * r * .3, dx = gaze ? gaze[0] - ex : 0, dy = gaze ? gaze[1] - ey : -1, d = Math.hypot(dx, dy) || 1;
        piece(oval(ex, ey, r * .14, r * .18, 0, 12), PAPER, { sw: 1.3, key: 'suneye' + s }); piece(oval(ex + r * .07 * dx / d, ey + r * .1 * dy / d, r * .06, r * .07, 0, 8), BIRO, { ink: null, key: 'sunpup' + s });
      }
      piece(oval(x + fs, y + bob + r * .38, r * .14, r * .17, 0, 12), '#7A2A2A', { sw: 1.2, key: 'suno' });
    }
  }
  function hmPalm(x, y, lean, i, t, h = 640) {
    // a curved trunk (ring marks), a crown of fronds, coconuts
    const top = [x + lean * h, y - h], mid = [x + lean * h * .35 + 30 * Math.sign(-lean || 1), y - h * .5];
    const C = through([[x, y], mid, top], 8);
    const L = [], R = []; C.forEach((p, j) => { const w = lerp(34, 20, j / (C.length - 1)), a = C[Math.min(C.length - 1, j + 1)], b = C[Math.max(0, j - 1)], d = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, nx = -(a[1] - b[1]) / d, ny = (a[0] - b[0]) / d; L.push([p[0] + nx * w, p[1] + ny * w]); R.push([p[0] - nx * w, p[1] - ny * w]); });
    piece(L.concat(R.reverse()), '#B98552', { sw: 1.6, key: 'trunk' + i });
    for (let j = 2; j < C.length - 2; j += 2) { const p = C[j]; pen([[p[0] - 24, p[1] + 4], [p[0], p[1] + 10], [p[0] + 24, p[1] + 4]], 1, .5); }
    const sway = .06 * Math.sin(t * 1.7 + i);
    for (let f = 0; f < 7; f++) {
      const a = -Math.PI / 2 + (f - 3) * .5 + sway + (f % 2 ? .08 : -.05), len = 230 + 40 * hash(f + i * 7), droop = 70 + 30 * hash(f * 3 + i);
      const tip = [top[0] + Math.cos(a) * len, top[1] + Math.sin(a) * len * .55 + droop], m = [top[0] + Math.cos(a) * len * .5, top[1] + Math.sin(a) * len * .5 - 10];
      const S = through([top, m, tip], 6), P = [], Q = [];
      S.forEach((p, j) => { const w = 26 * Math.sin(Math.PI * clamp(j / (S.length - 1) * .95 + .05)); P.push([p[0], p[1] - w * .6]); Q.push([p[0], p[1] + w * .6]); });
      piece(P.concat(Q.reverse()), f % 2 ? '#3E9A52' : '#56B45E', { sw: 1.3, key: 'frond' + i + f });
      pen(S, .9, .5);
    }
    for (let c = 0; c < 3; c++) piece(oval(top[0] - 18 + c * 18, top[1] + 18 + (c % 2) * 8, 15, 15, 0, 12), '#7A5230', { sw: 1.1, key: 'coco' + i + c });
    return top;
  }
  // the sling: its back edge (behind the sitter) and its front (over the lap), between hooks a and b, sagging to s
  const slingCurve = (a, b, s, dy = 0, n = 16) => { const P = []; for (let i = 0; i <= n; i++) { const u = i / n, x = lerp(a[0], b[0], u), base = lerp(a[1], b[1], u), d = s[1] - lerp(a[1], b[1], (s[0] - a[0]) / (b[0] - a[0])); P.push([x, base + d * Math.sin(Math.PI * u) ** .8 + dy * Math.sin(Math.PI * u)]); } return P; };
  // (the sitter lies IN the sling: the front fabric runs from its rim (HM_RIM above the sag line) down to the bottom
  // (HM_BOT below it) and is drawn over the body, knocked out to the paper in the doodle so the body inside doesn't show
  // through the coloured pencil; the body is clipped to above the bottom (hmInside), so nothing pokes out under the
  // fabric. Shoulders, head, an arm and the lower legs come out over the rim. The front used to be a thin band under the
  // sag line and the body lay on top of the fabric, through it and out below it.)
  const HM_RIM = 26, HM_BOT = 38;
  const hmInside = (a, b, s) => [rect(-4000, -4000, 6000, 4000), slingCurve(a, b, s, HM_BOT).concat([[b[0], 4000], [a[0], 4000]])];
  function hmSling(a, b, s, part, key, col1, col2) {
    const back = slingCurve(a, b, s, -60), front = slingCurve(a, b, s, HM_BOT), low = slingCurve(a, b, s, 0), rim = slingCurve(a, b, s, -HM_RIM);
    if (part === 'back') {
      piece(back.concat(low.slice().reverse()), col2, { sw: 1.3, key: key + 'b' });
      return;
    }
    const band = rim.slice(3, -3).concat(front.slice(3, -3).reverse());
    if (STYLE.mode === 'doodle') _paint(band, { wash: PAPER, ink: null });   // (coloured pencil is see-through: the body inside it hidden)
    piece(band, col1, { sw: 1.5, key: key + 'f' });
    for (let i = 1; i < 4; i++) pen(slingCurve(a, b, s, lerp(-HM_RIM, HM_BOT, i / 4)).slice(4, -4), .8, .5);   // stripes
    pen([a, rim[3]], 1.2, 0); pen([a, front[3]], 1.2, 0); pen([b, rim[rim.length - 4]], 1.2, 0); pen([b, front[front.length - 4]], 1.2, 0);   // the ropes
  }
  // a coconut with a straw and a paper umbrella, held: drawn in hand space
  const coconut = (s0) => { const s = s0 * 1.7; push(); rotate(1.2); piece(oval(0, -.2 * s, .55 * s, .5 * s, 0, 16), '#7A5230', { sw: 1.1, key: 'cocodrink' }); pen([[.1 * s, -.6 * s], [.35 * s, -1.25 * s]], 1.2, 0); piece([[.2 * s, -1.2 * s], [.9 * s, -1.05 * s], [.55 * s, -1.55 * s]], '#FF6FA8', { sw: 1, key: 'umb' }); pop(); };
  function hmPerson(P, x, hipY, u, o, key) {
    // lying back in the sling: a seated figure tipped back about the hips (knees up, feet out over the end), the head
    // propped up a little (tilted back toward upright)
    // flat (0..1): pancaked by the stamp. The press is straight down in page space, about the sling under them, and they
    // go down onto their backs as it lands. (Squashing along the tipped-back body sheared the figure on a diagonal.)
    const seatH = 4.2, gy = hipY + seatH * u, fl = o.flat || 0, lean = lerp(o.lean ?? -1.05, -1.4, fl), f = o.flip ? -1 : 1, py = hipY + 1.2 * u;
    // (a sweat emote is drawn here, at the brow: the rig puts emotes by the top corner of an upright head, and turned
    // with the body lying back that floated off beside the bun as blue shards)
    const sweat = o.emote === 'sweat' ? (o.emoteK ?? 1) : 0, oo = sweat ? { ...o, emote: null } : o;
    push();
    if (fl) { translate(x, py); scale(1 + .22 * fl, 1 - .5 * fl); translate(-x, -py); }
    translate(x, hipY); rotate(lean * f); translate(-x, -hipY);
    person(x, gy, u, P, { view: 'q', seated: true, seatH, boilKey: key, tilt: .5, ...oo });
    if (sweat > .02) {
      const Fr = personFrame(P, { view: 'q', seated: true, seatH }), hw = P.head.w, t2 = o.emoteAge ?? 0;
      for (const [fx, fy, r, dl] of [[1.1, -.7, .44, 0], [.8, -1.5, .3, .35]]) {   // (just off the brow, in front of the face)
        const s0 = sweat * backOut(clamp((t2 - dl) * 5)), slide = .35 * frac(t2 * .9 + dl);
        if (s0 < .05) continue;
        push(); translate(x + f * (Fr.hx + fx * hw) * u, gy + (Fr.hy + fy + slide) * u); rotate(-lean * f); scale(s0);   // (upright on the page: it runs down)
        sweatDrop(r * u, key + 'sw' + dl);
        pop();
      }
    }
    pop();
  }
  // a sweat drop (a teardrop, the point up, a highlight), centred on its round part, radius r
  function sweatDrop(r, key) {
    const P = []; for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 + i / 16 * TAU, k = Math.sin((a + Math.PI / 2) / 2); P.push([Math.cos(a) * r * (.25 + .75 * k), Math.sin(a) * r * (a < Math.PI / 2 && a > -Math.PI / 2 ? 1 : 1) - (1 - k) * r * 1.3]); }
    boilSeed(key); piece(P, '#8EC3E6', { sw: 1.2, key, lift: 0 });
    piece(oval(-r * .3, r * .05, r * .2, r * .28, -.3, 8), '#FFFFFF', { ink: null, key: key + 'h', lift: 0 });
  }
  function hammockScene(t, o = {}) {
    const k = K(o.k), L = HAM[k], st = o.st || {}, S = n => st[n] || [1, 1], swing = o.swing ?? .02 * Math.sin(t * 2.1);
    chIn(...S('ground'), 'hm ground', () => hmGround(k));
    chIn(...S('sun'), 'hm sun', () => hmSun(k, o.sun ?? 1, t, o.sunPop || 0, o.sunGaze));
    chIn(...S('palms'), 'hm palms', () => L.palms.forEach(([x, y, l, h], i) => { if (i < 2) hmPalm(x, y, l, i, t, h); }));
    if (L.palms[2]) chIn(...S('palm3'), 'hm palm3', () => hmPalm(...L.palms[2], 2, t));
    const her = () => hmPerson(HER_C, L.her, L.sag[1] - 18, HER_U, { ...o.her, flip: false }, 'hmher');
    const him = () => hmPerson(HIM_C, L.him, L.sag2[1] - 18, HIM_U, { ...o.him, flip: true }, 'hmhim');
    const hk = L.hooks;
    push(); translate(L.sag[0], hk[0][1]); rotate(swing); translate(-L.sag[0], -hk[0][1]);
    chIn(...S('sling'), 'hm sling back', () => hmSling(hk[0], hk[1], L.sag, 'back', 'hs', '#46C2C8', '#E86A9A'));
    clipPoly(hmInside(hk[0], hk[1], L.sag), () => chIn(...S('her'), 'hm her', her));
    chIn(...S('sling'), 'hm sling', () => hmSling(hk[0], hk[1], L.sag, 'front', 'hs', '#46C2C8', '#E86A9A'));
    pop();
    if (k) {
      push(); translate(L.sag2[0], hk[2][1]); rotate(-swing * 1.1); translate(-L.sag2[0], -hk[2][1]);
      chIn(...S('sling2'), 'hm sling2 back', () => hmSling(hk[2], hk[3], L.sag2, 'back', 'hs2', HIM_SLING, '#6A8AE8'));
      clipPoly(hmInside(hk[2], hk[3], L.sag2), () => chIn(...S('him'), 'hm him', him));
      chIn(...S('sling2'), 'hm sling2', () => hmSling(hk[2], hk[3], L.sag2, 'front', 'hs2', HIM_SLING, '#6A8AE8'));
      pop();
    }
  }

  // ======================================================================================================
  // THE NOTEBOOK, in card: her open notebook on the coffee table, close. The right-hand page is laid out so that at
  // camera zoom PZ on PG's centre it fills the frame exactly, its ruling and margin landing where linedPaper() draws
  // them: the push in ends on a frame identical to the doodle's paper, and the look changes under it.
  const PZ = 1.8, PG = { cx: 1100, cy: 560, w: W / PZ, h: H / PZ }; PG.x0 = PG.cx - PG.w / 2; PG.y0 = PG.cy - PG.h / 2;
  const pgW = (sx, sy) => [PG.x0 + sx / PZ, PG.y0 + sy / PZ];   // a point on the page (in doodle screen px) → world
  function notebook(t) {
    boilSeed('nb table');
    piece(rect(-400, -300, W + 400, H + 300), '#A9845A', { ink: null, key: 'nbtable', lift: 0, edge: false });
    for (let i = 0; i < 14; i++) { const y = -200 + i * 110 + 20 * hash(i); dline([[-400, y], [600, y + 12 * hash(i + 3)], [W + 400, y - 8]], 1.4, '#8C6A44', .5); }
    // the cover under both pages, the left page, the spiral, the right page
    boilSeed('nb book');
    piece(rect(PG.x0 - PG.w - 60, PG.y0 - 22, PG.x0 + PG.w + 22, PG.y0 + PG.h + 24), '#3A4A6A', { sw: 2, key: 'nbcover', lift: 8 });
    piece(rect(PG.x0 - PG.w - 40, PG.y0, PG.x0 - 14, PG.y0 + PG.h), '#F4EFE4', { sw: 1.4, key: 'nbleft', lift: 3 });
    for (let y = 130; y < H; y += 40) dline([[PG.x0 - PG.w - 30, PG.y0 + y / PZ], [PG.x0 - 22, PG.y0 + y / PZ]], .9, RULE);
    piece(rect(PG.x0, PG.y0, PG.x0 + PG.w, PG.y0 + PG.h), PAPER, { sw: 1.4, key: 'nbright', lift: 3 });
    for (let y = 130; y < H; y += 40) dline([pgW(4, y), pgW(W - 4, y)], .9, RULE);
    dline([pgW(170, 2), pgW(170, H - 2)], 1.1, '#E08A8A');
    for (const hy of [180, 540, 900]) piece(oval(...pgW(62, hy), 17 / PZ, 17 / PZ, 0, 14), '#E4DED2', { ink: null, key: 'nbhole' + hy, lift: 0, flatCard: true, edge: false });
    for (let i = 0; i < 14; i++) { const y = PG.y0 + 16 + i * (PG.h - 32) / 13; piece(oval(PG.x0 - 16, y, 14, 6, 0, 12), '#9A9EA6', { sw: 1, key: 'coil' + i, lift: 2, flatCard: true }); }
    // biro doodles on the left page (stars, a spiral), a biro, her mug
    boilSeed('nb bits');
    for (const [x, y] of [[PG.x0 - 300, PG.y0 + 120], [PG.x0 - 180, PG.y0 + 330]]) { dline([[x - 14, y], [x + 14, y]], 1.2, BIRO); dline([[x, y - 14], [x, y + 14]], 1.2, BIRO); dline([[x - 10, y - 10], [x + 10, y + 10]], .9, BIRO); }
    push(); translate(PG.x0 - 250, PG.y0 + PG.h - 90); rotate(-.35);
    piece(rect(-170, -9, 150, 9), '#E8E2D6', { sw: 1.2, key: 'biro', lift: 5 }); piece(rect(118, -10, 150, 10), '#26358C', { sw: 1, key: 'biroc', lift: 2, flatCard: true }); piece([[-170, -9], [-205, 0], [-170, 9]], '#C9BFAE', { sw: 1, key: 'birot', lift: 2, flatCard: true });
    pop();
    piece(oval(PG.x0 + PG.w + 230, PG.y0 + 60, 120, 120, 0, 30), '#E6DAC2', { sw: 1.6, key: 'mug', lift: 10 });
    piece(oval(PG.x0 + PG.w + 230, PG.y0 + 60, 96, 96, 0, 30), '#5A3A26', { ink: null, key: 'mugtea', lift: 0, flatCard: true });
    piece(ribbon([[PG.x0 + PG.w + 340, PG.y0 + 40], [PG.x0 + PG.w + 400, PG.y0 + 70]], 22, 22), '#E6DAC2', { sw: 1.4, key: 'mugh', lift: 8 });
  }
  // The CV folded into a plane (card): nose along +x, len px long; bank: roll (the lower wing's share of the silhouette),
  // flat 0..1 (pressed into the page: the lift goes).
  function cvPlane(x, y, len, a, roll = 0, flat = 0) {
    push(); translate(x, y); rotate(a);
    const s = len, lift = lerp(26, 0, flat), r = .42 * (1 + roll), r2 = .42 * (1 - roll);
    const up = [[s * .5, 0], [-s * .5, -r * s], [-s * .38, -.02 * s]], lo = [[s * .5, 0], [-s * .38, .02 * s], [-s * .5, r2 * s]];
    piece(lo, '#EFEADF', { sw: 1.4, shade: '#C9C2B2', depth: 6, key: 'planelo', lift });
    piece(up, '#F7F3EA', { sw: 1.4, key: 'planeup', lift });
    dline([[s * .5, 0], [-s * .38, 0]], 1.1, '#A0A6AE');   // (the crease, ending where the wings do)
    // the CV's text lines, printed on the upper wing: parallel to its fold (the root edge, nose to back corner), at steps
    // across the wing toward its tip, beside the photo and inset from the wing's edges, so they stay on the paper and
    // foreshorten with it. (At a fixed slant they ran off the wing's leading edge onto the page.)
    const [N, Tp, R] = up, onW = (v, u) => { const A = [lerp(N[0], Tp[0], v), lerp(N[1], Tp[1], v)], B = [lerp(R[0], Tp[0], v), lerp(R[1], Tp[1], v)]; return [lerp(B[0], A[0], u), lerp(B[1], A[1], u)]; };
    for (let i = 0; i < 4; i++) { const v = .14 + i * .12; dline([onW(v, .6), onW(v, .78 + .1 * hash(i + 5))], .9, '#A0A6AE'); }
    piece([[-s * .22, -.2 * s * r / .42], [-s * .08, -.15 * s * r / .42], [-s * .1, -.08 * s * r / .42], [-s * .24, -.12 * s * r / .42]], '#9BC0E4', { ink: null, key: 'planeph', lift: 0, flatCard: true });
    pop();
  }
  // The same plane as a biro doodle on the page (screen px): it can unfold into the hammock (u 0..1)
  function planeDoodle(x, y, len, a, u = 0, k = 0) {
    const s = len, L = HAM[k], hk = L.hooks, sag = L.sag;
    const P0 = tr([[.5, 0], [-.5, -.42], [-.38, -.02], [-.5, .42]], x, y, s, a);
    const P1 = [[sag[0], sag[1] + 30], hk[0], [sag[0], sag[1] - 50], hk[1]];
    const P = P0.map((p, i) => [lerp(p[0], P1[i][0], ease(u)), lerp(p[1], P1[i][1], ease(u))]);
    piece([P[0], P[1], P[2]], '#F7F3EA', { sw: 1.4, key: 'pdup' });
    piece([P[0], P[2], P[3]], '#EFEADF', { sw: 1.4, key: 'pdlo' });
  }

  // ======================================================================================================
  // THE STAMP (banknote engraving): a rubber stamp with a turned handle, a guilloche-banded mount and a round die (the
  // bill's clock), gripped by a white-gloved hand in a pinstripe sleeve that runs up out of frame. (x, y) = the middle
  // of the die's face; s = the die's width. Drawn in the bank look (switch to it first).
  function stampProp(x, y, s, a = 0, o = {}) {
    push(); translate(x, y); rotate(a);
    const sw = clamp(s / 150, 1.2, 3.4), bk = STYLE.mode === 'bank', sv = bk ? { c: BANK.colour, sat: BANK.sat, ink: BANK.ink, dens: BANK.dens } : null;
    if (bk) { BANK.colour = 1; BANK.sat = 1; BANK.dens = (o.dens ?? 1.8); }
    boilSeed('stamp');
    const orn = bk && typeof BNO !== 'undefined';
    // (in the bank look the stamp is the shot's subject: engraved as a figure; with bankorn.js, elaborate: a
    // guilloche cufflink, turning grooves and knurling on the handle, a beaded collar, the block moulded with egg and dart
    // and beads, a line of microprint on the brass plate)
    const draw = () => {
    // the arm: a pinstripe sleeve up out of frame, the shirt cuff and its gold link
    piece(rect(-s * .15, -s * 3.2, s * .15, -s * 1.08), '#28304A', { sw, key: 'stsleeve' });
    for (let i = -2; i <= 2; i++) dline([[i * s * .052, -s * 3.2], [i * s * .052, -s * 1.1]], sw * .5, '#D8DEE8');
    piece(rect(-s * .14, -s * 1.12, s * .14, -s * .98), '#F4F0E6', { sw, key: 'stcuff' });
    piece(oval(s * .09, -s * 1.05, s * .026, s * .026, 0, 10), '#E0B040', { sw: sw * .6, key: 'stlink' });
    if (orn) { guilloche(s * .09, -s * 1.05, s * .004, s * .02, { n: 5, lobes: 7, w: .4, col: BNO.ink(.9), steps: 90 }); const Bq = BNO.batch(); Bq.line([[-s * .13, -s * 1.07], [s * .13, -s * 1.07]], .4); Bq.line([[-s * .13, -s * 1.03], [s * .13, -s * 1.03]], .3); Bq.draw(); }
    // the turned handle: a waisted neck on a brass collar, a ball knob
    piece(curvy([[-s * .09, -s * .36], [-s * .06, -s * .47], [-s * .085, -s * .6], [s * .085, -s * .6], [s * .06, -s * .47], [s * .09, -s * .36]], 4), '#8A4E2A', { sw, shade: '#4A2814', depth: s * .03, key: 'stneck' });
    if (orn) {   // turning grooves and a knurled band on the neck
      const Bn = BNO.batch();
      for (const [y, w] of [[-.58, .082], [-.555, .076], [-.4, .07], [-.375, .082]]) Bn.line(BNO.arc(0, y * s, w * s, .15, Math.PI - .15, 10, w * s * .22), .5);
      for (let k = 0; k < 9; k++) { const x = (k - 4) / 4 * s * .058; Bn.line([[x - s * .01, -s * .5], [x + s * .01, -s * .44]], .3); Bn.line([[x + s * .01, -s * .5], [x - s * .01, -s * .44]], .3); }
      Bn.draw();
    }
    piece(oval(0, -s * .74, s * .16, s * .15, 0, 28), '#8A4E2A', { sw, shade: '#4A2814', depth: s * .05, key: 'stknob' });
    piece(rect(-s * .17, -s * .37, s * .17, -s * .3), '#D8A83A', { sw, key: 'stcollar' });
    if (orn) BNO.beads(-s * .16, s * .16, -s * .335, s * .018, { sw: .4 });
    // the glove closed round the knob from above
    hand(0, -s * 1.0, Math.PI / 2, s * .24, { glove: true, pose: 'fist', sw, key: 'sthand' });
    // the mount: a dark wooden block with a brass face-plate, the red rubber die below (printed in the bill's red ink)
    piece(rect(-s * .52, -s * .3, s * .52, -s * .06), '#6A3A22', { sw: sw * 1.15, shade: '#3A1E10', depth: s * .04, key: 'stblock' });
    if (orn) { BNO.eggDart(-s * .5, s * .5, -s * .282, s * .026, { sw: .4 }); BNO.beads(-s * .5, s * .5, -s * .08, s * .01, { sw: .35 }); }
    piece(rect(-s * .42, -s * .25, s * .42, -s * .11), '#D8B050', { sw: sw * .8, key: 'stplate' });
    if (bk) { guillocheBand(-s * .38, s * .38, -s * .18, s * .09, { n: 5, wl: s * .07, col: mixCol(BANK.ink, '#A8843A', .5), w: .8 }); for (const d of [-1, 1]) guilloche(d * s * .47, -s * .18, s * .012, s * .036, { n: 5, lobes: 7, w: .6 }); }
    if (orn) { BNO.microBand(-s * .38, s * .38, -s * .234, s * .022, { seed: 29 }); BNO.microBand(-s * .38, s * .38, -s * .126, s * .022, { seed: 31 }); }
    if (bk) BANK.ink = '#8A2420';
    piece(rect(-s * .5, -s * .06, s * .5, 0), '#C0302A', { sw, key: 'strubber' });
    };
    if (bk) bankFigure(draw); else draw();
    if (bk) Object.assign(BANK, { colour: sv.c, sat: sv.sat, ink: sv.ink, dens: sv.dens });
    pop();
  }
  // A soft shadow (multiplied over what's drawn, like the bunker's vignette): an ellipse, k = darkness 0..1
  let CH_SHADOW = null;
  function softShadow(cx, cy, rx, ry, k) {
    if (k <= .01) return;
    if (!CH_SHADOW) {
      const g = createGraphics(256, 128); g.pixelDensity(1); const c = g.drawingContext;
      c.setTransform(128, 0, 0, 64, 128, 64); const gr = c.createRadialGradient(0, 0, 0, 0, 0, 1);
      [[0, 150], [.45, 170], [.75, 212], [1, 255]].forEach(([q, v]) => gr.addColorStop(q, `rgb(${v},${v},${Math.min(255, v + 18)})`));
      c.fillStyle = gr; c.fillRect(-1, -1, 2, 2); CH_SHADOW = g;
    }
    flushBrush(); push(); blendMode(MULTIPLY); tint(255, 255 * clamp(k)); image(CH_SHADOW, cx - rx, cy - ry, rx * 2, ry * 2); noTint(); blendMode(BLEND); pop();
  }
  // The stamp's print: a red rubber-stamp impression of a clock at five to nine (the bill's mark), worn in places.
  function stampMark(cx, cy, r, rot = -.2, k = 1) {
    if (k <= 0) return;
    push(); translate(cx, cy); rotate(rot); scale(1 + .3 * (1 - k));
    const ink = BILL_RED, gap = i => hash(i * 3.7 + 11) < .14;
    const arcs = (rad, w, n, key) => { for (let i = 0; i < n; i++) { if (gap(i + key)) continue; const P = []; for (let j = 0; j <= 8; j++) { const q = (i + j / 8) / n * TAU; P.push([Math.cos(q) * rad, Math.sin(q) * rad]); } _inkLine(P, w, ink, 'rotring', .4); } };
    arcs(r, r * .04, 30, 0); arcs(r * .93, r * .015, 26, 50); arcs(r * .66, r * .016, 22, 90);
    for (let i = 0; i < 60; i++) { if (gap(i + 200)) continue; const q = i / 60 * TAU, L = i % 5 ? r * .05 : r * .11; _inkLine([[Math.cos(q) * r * .87, Math.sin(q) * r * .87], [Math.cos(q) * (r * .87 - L), Math.sin(q) * (r * .87 - L)]], i % 5 ? r * .014 : r * .028, ink, 'rotring', 0); }
    // the die's engraving (a bank's stamp): a guilloche rosette inside the chapter ring and a ring of fine marks inside the
    // outer rules, worn where the rubber missed like the rest
    for (let i = 0; i < 7; i++) {
      const P = []; for (let k = 0; k <= 160; k++) { const q = k / 160 * TAU, rr = r * lerp(.16, .6, .5 + .5 * Math.sin(11 * q + i / 7 * TAU)); P.push([Math.cos(q) * rr, Math.sin(q) * rr]); }
      for (let j = 0; j < P.length - 1; j += 16) { if (gap(i * 31 + j + 600)) continue; _inkLine(P.slice(j, j + 17), r * .007, ink, 'rotring', .4); }
    }
    for (let i = 0; i < 96; i++) { if (gap(i + 400)) continue; const q = i / 96 * TAU; _inkLine([[Math.cos(q) * r * .9, Math.sin(q) * r * .9], [Math.cos(q + .025) * r * .885, Math.sin(q + .025) * r * .885]], r * .008, ink, 'rotring', 0); }
    for (const [q, L, w] of [[-Math.PI / 2 + 8.92 / 12 * TAU, r * .4, r * .055], [-Math.PI / 2 + 55 / 60 * TAU, r * .56, r * .035]]) { const e = [Math.cos(q) * L, Math.sin(q) * L]; _inkLine([[0, 0], e], w, ink, 'rotring', 0); _paint(starPts(e[0], e[1], w * 1.4, .01, 3, q), { wash: ink, washOp: 255, ink: null }); }
    _paint(oval(0, 0, r * .065, r * .065, 0, 16), { wash: ink, washOp: 255, ink: null });
    for (let i = 0; i < 4; i++) { const q = (i + .5) / 4 * TAU; _paint(starPts(Math.cos(q) * r * .8, Math.sin(q) * r * .8, r * .07, .42, 5, q), { wash: ink, washOp: 240, ink: null }); }
    pop();
  }

  // ======================================================================================================
  // P1a / P2a: "Less work? Lovely."
  // his life, the card he hauled out of the screen in V2h (verse2.js draws it: v2LifeCard / V2_LIFE); a stand-in here
  // when that chapter isn't loaded: a sunny day on a card
  function lifeCardFront(w) {
    if (typeof v2LifeCard === 'function' && typeof V2_LIFE !== 'undefined' && SHOT.V2h) { v2LifeCard(0, 0, w, { key: 'chlife' }); return; }
    const h = w * 9 / 16; boilSeed('lifecard');
    piece(rect(-w / 2, -h / 2, w / 2, h / 2), '#9FD0E8', { sw: 2, key: 'lcsky', lift: 6 });
    piece(rect(-w / 2, h * .15, w / 2, h / 2), '#7AB86A', { ink: null, key: 'lcgrass', lift: 0 });
    piece(oval(w * .3, -h * .22, h * .12, h * .12, 0, 20), '#FFD23A', { sw: 1.2, key: 'lcsun', lift: 2 });
    person(-w * .1, h * .42, h / 22, HIM_C, { ...feel('happy', 0), view: 'front', boilKey: 'lcHim', noShadow: true });
  }
  // (P1b/P2b carry on P1a/P2a's drift from these. Z0: the doodle's drift starts a hair over 1: at exactly 1 the page's
  // thin rules print faint (they sit on the pixel grid), so they came up a few frames into P2a, just after the flip)
  const PRE_A = { PUSH: [.5, 1.05], PUSH2: [.42, .74], FLIP: [.74, 1.0], Z0: 1.002 };
  function preA(t, lt, dur, k) {
    const T0 = t - lt, wLess = wt('Less work', 0, k) - T0, wWork = wt('Less work', 1, k) - T0, wLove = wt('Less work', 2, k) - T0;
    const l = mt(lt), tt = mt(t);
    // (P2a: the card he holds up holds ~0.6 s first, then the push and the flip run as one move. Pushing in the moment
    // V2h's card had come up to us, then flipping, stacked three moves into 0.7 s.)
    const LAND = snap(.34), PUSH = k ? PRE_A.PUSH2 : PRE_A.PUSH, FLIP = PRE_A.FLIP;
    if (k && lt < FLIP[1]) {
      // his life card: push in on it (V2h's last frame, frozen), then on a dark stage it flips over: its back is her
      // notebook page, with her doodle already on it
      const L = typeof V2_LIFE !== 'undefined' ? V2_LIFE : { cx: 960, cy: 470, w: 960 };
      if (lt < FLIP[0]) {
        const q = ease(seg(lt, PUSH[0], PUSH[1])), z = lerp(1, W / L.w, q);
        push(); translate(lerp(L.cx, 960, q), lerp(L.cy, 540, q)); scale(z); translate(-L.cx, -L.cy);
        if (!drawShot('V2h', Math.min(t, T0 - .01))) { look('card'); piece(rect(-60, -60, W + 60, H + 60), '#2A2630', { ink: null, key: 'lcbg', lift: 0 }); push(); translate(L.cx, L.cy); lifeCardFront(L.w); pop(); }
        pop();
        return;
      }
      const q = seg(lt, FLIP[0], FLIP[1]), c = Math.cos(q * Math.PI), sx = Math.max(.004, Math.abs(c));
      // (behind the card as it turns over: her page, the one its back is, so it turns over onto the paper; on a dark stage
      // it flipped over ~5 frames of near-black)
      look('doodle'); boilSeed('flip page'); linedPaper(); look('card');
      push(); translate(960, 540 - 30 * Math.sin(q * Math.PI)); scale(sx * (1 + .06 * Math.sin(q * Math.PI)), 1 + .06 * Math.sin(q * Math.PI)); translate(-960, -540);
      if (c > 0) { push(); translate(960, 540); lifeCardFront(W); pop(); }
      else clipPoly(b2RoundPoly(rect(0, 0, W, H), 20), () => { look('doodle'); linedPaper(); hammockScene(tt, { k, st: { palm3: [0, 0], sling2: [0, 0], him: [0, 0] }, her: herHammock(99, 0, 0, 0, 0), sun: 'o' }); });   // (the card's back, its shape: the paper runs 60 px past it)
      pop();
      return;
    }
    if (!k && l < PUSH[1]) {
      // card: the notebook close; the plane dives in and lands on the page, skids, settles; the camera pushes to the page
      look('card');
      // (the push and the landing's shake on ones, from the shot's continuous time: puppets on twos, camera on ones)
      const z = Math.exp(lerp(Math.log(1.22), Math.log(PZ), ease(seg(lt, PUSH[0], PUSH[1])))), c0 = [990, 575], c = [lerp(c0[0], PG.cx, ease(seg(lt, PUSH[0], PUSH[1]))), lerp(c0[1], PG.cy, ease(seg(lt, PUSH[0], PUSH[1])))];
      const sk = lt > LAND && lt < LAND + .25 ? shakeXY(t, 3 * (1 - seg(lt, LAND, LAND + .25))) : [0, 0];
      camBegin(c[0] + sk[0], c[1] + sk[1], z);
      notebook(tt);
      // the plane: in from the upper left on a diving arc, lands (a bounce), skids to a stop, flattens into the page
      const land = pgW(840, 650), stop = pgW(930, 655);
      let px, py, a, roll = 0;
      if (l < LAND) { const q = l / LAND, p = arcPt([120, 40], land, -120, easeIn(q) * .55 + q * .45); px = p[0]; py = p[1]; a = lerp(.75, .08, q); roll = .5 * Math.sin(q * 9) * (1 - q); }
      else { const q = easeOut(seg(l, LAND, LAND + .3)); px = lerp(land[0], stop[0], q); py = lerp(land[1], stop[1], q) - 14 * Math.abs(Math.sin(seg(l, LAND, LAND + .14) * Math.PI)); a = .08 - .06 * q + .05 * spring(l, LAND + .3, 8, 30); }
      boilSeed('plane'); cvPlane(px, py, 300, a, roll, seg(l, PUSH[0] + .1, PUSH[1]));
      camEnd();
      return;
    }
    // doodle. First pass: the plane is a drawing now; it unfolds into the hammock between two palms that sketch in; she
    // sketches in on "Less work?", settles back on "work", the sun grins on "Lovely". Second pass: the page is hers, with
    // her in the hammock; a third palm and a second hammock sketch in, then him, on "Less work?"; "Lovely": they toast.
    look('doodle');
    const d = l - (k ? FLIP[1] : PUSH[1]);
    const stP = seg(d, 0, .35), stS = seg(l, wLess - .1, wLess + .35);
    const her = k ? herHammock(l + 99, -9, -9, wLove, k) : herHammock(l, wLess, wWork, wLove, k);
    const st = k ? {
      palm3: [seg(d, 0, .3), seg(d, .1, .5)], sling2: [seg(d, .25, .55), seg(d, .35, .7)],
      him: [stS, seg(l, wLess + .05, wLess + .45)],
    } : {
      ground: [seg(d, 0, .3), seg(d, .1, .5)], palms: [stP, seg(d, .15, .6)], sling: [seg(d, .2, .45), seg(d, .3, .6)],
      her: [stS, seg(l, wLess + .05, wLess + .45)], sun: [seg(l, wWork - .3, wWork + .05), seg(l, wWork - .2, wWork + .2)],
    };
    const unfold = seg(d, 0, .4);
    camBegin(960, 540, PRE_A.Z0 + .012 * Math.max(0, lt - (k ? FLIP[1] : PUSH[1])));   // (the slow push on ones)
    linedPaper();   // (inside the camera, as P1b/P2b draw it: drawn before it, the page's rules printed faint here and came up dark on the cut)
    if (!k && unfold < 1) { boilSeed('pd'); planeDoodle(930, 655, 300 * PZ, .02, unfold, 0); }
    // the sun: a little 'o' as it's drawn and while it waits, breaking into its grin on "Lovely" (both pages: P2a redraws
    // P1a's idea). It ends grinning, as P1b/P2b open (they keep their own sun: the grin, then the alarm).
    const tGrin = wLove - .02;
    hammockScene(tt, { k, st, her, him: k ? himHammock(l, wLess, wWork, wLove) : null, sun: l < tGrin ? 'o' : 1, sunPop: seg(l, tGrin, tGrin + .25) });
    camEnd();
  }
  // (the settle back, arm behind the head, waits until the colour is in (it lands over wLess + .05 .. + .45, preA's st):
  // on wWork - .05 the arms moved while the sketch was still colouring in, so the outline showed them crossed and the
  // colour landed with one behind her head and the coconut up. It still falls on "work".)
  const hmSettle = (wLess, wWork) => Math.max(wWork - .05, wLess + .47);
  // THE LOUNGE (the user: natural, a classic hammock lounge): the far arm (drawn behind the body) goes up behind the
  // head, the head back in its crook, the elbow out and up; the near arm holds the drink (holdL), the coconut resting on
  // the belly, the elbow down beside the body; on "Lovely" it's raised in a toast. (Before, the near arm was the one
  // behind the head: drawn in front, its forearm lay across her brow with the hand on her crown.) The near arm's bends are
  // positive, its anatomical side (people.js ppReach): negative, they put the elbow up by her chin through "Less work?",
  // the forearm hanging down to the coconut, and it flipped down to her side on "Lovely" (the user, 2026-09-27)
  const HM_POSE = {
    down: { L: [1.0, .62, .35, 'hold', 1, -1.2], R: [.7, .85, .3, 'relax', 0] },   // (sketching in: the drink on her lap, the far arm down)
    lounge: { L: [1.05, .5, .4, 'hold', 1, -1.25], R: [-.45, -.92, .95, 'relax', 0] },
    toast: { L: [2.0, -.02, .2, 'hold', 1, -1.3], R: [-.45, -.92, .95, 'relax', 0] },   // (held out in front of the chest, clear of her face)
  };
  // (his: hand x is in shoulder half-widths and his are nearly twice hers, his torso short under a big head and his arms
  // shorter, so his near hand rests lower and nearer (on his belly), or the coconut ended at his mouth)
  const HM_POSE_HIM = {
    down: { L: [.5, .95, .3, 'hold', 1, -1.2], R: HM_POSE.down.R },
    lounge: { L: [.45, 1.0, .35, 'hold', 1, -1.25], R: HM_POSE.lounge.R },
    toast: { L: [.85, .62, .2, 'hold', 1, -1.3], R: HM_POSE.lounge.R },
  };
  const hmLounge = (l, wLess, wWork, wLove, P = HM_POSE) => { const tS = hmSettle(wLess, wWork); return { tS, pose: pPoses(l, [[0, P.down], [tS, P.lounge], [wLove - .12, P.toast]], .3) }; };
  function himHammock(l, wLess, wWork, wLove) {
    const mood = emotions(l, [[0, 'neutral'], [wWork, 'happy'], [wLove - .1, 'happy', { mouth: 'grin' }]], { take: .5 });
    const { tS, pose } = hmLounge(l, wLess, wWork, wLove, HM_POSE_HIM);
    return { ...mood, pose, holdL: coconut, lean: -.85 - .2 * ease(seg(l, tS - .05, tS + .4)), lookX: .5, lookY: -.1 };
  }
  // her in the hammock: settles back, her far arm behind her head on "work", the coconut up on "Lovely"
  // her lean lying back in the sling (rad, the body tipped back from sitting): the first page's hammock is long and shallow
  // and she lies at its low point, where at the second page's lean she read as sitting up, a crunch (the user); the second's
  // is short and steep, and she lies back in it at -1.05
  const HM_LEAN = k => k ? -1.05 : -1.3;
  function herHammock(l, wLess, wWork, wLove, k) {
    const mood = emotions(l, [[0, 'neutral'], [wWork, 'happy'], [wLove - .1, 'happy', { mouth: 'grin' }]], { take: .5 });
    const { tS, pose } = hmLounge(l, wLess, wWork, wLove);
    const L0 = HM_LEAN(k);
    return { ...mood, pose, holdL: coconut, lean: L0 + .2 - .2 * ease(seg(l, tS - .05, tS + .4)), lookX: .5, lookY: -.1 };
  }
  // ======================================================================================================
  // P1b / P2b: "Less pay? Get fucked." A shadow falls over the page; the stamp swings in on "Less pay?", jerks up on
  // "Get" and slams on "fucked" (its last frame). The stamp's track (die bottom y, x, tilt) is shared with C1a / C2a.
  const STAMP = { x: 1000, s: 400, hover: 470, hx: 1010, peak: 250, hit: 772 };
  function stampTrack(lt, T) {   // T: { in, pay, get, hit } shot times
    let y = -900, a = 0, x = STAMP.x;
    if (lt >= T.in) {
      const e = seg(lt, T.in, T.in + .3);
      y = lerp(-500, STAMP.hover, backOut(e)) + 10 * Math.sin((lt - T.in) * 5.1) * e;
      a = -.35 * (1 - backOut(e)) + .035 * Math.sin((lt - T.in) * 3.3);
      x = STAMP.hx + 220 * (1 - ease(e)) + 30 * Math.sin((lt - T.in) * 2.2) * e;   // swings in from the right, aiming
      if (lt > T.pay) { const q = lt - T.pay; y += 30 * Math.exp(-q * 7) * Math.sin(q * 26); }   // a bob on "pay"
    }
    if (lt >= T.get) {   // the jerk up, trembling, then the drop
      const u = backOut(seg(lt, T.get, T.get + .12)), tr = lt < T.hit - .12 ? 3 * Math.sin(lt * 90) : 0;
      y = lerp(y, STAMP.peak, u) + tr; a = lerp(a, -.05, u); x = lerp(x, STAMP.x + 30, u);
      const d = seg(lt, T.hit - .12, T.hit);
      if (d > 0) { y = lerp(STAMP.peak, STAMP.hit, easeIn(d)); a = lerp(-.05, 0, d); x = lerp(STAMP.x + 30, STAMP.x, d); }
    }
    return { x, y, a, v: lt > T.hit - .12 && lt <= T.hit ? 1 : 0 };
  }
  // the stamp's shadow on the sand under it, cartoon-anvil style: small and faint while it's high, big and dark as it falls
  function stampShadow(x, y, k) {
    const h = clamp((STAMP.hit - y) / 1300);
    softShadow(x, 905, STAMP.s * lerp(.62, .3, h), STAMP.s * lerp(.1, .05, h), k * lerp(1, .55, h));
  }
  const STAMPS = [[0], [-400, 360]];   // the stamps' x offsets from their track (k = 1: one over each of them)
  function preB(t, lt, dur, k) {
    const T0 = t - lt, l = mt(lt), tt = mt(t);
    const T = { in: wt('Less pay', 0, k) - T0 - .04, pay: wt('Less pay', 1, k) - T0, get: wt('Less pay', 2, k) - T0, hit: dur - .04 };
    const shadowK = seg(lt, T.in - .65, T.in + .1);
    // her (and him): sip; spot the shadow on the sand; look up at the stamp; cower on "Get"
    const tSee = T.in - .45;
    const react = (seed) => {
      const mood = emotions(l, [[0, 'happy'], [.3, 'happy', { mouth: 'smile' }], [tSee + seed, 'surprised'], [T.in + .2, 'scared'], [T.get, 'scared', { eyes: 'squeeze', mouth: 'grimace' }]], { take: .7 });
      // (from P1a/P2a's toast: a sip, lowered as the shadow falls; the alarm: the drink flung up in the near hand, the far hand
      // still behind the head; the cower on "Get": both hands up over the head, the drink still in hand)
      const bh = HM_POSE.lounge.R, him = !!seed;
      const pose = pPoses(l, [[0, (him ? HM_POSE_HIM : HM_POSE).toast], [.25, { L: him ? [.6, -.05, .4, 'hold', 1, -1.9] : [.85, -.62, .5, 'hold', 1, -1.9], R: bh }], [tSee, { L: him ? [.6, .7, .3, 'hold', 1, -1.1] : [1.3, .2, .4, 'hold', 1, -1.1], R: bh }],
        [T.in + .08, { L: him ? [-1.2, -1.5, .2, 'hold', 1, -1.3] : [1.95, -.55, .25, 'hold', 1, -1.3], R: bh }], [T.get, { L: [.6, -.8, .7, 'hold', 1, -1.8], R: [.15, -.8, .7, 'open', 1, -1.3] }]], .22);
      const lk = l < tSee ? { lookX: .5, lookY: -.1 } : l < T.in + .05 ? { lookX: .7, lookY: .9 } : { lookX: .4, lookY: -1 };
      // (him: he jolts half up out of the lie as he sees it and flings his coconut arm up and out over the sling's end, beside
      // his head, then falls back into the cower on "Get". His near shoulder is on the far side of his broad chest and his
      // arm is short: any target forward of him was out of reach, and the arm, straightened toward it, ended with the
      // coconut at his chin or his eye whatever the target (so up along his body, not forward across it))
      const up = him ? ease(seg(l, tSee - .05, tSee + .2)) * (1 - ease(seg(l, T.get - .1, T.get + .12))) : 0;
      return { ...mood, ...lk, pose, holdL: coconut, lean: (him ? -1.05 : HM_LEAN(k)) + .42 * up };
    };
    look('doodle');
    // (the drift on ones, carried on from P1a/P2a's slow push: the same drawing across the cut, so it starts where that
    // push ended; starting at 1.012 jumped the page ~1.7% smaller on the cut)
    const zA = PRE_A.Z0 + .012 * Math.max(0, T0 - t0Of(k ? 'P2a' : 'P1a') - (k ? PRE_A.FLIP[1] : PRE_A.PUSH[1]));
    camBegin(960, 540, zA + .01 * lt);
    linedPaper();
    // the sun's eyes follow the stamp's base once it's on screen, on twos; over the two of them they flick from one stamp
    // to the other on each beat (the user), hers first
    const G = stampTrack(l, T), si = k ? Math.floor(bpOf(t) + 1e-6) & 1 : 0;
    hammockScene(tt, { k, her: react(0), him: react(.08), sun: lt >= T.hit - 1e-6 ? 'x' : lt < T.in - .55 ? 1 : 0, sunGaze: G.y > 0 ? [G.x + STAMPS[k][si], G.y] : null });   // (x: knocked out on the impact frame, the stamp's own hit)
    const S0 = stampTrack(lt, T);
    for (const dx of STAMPS[k]) stampShadow(S0.x + dx, S0.y, shadowK);
    look('bank');
    STAMPS[k].forEach((dx, i) => {
      const S = i ? stampTrack(lt + .03, T) : S0;
      if (S.v) for (let j = 0; j < 9; j++) { const x = S.x + dx + (j - 4) * STAMP.s * .13, y0 = S.y - STAMP.s * (1.3 + .5 * hash(j)); _inkLine([[x, y0 - 260], [x, y0]], 1.6, BANK.ink, 'rotring', 0); }   // speed lines
      stampProp(S.x + dx, S.y, STAMP.s * (k ? .9 : 1), S.a * (i ? -1 : 1));
    });
    camEnd();
  }

  // ======================================================================================================
  // THE CHORUS TRAIN (C1a–C1d, C2a–C2d): the night train as a dollhouse cutaway, side on. We look across the aisle at the
  // window wall: bays of two high-backed moquette seats facing each other over a table, one 16:9 window per bay (so a
  // push into her window lands on a full frame), luggage racks, a ceiling strip light, the night outside sliding by.
  // Bay i is centred at x = 960 + i·BW; hers is bay 0: she sits in its left seat, facing right.
  const CR = { FY: 932, SY: 790, TY: 690, WT: 280, WW: 540, WH: 303.75, BW: 660, u: 30 };
  CR.WB = CR.WT + CR.WH;
  const crWin = i => ({ x: 960 + i * CR.BW - CR.WW / 2, y: CR.WT, w: CR.WW, h: CR.WH });
  // A window, one construction: the glass is one rounded rectangle (radius CR_R, true arcs); the view outside is clipped
  // to exactly it (carriageBack); a rubber seal of even width (inside CR_SEAL[0], outside CR_SEAL[1] of the glass's edge,
  // the same corner centres) is drawn once over the clip edge, and the frame's trim ring CR_TRIM px out. (The glass was a
  // spline through a rounded rectangle, the wall's corner fills cut from it separately, the seal a thick pen line offset
  // down and right, and the view unclipped behind the wall: the seal wobbled, and slivers of the view and gaps showed
  // at the corners.)
  const CR_R = 40, CR_SEAL = [1.5, 6.5], CR_TRIM = [18.5, 21.5];
  const rrArc = (x0, y0, x1, y1, r, n = 12) => { const P = []; for (const [cx, cy, a0] of [[x1 - r, y0 + r, -Math.PI / 2], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, Math.PI / 2], [x0 + r, y0 + r, Math.PI]]) for (let k = 0; k <= n; k++) { const a = a0 + k / n * Math.PI / 2; P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return P; };
  const crGlass = (i, d = 0) => { const w = crWin(i); return rrArc(w.x - d, w.y - d, w.x + w.w + d, w.y + w.h + d, CR_R + d); };
  // an even ring between the glass's outlines d0 and d1 px out (native triangles: no pen wobble), flat colour
  function crRing(i, d0, d1, col) {
    const A = crGlass(i, d0), B = crGlass(i, d1), c = color(col);
    flushBrush(); push(); noStroke(); fill(red(c), green(c), blue(c)); beginShape(TRIANGLE_STRIP);
    for (let k = 0; k <= A.length; k++) { const j = k % A.length; vertex(B[j][0], B[j][1]); vertex(A[j][0], A[j][1]); }
    endShape(); pop();
  }
  const CRC = { wall: '#39333F', wallDk: '#26222B', wallLt: '#4A4452', trim: '#6A6470', frame: '#1E1A22', sill: '#57515E', floor: '#2A2630', floorLt: '#3A3542',
    ceil: '#211E26', strip: '#EDEBDC', rack: '#8A8E96', rackDk: '#5A5E66', table: '#6E6A72', tableLt: '#8E8A94', tableDk: '#4A4650',
    moq: CAR.moq, moqDk: CAR.moqDk, moqA: CAR.moqA, moqB: CAR.moqB, night: '#121726', nightLt: '#1C2233', lamp: '#FFB45E' };
  // outside: the night, houses and sodium lamps sliding past (the train runs toward screen left, so the world slides right)
  function crNight(t, x0, x1, speed = 1) {
    boilSeed('cr night');
    piece(rect(x0, CR.WT - 20, x1, CR.WB + 20), CRC.night, { ink: null, key: 'crnight', lift: 0, flatCard: true, edge: false });
    piece(rect(x0, CR.WT + 190, x1, CR.WB + 20), CRC.nightLt, { ink: null, key: 'crembank', lift: 0, flatCard: true, edge: false });
    const span = x1 - x0 + 600;
    for (let i = 0; i < 12; i++) {
      const x = x0 - 300 + ((i * 330 + t * 620 * speed) % span + span) % span, h = 60 + 70 * hash(i + 3), y = CR.WT + 190 - h;
      boilSeed('crh' + i);
      piece(rect(x, y, x + 120, CR.WT + 190), '#0D111C', { ink: null, key: 'crhouse' + i, lift: 0, flatCard: true, edge: false });
      piece([[x + 20, y], [x + 60, y - 36], [x + 100, y], [x + 120, y + 2], [x, y + 2]], '#0D111C', { ink: null, key: 'crroof' + i, lift: 0, flatCard: true, edge: false });
      if (hash(i + 9) > .35) { piece(rect(x + 44, y + 22, x + 76, y + 50), '#E8B85A', { ink: null, key: 'crhw' + i, lift: 0, flatCard: true, edge: false }); glow(x + 60, y + 36, 50, NOIR.lamp, .5); }
    }
    for (let i = 0; i < 6; i++) { const x = x0 - 300 + ((i * 520 + t * 1100 * speed) % span + span) % span; glow(x, CR.WT + 70, 80, '#FF9A3A', .7); glow(x, CR.WT + 70, 26, '#FFE0A0', .8); }
  }
  // the wall (pieces round the windows), window frames, racks, ceiling and floor, for bays i0..i1
  function crShell(t, i0, i1, o = {}) {
    const X0 = 960 + i0 * CR.BW - CR.BW / 2 - 40, X1 = 960 + i1 * CR.BW + CR.BW / 2 + 40;
    for (let i = i0; i <= i1; i++) {
      if (!seen(960 + i * CR.BW, CR.BW / 2 + 40)) continue;
      const w = crWin(i);
      // the seal over the glass's (the view's clip) edge, and the frame's trim ring: even, following the corners
      crRing(i, -CR_SEAL[0], CR_SEAL[1], '#0C0A10'); crRing(i, CR_SEAL[1], CR_SEAL[1] + 1.2, mixCol(CRC.wall, '#FFF7EA', .22)); crRing(i, CR_TRIM[0], CR_TRIM[1], CRC.trim);
      piece(rect(w.x - 30, w.y + w.h + 16, w.x + w.w + 30, w.y + w.h + 30), CRC.sill, { sw: 1.2, key: 'crsill' + i, lift: 3 });
      // the luggage rack over the bay, with the odd bag
      boilSeed('cr rack' + i);
      const rx = 960 + i * CR.BW;
      for (const ry of [246, 262]) dline([[rx - CR.BW / 2 + 20, ry], [rx + CR.BW / 2 - 20, ry]], 3, CRC.rack, 0);
      for (let j = 0; j < 5; j++) dline([[rx - CR.BW / 2 + 40 + j * 145, 206], [rx - CR.BW / 2 + 40 + j * 145, 262]], 2, CRC.rackDk, 0);
      if (!o.noBags && hash(i * 3.3 + 1) > .3) piece(b2RoundPoly(rect(rx + 60 + 80 * hash(i), 190, rx + 200 + 80 * hash(i), 246), 12), ['#5A4A62', '#3E5A6A', '#6A4A3A'][(i + 9) % 3], { sw: 1.4, key: 'crbag' + i, lift: 4 });   // (rounded: curvy() pointed its ends)
    }
    boilSeed('cr ceil');
    piece(rect(X0, -200, X1, 64), CRC.ceil, { ink: null, key: 'crceil', lift: 0, edge: false });
    piece(rect(X0, 52, X1, 64), CRC.strip, { ink: null, key: 'crstrip', lift: 0, flatCard: true, edge: false });
    for (let x = X0 + 200; x < X1; x += 700) glow(x, 60, 420, '#E8F0F0', .12);
    piece(rect(X0, CR.FY, X1, CR.FY + 400), CRC.floor, { ink: null, key: 'crfloor', lift: 0, edge: false });
    dline([[X0, CR.FY + 2], [X1, CR.FY + 2]], 2, CRC.floorLt, 0);
  }
  // a high-backed seat in profile at bay i, side -1 (the left seat, its passenger facing right) or 1; returns the passenger's
  // hip point (ground point x, seat y)
  const crSeatAt = (i, side) => [960 + i * CR.BW + side * 205, CR.SY];
  // is world x (± r px) on screen under the current camera? (skip drawing what the camera can't see)
  const seen = (x, r = 260, y = 540) => { if (!CAM) return true; const sx = toScreen(x, y)[0], rr = r * CAM.zoom; return sx + rr > -40 && sx - rr < W + 40; };
  // One seat, one solid object (the user: "the backs and seats clip into each other, and the headrest extends into the
  // screens above"): the back stands against the pillar between the windows, back to back with the next bay's (a sliver
  // of wall between the two, never through each other); the padded back leans back a touch from the cushion to a rounded
  // headrest whose top stays well under the next-stop board (its bezel's bottom at 389); the cushion runs from the back's
  // front face to its edge by the table's end, on its own side of the back (it lay on the far side of its own back, through
  // the neighbour's, the two meeting across the pillar as one bench). CR_SEAT, px from the bay's middle: the rear face, the
  // front face at the cushion, at the shoulders and at the headrest, the cushion's front edge; the headrest's top (y).
  // (The backs used to be two 72 px panels 36 px apart, their pointed tops crossing up into the board.)
  const CR_SEAT = { rear: 327, front: 270, mid: 277, head: 284, edge: 124, top: 432, hr: 18 };   // (mid, head: the call button's plate (CALL, on bay -1's right seat back) sits within it; hr: the headrest's rounding)
  // the seat back's front face at height y: its distance from the bay's middle (over the rounded top, back to the rear
  // face); crSeatFace: its world x for bay i's seat on side (the seated passengers sit against it: crowd.js crowdSit)
  const crSeatD = y => { const S = CR_SEAT; return y < S.top + S.hr ? lerp(S.rear, S.head, clamp((y - S.top) / S.hr)) : y < 560 ? lerp(S.head, S.mid, seg(y, S.top + S.hr, 560)) : lerp(S.mid, S.front, seg(y, 560, CR.SY - 20)); };
  const crSeatFace = (i, side, y) => 960 + i * CR.BW + side * crSeatD(y);
  function crSeat(i, side, part = 'back') {
    const cx = 960 + i * CR.BW, f = side, X = d => cx + f * d, S = CR_SEAT, key = 'crs' + i + side;
    boilSeed('cr seat' + key);
    if (part === 'back') {
      // (drawn point by point, not a spline through the corners: that overshot into a spike at the headrest's rear corner)
      const hw = (S.rear - S.head) / 2, hr = S.hr, P = [[X(S.rear), CR.SY + 60]];
      for (let k = 0; k <= 12; k++) { const a = Math.PI * k / 12; P.push([X(S.head + hw + hw * Math.cos(a)), S.top + hr - hr * Math.sin(a)]); }   // the headrest's rounded top, rear to front
      for (let k = 1; k <= 8; k++) { const y = lerp(S.top + hr, CR.SY - 20, k / 8); P.push([X(crSeatD(y)), y]); }   // the front face, leaning back up to it
      P.push([X(S.front), CR.SY + 60]);
      piece(P, CRC.moq, { sw: 2, shade: CRC.moqDk, depth: 12, key: key + 'b', lift: 5 });
      // the moquette's pattern down its middle
      const fr = crSeatD;
      for (let r = 0; r < 7; r++) { const y = S.top + 42 + r * 46, m = X((S.rear + fr(y)) / 2); if (r % 2) piece(U([[0, -8], [8, 0], [0, 8], [-8, 0]], 1, m, y), CRC.moqB, { ink: null, key: key + 'm' + r, lift: 0, flatCard: true, edge: false }); else dline([[m - 14, y], [m + 14, y]], 1.2, CRC.moqA, 0); }
      piece(rect(Math.min(X(S.rear), X(S.front - 12)), CR.SY + 50, Math.max(X(S.rear), X(S.front - 12)), CR.FY), CRC.wallDk, { sw: 1.4, key: key + 'base', lift: 3 });   // (the plinth under it)
      return;
    }
    // the cushion (drawn over the passenger's seat, under the thighs: part 'cushion'), its rear against the back's front face
    piece(curvy([[X(S.front + 1), CR.SY - 8], [X(S.edge + 14), CR.SY - 4], [X(S.edge), CR.SY + 26], [X(S.edge + 14), CR.SY + 56], [X(S.front + 1), CR.SY + 56]], 3), CRC.moq, { sw: 1.8, shade: CRC.moqDk, depth: 12, key: key + 'c', lift: 4 });
  }
  // (wood: the ending's train, F4 and Z2 (the user: one train, one table): the top O1's woodgrain laminate, honey-toned, its
  // grain along it; the chorus's carriages keep the grey)
  const CR_WOOD = { top: '#B98C5C', mid: '#A77A4C', dk: '#8C6238', lt: '#D2A676' };
  function crTable(i, wood = false) {
    const x = 960 + i * CR.BW;
    boilSeed('cr table' + i);
    piece(rect(x - 14, CR.TY + 20, x + 14, CR.FY), CRC.tableDk, { sw: 1.4, key: 'crtl' + i, lift: 3 });
    piece(b2RoundPoly(rect(x - 120, CR.TY, x + 120, CR.TY + 22), 9), wood ? CR_WOOD.top : CRC.table, { sw: 1.8, rim: wood ? CR_WOOD.lt : CRC.tableLt, key: 'crtt' + i, lift: 5 });   // (rounded, not curvy(): a spline through a thin rect's corners overshot into sword tips at both ends)
    dline([[x - 110, CR.TY + 6], [x + 100, CR.TY + 5]], 1, wood ? CR_WOOD.lt : CRC.tableLt, 0);
    if (wood) for (const [dy, c, w, ph] of [[12, CR_WOOD.mid, .9, .4], [17, CR_WOOD.dk, .7, 2.1]]) { const P = []; for (let u = -108; u <= 104; u += 24) P.push([x + u, CR.TY + dy + 1.2 * Math.sin(u * .05 + ph)]); dline(P, w, c, .5); }
  }
  // Bots, by name, standing on a seat (x, y = the seat top) facing dir (1 right, -1 left); o = options for the rig
  const BOTS = {
    dog: (x, y, f, o) => codex(x, y, 27, { kind: 'dog', view: 'q', flip: f < 0, ...o }),
    crab: (x, y, f, o) => codex(x, y, 27, { kind: 'crab', view: 'q', flip: f < 0, ...o }),
    grok: (x, y, f, o) => grok(x, y, 23, { view: 'q', flip: f < 0, ...o }),
    copilot: (x, y, f, o) => copilot(x, y - 2, 25, { view: 'q', flip: f < 0, ...o }),
    clawd: (x, y, f, o) => clawd2(x, y, 17, { view: 'q', flip: f < 0, ...o }),
    gemini: (x, y, f, o) => gemini(x, y, 22, { view: 'q', flip: f < 0, face: 'same', lanyard: false, ...o }),
    cat: (x, y, f, o) => codex(x, y, 27, { kind: 'cat', view: 'q', flip: f < 0, ...o }),
    term: (x, y, f, o) => codex(x, y, 27, { kind: 'term', view: 'q', flip: f < 0, ...o }),
    muse: (x, y, f, o) => muse(x, y + 20, 22, { view: 'q', flip: f < 0, alt: 2.4, ...o }),
    ghost: (x, y, f, o) => codex(x, y, 27, { kind: 'ghost', view: 'q', flip: f < 0, ...o }),
  };
  // ---- the service, fully automated: every job on the night train is a bot's (the at-seat service, the steward, the tea,
  // the inspector, the cleaner, the next-stop boards), all of them busy and cheerful for the passengers riding it ----
  // small props (hand space; s ≈ the hand size; a held stick points up the hand's -y)
  const pillowProp = s => { piece(curvy([[-1.1 * s, -.6 * s], [1.1 * s, -.7 * s], [1.2 * s, .6 * s], [-1.05 * s, .7 * s]], 4), '#E8E0F0', { sw: 1.2, shade: '#B8AECB', depth: .3 * s, key: 'pillow', lift: 2 }); };
  const blanketProp = s => { piece(rect(-1.1 * s, -.45 * s, 1.1 * s, .45 * s), '#5A7AB0', { sw: 1.2, key: 'blanket', lift: 2 }); for (const y of [-.2, .05, .3]) dline([[-1.05 * s, y * s], [1.05 * s, y * s]], 1, '#D8C890', 0); };
  const dusterProp = s => { push(); rotate(-.5); piece(rect(-.1 * s, -1.4 * s, .1 * s, .2 * s), '#8A5A34', { sw: 1, key: 'dstick', lift: 1, flatCard: true }); piece(curvy(oval(0, -1.8 * s, .55 * s, .5 * s, 0, 12).map(([x, y], i) => [x + (i % 2 ? .12 * s : 0), y]), 2), '#E88AA8', { sw: 1, key: 'dfluff', lift: 1 }); pop(); };
  // the inspector's ticket (a cream card, an orange band, two punched holes) and punch (red handles, a steel jaw); c 0..1 its squeeze
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
  // the cleaner's squeegee: a handle and a rubber blade across its top
  const squeegeeProp = (s, key = 'sqg') => {
    piece(rect(-.12 * s, -2.0 * s, .12 * s, .4 * s), '#E0B040', { sw: 1, key: key + 'h', lift: 2, flatCard: true });
    piece(curvy(rect(-1.25 * s, -2.36 * s, 1.25 * s, -1.96 * s), 2), '#A8ACB4', { sw: 1, key: key + 'm', lift: 3 });
    piece(rect(-1.25 * s, -2.5 * s, 1.25 * s, -2.36 * s), '#2A2632', { ink: null, key: key + 'r', lift: 0, flatCard: true, edge: false });
  };
  // A job done: a small green tick springs up over the bot and melts away (p 0..1)
  function doneTick(x, y, p, key = 'tick') {
    if (p <= 0 || p >= 1) return;
    const r = 24 * backOut(clamp(p * 3.5)) * (1 - easeIn(seg(p, .55, 1))), yy = y - 34 * ease(p);
    if (r < 1) return;
    boilSeed(key);
    piece(oval(x, yy, r, r, 0, 16), '#43A047', { sw: 1.2, key: key + 'd', lift: 4, flatCard: true });
    piece([[-.56, .02], [-.33, -.2], [-.1, .04], [.36, -.46], [.58, -.24], [-.1, .44]].map(([a, b]) => [x + a * r, yy + b * r]), '#FFFFFF', { ink: null, key: key + 'k', lift: 0, flatCard: true, edge: false });
  }
  // The next-stop board on the pillar between two windows (the train's own display: pictograms, no words): a dark panel,
  // an amber arrow and the next stop, a tower block (the office) or a house under a crescent moon (home). f 0..1: its
  // flip from the office to home: the split flap squashes shut on its hinge and opens on the new card (to .55), then it
  // lights up (to 1). f = 1: home, lit.
  function stopBoard(x, y, f = 1, key = 'sb') {
    const w = 110, h = 80, q = clamp(f), fl = seg(q, 0, .55), open = Math.abs(Math.cos(Math.PI * fl)), home = fl >= .5, lit = home ? ease(seg(q, .5, 1)) : 0;
    const amb = mixCol('#8A6030', '#FFC45E', lit), P = { ink: null, lift: 0, flatCard: true, edge: false };
    boilSeed(key);
    piece(curvy(rect(x - w / 2 - 7, y - h / 2 - 7, x + w / 2 + 7, y + h / 2 + 7), 2), '#5E5866', { sw: 1.4, key: key + 'bz', lift: 3 });
    piece(rect(x - w / 2, y - h / 2, x + w / 2, y + h / 2), '#141218', { ...P, key: key + 'p' });
    if (lit > 0) glow(x + 8, y, 80, '#FFB45E', .4 * lit);
    push(); translate(x, y); scale(1, Math.max(.05, open));   // (the card on the flap)
    piece([[-47, -11], [-33, 0], [-47, 11]], amb, { ...P, key: key + 'ar' });
    if (home) {
      piece([[-18, 30], [-18, 5], [0, -13], [18, 5], [18, 30]], amb, { ...P, key: key + 'hs' });
      piece(rect(-5, 14, 5, 30), '#141218', { ...P, key: key + 'dr' });
      piece(oval(34, -20, 10, 10, 0, 14), amb, { ...P, key: key + 'mn' }); piece(oval(39, -25, 9, 9, 0, 14), '#141218', { ...P, key: key + 'mc' });
    } else {
      piece(rect(-14, -30, 14, 32), amb, { ...P, key: key + 'tw' });
      for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) piece(rect(-10 + c * 8, -25 + r * 11, -5 + c * 8, -19 + r * 11), '#141218', { ...P, key: key + 'w' + r + c });
    }
    pop();
    dline([[x - w / 2, y], [x + w / 2, y]], 1.8, '#050407', 0);   // the flap's hinge
  }
  // The first chorus's crew: [bay, side (a seat), bot, its job]: Grok the at-seat service (flutes), Clawd the steward
  // (plumping pillows), Muse (Jolly) photographing the commuter dozing in bay 0's right seat (a gag: afloat over the table's
  // end), the Gemini twins the tea (a gag: poured properly, from high up), the terminal dusting, the ghost cheering a
  // blanket in, Copilot's double with a pillow. (Copilot itself is the inspector, up on bay 0's table; the cleaner is on a
  // sill: chorusA.) (Muse had a tray of canapés in bay -1's right seat, hidden behind her; Clawd moved from bay 0's right
  // seat to its left one, so the dozing commuter shows whole: C1b and C1c's close shots on her leave that seat out.)
  const CREW1 = [[-1, -1, 'grok', 'tray'], [0, -1, 'clawd', 'pillow'], [0, 1, 'muse', 'photo'], [1, -1, 'gemini', 'pour'], [1, 1, 'term', 'duster'], [-2, 1, 'ghost', 'blanket'], [2, -1, 'copilot2', 'pillow']];
  const CREW1_SIT = () => [museSitter(0, 1)];   // (its commuters: their seats kept from the crowd)
  function botAt(name, x, y, f, o) {
    if (name === 'copilot2') name = 'copilot';
    return BOTS[name](x, y, f, o);
  }
  // one bot at its job: a small repeating action, cheerful, facing across its table; returns the rig's anchors. o.hit 0..1:
  // the ripple reaching it on "automated" (C1a, C2a): the job's flourish (the tray lifted, the pillow plumped with a feather
  // or two, the duster flicked), pleased with the job. The twins, Muse, the cat and the ghost have gags (GAG, below)
  function botTask(t, l, i, side, name, task, o = {}) {
    const [sx, sy] = crSeatAt(i, side), ph = hash(i * 7.1 + side * 3.3), b = bpOf(t) + ph * 2, bob = Math.abs(Math.sin(b * Math.PI));
    if (GAG[task]) return GAG[task](t, l, i, side, o);   // (the gags: their own staging round the seat, below)
    if (!seen(sx + (o.dx || 0), 160)) return null;
    const hp = o.hit > 0 && o.hit < 1 ? Math.sin(Math.PI * Math.sqrt(o.hit)) : 0;
    const mood = feel(o.mood || (hp > .3 ? 'proud' : ph > .5 ? 'happy' : 'proud'), t + ph), f = o.face ?? -side;
    const opt = { ...mood, emote: null, boilKey: 'bt' + name + i + side, seed: ph * 5, lookX: .3, lookY: .3, ...o.opt };
    opt.dy = (opt.dy || 0) - .35 * hp;
    if (name === 'grok') opt.pose = 'serve', opt.tray = 'flutes';
    else if (name === 'muse') opt.pose = 'tray', opt.tray = 'canapes';
    else if (name === 'clawd') { opt.pose = 'hug'; opt.dy += -.3 * bob; }
    else if (name === 'term' || name === 'cat') { opt.pose = { R: [1.9 + .5 * hp, -3.2 - .5 * bob - 1.1 * hp, .25, 'hold', 1] }; opt.hold = dusterProp; }
    else if (name === 'ghost') { opt.pose = 'cheer'; }
    else if (name === 'copilot' || name === 'copilot2') { opt.pose = 'present'; opt.card = task === 'blanket' ? blanketProp : pillowProp; }
    boilSeed('crp' + i + side);
    const A = botAt(name, sx + (o.dx || 0), sy - 6 + (o.dyy || 0), f, opt);
    if (name === 'clawd') {
      const px = sx + (-side) * 40, py = sy - 70 - 6 * bob - 8 * hp;
      boilSeed('clpillow'); push(); translate(px, py); scale(1 + .22 * hp, 1 - .14 * hp); pillowProp(26); pop();
      if (o.hit > 0 && o.hit < 1) for (let j = 0; j < 3; j++) { const q = o.hit, a = -1.9 + j * .9; boilSeed('clf' + j); piece(curvy(oval(px + Math.cos(a) * (30 + 60 * q), py + Math.sin(a) * (20 + 50 * q) + 40 * q * q, 7, 3.5, a + q * 3, 8), 2), '#F4F0FA', { sw: .8, key: 'clfeather' + j, lift: 3 }); }
    }
    return A;
  }

  // ======================================================================================================
  // THE GAGS (the user, 1:05, on the twins' cups held up on their sides: "maybe have them doing something else or holding
  // something else. We could have so many gags of the bots doing random things in all the different choruses"). Each is
  // one clear read that lands on a beat; the second chorus's escalate the first's. A gag is a crew job (CREW1, CREW2: task
  // = a GAG name) that stages itself round its seat, the commuter it's for included.
  //   C1a  the Gemini twins: tea done properly: one holds the cup and saucer dead level, the other lifts the teapot up high
  //        and the long stream lands in the cup on the beat before "automated" (the ripple's first job)
  //        Muse (Jolly): a polite photo of a commuter dozing in the next seat with the Charm; the flash pops on "Fully";
  //        the commuter sleeps on
  //   C2a  the twins fold a napkin into a swan together and present it with a bow; the Codex cat shines a sleeping
  //        commuter's shoes (a buff on each beat, a sparkle on the toe); the ghost tucks a sleeper in on the luggage rack
  //        and reads it a bedtime story from a tiny book
  const beatNear = t => BEATMAP.beats.reduce((a, b) => Math.abs(b - t) < Math.abs(a - t) ? b : a);
  const CRS = { hip: -5.2, hy: -11.4, sh: -9.5 };   // (crowd.js's figure heights, u: its CR is this file's carriage here)
  const TEA = { brew: '#8A4A22', brewLt: '#C07A40', china: '#F7F3EA', chinaDk: '#D6CCBA', chinaIn: '#E6DDCC', pot: '#7C3A1C', potDk: '#4E200E', potLt: '#C27A4A' };
  // A cup of tea on its saucer, level whatever the hand does (call it after b2Upright: world axes), the saucer's near edge
  // in the hand at (0, 0), the rest toward dir; s = u. fill 0..1: the tea in it. Returns the cup's mouth (local).
  function cupSaucer(s, dir, fill, key) {
    const cx = dir * .5 * s, sy = .02 * s, top = sy - .56 * s, bot = sy - .08 * s;
    piece(curvy(oval(cx, sy, .64 * s, .1 * s, 0, 18), 2), TEA.china, { sw: .9, shade: TEA.chinaDk, depth: .05 * s, key: key + 'sc', lift: 2, flatCard: true });
    dline([[cx + dir * .3 * s, top + .1 * s], [cx + dir * .55 * s, top + .1 * s], [cx + dir * .54 * s, top + .3 * s], [cx + dir * .26 * s, top + .36 * s]], 1.3, TEA.chinaDk, .5);   // the handle
    piece([[cx - .36 * s, top], [cx + .36 * s, top], [cx + .25 * s, bot], [cx - .25 * s, bot]], TEA.china, { sw: 1, shade: TEA.chinaDk, depth: .07 * s, key: key + 'cup', lift: 3, flatCard: true });
    // its mouth, seen from a little above: the china inside, the tea's surface in it rising as it fills
    piece(oval(cx, top, .35 * s, .075 * s, 0, 16), TEA.chinaIn, { ink: null, key: key + 'in', lift: 0, flatCard: true, edge: false });
    if (fill > .02) piece(oval(cx, top + .02 * s * (1 - fill), .33 * s * lerp(.6, 1, fill), .06 * s * lerp(.6, 1, fill), 0, 16), TEA.brew, { ink: null, key: key + 'tea', lift: 0, flatCard: true, edge: false });
    return [cx, top];
  }
  // A Brown Betty teapot (world axes: after b2Upright) held by its handle at (0, 0), the spout toward dir, tipped by tilt
  // (rad, + tips the spout down); s ≈ its body's radius. Returns its spout's tip (local) and the way the spout points.
  function teapot(s, dir, tilt, key) {
    const C = [1.2 * s, .05 * s];
    push(); scale(dir, 1); rotate(tilt);
    piece(ribbon(through([[C[0] - .75 * s, C[1] - .5 * s], [.1 * s, -.5 * s], [-.12 * s, 0], [.1 * s, .42 * s], [C[0] - .72 * s, C[1] + .42 * s]], 4), .2 * s, .2 * s), TEA.pot, { sw: .9, key: key + 'hd', lift: 2, flatCard: true });
    piece(ribbon(through([[C[0] + .55 * s, C[1] + .35 * s], [C[0] + 1.15 * s, C[1] + .12 * s], [C[0] + 1.5 * s, C[1] - .3 * s], [C[0] + 1.72 * s, C[1] - .62 * s]], 4), .36 * s, .14 * s), TEA.pot, { sw: .9, shade: TEA.potDk, depth: .06 * s, key: key + 'sp', lift: 2 });
    piece(curvy(oval(C[0], C[1], .98 * s, .8 * s, 0, 28), 2), TEA.pot, { sw: 1.1, shade: TEA.potDk, depth: .28 * s, key: key + 'bd', lift: 3 });
    piece([[C[0] - .55 * s, C[1] - .62 * s], [C[0] - .3 * s, C[1] - .9 * s], [C[0] + .3 * s, C[1] - .9 * s], [C[0] + .55 * s, C[1] - .62 * s]], TEA.pot, { sw: .9, shade: TEA.potDk, depth: .05 * s, key: key + 'ld', lift: 2, flatCard: true });
    piece(oval(C[0], C[1] - 1.0 * s, .15 * s, .12 * s, 0, 12), TEA.potDk, { sw: .8, key: key + 'kn', lift: 2, flatCard: true });
    piece(oval(C[0] - .38 * s, C[1] - .32 * s, .26 * s, .12 * s, -.55, 12), TEA.potLt, { ink: null, op: 190, key: key + 'gl', lift: 0, flatCard: true, edge: false });   // (the glaze's shine)
    pop();
    const T0 = [C[0] + 1.72 * s, C[1] - .62 * s], c = Math.cos(tilt), sn = Math.sin(tilt), a = Math.atan2(-.32, .22) + tilt;
    return { tip: [dir * (T0[0] * c - T0[1] * sn), T0[0] * sn + T0[1] * c], dir: [dir * Math.cos(a), Math.sin(a)] };
  }
  // The tea's stream from the spout's tip S into the cup's mouth E (world): out of the spout and falling (x on the clock, y
  // on its square); head, tail 0..1: how far its front has fallen, how far its end has left the spout.
  function teaStream(S, E, head, tail, w, key) {
    if (head <= tail + .01) return;
    const P = []; for (let i = 0; i <= 14; i++) { const q = lerp(tail, head, i / 14); P.push([lerp(S[0], E[0], q), S[1] + (E[1] - S[1]) * q * q]); }
    piece(ribbon(P, w, w * .7), TEA.brew, { sw: .6, key, lift: 1, flatCard: true });
    if (P.length > 4) dline(P.slice(1, -2).map(([x, y]) => [x - w * .2, y]), .7, TEA.brewLt, .4);
  }
  // A commuter dozing in a seat (the gags' sleepers): the rush-hour crowd's human silhouette (crowd.js crSide, in the seat
  // passengers' tone, the strip light's rim along its top) sat down, the hip at (x, y) (the cushion's top), facing dir,
  // reclined by lean (rad), the head nodded forward (slump), one closed eye (the crowd is faceless: a sleeper gets a closed
  // eye, as the bot passengers doze). o: u, seed, build, t (its slow breathing), feet (a world point the heels rest on: its
  // feet up), knee / floor (else: the knee over the cushion's edge at world x knee, the foot flat on the floor at y floor;
  // else the shins hang off the seat's front), shoes (their colour: shoes to shine), key. Returns world anchors:
  // head, eye, toe (the near shoe's toe), heel, lap.
  function commuterSit(x, y, o = {}) {
    let u = o.u || 32; const dir = o.dir || 1, B = crowdBuild(o.seed || 7, { bag: 'none', ...o.build }), H = B.ht, key = o.key || 'csit';
    const t = o.t || 0, br = .09 * Math.sin(t * TAU / 3.6 + (o.seed || 0)), sl = o.slump ?? .85, lean = o.lean ?? .1, col = o.col || '#46405A';
    const S = crSide(B, { slump: sl, breath: br, tilt: o.tilt || 0 }), hipY = CRS.hip * H, c = Math.cos(-lean), s = Math.sin(-lean);
    const up = ([px, py]) => { const X = px, Y = py - hipY; return [X * c - Y * s, X * s + Y * c]; };   // (the upper body, round the hip)
    const upper = S => crSeated(S.parts, H).filter(([, n]) => !/^(lf|ln|case|handle|tote|arm|hand)/.test(n)).map(([P, n]) => [P.map(up), n]);   // (crowd.js crSeated: the coat cut off at the seat)
    // (o.face, o.maxTop: sat against the seat back, never through it or over its headrest (crowd.js crSeatFit), placed once
    // from its resting pose so it doesn't creep as it breathes)
    if (o.face) ({ x, u } = crSeatFit(upper(crSide(B, { slump: sl, breath: 0, tilt: o.tilt || 0 })), x, y, u, dir, o.face, o.maxTop));
    const parts = upper(S);
    // the near arm: from the shoulder down to the hand on the thigh
    const shY = CRS.sh * H + .22 * sl + br, S0 = up([-.05, shY + .5]), Wr = [1.55, -.35], E0 = [lerp(S0[0], Wr[0], .45) - .35, lerp(S0[1], Wr[1], .5) + .2];
    const arm = [[ribbon([S0, E0, Wr], .82, .62), 'arm'], [oval(Wr[0] + .1, Wr[1] + .05, .36, .34, 0, 10), 'hand']];
    // the legs (hip at (0, 0), +x forward): the far one a touch back; feet up to a world point, or the shins down
    const T1 = 2.55 * H, T2 = 2.45 * H, legs = [];
    const leg = (dx, dy, nm) => {
      let K, A, fa = 0;
      if (o.feet) {
        const hx = (o.feet[0] - x) * dir / u + dx, hy = (o.feet[1] - y) / u + dy, A0 = [hx + .15, hy - .3], d = Math.hypot(A0[0], A0[1]), L = T1 + T2;
        const nx = A0[0] / d, ny = A0[1] / d, bend = d >= L ? 0 : Math.sqrt(Math.max(0, T1 * T1 - (d / 2) * (d / 2)));
        A = d >= L ? [nx * L, ny * L] : A0; K = [A[0] / 2 + ny * bend * .95, A[1] / 2 - nx * bend * .95]; fa = -1.05;   // (the knee up a little; the heel down on its rest, toes up)
      } else if (o.knee != null) { K = [Math.abs(o.knee - x) / u + dx, -.15 + dy]; A = [K[0] + .3 + .6 * dx, (o.floor - y) / u - .02]; }   // (the knee over the cushion's edge, the foot flat on the floor: crowd.js crowdSit)
      else { K = [T1 + dx, .1 + dy]; A = [K[0] + .35, K[1] + T2]; }
      const foot = [[-.35, -.35], [.25, -.42], [.95, -.08], [.9, .02], [-.35, .02]].map(([fx, fy]) => { const cc = Math.cos(fa), ss = Math.sin(fa); return [A[0] + fx * cc - fy * ss, A[1] + fx * ss + fy * cc]; });
      legs.push([ribbon([[dx * .3, dy * .3], K, A], 1.0, .74), nm], [foot, nm + 'f']);
      return { A, fa };
    };
    leg(-.25, -.12, 'lfar'); const NL = leg(0, 0, 'lnear');
    const pl = P => crPlace(P, x, y, u, 0, dir), fo = { key, lift: 2.5, hole: o.hole || null };
    boilSeed('csit ' + key);
    push(); if (STYLE.card) { translate(x, y); nudge(key, .6); translate(-x, -y); }
    for (const [P, n] of legs) crPaint(pl(P), col, fo, n);
    for (const [P, n] of parts.concat(arm)) crPaint(pl(P), col, fo, n);
    crRim(parts.concat(arm), pl, col, u, { rim: '#EDEBDC', rimK: .45, hole: o.hole });
    // the shoes (to shine): dark leather over the feet, a shine along the toe cap
    const toeAt = (fx, fy) => { const cc = Math.cos(NL.fa), ss = Math.sin(NL.fa); return [NL.A[0] + fx * cc - fy * ss, NL.A[1] + fx * ss + fy * cc]; };
    if (o.shoes) {
      for (const [P, n] of legs.filter(([, n]) => /f$/.test(n))) crPaint(pl(P), o.shoes, { ...fo, flat: true }, n + 's');
      crPale(pl(strokeShape([toeAt(.1, -.36), toeAt(.55, -.32), toeAt(.85, -.12)], k => .06 + .08 * Math.sin(Math.PI * k), 5)), mixCol(o.shoes, '#E8ECF8', o.shineBeat ? .3 + .55 * Math.exp(-frac(bpOf(t)) * 4) : .3), fo, 'shine');   // (polished: the toe cap's shine, brightest on the buff: shineBeat)
    }
    // the closed eye: a pale arc on the face, turned with the nodding head
    // (high on the face, toward its front: lower down, a single arc read as a smile)
    const th = (o.tilt || 0) + .3 * sl, h0 = [.12, CRS.hy * H + .38 * sl + br * .5], hc = up(h0), E = up([h0[0] + .6 * Math.cos(th) + .3 * Math.sin(th), h0[1] + .6 * Math.sin(th) - .3 * Math.cos(th)]);
    const lid = strokeShape([[E[0] - .2, E[1] - .02], [E[0], E[1] + .07], [E[0] + .18, E[1] - .01]], k => .1 + .08 * Math.sin(Math.PI * k), 5);
    crPale(pl(lid), mixCol(col, '#E6E8F0', .62), fo, 'eye');
    pop();
    return { head: pl([hc])[0], eye: pl([E])[0], toe: pl([toeAt(.95, -.2)])[0], heel: pl([toeAt(-.3, -.1)])[0], lap: pl([[1.3, -.6]])[0] };
  }
  // A flash going off at (x, y) toward dir: a white burst of rays and light (p 0..1 over its life, peaking at once), and
  // a little card star popping out of it and spinning away
  function flashBurst(x, y, dir, p, key) {
    if (p <= 0 || p >= 1) return;
    const k = 1 - easeOut(p), r = 70 * backOut(clamp(p * 6)) * (.6 + .4 * k);
    boilSeed(key);
    glow(x, y, 150 * (.4 + .6 * k), '#FFFFFF', .9 * k);
    if (p < .3) {   // (the rays shrink away rather than fade: faded, white on the dark carriage went grey)
      const rk = 1 - easeIn(seg(p, .12, .3)), P = []; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + .1, rr = (i % 2 ? r * .22 : r * (i % 4 ? .7 : 1)) * rk; P.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
      if (rk > .05) piece(P, '#FFFFFF', { ink: null, key: key + 'b', lift: 0, flatCard: true, edge: false });
    }
    const sp = seg(p, .05, 1), sx = x + dir * 60 * easeOut(sp), sy = y - 55 * easeOut(sp) + 30 * sp * sp, sr = 11 * backOut(clamp(sp * 4)) * (1 - easeIn(seg(sp, .7, 1)));
    if (sr > 1) piece(starPts(sx, sy, sr, .45, 5, -Math.PI / 2 + dir * sp * 2.2), '#FFE68A', { sw: .9, key: key + 's', lift: 3 });
  }
  const CHS_U = 1.45;   // the Muse Charm's width (u): as in her hand (verse1.js: 1.75 u), a touch smaller in Jolly's mitt
  // Muse (Jolly), afloat beside a commuter dozing in the next seat (the seat at bay i, side), takes a polite photo of them
  // with the Charm (its own black puck, held up in both mitts, its glass to them, lined up on their face): the flash pops on
  // o.flash (song time: a white burst, a little card star); the commuter sleeps on; it lowers the Charm to admire the shot
  // (the glass to it). No o.flash: admiring it (C1c's wide after the bill; C1b's and C1c's close shots leave it out: it
  // floated in front of the window C1c pushes into). Returns the Muse's anchors.
  function musePhoto(t, l, i, side, o = {}) {
    const [sx] = crSeatAt(i, side), u = 22, dir = side, C = SIT['mp' + i + side];   // (the commuter against the seat back, facing the table; Jolly toward it)
    const tf = o.flash, rel = tf == null ? 9 : l - tf, low = tf == null;
    const flashP = tf == null ? 0 : clamp((l - tf + .03) / .5), after = ease(seg(rel, .45, .8));
    const cx = sx - side * 105, cyM = (C ? C.head[1] + 22 : 612) + 4 * Math.sin(l * 1.7);   // (Jolly's middle: afloat just over the table's end, the Charm held level with the commuter's face)
    if (!seen(cx, 260)) return null;
    const aim = low ? 0 : 1 - after, click = tf != null && rel >= 0 && rel < .12 ? 1 : 0;
    const mood = low ? feel('happy', t + 2) : rel < 0 ? { ...feel('determined', t), eyes: 'normal', mouth: 'smile' } : rel < .45 ? feel('excited', t) : feel('happy', t + 1);
    const Mc = b2Mat(); let lens = null;
    const charm = hs => {   // (the Charm in the far mitt, upright; seen from its side, its glass to the commuter (aim) or to Jolly)
      push(); btUpright(Mc); translate(dir * .1 * CHS_U * u, -.35 * CHS_U * u); rotate(dir * lerp(-.15, .12, aim));
      const s = CHS_U * u; push(); scale(dir * (aim > .5 ? -1 : 1) * .42, 1);   // (turned: its glass narrowed away from us, to one side)
      museCharm(0, 0, s, { turn: 1, out: 1, boilKey: 'mpch' + i, frame: Mc });
      pop();
      lens = btTo(Mc, [dir * .16 * s, -.36 * s]);
      pop();
    };
    const pose = { L: [lerp(.9, 1.3, 1 - aim), lerp(2.3, 1.4, 1 - aim), .2, 'relax', 1], R: [lerp(3.2, 2.2, 1 - aim), lerp(-1.1, .35, 1 - aim), .25, 'hold', 1] };   // (the near mitt easy on its tummy: up at the Charm it hid its face)
    const A = muse(cx, cyM + 5.7 * u, u, { view: 'q', flip: dir < 0, alt: 3.2, float: false, ...mood, emote: null, take: .5 * click, lookX: .7 * aim, lookY: lerp(.2, .8, 1 - aim), pose, hold: charm, boilKey: 'mp' + i, seed: 4 });
    // the flash, from the Charm's side toward the commuter; its light on their face for a frame or two
    if (lens && flashP > 0 && flashP < 1) { flashBurst(lens[0] + dir * 6, lens[1], dir, flashP, 'mpfl' + i); if (flashP < .12 && C) glow(C.head[0], C.head[1], 70, '#FFFFFF', .55); }
    return A && { ...A, top: A.top };
  }
  // The Gemini twins' tea, side by side facing each other at the seat's front (bay i, side), their hands let go for it:
  // A holds the cup and saucer out dead level, B the teapot. o.land: the song time the stream lands in the cup (the pot
  // lifted up high, tipped, the long stream, set back down); o.every: an idle pour every so often (the windows from outside,
  // o.at: the pair's ground point, o.u). Nothing tips but the pot, and its spout points at the cup.
  function twinsPour(t, l, i, side, o = {}) {
    const u = o.u || 22, f = o.f ?? -side, [x, y] = o.at || [crSeatAt(i, side)[0], CR.SY - 6], gp = 2.75, key = o.key || 'tp' + i;
    if (!o.at && !seen(x, 200)) return null;
    let tl = o.land;
    if (tl == null && o.every) { const P = o.every, ph = o.ph || 0; tl = Math.floor((l + ph) / P) * P - ph + .6 * P; }
    const rel = tl == null ? 9 : l - tl, empty = tl != null && rel < 0 && !o.every;
    const up = ease(seg(rel, -.6, -.26)) * (1 - ease(seg(rel, .56, .92))), tip = ease(seg(rel, -.26, -.14)) * (1 - ease(seg(rel, .4, .52)));
    const head = seg(rel, -.14, 0), tail = seg(rel, .42, .55), fill = empty ? .05 : tl == null || o.every ? .9 : lerp(.05, .95, seg(rel, 0, .45));
    const hp = o.hit > 0 && o.hit < 1 ? Math.sin(Math.PI * o.hit) : 0, pleased = hp > .2 || (rel > 0 && rel < 1.2);
    const moodA = feel(pleased ? 'proud' : 'happy', t + .3), moodB = up > .3 ? { ...feel('excited', t + .8), eyes: 'normal', mouth: 'smile' } : feel(pleased ? 'proud' : 'happy', t + .8);   // (intent on it, not 'determined': its V-brows read as cross)
    const base = { view: 'q', flip: f < 0, face: 'in', lanyard: false, emote: null, noShadow: !!o.at, seed: 3 };
    let E = null, S = null;
    const McA = b2Mat();
    const cup = () => { push(); b2Upright(McA); const m = cupSaucer(1.15 * u, f, fill, key + 'c'); E = b2To(McA, m); pop(); };
    // A: the cup held out toward B at its middle, level; the other arm easy at its side
    boilSeed(key + 'A');
    const RA = gemini(x - f * gp * u, y, u, { ...base, ...moodA, solo: 'A', pose: { O: [-2.0, -1.2, .2, 'relax'], I: [2.0, -1.55, .15, 'hold', 1, -.1] }, holdIn: cup, lookX: .5, lookY: .7, boilKey: key + 'A' });
    // B: the pot at the ready by its chest, or lifted up high over the cup and tipped; its other arm up for the flourish
    const McB = b2Mat();
    const pot = () => { push(); b2Upright(McB); const P = teapot(.7 * u, -f, .85 * tip, key + 'p'); S = b2To(McB, P.tip); pop(); };
    boilSeed(key + 'B');
    const RB = gemini(x + f * gp * u, y, u, { ...base, ...moodB, solo: 'B', dy: -.3 * up, pose: { O: [lerp(-2.0, -2.3, up), lerp(-1.3, -3.9, up), .2, up > .4 ? 'open' : 'relax'], I: [lerp(1.35, .95, up), lerp(-3.1, -5.55, up), .2, 'hold', 1, lerp(-.2, -1.35, up)] }, holdIn: pot, lookX: .5, lookY: lerp(.5, .9, tip), boilKey: key + 'B' });
    if (S && E) teaStream(S, [E[0], E[1] + .02 * u], head, tail, .2 * u, key + 'st');
    const top = RA && RA.top;
    return { top: top && RB && RB.top ? [(RA.top[0] + RB.top[0]) / 2, Math.min(RA.top[1], RB.top[1])] : top, hands: {} };
  }
  // the gags' commuters, drawn by the carriage (after the crowd's passengers, before the tables: carriage's o.sitters) with
  // their seats kept from the crowd (o.crowd.seatSkip); their anchors this frame, for the bots that tend them
  const SIT = {};
  // Muse's dozing commuter: in the seat at bay i, side, against its back, facing the table
  // (the gags' commuters sit as the crowd does, at its scale, against the seat back: crSit)
  const crSit = (i, side) => ({ u: CR_SIT_U, face: y => crSeatFace(i, side, y), maxTop: CR_SEAT.top + CR_SEAT.hr + 8 });
  const museSitter = (i, side) => ['mp' + i + side, 960 + i * CR.BW + side * 230, CR.SY - 8, { ...crSit(i, side), dir: -side, seed: 11, build: { head: 'short', top: 'coat' }, slump: .9, lean: .02, knee: 960 + i * CR.BW + side * (CR_SEAT.edge + 4), floor: CR.FY }];
  function sitters(t, list, hole = null) { for (const [id, x, y, opt] of list) SIT[id] = commuterSit(x, y, { t, ...opt, hole, key: id }); }   // (hole: C1a/C2a's poster, kept clear as the crowd keeps it)
  // ---- the second chorus's gags ----
  // The napkin swan (world axes), its middle at (x0, y0), s = u; k: how far it's folded (0 a square held by two corners,
  // 1 folded in half, 2 the swan: its body, the neck up, a wing out to each hand). part 'L': the left wing alone, 'R': the
  // rest (each drawn with the twin whose hand holds it, so the glove closes over its wing tip); hands: where the wing
  // tips are held
  const lerp2 = (a, b, q) => [lerp(a[0], b[0], q), lerp(a[1], b[1], q)];
  const NAP = { cloth: '#FBF9F3', shade: '#D9D4C8', line: '#C9C2B4', beak: '#E8903A', eye: '#2A2632' };
  function napkinSwan(x0, y0, s, k, part, hands, key) {
    const [hL, hR] = hands, P = { ink: null, lift: 0, flatCard: true, edge: false };
    if (k < 1) {   // the napkin: a square hanging from two corners (the fold line down its middle once it's been creased)
      if (part !== 'R') return;
      const top = Math.min(hL[1], hR[1]) - .9 * s, bot = Math.max(hL[1], hR[1]) + 1.25 * s;
      piece(curvy([hL, [x0, top], hR, [x0 + .1 * s, bot]], 3), NAP.cloth, { sw: .9, shade: NAP.shade, depth: .2 * s, key: key + 'sq', lift: 3 });
      dline([[x0, top + .1 * s], [x0 + .05 * s, bot - .1 * s]], .8, NAP.line, .3);
      return;
    }
    if (k < 2) {   // folded in half: a triangle, its fold along the top between the hands; then its sides rolled in, the neck's point turned up
      if (part !== 'R') return;
      const my = (hL[1] + hR[1]) / 2;
      if (k < 1.5) {
        piece(curvy([hL, [x0, Math.min(hL[1], hR[1]) - .12 * s], hR, [x0 + .05 * s, my + 1.2 * s]], 2), NAP.cloth, { sw: .9, shade: NAP.shade, depth: .18 * s, key: key + 'tr', lift: 3 });
        dline([[x0 - .6 * s, my + .15 * s], [x0 + .05 * s, my + .9 * s], [x0 + .6 * s, my + .15 * s]], .8, NAP.line, .4);
      } else {
        piece(curvy([hL, [x0 - .3 * s, my - .1 * s], [x0, my - 1.1 * s], [x0 + .3 * s, my - .1 * s], hR, [x0 + .5 * s, my + .5 * s], [x0, my + .75 * s], [x0 - .5 * s, my + .5 * s]], 2), NAP.cloth, { sw: .9, shade: NAP.shade, depth: .18 * s, key: key + 'kt', lift: 3 });
        dline([[x0, my - 1.0 * s], [x0, my + .65 * s]], .8, NAP.line, .3);
        for (const sd of [-1, 1]) dline([[x0 + sd * .25 * s, my - .15 * s], [x0 + sd * .45 * s, my + .45 * s]], .7, NAP.line, .3);
      }
      return;
    }
    // the swan, from the front: a plump pleated body, a wing up and out to each hand, the neck an S, the head in profile
    const by = Math.max(hL[1], hR[1]) + .55 * s, wing = (h, sd) => {
      const root = [x0 + sd * .45 * s, by - .15 * s], low = [x0 + sd * .95 * s, by + .3 * s];
      piece(curvy([root, [lerp(root[0], h[0], .5) + sd * .1 * s, lerp(root[1], h[1], .5) - .25 * s], h, [h[0] - sd * .1 * s, h[1] + .45 * s], low], 3), NAP.cloth, { sw: .9, shade: NAP.shade, depth: .15 * s, key: key + 'w' + sd, lift: 3 });
      for (const q of [.35, .6, .82]) dline([lerp2(root, low, .5), [lerp(root[0], h[0], q) + sd * .05 * s, lerp(root[1], h[1], q) + .12 * s]], .7, NAP.line, .3);   // (the pleats)
    };
    if (part === 'L') { wing(hL, -1); return; }
    piece(curvy(oval(x0, by, .8 * s, .5 * s, 0, 18), 2), NAP.cloth, { sw: 1, shade: NAP.shade, depth: .18 * s, key: key + 'bd', lift: 3 });
    for (const dx of [-.4, 0, .4]) dline([[x0 + dx * s, by - .3 * s], [x0 + dx * 1.15 * s, by + .35 * s]], .7, NAP.line, .3);
    wing(hR, 1);
    piece(ribbon(through([[x0, by - .3 * s], [x0 - .2 * s, by - .75 * s], [x0 + .05 * s, by - 1.15 * s], [x0 + .02 * s, by - 1.5 * s]], 5), .24 * s, .16 * s), NAP.cloth, { sw: .8, shade: NAP.shade, depth: .04 * s, key: key + 'nk', lift: 3 });
    piece(oval(x0 + .08 * s, by - 1.58 * s, .19 * s, .14 * s, 0, 12), NAP.cloth, { sw: .8, key: key + 'hd', lift: 3, flatCard: true });
    piece([[x0 + .24 * s, by - 1.64 * s], [x0 + .52 * s, by - 1.56 * s], [x0 + .24 * s, by - 1.5 * s]], NAP.beak, { sw: .6, key: key + 'bk', lift: 2, flatCard: true });
    piece(oval(x0 + .12 * s, by - 1.62 * s, .035 * s, .035 * s, 0, 8), NAP.eye, { ...P, key: key + 'ey' });
  }
  // The Gemini twins fold a napkin into a swan together (C2a), side by side facing us at the seat's front (bay i, side)
  // clear of him: each holds a corner of it, it's folded in half, it becomes a swan with a wing in each twin's hand; then
  // they present it, lifted up between them, with a little bow (o.fold [the three folds' times], o.bow: song times in shot
  // time). No times (C2b, C2c): the swan held, presented.
  function twinsSwan(t, l, i, side, o = {}) {
    const u = 22, x = crSeatAt(i, side)[0] + (o.dx ?? 0), y = CR.SY - 6, key = 'sw' + i;
    if (!seen(x, 200)) return null;
    const F = o.fold, bw = o.bow;
    const on = tb => l + 1 / 24 >= tb;   // (the drawing nearest the beat: the puppets step on twos)
    const k = F ? (on(F[2]) ? 2 : on(F[1]) ? 1.5 : on(F[0]) ? 1 : .5) : 2;
    const pres = bw == null ? 1 : ease(seg(l, bw - .1, bw + .06)), bow = bw == null ? 0 : Math.sin(Math.PI * seg(l, bw - .06, bw + .4));
    const hp = o.hit > 0 && o.hit < 1 ? Math.sin(Math.PI * o.hit) : 0;
    const mood = feel(pres > .5 || hp > .2 ? 'proud' : 'happy', t + .4);
    const hy = lerp(-2.2, -3.1, pres), hx = k >= 2 ? 1.55 : 1.7;   // (the hands: the wing tips, lifted to present it)
    const base = { view: 'front', lanyard: false, emote: null, seed: 5, ...mood, lookY: pres > .5 ? -.1 : .7, dy: .45 * bow, sq: .14 * bow, eyes: bow > .3 ? 'happy' : mood.eyes };
    const hands = [null, null], y0 = y + hy * u;
    const McA = b2Mat();
    const wingL = () => { push(); b2Upright(McA); hands[0] = b2To(McA, [0, 0]); pop(); };
    const McB = b2Mat();
    const wingR = () => { push(); b2Upright(McB); hands[1] = b2To(McB, [0, 0]); pop(); };
    // (the swan's middle between the two twins, a touch toward us; drawn in two parts: the left wing with A (under A's
    // glove), the rest with B)
    boilSeed(key + 'A');
    const A = gemini(x - 3.0 * u, y, u, { ...base, solo: 'A', pose: { O: [-2.1, -1.3, .2, 'relax'], I: [hx, hy + .15 * bow, .15, 'hold', 1, -.3] }, holdIn: wingL, boilKey: key + 'A' });
    const hA = hands[0] || [x - .6 * u, y0];
    boilSeed(key + 'nap'); if (k >= 2) napkinSwan(x, y0, 1.35 * u, k, 'L', [hA, [x + .6 * u, y0]], key);
    boilSeed(key + 'B');
    const B = gemini(x + 3.0 * u, y, u, { ...base, solo: 'B', pose: { O: [-2.1, -1.3, .2, 'relax'], I: [hx, hy + .15 * bow, .15, 'hold', 1, -.3] }, holdIn: wingR, boilKey: key + 'B' });
    const hB = hands[1] || [x + .6 * u, y0];
    boilSeed(key + 'nap'); napkinSwan(x, (hA[1] + hB[1]) / 2, 1.35 * u, k, 'R', [hA, hB], key);
    // (the glove closing over each wing tip: the grip's fingers drawn again over the napkin)
    for (const [h, sd] of [[hA, -1], [hB, 1]]) { boilSeed(key + 'gr' + sd); piece(oval(h[0] - sd * .08 * u, h[1] - .05 * u, .2 * u, .24 * u, 0, 12), NOIR.cream, { sw: .8, shade: '#C9BFB0', depth: .06 * u, key: key + 'gr' + sd, lift: 3, flatCard: true }); }
    return { top: A && B && A.top && B.top ? [(A.top[0] + B.top[0]) / 2, Math.min(A.top[1], B.top[1])] : A && A.top, hands: {} };
  }
  // The Codex cat (Seedy) shines a sleeping commuter's shoes (C2a): the commuter in bay i's seat (side), slumped back,
  // feet up on the table's end; the cat up on the table, a cloth held in both hands across the toe, a buff on each beat
  // (the cloth drawn across, a tiny sparkle on the toe); on the ripple (o.hit) a last long buff and a big glint. Returns
  // its anchors.
  const catSitter = (i, side) => ['cs' + i + side, 960 + i * CR.BW + side * 230, CR.SY - 8,
    { ...crSit(i, side), dir: -side, seed: 23, build: { head: 'flatcap', top: 'blazer' }, slump: .75, lean: .2, feet: [960 + i * CR.BW + side * 98, CR.TY + 1], shoes: '#1B1820', shineBeat: true }];   // (slouched: the hips forward on the seat, the back against the seat back, the head in front of the headrest)
  function catShine(t, l, i, side, o = {}) {
    const C = SIT['cs' + i + side], u = 22, x = 960 + i * CR.BW + side * 36, y = CR.TY - 3;   // (on the table, by the shoes; small and crouched: its sprout clear of the poster in the window over it at the start)
    if (!seen(x, 160) || !C) return null;
    const bp = bpOf(t), ph = frac(bp), n = Math.floor(bp), dir = n % 2 ? 1 : -1;   // (a stroke each beat, back and forth)
    const hp = o.hit > 0 && o.hit < 1 ? o.hit : 0, stroke = ease(clamp(ph * 3)), sw = (hp > 0 ? Math.sin(Math.PI * hp) * 1.4 : 1) * lerp(-dir, dir, stroke) * .5;
    const mood = feel(hp > 0 ? 'proud' : 'happy', t + 1.1);
    const toe = [C.toe[0] + side * -7, C.toe[1] - 7], fc = side;   // (the cat faces the shoes: back toward the seat; the cloth over the toe's tip, the shoe below it in view)
    // (the toe in the cat's own frame, forward and up, in the pets' standard frame (codex maps a custom pose's targets onto
    // the kind: Seedy's shoulders at -1.6 u stand for the standard -2.3, its reach .58 u shorter))
    const hx = (toe[0] - x) / u * fc + .58, hy = (toe[1] - y) / u * 2.3 / 1.6;
    const A = codex(x, y, u, { kind: 'cat', view: 'q', flip: fc < 0, ...mood, emote: null, noShadow: false, lookX: .6, lookY: .8, dy: .35, sq: .05, pose: { L: [hx - .55 + sw, hy + .15, .3, 'fist', 1], R: [hx + .35 + sw, hy - .05, .3, 'fist', 1] }, boilKey: 'csc' + i, seed: 6 });
    const hs = A && A.hands;
    if (hs && hs.L && hs.R) {   // the cloth: a yellow duster, stretched between the fists over the toe cap
      boilSeed('cscloth' + i);
      const m = [(hs.L[0] + hs.R[0]) / 2, Math.min(hs.L[1], hs.R[1]) + 3];
      piece(curvy([[hs.L[0], hs.L[1] - 4], [m[0], m[1] - 6], [hs.R[0], hs.R[1] - 4], [hs.R[0] + 2, hs.R[1] + 5], [m[0], m[1] + 4], [hs.L[0] - 2, hs.L[1] + 5]], 3), '#F2C94C', { sw: .8, shade: '#C99A28', depth: 2, key: 'csclo' + i, lift: 3 });
    }
    // the shine: a tiny sparkle on the toe on each beat; the ripple's big one
    const sp = Math.exp(-ph * 5) * (1 - ph), big = hp > .3 ? Math.sin(Math.PI * seg(hp, .3, 1)) : 0;
    glint(C.toe[0] - 3, C.toe[1] - 4, 14 * sp + 20 * big, 'csgl' + i);   // (on the toe cap)
    return A;
  }
  // The ghost (Dewey) tucks in a commuter asleep on the luggage rack over bay i and reads it a bedtime story (C2a): the
  // sleeper stretched out on the rack under the ghost's blanket; the ghost afloat by its head, a tiny book open in its
  // hands, a page turned every two beats; on the ripple (o.hit) it tucks the blanket in (a pat under the sleeper's chin).
  function ghostStory(t, l, i, side, o = {}) {
    const rx = 960 + i * CR.BW, ry = 246, u = 27, gx = rx + 118, gy = 270;   // (the rack slot's middle; the ghost's ground point (it floats): its feet over the rack's rail, clear of the glass C1c/C2c push into)
    if (!seen(rx, 260)) return null;
    // the sleeper: one of the rack's passengers, lying head to the right, eyes shut
    boilSeed('gsz' + i);
    crowdBot(rx, ry, 22, { t, kind: 'copilot', pose: 'lie', dir: 1, doze: true, seed: 3107, col: '#4A445E', eye: '#B8BBCF', rim: '#EDEBDC', rimK: .5, key: 'gssl' + i });
    // the blanket (the ghost's, blue with gold stripes) over it from its feet to its chin, the turned-down edge by its head
    const hp = o.hit > 0 && o.hit < 1 ? o.hit : 0, tuck = hp > 0 ? Math.sin(Math.PI * clamp(hp * 1.6)) : 0;
    boilSeed('gsbl' + i);
    const x0 = rx - 104, x1 = rx + 16 + 3 * tuck, top = ry - 86 + 3 * tuck;
    piece(curvy([[x0, ry + 2], [x0 - 5, top + 30], [x0 + 16, top + 6], [x1 - 30, top], [x1 - 4, top + 8], [x1 + 4, top + 50], [x1 + 2, ry + 2]], 3), '#5A7AB0', { sw: 1.1, shade: '#3E5A8A', depth: 7, key: 'gsblk' + i, lift: 3 });
    piece(curvy([[x1 - 26, top + 1], [x1 - 3, top + 8], [x1 + 4, top + 34], [x1 - 20, top + 30]], 2), '#8FAAD8', { sw: .8, key: 'gsblt' + i, lift: 2, flatCard: true });   // (the turned-down top, under its chin)
    for (const sx of [.25, .5, .72]) dline([[lerp(x0, x1, sx), top + 6], [lerp(x0, x1, sx) + 3, ry]], 1.3, '#D8C890', .3);
    // the ghost: afloat by the sleeper's head, facing it, the book held open in its hand (on the ripple it drifts in and
    // its free hand pats the blanket's edge under the sleeper's chin)
    const bp = bpOf(t), turn = frac(bp / 2), mood = feel(hp > .2 ? 'proud' : 'happy', t + 2.3);
    const Mc = b2Mat(); let bk = null;
    const book = s => { push(); b2Upright(Mc); bk = b2To(Mc, [0, 0]); pop(); };
    const A = codex(gx - 18 * tuck, gy - 6 * tuck, u, { kind: 'ghost', view: 'q', flip: true, ...mood, emote: null, noShadow: true, eyes: tuck > .3 ? 'happy' : 'normal', lookX: .5, lookY: .5,
      pose: { R: [2.0, -2.15, .25, 'hold', 1, -.2], L: [lerp(1.55, 2.7, tuck), lerp(-1.9, -3.3, tuck), .2, tuck > .2 ? 'open' : 'hold', 1, lerp(-.4, -2.2, tuck)] }, hold: book, boilKey: 'gsg' + i, seed: 8 });   // (the tuck: it drifts in and its free hand pats the blanket's edge under the sleeper's chin)
    if (bk) tinyBook(bk[0] - 4, bk[1] - 5, 13, turn, 'gsbk' + i);
    return A;
  }
  // A tiny open book (world axes), its spine at (x, y), each page w wide; turn 0..1: the right-hand page lifting over to
  // the left (only in the first third of it: a page every two beats)
  function tinyBook(x, y, w, turn, key) {
    boilSeed(key);
    const h = w * 1.25, P = { sw: .7, lift: 2, flatCard: true };
    piece([[x - w - 2, y - h / 2 + 2], [x, y - h / 2 + 4], [x + w + 2, y - h / 2 + 2], [x + w + 2, y + h / 2 + 2], [x, y + h / 2 + 4], [x - w - 2, y + h / 2 + 2]], '#B8403A', { ...P, key: key + 'cv' });   // (the cover)
    for (const sd of [-1, 1]) piece([[x, y - h / 2 + 2], [x + sd * w, y - h / 2], [x + sd * w, y + h / 2], [x, y + h / 2 + 2]], '#FBF6E8', { ...P, key: key + 'pg' + sd });
    for (const sd of [-1, 1]) for (let r = 0; r < 3; r++) dline([[x + sd * w * .2, y - h * .25 + r * h * .22], [x + sd * w * .8, y - h * .27 + r * h * .22]], .7, '#9A948A', 0);
    const q = seg(turn, 0, .33);
    if (q > 0 && q < 1) { const e = Math.cos(Math.PI * q) * w; piece([[x, y - h / 2 + 2], [x + e, y - h / 2 - 3 * Math.sin(Math.PI * q)], [x + e, y + h / 2 - 3 * Math.sin(Math.PI * q)], [x, y + h / 2 + 2]], '#FFFDF4', { ...P, key: key + 'turn' }); }
  }
  const GAG = {
    pour: (t, l, i, side, o) => twinsPour(t, l, i, side, { hit: o.hit, land: o.gag && o.gag.land }),
    photo: (t, l, i, side, o) => musePhoto(t, l, i, side, { flash: o.gag && o.gag.flash }),
    swan: (t, l, i, side, o) => twinsSwan(t, l, i, side, { hit: o.hit, fold: o.gag && o.gag.fold, bow: o.gag && o.gag.bow, dx: 125 }),
    shine: (t, l, i, side, o) => catShine(t, l, i, side, { hit: o.hit }),
    story: (t, l, i, side, o) => ghostStory(t, l, i, side, { hit: o.hit }),
  };
  // The at-seat call button, on the aisle side of the seat back beside her pole (C1a, C2a): a cream plate, a round orange
  // button with a service bell on it (no words), a lamp under it. press 0..1 pushes it in; lit 0..1 lights it amber;
  // ring 0..1: the dings going out from it.
  const CALL = [598, 548];
  // dim 0..1: the call answered (C1c/C2c once the sandwich lands): the plate, button and bell sink into the seat back's
  // shadow so they don't compete with the close shots on the sandwich
  function callButton(press = 0, lit = 0, ring = 0, dim = 0) {
    const [x, y] = CALL, P = { ink: null, lift: 0, flatCard: true, edge: false }, dk = c => mixCol(c, '#2E2A36', .72 * dim);
    boilSeed('callbtn');
    piece(curvy(rect(x - 18, y - 28, x + 18, y + 26), 3), dk('#E6E0D0'), { sw: 1.3, key: 'callplate', lift: 3 - 2 * dim });
    if (lit > 0) glow(x, y - 6, 70, '#FFB45E', .7 * lit);
    piece(oval(x - 1.5 * press, y - 6, 14, 14, 0, 16), dk(mixCol('#D8542A', '#FFC45E', lit)), { sw: 1.2, shade: '#9A3A1A', depth: 4 * (1 - press), key: 'callb', lift: 4 - 3 * press });
    const bell = dk('#FFFFFF');
    piece([[x - 7.5, y - 1], [x - 6.5, y - 8], [x - 3, y - 12.5], [x + 3, y - 12.5], [x + 6.5, y - 8], [x + 7.5, y - 1]], bell, { ...P, key: 'callbell' });
    piece(rect(x - 9, y - 1, x + 9, y + 2), bell, { ...P, key: 'callbase' }); piece(oval(x, y - 14, 2, 2, 0, 6), bell, { ...P, key: 'callknob' });
    piece(oval(x, y + 16, 4.5, 4.5, 0, 10), lit > 0 ? '#FFD27A' : '#5A4A3A', { ...P, key: 'calllamp' });
    if (ring > 0 && ring < 1) for (let j = 0; j < 3; j++) {
      const q = clamp(ring * 1.4 - j * .2); if (q <= 0 || q >= 1) continue;
      const r = 24 + 40 * q, A = []; for (let a = -1.35; a <= .25; a += .1) A.push([x + Math.cos(a) * r, y - 6 + Math.sin(a) * r]);
      dline(A, 3.2 * (1 - q), '#FFD27A', .3);
    }
  }
  function carriage(t, l, o = {}) { carriageBack(t, l, o); if (o.cast) o.cast(); carriageFront(t, l, o); }
  // the night service's passengers (demo/cast/crowd.js crowdTrain). o.crowd: { level (1 packed, 2 fuller still, 0 none),
  // skip (bays whose seats stay free), rackSkip, rackSlots(i), sills(i), sillX, sillSkip, hole ([x0, y0, x1, y1] kept
  // clear: the poster in its window), commute (the rush hour: the chorus's carriage, CREW_CROWD) }. Default: the late
  // train: bot passengers, bay 0 free (the narrators' seats in F4, Z2), most of them asleep. The chorus (commute): one
  // coherent rush-hour carriage: commuters in every seat, bots on the racks among the bags, the sills clear, a few
  // standers in the aisle at the straps where no crew is (CREW_CROWD, the same in every shot of a chorus); C1a/C2a add
  // rush for the roar-in. (rackBag: the shell's bag on rack i (crShell), its place kept: in C2a, with no bags, the porters'
  // bags are on their way up)
  const crowdOf = o => { const c = o.crowd || {};
    return { CR, i0: o.i0 ?? -2, i1: o.i1 ?? 2, level: 1, skip: [0], dozy: o.crowd ? .15 : .75, aisleY: AISLE, seat: CR_SEAT, seatFace: crSeatFace,
      rackBag: i => hash(i * 3.3 + 1) > .3 ? [960 + i * CR.BW + 60 + 80 * hash(i), 960 + i * CR.BW + 200 + 80 * hash(i)] : null, ...c }; };
  const trainCrowd = (layer, t, o) => { if (typeof crowdTrain === 'function') crowdTrain(layer, t, crowdOf(o)); };
  // the carriage in two layers (the cast goes between): back = outside, wall, windows, racks, (the next-stop boards), the
  // crowd, seat backs, tables; front = the seat cushions (over sitters' hips). o: i0, i1 (bays), speed (the night's slide;
  // o.still: 0), pic(rect) (drawn in bay 0's window... any window's content: o.view(t, bay, rect) per bay), noBags, boards
  // (the next-stop boards on the pillars: true = home, lit; or a function of the pillar i (between bays i - 1 and i) giving
  // its flip 0..1), back() (a shot's own business behind the seated passengers: C1a/C2a's cleaners on the sills)
  function carriageBack(t, l, o = {}) {
    const i0 = o.i0 ?? -2, i1 = o.i1 ?? 2;
    // the wall, one piece (the windows are cut in it by what's drawn over it: the view in the glass, the seal round it)
    boilSeed('cr wall');
    piece(rect(960 + i0 * CR.BW - CR.BW / 2 - 40, 60, 960 + i1 * CR.BW + CR.BW / 2 + 40, CR.FY), CRC.wall, { ink: null, key: 'crwall', lift: 0, edge: false });
    // the outside, clipped to the glass of the windows the camera sees
    const bays = []; for (let i = i0; i <= i1; i++) if (seen(960 + i * CR.BW, CR.BW / 2 + 40)) bays.push(i);
    if (bays.length) clipPoly(bays.map(i => crGlass(i)), () => {
      if (o.view) { for (const i of bays) o.view(t, i, crWin(i)); }
      else crNight(o.nightT ?? t, 960 + i0 * CR.BW - CR.BW, 960 + i1 * CR.BW + CR.BW, o.still ? 0 : o.speed ?? 1);   // (o.nightT: the world's own clock, song time, so it slides past on ones while the crowd steps on twos)
      if (o.pic) o.pic(crWin(0));
    });
    crShell(t, i0, i1, o);
    if (o.boards) for (let i = i0; i <= i1 + 1; i++) { const x = 960 + (i - .5) * CR.BW; if (seen(x, 90)) stopBoard(x, CR.WT + 62, o.boards === true ? 1 : o.boards(i), 'sb' + i); }
    trainCrowd('back', t, o);   // (asleep on the racks, perched on the sills)
    if (o.back) o.back();
    const bay = i => seen(960 + i * CR.BW, CR.BW / 2 + 40);
    for (let i = i0; i <= i1; i++) if (bay(i)) { crSeat(i, -1); crSeat(i, 1); }
    trainCrowd('seats', t, o);   // (the seated passengers, behind the tables)
    if (o.sitters) o.sitters();   // (the gags' commuters, in their seats)
    for (let i = i0; i <= i1; i++) if (bay(i)) crTable(i, o.wood);
  }
  function carriageFront(t, l, o = {}) {
    const i0 = o.i0 ?? -2, i1 = o.i1 ?? 2;
    for (let i = i0; i <= i1; i++) if (seen(960 + i * CR.BW, CR.BW / 2 + 40)) { crSeat(i, -1, 'cushion'); crSeat(i, 1, 'cushion'); }
    trainCrowd('front', t, o);   // (the rush hour's standers in the aisle, in front of the whole far side)
  }

  // ======================================================================================================
  // C1a / C2a: "Fully automated - taking the piss!" The stamp's impact; it's yanked off: the page is a cheap riso copy
  // with the bill's red clock stamped on it, a trackside poster outside the train window. The train moves on and we pull
  // back into the carriage, landing on "Fully": the night train humming along, run entirely by cheerful bots doing every
  // job people used to do (the at-seat service, the steward, the tea, the inspector punching the passengers' tickets, the
  // cleaner on the sill squeegeeing the glass, the next-stop boards) for a full carriage (commuters in every seat, bot
  // passengers asleep on the racks). On "automated" a ripple of it runs down the carriage toward her, one job done after
  // another (a tick each, the boards flipping to home and lighting up); she, with no seat free, stands at the pole. She turns her
  // deadpan look on us and, without looking, reaches past the pole to the at-seat call button: a ding (C1b: out comes her
  // order slip, up to the hatch). C2a: the same, busier, the two of them standing squashed in among the passengers, the
  // ripple bigger and faster.
  function riso(fn) { look('xerox'); fn(); }
  // (the stamp is yanked off the page before it's printed: the engraved stamp and its sleeve lifting off the riso copy
  // were a bank object on the photocopy. Until the last stamp clears the frame the page is still P1b's / P2b's doodle,
  // at that shot's last zoom (so the cut is seamless), its shadow on the sand; then the print. cleared(lift): the lift's
  // progress at which a stamp's die (its bottom at STAMP.hit, rising 1500 · easeIn(q)) is above the page's top edge.)
  const LIFT_CLEAR = Math.cbrt((STAMP.hit + 10) / 1500);
  const preBZoom = (T0, k) => { const a = t0Of(k ? 'P2a' : 'P1a'), b = t0Of(k ? 'P2b' : 'P1b'); return PRE_A.Z0 + .012 * Math.max(0, b - a - (k ? PRE_A.FLIP[1] : PRE_A.PUSH[1])) + .01 * (T0 - b); };
  function unprinted(T0, k, fn) { const z = preBZoom(T0, k); push(); translate(960, 540); scale(z); translate(-960, -540); fn(); pop(); }
  // the doodle, printed cheap: riso, the red clock across it (screen px). doodle: the page itself, stamped, before it's
  // printed (while the stamp is yanked off it: C1a/C2a's first frames)
  function stampedPage(t, k, lift, doodle = false) {
    if (doodle) { look('doodle'); linedPaper(); }
    else {
      look('xerox');
      _paint(rect(-60, -60, W + 60, H + 60), { wash: XEROX.paper, washOp: 255, ink: null });
      for (let y = 130; y < H + 40; y += 40) _inkLine([[-20, y], [W + 20, y + .3]], .7, '#8FB0D8', 'rotring', 0);
    }
    hammockScene(t, { k, her: { ...feel('ko', t), lean: -1.05, flat: 1, pose: { L: [-1.4, .3, .2, 'open', 1], R: [1.4, .3, .2, 'open', 1] } }, him: { ...feel('ko', t), lean: -1.05, flat: 1 }, sun: 'x', swing: 0 });   // (the sun knocked out with them: the print shows the moment)
    if (!k) { stampMark(STAMP.x, STAMP.hit - STAMP.s * .16, STAMP.s * .62, -.08, 1); return; }
    // the second pass: two clocks, each skidded outward as its stamp was dragged off: the die's red ink streaked sideways
    // from the ring's leading edge (strongest where the ring runs along the drag, top and bottom), thinning out
    const sm = lift ?? 1;
    STAMPS[1].forEach((dx, i) => {
      const x = STAMP.x + dx, d = i ? 1 : -1, L = 380 * sm, r = STAMP.s * .9 * .62, cy = STAMP.hit - STAMP.s * .9 * .16;
      stampMark(x, cy, r, -.08 + .1 * i, 1);
      if (L < 4) return;
      for (let j = 0; j < 13; j++) {
        const edge = j < 2, v = edge ? (j ? .96 : -.96) : (hash(j * 5.3 + i) * 2 - 1) * .88, y = cy + v * r;
        const x0 = x + d * Math.sqrt(1 - v * v) * r * .96, len = L * (edge ? .95 : .35 + .6 * hash(j * 2.9 + i)), w = r * (edge ? .035 : .012 + .018 * hash(j + 7 * i));
        for (let s = 0; s < 4; s++) { if (!edge && hash(j * 11 + s + i) < .2) continue; _inkLine([[x0 + d * len * s / 4, y + s * .6], [x0 + d * len * (s + 1) / 4, y + (s + 1) * .6]], w * (1 - s * .22), BILL_RED, 'rotring', 0); }
      }
    });
  }
  // the grab pole in the aisle by bay 0 (she holds it) and its ceiling / floor fixings
  const POLE = 522, AISLE = 1004;
  // C2: him squeezed in beside her at the pole, his hand on it below hers (C2a, C2b, C2c: the same place and grip; C2b/C2c
  // had him further off with his fist up at his brow, the arm across his face)
  // (C2a: his fist round the pole at his brow, below hers, his arm hooked round it from his side (poleOverArm), the elbow out
  // past it behind her: he stands behind her there. It was at 2.75 u: ~35 px short of the pole, on her shoulder)
  const HIM_AT = [POLE + 120, AISLE + 14], HIM_GRIP = [3.62, -11.0, .5, 'fist', 1, -1.6, 'u'];
  // (C2b, C2c: he stands in front of her (drawn after her; her raised arm goes behind his head), so no hook there: his arm
  // up his side, nearly straight, the fist round the pole's edge by her shoulder, held there against his sway or lean: the
  // target turned back by his rot (flipped: x mirrored). HIM_GRIP's old place there was ~35 px short of the pole, the fist
  // on her shoulder, the arm across her chest)
  const HIM_FIST = [531, 642];
  const himFrontGrip = rot => { const dx = HIM_FIST[0] - HIM_AT[0], dy = HIM_FIST[1] - HIM_AT[1]; return [-(dx * Math.cos(rot) + dy * Math.sin(rot)) / 31, (-dx * Math.sin(rot) + dy * Math.cos(rot)) / 31, .1, 'fist', 1, -1.6 + rot, 'u']; };
  function grabPole() {
    boilSeed('pole');
    piece(rect(POLE - 8, 40, POLE + 8, AISLE + 8), '#C8CCD2', { sw: 1.4, rim: '#FFFFFF', key: 'pole', lift: 6 });
    piece(rect(POLE - 16, AISLE - 4, POLE + 16, AISLE + 10), '#8A8E96', { sw: 1.2, key: 'polefoot', lift: 3 });
  }
  // THE HOOKED GRIP (the user, 2026-09-27: "her body should be in front of it, but her arm behind it: her upper arm behind
  // it, her elbow somewhere to the right, her forearm above the pole, and her hand holding the pole"): the arm reaches
  // round the pole, the pole between the upper arm (behind it) and the forearm (over it), the fist round its front; her
  // arm (the far one) from behind her body, which stands in front of the pole. The rig draws an arm in one piece, so the
  // pole is drawn again over the upper arm where it crosses: clipped to the upper arm's band, less the bodies in front of
  // the pole (hers). Rowan's the same from his side, his elbow out past it behind her.
  // rigArm: where person() puts the arm (P, at gx, gy, u, with person()'s options o: pose, view, flip, rot, dx, dy, sq,
  // take, boilKey, seed): its root, elbow and hand on the page, and the coat's edge on the arm's side (neck to hem, closed
  // round behind); standing, card (its breath and idle lean as person() takes them: lifeOf on the same key)
  function rigArm(P, gx, gy, u, o, s = 1) {
    const b = P.body, tp = P.top, q = o.view === 'q', QS = q ? PP_QS : 0, Fr = personFrame(P, o), spec = o.pose[s < 0 ? 'L' : 'R'], pxu = u * drawScale();
    const life = lifeOf(o, (P.id || 'pp') + o.boilKey + '|' + (o.seed || 0), undefined, pxu), sq0 = ((o.sq || 0) + (o.take || 0)) * .5;
    const br = Math.round((life.breath - clamp(sq0 * .5 * -Fr.ys, -.6, .6)) * pxu * 2) / (pxu * 2);
    const xq = x => q ? (x >= 0 ? x * .97 : x * .93) + QS : x, ys = Fr.ys - br, shY = ys + Math.max(tp.sh[1], .15), aw = b.armW;
    const root = [xq(s * (tp.sh[0] - (spec[4] ? aw * .42 : aw * .85))), shY + aw * .4], pts = ppReach(root, [spec[0], spec[1]], b.arm, spec[2] ?? .1, s, ppElbowArc(s, q));
    const r = (o.rot || 0) + life.lean, f = o.flip ? -1 : 1, x0 = gx + (o.dx || 0) * u, y0 = gy + (o.dy || 0) * 1.1 * u;
    const pg = ([x, y]) => { const px = f * x * u, py = y * u; return [x0 + px * Math.cos(r) - py * Math.sin(r), y0 + px * Math.sin(r) + py * Math.cos(r)]; };
    const hem = tp.rows[tp.rows.length - 1][1];
    const body = [[-4, ys - .1], [xq(tp.neck ?? .9), ys - .1], [xq(tp.sh[0]), ys + tp.sh[1]], ...tp.rows.map(([x, y]) => [xq(x), ys + y]), [-4, ys + hem]].map(pg);
    return { root: pg(pts[0]), elbow: pg(pts[1]), hand: pg(pts[2]), body, aw: aw * u };
  }
  function poleOverArm(A, front = []) {
    const [a, e] = [A.root, A.elbow], d = Math.hypot(e[0] - a[0], e[1] - a[1]) || 1, w = A.aw * .5 + 6, nx = -(e[1] - a[1]) / d * w, ny = (e[0] - a[0]) / d * w;
    clipPoly([[a[0] + nx, a[1] + ny], [e[0] + nx, e[1] + ny], [e[0] - nx, e[1] - ny], [a[0] - nx, a[1] - ny]], () => clipPoly([rect(-4000, -4000, 6000, 6000), ...front], grabPole));
  }
  // The ripple: jobs in order down the carriage (right to left, toward her); job j is done gap × j after t0. hitP: its
  // flourish's progress 0..1 (over d s); boards 'b' + i (the pillar between bays i - 1 and i) flip over .45 s
  const ripple = (names, t0, gap) => Object.fromEntries(names.map((n, j) => [n, t0 + j * gap]));
  const hitP = (lt, at, n, d = .55) => at[n] == null ? 0 : seg(lt, at[n], at[n] + d);
  const boardsOf = (lt, at) => i => at['b' + i] == null ? 1 : seg(lt, at['b' + i], at['b' + i] + .45);
  // a four-point glint (the cleaner's clean glass, a job well done)
  function glint(x, y, r, key = 'gl') {
    if (r < 1) return;
    boilSeed(key); glow(x, y, r * 2.4, '#FFF4D0', .5);
    piece([[0, -1], [.2, -.2], [1, 0], [.2, .2], [0, 1], [-.2, .2], [-1, 0], [-.2, -.2]].map(([a, b]) => [x + a * r, y + b * r]), '#FFFBEA', { ink: null, key, lift: 0, flatCard: true, edge: false });
  }
  // Copilot, the inspector, up on bay 0's table: a passenger's ticket in one hand, the punch in the other, turned to one
  // seat's passengers; a punch every so often on its own clock and a big one when the ripple reaches it (a clack at the
  // ticket, a spray of confetti), pleased with each. o: flip, every (s between punches), ph, key. Returns its anchors.
  function inspector(t, l, x, hit, o = {}) {
    const key = o.key || 'insp', c0 = frac(l / (o.every ?? 1.1) + (o.ph ?? .3)), idle = c0 < .16 ? Math.sin(Math.PI * c0 / .16) : 0;
    const hk = hit > 0 && hit < 1 ? Math.sin(Math.PI * clamp(hit * 2.4)) : 0, sq = Math.max(idle, hk);
    const cm = feel(hit > .05 && hit < 1 ? 'proud' : 'happy', t + 1.3);
    boilSeed(key);
    // (the ticket held out in the far hand, head high toward the passengers; the punch in the near hand comes up to it:
    // both drawn at the hands, so the ticket stands clear of the head and the punch's jaw points at it. The punch arm
    // straightens as it reaches up: bowed, its elbow flipped from under the arm to up over it on every squeeze, as the
    // hand crossed the hose rig's out-and-down line (C1a, C2a))
    const A = copilot(x, CR.TY - 4, 24, { ...cm, emote: null, view: 'q', flip: o.flip ?? true, pose: { L: [lerp(2.5, 2.3, sq), lerp(-3.5, -4.7 - .3 * hk, sq), .25 * clamp(1 - sq * 2), 'hold', 1], R: [3.1, -5.7 - .3 * hk, .2, 'hold', 1] }, lookX: .6, lookY: -.2, boilKey: key + 'H', seed: 2 });
    const tk = A && A.hands && A.hands.R, pk = A && A.hands && A.hands.L;
    if (tk) { boilSeed(key + 'tk'); push(); translate(tk[0], tk[1] + 4); ticketProp(15, key + 't'); pop(); }
    if (tk && pk) { boilSeed(key + 'pk'); push(); translate(pk[0], pk[1]); rotate(Math.atan2(tk[1] - 16 - pk[1], tk[0] - pk[0]) + Math.PI / 2); punchProp(13, sq, key + 'p'); pop(); }
    if (tk && hit > .15 && hit < 1) {
      const q = seg(hit, .15, 1), [hx, hy] = [tk[0], tk[1] - 16];
      boilSeed(key + 'clack');
      if (q < .5) for (let j = 0; j < 7; j++) { const a = -Math.PI * (.05 + j / 6 * .9), r0 = 26 + 40 * q, r1 = r0 + 26 * (1 - 2 * q); dline([[hx + Math.cos(a) * r0, hy + Math.sin(a) * r0], [hx + Math.cos(a) * r1, hy + Math.sin(a) * r1]], 3, '#FFE08A', 0); }
      for (let j = 0; j < 8; j++) { const vx = (hash(j * 3.1 + x) - .5) * 150, vy = -60 - 90 * hash(j * 5.7 + x); piece(oval(hx + vx * q, hy + vy * q + 420 * q * q, 3.5, 3.5, 0, 6), j % 3 ? '#F4EEDC' : '#E0602E', { ink: null, key: key + 'cf' + j, lift: 2, flatCard: true, edge: false }); }
    }
    return A;
  }
  // The cleaner: a Codex terminal on bay i's window sill at x, squeegeeing the glass in sweeps round its shoulder, the
  // clean track shining on the glass behind it; on the ripple a last full sweep that ends in a glint. dir 1: it faces
  // right. Drawn in carriage's back() (on the sill, behind the seated passengers). Returns its anchors.
  function sillCleaner(t, l, i, x, hit, o = {}) {
    const y = CR.WB + 16, u = 26, dir = o.dir ?? 1, sh = [x + dir * 14, y - 66], R = 62, a0 = -2.45, a1 = -.6;
    const hs = hit > 0 && hit < 1 ? ease(clamp(hit * 2.2)) : null, sw = .5 - .5 * Math.cos(l * 4.6 + (o.ph || 0));
    const ang = q => { const b = lerp(a0, a1, q); return dir > 0 ? b : Math.PI - b; };
    // the pane it has polished: the gleam on clean glass (two pale diagonal streaks), brighter as the last sweep lands
    boilSeed('clntrack' + i);
    const m = ang(.55), gx = sh[0] + Math.cos(m) * (R + 46), gy = sh[1] + Math.sin(m) * (R + 46), gc = mixCol('#6E80AC', '#D8E2F8', hit > 0 && hit < 1 ? Math.sin(Math.PI * hit) : 0);
    const streak = (x0, y0, L, w, k) => piece([[x0 - L, y0 + L], [x0 - L + w, y0 + L], [x0 + L + w, y0 - L], [x0 + L, y0 - L]], gc, { ink: null, key: 'clnst' + i + k, lift: 0, flatCard: true, edge: false });
    streak(gx - 8, gy, 30, 9, 'a'); streak(gx + 18, gy + 6, 17, 5, 'b');
    const q = hs ?? sw, b = ang(q), hx = sh[0] + Math.cos(b) * R, hy = sh[1] + Math.sin(b) * R;
    const A = codex(x, y, u, { kind: o.kind || 'term', view: 'q', flip: dir < 0, ...feel(hs != null ? 'proud' : 'happy', t + i * 1.7), emote: null, pose: { R: [dir * (hx - x) / u, (hy - y) / u, .2, 'hold', 1, b + Math.PI / 2 * (dir > 0 ? 1 : -1)] }, hold: s => squeegeeProp(s, 'sqg' + i), boilKey: 'cln' + i, seed: 3 + i, noShadow: true });
    if (hit > .35 && hit < 1) { const g = ang(1), k = Math.sin(Math.PI * seg(hit, .35, 1)); glint(sh[0] + Math.cos(g) * (R + 42), sh[1] + Math.sin(g) * (R + 42), 26 * k, 'clnglint' + i); }
    return A;
  }
  // Her hand on the pole, at her brow (in her own u; her ground point is (POLE - 64, AISLE); C1b takes it from here: her
  // hand dips for the slip and holds it up to the hatch), and the reach past the pole to the call button (the fingertip on it).
  // The arm hooked round the pole (poleOverArm): drawn behind her (the far arm), the elbow out past the pole; it stays
  // hooked as she reaches to the button (the upper arm still behind the pole, the elbow past it)
  // (C2: a touch higher and tighter, the elbow clear above his beanie as he stands in beside her)
  const R_GRIPU = [2.05, -15.6, .6, 'fist', 0, -1.6, 'u'], R_GRIPU2 = [2.0, -16.5, .8, 'fist', 0, -1.6, 'u'];
  const R_CALL = [(CALL[0] - 40 - (POLE - 64)) / 31, (CALL[1] + 14 - AISLE) / 31, .12, 'point', 1, -.55, 'u'];
  const reachCall = (reach, press, G = R_GRIPU) => [lerp(G[0], R_CALL[0], reach) + .3 * press, lerp(G[1], R_CALL[1], reach), lerp(G[2], R_CALL[2], reach), reach > .55 ? 'point' : 'fist', 0, lerp(G[5], R_CALL[5], reach), 'u'];
  function chorusA(t, lt, dur, k) {
    const T0 = t - lt, l = mt(lt), tt = mt(t);
    const T = { fully: wt('Fully automated', 0, k) - T0, auto: wt('Fully automated', 1, k) - T0, piss: wt('Fully automated', 3, k) - T0 };
    const lift = seg(lt, .1, .3), printed = lift >= LIFT_CLEAR, PW = crWin(1), zW = W / CR.WW;   // (the stamp held .1 s in the impact's shake, then yanked)
    // the camera: full frame on the next bay's window (the poster fills it), then back and across to her, landing on
    // "Fully". (The stamped poster holds ~0.8 s after the smash before the pull-back starts: starting it at .48 read as a
    // second jump.)
    const back = ease(seg(lt, .8, 1.9));
    const z = Math.exp(lerp(Math.log(zW), Math.log(1.28), back)), cx = lerp(PW.x + PW.w / 2, 930, back), cy = lerp(PW.y + PW.h / 2, 575, back);
    const imp = lt < .25 ? shakeXY(t, 14 * (1 - lt / .25)) : [0, 0];
    // "automated": the ripple, from the twins' tea on "au" down to the board by her head, a job every 85 ms (the boards and
    // the far bots off screen too, so the carriage is one routine)
    const at = ripple(['b2', 'gemini', 'b1', 'muse', 'cop', 'clean', 'clawd', 'b0', 'grok', 'b-1'], T.auto - .085, .085);
    // the gags' beats: the twins' stream lands in the cup on the beat before "automated" (the ripple starts from them), the
    // Muse's flash pops on "Fully"
    const gag = { land: beatNear(T.auto + T0) - T0, flash: T.fully };
    look('card');
    camBegin(cx + imp[0] / z, cy + imp[1] / z, z);
    const sl = Math.max(0, lt - 1.2), slide = 300 * sl * sl + 120 * sl;   // the train moves on: the poster slides away
    const ticks = [];
    carriage(tt, l, {
      nightT: t, boards: boardsOf(lt, at),
      back: () => { const A = sillCleaner(tt, l, 0, 800, hitP(lt, at, 'clean')); if (A && A.top) ticks.push(['clean', A.top]); },
      crowd: { level: 1, skip: [], ...CREW_CROWD(0), seatAs: CLEAN_SEATS(0), rush: [T0 + 1.45, T0 + 2.2], split: 930,   // (the standers roar in from both ends as the pull-back lands)
        hole: slide < PW.w ? [PW.x + slide - 18, PW.y - 4, PW.x + PW.w + 4, PW.y + PW.h + 4] : null },   // every seat taken; the poster clear
      pic: () => {   // the poster, then the stamp being yanked off it (in the poster's own frame)
        const w = PW, sc = w.w / W, sx = w.x + slide;
        push(); translate(sx, w.y); scale(sc);
        if (printed) stampedPage(tt, k);
        else unprinted(T0, k, () => { const y = STAMP.hit - easeIn(lift) * 1500; stampedPage(tt, k, undefined, true); stampShadow(STAMP.x, y, 1); look('bank'); stampProp(STAMP.x, y, STAMP.s, 0); });
        look('card');
        pop();
        if (slide > 0) { boilSeed('poster edge'); piece(rect(sx - 16, w.y - 30, sx, w.y + w.h + 30), '#23222A', { ink: null, key: 'posteredge', lift: 0, flatCard: true }); }
      },
      sitters: () => sitters(tt, CREW1_SIT(), slide < PW.w ? [PW.x + slide - 18, PW.y - 4, PW.x + PW.w + 4, PW.y + PW.h + 4] : null),
      cast: () => {
        const A = inspector(tt, l, 960, hitP(lt, at, 'cop'));   // (turned to bay 0's left-hand seat; before the crew: the Muse floats in front of its scarf's streaming tip)
        if (A && A.top) ticks.push(['cop', A.top]);
        for (const [i, side, name, task] of CREW1) { const A = botTask(tt, l, i, side, name, task, { hit: hitP(lt, at, name), gag }); if (A && A.top) ticks.push([name, A.top]); }
        ceilingHatch(0);   // (the service hatch over her pole, shut: C1b opens it)
      },
    });
    for (const [n, [x, y]] of ticks) doneTick(x, y - 18, hitP(lt, at, n, .62), 'tk' + n);
    // her: the one human aboard, standing at the pole, swaying with the train, bored. She watches the ripple come down the
    // carriage to her, turns her deadpan look on us as it reaches her ("-"), and, still looking at us, reaches past the
    // pole to the call button and presses it on "taking": it lights, a ding.
    const tLook = at.b0 + .1, tReach = T.piss - .34, tPress = T.piss - .08;
    // (her arm, the button and the sway on the puppets' twos, l and tt: on the continuous clock they crept a fraction of a
    // pixel every frame, the card swimming instead of stepping)
    const reach = ease(seg(l, tReach, tPress - .02)), press = backOut(seg(l, tPress - .03, tPress + .03)) * (1 - .5 * seg(l, tPress + .12, tPress + .22)), lit = seg(l, tPress, tPress + .04);
    grabPole();
    callButton(press, lit, seg(l, tPress, tPress + .5));
    const sway = Math.sin(tt * 2.3) * .6;
    const mood = emotions(l, [[0, 'bored', { emote: null, mouth: 'flat' }], [tLook, 'bored', { emote: null, mouth: 'flat', eyes: 'narrow' }]], { take: .4 });
    const lk = l < T.auto ? { lookX: .45, lookY: -.25 } : l < tLook ? { lookX: lerp(.95, .55, seg(l, T.auto, tLook)), lookY: -.1 } : { lookX: -.28, lookY: .04 };
    const ho = { ...mood, ...lk, view: 'q', pose: { L: [-1.2, 2.6, .15, 'relax'], R: reachCall(reach, press) }, blink: lt > tLook + .12 && lt < tLook + .2 ? 1 : undefined, rot: sway * .02 * (1 - reach), dx: .1 * sway * (1 - reach), boilKey: 'crher', seed: 3 };
    person(POLE - 64, AISLE, 31, HER_C, ho);
    const HA = rigArm(HER_C, POLE - 64, AISLE, 31, ho); poleOverArm(HA, [HA.body]);   // (her arm hooked round the pole)
    camEnd();
  }

  // C2a: the same service, busier (three to a seat, the racks and sills full), the two of them standing squashed in
  // together at the pole among the passengers; more jobs (porters on the racks stowing bags, a cleaner at two windows)
  // and the ripple bigger and faster (a job every 40 ms); their deadpan look on "taking the piss"; she presses the call
  // button on the beat after "piss".
  // (the gags: the Gemini twins fold a napkin swan (they had the tea), the Codex cat shines a sleeping commuter's shoes in
  // bay 1 (it dusted, off in bay -2), the ghost reads a bedtime story to a sleeper tucked in on bay 0's rack (it cheered a
  // blanket in, off in bay 1's right seat, where the terminal dusts now); drawn first, the rack's)
  const CREW2 = [[0, 0, 'ghost', 'story'], [-1, -1, 'grok', 'tray'], [-1, 1, 'muse', 'tray'], [0, -1, 'gemini', 'swan'], [0, 1, 'clawd', 'pillow'], [1, -1, 'cat', 'shine'], [1, 1, 'term', 'duster'], [2, -1, 'dog', 'blanket']];
  const CREW2_SIT = () => [catSitter(1, -1)];
  // The rush-hour carriage, per chorus: one physically coherent carriage, the same people in the same places in every shot
  // (C1a–C1c, C2a–C2c; crowd.js trainCommute). The seats all taken: seatSkip, the gag's commuter's bench (C1: the Muse's
  // dozing subject, bay 0's right seat; C2: the cat's shoe-shine commuter, bay 1's left); crewSeats, the aisle seats the
  // crew stand on (CREW1, CREW2: C2's swan twins stand at bay 0's left one's edge; the window seat's commuter sits behind
  // each), so the full seats show why the two of them
  // stand. The standers [x, dy, side] only where the aisle's floor has no crew in front of it in any of the chorus's
  // shots (and clear of the next-stop boards): C1, one between Grok's tray (x < 210) and her, two beyond the teapot
  // twin's raised hand (x > 1520); C2 fuller: two squeezed in by her, one past the cat. (C1a and C2a free the window
  // seats under their cleaners on bay 0's sill: CLEAN_SEATS.) C2's racks: the ghost's story (its sleeper under the blanket
  // and the ghost afloat by its head) and the porters' places (C2a) kept clear, bay 0's places either side of the story.
  // The window seats under the crew's cleaners on bay 0's sill (C1a: Codey, over Clawd's bench; C2a: Stacky and Rocky) are
  // free while the cleaners are there: sat at the cast's scale, a commuter's head there was over the cleaner. The close
  // shots that follow (C1b, C1c, C2b, C2c) have no cleaners and seat them, so no seat by her stands empty.
  const CLEAN_SEATS = k => k ? { '0,-1,1': { skip: true }, '0,1,1': { skip: true } } : { '0,-1,1': { skip: true } };
  const CREW_CROWD = k => k ? { commute: true, seatSkip: [[1, -1]], crewSeats: [[-1, -1], [-1, 1], [0, -1], [0, 1], [1, 1], [2, -1]], standers: [[352, -16, 0], [300, 6, -1], [1792, 2, 1]],
      rackSlots: i => (i === 0 ? [-215, 255] : [-205, 0, 205]), rackKeep: [[850, 1125], [320, 400], [1640, 1720]] }
    : { commute: true, seatSkip: [[0, 1]], crewSeats: [[-2, 1], [-1, -1], [0, -1], [1, -1], [1, 1], [2, -1]], standers: [[305, 4, -1], [1642, -8, 1], [1734, 6, 1]] };
  // a suitcase (card), upright, its bottom at (x, y): a porter's load
  function suitcase(x, y, s, key = 'case') {
    boilSeed(key);
    piece(curvy(rect(x - 1.5 * s, y - 2 * s, x + 1.5 * s, y), 2), '#8A5A3E', { sw: 1.2, shade: '#5E3A28', depth: .25 * s, key: key + 'b', lift: 3 });
    for (const d of [-.8, .8]) piece(rect(x + d * s - .12 * s, y - 2 * s, x + d * s + .12 * s, y), '#D8B060', { ink: null, key: key + 's' + d, lift: 0, flatCard: true, edge: false });
    dline([[x - .5 * s, y - 2 * s], [x - .45 * s, y - 2.5 * s], [x + .45 * s, y - 2.5 * s], [x + .5 * s, y - 2 * s]], 1.8, '#3A2418', .4);
  }
  // A porter on bay i's rack (a Codex pet, on its feet among the sleepers), lifting a passenger's suitcase up onto the
  // rack; on the ripple it swings it up high, pleased. Returns its anchors.
  function rackPorter(t, l, i, name, hit) {
    const x = 960 + i * CR.BW + 60, y = 244, f = i < 0 ? 1 : -1;
    if (!seen(x, 100)) return null;
    const hp = hit > 0 && hit < 1 ? Math.sin(Math.PI * Math.sqrt(hit)) : 0, up = .25 * Math.sin(l * 3.1 + i) + 1.1 * hp;
    boilSeed('rk' + i);
    const A = BOTS[name](x, y, f, { ...feel(hp > .2 ? 'proud' : 'happy', l + i), emote: null, boilKey: 'rk' + i, noShadow: true, pose: { L: [-.9, -4.6 - up, .2, 'hold', 1], R: [.9, -4.6 - up, .2, 'hold', 1] } });
    const h = A && A.hands; if (h && h.L && h.R) suitcase((h.L[0] + h.R[0]) / 2, (h.L[1] + h.R[1]) / 2 - 2, 13, 'rkcase' + i);
    return A;
  }
  function chorusA2(t, lt, dur) {
    const k = 1, T0 = t - lt, l = mt(lt), tt = mt(t);
    const T = { fully: wt('Fully automated', 0, k) - T0, auto: wt('Fully automated', 1, k) - T0, piss: wt('Fully automated', 3, k) - T0, end: wt('Fully automated', 5, k) - T0 };
    const drag = ease(seg(lt, .04, .24)), lift = seg(lt, .24, .42), printed = lift >= .15 + .85 * LIFT_CLEAR, PW = crWin(1), zW = W / CR.WW;   // (the second stamp's lift runs over the last .85 of it)
    const back = ease(seg(lt, .8, 1.9));   // (the smudged poster holds ~0.8 s after the stamps before the pull-back)
    const z = Math.exp(lerp(Math.log(zW), Math.log(1.2), back)), cx = lerp(PW.x + PW.w / 2, 960, back), cy = lerp(PW.y + PW.h / 2, 470, back);
    const imp = lt < .25 ? shakeXY(t, 14 * (1 - lt / .25)) : [0, 0];
    // "automated": the ripple, bigger and faster: from the far right on "au" down to the far left, a job every 40 ms
    const at = ripple(['dog', 'b2', 'term', 'rk1', 'cat', 'b1', 'clawd', 'cl0b', 'ghost', 'cop', 'gemini', 'cl0', 'b0', 'muse', 'rk-1', 'grok', 'b-1'], T.auto - .08, .04);
    // the gags' beats: the twins' napkin folded in half on the beat before "Fully", its sides in on "Fully", and on the
    // beat after "automated" it's a swan, presented with a bow; the cat buffs on every beat
    const BT = BEATMAP.beats, bF = BT.indexOf(beatNear(T.fully + T0));
    const gag = { fold: [BT[bF - 1] - T0, BT[bF] - T0, BT[bF + 1] - T0], bow: BT[bF + 1] - T0 };
    look('card');
    camBegin(cx + imp[0] / z, cy + imp[1] / z, z);
    const sl = Math.max(0, lt - 1.2), slide = 600 * sl * sl + 200 * sl;
    const ticks = [];
    carriage(tt, l, {
      nightT: t, noBags: true, boards: boardsOf(lt, at),
      back: () => { for (const [i, x, n, kind] of [[0, 800, 'cl0', 'stacky'], [0, 1150, 'cl0b', 'rocky']]) { if (!seen(x, 140)) continue; const A = sillCleaner(tt, l, i + (x > 1000 ? .5 : 0), x, hitP(lt, at, n), { ph: x * .01, kind }); if (A && A.top) ticks.push([n, A.top]); } },   // (two on bay 0's sill, away from the poster's window and clear of the crush)
      crowd: { level: 2, skip: [], ...CREW_CROWD(1), seatAs: CLEAN_SEATS(1), rush: [T0 + 1.35, T0 + 2.0], split: 960,   // (the standers roar in as the pull-back lands)
        hole: slide < PW.w + 40 ? [PW.x + slide - 18, PW.y - 4, PW.x + PW.w + 4, PW.y + PW.h + 4] : null },   // every seat taken, the racks fuller; the poster clear
      pic: () => {
        if (slide > PW.w + 40) return;
        const w = PW, sc = w.w / W, sx = w.x + slide;
        push(); translate(sx, w.y); scale(sc);
        if (printed) stampedPage(tt, k, drag);
        else unprinted(T0, k, () => {
          stampedPage(tt, k, drag, true);
          const S = STAMPS[1].map((dx, i) => [STAMP.x + dx + (i ? 1 : -1) * 380 * drag, STAMP.hit - easeIn(seg(lift, i * .15, 1)) * 1500]);
          for (const [x, y] of S) stampShadow(x, y, 1);
          look('bank'); for (const [x, y] of S) stampProp(x, y, STAMP.s * .9, 0);
        });
        look('card');
        pop();
        if (slide > 0) { boilSeed('poster edge'); piece(rect(sx - 16, w.y - 30, sx, w.y + w.h + 30), '#23222A', { ink: null, key: 'posteredge', lift: 0, flatCard: true }); }
      },
      sitters: () => sitters(tt, CREW2_SIT(), slide < PW.w + 40 ? [PW.x + slide - 18, PW.y - 4, PW.x + PW.w + 4, PW.y + PW.h + 4] : null),
      cast: () => {
        for (const [i, side, name, task] of CREW2) { const A = botTask(tt, l, i, side, name, task, { hit: hitP(lt, at, name), gag }); if (A && A.top) ticks.push([name, A.top]); }
        for (const [i, name] of [[-1, 'crab'], [1, 'term']]) { const A = rackPorter(tt, l, i, name, hitP(lt, at, 'rk' + i)); if (A && A.top) ticks.push(['rk' + i, A.top]); }   // (Fireball and Codey: the ghost and the cat have their gags)
        const A = inspector(tt, l, 1010, hitP(lt, at, 'cop'), { key: 'insp2', every: .7, ph: .6 });   // (busier: punching faster)
        if (A && A.top) ticks.push(['cop', A.top]);
        ceilingHatch(0);
      },
    });
    for (const [n, [x, y]] of ticks) doneTick(x, y - 18, hitP(lt, at, n, .6), 'tk2' + n);
    // the two of them squashed in together at the pole, swaying with the train, her hand on it and his on it under hers;
    // bored, watching the ripple come; on "taking the piss" both turn the deadpan look on us; still looking at us, she
    // reaches past the pole and presses the call button on the beat after "piss": it lights, a ding.
    const tLook = T.piss - .04, tPress = T.end + .18, tReach = tPress - .3;
    const reach = ease(seg(l, tReach, tPress - .02)), press = backOut(seg(l, tPress - .03, tPress + .03)) * (1 - .5 * seg(l, tPress + .12, tPress + .22)), lit = seg(l, tPress, tPress + .04);
    grabPole();
    callButton(press, lit, seg(l, tPress, tPress + .5));
    const sway = Math.sin(tt * 2.3) * .6, flat = { emote: null, mouth: 'flat' };
    const lkRipple = l < T.auto ? { lookX: .45, lookY: -.25 } : { lookX: lerp(.95, .55, seg(l, T.auto, tLook)), lookY: -.15 };
    const hm = emotions(l, [[0, 'bored', flat], [tLook + .06, 'bored', { ...flat, eyes: 'narrow' }]], { take: .4 });
    const hLk = l < tLook + .06 ? { lookX: l < T.auto ? -.3 : lerp(.9, .5, seg(l, T.auto, tLook)), lookY: -.2 } : { lookX: .3, lookY: .05 };
    const mo = { ...hm, ...hLk, view: 'q', flip: true, pose: { L: [-1.2, 2.5, .15, 'relax'], R: HIM_GRIP }, blink: lt > tLook + .2 && lt < tLook + .28 ? 1 : undefined, rot: -sway * .015, boilKey: 'crhim', seed: 6 };
    person(HIM_AT[0], HIM_AT[1], 31, HIM_C, mo);
    const mood = emotions(l, [[0, 'bored', flat], [tLook, 'bored', { ...flat, eyes: 'narrow' }]], { take: .4 });
    const ho = { ...mood, ...(lt < tLook ? lkRipple : { lookX: -.28, lookY: .04 }), view: 'q', pose: { L: [-1.2, 2.6, .15, 'relax'], R: reachCall(reach, press, R_GRIPU2) }, blink: lt > tLook + .12 && lt < tLook + .2 ? 1 : undefined, rot: sway * .02 * (1 - reach), dx: .1 * sway * (1 - reach), boilKey: 'crher', seed: 3 };
    person(POLE - 64, AISLE, 31, HER_C, ho);
    const HA = rigArm(HER_C, POLE - 64, AISLE, 31, ho); poleOverArm(HA, [HA.body]); poleOverArm(rigArm(HIM_C, HIM_AT[0], HIM_AT[1], 31, mo), [HA.body]);   // (both arms hooked round the pole; she stands in front of it)
    camEnd();
  }

  // ======================================================================================================
  // THE TRAIN FROM OUTSIDE (C1b, C2b): the red night train side on, the camera tracking with it (the world slides right),
  // a lit window per seat, a bot in every one of them and her in the middle one. Then the camera tilts up to THE BRAIN.
  const TX = { top: 560, bot: 1010, winY: 620, winH: 150, winW: 196, pitch: 262 };
  const WIN_BOTS = [['copilot', 'grok'], ['gemini', 'clawd'], ['cat', 'term'], ['muse', 'ghost']];
  function outsideNight(t, cy, speed = 1) {
    // the sky (stars), a far city, telegraph poles zipping past, the embankment
    boilSeed('tx sky');
    piece(rect(-400, -3000, W + 400, TX.bot + 400), '#141A2C', { ink: null, key: 'txsky', lift: 0, flatCard: true, edge: false });
    piece(rect(-400, -3000, W + 400, -300), '#10152A', { ink: null, key: 'txsky2', lift: 0, flatCard: true, edge: false });
    for (let i = 0; i < 90; i++) { const x = hash(i * 1.3) * (W + 600) - 300, y = -2600 + hash(i * 2.7) * 3000, r = 1.5 + 2.5 * hash(i * 5.1); piece(oval(x, y, r, r, 0, 6), '#E8E4D0', { ink: null, key: 'star' + i, lift: 0, flatCard: true, edge: false }); }
    const span = W + 1200;
    for (let i = 0; i < 9; i++) {
      const x = -600 + ((i * 240 + t * 90 * speed) % span + span) % span, h = 60 + 140 * hash(i + 11);
      boilSeed('txcity' + i);
      piece(rect(x, 500 - h, x + 170, 520), '#1C2236', { ink: null, key: 'txcity' + i, lift: 0, flatCard: true, edge: false });
      for (let j = 0; j < 4; j++) if (hash(i * 7 + j) > .5) piece(rect(x + 20 + j * 36, 520 - h + 20 + 30 * (j % 2), x + 36 + j * 36, 540 - h + 20 + 30 * (j % 2)), '#E8B85A', { ink: null, key: 'txcw' + i + j, lift: 0, flatCard: true, edge: false });
    }
    piece(rect(-400, 520, W + 400, TX.bot + 400), '#1A1F2C', { ink: null, key: 'txbank', lift: 0, flatCard: true, edge: false });
    for (let i = 0; i < 4; i++) {
      const x = -300 + ((i * 700 + t * 2400 * speed) % 2800 + 2800) % 2800;
      boilSeed('txpole' + i);
      piece(rect(x, 200, x + 22, 560), '#0C0F18', { ink: null, key: 'txpole' + i, lift: 0, flatCard: true, edge: false });
      piece(rect(x - 50, 220, x + 72, 236), '#0C0F18', { ink: null, key: 'txarm' + i, lift: 0, flatCard: true, edge: false });
    }
  }
  // the train: windows first (lit, with whoever is in them), then the body round them
  function trainSide(t, l, o = {}) {
    const n = 7, x0 = 960 - 3 * TX.pitch - TX.winW / 2, jolt = 3 * Math.sin(t * 23) * .5;
    push(); translate(0, jolt);
    for (let i = 0; i < n; i++) {
      const x = x0 + i * TX.pitch, cx = x + TX.winW / 2;
      boilSeed('txw' + i);
      piece(rect(x, TX.winY, x + TX.winW, TX.winY + TX.winH), '#F2DFA8', { ink: null, key: 'txwin' + i, lift: 0, flatCard: true, edge: false });
      glow(cx, TX.winY + 70, 170, '#FFE2A0', .35);
      if (o.doors != null && i === 4) continue;
      if (o.window) o.window(t, i, { x, y: TX.winY, w: TX.winW, h: TX.winH });
      else if (o.inWindow) o.inWindow(i, cx, TX.winY + TX.winH + 40);
    }
    // the body (pieces round the windows), the cream stripe, doors, the skirt and bogies
    boilSeed('tx body');
    const L = x0 - 400, R = x0 + n * TX.pitch + 400, B = '#B8303F';
    piece(rect(L, TX.top, R, TX.winY), B, { sw: 2.4, key: 'txtop', lift: 6 });
    piece(rect(L, TX.winY + TX.winH, R, TX.bot - 80), B, { sw: 2.4, key: 'txbot', lift: 6 });
    for (let i = 0; i <= n; i++) { const x = x0 + i * TX.pitch - (TX.pitch - TX.winW); piece(rect(x - 2, TX.winY - 2, x + TX.pitch - TX.winW + 2, TX.winY + TX.winH + 2), B, { ink: null, key: 'txpil' + i, lift: 0 }); }
    for (let i = 0; i < n; i++) { const x = x0 + i * TX.pitch; dline([[x, TX.winY], [x + TX.winW, TX.winY], [x + TX.winW, TX.winY + TX.winH], [x, TX.winY + TX.winH], [x, TX.winY]], 2.2, '#5A1820', 0); }
    piece(rect(L, TX.top + 18, R, TX.top + 38), '#F2ECE0', { ink: null, key: 'txstripe', lift: 2, flatCard: true });
    piece(rect(L, TX.bot - 80, R, TX.bot), '#2A2630', { sw: 2, key: 'txskirt', lift: 4 });
    piece(curvy(rect(L, TX.top - 30, R, TX.top + 6), 2), '#8A2432', { sw: 2, key: 'txroof', lift: 4 });
    if (o.doors != null) {   // window 4 is a pair of sliding doors (the lit vestibule behind them)
      const dx = x0 + 4 * TX.pitch - 30, dw = (TX.winW + 60) / 2, op = ease(clamp(o.doors)) * dw * .95;
      boilSeed('tx doors');
      piece(rect(dx, TX.winY - 20, dx + 2 * dw, TX.bot - 84), '#F2DFA8', { ink: null, key: 'txvest', lift: 0, flatCard: true, edge: false });
      glow(dx + dw, TX.winY + 120, 200, '#FFE2A0', .4 * clamp(o.doors * 3));
      for (const sd of [0, 1]) { const x = dx + sd * dw + (sd ? op : -op); piece(rect(x, TX.winY - 20, x + dw, TX.bot - 84), '#C83A40', { sw: 2, key: 'txdoor' + sd, lift: 4 }); piece(rect(x + 18, TX.winY + 6, x + dw - 18, TX.winY + 120), '#F2DFA8', { sw: 1.4, key: 'txdw' + sd, lift: 1 }); }
    }
    for (let i = 0; i < 5; i++) { const x = x0 - 200 + i * 520; for (const d of [-60, 60]) { const a = t * 30; piece(oval(x + d, TX.bot - 10, 34, 34, 0, 16), '#3A3440', { sw: 1.6, key: 'txwh' + i + d, lift: 3 }); dline([[x + d, TX.bot - 10], [x + d + Math.cos(a) * 30, TX.bot - 10 + Math.sin(a) * 30]], 2, '#6A6470', 0); } }
    pop();
  }
  // who's in each window: a bot at its task, or her, standing, holding the strap (him too in the second chorus)
  const WIN_CREW = [['muse', 'tray'], ['gemini', 'tea'], ['copilot', 'pillow'], null, ['grok', 'tray'], ['term', 'duster'], ['clawd', 'pillow']];
  function windowFace(i, cx, gy, l, T, k) {
    if (i === 3) {
      const mood = emotions(l, [[0, 'bored', { emote: null, mouth: 'flat' }]], {});
      person(cx - 20 - 40 * k, gy + 262, 26, HER_C, { ...mood, legs: false, noShadow: true, view: 'q', lookX: .4, lookY: T && T.up ? -1 : .5, pose: { L: [-1.2, 2.6, .15, 'relax'], R: [.2, -1.3, .4, 'fist', 1, -1.6] }, boilKey: 'txher', rot: .02 * Math.sin(l * 2.3) });
      if (k) person(cx + 50, gy + 230, 26, HIM_C, { ...emotions(l, [[0, 'bored', { emote: null, mouth: 'flat' }]]), legs: false, noShadow: true, view: 'q', flip: true, lookY: .5, pose: { L: [-1.2, 2.6, .15, 'relax'], R: [.2, -1.2, .4, 'fist', 1, -1.6] }, boilKey: 'txhim' });
      return;
    }
    const [name, task] = WIN_CREW[i], f = i < 3 ? 1 : -1, ph = hash(i * 3.1), b = bpOf(l + ph), bob = Math.abs(Math.sin(b * Math.PI));
    const o = { ...feel(ph > .5 ? 'happy' : 'proud', l + ph), emote: null, boilKey: 'txb' + i, seed: ph * 5, noShadow: true, lookX: .3, lookY: .4 };
    if (name === 'grok') o.pose = 'serve', o.tray = 'flutes';
    else if (name === 'muse') o.pose = 'tray', o.tray = 'canapes';
    else if (name === 'clawd') o.pose = 'hug';
    else if (name === 'gemini') { twinsPour(l + ph, l, 0, 0, { at: [cx - f * 6, gy - 30], f, u: 18, every: 2.9, ph: ph * 2.9, key: 'txtp' + i }); return; }   // (the tea poured properly, as inside: the cups held up in the air went over on their sides)
    else if (name === 'term') { o.pose = { R: [1.9, -3.2 - .5 * bob, .25, 'hold', 1] }; o.hold = dusterProp; }
    else if (name === 'copilot') { o.pose = 'present'; o.card = pillowProp; }
    BOTS[name](cx - f * 10, gy - 30, f, o);
    if (k && i % 2 === 0) { const [n2] = WIN_CREW[(i + 3) % 7] || ['ghost']; if (n2) BOTS[n2 === 'copilot' ? 'cat' : n2](cx + f * 64, gy - 20, f, { ...o, pose: 'idle', tray: null, hold: null, boilKey: 'txb2' + i, seed: ph * 9 }); }
  }

  // THE BRAIN (banknote engraving; C1b, C2b): a colossal engraved brain crowning a gothic cathedral of a data centre, above
  // the clouds; a pneumatic tube from its service hatch down to the train. Its parts, below: gear, the sky, the clouds, the
  // cortex, the cathedral, the hatch and funnel, the effort, brain() (the whole), the tube, her slip and the sandwich.
  function gear(cx, cy, r, n, a, col, key) {
    const P = []; for (let i = 0; i < n * 2; i++) { const q = a + i / (n * 2) * TAU, rr = i % 2 ? r * .82 : r; P.push([cx + Math.cos(q - .12) * rr, cy + Math.sin(q - .12) * rr], [cx + Math.cos(q + .12) * rr, cy + Math.sin(q + .12) * rr]); }
    piece(P, col, { sw: 1.4, key, lift: 3 });
    piece(oval(cx, cy, r * .3, r * .3, 0, 16), mixCol(col, '#000000', .3), { sw: 1.2, key: key + 'h', lift: 1 });
    for (let i = 0; i < 4; i++) { const q = a + i / 4 * TAU; dline([[cx + Math.cos(q) * r * .3, cy + Math.sin(q) * r * .3], [cx + Math.cos(q) * r * .72, cy + Math.sin(q) * r * .72]], 2, BANK.ink, 0); }
  }
  // the heavens of capital: above the clouds the sky is security paper, a glory of engraved rays round the brain
  function brainSky(cx, cy, y1) {
    _paint(rect(-3000, -4000, 5000, y1), { wash: mixCol(BANK.paper, BANK.tint, .45), washOp: 255, ink: null });
    for (let i = 0; i < 96; i++) {
      const q = i / 96 * TAU, r0 = 420, s1 = Math.sin(q), r1 = Math.min(i % 2 ? 1900 : 1500, s1 > .01 ? (y1 - 40 - cy) / s1 : 1e9);
      if (r1 > r0) _inkLine([[cx + Math.cos(q) * r0, cy + s1 * r0], [cx + Math.cos(q) * r1, cy + s1 * r1]], i % 2 ? .7 : 1.1, mixCol(BANK.ink, BANK.paper, .35), 'rotring', 0);
    }
    guilloche(cx, cy, 430, 560, { n: 14, lobes: 40, w: .6, col: mixCol(BANK.ink, '#A8843A', .4) });
  }
  function cloudBank(y, x0, x1, key, only = null) {   // a band of engraved cumulus along y (two rows; only: just row 0, the front, or 1)
    for (let i = 0; i < 28; i++) {
      const row = i % 2, yb = y - row * 120;
      if (only != null && row !== only) continue;
      const x = x0 + (Math.floor(i / 2) + .5 + row * .5) / 14 * (x1 - x0) + 60 * (hash(i + 3) - .5), r = 140 + 90 * hash(i * 2.3), yy = yb + 50 * (hash(i * 5.1) - .5);
      piece(curvy([[x - r, yy + r * .35], [x - r * .8, yy - r * .2], [x - r * .3, yy - r * .55], [x + r * .3, yy - r * .5], [x + r * .85, yy - r * .15], [x + r, yy + r * .35]], 5), '#B8BEC4', { sw: 1.4, shade: '#7A8490', depth: r * .3, key: key + i, lift: 0 });
    }
  }
  // THE CORTEX, engraved like a note's portrait (brain-local px: the brain in profile facing left, ~1000 x 570 at s = 1).
  // The gyri are a phasor-noise stripe field (Gabor kernels summed as complex waves, only the phase kept: stripes of an
  // even width that meander, fork and end, like real folds), oriented and phase-locked by the distance to the major sulci
  // (the lateral fissure, the central sulcus, the frontal, parietal, temporal and occipital sulci), random between them,
  // the sample point noise-warped so each gyrus wriggles. cos(phase) is 1 in a sulcus and -1 on a crest, so its level sets
  // run along the folds: the sulcus's floor, cross-hatched dark, its two lips (the double line), then contour hatching down
  // each gyrus's flanks, swelling on the flank turned from the light and on the brain's shadow side, breaking to paper on
  // the lit crests. (Not contour-map loops: every line is one fold's edge.) Built once per detail level into triangles
  // (style.js bankSwell), printed in two inks: the deep floor and lips, the madder hatching.
  const CX = {
    M: [[-470, 40], [-505, -120], [-420, -285], [-250, -375], [0, -395], [240, -355], [410, -245], [485, -60], [445, 80], [300, 100], [200, 60], [80, 140], [-120, 172], [-300, 145], [-425, 110]],
    CB: [[220, 70], [360, 40], [470, 90], [460, 190], [330, 230], [230, 170]],
    T: 58,   // a gyrus and its sulcus, px
    S: [     // the major sulci: [curve, depth 0..1]
      [[[-398, 72], [-270, 40], [-130, 16], [20, -8], [120, -36], [168, -96]], 1],          // the lateral (Sylvian) fissure
      [[[-6, -396], [-30, -320], [-52, -246], [-70, -172], [-92, -98], [-106, -28]], .8],     // central
      [[[-150, -374], [-164, -292], [-178, -212], [-192, -132], [-204, -52]], .45],           // precentral
      [[[116, -380], [96, -292], [78, -206], [66, -122], [58, -54]], .45],                   // postcentral
      [[[-178, -300], [-272, -282], [-362, -250], [-442, -194]], .4],                        // superior frontal
      [[[-190, -150], [-282, -140], [-372, -118], [-462, -80]], .4],                         // inferior frontal
      [[[74, -212], [172, -240], [272, -226], [362, -170], [424, -118]], .45],               // intraparietal
      [[[-342, 112], [-210, 88], [-70, 72], [62, 52], [172, 18], [252, -42]], .5],           // superior temporal
      [[[-282, 152], [-150, 152], [-20, 140], [102, 114]], .3],                              // inferior temporal
      [[[344, -292], [390, -200], [420, -92], [430, 18]], .35],                              // occipital
    ],
  };
  let CXF = null, CX_PF = null;
  const CXB = {};   // the built triangles, by detail level
  function cxField() {
    if (CXF) return CXF;
    const M = curvy(CX.M, 6), CB = curvy(CX.CB, 5), g = 4, T = CX.T, f = TAU / T;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const [x, y] of M) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    x0 -= 16; y0 -= 16; x1 += 16; y1 += 16;
    const nx = Math.ceil((x1 - x0) / g) + 1, ny = Math.ceil((y1 - y0) / g) + 1, N = nx * ny;
    const SS = CX.S.map(([P, d]) => ({ P: through(P, 6), d }));
    // the nearest major sulcus: the signed distance (the curve's left side +), its left normal, its depth, and whether the
    // nearest point is an end (past a sulcus's end the lock fades: the sign flips there). Signed, so the wave runs on
    // across a sulcus instead of reflecting off it (a standing wave: its phase sticks at 0 and pi, the bands go fat).
    const near = (x, y) => {
      let best = 1e12, bx = 0, by = 0, bd = 0, nx_ = 0, ny_ = 1, end = false;
      for (const s of SS) { const P = s.P; for (let i = 0; i + 1 < P.length; i++) { const ax = P[i][0], ay = P[i][1], ex = P[i + 1][0] - ax, ey = P[i + 1][1] - ay, el = Math.hypot(ex, ey) || 1; let u = ((x - ax) * ex + (y - ay) * ey) / (el * el); const e = (u < 0 && i === 0) || (u > 1 && i === P.length - 2); u = u < 0 ? 0 : u > 1 ? 1 : u; const qx = ax + ex * u, qy = ay + ey * u, d2 = (x - qx) * (x - qx) + (y - qy) * (y - qy); if (d2 < best) { best = d2; bx = qx; by = qy; bd = s.d; nx_ = -ey / el; ny_ = ex / el; end = e; } } }
      const d = Math.sqrt(best), sg = (x - bx) * nx_ + (y - by) * ny_ >= 0 ? 1 : -1;
      return { d, sd: sg * d, ux: nx_, uy: ny_, depth: bd, end };
    };
    // the kernels on a jittered grid, binned
    const sp = T * .42, sig = T * .5, R = sig * 3, R2 = R * R, i2s = 1 / (2 * sig * sig), bw = Math.ceil((x1 - x0) / R) + 1, bh = Math.ceil((y1 - y0) / R) + 1, bins = Array.from({ length: bw * bh }, () => []);
    for (let j = 0; y0 + j * sp <= y1 + sp; j++) for (let i = 0; x0 + i * sp <= x1 + sp; i++) {
      const cx = x0 + (i + .5 + (hash(i * 7.31 + j * 1.93) - .5) * .8) * sp, cy = y0 + (j + .5 + (hash(i * 3.17 + j * 5.71) - .5) * .8) * sp;
      const n = near(cx, cy), lock = Math.exp(-Math.pow(n.d / 30, 2)) * (n.end ? .25 : 1);   // (near a major sulcus the kernels are phase-locked to it)
      const a = (1 - lock) * CX.wander * (noise(cx * .006 + 9.1, cy * .006 + 2.3) - .5) * 2, ca = Math.cos(a), sa = Math.sin(a);
      const ux = n.ux * ca - n.uy * sa, uy = n.ux * sa + n.uy * ca, ph = f * n.sd + (1 - lock) * CX.rand * (hash(i * 5.13 + j * 9.7 + .3) - .5) * TAU;
      const b = Math.min(bh - 1, Math.max(0, Math.floor((cy - y0) / R))) * bw + Math.min(bw - 1, Math.max(0, Math.floor((cx - x0) / R)));
      bins[b].push([cx, cy, f * ux, f * uy, ph - f * (ux * cx + uy * cy)]);
    }
    const P = new Float32Array(N), A = new Float32Array(N), MK = new Float32Array(N), W = T * CX.warp, fw = 1 / (T * 1.5);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const x = x0 + i * g, y = y0 + j * g, id = j * nx + i;
      const wx = x + W * ((noise(x * fw + 3.1, y * fw + 7.3) - .5) * 2 + .45 * (noise(x * fw * 2.3 + 1.3, y * fw * 2.3 + 4.1) - .5) * 2), wy = y + W * ((noise(x * fw + 11.7, y * fw + 17.9) - .5) * 2 + .45 * (noise(x * fw * 2.3 + 8.9, y * fw * 2.3 + 6.7) - .5) * 2);
      let re = 0, im = 0, ws = 0;
      const bi = Math.floor((wx - x0) / R), bj = Math.floor((wy - y0) / R);
      for (let v = Math.max(0, bj - 1); v <= Math.min(bh - 1, bj + 1); v++) for (let u = Math.max(0, bi - 1); u <= Math.min(bw - 1, bi + 1); u++) for (const k of bins[v * bw + u]) {
        const dx = wx - k[0], dy = wy - k[1], d2 = dx * dx + dy * dy; if (d2 > R2) continue;
        const w = Math.exp(-d2 * i2s), th = k[2] * wx + k[3] * wy + k[4]; re += w * Math.cos(th); im += w * Math.sin(th); ws += w;
      }
      const m = Math.hypot(re, im) || 1e-9, n = near(wx, wy);
      P[id] = re / m + .34 * n.depth * Math.exp(-Math.pow(n.d / (6 + 10 * n.depth), 2));   // (the major sulci deeper: a wider floor)
      A[id] = ws > 0 ? m / ws : 0;
      MK[id] = inPoly(x, y, M) ? 1 : 0;   // (the whole outline: masked off where the cerebellum overlaps it, the cortex's hatching stopped short of its lower edge and left a blank band above the cerebellum)
    }
    const GX = new Float32Array(N), GY = new Float32Array(N);
    for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) { const id = j * nx + i; GX[id] = (P[id + 1] - P[id - 1]) / (2 * g); GY[id] = (P[id + nx] - P[id - nx]) / (2 * g); }
    return (CXF = { x0, y0, x1, y1, g, nx, ny, P, A, MK, GX, GY, M, CB });
  }
  CX.rand = 1; CX.wander = 1; CX.warp = .42;   // how far the gyri wander from the major sulci's lead: the kernels' random phase (x a full turn), their orientation's (rad), the warp (x T)
  // bilinear sample of a field array
  function cxAt(F, arr, x, y) {
    const fx = (x - F.x0) / F.g, fy = (y - F.y0) / F.g, i = Math.max(0, Math.min(F.nx - 2, Math.floor(fx))), j = Math.max(0, Math.min(F.ny - 2, Math.floor(fy))), u = clamp(fx - i), v = clamp(fy - j), id = j * F.nx + i;
    return (arr[id] * (1 - u) + arr[id + 1] * u) * (1 - v) + (arr[id + F.nx] * (1 - u) + arr[id + F.nx + 1] * u) * v;
  }
  // the level set P = lv as polylines (marching squares, chained through shared cell edges), inside the mask
  function cxLevel(F, lv) {
    const { nx, ny, P, g, x0, y0 } = F, segs = [];
    const hId = (i, j) => 2 * (j * nx + i), vId = (i, j) => 2 * (j * nx + i) + 1;
    for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
      const id = j * nx + i;
      if (!(F.MK[id] || F.MK[id + 1] || F.MK[id + nx] || F.MK[id + nx + 1])) continue;
      const a = P[id], b = P[id + 1], c = P[id + nx + 1], d = P[id + nx], A = a > lv, B = b > lv, C = c > lv, D = d > lv;
      if (A === B && B === C && C === D) continue;
      const X = [];
      if (A !== B) X.push(hId(i, j)); if (B !== C) X.push(vId(i + 1, j)); if (C !== D) X.push(hId(i, j + 1)); if (D !== A) X.push(vId(i, j));
      if (X.length === 2) segs.push(X);
      else if (X.length === 4) { const ctr = (a + b + c + d) / 4 > lv; if (B !== ctr) { segs.push([X[0], X[1]], [X[2], X[3]]); } else { segs.push([X[0], X[3]], [X[1], X[2]]); } }
    }
    const pt = e => { const k = e >> 1, i = k % nx, j = (k - i) / nx; if (e & 1) { const p = P[k], q = P[k + nx], t = (lv - p) / (q - p); return [x0 + i * g, y0 + (j + t) * g]; } const p = P[k], q = P[k + 1], t = (lv - p) / (q - p); return [x0 + (i + t) * g, y0 + j * g]; };
    const adj = new Map(); segs.forEach((s, k) => { for (const e of s) { const L = adj.get(e); if (L) L.push(k); else adj.set(e, [k]); } });
    const used = new Uint8Array(segs.length), out = [];
    for (let k = 0; k < segs.length; k++) {
      if (used[k]) continue; used[k] = 1;
      const fwd = [segs[k][1]], bwd = [segs[k][0]];
      for (const [arr] of [[fwd], [bwd]]) for (;;) { const e = arr[arr.length - 1], L = adj.get(e); let q = -1; for (const s of L) if (!used[s]) { q = s; break; } if (q < 0) break; used[q] = 1; arr.push(segs[q][0] === e ? segs[q][1] : segs[q][0]); }
      const chain = bwd.reverse().concat(fwd).map(pt);
      // (split where it leaves the brain)
      let run = [];
      for (const p of chain) { if (cxAt(F, F.MK, p[0], p[1]) > .5) run.push(p); else { if (run.length > 1) out.push(run); run = []; } }
      if (run.length > 1) out.push(run);
    }
    // a light smoothing (the grid's facets off), ends kept; crumbs (at a fork) dropped
    const len = L => { let a = 0; for (let i = 1; i < L.length; i++) a += Math.hypot(L[i][0] - L[i - 1][0], L[i][1] - L[i - 1][1]); return a; };
    return out.filter(L => len(L) > 9).map(L => L.map((p, i) => i === 0 || i === L.length - 1 ? p : [.25 * L[i - 1][0] + .5 * p[0] + .25 * L[i + 1][0], .25 * L[i - 1][1] + .5 * p[1] + .25 * L[i + 1][1]]));
  }
  // lines at angle a (deg), d apart, across the field's box, kept where test(x, y) holds (the sulci's cross-hatching)
  function cxClip(F, a, d, test) {
    const ang = a * Math.PI / 180, c = Math.cos(ang), s = Math.sin(ang), out = [], cx = (F.x0 + F.x1) / 2, cy = (F.y0 + F.y1) / 2, Rr = Math.hypot(F.x1 - F.x0, F.y1 - F.y0) / 2;
    for (let o = -Rr; o <= Rr; o += d) {
      let run = null, tail = null, n = 0;   // (a point kept every 6 px, and the run's true end)
      const close = () => { if (run) { if (tail) run.push(tail); if (run.length > 1) out.push(run); } run = null; tail = null; };
      for (let t = -Rr; t <= Rr; t += 1.2) {
        const x = cx + c * t - s * o, y = cy + s * t + c * o;
        if (x > F.x0 && x < F.x1 && y > F.y0 && y < F.y1 && test(x, y)) { if (!run) { run = [[x, y]]; n = 0; } else if (++n % 5 === 0) { run.push([x, y]); tail = null; } else tail = [x, y]; }
        else close();
      }
      close();
    }
    return out;
  }
  // The engraving's triangles (brain-local): { deep, rose }, for detail level K (4K: more hatching, each line finer).
  function cxBuild() {
    const K = bankK(), KW = bankKW(), key = K + ':' + KW;
    if (CXB[key]) return CXB[key];
    const F = cxField(), deep = [], rose = [], L = LIGHT.dir, wmin = .22;
    const glob = (x, y) => clamp(.5 + .75 * ((x - 10) * -L[0] + (y + 150) * -L[1]) / 560);   // the brain's own form: lit up and left
    const facing = (x, y) => { const gx = cxAt(F, F.GX, x, y), gy = cxAt(F, F.GY, x, y), m = Math.hypot(gx, gy) || 1; return (gx * L[0] + gy * L[1]) / m; };   // +1: a flank turned to the light
    const coh = (x, y) => clamp((cxAt(F, F.A, x, y) - .1) / .3);   // (near a fork the phase is undefined: the hatching thins out there)
    const swell = (T, lines, wf) => { for (const P of lines) { const ws = P.map(([x, y]) => wf(x, y)); bankSwell(T, P, ws, wmin); } };
    // the sulci, deep: graded cross-hatching darkening down into each fold from its lip, three ways at the bottom, and
    // the darkest line along the bottom of the crevice. (A flat band of one-way hatching read as a grey stripe.)
    const hd = 2.3 / Math.pow(K, .6), hw = .95 / KW, Pat = (x, y) => cxAt(F, F.P, x, y), inM = (x, y) => cxAt(F, F.MK, x, y) > .5;
    swell(deep, cxClip(F, 38, hd, (x, y) => Pat(x, y) > .83 && inM(x, y)), (x, y) => hw * (.3 + 1.25 * clamp((Pat(x, y) - .83) / .2)));
    swell(deep, cxClip(F, -52, hd * 1.2, (x, y) => Pat(x, y) > .9 && inM(x, y)), (x, y) => hw * (.3 + 1.1 * clamp((Pat(x, y) - .9) / .15)));
    swell(deep, cxClip(F, 84, hd * 1.4, (x, y) => Pat(x, y) > .965 && inM(x, y)), (x, y) => hw * (.4 + .9 * clamp((Pat(x, y) - .965) / .1)));
    swell(deep, cxLevel(F, .992), () => 1.3 / Math.sqrt(KW));
    // the brain's own roundness: a sparse shading across the crests on its shadow side (lines along the terminator)
    const ta = Math.atan2(L[1], L[0]) * 180 / Math.PI + 90, fd = 3.4 / Math.pow(K, .7);
    swell(rose, cxClip(F, ta, fd, (x, y) => cxAt(F, F.P, x, y) < .8 && cxAt(F, F.MK, x, y) > .5), (x, y) => .95 / KW * Math.pow(clamp((glob(x, y) - .52) / .48), 1.2) * 1.6);
    // the floor's edge and the lips (the fold's double line)
    swell(deep, cxLevel(F, .945), (x, y) => (.7 + .5 * glob(x, y)) * 1.05 / Math.sqrt(KW));
    swell(deep, cxLevel(F, .8), (x, y) => (.35 + .75 * (.5 - .5 * facing(x, y)) + .35 * glob(x, y)) * 1.1 / Math.sqrt(KW));
    // the gyri: each one's whole surface in contour lines following its form, level by level from the lip over its
    // rounded crown (they loop round its ends), heavier toward the sulci and on the side turned from the light, finer and
    // more open on the lit crowns (every other line drops out there), never blank. (Before, the lines stopped short of the
    // crowns and broke to paper wherever the tone was light: the gyri read as bare paper.)
    const n = Math.round(7 * K);
    for (let q = 0; q < n; q++) {
      const s = (q + .5) / n, u = lerp(.115, .47, s), lv = Math.cos(TAU * u), w0 = lerp(1.2, .75, s) / KW, open = q % 2;
      swell(rose, cxLevel(F, lv), (x, y) => {
        const tone = clamp(.66 * (.5 - .5 * facing(x, y)) * lerp(1.1, .85, s) + .52 * glob(x, y) - .08), c = lerp(.6, 1, coh(x, y));
        return c * w0 * (open ? 2.3 * Math.pow(clamp((tone - .3) / .7), 1.1) : .62 + 1.9 * Math.pow(tone, 1.15));
      });
    }
    return (CXB[key] = { deep, rose, F });
  }
  // the mass's outline: notched where a sulcus reaches the edge, bulging over each gyrus; heavier on the shadow side
  let CX_OUT = null;
  function cxOutline() {
    if (CX_OUT) return CX_OUT;
    const F = cxField(), P = resample(F.M, 3), Nm = normals(P);
    // (the dips at the sulci's mouths smoothed along the outline into clean curves: point by point they were sawtooth notches)
    const D = P.map(([x, y], i) => { const p = cxAt(F, F.P, x - Nm[i][0] * 5, y - Nm[i][1] * 5), k = clamp((p - .55) / .45); return 6.5 * k * k - 2 * (1 - k); }), N = P.length;
    const Ds = D.map((_, i) => { let a = 0, w = 0; for (let j = -6; j <= 6; j++) { const g = Math.exp(-j * j / 12); a += g * D[(i + j + N) % N]; w += g; } return a / w; });
    return (CX_OUT = P.map(([x, y], i) => [x - Nm[i][0] * Ds[i], y - Nm[i][1] * Ds[i]]));
  }
  // the whole cortex, engraved: paper, the two inks, the outline (inside the brain's own transform)
  function cortex(o = {}) {
    const B = cxBuild(), L = LIGHT.dir, Mo = cxOutline();
    _paint(Mo, { wash: mixCol(BANK.paper, '#F2D6DC', .35), washOp: 255, ink: null });
    bankTris(B.rose, o.rose || mixCol('#8A2F4E', BANK.ink, .18));
    bankTris(B.deep, o.deep || mixCol('#3A0C1E', BANK.ink, .25));
    const T = [], C = Mo.concat([Mo[0]]);
    bankSwell(T, C, C.map(([x, y]) => 2 + 2.6 * clamp(.5 + .9 * ((x - 10) * -L[0] + (y + 150) * -L[1]) / 560)), .2);
    bankTris(T, o.deep || mixCol('#3A0C1E', BANK.ink, .25));
  }
  // THE CATHEDRAL (the ground: printed as the pale underprint under the brain, the figure). Local px at s = 1 (the
  // cortex spans x -505..485, y -395..172; its stem goes down into the roof): the nave's facade (x ±470, y 190..612)
  // under an entablature (a cornice, dentils, a guilloche frieze), four fluted columns with foliate capitals, lancets with
  // the server racks glimpsed in them, a rose window, the bronze portal at the top of the steps with a small brass service
  // hatch in it and the pneumatic tube's funnel below; organ-pipe towers either side of the brain (its steam vents), two
  // gears meshing in each tower's oculus, buttresses and pinnacles outside; brass conduits from the hatch up to the brain.
  const CC = { stone: '#CBC4B0', stoneDk: '#978F7B', stoneDp: '#645D50', brass: '#C49C42', brassDk: '#7C5E22', glass: '#4E5C72', bronze: '#8C6C3C', pipe: '#BCBAAE', rack: '#2A2E38' };
  const CH = { hw: 36, top: 496, sill: 570, slot: 526, lamp: 480, funnel: 632, neck: 662 };
  const CONDUIT = d => through([[d * 30, 492], [d * 70, 440], [d * 112, 404], [d * 126, 330], [d * 126, 214], [d * 74, 178]], 6);   // (from the hatch up the portal's arch, round the rose window, into the brain)
  // a batch of crisp engraved lines in the ground's (pale) ink: add(P, w), then draw()
  function lineBatch() { const T = []; return { add(P, w) { bankSwell(T, P, P.map(() => w), .2); }, draw(col) { bankTris(T, col || mixCol(BANK.ink, BANK.paper, .3)); T.length = 0; } }; }
  const closed = P => P.concat([P[0]]);
  function cathedral(t, g, wake, o) {
    const bno = typeof BNO !== 'undefined', spin = t * (.25 + 1.4 * wake) + 9 * g * t, LB = lineBatch();
    boilSeed('br cath');
    // outer pinnacles and flying buttresses
    for (const d of [-1, 1]) {
      piece([[d * 750, 612], [d * 750, 60], [d * 775, -90], [d * 800, 60], [d * 800, 612]], CC.stoneDk, { sw: 1.4, key: 'brpin' + d, lift: 0 });
      for (let j = 0; j < 5; j++) LB.add([[d * 750, 540 - j * 110], [d * 800, 540 - j * 110]], 1);
      for (let j = 0; j < 4; j++) { const y = 40 - j * 30, x = d * (755 + j * 5); LB.add([[x, y], [x - d * 14, y - 12]], 1.4); LB.add([[d * 1550 - x, y], [d * 1550 - x + d * 14, y - 12]], 1.4); }
      for (let j = 0; j < 3; j++) { const y0 = 450 - j * 160; piece(ribbon(through([[d * 750, y0], [d * 718, y0 - 58], [d * 680, y0 - 36]], 6), 13, 9), CC.stoneDk, { sw: 1, key: 'brfly' + d + j, lift: 0 }); }
    }
    // the towers: stone, string courses, an oculus with two gears meshing, blind tracery; a flat of organ pipes on top
    for (const d of [-1, 1]) {
      const X0 = d > 0 ? 530 : -680, X1 = d > 0 ? 680 : -530, xc = d * 605;
      piece(rect(X0, -40, X1, 612), CC.stone, { sw: 1.6, shade: CC.stoneDk, depth: 14, key: 'brtower' + d, lift: 0 });
      for (let i = 0; i < 7; i++) {
        const x = X0 + 14 + i * 20.3, h = 262 - Math.abs(i - 3) * 44, top = -40 - h, w = 8;
        piece([[x - w, -40], [x - w, top + 5], [x - w * .7, top], [x + w * .7, top], [x + w, top + 5], [x + w, -40]], CC.pipe, { sw: 1.1, shade: CC.stoneDk, depth: 4, key: 'brpipe' + d + i, lift: 0 });
        const my = -40 - Math.min(70, h * .3);
        LB.add([[x - w * .7, my], [x, my - 9], [x + w * .7, my]], .9); LB.add([[x - w * .7, my + 3], [x + w * .7, my + 3]], .7);
      }
      for (const y of [-40, 176, 404]) piece(rect(X0 - 8, y, X1 + 8, y + 14), CC.stoneDk, { sw: 1, key: 'brcourse' + d + y, lift: 0 });
      piece(oval(xc, 92, 60, 60, 0, 36), CC.rack, { sw: 1.4, key: 'broc' + d, lift: 0 });
      gear(xc - 14, 80, 38, 10, spin * d, CC.brass, 'brgo' + d); gear(xc + 25, 114, 24, 7, -spin * d * 1.58, CC.brassDk, 'brgp' + d);
      LB.add(closed(oval(xc, 92, 66, 66, 0, 40)), 2.4); LB.add(closed(oval(xc, 92, 72, 72, 0, 40)), .9);
      if (bno) BNO.tracery(xc, 300, 52, 76, 388);
      for (let j = 0; j < 4; j++) LB.add([[X0 + 10, 440 + j * 42], [X1 - 10, 440 + j * 42]], .8);
    }
    // the nave's facade
    piece(rect(-530, 190, 530, 612), CC.stone, { sw: 1.8, shade: CC.stoneDk, depth: 20, key: 'brnave', lift: 0 });
    piece(rect(-546, 184, 546, 204), CC.stoneDk, { sw: 1.2, key: 'brcorn', lift: 0 });
    if (bno) BNO.dentils(-530, 530, 206, 10);
    guillocheBand(-512, 512, 232, 22, { n: 6, wl: 44, col: mixCol(BANK.ink, '#A8843A', .45), w: .7 });
    LB.add([[-530, 219], [530, 219]], 1); LB.add([[-530, 246], [530, 246]], 1.2);
    if (bno) for (const d of [-1, 1]) BNO.tracery(d * 463, 340, 42, 60, 566);   // blind tracery in the outer bays
    // the lancets (the data centre: racks inside, their lights blinking faster the harder it works)
    const LED = [];
    for (const x of [-270, 270]) {
      const A = bkArch(x, 380, 46, 64).concat([[x + 46, 562], [x - 46, 562]]);
      piece(A, CC.rack, { sw: 1.4, key: 'brlan' + x, lift: 0 });
      for (let j = 0; j < 7; j++) {
        const y = 392 + j * 24; LB.add([[x - 38, y], [x + 38, y]], .8);
        for (let q = 0; q < 5; q++) if (hash(q * 3.1 + j * 7.7 + x + Math.floor(t * (1.5 + 3 * wake + 16 * g) + q * .37)) > .55) { const lx = x - 28 + q * 14, ly = y + 10, r = 2.8; LED.push(lx - r, ly, lx, ly - r, lx + r, ly, lx - r, ly, lx + r, ly, lx, ly + r); }
      }
      LB.add(closed(A), 3.2);
    }
    bankTris(LED, '#D8B040');
    // the columns: pedestal, torus, fluted shaft, foliate capital
    for (const x of [-372, -168, 168, 372]) {
      piece(rect(x - 24, 294, x + 24, 578), CC.stone, { sw: 1.3, shade: CC.stoneDk, depth: 10, key: 'brcol' + x, lift: 0 });
      piece(rect(x - 32, 580, x + 32, 612), CC.stoneDk, { sw: 1.2, key: 'brped' + x, lift: 0 });
      if (bno) { BNO.flutes(x - 24, x + 24, 302, 568, 7); BNO.capital(x - 27, x + 27, 252, 296); BNO.torus(x - 29, x + 29, 574, 10); }
      else LB.add([[x, 300], [x, 570]], 1);
    }
    // the rose window: glass, tracery (twelve petals, spokes), a guilloche rosette at its heart; it glows as it thinks
    const RY = 300, RR = 84, lit = Math.max(wake * .6, g);
    piece(oval(0, RY, RR + 13, RR + 13, 0, 48), CC.stoneDk, { sw: 1.6, key: 'brroser', lift: 0 });
    piece(oval(0, RY, RR, RR, 0, 48), CC.glass, { sw: 1.4, key: 'brrose', lift: 0 });
    if (lit > .02) _glow(0, RY, RR * 1.3, '#FFD27A', .75 * lit);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; LB.add([[Math.cos(a) * 20, RY + Math.sin(a) * 20], [Math.cos(a) * RR, RY + Math.sin(a) * RR]], 2.2); LB.add(closed(oval(Math.cos(a + TAU / 24) * RR * .72, RY + Math.sin(a + TAU / 24) * RR * .72, RR * .17, RR * .17, 0, 14)), 1.4); }
    LB.add(closed(oval(0, RY, RR * .5, RR * .5, 0, 32)), 1.6); LB.add(closed(oval(0, RY, RR, RR, 0, 48)), 2.6);
    guilloche(0, RY, 6, 38, { n: 8, lobes: 9, w: .7, col: mixCol(BANK.ink, '#A8843A', .4) });
    // the portal: archivolts, the bronze doors (coffered), the leaves' meeting
    for (const [e, c] of [[36, CC.stoneDk], [20, CC.stone]]) piece(bkArch(0, 470, 100 + e, 72 + e * .8).concat([[100 + e, 612], [-100 - e, 612]]), c, { sw: 1.3, key: 'brarchv' + e, lift: 0 });
    const PA = bkArch(0, 470, 100, 72);
    piece(PA.concat([[100, 612], [-100, 612]]), CC.bronze, { sw: 1.6, shade: CC.brassDk, depth: 8, key: 'brdoor', lift: 0 });
    if (bno) { BNO.coffers(-94, 478, -40, 604, 1, 3); BNO.coffers(40, 478, 94, 604, 1, 3); }
    LB.add([[0, 398], [0, CH.top - 8]], 1.6); LB.add([[0, CH.sill + 6], [0, 612]], 1.6);
    // the steps, down into the clouds
    for (let i = 0; i < 6; i++) { const y = 612 + i * 16, w = 300 + i * 30; piece(rect(-w, y, w, y + 16), i % 2 ? CC.stone : '#BDB6A2', { sw: 1.1, key: 'brstep' + i, lift: 0 }); LB.add([[-w, y + 2], [w, y + 2]], .7); }
    // the brass conduits from the hatch up round the rose window into the brain
    for (const d of [-1, 1]) { piece(ribbon(CONDUIT(d), 8, 8), CC.brass, { sw: 1.1, key: 'brcond' + d, lift: 0 }); for (let y = 230; y < 330; y += 50) LB.add([[d * 126 - 7, y], [d * 126 + 7, y]], 1.8); }
    LB.draw();
  }
  // the service hatch (a small arched brass door in the portal, a letter slot in it, a lamp over it) and the tube's brass
  // funnel on the top step. o.hatch 0..1 drops the door open toward us (a little ramp); o.slot flicks the slot's flap;
  // o.lamp lights the lamp; o.between(stage) draws what passes through ('hole': inside, 'door': out over the door,
  // 'funnel': dropping into it).
  // (the props in play print as figure: dark mouths, bold lines. A glow drawn among figure pieces is painted over by the
  // next piece's fill, so the hatch's glows are queued (GLQ) and drawn after it.)
  let GLQ = null;
  const glowQ = (...a) => { if (GLQ) GLQ.push(a); else _glow(...a); };
  function hatchAndFunnel(t, o) { GLQ = []; try { bankFigure(() => hatchAndFunnel_(t, o)); } finally { const q = GLQ; GLQ = null; for (const a of q) _glow(...a); } }
  function hatchAndFunnel_(t, o) {
    const { hw, top, sill } = CH, hk = o.hatch ?? 0, LB = lineBatch();
    boilSeed('br hatch');
    piece(bkArch(0, top + 18, hw + 7, 20).concat([[hw + 7, sill + 7], [-hw - 7, sill + 7]]), CC.brassDk, { sw: 1.4, key: 'brhframe', lift: 0 });
    piece(bkArch(0, top + 18, hw, 16).concat([[hw, sill], [-hw, sill]]), '#16141A', { sw: 1, key: 'brhole', lift: 0 });
    if (o.between) o.between('hole');
    // the door: hinged at the sill; closed it covers the opening; open it's folded down toward us (a short ramp)
    const ang = hk * 2.15, c = Math.cos(ang), fl = 1 + .3 * Math.sin(ang), dh = (sill - top) * c;
    if (hk < .02) {
      piece(bkArch(0, top + 18, hw, 16).concat([[hw, sill], [-hw, sill]]), CC.brass, { sw: 1.3, shade: CC.brassDk, depth: 5, key: 'brhdoor', lift: 0 });
      const fk = o.slot ?? 0;   // the letter slot and its flap
      piece(rect(-17, CH.slot - 4, 17, CH.slot + 4), '#16141A', { ink: null, key: 'brslot', lift: 0 });
      piece([[-18, CH.slot - 5], [18, CH.slot - 5], [18, CH.slot - 5 + 10 * Math.cos(fk * 1.4)], [-18, CH.slot - 5 + 10 * Math.cos(fk * 1.4)]], CC.brassDk, { sw: 1, key: 'brslotf', lift: 0 });
      LB.add([[-hw + 6, sill - 8], [hw - 6, sill - 8]], .8); LB.add(closed(oval(hw - 9, 548, 3, 3, 0, 8)), 1);
    } else {
      const D = [[-hw, sill], [hw, sill], [hw * fl, sill - dh], [-hw * fl, sill - dh]];
      piece(D, CC.brass, { sw: 1.3, shade: CC.brassDk, depth: 3, key: 'brhdoor', lift: 0 });
      for (let j = 1; j < 3; j++) LB.add([[-hw * lerp(1, fl, j / 3) + 4, sill - dh * j / 3], [hw * lerp(1, fl, j / 3) - 4, sill - dh * j / 3]], .8);
    }
    LB.draw(mixCol(BANK.ink, '#7C5E22', .3));
    if (o.between) o.between('door');
    // the lamp over the hatch (lit: the request received, and the ding)
    const lk = o.lamp ?? 0;
    piece(oval(0, CH.lamp, 8, 8, 0, 14), lk > .3 ? '#F2C650' : CC.brassDk, { sw: 1.2, key: 'brlamp', lift: 0 });
    if (lk > .02) { glowQ(0, CH.lamp, 46, '#FFD27A', .9 * lk); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r0 = 13, r1 = 13 + 14 * lk; _inkLine([[Math.cos(a) * r0, CH.lamp + Math.sin(a) * r0], [Math.cos(a) * r1, CH.lamp + Math.sin(a) * r1]], 1.4, '#B8862A', 'rotring', 0); } }
    // the funnel: its dark mouth, what drops in, its brass front
    const F = CH.funnel;
    piece(oval(0, F, 40, 9, 0, 24), '#16141A', { sw: 1.2, key: 'brfunm', lift: 0 });
    if (o.between) o.between('funnel');
    piece([[-42, F], [-40, F + 4], [-17, CH.neck], [17, CH.neck], [40, F + 4], [42, F]], CC.brass, { sw: 1.4, shade: CC.brassDk, depth: 6, key: 'brfun', lift: 0 });
    const LB2 = lineBatch(); LB2.add(arcPts(0, F, 42, 9, 0, Math.PI), 2); LB2.add([[-18, CH.neck - 6], [18, CH.neck - 6]], 1.4); LB2.draw(mixCol(BANK.ink, '#7C5E22', .3));
  }
  const arcPts = (cx, cy, rx, ry, a0, a1, n = 16) => { const P = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); P.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return P; };
  // The effort, all sincere hard work: steam from the organ pipes, impulses racing along the folds, lightning over the
  // cortex, engraved strain marks round it, sweat; lights running up the conduits (the request going in). g 0..1 (the
  // effort), wake 0..1 (the request arriving: the lights run up, the machinery stirs).
  function effort(t, g, wake) {
    boilSeed('br effort');
    // lights up the conduits: from the hatch to the brain, in a stream while it's awake or working
    const run = Math.max(wake, g);
    if (run > .02) for (const d of [-1, 1]) {
      const P = CONDUIT(d), L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
      const tot = L[L.length - 1], n = 9;
      for (let j = 0; j < n; j++) {
        const q = frac(t * (1.1 + 2.4 * g) + j / n), s = q * tot; let i = 1; while (i < L.length - 1 && L[i] < s) i++;
        const u = (s - L[i - 1]) / (L[i] - L[i - 1] || 1), x = lerp(P[i - 1][0], P[i][0], u), y = lerp(P[i - 1][1], P[i][1], u), a = run * Math.sin(q * Math.PI);
        if (a > .1) { _glow(x, y, 20, '#FFE08A', .8 * a); piece(oval(x, y, 4.5, 4.5, 0, 8), '#F4D060', { ink: null, key: 'brcl' + d + j, lift: 0 }); }
      }
    }
    if (g < .03) return;
    // steam from the organ pipes, puffing out on the beat
    for (const d of [-1, 1]) for (let i = 0; i < 7; i++) {
      const x = (d > 0 ? 530 : -680) + 14 + i * 20.3, top = -40 - (262 - Math.abs(i - 3) * 44);
      for (let j = 0; j < 2; j++) {
        const a2 = frac(bpOf(t) * .75 + j / 2 + i * .17 + (d > 0 ? .25 : 0)), r = (12 + 64 * a2) * g;
        if (r < 5) continue;
        piece(curvy(oval(x + d * (20 + 40 * a2), top - 16 - 230 * a2, r, r * .75, 0, 10).map(([px, py], m) => [px + 6 * Math.sin(m * 2.1 + j), py]), 3), '#DCDED8', { sw: 1.1, shade: '#A0A6A6', depth: r * .3, key: 'brsteam' + d + i + j, lift: 0 });
      }
    }
    // strain marks: pairs of engraved arcs round the crown of the brain, pulsing on the beat
    const pb = pulse(t, 4), LB = lineBatch();
    for (let i = 0; i < 7; i++) {   // (radial dashes in pairs, just off the crown, kicked out on the beat)
      const a = -Math.PI * (.12 + .76 * i / 6), cx = -10 + Math.cos(a) * (545 + 24 * pb), cy = -110 + Math.sin(a) * (325 + 24 * pb), nx = Math.cos(a), ny = Math.sin(a);
      for (const o2 of [-12, 12]) LB.add([[cx - ny * o2, cy + nx * o2], [cx + nx * 58 * g - ny * o2 * 1.25, cy + ny * 58 * g + nx * o2 * 1.25]], 3.6 * g);
    }
    LB.draw(mixCol(BANK.ink, '#3A0C1E', .4));
    // lightning crackling over the cortex: jagged bolts between points on its crown, a new pattern every eighth note
    const e8 = Math.floor(bpOf(t) * 2), flick = Math.exp(-frac(bpOf(t) * 2) * 3) * g;
    if (flick > .42) {   // (crisp tapered bolts: a few bold kinks, an ink edge, a gold body and a white-hot core; they snap on at full
      // width for a couple of frames and off: fading, they thinned into scratchy gold lines that read as scribbles)
      const Tb = [], Tc = [], To = [], glows = [];
      for (let i = 0; i < 3 + Math.round(4 * g); i++) {
        const h = hash(e8 * 7.1 + i * 3.3), a0 = -Math.PI * (.06 + .88 * h), a1 = a0 + (hash(e8 * 2.9 + i) > .5 ? 1 : -1) * (.25 + .35 * hash(e8 + i * 1.3)), P = [], n = 5;
        for (let q = 0; q <= n; q++) { const a = lerp(a0, a1, q / n), rr = (q === 0 || q === n ? .96 : .9 + (q % 2 ? .1 : -.02)) + .05 * (hash(e8 + i * 5 + q * 1.7) - .5); P.push([Math.cos(a) * 492 * rr - 10, -110 + Math.sin(a) * 288 * rr]); }
        const ws = P.map((_, q) => 15 * g * Math.sin(Math.PI * (q + .35) / (n + .7)));
        bankSwell(To, P, ws.map(w => w + 3.2), .3); bankSwell(Tb, P, ws, .3); bankSwell(Tc, P, ws.map(w => w * .35), .3);
        if (i % 2 === 0) { const b = P[2], B2 = [b, [b[0] + (hash(e8 + i) - .5) * 70, b[1] - 50 - 30 * hash(i + e8 * .7)], [b[0] + (hash(e8 + i * 2) - .5) * 110, b[1] - 105]], w2 = [8 * g, 5 * g, 0]; bankSwell(To, B2, w2.map(w => w + 3), .3); bankSwell(Tb, B2, w2, .3); }
        glows.push(P[2]);
      }
      bankTris(To, mixCol('#3A0C1E', BANK.ink, .25)); bankTris(Tb, '#DDA42A'); bankTris(Tc, '#FFF8DC');
      for (const m of glows) _glow(m[0], m[1], 110, '#FFE9A0', .45 * flick);
    }
    // sweat (earnest, not menacing): three drops sliding off its brow
    if (g > .3) for (let i = 0; i < 3; i++) { const q = frac(t * 1.2 + i / 3), sx = [-380, 330, -140][i], sy = -270 + [20, 40, -100][i] + 130 * q, D = [[sx, sy - 22]]; for (let k = 0; k <= 10; k++) { const a = -Math.PI * .15 + k / 10 * Math.PI * 1.3; D.push([sx + Math.cos(a) * 11, sy + 4 + Math.sin(a) * 11]); } piece(D, '#9AC8E8', { sw: 1.3, key: 'sweat' + i, lift: 0 }); }   // (teardrops)
  }
  // impulses racing along the folds (the thinking): bright heads with tails along the sulci's lips
  function thinking(t, g, wake) {
    const k = Math.max(g, wake * .35); if (k < .03) return;
    const C = cxChains(), T = [], Tc = [], G = [], n = Math.round(5 + 30 * k), tail = 150;   // (glows after the triangles: a glow before them in the batch hides them)
    for (let i = 0; i < n && i < C.length; i++) {
      const P = C[(i * 7) % C.length], L = P.L, tot = L[L.length - 1], q = frac(t * (1 + 1.8 * g) * (380 / Math.max(120, tot)) + hash(i * 3.7)), s1 = q * tot, s0 = Math.max(0, s1 - tail);
      const pts = [], ws = [];
      for (let j = 0; j < P.length; j++) if (L[j] >= s0 && L[j] <= s1) { pts.push(P[j]); ws.push(10 * k * Math.pow((L[j] - s0) / tail, 1.4)); }
      if (pts.length > 1) { bankSwell(T, pts, ws, .3); bankSwell(Tc, pts, ws.map(w => w * .38), .3); const hd = pts[pts.length - 1]; if (k > .25 && i % 3 === 0) G.push(hd); }
    }
    bankTris(T, '#E4A82C'); bankTris(Tc, '#FFF6D2');
    for (const hd of G) _glow(hd[0], hd[1], 36, '#FFE08A', .45 * k);
  }
  // the lips' longest polylines, with their arc lengths (the impulses' tracks)
  let CX_CH = null;
  function cxChains() {
    if (CX_CH) return CX_CH;
    const Ls = cxLevel(cxField(), .8).filter(P => P.length > 20).sort((a, b) => b.length - a.length).slice(0, 48);
    for (const P of Ls) { const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); P.L = L; }
    return (CX_CH = Ls);
  }
  // THE CEREBELLUM AND THE STEM, engraved to the cortex's standard (its inks, line weights and spacing; brain-local px),
  // built once per detail level into triangles (static: the finished engraving holds still). The cerebellum: its folia,
  // fine tightly packed arcs following its rounded form (each column's span from its top to its bottom edge, so they
  // converge at its ends), a crinkle along each, every fourth a fissure in the deep ink; swelling on the underside and
  // the side turned from the light, breaking to paper where it's lit; cross-hatched in its shadow; a deep crease
  // under the cortex's overhang. The stem: a tapering column (the pons' bulge, then the medulla narrowing) in
  // longitudinal contour lines following its form, swelling on its far side, cross-hatched there, the same crease
  // under the cortex. (They were a flat wash with a few wavy lines, and a tilted rectangle of evenly spaced rules.)
  const CBB = {};
  const polyBox = P => { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const [x, y] of P) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } return [x0, y0, x1, y1]; };
  const segDist = (x, y, P) => { let b = 1e9; for (let i = 0; i < P.length; i++) { const a = P[i], c = P[(i + 1) % P.length], ex = c[0] - a[0], ey = c[1] - a[1], L2 = ex * ex + ey * ey || 1, u = clamp(((x - a[0]) * ex + (y - a[1]) * ey) / L2), dx = x - a[0] - ex * u, dy = y - a[1] - ey * u; b = Math.min(b, dx * dx + dy * dy); } return Math.sqrt(b); };
  // hatching at angle a (deg), d apart, over box B, kept where test(x, y) holds
  function hatchIn(B, a, d, test) {
    const ang = a * Math.PI / 180, c = Math.cos(ang), s = Math.sin(ang), out = [], cx = (B[0] + B[2]) / 2, cy = (B[1] + B[3]) / 2, R = Math.hypot(B[2] - B[0], B[3] - B[1]) / 2;
    for (let o = -R; o <= R; o += d) {
      let run = [];
      for (let t = -R; t <= R; t += 1.5) { const x = cx + c * t - s * o, y = cy + s * t + c * o; if (test(x, y)) run.push([x, y]); else { if (run.length > 1) out.push(run); run = []; } }
      if (run.length > 1) out.push(run);
    }
    return out.map(P => P.filter((p, i) => i === 0 || i === P.length - 1 || i % 4 === 0));
  }
  function stemShape() {
    const C = through([[200, 70], [192, 128], [181, 186], [176, 238]], 12), n = C.length, L = [], R = [], hw = [];
    C.forEach((p, i) => {
      const s = i / (n - 1), a = C[Math.min(n - 1, i + 1)], b = C[Math.max(0, i - 1)], d = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, nx = -(a[1] - b[1]) / d, ny = (a[0] - b[0]) / d;
      const w = lerp(44, 15, Math.pow(s, 1.3)) + 9 * Math.sin(Math.PI * clamp(s / .55));   // (the pons' bulge, the medulla tapering to the cord)
      hw.push([nx, ny, w]); L.push([p[0] + nx * w, p[1] + ny * w]); R.push([p[0] - nx * w, p[1] - ny * w]);
    });
    const e = C[n - 1], [nx, ny, we] = hw[n - 1], cap = []; for (let k = 1; k < 8; k++) { const a = Math.PI * k / 8; cap.push([e[0] + nx * we * Math.cos(a) + ny * we * Math.sin(a) * .8, e[1] + ny * we * Math.cos(a) - nx * we * Math.sin(a) * .8]); }   // (its end rounded)
    return { C, hw, P: L.concat(cap, R.reverse()) };
  }
  function cbBuild() {
    const K = bankK(), KW = bankKW(), key = K + ':' + KW;
    if (CBB[key]) return CBB[key];
    const F = cxField(), M = F.M, CB = curvy(CX.CB, 5), ST = stemShape(), Lt = LIGHT.dir;
    const cb = { rose: [], deep: [] }, st = { rose: [], deep: [] };
    const B = polyBox(CB), cx0 = (B[0] + B[2]) / 2, cy0 = (B[1] + B[3]) / 2, rr = Math.max(B[2] - B[0], B[3] - B[1]) / 2;
    const glob = (x, y) => clamp(.5 + .75 * ((x - 10) * -Lt[0] + (y + 150) * -Lt[1]) / 560);   // (the brain's own light: the cortex's)
    const shCB = (x, y) => clamp(.4 * glob(x, y) + .6 * (.5 + .85 * ((x - cx0) * -Lt[0] + (y - cy0) * -Lt[1]) / rr));   // 1: in shadow
    const span = x => { const ys = []; for (let i = 0; i < CB.length; i++) { const a = CB[i], b = CB[(i + 1) % CB.length]; if ((a[0] <= x) !== (b[0] <= x)) ys.push(a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0])); } return ys.length < 2 ? null : [Math.min(...ys), Math.max(...ys)]; };
    const hw = .95 / KW, d = 4.4 / Math.pow(K, .6), hd = 2.3 / Math.pow(K, .6), inCB = (x, y) => inPoly(x, y, CB);
    // the cerebellum's folia
    const n = Math.round((B[3] - B[1]) / d);
    for (let j = 1; j < n; j++) {
      const v = j / n, fis = j % 4 === 0; let run = [];
      const flush = () => { if (run.length > 1) bankSwell(fis ? cb.deep : cb.rose, run, run.map(([x, y]) => (fis ? 1.35 : 1) * hw * (.1 + 1.9 * Math.pow(shCB(x, y), 1.3))), .22); run = []; };
      for (let x = B[0] + 1; x <= B[2] - 1; x += 2.5) {
        const sp = span(x); if (!sp || sp[1] - sp[0] < 4) { flush(); continue; }
        run.push([x, lerp(sp[0], sp[1], v) + .22 * d * Math.sin(x * .3 + j * .35)]);   // (a crinkle along each folium, in step with its neighbours: out of step they crossed into a net)
      }
      flush();
    }
    // its shadow, cross-hatched
    for (const [a, k, thr] of [[38, 1.6, .74], [-52, 1.9, .86]]) for (const P of hatchIn(B, a, hd * k, (x, y) => inCB(x, y) && shCB(x, y) > thr)) bankSwell(cb.deep, P, P.map(([x, y]) => hw * .65 * clamp((shCB(x, y) - thr) / .14 + .1)), .2);
    // the stem: longitudinal contour lines following its taper, swelling on its far side and lower down
    const SB = polyBox(ST.P), shS = u => clamp(.5 + .55 * u), nu = Math.round(2 * 40 / d);
    const uAt = (x, y) => { let b = 1e9, bi = 0; for (let i = 0; i < ST.C.length; i++) { const dd = Math.hypot(x - ST.C[i][0], y - ST.C[i][1]); if (dd < b) { b = dd; bi = i; } } const [nx, ny, w] = ST.hw[bi]; return -((x - ST.C[bi][0]) * nx + (y - ST.C[bi][1]) * ny) / w; };
    for (let q = 1; q < nu; q++) {
      const u = -1 + 2 * q / nu, P = ST.C.map((p, i) => [p[0] - ST.hw[i][0] * ST.hw[i][2] * u, p[1] - ST.hw[i][1] * ST.hw[i][2] * u]);
      bankSwell(q % 4 ? st.rose : st.deep, P, P.map((p, i) => hw * (q % 4 ? 1 : 1.3) * (.12 + 1.7 * Math.pow(shS(u), 1.4) + .35 * i / P.length)), .22);
    }
    for (const P of hatchIn(SB, 38, hd * 1.3, (x, y) => inPoly(x, y, ST.P) && uAt(x, y) > .45)) bankSwell(st.deep, P, P.map(() => hw * .7), .2);
    // the crease under the cortex's overhang: dense cross-hatching just below its edge, on the cerebellum and the stem
    const crease = (x, y, poly) => inPoly(x, y, poly) && !inPoly(x, y, M) && segDist(x, y, M) < 13, cw = ([x, y]) => hw * (1.3 - segDist(x, y, M) / 15);
    for (const [a, k] of [[38, 1], [-52, 1.15]]) {
      for (const P of hatchIn(B, a, hd * k, (x, y) => crease(x, y, CB))) bankSwell(cb.deep, P, P.map(cw), .2);
      for (const P of hatchIn(SB, a, hd * k, (x, y) => crease(x, y, ST.P))) bankSwell(st.deep, P, P.map(cw), .2);
    }
    // the outlines: heavier underneath and on the shadow side
    const Oc = closed(CB), Os = closed(ST.P);
    bankSwell(cb.deep, Oc, Oc.map(([x, y]) => 1.8 + 2.2 * shCB(x, y)), .2);
    bankSwell(st.deep, Os, Os.map(([x, y]) => 1.6 + 1.6 * clamp(uAt(x, y) * .5 + .5)), .2);
    return (CBB[key] = { cb, st, CB, ST: ST.P });
  }
  const BR_ROSE = () => mixCol('#8A2F4E', BANK.ink, .18), BR_DEEP = () => mixCol('#3A0C1E', BANK.ink, .25), BR_PAPER = () => mixCol(BANK.paper, '#F2D6DC', .35);
  function cerebellum() { const E = cbBuild(); _paint(E.CB, { wash: BR_PAPER(), washOp: 255, ink: null }); bankTris(E.cb.rose, BR_ROSE()); bankTris(E.cb.deep, BR_DEEP()); }
  function brainStem() { const E = cbBuild(); _paint(E.ST, { wash: BR_PAPER(), washOp: 255, ink: null }); bankTris(E.st.rose, BR_ROSE()); bankTris(E.st.deep, BR_DEEP()); }
  // The whole thing at (cx, cy), scale s. o: { grind, wake, hatch, slot, lamp, between }.
  function brain(t, cx, cy, s, o = {}) {
    const g = o.grind ?? 0, wake = o.wake ?? 0, th = pulse(t, 5) * g;
    push(); translate(cx, cy); scale(s);
    cathedral(t, g, wake, o);
    if (g > .03) _glow(-10, -110, 760, '#FFE6A0', (.1 + .22 * pulse(t, 3)) * g);
    boilSeed('br brain');
    push(); translate(0, 180); scale(1 + .035 * th + .012 * g, 1 - .03 * th); translate(0, -180);
    brainStem(); cerebellum(); cortex(); thinking(t, g, wake);
    pop();
    effort(t, g, wake);
    hatchAndFunnel(t, o);
    pop();
  }
  // the pneumatic tube, world px: from the train's roof up to the funnel's neck (bottom to top), and a point along it
  function tubePath(k) { const Bn = BRAIN[k], y1 = Bn.y + CH.neck * Bn.s; return through([[Bn.x + 40, 548], [Bn.x + 40, 380], [Bn.x + 14, lerp(548, y1, .55)], [Bn.x, y1 + 150 * Bn.s], [Bn.x, y1]], 12); }
  function pathAt(P, q) {
    if (!P.L) { P.L = [0]; for (let i = 1; i < P.length; i++) P.L.push(P.L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); }
    const L = P.L, s = clamp(q) * L[L.length - 1]; let i = 1; while (i < L.length - 1 && L[i] < s) i++;
    const u = (s - L[i - 1]) / (L[i] - L[i - 1] || 1); return [lerp(P[i - 1][0], P[i][0], u), lerp(P[i - 1][1], P[i][1], u), Math.atan2(P[i][1] - P[i - 1][1], P[i][0] - P[i - 1][0])];
  }
  // the tube: glass, brass rings, a brass collar on the train's roof; inside(P) draws what's in it. Two halves, the thick
  // cloud layer the seam between them (styleaudit 2026-09-25: a thing takes the medium of the place it's in, and changes
  // at a boundary we see): under the clouds, in the train's night, it's card (pale glass card, brass bands, the collar);
  // above them, in the sky of capital, it's engraved (bank: dense hatching across the smoked glass, so the white slip
  // shows in it; a figure piece this long and curved would have its along-the-form hatching mispaired at the grazing
  // edges). The seam, tubeSeam(k), sits inside the cloud fill (cyC - 60 .. cyC + 260), so the join never shows; what
  // rides the tube changes there too (the slip up, the sandwich down), hidden in the cloud.
  const tubeSeam = k => BRAIN[k].y + 850 * BRAIN[k].s + 100;
  function tubeSplit(P, yS) {   // P runs bottom to top: [the part below yS, the part above] (null if none above)
    let i = 1; while (i < P.length && P[i][1] > yS) i++;
    if (i >= P.length) return [P, null];
    const a = P[i - 1], b = P[i], u = (a[1] - yS) / (a[1] - b[1] || 1), J = [lerp(a[0], b[0], u), yS];
    return [P.slice(0, i).concat([J]), [J].concat(P.slice(i))];
  }
  function tube(k, inside) {
    const P = tubePath(k), w = 62 * BRAIN[k].s, [lo, hi] = tubeSplit(P, tubeSeam(k));
    const across = (Q, i, f) => { const [x, y] = Q[i], [x2, y2] = Q[Math.min(Q.length - 1, i + 1)], a = Math.atan2(y2 - y, x2 - x) + Math.PI / 2; return [[x - Math.cos(a) * w * f, y - Math.sin(a) * w * f], [x + Math.cos(a) * w * f, y + Math.sin(a) * w * f]]; };
    // under the clouds (card): the glass, a highlight down it
    look('card'); boilSeed('tube card');
    piece(ribbon(lo, w, w), '#9FB2C2', { sw: 1.3, key: 'tubeglass', lift: 2 });
    dline(lo.map(([x, y]) => [x - w * .28, y]), w * .09, '#D6E2EA', 0);
    // above them (bank): the smoked glass, hatched across
    look('bank');
    const LB = lineBatch();
    let tot = 0;
    if (hi) {
      boilSeed('tube');
      _paint(ribbon(hi, w, w), { wash: mixCol(BANK.paper, '#56607A', .3), washOp: 255, ink: null });
      pathAt(hi, 0); tot = hi.L[hi.L.length - 1];
      for (let s = 2; s < tot - 2; s += 3.4) { const [x, y, a] = pathAt(hi, s / tot), nx = -Math.sin(a), ny = Math.cos(a), h = w * .47; LB.add([[x - nx * h, y - ny * h], [x + nx * h * .55, y + ny * h * .55]], 1.2); LB.add([[x + nx * h * .55, y + ny * h * .55], [x + nx * h, y + ny * h]], .7); }
      LB.draw(mixCol(BANK.ink, '#18202C', .45));
    }
    if (inside) inside(P);   // (what's inside sets its own look by where it is: card under the seam, bank over it)
    // the brass: bands and the collar on the train's roof (card) under the clouds, engraved rings above
    look('card'); boilSeed('tube card brass');
    for (let i = 2; i < lo.length - 1; i += 3) piece(ribbon(across(lo, i, .6), 9, 9), '#B8943C', { sw: 1, key: 'tubeband' + i, lift: 1 });
    piece(rect(P[0][0] - w * .7, P[0][1] - 10, P[0][0] + w * .7, P[0][1] + 8), '#B8943C', { sw: 1.4, key: 'tubecollar', lift: 0 });
    look('bank');
    if (hi) {
      for (let i = 2; i < hi.length - 1; i += 3) LB.add(across(hi, i, .6), 5);
      LB.draw(mixCol('#9A7A30', BANK.ink, .2));
      LB.add(hi.map(([x, y]) => [x - w * .3, y]), 1.6); LB.draw(mixCol(BANK.paper, '#FFFFFF', .6));
      for (const sd of [-1, 1]) LB.add(hi.map(([x, y], i) => { const [, , a] = pathAt(hi, hi.L[i] / tot); return [x - Math.sin(a) * w / 2 * sd, y + Math.cos(a) * w / 2 * sd]; }), 1.8);
      LB.draw(mixCol(BANK.ink, '#18202C', .5));
    }
    return P;
  }
  // Her request: an order slip (in the current look: card in the train, engraved up in the brain's world), a sandwich
  // pictogram on it (the emoji's wedge: bread, a lettuce frill, ham, bread),
  // two rules for the order's lines and the tube's punch hole. (x, y) its middle, s its width.
  function slip(x, y, s, rot = 0) {
    push(); translate(x, y); rotate(rot); scale(s / 60);
    boilSeed('slip');
    piece(curvy(rect(-30, -38, 30, 38), 2), '#F8F4E8', { sw: 1.8, key: 'slipcard', lift: 3 });
    piece([[-21, 4], [21, 4], [7, -24]], '#E8C98A', { sw: 1.5, key: 'slipbread', lift: 0, flatCard: true });
    piece([[-21, 9], [21, 9], [21, 13], [-21, 13]], '#E27C84', { ink: null, key: 'sliphm', lift: 0, flatCard: true });
    dline([[-23, 7], [-16, 4], [-9, 8], [-2, 4], [5, 8], [12, 4], [19, 8], [24, 5]], 3.4, '#4E9A3A', .5);
    piece([[-21, 13], [21, 13], [20, 19], [-20, 19]], '#E8C98A', { sw: 1.4, key: 'slipbread2', lift: 0, flatCard: true });
    dline([[-20, 27], [20, 27]], 2, '#A8A294'); dline([[-20, 33], [6, 33]], 2, '#A8A294');
    piece(oval(0, -32, 3, 3, 0, 8), '#2A2632', { ink: null, key: 'sliphole', lift: 0, flatCard: true });
    pop();
  }
  // A meal-deal sandwich in its triangle pack (in the current look: engraved in the cathedral, card in her hand): the clear film pack, the wedge of pale bread inside, a thin sad
  // line of ham, a limp lettuce edge drooping out of it, the cardboard skillet's coloured band along the bottom, a glint
  // on the film, and a yellow reduced sticker (a barcode, no words). (x, y) its middle, s its width, rot.
  function sandwich(x, y, s, rot = 0, o = {}) {
    push(); translate(x, y); rotate(rot); scale(s / 100);
    const sw = clamp(s / 60, .7, 2.2) * 100 / s;
    boilSeed('sandwich');
    const A = [-50, 38], B = [50, 38], C = [24, -40];
    const at = (u, v) => [lerp(lerp(A[0], B[0], u), C[0], v), lerp(lerp(A[1], B[1], u), C[1], v)];
    piece([A, B, C], '#EAF2F2', { sw: sw * 1.1, shade: '#B8C8CC', depth: 5, key: 'swpack', lift: 4 });
    piece([at(.1, .1), at(.9, .1), at(.52, .84)], '#EAD49C', { sw: sw * .8, key: 'swbread', lift: 0, flatCard: true });   // the wedge
    // the filling, kept to the bread's cut face (clipped to the wedge): a thin line of ham, the lettuce frill waving along
    // it. (Its limp end drooped out past the wrapper's corner, and the frill's spline overshot the pack as it turned.)
    clipPoly([at(.1, .1), at(.9, .1), at(.52, .84)], () => {
      piece([at(.05, .1), at(.95, .1), at(.95, .16), at(.05, .16)], '#E48A8C', { ink: null, key: 'swham', lift: 0, flatCard: true });
      dline([at(.05, .18), at(.14, .15), at(.24, .19), at(.34, .15), at(.44, .19), at(.54, .15), at(.64, .19), at(.74, .15), at(.84, .19), at(.95, .16)], sw * 2.2, '#5AA23E', .6);
    });
    piece([at(0, 0), at(1, 0), at(1, .1), at(0, .1)], '#5B3F95', { sw: sw * .6, key: 'swband', lift: 1, flatCard: true });   // the skillet's band
    dline([at(.05, .05), at(.95, .05)], sw * .9, '#F2ECE0');
    dline([at(.35, .35), at(.55, .68)], sw * 1.6, '#FFFFFF'); dline([at(.45, .3), at(.58, .5)], sw * .9, '#FFFFFF');   // the film's glint
    push(); translate(...at(.8, .22)); rotate(-.18);   // the reduced sticker
    piece(curvy(rect(-13, -9, 13, 9), 2), '#F4D23A', { sw: sw * .7, key: 'swsticker', lift: 2, flatCard: true });
    for (let i = 0; i < 6; i++) dline([[-8 + i * 3, -4], [-8 + i * 3, 5]], sw * (i % 2 ? .6 : 1.1), '#2A2632');
    pop();
    pop();
  }

  // ======================================================================================================
  // C1b / C2b: "(Taking the piss!) All that intelligence, and we get this?" In three beats, for a first-time viewer:
  //   the request  in the carriage she holds up an order slip (a sandwich pictogram) under the brass hatch in the ceiling;
  //                it's sucked up; on "Taking" we're outside: the slip shoots up the glass tube from the train's roof and
  //                the camera rides up with it, through the clouds, to the cathedral: into the service hatch at the top of
  //                the steps, on "All". (The scale: from her window to a brain the size of a cathedral.)
  //   the effort   "All that": lights run up the conduits into the brain, the machinery stirs; pull back to the whole
  //                edifice; "intelligence": it works enormously and earnestly: impulses race along the folds, lightning,
  //                gears spinning, the organ pipes steaming, strain marks, sweat, the camera shaking; push in on the brain.
  //   the delivery a ding (the lamp); tilt down on the hatch as it drops open: out slides a sad little meal-deal sandwich,
  //                presented, and it drops into the tube's funnel on "we" (C1c: it drops out of the carriage's hatch into
  //                her hand on "get", and she holds it up, deadpan, on "this?").
  //   C2b: the brain bigger and working harder, the sandwich smaller.
  const BRAIN = [{ x: 960, y: -1400, s: 1, big: 1 }, { x: 960, y: -1850, s: 1.4, big: 1.15 }];
  // the brain's world: the sky of capital, clouds behind, the edifice, the tube, clouds in front. o: brain()'s options +
  // inTube(P) (the slip in the glass)
  function brainWorld(t, lt, k, o = {}) {
    const Bn = BRAIN[k], cyC = Bn.y + 850 * Bn.s, up = o.upper !== false;
    look('bank');
    if (up) { brainSky(Bn.x, Bn.y - 110 * Bn.s, cyC + 100); cloudBank(cyC, -1200, 3100, 'cb', 1); brain(t, Bn.x, Bn.y, Bn.s, o); }
    tube(k, o.inTube);
    if (up) { boilSeed('cbfill'); piece(rect(-1300, cyC - 60, 3200, cyC + 260), '#C4CACE', { ink: null, key: 'cbfill', lift: 0 }); cloudBank(cyC + 230, -1200, 3100, 'cbu', 0); cloudBank(cyC, -1200, 3100, 'cb', 0); }   // (a thick layer: no night showing between the clouds)
    look('card');
  }
  // the beats (shot time)
  function c1bBeats(T, dur) {
    const out = T.words[0] - .03, arrive = T.all, ding = T.and - .15;
    return { out, raise: [.04, .3], flap: [out - .44, out - .34], suck: [out - .36, out - .2], rise: [out + .03, arrive - .1], hop: [arrive - .1, arrive + .02], arrive,
      wake: [arrive, T.intel], grind: [T.intel - .06, T.intel + .22], ding, open: [ding + .03, ding + .11], slide: [ding + .08, ding + .2], drop: [dur - .08, dur] };
  }
  // the request, inside: her at the pole under the ceiling hatch, holding up the slip; it's sucked up into the pipe
  function c1bInside(t, lt, k, T, B) {
    const l = mt(lt), tt = mt(t);
    const flap = backOut(seg(l, B.flap[0], B.flap[1])), sq = seg(l, B.suck[0], B.suck[1]), gone = l >= B.suck[1];   // (the props and her on twos)
    look('card');
    if (k) camBegin(600, 450, 1.52); else camBegin(548, 372, 1.85);   // (C2b: wider, the two of them)
    carriage(tt, l, {
      nightT: t, boards: true, crowd: { level: k ? 2 : 1, skip: [], ...CREW_CROWD(k) },   // (as C1a/C2a: the same carriage, the boards showing home)
      sitters: () => sitters(tt, (k ? CREW2_SIT : CREW1_SIT)()),
      cast: () => {
        for (const [i, side, name, task] of k ? CREW2 : CREW1) if (!(i === 0 && side === -1) && task !== 'photo') botTask(tt, l, i, side, name, task);   // (the chorus's own crew, as in C1a / C2a; not bay 0's left seat in this close shot, nor the Muse, at its edge)
        ceilingHatch(flap * (1 - seg(l, B.suck[1] + .06, B.suck[1] + .2)));
      },
    });
    grabPole();
    callButton(0, 1, 0);   // (lit: she's just called, end of C1a/C2a)
    // her: bored; the slip up to the hatch, held up (on her toes a touch); the flap: a blink; it's snatched away: she looks up after it
    const up = ease(seg(l, B.raise[0], B.raise[1]));
    const mood = emotions(l, [[0, 'bored', { emote: null, mouth: 'flat' }], [B.flap[0], 'neutral', { emote: null }], [B.suck[0] + .04, 'surprised', { emote: null, mouth: 'flat' }]], { take: .6 });   // (silent after her line (C2b: from 141.1): a surprised open mouth reads as singing)
    // (her hand from her coat pocket, the slip in it, up to the hatch: both ends in 'u' units, feet-relative)
    const Rpk = [1.3, -9.8, .3, 'fist', 1, -1.3, 'u'], Rs = [2.2, -17.4, .25, gone ? 'open' : 'hold', 1, -1.5, 'u'];
    const Rnow = [lerp(Rpk[0], Rs[0], up), lerp(Rpk[1], Rs[1], up), lerp(Rpk[2], Rs[2], up), up > .3 ? Rs[3] : 'fist', 1, lerp(Rpk[5], Rs[5], up), 'u'];
    const hold = !gone && sq <= 0 && up > .2 ? (s0 => { push(); rotate(1.35); slip(0, -s0 * 1.7, s0 * 2.8, -.1 + .06 * Math.sin(l * 7)); pop(); }) : null;
    const sway = Math.sin(tt * 2.3) * .6;
    person(POLE - 64, AISLE - 6 * up, 31, HER_C, { ...mood, view: 'q', lookX: .5, lookY: lt < B.flap[0] ? -.6 : -1, pose: { L: [-1.2, 2.6, .15, 'relax'], R: Rnow }, hold, rot: sway * .015, boilKey: 'crher', seed: 3 });
    if (k) {   // him beside her, looking up at the hatch, hopeful (his fist round the pole: himFrontGrip)
      const hm = emotions(l, [[0, 'bored', { emote: null }], [B.suck[0] + .06, 'surprised', { emote: null, mouth: 'flat' }]], { take: .6 });
      const rot = -Math.sin(tt * 2.3) * .6 * .015;
      person(HIM_AT[0], HIM_AT[1], 31, HIM_C, { ...hm, view: 'q', flip: true, lookX: -.6, lookY: -1, pose: { L: [-1.2, 2.5, .15, 'relax'], R: himFrontGrip(rot) }, rot, boilKey: 'crhim', seed: 6 });
    }
    // snatched: the slip whips up into the pipe's mouth, shrinking, a streak under it
    if (sq > 0 && !gone) {
      const q = easeIn(sq), x = lerp(574, HATCH[0], q), y = lerp(480, HATCH[1] - 24, q);
      boilSeed('slipup'); for (let i = 0; i < 3; i++) dline([[x - 14 + i * 14, y + 40], [x - 14 + i * 14, y + 40 + 90 * q]], 2.6, '#F2ECE0', 0);
      slip(x, y, 70 * (1 - .5 * q), -.1 + .5 * q);
    }
    if (lt > B.suck[1] - .02 && lt < B.suck[1] + .2) { const q = seg(lt, B.suck[1] - .02, B.suck[1] + .2); for (let i = 0; i < 5; i++) { const a = Math.PI * (.15 + .7 * i / 4); piece(oval(HATCH[0] + Math.cos(a) * 50 * q, HATCH[1] + 14 + Math.sin(a) * 24 * q, 9 * (1 - q) + 2, 7 * (1 - q) + 2, 0, 8), '#CFC6B1', { sw: .8, key: 'sucpuff' + i, lift: 3 }); } }
    camEnd();
  }
  // the camera outside (world): up the tube with the slip, onto the hatch, back to the whole edifice, in on the brain, down
  // onto the hatch for the delivery. Framings in the brain's local px: [cy, screen px per local px].
  const FR = { hatch: [540, 1.4], full: [110, .74], brain: [-120, 1.08], deliver: [556, 2.1] };
  function c1bCam(lt, k, T, B, P) {
    const Bn = BRAIN[k], S = Bn.s, at = f => [Bn.y + f[0] * S, f[1] * Bn.big / S];
    const mix = (a, b, q) => [lerp(a[0], b[0], q), Math.exp(lerp(Math.log(a[1]), Math.log(b[1]), q))];
    const H0 = at(FR.hatch);
    if (lt < B.arrive) {   // riding up with the slip (the train framing to the hatch framing)
      const q = seg(lt, B.rise[0], B.rise[1]), e = q < .5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2, y = pathAt(P, e)[1];
      const z = Math.exp(lerp(Math.log(1.3), Math.log(H0[1]), ease(q)));
      return [lerp(y - 60, H0[0], ease(seg(q, .7, 1))), z];
    }
    let c = mix(H0, at(FR.full), ease(seg(lt, B.arrive + .12, B.wake[1] - .02)));
    c = mix(c, at(FR.brain), ease(seg(lt, B.wake[1] - .02, B.ding)) * .999);
    return mix(c, at(FR.deliver), ease(seg(lt, B.ding, B.ding + .2)));
  }
  function c1bOutside(t, lt, dur, k, T, B) {
    const Bn = BRAIN[k], l = mt(lt), tt = mt(t), P = tubePath(k), S = Bn.s;
    const [cy, z] = c1bCam(lt, k, T, B, P);
    const grind = seg(lt, B.grind[0], B.grind[1]) * (1 - seg(lt, B.ding - .02, B.ding + .06)), wake = seg(lt, B.arrive, B.arrive + .25) * (1 - seg(lt, B.ding, B.ding + .1));
    const sh = grind > .05 ? shakeXY(t, (5 + 6 * k) * grind) : [0, 0], dk = lt >= B.ding ? Math.exp(-(lt - B.ding) * 4) : 0;
    const riseQ = seg(lt, B.rise[0], B.rise[1]), riseE = riseQ < .5 ? 4 * riseQ * riseQ * riseQ : 1 - Math.pow(-2 * riseQ + 2, 3) / 2;
    look('card');
    camBegin(Bn.x + sh[0] / z, cy + sh[1] / z, z);
    outsideNight(t, cy);   // (the world sliding past the tracking camera: on ones)
    const vTop = cy - H / 2 / z;
    // what passes through the hatch and the funnel (brain-local px: the slip hopping into the slot; the sandwich)
    const sz = (k ? 20 : 46);   // the sandwich's width, local px (C2b: smaller)
    const between = stage => {
      if (lt >= B.hop[0] && lt < B.hop[1] + .02 && stage === 'door') {   // the slip: out of the funnel, up into the slot
        const q = seg(lt, B.hop[0], B.hop[1]); slip(0, lerp(CH.funnel - 10, CH.slot, ease(q)), 30 * (1 - .75 * easeIn(q)), .2 * (1 - q));   // (engraved: it's up in the brain's world now)
      }
      // the sandwich: out of the dark to the front of the opening, standing on the sill (presented, a glory round the
      // doorway), then over the lip of the ramp and down into the funnel
      const sl = seg(lt, B.slide[0], B.slide[1]), dr = seg(lt, B.drop[0], B.drop[1]);
      if (sl > 0 && dr < 1) {
        const onSill = CH.sill - sz * .36, y = dr > 0 ? lerp(onSill, CH.funnel + 4, easeIn(dr)) : lerp(onSill - 6, onSill, ease(sl)), sc = lerp(.5, 1, ease(sl)) * (1 - .3 * dr);
        if (stage === 'hole' && dr <= 0) {
          const gk = ease(seg(lt, B.slide[1] - .06, B.slide[1] + .08));
          const cy0 = (CH.top + CH.sill) / 2, ok = ease(seg(lt, B.open[0], B.open[1]));
          if (ok > .02) {   // (the hatch lit inside, filling the doorway, brightest behind the sandwich: it stands out against it)
            _paint(bkArch(0, CH.top + 22, CH.hw - 5, 14).concat([[CH.hw - 5, CH.sill], [-CH.hw + 5, CH.sill]]), { wash: '#EAD092', washOp: 220 * ok, ink: null });
            _paint(curvy(oval(0, CH.sill - 20, CH.hw * .7, (CH.sill - CH.top) * .36, 0, 16), 2), { wash: '#FFF2CC', washOp: 200 * ok, ink: null });
          }
          if (gk > 0) { const LB = lineBatch(); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, r0 = CH.hw * 1.5, r1 = r0 * (1 + (i % 2 ? .45 : .8) * gk); LB.add([[Math.cos(a) * r0, cy0 + Math.sin(a) * r0 * 1.05], [Math.cos(a) * r1, cy0 + Math.sin(a) * r1 * 1.05]], i % 2 ? 1.6 : 2.8); } LB.draw('#B8862A'); }
        }
        // (engraved, like everything in the cathedral; it turns card on its way down, in the cloud, and lands in her hand
        // card in C1c)
        if ((stage === 'hole' && dr <= 0) || (stage === 'funnel' && dr > 0)) sandwich(0, y, sz * sc, -.04 + .03 * Math.sin(lt * 5) + .7 * dr);
      }
    };
    // the slip in the tube: card in the train's night, engraved once it's through the cloud (the tube's seam, tubeSeam)
    const inTube = TP => { if (riseQ > 0 && riseQ < 1) { const [x, y, a] = pathAt(TP, riseE), up = y < tubeSeam(k), draw = () => { boilSeed('slipt'); for (let i = 0; i < 3; i++) dline([[x - 12 + i * 12, y + 36], [x - 12 + i * 12, y + 36 + 200 * Math.sin(riseQ * Math.PI)]], 2.4, up ? mixCol(BANK.paper, '#FFFFFF', .5) : '#F4F0E6', 0); slip(x, y, 50 * S, a + Math.PI / 2 + .12 * Math.sin(lt * 20)); }; if (up) { look('bank'); bankFigure(draw); } else { look('card'); draw(); } look('bank'); } };
    if (cy + H / 2 / z > TX.top - 60) trainSide(tt, l, { inWindow: (i, cx, gy) => windowFace(i, cx, gy, l, { ...T, up: lt > B.rise[0] - .05 }, k) });
    // (the engraving keeps its size on screen as the camera pushes in: its scale steps down with the zoom, in a few levels
    // so its lines don't swim)
    const zs = z * S, bsc = zs < 1.25 ? 1 : zs < 1.8 ? .72 : zs < 2.5 ? .52 : .4, sc0 = BANK.scale; BANK.scale = (sc0 ?? 1.5) * bsc;
    try { brainWorld(tt, lt, k, { upper: vTop < Bn.y + 1000 * S, grind, wake, hatch: ease(seg(lt, B.open[0], B.open[1])), slot: lt >= B.arrive ? Math.exp(-(lt - B.arrive) * 7) * Math.sin((lt - B.arrive) * 30) : 0, lamp: Math.max(lt >= B.arrive ? Math.exp(-(lt - B.arrive) * 3) : 0, dk), between, inTube }); } finally { BANK.scale = sc0; }
    camEnd();
    // the ride up: speed lines while it's fastest
    const spd = Math.sin(Math.PI * riseQ) * (riseQ > 0 && riseQ < 1 ? 1 : 0);
    if (spd > .2) { flushBrush(); push(); noStroke(); for (let i = 0; i < 26; i++) { const x = hash(i * 3.3) * W, y = (hash(i * 5.1) * 1.4 - .2) * H, L = (160 + 380 * hash(i * 7.7)) * spd; fill(250, 246, 232, 90 * spd); rect(x, y, 2 + 2 * hash(i), L); } pop(); }
  }
  function chorusB(t, lt, dur, k) {
    const T0 = t - lt, E = LY('Taking the piss', k), words = E ? E.words.map(w => w[0] - T0) : [.9, 1.3, 1.54];
    const T = { words, all: wt('All that intelligence', 0, k) - T0, intel: wt('All that intelligence', 2, k) - T0, and: wt('All that intelligence', 3, k) - T0 };
    const B = c1bBeats(T, dur);
    if (lt < B.out) c1bInside(t, lt, k, T, B);
    else c1bOutside(t, lt, dur, k, T, B);
  }

  SHOT.P1a = (t, lt, dur) => preA(t, lt, dur, 0);
  SHOT.P1b = (t, lt, dur) => preB(t, lt, dur, 0);
  SHOT.P2a = (t, lt, dur) => preA(t, lt, dur, 1);
  SHOT.P2b = (t, lt, dur) => preB(t, lt, dur, 1);
  SHOT.C1a = (t, lt, dur) => chorusA(t, lt, dur, 0);
  SHOT.C1b = (t, lt, dur) => chorusB(t, lt, dur, 0);
  SHOT.C1c = (t, lt, dur) => chorusC(t, lt, dur, 0);
  // The riso has no black drum: a figure's ground shadow (the rigs paint it as a wash of NOIR.ink) prints as a screen of
  // the blue drum with a little pink under it, as dark as the shadow is (verse 3's v3RisoShadows). It printed as a flat
  // near-black ellipse under her in C1d/C2d and under the bots in C1e/C2e. Only in the riso look.
  function chRisoShadows(draw) {
    const p0 = paint;
    paint = (P, o = {}) => {
      const pr = STYLE.mode === 'xerox' && XEROX.process, blue = pr && pr.find(d => d[0] === 'c'), pink = pr && pr.find(d => d[0] === 'm');
      if (!blue || o.wash !== NOIR.ink || o.ink !== null) return p0(P, o);
      const k = clamp((o.washOp ?? 255) / 150);
      halftone(P, .92 * k, blue[1], XEROX.cell, blue[2]); if (pink) halftone(P, .42 * k, pink[1], XEROX.cell, pink[2]);
    };
    try { draw(); } finally { paint = p0; }
  }
  SHOT.C1d = (t, lt, dur) => chRisoShadows(() => chorusD(t, lt, dur, 0));
  SHOT.C1e = (t, lt, dur) => chRisoShadows(() => chorusE(t, lt, dur, 0));
  SHOT.C1f = (t, lt, dur) => chorusF(t, lt, dur, 0);
  SHOT.C2a = (t, lt, dur) => chorusA2(t, lt, dur);
  SHOT.C2b = (t, lt, dur) => chorusB(t, lt, dur, 1);
  SHOT.C2c = (t, lt, dur) => chorusC(t, lt, dur, 1);
  SHOT.C2d = (t, lt, dur) => chRisoShadows(() => chorusD(t, lt, dur, 1));
  SHOT.C2e = (t, lt, dur) => chRisoShadows(() => chorusE(t, lt, dur, 1));
  SHOT.C2f = (t, lt, dur) => chorusF(t, lt, dur, 1);

  // THE BUNKER in banknote engraving (C1c, C2c): bunker.js's set and cast drawn in the bank look, the hall kept light (its
  // tone capped, sparser lines) so the diners and the vault door read, and cheap enough to render.
  // Engrave a layer at scale S (every line weight, spacing and wave length of the bank look × S), as one layer of the
  // note (BANK.cap: a capped layer prints light with finer, paler outlines), its colour set, outlines × ow: the banknote
  // scene's engraving scale (sets/banknote.js does the same for its vignette).
  function chEngrave(o, fn) {
    const S = o.S ?? 1, ow = o.ow ?? 1;
    const sv = { wl: waveLines, el: edgeLine, dl: dline, colour: BANK.colour, cap: BANK.cap, engS: BANK.engS };
    BANK.colour = o.colour ?? 1; BANK.cap = o.cap ?? 1; BANK.engS = S;   // (engS: the scale for style.js's figure geometry)
    waveLines = (P, d, a, amp, wl, c, w) => sv.wl(P, d * S, a, amp * S, wl * S, c, w * S);
    edgeLine = (P, sw = 1, c, closed, curv = 0) => sv.el(P, sw * S * ow, c, closed, curv);
    dline = (P, sw = 1, c = NOIR.ink, curv = 0) => sv.dl(P, sw * S, c, curv);
    try { fn(); } finally { waveLines = sv.wl; edgeLine = sv.el; dline = sv.dl; BANK.colour = sv.colour; BANK.cap = sv.cap; BANK.engS = sv.engS; }
  }
  // THE BUNKER in banknote engraving (C1c, C2c): bunker.js's set and cast in the bank look, at the banknote vignette's
  // engraving scale (S: 1.5 full frame; larger when it's seen small, so the lines keep their size on screen); the hall
  // printed light, the diners at full strength with heavier outlines.
  function bankBunker(t, lt, o = {}) {
    const S = o.S ?? 1.5;
    // (bank: the hall's engraved lines end in a vignette round each diner, tapering on a soft oval; o.halos: more
    // diners' ovals, [bkHaloOf(x, y, u, s), ...]; o.paper: draws the note's paper, so its underprint ends there too.
    // The banquet's figures are worked out once (bqPlan) and o.cast(plan) draws them with the same options, so each
    // vignette follows its diner's pose this frame: the lean back into a laugh, the staff hovering.)
    const plan = o.k != null && typeof bqPlan === 'function' ? bqPlan(t, lt, o.k) : null;
    bkHalos(o.k || 0, 1, o.halos || [], plan && { plan });
    if (o.paper) o.paper();
    chEngrave({ S, cap: .4, colour: .5 }, () => {
      if (o.lite) {   // seen small (through a window): the vault, the organ racks, the door and the chandelier only
        bkVault(t, undefined, bkView()); bkOrgan(t); bkDoor(t, lt); bkChandelier(t);
        if (o.k != null) bqBack(t, lt, o.k);   // (the banquet's size: its guests and chairs)
        else { const { left, right } = BUNKER.seats; bkChair(left[0], left[1], left[2], 1, 'bkchairL'); bkChair(right[0], right[1], right[2], -1, 'bkchairR'); }
      } else bunkerBack(t, lt, { k: o.k, cull: true });   // (cull: the hall's big pieces only where the camera looks)
    });
    bankVignetteEnd();   // (the cast, over bare paper)
    chEngrave({ S, cap: 1, ow: 1.3, colour: .55 }, () => { if (o.cast) o.cast(plan); else bkCast(t, lt); });
  }


  // ======================================================================================================
  // C1c / C2c: "(and we get) this? You get the bunker; I get the bill." The sandwich drops from a hatch in the carriage
  // ceiling into her hand: this. She looks out: the bunker is sliding past the window; the camera pushes in (the engraving
  // comes into focus); the toast clinks on "bunker"; the attentive staff serve; the vault's lamp, the flap, the bill feeds
  // out and swoops at the lens until it covers the frame; under it we're back in the carriage and it falls onto the table
  // in front of her: SLAP on "bill".
  const kf2 = (x, K) => { if (x <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (x <= K[i][0]) return lerp(K[i - 1][1], K[i][1], (x - K[i - 1][0]) / (K[i][0] - K[i - 1][0])); return K[K.length - 1][1]; };
  const HATCH = [556, 196];
  // the end of the brain's pneumatic tube: a brass pipe down from the ceiling to a delivery flap over the aisle
  function ceilingHatch(open) {
    boilSeed('chatch');
    piece(rect(HATCH[0] - 22, -200, HATCH[0] + 22, HATCH[1] - 30), '#B89040', { sw: 1.4, shade: '#7A5A20', depth: 8, key: 'chpipe', lift: 5 });
    for (const y of [20, 110]) piece(rect(HATCH[0] - 28, y, HATCH[0] + 28, y + 12), '#D8B860', { sw: 1, key: 'chring' + y, lift: 5 });
    piece(b2RoundPoly(rect(HATCH[0] - 46, HATCH[1] - 34, HATCH[0] + 46, HATCH[1] + 6), 10), '#C8A040', { sw: 1.6, shade: '#7A5A20', depth: 10, key: 'chmouth', lift: 5 });
    const f = open;   // the flap swings down
    piece([[HATCH[0] - 40, HATCH[1] + 4], [HATCH[0] + 40, HATCH[1] + 4], [HATCH[0] + 40, HATCH[1] + 4 + 44 * f], [HATCH[0] - 40, HATCH[1] + 4 + 40 * f]], f > .05 ? '#E0C060' : '#C8A040', { sw: 1.2, key: 'chflap', lift: 6 });
    if (f > .5 && f < .95) for (let i = 0; i < 5; i++) { const a = Math.PI * (.2 + .6 * i / 4); piece(oval(HATCH[0] + Math.cos(a) * 60 * f, HATCH[1] + 20 + Math.sin(a) * 30 * f, 10, 8, 0, 8), '#CFC6B1', { sw: .8, key: 'chpuff' + i, lift: 3 }); }
  }
  // the banquet's cast (bunker.js's acting for the toast), the bots as attentive, cheerful staff. It grows (the user):
  // the first pass is a table for two (BQ[0]); the second the long table, five bosses, more staff and a loft of guests
  // (BQ[1]); the finale's is the grand hall (final.js, BQ[2]).
  function banquet(blt, k, plan) { bqCast(blt, blt, k, { plan }); }   // (plan: bankBunker's, the one its halos were placed from)
  // the second pass: the slot keeps spitting bills after the first, a stream of them flying at the lens
  function billStream(blt, cam) {
    for (let i = 1; i <= 7; i++) {
      const p = bkBillPath(blt - i * .075, cam); if (!p.free) continue;
      boilSeed('bs' + i); push(); translate((hash(i * 3.3) - .5) * 160 * seg(blt, 3, 3.8), (hash(i * 5.1) - .5) * 90 * seg(blt, 3, 3.8)); bill(p.x, p.y, p.s, p.rot + (hash(i) - .5) * .5, 0, p.flap, 'bs' + i); pop();
    }
  }
  // the frame as a banknote: a guilloche border with corner rosettes (screen space), over the engraved bunker
  function noteBorder(k) {
    look('bank'); boilSeed('note border');
    if (typeof BNO !== 'undefined') { BNO.noteFrame(0, 0, W, H); return; }   // (the full frame: bankorn.js)
    const m = 26, g = '#A8843A', ink = BANK.ink;
    for (const [a, b] of [[[m, m], [W - m, m]], [[m, H - m], [W - m, H - m]]]) guillocheBand(a[0] + 40, b[0] - 40, a[1], 30, { n: 6, wl: 40, col: mixCol(ink, g, .5), w: .8 });
    for (const x of [m, W - m]) { const P = []; for (let y = m + 40; y <= H - m - 40; y += 5) P.push([x + 15 * Math.sin(y / 40 * TAU), y]); for (let i = 0; i < 6; i++) { const Q = P.map(([px, py]) => [x + 15 * Math.sin(py / 40 * TAU + i / 6 * TAU), py]); for (let j = 0; j < Q.length - 1; j += 24) _inkLine(Q.slice(j, j + 25), .8, mixCol(ink, '#52806A', .5), 'rotring', .3); } }
    for (const [x, y] of [[m, m], [W - m, m], [W - m, H - m], [m, H - m]]) { _paint(oval(x, y, 44, 44, 0, 30), { wash: BANK.paper, washOp: 255, ink: null }); guilloche(x, y, 14, 42, { n: 10, lobes: 12, w: .7, col: mixCol(ink, g, .4) }); }
    for (const e of [6, 46]) _inkLine([[e, e], [W - e, e], [W - e, H - e], [e, H - e], [e, e]], e > 10 ? .8 : 2, ink, 'rotring', 0);
  }
  function chorusC(t, lt, dur, k) {
    const T0 = t - lt, l = mt(lt), tt = mt(t);
    const T = { this: wt('All that intelligence', 6, k) - T0, you: wt('You get the bunker', 0, k) - T0, bunker: wt('You get the bunker', 3, k) - T0, bill: wt('You get the bunker', 7, k) - T0 };
    // (the pan to the window and the push into it are one continuous camera move, m0 → full, arriving on "bunker". The
    // close-up on the sandwich holds clean through "this?": the train starts to slow behind her as she says it, the
    // bunker slides into the window as the word ends, and she turns to it on "You" (look0), the camera following. Before,
    // the engraved banquet was sliding past behind her head through the whole of "this?" and she turned away 0.28 s after
    // the word: the sad sandwich and her deadpan had under half a second. Before that, the slide, a 0.06 s pan and the
    // push landed one on top of the other: three jumps in 0.7 s.)
    const B0 = T.bunker, look0 = T.you + .02, m0 = look0 - .05, full = B0 - .04, slow0 = T.this - .2, slide0 = T.this + .12, rel = B0 + 1.08, cover = B0 + 1.48, slap = Math.min(T.bill, dur - .03);
    // the bunker's own clock (its toast, lamp, flap, feed, release, swoop), mapped onto the lyric
    const blt = kf2(lt, [[look0, Math.max(.3, 1.28 - (B0 - look0))], [B0, 1.28], [B0 + .23, 1.51], [B0 + .33, 2.14], [B0 + .45, 2.3], [B0 + .53, 2.4], [B0 + .88, 2.79], [rel, 3.0], [rel + .15, 3.43], [cover, 4.12]]);
    const zW = W / CR.WW, W0 = crWin(0);
    const inBunker = lt >= full && lt < cover;
    if (inBunker) {   // full frame: the bunker in banknote engraving, its own camera
      look('bank');
      const c = bunkerCam(blt, k);
      camBegin(c.cx, c.cy, c.zoom);
      bankBunker(blt, blt, { cast: P => banquet(blt, k, P), k, paper: () => bankPaper(-200, -150, W + 400, H + 300, { d: 16 }) });
      if (k) billStream(blt, c);
      vaultSlot(blt, { cam: c });
      camEnd();
      noteBorder(k);
      return;
    }
    // the carriage: close on her (the sandwich), then a pan and a push into the window, or (after the cover) wide
    const after = lt >= cover, pan = ease(seg(lt, m0, m0 + .4)), pin = Math.pow(seg(lt, m0 + .15, full), 2);
    // the catch framed wide enough to see the ceiling hatch, then in close on her face and the sandwich she holds up: held
    // through "this?" (the brain's delivery lands here: a clear close shot of the sad little thing, and her deadpan)
    const cIn = ease(seg(lt, .2, T.this - .08));
    let cx = lerp(lerp(560, k ? 575 : 512, cIn), 900, pan), cy = lerp(lerp(450, k ? 600 : 530, cIn), 470, pan), z = lerp(lerp(1.45, k ? 2.05 : 2.45, cIn), 1.6, pan);   // (C2c: the two of them in the close shot)
    if (pin > 0) { cx = lerp(cx, W0.x + W0.w / 2, pin); cy = lerp(cy, W0.y + W0.h / 2, pin); z = Math.exp(lerp(Math.log(z), Math.log(zW * 1.01), pin)); }
    // (after the slap, a slow push in on her and the bill while she takes it in and turns her deadpan on us: the carriage
    // holds on it until the first copy lands on "Same" (C1d/C2d draw this shot until then); still, it was dead air)
    if (after) { const pq = ease(seg(lt, slap + .1, slap + 1.7)); cx = lerp(930, 800, pq); cy = lerp(575, 590, pq); z = lerp(1.28, 1.44, pq); }
    const sk = lt > slap && lt < slap + .3 ? shakeXY(t, 10 * (1 - seg(lt, slap, slap + .3))) : [0, 0];
    look('card');
    camBegin(cx + sk[0] / z, cy + sk[1] / z, z);
    const slideIn = ease(seg(lt, slide0, look0 + .12));   // the bunker slides past into the window as the train slows (~0.5 s: over 0.33 s its edge crossed the glass in about three frames and read as filling it at once)
    // (the night outside slows with the train and stops: its clock is the distance run, song time less the integral of
    // the slowing (speed 1 - slideIn; ease integrates to q^3 - q^4/2), continuous, so it slides on ones and stops dead.
    // As t * speed it ran backwards through tens of thousands of px as the speed fell: the houses whirled.)
    const sD = look0 + .05 - slow0, sq = seg(lt, slow0, look0 + .05), nightT = t - sD * (sq * sq * sq - sq * sq * sq * sq / 2) - Math.max(0, lt - (look0 + .05));
    carriage(tt, l, {
      nightT, boards: true, crowd: { level: k ? 2 : 1, skip: [], ...CREW_CROWD(k) },   // (as C1a/C2a: the same carriage, the boards showing home)
      sitters: () => sitters(tt, (k ? CREW2_SIT : CREW1_SIT)()),
      // (the bunker slides into her window from its left edge, clipped to that window's glass: it started a window's
      // width to the left, unclipped, so it showed whole in the next window along (bay -1's) for a few frames, then slid
      // across into hers as the camera panned: two changes in 0.3 s. Now the camera finds it in the one window.)
      pic: lt >= slide0 && !after ? (w => clipPoly(rect(w.x, w.y, w.x + w.w, w.y + w.h), () => {
        const sc = w.w / W, off = (1 - slideIn) * -(w.w + 60);   // (+60: the engraving's paper runs 56 px past its frame: without it that strip filled the window's first sliver on the slide's first frame)
        push(); translate(w.x + off, w.y); scale(sc);
        look('bank');
        const c = bunkerCam(blt, k), zs = sc * z;   // the engraving's scale on screen
        bankPaper(-100, -100, W + 200, H + 200, { d: 34 });
        const C0 = CAM;   // (the carriage's camera is still up: put it back after the window's own, so the puppets drawn after it are placed relative to it (nudge) and not re-nudged every frame of the pan)
        camBegin(c.cx, c.cy, c.zoom); bankBunker(blt, blt, { lite: true, S: 1.9 / Math.max(.2, zs * c.zoom), cast: P => banquet(blt, k, P), k }); camEnd();
        CAM = C0;
        look('card');
        pop();
      })) : null,
      cast: () => {
        for (const [i, side, name, task] of k ? CREW2 : CREW1) if (after || (!(i === 0 && side === -1) && task !== 'photo')) botTask(tt, l, i, side, name, task);   // (bay 0's left seat (Clawd's) left out of the close shots on her, and the Muse out of the push into the window; the wide after the bill has them)
        ceilingHatch(backOut(seg(lt, 0, .08)) * (1 - seg(lt, .5, .7)));
      },
    });
    // her at the pole: the sandwich lands in her free hand (a squash), she holds it up and looks at it, then out of the
    // window; when the bill lands she looks down at it
    // (after the slap: surprised, the mouth shut (she's silent until "Same"; an open mouth reads as singing), eyes down on
    // the bill; then she turns her deadpan on us)
    const tUp = slap + .5;
    const mood = emotions(l, [[0, 'bored', { emote: null }], [.08, 'surprised', { emote: null }], [T.this - .14, k ? 'suspicious' : 'bored', { emote: null, mouth: 'flat' }], [look0 + .1, 'suspicious', { emote: null }], [slap, 'surprised', { emote: null, mouth: 'flat' }], [tUp, 'bored', { emote: null, mouth: 'flat', eyes: 'narrow' }]], { take: .6 });   // (on "this?": deadpan; C2c: squinting at a sandwich that small)
    const tCatch = .36, catchK = l >= tCatch ? 1 : 0, sw_ = Math.sin(tt * 2.3) * .6;   // (her and the props on the puppets' twos, l and tt)
    const lk = l < .1 ? { lookX: .3, lookY: -.2 } : l < tCatch ? { lookX: .4, lookY: -1 } : l < look0 ? { lookX: .7, lookY: -.2 } : l < slap ? { lookX: .95, lookY: -.4 } : l < tUp ? { lookX: .8, lookY: .7 } : { lookX: -.28, lookY: .04 };
    // (held by its lower edge: the pack stands up out of her fist, its bottom edge in the hand (hand space: x runs out
    // along the fingers), so her fingers go behind it and her thumb lies across its front near that edge; the palm and
    // wrist show below it. The hand's pose is a fist (the fingers drawn before the prop; 'hold' draws them again over it,
    // which poked them up through the wrapper), and the smaller C2 pack sits in the same grip, not floating above it.)
    const hold = catchK > 0 ? (s0 => { const Wd = s0 * 4.4 * (k ? .3 : 1), wob = .2 * Math.exp(-(l - tCatch) * 8) * Math.sin((l - tCatch) * 30); push(); translate(-.05 * s0, 0); rotate(1.2 + wob); sandwich(0, s0 * .2 - Wd * .38, Wd, 0); pop(); }) : null;
    const up = ease(seg(l, tCatch + .06, T.this - .05)) * (1 - ease(seg(l, look0 + .1, look0 + .4)));
    grabPole();
    callButton(0, l < tCatch ? 1 : 0, 0, ease(seg(l, tCatch, tCatch + .12)));   // (her call, answered when the sandwich lands: it goes dark)
    // the near hand: on the pole; up to catch (an open palm under the hatch); the catch (a dip); up in front of her face to
    // look at it (held out past her nose: at her eye, the pack sat over her glasses)
    const reach = ease(seg(l, .1, .28)), dip = l >= tCatch ? Math.exp(-(l - tCatch) * 10) * Math.sin((l - tCatch) * 22) * .5 : 0;
    const R0 = [.3, -1.35, .4, 'fist', 1, -1.6], Rc = [2.6, -14.2 + dip, .3, catchK ? 'fist' : 'open', 1, -1.35, 'u'], Rf = [4.3, -13.9, .35, 'fist', 1, -1.1, 'u'];
    const mixR = (a, b, kk) => [lerp(a[0], b[0], kk), lerp(a[1], b[1], kk), lerp(a[2], b[2], kk), b[3], 1, lerp(a[5], b[5], kk), 'u'];
    const Rpole = [2.1, -15.5, .4, 'fist', 1, -1.6, 'u'];
    const Rnow = after ? Rf : l < .1 ? null : l < tCatch ? mixR(Rpole, Rc, reach) : mixR(Rc, Rf, up);
    person(POLE - 64, AISLE, 31, HER_C, { ...mood, ...lk, view: 'q', pose: { L: [-1.2, 2.6, .15, 'relax'], R: Rnow || R0 }, hold, rot: sw_ * .02, boilKey: 'crher', seed: 3 });
    if (k) {   // him, squeezed in beside her at the same pole, leaning in to look at the (tiny) sandwich, then out
      // (after the slap he stares at the pile, then looks round at her: silent, the mouth shut; his fist round the pole
      // held there as he leans in: himFrontGrip)
      const hm = emotions(l, [[0, 'bored', { emote: null }], [T.this - .2, 'confused', { emote: null }], [look0 + .15, 'suspicious', { emote: null }], [slap, 'surprised', { emote: null, mouth: 'flat' }], [tUp + .12, 'bored', { emote: null, mouth: 'frown' }]], { take: .6 });
      const rot = -.08 * up;
      person(HIM_AT[0], HIM_AT[1], 31, HIM_C, { ...hm, view: 'q', flip: true, lookX: l < look0 ? .9 : l < tUp + .12 ? -.3 : .9, lookY: l < slap ? .3 : l < tUp + .12 ? .8 : -.35, pose: { L: [-1.2, 2.5, .15, 'relax'], R: himFrontGrip(rot) }, rot, boilKey: 'crhim', seed: 6 });
    }
    if (!catchK && l > .06) { const q = seg(l, .08, tCatch); boilSeed('swfall'); sandwich(lerp(HATCH[0], 560, q), lerp(HATCH[1] + 30, 540, q * q), 97 * (k ? .3 : 1), .6 * Math.sin(q * 5)); }
    // the bill (card), falling from the lens onto the table (the second pass: a whole wad of them, and loose ones after)
    if (after) {
      // (from the size that just covers the frame, falling away at once: a cubic start from further in held flat white
      // for ~0.15 s between the swoop at the lens and the carriage, two jumps)
      // (it lands flat on the table top, seen from a little above: it tips from facing us to lying down as it falls,
      // foreshortened to FS of its height, its near edge on the table's top edge and squared up to it (turned further, a corner dipped in front of the table), and bounces once. It stood up on its
      // edge like a propped menu; before that, it hung half off the table's front in mid-air.)
      const FS = .26, BX = 975, restY = hgt => CR.TY - hgt * FS / 2;   // (a sheet hgt px tall lying on bay 0's table: its centre)
      const flatBill = (x, y, s, rot, fs, flap, key) => { push(); translate(x, y); scale(1, fs); bill(0, 0, s, rot, 0, flap, key); pop(); };
      const q = seg(lt, cover, slap), e = q * q, bs = Math.exp(lerp(Math.log(2000 / 1.28), Math.log(150), e)), tip = easeIn(seg(q, .35, 1));
      const bounce = t0 => 16 * Math.sin(Math.PI * seg(lt, t0, t0 + .16)) + 4 * Math.sin(Math.PI * seg(lt, t0 + .16, t0 + .25));
      const fsOf = (tp, t0) => lerp(1, FS, tp) + .07 * Math.sin(Math.PI * seg(lt, t0, t0 + .16));   // (the sheet lifts off the table a little on its hop)
      const bx = lerp(930, BX, e), by = lerp(575, restY(195), e) - bounce(slap), fs = fsOf(tip, slap);
      if (k) {
        // the wad: a stack of sheets, a little splayed as it hits; then the loose ones settle flat on it and round it
        const hit = lt >= slap, sp = seg(lt, slap, slap + .08);
        for (let j = 0; j < 12; j++) { boilSeed('wad' + j); const dx = hit ? (hash(j * 1.7) - .5) * 70 * easeOut(sp) : 0, dy = -j * lerp(bs / 150 * 3, 2.2, tip) - (hit ? 10 * Math.sin(sp * Math.PI) * hash(j) : 0); flatBill(bx + dx, by + dy, bs, lerp(0, -.07, e) + (hit ? (hash(j * 2.3) - .5) * .5 * sp : (hash(j) - .5) * .06), fs, 0, 'wad' + j); }
        for (let i = 0; i < 7; i++) {
          const t1 = slap + .05 + .03 * i, q2 = seg(lt, cover + .04 * i, t1), e2 = ease(q2); if (q2 <= 0) continue;
          boilSeed('lb' + i); const lx = 700 + hash(i * 1.9) * 600, tp = ease(seg(q2, .3, 1));
          flatBill(lerp(lx, 925 + hash(i * 2) * 100, e2) + 30 * Math.sin(lt * 9 + i) * (1 - e2), lerp(120, restY(195) - 26 - 2 * i, e2) - .4 * bounce(t1), 150, (hash(i * 3) - .5) * .5 + 1.5 * (1 - e2) * Math.sin(lt * 7 + i), fsOf(tp, t1), Math.sin(lt * 25 + i) * (1 - e2), 'lb' + i);
        }
      } else { boilSeed('cbill'); flatBill(bx, by, bs, lerp(0, -.07, e), fs, (1 - q) * Math.sin(lt * 30) * .5, 'cbill'); }
      if (lt > slap && lt < slap + .25) for (let i = 0; i < 5; i++) { const a = -Math.PI * (.12 + i * .19), q2 = seg(lt, slap, slap + .25); dline([[BX + Math.cos(a) * 100, CR.TY - 8 + Math.sin(a) * 36], [BX + Math.cos(a) * (140 + 60 * q2), CR.TY - 8 + Math.sin(a) * (56 + 26 * q2)]], 3, '#F2ECE0', 0); }
    }
    camEnd();
  }

  // ======================================================================================================
  // C1d / C2d: "Same shit, faster. What a fucking thrill." Her commute, printed: each copy slaps down on the output tray
  // (the first one on the cut, on the bill's slap) with the whole commute running inside it (in from the left, onto the
  // train, the doors, gone), and each copy is a generation worse and faster than the last, until it's a smear.
  // TS: the train drawn larger about the doorway's foot (the car's proportions kept), so its door and roof clear her bun
  // with headroom as she steps in (at 1 she was taller than the whole carriage: her bun stuck up over its roof onto the
  // wall above). Rowan and the boarding crowd fit it too. (The station clock moves left a little, clear of the car's end.)
  const CD = { floor: 830, door: 1300, top: 190, TS: 1.22 };
  const cdTrain = sx => { translate(sx + CD.door, CD.floor); scale(CD.TS); translate(-CD.door, -CD.floor); };
  function commuteScene(s, who, g) {
    // the platform: a tiled wall with a blue band, a station clock whose hands whirl, the yellow line; the train at right:
    // she walks in along the platform, the doors open, she steps in, they shut, the train pulls out
    const sx = s < .72 ? 0 : 1700 * easeIn((s - .72) / .28);
    boilSeed('cm wall');
    piece(rect(-60, -60, W + 60, CD.floor), '#E8DCC0', { ink: null, key: 'cmwall', lift: 0 });
    piece(rect(-60, 120, W + 60, 170), '#2F5E8C', { ink: null, key: 'cmband', lift: 0 });
    for (let x = -40; x < W; x += 120) dline([[x, -60], [x, CD.floor]], .8, '#B8AC90');
    for (let y = 60; y < CD.floor; y += 90) dline([[-60, y], [W + 60, y]], .8, '#B8AC90');
    piece(rect(-60, CD.floor, W + 60, H + 60), '#6A625A', { ink: null, key: 'cmfloor', lift: 0 });
    piece(rect(-60, CD.floor + 44, W + 60, CD.floor + 64), '#F2C230', { ink: null, key: 'cmline', lift: 0 });
    boilSeed('cm clock');
    const [cx, cy] = [290, 330];
    dline([[cx, 170], [cx, cy - 86]], 4, '#2A2632');
    piece(oval(cx, cy, 86, 86, 0, 30), '#F4F0E4', { sw: 2.4, key: 'cmclock', lift: 3 });
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; dline([[cx + Math.cos(a) * 66, cy + Math.sin(a) * 66], [cx + Math.cos(a) * 78, cy + Math.sin(a) * 78]], 2.4, '#2A2632'); }
    const ha = -Math.PI / 2 + s * TAU, ma = -Math.PI / 2 + s * TAU * 12;
    dline([[cx, cy], [cx + Math.cos(ha) * 42, cy + Math.sin(ha) * 42]], 6, '#2A2632'); dline([[cx, cy], [cx + Math.cos(ma) * 64, cy + Math.sin(ma) * 64]], 3.4, '#2A2632');
    crowdCommute(s, 'wall', CD);   // the rush hour (demo/cast/crowd.js): the next train's crowd along the wall, behind the train
    const dOpen = s < .5 ? ease(seg(s, .02, .16)) : 1 - ease(seg(s, .6, .7)), dw = 130;
    const walkX = lerp(420, CD.door, clamp(s / .6)), inside = s >= .6;
    const walker = (behind) => { if (s >= .68) return; if (behind !== inside) return; who.forEach((P, i) => person(walkX - i * 170 + (inside ? 20 * seg(s, .6, .66) : 0), CD.floor + 36 - (inside ? 24 * seg(s, .6, .66) : 0), 32, P, { ...feel('bored', s * 4), emote: null, view: 'q', walk: s * 6, boilKey: 'cmw' + i })); };
    push(); cdTrain(sx);
    boilSeed('cm train');
    piece(rect(CD.door - dw, CD.top + 90, CD.door + dw, CD.floor + 10), '#2A2228', { ink: null, key: 'cmin', lift: 0 });
    pop();
    crowdCommute(s, 'in', CD);   // the ones boarding ahead of her
    walker(true);
    push(); cdTrain(sx);
    // the door pockets beside the opening, car body, behind the leaves (the leaves slide over them: with nothing there, a
    // strip of the station wall showed through the car beside each leaf as the doors shut)
    // (the cream stripe is on the body, the pockets and the leaves, not across the open doorway: drawn along the whole
    // car over everything, it crossed the doorway and the people boarding in it)
    const stripe = (x0, x1, key) => piece(rect(x0, CD.top + 400, x1, CD.top + 420), '#F2ECE0', { ink: null, key, lift: 1 });
    for (const d of [-1, 1]) { const [a, b] = d < 0 ? [CD.door - 2 * dw - 2, CD.door - dw] : [CD.door + dw, CD.door + 2 * dw + 2]; piece(rect(a, CD.top + 90, b, CD.floor + 10), '#C83A40', { ink: null, key: 'cmpocket' + d, lift: 0 }); stripe(a, b, 'cmstripep' + d); }
    for (const d of [-1, 1]) { const x0 = d < 0 ? CD.door - dw - dw * dOpen : CD.door + dw * dOpen; piece(rect(x0, CD.top + 90, x0 + dw, CD.floor), '#C83A40', { sw: 1.8, key: 'cmdoor' + d, lift: 3 }); piece(rect(x0 + 24, CD.top + 140, x0 + dw - 24, CD.top + 330), '#F2DFA8', { sw: 1.2, key: 'cmdw' + d, lift: 1 }); stripe(x0, x0 + dw, 'cmstriped' + d); }
    piece(rect(CD.door - 700, CD.top + 60, CD.door - 2 * dw, CD.floor + 10), '#C83A40', { sw: 2, key: 'cmcarL', lift: 4 });
    piece(rect(CD.door + 2 * dw, CD.top + 60, CD.door + 1500, CD.floor + 10), '#C83A40', { sw: 2, key: 'cmcarR', lift: 4 });
    for (const x of [CD.door - 640, CD.door - 440, CD.door + 330, CD.door + 560]) piece(rect(x, CD.top + 140, x + 170, CD.top + 330), '#F2DFA8', { sw: 1.4, key: 'cmwin' + x, lift: 2 });
    crowdCommute(s, 'win', CD, { windows: [CD.door - 640, CD.door - 440, CD.door + 330, CD.door + 560].map(x => [x, CD.top + 140, x + 170, CD.top + 330]) });   // standing room only
    piece(rect(CD.door - 700, CD.top + 30, CD.door + 1500, CD.top + 90), '#8A2432', { sw: 1.6, key: 'cmroof', lift: 3 });
    stripe(CD.door - 700, CD.door - 2 * dw, 'cmstripe'); stripe(CD.door + 2 * dw, CD.door + 1500, 'cmstriper');
    piece(b2RoundPoly(rect(CD.door - 730, CD.top + 30, CD.door - 690, CD.floor + 10), 14), '#8A2432', { sw: 1.6, key: 'cmend', lift: 4 });   // (a rounded end, not curvy(): a spline through a thin rect's corners overshot into a spike above the roof)
    pop();
    crowdCommute(s, 'out', CD);   // the platform: walking in with her, the ones who miss it
    walker(false);
  }
  // one printed copy: generation g, its commute at phase s, laid on the tray (dx, dy, rot), then the copier's dirt
  function copySheet(s, g, who, o = {}) {
    cpGeneration(g);
    push(); translate(960 + (o.dx || 0), 540 + (o.dy || 0)); rotate(o.rot || 0); scale(o.sc ?? .9); translate(-960, -540);
    boilSeed('cs paper'); _paint(rect(-30, -30, W + 30, H + 30), { wash: XEROX.paper, washOp: 255, ink: null });
    push(); translate(960, 540); scale(.94); translate(-960, -540); clipPoly(rect(0, 0, W, H), () => commuteScene(s, who, g)); pop();   // (the printed frame: the train runs on to x 2800, the floor below it)
    pop();
  }
  // the copies' landing times from the first (t0, on "Same") to the shot's end: intervals .6 × .76^i, never under .135
  // (3/4 of the old peak), the most copies that fit, stretched a touch to end exactly at the shot's end. [land_0, ..., end]
  function CD_RAMP(t0, end) {
    const r = i => Math.max(.135, .6 * Math.pow(.76, i)), T = end - t0;
    let N = 1, sum = r(0); while (sum + r(N) <= T) { sum += r(N); N++; }
    const c = T / sum, G = [t0]; for (let i = 0; i < N; i++) G.push(G[i] + r(i) * c);
    return G;
  }
  function chorusD(t, lt, dur, k) {
    const T0 = t - lt, tt = t;
    const w = i => wt('Same shit', i, k) - T0;
    // (the carriage holds on the slapped bill until "Same", and the first copy we see slaps onto the tray on it: cut on
    // the slap, the table was on screen for ~0.15 s between the bill's fall and the first riso copy, a double jump)
    if (lt < w(0)) { drawShot(k ? 'C2c' : 'C1c', t); return; }
    // the copies: the first slaps down on "Same" (the cut), then a smooth ramp, slow to start and speeding up harder,
    // up to a copy every ~.14 s and holding there to the end of the shot (the user: start slower, grow faster, top out
    // at about 3/4 of the old peak; it was a copy on each word from the start, up to one every .1 s). Each copy runs the
    // whole commute over its interval. The copy index maps onto the generations as before (the first at 2, the first
    // two under it on the tray; the last as worn as the old last, 11), so the smear at the end is the same.
    const G = CD_RAMP(w(0), dur), N = G.length - 1;
    let n = 0; while (n + 1 < N && lt >= G[n + 1]) n++;
    const g = N > 1 ? Math.round(2 + 9 * n / (N - 1)) : 2;
    const s = seg(lt, G[n], G[n + 1]), land = seg(lt, G[n], G[n] + Math.min(.07, (G[n + 1] - G[n]) * .3));
    const who = k ? [HER_C, HIM_C] : [HER_C];
    look('xerox');
    boilSeed('cd tray'); _paint(rect(-60, -60, W + 60, H + 60), { wash: '#2A2630', washOp: 255, ink: null });
    // the stack under the new copy: paper edges
    for (let j = Math.max(0, g - 5); j < g; j++) { push(); translate(960 + (hash(j * 3.3) - .5) * 40, 540 + (hash(j * 5.1) - .5) * 30); rotate((hash(j * 7.7) - .5) * .06); _paint(rect(-880, -500, 880, 500), { wash: mixCol('#E9E7E1', '#A39F95', .05 * j), washOp: 255, ink: null }); pop(); }
    const rot = (hash(g * 7.7) - .5) * .06 * (1 - land) + (hash(g * 7.7) - .5) * .02, sc = .9 + .05 * (1 - easeOut(land));
    if (!k) copySheet(s, g, who, { rot, sc, dx: (hash(g * 3.3) - .5) * 30, dy: -60 * (1 - easeOut(land)) });
    else {   // both commutes, side by side: two copies per generation, his a half-beat behind hers
      copySheet(s, g, [HER_C], { rot: rot - .02, sc: sc * .52, dx: -470 + (hash(g * 3.3) - .5) * 20, dy: -60 * (1 - easeOut(land)) });
      const s2 = frac(s + .5), land2 = seg(lt, G[n] + .1, G[n] + .18);
      copySheet(s2, g, [HIM_C], { rot: rot + .03, sc: sc * .52, dx: 470 + (hash(g * 5.3) - .5) * 20, dy: -60 * (1 - easeOut(land2)) });
    }
    cpDirt(g);
    xeroxGrit(t, 1 + g * .15);
    Object.assign(XEROX, CP_X0);
  }

  // ======================================================================================================
  // C1e / C2e: "(What a thrill!) Your bots escaped the sandbox;" A spade of sand wipes the frame: a kids' sandbox (the
  // box room's floor, to the inch), the bots busy in it; each gets a task (a pictogram pops over it) and climbs out over
  // the edge, hurrying off to do it. She's left in the box. (C2e: a vast, overextended sandcastle for a requester.)
  const SB = { k: PR_BOX.K, x0: PR_BOX.x0, x1: PR_BOX.x1, plank: 46 };
  const sbP = (x, h, kk) => prbP(x, h, kk);
  function sandbox(t, o = {}) {
    const { x0, x1, k: K } = SB, h = o.wall ?? SB.plank;
    boilSeed('sb ground');
    // (o.wide: the night and the grass run on past the frame, for C2e's pull-back to .8: the set's edge and the page
    // under it showed along the bottom from its first frame and down both sides by its end)
    const e = o.wide ? 1400 : 60, gy = x => 560 - 20 * (x + 60) / (W + 120);
    piece(rect(-e, -e, W + e, H + e), '#23305A', { ink: null, key: 'sbnight', lift: 0 });
    piece([[-e, gy(-e)], [W + e, gy(W + e)], [W + e, H + e], [-e, H + e]], '#3A6A4A', { ink: null, key: 'sbgrass', lift: 0 });
    // a lamp post and a swing frame behind
    // (the post in the blue drum: crushed, it printed solid near-black, and riso has no black drum)
    piece(rect(250, 150, 266, 600), '#1A2040', { ink: null, key: 'sblamp', lift: 0, spot: { channel: 'c', tone: .95 } }); piece(oval(258, 150, 30, 20, 0, 14), '#FFE060', { sw: 1.2, key: 'sbbulb', lift: 0 });
    dline([[1500, 600], [1600, 260], [1700, 600]], 5, '#1A2040'); dline([[1560, 262], [1760, 262]], 5, '#1A2040'); dline([[1640, 262], [1640, 470]], 1.5, '#1A2040'); dline([[1680, 262], [1680, 470]], 1.5, '#1A2040'); piece(rect(1628, 468, 1692, 480), '#C04A3A', { sw: 1, key: 'sbswing', lift: 0 });
    // the box: sand floor, the back plank and the side planks (low walls), then (o.front) the front plank
    boilSeed('sb box');
    piece([sbP(x0, 0, 1), sbP(x1, 0, 1), sbP(x1, 0, K), sbP(x0, 0, K)], '#F2D27A', { ink: null, key: 'sbsand', lift: 0 });
    for (let i = 0; i < 40; i++) { const u = hash(i * 1.7), v = hash(i * 2.9), kk = lerp(1, K, v), p = sbP(lerp(x0, x1, u), 0, kk); piece(oval(p[0], p[1], 5, 3, 0, 8), '#D8B460', { ink: null, key: 'sbg' + i, lift: 0 }); }
    for (const xa of [x0, x1]) piece([sbP(xa, 0, 1), sbP(xa, h, 1), sbP(xa, h, K), sbP(xa, 0, K)], '#B07A4A', { sw: 1.6, key: 'sbside' + xa, lift: 0 });
    piece([sbP(x0, 0, 1), sbP(x0, h, 1), sbP(x1, h, 1), sbP(x1, 0, 1)], '#C08A58', { sw: 1.6, key: 'sbback', lift: 0 });
  }
  function sandboxFront(o = {}) {
    const { x0, x1, k: K } = SB, h = SB.plank;
    boilSeed('sb front');
    piece([sbP(x0, 0, K), sbP(x0, h, K), sbP(x1, h, K), sbP(x1, 0, K)], '#A8703E', { sw: 1.8, key: 'sbfront', lift: 0 });
    for (const xx of [x0 + 60, (x0 + x1) / 2, x1 - 60]) { const p = sbP(xx, h * .5, K); piece(oval(p[0], p[1], 5, 5, 0, 8), '#6A4A2A', { ink: null, key: 'sbnail' + xx, lift: 0 }); }
  }
  // a task bubble: a speech-bubble card with a pictogram (cup, parcel, house, envelope, spanner)
  function taskBubble(x, y, kind, pp) {
    if (pp <= 0) return;
    const k = backOut(clamp(pp)) * 1.35; push(); translate(x, y); scale(k);
    piece(curvy([[-34, -30], [34, -30], [38, 20], [8, 22], [0, 40], [-6, 22], [-38, 20]], 3), '#FFFFFF', { sw: 1.6, key: 'tb' + kind + x, lift: 3 });
    const c = '#2A3A8A';
    if (kind === 0) { piece(rect(-15, -8, 7, 16), '#E8604A', { ink: null, key: 'tbi0' + x }); dline([[7, -3], [15, -3], [16, 6], [7, 9]], 2.4, c, .6); for (const sx of [-10, -2]) dline([[sx, -12], [sx + 3, -17], [sx, -22], [sx + 3, -27]], 1.6, c, .6); }   // (a mug: a loop handle and steam; the chevron handle read as a play button)
    else if (kind === 1) { piece(rect(-16, -16, 16, 12), '#C8904A', { ink: null, key: 'tbi1' + x }); dline([[-16, -2], [16, -2]], 2, c); dline([[0, -16], [0, 12]], 2, c); }
    else if (kind === 2) { piece([[-16, 12], [-16, -4], [0, -18], [16, -4], [16, 12]], '#4A8ADA', { ink: null, key: 'tbi2' + x }); }
    else if (kind === 3) { piece(rect(-18, -12, 18, 12), '#F4E0A0', { ink: null, key: 'tbi3' + x }); dline([[-18, -12], [0, 2], [18, -12]], 2, c); }
    else { dline([[-14, 12], [10, -12]], 5, c); piece(oval(12, -14, 8, 8, 0, 10), c, { ink: null, key: 'tbi4' + x }); }
    pop();
  }
  // the crew: [bot, start (x, depth k), exit direction [dx, dy], task pictogram]
  // (Clawd hops out over the front-left level, not downhill: it went off under the subtitle banner)
  const SAND1 = [['copilot', 600, 1.3, [-1, -.15], 0], ['grok', 1010, 1.1, [.25, -1], 1], ['gemini', 790, 1.12, [-.3, -1], 3], ['clawd', 720, 1.52, [-1, 0], 2], ['term', 1170, 1.26, [1, -.2], 4]];
  // how far each runs once it's over the plank (px, along its exit direction): far enough to be clear of the frame (the
  // top is ~450 px up from the box at the camera's zoom here), all of them gone by esc + 1.1 s, ~0.4 s before the walls
  // shoot up. (At 700 / 380 the ones heading up, Grok and the Gemini twins, stopped with their legs hanging in at the top.)
  const SB_RUN = [1000, 900];
  // a spade (hand space), for the diggers
  const spade = (i) => s0 => { push(); rotate(.8); piece(rect(-.1 * s0, -2.2 * s0, .1 * s0, 0), '#8A5A34', { sw: 1, key: 'spade' + i }); piece([[-.5 * s0, -2.2 * s0], [.5 * s0, -2.2 * s0], [.3 * s0, -3.2 * s0], [-.3 * s0, -3.2 * s0]], '#E0602E', { sw: 1, key: 'spb' + i }); pop(); };
  function sandBot(name, i, x, y, f, lt, l, tt, T, o = {}) {
    // (setting off: eager and focused, level brows and a small smile, with 'determined''s lean: its V-brows and flat mouth
    // read as cross, and the bots are never menacing)
    const mood = lt < T.task ? feel('happy', l + i) : emotions(l, [[0, 'happy'], [T.task, 'idea'], [T.go, 'determined', { eyes: 'normal', mouth: 'smile' }]], { take: .8 });
    const opt = { ...mood, emote: null, boilKey: 'sb' + name + i, seed: i * 2, view: 'q', flip: f < 0, ...o };
    if (!o.walk && !o.pose) { opt.pose = name === 'grok' ? 'serve' : name === 'gemini' ? 'cheer' : name === 'clawd' ? 'down' : { L: [-1.9, -2.2, .2, 'relax'], R: [2.0, -2.6 + 1.2 * Math.abs(Math.sin(bpOf(tt) * Math.PI + i)), .2, 'hold', 1] }; if (name === 'copilot' || name === 'term') opt.hold = spade(i); }
    BOTS[name](x, y, f, opt);
  }
  function chorusE(t, lt, dur, k) {
    if (k) return chorusE2(t, lt, dur);
    const T0 = t - lt, l = mt(lt), tt = mt(t);
    const T = { your: wt('Your bots', 0, k) - T0, bots: wt('Your bots', 1, k) - T0, esc: wt('Your bots', 2, k) - T0, sand: wt('Your bots', 4, k) - T0 };
    look('xerox'); cpGeneration(3);
    const z = 1.12 + .04 * lt;
    camBegin(960, 690, z);
    sandbox(tt, { wide: true });   // (the ground run on past the frame: the view reaches y 1170, the grass stopped at 1140 and the page showed under it)
    // the bots: digging on the beat; on "Your bots" a task pops over each (one after another); on "escaped" they climb
    // the planks and hurry off to do it, each its own way
    SAND1.forEach(([name, x0, kk, dir, task], i) => {
      const tTask = T.your + i * .12, tGo = T.esc - .1 + i * .1, go = seg(lt, tGo, tGo + .8), p = sbP(x0, 0, kk);
      const climb = seg(go, 0, .3), hop = Math.sin(clamp(climb) * Math.PI) * 50, run = seg(go, .3, 1);
      const x = p[0] + dir[0] * (climb * 140 + run * SB_RUN[0]), y = p[1] + dir[1] * (climb * 70 + run * SB_RUN[1]) - hop - SB.plank * .8 * climb;
      boilSeed('sbb' + i);
      if (x > -300 && x < W + 300 && y > -200 && y < H + 300) {
        sandBot(name, i, x, y, dir[0] >= 0 ? 1 : -1, lt, l, tt, { task: tTask, go: tGo }, go > 0 ? { walk: go * 6, noShadow: go > .3 } : {});
        taskBubble(x + 10, y - (name === 'gemini' ? 190 : name === 'clawd' ? 190 : 250), task, seg(lt, tTask, tTask + .25) * (1 - seg(go, .7, 1)));
      }
    });
    // her, sitting in the sand at the front, hugging her knees: she watches them go, one by one
    const hp = sbP(1250, 0, 1.6), hm = emotions(l, [[0, 'bored', { emote: null }], [T.esc + .3, 'sad', { emote: null }]], { take: .5 });
    const watch = lt < T.esc ? -.6 : lerp(-.8, .8, .5 + .5 * Math.sin((lt - T.esc) * 3));
    person(hp[0], hp[1] + 10, 36, HER_C, { ...hm, view: 'front', seated: true, seatH: .9, pose: 'lap', lookX: watch, lookY: -.3, boilKey: 'sbher' });
    sandboxFront();
    camEnd();
    // in: a spade of sand flung across the frame (over the last copy of the commute)
    if (lt < .45) { chCover(() => drawShot('C1d', T0 - .01), lt); sandWipe(t, lt); }
    xeroxGrit(t, 1.2);
    Object.assign(XEROX, CP_X0);
  }
  // C2e: the task has overextended: a vast sandcastle, built earnestly for a requester (a white-gloved hand from the corner
  // with the plan: a castle pictogram with a tick); towers go up a bucket a beat and spill out over the planks; the two of
  // them, sitting in the front corner, are walled in by it.
  function sandTower(x, y, w, h, flag, key) {
    if (h < 4) return;
    piece(rect(x - w / 2, y - h, x + w / 2, y), '#E8C070', { sw: 1.6, key: key + 't', lift: 0 });
    for (let j = 0; j < 4; j++) piece(rect(x - w / 2 + j * w / 3.5, y - h - 18, x - w / 2 + j * w / 3.5 + w / 7, y - h), '#E8C070', { sw: 1.2, key: key + 'c' + j, lift: 0 });
    for (let j = 1; j * 38 < h - 20; j++) dline([[x - w / 2 + 4, y - j * 38], [x + w / 2 - 4, y - j * 38 + 2]], 1, '#B08A40');
    piece(bkArch(x, y, w * .18, w * .3).concat([[x + w * .18, y], [x - w * .18, y]]), '#3A2A5A', { ink: null, key: key + 'd', lift: 0 });
    if (flag && h > 60) { dline([[x, y - h - 18], [x, y - h - 80]], 2, '#3A2A5A'); piece([[x, y - h - 80], [x + 40, y - h - 70], [x, y - h - 58]], '#E0508A', { sw: 1, key: key + 'f', lift: 0 }); }
  }
  // (Codey's tower (the fourth) stands at the left, behind the short fifth: at 1220 it rose right behind her
  // bun, its top hidden by it, so Codey read as standing on her head)
  const CASTLE = [[700, 1.2, 90, 1], [860, 1.05, 110, 1], [1040, 1.1, 130, 1], [540, 1.25, 96, 1], [560, 1.45, 80, 0], [1380, 1.5, 86, 1], [960, 1.3, 150, 1], [420, 1.6, 70, 0], [1500, 1.62, 74, 0]];
  function chorusE2(t, lt, dur) {
    const k = 1, T0 = t - lt, l = mt(lt), tt = mt(t);
    const T = { your: wt('Your bots', 0, k) - T0, bots: wt('Your bots', 1, k) - T0, esc: wt('Your bots', 2, k) - T0, sand: wt('Your bots', 4, k) - T0 };
    const zk = ease(seg(lt, .4, dur)), z = lerp(1.15, .8, zk), bp = bpOf(t) - bpOf(T0);
    look('xerox'); cpGeneration(3);
    camBegin(960, lerp(720, 560, zk), z);
    sandbox(tt, { wide: true });
    // the towers: a bucket a beat each, the later ones out beyond the planks
    CASTLE.forEach(([x, kk, w, flag], i) => {
      const p = sbP(x, 0, kk), grow = clamp((Math.floor(bp * 1.5) - i * .9) / 5), h = 380 * (kk > 1.4 ? .6 : 1) * grow;
      // (the ones built out past the planks (the project spilling out of its box) sit on a heap of sand spilled out onto
      // the grass, so they read as built there on purpose, not floating)
      boilSeed('tw' + i);
      if ((x < SB.x0 || x > SB.x1) && h >= 4) piece(curvy([[p[0] - w * kk * .95, p[1] + 6], [p[0] - w * kk * .6, p[1] - 12 * kk], [p[0], p[1] - 16 * kk], [p[0] + w * kk * .6, p[1] - 12 * kk], [p[0] + w * kk * .95, p[1] + 6], [p[0], p[1] + 14 * kk]], 4), '#E0B864', { sw: 1.3, key: 'twheap' + i, lift: 0 });
      sandTower(p[0], p[1], w * kk, h, flag, 'tw' + i);
      // a bot on top of each tall tower, upending a bucket on the beat
      if (i < 4 && h > 80) { const nm = ['copilot', 'grok', 'gemini', 'term'][i], pul = pulse(t, 5); boilSeed('twb' + i); sandBot(nm, i, p[0], p[1] - h - 18, i % 2 ? -1 : 1, lt, l, tt, { task: T.your, go: 99 }, { pose: nm === 'gemini' ? 'cheer' : { L: [-1.9, -2.2, .2, 'relax'], R: [1.6, -4.5 - .6 * pul, .2, 'hold', 1] }, hold: nm === 'gemini' ? null : (s0 => { piece([[-.6 * s0, 0], [.6 * s0, 0], [.45 * s0, 1.1 * s0], [-.45 * s0, 1.1 * s0]], '#3A8ADA', { sw: 1, key: 'bucket' + i }); }), noShadow: true }); }
    });
    // walls between the towers: rising around the front corner where the two of them sit
    const wallH = 260 * ease(seg(lt, T.esc, dur + .1));
    boilSeed('cw'); const cw = sbP(1150, 0, 1.45);
    // the two of them in the front corner
    const hm = emotions(l, [[0, 'bored', { emote: null }], [T.esc, 'surprised', { emote: null }], [T.sand, 'sad', { emote: null }]], { take: .5 });
    const hm2 = emotions(l, [[0, 'bored', { emote: null }], [T.esc + .08, 'surprised', { emote: null, mouth: 'flat' }], [T.sand + .1, 'sad', { emote: null }]], { take: .5 });   // (him: silent, his mouth shut; a beat behind her)
    const hp = sbP(1150, 0, 1.62), hp2 = sbP(1290, 0, 1.6);
    person(hp[0], hp[1] + 10, 34, HER_C, { ...hm, view: 'front', seated: true, seatH: .9, pose: 'lap', lookX: -.5, lookY: -.6, boilKey: 'sbher' });
    person(hp2[0], hp2[1] + 10, 34, HIM_C, { ...hm2, view: 'front', seated: true, seatH: .9, pose: 'lap', lookX: -.6, lookY: -.6, boilKey: 'sbhim' });
    // (the wall ends cleanly just inside the box's right plank, a merlon on its end: it ran on 170 px past the plank,
    // hanging off the box. The merlons are laid from that end.)
    if (wallH > 4) {
      const xl = cw[0] - 60, xr = prbX(SB.x1, 1.45) - 10;
      piece(rect(xl, cw[1] - wallH, xr, cw[1]), '#E8C070', { sw: 1.6, key: 'cwall', lift: 0 });
      for (let j = 0; xr - 30 - j * 62 >= xl - 1; j++) piece(rect(xr - 30 - j * 62, cw[1] - wallH - 18, xr - j * 62, cw[1] - wallH), '#E8C070', { sw: 1.2, key: 'cwc' + j, lift: 0 });
    }
    sandboxFront();
    // the requester: a white-gloved hand from the top-right, holding the plan (a castle, a tick), pointing on the beat
    const hin = ease(seg(lt, .2, .7));
    if (hin > 0) {
      const hx = lerp(2200, 1640, hin), hy = lerp(-300, 380, hin) + 10 * pulse(t, 6);
      boilSeed('req');
      // (the plan first, then the whole arm over it: with the sleeve under the plan and the glove over it, the wrist was
      // hidden and the hand floated on the sheet)
      push(); translate(hx - 130, hy + 40); rotate(-.15);
      piece(rect(-110, -80, 110, 80), '#EDE4D2', { sw: 1.6, key: 'plan', lift: 6 });
      piece([[-60, 50], [-60, -10], [-40, -10], [-40, -40], [-20, -40], [-20, -10], [20, -10], [20, -40], [40, -40], [40, -10], [60, -10], [60, 50]], '#E8C070', { sw: 1.2, key: 'planc', lift: 0 });
      dline([[-95, -55], [-78, -38], [-50, -72]], 5, '#2E9E5B');   // (the tick top-left: the arm now crosses the top-right corner)
      pop();
      piece(ribbon([[hx + 400, hy - 420], [hx + 120, hy - 120], [hx + 20, hy - 10]], 110, 90), '#28304A', { sw: 1.8, key: 'reqsleeve', lift: 6 });
      hand(hx, hy, 2.5, 70, { glove: true, pose: 'point', sw: 1.6, key: 'reqhand' });
    }
    camEnd();
    if (lt < .45) { chCover(() => drawShot('C2d', T0 - .01), lt); sandWipe(t, lt); }
    xeroxGrit(t, 1.2);
    Object.assign(XEROX, CP_X0);
  }
  // THE SAND WIPE (C1d → C1e, C2d → C2e): a spadeful of sand flung from the bottom-left, one band sweeping across: the
  // old frame ahead of its leading edge, the sandbox behind its trailing edge. (It used to cover the whole frame, then
  // slide off: two full-frame changes 0.17 s apart, a double jump. Now the frame is never all sand.)
  const SWIPE = { dur: .42, band: .7 };
  // the sand's edge at sweep position f (in frame widths; the edge is a diagonal one frame wide), p the wipe's progress
  function swEdge(f, p) { const E = []; for (let y = H + 120; y >= -120; y -= 45) { const u = (H - y) / H; E.push([(f - u) * W + 40 * Math.sin(y * .03 + p * 9) + 30 * (hash(y) - .5), y]); } return E; }
  const swF = lt => { const p = seg(lt, 0, SWIPE.dur); return { p, f: lerp(-.05, 2.2 + SWIPE.band, p) }; };
  // draw fn clipped to a screen-space polygon (p5's clip is a stencil, so the brush's layers respect it too; the clipped
  // drawing must paint its whole region opaque)
  function chClip(P, fn) {
    flushBrush(); push();
    beginClip(); push(); resetMatrix(); translate(-W / 2, -H / 2); noStroke(); fill(0); beginShape(); for (const [x, y] of P) vertex(x, y); endShape(CLOSE); pop(); endClip();
    try { fn(); } finally { flushBrush(); pop(); }
  }
  // the previous shot's last frame, only where the sand hasn't reached yet (ahead of the leading edge)
  function chCover(fn, lt) {
    const { p, f } = swF(lt); if (p >= 1 || f > 2.15) return;
    chClip(swEdge(f, p).concat([[W + 400, -120], [W + 400, H + 120]]), () => { push(); fn(); pop(); });
    look('xerox');
  }
  function sandWipe(t, lt) {
    const { p, f } = swF(lt); if (p >= 1) return;
    const lead = swEdge(f, p), trail = swEdge(f - SWIPE.band, p);
    boilSeed('sandwipe');
    piece(lead.concat(trail.slice().reverse()), '#F2C84A', { ink: null, key: 'swb', lift: 0 });
    for (let i = 0; i < 46; i++) {   // grains thrown ahead of the front
      const j = Math.floor(hash(i * 1.3) * lead.length), q = lead[j], d = 20 + 160 * hash(i * 2.7), r = 5 + 16 * hash(i * 7.1);
      piece(oval(q[0] + d * .8, q[1] - d * .6, r, r * .8, 0, 8), i % 3 ? '#F2C84A' : '#D8A840', { ink: null, key: 'swp' + i, lift: 0 });
    }
  }

  // ======================================================================================================
  // C1f / C2f: "I can't escape the rent. All that talk of human freedom - Is this what you fucking meant?"
  // The sandbox's planks shoot up into the walls of her box room (card): she's boxed in; the walls squeeze on "escape";
  // the landlord's hand taps the rent book on "rent". On the back wall, pinned up: the 1930s ad, a cheap riso copy. The
  // camera pushes into it on "All that talk": the promise, printed cheap, corners peeling. On "Is this what you" her
  // hands come up and grab its bottom edge; she tears it down on "meant": black.
  // (the poster is rigid: it rides the back wall's squeeze (its centre squeezes with the wall) but keeps its own 16:9, so
  // the push into it ends with it filling the frame exactly and hands off to the full-frame stage at the same aspect and
  // framing. Squeezed with the wall, it was narrower than 16:9 and the hand-off widened it by 1/f on one frame.) The back
  // wall no longer squeezes (the side walls slide in over the room instead: boxWallsIn), so the poster stays put; x: 640,
  // clear of the left wall at its furthest in (was 590, riding the squeezed wall).
  const POSTER = { x: 640, y: 232, w: 330 }; POSTER.h = POSTER.w * 9 / 16;
  // its pins, in sheet px (the full frame, W x H): the right one at the top corner (the sheet swings from it as she tears
  // it), the left one down the left edge, below the peeled corner (nothing to pin inside the curl)
  const PIN_R = [W - 8 * W / POSTER.w, 8 * W / POSTER.w], PIN_L = [8 * W / POSTER.w, 205];
  const posterPin = (x0, [sx, sy], key) => { const k = POSTER.w / W, x = x0 + sx * k, y = POSTER.y + sy * k; boilSeed('poster pins'); piece(oval(x, y, 5, 5, 0, 10), '#E0402E', { sw: .8, key, lift: 2 }); };
  // the copy on its sheet (sheet px), its top-left corner curling off the wall (pk: the curl's size)
  function adPeeled(gen, pk) {
    onSheet([[pk, 0], [W, 0], [W, H], [0, H], [0, pk]], () => riSoAd({ gen }));   // (the ad kept to its sheet: no overflow round it)
    // (where the corner was: just the wall. A shadow triangle drawn there traced the missing corner's two edges in a dark
    // dashed line over the wall; the flap's own card shadow (its lift) falls on the sheet under it)
    look('card'); boilSeed('peel');
    piece([[pk, 0], [pk * .25, pk * .3], [0, pk]], '#E8E0CC', { sw: 2, key: 'peelb', lift: 10 });
  }
  // (her things from the flat, the fairy lights, the pink cushion and her office box, are part of her box room now:
  // boxroomBack's o.her in present.js, with her own bedding, clothes rail and layout)
  // The ad on its sheet: riSoAd draws a whole frame's scene, which overflows the frame (clouds, trees, the sun, the
  // hammock's scallops), so it is clipped to the sheet's outline P (in the current drawing's coordinates: mapped to the
  // screen through the transform in force, so it holds under the camera, the squeeze, the push-in and the tear).
  const AD_SHEET = [[0, 0], [W, 0], [W, H], [0, H]];
  function onSheet(P, fn) {
    const [a, b, c, d, e, f] = curAffine();
    chClip(P.map(([x, y]) => [a * x + c * y + e + W / 2, b * x + d * y + f + H / 2]), fn);
  }
  // o.steep: the arm comes down near-vertically from high above (C2f's split, each room at half size: the full-frame
  // diagonal from the top-right ended in mid-air inside the frame and crossed the divider into the other room)
  function landlordHand(x, y, tap, o = {}) {
    boilSeed('landlord');
    // the rent book (a small red booklet) held at its edge, the index finger tapping it: drawn first, under the whole arm
    // (drawn over the cuff, it hid the wrist and the hand floated on it, cut off from its sleeve)
    push(); translate(x - 40, y + 40); rotate(-.3 + .12 * tap);
    piece(rect(-70, -46, 70, 46), '#A83A30', { sw: 1.6, key: 'llbook', lift: 6 });
    piece(rect(-60, -38, 60, 38), '#C04A3E', { ink: null, key: 'llbook2', lift: 0, flatCard: true });
    dline([[-40, -12], [40, -12]], 2, '#F2E0C8'); dline([[-40, 8], [20, 8]], 2, '#F2E0C8');
    pop();
    const SL = o.steep ? [[x + 190, y - 1000], [x + 130, y - 440], [x + 40, y - 10]] : [[x + 520, y - 380], [x + 200, y - 120], [x + 40, y - 10]];
    piece(ribbon(SL, 120, 96), '#6A5A48', { sw: 2, key: 'llsleeve', lift: 8 });
    for (let i = 0; i < 6; i++) { const u = .1 + i * .13, [px, py] = [lerp(SL[0][0], SL[1][0], u * 1.4), lerp(SL[0][1], SL[1][1], u * 1.4)]; if (o.steep) dline([[px - 22, py], [px - 18, py + 40]], 1.2, '#8A7A60'); else dline([[x + 480 - i * 70, y - 330 + i * 50], [x + 460 - i * 70, y - 290 + i * 50]], 1.2, '#8A7A60'); }
    piece(ribbon([[x + 60, y - 30], [x + 20, y]], 104, 100), '#E8E0D0', { sw: 1.6, key: 'llcuff', lift: 6 });
    hand(x, y, 2.3 - .25 * tap, 70, { col: '#D8A888', pose: 'point', sw: 1.6, key: 'llhand' });
    piece(oval(x - 30, y + 26, 10, 8, 0, 10), '#D9A93A', { sw: 1, key: 'llring', lift: 2 });
  }
  // (her copy is a print: it doesn't move. It ran on like the film (the gent's arm, the clock's hands, the sun's face);
  // the I2 decision stops the ad dead once it's a poster. Frozen where O1 freezes it: the butler's tray back at home,
  // clear of the right tree's chin; the gent has his cocktail. The copy still degrades, peels, tears and burns.)
  const AD_FREEZE = 2.16;
  // her on the edge of the bed, at its right-hand end (where she sat in the sand): 3/4, facing into the room (the poster),
  // her knees forward over the bed's front, her feet on the floor, hunched a little, forearms on her thighs. (Front on,
  // her thighs were toward us and the bed hid behind her: she read as standing mid-room, and her two cream trainers,
  // side by side, read as a floor cushion over her feet.)
  // (C2f's rooms seat them both so: his room is mirrored, so he faces into his)
  const hunched = P => ({ ...P, body: { ...P.body, stoop: .4 } });
  const BOXSIT = { x: 1110, y: 905, P: hunched(HER_C),
    o: { view: 'q', flip: true, seated: true, seatH: (905 - BOXROOM.bedTop) / 44, pose: { L: [2.25, .9, .06, 'relax', 1, .35], R: [1.85, .88, .06, 'relax', 1, .3] } } };
  function riSoAd(o = {}) {   // the 1930s ad as a riso copy: pastScene in the xerox look, a generation in
    look('xerox'); cpGeneration(o.gen ?? 2);
    // (film: 0: a copy of the printed poster, not of the projected film: no scratches, weave, flicker or projector
    // falloff. The film's scratches printed as long vertical lines across her copy; the copier's own dirt is cpDirt's)
    pastScene(AD_FREEZE, AD_FREEZE, { still: true, gate: false, film: 0 });
    Object.assign(XEROX, CP_X0);
  }
  function chorusF(t, lt, dur, k) {
    if (k) return chorusF2(t, lt, dur);
    const T0 = t - lt, l = mt(lt), tt = mt(t);
    const T = { esc: wt("I can't escape", 2, k) - T0, rent: wt("I can't escape", 4, k) - T0, all: wt('All that talk', 0, k) - T0, free: wt('All that talk', 5, k) - T0,
      is: wt('Is this what', 0, k) - T0, what: wt('Is this what', 2, k) - T0, fk: wt('Is this what', 4, k) - T0, meant: wt('Is this what', 5, k) - T0 };
    // (the planks slam up in one hit on the downbeat, the dust already bursting as the medium changes under it: a slower
    // rise with the dust coming late showed the riso → card switch as a second jump 0.25 s after the first)
    const rise = easeOut(seg(lt, 0, .14)), sq = .38 * backOut(seg(lt, T.esc - .05, T.esc + .35)), c0 = ease(seg(lt, .1, .7));
    const pushK = ease(seg(lt, T.all - .05, T.all + .8)), f = boxroomScale({ squeeze: sq }), PX = POSTER.x;   // (f: where the side walls are)
    const pc = [PX + POSTER.w / 2, POSTER.y + POSTER.h / 2], zP = W / POSTER.w;
    const pk = 110 + 40 * seg(lt, T.all, T.is) + 20 * Math.sin(t * 2.2);   // (the peeled corner's size, sheet px)
    if (pushK < 1) {
      look('card');
      const z0 = lerp(1.26, 1, c0), y0 = lerp(690, 540, c0), z = Math.exp(lerp(Math.log(z0), Math.log(zP), pushK)), cx = lerp(960, pc[0], pushK), cy = lerp(y0, pc[1], pushK);
      const sh = lt < .3 ? shakeXY(t, 10 * (1 - lt / .3)) : [0, 0];
      camBegin(cx + sh[0] / z, cy + sh[1] / z, z);
      if (rise < 1) { look('xerox'); cpGeneration(3); sandbox(tt, { wall: lerp(SB.plank, PR_BOX.floor - PR_BOX.top, rise) }); Object.assign(XEROX, CP_X0); look('card'); }
      const o = { her: true };   // (the room at its own proportions: on "escape" its side walls slide in over it, after her)
      if (rise >= 1) boxroomBack(tt, l, o);
      // the poster on the back wall (the ad drawn small inside its frame), a corner peeling
      if (rise >= 1) {
        push(); translate(PX, POSTER.y); scale(POSTER.w / W); adPeeled(2, pk); pop();
        posterPin(PX, PIN_L, 'pinL'); posterPin(PX, PIN_R, 'pinR');
      }
      // her on the bed, at the right-hand end (where she sat in the sand); him too in the second pass
      const [bx] = BOXROOM.bed;
      const mood = emotions(l, [[0, 'surprised', { emote: null }], [T.esc, 'sad', { emote: null }], [T.rent + .1, 'angry', { emote: null, mouth: 'flat' }]], { take: .7 });
      if (rise >= 1) {
        person(BOXSIT.x, BOXSIT.y, 44, BOXSIT.P, { ...mood, ...BOXSIT.o, lookX: lt > T.all - .3 ? -1 : .5 - 1.2 * seg(lt, T.rent - .3, T.rent - .1), lookY: lt > T.all - .3 ? -.8 : -.3, tilt: lt > T.all - .3 ? .12 : 0, boilKey: 'brher' });
        boxWallsIn(f);
        boxroomFront(tt, l, o);
      } else {
        const hp = sbP(1250, 0, 1.6); look('xerox'); cpGeneration(3); person(hp[0], hp[1] + 10, 36, HER_C, { ...feel('surprised', l), view: 'front', seated: true, seatH: .9, pose: 'lap', lookY: -.8, boilKey: 'sbher' }); Object.assign(XEROX, CP_X0); look('card');
      }
      // the landlord's hand, tapping the rent book on "rent"
      const hIn = ease(seg(lt, T.rent - .35, T.rent - .05)) * (1 - ease(seg(lt, T.all + .1, T.all + .45)));
      if (hIn > 0) { const tap = Math.max(0, Math.sin(clamp((lt - T.rent) / BEAT * 2) * Math.PI)) * (lt > T.rent ? 1 : 0); landlordHand(lerp(1900, 1340, hIn), lerp(-200, 330, hIn) + 18 * tap, tap); }
      camEnd();
      // the walls slam up: a burst of sand dust hides the change of medium (sand → card), then settles
      // (cleared by ~.42, not .55: the walls' squeeze on "escape" (.22-.62) was lost in it, and its last specks drifted
      // round the black outside the room)
      const dq = seg(lt, .03, .42);
      if (dq > 0 && dq < 1) { look('card'); boilSeed('dustburst'); for (let i = 0; i < 26; i++) { const a2 = hash(i * 3.1) * TAU, rr = (120 + 700 * hash(i * 1.7)) * easeOut(dq), sz = (150 + 140 * hash(i * 2.9)) * (1 - ease(seg(dq, .25, 1))) * clamp(dq * 6); if (sz > 3) piece(oval(960 + Math.cos(a2) * rr * 1.3, 600 + Math.sin(a2) * rr * .7, sz, sz * .8, 0, 16), mixCol('#E8D0A0', '#CFC6B1', hash(i)), { ink: null, key: 'db' + i, lift: 0 }); } }
      return;
    }
    // full frame: the riso ad, its corner peeling. On "Is this" we pull back
    // to see it pinned on the wall and her hands come up to its bottom edge; she tugs on "fucking" and on "meant" rips it
    // down: the left pin tears first (it swings from the right one), then the right, and it falls away.
    // (With verse 2 loaded there's no black: from the moment the copy comes free of its second pin (r2) the frame behind it
    // is V2a's (verse2.js): the station platform from the intro, another night, its poster, intact, framed exactly where
    // her copy hung; the torn copy and her hands fall away over it. Without verse 2 the old ending: the wall goes dark.)
    // (one copy, the one on her wall: it was copied worse and worse as the line went on, a generation every ~.6 s, and
    // on the still sheet each step read as its dots jumping: the user)
    const gen = 2;
    const back = ease(seg(lt, T.is - .15, T.is + .35)), sc = lerp(1, .72, back), py0 = lerp(0, 40, back);
    const tug = ease(seg(lt, T.fk - .1, T.meant - .05)), r1 = seg(lt, T.meant - .03, T.meant + .14), r2 = seg(lt, T.meant + .14, T.meant + .5);
    // (With verse 2 loaded the torn top edge is a wipe: from the rip on, above the edge is V2a's platform, below it her room
    // and the copy; as the copy swings from the right pin and falls, its edge carries the platform down the frame.)
    const toV2 = !!SHOT.V2a && typeof window.INTRO === 'object', wipe = toV2 && r1 > 0, dark = toV2 ? 0 : ease(seg(lt, T.meant, T.meant + .4));
    if (toV2 && r2 >= 1) { drawShot('V2a', t); look('card'); return; }   // (the wipe's done: the copy has fallen out of frame)
    const pw = W * sc, ph = H * sc, px = (W - pw) / 2, py = py0;
    // (the room behind the poster is the room, under the camera that frames the sheet: the push's own camera where it
    // hands off (sc 1), pulling back with the sheet; its wall shows round the sheet as we pull back and under the peeled
    // corner, its bulb lights it as in the room. Without verse 2 it goes dark as the poster comes away.)
    const zc = sc * W / POSTER.w, room = { her: true, bulb: Math.max(1e-3, 1 - dark) }, inRoom = fn => { camBegin(PX + (960 - px) / zc, POSTER.y + (540 - py) / zc, zc); fn(); camEnd(); };
    look('card'); inRoom(() => { boxroomBack(tt, l, room); boxWallsIn(f); });
    if (r1 > 0 && dark > 0) _paint(rect(-60, -60, W + 60, H + 60), { wash: '#0A080C', washOp: 255 * dark, ink: null });
    // the sheet's transform: pivoting on the top-right pin while it swings, then falling; sM maps a sheet point to the screen
    const ang = .5 * backOut(r1) + .4 * easeIn(r2), drop = 1300 * easeIn(r2) + 26 * tug, sy = sc * (1 + .025 * tug), [ax, ay] = PIN_R;
    const sheetM = () => { translate(px + ax * sc, py + ay * sc + drop); rotate(-ang); translate(-ax * sc, -ay * sc); scale(sc, sy); };
    const ca = Math.cos(-ang), sa = Math.sin(-ang), sM = ([x, y]) => { const qx = (x - ax) * sc, qy = y * sy - ay * sc; return [px + ax * sc + qx * ca - qy * sa, py + ay * sc + drop + qx * sa + qy * ca]; };
    const E = []; for (let i = 0; i <= 20; i++) E.push([W * i / 20, 50 + 30 * hash(i * 3.3)]);
    // the pins (on the wall), and once torn the strip left on them and a scrap on the left pin, under the swinging sheet
    const pins = lt < T.meant + 1.1 && !wipe;
    if (pins && r1 > 0) {
      boilSeed('strip'); const P = [[px, py - 4], [px + pw, py - 4]]; for (let i = 20; i >= 0; i--) P.push([px + pw * i / 20, py + 18 + 30 * sc * hash(i * 3.3)]); piece(P, '#E8E0CC', { sw: 2, key: 'strip', lift: 4 });
      inRoom(() => { const k = POSTER.w / W, x = PX + PIN_L[0] * k, y = POSTER.y + PIN_L[1] * k; boilSeed('pinscrap'); piece([[x - 9, y - 6], [x + 7, y - 9], [x + 9, y + 7], [x - 6, y + 9]], '#E8E0CC', { sw: .8, key: 'pinscrap', lift: 2 }); posterPin(PX, PIN_L, 'pinL'); if (r2 > 0) posterPin(PX, PIN_R, 'pinR'); });
    }
    if (r2 < 1) {
      push(); sheetM();
      if (r1 <= 0) adPeeled(gen, pk);
      else {
        onSheet([[-4, 70], ...E, [W + 4, E[20][1]], [W + 4, H + 4], [-4, H + 4]], () => riSoAd({ gen }));   // (kept to its sheet as it swings)
        look('card'); boilSeed('peel');
        if (!wipe) dline(E, 3, '#F4EEE0', 0);   // (the torn edge; the sheet's clip already leaves the wall showing above it)
      }
      pop();
    }
    if (pins && r1 <= 0) inRoom(() => { posterPin(PX, PIN_L, 'pinL'); posterPin(PX, PIN_R, 'pinR'); });
    else if (pins && r2 <= 0) inRoom(() => posterPin(PX, PIN_R, 'pinR'));   // (the sheet still hangs from it)
    inRoom(() => boxroomFront(tt, l, room));   // (the bulb's light on it all, as in the room)
    // her hands: up from below to grip the poster's bottom edge; the tug; they go down with it
    const hk = ease(seg(lt, T.is - .05, T.what + .05)), edgeY = py + ph;
    if (hk > 0 && r2 < .3) for (const sd of [-1, 1]) {
      const hx = W / 2 + sd * 360, hy = lerp(H + 300, edgeY - 30, hk) + 40 * tug + (sd < 0 ? 380 * easeIn(r1) : 60 * r1) + 900 * easeIn(r2);
      boilSeed('rh' + sd);
      limb([[hx + sd * 230, H + 560], [hx + sd * 150, hy + 330], [hx + sd * 10, hy + 90]], 130, 110, HER_C.col.coat, { sw: 2.4, key: 'rarm' + sd, closedRoot: true });
      piece(ppBar([hx + sd * 12, hy + 120], [hx + sd * 6, hy + 62], 118, 118), HER_C.col.cuff, { sw: 2, key: 'rcuff' + sd, lift: 4 });
      hand(hx, hy + 60, -Math.PI / 2 + sd * .12, 110, { col: HER_C.col.skin, pose: 'fist', sw: 2.4, mirror: sd > 0, key: 'rhand' + sd });
    }
    if (wipe) {   // the platform, above the torn edge (the edge's line carried on past the sheet's ends), and the edge itself
      const above = [sM([-3 * W, E[0][1]]), ...E.map(sM), sM([4 * W, E[20][1]]), sM([4 * W, -4 * H]), sM([-3 * W, -4 * H])];
      chClip(above, () => { push(); drawShot('V2a', t); pop(); });
      look('card'); push(); sheetM(); boilSeed('peel'); dline(E, 3, '#F4EEE0', 0); pop();
    }
  }
  // C2f: "I can't escape the rent" in facing box rooms, a split screen, walls closing, a landlord's hand in each; "All
  // that talk" the rooms slide apart and behind them is the ad (riso), charring at the edges; the camera pulls back:
  // the two of them stand in front of it; "Is this what you fucking" it blisters; "meant" it burns through to the break.
  // THE POSTER'S EDGES BURNING (C2f, from "All that talk" to the burn-through; ad px, inside the ad's own transform), in
  // the print's own inks (it's her riso copy): the paper beyond the burn front is gone (the wall shows); a scorched
  // margin browns inward from the front (the yellow and pink drums, then the blue over them for the char); the front
  // itself a charred, blackened lip with the ember glowing along it; small riso flames (fluoro pink, a yellow core)
  // licking up from it, sparks rising, a little smoke. k 0..1: how far it has eaten in (it creeps in on the beat).
  // (It was a thin orange line with a glow round the sheet: it read as a glow, not as the paper burning.)
  function burnRing(k, t, inset = 0) {
    const n = 80, f = Math.floor(t * 12 + 1e-6), R = [];
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU, c = Math.cos(a), sn = Math.sin(a), m = Math.min(Math.abs((W / 2) / (c || 1e-6)), Math.abs((H / 2) / (sn || 1e-6)));
      const ins = inset * (.45 + 1.1 * noise(i * .47 + inset * .13, 5.3 + k));   // (the scorch's inner edges patchy, not parallel to the front)
      const d = m - (26 + 150 * k) * (.65 + .6 * noise(i * .29 + 3.1, k * 2.2)) - ins - (inset ? 0 : 5 * (hash(i + f * .37) - .5));
      R.push([960 + c * d, 540 + sn * d]);
    }
    return R;
  }
  function edgeBurn(k, t) {
    if (k <= 0) return;
    const F = burnRing(k, t), ring = inset => burnRing(k, t, inset), tt = mt(t), f = Math.floor(t * 12 + 1e-6);
    const D = ch => XEROX.process.find(q => q[0] === ch) || XEROX.process[0], ht = (P, tone, ch) => { const d = D(ch); halftone(P, tone, d[1], XEROX.cell, d[2]); };
    const brown = (P, a) => { ht(P, .5 * a, 'y'); ht(P, .38 * a, 'm'); ht(P, .3 * a, 'c'); };   // (brown, from the three drums)
    look('ink'); irisShape(F, '#1A1418');   // (burnt away: the wall behind)
    look('xerox');
    // the scorch: the paper browning inward from the front, darker toward it, in patches
    clipPoly([F, ring(90)], () => {
      brown(F, .45);
      clipPoly([F, ring(40)], () => { brown(F, .7); clipPoly([F, ring(14)], () => brown(F, 1.4)); });
    });
    // the front: the paper's edge charred black and curling, the ember glowing along it
    boilSeed('edge burn');
    dline(F.concat([F[0]]), 5, '#241820', .3);
    look('ink');
    _inkLine(F.concat([F[0]]), 3, '#FF9A3A', 'flash', .3); _inkLine(F.concat([F[0]]), 1.2, '#FFE2A0', 'flash', .3);
    look('xerox');
    // flames licking up from the front, riso-printed: fluoro pink with a yellow core; each redrawn on twos (they flicker)
    for (let i = 0; i < 26; i++) {
      const j = Math.floor(i / 26 * F.length + 2 * hash(i * 1.3)) % F.length, [x, y] = F[j];
      const fl = .6 + .4 * hash(i * 7.3 + f), h = (38 + 52 * hash(i * 2.9)) * (.55 + .7 * k) * fl, w = (12 + 12 * hash(i * 4.1)) * (.8 + .4 * k), sw = w * .9 * Math.sin(tt * 7 + i * 1.7);
      const fp = s => [[x - w * s, y + 5], [x - w * 1.15 * s, y - h * .25 * s], [x - w * .55 * s, y - h * .62 * s], [x + sw * s, y - h * s], [x + w * .45 * s, y - h * .5 * s], [x + w * 1.05 * s, y - h * .2 * s], [x + w * s, y + 5]];
      piece(curvy(fp(1), 4), '#FF4F9A', { ink: null, key: 'ebf' + i, lift: 0, spot: { channel: 'm', tone: .9 } });
      piece(curvy(fp(.55), 4), '#FFD23A', { ink: null, key: 'ebc' + i, lift: 0, spot: { channel: 'y', tone: .95 } });
    }
    // sparks rising off it
    for (let i = 0; i < 18; i++) {
      const age = frac(tt * .8 + hash(i * 5.1)), [x, y] = F[Math.floor(hash(i * 3.7 + Math.floor(tt * .8 + hash(i * 5.1))) * F.length)], r = 5 * (1 - age);
      if (r > .8) piece(oval(x + 30 * Math.sin(age * 5 + i), y - 190 * age, r, r, 0, 6), '#FFD23A', { ink: null, key: 'ebs' + i, lift: 0, spot: { channel: 'y', tone: 1 } });
    }
    // a little smoke, drifting up off the top edge (soft: light on the dark wall)
    for (let i = 0; i < 7; i++) { const age = frac(tt * .35 + i / 7), x = 200 + i * 250 + 40 * Math.sin(tt + i), y = F[Math.floor((.62 + .76 * i / 7) % 1 * F.length)][1] - 40 - 260 * age; glow(x, y, 120 + 180 * age, '#6A5E5E', .3 * Math.sin(Math.PI * age)); }
    // the ember's light
    for (let i = 0; i < 12; i++) { const p = F[Math.floor(hash(i * 3.7) * F.length)]; glow(p[0], p[1], 80, '#FF8A3A', .3 + .25 * hash(i + f)); }
  }
  // THE BURN-THROUGH (C2f): past.js's burnHole browned the whole frame outward from the hole in hard-edged polygon
  // steps, over the two of them (a flat brown slab washing over everything for ~6 frames), and its hole was black until
  // the last frames. Here the scorch is a soft gradient kept to the ad round the hole (chBurnAd, before the cast), and the
  // hole shows the rave from the moment it opens (chBurnThrough, after the cast).
  let CH_GRAD = null;
  const rgba = (hex, a) => { const v = parseInt(hex.slice(1, 7), 16); return `rgba(${v >> 16 & 255},${v >> 8 & 255},${v & 255},${clamp(a)})`; };
  // a soft radial wash over the frame: stops [[r (screen px), colour, alpha], ...] out from (cx, cy); past the last, its
  // colour (drawn from a quarter-size buffer: a gradient has no edge to lose)
  function softRadial(cx, cy, stops) {
    if (!CH_GRAD) { CH_GRAD = createGraphics(480, 270); CH_GRAD.pixelDensity(1); }
    const c = CH_GRAD.drawingContext, s = 480 / W, rMax = Math.max(1, stops[stops.length - 1][0]);
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 480, 270);
    const gr = c.createRadialGradient(cx * s, cy * s, 0, cx * s, cy * s, rMax * s);
    for (const [r, col, a] of stops) gr.addColorStop(clamp(r / rMax), rgba(col, a));
    c.fillStyle = gr; c.fillRect(0, 0, 480, 270);
    flushBrush(); push(); resetMatrix(); translate(-W / 2, -H / 2); image(CH_GRAD, 0, 0, W, H); pop();
  }
  const chBurnR = p => { const R = psBurnR(p); return { R, R0: R + 28 * psBurnW(R) }; };
  function chBurnAd(p, t, adRect) {   // the scorch round the hole, on the ad (screen space); the hot spot before it opens
    if (p <= 0) return;
    const [cx, cy] = PSX.burn, { R, R0 } = chBurnR(p), S = R0 + 60 + 110 * p;
    look('ink');
    clipPoly(adRect, () => softRadial(cx, cy, [[0, '#2A160E', 1], [R0, '#2A160E', .9], [lerp(R0, S, .45), '#7A4E30', .5], [S, '#A87850', 0]]), { screen: true });
    if (R < 2) { boilSeed('ps burn'); glow(cx, cy, 60 + 500 * p, PS.hot, .4 + 4 * p); glow(cx, cy, 30 + 200 * p, '#FFFFFF', 2 * p); }
  }
  // the hole burning through the frame, over everything: its glowing, charred rim (past.js's, the same hole B1 opens
  // from) and through it the rave (B1) from the moment it opens; the poster and the two of them stay round it, and the
  // burn runs straight on through the cut (B1 opens on this shot's last frame round the growing hole, verse3.js). (The
  // char no longer sweeps out over the frame in the last frames: it met B1's old black opening.)
  function chBurnThrough(p, t) {
    const [cx, cy] = PSX.burn, R = psBurnR(p);
    look('ink');
    if (R < 2) return;
    boilSeed('ps burn'); psRim(R, t, true);
    if (SHOT.B1) clipPoly(burnPoly(cx, cy, R, t), () => { push(); drawShot('B1', t); pop(); }, { screen: true });
    else paint(burnPoly(cx, cy, R, t), { wash: PS.black, ink: null });
    look('ink');
  }
  // The box room's side walls slid in to squeeze f (0.5..1), over the room drawn at its own proportions: each wall face,
  // its paper's stripes, its corners and skirting, its cut edge at the open front, and the stage's dark beyond it (up past
  // the old walls' cut edges, proud of the ceiling); what stood by the walls goes behind them. (The squeeze used to scale the room and whoever sat in it by f across (present.js
  // boxroomScale): the rooms and the two of them squashed to ~80% wide on "escape" (the user, C2f: "keep the proportions
  // of the rooms consistent so the eyes can track what's going on").) Room coordinates, the caller's transform.
  function boxWallsIn(f) {
    if (f >= .999) return;
    const { vx, x0, x1, top, floor, K } = PR_BOX, H0 = floor - top, yB = prbY(0, K), yT = prbY(H0, K);
    boilSeed('ch walls in');
    for (const [xa0, s] of [[x0, -1], [x1, 1]]) {
      const xa = vx + (xa0 - vx) * f, xe = prbX(xa, K), key = 'chwi' + s;
      piece(s < 0 ? prR(-60, -200, xe, H + 200) : prR(xe, -200, W + 60, H + 200), PRB.void, { ink: null, key: key + 'v', lift: 0, flatCard: true, edge: false });
      piece([prbP(xa, 0, 1), prbP(xa, H0, 1), prbP(xa, H0, K), prbP(xa, 0, K)], PRB.wallSide, { ink: null, key, lift: 0, edge: false, ...PR_SPARSE });
      if (!prDD()) for (let i = 1; i < 9; i++) { const k = 1 + i * .075; prFlat([prbP(xa, 2, k), prbP(xa, H0 - 2, k), prbP(xa, H0 - 2, k + .022), prbP(xa, 2, k + .022)], mixCol(PRB.wallSide, PRB.stripe, .9), key + 's' + i); }
      prFlat([prbP(xa, 14, 1), prbP(xa, 14, K), prbP(xa, 0, K), prbP(xa, 0, 1)], PRB.skirt, key + 'sk');
      dline([[xa, top], [xa, floor]], 1.2, PRB.wallDk); dline([prbP(xa, H0, 1), prbP(xa, H0, K)], 1, PRB.ceilDk); dline([prbP(xa, 0, 1), prbP(xa, 0, K)], 1, PRB.carpetDk);
      piece([[xe, yT - 40], [xe + s * 26, yT - 50], [xe + s * 26, yB + 22], [xe, yB]], PRB.wallEdge, { sw: 1.4, key: key + 'cut', lift: 6 });
    }
  }
  function twoRooms(t, l, lt, T, sq, apart) {
    // two box rooms side by side (hers left, his right, mirrored), each at .52 scale in its half; apart 0..1 slides them
    // out. On "escape" their side walls close in (boxWallsIn): the rooms and the two of them keep their proportions
    for (const [sd, P] of [[-1, HER_C], [1, HIM_C]]) {
      const cx = 960 + sd * (480 + 1100 * easeIn(apart));
      push(); translate(cx, 560); scale(sd > 0 ? -.52 : .52, .52); translate(-960, -560);
      look('card');
      const o = { her: sd < 0 }, fW = boxroomScale({ squeeze: sq });   // (hers dressed as hers: present.js's o.her; fW: where the walls are)
      // (sliding apart, each room keeps to its own box: the stage's dark round it (boxroomBack's void, the frame's width
      // and more at this scale) slid with it as a black slab over the ad. The box: the open front and the side walls' cut
      // edges, standing proud of the ceiling; the landlord's arm comes down from above it, unclipped.)
      const clip = apart > 0;
      if (clip) {
        const K = PR_BOX.K, X = x => PR_BOX.vx + (prbX(x, K) - PR_BOX.vx) * fW, xl = X(PR_BOX.x0), xr = X(PR_BOX.x1), e = 27;
        const yT = prbY(PR_BOX.floor - PR_BOX.top, K), yB = prbY(0, K) + 23;
        clipPush([[xl - e, yT - 51], [xl, yT - 51], [xl, yT], [xr, yT], [xr, yT - 51], [xr + e, yT - 51], [xr + e, yB], [xl - e, yB]]);
      }
      boxroomBack(t, l, o);
      const mood = emotions(l, [[0, 'bored', { emote: null }], [T.esc, 'sad', { emote: null }], [T.rent + .1, 'angry', { emote: null, mouth: 'flat' }]], { take: .7 });
      person(BOXSIT.x, BOXSIT.y, 44, hunched(P), { ...mood, ...BOXSIT.o, lookX: sd * .6 - .6 * sd * seg(lt, T.rent - .3, T.rent - .1), lookY: -.3, boilKey: 'fr' + sd });
      boxWallsIn(fW);
      boxroomFront(t, l, o);
      if (clip) clipPop();
      // (a prop: on twos. It withdraws, up out of the room, before "All that talk": it hung across the ad as the rooms slid)
      const hIn = ease(seg(l, T.rent - .35, T.rent - .05)) * (1 - ease(seg(l, T.all - .42, T.all - .12)));
      if (hIn > 0) { const tap = l > T.rent ? Math.max(0, Math.sin(clamp((l - T.rent) / BEAT * 2) * Math.PI)) : 0; landlordHand(lerp(1420, 1340, hIn), lerp(-900, 330, hIn) + 18 * tap, tap, { steep: true }); }
      pop();
    }
    boilSeed('divider'); if (apart <= 0) piece(rect(950, -20, 970, H + 20), '#0A080C', { ink: null, key: 'div', lift: 0 });
  }
  function chorusF2(t, lt, dur) {
    const k = 1, T0 = t - lt, l = mt(lt), tt = mt(t);
    const T = { esc: wt("I can't escape", 2, k) - T0, rent: wt("I can't escape", 4, k) - T0, all: wt('All that talk', 0, k) - T0, human: wt('All that talk', 4, k) - T0,
      is: wt('Is this what', 0, k) - T0, what: wt('Is this what', 2, k) - T0, fk: wt('Is this what', 4, k) - T0, meant: wt('Is this what', 5, k) - T0 };
    const sq = .45 * backOut(seg(lt, T.esc - .05, T.esc + .35)), apart = seg(lt, T.all - .1, T.all + .45);
    // (the edges eat in on the beat: a quick surge on each beat, still between)
    const burn0 = T.what - .1, burnP = seg(lt, burn0, dur), bA = bpOf(T0 + T.all), bN = Math.max(1, bpOf(T0 + T.fk) - bA), bq = clamp(bpOf(t) - bA, 0, bN), charK = .15 + .6 * (Math.floor(bq) + easeOut(clamp(frac(bq) * 4))) / bN;
    const back = ease(seg(lt, T.human - .2, T.human + 1.2)), z = lerp(1, .74, back);
    // behind the rooms: the wall with the ad on it, and the two of them in front of it (after the pull-back)
    look('card'); _paint(rect(-60, -60, W + 60, H + 60), { wash: '#1A1418', washOp: 255, ink: null });
    if (apart > 0) {
      push(); translate(960, 540); scale(z); translate(-960, -540);
      riSoAd({ gen: 3 });
      edgeBurn(charK, t);
      pop();
      if (burnP > 0) chBurnAd(burnP, t, rect(960 - 960 * z, 540 - 540 * z, 960 + 960 * z, 540 + 540 * z));
      if (back > 0) {
        look('card');
        // they rise into frame looking up at it, her singing at it. As "freedom" ends she glances round at him and he folds
        // his arms (grumbling, mouth shut); she turns back to it, draws her arm in and on "Is this what you" rounds on it,
        // pointing (to us); he looks up at it and shakes his head. As it starts to burn her point holds a beat, as if she'd
        // lit it, and drops back to her hip; he unfolds his arms and throws up his hands, mouth shut (he's silent).
        // (Before: from the end of "freedom" to "Is" (1.4 s) nothing new happened; on the burn both shrugged the same
        // mirrored shrug; his head shake never played (its window closed before it opened); his surprised mouth hung
        // open while she sang.)
        const EF = LY('All that talk', k), tFreeE = (EF ? EF.words[EF.words.length - 1][1] : T0 + 4.15) - T0;
        const tGl = tFreeE, tFold = tFreeE + .15, tBack = T.is - .55, tWind = T.is - .32;
        const hm = emotions(l, [[0, 'sad', { emote: null }], [T.human, 'angry', { emote: null, mouth: 'flat' }], [T.is - .05, 'angry', { emote: null, mouth: 'shout' }], [burn0 + .15, 'surprised', { emote: null }]], { take: .7 });
        const hh = emotions(l, [[0, 'sad', { emote: null }], [T.human + .2, 'angry', { emote: null, mouth: 'flat' }], [T.what - .1, 'disgusted', { emote: null }], [burn0 + .2, 'surprised', { emote: null, mouth: 'flat' }]], { take: .7 });
        const rise = lerp(420, 0, ease(back));
        const hip = { L: [-1.2, 2.6, .15, 'relax'], R: [.6, 1.0, .5, 'fist', 1] };
        const herPose = pPoses(l, [[0, hip], [tWind, { L: [-1.2, 2.6, .15, 'relax'], R: [.25, .35, .6, 'fist', 1] }], [T.is - .1, 'point'], [burn0 + .5, hip]], .22);
        const himPose = pPoses(l, [[0, { L: [-1.2, 2.6, .15, 'relax'], R: [.6, 1.0, .5, 'fist', 1] }], [tFold, 'cross'], [burn0 + .2, 'shrug']], .25);
        const pointing = l >= T.is - .1 && l < burn0 + .1;
        const hLk = pointing ? [.3, 0] : l < tGl || (l >= tBack && l < T.is - .1) || l >= burn0 + .1 ? [.5, -.7] : [.95, -.05];
        const mLk = l < tGl + .1 ? [.5, -.7] : l < T.is ? [.9, -.1] : [.5, -.7];
        const shake = l > T.is + .12 && l < burn0 + .1 ? .12 * Math.sin((l - T.is - .12) * 26) : 0;
        person(430, 1330 + rise, 58, HER_C, { ...hm, view: pointing ? 'front' : 'q', lookX: hLk[0], lookY: hLk[1], pose: herPose, boilKey: 'c2fher', seed: 3 });
        person(1500, 1330 + rise, 58, HIM_C, { ...hh, view: 'q', flip: true, lookX: mLk[0], lookY: mLk[1], tilt: shake, pose: himPose, boilKey: 'c2fhim', seed: 5 });
        for (const x of [430, 1500]) glow(x, 760, 380, '#FF8A3A', .18 + .25 * charK);
      }
    }
    // (the dark round the rooms fades off the ad over 0.2 s as they start to slide: it turned into the ad in one frame)
    if (apart > 0) { const dk = 1 - ease(seg(lt, T.all - .1, T.all + .1)); if (dk > 0) _paint(rect(-60, -60, W + 60, H + 60), { wash: '#141216', washOp: 255 * dk, ink: null }); }
    if (apart < 1) twoRooms(tt, l, lt, T, sq, apart);
    // in: the sandcastle wall keeps rising and splits apart (from C2e). (It bursts open from the first frame, fastest at
    // the start: easing it open from a closed, full-frame wall held flat yellow for a beat, a cut then a second jump.)
    if (lt < .3) { const q = seg(lt, 0, .3); look('xerox'); cpGeneration(3); boilSeed('c2fwall'); for (const sd of [-1, 1]) { const x0 = 960 + sd * lerp(120, 1060, easeOut(q)); piece(sd < 0 ? rect(x0 - 1100, -60, x0, H + 60) : rect(x0, -60, x0 + 1100, H + 60), '#E8C070', { sw: 1.8, key: 'c2fw' + sd, lift: 0 }); } Object.assign(XEROX, CP_X0); }
    // out: the burn, through to the break (B1 opens with burnReveal from the same hole, round it this shot's last frame)
    if (burnP > 0) chBurnThrough(burnP, t);
  }

  // ---------- test loops (dev only) ----------
  LOOPS.chBrain = t => {
    look('card'); const k = t > 1 ? 1 : 0, Bn = BRAIN[k], cy = Bn.y + 110 * Bn.s; camBegin(960, cy, .74 * Bn.big / Bn.s); outsideNight(t, cy); brainWorld(t, t, k, { grind: seg(t % 1, .3, .8), hatch: seg(t % 1, .8, .9) }); camEnd();
  };
  LOOPS.chBrain.len = 2;
  LOOPS.chApi = t => {
    look('card');
    if (t < 1) { camBegin(960, 720, 1.2); CHORUS.trainOutside(t, t, { doors: t }); camEnd(); }
    else { camBegin(960, 560, 1.2); CHORUS.carriageBack(t, t, { still: true, view: (tt, bay, r) => piece(rect(r.x, r.y, r.x + r.w, r.y + r.h), bay ? '#445' : '#8A6', { ink: null, key: 'v' + bay, lift: 0 }) }); const [x, y] = CHORUS.SEAT(0, -1); person(x, CR.FY, CR.u, HER_C, { view: 'q', seated: true, seatH: (CR.FY - y) / CR.u, boilKey: 'api' }); CHORUS.carriageFront(t, t, {}); camEnd(); }
  };
  LOOPS.chApi.len = 2;
  // the seats' model sheet (?loop=chSeats): bay 0 as F4 has it, Tess in its left seat, and the rush hour's commuters in the
  // benches either side at the scales given by ?u=a,b,c (the crowd's u), to check heads against the headrests
  LOOPS.chSeats = t => {
    look('card'); const US = (new URLSearchParams(location.search).get('u') || '32.5,36,39').split(',').map(Number);
    camBegin(960, 600, .78); carriageBack(t, t, { still: true, crowd: { level: 0 } });
    const [x, y] = crSeatAt(0, -1); person(x, CR.FY, CR.u, HER_C, { view: 'q', seated: true, seatH: (CR.FY - y) / CR.u, boilKey: 'seatsher' });
    [[0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([i, sd], k) => { const u = US[k % US.length]; crowdTrain('seats', t, { CR, level: 1, commute: true, i0: i, i1: i, skip: [], seat: CR_SEAT, seatFace: crSeatFace, only: sd, uSit: u }); });
    carriageFront(t, t, { crowd: { level: 0 } }); camEnd();
  };
  LOOPS.chSeats.len = 4;
  LOOPS.chBunk = t => { look('bank'); const c = bunkerCam(t); camBegin(c.cx, c.cy, c.zoom); bankBunker(t, t); vaultSlot(t, { cam: c }); camEnd(); };
  LOOPS.chBunk.len = 4.28;


  // ---------- for other chapters (the final chorus reuses the chorus's train, stamp and sandwich) ----------
  // All world coordinates = screen at zoom 1; call inside your own camBegin/camEnd; look('card') for the train.
  window.CHORUS = {
    CR, SEAT: (bay, side) => crSeatAt(bay, side), TABLE: bay => [960 + bay * CR.BW, CR.TY], WIN: bay => crWin(bay), GLASS: bay => crGlass(bay),   // (GLASS: the window's glass outline, the view's exact clip)
    carriageBack: (t, lt, o = {}) => carriageBack(t, lt, o), carriageFront: (t, lt, o = {}) => carriageFront(t, lt, o),
    trainOutside: (t, lt, o = {}) => { outsideNight(t, 720, o.still ? 0 : 1); trainSide(t, lt, o.window ? { window: o.window, doors: o.doors } : { inWindow: (i, cx, gy) => windowFace(i, cx, gy, lt, {}, 0), doors: o.doors }); },
    TRAIN: TX, stampProp: (x, y, s, rot = 0) => stampProp(x, y, s, rot), stampMark: (cx, cy, r, rot = -.2) => stampMark(cx, cy, r, rot, 1), sandwich: (x, y, s, rot = 0) => sandwich(x, y, s, rot),
    // the C1b brain's sulci (its brain-local px: the pocket brain in V2g, verse2.js AGI.brain, draws them in miniature)
    // (split off where they run under the cerebellum: the cortex's field now reaches its outline there)
    brainFolds: () => CX_PF || (CX_PF = (() => { const CB = curvy(CX.CB, 5), out = []; for (const L of cxLevel(cxField(), .9)) { let run = []; for (const p of L) { if (inPoly(p[0], p[1], CB)) { if (run.length > 1) out.push(run); run = []; } else run.push(p); } if (run.length > 1) out.push(run); } return out; })().filter(L => { let a = 0; for (let i = 1; i < L.length; i++) a += Math.hypot(L[i][0] - L[i - 1][0], L[i][1] - L[i - 1][1]); return a > 70; })),
  };
})();

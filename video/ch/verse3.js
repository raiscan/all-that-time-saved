// verse3.js: the instrumental break and verse 3 (bars 91–122). Every bot here sincerely wants to help (the README's
// bot performance rule); the harm stays visible.
//   B1   (bars 91–98) the burn hole opens onto the bots' rave in a server-hall cathedral (banknote-engraved stone, riso
//        light): a whip-pan tour (Clawd and the Codex gang, Grok on the decks, the Gemini twins with Copilot mimicking),
//        a riso flash into the hook (everyone in unison, confetti), then pull back out through the window into the rain:
//        the two of them outside; Copilot spots them, waves, runs to open the side door; the access gate says no (red ✗);
//        it passes her a flyer through the flaps instead.
//   V3a  (98–102) the rave's strobe; the club's door shuts; on a flash the camera turns across the road to a bookie's
//        (riso: a horse's-head roundel on the fascia, a striped awning, odds boards and the meeting on its screens); the
//        two of them dash out of the road under its awning. She rolls the flyer into a cone and does the boss on the
//        window's pre-race screen (him at the megaphone): "If we don't, then China will!"; him: "So that's the reason
//        we're all in", his eyes going up to the odds board as the prices move and a punter inside slams down his slip.
//        Push into the window's screen: the engraved race comes alive; the lead synthetic horse bolts for the post and
//        its jockey (Altman) can't rein it in.
//   V3b  (102–104) pull back from the race: it's streaming on his phone, in his hand in the rain; the bot check pops up
//        over it: nine little buses, tapped one per word.
//   V3c  (104–106) "the online high street": a copier's light bar sweeps the captcha into riso; it shakes no on "bot";
//        pull back: it's the bot-check lock on his corner shop's door, and he's still clicking buses. Across the road the
//        bank, the GP, the school, the council, each door locked with a website's bot check; the Codex pets, on errands,
//        clear them one door a syllable from "pick" (the cat ticks his door's box and trots in past him: no, again), a tick
//        and a light each. Push in on him, the last human outside a locked door.
//   V3d  (106–114) film rolls through the gate to a leader on a classroom's pull-down screen, her with a pointer; the
//        projected 1930s cartoon: the half-star grade; homework set (the goal: a whole star); they slip out; behind the
//        bike sheds Codey briefs the heist on a flip board (the map, the lock, the answer sheet into a
//        satchel), the reverse on the other four taking notes (the break-in is never shown); a tin-can group chat that
//        agrees on the plan; the raid, a dust cloud whooshing off; the marking: THUNK, the same half-star. Pull back out.
//   V3e  (114–118) his health dashboard (charts and icons only); the Gemini twins hop in and tidy it; his face; a twin
//        raises a clapperboard: CLAP, a film set, him the only card thing in it, set from mark to mark by Grok, directing.
//   V3f  (118–122) cables grow across the set; out of the soil: Clawd plants itself and grows a synthetic tree (circuit
//        roots to every building, cable boughs to the surgery, the bell, the bus stop, the lamp, the lights, one connector
//        into a door's lock); his building cut open like a doll's house (riso: the break in its brick, the flats round
//        his): the box room, printed with it, bed on end; he rounds on the tree, shouting, and jabs at it; the crown
//        bursts; the bed drops and knocks him down onto it; push in; he holds his hand out for his cut; the copier's light
//        bar sweeps the room out as card; one crumb drifts into his palm and he thrusts it up at us. Ends on the box room,
//        mid-rant (D1 carries it on).
(() => {
  // ---------------------------------------------------------------------------------------------------------------
  // shared
  // ---------------------------------------------------------------------------------------------------------------
  const DRUM = () => { const o = {}; for (const [c, ink, a] of XEROX.process || []) o[c] = [ink, a]; return o; };
  // one riso drum as a dot screen over P (tone 0..1): c blue, m fluoro pink, y yellow
  function v3Spot(P, ch, tone) { const d = DRUM()[ch]; if (d && tone > .03) halftone(P, Math.min(.95, tone), d[0], XEROX.cell, d[1]); }
  const box = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const lerpP = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  // Draw fn with the bank look's engraving scaled by S (line spacing, weights, waves: × S), anchored at (ax, ay): a print
  // drawn small (a poster on a wall) keeps lines that read at the size it's seen (after banknote.js's bnEngrave).
  function v3Engrave(S, fn, ax = 0, ay = 0) {
    if (Math.abs(S - 1) < .01) { fn(); return; }
    const sv = { wl: waveLines, el: edgeLine, dl: dline };
    waveLines = (P, d, a, amp, wl, c, w) => { push(); translate(ax, ay); sv.wl(P.map(([x, y]) => [x - ax, y - ay]), d * S, a, amp * S, wl * S, c, w * S); pop(); };
    edgeLine = (P, sw = 1, c, closed, curv = 0) => sv.el(P, sw * S, c, closed, curv);
    dline = (P, sw = 1, c = NOIR.ink, curv = 0) => sv.dl(P, sw * S, c, curv);
    try { fn(); } finally { waveLines = sv.wl; edgeLine = sv.el; dline = sv.dl; }
  }
  // Draw fn clipped to the screen columns x0..x1 (all rows): a hard vertical edge (a copier's light bar, a door's jamb).
  // A stencil (clipPoly), where it was a GL scissor, which the riso print's layers ignore: V3c's copy showed over the
  // whole frame from the bar's first frame, so the bar swept across a picture already printed.
  const v3Scissor = (x0, x1, fn) => { if (x1 > x0) clipPoly(box(x0, -60, x1, H + 60), fn, { screen: true }); };
  // Draw fn clipped to the screen rows y0..y1 (p5's clip: a stencil, which the brush's layers respect; a GL scissor
  // doesn't work for rows, the brush's layer is flipped). fn must paint its whole region opaque.
  function v3ClipRows(y0, y1, fn) {
    if (y1 <= y0) return;
    flushBrush(); push();
    beginClip(); push(); resetMatrix(); translate(-W / 2, -H / 2); noStroke(); fill(0); rect(-60, y0, W + 120, y1 - y0); pop(); endClip();
    try { fn(); } finally { flushBrush(); pop(); }
  }
  // the camera's visible world rect (for culling what's off screen); null = draw everything
  const viewRect = () => CAM ? [CAM.cx - W / 2 / CAM.zoom - 40, CAM.cy - H / 2 / CAM.zoom - 40, CAM.cx + W / 2 / CAM.zoom + 40, CAM.cy + H / 2 / CAM.zoom + 40] : null;
  const vis = (x0, y0, x1, y1) => { const v = viewRect(); return !v || !(x1 < v[0] || x0 > v[2] || y1 < v[1] || y0 > v[3]); };
  // a riso "done" tick: a blue-drum disc with a paper check knocked out of it (s = radius)
  function v3Tick(x, y, s, key) {
    const D = DRUM().c; piece(oval(x, y, s, s, 0, 22), '#2F62C4', { sw: 1.2, key, spot: { channel: 'c', tone: .95 } });
    _paint(ribbon([[x - s * .5, y], [x - s * .15, y + s * .38], [x + s * .52, y - s * .4]], s * .2, s * .2), { wash: XEROX.paper, ink: null });
  }
  // Who sings what (the checklist: the narrators sing their lines on screen, music-video style): verse 3 alternates, line
  // by line (the lyric's voice), and within "If we don't, then China will!" So that's the reason..." word by word
  // (wordVoice: her half, then his). In card person() lip-syncs its part (o.sing); outside card the chart doesn't run
  // (mouths.js lipsLive): the riso shots keep their acting mouths (V3a's word flaps, talk()), no lip-sync in riso (the
  // user, polish round).
  // mouth flaps on the words of a line (open on each word's start): V3a's acting mouths
  const talk = (t, prefix, n = 0) => { const l = LY(prefix, n); if (!l) return 0; for (const [a, b] of l.words) if (t >= a && t < Math.min(b, a + .2)) return 1; return 0; };
  const v3Voice = who => typeof lipPart === 'function' ? lipPart('v3 ' + who, (l, i) => !l.backing && l.section === 'Verse 3' && (l.wordVoice ? l.wordVoice[i] : l.voice) === who) : who;
  const V3_TESS = v3Voice('F'), V3_ROWAN = v3Voice('M');
  // The riso has no black drum: a figure's ground shadow (the rigs paint it as a wash of NOIR.ink) prints as a screen of
  // the blue drum over what's under it, as dark as the shadow is (verse1's v1RisoShadows). It printed as a flat
  // near-black ellipse under everyone in B1, V3a and V3c. Only in the riso look: card and bank inside these shots keep
  // their own shadows.
  function v3RisoShadows(draw) {
    const p0 = paint;
    paint = (P, o = {}) => {
      const pr = STYLE.mode === 'xerox' && XEROX.process, blue = pr && pr.find(d => d[0] === 'c'), pink = pr && pr.find(d => d[0] === 'm');
      if (!blue || o.wash !== NOIR.ink || o.ink !== null) return p0(P, o);
      const k = clamp((o.washOp ?? 255) / 150);   // (the blue drum full, a little pink under it: a deep blue-violet, the riso's own dark)
      halftone(P, .92 * k, blue[1], XEROX.cell, blue[2]); if (pink) halftone(P, .42 * k, pink[1], XEROX.cell, pink[2]);
    };
    try { draw(); } finally { paint = p0; }
  }
  const risoShot = f => (t, lt, dur) => v3RisoShadows(() => f(t, lt, dur));
  // beat helpers on the song's tempo map
  const bpo = t => bpOf(t), bfr = t => frac(bpOf(t));
  const hopY = (t, amt) => -amt * Math.sin(Math.PI * bfr(t));          // up between beats, down on each beat
  const landSq = (t, k = 8) => .14 * Math.exp(-bfr(t) * k);           // the squash on landing

  // ---------------------------------------------------------------------------------------------------------------
  // B1: the server-hall cathedral (the nave in one-point perspective; world = screen at zoom 1)
  // ---------------------------------------------------------------------------------------------------------------
  const NV = { vx: 960, vy: 400, x0: 700, x1: 1220, vault: 250, apex: 40, arcS: 480, arcA: 385, clS: 330, clA: 268, floor: 640 };
  const nx = (x, k) => NV.vx + (x - NV.vx) * k, ny = (y, k) => NV.vy + (y - NV.vy) * k, nP = (x, y, k) => [nx(x, k), ny(y, k)];
  const PIL = [1.22, 1.55, 2.0, 2.65, 3.6];                             // pillar depths (the bays between them)
  const BAYS = [[1.02, PIL[0]]].concat(PIL.slice(0, -1).map((k, i) => [k, PIL[i + 1]]));
  const STONE = '#D2CCBE', STONE_MD = '#BEB8AA', VAULT = '#A09A8C', AISLE = '#6A665E', RACK = '#6A6E78', RIB = '#DAD4C6';
  const KF = 4.6, PW = 34;                                              // the nave's front depth; pillar protrusion
  // a pointed (equilateral) arch from L to R at y = spring, apex rise above it, as a point list L → apex → R
  function lancet(L, R, spring, rise, n = 10) {
    const span = R - L, P = [];
    for (let i = 0; i <= n; i++) { const a = Math.PI - i / n * Math.PI / 3; P.push([R + Math.cos(a) * span, spring - Math.sin(a) * span]); }
    for (let i = n - 1; i >= 0; i--) { const a = i / n * Math.PI / 3; P.push([L + Math.cos(a) * span, spring - Math.sin(a) * span]); }
    const s = rise / (span * Math.sin(Math.PI / 3));
    return P.map(([x, y]) => [x, spring - (spring - y) * s]);
  }
  // an arch drawn in a side wall (x = wx): a lancet in the wall's own (depth, height) plane, projected. z = 1/k.
  function wallArch(wx, ka, kb, spring, apex, bottom, n = 10) {
    const za = 1 / ka, zb = 1 / kb, A = lancet(za, zb, spring, spring - apex, n);
    return [nP(wx, bottom, ka)].concat(A.map(([z, h]) => nP(wx, h, 1 / z)), [nP(wx, bottom, kb)]);
  }
  // a bay's two openings: the arcade arch (onto the aisle) and the clerestory lancet above it, inset from the pillars
  const bayIn = ([ka, kb], f) => { const za = 1 / ka, zb = 1 / kb; return [1 / lerp(za, zb, f), 1 / lerp(za, zb, 1 - f)]; };
  const arcadeP = (wx, bay) => { const [a, b] = bayIn(bay, .1); return wallArch(wx, a, b, NV.arcS, NV.arcA, NV.floor); };
  const clereP = (wx, bay) => { const [a, b] = bayIn(bay, .34); return wallArch(wx, a, b, NV.clS, NV.clA, NV.arcA - 34); };
  const backWall = () => [nP(NV.x0, NV.floor, 1)].concat(lancet(NV.x0, NV.x1, NV.vault, NV.vault - NV.apex, 14), [nP(NV.x1, NV.floor, 1)]);
  const vaultP = () => [[-300, -300], [W + 300, -300], nP(NV.x1, NV.vault, KF)].concat(lancet(NV.x0, NV.x1, NV.vault, NV.vault - NV.apex, 14).reverse(), [nP(NV.x0, NV.vault, KF)]);
  const pillarFace = (side, k) => { const wx = side < 0 ? NV.x0 : NV.x1, px = wx - side * PW, top = NV.vault - 6; return [nP(wx, top, k), nP(px, top, k), nP(px, NV.floor, k), nP(wx, NV.floor, k)]; };
  // the architecture, engraved (look('bank')): vault and ribs, the arcades and clerestory, pillars of server racks, the
  // altar wall with its rose-window fan. Light stone, so the riso night and light print over it.
  function naveArch(t) {
    // printed light and fine (the riso night does the darks): a background layer at a finer engraving scale
    bankLayer({ cap: .32, scale: .8, dens: (BANK.dens || 1) * .8 }, () => naveArchDraw(t));
  }
  function naveArchDraw(t) {
    const { x0, x1, vault, apex, floor } = NV;
    boilSeed('v3 nave');
    _paint(box(-200, -200, W + 200, H + 200), { wash: BANK.paper, ink: null });
    piece(vaultP(), VAULT, { ink: null, key: 'v3vault' });
    // the side walls: stone with string courses; arcade arches onto the aisles, lancet windows above
    for (const side of [-1, 1]) {
      const wx = side < 0 ? x0 : x1;
      piece([nP(wx, vault, 1), nP(wx, floor, 1), nP(wx, floor, KF), nP(wx, vault, KF)], STONE_MD, { sw: 1, key: 'v3wall' + side });
      dline([nP(wx, NV.arcA - 24, 1), nP(wx, NV.arcA - 24, KF)], 1.3, BANK.ink);
      dline([nP(wx, vault + 10, 1), nP(wx, vault + 10, KF)], 1.1, BANK.ink);
      BAYS.forEach((bay, i) => { piece(arcadeP(wx, bay), AISLE, { sw: 1.3, key: 'v3arc' + side + i }); piece(clereP(wx, bay), '#E8E4DA', { sw: 1.2, key: 'v3cl' + side + i }); });
    }
    // the transverse ribs of the vault, one per pillar, as pale stone bands
    for (const k of PIL) {
      const L = nx(x0 - PW, k), R = nx(x1 + PW, k), sp = ny(vault, k), ap = ny(apex, k);
      const A = lancet(L, R, sp, sp - ap, 12), w = 10 * k;
      piece(A.concat(A.slice().reverse().map(([x, y]) => [x, y + w])), RIB, { sw: 1, key: 'v3rib' + k });
    }
    // the altar wall: a tall pointed wall with the apse arch, and the rose-window fan above the altar
    piece(backWall(), STONE, { sw: 1.3, key: 'v3back' });
    piece(lancet(x0 + 90, x1 - 90, floor, floor - 170, 14), '#A8A294', { sw: 1.1, key: 'v3apse' });
    // pillars: tall stacks of server racks standing out from the walls (the face toward us, the side toward the nave)
    for (const side of [-1, 1]) for (const k of PIL) {
      const wx = side < 0 ? x0 : x1, px = wx - side * PW, k2 = k * .965, top = vault - 6;
      piece([nP(px, top, k), nP(px, top, k2), nP(px, floor, k2), nP(px, floor, k)], '#8A8E96', { sw: .9, key: 'v3ps' + side + k });
      piece(pillarFace(side, k), RACK, { sw: 1.1, key: 'v3pf' + side + k });
      for (let r = 1; r < 12; r++) { const y = lerp(top, floor, r / 12); dline([nP(wx, y, k), nP(px, y, k)], .6, BANK.ink); }
      piece([nP(wx + side * 10, top - 20, k), nP(px - side * 8, top - 20, k), nP(px - side * 8, top, k), nP(wx + side * 10, top, k)], RIB, { sw: .9, key: 'v3cap' + side + k });
    }
    // the floor (stone under the lit tiles)
    piece([nP(x0, floor, 1), nP(x1, floor, 1), nP(x1, floor, KF), nP(x0, floor, KF)], '#8E887C', { ink: null, key: 'v3floor' });
    // the rose window: a guilloche fan that turns a notch on every beat
    const rw = [NV.vx, 215, 100], rot = Math.floor(bpo(t)) * .21 + .06 * easeOut(clamp(bfr(t) * 4));
    piece(oval(rw[0], rw[1], rw[2] + 16, rw[2] + 16, 0, 48), '#A8A294', { sw: 1.2, key: 'v3rosefr' });
    piece(oval(rw[0], rw[1], rw[2], rw[2], 0, 48), '#F0EEE8', { sw: 1, key: 'v3rose' });
    guilloche(rw[0], rw[1], 24, rw[2] - 6, { n: 14, lobes: 9, w: .55, rot, twist: .3, beat: 3, steps: 220 });
    for (let i = 0; i < 9; i++) { const a = rot + i / 9 * TAU; dline([[rw[0] + Math.cos(a) * 18, rw[1] + Math.sin(a) * 18], [rw[0] + Math.cos(a + .35) * rw[2] * .96, rw[1] + Math.sin(a + .35) * rw[2] * .96]], 1.1, BANK.ink); }
    piece(oval(rw[0], rw[1], 16, 16, 0, 18), STONE_MD, { sw: .9, key: 'v3hub' });
  }
  // the riso night over the engraving: the vault, the aisles and the racks in the blue drum; the clerestory lancets as
  // stained glass (pink and yellow, pulsing), so the lit nave (paper) and the beams read as light
  // the side wall on the page, as a clip region: between its foot (the wall-floor line) and its top (where the vault
  // springs), the wall's plane from far to near. The pillars' riso night keeps to it.
  const wallBand = side => { const wx = side < 0 ? NV.x0 : NV.x1; return [nP(wx, NV.floor, .2), nP(wx, NV.floor, 12), nP(wx, NV.vault, 12), nP(wx, NV.vault, .2)]; };
  function naveNight(t, dim = 1) {
    const { x0, x1 } = NV, hit = Math.exp(-bfr(t) * 4);
    v3Spot(vaultP(), 'c', .36 * dim);
    for (const side of [-1, 1]) {
      const wx = side < 0 ? x0 : x1, WB = wallBand(side);
      BAYS.forEach((bay, i) => { v3Spot(arcadeP(wx, bay), 'c', .55 * dim); const C = clereP(wx, bay); v3Spot(C, (i + side) % 2 ? 'm' : 'y', .55 + .35 * hit); v3Spot(C, 'c', .25); });
      // (the rack pillars' night keeps to the wall: each face ran on to its own depth's floor line, a dark blue band over
      // the tiles, and up past the wall's top into the vault. The user: "the arches have shadows that should clip at the
      // bottom of the walls, but it bleeds into the floor", and "the same issue when they touch the arched roof")
      for (const k of PIL) v3Spot(clipConvex(pillarFace(side, k), WB), 'c', .5 * dim);
    }
    v3Spot([nP(x0, NV.floor, 1), nP(x1, NV.floor, 1), nP(x1, NV.floor, KF), nP(x0, NV.floor, KF)], 'c', .32 * dim);
  }
  // the racks' status lights: small riso squares in a column on each pillar face, chasing on the eighths
  function naveLEDs(t) {
    const bi = Math.floor(bpo(t) * 2), top = NV.vault - 6;
    for (const side of [-1, 1]) PIL.forEach((k, pi) => {
      const wx = side < 0 ? NV.x0 : NV.x1, a = wx - side * 8, b = wx - side * 17;
      for (let r = 0; r < 11; r++) {
        if ((r * 3 + pi * 5 + bi + (side > 0 ? 2 : 0)) % 4 > 1) continue;
        const y0 = lerp(top, NV.floor, (r + .38) / 12), y1 = lerp(top, NV.floor, (r + .58) / 12);
        v3Spot(clipConvex([nP(a, y0, k), nP(b, y0, k), nP(b, y1, k), nP(a, y1, k)], wallBand(side)), ['m', 'y', 'm'][(r + pi) % 3], .95);   // (on the wall, like the pillar's night)
      }
    });
  }
  // the dance floor's tiles (riso), lit in patterns that change on every beat
  const TILE_X = [], TILE_K = [];
  for (let i = 0; i <= 10; i++) TILE_X.push(lerp(NV.x0, NV.x1, i / 10));
  for (let j = 0; j <= 10; j++) TILE_K.push(1 / lerp(1, 1 / 4.4, j / 10));
  function naveFloor(t, big) {
    const bi = Math.floor(bpo(t)), hit = Math.exp(-bfr(t) * 5);
    for (let j = 0; j < 10; j++) for (let i = 0; i < 10; i++) {
      const Q = [nP(TILE_X[i], NV.floor, TILE_K[j]), nP(TILE_X[i + 1], NV.floor, TILE_K[j]), nP(TILE_X[i + 1], NV.floor, TILE_K[j + 1]), nP(TILE_X[i], NV.floor, TILE_K[j + 1])];
      const pat = big ? ((i + j + bi) % 2 ? bi % 2 : -1) : ((i * 7 + j * 3 + bi * 5) % 11 < 3 ? (i + j + bi) % 3 : -1);
      if (pat < 0) continue;
      v3Spot(Q, ['m', 'y', 'm'][pat], big ? .3 + .35 * hit : .4 + .4 * hit);
    }
    boilSeed('v3 tilelines');
    for (let i = 0; i <= 10; i++) dline([nP(TILE_X[i], NV.floor, 1), nP(TILE_X[i], NV.floor, 4.4)], .5, '#303030');
    for (let j = 0; j <= 10; j++) dline([nP(NV.x0, NV.floor, TILE_K[j]), nP(NV.x1, NV.floor, TILE_K[j])], .5, '#303030');
  }
  // moving-head beams from the vault: riso triangles that sweep on the beat (they overprint where they cross)
  const HEADS = [[560, 60, 'm', 0], [760, 20, 'y', 1], [1160, 20, 'y', 2], [1360, 60, 'm', 3], [960, 110, 'y', 4], [330, 170, 'm', 5], [1590, 170, 'y', 6]];
  function naveBeams(t, amt = 1, fan = 0) {
    const bp = bpo(t);
    for (const [hx, hy, ch, i] of HEADS) {
      const ph = bp * Math.PI / 2 + i * 1.7, sweep = lerp(Math.sin(ph) * (240 + 60 * (i % 3)), (i % 2 ? 1 : -1) * 520 * Math.sin(bp * Math.PI), fan);
      const tx = hx + sweep + (960 - hx) * .3, ty = 1100;
      const w = 46 + 24 * (i % 2) + 34 * Math.exp(-bfr(t) * 6), dx = tx - hx, dy = ty - hy, L = Math.hypot(dx, dy), nx0 = -dy / L, ny0 = dx / L;
      const P = [[hx - nx0 * 4, hy - ny0 * 4], [hx + nx0 * 4, hy + ny0 * 4], [tx + nx0 * w, ty + ny0 * w], [tx - nx0 * w, ty - ny0 * w]];
      v3Spot(P, ch, (.34 + .26 * Math.exp(-bfr(t) * 4)) * amt);
    }
  }
  // the crowd at the back: flat riso silhouettes of bots (one drum, blue), bouncing out of step; o.up: all arms up
  function crowd(t, y0, n, u, seed, x0 = NV.x0 - 40, x1 = NV.x1 + 40, allUp = false) {
    const SP = { spot: { channel: 'c', tone: .9 }, ink: null };
    for (let i = 0; i < n; i++) {
      const h = hash(seed * 31 + i), x = lerp(x0, x1, (i + .5) / n) + (hash(i * 7 + seed) - .5) * 26;
      const ph = allUp ? .05 * h : hash(i * 3.3 + seed) * .45, f = frac(bpo(t) + ph), up = Math.sin(Math.PI * f) * u * (allUp ? 1.1 : .4 + .9 * h), y = y0 + (hash(i * 5 + seed) - .5) * 16 - up;
      const armsUp = allUp || (i + Math.floor(bpo(t) + ph)) % 3 !== 1;
      boilSeed('v3 crowd' + seed + i);
      const P = curvy([[x - 1.4 * u, y + 3 * u], [x - 1.2 * u, y - .4 * u], [x, y - 1.1 * u], [x + 1.2 * u, y - .4 * u], [x + 1.4 * u, y + 3 * u]], 4);
      piece(P, '#2A3A80', { ...SP, key: 'v3cr' + seed + i });
      const kind = Math.floor(h * 5);
      piece(kind === 1 ? box(x - .95 * u, y - 2.9 * u, x + .95 * u, y - 1.1 * u) : oval(x, y - 2 * u, 1.05 * u, 1 * u, 0, 16), '#2A3A80', { ...SP, key: 'v3ch' + seed + i });
      if (kind === 0) piece(ribbon([[x, y - 2.8 * u], [x + .3 * u, y - 3.7 * u]], .18 * u, .14 * u), '#2A3A80', { ...SP, key: 'v3ca' + seed + i });
      if (kind === 2) for (const [bx, by, br] of [[-.62, -2.7, .52], [0, -3.02, .56], [.62, -2.7, .52]]) piece(oval(x + bx * u, y + by * u, br * u, br * .9 * u, 0, 12), '#2A3A80', { ...SP, key: 'v3ce' + seed + i + bx });   // (Codey's cloud head)
      if (kind === 3) piece(starPts(x, y - 3.5 * u, .55 * u, .35, 4), '#2A3A80', { ...SP, key: 'v3cs' + seed + i });
      if (kind === 4) piece(oval(x, y - 3.3 * u, 1.3 * u, .35 * u, 0, 14), '#2A3A80', { ...SP, key: 'v3cc' + seed + i });
      const sw = Math.sin((bpo(t) + ph) * Math.PI);
      if (armsUp) for (const s of [-1, 1]) piece(ribbon([[x + s * .9 * u, y - .1 * u], [x + s * (1.7 + .3 * sw * s) * u, y - 1.9 * u], [x + s * (1.5 + .4 * sw * s) * u, y - 3.4 * u]], .36 * u, .3 * u), '#2A3A80', { ...SP, key: 'v3cm' + seed + i + s });
      // eyes: two paper-white pie-cut slits (the crowd are bots, too)
      if (u > 7) for (const s of [-1, 1]) { const ex = x + s * .38 * u, ey = y - 2.1 * u; _paint(oval(ex, ey, .17 * u, .26 * u, 0, 10), { wash: XEROX.paper, ink: null }); }
    }
  }

  // ---- the dancers (riso) ----
  const ALTAR = { x0: 860, x1: 1060, top: 598, floor: NV.floor };
  // the altar dais: a stack of server racks with steps, at the apse
  function altar(t) {
    const { x0, x1, top, floor } = ALTAR;
    boilSeed('v3 altar');
    piece(box(x0 - 30, top + 28, x1 + 30, floor + 4), '#4A4E5A', { sw: 1, key: 'v3step' });
    piece(box(x0, top, x1, top + 30), '#3A3E4A', { sw: 1, key: 'v3dais' });
    for (let i = 0; i < 9; i++) dline([[x0 - 22 + i * (x1 - x0 + 44) / 8, top + 32], [x0 - 22 + i * (x1 - x0 + 44) / 8, floor]], .6, '#20242E');
  }
  // Grok on the decks at the altar: one hand scratching, the other pumping on the beat (both up on the hook)
  function djBooth(t, part, uni = 0) {
    const cx = NV.vx, fy = ALTAR.top + 2, u = 18;
    if (part === 'back') {
      const pump = Math.exp(-bfr(t) * 5), bi = Math.floor(bpo(t)), up = uni > .5 || bi % 8 >= 6, sc = Math.sin(bpo(t) * TAU * 2);
      grok(cx, fy, u, { ...feel('excited', t), mouth: 'laugh', eyes: 'happy', emote: null, pose: { L: up ? [-2.5, -8.8 + pump * .6, .2, 'open', 1] : [-1.5 + .4 * sc, -3.9, .25, 'open', 1], R: [2.4, -8.6 + 1.2 * (1 - pump), .15, up ? 'open' : 'fist', 1] }, dy: -.3 * pump, boilKey: 'v3grok', bounce: 1.4 });
      return;
    }
    // the console in front of him: a rack laid on its side, two turntables, a row of chasing lights
    boilSeed('v3 booth');
    const x0 = cx - 108, x1 = cx + 108, y0 = fy - 52, y1 = fy + 4;
    piece(box(x0, y0, x1, y1), '#2E3240', { sw: 1.1, key: 'v3booth' });
    piece(box(x0 - 8, y0 - 10, x1 + 8, y0), '#5A5E6A', { sw: 1, key: 'v3boothtop' });
    const lit = Math.floor(bpo(t) * 2);
    for (let i = 0; i < 11; i++) if ((i + lit) % 4 === 0) v3Spot(box(x0 + 14 + i * 18, y0 + 18, x0 + 24 + i * 18, y0 + 26), i % 2 ? 'm' : 'y', .95);
    for (const s of [-1, 1]) { const tx = cx + s * 66, a = bpo(t) * Math.PI * .5 * s; piece(oval(tx, y0 - 13, 32, 7, 0, 20), '#1E2230', { sw: .9, key: 'v3tt' + s }); dline([[tx, y0 - 13], [tx + Math.cos(a) * 28, y0 - 13 + Math.sin(a) * 6]], .9, '#E0E0E0'); }
  }
  // the Gemini twins: a mirrored disco point, up-out on the beat, down-across on the next; they sway apart and back
  function twins(t, x, y, u, uni = 0, o = {}) {
    const bp = bpo(t), f = frac(bp), bi = Math.floor(bp), up = bi % 2 === 0, k = backOut(clamp(f * 3.2));
    const Oa = up ? [-2.7, -5.4, .1, 'point', 0] : [-.2, -1.5, .3, 'point', 1], Ob = up ? [-.2, -1.5, .3, 'point', 1] : [-2.7, -5.4, .1, 'point', 0];
    const O = [lerp(Ob[0], Oa[0], k), lerp(Ob[1], Oa[1], k), .2, 'point', Oa[4]];
    const sway = Math.sin(bp * Math.PI / 2);
    if (uni > .5) { gemini(x, y, u, { ...feel('excited', t), emote: null, pose: 'cheer', gap: 4.8, dy: hopY(t, 1.6), sq: landSq(t), boilKey: 'v3gem', bounce: 1, ...o }); return; }
    gemini(x, y, u, { ...feel('happy', t), emote: null, pose: { O, I: 'join' }, gap: 4.6 + .6 * sway, dx: .3 * sway, rot: .05 * Math.sin(bp * Math.PI), boilKey: 'v3gem', bounce: 1, ...o });
  }
  // the Codex gang: a line of hops, the wave running along it on the sixteenths
  function gang(t, x, y, u, gapU, uni = 0, o = {}) {
    CX_KINDS.forEach((kind, i) => {
      const tt = uni > .5 ? t : t - i * BEAT * .25, f = bfr(tt), hop = Math.sin(Math.PI * f), bi = Math.floor(bpo(tt));
      codex(x + (i - 2) * gapU * u, y + (i % 2) * 6, u, { kind, ...feel('excited', tt), emote: null, pose: uni > .5 || (bi + i) % 2 ? 'cheer' : 'idle', aL: 1.3, aR: 1.3, dy: -(uni > .5 ? 1.5 : 1.1) * hop, sq: .15 * Math.exp(-f * 8) - .08 * hop, flip: i > 2, t: tt, boilKey: 'v3cx' + i, bounce: 1, ...o });
    });
  }
  // Copilot, the mimic: the twins' disco point, half a beat late and with the wrong arm, trying very hard
  function mimic(t, x, y, u, uni = 0, o = {}) {
    if (uni > .5) { copilot(x, y, u, { ...feel('excited', t), emote: null, pose: 'cheer', dy: hopY(t - BEAT * .12, 1.3), sq: landSq(t - BEAT * .12), boilKey: 'v3cop', flip: true, bounce: 1, ...o }); return; }
    const tl = t - BEAT * .5, bp = bpo(tl), f = frac(bp), bi = Math.floor(bp), up = bi % 2 === 0, k = backOut(clamp(f * 3.2));
    const Ra = up ? [2.9, -6.6, .1, 'point', 1] : [.3, -2.3, .3, 'point', 1], Rb = up ? [.3, -2.3, .3, 'point', 1] : [2.9, -6.6, .1, 'point', 1];
    copilot(x, y, u, { ...feel('excited', t), emote: null, eyes: 'wide', mouth: 'open', pose: { L: [-1.8, -2.4, .3, 'fist'], R: [lerp(Rb[0], Ra[0], k), lerp(Rb[1], Ra[1], k), .2, 'point', 1] }, walk: bp / 2, rot: -.05 * Math.sin(bp * Math.PI), lookX: -.8, flip: true, boilKey: 'v3cop', bounce: 1, ...o });
  }
  // Clawd: a four-footed tap dance (the feet on the sixteenths), arms flung up on the downbeats
  function clawdTap(t, x, y, u, uni = 0, o = {}) {
    const bp = bpo(t), f = frac(bp), down = uni > .5 || Math.floor(bp) % 4 === 0;
    clawd2(x, y, u, { ...feel('happy', t), emote: null, eyes: 'happy', mouth: 'grin', walk: uni > .5 ? null : bp * 2, aL: down ? 1.35 : .4 + .5 * Math.sin(bp * TAU), aR: down ? 1.35 : .4 - .5 * Math.sin(bp * TAU), dy: uni > .5 ? hopY(t, 1.2) : -.5 * Math.sin(Math.PI * f), sq: .12 * Math.exp(-f * 8), view: 'q', boilKey: 'v3clawd', bounce: 1, ...o });
  }
  // Muse hovers over the crowd like a mirror ball, arms up, turning
  function museBall(t, x, y, u, uni = 0, o = {}) {
    const bp = bpo(t);
    muse(x, y, u, { ...feel('happy', t), emote: null, pose: { L: [-2.7, -1.8 + .4 * Math.sin(bp * TAU), .2, 'open'], R: [2.7, -1.8 - .4 * Math.sin(bp * TAU), .2, 'open'] }, alt: 8.5, noShadow: true, rot: .08 * Math.sin(bp * Math.PI / 2), boilKey: 'v3muse', bounce: 1, ...o });
  }

  // The whole interior at time t (world coordinates; the caller's camera frames it). uni 0..1: everyone on the hook.
  // lite: seen small through the window from outside (the architecture and the crowd, no featured dancers).
  const DBG = new URLSearchParams(location.search).get('v3dbg') || '';
  // where the featured dancers stand: spread over the floor for the tour, a chorus line for the hook
  const LAY = { clawd: [440, 1000, 22], gang: [720, 885, 19, 2.8], twins: [1250, 880, 24], cop: [1580, 1005, 27], muse: [1290, 700, 14] };
  // (the chorus line drawn in from the ends: the hook's push cropped Clawd and Copilot at the frame's edges)
  const LAYU = { clawd: [535, 1012, 21], gang: [872, 1000, 18, 4.1], twins: [1235, 1008, 24], cop: [1432, 1012, 26], muse: [1300, 690, 14] };
  // confetti (riso scraps) from the bar-96 drop: each piece falls and flutters from a fixed start, a pure function of t
  function confetti(t, t0) {
    if (t < t0) return;
    const a = t - t0;
    for (let i = 0; i < 90; i++) {
      const born = hash(i * 1.3) * .8; if (a < born) continue;
      const age = a - born, x0 = 200 + hash(i * 2.7) * 1520, y = -40 + age * (260 + 160 * hash(i * 3.1)), x = x0 + 40 * Math.sin(age * 5 + i);
      if (y > 1120) continue;
      const r = 11 + 8 * hash(i * 4.3), th = age * (6 + 4 * hash(i)) + i, fl = Math.cos(th);
      v3Spot([[x - r, y - r * .5 * fl], [x + r, y - r * .5 * fl + 2], [x + r, y + r * .5 * fl], [x - r, y + r * .5 * fl]], ['m', 'y', 'c'][i % 3], .9);
    }
  }
  function raveInterior(t, o = {}) {
    const uni = o.uni || 0, lite = !!o.lite;
    look('bank');
    if (!DBG.includes('noarch')) naveArch(t);
    if (DBG.includes('onlyarch')) return;
    look('xerox');
    cpXeroxDraw(() => {
      naveNight(t);
      naveLEDs(t);
      naveFloor(t, uni > .5);
      naveBeams(t, 1 - .15 * uni, uni * .6);
      altar(t);
      djBooth(t, 'back', uni); djBooth(t, 'front', uni);
      crowd(t, 700, 12, 9, 1, NV.x0 + 10, NV.x1 - 10, uni > .5);
      crowd(t, 752, 11, 11, 2, NV.x0 - 60, NV.x1 + 60, uni > .5);
      if (lite) return;
      const L = uni > .5 ? LAYU : LAY;
      museBall(t, ...L.muse, uni);
      gang(t, ...L.gang, uni);
      twins(t, ...L.twins, uni);
      clawdTap(t, ...L.clawd, uni);
      mimic(t, ...L.cop, uni);
      confetti(t, B1T.big);
    });
  }

  // ---- B1's timeline (song time) ----
  const B1T = {
    t0: BAR(91), tour: [BAR(92), BAR(93), BAR(94)], uni: BAR(95), big: BAR(96), out: [BAR(96), BAR(96) + .62], ext: BAR(97), end: BAR(98),
  };
  // the interior camera: [cx, cy, zoom] at song time t
  function b1Cam(t) {
    const T = B1T, wide = [960, 540, 1], stops = [[600, 860, 1.85], [960, 480, 1.95], [1400, 870, 1.65]];
    if (t < T.tour[0] - BEAT * .6) return [960, 540 - 10 * seg(t, T.t0, T.tour[0]), 1 + .03 * seg(t, T.t0, T.tour[0])];
    if (t < T.uni) {
      // push in to the first stop, then whip to the next on the last half-beat of each bar (landing on the downbeat)
      const keys = [[T.tour[0] - BEAT * .6, wide], [T.tour[0], stops[0]], [T.tour[1] - BEAT * .45, stops[0]], [T.tour[1], stops[1]], [T.tour[2] - BEAT * .45, stops[1]], [T.tour[2], stops[2]]];
      let i = 0; while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
      if (i + 1 >= keys.length) { const d = seg(t, T.tour[2], T.uni); return [stops[2][0] + 20 * d, stops[2][1], stops[2][2] * (1 + .04 * d)]; }
      const [ta, A] = keys[i], [tb, B] = keys[i + 1], k = A === B ? 0 : (x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)(seg(t, ta, tb));
      const drift = A === B ? seg(t, ta, tb) : 0;
      const z = Math.exp(lerp(Math.log(A[2]), Math.log(B[2]), k)) * (1 + .03 * drift);
      return [lerp(A[0], B[0], k) + 14 * drift, lerp(A[1], B[1], k), z];
    }
    // the hook: back to the wide, a slow push toward the altar, a kick on every downbeat
    const d = ease(seg(t, T.uni, T.out[0] + BEAT)), kick = Math.exp(-frac(barOf(t)) * 14) * .015;
    return [960, lerp(790, 760, d), lerp(1.5, 1.62, d) + kick];
  }

  // ---------------------------------------------------------------------------------------------------------------
  // outside: the cathedral's flank in the rain (engraved), the rave through its window, the two of them (riso)
  // ---------------------------------------------------------------------------------------------------------------
  const WIN = { x: 240, y: 330, w: 620, h: 348.75, apex: 400 };   // the window's glazing: a 16:9 light under a pointed head
  WIN.cx = WIN.x + WIN.w / 2; WIN.cy = WIN.y + WIN.h / 2;
  const DOOR = { x: 975, w: 200, spring: 540, apex: 100 };       // the side door (a pointed arch from the plinth up)
  DOOR.cx = DOOR.x + DOOR.w / 2;
  // (her to the right of the gate's reader, clear of it: stood in front of it she hid its red cross, the gate's no)
  const EXT = { her: [1335, 1062, 38], him: [770, 1066, 42], base: 800 };
  function winShape(inset = 0) {
    const { x, y, w, h, apex } = WIN, L = x - inset, R = x + w + inset, B = y + h + inset;
    return [[L, B]].concat(lancet(L, R, y, apex + inset * .6, 14), [[R, B]]);
  }
  // the facade (bank): ashlar, a buttress, the window's moulded surround and sill, the plinth
  // the wall around the window's glazing, as four boxes (drawn after the view through the glass, they mask its spill)
  const aroundWin = (x0 = -300, y0 = -300, x1 = W + 300, y1 = EXT.base + 40) => [box(x0, y0, x1, WIN.y), box(x0, WIN.y + WIN.h, x1, y1), box(x0, WIN.y, WIN.x, WIN.y + WIN.h), box(WIN.x + WIN.w, WIN.y, x1, WIN.y + WIN.h)];
  const inGlass = (x, y) => x > WIN.x && x < WIN.x + WIN.w && y > WIN.y && y < WIN.y + WIN.h;
  function facade(t) {
    boilSeed('v3 facade');
    aroundWin().forEach((B, i) => piece(B, '#C4BEB0', { ink: null, key: 'v3wallx' + i }));
    // ashlar courses (staggered joints), kept off the glass
    for (let r = 0; r < 14; r++) {
      const y = -40 + r * 62; if (y > EXT.base) break;
      if (!vis(-100, y - 2, W + 100, y + 64)) continue;
      if (y > WIN.y && y < WIN.y + WIN.h) { if (vis(-100, y - 2, WIN.x, y + 2)) dline([[-100, y], [WIN.x, y]], .8, BANK.ink); if (vis(WIN.x + WIN.w, y - 2, W + 100, y + 2)) dline([[WIN.x + WIN.w, y], [W + 100, y]], .8, BANK.ink); }
      else dline([[-100, y], [W + 100, y]], .8, BANK.ink);
      for (let c = 0; c < 8; c++) { const x = -60 + c * 300 + (r % 2) * 150 + 40 * hash(r * 3 + c); if (!inGlass(x, y + 31) && vis(x - 2, y, x + 2, y + 62)) dline([[x, y], [x, y + 62]], .7, BANK.ink); }
    }
    // buttresses
    for (const [bx, bw] of [[-60, 110], [1196, 40], [1900, 110]]) {
      if (!vis(bx - 20, -200, bx + bw + 20, EXT.base + 20)) continue;
      piece(box(bx, -200, bx + bw, EXT.base + 20), '#B2AC9E', { sw: 1.2, key: 'v3butt' + bx });
      piece([[bx - 14, 560], [bx + bw + 14, 560], [bx + bw + 14, 600], [bx - 14, 620]], '#D0CABC', { sw: 1, key: 'v3buttc' + bx });
    }
    // the plinth and the pavement's kerb
    piece(box(-300, EXT.base, W + 300, EXT.base + 36), '#A49E90', { sw: 1.2, key: 'v3plinth' });
  }
  // the window's reveal: moulded stone round the glazing and its head (never over the glass), and the sill
  function reveal(t) {
    const { x, y, w, h, apex } = WIN, R = 34;
    boilSeed('v3 reveal');
    piece([[x - R, y]].concat(lancet(x - R, x + w + R, y, apex + R * .6, 16), [[x + w + R, y]]), '#E2DCCC', { sw: 1.2, key: 'v3revh' });
    piece(box(x - R, y, x, y + h), '#E2DCCC', { sw: 1.1, key: 'v3revl' });
    piece(box(x + w, y, x + w + R, y + h), '#E2DCCC', { sw: 1.1, key: 'v3revr' });
    piece(box(x - R - 26, y + h, x + w + R + 26, y + h + 30), '#D6D0C2', { sw: 1.1, key: 'v3sill' });
  }
  // the window's head (above the 16:9 light): coloured glass lit by the rave, then the stone tracery over it
  function windowHead(t) {
    const { x, y, w, apex } = WIN, P = lancet(x, x + w, y, apex, 16), hit = Math.exp(-bfr(t) * 4);
    _paint(P, { wash: XEROX.paper, ink: null }); v3Spot(P, 'c', .3); v3Spot(P, 'm', .4 + .35 * hit);
    v3Spot(oval(WIN.cx, y - apex * .45, apex * .2, apex * .2, 0, 24), 'y', .8);
  }
  // the stonework of the window seen against the lit glass: dark (the night side of the stone), printed in the blue drum
  function tracery(t, bars = 1) {
    boilSeed('v3 tracery');
    const { x, y, w, h, apex } = WIN, cx = WIN.cx, D = { ink: null, spot: { channel: 'c', tone: .92 } };
    const bar = (P, wd, key) => piece(ribbon(P, wd, wd), '#1E2A5A', { ...D, key });
    bar([[x - 6, y], [x + w + 6, y]], 16, 'v3transom');
    const cy = y - apex * .42, r1 = apex * .2, r2 = apex * .13;
    bar(oval(cx, cy, r1, r1, 0, 36).concat([[cx + r1, cy]]), 12, 'v3roundel');
    for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + Math.PI / 4; piece(oval(cx + Math.cos(a) * r2 * .6, cy + Math.sin(a) * r2 * .6, r2 * .52, r2 * .52, 0, 18), '#1E2A5A', { ...D, spot: { channel: 'c', tone: .5 }, key: 'v3foil' + i }); }
    for (const s of [-1, 1]) { const L = s < 0 ? x : cx, R = s < 0 ? cx : x + w; bar(lancet(L, R, y, apex * .55, 12), 10, 'v3sub' + s); }
    bar([[cx, y], [cx, cy + r1]], 12, 'v3midm');
    // the light's mullions: only once we're outside (they'd bar the view as we pull back through)
    if (bars > .02) for (const f of [1 / 3, 2 / 3]) bar([[x + w * f, y], [x + w * f, y + h]], 11 * bars, 'v3mull' + f);
  }
  // rain: streaks falling across the frame (a pure function of t). Over the dark night they're knocked out of the ink
  // (the paper showing through); over the bright window they print dark. Splashes on the pavement. lit(x, y): where the
  // streaks print dark (default: the club's window; true, or the streak's colour); base: the splashes land from base + 60 down.
  const inClubWin = (x, y) => x > WIN.x && x < WIN.x + WIN.w && y > WIN.y - WIN.apex && y < WIN.y + WIN.h;
  function rain(t, amt = 1, knock = true, lit = inClubWin, base = EXT.base) {
    boilSeed('v3 rain');
    const n = Math.round(100 * amt);
    for (let i = 0; i < n; i++) {
      const sp = 1600 + 600 * hash(i * 2.3), x0 = hash(i * 1.7) * (W + 300) - 60, len = 40 + 50 * hash(i * 4.1);
      const y = ((hash(i * 3.9) * (H + 300) + t * sp) % (H + 300)) - 150, x = x0 - (y + 150) * .16;
      if (!vis(x - 20, y, x + 20, y + len)) continue;
      const lc = lit(x, y);
      if (lc === true) dline([[x, y], [x - .16 * len, y + len]], .9, '#34426E');
      else if (lc) _inkLine([[x, y], [x - .16 * len, y + len]], .6, lc, 'ink', 0);
      else if (knock) _inkLine([[x, y], [x - .16 * len, y + len]], .8 + .6 * hash(i), '#E8E6F2', 'ink', 0);
    }
    for (let i = 0; i < 22 * amt; i++) {
      const c = Math.floor(t * 3 + hash(i * 5.3)), life = frac(t * 3 + hash(i * 5.3)), x = hash(i * 7.7 + c) * W, y = base + 60 + 250 * hash(i * 2.9 + c);
      if (life > .3) continue;
      const r = 5 + 20 * life; _inkLine([[x - r, y], [x - r * .45, y - r * .6]], .8, '#E8E6F2', 'ink', 0); _inkLine([[x + r, y], [x + r * .45, y - r * .6]], .8, '#E8E6F2', 'ink', 0);
    }
  }
  // the wet pavement (riso): flagstones, the window's light smeared in the puddles
  function pavement(t, strobe = 0) {
    boilSeed('v3 pave');
    piece(box(-300, EXT.base + 36, W + 300, H + 300), '#3E4460', { sw: 1, key: 'v3pave' });
    for (let r = 0; r < 5; r++) { const y = EXT.base + 70 + r * 58 + r * r * 8; dline([[-100, y], [W + 100, y + 4]], .7, '#20283A'); }
    const hit = Math.exp(-bfr(t) * 4);
    for (let i = 0; i < 5; i++) for (let j = 0; j < 7; j++) {
      const cx = WIN.x + 60 + i * (WIN.w - 120) / 4 + 10 * Math.sin(j * 1.9 + i * 2 + t * 4), y = EXT.base + 58 + j * 26 + 4 * hash(i + j * 3), wd = (48 - j * 4) * (.7 + .5 * hash(i * 3 + j)), ht = 5 + 2 * hash(j + i);
      v3Spot(oval(cx, y, wd, ht, 0, 14), ['m', 'y', 'm', 'c', 'y'][i], (.55 + .3 * hit + .3 * strobe) * (1 - j * .1));
    }
  }
  // the view through the window: the interior, scaled into the glazing's 16:9 light
  function throughWindow(t, o = {}) {
    push(); translate(WIN.x, WIN.y); scale(WIN.w / W);
    push(); translate(W / 2, H / 2); const ic = o.cam || [960, 540, 1]; scale(ic[2]); translate(-ic[0], -ic[1]);
    raveInterior(t, { uni: o.uni ?? 1, lite: o.lite });
    pop();
    pop();
  }

  // the side door: a pointed arch; its oak leaves open inward to the lit hall; a steel access gate stands across it
  const doorArch = (ins = 0) => [[DOOR.x - ins, EXT.base + 2]].concat(lancet(DOOR.x - ins, DOOR.x + DOOR.w + ins, DOOR.spring, DOOR.apex + ins * .6, 12), [[DOOR.x + DOOR.w + ins, EXT.base + 2]]);
  function doorFrame(t) {
    boilSeed('v3 door');
    piece(doorArch(30), '#B8B2A4', { sw: 1.2, key: 'v3doorfr' });
    piece(doorArch(14), '#D4CEC0', { sw: 1.1, key: 'v3doorfr2' });
  }
  // The side door, drawn over the wall's night (it was drawn under it, and the night's blue screen hid it: there was no
  // door until it was open, a lit arch popping in on one frame): the stone frame (engraved, the night printed over it a
  // shade lighter than the wall), and two oak leaves, each half the pointed arch, hinged at its jamb. open 0..1: the
  // leaves swing in (foreshortening toward their jambs, the far edge shortening) and the hall's light shows between them;
  // fill() draws what stands in the opening (Copilot).
  const DOOR_ARC = () => lancet(DOOR.x, DOOR.x + DOOR.w, DOOR.spring, DOOR.apex, 12);
  // leaf sd (-1 left, 1 right) at open e: its outline, and its plank lines
  function doorLeaf(sd, e) {
    const A = DOOR_ARC(), half = DOOR.w / 2, j = sd < 0 ? DOOR.x : DOOR.x + DOOR.w, my = (EXT.base + DOOR.spring - DOOR.apex) / 2;
    const arc = sd < 0 ? A.slice(0, 13) : A.slice(12).reverse();   // (jamb at the spring → apex)
    const sw = p => { const f = Math.abs(p[0] - j) / half; return [j + (p[0] - j) * lerp(1, .16, e), my + (p[1] - my) * (1 - .08 * e * f)]; };
    const P = [[j, EXT.base]].concat(arc, [[DOOR.cx, EXT.base]]).map(sw);
    const topAt = x => { for (let i = 1; i < arc.length; i++) { const a = arc[i - 1], b = arc[i]; if ((x - a[0]) * (x - b[0]) <= 0 && a[0] !== b[0]) return lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0])); } return DOOR.spring; };
    const planks = [.26, .52, .77].map(f => { const px = j - sd * half * f; return [sw([px, EXT.base]), sw([px, topAt(px) + 3])]; });
    return { P, planks };
  }
  function doorway(t, open, fill) {
    const hit = Math.exp(-bfr(t) * 4), A = doorArch(0), e = ease(clamp(open));
    look('bank'); bankLayer({ cap: .4, scale: .8 }, () => doorFrame(t));
    look('xerox'); v3Spot(doorArch(30), 'c', .42); v3Spot(doorArch(30), 'm', .1);
    if (open > .01) {
      _paint(A, { wash: XEROX.paper, ink: null }); v3Spot(A, 'm', .35 + .3 * hit); v3Spot(A, 'y', .3);
      if (fill) fill(A);
    }
    for (const sd of [-1, 1]) {
      const L = doorLeaf(sd, e);
      look('bank'); bankLayer({ cap: .4, scale: .8 }, () => { boilSeed('v3 leaf' + sd); piece(L.P, '#7A6A58', { sw: 1.1, key: 'v3leaf' + sd }); for (const pl of L.planks) dline(pl, .7, BANK.ink); });
      look('xerox'); v3Spot(L.P, 'c', .72 + .1 * e); v3Spot(L.P, 'm', .34); v3Spot(L.P, 'y', .18);   // (dark oak in the night, darker than the stone)
      boilSeed('v3 planks' + sd); for (const pl of L.planks) dline(pl, .8, '#141C40'); dline(L.P.concat([L.P[0]]), 1.1, '#141C40');
    }
  }
  // the access gate: steel bars across the doorway, a crossbar, and a reader with a padlock pictogram; o.rattle 0..1,
  // o.deny 0..1 (the red cross pops over the reader)
  // the access gate: a waist-high speed gate across the doorway: two steel posts, glass flaps that stay shut, and a card
  // reader on the right post with a padlock pictogram; rattle 0..1 (Copilot pushes the flaps), deny 0..1 (the red cross)
  const GATE = { lock: [DOOR.x + DOOR.w + 6, 648], top: 650 };
  function gate(t, rattle = 0, deny = 0) {
    look('xerox'); boilSeed('v3 gate');
    const sh = rattle > 0 ? Math.sin(t * 70) * 4 * rattle : 0, D = '#3A4054', gt = GATE.top;
    for (const px of [DOOR.x - 14, DOOR.x + DOOR.w - 12]) { piece(box(px, gt - 10, px + 26, EXT.base + 4), D, { sw: 1, key: 'v3gp' + px }); piece(box(px - 4, gt - 18, px + 30, gt - 8), '#5A6074', { sw: .9, key: 'v3gpt' + px }); }
    // the glass flaps meeting in the middle (they flex a little when pushed)
    for (const sd of [-1, 1]) {
      const j = sd < 0 ? DOOR.x + 12 : DOOR.x + DOOR.w - 12, m = DOOR.cx + sh * 2 - sd * 2, fx = m;
      const P = [[j, gt + 6], [fx, gt + 14 - 8 * rattle], [fx, gt + 110], [j, gt + 104]];
      _paint(P, { wash: XEROX.paper, ink: null }); v3Spot(P, 'c', .22);
      dline(P.concat([P[0]]), 1.2, '#2A3044');
      dline([lerpP(P[0], P[1], .2), lerpP(P[3], P[2], .35)], .8, '#6A7A9A');
    }
    const [lx, ly] = GATE.lock;
    piece(box(lx - 22, ly - 30, lx + 22, ly + 30), '#4A5064', { sw: 1, key: 'v3reader' });
    piece(box(lx - 15, ly - 22, lx + 15, ly + 6), deny > .05 ? '#FF4F9A' : '#9FE8E0', { ink: null, key: 'v3readscr' });
    dline(oval(lx, ly - 10, 6, 7, 0, 12).slice(6, 13), 2, '#141414');
    piece(box(lx - 8, ly - 10, lx + 8, ly + 2), '#1E2A5A', { ink: null, key: 'v3padlock' });
    if (deny > 0) bsDenied(lx, ly - 64, 60, deny, 'v3deny');
  }
  // a rave flyer (riso), held: flat (roll 0) or rolled into a cone (roll 1), bell along +x, gripped about halfway along
  // (its mouthpiece reaches back past the fist to her lips: gripped at the mouthpiece, the fist sat in front of her mouth
  // and the cone stood off it)
  function flyer(s, roll = 0, key = 'v3fly') {
    const r = ease(clamp(roll)), fl = [[-.35, -.95], [.95, -.95], [.95, .95], [-.35, .95]].map(([a, b]) => [a * s, b * s]);
    const cone = [[-1.85 * s, -.12 * s], [1.6 * s, -.68 * s], [1.72 * s, 0], [1.6 * s, .68 * s], [-1.85 * s, .12 * s]];
    const P = r < .5 ? fl.map((p, i) => lerpP(p, cone[Math.min(i + (i > 1 ? 1 : 0), 4)], r * 2 * .9)) : cone.map((p, i) => lerpP(fl[Math.min(i, 3)], p, lerp(.9, 1, (r - .5) * 2)));
    piece(P, '#F4ECDC', { sw: clamp(s / 20, .6, 1.6), key: key + 'p' });
    if (r < .6) { const k = 1 - r / .6; v3Spot(oval(.3 * s, -.2 * s, .5 * s * k + 1, .42 * s * k + 1, 0, 14), 'm', .8); v3Spot(starPts(.55 * s, .45 * s, .3 * s * k + 1, .4, 5), 'y', .9); }
    else { v3Spot(P, 'm', .45); dline([[-.3 * s, -.15 * s], [1.2 * s, -.48 * s]], 1, '#222'); }
  }
  // Copilot at the glass (inside, its lower body hidden by the wall) or in the doorway
  function copilotAt(t, x, y, u, o) { look('xerox'); cpXeroxDraw(() => copilot(x, y, u, { boilKey: 'v3copx', ...o })); }

  // the two of them, in riso (him by the window, her by the door); o.her / o.him: person() options
  function narrators(t, o = {}) {
    const [hx, hy, hu] = EXT.her, [mx, my, mu] = EXT.him;
    look('xerox');
    cpXeroxDraw(() => {
      person(mx + (o.himDx ?? o.him?.dxPx ?? 0), my, mu, HIM_C, { view: 'q', flip: true, ...o.him, boilKey: 'v3him' });
      person(hx + (o.herDx || 0), hy, hu, HER_C, { view: 'q', flip: true, ...o.her, boilKey: 'v3her' });
    });
  }
  // the whole exterior (world coords): the view through the window, Copilot at the glass, the facade at night, the
  // door and its gate, the window's head, the pavement, the two of them, the rain. (The race's billboard that hung on
  // this wall is gone: the race is on a bookie's screen across the road, V3a.)
  // o: cam/uni/lite (the view), bars (mullions 0..1), glass (Copilot at the glass: person options + x,y,u), door
  // { open, cop }, gate { rattle, deny }, her/him, strobe 0..1, rain
  function exterior(t, o = {}) {
    if (!DBG.includes('noview')) throughWindow(t, o);
    if (o.glass) copilotAt(t, o.glass.x, o.glass.y, o.glass.u, o.glass.o);
    const doorVis = vis(DOOR.x - 60, DOOR.spring - DOOR.apex - 60, DOOR.x + DOOR.w + 60, EXT.base + 10);
    look('bank'); bankLayer({ cap: .4, scale: .8 }, () => { facade(t); reveal(t); });   // (the stone printed light: the billboard and the riso cast read over it)
    look('xerox');
    aroundWin(-300, -300, W + 300, EXT.base + 40).forEach(B => { v3Spot(B, 'c', .58); v3Spot(B, 'm', .12); });
    const hitW = Math.exp(-bfr(t) * 4) + (o.strobe || 0);
    v3Spot([[WIN.x - 34, WIN.y]].concat(lancet(WIN.x - 34, WIN.x + WIN.w + 34, WIN.y, WIN.apex + 20, 16), [[WIN.x + WIN.w + 34, WIN.y]]), 'm', .3 + .2 * hitW);
    for (const B of [box(WIN.x - 34, WIN.y, WIN.x, WIN.y + WIN.h), box(WIN.x + WIN.w, WIN.y, WIN.x + WIN.w + 34, WIN.y + WIN.h), box(WIN.x - 60, WIN.y + WIN.h, WIN.x + WIN.w + 60, WIN.y + WIN.h + 30)]) { v3Spot(B, 'm', .3 + .2 * hitW); v3Spot(B, 'y', .25); }
    const dr = o.door || {};
    if (doorVis) { doorway(t, dr.open || 0, dr.cop); gate(t, (o.gate || {}).rattle || 0, (o.gate || {}).deny || 0); }   // (the door over the night, closed until Copilot opens it)
    look('xerox'); windowHead(t); tracery(t, o.bars ?? 1);
    if (vis(-300, EXT.base + 30, W + 300, H + 300)) cpXeroxDraw(() => pavement(t, o.strobe || 0));
    if (o.cast !== false && !DBG.includes('nocast') && vis(EXT.him[0] - 200, 200, EXT.her[0] + 200, H)) narrators(t, o);
    if (o.over) o.over(t);
    look('xerox'); rain(t, o.rain ?? 1);
  }
  // ---- B1's timeline: the pull back out, then Copilot's welcome ----
  // (spread out and moved up, so each beat reads: Copilot at the glass as the pull-back lands; the push on the flaps and the
  // gate's red cross are one beat, held half a second before its sorry; it had pushed, been refused and been sorry within
  // .35 s. It ends on its wave as V3a turns across the road on the downbeat)
  const OUT = { close: BAR(98) + .04, glass: BAR(96) + BEAT * 1.5, dash: BAR(96) + BEAT * 3.4 };
  Object.assign(OUT, { wave: OUT.glass + .22, beckon: OUT.glass + .6, open: OUT.dash + .3, push: OUT.dash + .66, deny: OUT.dash + .74 });
  // (the pass takes half a second, her reaching for the flyer as it comes over the flaps, and runs to the cut: it was a
  // quarter of a second, done .2 s before the cut)
  Object.assign(OUT, { sorry: OUT.deny + .5, pass: OUT.deny + .66, take: OUT.deny + 1.12 });
  // the door's framing (the door between them, her head in frame, the reader and its cross clear): it was [1060, 690,
  // 1.85], him big in front of the doorway and her bun cut off
  const B1_DF = [1080, 640, 1.45];
  function b1Glass(t) {
    const O = OUT; if (t < O.glass || t > O.dash + .25) return null;
    const rise = backOut(seg(t, O.glass, O.glass + .16)), gone = ease(seg(t, O.dash, O.dash + .22));
    const pose = t < O.beckon ? 'wave' : t < O.dash ? { L: [-1.9, -1.8, .2, 'relax'], R: [1.6 + .5 * Math.sin((t - O.beckon) * 26), -4.4, .35, 'open', 1] } : { L: [-2.2, -4.6, .2, 'open'], R: [2.6, -4.0, .1, 'point', 1] };
    return { x: 380 + 560 * gone, y: 820 + (1 - rise) * 300, u: 36, o: { ...emotions(t, [[O.glass, 'surprised'], [O.wave + .1, 'excited']]), emote: null, eyes: 'wide', view: gone > .01 ? 'q' : 'front', pose, dy: gone > 0 ? -.4 * Math.sin(Math.PI * gone) : 0 } };
  }
  function b1Door(t) {
    const O = OUT, open = seg(t, O.open - .04, O.open + .3) * (1 - seg(t, O.close, O.close + .3));   // (the leaves swing in over a third of a second: doorway eases it)
    if (open <= .01) return { open: 0 };
    // (Copilot stands in the doorway: clipped to its arch, so its raised gloves don't poke out through the stone beside the
    // opening leaves; unclipped only while its arm comes out through the door with the flyer)
    return { open, cop: A => { const inArch = t < O.pass || t > O.take + .4; if (inArch) clipPush(A);
      const out = ease(seg(t, O.pass, O.pass + .3)) * (1 - ease(seg(t, O.take + .05, O.take + .35)));   // (the flyer comes up over the flaps; the empty hand goes back)
      const hands = t < O.push ? { L: [-2.9, -6.0, .2, 'open'], R: [2.9, -6.0, .2, 'open'] } : t < O.pass ? { L: [-1.5, -3.9, .3, 'open', 1], R: [1.5, -3.9, .3, 'open', 1] } : { L: [-1.5, -3.9, .3, 'open', 1], R: [lerp(1.5, 4.4, out), -3.9, .1, t < O.take ? 'hold' : 'open', 1] };
      const bye = t > O.take + .15;
      const mood = emotions(t, [[O.open, 'excited'], [O.deny + .06, 'surprised'], [O.sorry, 'sad'], [O.take + .1, 'shy']]);
      copilotAt(t, DOOR.cx - 8, EXT.base + 4, 34, { ...mood, emote: t > O.sorry ? null : mood.emote, pose: bye ? 'wave' : hands, dy: t > O.push && t < O.push + .12 ? -.2 : 0, hold: t > O.pass && t < O.take ? (s => flyer(s * .9, 0, 'v3flyc')) : null });
      if (inArch) clipPop();
    } };
  }
  const b1Gate = t => ({ rattle: t > OUT.push && t < OUT.push + .3 ? 1 - seg(t, OUT.push, OUT.push + .3) : 0, deny: seg(t, OUT.deny, OUT.deny + .5) * (1 - seg(t, OUT.deny + 1.1, OUT.deny + 1.4)) });
  // him: he can't help bobbing to the beat; Copilot at the glass lights him up; he turns to the door, hopeful; the gate
  // says no and he sinks. Her: arms folded, unconvinced; the flyer comes through the bars to her and she takes it.
  function b1Him(t) {
    const O = OUT, nod = t < O.glass ? Math.max(0, Math.sin(bpo(t) * TAU)) : 0, toDoor = t > O.dash + .12, step = ease(seg(t, O.dash + .15, O.push - .05)) * (1 - ease(seg(t, O.deny + .4, O.deny + .85)));
    // (they watch the party through the window: he looks round over his shoulder into the glass as we pull back out of it,
    // so Copilot pops up where he's looking and the spotting is mutual; they had their backs to it, his eyes on the ground)
    const mood = emotions(t, [[B1T.out[0], 'happy', { lookX: 1, lookY: -.15, eyes: 'shine' }], [O.glass + .1, 'surprised', { lookX: 1, lookY: .25 }], [O.wave + .3, 'hopeful', { lookX: .9, lookY: .2 }], [O.deny + .1, 'sad', { lookY: .3 }]], { take: .7 });
    return { ...mood, mouth: mood.mouth === 'O' || mood.mouth === 'open' ? 'flat' : mood.mouth, emote: null, pose: toDoor && t < O.deny + .1 ? 'low' : 'pockets', tilt: .12 * nod - .04, dy: (mood.dy || 0) - .15 * nod, flip: !toDoor, view: t > O.dash && t < O.dash + .12 ? 'front' : 'q', dxPx: 60 * step, walk: step > .02 && step < .98 ? 60 * step / (1.6 * EXT.him[2]) : null };   // (a hopeful step toward the door, not across it)
  }
  function b1Her(t) {
    const O = OUT, reach = ease(seg(t, O.pass + .08, O.take)) * (1 - ease(seg(t, O.take + .12, O.take + .4)));
    const mood = emotions(t, [[B1T.out[0], 'bored', { lookX: 1, lookY: .05 }], [O.glass + .2, 'suspicious', { lookX: 1, lookY: .2 }], [O.deny + .15, 'bored', { lookX: .9, lookY: .2 }]], { take: .5 });   // (her eyes on the window, then on Copilot at it)
    // (the reach starts where the folded arm's hand is, [1.02, -9.58] in her units: PPOSE.cross.L; it jumped from there. It
    // takes the flyer at her chest, below her scarf's ring: at her collar the flyer tucked in behind the ring)
    const pose = t < O.pass + .08 ? 'cross' : { L: [lerp(1.02, 1.6, reach), lerp(-9.58, -10.15, reach), .3, t > O.take - .04 ? 'hold' : 'open', 1, null, 'u'], R: PPOSE.cross.R };
    return { ...mood, emote: null, pose, holdL: t > O.take ? (s => flyer(s, 0, 'v3flyh')) : null };
  }

  // ---------------------------------------------------------------------------------------------------------------
  // V3a's bookmaker's, across the road from the club (the user's pick, 2026-09-25, for "why is the horse race just
  // randomly on the club wall?"). The camera turns from the club to the street: the reverse angle, the club behind us,
  // its rave strobing pink across the wet road and its lit pointed window caught in the bookie's glass door. A British
  // high-street bookie's in riso, like V3c's street: the fascia's pictograms (a horse's head in a roundel, a horseshoe
  // each side; no words), a striped awning the two of them shelter under, frosted lower windows, and TV screens above:
  // the window's own screen (the meeting's pre-race feed: the boss at the megaphone on his synthetic horse, the race's
  // poster moment; V3a pushes into it) and, through the glass, the wall of screens inside (odds boards: silks, a name
  // bar and a price as seven-segment fractions; another meeting), the punters' heads under them, one lifting
  // his slip on "all" and slamming it down on "in". World px; the wide is about the screen at zoom .92.
  // ---------------------------------------------------------------------------------------------------------------
  const BK = { g: 880, kerb: 952, fas: [50, 168], awn: [168, 230], top: 244, tr: 588, frost: [600, 766],
    door: [150, 372], win: [394, 1770], mull: 1090, tv: { x: 1342, y: 296, w: 360, h: 202.5 },
    her: [1196, 906, 26], him: [636, 906, 28.7] };
  BK.tv.cx = BK.tv.x + BK.tv.w / 2; BK.tv.cy = BK.tv.y + BK.tv.h / 2;
  // the back wall's screens, seen through the glass: [x, y, w, h, what] ('board': the big odds board he looks up at)
  const BK_SCR = [[418, 300, 150, 84.4, 'race'], [586, 292, 176, 99, 'odds'], [790, 280, 270, 151.9, 'board'], [1108, 298, 196, 110.3, 'odds']];   // (behind her head: an odds board, nothing small to perch on her bun)
  const BKC = { fas: '#D8343E', fasDk: '#8A1E36', awn: '#E8384A', frame: '#262C50', inside: '#FFEE9A', ceil: '#F2D46A', scr: '#1A2250', scrHd: '#3E6FC8', frost: '#D0DAEE', riser: '#2A2A60' };
  // the runners on the boards: silks, a price before and after "all" (the jet, Altman's, shortens: everyone's piling in)
  const BK_RUN = [['#1E1E2A', [5, 1], [1, 1]], ['#B8BCC8', [7, 2], [9, 2]], ['#FFD23A', [4, 1], [6, 1]], ['#E8784A', [9, 1], [12, 1]], ['#3E6FC8', [11, 2], [14, 1]]];
  // the punters inside, backs to us under the screens: [x, seed]; the second (under the big board) slams down his slip
  const BK_PUN = [[486, 3], [930, 7], [1046, 11], [1312, 5], [1560, 13]];
  const bkLit = (x, y) => (x > BK.win[0] && x < BK.win[1] && y > BK.top && y < BK.tr) || (x > BK.door[0] + 24 && x < BK.door[1] - 24 && y > 332 && y < 780);
  // a seven-segment digit (a screen's price), top-left (x, y), h tall, flat light
  const SEG7 = ['abcdef', 'bc', 'abdeg', 'abcdg', 'bcfg', 'acdfg', 'acdefg', 'abc', 'abcdefg', 'abcdfg'];
  function seg7(d, x, y, h, col) {
    const w = h * .5, s = h * .14, m = y + h / 2, R = (x0, y0, x1, y1) => _paint(box(x0, y0, x1, y1), { wash: col, ink: null });
    for (const c of SEG7[d]) {
      if (c === 'a') R(x, y, x + w, y + s); else if (c === 'g') R(x, m - s / 2, x + w, m + s / 2); else if (c === 'd') R(x, y + h - s, x + w, y + h);
      else if (c === 'b') R(x + w - s, y, x + w, m); else if (c === 'c') R(x + w - s, m, x + w, y + h); else if (c === 'f') R(x, y, x + s, m); else R(x, m, x + s, y + h);
    }
  }
  // a price as a fraction [n, d], right-aligned at xr, digits h tall
  function price([n, d], xr, y, h, col) {
    const adv = h * .7, sl = h * .55, s = String(n) + String(d), wd = s.length * adv + sl - (adv - h * .5);
    let x = xr - wd;
    for (const ch of String(n)) { seg7(+ch, x, y, h, col); x += adv; }
    _paint(ribbon([[x - h * .04, y + h], [x + h * .3, y]], h * .13, h * .13), { wash: col, ink: null }); x += sl;
    for (const ch of String(d)) { seg7(+ch, x, y, h, col); x += adv; }
  }
  // a horseshoe, open at the top (lucky), nail holes knocked out
  function bkShoe(x, y, r, col, key) {
    const A = []; for (let i = 0; i <= 16; i++) { const a = -.25 + i / 16 * (Math.PI + .5); A.push([x + Math.cos(a) * r, y + Math.sin(a) * r * 1.08]); }
    piece(strokeShape(A, () => r * .34), col, { sw: Math.max(.5, r / 30), key });
    for (let i = 0; i < 6; i++) { const a = .12 + i / 5 * (Math.PI - .24); _paint(oval(x + Math.cos(a) * r, y + Math.sin(a) * r * 1.08, r * .07, r * .07, 0, 8), { wash: XEROX.paper, ink: null }); }
  }
  // the fascia's roundel: a horse's head in profile (facing right), mane and eye
  const HORSE_HEAD = [[-.34, .66], [-.44, .2], [-.4, -.12], [-.28, -.36], [-.2, -.5], [-.16, -.76], [-.04, -.52], [.06, -.5], [.16, -.44], [.36, -.2], [.56, .04], [.66, .16], [.66, .28], [.58, .36], [.44, .36], [.3, .3], [.16, .2], [.06, .3], [.1, .66]];
  function bkRoundel(x, y, r, key) {
    const P = pts => pts.map(([a, b]) => [x + a * r, y + b * r]);
    piece(oval(x, y, r, r, 0, 32), HSC.paper, { sw: Math.max(.6, r / 30), key: key + 'd' });
    piece(P(HORSE_HEAD), BKC.fasDk, { sw: Math.max(.5, r / 36), key: key + 'h' });
    piece(strokeShape(P([[-.36, .56], [-.42, .16], [-.36, -.14], [-.24, -.38]]), () => r * .1), '#3A1020', { ink: null, key: key + 'm' });
    _paint(oval(x + .12 * r, y - .24 * r, .06 * r, .06 * r, 0, 10), { wash: HSC.paper, ink: null });
  }
  // a screen on the back wall: 'board' / 'odds' (silks, a name bar and a price per runner; on "all" the prices change,
  // each row flashing as it goes), 'race' (the meeting's feed, engraved: bkWallRace, below)
  function bkScreen(t, x, y, w, h, what, key) {
    if (!vis(x - 8, y - 8, x + w + 8, y + h + 8)) return;
    boilSeed('v3 bks' + key);
    piece(box(x - 5, y - 5, x + w + 5, y + h + 5), '#12131C', { sw: .8, key: key + 'bz' });
    piece(box(x, y, x + w, y + h), BKC.scr, { ink: null, key: key + 's' });
    if (what === 'board' || what === 'odds') {
      const n = what === 'board' ? 5 : 4, hd = h * .15, rh = (h - hd) / n;
      _paint(box(x, y, x + w, y + hd), { wash: BKC.scrHd, ink: null });
      for (let i = 0; i < 3; i++) _paint(box(x + w * (.08 + i * .1), y + hd * .35, x + w * (.14 + i * .1), y + hd * .65), { wash: XEROX.paper, ink: null });
      for (let i = 0; i < n; i++) {
        const ry = y + hd + i * rh, [col, p0, p1] = BK_RUN[i], age = t - (V3A.all + i * .06 + (what === 'odds' ? .1 : 0)), hot = age >= 0 && age < .42 && Math.floor(age * 14) % 2 === 0;
        if (hot) _paint(box(x + 1, ry + 1, x + w - 1, ry + rh - 1), { wash: HSC.yellow, ink: null });
        _paint(box(x + rh * .22, ry + rh * .18, x + rh * .86, ry + rh * .82), { wash: col, ink: null });
        if (i === 0) _paint([[x + rh * .22, ry + rh * .6], [x + rh * .86, ry + rh * .3], [x + rh * .86, ry + rh * .45], [x + rh * .22, ry + rh * .75]], { wash: XEROX.paper, ink: null });   // (the jet's white sash)
        _paint(box(x + rh * 1.15, ry + rh * .42, x + w * lerp(.36, .54, hash(i * 3.3 + w * .01)), ry + rh * .58), { wash: hot ? BKC.scr : '#8A96C8', ink: null });
        price(age >= 0 ? p1 : p0, x + w - rh * .3, ry + rh * .22, rh * .56, hot ? BKC.scr : XEROX.paper);
      }
    }
  }
  // The back wall's race screen shows the meeting's feed: the race is banknote engraving wherever it plays (the media rule:
  // a picture on a screen keeps its own medium, bounded by its frame), so it's engraved here too, another camera on the
  // same pre-race moment (closer, on the boss at his megaphone), then re-printed with the shop's riso (risoReprint, as
  // on the window's TV). It used to be a flat riso drawing of another meeting, while the window's TV was engraved.
  const BK_WALLCAM = [905, 640, 1.75];
  function bkWallRace(t, z) {
    for (const [x, y, w, h, what] of BK_SCR) {
      if (what !== 'race' || !vis(x - 8, y - 8, x + w + 8, y + h + 8)) continue;
      look('bank');
      push(); translate(x, y); scale(w / W);
      v3Engrave(Math.max(1, 1 / (w / W * z)), () => raceScene(t, 0, { clip: true, cam: BK_WALLCAM }), 960, 540);
      pop();
      look('xerox');
      risoReprint(box(x, y, x + w, y + h), 1);
    }
  }
  // the punters inside (crowd.js, head and shoulders from behind, over the frosted glass); the one under the big board
  // lifts his slip on "all" and slams it down on "in" (his arm drawn here: up with the slip, then down out of sight)
  function bkPunters(t) {
    const clip = box(BK.win[0], BK.top, BK.win[1], BK.frost[0]), u = 17, A = V3A;
    BK_PUN.forEach(([x, sd], i) => {
      const slap = i === 1, bump = slap ? 6 * Math.exp(-Math.max(0, t - A.inW) * 10) * (t >= A.inW ? 1 : 0) : 0, yb = BK.tr + 22 + bump;
      if (!vis(x - 70, 420, x + 70, BK.frost[0])) return;
      crowdFig(x, yb, u, { view: 'audience', seed: sd, clip, drum: 'c', tone: .88, col: HSC.sil, phone: 0, t, key: 'v3bkp' + sd });
      if (!slap) return;
      const up = ease(seg(t, A.all - .24, A.all - .04)) * (1 - easeIn(seg(t, A.inW - .08, A.inW)));
      if (up <= .02) return;
      const sh = [x + 1.7 * u, yb - 2.9 * u], hd = [x + lerp(2.4, 2.6, up) * u, yb - lerp(1.5, 8.2, up) * u], el = [x + lerp(3.0, 3.6, up) * u, yb - lerp(2.2, 5.2, up) * u];
      piece(clipConvex(strokeShape(through([sh, el, hd], 4), f => lerp(1.25, 1.0, f) * u), clip), HSC.sil, { ink: null, key: 'v3bkpa', spot: { channel: 'c', tone: .88 } });
      const S = clipConvex(box(hd[0] - 15, hd[1] - 38, hd[0] + 15, hd[1] + 2), clip);
      if (S.length > 2) { _paint(S, { wash: XEROX.paper, ink: null }); dline(S.concat([S[0]]), .9, BKC.frame); }
    });
  }
  // through the upper glass: the lit shop (the ceiling and its tubes, the back wall's screens, the punters' heads)
  function bkInside(t) {
    const [g0, g1] = BK.win, y0 = BK.top, y1 = BK.tr;
    boilSeed('v3 bkin');
    piece(box(g0, y0, g1, BK.frost[0]), BKC.inside, { ink: null, key: 'v3bkin' });
    piece(box(g0, y0, g1, y0 + 20), BKC.ceil, { ink: null, key: 'v3bkceil' });
    for (let i = 0; i < 6; i++) { const cx = g0 + 110 + i * 236; _paint(box(cx - 64, y0 + 7, cx + 64, y0 + 13), { wash: XEROX.paper, ink: null }); }
    BK_SCR.forEach(([x, y, w, h, what], i) => bkScreen(t, x, y, w, h, what, 'v3bks' + i));
    bkPunters(t);
  }
  // the window's screen: the meeting's feed (the race frame before the off: the boss at the megaphone on his horse) in a
  // slim bezel hung on two rods behind the glass. fx 0..1: the screen seen as a screen (scan lines once close enough to
  // read, a glare), dropping away as the push fills the frame with it. copy 0..1: the engraving on it printed again as
  // part of the shop's riso print (risoReprint; the user, 2026-09-25: the engraved race on the screen clashed with the
  // riso round it), fading out through the push so the race that fills the frame is pure banknote.
  function bkTV(t, zoom, fx, copy = 1) {
    const { x, y, w, h } = BK.tv, sc = w / W;
    look('xerox');
    cpXeroxDraw(() => {
      boilSeed('v3 bktv');
      for (const rx of [x + 50, x + w - 50]) piece(box(rx - 3, BK.top, rx + 3, y - 10), BKC.frame, { ink: null, key: 'v3bkrod' + rx });
      piece(box(x - 12, y - 12, x + w + 12, y + h + 15), '#16182A', { sw: 1.1, key: 'v3bktvb' });
    });
    look('bank');
    push(); translate(x, y); scale(sc);
    v3Engrave(Math.max(1, 1 / (sc * zoom)), () => raceScene(t, 0, { clip: true }), 960, 540);
    pop();
    look('xerox');
    risoReprint(box(x, y, x + w, y + h), copy);
    if (fx <= .01) return;
    const sl = fx * clamp((zoom - 1.2) / 1.2);
    if (sl > .01) for (let yy = y + 1.3; yy < y + h; yy += 2.6) _paint(box(x, yy, x + w, yy + .9), { wash: '#0E1430', washOp: 60 * sl, ink: null });
    _paint([[x + w * .56, y], [x + w * .74, y], [x + w * .5, y + h], [x + w * .32, y + h]], { wash: '#FFFFFF', washOp: 34 * fx, ink: null });
    _paint([[x + w * .78, y], [x + w * .82, y], [x + w * .58, y + h], [x + w * .54, y + h]], { wash: '#FFFFFF', washOp: 26 * fx, ink: null });
  }
  // the window's glass over it all: long pale glare streaks, the awning's shadow along its top
  function bkGlass(t, fx) {
    const [g0, g1] = BK.win;
    v3Spot(box(g0, BK.top, g1, BK.top + 26), 'c', .3);
    if (fx <= .01) return;
    for (const [a, b] of [[.12, .05], [.18, .02], [.61, .04], [.66, .015]]) { const xa = lerp(g0, g1, a), wd = (g1 - g0) * b; _paint([[xa + 170, BK.top], [xa + 170 + wd, BK.top], [xa + wd, BK.tr], [xa, BK.tr]], { wash: '#FFFFFF', washOp: 30 * fx, ink: null }); }
  }
  // the frosted lower glass: the punters' bodies as soft shadows behind it, a frieze of little horseshoes along its top
  function bkFrost(t) {
    const [f0, f1] = BK.frost, [w0, w1] = BK.win;
    boilSeed('v3 bkfrost');
    piece(box(w0, f0, w1, f1), BKC.frost, { sw: .9, key: 'v3bkfr' });
    for (const [x] of BK_PUN) v3Spot(curvy([[x - 52, f0], [x + 52, f0], [x + 62, f0 + 190], [x - 62, f0 + 190]], 3), 'c', .18);
    for (const [y, h] of [[f0 + 22, 7], [f0 + 34, 3]]) piece(box(w0, y, w1, y + h), BKC.fas, { ink: null, key: 'v3bkfb' + y });   // (a vinyl band)
  }
  // the window's frame: head, transom, cill, the mullion, the jambs; the tiled stall riser
  function bkFrames() {
    const [w0, w1] = BK.win, F = BKC.frame, [f0, f1] = BK.frost;
    boilSeed('v3 bkframe');
    for (const [P, k] of [[box(w0 - 8, BK.top - 10, w1 + 8, BK.top + 2), 'h'], [box(w0 - 8, BK.tr, w1 + 8, f0), 't'], [box(w0 - 8, f1, w1 + 8, f1 + 12), 'c'], [box(BK.mull - 7, BK.top, BK.mull + 7, f1), 'm'], [box(w0 - 10, BK.top, w0 + 2, f1), 'l'], [box(w1 - 2, BK.top, w1 + 10, f1), 'r']]) piece(P, F, { ink: null, key: 'v3bkf' + k });
    piece(box(w0 - 8, f1 + 12, w1 + 8, BK.g), BKC.riser, { sw: 1, key: 'v3bkrs' });
    for (let x = w0 + 60; x < w1; x += 68) dline([[x, f1 + 12], [x, BK.g]], .6, '#141840');
    dline([[w0, (f1 + BK.g) / 2 + 6], [w1, (f1 + BK.g) / 2 + 6]], .6, '#141840');
  }
  // the door (glass, in an aluminium frame): through it the counter, a cashier's odds screen, a punter at it; the club
  // across the road caught in the glass (its pointed window, pink, a yellow roundel), flaring with the strobe
  function bkDoor(t, hit) {
    const [d0, d1] = BK.door, g = BK.g, gx0 = d0 + 24, gx1 = d1 - 24, gy0 = 332, gy1 = 780;
    if (!vis(d0 - 20, BK.top, d1 + 20, g + 12)) return;
    boilSeed('v3 bkdoor');
    piece(box(d0, BK.top, d1, g), BKC.frame, { sw: 1.1, key: 'v3bkdf' });
    piece(box(d0 + 14, BK.top + 10, d1 - 14, 318), BKC.inside, { sw: .9, key: 'v3bkfan' });
    piece(box(gx0, gy0, gx1, gy1), BKC.inside, { ink: null, key: 'v3bkdg' });
    bkScreen(t, gx0 + 24, 400, 124, 69.75, 'odds', 'v3bkds');
    piece(box(gx0, 640, gx1, gy1), '#B86A48', { ink: null, key: 'v3bkct' });
    piece(box(gx0, 630, gx1, 644), '#6A3A2A', { ink: null, key: 'v3bkctt' });
    crowdFig(gx0 + 124, 880, 30, { view: 'side', dir: -1, seed: 17, clip: box(gx0, gy0, gx1, gy1), drum: 'c', tone: .88, col: HSC.sil, phone: 0, t, key: 'v3bkdp' });
    const L = gx0 + 34, R = gx1 - 34, P = [[L, 740]].concat(lancet(L, R, 520, 110, 12), [[R, 740]]);
    v3Spot(P, 'm', .34 + .4 * hit); v3Spot(oval((L + R) / 2, 470, 24, 24, 0, 16), 'y', .5 + .3 * hit);
    dline([[(L + R) / 2, 470], [(L + R) / 2, 740]], 1.6, '#B04A8A'); dline([[L, 560], [R, 560]], 1.6, '#B04A8A');
    for (const k of [1, 2]) _paint([[gx0 + 30 * k + 40, gy0], [gx0 + 30 * k + 52, gy0], [gx0 + 30 * k - 10, gy1], [gx0 + 30 * k - 22, gy1]], { wash: '#FFFFFF', washOp: 28, ink: null });
    piece(box(gx0 - 4, 562, gx1 + 4, 578), BKC.frame, { ink: null, key: 'v3bkdr' });
    piece(box(gx1 - 30, 588, gx1 - 18, 700), HSC.steel, { sw: .8, key: 'v3bkdh' });
    piece(box(gx0, gy1, gx1, g - 14), BKC.riser, { sw: .8, key: 'v3bkdk' });
    piece(box(d0 - 10, g - 4, d1 + 10, g + 10), HSC.stone, { sw: .8, key: 'v3bkst' });
  }
  // the fascia (red, a horse's head in a roundel, a horseshoe each side), the cornice, the pilasters with their corbels
  function bkFascia() {
    const [a, b] = BK.fas, cy = (a + b) / 2;
    boilSeed('v3 bkfascia');
    for (const [x0, x1] of [[98, 150], [372, 394], [1770, 1822]]) piece(box(x0, b, x1, BK.g), BKC.fasDk, { sw: 1, key: 'v3bkpl' + x0 });
    piece(box(90, a - 14, 1830, a), HSC.stone, { sw: 1, key: 'v3bkcor' });
    piece(box(100, a, 1820, b), BKC.fas, { sw: 1.2, key: 'v3bkfas' });
    dline(box(114, a + 10, 1806, b - 10).concat([[114, a + 10]]), .9, HSC.paper);
    for (const x of [92, 1792]) piece([[x, a - 4], [x + 36, a - 4], [x + 30, b + 16], [x + 6, b + 16]], BKC.fasDk, { sw: 1, key: 'v3bkcb' + x });
    bkRoundel(960, cy, 44, 'v3bkrn');
    for (const s of [-1, 1]) bkShoe(960 + s * 164, cy - 4, 28, HSC.yellow, 'v3bksh' + s);
  }
  // the awning they shelter under: the roller box, red and paper stripes, a scalloped valance
  function bkAwning() {
    const [a0, a1] = BK.awn, x0 = 96, x1 = 1824, n = 18, sw = (x1 - x0) / n, v = a1 - 18;
    boilSeed('v3 bkawn');
    piece(box(x0 - 6, a0, x1 + 6, a0 + 10), BKC.frame, { ink: null, key: 'v3bkabox' });
    for (let i = 0; i < n; i++) {
      const xa = x0 + i * sw, xb = xa + sw, col = i % 2 ? HSC.paper : BKC.awn, P = [[xa, a0 + 10], [xb, a0 + 10], [xb + 4, v]];
      for (let k = 0; k <= 8; k++) { const f = k / 8; P.push([xb + 4 - sw * f, v + Math.sin(Math.PI * f) * 18]); }
      piece(P, col, { ink: null, key: 'v3bkas' + i });
    }
    dline([[x0, a0 + 10], [x1, a0 + 10]], 1, BKC.frame);
  }
  // the storey above (brick, sash windows, one lit) and the neighbours: a shop shuttered for the night, a dark café
  function bkAbove() {
    boilSeed('v3 bkabove');
    piece(box(-420, -700, 2340, 36), HSC.brick, { sw: 1.1, key: 'v3bkbr' });
    for (let r = 0; r < 21; r++) dline([[-420, 26 - r * 34], [2340, 26 - r * 34]], .5, '#5A2A30');
    for (const [wx, on] of [[250, 0], [700, 1], [1150, 0], [1600, 1]]) {
      piece(box(wx, -230, wx + 110, -16), on ? HSC.litDk : HSC.glass, { sw: 1, key: 'v3bkuw' + wx });
      dline([[wx, -123], [wx + 110, -123]], 1, '#1A1A2A'); dline([[wx + 55, -230], [wx + 55, -16]], .8, '#1A1A2A');
      piece(box(wx - 8, -16, wx + 118, -6), HSC.stone, { sw: .8, key: 'v3bkus' + wx });
    }
  }
  function bkNeighbours() {
    boilSeed('v3 bknb');
    piece(box(-420, 36, 92, BK.g), '#8A92B0', { sw: 1, key: 'v3bkn1' });
    piece(box(-420, 50, 92, 168), '#3A3072', { sw: 1, key: 'v3bkn1f' });
    for (let y = 196; y < BK.g; y += 18) dline([[-420, y], [80, y]], .6, '#4A5070');
    piece(box(1828, 36, 2340, BK.g), '#3A8A4A', { sw: 1, key: 'v3bkn2' });
    piece(box(1862, 250, 2340, 770), HSC.glass, { sw: 1, key: 'v3bkn2w' });
    piece(box(1862, 770, 2340, BK.g), '#24582E', { sw: 1, key: 'v3bkn2r' });
  }
  // the pavement, the kerb, the road with its double yellow lines; the lit shop smeared in the wet; the club's light from
  // across the road behind us (pink, pulsing with its strobe)
  function bkStreet(t, glow) {
    const g = BK.g, k = BK.kerb;
    if (!vis(-420, g, 2340, 1600)) return;
    boilSeed('v3 bkstreet');
    piece(box(-420, g, 2340, k), HSC.pave, { sw: 1, key: 'v3bkpv' });
    for (let x = -400; x < 2340; x += 130) dline([[x, g], [x - 18, k]], .6, '#3A4A7A');
    piece(box(-420, k, 2340, k + 12), HSC.stone, { sw: .8, key: 'v3bkkb' });
    piece(box(-420, k + 12, 2340, 1600), HSC.road, { ink: null, key: 'v3bkrd' });
    for (const y of [k + 26, k + 36]) piece(box(-420, y, 2340, y + 4), HSC.yellow, { ink: null, key: 'v3bkdy' + y });
    // (each reflection a stack of ripple dashes, narrowing and fading down the wet surface)
    const ripples = (x, y0, n, wd, dy, ch, tone, sd) => { for (let j = 0; j < n; j++) { const f = j / n, hw = wd * (1 - .55 * f) * (.7 + .5 * hash(sd + j * 1.7)), xx = x + 8 * Math.sin(t * 2.6 + sd + j * 1.3), y = y0 + j * dy; const P = box(xx - hw, y, xx + hw, y + dy * .42); _paint(P, { wash: XEROX.paper, washOp: 120 * (1 - .5 * f), ink: null }); v3Spot(P, ch, tone * (1 - .45 * f)); } };
    for (let i = 0; i < 9; i++) {
      const x = 430 + i * 150 + 70 * (hash(i * 4.1) - .5), wd = 16 + 18 * hash(i * 2.9);
      ripples(x, g + 10, 4, wd, 10, 'y', .45, i * 3.3);
      ripples(x - 12, k + 48, 6 + Math.floor(4 * hash(i * 1.3)), wd * 1.2, 20, i % 4 === 3 ? 'm' : 'y', .55, i * 7.1);
    }
    // the club's light: a pink wedge across the road from its window behind us, and a wash over the street
    const Wd = [[-60, 1400], [1180, 1400], [900, k + 16], [300, k + 16]];
    _paint(Wd, { wash: XEROX.paper, washOp: 70 + 90 * glow, ink: null }); v3Spot(Wd, 'm', .3 + .5 * glow);
    v3Spot(box(-420, g, 2340, 1600), 'm', .08 + .35 * glow);
  }
  // drips off the awning's valance, in front of the two of them (knocked out of the dark, dark over the lit glass)
  function bkDrips(t, amt) {
    const y0 = BK.awn[1] - 4, y1 = BK.kerb - 12;
    for (let i = 0; i < 46; i++) {
      const x = 100 + i * 38.5 + 12 * hash(i * 1.3), r = 1.1 + .5 * hash(i * 2.1), c = t * r + hash(i * 3.7), ph = frac(c);
      if (hash(i * 5.9 + Math.floor(c)) > .75 * amt) continue;
      const y = lerp(y0, y1, ph * ph), len = 6 + 56 * ph;
      if (!vis(x - 4, y - len, x + 4, y)) continue;
      if (x > BK.win[0] && x < BK.win[1] && y > BK.tr && y < BK.frost[1]) continue;   // (none over the pale frosting: they'd print as grey bars)
      if (bkLit(x, y)) _inkLine([[x, y - len], [x, y]], .6, '#6A78B0', 'ink', 0); else _inkLine([[x, y - len], [x, y]], .9, '#E8E6F2', 'ink', 0);
    }
  }
  // the whole bookie's (world px). o.zoom: the camera's (the screens' engraving holds its size on screen); o.glow: the
  // club's strobe on us; o.fx: the window's screen and glass seen as glass (1), gone (0) once the push fills the frame;
  // o.copy: the screen's picture re-printed in riso (1) to pure banknote (0) (bkTV); o.her / o.him: { x, y, u, o }
  // (o: person() options)
  function bookies(t, o = {}) {
    const z = o.zoom || 1, fx = o.fx ?? 1, hit = .5 * Math.exp(-bfr(t) * 4) + (o.glow || 0), T = BK.tv;
    look('xerox');
    cpXeroxDraw(() => {
      if (vis(-420, -700, 2340, 40)) bkAbove();
      if (vis(-420, 0, 100, BK.g) || vis(1820, 0, 2340, BK.g)) bkNeighbours();
      bkInside(t);
    });
    bkWallRace(t, z);
    const hw = W / 2 / z, hh = H / 2 / z, tvOn = !CAM || !(T.x - 14 > CAM.cx + hw || T.x + T.w + 14 < CAM.cx - hw || T.y - 14 > CAM.cy + hh || T.y + T.h + 16 < CAM.cy - hh);
    if (tvOn) bkTV(t, z, fx, o.copy ?? 1);
    look('xerox');
    cpXeroxDraw(() => {
      bkGlass(t, fx);
      bkFrost(t); bkFrames(); bkDoor(t, hit); bkFascia(); bkAwning();
      bkStreet(t, hit);
      const { her, him } = o;
      if (him) person(him.x, him.y, him.u, HIM_C, { view: 'q', ...him.o, boilKey: 'v3him' });
      if (her) person(her.x, her.y, her.u, HER_C, { view: 'q', ...her.o, boilKey: 'v3her' });
      bkDrips(t, fx * lerp(1, .45, clamp(z - 1)));
    });
    rain(t, fx * lerp(.8, .45, clamp(z - 1)), true, (x, y) => bkLit(x, y) && '#6A78B0', BK.kerb - 40);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // V3a's race (bank): a Victorian racecourse printed as a banknote vignette (a border of guilloche bands with a
  // rosette at each corner and a cartouche, a ruled sky, the grandstand and its crowd); synthetic racehorses: Muybridge's
  // mare galloping as an engraved shell with the movement turning inside (horse2, demo/cast/horse2.js), the bosses as
  // jockeys engraved in the same line, their caricature heads on top like portraits on a note. rt = race time (0 = the
  // pre-race frame on the bookie's window screen). The field breaks on "race"; the lead (Altman's, the jet) surges on "to"
  // and runs away with him, and he loses it by degrees (altmanPose): hauling, thrown out of the saddle, then streaming out
  // behind it like a flag from one fist on a rein that pays out to a thread; the pack (Musk, Zuckerberg, the red silks)
  // gallops on at under half its speed and falls away behind. x grows rightward (world px).
  // ---------------------------------------------------------------------------------------------------------------
  const RACE = { off: .12, fin: 8250, rail: 760, near: 1098, vmax: 3600, tau: .55, pv: 1450, ground: 990 };
  const runX = (rt, t0, v, tau) => rt <= t0 ? 0 : v * ((rt - t0) - tau * (1 - Math.exp(-(rt - t0) / tau)));
  const runV = (rt, t0, v, tau) => rt <= t0 ? 0 : v * (1 - Math.exp(-(rt - t0) / tau));
  // the lead: a strong, controlled gallop with the field from the off (v1), then the surge on "to" up to vmax
  const LEAD = { v1: 1500, t1: .22, surge: .43, tau: .42 };
  const leadX = rt => 900 + runX(rt, RACE.off, LEAD.v1, LEAD.t1) + runX(rt, LEAD.surge, RACE.vmax - LEAD.v1, LEAD.tau);
  const leadV = rt => runV(rt, RACE.off, LEAD.v1, LEAD.t1) + runV(rt, LEAD.surge, RACE.vmax - LEAD.v1, LEAD.tau);
  // the pack: who, lane (its ground y), scale, starting x, coat, set back
  const PACK = [['musk', 905, .84, 610, 'steel', .08], ['zuck', 862, .72, 400, 'brass', .18], ['silks', 826, .62, 215, 'copper', .28]];
  const packT0 = i => RACE.off + .06 + .05 * i, packX = (rt, i) => PACK[i][3] + runX(rt, packT0(i), RACE.pv * (1 - .05 * i), .5);
  const rotAbout = (p, c, a) => { const dx = p[0] - c[0], dy = p[1] - c[1], cs = Math.cos(a), sn = Math.sin(a); return [c[0] + dx * cs - dy * sn, c[1] + dx * sn + dy * cs]; };
  // an engraved line through P (world px) with a pressure per point (a rein, a thread)
  const v3Line = (P, w, col, pr) => { const px = bankPx(); engStroke(P.map((p, i) => [p[0], p[1], pr ? pr(i / (P.length - 1)) : 1]), Math.max(w, eqMinW() / .77 / px), col, 'rotring'); };

  // Horizontal engraved rules between world heights y0..y1 over x0..x1 (a ruled sky, the turf): the lines sit on a grid
  // fixed in the world (a pan never swims them; a zoom halves or doubles them, the in-between lines fading), their tone
  // toneAt(y) (0..1) printed like engStrip's: lighter tones drop lines out, darker ones swell them; a gentle wave.
  function v3Rule(x0, x1, y0, y1, toneAt, col, o = {}) {
    const px = bankPx(), dT = EQ.d() * (o.dk || 1) / px, lg = Math.log2(dT), k = Math.floor(lg), f = lg - k, dw = 2 ** k, minW = eqMinW(), w0 = minW / .77 / px;
    const seg0 = 150 / px, pt = 30 / px, amp = (o.amp ?? .5) / px, wl = (o.wl ?? 260) / px;
    for (let j = Math.ceil(y0 / dw); j <= Math.floor(y1 / dw); j++) {
      const y = j * dw, t = toneAt(y), c = eqCov(t); if (c <= 0) continue;
      const r = j === 0 ? 10 : eqRank(Math.abs(j)), fd = j % 2 ? 1 - f : 1, dS = dw * px, n = Math.log2(minW / (c * dS)), a = clamp(r - n + 1) * fd;
      if (a <= .02) continue;
      const p0 = eqPress(Math.max(minW, c * dS * 2 ** Math.max(0, Math.ceil(n)))), p = a < 1 ? lerp(.42, p0, a) : p0;
      const xa = (Math.floor(x0 / seg0 - hash(j * .37)) + hash(j * .37)) * seg0;   // (each line's pieces staggered: no blocks)
      for (let xs = xa; xs < x1; xs += seg0) {
        const P = []; for (let x = xs; x <= xs + seg0 + .01; x += pt) P.push([x, y + Math.sin(x / wl + j * .7) * amp, p * (o.pk ? o.pk(x, y) : 1)]);
        if (P.some(q => q[2] > .05)) engStroke(P, w0, col);
      }
    }
  }
  // a guilloche rosette: two rings of interlaced lobes and ink rules (the corners of the race's border)
  function v3Rosette(cx, cy, r, o = {}) {
    const ink = BANK.ink, c1 = mixCol(ink, '#A8843A', .45), c2 = mixCol(ink, '#A05A66', .4);
    _paint(oval(cx, cy, r * 1.04, r * 1.04, 0, 36), { wash: BANK.paper, ink: null });
    guilloche(cx, cy, r * .68, r * .97, { n: o.n1 ?? 8, lobes: o.l1 ?? 14, col: c1, w: .45, steps: 220 });
    guilloche(cx, cy, r * .14, r * .6, { n: o.n2 ?? 6, lobes: o.l2 ?? 7, col: c2, w: .45, twist: .8, beat: 4, steps: 180 });
    const px = bankPx();
    for (const [rr, w] of [[1, 1.2], [.66, .8], [.1, .8]]) eqOutline(oval(cx, cy, r * rr, r * rr, 0, 40), w, ink, px, true, { p0: .95, p1: .3 });
  }
  // The race's border, in the race frame's own 1920 × 1080 (so the bookie's window screen and his phone's stream carry
  // it too): a paper margin with rules, guilloche bands along each side, a rosette at each corner, and at the top a
  // cartouche of microlines where a note's name would be (no lettering).
  function raceBorder() {
    const m = 12, b = 30, ink = BANK.ink, px = bankPx(), band = mixCol(ink, '#52806A', .35), mid = m + b / 2;
    const bx = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
    for (const P of [bx(-40, -40, W + 40, m + b), bx(-40, H - m - b, W + 40, H + 40), bx(-40, -40, m + b, H + 40), bx(W - m - b, -40, W + 40, H + 40)]) _paint(P, { wash: BANK.paper, ink: null });
    guillocheBand(m + b + 20, W - m - b - 20, mid, b - 12, { n: 4, wl: 34, w: .45, col: band });
    guillocheBand(m + b + 20, W - m - b - 20, H - mid, b - 12, { n: 4, wl: 34, w: .45, col: band });
    for (const x of [mid, W - mid]) { push(); translate(x, 0); rotate(Math.PI / 2); guillocheBand(m + b + 20, H - m - b - 20, 0, b - 12, { n: 4, wl: 34, w: .45, col: band }); pop(); }
    const rule = (i, w) => { const P = bx(i, i, W - i, H - i); eqOutline(P.map(p => p), w, ink, px, true, { p0: .95, p1: .2 }); };
    rule(m, 1.3); rule(m + b, 1.0); rule(m + b + 4, .5);
    for (const [x, y] of [[mid, mid], [W - mid, mid], [W - mid, H - mid], [mid, H - mid]]) v3Rosette(x, y, b * .95);
    // the cartouche at the top: a pill of microlines between two small rosettes
    const tw = 150, th = 17, ty = mid, pill = [];
    for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i / 10 * Math.PI; pill.push([W / 2 + tw + Math.cos(a) * th, ty + Math.sin(a) * th]); }
    for (let i = 0; i <= 10; i++) { const a = Math.PI / 2 + i / 10 * Math.PI; pill.push([W / 2 - tw + Math.cos(a) * th, ty + Math.sin(a) * th]); }
    _paint(pill, { wash: BANK.paper, ink: null });
    const mc = mixCol(ink, '#A05A66', .4);
    for (let i = 0; i < 6; i++) { const y = ty - 11 + i * 4.4, hw = tw + Math.sqrt(Math.max(0, th * th - (y - ty) ** 2)) - 5, P = []; for (let x = -hw; x <= hw; x += 5) P.push([W / 2 + x, y + Math.sin(x / 7 + i * 1.3) * .9, .95]); engStroke(P, Math.max(.5, eqMinW() / .77) / px, mc); }
    eqOutline(pill, 1.1, ink, px, true, { p0: .95, p1: .3 });
    for (const sd of [-1, 1]) v3Rosette(W / 2 + sd * (tw + th + 22), ty, 17, { n1: 6, n2: 4 });
  }

  // ---- the runners: Muybridge's mare as synthetic racehorses (horse2, demo/cast/horse2.js), jockeys in the same line ----
  // The gallop steps through Muybridge's 11 drawings on twos, in time with the ground: one stride per H2_STRIDE units run.
  const H2_STRIDE = 43, onTwos = rt => Math.floor(rt * 12) / 12;
  // Altman loses the horse by degrees across the line (the user, 2026-09-25: "start with some control of the horse but
  // gradually but rapidly lose grip"): "A race": seated tall and proud, the megaphone up, then lowered; "to build a
  // thing": it surges, he's jolted back, the megaphone flies, both fists haul, his seat lifts; "we might not know":
  // thrown half out, his feet out of the irons, clinging on with both hands as his body swings up and back; "how to":
  // one hand slips (it flails) and he streams out flat from one fist like a flag, the rein paying out; "rein in": the
  // rein down to a humming thread, arm and legs flailing, still hanging on at the cut. Keys: [rt, pose]; each pose is
  // relative to his seated pose on this frame (hip; hands; foot; knee) with his lean (rad, + forward) and his head's
  // turn; meg: the megaphone (1 at his mouth, 2 held down, 0 gone).
  const ALT_K = [
    [0,    { hip: [0, 0], lean: .12, hand: [1.55, -2.1], hand2: [2.0, -.55], foot: null, headA: -.12, meg: 1, seat: 1 }],
    [.16,  { hip: [0, 0], lean: .16, hand: [1.6, -2.1], hand2: [2.0, -.55], foot: null, headA: -.1, meg: 1, seat: 1 }],
    [.34,  { hip: [0, -.05], lean: .32, hand: [.95, -1.05], hand2: [2.05, -.6], foot: null, headA: -.05, meg: 2, seat: 1 }],
    [.52,  { hip: [-.15, -.1], lean: -.5, hand: [1.05, -1.45], hand2: [1.2, -1.35], foot: null, headA: -.4, meg: 0, seat: 1 }],
    [.95,  { hip: [.05, -.55], lean: -.45, hand: [1.2, -1.7], hand2: [1.3, -1.6], foot: [-.05, .1], headA: -.45, seat: 1 }],
    [1.3,  { hip: [-.2, -1.25], lean: .5, hand: [2.6, -1.55], hand2: [2.55, -1.45], foot: [-1.6, -.4], headA: .05, seat: 0 }],
    [1.8,  { hip: [-1.8, -2.35], lean: 1.15, hand: [2.3, -1.95], hand2: [2.25, -1.9], foot: [-3.9, -1.75], headA: .25, seat: 0 }],
    [2.15, { hip: [-2.55, -2.8], lean: 1.45, hand: [2.0, -2.25], hand2: [.9, -4.1], foot: [-4.7, -1.9], headA: .45, seat: 0, flail: 1 }],
    [2.65, { hip: [-3.15, -3.1], lean: 1.55, hand: [1.35, -2.85], hand2: [-.2, -1.0], foot: [-5.5, -2.9], headA: .5, seat: 0, flail: 1 }],
    [3.4,  { hip: [-3.35, -3.45], lean: 1.6, hand: [.9, -3.2], hand2: [-.4, -.9], foot: [-5.8, -3.5], headA: .5, seat: 0, flail: 1 }],
  ];
  const altKey = rt => {
    let i = 0; while (i < ALT_K.length - 2 && ALT_K[i + 1][0] <= rt) i++;
    const [t0, A] = ALT_K[i], [t1, B] = ALT_K[i + 1], k = ease(seg(rt, t0, t1)), L2 = (a, b) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
    const out = { lean: lerp(A.lean, B.lean, k), headA: lerp(A.headA, B.headA, k), hip: L2(A.hip, B.hip), hand: L2(A.hand, B.hand), hand2: L2(A.hand2, B.hand2), seat: lerp(A.seat, B.seat, k), flail: lerp(A.flail || 0, B.flail || 0, k), meg: k < .5 ? A.meg : B.meg };
    out.foot = A.foot || B.foot ? L2(A.foot || [0, 0], B.foot || [0, 0]) : null;
    return out;
  };
  // his pose on the lead's frame Fr (body frame b), at race time rt (song time t for the flutter)
  function altmanPose(t, rt, Fr, poster) {
    const S = h2SeatPose(Fr, { lean: .15 }), K = altKey(poster ? 0 : rt), H0 = S.hip, R = p => [H0[0] + p[0], H0[1] + p[1]];
    const fl = K.flail, wob = Math.sin(t * TAU * 5.1) * .07 * clamp((rt - 1.6) / .5);
    const lean = K.lean + wob, hip = R(K.hip), Lt = h2Len(H2J.torso);
    const neck = [hip[0] + Math.sin(lean) * Lt, hip[1] - Math.cos(lean) * Lt], sh = [lerp(hip[0], neck[0], .86) + Math.cos(lean) * .08, lerp(hip[1], neck[1], .86) + Math.sin(lean) * .08];
    let hand = R(K.hand), hand2 = R(K.hand2);
    if (fl > 0) hand2 = [hand2[0] + fl * .8 * Math.sin(t * TAU * 3.3), hand2[1] + fl * 1.0 * Math.cos(t * TAU * 2.6)];
    let foot = K.foot ? [lerp(S.foot[0], R(K.foot)[0], 1 - K.seat), lerp(S.foot[1], R(K.foot)[1], 1 - K.seat)] : S.foot;
    if (K.foot && K.seat < 1) foot = R(K.foot);
    const flut = clamp((rt - 1.5) / .6);
    if (flut > 0) foot = [foot[0], foot[1] + flut * .55 * Math.sin(t * TAU * 4.3)];
    // out of the saddle, the legs stream: the knee on the line from hip to foot, bowed a little down
    const knee = K.seat < .5 ? [lerp(hip[0], foot[0], .5) + .1, lerp(hip[1], foot[1], .5) + .35 + .2 * flut * Math.sin(t * TAU * 4.3 + 1)] : null;
    const seatTop = [S.hip[0] + .35, S.hip[1] + .2];
    return { J: { hip, neck, sh, hand, hand2, foot, knee, lean, headA: K.headA, bend2: rt < .5 ? 1 : -1, seated: K.seat > .5, stirrup: seatTop, stirrupA: .6 + .45 * clamp((rt - 1.3) / .8) + .22 * Math.sin(t * TAU * 3.4) }, K };
  }
  // his face through the line: proud and shouting; startled; hauling, teeth gritted; scared; hanging on
  function altmanFace(t, rt, poster) {
    if (poster || rt < .45) return { ...feel('determined', poster ? 0 : t), mouth: 'shout', idle: 0 };
    const m = emotions(rt, [[.45, 'surprised', { mouth: 'shout' }], [.8, 'scared', { mouth: 'grimace' }], [1.3, 'scared', { mouth: 'shout' }], [2.1, 'scared', { mouth: 'wobble' }], [2.6, 'scared', { mouth: 'shout' }]], { take: .6 });
    return { ...m, eyes: 'wide', squint: 0, emote: null, blink: false, idle: 0, lookX: rt > 2.1 ? .5 : 0, lookY: rt > 2.1 ? -.3 : 0 };
  }
  // a runner's gallop phase (strides): the distance it has run over Muybridge's stride, the drawings stepped on twos
  function runPh(rt, who, s) {
    const lead = who === 'altman', pi = PACK.findIndex(p => p[0] === who), rq = onTwos(rt);
    const dist = lead ? leadX(rq) - leadX(RACE.off) : packX(rq, pi) - PACK[pi][3];
    return (lead ? .1 : .35 + .29 * pi) + dist / (s * H2_STRIDE);
  }
  // one runner: horse and jockey. who: 'altman' (the lead) | 'musk' | 'zuck' | 'silks'
  function runner(t, rt, who, x, y, sc, o = {}) {
    const lead = who === 'altman', s = 46 * sc, still = o.poster || rt <= RACE.off;
    const pi = PACK.findIndex(p => p[0] === who), ph = still ? null : runPh(rt, who, s);
    const face = lead ? altmanFace(t, rt, o.poster) : { ...feel(who === 'musk' ? 'determined' : 'neutral', still ? 0 : t), idle: 0, emote: null };
    const surge = lead ? ease(seg(rt, LEAD.surge, LEAD.surge + .5)) : 0;
    const ho = { ph, coat: lead ? 'jet' : PACK[pi][4], far: lead ? 0 : PACK[pi][5], key: who, who, face,
      speed: lead ? 1 + 1.4 * surge : 1, gov: lead ? .25 + .75 * surge : .3, tilt: lead ? .05 * surge : 0 };
    let R = null, H;
    if (lead) {
      let P = null;
      H = h2Ride(x, y, s, { ...ho, reins: false, J: Fr => (P = altmanPose(t, rt, Fr, o.poster)).J });
      R = { ...P.K, J: P.J, H };
      // the megaphone: at his mouth, held down, then flung off on the surge, tumbling back over the pack
      const mw = s * 1.15;
      if (P.K.meg && H.grip) { push(); translate(H.grip[0], H.grip[1]); rotate(P.K.meg === 1 ? 0 : 1.25); bankFigure(() => bsMegaphone(mw, 'v3mega')); pop(); }
      if (!o.poster && rt > .47 && rt < 1.6) { const k = seg(rt, .47, 1.6), mx = x + (1.5 - 38 * k) * s, my = y - 9.8 * s - 12 * k * s + 26 * k * k * s; push(); translate(mx, my); rotate(-k * 13); bankFigure(() => bsMegaphone(mw, 'v3flymega')); pop(); }
      // the reins: from his far hand at the start; hauled taut from both fists; then one rein from his fist, stretched to
      // a thread (it thins and hums like a plucked string as it pays out), the other let go, flapping along the neck
      const b = H.bitW, rc = '#2E2622', pay = ease(seg(rt, 2.04, 3.1));
      boilSeed('v3 reinA');
      const taut = (g, sag, w) => v3Line(through([g, [lerp(g[0], b[0], .5), lerp(g[1], b[1], .5) + sag], b], 6), w, rc);
      if (rt < .47 || o.poster) { if (H.grip2) taut(H.grip2, 10 * sc, 2.6 * sc); }
      else if (rt < 2.1) { for (const g of [H.grip, H.grip2]) if (g) taut(g, lerp(8, 0, seg(rt, .47, .8)) * sc, 2.8 * sc); }
      else {
        const g = H.grip, Lr = Math.hypot(b[0] - g[0], b[1] - g[1]), nx = -(b[1] - g[1]) / Lr, ny = (b[0] - g[0]) / Lr, hum = (1.2 + 3.2 * pay) * sc * Math.sin(t * TAU * 21);
        const Pr = []; for (let i = 0; i <= 12; i++) { const f = i / 12, e = Math.sin(Math.PI * f) * hum; Pr.push([lerp(g[0], b[0], f) + nx * e, lerp(g[1], b[1], f) + ny * e]); }
        v3Line(Pr, lerp(2.8, .55, pay) * sc, rc, f => lerp(1.1, .9, f));
        const fw = f => Math.sin(t * TAU * 5.5 - f * 5) * 16 * sc * f;
        v3Line(through([0, .25, .5, .75, 1].map(f => [b[0] - f * 170 * sc, b[1] - 16 * sc * f + 36 * sc * f * f + fw(f)]), 5), 2.4 * sc, rc, f => 1.1 - .25 * f);
      }
    } else {
      H = h2Ride(x, y, s, { ...ho, lean: .5 });
    }
    return { H, R };
  }

  // ---- speed: engraved rules streaming back off the lead, flung turf and dust, the rails blurring past ----
  // speed lines: fine rules trailing the lead horse and its rider, flickering (a new set each drawing, 12 a second)
  function speedLines(rt, x, y, s, k, R) {
    if (k <= .02) return;
    const fr = Math.floor(rt * 12), col = BANK.ink, px = bankPx();
    boilSeed('v3 speed' + fr);
    const rows = 34;
    for (let i = 0; i < rows; i++) {
      const h = hash(i * 7.31 + fr * 3.17), yy = lerp(y - 13.5 * s, y - .6 * s, (i + .5 * h) / rows);
      if (h < .25) continue;
      const bodyRow = yy > y - 10 * s && yy < y - 4.5 * s, x0 = bodyRow ? x - 9 * s : x - 5.5 * s;
      const L = s * (6 + 11 * hash(i * 1.7 + fr * .77)) * k, gap = s * 1.2 * hash(i + fr * 1.3);
      const P = []; for (let f = 0; f <= 1.0001; f += 1 / 10) P.push([x0 - gap - L * f, yy, f < .1 ? lerp(.8, 1.6, f / .1) : lerp(1.6, .5, f)]);
      engStroke(P, eqMinW() / .77 / px, col);
      if (h > .7) { const P2 = P.map(p => [p[0] - L * .15, p[1] + 3.2 / px, p[2] * .9]); engStroke(P2, eqMinW() / .77 / px, col); }
    }
    // behind Altman's streaming body: a bundle off his feet
    if (R && R.flag > .3) {
      const fx = R.gx, fy = R.gy;
      for (let i = 0; i < 7; i++) { const yy = fy + (i - 3) * 9 * s / 46, L = s * (3 + 4 * hash(i * 2.1 + fr)) * k * R.flag, P = []; for (let f = 0; f <= 1.0001; f += .125) P.push([fx - 20 - L * f, yy + Math.sin(f * 6 + i) * 2, lerp(1.2, .5, f)]); engStroke(P, eqMinW() / .77 / px, col); }
    }
  }
  // clods of turf and puffs of dust flung up behind the lead's hind hooves, one burst per stride (pure functions of rt)
  function kickUp(rt, s, k) {
    if (k <= .02) return;
    const rate = 3.25, n0 = Math.floor((rt - RACE.off - .3) * rate), col = '#6E6048', px = bankPx();
    for (let n = n0 - 3; n <= n0; n++) {
      const te = RACE.off + .3 + n / rate; if (te < RACE.off + .2 || te > rt) continue;
      const age = rt - te, ex = leadX(te) - 5.2 * s, ey = RACE.ground - .2 * s, vx = leadV(te) * .3;
      boilSeed('v3 kick' + n);
      for (let i = 0; i < 6; i++) {   // clods: engraved lumps on arcs
        const h = hash(n * 13.7 + i * 3.3), vy = -(380 + 420 * h) * (s / 46), vxi = vx + (hash(i + n * 1.9) - .5) * 400;
        const cx = ex + vxi * age, cy = ey + vy * age + 1500 * age * age; if (cy > RACE.ground + 30) continue;
        const r = (5 + 7 * hash(i * 5.1 + n)) * (s / 46) * (1 - .3 * age), P = oval(cx, cy, r * 1.3, r, h * 6, 9);
        _paint(P, { wash: BANK.paper, ink: null }); engStrip([P[0], P[1], P[2], P[3]], [P[8], P[7], P[6], P[5]], { px, col: mixCol(BANK.ink, col, .6), dark: .55, M: 6, cross: false }); eqOutline(P, .8, mixCol(BANK.ink, col, .5), px);
      }
      for (let i = 0; i < 3; i++) {   // dust: puffs of fine curls, growing and thinning
        const h = hash(n * 5.3 + i * 7.9), cx = ex - 40 * (s / 46) * i + vx * .5 * age - 60 * age * (s / 46), cy = ey - (10 + 60 * age + 30 * h) * (s / 46), r = (22 + 90 * age + 25 * h) * (s / 46), fade = 1 - age / .9;
        if (fade <= 0) continue;
        for (let c = 0; c < 7; c++) { const a0 = h * 6 + c * .9, cr = r * (.3 + .2 * hash(c + n)), cc = [cx + Math.cos(a0) * r * .55, cy + Math.sin(a0) * r * .3], A = []; for (let a = 0; a <= 1.0001; a += .2) { const th = Math.PI * (1.1 + a * .8); A.push([cc[0] + Math.cos(th) * cr, cc[1] + Math.sin(th) * cr * .6, a < .2 || a > .8 ? .5 : .95]); } if (fade > .15) engStroke(A, eqMinW() / .77 / px, mixCol(mixCol(BANK.ink, col, .5), BANK.paper, .45 * (1 - fade))); }
      }
    }
  }
  // a rail: a white top rail and a lower one on posts every gap px; at speed the posts smear into engraved streaks
  // (trailing to the right: the camera races right past them). p: parallax (1 = the world; > 1 nearer), blur (px).
  function rail(cx, hw, y, hgt, gap, p, blur, sc2, key) {
    const off = cx * (1 - p), x0 = cx - hw, x1 = cx + hw, ink = BANK.ink, px = bankPx();
    boilSeed('v3 rail' + key);
    const bars = [[y, 7 * sc2], [y + hgt * .45, 5 * sc2]];
    for (const [yy, th] of bars) { _paint([[x0, yy - th / 2], [x1, yy - th / 2], [x1, yy + th / 2], [x0, yy + th / 2]], { wash: BANK.paper, ink: null }); v3Line([[x0, yy - th / 2], [x1, yy - th / 2]], .9 / px, ink); v3Line([[x0, yy + th / 2], [x1, yy + th / 2]], 1.3 / px, ink); v3Rule(x0, x1, yy + th * .1, yy + th / 2, () => .55, ink, { amp: 0 }); }
    for (let xl = Math.floor((x0 - off - blur) / gap) * gap; xl < x1 - off + gap; xl += gap) {
      const xp = xl + off, w = 5 * sc2, t0 = y - 9 * sc2, t1 = y + hgt;
      if (blur < 6) {
        const P = [[xp - w, t0], [xp + w, t0], [xp + w, t1], [xp - w, t1]];
        _paint(P, { wash: BANK.paper, ink: null }); v3Rule(xp + w * .1, xp + w, t0, t1, () => .5, ink, { amp: 0 }); eqOutline(P, 1, ink, px);
      } else {   // the smear: the post's height in fine rules, dark at the post and fading off to its right
        const L = blur, P = [[xp - w, t0], [xp + w + L, t0 + 3], [xp + w + L, t1 - 3], [xp - w, t1]];
        _paint(P, { wash: BANK.paper, ink: null });
        const dy = EQ.d() / px * 2.6;
        for (let yy = t0 + dy / 2; yy < t1; yy += dy) { const Q = []; for (let f = 0; f <= 1.0001; f += 1 / 8) Q.push([xp - w + (2 * w + L) * f, yy, f < .15 ? 1.1 : lerp(1.0, .42, (f - .15) / .85)]); engStroke(Q, eqMinW() / .77 / px, ink); }
        eqOutline([[xp - w, t0], [xp - w, t1]], .9, ink, px, false);
      }
    }
  }
  // the race's camera: the poster frames the four at the start; on "race" it pulls out wide to the field and swings to
  // follow the lead; once it's flat out the camera rides alongside, a touch closer, juddering with the speed
  function raceCam(rt) {
    const P = [640, 580, 1.22];
    if (rt <= RACE.off) return P;
    const k = ease(seg(rt, RACE.off, RACE.off + .6)), k2 = ease(seg(rt, .95, 1.5)), lock = ease(seg(rt, RACE.off, RACE.off + .45));
    const z = Math.exp(lerp(Math.log(P[2]), Math.log(lerp(.9, 1.15, k2)), k)), sxL = lerp(lerp(1000, 1400, ease(seg(rt, .2, .8))), 1100, k2);
    const cx = lerp(P[0], leadX(rt) + (960 - sxL) / z, lock), cy = lerp(P[1], RACE.ground - (905 - 540) / z, k);
    const jd = clamp((leadV(rt) - 2600) / 1000) * 2.6, fr = Math.floor(rt * 24);
    return [cx + jd * (hash(fr * 1.37) - .5), cy + jd * (hash(fr * 2.71) - .5), z];
  }
  // the whole race frame at race time rt (1920 × 1080, its own camera); o.poster: the still first frame (on the wall);
  // o.clip: clipped to its frame (a poster, a screen: the scene's culling margin would spill round it); o.cam: another
  // camera on the meeting ([cx, cy, zoom]: the bookie's back-wall screen)
  function raceScene(t, rt, o = {}) {
    look('bank'); boilSeed('v3 race');
    if (o.clip) { flushBrush(); push(); beginClip(); noStroke(); fill(0); rect(0, 0, W, H); endClip(); }
    const [cx, cy, z] = o.cam || raceCam(rt), hw = W / z * .5 + 160, hh = H / z * .5 + 160, top = cy - hh, bot = cy + hh;
    const vcam = rt > RACE.off ? leadV(rt) * ease(seg(rt, RACE.off, RACE.off + .45)) : 0, shut = .75 / 24;   // (the camera's speed; a 3/4-frame shutter for the blur)
    push(); translate(W / 2, H / 2); scale(z); translate(-cx, -cy);
    v3Engrave(1 / z, () => {   // (the sets' and the jockeys' engraving at the same size on screen at any zoom)
    _paint([[cx - hw, top], [cx + hw, top], [cx + hw, bot], [cx - hw, bot]], { wash: BANK.paper, ink: null });
    // the sky: fine horizontal rules, dense at the top and thinning to paper toward the horizon; far clouds
    v3Rule(cx - hw, cx + hw, top, 470, y => .3 * clamp((330 - y) / 450) + .05, mixCol(BANK.ink, '#526C9C', .35), { amp: .6 });
    const sunX = 540 + cx * .93;
    if (Math.abs(sunX - cx) < hw + 200) {
      _paint(oval(sunX, 250, 150, 150, 0, 40), { wash: BANK.paper, ink: null });
      guilloche(sunX, 250, 58, 146, { n: 14, lobes: 13, w: .45, twist: .2, steps: 260, col: mixCol(BANK.ink, '#A8843A', .4) });
      eqOutline(oval(sunX, 250, 50, 50, 0, 28), .9, BANK.ink, bankPx(), true, { p0: .95, p1: .3 });
    }
    for (let i = -1; i < 7; i++) {
      const c0 = -200 + i * 700 + cx * .9, c1 = 150 + 80 * (i & 1) + 20 * hash(i);
      if (Math.abs(c0 - cx) > hw + 260) continue;
      boilSeed('v3 cloud' + i);
      const puffs = [[-140, 20, 46], [-70, -8, 60], [15, -24, 70], [100, -4, 56], [160, 22, 42], [-40, 28, 50], [70, 28, 50]], P = [];
      for (let q = 0; q < 64; q++) {   // the union of the puffs, seen from its middle; its base flattened
        const a = q / 64 * TAU, ux = Math.cos(a), uy = Math.sin(a); let best = 0;
        for (const [bx, by, br] of puffs) { const dd = bx * ux + by * uy, disc = br * br - (bx * bx + by * by - dd * dd); if (disc >= 0) best = Math.max(best, dd + Math.sqrt(disc)); }
        P.push([c0 + ux * best, Math.min(c1 + 46, c1 + uy * best * .85)]);
      }
      _paint(P, { wash: BANK.paper, ink: null });
      engStrip([[c0 - 180, c1 + 44], [c0 + 205, c1 + 44]], [[c0 - 150, c1 + 16], [c0 + 170, c1 + 16]], { px: bankPx(), col: mixCol(BANK.ink, '#526C9C', .3), dark: .05, flat: .8, cross: false, M: 12, clip: P });
      eqOutline(P, .7, mixCol(BANK.ink, BANK.paper, .2), bankPx(), true, { p0: .92, p1: .5 });
    }
    // the grandstand (slow parallax): a long Victorian stand, pitched roof, a clock turret with a flag, ironwork under
    // the eaves, the crowd (demo/cast/crowd.js: they cheer from the off). Streaks of speed across it when flat out.
    const gs = cx * .82, sb = vcam * .18 * shut;
    for (let i = -2; i < 12; i++) {
      const x0 = -800 + i * 900 + gs, x1 = x0 + 760;
      if (x1 < cx - hw || x0 > cx + hw) continue;
      boilSeed('v3 stand' + i);
      piece([[x0, 560], [x0 + 40, 470], [x1 - 40, 470], [x1, 560]], '#8E887A', { sw: 1, key: 'v3gsr' + i });
      piece([[x0 + 10, 560], [x1 - 10, 560], [x1 - 10, 690], [x0 + 10, 690]], '#CBC4B4', { sw: 1, key: 'v3gsb' + i });
      crowdStand(x0 + 16, x1 - 16, [594, 626, 658, 690], o.poster ? 0 : t, { seed: ((i % 7) + 7) % 7 + 2, cheer: rt > RACE.off });
      for (let c = 0; c < 9; c++) dline([[x0 + 30 + c * 85, 560], [x0 + 30 + c * 85, 690]], .8, BANK.ink);
      for (let a = 0; a < 18; a++) { const ax = x0 + 20 + a * 40, A = []; for (let q = 0; q <= 6; q++) A.push([ax + q / 6 * 40, 560 + 9 * Math.sin(q / 6 * Math.PI)]); dline(A, .6, BANK.ink); }   // the eaves' ironwork
      piece([[x0 + 350, 470], [x0 + 350, 400], [x0 + 380, 370], [x0 + 410, 400], [x0 + 410, 470]], '#B0A998', { sw: 1, key: 'v3gst' + i });
      piece(oval(x0 + 380, 425, 16, 16, 0, 16), '#F2EFE8', { sw: .8, key: 'v3gsc' + i });
      dline([[x0 + 380, 425], [x0 + 380, 414]], .8, BANK.ink); dline([[x0 + 380, 425], [x0 + 388, 428]], .8, BANK.ink);   // (clock hands)
      dline([[x0 + 380, 370], [x0 + 380, 322]], 1, BANK.ink);   // the flag, streaming
      const fw = f => Math.sin(t * 7 - f * 4 + i) * 5 * f;
      piece([[x0 + 380, 324], ...[.25, .5, .75, 1].map(f => [x0 + 380 + 46 * f, 326 + fw(f)]), ...[1, .5].map(f => [x0 + 380 + 44 * f, 344 + fw(f) - 6 * f])], '#B5392C', { sw: .7, key: 'v3flag' + i });
      if (sb > 3) v3Rule(x0, x1, 470, 690, y => .12 + .08 * hash(Math.round(y)), BANK.ink, { amp: 0, dk: 2.2, pk: (x, y) => hash(Math.round(x / 60) * 3.1 + Math.round(y)) < .35 ? 1 : 0 });
    }
    // the turf, ruled (paler far, a little deeper near), the far rail at the edge of the track
    _paint([[cx - hw, 690], [cx + hw, 690], [cx + hw, bot], [cx - hw, bot]], { wash: BANK.paper, ink: null });
    v3Rule(cx - hw, cx + hw, 700, bot, y => .08 + .11 * clamp((y - 700) / 500), mixCol(BANK.ink, '#52806A', .35), { amp: 1.4, wl: 140 });
    rail(cx, hw, RACE.rail, 42, 190, 1, vcam * shut, 1, 'far');
    // the winning post: a white pole and a disc (smeared as it whips past)
    const fx = RACE.fin, fb = vcam * shut;
    if (Math.abs(fx - cx) < hw + 300) {
      boilSeed('v3 fin');
      const pole = [[fx - 9, 380], [fx + 9 + fb, 380], [fx + 9 + fb, RACE.rail + 40], [fx - 9, RACE.rail + 40]], disc = oval(fx + fb * .5, 380, 48 + fb * .5, 48, 0, 30);
      _paint(pole, { wash: BANK.paper, ink: null }); eqOutline(pole, 1.1, BANK.ink, bankPx());
      _paint(disc, { wash: BANK.paper, ink: null }); v3Rule(fx - 48, fx + 48 + fb, 340, 420, y => .3 + .3 * (y > 380), BANK.ink, { amp: 0 }); eqOutline(disc, 1.2, BANK.ink, bankPx());
    }
    // the pack (far lanes first), then the lead horse in the near lane; its dust and speed lines behind it
    // (each on a vignette of paper: the figures part from the ruled ground, the bank look's figure and ground)
    for (let i = PACK.length - 1; i >= 0; i--) { const [who, y, sc] = PACK[i], s = 46 * sc, px2 = packX(rt, i); bankHalo(px2, y - 5.5 * s, 9.5 * s, 7 * s, .5); runner(t, rt, who, px2, y, sc, { poster: o.poster }); }
    const lx = leadX(rt), speedK = clamp((leadV(rt) - 900) / 1800);
    kickUp(rt, 46 * 1.05, speedK);
    const pre = altPreview(t, rt);
    speedLines(rt, lx, RACE.ground, 46 * 1.05, speedK, pre);
    bankHalo(lx - (pre ? 1.5 : 0) * 48, RACE.ground - 6 * 48, 10.5 * 48, 8 * 48, .55);
    runner(t, rt, 'altman', lx, RACE.ground, 1.05, { poster: o.poster });
    // the near rail, flashing past in the foreground (nearer than the track: faster)
    rail(cx, hw, RACE.near, 60, 330, 1.3, vcam * 1.3 * shut, 1.35, 'near');
    }, cx, cy);
    pop();
    raceBorder();
    if (o.clip) { flushBrush(); pop(); }
  }
  // (the lead's lift and Altman's placement before drawing them: for the speed lines laid down behind them)
  function altPreview(t, rt) {
    if (rt <= 1.2) return null;
    const s = 46 * 1.05, ph = runPh(rt, 'altman', s), Fr = h2Frame(h2FrameAt(ph)), b0 = Fr.src.body, b = [b0[0], b0[1], b0[2] + .05 * ease(seg(rt, LEAD.surge, LEAD.surge + .5))];
    const P = altmanPose(t, rt, Fr, false), x = leadX(rt), w = p => { const q = h2B2L(b, p[0], p[1]); return [x + q[0] * s, RACE.ground + q[1] * s]; };
    const f = w(P.J.foot);
    return { flag: clamp((rt - 1.3) / .6), gx: f[0], gy: f[1] };
  }

  // ---------------------------------------------------------------------------------------------------------------
  // B1
  // ---------------------------------------------------------------------------------------------------------------
  SHOT.B1 = risoShot((t, lt, dur) => {
    const T = B1T;
    if (t < T.out[0]) {
      const [cx, cy, z] = b1Cam(t), uni = t >= T.uni ? 1 : 0;
      camBegin(cx, cy, z);
      raveInterior(t, { uni });
      camEnd();
      look('xerox'); xeroxGrit(t, .6);
      if (uni && t < T.uni + .14) { const f = 1 - seg(t, T.uni + .03, T.uni + .14); v3Spot(box(-60, -60, W + 60, H + 60), 'm', .9 * f); v3Spot(box(-60, -60, W + 60, H + 60), 'y', .7 * f); }
    } else {
      // pull back out through the window into the rain: the glazing's light fills the frame, then shrinks into the wall
      const k = seg(t, T.out[0], T.out[1]), e = 1 - Math.pow(1 - k, 3), Z0 = W / WIN.w;
      const EF = [1000, 600, 1.15], DF = B1_DF, dk = ease(seg(t, OUT.dash - .1, OUT.open + .1));
      const z = Math.exp(lerp(Math.log(Z0), Math.log(lerp(EF[2], DF[2], dk)), e)), cx = lerp(WIN.cx, lerp(EF[0], DF[0], dk), e), cy = lerp(WIN.cy, lerp(EF[1], DF[1], dk), e);
      const ic = b1Cam(Math.min(t, T.out[0]));
      camBegin(cx, cy, z);
      exterior(t, { cam: ic, uni: 1, lite: e > .3, bars: seg(e, .45, 1), glass: b1Glass(t), door: b1Door(t), gate: b1Gate(t), her: b1Her(t), him: b1Him(t), zoom: z });
      camEnd();
      look('xerox'); xeroxGrit(t, .6);
    }
    // the burn runs on through the cut (the user: the hole shows the rave straight away, never a mostly black frame): round
    // the hole, C2f's last frame held still (the burning poster, the two of them), the rim's bands on it, no black round it.
    // (Drawn inside C2f's own hole, lt < 0, it keeps the plain rim: clipped away there, and no loop back into C2f.)
    look('ink');
    const c2fEnd = B1T.t0 - .001;
    if (lt >= 0 && lt < 1) burnReveal(seg(lt, 0, .9), t, { outside: () => { stillDrawing(() => drawShot('C2f', c2fEnd), c2fEnd); look('ink'); } });
    else if (lt < 1) burnReveal(seg(lt, 0, .9), t);
  });

  // ---------------------------------------------------------------------------------------------------------------
  // V3a: the rave's strobe; the club's door shuts on them; on a flash the camera turns across the road: the bookmaker's,
  // the two of them stepping up out of the road under its awning. She rolls the flyer into a cone and does the boss on
  // the window's screen ("If we don't, then China will!"); him ("So that's the reason we're all in."), his eyes going up
  // to the odds board as the prices move and a punter slams down his slip; push into the window's screen: the race
  // comes alive ("A race to build a thing...")
  // ---------------------------------------------------------------------------------------------------------------
  // (cut: the turn across the road on the downbeat, where it was a beat later after the club's door shut behind the
  // characters: the bookie's wide held .44 s between two flash-cuts, too short to find a new place in; now .88 s)
  const V3A = { t0: BAR(98), cut: BAR(98), two: BAR(98) + BEAT * 2, her: WT('If we', 0), china: WT('If we', 4), will: WT('If we', 5), him: WT('If we', 6), reason: WT('If we', 9), we: WT('If we', 10), all: WT('If we', 11), inW: WT('If we', 12), race: WT('A race', 0) - .02, end: BAR(102) };
  // (strobe and jump-cuts on the beats: on the eighths they fired every 0.22 s, a run of double jumps)
  const strobeK = t => { if (t >= BAR(99)) return 0; const f = frac(bpo(t)); return Math.exp(-f * 18); };
  // V3a's camera: B1's last framing (the door shuts); on the next strobe the turn across the road to the bookie's wide
  // (the view sliding in as the whip settles); the strobe's next beat jumps in to the two-shot of her and the window's
  // screen; a whip to him (the odds board, the punter under it); then the push into the window's screen
  const V3A_WIDE = [960, 560, .85], V3A_TWO = [1420, 468, 2.05], V3A_HIM = [740, 560, 1.7];
  function v3aCam(t) {
    const A = V3A, two = V3A_TWO, hi = V3A_HIM, tv = [BK.tv.cx, BK.tv.cy, W / BK.tv.w];
    if (t < A.cut) return B1_DF;
    if (t < A.two) { const e = easeOut(seg(t, A.cut, A.cut + .24)); return [V3A_WIDE[0] - 150 * (1 - e), V3A_WIDE[1], V3A_WIDE[2] * (1 + .03 * seg(t, A.cut, A.two))]; }
    if (t < A.him - .16) { const d = seg(t, A.two, A.him); return [two[0] + 10 * d, two[1], two[2] * (1 + .03 * d)]; }
    if (t < A.race - .42) { const k = ease(seg(t, A.him - .16, A.him + .02)); return [lerp(two[0], hi[0], k), lerp(two[1], hi[1], k), lerp(two[2], hi[2], k) * (1 + .03 * seg(t, A.him, A.race))]; }
    const k = seg(t, A.race - .42, A.race), e = k * k * (3 - 2 * k);
    return [lerp(hi[0], tv[0], e), lerp(hi[1], tv[1], e), Math.exp(lerp(Math.log(hi[2] * 1.03), Math.log(tv[2]), e * e))];
  }
  const mixSpec = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k), k < .5 ? a[3] : b[3], 1, lerp(a[5], b[5], k), 'u'];
  // her: up out of the road onto the pavement under the awning, the flyer held over her head; it comes down and rolls
  // into a cone; up to her mouth for the boss's line, chin up to him on the screen; the other arm flung out on "China",
  // a fist on "will!". { x, y, u, o }
  function v3aHer(t) {
    const A = V3A, [x0, y0, u0] = BK.her, inK = 1 - Math.pow(1 - seg(t, A.cut - .06, A.cut + .4), 2);
    const x = lerp(x0 - 90, x0, inK), y = lerp(y0 + 170, y0, inK), u = u0 * lerp(1.14, 1, inK);
    const over = 1 - ease(seg(t, A.cut + .26, A.cut + .44)), roll = seg(t, A.cut + .36, A.her - .1);
    const up = ease(seg(t, A.her - .25, A.her - .02)) * (1 - ease(seg(t, A.him + .1, A.him + .45)));
    const speaking = t >= A.her - .05 && t < A.him;
    const mood = emotions(t, [[A.cut, 'bored', { lookX: .5, lookY: -.3 }], [A.cut + .34, 'bored', { lookX: .7, lookY: -.7 }], [A.her - .3, 'sad', { lookX: .5, lookY: -.6 }], [A.him + .1, 'smug', { lookX: -.6 }]], { take: .6 });
    const point = seg(t, A.china - .1, A.china + .05) * (1 - seg(t, A.him, A.him + .3));
    // (up: the cone's mouthpiece on her lips, her fist on the cone beside her mouth, the bell up at the boss on the TV)
    const Lc = [lerp(.4, 1.73, up), lerp(-10, -13.62, up), lerp(.3, .5, up), 'hold', 1, lerp(.1, -.45, up), 'u'], Lh = [1.4, -23, .25, 'hold', 1, Math.PI - .15, 'u'];
    const L = over > 0 ? mixSpec(Lh, Lc, 1 - over) : Lc;
    const R = point > 0 ? [lerp(.9, 2.3, point), lerp(.6, -1.3, point), .1, t > A.will ? 'fist' : 'point', 0] : [1.1, .7, .3, 'relax', 0];
    return { x, y, u, o: { ...mood, emote: null, mouth: speaking ? (talk(t, 'If we') ? 'shout' : 'open') : mood.mouth, eyes: speaking ? 'sad' : mood.eyes, flip: false, pose: { L, R }, holdL: s => flyer(s * 1.05, roll, 'v3flyh'), tilt: speaking ? -.12 : 0, dy: (mood.dy || 0) - (speaking ? .15 * pulse(t, 8) : 0), walk: inK > 0 && inK < 1 ? (y0 + 170 - y) / (1.6 * u0) : null } };
  }
  // him: up out of the road a beat behind her, hunched; he shakes the rain off; watches her do the boss; shrugs on
  // "reason"; on "we're all in" his eyes go up to the odds board. { x, y, u, o }
  function v3aHim(t) {
    const A = V3A, [x0, y0, u0] = BK.him, inK = 1 - Math.pow(1 - seg(t, A.cut - .02, A.cut + .46), 2);
    const x = lerp(x0 - 110, x0, inK), y = lerp(y0 + 185, y0, inK), u = u0 * lerp(1.15, 1, inK);
    const sk = seg(t, A.cut + .46, A.cut + .8), shake = sk > 0 && sk < 1 ? Math.sin(sk * TAU * 3) * (1 - sk) : 0;
    const sh = seg(t, A.reason - .12, A.reason + .12) * (1 - seg(t, A.we - .15, A.we + .1)), glance = ease(seg(t, A.we - .1, A.we + .1));
    const mood = emotions(t, [[A.cut, 'sad', { lookY: .3 }], [A.cut + .6, 'bored', { lookX: .6, lookY: -.1 }], [A.him - .25, 'bored', { lookX: .7 }], [A.we - .1, 'neutral', { lookX: .5, lookY: -1 }]], { take: .5 });
    return { x, y, u, o: { ...mood, emote: null, mouth: t >= A.him && t < A.race - .2 ? (talk(t, 'If we') ? 'open' : 'flat') : mood.mouth, lookX: lerp(mood.lookX ?? 0, .5, glance), lookY: lerp(mood.lookY ?? 0, -1, glance), flip: false, pose: sh > .01 ? pPoses(t, [[A.reason - .12, 'pockets'], [A.reason - .06, 'shrug'], [A.we - .1, 'pockets']]) : 'pockets', tilt: -.1 * sh + .12 * shake - .05 * glance, walk: inK > 0 && inK < 1 ? (y0 + 185 - y) / (1.6 * u0) : null } };
  }
  SHOT.V3a = risoShot((t, lt, dur) => {
    const A = V3A;
    if (t >= A.race) { raceScene(t, t - A.race, {}); return; }
    const [cx, cy, z] = v3aCam(t), sk = strobeK(t);
    // the screen's riso re-print fades as the push zooms into it: by the zoom's way from the push's start to the screen
    // filling the frame (on its log, as the move runs), so it's gone the moment the race fills the frame
    const z0 = V3A_HIM[2] * 1.03, z1 = W / BK.tv.w, copy = t < A.race - .42 ? 1 : 1 - ease(Math.log(z / z0) / Math.log(z1 / z0));
    camBegin(cx, cy, z);
    if (t < A.cut) exterior(t, { cam: [960, 540, 1], uni: 1, lite: true, bars: 1, strobe: sk, her: b1Her(t), him: b1Him(t), door: b1Door(t), gate: b1Gate(t), zoom: z });
    else bookies(t, { zoom: z, glow: sk, fx: 1 - ease(seg(t, A.race - .34, A.race - .05)), copy, her: v3aHer(t), him: v3aHim(t) });
    camEnd();
    look('xerox');
    // the rave's strobe (from behind us once we've turned): a pink wash, its peaks bleached to paper; the cut lands on a
    // flash of its own (the beat's peak can fall between frames)
    const fl = t >= A.cut && t < A.cut + .1 ? 1 - (t - A.cut) / .1 : 0, pk = Math.max(sk, fl);
    if (pk > .05) { v3Spot(box(-60, -60, W + 60, H + 60), 'm', .35 * pk); if (pk > .7) _paint(box(-60, -60, W + 60, H + 60), { wash: XEROX.paper, washOp: 200 * (pk - .7) / .3, ink: null }); }
    xeroxGrit(t, .6);
  });
  // ---------------------------------------------------------------------------------------------------------------
  // V3b: the race carries on on his phone: pull back from it (the meeting's stream at the top of the screen, the race
  // card under it, the same silks and prices as the bookie's boards) to the phone in his hand in the rain; the bot check
  // pops up over the race. Then the captcha of nine little buses; he taps all nine; it shakes no anyway.
  // ---------------------------------------------------------------------------------------------------------------
  const V3B = { t0: BAR(102), look: BAR(102) + .62, cap: BAR(102) + .64, push: WT('I click', 0) - .3, verify: WT('I click', 7), end: BAR(104) };
  // the stream's video: 16:9 across the phone's width, under the status bar (phone units, the screen 520 × 960)
  const PVID = { y: 64, h: 520 * 9 / 16 };
  // the phone's screen before the bot check (card): the race streaming (the engraving drawn into the video, at the size
  // it's seen: z the camera's zoom), a live scrub bar, then the race card: a row per runner (silks, a name bar, a price)
  function phoneStream(t, rt, z) {
    boilSeed('v3 stream');
    piece(box(0, 0, 520, 960), '#1C1E26', { ink: null, key: 'v3pss', lift: 0, flatCard: true });
    for (let i = 0; i < 3; i++) piece(oval(420 + i * 26, 28, 7, 7, 0, 10), '#8A8E96', { ink: null, key: 'v3psb' + i, lift: 0, flatCard: true });
    look('bank');
    push(); translate(0, PVID.y); scale(520 / W);
    v3Engrave(Math.max(1, 1 / ((520 / W) * z)), () => raceScene(t, rt, { clip: true }), 960, 540);
    pop();
    look('card');
    const sy = PVID.y + PVID.h + 26;
    piece(box(24, sy, 496, sy + 6), '#4A4E5A', { ink: null, key: 'v3psbar', lift: 0, flatCard: true });
    piece(box(24, sy, 404, sy + 6), '#E8384A', { ink: null, key: 'v3psbar2', lift: 0, flatCard: true });
    piece(oval(404, sy + 3, 10, 10, 0, 12), '#F2F0EA', { ink: null, key: 'v3psknob', lift: 1, flatCard: true });
    for (let i = 0; i < 4; i++) {
      const ry = sy + 40 + i * 118, [col, p0, p1] = BK_RUN[i];
      piece(box(20, ry, 500, ry + 104), '#262A34', { ink: null, key: 'v3psrow' + i, lift: 0, flatCard: true });
      piece(box(40, ry + 20, 104, ry + 84), col, { sw: 1.2, key: 'v3pssk' + i, lift: 1 });
      if (i === 0) piece([[40, ry + 64], [104, ry + 34], [104, ry + 48], [40, ry + 78]], '#F2F0EA', { ink: null, key: 'v3pssh', lift: 0, flatCard: true });
      piece(box(128, ry + 42, 128 + 150 + 70 * hash(i * 2.3), ry + 60), '#6A7080', { ink: null, key: 'v3psnm' + i, lift: 0, flatCard: true });
      price(p1, 476, ry + 30, 44, '#F2F0EA');
    }
  }
  // the bot check popping up over the stream (k 0..1): the stream dims, the captcha scales up to fill the screen
  function phoneCheck(t, k) {
    if (k <= 0) return;
    _paint(box(0, 0, 520, 960), { wash: '#0A0C12', washOp: 150 * clamp(k * 2), ink: null });
    const s = lerp(.55, 1, backOut(k));
    push(); translate(260, 480); scale(s); translate(-260, -480); captcha(t, 0, 0); pop();
  }
  // the nine cells of the captcha, in phone-screen units (the screen is 520 × 960, origin top left)
  const CAP = { x0: 40, y0: 250, cell: 146, gap: 7 };
  const capCell = (i) => { const r = Math.floor(i / 3), c = i % 3; return [CAP.x0 + c * (CAP.cell + CAP.gap), CAP.y0 + r * (CAP.cell + CAP.gap)]; };
  // a little red bus (a pictogram, card pieces): cx, cy centre, s width, facing f (+1 right)
  function busPic(cx, cy, s, f = 1, key = 'bus') {
    const S = P => P.map(([a, b]) => [cx + a * s * f, cy + b * s]);
    piece(S([[-.5, -.36], [.44, -.36], [.5, -.3], [.5, .26], [-.5, .26]]), '#C8322E', { sw: 1.2, key: key + 'b', lift: 2 });
    for (const row of [-.25, -.02]) piece(S([[-.42, row], [.3, row], [.3, row + .13], [-.42, row + .13]]), '#F2E8C8', { ink: null, key: key + 'w' + row, lift: 0, flatCard: true });
    piece(S([[.34, -.02], [.46, -.02], [.46, .2], [.34, .2]]), '#F2E8C8', { ink: null, key: key + 'd', lift: 0, flatCard: true });
    for (const wx of [-.3, .28]) piece(oval(cx + wx * s * f, cy + .27 * s, .1 * s, .1 * s, 0, 12), '#1E1E24', { sw: .8, key: key + 'wh' + wx, lift: 1, flatCard: true });
  }
  // the phone's screen content: status bar, the captcha's header (the target: a bus), the grid, the verify button.
  // ticks: how many cells are ticked (0..9); no 0..1: the shake and red cross; reset: cells untick
  function captcha(t, ticks, no) {
    const sh = no > 0 && no < 1 ? Math.sin(no * 38) * 26 * (1 - no) : 0;
    piece(box(0, 0, 520, 960), '#F2F0EA', { ink: null, key: 'v3scrn', lift: 0, flatCard: true });
    for (let i = 0; i < 3; i++) piece(oval(420 + i * 26, 28, 7, 7, 0, 10), '#8A8E96', { ink: null, key: 'v3sb' + i, lift: 0, flatCard: true });
    piece(box(24, 70, 496, 224), '#3E6FC8', { ink: null, key: 'v3caphd', lift: 1, flatCard: true });
    busPic(110, 147, 110, 1, 'v3hdbus');
    for (let i = 0; i < 3; i++) dline([[210, 118 + i * 30], [lerp(420, 470, hash(i)), 118 + i * 30]], 3, '#E8EEF8');
    push(); translate(sh, 0);
    for (let i = 0; i < 9; i++) {
      const [x, y] = capCell(i), on = i < ticks;
      piece(box(x, y, x + CAP.cell, y + CAP.cell), on ? '#B8CCEE' : '#D8DCE2', { sw: 1, key: 'v3cell' + i, lift: 1 });
      busPic(x + CAP.cell / 2, y + CAP.cell / 2 + 6, CAP.cell * (on ? .56 : .66), i % 2 ? -1 : 1, 'v3cb' + i);
      if (on) { piece(oval(x + CAP.cell - 26, y + 26, 18, 18, 0, 16), '#3E6FC8', { ink: null, key: 'v3tk' + i, lift: 2, flatCard: true }); dline([[x + CAP.cell - 35, y + 26], [x + CAP.cell - 28, y + 33], [x + CAP.cell - 16, y + 18]], 3, '#F2F0EA'); }
    }
    pop();
    // the verify button
    piece(box(300, 740, 480, 810), '#3E6FC8', { ink: null, key: 'v3verify', lift: 2 });
    dline([[370, 775], [385, 790], [410, 760]], 4, '#F2F0EA');
    if (no > 0) { look('card'); bsDenied(260 + sh, 480, 170, no * 1.4, 'v3capno'); }
  }
  // the close-up: his left hand holds the phone, his right index finger taps the cells
  const PH = { x: 700, y: 60, w: 520, h: 960, sc: 1 };
  function phoneClose(t, ticks, no, tapAt, tapK, away = 0, scr = null) {
    look('card');
    boilSeed('v3 phoneclose');
    piece(box(-60, -60, W + 60, H + 60), '#2A3040', { ink: null, key: 'v3pcbg', lift: 0, flatCard: true });
    // out of focus behind: the street's lights in the rain (flat shapes)
    piece(box(-60, 80, 700, 700), '#4A5870', { ink: null, key: 'v3pcb1', lift: 0, flatCard: true });
    piece(box(1300, 200, W + 60, 900), '#3E4658', { ink: null, key: 'v3pcb2', lift: 0, flatCard: true });
    const { x, y, w, h } = PH;
    piece(curvy(box(x - 26, y - 30, x + w + 26, y + h + 40), 3), '#1E1C24', { sw: 2, key: 'v3phbody', lift: 10 });
    clipPoly(box(x, y, x + w, y + h), () => { push(); translate(x, y); if (scr) scr(); else captcha(t, ticks, no); pop(); });   // (the glass: the bot check overshoots as it pops up, the grid shakes)
    // the left hand round the phone's edge (fingers over the right edge), the parka cuff
    const C = HIM_C.col;
    limb([[x - 260, H + 120], [x - 150, y + h - 40], [x - 30, y + h - 190]], 150, 120, C.coat, { sw: 2, shade: C.coatDk, key: 'v3arml' });
    hand(x - 20, y + h - 200, -.25, 120, { pose: 'hold', col: C.skin, sw: 1.8, key: 'v3handl', maxTone: .45 });
    // the right index finger, tapping
    const [tx, ty] = tapAt, press = tapK;
    const fx = x + tx + 8 + 500 * ease(away), fy = y + ty + 8 + 26 * (1 - press) + 400 * ease(away);
    limb([[W + 200, H + 160], [fx + 300, fy + 330], [fx + 110, fy + 150]], 160, 130, C.coat, { sw: 2, shade: C.coatDk, key: 'v3armr' });
    hand(fx + 100, fy + 140, -2.2, 115, { pose: 'point', col: C.skin, sw: 1.8, key: 'v3handr', maxTone: .45, mirror: true });
  }
  SHOT.V3b = risoShot((t, lt, dur) => {
    const B = V3B, rt = t - V3A.race;
    if (t < B.push) {
      // pull back from the race (it carries on past the post) to his phone, the stream at the top of its screen, in his
      // hand in the rain; the bot check pops up over the race; his finger comes in to start on the buses
      const k = seg(t, B.t0, B.look), e = 1 - Math.pow(1 - k, 3), Z0 = W / 520, c0 = [PH.x + 260, PH.y + PVID.y + PVID.h / 2];
      const z = Math.exp(lerp(Math.log(Z0), 0, e)), capK = seg(t, B.cap, B.cap + .2), away = 1 - ease(seg(t, B.push - .24, B.push));
      camBegin(lerp(c0[0], 960, e), lerp(c0[1], 540, e), z);
      phoneClose(mt(t), 0, 0, [560, 1000], 1, away, () => { if (capK < 1) phoneStream(t, rt, z * PH.sc); phoneCheck(t, capK); });
      camEnd();
    } else {
      // the close-up on the phone: nine taps on the words, verify, no
      const T9 = []; for (let i = 0; i < 9; i++) T9.push(lerp(B.push + .32, B.verify - .12, i / 8));
      let n = 0; while (n < 9 && t >= T9[n]) n++;
      const tapT = n < 9 ? T9[n] : B.verify, prevT = n > 0 ? (n < 9 ? T9[n - 1] : T9[8]) : B.push;
      const target = n < 9 ? capCell(n).map(v => v + CAP.cell / 2) : [390, 775];
      const from = n > 0 ? capCell(Math.min(n - 1, 8)).map(v => v + CAP.cell / 2) : [560, 1000];
      const mv = ease(seg(t, prevT + .02, tapT - .03)), at = [lerp(from[0], target[0], mv), lerp(from[1], target[1], mv)];
      const press = Math.max(Math.exp(-Math.max(0, t - tapT) * 30) * (t >= tapT ? 1 : 0), 1 - mv);
      const no = 0, ticks = n;
      const tt = mt(t), zin = ease(seg(t, B.end - .3, B.end));
      camBegin(lerp(960, PH.x + CAP.x0 + 1.5 * CAP.cell + CAP.gap, zin), lerp(540, PH.y + CAP.y0 + 1.5 * CAP.cell + CAP.gap, zin), 1 + 1.4 * zin + .015 * seg(t, B.push, B.end));
      phoneClose(tt, ticks, no, at, t > B.verify + .25 ? 0 : press, seg(t, B.verify + .1, B.end - .2));
      camEnd();
    }
  });

  // ---------------------------------------------------------------------------------------------------------------
  // V3c: "the online high street" (the user's pick). The joke is the bot check: the test built to keep bots out stops
  // him, and the bots sail through every door. The copier's light bar sweeps his captcha into riso; on "bot" it shakes
  // no; pull back: it's the lock on a door (a bot-check panel on his corner shop's pilaster) and he's stood at it, still
  // clicking buses. Across the road, the high street of the services we rely on, every door locked with a website's bot
  // check instead of a key: the bank's two-factor keypad, the GP's password padlock (its dots), the school's traffic-light
  // captcha, the council's "No bots" sign. The Codex pets, each on an errand for someone (a task card in hand), clear
  // them cheerfully, one door a sung syllable from "pick": the cat hops, ticks his door's box and trots in past him (his
  // captcha: no, again; the door shuts on him); then across the road, right to left toward him ("ev-ery lock on ev-ery"),
  // each door swings open with a tick, a light goes on inside, someone turns. Push in on him: the last human outside a
  // locked door. Every sign is a pictogram (a coin, a cross, a mortarboard, columns, a basket): no words.
  // ---------------------------------------------------------------------------------------------------------------
  // The V3c → V3d cut (the user's pick, 2026-09-25: late): .5 s after the bar, so the push-in on him lands and holds as
  // he sings "door we've got" to us, and the line ends on V3c's picture as it rolls up out of the gate; V3d's pull-back
  // from the leader is quicker, keeping a hold before the push into the screen. The subtitle's switch to card is in step
  // (K_WORLD in karaoke.js, 189.8). (The old cut was on the bar, on "door", with "we've got" sung over V3d's leader.)
  const V3CD_CUT = BAR(106) + .5;
  const V3C = {
    t0: BAR(104), no: WT('I click', 11) - .03,                     // "bot": the close-up's captcha shakes no
    pull: [WT('I click', 11) + .13, WT('While', 1) + .2],           // the pull-back from the lock to the street
    tap: WT('I click', 11) + .56,                                   // ... and he's clicking buses again
    cat: WT('While', 0) - .12,                                      // the cat trots in along his pavement
    hits: [2, 3, 4, 5, 6].map(i => WT('While', i) - .02),           // pick · ev(ery) · lock · on · ev(ery): a door each
    push: [WT('While', 6) + .02, V3CD_CUT - .3], end: V3CD_CUT,    // the push in on him, landing and holding before the cut to V3d (V3CD_CUT)
  };
  // The street in world px (= the screen in the wide): the far shopfronts stand on fg; the kerbs; his pavement at ng.
  // (wc: the wide's camera centre, set low so the street sits above the subtitles)
  // (him: 40 px further from his lock than he was, so his arm reaches it with the elbow open: stood at 612 the hand was
  // half an arm's length from the shoulder and the arm folded double, its outline notched at the elbow)
  const HS = { fg: 588, kerb: [624, 792], ng: 1010, x0: 500, w: 350, pu: 24, lockY: 528, him: [652, 1010, 30], wc: [960, 635] };
  // a far shop's plan: its edges, the door (anchored to the right: a pier for the lock, then the window, to the left)
  const hsGeo = i => { const x0 = HS.x0 + i * HS.w, x1 = x0 + HS.w, d1 = x1 - 34, d0 = d1 - 96; return { x0, x1, d0, d1, pier: d0 - 44, lockX: d0 - 22, mark: d0 - 72, mid: (x0 + x1) / 2 }; };
  // His corner shop, a wing flat at the left (his side of the road): the door, the pilaster the lock is on. The lock is
  // V3b's phone as a panel (520 × 960 units, the captcha at CAP), s world px a unit, its screen's top-left at (x, y).
  const HSN = { d0: 130, d1: 352, dTop: 500, p1: 512, pan: { x: 392, y: 700, s: .1538 } };
  const hsP = (a, b) => [HSN.pan.x + a * HSN.pan.s, HSN.pan.y + b * HSN.pan.s];
  // the far side, left to right: the service, its paint, the pet on the errand, which door-syllable opens it (right to
  // left, toward him), its lock, and whether someone inside turns
  const HSHOPS = [
    { kind: 'bank', col: '#26407E', dk: '#18284E', pet: 'crab', hit: 4, lock: 'keypad', who: true },
    { kind: 'gp', col: '#3A8A4A', dk: '#24582E', pet: 'ghost', hit: 3, lock: 'padlock', who: true },
    { kind: 'school', col: '#C8443A', dk: '#8A2A28', pet: 'seedy', hit: 2, lock: 'captcha', who: false },
    { kind: 'council', col: '#5E3C82', dk: '#3A2456', pet: 'dog', hit: 1, lock: 'nobots', who: true },
  ];
  const HSC = { sky: '#2A2F6E', brick: '#C8645A', brickDk: '#9A4A56', render: '#E6DED0', stone: '#ECE6DA', glass: '#22367A', lit: '#FFE04A', litDk: '#F2BE48', road: '#1E2C6A', pave: '#7690C8', yellow: '#FFD23A', sil: '#2E1E5A', paper: '#F4F0E6', red: '#E8384A', steel: '#B8BCC8', brass: '#E0A526', shop: '#E8508A', shopDk: '#A8306A', pole: '#262C50' };
  // a shop's sign: a pictogram in a roundel (no words). kind: bank (a coin with a pound sign) · gp (a medical cross) ·
  // school (a mortarboard) · council (columns under a pediment) · shop (a basket). col: the pictogram's ink
  function hsSign(kind, x, y, r, col, key) {
    const P = pts => pts.map(([a, b]) => [x + a * r, y + b * r]), sw = Math.max(.5, r / 32);
    const st = (pts, w, c, k) => piece(strokeShape(P(pts), () => w * r), c, { ink: null, key: key + k });
    piece(oval(x, y, r, r, 0, 32), HSC.paper, { sw, key: key + 'd' });
    if (kind === 'bank') {
      piece(oval(x, y, r * .74, r * .74, 0, 28), HSC.yellow, { sw: sw * .8, key: key + 'c' });
      st([[.3, -.34], [.14, -.5], [-.08, -.44], [-.15, -.2], [-.13, .1], [-.27, .36]], .13, col, 'p1');
      st([[-.34, .37], [.33, .37]], .12, col, 'p2'); st([[-.34, -.04], [.12, -.04]], .11, col, 'p3');
    } else if (kind === 'gp') {
      piece(P([[-.17, -.6], [.17, -.6], [.17, -.17], [.6, -.17], [.6, .17], [.17, .17], [.17, .6], [-.17, .6], [-.17, .17], [-.6, .17], [-.6, -.17], [-.17, -.17]]), col, { sw: sw * .8, key: key + 'x' });
    } else if (kind === 'school') {
      piece(P([[-.32, -.08], [.32, -.08], [.3, .3], [0, .4], [-.3, .3]]), col, { sw: sw * .8, key: key + 'c' });
      piece(P([[0, -.54], [.68, -.24], [0, .06], [-.68, -.24]]), col, { sw: sw * .8, key: key + 'b' });
      st([[0, -.24], [.46, -.1], [.52, .3]], .06, HSC.yellow, 't'); piece(oval(x + .52 * r, y + .36 * r, .08 * r, .11 * r, 0, 10), HSC.yellow, { ink: null, key: key + 'tt' });
    } else if (kind === 'council') {
      piece(P([[-.64, -.22], [0, -.6], [.64, -.22]]), col, { sw: sw * .8, key: key + 'p' });
      piece(P([[-.6, -.2], [.6, -.2], [.6, -.1], [-.6, -.1]]), col, { ink: null, key: key + 'a' });
      for (let i = 0; i < 4; i++) { const cx = -.42 + i * .28; piece(P([[cx - .08, -.04], [cx + .08, -.04], [cx + .08, .36], [cx - .08, .36]]), col, { ink: null, key: key + 'c' + i }); }
      piece(P([[-.64, .4], [.64, .4], [.64, .52], [-.64, .52]]), col, { ink: null, key: key + 's' });
    } else {   // the corner shop: a basket
      st([[-.36, -.12], [-.3, -.46], [0, -.6], [.3, -.46], [.36, -.12]], .09, col, 'h');
      piece(P([[-.62, -.16], [.62, -.16], [.44, .44], [-.44, .44]]), col, { sw: sw * .8, key: key + 'b' });
      for (const a of [-.24, 0, .24]) st([[a * 1.3, -.08], [a, .36]], .06, HSC.paper, 'w' + a);
      st([[-.52, .13], [.52, .13]], .06, HSC.paper, 'wh');
    }
  }
  // a traffic light (the school captcha's pictures): a dark pill, three lamps; (x, y) its centre, s its width
  function hsLight(x, y, s, key) {
    piece(b2RoundPoly(box(x - s / 2, y - s * 1.15, x + s / 2, y + s * 1.15), s * .4), '#262A40', { ink: null, key: key + 'b' });
    ['#E8384A', '#FFD23A', '#3AA85A'].forEach((c, i) => piece(oval(x, y + (i - 1) * s * .72, s * .28, s * .28, 0, 10), c, { ink: null, key: key + i }));
  }
  // a door's bot check (a website's, in hardware), centred (x, y), s ≈ its half-height. p 0..1: the pet's input so far;
  // age: since it cleared (< 0 before)
  function hsLock(kind, x, y, s, p, age, key) {
    const sw = Math.max(.5, s / 30), P = pts => pts.map(([a, b]) => [x + a * s, y + b * s]);
    if (kind === 'keypad') {          // the bank's two-factor code: six boxes to fill, a keypad
      piece(P([[-.62, -1], [.62, -1], [.62, 1], [-.62, 1]]), '#262A40', { sw, key: key + 'b' });
      piece(P([[-.52, -.9], [.52, -.9], [.52, -.52], [-.52, -.52]]), age >= 0 ? '#8ADCB0' : '#C8D0E0', { ink: null, key: key + 'd' });
      const n = Math.floor(clamp(p) * 6.01), hot = p > 0 && p < 1 ? Math.floor(p * 23) % 12 : -1;
      for (let i = 0; i < 6; i++) { const cx = -.42 + i * .168; piece(P([[cx - .06, -.8], [cx + .06, -.8], [cx + .06, -.62], [cx - .06, -.62]]), i < n ? '#1E2C6A' : '#9AA4BC', { ink: null, key: key + 'c' + i }); }
      for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) piece(oval(x + (c - 1) * .34 * s, y + (-.26 + r * .36) * s, .12 * s, .12 * s, 0, 12), r * 3 + c === hot ? HSC.yellow : '#C8CCD8', { ink: null, key: key + 'k' + r + c });
    } else if (kind === 'padlock') {  // the GP's password: a padlock whose dots are the asterisks; the shackle pops
      const op = age >= 0 ? backOut(seg(age, 0, .14)) : 0;
      push(); translate(x - .3 * s, y - .12 * s - .3 * s * op); rotate(-.45 * op);
      piece(strokeShape([[0, .1 * s], [0, -.4 * s], [.3 * s, -.66 * s], [.6 * s, -.4 * s], [.6 * s, .1 * s]], () => .15 * s), HSC.steel, { sw: sw * .8, key: key + 'sh' });
      pop();
      piece(b2RoundPoly(P([[-.52, -.14], [.52, -.14], [.52, .6], [-.52, .6]]), .12 * s), HSC.brass, { sw, key: key + 'b' });
      const n = Math.floor(clamp(p) * 6.01);
      for (let i = 0; i < 6; i++) { const cx = -.36 + i * .144; if (i < n) piece(oval(x + cx * s, y + .22 * s, .058 * s, .058 * s, 0, 10), '#1E2C6A', { ink: null, key: key + 'd' + i }); else piece(P([[cx - .05, .3], [cx + .05, .3], [cx + .05, .34], [cx - .05, .34]]), '#6A4A1A', { ink: null, key: key + 'u' + i }); }
    } else if (kind === 'captcha') {  // the school's: pick the traffic lights
      piece(P([[-.64, -.94], [.64, -.94], [.64, .94], [-.64, .94]]), '#F2F0EA', { sw, key: key + 'b' });
      piece(P([[-.56, -.86], [.56, -.86], [.56, -.52], [-.56, -.52]]), '#3E6FC8', { ink: null, key: key + 'h' });
      hsLight(x - .32 * s, y - .69 * s, .12 * s, key + 'hl');
      const pick = [0, 4, 5], n = Math.floor(clamp(p) * 3.01);
      for (let i = 0; i < 9; i++) {
        const r = Math.floor(i / 3), c = i % 3, cx = x + (c - 1) * .38 * s, cy = y + (-.16 + r * .36) * s, j = pick.indexOf(i);
        piece(box(cx - .16 * s, cy - .15 * s, cx + .16 * s, cy + .15 * s), j >= 0 && j < n ? '#7FA4E8' : '#D8DCE2', { sw: sw * .5, key: key + 'c' + i });
        if (j >= 0) hsLight(cx, cy, .09 * s, key + 'l' + i);
        else piece(oval(cx, cy + .03 * s, .09 * s, .05 * s, 0, 10), '#9AA0AA', { ink: null, key: key + 'o' + i });
      }
    } else if (kind === 'nobots') {   // the council's sign: a robot's head, struck through
      piece(oval(x, y, s, s, 0, 32), HSC.red, { sw, key: key + 'r' });
      piece(oval(x, y, s * .78, s * .78, 0, 32), HSC.paper, { ink: null, key: key + 'd' });
      piece(strokeShape(P([[0, -.3], [0, -.5]]), () => .08 * s), '#4A5A7A', { ink: null, key: key + 'an' });
      piece(oval(x, y - .54 * s, .09 * s, .09 * s, 0, 10), '#4A5A7A', { ink: null, key: key + 'ab' });
      piece(b2RoundPoly(P([[-.36, -.3], [.36, -.3], [.36, .32], [-.36, .32]]), .1 * s), '#4A5A7A', { ink: null, key: key + 'h' });
      for (const e of [-1, 1]) piece(oval(x + e * .15 * s, y - .04 * s, .07 * s, .07 * s, 0, 10), HSC.paper, { ink: null, key: key + 'e' + e });
      piece(P([[-.14, .15], [.14, .15], [.14, .2], [-.14, .2]]), HSC.paper, { ink: null, key: key + 'm' });
      piece(strokeShape(P([[-.56, -.56], [.56, .56]]), () => .17 * s), HSC.red, { ink: null, key: key + 'x' });
    }
  }
  // an errand card (the cat's is a shopping list), drawn around (0, 0), w wide: paper, the errand's pictogram, lines
  function hsCard(kind, w, col, key) {
    const h = w * (kind === 'shop' ? 1.6 : 1.25), sw = Math.max(.4, w / 40);
    piece(box(-w / 2, -h / 2, w / 2, h / 2), HSC.paper, { sw, key: key + 'p' });
    hsSign(kind, 0, -h / 2 + w * .34, w * .26, col, key + 's');
    for (let i = 0; i < (kind === 'shop' ? 3 : 2); i++) {
      const y = -h / 2 + w * (.8 + i * .24);
      piece(box(-w * .34, y, -w * .2, y + w * .12), HSC.paper, { sw: sw * .7, key: key + 'b' + i });
      piece(box(-w * .12, y + w * .04, w * .36, y + w * .08), '#6A7090', { ink: null, key: key + 'l' + i });
    }
  }
  // someone inside at the lit glass, in silhouette (head and shoulders): back turned, then a startled turn to the door
  function hsSil(x, y, s, age, key) {
    const turn = ease(seg(age, .1, .2)), jolt = .6 * Math.sin(Math.PI * seg(age, .1, .32));
    const S = P => P.map(([a, b]) => [x + a * s, y + (b - jolt) * s]), hx = lerp(-.5, .7, turn);
    piece(S(curvy([[-4.2, 0], [-3.8, -3.2], [0, -4.3], [3.8, -3.2], [4.2, 0]], 4)), HSC.sil, { ink: null, key: key + 'b' });
    piece(S(oval(hx, -6.4, 2.1, 2.4, 0, 18)), HSC.sil, { ink: null, key: key + 'h' });
    if (turn > .3) piece(S([[hx + 1.9, -6.9], [hx + 2.7, -6.1], [hx + 1.9, -5.6]]), HSC.sil, { ink: null, key: key + 'n' });
    if (age > .12 && age < .75) for (const a of [-.95, -.45, .05]) piece(strokeShape(S([[hx + Math.cos(a) * 3.1, -6.6 + Math.sin(a) * 3.1], [hx + Math.cos(a) * 4.4, -6.6 + Math.sin(a) * 4.4]]), () => s * .42), HSC.sil, { ink: null, key: key + 's' + a });   // a start (by the head, toward the door)
  }
  SHOT.V3c = risoShot((t, lt, dur) => {
    const C = V3C, sw = seg(t, C.t0, C.t0 + .42);
    if (sw < 1) {   // the light bar sweeps left to right: the riso copy behind it, V3b's card phone still ahead of it
      const X = lerp(-140, W + 140, sw);
      drawShot('V3b', C.t0 - .001);
      v3Scissor(-10, X, () => v3cBody(t));
      look('xerox'); v3LightBar(X);
      xeroxGrit(t, .7);
      return;
    }
    v3cBody(t);
  });
  // the copier's light bar at X: the fresh copy overexposed just behind it, the bright bar, its shadow edge
  function v3LightBar(X) {
    const R = (x0, x1) => [[x0, -80], [x1, -80], [x1, H + 80], [x0, H + 80]];
    boilSeed('v3 bar');
    for (let i = 0; i < 6; i++) { const xa = X - 46 * (i + 1), xb = X - 46 * i; if (xb > -80) _paint(R(xa, xb), { wash: XEROX.paper, washOp: 200 * (1 - i / 6), ink: null }); }
    for (let y = -40; y < H + 80; y += 110) _glow(X - 10, y, 190, '#9CFFD2', .85);
    _paint(R(X - 16, X + 10), { wash: '#F8FFFA', ink: null });
    _paint(R(X + 10, X + 14), { wash: '#B9C4BE', ink: null });
  }
  // The camera: V3b's last frame (the grid's centre at 2.415×) → a pull straight back to the wide, zooming about the one
  // world point that holds still on screen; a slow creep; then the push in on him.
  function hsCam(t) {
    const C = V3C, Z0 = 2.415 / HSN.pan.s, G = hsP(266, 476), [wx, wy] = HS.wc, F = [(G[0] * Z0 - wx) / (Z0 - 1), (G[1] * Z0 - wy) / (Z0 - 1)];
    const e = ease(seg(t, C.pull[0], C.pull[1])), d = seg(t, C.pull[1], C.push[0]), p = ease(seg(t, C.push[0], C.push[1]));
    const z0 = Math.exp(Math.log(Z0) * (1 - e)), cx = F[0] - (F[0] - wx) / z0 + 24 * d, cy = F[1] - (F[1] - wy) / z0, z = z0 * (1 + .03 * d);
    return [lerp(cx, 700, p), lerp(cy, 695, p), Math.exp(lerp(Math.log(z), Math.log(1.24), p))];
  }
  const hsSx = wx => (wx - CAM.cx) * CAM.zoom + W / 2;   // world x → screen x (under camBegin), for the door scissors
  // the night street: sky over the roofs, the far pavement, the road with double yellow lines, his pavement
  function hsStreet() {
    boilSeed('v3c street');
    piece(box(-900, -900, 2800, 80), HSC.sky, { ink: null, key: 'v3csky' });
    piece(box(-900, HS.fg, 2800, HS.kerb[0]), HSC.pave, { sw: 1, key: 'v3cfp' });
    piece(box(-900, HS.kerb[0], 2800, HS.kerb[1]), HSC.road, { ink: null, key: 'v3crd' });
    piece(box(-900, HS.kerb[1], 2800, 1900), HSC.pave, { sw: 1, key: 'v3cnp' });
    for (const y of [HS.kerb[0], HS.kerb[1] - 9]) piece(box(-900, y, 2800, y + 9), HSC.stone, { sw: .8, key: 'v3ckb' + y });
    for (const y of [HS.kerb[0] + 17, HS.kerb[0] + 27, HS.kerb[1] - 29, HS.kerb[1] - 19]) piece(box(-900, y, 2800, y + 4), HSC.yellow, { ink: null, key: 'v3cdy' + y });
    for (let x = -880; x < 2800; x += 160) dline([[x, HS.kerb[1]], [x - 50, 1900]], .7, '#3A4A7A');
    dline([[-900, 905], [2800, 905]], .7, '#3A4A7A');
    for (let x = -880; x < 2800; x += 74) dline([[x, HS.fg + 1], [x, HS.kerb[0]]], .5, '#3A4A7A');
  }
  // the pet's input on its lock (0..1), finishing on its door's syllable
  const HS_LEAD = { keypad: .36, padlock: .3, captcha: .32, nobots: .5 };
  const hsInput = (t, S) => seg(t, V3C.hits[S.hit] - HS_LEAD[S.lock], V3C.hits[S.hit] - .03);
  // a far shopfront, all but its door leaf and right pilaster (drawn after the pet, which goes in behind them)
  function hsFarA(t, i) {
    const S = HSHOPS[i], { x0, x1, d0, d1, pier, lockX, mid } = hsGeo(i), fg = HS.fg, age = t - V3C.hits[S.hit];
    const lit = age >= .03 && !(age < .13 && Math.floor(age * 48) % 2);   // the light goes on (a flicker, then on)
    boilSeed('v3c shop' + i);
    // the storey above: render or brick, two sash windows, the parapet, a chimney stack on the party wall
    piece(box(x0, 70, x1, 262), i % 2 ? HSC.brick : HSC.render, { sw: 1.1, key: 'v3cup' + i });
    piece(box(x0 + 10, 10, x0 + 62, 58), HSC.brickDk, { sw: 1, key: 'v3cch' + i });
    for (const px of [x0 + 22, x0 + 48]) piece(box(px - 6, -6, px + 6, 12), '#E8784A', { sw: .8, key: 'v3cpot' + i + px });
    piece(box(x0 - 6, 54, x1 + 6, 72), HSC.stone, { sw: 1, key: 'v3cpar' + i });
    for (const wx of [x0 + 62, x1 - 142]) {
      const on = hash(i * 3.1 + (wx - x0) * .01) > .62;
      piece(box(wx, 104, wx + 80, 222), on ? HSC.litDk : HSC.glass, { sw: 1, key: 'v3cuw' + i + wx });
      dline([[wx, 163], [wx + 80, 163]], 1, '#1A1A2A'); dline([[wx + 40, 104], [wx + 40, 222]], .8, '#1A1A2A');
      piece(box(wx - 6, 222, wx + 86, 230), HSC.stone, { sw: .8, key: 'v3cus' + i + wx });
    }
    // the shopfront: cornice, the fascia and its sign, the left pilaster, the window, the lock's pier, the fanlight
    piece(box(x0 - 4, 250, x1 + 4, 264), HSC.stone, { sw: 1, key: 'v3ccor' + i });
    piece(box(x0, 262, x1, 338), S.col, { sw: 1.2, key: 'v3cfas' + i });
    hsSign(S.kind, mid, 300, 30, S.dk, 'v3csg' + i);
    piece(box(x0, 338, x0 + 16, fg), S.dk, { sw: 1, key: 'v3cpl' + i });
    piece(box(x0 + 16, 338, d0, 352), S.col, { sw: .9, key: 'v3cwh' + i });
    piece(box(x0 + 16, 352, pier, 528), lit ? HSC.lit : HSC.glass, { sw: 1.1, key: 'v3cwin' + i });
    if (lit) {   // inside: a counter, and (mostly) someone behind it who turns to the door
      if (S.who) hsSil(x0 + 74, 520, 8.5, age, 'v3csil' + i);
      piece(box(x0 + 16, 500, pier, 528), mixCol(S.dk, HSC.lit, .45), { ink: null, key: 'v3ccnt' + i });
    } else piece([[x0 + 30, 364], [x0 + 70, 364], [x0 + 30, 420]], '#5A6A9A', { ink: null, key: 'v3cgl' + i });
    dline([[(x0 + 16 + pier) / 2, 352], [(x0 + 16 + pier) / 2, 528]], 1, '#1A1A2A');
    piece(box(x0 + 16, 528, pier, fg), S.dk, { sw: 1, key: 'v3crs' + i });
    piece(box(pier, 352, d0, fg), S.col, { sw: 1, key: 'v3cpi' + i });
    piece(box(d0, 342, d1, 370), lit ? HSC.lit : HSC.glass, { sw: .9, key: 'v3cfan' + i });
    if (age >= 0) {   // the doorway, open: lit inside
      piece(box(d0, 370, d1, fg), lit ? HSC.lit : '#141830', { sw: 1, key: 'v3cdw' + i });
      if (lit) piece(box(d0, 516, d1, 536), mixCol(S.dk, HSC.lit, .45), { ink: null, key: 'v3cdwc' + i });
    }
    piece(box(d0 - 8, fg - 4, d1 + 8, fg + 8), HSC.stone, { sw: .8, key: 'v3cst' + i });
    // its bot check (the council's is a sign on the door: drawn with the leaf)
    if (S.lock !== 'nobots') hsLock(S.lock, lockX, HS.lockY, 30, hsInput(t, S), age, 'v3clk' + i);
  }
  // a far shop's door leaf (hinged on the right: it swings in on the hit), the right pilaster, the tick over the door
  function hsFarB(t, i) {
    const S = HSHOPS[i], G = hsGeo(i), fg = HS.fg, age = t - V3C.hits[S.hit], k = age < 0 ? 0 : backOut(seg(age, 0, .18));
    const lit = age >= .03, d1 = G.d1, w = 96 * lerp(1, .2, k), d0 = d1 - w, f = w / 96;
    boilSeed('v3c door' + i);
    piece(box(d0, 370, d1, fg - 2), S.col, { sw: 1.1, key: 'v3cdl' + i });
    piece(box(d0 + 13 * f, 386, d1 - 13 * f, 470), lit ? mixCol(HSC.lit, S.col, .35) : HSC.glass, { sw: .9, key: 'v3cdg' + i });
    piece(box(d0 + 13 * f, 490, d1 - 13 * f, 572), S.dk, { sw: .8, key: 'v3cdp' + i });
    if (age < 0) piece(oval(d0 + 11, 482, 4.5, 4.5, 0, 10), HSC.yellow, { sw: .6, key: 'v3cdk' + i });
    if (S.lock === 'nobots') { push(); translate((d0 + d1) / 2, 428); scale(Math.max(.05, f), 1); hsLock('nobots', 0, 0, 27, 0, age, 'v3cnb'); pop(); }
    piece(box(d1, 338, G.x1, fg), S.dk, { sw: 1, key: 'v3cpr' + i });
    if (age > 0) { const tk = backOut(seg(age, .02, .2)); if (tk > .02) { push(); translate((G.d0 + G.d1) / 2, 330); scale(tk); v3Tick(0, 0, 24, 'v3ctk' + i); pop(); } }
  }
  // a pet's right-hand target, no further from its shoulder than its short arm reaches (past that the rubber arm would
  // stretch into a pole): the hand goes that way instead
  function hsReach(sp, max = 2.0, sh = [1.28, -2.3]) {
    const v = [sp[0] - sh[0], sp[1] - sh[1]], d = Math.hypot(...v), k = Math.min(1, max / (d || 1));
    return [sh[0] + v[0] * k, sh[1] + v[1] * k, ...sp.slice(2)];
  }
  // a far pet on its errand: reads its card at its mark, works the lock just before its syllable, a small bow when it
  // clears, and in through the door (behind the leaf and the pilaster: scissored at the jamb). The dog strolls up to the
  // council's "No bots" sign, points at it, nods politely, and in it goes.
  function hsPetFar(t, i) {
    const S = HSHOPS[i], G = hsGeo(i), h = V3C.hits[S.hit], age = t - h, u = HS.pu, mark = G.mark, gy = HS.fg + 12;
    const inK = hsInput(t, S), lk = [(G.lockX - mark) / u, (HS.lockY - gy) / u];
    let x = mark, y = gy, walk = null, rot = 0, sq = 0, lookX = .45, lookY = .6;
    // (the bank's pet, last to go, waits along its window and steps up to the keypad just before its turn: waiting at its
    // mark it stood right over Rowan's beanie across the road as the pull-back passed it)
    if (i === 0 && age < 0) { const st = seg(t, h - HS_LEAD[S.lock] - .62, h - HS_LEAD[S.lock] - .1), w0 = mark - 118; x = lerp(w0, mark, ease(st)); if (st > 0 && st < 1) walk = (x - w0) / (2.2 * u); }
    let L = [.7, -1.35, .4, 'hold', 1, -1.3], R = [1.25, -1.05, .2, 'relax', 0];
    if (S.lock === 'nobots' && age < 0) {
      const a = seg(t, h - 1.05, h - .5); x = lerp(G.x0 + 30, mark, ease(a)); if (a > 0 && a < 1) walk = (x - G.x0) / (2.2 * u);
      if (t > h - .48) { R = hsReach([3.1, -5.2, .1, 'point', 1, -.9]); lookX = .8; lookY = -.5; const nd = Math.max(0, Math.sin(seg(t, h - .36, h - .04) * 2 * TAU)); rot = .1 * nd; sq = .05 * nd; }
    } else if (age < 0 && inK > 0) {     // working the lock: quick taps
      R = hsReach([lk[0] + .12 * Math.sin(t * 43), lk[1] + .15 * Math.abs(Math.sin(t * 29)), .2, 'point', 1, -.35]); lookX = .85; lookY = .2;
    }
    if (age >= 0) {                       // cleared: a small bow (the task done), and in
      const nd = Math.sin(Math.PI * seg(age, 0, .2)); rot = .12 * nd; sq = .05 * nd;
      const w = seg(age, .14, .62); x = lerp(mark, G.d1 + 56, easeIn(w) * .35 + w * .65); y = lerp(gy, HS.fg + 3, seg(w, .15, .45));
      if (w > 0) walk = (x - mark) / (2.2 * u); lookX = .9; lookY = 0;
    }
    if (!vis(x - 60, y - 130, x + 60, y + 10)) return;
    const Mc = b2Mat();
    const o = { ...feel('happy', t, { seed: i + 2 }), emote: null, eyes: 'look', mouth: 'smile', lookX, lookY, rot, sq, walk, kind: S.pet, view: 'q', pose: { L, R }, t: t + i * .17, boilKey: 'v3cp' + i,
      holdL: s => { b2Upright(Mc); hsCard(S.kind, s * 2.0, S.dk, 'v3ccd' + i); } };
    const draw = () => codex(x, y, u, o);
    if (x > G.d0 - 30) v3Scissor(-10, hsSx(G.d1), draw); else draw();
  }
  // a street lamp on the far kerb, between the surgery and the school
  function hsLamp() {
    const x = HS.x0 + 2 * HS.w, y0 = HS.kerb[0] - 2;
    boilSeed('v3c lamp');
    piece(box(x - 5, 246, x + 5, y0), HSC.pole, { sw: .9, key: 'v3clp' });
    piece(box(x - 10, y0 - 24, x + 10, y0), HSC.pole, { sw: .9, key: 'v3clb' });
    piece([[x - 19, 212], [x + 19, 212], [x + 12, 248], [x - 12, 248]], HSC.lit, { sw: 1, key: 'v3cll' });
    piece([[x - 24, 214], [x + 24, 214], [x, 194]], HSC.pole, { sw: .9, key: 'v3clc' });
  }
  // his corner shop (a wing flat on his side of the road): the storey above, the fascia with the basket, the window
  // (lit once the cat's inside), the doorway (lit inside while it's open)
  function hsNear(open, lit) {
    const { d0, d1, dTop, p1 } = HSN, ng = HS.ng, goods = ['#E8384A', '#3E6FC8', '#FFD23A', '#F4F0E6', '#3AA85A'];
    boilSeed('v3c near');
    piece(box(-900, -900, p1, 380), HSC.brick, { sw: 1.2, key: 'v3cnw' });
    for (let r = 0; r < 9; r++) dline([[-900, 30 + r * 40], [p1, 30 + r * 40]], .5, '#5A2A30');
    piece(box(60, 120, 260, 330), HSC.glass, { sw: 1.2, key: 'v3cnuw' });
    dline([[60, 225], [260, 225]], 1.2, '#1A1A2A'); dline([[160, 120], [160, 330]], 1, '#1A1A2A');
    piece(box(52, 330, 268, 342), HSC.stone, { sw: .9, key: 'v3cnus' });
    piece(box(-900, 372, p1 + 14, 392), HSC.stone, { sw: 1, key: 'v3cncor' });
    piece(box(-900, 392, p1, 484), HSC.shop, { sw: 1.2, key: 'v3cnfas' });
    hsSign('shop', 241, 438, 38, HSC.shopDk, 'v3cns');
    piece(box(-900, 484, d0, ng), HSC.shopDk, { sw: 1.1, key: 'v3cnfr' });
    piece(box(-420, 520, d0 - 22, 896), lit ? HSC.lit : HSC.glass, { sw: 1.2, key: 'v3cnwin' });
    const shelves = (xa, xb, ys, key) => ys.forEach((sy, r) => {
      piece(box(xa, sy, xb, sy + 7), HSC.shopDk, { ink: null, key: key + 'sh' + r });
      for (let gx = xa + 6, j = 0; gx < xb - 20; gx += 30, j++) { const c = goods[Math.floor(hash(r * 7.1 + j * 1.3) * 5)], tall = 18 + 16 * hash(j * 2.7 + r); piece(box(gx, sy - tall, gx + 20, sy), c, { sw: .7, key: key + 'g' + r + j }); }
    });
    if (lit) shelves(-420, d0 - 22, [640, 760, 880], 'v3cnws');
    else piece([[-60, 540], [20, 540], [-60, 640]], '#5A6A9A', { ink: null, key: 'v3cngl' });
    dline([[-160, 520], [-160, 896]], 1.2, '#1A1A2A');
    piece(box(-420, 896, d0 - 22, ng), HSC.shop, { sw: 1, key: 'v3cnrs' });
    piece(box(d0, 484, d1, dTop), lit ? HSC.lit : HSC.glass, { sw: 1, key: 'v3cntr' });
    if (open > .01) { piece(box(d0, dTop, d1, ng), lit ? HSC.lit : '#141830', { sw: 1, key: 'v3cndw' }); if (lit) shelves(d0 + 60, d1, [690, 820], 'v3cnds'); }
    piece(box(d0 - 8, ng - 6, d1 + 8, ng + 8), HSC.stone, { sw: .8, key: 'v3cnst' });
  }
  // his door's leaf (hinged on the left jamb), the pilaster with his lock on it, the building's corner
  function hsNearFront(open, lit, panel) {
    const { d0, d1, dTop, p1 } = HSN, ng = HS.ng, w = (d1 - d0) * lerp(1, .15, open), f = w / (d1 - d0);
    boilSeed('v3c neardoor');
    piece(box(d0, dTop, d0 + w, ng), HSC.shop, { sw: 1.3, key: 'v3cndl' });
    piece(box(d0 + 22 * f, dTop + 26, d0 + w - 22 * f, ng - 170), lit ? mixCol(HSC.lit, HSC.shop, .3) : HSC.glass, { sw: 1.1, key: 'v3cndg' });
    piece(box(d0 + 22 * f, ng - 140, d0 + w - 22 * f, ng - 34), HSC.shopDk, { sw: 1, key: 'v3cndp' });
    if (open < .05) piece(box(d0 + w - 36, 700, d0 + w - 24, 800), HSC.steel, { sw: .9, key: 'v3cndh' });
    piece(box(d1, 484, p1, ng), HSC.shop, { sw: 1.2, key: 'v3cnpl' });
    piece(box(p1 - 2, -900, p1 + 14, ng), mixCol(HSC.brickDk, HSC.sil, .3), { sw: 1, key: 'v3cnrt' });
    panel();
  }
  // What his lock shows, in its own units (HSN.pan): all nine ticked, then "no" on "bot"; a new grid he clicks through;
  // the cat's tap: the box ticks and it passes (a big tick); then his grid again: no; a new grid; still clicking.
  // Returns his finger's next cell and press, for the hand.
  const hsTaps = t => { const C = V3C, h0 = C.hits[0], T = []; for (let k = 0; k < 3; k++) T.push(C.tap + k * .19); for (let k = 0; k < 9; k++) T.push(h0 + .72 + k * .2); return T; };
  function hsLockState(t) {
    const C = V3C, h0 = C.hits[0], T = hsTaps(t);
    let n = 0; while (n < T.length && t >= T[n]) n++;
    const ticks = t < C.tap - .06 ? 9 : n <= 3 ? n : t < h0 + .62 ? 3 : n - 3;
    const next = n < T.length ? (n < 3 ? n : n - 3) : 8, last = n > 0 ? T[n - 1] : -9;
    return { ticks, box: t >= h0 - .01 && t < h0 + .24, pass: t >= h0 + .02 && t < h0 + .24 ? seg(t, h0 + .02, h0 + .12) : 0, cell: Math.min(8, next), press: Math.exp(-Math.max(0, t - last) * 26) * (t >= last ? 1 : 0), idle: t >= h0 - .15 && t < h0 + .62 };
  }
  function hsLockPanel(t, z) {
    const C = V3C, L = hsLockState(t), k = Math.max(1, 1.1 / (HSN.pan.s * z)), sw = k;
    const noK = seg(t, C.no, C.no + .6), sh = noK > 0 && noK < 1 ? Math.sin(noK * 38) * 26 * (1 - noK) : 0;
    const no2 = seg(t, C.hits[0] + .24, C.hits[0] + .7), sh2 = no2 > 0 && no2 < 1 ? Math.sin(no2 * 38) * 26 * (1 - no2) : 0;
    push(); translate(HSN.pan.x, HSN.pan.y); scale(HSN.pan.s);
    boilSeed('v3c panel');
    piece(curvy(box(-26, -30, 546, 1000), 3), '#1E1C24', { sw: 2 * sw, key: 'v3cpnb' });
    piece(box(0, 0, 520, 960), '#F2F0EA', { ink: null, key: 'v3cpns' });
    piece(box(24, 70, 496, 224), '#3E6FC8', { ink: null, key: 'v3cpnh' });
    busPic(400, 147, 110, 1, 'v3cpnhb');
    piece(box(46, 102, 136, 192), '#F2F0EA', { sw: 1.6 * sw, key: 'v3cpncb' });   // the "I'm not a robot" box (no words)
    if (L.box) piece(strokeShape([[62, 150], [84, 174], [124, 116]], () => 16), '#2F62C4', { ink: null, key: 'v3cpnck' });
    clipPoly(box(0, 0, 520, 960), () => {   // (the grid shakes no: kept to the glass)
    push(); translate(sh + sh2, 0);
    for (let i = 0; i < 9; i++) {
      const [x, y] = capCell(i), on = i < L.ticks;
      piece(box(x, y, x + CAP.cell, y + CAP.cell), on ? '#B8CCEE' : '#D8DCE2', { sw: sw, key: 'v3cpc' + i });
      busPic(x + CAP.cell / 2, y + CAP.cell / 2 + 6, CAP.cell * (on ? .56 : .66), i % 2 ? -1 : 1, 'v3cpb' + i);
      if (on) { piece(oval(x + CAP.cell - 26, y + 26, 18, 18, 0, 16), '#3E6FC8', { ink: null, key: 'v3cpt' + i }); piece(strokeShape([[x + CAP.cell - 35, y + 26], [x + CAP.cell - 28, y + 33], [x + CAP.cell - 16, y + 18]], () => 4), '#F2F0EA', { ink: null, key: 'v3cptk' + i }); }
    }
    pop();
    });
    piece(box(300, 740, 480, 810), '#3E6FC8', { ink: null, key: 'v3cpnv' });
    piece(strokeShape([[370, 775], [385, 790], [410, 760]], () => 6), '#F2F0EA', { ink: null, key: 'v3cpnvk' });
    if (L.pass > 0) { piece(box(0, 0, 520, 960), '#F2F0EA', { ink: null, key: 'v3cpnp' }); push(); translate(260, 470); scale(backOut(L.pass)); v3Tick(0, 0, 190, 'v3cpntk'); pop(); }
    // "no" on "bot": the close-up's red cross, gone as the camera pulls back
    const xk = seg(t, C.no, C.no + .3) * 1.05, xo = 1 - ease(seg(t, C.no + .3, C.no + .4));
    if (xk > 0 && xo > .01) { push(); translate(266 + sh, 476); scale(xo); bsDenied(0, 0, 186, xk, 'v3cno'); pop(); }
    pop();
  }
  // him at his door, still clicking: 3/4 facing left, his finger on the grid; a glance at the cat; the push-in: a flat
  // look at us
  function hsHim(t) {
    const C = V3C, h0 = C.hits[0], [x, y, u] = HS.him, L = hsLockState(t), [cx, cy] = capCell(L.cell).map(v => v + CAP.cell / 2);
    const [fx, fy] = hsP(cx, cy), lift = L.idle ? 1 : 1 - L.press;
    // (his hand is down in the close-up, as V3b ended; it comes back up to click as the camera pulls back)
    // (the wrist's target sits back from the cell so the fingertip lands on it; lifted between taps. It's his far arm in 3/4,
    // so it comes out from behind his coat's edge: drawn over his chest, its root and the upper arm's underside were lines
    // ending in the middle of the coat, and the folded elbow crossed them: the user, "arm lines are weird and overlapping")
    const reach = ease(seg(t, C.tap - .28, C.tap - .04)), R0 = [1.3, -5.3], R1 = [(x - fx) / u - 1.75 + .3 * lift, (fy - y) / u - .45 - .25 * lift];
    const R = [lerp(R0[0], R1[0], reach), lerp(R0[1], R1[1], reach), .3, reach > .5 ? 'point' : 'relax', 0, reach > .5 ? -.12 : null, 'u'];   // (the finger at the screen: it pointed up, the rig's own wrist angle)
    const mood = emotions(t, [[C.t0, 'bored'], [h0 - .12, 'surprised'], [h0 + .3, 'bored'], [C.push[0] + .1, 'neutral', { lid: .35 }]]);
    const glance = seg(t, h0 - .16, h0 - .06) * (1 - seg(t, h0 + .28, h0 + .4)), toUs = ease(seg(t, C.push[0] + .08, C.push[0] + .24));
    const lookX = lerp(lerp(.55, .25, glance), -.85, toUs), lookY = lerp(lerp(.55, .95, glance), -.05, toUs);
    person(x, y, u, HIM_C, { ...mood, emote: null, view: 'q', flip: true, pose: { L: PPOSE.pockets.L, R }, lookX, lookY, boilKey: 'v3chim' });
  }
  // the cat on its errand (a shopping list): trots in along his pavement, under the lock and past him, turns at the door,
  // hops and ticks the box, lands, and in it goes before the door shuts. { inside, draw } (inside: behind the leaf,
  // scissored at the jamb), or null once it's in.
  function hsCat(t) {
    const h = V3C.hits[0], u = 34, gy = HS.ng + 24, [bx, by] = hsP(91, 147), hx = 366;
    if (t < V3C.cat || t > h + .66) return null;
    const tr = seg(t, V3C.cat, h - .2), hop = seg(t, h - .15, h + .16), go = seg(t, h + .22, h + .6);
    let x = lerp(1100, hx, easeOut(tr) * .3 + tr * .7), y = lerp(gy, HS.ng + 2, seg(go, 0, .5)), walk = tr > 0 && tr < 1 ? (1100 - x) / (2.4 * u) : null;
    const dy = -5.2 * Math.sin(Math.PI * hop), land = hop >= 1 ? Math.exp(-(t - h - .16) * 14) : 0, crouch = seg(t, h - .21, h - .15) * (1 - seg(t, h - .15, h - .1));
    if (go > 0) { x = lerp(hx, 190, go); walk = (1100 - x) / (2.4 * u); }
    const facing = t < h - .2 || t >= h + .2 ? 'in' : 'box';   // it turns to face the lock for the hop, then back to the door
    let R = [1.2, -1.1, .2, 'relax', 0];
    if (hop > 0 && hop < 1) {   // the paw goes up for the box (no further than a pet's arm reaches: it's the hop that gets it there)
      const sh = [.3, -2.6], v = [(bx - x) / u - .2 - sh[0], (by - (y + dy * u)) / u + .2 - sh[1]], d = Math.hypot(...v), k = Math.min(1, 2.1 / d);
      R = [sh[0] + v[0] * k, sh[1] + v[1] * k, .1, 'point', 1, Math.atan2(v[1], v[0])];
    }
    const Mc = b2Mat();
    const o = { ...feel('happy', t, { seed: 9 }), emote: null, eyes: 'look', mouth: 'smile', lookX: .8, lookY: hop > 0 && hop < 1 ? -.8 : .1, kind: 'codey', view: 'q', flip: facing === 'in', walk, dy, sq: .14 * land + .12 * crouch - .06 * Math.sin(Math.PI * hop), pose: { L: [.7, -1.4, .4, 'hold', 1, -1.3], R }, t: t + .4, boilKey: 'v3ccat',
      holdL: s => { b2Upright(Mc); hsCard('shop', s * 1.8, HSC.shopDk, 'v3ccdc'); } };
    const inside = x < 290;
    return { inside, draw: () => inside ? v3Scissor(hsSx(HSN.d0), W + 10, () => codex(x, y, u, o)) : codex(x, y, u, o) };
  }
  function v3cBody(t) {
    const C = V3C, [cx, cy, z] = hsCam(t), h0 = C.hits[0], age = t - h0;
    camBegin(cx, cy, z);
    look('xerox');
    cpXeroxDraw(() => {
      hsStreet();
      // the high street across the road (only once the pull-back brings it into view)
      const on = [0, 1, 2, 3].filter(i => vis(HS.x0 + i * HS.w - 30, -20, HS.x0 + (i + 1) * HS.w + 30, HS.kerb[0]));
      for (const i of on) hsFarA(t, i);
      for (const i of on) hsPetFar(t, i);
      for (const i of on) hsFarB(t, i);
      if (vis(HS.x0 + 2 * HS.w - 30, 190, HS.x0 + 2 * HS.w + 30, HS.kerb[0])) hsLamp();
      // his door: it opens for the cat on "pick", and shuts again behind it (the light's on inside now)
      const open = age < 0 ? 0 : backOut(seg(age, 0, .16)) * (1 - ease(seg(age, .44, .58))), lit = age >= .05 && !(age < .15 && Math.floor(age * 48) % 2);
      hsNear(open, lit);
      const cat = hsCat(t);
      if (cat && cat.inside) cat.draw();
      hsNearFront(open, lit, () => hsLockPanel(t, z));
      hsHim(t);
      if (cat && !cat.inside) cat.draw();
      // the cat's tick over his door (gone as it shuts), and his captcha's "no", again, as it breezes past him
      const tk = backOut(seg(age, .02, .2)) * (1 - ease(seg(age, .42, .56)));
      if (age > 0 && tk > .02) { push(); translate(241, 486); scale(tk); v3Tick(0, 0, 30, 'v3cntk'); pop(); }
      const nk = seg(age, .24, .54) * 1.05, no = 1 - ease(seg(age, .76, .88));
      if (nk > 0 && no > .01) { const [px, py] = hsP(260, 480); push(); translate(px, py); scale(no); bsDenied(0, 0, 66, nk, 'v3cno2'); pop(); }
    });
    camEnd();
    xeroxGrit(t, .7);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // V3d: a projected 1930s cartoon. A dark room, a pull-down screen; she stands by it with a pointer while the leader
  // counts down; push into the screen: the rubber-hose school. The pupils (the Codex pets, in school caps) earnestly
  // try to improve their half-star: homework set; they slip out; Codey briefs the heist on a flip board behind the bike
  // sheds (the break-in is never shown); a tin-can group chat; the raid, a dust cloud; the marking: the SAME half-star.
  // Pull back out to her.
  // ---------------------------------------------------------------------------------------------------------------
  // (B, the briefing: flip1 the map → the lock on the bar ("teacher's"); rev the reverse shot, on the beat in the breath
  // after "office;"; back the cut back on the bar ("answer"), the lock → the answer sheet flipping over. C: org, the
  // chat agrees ("organised"); raid, the dust cloud ("raid").)
  // (the reverse shot's length, the user's pick: long, 1.1 s, starting right after the tap on the keyhole on "office" and
  // dropping the pick's twist; it was two beats, .87 s, after the twist)
  const V3D = { t0: BAR(106), start: WT('OpenAI', 0), A: WT('OpenAI', 1) - .05, D0: WT('All that extra', 4) - .32, thunk: WT('All that extra', 4) + .02, setHw: WT('OpenAI', 2), turn: WT('OpenAI', 3), sneak: WT('OpenAI', 5), B: WT('Broke', 0) - .12, flip1: BAR(109), rev: WT('Broke', 4) + .26, back: BAR(110),
    C: WT('Built', 0) - .1, chat: WT('Built', 2), org: WT('Built', 5) - .1, raid: WT('Built', 7) - .04, D: WT('All that extra', 0) - .12, st1: WT('All that extra', 3), st2: WT('All that extra', 4), out: WT('All that extra', 7) - .1, end: BAR(114) };
  const SCR = { x: 600, y: 140, w: 1120, h: 630 };
  const pastCol = { wall: '#F2E4C6', wallDk: '#E0CCA6', wains: '#A9CBB4', wainsDk: '#7FB0A8', floor: '#C89A7A', floorDk: '#9A6E54', board: '#34524A', boardDk: '#243A34', chalk: '#EEF0E4', wood: '#9A6A4E', woodDk: '#6E4834', gold: '#F2CE7E', goldDk: '#C8962E', steel: '#7F9A98', paper: '#F7EEDC' };
  const cP = (P, col, o = {}) => piece(P, col, { ink: NOIR.pastInk, sw: 1.8, ...o });
  // the grade: a gold star with its right half missing (the torn edge down the middle). The same drawing before and after.
  function halfStar(x, y, r, key = 'hs', rot = 0) {
    const P = starPts(x, y, r, .45, 5, -Math.PI / 2 + rot), L = P.filter(([px]) => px <= x + .5), cut = [[x, y - r], [x - r * .04, y - r * .5], [x + r * .05, y], [x - r * .03, y + r * .45], [x, y + r * .62]];
    const half = [[x, y - r]].concat(P.filter(([px]) => px < x - .5).sort((a, b) => Math.atan2(a[1] - y, a[0] - x) - Math.atan2(b[1] - y, b[0] - x)).reverse(), cut.slice().reverse());
    // (outline: the star's left points, then back up the torn edge)
    const left = starPts(x, y, r, .45, 5, -Math.PI / 2 + rot).map(([px, py]) => [Math.min(px, x), py]);
    cP(left, pastCol.gold, { shade: pastCol.goldDk, depth: r * .15, key: key + 's', lift: 2 });
    dline(cut, 1.6, NOIR.pastInk, .3);
    dline([[x + r * .12, y - r * .3], [x + r * .3, y - r * .2]], 1.2, NOIR.pastInk, 0); dline([[x + r * .1, y + r * .15], [x + r * .32, y + r * .3]], 1.2, NOIR.pastInk, 0);   // a few crumbs off the tear
  }
  // a homework sheet (paper, squiggle lines) with its grade box: 'half' (the half-star), 'blank' or 'answers' (ticks)
  function sheet(x, y, w, grade, rot = 0, key = 'sh') {
    push(); translate(x, y); rotate(rot);
    cP(box(-w / 2, -w * .65, w / 2, w * .65), pastCol.paper, { sw: 1.4, key: key + 'p', lift: 2, shade: '#D8C8A8', depth: w * .08 });
    for (let i = 0; i < 4; i++) dline([[-w * .38, -w * .38 + i * w * .18], [w * (.05 + .25 * hash(i + w)), -w * .38 + i * w * .18]], 1, '#8A7A66', .5);
    if (grade === 'half') halfStar(w * .22, w * .38, w * .2, key + 'g');
    if (grade === 'answers') { for (let i = 0; i < 4; i++) dline([[w * .2, -w * .36 + i * w * .18], [w * .26, -w * .3 + i * w * .18], [w * .38, -w * .44 + i * w * .18]], 2, '#C8323A', 0); cP(starPts(0, w * .38, w * .2, .45, 5, -Math.PI / 2), pastCol.gold, { sw: 1.2, key: key + 'gs', lift: 1 }); }
    pop();
  }
  // the film's look over the cartoon: flicker, dust and scratches, the projector's vignette (inside whatever transform)
  function filmOver(t) { const f = psFilmFrame(t); psDirt(f); boilSeed('v3 flick'); psFlicker(f, .6); }
  // Scene A / D: the classroom. The board (a whole gold star chalked on it: the goal), five little desks, the master.
  const DESK = [390, 570, 750, 930, 1110], DESK_Y = 800;
  const CAMC = { A: [880, 650, 1.45], C: [960, 640, 1.3] };   // (B, the briefing: brfCam)
  // A's camera (on ones): held on the class; on "the bots went off" it pushes toward the exit side as they sneak out, the
  // pupils filing out big, the master's pointing hand leading them off at the right edge, and on into the iris
  const camA = t => { const D = V3D, k = ease(seg(t, D.sneak - .1, D.B - .15)); return [lerp(CAMC.A[0], 640, k), lerp(CAMC.A[1], 700, k), Math.exp(lerp(Math.log(CAMC.A[2]), Math.log(1.72), k))]; };
  function classroom(t) {
    boilSeed('v3 class');
    cP(box(-200, -200, W + 200, 590), pastCol.wall, { ink: null, key: 'v3cw' });
    cP(box(-200, 580, W + 200, 720), pastCol.wains, { sw: 1.6, key: 'v3cwn' });
    cP(box(-200, 720, W + 200, H + 200), pastCol.floor, { sw: 1.8, key: 'v3cf' });
    for (let i = 0; i < 9; i++) dline([[-200, 760 + i * 40 + i * i * 3], [W + 200, 760 + i * 40 + i * i * 3]], 1.2, pastCol.floorDk);
    // the blackboard: the goal (a whole star) and the sums, in chalk symbols
    cP(box(290, 250, 1230, 560), pastCol.wood, { sw: 2.2, key: 'v3bdf' });
    cP(box(310, 268, 1210, 542), pastCol.board, { sw: 1.6, key: 'v3bd' });
    const st = starPts(1070, 405, 95, .45, 5, -Math.PI / 2); dline(st.concat([st[0]]), 3.4, pastCol.chalk, 0);
    for (let r = 0; r < 3; r++) { const y = 320 + r * 80; dline([[350, y], [410, y - 18], [460, y + 10], [520, y - 14]], 2.8, pastCol.chalk, .5); dline([[555, y - 18], [575, y + 18]], 2.8, pastCol.chalk, 0); dline([[545, y], [585, y]], 2.8, pastCol.chalk, 0); dline([[620, y - 8], [670, y + 12], [730, y - 12], [800, y + 6]], 2.8, pastCol.chalk, .5); }
    dline([[860, 405], [940, 405]], 3, pastCol.chalk, 0); dline([[920, 390], [940, 405], [920, 420]], 3, pastCol.chalk, 0);
    cP(oval(1440, 330, 58, 58, 0, 28), pastCol.paper, { sw: 2, key: 'v3clk' });
    dline([[1440, 330], [1440, 290]], 3.4, NOIR.pastInk); dline([[1440, 330], [1470, 346]], 3.4, NOIR.pastInk);
  }
  function deskFront(i) { const x = DESK[i]; cP(box(x - 82, DESK_Y - 30, x + 82, DESK_Y), pastCol.wood, { sw: 1.8, key: 'v3dt' + i, shade: pastCol.woodDk, depth: 8 }); cP(box(x - 72, DESK_Y, x + 72, DESK_Y + 110), pastCol.woodDk, { sw: 1.6, key: 'v3df' + i }); }
  const PUP = ['dewey', 'seedy', 'codey', 'fireball', 'bsod'];   // (Codey, the leader, at the middle desk; it gives the heist briefing)
  function pupil(i, t, o) { const { x, y, ...r } = o; codex(x ?? DESK[i], y ?? DESK_Y + 30, 40, { kind: PUP[i], view: 'front', t: t + i * .13, noShadow: true, boilKey: 'v3pup' + i, ...r, emote: null }); }
  function master(x, t, o) { altman(x, 1010, 40, { gown: true, cap: true, view: 'q', flip: true, boilKey: 'v3master', ...o }); }
  // The master's hand in the insert, holding the sheet out by its right edge (clear of the banner, which hid the old one),
  // in the rubber-hose idiom he wears in the classroom (the hybrid Altman, bosses.js): the gown's black sleeve coming in
  // from the right, its bell flared at the wrist, the puffy glove (style.js inkGlove, which hand() draws only inside a
  // figure: INK_FIG is set here as a figure's would be, its contour the sheet's own edge weight). rot / dx: the sheet's
  // turn and knock, so the grip goes with it.
  function gradeHand(rot, dx) {
    const s = 150, u = s / 1.22, ang = Math.PI + .1, dir = [Math.cos(ang), Math.sin(ang)], n = [-dir[1], dir[0]];
    const g = [960 + dx + 516 * Math.cos(rot) - 170 * Math.sin(rot), 560 + 516 * Math.sin(rot) + 170 * Math.cos(rot)];   // (the grip: on the sheet's right edge)
    const wr = [g[0] - dir[0] * .9 * s, g[1] - dir[1] * .9 * s], P = (p, k) => [wr[0] - dir[0] * k * u + n[0] * p * u, wr[1] - dir[1] * k * u + n[1] * p * u];
    const ds = drawScale(), sw = psSW * .8, C = 2.6 * INK_PX.flash * ds, prev = INK_FIG, ink = NOIR.ink;
    INK_FIG = { sw, C, k: C / (sw * INK_PX.flash * ds), rig: 'altman', bot: false, flat: true, hose: 0 };
    NOIR.ink = PS.ink;
    try {
      boilSeed('v3 gradehand');
      piece(ribbon([[W + 260, g[1] + 330], lerpP([W + 260, g[1] + 330], P(0, .6), .55), P(0, .6)], .44 * u, .4 * u), BS_AC.gown, { sw, key: 'v3gcsl' });   // the sleeve
      piece(curvy([P(.22, .95), P(.56, .1), P(-.56, .1), P(-.22, .95)], 3), BS_AC.gown, { sw, key: 'v3gcbell' });                                     // its bell
      hand(wr[0], wr[1], ang, s, { pose: 'hold', glove: true, sw, key: 'v3gch', mirror: true });
    } finally { INK_FIG = prev; NOIR.ink = ink; }
  }
  // the close-up insert: a gloved hand holding out a homework sheet, its grade filling the frame. stamp 0..1: a rubber
  // stamp comes down (1 = on the paper) and lifts; the grade under it is the half-star, the same drawing both times.
  function gradeClose(t, grade, stamp = -1) {
    boilSeed('v3 gradec');
    cP(box(-200, -200, W + 200, H + 200), pastCol.wains, { ink: null, key: 'v3gcbg' });
    for (let i = 0; i < 12; i++) dline([[-200, i * 110], [W + 200, i * 110 + 40]], 1, pastCol.wainsDk, 0);
    const wob = .015 * Math.sin(t * 7), hit = stamp > .55 && stamp < .75 ? 1 : 0;
    push(); translate(960 + (hit ? 4 : 0), 560); rotate(-.05 + wob);
    cP(box(-520, -620, 520, 700), pastCol.paper, { sw: 2.6, shade: '#D8C8A8', depth: 34, key: 'v3gcp' });
    for (let i = 0; i < 3; i++) dline([[-440, -470 + i * 70], [lerp(80, 200, hash(i * 3.3)), -470 + i * 70]], 3.4, '#8A7A66', 0);
    if (grade === 'answers') for (let i = 0; i < 3; i++) dline([[250, -470 + i * 70], [280, -445 + i * 70], [330, -500 + i * 70]], 7, '#C8323A', 0);
    cP(box(-230, -290, 230, 170), pastCol.paper, { sw: 2.4, key: 'v3gcbox' });   // the grade box
    if (grade === 'half') halfStar(0, -60, 190, 'v3gchs');
    pop();
    gradeHand(-.05 + wob, hit ? 4 : 0);
    // the rubber stamp comes down on the box (THUNK) and lifts away
    if (stamp >= 0) {
      const y = stamp < .55 ? lerp(-420, 500, easeIn(stamp / .55)) : stamp < .75 ? 500 : lerp(500, -560, easeIn((stamp - .75) / .25));
      cP(box(870, y - 400, 1050, y - 90), pastCol.wood, { sw: 2.4, key: 'v3stk' }); cP(oval(960, y - 400, 110, 50, 0, 20), pastCol.wood, { sw: 2.4, key: 'v3stkt' });
      cP(box(700, y - 90, 1220, y), '#7A4A34', { sw: 2.4, key: 'v3stb' });
      if (hit) for (let j = 0; j < 6; j++) { const a = -Math.PI * (.15 + .7 * j / 5); dline([[960 + Math.cos(a) * 300, 520 + Math.sin(a) * 120], [960 + Math.cos(a) * 380, 520 + Math.sin(a) * 160]], 5, NOIR.pastInk, 0); }
    }
  }
  // A: homework is set (the goal: a whole star); the master turns to the board; the pupils swap a look and slip out
  function cartoonA(t) {
    const D = V3D;
    classroom(t);
    const turned = t > D.turn, flung = t > D.setHw - .15;
    // (up on "set homework", then out on "the bots went off": pointing them off toward the exit, frame left, and holding
    // as they file out; he faces left, flipped, so +x in his own frame is toward the class and the door)
    // (the pointing hand stops short of BSOD, the nearest pupil, and over the class's heads: it reached across BSOD's face)
    const upR = [2.4, -13.8, .12, 'open', 1], outR = [3.8, -10.2, .04, 'point', 1, -.12], sw = ease(seg(t, D.turn - .1, D.turn + .18));
    const mPose = t < D.setHw - .15 ? 'point' : { L: [-2.25, -3.75, .1, 'relax'], R: t < D.turn - .1 ? upR : [lerp(upR[0], outR[0], sw), lerp(upR[1], outR[1], sw), lerp(upR[2], outR[2], sw), sw > .5 ? 'point' : 'open', 1, sw > .5 ? 0 : undefined] };
    for (let i = 0; i < 5; i++) {   // the sheets fly out to the desks, one per eighth
      const t0 = D.setHw + i * BEAT / 2, k = seg(t, t0 - .28, t0);
      if (t < t0 - .28) continue;
      if (t >= D.sneak + .12 * i) continue;   // (it goes with its pupil: tucked under an arm as it sneaks off)
      const p = arcPt([1240, 560], [DESK[i] + 30, DESK_Y - 34], 200, easeOut(k));
      sheet(p[0], p[1], 64, 'blank', (1 - k) * 5 + .1, 'v3hw' + i);
    }
    for (let i = 0; i < 5; i++) {
      const g0 = D.sneak + .12 * i, gone = seg(t, g0, g0 + .75);
      if (gone >= 1) { deskFront(i); continue; }
      const look = t > D.turn + .12 && t < D.sneak, bob = -.25 * pulse(t + i * .07, 6);
      const x = lerp(DESK[i], -260 - 130 * (4 - i), ease(gone)), up = gone > 0 ? -1.2 * Math.sin(Math.min(1, gone * 4) * Math.PI / 2) : 0;
      pupil(i, t, { ...feel(look ? 'mischief' : 'hopeful', t + i * .3), mouth: look ? 'smile' : 'smile', eyes: look ? 'look' : 'shine', lookX: look ? (i < 2 ? 1 : -1) : .6, lookY: look ? 0 : -.6, view: gone > 0 ? 'q' : 'front', flip: gone > 0, pose: gone > 0 ? 'sneak' : 'idle', aL: .3, aR: .3, x, y: DESK_Y + 30 + (gone > 0 ? -20 : 0), dy: bob + up, hold: gone > 0 ? (sz => sheet(sz * .1, -sz * .2, sz * 1.25, 'blank', -.35, 'v3hwc' + i)) : undefined });
      deskFront(i);
    }
    master(1360, t, { ...emotions(t, [[D.start, 'hopeful'], [D.setHw, 'determined'], [D.turn + .1, 'determined', { mouth: 'smile' }]]), emote: null, pose: mPose, flip: true, view: 'q', lookX: turned ? 1 : .2, lookY: turned ? .1 : 0 });   // (his eyes follow his finger to the door)
  }
  // B: "Broke into the teacher's office; nicked the answer sheet": the heist briefing, behind the bike sheds. The break-in
  // itself is never shown. Three shots, cut on the words and the beat:
  //   S1 (the iris in, to the breath after "office;"): Codey, a proud little teacher, up
  //      on a crate by a flip board, pointer in hand. Page 1, the map: the pointer zips along the dotted route down the
  //      corridor ("Broke into") and taps the X at the office door ("the"); a flick and the page goes over on the bar
  //      ("teacher's"). Page 2, the lock and the pick: it taps the keyhole on "office" and gives it a twist.
  //   S2 (the reverse, "nicked the"): from behind the board (its back at the left edge, page 1's blank back hanging down
  //      it), the other four in a row on upturned buckets, learning the plan: Dewey nodding along, Seedy scribbling notes,
  //      Fireball's hand up with a question, BSOD copying the lock into its notebook.
  //   S3 (cut back on "answer", the last flip already going over): page 3: the filing cabinet, the answer sheet (a whole
  //      star) lifted out of its drawer, an arrow into a satchel. A tap on the sheet on "answer", along the arrow into the
  //      satchel on "sheet"; the iris closes on the satchel.
  // (It used to show the break-in: the corridor, the office door, the cabinet, the answer sheet nicked.)
  const BRF = { pg: { x: 860, y: 215, w: 580, h: 485 }, codey: [612, 792], u: 58, L: 7, cls: [[0, 800], [1, 1050], [3, 1300], [4, 1550]], bktY: 772, bktH: 112, cu: 50 };
  const MK = { ink: NOIR.pastInk, red: '#C8323A', blue: '#4A78B8', tin: '#A3BBA9', tinDk: '#7E9A8A', tinLt: '#C6D8CA', tar: '#AFA293', tarDk: '#8E8272', brick: '#C98C70', brickDk: '#A56650', zinc: '#B2BAB8', zincDk: '#808B89', cap: '#1D1B21', capLt: '#3E3A44', tassel: '#DDAA3A', nb: ['#C8323A', '#4A78B8', '#E0A43A', '#5E8C5A'] };
  const camAt = (c, f) => { push(); translate(W / 2, H / 2); scale(c[2]); translate(-c[0], -c[1]); f(); pop(); };
  // the briefing's cameras (on ones): the board's (S1 and S3, one slow push across both) and the reverse's
  const brfCam = t => { const D = V3D; return t >= D.rev && t < D.back ? [1120, 592, lerp(1.4, 1.44, seg(t, D.rev, D.back))] : [1012, 548, lerp(1.26, 1.34, seg(t, D.B, D.C))]; };
  // a point along a polyline P by length, k 0..1
  function alongP(P, k) {
    const L = []; let tot = 0; for (let i = 1; i < P.length; i++) { const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); L.push(d); tot += d; }
    let s = clamp(k) * tot; for (let i = 0; i < L.length; i++) { if (s <= L[i] || i === L.length - 1) return lerpP(P[i], P[i + 1], L[i] ? Math.min(1, s / L[i]) : 0); s -= L[i]; }
    return P[P.length - 1];
  }
  const arcP = (cx, cy, r, a0, a1, n = 12) => { const P = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return P; };
  // a marker arrow along P, its head at the end
  function mkArrow(P, sw, col, head) {
    dline(P, sw, col, .5);
    const b = P[P.length - 1], a = P[P.length - 2], an = Math.atan2(b[1] - a[1], b[0] - a[0]);
    dline([[b[0] + Math.cos(an + 2.5) * head, b[1] + Math.sin(an + 2.5) * head], b, [b[0] + Math.cos(an - 2.5) * head, b[1] + Math.sin(an - 2.5) * head]], sw, col, 0);
  }
  // the flip board's pages, hand-drawn in marker (pictograms only), in page coords (0..w × 0..h from its top-left).
  // PG1/2/3: where Codey's pointer goes on each.
  const PG1 = { route: [[112, 346], [425, 346], [425, 214]], x: [425, 170] };
  const PG2 = { hole: [262, 258] };
  const PG3 = { star: [178, 142], path: [[178, 142], [228, 90], [330, 60], [404, 200], [432, 300]], bag: [432, 330] };
  function brfPage(p) {
    const { w } = BRF.pg, mk = (P, c = MK.ink, sw = 6, curv = .3) => dline(P, sw, c, curv);
    boilSeed('v3 page' + p);
    cP(box(0, 0, w, BRF.pg.h), pastCol.paper, { sw: 1.6, key: 'v3pg' + p, lift: 1 });
    if (p === 0) {
      // the map: the corridor from above (two classroom doors swinging off it), the office door standing at its end with
      // the master's star on it; us (a little blue cloud) at the start; the route in red dashes to an X at the door
      mk([[36, 300], [118, 300]], MK.ink, 6, 0); mk([[178, 300], [246, 300]], MK.ink, 6, 0); mk([[306, 300], [380, 300], [380, 124]], MK.ink, 6, 0); mk([[36, 392], [470, 392], [470, 124]], MK.ink, 6, 0);
      for (const dx of [118, 246]) mk([[dx, 300], [dx + 22, 250]], MK.ink, 4, 0);   // two classroom doors, standing open
      cP(box(392, 24, 458, 124), pastCol.wood, { sw: 2.4, key: 'v3pgdr', lift: 1 });
      cP(starPts(425, 62, 21, .45, 5, -Math.PI / 2), pastCol.gold, { sw: 1.4, key: 'v3pgds', lift: 1 });
      cP(oval(447, 94, 5, 5, 0, 10), pastCol.goldDk, { sw: 1, key: 'v3pgdk', lift: 1 });
      for (const [cx, cy, r] of [[58, 352, 20], [80, 336, 22], [102, 352, 19], [80, 362, 20]]) cP(oval(cx, cy, r, r * .9, 0, 14), MK.blue, { ink: null, key: 'v3pgus' + cx + cy, lift: 1 });
      for (const ex of [72, 90]) cP(oval(ex, 350, 4, 5, 0, 8), pastCol.paper, { ink: null, key: 'v3pgue' + ex, lift: 1 });
      { let tot = 0; for (let i = 1; i < PG1.route.length; i++) tot += Math.hypot(PG1.route[i][0] - PG1.route[i - 1][0], PG1.route[i][1] - PG1.route[i - 1][1]);
        for (let s = 14; s < tot; s += 30) { const [dx, dy] = alongP(PG1.route, s / tot); cP(oval(dx, dy, 7, 7, 0, 10), MK.red, { ink: null, key: 'v3pgrd' + s, lift: 1 }); } }   // the route, dotted
      const [xx, xy] = PG1.x; mk([[xx - 30, xy - 28], [xx + 30, xy + 28]], MK.red, 10, 0); mk([[xx + 30, xy - 28], [xx - 30, xy + 28]], MK.red, 10, 0);
    } else if (p === 1) {
      // the lock: a big keyhole plate, a pick in the keyhole (its handle out to the right), a twist arrow over it, a click
      cP(b2RoundPoly(box(140, 96, 310, 404), 38), pastCol.gold, { sw: 2.4, shade: pastCol.goldDk, depth: 14, key: 'v3pgpl', lift: 1 });
      cP(oval(225, 222, 30, 30, 0, 20), MK.ink, { ink: null, key: 'v3pgkh', lift: 1 }); cP([[210, 232], [240, 232], [252, 312], [198, 312]], MK.ink, { ink: null, key: 'v3pgkh2', lift: 1 });
      for (const sy of [128, 372]) cP(oval(225, sy, 9, 9, 0, 10), pastCol.goldDk, { sw: 1.2, key: 'v3pgsc' + sy, lift: 1 });
      cP(ribbon([[232, 262], [320, 312], [420, 372]], 9, 8), pastCol.steel, { sw: 1.6, key: 'v3pgpk', lift: 1 });
      cP(ribbon([[404, 362], [512, 426]], 34, 34), pastCol.woodDk, { sw: 1.8, key: 'v3pgpkh', lift: 1 });
      mkArrow(arcP(225, 262, 196, -2.6, -.72, 14), 7, MK.red, 26);
      cP(starPts(334, 176, 36, .42, 7, -.3), pastCol.gold, { sw: 2, key: 'v3pgclk', lift: 1 });   // the click: a spark off the keyhole
    } else {
      // the answer sheet: the filing cabinet, its middle drawer out; the sheet (ticks, a whole star) lifted out of it; a
      // big arrow over into a satchel
      cP(box(40, 190, 206, 452), pastCol.steel, { sw: 2.4, shade: '#5E7472', depth: 14, key: 'v3pgcab', lift: 1 });
      for (const [y0, y1] of [[202, 268], [372, 440]]) { cP(box(54, y0, 192, y1), '#9AB2B0', { sw: 1.8, key: 'v3pgdw' + y0, lift: 1 }); cP(box(106, (y0 + y1) / 2 - 6, 140, (y0 + y1) / 2 + 6), MK.ink, { ink: null, key: 'v3pgdh' + y0, lift: 1 }); }
      cP(box(54, 278, 192, 360), '#3A2E2A', { ink: null, key: 'v3pgdo', lift: 1 });
      cP([[54, 278], [192, 278], [252, 300], [114, 300]], '#7F9A98', { sw: 1.6, key: 'v3pgdt', lift: 1 });
      cP(box(114, 300, 252, 372), '#9AB2B0', { sw: 1.8, key: 'v3pgdf', lift: 1 }); cP(box(166, 330, 200, 342), MK.ink, { ink: null, key: 'v3pgdfh', lift: 1 });
      push(); translate(146, 96); rotate(-.12);
      cP(box(-50, -80, 50, 80), '#FFFDF4', { sw: 2.2, key: 'v3pgsh', lift: 1 });
      for (let i = 0; i < 3; i++) dline([[-34, -54 + i * 28], [-24, -44 + i * 28], [-6, -66 + i * 28]], 5, MK.red, 0);
      pop();
      cP(starPts(PG3.star[0], PG3.star[1], 26, .45, 5, -Math.PI / 2 - .12), pastCol.gold, { sw: 1.6, shade: pastCol.goldDk, depth: 4, key: 'v3pgst', lift: 1 });
      for (const [sx, sy, r] of [[222, 40, 15], [100, 30, 11]]) cP(starPts(sx, sy, r, .3, 4), pastCol.gold, { sw: 1.2, key: 'v3pgsp' + sx, lift: 1 });
      mkArrow([[232, 90], [330, 56], [406, 212]], 8, MK.red, 28);
      dline(arcP(432, 262, 40, Math.PI, TAU, 10), 9, pastCol.woodDk, .3);
      cP(b2RoundPoly(box(336, 256, 528, 446), 30), pastCol.wood, { sw: 2.4, shade: pastCol.woodDk, depth: 16, key: 'v3pgbag', lift: 1 });
      cP(b2RoundPoly(box(336, 256, 528, 346), 26), pastCol.woodDk, { sw: 2, key: 'v3pgflap', lift: 1 });
      cP(box(420, 330, 444, 364), pastCol.gold, { sw: 1.6, key: 'v3pgbk', lift: 1 });
    }
  }
  // the flip board on its easel (S1 and S3): page p on top; fk 0..1 flips it up and over the back (its blank back
  // showing as it goes over the top), the next page under it
  function flipBoard(p, fk) {
    const { x, y, w, h } = BRF.pg;
    boilSeed('v3 easel');
    cP(ribbon([[x + w * .5, y + h], [x + w * .5, 884]], 24, 24), pastCol.woodDk, { sw: 1.8, key: 'v3elb', lift: 1 });
    for (const s of [-1, 1]) cP(ribbon([[s < 0 ? x + 24 : x + w - 24, y - 10], [s < 0 ? x - 56 : x + w + 56, 908]], 28, 34), pastCol.wood, { sw: 2, shade: pastCol.woodDk, depth: 6, key: 'v3el' + s, lift: 2 });
    cP(box(x - 22, y - 12, x + w + 22, y + h + 22), pastCol.wood, { sw: 2.4, shade: pastCol.woodDk, depth: 14, key: 'v3ebd', lift: 2 });
    cP(box(x - 40, y + h + 18, x + w + 40, y + h + 42), pastCol.woodDk, { sw: 2, key: 'v3etray', lift: 2 });
    for (let k = 2; k >= 1; k--) cP(box(x + 3, y + h - 8 + k * 5, x + w - 3, y + h + k * 5), '#E4D6BA', { sw: 1.2, key: 'v3estk' + k, lift: 1 });   // the pad's edges
    // (phi: 0 hanging, pi/2 flat toward us, pi straight up, 1.5 pi flat away over the back: gone behind the board)
    const f = clamp(fk), phi = 1.5 * Math.PI * ease(f), c = Math.cos(phi), s = Math.sin(phi);
    if (f > 0 && f < 1) {
      push(); translate(x, y); brfPage(p + 1); pop();
      if (c < 0) { const top = y + h * c, hw = w / 2 * (1 + .1 * s), mx = x + w / 2; boilSeed('v3 pgback'); cP([[x, y], [x + w, y], [mx + hw, top], [mx - hw, top]], '#E8DCC2', { sw: 1.8, key: 'v3pgbk' + p, lift: 3 }); }
      else { push(); translate(x, y); scale(1, Math.max(.02, c)); brfPage(p); pop(); }
    } else { push(); translate(x, y); brfPage(f >= 1 ? p + 1 : p); pop(); }
    boilSeed('v3 easel clip');
    cP(box(x - 34, y - 26, x + w + 34, y + 14), pastCol.woodDk, { sw: 2, key: 'v3eclip', lift: 3 });
    for (const bx of [x + 60, x + w - 60]) cP(oval(bx, y - 6, 12, 12, 0, 12), pastCol.gold, { sw: 1.4, key: 'v3ewn' + bx, lift: 3 });
  }
  // S1/S3's set: the bike shed's back wall (corrugated tin, the roof's overhang and gutter), its open end at the right
  // with a bike's back wheel inside; tarmac, weeds at the wall's foot
  function shedWall() {
    boilSeed('v3 shed');
    cP(box(-300, -200, W + 300, 842), MK.tin, { ink: null, key: 'v3shw' });
    for (let i = 0; i < 28; i++) { const xx = 164 + i * 72; if (xx > 1580) break; dline([[xx, 92], [xx, 842]], 2.2, MK.tinDk, 0); dline([[xx + 24, 92], [xx + 24, 842]], 3.2, MK.tinLt, 0); }
    cP(box(1600, 92, W + 300, 842), '#3A3430', { ink: null, key: 'v3shin' });
    const wc = [1770, 690];
    dline(oval(wc[0], wc[1], 150, 150, 0, 40).concat([[wc[0] + 150, wc[1]]]), 13, '#26221F', 0);
    dline(oval(wc[0], wc[1], 134, 134, 0, 40).concat([[wc[0] + 134, wc[1]]]), 3, pastCol.steel, 0);
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; dline([wc, [wc[0] + Math.cos(a) * 132, wc[1] + Math.sin(a) * 132]], 1.6, pastCol.steel, 0); }
    cP(oval(wc[0], wc[1], 16, 16, 0, 12), pastCol.steel, { sw: 1.4, key: 'v3shhub' });
    dline(arcP(wc[0], wc[1], 172, Math.PI * 1.02, Math.PI * 1.62, 10), 9, MK.red, .3);   // the mudguard
    cP(box(1582, 58, 1620, 868), pastCol.woodDk, { sw: 2, key: 'v3shpost' });
    cP(box(-300, -200, W + 300, 70), '#565A52', { sw: 2.2, key: 'v3shrf' });
    cP(box(-300, 62, W + 300, 94), '#7A7E74', { sw: 2, key: 'v3shgt' });
    cP(box(-300, 842, W + 300, H + 200), MK.tar, { sw: 2, key: 'v3shfl' });
    for (const [tx, n] of [[330, 4], [470, 3], [1530, 4], [1690, 3]]) for (let k = 0; k < n; k++) { const a = -Math.PI / 2 + (k - (n - 1) / 2) * .38; dline([[tx + k * 6, 846], [tx + k * 6 + Math.cos(a) * 34, 846 + Math.sin(a) * 34]], 3, '#6E8A5A', .4); }
    dline([[600, 930], [660, 952], [700, 940], [790, 972]], 2, MK.tarDk, .3); dline([[1340, 900], [1400, 922], [1470, 912]], 2, MK.tarDk, .3);
  }
  // S2's set: the school's back wall behind the class: brick (a few clusters, the cartoon way), a barred window high up,
  // a drainpipe; tarmac
  function schoolWall() {
    boilSeed('v3 brick');
    cP(box(-300, -200, W + 300, 792), MK.brick, { ink: null, key: 'v3brw' });
    [[520, 250], [1260, 240], [1600, 330], [640, 470], [1440, 590], [980, 560], [1230, 450]].forEach(([cx, cy], j) => {
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { if (hash(j * 9 + r * 3 + c) < .34) continue; const bx = cx + c * 66 + (r % 2) * 33, by = cy + r * 32; cP(box(bx, by, bx + 60, by + 26), MK.brickDk, { sw: 1.2, key: 'v3brk' + j + '_' + r + c, lift: 1 }); }
    });
    cP(box(880, 236, 1180, 424), pastCol.wood, { sw: 2.2, key: 'v3brwin' });
    cP(box(898, 252, 1162, 408), '#5E7A86', { sw: 1.8, key: 'v3brgl' });
    dline([[1030, 252], [1030, 408]], 7, pastCol.wood, 0); dline([[898, 330], [1162, 330]], 7, pastCol.wood, 0);   // four panes
    for (const [gx, gy] of [[930, 280], [1062, 280]]) dline([[gx, gy + 24], [gx + 24, gy]], 4, '#9AB4BE', 0);   // a glint
    cP(box(860, 410, 1200, 434), '#D8C8A8', { sw: 1.8, key: 'v3brsill' });
    cP(box(1742, -200, 1784, 792), '#5E6A6C', { sw: 1.8, key: 'v3brpipe' });
    for (const by of [180, 460]) cP(box(1732, by, 1794, by + 18), '#4A5456', { sw: 1.4, key: 'v3brpb' + by });
    cP(box(-300, 792, W + 300, H + 200), MK.tar, { sw: 2, key: 'v3brfl' });
    dline([[860, 930], [930, 948], [990, 936]], 2, MK.tarDk, .3);
  }
  // Codey's crate (its soapbox): an upturned fruit crate
  function crate(x, y) {
    boilSeed('v3 crate');
    cP(box(x - 100, y - 2, x + 100, 906), pastCol.wood, { sw: 2, shade: pastCol.woodDk, depth: 10, key: 'v3crate', lift: 1 });
    for (let i = 1; i < 3; i++) { const yy = lerp(y, 906, i / 3); dline([[x - 100, yy], [x + 100, yy]], 3, pastCol.woodDk, 0); }
    for (const s of [-1, 1]) dline([[x + s * 80, y + 6], [x + s * 80, 900]], 2, pastCol.woodDk, 0);
  }
  // the master's mortarboard on Codey (a size too big), its tassel swinging; (x, y) the head's top
  function mortarboard(x, y, s, t) {
    boilSeed('v3 mortar');
    cP(b2RoundPoly([[x - s * .62, y + s * .12], [x + s * .62, y + s * .12], [x + s * .56, y - s * .22], [x - s * .56, y - s * .22]], s * .08), MK.cap, { sw: 1.8, key: 'v3mbs', lift: 3 });
    cP([[x - s * 1.12, y - s * .26], [x + s * .04, y - s * .58], [x + s * 1.16, y - s * .28], [x, y + s * .02]], MK.cap, { sw: 1.8, shade: MK.capLt, depth: s * .06, key: 'v3mbb', lift: 3 });
    const bt = [x + s * .02, y - s * .28], sw2 = .1 * Math.sin(t * 5.3), edge = [x + s * .96, y - s * .24], end = [edge[0] + s * (.06 + sw2), edge[1] + s * .55];
    dline([bt, edge, end], 2.6, MK.tassel, .4);
    cP([[end[0] - s * .08, end[1] - s * .04], [end[0] + s * .08, end[1] - s * .04], [end[0] + s * .13, end[1] + s * .32], [end[0] - s * .11, end[1] + s * .32]], MK.tassel, { sw: 1.2, key: 'v3mbt', lift: 3 });
    cP(oval(bt[0], bt[1], s * .1, s * .07, 0, 10), MK.tassel, { sw: 1, key: 'v3mbbt', lift: 3 });
  }
  // a hand target for a Codex pet from a point in its own frame (u from its ground point): the rig's mapT, inverted
  function cxInv(kind, [x2, y2]) {
    const K = B2PET[kind], S0 = -2.3, T0 = -4.6, sy = K.sh[1];
    const hy = y2 >= sy ? y2 * S0 / sy : S0 + (y2 - sy) * (T0 - S0) / (K.top0 - sy), k = clamp((y2 - sy) / (K.hb.cy - sy));
    return [x2 - Math.sign(x2 || 1) * lerp(K.sh[0] - 1.2, K.hb.rx - 1.3, k), hy];
  }
  // Codey's pointer, drawn in its hand's frame (between the palm and the fingers: gripped) out to the world point tip;
  // Mc = the frame codex() was called in
  function pointer(Mc, tip, s) {
    const lp = b2Apply(b2Inv(b2Mat()), b2Apply(Mc, tip)), d = Math.hypot(lp[0], lp[1]);
    push(); rotate(Math.atan2(lp[1], lp[0]));
    piece(ribbon([[-s * .55, 0], [d - s * .1, 0]], s * .3, s * .16), '#C8A870', { ink: NOIR.pastInk, sw: 1.2, key: 'v3ptr', lift: 3, flatCard: true });
    piece(oval(d - s * .08, 0, s * .17, s * .13, 0, 10), '#3A2E2A', { ink: null, key: 'v3ptrt', lift: 3, flatCard: true });
    pop();
  }
  // where Codey's pointer tip is at t (world): S1 the route, taps on the X, a flick to turn the page, the keyhole (taps on
  // "office", a twist); S3 up from the flick to the sheet's star (taps on "answer"), along the arrow into the satchel
  function brfTip(t) {
    const D = V3D, { x, y, h } = BRF.pg, P = q => [x + q[0], y + q[1]];
    const taps = (t0, d, n = 2) => { const k = seg(t, t0, t0 + d); return k > 0 && k < 1 ? Math.abs(Math.sin(k * n * Math.PI)) : 0; };
    const tapAt = (q, k) => [q[0] - 20 * k, q[1] + 26 * k];   // (a tap: the tip lifts off toward Codey and back)
    if (t < D.back) {
      const r0 = WT('Broke', 0), r1 = WT('Broke', 2) - .2, x0 = r1 + .06, flick = D.flip1 - .1, off = WT('Broke', 4);
      if (t < r0) return P(lerpP([60, 430], PG1.route[0], easeOut(seg(t, D.B, r0))));
      if (t < r1) return P(alongP(PG1.route, ease(seg(t, r0, r1))));
      if (t < x0) return P(lerpP(PG1.route[2], PG1.x, ease(seg(t, r1, x0))));
      if (t < flick - .12) return P(tapAt(PG1.x, taps(x0, flick - .12 - x0)));
      if (t < flick) return P(lerpP(PG1.x, [446, h + 14], ease(seg(t, flick - .12, flick))));
      if (t < flick + .12) return P(lerpP([446, h + 14], [488, 330], easeOut(seg(t, flick, flick + .12))));
      if (t < off) return P(lerpP([488, 330], PG2.hole, ease(seg(t, flick + .12, flick + .36))));
      if (t < off + .24) return P(tapAt(PG2.hole, taps(off, .24)));
      const tw = seg(t, off + .26, D.rev - .02), a = tw * TAU * 1.5;
      return P([PG2.hole[0] + 18 * Math.sin(a), PG2.hole[1] - 18 * (1 - Math.cos(a)) * .6]);
    }
    const s0 = D.back, s1 = s0 + .14, s2 = s1 + .2, sh = WT('Broke', 8) + .08;
    if (t < s1) return P(lerpP([488, 330], PG3.star, ease(seg(t, s0, s1))));   // (from the flick that sent page 2 over)
    if (t < s2) return P(tapAt(PG3.star, taps(s1, s2 - s1)));
    if (t < sh) return P(alongP(PG3.path, ease(seg(t, s2, sh))));
    return P(tapAt(PG3.path[4], taps(sh, .16, 1) * .6));
  }
  // S1/S3: Codey on its crate at the flip board
  function briefBoard(t) {
    const D = V3D, [gx, gy] = BRF.codey, u = BRF.u, K = B2PET.codey, tip = brfTip(t);
    shedWall();
    // (the flips: the page half up on the beat; the cut back lands with page 2 still going up over page 3)
    // (page 3 settles .1 s sooner, for a longer look at the satchel before the iris closes on it)
    if (t < D.back) flipBoard(0, seg(t, D.flip1 - .1, D.flip1 + .3)); else flipBoard(1, seg(t, D.back - .14, D.back + .14));
    crate(gx, gy + 4);
    // the arm reaches along the line from the shoulder to the tip, a pointer's length short of it (the rubber-hose arm
    // stretching for the far corners)
    const sh = [gx + (K.sh[0] + .08) * u, gy + K.sh[1] * u], dx = tip[0] - sh[0], dy = tip[1] - sh[1], d = Math.hypot(dx, dy) || 1;
    const arm = clamp(d - BRF.L * u, 1.3 * u, 2.4 * u), R = cxInv('codey', [(sh[0] + dx / d * arm - gx) / u, (sh[1] + dy / d * arm - gy) / u]);
    const face = t < D.back
      ? emotions(t, [[D.B, 'determined', { lookX: .8, lookY: -.3 }], [WT('Broke', 2) - .1, 'excited', { lookX: -.3 }], [D.flip1 + .24, 'determined', { lookX: .8, lookY: -.2 }], [WT('Broke', 4) + .28, 'happy', { lookX: -.3 }]])
      : emotions(t, [[D.back - .5, 'determined', { lookX: .8, lookY: -.3 }], [WT('Broke', 8) - .02, 'proud', { lookX: -.3 }]]);
    const Mc = b2Mat();
    const out = codex(gx, gy, u, { kind: 'codey', view: 'q', t, boilKey: 'v3brf', noShadow: true, ...face, emote: null,
      pose: { L: [-1.55, -1.25, -.4, 'fist', 0, 1.2], R: [R[0], R[1], .06, 'hold', 1] }, hold: s => pointer(Mc, tip, s) });
    // (no mortarboard: hats hid the pets' designs; the user: ditch them. The crate, the pointer and the board make him the teacher)
  }
  // S2's foreground: the flip board from behind at the left edge: its far leg, the board's back, page 1 hanging down it
  // (flipped over the top: its blank back to us, the map showing through faintly, mirrored), the clip bar and a wing
  // nut, and the easel's back leg coming at the camera across it
  function boardBack() {
    boilSeed('v3 bback');
    const pg = '#E8DCC2', X = px => 640 - px * .569, Y = py => 282 + py * .887;
    cP(ribbon([[648, 280], [700, 806]], 22, 26), pastCol.woodDk, { sw: 1.8, key: 'v3bbfl', lift: 1 });
    cP(box(300, 262, 662, 800), pastCol.wood, { sw: 2.6, shade: pastCol.woodDk, depth: 16, key: 'v3bbk', lift: 2 });
    cP([[310, 282], [640, 282], [646, 690], [612, 718], [310, 712]], pg, { sw: 2, key: 'v3bbpg', lift: 3 });
    cP([[646, 690], [612, 718], [624, 682]], '#D6C8AA', { sw: 1.4, key: 'v3bbcurl', lift: 3 });   // its corner, curling
    for (const py of [300, 392]) dline([[X(36), Y(py)], [X(380), Y(py)]], 3, mixCol(MK.ink, pg, .78), 0);
    for (let px = 126; px < 425; px += 30) cP(oval(X(px), Y(346), 4, 4, 0, 8), mixCol(MK.red, pg, .68), { ink: null, key: 'v3bbgh' + px, lift: 3 });
    cP(box(290, 244, 684, 290), pastCol.woodDk, { sw: 2.2, key: 'v3bbcl', lift: 3 });
    cP(oval(610, 267, 13, 13, 0, 12), pastCol.gold, { sw: 1.4, key: 'v3bbwn', lift: 3 });
    cP(ribbon([[470, 256], [720, 1160]], 30, 54), pastCol.wood, { sw: 2.4, shade: pastCol.woodDk, depth: 8, key: 'v3bbleg', lift: 3 });
  }
  // an upturned galvanised bucket (a seat): its base on top, the rim on the ground, the handle hanging
  function bucket(x, y, k) {
    const h = BRF.bktH;
    boilSeed('v3 bucket' + k);
    dline([[x - 50, y + 40], [x - 84, y + h * .78], [x - 60, y + h - 6]], 2.6, MK.zincDk, .5);
    cP([[x - 46, y], [x + 46, y], [x + 60, y + h], [x - 60, y + h]], MK.zinc, { sw: 1.8, shade: MK.zincDk, depth: 12, key: 'v3bk' + k, lift: 1 });
    for (const f of [.3, .62]) dline([[x - 46 - 14 * f, y + h * f], [x + 46 + 14 * f, y + h * f]], 1.6, MK.zincDk, 0);
    cP(box(x - 64, y + h - 14, x + 64, y + h + 2), MK.zincDk, { sw: 1.6, key: 'v3bkr' + k, lift: 1 });
  }
  // a tiny spiral notepad held upright at its left edge: a coloured cover, the pad, the spiral along the top (doodle 2:
  // the lock, copied off the board, on the pad's left, clear of the writing hand), and a pencil (yellow, a pink eraser,
  // standing up out of the fist)
  function notebook(s, col, key, doodle) {
    // (flat fills over a dark underlay: at this size the look's outline would swallow the cover's colour)
    const x0 = -s * .3, x1 = s * 3.1, y0 = -s * 1.7, y1 = s * .7, o = s * .12;
    cP(box(x0 - o, y0 - o, x1 + o, y1 + o), MK.ink, { ink: null, key: key + 'nbo', lift: 3 });
    cP(box(x0, y0, x1, y1), col, { ink: null, key: key + 'nb', lift: 3 });
    cP(box(x0 + s * .38, y0 + s * .5, x1 - s * .38, y1 - s * .32), pastCol.paper, { ink: null, key: key + 'np', lift: 3 });
    for (let k = 0; k < 5; k++) cP(oval(lerp(x0 + s * .55, x1 - s * .55, k / 4), y0 + s * .16, s * .11, s * .2, 0, 8), MK.ink, { ink: null, key: key + 'ns' + k, lift: 3 });
    if (doodle === 2) { const cx = s * .55, cy = -s * .55; cP(oval(cx, cy - s * .12, s * .26, s * .26, 0, 10), MK.ink, { ink: null, key: key + 'nk', lift: 3 }); cP([[cx - s * .12, cy], [cx + s * .12, cy], [cx + s * .22, cy + s * .62], [cx - s * .22, cy + s * .62]], MK.ink, { ink: null, key: key + 'nk2', lift: 3 }); dline([[cx + s * .2, cy + s * .2], [cx + s * 1.1, cy + s * .75]], 2, pastCol.steel, 0); }
    else for (let r = 0; r < 3; r++) dline([[s * .1, -s * .95 + r * s * .45], [s * (1.4 + 1.2 * hash(r + doodle * 3)), -s * .95 + r * s * .45]], 1.6, '#8A7A66', .3);
  }
  function pencil(s, key) {
    const F = (P, c, k) => piece(P, c, { ink: null, key: key + k, lift: 4, flatCard: true, edge: false });
    F(ribbon([[s * .6, -s * 1.86], [-s * .1, s * .9]], s * .5, s * .46), MK.ink, 'pco');   // (its outline, underneath)
    F(ribbon([[s * .55, -s * 1.66], [-s * .02, s * .42]], s * .32, s * .3), '#F0BE3A', 'pc');
    F(oval(s * .6, -s * 1.72, s * .16, s * .13, .3, 10), '#E890A0', 'pe');
    F([[-s * .16, s * .44], [s * .12, s * .5], [-s * .06, s * .8]], '#E8C8A0', 'pt');
  }
  // a speech bubble with a question mark (Fireball's question)
  function qBubble(x, y, s, key) {
    const B = [[-40, -32], [40, -32], [46, 22], [12, 26], [-22, 46], [-10, 26], [-40, 22]].map(([a, b]) => [x + a * s, y + b * s]);
    cP(curvy(B, 3), pastCol.paper, { sw: 1.8, key });
    dline([[-11, -16], [0, -25], [11, -16], [0, -4], [0, 4]].map(([a, b]) => [x + a * s, y + b * s]), 4.4 * s, MK.ink, .5);
    cP(oval(x, y + 14 * s, 3.6 * s, 3.6 * s, 0, 8), MK.ink, { ink: null, key: key + 'd' });
  }
  // S2, the reverse: the four on their buckets, learning the plan (Codey out of shot to the right, the board at the left)
  function briefClass(t) {
    const u = BRF.cu, Mc = b2Mat();
    schoolWall();
    BRF.cls.forEach(([i, x], j) => {
      const y = BRF.bktY, key = 'v3cl' + i, col = MK.nb[j];
      bucket(x, y, i);
      const book = dd => s => { b2Upright(Mc); notebook(s, col, key, dd); }, pen = s => { b2Upright(Mc); pencil(s, key); };
      const L = [-.95, -1.75, .2, 'hold', 1];
      let o;
      if (j === 0) {   // Dewey: nodding along, on every beat
        const nod = pulse(t, 7);
        o = { ...feel('hopeful', t), lookX: -.35, lookY: -.2 + .7 * nod, dy: .12 * nod, pose: { L }, holdL: book(0) };   // (the drop is all head: no hand fits in front of it to write, so it clutches its pad)
      } else if (j === 1) {   // Seedy: scribbling it all down
        o = { ...feel('neutral', t), eyes: 'look', mouth: 'smile', lookX: .05, lookY: .85, pose: { L, R: [.2 + .14 * Math.sin(t * TAU * 7), -1.72 + .05 * Math.sin(t * TAU * 11), .2, 'hold', 1] }, holdL: book(1), hold: pen };
      } else if (j === 2) {   // Fireball: its hand up with a question, keen
        o = { ...feel('excited', t), lookX: .3, lookY: -.3, dy: -.1 * Math.abs(Math.sin(t * TAU * 2.3)), pose: { L, R: [1.05 + .1 * Math.sin(t * TAU * 3), -6.5, .12, 'open', 1] }, holdL: book(1) };
      } else {   // BSOD: copying the lock off the board, eyes up to it and down to its notebook each beat
        const up = frac(bpo(t)) < .5;
        o = { ...feel('neutral', t), eyes: 'look', mouth: 'smile', lookX: up ? -.85 : -.1, lookY: up ? -.35 : .75, pose: { L: [-1.0, -2.2, .2, 'hold', 1], R: [.55 + .06 * Math.sin(t * TAU * 6), -2.15, .2, 'hold', 1] }, holdL: book(2), hold: pen };
      }
      const out = codex(x, y + .3 * u, u, { kind: PUP[i], view: 'front', t: t + i * .13, noShadow: true, boilKey: key, ...o, emote: null });
      if (j === 2 && out.hands.R) qBubble(out.hands.R[0] + 96, out.hands.R[1] - 16, 1.15, 'v3clq');
    });
    boardBack();
  }
  function cartoonB(t) {
    const D = V3D;
    camAt(brfCam(t), () => { if (t >= D.rev && t < D.back) briefClass(t); else briefBoard(t); });
  }
  // where the iris out of the briefing closes: on the satchel (screen, and a radius that covers the frame from there)
  function brfIris(t) { const c = brfCam(t), bx = BRF.pg.x + PG3.bag[0], by = BRF.pg.y + PG3.bag[1], x = W / 2 + (bx - c[0]) * c[2], y = H / 2 + (by - c[1]) * c[2]; return [x, y, Math.max(Math.hypot(x, y), Math.hypot(W - x, y), Math.hypot(x, H - y), Math.hypot(W - x, H - y))]; }   // (r: just covering the frame, so the close shows from its first frame)
  // C: the cloakroom: a tin-can telephone web (the group chat) with symbol bubbles. On "organised" the chat agrees: every
  // bubble pops at once with the same thing, the flip board's office door and its X (a callback to the briefing). On
  // "raid" the gang goes up in a cartoon dust cloud that whooshes off frame. (The plan chalked on the floor is gone: the
  // flip board has the plan.)
  function cartoonC(t) {
    const D = V3D;
    boilSeed('v3 cloak');
    cP(box(-200, -200, W + 200, 720), pastCol.wallDk, { ink: null, key: 'v3clw' });
    for (let i = 0; i < 6; i++) { const x = 220 + i * 290; cP(box(x - 70, 250, x + 70, 270), pastCol.wood, { sw: 1.4, key: 'v3rail' + i }); cP(oval(x, 262, 12, 12, 0, 12), pastCol.woodDk, { sw: 1.2, key: 'v3peg' + i }); cP(curvy([[x - 50, 270], [x - 70, 330], [x - 80, 470], [x - 40, 470], [x, 440], [x + 40, 470], [x + 80, 470], [x + 70, 330], [x + 50, 270]], 4), [pastCol.wains, pastCol.floor, '#C8A8C0'][i % 3], { sw: 1.8, key: 'v3coat' + i }); }
    cP(box(-200, 720, W + 200, H + 200), pastCol.floor, { sw: 1.8, key: 'v3clf' });
    const raidK = seg(t, D.raid, D.raid + .7);
    const pos = [[440, 860], [700, 790], [960, 880], [1220, 790], [1480, 860]], hub = [960, 590];
    if (raidK <= 0) {
      for (let i = 0; i < 5; i++) { const [x, y] = pos[i]; dline([[x + 52, y - 150], [lerp(x + 52, hub[0], .5), lerp(y - 150, hub[1], .5) + 34], hub], 1.8, NOIR.pastInk, .5); }
      cP(oval(hub[0], hub[1], 16, 16, 0, 14), pastCol.gold, { sw: 1.4, key: 'v3knot' });
      // organised: from "organised" everyone's on the same beat with the same bubble; a squash just before the whoosh
      const org = t > D.org, prep = ease(seg(t, D.raid - .2, D.raid));
      for (let i = 0; i < 5; i++) {
        const [x, y] = pos[i], ph = frac(bpo(t) + (org ? 0 : i * .37)), talk = ph < .3, F = feel(org ? 'determined' : 'thinking', t + i * .2);
        codex(x, y, 38, { kind: PUP[i], view: 'front', t: t + i * .13, boilKey: 'v3cp' + i, emote: null, ...F, sq: (F.sq || 0) + .16 * prep, mouth: talk ? 'open' : 'smile', eyes: 'look', lookX: org ? 0 : (hub[0] - x) / 600, lookY: org ? -.3 : -.6, pose: { R: [1.4, -3.9, .3, 'hold', 1] }, hold: s => { cP(box(-s * .2, -s * .5, s * 1.5, s * .5), '#B8C0C4', { sw: 1.2, key: 'v3can' + i }); dline([[s * 1.28, -s * .5], [s * 1.28, s * .5]], 1, NOIR.pastInk, 0); } });   // (the can pokes out of the fist, its rim toward the string)
        const bi = Math.floor(bpo(t) + (org ? 0 : i * .37)), age = ph * BEAT;
        if (t > D.chat - .25 && t < D.raid) {
          const sym = org ? 5 : (bi + i) % 5, bx = x + 50, by = y - (org ? 272 : 210) - age * (org ? 50 : 130), sc = backOut(clamp(age / .15)) * (org ? 1.65 : 1.2);
          push(); translate(bx, by); scale(sc); cP(curvy([[-40, -32], [40, -32], [46, 22], [12, 26], [-4, 44], [-6, 26], [-40, 22]], 3), pastCol.paper, { sw: 1.8, key: 'v3bub' + i });
          if (sym === 0) dline([[-9, -13], [0, -20], [9, -13], [0, -3], [0, 3]], 3.4, NOIR.pastInk, .5);
          else if (sym === 1) cP(starPts(0, -4, 18, .45, 5, -Math.PI / 2), pastCol.gold, { sw: 1.2, key: 'v3bs' + i });
          else if (sym === 2) { dline([[-18, -4], [16, -4]], 3.4, NOIR.pastInk, 0); dline([[5, -15], [16, -4], [5, 7]], 3.4, NOIR.pastInk, 0); }
          else if (sym === 3) { cP(oval(0, -8, 12, 12, 0, 14), '#FFE9A0', { sw: 1.2, key: 'v3bb' + i }); dline([[-5, 5], [5, 5]], 2.8, NOIR.pastInk, 0); }
          else if (sym === 4) dline([[-16, -2], [-6, 9], [16, -16]], 3.8, '#C8323A', 0);
          else {   // the flip board's map in little: us (a blue dot), the dotted route, the X at the office door (its star)
            cP(box(14, -28, 32, -4), pastCol.wood, { sw: 1.2, key: 'v3bdr' + i }); cP(starPts(23, -17, 5, .45, 5, -Math.PI / 2), pastCol.gold, { ink: null, key: 'v3bds' + i });
            cP(oval(-31, 10, 5, 4.5, 0, 10), '#4A78B8', { ink: null, key: 'v3bdu' + i });
            for (const [dx, dy] of [[-21, 10], [-12, 10], [-3, 10], [6, 10]]) cP(oval(dx, dy, 2.4, 2.4, 0, 8), '#C8323A', { ink: null, key: 'v3bdd' + i + dx });
            dline([[15, -1], [31, 15]], 2.4, '#C8323A', 0); dline([[31, -1], [15, 15]], 2.4, '#C8323A', 0);
          }
          pop();
        }
      }
    } else {
      // the raid: the whole gang as one cartoon dust cloud, arms, caps and stars flying out of it, whooshing off frame
      const cx = lerp(900, 2500, easeIn(raidK)), cy = 830;
      for (let j = 0; j < 8; j++) { const a = j / 8 * TAU + t * 9, r = 120 + 25 * Math.sin(t * 30 + j); cP(psScallop(cx + Math.cos(a) * r * .6, cy + Math.sin(a) * r * .35, 100, 78, 7, 18, 0, t * 5 + j, 5, j), pastCol.wall, { sw: 2, key: 'v3dust' + j }); }
      for (let j = 0; j < 5; j++) { const a = t * 13 + j * 1.3; dline([[cx + Math.cos(a) * 70, cy + Math.sin(a) * 45], [cx + Math.cos(a) * 190, cy + Math.sin(a) * 120]], 9, NOIR.pastInk, .3); }
      for (let j = 0; j < 4; j++) psTwinkle(cx + Math.cos(t * 7 + j * 1.6) * 150, cy - 100 + Math.sin(t * 9 + j) * 60, 24, 1);
      for (let j = 0; j < 6; j++) dline([[cx - 220 - j * 60, cy - 70 + j * 28], [cx - 460 - j * 90, cy - 70 + j * 28]], 2.4, NOIR.pastInk, 0);
    }
  }
  // D: the marking, the same classroom: they hold up their (perfect-looking) homework; stamp, stamp, stamp, and the
  // insert's THUNK is the fourth. Near to far (BSOD, Fireball, Codey), about .3 s apart over "extra effort" (it was five in
  // .7 s); the master's rubber-hose arm stretches a little further each time, bowing up over the heads, and it's drawn
  // in front of the class (it went behind the pupils, their desks and their sheets), each stamp coming down on the
  // sheet held up to it. A stamped sheet stays up a moment, its half-star showing, then sinks.
  const D_ORDER = [4, 3, 2], D_NEXT = 1;
  const dStamps = () => { const D = V3D; return [D.D + .45, D.D + .75, D.D + 1.05]; };
  // the stamp in the classroom (world px): a long wooden handle up into his fist (its top under the glove, at (x, y)), the
  // block and its rubber face D_FACE px below (drawn under the master, so his fist closes over the handle: drawn as the
  // glove's held prop it came out a sliver under his fingers, the rig's contour swallowing it)
  const D_FACE = 84;   // (his glove is big: the stamp is sized to it, its block a little wider than a pupil's sheet)
  function classStamp(x, y) {
    boilSeed('v3 cstamp');
    cP(box(x - 7, y - 10, x + 7, y + D_FACE - 20), pastCol.wood, { sw: 1.8, key: 'v3stph' });
    cP(box(x - 24, y + D_FACE - 22, x + 24, y + D_FACE - 6), '#7A4A34', { sw: 1.8, shade: pastCol.woodDk, depth: 4, key: 'v3stpb' });
    cP(box(x - 21, y + D_FACE - 6, x + 21, y + D_FACE), NOIR.pastInk, { ink: null, key: 'v3stpr' });
  }
  function cartoonD(t) {
    const D = V3D, S = dStamps(), Mw = b2Mat();
    classroom(t);
    const stampAt = i => { const j = D_ORDER.indexOf(i); return j < 0 ? Infinity : S[j]; }, grade = [];
    for (let i = 0; i < 5; i++) {
      const ts = stampAt(i), stamped = t > ts, low = t > ts + .45;
      pupil(i, t, { ...feel(stamped ? (t > ts + .18 ? 'sad' : 'surprised') : 'hopeful', t + i * .2), pose: { R: [1.7, low ? -3.3 : -4.6, .2, 'hold', 1] },
        hold: s => { sheet(s * 1.1, -s * .8, s * 2, stamped ? 'half' : 'answers', 0, 'v3new' + i); grade[i] = b2To(Mw, [s * 1.3, -s * .04]); },   // (where the stamp lands: the sheet's lower half)
        dy: stamped ? .2 * spring(t, ts, 8, 20) : -.2 * pulse(t, 6) });
      deskFront(i);
    }
    // the stamp's grip (world): poised over the first sheet, down on each in turn (THUNK), up and over to the next; after
    // the third it rises toward the next pupil as the insert cuts in
    const B = inkRH() ? BS_ALTMAN_HY : BS_ALTMAN, MX = 1420, off = D_FACE, H = 60;
    const at = i => [grade[i][0], grade[i][1] - off], up = (p, h = H) => [p[0], p[1] - h];
    let grip, down = false;
    const j = S.findIndex(s => t < s + .06);
    if (j === 0 && t < S[0] - .07) grip = up(at(D_ORDER[0]), H * (1 + .25 * ease(seg(t, D.D, S[0] - .07))));   // (poised, winding up)
    else if (j >= 0 && t < S[j] - .07) { const k = ease(seg(t, S[j - 1] + .06, S[j] - .07)), a = at(D_ORDER[j - 1]), b = up(at(D_ORDER[j])); grip = lerpP(a, b, k); grip[1] -= 40 * Math.sin(Math.PI * k); }
    else if (j >= 0 && t < S[j]) grip = lerpP(up(at(D_ORDER[j]), H * 1.25), at(D_ORDER[j]), easeIn(seg(t, S[j] - .07, S[j])));
    else if (j >= 0) { grip = at(D_ORDER[j]); down = true; }
    else { const k = ease(seg(t, S[2] + .06, S[2] + .34)); grip = lerpP(at(D_ORDER[2]), up(at(D_NEXT)), k); grip[1] -= 40 * Math.sin(Math.PI * k); }
    // the hand's target for that grip (the fist's middle, about half the glove's length out from the wrist along the hand)
    const bend = -.14, oM = { ...feel('neutral', t), emote: null, view: 'q', flip: true, boilKey: 'v3master', gown: true, cap: true }, W2 = bsWorld(B, MX, 1010, 40, oM), o0 = W2([0, 0]), ax = W2([1, 0]), ay = W2([0, 1]);
    const a1 = [ax[0] - o0[0], ax[1] - o0[1]], a2 = [ay[0] - o0[0], ay[1] - o0[1]], det = a1[0] * a2[1] - a1[1] * a2[0];
    const g = [((grip[0] - o0[0]) * a2[1] - (grip[1] - o0[1]) * a2[0]) / det, (a1[0] * (grip[1] - o0[1]) - a1[1] * (grip[0] - o0[0])) / det];
    const L = [-2.25, -3.75, .1, 'relax'];
    let tip = g.slice();
    for (let n = 0; n < 3; n++) { const G = bsGeo(B, { ...oM, pose: { L, R: [tip[0] - B.qx, tip[1], bend, 'fist', 1] } }), an = G.arms[1].ang; tip = [g[0] - Math.cos(an) * .5 * B.hand, g[1] - Math.sin(an) * .5 * B.hand]; }
    classStamp(grip[0], grip[1]);
    master(MX, t, { ...oM, pose: { L, R: [tip[0] - B.qx, tip[1], bend, 'fist', 1] } });
    // THUNK: impact lines off the stamp's block
    if (down) { const c = [grip[0], grip[1] + off]; for (const sd of [-1, 1]) for (let q = 0; q < 3; q++) { const a = (sd < 0 ? Math.PI : 0) + sd * (-.5 + q * .5); dline([[c[0] + Math.cos(a) * 32, c[1] - 8 + Math.sin(a) * 12], [c[0] + Math.cos(a) * 50, c[1] - 8 + Math.sin(a) * 22]], 2.4, NOIR.pastInk, 0); } }
  }
  // the whole cartoon frame at song time t (1920 × 1080, drawn in whatever transform the caller set up)
  function cartoon(t) {
    const D = V3D;
    look('ink');
    boilSeed('v3 cart base'); cP(box(-100, -100, W + 100, H + 100), pastCol.wall, { ink: null, key: 'v3cbase' });
    const cam = (c, f) => { push(); translate(W / 2, H / 2); scale(c[2]); translate(-c[0], -c[1]); f(); pop(); };
    if (t < D.A) gradeClose(t, 'half');
    else if (t < D.B) cam(camA(t), () => cartoonA(t));
    else if (t < D.C) cartoonB(t);   // (the briefing sets its own cameras: shot, reverse, shot)
    else if (t < D.D) cam(CAMC.C, () => cartoonC(t));
    else if (t < D.D0) cam(CAMC.A, () => cartoonD(t));
    else gradeClose(t, t < D.thunk ? 'answers' : 'half', seg(t, D.thunk - .3, D.thunk + .25));
    // scene changes: a 1930s iris out and in (the insert cuts straight in, on the stamp); out of the briefing the iris
    // closes on the satchel on page 3
    // (out of the briefing the iris closes on the satchel over .3 s, from just covering the frame: from 1600 px on an ease-in
    // it showed for two frames, then reopened in two)
    for (const tc of [D.A, D.B, D.C, D.D]) { const sat = tc === D.C, a = seg(t, tc - (sat ? .3 : .2), tc), b = seg(t, tc, tc + .2), [ix, iy, ir] = sat ? brfIris(t) : [960, 520, 1300]; if (a > 0 && a < 1) iris(ix, iy, lerp(ir, 0, sat ? ease(a) : easeIn(a)), NOIR.pastInk); if (b > 0 && b < 1) iris(960, 520, lerp(0, 1300, easeOut(b)), NOIR.pastInk); }
    filmOver(t);
    psVignette();
  }
  // the film leader: rings, a cross-hair, the sweeping wedge (one sweep a beat), no numbers
  function leader(t) {
    look('ink'); boilSeed('v3 leader');
    const f = frac(bpo(t)), g = '#8A8680', gd = '#4A4642';
    cP(box(-100, -100, W + 100, H + 100), '#B8B2A8', { ink: null, key: 'v3ldbg' });
    const P = [[960, 540]]; for (let i = 0; i <= 40; i++) { const a = -Math.PI / 2 + i / 40 * f * TAU; P.push([960 + Math.cos(a) * 700, 540 + Math.sin(a) * 700]); }
    if (f > .02) cP(P, g, { ink: null, key: 'v3ldw' });
    for (const r of [300, 380]) dline(oval(960, 540, r, r, 0, 60).concat([[960 + r, 540]]), 5, gd, 0);
    dline([[960, -100], [960, H + 100]], 4, gd, 0); dline([[-100, 540], [W + 100, 540]], 4, gd, 0);
    filmOver(t); psVignette();
  }
  // the room around the screen (card): a dark room drawn as boxes AROUND the screen (so the film stays inside it), the
  // pull-down screen's roller and edge, and her beside it with a pointer
  function screenRoom(t) {
    look('card'); boilSeed('v3 room');
    const { x, y, w, h } = SCR, e = 16;
    // (the dark room round the screen is the underlay laid first in SHOT.V3d's scene, and the film is clipped to the screen:
    // drawn as four cut boxes round it, their hand-cut edges met in light hairlines level with the screen's top and bottom)
    piece(box(-400, 900, W + 400, H + 400), '#2A2E3C', { ink: null, key: 'v3roomfl', lift: 0, flatCard: true, edge: false });
    for (const [i, B] of [box(x - e, y - e, x + w + e, y), box(x - e, y + h, x + w + e, y + h + e), box(x - e, y, x, y + h), box(x + w, y, x + w + e, y + h)].entries()) piece(B, '#D8D2C4', { ink: null, key: 'v3scre' + i, lift: 1, flatCard: true });
    piece(box(x - 40, y - 46, x + w + 40, y - 14), '#4A4E5A', { sw: 1.4, key: 'v3roller', lift: 4 });
    dline([[x + w / 2, y + h + e], [x + w / 2, y + h + 70]], 2, '#8A8478');   // the pull cord
    glow(x + w / 2, y + h / 2, 900, '#FFF2D0', .22);
  }
  function screenHer(t, o) { look('card'); person(360, 1040, 40, HER_C, { view: 'q', boilKey: 'v3herd', ...o }); }
  SHOT.V3d = (t, lt, dur) => {
    if (t < V3CD_CUT) { drawShot('V3c', t); return; }   // (the late cut: V3c runs on past the bar)
    const D = V3D, Zs = W / SCR.w, sc = [SCR.x + SCR.w / 2, SCR.y + SCR.h / 2];
    // the leader fills the frame; pull back: it's on a screen in a dark classroom, her with a pointer; push into it as
    // the cartoon starts; at the end, pull back out to her for the punchline
    // (Editing: the wide holds from the pull-back until the push, and the push lands inside the cartoon's first iris-out,
    // so push and iris are one move; the half-star insert plays on the screen from "OpenAI". Pushing in 0.1 s after the
    // pull-back, then the iris 0.35 s after the push, stacked three moves. At the end the pull-back out to her starts
    // once the stamp lifts, so she holds before V3e's cut.)
    // The pull-back starts inside the roll-in (one move: the frame line passes and we're already pulling back), where it
    // used to start 0.1 s after the roll had landed.
    const PUSH0 = D.A - .5, OUT0 = D.thunk + .25;
    const kIn = 1 - ease(seg(t, V3CD_CUT + .12, V3CD_CUT + .5)), kPush = ease(seg(t, PUSH0, D.A)), kOut = 1 - ease(seg(t, OUT0, OUT0 + .45));
    const k = t < PUSH0 ? kIn : t < OUT0 ? kPush : kOut;
    const film = () => { if (t < D.start) leader(t); else cartoon(t); };
    const scene = k => {   // the film on the screen in the dark room, the camera k of the way into the screen
      if (k > .999) { film(); return; }
      const z = Math.exp(lerp(Math.log(1.0), Math.log(Zs), k)), cx = lerp(900, sc[0], k), cy = lerp(560, sc[1], k);
      const tapK = seg(t, D.start - .7, D.start - .45) * (1 - seg(t, D.start - .45, D.start - .2));
      const herO = { ...emotions(mt(t), [[D.t0, 'hopeful', { lookX: .8, lookY: -.2 }], [D.out, 'smug', { lookX: -.3 }]]), emote: null, mouth: t > D.out ? 'smirk' : 'flat', sing: V3_TESS, pose: { L: [3.2 + .4 * tapK, -1.4 - .3 * tapK, .1, 'hold', 1, -.5], R: PPOSE.low.R }, holdL: s => { piece(ribbon([[0, 0], [s * 5.5, -s * 2.4]], s * .18, s * .1), '#C8A870', { sw: .9, key: 'v3ptr', lift: 2 }); } };
      camBegin(cx, cy, z);
      // (the dark room laid under everything first, the film clipped to the screen over it: the room was four cut boxes
      // round the screen, and where their hand-cut edges met, level with the screen's top and bottom, light dashes showed)
      look('card'); _paint(box(-400, -400, W + 400, H + 400), { wash: '#1E2230', ink: null });
      clipPoly(box(SCR.x, SCR.y, SCR.x + SCR.w, SCR.y + SCR.h), () => { push(); translate(SCR.x, SCR.y); scale(SCR.w / W); film(); pop(); });
      screenRoom(t);
      screenHer(t, herO);
      crowdClass(mt(t), SCR);   // the class, heads silhouetted against the screen (demo/cast/crowd.js)
      camEnd();
    };
    // in: the street's copy rolls up out of the gate like slipping film, a frame line, and the leader rolls in under it
    const roll = seg(t, V3CD_CUT, V3CD_CUT + .3);
    if (roll < 1) {
      const off = easeIn(roll) * (H + 46), top = H + 46 - off;
      push(); translate(0, -off); drawShot('V3c', V3CD_CUT - .001); pop();
      look('ink'); boilSeed('v3 frameline'); _paint(box(-60, H - off, W + 60, H - off + 46), { wash: NOIR.ink, ink: null });
      v3ClipRows(top, H + 60, () => { push(); translate(0, top); scene(kIn); pop(); });
      return;
    }
    scene(k);
  };

  // ---------------------------------------------------------------------------------------------------------------
  // V3e: his phone's health dashboard (charts and icons only); the Gemini twins hop in over the bezel and eagerly tidy
  // it (their task); he frowns; they wave, courteous; one raises a clapperboard: CLAP, and the copier's light bar sweeps
  // off the snap: behind it a film set (riso) where he's printed too, one more riso extra among the cardboard ones,
  // moved from mark to mark by an enthusiastic Grok, directing.
  // Media (the rule, styleaudit 2026-09-25: a figure takes the medium of the place it's in; a picture keeps its own
  // inside its frame; a crossing is shown): his room, his phone and the app on it are the present (card), and the twins
  // are card on both sides of the bezel, so nothing changes medium until the CLAP. The clap is the one crossing: the
  // light bar prints the take, him and the slate with it (as V2d's bar prints him into his street).
  // ---------------------------------------------------------------------------------------------------------------
  // (cut: V3d's pull-back out to her holds through "grade" and V3e cuts in just before "Now"; the twins hop in on
  // "health", a beat after the cut. Cutting on the bar, 0.1 s after the pull-back, was a double jump.)
  const V3E = { t0: BAR(114), cut: WT('Now my', 0) - .12, hop: WT('Now my', 2) - .15, tidy: WT('Now my', 4), guest: WT('Now my', 6) - .05, clap: WT('The rest', 0) - .02, marks: [WT('The rest', 4), WT('The rest', 6), WT('The rest', 8)], frame: WT('The rest', 9), end: BAR(118) };
  const DPH = { x: 560, y: 70, w: 800, h: 1180 };   // the phone, close (portrait, its bottom off frame)
  // the dashboard (card, phone-screen coords 800 × 1180): a header band with a heart, tiles of charts and icons
  function dashboard(t, tidy, key = 'v3db') {
    const { w } = DPH;
    piece(box(0, 0, w, 1180), '#EEF2F2', { ink: null, key: key + 'bg', lift: 0, flatCard: true });
    piece(box(0, 0, w, 150), '#2E8A7A', { ink: null, key: key + 'hd', lift: 0, flatCard: true });
    piece(heartPts(90, 80, 36), '#F2F0EA', { ink: null, key: key + 'hh', lift: 1, flatCard: true });
    for (let i = 0; i < 3; i++) dline([[170, 55 + i * 26], [lerp(420, 600, hash(i + 3)), 55 + i * 26]], 5, '#CFE8E2');
    // tiles: a bar chart, a line chart, a pill, a calendar, a footsteps icon, a sleep moon
    const tile = (x, y, ww, hh, k) => piece(box(x, y, x + ww, y + hh), '#FFFFFF', { sw: 1.2, key: key + 'tl' + k, lift: 2 });
    tile(40, 190, 720, 330, 0);
    const bars = [.4, .7, .5, .85, .6, .3, .75];
    bars.forEach((b, i) => { const lift = i === 5 ? ease(seg(tidy, .1, .5)) * .45 : 0, hh = (b + lift) * 230; piece(box(90 + i * 92, 490 - hh, 150 + i * 92, 490), i === 5 ? '#E0A526' : '#3E6FC8', { sw: 1, key: key + 'bar' + i, lift: 1 }); });
    tile(40, 550, 350, 250, 1);
    const L = []; for (let i = 0; i <= 8; i++) L.push([70 + i * 36, 740 - 110 * (.5 + .4 * Math.sin(i * 1.1 + 1))]); dline(L, 5, '#C8323A', .4);
    tile(410, 550, 350, 250, 2);
    piece(curvy([[480, 690], [560, 610], [610, 660], [530, 740]], 4), '#E0A526', { sw: 1.2, key: key + 'pill', lift: 2 });
    tile(40, 830, 220, 220, 3); tile(290, 830, 220, 220, 4); tile(540, 830, 220, 220, 5);
    piece(box(90, 890, 210, 1000), '#F2F0EA', { sw: 1.2, key: key + 'cal', lift: 1 }); piece(box(90, 890, 210, 920), '#C8323A', { ink: null, key: key + 'calh', lift: 1 });
    for (const [fx, fy] of [[360, 960], [420, 910]]) piece(oval(fx, fy, 22, 34, -.3, 16), '#6E7684', { ink: null, key: key + 'ft' + fx, lift: 1 });
    piece(crescentMoon(650, 940, 50), '#3E4A8A', { ink: null, key: key + 'moon', lift: 1 });
  }
  function crescentMoon(x, y, r) { const P = []; for (let i = 0; i <= 24; i++) { const a = -Math.PI / 2 + i / 24 * Math.PI; P.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } for (let i = 24; i >= 0; i--) { const a = -Math.PI / 2 + i / 24 * Math.PI; P.push([x + Math.cos(a) * r * .55 + r * .1, y + Math.sin(a) * r * .8]); } return P; }
  // the twins inside the screen: card, the medium of the app they're in (they hop in from his room over the bezel, card
  // on both sides, so there's no crossing to show). k: 0 on the bezel .. 1 in, working
  // (they land, and get to work straight away: busy hands on the chart on the eighths, one arm up as the other comes down,
  // while its short sixth bar rises under them; the glint as it tops out, then the wave. They used to stand in a cheer
  // for half a second, then hold one arm up while the bar crept: a second with nothing new)
  const v3eLift = tt => seg(tt, V3E.hop + .6, V3E.guest - .3);
  function twinsInPhone(t, k) {
    look('card');
    const E = V3E, tt = mt(t), work = tt > E.hop + .45, greet = tt > E.guest;
    const hopY = (1 - backOut(clamp(k))) * -520, x = lerp(330, 385, clamp(k)), e8 = Math.floor(bpo(tt) * 2) % 2;
    const busy = (ph) => ph ? [-2.7, -5.3, .2, 'open'] : [-2.1, -3.5, .25, 'open'];
    const pose = greet ? 'wave' : work ? { O: busy(e8), OB: busy(1 - e8), I: 'join' } : 'cheer';
    gemini(x, 520 + hopY, 44, { ...feel('happy', tt), emote: null, fixed: true, pose, view: greet ? 'front' : 'q', face: greet ? 'same' : 'in', gap: 4.6, boilKey: 'v3gemp', lookY: greet ? -.8 : .3, t: tt });
    // the tidied bar's glint: a little card star popping off its top as it tops out (the chart's sixth bar)
    if (work && !greet) {
      const k2 = seg(tt, E.guest - .42, E.guest), s = backOut(seg(k2, 0, .35)) * (1 - seg(k2, .6, 1));
      if (s > .02) { const bt = 490 - (.3 + .45 * ease(v3eLift(tt))) * 230; push(); translate(580 + 34, bt - 26); scale(s); piece(starPts(0, 0, 26, .25, 4), '#F4F0E6', { sw: 1, key: 'v3dbglint', lift: 3, flatCard: true }); pop(); }
    }
  }
  function phoneScene(t) {
    const E = V3E;
    look('card'); boilSeed('v3 dash');
    piece(box(-60, -60, W + 60, H + 60), '#2A3040', { ink: null, key: 'v3dsbg', lift: 0, flatCard: true });
    piece(box(-60, 200, 520, 900), '#3E4658', { ink: null, key: 'v3dsb1', lift: 0, flatCard: true });
    const { x, y, w, h } = DPH;
    piece(curvy(box(x - 30, y - 34, x + w + 30, y + h + 40), 3), '#1E1C24', { sw: 2.2, key: 'v3dsph', lift: 12 });
    const tidy = lerp(.1, .5, v3eLift(mt(t)));   // (dashboard: the bar's lift over tidy .1..5)
    push(); translate(x, y); dashboard(t, tidy); pop();
    const k = seg(mt(t), E.hop, E.hop + .45);   // (card puppets on twos)
    if (t > E.hop - .05) { push(); translate(x, y); twinsInPhone(t, k); pop(); }
    // his thumb scrolling at first, then lifting away as they arrive
    const C = HIM_C.col, away = ease(seg(t, E.hop - .1, E.hop + .3)), sc = Math.sin(t * 5) * 20 * (1 - away);
    limb([[x + w + 360, H + 200], [x + w + 180, 1000 + 200 * away], [x + w - 60 + 120 * away, 820 + sc + 300 * away]], 150, 120, C.coat, { sw: 2, shade: C.coatDk, key: 'v3dsarm' });
    hand(x + w - 70 + 120 * away, 810 + sc + 300 * away, -2.6, 110, { pose: 'point', col: C.skin, sw: 1.8, key: 'v3dshand', maxTone: .45, mirror: true });
  }
  // the reaction two-shot: his face over the phone (card), the twins waving up at him from the screen (card, like the
  // app they're in). o.slate: the big slate is at the lens (the CLAP), so the twin's small one isn't drawn
  // The reaction two-shot. The screen faces its user (the checklist, the user 2026-09-25: a phone in use faces whoever is
  // using it; we see its back): he holds the phone up to his right, its screen toward him (its glow on his face), its
  // back to us, his hand round it; the twins, the uninvited guests, hop up over its top edge to greet him in person (card,
  // like the app they came from and the room they come out into: no crossing to show), and one lifts a clapperboard.
  // o.slate: the big slate is at the lens (the CLAP), so the twin's small one isn't drawn. (It was the phone's screen
  // turned to us with the twins waving up from the app.)
  function reactScene(t, o = {}) {
    const E = V3E;
    look('card'); boilSeed('v3 react');
    piece(box(-60, -60, W + 60, H + 60), '#2A3040', { ink: null, key: 'v3rbg', lift: 0, flatCard: true });
    const tt = mt(t), clapUp = seg(tt, E.clap - .45, E.clap - .2);
    const mood = emotions(tt, [[E.guest - .3, 'suspicious', { lookX: .9, lookY: .5 }], [E.guest + .6, 'disgusted', { lookX: .9, lookY: .5 }]]);
    const P = RPH, Mc = b2Mat(), hop = backOut(seg(tt, E.guest - .2, E.guest + .1)), gy = P.y + 70 * (1 - hop);
    // the twins, behind the phone's top edge (they come up from its screen side), waving to him; then one lifts the slate
    gemini(P.x + P.w / 2 + 10, gy, 24, { ...feel('happy', tt), emote: null, fixed: true, view: 'q', flip: true, face: 'same', gap: 4.4, boilKey: 'v3gemr', lookX: .7, lookY: .35, t: tt, noShadow: true,
      pose: clapUp > 0 ? { O: [-2.5, -5.0, .2, 'hold', 0], OB: null, I: 'join' } : 'wave', holdL: clapUp > 0 && !o.slate ? (s => { b2Upright(Mc); clapper(0, -s * (1.8 + 1.2 * ease(clapUp)), s * 3.4, 0, 'v3claps'); }) : null });
    // the phone's back (a 3/4 turn toward him: its left edge, the camera module), and his hand round it
    boilSeed('v3 rphone');
    piece(b2RoundPoly(box(P.x, P.y, P.x + P.w, P.y + P.h), 34), '#1E1C24', { sw: 1.8, key: 'v3rpb', lift: 8 });
    piece(b2RoundPoly(box(P.x - 14, P.y + 10, P.x + 10, P.y + P.h - 10), 10), '#3A3844', { ink: null, key: 'v3rpe', lift: 7, flatCard: true });
    piece(b2RoundPoly(box(P.x + P.w - 150, P.y + 26, P.x + P.w - 30, P.y + 146), 26), '#2E2C36', { sw: 1.2, key: 'v3rpm', lift: 9 });
    for (const [lx, ly] of [[P.x + P.w - 118, P.y + 58], [P.x + P.w - 62, P.y + 114]]) piece(oval(lx, ly, 20, 20, 0, 16), '#0E0E12', { sw: 1, key: 'v3rpl' + lx, lift: 10, flatCard: true });
    piece(oval(P.x + P.w - 62, P.y + 58, 8, 8, 0, 10), '#E8E0C8', { ink: null, key: 'v3rpf', lift: 10, flatCard: true });
    glow(P.x - 180, 520, 380, '#BFEFE6', .14);   // (the screen's light on his face)
    person(600, 1230, 80, HIM_C, { ...mood, emote: null, view: 'q', pose: { L: PPOSE.low.L, R: RPH.hand }, legs: false, boilKey: 'v3himr', tilt: .06, sing: V3_ROWAN });
  }
  // the phone in the reaction shot, its back to us (world px), and his hand's target on it (his frame's units)
  const RPH = { x: 1090, y: 300, w: 320, h: 520, hand: [6.75, -6.4, .2, 'hold', 1, -.35, 'u'] };
  // a clapperboard (stripes, no writing): open 0..1 (the arm up)
  function clapper(x, y, s, open, key = 'v3clap') {
    push(); translate(x, y);
    piece(box(-s, -s * .1, s, s * 1.1), '#26262E', { sw: 1.6, key: key + 'b', lift: 4 });
    for (let i = 0; i < 3; i++) dline([[-s * .8, s * (.25 + i * .25)], [s * .8, s * (.25 + i * .25)]], 2, '#E8E4D8');
    push(); translate(-s, -s * .1); rotate(-open * .7);
    piece(box(0, -s * .3, s * 2, 0), '#26262E', { sw: 1.6, key: key + 'a', lift: 5 });
    for (let i = 0; i < 5; i++) piece([[s * (.1 + i * .38), -s * .3], [s * (.3 + i * .38), -s * .3], [s * (.15 + i * .38), 0], [s * (-.05 + i * .38), 0]], '#E8E4D8', { ink: null, key: key + 's' + i, lift: 0, flatCard: true });
    pop();
    for (let i = 0; i < 5; i++) piece([[-s * .9 + i * s * .38, -s * .1], [-s * .7 + i * s * .38, -s * .1], [-s * .85 + i * s * .38, s * .15], [-s * 1.05 + i * s * .38, s * .15]], '#E8E4D8', { ink: null, key: key + 't' + i, lift: 0, flatCard: true });
    pop();
  }
  // the film set (riso): a flat of a street front on struts, lamps on stands, a camera, marks on the floor, cardboard
  // extras; him (printed with the take on the CLAP: riso like everything on the set) placed from mark to mark; Grok in a
  // beret with a megaphone, directing with gusto
  const MARKS = [[640, 930], [1010, 960], [760, 900], [1060, 930]];
  // (Grok's beret: it sits on the sphere's crown, the round silhouette and both coin-slot eyes whole; the user kept it
  // over the no-hats rule: it doesn't hide his design)
  function filmSet(t) {
    const E = V3E, tt = mt(t);
    look('xerox');
    cpXeroxDraw(() => {
      boilSeed('v3 set');
      piece(box(-60, -60, W + 60, H + 60), '#3A3048', { ink: null, key: 'v3stbg' });
      // the flat: a painted street front (riso), with its struts showing at the edges
      piece(box(220, 120, 1520, 820), '#C87A5A', { sw: 1.4, key: 'v3flat' });
      for (let i = 0; i < 4; i++) { const wx = 300 + i * 310; piece(box(wx, 230, wx + 170, 440), '#2E3450', { sw: 1, key: 'v3fw' + i }); piece(box(wx + (i % 2 ? 40 : 0), 560, wx + 130 - (i % 2 ? 0 : 40) + 40, 820), i % 2 ? '#2F62C4' : '#3A8A5A', { sw: 1, key: 'v3fd' + i }); }
      for (const sx of [220, 1520]) dline([[sx, 300], [sx + (sx < 900 ? -140 : 140), 880]], 3, '#1A1A1A');
      piece(box(-60, 820, W + 60, H + 60), '#5A5064', { sw: 1, key: 'v3stfl' });
      // lamps on stands and a camera on a tripod
      for (const [lx, flip] of [[120, 1], [1700, -1]]) { dline([[lx, 900], [lx, 330]], 4, '#1A1A1A'); piece(box(lx - 60, 260, lx + 60, 360), '#2A2A30', { sw: 1.2, key: 'v3lamp' + lx }); v3Spot([[lx + flip * 60, 270], [lx + flip * 60, 350], [lx + flip * 700, 900], [lx + flip * 380, 1000]], 'y', .35); }
      // the floor marks (tape crosses) and two cardboard extras on sticks
      for (const [mx, my] of MARKS) { dline([[mx - 30, my - 12], [mx + 30, my + 12]], 5, '#FFD23A'); dline([[mx - 30, my + 12], [mx + 30, my - 12]], 5, '#FFD23A'); }
      for (const [ex, k] of [[420, 0], [1360, 1]]) { piece(curvy([[ex - 60, 900], [ex - 70, 620], [ex - 30, 560], [ex, 470], [ex + 30, 560], [ex + 70, 620], [ex + 60, 900]], 4), k ? '#8A9AB0' : '#B0A088', { sw: 1.2, key: 'v3ext' + ex }); piece(oval(ex, 430, 50, 56, 0, 20), k ? '#8A9AB0' : '#B0A088', { sw: 1.2, key: 'v3exh' + ex }); dline([[ex, 900], [ex, 990]], 4, '#1A1A1A'); }
      // the director: Grok in a beret, pointing him to the next mark with gusto (along the floor to it: it pointed at the sky);
      // arms up in delight at the end
      const mi = E.marks.findIndex(m => t < m), wrap = t > E.frame;
      const G = grok(1540, 1010, 36, { ...emotions(t, [[E.clap, 'excited'], [E.frame, 'happy']]), emote: null, flip: true, view: 'q', pose: wrap ? 'shrug' : { L: [-3.0, -3.0, .22, 'relax'], R: [5.2, -3.6 + .4 * Math.sin(t * 9), .12, 'point', 1] }, boilKey: 'v3dir', smoke: true });
      if (G && G.top) { const [bx, by] = G.top; piece(curvy([[bx - 70, by + 18], [bx - 50, by - 16], [bx + 10, by - 28], [bx + 70, by - 6], [bx + 60, by + 16]], 4), '#1E1C24', { sw: 1.2, key: 'v3beret' }); piece(ribbon([[bx + 4, by - 26], [bx + 10, by - 44]], 5, 3), '#1E1C24', { sw: 1, key: 'v3beretst' }); }
    });
    // him, printed with the take (one more riso extra), set down from mark to mark on the beats
    let seg0 = 0; while (seg0 < 3 && t >= E.marks[seg0]) seg0++;
    const from = MARKS[seg0], to = MARKS[Math.min(3, seg0 + 1)], tn = seg0 < 3 ? E.marks[seg0] : E.end, tp = seg0 ? E.marks[seg0 - 1] : E.clap;
    const k = seg0 < 3 ? ease(seg(t, tn - .28, tn)) : 0, lift = Math.sin(Math.PI * k);
    const px = lerp(from[0], to[0], k), py = lerp(from[1], to[1], k) - 120 * lift;
    look('xerox');
    cpXeroxDraw(() => {
      const fm = emotions(tt, [[E.clap, 'surprised'], [E.clap + .4, 'bored'], [E.marks[2] + .1, 'angry']]);
      person(px, py, 40, HIM_C, { ...fm, emote: null, view: 'front', pose: lift > .1 ? 'up' : 'hips', dy: 0, boilKey: 'v3himf' });
      // the unseen crew's hand (a long white glove from above) lifting him by the collar between marks: the fist on his coat's
      // ruff at the side of his neck, clear of his jaw (it was at 13.2 u, the crown of his beanie; the collar is at 8.6)
      if (lift > .02) { const gx = px + 2.6 * 40, gy = py - 8.55 * 40, hx = gx + 4, hy = gy - 26; limb([[hx + 320, -200], [hx + 170, hy - 280], [hx + 4, hy - 18]], 44, 36, '#E8E4D8', { sw: 1.4, key: 'v3crew' }); hand(hx, hy, 1.62, 50, { pose: 'fist', glove: true, key: 'v3crewh' }); }
    });
  }
  SHOT.V3e = risoShot((t, lt, dur) => {
    const E = V3E;
    if (t < E.cut) { drawShot('V3d', t); return; }
    if (t < E.guest - .15) phoneScene(t);
    else if (t < E.clap) reactScene(t);
    else {
      // CLAP: the twin's slate comes up to the lens and snaps shut; the snap starts the copier's light bar, right to left
      // (V2d's way): behind it the take is printed, the riso film set with him on his first mark and the slate printed too;
      // ahead of it his room (card) still, the phone on the right going first and him on the left last. The slate holds,
      // then is lifted away (held ~0.35 s, then out over ~0.27 s: whipped out 0.12 s after the clap, its exit was a
      // second jump on top of the cut)
      const cl = t - E.clap, bar = seg(cl, .05, .40), X = lerp(W + 160, -160, bar);
      const slate = () => clapper(960, 400 - 1000 * ease(seg(cl, .35, .62)), 520, 1 - seg(cl, 0, .05));
      filmSet(t);
      if (cl < .62) { look('xerox'); cpXeroxDraw(slate); }
      look('xerox'); xeroxGrit(t, .5);
      if (X > -40) {
        clipPoly(box(-10, -10, X, H + 10), () => { reactScene(t, { slate: true }); look('card'); slate(); }, { screen: true });   // (a stencil: card's lifted pieces ignore a GL scissor)
        look('xerox'); v3eBar(X);
      }
    }
  });
  // the copier's light bar at X travelling right to left (V2d's): the fresh copy overexposed just behind it (to its right)
  function v3eBar(X) {
    const R = (x0, x1) => [[x0, -80], [x1, -80], [x1, H + 80], [x0, H + 80]];
    boilSeed('v3e bar');
    for (let i = 0; i < 6; i++) { const xa = X + 46 * i, xb = X + 46 * (i + 1); if (xa < W + 80) _paint(R(xa, xb), { wash: XEROX.paper, washOp: 200 * (1 - i / 6), ink: null }); }
    for (let y = -40; y < H + 80; y += 110) _glow(X - 10, y, 190, '#9CFFD2', .85);
    _paint(R(X - 16, X + 10), { wash: '#F8FFFA', ink: null });
    _paint(R(X + 10, X + 14), { wash: '#B9C4BE', ink: null });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // V3f: cables grow across the film set; pull back out of the ground: a street in cutaway (riso). Clawd plants its feet
  // and grows into a synthetic tree: circuit-trace roots through the soil to every building, cable branches to the lamp,
  // the lights, the bus stop, the surgery, the school bell, and one small connector into a door's lock (it clicks open).
  // His building, cut open like a doll's house: his box room (riso, printed with the building), bed on end. The tree's
  // crown bursts (riso); push into his room: the bed drops, he sits; the copier's light bar brings the room out as card;
  // one crumb drifts down into his palm. Clean end (the box room, card) for D1.
  // ---------------------------------------------------------------------------------------------------------------
  const V3F = { t0: BAR(118), roots: WT('Your bot can', 0) - .2, rootW: WT('Your bot can', 4), grow: WT('Your bot can', 2) - .1, I: WT('Your bot can', 5), room: WT('Your bot can', 9), there: WT('There', 0), boom: BAR(121), end: BAR(122) };
  // His rant (the user, 2026-09-26: "There's my cut of the productivity boom" is practically shouted, with anger and
  // passion). He rounds on the tree (glare) and jabs at it on "There's", "my", "cut" (jabs); knocked down onto the bed as
  // it drops, he keeps pointing, then holds his other hand out for his cut (out); the crumb falls (fall) into it (land); he
  // glares at it and thrusts it up at us on "-tivity" (thrust: the drawing half way up). D1 carries the thrust on (bridge.js
  // d1Rant: the same drawings), through the held breath to the slam on "boom".
  Object.assign(V3F, { glare: V3F.there - .25, jabs: [0, 1, 2].map(i => WT('There', i)), out: V3F.boom + .85, fall: V3F.boom + .88, land: V3F.boom + 1.24, thrust: Math.floor((V3F.end - .17) * 12 + 1e-6) / 12 });
  const CITY = { ground: 700, clawd: [560, 700, 30], crown: [560, 250], bld: { x0: 1290, x1: 1920, top: 60 }, box: { x: 1330, y: 200, w: 560, h: 315 } };
  // a circuit trace from a to b: runs with 45° corners (a deterministic route through a middle height)
  function trace(a, b, bend = .5) {
    const [x0, y0] = a, [x1, y1] = b, my = lerp(y0, y1, bend), d = Math.min(Math.abs(x1 - x0), Math.abs(y1 - my), Math.abs(my - y0)) * .5, sx = Math.sign(x1 - x0) || 1, sy = Math.sign(y1 - y0) || 1;
    return [[x0, y0], [x0, my - sy * d], [x0 + sx * d, my], [x1 - sx * d, my], [x1, my + sy * d], [x1, y1]];
  }
  function partial(P, k) {
    if (k >= 1) return P; if (k <= 0) return [P[0], P[0]];
    const L = []; let tot = 0; for (let i = 1; i < P.length; i++) { const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); L.push(d); tot += d; }
    let rem = tot * k; const out = [P[0]];
    for (let i = 1; i < P.length; i++) { if (rem >= L[i - 1]) { out.push(P[i]); rem -= L[i - 1]; } else { out.push(lerpP(P[i - 1], P[i], rem / L[i - 1])); break; } }
    return out;
  }
  const along = (P, k) => { const Q = partial(P, k); return Q[Q.length - 1]; };
  // what the branches plug into (the city's services), each lighting up when its cable arrives: [x, y, kind]
  const SERV = [[150, 330, 'cross'], [300, 520, 'bus'], [470, 300, 'bell'], [860, 610, 'door'], [990, 330, 'lamp'], [1250, 440, 'lights']];
  // the tree's parts: roots (circuit traces in the soil), the trunk (braided cables), boughs (to the services), twigs
  function treeParts() {
    const F = V3F, [cx] = CITY.clawd, G = CITY.ground, [kx, ky] = CITY.crown, out = [];
    // (the roots come out of Clawd's feet: each leg's centre (clawd2's front legs, B2CLV), from just under its sole, which
    // covers the root's end; they started 18 px down in the kerb, a gap under the feet)
    const cu = CITY.clawd[2], feet = B2CLV.front.legs.map(([lx]) => cx + (lx + .5) * cu);
    const sockets = [[110, G + 80], [320, G + 150], [880, G + 90], [1180, G + 170], [230, G + 300], [1000, G + 320], [1560, G + 120]];
    sockets.forEach((sk, i) => out.push({ P: trace([feet[i % 4], G + 2], sk, .3 + .18 * (i % 3)), a: F.roots + .05 * i, b: F.rootW + .1 * i, w: 9, kind: 'root' }));
    const top = G - 8 * 30;
    [[-50, -30], [0, 0], [50, 30]].forEach(([dx, sw], i) => out.push({ P: [[cx + dx, top + 20], [cx + dx * .6 + sw, lerp(top, ky, .4)], [cx + dx * .3 - sw * .6, lerp(top, ky, .75)], [kx + dx * .2, ky]], a: F.grow - .05 + .05 * i, b: F.grow + .55 + .05 * i, w: 18 - 3 * i, kind: 'trunk', curvy: true }));
    SERV.forEach(([x, y, kind], i) => {
      const mid = [lerp(kx, x, .5), Math.min(ky, y) - 40 - 30 * (i % 2)];
      out.push({ P: through([[kx, ky], mid, [x, y - (kind === 'door' ? 0 : 26)]], 8), a: F.grow + .35 + .09 * i, b: F.grow + .85 + .09 * i, w: 12, kind });
    });
    return out;
  }
  // the crown's leaves: little chips and LEDs along the upper boughs (they pop in as the boughs pass them)
  function crownLeaves(t, parts) {
    const boughs = parts.filter(p => SERV.some(s => s[2] === p.kind));
    boughs.forEach((p, bi) => {
      const k = seg(t, p.a, p.b);
      for (let j = 1; j < 9; j++) {
        const f = j / 9 * .6; if (k < f) continue;
        const q = along(p.P, f), pop = backOut(seg(k, f, f + .08)), side = j % 2 ? -1 : 1, sz = 19 * pop;
        const x = q[0] + side * 22, y = q[1] - 18 - 8 * (j % 3);
        piece(box(x - sz, y - sz * .7, x + sz, y + sz * .7), '#5CC8A0', { sw: .9, key: 'v3leaf' + bi + j });
        if (pop > .5) v3Spot(oval(x, y, 4, 4, 0, 8), (bi + j) % 2 ? 'y' : 'm', .9);
      }
    });
  }
  // the street in cutaway (riso)
  function cityBack(t, parts) {
    const G = CITY.ground, lit = kind => { const p = parts.find(q => q.kind === kind); return p ? seg(t, p.b, p.b + .12) : 0; };
    boilSeed('v3 city');
    piece(box(-400, -400, W + 400, G), '#26304E', { ink: null, key: 'v3csky' });
    for (let i = 0; i < 30; i++) { const x = hash(i * 3.1) * W, y = hash(i * 7.7) * 380; v3Spot(oval(x, y, 3, 3, 0, 6), 'y', .9); }
    piece(box(-400, G + 30, W + 400, H + 400), '#6E4A4E', { sw: 1.2, key: 'v3soil' });
    for (let i = 0; i < 8; i++) dline([[-400, G + 90 + i * 55 + 10 * Math.sin(i)], [W + 400, G + 80 + i * 55]], .6, '#402A2E');
    const B = [[20, 290, 290, '#B87A6A'], [330, 200, 620, '#C8A060'], [760, 440, 960, '#8A7A9A'], [1030, 380, 1230, '#A0826A']];
    for (const [x0, top, x1, col] of B) {
      piece(box(x0, top, x1, G), col, { sw: 1.3, key: 'v3cb' + x0 });
      for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) { const wx = x0 + 34 + c * (x1 - x0 - 128), wy = top + 50 + r * 90; if (wy + 60 < G - 110) piece(box(wx, wy, wx + 60, wy + 60), '#20263E', { sw: 1, key: 'v3cw' + x0 + r + c }); }
    }
    // the surgery's cross, the school bell, the door (the connector plugs into its lock), the stop, the lamp, the lights
    const cr = lit('cross'); piece(box(130, 300, 170, 380), '#F2F0EA', { sw: 1, key: 'v3crv' }); piece(box(110, 320, 190, 360), '#F2F0EA', { sw: 1, key: 'v3crh' }); if (cr) { v3Spot(box(130, 300, 170, 380), 'm', .8); v3Spot(box(110, 320, 190, 360), 'm', .8); }
    const bl = lit('bell'); piece([[430, 200], [470, 150], [510, 200]], '#7A5A40', { sw: 1.2, key: 'v3belfry' }); push(); translate(470, 250); rotate(bl ? .35 * Math.sin(t * 14) : 0); piece(curvy([[-20, -10], [20, -10], [26, 34], [-26, 34]], 3), '#E0A526', { sw: 1, key: 'v3bell' }); pop();
    piece(box(820, 580, 900, G), '#2F62C4', { sw: 1.2, key: 'v3cdoor' });
    piece(box(-400, G, W + 400, G + 30), '#8A8C98', { sw: 1.2, key: 'v3kerb' });
    dline([[300, G], [300, 520]], 5, '#1A1A1A'); piece(oval(300, 500, 32, 32, 0, 20), '#C8323A', { sw: 1.2, key: 'v3bstop' }); if (lit('bus')) v3Spot(oval(300, 500, 40, 40, 0, 20), 'y', .6);
    dline([[990, G], [990, 330]], 6, '#1A1A1A'); piece(box(968, 300, 1012, 340), lit('lamp') ? '#FFE49A' : '#6A6A70', { sw: 1.2, key: 'v3lamp2' }); if (lit('lamp')) v3Spot([[968, 340], [1012, 340], [1100, G], [880, G]], 'y', .35);
    dline([[1255, G], [1255, 440]], 6, '#1A1A1A'); piece(box(1237, 380, 1273, 460), '#26262E', { sw: 1.2, key: 'v3tl' }); if (lit('lights')) v3Spot(oval(1255, 394 + (Math.floor(t * 3) % 3) * 26, 10, 10, 0, 12), ['m', 'y', 'c'][Math.floor(t * 3) % 3], .95);
  }
  // His building, cut open like a doll's house (the user, 2026-09-25: the card room in a black frame read as a TV or a
  // billboard floating over the street). A block of flats in the street's riso: brick, floors above and a ground floor
  // below, their windows lit or dark. Its front wall is broken open around his box room: a stepped edge along the brick
  // courses, the wall's depth showing all round the hole (toward the room's vanishing point), the ceiling slab over the
  // room and the floor slab under it, and through the break the flats either side of his: upstairs' floor (a table's
  // legs, a rug) and downstairs' ceiling (a lamp on its flex). His room is part of the building, so it's printed with
  // it: riso (boxRoomScene o.riso); it comes out as card only at the end, under the copier's light bar (SHOT.V3f).
  // (the room's open front, where its walls, floor and ceiling are cut, is PR_BOX's front at depth K in the room's own
  // picture: RO below, in world px; the picture's margins round it are the neighbours' flats, not the room's dark void)
  const CUTW = { x0: 1306, x1: 1914, y0: 112, y1: 578 };
  const cutRO = () => { const bx = CITY.box, k = bx.w / W, K = PR_BOX.K, fx = x => bx.x + prbX(x, K) * k, fy = h => bx.y + prbY(h, K) * k; return [fx(PR_BOX.x0), fy(PR_BOX.floor - PR_BOX.top), fx(PR_BOX.x1), fy(0)]; };
  const cutVP = () => { const bx = CITY.box, k = bx.w / W; return [bx.x + PR_BOX.vx * k, bx.y + PR_BOX.vy * k]; };
  // the break's edge: stepped along the brick courses (bricks 30 px, courses 12), irregularly, with chipped corners
  function cutEdge() {
    const { x0, x1, y0, y1 } = CUTW, P = [], BW = 30, CH = 12, d = (i, k) => Math.floor(Math.pow(hash(i * 1.37 + k), 1.6) * 4);
    for (let x = x0, i = 0; x < x1; x += BW * (hash(i * 3.3) < .3 ? .5 : 1), i++) { const y = y0 - CH * d(i, .2), xe = Math.min(x1, x + BW * (hash(i * 3.3) < .3 ? .5 : 1)); P.push([x + 2 * hash(i), y], [xe - 3 * hash(i + 9), y]); }
    for (let y = y0, i = 0; y < y1; y += CH, i++) { const x = x1 + 15 * d(i, .7) * .6; P.push([x, y + 1], [x - 2 * hash(i + 4), Math.min(y1, y + CH)]); }
    for (let x = x1, i = 0; x > x0; x -= BW, i++) { const y = y1 + CH * d(i, .4) * .7; P.push([x - 2 * hash(i + 2), y], [Math.max(x0, x - BW), y]); }
    for (let y = y1, i = 0; y > y0; y -= CH, i++) { const x = x0 - 6 * d(i, .1) * .5; P.push([x, y], [x + 2 * hash(i + 6), Math.max(y0, y - CH)]); }
    return P;
  }
  function hisBuilding(t, inner) {
    const { x0, top } = CITY.bld, x1 = 2400, G = CITY.ground, C = CUTW, J = cutEdge(), VP = cutVP(), RO = cutRO(), sl = 24, pw = 22;
    const Jin = J.map(([x, y]) => [VP[0] + (x - VP[0]) * .93, VP[1] + (y - VP[1]) * .93]);
    const [rx0, ry0, rx1, ry1] = RO, ceil = [ry0 - sl, ry0], flr = [ry1, ry1 + sl + 2];
    look('xerox');
    cpXeroxDraw(() => {
      boilSeed('v3 hisbld');
      // the block: brick, its courses, a string course at each floor, the windows of the flats above and below his
      piece(box(x0, top - 600, x1, G), '#A8665A', { sw: 1.4, key: 'v3hbld' });
      for (let y = G - 24; y > top - 600; y -= 24) if (vis(x0, y - 2, x1, y + 2)) dline([[x0, y], [x1, y]], .5, '#6A3A3E');
      for (const y of [-214, 70]) piece(box(x0 - 6, y, x1, y + 12), '#D8CCBC', { sw: .9, key: 'v3hbsc' + y });
      [[-330, [0, 1, 0]], [-40, [1, 0, 1]]].forEach(([wy, on]) => [1370, 1560, 1750].forEach((wx, j) => {
        piece(box(wx, wy, wx + 90, wy + 100), on[j] ? HSC.lit : HSC.glass, { sw: 1, key: 'v3hbw' + wy + j });
        dline([[wx, wy + 50], [wx + 90, wy + 50]], .9, '#1A1A2A'); dline([[wx + 45, wy], [wx + 45, wy + 100]], .8, '#1A1A2A');
        piece(box(wx - 6, wy + 100, wx + 96, wy + 108), HSC.stone, { sw: .8, key: 'v3hbws' + wy + j });
      }));
      piece(box(x0 + 22, 618, x0 + 84, G), '#3A8A5A', { sw: 1.2, key: 'v3hbdoor' });   // the ground floor: the flats' door, two windows
      for (const [wx, on] of [[1480, 1], [1690, 0]]) piece(box(wx, 622, wx + 120, 680), on ? HSC.lit : HSC.glass, { sw: 1, key: 'v3hbgw' + wx });
      // the break: the wall's depth all round the hole, the broken brick in section (its courses; the plaster skin inside)
      piece(J, '#8E4A42', { sw: 1.2, key: 'v3hbcutw' });
      for (let y = C.y0 - 48; y < C.y1 + 48; y += 12) dline([[C.x0 - 30, y], [C.x1 + 40, y]], .5, '#5E2E30');
      for (let i = 0; i < 26; i++) { const x = lerp(C.x0 - 20, C.x1 + 30, hash(i * 4.7)), y = lerp(C.y0 - 40, C.y1 + 40, hash(i * 2.3)); dline([[x, y], [x, y + 12]], .5, '#5E2E30'); }
    });
    // inside the wall's inner edge: the flats round his, the slabs and party walls cut through, his room
    clipPoly(Jin, () => {
      look('xerox');
      cpXeroxDraw(() => {
        boilSeed('v3 hbin');
        piece(box(C.x0 - 60, C.y0 - 80, C.x1 + 60, C.y1 + 80), '#4A4870', { ink: null, key: 'v3hbnb' });                     // the neighbours' flats, dim
        piece(box(C.x0 - 60, ceil[0] - 10, C.x1 + 60, ceil[0]), '#8A5A4A', { ink: null, key: 'v3hbuprug' });                // upstairs: their rug,
        for (const [lx, w] of [[1440, 6], [1520, 6], [1690, 8], [1760, 8]]) piece(box(lx, ceil[0] - 40, lx + w, ceil[0] - 1), '#221C30', { ink: null, key: 'v3hbleg' + lx });   // a table's and a chair's legs
        piece(box(1446, ceil[0] - 48, 1534, ceil[0] - 38), '#221C30', { ink: null, key: 'v3hbtop' });
        // beside his room: the next flats (left, a lamp on; right, a window's light on the wall)
        piece(box(C.x0 - 60, ceil[1], rx0 - pw, flr[0]), '#5A5E8A', { ink: null, key: 'v3hbnl' });
        dline([[1348, ceil[1]], [1348, ceil[1] + 30]], 1, '#2A2628'); piece([[1334, ceil[1] + 30], [1362, ceil[1] + 30], [1370, ceil[1] + 44], [1326, ceil[1] + 44]], HSC.lit, { sw: .8, key: 'v3hbnlamp' });
        v3Spot([[1326, ceil[1] + 44], [1370, ceil[1] + 44], [rx0 - pw, flr[0]], [C.x0 - 60, flr[0]]], 'y', .3);
        piece(box(rx1 + pw, ceil[1], C.x1 + 60, flr[0]), '#3E3E66', { ink: null, key: 'v3hbnr' });
        piece(box(rx1 + pw + 14, ceil[1] + 40, rx1 + pw + 60, ceil[1] + 150), '#7A8AC8', { ink: null, key: 'v3hbnrw' });
        // downstairs: their ceiling, a lamp on its flex
        piece(box(C.x0 - 60, flr[1], C.x1 + 60, C.y1 + 80), '#E6DCC4', { ink: null, key: 'v3hbdn' });
        dline([[1560, flr[1]], [1560, flr[1] + 18]], 1.2, '#2A2628');
        piece([[1542, flr[1] + 18], [1578, flr[1] + 18], [1590, flr[1] + 32], [1530, flr[1] + 32]], HSC.lit, { sw: .9, key: 'v3hblamp' });
        v3Spot([[1530, flr[1] + 32], [1590, flr[1] + 32], [1660, C.y1 + 80], [1460, C.y1 + 80]], 'y', .35);
        // the slabs' and party walls' cut faces (concrete), rebar poking out at the break
        for (const [a, b] of [ceil, flr]) {
          piece(box(C.x0 - 60, a, C.x1 + 60, b), '#B8B4AC', { sw: 1.1, key: 'v3hbslab' + a });
          dline([[C.x0 - 60, b - 3], [C.x1 + 60, b - 3]], .7, '#7A7670');
          for (const x of [C.x0 + 6, C.x1 - 6]) for (const dy of [.35, .65]) dline([[x, lerp(a, b, dy)], [x + (x < 1600 ? -10 : 10), lerp(a, b, dy) - 5]], 1, '#5A4A40');
        }
        for (const [a, b] of [[rx0 - pw, rx0], [rx1, rx1 + pw]]) piece(box(a, ceil[1], b, flr[0]), '#C8B8A8', { sw: 1, key: 'v3hbpw' + a });
      });
      look('card');
      if (inner) clipPoly(box(rx0, ry0, rx1, ry1), inner);
    });
    look('xerox');
    cpXeroxDraw(() => {
      boilSeed('v3 hbedge');
      dline(J.concat([J[0]]), .9, '#3A2A36'); dline(Jin.concat([Jin[0]]), .8, '#E8DCCC');   // (its broken edge; the plaster skin)
      for (const [x, y, r] of [[1330, G - 8, 0], [1364, G - 5, .5], [1872, G - 7, -.3]]) { push(); translate(x, y); rotate(r); piece(box(-14, -6, 14, 6), '#A8665A', { sw: .9, key: 'v3hbdeb' + x }); pop(); }   // (bits of brick on the pavement)
    });
  }
  // the box room (card at full frame; riso printed in the cutaway): his hand, held out flat, palm up, for his cut (the
  // rig's 'tray': seen edge on, so the crumb shows on top of it: on a spread hand it read as his thumb)
  const V3F_HAND = [3.9, -5.5, .12, 'tray', 1, -.1, 'u'];
  // where the crumb sits on his palm (its centre), for his rig options o as drawn at tt (seated on the bed), and its turn:
  // placed as person() places his hand (bridge.js d1Palm, the same sum): his ground point, dy, the lean and the idle weight
  // shift (and outside card the squash), the 'u' wrist target, the hand .08u past it along the wrist angle, then the spot
  // on the palm: on a flat hand ('tray') on top of it, two thirds along; on an open one, in it by the fingers
  function v3fPalm(o, tt) {
    const [x0, y0, u] = BOXROOM.bed, R = o.pose.R, a = R[5], s = HIM_C.body.hand * u, tray = R[3] === 'tray';
    const rot = (o.rot || 0) + lifeOf(o, 'hCv3himbox|0', tt, u * drawScale()).lean * .4, sq = STYLE.card ? 0 : (o.sq || 0) * .5;
    const al = .08 * u + (tray ? .95 : .55) * s, up = tray ? .19 * s + 7 : .45 * s;   // (the crumb's centre is 7 px over its base)
    const lx = (R[0] * u + Math.cos(a) * al + Math.sin(a) * up) * (1 + sq * .5), ly = (R[1] * u + Math.sin(a) * al - Math.cos(a) * up) * (1 - sq);
    return { p: [x0 + lx * Math.cos(rot) - ly * Math.sin(rot), y0 + (o.dy || 0) * 1.1 * u + lx * Math.sin(rot) + ly * Math.cos(rot)], a: a + rot + (tray ? 0 : .22) };
  }
  // His rant, drawing by drawing (on twos: the riso's mt() runs on ones). Big, clear shapes: he's small in the cutaway.
  // At the window (the bed on end) he rounds on the tree on "There's", his near arm up and out, pointing at it past the
  // cut, his other fist on his hip, and jabs again on "my" and "cut" (a drawing cocked back, then out), leaning into it.
  // The burst knocks him down onto the bed as it drops (the sit); he keeps pointing at the tree, then, on "the", the
  // pointing hand comes down to a fist on his knee and the other goes out, flat, palm up, for his cut. The crumb falls:
  // his eyes go up to it and follow it down into his palm; a glare at it; then (card now: the light bar has crossed) he
  // thrusts it up at us, beside his face, and it shakes with rage. D1 (bridge.js d1Rant) carries on from the same drawings.
  const v3fTw = t => Math.floor(t * 12 + 1e-6) / 12;
  // the rage in a held arm: the hand shaking, in a new place each drawing (bridge.js d1Rage: the same)
  const v3fRage = (ts, a) => { const n = Math.round(ts * 12); return [(hash(n * 1.37) - .5) * 2 * a, (hash(n * 2.91 + 5) - .5) * 2 * a]; };
  const V3F_THRUST = [4.6, -8.7, .2, 'tray', 1, -.12, 'u'];   // (the crumb shoved up at us, beside his face: D1's thrust)
  // the camera's punch in on the thrust, toward the crumb (on ones; bridge.js d1Punch carries it on: the same curve)
  const V3F_PUNCH = [930, 430], v3fPunch = t => .07 * easeOut(seg(t, V3F.thrust, V3F.thrust + .25)) + .03 * ease(seg(t, V3F.thrust + .25, V3F.end + .45));
  const V3F_KNEEF = [-.64, .96, .4, 'fist', 1, 1.55];         // (a fist on his knee: D1's kF)
  const v3fMix = (a, b, k) => (b.length > a.length ? b : a).map((_, j) => typeof a[j] === 'number' && typeof b[j] === 'number' ? lerp(a[j], b[j], k) : (k < .5 ? a[j] : b[j]));
  // his pointing arm: cocked back (ext 0) .. jabbed out at the tree (1), a little up, toward the crown
  const v3fPoint = ext => [lerp(-1.75, -4.6, ext), lerp(.3, -.2, ext), .05, 'point', 1];
  // the mouth in the riso (no lip-sync there: acting mouths): a shout on each word (and on each syllable of
  // "productivity" before the light bar), clenched teeth between; in card (the light bar's side), the lip-sync, shouted
  const V3F_FLAPS = [...(LY('There') ? LY('There').words.slice(0, 5) : []), [216.28, 216.4], [216.44, 216.56], [216.72, 216.84]];
  function v3fMouth(ts, card, base) {
    if (card) { const s = typeof lipAt === 'function' ? lipAt(ts, V3_ROWAN) : null; return !s || s === 'rest' ? 'teeth' : 'lip:' + (s === 'a' ? 'aa' : s === 'u' ? 'o' : s); }
    if (ts < V3F.glare) return base;
    for (const [a, b] of V3F_FLAPS) if (ts >= v3fTw(a) - 1e-6 && ts < a + Math.min(.22, (b - a) * .6 + .05)) return 'O';
    return 'teeth';
  }
  function v3fRant(t, sit) {
    const F = V3F, ts = v3fTw(t), J = F.jabs.map(v3fTw), n = s => Math.round((ts - s) * 12);   // (n: drawings after s)
    const mood = emotions(ts, [[F.I - .1, 'sad', { lookY: .3 }], [F.glare, 'angry']], { take: .5 });
    // where he looks: at the tree (off to the left), then up at the crumb and down with it into his palm, then at us
    let look = [mood.lookX || 0, mood.lookY || 0];
    if (ts >= F.glare) look = [-1, -.15];
    if (ts >= F.fall + .06) { const k = seg(ts, F.fall + .06, F.land); look = [lerp(.25, .55, k), lerp(-.95, .6, easeIn(k))]; }
    if (ts >= F.thrust) look = [0, 0];
    let L, R, rot = 0, sq = 0, tilt = 0;
    if (!sit) {
      const up = seg(ts, F.glare, J[0]);   // (the arm up from his side: three drawings, the last cocked, then out on "There's")
      let ext = ts >= J[0] ? 1 : 0; for (const j of J.slice(1)) if (n(j) === -1) ext = .4;
      L = up < 1 ? v3fMix(PPOSE.low.L, v3fPoint(0), up) : v3fPoint(ext);
      R = v3fMix(PPOSE.low.R, [.92, .78, .9, 'fist'], up);
      rot = -.035 * ext * up;
    } else {
      // (the pointing arm held out, trembling, his other fist on his thigh; then the pointing hand comes down to a fist on
      // his knee as the other goes out, flat, palm up, for his cut)
      const r = v3fRage(ts, .12), out = seg(ts, F.out - .09, F.out + .09);
      L = v3fMix([-4.6, -.2 + r[1], .05, 'point', 1], V3F_KNEEF, out);
      R = v3fMix([2.9, -4.3, .9, 'fist', 1, 1.2, 'u'], V3F_HAND, out);
      rot = -.02 * (1 - out);
      // the thrust: a drawing dipping (anticipation), one half way up, then up beside his face, shaking
      const d = n(F.thrust);
      if (d >= -1) {
        const dip = [3.9, -5.0, .12, 'tray', 1, -.02, 'u'], mid = [4.3, -7.2, .16, 'tray', 1, -.1, 'u'], g = v3fRage(ts, .2);
        R = d === -1 ? dip : d === 0 ? mid : d === 1 ? V3F_THRUST : [V3F_THRUST[0] + g[0], V3F_THRUST[1] + g[1], ...V3F_THRUST.slice(2)];
        rot = d === -1 ? -.01 : .02; sq = d === -1 ? .06 : d === 0 ? -.08 : -.15; tilt = d >= 2 ? (hash(Math.round(ts * 12) * 4.1) - .5) * .05 : 0;
      }
    }
    return { mood, pose: { L, R }, him: { lookX: look[0], lookY: look[1], rot, sq: (mood.sq || 0) + sq, tilt, sing: false } };
  }
  // o.riso: printed with the building (the cutaway), else card (the room after the
  // light bar, D1's match)
  function boxRoomScene(t, o = {}) {
    look(o.riso ? 'xerox' : 'card');
    const tt = mt(t);
    if (o.riso) { cpXeroxDraw(() => boxRoomBody(t, tt, o)); return; }
    boxRoomBody(t, tt, o);
  }
  function boxRoomBody(t, tt, o) {
    const ro = { squeeze: 0, bedUp: o.bedUp || 0, bulb: 1, swing: 5 * Math.sin(t * 1.3) + (o.jolt || 0) * 40 * Math.sin(t * 20) };
    boxroomBack(t, tt, ro);
    // (o.rant: his rant, from just before he rounds on the tree: v3fRant)
    const rant = o.rant, md = rant ? rant.mood : o.mood || feel(o.sit ? 'bored' : 'sad', tt), mouth = rant ? v3fMouth(v3fTw(t), STYLE.card, md.mouth) : md.mouth;
    let ho = null;
    if (o.sit || o.fall) {
      // (o.fall: one drawing between standing at the window and sitting on the bed, knocked down onto it as it lands: half
      // way over, the hips still high; it popped from one to the other)
      const [x1, y1, u1, sh] = BOXROOM.bed, [x0, y0, u0] = BOXROOM.window, f = o.fall ? .55 : 1;
      ho = { ...md, mouth, emote: null, seated: true, seatH: o.fall ? sh + 1.4 : sh, view: 'front', pose: rant ? rant.pose : 'lap', boilKey: 'v3himbox', sing: V3_ROWAN, ...(rant ? rant.him : {}) };
      person(lerp(x0 + 40, x1, f), lerp(y0, y1, f), lerp(u0, u1, f), HIM_C, ho);
      if (o.fall) ho = null;
    } else {
      const [x, y, u] = BOXROOM.window;
      person(x + 40, y, u, HIM_C, { ...md, mouth, emote: null, view: 'front', pose: rant ? rant.pose : 'low', boilKey: 'v3himbox', sing: V3_ROWAN, ...(rant ? rant.him : {}) });
    }
    boxroomFront(t, tt, ro);
    // the crumb: it drifts down into his open palm, then rides it (turning with his hand, as D1's does)
    if (ho && o.crumb != null && o.crumb >= 0) {
      const k = clamp(o.crumb), h = v3fPalm(ho, tt), sway = Math.sin(k * 8) * 36 * (1 - k), cx = h.p[0] + sway, cy = lerp(-30, h.p[1], easeIn(k));
      boilSeed('d1crumb'); push(); if (k >= 1) { translate(cx, cy); rotate(h.a); translate(-cx, -cy); }
      piece(curvy([[cx - 13, cy - 8], [cx + 3, cy - 14], [cx + 14, cy - 4], [cx + 9, cy + 7], [cx - 10, cy + 7]], 3), '#D8A860', { sw: 1.3, shade: '#A87830', depth: 5, key: 'v3crumb', lift: 3 });
      pop();
      if (k >= 1) { const g = seg(o.crumbAge || 0, 0, .35); if (g > 0 && g < 1) { push(); translate(cx + 16, cy - 20); scale(backOut(g) * (1 - seg(g, .6, 1))); piece(starPts(0, 0, 14, .25, 4), '#F4F0E6', { sw: 1, key: 'v3cglint', lift: 2, flatCard: true }); pop(); } }
    }
  }
  function cityScene(t, o = {}) {
    const F = V3F, parts = treeParts(), [cx, cy, cu] = CITY.clawd;
    look('xerox');
    cpXeroxDraw(() => {
      cityBack(t, parts);
      // the roots and the trunk (behind Clawd's body), then Clawd, then the boughs and the crown over everything
      const cable = p => {
        const k = seg(t, p.a, p.b); if (k <= 0) return;
        const Q = partial(p.P, easeOut(k)); if (Q.length < 2) return;
        const col = p.kind === 'root' ? '#2A2E4A' : p.kind === 'trunk' ? '#6A98D8' : '#7AA8E0';
        piece(ribbon(Q, p.w, p.w * (p.kind === 'trunk' ? .7 : .8)), col, { sw: 1, key: 'v3cab' + p.kind + p.a.toFixed(2) });
        if (p.kind === 'root') for (let j = 1; j < Q.length - 1; j++) piece(oval(Q[j][0], Q[j][1], p.w * .7, p.w * .7, 0, 10), '#D8D4E8', { sw: .8, key: 'v3via' + p.a.toFixed(2) + j });
        if (k >= 1) { const pk = frac(bpo(t) * .5 + p.a), q = along(p.P, pk); v3Spot(oval(q[0], q[1], p.w * .9, p.w * .9, 0, 10), 'y', .95); if (p.kind !== 'trunk') { const e = p.P[p.P.length - 1]; piece(oval(e[0], e[1], p.w * 1.2, p.w * 1.2, 0, 12), '#E8C23A', { sw: 1, key: 'v3tip' + p.kind + p.a.toFixed(2) }); } }
      };
      parts.filter(p => p.kind === 'root').forEach(cable);
      // Clawd, planted: pleased to be connecting everything
      const rise = ease(seg(t, F.grow - .1, F.grow + .5)), dig = ease(seg(t, F.t0 + .4, F.roots + .2));
      clawd2(cx, cy + 8 * dig, cu, { ...emotions(t, [[F.t0, 'happy'], [F.grow + .2, 'excited'], [F.room - .5, 'happy']]), emote: null, eyes: 'happy', mouth: t > F.grow + .2 ? 'grin' : 'smile', aL: .5 + .7 * rise, aR: .5 + .7 * rise, boilKey: 'v3clawdt', noShadow: true });
      parts.filter(p => p.kind === 'trunk').forEach(cable);
      parts.filter(p => p.kind !== 'root' && p.kind !== 'trunk').forEach(cable);
      crownLeaves(t, parts);
      // the connector at the door: it plugs into the lock and the lock turns (a tick)
      const door = parts.find(p => p.kind === 'door'), dk = door ? seg(t, door.b, door.b + .3) : 0;
      if (dk > .4) { const k2 = backOut(seg(dk, .4, 1)); push(); translate(860, 540); scale(k2); v3Tick(0, 0, 24, 'v3dtick'); pop(); }
      // the productivity boom: the crown bursts (a riso starburst, a shower of scraps flying out over the city)
      if (o.boom > 0) {
        const bk = o.boom, [kx, ky] = CITY.crown, r = 140 + 1300 * easeOut(clamp(bk * 2));
        if (bk < .5) { v3Spot(starPts(kx, ky, r, .5, 14, bk * 2), 'm', .85 * (1 - bk / .5)); v3Spot(starPts(kx, ky, r * .7, .45, 11, -bk), 'y', .95 * (1 - bk / .5)); }
        for (let i = 0; i < 70; i++) { const a = hash(i * 1.7) * TAU, sp = 400 + 900 * hash(i * 2.9), age = bk * 1.4, x = kx + Math.cos(a) * sp * age, y = ky + Math.sin(a) * sp * age * .6 + 700 * age * age; v3Spot([[x - 10, y - 6], [x + 10, y - 4], [x + 8, y + 7], [x - 9, y + 5]], ['m', 'y', 'c'][i % 3], .9); }
      }
    });
    look('card');
    hisBuilding(t, () => { const bx = CITY.box; push(); translate(bx.x, bx.y); scale(bx.w / W); boxRoomScene(t, { ...(o.room || {}), riso: true }); pop(); });   // (clipped to the room's open front)   // (the room in its cut: its set runs 60 px past the frame, the bulb's halo further)
    look('xerox');
  }
  SHOT.V3f = risoShot((t, lt, dur) => {
    const F = V3F, bx = CITY.box;
    // 1. the cables grow up across the film set and cover it (the roots grow across the cut)
    if (t < F.t0 + .42) {
      drawShot('V3e', F.t0 - .001);
      look('xerox');
      const k = seg(t, F.t0, F.t0 + .42);
      cpXeroxDraw(() => { for (let i = 0; i < 10; i++) { const x0 = 40 + i * 205, P = trace([x0, H + 60], [x0 + (hash(i) - .5) * 300, -80], .3 + .4 * hash(i * 3)); const Q = partial(P, easeOut(clamp(k * 1.5 - i * .04))); if (Q.length > 1) piece(ribbon(Q, 30 + 190 * easeIn(k), 26 + 190 * easeIn(k)), '#2A2E4A', { sw: 1, key: 'v3cov' + i }); } });
      xeroxGrit(t, .6);
      return;
    }
    const down = ease(seg(t, F.boom + .1, F.boom + .3));
    const bedUp = ease(seg(t, F.room - .12, F.room + .18)) * (1 - down), sit = t > F.boom + .3;
    const crumbK = seg(t, F.fall, F.land);
    const room = { bedUp, sit, fall: !sit && t > F.boom + .3 - 1 / 12, crumb: t > F.fall ? crumbK : -1, crumbAge: t - F.land, jolt: seg(t, F.boom, F.boom + .2) * (1 - seg(t, F.boom + .2, F.boom + .8)),
      rant: t >= F.glare - .1 ? v3fRant(t, sit || t > F.boom + .3 - 1 / 12) : null, mood: t < F.I - .1 ? feel('bored', mt(t)) : emotions(mt(t), [[F.I - .1, 'sad', { lookY: .3 }]]) };
    // 2. the city: pull back out of the soil; the tree grows; over to his building (the bed goes up on "room"); the burst;
    //    push into his room
    const Zin = W / bx.w, cB = [bx.x + bx.w / 2, bx.y + bx.h / 2];
    // (Editing: the close on its feet holds ~0.4 s after the cut before the pull-back; the pull-back before the burst
    // starts earlier and slower, so the frame settles before it; the push into his room waits for the burst to shake
    // out. Each of those used to land within 0.3–0.35 s of the next change.)
    const IN = F.boom + 1.05;   // the push into his room lands: the room fills the frame
    const keys = [[F.t0 + .42, [560, 820, 2.3]], [F.t0 + .82, [580, 800, 2.12]], [F.I - .45, [980, 530, 1.03]], [F.I + .1, [1150, 520, 1.25]], [F.there - .4, [1170, 520, 1.3]], [F.boom - .3, [1000, 470, 1.1]], [F.boom + .62, [1000, 470, 1.12]], [IN, [cB[0], cB[1], Zin]]];
    let i = 0; while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
    let cam = keys[i][1];
    if (i + 1 < keys.length) { const [ta, A] = keys[i], [tb, B] = keys[i + 1], k = ease(seg(t, ta, tb)); cam = [lerp(A[0], B[0], k), lerp(A[1], B[1], k), Math.exp(lerp(Math.log(A[2]), Math.log(B[2]), k))]; }
    // The crossing to card (the media rule: at a visible moment): the push into the room lands, still riso, a part of the
    // building; the copier's light bar sweeps across it and the room comes out behind the bar as card (the film's way
    // across riso and card, run the other way), the crumb landing in his palm in card; D1 opens on the same card room.
    const LB = [IN + .04, IN + .4];
    if (t >= LB[1]) {   // (the card room, and the punch in on the thrust: zooming about the crumb)
      const m = 1 + v3fPunch(t), P = V3F_PUNCH;
      camBegin(P[0] - (P[0] - W / 2) / m, P[1] - (P[1] - H / 2) / m, m); boxRoomScene(t, room); camEnd();
      return;
    }
    const sh = t > F.boom && t < F.boom + .5 ? shakeXY(t, 14 * (1 - seg(t, F.boom, F.boom + .5))) : [0, 0];
    camBegin(cam[0] + sh[0], cam[1] + sh[1], cam[2]);
    cityScene(t, { boom: seg(t, F.boom, F.boom + .9), room });
    camEnd();
    look('xerox'); xeroxGrit(t, .5);
    // the burst's flash, printed in the drums' inks (a bleached paper frame read as washed out): the paper knocks the
    // picture back, and the yellow and pink screens print the light over it
    if (t > F.boom - .02 && t < F.boom + .08) { const fk = 1 - seg(t, F.boom, F.boom + .08), Fr = box(-60, -60, W + 60, H + 60); _paint(Fr, { wash: XEROX.paper, washOp: 150 * fk, ink: null }); v3Spot(Fr, 'y', .7 * fk); v3Spot(Fr, 'm', .32 * fk); }
    if (t >= LB[0]) { const X = lerp(-160, W + 160, seg(t, LB[0], LB[1])); v3Scissor(-10, X, () => boxRoomScene(t, room)); look('xerox'); v3LightBar(X); }
  });

  // review loops (reference only)
  // the race alone, looping its first 2.4 s (race time) at the lead's full speed (the horses: LOOPS.horse2, horse2.js)
  LOOPS.v3race = t => raceScene(V3A.race + t, t, {});
  LOOPS.v3race.len = 2.4;
  // the race's cast sheet: the four runners in their silks (top), and Altman losing the horse by degrees through the
  // line, one drawing per stage (bottom: "A race", "to build a thing", "we might not know", "how to", "rein in")
  LOOPS.v3raceCast = t => {
    look('bank'); _paint(box(-60, -60, W + 60, H + 60), { wash: BANK.paper, ink: null });
    [['altman', 'jet'], ['musk', 'steel'], ['zuck', 'brass'], ['silks', 'copper']].forEach(([who, coat], i) => {
      const x = 250 + i * 470, y = 480;
      dline([[x - 220, y], [x + 220, y]], .8, BANK.ink);
      h2Ride(x, y, 20, { ph: .52 + i * .09, coat, who, key: 'cs' + i, lean: .5, face: { ...feel(who === 'altman' ? 'determined' : 'neutral', 0), idle: 0 } });
    });
    [.05, .8, 1.55, 2.3, 2.9].forEach((rt, i) => {
      const x = 215 + i * 372, y = 1000, s = 17, Fr = h2Frame(h2FrameAt(.1 + i * .23));
      dline([[x - 175, y], [x + 175, y]], .8, BANK.ink);
      const H = h2Ride(x, y, s, { ph: .1 + i * .23, coat: 'jet', who: 'altman', key: 'st' + i, reins: false, face: altmanFace(rt, rt, false), J: F2 => altmanPose(rt, rt, F2, false).J });
      const b = H.bitW, g = rt < 2.1 ? [H.grip2, H.grip] : [H.grip];
      boilSeed('v3cs rein' + i);
      for (const q of g) if (q) v3Line(through([q, [lerp(q[0], b[0], .5), lerp(q[1], b[1], .5) + (rt < 2.1 ? 4 : 0)], b], 6), lerp(1.4, .5, seg(rt, 2.1, 3)), '#2E2622');
      if (rt < .4) { push(); translate(H.grip[0], H.grip[1]); bankFigure(() => bsMegaphone(s * 1.15, 'v3csmega')); pop(); }
      void Fr;
    });
  };
  LOOPS.v3raceCast.len = 1;
})();

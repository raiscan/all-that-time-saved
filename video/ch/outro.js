// outro.js: O1 (bar 161 to the end). The rhyme with the intro, then the person who believed it.
//   "All that time saved."  the 1930s ad from the intro, frozen and draining to grey: the promise, stalled
//   "None of it mine."      on the downbeat, pull back: the ad is playing on a phone, landscape, lying flat on
//                           the stopped night train's table, beside her notebook open at the Friday they drew
//                           (the unrealised future), her hand resting on the page. Hold (alive: her fingers settle, her
//                           thumb strokes the page once, a train's lights pass on the next line). Black.
(() => {
  // the ad's moment: the gent with his cocktail, the butler just served, his tray back at home (clear of the right tree's
  // chin, as in I1: at 2.05 the tray was mid-return, lifted, and its rim sat on the chin for the whole frozen hold)
  const FREEZE = 2.16;
  const CUT = BAR(163);                      // the downbeat before "None of it mine."
  const L1 = LY('All that time saved').start;
  const FRIDAY_AT = 6.1;                     // the Friday drawing: the two of them laughing on the bean bags

  // the page: exactly 16:9 so the Friday drawing (a full frame) fits it; tilted a little on the table. Her sketchbook's
  // canonical size (animation-style.md: A4 landscape, about twice her phone's length, 1.7 of her hand's): the page
  // 830 wide against the phone's 424 and her hand's ~490 (it had been 1100, near A3, and four of her hand's lengths)
  const PG = { cx: 975, cy: 450, w: 830, rot: -.035 }; PG.h = PG.w * 9 / 16; PG.s = PG.w / W;
  // the phone: landscape, lying flat on the table left of the notebook; SCR = its screen (16:9)
  const SCR = { x0: 58, y0: 330, w: 384 }; SCR.h = SCR.w * 9 / 16; SCR.cx = SCR.x0 + SCR.w / 2; SCR.cy = SCR.y0 + SCR.h / 2;
  const PULL = [CUT, CUT + 3.1];   // the pull-back from the screen (filling the frame) to the whole table: slow, revealing the notebook
  const onPG = ([x, y]) => { const c = Math.cos(PG.rot), s = Math.sin(PG.rot); return [PG.cx + x * c - y * s, PG.cy + x * s + y * c]; };   // page-centred → world
  const corners = (dx = 0, dy = 0, grow = 0) => {
    const hw = PG.w / 2 + grow, hh = PG.h / 2 + grow;
    return [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([x, y]) => onPG([x + dx, y + dy]));
  };
  // the navy card cover folded back under the page, showing round it as F4's does on her lap (its margins in F4's
  // proportions: left and bottom .043 of the page's width, top .026, right .034)
  const coverCorners = () => { const hw = PG.w / 2, hh = PG.h / 2, w = PG.w; return [[-hw - .043 * w, -hh - .026 * w], [hw + .034 * w, -hh - .026 * w], [hw + .034 * w, hh + .043 * w], [-hw - .043 * w, hh + .043 * w]].map(onPG); };
  const NBK = { cover: '#3A4A6A', coverDk: '#2A3650', coil: '#9A9EA6' };   // (F4's notebook colours)

  const adGrade = gray => `grayscale(${(gray * .92).toFixed(3)}) contrast(${(1 + .12 * gray).toFixed(3)}) brightness(${(1 - .12 * gray).toFixed(3)})`;
  function adPicture(t) {
    look('ink');
    const weave = [(hash(Math.floor(t * 12)) - .5) * 3, (hash(Math.floor(t * 12) + 5) - .5) * 2];   // a stuck projector
    push(); translate(...weave); pastScene(FREEZE, FREEZE, { still: true }); pop();
  }
  function ad(t, lt) {
    adPicture(t);
    POSTFX = adGrade(ease(seg(t, t - lt, L1 + 1.2)));
  }

  function notebook(t, lt) {
    const k = t - CUT;                                          // seconds since the cut
    // the pull-back: from the phone's screen filling the frame (exactly the ad's last frame) out to the whole table; the
    // zoom eases out and the centre travels with it, so the screen's corners run straight out from the frame's
    const z0 = W / SCR.w, pk = easeInOut3(seg(t, ...PULL)), z = Math.exp(lerp(Math.log(z0), 0, pk)), f = (z0 - z) / (z0 - 1);
    const pcx = lerp(SCR.cx, W / 2, f), pcy = lerp(SCR.cy, H / 2, f);
    const toS = ([x, y]) => [W / 2 + (x - pcx) * z, H / 2 + (y - pcy) * z];
    push(); translate(W / 2, H / 2); scale(z); translate(-pcx, -pcy);
    // 0. the table: an old InterCity woodgrain laminate, honey-toned (warm under the carriage light), its grain running
    // across in long wavering lines, a few knots
    look('card');
    const tt = mt(t);
    boilSeed('table'); piece(oR4(-200, -200, W + 200, H + 200), TABLE, { ink: null, key: 'otable', lift: 0, edge: false });
    for (let i = 0; i < 26; i++) { const y0 = 120 + i * 38 + 14 * hash(i), P = []; for (let x = -200; x <= W + 200; x += 60) P.push([x, y0 + 7 * Math.sin(x * .004 + i * 1.7) + 4 * Math.sin(x * .011 + i)]); dline(P, .8 + .7 * hash(i + 9), hash(i * 3.3) < .4 ? TABLE_DK : TABLE_MID, .5); }
    for (const [kx, ky, kr] of [[300, 880, 26], [1700, 240, 20]]) { dline(oval(kx, ky, kr * 2.2, kr * .7, 0, 20).concat([oval(kx, ky, kr * 2.2, kr * .7, 0, 20)[0]]), 1, TABLE_DK, .5); dline(oval(kx, ky, kr * 1.2, kr * .35, 0, 16).concat([oval(kx, ky, kr * 1.2, kr * .35, 0, 16)[0]]), .8, TABLE_DK, .5); }
    // 0b. the cover, under the page (its lift shadow on the table)
    boilSeed('cover'); piece(coverCorners(), NBK.cover, { sw: 1.8, shade: NBK.coverDk, depth: 14, key: 'ocover', lift: 8 });
    // 1. the Friday drawing, fitted to the page (the doodle look; its own lined paper is the page)
    clipPoly(corners(), () => {   // (kept to the page: the drawing's own paper runs past it)
      push(); translate(PG.cx, PG.cy); rotate(PG.rot); translate(-PG.w / 2, -PG.h / 2); scale(PG.s);
      stillDrawing(() => LOOPS.friday(FRIDAY_AT), FRIDAY_AT);   // a finished drawing: its lines don't boil
      pop();
    });
    // 2. everything around the page, in card: the table round it, the seat back beyond, the spiral binding
    look('card');
    // (the page lies on it: nothing more drawn round it)
    piece(U([[-60, -60], [W + 60, -60], [W + 60, 70], [-60, 110]], 1), '#2C3450', { sw: 2, key: 'seatedge', lift: 6 });   // the seat back beyond the table
    boilSeed('page'); clipPoly([U([[-100, -100], [W + 100, -100], [W + 100, H + 100], [-100, H + 100]], 1), corners()], () => piece(corners(0, 0, 4), '#F3EEE3', { ink: null, key: 'pagerim', lift: 3, op: 0 }));   // (the page's own small lift shadow on the cover, not over the drawing)
    const C = corners(); dline(C.concat([C[0]]), 1.4, '#9A9284');                              // the page edge
    for (let i = 0; i < 9; i++) {                                                           // the spiral down the left edge: F4's nine coils
      const [x, y] = onPG([-PG.w / 2 - .0085 * PG.w, -PG.h / 2 + .034 * PG.w + i * (PG.h - .068 * PG.w) / 8]);
      piece(oval(x, y, .0385 * PG.w, .019 * PG.w, PG.rot, 14), NBK.coil, { sw: 1.2, key: 'ring' + i, lift: 3, flatCard: true });
    }
    // 2b. the phone lying flat, the old ad playing on it
    const fade = ease(seg(k, 5.3, 7.2));   // (the fade to black: a grade on the whole frame and on the phone's screen alike)
    phone(t, toS, fade);
    // 3. her hand (her tomato coat's sleeve from the right), resting on the page's lower right corner, on their Friday; two
    // small movements after the reveal, on twos: the fingers settle; then her thumb strokes the page's edge, once, and
    // is still
    const kk = mt(t) - CUT, settle = ease(seg(kk, 3.2, 4.1)), stroke = Math.sin(Math.PI * ease(seg(kk, 4.55, 5.45)));
    const HC = HER_C.col, hx = HAND.x - 12 * settle, hy = HAND.y - 5 * settle;
    const arm = P => P.map(([x, y]) => [hx + (x * Math.cos(HAND.rot) - y * Math.sin(HAND.rot)) * HAND.s, hy + (x * Math.sin(HAND.rot) + y * Math.cos(HAND.rot)) * HAND.s]);   // (hand units, along the forearm, → world)
    piece(curvy(arm([[-.04, -.47], [3.2, -.62], [3.2, .66], [-.02, .47]]), 2), HC.coat, { sw: 2, shade: HC.coatDk, depth: 44, key: 'sleeve', lift: 10 });   // her sleeve
    piece(curvy(arm([[-.05, -.49], [.2, -.52], [.24, .54], [-.03, .5]]), 2), HC.cuff, { sw: 1.6, key: 'cuff', lift: 10 });   // its cuff
    restingHand(hx, hy, HAND.rot, HAND.s, stroke);
    pop();   // (the pull-back)
    // 4. the lights of a train on the next line passing over the stopped carriage, slow: one pass through the pull-back,
    // one through the hold (it was fading out halfway across, and the hold had gone still); then black
    for (const [k0, k1, a] of [[-.4, 2.8, pk], [2.6, 5.9, 1]]) { const q = seg(k, k0, k1); if (q > 0 && q < 1) glow(lerp(-400, W + 400, q), 300, 700, NOIR.lamp, .22 * a * Math.sin(Math.PI * q) ** .35); }
    if (fade > 0) POSTFX = `brightness(${(1 - fade).toFixed(3)})`;   // (a painted wash over the frame left the phone's screen, which is graded after it, black on black)
  }
  const HAND = { x: 1705, y: 792, rot: .22, s: 255 };   // her wrist (world px, before the settle) and the hand's turn and size

  // The phone (card), landscape, lying flat on the table in its case (seen from above: a kickstand stuck out under it as a
  // stray tab, the user), the old ad playing on it (the ink look,
  // frozen and grey: its grade applies to the screen only, POSTFX_AREAS). toS maps a point here to the screen.
  function phone(t, toS, fade = 0) {
    const { x0, y0, w, h } = SCR, b = 13, cz = 7;   // the bezel, the case's lip
    boilSeed('phone');
    piece(prRound(x0 - b - cz, y0 - b - cz, x0 + w + b + cz, y0 + h + b + cz, 26), '#7A9278', { sw: 1.6, shade: '#5A7058', depth: 8, key: 'phcase', lift: 6 });   // the case (sage)
    piece(prRound(x0 - b, y0 - b, x0 + w + b, y0 + h + b, 20), '#1E1C24', { sw: 1.2, key: 'phbody', lift: 2, flatCard: true });   // the phone
    clipPoly(oR4(x0, y0, x0 + w, y0 + h), () => { push(); translate(x0, y0); scale(w / W); adPicture(t); pop(); });   // the screen: the ad
    look('card');
    POSTFX_AREAS.push({ P: [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]].map(toS), fx: adGrade(1) + (fade > 0 ? ` brightness(${(1 - fade).toFixed(3)})` : '') });
    piece([[x0 + w * .55, y0], [x0 + w * .72, y0], [x0 + w * .5, y0 + h], [x0 + w * .33, y0 + h]], '#FFFFFF', { ink: null, op: 18, key: 'phglare', lift: 0, flatCard: true, edge: false });   // the glass
    piece(oval(x0 - b / 2, y0 + h / 2, 2.6, 2.6, 0, 10), '#3A3844', { ink: null, key: 'phcam', lift: 0, flatCard: true, edge: false });   // the camera dot
    glow(x0 + w / 2, y0 + h + 60, 260, '#C8D4DC', .12);   // the screen's light on the table
  }
  const TABLE = '#B98C5C', TABLE_MID = '#A77A4C', TABLE_DK = '#8C6238';   // the woodgrain laminate
  const easeInOut3 = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;   // (a slow start and a slow landing)
  const oR4 = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const prRound = (x0, y0, x1, y1, r) => { const P = []; for (const [cx, cy, a0] of [[x1 - r, y0 + r, -Math.PI / 2], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, Math.PI / 2], [x0 + r, y0 + r, Math.PI]]) for (let i = 0; i <= 6; i++) { const a = a0 + i / 6 * Math.PI / 2; P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return P; };
  // A hand at rest for a close-up (the rig's cartoon hand is too crude at this size): the back of a hand lying flat, from
  // the wrist at (x, y) along -x, as one card piece cut round four fingers (index to little finger, the middle longest,
  // tips rounded, the webbing notched between them), with nails and knuckle creases; the thumb a second piece along the
  // top edge, lifted a little (stroke 0..1 swings it out across the page and back). (It had read as a mitten: one lump with
  // the fingers scored on it.)
  function restingHand(x, y, rot, s, stroke = 0) {
    const skin = HER_C.col.skin, dk = HER_C.col.skinDk, lt = HER_C.col.skinLt;
    // the fingers: [centre y at the knuckles, at the tip, tip x, half-width]
    const F = [[-.27, -.3, -1.8, .105], [-.075, -.085, -1.93, .11], [.12, .125, -1.86, .105], [.3, .33, -1.64, .095]];
    const web = [-1.26, -1.32, -1.29];   // where each pair of fingers parts
    const P = [[0, .44], [-.5, .47], [-.98, .43]];
    for (let i = F.length - 1; i >= 0; i--) {   // round the little finger first (the bottom edge), up to the index
      const [yk, yt, tx, hw] = F[i], arc = [];
      for (let j = 0; j <= 6; j++) { const a = Math.PI / 2 - j / 6 * Math.PI; arc.push([tx + .02 - Math.cos(a) * hw * 1.1, yt + Math.sin(a) * hw]); }   // (the tip: +y side round to -y side)
      P.push([lerp(-1.0, tx, .55), lerp(yk, yt, .55) + hw], ...arc, [lerp(-1.0, tx, .55), lerp(yk, yt, .55) - hw]);
      if (i > 0) P.push([web[i - 1], (F[i][0] + F[i - 1][0]) / 2]);
    }
    P.push([-1.0, -.41], [-.5, -.46], [0, -.44]);
    push(); translate(x, y); rotate(rot);
    piece(curvy(U(P, s), 2), skin, { sw: 1.8, shade: dk, depth: s * .16, key: 'rh-hand', lift: 7 });
    for (const [yk, yt, tx, hw] of F) {
      piece(oval((tx + .13) * s, yt * s, .085 * s, hw * .62 * s, 0, 14), mixCol(skin, lt, .6), { sw: .8, key: 'rh-nail' + tx, lift: 0, flatCard: true, edge: false });   // the nail
      dline([[lerp(-1.0, tx, .5) * s, (lerp(yk, yt, .5) - hw * .5) * s], [lerp(-1.0, tx, .52) * s, (lerp(yk, yt, .5) + hw * .5) * s]], 1, dk, .4);   // the middle joint's crease
      dline([[-.98 * s, (yk - hw * .4) * s], [-1.02 * s, (yk + hw * .3) * s]], 1, dk, .4);   // the knuckle
    }
    push(); translate(-.3 * s, -.4 * s); rotate(.14 * stroke);   // the thumb, from its root at the wrist's top corner
    piece(curvy(U([[.05, 0], [-.35, -.14], [-.72, -.24], [-.88, -.2], [-.9, -.1], [-.7, -.02], [-.3, .06]], s), 3), skin, { sw: 1.7, shade: dk, depth: s * .08, key: 'rh-thumb', lift: 4 });
    piece(oval(-.8 * s, -.17 * s, .05 * s, .045 * s, -.25, 12), lt, { sw: .8, key: 'rh-tnail', lift: 0, flatCard: true, edge: false });
    pop();
    pop();
  }

  SHOT.O1 = (t, lt, dur) => {
    if (t < CUT) ad(t, lt);
    else notebook(t, lt);
  };
})();

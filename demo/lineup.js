// lineup.js: one character, full figure, filling the frame, for model stills (e.g. the 4K cast sheet).
//   node render.mjs --page=demo/dev-lineup.html --loop=lineup --query=who=her --stills=0.3 --os=2 --ss=4 --out=out/cast4k
// ?who=her|him|musk|zuck|dorsey|altman|turnbull|dario|grok|muse|copilot|gemini|codey|clawd|all  ·  ?look=card (default)
// The Codex pets' model sheets (labels are reference only):
//   ?who=codex       Codey in front of the gang; Codey's expressions (the sheet's glyph faces), turnarounds and poses
//   ?who=codexlooks  the gang in all five looks, a band each (?look is ignored)
//   ?who=codexpets   the eight others: front, 3/4, 3/4 flipped, a mood and a pose each
(() => {
  const Q = new URLSearchParams(location.search), WHO = Q.get('who') || 'all', LOOK = Q.get('look') || 'card';
  const GY = 985, TALL = 800;   // ground line, and the height every figure is scaled to
  const HOLD = { blink: 0, idle: 0 };   // (model stills: the rigs' idle life held still, eyes open)
  // [draw(x, u, t), height in u] per character (heights measured from the rigs: ground to the top of the head/hat/hair)
  const CAST = {
    her:      [(x, u, t) => person(x, GY, u, HER_C, { ...feel('neutral', t, { seed: 1 }), ...HOLD, view: 'q', boilKey: 'her' }), 19.2],
    him:      [(x, u, t) => person(x, GY, u, HIM_C, { ...feel('neutral', t, { seed: 2 }), ...HOLD, view: 'q', flip: true, boilKey: 'him' }), 13.6],
    musk:     [(x, u, t) => musk(x, GY, u, { ...feel('smug', t), ...HOLD, view: 'q', mouth: 'grin', boilKey: 'musk' }), 15.6],
    zuck:     [(x, u, t) => zuck(x, GY, u, { ...feel('neutral', t), ...HOLD, view: 'q', flip: true, boilKey: 'zuck' }), 12.8],
    dorsey:   [(x, u, t) => dorsey(x, GY, u, { ...feel('neutral', t), ...HOLD, view: 'q', boilKey: 'dorsey' }), 14.9],
    altman:   [(x, u, t) => altman(x, GY, u, { ...feel('neutral', t), ...HOLD, view: 'q', flip: true, boilKey: 'altman' }), 13.3],   // (13.3: his head sits higher since the likeness pass)
    turnbull: [(x, u, t) => turnbull(x, GY, u, { ...feel('happy', t), ...HOLD, view: 'q', pose: 'present', boilKey: 'turnbull' }), 13.8],
    dario:    [(x, u, t) => dario(x, GY, u, { ...feel('neutral', t), ...HOLD, view: 'q', flip: true, pose: 'fold', boilKey: 'dario' }), 14.4],
    grok:     [(x, u, t) => grok(x, GY, u, { ...feel('happy', t), view: 'q', boilKey: 'grok' }), 9.2],
    muse:     [(x, u, t) => muse(x, GY, u, { ...feel('happy', t), boilKey: 'muse' }), 9.4],
    copilot:  [(x, u, t) => copilot(x, GY, u, { ...feel('happy', t), view: 'q', boilKey: 'copilot' }), 8.6],
    gemini:   [(x, u, t) => gemini(x, GY, u, { ...feel('happy', t), boilKey: 'gemini' }), 8.2],
    clawd:    [(x, u, t) => clawd2(x, GY, u, { ...feel('happy', t), view: 'q', boilKey: 'clawd' }), 8.4],
    codey:    [(x, u, t) => codex(x, GY, u, { ...feel('happy', t), kind: 'codey', view: 'q', boilKey: 'codey' }), 5.1],
  };
  function stage(t) {
    const wall = { card: '#C9C2B6', ink: NOIR.pastSky, doodle: null, xerox: null, bank: null }[LOOK], floor = { card: '#A9A296', ink: NOIR.pastMint, doodle: '#C9C2B6', xerox: '#D6D0C4', bank: '#B8C2BA' }[LOOK];
    if (LOOK === 'card') paint(rectPts(-60, -60, W + 120, H + 120), { wash: '#8E8A84', ink: null });
    if (LOOK === 'doodle') linedPaper();
    else if (LOOK === 'bank') bankPaper(-60, -60, W + 120, H + 120);
    else if (LOOK === 'xerox') _paint(rectPts(-60, -60, W + 120, H + 120), { wash: XEROX.paper, ink: null });
    if (wall) piece(U([[-20, -20], [W + 20, -20], [W + 20, GY], [-20, GY]], 1), wall, { key: 'lnback', lift: 0, ink: LOOK === 'card' ? undefined : null, side: false });
    if (LOOK === 'doodle') dline([[40, GY], [W - 40, GY]], 1.4, BIRO);
    else piece(U([[-20, GY], [W + 20, GY], [W + 20, H + 20], [-20, H + 20]], 1), floor, { key: 'lnfloor', lift: 0, side: false });
  }

  // ---- the Codex pets' model sheets ----
  const cxL = (txt, x, y, sz = 13) => inkRH() ? letter(txt, x, y, sz, NOIR.pastInk, { ink: false, alpha: .85 }) : SHEET.label(txt, x, y, sz), CXN = { null: 'null signal', hoot: 'hoot (unverified)' };   // (ink: dark on the past's light band, b2Band)
  // a band of the look's own ground: rows y0..y1, the floor at G (bots2.js b2Band), limited to x0..x1 in card
  const cxBand = (y0, y1, G) => b2Band(STYLE.card ? 'card' : STYLE.mode, y0, y1, G);
  function cxSheet(tt) {
    const still = { blink: 0 };
    // A: the gang, Codey in front (left); Codey's turnaround (right)
    cxBand(-20, 452, 300);
    [['stacky', 150, 318, 24, 'neutral', 'front'], ['null', 285, 314, 24, 'happy', 'q'], ['hoot', 690, 314, 25, 'happy', 'q'], ['rocky', 830, 320, 24, 'neutral', 'front'],
     ['bsod', 215, 362, 28, 'happy', 'q'], ['seedy', 345, 356, 28, 'happy', 'front'], ['fireball', 625, 356, 28, 'excited', 'front'], ['dewey', 760, 362, 28, 'happy', 'q']]
      .forEach(([k, x, g, u, e, v], i) => codex(x, g, u, { ...feel(e, tt, { seed: i + 3 }), ...still, kind: k, view: v, flip: x > 480 && v === 'q', boilKey: 'cxg' + k, emoteK: 0 }));
    codex(488, 436, 50, { ...feel('happy', tt, { seed: 1 }), ...still, kind: 'codey', pose: 'wave', boilKey: 'cxgcodey', emoteK: 0 });
    cxL('codey and the codex pets', 488, 24, 18);
    [['front', 1110, {}], ['3/4', 1390, { view: 'q' }], ['3/4 flipped', 1660, { view: 'q', flip: true }]].forEach(([n, x, ex], i) => {
      codex(x, 410, 50, { ...feel('neutral', tt, { seed: 20 + i }), ...still, kind: 'codey', boilKey: 'cxt' + i, emoteK: 0, ...ex }); cxL(n, x, 440, 15);
    });
    // B, C: Codey's faces (the sheet's glyph eyes), each a feel() emotion
    const FACES = [['neutral', 'neutral'], ['happy', 'happy'], ['excited', 'excited'], ['laugh', 'laughing'], ['surprised', 'surprised'], ['confused', 'confused'], ['sad', 'sad'], ['angry', 'annoyed'],
      ['mischief', 'mischievous'], ['proud', 'proud'], ['playful', 'wink'], ['determined', 'focused'], ['thinking', 'thinking >_'], ['love', 'love'], ['scared', 'flustered'], ['ko', 'failed']];
    cxBand(452, 668, 628); cxBand(668, 884, 844);
    FACES.forEach(([e, n], i) => { const r = Math.floor(i / 8), x = 125 + (i % 8) * 239, g = r ? 844 : 628; codex(x, g, 27, { ...feel(e, tt, { seed: i }), ...still, kind: 'codey', view: i % 3 === 2 ? 'q' : 'front', boilKey: 'cxf' + i, emoteK: 0 }); cxL(n, x, g + 17, 14); });
    // D: poses
    cxBand(884, 1100, 1044);
    const sheetProp = s => { push(); rotate(-1.2); piece(U([[-.5, -.65], [.5, -.65], [.5, .65], [-.5, .65]], s), '#F4F0E4', { sw: 1, key: 'cxsp' }); pop(); };
    [['walk', { view: 'q', walk: tt * .9 }], ['run', { view: 'q', pose: 'run' }], ['cheer', { pose: 'cheer', e: 'excited' }], ['wave', { view: 'q', pose: 'wave' }], ['point', { view: 'q', pose: 'point' }],
     ['pick', { view: 'q', pose: 'pick' }], ['sneak', { view: 'q', pose: 'sneak' }], ['hold', { view: 'q', pose: { R: [2.2, -2.8, .3, 'hold', 1] }, hold: sheetProp }], ['cap + satchel', { cap: true, satchel: true, view: 'q' }], ['thumbs up', { view: 'q', pose: { R: [2.0, -2.0, .2, 'thumbUp', 1] } }]]
      .forEach(([n, ex], i) => { const x = 105 + i * 190; codex(x, 1044, 25, { ...feel(ex.e || (n === 'sneak' ? 'mischief' : 'happy'), tt, { seed: 40 + i }), ...still, kind: 'codey', boilKey: 'cxp' + i, emoteK: 0, ...ex }); cxL(n, x, 1061, 14); });
  }
  // the gang in every look: a band each, Codey first and a size up
  function cxLooks(t) {
    [['ink', 'ink'], ['card', 'card'], ['doodle', 'doodle'], ['xerox', 'riso'], ['bank', 'bank']].forEach(([m, name], r) => {
      look(m); const tt = mt(t), y0 = r * 216, G = y0 + 196;
      b2Band(m, y0, y0 + 216, G);
      cxL(name, 70, G - 60, 22);
      codex(250, G, 22, { ...feel('happy', tt, { seed: 1 }), blink: 0, kind: 'codey', pose: 'wave', boilKey: 'lk' + r, emoteK: 0 });
      CX_ALL.slice(1).forEach((k, i) => codex(420 + i * 190, G, 17, { ...feel(['happy', 'neutral', 'happy', 'excited', 'neutral', 'happy', 'surprised', 'happy'][i], tt, { seed: 5 + i }), blink: 0, kind: k, view: i % 2 ? 'q' : 'front', flip: i % 4 === 3, boilKey: 'lk' + k + r, emoteK: 0 }));
    });
    look(LOOK_DEFAULT);
  }
  // the eight others: front (neutral), 3/4 (a mood and a pose), 3/4 flipped (another mood)
  function cxPets(tt) {
    const P = [['dewey', 'surprised', 'wave', 'laugh'], ['fireball', 'excited', 'cheer', 'determined'], ['rocky', 'happy', 'point', 'sad'], ['seedy', 'hopeful', 'wave', 'sleepy'],
      ['stacky', 'happy', 'cheer', 'surprised'], ['bsod', 'sad', 'idle', 'happy'], ['null', 'happy', 'wave', 'thinking'], ['hoot', 'happy', 'point', 'surprised']];
    cxBand(-20, 540, 470); cxBand(540, 1100, 1010);
    P.forEach(([k, e1, p1, e2], i) => {
      const cx0 = (i % 4) * 480, y0 = Math.floor(i / 4) * 540, G = y0 + 470;
      cxL(CXN[k] || k, cx0 + 240, y0 + 30, 20);
      codex(cx0 + 95, G, 33, { ...feel('neutral', tt, { seed: i }), blink: 0, kind: k, boilKey: 'pa' + k, emoteK: 0 }); cxL('front', cx0 + 95, G + 22, 13);
      codex(cx0 + 245, G, 33, { ...feel(e1, tt, { seed: i + 9 }), blink: 0, kind: k, view: 'q', pose: p1, boilKey: 'pb' + k, emoteK: 0 }); cxL(`3/4 · ${e1} · ${p1}`, cx0 + 245, G + 22, 13);
      codex(cx0 + 395, G, 33, { ...feel(e2, tt, { seed: i + 17 }), blink: 0, kind: k, view: 'q', flip: true, boilKey: 'pc' + k, emoteK: 0 }); cxL(`flipped · ${e2}`, cx0 + 395, G + 22, 13);
    });
  }
  LOOPS.lineup = t => {
    look(LOOK); const tt = mt(t);
    if (WHO === 'codexlooks') { cxLooks(t); return; }
    stage(tt);
    if (WHO === 'codex') { cxSheet(tt); return; }
    if (WHO === 'codexpets') { cxPets(tt); return; }
    if (WHO === 'all') {
      const order = ['her', 'him', 'musk', 'zuck', 'dorsey', 'altman', 'turnbull', 'dario', 'grok', 'muse', 'copilot', 'gemini', 'clawd'];
      // everyone at the same scale, so their heights compare: the people in a back row, the bots in front
      const u0 = 470 / CAST.her[1], ppl = order.slice(0, 8), bots = order.slice(8);
      push(); translate(0, -150); ppl.forEach((k, i) => { const [f] = CAST[k]; f(150 + i * 232, u0, tt); }); pop();
      bots.forEach((k, i) => { const [f] = CAST[k]; f(330 + i * 315, u0, tt); });
      return;
    }
    const [f, h] = CAST[WHO]; f(W / 2, TALL / h, tt);
  };
  LOOPS.lineup.len = 4;
})();

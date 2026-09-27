// jitterbed.js: a test bed for stillness in the card look (and the others): figures standing still on a static stage,
// idle life on, so frame-to-frame change can be measured and looked at.
//   node render.mjs --page=demo/dev-jitter.html --loop=jitter --png --range=1:3 --out=out/jitter/bed/x
// ?who=trio (default) | her | him | musk  ·  ?look=card (default) | ink | doodle | bank | xerox
// ?idle=0 (no breathing, shifts or turns) · ?blink=0 (eyes held open) · ?take=1 (an emotion change: neutral, surprised
// at 2.0 s, happy at 3.2 s) · ?drift=1 (the office camera's slow zoom drift, as verse1's v1Office) · ?zoom=1.4 (closer)
(() => {
  const Q = new URLSearchParams(location.search), WHO = Q.get('who') || 'trio', LOOK = Q.get('look') || 'card';
  const IDLE = Q.get('idle'), BLINK = Q.get('blink'), TAKE = Q.get('take') === '1', DRIFT = Q.get('drift') === '1', ZOOM = +(Q.get('zoom') || 1);
  const GY = 900, U = 30;
  const hold = { ...(IDLE != null ? { idle: +IDLE } : {}), ...(BLINK != null ? { blink: +BLINK } : {}) };
  const mood = (t, seed) => TAKE ? emotions(t, [[0, 'neutral'], [2.0, 'surprised', { emote: null }], [3.2, 'happy', { emote: null }]]) : feel('neutral', t, { seed });
  function stage() {
    const wall = { card: '#C9C2B6', ink: NOIR.pastSky }[LOOK], floor = { card: '#A9A296', ink: NOIR.pastMint, doodle: '#C9C2B6', xerox: '#D6D0C4', bank: '#B8C2BA' }[LOOK];
    if (LOOK === 'card') paint(rectPts(-60, -60, W + 120, H + 120), { wash: '#8E8A84', ink: null });
    if (LOOK === 'doodle') linedPaper();
    else if (LOOK === 'bank') bankPaper(-60, -60, W + 120, H + 120);
    else if (LOOK === 'xerox') _paint(rectPts(-60, -60, W + 120, H + 120), { wash: XEROX.paper, ink: null });
    if (wall) piece(U_([[-20, -20], [W + 20, -20], [W + 20, GY], [-20, GY]]), wall, { key: 'jbback', lift: 0, ink: LOOK === 'card' ? undefined : null });
    if (LOOK === 'doodle') dline([[40, GY], [W - 40, GY]], 1.4, BIRO);
    else piece(U_([[-20, GY], [W + 20, GY], [W + 20, H + 20], [-20, H + 20]]), floor, { key: 'jbfloor', lift: 0 });
    // a still prop on the set: a card box on the floor (its pixels must not change at all)
    piece(U_([[1640, GY - 120], [1820, GY - 130], [1830, GY + 10], [1650, GY + 14]]), '#B08A5A', { key: 'jbbox', shade: '#7A5A3A', depth: 20 });
  }
  const U_ = P => P.map(([a, b]) => [a, b]);
  LOOPS.jitter = t => {
    look(LOOK); const tt = mt(t);
    const cz = DRIFT ? ZOOM + .004 * Math.sin(tt * .7) : ZOOM;
    camBegin(W / 2, H / 2 + (ZOOM > 1 ? -60 : 0), cz);
    stage();
    const her = x => person(x, GY, U, HER_C, { ...mood(tt, 1), ...hold, view: 'q', boilKey: 'jbher' });
    const him = x => person(x, GY, U * 1.25, HIM_C, { ...mood(tt, 2), ...hold, view: 'front', boilKey: 'jbhim' });
    const mu = x => musk(x, GY, U * 1.15, { ...mood(tt, 3), ...hold, view: 'q', flip: true, boilKey: 'jbmusk' });
    if (WHO === 'her') her(W / 2);
    else if (WHO === 'him') him(W / 2);
    else if (WHO === 'musk') mu(W / 2);
    else { her(520); him(960); mu(1400); }
    camEnd();
  };
  LOOPS.jitter.len = 4;
})();

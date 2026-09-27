// sheets.js: model sheets for the demo cast, as loops. Labels are fine here (reference only).
//   node render.mjs --page=demo/dev-people.html --loop=commuter --sheet=0.3 --cols=1 --w=1920 --out=out/demo/commuter.jpg
const SHEET = {
  label: (txt, x, y, size = 22) => letter(txt, x, y, size, STYLE.card || STYLE.mode === 'doodle' || STYLE.mode === 'engrave' ? '#3A302C' : NOIR.light, { ink: false, alpha: .85 }),
  // a plain stage: noir (dark, a warm key light) or card (a sheet of grey card on a table)
  stage(t) {
    boilSeed('stage');
    if (STYLE.mode === 'doodle') { linedPaper(); return; }
    if (STYLE.mode === 'flip') { paint(rectPts(-60, -60, W + 120, H + 120), { wash: '#F2ECE0', ink: null }); inkLine([[0, 906], [W, 904]], 1, '#6A6470', 'graphite', 0); return; }
    if (STYLE.mode === 'bank') { bankPaper(-60, -60, W + 120, H + 120); return; }
    if (STYLE.mode === 'xerox') { paint(rectPts(-60, -60, W + 120, H + 120), { wash: '#FFFFFF', ink: null }); _paint(rectPts(-60, -60, W + 120, H + 120), { wash: XEROX.paper, ink: null }); return; }
    if (STYLE.mode === 'engrave') { paint(rectPts(-60, -60, W + 120, H + 120), { wash: E_PAPER, ink: null }); inkLine([[0, 906], [W, 904]], 1.2, E_INK, 'ink', 0); return; }
    if (STYLE.card) { paint(rectPts(-60, -60, W + 120, H + 120), { wash: '#8E8A84', ink: null }); piece(U([[0, 0], [W, 0], [W, 905], [0, 905]], 1), '#B9B2A6', { key: 'backdrop', lift: 0 }); }
    else { paint(rectPts(-60, -60, W + 120, H + 120), { wash: NOIR.char, ink: null }); paint(rectPts(-60, 905, W + 120, 300), { wash: NOIR.shadow, ink: null }); inkLine([[0, 906], [W, 904]], 1.2, NOIR.ink, 'flash', 0); }
  },
  spot(x, y = 520, r = 520) { if (!STYLE.card) glow(x, y, r, NOIR.lamp, .3); },
};
(() => {
  const { label, stage, spot } = SHEET;
  LOOPS.commuter = t => {
    stage(t); const tt = mt(t);
    const row = [['front', 'idle', 'neutral', {}], ['q', 'phone', 'bored', { lookY: .7, lookX: .2, hold: s => { piece(curvy(U([[-.1, -.55], [.9, -.55], [.9, 1.05], [-.1, 1.05]], s), 2), '#2E2A3A', { sw: 1.2, key: 'ph', lift: 2 }); } }], ['front', 'hips', 'proud', {}], ['q', 'shrug', 'confused', {}], ['front', 'crumple', 'angry', {}]];
    row.forEach(([v, p, e, extra], i) => { const x = 210 + i * 375; spot(x); commuter(x, 905, 34, { ...feel(e, tt, { seed: i }), view: v, pose: p, ...extra }); label(`${v} · ${p} · ${e}`, x, 950); });
  };
  LOOPS.commuter.len = 4;
  LOOPS.commuterFaces = t => {
    stage(t); const tt = mt(t);
    ['neutral', 'happy', 'sad', 'angry', 'surprised', 'bored', 'scared', 'determined'].forEach((e, i) => {
      const x = 130 + i * 237; spot(x, 420, 300);
      push(); translate(x, 1030); commuter(0, 0, 58, { ...feel(e, tt, { seed: i }), view: i % 2 ? 'q' : 'front', pose: 'low', noShadow: true }); pop();
      label(e, x, 1045);
    });
  };
  LOOPS.commuterFaces.len = 4;
})();

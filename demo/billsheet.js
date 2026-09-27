// billsheet.js: the bill designs, big, in ?look=. LOOPS.bills: the utility family (the hero electric bill, then a pile's
// worth of others); LOOPS.billstyles: classic / receipt / utility side by side.
(() => {
  const LOOK = new URLSearchParams(location.search).get('look') || 'card';
  const ground = () => {
    look(LOOK); const bg = { card: '#6A5A4E', bank: null, ink: NOIR.pastSky, doodle: null, xerox: null }[LOOK];
    if (LOOK === 'bank') bankPaper(-60, -60, W + 120, H + 120); else if (LOOK === 'doodle') linedPaper(); else if (LOOK === 'xerox') _paint(rectPts(-60, -60, W + 120, H + 120), { wash: XEROX.paper, ink: null });
    if (bg) piece(rectPts(-60, -60, W + 120, H + 120), bg, { ink: null, key: 'bsbg', lift: 0, flatCard: true, edge: false });
  };
  LOOPS.bills = t => {
    ground();
    const keys = ['bs0', 'bs1', 'bs2', 'bs3', 'bs4', 'bs5', 'bs6', 'bs7'];
    keys.forEach((k, i) => { boilSeed('bl' + k); billAs('utility', 200 + (i % 4) * 505, 260 + Math.floor(i / 4) * 560, 330, (hash(i * 3.1) - .5) * .12, k); });
  };
  LOOPS.billstyles = t => {
    ground();
    ['receipt', 'utility', 'ai'].forEach((st, i) => { boilSeed('bs' + st); billAs(st, 340 + i * 620, 540, 480, [-.05, .03, -.02][i], st === 'utility' ? 'bs5' : 'bs' + st); });
  };
  LOOPS.bills.len = LOOPS.billstyles.len = 2;
})();

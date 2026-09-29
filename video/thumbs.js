// thumbs.js: YouTube thumbnails from the film's own frames (video/thumbs.html, the film's page with the karaoke off).
//   LOOPS.film           the film itself, its loop time the film's time (clean frames to choose from):
//     node render.mjs --page=video/thumbs.html --loop=film --sheet=159.5,258 --cols=4 --w=480 --out=out/thumbs/pick.jpg
//   LOOPS.thumb_<name>   one thumbnail (THUMBS below): the film at time t, pushed in on the finished frame (push: the
//                        point to centre, 1920×1080 units, and the zoom), and lettered in its world's look:
//     node render.mjs --page=video/thumbs.html --loop=thumb_ad --stills=0 --os=2 --ss=3 --out=out/thumbs/raw
//   (then 1280×720 JPEG under 2 MB, downscaled with Lanczos; YouTube's own badge, the running time, sits bottom right)
LOOPS.film = t => {
  let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++;
  const t0 = SHOTS[i][0], end = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : FILM_END;
  SHOTS[i][1](t, t - t0, end - t0);
  CAM = null;
};
LOOPS.film.len = FILM_END; LOOPS.film.karaoke = false;

(() => {
  const MC = document.createElement('canvas').getContext('2d');
  const widthOf = (txt, font) => { MC.font = font; return MC.measureText(txt).width; };
  const capOf = font => { MC.font = font; return MC.measureText('H').actualBoundingBoxAscent; };
  const fit = (txt, w, wt, fam) => { const size = 100 * w / widthOf(txt, `${wt} 100px ${fam}`), font = `${wt} ${size.toFixed(1)}px ${fam}`; return { font, size, cap: capOf(font) }; };

  // A cut-card strip (the karaoke's card look), its rows set to width w about (cx, cy): rows [[word, chip colour or
  // null], ...]; a word on a chip is inked, the rest cream on the strip.
  function cardStrip(c, { cx, cy, w, rot = 0, rows, seed = 3 }) {
    const S = KS.card, fam = '"Shantell Sans", sans-serif', txt = rows.map(r => r.map(([s]) => s).join(' '));
    const F = fit(txt.reduce((a, b) => widthOf(a, '800 100px ' + fam) > widthOf(b, '800 100px ' + fam) ? a : b), w, '800', fam);
    const lh = F.cap * 1.75, h = lh * rows.length + F.cap * .9, sp = widthOf(' ', F.font);
    c.save(); c.translate(cx, cy); c.rotate(rot);
    kCardPiece(c, kCut(w + F.cap * 1.3, h, seed, 2.4, 140, 6), S.card, S.edge, 'l', 10);
    c.font = F.font; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
    rows.forEach((r, j) => {
      const ws = r.map(([s]) => widthOf(s, F.font)), tw = ws.reduce((a, b) => a + b, 0) + sp * (r.length - 1), y = -h / 2 + F.cap * .45 + lh * (j + .5) + F.cap / 2;
      let x = -tw / 2;
      r.forEach(([s, chip], i) => {
        if (chip) { c.save(); c.translate(x + ws[i] / 2, y - F.cap / 2); c.rotate((kH(seed * 5 + j, i) - .5) * .06); kCardPiece(c, kCut(ws[i] + F.cap * .5, F.cap * 1.5, seed * 7 + i + j * 3, 1.4, 70, 3), chip, mixCol(chip, '#FFFFFF', .35), 'd', 4); c.restore(); }
        c.fillStyle = 'rgba(0,0,0,.3)'; c.fillText(s, x + 2, y + 3); c.fillStyle = chip ? S.ink : S.text; c.fillText(s, x, y);
        x += ws[i] + sp;
      });
    });
    c.restore();
  }

  // The 1930s title card (the ad's own, as the intro shows its line): cream Limelight on black card, a ruled border.
  function inkCard(c, { cx, cy, w, rows }) {
    const S = KS.ink, fam = 'Limelight, serif', F = fit(rows.reduce((a, b) => widthOf(a, '400 100px ' + fam) > widthOf(b, '400 100px ' + fam) ? a : b), w, '400', fam);
    const lh = F.cap * 1.6, h = lh * rows.length + F.cap * 1.2, W0 = w + F.cap * 1.6;
    c.save(); c.translate(cx, cy);
    c.fillStyle = 'rgba(0,0,0,.35)'; kRR(c, -W0 / 2 + 6, -h / 2 + 8, W0, h, 18); c.fill();
    c.fillStyle = S.card; kRR(c, -W0 / 2, -h / 2, W0, h, 18); c.fill();
    c.strokeStyle = S.rule; c.lineWidth = 4; kRR(c, -W0 / 2 + 14, -h / 2 + 14, W0 - 28, h - 28, 10); c.stroke();
    c.lineWidth = 1.5; kRR(c, -W0 / 2 + 22, -h / 2 + 22, W0 - 44, h - 44, 7); c.stroke();
    c.font = F.font; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillStyle = S.text;
    rows.forEach((r, j) => c.fillText(r, 0, -h / 2 + F.cap * .6 + lh * (j + .5) + F.cap / 2));
    c.restore();
  }

  // The banknote's lettering: Cinzel capitals in the house teal on a paper banderole, a word in the bill's red.
  function bankBanner(c, { cx, cy, w, rows }) {
    const S = KS.bank, fam = 'Cinzel, serif', flat = rows.map(r => r.map(([s]) => s).join(' '));
    const F = fit(flat.reduce((a, b) => widthOf(a, '700 100px ' + fam) > widthOf(b, '700 100px ' + fam) ? a : b), w, '700', fam);
    const lh = F.cap * 1.7, h = lh * rows.length + F.cap * .9, W0 = w + F.cap * 2.2, sp = widthOf(' ', F.font);
    c.save(); c.translate(cx, cy);
    const tail = F.cap * 1.4, P = [[-W0 / 2, -h / 2], [W0 / 2, -h / 2], [W0 / 2 + tail, -h / 2 + h * .15], [W0 / 2 + tail * .55, 0], [W0 / 2 + tail, h / 2 - h * .15], [W0 / 2, h / 2], [-W0 / 2, h / 2], [-W0 / 2 - tail, h / 2 - h * .15], [-W0 / 2 - tail * .55, 0], [-W0 / 2 - tail, -h / 2 + h * .15]];
    c.save(); c.translate(5, 7); kPath(c, P); c.fillStyle = 'rgba(20,40,44,.3)'; c.fill(); c.restore();
    kPath(c, P); c.fillStyle = S.paper; c.fill(); c.strokeStyle = S.ink; c.lineWidth = 4; c.stroke();
    c.lineWidth = 1.5; c.beginPath(); c.rect(-W0 / 2 + 12, -h / 2 + 12, W0 - 24, h - 24); c.stroke();
    c.font = F.font; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
    rows.forEach((r, j) => {
      const ws = r.map(([s]) => widthOf(s, F.font)), tw = ws.reduce((a, b) => a + b, 0) + sp * (r.length - 1), y = -h / 2 + F.cap * .45 + lh * (j + .5) + F.cap / 2;
      let x = -tw / 2; r.forEach(([s, red], i) => { c.fillStyle = red ? S.voice.F : S.ink; c.fillText(s, x, y); x += ws[i] + sp; });
    });
    c.restore();
  }

  // ---------- the thumbnails ----------
  const THUMBS = {
    // the promise and the two of them: the ad's line as its own 1930s card, the riso poster of it burning behind them,
    // their glare the answer (V2's pre-chorus: "Is this what you meant?")
    ad: { t: 160, push: [960, 560, 1.18], text: c => inkCard(c, { cx: 960, cy: 132, w: 1120, rows: ['“Think of all the time', 'you’ll save.”'] }) },
    // her on the train, the future outside the window (the bridge: "I'm pissed off I'm still waiting outside")
    waiting: { t: 258, push: [900, 470, 1.3], text: c => cardStrip(c, { cx: 1330, cy: 735, w: 720, rot: -.03, rows: [[['Still', null], ['waiting.', KS.card.voice.F]]] }) },
    // him at the laptop (verse 2: "Give me my life back")
    lifeback: { t: 128, push: [1000, 520, 1.3], text: c => cardStrip(c, { cx: 1405, cy: 170, w: 740, rot: .02, rows: [[['Give', null], ['me', null], ['my', null]], [['life', KS.card.voice.M], ['back.', KS.card.voice.M]]] }) },
    // the bosses' bunker on the banknote (the chorus: "You get the bunker; I get the bill")
    bunker: { t: 73, push: [960, 560, 1.12], text: c => bankBanner(c, { cx: 960, cy: 130, w: 1100, rows: [[['You', 0], ['get', 0], ['the', 0], ['bunker.', 0]], [['I', 0], ['get', 0], ['the', 1], ['bill.', 1]]] }) },
  };
  for (const [name, D] of Object.entries(THUMBS)) {
    const L = LOOPS['thumb_' + name] = () => { const T0 = T; T = D.t; try { LOOPS.film(D.t); } finally { T = T0; } };
    L.len = 1; L.karaoke = false; L.thumb = D;
  }

  // the push and the lettering, on the compositor after the frame
  const _composite = composite, tmp = document.createElement('canvas');
  composite = function (t) {
    _composite(t);
    const D = window.LOOP && window.LOOP.thumb; if (!D) return;
    const c = outX, [px, py, z] = D.push || [W / 2, H / 2, 1];
    if (z !== 1) {
      tmp.width = outC.width; tmp.height = outC.height; tmp.getContext('2d').drawImage(outC, 0, 0);
      c.setTransform(1, 0, 0, 1, 0, 0); c.imageSmoothingQuality = 'high';
      c.drawImage(tmp, (px - W / 2 / z) * OS, (py - H / 2 / z) * OS, W / z * OS, H / z * OS, 0, 0, outC.width, outC.height);
    }
    c.save(); c.setTransform(OS, 0, 0, OS, 0, 0); D.text(c); c.restore();
  };
})();

// cast/audit.js: the FACE AUDIT, big close-ups of every rig's face for checking feature alignment and drawing quality
// (reference only: labels allowed). Load it after the cast and the sets (demo/dev-audit.html does).
//
//   node render.mjs --page=demo/dev-audit.html --loop=faceAudit --query="rig=himC&page=1" --sheet=0.3 --cols=1 --w=1920 --out=out/demo/faces_audit/himC_1.jpg
//   node render.mjs --page=demo/dev-audit.html --loop=faceAudit --query="rig=musk&page=2&look=card" ...
//
//   rig   himC herC commuter musk zuck grok muse (default himC)
//   page  1: the front row and the 3/4 row · 2: the flipped 3/4 row, and a row of life: blinks, a mid-transition
//         squint (front and 3/4), a sideways look · 3: laughing (squeezed '> <' eyes) and crying in every view, smug, a
//         look up across the face in 3/4, scared
//   look  ink card doodle bank xerox engrave flip (dev-audit.html reads ?look= for the page's look)
// Each row: neutral, happy, angry, sad, surprised, at a head about 250 px tall. Body motion that moves the figure (dx, dy)
// is held still so the cells line up; squash, lean and everything on the face stay live.
(() => {
  const E5 = ['neutral', 'happy', 'angry', 'sad', 'surprised'];
  const par = new URLSearchParams(location.search);
  const flatBg = () => ({ ink: NOIR.char, card: '#B9B2A6', doodle: '#FBF8F0', bank: BANK.paper, xerox: XEROX.paper, engrave: E_PAPER, flip: '#F2ECE0' })[STYLE.mode] || NOIR.char;
  // a seed that puts the rig's blink cycle at phase ph (seconds of its 3.3 s cycle) at the current frame: 0.05 = mid-blink
  const blinkSeed = (ph, cyc = 3.3, t0 = T, off = 0) => ((((ph - t0 * .9 - off) % cyc) + cyc) % cyc) / 1.7;
  // Each rig: draw(cx, cy, o) puts the centre of its head (and hair) at (cx, cy); o = feel() + view/flip/extras.
  const person1 = (P, u, down) => (cx, cy, o) => {
    const Fr = personFrame(P, { view: o.view }), fl = o.flip ? -1 : 1;
    person(cx - fl * Fr.hx * u, cy - Fr.hy * u + down * u, u, P, { pose: 'low', legs: false, noShadow: true, ...o });
  };
  const RIGS = {
    himC: { name: 'him C', draw: person1(HIM_C, 58, .25), seed: ph => blinkSeed(ph) },
    herC: { name: 'her C', draw: person1(HER_C, 50, 1.85), seed: ph => blinkSeed(ph) },
    commuter: { name: 'commuter', seed: ph => blinkSeed(ph),
      draw: (cx, cy, o) => { const u = 47, fl = o.flip ? -1 : 1; commuter(cx - fl * (o.view === 'q' ? .3 : 0) * u, cy + 10.75 * u, u, { pose: 'low', seated: true, noShadow: true, ...o }); } },
    musk: { name: 'musk', seed: ph => blinkSeed(ph, 3.4, mt(T), .6),
      draw: (cx, cy, o) => { const u = 38, k = u * MK_S, fl = o.flip ? -1 : 1; musk(cx - fl * (o.view === 'q' ? .55 : 0) * k, cy + 12.55 * k, u, { pose: 'idle', seated: true, noShadow: true, ...o }); } },
    zuck: { name: 'zuck', seed: ph => 0,
      draw: (cx, cy, o) => { const u = 43, fl = o.flip ? -1 : 1; zuck(cx - fl * (o.view === 'q' ? .35 : 0) * u, cy + (10.15 - ZK_DROP) * u, u, { pose: 'low', seated: true, noShadow: true, robot: false, ...o }); } },
    grok: { name: 'grok', seed: ph => blinkSeed(ph, 3.3, mt(T)),
      draw: (cx, cy, o) => { const u = 58; grok(cx, cy + 7.1 * u, u, { noShadow: true, smoke: false, bounce: 0, aL: -.2, aR: -.2, ...o }); } },
    muse: { name: 'muse', seed: ph => blinkSeed(ph, 3.3, mt(T)),
      draw: (cx, cy, o) => { const u = 80; muse(cx, cy + 3.8 * u, u, { noShadow: true, bounce: 0, alt: 0, aL: -.2, aR: -.2, ...o }); } },   // (Jolly's face 1.3 u above its middle)
  };
  const cellO = (e, tt, rig, extra = {}) => {
    const f = feel(e, tt, { seed: rig.seed(1.6) });
    // (blink: 0 and idle: 0: the rigs' idle life (irregular blinks, breathing, head turns: clawd.js lifeOf) held still,
    // so every cell shows the face as posed; the blink cells pass blink: 1)
    return { ...f, dx: 0, dy: 0, emote: null, blink: 0, idle: 0, boilKey: 'fa' + rig.name + e + (extra.view || 'front') + (extra.flip ? 'f' : '') + (extra.tag || ''), ...extra };
  };
  LOOPS.faceAudit = t => {
    const { label } = SHEET, lk = par.get('look'); if (lk) look(lk);
    const rig = RIGS[par.get('rig') || 'himC'] || RIGS.himC, page = +(par.get('page') || 1), tt = mt(t);
    SHEET.stage(t);
    const rows = page === 2
      ? [['3/4 flipped', E5.map(e => [e, cellO(e, tt, rig, { view: 'q', flip: true })])],
         ['life', [
           ['blink', cellO('neutral', tt, rig, { seed: rig.seed(.05), blink: 1, tag: 'b1' })],
           ['blink 3/4', cellO('neutral', tt, rig, { view: 'q', seed: rig.seed(.05), blink: 1, tag: 'b2' })],
           ['squint .5', cellO('surprised', tt, rig, { squint: .5, tag: 's1' })],
           ['angry, squint .5, 3/4', cellO('angry', tt, rig, { view: 'q', squint: .5, tag: 's2' })],
           ['look down-left', cellO('neutral', tt, rig, { lookX: -1, lookY: .7, tag: 'l1' })],
         ]]]
      : page === 3
      ? [['laugh', [['front', cellO('laugh', tt, rig, { tag: 'la' })], ['3/4', cellO('laugh', tt, rig, { view: 'q', tag: 'la' })], ['3/4 flipped', cellO('laugh', tt, rig, { view: 'q', flip: true, tag: 'la' })],
                     ['cry', cellO('neutral', tt, rig, { eyes: 'cry', mouth: 'wobble', tag: 'cr' })], ['cry 3/4', cellO('neutral', tt, rig, { view: 'q', eyes: 'cry', mouth: 'wobble', tag: 'cr' })]]],
         ['smug · look', [['smug', cellO('smug', tt, rig, { tag: 'sm' })], ['smug 3/4', cellO('smug', tt, rig, { view: 'q', tag: 'sm' })], ['smug 3/4 flipped', cellO('smug', tt, rig, { view: 'q', flip: true, tag: 'sm' })],
                     ['look up-right 3/4', cellO('neutral', tt, rig, { view: 'q', lookX: 1, lookY: -.7, tag: 'l2' })], ['scared', cellO('scared', tt, rig, { tag: 'sc' })]]]]
      : [['front', E5.map(e => [e, cellO(e, tt, rig)])], ['3/4', E5.map(e => [e, cellO(e, tt, rig, { view: 'q' })])]];
    rows.forEach(([rowName, cells], r) => {
      const y0 = r * 540;
      if (r) {   // hide the row above's bodies under this row
        boilSeed('famask' + r); _paint(U([[-60, y0], [W + 60, y0], [W + 60, H + 60], [-60, H + 60]], 1), { wash: flatBg(), ink: null });
        _inkLine([[0, y0], [W, y0]], 1.2, STYLE.mode === 'ink' ? NOIR.shadow : '#6A6258', 'rotring', 0);
      }
      cells.forEach(([name, o], i) => rig.draw(192 + i * 384, y0 + 262, o));
      boilSeed('faband' + r); _paint(U([[-60, y0 + 506], [W + 60, y0 + 506], [W + 60, y0 + 540], [-60, y0 + 540]], 1), { wash: flatBg(), ink: null });
      cells.forEach(([name], i) => label(`${rowName} · ${name}`, 192 + i * 384, y0 + 523, 18));
    });
    label(`face audit · ${rig.name} · ${STYLE.mode}`, W - 160, 16, 16);
  };
  LOOPS.faceAudit.len = 4;
  // all seven rigs at once, neutral, front / 3/4 / flipped 3/4 (a quick look at the whole cast, smaller)
  LOOPS.faceAuditAll = t => {
    const { label } = SHEET, lk = par.get('look'); if (lk) look(lk);
    const tt = mt(t), e = par.get('e') || 'neutral';
    SHEET.stage(t);
    const names = Object.keys(RIGS), vs = [['front', false], ['q', false], ['q', true]];
    vs.forEach(([v, fl], r) => {
      const y0 = r * 360;
      if (r) { boilSeed('faallmask' + r); _paint(U([[-60, y0], [W + 60, y0], [W + 60, H + 60], [-60, H + 60]], 1), { wash: flatBg(), ink: null }); }
      names.forEach((n, i) => {
        const rig = RIGS[n], cx = 137 + i * 274, cy = y0 + 170;
        push(); translate(cx, cy); scale(.62); rig.draw(0, 0, cellO(e, tt, rig, { view: v, flip: fl })); pop();
        if (!r) label(rig.name, cx, 12, 16);
      });
    });
  };
  LOOPS.faceAuditAll.len = 4;
  // An acted emotion change (neutral → surprised → happy → angry → sad), for strips: nothing may pop out of place.
  //   node render.mjs --page=demo/dev-audit.html --loop=faceAuditTrans --query=rig=herC --strip=0.8:1.3 --cols=6 --w=320 ...
  LOOPS.faceAuditTrans = t => {
    const lk = par.get('look'); if (lk) look(lk);
    const rig = RIGS[par.get('rig') || 'himC'] || RIGS.himC, tt = mt(t);
    SHEET.stage(t);
    const keys = [[0, 'neutral'], [1, 'surprised'], [2, 'happy'], [3, 'angry'], [4, 'sad']];
    [['front', false], ['q', false], ['q', true]].forEach(([v, fl], i) => {
      const o = { ...emotions(tt, keys), dx: 0, dy: 0, emote: null, view: v, flip: fl, seed: rig.seed(1.6), blink: 0, idle: 0, boilKey: 'fat' + i };
      rig.draw(320 + i * 640, 500, o);
    });
  };
  LOOPS.faceAuditTrans.len = 5;
})();

// ---------- the BODY AUDIT: full figures, for occlusion and clean joins (arms into shoulders, hands into cuffs, necks into
// collars, legs into hems, feet into shoes), in front, 3/4, flipped 3/4, seated and a range of poses ----------
//   node render.mjs --page=demo/dev-audit.html --loop=bodyAudit --query="rig=himC&page=1" --sheet=0.3 --cols=1 --w=1920 --out=...
//   page 1..3, four figures each (see BA_CELLS); look as for faceAudit
(() => {
  const par = new URLSearchParams(location.search);
  const G = 1030;
  // [view, flip, pose, extra] per cell; 12 per rig (3 pages of 4)
  const P3 = (a, b, c, d) => [a, b, c, d];
  const RIGS = {
    himC: { u: 58, draw: (x, o) => person(x, G, 58, HIM_C, o), cells: [
      P3('front', 0, 'idle'), P3('q', 0, 'idle'), P3('q', 1, 'idle'), P3('q', 0, 'lap', { seated: true }),
      P3('front', 0, 'hips'), P3('q', 0, 'point'), P3('q', 1, 'wave'), P3('front', 0, 'cross'),
      P3('front', 0, 'phone'), P3('q', 0, 'pockets'), P3('q', 1, 'mug', { hold: s => ppMug(s, -1.35) }), P3('front', 0, 'lap', { seated: true }) ] },
    herC: { u: 44, draw: (x, o) => person(x, G, 44, HER_C, o), cells: [
      P3('front', 0, 'idle'), P3('q', 0, 'idle'), P3('q', 1, 'idle'), P3('q', 0, 'lap', { seated: true }),
      P3('front', 0, 'hips'), P3('q', 0, 'point'), P3('q', 1, 'wave'), P3('front', 0, 'cross'),
      P3('front', 0, 'chin'), P3('q', 0, 'pockets'), P3('q', 1, 'phone', { hold: s => phone(s, .8) }), P3('front', 0, 'lap', { seated: true }) ] },
    commuter: { u: 62, draw: (x, o) => commuter(x, G, 62, o), cells: [
      P3('front', 0, 'idle'), P3('q', 0, 'idle'), P3('q', 1, 'idle'), P3('q', 1, 'table', { seated: true }),
      P3('front', 0, 'hips'), P3('q', 0, 'phone'), P3('q', 1, 'shrug'), P3('front', 0, 'crumple'),
      P3('front', 0, 'chest'), P3('q', 0, 'chin'), P3('q', 1, 'pockets'), P3('front', 0, 'up') ] },
    musk: { u: 56, draw: (x, o) => o.seated ? (musk(x, G, 56, { ...o, layer: 'back' }), musk(x, G, 56, { ...o, layer: 'front' })) : musk(x, G, 56, o), cells: [
      P3('front', 0, 'idle'), P3('q', 0, 'idle'), P3('q', 1, 'idle'), P3('q', 1, 'table', { seated: true }),
      P3('front', 0, 'hips'), P3('q', 0, 'toast', { flute: { fill: .7 } }), P3('q', 1, 'point'), P3('front', 0, 'laugh'),
      P3('front', 0, 'chin'), P3('q', 0, 'shrug'), P3('q', 1, 'clink', { flute: { fill: .7, tilt: .25 } }), P3('front', 0, 'table', { seated: true }) ] },
    zuck: { u: 64, draw: (x, o) => zuck(x, G, 64, o), cells: [
      P3('front', 0, 'idle'), P3('q', 0, 'idle'), P3('q', 1, 'idle'), P3('q', 1, 'table', { seated: true }),
      P3('front', 0, 'hips'), P3('q', 0, 'toast', { flute: true }), P3('q', 1, 'wave'), P3('front', 0, 'guard'),
      P3('front', 0, 'point'), P3('q', 0, 'sip', { flute: true, zmouth: 'sip' }), P3('q', 1, 'low'), P3('front', 0, 'table', { seated: true }) ] },
    grok: { u: 80, draw: (x, o) => grok(x, G, 80, { smoke: false, bounce: .4, ...o }), cells: [
      P3('front', 0, null), P3('q', 0, null), P3('q', 1, null), P3('q', 0, 'pour'),
      P3('front', 0, 'hips'), P3('q', 0, 'serve', { tray: 'canapes' }), P3('q', 1, 'wave'), P3('front', 0, 'laugh'),
      P3('front', 0, 'shrug'), P3('q', 0, 'point'), P3('q', 1, 'pour'), P3('front', 0, 'wave') ] },
    muse: { u: 70, draw: (x, o) => muse(x, G - 60, 70, { alt: 1.2, bounce: .4, ...o }), cells: [
      P3('front', 0, null), P3('q', 0, null), P3('q', 1, null), P3('front', 0, 'tray', { tray: 'canapes' }),
      P3('front', 0, 'serve', { tray: 'bill' }), P3('q', 0, 'wave'), P3('q', 1, 'point'), P3('q', 0, 'tray', { tray: 'flutes' }),
      P3('front', 0, 'wave'), P3('q', 1, 'serve', { tray: 'bill' }), P3('q', 0, 'point'), P3('front', 0, null, { wrist: true }) ] },
  };
  LOOPS.bodyAudit = t => {
    const lk = par.get('look'); if (lk) look(lk);
    const name = par.get('rig') || 'himC', rig = RIGS[name] || RIGS.himC, page = clamp(+(par.get('page') || 1), 1, 3), tt = mt(t);
    SHEET.stage(t);
    rig.cells.slice((page - 1) * 4, page * 4).forEach(([v, fl, pose, extra = {}], i) => {
      const x = 240 + i * 480, o = { ...feel('neutral', tt, { seed: i }), dx: 0, dy: 0, emote: null, view: v, flip: !!fl, boilKey: 'ba' + name + page + i, ...extra };
      if (pose) o.pose = pose;
      if (name === 'zuck' && o.seated) o.table = () => zkTable(x, G, rig.u);
      if (name === 'muse' && extra.wrist) { muse(x, 620, 70, { ...o }); }
      else rig.draw(x, o);
      SHEET.label(`${v}${fl ? ' flip' : ''} · ${pose || 'idle'}${extra.seated ? ' · seated' : ''}`, x, 1062, 18);
    });
    SHEET.label(`body audit · ${name} · ${STYLE.mode}`, W - 160, 16, 16);
  };
  LOOPS.bodyAudit.len = 4;
})();

// verse1.js: V1a–V1j (bars 8–31, 14.5–56.6 s). Verse 1, hers: replaced at work by Copilot, the layoffs, HR, the Xbox
// bloke, the CV rally. Song time everywhere (t); every shot is a pure function of it. Every bot sincerely wants to help
// (the bot performance rule): its satisfaction is in the task, the harm stays visible, nobody gloats.
//   V1a  the tube train from I3 pulls out and uncovers her office, 8:59. The boss brings Copilot in; the clock clunks
//        onto 9 on "Nine"; Copilot hops onto her desk on "show"; she shrugs and types ("what you do") and Copilot copies
//        each move a beat late, thrilled to learn
//   V1b  "(Wow, cool!)": she says it, dry, to Copilot's star-eyed delight at having learned it (she narrates the verse off
//        screen and speaks only her asides on screen; the boss says both quoted lines: V1_HER_LIPS, V1_BOSS_LIPS). Then the day time-lapses (the clock spins, dusk
//        falls, Copilot takes over her keyboard, her chair, her look) and the hands clunk onto 5 on "Five". The boss holds
//        out a cardboard box ("We won't be needing you"); it lands in her arms on "(...oh.)" and she sinks (her plant
//        wilts). On "My replacement wrote my leaving card" Copilot hops to the desk's end and, sincerely considerate,
//        tucks the leaving card it made her (a gold star) into her box
//   V1c  cut on its turn back to the desk: beside it a stack of identical leaving cards grows, one for everyone it will
//        replace, while it signs the next ("You're one of a kind"). No wink
//   V1d  wide: she's at the door with her box. Copilot, helping, lays her work on the copier's glass, brings the lid down
//        and presses go ("Then it copied me"): the light floods out and the frame prints as a riso copy behind the bar;
//        copies of it in her look slide out, cheaper each time (coarser, fainter, crooked: the print decays, not the
//        bots); on "cheaper" a stack fans out of the tray; they fill the desk she left behind; she walks out
//   V1e  the falling paper chain carries into a banknote and lands in a queue winding back to the horizon. Dorsey winds
//        up an engraved clockwork shredder and lets it go on "Jack", steps back and turns to his phone; its rollers draw
//        the chain in, a worker a bite ("cuts four thousand"), then run on by themselves; the paper bits fountain up on
//        "watch", the share price grows out of the pile to his feet and carries him up and off the note on "soar"
//   V1f  a door swings across: HR. The Gemini twins in lanyards courteously hold the doors (polite smiles, a little bow);
//        the humans, card cut-outs with their boxes, are tipped out one per beat, faster and faster; hers is last, on
//        "door"; the camera pushes into the rainy doorway
//   V1g  the doorway's dark is her laptop's dark screen: the Xbox bloke lights it up and offers a controller; it pops out
//        of the screen (cut on action) and hugs her, trying its very best ("helps you cope": a squeeze)
//   V1h  "Can it write a cheque?": a blank engraved cheque drifts into her palm and drops away; the comfort bot, doing its
//        best, pours a paragraph of hope into her lap
//   V1i  a CV flies across the lens and wipes to a split screen: her Muse (Jolly, on the Charm in her hand) writes her CV, their Gemini
//        twins, applying their screening brief, bin it; then the procedure: her Muse sends it (thumbs up, "great fit"),
//        they catch it, screen it, and a red ✗ pops onto it ("No, you're not"), and back it comes
//   V1j  she moves to a stool at the split, her head swinging with it; on "automated" one coin starts their rejection
//        machine and the run goes on by itself, faster and faster, her Muse resending each time; mid-air the CV folds
//        into a paper plane and dives out of frame, down and out to the right (P1a picks it up landing in her notebook)
// Visual cuts land on the lyric phrases (the sung lines fall about a bar after the board's bar lines): a shot draws
// its predecessor's tail until its own incoming transition (CUT). Check it with video/dev-verse1.html.
(() => {
  // ================================================================================================================
  // timing
  // ================================================================================================================
  const wt = (p, i, fb) => { const v = typeof WT === 'function' ? WT(p, i) : null; return v == null ? fb : v; };
  const T = {
    nine: wt('Nine', 0, 16.26), just: wt('Nine', 2, 16.92), show: wt('Nine', 3, 17.10), it: wt('Nine', 4, 17.38), what: wt('Nine', 5, 17.48), do_: wt('Nine', 7, 17.78),
    wow: wt('Wow', 0, 18.23), cool: wt('Wow', 1, 18.63),
    five: wt('Five', 0, 19.73), clock5: wt('Five', 1, 20.03), we: wt('Five', 2, 20.41), needing: wt('Five', 5, 21.07), you: wt('Five', 6, 21.55),
    oh: wt('...oh', 0, 22.25),
    repl: wt('My replacement', 0, 22.83), wrote: wt('My replacement', 2, 23.71), card: wt('My replacement', 5, 24.41), youre: wt('My replacement', 6, 24.89), one: wt('My replacement', 7, 25.05), kind: wt('My replacement', 10, 25.33),
    then: wt('Then it', 0, 26.55), me: wt('Then it', 3, 27.19), cheaper: wt('Then it', 5, 27.73), desk: wt('Then it', 8, 28.61), left: wt('Then it', 10, 29.00), behind: wt('Then it', 11, 29.20),
    jack: wt('Jack', 0, 30.08), cuts: wt('Jack', 1, 30.32), four: wt('Jack', 2, 30.54), thousand: wt('Jack', 3, 30.74), watch: wt('Jack', 4, 31.64), share: wt('Jack', 6, 32.04), soar: wt('Jack', 8, 32.72),
    human: wt('Human', 0, 33.62), resources: wt('Human', 1, 34.08), showH: wt('Human', 2, 34.90), humans: wt('Human', 4, 35.32), door: wt('Human', 6, 36.22),
    xbox: wt('Xbox', 0, 36.84), bloke: wt('Xbox', 1, 37.52), reckons: wt('Xbox', 2, 37.98), ai: wt('Xbox', 3, 38.38), helps: wt('Xbox', 4, 39.06), cope: wt('Xbox', 6, 39.73),
    can: wt('Can it', 0, 40.39), cheque: wt('Can it', 4, 41.23), or: wt('Can it', 5, 41.87), para: wt('Can it', 8, 42.35), hope: wt('Can it', 10, 43.23),
    mybot: wt('My bot', 0, 43.65), writes: wt('My bot', 2, 44.11), cv: wt('My bot', 4, 44.55), their: wt('My bot', 5, 45.41), bins: wt('My bot', 7, 45.85), lot: wt('My bot', 9, 46.49),
    mine: wt('Mine', 0, 47.17), youre: wt('Mine', 2, 47.81), great: wt('Mine', 4, 48.09), fit: wt('Mine', 5, 48.49), theirs: wt('Mine', 6, 48.89), no: wt('Mine', 8, 49.55), not: wt('Mine', 10, 50.08),
    theyve: wt("They've", 0, 50.68), auto: wt("They've", 1, 50.96), touch: wt("They've", 8, 53.46),
    turns: wt('Turns out', 0, 54.16), no2: wt('Turns out', 3, 55.26), costing: wt('Turns out', 7, 56.12), much: wt('Turns out', 10, 57.28),
  };
  // Who speaks in the office (the user): Tess narrates the verse off screen, so on screen she says only her two asides,
  // "(Wow, cool!)" and "(...oh.)"; the boss says "Just show it what you do" and "We won't be needing you" (her voice, quoting him). Her
  // silent reactions keep her mouth shut (a surprised face's open mouth would read as her singing the narration)
  const V1_HER_LIPS = typeof lipPart === 'function' ? lipPart('v1 her asides', l => l.backing && /^(Wow|\.\.\.oh)/.test(l.text)) : false;
  const V1_BOSS_LIPS = typeof lipPart === 'function' ? lipPart('v1 boss', (l, i) => !l.backing && (l.text.startsWith('Nine o') || l.text.startsWith('Five o')) && i >= 2) : false;
  // The CV rally's quotes (the user): her Muse mouths "You're a great fit", their Gemini "No, you're not" (both twins, in
  // unison: one product, one script); Tess sings the rest of her lines on screen, her mouth shut through the quotes. The
  // bots aren't person() rigs: botLip() swaps their own mouth kinds from the lip-sync chart (lipAt), so each keeps its design
  const V1_MINE = l => l.text.startsWith('Mine says');
  // (and in V1j "We'll be in touch", their company's automated reply, the twins again in unison (the user, 2026-09-25))
  const V1_TOUCH = l => l.text.startsWith("They've automated");
  const V1_MUSE_LIPS = typeof lipPart === 'function' ? lipPart('v1 muse', (l, i) => V1_MINE(l) && i >= 2 && i <= 5) : null;
  const V1_GEM_LIPS = typeof lipPart === 'function' ? lipPart('v1 gemini', (l, i) => V1_MINE(l) && i >= 8 || V1_TOUCH(l) && i >= 5) : null;
  const V1_TESS_LIPS = typeof lipPart === 'function' ? lipPart('v1 tess', (l, i) => !l.backing && l.section === 'Verse 1' && !(V1_MINE(l) && (i >= 2 && i <= 5 || i >= 8)) && !(V1_TOUCH(l) && i >= 5)) : false;
  const BOT_LIP = { gemini: { m: 'flat', e: 'grin', a: 'open', aa: 'shout', o: 'O', u: 'o', ee: 'fixed', fv: 'teeth' },
    muse: { m: 'flat', e: 'grin', a: 'open', aa: 'shout', o: 'O', u: 'o', ee: 'grin', fv: 'teeth' } };
  const botLip = (tt, part, kind, base) => { if (!part || typeof lipAt !== 'function' || (typeof lipsLive === 'function' && !lipsLive())) return base; const s = lipAt(tt, part); return s && s !== 'rest' ? BOT_LIP[kind][s] || base : base; };
  const BT = n => BEATMAP.beats[Math.max(0, Math.min(BEATMAP.beats.length - 1, n))];
  const snapB = t => BT(Math.round(bpOf(t)));
  // where each shot's picture really starts (its incoming transition); before that it draws the shot before it
  const CUT = { c: 24.5, d: 25.9, e: 29.46, f: 33.3, g: 36.72, h: 40.14, i: 43.52, j: 50.42 };
  const HU = 30;   // the narrators' unit in the sets

  // ================================================================================================================
  // shared bits
  // ================================================================================================================
  const R4 = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const flat = (P, col, key, o = {}) => piece(P, col, { ink: null, key, lift: 0, flatCard: true, edge: false, ...o });
  // the red tube train from I3 (the same drawing), at x0 (its tail is at x0 + 3400); screen space
  function v1Train(x0) {
    look('card');
    const L = 3400, y0 = -40, y1 = H + 40;
    boilSeed('train');
    piece(U([[0, y0], [L, y0], [L, y1], [0, y1]], 1, x0, 0), '#B8303F', { sw: 2.4, key: 'trainbody', lift: 10 });
    piece(U([[0, 820], [L, 820], [L, 870], [0, 870]], 1, x0, 0), '#2A2630', { ink: null, key: 'trainskirt', lift: 2, flatCard: true });
    piece(U([[0, 120], [L, 120], [L, 150], [0, 150]], 1, x0, 0), '#F2ECE0', { ink: null, key: 'trainstripe', lift: 2, flatCard: true });
    for (let i = 0; i < 9; i++) {
      const wx = x0 + 120 + i * 360;
      if (wx > W + 40 || wx < -440) continue;
      if (i % 3 === 1) {
        piece(U([[0, 200], [180, 200], [180, 800], [0, 800]], 1, wx, 0), '#9C2432', { sw: 1.8, key: 'door' + i, lift: 4 });
        for (const dx of [20, 100]) piece(U([[0, 240], [60, 240], [60, 520], [0, 520]], 1, wx + dx, 0), '#F4E6B8', { sw: 1.4, key: 'dw' + i + dx, lift: 2 });
      } else {
        piece(U([[0, 240], [260, 240], [260, 560], [0, 560]], 1, wx, 0), '#F4E6B8', { sw: 1.6, key: 'win' + i, lift: 3 });
        const kind = i % 3, bx = wx + 130, by = 470;
        piece(U([[-90, 90], [90, 90], [90, 0], [-90, 0]], 1, bx, by - 20), '#3A3440', { ink: null, key: 'seat' + i, lift: 1, flatCard: true });
        if (kind === 0) piece(oval(bx, by - 60, 58, 52, 0, 24), '#5E5864', { ink: null, key: 'bh' + i, lift: 1, flatCard: true });
        else piece(U([[-55, 0], [55, 0], [55, -95], [-55, -95]], 1, bx, by - 10), '#5E5864', { ink: null, key: 'bh' + i, lift: 1, flatCard: true });
        if (kind === 0) { dline([[bx, by - 112], [bx + 6, by - 140]], 2, '#5E5864'); piece(oval(bx + 7, by - 146, 9, 9, 0, 12), '#FF4F9A', { ink: null, key: 'ant' + i, lift: 1, flatCard: true }); }
        for (const ex of [-20, 20]) piece(oval(bx + ex, by - 62, 7, 10, 0, 12), '#F4E6B8', { ink: null, key: 'be' + i + ex, lift: 0, flatCard: true });
      }
    }
    // its tail: the rear cab's end, a light
    piece(U([[L - 60, 180], [L, 180], [L, 800], [L - 60, 800]], 1, x0, 0), '#9C2432', { sw: 1.6, key: 'trainend', lift: 3 });
    piece(oval(x0 + L - 30, 700, 14, 14, 0, 14), '#FF5A4A', { sw: 1, key: 'traintail', lift: 2, flatCard: true });
  }
  // her plant (a spider plant: its leaves wilt with droop 0..1), for the box
  function v1Plant(x, y, s, key, droop = 0) {
    boilSeed(key);
    const leaves = [[-1, 60, 30], [1, 64, 28], [-1, 46, 52], [1, 44, 56], [-.2, 70, 8], [.35, 66, 14]];
    leaves.forEach(([d, h, sp], i) => {
      const dr = droop * (.6 + .4 * hash(i * 3.3)), hh = h * (1 - .55 * dr), spread = sp + 26 * dr;
      const pts = [[d * 4, -40], [d * spread * .5, -40 - hh * .8], [d * spread, -40 - hh * .7 + 30 * dr], [d * (spread + 14), -40 - hh * .3 + 70 * dr]];
      piece(ribbon(pts.map(([a, b]) => [x + a * s, y + b * s]), 7 * s, 1.2 * s), i % 2 ? PRO.plant : mixCol(PRO.plantLt, '#B8A860', dr * .5), { sw: .9, key: key + 'l' + i, lift: 2, flatCard: true });
    });
    piece([[-22, -44], [22, -44], [17, 0], [-17, 0]].map(([a, b]) => [x + a * s, y + b * s]), PRO.pot, { sw: 1.2, shade: PRO.potDk, depth: 8 * s, key: key + 'pot', lift: 3 });
    piece(R4(x - 24 * s, y - 48 * s, x + 24 * s, y - 40 * s), PRO.pot, { sw: 1, key: key + 'rim', lift: 2, flatCard: true });
  }
  // her box: an archive box with a hand-hole, her plant (wilting with droop), her mug and a photo; (x, y) = the middle of
  // its bottom edge, s = its width
  function v1Box(x, y, s, key, droop = 0, rot = 0) {
    const h = s * .62, sc = s / 160;
    push(); translate(x, y); if (rot) rotate(rot);
    boilSeed(key);
    piece([[-s * .36, -h - s * .2], [-s * .1, -h - s * .24], [-s * .08, -h + 10], [-s * .36, -h + 10]], '#3A3530', { sw: 1.1, key: key + 'fr', lift: 2, flatCard: true });
    flat([[-s * .32, -h - s * .16], [-s * .13, -h - s * .19], [-s * .12, -h], [-s * .32, -h]], '#9AB4C4', key + 'frp');
    v1Plant(s * .22, -h + 18 * sc, sc * 1.05, key + 'pl', droop);
    prMug(-s * .02, -h + 16 * sc, 34 * sc, key + 'mg');
    boilSeed(key + 'box');
    piece([[-s / 2, -h], [s / 2, -h], [s / 2 - 4, 0], [-s / 2 + 4, 0]], PRO.kraft, { sw: 1.4, shade: PRO.kraftDk, depth: s * .09, key: key + 'b', lift: 5 });
    piece(R4(-s / 2 - 2, -h - 2, s / 2 + 2, -h + s * .08), PRO.kraftLt, { sw: 1.1, key: key + 'rim', lift: 2, flatCard: true });
    piece(curvy([[-s * .14, -h + s * .15], [s * .14, -h + s * .15], [s * .14, -h + s * .22], [-s * .14, -h + s * .22]], 3), '#4A3622', { ink: null, key: key + 'hole', lift: 0, flatCard: true, edge: false });
    dline([[-s * .45, -h * .4], [s * .45, -h * .42]], .8, PRO.kraftDk);
    pop();
  }
  // a paper-doll chain of workers: n dolls from x0 (left hand) along y (the hands' line), each dw wide; per-doll state
  // from doll(i) → null (not drawn) or { dx, dy, rot } (cut and falling). Colours follow the look.
  function v1Doll(cx, cy, dw, key, col = '#E4D4B2') {
    const S = P => P.map(([a, b]) => [cx + (a - .5) * dw, cy + (b - .5) * dw]);
    piece(S([[0, .45], [.33, .43], [.4, .38], [.6, .38], [.67, .43], [1, .45], [1, .57], [.66, .6], [.69, 1.06], [.72, 1.44], [.56, 1.44], [.5, 1.1], [.44, 1.44], [.28, 1.44], [.31, 1.06], [.34, .6], [0, .57]]), col, { sw: 1.2, key: key + 'b', lift: 2 });
    piece(oval(cx, cy + (.22 - .5) * dw, .15 * dw, .16 * dw, 0, 16), col, { sw: 1.2, key: key + 'h', lift: 2 });
    dline(S([[.5, .44], [.47, .56], [.5, .8], [.53, .56], [.5, .44]]), .9, '#7A2A2A');   // a tie: a worker
  }
  // Poses for person(): a PPOSE name or { L, R } as 'u' targets (body units in the person's own frame), so named poses
  // and hand-placed ones blend (pPoses drops the 'u' flag and would mix the two spaces).
  function ppU(P, pose, o = {}) {
    const p = typeof pose === 'string' ? PPOSE[pose] : pose, Fr = personFrame(P, o), QS = o.view === 'q' ? PP_QS : 0, shX = P.top.sh[0];
    const conv = s => s[6] === 'u' ? s : [s[0] * shX + QS, s[1] >= 0 ? Fr.ys + s[1] * (Fr.yh - Fr.ys) : Fr.ys + s[1] * (Fr.ys - Fr.top), s[2], s[3], s[4], s[5], 'u', s[7]];
    return { L: conv(p.L), R: conv(p.R) };
  }
  function uPoses(P, o, t, keys, blend = .3) {   // (keeps a spec's reach, [7])
    const b = pPoses(t, keys.map(([t0, p]) => [t0, ppU(P, p, o)]), blend);
    return { L: [...b.L.slice(0, 6), 'u', b.L[7]], R: [...b.R.slice(0, 6), 'u', b.R[7]] };
  }

  // ================================================================================================================
  // THE OFFICE (V1a, V1b): one continuous day
  // ================================================================================================================
  const OF = OFFICE;
  const V1_BOSS = ppMerge(PP_BASE, { id: 'v1boss', name: 'the boss',
    body: { leg: 5.4, legW: .95, legW1: .8, legGap: .5, stance: .22, torso: 5.0, neck: .15, arm: 5.0, armW: 1.0, wrist: .78, hand: .82, foot: 1.3 },
    head: { w: 2.1, h: 4.5, crown: .9, cheek: 1.02, cheekY: .05, jaw: .98, jawY: .62, jawC: 1, chin: .66 },
    face: { eyeY: .02, gap: .4, eye: .4, tall: .9, lid: .1, lash: 1.1, browY: .3, browW: 1.1, brow0: [.1, .05], nose: { kind: 'round', w: .95, q: .26 }, noseY: .36, mouthY: .7, mouthW: .66, lips: .6, ear: 1, blush: .35 },
    hair: { style: 'part', hairline: -.42 },
    top: { kind: 'coat', neck: .75, sh: [2.35, .35], sharp: true, rows: [[2.45, 1.6], [2.7, 3.3], [2.55, 5.1, 1]], hemC: .12, collar: 'lapel', vDepth: 2.1, buttons: [[.1, 3.0], [.1, 4.0]], pocket: 4.3 },
    legs: { kind: 'trousers' }, shoes: { kind: 'point' },
    col: { skin: '#EBBFA2', skinDk: '#CB977A', skinLt: '#F6D6C2', lip: '#B86A5E', lipLt: '#C98474', blush: '#E08A7A', iris: '#4A6A8A', hair: '#8A7A6A', hairLt: '#B0A090', hairDk: '#5E5044', brow: '#6E6052',
      coat: '#3A4A6E', coatDk: '#26324E', coatLt: '#5E6E92', cuff: '#2E3C5C', under: '#EEF2F6', button: '#1E2436', trousers: '#34405E', trousersDk: '#222B42', shoe: '#2A1E1A', sole: '#1A1412', shoeLt: '#5A4A40' } });
  const OD = { train: [14.52, 15.34], enter: [15.3, 16.18], tl: [18.94, T.five] };
  const BOSS_X = 250, BOSS_Y = 946, CPF = [392, 948], CPD = [548, OF.deskTop.y], HERS = [1190, 944], BOSSS = [1450, 952], CH = OF.chair;
  const CPE = [978, OF.deskTop.y];   // the desk's right end: where Copilot hops to give her the card
  const CARD = { hop: [T.repl + .08, T.repl + .42], give: T.repl + .5, tuck: [T.wrote + .32, T.card - .06] };
  const tlStep = t => t < OD.tl[0] ? -1 : t >= OD.tl[1] ? 4 : Math.floor(4 * (t - OD.tl[0]) / (OD.tl[1] - OD.tl[0]));
  // Typing at her desk (the user: the hands were under the desk). Whoever sits in her chair has the hands on her keyboard
  // (OF.kbd, real size against them): the wrists level at its far edge (the typist's side), the fingers down on the keys
  // (hand 'keys': o.tap presses one finger at a time, on twos). The body stays behind the desk; the hands and forearms are
  // redrawn over the desk top (deskLate), the arms' own late layer, clipped at the desk's far edge so only what comes
  // forward over it moves in front.
  // Her: the elbows back at her sides just above the desk top, the upper arms going back and the forearms coming forward and
  // down over the desk to the keys (the arm at .47 of its length: foreshortened); u targets in her own frame. The wrists
  // drift a little across the keys every few drawings (t: on twos); on: how busy (.25: a key now and then as she looks up)
  const KB = OF.kbd, kbW = (KB.far - 11 - CH[1]) / HU;   // (the wrists' height: the cuffs just behind the keyboard, the hands on it)
  const herType = (t, on = 1) => { const n = Math.floor(t * 12 + 1e-6), d = s => on * .12 * (hash(Math.floor(n / 3) * 1.7 + s) - .5);
    return { L: [-.95 + d(-1), kbW, .06, 'keys', 1, Math.PI - 1.95, 'u', .47], R: [.95 + d(1), kbW, .06, 'keys', 1, 1.95, 'u', .47] }; };
  // (off the keys toward her lap: the hands lift back over the desk's far edge first, then drop behind it; blended straight
  // down to her lap they slid forward across the desk top to its front edge)
  const herLift = { L: [-1.05, -6.3, .1, 'keys', 1, 1.3, 'u', .45], R: [1.05, -6.3, .1, 'keys', 1, 1.84, 'u', .45] };   // (the typing hand, at rest: a relaxed hand draped past the keyboard)
  // Copilot in her chair, kneeling up on it to reach (seated in it, only its head showed over the desk): its seat height
  // (u), and its typing pose there (its own frame, in u: the ground point under the chair, the kneel lifting the body)
  const CPS = 5.5;
  const cpType = (seatH, t, busy = 1) => { const n = Math.floor(t * 12 + 1e-6), y = (KB.far - 4 - CH[1]) / HU + seatH - 1.02, d = s => busy * .1 * (hash(n * 1.3 + s) - .5), dip = s => .06 * (hash(n * 2.9 + s * 5) > .55);
    return { L: [-1.2 + d(-1), y + dip(-1), .4, 'keys', 1, Math.PI - 1.85], R: [1.2 + d(1), y + dip(1), .4, 'keys', 1, 1.85] }; };   // (its noodle arms bowed out past its sides: straight down its front they vanished into the suit)
  // the late layer: hands and forearms on her desk top, clipped to what's in front of its far edge
  const deskLate = fns => { if (fns.length) clipPoly(R4(OF.deskTop.x0 - 40, OF.deskTop.far - 1.5, OF.deskTop.x1 + 40, OF.deskTop.front + 60), () => fns.forEach(f => f())); };
  // carrying a box: the box centre bx, by (u, own frame); the hands on its sides
  const carry = (bx, by, w = 2.6) => ({ L: [bx - w, by + .2, .35, 'hold^', 1, -.15, 'u'], R: [bx + w, by + .2, .35, 'hold^', 1, Math.PI + .15, 'u'] });   // (thumbs over the top)
  const BOXW = 150, BOXC = [2.0, -8.9], BOXH = BOXW / 2 / HU;   // her box: its width, its centre in her frame when she carries it (the bottom at BOXC[1] + 1.9), its half-width (u)
  // Her carrying her box (the user: the arms hung straight behind it, the hands out of sight, so it floated). She holds it
  // the way people do: by its ends, low on its sides (the boss holds it higher up them), the fingers round onto its face,
  // the elbows bent at her sides and the forearms coming forward to it; held a little higher than it was. The depth order is
  // one throughout, the pick-up included: her near arm (L) in front of the box and all of it (redrawn after it, o.late
  // 'arm', foreshortened: coming toward us round the box's near end), her far arm behind it with only its hand coming round
  // the far end (o.late 'hand', once it has hold). (Under the bottom corners, the arms hung nearly straight with the elbows
  // in; gripped at mid-height at full length the near elbow jutted out sideways and the far hand was hidden.) herGrip(fx,
  // fb): the box's bottom middle in her frame (u, before a flip).
  // (her shoulders, the arms' roots in 3/4, her frame: what she can reach. The near arm is foreshortened as it comes
  // round the box's near end up close, and reaches out full length for it at the boss's arm's length)
  const HER_SH = (() => { const Fr = personFrame(HER_C, { view: 'q' }), y = Fr.ys + Math.max(HER_C.top.sh[1], .15) + HER_C.body.armW * .4, x = HER_C.top.sh[0] - HER_C.body.armW * .42;
    return { L: [-x * .93 + PP_QS, y], R: [x * .97 + PP_QS, y] }; })();
  const herGrip = (fx, fb) => { const L = [fx - BOXH - .2, fb - 1.5], d = Math.hypot(L[0] - HER_SH.L[0], L[1] - HER_SH.L[1]);
    return { L: [...L, .1, 'hold^', 1, 1.35, 'u', clamp(d / (HER_C.body.arm * .9), .66, 1)], R: [fx + BOXH + .2, fb - 1.5, .15, 'hold^', 1, 1.7916, 'u'] }; };   // (thumbs over the top: the user)
  const herCarry = () => herGrip(BOXC[0], BOXC[1] + 1.9);
  const herReaches = (spec, s) => { const r = HER_SH[s < 0 ? 'L' : 'R']; return Math.hypot(spec[0] - r[0], spec[1] - r[1]) <= HER_C.body.arm * (spec[7] ?? 1) * .96; };
  const boxAt = (x, y, flip) => [x + (flip ? -1 : 1) * BOXC[0] * HU, y + (BOXC[1] + 1.9) * HU];   // its bottom middle (world)
  const odCam = t => kf(t, [
    [14.52, [872, 512, 1.1]], [16.7, [860, 518, 1.13]], [17.5, [650, 556, 1.46]], [18.2, [606, 552, 1.74]],
    [OD.tl[0] - .01, [600, 552, 1.8]], [OD.tl[0], [880, 512, 1.1]],   // (a cut to the wide as the time-lapse starts)
 [T.five + .3, [884, 512, 1.12]], [T.we + .1, [1210, 556, 1.4]], [T.oh, [1200, 560, 1.46]], [T.repl + .3, [1085, 590, 1.7]], [CUT.c, [1075, 596, 1.76]]]);
  function v1Office(t) {
    look('card');
    const tt = mt(t), st = tlStep(tt), day = tt >= OD.tl[1];
    // the clock: 8:59 until "Nine" (it clunks on), then the time-lapse spins it to 5 (it clunks again on "Five")
    let hh = 8, mm = 59, secs = true;
    if (tt >= T.nine - .05 && tt < OD.tl[0]) mm = 59 + backOut(seg(tt, T.nine - .05, T.nine + .12));
    else if (st >= 0 && st < 4) { const hrs = lerp(9, 17, seg(tt, OD.tl[0], OD.tl[1])); hh = Math.floor(hrs); mm = (hrs - hh) * 60; secs = false; }
    else if (day) { hh = 17; mm = -2.2 * spring(tt, T.five, 6, 26) + (tt - T.five) * .5; }
    const dusk = day ? 1 : st >= 0 ? seg(tt, OD.tl[0], OD.tl[1]) : 0;
    // (the time-lapse, one change a step: her keyboard (0), her chair (1), her look (2), then the boss with her things
    // boxed (3); the boss used to arrive with the look and step in again on the next)
    const packed = st >= 3;
    // (the camera on ones, from song time: puppets on twos, camera on ones; its cut to the wide waits for the time-lapse's
    // first stepped frame, so the two land together)
    const cam = odCam(tt < OD.tl[0] ? Math.min(t, OD.tl[0] - .01) : t), shk = day ? spring(t, T.five, 9, 40) * 4 : 0;
    camBegin(cam[0], cam[1] + shk, cam[2] + .004 * Math.sin(t * .7));
    officeBack(tt, tt, { clock: [hh, mm], seconds: secs, dusk, screenGlow: 1 });
    // ---- Copilot: in with the boss, onto the desk on "show", copying her every move, thrilled to learn; through the
    // time-lapse it learns her job (and her look); at five it's in her chair; then it makes her a card ----
    const cpo = { boilKey: 'v1cp', t: tt };
    let cp = null;   // [x, y, opts, layer: 'chair' | 'desk' | 'floor']
    const cpLate = [], herLate = [];   // (hands on her keyboard, redrawn over the desk top: deskLate)
    const boxLate = [];   // (hands on her box, redrawn over it)
    // (its hops: no shadow of its own in the air (it hung under its feet, over the window view); instead the shadow where
    // it took off fades, and one grows where it will land as it comes down: hopSh { off: [x, y], on: [x, y], k })
    let hopSh = null;
    const shade = (P, k) => { if (P && k > .02) paint(oval(P[0], P[1] + .1 * HU, 1.9 * HU * lerp(.5, 1, k), .32 * HU * lerp(.5, 1, k), 0, 24), { wash: NOIR.ink, washOp: 110 * k, ink: null }); };
    if (st < 0) {
      const eP = seg(tt, 15.36, 16.2);
      if (tt < 16.2) {   // trotting in behind the boss
        cp = [lerp(-280, CPF[0], ease(eP)), CPF[1], { ...feel('excited', tt), emote: null, walk: eP > 0 && eP < 1 ? tt * 3.2 : null, view: eP < 1 ? 'q' : 'front', lookX: .4 }, 'floor'];
      } else {
        const j0 = T.just + .1, j1 = T.show + .2, k = seg(tt, j0, j1), J = jump(tt, j0, j1, 0);   // (it takes off once the boss's arm is back in: .06 s later)
        const p = tt < j0 ? CPF : tt < j1 ? arcPt(CPF, CPD, 150, k) : CPD;
        const mood = emotions(tt, [[0, 'happy', { lookX: .5, lookY: -.3 }], [T.nine - .05, 'excited', { emote: null }], [j1, 'happy', { lookX: .7 }], [T.what + .2, 'thinking', { lookX: .7, emote: null }], [T.do_ + .14, 'determined', { lookX: .5, lookY: .5 }], [T.wow, 'starstruck'], [T.cool + .3, 'excited', { emote: 'spark' }]]);
        // the mimic: her shrug, then her typing, a beat late each; then "Wow, cool!": thrilled to have learned it
        // (its hello: the wave with its far hand, out clear of its goggles, the near one down; waving the near hand, its glove
        // sat on the edge of her glasses' lens)
        const wave = { L: [-3.05 + .35 * Math.sin(tt * TAU * 2.4), -6.0, .25, 'open', 1], R: [1.95, -1.6, .2, 'relax'] };
        const pose = tt < j1 + .1 ? 'idle' : tt < T.what + .2 ? wave : tt < T.do_ + .14 ? 'shrug' : tt < T.wow ? 'typing' : 'cheer';
        const hop = jump(tt, T.cool, T.cool + .32, 1.6);
        const air = tt >= j0 && tt < j1;
        if (air) hopSh = { off: CPF, on: CPD, k };
        cp = [p[0], p[1], { ...mood, dy: (mood.dy || 0) + hop.dy, sq: (mood.sq || 0) + J.sq + hop.sq, pose, rot: air ? -.25 * Math.sin(k * Math.PI) : 0, noShadow: air }, p[1] < OF.deskTop.y + 30 ? 'desk' : 'floor'];
      }
    } else if (st === 0) cp = [CPD[0], CPD[1], { ...feel('excited', tt), emote: null, pose: 'typing' }, 'desk'];
    else if (tt < CARD.hop[0]) {   // (in her chair, kneeling up on it, typing fast on her keyboard; from "oh" it turns to her)
      const mood = st < 4 ? feel('determined', tt) : emotions(tt, [[0, 'happy'], [T.oh + .05, 'sad', { lookX: 1, lookY: -.2, emote: null }], [T.repl - .05, 'idea', { lookX: 1, emote: null }]]);
      const typing = tt <= T.oh;
      cp = [CH[0], CH[1], { ...mood, seated: true, chair: false, seatH: CPS, pose: typing ? cpType(CPS, tt) : 'idle', tap: tt * 12, disguise: st >= 2, view: typing ? 'front' : 'q', late: typing ? { L: 'arm', R: 'arm', out: cpLate } : null }, 'chair'];
    } else {   // a hop over to the desk's end with the card it made her; it offers it, then tucks it into her box
      const k = seg(tt, CARD.hop[0], CARD.hop[1]), J = jump(tt, CARD.hop[0], CARD.hop[1], 0), from = [CH[0], CH[1] - (CPS - 1.3) * HU];
      const p = k < 1 ? arcPt(from, CPE, 260, k) : CPE;
      const mood = emotions(tt, [[0, 'idea'], [CARD.hop[1], 'hopeful', { lookX: .9, lookY: -.2 }], [CARD.tuck[1], 'happy', { lookX: .8 }], [CUT.c - .1, 'happy', { lookX: -.6 }]]);
      const tuck = tt >= CARD.tuck[0], reach = { L: [1.9, -2.6, .3, 'hold', 1, .2], R: [3.2, -2.7, .25, 'hold', 1, .1] };
      if (k < 1) hopSh = { off: null, on: CPE, k };   // (it took off from her chair, behind the desk: its shadow there is hidden)
      cp = [p[0], p[1], { ...mood, emote: null, sq: (mood.sq || 0) + J.sq, disguise: true, view: 'q', pose: tuck ? (tt < CARD.tuck[1] ? reach : 'idle') : 'present', card: !tuck, noShadow: k < 1 }, 'desk'];
    }
    if (cp && cp[3] === 'chair') copilot(cp[0], cp[1], HU, { ...cpo, ...cp[2] });
    // ---- her, at her desk (seated) until the time-lapse ----
    const herStand = st >= 1;
    if (!herStand) {
      const mood = emotions(tt, [[0, 'happy'], [T.nine - .06, 'neutral', { lookX: .9, lookY: -.8 }], [T.nine + .42, 'neutral', { lookX: -1, lookY: -.1 }],
        [T.just + .12, 'suspicious', { lookX: -.8, lookY: .1 }], [T.what, 'bored', { lookX: -.6, lookY: .2 }], [T.do_ + .05, 'neutral', { lookX: -.1, lookY: .7 }],
        [T.wow + .12, 'bored', { lookX: -.7, lookY: 0 }], [T.cool + .25, 'smug', { lookX: .15, lookY: 0 }]], { take: .5 });
      const so = { seated: true, seatH: CH[3] }, up = { L: [-1.6, -7.6, .45, 'open', 1, -1.6, 'u'], R: [1.7, -7.7, .45, 'open', 1, -1.55, 'u'] };
      // (from "Wow" her near hand rests in her lap, the other typing on: typing, it reached down under Copilot's shoes on
      // the desk, never seen, and showed as a bare cuff by the mug when Copilot hopped)
      // (each key says which hands are on the desk top, redrawn over it: on the keys, or lifting back off them; the lap and
      // the shrug are behind it)
      const HK = [[0, herType(tt), 'LR'], [T.nine - .06, herType(tt, .25), 'LR'], [T.nine + .45, herLift, 'LR'], [T.nine + .6, 'lap', ''], [T.what - .02, 'shrug', ''], [T.do_, herType(tt), 'LR'],
        [T.wow - .12, { L: herLift.L, R: herType(tt).R }, 'LR'], [T.wow + .03, { L: PPOSE.lap.L, R: herType(tt).R }, 'R']];
      let hk = 0; while (hk + 1 < HK.length && tt >= HK[hk + 1][0]) hk++;
      const onKeys = st === 0 ? 'LR' : HK[hk][2];
      let pose = st === 0 ? herType(tt * 1.4, .6) : uPoses(HER_C, so, tt, HK.map(([t0, p]) => [t0, p]), .22);
      // (the shrug's in-between drawings, on "What" up out of her lap and on "do" back down to the keys, the hands going
      // round the outside of an arc so her elbows stay down and out: up, the hands already out by her shoulders, the elbows
      // down by her sides; down, the forearms swung in level toward the keys. Blended straight, the hands passed close
      // under her shoulders: going up her forearms crossed in an X over her chest, the elbows folded in (17.50); coming
      // down both elbows flared out at shoulder height (17.83))
      const midMove = t0 => { const k = seg(tt, t0, t0 + .22); return k > 0 && backOut(k) < .95; };
      if (st !== 0 && midMove(T.what - .02)) pose = { L: [-3.0, -8.1, .45, 'open', 1, null, 'u'], R: [3.0, -8.1, .45, 'open', 1, null, 'u'] };
      else if (st !== 0 && midMove(T.do_)) pose = herLift;   // (over the desk's far edge, the elbows at her sides: the hands coming forward onto the keys)
      // (her typing: a finger a drawing or so; slower as she looks up at the clock)
      const tap = tt * (tt >= T.nine - .06 && tt < T.nine + .45 ? 3 : 8);
      person(CH[0], CH[1], HU, HER_C, { ...mood, ...so, pose, tap, boilKey: 'v1her', sing: V1_HER_LIPS, late: { L: onKeys.includes('L') && 'arm', R: onKeys.includes('R') && 'arm', out: herLate } });
    }
    let cpHand = null;   // (its hand this frame: the leaving card leaves from it)
    officeFront(tt, tt, { clock: [hh, mm], plant: !packed, mug: !packed, onDesk: () => {
      deskLate(herLate.concat(cpLate));   // (hands on her keyboard: hers, or Copilot's in her chair)
      if (hopSh) shade(hopSh.on, ease(seg(hopSh.k, .35, 1)));
      if (cp && cp[3] === 'desk') { const r = copilot(cp[0], cp[1], HU, { ...cpo, ...cp[2] }); cpHand = r && r.hands && r.hands.R; } } });
    if (hopSh) shade(hopSh.off, 1 - seg(hopSh.k, 0, .3));
    if (cp && cp[3] === 'floor') copilot(cp[0], cp[1], HU, { ...cpo, ...cp[2] });
    // ---- the boss: brings Copilot in; at five he holds out the box ("We won't be needing you"); it lands on "...oh." ----
    const XF0 = [T.you + .12, T.oh];   // the box changes hands
    let bossAt = null, box = null;
    if (st < 0) {
      const eP = seg(tt, OD.enter[0], OD.enter[1]), x = lerp(-200, BOSS_X, ease(eP));
      const mood = emotions(tt, [[0, 'happy', { eyes: 'normal', mouth: 'grin', lookX: .4 }], [T.nine + .1, 'happy', { eyes: 'normal', mouth: 'grin', lookX: .8, lookY: .4 }], [T.what - .05, 'happy', { eyes: 'normal', mouth: 'grin', lookX: .9, lookY: 0 }], [T.wow + .1, 'happy', { mouth: 'grin', emote: null }]], { take: .4 });
      // (his other hand goes into his pocket as he presents it: pleased with himself; it hung dead at his side)
      const pk = PPOSE.pockets.L, present = { L: pk, R: [2.6, .48, .15, 'open', 1, .35] }, toDesk = { L: pk, R: [1.85, .45, .2, 'open', 1, -.05] };
      const thumbs = { L: pk, R: [2.2, -.1, .3, 'thumb', 1, -.4] };
      // (the presenting sweep: his hand comes up to his chest, then up and out over Copilot's head, held a touch high (its cuff sat
      // on the cap; blended straight out from his side, where Copilot stands, the hand crossed its goggles); then back to
      // his chest, fingers up, before Copilot hops for the desk (held out over its head, Copilot rose through his forearm,
      // and his chest hand's fingers poked over its goggles), and pointed at the desk once it has landed)
      const raise = { L: pk, R: [.6, .5, .35, 'open', 1, -.2] }, over = { L: pk, R: [1.9, .12, .25, 'open', 1, -.4] }, chestUp = { L: pk, R: [.5, .45, .35, 'open', 1, -1.35] };
      const pose = pPoses(tt, [[0, 'low'], [T.nine + .04, raise], [T.nine + .2, over], [T.nine + .36, present], [T.just - .1, chestUp], [T.show + .2, toDesk], [T.wow + .1, thumbs]], tt < T.wow ? .16 : .3);
      bossAt = [x, BOSS_Y, { ...mood, view: 'q', walk: eP > 0 && eP < 1 ? x / (6.7 * HU) : null, pose: eP < 1 ? null : pose }];
    } else if (st >= 3) {
      const out = seg(tt, T.repl, T.repl + .9), bx = BOSSS[0] + 520 * ease(out);
      const fwd = day ? ease(seg(tt, T.five + .45, T.we + .1)) : 0, xk = seg(tt, XF0[0], XF0[1]), done = tt >= XF0[1];
      const mood = emotions(tt, [[0, 'neutral', { mouth: 'smile' }], [T.we, 'neutral', { mouth: 'smile', lookX: .3 }], [XF0[1] + .1, 'neutral', { mouth: 'smile', lookX: -.4, lookY: .2 }], [T.repl, 'neutral', { mouth: 'flat', lookX: -.9, lookY: .3 }]], { take: .3 });
      const hold = (bx2, by2) => ({ L: [bx2 - 2.75, by2 - .5, .35, 'hold^', 1, 1.35, 'u'], R: [bx2 + 2.75, by2 - .5, .35, 'hold^', 1, 1.7916, 'u'] });   // (thumbs over the top)
      // (he holds it out as he starts to speak, and lower: held up at his chest the plant's leaves crossed his mouth through
      // "We won't be needing you", the line he's lip-syncing)
      const bxu = 2.6 + 1.1 * fwd, byu = -9.0 + .95 * fwd;   // (2.6: at 3.0 the box's far end was past his reach, and his far hand stopped short on its face, detached: the user)
      const pose = done ? uPoses(V1_BOSS, { view: 'q' }, tt, [[0, hold(bxu, byu)], [XF0[1] + .05, 'belly']]) : hold(bxu, byu);
      // (his fingers round the box's ends, over its face, while he holds it out; once it's on its way to her his hands are
      // behind it, letting go)
      const grip = !done && xk <= 0 && 'hand';
      bossAt = [bx, BOSSS[1], { ...mood, view: 'q', flip: true, pose, walk: out > 0 && out < 1 ? -out * 2.4 : null, late: { L: grip, R: grip, out: boxLate } }];
      if (!done) box = { from: [bx - bxu * HU, BOSSS[1] + (byu + 1.9) * HU], k: xk };
    }
    // ---- her, standing from the time-lapse on: she takes the box (it lands on "oh"), turns back to her desk ----
    if (herStand) {
      const turned = tt >= T.oh + .38, turnF = tt >= T.oh + .3 && tt < T.oh + .38;
      const mood = st < 4 ? { ...feel(st === 1 ? 'bored' : 'suspicious', tt), lookX: -.6 } : emotions(tt, [[0, 'suspicious', { lookX: .6 }], [T.we + .05, 'neutral', { lookX: .9, lookY: -.2 }], [T.needing + .1, 'surprised', { lookX: .6, lookY: .3, emote: null, mouth: 'flat' }],
        [T.oh - .04, 'sad', { lookX: .2, lookY: .9, emote: null }], [T.oh + .38, 'sad', { lookX: .6, lookY: .1, emote: null }], [CARD.hop[1], 'surprised', { lookX: .8, lookY: .3, emote: null, mouth: 'flat' }], [CARD.tuck[1], 'sad', { lookX: .6, lookY: .8, emote: null }]], { take: .6 });
      const got = day && tt >= XF0[1], sink = got ? .12 * Math.exp(-5 * (tt - XF0[1])) * Math.cos(12 * (tt - XF0[1])) + .06 : 0;
      // the box first (from the boss's hands into hers, landing on "oh"; then in her arms), so her hands can hold it wherever
      // it is: from "you" she reaches for its ends, her near hand round the near end, the far one coming round the far end
      // once it has hold (as the box comes to her)
      const hb = boxAt(HERS[0], HERS[1] + sink * 30, turned);
      if (box && box.k > 0) { const bk = easeIn(box.k); box.at = [lerp(box.from[0], hb[0], bk), lerp(box.from[1], hb[1], bk) - 30 * Math.sin(box.k * Math.PI)]; }
      else if (got) box = { at: hb };
      let pose = 'cross', late = null;
      if (st >= 4) {
        const at = box ? box.at || box.from : hb, dy = (mood.dy || 0) * 1.1, grip = herGrip((at[0] - HERS[0]) / HU * (turned ? -1 : 1), (at[1] - HERS[1]) / HU - dy);
        const R0 = T.you - .05, hold = tt >= R0 + .3;   // (her hands there once the reach has blended in)
        pose = uPoses(HER_C, { view: 'q' }, tt, [[0, 'low'], [R0, grip]]);
        late = { L: tt >= R0 && 'arm', R: hold && herReaches(grip.R, 1) && 'hand', out: boxLate };
      }
      person(HERS[0], HERS[1], HU, HER_C, { ...mood, sq: (mood.sq || 0) + sink, view: turnF ? 'front' : 'q', flip: st < 4 || turned, tilt: got ? .1 : 0, pose, late, boilKey: 'v1herS', sing: V1_HER_LIPS });
    }
    if (box && !box.at) box.at = box.from;
    if (bossAt) person(bossAt[0], bossAt[1], HU, V1_BOSS, { ...bossAt[2], boilKey: 'v1boss', sing: V1_BOSS_LIPS });
    if (box) {
      v1Box(box.at[0], box.at[1], BOXW, 'v1box', day ? ease(seg(tt, T.oh - .05, T.oh + .5)) : 0);
      boxLate.forEach(f => f());   // (the hands holding it, over it)
      // the leaving card, tucked into her box by Copilot (standing up in it, its gold star to us)
      if (tt >= CARD.tuck[0]) {
        // (a little toss from its outstretched hand: its arms don't reach the box, and the card used to glide there from a
        // fixed point off its hand; now it leaves the hand, arcs over and drops in)
        const k = seg(tt, CARD.tuck[0], CARD.tuck[1]), inBox = [box.at[0] + 18, box.at[1] - BOXW * .62 - 22], hand = cpHand || [CPE[0] + 2.5 * HU, CPE[1] - 3.3 * HU];
        const cx = lerp(hand[0], inBox[0], easeOut(k)), cy = lerp(hand[1], inBox[1], k * k) - 44 * Math.sin(Math.PI * k);
        boilSeed('v1lcard'); push(); translate(cx, cy); rotate(.08 * k - .35 * Math.sin(Math.PI * k)); b2LeavingCard(70, 'v1lc', .9); pop();
      }
    }
    camEnd();
    // the time-lapse: a frame flicker on each jump
    if (st >= 0 && st < 4) flash(.1 * Math.exp(-(tt - (OD.tl[0] + st * (OD.tl[1] - OD.tl[0]) / 4)) * 18), '#FFF6E0');
  }
  SHOT.V1a = (t, lt) => {
    v1Office(t);
    const k = seg(t, OD.train[0], OD.train[1]);
    if (k < 1) v1Train(-900 - 3500 * k * k);   // in: the train from I3 pulls out and uncovers the office
  };
  SHOT.V1b = t => v1Office(t);

  // ================================================================================================================
  // V1c: the contradiction, without a wink: back at the desk, a stack of identical leaving cards grows beside it (one
  // for everyone it will replace) while it sincerely signs the next ("You're one of a kind")
  // ================================================================================================================
  const STACK = { x: 872, y: OF.deskTop.y, n0: 9, n1: 34 };
  // the stack's cards, n of them: shingled so every card's star shows (V1c grows it; V1d's wide keeps the finished one)
  const stackCard = i => [STACK.x + 3 * Math.sin(i * 1.3) + (i % 2 ? 2 : -2), STACK.y - 20 - i * 8.2, -.05 + .1 * hash(i * 2.3)];
  function v1StackCards(n) {
    for (let i = 0; i < n; i++) { const [x, y, r] = stackCard(i); boilSeed('v1stk' + i);
      push(); translate(x, y); rotate(r); b2LeavingCard(64, 'v1stk' + i, .7); pop(); }
  }
  function v1Stack(t) {
    look('card');
    const tt = mt(t), cam = kf(t, [[CUT.c, [924, 606, 2.3]], [CUT.d, [912, 592, 2.42]]]);   // (the camera on ones)
    camBegin(cam[0], cam[1], cam[2]);
    officeBack(tt, tt, { clock: [17, 7 + (tt - CUT.c) * .5], dusk: 1 });
    officeFront(tt, tt, { clock: [17, 7], plant: false, mug: false, onDesk: () => {
      // the stack: shingled so every card's star shows; it grows a card at a time (quicker and quicker)
      const k = seg(tt, CUT.c, CUT.d - .25), n = Math.floor(lerp(STACK.n0, STACK.n1, 1 - Math.pow(1 - k, 1.6)));
      v1StackCards(n);
      // Copilot at the desk's end, signing the next one and adding it, pleased with the job
      const beat = frac((tt - CUT.c) * 3.4), leave = seg(tt, CUT.d - .3, CUT.d), add = beat > .7 && leave <= 0;
      const mood = add ? feel('happy', tt, { lookX: -.6, lookY: -.2, emote: null }) : feel('neutral', tt, { eyes: 'narrow', mouth: 'smile', lookX: -.6, lookY: .7 });
      // (flipped to face the stack: in its own frame +x points at it)
      const signP = { L: [2.0, -2.8, .3, 'hold', 1, .2], R: [1.1 + .2 * Math.sin(tt * TAU * 6), -2.6, .3, 'hold', 1, .6] };
      const addP = { L: [2.9, -3.7 - .3 * (beat - .7) / .3, .25, 'hold', 1, -.25], R: [1.5, -2.2, .3, 'relax', 1, .4] };
      // (then it picks up her work from the in-tray and hops off to the copier: the cut on action into V1d)
      const J = jump(tt, CUT.d - .3, CUT.d + .1, 0), hp = leave > 0 ? arcPt(CPE, [CPE[0] + 560, CPE[1] - 20], 110, seg(tt, CUT.d - .3, CUT.d + .1)) : CPE;
      const carryP = { L: [-1.6, -3.9, .25, 'hold', 1, Math.PI + .3], R: [1.5, -1.7, .3, 'relax'] };
      copilot(hp[0], hp[1], HU, { ...(leave > 0 ? feel('determined', tt, { emote: null }) : mood), sq: J.sq, emote: null, disguise: true, view: 'q', flip: leave <= 0, pose: leave > 0 ? carryP : add ? addP : signP, card: false, boilKey: 'v1cpS', t: tt,
        holdL: leave > 0 ? s => { push(); rotate(.3); v1Work(s * 2.2, 'v1wkC'); pop(); } : s => { push(); rotate(.3); b2LeavingCard(s * 2.2, 'v1stkH', .7); pop(); },
        hold: add || leave > 0 ? null : s => { push(); rotate(-.9); piece(ribbon([[-s * .2, 0], [s * 1.2, 0]], s * .18, s * .1), '#26358C', { sw: .8, key: 'v1pen', lift: 2, flatCard: true }); pop(); } });
    } });
    camEnd();
  }
  SHOT.V1c = t => { if (t < CUT.c) { v1Office(t); return; } v1Stack(t); };

  // ================================================================================================================
  // V1d: the copier. Copilot, helping, copies her work; out come copies of her (Copilot in her look), each one cheaper
  // (the print decays: coarser, fainter, crooked), filling her desk
  // ================================================================================================================
  const CPR = OF.copierAt, DOOR = [1818, 876];
  const COPY = { flash: [T.then, T.then + .36], sweep: [T.then + .36, T.then + .7] };
  const FEED = { place: [CUT.d + .05, CUT.d + .3], lid: [CUT.d + .32, CUT.d + .55], go: T.then - .08 };
  const CPOP = [1598, 548];   // Copilot on the copier's control-panel end
  // the copies: when each comes out of the tray, where it lands, how cheap it is, and its pose there
  const COPIES = [
    { out: T.me + .02, to: [972, OF.deskTop.y], cheap: .1, pose: 'typing', gen: 1 },
    { out: T.cheaper, fan: 0, to: [CH[0], CH[1]], seat: CPS, cheap: .3, pose: 'typing', gen: 2 },   // (in her chair, kneeling up to her keyboard, as Copilot did)
    { out: T.cheaper, fan: 1, to: [506, OF.deskTop.y], cheap: .45, pose: 'typing', gen: 3 },
    // (on top of the stack of leaving cards V1c left on her desk: it used to wave from the monitor's top, where the stack stands)
    { out: T.cheaper, fan: 2, to: [stackCard(STACK.n1 - 1)[0], stackCard(STACK.n1 - 1)[1] - 21], cheap: .6, pose: 'wave', gen: 4 },
    { out: T.cheaper, fan: 3, to: [800, 972], cheap: .8, pose: 'typing', gen: 5 },
  ];
  const X0 = { ...XEROX };
  // each generation: coarser dots, further out of register, and paler (every colour lifted toward the paper)
  function v1Gen(g, draw, regX = 0) {   // (nests: a copy of a copy; restores what it found. regX: extra misregistration, px)
    const prev = { ...XEROX };
    Object.assign(XEROX, X0, { cell: X0.cell + .9 * g, reg: X0.reg + 1.6 * g + regX, grit: X0.grit * (1 + .25 * g) });
    const sp = piece, lift = g * .07;
    if (g > 0) piece = (P, c, o = {}) => sp(P, mixCol(c, '#F1ECDF', lift), o);
    try { draw(); } finally { piece = sp; Object.assign(XEROX, prev); }
  }
  // The riso has no black drum: a ground shadow (a rig's wash of NOIR.ink) prints as a screen of the blue drum laid over
  // what's under it (multiplied: the carpet's dots show through), as dark as the shadow is. The process print crushed it
  // to all three drums solid, a black oval with no dots
  // (and her chair's castors, near-black rubber, print in the blue drum too: crushed to all three drums they printed as
  // black blobs)
  function v1RisoShadows(draw) {
    const p0 = paint, pc0 = piece, blue = XEROX.process && XEROX.process.find(d => d[0] === 'c');
    paint = (P, o = {}) => blue && STYLE.mode === 'xerox' && o.wash === NOIR.ink && o.ink === null ? halftone(P, .55 * clamp((o.washOp ?? 255) / 150), blue[1], XEROX.cell, blue[2]) : p0(P, o);
    piece = (P, c, o = {}) => pc0(P, c, blue && typeof o.key === 'string' && o.key.startsWith('pro-chw') ? { ...o, spot: { channel: 'c', tone: .7 } } : o);
    try { draw(); } finally { paint = p0; piece = pc0; }
  }
  // Each copy is printed into being: it slides out of the tray as a sheet, the sheet stands up off the floor hinged at its
  // bottom edge (a small overshoot and settle), and the copier's light bar runs up through it: behind the bar the copy is
  // printed, ahead of it the sheet is still blank; the drums slip into register just after (the cheaper, the further
  // out). Then it hops off to its place, landing on "copied me" / "cheaper" as before. (It used to pop upright from the
  // flat sheet in .12 s: one or two drawings, so it just appeared.) The sheet's rise on twos, the light bar on ones.
  // State at tt (t: song time, for the bar): null, the sheet { sheet, stand (hinge 0..1, past 1 on the overshoot), bar
  // (0..1 up the sheet), rot, regX }, in the air { air, from }, or landed.
  // (V1_PRINT: from the stand's start, the rise and the light bar's run. printSheet(c): the sheet standing, [w, h], sized to
  // the copy it prints with a small margin (the copy is 9.35 u to the top of its bun; ~4 u across the wig), a narrower
  // sheet and a thinner margin the cheaper it is. A 205 px sheet stopped at its goggles, so its head popped in after)
  const V1_PRINT = { rise: .24, bar: [.04, .3] }, printSheet = c => [(4.2 - 1.1 * c.cheap) * HU, (9.62 - .2 * c.cheap) * HU];
  // (where each of the cheaper batch's sheets lies: bunched up toward the copier, so none standing covers the first copy,
  // already landed on the desk's end at x 972; spread 95 px apart the last two stood over it)
  const FAN_X = [110, 180, 245, 300];
  function v1CopyState(c, tt, t = tt) {
    const f = c.fan || 0, t0 = c.out + (c.fan != null ? .03 * c.fan : 0), slide = seg(tt, t0, t0 + .14), S0 = t0 + .14 + .06 * f;
    const h0 = S0 + V1_PRINT.bar[1], h1 = t0 + .72 + .12 * f;   // (the landings where they were; the flights .06 s shorter at most)
    const tray = [CPR.out[0] - 30 - (c.fan != null ? FAN_X[c.fan] : 60) * easeOut(slide), 842 + (c.fan != null ? 18 * c.fan : 0)];
    const regX = (3 + 7 * c.cheap) * (1 - ease(seg(t, S0 + .12, S0 + .46)));
    if (tt < t0) return null;
    if (tt < h0) {
      const up = seg(tt, S0, S0 + V1_PRINT.rise), stand = tt < S0 ? null : backOut(up), r0 = (hash(c.gen * 1.7) - .5) * .5, r1 = (hash(c.gen * 3.3) - .5) * .05 * c.gen;
      return { x: tray[0], y: tray[1], sheet: true, stand, bar: seg(t, S0 + V1_PRINT.bar[0], S0 + V1_PRINT.bar[1]), rot: stand == null ? r0 : lerp(r0, r1, clamp(up * 4)), regX };   // (squared up as it lifts: a tall sheet leaning read as a plank)
    }
    if (tt < h1) { const k = seg(tt, h0, h1), p = arcPt(tray, c.to, 180 + 40 * f, k); return { x: p[0], y: p[1], air: k, from: tray, regX }; }
    return { x: c.to[0], y: c.to[1], landed: tt - h1 };
  }
  // her work: a design of hers (a poster: a sun over hills, a bold band), the sheet Copilot copies
  function v1Work(w, key) {
    const h = w * 1.3;
    piece(R4(-w / 2, -h / 2, w / 2, h / 2), '#F4EFE4', { sw: 1, key: key + 'p', lift: 2, flatCard: true });
    flat(R4(-w * .4, -h * .42, w * .4, h * .1), '#F2C45A', key + 'sky');
    flat(oval(0, -h * .12, w * .16, w * .16, 0, 16), '#E86A3A', key + 'sun');
    flat([[-w * .4, h * .1], [-w * .1, -h * .06], [w * .15, h * .04], [w * .4, -h * .1], [w * .4, h * .1]], '#3F7A64', key + 'hill');
    flat(R4(-w * .4, h * .2, w * .4, h * .3), '#D8432E', key + 'band');
  }
  function v1CopierScene(t) {
    const tt = mt(t), riso = tt >= COPY.sweep[0];
    // (on ones; the frame's right edge stays inside the set, which ends at x 1980: framed on 1200 at 1.04–1.1 it showed
    // ~130 px of bare card past the wall's end)
    const cam = kf(t, [[CUT.d, [1105, 560, 1.12]], [T.then, [1120, 556, 1.16]], [COPY.sweep[0], [1095, 552, 1.1]], [T.desk, [1000, 580, 1.06]], [29.5, [1010, 584, 1.07]]]);
    const lid = 1 - ease(seg(tt, FEED.lid[0], FEED.lid[1])), scan = tt >= T.then - .05 && tt < COPY.flash[1] ? seg(tt, T.then - .05, COPY.flash[1]) : null;
    const draw = () => {
      camBegin(cam[0], cam[1], cam[2]);
      officeBack(tt, tt, { clock: [17, 9 + (tt - CUT.d) * .5], dusk: 1, copierLid: lid, copierScan: scan, copierSheets: 2, doorOpen: .55 + .45 * seg(tt, T.left, T.left + .3), chair: true });
      // her work goes face down on the glass (before the lid comes down); from its hand (not a second copy while it still
      // holds it), and under the lid (the lid used to come down behind it)
      if (tt >= FEED.place[0] && lid > .35) { const k = ease(seg(tt, FEED.place[0], FEED.place[1])), p = [lerp(CPOP[0] - 70, 1500, k), lerp(CPOP[1] - 90, 530, k)];
        boilSeed('v1work'); push(); translate(p[0], p[1]); scale(1, lerp(1, .12, k)); v1Work(66, 'v1wk'); pop(); }
      // Copilot on the copier's end: lays her work on the glass, brings the lid down, presses go; then it watches its
      // copies go to work, pleased with the job
      const cpMood = emotions(tt, [[0, 'determined', { lookX: -.8, lookY: .5 }], [FEED.go, 'happy', { lookX: -.3, lookY: .6 }], [COPY.sweep[1], 'proud', { emote: null }], [T.me + .3, 'happy', { lookX: -.8 }]]);
      // (flipped to face the glass: in its own frame +x points at it)
      const lk = ease(seg(tt, FEED.lid[0], FEED.lid[1]));
      const layP = { L: [3.0, -2.6, .25, 'hold', 1, .5], R: [2.3, -2.4, .3, 'relax', 1, .3] }, lidP = { L: [3.1, -4.7 + 2.3 * lk, .2, 'open', 1, -.9], R: [2.3, -4.3 + 2.1 * lk, .2, 'open', 1, -.7] };
      const goP = { L: [-1.2, -2.0, .3, 'relax'], R: [.8, -.5 + .5 * Math.exp(-9 * Math.max(0, tt - FEED.go)), .3, 'point', 1, 1.5] }, waveOn = { L: [3.3, -4.3, .15, 'open', 1, -.3], R: [-.9, -1.7, .3, 'relax'] };
      const pose = tt < FEED.place[1] ? layP : tt < FEED.lid[1] + .05 ? lidP : tt < COPY.flash[1] ? goP : waveOn;
      const land = jump(tt, CUT.d - .3, CUT.d + .04, 0);   // (it lands on the copier as the shot opens)
      v1Gen(riso ? 1 : 0, () => copilot(CPOP[0], CPOP[1], HU, { ...cpMood, sq: (cpMood.sq || 0) + land.sq, disguise: true, view: 'q', flip: true, pose, boilKey: 'v1cpO', t: tt,
        holdL: tt < FEED.place[0] ? s => { push(); rotate(.2); v1Work(s * 2.2, 'v1wkH'); pop(); } : null }));
      // the copies at the desk: the chair and desk-top ones sit in the desk's layers
      const st = COPIES.map(c => ({ c, s: v1CopyState(c, tt, t) })), copLate = [];
      const cop = ({ c, s }) => {
        const J = s.air != null ? { sq: -.15 * Math.sin(s.air * Math.PI), dy: 0 } : s.landed != null ? jump(tt, tt - s.landed - .01, tt - s.landed, 0) : { sq: 0, dy: 0 };
        const mood = feel(s.landed != null ? (c.pose === 'typing' ? 'determined' : 'happy') : 'excited', tt + c.gen * .37, { seed: c.gen });
        const seated = s.landed != null && c.seat, ct = tt - c.gen * .05, atKeys = seated && c.pose === 'typing';
        // (the one in her chair types on her keyboard, its hands redrawn over the desk top with the copy's print: copLate)
        const late = atKeys ? [] : null; if (late) copLate.push({ gen: c.gen, fns: late });
        const o = { ...mood, emote: null, sq: (mood.sq || 0) + J.sq, disguise: true, cheap: c.cheap, pose: s.landed != null ? (atKeys ? cpType(c.seat, ct) : c.pose) : 'idle', seated, chair: false, seatH: c.seat || 3.3,
          keyboard: c.pose === 'typing' && !seated, tap: atKeys ? ct * 12 : null, late: late && { L: 'arm', R: 'arm', out: late }, boilKey: 'v1cp' + c.gen, t: ct, seed: c.gen, view: s.air != null ? 'q' : 'front', flip: s.air != null, noShadow: true };   // (its shadow: landShadow, trayShadow)
        v1Gen(1 + c.gen, () => {
          if (s.sheet && s.stand == null) {   // a printed sheet lying on the floor: the copy, flat (a tiny print of it on the paper)
            boilSeed('v1sheet' + c.gen); push(); translate(s.x, s.y); rotate((hash(c.gen * 1.7) - .5) * .5);
            const hw = printSheet(c)[0] / 2;   // (as wide as it will stand)
            piece([[-hw, -16], [hw - 4, -20], [hw, 14], [-hw + 6, 18]], '#F1ECDF', { sw: 1.1, key: 'v1sh' + c.gen, lift: 2 });
            piece(oval(-6, -8, 16, 7, 0, 14), '#8A5A30', { ink: null, key: 'v1shh' + c.gen, lift: 0, flatCard: true }); piece(oval(-6, 2, 12, 5, 0, 12), '#D8432E', { ink: null, key: 'v1shs' + c.gen, lift: 0, flatCard: true });
            piece(oval(-12, -6, 4, 3, 0, 8), '#D6A444', { ink: null, key: 'v1shg' + c.gen, lift: 0, flatCard: true }); piece(oval(0, -6, 4, 3, 0, 8), '#D6A444', { ink: null, key: 'v1shg2' + c.gen, lift: 0, flatCard: true });
            pop(); return;
          }
          if (s.sheet) {   // standing up and printing: blank sheet ahead of the light bar, the copy behind it
            const [pw, ph] = printSheet(c), a = Math.PI / 2 * s.stand, hS = ph * Math.sin(a) + 34 * Math.max(0, Math.cos(a)), yb = -hS * s.bar;
            push(); translate(s.x, s.y); rotate(s.rot);
            if (s.bar < 1) { boilSeed('v1sheet' + c.gen); clipPoly(R4(-pw, -hS - 30, pw, yb), () => piece(R4(-pw / 2, -hS, pw / 2, 0), '#F1ECDF', { sw: 1.1, key: 'v1shS' + c.gen, lift: 2 })); }
            if (s.bar > 0) clipPoly(R4(-220, yb, 220, 60), () => { push(); scale(1, hS / ph); copilot(0, 0, HU, o); pop(); });
            pop(); return;
          }
          push(); translate(s.x, s.y); rotate((hash(c.gen * 3.3) - .5) * .05 * c.gen);
          copilot(0, 0, HU, o); pop();
        }, s.regX || 0);
        // the light bar (drawn as light, over the print)
        if (s.sheet && s.stand != null && s.bar > 0 && s.bar < 1) {
          const [pw, ph] = printSheet(c), a = Math.PI / 2 * s.stand, hS = ph * Math.sin(a) + 34 * Math.max(0, Math.cos(a)), yb = -hS * s.bar;
          push(); translate(s.x, s.y); rotate(s.rot);
          _glow(0, yb, 70, '#9CFFD2', .55);
          _paint(R4(-pw / 2 - 8, yb - 5, pw / 2 + 8, yb + 5), { wash: '#F4FFF8', ink: null });
          _paint(R4(-pw / 2 - 8, yb + 5, pw / 2 + 8, yb + 7), { wash: '#B9C4BE', ink: null });
          pop();
        }
      };
      // each copy's shadow (the rig's own went up with it, hanging under its feet in the air, and the chair copy's popped
      // in on the floor under the desk as it landed): on the floor under the tray as it stands up and takes off, then
      // where it will land, growing as it comes down; drawn in the layer of the place it lands on
      const onDesk = c => !c.seat && c.to[1] < OF.deskTop.y + 30;
      const shade = (x, y, w, k, g) => { if (k > .02) v1Gen(1 + g, () => paint(oval(x, y + .1 * HU, w * HU * lerp(.5, 1, k), .32 * HU * lerp(.5, 1, k), 0, 24), { wash: NOIR.ink, washOp: (STYLE.card ? 110 : 150) * k, ink: null })); };
      const landShadow = ({ c, s }) => { if (s && !s.sheet) shade(c.to[0], c.to[1], c.seat ? 2.5 : 1.9, s.air != null ? ease(seg(s.air, .35, 1)) : 1, c.gen); };
      const trayShadow = ({ c, s }) => { if (s && s.sheet && s.stand != null) shade(s.x, s.y, 1.9, clamp(s.stand), c.gen); else if (s && s.air != null) shade(s.from[0], s.from[1], 1.9, 1 - seg(s.air, 0, .3), c.gen); };   // (it grows as the sheet stands)
      st.filter(x => x.c.seat).forEach(landShadow);
      st.filter(x => x.s && x.s.landed != null && x.c.seat).forEach(cop);
      officeFront(tt, tt, { clock: [17, 9], plant: false, mug: false, onDesk: () => {
        v1StackCards(STACK.n1);   // (V1c's stack of leaving cards, left on her desk: it prints into the copy with the rest)
        copLate.forEach(({ gen, fns }) => v1Gen(1 + gen, () => deskLate(fns)));
        st.filter(x => onDesk(x.c)).forEach(landShadow);
        st.filter(x => x.s && x.s.landed != null && !x.c.seat && x.s.y < OF.deskTop.y + 30).forEach(cop);
      } });
      st.filter(x => !x.c.seat && !onDesk(x.c)).forEach(landShadow);
      st.forEach(trayShadow);
      st.filter(x => x.s && !(x.s.landed != null && (x.c.seat || x.s.y < OF.deskTop.y + 30))).forEach(cop);
      // her, at the door with her box (the card in it), looking back; on "left behind" she walks out of frame
      const back = tt >= T.then - .3, out = seg(tt, T.left - .05, T.left + .5);
      const hMood = emotions(tt, [[0, 'sad', { lookY: .4, emote: null }], [T.then - .3, 'surprised', { lookX: .8, emote: null, mouth: 'flat' }], [COPY.sweep[1] + .1, 'sad', { lookX: .9, emote: null }], [T.desk, 'bored', { lookX: .6 }], [T.left - .05, 'neutral', { lookX: 1 }]], { take: .6 });
      const hx = DOOR[0] + 460 * ease(out), walking = out > 0 && out < 1, fl = back && out <= 0;
      v1Gen(riso ? 1 : 0, () => {
        const late = [];   // (her hands round its ends, over it: herGrip)
        person(hx, DOOR[1], HU, HER_C, { ...hMood, view: 'q', flip: fl, walk: walking ? out * 2.2 : null, pose: herCarry(), late: { L: 'arm', R: 'hand', out: late }, boilKey: 'v1herD', sing: V1_HER_LIPS });
        const b = boxAt(hx, DOOR[1], fl);
        v1Box(b[0], b[1], BOXW, 'v1boxD', 1);
        late.forEach(f => f());
        boilSeed('v1lcardD'); push(); translate(b[0] + 18, b[1] - BOXW * .62 - 22); rotate(.08); b2LeavingCard(70, 'v1lcD', .9); pop();
      });
      camEnd();
    };
    if (!riso) { look('card'); draw(); }
    else { look('xerox'); v1RisoShadows(() => v1Gen(0, draw)); }
    // the copier's light floods out (card), then the frame prints as a copy behind the bar sweeping back across it
    if (tt >= COPY.flash[0] && tt < COPY.sweep[0]) {
      const k = seg(tt, COPY.flash[0], COPY.flash[1]), c = toScreen(1520, 540, { cx: cam[0], cy: cam[1], zoom: cam[2], rot: 0 });
      look('card');
      glow(c[0], c[1], 200 + 1600 * easeIn(k), '#C8FFE0', .6 + .6 * k);
      flash(easeIn(seg(k, .55, 1)), '#F4FFF8');
    }
    if (riso && tt < COPY.sweep[1]) {
      look('xerox');
      const p = seg(tt, COPY.sweep[0], COPY.sweep[1]), X = lerp(W + 140, -140, p), R = (x0, x1) => [[x0, -80], [x1, -80], [x1, H + 80], [x0, H + 80]];
      boilSeed('v1bar');
      for (let i = 0; i < 6; i++) { const xa = X + 40 * i, xb = X + 40 * (i + 1); _paint(R(xa, xb), { wash: XEROX.paper, washOp: 200 * (1 - i / 6), ink: null }); }
      _paint(R(-200, X), { wash: XEROX.paper, ink: null });
      for (let y = -40; y < H + 80; y += 110) _glow(X + 10, y, 190, '#9CFFD2', .85);
      _paint(R(X - 10, X + 16), { wash: '#F8FFFA', ink: null });
      _paint(R(X - 14, X - 10), { wash: '#B9C4BE', ink: null });
    }
    if (riso) xeroxGrit(tt, .8);
  }
  // the chain that falls at the end: screen y of its hands' line over time (it drops in over V1d, lands in the note)
  // (it lands at the height of Dorsey's open shears in the note)
  // (n workers, left hands from x -200: the chain's head lands short of the shredder's maw in V1e; y, its front row's hands)
  const CHAIN = { drop: 29.06, land: 29.68, dw: 80, n: 12, y: 797 };
  const chainY = t => { const a = t - CHAIN.drop, g = 5200; const y = -220 + .5 * g * a * a; if (t < CHAIN.land) return Math.min(y, CHAIN.y + 40); const b = t - CHAIN.land; return CHAIN.y + 26 * Math.exp(-6 * b) * Math.cos(16 * b); };
  // the whole chain as one outline (one printed piece): hands joined, a head each
  function v1ChainPoly(x0, y, n, dw) {
    const top = [], bot = [], D = (i, P) => P.map(([a, b]) => [x0 + (i + a) * dw, y + (b - .5) * dw]);
    for (let i = 0; i < n; i++) {
      top.push(...D(i, [[0, .45], [.33, .43], [.4, .38], [.43, .33]]), ...oval(0, 0, .15, .16, 0, 12).filter(([a, b]) => b < .08).sort((p, q) => p[0] - q[0]).map(([a, b]) => [x0 + (i + .5 + a) * dw, y + (.22 - .5 + b) * dw]), ...D(i, [[.57, .33], [.6, .38], [.67, .43]]));
      bot.push(...D(i, [[.34, .6], [.31, 1.06], [.28, 1.44], [.44, 1.44], [.5, 1.1], [.56, 1.44], [.72, 1.44], [.69, 1.06], [.66, .6]]));
    }
    top.push(...D(n - 1, [[1, .45], [1, .57]])); 
    return top.concat(bot.reverse().map(p => p), D(0, [[0, .57]]));
  }
  function v1ChainFall(t, n0, dx) {
    const y = chainY(t); boilSeed('v1chainR');
    piece(v1ChainPoly(dx + n0 * CHAIN.dw, y, CHAIN.n, CHAIN.dw), '#E4D4B2', { sw: 1.2, key: 'v1chainR', lift: 2 });
  }
  SHOT.V1d = t => {
    if (t < CUT.d) { v1Stack(t); return; }
    v1CopierScene(t);
    if (t >= CHAIN.drop) { look('xerox'); v1Gen(2, () => v1ChainFall(t, -2, -40)); }
  };

  // ================================================================================================================
  // V1e: the banknote. Dorsey winds up an engraved clockwork shredder and steps back to his phone; the paper chain of
  // workers feeds itself in, a worker a bite, and sprays from the chute as paper bits, which fountain up into the share
  // price; he rides it up and away. (The user, 2026-09-25: "I don't see Jack as a man who cuts them all by hand.")
  // ================================================================================================================
  const SHT = { price: wt('Jack', 7, 32.30) };
  const DOR = { x: 1300, x1: 1512, y: 872, u: 34 };   // Dorsey: at the key, facing it; then two steps back, turning away
  const SH = {
    wind: [[CUT.e + .02, CUT.e + .26], [CUT.e + .34, T.jack - .07]],   // two twists of the key
    clunk: T.jack,                                                      // "Jack": it starts
    step: [T.jack + .14, T.jack + .56],                                 // two steps back, turning away on the second
    phone: [T.thousand - .08, T.thousand + .12],                        // his phone out, the other hand in a pocket
    bites: [T.cuts - .03, T.four - .03, T.thousand - .03, BT(69) - .03, BT(69) + .19],   // a worker drawn in each bite
    rush: BT(69) + .4,                                                  // then it runs on by itself, faster and faster
    fount: T.watch - .05,                                               // the bits fountain up
  };
  const DW = CHAIN.dw;   // a paper worker's width at the front (px)
  // ---- the machine's plan (px): the rollers' nip; a train of brass gears (one module, so they mesh) from the upper
  // roller up to the mainspring barrel (G3: the key winds it); the flywheel on its stand above, belted to G2 ----
  const SHC = { iron: '#7A8386', ironDk: '#434A4E', ironLt: '#B2BABC', brass: '#C49A4E', brassDk: '#86652A', brassLt: '#E0C888',
    steel: '#98A2A6', steelDk: '#566064', copper: '#B06A44', copperDk: '#733E26', dark: '#1E2426', belt: '#6A4A34', paper: '#E4D4B2', dial: '#EEE8D8', red: '#B8322A' };
  const SHM = (() => {
    const m = 4.6, nip = [792, 700], G = { R1: 12, R2: 12, G1: 10, G2: 16, G3: 22 };
    for (const k in G) G[k] = { id: k, n: G[k], r: m * G[k] };
    G.R1.c = [nip[0], nip[1] - G.R1.r]; G.R2.c = [nip[0], nip[1] + G.R2.r]; G.R2.from = 'R1'; G.R2.phi = Math.PI / 2;
    const at = (a, b, deg) => { const A = G[a], B = G[b], q = deg * Math.PI / 180, d = A.r + B.r; B.c = [A.c[0] + Math.cos(q) * d, A.c[1] + Math.sin(q) * d]; B.from = a; B.phi = q; };
    at('R1', 'G1', -38); at('G1', 'G2', -2); at('G2', 'G3', 38);
    return { nip, G, body: [816, 470, 1246, 800], fly: [G.G2.c[0], 318, 116], rim: [676, 700, 36, 150], chute: [1354, 806], stack: [1214, 448, 186], gauge: [1140, 418, 25] };
  })();
  // each gear's angle for the train's travel f (px round the pitch circles): the rollers pull the chain in at the nip
  // (the upper one turns anticlockwise), and each gear meshes tooth in gap with the one before it
  function shAngles(f) {
    const G = SHM.G, A = { R1: -f / G.R1.r };
    for (const k of ['R2', 'G1', 'G2', 'G3']) { const g = G[k], p = G[g.from]; A[k] = g.phi + Math.PI + Math.PI / g.n - (A[g.from] - g.phi) * p.n / g.n; }
    return A;
  }
  // ---- the chain's path: from the nip down to the ground, the front row off to the left, then to and fro in rows back
  // into the distance (a queue of thousands, converging on the horizon). The ground: a point at depth scale s (1 = the
  // front row) is at y = HZ + (GY - HZ) s and x = VX + (X - VX) s (X its place across the front row); a worker's hands
  // are .94 of his width up. Samples: { x, y (the hands), s, ux, uy (his up), a (px along the chain from the nip) } ----
  const SHG = { HZ: 604, GY: 872, VX: 380, XL: -160, XR: 560, Z0: 1100, lift: 520 };
  const SHP = (() => {
    const { HZ, GY, VX, XL, XR, Z0 } = SHG, hh = .94 * DW, nip = SHM.nip, P = [];
    const dx = SHG.lift - nip[0], dy = GY - hh - nip[1], dl = Math.hypot(dx, dy), up = [-dy / dl, dx / dl];
    for (let i = -8; i <= 16; i++) { const k = i / 16; P.push({ x: nip[0] + dx * k, y: nip[1] + dy * k, s: 1, ux: up[0], uy: up[1], w: null }); }   // (on into the machine, then the nip to the ground)
    const G = (X, z) => { const s = 1 / z; return { x: VX + (X - VX) * s, y: HZ + (GY - HZ) * s - hh * s, s, ux: 0, uy: -1, w: [X, z * Z0] }; };
    const Zr = k => 1 + .27 * k + .03 * k * k;
    let X = SHG.lift;
    for (let k = 0; k < 16; k++) {   // row k at depth Zr(k), leftward then rightward, a half-turn in the ground at each end
      const z0 = Zr(k), z1 = Zr(k + 1), left = k % 2 === 0, Xe = left ? XL : XR, n = Math.max(2, Math.ceil(Math.abs(Xe - X) / 24)), r = (z1 - z0) * Z0 / 2;
      for (let i = 1; i <= n; i++) P.push(G(lerp(X, Xe, i / n), z0));
      for (let i = 1; i <= 12; i++) { const f = i / 12 * Math.PI; P.push(G(Xe + (left ? -1 : 1) * r * Math.sin(f), (z0 + z1) / 2 - (z1 - z0) / 2 * Math.cos(f))); }
      X = Xe;
    }
    let a = 0; P[0].a = 0;
    for (let i = 1; i < P.length; i++) { const p = P[i - 1], q = P[i]; a += p.w && q.w ? Math.hypot(q.w[0] - p.w[0], q.w[1] - p.w[1]) : Math.hypot(q.x - p.x, q.y - p.y); q.a = a; }
    const a0 = P[8].a; for (const p of P) p.a -= a0;
    return P;
  })();
  function shAt(a) {
    const P = SHP; if (a <= P[0].a) return P[0]; if (a >= P[P.length - 1].a) return P[P.length - 1];
    let lo = 0, hi = P.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (P[m].a <= a) lo = m; else hi = m; }
    const p = P[lo], q = P[hi], k = (a - p.a) / (q.a - p.a || 1);
    return { x: lerp(p.x, q.x, k), y: lerp(p.y, q.y, k), s: lerp(p.s, q.s, k), ux: lerp(p.ux, q.ux, k), uy: lerp(p.uy, q.uy, k) };
  }
  // the chain lands with its head short of the nip (V1d's falling chain ends there); the first bite takes up the slack
  const SH_A0 = (SHM.nip[0] - (-200 + CHAIN.n * DW)) / (SHM.nip[0] - SHG.lift) * Math.hypot(SHM.nip[0] - SHG.lift, SHG.GY - .94 * DW - SHM.nip[1]);
  // how far the chain has been drawn in (px along it)
  function shFeed(t) {
    if (t < SH.clunk) return 0;
    let f = SH_A0 * easeOut(seg(t, SH.clunk, SH.clunk + .1));
    for (const b of SH.bites) f += DW * backOut(seg(t, b, b + .17));
    if (t > SH.rush) { const d = t - SH.rush; f += 260 * d + 120 * d * d; }
    return f;
  }
  // the gearing's travel: the feed, but in the rush no faster than a third of a tooth a frame (at 24 fps faster teeth
  // strobe and stand still)
  const shTurn = t => t <= SH.rush ? shFeed(t) : shFeed(SH.rush) + 230 * (t - SH.rush);
  // the winding key: two twists (a half-turn each), then it unwinds slowly as the machine runs
  const shKeyA = t => t < SH.wind[1][0] ? Math.PI * ease(seg(t, SH.wind[0][0], SH.wind[0][1])) : t < SH.clunk ? Math.PI * (1 + ease(seg(t, SH.wind[1][0], SH.wind[1][1]))) : TAU - (shTurn(t) - shTurn(SH.clunk)) / 150;
  // ---- the paper worker (the chain's cut-out: across 0..1, down: the hands .45-.57, the head's top .06, the feet 1.44) ----
  const DOLL = (() => { const hd = []; for (let i = 0; i <= 12; i++) { const th = lerp(2.25, 7.17, i / 12); hd.push([.5 + .15 * Math.cos(th), .22 + .16 * Math.sin(th)]); }
    return [[0, .45], [.33, .43], [.41, .37], ...hd, [.59, .37], [.67, .43], [1, .45], [1, .57], [.66, .6], [.69, 1.06], [.72, 1.44], [.56, 1.44], [.5, 1.1], [.44, 1.44], [.28, 1.44], [.31, 1.06], [.34, .6], [0, .57]]; })();
  const DTIE = [[.5, .44], [.47, .56], [.5, .8], [.53, .56], [.5, .44]];
  // a worker standing between his hands A (left) and B (right): a card panel from one hand's place to the other's, so in
  // the half-turns he's seen edge on, and on the rise he leans with the chain
  const shDollMap = (A, B) => ([u, v]) => { const h = (.51 - v) * DW; return [lerp(A.x, B.x, u) + lerp(A.ux * A.s, B.ux * B.s, u) * h, lerp(A.y, B.y, u) + lerp(A.uy * A.s, B.uy * B.s, u) * h]; };
  // the chain's workers now: [{ A, B, s, j }], back to front. The first CHAIN.n are V1d's falling chain: they fall with
  // it and land on their places (a small bounce)
  function shChain(t) {
    const f = shFeed(t), out = [], hh = .94 * DW;
    for (let j = 0; j < 400; j++) {
      const aB = SH_A0 + j * DW - f, aA = aB + DW;
      if (aA < -30) continue;
      if (aB > SHP[SHP.length - 1].a) break;
      let A = shAt(aA), B = shAt(aB);
      if (j < CHAIN.n) {   // falling (V1d's chain: left hands from x -200), then landing
        const i = CHAIN.n - 1 - j, xl = -200 + i * DW, yl = (A.y + B.y) / 2, tl = CHAIN.drop + Math.sqrt(Math.max(0, yl + 220) / 2600);
        const k = easeOut(seg(t, tl - .05, tl + .07)), fy = Math.min(yl, -220 + 2600 * Math.pow(t - CHAIN.drop, 2)), d = t - tl, bo = d > 0 ? 16 * Math.exp(-8 * d) * Math.sin(15 * d) : 0;
        const F = x => ({ x, y: fy, s: 1, ux: 0, uy: -1 }), mix = (P, Q) => ({ x: lerp(P.x, Q.x, k), y: lerp(P.y, Q.y, k) - bo, s: lerp(P.s, Q.s, k), ux: lerp(P.ux, Q.ux, k), uy: lerp(P.uy, Q.uy, k) });
        A = mix(F(xl), A); B = mix(F(xl + DW), B);
      }
      const x0 = Math.min(A.x, B.x) - 40, x1 = Math.max(A.x, B.x) + 40;
      if (x1 < -60 || x0 > W + 60 || Math.max(A.y, B.y) + hh < -40) continue;
      out.push({ A, B, s: (A.s + B.s) / 2, j });
    }
    return out.sort((p, q) => p.s - q.s);
  }
  function shDoll(D) {
    const M = shDollMap(D.A, D.B), s = D.s;
    boilSeed('shd' + D.j);
    piece(DOLL.map(M), SHC.paper, { sw: lerp(.45, 1.1, s), key: 'shd' + D.j, lift: 2 });
    if (s > .5) dline(DTIE.map(M), .8 * s, '#7A2A2A');   // (a tie: a worker)
  }
  // ---- the machine, engraved: cast iron on lion's feet, brass gearing, a copper chimney. (Drawn in place, not rotated:
  // the hatching stays put while the wheels turn; the teeth, spokes and lathe-work turn through it) ----
  const pol = (c, a, r) => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
  const shRing = (c, r0, r1, n = 64) => { const O = oval(c[0], c[1], r1, r1, 0, n), I = oval(c[0], c[1], r0, r0, 0, n); return O.concat([O[0]], I.slice().reverse(), [I[I.length - 1]]); };
  const shLoop = (c, r, a = 0, n = 48) => { const P = oval(c[0], c[1], r, r, a, n); return P.concat([P[0]]); };
  // rivets along a polyline, every g px
  function shRivets(P, g, r = 2.6) {
    const B = BNO.batch(), T = []; let acc = g / 2;
    for (let i = 0; i + 1 < P.length; i++) { const a = P[i], b = P[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      while (acc < L) { const u = acc / L, c = [lerp(a[0], b[0], u), lerp(a[1], b[1], u)]; const O = oval(c[0], c[1], r, r, 0, 10); for (let k = 1; k + 1 < O.length; k++) T.push(...O[0], ...O[k], ...O[k + 1]); B.line(O.concat([O[0]]), .55); B.line([[c[0] + r * .2, c[1] + r * .2], [c[0] + r * .75, c[1] + r * .45]], .5); acc += g; }
      acc -= L; }
    bankTris(T, BANK.paper); B.draw();
  }
  // a gear: g { c, r (pitch), n }, turned to a; o: col, dk, sharp (cutter teeth), spokes (cut-outs), lathe (a guilloche
  // turned into the rim), hub
  function shGear(g, a, key, o = {}) {
    const { c, r, n } = g, al = TAU / n, p = TAU * r / n, ro = r + (o.add ?? .3) * p, rr = r - .36 * p, T = [];
    const prof = o.sharp ? [[-.5, rr], [-.34, rr], [-.06, ro], [.06, ro - p * .12], [.3, rr]] : [[-.5, rr], [-.27, rr], [-.15, ro], [.15, ro], [.27, rr]];
    for (let k = 0; k < n; k++) for (const [f, R] of prof) T.push(pol(c, a + (k + f) * al, R));
    boilSeed(key);
    piece(T, o.col || SHC.brass, { sw: 1.2, shade: o.dk || SHC.brassDk, depth: r * .16, key: key + 't', lift: 3 });
    const B = BNO.batch();
    B.line(shLoop(c, rr - 3, a), .55);
    const ns = o.spokes ?? 0, h0 = r * .3 + 6, h1 = rr - p * .34;
    for (let j = 0; j < ns && h1 - h0 > 6; j++) {
      const q = a + (j + .5) * TAU / ns, w0 = TAU / ns * .22, w1 = TAU / ns * .34, H = [];
      for (let i = 0; i <= 8; i++) H.push(pol(c, q - w1 + 2 * w1 * i / 8, h1));
      for (let i = 8; i >= 0; i--) H.push(pol(c, q - w0 + 2 * w0 * i / 8, h0));
      piece(H, SHC.dark, { sw: .9, key: key + 'h' + j, lift: 1 });
    }
    if (o.lathe) guilloche(c[0], c[1], o.lathe[0], o.lathe[1], { n: 5, lobes: o.lathe[2] ?? n * 2, w: .35, rot: a, col: BNO.ink(.8), steps: 260 });
    B.draw();
    const hr = o.hub ?? r * .24;
    piece(oval(c[0], c[1], hr, hr, a, 24), o.col ? mixCol(o.col, '#FFFFFF', .25) : SHC.brassLt, { sw: 1, shade: o.dk || SHC.brassDk, depth: hr * .3, key: key + 'hub', lift: 2 });
    const Hx = []; for (let k = 0; k < 6; k++) Hx.push(pol(c, a + k * TAU / 6, hr * .42));
    piece(Hx, SHC.ironDk, { sw: .8, key: key + 'nut', lift: 1 });
  }
  // the butterfly key on the barrel's arbor (its bow faces us, so it turns in the picture)
  function shKey(c, a) {
    const ca = Math.cos(a) * 1.3, sa = Math.sin(a) * 1.3, K = ([u, v]) => [c[0] + u * ca - v * sa, c[1] + u * sa + v * ca];
    const wing = [[8, -8], [22, -20], [40, -27], [54, -20], [60, 0], [54, 20], [40, 27], [22, 20], [8, 8]];
    boilSeed('shkey');
    piece(curvy(wing.concat(wing.map(([u, v]) => [-u, -v])).map(K), 4), SHC.brass, { sw: 1.3, shade: SHC.brassDk, depth: 8, key: 'shkeyb', lift: 4 });
    const B = BNO.batch();
    for (const d of [1, -1]) {
      piece(oval(...K([d * 38, 0]), 13, 9, a, 16), SHC.dark, { sw: .8, key: 'shkeyh' + d, lift: 1 });
      B.line([[12, -6], [26, -14], [40, -19], [52, -14]].map(([u, v]) => K([d * u, d * v])), .5); B.line([[12, 6], [26, 14], [40, 19], [52, 14]].map(([u, v]) => K([d * u, d * v])), .5);
      B.line([[50, -6], [55, 0], [50, 6]].map(([u, v]) => K([d * u, v])), .45);
    }
    B.draw();
    piece(oval(c[0], c[1], 13, 13, 0, 20), SHC.brassLt, { sw: 1.1, shade: SHC.brassDk, depth: 5, key: 'shkeyc', lift: 4 });
    piece(oval(c[0], c[1], 5, 5, 0, 12), SHC.brassDk, { sw: .7, key: 'shkeyc2', lift: 1 });
  }
  // the flywheel on its lyre-shaped stand (behind it), a lathe-work band round its rim, six curved spokes, a hub
  function shFly(a) {
    const [cx, cy, R] = SHM.fly, c = [cx, cy], yb = SHM.body[1] - 20;
    boilSeed('shfly');
    for (const d of [-1, 1]) piece(ribbon([[cx + d * 84, yb], [cx + d * 70, yb - 50], [cx + d * 30, cy + 40], [cx, cy]], 22, 12), SHC.iron, { sw: 1.2, shade: SHC.ironDk, depth: 8, key: 'shfst' + d, lift: 2 });
    for (const d of [-1, 1]) BNO.acanthus(cx + d * 84, yb + 2, 44, -d, { key: 'shfac' + d, sw: .6, lobes: 3 });
    piece(shRing(c, R * .8, R), SHC.iron, { sw: 1.3, shade: SHC.ironDk, depth: R * .12, key: 'shfrim', lift: 4 });
    guilloche(cx, cy, R * .83, R * .97, { n: 6, lobes: 36, w: .35, rot: a, col: BNO.ink(.85), steps: 480, twist: .4, beat: 5 });
    for (let k = 0; k < 6; k++) { const q = a + k * TAU / 6; piece(ribbon([pol(c, q, R * .18), pol(c, q + .2, R * .5), pol(c, q + .1, R * .81)], 15, 9), SHC.iron, { sw: 1.1, shade: SHC.ironDk, depth: 4, key: 'shfsp' + k, lift: 3 }); }
    piece(oval(cx, cy, R * .22, R * .22, a, 28), SHC.ironLt, { sw: 1.1, shade: SHC.ironDk, depth: 6, key: 'shfhub', lift: 3 });
    guilloche(cx, cy, 4, R * .19, { n: 6, lobes: 9, w: .35, rot: a, twist: .6, beat: 4, col: BNO.ink(.85), steps: 200 });
    piece(oval(cx, cy, 16, 16, 0, 20), SHC.brass, { sw: .9, shade: SHC.brassDk, depth: 4, key: 'shfpul', lift: 2 });
    piece(oval(cx, cy, 6, 6, 0, 12), SHC.ironDk, { sw: .7, key: 'shfax', lift: 1 });
  }
  // the belt from G2's pulley up to the flywheel's (its joins travel with it)
  function shBelt(f) {
    const a = SHM.G.G2.c, b = SHM.fly, L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L, nx = -uy, ny = ux, r = 15;
    boilSeed('shbelt');
    for (const d of [-1, 1]) {
      const p0 = [a[0] + nx * r * d, a[1] + ny * r * d], p1 = [b[0] + nx * r * d, b[1] + ny * r * d];
      piece(ribbon([p0, p1], 7, 7), SHC.belt, { sw: .8, key: 'shbelt' + d, lift: 2 });
      const B = BNO.batch(), ph = ((d * f * .7) % 34 + 34) % 34;
      for (let s = ph; s < L; s += 34) { const q = [p0[0] + ux * s, p0[1] + uy * s]; B.line([[q[0] - nx * 3.5, q[1] - ny * 3.5], [q[0] + nx * 3.5, q[1] + ny * 3.5]], .5); }
      B.draw();
    }
  }
  // the chimney: a tapered copper stack with brass bands, a flared crown, a moulded collar with scrolls
  function shChimney() {
    const [x, y0, y1] = SHM.stack;
    boilSeed('shstack');
    piece([[x - 16, y0], [x + 16, y0], [x + 10, y1 + 18], [x - 10, y1 + 18]], SHC.copper, { sw: 1.2, shade: SHC.copperDk, depth: 9, key: 'shst', lift: 3 });
    for (const [yy, h] of [[y0 - 70, 8], [y0 - 150, 8], [y1 + 40, 7]]) { const k = (y0 - yy) / (y0 - y1 - 18), w = lerp(17, 11, k) + 2; piece([[x - w, yy - h / 2], [x + w, yy - h / 2], [x + w, yy + h / 2], [x - w, yy + h / 2]], SHC.brass, { sw: .9, shade: SHC.brassDk, depth: 3, key: 'shstb' + yy, lift: 2 }); }
    piece(curvy([[x - 12, y1 + 20], [x - 24, y1 + 4], [x - 22, y1 - 4], [x + 22, y1 - 4], [x + 24, y1 + 4], [x + 12, y1 + 20]], 3), SHC.copper, { sw: 1.1, shade: SHC.copperDk, depth: 6, key: 'shstc', lift: 3 });
    piece(curvy([[x - 28, y0 + 2], [x - 24, y0 - 20], [x + 24, y0 - 20], [x + 28, y0 + 2]], 2), SHC.iron, { sw: 1, shade: SHC.ironDk, depth: 5, key: 'shstk', lift: 3 });
    for (const d of [-1, 1]) BNO.rinceau(x + d * 26, y0 - 4, 14, d, { up: -1, leaves: 3, sw: .45 });
  }
  // the pressure gauge: a brass bezel, a dial of ticks with a red sector, the needle (k 0..1)
  function shGauge(k) {
    const [x, y, r] = SHM.gauge, c = [x, y];
    boilSeed('shgauge');
    piece([[x - 6, SHM.body[1] - 18], [x + 6, SHM.body[1] - 18], [x + 6, y + r], [x - 6, y + r]], SHC.brassDk, { sw: .9, key: 'shgp', lift: 2 });
    piece(oval(x, y, r + 6, r + 6, 0, 36), SHC.brass, { sw: 1.2, shade: SHC.brassDk, depth: 5, key: 'shgb', lift: 3 });
    piece(oval(x, y, r, r, 0, 36), SHC.dial, { sw: .8, key: 'shgf', lift: 1 });
    const a0 = Math.PI * .75, a1 = Math.PI * 2.25, B = BNO.batch();
    for (let i = 0; i <= 20; i++) { const q = lerp(a0, a1, i / 20); B.line([pol(c, q, r * (i % 5 ? .8 : .7)), pol(c, q, r * .92)], i % 5 ? .4 : .7); }
    B.draw();
    const rs = []; for (let i = 0; i <= 10; i++) rs.push(pol(c, lerp(a0 + (a1 - a0) * .75, a1, i / 10), r * .86));
    piece(ribbon(rs, 5, 5), SHC.red, { sw: .5, key: 'shgr', lift: 1 });
    guilloche(x, y, 3, r * .42, { n: 4, lobes: 7, w: .3, col: BNO.ink(.7), steps: 140 });
    piece(ribbon([pol(c, lerp(a0, a1, k) + Math.PI, r * .2), pol(c, lerp(a0, a1, k), r * .84)], 4, 1.2), SHC.dark, { sw: .6, key: 'shgn', lift: 2 });
    piece(oval(x, y, 4, 4, 0, 10), SHC.brassDk, { sw: .6, key: 'shgc', lift: 1 });
  }
  // the maw (a flared hopper mouth facing the chain, cut away in the plate so the rollers show): its dark inside and
  // the far half of its lip (behind the chain); then the jaws and the near half of the lip (over it)
  const SHJAW = (() => { const [mx, my, , ry] = SHM.rim, bx = SHM.body[0] + 20;
    return { uo: BNO.spline([[mx, my - ry], [mx + 60, my - ry + 6], [mx + 120, my - ry + 26], [bx, my - ry + 40]], 6), ui: BNO.spline([[mx + 4, my - ry + 22], [mx + 62, my - ry + 28], [mx + 120, my - ry + 48], [bx, my - ry + 62]], 6),
      lo: BNO.spline([[mx, my + ry], [mx + 60, my + ry - 4], [mx + 120, my + ry - 22], [bx, my + ry - 34]], 6), li: BNO.spline([[mx + 4, my + ry - 22], [mx + 62, my + ry - 26], [mx + 120, my + ry - 44], [bx, my + ry - 56]], 6) }; })();
  const shRimHalf = (near, w) => { const [mx, my, rx, ry] = SHM.rim, O = [], I = [];
    for (let i = 0; i <= 20; i++) { const q = (near ? -Math.PI / 2 : Math.PI / 2) + i / 20 * Math.PI; O.push([mx + Math.cos(q) * rx, my + Math.sin(q) * ry]); I.push([mx + Math.cos(q) * (rx - w * .6), my + Math.sin(q) * (ry - w)]); }
    return O.concat(I.reverse()); };
  function shMawBack() {
    const [mx, my, rx, ry] = SHM.rim, J = SHJAW, far = [];
    for (let i = 0; i <= 20; i++) { const q = Math.PI / 2 + i / 20 * Math.PI; far.push([mx + Math.cos(q) * (rx - 5), my + Math.sin(q) * (ry - 8)]); }
    boilSeed('shmaw');
    piece(far.concat(J.ui, J.li.slice().reverse()), SHC.dark, { sw: 1, key: 'shmawin', lift: 0 });
    const B = BNO.batch();   // the funnel's ribs, running in to the throat
    for (let k = 1; k < 5; k++) { const v = k / 5; B.line(J.ui.map((p, i) => [p[0], lerp(p[1], J.li[i][1], v)]).map(([px, py], i) => [px, py + Math.sin(i / J.ui.length * Math.PI) * (v - .5) * 20]), .4); }
    B.draw(.6);
    piece(shRimHalf(false, 14), SHC.brass, { sw: 1.1, shade: SHC.brassDk, depth: 5, key: 'shrimf', lift: 2 });
  }
  function shMawFront() {
    const [mx, my, rx, ry] = SHM.rim, J = SHJAW;
    shPaw(mx + 8, SHG.GY + 6, 1, 'shpaw0');   // (its foot: a lion's paw under the lip)
    boilSeed('shjaw');
    piece(J.uo.concat(J.ui.slice().reverse()), SHC.iron, { sw: 1.2, shade: SHC.ironDk, depth: 8, key: 'shju', lift: 3 });
    piece(J.lo.concat(J.li.slice().reverse()), SHC.iron, { sw: 1.2, shade: SHC.ironDk, depth: 8, key: 'shjl', lift: 3 });
    shRivets(J.uo.map((p, i) => [(p[0] + J.ui[i][0]) / 2, (p[1] + J.ui[i][1]) / 2]).slice(3), 22);
    shRivets(J.lo.map((p, i) => [(p[0] + J.li[i][0]) / 2, (p[1] + J.li[i][1]) / 2]).slice(3), 22);
    piece(shRimHalf(true, 14), SHC.brass, { sw: 1.2, shade: SHC.brassDk, depth: 6, key: 'shrimn', lift: 3 });
    const P = []; for (let i = 0; i <= 40; i++) { const q = -Math.PI / 2 + i / 40 * Math.PI; P.push([mx + Math.cos(q) * (rx - 3), my + Math.sin(q) * (ry - 5)]); }
    BNO.beadsAlong(P, 2.6, { sw: .45 });
  }
  // a lion's paw foot, its toes on the ground at (x, y); s its size, d which way it faces
  function shPaw(x, y, s, key) {
    boilSeed(key);
    const S = ([u, v]) => [x + u * s, y + v * s], O = [[-10, -46], [-9, -34], [-13, -26], [-24, -18], [-30, -8]];
    for (const tx of [-21, -7, 7, 21]) O.push([tx - 7, -3], [tx - 4, 1], [tx + 4, 1], [tx + 7, -3]);
    O.push([30, -8], [24, -18], [13, -26], [9, -34], [10, -46]);
    piece(curvy(O.map(S), 3), SHC.iron, { sw: 1.1, shade: SHC.ironDk, depth: 8 * s, key: key, lift: 3 });
    const B = BNO.batch();
    for (const tx of [-14, 0, 14]) B.line(BNO.spline([[tx, -1], [tx * 1.1, -10], [tx * .7, -19]], 4).map(S), .6);   // (between the toes)
    for (const tx of [-21, -7, 7, 21]) B.line(BNO.arc(tx, -5, 5, Math.PI * 1.1, Math.PI * 1.9, 6, 3.6).map(S), .5);   // (the knuckles)
    for (const u of [-6, -2, 2, 6]) B.line([[u * .9, -44], [u, -34], [u * 1.5, -24]].map(S), .4);   // (the ankle's fur)
    B.line(BNO.arc(0, -20, 20, Math.PI * 1.08, Math.PI * 1.92, 12, 6).map(S), .5);
    B.draw();
    piece([[-13, -50], [13, -50], [12, -44], [-12, -44]].map(S), SHC.brass, { sw: .8, shade: SHC.brassDk, depth: 2, key: key + 'col', lift: 2 });   // (a moulded collar)
    for (const tx of [-21, -7, 7, 21]) piece([[tx - 2.6, 0], [tx + 2.6, 0], [tx + .8, 4.2], [tx - .8, 4.2]].map(S), SHC.dark, { sw: .5, key: key + 'cl' + tx, lift: 1 });   // (the claws)
  }

  // the cabinet (cornice, panels, bed), the gear train and the key, the maker's cartouche, the chute
  function shBody(A, keyA) {
    const [x0, y0, x1, y1] = SHM.body, G = SHM.G;
    boilSeed('shbody');
    piece([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], SHC.iron, { sw: 1.4, shade: SHC.ironDk, depth: 16, key: 'shbd', lift: 4 });
    const Bf = BNO.batch(); for (const [e, w] of [[12, .7], [17, .4]]) Bf.line([[x0 + e, y0 + e], [x1 - e, y0 + e], [x1 - e, y1 - e], [x0 + e, y1 - e], [x0 + e, y0 + e]], w); Bf.draw();
    BNO.diaper([[x0 + 30, y0 + 48], [x1 - 30, y0 + 48], [x1 - 30, y1 - 30], [x0 + 30, y1 - 30]], 30, { sw: .3, k: .7 });
    BNO.beads(x0 + 22, x1 - 22, y0 + 24, 2.2, { sw: .35 }); BNO.beads(x0 + 22, x1 - 22, y1 - 24, 2.2, { sw: .35 });
    shRivets([[x0 + 6, y0 + 6], [x1 - 6, y0 + 6], [x1 - 6, y1 - 6], [x0 + 6, y1 - 6], [x0 + 6, y0 + 6]], 26, 2.4);
    // the maker's cartouche, lower left; a medallion upper right; a microprint band along the top; rosettes in the
    // frame's corners; a scroll bracket under each end of the cornice
    BNO.cartouche(948, 746, 118, 58, { n: 6, lobes: 20 });
    BNO.cartouche(1186, 526, 64, 40, { n: 5, lobes: 16 });
    BNO.microBand(x0 + 40, x1 - 120, y0 + 36, 8, { seed: 31 });
    for (const [rx, ry] of [[x0 + 17, y0 + 17], [x1 - 17, y0 + 17], [x0 + 17, y1 - 17], [x1 - 17, y1 - 17]]) guilloche(rx, ry, 2, 9, { n: 5, lobes: 7, w: .3, twist: .5, beat: 3, col: BNO.ink(.85), steps: 90 });
    const Bb = BNO.batch(); for (const d of [-1, 1]) BNO.volute(Bb, d < 0 ? x0 + 30 : x1 - 30, y0 + 20, 14, -d, -Math.PI / 2, .55); Bb.draw();
    // wells behind the gears: a dark recess a little larger than each, set down and over from the light
    for (const k of ['G1', 'G2', 'G3']) { const g = G[k]; piece(oval(g.c[0] + 6, g.c[1] + 7, g.r + 3, g.r + 3, 0, 48), SHC.ironDk, { sw: .9, key: 'shwell' + k, lift: 1 }); }
    // the cornice: moulded, with dentils and egg and dart
    piece([[x0 - 18, y0 - 22], [x1 + 18, y0 - 22], [x1 + 12, y0 + 2], [x0 - 12, y0 + 2]], SHC.iron, { sw: 1.2, shade: SHC.ironDk, depth: 6, key: 'shcor', lift: 4 });
    BNO.dentils(x0 - 14, x1 + 14, y0 - 20, 8, { gap: 10, sw: .4 }); BNO.eggDart(x0 - 8, x1 + 8, y0 - 6, 9, { sw: .4 });
    // the bed on its lion's feet, and its microprint band
    for (const x of [x0 + 20, (x0 + x1) / 2, x1 - 20]) shPaw(x, SHG.GY + 4, 1.15, 'shpaw' + Math.round(x));
    piece([[x0 - 22, y1], [x1 + 22, y1], [x1 + 26, y1 + 34], [x0 - 26, y1 + 34]], SHC.iron, { sw: 1.3, shade: SHC.ironDk, depth: 8, key: 'shbed', lift: 4 });
    BNO.microBand(x0, x1, y1 + 17, 9, { seed: 23 });
    // the gearing: the barrel (lathe-worked, no spokes) and the key, the idlers with their cut-outs
    shGear(G.G3, A.G3, 'shg3', { lathe: [G.G3.r * .34, G.G3.r * .78, 18], hub: 18 });
    shGear(G.G2, A.G2, 'shg2', { spokes: 5 });
    shGear(G.G1, A.G1, 'shg1', { spokes: 4 });
    shKey(G.G3.c, keyA);
  }
  function shRollers(A) {
    const G = SHM.G;
    for (const k of ['R2', 'R1']) shGear(G[k], A[k], 'sh' + k, { col: SHC.steel, dk: SHC.steelDk, sharp: true, add: .42, lathe: [G[k].r * .3, G[k].r * .62, 12], hub: 12 });
  }
  function shChute() {
    const [cx, cy] = SHM.chute, x0 = SHM.body[2];
    boilSeed('shchute');
    const top = BNO.spline([[x0 - 6, 734], [x0 + 50, 750], [cx - 6, cy - 26]], 6), bot = BNO.spline([[x0 - 6, 796], [x0 + 52, 808], [cx - 2, cy + 22]], 6);
    piece(top.concat(bot.slice().reverse()), SHC.iron, { sw: 1.2, shade: SHC.ironDk, depth: 8, key: 'shcht', lift: 4 });
    shRivets(top.map((p, i) => [p[0], lerp(p[1], bot[i][1], .22)]), 20, 2.2);
    piece(oval(cx, cy, 10, 26, -.35, 24), SHC.dark, { sw: .9, key: 'shchm', lift: 2 });
    const L = oval(cx, cy, 12, 28, -.35, 30); piece(L.concat([L[0]], oval(cx, cy, 7, 22, -.35, 30).reverse(), [oval(cx, cy, 7, 22, -.35, 30)[29]]), SHC.brass, { sw: .9, shade: SHC.brassDk, depth: 3, key: 'shchl', lift: 3 });
  }
  // ---- the paper bits: bursts from the chute on each bite, then a spray; some caught by the wind; from "watch" a
  // fountain; from "share" they stream to the share price's head. (Spawn times fixed in advance: pure in t) ----
  const RIDE = { grow: T.share - .12, on: SHT.price + .02, soar: T.soar };
  const SHBITS = (() => {
    const out = []; let acc = 0;
    const rate = t => { let r = 0; for (const b of SH.bites) r += 260 * Math.exp(-Math.pow((t - b - .12) / .07, 2)); if (t > SH.rush) r += 70 + 70 * (t - SH.rush); if (t > SH.fount) r += 440 * seg(t, SH.fount, SH.fount + .12) * (1 - seg(t, RIDE.soar, RIDE.soar + .15)); return r; };   // (the fountain dies away once he's up)
    for (let t = SH.clunk; t < CUT.f + .1; t += 1 / 480) { acc += rate(t) / 480; while (acc >= 1) { acc -= 1; out.push(t); } }
    return out;
  })();
  const SHPILE = [1392, SHG.GY + 2];
  const shPileG = t => Math.sqrt(clamp((shFeed(t) - SH_A0) / 1100));
  const shPileTop = (x, t) => { const g = shPileG(t), w = 50 + 124 * g, h = 5 + 92 * g, u = (x - SHPILE[0]) / w; return Math.abs(u) >= 1 ? SHPILE[1] : SHPILE[1] - h * Math.pow(1 - u * u, .8); };
  // the share price: from the pile, under his feet, then steeply up and off the top right
  const SP = [[1318, 852], [1352, 822], [1382, 846], [1428, 812], [1458, 838], [DOR.x1 - 4, 874], [1592, 752], [1620, 778], [1704, 546], [1736, 572], [1834, 262], [1870, 290], [1984, -130], [2150, -470]];
  const spLen = (() => { const L = [0]; for (let i = 1; i < SP.length; i++) L.push(L[i - 1] + Math.hypot(SP[i][0] - SP[i - 1][0], SP[i][1] - SP[i - 1][1])); return L; })();
  const spAt = s => { let i = 1; while (i < SP.length - 1 && spLen[i] < s) i++; const k = clamp((s - spLen[i - 1]) / (spLen[i] - spLen[i - 1])); return { p: [lerp(SP[i - 1][0], SP[i][0], k), lerp(SP[i - 1][1], SP[i][1], k)], a: Math.atan2(SP[i][1] - SP[i - 1][1], SP[i][0] - SP[i - 1][0]) }; };
  const S_FEET = spLen[5];   // his feet (where the line picks him up)
  // his ride: from his feet (on "price") up and out of the top right in about .6 s, moving from the start, soaring on "soar";
  // the head runs on at that speed to the line's end, and the soaring line holds on its own until the door wipe. (A cubed
  // ease-in to the line's end crept for .3 s, then shot him out: about .3 s of ride before the wipe)
  const S_OUT = spLen[10] + 40, RIDE_UP = [RIDE.on + .02, RIDE.on + .58];   // (his feet at the frame's top right: the rest of him is out of it)
  const spHead = t => { if (t < RIDE.grow) return 0; if (t < RIDE.on) return S_FEET * easeOut(seg(t, RIDE.grow, RIDE.on));
    const u = Math.max(0, t - RIDE_UP[0]) / (RIDE_UP[1] - RIDE_UP[0]); return Math.min(spLen[SP.length - 1], S_FEET + (S_OUT - S_FEET) * (u <= 1 ? Math.pow(u, 1.4) : 1 + 1.4 * (u - 1))); };
  // one bit's place at t: null (not out yet, or gone), else { x, y, r (turn), kind, sz, rest }
  function shBit(i, ts, t) {
    const age = t - ts; if (age < 0) return null;
    const h1 = hash(i * 1.37 + .3), h2 = hash(i * 2.71 + 1.1), h3 = hash(i * 3.93 + 2.2), h4 = hash(i * 5.17 + 3.3), [cx, cy] = SHM.chute;
    const kind = h4 < .45 ? 'strip' : h4 < .9 ? 'bit' : h4 < .95 ? 'head' : 'tie', sz = 1.1 + .8 * hash(i * 7.7), front = 0;   // (all drawn behind him and the line)
    const spin = (4 + 9 * h2) * (h3 < .5 ? 1 : -1), r0 = h1 * TAU;
    if (ts >= SH.fount) {   // the fountain: high, then (from "share") drawn along to the share price's head
      const fz = 1.25, vx = -80 + 220 * h1, vy = -1060 - 460 * h2, g = 1300, bx = cx + 24 + vx * age, by = cy + vy * age + .5 * g * age * age;
      if (by > SHG.GY + 40 || age > 2.4) return null;
      let x = bx, y = by;
      if (ts >= RIDE.grow - .15) { const k = easeIn(seg(age, .04, .5)), hd = spAt(Math.max(0, spHead(t) - 50 - 300 * h3)).p; if (k >= 1) return null; x = lerp(bx, hd[0] + (h1 - .5) * 20, k); y = lerp(by, hd[1] + (h2 - .5) * 20, k); return { x, y, r: r0 + spin * age, kind, sz: sz * fz * (1 - .7 * k * k), front }; }   // (into the line's spine: it's made of them)
      return { x, y, r: r0 + spin * age, kind, sz: sz * fz, front };
    }
    if (h3 < .24) {   // caught by the wind: up and away to the right, fluttering
      const x = cx + (50 + 120 * h1) * age + 18 * Math.sin(age * 5 + i), y = cy - (110 + 130 * h2) * age + 14 * Math.sin(age * 3.7 + i * 1.3) + 8 * age * age;   // (up past his shoulder, behind him)
      return age > 2.6 || x > W + 40 ? null : { x, y, r: r0 + spin * .6 * age, kind, sz, front: 0 };
    }
    const vx = 110 + 300 * h1, vy = -240 + 300 * h2, g = 1500, X = a => cx + vx * (1 - Math.exp(-2.2 * a)) / 2.2, Y = a => cy + vy * a + .5 * g * a * a;
    let hit = null; for (let a = 0; a <= Math.min(age, 1.5); a += 1 / 60) if (Y(a) >= shPileTop(X(a), ts + a)) { hit = a; break; }
    if (hit == null) return age > 1.5 ? null : { x: X(age), y: Y(age), r: r0 + spin * age, kind, sz };
    if (age - hit > .6) return null;   // (settled: part of the pile now, sinking into it)
    const x = X(hit); return { x, y: shPileTop(x, t) - 2, r: r0 + spin * hit, kind, sz: sz * (1 - easeIn(seg(age - hit, .3, .6))), rest: 1 };
  }
  // paper bits, many at once: filled with paper, outlined in the ink (one batch)
  function shBits(list) {
    const T = [], B = BNO.batch(), Tr = [];
    for (const q of list) {
      const c = Math.cos(q.r), s = Math.sin(q.r), R = ([u, v]) => [q.x + u * c - v * s, q.y + u * s + v * c];
      if (q.kind === 'strip') {   // a shredded strip: long, thin, curled
        const L = 17 * q.sz, hw = 2.2 + .6 * q.sz, Lp = [], Rp = []; for (let i = 0; i <= 6; i++) { const u = lerp(-L, L, i / 6), v = Math.sin(i / 6 * Math.PI * 1.4 + q.r) * 5 * q.sz; Lp.push(R([u, v - hw])); Rp.push(R([u, v + hw])); }
        for (let i = 0; i < 6; i++) T.push(...Lp[i], ...Lp[i + 1], ...Rp[i + 1], ...Lp[i], ...Rp[i + 1], ...Rp[i]);
        B.line(Lp.concat(Rp.slice().reverse(), [Lp[0]]), .5);
      } else if (q.kind === 'head') {   // a worker's head, cut free
        const O = oval(0, 0, 6 * q.sz, 6.4 * q.sz, 0, 12).map(R); for (let k = 1; k + 1 < O.length; k++) T.push(...O[0], ...O[k], ...O[k + 1]); B.line(O.concat([O[0]]), .55);
      } else if (q.kind === 'tie') {   // his tie
        const P = [[0, -7], [3, -3], [0, 8], [-3, -3]].map(([u, v]) => R([u * q.sz, v * q.sz])); Tr.push(...P[0], ...P[1], ...P[2], ...P[0], ...P[2], ...P[3]); B.line(P.concat([P[0]]), .5);
      } else {   // a scrap: an irregular quad
        const P = [[-6, -4], [5, -5], [6, 4], [-5, 5]].map(([u, v], k) => R([u * q.sz * (.8 + .4 * hash(k + q.sz * 9)), v * q.sz])); T.push(...P[0], ...P[1], ...P[2], ...P[0], ...P[2], ...P[3]); B.line(P.concat([P[0]]), .5);
      }
    }
    bankTris(T, BANK.paper); if (Tr.length) bankTris(Tr, mixCol(SHC.red, BANK.ink, .45)); B.draw();
  }
  // the pile: a mound of paper, its bits engraved over it
  function shPile(t) {
    const g = shPileG(t); if (g <= 0) return;
    const w = 50 + 124 * g, P = []; for (let i = 0; i <= 24; i++) { const x = SHPILE[0] - w + 2 * w * i / 24; P.push([x, shPileTop(x, t) - (i % 2) * 3 * g]); }
    boilSeed('shpile'); piece(P, '#DCD2BC', { sw: .9, key: 'shpile', lift: 2 });
    const L = []; for (let k = 0; k < 90; k++) { const x = SHPILE[0] + (hash(k * 1.3) * 2 - 1) * w * .9, top = shPileTop(x, t), y = lerp(top + 4, SHPILE[1] - 2, hash(k * 2.9)); if (y > top + 3) L.push({ x, y, r: hash(k * 4.1) * TAU, kind: hash(k * 5.3) < .4 ? 'strip' : 'bit', sz: .7 + .4 * hash(k * 6.1) }); }
    shBits(L);
  }
  // puffs from the chimney: a big one on the clunk, one each bite, then a stream
  const SHPUFF = (() => { const P = [[SH.clunk, 1.4], ...SH.bites.map(b => [b + .02, .8])]; for (let t = SH.rush; t < CUT.f; t += .2) P.push([t, .9]); return P; })();
  function shPuffs(t) {
    const [x, , y1] = SHM.stack, B = BNO.batch(), T = [];
    SHPUFF.forEach(([t0, big], i) => {
      const a = t - t0; if (a < 0 || a > .95) return;
      const r = (8 + 30 * Math.pow(a / .95, .6)) * big * (1 - easeIn(seg(a, .7, .95))), c = [x + 26 * a + 50 * a * a + (hash(i) - .5) * 20 * a, y1 - 8 - 130 * a * (.8 + .4 * hash(i * 3))];
      const O = []; for (let k = 0; k < 40; k++) { const q = k / 40 * TAU; O.push(pol(c, q, r * (1 + .14 * Math.abs(Math.sin(q * 3.5 + i))))); }
      for (let k = 1; k + 1 < O.length; k++) T.push(...c, ...O[k], ...O[k + 1]); T.push(...c, ...O[O.length - 1], ...O[0]);
      B.line(O.concat([O[0]]), .7); B.line(BNO.arc(c[0] - r * .1, c[1] + r * .1, r * .55, Math.PI * .9, Math.PI * 1.7, 10), .45); B.line(BNO.arc(c[0] + r * .3, c[1] - r * .1, r * .35, Math.PI * 1.1, Math.PI * 1.9, 8), .4);
    });
    bankTris(T, BANK.paper); B.draw();
  }
  // Dorsey's phone (a hold prop: along the hand's +x, s the hand's size): its back to us, a camera bump
  const shPhone = s => { boilSeed('shphone'); piece(curvy([[-.1 * s, -.34 * s], [1.25 * s, -.38 * s], [1.28 * s, .3 * s], [-.08 * s, .34 * s]], 2), '#2A2E34', { sw: 1, key: 'shph', lift: 3 }); piece(oval(.95 * s, -.12 * s, .1 * s, .1 * s, 0, 10), '#6A7078', { sw: .6, key: 'shphc', lift: 1 }); };
  const shStep = t => { const k = seg(t, SH.step[0], SH.step[1]) * 2, n = Math.min(1, Math.floor(k)); return { k: k / 2, n, f: k >= 2 ? 1 : ease(k - n), x: (n + (k >= 2 ? 1 : ease(k - n))) / 2 }; };   // (which step, how far through it)
  const shDorX = t => lerp(DOR.x, DOR.x1, shStep(t).x);
  // the note's frame of the scene: a vignette of bare paper round the machine too (the ground's lines end on it)
  const SHV = [1000, 560, 560, 500];
  // Dorsey this frame, as v1Note draws him ({ x, y, u, o }): winds the key (two twists), lets go on "Jack"; two steps
  // back, turning away from it; his phone, the other hand in his pocket; the share price comes to his feet and takes him
  // up, still reading. His vignette is placed from the same (figHalo, DOR_HALO: about his head, the whole of him stood).
  // (dn: where the stand-placed oval sat, facing the key; crouched on the ride his head is 1.66 u lower on him, so the
  // oval's centre comes up his body by that much: it stays over the whole of him instead of dropping to his hips)
  const DOR_HALO = { dx: -.42, dn: 4.87, dnCrouch: -1.66, rx: 5.4, ry: 8.4, k: .8 };
  function shDorsey(tt) {
    const riding = tt >= RIDE.on, st = shStep(tt), stepK = st.k, lift = st.k > 0 && st.k < 1 ? Math.sin(Math.PI * st.f) : 0, dx = shDorX(tt);
    const mood = emotions(tt, [[0, 'neutral', { lookX: .5, lookY: .3 }], [SH.clunk, 'neutral', { lookX: .7, lookY: 0 }], [SH.step[0] + .12, 'neutral', { lookX: .3, lookY: .4 }], [SH.phone[0] + .1, 'neutral', { lookX: .5, lookY: .95 }], [RIDE.on + .05, 'happy', { lookX: .5, lookY: .9 }]], { take: .3 });
    const phoneP = { L: [3.1, -7.5, .4, 'hold', 1, -1.3], R: [.8, -5.3, .25, 'none', 0] };
    const rideP = { crouch: 1, rig: 'ride', L: [3.3, -7.8, .4, 'hold', 1, -1.2], R: [-3.6, -7.2, .22, 'open', 0, Math.PI + .5] };
    if (!riding) {
      const fl = stepK < .66, view = stepK >= .66 && stepK < .8 ? 'front' : 'q';
      // (the fist on the key's bow, turning with it: a half-turn a twist, the grip back between)
      const kc = SHM.G.G3.c, kb = [(kc[0] - DOR.x) / (-DOR.u * .92) - .3, (kc[1] - DOR.y) / (DOR.u * .92)];
      const windP = t2 => { const k2 = shKeyA(t2), tw = t2 < SH.wind[0][1] ? k2 : t2 < SH.wind[1][0] ? Math.PI * (1 - ease(seg(t2, SH.wind[0][1], SH.wind[1][0]))) : k2 - Math.PI;
        return { L: [-2.5, -5.0, .08, 'relax'], R: [kb[0], kb[1], .1, 'fist', 1, .35 - tw] }; };
      const pose = tt < SH.clunk ? windP(tt) : bsPoses(tt, [[0, windP(SH.clunk - .001)], [SH.clunk, { L: [-2.5, -5.0, .08, 'relax'], R: [4.6, -7.4, .1, 'open', 1, -.4] }], [SH.step[0] + .06, 'idle'], [SH.phone[0], phoneP]], .2);
      return { x: dx, y: DOR.y, u: DOR.u, o: { ...mood, view, flip: fl, pose, holdL: tt >= SH.phone[0] + .08 ? shPhone : undefined, dy: -.24 * lift, rot: (fl ? .04 : -.04) * lift, boilKey: 'v1dor', seed: 3 } };
    }
    const hd = spAt(Math.max(S_FEET, spHead(tt)));
    return { x: hd.p[0], y: hd.p[1], u: DOR.u, o: { ...mood, pose: bsPoses(tt, [[0, phoneP], [RIDE.on, rideP]], .14), slope: hd.a, wind: seg(tt, RIDE.on, RIDE.soar), view: 'q', holdL: shPhone, boilKey: 'v1dor', seed: 3 } };
  }
  function v1Note(t) {
    look('bank');
    const tt = t, HZ = SHG.HZ;
    // (bank) a vignette round Dorsey, where he stands or rides, and round the machine: the paper's and the ground's
    // lines end on them (up to bankVignetteEnd; registered through the shot's camera, so the paper, drawn before it,
    // ends there too)
    // (a still camera: the slow 3% creep in moved every world-fixed line a fraction of a pixel each frame, and the fine
    // engraving shimmered; the user: the bank look's ground doesn't redraw)
    const cam = { cx: 960, cy: 540, zoom: 1 };
    // (his placed from his pose this frame, figHalo, so it goes with him: the steps back and the turn, the ride up)
    const dor = shDorsey(tt);
    const dfit = { ...DOR_HALO, dn: DOR_HALO.dn + DOR_HALO.dnCrouch * bsGeo(BS_DORSEY, dor.o).P.crouch };
    bankVignette([figHalo('dorsey', dor.x, dor.y, dor.u, dor.o, dfit), [SHV[0], SHV[1], SHV[2], SHV[3], .8]], cam);
    bankPaper(-60, -60, W + 120, H + 120);
    camBegin(cam.cx, cam.cy, cam.zoom);
    // (the note's picture stays inside its border: the ground and the chain clipped to the band's inner rule; the price
    // line, the flying bits and Dorsey's ride cross it on purpose)
    const NOTE_IN = R4(49, 49, W - 49, H - 49);
    clipPoly(NOTE_IN, () => {
    // the note's vignette: an engraved sky (denser toward the top), a guilloche sun where he'll soar, clouds, a plaza
    // running back to the horizon
    boilSeed('v1nsky');
    [[-80, 170, 4.6, .6], [170, 300, 6.4, .5], [300, 440, 9, .45]].forEach(([y0, y1, d, w2]) => waveLines(R4(-100, y0, W + 100, y1), d, 0, 1.6, 120, mixCol(BANK.ink, BANK.paper, .38), w2));
    boilSeed('v1nsun'); guilloche(1660, 300, 110, 240, { n: 10, lobes: 16, w: .55, steps: 260, col: mixCol(BANK.ink, BANK.paper, .5) });   // (sparse and pale: a halo, not a blot)
    // (the clouds, the far hills and the plaza: a background layer, printed light with fine pale outlines, so the
    // machine, the chain and Dorsey read against them at a glance)
    bankLayer({ cap: .5 }, () => {
      boilSeed('v1ncloud'); for (const [cx, cy, w2] of [[1500, 150, 190], [420, 120, 170]]) piece(curvy([[cx - w2, cy + 20], [cx - w2 * .5, cy - 30], [cx, cy - 46], [cx + w2 * .5, cy - 26], [cx + w2, cy + 20], [cx, cy + 34]], 4), '#E4EAE6', { sw: .9, key: 'v1cl' + cx });
      boilSeed('v1nhills'); piece([[-100, HZ + 1], [-100, HZ - 22], [140, HZ - 38], [360, HZ - 18], [620, HZ - 30], [900, HZ - 12], [1200, HZ - 34], [1500, HZ - 16], [1780, HZ - 30], [W + 100, HZ - 18], [W + 100, HZ + 1]], '#C4CEC6', { sw: .8, key: 'v1nhl' });
      boilSeed('v1nground'); piece(R4(-100, HZ, W + 100, 1200), '#A8B6AC', { sw: 1.2, key: 'v1ngr' });
      if (typeof BNO !== 'undefined') {
        const B = BNO.batch(), { VX, GY } = SHG;
        for (let k = 0; k < 14; k++) { const s = 1.3 / (1 + .42 * k); B.line([[-100, HZ + (GY - HZ) * s], [W + 100, HZ + (GY - HZ) * s]], .35); }   // (the paving's courses)
        for (let i = -30; i <= 30; i++) { const X = VX + i * 150; B.line([[VX + (X - VX) * .07, HZ + (GY - HZ) * .07], [VX + (X - VX) * 1.4, HZ + (GY - HZ) * 1.4]], .3); }   // (its joints)
        B.line([[-100, HZ], [W + 100, HZ]], .5);
        B.draw();
        for (const [cx, cy, w2] of [[1500, 150, 190], [420, 120, 170]]) for (let r = 0; r < 3; r++) {   // (the clouds' billows)
          const P = []; for (let k = 0; k <= 30; k++) { const u = k / 30, x = cx - w2 * (.8 - r * .2) + u * w2 * (1.6 - r * .4); P.push([x, cy + 12 - r * 12 - Math.abs(Math.sin(u * Math.PI * (4 - r))) * (14 - r * 3)]); }
          B.line(P, .35);
        }
        B.draw();
      }
    });
    }, { screen: true });
    bankVignetteEnd();   // (the ground ends: the machine, the chain, Dorsey and the price line over bare paper)
    // the figures, at full tone, in finer lines than the ground
    const dens0 = BANK.dens; BANK.dens = (dens0 || 1) * 1.2;
    const f = shFeed(tt), fv = shTurn(tt), A = shAngles(fv), keyA = shKeyA(tt);
    const run = tt >= SH.clunk, shake = run ? spring(tt, SH.clunk, 9, 44) * 5 + SH.bites.reduce((m, b) => m + spring(tt, b, 14, 60) * 1.6, 0) : 0;
    const chain = shChain(tt), far = chain.filter(D => D.s < .985), near = chain.filter(D => D.s >= .985);
    clipPoly(NOTE_IN, () => bankFigure(() => far.forEach(shDoll)), { screen: true });
    // the machine, behind the chain: the flywheel on its stand, the belt, the chimney and its gauge, the maw's inside
    bankFigure(() => {
      push(); translate(0, -Math.abs(shake) * .6);
      shFly(A.G2 * 15 / 16); shChimney(); shGauge(clamp(.08 + (run ? .55 * easeOut(seg(tt, SH.clunk, SH.clunk + .3)) + .25 * seg(tt, SH.rush, CUT.f) + .05 * Math.sin(tt * 23) * seg(tt, SH.rush, SH.rush + .3) : 0)));
      shMawBack();
      pop();
    });
    clipPoly(NOTE_IN, () => bankFigure(() => near.forEach(shDoll)), { screen: true });
    bankFigure(() => {
      push(); translate(0, -Math.abs(shake) * .6);
      shBody(A, keyA); shBelt(fv); shRollers(A); shMawFront(); shChute();
      pop();
      shPuffs(tt);
    });
    // the pile, the share price growing out of it (the shot's other subject: its ribbon contour-hatched, a microprint
    // rule along its spine like a certificate's), then Dorsey
    bankFigure(() => shPile(tt));
    // the bits in the air: behind the line and behind him (so neither is lost in them)
    const bitsNow = []; SHBITS.forEach((ts, i) => { if (ts > tt) return; const q = shBit(i, ts, tt); if (q) bitsNow.push(q); });
    bankFigure(() => shBits(bitsNow));
    const head = spHead(tt);
    if (head > 4) {
      const P = [SP[0]]; for (let i = 1; i < SP.length && spLen[i] < head; i++) P.push(SP[i]); P.push(spAt(head).p);
      bankFigure(() => {
        boilSeed('v1sp'); piece(ribbon(P, 30, 34), '#1F6A48', { sw: 1.8, key: 'v1spl', lift: 3 });
        const hd = spAt(head);
        push(); translate(hd.p[0], hd.p[1]); rotate(hd.a); piece([[4, -38], [60, 0], [4, 38]], '#1F6A48', { sw: 1.8, key: 'v1sph', lift: 3 }); pop();
        if (typeof BNO !== 'undefined') BNO.microRule(P, 5, { k: .55 });
      });
    }
    // Dorsey: winds the key (two twists), lets go on "Jack"; two steps back, turning away from it; his phone, the other
    // hand in his pocket; the share price comes to his feet and takes him up, still reading
    dorsey(dor.x, dor.y, dor.u, dor.o);   // (shDorsey: the steps back, the phone, the ride)
    BANK.dens = dens0;
    camEnd();
    // the note's border: guilloche bands, corner rosettes, a fine double rule
    boilSeed('v1nborder');
    if (typeof BNO !== 'undefined') { BNO.noteFrame(0, 0, W, H); return; }   // (the full frame: bankorn.js)
    for (const [y, h] of [[34, 34], [H - 34, 34]]) guillocheBand(-20, W + 20, y, h, { n: 4, wl: 90, w: .5 });
    for (const [cx, cy] of [[70, 70], [W - 70, 70], [70, H - 70], [W - 70, H - 70]]) guilloche(cx, cy, 22, 58, { n: 8, lobes: 10, w: .5, steps: 200 });
    for (const d of [10, 17]) { dline([[d, d], [W - d, d]], .8, BANK.ink); dline([[d, H - d], [W - d, H - d]], .8, BANK.ink); dline([[d, d], [d, H - d]], .8, BANK.ink); dline([[W - d, d], [W - d, H - d]], .8, BANK.ink); }
    // (in: the chain falls in from above, carried over from the copier, and lands on its path)
  }
  SHOT.V1e = t => { if (t < CUT.e) { SHOT.V1d(t); return; } v1Note(t); };

  // ================================================================================================================
  // V1f: HR. The twins hold the doors; the humans are tipped out through them, one per beat, faster and faster
  // ================================================================================================================
  const HR = { x: 960, y: 792, u: 30, DW: 4.6, DH: 9, LW: 1.5 };
  const TIPS = [BT(78), BT(79), BT(79) + .23, BT(80), T.door - .02];
  const HUMANS = [PP_CAST[0], PP_CAST[2], PP_CAST[4], PP_CAST[6], HER_C];
  const HRU = 15, SLOT0 = 262, SLOT = 124, QSTART = TIPS[0] - .44;
  const slotX = k => k <= 0 ? HR.x : HR.x + SLOT0 + (k - 1) * SLOT;
  function v1Doorway(part, tt) {
    const u = HR.u, sw = clamp(u / 20, .5, 2.2), G = B2GM, S = P => U(P, u, HR.x, HR.y), DW = HR.DW, DH = HR.DH, LW = HR.LW;
    const Rr = (x0, y0, x1, y1) => S([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
    if (part === 'back') {
      boilSeed('v1dwb');
      piece(Rr(-DW / 2 - .42, -DH - .42, DW / 2 + .42, 0), G.frame, { sw, shade: G.frameDk, depth: .25 * u, key: 'v1dfr', lift: 3 });
      piece(Rr(-DW / 2, -DH, DW / 2, 0), G.out, { sw: sw * .8, key: 'v1dout', lift: 0 });
      piece(Rr(-DW / 2, -DH * .3, DW / 2, 0), G.outLt, { ink: null, key: 'v1dpave', lift: 0, flatCard: true, edge: false });
      for (let i = 0; i < 9; i++) { const rx = -DW / 2 + .3 + (DW - .6) * hash(i * 3.1), ry = -DH + .4 + (DH * .62) * frac(hash(i * 1.7) + tt * .9), L = .55;
        piece(b2Taper(S([[rx, ry], [rx - .06, ry + L * .5], [rx - .12, ry + L]]), .05 * u, 3), '#8A95AA', { ink: null, key: 'v1drain' + i, lift: 0, flatCard: true, edge: false }); }
      return;
    }
    boilSeed('v1dwl');
    for (const s of [-1, 1]) {
      const h = s * DW / 2, f = s * (DW / 2 + LW), Lp = (t2, v) => [lerp(h, f, t2), lerp(lerp(-DH, -DH - .55, t2), lerp(0, .42, t2), v)];
      const quad = (t0, t1, v0, v1) => S([Lp(t0, v0), Lp(t1, v0), Lp(t1, v1), Lp(t0, v1)]);
      piece(quad(0, 1, 0, 1), G.leaf, { sw: sw * 1.1, shade: G.leafDk, depth: .35 * u, key: 'v1dleaf' + s, lift: u * .08 });
      piece(S([Lp(1, 0), [f + s * .2, -DH - .5], [f + s * .2, .38], Lp(1, 1)]), G.leafLt, { sw: sw * .8, key: 'v1dedge' + s, lift: 1 });
      piece(quad(.3, .75, .1, .4), G.window, { sw: sw * .7, key: 'v1dwin' + s, lift: 1, flatCard: true });
      piece(quad(.12, .9, .53, .56), G.steel, { sw: sw * .6, key: 'v1dbar' + s, lift: 1, flatCard: true });
      piece(quad(.05, .95, .88, .97), G.steelDk, { sw: sw * .5, key: 'v1dkick' + s, lift: 1, flatCard: true });
    }
    const ey = -DH - 1.35;
    piece(b2RoundPoly(Rr(-1.25, ey - .48, 1.25, ey + .48), .12 * u), G.exit, { sw, shade: G.exitDk, depth: .1 * u, key: 'v1dexit', lift: 2 });
    const man = (P, w) => piece(b2Taper(S(P), w * u, 4), G.exitLt, { ink: null, key: 'v1dman' + P[0][0].toFixed(2) + P[1][1].toFixed(2), lift: 0, flatCard: true, edge: false });
    piece(oval(HR.x - .62 * u, HR.y + (ey - .3) * u, .1 * u, .1 * u, 0, 10), G.exitLt, { ink: null, key: 'v1dmanh', lift: 0, flatCard: true, edge: false });
    man([[-.66, ey - .16], [-.72, ey + .1]], .12); man([[-.72, ey + .08], [-.9, ey + .34]], .1); man([[-.72, ey + .08], [-.52, ey + .2], [-.46, ey + .38]], .1);
    man([[-.66, ey - .12], [-.86, ey + .0]], .08); man([[-.66, ey - .12], [-.48, ey - .02]], .08);
    piece(S([[-.15, ey - .06], [.5, ey - .06], [.5, ey - .24], [.85, ey], [.5, ey + .24], [.5, ey + .06], [-.15, ey + .06]]), G.exitLt, { ink: null, key: 'v1darrow', lift: 0, flatCard: true, edge: false });
  }
  // a human cut-out on a wooden stand in the track at (x, y); tip 0..1 tips it over backwards through the door
  function v1Cutout(P, x, y, tip, key, tt, extra = {}) {
    const k = Math.cos(tip * Math.PI / 2);
    if (k < .04) return;
    push(); translate(x, y - 22 * Math.sin(tip * Math.PI / 2)); scale(1 - .15 * tip, k); rotate(.06 * spring(tt, extra.stepT ?? -9, 7, 22));
    person(0, 0, HRU, P, { ...feel('neutral', tt, { seed: key.length }), mouth: 'flat', emote: null, noShadow: true, pose: extra.pose || 'low', boilKey: key, ...extra });
    pop();
    if (tip < .3) { boilSeed(key + 'st'); piece(R4(x - 30, y - 8, x + 30, y + 10), '#8A6A48', { sw: 1, key: key + 'stand', lift: 2, flatCard: true }); }
  }
  function v1HumanState(j, tt) {
    const nT = TIPS.filter(s => s <= tt).length, steps = (tt >= QSTART ? 1 : 0) + nT, slot = j + 1 - steps;
    const last = nT ? TIPS[nT - 1] : QSTART, kStep = tt >= QSTART ? easeOut(seg(tt, last, last + .15)) : 1;
    const tip = tt >= TIPS[j] ? ease(seg(tt, TIPS[j], TIPS[j] + .24)) : 0;
    return { x: tip > 0 ? HR.x : lerp(slotX(slot + 1), slotX(slot), kStep), tip, inDoor: slot <= 0 || tip > 0, stepT: last };
  }
  function v1HR(t) {
    look('card');
    // (the camera's push into the doorway runs on ones, as a motion-control move: on twos it would stutter)
    const tt = mt(t), push2 = ease(seg(t, T.door + .08, CUT.g));
    const c0 = kf(t, [[CUT.f, [1000, 640, 1.92]], [T.showH, [1030, 634, 1.86]], [T.showH + .55, [1150, 620, 1.6]], [T.door, [1090, 622, 1.68]]]);
    // (into the rainy night in the top of the doorway, over the head of the next one in the queue: pushed into the door's
    // middle the frame filled with his grey silhouette before it went dark)
    const cz = c0[2] * Math.pow(18 / c0[2], push2), cam = [lerp(c0[0], HR.x, Math.min(1, push2 * 1.6)), lerp(c0[1], HR.y - HR.DH * HR.u * .86, Math.min(1, push2 * 1.6)), cz];
    camBegin(cam[0], cam[1], cam[2]);
    // the lobby: a cool wall with a feature stripe, the company sparkle over the door, a values poster; a polished floor
    boilSeed('v1hrwall');
    piece(R4(-400, -400, W + 400, HR.y + 4), '#C9D2D4', { ink: null, key: 'v1hrw', lift: 0, edge: false });
    piece(R4(-400, 300, W + 400, 330), '#9FB3BA', { ink: null, key: 'v1hrstripe', lift: 0, flatCard: true, edge: false });
    piece(b2Sparkle(HR.x, 170, 44, 0), '#8FA8F0', { sw: 1.3, shade: '#6A7FCC', depth: 8, key: 'v1hrspark', lift: 4 });
    piece(R4(1330, 400, 1480, 600), '#F4F2EC', { sw: 1.3, key: 'v1hrpost', lift: 4 });
    piece(heartPts(1405, 470, 34), '#E2476E', { sw: 1, key: 'v1hrheart', lift: 1, flatCard: true });
    piece(b2Sparkle(1440, 440, 16, 0), '#B59AF2', { sw: .8, key: 'v1hrps', lift: 1, flatCard: true });
    for (let i = 0; i < 2; i++) prScrib(1360, 540 + i * 18, 90 - i * 30, 2, '#9AA6B2', 1.2, i);
    boilSeed('v1hrfloor');
    piece(R4(-400, HR.y, W + 400, 1500), '#A9ACB2', { ink: null, key: 'v1hrf', lift: 0, edge: false });
    piece(R4(-400, HR.y - 16, W + 400, HR.y + 4), '#7E8691', { sw: 1, key: 'v1hrskirt', lift: 2, flatCard: true });
    piece(R4(HR.x, HR.y + 8, W + 400, HR.y + 16), '#4A4E56', { ink: null, key: 'v1hrtrack', lift: 0, flatCard: true, edge: false });
    v1Plant(560, HR.y + 2, 2.2, 'v1hrpl', 0);
    v1Doorway('back', tt);
    // the humans: first the one(s) in the doorway (being tipped out into the rain), then the queue on the track
    const hum = (j, st) => {   // everyone leaves with a box; hers has the leaving card in it
      const P = HUMANS[j], her = P === HER_C, fr = personFrame(P, {}), by = fr.yh - 1.1;
      v1Cutout(P, st.x, HR.y, st.tip, 'v1hum' + j, tt, { stepT: st.stepT, pose: carry(0, by, 2.3), ...(her ? { mouth: 'frown', eyes: 'sad', sing: false } : {}) });   // (a cut-out being processed: she narrates, mouth shut, as in the office)
      if (st.tip < .35) {
        v1Box(st.x, HR.y + (by + 1.9) * HRU, 74, 'v1hrbox' + j, her ? 1 : .3);
        if (her) { boilSeed('v1hrcard'); push(); translate(st.x + 9, HR.y + (by + 1.9) * HRU - 74 * .62 - 11); b2LeavingCard(34, 'v1hrlc', .6); pop(); }
      }
    };
    const S2 = HUMANS.map((P, j) => v1HumanState(j, tt));
    S2.forEach((st, j) => { if (st.inDoor && st.tip > 0) hum(j, st); });
    v1Doorway('leaves', tt);
    // the twins: fixed HR smiles, lanyards, holding the doors; they bob on the beat, and wave each one off
    // (courteous, not triumphant: a polite smile, and a little bow as each one goes). Drawn before the queue: the humans
    // walk up the track in front of them and only step back into the doorway (drawn under the leaves, above)
    const bow = TIPS.reduce((a, s) => a + (tt >= s ? Math.sin(Math.PI * clamp((tt - s) / .36)) : 0), 0);
    const gm = feel('happy', tt, { mouth: 'smile', emote: null, blush: .4 });
    gemini(HR.x, HR.y + 4, HR.u, { ...gm, dy: (gm.dy || 0) + .3 * bow, sq: (gm.sq || 0) + .06 * bow, tilt: .2 * bow, pose: 'door', door: false, fixed: false, boilKey: 'v1gmD', t: tt, lookX: tt > T.showH ? .15 : 0, lookY: .3 * bow });
    S2.forEach((st, j) => { if (!st.inDoor || st.tip === 0) hum(j, st); });   // (the next one waits at the door, in front of the twin, until tipped out)
    // ...and the queue runs on behind her, off down the track: dark cut-outs, stepping up with the rest (demo/cast/crowd.js)
    for (let j = HUMANS.length; j < HUMANS.length + 6; j++) { const st = v1HumanState(j, tt); crowdCutout(st.x, HR.y, HRU, j, tt, st.stepT); }
    camEnd();
  }
  function v1DoorSwing(k) {   // k 0..1, shut at .5: a door leaf hinged on the left edge swings across the frame and back
    look('card');
    const c = k < .5 ? easeIn(k * 2) : 1 - easeOut((k - .5) * 2), x = lerp(-10, W + 60, c), sk = 90 * (1 - c);
    if (c < .02) return;
    boilSeed('v1swing');
    piece([[-60, -60 - sk * .3], [x, -60 - sk], [x, H + 60 + sk], [-60, H + 60 + sk * .3]], B2GM.leaf, { sw: 2.4, shade: B2GM.leafDk, depth: 40, key: 'v1swl', lift: 14 });
    const Lp = (u2, v) => [lerp(-60, x, u2), lerp(lerp(-60 - sk * .3, -60 - sk, u2), lerp(H + 60 + sk * .3, H + 60 + sk, u2), v)];
    const q = (a, b, c2, d) => [Lp(a, c2), Lp(b, c2), Lp(b, d), Lp(a, d)];
    piece(q(.3, .75, .1, .4), B2GM.window, { sw: 1.6, key: 'v1swwin', lift: 3, flatCard: true });
    piece(q(.12, .9, .53, .56), B2GM.steel, { sw: 1.4, key: 'v1swbar', lift: 3, flatCard: true });
    piece(q(.05, .95, .88, .97), B2GM.steelDk, { sw: 1.2, key: 'v1swkick', lift: 3, flatCard: true });
  }
  SHOT.V1f = t => {
    const S0 = CUT.f - .26, S1 = CUT.f + .26;
    if (t < CUT.f) v1Note(t); else v1HR(t);
    if (t >= S0 && t < S1) v1DoorSwing(seg(t, S0, S1));
  };

  // ================================================================================================================
  // V1g: the laptop. The Xbox bloke offers a controller; it comes out of the screen and hugs her
  // ================================================================================================================
  const POP = T.ai + .08;   // the controller comes out of the screen (the cut to the wide)
  // the comfort bot: a game controller with goggly eyes, a grin and white-gloved noodle arms. (x, y) its centre, s ≈ u.
  // o.arms: [[x, y], [x, y]] hand targets (else it waves them); o.handPose; o.rot, o.sq; eyes, mouth, lookX/Y
  function v1Pad(x, y, s, tt, o = {}) {
    const C = BS_TC, sw = clamp(s / 20, .5, 2), sq = o.sq || 0, key = 'v1pad';
    // (a hug: from its sides out round her shoulders to behind her neck; drawn before her, only the elbows show)
    const armAround = (sd, tip) => { const root = [x + sd * 1.45 * s, y - .1 * s], mid = [x + sd * 3.3 * s, lerp(root[1], tip[1], .55)];
      limb([root, mid, tip], .38 * s, .32 * s, '#3A3844', { sw, shade: '#24222A', key: key + 'hug' + sd }); };
    const arm = (sd, tip) => {
      const root = [x + sd * 1.55 * s, y + .05 * s], d = Math.hypot(tip[0] - root[0], tip[1] - root[1]), mid = [lerp(root[0], tip[0], .5) + sd * .25 * d * .3, lerp(root[1], tip[1], .5) - .18 * d];
      const r = limb([root, mid, tip], .36 * s, .3 * s, '#3A3844', { sw, shade: '#24222A', key: key + 'arm' + sd });
      hand(r.tip[0], r.tip[1], r.ang, .62 * s, { pose: o.handPose || 'open', glove: true, sw: sw * .6, mirror: sd < 0, key: key + 'h' + sd });
    };
    boilSeed(key + 'arms');
    const tips = o.arms || [[x - 2.7 * s, y - 1.4 * s + .5 * s * Math.sin(tt * TAU * 2)], [x + 2.7 * s, y - 1.6 * s - .5 * s * Math.sin(tt * TAU * 2 + 1)]];
    if (o.part === 'arms') { armAround(-1, tips[0]); armAround(1, tips[1]); return; }
    if (!o.armsFront && o.part !== 'body') { arm(-1, tips[0]); arm(1, tips[1]); }
    push(); translate(x, y); rotate(o.rot || 0); scale(1 + sq * .5, 1 - sq);
    boilSeed(key + 'body');
    const body = [[-1.35, -.55], [-.6, -.72], [0, -.6], [.6, -.72], [1.35, -.55], [1.62, -.1], [1.72, .5], [1.55, .9], [1.25, .95], [.9, .5], [.4, .35], [-.4, .35], [-.9, .5], [-1.25, .95], [-1.55, .9], [-1.72, .5], [-1.62, -.1]];
    piece(curvy(U(body, s * 1.25), 5), C.pad, { sw: sw * 1.1, shade: C.padDk, depth: .25 * s, rim: C.padLt, key: key + 'b', lift: 4 });
    // its face: the thumbsticks are its eyes (pie-cut pupils), a grin under the guide button, the face buttons for cheeks
    const kinds = b2EyeKinds(o, tt, 2);
    [[-.62, -.14], [.62, -.14]].forEach(([ex, ey], i) => b2PieEye(ex * 1.25 * s, ey * 1.25 * s, .8 * s, .88 * s, i ? 1 : -1, kinds[i], { sw, look: [o.lookX || 0, o.lookY || 0], skin: C.pad, key: key + 'e' + i, t: tt, whiteInk: NOIR.ink, whiteSw: .6 }));
    push(); translate(0, .42 * s); b2Mouth(.5 * s, o.mouth || 'grin', { sw, key: key + 'm', lw: .1 * s, t: tt }); pop();
    [[1.42, -.5, '#3FAE4A'], [1.66, -.22, '#D8434A'], [-1.5, -.36, '#3E7FD0']].forEach(([bx, by, col], i) => piece(oval(bx * s, by * s, .13 * s, .13 * s, 0, 12), col, { sw: sw * .5, key: key + 'bt' + i, lift: 1, flatCard: true }));
    piece(oval(0, -.66 * s, .16 * s, .16 * s, 0, 12), '#62B46E', { sw: sw * .5, key: key + 'guide', lift: 1, flatCard: true });
    pop();
    if (o.armsFront) { arm(-1, tips[0]); arm(1, tips[1]); }
  }
  // the laptop in close-up: the screen fills the frame inside its bezel; the Xbox bloke on it
  function v1LaptopCU(t) {
    look('card');
    // (the push into the doorway lands just before "Xbox" and the doorway's dark is her laptop's dark screen: on "Xbox"
    // its webcam light comes on and the screen wakes, the backlight coming up from the middle as the rain fades off the
    // glass and the bezel shows against it; on "bloke" the page and the Xbox bloke. Lit all at once straight after the
    // push it read as a double jump; dark until "bloke" it was a dead second)
    // (the screen's light on ones, like a camera: a whole-frame fade on twos steps; what's drawn on it on twos)
    // (review 2: ~.8 s of rain and a faint spinner before the page was close to dead air: now it wakes on "Xbox", the page
    // comes up a third of a second later, and the bloke rises into it on "bloke")
    const tt = mt(t), wake = ease(seg(t, T.xbox - .02, T.xbox + .3)), onL = seg(t, T.xbox + .2, T.xbox + .42), on = seg(tt, T.bloke - .12, T.bloke + .12), push3 = seg(t, CUT.g, POP);   // (the push on ones)
    camBegin(960, 540, 1.0 + .06 * push3);
    boilSeed('v1scr');
    piece(R4(-100, -100, W + 100, H + 100), mixCol(mixCol(B2GM.out, '#56637C', wake), '#DCE6F0', onL), { ink: null, key: 'v1scrbg', lift: 0, edge: false });   // (off: the doorway's rainy night)
    if (wake > 0 && onL < 1) {
      glow(W / 2, H / 2 + 40, 420 + 560 * wake, '#B4C8E8', .42 * wake * (1 - onL));   // (the backlight, from the middle out)
      // waking: a ring of dots going round (on twos: its head moves a dot a step), in the bar's green
      const hd = Math.floor(tt * 12) % 10;
      for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU - Math.PI / 2, age = (hd - i + 10) % 10, r = 13 - 1 * age;
        if (age < 7) piece(oval(W / 2 + 72 * Math.cos(a), H / 2 - 20 + 72 * Math.sin(a), r, r, 0, 12), mixCol('#1E9A2A', '#DCE6F0', age / 9), { ink: null, key: 'v1spin' + i, lift: 0, flatCard: true, edge: false, op: 255 * ease(clamp(wake * 1.6 - .3)) * clamp(1 - 3 * onL) }); }
    }
    if (onL < .5 && wake < 1) for (let i = 0; i < 20; i++) { const rx = hash(i + 3) * W, ry = frac(hash(i + 50) + tt * .9) * (H + 200) - 100;
      piece(b2Taper([[rx, ry], [rx - 8, ry + 40], [rx - 16, ry + 80]], 7, 3), '#8A95AA', { ink: null, key: 'v1scrrain' + i, lift: 0, flatCard: true, edge: false, op: 255 * (1 - wake) }); }
    if (onL > 0) {
      piece(R4(-100, -100, W + 100, 210), '#107C10', { ink: null, key: 'v1scrbar', lift: 0, flatCard: true, edge: false, op: 255 * onL });
      piece(R4(260, 250, 1660, 1300), '#F7F9FB', { sw: 2, key: 'v1scrcard', lift: 4, op: 255 * onL });
      for (let i = 0; i < 3; i++) prScrib(1100, 330 + i * 46, 420 - i * 90, 5, '#9AA6B2', 4, i);
      piece(oval(360, 330, 60, 60, 0, 24), '#107C10', { ink: null, key: 'v1scravatar', lift: 1, flatCard: true });
      piece(heartPts(1480, 1000, 40), '#E2476E', { sw: 1.4, key: 'v1scrlike', lift: 2, flatCard: true });
      const mood = emotions(tt, [[0, 'happy', { mouth: 'grin' }], [T.bloke, 'excited', { mouth: 'grin', emote: null }], [T.reckons, 'happy', { mouth: 'grin' }]]);
      const pose = bsPoses(tt, [[0, 'present'], [T.reckons - .05, 'offer']]);
      const pop2 = seg(tt, POP - .22, POP);
      turnbull(760, 1120 + 240 * (1 - backOut(on)), 64, { ...mood, view: 'q', pose, pad: pop2 <= 0, boilKey: 'v1tb', seed: 5, lookX: pop2 > 0 ? .8 : 0 });
      if (pop2 > 0) { const s = lerp(36, 190, easeIn(pop2)); v1Pad(lerp(1000, 1020, pop2), lerp(760, 600, pop2), s, tt, { eyes: 'wide', mouth: 'open', rot: -.2 * pop2 }); }
    }
    camEnd();
    // the bezel over the edges (it slides in: the push into the doorway came out of her screen)
    boilSeed('v1bezel');
    const bz = lerp(-30, 70, ease(seg(t, CUT.g, CUT.g + .35)));   // (the laptop's, so it pulls in with the camera: on ones)
    if (bz > 0) { for (const P of [R4(-60, -60, W + 60, bz), R4(-60, H - bz, W + 60, H + 60), R4(-60, -60, bz, H + 60), R4(W - bz, -60, W + 60, H + 60)]) piece(P, PRF.bezel, { ink: null, key: 'v1bz' + P[0][0] + P[0][1], lift: 0, flatCard: true, edge: false });
      piece(oval(W / 2, bz / 2, 6, 6, 0, 12), tt >= T.xbox ? '#62D46E' : '#4A4E56', { ink: null, key: 'v1cam', lift: 0, flatCard: true }); }
    if (onL > 0 && onL < 1) glow(W / 2, H / 2, 900, '#DCEBFF', .5 * (1 - onL));
  }
  // her flat: her on the sofa at the laptop, the bot out of the screen and clinging to her
  const HUGS = { jump: [POP, T.helps - .02], on: T.helps, squeeze: T.cope };
  const SOFA = FLAT.sofa, PADU = 27;
  const sofaO = { seated: true, seatH: SOFA[3], view: 'q', flip: true };
  // her unpaid bills (flatFront's o.bills: the red band, the red clock "due" stamp), piled at the table's back between her
  // notebook and the pot noodle, the tea in front: V1h's camera dips to show them on "cheque" (the subtitle banner covers
  // the table otherwise). Five through the one wide shot (V1g's hug into V1h: no bill pops in on camera), more by the split
  const v1Bills = tt => ({ bills: tt < CUT.i ? 5 : 5 + Math.round(2 * seg(tt, CUT.i, 54)), billsAt: [1062, 842, 1.1] });
  const HERC = [SOFA[0] - 14, SOFA[1] - (SOFA[3] + 3.35) * HU];                     // her upper chest (where the bot clings)
  const NECK = [SOFA[0] - 4, SOFA[1] - (SOFA[3] + 4.9) * HU];                         // the back of her neck (its hands)
  // the bot hugging her: its arms go round behind her (drawn before her: o.part 'arms'), its body on her chest after
  function v1Clinger(tt, sqz, part, o = {}) {
    v1Pad(HERC[0], HERC[1], PADU, tt, { part, arms: [[NECK[0] - 16, NECK[1]], [NECK[0] + 16, NECK[1]]], sq: sqz, eyes: 'happy', mouth: 'grin', ...o });
  }
  // V1g's hug and V1h are one continuous shot across CUT.h (the line after "cope"): the same squeeze (a squeeze on
  // "cope", then its pulse) and her moods carry across it (V1h used to cut to its own camera, the bot's eyes open and her
  // look changed on the cut: a jump cut in the same place)
  const hugSq = tt => tt >= HUGS.on ? (tt >= T.cope - .05 ? .2 * Math.exp(-3 * Math.max(0, tt - T.cope)) : 0) + .04 * pulse(tt) : 0;
  const HUG_MOOD = [[0, 'bored', { lookX: .8, lookY: .5 }], [POP + .06, 'surprised', { lookX: .9, lookY: .1, emote: null }], [T.helps + .06, 'bored', { lookX: .2, lookY: .6 }],
    [T.cope - .05, 'neutral', { eyes: 'squeeze', lookX: 0 }], [T.cope + .45, 'bored', { lookX: .2, lookY: .5 }]];
  const hugEyes = tt => tt > T.cope - .05 && tt < T.cope + .4 ? 'squeeze' : 'happy';
  function v1FlatHug(t) {
    look('card');
    const tt = mt(t), cam = kf(t, [[POP, [800, 668, 1.9]], [T.helps, [850, 648, 2.0]], [CUT.h, [860, 644, 2.06]]]);   // (the camera and its shake on ones)
    const sh = t > T.cope - .05 && t < T.cope + .4 ? shakeXY(t, 3 * (1 - seg(t, T.cope, T.cope + .4))) : [0, 0];
    camBegin(cam[0] + sh[0], cam[1] + sh[1], cam[2]);
    flatBack(tt, tt, { rain: 1, post: Math.round(lerp(4, 11, seg(tt, 35.5, 54))) });   // (the unopened post piling up through her verse: more red ones)
    // the bot: out of the screen on an arc, onto her chest, arms over her shoulders; a squeeze on "cope"
    const jumpK = seg(tt, HUGS.jump[0], HUGS.jump[1]), hugging = tt >= HUGS.on;
    // (a low hop, under her face: arced high it crossed her face just as she reacts to it)
    const scrC = FLAT.lidAway.face, pp = arcPt(scrC, HERC, 50, easeOut(jumpK));   // (out of the screen: it faces her, so off the lid's edge on her side)
    const sqz = hugSq(tt), mood = emotions(tt, HUG_MOOD, { take: .6 });
    if (hugging) v1Clinger(tt, sqz, 'arms');
    person(SOFA[0], SOFA[1], HU, HER_C, { ...mood, sq: (mood.sq || 0) + sqz * .5, ...sofaO, pose: 'lap', boilKey: 'v1herF' });
    flatFront(tt, tt, { lidAway: true, screenGlow: 1, ...v1Bills(tt) });   // (the laptop faces her: we saw its screen in the close-up)
    if (hugging) v1Clinger(tt, sqz, 'body', { eyes: hugEyes(tt) });
    else if (jumpK > 0) v1Pad(pp[0], pp[1], lerp(12, PADU, ease(seg(jumpK, 0, .6))), tt, { eyes: 'wide', mouth: 'open', rot: -.4 * Math.sin(jumpK * Math.PI), arms: [[pp[0] - 58, pp[1] - 40], [pp[0] + 58, pp[1] - 46]] });   // (arms out for the hug)
    camEnd();
  }
  SHOT.V1g = t => {
    if (t < CUT.g) { v1HR(t); return; }
    if (t < POP) v1LaptopCU(t); else v1FlatHug(t);
  };

  // ================================================================================================================
  // V1h: "Can it write a cheque, or just a paragraph of hope?"
  // ================================================================================================================
  // a blank cheque, centred (0, 0): a slip of card stock (a real thing in her card flat: its cut edge and shadow), its
  // engraved face printed on it in the banknote look, inside the printed border (a picture keeps its own medium inside
  // its frame: styleaudit 2026-09-25; the whole slip used to be engraving, a bank object loose in her room)
  function v1Cheque(w, key) {
    const h = w * .42, m = w * .045, P = R4(-w / 2, -h / 2, w / 2, h / 2), F = R4(-w / 2 + m, -h / 2 + m, w / 2 - m, h / 2 - m);
    look('card'); boilSeed(key);
    piece(P, '#F1EFE6', { sw: .7, key: key + 'slip', lift: 3 });
    clipPoly(F, () => {
      const [x0, y0, x1, y1] = [-w / 2 + m, -h / 2 + m, w / 2 - m, h / 2 - m], ww = x1 - x0;
      look('bank'); boilSeed(key + ' face');
      _paint(F, { wash: '#E6EFEA', ink: null });
      waveLines(F, 5, 12, 2, 80, mixCol(BANK.paper, BANK.ink, .35), .5);
      guillocheBand(x0 + 5, x1 - 5, y0 + 10, 11, { n: 3, wl: 40, w: .5 });
      guilloche(x0 + ww * .17, h * .08, 10, 26, { n: 6, lobes: 8, w: .45, steps: 120 });
      for (const [a, b, y] of [[-w * .12, w * .4, -h * .06], [-w * .12, w * .28, h * .15], [w * .12, w * .4, h * .3]]) dline([[a, y], [b, y]], 1, BANK.ink);
      dline([[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]], 1.3, BANK.ink);
    });
    look('card');
  }
  const PALM = [SOFA[0] - 4.1 * HU, SOFA[1] - (SOFA[3] + 3.6) * HU];   // her open palm, held out
  const V1H_CAM = [[CUT.h, [860, 644, 2.06]], [T.can, [858, 648, 2.05]], [T.cheque + .05, [900, 684, 1.78]], [T.or, [897, 685, 1.79]], [CUT.i, [892, 682, 1.84]]];
  function v1ParaScene(t) {
    look('card');
    // (on ones: from V1g's last framing, easing on to V1h's. From "Can it" it tilts down and eases back a little, so by
    // "cheque" the bills on the table stand clear above the subtitle banner, her head still in, and the cheque drifts down
    // into it; then it holds, drifting, through the paragraph (the coordinator, for the user: the pile was never seen))
    const tt = mt(t), cam = kf(t, V1H_CAM);
    camBegin(cam[0], cam[1], cam[2]);
    flatBack(tt, tt, { rain: 1, post: Math.round(lerp(4, 11, seg(tt, 35.5, 54))) });   // (the unopened post piling up through her verse: more red ones)
    const chq0 = T.can + .25, chq1 = T.cheque + .3, talk = tt >= T.or;
    const heap = ease(seg(tt, T.para - .05, T.hope + .2));
    const palm = { L: [4.1, -(SOFA[3] + 3.6) + .1, .25, 'open', 1, -.25, 'u'], R: [1.2, -(SOFA[3] + .9), .4, 'relax', 1, .6, 'u'] };
    // (on "paragraph" she looks from the heap in her lap over to the bills on the table, then up on "hope")
    const mood = emotions(tt, [...HUG_MOOD, [T.can, 'suspicious', { lookX: .6, lookY: -.3 }], [chq1 - .1, 'neutral', { lookX: .9, lookY: .5 }],
      [T.or + .1, 'bored', { lookX: .1, lookY: .8 }], [T.para + .2, 'bored', { lookX: -.8, lookY: .75 }], [T.hope, 'bored', { lookX: -.6, lookY: -.1 }]], { take: tt < T.can ? .6 : .5 });
    const sqz = hugSq(tt);
    v1Clinger(tt, sqz, 'arms');
    person(SOFA[0], SOFA[1], HU, HER_C, { ...mood, sq: (mood.sq || 0) + sqz * .5, ...sofaO, pose: uPoses(HER_C, sofaO, tt, [[0, 'lap'], [T.can + .02, palm], [T.para + .1, 'lap']]), boilKey: 'v1herF' });
    flatFront(tt, tt, { lidAway: true, screenGlow: lerp(1, .6, ease(seg(t, CUT.h, CUT.h + .8))), ...v1Bills(tt) });   // (its light dims after the hug, on ones)
    // the bot, still hugging her, trying its very best: on "or just" it opens its mouth and a paragraph of reassurance
    // pours out into her lap (the limit of its help)
    // (after the line its eyes open, two drawings on, and look up at her over a few more: they popped open on the cut)
    const up = ease(seg(tt, CUT.h + .17, CUT.h + .5));
    v1Clinger(tt, sqz, 'body', { eyes: talk ? 'happy' : tt < CUT.h + .17 ? hugEyes(tt) : 'normal', mouth: talk ? 'yawn' : 'grin', lookX: talk ? 0 : -.6 * up, lookY: talk ? .4 : -.8 * up });
    if (talk) {
      // fan-folded paper: flat sheets, three lines of squiggle "text" each, heaping in her lap and spilling off it
      const mouth = [HERC[0] + 2, HERC[1] + .55 * PADU], lap = [SOFA[0] - 60, SOFA[1] - (SOFA[3] - .2) * HU];
      const nf = Math.floor(heap * 14);
      boilSeed('v1para');
      for (let f = 0; f < nf; f++) {
        const fy = lap[1] + 6 - f * 8, fw = 170 + 12 * f, fx = lap[0] + (f % 2 ? 10 : -10) + 30 * Math.sin(f * 1.3), tl = (f % 2 ? .07 : -.07);
        push(); translate(fx, fy); rotate(tl);
        piece(R4(-fw / 2, -9, fw / 2, 9), f % 2 ? '#F4F0E4' : '#EAE4D4', { sw: 1, key: 'v1heap' + f, lift: 3, flatCard: true });
        for (let r = 0; r < 2; r++) prScrib(-fw * .42, -3 + r * 7, fw * (.8 - .2 * r), 1.3, '#4A4438', 1.1, f * 3 + r);
        pop();
      }
      // the stream from its mouth down to the top of the heap
      const top = [lap[0] + 20, lap[1] - nf * 8], len = seg(tt, T.or, T.or + .35), n = 12, P = [];
      for (let i = 0; i <= n; i++) { const k = i / n * len; P.push([lerp(mouth[0], top[0], k) - 60 * Math.sin(k * Math.PI) + 6 * Math.sin(k * 12 - tt * 10), lerp(mouth[1], top[1], k)]); }
      piece(ribbon(P, 42, 46), '#F7F3EA', { sw: 1.3, key: 'v1paraR', lift: 4 });
      for (let i = 1; i < n; i++) { const a = P[i - 1], b2 = P[i + 1], ang = Math.atan2(b2[1] - a[1], b2[0] - a[0]) + Math.PI / 2, c = Math.cos(ang), sn = Math.sin(ang);
        dline([[P[i][0] - c * 16, P[i][1] - sn * 16], [P[i][0] + c * 4, P[i][1] + sn * 4 + 1], [P[i][0] + c * 14, P[i][1] + sn * 14]], 1.2, '#4A4438', .5); }
    }
    // the cheque drifts down into her palm, rocking like a leaf; it stays blank; she lets it drop when the talking starts
    if (tt >= chq0 - .01) {
      const k = seg(tt, chq0, chq1), drop = seg(tt, T.or + .1, T.or + .6);
      const x = PALM[0] + lerp(150, 0, ease(k)) + 60 * Math.sin(k * 7) * (1 - k), y = lerp(PALM[1] - 560, PALM[1] - 10, easeOut(k)) + 420 * easeIn(drop);
      const rot = .45 * Math.sin(k * 6.5) * (1 - k) + .12 * Math.sin(tt * 2.2) * seg(tt, chq1, chq1 + .3) + 1.2 * drop;
      if (drop < 1) { push(); translate(x, y); rotate(rot); v1Cheque(170, 'v1chq'); pop(); }
    }
    camEnd();
  }
  SHOT.V1h = t => { if (t < CUT.h) { v1FlatHug(t); return; } v1ParaScene(t); };

  // ================================================================================================================
  // V1i, V1j: the split screen. Her side (her flat; her Muse sincerely champions her) | their side (the Gemini twins,
  // sincerely applying their screening brief). The CV goes back and forth over the split: a procedure, not a game.
  // ================================================================================================================
  const TWIN = [1530, 906], TWU = 44, TGAP = 5.8, MUSE = [680, 460], MUU = 30;
  const HZ = 1.72, HCX = SOFA[0] + 90, HCY = 560;   // her side's camera (she sits in the left half)
  const toScreenHers = (x, y) => [W / 2 + (x - HCX - 480 / HZ) * HZ, H / 2 + (y - HCY) * HZ];
  const MACH = { x: 1240, y: 906, w: 150, h: 172 };           // their coin-op rejection machine (V1j), on the floor
  const COIN = T.auto - .02;                                   // one coin in: it starts the automated run
  const HOLD_T = [TWIN[0] - TGAP / 2 * TWU - 2.3 * TWU, TWIN[1] - 3.6 * TWU];   // twin A's outer hand, catching
  const MTRAY = [MACH.x - MACH.w / 2 + 34, MACH.y - MACH.h - 26];
  const HAND_H = [MUSE[0] + 70, MUSE[1] - 30];
  // her Muse Charm (her side's world px: its width) and Jolly's exit from its screen, after "lot": the crouch, the jump
  // up and out across the screen's top edge (the glass empty from EX.out), the hop across the room, the puff it pops to
  // full size in (EX.pop, as Clawd out of his phone in V2a); about half a second, clear of the CV's trips
  const CHS = 1.75 * HU, EX = { crouch: T.lot + .02, out: T.lot + .22, pop: T.lot + .42 };
  // the puff Jolly pops out of (V2a's): a card cloud swells over the spot, then breaks into puffs that fly off, shrinking
  function v1Puff(tt) {
    const b = seg(tt, EX.pop - .04, EX.pop + .46); if (b <= 0 || b >= 1) return;
    const cloud = (cx, cy, rx, ry, n, bump) => { const P = []; for (let i = 0; i < 110; i++) { const a = i / 110 * TAU, q = Math.abs(Math.sin(a * n / 2)) - .5; P.push([cx + Math.cos(a) * rx * (1 + bump * q), cy + Math.sin(a) * ry * (1 + bump * q)]); } return P; };
    const [x, y] = MUSE, c1 = seg(b, 0, .36), c2 = seg(b, .3, 1);
    boilSeed('v1 jolly puff');
    if (c1 < 1) { const sc = backOut(clamp(c1 * 2.2)) * (1 + .08 * c1); piece(cloud(x, y + 10, 140 * sc, 150 * sc, 9, .22), '#FBF8F2', { sw: 1.5, key: 'v1jpc', lift: 5 }); }
    if (c2 > 0) for (let i = 0; i < 6; i++) {
      const a = i / 6 * TAU + .5, d = lerp(70, 180, easeOut(c2)) * (.85 + .3 * hash(i * 2.3)), r = (44 + 16 * hash(i * 1.7)) * (1 - easeIn(c2));
      if (r > 3) piece(cloud(x + Math.cos(a) * d * 1.2, y + 10 + Math.sin(a) * d * .75 - 70 * c2, r, r * .82, 6, .2), '#FBF8F2', { sw: 1.2 * (1 - c2 * .5), key: 'v1jp' + i, lift: 4 });
    }
  }
  // The CV's trips: [depart, arrive, from (0 hers, 1 theirs)]. The first is binned; then the serve on "Mine says", the
  // return on "No"; from the coin on, the machine returns it and her Muse resends it, faster each bar.
  const TRIPS = (() => {
    const out = [[T.cv + .12, T.their + .02, 0], [T.mine + .05, T.great + .3, 0], [T.no - .03, T.not + .15, 1]];
    let t = T.not + .72, from = 0, k = 0;   // (her Muse resends as the coin goes up: the first catch is the machine's, after the coin)
    while (t < BT(123) + .1) { const c = Math.max(.26, .56 * Math.pow(.89, k)), d = Math.max(.05, .22 * Math.pow(.84, k)); out.push([t, t + c, from]); t += c + d; from = 1 - from; k++; }
    if (from === 1) { out.push([t, t + .28, 1]); t += .34; }   // (it has to come back to her side first)
    out.push([t, t + .6, 0]);   // the last send: it folds into a plane mid-air and dives
    return out;
  })();
  const LAST = TRIPS[TRIPS.length - 1], FOLD = [LAST[0] + .04, LAST[0] + .22], DIVE = [LAST[0] + .2, BT(127) - .07];
  const theirsAt = tt => tt >= COIN ? MTRAY : HOLD_T;   // (from the coin on, the machine's tray catches it)
  function cvState(tt) {   // where the CV is: { p, rot, flying, at (0 hers / 1 theirs), trip index, stamped }
    let i = -1; for (let k = 0; k < TRIPS.length; k++) if (TRIPS[k][0] <= tt) i = k;
    if (i < 0) return null;
    const [t0, t1, from] = TRIPS[i], k = seg(tt, t0, t1), a = from ? theirsAt(t0) : i === 0 ? null : HAND_H, b = from ? HAND_H : i === 0 ? [TWIN[0], TWIN[1] - 3.4 * TWU] : theirsAt(t1);   // (the first lands where the binning twins hold it)
    if (k < 1) return { i, flying: true, k, from, a, b, p: a && arcPt(a, b, 120 + 170 * clamp((t1 - t0) / .8), k), rot: (from ? -1 : 1) * Math.sin(k * Math.PI) * .9, stamped: from === 1 };
    return { i, flying: false, at: 1 - from, p: b, rot: 0, since: tt - t1, stamped: from === 0 && tt - t1 > .1 && i > 0 };
  }
  // the CV itself, with the red ✗ pop-up once it's been screened out
  function v1CV(x, y, w, rot, stamped, key, sq = 0) {
    push(); translate(x, y); rotate(rot); scale(1 + sq, 1 - sq); b2CV(w, key, 1.1);
    if (stamped) { const k = backOut(clamp(stamped)); if (k > .02) { push(); scale(k); piece(oval(w * .12, w * .12, w * .3, w * .3, 0, 22), '#D8343F', { sw: 1, key: key + 'x', lift: 2, flatCard: true }); for (const d of [-1, 1]) piece(ribbon([[w * (.12 - .15), w * (.12 - .15 * d)], [w * (.12 + .15), w * (.12 + .15 * d)]], w * .07), '#F7F4EC', { ink: null, key: key + 'xx' + d, lift: 0, flatCard: true, edge: false }); pop(); } }
    pop();
  }
  // their side: a sleek HR room (a glass wall, the sparkle, a plant, carpet); screen space, right of the split
  function v1Theirs(tt) {
    look('card');
    boilSeed('v1th');
    piece(R4(960, -60, W + 60, H + 60), '#D6DEE2', { ink: null, key: 'v1thw', lift: 0, edge: false });
    piece(R4(1020, 110, W + 60, 560), '#B9CCD6', { sw: 1.2, key: 'v1thglass', lift: 3 });
    for (let x = 1220, i = 0; x < W; x += 200, i++) piece(R4(x - 4, 110, x + 4, 560), '#8FA4B0', { ink: null, key: 'v1thm' + i, lift: 1, flatCard: true });
    piece(b2Sparkle(1720, 290, 70, 0), '#8FA8F0', { sw: 1.4, shade: '#6A7FCC', depth: 10, key: 'v1thsp', lift: 4 });
    piece(R4(960, 560, W + 60, 590), '#A9B6BE', { sw: 1, key: 'v1thskirt', lift: 2, flatCard: true });
    piece(R4(960, 880, W + 60, H + 60), '#7C8694', { ink: null, key: 'v1thfloor', lift: 0, edge: false });
    v1Plant(1840, 880, 2.6, 'v1thpl', 0);
  }
  // the rejection machine: a grey coin-op box with a lamp, a coin slot, a catch tray, a stamp arm and a flipper
  function v1Machine(tt, on) {
    const { x, y, w, h } = MACH, x0 = x - w / 2, x1 = x + w / 2, y0 = y - h;
    boilSeed('v1mach');
    piece(R4(x0, y0, x1, y), '#8C939E', { sw: 1.6, shade: '#5B616C', depth: 14, key: 'v1mb', lift: 6 });
    piece(R4(x0 + 14, y0 + 40, x1 - 14, y0 + 100), '#5B616C', { sw: 1, key: 'v1mg', lift: 2, flatCard: true });
    for (let i = 0; i < 4; i++) dline([[x0 + 22, y0 + 52 + i * 13], [x1 - 22, y0 + 52 + i * 13]], .9, '#3A3E46');
    piece(R4(x + 20, y0 - 6, x + 50, y0 + 2), '#2A2C30', { ink: null, key: 'v1mslot', lift: 1, flatCard: true });   // the coin slot
    piece(oval(x1 - 24, y0 + 22, 11, 11, 0, 14), on ? '#FF5A4A' : '#7A3A36', { sw: 1, key: 'v1mlamp', lift: 2, flatCard: true });
    if (on) glow(x1 - 24, y0 + 22, 40, '#FF6A4A', .7);
    // the catch tray on its left shoulder, the stamp arm over it (it thumps on each CV), the flipper under it
    piece([[x0 - 30, y0 - 18], [x0 + 60, y0 - 18], [x0 + 64, y0 - 4], [x0 - 34, y0 - 4]], '#B9BEC8', { sw: 1.1, key: 'v1mtray', lift: 3, flatCard: true });
    const cs = cvState(tt), thump = on && cs && !cs.flying && cs.at === 1 ? Math.sin(Math.PI * clamp(cs.since / .12)) : 0;
    const pv = [x0 + 70, y0 - 60], a = -.5 + .75 * thump, tip = [pv[0] - 90 * Math.cos(a), pv[1] + 90 * Math.sin(a) * -1];
    piece(ribbon([pv, tip], 12, 10), '#5B616C', { sw: 1, key: 'v1marm', lift: 3 });
    piece(R4(tip[0] - 22, tip[1] - 6, tip[0] + 22, tip[1] + 14), '#D8343F', { sw: 1, key: 'v1mstamp', lift: 3, flatCard: true });
    piece(R4(pv[0] - 8, pv[1] - 8, pv[0] + 8, y0), '#6C727C', { sw: 1, key: 'v1mpost', lift: 2, flatCard: true });
    brad(pv[0], pv[1], 5);
  }
  // her, on a tall stool at the split (V1j), her head swinging with the CV
  function v1Stool(tt, cs) {
    look('card');
    const cx = 960, seatY = 770, u = 29;
    boilSeed('v1stool');
    for (const s of [-1, 1]) piece(R4(cx + s * 48 - 6, seatY + 8, cx + s * 58 + 6, H + 60), '#3A3E46', { sw: 1.1, key: 'v1stl' + s, lift: 3, flatCard: true });
    piece(R4(cx - 62, seatY + 88, cx + 62, seatY + 98), '#5B616C', { sw: 1, key: 'v1stfoot', lift: 3, flatCard: true });
    piece(curvy([[cx - 70, seatY - 4], [cx + 70, seatY - 4], [cx + 66, seatY + 12], [cx - 66, seatY + 12]], 2), '#B8303F', { sw: 1.2, key: 'v1stseat', lift: 4 });
    const fly = cs && cs.flying && tt < FOLD[0], dir = fly ? (cs.from ? -1 : 1) : cs && cs.at === 0 ? -1 : 1, turning = fly && cs.k < .14;
    const plane = tt >= FOLD[0];
    const mood = emotions(tt, [[0, 'neutral'], [CUT.j + .5, 'bored', { eyes: 'narrow' }], [T.turns, 'bored', { eyes: 'narrow' }], [FOLD[0], 'surprised', { emote: null }], [DIVE[0] + .14, 'neutral', { lookX: .8, lookY: .9 }]], { take: .4 });
    const view = plane || turning ? 'front' : 'q';
    // (bored, both hands resting in her lap (the user, 2026-09-27: one arm hung down by the seat, dangling), and not
    // twinned: in 3/4 the near forearm lies along her thigh, its elbow back at her side, and the far hand rests on ahead
    // toward her knee; front on, one hand on the other, a little off centre and at the hip line (lower, they sat between her
    // knees). The same in each view, so as she turns with the CV the arms turn with her. On the fold the far hand goes to
    // her chest, surprised. The clasped 'lap' pose (both hands at the middle of her hips) held both elbows out in a diamond
    // for six seconds; the chin on a fist (the far arm crossing her chest to it) had its elbow flaring out at shoulder
    // height and changed shape at every turn: the user)
    const so = { seated: true, seatH: 4.25, view }, chest = [.45, .45, .3, 'open', 1, Math.PI - .7];
    const lapL = view === 'q' ? [2.05, -4.72, .3, 'relax', 1, .35, 'u'] : [-.28, 1.1, .3, 'relax', 1, .8];
    const lapR = view === 'q' ? [2.8, -4.75, .25, 'relax', 1, .2, 'u'] : [.3, 1.04, .3, 'relax', 1, Math.PI - .7];
    const pose = uPoses(HER_C, so, tt, [[0, { L: lapL, R: lapR }], [FOLD[0], { L: lapL, R: chest }]], .25);
    person(cx, seatY + 4.25 * u, u, HER_C, { ...mood, ...so, flip: !plane && dir < 0, lookX: plane ? mood.lookX : .9, lookY: plane ? mood.lookY : -.35, pose, boilKey: 'v1herU', tilt: plane ? 0 : -.06, sing: V1_TESS_LIPS });
  }
  function v1Split(t) {
    const tt = mt(t), j = tt >= CUT.j, cs = cvState(tt);
    // ---- her side (its own camera; the split cuts it off at the middle) ----
    look('card');
    camBegin(HCX + 480 / HZ, HCY, HZ);
    flatBack(tt, tt, { rain: 1, post: Math.round(lerp(4, 11, seg(tt, 35.5, 54))) });   // (the unopened post piling up through her verse: more red ones)
    // her Muse: the Muse Charm, held up in her hand (bots.js museCharm: Jolly on its screen). Drawn as her hand's prop, so it
    // goes where her hand goes; CH: its anchors this frame (her side's world coordinates) for what leaves it
    let CH = null;
    if (!j) {
      const Mw = btMat();   // (her side's world frame: the Charm stands upright in her hand whatever its angle)
      const charmO = { ...emotions(tt, [[0, 'happy'], [T.writes, 'determined'], [T.cv, 'proud'], [T.bins, 'sad'], [EX.crouch, 'excited', { mouth: 'grin' }]]), emote: null, t: tt, turn: .2, boilKey: 'v1charm',
        out: seg(tt, EX.crouch, EX.out), page: tt < T.cv + .12 ? seg(tt, T.mybot + .05, T.cv) : 0, frame: Mw };
      const holdCharm = s => { push(); btUpright(Mw); rotate(-.06); translate(-.1 * s, -.53 * CHS); CH = museCharm(0, 0, CHS, charmO); pop(); };
      const watch = { L: [-.4, -(SOFA[3] + .9), .4, 'relax', 1, .9, 'u'], R: [3.1, -9.2, .35, 'fist', 1, -1.05, 'u'] };   // (the Charm upright on her fist, her thumb on its rim)
      const mood = emotions(tt, [[0, 'neutral', { lookX: .6, lookY: .5 }], [T.cv, 'hopeful', { lookX: 1, lookY: -.3 }], [T.bins, 'sad', { lookX: 1, lookY: .1, emote: null }], [EX.crouch + .06, 'surprised', { lookX: 1, lookY: -.4, emote: null }], [T.mine + .2, 'hopeful', { lookX: 1 }], [T.no, 'bored', { lookX: 1 }]], { take: .5 });
      person(SOFA[0], SOFA[1], HU, HER_C, { ...mood, seated: true, seatH: SOFA[3], view: 'q', pose: uPoses(HER_C, { seated: true, seatH: SOFA[3], view: 'q' }, tt, [[0, watch], [EX.pop + .2, 'lap']]), hold: holdCharm, boilKey: 'v1herI', sing: V1_TESS_LIPS });
    }
    flatFront(tt, tt, { lidAway: true, screenGlow: .5, ...v1Bills(tt) });
    camEnd();
    // ---- their side ----
    v1Theirs(tt);
    if (j) v1Machine(tt, tt >= COIN);
    // the twins: the first CV binned ("bins the lot"); then each one caught, screened, politely declined and sent back;
    // from the coin on, the machine does it and they stand back, pleased it all runs smoothly
    const gmMood = feel('happy', tt, { mouth: 'smile', emote: null });
    const binning = tt < T.mine - .1, dropK = seg(tt, T.bins - .1, T.bins + .35);
    if (binning) gemini(TWIN[0], TWIN[1], TWU, { ...gmMood, pose: 'bin', drop: tt < T.their + .02 ? .1 : tt < T.bins - .1 ? .2 : .45 + dropK * .37, gap: TGAP, boilKey: 'v1gmB', t: tt, lookX: -.4, lookY: tt < T.their ? -.6 : .5, bin: true });
    else {
      // (twin A, nearer her side, does the catching and the coin; twin B's outer arm stays its own (OB: null, its idle
      // arm) so the pair doesn't mirror every move)
      let pose, look2 = [-.5, 0];
      if (tt >= COIN + .3) { pose = { O: [-.8, -1.9, .4, 'relax', 1, .6], I: 'join', OB: null }; look2 = [-.8, .2]; }
      else if (tt >= COIN - .45) { const k = seg(tt, COIN - .45, COIN); pose = { O: [-2.9, -4.6 + .5 * ease(k), .2, 'hold', 1, -1.2], I: 'join', OB: null }; look2 = [-.9, .4]; }
      else {
        const here = cs && !cs.flying && cs.at === 1, since = here ? cs.since : 9, going = cs && cs.flying && cs.from === 1 && cs.k < .2;
        pose = here && since > .25 ? { O: [-2.4, -4.5, .2, 'open', 0, -1.6], I: 'join', OB: null } : here || going ? { O: [-2.3, -3.6, .15, 'hold', 1, Math.PI + .5], I: 'join', OB: null } : { O: [-2.2, -3.2, .15, 'open', 1, Math.PI + .3], I: 'join', OB: null };
        look2 = here ? [-.3, .3 + .2 * Math.sin(since * 20)] : [-.8, -.2];
      }
      // (the bin stays where it was, between them: it used to go with the binning pose)
      boilSeed('gm v1gmB bin'); push(); translate(TWIN[0], TWIN[1]); b2Bin(TWU, clamp(TWU / 20, .5, 2.2), 'back', 'gmbinv1gmB'); b2Bin(TWU, clamp(TWU / 20, .5, 2.2), 'front', 'gmbinv1gmB'); pop();
      const nod = j && tt >= COIN + .3 && cs && !cs.flying && cs.at === 1 ? .15 * Math.sin(Math.PI * clamp(cs.since / .2)) : 0;
      gemini(TWIN[0], TWIN[1], TWU, { ...gmMood, mouth: botLip(tt, V1_GEM_LIPS, 'gemini', gmMood.mouth), dy: (gmMood.dy || 0) + nod, pose, gap: TGAP, boilKey: 'v1gmB', t: tt, lookX: look2[0], lookY: look2[1],
        holdL: tt >= COIN - .45 && tt < COIN ? s => piece(oval(s * .45, -s * .1, s * .52, s * .52, 0, 18), '#E2B448', { sw: 1, shade: '#A47C22', depth: 3, key: 'v1coinH', lift: 2, flatCard: true }) : null });   // (one coin, held up to show it)
      if (tt >= COIN && tt < COIN + .3) { const k = seg(tt, COIN, COIN + .16), p = [MACH.x + 35, lerp(MACH.y - MACH.h - 40, MACH.y - MACH.h - 2, easeIn(k))];
        if (k < 1) { boilSeed('v1coin'); piece(oval(p[0], p[1], 15 * (1 - .6 * k), 15, 0, 16), '#E2B448', { sw: 1, key: 'v1coin', lift: 2, flatCard: true }); } else emote('spark', MACH.x + 35, MACH.y - MACH.h - 30, 22, 1, tt - COIN - .16); }
    }
    // ---- her Muse: on the Charm's screen it writes her CV; then it hops out of the screen, pops to full size in the room (a
    // puff, as Clawd out of his phone, V2a) and keeps sending it, sincerely, every time ----
    const HOP = CH ? { a: toScreenHers(...CH.exit), u: CH.uj * HZ } : null;
    const PAGE = CH ? toScreenHers(...CH.page) : [HAND_H[0] - 200, HAND_H[1] + 80];   // (where the Charm's page stands: the CV's first trip leaves from there)
    if (HOP && tt >= EX.out && tt < EX.pop) {   // out of the glass: small, arms up, across to where it'll be (the screen behind it empty)
      const k = seg(tt, EX.out, EX.pop), p = arcPt(HOP.a, [MUSE[0], MUSE[1] + 30], 90, ease(k)), uu = lerp(HOP.u, HOP.u * 1.6, k);
      muse(p[0], p[1] + (3.2 + 2.5) * uu, uu, { ...feel('excited', tt), emote: null, mouth: 'grin', pose: 'cheer', alt: 3.2, float: false, noShadow: true, rot: .35 * Math.sin(k * Math.PI) * (1 - k), boilKey: 'v1muHop', t: tt });
    }
    if (tt >= EX.pop - .02 || j) {
      const here = cs && !cs.flying && cs.at === 0, going = cs && cs.flying && cs.from === 0 && cs.k < .22;
      const serve = tt >= EX.pop && tt < T.mine + .05;
      const champion = (tt >= T.mine && tt < T.fit + .4) || (going && cs.i === 1);
      const mm = emotions(tt, [[0, 'excited', { emote: null }], [T.mine - .05, 'hopeful'], [T.great, 'happy', { eyes: 'shine' }], [T.no + .1, 'determined'], [DIVE[0], 'surprised', { emote: null }]]);
      const pose = champion ? { L: [-3.6, .15, .08, 'thumb', 1], R: [2.4, 1.6, .25, 'relax'] } : here || serve ? { L: [1.4, -.2, .35, 'hold', 1, -.4], R: [2.4, -.3, .3, 'hold', 1, -.2] } : going ? { L: [-2.3, 1.8, .25, 'relax'], R: [3.2, -1.6, .15, 'open', 1, -.9] } : { L: [-2.4, 2.0, .25, 'relax'], R: [2.5, 1.2, .2, 'open', 1, -.4] };
      // ("You're a great fit": it turns to her to say it, then back to watch the CV land)
      const toHer = tt >= T.youre - .16 && tt < T.fit + .34, pp = j ? 1 : lerp(.3, 1, backOut(seg(tt, EX.pop, EX.pop + .2)));   // (popping to full size in the puff, as Clawd does)
      push(); translate(MUSE[0], MUSE[1]); scale(pp); translate(-MUSE[0], -MUSE[1]);
      muse(MUSE[0], MUSE[1] + (3.2 + 2.5) * MUU, MUU, { ...mm, mouth: botLip(tt, V1_MUSE_LIPS, 'muse', mm.mouth), pose, alt: 3.2, boilKey: 'v1muF', t: tt, lookX: toHer ? -.8 : here ? .2 : .8, lookY: toHer ? .1 : here ? .6 : 0 });
      pop();
    }
    v1Puff(tt);
    // ---- the split, and her, on a stool at it (V1j) ----
    boilSeed('v1split');
    piece(R4(952, -60, 968, H + 60), '#1B1720', { ink: null, key: 'v1split', lift: 6, flatCard: true });
    if (j) v1Stool(tt, cs);
    // ---- the CV ----
    look('card');
    if (tt < T.cv + .12) { /* the page rises out of the Charm's screen as Jolly writes it: the Charm draws it */ }
    else if (cs && cs.i === 0 && cs.flying) { const a = PAGE, p = arcPt(a, cs.b, 260, easeOut(cs.k)); v1CV(p[0], p[1], lerp(CHS * .62 * HZ, 80, cs.k), cs.k * 6, 0, 'v1cv'); }
    else if (cs && cs.i === 0) { /* in the twins' hand, then the bin: the rig draws it */ }
    else if (tt >= T.mine - .5 && tt < T.mine + .05) { const k = seg(tt, T.mine - .5, T.mine - .15); v1CV(HAND_H[0] - 20, HAND_H[1] + 10 - 30 * k, 80 * Math.max(.1, k), 0, 0, 'v1cv'); }   // a fresh one
    else if (cs && tt < FOLD[0]) {
      const stampK = cs.flying ? (cs.stamped ? 1 : 0) : cs.at === 1 ? seg(cs.since, .1, .25) : 0;
      const sq = !cs.flying ? .12 * Math.exp(-14 * cs.since) : 0;
      if (cs.flying && TRIPS[cs.i][1] - TRIPS[cs.i][0] < .45) {   // quick trips smear: a few faint after-images behind it
        // (each the CV's own shape at its own turn, its ruled lines faint on it, kept to the half it's in: flat pale boxes,
        // they read as blank rectangles, and one over the divider printed a lilac square)
        const [t0, t1] = TRIPS[cs.i], hgt = 120 + 170 * clamp((t1 - t0) / .8), w = 80, h = w * 1.3;
        for (let g = 3; g >= 1; g--) {
          const kg = cs.k - .07 * g; if (kg < 0) continue;
          const q = arcPt(cs.a, cs.b, hgt, kg), r = (cs.from ? -1 : 1) * Math.sin(kg * Math.PI) * .9, op = 95 - 25 * g;
          boilSeed('v1ghost' + g);
          clipPoly(q[0] < W / 2 ? R4(-60, -60, 952, H + 60) : R4(968, -60, W + 60, H + 60), () => {
            push(); translate(q[0], q[1]); rotate(r);
            piece(b2RoundPoly(R4(-w / 2, -h / 2, w / 2, h / 2), w * .04), '#F7F3EA', { ink: null, op, key: 'v1gh' + g, lift: 0, flatCard: true, edge: false });
            for (const [x0, x1, yy] of [[.0, .38, -.36], [-.38, .38, -.04], [-.38, .34, .08], [-.38, .38, .2]]) piece(R4(x0 * w, yy * h - 1, x1 * w, yy * h + 1), '#A0A6AE', { ink: null, op: op * .8, key: 'v1ghl' + g + yy, lift: 0, flatCard: true, edge: false });
            pop();
          });
        }
      }
      if (cs.flying || cs.i > 0) v1CV(cs.p[0], cs.p[1], 80, cs.rot, stampK, 'v1cv', sq);
      if (!cs.flying && cs.at === 0 && cs.since < .3) emote('spark', HAND_H[0] + 30, HAND_H[1] - 40, 18, 1, cs.since);   // her Muse smooths it out and tries again
    } else if (cs && tt < DIVE[1]) v1Plane(tt, cs);
  }
  // the CV folds into a paper plane in the air (FOLD), then dives down and to the right, toward us, out of the frame's right
  // edge (DIVE)
  function v1Plane(tt, cs) {
    const fk = seg(tt, FOLD[0], FOLD[1]), dk = (k => k * k * (2.2 - 1.2 * k))(seg(tt, DIVE[0], DIVE[1]));
    const a = HAND_H, b = theirsAt(LAST[1]), start = arcPt(a, b, 120 + 170 * clamp((LAST[1] - LAST[0]) / .8), seg(FOLD[0], LAST[0], LAST[1]));
    // a swoop: up and over a little, then down and to the right, toward us, out through the frame's right edge above the
    // subtitle banner (aimed out of the bottom, it dived behind the banner and seemed to vanish there)
    const c = [start[0] + 560, start[1] - 170], e = [W + 320, 720], bz = (p0, p1, p2, k) => lerp(lerp(p0, p1, k), lerp(p1, p2, k), k);
    const p = [bz(start[0], c[0], e[0], dk), bz(start[1], c[1], e[1], dk)], d = [bz(c[0] - start[0], e[0] - c[0], e[0] - c[0], dk), bz(c[1] - start[1], e[1] - c[1], e[1] - c[1], dk)];
    const s = lerp(1.6, 5.2, dk), rot = dk > 0 ? Math.atan2(d[1], d[0]) : lerp(0, -.25, fk);
    boilSeed('v1plane');
    push(); translate(p[0], p[1]); rotate(rot); scale(s);
    if (fk < 1) { push(); scale(lerp(1, .3, fk), lerp(1, .45, fk)); rotate(-fk * Math.PI / 2); b2CV(64, 'v1cv', 1.1); pop(); if (fk > .45) v1PlaneShape(ease(seg(fk, .45, 1))); }
    else v1PlaneShape(1);
    pop();
  }
  function v1PlaneShape(k) {   // a dart, nose to the right (+x), centred (0, 0): the CV's cream paper, grey "text", its blue photo corner
    const L = 70 * k, h = 26 * k;
    piece([[-L * .6, -h], [L * .6, 0], [-L * .45, -h * .1]], '#EFEADF', { sw: 1.1, shade: '#C9C2B2', depth: 4, key: 'v1plw1', lift: 3 });
    piece([[-L * .6, h * .7], [L * .6, 0], [-L * .45, -h * .1]], '#F7F3EA', { sw: 1.1, key: 'v1plw2', lift: 3 });
    piece([[-L * .5, -h * .7], [-L * .3, -h * .78], [-L * .28, -h * .5], [-L * .48, -h * .44]], '#9BC0E4', { ink: null, key: 'v1plph', lift: 0, flatCard: true });
    dline([[-L * .2, -h * .45], [L * .25, -h * .12]], .8, '#A0A6AE'); dline([[-L * .3, h * .35], [L * .2, h * .12]], .8, '#A0A6AE');
  }
  SHOT.V1i = t => {
    if (t < CUT.i) v1ParaScene(t);
    else v1Split(t);
    // in: a CV flies across, close to the lens, and wipes to the split
    const k = seg(t, CUT.i - .28, CUT.i + .28);
    if (k > 0 && k < 1) { look('card'); push(); translate(lerp(-900, W + 900, k), 560 + 80 * Math.sin(k * Math.PI)); rotate(-.2 + .3 * k); b2CV(1500, 'v1cvw', 3); pop(); }
  };
  SHOT.V1j = t => {
    v1Split(t);
    // her move to the split: a stop-motion jump, marked by a shutter blink
    if (t >= CUT.j - .04 && t < CUT.j + .12) flash(.35 * (1 - seg(t, CUT.j - .04, CUT.j + .12)), '#FFF8EC');
  };
})();

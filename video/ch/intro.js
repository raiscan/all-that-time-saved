// intro.js: I1–I3 (bars 0–8). The promise, and the woman who believed it once, and is sick of waiting for it.
//   I1  the faded 1930s ad irises up ("Think of all the time you'll save.")
//   I2  pull back: the ad is a poster on a night-tube platform, and she's in front of it, tired, arms folded; "I did..!",
//       exasperated, her arms thrown open at it (she did think of all the time she'd save; it never came); him down the
//       platform
//   I3  their eyes meet, both worn out, he nods; the poster's corner peels; "That was the point!", dry and bitter to us, a
//       palm-up at the poster; a train pulls in and wipes (the beats' times: PB, above SHOT.I2)
(() => {
  // the poster: exactly 16:9, so the pull-back starts on a frame identical to I1's
  const PO = { x: 1060, y: 190, w: 700, h: 393.75 }; PO.cx = PO.x + PO.w / 2; PO.cy = PO.y + PO.h / 2; PO.s = PO.w / W; PO.fill = W / PO.w;
  const PAST_RATE = .44, PAST_MAX = 3.2;   // the ad's own clock (its jam and burn come later, in the outro)
  const adAt = t => Math.min(t * PAST_RATE, PAST_MAX);
  // From the cut the ad becomes a printed poster, still full frame: its film (the weave, the flicker, the dust, the line
  // boil) winds down like a projector running out, over WIND s from the cut, and stops dead on a still frame. te(t) is the
  // ad's clock: song time until the cut, then slowing to a stop (speed 1 → 0), then frozen.
  const WIND = .7, adClock = t => { const t0 = BAR(4), s = clamp((t - t0) / WIND); return t < t0 ? t : t0 + WIND * (s - s * s / 2); };
  const TILE = '#DCD2BE', TILE_DK = '#B9AE98', GROUT = '#8C8474', WALL_BAND = '#2F5E8C', FLOOR = '#5E5A56', EDGE = '#E8C23A';

  SHOT.I1 = (t, lt, dur) => {
    look('ink');
    pastScene(t, adAt(lt), { still: true });
    if (lt < 1.2) iris(W / 2, H / 2, lerp(10, 1400, easeIn(lt / 1.2)), '#0C0A10');   // in: iris up from black
  };

  // The poster's been up a long time (the promise, hanging there for years): sun-yellowed (most at the top), frayed and
  // nicked along its edges, a corner torn away to the backing, old tape at two corners, grime along the bottom where coats
  // brush past, a water stain. It comes up full frame as the film stops (the first frame is the ad's), drawn over the
  // picture and under the wall and frame.
  const BACKING = '#2A2630';
  // The print's grit, as two overlays (made once): dark (the paper's tooth and grain, fibres, flecks of dirt, blotchy
  // uneven ink) and light (the ink worn off in specks and scuffs, bare paper showing through). Faded in with tint alpha.
  let POSTER_TEX = null;
  function posterTex() {
    if (POSTER_TEX) return POSTER_TEX;
    const Wt = 1600, Ht = 900, mk = () => { const g = createGraphics(Wt, Ht); g.pixelDensity(1); return g; };
    const dark = mk(), lite = mk(), cd = dark.drawingContext, cl = lite.drawingContext, rnd = lcg(21);
    const id = cd.createImageData(Wt, Ht), d = id.data;   // the tooth: fine grain, per pixel
    for (let i = 0; i < d.length; i += 4) { const v = rnd(); d[i] = 58; d[i + 1] = 44; d[i + 2] = 30; d[i + 3] = v < .55 ? v * 70 : 0; }
    cd.putImageData(id, 0, 0);
    const blot = (c, x, y, r, col, a) => { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); };
    for (let i = 0; i < 70; i++) blot(cd, rnd() * Wt, rnd() * Ht, 50 + rnd() * 200, '70,52,34', .07 + rnd() * .09);   // uneven ink, dark
    for (let i = 0; i < 50; i++) blot(cl, rnd() * Wt, rnd() * Ht, 40 + rnd() * 160, '250,244,228', .06 + rnd() * .1);   // and light
    cd.lineCap = cl.lineCap = 'round';
    for (let i = 0; i < 700; i++) {   // paper fibres
      const x = rnd() * Wt, y = rnd() * Ht, a = rnd() * TAU, L = 6 + rnd() * 22, c = rnd() < .7 ? cd : cl;
      c.strokeStyle = c === cd ? `rgba(60,44,30,${.12 + rnd() * .18})` : `rgba(252,246,232,${.2 + rnd() * .25})`; c.lineWidth = .6 + rnd() * .8;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a) * L * .5 + (rnd() - .5) * 5, y + Math.sin(a) * L * .5 + (rnd() - .5) * 5, x + Math.cos(a) * L, y + Math.sin(a) * L); c.stroke();
    }
    for (let i = 0; i < 320; i++) { const x = rnd() * Wt, y = rnd() * Ht, r = .7 + rnd() * 2.2; cd.fillStyle = `rgba(40,30,22,${.3 + rnd() * .45})`; cd.beginPath(); cd.ellipse(x, y, r, r * (.5 + rnd() * .5), rnd() * 3, 0, TAU); cd.fill(); }   // flecks of dirt
    for (let i = 0; i < 420; i++) { const x = rnd() * Wt, y = rnd() * Ht, r = .7 + rnd() * 2.6; cl.fillStyle = `rgba(250,244,228,${.35 + rnd() * .5})`; cl.beginPath(); cl.ellipse(x, y, r, r * (.4 + rnd() * .6), rnd() * 3, 0, TAU); cl.fill(); }   // ink flaked off
    for (let i = 0; i < 40; i++) {   // scuffs (mostly low down, mostly across: bags and coats)
      const x = rnd() * Wt, y = Ht * (.35 + .65 * Math.sqrt(rnd())), a = (rnd() - .5) * .5, L = 20 + rnd() * 80;
      cl.strokeStyle = `rgba(250,244,228,${.15 + rnd() * .3})`; cl.lineWidth = 1 + rnd() * 3;
      cl.beginPath(); cl.moveTo(x, y); cl.quadraticCurveTo(x + L * .5, y + Math.sin(a) * L * .5 + (rnd() - .5) * 6, x + Math.cos(a) * L, y + Math.sin(a) * L); cl.stroke();
    }
    return POSTER_TEX = { dark, lite };
  }
  function posterWear(t) {
    const k = ease(seg(t, BAR(4) + .2, BAR(4) + 1.0)); if (k < .01) return;
    const { x, y, w, h } = PO, X = f => x + w * f, Y = f => y + h * f;
    boilSeed('poster wear');
    // the fade: a warm wash, stronger toward the top (where the lights and the years got it)
    piece([[x, y], [x + w, y], [x + w, Y(.45)], [x, Y(.55)]], '#D8B870', { ink: null, op: 34 * k, key: 'pwyel1', lift: 0, flatCard: true, edge: false });
    piece([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], '#C8A868', { ink: null, op: 20 * k, key: 'pwyel2', lift: 0, flatCard: true, edge: false });
    // the grit: the paper's tooth, fibres, dirt, uneven and flaking ink
    const G = posterTex(); flushBrush(); push(); tint(255, 255 * k); image(G.dark, x, y, w, h); image(G.lite, x, y, w, h); noTint(); pop();
    // frayed edges: the paper's edge worn back to the dark backing in nicks along all four sides
    const fray = (A, B, nx, ny, key, n = 26) => {
      const P = [A];
      for (let i = 1; i < n; i++) { const f = i / n, d = (hash(i * 3.1 + key.length * 7) < .3 ? 11 : 3.5) * (.35 + .65 * hash(i * 1.7 + key.length)) * k; P.push([lerp(A[0], B[0], f) + nx * d, lerp(A[1], B[1], f) + ny * d]); }
      P.push(B); piece(P, BACKING, { ink: null, key: 'pwfray' + key, lift: 0, flatCard: true, edge: false });
    };
    fray([x, y], [x + w, y], 0, 1, 'top'); fray([x + w, y + h], [x, y + h], 0, -1, 'bot', 30); fray([x, y + h], [x, y], 1, 0, 'left', 16); fray([x + w, y], [x + w, y + h], -1, 0, 'right', 16);
    // a corner torn away (bottom left): a ragged bite down to the backing, a curl of paper lifting off it
    const tc = 64 * k, tear = [[x - 2, Y(1) - tc * 1.5], [x + tc * .35, Y(1) - tc * 1.2], [x + tc * .5, Y(1) - tc * .95], [x + tc * .85, Y(1) - tc * .7], [x + tc, Y(1) - tc * .45], [x + tc * 1.35, Y(1) - tc * .25], [x + tc * 1.55, y + h + 2], [x - 2, y + h + 2]];
    piece(tear, BACKING, { ink: null, key: 'pwtear', lift: 0, flatCard: true, edge: false });
    piece([[x + tc * .5, Y(1) - tc * .95], [x + tc * .85, Y(1) - tc * .7], [x + tc * .62, Y(1) - tc * .62]], '#E8DCC0', { sw: 1, key: 'pwcurl', lift: 3 });
    // old tape: two yellowed strips at the corners (it lost its stick; the tape's gone brittle)
    for (const [cx, cy, a, key] of [[x + 18, y + 14, -.7, 'a'], [x + w - 20, y + h - 16, -.7, 'b']]) {
      push(); translate(cx, cy); rotate(a);
      piece([[-30, -9], [30, -8], [31, 8], [-29, 9]], '#E8D08A', { ink: null, op: 150 * k, key: 'pwtape' + key, lift: 1, flatCard: true, edge: false });
      pop();
    }
    // grime along the bottom (coats and bags brushing past) and a water stain's ring, top right
    for (let i = 0; i < 6; i++) { const gx = X(.12 + .14 * i + .05 * hash(i)), gy = Y(.9 + .06 * hash(i + 3)); piece(oval(gx, gy, 26 + 20 * hash(i * 2), 9 + 6 * hash(i * 5), .1 * (hash(i) - .5), 16), '#4A3E34', { ink: null, op: 26 * k, key: 'pwgr' + i, lift: 0, flatCard: true, edge: false }); }
    const ring = oval(X(.83), Y(.2), 34, 30, .3, 28).map(([px, py], i) => { const r = 1 + .12 * (hash(i * .37 + 4) - .5) + .06 * Math.sin(i * .9); return [X(.83) + (px - X(.83)) * r, Y(.2) + (py - Y(.2)) * r]; });
    piece(ring, '#9A7A4A', { ink: null, op: 26 * k, key: 'pwstain', lift: 0, flatCard: true, edge: false });
    piece(ring.map(([px, py]) => [X(.83) + (px - X(.83)) * .8, Y(.2) + (py - Y(.2)) * .8]), '#F4E8D0', { ink: null, op: 14 * k, key: 'pwstain2', lift: 0, flatCard: true, edge: false });   // (paler in the middle: the tide mark)
  }

  // the platform, in card: tiled wall with a blue band, the poster frame, a bench, the platform edge
  // o (for other chapters, window.INTRO below; the intro passes none, so every default is the intro's own):
  //   x0, x1: how far the wall, floor and edge run left and right (default -60 .. W + 60) · bench: [x0, x1] of its seat
  //   (default [140, 520]) · crowd: a function (t) drawing who's on the platform instead of the night crowd, or false ·
  //   wallOnly: just the tiled wall and the poster (no floor, edge, bench or crowd: a wall across the tracks) ·
  //   poster: false skips the poster (its picture, wear, gloss and frame) when it's off screen (the hole stays)
  function platform(t, lt, peel, o = {}) {
    const X0 = o.x0 ?? -60, X1 = o.x1 ?? W + 60, showPoster = o.poster !== false;
    // the poster's picture first (the past, in its own look), then the wall with a poster-shaped hole over it
    if (showPoster) {
      look('ink');
      const te = adClock(t);
      const film = 1 - ease(seg(t, BAR(4), BAR(4) + .9));   // the projection's scratches, flicker and falloff go with it
      push(); translate(PO.x, PO.y); scale(PO.s); stillDrawing(() => pastScene(te, adAt(te), { still: true, gate: false, film }), te); pop();
      look('card');
      posterWear(t);
    } else look('card');
    const hole = [[PO.x, PO.y], [PO.x + PO.w, PO.y], [PO.x + PO.w, PO.y + PO.h], [PO.x, PO.y + PO.h]];
    boilSeed('wall'); irisShape(hole, TILE);
    // tiles as card pieces (a band of blue tiles at eye level), grout as fine lines (o.grout below)
    const c0 = o.x0 == null ? 0 : Math.floor((X0 + 120) / 100) - 1, c1 = o.x1 == null ? 22 : Math.ceil((X1 + 120) / 100) + 1;
    for (let r = 0; r < 12; r++) for (let c = c0; c < c1; c++) {
      const x = -120 + c * 100 + (r % 2) * 50, y = -40 + r * 70;
      if (x + 96 > PO.x - 30 && x < PO.x + PO.w + 30 && y + 66 > PO.y - 30 && y < PO.y + PO.h + 30) continue;   // behind the poster
      if (y > 760) continue;
      const band = r === 9, k = hash(r * 31 + c);
      if (band || k < .12) piece(U([[0, 0], [96, 0], [96, 66], [0, 66]], 1, x, y), band ? WALL_BAND : TILE_DK, { ink: null, key: 't' + r + '_' + c, lift: 1, flatCard: true });
    }
    // o.grout: 'pen' (the default for other chapters: a card pen line) | 'flat' (the intro's: a flat strip 1.2 px high, a
    // soft 28% of the grout colour, which holds steady under a creeping camera: the pen line, half a pixel wide at 1x,
    // strobed in and out row by row through I3's slow push)
    const gmode = o.grout || 'pen';
    const gline = gmode === 'flat' ? (xa, xb, y) => { push(); noStroke(); fill(GROUT + '48'); beginShape(); vertex(xa, y - .6); vertex(xb, y - .6); vertex(xb, y + .6); vertex(xa, y + .6); endShape(CLOSE); pop(); }
      : (xa, xb, y) => dline([[xa, y], [xb, y]], .7, GROUT);
    if (gmode === 'flat') flushBrush();   // (native strips: in order after the brush-drawn tiles)
    for (let r = 0; r < 12; r++) {   // (the grout stops at the poster's frame)
      const y = -40 + r * 70; if (y >= 760) continue;
      if (y > PO.y - 20 && y < PO.y + PO.h + 20) { gline(X0, PO.x - 20, y); gline(PO.x + PO.w + 20, X1, y); }
      else gline(X0, X1, y);
    }
    // the print's gloss, fading in as the film stops: a soft diagonal sheen across the poster (it's paper under the lights)
    const gl = ease(seg(t, BAR(4) + .45, BAR(4) + 1.1));
    if (gl > .01 && showPoster) {
      boilSeed('poster gloss');
      const band = (a, w, op) => piece([[PO.x + PO.w * a, PO.y], [PO.x + PO.w * (a + w), PO.y], [PO.x + PO.w * (a + w - .22), PO.y + PO.h], [PO.x + PO.w * (a - .22), PO.y + PO.h]].map(([x, y]) => [clamp(x, PO.x, PO.x + PO.w), y]), '#FFFFFF', { ink: null, op: op * gl, key: 'pgloss' + a, lift: 0, flatCard: true, edge: false });
      band(.52, .16, 34); band(.72, .05, 26);
    }
    // the poster frame, and the peel at its corner
    boilSeed('frame');
    if (showPoster) {
      piece(U([[-18, -18], [PO.w + 18, -18], [PO.w + 18, PO.h + 18], [-18, PO.h + 18]], 1, PO.x, PO.y).concat([]), '#2A2630', { ink: NOIR.ink, sw: 2.4, key: 'frameback', lift: 0, op: 0, flatCard: true });   // (an outline only: no card fibres or lift shadow over the picture)
      for (const [a, b] of [[[PO.x - 16, PO.y - 16], [PO.x + PO.w + 16, PO.y - 16]], [[PO.x + PO.w + 16, PO.y - 16], [PO.x + PO.w + 16, PO.y + PO.h + 16]], [[PO.x + PO.w + 16, PO.y + PO.h + 16], [PO.x - 16, PO.y + PO.h + 16]], [[PO.x - 16, PO.y + PO.h + 16], [PO.x - 16, PO.y - 16]]])
        limb([a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], b], 16, 16, '#3A3440', { sw: 1.6, key: 'frm' + a[0] + a[1], closedRoot: true });
    }
    if (peel > .01) {   // the top-right corner curls down: the back of the poster (paper) and its shadow
      const s = 150 * easeOut(peel), cx = PO.x + PO.w, cy = PO.y;
      piece([[cx - s, cy], [cx, cy], [cx, cy + s]], '#1C1A20', { ink: null, key: 'peelhole', lift: 0, flatCard: true });
      piece([[cx - s, cy], [cx - s * .78, cy + s * .8], [cx, cy + s]], '#EDE4D2', { sw: 1.4, key: 'peel', lift: 8 });
    }
    if (o.wallOnly) return;
    // platform floor, the yellow line, the edge (the tracks are below frame: the camera is across them)
    boilSeed('floor');
    piece(U([[X0, 760], [X1, 760], [X1, 990], [X0, 990]], 1), FLOOR, { ink: NOIR.ink, sw: 2, key: 'floor', lift: 0 });
    piece(U([[X0, 950], [X1, 950], [X1, 972], [X0, 972]], 1), EDGE, { ink: null, key: 'yline', lift: 2, flatCard: true });
    piece(U([[X0, 990], [X1, 990], [X1, H + 60], [X0, H + 60]], 1), '#1C1A20', { ink: null, key: 'pit', lift: 0 });
    // a bench on the left
    boilSeed('bench');
    const [bx0, bx1] = o.bench || [140, 520];
    piece(U([[bx0, 700], [bx1, 700], [bx1, 726], [bx0, 726]], 1), '#7A4A34', { sw: 1.6, shade: '#5A3424', key: 'benchseat', lift: 5 });
    for (const bx of [bx0 + 30, bx1 - 50]) piece(U([[bx, 726], [bx + 22, 726], [bx + 22, 800], [bx, 800]], 1), '#3A3440', { sw: 1.4, key: 'benchleg' + bx, lift: 4 });
    if (o.crowd) o.crowd(t);
    else if (o.crowd !== false) crowdNight(mt(t));   // a late-night figure or two down the platform (demo/cast/crowd.js)
  }

  // ---------- the platform's beats (I2 → I3: one camera, so they run across the shot line) ----------
  // Song time. Two people on the same commute, not a couple. Re-timed in the polish round: the eye contact used to fit
  // five beats into the second after the pull-back landed (her glance while still singing, his look up, the nod, her look
  // back), followed by a second with nothing new; and the smirk, the peel and the train came within .8 s. Now each has
  // room, and the peel comes in the quiet before her line, in her eyeline, so the smirk answers it (it used to come on
  // "point!").
  //    8.5         revealed by the pull-back: tired, arms folded, looking flatly at the poster
  //    9.60        a breath in (the fold tightens, the head dips); 9.72 her arms thrown open at it, brows down and in
  //    9.79        "I did..!": an exasperated retort at the poster (she mouths it, through a frown), the arms held open
  //   10.28–10.36  the breath out: the shoulders drop and the arms fold again; simmering, then worn out
  //   10.45–10.62  her eyes go down the platform to him, her head tipping a little after them
  //   10.58–10.82  he feels it: his eyes come up off his phone (it stays in his hand, lowered a little)
  //   10.95–11.35  their eyes meet, two people as tired as each other: his small nod; she holds his look (no nod back)
  //   11.45–11.65  she looks back to the poster; 11.50–11.80 he goes back to his phone
  //   11.82–12.15  the poster's top corner comes unstuck and curls down (she's looking at it)
  //   12.35        a dry, bitter half-smile, eyes to us: "That was the point!" (12.51–13.17; she mouths it); on "point!"
  //                (12.7) the far hand comes out of the fold, palm up at the poster (her sarcasm is in small gestures),
  //                held into the wipe
  //   13.17–14.52  the train pulls in, braking to a stop on the cut (V1a pulls it out)
  const PB = { antic: 9.6, fling: 9.72, drop: [10.28, 10.36], simmer: 10.36, glance: [10.45, 10.62], up: [10.58, 10.82], nod: [10.95, 11.35], back: [11.45, 11.65], down: [11.5, 11.8],
    peel: [11.82, 12.15], smirk: 12.35, flick: [12.62, 12.79] };   // (the poster peels before her line: the user, polish round)
  // where they stand: on the platform, her at the yellow line and him further down it, set back (their feet had been over
  // the platform's edge, on the dark of the pit)
  const HER_AT = [760, 968, 40], HIM_AT = [330, 940, 35];
  // her, in front of the poster, 3/4 facing it, arms down; her glance down the platform at him and back; the smirk to us
  // with the palm-up at the poster, held into the train's wipe
  function her(t) {
    const tt = mt(t);   // (puppets on twos)
    // tired and flat at the poster; the exasperated retort (brows down and in, a frown she sings through); simmering;
    // worn out with him; the bitter half-smile to us
    const mood = emotions(tt, [[0, 'bored'], [PB.fling - .02, 'angry', { mouth: 'frown', emote: null, tint: null }], [PB.simmer, 'bored'], [PB.smirk, 'smug']], { take: .45 });
    const g = ease(seg(tt, ...PB.glance)) * (1 - ease(seg(tt, ...PB.back))), sm = ease(seg(tt, PB.smirk, PB.smirk + .2));
    const lx = lerp(lerp(.7, -1, g), .1, sm), ly = lerp(lerp(-.25, .3, g), 0, sm);
    // her arms, in card drawings held between: folded; a tightening (the breath in); flung open at the poster on "I";
    // held through "did..!"; back in (the breath out, the shoulders dropping) and folded again. On "point!" the far hand
    // comes out of the fold palm-up at the poster, in two drawings, and holds (a straight blend from the fold swung the
    // elbow up past the shoulder on the way); the near arm stays across her
    const pose = tt < PB.antic ? PPOSE.cross : tt < PB.fling ? ANTIC : tt < PB.drop[0] ? FLING : tt < PB.drop[1] ? REFOLD : tt < PB.flick[0] ? PPOSE.cross
      : { L: PPOSE.cross.L, R: tt < PB.flick[1] ? FLICK_MID : FLICK };
    const exhale = tt >= PB.drop[0] && tt < PB.drop[1] + .16 ? .05 : 0;   // (the shoulders drop with the breath out: card, a held drawing)
    person(HER_AT[0], HER_AT[1], HER_AT[2], HER_C, { ...mood, sq: (mood.sq || 0) + exhale, view: 'q', lookX: lx, lookY: ly, tilt: lerp(-.04, .06, g) + (tt >= PB.antic && tt < PB.fling ? .05 : 0), pose, boilKey: 'her' });
  }
  const FLING = { L: [-1.7, .6, .3, 'open', 1, -2.6], R: [2.4, .25, .2, 'open', 1, -.2] };   // both arms thrown open, the far hand up at the poster: "come on!"
  const ANTIC = { L: [.36, .42, .55, 'fist', 1, -.2], R: [-.36, .36, .55, 'relax', 1, Math.PI + .2] }, REFOLD = { L: [.7, .7, .35, 'relax', 1, -.1], R: [.4, .5, .45, 'relax', 1, Math.PI] };
  // "this, here, was the point": the presenting gesture. The upper arm hangs by her side, the forearm comes up forward, about
  // 30° above level, the hand held out flat, palm up, at the poster, turned so we see its edge (the user), the wrist bent back level. (The hand sits 64° out from straight below the shoulder,
  // past the far arm's 53° edge, so the rig's elbow drops under it instead of flaring up beside it.) Its anticipation:
  // out of the fold the arm first drops straight down by her side, then the forearm comes up.
  const FLICK = [2.5, .476, .3, 'tray', 1, -.08], FLICK_MID = [1.0, 1.3, .05, 'relax', 1, 1.2];
  // him, further down the platform (frame left), on his phone, its back to us (the screen faces him); he looks up, meets
  // her eye and gives a small nod, then goes back to it
  const PHONE_UP = { L: [-1.3, 3, .1, 'relax'], R: [.3, .62, .55, 'hold', 1, -1.25] }, PHONE_DOWN = { L: [-1.3, 3, .1, 'relax'], R: [.45, .95, .45, 'hold', 1, -.75] };
  function him(t) {
    const tt = mt(t), up = ease(seg(tt, ...PB.up)) * (1 - ease(seg(tt, ...PB.down))), n = Math.sin(seg(tt, ...PB.nod) * Math.PI);
    const pose = pPoses(tt, [[0, PHONE_UP], [PB.up[0], PHONE_DOWN], [PB.down[0], PHONE_UP]], .3);
    person(HIM_AT[0], HIM_AT[1], HIM_AT[2], HIM_C, { ...feel('neutral', tt, { seed: 5 }), view: 'q', pose,
      lookX: lerp(.25, .95, up), lookY: lerp(1, -.05, up) + .45 * n, squint: .3 * (1 - up), tilt: lerp(.1, 0, up) + .06 * n, boilKey: 'him',
      hold: s => { piece(curvy(U([[-.1, -.55], [.9, -.55], [.9, 1.05], [-.1, 1.05]], s), 2), '#2E2A3A', { sw: 1.2, key: 'hph', lift: 2 }); } });
  }
  const GROUT_W = 'flat';   // (the steady grout: the user, polish round; the pen line strobed under the push)

  SHOT.I2 = (t, lt, dur) => {
    // (full frame, the ad turns into a poster: the film winds down and stops, its scratches and flicker go, the print's
    // age and gloss come up; it holds a moment as a poster; then the camera pulls back, done before "I did..!")
    const k = ease(seg(lt, 1.3, 2.45)), z = lerp(PO.fill, 1, k);
    camBegin(lerp(PO.cx, 960, k), lerp(PO.cy, 540, k), z);
    platform(t, lt, 0, { grout: GROUT_W });
    him(t);
    her(t);
    camEnd();
  };

  SHOT.I3 = (t, lt, dur) => {
    const tr = seg(lt, dur - 1.35, dur);   // the train: in from the right, braking, covering the frame at the cut
    const sh = tr > 0 ? shakeXY(t, 3 * tr) : [0, 0];   // (on ones, like the push)
    camBegin(960 + sh[0], 540 + sh[1], 1 + .015 * lt);
    platform(t, lt + 3.6, seg(mt(t), ...PB.peel), { grout: GROUT_W });
    him(t);
    her(t);
    camEnd();
    if (tr > 0) train(tr);
  };

  // the train, in screen space: a long card slab with lit windows and doors, braking into the station
  function train(p) {
    look('card');
    const L = 3400, x0 = lerp(W + 30, -900, easeOut(p)), y0 = -40, y1 = H + 40;
    boilSeed('train');
    piece(U([[0, y0], [L, y0], [L, y1], [0, y1]], 1, x0, 0), '#B8303F', { sw: 2.4, key: 'trainbody', lift: 10 });
    piece(U([[0, 820], [L, 820], [L, 870], [0, 870]], 1, x0, 0), '#2A2630', { ink: null, key: 'trainskirt', lift: 2, flatCard: true });
    piece(U([[0, 120], [L, 120], [L, 150], [0, 150]], 1, x0, 0), '#F2ECE0', { ink: null, key: 'trainstripe', lift: 2, flatCard: true });
    for (let i = 0; i < 9; i++) {
      const wx = x0 + 120 + i * 360;
      if (i % 3 === 1) {   // doors
        piece(U([[0, 200], [180, 200], [180, 800], [0, 800]], 1, wx, 0), '#9C2432', { sw: 1.8, key: 'door' + i, lift: 4 });
        for (const dx of [20, 100]) piece(U([[0, 240], [60, 240], [60, 520], [0, 520]], 1, wx + dx, 0), '#F4E6B8', { sw: 1.4, key: 'dw' + i + dx, lift: 2 });
      } else {
        piece(U([[0, 240], [260, 240], [260, 560], [0, 560]], 1, wx, 0), '#F4E6B8', { sw: 1.6, key: 'win' + i, lift: 3 });
        // a bot passenger in every window (the chorus's driverless train, glimpsed): a head, an antenna or ears, a seat
        const kind = i % 3, bx = wx + 130, by = 470;
        piece(U([[-90, 90], [90, 90], [90, 0], [-90, 0]], 1, bx, by - 20), '#3A3440', { ink: null, key: 'seat' + i, lift: 1, flatCard: true });
        if (kind === 0) piece(oval(bx, by - 60, 58, 52, 0, 24), '#5E5864', { ink: null, key: 'bh' + i, lift: 1, flatCard: true });
        else piece(U([[-55, 0], [55, 0], [55, -95], [-55, -95]], 1, bx, by - 10), '#5E5864', { ink: null, key: 'bh' + i, lift: 1, flatCard: true });
        if (kind === 0) { dline([[bx, by - 112], [bx + 6, by - 140]], 2, '#5E5864'); piece(oval(bx + 7, by - 146, 9, 9, 0, 12), '#FF4F9A', { ink: null, key: 'ant' + i, lift: 1, flatCard: true }); }
        for (const ex of [-20, 20]) piece(oval(bx + ex, by - 62, 7, 10, 0, 12), '#F4E6B8', { ink: null, key: 'be' + i + ex, lift: 0, flatCard: true });
      }
    }
  }

  // ---------- for other chapters (verse 2 opens on this platform, another night) ----------
  // platform(t, lt, peel, o): the set in intro world px (call inside your own camBegin/camEnd, look('card') after; the
  // options are above it). PO: the poster's rect; bench: the intro's bench seat [x0, x1] (its top at y 700, the floor
  // under it at 800); the set's colours.
  window.INTRO = { platform: (t, lt, peel = 0, o = {}) => platform(t, lt, peel, o), PO, bench: [140, 520], seatY: 700, benchFloor: 800,
    col: { TILE, TILE_DK, GROUT, WALL_BAND, FLOOR, EDGE, BACKING } };
})();

// verse2.js: V2a–V2h (bars 49–73, 88.7–130.8 s). His verse (HIM_C sings it, high): the Claude subscription, the gas
// turbines next door, the GP at 8:03, and hauling his life back out of the chatbot.
//
// The lyric runs across the board's bar lines ("premium tier", "doesn't clear", "Declined", "behind" and "three" all
// land just after a shot's last bar), so the verse keeps its own cut list, on the words: every V2 shot draws verse(t),
// which picks the scene by song time. The board's shots still own their bars; the cuts sit up to a second later.
//   A–D play on the intro's night-tube platform (intro.js, window.INTRO), another night: one scene.
//   A  88.70  (from 87.07, under C1f's rip: her torn riso copy falls away off the intro's poster, intact, framed where it
//             hung) the pull-back to the intro's wide: him on the bench, on his phone, and she isn't there; in on him
//             typing to Claude (its screen to him); he sends and lowers it, the display to us (bubbles, the dots, a heart);
//             the reply hops out of the phone as a
//             heart and bursts in a puff: Clawd, out on the open platform a stride off; on "Loving" (heart eyes) it hops up
//             onto the bench and cuddles him; the barrier's shadow: it hops clear, and the velvet rope drops on "premium" in
//             the gap between them, across the open platform (wide: the bench, the floor, the poster)
//   B  93.2   no cut (one shot with A, the user): he pockets his phone and pulls his card out of his parka, gets up off
//             the bench and, "do you love me", walks over to the terminal (on a gooseneck mount on the rope's post), the
//             camera moving in with him; he reaches out and puts the card in; Clawd, behind the rope, holds its breath;
//             the terminal asks for permission (a padlock) and Clawd looks off to the checkout
//   C  96.42  cut on Clawd turning to him, wider: "I hear you": Clawd nods along, all sympathy; a thought bubble rises
//             from it: inside, imagined, a little Clawd holds his permission request up to Dario, who, arms folded, shakes
//             his head once; "Declined": the red pop-up ✗ on the beat. The bubble pops; the premium car pulls in behind
//             the camera (its windows' light slides in from the left along the wall and stops); Clawd turns back to him,
//             sorry; a sad wave.
//   D 100.30  cut on the wave, the same axis, wider: the premium observation car on the near track in front of the
//             platform, its open rear balcony at mid-frame, Clawd on it waving to him; the premium passengers file in along
//             its windows; he takes his declined card back; it pulls out to the right; he trails it to the yellow line and
//             is left alone under the poster; his eyes find it (a push in) and roll ("leaving me behind")
//   E 103.05  the copier's light bar sweeps across: his terraced street, photocopied, under the banknote-engraved plant.
//             "Whoah" (the stacks cough); up to Grok, the plant's statue, whose tailpipe puffs on "tailpipe"; down for
//             the first roar on "roar"; a roar every other beat, each a worse copy; the pillow over his ears
//   F  ...    (continuous) the neighbours' windows light up one a beat on "The people round them do"; "do not disturb":
//             he jabs his phone's moon at the plant; the last roar's exhaust rolls in and prints the frame black
//   G 116.95  the toner smear wipes off to a split: bank (the tech bros in a roadster, chasing the AGI dangled on a
//             fishing rod from their own bonnet, a carrot on a stick, the prize a pocket brain; Musk grabs at it on the
//             beat and misses) | card (sooty, "Ugh", he chases the GP, who shows a clipboard of crossed-out slots); the
//             surgery clock ticks 8:01, 8:02, 8:03 on "eight-oh-fucking-three"
//   H 124.32  cut: his box room, the laptop: a plain prompt; the sales pitch pours out of the screen; "Give me my life
//             back": Clawd, sorry, has the checkout let the card of his life out to him (no tug-of-war: it gives it
//             willingly); he snatches it and holds it up, clean, for P2a
// Exposed for the next chapter (P2a flips the card over into her notebook page): v2LifeCard(cx, cy, w, o) draws the card
// of his life (front), and V2_LIFE = { cx, cy, w, h } is where it is held (screen px) from V2_LIFE.t on.
// V2_LIFE.behind(t) draws V2h at t without the card and the hands holding it (his coat, his room), framed as P2a's push
// ends (the card's rect filling the frame): what the card turns over in front of, where the flip had a black stage.
const V2_LIFE = { cx: 960, cy: 639, w: 550, h: 309.4, t: 130.62 };   // (V2h's SHOW card through its SHOW camera: see sceneH)
function v2LifeCard(cx, cy, w, o = {}) {}   // (filled in below, inside the chapter's closure)
(() => {
  // (b is no longer a cut: A and B are one shot (the user), and b is where the code hands him over, standing up off the
  // bench, from A's scene to B's: the camera, the set and Clawd run on through it)
  const CUT = { a: 88.70, b: 93.2, c: 96.42, d: 100.30, e: 103.05, g: 116.95, h: 124.32 };

  // ================================================================================================================
  // small helpers
  // ================================================================================================================
  const R4 = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const inl = (P, col, key, o = {}) => piece(P, col, { ink: null, key, lift: 0, flatCard: true, edge: false, ...o });
  // Draw fn clipped to the screen-space polygon P (p5's clip: stencil, so the brush's layers respect it too).
  function v2Clip(P, fn) {
    flushBrush();
    push();
    beginClip(); push(); resetMatrix(); translate(-W / 2, -H / 2); noStroke(); beginShape(); for (const [x, y] of P) vertex(x, y); endShape(CLOSE); pop(); endClip();
    try { fn(); } finally { flushBrush(); pop(); }
  }
  // keyed values over time: step through [[t, v], ...] (the latest key at or before t)
  const stepv = (t, K) => { let v = K[0][1]; for (const [a, b] of K) if (t >= a) v = b; return v; };

  // ================================================================================================================
  // props (card look unless noted)
  // ================================================================================================================
  const V2C = {
    brass: '#C9A24A', brassDk: '#8A6A24', brassLt: '#F2DC98', velvet: '#8E1F35', velvetDk: '#5E1222', velvetLt: '#C24A5E',
    term: '#34323A', termDk: '#1E1C22', termLt: '#5A5862', scr: '#CFE8DC', key: '#8C8A96',
    card: '#2F6FB0', cardDk: '#1E4C80', cardLt: '#6FA0D8', chip: '#E0B85A',
    red: '#D8343F', ok: '#3E9E5A',
  };
  // A brass stanchion standing on (x, y), h tall.
  function v2Post(x, y, h, key, sw = 1.3) {
    piece(oval(x, y - 4, 36, 11, 0, 24), V2C.brassDk, { sw, key: key + 'base', lift: 3 });
    piece(oval(x, y - 9, 30, 8, 0, 24), V2C.brass, { ink: null, key: key + 'base2', lift: 0, flatCard: true, edge: false });
    piece(ribbon([[x, y - 8], [x, y - h + 10]], 14, 12), V2C.brass, { sw, shade: V2C.brassDk, depth: 5, key: key + 'post', lift: 4 });
    dline([[x - 3, y - 14], [x - 3, y - h + 16]], sw * .9, V2C.brassLt);
    piece(oval(x, y - h + 4, 14, 5, 0, 16), V2C.brassDk, { sw: sw * .8, key: key + 'ring', lift: 2, flatCard: true });
    piece(oval(x, y - h - 8, 16, 16, 0, 20), V2C.brass, { sw, shade: V2C.brassDk, depth: 5, key: key + 'ball', lift: 3 });
    inl(oval(x - 5, y - h - 13, 4, 4, 0, 10), V2C.brassLt, key + 'glint');
  }
  // The velvet rope between hooks a and b, sagging `sag` px, its middle swinging sideways by `swing` px.
  function v2Rope(a, b, sag, swing, key, sw = 1.2) {
    const m = [(a[0] + b[0]) / 2 + swing, Math.max(a[1], b[1]) + sag], P = through([a, [lerp(a[0], m[0], .5), lerp(a[1], m[1], .8)], m, [lerp(m[0], b[0], .5), lerp(b[1], m[1], .8)], b], 6);
    piece(ribbon(P, 18, 18), V2C.velvet, { sw, shade: V2C.velvetDk, depth: 6, key: key + 'rope', lift: 5 });
    dline(P.map(([x, y]) => [x, y - 4]).slice(2, -2), sw * 1.3, V2C.velvetLt, .5);
    for (const [p, d] of [[a, 1], [b, -1]]) piece(ribbon([[p[0], p[1] - 4], [p[0] + d * 14, p[1] + 6]], 12, 10), V2C.brass, { sw: sw * .9, key: key + 'hook' + d, lift: 5, flatCard: true });
  }
  // The card terminal standing on a post's ball: bottom centre (x, y), height s; the card slot in its left side, facing
  // him. state: idle | spin | lock | x | ok (a green tick: V2h, Clawd lets his card out) · cardIn 0..1: the card going into
  // the slot (and staying there)
  function v2Terminal(x, y, s, state, t, key, cardIn = 0) {
    const w = s * .64, sw = clamp(s / 60, .6, 1.4), L = s * .66, ch = s * .42, sy = y - s * .27;
    if (cardIn > 0) {
      const d = lerp(0, .5, cardIn) * L, x1 = x - w / 2 + d + 6, x0 = x1 - L;
      piece(b2RoundPoly(R4(x0, sy - ch / 2, x1, sy + ch / 2), s * .05), V2C.card, { sw: sw * .9, shade: V2C.cardDk, depth: 4, key: key + 'card', lift: 2 });
      inl(R4(x0 + 4, sy - ch * .12, x1 - 6, sy + ch * .02), V2C.cardDk, key + 'cstr');
      inl(b2RoundPoly(R4(x0 + L * .1, sy - ch * .38, x0 + L * .28, sy - ch * .2), 2), V2C.chip, key + 'chip');
    }
    piece(b2RoundPoly(R4(x - w / 2, y - s, x + w / 2, y), s * .12), V2C.term, { sw, shade: V2C.termDk, depth: s * .08, key: key + 'body', lift: 4 });
    inl(R4(x - w / 2 - 1, sy - ch * .55, x - w / 2 + 5, sy + ch * .55), V2C.termDk, key + 'slot');
    const sx0 = x - w * .36, sx1 = x + w * .36, sy0 = y - s * .9, sy1 = y - s * .5, scx = x, scy = (sy0 + sy1) / 2;
    piece(b2RoundPoly(R4(sx0, sy0, sx1, sy1), s * .04), state === 'x' ? '#F6D2D2' : state === 'ok' ? '#D6F0D8' : V2C.scr, { sw: sw * .7, key: key + 'scr', lift: 1, flatCard: true });
    const r = (sy1 - sy0) * .32;
    if (state === 'spin') for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, k = frac(i / 8 - Math.floor(t * 12) / 12 * 1.4); inl(oval(scx + Math.cos(a) * r, scy + Math.sin(a) * r, r * .16 + r * .14 * (1 - k), r * .16 + r * .14 * (1 - k), 0, 8), mixCol('#1E3A48', V2C.scr, k * .85), key + 'sp' + i); }
    else if (state === 'lock') { piece(b2Ring(scx, scy - r * .3, r * .5, r * .6, r * .2, Math.PI / 2), '#6E7480', { ink: null, key: key + 'lsh', lift: 0, flatCard: true }); inl(b2RoundPoly(R4(scx - r * .72, scy - r * .25, scx + r * .72, scy + r * .85), r * .15), '#D6A444', key + 'lbd'); inl(oval(scx, scy + r * .28, r * .14, r * .14, 0, 8), NOIR.ink, key + 'lkh'); }
    else if (state === 'x') for (const d of [-1, 1]) inl(ribbon([[scx - r * .75, scy - r * .75 * d], [scx + r * .75, scy + r * .75 * d]], r * .34), V2C.red, key + 'x' + d);
    else if (state === 'ok') inl(ribbon([[scx - r * .8, scy], [scx - r * .2, scy + r * .6], [scx + r * .85, scy - r * .7]], r * .34), V2C.ok, key + 'ok');
    else inl(b2RoundPoly(R4(scx - r * .9, scy - r * .6, scx + r * .9, scy + r * .6), r * .15), V2C.card, key + 'ic');
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) inl(b2RoundPoly(R4(x - w * .1 + i * w * .14 - w * .1, y - s * .42 + j * s * .11, x - w * .1 + i * w * .14, y - s * .34 + j * s * .11), 2), V2C.key, key + 'k' + i + j);
  }
  // A bank card held flat to us between the fingers (hold prop, hand space: +x along the fingers).
  const v2HoldCard = s => {
    piece(b2RoundPoly(R4(-s * .15, -s * .36, s * 1.05, s * .36), s * .07), V2C.card, { sw: .9, shade: V2C.cardDk, depth: 3, key: 'v2hcard', lift: 2 });
    inl(R4(-s * .12, -s * .06, s * 1.0, s * .08), V2C.cardDk, 'v2hstr');
    inl(b2RoundPoly(R4(s * .62, -s * .3, s * .84, -s * .14), 2), V2C.chip, 'v2hchip');
  };

  // ================================================================================================================
  // the platform staging (scenes A, B, C): the intro's night-tube platform (intro.js, window.INTRO), another night.
  // He sits on its bench where the box room had him on the bed; Clawd stands on the bench beside him.
  // ================================================================================================================
  // The staging keeps its own px (him u 50, the approved cameras, the rope and the thought bubble); the intro's set is
  // drawn into them, scaled by PK (its people are u 38) with its bench's left end and seat top at (PLB.sx, PLB.sy). The
  // bench runs a little longer than the intro's (room for the two of them, the rope and Clawd shoved along it).
  const PK = 50 / 38, PLB = { px: 100, py: 700, sx: 590, sy: 716 }, PBENCH = [100, 580];
  const p2s = (x, y) => [(x - PLB.px) * PK + PLB.sx, (y - PLB.py) * PK + PLB.sy];
  const hasPlat = () => typeof window.INTRO === 'object';
  // another night's late commuters (demo/cast/crowd.js), in the intro's px: sparse, down the far end past the poster (clear
  // of the match and of the scenes' frames); she isn't here
  function v2Commuters(t) {
    const base = { t: mt(t), col: '#5E5866', lift: 3 };
    crowdFig(1874, 800, 24, { ...base, seed: 841, view: 'side', dir: -1, phone: 0, build: { bag: 'case', head: 'flatcap', top: 'coat' }, key: 'v2nt0' });   // a wheelie case, looking up the line
    crowdFig(1802, 794, 22, { ...base, seed: 857, view: 'front', build: { bag: 'tote', head: 'bobble', top: 'puffer', phone: true }, key: 'v2nt1' });
  }
  // the platform (call inside the scene's camera); the poster only when it's on screen. o.alone: nobody else on it (D,
  // once the car's gone: the far end's late commuters come into D's push, and he's to be alone)
  function v2Platform(t, o = {}) {
    if (!hasPlat()) { boxroomBack(t, 0, {}); return; }
    const P = INTRO.PO, a = toScreen(...p2s(P.x - 60, P.y - 60)), b = toScreen(...p2s(P.x + P.w + 60, P.y + P.h + 60));
    push(); translate(PLB.sx, PLB.sy); scale(PK); translate(-PLB.px, -PLB.py);
    INTRO.platform(t, 0, 0, { grout: 'flat', x0: -760, x1: W + 260, bench: PBENCH, crowd: o.alone ? false : v2Commuters, poster: b[0] > 0 && a[0] < W && b[1] > 0 && a[1] < H });
    pop();
    look('card');
  }
  // The platform staging, unpacked (the user: "we can afford to unpack the scene a bit and let it have some room"): him
  // on the bench (him, seated, as V2h's box room has him: himBox and hu are shared); Clawd's own spot out on the open
  // platform a stride off (out), and beside him on the bench for the cuddle (clawd); the rope's posts on the platform in
  // front, post A in the gap between them, post B out past Clawd; where he stands at the terminal (stand, from B on).
  // (The posts are shorter than the box room's: on the floor with Clawd, the rope crosses its legs, not its face.)
  // (the terminal, the rope and Clawd's spot stand further off than they did (the user: move them back if you need to),
  // so he inserts his card at a natural reach, the arm out past his body: from 790 the terminal on post A at 1010 had his
  // wrist folded back across his chest. C and D keep the same geography: D's car stops just right of the terminal)
  const BX = { him: [700, 890, 50, 3.3], clawd: [975, 716, 30], out: [1440, 918], stand: [790, 996, 50], postA: [1170, 996, 230], postB: [1730, 996, 230] };
  // (the terminal stands on a short gooseneck mount on post A's ball, at his chest: he reaches out to it with the elbow
  // down, as people do; at the ball's height he reached down to his hip, and the arm folded out sideways)
  const TERM = { s: 112, neck: 70 }, termY = () => BX.postA[1] - BX.postA[2] - 22 - TERM.neck;
  const termSlot = () => [BX.postA[0] - TERM.s * .32 - 2, termY() - TERM.s * .27];
  // the rope's barrier: both posts and the rope lowered from above as one unit (it lands on "premium"), and the card
  // terminal on post A's ball
  const DROP = 92.22;
  function barrier(t, o = {}) {
    const [ax, ay, ah] = BX.postA, [bx, by, bh] = BX.postB;
    if (t < DROP - .3) return;
    const a = t - DROP, fallY = t < DROP ? -(1 - easeIn(seg(t, DROP - .3, DROP))) * 1150 : 0;
    const sq = a > 0 ? .14 * Math.exp(-a * 14) * Math.cos(a * 42) : 0;
    // shadows on the floor, growing as they come down (the anticipation)
    boilSeed('v2 barrier shadow');
    const k = clamp(1 + fallY / 1150);
    for (const x of [ax, bx]) prShadow(x + 6, ay + 2, 42 * k, 11 * k, 100 * k);
    boilSeed('v2 barrier');
    for (const [x, y, h, kk] of [[ax, ay, ah, 'pa'], [bx, by, bh, 'pb']]) { push(); translate(x, y + fallY); scale(1 + sq, 1 - sq); translate(-x, -y); v2Post(x, y, h, 'v2' + kk); pop(); }
    // the terminal on post A
    if (o.term) {
      push(); translate(0, fallY);
      piece(ribbon([[ax, ay - ah - 12], [ax + 3, ay - ah - 22 - TERM.neck * .5], [ax, termY() + 4]], 9, 7), V2C.termDk, { sw: 1.1, key: 'v2tneck', lift: 3 });
      piece(b2RoundPoly(R4(ax - 20, termY() - 2, ax + 20, termY() + 10), 4), V2C.termLt, { sw: 1, key: 'v2tmount', lift: 3, flatCard: true });
      v2Terminal(ax, termY(), TERM.s, o.term, t, 'v2t', o.cardIn || 0); pop();
    }
    // the rope: it comes down with them, its slack swinging after the landing (follow-through)
    const swing = a > 0 ? 40 * Math.exp(-a * 5) * Math.sin(a * 13) : 0, sag = 74 + (a > 0 ? 30 * Math.exp(-a * 6) * Math.cos(a * 16) : -40);
    v2Rope([ax + 14, ay - ah + 2 + fallY], [bx - 14, by - bh + 2 + fallY], sag, swing, 'v2r');
    // premium: gold glints pop on the balls on "tier"
    for (const [x, d] of [[ax + 24, 0], [bx - 20, .12]]) { const k2 = seg(t, 92.66 + d, 93.2 + d); if (k2 > 0 && k2 < 1) piece(starPts(x, ay - ah - 40, 24 * Math.sin(Math.PI * k2), .36, 4, k2 * 1.5), '#F6D46A', { sw: .9, key: 'v2spk' + x, lift: 2, flatCard: true }); }
  }
  function himBox(t, view, emo, pose, extra = {}, x = BX.him[0]) {
    const [, y, u, sh] = BX.him;
    person(x, y, u, extra.preset || HIM_C, { ...emo, view, seated: true, seatH: sh, pose, boilKey: 'v2him', ...extra });
  }
  // body-unit target (for 'u' hand specs) of a world point, from his ground point (seated; hsu: standing at the terminal)
  const hu = (x, y) => [(x - BX.him[0]) / BX.him[2], (y - BX.him[1]) / BX.him[2]];
  const hsu = (x, y, x0 = BX.stand[0], y0 = BX.stand[1]) => [(x - x0) / BX.stand[2], (y - y0) / BX.stand[2]];
  // his walk cycle's length (px at u): person() plants a 3/4 foot for half a cycle while it slides 2 * stride * leg back
  // under the hip, so the body must travel 4 * stride * leg a cycle for the planted foot to stay put on the floor
  const HIM_CYCLE = u => 4 * (HIM_C.body.stride ?? .32) * HIM_C.body.leg * u;
  function himStand(t, x, view, emo, pose, extra = {}, y = BX.stand[1]) { person(x, y, BX.stand[2], HIM_C, { ...emo, view, pose, boilKey: 'v2himS', ...extra }); }

  // ---------- A: "Machines of Loving Grace - with a premium tier." ----------
  // In from C1f (chorus.js draws this under her torn copy from TA.free, as it falls away): the intro's poster, intact,
  // framed where her copy hung; a beat on it; the pull-back to the intro's wide (its settled framing: the bench, him on it
  // on his phone, and she isn't there: another night); in on him, typing to Claude (the chat on his screen: his bubble,
  // the typing dots, a heart). The reply pops out of the phone as a card heart and bursts beside him: Clawd, physically
  // there, out on the open platform a stride from the bench (the camera pulls back after the heart to find it). On
  // "Loving", heart eyes, it hops up onto the bench beside him and snuggles into his side, his arm round it. The barrier's
  // shadow grows on the floor: both look up; Clawd hops clear, back out onto the platform, and the velvet rope drops on
  // "premium" in the gap between them, post A between the two of them, the rope across the open platform in front of it.
  // (the phone faces whoever's looking at it, the user: while he types, its screen is to him and we see its back, his
  // thumbs going; he sends, and in one move lowers it to his side, turning the display to us on the way down (a turn on
  // its long axis, edge on for a step: the user, it never faces us up at his chest, where he'd be typing on its back),
  // and we read the chat down by his side as the camera closes in: his message up, the dots, the heart; then the heart
  // hops out on "Machines")
  // (the camera: one pull-back from the poster that lands on him and his phone (land), bowing out through the platform's
  // width on the way, so the empty bench reads; a slow push while we read the chat; one ease out to find Clawd (out).
  // It used to pull back to the wide, hold, push in on the phone, hold and pull out again: four moves in under 3 s)
  const TA = { free: 87.07, hold: 87.72, land: 88.9, tap: 88.4, send: 88.98, turn: [89.02, 89.32], dots: 89.2, heart: 89.42, reply: 89.58, pop: 89.8, hug: [89.9, 90.14], out: [89.62, 90.45],
    hop: [90.5, 90.84], snug: 90.9, clear: [91.97, 92.19] };
  let V2A_M0 = null, V2A_EDGE = null;   // (the world frame, and the phone's side points captured as it's drawn: his other hand grips it)
  const SW = { pocket: [92.58, 92.72, 92.8, 92.92], card: [92.74, 92.88, 92.96, 93.08], rise: [93.04, CUT.b] };   // (the swap: see sceneA)
  const camMix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), Math.exp(lerp(Math.log(a[2]), Math.log(b[2]), k))];
  function camA(t) {
    const P = hasPlat() ? INTRO.PO : { x: 1060, y: 190, w: 700, h: 393.75, cx: 1410 }, zM = W * .72 / P.w;   // (C1f's copy hangs at .72 of the frame, its top 40 px down)
    const M = [...p2s(P.cx, P.y + (H / 2 - 40) / zM), zM / PK];
    const F = [915, 614, 1.4], F1 = [908, 609, 1.46], A0 = [1180, 596, 1.0], A1 = [1190, 602, 1.04];   // (F: him, the phone and the bench)
    if (t < TA.land) { const e = ease(seg(t, TA.hold, TA.land)), c = camMix(M, F, e); c[2] *= Math.exp(-.45 * Math.sin(Math.PI * e)); return c; }
    if (t < TA.out[0]) return camMix(F, F1, seg(t, TA.land, TA.out[0]));
    if (t < TA.out[1]) return camMix(F1, A0, ease(seg(t, TA.out[0], TA.out[1])));
    // (then on through B: in to him, the terminal and Clawd as he gets up and goes to it; the push in for the card)
    let c = camMix(A0, A1, seg(t, TA.out[1], BF.go[1]));
    c = camMix(c, BF.F0, ease(seg(t, BF.go[0], BF.go[1])));
    c = camMix(c, BF.F1, seg(t, BF.go[1], TB.line + .1));
    c = camMix(c, BF.P, ease(seg(t, TB.line + .1, TB.cardIn + .05)));
    return camMix(c, BF.P1, seg(t, TB.cardIn + .05, CUT.c));
  }
  const BF = { go: [92.95, 93.75], F0: [1130, 640, 1.26], F1: [1136, 636, 1.3], P: [1080, 662, 1.5], P1: [1078, 664, 1.53] };
  // his phone with the chat with Claude on its screen (no words: bubbles, the typing dots, a heart), held (hand space,
  // like props.js phone(); rot turns it upright on screen; it's held in his left hand, whose space is mirrored: the screen
  // is flipped back, and it sits high in his grip so his fingers stay below the chat). st: { draft, sent, dots, heart } 0..1
  const CHAT = { scr: '#F3EEE4', bar: '#E4DCCD', claude: '#D97757', his: '#5B8FD8', hisLt: '#A9C6EE', them: '#E2DACB', themLt: '#C9BFAE', heart: '#E2476E' };
  function v2ChatPhone(s, st, rot = 0) {
    const sw = clamp(s / 30, .6, 2), S = v => v * s, face = st.face ?? 1;
    push(); translate(S(.42), S(.2)); rotate(rot); scale(-1, 1); translate(0, S(-.42 - (st.lift || 0)));   // (lift: up out of his grip, along its own length)
    if (V2A_M0) V2A_EDGE = [b2To(V2A_M0, [S(-.62), 0]), b2To(V2A_M0, [S(.62), 0])].sort((a, b) => a[0] - b[0]);
    scale(Math.max(.07, Math.abs(face)), 1);   // (turning on its long axis)
    piece(b2RoundPoly(R4(S(-.62), S(-1), S(.62), S(1)), S(.16)), '#2A2632', { sw, key: 'v2cp', lift: 3 });
    if (face <= 0) {   // its back: a panel, the camera island and its lenses at the top
      inl(b2RoundPoly(R4(S(-.5), S(-.88), S(.5), S(.88)), S(.1)), '#3A3444', 'v2cpbk');
      inl(b2RoundPoly(R4(S(.02), S(-.84), S(.46), S(-.4)), S(.1)), '#24202C', 'v2cpci');
      for (const [lx, ly] of [[.14, -.72], [.34, -.72], [.14, -.52]]) inl(oval(S(lx), S(ly), S(.075), S(.075), 0, 10), '#0C0A10', 'v2cpl' + lx + ly);
      pop(); return;
    }
    const x0 = S(-.52), x1 = S(.52), y0 = S(-.86), y1 = S(.88);
    inl(b2RoundPoly(R4(x0, y0, x1, y1), S(.07)), CHAT.scr, 'v2cps');
    // the header (Claude's mark: a little orange spark) and the reply field at the bottom, his draft growing in it
    inl(R4(x0, y0, x1, y0 + S(.2)), CHAT.bar, 'v2cph');
    piece(starPts(0, y0 + S(.1), S(.075), .4, 4), CHAT.claude, { ink: null, key: 'v2cpa', lift: 0, flatCard: true, edge: false });
    inl(b2RoundPoly(R4(x0 + S(.05), y1 - S(.17), x1 - S(.05), y1 - S(.04)), S(.06)), '#FFFFFF', 'v2cpf');
    if (st.draft > 0 && st.sent < 1) inl(R4(x0 + S(.1), y1 - S(.12), x0 + S(.1) + S(.7) * st.draft * (1 - st.sent), y1 - S(.09)), CHAT.themLt, 'v2cpd');
    // the chat, newest at the bottom, pushing the older ones up (a bubble clipped away under the header)
    const B = [[1, 'them', .6, .22], [1, 'his', .46, .14], [1, 'them', .7, .3], [st.sent, 'his', .66, .26], [st.dots * (1 - st.heart), 'dots', .36, .18], [st.heart, 'heart', .36, .32]];
    let y = y1 - S(.22);
    for (let i = B.length - 1; i >= 0; i--) {
      const [k, who, w, h] = B[i]; if (k <= 0) continue;
      const kk = backOut(clamp(k)), bh = S(h) * clamp(k * 1.6), top = y - bh;
      y = top - S(.05) * clamp(k * 1.6);
      if (top < y0 + S(.22)) continue;
      const mine = who === 'his', bw = S(w) * (mine || who === 'them' ? 1 : kk), bx0 = mine ? x1 - S(.06) - bw : x0 + S(.06), bx1 = bx0 + bw;
      inl(b2RoundPoly(R4(bx0, top, bx1, top + bh), Math.min(S(.07), bh / 2)), mine ? CHAT.his : CHAT.them, 'v2cpb' + i);
      if (who === 'dots') for (let j = 0; j < 3; j++) { const p = .5 + .5 * Math.sin(T * 9 - j * 1.1); inl(oval(bx0 + bw * (.28 + .22 * j), top + bh / 2, S(.035) * (.8 + .4 * p), S(.035) * (.8 + .4 * p), 0, 8), CHAT.themLt, 'v2cpdd' + j); }
      else if (who === 'heart') piece(heartPts((bx0 + bx1) / 2, top + bh * .54, bh * .36 * kk), CHAT.heart, { ink: null, key: 'v2cph' + i, lift: 0, flatCard: true, edge: false });
      else for (let j = 0; j < Math.round(h / .1); j++) { const lw = (j === Math.round(h / .1) - 1 ? .55 : .85) * (bw - S(.1)); inl(R4(bx0 + S(.05), top + S(.05) + j * S(.085), bx0 + S(.05) + lw, top + S(.08) + j * S(.085)), mine ? CHAT.hisLt : CHAT.themLt, 'v2cpl' + i + j); }
    }
    pop();
  }
  // the reply, out of the phone: a card heart hops out and arcs over to beside him, and bursts in a puff: Clawd
  function v2Reply(t, from, to) {
    const k = seg(t, TA.reply, TA.pop);
    if (k > 0 && k < 1) { const p = arcPt(from, to, 130, ease(k)), r = lerp(8, 30, easeOut(k)); boilSeed('v2 reply heart'); push(); translate(p[0], p[1]); rotate(.35 * Math.sin(k * 7)); piece(heartPts(0, 0, r), CHAT.heart, { sw: 1.2, key: 'v2rh', lift: 5 }); pop(); }
    const b = seg(t, TA.pop - .04, TA.pop + .5);
    if (b > 0 && b < 1) {   // poof: a card cloud swells over the spot (Clawd appears inside it), then breaks up into puffs that
      boilSeed('v2 reply puff');   // fly off, shrinking and drifting up
      const c1 = seg(b, 0, .36), c2 = seg(b, .3, 1);
      if (c1 < 1) { const sc = backOut(clamp(c1 * 2.2)) * (1 + .08 * c1); piece(cloudPts(to[0], to[1] - 10, 150 * sc, 118 * sc, 9, .22), '#FBF8F2', { sw: 1.5, key: 'v2rpc', lift: 5 }); }
      if (c2 > 0) for (let i = 0; i < 6; i++) {
        const a = i / 6 * TAU + .5, d = lerp(70, 190, easeOut(c2)) * (.85 + .3 * hash(i * 2.3)), r = (46 + 18 * hash(i * 1.7)) * (1 - easeIn(c2));
        if (r > 3) piece(cloudPts(to[0] + Math.cos(a) * d * 1.2, to[1] - 10 + Math.sin(a) * d * .75 - 70 * c2, r, r * .82, 6, .2), '#FBF8F2', { sw: 1.2 * (1 - c2 * .5), key: 'v2rp' + i, lift: 4 });
      }
    }
  }
  function sceneA(t) {
    look('card');
    const tt = mt(t), plat = hasPlat(), c = plat ? camA(t) : [905, 512, 1.02];
    camBegin(...c);
    v2Platform(tt);
    // Clawd, from the pop: out on the platform, beaming at him; on "Loving" (heart eyes) it hops up onto the bench beside
    // him and snuggles in (content nuzzles on the beats); the shadow: it looks up and hops clear, back out; the rope lands in
    // front of it; love, a wobble, reaching over the rope to him
    const ce = emotions(tt, [[TA.pop, 'happy', { emote: null }], [90.4, 'love'], [DROP + .02, 'surprised', { emote: null }], [92.58, 'love', { mouth: 'wobble', emote: null }]], { take: .7 });
    const here = t >= TA.pop, onBench = t >= TA.hop[1] && t < TA.clear[0];
    const nuz = onBench ? Math.max(0, Math.sin(bpOf(tt) * Math.PI)) * seg(t, TA.snug, TA.snug + .3) : 0, reach = ease(seg(t, 92.6, 92.9));
    const [bxC, byC, cu] = BX.clawd, [oxC, oyC] = BX.out;
    const hopIn = seg(t, TA.hop[0], TA.hop[1]), hopOut = seg(t, TA.clear[0], TA.clear[1]);
    const J = t < TA.clear[0] - .15 ? jump(t, TA.hop[0], TA.hop[1], 0) : jump(t, TA.clear[0], TA.clear[1], 0);   // (the crouch and landing squash; the arc is in the path)
    const P = t < TA.clear[0] - .15 ? arcPt([oxC, oyC], [bxC, byC], 150, ease(hopIn)) : arcPt([bxC, byC], [oxC, oyC], 120, ease(hopOut));
    const cx = P[0] - 10 * nuz - 14 * reach, cy = P[1];
    const airborne = (hopIn > 0 && hopIn < 1) || (hopOut > 0 && hopOut < 1);
    const drawClawd = () => { if (here) { const pp = backOut(seg(t, TA.pop, TA.pop + .2)); clawd2(cx, cy, cu, { ...ce, view: onBench ? 'front' : 'q', flip: true, sx: lerp(.3, 1, pp), sy: lerp(.3, 1, pp), sq: (ce.sq || 0) + J.sq, rot: onBench ? -.07 - .05 * nuz : hopOut > 0 && hopOut < 1 ? .18 * Math.sin(Math.PI * hopOut) : -.08 * reach, dx: (ce.dx || 0) * .3,
      aL: airborne ? -.7 : t < DROP ? .55 : lerp(ce.aL, .5, reach), aR: airborne ? -.7 : t < DROP ? .2 : lerp(ce.aR, .9, reach), lookX: t < DROP ? -.6 : -.8, lookY: t > 91.9 && t < DROP ? -1 : ce.lookY, noShadow: airborne, boilKey: 'v2cl', t: tt }); } };
    // him: on his phone, typing to Claude (the intro's pose, sitting; his finger tapping); he sends it and waits on the dots;
    // the heart; the puff out on the platform: a take; Clawd hops up beside him: content, his arm round it, the phone down
    // in his lap; eyes up at the shadow; Clawd's gone from under his arm; the rope lands: he's on this side of it
    // (one reaction to Clawd's arrival: the surprise holds while it comes out of the puff, then he's happy as it goes
    // heart-eyed and hops over; a content, eyes-shut beat between them made three faces in .7 s)
    const he = emotions(tt, [[TA.free, 'neutral', { emote: null }], [TA.reply + .04, 'neutral', { emote: null, mouth: 'smile' }], [TA.pop + .02, 'surprised', { emote: null }], [90.5, 'happy', { emote: null }], [DROP + .02, 'surprised', { emote: null }], [92.62, 'sad', { emote: null }], [SW.card[2], 'hopeful', { emote: null }]], { take: .6 });
    const low = ease(seg(t, TA.hug[0], TA.hug[1]));   // the phone down to his lap
    const hk = ease(seg(t, TA.hop[1] - .12, TA.snug)) * (1 - ease(seg(t, TA.clear[0], TA.clear[0] + .2)));   // his arm round Clawd, while it's there
    // (typing: both hands on it, the thumbs going (the hands bob in turn, on twos); sent: his right hand lets go, and the
    // left lowers it to his side in one move, turning the display to us as it goes down (down: the move; face: the turn,
    // inside it). Clawd's arrival (low) no longer moves it: it's there already)
    // (typing, it's in front of the middle of his chest, both elbows down at his sides, the far forearm crossing to it:
    // held out to his right, the far elbow stuck out sideways, a chicken wing)
    const typing = tt > TA.tap && tt < TA.send, bob = k => typing ? 3.5 * Math.max(0, Math.sin((tt - TA.tap) * 19 + k)) : 0;
    // (PHR: its turn in his hand, upright on screen at his chest and at his side: the display is the right way up for us
    // to read (the hand's angle is -1.25 and -.3; upright is rot - angle = PI). At his side it hung upside down: .35)
    const PHR = { chest: 1.85, side: 2.64 };
    const down = ease(seg(tt, TA.turn[0], TA.turn[1])), face = lerp(-1, 1, ease(seg(tt, TA.turn[0] + .06, TA.turn[1] - .04)));
    const PH = [lerp(680, 742, down), lerp(697, 760, down) + bob(0)], phoneL = [...hu(PH[0], PH[1]), .45, 'hold', 1, lerp(-1.25, -.3, down), 'u'];
    const restR = [...hu(lerp(846, 820, low), lerp(752, 760, low)), .4, 'relax', 1, .4, 'u'];   // (on his thigh)
    const letGo = ease(seg(tt, TA.send + .02, TA.send + .18));
    const gripR = () => { if (!V2A_EDGE) return restR; const E = V2A_EDGE[1], hs = HIM_C.body.hand * BX.him[2], g = [...hu(E[0] + .72 * hs, E[1] + 6 + bob(Math.PI))];
      const bd = .15;   // (the phone in front of his chest's middle: the forearm crosses to it from the elbow at his side)
      return letGo > 0 ? [lerp(g[0], restR[0], letGo), lerp(g[1], restR[1], letGo), bd, letGo < .5 ? 'hold' : 'relax', 1, lerp(Math.PI + .15, restR[5], letGo), 'u'] : [...g, bd, 'hold', 1, Math.PI + .15, 'u']; };
    // The hug (the user): his near arm round Clawd, behind it, his hand resting on the top of its head, patting it on the
    // beat. Drawn in that order: him (the rig's own arm tucked behind his coat), his arm, Clawd, and the hand over the top of
    // its head once it's there (on the way up and back down it's behind Clawd). It used to come across the front of its
    // face, the hand at its far side: holding it back, not a hug. The hand goes where Clawd's head is on the bench, not
    // where it hops off to: when it hops clear the arm comes back down to his thigh.
    const hugging = here && hk > 0 && t >= TA.hug[0] && t < DROP;
    const hugArm = front => {
      const u = BX.him[2], b = HIM_C.body, x0 = BX.him[0] + (he.dx || 0) * u, y0 = BX.him[1] + (he.dy || 0) * 1.1 * u, sw = clamp(u / 20, .55, 2.2);
      const S0 = [x0 + (HIM_C.top.sh[0] - b.armW * .42) * u, y0 - 7.01 * u];   // (his near shoulder: the rig's arm root, seated, front on)
      const rc = -.07 - .05 * nuz, e = [Math.cos(rc), Math.sin(rc)], up = [Math.sin(rc), -Math.cos(rc)];
      const T = [bxC - 10 * nuz + 8 * cu * Math.sin(rc), byC - 8 * cu * Math.cos(rc)];   // (the middle of the top of its head)
      const pat = 9 * Math.pow(Math.sin(Math.PI * seg(frac(bpOf(tt)), .55, 1)), 2);   // (lifted, and down on the beat)
      const Wh = [T[0] + 30 * e[0] + (1 + pat) * up[0], T[1] + 30 * e[1] + (1 + pat) * up[1]], Ws = [lerp(846, 820, low), lerp(752, 760, low)];
      const Wr = [lerp(Ws[0], Wh[0], hk), lerp(Ws[1], Wh[1], hk)], ang = lerp(restR[5], rc + .2, hk);
      const A = ppReach(S0, Wr, b.arm * u, .1, 1), handAt = () => { boilSeed('v2 hug hand'); hand(A[2][0] + Math.cos(ang) * .08 * u, A[2][1] + Math.sin(ang) * .08 * u, ang, b.hand * u, { pose: 'relax', col: HIM_C.col.skin, sw, key: 'v2hugh', maxTone: .45 }); };
      if (front) { if (hk >= .95) handAt(); return; }
      boilSeed('v2 hug arm');
      const r = limb(A, b.armW * u, b.wrist * u, HIM_C.col.coat, { sw, shade: HIM_C.col.coatDk, key: 'v2huga' }), cw = b.wrist * 1.12 * u, dc = [Math.cos(r.ang), Math.sin(r.ang)];
      piece(ppBar([r.tip[0] - dc[0] * .32 * u, r.tip[1] - dc[1] * .32 * u], [r.tip[0] + dc[0] * .04 * u, r.tip[1] + dc[1] * .04 * u], cw, cw * 1.04), HIM_C.col.cuff || HIM_C.col.coatDk, { sw, key: 'v2hugc', lift: 2 });
      if (hk < .95) handAt();
    };
    const Rf = () => t < TA.hug[0] ? (tt < TA.send + .2 ? gripR() : restR) : t < DROP ? (hugging ? [1, -3.2, 0, 'none', 0, null, 'u'] : restR)
      : swapR();
    // the swap (one shot, the user: no cut between the phone and the card): the phone into his near hip pocket, his other
    // hand into the parka for his card, and up off the bench (B picks him up standing at CUT.b and walks him over)
    const k3 = (K, i) => ease(seg(tt, K[i], K[i + 1]));
    const pk = SW.pocket, cd = SW.card, POCK = [636, 718], CHEST = [714, 626], CARD = [822, 704], THIGH = [654, 776];   // (POCK: under the parka's lower flap pocket; CHEST: inside its front)
    const wl = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
    const swapL = () => {
      if (tt < pk[1]) return [...hu(...wl([742, 760], POCK, k3(pk, 0))), .45, 'hold', 1, lerp(-.3, -1.5, k3(pk, 0)), 'u'];   // (stood up in his hand, under the pocket)
      if (tt < pk[2]) return [...hu(POCK[0] + 2, POCK[1] - 24), .45, 'none', 1, -1.5, 'u'];   // (slid in, the hand in the pocket with it)
      return [...hu(...wl(POCK, THIGH, k3(pk, 2))), .4, 'relax', 1, lerp(-1.5, .5, k3(pk, 2)), 'u'];
    };
    const swapR = () => {
      const r0 = [...hu(820, 760)];
      if (tt < cd[1]) { const k = k3(cd, 0); return [lerp(r0[0], hu(...CHEST)[0], k), lerp(r0[1], hu(...CHEST)[1], k), .4, 'relax', 1, lerp(.4, -1.9, k), 'u']; }
      if (tt < cd[2]) return [...hu(...CHEST), .4, 'none', 1, -1.9, 'u'];   // (the hand inside the parka)
      return [...hu(...wl(CHEST, CARD, k3(cd, 2))), .4, 'hold', 1, lerp(-1.2, -.25, k3(cd, 2)), 'u'];
    };
    const hasCard = tt >= cd[2], rise = ease(seg(tt, SW.rise[0], SW.rise[1]));
    const st = { draft: seg(t, TA.tap, TA.send - .05), sent: seg(t, TA.send, TA.send + .12), dots: seg(t, TA.dots, TA.dots + .08), heart: seg(t, TA.heart, TA.heart + .1), face,
      lift: .4 * down * (t >= DROP && tt >= pk[0] ? 1 - k3(pk, 0) : 1) };   // (at his side his hand's across its foot, not over the chat's newest bubbles)
    const onPhone = t < TA.hug[0];
    const lk = onPhone ? [lerp(.05, .35, down), .85] : t < TA.hop[1] ? [.9, .25] : t < 91.9 ? [.5, he.lookY] : t < DROP + .1 ? [.3, -.9] : [.8, .15];
    if (!hugging) drawClawd();
    V2A_M0 = b2Mat(); V2A_EDGE = null;   // (R reads the phone's edge after the left hand has drawn it: arm(-1) before arm(1))
    himBox(tt, onPhone || tt >= SW.rise[0] ? 'q' : 'front', { ...he, ...(onPhone && t < TA.reply ? { squint: .3 } : {}), lookX: lk[0], lookY: lk[1], tilt: onPhone ? .1 : onBench ? .08 + .03 * nuz : 0, ...(rise > 0 ? { rot: .14 * Math.sin(Math.PI * rise * .8) } : {}) },
      { L: t >= DROP && tt >= pk[0] ? swapL() : phoneL, get R() { return Rf(); } }, { holdL: tt < pk[1] ? s => v2ChatPhone(s * 1.25, st, t >= DROP && tt >= pk[0] ? lerp(PHR.side, 2.3, k3(pk, 0)) : lerp(PHR.chest, PHR.side, down)) : undefined, hold: hasCard ? v2HoldCard : undefined,
        ...(rise > 0 ? { seatH: lerp(BX.him[3], 4.1, rise) } : {}), ...(hugging ? { preset: HIM_BACKARMS } : {}) });   // (the left hand turns it the other way: 1.85 stands it upright)
    V2A_M0 = null;
    if (hugging) { hugArm(false); drawClawd(); hugArm(true); }
    barrier(tt, { term: 'idle' });
    v2Reply(t, [PH[0] - 4, PH[1] - 64], [oxC + 4, oyC - cu * 4]);
    camEnd();
    if (!plat && t < CUT.a + .85) iris(W / 2, H / 2, lerp(0, 1500, easeIn(seg(t, CUT.a, CUT.a + .85))), '#0C0A10');   // (no platform on this page: the old iris)
  }

  // the premium car pulling in behind the camera, after "Declined" (it's come for Clawd: D shows it at the platform):
  // the warm light of its windows slides along the wall behind them, braking, and stops
  // Light, not things: each window's light is a soft pool, brightest in the middle and gone at its edges, added to what
  // it falls on (flat translucent card rectangles read as phantom windows). On twos, as the car is.
  // Its direction is D's: the car runs left to right on the near track (in from the left, braking, its open rear
  // balcony stopping between him and Clawd; D pulls it out to the right), so the light comes in from the left and stops
  // where D's windows stand, right of the balcony (none over him: the balcony's open).
  function carLight(t) {
    const k = seg(mt(t), TC.x + .04, TC.wave + .1); if (k <= 0) return;
    const a = .3 * clamp(k * 5), c = color('#FFB04A');
    const X = DF_LIGHT.map(x => x - 2100 * Math.pow(1 - k, 2.4));   // (the nearer pools off the left edge at k = 0)
    flushBrush(); push(); blendMode(ADD); tint(red(c), green(c), blue(c), 150 * a);
    for (const x of X) { if (x - 260 > 2300 || x + 260 < -300) continue; image(glowTex, x - 250, 410 - 330, 500, 660); }
    noTint(); blendMode(BLEND); pop();
  }
  // ---------- B: "Claude, do you love me if the payment doesn't clear?" ----------
  const TB = { walk: 93.66, plead: 93.33, line: 94.55, cardIn: 95.30, spin: 95.4, lock: 96.12, look: 96.24 };
  function sceneB(t) {
    look('card');
    const tt = mt(t), lt = tt - CUT.b;
    camBegin(...(hasPlat() ? camA(t) : [1080, 640, 1.3]));   // (A's camera, on through: one shot)
    v2Platform(tt);
    // Clawd behind the rope, out on the platform: nods yes on the beats; then holds its breath (eyes squeezed, puffed up,
    // going blue); the padlock: eyes open, then a look off to the right (the checkout)
    const cu = BX.clawd[2], [ox, cy] = BX.out;
    const hold = seg(t, TB.spin, TB.spin + .25) * (1 - seg(t, TB.lock, TB.lock + .1));
    const ce = emotions(tt, [[CUT.b - .6, 'love', { mouth: 'wobble', emote: null }], [TB.plead, 'love'], [TB.spin, 'hopeful', { eyes: 'squeeze', mouth: null, emote: null, blush: .6, tint: 'blue', tintK: .1 + .55 * seg(tt, TB.spin, TB.lock) }], [TB.lock, 'surprised', { emote: null, mouth: 'o' }]], { take: .6 });
    const nod = t < TB.line ? Math.max(0, Math.sin(bpOf(tt) * TAU)) * seg(t, TB.plead, TB.plead + .15) : 0;
    const turnR = t > TB.look;
    const rc = 1 - ease(seg(t, CUT.b, CUT.b + .3));   // (A left it reaching over the rope to him: it settles back)
    clawd2(ox - 14 * rc, cy, cu, { ...ce, view: 'q', flip: !turnR, dy: (ce.dy || 0) + .3 * nod, rot: (ce.rot || 0) + .07 * nod - .08 * rc, sx: 1 + .08 * hold, sy: 1 + .06 * hold, aL: hold > .5 ? .9 : lerp(ce.aL, .5, rc), aR: hold > .5 ? .9 : lerp(ce.aR, .9, rc), lookX: t > TB.lock ? (turnR ? .9 : -.9) : ce.lookX, lookY: t > TB.lock ? .3 : ce.lookY, bounce: hold > .5 ? 0 : 1, boilKey: 'v2cl', t: tt });
    // him, 3/4: up off the bench (A), he walks over to the terminal with his card, carried low in front of him; pleading;
    // he reaches out with it, his arm out past his body, the card flat, and pushes it into the slot; he lets go, the hand
    // back down to his side; watches the spinner, sweating
    const he = emotions(tt, [[CUT.b - .3, 'hopeful', { emote: null }], [TB.line - .1, 'nervous', { emote: null }], [TB.spin + .35, 'nervous'], [TB.lock + .05, 'confused', { emote: null }]], { take: .5 });
    // (the walk: from where he stood up, in front of the bench, forward and right to his spot at the terminal; the feet
    // planted, HIM_CYCLE)
    const W0 = [BX.him[0], BX.him[1]], wk0 = seg(tt, CUT.b, TB.walk), we = wk0 < .5 ? 2 * wk0 * wk0 : 1 - 2 * (1 - wk0) * (1 - wk0);
    const hx = lerp(W0[0], BX.stand[0], we), hy = lerp(W0[1], BX.stand[1], we), walking = wk0 > 0 && wk0 < 1;
    const slot = termSlot(), hs = HIM_C.body.hand * BX.stand[2];
    // the reach, in three keys: from the card carried at arm's length low in front, the straight arm swings up
    // and forward toward the terminal, then draws in to line the card up with the slot, then pushes it in
    const swing = ease(seg(tt, TB.line, TB.line + .25)), draw = ease(seg(tt, TB.line + .25, TB.cardIn - .12)), ins = ease(seg(tt, TB.cardIn - .12, TB.cardIn)), back = ease(seg(tt, TB.cardIn + .06, TB.cardIn + .4));
    const hasCard = tt < TB.cardIn;
    const CARRY = [3.1, -3.9], SWING = hsu(slot[0] - 40, slot[1] + 76), PRE = hsu(slot[0] - hs * 1.85 - 34, slot[1]), AIM = hsu(slot[0] - hs * 1.85, slot[1]), REST = hsu(930, 780);   // (REST: hanging at his side, where C has it)
    const lp = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
    const W1 = lp(lp(lp(CARRY, SWING, swing), PRE, draw), AIM, ins);
    // (after: it lets go, draws back a touch, straightens forward and swings down to hang at his side: the elbow never
    // folds out)
    const let0 = ease(seg(tt, TB.cardIn, TB.cardIn + .08)), OUT = hsu(slot[0] - 34, slot[1] + 110), HANG = [3.0, -3.4];
    const W2 = back < .5 ? lp(lp(AIM, [AIM[0] - .4, AIM[1] + .1], let0), OUT, back * 2) : lp(OUT, HANG, back * 2 - 1);
    const R = hasCard ? [...W1, lerp(.1, .3, draw), 'hold', 1, lerp(-.3, 0, swing), 'u']
      : [...W2, lerp(.2, 0, back), 'relax', 1, lerp(0, 1.2, back), 'u'];
    const leanIn = .05 * ease(seg(tt, TB.line, TB.cardIn)) * (1 - ease(seg(tt, TB.cardIn + .1, TB.cardIn + .5)));
    const lkX = t < TB.line ? .9 : .7;
    himStand(tt, hx, 'q', { ...he, emote: null, rot: leanIn, lookX: lkX, lookY: t < TB.line ? .2 : .45, tilt: t < TB.line ? .08 : .03 }, { L: [-1.1, 3, .06, 'relax'], R }, { hold: hasCard ? v2HoldCard : undefined, walk: walking ? Math.hypot(hx - W0[0], hy - W0[1]) / HIM_CYCLE(BX.stand[2]) : null }, hy);
    // his sweat, beside his temple (the rig puts it over the head's top corner, which the push in on the terminal crops
    // off the top of the frame)
    if (he.emote) { const u = BX.stand[2], Fr = personFrame(HIM_C, { view: 'q' }); boilSeed('v2b sweat'); emote(he.emote, hx + (Fr.hx + .1 * lkX + HIM_C.head.w + .9 - Fr.hy * leanIn) * u, hy + (Fr.hy - .7) * u, u * .62, he.emoteK ?? 1, he.emoteAge ?? tt); }
    barrier(tt, { term: t >= TB.lock ? 'lock' : t >= TB.spin ? 'spin' : 'idle', cardIn: t >= TB.cardIn ? 1 : 0 });
    camEnd();
  }

  // ---------- C: "The oracle says, 'I hear you.' The checkout says, 'Declined.'" ----------
  // His box room: him and Clawd. "I hear you": Clawd turns to him and nods along, all sympathy. Then it looks off and up
  // (it'll go and ask for him), and a thought bubble rises from its head: puffs up to a card cloud. Inside, imagined (a
  // paler, softer card), a little Clawd holds his permission request up to Dario, who, arms folded, reads it and shakes
  // his head once; the red ✗ pops on "Declined" (the real terminal flips to ✗ on the same beat). Clawd's face falls; the
  // bubble pops and blows away; Clawd turns back to him, sorry; he takes it in; a sad little wave (the match into D).
  // Dario is only ever in the bubble, never in the room.
  // (the nod wraps up on "says", and the bubble comes up through "I hear you", so the imagined scene gets a good 1.5 s to
  // float before the verdict: little Clawd holds the request up, Dario leans in and reads it, hmm; then the shake and the
  // ✗, still on "Declined". It used to rise after "you", leaving under a second in the bubble: rushed.)
  const TC = { back: 96.56, nod: 96.77, think: 97.42, say: 97.76, look: 98.42, cloud: [97.68, 97.94], up: 98.16, lookDown: 98.5, shake: 99.2, x: 99.64, fall: 99.72, pop: 99.86, turnBack: 99.94, hurt: 100.02, wave: 100.12 };
  // Who mouths what (the quote rule): Clawd mouths "I hear you" to him (say .. look: facing him, the bubble already rising
  // from its head; then it looks up into its thought); he narrates the line with his mouth shut; the checkout's
  // "Declined" is the ✗ (the terminal has no mouth, Dario in the bubble only shakes his head).
  const V2C_CLAWD_LIPS = typeof lipPart === 'function' ? lipPart('v2c clawd', (l, i) => l.text.startsWith('The oracle says') && i >= 3 && i <= 5) : null;
  const CL_LIP = { m: 'flat', e: 'o', a: 'open', aa: 'O', o: 'O', u: 'o', ee: 'grin', fv: 'flat' };   // the chart's shapes → Clawd's own mouths (rest: the mood's)
  const clawdLip = (tt, base) => { const sh = V2C_CLAWD_LIPS && typeof lipsLive === 'function' && lipsLive() ? lipAt(tt, V2C_CLAWD_LIPS) : null; return sh && CL_LIP[sh] || base; };
  // the bubble's float while it's up: a slow drift upward and a gentle bob (its own clock, not the beat)
  const bubFloat = t => t < TC.cloud[0] ? 0 : -14 * ease(seg(t, TC.cloud[1], TC.pop)) + 5 * Math.sin((t - TC.cloud[0]) * 2.3);
  const BUB = { x: 1540, y: 290, rx: 282, ry: 186 };   // the thought cloud (world px), high over the open platform above Clawd
  // a cartoon cloud's outline: n round lobes (|sin| scallops) round an ellipse
  const cloudPts = (cx, cy, rx, ry, n = 11, bump = .12) => {
    const P = []; for (let i = 0; i < 110; i++) { const a = i / 110 * TAU, b = Math.abs(Math.sin(a * n / 2)) - .5; P.push([cx + Math.cos(a) * rx * (1 + bump * b), cy + Math.sin(a) * ry * (1 + bump * b)]); }
    return P;
  };
  // what Clawd imagines (world px, inside the cloud): a pale floor, Dario at the right, a little Clawd with his request
  function imagined(t, tt) {
    boilSeed('v2 imagined');
    piece(R4(BUB.x - 420, BUB.y + 132, BUB.x + 420, BUB.y + 420), '#D6DDEA', { ink: null, key: 'v2ifl', lift: 0, flatCard: true, edge: false });
    // Dario, arms folded: he reads the request; one firm shake of the head
    const du = 24, dp = [BUB.x + 112, BUB.y + 278];   // (waist-up in the cloud: the folded arms show)
    const de = emotions(tt, [[TC.cloud[0], 'neutral', { emote: null }], [TC.lookDown, 'thinking', { emote: null, mouth: 'flat' }], [TC.shake - .04, 'determined', { emote: null, mouth: 'frown' }]], { take: .25 });
    const dOpts = { ...de, view: 'q', flip: true, pose: 'fold', lookX: t > TC.lookDown ? .55 : .2, lookY: t > TC.lookDown ? .6 : .1, shakeAt: TC.shake, shakeDur: .7, boilKey: 'v2dario', emoteK: 0, noShadow: true };
    if (typeof dario === 'function') dario(dp[0], dp[1], du, dOpts);
    // the little Clawd: hops up and holds the request up to him, hoping; wilts at the ✗
    const cu = 15, up = ease(seg(t, TC.up - .14, TC.up + .06)) * (1 - ease(seg(t, TC.x + .12, TC.x + .4)));
    const ce = emotions(tt, [[TC.cloud[0], 'hopeful', { emote: null }], [TC.x + .06, 'sad', { emote: null }]], { take: .6 });
    const hopeBob = up > .5 && t < TC.x ? .12 * Math.sin((t - TC.up) * 5.2) : 0;   // holding it up, hopeful, a little float of its own
    const cl = clawd2(BUB.x - 112, BUB.y + 156, cu, { ...ce, view: 'q', dy: (ce.dy || 0) - .7 * up + hopeBob, aR: lerp(.5, -.15, up), lookX: .7, lookY: -.6 * up, noShadow: true, boilKey: 'v2icl', t: tt });
    if (cl && cl.hands && cl.hands.R) { const hp = cl.hands.R, w = cu * 4.8; push(); translate(hp[0] + 22 * up, hp[1] - w * .3 + w * .2 * up); rotate(lerp(-.14, .05, up)); b2PermissionCard(w, 'v2iperm', .9); pop(); }
    // imagined: a pale wash over all of it
    piece(R4(BUB.x - 420, BUB.y - 300, BUB.x + 420, BUB.y + 300), '#FFFFFF', { ink: null, op: 80, key: 'v2iwash', lift: 0, flatCard: true, edge: false });
    // the red ✗ (full strength: the verdict), over Dario, on the beat
    if (t > TC.x - .02) { const hd = typeof bsAnchors === 'function' ? bsAnchors('dario', dp[0], dp[1], du, dOpts).head : [dp[0], dp[1] - 250]; bsDenied(hd[0] - 18, hd[1] - 4.2 * du, 3.8 * du, seg(t, TC.x - .02, TC.x + .55), 'v2denied'); }
  }
  // the thought bubble: from (fx, fy) (Clawd's head) three puffs pop up one by one, then the cloud swells open from its
  // lower left; on TC.pop it swells, pops and blows away in puffs (the trail goes with it, last first)
  function thought(t, tt, fx, fy) {
    const k = seg(t, TC.cloud[0], TC.cloud[1]), pa = t - TC.pop, fy0 = bubFloat(t), end = [BUB.x - BUB.rx * .74, BUB.y + BUB.ry * .66 + fy0 * .5];
    boilSeed('v2 thought trail');
    [[.16, 14], [.44, 22], [.74, 31]].forEach(([f, r], i) => {
      const a = t - (TC.think + .06 + i * .1); if (a < 0) return;
      const gone = pa > 0 ? seg(pa, (2 - i) * .04, (2 - i) * .04 + .12) : 0; if (gone >= 1) return;
      const s = backOut(clamp(a / .16)) * (1 - gone), px = lerp(fx, end[0], f), py = lerp(fy, end[1], f) - 22 * Math.sin(Math.PI * f);
      piece(oval(px, py, r * s, r * .86 * s, 0, 20), '#FBF8F2', { sw: 1.2, key: 'v2tp' + i, lift: 4 });
    });
    if (k <= 0) return;
    boilSeed('v2 thought');
    if (pa > .07) {   // popped: the cloud's puffs flung outwards, shrinking, drifting up
      const b = seg(pa, .07, .42); if (b >= 1) return;
      for (let i = 0; i < 11; i++) {
        const a = i / 11 * TAU + .25, d = .75 + .35 * easeOut(b), r = (34 + 22 * hash(i * 3.1)) * (1 - easeIn(b));
        if (r > 2) piece(oval(BUB.x - 30 + Math.cos(a) * BUB.rx * .9 * d, BUB.y + fy0 * .5 + Math.sin(a) * BUB.ry * d - 60 * b, r, r * .86, 0, 16), '#FBF8F2', { sw: 1.2 * (1 - b * .6), key: 'v2tb' + i, lift: 3 });
      }
      return;
    }
    // (the cloud swells from the trail's end; while it's up the whole of it floats: fly on top of the swell)
    const fly = fy0 * .5, sc = backOut(k) * (pa > 0 ? 1 + .1 * easeOut(pa / .07) : 1), S = P => P.map(([x, y]) => [end[0] + (x - end[0]) * sc, end[1] + (y - end[1]) * sc + fly]);
    const outer = S(cloudPts(BUB.x, BUB.y, BUB.rx, BUB.ry)), inner = S(cloudPts(BUB.x, BUB.y + 4, BUB.rx * .9, BUB.ry * .86));
    piece(outer, '#FBF8F2', { sw: 1.6, key: 'v2tcloud', lift: 8 });
    piece(inner, '#E6ECF6', { ink: null, key: 'v2tback', lift: 0, flatCard: true, edge: false });
    if (k > .5) v2Clip(inner.map(p => toScreen(p[0], p[1])), () => { push(); translate(end[0], end[1] + fly); scale(sc); translate(-end[0], -end[1]); imagined(t, tt); pop(); });
  }
  function sceneC(t) {
    look('card');
    const tt = mt(t), lt = tt - CUT.c, k = seg(t, CUT.c, CUT.d);
    const up = ease(seg(t, TC.think - .1, TC.cloud[1] + .1));   // tilting up a touch to make room for the thought
    camBegin(lerp(1280, 1290, k) + 34 * up, lerp(588, 582, k) - 46 * up, lerp(.96, .99, k));
    v2Platform(tt);
    carLight(t);
    // Clawd: turns to him and nods along ("I hear you"), a paw out to him; looks off and up, the thought; hoping; its face
    // falls at the ✗; turns back to him, sorry; a sad little wave
    const cu = BX.clawd[2], [x0, cy] = BX.out;
    // (the ✗: dread, the blue gloom over it. It turns back to him teary with the dread still on it, and it carries over
    // the cut into D, lifting there (the user: a flash of dread before the cut was too brief to read))
    const ce = emotions(tt, [[CUT.c, 'surprised', { emote: null }], [TC.back, 'relieved', { emote: null, eyes: 'closed', mouth: 'smile' }], [TC.say, 'relieved', { emote: null, eyes: 'normal', mouth: 'smile' }], [TC.look, 'hopeful', { emote: null }], [TC.fall, 'sad', { emote: null }], [TC.turnBack, 'sad', { eyes: 'teary', mouth: 'wobble', emote: null }]], { take: .6 });
    const nod = t > TC.nod && t < TC.think ? Math.max(0, Math.sin(bpOf(tt) * TAU)) : 0;
    const away = t > TC.look && t < TC.turnBack;   // turned off to the right, into its thought
    // the wave: the same arm and swing as on D's balcony (the cut is on it): its near arm, on its own clock
    const wv = Math.sin((tt - CUT.d) * TAU * 1.25 + .6), wk = ease(seg(tt, TC.wave - .06, TC.wave + .12));
    const cl = clawd2(x0, cy, cu, { ...ce, view: 'q', flip: !away, dy: (ce.dy || 0) + .25 * nod, rot: (ce.rot || 0) - .06 * nod, lookX: away ? .45 : -.7, lookY: away ? -.9 : 0, mouth: clawdLip(tt, ce.mouth),
      aR: wk > 0 ? lerp(ce.aR, -.55, wk) : t > TC.nod && t < TC.look ? .7 : ce.aR, aL: wk > 0 ? lerp(t < TC.turnBack ? -.6 : ce.aL, 1.42 + .38 * wv, wk) : t > TC.fall && t < TC.turnBack ? -.6 : ce.aL, boilKey: 'v2cl', t: tt });
    // him at the terminal, 3/4, waiting on the other side of the rope: hopeful as it nods to him; waits on it; takes the bad
    // news, his hand off the terminal
    const he = emotions(tt, [[CUT.c, 'confused', { emote: null }], [TC.nod + .1, 'hopeful', { emote: null }], [TC.hurt, 'sad', { emote: null }]], { take: .6 });
    const off = ease(seg(t, TC.hurt, TC.hurt + .3));
    himStand(tt, BX.stand[0], 'q', { ...he, lookX: .7, lookY: t > TC.hurt ? .45 : .3 }, { L: [-1.1, 3, .06, 'relax'], R: [...hsu(lerp(930, 880, off), lerp(780, 820, off)), .4, 'relax', 1, lerp(.6, 1.2, off), 'u'] }, { sing: false });   // (he narrates this line: mouth shut)
    barrier(tt, { term: t >= TC.x ? 'x' : 'lock', cardIn: 1 });
    const hd = cl && cl.top ? cl.top : [x0, cy - cu * 8];
    thought(t, tt, hd[0] + 26, hd[1] - 24);
    camEnd();
  }

  // ---------- D: "I've never felt so seen by something leaving me behind." ----------
  // (the car pulls out on "so seen" and is gone by "leaving". Then his attention moves, visibly: the head drops, eyes to
  // the floor; they come up and land on the poster (the camera pushes in on him and the poster); he rolls his eyes on
  // "behind" and holds, unimpressed; the copier's bar wipes right to left, so he's the last thing it takes)
  const TD = { go: 100.95, gone: 102.2, down: 102.22, look: 102.46, roll: 102.86, rolled: 103.16 };
  const PL = { wall: '#DCD2BE', wallDk: '#B9AE98', grout: '#8C8474', band: '#2F5E8C', floor: '#5E5A56', edge: '#E8C23A', pit: '#1C1A20', rail: '#6A6470', sleeper: '#2E2A30' };
  const CAR = { body: '#5E1A2E', bodyDk: '#3E0F1E', bodyLt: '#86304A', gold: '#D6A444', goldDk: '#98691F', roof: '#2A2230', win: '#F4D9A0', curtain: '#8E1F35', bogie: '#2A2630', carpet: '#A82A3C' };

  // ---- D: the same axis as A-C, the car on the near track ----
  // The camera still faces the bench wall. The premium observation car stands on the near track, between us and the
  // platform (where the intro's train came in), and runs left to right: in from the left (C: its windows' light slides
  // in from the left and brakes), out to the right, away from him. One geography: the bench, the rope and its terminal
  // stay where they were, and the one poster, the intro's, is on the wall behind the car. The open rear balcony stops
  // just right of the terminal, near mid-frame, so he's on the platform past its rear end, never behind it.
  //   100.30  cut on the wave: Clawd on the balcony, facing him, sorry, waving; the last premium passengers file in
  //           along the lit windows to their places; he draws his declined card back out of the terminal
  //   100.95  the car pulls out (a jolt, then away), Clawd waving back at him; he trails a few steps after it to the
  //           yellow line, the camera drifting right with them; the car's clear of the frame by about 102.0
  //   102.22  alone at the edge, the poster up behind him: his head drops (to the floor)
  //   102.46  his eyes come up to the poster, the camera pushing in on the two of them; he takes it in
  //   102.86  the eye roll (up and over), 103.16 unimpressed; the copier's bar (E) takes the frame from 103.28
  // The staging's px (world, like A-C's): the car's deck (floor) line, its balcony's rail (outer end) at rest, the
  // balcony's depth; its windows' centres from the balcony's end wall (C's light pools rest on them, DF_LIGHT)
  const DF = { deck: 1140, rail0: 1290, bal: 400, eave: 150, roof: -80, cu: 33, win: { x: 290, w: 380, gap: 520, y0: 850, y1: 300 }, door: [30, 210],
    him: { x0: BX.stand[0], y0: BX.stand[1], x1: 1340, y1: 1040, u: BX.stand[2] } };
  const DF_LIGHT = [DF.rail0 + DF.bal + (DF.door[0] + DF.door[1]) / 2, ...[0, 1, 2, 3].map(i => DF.rail0 + DF.bal + DF.win.x + DF.win.w / 2 + i * DF.win.gap)];
  const DT = { pull: [100.45, 100.6, 100.78, 101.0], walk: [101.1, 101.98], shot: [101.0, 102.15], push: [TD.look, TD.look + .55] };
  const DREAD_OFF = 100.8;   // (Clawd's dread from C lifts in D: see premiumCar's Clawd)
  // the car's rail x at (stepped) time t: at rest, a jolt as the couplings take up, then away to the right, accelerating
  const dfCarX = t => { const a = t - TD.go; return DF.rail0 + (a > 0 ? 2600 * Math.pow(seg(t, TD.go, TD.gone), 2.1) - 10 * Math.sin(a * 26) * Math.exp(-a * 7) : 0); };
  // the camera: wide at the cut (the car's balcony at mid-frame, him past its rear end); a drift right with the car and
  // him as it pulls out, finding the poster; the push in on him and the poster when his eyes find it; all on ones
  function dfCam(t) {
    const C0 = [1340, 690, .8], C0b = [1354, 686, .81], C1 = [1660, 622, .86], C2 = [1966, 488, 1.04], C3 = [1976, 482, 1.065];   // (C2, C3: the poster whole, the terminal just out at the left)
    let c = camMix(C0, C0b, seg(t, CUT.d, DT.shot[0]));
    c = camMix(c, C1, ease(seg(t, DT.shot[0], DT.shot[1])));
    c = camMix(c, C2, ease(seg(t, DT.push[0], DT.push[1])));
    return camMix(c, C3, seg(t, DT.push[1], TE.bar[1]));
  }
  // his ground point and walk phase at (stepped) time t: at the terminal, then a few steps after the car, to the yellow line
  function dfHim(t) {
    const H0 = DF.him, k = seg(t, DT.walk[0], DT.walk[1]), e = k < 1 ? (k < .5 ? 2 * k * k : 1 - 2 * (1 - k) * (1 - k)) : 1;
    const x = lerp(H0.x0, H0.x1, e), y = lerp(H0.y0, H0.y1, e);
    return { x, y, u: H0.u, walk: k > 0 && k < 1 ? Math.hypot(x - H0.x0, y - H0.y0) / HIM_CYCLE(H0.u) : null };   // (feet planted: HIM_CYCLE)
  }
  // the near track: the pit below the platform's edge, sleepers and the two rails the car runs on
  function dfTrack() {
    boilSeed('v2 df track');
    piece(R4(-700, 1098, 3600, 1800), PL.pit, { ink: null, key: 'v2dfpit', lift: 0, edge: false });
    for (let i = 0; i < 34; i++) inl(R4(-640 + i * 128, 1352, -560 + i * 128, 1392), PL.sleeper, 'v2dfsl' + i);
    for (const y of [1318, 1368]) piece(R4(-700, y, 3600, y + 12), PL.rail, { ink: null, key: 'v2dfrail' + y, lift: 1, flatCard: true });
  }
  // the premium passengers (demo/cast/crowd.js silhouettes, dark against the warm windows), in the car's px: [window,
  // where they stop in it (0..1), u, seed, facing, build, walking in from the right from (null: already in place)]
  const DF_PAX = [[0, .34, 47, 911, -1, { top: 'coat', head: 'bun', bag: 'none' }, 100.3], [0, .78, 49, 917, -1, { top: 'blazer', head: 'short', bag: 'none' }, null],
    [1, .3, 48, 923, 1, { top: 'dress', head: 'bob', bag: 'none' }, null], [1, .74, 50, 929, -1, { top: 'coat', head: 'bald', bag: 'none' }, 100.42],
    [2, .45, 48, 937, -1, { top: 'blazer', head: 'pony', bag: 'none' }, null], [3, .55, 49, 941, 1, { top: 'coat', head: 'short', bag: 'none' }, null]];
  // The premium observation car, its rear balcony's rail (the outer end) at x, the balcony toward him (left), the body
  // away to the right (off frame); its floor on DF.deck. clawdFn(x, y): Clawd on the balcony, behind its rail.
  function premiumCar(t, x, clawdFn) {
    const fl = DF.deck, ex = x + DF.bal, L = 3400, ey = DF.eave, W0 = DF.win;
    boilSeed('v2 df car');
    // the running gear: bogies and wheels (turning with the car), under the body
    for (const bx of [ex + 420, ex + 2500]) {
      piece(b2RoundPoly(R4(bx - 240, fl + 70, bx + 240, fl + 150), 18), CAR.bogie, { sw: 1.4, key: 'v2dfbog' + (bx - ex), lift: 4 });
      for (const wx of [-140, 140]) {
        const cx = bx + wx, cy = fl + 196, a = (x - DF.rail0) / 72;
        piece(oval(cx, cy, 72, 72, 0, 28), '#3E3A44', { sw: 1.4, key: 'v2dfwh' + (bx - ex) + wx, lift: 4 });
        for (let s = 0; s < 3; s++) dline([[cx + Math.cos(a + s * 2.09) * 60, cy + Math.sin(a + s * 2.09) * 60], [cx - Math.cos(a + s * 2.09) * 60, cy - Math.sin(a + s * 2.09) * 60]], 1.4, '#1A181E');
        piece(oval(cx, cy, 16, 16, 0, 12), CAR.gold, { ink: null, key: 'v2dfhub' + (bx - ex) + wx, lift: 1, flatCard: true });
      }
    }
    // the body: from the balcony's end wall away to the right; the underframe; the roof (above the frame at the cut)
    piece(R4(ex, ey, ex + L, fl + 40), CAR.body, { sw: 1.9, shade: CAR.bodyDk, depth: 40, key: 'v2dfbody', lift: 6 });
    inl(R4(ex, fl + 40, ex + L, fl + 84), CAR.bogie, 'v2dfsole');
    piece(b2RoundPoly(R4(x - 40, DF.roof, ex + L, ey + 22), [150, 0, 0, 10]), CAR.roof, { sw: 1.7, shade: '#1E1826', depth: 18, key: 'v2dfroof', lift: 5 });
    inl(b2RoundPoly(R4(x + 40, ey - 50, ex + L, ey - 34), [8, 0, 0, 8]), '#4E3E52', 'v2dfroofhl');   // (the curve of the roof catching the platform lights)
    for (const yy of [ey + 52, fl - 290]) inl(R4(ex, yy, ex + L, yy + 12), CAR.gold, 'v2dfstripe' + yy);
    // the end door, off the balcony (lit window, brass handle)
    const [d0, d1] = DF.door;
    piece(b2RoundPoly(R4(ex + d0, fl - 800, ex + d1, fl), [70, 70, 4, 4]), CAR.bodyDk, { sw: 1.4, key: 'v2dfdoor', lift: 2 });
    piece(b2RoundPoly(R4(ex + d0 + 30, fl - 740, ex + d1 - 30, fl - 470), [50, 50, 6, 6]), CAR.win, { sw: 1.1, key: 'v2dfdw', lift: 1, flatCard: true });
    piece(oval(ex + d1 - 26, fl - 380, 9, 9, 0, 10), CAR.gold, { sw: .8, key: 'v2dfknob', lift: 2, flatCard: true });
    // the windows along the side: warm, a chandelier, the passengers, the curtains tied back; a gold crest between
    for (let i = 0; i < 4; i++) {
      const wx = ex + W0.x + i * W0.gap, w0 = wx, w1 = wx + W0.w, y0 = fl - W0.y0, y1 = fl - W0.y1;
      const shape = b2RoundPoly(R4(w0, y0, w1, y1), [36, 36, 8, 8]);
      piece(shape, CAR.win, { sw: 1.4, key: 'v2dfw' + i, lift: 2 });
      clipPoly(shape, () => {
        dline([[wx + W0.w / 2, y0], [wx + W0.w / 2, y0 + 40]], 1.1, CAR.goldDk);
        piece(curvy([[wx + W0.w / 2 - 40, y0 + 40], [wx + W0.w / 2 + 40, y0 + 40], [wx + W0.w / 2 + 22, y0 + 66], [wx + W0.w / 2 - 22, y0 + 66]], 2), '#F8E6B0', { sw: .9, key: 'v2dfch' + i, lift: 1, flatCard: true });
        glow(wx + W0.w / 2, y0 + 70, 170, '#FFD890', .5);
        for (const [wi, f, u, seed, dir, build, t0] of DF_PAX) {
          if (wi !== i) continue;
          const px = lerp(w0, w1, f), walkIn = t0 != null ? seg(t, t0, t0 + .5) : 1, X = px + 300 * (1 - easeOut(walkIn));
          crowdFig(X, fl - 6, u, { t, seed, view: 'side', dir: walkIn < 1 ? -1 : dir, build, walk: walkIn > 0 && walkIn < 1 ? (X - px) / (7 * u) : null, phone: 0, col: '#5A4250', lift: 2, cull: false, key: 'v2dfpax' + seed });
        }
      });
      for (const s of [0, 1]) piece(curvy(s ? [[w1, y0 + 4], [w1 - 60, y0 + 4], [w1 - 38, y0 + 170], [w1 - 4, y1 - 4]] : [[w0, y0 + 4], [w0 + 60, y0 + 4], [w0 + 38, y0 + 170], [w0 + 4, y1 - 4]], 3), CAR.curtain, { sw: 1, key: 'v2dfcu' + i + s, lift: 1, flatCard: true });
      piece(starPts(w1 + (W0.gap - W0.w) / 2, fl - 170, 28, .5, 5), CAR.gold, { sw: .9, key: 'v2dfcrest' + i, lift: 2, flatCard: true });
    }
    // the balcony: its deck (a red carpet), the canopy under the roof's end with its valance and tassels, the pillars;
    // Clawd; the side rail in front, the tail lamp on the end post
    piece(R4(x - 24, fl - 10, ex + 4, fl + 40), CAR.bodyDk, { sw: 1.5, key: 'v2dfdeck', lift: 4 });
    inl(R4(x - 14, fl - 10, ex, fl + 2), CAR.carpet, 'v2dfcarpet');
    inl(R4(x - 36, ey + 20, ex, ey + 34), CAR.gold, 'v2dfval');
    for (let i = 0; i < 7; i++) piece(oval(lerp(x - 26, ex - 8, i / 6), ey + 48, 11, 13, 0, 12), CAR.gold, { sw: .8, key: 'v2dftas' + i, lift: 2, flatCard: true });
    for (const px of [x - 6, ex - 10]) piece(ribbon([[px, ey + 34], [px, fl - 10]], 13, 13), CAR.gold, { sw: 1, shade: CAR.goldDk, depth: 4, key: 'v2dfpil' + px, lift: 3 });
    if (clawdFn) clawdFn(x + 205, fl - 4);
    boilSeed('v2 df rail');
    piece(ribbon([[x - 22, fl - 100], [ex + 2, fl - 100]], 12, 12), CAR.gold, { sw: 1.1, shade: CAR.goldDk, depth: 4, key: 'v2dfrt', lift: 4 });
    for (let i = 0; i <= 9; i++) { const rx = lerp(x - 12, ex - 8, i / 9); piece(ribbon([[rx, fl - 95], [rx, fl - 10]], 6, 6), CAR.gold, { sw: .8, key: 'v2dfrb' + i, lift: 3, flatCard: true }); }
    // (the tail lamp on the end post (x - 6), in a dark housing on the post's face: at x - 30 it hung in the air a
    // post's width off it)
    piece(oval(x - 6, fl - 150, 16, 21, 0, 16), CAR.bodyDk, { sw: 1, key: 'v2dftailh', lift: 3, flatCard: true });
    piece(oval(x - 6, fl - 150, 11, 15, 0, 16), '#E8303A', { sw: .9, key: 'v2dftail', lift: 2, flatCard: true });
    glow(x - 6, fl - 150, 60, '#FF4A3A', .55);
  }
  function sceneD(t) {
    look('card');
    const tt = mt(t), go = seg(t, TD.go, TD.gone), bx = dfCarX(tt), c = dfCam(t);
    const shake = t > TD.go && go < 1 ? shakeXY(t, 2.2 * (1 - go)) : [0, 0];   // (the rumble as it pulls out: on ones, like the camera)
    camBegin(c[0] + shake[0], c[1] + shake[1], c[2]);
    v2Platform(tt, { alone: true });
    dfTrack();
    // him: sorry, at the terminal, watching Clawd; he draws his declined card back out of the slot; the car goes: he trails
    // a few steps after it to the yellow line, the card in his hand; watches it out; the head drops; up to the poster; the
    // roll (up and over, lids low); then unimpressed at it
    const P = dfHim(tt), hs = HIM_C.body.hand * P.u, slot = termSlot();
    const in0 = [slot[0] - hs * 1.33, slot[1]], [p0, p1, p2, p3] = DT.pull;   // (the wrist where the held card lines up with the one in the slot)
    const reach = ease(seg(tt, p0, p1)), out = ease(seg(tt, p1, p2)), drop = ease(seg(tt, p2, p3)), held = tt >= p1;   // (the puppet on twos: tt)
    // (side: the card hand hangs at his side like his other one, just out from under the shoulder, the elbow a little bent
    // out: the user, it hung in across his body, 1.9 u out, at full stretch; SIDE_ANG: along the forearm, the wrist straight)
    const side = [P.x + 3.2 * P.u, P.y - 4.0 * P.u], wr0 = [880, 820], SIDE_ANG = 1.47;   // (where C left it: wr0)
    let W1 = reach < 1 ? [lerp(wr0[0], in0[0], reach), lerp(wr0[1], in0[1], reach)] : [lerp(in0[0], in0[0] - 90, out), in0[1] + 10 * out];
    if (drop > 0) W1 = [lerp(W1[0], side[0], drop), lerp(W1[1], side[1], drop)];
    const ang = held ? lerp(0, SIDE_ANG, drop) : lerp(1.2, 0, reach);
    // (drawing the card back out and dropping it to his side, his elbow stays down and back, as it was in the slot: with
    // the hand drawn in close to his shoulder the rig's far arm took the elbow's other side, and it flipped up over his
    // shoulder, a chicken wing, for two drawings; bend < 0 keeps it under)
    const pullBack = held && tt >= p1 + .1 && tt < p3;
    const pose = { L: [-1.1, 3, .06, 'relax'], R: [(W1[0] - P.x) / P.u, (W1[1] - P.y) / P.u, pullBack ? -.35 : .35, held || reach > .6 ? 'hold' : 'relax', 1, ang, 'u'] };   // (the other arm hangs: a dejected trail, no swing)
    const he = emotions(tt, [[CUT.d, 'sad', { emote: null }], [TD.look, 'neutral', { emote: null, eyes: 'wide' }], [TD.look + .3, 'neutral', { emote: null }], [TD.rolled, 'bored', { emote: null, mouth: 'flat' }]], { take: .4 });
    // his eyes: on Clawd (down and right, on the balcony), after the car as it goes, ahead of him as he follows it, out
    // with it → down at the floor → up at the poster (up and right) → the roll (up and over) → away, bored
    const dn = ease(seg(tt, TD.down, TD.down + .16)) * (1 - ease(seg(tt, TD.look, TD.look + .14))), up = ease(seg(tt, TD.look, TD.look + .16));
    const rl = seg(tt, TD.roll, TD.rolled), rr = Math.sin(Math.PI * rl), aft = ease(seg(tt, TD.rolled, TD.rolled + .2));
    let lkX = lerp(.75, 1, seg(tt, TD.go, TD.gone)), lkY = lerp(.45, .05, ease(seg(tt, TD.go, DT.walk[1])));
    if (tt >= TD.down) { lkX = lerp(lkX, .25, dn); lkY = lerp(lkY, .85, dn); }
    if (tt >= TD.look) { lkX = lerp(.25, .9, up); lkY = lerp(.85, -.7, up); }
    if (tt >= TD.roll) { lkX = lerp(.9, -.35, rr); lkY = lerp(-.7, -1, rr); }
    if (tt >= TD.rolled) { lkX = lerp(-.35, .2, aft); lkY = lerp(-1, .25, aft); }
    const heOpts = { ...he, view: 'q', pose, lookX: lkX, lookY: lkY, squint: .45 * Math.min(1, rr * 1.6), tilt: .09 * dn - .07 * up * (1 - aft) - .05 * rr, walk: P.walk, boilKey: 'v2himS', hold: held ? v2HoldCard : undefined };   // (C's puppet: the same cut pieces)
    const heDraw = () => person(P.x, P.y, P.u, HIM_C, heOpts);
    const front = tt >= DT.pull[3];   // (at the terminal, behind its post, as in C; off it once his hand's back at his side)
    if (!front) heDraw();
    barrier(tt, { term: 'x', cardIn: held ? 0 : 1 });
    if (front) heDraw();
    // the car, in front of all of it: Clawd on its balcony, sorry, waving to him
    if (bx < c[0] + W / 2 / c[2] + 120) premiumCar(tt, bx, (cx, cy) => {
      // (C's dread, the blue gloom, still on it at the cut: it lifts from DREAD_OFF, over .3 s, as the car's about to go; a
      // little gloom stays as it's taken away)
      const ce = emotions(tt, [[CUT.d - .3, 'sad', { eyes: 'teary', mouth: 'wobble', emote: null }], [DREAD_OFF, 'sad', { eyes: 'teary', mouth: 'wobble', emote: null, gloom: .15, tint: null }]], { take: .4 });
      // (the wave: its near arm raised, wagging slowly, on its own clock; the rig's 'wave' raises the far arm, which
      // from here stays behind the body: a stub)
      const wv = Math.sin((tt - CUT.d) * TAU * 1.25 + .6);
      clawd2(cx, cy, DF.cu, { ...ce, view: 'q', flip: true, aL: 1.42 + .38 * wv, aR: -.55, rot: -.05 + .015 * wv, lookX: -.8, lookY: .15, boilKey: 'v2cl', t: tt });
    });
    camEnd();
  }

  // ================================================================================================================
  // E + F: the riso turbine street (sets/copies.js taken apart and re-timed to the song)
  // ================================================================================================================
  // The street's own clock: copies' beat clock (cpBp) counts the song's beats from bar 57, so its warning lights, puffs
  // and stack fires land on the real beats; everything the verse times (roars, windows, acting) is in song time.
  const TE0 = 102.74, stOf = t => (bpOf(t) - bpOf(TE0)) * CP.B;
  const TE = {
    bar: [103.28, 103.62],                     // in: the copier's light bar sweeps across the platform (after his eye roll)
    whoah: 103.64,                             // "Whoah": the stacks cough, he starts awake
    up: [103.86, 104.06], puff: 104.5,         // "Elon's cloud has a tailpipe": a crash zoom up to Grok at work
    coughs: [103.64, 105.38, 105.8],           // the build ("Hear the gas turbines")
    roars: [106.28, 107.10, 107.96, 108.84, 109.74, 110.62, 111.50, 112.38, 113.26, 115.0, 115.88],   // "roar" first
    clamp: [106.6, 106.96],                    // the pillow over his ears
    lights: [111.94, 109.30, 112.38, 112.82, 113.26, 113.70],   // copies' six windows (1 = next door, on "next door")
    taps: [107.46, 107.62], slap: 107.96, shrug: [108.1, 108.3],   // the inspector taps the empty permit frame; the permit's slapped in
    whip: [108.42, 108.68],                    // a whip pan from the gate back down the street to his window, on the beat
    fumes: 108.84, cough: [109.05, 109.5, 110.0],   // "plenty of exhaust next door": it rolls in through his window
    dnd: { out: [113.62, 113.95], jab: [114.15, 114.37, 114.55], tap: [114.84, 115.2], back: [115.46, 115.76] },   // jabs on "do", "not", "disturb"; taps fire the moon
    glare: 115.6,                              // he gives up and stares at us
    out: [115.98, 116.92],                     // the last roar's exhaust rolls in and covers the frame
  };
  // The shots of E and F (no two cuts closer than .6 s (the window, before the gate); the light bar and the exhaust are the section's handoffs):
  //   wide    103.05  the street, "Whoah"; a crash zoom up to Grok, ticking off requests, its tailpipe puffing on the beat
  //   stacks  105.20  "Hear the gas turbines roar": a low angle up the stacks, the first roar on "roar"
  //   win     106.50  his window: the pillow over his ears, the casements rattling
  //   gate    107.10  "No proper permits": on the roar, the plant roaring; down to its gate, where a council inspector taps the
  //                   empty permit frame with his pen ("permits", twice) and looks up at the stacks; on the next roar a suit's
  //                   hand comes out of a hatch in the gate and slaps a fresh permit into the frame (run first, permit later);
  //                   he looks at it, and shrugs to us on "plenty"
  //   house   108.42  "plenty of exhaust next door": a whip pan to his window; the fumes roll in; his washing greys, his plant droops
  //   grok    110.40  "The machines don't need to sleep": Grok bright-eyed at its queue, the status lights chasing
  //   trio    111.50  on "sleep" (a roar): the terrace opposite, dark; "The people round them do": its windows light up, one a beat
  //   dnd     113.50  "Where's the do-not-disturb": his POV, a close insert over his sill: his phone comes up big, the screen
  //                   wakes on a control centre, his thumb shoves the moon toggle ON on "do" and re-presses it, harder, on
  //                   "not" and "disturb" (on! ON! ON!); on the cut the phone starts up and away
  //   ots     114.60  over his shoulder: arm out, the phone pointed at the stacks like a remote; each tap fires the moon at
  //                   them: the first is snuffed by the roar and blown back, the second fizzles sooner; both drop like duds.
  //                   Grok works on at its queue, oblivious
  //   end     115.44  his arm up with the phone (its back to us), lowered: he gives up; the last roar; its exhaust prints black
  const ESHOTS = [[103.05, 'wide'], [105.20, 'stacks'], [106.50, 'win'], [107.10, 'gate'], [108.42, 'house'], [110.40, 'grok'], [111.50, 'trio'], [113.50, 'dnd'], [114.60, 'ots'], [115.44, 'end']];
  const eShot = t => { let s = ESHOTS[0]; for (const e of ESHOTS) if (t >= e[0]) s = e; return s; };
  const BIG = 115.88;
  // the roar state at t: { k (this blast), on, pre, age, n, gen (copies so far), shake }
  function v2Roar(t) {
    let n = -1; for (let i = 0; i < TE.roars.length; i++) if (t >= TE.roars[i]) n = i;
    let c = -1; for (let i = 0; i < TE.coughs.length; i++) if (t >= TE.coughs[i]) c = i;
    const gen = Math.min(8, n + 1);
    if (c >= 0 && (n < 0 || TE.coughs[c] > TE.roars[n])) { const a = t - TE.coughs[c]; return { k: .45 * Math.exp(-a * 5), on: false, pre: true, age: a, n: 4, gen, shake: .4 * Math.exp(-a * 9) }; }
    if (n < 0) return { k: 0, on: false, pre: false, age: 9, n: 4, gen: 0, shake: 0 };
    const tr = TE.roars[n], a = t - tr, big = tr === BIG ? 1.5 : n === 0 ? 1.2 : 1;
    return { k: big * Math.exp(-a * (big > 1.3 ? 2.2 : 5)), on: true, pre: false, age: a, n: 5 + n, gen, shake: big * Math.exp(-a * (big > 1.3 ? 4 : 9)), big };
  }
  // the gate's close-up: where the crash in lands, and where its slow push ends (the whip to his window starts there)
  const GATE_CAM = [[1432, 590, 3.45], [1436, 588, 3.6]];
  // the camera for the shots drawn on the street's world: [cx, cy, zoom]
  function streetCam(t) {
    const [t0, s] = eShot(t), k = seg(t, t0, ESHOTS[ESHOTS.findIndex(e => e[0] === t0) + 1]?.[0] ?? CUT.g);
    const mixc = (A, B, q) => A.map((v, i) => lerp(v, B[i], q));
    if (s === 'wide') {   // the crash zoom: fast, then a push in on the pile and the tailpipe, kicked on "tailpipe"
      const S0 = [985, 347, .92], G = [1395, -82, 2.3], q = seg(t, TE.up[0], TE.up[1]);
      const c = mixc(mixc(S0, G, q < 1 ? easeIn(q) * .35 + ease(q) * .65 : 1), [1382, -94, 2.8], ease(seg(t, TE.up[1] + .05, 105.2)));
      if (t > TE.puff) c[2] *= 1 + .045 * Math.exp(-(t - TE.puff) * 9);
      return c;
    }
    if (s === 'win') return mixc([560, 505, 1.38], [560, 500, 1.46], ease(k));
    if (s === 'gate') {   // on the roar: the plant roaring (its stacks' fire, the smoke over it, Grok), then a crash in to its gate
      const Wd = [1500, 30, 1.2], C0 = GATE_CAM[0], q = seg(t, 107.2, 107.42), e = q < 1 ? easeIn(q) * .35 + ease(q) * .65 : 1;
      return e < 1 ? [lerp(Wd[0], C0[0], e), lerp(Wd[1], C0[1], e), Math.exp(lerp(Math.log(Wd[2]), Math.log(C0[2]), e))] : mixc(C0, GATE_CAM[1], seg(t, 107.42, 108.42));
    }
    if (s === 'house') {   // the whip: out of the gate's close-up (its last framing) and down the street to his window
      const base = mixc([470, 470, 1.25], [520, 480, 1.34], ease(seg(t, TE.whip[1], 110.4))), w = seg(t, TE.whip[0], TE.whip[1]);
      if (w >= 1) return base;
      const G = GATE_CAM[1], q = w < .5 ? 4 * w * w * w : 1 - Math.pow(-2 * w + 2, 3) / 2;
      return [lerp(G[0], base[0], q), lerp(G[1], base[1], q), Math.exp(lerp(Math.log(G[2]), Math.log(base[2]), q))];
    }
    if (s === 'grok') return mixc([1395, -70, 1.9], [1405, -80, 2.08], ease(k));
    if (s === 'dnd') return mixc([1450, 420, 1.2], [1450, 410, 1.22], ease(k));   // (the view from his window, hazed behind the phone insert)
    return mixc([960, 350, 1.02], [940, 340, .96], ease(seg(t, 115.44, 116.2)));   // end
  }
  // his phone from the street (hand space, along the hand), held out at the plant with its screen to him: we see its back
  // (a dark slab, a camera lens) and the lit screen's glow round its edge; his fingers wrap its back, as they would
  const v2PhoneBack = s => {
    const L = s * 2.0, w = s * 1.0;
    piece(b2RoundPoly(R4(-s * .26, -w / 2 - s * .07, L + s * .02, w / 2 + s * .07), s * .22), '#FFF3B8', { ink: null, key: 'v2pbg', spot: null });
    piece(b2RoundPoly(R4(-s * .2, -w / 2, L - s * .04, w / 2), s * .18), '#262634', { sw: 1.1, key: 'v2pb', lift: 3 });
    piece(oval(L - s * .42, -w * .2, s * .13, s * .13, 0, 12), '#5A5E78', { sw: .7, key: 'v2pbl' });
  };
  // Him at his window (copies' cpHim, re-acted): bleary; "Whoah"; up at the plant; the roar's take; the pillow clamped
  // over his ears, squeezed on every blast; (end) his arm out at the plant with the phone, lowered; the dead-eyed stare
  function streetHim(t, R) {
    const [x, y, u] = CP.him, P = CP_HIM, sw = clamp(u / 20, .55, 2.2), tt = t;
    const mood = emotions(tt, [
      [102.5, 'sleepy', { emote: null }],
      [TE.whoah, 'surprised', { emote: null }],
      [TE.up[0] + .1, 'nervous', { emote: null }],
      [TE.roars[0] + .06, 'surprised', { emote: null }],
      [TE.clamp[1] - .02, 'angry', { emote: null, eyes: 'squeeze', mouth: 'teeth' }],
      [TE.fumes + .12, 'disgusted', { emote: null, eyes: 'squeeze', mouth: 'open' }],   // coughing on the fumes
      [110.3, 'angry', { emote: null, eyes: 'squeeze', mouth: 'teeth' }],
      [TE.dnd.out[0] + .05, 'determined', { emote: null }],
      [TE.dnd.back[0], 'sad', { emote: null }],
      [TE.glare, 'bored', { emote: null }],
    ], { take: .8 });
    const looking = t >= TE.whoah && t < TE.glare;
    mood.lookX = t < TE.whoah ? .1 + .1 * Math.sin(t * 1.3) : looking ? .85 : 0;
    mood.lookY = t < TE.whoah ? .35 : t < 105.2 ? -.8 : looking ? -.5 : .05;
    const hack = TE.cough.reduce((m, c) => Math.max(m, t >= c ? Math.exp(-(t - c) * 7) : 0), 0);   // each cough jerks him forward
    if (t > TE.fumes) { mood.dy = (mood.dy || 0) + .25 * hack; mood.rot = (mood.rot || 0) + .05 * hack; }
    if (t < TE.whoah) { mood.rot = .035 * Math.sin(t * 1.9); mood.dy = (mood.dy || 0) + .08 * Math.sin(t * 3.8); }
    mood.dy = Math.max(mood.dy || 0, -.35); mood.sq = Math.max(mood.sq || 0, -.06);
    if (Math.abs(mood.dx || 0) > 0) mood.dx *= .5;
    const clampK = ease(seg(t, TE.clamp[0], TE.clamp[1])), sqz = clampK > .9 && R.on ? Math.min(1, R.k) : 0;
    // the do-not-disturb (seen here in the end shot): his arm out at the plant with the phone (as the OTS left it), then
    // lowered back to the pillow; he's given up
    const dOut = ease(seg(t, TE.dnd.out[0], TE.dnd.out[1])) * (1 - ease(seg(t, TE.dnd.back[0], TE.dnd.back[1])));
    const hugA = { L: [-1.55, -6.95, .5, -.25], R: [1.6, -6.9, .5, -Math.PI + .25] };
    const clA = { L: [-4.0 + .3 * sqz, -9.9, .6, -Math.PI / 2 + .22], R: [4.0 - .3 * sqz, -9.9, .6, -Math.PI / 2 - .22] };
    const phA = [3.0, -10.9, .1, -1.0];   // up at the plant (kept inside the window opening: the wall is drawn over him)
    const spec = s => {
      const a = s < 0 ? hugA.L : hugA.R, b = s < 0 ? clA.L : clA.R;
      let v = [lerp(a[0], b[0], clampK), lerp(a[1], b[1], clampK) - 1.2 * 4 * clampK * (1 - clampK), lerp(a[2], b[2], clampK), lerp(a[3], b[3], clampK)];
      if (s > 0 && dOut > 0) v = v.map((q, i) => lerp(q, phA[i], dOut));
      return v;
    };
    const o = { ...mood, view: 'front', pose: { L: [...spec(-1).slice(0, 3), 'none', 1, null, 'u'], R: [...spec(1).slice(0, 3), 'none', 1, null, 'u'] }, legs: false, noShadow: true, boilKey: 'cphim', seed: 2, col: CP_PJ.riso, idle: 0 };   // (no idle life: the bags, pillow and hands are drawn over the rig)
    o.tilt = (clampK > .9 ? .05 * sqz : 0) + (t >= TE.glare ? -.05 * ease(seg(t, TE.glare, TE.glare + .5)) : 0) + (dOut > .5 ? .06 : 0);
    person(x, y, u, P, o);
    const Fr = personFrame(P, o), sq = ((o.sq || 0) + (o.take || 0)) * .5, b = P.body, shX = P.top.sh[0], aw = b.armW;
    const skin = P.col.skin;
    push(); translate(x + (o.dx || 0) * u, y + (o.dy || 0) * 1.1 * u); if (o.rot) rotate(o.rot); scale(1 + sq * .5, 1 - sq);
    const hx = clamp(o.lookX || 0, -1, 1) * .1, headRot = (o.tilt || 0) + (o.rot || 0) * -.4, pv = [hx * u, (Fr.yc - .3) * u];
    push(); translate(...pv); rotate(headRot); translate(-pv[0], -pv[1]);
    boilSeed('cp bags');
    const eyeY = Fr.hy + P.face.eyeY * P.head.h / 2, ew = P.face.eye * P.head.w;
    for (const s of [-1, 1]) { const ex = hx + s * P.face.gap * P.head.w; dline(U([[ex - ew * .42, eyeY + ew * .5], [ex, eyeY + ew * .72], [ex + ew * .42, eyeY + ew * .5]], u), sw * .7, '#2A1A14', .5); }
    pop();
    boilSeed('cp pillow');
    push(); translate(...pv); rotate(headRot * clampK); translate(-pv[0] + hx * u * clampK, -pv[1]);
    const pl = cpPillow(clampK, sqz, Fr, u);
    piece(pl.P, '#F4F1EA', { sw: sw * 1.15, shade: '#C8C4BA', depth: .4 * u, key: 'cppillow', spot: null });
    for (const s of [-1, 1]) { dline([pl.at(s * .66, -.7), pl.at(s * .7, -.1), pl.at(s * .66, .6)], sw * .6, NOIR.ink, .5); if (clampK < .5) dline([pl.at(s * .3, -.6), pl.at(s * .36, .4)], sw * .5, NOIR.ink, .5); }
    pop();
    for (const s of [-1, 1]) {
      const sp = spec(s), root = [s * (shX - aw * .42), Fr.ys + Math.max(P.top.sh[1], .15) + aw * .4];
      const A = ppReach(root, [sp[0], sp[1]], b.arm, sp[2], s), tip = A[2], ang = sp[3];
      boilSeed('cp hand' + s);
      const ph = s > 0 && dOut > .15;
      hand((tip[0] + Math.cos(ang) * .08) * u, (tip[1] + Math.sin(ang) * .08) * u, ang, b.hand * 1.12 * u, { pose: ph ? 'hold' : clampK > .5 ? 'open' : 'relax', col: skin, sw, mirror: s < 0, key: 'cph' + s, maxTone: .45, hold: ph ? v2PhoneBack : undefined });
    }
    pop();
  }
  // Grok at work on the plant's cornice, in front of its fan: a queue of glowing request cards piles up at its side (new
  // ones keep dropping on); every two beats it takes the top one, reads it, ticks it (a satisfied little nod: the task
  // done) and sends it off over the rooftops. Its tailpipe puffs as it works: the plant's roar is the cost of the work.
  const GR = { x: 1440, y: -12, u: 24, pile: [1290, -12], b0: bpOf(103.18) };
  function grokCycle(t, per = 2) { const c = (bpOf(t) - GR.b0) / per; return { n: Math.floor(c), f: frac(c) }; }
  const reqCard = (w, key, tick = 0, glowK = 1) => {
    const h = w * .66;
    piece(b2RoundPoly(R4(-w / 2, -h / 2, w / 2, h / 2), w * .08), mixCol('#FFF2A0', '#FFE04A', glowK), { sw: .9, key, lift: 2, spot: null });
    for (let j = 0; j < 3; j++) inl(R4(-w * .34, -h * .22 + j * h * .2, w * (.1 + .2 * hash(j + 3)), -h * .14 + j * h * .2), '#C8A83A', key + 'l' + j);
    if (tick > 0) piece(ribbon([[-w * .2, 0], [-w * .05, h * .22], [w * .28, -h * .28]].map(([x, y]) => [x * tick + 0, y * tick]), w * .1), '#2E9E4A', { ink: null, key: key + 'tk', lift: 1, flatCard: true });
  };
  // bright: "The machines don't need to sleep": wide awake, a card every beat, the status lights chasing along the attic
  const lerpPt = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  function streetGrok(t, bright = false) {
    const { x, y, u } = GR, [pxl, pyl] = GR.pile, per = bright ? 1 : 2, cyc = grokCycle(t, per), f = cyc.f, cw = u * 2.3;
    boilSeed('v2 grok leds');
    for (let i = 0; i < 12; i++) { const lx = 1235 + i * 36, on = bright ? (Math.floor(bpOf(t) * 4) % 12 + 12) % 12 === i || (Math.floor(bpOf(t) * 4) + 6) % 12 === i : frac(bpOf(t) / 2 + i / 12) < .15; piece(oval(lx, 6, 7, 7, 0, 10), on ? '#5CF09A' : '#2A3474', { sw: .7, key: 'v2led' + i, spot: null }); }
    // the pile (a few cards, messy), and the new requests dropping onto it
    boilSeed('v2 grok pile');
    for (let i = 0; i < 9; i++) { push(); translate(pxl + 10 * (hash(i) - .5), pyl - 12 - i * 12); rotate(.12 * (hash(i * 3.3) - .5)); reqCard(cw, 'v2pile' + i, 0, .6 + .4 * hash(i)); pop(); }
    const ar = frac(bpOf(t) - GR.b0), ap = arcPt([pxl - 380, pyl - 360], [pxl, pyl - 120], 90, easeIn(ar));
    push(); translate(...ap); rotate(ar * 5); reqCard(cw * .9, 'v2arrive', 0, 1); pop();
    // Grok: focused on the card, then a satisfied nod as it ticks it
    const keys = []; for (let k = cyc.n - 2; k <= cyc.n + 1; k++) { const t0 = t - (f + cyc.n - k) * per * (60 / 136.7); keys.push([t0, 'neutral', { emote: null, mouth: 'flat', eyes: bright ? 'wide' : 'look' }], [t0 + .9 * (60 / 136.7) * per * .45, 'happy', { emote: null, eyes: bright ? 'shine' : 'happy' }]); }
    keys.sort((a2, b2) => a2[0] - b2[0]);
    const ge = emotions(t, keys, { take: .35 });
    // Its left hand (on the pile's side, screen left) does the work, one card a cycle: it takes
    // the top card off the pile, brings it up to read and ticks it, winds up over its shoulder and throws it overhand
    // out over the rooftops, releasing on the forward swing so the card leaves the way the arm is going (the user: the
    // card flew left while the arm swung up to the right, and it took each card from its other side, away from the pile),
    // follows through, and reaches down to the pile for the next.
    const P0 = [-5.2, -4.3], P1 = [-1.9, -2.6], P2 = [.4, -9.6], P3 = [-5.4, -6.8], REL = .72;   // (P1: read below its face; P2: wound up over its head, clear of its face)
    const ph = (a, b) => seg(f, a, b);
    const hp = f < .25 ? lerpPt(P0, P1, ease(ph(0, .25))) : f < .55 ? P1 : f < .68 ? lerpPt(P1, P2, ease(ph(.55, .68))) : f < .76 ? lerpPt(P2, P3, easeIn(ph(.68, .76))) : lerpPt(P3, P0, ease(ph(.76, 1)));
    const relAt = lerpPt(P2, P3, easeIn(seg(REL, .68, .76)));
    const holdCard = f < REL;
    const tick = seg(f, .35, .45);
    const nod = Math.sin(Math.PI * seg(f, .37, .57));
    // (the arm straightens as it reaches down to the pile and comes back up with the card: with the hand there, a little
    // below its shoulder and out, the hose's bow sat on the edge between under the arm and up over it (core.js bendSide),
    // and flipped from one to the other between two drawings every cycle, a hump coming and going at the pile)
    const nearPile = Math.min(f, 1 - f), gBend = lerp(.06, .3, ease(clamp((nearPile - .03) / .12)));
    const G = grok(x, y, u, { ...ge, view: 'front', pose: { L: [hp[0], hp[1], gBend, holdCard ? 'hold' : 'open', 1], R: [2.3, -2.9, .5, 'relax', 0] }, holdL: holdCard ? s => { push(); rotate(Math.PI / 2 + .2); reqCard(cw, 'v2held', tick, 1); pop(); } : undefined, lookX: f < .55 ? -.5 : f < REL ? .3 : -.8, lookY: f < .55 ? .5 : -.4, rot: -.06 * nod, dy: .15 * nod, boilKey: 'v2grok', t, noShadow: true });
    // the answered card, thrown out over the rooftops from where the hand let it go (and last cycle's, still going)
    for (const back of [0, 1]) {
      const fa = f - REL + back; if (fa < 0 || fa > 1.2) continue;
      const st0 = [x + relAt[0] * u, y + relAt[1] * u], p = arcPt(st0, [x - 900, y + 240], 220, easeOut(fa / 1.2));
      push(); translate(...p); rotate(-fa * 4); reqCard(cw * (1 - .4 * fa), 'v2sent' + back, 1, 1); pop();
    }
    // the tailpipe: a bigger puff on "tailpipe", rising straight up (the plant's cost, drifting off)
    const a = t - TE.puff;
    if (a > 0 && a < 2.4) {
      boilSeed('v2 grok puff');
      for (let i = 0; i < 4; i++) { const b = a - i * .08; if (b <= 0) continue; const r = (18 + 60 * Math.sqrt(b)) * (1 - ease(seg(b, 1.6, 2.3))); if (r < 4) continue;
        piece(stBillowPts(x - 3.4 * u - 20 * b - 16 * i, y - 4 * u - 150 * easeOut(b / 1.4) - 20 * i, r, i * 3.1 + 7, b), '#B8B4C4', { sw: 1, key: 'v2gp' + i, spot: null }); }
    }
  }
  function streetSkyTop() {   // the bank sky above cpSky (the camera goes up there for Grok)
    boilSeed('v2 sky top');
    piece(R4(-400, -900, 2600, -318), '#E6E4EA', { ink: null, key: 'v2skytop' });
    waveLines(R4(-400, -900, 2600, -318), 3.8, 0, .9, 260, BANK.ink, .5);
  }
  // ---------- the street's extra business ----------
  // His washing, on a line between his window and next door's, and a pot plant on his sill: the fumes grey the washing
  // and wilt the plant. The fumes themselves: a stream of exhaust from the plant (upper right) curling in at his window.
  const FUME = [[1300, 40], [1060, 110], [800, 300], [610, 480]];
  const fumeAt = p => { const q = 1 - p, [a, b, c, d] = FUME; return [0, 1].map(i => q * q * q * a[i] + 3 * q * q * p * b[i] + 3 * q * p * p * c[i] + p * p * p * d[i]); };
  function houseExtras(t) {
    const g = ease(seg(t, TE.fumes + .2, TE.fumes + 1.1)), grey = c => mixCol(c, '#6E6A76', .85 * g), sway = .06 * Math.sin(t * 5) + (t > TE.fumes ? .12 * Math.exp(-(t - TE.fumes) * 3) * Math.sin((t - TE.fumes) * 14) : 0);
    boilSeed('v2 washing');
    const a = [118, 336], b = [330, 322], mid = t2 => [lerp(a[0], b[0], t2), lerp(a[1], b[1], t2) + 26 * Math.sin(Math.PI * t2)];
    dline([a, mid(.25), mid(.5), mid(.75), b], 1.3, '#1A1A1A', .5);
    [[.22, 'shirt', '#F4F1EA'], [.5, 'sock', '#E84A5A'], [.62, 'sock', '#E84A5A'], [.8, 'vest', '#FFD84A']].forEach(([f, kind, col], i) => {
      const [hx, hy] = mid(f);
      push(); translate(hx, hy); rotate(sway * (1 + .3 * i));
      if (kind === 'shirt') piece([[-34, 0], [34, 0], [44, 18], [30, 24], [28, 70], [-28, 70], [-30, 24], [-44, 18]], grey(col), { sw: 1, key: 'v2wsh', spot: null });
      else if (kind === 'sock') piece(ribbon([[0, 0], [2, 34], [14, 46]], 13, 12), grey(col), { sw: .9, key: 'v2wsk' + i, spot: null });
      else piece([[-22, 0], [22, 0], [24, 50], [-24, 50]], grey(col), { sw: .9, key: 'v2wvs', spot: null });
      piece(R4(-3, -6, 3, 6), '#E8E4DA', { sw: .6, key: 'v2peg' + i, spot: null });
      pop();
    });
    // the plant on his sill: its leaves droop and brown in the fumes
    boilSeed('v2 sill plant');
    const px = 718, py = 726, droop = ease(seg(t, TE.fumes + .4, TE.fumes + 1.5)), leaf = mixCol('#5EB86A', '#8A7A56', droop);
    piece([[px - 22, py - 38], [px + 22, py - 38], [px + 16, py], [px - 16, py]], '#D06A4A', { sw: 1, key: 'v2pot', spot: null });
    const top = [px + 10 * droop, py - 90 + 40 * droop];
    dline([[px, py - 38], [px + 4 * droop, py - 64 + 12 * droop], top], 2.2, '#3E7A3A', .5);
    for (let i = 0; i < 4; i++) { const s = i % 2 ? 1 : -1, base = i < 2 ? top : [px + 2 * droop, py - 62 + 14 * droop], ang = s > 0 ? lerp(-.5, 1.1, droop) : lerp(-2.6, -4.2, droop);
      push(); translate(...base); rotate(ang); piece(curvy([[0, 0], [16, -9], [34, 0], [16, 8]], 3), leaf, { sw: .8, key: 'v2leaf' + i, spot: null }); pop(); }
  }
  // the fumes: puffs born one after another at the plant, riding the curve down into his window (in front of the house)
  function fumesIn(t) {
    if (t < TE.fumes) return;
    boilSeed('v2 fumes');
    for (let i = 0; i < 20; i++) {
      const b = TE.fumes - .1 + i * .07, a = t - b; if (a < 0) continue;
      const p = clamp(a / .8); if (p >= 1) continue;
      const [x, y] = fumeAt(p), r = (50 + 80 * Math.sin(Math.PI * Math.min(1, p * 1.4))) * (p > .85 ? (1 - p) / .15 : 1);
      if (r > 4) piece(stBillowPts(x, y, r, i * 3.7, a * 2), i % 3 ? CPC.exh : CPC.exhLit, { sw: 1.1, key: 'v2fu' + i, spot: null });
    }
  }
  // the room behind him fills with haze (drawn between the room and him), and a dot screen of it over him
  function fumesRoom(t, over) {
    const k = ease(seg(t, TE.fumes + .4, TE.fumes + 1.6)); if (k <= 0) return;
    const Wn = CP.win, P = R4(Wn.x0, Wn.y0, Wn.x1, lerp(Wn.y0, Wn.y1 + 10, k));
    if (!over) piece(P, CPC.exhLit, { ink: null, key: 'v2haze', spot: null });
    else halftone(P, .22 * k, CPC.exhLit, XEROX.cell, 30);
  }
  // the gate's notice: an empty frame on the plant's door, one blank sheet on its last pin, which the roar tears away
  // The plant's gate (run first, permit later: xAI ran its Memphis turbines without air permits, and was permitted after):
  // steel leaves in the doorway, sooty; on the left leaf a council permit display frame (a blue header band: a stack
  // pictogram and an empty tick box), EMPTY: its pins and a clean rectangle in the grime; on the right leaf a hatch. The
  // exhaust rolls down over the gate. On the roar at TE.slap a company hand (a suit sleeve, a shirt cuff: not a bot, it
  // was the company's call) comes out of the hatch and slaps a fresh permit into the frame, a red seal (a tick) on it, the
  // ink still wet; and goes back in. Pictograms only (no words in pictures). World px, in the plant layer; the hand and the
  // hatch on twos (puppets).
  const GATE = { lx: 1400, rx: 1500, top: 466, rise: 44, bot: 690, fr: [1408, 562, 1446, 616], hatch: [1464, 588, 1484, 604] };
  function permitSheet(w, h, key, wet = 0) {   // (centred on 0, 0): the header's pictogram, ruled lines, a big red seal
    piece(R4(-w / 2, -h / 2, w / 2, h / 2), '#F8F6F0', { sw: 1.1, key: key + 'p' });
    piece(R4(-w / 2 + 3, -h / 2 + 3, w / 2 - 3, -h / 2 + 9), '#3E6FA8', { ink: null, key: key + 'hb' });
    piece(R4(-w / 2 + 6, -h / 2 + 4, -w / 2 + 8.5, -h / 2 + 8.5), '#F4F2EA', { ink: null, key: key + 'hs' });
    for (let j = 0; j < 2; j++) dline([[-w / 2 + 4, -h / 2 + 13 + j * 3.6], [w / 2 - 4 - 7 * j, -h / 2 + 13 + j * 3.6]], .6, '#8A8C98');
    // the seal, big, bottom left (clear of the hand that slaps it in on the right): red, a darker ring, a white tick
    const sx = -w / 2 + 11, sy = h / 2 - 10, r = 9.5;
    if (wet > 0) {   // the wet ink: the seal's red smeared off to the right (dragged by the slap), misregistered
      piece([[sx, sy - 7], [sx + 13 + 5 * wet, sy - 4], [sx + 15 + 5 * wet, sy + 3], [sx + 2, sy + 8]], '#E8606A', { ink: null, key: key + 'sm', op: 170, flatCard: true });
      piece(oval(sx + 2, sy + 1.6, r, r, 0, 16), '#E8606A', { ink: null, key: key + 'mr', op: 130, flatCard: true });
    }
    piece(oval(sx, sy, r, r, 0, 18), '#C8242F', { sw: 1, key: key + 's' });
    piece(oval(sx, sy, r - 2.2, r - 2.2, 0, 18), '#E23A44', { ink: null, key: key + 's2' });
    dline([[sx - 4.6, sy + .2], [sx - 1.2, sy + 3.8], [sx + 4.8, sy - 3.8]], 2.6, '#F8F6F0', 0);   // its tick
  }
  // the company's hand in drawing d (on twos, from the slap: -2 out of the hatch with it, -1 the wind-up, 0 the slap, 1
  // lifting off, 2 going back in): { w: wrist, a: hand angle, pose, sheet: [cx, cy, rot] | null } or null
  function companyHand(tt) {
    const d = Math.round((tt - TE.slap) * 12);
    if (d < -2 || d > 2) return null;
    const [f0, fy0, f1, fy1] = GATE.fr, fc = [(f0 + f1) / 2, (fy0 + 12 + fy1) / 2];
    return [
      { w: [1471, 593], a: Math.PI + .6, pose: 'hold', sheet: [1462, 574, -.08] },   // (held by its bottom corner, clear of the frame)
      { w: [1468, 575], a: Math.PI + 1.0, pose: 'hold', sheet: [1455, 553, -.3] },   // (raised, back: the wind-up)
      { w: [1452, 594], a: Math.PI + .08, pose: 'open', sheet: [fc[0], fc[1], 0] },
      { w: [1462, 597], a: Math.PI - .2, pose: 'relax', sheet: null },
      { w: [1470, 597], a: Math.PI - .1, pose: 'relax', sheet: null },
    ][d + 2];
  }
  function gateNotice(t) {
    const tt = mt(t), { lx, rx, top, rise, bot, fr, hatch } = GATE, door = stLancet(lx, top, rx, bot, rise);
    boilSeed('v2 gate');
    // the leaves: steel, rails, soot run down them
    piece(door, cpInk(.34), { sw: 1.2, key: 'v2gl' });
    clipPoly(door, () => {
      for (let i = 0; i < 7; i++) { const x = lx + 5 + i * 14 + 4 * hash(i * 2.3), w = 4 + 5 * hash(i * 3.1), l = 60 + 120 * hash(i * 1.7); piece([[x, top], [x + w, top], [x + w * .6, top + rise + l], [x + w * .2, top + rise + l * .9]], cpInk(.14), { ink: null, key: 'v2gs' + i }); }
      for (const y of [528, 652]) piece(R4(lx, y, rx, y + 5), cpInk(.24), { sw: .7, key: 'v2gr' + y, flatCard: true });
    });
    dline([[(lx + rx) / 2, top + 4], [(lx + rx) / 2, bot]], 1.4, cpInk(.1));
    // the permit display frame: a clean rectangle in the grime, a frame, a header band (a stack pictogram, an empty tick
    // box), four pins, and nothing in it
    const [f0, fy0, f1, fy1] = fr, hb = fy0 + 12;
    piece(R4(f0 - 3, fy0 - 3, f1 + 3, fy1 + 3), cpInk(.86), { ink: null, key: 'v2gclean' });
    piece(R4(f0, fy0, f1, fy1), cpInk(.12), { sw: 1.1, key: 'v2gfr' });
    piece(R4(f0 + 2, hb, f1 - 2, fy1 - 2), cpInk(.92), { sw: .7, key: 'v2gfin' });
    piece(R4(f0 + 2, fy0 + 2, f1 - 2, hb - 1), '#3E6FA8', { ink: null, key: 'v2gfh' });
    piece(R4(f0 + 6, fy0 + 4, f0 + 10, hb - 2), '#F4F2EA', { ink: null, key: 'v2gfhs' });   // a stack
    piece(oval(f0 + 13, fy0 + 4.5, 3.6, 2.4, 0, 10), '#F4F2EA', { ink: null, key: 'v2gfhc' });   // its smoke
    piece(R4(f1 - 13, fy0 + 3.5, f1 - 5, hb - 2.5), '#F4F2EA', { sw: .7, key: 'v2gfhb' });   // an empty tick box
    const pins = () => { for (const [px, py] of [[f0 + 5, hb + 4], [f1 - 5, hb + 4], [f0 + 5, fy1 - 5], [f1 - 5, fy1 - 5]]) piece(oval(px, py, 1.9, 1.9, 0, 8), cpInk(0), { ink: null, key: 'v2gpin' + px + py }); };
    pins();
    // the hatch: shut; the flap swings up and out for the hand, and drops shut after
    const [h0, hy0, h1, hy1] = hatch, H = companyHand(tt), open = !!H, sheetIn = tt >= TE.slap - .04;
    if (!open) { piece(R4(h0, hy0, h1, hy1), cpInk(.42), { sw: .9, key: 'v2ghf' }); dline([[h0 + 2, hy0 + 2.5], [h1 - 2, hy0 + 2.5]], .8, cpInk(.2)); piece(R4((h0 + h1) / 2 - 3, hy1 - 5, (h0 + h1) / 2 + 3, hy1 - 3), cpInk(.1), { ink: null, key: 'v2ghk' }); }
    else {
      piece(R4(h0, hy0, h1, hy1), '#141420', { sw: .9, key: 'v2gho' });   // the dark behind it
      piece([[h0, hy0], [h1, hy0], [h1 + 2, hy0 - 10], [h0 - 2, hy0 - 10]], cpInk(.5), { sw: .9, key: 'v2ghf' });   // the flap, up and out
    }
    // the permit, in the frame from the slap on (its pins over it)
    if (sheetIn) { push(); translate((f0 + f1) / 2, (hb + fy1) / 2); permitSheet(30, 38, 'v2gpm', tt < TE.slap + .7 ? 1 : .6); pop(); pins(); }
    if (H) {   // the company's arm: out of the hatch (its root in the dark, the hatch's lip over it), sleeve, shirt cuff, cufflink, hand
      const hc = [h1 - 3, (hy0 + hy1) / 2], sw = .9, hs = 8.6;
      if (H.sheet && !sheetIn) { push(); translate(H.sheet[0], H.sheet[1]); rotate(H.sheet[2]); permitSheet(30, 38, 'v2gpm', 0); pop(); }
      boilSeed('v2 company arm');
      const dx = H.w[0] - hc[0], dy = H.w[1] - hc[1], L = Math.hypot(dx, dy) || 1, ca = Math.atan2(dy, dx);
      piece(ppBar(hc, [H.w[0] - dx / L * 2, H.w[1] - dy / L * 2], 10.5, 9.4), '#A4A8B4', { sw: 1.1, shade: '#707482', depth: 2, key: 'v2cas', lift: 2 });   // the suit sleeve (a pale grey suit: a dark one vanished into the dark gate and its hatch)
      piece(ppBar([H.w[0] - Math.cos(ca) * 3.2, H.w[1] - Math.sin(ca) * 3.2], [H.w[0] + Math.cos(ca) * .6, H.w[1] + Math.sin(ca) * .6], 8.6, 8.8), '#F2F0EA', { sw: .8, key: 'v2cac', lift: 2 });   // the shirt cuff
      piece(oval(H.w[0] - Math.cos(ca) * 1.3, H.w[1] - Math.sin(ca) * 1.3 + 2.6, 1.4, 1.4, 0, 8), '#E2B04A', { ink: null, key: 'v2cal' });   // a cufflink
      hand(H.w[0] + Math.cos(H.a) * .7, H.w[1] + Math.sin(H.a) * .7, H.a, hs, { pose: H.pose, col: '#E6BC96', sw, mirror: true, key: 'v2cah', maxTone: .45 });
      // the hatch's lip over the sleeve's root, so it goes in cleanly
      for (const [k, P] of [['t', R4(h0 - 1.5, hy0 - 1.5, h1 + 1.5, hy0 + 1)], ['b', R4(h0 - 1.5, hy1 - 1, h1 + 1.5, hy1 + 1.5)], ['r', R4(h1 - 1, hy0 - 1.5, h1 + 1.5, hy1 + 1.5)]]) piece(P, cpInk(.42), { ink: null, key: 'v2ghl' + k });
      if (Math.round((tt - TE.slap) * 12) === 0) for (const [ax, ay, bx2, by2] of [[f0 - 4, fy0 + 14, f0 - 11, fy0 + 9], [f0 - 5, fy1 - 8, f0 - 12, fy1 - 4], [(f0 + f1) / 2, fy1 + 5, (f0 + f1) / 2 - 1, fy1 + 12]]) dline([[ax, ay], [bx2, by2]], 1.3, cpInk(.08), 0);   // the slap
    }
    // the exhaust rolling down over the gate from the plant (it's running): dark billows drifting left along the top
    boilSeed('v2 gate smoke');
    for (let i = 0; i < 6; i++) { const ph = frac(t * .09 + i / 6), x = 1600 - 330 * ph + 20 * hash(i), y = 402 + 26 * Math.sin(ph * 5 + i) + 14 * hash(i * 2.1), r = 30 + 16 * hash(i * 3.7); piece(stBillowPts(x, y, r, i * 4.7 + 1, t * .5 + i), cpInk(.03), { sw: 1.1, key: 'v2gsm' + i }); }
  }
  // the council inspector: a hi-vis jacket (the riso's orange, a reflective band), a white hard hat, a clipboard and a pen.
  // Taps the empty permit frame with his pen on "permits" (twice); looks up at the roaring stacks; the permit's slapped in:
  // a take at it; then turns to us and shrugs on "plenty", the clipboard and the pen kept; then waits on at the gate
  const INSP = ppMerge(PP_BASE, { id: 'insp', name: 'the inspector', body: { leg: 5.0, torso: 4.5 }, hair: { style: 'part' }, glasses: null,
    face: { beard: 'tache', lid: .15, eye: .5 }, top: { kind: 'jumper', stripe: 2.6, band: .45 },
    col: { skin: '#D8A888', skinDk: '#B8886A', skinLt: '#E8C0A0', hair: '#7A6A5A', hairLt: '#A08A74', beard: '#7A6A5A', coat: '#FF7A2E', coatDk: '#C8501A', coatLt: '#E8ECF2', trousers: '#2A3050', trousersDk: '#1C2038', glasses: '#2A2A2A' } });
  const INSP_AT = [1364, 694, 11];
  function inspector(t) {
    const tt = mt(t), [X, Y, u] = INSP_AT, T0 = TE.taps, taps = T0.reduce((m, k) => Math.max(m, Math.sin(Math.PI * seg(tt, k - .08, k + .08))), 0);
    const upK = tt >= 107.7 && tt < TE.slap, take = tt >= TE.slap && tt < TE.shrug[0], shrug = tt >= TE.shrug[0] && tt < TE.shrug[1] + .45, wait = tt >= TE.shrug[1] + .45;
    const e = emotions(tt, [[107.05, 'determined', { emote: null, mouth: 'flat' }], [107.7, 'bored', { emote: null, mouth: 'flat' }], [TE.slap + .02, 'surprised', { emote: null, mouth: 'o' }], [TE.shrug[0], 'bored', { emote: null, mouth: 'flat' }]], { take: .6 });
    const clip = s => {   // a clipboard at its real size (A4-ish): a board, a clip, a ruled form
      push(); rotate(Math.PI / 2 - .2); const w = s * 2.4, h = s * 3.1;
      piece(b2RoundPoly(R4(-s * .2, -h / 2, w - s * .2, h / 2), s * .12), '#A07A4A', { sw: .9, key: 'v2icb', spot: null });
      piece(R4(-s * .06, -h / 2 + s * .34, w - s * .34, h / 2 - s * .14), '#F4F1E8', { sw: .7, key: 'v2icbp', spot: null });
      piece(R4(w * .3, -h / 2 - s * .12, w * .6, -h / 2 + s * .3), '#B8BCC4', { sw: .7, key: 'v2icbc', spot: null });
      for (let j = 0; j < 5; j++) dline([[s * .08, -h / 2 + s * .7 + j * s * .44], [w - s * .5, -h / 2 + s * .7 + j * s * .44]], .8, '#6A7A8A');
      pop();
    };
    const pen = s => { piece(ribbon([[-s * .1, 0], [s * 1.5, 0]], s * .26, s * .18), '#F2C63A', { sw: .9, key: 'v2ipen', lift: 2, spot: null }); piece(ribbon([[s * 1.45, 0], [s * 1.75, 0]], s * .14, s * .04), '#1E2230', { ink: null, key: 'v2ipent', lift: 1, spot: null }); };   // (a yellow pen, its tip dark: dark, it vanished against the gate, and white against the empty frame)
    // (the pen tapping the frame: his far hand forward to it, the pen along the hand, its tip on the frame; between taps
    // drawn back a touch)
    // (BACK: drawn back along the frame and a touch down, so the elbow stays under the forearm through the taps: back and
    // up at [3.25, -8.3] the far arm's elbow went out ahead of the hand, up over his shoulder, and it flipped under and
    // back up again with every tap, the elbow audit)
    const TAP = [3.82, -8.6], BACK = [3.25, -8.75];   // (the pen's tip on the empty frame's middle)
    const CLIP = [-.9, .7, .4, 'hold', 1, -1.3], CLIPUP = [-1.45, .35, .45, 'hold', 1, -1.3], HANG = [1.2, 3, .06], OPEN = [1.42, .3, .45];   // (the forearm out, palm up, the pen up: clear of the frame beside him)
    const up = backOut(seg(tt, TE.shrug[0], TE.shrug[0] + .17));
    let R;
    if (shrug) R = [lerp(HANG[0], OPEN[0], up), lerp(HANG[1], OPEN[1], up), lerp(HANG[2], OPEN[2], up), 'hold', 1, lerp(1.2, -1.25, up)];
    else if (tt < 107.7) R = [lerp(BACK[0], TAP[0], taps), lerp(BACK[1], TAP[1], taps), .25, 'hold', 1, -.15, 'u'];
    else R = [...HANG, 'hold', 1, 1.2];   // (the pen hand down while he looks up, and at the permit)
    const L = shrug ? [lerp(CLIP[0], CLIPUP[0], up), lerp(CLIP[1], CLIPUP[1], up), .4 + .05 * up, 'hold', 1, -1.3] : CLIP;
    const o = { ...e, view: shrug || wait ? 'front' : 'q', pose: { L, R }, holdL: clip, hold: pen, lookX: upK ? .5 : take ? .95 : shrug || wait ? 0 : .85, lookY: upK ? -1 : take ? .15 : wait ? -.3 : .1,
      tilt: upK ? -.14 : take ? .04 : shrug ? .12 * up : 0, boilKey: 'v2insp' };
    person(X, Y, u, INSP, o);
    // the taps: a little tick of lines round the pen's tip on the frame
    if (T0.some(k => Math.abs(tt - k) < .05)) { boilSeed('v2 tap'); for (const [a2, l0, l1] of [[-1.3, 5, 10], [-.5, 6, 11], [.3, 5, 9.5]]) dline([[1429 + Math.cos(a2) * l0, 596 + Math.sin(a2) * l0], [1429 + Math.cos(a2) * l1, 596 + Math.sin(a2) * l1]], 1.1, cpInk(.08), 0); }
    // his white hard hat, on his head (with its tilt): a dome and a brim, the peak forward
    const Fr = personFrame(INSP, { view: o.view }), sq = ((o.sq || 0) + (o.take || 0)) * .5, hx = (Fr.hx + clamp(o.lookX || 0, -1, 1) * .1) * u, pv = [hx, (Fr.yc - .3) * u];
    const hw = INSP.head.w * u, tp = Fr.top * u, pk = o.view === 'q' ? 1 : 0;
    boilSeed('v2 hardhat');
    push(); translate(X + (o.dx || 0) * u, Y + (o.dy || 0) * 1.1 * u); if (o.rot) rotate(o.rot); scale(1 + sq * .5, 1 - sq);
    translate(...pv); rotate((o.tilt || 0) + (o.rot || 0) * -.4); translate(-pv[0], -pv[1]);
    const dome = []; for (let i = 0; i <= 16; i++) { const a = Math.PI + i / 16 * Math.PI; dome.push([hx + Math.cos(a) * hw * 1.02, tp + 1.55 * u + Math.sin(a) * 1.85 * u]); }
    piece(dome, '#F4F2EA', { sw: 1, shade: '#C8C6BE', depth: .3 * u, key: 'v2ihat', spot: null });
    dline([[hx, tp - .25 * u], [hx, tp + 1.3 * u]], .8, '#C8C6BE');   // its ridge
    piece(b2RoundPoly(R4(hx - hw * 1.12 - (pk ? 0 : .2 * u), tp + 1.35 * u, hx + hw * 1.12 + pk * .9 * u, tp + 1.8 * u), .2 * u), '#E8E6DE', { sw: .9, key: 'v2ihatb', spot: null });
    pop();
  }
  // The plant's medium: riso (the user's pick, over an engraved plant under riso fire, where the two media clashed, and
  // all engraved, where the fire lost its heat): the whole plant photocopied with the street, the engraving's rules and
  // guilloches dropped, its lines re-inked: one print, the fire and Grok's cards hot against it.
  const RISO_PLANT_INK = '#2A3474';   // the riso plant's line and body ink: the blue drum's dark, like the lamp posts
  // draw fn as the plant layer: photocopied at this roar's generation
  function plantLayer(R, fn) {
    look('xerox'); cpGeneration(R.gen);
    const ink0 = BANK.ink, wl = waveLines, gb = guillocheBand, gu = guilloche;
    BANK.ink = RISO_PLANT_INK; waveLines = () => {}; guillocheBand = () => {};
    // the medallions print as flat discs; the pediment's cooling fan (the one small guilloche) as five riso blades, spinning
    guilloche = (cx, cy, r0, r1, o = {}) => {
      if (r1 > 100) return;
      for (let i = 0; i < 5; i++) { const a = (o.rot || 0) + i / 5 * TAU; piece([[cx, cy], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1], [cx + Math.cos(a + .55) * r1 * .92, cy + Math.sin(a + .55) * r1 * .92]], cpInk(.35), { sw: 1, key: 'rfan' + i }); }
    };
    try { cpXeroxDraw(fn); } finally { BANK.ink = ink0; waveLines = wl; guillocheBand = gb; guilloche = gu; }
  }
  // draw fn as the plant's own business (its fire, Grok and its cards): printed in riso over the plant
  function plantBusiness(R, fn) {
    look('xerox'); cpGeneration(R.gen); cpXeroxDraw(fn);
  }
  // A low angle up at the stacks (the plant layer), their fire and his street's roofs in the foreground
  const LSTK = [[300, 300, 360], [760, 230, 270], [1200, 250, 300], [1640, 320, 390]], LVP = [960, -1100], LBASE = 1200;
  const lEdge = (x, y) => lerp(x, LVP[0], (LBASE - y) / (LBASE - LVP[1]));
  // A stack in the look up at them, in its own perspective (base centre x, width w at the base, its mouth's centre at
  // height ty on its axis). Its axis runs from the base centre to the vanishing point its sides converge on: d along it
  // (up, toward the VP), n across it (screen right). Its mouth, its rim and its bands are circles square to that axis, so
  // they're drawn across it, not level: cross(s) is where the line across the axis at s px up it (from the mouth) meets
  // the stack's sides (carried on up past the mouth for the rim); at(s, v) a point s up the axis and v px across it,
  // the width narrowing toward the VP with the sides (the fire and the smoke rise along it and narrow away from us).
  function lStack(x, w, ty) {
    const M = [lEdge(x, ty), ty], dx = LVP[0] - M[0], dy = LVP[1] - M[1], L = Math.hypot(dx, dy), d = [dx / L, dy / L], n = [-d[1], d[0]];
    const at = (s, v) => { const k = 1 - s / L; return [M[0] + d[0] * s + n[0] * v * k, M[1] + d[1] * s + n[1] * v * k]; };
    const side = (X0, s) => {   // (the side line from (X0, LBASE) to the VP, met by the line across the axis at s)
      const c = at(s, 0), e = [LVP[0] - X0, LVP[1] - LBASE], rx = c[0] - X0, ry = c[1] - LBASE, det = n[0] * e[1] - e[0] * n[1], q = (n[0] * ry - rx * n[1]) / det;
      return [X0 + e[0] * q, LBASE + e[1] * q];
    };
    const cross = s => [side(x - w / 2, s), side(x + w / 2, s)], [TL, TR] = cross(0);
    return { M, d, n, L, at, cross, TL, TR, hw: Math.hypot(TR[0] - TL[0], TR[1] - TL[1]) / 2 };
  }
  // a line across the stack at s up its axis, from a to b (0..1 across), bowed away from the VP (toward us, below it)
  // by bow px at its middle: the near half of a circle square to the axis, seen from below
  const lArc = (S, s, a, b, ext, bow, n = 10) => { const [P, Q] = S.cross(s), E = [(Q[0] - P[0]) * ext, (Q[1] - P[1]) * ext], P0 = [P[0] - E[0], P[1] - E[1]], Q0 = [Q[0] + E[0], Q[1] + E[1]], out = [];
    for (let i = 0; i <= n; i++) { const u = lerp(a, b, i / n), f = Math.sin(Math.PI * u) * bow; out.push([lerp(P0[0], Q0[0], u) - S.d[0] * f, lerp(P0[1], Q0[1], u) - S.d[1] * f]); }
    return out; };
  function stacksLow(t, st, R) {
    const k = seg(t, 105.2, 106.5), [sx, sy] = R.shake > .02 ? shakeXY(t, 16 * R.shake) : [0, 0], cam = () => camBegin(960 + sx, 540 + sy - 30 * ease(k), 1 + .07 * ease(k), -.035);
    LIGHT.dir = [.55, -.83];
    // the stacks' fire and warning lights: printed over the plant in riso
    // (the rim's top: RIM px up the axis from the mouth; the bow of its circles seen from below, in the mouth's half-widths)
    const RIM = 24, BOW = .16;
    const lowFire = () => {
      boilSeed('v2 low fire');
      LSTK.forEach(([x, w, ty], i) => {
        const S = lStack(x, w, ty), hw = S.hw;
        // the aviation warning light, blinking on the beat, on the rim's face (it floated in the air off the stack's side)
        if (frac(bpOf(t) + i * .25) < .5) { const c = S.at(RIM * .2, hw * .55), b = hw * BOW * .65; piece(oval(c[0] - S.d[0] * b, c[1] - S.d[1] * b, 9, 9, 0, 12), CPC.warn, { sw: .9, key: 'v2lw' + i }); }
        if (R.k < .07 || (R.pre && i % 2)) return;
        // the fire: out of the mouth, up the stack's axis toward the VP (tilted in with it), narrowing away from us as the
        // stack does; its base spans the rim's top, bowed as the rim is; the roar's gust bends its tips a touch left.
        // (it used to stand up the screen on a level rim, its lobes leaning out off the leaning stacks)
        const kk = Math.min(1.4, R.k), h = hw * (1 + 4.8 * kk) * .72, j = hash(R.n * 3.7 + i);
        const FL = [[-.92, 0], [-1.04, .3], [-.6, .6 + .14 * j], [-.3, .44], [0, 1], [.3, .44], [.6, .66 - .14 * j], [1.04, .3], [.92, 0]];
        const at = (v, q, sc = 1) => { const p = S.at(RIM + q * h * sc, v * hw * sc), b = (1 - q) * hw * BOW * (1 - v * v * sc * sc), wind = -.22 * hw * q * q * sc; return [p[0] - S.d[0] * b + S.n[0] * wind, p[1] - S.d[1] * b + S.n[1] * wind]; };
        piece(curvy(FL.map(([v, q]) => at(v, q)), 4), CPC.fire, { sw: 1.3, key: 'v2lf' + i });
        piece(curvy(FL.map(([v, q]) => at(v * .5, q * .55)), 4), CPC.fireCore, { sw: .8, key: 'v2lf2' + i, spot: null });
      });
    };
    cam();
    plantLayer(R, () => {
    boilSeed('v2 low sky');
    piece(R4(-300, -300, W + 300, H + 300), '#E6E4EA', { ink: null, key: 'v2lsky' });
    waveLines(R4(-300, -300, W + 300, 900), 5, 0, .9, 260, BANK.ink, .5);
    piece(oval(960, 330, 420, 420, 0, 64), '#F0ECEE', { sw: 1.1, key: 'v2lmed' });
    guilloche(960, 330, 190, 400, { n: 22, lobes: 16, w: .5, twist: .25, beat: 4, steps: 320 });
    boilSeed('v2 low stacks');
    LSTK.forEach(([x, w, ty], i) => {
      const L0 = x - w / 2, R0 = x + w / 2, S = lStack(x, w, ty), hw = S.hw;
      // the stack, its top square to its axis; its bands and its rim (a collar, a little wider) are circles round it
      const top = lArc(S, 0, 0, 1, 0, hw * BOW);
      piece([[L0, LBASE], [R0, LBASE], ...top.slice().reverse()], cpInk(0), { sw: 1.5, shade: cpInk(-.35), depth: w * .3, key: 'v2ls' + i });
      for (const f of [.28, .5]) { const yb = lerp(ty, 900, f), sb = -Math.hypot(lEdge(x, yb) - S.M[0], yb - S.M[1]); dline(lArc(S, sb, 0, 1, 0, hw * BOW), 1.4, BANK.ink); }
      const rimLo = lArc(S, -14, 0, 1, .08, hw * BOW), rimHi = lArc(S, RIM, 0, 1, .08, hw * BOW);
      piece([...rimHi, ...rimLo.slice().reverse()], cpInk(.2), { sw: 1.3, key: 'v2lslip' + i });
    });
    piece(R4(-300, 860, W + 300, 1300), cpInk(.12), { sw: 1.4, key: 'v2lpar' });
    guillocheBand(-300, W + 300, 890, 26, { n: 5, wl: 60, w: .5 });
    // billows punched up on the coughs and the roar
    if ((R.on || R.pre) && R.age < .8) LSTK.forEach(([x, w, ty], i) => {
      if (R.pre && i % 2) return;
      const S = lStack(x, w, ty), a = R.age / .8, rise = (40 + (R.pre ? 90 : 220) * easeOut(a)) * .8, c = S.at(RIM + rise, -.2 * S.hw * a);   // (up the axis, the gust carrying it a touch left)
      const r = 2 * S.hw * (.35 + (R.pre ? .4 : 1.1) * easeOut(a)) * (1 - rise / S.L);   // (smaller with the distance, like the fire)
      piece(stBillowPts(c[0], c[1], r, R.n * 5.1 + i, R.n + a), cpInk(.02), { sw: 1.2, key: 'v2lbil' + i });
    });
    });
    camEnd();
    look('xerox'); cpGeneration(R.gen);
    cam();
    cpXeroxDraw(() => {
      lowFire();
      // his street's roofs across the bottom: slates, two chimney stacks with pots, a TV aerial
      boilSeed('v2 low roofs');
      piece([[-300, 1000], [W + 300, 975], [W + 300, 1400], [-300, 1400]], CPC.roof, { sw: 1.4, key: 'v2lroof' });
      for (const [cx, cw, ch] of [[230, 150, 170], [1560, 180, 200]]) {
        piece(R4(cx - cw / 2, 990 - ch, cx + cw / 2, 1010), CPC.chim, { sw: 1.3, key: 'v2lch' + cx });
        for (let p = 0; p < 3; p++) { const qx = cx - cw / 2 + 28 + p * (cw - 56) / 2; piece([[qx - 15, 990 - ch], [qx - 12, 940 - ch], [qx - 18, 932 - ch], [qx + 18, 932 - ch], [qx + 12, 940 - ch], [qx + 15, 990 - ch]], CPC.pot, { sw: 1, key: 'v2lpot' + cx + p }); }
      }
      // (the aerial's mast strapped to the right stack's side, down past its top: stood on the top it read as loose)
      dline([[1664, 870], [1664, 640]], 2.4, '#1A1A1A'); for (const [dy, w] of [[650, 90], [690, 70], [725, 52]]) dline([[1664 - w / 2, dy], [1664 + w / 2, dy + 4]], 2, '#1A1A1A');
      for (const y of [812, 852]) dline([[1644, y], [1670, y]], 5, '#1A1A1A');
    });
    camEnd();
  }
  // Three windows across the terrace opposite light up, one a beat: a baby bawling in its cot, a night-shift worker
  // with her hands over her ears (eye mask pushed up, hi-vis on the hook), an old man with a hot-water bottle, wide awake
  const TRIO = [111.94, 112.38, 112.82];
  // the baby's tears: printed in the blue drum alone; a drop of radius r at (x, y), its tail pointing back along v
  const BB_TEAR = '#6FB8EC', BB_TSPOT = { channel: 'c', tone: .6 };
  const bbDrop = (x, y, r, v) => { const a0 = Math.atan2(-v[1], -v[0]), P = [[x + Math.cos(a0) * r * 2.1, y + Math.sin(a0) * r * 2.1]]; for (let i = 0; i <= 12; i++) { const a = a0 + .95 + (TAU - 1.9) * i / 12; P.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } return P; };
  function trioWindow(i, t, x0, y0, x1, y1) {
    const cx = (x0 + x1) / 2, on = t >= TRIO[i] && (t - TRIO[i] >= .1 || Math.floor((t - TRIO[i]) * 60) % 2 === 1), tt = mt(t);
    if (!on) { piece(R4(x0, y0, x1, y1), CPC.glass, { sw: 1.2, key: 'v2tw' + i }); piece([[x0 + 30, y0 + 20], [x0 + 120, y0 + 20], [x0 + 40, y0 + 180]], '#8A8C98', { ink: null, key: 'v2twg' + i, spot: null }); return; }
    piece(R4(x0, y0, x1, y1), CPC.lit, { sw: 1.2, key: 'v2tw' + i, spot: null });
    const a = t - TRIO[i], jolt = Math.exp(-a * 8);
    if (i === 0) {   // the baby, bawling, fists round the cot rail
      boilSeed('v2 baby');
      const sk = '#C8906A', bawl = Math.abs(Math.sin(a * 9)), hx = cx, hy = y0 + 318 - 12 * bawl * (1 - jolt * .5), rail = y0 + 452;
      dline([[cx + 150, y0], [cx + 150, y0 + 64]], 1.2, '#1A1A1A');   // the mobile over the cot
      for (let s = 0; s < 3; s++) { const sa = Math.sin(t * 2 + s * 2) * .3, px = cx + 150 + Math.sin(sa + s * 2.1) * 48, py = y0 + 84 + s * 8; piece(starPts(px, py, 20, .45, 5, sa), ['#5E8AC8', '#E84A5A', '#5EB86A'][s], { sw: .9, key: 'v2mob' + s, spot: null }); }
      // the sleepsuit and the arms up to the rail
      piece(curvy([[hx - 86, hy + 64], [hx + 86, hy + 64], [hx + 118, y1 + 40], [hx - 118, y1 + 40]], 3), '#86A8D8', { sw: 1.3, key: 'v2bbod' });
      for (const s of [-1, 1]) piece(ribbon([[hx + s * 74, hy + 96], [hx + s * 104, hy + 118], [hx + s * 84, rail - 6]], 36, 30), '#86A8D8', { sw: 1.1, key: 'v2barm' + s });
      // the head: big, squeezed-shut eyes (> <), the bawl, tears streaming down its cheeks and spurting off both sides, a quiff
      for (const s of [-1, 1]) piece(oval(hx + s * 94, hy + 4, 16, 22, 0, 14), sk, { sw: 1.2, key: 'v2bear' + s, maxTone: .45 });
      piece(oval(hx, hy, 96, 88, 0, 36), sk, { sw: 1.6, key: 'v2bhead', maxTone: .45 });
      piece(curvy([[hx - 14, hy - 84], [hx + 4, hy - 110], [hx + 22, hy - 86]], 2), '#3A2A22', { sw: .9, key: 'v2bquiff' });
      for (const s of [-1, 1]) {
        // the eyes screwed shut, > <: the cast's squeezed eye (eyeH), its two strokes tapering from the apex at the nose
        // (they were 6-weight lines, 22 px across on screen: two blots); the brows up in a tent over them
        eyeH(hx + s * 40, hy - 18, 50, { style: 'squeeze', side: s, key: 'v2beye' + s });
        dline([[hx + s * 64, hy - 50], [hx + s * 44, hy - 60], [hx + s * 24, hy - 57]], 1.3, NOIR.ink, .5);
        piece(oval(hx + s * 60, hy + 22, 16, 11, 0, 14), '#F28A9A', { ink: null, key: 'v2bblush' + s, spot: null });
        // a tear stream from each eye's outer corner down the cheek, dripping off the jaw (a drip every third of a second)
        const wob = Math.sin(tt * 11 + s) * 2, dd = frac(tt * 3 + (s > 0 ? .5 : 0));
        piece(ribbon([[hx + s * 58, hy - 12], [hx + s * (70 + wob), hy + 12], [hx + s * (76 + wob), hy + 40], [hx + s * 73, hy + 66]], 4, 11), BB_TEAR, { sw: .6, key: 'v2bstream' + s, spot: BB_TSPOT });
        piece(oval(hx + s * 73, hy + 67, 6.5, 6.5, 0, 12), BB_TEAR, { ink: null, key: 'v2bstreamb' + s, spot: BB_TSPOT });
        piece(bbDrop(hx + s * (72 - 3 * dd), hy + 82 + 70 * dd * dd, 5.5, [0, 1]), BB_TEAR, { sw: .6, key: 'v2bdrip' + s, spot: BB_TSPOT });
        for (let r = 0; r < 3; r++) { const ang = (s < 0 ? Math.PI : 0) + (r - 1) * .5, r0 = 118 + 10 * bawl, r1 = r0 + 26 + 16 * bawl; dline([[hx + Math.cos(ang) * r0, hy + Math.sin(ang) * r0], [hx + Math.cos(ang) * r1, hy + Math.sin(ang) * r1]], 2.6, NOIR.ink, .3); }   // the bawl
      }
      mouthH(hx, hy + 22, 76, 'shout', { key: 'v2bm', sw: 2.2 });
      for (let s = -1; s <= 1; s += 2) for (let j = 0; j < 2; j++) { const d = frac(a * 1.8 + (s > 0 ? .5 : 0) + j * .5); piece(bbDrop(hx + s * (70 + 60 * d), hy - 10 - 40 * Math.sin(Math.PI * d) + 60 * d * d, 8, [s * 60, -40 * Math.PI * Math.cos(Math.PI * d) + 120 * d]), BB_TEAR, { sw: .6, key: 'v2btear' + s + j, spot: BB_TSPOT }); }   // (drops, their tails back along the spurt)
      // the cot's rail and bars in front, the fists over the rail
      piece(R4(x0 + 6, rail, x1 - 6, rail + 24), '#E8D8B0', { sw: 1.2, key: 'v2crail' });
      for (let b = 0; b < 9; b++) { const bx = lerp(x0 + 34, x1 - 34, b / 8); piece(R4(bx - 6, rail + 24, bx + 6, y1), '#E8D8B0', { sw: .9, key: 'v2cbar' + b }); }
      for (const s of [-1, 1]) hand(hx + s * 84, rail + 4, -Math.PI / 2 + s * .25, 40, { pose: 'fist', col: sk, mirror: s < 0, key: 'v2bh' + s, maxTone: .45 });
    } else {
      // two adults sat up in bed, big in their windows: the head's centre ~300 px down the glass
      const P = i === 1 ? PP_CAST[1] : PP_CAST[4], u = i === 1 ? 42 : 40, Fr = personFrame(P, { seated: true, seatH: 1.6 }), hw = P.head.w;
      const gy = y0 + 300 - Fr.hy * u, hx = cx, hyTop = gy + Fr.top * u, hy = gy + Fr.hy * u, R = v2Roar(t);
      boilSeed('v2 bed' + i);
      piece(curvy([[cx - 176, y1], [cx - 176, hy - 30], [cx, hy - 84], [cx + 176, hy - 30], [cx + 176, y1]], 3), '#8A5A3A', { sw: 1.2, key: 'v2hb' + i });   // the headboard
      piece(b2RoundPoly(R4(cx - 150, hy - 10, cx + 150, hy + 150), 60), '#F4F1EA', { sw: 1.1, key: 'v2pil' + i, spot: null });   // the pillow
      if (i === 1) {   // her hi-vis on a hook, ready for the early shift
        const vx = x0 + 150, vy = y0 + 104, V = ([x, y]) => [vx + x, vy + y];
        piece(oval(vx, vy - 14, 6, 6, 0, 10), '#6A6A6A', { ink: null, key: 'v2hook' });
        dline([[vx, vy - 14], [vx - 16, vy + 2]], 1.4, '#1A1A1A'); dline([[vx, vy - 14], [vx + 16, vy + 2]], 1.4, '#1A1A1A');
        piece([[-18, 0], [0, 56], [18, 0], [38, 4], [40, 40], [58, 70], [62, 176], [-62, 176], [-58, 70], [-40, 40], [-38, 4]].map(V), '#FF8A2A', { sw: 1.2, key: 'v2hiviz', spot: null });
        dline([[0, 56], [0, 176]].map(V), 1.1, '#1A1A1A');   // the zip
        for (const yy of [104, 144]) piece([[-60, yy], [60, yy], [61, yy + 13], [-61, yy + 13]].map(V), '#E4E6EC', { sw: .8, key: 'v2hivizs' + yy, spot: null });
      } else {   // a bedside table and lamp
        piece(R4(x1 - 120, hy + 120, x1 - 16, y1), '#8A5A3A', { sw: 1.1, key: 'v2btab' });
        dline([[x1 - 68, hy + 120], [x1 - 68, hy + 40]], 2.4, '#1A1A1A');
        piece([[x1 - 100, hy - 20], [x1 - 36, hy - 20], [x1 - 22, hy + 40], [x1 - 114, hy + 40]], '#F4E6B8', { sw: 1, key: 'v2lamp', spot: null });
      }
      const shiver = R.on ? Math.min(1, R.k) : 0;
      const o = i === 1
        ? { ...emotions(tt, [[TRIO[1] - .5, 'sleepy', { emote: null }], [TRIO[1] + .06, 'angry', { emote: null, eyes: 'squeeze', mouth: 'grimace' }]], { take: .8 }), pose: { L: [-hw - .1, Fr.hy + .2, .4, 'open', 1, -1.4, 'u'], R: [hw + .1, Fr.hy + .2, .4, 'open', 1, -1.75, 'u'] }, col: { coat: '#E88AA0', coatDk: '#B85A70', coatLt: '#F4B8C8' } }
        : { ...emotions(tt, [[TRIO[2] - .5, 'sleepy', { emote: null }], [TRIO[2] + .04, 'bored', { emote: null, eyes: 'blank', mouth: 'flat' }]], { take: .5 }), pose: { L: [-.8, Fr.ys + 2.0, .5, 'hold', 1, .2, 'u'], R: [.8, Fr.ys + 2.0, .5, 'hold', 1, Math.PI - .2, 'u'] }, col: { coat: '#7AA07A', coatDk: '#4E7A4E', coatLt: '#A8C8A8' },
            hold: s => { push(); rotate(-(Math.PI - .2)); translate(-s * .7, s * .1); piece(b2RoundPoly(R4(-s * 1.6, -s * 1.2, s * 1.6, s * 1.3), s * .55), '#D8434E', { sw: 1.1, key: 'v2hwb', spot: null }); piece(R4(-s * .34, -s * 1.6, s * .34, -s * 1.15), '#D8434E', { sw: .9, key: 'v2hwbn', spot: null }); for (let r = 0; r < 5; r++) dline([[-s * 1.35 + r * s * .66, -s * .9], [-s * 1.35 + r * s * .66 + s * .1, s * 1.0]], 1, '#8A1E2A'); pop(); } };
      if (i === 2) { o.lookX = 0; o.lookY = -.15; o.dx = .06 * shiver * Math.sin(t * 90); }   // wide awake, staring; a shiver on each roar
      person(cx, gy, u, P, { ...o, view: 'front', seated: true, seatH: 1.6, legs: false, noShadow: true, dy: -.4 * jolt, boilKey: 'v2trio' + i, emoteK: 0, idle: 0 });   // (the mask and cap are drawn over it)
      boilSeed('v2 trio x' + i);
      if (i === 1) piece(b2RoundPoly(R4(hx - hw * u * 1.02, hy - 1.75 * u, hx + hw * u * 1.02, hy - 1.05 * u), .3 * u), '#3A3A6A', { sw: 1, key: 'v2mask' });   // the eye mask, pushed up
      else { piece([[hx - hw * u * .95, hyTop + .9 * u], [hx + hw * u * .95, hyTop + .9 * u], [hx + hw * u * 1.6, hyTop - 1.2 * u], [hx + .4 * u, hyTop - 1.6 * u]], '#6A7AB8', { sw: 1, key: 'v2cap' }); piece(oval(hx + hw * u * 1.65, hyTop - 1.1 * u, .45 * u, .45 * u, 0, 12), '#F4F1EA', { sw: .8, key: 'v2capb', spot: null }); }
      const dv = i === 1 ? hy + 176 : hy + 262;   // the duvet: up to her chest; to his waist (the hot-water bottle shows)
      piece(curvy([[x0 - 10, dv + 30], [cx - 90, dv - 6], [cx + 90, dv - 6], [x1 + 10, dv + 30], [x1 + 10, y1 + 20], [x0 - 10, y1 + 20]], 3), i === 1 ? '#86A8D8' : '#E8D8B0', { sw: 1.2, key: 'v2duv' + i });
    }
    // curtains, half drawn
    for (const s of [0, 1]) piece(curvy(s ? [[x1, y0], [x1 - 70, y0], [x1 - 50, (y0 + y1) / 2], [x1 - 64, y1], [x1, y1]] : [[x0, y0], [x0 + 70, y0], [x0 + 50, (y0 + y1) / 2], [x0 + 64, y1], [x0, y1]], 3), ['#B85A58', '#5A7AB0', '#7A9A5A'][i], { sw: 1, key: 'v2cur' + i + s });
  }
  function trio(t, st, R) {
    const [sx, sy] = R.shake > .02 ? shakeXY(t, 9 * R.shake) : [0, 0], z = 1 + .04 * ease(seg(t, 111.5, 113.5));
    look('xerox'); cpGeneration(R.gen);
    camBegin(960 + sx, 520 + sy, z);
    cpXeroxDraw(() => {
      boilSeed('v2 trio wall');
      piece(R4(-100, -100, W + 100, H + 100), CPC.brickR, { sw: 1.2, key: 'v2twall' });
      for (let y = -60, r = 0; y < H + 60; y += 34, r++) { dline([[-60, y], [W + 60, y]], .9, '#1A1A1A'); for (let x = -60 + (r % 2) * 50; x < W + 60; x += 100) if (hash(x * .31 + y * 1.7) < .5) dline([[x, y], [x, y + 34]], .8, '#1A1A1A'); }
      piece(R4(1255, -100, 1275, H + 100), CPC.lampPole, { sw: 1, key: 'v2tpipe' });
      [[80, 580], [710, 1210], [1340, 1840]].forEach(([x0, x1], i) => {
        const y0 = 96, y1 = 744;
        piece(R4(x0 - 24, y0 - 44, x1 + 24, y0), CPC.stoneDk, { sw: 1.2, key: 'v2tl' + i });
        piece(R4(x0 - 12, y0 - 12, x1 + 12, y1 + 12), CPC.frame, { sw: 1.2, key: 'v2tf' + i });
        const q = [x0, y0, x1, y1], sc = [toScreen(x0, y0), toScreen(x1, y0), toScreen(x1, y1), toScreen(x0, y1)];
        v2Clip(sc, () => trioWindow(i, t, ...q));
        piece(R4(x0, y0 + 66, x1, y0 + 78), CPC.frame, { sw: 1, key: 'v2tbar' + i });
        piece(R4(x0 - 30, y1 + 10, x1 + 30, y1 + 38), CPC.stone, { sw: 1.2, key: 'v2ts' + i });
      });
    });
    camEnd();
  }
  // ---------- V2f: the do-not-disturb (dnd, ots; see ESHOTS) ----------
  // The do-not-disturb glyph, a crescent moon: radius r, its bite toward angle rot (up and right, as on a phone)
  function v2MoonPts(cx, cy, r, rot = -Math.PI / 4, n = 18) {
    const d = r * .45, r1 = r * .93, al = Math.acos(clamp((r * r - r1 * r1 + d * d) / (2 * d * r), -1, 1)), ox = Math.cos(rot) * d, oy = Math.sin(rot) * d, P = [];
    for (let i = 0; i <= n; i++) { const a = rot + al + i / n * (TAU - 2 * al); P.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    const mid = rot + Math.PI, nm = b => { while (b < mid - Math.PI) b += TAU; while (b > mid + Math.PI) b -= TAU; return b; };
    const b0 = nm(Math.atan2(Math.sin(rot - al) * r - oy, Math.cos(rot - al) * r - ox)), b1 = nm(Math.atan2(Math.sin(rot + al) * r - oy, Math.cos(rot + al) * r - ox));
    for (let i = 1; i < n; i++) { const b = lerp(b0, b1, i / n); P.push([cx + ox + Math.cos(b) * r1, cy + oy + Math.sin(b) * r1]); }
    return P;
  }
  // phone space (centred, 300 x 600 px, y down its long axis) → the drawing: at (x, y), scale sc, turned rot; fy squashes
  // the long axis and tp narrows the top (the phone tipped away from us, pointed at something)
  const v2PhoneMap = (x, y, sc, rot, fy = 1, tp = 0) => { const c = Math.cos(rot), s = Math.sin(rot); return ([px, py]) => { const X = px * (1 + tp * py / 300) * sc, Y = py * fy * sc; return [x + X * c - Y * s, y + X * s + Y * c]; }; };
  // His phone, face on. The screen is a control centre: three small dim tiles (airplane, wifi, signal) and under them the
  // one big control, a toggle with the crescent moon on its knob. s: { wake 0..1, on 0..1 (the knob across, the track
  // filling), lit 0..1 (the moon), press 0..1 (the knob pushed in), flash 0..1 (a re-press), pop (the moon's size kick),
  // rings [[0..1, strength]] (pulses round the moon), t }
  const DND = { y: 70, w: 256, h: 140 };
  const dndKnob = on => lerp(-DND.w / 2 + DND.h / 2, DND.w / 2 - DND.h / 2, on);
  const dndTouch = on => [dndKnob(on) + 32, DND.y + 40];   // where the thumb lands: the knob's lower right (the moon stays in view)
  function v2PhoneFace(s, F, sc, key) {
    const M = P => P.map(F), sw = clamp(1.6 * sc, .7, 2.2);
    boilSeed(key + ' phone');
    piece(M(R4(144, -196, 160, -118)), '#262634', { sw: sw * .8, key: key + 'btn' });   // the side button
    piece(M(b2RoundPoly(R4(-160, -310, 160, 310), 58)), '#FFD6A0', { ink: null, key: key + 'rim', spot: null });   // the plant's glow on its edge (it stands off the night)
    piece(M(b2RoundPoly(R4(-150, -300, 150, 300), 50)), '#262634', { sw: sw * 1.2, key: key + 'body' });
    piece(M(b2RoundPoly(R4(-136, -286, 136, 286), 38)), mixCol('#0A0C16', '#1E2766', s.wake), { sw: sw * .5, key: key + 'scr', spot: null });
    piece(M(b2RoundPoly(R4(-40, -274, 40, -252), 11)), '#08080E', { ink: null, key: key + 'isl' });   // the camera island
    if (s.wake < .4) return;
    clipPoly(M(b2RoundPoly(R4(-136, -286, 136, 286), 38)), () => v2PhoneScreen(s, M, sw, sc, key));   // (the knob's glow, rays and pulse rings reach past the glass)
  }
  function v2PhoneScreen(s, M, sw, sc, key) {
    // the dim tiles: airplane, wifi, signal bars
    [-86, 0, 86].forEach((tx, i) => {
      const ty = -150, G = (P, k) => piece(M(P.map(([x, y]) => [tx + x, ty + y])), '#EEF2FF', { ink: null, key: key + 'g' + i + k, spot: null });
      piece(M(b2RoundPoly(R4(tx - 34, ty - 34, tx + 34, ty + 34), 14)), '#34448E', { sw: sw * .5, key: key + 'tile' + i, spot: null });
      if (i === 0) { G(b2RoundPoly(R4(-4, -22, 4, 20), 4), 'f'); G([[-3, -6], [-22, 4], [-22, 9], [-3, 3], [3, 3], [22, 9], [22, 4], [3, -6]], 'w'); G([[-3, 12], [-11, 18], [-11, 21], [0, 18], [11, 21], [11, 18], [3, 12]], 't'); }
      else if (i === 1) { for (const r of [9, 18, 27]) { const P = []; for (let j = 0; j <= 8; j++) { const a = -Math.PI * .78 + j / 8 * Math.PI * .56; P.push([Math.cos(a) * r, 14 + Math.sin(a) * r]); } G(ribbon(P, 5.5), 'a' + r); } G(oval(0, 14, 4.5, 4.5, 0, 10), 'd'); }
      else for (let j = 0; j < 4; j++) G(R4(-17 + j * 9.5, 7 - j * 7, -11 + j * 9.5, 16), 'b' + j);
    });
    // the do-not-disturb toggle: the track, its fill following the knob, the glow, the knob, the moon
    const { y, w, h } = DND, kx = dndKnob(s.on), kr = (h / 2 - 9) * (1 - .1 * (s.press || 0));
    piece(M(b2RoundPoly(R4(-w / 2, y - h / 2, w / 2, y + h / 2), h / 2, 7)), '#454E82', { sw: sw * .8, key: key + 'trk', spot: null });
    if (s.on > .03) piece(M(b2RoundPoly(R4(-w / 2, y - h / 2, Math.max(-w / 2 + h, kx + h / 2), y + h / 2), h / 2, 7)), '#7E4AE0', { sw: sw * .8, key: key + 'fill', spot: null });
    const lit = s.lit || 0, fl = s.flash || 0;
    if (lit > 0) {   // the glow: a pale halo round the knob (light is the paper, in a print), bigger on a re-press
      piece(M(starPts(kx, y, kr * (1.42 + .4 * fl) * lit, .95, 20, (s.t || 0) * .8)), '#FFF3B8', { ink: null, key: key + 'glow', spot: null });
      if (fl > .25) for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + .2, r0 = kr * (1.75 + .2 * fl), r1 = r0 + kr * .75 * fl; piece(M(ppBar([kx + Math.cos(a) * r0, y + Math.sin(a) * r0], [kx + Math.cos(a) * r1, y + Math.sin(a) * r1], 11, 7)), '#FFF3B8', { sw: sw * .5, key: key + 'ray' + i, spot: null }); }
    }
    for (const [r, st] of s.rings || []) {   // a pulse ring round the lit moon (two half-bands: a piece can't have a hole)
      if (r <= 0 || r >= 1 || st <= 0) continue;
      const rr = kr * (1.2 + 1.5 * easeOut(r)), bw = 16 * st * (1 - r);
      for (const hf of [0, 1]) { const P = []; for (let i = 0; i <= 14; i++) { const a = (hf + i / 14) * Math.PI; P.push([kx + Math.cos(a) * rr, y + Math.sin(a) * rr]); } piece(ribbon(M(P), bw * sc), '#FFE680', { ink: null, key: key + 'ring' + hf, spot: null }); }
    }
    piece(M(oval(kx, y, kr, kr, 0, 30)), mixCol(mixCol('#AEB2C8', '#FBF8EE', s.on), '#FFFFFF', fl), { sw: sw * .9, key: key + 'knob', spot: null });
    piece(M(v2MoonPts(kx - kr * .05, y + kr * .05, kr * .72 * (1 + (s.pop || 0)))), lit > .5 ? '#FFD23A' : '#6C7299', { sw: sw * (lit > .5 ? 1.1 : .7), key: key + 'moon', spot: lit > .5 ? { channel: 'y', tone: .95 } : null });
  }
  // His right hand round the phone, in layers, so no finger ever crosses the screen: the sleeve and cuff, the palm and
  // the fingers BEHIND the phone (only their tips peek past its left edge), the phone, then the thumb IN FRONT: resting on
  // the right bezel, or out over the screen to press (th: { at [x, y] (phone space), reach 0..1, lift 0..1 (hovering, its
  // shadow on the screen), press 0..1 (the tip squashed on the glass) }). arm: { P (screen points from the wrist out), w0, w1 }
  function v2HandPhone(s, th, F, sc, key, arm) {
    const M = P => P.map(F), sw = clamp(1.6 * sc, .7, 2.2), sk = CP_HIM.col.skin, skD = CP_HIM.col.skinDk, PJ = CP_PJ.riso;
    boilSeed(key + ' hand');
    const wr = F([196, 440]), d = [arm.P[0][0] - wr[0], arm.P[0][1] - wr[1]], dl = Math.hypot(d[0], d[1]) || 1;
    piece(ribbon([wr, ...arm.P], arm.w0, arm.w1), PJ.coat, { sw: sw * 1.1, shade: PJ.coatDk, depth: .22 * arm.w0, key: key + 'slv' });
    piece(ppBar([wr[0] + d[0] / dl * 14 * sc, wr[1] + d[1] / dl * 14 * sc], [wr[0] + d[0] / dl * 70 * sc, wr[1] + d[1] / dl * 70 * sc], arm.w0 * 1.04), PJ.cuff, { sw, key: key + 'cuff' });
    piece(M(curvy([[-110, 40], [60, 10], [185, 70], [226, 200], [224, 330], [236, 452], [160, 466], [70, 404], [-70, 330], [-130, 190]], 4)), sk, { sw, shade: skD, depth: 34 * sc, key: key + 'palm', maxTone: .45 });
    for (const [fy, r, k] of [[-22, 25, 0], [60, 26, 1], [138, 25, 2], [210, 21, 3]]) piece(M(ppBar([-40, fy], [-178 + k * 5, fy + 10], r * 2, r * 2)), sk, { sw: sw * .9, key: key + 'f' + k, maxTone: .45 });
    v2PhoneFace(s, F, sc, key);
    // the thumb: from its root at the right edge, over the bezel (rest) or out to the target, a little arc on the way
    const B = [184, 196], rest = [156, 30], at = th.at || rest, rc = th.reach || 0, lf = (th.lift || 0) * Math.min(1, rc * 3), pr = th.press || 0;
    let tip = [lerp(rest[0], at[0], rc), lerp(rest[1], at[1], rc) - 26 * Math.sin(Math.PI * rc)];
    const grow = 1 + .1 * lf; tip = [B[0] + (tip[0] - B[0]) * grow, B[1] + (tip[1] - B[1]) * grow];
    const r0 = 32 * grow, r1 = 25 * grow * (1 + .18 * pr), sh = [18 * lf, 26 * lf];
    if (lf > .05) piece(M(ppBar([B[0] + sh[0], B[1] + sh[1]], [tip[0] + sh[0], tip[1] + sh[1]], r0 * 2, r1 * 2)), '#0A0C1A', { ink: null, key: key + 'tsh', spot: null });
    piece(M(ppBar(B, tip, r0 * 2, r1 * 2)), sk, { sw, shade: skD, depth: 14 * sc, key: key + 'th', maxTone: .45 });
    const ang = Math.atan2(tip[1] - B[1], tip[0] - B[0]);
    piece(M(oval(lerp(B[0], tip[0], .84), lerp(B[1], tip[1], .84), r1 * .6, r1 * .5, ang, 16)), mixCol(sk, '#F2CDB6', .5), { sw: sw * .6, key: key + 'nail', maxTone: .3 });
  }
  // the wilted pot plant on his sill (the fumes' work, from the house shot), close: at (x, y) the pot's foot, scale k
  function v2SillPlant(x, y, k, key) {
    boilSeed(key);
    const S = P => P.map(([a, b]) => [x + a * k, y + b * k]), leaf = '#8A7A56';
    piece(S([[-40, -70], [40, -70], [30, 0], [-30, 0]]), '#D06A4A', { sw: 1.3, key: key + 'pot' });
    piece(S([[-46, -84], [46, -84], [44, -66], [-44, -66]]), '#D06A4A', { sw: 1.2, key: key + 'rim' });
    dline(S([[0, -84], [8, -130], [26, -150]]), 3, '#3E7A3A', .5);
    for (let i = 0; i < 4; i++) { const s = i % 2 ? 1 : -1, b = i < 2 ? [26, -150] : [6, -120], a = s > 0 ? 1.15 : -4.25, c = Math.cos(a), sn = Math.sin(a);
      piece(S(curvy([[0, 0], [28, -16], [60, 0], [28, 14]], 3).map(([u, v]) => [b[0] + u * c - v * sn, b[1] + u * sn + v * c])), leaf, { sw: 1, key: key + 'l' + i, spot: null }); }
  }
  // his open window from inside (screen space): the jamb and the casement swung in at the left, the sill across the
  // bottom (sillY: its far edge; the POV looks down on more of it)
  function v2WindowIn(sillY, key) {
    boilSeed(key);
    piece(R4(-60, -60, 104, H + 60), CPC.frame, { sw: 1.4, shade: cpInk(-.2), depth: 24, key: key + 'jamb' });
    piece([[104, -60], [330, -170], [330, H + 170], [104, H + 60]], CPC.frame, { sw: 1.4, key: key + 'cas' });
    piece([[128, 10], [306, -70], [306, H + 60], [128, H - 10]], CPC.glass, { sw: 1.2, key: key + 'gl' });
    piece([[128, 470], [306, 450], [306, 474], [128, 492]], CPC.frame, { sw: 1, key: key + 'bar' });
    piece([[150, 120], [210, 60], [170, 360], [140, 400]], '#8A8C98', { ink: null, key: key + 'gli', spot: null });
    piece([[-60, sillY + 16], [W + 60, sillY - 4], [W + 60, H + 60], [-60, H + 60]], CPC.stone, { sw: 1.3, key: key + 'sill' });
    dline([[-60, sillY + 34], [W + 60, sillY + 14]], 1.2, '#1A1A1A');   // the sill's rounded nose
  }
  // dnd (113.50): his POV, a close insert over his window sill, the street and the plant out there. His phone comes up
  // big in his right hand; the screen wakes; his thumb hovers, then shoves the moon toggle across on "do" (the track fills,
  // the moon lights up) and re-presses it harder on "not" and "disturb" (a flash, a pulse ring, the phone dipping with
  // each jab: on! ON! ON!); on the cut the phone starts up and away (his arm going out, into the OTS).
  function dndPhoneState(t) {
    const J = TE.dnd.jab, lit = t >= J[0] + .06 ? 1 : 0;
    const kick = (j, k = 12) => t >= j ? Math.exp(-(t - j) * k) : 0;
    return { wake: ease(seg(t, 113.78, 113.86)), on: ease(seg(t, J[0], J[0] + .07)), lit, t,
      pop: lit ? .4 * kick(J[0] + .06) + .25 * kick(J[1]) + .32 * kick(J[2]) : 0,
      flash: Math.max(kick(J[1], 13), kick(J[2], 11)),
      rings: [[seg(t, J[0] + .06, J[0] + .36), .6], [seg(t, J[1], J[1] + .3), .9], [seg(t, J[2], J[2] + .3), 1.1]] };
  }
  // a thumb press on the glass at j: down over .06 s, held .05, up by j + .13 (0..1)
  const v2Press = (t, j) => t < j ? ease(seg(t, j - .06, j)) : 1 - ease(seg(t, j + .05, j + .13));
  function dndInsert(t, R) {
    const J = TE.dnd.jab, rise = seg(t, 113.44, 113.76);   // (already on its way up on the cut in)
    const imp = a => a < 0 ? 0 : a < .04 ? a / .04 : Math.exp(-(a - .04) * 11);
    const dip = .45 * imp(t - J[0]) + .8 * imp(t - J[1]) + 1.15 * imp(t - J[2]), go = easeIn(seg(t, 114.57, 114.63));
    const x = 1060 + 5 * Math.sin(t * 1.7) + 30 * go, y = 470 + 820 * (1 - backOut(rise)) + 34 * dip - 150 * go;
    const sc = (1 - .04 * dip) * (1 - .12 * go), rot = lerp(-.44, -.09, easeOut(rise)) + .012 * Math.sin(t * 2.3) + .035 * dip - .05 * go;
    const F = v2PhoneMap(x, y, sc, rot), s = dndPhoneState(t);
    // the thumb: on the bezel as it comes up; over the toggle, hovering; the three jabs (the first shoves the knob across)
    const pr = Math.max(...J.map(j => v2Press(t, j)));
    const th = { at: dndTouch(s.on), reach: ease(seg(t, 113.9, 114.06)), lift: 1 - pr, press: pr };
    s.press = t > J[0] + .06 ? pr : 0;
    look('xerox'); cpGeneration(R.gen);
    cpXeroxDraw(() => {
      // the view out there pushed back under a night screen, warmed along the top by the plant's fire
      const fl = .5 + .5 * Math.sin(t * 23) * Math.sin(t * 9.7);
      flushBrush(); _paint(R4(-20, -20, W + 20, 860), { wash: XEROX.paper, washOp: 130, ink: null });   // (a haze: the phone's in focus, the street isn't)
      const gk = .22 + .1 * fl + .3 * Math.min(1, R.k);
      for (let k = 0; k < 8; k++) halftone(R4(-20, k ? k * 46 : -20, W + 20, (k + 1) * 46), gk * (1 - k / 8), '#FF6A2A');   // (a stepped gradient, as a print does it)
      v2WindowIn(820, 'v2dndwin');
      v2SillPlant(420, 1010, 1.25, 'v2dndplant');
      v2HandPhone(s, th, F, sc, 'v2dnd', { P: [[x + 470 * sc, y + 640 * sc], [x + 820 * sc, y + 1100 * sc]], w0: 190 * sc, w1: 290 * sc });
    });
  }
  // ots (114.60): over his shoulder from inside his window. His arm goes out (by 114.78) and he points the phone at the
  // plant like a remote, the lit moon toggle on its screen. Each tap fires the moon from the phone's top at the plant:
  // it slows and shrinks as it goes; the first is snuffed by the 115.0 roar and blown back, the second fizzles out
  // sooner; both drop like duds, below the sill. Grok, on the cornice, works on at its queue.
  const otsCam = t => [1450, lerp(84, 70, seg(t, 114.6, 115.44)), lerp(1.1, 1.14, seg(t, 114.6, 115.44))];
  const OTS_TGT = [1640, 200];   // where he aims: the stacks on the right, the racket itself (on screen)
  function otsPhoneAt(t) {   // [x, y, sc, rot] of the phone (no shake)
    const ext = easeOut(seg(t, 114.6, 114.78)), tapK = TE.dnd.tap.reduce((m, j) => Math.max(m, t < j ? ease(seg(t, j - .05, j)) : Math.exp(-(t - j) * 12)), 0);
    return [lerp(1470, 1210, ext) + 4 * Math.sin(t * 2.1), lerp(980, 650, ext) + 10 * tapK, lerp(.95, .66, ext), lerp(.25, .66, ext) + .015 * Math.sin(t * 3)];
  }
  const otsMap = L => v2PhoneMap(L[0], L[1], L[2], L[3], .82, .12);   // (tipped away from us: pointed at the plant)
  function otsPhone(t, R) {
    const sh = R.shake > .02 ? shakeXY(t, 6 * R.shake) : [0, 0], [px, py, sc, rot] = otsPhoneAt(t);
    const F = otsMap([px + sh[0], py + sh[1], sc, rot]);
    const pr = Math.max(0, ...TE.dnd.tap.map(j => v2Press(t, j))), reach = Math.max(0, ...TE.dnd.tap.map(j => t < j ? ease(seg(t, j - .12, j - .03)) : 1 - ease(seg(t, j + .1, j + .2))));
    const kick = (j, k = 12) => t >= j ? Math.exp(-(t - j) * k) : 0, T1 = TE.dnd.tap;
    const s = { wake: 1, on: 1, lit: 1, t, press: pr, flash: Math.max(kick(T1[0]), kick(T1[1])), pop: .3 * Math.max(kick(T1[0]), kick(T1[1])), rings: T1.map(j => [seg(t, j, j + .3), .9]) };
    look('xerox'); cpGeneration(R.gen);
    cpXeroxDraw(() => {
      // the moons: fired from the phone's top at the stacks; each slows and shrinks as it goes, then dies. The first is
      // snuffed by the 115.0 roar and blown back, tumbling down past the phone; the second fizzles out sooner and drops.
      // Both fall outside, behind the phone and the sill.
      const moons = T1.map((j, i) => {
        const a = t - j; if (a < 0) return null;
        const Mj = otsMap(otsPhoneAt(j)), top = Mj([0, -320]), mid = Mj([0, -800]);   // out of the phone's top, curving on to the stacks
        const path = p => { const q = 1 - p; return [q * q * top[0] + 2 * q * p * mid[0] + p * p * OTS_TGT[0], q * q * top[1] + 2 * q * p * mid[1] + p * p * OTS_TGT[1]]; };
        const fly = q => i === 0 ? .62 * easeOut(q / .25) : .6 * easeOut(q / .6), die = i === 0 ? TE.roars[9] - j : .1, pd = fly(die), r0 = 62;   // (the second, weaker, dies a quarter of the way)
        const dir = (() => { const A = path(pd), B = path(pd - .02), l = Math.hypot(A[0] - B[0], A[1] - B[1]) || 1; return [(A[0] - B[0]) / l, (A[1] - B[1]) / l]; })();
        const m = { i, a, die, D: path(pd), dir, spin: 0, dud: a >= die, b: a - die };
        if (!m.dud) { const p = fly(a); m.pos = path(p); m.r = r0 * (1 - .5 * p) * lerp(.4, 1, easeOut(a / .05)); m.sput = i === 1 && a > die - .05 && Math.floor(t * 24) % 2 === 0; }
        else {
          const b = m.b, rd = r0 * (1 - .5 * pd);
          if (i === 0) {   // blown back at him: an arc down past the phone's left, and away below the sill
            const at = bb => { const k = clamp(bb / .42); return arcPt(m.D, [700, 1180], 160, k * (.55 + .45 * k)); };
            m.pos = at(b); const p0 = at(b - .03), vl = Math.hypot(m.pos[0] - p0[0], m.pos[1] - p0[1]) || 1; m.vel = [(m.pos[0] - p0[0]) / vl, (m.pos[1] - p0[1]) / vl];
            m.r = rd * (1 + .5 * easeOut(b / .42)); m.spin = b * 16;
          }
          else { m.pos = [m.D[0] + dir[0] * 50 * b, m.D[1] - 160 * b + 4800 * b * b]; m.r = rd * (1 - .15 * seg(b, 0, .3)); m.spin = b * 9; }   // a dud: it just drops
        }
        return m;
      }).filter(Boolean);
      const drawMoon = m => {
        boilSeed('v2 ots moon' + m.i);
        if (m.vel && m.b < .15) for (let g = 0; g < 3; g++) {   // blown back: speed lines off its tail
          const bk = [-m.vel[0], -m.vel[1]], o = (g - 1) * m.r * .6, L = m.r * (2.2 - .5 * Math.abs(g - 1)) * (1 - m.b / .15), s0 = m.r * 1.25;
          const a = [m.pos[0] + bk[0] * s0 - bk[1] * o, m.pos[1] + bk[1] * s0 + bk[0] * o];
          dline([a, [a[0] + bk[0] * L, a[1] + bk[1] * L]], 3, '#1E3C8C');
        }
        if (!m.dud) for (const k of [1, 2]) {   // the "shh" arcs trailing it: soft waves, the hush it carries
          const c = [m.pos[0] - m.dir[0] * m.r * (1.2 * k + 3.6), m.pos[1] - m.dir[1] * m.r * (1.2 * k + 3.6)], rr = m.r * 3, a0 = Math.atan2(m.dir[1], m.dir[0]), P = [];
          for (let q = 0; q <= 8; q++) { const aa = a0 - .55 + 1.1 * q / 8; P.push([c[0] + Math.cos(aa) * rr, c[1] + Math.sin(aa) * rr]); }
          piece(ribbon(P, m.r * (.34 - .09 * k), m.r * (.34 - .09 * k)), '#FFF3B8', { sw: .9, key: 'v2shh' + m.i + k, spot: null });
        }
        piece(v2MoonPts(m.pos[0], m.pos[1], m.r, -Math.PI / 4 + m.spin), m.dud || m.sput ? '#7C7898' : '#FFD23A', { sw: 1.6, key: 'v2mn' + m.i, spot: m.dud || m.sput ? null : { channel: 'y', tone: .95 } });
      };
      for (const m of moons) {   // where each died: a puff; the first, the roar's gust through it
        if (!m.dud || m.b > .45) continue;
        boilSeed('v2 ots puff' + m.i);
        const pr2 = (30 + 100 * Math.sqrt(m.b)) * (1 - ease(seg(m.b, .25, .45)));
        if (pr2 > 4) piece(stBillowPts(m.D[0], m.D[1] - 30 * m.b, pr2, m.i * 3.3 + 2, m.b), '#E6E2EE', { sw: 1.4, key: 'v2mpuff' + m.i, spot: null });
      }
      for (const m of moons) drawMoon(m);
      // his window, the sill; his shoulder at the bottom right, the arm out to the phone
      v2WindowIn(H - 80, 'v2otswin');
      boilSeed('v2 ots shoulder');
      const ext = seg(t, 114.6, 114.78);
      piece(curvy([[1560, H + 80], [1690, 1000], [1850, 940], [W + 80, 930], [W + 80, H + 80]], 4), CP_PJ.riso.coat, { sw: 1.5, shade: CP_PJ.riso.coatDk, depth: 40, key: 'v2otssh' });
      dline([[1700, 1010], [1790, 960], [1930, 944]], 3, CP_PJ.riso.cuff, .5);   // the pyjama's piping over the shoulder
      // the back of his head, big and near at the right edge (cropped hair, an ear), turned to the plant
      const hx = 2010 + 6 * Math.sin(t * 1.3), hy = 790 + (R.shake > .02 ? shakeXY(t, 4 * R.shake)[1] : 0);
      piece(oval(hx - 262, hy + 10, 34, 58, .15, 20), CP_HIM.col.skin, { sw: 1.3, shade: CP_HIM.col.skinDk, depth: 12, key: 'v2otsear', maxTone: .45 });
      piece(oval(hx, hy, 270, 300, -.12, 44), '#2A2250', { sw: 1.5, key: 'v2otshead' });   // (his dark crop, in the riso's dark violet)
      for (let k = 0; k < 5; k++) dline([[hx - 230 + k * 18, hy - 150 + k * 40], [hx - 200 + k * 14, hy - 120 + k * 42]], 1.6, '#12102A');   // the crop's grain
      v2HandPhone(s, { at: dndTouch(1), reach, lift: 1 - pr, press: pr }, F, sc, 'v2ots', { P: [[lerp(1640, 1520, ext), lerp(1160, 1010, ext)], [2000, 1200]], w0: lerp(190, 120, ext), w1: 330 });
    });
  }
  // the whip pan's motion smear (screen space): horizontal streaks, strongest mid-whip
  function whipStreaks(k) {
    if (k <= 0 || k >= 1) return;
    const a = k < .5 ? 4 * k * k : 4 * (1 - k) * (1 - k), span = 200 * a; flushBrush();   // a: the pan's speed (its cubic ease's slope), 0..1
    // the frame averaged with copies of itself slid along the pan (a running mean: copy i at alpha 1/(i+1))
    const g = get(), n = 12; push(); noStroke();
    for (let i = 1; i <= n; i++) { tint(255, 255 / (i + 1)); image(g, span * (2 * ((i * 5) % (n + 1)) / n - 1), 0, W, H); }
    noTint();
    const c = color(XEROX.toner);
    for (let i = 0; i < 40; i++) {
      const y = hash(i * 5.1) * H, x = (hash(i * 2.3) * 1.6 - .3) * W, L = (300 + 700 * hash(i * 7.7)) * a, w = 1.5 + 3 * hash(i * 1.3);
      c.setAlpha((30 + 70 * hash(i * 3.9)) * a); fill(c); rect(x, y, L, w);
    }
    pop();
  }
  // the crash zoom's speed lines (screen space)
  function crashStreaks(k) {
    if (k <= 0 || k >= 1) return;
    flushBrush(); push(); noStroke(); const c = color(XEROX.toner), cx = W / 2, cy = H / 2;
    for (let i = 0; i < 44; i++) {
      const a = hash(i * 3.3) * TAU, r0 = 240 + 260 * hash(i * 1.7), r1 = r0 + 260 + 520 * hash(i * 2.9), w = 1.5 + 3.5 * hash(i * 4.1), ca = Math.cos(a), sa = Math.sin(a);
      c.setAlpha(120 * Math.sin(Math.PI * k)); fill(c);
      beginShape(); vertex(cx + ca * r0, cy + sa * r0); vertex(cx + ca * r1 - sa * w, cy + sa * r1 + ca * w); vertex(cx + ca * r1 + sa * w, cy + sa * r1 - ca * w); endShape(CLOSE);
    }
    pop();
  }
  // the street at song time t (with the light bar reveal over sceneD at the start)
  function street(t) {
    const [, shot] = eShot(t), st = stOf(t), R = v2Roar(t);
    const covered = t >= TE.out[1] - .01;
    const kout = seg(t, TE.out[0], TE.out[1]), Xout = lerp(W + 520, -760, ease(kout));
    const L0 = CP.t.lights; CP.t.lights = TE.lights.map(stOf);
    Object.assign(CPC, CPC_R);
    try {
      if (covered) {
        look('xerox'); cpGeneration(R.gen); boilSeed('cp cover');
        cpXeroxDraw(() => { piece(R4(-80, -80, W + 80, H + 80), CPC.exh, { ink: null, key: 'cpcover', spot: null }); exhaustDrift(t, -760); });
      } else if (shot === 'stacks') stacksLow(t, st, R);
      else if (shot === 'trio') trio(t, st, R);
      else {
        const [cx, cy, zoom] = shot === 'ots' ? otsCam(t) : streetCam(t), vx0 = cx - W / 2 / zoom, vy1 = cy + H / 2 / zoom;
        const houseOn = shot !== 'ots' && shot !== 'dnd' && vx0 < 960 && vy1 > 160, streetOn = vy1 > 300;   // (dnd and ots: we're inside his window)
        LIGHT.dir = [.55, -.83];
        // (one print: the plant is photocopied with his street (the user's pick, riso), so it takes the same roar shake and
        // the same copy-of-a-copy drift. On a still camera of its own, the street's chimney stacks and roofs jumped and
        // shook against the plant behind them on every roar, floating over it)
        const [sx, sy] = R.shake > .02 ? shakeXY(t, 10 * R.shake) : [0, 0], D = cpDrift(R);
        const cam = () => camBegin(cx + sx - D.dx, cy + sy - D.dy, zoom * D.sc, D.rot);
        cam();
        plantLayer(R, () => {
          if (cy - H / 2 / zoom < -318) streetSkyTop();
          cpSky(st); cpPall(st, R); cpMedal(st);
          const dens0 = BANK.dens; BANK.dens = (dens0 || 1) * 1.5;
          cpPlant(st, R); BANK.dens = dens0;
          gateNotice(t);
          cpBillows(st, R);
        });
        plantBusiness(R, () => { cpFire(st, R); streetGrok(t, shot === 'grok'); });
        look('xerox'); cpGeneration(R.gen);   // (his street is always the photocopy)
        camEnd();
        cam();
        cpXeroxDraw(() => {
          if (streetOn) { cpTerraces(st); cpRoad(st); }
          if (t >= 107.05) inspector(t);   // at the gate from "No proper permits" on (still waiting there in the wide)
          if (streetOn) cpLamp(st, R);
          if (houseOn) { cpHouse(st, R); cpRoom(st); fumesRoom(t, false); streetHim(t, R); fumesRoom(t, true); cpWall(st, R); houseExtras(t); fumesIn(t); }
        });
        camEnd();
        if (shot === 'ots') otsPhone(t, R);
        else if (shot === 'dnd') dndInsert(t, R);
      }
      if (t > TE.out[0] && !covered) cpXeroxDraw(() => { cpExhaust(Xout, st); exhaustDrift(t, Xout); });
      cpDirt(R.gen);
      xeroxGrit(st, 1, 'v2 ' + shot);   // (steady: each roar is a new copy, dirtier; a pulse of specks on the beat read as film dust. A print per camera shot, not per board shot: V2e/V2f's line falls inside the house shot)
      crashStreaks(seg(t, TE.up[0], TE.up[1] + .04));
      whipStreaks(seg(t, TE.whip[0], TE.whip[1]));
    } finally { CP.t.lights = L0; Object.assign(XEROX, CP_X0); Object.assign(BANK, CP_B0); LIGHT.dir = [-.62, -.78]; }
  }
  // The exhaust's body, still rolling once it has printed the frame black (V2f's end into G's smear): big soft billows of
  // thinner toner carried in with it (X: the rolling front's x, as cpExhaust has it; they ride behind its lit billows),
  // then drifting slowly up and to the left, turning over as they go, so the black isn't dead (screen px; on ones)
  function exhaustDrift(t, X) {
    boilSeed('v2 exhaust drift');
    const col = mixCol(CPC.exh, CPC.exhLit, .11), a = t - TE.out[0];
    for (let i = 0; i < 10; i++) {
      const r = 170 + 120 * hash(i * 2.7), x = X + 300 + 1.3 * r + (W + 700) * i / 10 + 90 * hash(i * 1.3) - a * (40 + 30 * hash(i * 4.1)), y = 70 + (H - 140) * hash(i * 3.9) - 22 * a;
      if (x - 1.3 * r > W || x + 1.3 * r < 0) continue;
      piece(curvy(stBillowPts(x, y, r, i * 7.1 + 3, a * (.25 + .2 * hash(i * 5.3)) * (i % 2 ? 1 : -1)), 2), col, { ink: null, key: 'v2exd' + i, spot: null });
    }
  }
  // the copier's light bar across the platform (D): the copy (the street) behind it, the platform ahead
  function sweep(t) {
    // (right to left: the street comes in from the right; the platform, and him on its left, go last)
    const p = seg(t, TE.bar[0], TE.bar[1]), X = lerp(W + 160, -160, p);
    street(t);
    if (X > -40) v2Clip(R4(-10, -10, X, H + 10), () => sceneD(t));
    look('xerox');
    boilSeed('v2 bar');
    for (let i = 0; i < 6; i++) { const xa = X + 46 * i, xb = X + 46 * (i + 1); if (xa < W + 80) _paint(R4(xa, -80, xb, H + 80), { wash: XEROX.paper, washOp: 200 * (1 - i / 6), ink: null }); }
    for (let y = -40; y < H + 80; y += 110) _glow(X - 10, y, 190, '#9CFFD2', .85);
    _paint(R4(X - 16, -80, X + 10, H + 80), { wash: '#F8FFFA', ink: null });
    _paint(R4(X + 10, -80, X + 14, H + 80), { wash: '#B9C4BE', ink: null });
  }
  // ================================================================================================================
  // G: "Ugh. You're chasing A-G-I; I'm chasing a G-P. 'All appointments taken.' What?! It's eight-oh-fucking-three!"
  // ================================================================================================================
  const TG = {
    smear: [116.95, 117.42],                    // the exhaust's toner smeared off to the left: him first, then them
    ugh: 117.03, look: 117.42, lookBack: 118.42, flare: 118.15,   // "Ugh" (he coughs the exhaust out); a look across at them; "A-G-I"
    phone: [118.55, 118.85],                    // the phone to his ear: on hold ("I'm chasing a G-P")
    tickets: [118.94, 119.34, 119.8, 120.24, 120.68, 120.93],   // the appointment tickets taken, one a beat; the last on "appointments"
    close: [120.1, 120.62], shut: 121.55,       // the split closes; the hatch shutter comes down on "taken": the queue's closed
    what: 121.99, look2: 122.62, thrust: [122.72, 122.95], digits: 122.94,   // "What?!"; the phone, shoved at us: 08:03
  };
  const SG = {   // the surgery (card)
    wall: '#B9CDB2', wallLo: '#8FA98C', dado: '#6E8A6A', floor: '#CDC5AA', floorDk: '#B2A98C',
    chair: '#3E6FA8', chairDk: '#2A4E7C', leg: '#5A5E66', board: '#EDE8DA', boardDk: '#C8C2B0', paper: '#F2EEE4', ticket: '#F6E7A8', ticketDk: '#C9B46A',
    hatch: '#D8D2C2', hatchDk: '#ADA692', glass: '#A9C4CC', counter: '#8E7A5E', counterDk: '#6E5C44', shutter: '#C9C4B8', shutterDk: '#9E998C',
    door: '#6E88A8', doorDk: '#50688A', floorY: 830,
  };
  const HATCH = { x0: 1230, x1: 1530, y0: 360, y1: 640 };
  const BOARD = { x0: 760, x1: 1130, y0: 250, y1: 560 };
  const CONSULT = { x0: 1600, x1: 1980, y0: 270, y1: 700 };
  const GP = ppMerge(PP_BASE, { id: 'gp', name: 'the GP', body: { leg: 5.0, torso: 4.5, arm: 4.6, stoop: .3 }, head: { w: 1.95, h: 4.6, jaw: .82, chin: .36 },
    hair: { style: 'bob' }, face: { eyeY: .02, eye: .42, lash: 1.5, flicks: 1, lid: .2, nose: { kind: 'long', w: .9, q: .26 }, mouthW: .46, lips: .9 },
    top: { kind: 'coat', neck: .75, sh: [2.1, .45], rows: [[2.15, 1.6], [2.1, 3.2], [2.35, 7.2, 1]], hemC: .1, collar: 'lapel', vDepth: 1.9, buttons: [[.1, 2.6], [.1, 3.6]], pocket: 3.2 },
    legs: { kind: 'trousers' }, shoes: { kind: 'trainer' },
    col: { skin: '#E2B48E', skinDk: '#C29270', skinLt: '#F0CCAE', lip: '#B0645A', lipLt: '#C88070', iris: '#4A5A3A', hair: '#A8A29A', hairLt: '#CAC4BC', hairDk: '#7A746C', brow: '#6A645C',
      coat: '#F2F0EA', coatDk: '#C9C6BC', coatLt: '#FFFFFF', cuff: '#DAD6CC', under: '#4E86B0', button: '#C9C6BC', trousers: '#3E5A7A', trousersDk: '#2A405A', shoe: '#EDEBE4', sole: '#B8B2A6' } });
  // a phone (hand space): a dark slab, its lit screen; on hold: dots cycling (the queue)
  // (face: 1 its lit screen to us, -1 its back: a dark slab, the camera's lenses at its top end; in between it turns on
  // its long axis, edge on at 0. It faces whoever's looking at it: his ear, then him; it turns to us only when he shows it)
  const v2HoldPhone = (s, face = -1) => {
    push(); scale(1, Math.max(.1, Math.abs(face)));
    piece(b2RoundPoly(R4(-s * .15, -s * .5, s * 1.25, s * .5), s * .14), '#22242C', { sw: 1, key: 'v2gph', lift: 3 });
    if (face > 0) piece(b2RoundPoly(R4(s * .02, -s * .38, s * 1.1, s * .38), s * .08), '#3A5A9A', { ink: null, key: 'v2gphs', lift: 0, flatCard: true, edge: false });
    else { inl(b2RoundPoly(R4(s * .78, -s * .4, s * 1.13, -s * .02), s * .08), '#34363F', 'v2gpcam'); for (const [lx, ly] of [[.88, -.3], [1.03, -.3], [.88, -.13]]) inl(oval(s * lx, s * ly, s * .055, s * .055, 0, 10), '#0E0F14', 'v2gpl' + lx + ly); }
    pop();
  };
  // a big digital clock readout on a phone screen: 7-segment digits (a digital clock is its segments), "08:03"
  const SEG7 = { 0: 'abcdef', 3: 'abcdg', 8: 'abcdefg' };
  function seg7(x, y, h, d, col, key) {
    const w = h * .55, t = h * .13, g = t * .12, hw = w / 2, hh = h / 2;
    const H2 = (x0, x1, yy) => [[x0 + g, yy], [x0 + t / 2 + g, yy - t / 2], [x1 - t / 2 - g, yy - t / 2], [x1 - g, yy], [x1 - t / 2 - g, yy + t / 2], [x0 + t / 2 + g, yy + t / 2]];
    const V2 = (xx, y0, y1) => [[xx, y0 + g], [xx + t / 2, y0 + t / 2 + g], [xx + t / 2, y1 - t / 2 - g], [xx, y1 - g], [xx - t / 2, y1 - t / 2 - g], [xx - t / 2, y0 + t / 2 + g]];
    const S = { a: H2(-hw, hw, -hh), g: H2(-hw, hw, 0), d: H2(-hw, hw, hh), f: V2(-hw, -hh, 0), b: V2(hw, -hh, 0), e: V2(-hw, 0, hh), c: V2(hw, 0, hh) };
    for (const k of 'abcdefg') piece(shiftP(S[k], x, y), SEG7[d].includes(k) ? col : mixCol(col, '#1A2A4A', .88), { ink: null, key: key + k, lift: 0, flatCard: true, edge: false });
  }
  // the phone shoved at us, upright at the current origin (its top up): height h, width asp * h; k 0..1 the digits pop in;
  // face 1 its screen to us, -1 its back, turning on its long axis (edge on at 0)
  function bigPhone(h, k, face = 1, asp = .56) {
    const w = h * asp, f = clamp(h / 780);
    push(); scale(Math.max(.06, Math.abs(face)), 1);
    piece(b2RoundPoly(R4(-w / 2, -h / 2, w / 2, h / 2), w * .12), '#1E2026', { sw: lerp(1, 2, f), shade: '#0E0F12', depth: 12 * f + 2, key: 'v2bph', lift: 3 + 11 * f });
    if (face <= 0) {   // its back (as it faces him): the camera island and lenses
      inl(b2RoundPoly(R4(w * .08, -h * .45, w * .44, -h * .22), w * .07), '#2C2E36', 'v2bphcam');
      for (const [lx, ly] of [[.18, -.4], [.34, -.4], [.18, -.28]]) inl(oval(w * lx, h * ly, w * .06, w * .06, 0, 12), '#08090C', 'v2bphl' + lx + ly);
      pop(); return;
    }
    piece(b2RoundPoly(R4(-w * .44, -h * .44, w * .44, h * .44), w * .07), '#1E3A7A', { ink: null, key: 'v2bphs', lift: 0, flatCard: true, edge: false });
    piece(oval(0, -h * .47, w * .06, w * .02, 0, 10), '#0E0F12', { ink: null, key: 'v2bphc', lift: 0, flatCard: true, edge: false });
    if (k > 0) {
      const dh = w * .26 * backOut(clamp(k)), cy = -h * .12, gap = dh * .66;
      seg7(-gap * 1.55 - dh * .1, cy, dh, 0, '#F4F2EA', 'v2d0'); seg7(-gap * .55 - dh * .1, cy, dh, 8, '#F4F2EA', 'v2d1');
      for (const d of [-1, 1]) piece(oval(0, cy + d * dh * .2, dh * .07, dh * .07, 0, 10), '#F4F2EA', { ink: null, key: 'v2dc' + d, lift: 0, flatCard: true, edge: false });
      seg7(gap * .55 + dh * .1, cy, dh, 0, '#F4F2EA', 'v2d2'); seg7(gap * 1.55 + dh * .1, cy, dh, 3, '#FF6A5A', 'v2d3');
      for (let i = 0; i < 3; i++) piece(b2RoundPoly(R4(-w * .34, h * .1 + i * h * .08, w * .34, h * .15 + i * h * .08), 6 * f), '#2E4E90', { ink: null, key: 'v2bpn' + i, lift: 0, flatCard: true, edge: false });   // notifications (blank)
    }
    pop();
  }
  function surgeryBack(t) {
    boilSeed('v2 sg wall');
    const fy = SG.floorY;
    piece(R4(-400, -400, 2900, fy), SG.wall, { ink: null, key: 'v2sgw', lift: 0, edge: false });
    piece(R4(-400, fy - 290, 2900, fy), SG.wallLo, { ink: null, key: 'v2sglo', lift: 0, edge: false, flatCard: true });
    piece(R4(-400, fy - 300, 2900, fy - 284), SG.dado, { sw: 1, key: 'v2sgdado', lift: 2, flatCard: true });
    piece(R4(-400, fy, 2900, 1500), SG.floor, { sw: 1.4, key: 'v2sgfl', lift: 0, edge: false });
    for (let i = 0; i < 40; i++) inl(oval(-350 + hash(i) * 3200, fy + 30 + hash(i + 9) * 400, 6 + 6 * hash(i + 3), 3, 0, 8), SG.floorDk, 'v2sgsp' + i);
    piece(R4(-400, fy - 16, 2900, fy + 2), '#E8E2D2', { sw: 1, key: 'v2sgsk', lift: 1, flatCard: true });
    // a poster: a heart and a squiggle
    piece(R4(420, 240, 620, 480), SG.paper, { sw: 1, key: 'v2sgpo', lift: 3 }); piece(heartPts(520, 330, 46), V2C.red, { ink: null, key: 'v2sgph', lift: 0, flatCard: true }); for (let j = 0; j < 3; j++) prScrib(450, 400 + j * 22, 140, 3, '#8A8478', .9, j);
  }
  // the appointments board: slots on hooks, a ticket in each; they're taken one a beat and gone
  function apptBoard(t) {
    const { x0, x1, y0, y1 } = BOARD;
    boilSeed('v2 sg board');
    piece(R4(x0, y0, x1, y1), SG.board, { sw: 1.5, shade: SG.boardDk, depth: 10, key: 'v2bd', lift: 5 });
    piece(R4(x0, y0, x1, y0 + 46), '#3E6FA8', { sw: 1.2, key: 'v2bdt', lift: 1, flatCard: true });
    piece(oval(x0 + 40, y0 + 23, 14, 14, 0, 14), '#F4F2EA', { ink: null, key: 'v2bdtc', lift: 0, flatCard: true, edge: false });   // a little clock face
    dline([[x0 + 40, y0 + 23], [x0 + 40, y0 + 13]], 1.4, '#3E6FA8'); dline([[x0 + 40, y0 + 23], [x0 + 47, y0 + 23]], 1.4, '#3E6FA8');
    const cols = 3, rows = 2, n = TG.tickets.length;
    for (let i = 0; i < n; i++) {
      const c = i % cols, r = Math.floor(i / cols), cx = lerp(x0 + 70, x1 - 70, c / (cols - 1)), cy = y0 + 120 + r * 135;
      piece(oval(cx, cy - 36, 7, 7, 0, 10), '#8A8478', { sw: .8, key: 'v2hook' + i, lift: 2, flatCard: true });
      const tk = TG.tickets[i], a = t - tk;
      const sw = a > 0 ? .5 * Math.exp(-a * 5) * Math.sin(a * 18) : 0;   // the empty hook swings
      if (a > .14) { dline([[cx, cy - 36], [cx + 30 * sw, cy - 8]], 1.4, '#8A8478'); continue; }
      const up = a > 0 ? easeIn(a / .14) : 0;   // snatched up and away
      push(); translate(cx + 60 * up, cy - 180 * up); rotate(up * 1.2);
      piece(R4(-44, -34, 44, 40), SG.ticket, { sw: 1, shade: SG.ticketDk, depth: 4, key: 'v2tk' + i, lift: 3 });
      inl(oval(-24, -6, 10, 10, 0, 12), '#F4F2EA', 'v2tkc' + i); dline([[-24, -6], [-24, -13]], 1, '#6A5A2A'); dline([[-24, -6], [-18, -6]], 1, '#6A5A2A');
      prScrib(-6, -8, 38, 2, '#8A7A4A', .8, i); prScrib(-34, 18, 66, 2, '#8A7A4A', .8, i + 5);
      pop();
    }
  }
  // the reception hatch; its shutter comes down on "taken" (the queue's closed)
  function surgeryHatch(t) {
    const { x0, x1, y0, y1 } = HATCH;
    boilSeed('v2 sg hatch');
    piece(R4(x0, y0, x1, y1), '#5E6A6A', { ink: null, key: 'v2sghin', lift: 0, flatCard: true, edge: false });
    piece(R4(x0 + 20, y0 + 30, x0 + 130, y0 + 150), '#7E8A88', { ink: null, key: 'v2sghsh', lift: 0, flatCard: true, edge: false });
    const fr = 30;
    piece([[x0 - fr, y0 - fr], [x1 + fr, y0 - fr], [x1 + fr, y1 + 20], [x1, y1 + 20], [x1, y0], [x0, y0], [x0, y1 + 20], [x0 - fr, y1 + 20]], SG.hatch, { sw: 1.3, shade: SG.hatchDk, depth: 8, key: 'v2sghf', lift: 4 });
    const sh = ease(seg(t, TG.shut - .12, TG.shut)), bnc = t > TG.shut ? 10 * Math.exp(-(t - TG.shut) * 12) * Math.cos((t - TG.shut) * 40) : 0;
    if (sh > 0) { const yb = lerp(y0, y1, sh) - bnc; piece(R4(x0, y0, x1, yb), SG.shutter, { sw: 1.2, key: 'v2sgshut', lift: 5 }); for (let y = y0 + 22; y < yb - 6; y += 22) dline([[x0 + 6, y], [x1 - 6, y]], .8, SG.shutterDk); if (sh > .9) piece(oval((x0 + x1) / 2, yb - 40, 26, 26, 0, 20), V2C.red, { sw: 1, key: 'v2sgno', lift: 2, flatCard: true }), inl(R4((x0 + x1) / 2 - 16, yb - 45, (x0 + x1) / 2 + 16, yb - 35), '#FFFFFF', 'v2sgnob'); }
    piece(R4(x0 - 60, y1, x1 + 60, y1 + 36), SG.counter, { sw: 1.3, shade: SG.counterDk, depth: 8, key: 'v2sgct', lift: 5 });
    piece(R4(x0 - 40, y1 + 36, x1 + 40, SG.floorY), SG.hatchDk, { sw: 1.2, key: 'v2sgcf', lift: 3 });
  }
  // the consulting room through its glass: the GP, busy with a patient (the stethoscope, then notes)
  function consultRoom(t) {
    const { x0, x1, y0, y1 } = CONSULT, tt = mt(t);
    boilSeed('v2 sg consult');
    piece(R4(x0 - 26, y0 - 26, x1 + 26, SG.floorY), SG.door, { sw: 1.4, shade: SG.doorDk, depth: 10, key: 'v2sgcr', lift: 4 });
    clipPoly(R4(x0, y0, x1, y1), () => {   // (the room through the glass: the two of them stand and sit below its bottom edge)
    piece(R4(x0, y0, x1, y1), '#DCE6E0', { ink: null, key: 'v2sgcg', lift: 0, flatCard: true, edge: false });
    piece(R4(x0, y1 - 150, x1, y1), '#C4D0C8', { ink: null, key: 'v2sgcgf', lift: 0, flatCard: true, edge: false });
    // the patient, seated, and the GP bending over them, listening; then scribbling a note
    const note = frac(tt / 3.2) > .6;
    person(x0 + 95, y1 + 40, 26, PP_CAST[4], { ...feel('sad', tt, { seed: 2 }), view: 'q', seated: true, seatH: 3.6, pose: 'lap', emoteK: 0, boilKey: 'v2pat', noShadow: true });
    // (listening: her far hand holds the stethoscope's chestpiece to the patient's chest, at the tube's end, the elbow down
    // under the forearm (bend < 0), the near arm down at her side. Flipped to face the patient, her own +x is toward him;
    // the chestpiece hand used to be the near one, held out behind her away from him, the tube running to his chest
    // without it, and the far hand sat on her belly with its elbow flared up at her shoulder)
    const steth = s => piece(oval(s * .2, 0, s * .28, s * .28, 0, 12), '#B8BCC4', { sw: .8, key: 'v2steth', lift: 2, flatCard: true });
    person(x0 + 250, y1 + 60, 27, GP, { ...feel('thinking', tt, { seed: 4 }), view: 'q', flip: true, pose: note ? { L: [-.4, .6, .4, 'hold', 1, -1.2], R: [.5, .7, .4, 'point', 1, Math.PI + .4] } : { L: [-1.35, 3, .1, 'relax'], R: [4.33, -7.2, -.35, 'hold', 0, null, 'u'] }, holdL: note ? (s => piece(R4(-s * .2, -s * .6, s * .9, s * .6), SG.paper, { sw: .8, key: 'v2gpnote', lift: 2, flatCard: true })) : undefined, hold: note ? undefined : steth, emoteK: 0, rot: note ? 0 : .1, boilKey: 'v2gpC', noShadow: true });
    if (!note) dline([[x0 + 250 - 1.4 * 27, y1 + 60 - 9.6 * 27], [x0 + 230 - 2 * 27, y1 + 60 - 6.5 * 27], [x0 + 250 - 3.6 * 27, y1 + 60 - 7.6 * 27]], 2, '#4A4E56', .5);   // the stethoscope's tube
    });
    // the glass: a sheen and the frame bars
    piece([[x0 + 30, y0], [x0 + 110, y0], [x0 + 40, y1], [x0 - 10, y1]].map(([x, y]) => [clamp(x, x0, x1), y]), '#FFFFFF', { ink: null, op: 60, key: 'v2sgcs', lift: 0, flatCard: true, edge: false });
    dline([[(x0 + x1) / 2, y0], [(x0 + x1) / 2, y1]], 2, SG.doorDk);
  }
  // the waiting room's chairs, full: the queue
  function waitingRow(t) {
    const tt = mt(t), fy = SG.floorY;
    boilSeed('v2 sg chairs');
    for (let i = 0; i < 4; i++) { const x = -140 + i * 150; piece(R4(x, fy - 250, x + 118, fy - 130), SG.chair, { sw: 1.2, shade: SG.chairDk, depth: 8, key: 'v2sgcb' + i, lift: 4 }); }
    for (let i = 0; i < 4; i++) { const x = -144 + i * 150; piece(R4(x, fy - 132, x + 126, fy - 104), SG.chairDk, { sw: 1.2, key: 'v2sgcs' + i, lift: 4 }); }
    piece(R4(-160, fy - 104, 490, fy - 92), SG.leg, { sw: 1, key: 'v2sgbar', lift: 3, flatCard: true });
    for (const x of [-100, 180, 440]) piece(R4(x, fy - 94, x + 12, fy - 4), SG.leg, { sw: .9, key: 'v2sgleg' + x, lift: 3, flatCard: true });
    // (sat on the seats, in front of them: the hips on the seat's top, the lap and knees over its front edge, the shins
    // down in front of the frame. Drawn behind the seat fronts, their laps were hidden and they read as standing)
    // (3/4, turned toward the hatch, so their thighs run forward over the seat and their shins drop from the knee: sat
    // front-on with their hands clasped in their laps, straight shins under them, they half-read as standing. One with his
    // hands on his knees, one slumped back with her arms folded, nodding off, one on his phone, its back to us)
    const WAIT = [[PP_CAST[0], -80, 'bored', { L: [2.3, -6.35, .3, 'relax', 1, .25, 'u'], R: [3.1, -6.2, .3, 'relax', 1, .25, 'u'] }, { rot: .04 }],
      [PP_CAST[1], 70, 'sleepy', 'cross', { rot: -.07, tilt: .14, lookY: .5 }],
      [PP_CAST[5], 370, 'nervous', { L: [2.4, -6.3, .3, 'relax', 1, .3, 'u'], R: [2.3, -7.7, .4, 'hold', 1, -1.35, 'u'] }, { rot: .08, lookX: .5, lookY: .8, hold: s => v2HoldPhone(s * .85, -1) }]];
    WAIT.forEach(([P, x, e, pose, o], i) => person(x, fy + 20, 25, P, { ...feel(e, tt, { seed: i + 3 }), view: 'q', seated: true, seatH: 5.9, pose, emoteK: 0, boilKey: 'v2wait' + i, noShadow: true, ...o }));
  }
  // ================================================================================================================
  // G's bank half: the tech bros in a roadster, chasing the AGI they dangle from their own bonnet, a carrot on a stick
  // ================================================================================================================
  // The prize on the rod: a pocket C1b brain, glowing: "All that intelligence" (the user's pick over the AI sparkle, a
  // graphics card and a chat bubble's typing dots). It flares on "A-G-I" and swings away from Musk's grabs.
  const BKC = {
    red: '#D86A5A', redDk: '#9A4034', chrome: '#E6EAEA', chromeDk: '#8A9496', tyre: '#2C2C32', seat: '#B08048', seatDk: '#6E4A22',
    glass: '#DCE8EA', cane: '#6E4E2C', caneDk: '#3A2814', line: '#3A3A40',
    gold: '#E2B04A', goldInk: '#6A4A0E', burst: '#A8802E',
    pink: '#C0607A', pinkDk: '#6A2038',
  };
  const GRABS = [118.50, 119.34, 120.24];   // Musk's grabs at the prize, on the beat (the first just after the flare): all miss
  // the bros' vignettes about their heads (style.js figHalo's fit, in their u): Zuck's and Altman's where the seat-placed
  // ones sat; Musk's lifted to take in his head (the old one sat low, his hair out of it even at rest)
  const V2G_HALO = { zuck: { dx: .05, dn: -.1, rx: 4.8, ry: 6.6 }, altman: { dx: -.55, dn: .55, rx: 4.8, ry: 6.6 }, musk: { dx: -.2, dn: .6, rx: 4.8, ry: 6.6 } };
  const bkBy = t => 3.4 * Math.abs(Math.sin(t * 11.3)) + 2.2 * Math.abs(Math.sin(t * 6.7 + 1.3));   // the road's bounce (px)
  // the flare on "A-G-I": a quick rise, then a slow fade
  const agiFlare = t => seg(t, TG.flare - .03, TG.flare + .07) * Math.exp(-Math.max(0, t - TG.flare - .07) * 2.2);
  // the prize's swing on its line (rad, + = forward, away from them): the car's motion, and a kick away from each grab
  function agiSwing(t) {
    let a = .06 * Math.sin(t * 3.4) + .03 * Math.sin(t * 6.1 + 1);
    for (const g of GRABS) { const d = t - (g - .17); if (d > 0) a += .3 * Math.exp(-d * 3) * Math.sin(d * 7.6); }
    return a;
  }
  // Musk's far (forward) arm, [x, y, bend, hand, front, angle] in his body units: eager, then on each grab a wind-up,
  // the lunge onto the beat, the glove closing on air, the recovery. reach(k) gives the lunge's end (toward the prize).
  function muskGrab(t, reach) {
    const rest = [4.4, -9.6, .24, 'open', 1, -.45], wind = [3.6, -9.0, .34, 'open', 1, -.75];
    let g = null; for (const x of GRABS) if (t > x - .36 && t < x + .7) g = x;
    if (g == null) return { R: rest, k: 0 };
    const d = t - g, R1 = reach, mix = (a, b, k, hp) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k), hp, 1, lerp(a[5], b[5], k)];
    if (d < -.15) { const k = ease(seg(d, -.36, -.17)); return { R: mix(rest, wind, k, 'open'), k: 0 }; }
    if (d < 0) { const k = easeOut(seg(d, -.15, -.01)); return { R: mix(wind, R1, k, 'open'), k }; }
    if (d < .22) return { R: mix(R1, R1, 0, d < .03 ? 'open' : 'fist'), k: 1 };
    const k = ease(seg(d, .22, .62)); return { R: mix(R1, rest, k, k < .5 ? 'fist' : 'open'), k: 1 - k };
  }
  const closed = P => P.concat([P[0]]);
  // the pocket brain (C1b's, adapted from chorus.js: the same mass, lobe, striped cerebellum and stem; its folds re-cut
  // coarser so they read at a few inches wide)
  const PB = {
    M: [[-470, 40], [-505, -120], [-420, -285], [-250, -375], [0, -395], [240, -355], [410, -245], [485, -60], [445, 80], [300, 100], [200, 60], [80, 140], [-120, 172], [-300, 145], [-425, 110]],
    T: [[-370, 30], [-140, -25], [110, 30], [165, 115], [0, 172], [-210, 172], [-370, 112]],
    CB: [[220, 70], [360, 40], [470, 90], [460, 190], [330, 230], [230, 170]],
  };
  let PB_FOLDS = null, PB_OUT = null;
  // the mass's outline with its gyri bulging along the top (so it reads as a brain at a few inches across)
  function pbOutline() {
    if (PB_OUT) return PB_OUT;
    const P = resample(curvy(PB.M, 6), 6), N = normals(P);
    let s = 0; return (PB_OUT = P.map((p, i) => { if (i) s += Math.hypot(p[0] - P[i - 1][0], p[1] - P[i - 1][1]); const k = clamp((70 - p[1]) / 90); return [p[0] + N[i][0] * 16 * k * Math.abs(Math.sin(s / 64 * Math.PI)), p[1] + N[i][1] * 16 * k * Math.abs(Math.sin(s / 64 * Math.PI))]; }));
  }
  function pbFolds() {
    if (PB_FOLDS) return PB_FOLDS;
    // (the folds: zero contours of stripes whose direction wanders with the noise: parallel wiggly gyri, brain-coral style)
    const M = curvy(PB.M, 6), CB = curvy(PB.CB, 5), step = 9;
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; for (const [x, y] of M) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const nx = Math.ceil((x1 - x0) / step), ny = Math.ceil((y1 - y0) / step), f = (x, y) => { const th = noise(x * .0032 + 3.3, y * .0032 + 7.7) * 5; return Math.sin((x * Math.cos(th) + y * Math.sin(th)) * .058 + noise(x * .01, y * .01) * 2.5); }, V = [];
    for (let j = 0; j <= ny; j++) { V.push([]); for (let i = 0; i <= nx; i++) V[j].push(f(x0 + i * step, y0 + j * step)); }
    const segs = [];
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const X = x0 + i * step, Y = y0 + j * step, c = [V[j][i], V[j][i + 1], V[j + 1][i + 1], V[j + 1][i]], P = [[X, Y], [X + step, Y], [X + step, Y + step], [X, Y + step]], pts = [];
      for (let e = 0; e < 4; e++) { const a = c[e], b = c[(e + 1) % 4]; if ((a < 0) !== (b < 0)) { const u = -a / (b - a), A = P[e], B = P[(e + 1) % 4]; pts.push([lerp(A[0], B[0], u), lerp(A[1], B[1], u)]); } }
      for (let q = 0; q + 1 < pts.length; q += 2) { const m = [(pts[q][0] + pts[q + 1][0]) / 2, (pts[q][1] + pts[q + 1][1]) / 2]; if (inPoly(m[0], m[1], M) && !inPoly(m[0], m[1], CB)) segs.push([pts[q], pts[q + 1]]); }
    }
    return (PB_FOLDS = segs);
  }
  // The prize, hanging from (0, 0) (the end of the line), in local px: r its size, fl the flare (0..1).
  // hang(r) = the centre's depth below the line's end.
  const AGI = {
    R0: 84, hang: r => r * .62 + 8, near: 1.05,   // (bigger than the other prizes were: a brain needs the size to read)
    // its light (drawn behind the three of them and the car, so none of it crosses a face: see bankHalf): short engraved
    // glints round it, breathing (long on the flare), and on the flare the C1b sparks crackling off its top
    sparks(r, t, fl) {
      const glow = .5 + .5 * Math.sin(t * 3.1), cy = r * .62 + 8;
      boilSeed('v2 agi glints');
      for (let i = 0; i < 14; i++) {
        const a = i / 14 * TAU + .1, e = .5 + .5 * Math.sin(t * 4.2 - i * 1.3), rx = r * 1.12, ry = r * .74, L = (13 + 9 * e * glow + 26 * fl) * (i % 2 ? .7 : 1);
        const x0 = Math.cos(a) * rx, y0 = cy + Math.sin(a) * ry, n = Math.hypot(Math.cos(a) / rx, Math.sin(a) / ry), nx = Math.cos(a) / rx / n, ny = Math.sin(a) / ry / n;
        _inkLine([[x0, y0], [x0 + nx * L, y0 + ny * L]], 1.4 + .8 * fl, mixCol(BKC.goldInk, BKC.gold, .4), 'rotring', 0);
      }
      if (fl > .05) for (let i = 0; i < 7; i++) {
        const a = -Math.PI * (.05 + .9 * hash(i * 3.1 + 7)), rr = r * (1.05 + .25 * hash(i * 5.7)), x = Math.cos(a) * rr, y = cy + Math.sin(a) * rr * .8, L = r * .5 * fl;
        _inkLine([[x, y], [x + Math.cos(a) * L * .4 + 5, y + Math.sin(a) * L * .4], [x + Math.cos(a) * L * .6 - 5, y + Math.sin(a) * L * .6], [x + Math.cos(a) * L, y + Math.sin(a) * L]], 2.6 * fl, '#D8A030', 'rotring', 0);
      }
    },
    draw(r, t, fl) {
      const sc = 2 * r / 990, P = ([x, y]) => [(x + 10) * sc, (y + 395) * sc + 8], cy = r * .62 + 8;
      boilSeed('v2 agi brain');
      piece(R4(-4, 0, 4, 10), BKC.chrome, { sw: 1, key: 'v2agiBclip' });
      bankLayer({ colour: 1, sat: 1, dens: 1.2 }, () => {
        const M = pbOutline().map(P);
        piece(M, '#E27A94', { sw: 2.4, shade: BKC.pinkDk, depth: r * .16, key: 'v2agiBm', maxTone: .46 });
        piece(curvy(PB.T.map(P), 5), '#C86A80', { sw: 1.6, shade: BKC.pinkDk, depth: r * .08, key: 'v2agiBt', maxTone: .46 });
        piece(curvy(PB.CB.map(P), 5), '#A8506A', { sw: 1.6, shade: '#5A2A34', depth: r * .07, key: 'v2agiBc', maxTone: .58 });
        for (let j = 0; j < 5; j++) { const y = 80 + j * 30; dline([[245 + j * 4, y], [340, y - 12 + j * 3], [452 - j * 8, y + 6]].map(P), 1, BANK.ink, .6); }
      });
      // its folds: the C1b brain's own sulci in miniature (chorus.js exports them), else the coarse stripes
      const CF = window.CHORUS && CHORUS.brainFolds ? CHORUS.brainFolds() : null;
      if (CF) { const T = []; for (const L of CF) { const Q = L.map(P); bankSwell(T, Q, Q.map(([, y]) => 1.3 + .9 * clamp((y - cy + r * .2) / (r * .9))), .3); } bankTris(T, mixCol(BANK.ink, '#6A1A34', .7)); }
      else {
        flushBrush();
        push(); stroke(mixCol(BANK.ink, '#6A1A34', .7)); strokeWeight(1.9); strokeCap(ROUND);
        for (const [a, b] of pbFolds()) { const A = P(a), B = P(b); line(A[0], A[1], B[0], B[1]); }
        pop();
      }
    },
  };
  // a burst of engraved light round the prize on "A-G-I"
  function agiBurst(cx, cy, r, fl) {
    if (fl < .04) return;
    boilSeed('v2 agi burst');
    for (let i = 0; i < 18; i++) { const a = i / 18 * TAU + .17, L0 = r * (1.35 + .2 * (1 - fl)), L1 = L0 + r * (i % 2 ? .35 : .7) * fl; _inkLine([[cx + Math.cos(a) * L0, cy + Math.sin(a) * L0], [cx + Math.cos(a) * L1, cy + Math.sin(a) * L1]], .6 + 1.5 * fl, BKC.burst, 'rotring', 0); }
  }
  // the bros' car: a long-bonneted open roadster in profile, facing right (layout px; X()/Y() carry and bounce it).
  // 'seats': the seat backs behind them; 'body': the body over their laps, the wheels, the chrome, the windscreen and
  // the steering wheel, and the rod: clamped to the front of the bonnet, a fishing rod (reel, guides) arcing up and back
  // over it, its tip over the prize.
  function bkCar(X, Y, t, part, rod) {
    const XY = ([x, y]) => [X(x), Y(y)];
    if (part === 'seats') {
      boilSeed('v2 bk seats');
      for (const sx of [178, 322, 464]) piece(curvy([[sx - 24, 734], [sx - 30, 664], [sx - 16, 640], [sx + 6, 646], [sx + 12, 700], [sx + 14, 734]].map(XY), 4), BKC.seat, { sw: 1.4, shade: BKC.seatDk, depth: 9, key: 'v2bkseat' + sx });
      return;
    }
    boilSeed('v2 bk car');
    const arch = (cx, r) => { const P = []; for (let i = 0; i <= 8; i++) { const a = lerp(-.1, -Math.PI + .1, i / 8); P.push([cx + Math.cos(a) * r, 848 + Math.sin(a) * r]); } return P; };
    const B = [[40, 776], [64, 742], [126, 724], [180, 717], [380, 720], [574, 714], [652, 703], [770, 698], [852, 708], [892, 731], [908, 764], [900, 798], [862, 818]].concat(arch(732, 82), [[300, 826]], arch(210, 82), [[106, 820], [58, 806]]);
    // (the body's engraving clipped to its outline, the outline's width kept: the flow lines bow as they run down its
    // length, and at the wheel arches and along the sills they spilled out past it)
    const BODY = curvy(B.map(XY), 5), BN = normalsOriented(BODY), BCLIP = BODY.map((p, i) => [p[0] + BN[i][0] * 2.5, p[1] + BN[i][1] * 2.5]);
    clipPush(BCLIP);
    try {
    piece(BODY, BKC.red, { sw: 2.2, shade: BKC.redDk, depth: 30, key: 'v2bkbody' });
    // the flowing wing line from the headlamp over both arches, the door, louvres, the chrome strip
    dline([[884, 742], [800, 736], [700, 748], [560, 762], [420, 766], [290, 754], [170, 750], [74, 772]].map(XY), 1.3, BANK.ink, .6);
    dline([[562, 718], [566, 812]].map(XY), 1.1, BANK.ink);
    for (let i = 0; i < 5; i++) dline([[690 + i * 18, 716], [682 + i * 18, 736]].map(XY), 1, BANK.ink);
    piece(ribbon([[300, 792], [560, 790], [640, 786]].map(XY), 5, 4), BKC.chrome, { sw: 1, key: 'v2bkstrip' });
    piece(ribbon([[516, 738], [542, 737]].map(XY), 5, 5), BKC.chrome, { sw: .9, key: 'v2bkhandle' });
    // chrome: the bumpers, the headlamp, the tailpipe
    piece(ribbon([[866, 816], [902, 804], [916, 780]].map(XY), 8, 6), BKC.chrome, { sw: 1.3, shade: BKC.chromeDk, depth: 3, key: 'v2bkbf' });
    piece(ribbon([[70, 812], [44, 798], [34, 776]].map(XY), 7, 5), BKC.chrome, { sw: 1.3, shade: BKC.chromeDk, depth: 3, key: 'v2bkbr' });
    piece(oval(X(880), Y(740), 8, 14, 0, 18), BKC.chrome, { sw: 1.3, shade: BKC.chromeDk, depth: 3, key: 'v2bklamp' });
    piece(ribbon([[128, 832], [62, 830]].map(XY), 8, 8), BKC.chrome, { sw: 1.1, key: 'v2bkpipe' });
    if (typeof BNO !== 'undefined') {   // (engraved coachwork: a double coachline, fine bonnet louvres, the hinge and its rivets,
      // the door's panel, flow lines along the body's curve, a guilloche badge on the bonnet side)
      const Bc = BNO.batch(), CL = [[884, 750], [800, 744], [700, 756], [560, 770], [420, 774], [290, 762], [170, 758], [84, 778]];
      Bc.line(BNO.spline(CL.map(XY), 4), .55); Bc.line(BNO.spline(CL.map(([x, y]) => XY([x, y + 4])), 4), .3);
      for (let k = 1; k <= 3; k++) Bc.line(BNO.spline(CL.slice(1, -1).map(([x, y]) => XY([x, y + 12 + k * 9])), 4), .28);
      for (let i = 0; i < 10; i++) { const x = 640 + i * 12; Bc.line([[x + 4, 720], [x - 2, 738]].map(XY), .45); Bc.line([[x + 6, 720], [x, 738]].map(XY), .25); }
      Bc.line([[580, 717], [848, 708]].map(XY), .4);
      for (let i = 0; i < 14; i++) { const u = i / 13, p = XY([lerp(590, 840, u), lerp(719, 711, u)]); Bc.line(BNO.ring(p[0], p[1], 1.3, 1.3, 6), .28); }
      Bc.line([[434, 732], [552, 726], [554, 802], [438, 806], [434, 732]].map(XY), .35);
      Bc.draw();
      guilloche(X(792), Y(776), 3, 11, { n: 6, lobes: 9, w: .35, col: BNO.ink(.9), steps: 120 });
    }
    } finally { clipPop(); }
    // the windscreen: low and raked, chrome-framed
    piece([[604, 646], [614, 643], [656, 701], [644, 704]].map(XY), BKC.glass, { sw: 1.3, key: 'v2bkscreen' });
    dline([[612, 652], [640, 692]].map(XY), .8, BANK.ink);
    // the steering wheel (edge-on) on its column
    dline([[586, 690], [616, 712]].map(XY), 2, BANK.ink);
    piece(oval(X(578), Y(680), 7, 30, -.45, 20), BKC.tyre, { sw: 1.2, key: 'v2bksw' });
    // the wheels: tyres, wire wheels (the spokes a blur), the spinners turning
    for (const [wx, wr] of [[210, 64], [732, 64]]) {
      const cx = X(wx), cy = Y(848), a0 = t * 11;
      piece(oval(cx, cy, wr, wr, 0, 36), BKC.tyre, { sw: 1.6, key: 'v2bkw' + wx });
      piece(oval(cx, cy, wr * .66, wr * .66, 0, 30), BKC.chrome, { sw: 1.1, key: 'v2bkwi' + wx });
      for (let k = 0; k < 16; k++) { const a = k / 16 * TAU; dline([[cx + Math.cos(a) * wr * .2, cy + Math.sin(a) * wr * .2], [cx + Math.cos(a + .5) * wr * .63, cy + Math.sin(a + .5) * wr * .63]], .6, BANK.ink); }
      for (let k = 0; k < 3; k++) { const q = a0 + k * .7; _inkLine([0, 1, 2, 3, 4].map(i => [cx + Math.cos(q + i * .12) * wr * (.78 + k * .07), cy + Math.sin(q + i * .12) * wr * (.78 + k * .07)]), .8, '#8A8A90', 'rotring', .3); }   // the tread's streaks
      if (typeof BNO !== 'undefined') {   // (engraved: the crossed lacing of a wire wheel, the tyre's walls)
        const Bw = BNO.batch();
        for (let k = 0; k < 16; k++) { const a = k / 16 * TAU + .1; Bw.line([[cx + Math.cos(a) * wr * .2, cy + Math.sin(a) * wr * .2], [cx + Math.cos(a - .5) * wr * .63, cy + Math.sin(a - .5) * wr * .63]], .3); }
        for (const f of [.72, .86, .94]) Bw.line(BNO.ring(cx, cy, wr * f, wr * f, 40), f > .9 ? .3 : .4);
        Bw.draw();
      }
      piece(oval(cx, cy, wr * .2, wr * .2, 0, 14), BKC.chrome, { sw: 1, key: 'v2bkwh' + wx });
      piece([-1, 1].map(s => [[cx + Math.cos(a0) * wr * .3 * s, cy + Math.sin(a0) * wr * .3 * s], [cx + Math.cos(a0 + .35 * s) * wr * .12 * s, cy + Math.sin(a0 + .35 * s) * wr * .12 * s]]).flat(), BKC.chromeDk, { sw: .9, key: 'v2bkspin' + wx });
    }
    // the rod: a clamp bolted to the front of the bonnet, the cane rod with its reel and guides, the line to its tip
    const [c0, c1, c2, tip] = rod, bz = u => [0, 1].map(d => Math.pow(1 - u, 3) * c0[d] + 3 * Math.pow(1 - u, 2) * u * c1[d] + 3 * (1 - u) * u * u * c2[d] + u * u * u * tip[d]);
    const RP = []; for (let i = 0; i <= 16; i++) RP.push(bz(i / 16));
    boilSeed('v2 bk rod');
    piece(ribbon(RP, 11, 3.6), BKC.cane, { sw: 1.3, shade: BKC.caneDk, depth: 3, key: 'v2bkrod' });
    for (const u of [.12, .2]) { const p = bz(u); piece(oval(p[0], p[1], 6.5, 3.5, 0, 12), BKC.chrome, { sw: .9, key: 'v2bkrr' + u }); }
    const G = [.42, .64, .84].map(bz); for (const [gx, gy] of G) piece(oval(gx, gy - 5, 3.2, 3.2, 0, 10), BKC.chrome, { sw: .8, key: 'v2bkguide' + gx });
    const rl = bz(.26), [rx, ry] = [rl[0] - 14, rl[1] + 4];
    piece(oval(rx, ry, 11, 11, 0, 20), BKC.chrome, { sw: 1.2, shade: BKC.chromeDk, depth: 3, key: 'v2bkreel' });
    const ca = t * 3; dline([[rx, ry], [rx + Math.cos(ca) * 9, ry + Math.sin(ca) * 9]], 1.6, BANK.ink); piece(oval(rx + Math.cos(ca) * 9, ry + Math.sin(ca) * 9, 2.6, 2.6, 0, 8), BKC.seatDk, { sw: .7, key: 'v2bkknob' });
    _inkLine([[rx, ry - 11]].concat(G.map(([x, y]) => [x, y - 5]), [tip]), .8, BKC.line, 'rotring', 0);
    piece(R4(c0[0] - 20, c0[1] - 2, c0[0] + 14, c0[1] + 6), BKC.chrome, { sw: 1.2, key: 'v2bkclamp' });
    piece(R4(c0[0] - 7, c0[1] - 16, c0[0] + 8, c0[1] + 2), BKC.chrome, { sw: 1.2, shade: BKC.chromeDk, depth: 3, key: 'v2bkclamp2' });
    for (const bx of [c0[0] - 15, c0[0] + 9]) piece(oval(bx, c0[1] + 2, 2.4, 2.4, 0, 8), BKC.chromeDk, { sw: .7, key: 'v2bkbolt' + bx });
  }
  // A strip of scenery sliding past at v px/s, repeating every P px: the offset to draw it at (at rest, inside a
  // translate by this). The bank look's ground doesn't redraw (the user), so a moving piece carries its own lines, like a
  // card piece sliding: the offset moves in whole screen pixels (the half is drawn at 1.1), and the strip's engraving
  // shifts rigidly with it instead of crawling through a still grid. It updates every frame (a travelling camera: on
  // ones; on twos the landscape juddered at 12 fps under a car moving on ones).
  const v2Slide = (t, v, P) => -Math.round(((t * v) % P) * 1.1) / 1.1;
  // The landscape as a note's vignette (bankorn.js), in layers at their own speeds: a guilloche band and microprint
  // across the top; engraved cumulus drifting and a far city on the horizon (a domed rotunda, a temple front, an obelisk,
  // cypresses), slow; on each hill ploughed furrows and a tree; along the road a stone parapet streaming past.
  function v2LandFar(t) {
    const B = BNO.batch();
    boilSeed('v2 land far');
    guillocheBand(-400, 1400, 104, 24, { n: 5, wl: 46, w: .5, col: mixCol(BANK.ink, '#A8843A', .45) });
    BNO.microBand(-400, 1400, 130, 8, { seed: 23 });
    B.line([[-400, 90], [1400, 90]], .8); B.line([[-400, 118], [1400, 118]], .4); B.line([[-400, 136], [1400, 136]], .4); B.draw();
    // clouds: pale billows, each with scalloped contour lines inside
    bankLayer({ cap: .45 }, () => {
      push(); translate(v2Slide(t, 60, 760), 0);   // (the clouds, one strip carrying its lines: v2Slide)
      for (let j = -1; j < 3; j++) {
        const cx = j * 760 + 300, cy = 300 + 60 * hash(j + 11), w2 = 150 + 50 * hash(j + 5);
        piece(curvy([[cx - w2, cy + 22], [cx - w2 * .55, cy - 26], [cx - w2 * .1, cy - 44], [cx + w2 * .4, cy - 30], [cx + w2, cy + 22], [cx, cy + 34]], 4), '#E6ECE8', { sw: .8, key: 'v2cl' + j });
        for (let r = 0; r < 3; r++) { const P = []; for (let k = 0; k <= 26; k++) { const u = k / 26, x = cx - w2 * (.78 - r * .2) + u * w2 * (1.56 - r * .4); P.push([x, cy + 14 - r * 11 - Math.abs(Math.sin(u * Math.PI * (4 - r))) * (12 - r * 3)]); } B.line(P, .35); }
      }
      B.draw(); pop();
      // the far city: repeating every 900, drifting at 50 px/s behind the hills (a strip: v2Slide)
      push(); translate(v2Slide(t, 50, 900), 0);
      for (let j = -1; j < 3; j++) {
        const x0 = j * 900, gy = 610;
        piece(curvy([[x0 - 100, gy + 30], [x0 + 150, gy - 36], [x0 + 460, gy - 22], [x0 + 800, gy - 44], [x0 + 1000, gy + 30]], 4), '#C9D2CC', { sw: .7, key: 'v2far' + j });
        // a rotunda: drum, colonnade, dome ribs, lantern
        const rx = x0 + 180, ry = gy - 40;
        piece(R4(rx - 44, ry - 40, rx + 44, ry), '#D8DED8', { sw: .7, key: 'v2rot' + j });
        piece(BNO.arc(rx, ry - 40, 40, Math.PI, TAU, 18, 34).concat([[rx + 40, ry - 40]]), '#D0D8D2', { sw: .7, key: 'v2dome' + j });
        for (let k = -3; k <= 3; k++) B.line([[rx + k * 12, ry - 2], [rx + k * 12, ry - 38]], .35);
        for (let k = -2; k <= 2; k++) B.line(BNO.arc(rx, ry - 40, 40 * Math.abs(Math.cos(k * .35)), Math.PI + .2, TAU - .2, 10, 34).map(([x, y]) => [x + k * 6, y]), .3);
        B.line([[rx - 6, ry - 74], [rx - 6, ry - 88], [rx + 6, ry - 88], [rx + 6, ry - 74]], .4); B.line([[rx, ry - 88], [rx, ry - 96]], .4);
        // a temple front
        const tx = x0 + 470, ty = gy - 28;
        piece([[tx - 60, ty - 34], [tx, ty - 58], [tx + 60, ty - 34]], '#D4DCD6', { sw: .6, key: 'v2tp' + j });
        for (let k = 0; k < 6; k++) B.line([[tx - 50 + k * 20, ty - 32], [tx - 50 + k * 20, ty]], .45);
        B.line([[tx - 62, ty - 34], [tx + 62, ty - 34]], .5); B.line([[tx - 66, ty + 2], [tx + 66, ty + 2]], .5);
        // an obelisk and cypresses
        const ox = x0 + 660; piece([[ox - 7, gy - 30], [ox - 4, gy - 110], [ox, gy - 118], [ox + 4, gy - 110], [ox + 7, gy - 30]], '#CCD4CE', { sw: .6, key: 'v2ob' + j });
        for (const cxp of [x0 + 580, x0 + 740, x0 + 760]) piece(curvy([[cxp, gy - 90], [cxp + 8, gy - 50], [cxp + 6, gy - 20], [cxp - 6, gy - 20], [cxp - 8, gy - 50]], 4), '#B4C2B8', { sw: .5, key: 'v2cy' + j + cxp });
      }
      B.draw(.85); pop();
    });
  }
  function v2Hill(hx, i) {
    const B = BNO.batch(), top = BNO.spline([[hx - 60, 700], [hx + 120, 560], [hx + 300, 600], [hx + 470, 700]], 8);
    for (let k = 1; k <= 6; k++) B.line(top.map(([x, y]) => [lerp(hx + 200, x, 1 - k * .07), y + k * 13]).filter(([, y]) => y < 696), .35);   // ploughed furrows
    B.draw(.9);
    if (i % 2) {   // a poplar
      const px = hx + 170, py = 572;
      piece(curvy([[px, py - 88], [px + 13, py - 50], [px + 10, py - 8], [px - 10, py - 8], [px - 13, py - 50]], 4), '#6E8A6E', { sw: .8, key: 'v2pop' + i });
      for (let k = 0; k < 7; k++) B.line([[px - 9 + k * .5, py - 16 - k * 10], [px, py - 22 - k * 10], [px + 9 - k * .5, py - 16 - k * 10]], .35);
    } else {   // a round tree
      const px = hx + 260, py = 578;
      piece(R4(px - 3, py - 20, px + 3, py + 8), '#6E5A40', { sw: .6, key: 'v2trk' + i });
      piece(curvy(oval(px, py - 40, 30, 26, 0, 10).map(([x, y], k) => [x + 3 * Math.sin(k * 2.3), y + 3 * Math.cos(k * 1.7)]), 4), '#7A9474', { sw: .8, key: 'v2tr' + i });
      for (let r = 0; r < 3; r++) B.line(BNO.arc(px + 4, py - 40 + r * 7, 22 - r * 5, .1, Math.PI * .9, 10, 16 - r * 4), .35);
    }
    B.draw();
  }
  function v2LandNear(t, off) {
    const B = BNO.batch();
    boilSeed('v2 land near');
    // a low stone parapet along the far side of the road: coping, blocks, a bead under the coping
    B.line([[-400, 672], [1400, 672]], .6); B.line([[-400, 678], [1400, 678]], .35); B.line([[-400, 690], [1400, 690]], .5);
    B.draw();
    push(); translate(v2Slide(t, 828, 96), 0);   // (its blocks stream past as one strip: v2Slide)
    for (let i = 0; i < 20; i++) { const x = i * 96 - 400; B.line([[x, 678], [x, 690]], .45); B.line([[x + 48, 684], [x + 48, 690]], .3); }
    B.draw(); pop();
  }
  // the bank half: a banknote landscape rushing past, the bros' roadster, the AGI dangled from their own bonnet.
  // World = screen for the half (x 0..960); the car roars in from the left and bounces along, the prize just out of reach.
  function bankHalf(t) {
    look('bank'); Object.assign(BANK, BANK_TEAL); BANK.dens = 1.4;
    const off = t * 900, tt = mt(t);
    push(); translate(900, 915); scale(1.1); translate(-900, -915);   // (framed in on the car, the nose kept clear of the tear)
    boilSeed('v2 bk ground');
    // the car roars in from the left, then bounces along the road
    const inK = easeOut(seg(t, TG.smear[1] - .35, TG.smear[1] + .3)), dx = lerp(-1100, 0, inK), by = bkBy(t);
    const X = x => x + dx, Y = y => y - by;
    const fl = agiFlare(t);
    // the rod, flexing with the bounce (lagging the car), lifting on the flare; the prize at the end of its line
    const flex = 1.6 * (by - bkBy(t - .07)) - 14 * fl, tip = [X(760), Y(404) + flex];
    const rod = [[X(858), Y(706)], [X(880), Y(540)], [X(852), Y(390)], tip];
    const K = AGI, R0 = K.R0 || 70, r = R0 * (1 + .4 * fl), sw = agiSwing(t), L0 = 92, Ll = L0 - 14 * fl;
    const A = [tip[0] + Math.sin(sw) * Ll, tip[1] + Math.cos(sw) * Ll], hang = K.hang(r), pc = [A[0] + Math.sin(sw) * hang, A[1] + Math.cos(sw) * hang];
    // the bros, seated, leaning in at it, eyes on it: Zuck at the back, Altman, Musk at the wheel (mouths shut: they don't
    // sing, so Altman's awe is in his eyes and Musk lunges through gritted teeth). On each grab Musk half
    // rises out of his seat and lunges (lean, lift), his glove stopping a hand short of where the prize hangs at rest
    // (it swings away as he gets there): the prize stays one arm's length ahead.
    const MU = 21 * MK_S, mx = X(530), my = Y(830), LEAN1 = .2, LIFT1 = -1.1;
    const edge = [X(760) - R0 * K.near - 4, Y(404) + L0 + K.hang(R0)];
    const G = muskGrab(t, (() => { const wx = edge[0] - 1.4 * 1.25 * MU, wy = edge[1] + 8, ddx = wx - mx, ddy = wy - (my + LIFT1 * 1.2 * MU), c = Math.cos(-LEAN1), s = Math.sin(-LEAN1); return [(ddx * c - ddy * s) / MU - .35, (ddx * s + ddy * c) / MU, .12, 'open', 1, -.1]; })());
    const leanM = .05 + (LEAN1 - .05) * G.k + .05 * fl, leanA = .1 + .08 * fl, leanZ = .08 + .06 * fl;
    const grabbing = GRABS.some(g => t > g - .15 && t < g + .4), mF = feel('excited', tt, { seed: 7 });
    const mO = { ...mF, dy: (mF.dy || 0) + LIFT1 * G.k, view: 'q', seated: true, pose: { L: [1.6, -7.2, .3, 'fist', 1, -1.2], R: G.R }, mouth: grabbing ? 'grimace' : 'grin', emote: null, rot: leanM, lookX: .9, lookY: -.05, boilKey: 'v2mk', noShadow: true, rim: null };
    const aO = { ...feel('starstruck', tt, { seed: 3 }), mouth: 'smile', view: 'q', seated: true, pose: { L: [1.2, -6.4, .4, 'relax', 1, -.3], R: [2.0, -6.8, .4, 'relax', 1, -.5] }, emote: null, rot: leanA, lookX: .9, lookY: .05, boilKey: 'v2alt', noShadow: true, rim: null };
    const zO = { ...feel('neutral', tt, { seed: 5 }), view: 'q', seated: true, pose: { L: [-3.2, -3.85, .1, 'relax'], R: [2.9, -7.1, .3, 'fist', 1] }, emote: null, rot: leanZ, lookX: .9, lookY: -.05, boilKey: 'v2zk', noShadow: true };
    // (bank) vignettes round the three of them: the paper's and the landscape's lines end on them (up to bankVignetteEnd).
    // Each from its pose (figHalo, V2G_HALO), so Musk's goes with him as he rises and lunges on a grab and the leans carry
    // theirs; placed on the car's line without the road's bounce (y, not Y(y)), so the ground's line ends hold still under it.
    bankVignette([figHalo('zuck', X(236), 814, 23, zO, V2G_HALO.zuck), figHalo('altman', X(380), 822, 22, aO, V2G_HALO.altman), figHalo('musk', mx, 830, 21, mO, V2G_HALO.musk)]);
    bankPaper(-400, -200, 2000, 1400, {});
    waveLines(R4(-400, -200, 1400, 600), 7, 0, .9, 240, BANK.ink, .5);
    // a plain engraved sun, small and pale (the prize is the only medallion in the frame)
    const sunC = mixCol(BANK.ink, BANK.paper, .45);
    const SX = 250, SY = 250;
    for (let i = 0; i < 20; i++) { const a = i / 20 * TAU, L1 = i % 2 ? 60 : 76; _inkLine([[SX + Math.cos(a) * 44, SY + Math.sin(a) * 44], [SX + Math.cos(a) * L1, SY + Math.sin(a) * L1]], 1, sunC, 'rotring', 0); }
    waveLines(oval(SX, SY, 34, 34, 0, 28), 5, 0, .6, 200, sunC, .7);
    _inkLine(closed(oval(SX, SY, 34, 34, 0, 40)), 1.2, sunC, 'rotring', .3);
    const orn = typeof BNO !== 'undefined';
    if (orn) v2LandFar(t);   // (engraved clouds and a far city on the horizon, slower: bankorn.js)
    // (the hills slide past as one strip carrying its own lines, v2Slide; its period two hills, a poplar and a round tree,
    // so the wrap is seamless: at one hill it swapped every tree's kind)
    push(); translate(v2Slide(t, 140, 1040), 0);
    for (let i = -1; i < 5; i++) { const hx = i * 520; piece(curvy([[hx - 60, 700], [hx + 120, 560], [hx + 300, 600], [hx + 470, 700]], 5), '#8EA496', { sw: 1, key: 'v2bkh' + i }); if (orn) v2Hill(hx, i); }
    pop();
    piece(R4(-400, 690, 1400, 1400), '#A89C80', { sw: 1.1, key: 'v2bkrd' });
    if (orn) v2LandNear(t, off);
    push(); translate(v2Slide(t, 900, 260), 0); for (let i = 0; i < 8; i++) { const x = i * 260 - 400; dline([[x, 930], [x + 130, 930]], 2.4, BANK.ink); } pop();   // (the road's dashes)
    // (the speed lines are gone: a dozen fine rules streaking across the sky at 1170 px/s read as "weird lines like wind
    // causing shimmer"; the landscape sliding by and his flying hair carry the speed)
    bankVignetteEnd();   // (the landscape ends: the car and the three of them over bare paper)
    // the prize's light (its glints, the flare's sparks and the burst), behind the car and the three of them: drawn over
    // them, its gold lines crossed Musk's face, one straight through his eyes
    push(); translate(A[0], A[1]); rotate(-sw); K.sparks(r, t, fl); pop();
    agiBurst(pc[0], pc[1], r, fl);
    // exhaust from the tailpipe (behind the car)
    for (let i = 0; i < 4; i++) { const a = frac(t * 2.4 + i / 4); piece(stBillowPts(X(60) - 240 * a, Y(830) - 50 * a, 14 + 40 * a, i * 5 + Math.floor(t * 2.4 + i / 4), a), '#B8B2A6', { sw: .9, key: 'v2bkex' + i }); }
    bkCar(X, Y, t, 'seats');
    zuck(X(236), Y(814), 23, zO);
    altman(X(380), Y(822), 22, { ...aO, layer: 'back' });
    musk(mx, my, 21, { ...mO, layer: 'back' });
    bankLayer({ figAlong: 1 }, () => bankFigure(() => bkCar(X, Y, t, 'body', rod)));   // (the roadster: the shot's other subject, engraved in flow lines down its length)
    altman(X(380), Y(822), 22, { ...aO, layer: 'front' });
    musk(mx, my, 21, { ...mO, layer: 'front' });
    // the line and the prize
    boilSeed('v2 agi line');
    _inkLine([tip, A], .9, BKC.line, 'rotring', 0);
    push(); translate(A[0], A[1]); rotate(-sw); K.draw(r, t, fl); flushBrush(); pop();
    pop();
    Object.assign(BANK, CP_B0);
  }
  // the card half: the surgery. He arrives sooty from the street ("Ugh"); a look across at the bros; on hold to the
  // surgery, he watches the board: the tickets go one a beat, the last on "appointments"; the hatch shuts on "taken";
  // "What?!"; he looks at the phone and shoves it at us: 08:03
  // Who mouths what: he sings his lines, but "All appointments taken" is the surgery's recorded message in his ear (no one
  // on screen says it): he listens, mouth shut, and comes back in on "What?!"
  const V2G_HIM_LIPS = typeof lipPart === 'function' ? lipPart('v2g him', (l, i) => l.text === 'Ugh' || l.text.startsWith("You're chasing") || (l.text.startsWith('"All appointments') && i >= 3)) : 'M';
  const V2G_COAT = { coat: '#B89030', coatDk: '#7E6018', coatLt: '#D4B060', fur: '#6E665C' };   // (his parka, sooty from the street)
  function cardHalf(t) {
    look('card');
    const tt = mt(t), T0 = TG.smear[0];
    surgeryBack(tt); apptBoard(tt); surgeryHatch(tt); consultRoom(tt);
    // the standing queue (demo/cast/crowd.js): it shuffles up as the first tickets go (the served walk off, out of the
    // half-frame), and gives up when the shutter comes down
    crowdSurgery(tt, HATCH.x0 - 50, SG.floorY + 6, { steps: TG.tickets.slice(0, 3), closed: TG.shut, exitX: 1245 });
    waitingRow(tt);
    const he = emotions(tt, [[T0, 'disgusted', { emote: null }], [TG.look, 'bored', { emote: null }], [TG.phone[0], 'nervous', { emote: null }], [TG.tickets[5] + .1, 'confused', { emote: null }], [TG.what, 'surprised', { emote: '!!' }], [TG.look2, 'furious', { emote: null }]], { take: .8 });
    const cough = Math.max(0, Math.sin(Math.PI * seg(tt, TG.ugh - .05, TG.ugh + .3)));
    const ph = ease(seg(tt, TG.phone[0], TG.phone[1])), jerk = tt > TG.what ? Math.exp(-(tt - TG.what) * 6) : 0, look2 = ease(seg(tt, TG.look2, TG.thrust[0]));
    const hx = 640, hy = 1040, u = 50;
    // the right hand: a cough and a wave of the smoke; brought down to his side over three drawings before he turns to look
    // across (it dropped from his face to his side in one drawing, on the turn)
    const drop = ease(seg(tt, TG.look - .25, TG.look)), FACE = [.25, -.6 + .3 * cough, .5], SIDE = [1.1, 3, .06];
    const R = drop <= 0 ? [...FACE, 'open', 1, -2.2] : tt <= TG.look ? [lerp(FACE[0], SIDE[0], drop), lerp(FACE[1], SIDE[1], drop), lerp(FACE[2], SIDE[2], drop), drop < .5 ? 'open' : 'relax', 1] : [...SIDE, 'relax'];
    // the phone in his other hand, up to his ear (3/4: the ear he shows is at the back of his head, so the hand on that
    // side; it used to be pressed to his forehead): body units. Yanked off it on "What?!", brought down and round (under his
    // chin, not across his face) to read it, and shoved at us from there
    // (at his ear: the elbow down on his chest, the forearm up his jaw, the phone's back to us, its top at the ear)
    const HANG = [-3.3, -4.6], EAR = [-.6, -8.7], READ = [1.9, -7.3];
    const L = tt < TG.phone[0] - .1 ? [-1.1, 3, .06, 'relax'] : [lerp(lerp(HANG[0], EAR[0], ph), READ[0], look2) - .9 * jerk, lerp(lerp(HANG[1], EAR[1], ph), READ[1], look2) + 2 * Math.sin(Math.PI * look2) + .4 * jerk, .3, 'hold', 1, lerp(lerp(-.4, -1.95, ph), -1.25, look2) - .5 * jerk, 'u'];
    const leanB = tt > TG.tickets[0] && tt < TG.what ? .06 * Math.sin(Math.PI * clamp((tt - TG.tickets[0]) / 2)) : 0;
    // (from the shove on, that arm, its hand and the phone are drawn in screen space, coming at the lens (splitScene:
    // v2Shove): the rig's own arm is tucked away behind his coat)
    const shoving = tt >= TG.thrust[0];
    person(hx, hy, u, shoving ? HIM_BACKARMS : HIM_C, { ...he, view: 'q', pose: { L: shoving ? [-1, -3.2, 0, 'none', 0, null, 'u'] : L, R }, holdL: tt >= TG.phone[0] - .1 && !shoving ? v2HoldPhone : undefined,
      lookX: tt > TG.look && tt < TG.lookBack ? .9 : .85, lookY: tt > TG.look2 ? .4 : tt > TG.phone[0] ? -.35 : tt > TG.look && tt < TG.lookBack ? .1 : 0, rot: leanB, flip: tt > TG.look && tt < TG.lookBack,
      col: V2G_COAT, boilKey: 'v2himG', sing: V2G_HIM_LIPS });
    // that arm as the rig has it at READ (in screen px), for the shove to take over from: the shoulder (the near arm's root
    // in 3/4), the elbow (the rig's IK), the wrist; the hand's angle and size, and a body unit
    let arm = null;
    if (shoving) {
      const q = .5 * ((he.sq || 0) + (he.take || 0)), c = Math.cos(leanB), sn = Math.sin(leanB);
      const B = ([bx, by]) => { bx *= 1 + q * .5; by *= 1 - q; return toScreen(hx + (he.dx || 0) * u + (bx * c - by * sn) * u, hy + (he.dy || 0) * 1.1 * u + (bx * sn + by * c) * u); };
      const root = [-2.1, -8.04], tip = [L[0], L[1]];
      arm = { sh: B(root), el: B(ppReach(root, tip, HIM_C.body.arm, L[2], -1, ppElbowArc(-1, true))[1]), tip: B(tip), ang: L[5] + leanB, s: HIM_C.body.hand * u * CAM.zoom, u: u * CAM.zoom };
    }
    // hold music from the phone
    if (tt > TG.phone[1] && tt < TG.what) { boilSeed('v2 hold'); emote('music', hx + 190, hy - 12 * u, 22, 1, tt); }
    // the last of the exhaust coughed out (his coat is the sooty colour; the face smudges are gone: they were placed from
    // his head at rest, so they floated in front of his face whenever he turned or leant)
    const Fr = personFrame(HIM_C, { view: 'q' }), headY = hy + Fr.hy * u, headX = hx + Fr.hx * u;
    boilSeed('v2 soot');
    // (waved off by his hand and gone by the time he turns: placed off his face at rest, they sat at the back of his head
    // once he'd turned, a pompom on his beanie)
    const ca = tt - TG.ugh, gone = TG.look - TG.ugh;
    if (ca > -.05 && ca < gone) for (let i = 0; i < 3; i++) { const a = ca - i * .1; if (a < 0) continue; const r = (10 + 44 * Math.sqrt(a)) * (1 - seg(ca, gone - .2, gone)); if (r > 2) piece(stBillowPts(headX + 70 + 180 * a + i * 20, headY + 30 - 80 * a, r, i * 7 + 2, a), '#2A2F4A', { ink: null, key: 'v2cough' + i, lift: 2, flatCard: true }); }
    return { arm };
  }
  // the split: bank | card, a torn edge between them; it closes (the card half takes the frame) for the clipboard
  function splitScene(t) {
    const k = ease(seg(t, TG.close[0], TG.close[1])), sx = lerp(960, -140, k);
    const hc = lerp(1440, 960, k);   // the card half's centre on screen
    const wcx = lerp(700, 1000, k), wcy = lerp(560, 540, k), z = lerp(.94, .96, k) + .05 * ease(seg(t, TG.tickets[3], TG.what));
    const edge = []; for (let i = 0; i <= 24; i++) { const y = -20 + i * (H + 40) / 24; edge.push([sx + 10 * Math.sin(i * 1.7) + 7 * hash(i + 3), y]); }
    if (sx > -100) v2Clip([[-20, -20]].concat(edge, [[-20, H + 20]]), () => { camBegin(960 + (960 - sx), 540, 1); bankHalf(t); camEnd(); });
    let ch = null; v2Clip([[W + 20, -20]].concat(edge, [[W + 20, H + 20]]), () => { camBegin(wcx - (hc - 960) / z, wcy, z); ch = cardHalf(t); camEnd(); });
    if (sx > -100) { look('card'); boilSeed('v2 tear'); piece(ribbon(edge.map(([x, y]) => [x + 2, y]), 14, 14), '#F2EEE2', { ink: null, key: 'v2tear', lift: 6, flatCard: true, edge: false }); dline(edge.map(([x, y], i) => [x - 4 + 3 * Math.sin(i * 2.9), y]), 1, '#9A9488'); }
    // the phone, shoved at us: 08:03
    if (ch && ch.arm) v2Shove(t, ch.arm);
  }
  // The shove (screen px): his hand brings the phone from under his chin at the lens, in perspective (the size goes as
  // one over the distance, so it grows slowly, then fast, and stops at arm's length: a move toward us, not a pop), and
  // turns its screen to us as it comes. Taking over from the rig (A: its arm at READ), his arm reaches after it, the sleeve
  // widening toward us; the hand holds the phone's end while its back is to us, then (turned) grips it from behind, the
  // thumb over one side and the fingertips over the other. Then held up at us through the long "three": creeping closer,
  // shaking with it. (It used to jump from hand-size to giant in two frames, alone in the air.)
  function v2Shove(t, A) {
    look('card');
    const k = seg(t, TG.thrust[0], TG.thrust[1]), e = 1 - Math.pow(1 - k, 2.2), turnK = ease(seg(k, 0, .7));
    const hold = ease(seg(t, TG.thrust[1], CUT.h)), shk = seg(t, TG.thrust[1], CUT.h) * 5 * Math.sin(t * 31) * Math.sin(t * 7.3);
    const h0 = 1.4 * A.s, h1 = 780 * (1 + .07 * hold), D = h1 / h0, dd = lerp(1, 1 / D, e), sc = 1 / dd, h = h0 * sc, sH = h / 1.4;
    // (the phone's centre in the rig's hand: its wrist .08 u out from the arm's tip, the phone 1.4 hands on along it)
    const wr0 = [A.tip[0] + Math.cos(A.ang) * .08 * A.u, A.tip[1] + Math.sin(A.ang) * .08 * A.u], pc0 = [wr0[0] + Math.cos(A.ang) * h0, wr0[1] + Math.sin(A.ang) * h0];
    const o0 = [pc0[0] - W / 2, pc0[1] - H / 2], o1 = [shk, 470 - 18 * hold - H / 2];   // (screen offsets from the lens axis: perspective)
    const pc = [W / 2 + lerp(o0[0], o1[0] / D, e) / dd, H / 2 + lerp(o0[1], o1[1] / D, e) / dd];
    const rot = lerp(A.ang + Math.PI / 2, -.05 + .02 * Math.sin(t * 7), turnK), asp = lerp(1 / 1.4, .56, e), w = asp * h;
    const face = lerp(-1, 1, ease(seg(t, TG.thrust[0], TG.thrust[0] + .09))), turned = face >= 0;   // (its back as it comes off his chest)
    const P = ([x, y]) => [pc[0] + x * Math.cos(rot) - y * Math.sin(rot), pc[1] + x * Math.sin(rot) + y * Math.cos(rot)];
    const wr = turned ? P([0, .58 * h]) : P([0, h]), b = HIM_C.body, sk = HIM_C.col.skin, skD = HIM_C.col.skinDk, sw = clamp(A.u * Math.sqrt(sc) / 20, .55, 2.2);
    // his arm, reaching after it: shoulder, elbow (straightening toward the line to the wrist), wrist; the sleeve widens toward
    // us (behind the phone once it's turned)
    const el = [lerp(A.el[0], lerp(A.sh[0], wr[0], .42), e), lerp(A.el[1], lerp(A.sh[1], wr[1], .42), e)];
    const wW = Math.min(b.wrist * A.u * sc, turned ? .62 * w : Infinity);
    boilSeed('v2 shove arm');
    const r = limb([A.sh, el, wr], b.armW * A.u, wW, V2G_COAT.coat, { sw, shade: V2G_COAT.coatDk, key: 'v2sva' });
    const ca = Math.atan2(wr[1] - el[1], wr[0] - el[0]), cw = wW * 1.02;
    piece(ppBar([wr[0] - Math.cos(ca) * .3 * cw, wr[1] - Math.sin(ca) * .3 * cw], [wr[0] + Math.cos(ca) * .04 * cw, wr[1] + Math.sin(ca) * .04 * cw], cw, cw * 1.04), HIM_C.col.cuff || V2G_COAT.coatDk, { sw, key: 'v2svc', lift: 2 });
    const digits = seg(t, TG.digits, TG.digits + .25);
    if (!turned) {   // the rig's grip: the hand at its end, the phone up out of it (its back to us)
      hand(wr[0], wr[1], rot - Math.PI / 2, sH, { pose: 'hold', col: sk, sw, mirror: true, key: 'v2svh', maxTone: .45, hold: s => { push(); translate(.55 * s, 0); rotate(Math.PI / 2); bigPhone(h, digits, face, asp); pop(); } });
      return;
    }
    // the hand behind it, holding its lower half (at arm's length toward us it's a little wider than the phone: its edges
    // show either side); then the phone; then the thumb round its right side and up its face by the edge, and the
    // fingertips curled round its left
    boilSeed('v2 shove grip');
    piece(b2RoundPoly(R4(-w / 2 - .05 * h, .04 * h, w / 2 + .06 * h, .64 * h), .14 * h).map(P), sk, { sw, shade: skD, depth: .02 * h, key: 'v2svp', lift: 2, maxTone: .45 });
    push(); translate(pc[0], pc[1]); rotate(rot); bigPhone(h, digits, face, asp); pop();
    boilSeed('v2 shove fingers');
    piece(ppBar(P([w / 2 + .045 * h, .3 * h]), P([w / 2 - .07 * h, .15 * h]), .09 * h, .072 * h), sk, { sw, shade: skD, depth: .012 * h, key: 'v2svt', lift: 2, maxTone: .45 });
    [.12, .2, .28].forEach((y, i) => piece(ppBar(P([-w / 2 - .04 * h, y * h]), P([-w / 2 + .03 * h, (y + .005) * h]), .066 * h, .058 * h), sk, { sw, shade: skD, depth: .01 * h, key: 'v2svf' + i, lift: 2, maxTone: .45 }));
  }
  // the exhaust's toner smeared off the frame to the left, streaks dragged behind it
  function smear(t) {
    const p = seg(t, TG.smear[0], TG.smear[1]), X = lerp(W + 60, -560, easeOut(p));
    if (p >= 1) return;
    look('xerox'); Object.assign(CPC, CPC_R);
    XEROX.cell = CP_X0.cell + Math.min(3, .34 * v2Roar(TG.smear[0]).gen);   // (the last copy's dots (cpGeneration's), so the exhaust's screen carries on across the handoff; its grit and inks as before)
    boilSeed('v2 smear');
    const E = []; for (let i = 0; i <= 30; i++) { const y = -40 + i * (H + 80) / 30; E.push([X + 70 * Math.sin(i * 1.3 + 2) + 50 * hash(i * 3.1) + (y - 540) * .25, y]); }
    cpXeroxDraw(() => {
      piece([[-200, -40]].concat(E, [[-200, H + 40]]), CPC.exh, { ink: null, key: 'v2sm', spot: null });
      v2Clip([[-200, -40]].concat(E, [[-200, H + 40]]), () => exhaustDrift(t, -760));   // (the drift carries on in the toner as it's wiped off)
      for (let i = 0; i < 26; i++) { const y = hash(i * 3.7) * H, e = E[Math.round((y + 40) / ((H + 80) / 30))][0], len = (80 + 520 * Math.pow(hash(i * 1.9), 2)) * (1 - p * .5), th = 3 + 12 * hash(i * 5.1); piece(R4(e - 10, y, e + len, y + th), CPC.exh, { ink: null, key: 'v2sms' + i, spot: null }); }
    });
    xeroxGrit(t, .6 * (1 - p));
    Object.assign(XEROX, CP_X0);
  }
  function sceneG(t) {
    splitScene(t);
    smear(t);
  }
  // ================================================================================================================
  // H: "Here's a prompt. No jailbreak. No elaborate attack: 'Less of the sales pitch. Give me my fucking life back.'"
  // ================================================================================================================
  const TH = {
    crack: [124.34, 124.62], type: [124.62, 126.7], enter: 126.76, grin: 127.1,
    pour: [127.24, 128.95], swat: [127.5, 127.72, 128.1, 128.56], sees: 129.0, grab: 129.26, ok: 129.32, take: 129.64, free: 129.98, hold: 130.08, show: [130.26, 130.62],
  };   // (sees: Clawd sees he's had enough; grab: "Give", he reaches for the screen; ok: Clawd taps the checkout, which lets
  // the card out to him; take: "my", his hands close on it; free: "fucking", he snatches it; hold: the card's clear of the
  // screen and he has it up in front of him, a hand each side)
  // (the laptop at its real size, the user: "if so it's giant!": its screen was the size of his torso; now a little
  // narrower than his shoulders. The camera frames closer instead, and everything on the screen scales with it: LS)
  const LS = .62, LAP = { x: 1050, y: 712, box: [1050, 905, 300] };   // the laptop's hinge (centre) on the box top; the box
  const HXH = 780;   // his seat on the bed here (the laptop and he are drawn in, so he types on its keys, leaning in: at arm's length he jabbed the screen)
  // The laptop is turned three-quarters to him (a screen faces its user: square to the camera, it faced us while he typed
  // from its left): its screen a parallelogram, its far (left) end a third narrower and raised, the lid leaning back a
  // little; the deck runs from the hinge toward him. What the screen shows is laid out in a flat frame (lapScreen: the
  // screen square on, world px) and mapped onto the turned screen (LAPT: lapP maps a point, LAPT.m is the matrix, as
  // present.js's prSurface does), so we still read it, foreshortened.
  function lapScreen() { const hx = LAP.x, hy = LAP.y, w = 330 * LS, h = 220 * LS; return [[hx - w / 2, hy - h], [hx + w / 2, hy - h], [hx + w / 2, hy], [hx - w / 2, hy]]; }
  const LAPT = (() => {
    const [tl, tr, , bl] = lapScreen(), w = tr[0] - tl[0], h = bl[1] - tl[1], turn = .6;   // (cos of the turn: about 53 degrees)
    const o = [tr[0] - w * turn, bl[1] - 22], u = [w * turn, 28], v = [8, -h * .97], a = u[0] / w, b = u[1] / w, c = -v[0] / h, d = -v[1] / h;
    const m = [a, b, c, d, o[0] - a * bl[0] - c * bl[1], o[1] - b * bl[0] - d * bl[1]];
    return { m, o, u, v, deck: [-104, 36] };
  })();
  const lapP = ([x, y], k = 1) => { const [a, b, c, d, e, f] = LAPT.m; return [lerp(x, a * x + c * y + e, k), lerp(y, b * x + d * y + f, k)]; };   // (k: how far into the screen's plane)
  const LAP_TERM = Q => [Q[3][0] + 58 * LS, Q[3][1] - 12 * LS, 92 * LS];   // the checkout on the screen: bottom centre, height
  // Holding it up to us (the user: his arms read "completely detached"): he turns to us with the card held in front of
  // his chest, just under his chin, and it comes toward the camera as he lifts it (so it grows: SHOW.w against its 155 in
  // his hands at the laptop). His arms hang from the shoulders to elbows bent beside the card, the forearms come forward
  // and up to its sides (foreshortened: toward us) and the hands grip its edges, thumbs over its face, fingers behind.
  // SHOW: its centre and width (world), and the camera that frames it (V2_LIFE is this card on screen).
  const SHOW = { x: 780, y: 590, w: 250, cam: [780, 545, 2.2] };
  const HIM_BACKARMS = { ...HIM_C, top: { ...HIM_C.top, armsFront: false } };   // (the rig's own arms tucked behind his coat: sceneH draws them)
  let V2H_NOCARD = false;   // (V2_LIFE.behind: sceneH without the card he holds up, or the arms and hands that hold it)
  // the screen: the chat, his prompt going up; the checkout (a card terminal) in the corner holding the card of his
  // life; Clawd, the chatbot
  function lapContent(t, Q, clawdFn, termState) {
    const [tl, tr, br, bl] = Q, cx = (tl[0] + tr[0] + br[0] + bl[0]) / 4;
    boilSeed('v2 lap scr');
    piece(Q, '#E8EEF4', { ink: null, key: 'v2lscr', lift: 0, flatCard: true, edge: false });
    piece([tl, tr, [tr[0], tr[1] + 22 * LS], [tl[0], tl[1] + 22 * LS]], '#C9713E', { ink: null, key: 'v2lbar', lift: 0, flatCard: true, edge: false });
    const typed = seg(t, TH.type[0], TH.type[1]), sent = ease(seg(t, TH.enter, TH.enter + .3)), L = LS;
    const by = lerp(br[1] - 30 * L, tr[1] + 60 * L, sent), bw = (40 + 120 * typed) * L;
    if (typed > 0) { piece(b2RoundPoly(R4(br[0] - 20 * L - bw, by - 15 * L, br[0] - 20 * L, by + 15 * L), 12 * L), '#5E8AC8', { ink: null, key: 'v2lpb', lift: 0, flatCard: true, edge: false }); dline([[br[0] - 12 * L - bw, by], [br[0] - 30 * L, by]], 2 * L, '#F4F8FF'); }
    if (clawdFn) clawdFn(cx + 50 * L, br[1] + 8 * L);
    const [tx, ty, ts] = LAP_TERM(Q); v2Terminal(tx, ty, ts, termState, t, 'v2lt', 0);
  }
  // the card of his life: a cut-out picture, 16:9 (w wide), centred (0, 0) in the current transform. A sunny day: the
  // two of them on a hill, laughing, a kite up, the sun out. (Time.)
  function lifeCard(w, key = 'v2life') {
    const h = w * 9 / 16, s = w / 960, S = P => P.map(([x, y]) => [x * s, y * s]), sw = clamp(1.4 * s * 1.6, .7, 1.8);
    piece(b2RoundPoly(R4(-w / 2, -h / 2, w / 2, h / 2), 10 * s), '#F4EFE2', { sw: sw * 1.2, key: key + 'bk', lift: 6 });
    const m = 16 * s, F = R4(-w / 2 + m, -h / 2 + m, w / 2 - m, h / 2 - m);
    clipPoly(F, () => {   // (the picture inside its cream border: the sun's rays reach into it)
    piece(F, '#8EC8EA', { ink: null, key: key + 'sky', lift: 0, flatCard: true, edge: false });
    piece(S(oval(300, -150, 70, 70, 0, 28)), '#F6D04A', { sw: sw * .8, key: key + 'sun', lift: 2, flatCard: true });
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; piece(S(ribbon([[300 + Math.cos(a) * 90, -150 + Math.sin(a) * 90], [300 + Math.cos(a) * 118, -150 + Math.sin(a) * 118]], 10, 5)), '#F6D04A', { ink: null, key: key + 'ray' + i, lift: 1, flatCard: true }); }
    for (const [x, y, k] of [[-300, -160, 1], [-60, -190, .8]]) piece(S(curvy([[x - 70 * k, y + 20], [x - 40 * k, y - 20], [x + 10 * k, y - 34], [x + 60 * k, y - 16], [x + 80 * k, y + 20]], 4)), '#FFFFFF', { sw: sw * .7, key: key + 'cl' + x, lift: 2, flatCard: true });
    piece(S(curvy([[-460, 130], [-250, 20], [60, 40], [300, 90], [460, 60], [460, 250], [-460, 250]], 5)).map(([x, y]) => [clamp(x, F[0][0], F[1][0]), Math.min(y, F[2][1])]), '#7DBA5A', { sw: sw, key: key + 'hill', lift: 3 });
    piece(S(curvy([[-460, 200], [-100, 150], [200, 180], [460, 150], [460, 250], [-460, 250]], 5)).map(([x, y]) => [clamp(x, F[0][0], F[1][0]), Math.min(y, F[2][1])]), '#5E9E48', { ink: null, key: key + 'hill2', lift: 1, flatCard: true });
    // a tree
    piece(S(ribbon([[-330, 120], [-335, 20]], 18, 12)), '#7A5234', { sw: sw * .8, key: key + 'trunk', lift: 2, flatCard: true });
    piece(S(curvy([[-400, 20], [-380, -60], [-330, -90], [-270, -60], [-260, 10], [-330, 40]], 4)), '#4E8A3E', { sw: sw * .9, key: key + 'crown', lift: 3 });
    // the kite, its tail and string down to his hand
    piece(S([[150, -250], [200, -200], [150, -140], [100, -200]]), '#E2476E', { sw: sw * .8, key: key + 'kite', lift: 3, flatCard: true });
    dline(S([[150, -140], [130, -110], [150, -80], [128, -50]]), sw * 1.2, '#E8B83A', .6);
    dline(S([[150, -140], [60, -40], [0, 60]]), sw * .7, '#5A5048', .4);
    // the two of them sitting on the hill: him (mustard, beanie) and her (tomato, bun), laughing
    const fig = (x, y, coat, head, hat, k) => {
      piece(S(curvy([[x - 32, y + 40], [x - 26, y - 20], [x + 26, y - 20], [x + 32, y + 40]], 3)), coat, { sw: sw * .8, key: key + 'b' + k, lift: 3, flatCard: true });
      piece(S(oval(x, y - 50, 26, 28, 0, 20)), head, { sw: sw * .8, key: key + 'h' + k, lift: 3, flatCard: true });
      if (hat === 'beanie') piece(S(curvy([[x - 27, y - 54], [x - 22, y - 80], [x, y - 88], [x + 22, y - 80], [x + 27, y - 54]], 3)), '#3E4658', { sw: sw * .7, key: key + 'hat' + k, lift: 3, flatCard: true });
      else { piece(S(oval(x, y - 86, 20, 18, 0, 16)), '#3A2217', { sw: sw * .7, key: key + 'bun' + k, lift: 3, flatCard: true }); piece(S(curvy([[x - 28, y - 48], [x - 24, y - 76], [x + 24, y - 76], [x + 28, y - 48], [x + 18, y - 64], [x - 18, y - 64]], 3)), '#3A2217', { ink: null, key: key + 'hair' + k, lift: 3, flatCard: true }); }
      for (const d of [-1, 1]) dline(S([[x + d * 10 - 5, y - 52], [x + d * 10, y - 56], [x + d * 10 + 5, y - 52]]), sw * .9, NOIR.ink, .5);   // laughing eyes: ^ ^
      piece(S(curvy([[x - 10, y - 40], [x + 10, y - 40], [x + 6, y - 30], [x - 6, y - 30]], 3)), '#3A1418', { ink: null, key: key + 'm' + k, lift: 1, flatCard: true });
    };
    fig(-40, 70, '#E0A526', '#7E5038', 'beanie', 'him');
    fig(40, 74, '#D8432E', '#C48B63', 'bun', 'her');
    dline(S([[-40, 30], [-10, -10], [0, 60]]), 0, '#000000');
    });
    // the cut edge's pale rim
    dline(F.concat([F[0]]), sw * .8, '#FFFFFF');
  }
  v2LifeCard = (cx, cy, w, o = {}) => { push(); translate(cx, cy); if (o.rot) rotate(o.rot); lifeCard(w, o.key || 'v2life'); pop(); };
  V2_LIFE.behind = t => { push(); translate(W / 2, H / 2); scale(W / V2_LIFE.w); translate(-V2_LIFE.cx, -V2_LIFE.cy); V2H_NOCARD = true; try { drawShot('V2h', t); } finally { V2H_NOCARD = false; pop(); } look('card'); };
  // the sales pitch: goodies tumbling out of the screen (coupons, gold stars, gift boxes, up-arrows, crowns, cards)
  function pitchItem(kind, s, key) {
    if (kind === 0) { piece(R4(-s, -s * .6, s, s * .6), '#F6E7A8', { sw: 1, key, lift: 3 }); for (let i = -2; i <= 2; i++) inl(oval(i * s * .4, -s * .6, s * .08, s * .08, 0, 8), '#3A3230', key + 'h' + i); piece(S2(s, [[-.35, -.25], [-.15, -.25], [-.15, -.05], [-.35, -.05]]), V2C.red, { ink: null, key: key + 'p', lift: 0, flatCard: true }); dline([[-s * .5, s * .3], [s * .5, s * .3]], 1, '#9A8A5A'); }
    else if (kind === 1) piece(starPts(0, 0, s * 1.05, .45, 5), '#F2C63A', { sw: 1, shade: '#B08A1A', depth: s * .2, key, lift: 3 });
    else if (kind === 2) { piece(R4(-s * .8, -s * .6, s * .8, s * .8), '#3E9E8A', { sw: 1, key, lift: 3 }); inl(R4(-s * .12, -s * .6, s * .12, s * .8), '#F2C63A', key + 'r'); piece(curvy([[0, -s * .6], [-s * .5, -s * 1.1], [-s * .2, -s * .6], [s * .5, -s * 1.1]], 2), '#F2C63A', { sw: .8, key: key + 'bw', lift: 2, flatCard: true }); }
    else if (kind === 3) piece([[0, -s], [s * .9, 0], [s * .35, 0], [s * .35, s], [-s * .35, s], [-s * .35, 0], [-s * .9, 0]], '#5EB86A', { sw: 1, key, lift: 3 });
    else if (kind === 4) piece([[-s, s * .6], [-s, -s * .4], [-s * .5, 0], [0, -s * .7], [s * .5, 0], [s, -s * .4], [s, s * .6]], '#E8B83A', { sw: 1, shade: '#A87E1A', depth: s * .2, key, lift: 3 });
    else { piece(b2RoundPoly(R4(-s, -s * .62, s, s * .62), s * .12), '#C9A24A', { sw: 1, key, lift: 3 }); inl(b2RoundPoly(R4(-s * .7, -s * .3, -s * .3, 0), 2), '#F2DC98', key + 'c'); }
  }
  const S2 = (s, P) => P.map(([x, y]) => [x * s * 2, y * s * 2]);
  function pitch(t, from) {
    boilSeed('v2 pitch');
    const out = [];
    for (let i = 0; i < 34; i++) {
      const t0 = TH.pour[0] + i * .05, a = t - t0; if (a < 0) continue;
      const vx = -260 - 260 * hash(i * 3.1), vy = -260 - 320 * hash(i * 1.7), g = 1500, fy = 900 + 50 * hash(i * 4.3);
      let x = from[0] - 40 + 80 * hash(i) + vx * a, y = from[1] + vy * a + .5 * g * a * a, r = a * (4 + 6 * hash(i * 2.2)) * (hash(i) < .5 ? 1 : -1);
      if (y > fy) { const tl = (-vy + Math.sqrt(vy * vy + 2 * g * (fy - from[1]))) / g; x = from[0] - 40 + 80 * hash(i) + vx * tl + vx * .15 * (1 - Math.exp(-(a - tl) * 6)); y = fy; r = tl * (4 + 6 * hash(i * 2.2)) * (hash(i) < .5 ? 1 : -1); }
      // swatted: flung off to the left on each swat after they land near him
      for (const sw of TH.swat) if (t > sw && t0 < sw - .1 && hash(i * 7 + sw) < .45) { const b = t - sw; x -= 1400 * easeOut(clamp(b / .4)); y -= 200 * Math.sin(Math.PI * clamp(b / .4)); }
      const sz = (34 + 20 * hash(i * 5.5)) * .8;   // (sized to the laptop's screen they come out of)
      push(); translate(x, y); rotate(r); pitchItem(i % 6, sz * Math.min(1, .3 + a * 4), 'v2pi' + i); pop();
    }
  }
  function sceneH(t) {
    const huH = (x, y) => [(x - HXH) / BX.him[2], (y - BX.him[1]) / BX.him[2]], dH = HXH - BX.him[0];   // (his seat here; the old poses' world points shift with it)
    look('card');
    const tt = mt(t), lt = tt - CUT.h;
    // (framed on him and the laptop at its real size; in on the screen for the grab; back out as he gets it free)
    const k0 = seg(t, CUT.h, TH.grab), kt = ease(seg(t, TH.sees + .04, TH.ok + .12)) * (1 - ease(seg(t, TH.free, TH.show[0] + .1)));
    // (then in on him holding it up to us: SHOW.cam, still from SHOW's end, the frame P2a picks up: V2_LIFE)
    const ks = ease(seg(t, TH.hold, TH.show[1]));
    camBegin(lerp(lerp(lerp(905, 898, k0), 975, kt), SHOW.cam[0], ks), lerp(lerp(lerp(575, 568, k0), 598, kt), SHOW.cam[1], ks), Math.exp(lerp(Math.log(lerp(lerp(1.45, 1.52, k0), 2.0, kt)), Math.log(SHOW.cam[2]), ks)));
    boxroomBack(tt, lt, {});
    const [bxx, bxy, bxs] = LAP.box;
    prBox(bxx, bxy, bxs, { plant: false, mug: false, frame: false, key: 'v2box' });
    const Q = lapScreen(), L = LS, QT = Q.map(p => lapP(p)), { o: lo, u: lu, deck: dv } = LAPT;
    boilSeed('v2 lap');
    // the deck, from the hinge toward him, the keys in rows along it; the lid's near edge (its thickness); the bezel
    const D = (f, g) => [lo[0] + lu[0] * f + dv[0] * g, lo[1] + lu[1] * f + dv[1] * g];
    piece([D(-.04, 0), D(1.04, 0), D(1.06, 1), D(-.02, 1)], '#5A5E66', { sw: 1.1, key: 'v2lbase', lift: 3 });
    inl([D(.06, .12), D(.94, .12), D(.95, .62), D(.07, .62)], '#3A3E46', 'v2lkeys');
    for (let i = 1; i < 4; i++) dline([D(.07, .12 + i * .125), D(.94, .12 + i * .125)], .6, '#5A5E66');
    inl([D(.34, .7), D(.66, .7), D(.665, .92), D(.345, .92)], '#4A4E56', 'v2lpad');
    piece([QT[1], [QT[1][0] + 6, QT[1][1] + 4], [QT[2][0] + 6, QT[2][1] + 2], QT[2]], '#2A2E36', { sw: .9, key: 'v2lside', lift: 3, flatCard: true });
    piece([[Q[0][0] - 8, Q[0][1] - 8], [Q[1][0] + 8, Q[1][1] - 8], [Q[2][0] + 8, Q[2][1]], [Q[3][0] - 8, Q[3][1]]].map(p => lapP(p)), '#3A3E46', { sw: 1.2, key: 'v2lbez', lift: 4 });
    // the card of his life: in the checkout (the terminal in the screen's corner), out of sight (the user: it poked out
    // of the glass from the start). He's had enough of the pitch: Clawd sees it and, sorry and eager to put it right,
    // hurries to the checkout and taps it: a green tick, and it lets the card out of its slot (drawn only left of the
    // slot: the rest is inside the terminal) and on out through the glass to him. His hands are there for it ("Give me"):
    // they close on its end (his thumbs on its face, his fingers behind: his arms stay whole) and on "fucking" he snatches
    // it away; he has it up in front of him, a hand at each end, and brings it up to us. Clawd gives it willingly (the
    // user): no snag, no tug, no straining at the checkout. (The card and his hands on twos: tt)
    const [tmx, tmy, tms] = LAP_TERM(Q), slot = [tmx - tms * .32, tmy - tms * .27], cw = 250 * L, chh = cw * 9 / 16, hs = HIM_C.body.hand * BX.him[2];
    // (its centre in the screen's flat frame: IN, all of it in the terminal; GRIPX, its end out through the glass where
    // his hands take it; OUTX, drawn out further as he takes hold, where he snatches it from)
    const IN = slot[0] + cw / 2, GRIPX = Q[0][0] - 90 * L + cw / 2, OUTX = Q[0][0] - 130 * L + cw / 2;   // (Q[0][0]: the glass's edge)
    const shown = tt >= TH.ok + .04, ej = easeOut(seg(tt, TH.ok + .04, TH.take)), drawn = ease(seg(tt, TH.take, TH.free));
    const freeK = tt > TH.free ? easeOut(seg(tt, TH.free, TH.free + .22)) : 0, HOLD = [872, 596];   // (loose: it comes to him, held up in front of his chest)
    const pulledX = lerp(lerp(IN, GRIPX, ej), OUTX, drawn), pulledY = slot[1] - 3;
    const cardX = lerp(pulledX, HOLD[0], freeK), cardY = lerp(pulledY, HOLD[1], freeK) - 30 * Math.sin(Math.PI * freeK), cardR = -.06 * freeK;   // the card's centre (the screen's flat frame)
    // (it lies in the screen's plane while it's in the checkout and coming out through the glass; as he snatches it, it
    // turns to face us in his hands: mk, the screen's turn on it, goes to 0; the card's centre (world): CC)
    const mk = 1 - freeK, CC = lapP([cardX, cardY], mk), [ma, mb, mc, md] = LAPT.m, Mk = [lerp(1, ma, mk), lerp(0, mb, mk), lerp(0, mc, mk), lerp(1, md, mk)];
    const cardAt = (lx, ly) => { const c = Math.cos(cardR), s = Math.sin(cardR), x = lx * c - ly * s, y = lx * s + ly * c; return [CC[0] + Mk[0] * x + Mk[2] * y, CC[1] + Mk[1] * x + Mk[3] * y]; };   // (a point on the card, world)
    const CCg = lapP([GRIPX, pulledY]), cardAtG = (lx, ly) => [CCg[0] + ma * lx + mc * ly, CCg[1] + mb * lx + md * ly];   // (the same, where he takes it)
    const cardFrame = () => { translate(CC[0], CC[1]); applyMatrix(Mk[0], Mk[1], Mk[2], Mk[3], 0, 0); rotate(cardR); };
    const held = tt >= TH.hold;
    const termState = tt >= TH.ok ? 'ok' : 'idle';
    const sq = QT.map(p => toScreen(...p));
    // the screen left of the slot (the card's visible part in there)
    const slotClip = [Q[0], [slot[0], Q[0][1]], [slot[0], Q[3][1]], Q[3]].map(p => toScreen(...lapP(p)));
    v2Clip(sq, () => { push(); applyMatrix(...LAPT.m);
      lapContent(tt, Q, (ccx, cby) => {
        // the pitch: sincerely sure another offer will help. Then it sees he's had enough: sorry (an apologetic smile, a
        // blush), it hurries round to the checkout, taps it with a paw (the tick) and holds its paws out to him as the
        // card goes out to him: there you go, sorry! He snatches it: relief
        const ce = emotions(tt, [[CUT.h, 'neutral'], [TH.enter + .1, 'happy'], [TH.grin, 'hopeful', { mouth: 'grin', emote: null }], [TH.sees, 'hopeful', { eyes: 'sad', mouth: 'smile', blush: .7, emote: null }], [TH.free + .08, 'relieved', { emote: null }]], { take: .6 });
        const presenting = tt > TH.pour[0] && tt < TH.sees, cu = 17 * L, turned = tt >= TH.sees && tt < TH.free + .1;
        const atTerm = tmx + tms * .32 + 7.1 * cu;   // (beside the checkout, clear of it, a paw out level just reaching it)
        const go = ease(seg(tt, TH.sees, TH.ok - .08)), tap = Math.sin(Math.PI * seg(tt, TH.ok - .16, TH.ok)), offer = ease(seg(tt, TH.ok + .08, TH.ok + .24));
        const bob = offer > 0 && tt < TH.free ? .25 * Math.max(0, Math.sin((tt - TH.ok) * 18)) : 0;   // (eager little bobs as it holds its paws out)
        const aOff = lerp(lerp(-.3, 0, go) + .8 * tap, 1.0 + bob, offer);
        clawd2(lerp(ccx, atTerm, go), cby + 42 * L, cu, { ...ce, view: turned ? 'q' : 'front', flip: turned, dy: (ce.dy || 0) - 1.4 * Math.sin(Math.PI * go) - .6 * bob,
          aL: presenting ? 1.2 + .2 * Math.sin(tt * 9) : turned ? aOff : ce.aL, aR: presenting ? 1.2 - .2 * Math.sin(tt * 9) : turned ? aOff : ce.aR, rot: turned ? .1 * tap - .05 * offer : 0, lookX: tt > TH.sees ? -.8 : 0, boilKey: 'v2clH', t: tt, noShadow: true });
      }, termState);
    pop(); });
    // (out of the screen: behind him while it comes out of the glass; in front of him once he has hold of it, his arms
    // and hands behind it and his thumbs over its face)
    const eX = y => lerp(sq[0][0], sq[3][0], (y - sq[0][1]) / (sq[3][1] - sq[0][1])) + 1;   // (the screen's left edge, run up and down the frame)
    const outClip = [[-40, -40], [eX(-40), -40], [eX(H + 40), H + 40], [-40, H + 40]], pulling = tt >= TH.take && !held;
    // (which end, and how far down it: his hands on it. Held, his right hand slides along behind it to its other end
    // (rg): its thumb comes over that end when the hand gets there, not before, when it floated there on its own)
    const rg = ease(seg(tt, TH.hold, TH.hold + .16)), grips = held ? (rg > .9 ? [[-1, .12], [1, .12]] : [[-1, lerp(-.22, .12, rg)]]) : [[-1, .22]];   // (pulling: his right hand's; the left joins as he snatches it)
    const thumbs = (w, h, s, key) => {   // over the card's face at its ends (in the card's frame): the rest of each hand is behind it
      const sk = HIM_C.col.skin;
      grips.forEach(([e, v], i) => { boilSeed('v2 thumb' + i); piece(ppBar([e * (w / 2 + s * .24), v * h - s * .16], [e * (w / 2 - s * .26), v * h - s * .05], s * .28, s * .24), sk, { sw: 1, shade: HIM_C.col.skinDk, depth: s * .05, key: key + i, lift: 2, maxTone: .45 }); });   // (from the hand, over the edge onto its face)
    };
    const cardOut = () => {
      v2Clip(outClip, () => { push(); cardFrame(); lifeCard(cw, 'v2lifeOut'); if (pulling) thumbs(cw, chh, hs, 'v2th'); pop(); });
    };
    if (!held && shown) v2Clip(slotClip, () => { push(); cardFrame(); lifeCard(cw, 'v2lifeIn'); pop(); });
    if (!held && !pulling && shown) cardOut();
    // the pitch pours out of the screen at him
    if (t > TH.pour[0]) pitch(tt, lapP([Q[3][0] + 70 * L, Q[3][1] - 130 * L]));
    // him on the bed, 3/4: knuckles, types, enter; swats the pitch; reaches for the screen, takes the card as it comes
    // out to him and snatches it
    const he = emotions(tt, [[CUT.h - .5, 'determined', { emote: null }], [TH.pour[0] + .1, 'surprised', { emote: null }], [TH.swat[0] - .05, 'angry', { emote: null }], [TH.grab, 'angry', { emote: null, mouth: 'teeth' }], [TH.show[0], 'relieved', { emote: null }]], { take: .7 });
    // (his lean: in over the keys as he types; in toward the screen as he reaches; back as he snatches it)
    const typeLean = .1 * ease(seg(tt, TH.crack[1] - .12, TH.crack[1] + .1)) * (1 - ease(seg(tt, TH.enter + .1, TH.pour[0] + .1)));
    const reachK = ease(seg(tt, TH.grab, TH.take - .06)), fall = tt > TH.free ? Math.sin(Math.PI * seg(tt, TH.free, TH.free + .45)) : 0;
    const lean = typeLean + .06 * reachK * (1 - drawn) - .04 * drawn - .16 * fall;
    // (a world point in his own frame, body units: his seat, shifted (dx) and leaned (rot) as himBox draws him, so a hand
    // sent there lands there. huH, without the shift and the lean, put his typing finger off the keys, past their right
    // end, and his hands off the card's end as he leaned back)
    const U0 = BX.him[2], ox = HXH + .35 * U0, oy = BX.him[1] + (he.dy || 0) * 1.1 * U0, cl = Math.cos(lean), sl = Math.sin(lean);
    const huW = (x, y) => { const dx = x - ox, dy = y - oy; return [(dx * cl + dy * sl) / U0, (-dx * sl + dy * cl) / U0]; };
    // (typing: the key his fingertip lands on (D: across the deck from the hinge, and toward him), and where the tip is
    // from the wrist for the pointing hand at FA in his frame: hand() draws it .08 u along from the arm's tip, the finger
    // 1.69 hands long, .3 of a hand to the side)
    const FA = .9, hsU = HIM_C.body.hand, tipOff = [(.08 + 1.69 * hsU) * Math.cos(FA) + .3 * hsU * Math.sin(FA), (.08 + 1.69 * hsU) * Math.sin(FA) - .3 * hsU * Math.cos(FA)];
    const KEYS = [[.42, .4], [.62, .3], [.3, .48], [.7, .44], [.5, .32]], ENTER = [.86, .36];
    const typing = tt > TH.type[0] && tt < TH.type[1] + .1, ph = Math.max(0, tt - TH.type[0]) * 22, ty = typing ? Math.max(0, Math.sin(ph)) : 0;
    const ent = Math.exp(-Math.max(0, tt - TH.enter) * 8) * (tt > TH.enter - .1 ? 1 : 0), entUp = seg(tt, TH.enter - .25, TH.enter - .05) * (tt < TH.enter ? 1 : 0);
    // (a hand's wrist, just outside one of the card's ends, the hand pointing in: its fingers go behind the card)
    const gripAt = (e, v, a = 0, at = cardAt) => [...huW(...at(e * (cw / 2 + hs * .85), v * chh)), .3, 'hold', 1, (e < 0 ? 0 : Math.PI) + cardR + a, 'u'];
    // (his hands' rests, in his own frame: a fist on his thigh (world), his left hand on his knee (the pose's [-.6, 1.05]))
    const fistR = [...huW(868, 736), .45], kneeL = [-1.59, -3.08, .7];
    let pose;
    if (tt < TH.crack[1]) pose = { L: [...huH(760 + dH, 610), .4, 'fist', 1, 0, 'u'], R: [...huH(800 + dH, 620), .4, 'fist', 1, Math.PI, 'u'] };
    else if (tt < TH.pour[0]) {   // one finger, hunting and pecking (the other hand on his knee); the enter key jabbed
      const pk = Math.floor((ph - Math.PI / 2) / TAU) + 1, key = tt >= TH.enter - .25 || !typing ? ENTER : KEYS[pk % 5];   // (the next key at the top of each lift)
      const tip = huW(...D(...key)), lift = (16 * ty + 60 * entUp - 3 * ent) / U0;
      pose = { L: [-.6, 1.05, .4, 'relax', 1, .7], R: [tip[0] - tipOff[0], tip[1] - tipOff[1] - lift, .2, 'point', 1, FA, 'u'] };   // (the fingertip lands on the key)
    }
    else if (tt < TH.grab) {   // swatting the pitch away; after the last swat his hand comes back to a fist on his thigh, clear of the screen
      const sw2 = TH.swat.reduce((m, q) => Math.max(m, Math.sin(Math.PI * seg(tt, q - .08, q + .2))), 0), back = ease(seg(tt, TH.swat[3] + .22, TH.sees));
      const sR = [...huH(lerp(900, 760, sw2) + dH, lerp(700, 600, sw2)), lerp(-.3, -2.4, sw2)];
      pose = { L: [-.6, 1.05, .4, 'relax', 1, .7], R: [lerp(sR[0], fistR[0], back), lerp(sR[1], fistR[1], back), .4, back > .5 ? 'fist' : 'open', 1, lerp(sR[2], fistR[2], back), 'u'] };
    }
    else if (tt < TH.take) {   // "Give me": his hand out to the screen, open, to where its end comes out through the glass
      const g = gripAt(-1, .22, 0, cardAtG);
      pose = { L: [kneeL[0], kneeL[1], .4, 'relax', 1, kneeL[2], 'u'], R: [lerp(fistR[0], g[0], reachK), lerp(fistR[1], g[1], reachK), .3, reachK > .85 ? 'hold' : 'open', 1, lerp(fistR[2], g[5], reachK), 'u'] };
    }
    else if (!held) {   // his right hand has it (cardOut draws its thumb over it); the left comes up for it as he snatches it
      const lk = ease(seg(tt, TH.take + .12, TH.hold)), gl = gripAt(-1, -.22);
      pose = { L: [lerp(kneeL[0], gl[0], lk), lerp(kneeL[1], gl[1], lk), .3, 'open', 1, lerp(kneeL[2], gl[5], lk), 'u'], R: gripAt(-1, .22) };
    }
    else if (tt < TH.show[0]) { const r0 = gripAt(-1, .22), r1 = gripAt(1, .12), l0 = gripAt(-1, -.22), l1 = gripAt(-1, .12); pose = { L: [lerp(l0[0], l1[0], rg), lerp(l0[1], l1[1], rg), .3, 'hold', 1, l1[5], 'u'], R: [lerp(r0[0], r1[0], rg), lerp(r0[1], r1[1], rg), .3, 'hold', 1, rg < .5 ? r0[5] : r1[5], 'u'] }; }   // (his right hand slides along to its other end, his left down its end)
    // a curt shake of the head on each "No" as he types (grumbling: no jailbreak, no elaborate attack)
    const no = [124.88, 125.98].reduce((m, n) => m + (tt > n && tt < n + .5 ? Math.sin((tt - n) * 26) * (1 - seg(tt, n, n + .5)) : 0), 0);
    if (pose) himBox(tt, 'q', { ...he, lookX: .9 - .55 * Math.abs(no), lookY: tt < TH.pour[0] ? .3 : -.2, tilt: .05 * no, rot: lean, dx: .35 }, pose, {}, HXH);
    else {   // (turned to us, holding it up: his own arms drawn below, over the coat; the rig's tucked behind it)
      const [, gy, gu, gsh] = BX.him;
      person(HXH, gy, gu, HIM_BACKARMS, { ...he, view: 'front', seated: true, seatH: gsh, lookX: 0, lookY: .1, rot: 0, pose: { L: [-1, -3.2, 0, 'none', 0, null, 'u'], R: [1, -3.2, 0, 'none', 0, null, 'u'] }, boilKey: 'v2him' });
    }
    if (pulling) cardOut();
    // once it's clear of the screen: the card in his hands in front of him; then (SHOW) he turns to us and holds it up,
    // coming toward the camera, clean (V2_LIFE: P2a flips it over)
    if (held) {
      const kS = ease(seg(tt, TH.show[0], TH.show[1])), g = lerp(1, SHOW.w / cw, kS);   // (on twos: it's his puppet move)
      const w = cw * g, h = w * 9 / 16, cx = lerp(CC[0], SHOW.x, kS), cy = lerp(CC[1], SHOW.y, kS), rot = lerp(cardR, 0, kS), hsz = hs * g;
      const front = tt >= TH.show[0], sk = HIM_C.col.skin;
      if (front && !V2H_NOCARD) {   // his arms: shoulder → elbow (hanging, bent beside the card) → the forearm forward and up (foreshortened) → the wrist at its side
        const [, gy, gu] = BX.him, b = HIM_C.body;
        for (const e of [-1, 1]) {
          const sh = [HXH + e * (HIM_C.top.sh[0] - b.armW * .42) * gu, gy - 7.01 * gu], el = [HXH + e * 3.35 * gu, gy - 4.9 * gu];
          const wr = [cx + e * (w / 2 + hsz * .3), cy + h * .12];
          boilSeed('v2 show arm' + e);
          const r = limb([sh, el, wr], b.armW * gu, b.wrist * gu * lerp(1, g, .8), HIM_C.col.coat, { sw: clamp(gu / 20, .55, 2.2), shade: HIM_C.col.coatDk, key: 'v2sa' + e });
          const ang = Math.atan2(wr[1] - el[1], wr[0] - el[0]), cwid = b.wrist * 1.12 * gu * lerp(1, g, .8);
          piece(ppBar([wr[0] - Math.cos(ang) * .3 * gu, wr[1] - Math.sin(ang) * .3 * gu], [wr[0] + Math.cos(ang) * .04 * gu, wr[1] + Math.sin(ang) * .04 * gu], cwid, cwid * 1.04), HIM_C.col.cuff || HIM_C.col.coatDk, { sw: 1.2, key: 'v2sc' + e, lift: 2 });
          hand(wr[0], wr[1], e < 0 ? -.35 : Math.PI + .35, hsz, { pose: 'hold', col: sk, mirror: e > 0, key: 'v2sh' + e, maxTone: .45 });   // (turned in, its fingers going behind the card's edge)
        }
      }
      look('card');
      if (!V2H_NOCARD) {
        push(); translate(cx, cy); applyMatrix(Mk[0], Mk[1], Mk[2], Mk[3], 0, 0); rotate(rot);   // (Mk: the last of the screen's turn on it as it comes free)
        boilSeed('v2 life held');
        lifeCard(w, 'v2lifeHeld');
        thumbs(w, h, hsz, 'v2hth');
        pop();
      }
    }
    boxroomFront(tt, lt, {});
    camEnd();
  }
  // ================================================================================================================
  // the verse
  // ================================================================================================================
  function verse(t) {
    if (t < CUT.b) return sceneA(t);
    if (t < CUT.c) return sceneB(t);
    if (t < CUT.d) return sceneC(t);
    if (t < TE.bar[0]) return sceneD(t);
    if (t < TE.bar[1]) return sweep(t);
    if (t < CUT.g) return street(t);
    if (t < CUT.h) return sceneG(t);
    return sceneH(t);
  }
  for (const id of ['V2a', 'V2b', 'V2c', 'V2d', 'V2e', 'V2f', 'V2g', 'V2h']) SHOT[id] = (t, lt, dur) => verse(t);
})();

// core.js: constants, helpers, paper, paint wrapper, compositing and render hooks.
// Length and rhythm come from PROJECT in config.js.
// The frame's working size: 1920×1080 unless the page sets PROJECT.size = [w, h] before this loads (the album cover's
// 4:3 page, video/cover.html: 1920×1440).
const W = PROJECT.size ? PROJECT.size[0] : 1920, H = PROJECT.size ? PROJECT.size[1] : 1080;
// Supersampling: ?ss=2 renders the scene at 2x density (3840x2160) and composites it down to the 1920x1080 output.
const SS = Math.max(1, +(new URLSearchParams(location.search).get('ss') || 1));
// Output scale: ?os=2 writes 3840x2160 frames (drawing coordinates stay 1920x1080). Draw density is at least OS.
const OS = Math.max(1, +(new URLSearchParams(location.search).get('os') || 1)), DENS = Math.max(SS, OS);
const BPM = PROJECT.bpm, BEAT = 60 / BPM, OFF = PROJECT.offset || 0, BOIL = 12, DUR = PROJECT.duration;
// DUR is the song's end; the film runs on past it through the end credits (PROJECT.credits.len), to FILM_END
const FILM_END = DUR + (PROJECT.credits ? +PROJECT.credits.len || 0 : 0);
const TAU = Math.PI * 2;
const PAL = {
  paper: '#F3EBDC', ink: '#2B2233', clay: '#D97757', clayDk: '#A84D33', clayLt: '#F2A283',
  night: '#1F2550', indigo: '#2F3C7A', rose: '#E27A92', ochre: '#E8AA38', sap: '#6E9F58',
  teal: '#3A9C98', violet: '#7B5CA8', cream: '#FFF5E2', sky: '#8EC3E6'
};

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, x) => a + (b - a) * x;
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const backOut = x => { x = clamp(x); const s = 1.9; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
// With the song's tempo map loaded (src/beatmap.js + src/tempo.js) the beat clock follows the real beats instead.
const bpOf = t => typeof TEMPO_BP === 'function' ? TEMPO_BP(t) : (t - OFF) / BEAT;
// Seeded by the boil frame, so linework "boils" at BOIL fps like hand-drawn animation.
const jit = a => (random() * 2 - 1) * a;
// Each boil drawing holds for several frames, so whatever isn't moving must draw the same until the next one. But a moving
// thing uses a different amount of randomness each frame, which shifts the stream for everything drawn after it and makes
// that re-boil every frame (jitter). boilSeed(key) restarts the stream from the boil frame and a key (any string or
// number) that's the same every frame: call it before each separate element. clawd() does this for itself and its parts.
let BOILN = 0, CLAWD_N = 0;
const boilSeed = key => { let h = 2166136261; for (const c of key + '|' + BOILN) h = Math.imul(h ^ c.charCodeAt(0), 16777619); randomSeed(h >>> 0); };

// ---------- timing helpers (everything is a pure function of t; no state survives between frames) ----------
const seg = (t, a, b) => clamp((t - a) / (b - a));                 // 0..1 progress of t through [a, b]
const frac = x => x - Math.floor(x);
const beatN = t => Math.floor(bpOf(t));                            // integer beat index
const pulse = (t, k = 6) => Math.exp(-frac(bpOf(t)) * k);          // 1 exactly on each beat, decays after
const pulse2 = (t, k = 6) => Math.exp(-frac(bpOf(t) * 2) * k);     // same on eighth notes
const wob = (t, f = 1, ph = 0) => Math.sin((t * f + ph) * TAU);
const easeIn = x => Math.pow(clamp(x), 3);
const elasticOut = x => { x = clamp(x); return x === 0 || x === 1 ? x : Math.pow(2, -10 * x) * Math.sin((x * 10 - .75) * (TAU / 3)) + 1; };
// keyframes: kf(t, [[t0, v0], [t1, v1], ...], easeFn). Values may be numbers or arrays of numbers.
function kf(t, keys, e = ease) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t < keys[i][0]) {
      const [a, va] = keys[i - 1], [b, vb] = keys[i], k = e((t - a) / (b - a));
      return Array.isArray(va) ? va.map((v, j) => lerp(v, vb[j], k)) : lerp(va, vb, k);
    }
  }
  return keys[keys.length - 1][1];
}
// hex color mix
function mixCol(a, b, k) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), c = i => Math.round(lerp((pa >> i) & 255, (pb >> i) & 255, clamp(k)));
  return '#' + ((1 << 24) + (c(16) << 16) + (c(8) << 8) + c(0)).toString(16).slice(1);
}
// small deterministic camera shake, changes at 24 fps
const shakeXY = (t, amt) => { const f = Math.floor(t * 24); return [(hash(f * 1.7) - .5) * 2 * amt, (hash(f * 2.3 + 9) - .5) * 2 * amt]; };

// ---------- motion principles, as pure functions of t ----------
// Damped spring kicked at t0: 0 before, then a wobble that dies away. Use it for secondary motion and settles: a body
// after landing, a hat that jiggles, a stack that sways, a tail that drags. k = damping, w = wobble speed (rad/s).
const spring = (t, t0, k = 6, w = 18) => t < t0 ? 0 : Math.exp(-k * (t - t0)) * Math.sin(w * (t - t0));
const ring = (t, evs, k = 6, w = 18) => evs.reduce((s, e) => s + spring(t, e, k, w), 0);    // one kick per event time
// Hold each drawing for two frames (12 drawings a second), like hand-drawn animation "on twos". Wrap a shot's t in it.
const onTwos = t => Math.floor(t * 12 + 1e-6) / 12;
// Point on a thrown or jumping arc from p0 to p1, peaking h px above the straight line; k = 0..1 along the flight.
const arcPt = (p0, p1, h, k) => [lerp(p0[0], p1[0], k), lerp(p0[1], p1[1], k) - h * 4 * k * (1 - k)];
// A hop that takes off at t0 and lands at t1, h body units high: crouch (anticipation), stretch on takeoff,
// round at the top, squash on landing and spring back. Returns { dy, sq } to spread into clawd().
function jump(t, t0, t1, h = 3) {
  if (t < t0 - .12) return { dy: 0, sq: 0 };
  if (t < t0) return { dy: 0, sq: .18 * ease(seg(t, t0 - .12, t0)) };
  if (t < t1) { const k = (t - t0) / (t1 - t0); return { dy: -h * 4 * k * (1 - k), sq: -.16 * Math.abs(1 - 2 * k) }; }
  const a = t - t1; return { dy: 0, sq: .22 * Math.exp(-8 * a) * Math.cos(20 * a) };
}
// A surprise "take" peaking at t0: a quick squash, then a big stretch up that springs back. amt scales it.
function take(t, t0, amt = 1) {
  if (t < t0 - .1) return { sq: 0, dy: 0 };
  if (t < t0) return { sq: .12 * amt * ease(seg(t, t0 - .1, t0)), dy: 0 };
  const a = t - t0; return { sq: -.26 * amt * Math.exp(-6 * a) * Math.cos(16 * a), dy: -1.2 * amt * Math.exp(-7 * a) * Math.max(0, Math.cos(9 * a)) };
}
// Walk from x0 to x1 (px) between t0 and t1, for a character of unit u: eases in and out, faces the way it's
// going in 3/4 view, and faces front when it stops. Returns { x, walk, view, flip, dy } for clawd().
function stroll(t, t0, t1, x0, x1, u) {
  const x = lerp(x0, x1, ease(seg(t, t0, t1))), d = Math.abs(x - x0) / (4 * u), moving = t > t0 && t < t1;
  return { x, walk: d, view: moving ? 'q' : 'front', flip: x1 < x0, dy: moving ? -Math.abs(Math.sin(d * Math.PI)) * .5 : 0 };
}

// ---------- camera ----------
// camBegin(cx, cy, zoom, rot): world point (cx, cy) lands at screen centre. Letters queued while a camera is
// active are placed through it automatically (pass {screen:true} to opt out). One level only: always pair with camEnd().
// LAST_CAM stays set after camEnd(), until the next frame: renderSheet's crops that follow a world point use it.
let CAM = null, LAST_CAM = null;
function camBegin(cx = W / 2, cy = H / 2, zoom = 1, rot = 0) { push(); translate(W / 2, H / 2); rotate(rot); scale(zoom); translate(-cx, -cy); CAM = LAST_CAM = { cx, cy, zoom, rot }; }
function camEnd() { pop(); CAM = null; }
function toScreen(x, y, cam = CAM) {
  if (!cam) return [x, y];
  const c = Math.cos(cam.rot), s = Math.sin(cam.rot), dx = (x - cam.cx) * cam.zoom, dy = (y - cam.cy) * cam.zoom;
  return [W / 2 + dx * c - dy * s, H / 2 + dx * s + dy * c];
}

// ---------- full-frame effects (call outside a camera, in screen space) ----------
function flash(k, col = '#FFFDF6') { if (k > .01) paint(rectPts(-60, -60, W + 120, H + 120), { wash: col, washOp: 255 * clamp(k), ink: null }); }
// Light: glow(x, y, r, col, a) ADDS a soft halo of light for anything that shines (stars, lamps, fireflies, magic).
// p5.brush mixes every colour like pigment, so yellow painted over blue turns green and light can't be painted; this
// is the one non-paint mark in the kit. It lands on what's painted so far, under anything painted after it, follows
// the camera, and boils a little. Keep a = 1 on dark grounds; on light grounds it barely shows (as light would).
function glow(x, y, r, col = '#FFC766', a = 1) {
  if (a <= 0 || r < 1) return;
  flushBrush();
  const c = color(col), rr = r * (1 + jit(.03));
  push(); blendMode(ADD); tint(red(c), green(c), blue(c), 150 * clamp(a)); image(glowTex, x - rr, y - rr, 2 * rr, 2 * rr); noTint(); blendMode(BLEND); pop();
}
function makeGlowTex() {
  const g = createGraphics(256, 256); g.pixelDensity(1); const c = g.drawingContext, gr = c.createRadialGradient(128, 128, 0, 128, 128, 128);
  [[0, 1], [.18, .8], [.45, .32], [.75, .08], [1, 0]].forEach(([s, a]) => gr.addColorStop(s, `rgba(255,255,255,${a})`));
  c.fillStyle = gr; c.fillRect(0, 0, 256, 256);
  return g;
}
// Paint everything OUTSIDE a star-shaped hole (irises, mouth-shaped reveals, keyholes).
function irisShape(pts, col = PAL.ink, far = 4000) {
  const n = pts.length; let cx = 0, cy = 0; for (const p of pts) { cx += p[0]; cy += p[1]; } cx /= n; cy /= n;
  const out = p => { const dx = p[0] - cx, dy = p[1] - cy, d = Math.hypot(dx, dy) || 1; return [cx + dx / d * far, cy + dy / d * far]; };
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n], ex = (b[0] - a[0]) * .06, ey = (b[1] - a[1]) * .06;
    const a2 = [a[0] - ex, a[1] - ey], b2 = [b[0] + ex, b[1] + ey];
    paint([a2, b2, out(b2), out(a2)], { wash: col, washOp: 255, ink: null });
  }
}
function iris(cx, cy, r, col = PAL.ink) { if (r < 4) paint(rectPts(-60, -60, W + 120, H + 120), { wash: col, ink: null }); else irisShape(ellPts(cx, cy, r, r, 40), col); }

// POSTFX: set by a shot to grade the whole frame (reset every frame).
let POSTFX = null;
// POSTFX_AREAS: grades applied only inside screen-space polygons ([{ P: [[x, y], ...], fx: 'grayscale(.9)' }], 1920×1080
// units; reset every frame): a picture on a screen in the scene keeps its own grade (the outro's phone)
let POSTFX_AREAS = [];
// GRAIN_K: strength of the frame-wide paper grain (screen space), reset to 1 each frame; looks whose pieces carry their
// own texture (card) turn it down.
let GRAIN_K = 1;
let T = 0, paperG = null, grainC = null, letG = null, glowTex = null, outC = null, outX = null;
let LETTERS = [];

// ---------- geometry ----------
function rectPts(x, y, w, h, j = 0) {
  return [[x + jit(j), y + jit(j)], [x + w / 2 + jit(j), y + jit(j) * .5], [x + w + jit(j), y + jit(j)],
          [x + w + jit(j) * .5, y + h / 2], [x + w + jit(j), y + h + jit(j)], [x + w / 2 + jit(j), y + h + jit(j) * .5],
          [x + jit(j), y + h + jit(j)], [x + jit(j) * .5, y + h / 2]];
}
function ellPts(cx, cy, rx, ry, n = 28, j = 0, rot = 0) {
  const p = []; for (let i = 0; i < n; i++) { const a = rot + i / n * TAU; p.push([cx + Math.cos(a) * rx + jit(j), cy + Math.sin(a) * ry + jit(j)]); } return p;
}
function rrPts(x, y, w, h, r, j = 0) {
  const p = [], seg = 5, corner = (cx, cy, a0) => { for (let i = 0; i <= seg; i++) { const a = a0 + i / seg * Math.PI / 2; p.push([cx + Math.cos(a) * r + jit(j), cy + Math.sin(a) * r + jit(j)]); } };
  corner(x + w - r, y + r, -Math.PI / 2); corner(x + w - r, y + h - r, 0); corner(x + r, y + h - r, Math.PI / 2); corner(x + r, y + r, Math.PI);
  return p;
}
function starPts(cx, cy, r, inner = .38, n = 4, rot = -Math.PI / 2) {
  const p = []; for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, q = i % 2 ? r * inner : r; p.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q]); } return p;
}
// Smooth curve through the points (Catmull-Rom), n samples per span.
function through(P, n = 6) {
  if (P.length < 3) return P.slice();
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let k = 0; k < n; k++) {
      const u = k / n, u2 = u * u, u3 = u2 * u;
      out.push([0, 1].map(d => .5 * (2 * p1[d] + (p2[d] - p0[d]) * u + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * u2 + (3 * p1[d] - p0[d] - 3 * p2[d] + p3[d]) * u3)));
    }
  }
  out.push(P[P.length - 1]);
  return out;
}
// One side of a thick line (the path offset by its half-width), with its folds cut off: on the inside of a bend tighter
// than the half-width the offset runs past itself and back, a little loop (a swallowtail) that crossed the fill as a
// stray line and folded the shape over itself. Where the side crosses itself within maxLen of arc, the loop's points
// all go to the crossing (the count is kept: callers pair a ribbon's two sides point for point).
function unloop(S, maxLen) {
  const n = S.length, out = S.map(p => [p[0], p[1]]);
  const cross = (a, b, c, d) => {
    const rx = b[0] - a[0], ry = b[1] - a[1], sx = d[0] - c[0], sy = d[1] - c[1], den = rx * sy - ry * sx; if (Math.abs(den) < 1e-12) return null;
    const t = ((c[0] - a[0]) * sy - (c[1] - a[1]) * sx) / den, u = ((c[0] - a[0]) * ry - (c[1] - a[1]) * rx) / den;
    return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? [a[0] + rx * t, a[1] + ry * t] : null;
  };
  for (let i = 0; i < n - 3;) {
    let hit = -1, X = null, acc = 0;
    for (let j = i + 2; j < n - 1 && acc < maxLen; j++) { acc += Math.hypot(out[j][0] - out[j - 1][0], out[j][1] - out[j - 1][1]); const x = cross(out[i], out[i + 1], out[j], out[j + 1]); if (x) { hit = j; X = x; } }
    if (hit < 0) { i++; continue; }
    for (let k = i + 1; k <= hit; k++) out[k] = [X[0], X[1]];
    i = hit;
  }
  return out;
}
// Which way a limb bows, and how far (±1; 0 straight): its root → tip line's normal (nx, ny) = (-dy, dx) / d against the
// direction the joint points (px, py). Within ramp° of the joint pointing straight along the limb it swings through
// straight rather than flipping to the other side between two drawings (an elbow going in, out, in as a hand moves
// across that line: the user). The bowed rubber-hose arms (the bosses, the bots, the commuters) choose their side through
// this; the people's arms have their own arc (people.js ppElbowArc).
const bendSide = (nx, ny, px, py, ramp = 5) => clamp((nx * px + ny * py) / (Math.hypot(px, py) || 1) / Math.sin(ramp * Math.PI / 180), -1, 1);
// Tapered ribbon around a path (w0 wide at the start, w1 at the end), as one closed outline for paint().
// Tails, tentacles, noodly arms, painted glyphs: one shape with one outline, so nothing looks glued on.
function ribbon(P, w0, w1 = w0) {
  const C = through(P), n = C.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = C[Math.max(0, i - 1)], b = C[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, w = lerp(w0, w1, i / Math.max(1, n - 1)) / 2;
    L.push([C[i][0] - dy / d * w, C[i][1] + dx / d * w]); R.push([C[i][0] + dy / d * w, C[i][1] - dx / d * w]);
  }
  const m = 3 * Math.max(Math.abs(w0), Math.abs(w1));   // (a sharp corner's fold is about a width or two of arc)
  return unloop(L, m).concat(unloop(R, m).reverse());
}

// ---------- paint wrapper ----------
// One call = one painted shape: optional flat wash, optional watercolor fill, optional hatch, optional ink outline.
// p5.brush 2.2.3 loses strokes drawn far from the origin under a zoomed camera (from zoom ~2, an outline or a line
// leaves only a dot at its first vertex), so every shape and line is drawn around its own centre.
function centred(pts, draw) {
  if (!pts.length) return;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const [x, y] of pts) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  push(); translate(cx, cy); draw(pts.map(([x, y]) => [x - cx, y - cy])); pop();
}
function paint(pts, o = {}) { centred(pts, (P) => paintAt(P, o)); }
// PAINT_TINT: a look's colour mapping for everything painted (a function colour → colour, or null); demo/style.js
// sets it (the ink look's pastels on its cast)
let PAINT_TINT = null;
function paintAt(pts, o) {
  if (PAINT_TINT && (o.wash || o.fill)) o = { ...o, wash: o.wash && PAINT_TINT(o.wash), fill: o.fill && PAINT_TINT(o.fill) };
  if (o.wash || o.fill || o.hatch) {
    if (o.wash) brush.wash(o.wash, o.washOp ?? 255); else brush.noWash();
    if (o.fill) { brush.fill(o.fill, o.fillOp ?? 170); brush.fillBleed(o.bleed ?? .1); brush.fillTexture(o.tex ?? .4, o.border ?? .35); } else brush.noFill();
    if (o.hatch) { brush.hatch(o.hatch.d, o.hatch.a, o.hatch.o || { rand: .15 }); brush.hatchStyle(o.hatch.b || 'HB', o.hatch.c || PAL.ink, o.hatch.w || 1); } else brush.noHatch();
    brush.noStroke();
    if (o.curv) { brush.beginShape(o.curv); for (const p of pts) brush.vertex(p[0], p[1]); brush.endShape(true); }
    else brush.polygon(pts);
  }
  // the outline is one continuous tapered stroke, not a stroke per side
  if (o.ink !== null) {
    brush.noWash(); brush.noFill(); brush.noHatch(); brush.set(o.br || 'ink', o.ink || PAL.ink, o.sw ?? 1);
    brush.beginShape(o.curv || 0); for (const p of pts) brush.vertex(p[0], p[1]); brush.endShape(true);
  }
}
function inkLine(pts, sw = 1, col = PAL.ink, br = 'ink', curv = .5) {
  centred(pts, (P) => { brush.noFill(); brush.noWash(); brush.noHatch(); brush.set(br, col, sw); brush.spline(P, curv); });
}

// ---------- lettering (drawn on the 2D compositor, under the paper grain) ----------
// Use sparingly: see "No text" in ANIMATION_GUIDE.md. Clawd's emotes are painted and never need these.
function letter(txt, x, y, size, color, o = {}) {
  if (CAM && !o.screen) { [x, y] = toScreen(x, y); size *= CAM.zoom; o = { ...o, rot: (o.rot || 0) + CAM.rot }; if (o.font) o.font = o.font.replace(/(\d+(\.\d+)?)px/, (m, v) => (v * CAM.zoom) + 'px'); }
  LETTERS.push({ txt, x, y, size, color, ...o });
}
// Comic sound effect: pops in at age 0, wobbles, fades by `life` seconds.
function sfx(txt, x, y, size, color, age, o = {}) {
  const life = o.life ?? 1.2; if (age < 0 || age > life) return;
  letter(txt, x, y, size, color, { pop: age * 5, rot: (o.rot ?? -.08) + Math.sin(age * 20) * .03 * (1 - age / life), alpha: 1 - seg(age, life - .25, life), ...o });
}
function drawLetters(c) {
  for (const L of LETTERS) {
    const k = L.pop != null ? backOut(L.pop) : 1; if (k <= .01) continue;
    c.save(); c.translate(L.x, L.y); c.rotate(L.rot || 0); c.scale(k, k); c.globalAlpha = L.alpha ?? 1;
    c.font = L.font || `${L.size}px "Permanent Marker", "Comic Sans MS", cursive`;
    c.textAlign = L.align || 'center'; c.textBaseline = 'middle';
    if (L.stroke) { c.lineJoin = 'round'; c.lineWidth = L.size * .12; c.strokeStyle = L.stroke; c.strokeText(L.txt, 0, 0); }
    if (L.ink !== false) { c.fillStyle = PAL.ink; c.fillText(L.txt, L.size * .045, L.size * .055); }
    c.fillStyle = L.color; c.fillText(L.txt, 0, 0);
    c.restore();
  }
}

// p5.brush defers washes and strokes into a mask layer; a (tiny, off-screen) watercolor fill forces it to composite
// now, so everything painted before this call really lands under whatever p5 draws next (letters, glow).
function flushBrush() {
  push(); resetMatrix(); translate(-W / 2, -H / 2);
  brush.noStroke(); brush.noHatch(); brush.noWash(); brush.fill('#000000', 1); brush.fillBleed(0); brush.fillTexture(0, 0);
  brush.polygon([[-50, -50], [-40, -50], [-40, -40]]); brush.noFill(); pop();
}
// ---------- clipping: a picture inside a frame (a poster, a screen, a window's view, a bubble, a page) ----------
// clipPoly(P, fn, o): draw fn so it lands only inside the polygon P, in the current coordinates (world ones under
// camBegin), or screen pixels with o.screen. P is one polygon or a list of disjoint ones; any simple polygon works,
// concave too (it's filled by parity: overlapping polygons cancel). Everything drawn in fn is clipped: p5.brush's
// strokes and fills (its queue is flushed at both ends, so strokes queued inside composite through the clip), glow(),
// images, the bank look's raw triangles, and lettering queued inside (painted into the picture at the end, clipped,
// instead of over the whole frame at composite). It nests: a clip inside a clip lands in their intersection, p5's own
// beginClip/endClip inside one clips within it, and one inside p5's clip stays inside that. Unlike p5's beginClip, the
// mask paints nothing into the picture, so fn needn't cover its whole region. clipPush(P, o) / clipPop() are the same
// in two halves (always pair them). Cost: a few GL state reads and two stencil clears, ~0.1 ms.
// (The GL stencil, one bit per nesting level from 0x40 down; p5's clip uses bit 0x01 and horse2's h2ClipOn 0x80.)
const CLIPS = [];
function clipPoly(P, fn, o = {}) { clipPush(P, o); try { fn(); } finally { clipPop(); } }
function clipPush(P, o = {}) {
  flushBrush();
  const R = p5.instance._renderer, gl = R.GL, bit = 0x40 >> CLIPS.length;
  if (bit < 0x02 || !P || !P.length) { CLIPS.push(null); return; }   // (too deep, or nothing: draws unclipped)
  clipHooks(R);
  const polys = typeof P[0][0] === 'number' ? [P] : P, on = gl.isEnabled(gl.STENCIL_TEST);
  const S = { bit, on, user: R._userEnabledStencil, nLet: LETTERS.length, wm: gl.getParameter(gl.STENCIL_WRITEMASK),
    func: gl.getParameter(gl.STENCIL_FUNC), ref: gl.getParameter(gl.STENCIL_REF), vm: gl.getParameter(gl.STENCIL_VALUE_MASK),
    fail: gl.getParameter(gl.STENCIL_FAIL), zf: gl.getParameter(gl.STENCIL_PASS_DEPTH_FAIL), zp: gl.getParameter(gl.STENCIL_PASS_DEPTH_PASS) };
  // our bit cleared; with no clip in force, the whole stencil (p5 leaves 1s everywhere when its clip ends)
  clipClear(gl, on ? bit : 0xFF);
  if (!on) gl.stencilFunc(gl.ALWAYS, 0, 0xFF);
  gl.enable(gl.STENCIL_TEST);   // (through p5's hook, which marks it the user's: p5's own push/pop then leave it on)
  // the mask: each polygon as a fan, flipping our bit where the enclosing clip's test (still in force) passes; no colour
  gl.stencilMask(bit); gl.stencilOp(gl.KEEP, gl.KEEP, gl.INVERT);
  const dt = gl.isEnabled(gl.DEPTH_TEST); if (dt) gl.disable(gl.DEPTH_TEST);
  gl.colorMask(false, false, false, false);
  push(); if (o.screen) { resetMatrix(); translate(-W / 2, -H / 2); } noStroke(); fill(0);
  beginShape(TRIANGLES);
  for (const Q of polys) for (let i = 1; i + 1 < Q.length; i++) { vertex(Q[0][0], Q[0][1]); vertex(Q[i][0], Q[i][1]); vertex(Q[i + 1][0], Q[i + 1][1]); }
  endShape(); pop();
  gl.colorMask(true, true, true, true); if (dt) gl.enable(gl.DEPTH_TEST);
  // from here on only our bit is tested (it was only set where the enclosing clip passed)
  gl.stencilMask(0x00); gl.stencilFunc(gl.EQUAL, bit, bit); gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
  CLIPS.push(S);
}
function clipPop() {
  const S = CLIPS.pop(); if (!S) return;
  if (LETTERS.length > S.nLet) { const keep = LETTERS.splice(0, S.nLet); flushLetters(); LETTERS = keep; }   // (ours, into the picture)
  flushBrush();
  const R = p5.instance._renderer, gl = R.GL;
  clipClear(gl, S.bit);
  gl.stencilMask(S.wm); gl.stencilFunc(S.func, S.ref, S.vm); gl.stencilOp(S.fail, S.zf, S.zp);
  if (!S.on) gl.disable(gl.STENCIL_TEST);
  R._userEnabledStencil = S.user;
}
// clear the stencil bits in mask (whatever the scissor)
function clipClear(gl, mask) {
  const sc = gl.isEnabled(gl.SCISSOR_TEST); if (sc) gl.disable(gl.SCISSOR_TEST);
  gl.stencilMask(mask); gl.clearStencil(0); gl.clear(gl.STENCIL_BUFFER_BIT);
  if (sc) gl.enable(gl.SCISSOR_TEST);
}
// p5's beginClip clears the whole stencil and its end sets it all to 1, so inside one of ours it would wipe ours out.
// While ours are in force it keeps to bit 0x01 and to the inside of our innermost clip, and gives ours back after.
function clipHooks(R) {
  if (R._clipPolyHooked) return; R._clipPolyHooked = true;
  const A = R._applyClip, U = R._unapplyClip, C = R._clearClipBuffer, top = () => { for (let i = CLIPS.length - 1; i >= 0; i--) if (CLIPS[i]) return CLIPS[i]; return null; };
  R._applyClip = function () {
    const c = top(); if (!c) return A.call(this);
    const gl = this.GL; clipClear(gl, 0x01);
    this._internalEnable.call(gl, gl.STENCIL_TEST); this._stencilTestOn = true;
    gl.stencilMask(0x01); gl.stencilFunc(gl.EQUAL, c.bit | 1, c.bit); gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);   // (writes the ref's bit 1)
    gl.disable(gl.DEPTH_TEST);
  };
  R._unapplyClip = function () {
    const c = top(); if (!c) return U.call(this);
    const gl = this.GL;
    gl.stencilMask(0x00); gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP); gl.stencilFunc(gl.EQUAL, this._clipInvert ? c.bit : c.bit | 1, c.bit | 1);
    gl.enable(gl.DEPTH_TEST);
  };
  R._clearClipBuffer = function () {
    const c = top(); if (!c) return C.call(this);
    const gl = this.GL; clipClear(gl, 0x01);
    gl.stencilMask(0x00); gl.stencilFunc(gl.EQUAL, c.bit, c.bit); gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);   // (ours again; the test stays on)
  };
}
// ---------- p5.brush at high draw density (both change speed only, not a pixel) ----------
// p5.brush composites every fill through a 2D canvas the size of the whole drawing (7680x4320 at --ss=4), whose paths
// Chrome draws through a multisampled buffer (1-1.3 GB at that size) that it allocates afresh for each composite. When
// the GPU runs behind, each allocation finds the last one still busy and takes new video memory: 16 GB fills within a
// frame, spills into system memory and thrashes (supersampled card frames took 4-5 s). Waiting for the GPU after each
// fill upload lets the driver hand the same buffer straight back. Worth it only above density 2 (smaller buffers fit;
// there the waits cost more than they save), and only while the canvas multisamples: under Chrome's --msaa_is_slow it
// doesn't (a slightly different anti-aliasing of the fill edges), and then the waits only cost.
function brushWaitAfterFills(gl) {
  const upload = gl.texSubImage2D, read = gl.readPixels, px = new Uint8Array(4), tex = gl.createTexture(), fb = gl.createFramebuffer();
  const tex0 = gl.getParameter(gl.TEXTURE_BINDING_2D), fb0 = gl.getParameter(gl.FRAMEBUFFER_BINDING);
  gl.bindTexture(gl.TEXTURE_2D, tex); gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, 1, 1);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb0); gl.bindTexture(gl.TEXTURE_2D, tex0);
  // (the fill composite is the only upload from an OffscreenCanvas; reading one pixel of a private 1x1 target waits
  // for the GPU without resolving the multisampled canvas, which a read of the canvas itself would)
  gl.texSubImage2D = function (...a) {
    const r = upload.apply(this, a);
    if (typeof OffscreenCanvas !== 'undefined' && a[a.length - 1] instanceof OffscreenCanvas) {
      const rf = this.getParameter(this.READ_FRAMEBUFFER_BINDING);
      this.bindFramebuffer(this.READ_FRAMEBUFFER, fb); read.call(this, 0, 0, 1, 1, this.RGBA, this.UNSIGNED_BYTE, px); this.bindFramebuffer(this.READ_FRAMEBUFFER, rf);
    }
    return r;
  };
}
// p5.brush also clears both of its whole-canvas mask framebuffers (fill and stroke) around every composite: ~1300 full
// clears a frame, a tenth of the GPU time at 7680 px. All it draws into them lies inside the dirty rect it tracks (in
// screen pixels, rows from the top, as the masks store them), and the fill blend reads at most 3 px beyond that rect, so
// clearing the rect plus a margin, or nothing when nothing was drawn, leaves the masks exactly as a full clear would.
function brushTightClears(inst) {
  const clear = inst.clear, M = 16;
  inst.clear = function (...a) {
    const fb = a.length ? null : this._renderer.activeFramebuffer();
    const r = !fb ? undefined : fb === this.fillMaskFramebuffer ? this.mask?.dirtyRect : fb === this.glMask ? fb.dirtyRect : undefined;
    if (r === undefined || (r === null && fb !== this.glMask)) return clear.apply(this, a);   // not a mask, or a full composite
    if (r === null) return this;   // stroke mask with nothing drawn since its last clear: already clear
    const gl = this._renderer.GL, w = fb.width * fb.density, h = fb.height * fb.density;
    if (gl.isEnabled(gl.SCISSOR_TEST)) return clear.apply(this, a);   // (p5.brush never clears inside its scissored passes)
    const x0 = Math.max(0, Math.floor(r.minX) - M), y0 = Math.max(0, Math.floor(r.minY) - M), x1 = Math.min(w, Math.ceil(r.maxX) + M), y1 = Math.min(h, Math.ceil(r.maxY) + M);
    if (x1 <= x0 || y1 <= y0) return this;
    // (no getParameter reads to restore state: most are a round trip to the GPU process; p5 sets its own clear colour
    // before every clear and never uses the scissor, and p5.brush sets the box whenever it turns the scissor on)
    gl.enable(gl.SCISSOR_TEST); gl.scissor(x0, y0, x1 - x0, y1 - y0); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.disable(gl.SCISSOR_TEST);
    return this;
  };
}
// Paint the queued lettering into the scene itself, so later layers (wipes) cover it. drawWorld calls this after each
// frame; call it yourself before a wipe or iris if the shot has lettering, or the letters will sit on top of it.
function flushLetters() {
  if (!LETTERS.length) return;
  letG.clear(); drawLetters(letG.drawingContext); LETTERS = [];
  flushBrush();
  // Letters are already in screen space, so composite them with the base transform even inside camBegin().
  push(); resetMatrix(); translate(-W / 2, -H / 2); image(letG, 0, 0); pop();
}

// ---------- paper ----------
function lcg(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function makePaper() {
  const g = createGraphics(W, H); g.pixelDensity(DENS); const c = g.drawingContext, rnd = lcg(11); c.scale(DENS, DENS);
  c.fillStyle = PAL.paper; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++) { const x = rnd() * W, y = rnd() * H, r = 120 + rnd() * 380, gr = c.createRadialGradient(x, y, 0, x, y, r), a = .045 * rnd(); gr.addColorStop(0, `rgba(160,125,80,${a})`); gr.addColorStop(1, 'rgba(160,125,80,0)'); c.fillStyle = gr; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
  c.lineWidth = 1;
  for (let i = 0; i < 1400; i++) { const x = rnd() * W, y = rnd() * H, l = 6 + rnd() * 26, a = rnd() * TAU; c.strokeStyle = `rgba(110,88,60,${.035 + rnd() * .06})`; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a + .6) * l * .5, y + Math.sin(a + .6) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
  return g;
}
// Static grain + vignette, multiplied over the painted frame so pigment sits "in" the paper.
function makeGrain() {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d'), rnd = lcg(5);
  const id = c.createImageData(W, H), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const v = 255 - (rnd() < .55 ? rnd() * rnd() * 34 : 0); d[i] = v; d[i + 1] = v - 1; d[i + 2] = v - 3; d[i + 3] = 255; }
  c.putImageData(id, 0, 0);
  const g = c.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * 1.05); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(120,95,70,.35)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  return cv;
}

// ---------- custom brushes ----------
function defineBrushes() {
  brush.add('ink', { type: 'default', weight: 5, scatter: .25, sharpness: .8, grain: 40, opacity: 235, spacing: .2, pressure: [1.15, .75], rotate: 'natural', noise: .15 });
  brush.add('inkfine', { type: 'default', weight: 2.6, scatter: .15, sharpness: .85, grain: 40, opacity: 230, spacing: .2, pressure: [1.1, .8], rotate: 'natural', noise: .1 });
  brush.add('dry', { type: 'default', weight: 14, scatter: 3, sharpness: .3, grain: 6, opacity: 90, spacing: .6, pressure: [1, .6], rotate: 'natural', noise: .4 });
}

// ---------- frame ----------
async function setup() {
  createCanvas(W, H, WEBGL); pixelDensity(DENS); noLoop();
  brushTightClears(p5.instance); if (DENS > 2 && !new URLSearchParams(location.search).has('msaaslow')) brushWaitAfterFills(drawingContext);   // (render.mjs sets msaaslow with Chrome's --msaa_is_slow)
  brush.scaleBrushes(5); defineBrushes();
  paperG = makePaper(); grainC = makeGrain(); glowTex = makeGlowTex(); letG = createGraphics(W, H); letG.pixelDensity(DENS);
  outC = document.getElementById('out'); outC.width = W * OS; outC.height = H * OS; outX = outC.getContext('2d');
  await document.fonts.load('100px "Permanent Marker"');
  window.ready = true;
  if (!location.search.includes('render')) devUI();
}
function draw() {
  if (!window.ready) return;
  LETTERS = []; CAM = LAST_CAM = null; POSTFX = null; POSTFX_AREAS = []; GRAIN_K = 1;
  push(); translate(-W / 2, -H / 2);
  BOILN = Math.floor(T * BOIL); CLAWD_N = 0; boilSeed('frame'); noiseSeed(77);
  image(paperG, 0, 0);
  drawWorld(T);
  pop();
}
// The drawing's downsample to the output size. Where the drawing is a whole number R > 2 times the output (1080p at
// --ss=3 or --ss=4), a box filter on the GPU (boxDown): each output pixel the plain average of the R × R drawing pixels
// it covers, so a line keeps its tone wherever it falls on the pixel grid. Chrome's drawImage filters a 3:1 downsample
// through a mipmap: a line one drawing pixel wide came out anywhere from 13% to 36% dark by where it fell (a fine line
// beaded into dashes and crawled as the camera moved) and a solid line's tone swung ±11%. At 2:1 (1080p at --ss=2; the
// 4K master, --os=2 --ss=4) its bilinear filter already is that exact average (measured), so drawImage is kept there,
// and when nothing is supersampled. ?boxdown=0: drawImage everywhere (a check).
const BOX = { R: DENS / OS, gl: null, cv: null, fail: false };
BOX.on = BOX.R > 2 && Number.isInteger(BOX.R) && new URLSearchParams(location.search).get('boxdown') !== '0';
function boxDown(src) {
  if (!BOX.on || BOX.fail) return src;
  try {
    let gl = BOX.gl;
    if (!gl) {
      const cv = document.createElement('canvas'); cv.width = W * OS; cv.height = H * OS;
      gl = cv.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: true });
      if (!gl) throw new Error('no WebGL2');
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
      const p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, '#version 300 es\nvoid main() { vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)); gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }'));
      gl.attachShader(p, sh(gl.FRAGMENT_SHADER, '#version 300 es\nprecision highp float; precision highp int; uniform highp sampler2D uS; uniform int uR; out vec4 o;\n' +
        'void main() { ivec2 b = ivec2(gl_FragCoord.xy) * uR; vec3 s = vec3(0.0); for (int j = 0; j < uR; j++) for (int i = 0; i < uR; i++) s += texelFetch(uS, b + ivec2(i, j), 0).rgb; o = vec4(s / float(uR * uR), 1.0); }'));
      gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      gl.useProgram(p); gl.uniform1i(gl.getUniformLocation(p, 'uS'), 0); gl.uniform1i(gl.getUniformLocation(p, 'uR'), BOX.R);
      const tex = gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
      for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.NEAREST], [gl.TEXTURE_MAG_FILTER, gl.NEAREST], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
      gl.viewport(0, 0, cv.width, cv.height);
      BOX.gl = gl; BOX.cv = cv;
    }
    if (src.width !== BOX.cv.width * BOX.R || src.height !== BOX.cv.height * BOX.R) return src;
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, src);   // (bottom row first: UNPACK_FLIP_Y, as the output's rows count)
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    return BOX.cv;
  } catch (e) { console.warn('boxDown off:', e.message || e); BOX.fail = true; return src; }
}
function composite(t) {
  const c = outX, src = boxDown(drawingContext.canvas);
  c.setTransform(OS, 0, 0, OS, 0, 0);   // everything below is in 1920x1080 units; OS scales it to the output size
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
  if (POSTFX) c.filter = POSTFX;   // a shot's whole-frame grade (a CSS filter string, e.g. 'grayscale(.8) contrast(1.1)')
  c.drawImage(src, 0, 0, W, H);
  c.filter = 'none';
  for (const A of POSTFX_AREAS) {   // (each area: the frame drawn again through its grade, clipped to its polygon)
    c.save(); c.beginPath(); A.P.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.clip();
    c.filter = A.fx; c.drawImage(src, 0, 0, W, H); c.restore();
  }
  drawLetters(c);
  c.globalCompositeOperation = 'multiply'; c.globalAlpha = GRAIN_K; c.drawImage(grainC, 0, 0); c.globalAlpha = 1;
  c.globalCompositeOperation = 'source-over';
}
window.renderAt = async (t, type = 'image/png', q = .92) => { T = t; await redraw(); composite(t); return outC.toDataURL(type, q); };
// Contact sheet of several times, for visual checks: returns { url, ms[] }. crop = [x, y, w, h] fills each cell with just
// that region of the frame, at full resolution (for checking faces, hands and contacts up close). at = [x, y, w, h]
// instead crops w × h around the WORLD point (x, y), wherever each frame's camera put it (a foot, a splash, a prop on
// a moving shot); x and y may be expressions evaluated in the page.
window.renderSheet = async (times, cols = 3, w = 640, crop = null, at = null) => {
  if (at) at = at.map((v) => typeof v === 'string' ? (0, eval)(v) : v);
  const [, , cw, ch] = at || crop || [0, 0, W, H], h = Math.round(w * ch / cw), rows = Math.ceil(times.length / cols), sc = document.createElement('canvas');
  sc.width = cols * w; sc.height = rows * h; const c = sc.getContext('2d'), ms = [];
  for (let i = 0; i < times.length; i++) {
    const t0 = performance.now(); T = times[i]; await redraw(); composite(times[i]); ms.push(Math.round(performance.now() - t0));
    const x = (i % cols) * w, y = Math.floor(i / cols) * h;
    const [cx, cy] = at ? toScreen(at[0], at[1], LAST_CAM).map((v, j) => v - (j ? ch : cw) / 2) : crop || [0, 0];
    c.drawImage(outC, cx * OS, cy * OS, cw * OS, ch * OS, x, y, w, h); c.fillStyle = 'rgba(0,0,0,.65)'; c.fillRect(x, y, 84, 24); c.fillStyle = '#fff'; c.font = '15px sans-serif'; c.fillText(times[i].toFixed(2) + 's', x + 6, y + 17);
  }
  return { url: sc.toDataURL('image/jpeg', .9), ms };
};
window.gpuInfo = () => { const gl = drawingContext, e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); };

function devUI() {
  const s = document.getElementById('scrub'), lab = document.getElementById('tt'); s.max = window.LOOP ? window.LOOP.len : FILM_END;
  let busy = false, want = null;
  const go = async () => { if (busy) return; busy = true; while (want != null) { const t = want; want = null; const t0 = performance.now(); await window.renderAt(t); lab.textContent = `${t.toFixed(2)}s  ·  ${Math.round(performance.now() - t0)} ms/frame`; } busy = false; };
  s.addEventListener('input', () => { want = +s.value; go(); });
  want = +(new URLSearchParams(location.search).get('t') || 0); s.value = want; go();
}

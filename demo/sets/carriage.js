// carriage.js: the night train (the present). Noir: ink and grey, the parka the one colour, neon and phone light.
// Layers: carriageBack (wall, window + whatever is outside it, luggage rack, neon ad, headrest), then the shot draws
// him, then carriageFront (the bay table and what's on it). World coordinates = screen coordinates at zoom 1.
//
// The window is exactly 16:9 (WIN) so a camera push into it lands on a full frame: pastScene drawn at WIN.s from
// WIN.x, WIN.y fills the glass exactly, and camera zoom WIN.fill puts the glass edge-to-edge on screen.
const WIN = { x: 90, y: 92, w: 1040, h: 585, r: 64 };
WIN.cx = WIN.x + WIN.w / 2; WIN.cy = WIN.y + WIN.h / 2; WIN.s = WIN.w / W; WIN.fill = W / WIN.w;
const CAR = { wall: '#2A2530', wallDk: '#1E1A23', wallLt: '#3A3440', trim: '#54505A', table: '#5C5A60', tableDk: '#3E3C44', tableLt: '#7A7880',
  moq: '#2C3450', moqDk: '#1E2438', moqA: '#4A5A84', moqB: '#7A3A4A', night: '#10141E', nightLt: '#1C2330' };
const TABLE_Y = 812;

// The world outside at night: flat dark bands, passing sodium lights and the odd lit window of a house.
function nightOutside(t) {
  boilSeed('night');
  piece(U([[-60, -60], [W + 60, -60], [W + 60, H + 60], [-60, H + 60]], 1), CAR.night, { ink: null, key: 'night', lift: 0, flatCard: true, edge: false });
  piece(U([[-60, 560], [W + 60, 540], [W + 60, H + 60], [-60, H + 60]], 1), CAR.nightLt, { ink: null, key: 'embank', lift: 0, flatCard: true, edge: false });
  for (let i = 0; i < 7; i++) {   // houses sliding by (the train moves toward screen left, so the world slides right)
    const x = ((i * 380 + t * 520) % 2660) - 370, h = 120 + 90 * hash(i + 3), y = 560 - h;
    boilSeed('house' + i);
    piece(curvy(U([[0, 0], [150, 0], [150, h], [0, h]], 1).map(([a, b]) => [x + a, y + b]), 1), '#161A26', { ink: null, key: 'house' + i, lift: 0, flatCard: true, edge: false });
    piece(U([[40, -60], [110, -60], [150, 0], [0, 0]], 1).map(([a, b]) => [x + a, y + b]), '#161A26', { ink: null, key: 'roof' + i, lift: 0, flatCard: true, edge: false });
    if (hash(i + 9) > .35) { piece(U([[55, 30], [95, 30], [95, 75], [55, 75]], 1).map(([a, b]) => [x + a, y + b]), '#E8B85A', { ink: null, key: 'hw' + i, lift: 0, flatCard: true, edge: false }); glow(x + 75, y + 52, 60, NOIR.lamp, .5); }
  }
  for (let i = 0; i < 5; i++) { const x = ((i * 560 + t * 900) % 2800) - 400; glow(x, 300, 90, '#FF9A3A', .7); glow(x, 300, 30, '#FFE0A0', .8); }   // sodium lamps
}
// Rain on the glass: streaks running down and a few beads, over the view, inside the window.
function rainOnGlass(t) {
  boilSeed('rain');
  for (let i = 0; i < 34; i++) {
    const rx = WIN.x + 20 + hash(i) * (WIN.w - 40), sp = .35 + hash(i + 9) * .5, ry = WIN.y + frac(hash(i + 50) + t * sp) * WIN.h;
    dline([[rx, ry], [rx - 7, ry + 30]], .9, '#9AA4B4', 0);
  }
  for (let i = 0; i < 18; i++) { const bx = WIN.x + 30 + hash(i + 70) * (WIN.w - 60), by = WIN.y + 30 + hash(i + 90) * (WIN.h - 60); piece(oval(bx, by, 3.5, 4.5, 0, 8), '#8A95A6', { ink: null, op: 200, key: 'bead' + i, lift: 0, flatCard: true, edge: false }); }
}
// o.view(t): draws what's outside (default: the night). o.reveal 0..1: a circle of o.view opens in the middle of a
// night view (the daydream taking over the window). o.ad: draw the neon ad (default true).
function carriageBack(t, lt, o = {}) {
  const view = o.view || nightOutside;
  if (o.reveal > 0) {
    view(t);
    const r = lerp(0, WIN.w * .7, easeIn(o.reveal));
    if (o.reveal < 1) { irisShape(oval(WIN.cx, WIN.cy, r, r, 0, 40), CAR.night); glow(WIN.cx, WIN.cy, r * 1.1, NOIR.lamp, .25 * (1 - o.reveal)); }
  } else view(t);
  rainOnGlass(t);
  // the wall, with a window-shaped hole
  const glass = curvy(rrPts(WIN.x, WIN.y, WIN.w, WIN.h, WIN.r), 3);
  boilSeed('wall'); irisShape(glass, CAR.wall);
  boilSeed('frame');
  if (STYLE.card) { dline(shiftP(glass, 4, 6).concat([shiftP(glass, 4, 6)[0]]), 5, '#0C0A10', 0); dline(glass.concat([glass[0]]), 1.2, mixCol(CAR.wall, '#FFF7EA', .45), 0); }   // the wall's cut edge and its shadow on the view
  else dline(glass.concat([glass[0]]), 3, NOIR.ink, 0);
  const outer = curvy(rrPts(WIN.x - 26, WIN.y - 26, WIN.w + 52, WIN.h + 52, WIN.r + 26), 3);
  dline(outer.concat([outer[0]]), 3.2, CAR.trim, 0);
  dline([[WIN.x - 26, WIN.y + WIN.h + 40], [WIN.x + WIN.w + 26, WIN.y + WIN.h + 40]], 2, CAR.wallLt, 0);   // the sill
  // luggage rack across the top right
  boilSeed('rack');
  for (const ry of [36, 58]) dline([[1180, ry], [W + 20, ry - 4]], 3, CAR.trim, 0);
  for (let i = 0; i < 6; i++) dline([[1210 + i * 130, 30], [1215 + i * 130, 62]], 1.4, CAR.trim, 0);
  // wall panel seam and the lower wall
  dline([[1165, 60], [1170, TABLE_Y]], 1.2, NOIR.ink, 0);
  // the neon ad: an advert for the future, grinning down at him
  if (o.ad !== false) neonAd(t, 1600, 105, 290, 230);
  // headrest of the seat behind him: British train moquette
  boilSeed('headrest');
  const hr = curvy(U([[1200, 330], [1560, 330], [1590, 410], [1590, TABLE_Y + 60], [1170, TABLE_Y + 60], [1170, 410]], 1), 3);
  piece(hr, CAR.moq, { sw: 2.2, shade: CAR.moqDk, depth: 40, key: 'headrest', lift: 6 });
  moquette(1190, 350, 390, TABLE_Y - 300);
  // a tunnel light sweeping through the carriage every few seconds
  const sw = frac(t / 2.6); if (sw < .3) glow(lerp(-300, W + 300, sw / .3), 420, 600, NOIR.lamp, .35);
  glow(1400, 0, 700, '#C8D8E0', .12);   // the ceiling strip light
}
// Moquette: a repeating geometric weave in muted colours (stable, drawn as small pieces).
function moquette(x, y, w, h) {
  boilSeed('moq');
  for (let r = 0; r < Math.floor(h / 46); r++) for (let c = 0; c < Math.floor(w / 46); c++) {
    const px = x + c * 46 + (r % 2) * 23, py = y + r * 46, k = (r * 7 + c * 3) % 5;
    if (px > x + w - 20) continue;
    if (k < 2) piece(U([[0, -9], [9, 0], [0, 9], [-9, 0]], 1).map(([a, b]) => [px + a, py + b]), k ? CAR.moqA : CAR.moqB, { ink: null, key: 'mq' + r + '_' + c, lift: 0, flatCard: true, edge: false });
    else if (k === 2) dline([[px - 8, py], [px + 8, py]], 1.2, CAR.moqA, 0);
  }
}
// The neon ad: two grinning figures in a pink neon frame, with a flicker.
function neonAd(t, x, y, w, h) {
  boilSeed('ad');
  const flick = hash(Math.floor(t * 12) + 7) < .06 ? .25 : 1;
  piece(curvy(U([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], 1), 2), '#18121E', { sw: 2, key: 'adpanel', lift: 4 });
  glow(x + w / 2, y + h / 2, w * .5, NOIR.neonM, .12 * flick);
  if (typeof musk === 'function') musk(x + w * .33, y + h * .56 + 11.3 * 14, 14, { ...feel('smug', t), mouth: 'grin', layer: 'head', view: 'q', boilKey: 'adM', noShadow: true });
  else piece(oval(x + w * .3, y + h * .55, 60, 80, 0, 20), '#3A3440', { key: 'adph1', lift: 2 });
  if (typeof grok === 'function') { push(); translate(x + w * .74, y + h - 10); grok(0, 0, 16, { ...feel('mischief', t), boilKey: 'adG', noShadow: true }); pop(); }
  else piece(oval(x + w * .72, y + h * .6, 50, 60, 0, 20), '#2E6E68', { key: 'adph2', lift: 2 });
  boilSeed('admask'); piece(U([[x - 30, y + h], [x + w + 30, y + h], [x + w + 30, y + h + 260], [x - 30, y + h + 260]], 1), CAR.wall, { ink: null, key: 'admask', lift: 0, flatCard: true, edge: false });
  boilSeed('neon');
  const frame = curvy(rrPts(x, y, w, h, 26), 2);
  dline(frame.concat([frame[0]]), 4, NOIR.neonM, 0);
  dline(frame.concat([frame[0]]), 1.4, '#FFD0E6', 0);
  for (let i = 0; i < 6; i++) { const gx = x + (i % 3) / 2 * w, gy = i < 3 ? y : y + h; glow(gx, gy, 110, NOIR.neonM, .45 * flick); }
}
// The bay table in front of him: laminate top, a rounded front edge, a takeaway cup.
function carriageFront(t, lt, o = {}) {
  boilSeed('table');
  const top = curvy(U([[900, TABLE_Y], [W + 60, TABLE_Y - 6], [W + 60, TABLE_Y + 70], [930, TABLE_Y + 76]], 1), 3);
  piece(U([[905, TABLE_Y + 60], [W + 60, TABLE_Y + 55], [W + 60, H + 60], [905, H + 60]], 1), CAR.tableDk, { sw: 2.4, key: 'tablefront', lift: 6 });
  piece(top, CAR.table, { sw: 2.4, rim: NOIR.light, key: 'tabletop', lift: 6 });
  dline([[940, TABLE_Y + 22], [1400, TABLE_Y + 18]], 1, CAR.tableLt, 0);
  if (o.cup !== false) {   // takeaway coffee, steam curling
    const cx = 1760, cy = TABLE_Y + 34;
    piece(curvy(U([[-34, -90], [34, -90], [26, 0], [-26, 0]], 1).map(([a, b]) => [cx + a, cy + b]), 2), '#E8E0D2', { sw: 1.8, shade: '#B8AE9E', depth: 14, key: 'cup', lift: 5 });
    piece(curvy(U([[-38, -104], [38, -104], [38, -88], [-38, -88]], 1).map(([a, b]) => [cx + a, cy + b]), 2), '#3A3440', { sw: 1.6, key: 'lid', lift: 3 });
    piece(curvy(U([[-30, -60], [30, -60], [28, -34], [-28, -34]], 1).map(([a, b]) => [cx + a, cy + b]), 2), '#8A6A4A', { sw: 1.2, key: 'sleeve', lift: 2 });
    for (let k = 0; k < 2; k++) { const ph = frac(t * .4 + k * .5), sy = cy - 110 - ph * 90; dline([[cx - 8 + k * 14, sy + 30], [cx - 16 + k * 14 + Math.sin(ph * 6 + k) * 10, sy + 10], [cx - 6 + k * 14, sy - 10]], 1.4 * (1 - ph), '#8A8690', .5); }
  }
}

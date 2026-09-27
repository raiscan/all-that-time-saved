// lib.js: helpers for the chapter files.
// Lyrics: LY('Nine o\'clock') → the line whose text starts with that (its start, end, words [[t0, t1], ...], voice).
//         WT('Nine o\'clock', 3) → when word 3 of that line starts (song time). For timing actions to the words.
const LY = (prefix, n = 0) => { const ls = LYRICS.lines.filter(l => l.text.replace(/^["'(]+/, '').startsWith(prefix.replace(/^["'(]+/, ''))); return ls[n] || null; };
const WT = (prefix, i = 0, n = 0) => { const l = LY(prefix, n); return l ? l.words[Math.min(i, l.words.length - 1)][0] : null; };
// Board: the shot's entry, and its bars as song times.
const SB = id => BOARD.find(s => s.id === id);
const BAR = b => b < BEATMAP.bars.length ? BEATMAP.bars[b] : DUR;
// Draw another shot at song time t (shots are pure functions of time, so a shot can render its neighbour for a
// transition: e.g. the last frame of the previous shot under a wipe). Uses the other shot's own look.
function drawShot(id, t) {
  const s = SB(id); if (!s || !SHOT[id]) return false;
  const t0 = BAR(s.bar[0]), t1 = BAR(s.bar[1]); SHOT[id](t, t - t0, t1 - t0); return true;
}
// A finished drawing lying on paper doesn't boil: draw fn with the clock frozen at `at`, so every look's line boil
// (seeded from the boil frame) and anything time-driven inside it hold still. The caller's look() afterwards re-seeds
// from the real clock.
function stillDrawing(fn, at = 0) { const T0 = T; T = at; try { fn(); } finally { T = T0; } }

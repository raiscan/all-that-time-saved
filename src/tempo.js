// tempo.js: the song's tempo map drives the beat clock. Load it after src/beatmap.js (made by tools/beatmap.py):
// bpOf(t), and with it pulse(), beatN() and every beat-locked idle and dance, then follows the song's real beats,
// including the small phase slips at the seams of a stitched song, instead of a fixed PROJECT.bpm grid.
//   barOf(t): bar position (bar index + fraction) · barN(t): bar index · barPulse(t, k): 1 on each downbeat, decays
function tempoLookup(B, P) {
  return t => {
    if (t <= B[0]) return (t - B[0]) / P;
    const n = B.length - 1;
    if (t >= B[n]) return n + (t - B[n]) / P;
    let lo = 0, hi = n; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (B[m] <= t) lo = m; else hi = m; }
    return lo + (t - B[lo]) / (B[hi] - B[lo]);
  };
}
const TEMPO_BP = typeof BEATMAP === 'undefined' ? null : tempoLookup(BEATMAP.beats, 60 / BEATMAP.bpm);
const barOf = typeof BEATMAP === 'undefined' ? t => bpOf(t) / 4 : tempoLookup(BEATMAP.bars, 240 / BEATMAP.bpm);
const barN = t => Math.floor(barOf(t));
const barPulse = (t, k = 6) => Math.exp(-frac(barOf(t)) * 4 * k);

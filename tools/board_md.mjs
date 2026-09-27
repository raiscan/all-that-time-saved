// board_md.mjs: writes docs/STORYBOARD.md from video/board.js (the storyboard's single source), with real times from
// the song's bar map and the lyrics sung in each shot.   node tools/board_md.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const load = (f, name) => new Function(readFileSync(f, 'utf8') + `\nreturn ${name};`)();
const BOARD = load('video/board.js', 'BOARD'), BEATMAP = load('src/beatmap.js', 'BEATMAP'), LYRICS = load('src/lyrics.js', 'LYRICS');
// (bars past the song's map: the song's end; past that, the credits' end: they run PROJECT.credits.len after the song)
const CREDITS = load('video/config.js', 'PROJECT').credits || {};
const bars = BEATMAP.bars, dur = BEATMAP.duration, at = b => b < bars.length ? bars[b] : b > bars.length ? dur + (+CREDITS.len || 0) : dur;
const mmss = s => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;
const LOOK = { ink: 'rubber hose (past)', card: 'card (present)', doodle: 'doodle (good future)', xerox: 'riso (bad future)', bank: 'banknote (money)', all: 'all four' };
const look = l => l.split(/([>+])/).map(p => p === '>' ? ' → ' : p === '+' ? ' + ' : LOOK[p] || p).join('');
// a line the two of them share (wordVoice: a voice per word) splits where the voice changes
const parts = l => {
  const w = l.text.split(/\s+/).filter(Boolean), v = l.wordVoice;
  if (!v || v.length !== w.length || new Set(v).size < 2) return [{ voice: l.voice, text: l.text }];
  const out = [];
  w.forEach((x, i) => { const p = out[out.length - 1]; if (p && p.voice === v[i]) p.text += ' ' + x; else out.push({ voice: v[i], text: x }); });
  return out;
};
let md = `# All That Time Saved: storyboard\n\nGenerated from \`video/board.js\` by \`node tools/board_md.mjs\`; edit the board, not this file.\nTimes come from the song's tempo map (1 bar ≈ ${(240 / BEATMAP.bpm).toFixed(2)} s). Lyrics show what's sung during each shot; voice F = Tess (her), M = Rowan (him).\n\nMedia: rubber hose = the past (the promise); card = the present (the two of them); doodle = the good future (their hope); riso = the bad future (the decay); banknote = money and power.\n`;
let sec = null;
for (const s of BOARD) {
  const t0 = at(s.bar[0]), t1 = at(s.bar[1]);
  if (s.sec !== sec) { sec = s.sec; md += `\n## ${sec}\n`; }
  const sung = LYRICS.lines.filter(l => !l.backing && l.start >= t0 - .2 && l.start < t1 - .2).flatMap(l => parts(l).map(p => `${p.voice || '?'}: ${p.text}`));
  md += `\n**${s.id}** · bars ${s.bar[0]}–${s.bar[1]} · ${mmss(t0)}–${mmss(t1)} (${(t1 - t0).toFixed(1)} s) · ${look(s.look)} · ${s.who}${s.scene ? ` · concept scene: \`${s.scene}\`` : ''}\n\n${s.what}\n\n*In:* ${s.in}\n`;
  if (sung.length) md += `\n> ${sung.join('  \n> ')}\n`;
}
writeFileSync('docs/STORYBOARD.md', md);
console.log(`docs/STORYBOARD.md: ${BOARD.length} shots, ${mmss(at(BOARD[BOARD.length - 1].bar[1]))}`);

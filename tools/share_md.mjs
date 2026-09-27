// share_md.mjs: writes a self-contained pack to share outside the repo (e.g. with ChatGPT, for the clean edit of the
// lyrics): the story, every explicit word with its slot and what's on screen, the timed lyric, and the storyboard.
//   node tools/share_md.mjs              → out/share/All_That_Time_Saved_storyboard_and_lyrics.md
//   node tools/share_md.mjs --times      → the keyframe times for the sheets (render them with render.mjs --sheet)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const load = (f, name) => new Function(readFileSync(f, 'utf8') + `\nreturn ${name};`)();
const BOARD = load('video/board.js', 'BOARD'), BEATMAP = load('src/beatmap.js', 'BEATMAP'), LYRICS = load('src/lyrics.js', 'LYRICS');
const CREDITS = load('video/config.js', 'PROJECT').credits || {};   // (the credits run PROJECT.credits.len past the song's end)
const bars = BEATMAP.bars, dur = BEATMAP.duration, at = b => b < bars.length ? bars[b] : b > bars.length ? dur + (+CREDITS.len || 0) : dur;
const mmss = s => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;
const OUT = 'out/share', FILE = `${OUT}/All_That_Time_Saved_storyboard_and_lyrics.md`;

// the explicit words: strength is a rough guide; syllables are the explicit word's own
const RUDE = /fuck|shit|piss|bollocks/i;
const STRENGTH = w => /fuck/i.test(w) ? 'strong' : /shit|bollocks/i.test(w) ? 'medium' : 'mild';
const SYL = w => /fucking|bollocks/i.test(w) ? 2 : 1;
const bold = s => s.split(/(\s+)/).map(w => RUDE.test(w) ? `**${w}**` : w).join('');
const shotAt = t => BOARD.find(s => t >= at(s.bar[0]) && t < at(s.bar[1]));
// a line the two of them share (wordVoice: a voice per word) splits where the voice changes, each part from its first word
const parts = l => {
  const w = l.text.split(/\s+/).filter(Boolean), v = l.wordVoice;
  if (!v || v.length !== w.length || new Set(v).size < 2) return [{ voice: l.voice, text: l.text, start: l.start }];
  const out = [];
  w.forEach((x, i) => { const p = out[out.length - 1]; if (p && p.voice === v[i]) p.text += ' ' + x; else out.push({ voice: v[i], text: x, start: l.words[i][0] }); });
  return out;
};
const singer = v => v === 'M' ? 'Rowan' : 'Tess';

// what's on screen at each explicit word, by shot and word (checked against the keyframes)
const SEEN = {
  'P1b fucked': 'An engraved stamp slams down on her first hammock drawing on this word; the page prints out as a cheap riso copy.',
  'C1a piss': 'The bots\' packed night train; she gives us a deadpan look from the pole and presses the call button for her order.',
  'C1b piss (backing)': 'Backing voices, over the tilt up to the giant engraved brain. Nobody on screen sings it.',
  'C1d shit': 'Her commute on fast-forward: the same shot copied faster and faster, each copy a generation worse.',
  'C1d fucking': 'The same: her commute copied faster and worse.',
  'C1f fucking': 'Her box room: her hands on her cheap riso copy of the 1930s ad, about to rip it down on "meant"; the tear reveals the original poster on the platform (the cut into verse 2).',
  'V2g eight-oh-fucking-three': 'The GP\'s waiting room: he shoves his phone at us, a big 08:03; the appointments are gone.',
  'V2h fucking': 'His box room: he pulls a card cut-out of his life back out of the chatbot\'s laptop screen.',
  'P2b fucked': 'Her second drawing (the two of them in hammocks): two engraved stamps slam down, one over each of them, on this word.',
  'C2a piss': 'The busier train: the two of them squashed in at the pole among the bots and the crush, giving us the deadpan look.',
  'C2b piss (backing)': 'Backing voices, over the tilt up to the bigger brain.',
  'C2d shit': 'Both their commutes on fast-forward, side by side, copied worse and worse.',
  'C2d fucking': 'The same: both commutes copied.',
  'C2f fucking': 'The 1930s ad has burnt through: a black hole with glowing edges, opening onto the instrumental break.',
  'V3e fucking': 'He\'s been printed as a riso extra on a bots\' film set, moved about by an eager bot director.',
  'D1 fucking': 'The breakdown, spoken and bare: alone on his bed, he reaches into a biro-drawn window of morning light. The word is sincere here, not a joke.',
  'F2 bollocks': 'Her drawing of their Friday: the two of them on the sofa, the talk turned to nonsense (a rubber duck in the speech bubble).',
  'F4 pissed': 'Pull back out of the drawing: it\'s in her notebook, on her lap on the stopped night train; a gleaming engraved city outside the window.',
  'F4 pissed 2': 'Her on the train with the notebook on her lap, looking out at the city.',
  'F4 fucking': 'Her on the train, the notebook shut, the city outside the window she can\'t get into.',
  'Z1 piss': 'The chase: the frame split into the four media, the two of them running across all four with eager bots behind.',
  'Z1 piss (backing)': 'Backing voices, over the chase: the bots on their heels.',
  'Z2 shit': 'The bosses\' engraved bunker banquet; her paper-plane bill has just flown back into it.',
  'Z3 fucking': 'The AI services bill fills the lens (the cut into Z3).',
  'Z3 shit (backing)': 'Backing voices: the bill has landed beside her notebook on the train table; on her phone the bots dig their sandbox faster.',
};

const E = [], USED = {};
for (const l of LYRICS.lines) {
  const tok = l.text.split(/\s+/).filter(Boolean);
  tok.forEach((w, i) => {
    if (!RUDE.test(w)) return;
    // (the shot the word lands in; a word sung across a cut belongs to its line's shot, as the frame shows)
    const [a, b] = l.words[i], word = w.replace(/^[^\w]+|[^\w]+$/g, ''), lw = word.toLowerCase();
    // (backing lines have their own notes; a word's second line in a shot can too: 'F4 pissed 2')
    const cands = [shotAt((a + b) / 2), shotAt(l.start)].map(s => [s, `${s.id} ${lw}${l.backing ? ' (backing)' : ''}`]);
    let [s, key] = cands.find(([, k]) => SEEN[k]) || [shotAt((a + b) / 2), null];
    if (key) { const n = (USED[key] = USED[key] || new Set()).add(l.start).size; if (n > 1 && SEEN[`${key} ${n}`]) key = `${key} ${n}`; }
    E.push({ id: `E${E.length + 1}`, a, b, t: (a + b) / 2 + .04, l, voice: l.wordVoice?.[i] || l.voice, word, shot: s, seen: key ? SEEN[key] : '' });
  });
}
// each shot's keyframe: its middle, unless that's mid-transition
const KEY_AT = { V1g: 38.5 };
const KEY = BOARD.map(s => KEY_AT[s.id] ?? (at(s.bar[0]) + at(s.bar[1])) / 2);
if (process.argv.includes('--times')) {
  console.log('explicit:', E.map(e => e.t.toFixed(2)).join(','));
  for (let i = 0; i < KEY.length; i += 20) console.log(`shots_${i / 20 + 1}:`, KEY.slice(i, i + 20).map(t => t.toFixed(2)).join(','));
  process.exit(0);
}
const missing = E.filter(e => !e.seen).map(e => e.shot.id + ' ' + e.word);
if (missing.length) { console.error('no on-screen note for: ' + missing.join(', ')); process.exit(1); }

// the lyric's section headings (with the delivery notes) from brief/lyrics.md, in order
const HEADS = readFileSync('brief/lyrics.md', 'utf8').split('\n').filter(s => /^\[.*\]$/.test(s)).map(s => s.slice(1, -1));

// the story, from brief/story.md (its first paragraph points into the repo; so do a couple of asides)
const story = readFileSync('brief/story.md', 'utf8').split('\n## ').slice(1).map(s => '### ' + s).join('\n')
  .replace(/\s+What each stands\s+for, and how figures cross between them, is in `animation-style\.md`\./, '')
  .replace(/\s+See `animation-style\.md`\./, '').trim();

const tally = ['strong', 'medium', 'mild'].map(k => `${E.filter(e => STRENGTH(e.word) === k).length} ${k}`).join(', ');
let md = `# All That Time Saved: storyboard and lyrics

A music video in progress for the song "All That Time Saved" (4:59, British, two singers). This pack is self-contained:
the story, every explicit word with its timing and what's on screen when it's sung, the whole lyric with timings, and
the storyboard shot by shot. It comes with keyframe images:
- \`keyframes_explicit.jpg\`: a frame at each explicit word (E1–E${E.length} below), labelled with its time in seconds.
- \`keyframes_shots_1.jpg\` to \`keyframes_shots_${Math.ceil(KEY.length / 20)}.jpg\`: a frame from the middle of each shot, labelled with its time in seconds.

Draft of ${new Date().toISOString().slice(0, 10)}.

## The aim: a clean version

A clean version of the lyrics, with as few changes to the song as possible.
- **The song is already recorded.** The best replacements fit the same slot as the word they replace: the same
  number of syllables, the stress in the same place, and a similar vowel sound where possible. Each word's sung
  length is in the table below.
- **Keep each line's meaning and tone:** dry, British, bitter and funny. The anger is at the people deploying the
  machines and taking the profit, never at the bots: every bot in the video is sincere and genuinely trying to help.
- **The video follows the lyric.** Subtitles fill in word by word, the mouths are lip-synced from the lyric, and some
  cuts and gags land on particular words (noted below). A replacement that fits the slot keeps all of that.
- **Repeated lines** (the chorus three times, the pre-chorus twice) should get the same fix each time unless there's
  a reason not to.

## The explicit words

${E.length} in all (${tally}). The strength is only a rough guide; which ones need changing depends on where the clean
version is going. Time is minutes:seconds; the slot is how long the word is sung for.

| # | Time | Shot | Voice | Line | Word | Slot | On screen |
|---|---|---|---|---|---|---|---|
`;
for (const e of E) {
  const who = e.l.backing ? 'backing' : singer(e.voice);
  const syl = /-/.test(e.word) ? `${(e.b - e.a).toFixed(2)} s for the whole of "${e.word}" (5 syllables)` : `${(e.b - e.a).toFixed(2)} s${e.b - e.a > 1 ? ' (held)' : ''}, ${SYL(e.word)} syll.`;
  md += `| ${e.id} | ${mmss(e.a)} | ${e.shot.id} (${e.shot.sec}) | ${who} | ${e.l.backing ? '(' + bold(e.l.text) + ')' : bold(e.l.text)} | ${e.word} (${STRENGTH(e.word)}) | ${syl} | ${e.seen} |\n`;
}

md += `\n## The lyric, timed\n\nEvery sung line with its start time (minutes:seconds). Backing vocals are in (brackets). Explicit words are in bold.\n`;
let sec = null, hi = 0;
for (const l of LYRICS.lines) {
  if (l.section !== sec) {
    sec = l.section;
    while (hi < HEADS.length && !HEADS[hi].startsWith(sec)) md += `\n**[${HEADS[hi++]}]**\n`;
    md += `\n**[${HEADS[hi++] || sec}]**\n\n`;
  }
  if (l.backing) md += `- ${mmss(l.start)}  *(${bold(l.text)})*\n`;
  else for (const p of parts(l)) md += `- ${mmss(p.start)}  ${singer(p.voice)}: ${bold(p.text)}\n`;
}
while (hi < HEADS.length) md += `\n**[${HEADS[hi++]}]**\n`;

md += `\n## The story\n\n${story}\n`;

md += `\n## The storyboard\n\n${BOARD.length} shots. Times come from the song's tempo map (1 bar ≈ ${(240 / BEATMAP.bpm).toFixed(2)} s). Each shot lists its
bars, its time, its look (the video's five media: rubber hose = the past and its naive promise; card cut-out = the
present; doodle = the good future, her notebook; riso print = the bad future; banknote engraving = money and power),
who's in it, what happens, how it's entered, and the lines sung over it. The keyframe is the frame from the middle of
the shot in the keyframes_shots images.
`;
const LOOK = { ink: 'rubber hose (past)', card: 'card (present)', doodle: 'doodle (good future)', xerox: 'riso (bad future)', bank: 'banknote (money)', all: 'all four' };
const look = l => l.split(/([>+])/).map(p => p === '>' ? ' → ' : p === '+' ? ' + ' : LOOK[p] || p).join('');
sec = null;
BOARD.forEach((s, i) => {
  const t0 = at(s.bar[0]), t1 = at(s.bar[1]);
  if (s.sec !== sec) { sec = s.sec; md += `\n### ${sec}\n`; }
  const sung = LYRICS.lines.filter(l => !l.backing && l.start >= t0 - .2 && l.start < t1 - .2).flatMap(l => parts(l).map(p => `${singer(p.voice)}: ${bold(p.text)}`));
  const what = s.what.replace(/\s*\(\?[a-z0-9]+(?:=[^)]*)?\)/g, '')   // (the page's switches)
    .replace(/\s*The words are all in CREDITS_TEXT[^.]*\.js\./, '').replace(/brief\/ref\/history: /, '');   // (and its pointers into the repo)
  md += `\n**${s.id}** · bars ${s.bar[0]}–${s.bar[1]} · ${mmss(t0)}–${mmss(t1)} (${(t1 - t0).toFixed(1)} s) · ${look(s.look)} · ${s.who} · keyframe: shots_${Math.floor(i / 20) + 1}, ${KEY[i].toFixed(2)} s\n\n${what}\n\n*In:* ${s.in}\n`;
  if (sung.length) md += `\n> ${sung.join('  \n> ')}\n`;
});

mkdirSync(OUT, { recursive: true });
writeFileSync(FILE, md);
console.log(`${FILE}: ${E.length} explicit words, ${LYRICS.lines.length} lines, ${BOARD.length} shots`);

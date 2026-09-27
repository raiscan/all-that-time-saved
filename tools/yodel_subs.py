#!/usr/bin/env python3
"""yodel_subs.py: subtitles for the ?polka credits' yodelling (src/polka_lyrics.js, drawn by src/karaoke.js).

The ?polka credits play the user's Suno yodel-polka cover (assets/yodel_cover.mp3) from 123.50 s to its end
(tools/credits_polka.py), so credits time k = cover time - 123.50 and film time = DUR + k. The cover has no words; it
yodels at parts, and the joke (the user: "Would be funny to try and transcribe that/subtitle that") is to subtitle the
yodel deadpan, a syllable to each sung note, with the film's karaoke banner and its bouncing ball.

  1. The vocal: the section cut from the cover and split by Demucs (htdemucs, two stems, on the CPU; cached in
     out/polka/yodel_subs/stems).
  2. The notes: pYIN's pitch every 10 ms on the vocal stem, the loud voiced frames (GATE dB) grouped into notes: a new
     note where the pitch settles on another semitone (a scoop or fall between two notes, under SCOOP s, goes to the
     note it leads into, so the note starts where the voice leaves the last one), or where the voice re-attacks the same
     pitch (the level dips DIP dB between two loud stretches). Notes under MIN_NOTE s are ornaments of their neighbour.
  3. The register: a yodel flips between chest and head voice, and each flip is a syllable break. Her chest notes here
     are D4-B-flat 4 (295-466 Hz), her head notes C5-F5 (523-702 Hz): a note from C5 (MIDI 72) up is head voice.
  4. The phrases: notes less than PHRASE_GAP s apart. Stretches that aren't her are left out (NOT_HER, with the evidence).
  5. The words: each phrase is written by hand (PHRASES, below: the syllables, one per note, in the rule's spirit: a
     head note reads "ee", "hee", "lay" or "di"; a chest note "yo", "oo", "hoo" or "ho"), checked against the notes the
     analysis heard. If a re-run hears a different count, the phrase is written by rule instead (and the tool says so).

The singer: one woman (female: the chest notes sit at D4-B-flat 4, an octave above a man's; the AudioSet tagger (AST)
hears "Female singing" where she holds a note). Her lines fill in her colour ('F').

    CUDA_VISIBLE_DEVICES= HIP_VISIBLE_DEVICES= .venv/bin/python tools/yodel_subs.py [--notes]   (--notes: print every note)

Writes src/polka_lyrics.js (the lines, in credits time) and out/polka/yodel_subs/notes.json (what it heard).
"""
import argparse, json, os, subprocess, sys
import numpy as np, librosa

SRC, START = 'assets/yodel_cover.mp3', 123.50        # the credits' cut (tools/credits_polka.py: BAR70 - PICKUP)
WORK = 'out/polka/yodel_subs'
OUT_JS, OUT_JSON = 'src/polka_lyrics.js', f'{WORK}/notes.json'
SR, HOP = 22050, 220                                  # 10 ms frames
GATE = -34.0          # dB (RMS of the vocal stem): her notes peak at -18 to -26; softer is bleed, echo or the room
SCOOP = .07           # s: a pitch moving between notes for less than this is the next note's scoop (or the last's fall)
MIN_NOTE = .04        # s: shorter notes are ornaments, merged into a neighbour
DIP = 5.0             # dB: a re-attack of the same pitch (the level dips this far between two loud stretches)
GLIDE = 6.0           # semitones/s: a short run (under 0.1 s) sliding faster than this, frame to frame, is a scoop
SOFT = -30.0          # dB: a note peaking under this is soft: a pickup murmur, or the decay (echo) of the note before
PHRASE_GAP = .40      # s
HEAD_FROM = 72        # MIDI (C5): her head voice from here up
# Not her (k, s): the accordion, between her second and third phrases (the stem keeps it). It holds F5, G5, F5 with an
# octave reed under each (F4, G4: no violin or voice makes that), dead steady in pitch (sd 3 cents over 1.7 s) with a
# 9 Hz pulse on every harmonic alike (a bellows shake: her vibrato is ~6 Hz, +-25 cents, in pitch), its upper
# harmonics 10-30 dB stronger than her head voice's; then it plays on in thirds (D5 over Bb4, Eb5 over C5) to ~25.0 s.
# The AudioSet tagger (AST) never hears "Yodeling" there (her phrases: .2-.8).
NOT_HER = [(19.9, 25.05)]

# Her phrases, written: [the first note's k (to find the phrase), the syllables: one per note, '-' within a word, ' '
# between words, ' / ' between the banner's lines], with the registers they follow (C chest, H head; the rhythm on the
# polka's sixteenths: the cut runs at ~135 bpm). A head note reads "lay" (flipping up to it), "ee", "dee", "ree" or "hee"; a chest
# note "yo" (opening), "oo" or "hoo" (flipping down to it), "ho", "do" or "ro"; a held finish is sung long ("heeee!")
# and gets its exclamation mark.
PHRASES = [
    (8.45, 'Lay-ee-dee-hoo'),                                    # H H H C: F5 D5 D5 Bb4, eighths from bar 74's 3rd beat
    (11.99, 'Yo-lay-oo-lay-ee-hoo'                               # C H C H H C: a long low D4, then the yodel flips
            ' / Ho-ro-lay-ee-hoo-do-ro-lay-hoo'                  # C C H H C C C H C: Bb4 Bb4 F5 D5 Bb4 F4 Bb4 D5 Bb4
            ' / Yo-lay-hoo-do-ro-yo-heeee!'),                    # C H C C C C H: ... D5 held (.8 s, her vibrato)
    (25.05, 'Lay-hoooo!'),                                       # H C: D5, sliding down to a long Bb4 (1.1 s, vibrato)
    (38.33, 'Hee-dee-ree-hoo yo-lay-heeee!'),                    # H H H C C H H: the last; D5 held a second
]


def stems():
    os.makedirs(WORK, exist_ok=True)
    sec, voc = f'{WORK}/section.wav', f'{WORK}/stems/htdemucs/section/vocals.wav'
    if not os.path.exists(sec):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(START), '-i', SRC, '-ar', '44100', sec], check=True)
    if not os.path.exists(voc):
        env = dict(os.environ, CUDA_VISIBLE_DEVICES='', HIP_VISIBLE_DEVICES='')
        subprocess.run([sys.executable, '-m', 'demucs', '-n', 'htdemucs', '--two-stems', 'vocals', '-d', 'cpu', '-j', '4', '-o', f'{WORK}/stems', sec], check=True, env=env)
    return voc


def track(voc):
    y, _ = librosa.load(voc, sr=SR, mono=True)
    f0, vf, _ = librosa.pyin(y, fmin=180, fmax=1000, sr=SR, frame_length=2048, hop_length=HOP)
    db = 20 * np.log10(librosa.feature.rms(y=y, hop_length=HOP, frame_length=1024)[0] + 1e-6)
    n = min(len(f0), len(db)); t = librosa.times_like(db[:n], sr=SR, hop_length=HOP)
    global TAIL
    TAIL = np.where(vf[:n], librosa.hz_to_midi(np.where(np.isnan(f0[:n]), 1, f0[:n])), np.nan)   # (voiced at any level: a held note's tail)
    m = np.where(db[:n] > GATE, TAIL, np.nan)
    return t, m, db[:n]


def notes_of(t, m, db):
    """Her notes: each a settled core (two or more frames on one semitone), with its share of the glide frames around
    it (each glide frame goes to the core nearer its pitch: a scoop to the note it leads into, a fall to the one it
    leaves), split where the voice re-attacks the same pitch; a held note keeps its soft tail (its vibrato under GATE)."""
    dt = t[1] - t[0]; n = len(t); q = np.round(m)
    ok = np.isfinite(m)
    core = np.zeros(n, bool)
    for i in range(n):
        core[i] = ok[i] and abs(m[i] - q[i]) < .3 and (i > 0 and q[i - 1] == q[i] or i + 1 < n and q[i + 1] == q[i])
    cores, i = [], 0
    while i < n:
        if not core[i]: i += 1; continue
        j = i
        while j + 1 < n and core[j + 1] and q[j + 1] == q[i]: j += 1
        # (a short run still sliding, over GLIDE semitones a second, is a scoop passing through a semitone, not a note)
        if (j - i + 1) * dt >= .1 or j == i or np.median(np.abs(np.diff(m[i:j + 1]))) / dt < GLIDE: cores.append([i, j, int(q[i])])
        i = j + 1
    # one core per note: the same semitone again after a blink (up to 50 ms), or after her vibrato's swing (voiced, within
    # a semitone, all the way), is the same note, unless the voice re-attacks
    merged = []
    for c in cores:
        between = m[merged[-1][1] + 1:c[0]] if merged else None
        if merged and c[2] == merged[-1][2] and ((c[0] - merged[-1][1]) * dt <= .05 or np.all(np.abs(between - c[2]) < 1)):
            a, b = merged[-1][1], c[0]
            if min(db[merged[-1][0]:a + 1].max(), db[b:c[1] + 1].max()) - db[a:b + 1].min() < DIP: merged[-1][1] = c[1]; continue
        merged.append(list(c))
    # re-attacks inside a core: a dip of DIP dB between two loud stretches, each at least 80 ms
    split = []
    for a, b, p in merged:
        cuts, k0 = [], a
        for k in range(a + 8, b - 7):
            if db[k] == db[max(a, k - 5):k + 6].min() and min(db[k0:k].max(), db[k:b + 1].max()) - db[k] >= DIP: cuts.append(k); k0 = k
        for c0, c1 in zip([a] + cuts, cuts + [b + 1]): split.append([c0, c1 - 1, p])
    # the glide frames between two cores (voiced, no break longer than SCOOP): each to the nearer core in pitch
    ext = [[a, b, p] for a, b, p in split]
    for k in range(len(ext)):
        a, b, p = ext[k]
        if k and split[k - 1][1] >= a - int(SCOOP / dt) - 1:          # (joined to the last note by a short glide or blink)
            pa, pb = split[k - 1][1] + 1, a
            cut = pa
            for i in range(pa, pb):
                if ok[i] and abs(m[i] - p) < abs(m[i] - split[k - 1][2]): break
                cut = i + 1
            ext[k - 1][1] = max(ext[k - 1][1], cut - 1); ext[k][0] = cut
        elif not k or split[k - 1][1] < a - int(SCOOP / dt) - 1:      # (a note after a rest: its scoop in, if it has one)
            i = a
            while i - 1 >= 0 and ok[i - 1] and a - (i - 1) <= int(SCOOP / dt): i -= 1
            ext[k][0] = i
    # a held note's soft tail: its pitch, still voiced, down to 14 dB under GATE
    for k in range(len(ext)):
        a, b, p = ext[k]; nxt = ext[k + 1][0] if k + 1 < len(ext) else n
        while b + 1 < nxt and np.isfinite(TAIL[b + 1]) and abs(TAIL[b + 1] - p) < .8 and db[b + 1] > GATE - 14: b += 1
        ext[k][1] = b
    # ornaments too short to be notes: joined to the neighbour nearer in pitch (a phrase's first note, if it's a short
    # step into the next: its scoop)
    out = []
    for k, (a, b, p) in enumerate(ext):
        if (b - a + 1) * dt >= MIN_NOTE: out.append([a, b, p]); continue
        prev = out[-1] if out and out[-1][1] >= a - 1 else None
        nxt = ext[k + 1] if k + 1 < len(ext) and ext[k + 1][0] <= b + 1 else None
        if prev and (not nxt or abs(prev[2] - p) <= abs(nxt[2] - p)): prev[1] = b
        elif nxt: nxt[0] = a
    for k in range(len(out) - 1):
        a, b, p = out[k]
        if (k == 0 or out[k - 1][1] < a - 1) and out[k + 1][0] == b + 1 and (b - a + 1) * dt < .1 and abs(out[k + 1][2] - p) <= 2:
            out[k + 1][0] = a; out[k][1] = a - 1                          # (a phrase opening on a quick step into its note)
    out = [r for r in out if r[1] >= r[0]]
    # a soft note straight after a louder one on the same pitch is its decay (or the room's echo): one note
    pk = lambda r: db[r[0]:r[1] + 1].max()
    keep = []
    for r in out:
        if keep and r[2] == keep[-1][2] and r[0] - keep[-1][1] <= int(.05 / dt) and pk(r) < SOFT and pk(keep[-1]) - pk(r) > 6: keep[-1][1] = r[1]
        else: keep.append(r)
    out = keep
    return [{'on': round(float(t[a]), 3), 'off': round(float(t[b] + dt), 3), 'midi': p, 'note': librosa.midi_to_note(p, unicode=False),
             'hz': round(float(librosa.midi_to_hz(np.nanmedian(np.where(np.round(m[a:b + 1]) == p, m[a:b + 1], np.nan)))), 1),
             'db': round(float(db[a:b + 1].max()), 1), 'reg': 'head' if p >= HEAD_FROM else 'chest'} for a, b, p in out]


def phrases_of(notes):
    notes = [n for n in notes if not any(a <= n['on'] < b for a, b in NOT_HER)]
    ph = []
    for n in notes:
        if ph and n['on'] - ph[-1][-1]['off'] < PHRASE_GAP: ph[-1].append(n)
        else: ph.append([n])
    # (soft notes leading into a phrase, under SOFT dB, are a murmured pickup: too faint through the radio to subtitle)
    ph = [p[next((k for k, n in enumerate(p) if n['db'] >= SOFT), len(p)):] for p in ph]
    return [p for p in ph if p]


def by_rule(ph):
    """The syllables for a phrase the table doesn't cover: chest notes yo/ho/oo/hoo, head notes lay/ee/hee/di; a flip
    starts a new vowel; the last note of a phrase gets its exclamation mark."""
    out = []
    for k, n in enumerate(ph):
        prev = ph[k - 1]['reg'] if k else None
        if n['reg'] == 'chest': s = ('yo' if k == 0 else 'hoo' if prev == 'head' else 'ho' if k % 2 else 'oo')
        else: s = ('hee' if k == 0 else 'lay' if prev == 'chest' else 'ee' if k % 2 else 'di')
        out.append(s)
    out[0] = out[0].capitalize()
    return '-'.join(out) + '!'


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--notes', action='store_true'); a = ap.parse_args()
    t, m, db = track(stems())
    notes = notes_of(t, m, db)
    if a.notes:
        for n in notes: print(f"{n['on']:7.3f}-{n['off']:7.3f}  {n['note']:>4} {n['hz']:6.1f} Hz  {n['db']:6.1f} dB  {n['reg']}{'   (not her)' if any(x <= n['on'] < y for x, y in NOT_HER) else ''}")
    lines, report = [], []
    for ph in phrases_of(notes):
        w = next((txt for k0, txt in PHRASES if abs(ph[0]['on'] - k0) < .3), None)
        syl = lambda s: [x for x in s.replace(' / ', ' ').replace(' ', '-').split('-') if x]
        if w is None or len(syl(w)) != len(ph):
            print(f"  phrase at {ph[0]['on']:.2f}: {len(ph)} notes; {'no hand-written line' if w is None else f'the table has {len(syl(w))} syllables'}: written by rule", file=sys.stderr)
            w = by_rule(ph)
        report.append((ph, w))
        k = 0
        for row in w.split(' / '):
            words, times = [], []
            for tok in row.split(' '):
                n = len(syl(tok)); S = ph[k:k + n]; k += n
                words.append([S[0]['on'], S[-1]['off']]); times.append([[s['on'], s['off']] for s in S])
            lines.append({'start': words[0][0], 'end': words[-1][1], 'text': row, 'voice': 'F', 'backing': False, 'polka': True,
                          'words': words, 'syl': times, 'notes': ' '.join(s['note'] for s in ph[k - sum(len(syl(x)) for x in row.split(' ')):k])})
    # the band (a backing tag, in a neutral ink: voice 'N'): the accordion's solo between her second and third phrases
    # (it holds F5, G5, F5 in octaves with a bellows shake, then plays on in thirds), clear of her banners
    lines.append({'start': 20.05, 'end': 24.55, 'text': 'accordion solo', 'voice': 'N', 'backing': True, 'polka': True, 'words': [[20.05, 24.55]]})
    # and over the band's long ending (no voice after 41.8): "oom-pah", four bars from the polka's bar 25 (its bar lines
    # at .5 + n x 4 beats of 135.04 bpm: config.js PROJECT.creditsPolka), clear of the Friday drawing's hold (the user)
    bar = lambda n: .5 + n * 4 * 60 / 135.04
    lines.append({'start': round(bar(25), 3), 'end': round(bar(29), 3), 'text': 'oom-pah', 'voice': 'N', 'backing': True, 'polka': True, 'words': [[round(bar(25), 3), round(bar(29), 3)]]})
    json.dump({'start': START, 'notes': notes, 'phrases': [{'text': w, 'notes': [n['note'] for n in ph], 'reg': [n['reg'] for n in ph], 'on': [n['on'] for n in ph]} for ph, w in report]},
              open(OUT_JSON, 'w'), indent=1)
    with open(OUT_JS, 'w') as f:
        f.write('// polka_lyrics.js: generated by tools/yodel_subs.py (the ?polka credits\' yodelling, a syllable to each sung note).\n'
                '// Do not edit; re-run the tool. Times are credits time k (from the song\'s end: film time DUR + k). src/karaoke.js\n'
                '// reads it under ?polka only.\n')
        f.write('const POLKA_LYRICS = ' + json.dumps({'source': f'{SRC} from {START} s', 'lines': lines}) + ';\n')
    for ph, w in report:
        print(f"{ph[0]['on']:6.2f}-{ph[-1]['off']:6.2f} s  {len(ph):2d} notes  {' '.join(n['note'] for n in ph)}")
        print(f"{'':16s}{'':9s}  {' '.join(n['reg'][0].upper() for n in ph)}   ->  {w}")
    print(f'wrote {OUT_JS}, {OUT_JSON}')


main()

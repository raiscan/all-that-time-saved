"""align.py: time every lyric word by forced alignment of the known lyrics to the isolated vocal track.

    .venv/bin/python tools/align.py out/audio/stems/htdemucs/song/vocals.wav   (after tools/lyrics.py)

tools/lyrics.py times lines by matching the lyric sheet to a speech-to-text transcript, which goes wrong wherever the
transcript mishears a word, catches an unwritten ad-lib ("ooh", "whoah") or hears words in piano bleed. This instead
places OUR text on the audio, character by character (torchaudio's MMS forced aligner), one section at a time inside
the section's rough window, with a wildcard between lines that absorbs anything sung that isn't written down.
Backing vocals are aligned in sequence after the line they answer.

Rewrites start/end/words of every line in assets/lyrics.json and src/lyrics.js (the transcript match is kept as
asrStart/asrEnd for comparison) and prints lines that moved a lot, to check by ear. Run tools/voices.py after it.
"""
import argparse, json, re
import numpy as np
import soundfile as sf
import torch, torchaudio

ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument('vocals')
ap.add_argument('--lyrics', default='assets/lyrics.json')
ap.add_argument('--js', default='src/lyrics.js')
ap.add_argument('--pad', type=float, default=2.5, help='seconds of slack around each section window')
a = ap.parse_args()

torch.set_num_threads(max(1, torch.get_num_threads()))
B = torchaudio.pipelines.MMS_FA
model = B.get_model(with_star=True).eval()
DICT = B.get_dict(star='*')
x, sr = sf.read(a.vocals, dtype='float32', always_2d=True)          # (torchaudio.load needs torchcodec)
wav = torchaudio.functional.resample(torch.from_numpy(x.mean(1)).unsqueeze(0), sr, B.sample_rate)
SR = B.sample_rate
d = json.load(open(a.lyrics))


def emission(t0, t1):
    """Log-probs for [t0, t1] s, computed in 30 s chunks with context so chunk edges don't clip words."""
    out, step, ctx = [], 30.0, 2.0
    s = t0
    while s < t1:
        e = min(t1, s + step)
        a0, a1 = max(0, int((s - ctx) * SR)), min(wav.shape[1], int((e + ctx) * SR))
        with torch.inference_mode():
            em, _ = model(wav[:, a0:a1])
        em = em[0]
        fps = em.shape[0] / ((a1 - a0) / SR)
        k0, k1 = int(round((s - a0 / SR) * fps)), int(round((e - a0 / SR) * fps))
        out.append(em[k0:k1])
        s = e
    return torch.cat(out), fps


def chars(word):
    return [c for c in word.lower().replace('’', "'") if c in DICT and c not in ('-', '*')]


lines = d['lines']
for L in lines:
    L.setdefault('asrStart', L['start']); L.setdefault('asrEnd', L['end'])
sections = []
for L in lines:
    if not sections or sections[-1]['name'] != L['section'] or L['start'] - sections[-1]['end'] > 8:
        sections.append({'name': L['section'], 'lines': [], 'start': L['asrStart'], 'end': L['asrEnd']})
    s = sections[-1]
    s['lines'].append(L); s['start'] = min(s['start'], L['asrStart']); s['end'] = max(s['end'], L['asrEnd'])

moved = []
for S in sections:
    t0, t1 = max(0.0, S['start'] - a.pad), S['end'] + a.pad
    em, fps = emission(t0, t1)
    # the transcript: '*' before, between and after lines; each display word with its letters
    words, owner = ['*'], [None]
    for L in S['lines']:
        for j, w in enumerate(L['text'].split()):
            cs = chars(w)
            if cs:
                words.append(''.join(cs)); owner.append((L, j))
        words.append('*'); owner.append(None)
    tokens = [[DICT[c] for c in w] for w in words]
    targets = torch.tensor([[t for w in tokens for t in w]], dtype=torch.int32)
    ali, scores = torchaudio.functional.forced_align(em.unsqueeze(0), targets, blank=0)
    spans = torchaudio.functional.merge_tokens(ali[0], scores[0].exp())
    # regroup token spans into words
    k = 0
    for w, own in zip(tokens, owner):
        sp = spans[k:k + len(w)]; k += len(w)
        if own is None:
            continue
        L, j = own
        L.setdefault('_w', {})[j] = (t0 + sp[0].start / fps, t0 + sp[-1].end / fps, float(np.mean([x.score for x in sp])))
    for L in S['lines']:
        n = len(L['text'].split()); got = L.pop('_w', {})
        ws = [list(got[j][:2]) if j in got else None for j in range(n)]
        for j in range(n):                                   # words with no letters ("-") borrow a neighbour's time
            if ws[j] is None:
                nb = ws[j - 1] if j and ws[j - 1] else next((x for x in ws[j + 1:] if x), [L['start'], L['start']])
                ws[j] = [nb[1], nb[1] + .05] if j and ws[j - 1] else [nb[0] - .05, nb[0]]
        L['words'] = [[round(x, 3), round(y, 3)] for x, y in ws]
        L['start'], L['end'] = L['words'][0][0], L['words'][-1][1]
        L['alignScore'] = round(float(np.mean([g[2] for g in got.values()])) if got else 0.0, 3)
        if abs(L['start'] - L['asrStart']) > .6:
            moved.append(L)
    print(f"{S['name']:18} {t0:7.2f}–{t1:7.2f}  {len(S['lines'])} lines  mean score {np.mean([L['alignScore'] for L in S['lines']]):.2f}", flush=True)

# sections' times follow their lines
for s in d['sections']:
    ls = [L for L in lines if L['section'] == s['name'] and s['start'] - 10 <= L['asrStart'] <= s['end'] + 10]
    if ls:
        s['start'], s['end'] = min(L['start'] for L in ls), max(L['end'] for L in ls)
json.dump(d, open(a.lyrics, 'w'), indent=1)
with open(a.js, 'w') as f:
    f.write('// lyrics.js: generated by tools/lyrics.py, tools/align.py and tools/voices.py. Do not edit; re-run the tools.\n')
    f.write('const LYRICS = ' + json.dumps(d) + ';\n')
print(f'{len(moved)} lines moved more than 0.6 s from the transcript match (check these by ear):')
for L in moved:
    print(f"  {L['asrStart']:7.2f} -> {L['start']:7.2f}  score {L['alignScore']:.2f}  {'(b) ' if L.get('backing') else ''}{L['text'][:55]}")

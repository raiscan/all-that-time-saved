"""lyrics.py: time every lyric line against the song, by aligning the known lyrics to a word transcript.

    .venv/bin/python tools/lyrics.py brief/lyrics.md out/audio/words.json

Writes
  assets/lyrics.json   lines [{start, end, text, section, singer, backing}] and sections [{name, start, end, singer}]
  src/lyrics.js        the same as a global, `const LYRICS = {...}`

The lyrics file's [Section - notes, Singer] headers give each line its section and singer (F, M, FM for alternating
or both, '' for instrumental). Parenthesised phrases are backing vocals: kept as their own lines, flagged backing.
Words come from tools/transcribe.py; lines the transcript missed are placed between their neighbours.
"""
import argparse, difflib, json, os, re


def norm(w):
    return re.sub(r"[^a-z0-9']", '', w.lower().replace('’', "'"))


def tokens(text):
    return [t for t in (norm(w) for w in re.split(r"[\s\-–—/]+", text)) if t]


def singer_of(header):
    h = header.lower()
    fem, male = bool(re.search(r'\bfemale\b', h)), bool(re.search(r'\bmale\b', h))   # ('female' contains 'male')
    if 'ensemble' in h or (fem and male):
        return 'FM'
    if fem:
        return 'F'
    if male:
        return 'M'
    if 'instrumental' in h:
        return ''
    return 'F' if 'chorus' in h else ''


def parse(path):
    lines, section, singer = [], None, ''
    for raw in open(path):
        s = raw.strip()
        if not s or s.startswith('#'):
            continue
        m = re.match(r'^\[([^\]]*)\]?$', s) or (re.match(r'^\[(.*)$', s) if s.startswith('[') else None)
        if m:
            header = m.group(1).rstrip(']')
            section, singer = header.split(' - ')[0].strip(), singer_of(header)
            lines.append({'text': '', 'section': section, 'singer': singer, 'header': True})
            continue
        main = re.sub(r'\([^)]*\)', '', s).strip()
        if main:
            lines.append({'text': main, 'section': section, 'singer': singer, 'backing': False})
        for b in re.findall(r'\(([^)]*)\)', s):
            lines.append({'text': b, 'section': section, 'singer': singer, 'backing': True})
    return lines


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('lyrics')
    ap.add_argument('words')
    ap.add_argument('--json', default='assets/lyrics.json')
    ap.add_argument('--js', default='src/lyrics.js')
    ap.add_argument('--duration', type=float, default=None)
    a = ap.parse_args()

    L = parse(a.lyrics)
    W = json.load(open(a.words))
    wt = [norm(w['word']) for w in W]
    # the lyric token stream (main lines only: backing vocals often aren't transcribed, and would confuse the match)
    lt, owner, wordof = [], [], []
    for i, l in enumerate(L):
        if l.get('header') or l.get('backing'):
            continue
        for j, dw in enumerate(l['text'].split()):
            for t in tokens(dw):
                lt.append(t); owner.append(i); wordof.append(j)
    sm = difflib.SequenceMatcher(None, lt, wt, autojunk=False)
    hit, wtimes = {}, {}
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            w = W[blk.b + k]
            hit.setdefault(owner[blk.a + k], []).append(w)
            s0, e0 = wtimes.get((owner[blk.a + k], wordof[blk.a + k]), (w['start'], w['end']))
            wtimes[(owner[blk.a + k], wordof[blk.a + k])] = (min(s0, w['start']), max(e0, w['end']))
    for i, l in enumerate(L):
        if i in hit and len(hit[i]) >= max(1, len(tokens(l['text'])) // 4):
            l['start'], l['end'] = hit[i][0]['start'], hit[i][-1]['end']
            l['matched'] = round(len(hit[i]) / max(1, len(tokens(l['text']))), 2)
    # fill unmatched main lines between their timed neighbours; backing lines take their main line's span
    mains = [i for i, l in enumerate(L) if not l.get('header') and not l.get('backing')]
    for n, i in enumerate(mains):
        if 'start' in L[i]:
            continue
        prev = next((L[j]['end'] for j in reversed(mains[:n]) if 'start' in L[j]), 0.0)
        nxt = next((L[j]['start'] for j in mains[n + 1:] if 'start' in L[j]), prev + 3)
        run = [j for j in mains[n:] if 'start' not in L[j] and j <= next((m for m in mains[n:] if 'start' in L[m]), mains[-1] + 1)]
        k, span = run.index(i) if i in run else 0, max(.5, nxt - prev)
        L[i]['start'] = round(prev + span * k / (len(run) + 0), 3)
        L[i]['end'] = round(prev + span * (k + 1) / (len(run) + 0), 3)
        L[i]['matched'] = 0
    # per display word: matched words keep their times; the rest are spread evenly between their timed neighbours
    for i, l in enumerate(L):
        if l.get('header') or l.get('backing'):
            continue
        n = len(l['text'].split())
        ws = [list(wtimes[(i, j)]) if (i, j) in wtimes else None for j in range(n)]
        j = 0
        while j < n:
            if ws[j] is not None:
                j += 1; continue
            k = j
            while k < n and ws[k] is None:
                k += 1
            a0 = ws[j - 1][1] if j else l['start']
            b0 = ws[k][0] if k < n else l['end']
            step = max(.05, b0 - a0) / (k - j)
            for m in range(j, k):
                ws[m] = [a0 + step * (m - j), a0 + step * (m - j + 1)]
            j = k
        for m in range(1, n):                      # keep words in order
            ws[m][0] = max(ws[m][0], ws[m - 1][0] + .02)
            ws[m][1] = max(ws[m][1], ws[m][0] + .05)
        l['words'] = [[round(a, 3), round(b, 3)] for a, b in ws]
    # a backing vocal answers its line: from the line's last word to the next line (at most 1.6 s)
    mains = [l for l in L if not l.get('header') and not l.get('backing')]
    last = None
    for l in L:
        if l.get('header'):
            continue
        if l.get('backing'):
            nxt = next((m['start'] for m in mains if last is not None and m['start'] > last['start'] + .01), last['end'] + 1.6)
            l['start'] = last['end'] if last else 0
            l['end'] = round(min(l['start'] + 1.6, max(l['start'] + .6, nxt)), 3)
            l['words'] = [[l['start'], l['end']]] * len(l['text'].split())
        else:
            last = l
    # sections: from the first to the last timed line under each header (instrumental: the gap it sits in)
    sections, cur = [], None
    for i, l in enumerate(L):
        if l.get('header'):
            cur = {'name': l['section'], 'singer': l['singer'], 'lines': []}
            sections.append(cur)
        elif not l.get('backing'):
            cur['lines'].append(l)
    for n, s in enumerate(sections):
        if s['lines']:
            s['start'], s['end'] = s['lines'][0]['start'], s['lines'][-1]['end']
    for n, s in enumerate(sections):
        if not s['lines']:
            s['start'] = sections[n - 1]['end'] if n else 0.0
            s['end'] = next((x['start'] for x in sections[n + 1:] if x['lines']), a.duration or s['start'])
        del s['lines']
    out = {'lines': [{k: l[k] for k in ('start', 'end', 'text', 'section', 'singer', 'backing', 'matched', 'words') if k in l}
                     for l in L if not l.get('header')],
           'sections': [{k: s[k] for k in ('name', 'start', 'end', 'singer')} for s in sections]}
    for p in (a.json, a.js):
        os.makedirs(os.path.dirname(p) or '.', exist_ok=True)
    json.dump(out, open(a.json, 'w'), indent=1)
    with open(a.js, 'w') as f:
        f.write('// lyrics.js: generated by tools/lyrics.py. Do not edit; re-run the tool.\n')
        f.write('const LYRICS = ' + json.dumps(out) + ';\n')
    for s in out['sections']:
        print(f"{s['start']:7.2f}–{s['end']:7.2f}  {s['singer'] or '—':2}  {s['name']}")
    weak = [l for l in out['lines'] if not l.get('backing') and l.get('matched', 1) < .5]
    print(f"{len(out['lines'])} lines; {len(weak)} weakly matched: " + '; '.join(f"{l['start']:.1f} {l['text'][:40]}" for l in weak))
    print(f'wrote {a.json} and {a.js}')


if __name__ == '__main__':
    main()

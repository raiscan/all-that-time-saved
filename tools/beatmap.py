"""beatmap.py: analyse a song into the timing the video is built on.

    .venv/bin/python tools/beatmap.py assets/song.mp3

Writes
  assets/beatmap.json   beats, downbeats (bars), tempo, sections and per-bar energy, for planning and subagents
  src/beatmap.js        the same as a global, `const BEATMAP = {...}`, so the page can load it with a script tag

beats is the song's TEMPO MAP: every beat as a clean sequence (stray detections dropped, missed beats filled, a
half-time passage counted at full tempo, phase slips at the seams of a stitched song kept); bars are the bar starts.
Load src/beatmap.js + src/tempo.js and the engine's beat clock (bpOf, pulse, beatN) follows the map instead of a fixed
grid. bpm is the steady tempo (for PROJECT.bpm); offset is the first bar; slips lists beats > 40 ms off that tempo.
rawBeats / rawDownbeats are the tracker's output.

Beats and downbeats come from beat_this (a neural beat/downbeat tracker). Sections are a guess: novelty peaks in
bar-synced timbre and harmony, snapped to bars and labelled by similarity (sections that sound alike share a letter).
Check them against the lyrics and your ears before building chapters on them.
"""
import argparse, json, os, sys, warnings

import numpy as np

warnings.filterwarnings('ignore')


def track(path):
    from beat_this.inference import File2Beats
    beats, downs = File2Beats(checkpoint_path='final0', device='cpu', dbn=False)(path)
    return np.asarray(beats, float), np.asarray(downs, float)


def bar_features(y, sr, bars, dur):
    """One feature vector per bar: chroma (harmony) + MFCC (timbre), each standardised."""
    import librosa
    hop = 512
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, hop_length=hop, n_mfcc=13)
    rms = librosa.feature.rms(y=y, hop_length=hop)[0]
    edges = librosa.time_to_frames(np.append(bars, dur), sr=sr, hop_length=hop)
    feats, energy = [], []
    for a, b in zip(edges[:-1], edges[1:]):
        b = max(b, a + 1)
        feats.append(np.concatenate([chroma[:, a:b].mean(1), mfcc[:, a:b].mean(1)]))
        energy.append(float(np.sqrt(np.mean(rms[a:b] ** 2))))
    F = np.array(feats)
    F = (F - F.mean(0)) / (F.std(0) + 1e-9)
    e = np.array(energy)
    e = (e - e.min()) / (e.max() - e.min() + 1e-9)
    return F, e


def novelty(F, w):
    """Foote novelty: a checkerboard kernel slid down the diagonal of the bar self-similarity matrix."""
    n = len(F)
    X = F / (np.linalg.norm(F, axis=1, keepdims=True) + 1e-9)
    S = X @ X.T
    g = np.exp(-0.5 * (np.linspace(-1, 1, 2 * w) / 0.5) ** 2)
    K = np.outer(g, g) * np.kron([[1, -1], [-1, 1]], np.ones((w, w)))
    P = np.pad(S, w, mode='edge')
    nov = np.array([np.sum(P[i:i + 2 * w, i:i + 2 * w] * K) for i in range(n)])
    return np.clip(nov, 0, None) / (nov.max() + 1e-9)


def boundaries(nov, min_bars, thresh):
    """Bar indices where a section starts: local novelty peaks, at least min_bars apart, strongest first."""
    peaks = [i for i in range(1, len(nov) - 1) if nov[i] >= nov[i - 1] and nov[i] > nov[i + 1] and nov[i] >= thresh]
    keep = []
    for i in sorted(peaks, key=lambda i: -nov[i]):
        if all(abs(i - j) >= min_bars for j in keep + [0, len(nov)]):
            keep.append(i)
    return [0] + sorted(keep)


def label(F, starts, n, sim):
    """Letter per section: a section reuses the letter of the most similar earlier one if they're alike enough."""
    means = [F[a:b].mean(0) for a, b in zip(starts, starts[1:] + [n])]
    means = [m / (np.linalg.norm(m) + 1e-9) for m in means]
    labels = []
    for i, m in enumerate(means):
        best = max(range(i), key=lambda j: means[j] @ m, default=None)
        if best is not None and means[best] @ m >= sim:
            labels.append(labels[best])
        else:
            labels.append(chr(ord('A') + len(set(labels))))
    return labels


def robust_grid(beats, downs, tol=.06):
    """A constant-tempo grid fitted to the steady beats only. Seeds the period from the longest run of regular gaps,
    then refits on every beat within tol s of the grid. The bar phase is the one the tracker's downbeats vote for.
    Returns (period, first downbeat >= 0, mask of on-grid beats, residuals, downbeat votes)."""
    ibi = np.diff(beats)
    med = np.median(ibi)
    ok = np.abs(ibi - med) / med < .08
    best, i = (0, 0), 0
    while i < len(ok):
        if ok[i]:
            j = i
            while j < len(ok) and ok[j]:
                j += 1
            if j - i > best[1] - best[0]:
                best = (i, j)
            i = j
        else:
            i += 1
    run = beats[best[0]:best[1] + 1]
    P, ph = np.polyfit(np.arange(len(run)), run, 1)
    for _ in range(4):
        k = np.round((beats - ph) / P)
        keep = np.abs(beats - (ph + k * P)) < tol
        P, ph = np.polyfit(k[keep], beats[keep], 1)
    k = np.round((beats - ph) / P)
    resid = beats - (ph + k * P)
    keep = np.abs(resid) < tol
    kd = np.round((downs - ph) / P)
    on = np.abs(downs - (ph + kd * P)) < tol
    votes = np.bincount((kd[on] % 4).astype(int), minlength=4)
    phase = int(np.argmax(votes))
    k0 = int(np.ceil(-ph / P))
    while (k0 - phase) % 4:
        k0 += 1
    return P, ph + k0 * P, keep, resid, votes


def off_grid_spans(beats, keep, gap=1.5):
    """Time spans where the tracker's beats don't sit on the grid (merging neighbours closer than gap s)."""
    spans = []
    for b, k in zip(beats, keep):
        if k:
            continue
        if spans and b - spans[-1][1] < gap:
            spans[-1][1] = b
        else:
            spans.append([b, b])
    return [(x, y) for x, y in spans]


def tempo_map(beats, downs, P, tol=.07, win=32):
    """The song's beats as a clean sequence about P apart, and its bar starts. Drops extra detections (a gap under
    0.55 P), fills missed beats (a gap of n periods gets n - 1 evenly spaced beats, which also counts a half-time
    passage at full tempo), and keeps small phase slips (a generated song stitched from parts jumps phase at the seams).
    Bars: the bar phase (beat index mod 4) that the tracker's downbeats vote for in a window of `win` beats."""
    out = [float(beats[0])]
    for i in range(1, len(beats)):
        g = beats[i] - out[-1]
        if g < .55 * P:
            nxt = beats[i + 1] if i + 1 < len(beats) else None
            if nxt is not None and abs(nxt - beats[i] - P) < abs(nxt - out[-1] - P) and len(out) > 1:
                out[-1] = float(beats[i])     # the later one fits the next beat better: keep it instead
            continue
        n = max(1, int(round(g / P)))
        base = out[-1]
        out += [base + g * k / n for k in range(1, n)]
        out.append(float(beats[i]))
    B = np.array(out)
    flag = np.array([np.min(np.abs(downs - b)) < tol for b in B])
    idx = np.arange(len(B))
    phase = np.zeros(len(B), int)
    for j in range(len(B)):
        a, b = max(0, j - win // 2), min(len(B), j + win // 2)
        v = np.bincount(idx[a:b][flag[a:b]] % 4, minlength=4)
        phase[j] = int(np.argmax(v)) if v.sum() else (phase[j - 1] if j else 0)
    bars, last = [], -9
    for j in range(len(B)):
        if j % 4 == phase[j] and j - last >= 3:
            bars.append(B[j]); last = j
    return B, np.array(bars)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('audio')
    ap.add_argument('--json', default='assets/beatmap.json')
    ap.add_argument('--js', default='src/beatmap.js')
    ap.add_argument('--kernel', type=int, default=4, help='novelty kernel half-width, in bars')
    ap.add_argument('--min-bars', type=int, default=4, help='shortest section, in bars')
    ap.add_argument('--thresh', type=float, default=0.3, help='novelty peak threshold, 0..1')
    ap.add_argument('--sim', type=float, default=0.6, help='similarity for two sections to share a label, -1..1')
    a = ap.parse_args()

    import librosa
    y, sr = librosa.load(a.audio, sr=22050, mono=True)
    dur = len(y) / sr
    beats, downs = track(a.audio)
    if len(downs) < 2:
        sys.exit('fewer than two downbeats found: is this music?')

    raw_beats, raw_downs = beats, downs
    P, _, keep, resid, _ = robust_grid(beats, downs)
    beats, bars = tempo_map(raw_beats, raw_downs, P)
    ibi = np.diff(beats)
    slips = [(float(beats[i + 1]), float(ibi[i] - P)) for i in range(len(ibi)) if abs(ibi[i] - P) > .04]
    offset = float(bars[0])

    F, energy = bar_features(y, sr, bars, dur)
    starts = boundaries(novelty(F, a.kernel), a.min_bars, a.thresh)
    labels = label(F, starts, len(bars), a.sim)
    ends = starts[1:] + [len(bars)]
    sections = [{'label': L, 'start': round(float(bars[s]), 3),
                 'end': round(float(bars[e]) if e < len(bars) else dur, 3),
                 'bars': [int(s), int(e)], 'energy': round(float(energy[s:e].mean()), 3)}
                for L, s, e in zip(labels, starts, ends)]

    out = {
        'audio': a.audio, 'duration': round(dur, 3),
        'bpm': round(float(60 / P), 3), 'offset': round(offset, 3), 'beatsPerBar': 4,
        'slips': [[round(t, 2), round(d, 3)] for t, d in slips],
        'beats': [round(float(b), 3) for b in beats],
        'bars': [round(float(d), 3) for d in bars],
        'rawBeats': [round(float(b), 3) for b in raw_beats],
        'rawDownbeats': [round(float(d), 3) for d in raw_downs],
        'barEnergy': [round(float(e), 3) for e in energy],
        'sections': sections,
    }
    for p in (a.json, a.js):
        os.makedirs(os.path.dirname(p) or '.', exist_ok=True)
    with open(a.json, 'w') as f:
        json.dump(out, f, indent=1)
    with open(a.js, 'w') as f:
        f.write('// beatmap.js: generated by tools/beatmap.py from ' + a.audio + '. Do not edit; re-run the tool.\n')
        f.write('const BEATMAP = ' + json.dumps(out) + ';\n')

    print(f"{a.audio}: {dur:.2f}s  {out['bpm']} bpm  {out['beatsPerBar']}/4  "
          f"first bar {out['offset']}s  {len(beats)} beats  {len(bars)} bars (tempo map)")
    print('  phase slips (a beat more than 40 ms off the tempo): ' + (', '.join(f'{t:.1f}s {d * 1000:+.0f}ms' for t, d in slips) or 'none'))
    for s in sections:
        bar = '#' * int(round(s['energy'] * 20))
        print(f"  {s['label']}  {s['start']:7.2f}–{s['end']:7.2f}  bars {s['bars'][0]:3d}–{s['bars'][1]:3d}  {bar}")
    print(f'wrote {a.json} and {a.js}')


if __name__ == '__main__':
    main()

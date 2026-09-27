"""steps.py: find where the picture moves on twos (every other frame) instead of on ones.

    .venv/bin/python tools/steps.py out/video/reel.mp4                        whole film: flagged stretches
    .venv/bin/python tools/steps.py out/camsmooth/after_20_25.mp4 --t0=20     a --clip=20:25 render (song time of frame 0)
    .venv/bin/python tools/steps.py out/stills_dir --t0=38                     a folder of frames at consecutive 1/24 s
    .venv/bin/python tools/steps.py clip.mp4 --t0=20 --stretches=20:22.5,22.5:25   numbers for chosen stretches
    .venv/bin/python tools/steps.py clip.mp4 --t0=20 --plot=out/check/p.png   per-frame bars (step frames dark, in-betweens orange)

The card, doodle and flip looks animate on twos: a new drawing every 1/12 s, held for two frames of the 24 fps film.
Puppets on twos are right; a camera (pan, push, drift, shake, a scrolling world) on twos reads as a laggy, low-fps
picture. This measures it:

  each frame is shrunk to 160x90 grey, the karaoke band (bottom sixth) dropped, and compared with the frame before;
  d     = mean |change| over the frame (grey levels, 0-255)
  whole = the median of the 16 cells of a 4x4 grid's mean |change|: a change most of the frame shares (a camera move,
          a scrolling scene), which a character moving in one part of the frame doesn't reach.
  A twos drawing changes on every other frame: the even frames (song time n/24, n even) for mt(t), either parity for
  mt(lt) (it ticks from the shot's start). In each window (--win, 0.5 s) the frames split by parity; ON = the median
  `whole` of the busier parity, OFF = of the other (medians: a cut doesn't count). A window is FLAGGED when ON >= --big
  and OFF <= --ratio * ON and more than half its ON frames are followed by a held frame (not just lopsided medians at
  a cut): the whole picture jumps on alternate frames only. A camera on ones gives OFF ~ ON; puppets on twos over a
  still camera give small ON (a few cells).
  A big piece legitimately on twos (a full-frame close-up, a wipe card) can flag too: check the shot's code.

Output: the flagged stretches (merged windows, with the shots they fall in), and with --stretches a row per stretch:
the windows' mean ON and OFF, OFF/ON (1 = on ones, 0 = all on twos), the mean `whole` and `d`, the % of windows flagged. --json writes everything (per frame too).
"""
import argparse, json, os, subprocess, sys

import numpy as np

W, H = 160, 90
KEEP_H = 75            # rows kept: the karaoke banner lives in the bottom sixth (y >= 900 of 1080)
GRID = 4


def load_video(path, i0=None, i1=None):
    """frames i0..i1-1 (by index: a -ss seek can land a frame off), shrunk to 160x90 grey"""
    cmd = ['ffmpeg', '-v', 'error', '-i', path]
    sel = f'select=between(n\\,{i0}\\,{i1 - 1}),' if i0 is not None else ''
    cmd += ['-vf', f'{sel}scale={W}:{H}:flags=area,format=gray', '-fps_mode', 'passthrough', '-f', 'rawvideo', '-']
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)


def load_dir(path):
    from PIL import Image
    names = sorted(n for n in os.listdir(path) if n.lower().endswith(('.png', '.jpg', '.jpeg')))
    return np.stack([np.asarray(Image.open(os.path.join(path, n)).convert('L').resize((W, H), Image.BOX), np.float32) for n in names])


def diffs(frames):
    """per-frame d (whole-frame mean) and whole (median of the 4x4 cells); index i compares frame i with i-1 (i >= 1)"""
    f = frames[:, :KEEP_H]
    a = np.abs(np.diff(f, axis=0))                                   # (n-1, KEEP_H, W)
    d = a.mean(axis=(1, 2))
    ch, cw = KEEP_H // GRID, W // GRID
    cells = a[:, :ch * GRID, :cw * GRID].reshape(len(a), GRID, ch, GRID, cw).mean(axis=(2, 4)).reshape(len(a), -1)
    whole = np.median(cells, axis=1)
    return np.concatenate([[np.nan], d]), np.concatenate([[np.nan], whole])


def shot_table(root):
    """[(id, t0, t1, look)] from video/board.js + src/beatmap.js (None if node isn't there)"""
    js = r"""
const fs=require('fs'),r=process.argv[1];
const src=fs.readFileSync(r+'/src/beatmap.js','utf8')+'\n'+fs.readFileSync(r+'/video/board.js','utf8')+'\n;module.exports={BEATMAP,BOARD};';
const m={exports:{}}; new Function('module','window',src)(m,{});
const {BEATMAP,BOARD}=m.exports, bt=b=>b<BEATMAP.bars.length?BEATMAP.bars[b]:BEATMAP.duration;
console.log(JSON.stringify(BOARD.map(s=>[s.id,bt(s.bar[0]),bt(s.bar[1]),s.look])));"""
    try:
        out = subprocess.run(['node', '-e', js, root], capture_output=True, check=True, text=True).stdout
        return json.loads(out)
    except Exception:
        return None


def shots_in(table, a, b):
    if not table: return ''
    return ' '.join(s[0] for s in table if s[1] < b and s[2] > a)


def windows(t, n, whole, win, big, ratio):
    """non-overlapping windows of `win` s: (a, b, on, off, flagged, phase, alt). Phase-agnostic: a shot stepping on
    mt(lt) ticks with its own start, so its step frames can be the odd ones; ON is the busier parity, OFF the other.
    Medians, so a single cut in a window doesn't count. alt: the share of the ON frames followed by a held frame (a
    change >= big/2, then <= ratio of it): a window straddling a cut or the end of a move can have lopsided medians
    without alternating, and a boil every third frame (doodle, 8 a second) alternates on half the pairs at most, so a flag needs alt > .5 too."""
    out = []
    k = max(2, int(round(win * 24)))
    for s in range(1, len(t), k):
        idx = np.arange(s, min(s + k, len(t)))
        if len(idx) < 4: break
        ev, od = idx[n[idx] % 2 == 0], idx[n[idx] % 2 == 1]
        me, mo = float(np.nanmedian(whole[ev])), float(np.nanmedian(whole[od]))
        on, off, ph = (me, mo, 0) if me >= mo else (mo, me, 1)
        onI = [i for i in (ev if ph == 0 else od) if i + 1 < len(t)]
        alt = float(np.mean([whole[i] >= big / 2 and whole[i + 1] <= ratio * whole[i] for i in onI])) if onI else 0.
        out.append((float(t[idx[0]]), float(t[idx[-1]] + 1 / 24), on, off, on >= big and off <= ratio * on and alt > .5, ph, alt))
    return out


def merge(wins, gap=0.26):
    st = []
    for a, b, on, off, fl, ph, alt in wins:
        if not fl: continue
        if st and a - st[-1][1] <= gap: st[-1][1] = b; st[-1][2].append((on, off))
        else: st.append([a, b, [(on, off)]])
    return st


def stretch_row(t, whole, d, a, b, wins):
    """a stretch's numbers from its windows (each window's ON/OFF phase-agnostic, as above): mean ON, mean OFF"""
    ws = [w for w in wins if w[0] >= a - 1e-6 and w[1] <= b + 1 / 24 + 1e-6]
    if not ws: return None
    on, off = float(np.mean([w[2] for w in ws])), float(np.mean([w[3] for w in ws]))
    idx = np.where((t >= a - 1e-6) & (t < b - 1e-6))[0]; idx = idx[idx >= 1]
    return dict(a=a, b=b, on=on, off=off, ratio=off / on if on > 1e-9 else float('nan'), whole=float(np.nanmean(whole[idx])),
                d=float(np.nanmean(d[idx])), flagged_pct=100 * sum(w[4] for w in ws) / len(ws), windows=len(ws))


def plot(path, t, n, whole, d, title=''):
    from PIL import Image, ImageDraw
    m = len(t) - 1
    bw = max(2, min(8, 1600 // max(1, m)))
    Wp, Hp = 60 + m * bw + 20, 360
    im = Image.new('RGB', (Wp, Hp), (250, 248, 244)); g = ImageDraw.Draw(im)
    top = max(1.0, float(np.nanpercentile(whole[1:], 99)) * 1.1)
    base = Hp - 40
    for lv in np.linspace(0, top, 5):
        y = base - lv / top * (Hp - 80); g.line([(50, y), (Wp - 10, y)], fill=(225, 220, 212)); g.text((4, y - 6), f'{lv:.1f}', fill=(90, 90, 90))
    for i in range(1, len(t)):
        x = 60 + (i - 1) * bw; v = min(top, whole[i]); y = base - v / top * (Hp - 80)
        g.rectangle([x, y, x + bw - 1, base], fill=(40, 40, 60) if n[i] % 2 == 0 else (235, 120, 30))
        if abs(t[i] * 2 - round(t[i] * 2)) < 1e-3: g.text((x - 8, base + 6), f'{t[i]:.1f}', fill=(60, 60, 60))
    g.text((60, 8), (title + '   ' if title else '') + "'whole' change per frame (median of 4x4 cells, 0-255 grey): dark = even frames, orange = odd frames", fill=(20, 20, 20))
    os.makedirs(os.path.dirname(path) or '.', exist_ok=True); im.save(path)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n\n')[0], formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('source', help='a video file, or a folder of frames (sorted by name, consecutive 1/24 s)')
    ap.add_argument('--t0', type=float, default=0, help='song time of the first frame (a --clip=A:B render: A)')
    ap.add_argument('--range', help='A:B song seconds to analyse (video input: seeks there)')
    ap.add_argument('--win', type=float, default=.5, help='window length, s')
    ap.add_argument('--big', type=float, default=.8, help='ON (grey levels) a window needs to count as a whole-frame change')
    ap.add_argument('--ratio', type=float, default=.3, help='flag when OFF <= ratio * ON')
    ap.add_argument('--stretches', help='A:B,C:D,... report ON/OFF for these song-time stretches')
    ap.add_argument('--json', help='write the results here')
    ap.add_argument('--plot', help='write a per-frame bar chart (PNG) here')
    ap.add_argument('--frames', action='store_true', help='print every frame\'s numbers')
    a = ap.parse_args()

    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    r0 = r1 = None
    if a.range: r0, r1 = map(float, a.range.split(':'))
    if os.path.isdir(a.source):
        frames = load_dir(a.source); t0 = a.t0
        if a.range:
            i0, i1 = int(round((r0 - t0) * 24)), int(round((r1 - t0) * 24)); frames = frames[max(0, i0):i1]; t0 = t0 + max(0, i0) / 24
    else:
        if a.range: i0 = max(0, int(round((r0 - a.t0) * 24))); frames = load_video(a.source, i0, int(round((r1 - a.t0) * 24))); t0 = a.t0 + i0 / 24
        else: frames = load_video(a.source); t0 = a.t0
    n0 = int(round(t0 * 24)); n = n0 + np.arange(len(frames)); t = n / 24
    d, whole = diffs(frames)
    wins = windows(t, n, whole, a.win, a.big, a.ratio)
    table = shot_table(root)
    res = dict(source=a.source, t0=float(t[0]), frames=len(frames), big=a.big, ratio=a.ratio, win=a.win)

    print(f'{a.source}: {len(frames)} frames, {t[0]:.3f}-{t[-1] + 1 / 24:.3f} s')
    st = merge(wins)
    res['flagged'] = []
    print(f'flagged stretches (ON >= {a.big}, OFF <= {a.ratio} ON, {a.win} s windows):' if st else 'no flagged stretches')
    for s0, s1, v in st:
        on = float(np.mean([x[0] for x in v])); off = float(np.mean([x[1] for x in v]))
        print(f'  {s0:8.2f}-{s1:8.2f}  ON {on:5.2f}  OFF {off:5.2f}  OFF/ON {off / on:4.2f}   {shots_in(table, s0, s1)}')
        res['flagged'].append(dict(a=s0, b=s1, on=on, off=off, shots=shots_in(table, s0, s1)))
    if a.stretches:
        res['stretches'] = []
        print('stretch            ON     OFF   OFF/ON  whole   d    flagged%  shots')
        for p in a.stretches.split(','):
            s0, s1 = map(float, p.split(':'))
            row = stretch_row(t, whole, d, s0, s1, wins)
            if not row: print(f'  {s0}-{s1}: outside the source'); continue
            row['shots'] = shots_in(table, s0, s1); res['stretches'].append(row)
            print(f'  {s0:7.2f}-{s1:7.2f}  {row["on"]:5.2f}  {row["off"]:5.2f}   {row["ratio"]:5.2f}  {row["whole"]:5.2f} {row["d"]:5.2f}   {row["flagged_pct"]:5.0f}    {row["shots"]}')
    if a.frames:
        for i in range(1, len(t)): print(f'  {t[i]:8.3f}  n={n[i]}  {"STEP" if n[i] % 2 == 0 else "    "}  d {d[i]:6.2f}  whole {whole[i]:6.2f}')
    if a.json:
        res['windows'] = [dict(a=w[0], b=w[1], on=w[2], off=w[3], flagged=bool(w[4]), phase=w[5], alt=w[6]) for w in wins]
        res['per_frame'] = dict(t=[float(x) for x in t], d=[None if np.isnan(x) else float(x) for x in d], whole=[None if np.isnan(x) else float(x) for x in whole])
        os.makedirs(os.path.dirname(a.json) or '.', exist_ok=True)
        with open(a.json, 'w') as fh: json.dump(res, fh)
    if a.plot: plot(a.plot, t, n, whole, d, os.path.basename(a.source)); print('plot →', a.plot)


if __name__ == '__main__':
    main()

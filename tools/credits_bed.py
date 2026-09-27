#!/usr/bin/env python3
"""Build assets/credits_bed.mp3 (the end credits' music, PROJECT.credits.len = 66.48 s) from the user's Suno
instrumental, assets/instrumental.mp3 (2026-09-26), using the same stretches of the song as the first bed (which was cut
from the song's own Demucs instrumental, a lower-quality separation), on the same bar lines:

    bed  0.00-32.25  the bridge, from the pickup to bar 128 through bar 146   (song 228.503-260.978)
    bed 32.25-55.16  the bridge again, bars 130-143                          (song 232.518-255.438)
    bed 55.16-66.48  the coda, bar 161 to its end                            (song 287.238 on)

The join into the coda (the user's pick, H): the coda's first three notes (a high F, a low F, a G: 287.73-288.36)
jarred, cut to from the bridge, so it comes in on its fourth, the phrase (290.29); the bridge runs on 2.58 s longer to
fill their place, and a bar-long equal-power crossfade takes it into the coda, fully in 30 ms before that note. The two
segments keep their timing (the bed's length and its end unchanged).
The instrumental avoids its two faulty passages here (the user: a phasey reverb fault at ~0:40-0:50 and ~4:30-4:45).
It runs about .53 s behind the song and doesn't slow for bar 144 as the song does (its bar 146 comes .22 s sooner), so
each cut point was found in the instrumental by cross-correlating the song's instrumental around it (INST below). The
first stretch is .22 s shorter than the old bed's; the coda runs .22 s longer, so the bed keeps its length, and the
title's downbeat (PROJECT.credits.downbeat) is where it was. Joins: 10 ms equal-power crossfades at quiet phrase ends;
-1.5 dB (the instrumental peaks at 0 dBFS); a 10 ms fade in, a 50 ms fade out.

    .venv/bin/python tools/credits_bed.py
"""
import subprocess, tempfile, os
import numpy as np, soundfile as sf

SRC, OUT, LEN = 'assets/instrumental.mp3', 'assets/credits_bed.mp3', 66.48
INST = [(229.0496, 261.3027), (233.0536, 255.9556), (287.7078, None)]   # instrumental times (s): the three stretches as first cut
NOTE4, BEAT = 290.285, 60 / 136.022          # the coda's fourth note (its phrase); the instrumental's beat
XF = 4 * BEAT                                 # the bar-long crossfade into the coda
CODA_IN = NOTE4 - .03 - XF / 2                # the join (the crossfade's middle, coda time): the coda fully in 30 ms before its note

def xjoin(A, B, n):   # equal-power crossfade over n samples
    if n < 2: return np.concatenate([A, B])
    t = np.linspace(0, np.pi / 2, n)[:, None]
    return np.concatenate([A[:-n], A[-n:] * np.cos(t) + B[:n] * np.sin(t), B[n:]])

with tempfile.TemporaryDirectory() as d:
    wav = os.path.join(d, 'in.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', SRC, '-ar', '48000', wav], check=True)
    x, SR = sf.read(wav)
    X, H = int(.005 * SR), XF / 2
    L1 = INST[0][1] - INST[0][0]
    coda_off = INST[2][0] - (L1 + INST[1][1] - INST[1][0])   # coda time - bed time (its timing as first cut: the bed ends where it did)
    Tj = CODA_IN - coda_off                                   # the join, in bed time
    seg2_end = INST[1][0] + (Tj - L1)                         # the bridge runs on to it
    S = lambda a, b: x[int(round(a * SR)):int(round(b * SR))].copy()
    p1 = S(INST[0][0] - X / SR, INST[0][1] + X / SR)
    p2 = S(INST[1][0] - X / SR, seg2_end + H)
    p3 = S(CODA_IN - H, coda_off + LEN + .1)
    out = xjoin(xjoin(p1, p2, 2 * X), p3, int(round(2 * H * SR)))
    out = out[X:X + int(round(LEN * SR))] * 10 ** (-1.5 / 20)
    f = int(.01 * SR); out[:f] *= np.linspace(0, 1, f)[:, None]
    f = int(.05 * SR); out[-f:] *= np.linspace(1, 0, f)[:, None]
    bed = os.path.join(d, 'bed.wav'); sf.write(bed, out, SR, subtype='FLOAT')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', bed, '-c:a', 'libmp3lame', '-b:a', '256k', OUT], check=True)
print(OUT, f'{LEN} s')

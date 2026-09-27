#!/usr/bin/env python3
"""Build assets/credits_polka.mp3: the ?polka credits' music (video/config.js PROJECT.creditsPolka). The user's Suno
yodel-polka cover of the song (assets/yodel_cover.mp3, 2026-09-26), as heard from a cheap transistor radio on the
reception counter of a holiday resort (the user).

The cut: the cover's last 66.48 s (the credits' length), from half a second before its bar 70 (124.00 s: 135.8 bpm,
4/4, by tools/beatmap.py) to its own ending, so the title card's first downbeat lands at .5 s as with the song's bed,
and the music ends with the film. It comes in mid-phrase, so the radio is switched on and tuned in: a moment of
static and a heterodyne whistle gliding down as the station locks, the music rising through it by the downbeat.

The radio (mono, as the little set is):
  - a small speaker in a plastic box: 300 Hz to 3.6 kHz, the cone's resonance (+5 dB at 900 Hz) and the box's (+3 dB
    at 450 Hz), a dip at 2.2 kHz
  - a cheap amplifier: squashed (a fast compressor), then a soft clip that adds a little crunch, band-limited again
  - the station's faint hiss and the odd crackle
The lobby: the set sits on the counter (a 1.2 ms reflection off its top), in a tiled lobby (early reflections off the
walls, a ~0.6 s tail that loses its highs first), heard from a few metres off; the air conditioning's faint rumble.
Level: -22 LUFS (a radio across the room, a little under the song's bed), peaks below -1.5 dBFS.

    .venv/bin/python tools/credits_polka.py [--dry out/polka/dry.wav]
"""
import argparse, os, subprocess, tempfile
import numpy as np, soundfile as sf
from scipy import signal

SRC, OUT = 'assets/yodel_cover.mp3', 'assets/credits_polka.mp3'
LEN, BAR70, PICKUP, SR = 66.48, 124.00, .5, 48000
rng = np.random.default_rng(55)

def peq(x, f0, gain_db, q):   # a peaking EQ (RBJ biquad)
    A, w = 10 ** (gain_db / 40), 2 * np.pi * f0 / SR
    al = np.sin(w) / (2 * q)
    b = [1 + al * A, -2 * np.cos(w), 1 - al * A]; a = [1 + al / A, -2 * np.cos(w), 1 - al / A]
    return signal.lfilter(np.array(b) / a[0], np.array(a) / a[0], x)

def band(x, lo, hi, order=4):
    return signal.sosfilt(signal.butter(order, [lo, hi], 'bandpass', fs=SR, output='sos'), x)

def compress(x, thresh_db=-22, ratio=3, att=.012, rel=.15):   # (a slowish attack: each oom and pah keeps its punch)
    env = np.abs(x); a1, r1 = np.exp(-1 / (att * SR)), np.exp(-1 / (rel * SR))
    e = np.empty_like(env); v = 0.
    for i, s in enumerate(env):   # (a peak follower; fast enough for a minute of mono)
        v = a1 * v + (1 - a1) * s if s > v else r1 * v + (1 - r1) * s
        e[i] = v
    lvl = 20 * np.log10(e + 1e-9); over = np.maximum(0, lvl - thresh_db)
    return x * 10 ** (-over * (1 - 1 / ratio) / 20)

def room_ir(seconds=1.2, rt60=.62, seed=0):
    r = np.random.default_rng(seed); n = int(seconds * SR); t = np.arange(n) / SR
    tail = r.standard_normal(n) * np.exp(-6.91 * t / rt60)
    lo = r.standard_normal(n) * np.exp(-6.91 * t / (rt60 * .45))   # (the highs die first: a fast-decaying bright part)
    tail = signal.sosfilt(signal.butter(2, 2500, 'lowpass', fs=SR, output='sos'), tail) + .35 * signal.sosfilt(signal.butter(2, 2500, 'highpass', fs=SR, output='sos'), lo)
    tail[:int(.018 * SR)] = 0   # (the tail starts after the early reflections)
    ir = tail * .06
    for d, g in [(.0062, .5), (.0097, .42), (.0138, .35), (.0181, .3), (.0233, .26)]:   # walls, the counter's front, the ceiling
        ir[int((d + r.uniform(-.0008, .0008)) * SR)] += g * r.choice([-1, 1]) * .5
    ir[0] = 1.0
    return ir

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--dry'); args = ap.parse_args()
    with tempfile.TemporaryDirectory() as d:
        wav = os.path.join(d, 'src.wav')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', SRC, '-ar', str(SR), wav], check=True)
        src, _ = sf.read(wav)
        a = int((BAR70 - PICKUP) * SR); n = int(round(LEN * SR))
        seg = src[a:a + n]
        if len(seg) < n: seg = np.concatenate([seg, np.zeros((n - len(seg), 2))])
        if args.dry: sf.write(args.dry, seg, SR)
        x = seg.mean(1)
        # the speaker and its box
        x = band(x, 300, 3600)
        x = peq(x, 900, 5, 1.4); x = peq(x, 450, 3, 2.0); x = peq(x, 2200, -3, 1.5)
        # the cheap amplifier: squashed, a little crunch, band-limited again
        x = compress(x / (np.abs(x).max() + 1e-9) * .9)
        x = x / (np.abs(x).max() + 1e-9)
        x = np.tanh(2.4 * x) / np.tanh(2.4)
        x = band(x, 280, 4200, 2)
        # the station: hiss and the odd crackle
        hiss = band(rng.standard_normal(n), 1200, 5000, 2) * 10 ** (-44 / 20) * np.std(x) / .1
        crk = np.zeros(n)
        for i in rng.choice(n, size=int(LEN * 1.5), replace=False): crk[i:i + 24] += rng.uniform(-1, 1) * np.hanning(24) * rng.uniform(.01, .04)
        x = x + hiss + band(crk, 800, 6000, 2)
        # switched on and tuned in: static and a whistle gliding down as the station locks, the music rising through it
        t = np.arange(n) / SR
        tune = np.clip((t - .06) / .4, 0, 1) ** 1.5
        stat = band(rng.standard_normal(n), 500, 4500, 2) * .22 * np.clip(1 - (t - .08) / .42, 0, 1) * np.clip(t / .03, 0, 1)
        f = 2600 * np.exp(-t / .12) + 380
        whistle = np.sin(2 * np.pi * np.cumsum(f) / SR) * .06 * np.clip(1 - t / .38, 0, 1) * np.clip(t / .02, 0, 1)
        click = np.zeros(n); click[:int(.004 * SR)] = np.hanning(int(.004 * SR)) * .5   # (the switch)
        x = x * tune + stat + whistle + band(click, 300, 3000, 2)
        # the lobby: the counter's reflection, the room (a stereo pair of tails), the air conditioning
        x = x + .5 * np.concatenate([np.zeros(int(.0012 * SR)), x[:-int(.0012 * SR)]])
        irL, irR = room_ir(seed=1), room_ir(seed=2)
        wetL = signal.fftconvolve(x, irL)[:n]; wetR = signal.fftconvolve(x, irR)[:n]
        dry, wet = .85, .32
        L = dry * x + wet * (wetL - x); R = dry * x + wet * (wetR - x)   # (the IRs carry the direct sound at [0]; the wet part is the rest)
        ac = signal.sosfilt(signal.butter(2, 400, 'lowpass', fs=SR, output='sos'), rng.standard_normal((2, n)), axis=1) * np.std(x) * 10 ** (-52 / 20) / .03
        out = np.stack([L + ac[0], R + ac[1]], 1)
        f = int(.08 * SR); out[-f:] *= np.linspace(1, 0, f)[:, None]
        pre = os.path.join(d, 'pre.wav'); sf.write(pre, out / (np.abs(out).max() + 1e-9) * .5, SR, subtype='FLOAT')
        # loudness: -22 LUFS, peaks under -1.5 dBFS
        meas = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', pre, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
        I = float([l for l in meas.splitlines() if l.strip().startswith('I:')][-1].split()[1])
        g = 10 ** ((-22 - I) / 20); y = sf.read(pre)[0] * g
        pk = np.abs(y).max(); lim = 10 ** (-1.5 / 20)
        if pk > lim: y *= lim / pk
        fin = os.path.join(d, 'fin.wav'); sf.write(fin, y, SR, subtype='FLOAT')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', fin, '-c:a', 'libmp3lame', '-b:a', '256k', OUT], check=True)
    print(OUT, f'{LEN} s')

main()

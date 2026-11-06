"""Score for sample v3 (dark globe and story scenes): cinematic and quiet.

Felt piano and a warm pad while he walks, a sub swell under the opening question, insects and a low drone
in the jungle, near silence and a scratch per tally mark in the cell, one deep hit when the rule lands,
then the piano comes back for the re-walk.
Run with the library's venv:  ~/lemo-opuscar/.venv/bin/python mix.py out/mix.wav
"""
import os
import sys
import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.expanduser("~/lemo-opuscar/core/audio"))
from sfx import SR, t_, env_exp, lp, hp, bp, noise, norm, thump, whoosh, add, compress, limit  # noqa: E402

DUR = 36.3
buf = np.zeros((int(DUR * SR), 2))
rng = np.random.default_rng(3)
hz = lambda n: 440 * 2 ** ((n - 69) / 12)


def piano(n, d=2.4, v=1.0):
    tt = t_(d); f = hz(n)
    x = sum(a * np.sin(2 * np.pi * f * k * (1 + .0004 * k * k) * tt) * env_exp(d, .9 / k) for k, a in ((1, 1), (2, .45), (3, .22), (4, .1), (5, .05)))
    x += .015 * bp(noise(d), 800, 3000) * env_exp(d, .01)        # hammer felt
    return norm(lp(x * np.minimum(1, tt / .004), 3800)) * v


def pad(notes, d, v=1.0, cut=1600):
    tt = t_(d)
    x = sum(np.sin(2 * np.pi * hz(n) * (1 + dt) * tt + i) for i, n in enumerate(notes) for dt in (-.003, .003))
    env = np.minimum(1, tt / 1.2) * np.minimum(1, (d - tt) / 1.0)
    return norm(lp(x * env, cut)) * v


def sub(f0, d, v=1.0):
    tt = t_(d)
    env = np.sin(np.pi * np.clip(tt / d, 0, 1)) ** 2
    return norm(np.sin(2 * np.pi * f0 * tt) * env) * v


def reverb(x, secs=2.6, wet=.28):
    n = int(secs * SR); ir = rng.standard_normal(n) * np.exp(-np.arange(n) / (SR * secs / 6.5))
    ir = lp(ir, 5000); ir /= np.sqrt((ir ** 2).sum())
    out = np.zeros_like(x)
    for ch in range(2):
        L = len(x) + n; F = 1 << (L - 1).bit_length()
        y = np.fft.irfft(np.fft.rfft(x[:, ch], F) * np.fft.rfft(np.roll(ir, ch * 97), F), F)[:len(x)]
        out[:, ch] = x[:, ch] + wet * y
    return out


# --- hook (0-4.6): sub swell and an open pad under the question ---
add(buf, sub(36.7, 4.8, .55), 0.0)
add(buf, pad([50, 57, 64, 69, 76], 5.0, .22, 1200), 0.1)
add(buf, piano(74, 3.0, .3), 1.35, pan=.1)        # the second line lands

# --- the walk (4.6-17.0: departure map, Patagonia, the Andes): felt piano ostinato, pad, a soft low pulse ---
BEAT = 60 / 84
prog = [(38, [62, 69, 74, 76]), (43, [62, 67, 71, 74]), (45, [64, 69, 73, 76]), (42, [61, 66, 69, 73])]
t = 4.6; bar = 0
while t < 16.8:
    root, tones = prog[bar % 4]
    add(buf, pad([root + 12, root + 19, root + 24], BEAT * 4 + .6, .16, 900), t)
    add(buf, sub(hz(root - 12), BEAT * 1.8, .35), t)
    for k in range(8):
        tk = t + k * BEAT / 2
        if tk >= 16.9: break
        add(buf, piano(tones[[0, 2, 1, 3, 2, 1, 3, 2][k]], 1.6, .16 if k % 2 else .22), tk, pan=.18 * (1 if k % 2 else -1))
    t += BEAT * 4; bar += 1
add(buf, whoosh(1.4, .12), 12.3)      # cut back to the globe for the Andes
wind = lp(np.cumsum(noise(4.9)) / 300, 700); wind = norm(wind - np.convolve(wind, np.ones(4800) / 4800, mode='same')) * .10
add(buf, wind * np.minimum(1, t_(4.9) / .6) * np.minimum(1, (4.9 - t_(4.9)) / .4), 8.0)   # steppe wind

# --- Darien (17.0-25.8): the map darkens, then the canopy: low drone, insects ---
add(buf, pad([45, 52, 57, 60], 4.2, .16, 800), 17.0)
d = 4.8; tt = t_(d)
drone = norm(lp(np.sin(2 * np.pi * 55 * tt) + .5 * np.sin(2 * np.pi * 82.4 * tt) + .3 * lp(noise(d), 200), 400)) * np.minimum(1, tt / 1.0) * np.minimum(1, (d - tt) / .4)
add(buf, drone * .28, 21.0)
for _ in range(36):
    tc = 21.2 + rng.random() * 4.3; dd = .05 + rng.random() * .12
    chirp = bp(noise(dd), 4200 + rng.random() * 2500, 7800) * np.sin(np.pi * t_(dd) / dd) * (1 + np.sin(2 * np.pi * 60 * t_(dd)))
    add(buf, norm(chirp) * (.03 + rng.random() * .04), tc, pan=rng.random() * 1.6 - .8)
add(buf, pad([45, 52, 57], 4.6, .12, 700), 21.1)

# --- the cell (25.8-30.8): near silence, a hum, a drip, a scratch per tally mark ---
add(buf, thump(.8, 46), 25.82)
hum = norm(lp(np.sin(2 * np.pi * 50 * t_(5.0)) + .3 * noise(5.0), 300)) * .05
add(buf, hum, 25.8)
for tc in (26.6, 28.1, 29.7):
    dd = .18; add(buf, norm(np.sin(2 * np.pi * (1400 - 2600 * t_(dd)) * t_(dd)) * env_exp(dd, .03)) * .12, tc, pan=.35)
for i in range(18):   # tally marks appear as the day count steps (main.js: n = 1 + floor(seg(t, 26.2, 30.4) * 18))
    tc = 26.2 + i * (4.2 / 18)
    add(buf, norm(bp(noise(.07), 1800, 6000) * env_exp(.07, .02)) * .09, tc, pan=-.2)

# --- the re-walk (30.8-36.3): piano returns; the rule lands at 32.2 with a deep hit ---
add(buf, piano(62, 2.4, .2), 30.95); add(buf, piano(69, 2.2, .16), 31.45)
add(buf, whoosh(.9, .15), 31.3)
add(buf, thump(1.0, 41), 32.2)
add(buf, norm(lp(noise(1.2), 300) * env_exp(1.2, .3)) * .25, 32.21)
add(buf, pad([38, 50, 57, 62, 66, 69], 4.0, .3, 1800), 32.15)
for k, n in enumerate([74, 69, 66, 69, 74, 76]):
    add(buf, piano(n, 1.8, .17), 32.5 + k * .5, pan=.15 * (-1) ** k)

buf = reverb(buf)
fade = np.ones(len(buf)); nf = int(.5 * SR); fade[-nf:] = np.linspace(1, 0, nf)
buf *= fade[:, None]
for ch in range(2):
    buf[:, ch] = limit(compress(buf[:, ch], .3, 2.5), .89)
os.makedirs("out", exist_ok=True)
sf.write(sys.argv[1] if len(sys.argv) > 1 else "out/mix.wav", buf.astype(np.float32), SR)
print("mix written", buf.shape[0] / SR, "s")

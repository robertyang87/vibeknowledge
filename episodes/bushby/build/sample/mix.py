"""Score and printing foley for the 15-second sample.

Warm, dry, handmade (Risograph sound palette): a plucked marimba-like line and an upright-bass
pulse while he walks; the machine "ka-chunk" when the red plate lands; a held near-silence while
the calendar runs and the line does not; a soft chord under the title.
Run with the library's venv:  ~/lemo-opuscar/.venv/bin/python mix.py out/mix.wav
"""
import sys
import numpy as np
import soundfile as sf

sys.path.insert(0, __import__("os").path.expanduser("~/lemo-opuscar/core/audio"))
from sfx import SR, t_, env_exp, lp, hp, bp, noise, norm, thump, click, whoosh, add, compress, limit  # noqa: E402

DUR = 16.8
BPM = 96
BEAT = 60 / BPM
buf = np.zeros((int(DUR * SR), 2))


def hz(n):  # MIDI note to Hz
    return 440 * 2 ** ((n - 69) / 12)


def marimba(n, d=.9, v=1.0):
    tt = t_(d); f = hz(n)
    x = (np.sin(2 * np.pi * f * tt) * env_exp(d, .28) + .35 * np.sin(2 * np.pi * 4 * f * tt) * env_exp(d, .05)
         + .12 * np.sin(2 * np.pi * 10 * f * tt) * env_exp(d, .015))
    atk = np.minimum(1, tt / .003)
    return norm(x * atk) * v


def bass(n, d=.55, v=1.0):
    tt = t_(d); f = hz(n)
    x = np.sin(2 * np.pi * f * tt) + .3 * np.sin(2 * np.pi * 2 * f * tt) + .1 * np.sin(2 * np.pi * 3 * f * tt)
    env = np.minimum(1, tt / .02) * env_exp(d, .22)
    return norm(lp(x * env, 900)) * v


def pad(notes, d, v=1.0):
    tt = t_(d)
    x = sum(np.sin(2 * np.pi * hz(n) * tt + i) + .2 * np.sin(2 * np.pi * 2 * hz(n) * tt) for i, n in enumerate(notes))
    env = np.minimum(1, tt / .6) * np.minimum(1, (d - tt) / .8)
    return norm(lp(x * env, 2200)) * v


def shhk(d=.28, v=1.0):  # paper feed through the machine
    return norm(bp(noise(d), 1800, 7000) * np.sin(np.pi * t_(d) / d) ** 1.5) * v


# --- the walk (1.0 - 9.0 s): D major, I - V - vi - IV, one chord per bar, marimba eighths ---
chords = [(50, [62, 66, 69, 74]), (45, [61, 64, 69, 73]), (47, [62, 66, 71, 74]), (43, [62, 67, 71, 74])]
t = 1.2
bar = 0
while t < 9.0 - 1e-6:
    root, tones = chords[bar % 4]
    add(buf, bass(root - 12, BEAT * 1.6, .55), t, pan=-.1)
    add(buf, bass(root - 12, BEAT * 1.0, .4), t + BEAT * 2, pan=-.1)
    for k in range(8):
        tk = t + k * BEAT / 2
        if tk >= 9.0:
            break
        n = tones[[0, 1, 2, 3, 2, 1, 2, 3][k]]
        add(buf, marimba(n, .8, .32 if k % 2 == 0 else .22), tk, pan=.15 * (1 if k % 2 else -1))
    t += BEAT * 4
    bar += 1

# brushed shaker on the offbeats while walking
for k in range(int((9.0 - 1.2) / (BEAT / 2))):
    tk = 1.2 + k * BEAT / 2 + BEAT / 4
    add(buf, norm(hp(noise(.07), 5000) * env_exp(.07, .015)) * .08, tk, pan=.3)

# --- printing foley ---
add(buf, shhk(.35, .35), 0.0)                 # the question is printed
add(buf, thump(.5, 70), 0.02)
for tc in (1.2, 4.4, 6.6, 9.0, 13.4):     # each new sheet feeds through
    add(buf, shhk(.22, .22), tc - .08, pan=.2)
add(buf, thump(1.0, 58), 9.35)                 # the red plate lands as a stamp
add(buf, norm(lp(noise(.5), 500) * env_exp(.5, .09)) * .4, 9.36)

# --- the stall (9.4 - 13.0): music stops, only wind and a slow tick of the calendar ---
wind = lp(np.cumsum(noise(4.0)) / 200, 600)
wind = norm(wind - np.convolve(wind, np.ones(4800) / 4800, mode="same")) * .12
add(buf, wind * np.minimum(1, t_(4.0) / .8), 9.4)
tk = 10.0
while tk < 13.4:   # the calendar ticks faster as the years run
    add(buf, norm(bp(noise(.03), 2500, 6000) * env_exp(.03, .006)) * .12, tk, pan=-.25)
    tk += max(.12, .45 - (tk - 10.0) * .11)

# --- the title (13.0 - 15.0) ---
add(buf, pad([50, 57, 62, 66, 69], 3.3, .35), 13.45)
add(buf, marimba(74, 1.5, .3), 13.5)

for ch in range(2):
    buf[:, ch] = limit(compress(buf[:, ch], .3, 3.0), .89)
sf.write(sys.argv[1] if len(sys.argv) > 1 else "out/mix.wav", buf.astype(np.float32), SR)
print("mix written", buf.shape[0] / SR, "s")

"""Score for sample v2 (second-person telling with the live map).

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

DUR = 25.9
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


# --- hook (0-3.4): a soft chord and a single page turn ---
add(buf, pad([50, 57, 62, 66], 3.2, .3), 0.0)
add(buf, shhk(.3, .25), 0.0)

def walk_music(t_start, t_end, chords, vol=1.0):
    t = t_start; bar = 0
    while t < t_end - 1e-6:
        root, tones = chords[bar % len(chords)]
        add(buf, bass(root - 12, BEAT * 1.6, .5 * vol), t, pan=-.1)
        add(buf, bass(root - 12, BEAT, .35 * vol), t + BEAT * 2, pan=-.1)
        for k in range(8):
            tk = t + k * BEAT / 2
            if tk >= t_end: break
            add(buf, marimba(tones[[0, 1, 2, 3, 2, 1, 2, 3][k]], .8, (.3 if k % 2 == 0 else .2) * vol), tk, pan=.15 * (1 if k % 2 else -1))
        t += BEAT * 4; bar += 1

MAJ = [(50, [62, 66, 69, 74]), (45, [61, 64, 69, 73]), (47, [62, 66, 71, 74]), (43, [62, 67, 71, 74])]
walk_music(3.4, 12.4, MAJ)
# --- the jungle (12.4-16.9): low drone, insects, no melody ---
d = 4.5; tt = t_(d)
drone = norm(lp(np.sin(2 * np.pi * 55 * tt) + .5 * np.sin(2 * np.pi * 82.4 * tt), 300)) * np.minimum(1, tt / .8) * np.minimum(1, (d - tt) / .3) * .25
add(buf, drone, 12.4)
for k in range(40):
    add(buf, norm(bp(noise(.04), 4000, 7000) * env_exp(.04, .01)) * .05, 12.5 + k * .11, pan=(k % 5 - 2) * .3)
# --- the cell (16.9-21.4): near silence, a slow drip ---
for k in range(6):
    add(buf, norm(np.sin(2 * np.pi * 1400 * t_(.12)) * env_exp(.12, .02)) * .12, 17.3 + k * .75, pan=.2)
add(buf, thump(.6, 50), 16.95)
# --- the re-walk (21.4-25.9): music returns, the stamp lands ---
walk_music(21.4, 25.9, MAJ, .9)
add(buf, thump(1.0, 58), 22.85)
add(buf, norm(lp(noise(.4), 500) * env_exp(.4, .08)) * .35, 22.86)

for ch in range(2):
    buf[:, ch] = limit(compress(buf[:, ch], .3, 3.0), .89)
sf.write(sys.argv[1] if len(sys.argv) > 1 else "out/mix.wav", buf.astype(np.float32), SR)
print("mix written", buf.shape[0] / SR, "s")

"""Sound effects for the full film (no music). Beat times are read from the beat sheet in main.js, so the track
follows any retiming. Map shots get air, a soft swoop when the camera travels and a tick while the calendar runs;
story scenes get the ambience of their place, steps timed to the walk cycle, and their own events.
Run with the library's venv:  ~/lemo-opuscar/.venv/bin/python sfx.py out/sfx.wav
"""
import math, os, re, sys
import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.expanduser("~/lemo-opuscar/core/audio"))
from sfx import SR, t_, env_exp, lp, hp, bp, noise, norm, brown, whoosh, thump, creak, add, compress, limit  # noqa: E402

rng = np.random.default_rng(5)
SHEET = re.findall(r"\['(\w+)', '(\w+)', ([\d.]+)", open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'main.js')).read())
BEATS, t = [], 0.0
for bid, shot, dur in SHEET: BEATS.append((bid, shot, t, t + float(dur))); t += float(dur)
DUR = t
B = {b[0]: b for b in BEATS}
buf = np.zeros((int((DUR + .1) * SR), 2))


def fade(x, a=.4, b=.4):
    tt = np.arange(len(x)) / SR; d = len(x) / SR
    return x * np.minimum(1, tt / max(a, 1e-3)) * np.minimum(1, (d - tt) / max(b, 1e-3))
def bed(d, lo, hi, v, a=.6, b=.6): return fade(norm(bp(brown(d) * .6 + noise(d) * .4, lo, hi)), a, b) * v
def gust(d, v, lo=200, hi=1400):
    x = bp(noise(d), lo, hi); tt = t_(d)
    return fade(norm(x * (.55 + .45 * np.sin(2 * np.pi * .23 * tt + 1) * np.sin(2 * np.pi * .11 * tt))), .8, .8) * v
def crunch(v=1.0, bright=1.0):
    d = .12; out = np.zeros(int(d * SR))
    for _ in range(22):
        s = int(rng.random() * .08 * SR); g = hp(noise(.008), 1500 * bright) * env_exp(.008, .0015) * (.3 + rng.random()); out[s:s + len(g)] += g[:len(out) - s]
    out += lp(noise(d), 300) * env_exp(d, .02) * .6
    return norm(out) * v
def snowstep(v=1.0):
    d = .16; return norm(bp(noise(d), 300, 2500) * np.sin(np.pi * t_(d) / d) ** 1.5 + .3 * lp(noise(d), 200) * env_exp(d, .03)) * v
def squelch(v=1.0):
    d = .18; tt = t_(d)
    x = lp(noise(d), 900) * env_exp(d, .05) + .4 * bp(noise(d), 2000, 5000) * env_exp(d, .015) + .3 * np.sin(2 * np.pi * (180 - 300 * tt) * tt) * env_exp(d, .04)
    return norm(x) * v
def splash(v=1.0):
    d = .35; return norm(bp(noise(d), 500, 6000) * env_exp(d, .08) + .4 * lp(noise(d), 400) * env_exp(d, .05)) * v
def tick(v=1.0): d = .02; return norm(bp(noise(d), 3000, 7000) * env_exp(d, .003)) * v
def clang(v=1.0):
    d = 1.6; tt = t_(d)
    x = sum(a * np.sin(2 * np.pi * f * tt + rng.random() * 6) * env_exp(d, tau) for f, a, tau in [(110, 1, .5), (233, .7, .35), (397, .5, .25), (611, .35, .18), (1240, .2, .08)])
    return norm(x + lp(noise(d), 800) * env_exp(d, .03) * 1.2) * v
def scratch(v=1.0):
    d = .16; tt = t_(d); return norm(bp(noise(d), 2500, 7500) * np.sin(np.pi * tt / d) ** .6 * (1 + .6 * np.sin(2 * np.pi * 55 * tt))) * v
def stamp(v=1.0): return norm(thump(1, 48) + .5 * np.pad(lp(noise(.3), 1200) * env_exp(.3, .03), (0, int(.05 * SR)))[:int(.35 * SR)]) * v
def pen(d, v):
    tt = t_(d); x = bp(noise(d), 1800, 6000); am = .5 + .5 * np.abs(np.sin(2 * np.pi * 1.3 * tt + 2 * np.sin(2 * np.pi * .4 * tt)))
    return fade(norm(x * am), .2, .3) * v
def bird(v=1.0, f0=2400):
    d = .5; tt = t_(d); f = f0 - 900 * (tt % .25) / .25
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * (tt % .25) / .25) ** 2 * env_exp(d, .4)) * v
def gull(v=1.0):
    d = .6; tt = t_(d); f = 1600 + 700 * np.sin(np.pi * tt / d) - 600 * tt
    return norm(bp(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)), 900, 4000) * np.sin(np.pi * tt / d) ** 2) * v
def drip(v=1.0): d = .2; tt = t_(d); return norm(np.sin(2 * np.pi * (1200 + 2400 * tt) * tt) * env_exp(d, .03)) * v
def motor(d, v, f=62):
    mt = t_(d); m = np.sin(2 * np.pi * (f + 4 * np.sin(2 * np.pi * .3 * mt)) * mt); return norm(lp(np.sign(m) * np.abs(m) ** .5 + .3 * noise(d), 700)) * v
def bell(v=1.0, f=880):
    d = 1.2; tt = t_(d); return norm(sum(a * np.sin(2 * np.pi * f * k * tt) * env_exp(d, .5 / k) for k, a in ((1, 1), (2.7, .5), (5.4, .2)))) * v
def thunder(v=1.0):
    d = 3.0; return fade(norm(lp(brown(d), 160) * env_exp(d, .9) + .5 * lp(noise(d), 600) * env_exp(d, .15)), .02, .8) * v
def horn(v=1.0):
    d = 2.6; tt = t_(d); return fade(norm(lp(np.sin(2 * np.pi * 110 * tt) + .5 * np.sin(2 * np.pi * 165 * tt) + .2 * noise(d), 500)), .3, 1.0) * v
def steps(t0, t1, w, fn, v, pan=0):
    k = 0
    while True:
        ts = (math.pi / 2 + k * math.pi) / w; k += 1
        if ts < t0 + .1: continue
        if ts > t1 - .25: break
        add(buf, fn(v * (.85 + rng.random() * .3)), ts, pan=pan + .05 * (-1) ** k)
def insects(t0, d, n, v):
    for _ in range(n):
        tc = t0 + .2 + rng.random() * (d - .5); dd = .05 + rng.random() * .12
        c = bp(noise(dd), 4200 + rng.random() * 2500, 7800) * np.sin(np.pi * t_(dd) / dd) * (1 + np.sin(2 * np.pi * 60 * t_(dd)))
        add(buf, norm(c) * v * (.6 + rng.random() * .8), tc, pan=rng.random() * 1.6 - .8)


# ---------- the intro ----------
_, _, w0, w1 = B['who']; _, _, p0, p1 = B['plan']; _, _, r0, r1 = B['rules']
add(buf, bed(r1, 40, 400, .08), 0)
add(buf, whoosh(1.2, .18), .2); add(buf, norm(lp(brown(3.0), 120)) * np.sin(np.pi * t_(3.0) / 3.0) * .25, .3)
add(buf, pen((r0 - 2.8) - (p0 + 2.0), .2), p0 + 2.0, pan=.15)
for i in range(2): add(buf, stamp(.55), r0 + .6 + i * .5, pan=(-1) ** i * .1)

# ---------- every map shot: air; a swoop on long camera moves; the calendar ticking; a hit under red cards ----------
COPY = __import__('json').load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'copy.json')))['beats']
prev = None
for bid, shot, a, b in BEATS:
    if shot == 'map':
        d = b - a; cb = COPY.get(bid, {})
        add(buf, bed(d, 150, 2500, .07, .4, .4), a)
        if prev in ('map', 'intro'): add(buf, whoosh(min(2.4, d * .5), .14), a)
        else: add(buf, whoosh(1.4, .1), a + .05)
        if 'chapter' in cb: add(buf, norm(lp(brown(2.0), 90)) * np.sin(np.pi * t_(2.0) / 2.0) * .3, a + .3); add(buf, thump(.5, 52), a + .5)
        if 'card' in cb: add(buf, stamp(.6 if cb['card'].get('red') else .4), a + (1.6 if 'chapter' in cb else .6))
        if bid not in ('summary', 'question'):
            tc = a + .5
            while tc < b - .4: add(buf, tick(.04), tc, pan=.4); tc += .11
        for i, _p in enumerate(cb.get('pins', [])): add(buf, bell(.05, 1320), a + 1.2 + i * 2.2, pan=-.3)
    prev = shot
for bid in ('summary', 'question'):
    _, _, a, b = B[bid]; add(buf, norm(lp(brown(b - a), 140)) * np.sin(np.pi * t_(b - a) / (b - a)) * .25, a)
_, _, a, b = B['question']; add(buf, thump(.6, 44), a + 2.0)

# ---------- story scenes ----------
def scene(bid): return B[bid][2], B[bid][3]
a, b = scene('departS'); d = b - a
add(buf, gust(d, .22), a); add(buf, fade(norm(lp(noise(d), 500) * (.6 + .4 * np.abs(np.sin(2 * np.pi * 1.5 * t_(d))))), .5, .5) * .09, a, pan=.2)
steps(a, b, 5.2, crunch, .24); add(buf, creak(.05), a + 1.3, pan=.25); add(buf, creak(.05), a + 3.4, pan=.25)
a, b = scene('disguise'); d = b - a
add(buf, fade(norm(lp(np.sin(2 * np.pi * 100 * t_(d)) + .4 * noise(d), 400)), .4, .5) * .03, a)
for tc in (a + .8, a + 3.1): add(buf, fade(norm(bp(noise(.6), 1500, 7000) * np.abs(np.sin(2 * np.pi * 3 * t_(.6)))), .05, .2) * .1, tc, pan=-.2)
for i in range(9): add(buf, norm(bp(noise(.05), 3000, 8000) * env_exp(.05, .01)) * .05, a + 1.8 + i * .42, pan=.3)
a, b = scene('river'); d = b - a
add(buf, fade(norm(bp(noise(d), 150, 900) * (.5 + .5 * np.abs(np.sin(2 * np.pi * .7 * t_(d))))), .5, .5) * .14, a); insects(a, d, 40, .025)
mt = t_(d); add(buf, motor(d, 1) * (np.clip(mt / d, 0, 1) ** 2) * .16 * np.minimum(1, (d - mt) / .4), a, pan=-.4)
a, b = scene('jungle'); d = b - a
add(buf, bed(d, 300, 3000, .11), a); insects(a, d, 60, .03)
for tc, p in ((a + .9, -.6), (a + 2.8, .5), (a + 4.4, -.3)): add(buf, bird(.07), tc, pan=p)
steps(a, b, 4.4, squelch, .27)
a, b = scene('jail'); d = b - a
add(buf, clang(.5), a + .02, pan=-.3); add(buf, fade(norm(lp(np.sin(2 * np.pi * 50 * t_(d)) + .3 * noise(d), 300)), .3, .5) * .05, a)
for tc in (a + 1.2, a + 2.9, a + 4.2): add(buf, drip(.08), tc, pan=.35)
for i in range(1, 18): add(buf, scratch(.11), a + .4 + i * (d - .8) / 18 - .02, pan=-.15)
_, _, a, b = B['rewalk']; add(buf, pen(.7, .1), a + .2, pan=-.2); add(buf, stamp(.75), a + 1.4)
a, b = scene('shelby'); d = b - a
add(buf, gust(d, .14, 300, 2000), a); add(buf, fade(norm(lp(noise(d), 700) * (1 + .3 * np.sin(2 * np.pi * 3 * t_(d)))), .6, .6) * .05, a, pan=.5)   # a muffled room behind the bar door
add(buf, fade(norm(lp(np.sin(2 * np.pi * 120 * t_(d)) + .5 * noise(d), 900)), .3, .4) * .02, a, pan=.6)   # the neon buzz
a, b = scene('alaska'); d = b - a
add(buf, gust(d, .26, 250, 1800), a); steps(a, b, 4.6, snowstep, .2)
add(buf, fade(norm(bp(noise(d), 400, 2500) * (.6 + .4 * np.abs(np.sin(2 * np.pi * .73 * t_(d))))), .5, .5) * .07, a, pan=-.3)   # sled runners
a, b = scene('bering'); d = b - a
add(buf, gust(d, .3, 200, 2200), a); steps(a, b, 4.2, snowstep, .17)
for tc in (a + 1.6, a + 4.9, a + 7.1): add(buf, fade(norm(lp(brown(1.2), 300) * env_exp(1.2, .4)), .02, .5) * .25, tc, pan=rng.random() - .5)   # the ice groaning
a, b = scene('kolyma'); d = b - a
add(buf, gust(d, .2, 200, 1500), a); steps(a, b, 5.0, snowstep, .2); add(buf, creak(.04), a + 2.2, pan=.3)
a, b = scene('protest'); d = b - a
add(buf, gust(d, .12, 300, 2500), a); steps(a, b, 5.2, crunch, .2, -.1); steps(a + .2, b, 5.2, crunch, .15, .2)
add(buf, fade(norm(lp(noise(3.0), 900)) * np.sin(np.pi * t_(3.0) / 3.0) ** 2, .1, .1) * .22, a + 3.0, pan=-.7)   # a truck passing
a, b = scene('aldan'); d = b - a
add(buf, fade(norm(bp(noise(d), 200, 1500) * (.6 + .4 * np.sin(2 * np.pi * .5 * t_(d)))), .5, .5) * .12, a)
for i in range(int(d / .98)): add(buf, splash(.14), a + .3 + i * .98, pan=(-1) ** i * .15)
for tc in (a + 1.2, a + 3.6): add(buf, bird(.04, 3000), tc, pan=.5)
a, b = scene('camels'); d = b - a
add(buf, gust(d, .2, 200, 1400), a); steps(a, b, 4.4, crunch, .12)
for i in range(int(d / .85)): add(buf, bell(.035, 760 + (i % 3) * 140), a + .4 + i * .85 + rng.random() * .2, pan=.2 * ((i % 3) - 1))
a, b = scene('turkmen'); d = b - a
add(buf, gust(d, .16, 400, 3000), a); steps(a, b, 5.0, crunch, .2); add(buf, fade(motor(d, 1, 38), .5, .5) * .06, a, pan=.3)
a, b = scene('storm'); d = b - a
add(buf, fade(norm(hp(noise(d), 1500) + .5 * bp(noise(d), 300, 1500)), .4, .4) * .3, a)
add(buf, fade(norm(lp(brown(d), 250)), .4, .4) * .2, a)
for tc in (a + .9, a + 3.7): add(buf, thunder(.55), tc)
steps(a, b, 3, squelch, .18)
a, b = scene('caspian'); d = b - a
add(buf, fade(norm(bp(noise(d), 120, 1200) * (.6 + .4 * np.sin(2 * np.pi * .35 * t_(d)))), .6, .6) * .18, a)
for i in range(int(d / .55)): add(buf, splash(.08 + rng.random() * .04), a + .3 + i * .55, pan=rng.random() - .5)
add(buf, fade(motor(d, 1, 55), .6, .6) * .05, a, pan=-.5)
a, b = scene('channel'); d = b - a
add(buf, fade(norm(bp(noise(d), 120, 1000) * (.6 + .4 * np.sin(2 * np.pi * .25 * t_(d)))), .6, .6) * .16, a)
for i in range(int(d / 1.9)): add(buf, splash(.09), a + .5 + i * 1.9, pan=.1)
for tc in (a + 2.0, a + 5.6, a + 7.4): add(buf, gull(.05), tc, pan=rng.random() * 1.2 - .6)
a, b = scene('humber'); d = b - a
add(buf, bed(d, 150, 1500, .1), a); add(buf, horn(.18), a + 1.4, pan=-.5); add(buf, horn(.12), a + 6.4, pan=-.6)
steps(a, b, 5, crunch, .18, -.1); steps(a, b, 5, crunch, .13, .2); add(buf, fade(norm(lp(noise(d), 500)), .5, .5) * .05, a, pan=.2)
a, b = scene('home'); d = b - a
add(buf, fade(norm(hp(noise(d), 2000) + .3 * bp(noise(d), 400, 1500)), .5, .5) * .12, a)
steps(a, a + d * .9, 5, crunch, .15); add(buf, norm(bp(noise(.5), 200, 2000) * env_exp(.5, .1)) * .1, a + d * .55, pan=-.3)   # the door

fo = np.ones(len(buf)); _, _, c0, c1 = B['credits']; i0, i1 = int((c0 - .5) * SR), int((c0 + 1.0) * SR); fo[i0:i1] = np.linspace(1, 0, i1 - i0); fo[i1:] = 0; buf *= fo[:, None]
for ch in range(2): buf[:, ch] = limit(compress(buf[:, ch], .3, 2.5), .89)
os.makedirs("out", exist_ok=True)
sf.write(sys.argv[1] if len(sys.argv) > 1 else "out/sfx.wav", buf.astype(np.float32), SR)
print("sfx written", len(buf) / SR, "s, beats", len(BEATS))

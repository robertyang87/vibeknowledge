"""Sound effects for sample v3 (no music). Every cue sits on something on screen; times follow BEATS in main.js.
Run with the library's venv:  ~/lemo-opuscar/.venv/bin/python sfx.py out/sfx.wav
"""
import math, os, sys
import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.expanduser("~/lemo-opuscar/core/audio"))
from sfx import SR, t_, env_exp, lp, hp, bp, noise, norm, brown, whoosh, thump, creak, add, compress, limit  # noqa: E402

DUR = 69.5   # 66.5 s of film and a 3 s credits card
buf = np.zeros((int(DUR * SR), 2))
rng = np.random.default_rng(5)
T = dict(who=0, plan=7.2, rules=14.6, depart=20.6, departS=24.8, andes=29.6, darien=33.8, disguise=38.4, river=44.4, darienS=50.4, jail=56.0, rewalk=61.0)
RULE_T = 62.4
seg = lambda t, a, b: min(1, max(0, (t - a) / (b - a)))


def fade(x, a=.4, b=.4):
    tt = np.arange(len(x)) / SR; d = len(x) / SR
    return x * np.minimum(1, tt / a) * np.minimum(1, (d - tt) / b)


def bed(d, lo, hi, v):        # a filtered noise bed (wind, air, room tone)
    return fade(norm(bp(brown(d) * .6 + noise(d) * .4, lo, hi)), .6, .6) * v


def gust(d, v):               # wind with slow swells
    x = bp(noise(d), 200, 1400); tt = t_(d)
    return fade(norm(x * (.55 + .45 * np.sin(2 * np.pi * .23 * tt + 1) * np.sin(2 * np.pi * .11 * tt))), .8, .8) * v


def crunch(v=1.0, bright=1.0):   # a boot on gravel: a cluster of tiny grains
    d = .12; out = np.zeros(int(d * SR))
    for _ in range(22):
        s = int(rng.random() * .08 * SR); g = hp(noise(.008), 1500 * bright) * env_exp(.008, .0015) * (.3 + rng.random())
        out[s:s + len(g)] += g[:len(out) - s]
    out += lp(noise(d), 300) * env_exp(d, .02) * .6
    return norm(out) * v


def squelch(v=1.0):              # a boot in leaf litter and mud
    d = .18; tt = t_(d)
    x = lp(noise(d), 900) * env_exp(d, .05) + .4 * bp(noise(d), 2000, 5000) * env_exp(d, .015)
    x += .3 * np.sin(2 * np.pi * (180 - 300 * tt) * tt) * env_exp(d, .04)
    return norm(x) * v


def tick(v=1.0):                  # the day counter
    d = .02; return norm(bp(noise(d), 3000, 7000) * env_exp(d, .003)) * v


def clang(v=1.0):                 # a cell door shutting
    d = 1.6; tt = t_(d)
    x = sum(a * np.sin(2 * np.pi * f * tt + rng.random() * 6) * env_exp(d, tau) for f, a, tau in [(110, 1, .5), (233, .7, .35), (397, .5, .25), (611, .35, .18), (1240, .2, .08)])
    x += lp(noise(d), 800) * env_exp(d, .03) * 1.2
    return norm(x) * v


def scratch(v=1.0):               # a mark scratched into a wall
    d = .16; tt = t_(d)
    return norm(bp(noise(d), 2500, 7500) * np.sin(np.pi * tt / d) ** .6 * (1 + .6 * np.sin(2 * np.pi * 55 * tt))) * v


def stamp(v=1.0):                 # a weighty card landing
    return norm(thump(1, 48) + .5 * np.pad(lp(noise(.3), 1200) * env_exp(.3, .03), (0, int(.05 * SR)))[:int(.35 * SR)]) * v


def pen(d, v):                    # a pen drawing on paper: rough friction that moves with the stroke
    tt = t_(d); x = bp(noise(d), 1800, 6000)
    am = .5 + .5 * np.abs(np.sin(2 * np.pi * 1.3 * tt + 2 * np.sin(2 * np.pi * .4 * tt)))
    return fade(norm(x * am), .2, .3) * v


def bird(v=1.0):                  # a distant jungle call: two falling whistles
    d = .5; tt = t_(d); f = 2400 - 900 * (tt % .25) / .25
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * (tt % .25) / .25) ** 2
    return norm(x * env_exp(d, .4)) * v


def drip(v=1.0):
    d = .2; tt = t_(d); return norm(np.sin(2 * np.pi * (1200 + 2400 * tt) * tt) * env_exp(d, .03)) * v


# --- who and plan: space, a soft swell under the name, the pen drawing the line ---
add(buf, bed(T['rules'] - 0.0 + 6.0, 40, 400, .08), 0.0)                     # low space tone under the whole intro
add(buf, whoosh(1.2, .18), .2)                                               # the name arrives
add(buf, norm(lp(brown(3.0), 120)) * np.sin(np.pi * t_(3.0) / 3.0) * .25, .3)  # sub swell under the name
add(buf, pen(T['rules'] - 2.4 - (T['plan'] + 1.6), .2), T['plan'] + 1.6, pan=.15)  # the line is drawn (main.js planK)
# --- the two rules land ---
for i in range(2): add(buf, stamp(.55), T['rules'] + .6 + i * .5, pan=(-1) ** i * .1)
# --- depart: the camera falls from orbit to Punta Arenas; wind comes up ---
add(buf, whoosh(2.8, .28), T['depart'] + .1)
add(buf, gust(T['departS'] - T['depart'] - 1.4, .08), T['depart'] + 1.4)
# --- the steppe: wind, gravel underfoot, the cart rolling ---
d = T['andes'] - T['departS']
add(buf, gust(d, .22), T['departS'])
rollT = t_(d); roll = norm(lp(noise(d), 500) * (.6 + .4 * np.abs(np.sin(2 * np.pi * 1.5 * rollT)))) * .09
add(buf, fade(roll, .5, .5), T['departS'], pan=.2)
k = 0
while True:   # main.js: the walk phase is 5.2 t; a foot lands at phase pi/2 + k pi
    ts = (math.pi / 2 + k * math.pi) / 5.2; k += 1
    if ts < T['departS'] + .1: continue
    if ts > T['andes'] - .25: break
    add(buf, crunch(.22 + rng.random() * .06), ts, pan=.05 * (-1) ** k)
for tc in (T['departS'] + 1.3, T['departS'] + 3.4): add(buf, creak(.05), tc, pan=.25)
# --- the Andes: a long air pass while the calendar runs ---
add(buf, bed(T['darien'] - T['andes'], 150, 2500, .12), T['andes'])
add(buf, whoosh(T['darien'] - T['andes'], .2), T['andes'])
tc = T['andes'] + .4
while tc < T['darien'] - .3:
    add(buf, tick(.05), tc, pan=.4); tc += .09
# --- Darien on the map: the air thickens, a low rumble ---
add(buf, fade(norm(lp(brown(T['disguise'] - T['darien']), 160)), 1.0, .4) * .22, T['darien'])
add(buf, whoosh(2.2, .16), T['darien'] + 1.6)
# --- Medellin, the night table: a lamp hum, paper, cloth and a needle ---
d = T['river'] - T['disguise']
add(buf, fade(norm(lp(np.sin(2 * np.pi * 100 * t_(d)) + .4 * noise(d), 400)), .4, .5) * .03, T['disguise'])
for tc in (T['disguise'] + .8, T['disguise'] + 3.1): add(buf, fade(norm(bp(noise(.6), 1500, 7000) * np.abs(np.sin(2 * np.pi * 3 * t_(.6)))), .05, .2) * .1, tc, pan=-.2)   # map paper
for i in range(9): add(buf, norm(bp(noise(.05), 3000, 8000) * env_exp(.05, .01)) * .05, T['disguise'] + 1.8 + i * .42, pan=.3)   # needle through cloth
add(buf, norm(bp(noise(.4), 200, 1200) * env_exp(.4, .15)) * .08, T['disguise'] + 4.4, pan=.4)   # the sack
# --- the Atrato at night: water against the branches, insects, a motorboat passing close ---
d = T['darienS'] - T['river']
lap = norm(bp(noise(d), 150, 900) * (.5 + .5 * np.abs(np.sin(2 * np.pi * .7 * t_(d))))) * .14
add(buf, fade(lap, .5, .5), T['river'])
for _ in range(40):
    tc = T['river'] + .2 + rng.random() * (d - .5); dd = .05 + rng.random() * .1
    add(buf, norm(bp(noise(dd), 4500, 8000) * np.sin(np.pi * t_(dd) / dd)) * (.015 + rng.random() * .02), tc, pan=rng.random() * 1.6 - .8)
mt = t_(d); motor = np.sin(2 * np.pi * (62 + 4 * np.sin(2 * np.pi * .3 * mt)) * mt); motor = norm(lp(np.sign(motor) * np.abs(motor) ** .5 + .3 * noise(d), 700))
add(buf, motor * (np.clip(mt / d, 0, 1) ** 2) * .16 * np.minimum(1, (d - mt) / .4), T['river'], pan=-.4)
# --- the canopy: insects, birds, drips, steps in leaf litter ---
d = T['jail'] - T['darienS']
add(buf, bed(d, 300, 3000, .11), T['darienS'])
for _ in range(60):
    tc = T['darienS'] + .2 + rng.random() * (d - .5); dd = .05 + rng.random() * .12
    c = bp(noise(dd), 4200 + rng.random() * 2500, 7800) * np.sin(np.pi * t_(dd) / dd) * (1 + np.sin(2 * np.pi * 60 * t_(dd)))
    add(buf, norm(c) * (.02 + rng.random() * .035), tc, pan=rng.random() * 1.6 - .8)
for tc, p in ((T['darienS'] + .9, -.6), (T['darienS'] + 2.8, .5), (T['darienS'] + 4.4, -.3)): add(buf, bird(.07), tc, pan=p)
for tc in (T['darienS'] + 1.7, T['darienS'] + 3.6): add(buf, drip(.06), tc, pan=.3)
k = 0
while True:   # main.js: the walk phase is 4.4 t
    ts = (math.pi / 2 + k * math.pi) / 4.4; k += 1
    if ts < T['darienS'] + .1: continue
    if ts > T['jail'] - .25: break
    add(buf, squelch(.27 + rng.random() * .06), ts, pan=.05 * (-1) ** k)
# --- the cell: the door, a hum, drips, a scratch for every day ---
add(buf, clang(.5), T['jail'] + .02, pan=-.3)
add(buf, fade(norm(lp(np.sin(2 * np.pi * 50 * t_(5.0)) + .3 * noise(5.0), 300)), .3, .5) * .05, T['jail'])
for tc in (T['jail'] + 1.2, T['jail'] + 2.9, T['jail'] + 4.2): add(buf, drip(.08), tc, pan=.35)
for i in range(1, 18):   # main.js: n = 1 + floor(seg(t, t0 + .4, t1 - .4) * 18)
    add(buf, scratch(.11), T['jail'] + .4 + i * (5.0 - .8) / 18 - .02, pan=-.15)
# --- the re-walk: air, the escort line drawn, the rule lands, steps return softly ---
add(buf, whoosh(1.4, .2), T['rewalk'] + .05)
add(buf, bed(DUR - T['rewalk'], 120, 1500, .07), T['rewalk'])
add(buf, pen(.7, .1), T['rewalk'] + .2, pan=-.2)
add(buf, stamp(.75), RULE_T)
for i in range(8): add(buf, crunch(.07), RULE_T + .5 + i * .45, pan=.1)

fadeout = np.ones(len(buf)); a0, a1 = int(66.0 * SR), int(67.5 * SR); fadeout[a0:a1] = np.linspace(1, 0, a1 - a0); fadeout[a1:] = 0; buf *= fadeout[:, None]
for ch in range(2): buf[:, ch] = limit(compress(buf[:, ch], .3, 2.5), .89)
os.makedirs("out", exist_ok=True)
sf.write(sys.argv[1] if len(sys.argv) > 1 else "out/sfx.wav", buf.astype(np.float32), SR)
print("sfx written", len(buf) / SR, "s")

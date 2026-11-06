// 15-second look sample for the Bushby film, Risograph style.
// Plates: R = Federal Blue (world, figure, type), G = Sunflower (sun, warmth), B = Red (stamps, borders, power).
// All audience-facing text is loaded from episodes/bushby/copy/sample-15s.json.
import { makeRiso } from './riso.js';
import { W, H, plate, g, clear, rect, poly, blob, circle, ellipse, line, curve, text, layer, over, ink, ring } from './draw.js';

const INKS = [[61, 85, 136], [255, 181, 17], [255, 102, 94]];
const out = document.getElementById('c');
const print = makeRiso(out, W, H);
const COPY = await (await fetch('copy.json')).json();
await Promise.all(['500 40px SC', '900 40px SC'].map(f => document.fonts.load(f)));

// ---------- helpers ----------
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const eio = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
const eo = x => 1 - Math.pow(1 - x, 3);
const BLUE = (a = 1) => [a, 0, 0], SUN = (a = 1) => [0, a, 0], RED = (a = 1) => [0, 0, a];
const mix = (b, y, r) => [b, y, r];
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ---------- calendar and distance (sourced anchors only) ----------
const DAY = 86400000, D0 = Date.UTC(1998, 10, 1);
const days = d => (d - D0) / DAY;
// film time -> calendar date. Each shot runs its own short stretch of the calendar and the counters
// jump at the cuts (the calendar flips forward); the stall shot lets the days run while the line stands still.
const U = (y, m, d) => days(Date.UTC(y, m - 1, d));
const CAL = [[1.2, 4.4, U(1998, 11, 1), U(1998, 12, 20)], [4.4, 6.6, U(2001, 1, 19), U(2001, 2, 16)],
  [6.6, 9.0, U(2006, 3, 17), U(2006, 3, 31)], [9.0, 9.9, U(2006, 4, 1), U(2006, 4, 1)], [9.9, 13.4, U(2006, 4, 1), U(2011, 3, 10)], [13.4, 16.8, U(2011, 3, 10), U(2011, 3, 10)]];
function calAt(t) { if (t < CAL[0][0]) return 0; for (const [t0, t1, d0, d1] of CAL) if (t < t1) return d0 + (d1 - d0) * eio(seg(t, t0, t1)); return CAL[CAL.length - 1][3]; }
// km walked: 0 on 1998-11-01, about 27,000 by April 2006 (NBC/Reuters 2006); then detained, the line stops.
const KM_2006 = 27000, D_2006 = days(Date.UTC(2006, 2, 31));
const kmAt = d => d <= 0 ? 0 : d >= D_2006 ? KM_2006 : KM_2006 * d / D_2006;   // a linear share by date between two sourced anchors

// ---------- registration ----------
const SHOTS = [0, 1.2, 4.4, 6.6, 9, 13.4];
const shotOf = t => { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1]) i++; return i; };
function regFor(t, extraKick = 0) {
  const i = shotOf(t), r = rng(1000 + i * 77);
  const base = [[0, 0], [(r() - .5) * 5, (r() - .5) * 4], [(r() - .5) * 5, (r() - .5) * 4]];
  const k = Math.max(0, 1 - (t - SHOTS[i]) / .25), ring_ = Math.cos((t - SHOTS[i]) * 40) * k * k * 10 + extraKick;
  return base.map(([x, y], j) => j === 0 ? [x, y] : [x + ring_ * (j === 1 ? 1 : -1), y - ring_ * .4]);
}

// ---------- the walker (small figure pushing his cart) ----------
function walker(x, y, s, ph, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const c = BLUE(1), step = Math.sin(ph * Math.PI * 2), step2 = Math.sin(ph * Math.PI * 2 + Math.PI);
  const bob = o.still ? 0 : Math.abs(Math.cos(ph * Math.PI * 2)) * 3;
  // legs
  const hip = [0, -92 + bob];
  const footA = o.still ? [-10, 0] : [step * 26, -Math.max(0, -step2) * 10];
  const footB = o.still ? [12, 0] : [step2 * 26, -Math.max(0, -step) * 10];
  line([hip, [(hip[0] + footA[0]) / 2 + 6, -44 + bob / 2], footA], 13, c);
  line([hip, [(hip[0] + footB[0]) / 2 + 6, -44 + bob / 2], footB], 13, c);
  // torso and pack
  g.save(); g.translate(0, bob); g.rotate(o.lean ?? .12);
  blob([[-16, -96], [16, -96], [20, -150], [4, -170], [-18, -160]], c);
  blob([[-40, -110], [-14, -104], [-12, -168], [-30, -176], [-44, -150]], c); // backpack
  circle(10, -188, 15, c);                                                      // head
  g.restore();
  if (o.cart !== false) {
    // arms to the handle, cart in front
    const hand = [56, -118 + bob];
    line([[8, -152 + bob], [34, -132 + bob], hand], 9, c);
    line([hand, [92, -86]], 7, c);
    blob([[86, -96], [168, -100], [174, -48], [92, -44]], c);       // the cart body
    circle(108, -24, 18, c); circle(158, -24, 18, c);
    circle(108, -24, 6, [0, 0, 0]); circle(158, -24, 6, [0, 0, 0]); // paper hubs
  }
  if (o.sled) {
    const hand = [-30, -122 + bob];
    line([[0, -150 + bob], [-20, -132 + bob], hand], 9, c);
    line([[-34, -110], [-150, -22]], 4, c);                          // tow line
    blob([[-250, -40], [-150, -44], [-140, -10], [-262, -8]], c);   // the sled
  }
  g.restore();
}

// ---------- HUD: year-and-place tag, two counters ----------
function hud(t, tag) {
  if (tag) {
    { const d = new Date(D0 + calAt(t) * DAY); tag = [d.getUTCFullYear() + ' · ' + String(d.getUTCMonth() + 1).padStart(2, '0') + (tag.rolling ? '' : ' · ' + String(d.getUTCDate()).padStart(2, '0')), tag[1]]; }
    text(tag[0], 96, 140, '900 64px SC', BLUE(1), 'left', 'alphabetic', 2);
    text(tag[1], 98, 196, '500 36px SC', BLUE(1), 'left', 'alphabetic', 2);
  }
  const d = calAt(t), km = Math.round(kmAt(d) / 100) * 100;
  const kmTxt = COPY.counter_km_prefix + ' ' + km.toLocaleString('en-US') + ' ' + COPY.counter_km;
  const dTxt = COPY.counter_day_prefix + ' ' + Math.floor(d + 1).toLocaleString('en-US') + ' ' + COPY.counter_day;
  text(kmTxt, 1824, 132, '900 52px SC', BLUE(1), 'right', 'alphabetic', 1);
  text(dTxt, 1824, 190, '500 40px SC', BLUE(1), 'right', 'alphabetic', 1);
  return { kmTxt, dTxt };
}

// ---------- scenes ----------
function sky(bands) { // stepped halftone bands from the horizon up: [[y0,y1,ink]...]
  for (const [y0, y1, c] of bands) rect(0, y0, W, y1 - y0, c);
}
function patagonia(t) {
  const lt = t - 1.2, scroll = lt * 160;
  clear();
  sky([[430, 560, SUN(.2)], [560, 700, SUN(.4)]]);
  over(() => circle(1300, 640, 230, SUN(1)));                                  // low sun
  // far range (40% tint), parallax slow
  g.save(); g.translate(-scroll * .15, 0);
  const far = []; for (let x = -200; x <= 2600; x += 120) far.push([x, 640 - 60 * Math.abs(Math.sin(x * .004)) - 40 * Math.abs(Math.sin(x * .011))]);
  over(() => poly([[-200, 760], ...far, [2600, 760]], BLUE(.4)));
  g.restore();
  // near plain (solid blue), road as paper
  rect(0, 740, W, 340, BLUE(1));
  poly([[0, 820], [W, 800], [W, 852], [0, 878]], [0, 0, 0]);
  g.save(); g.translate(-(scroll % 240), 0);
  for (let x = 0; x < W + 480; x += 240) rect(x, 834 - x * .011, 110, 7, SUN(1));   // dashed centre line
  const r = rng(7); for (let i = 0; i < 26; i++) { const gx = r() * (W + 600), gy = 900 + r() * 160; poly([[gx, gy], [gx + 9, gy - 26], [gx + 18, gy]], [0, 0, 0]); } // grass knocked out
  g.restore();
  layer(() => walker(760, 846, .8, Math.floor(lt * 12) / 12 * .9));
  // wind
  for (let i = 0; i < 3; i++) line([[(1700 - ((lt * 520 + i * 640) % 2200)), 430 + i * 40], [(1700 - ((lt * 520 + i * 640) % 2200)) + 160, 430 + i * 40]], 4, BLUE(1));
}
function jungle(t) {
  const lt = t - 4.4;
  clear(SUN(.2));
  rect(0, 230, W, 200, SUN(.4));
  // far canopy (blue tint), mid trunks (solid), hanging vines
  const r = rng(31);
  for (let i = 0; i < 14; i++) { const x = (i * 150 - lt * 20) % (W + 300) - 150; blob([[x - 140, 600], [x - 60, 380 + r() * 80], [x + 80, 360 + r() * 80], [x + 160, 600]], BLUE(.4)); }
  for (const [x, w] of [[180, 64], [560, 40], [1420, 84], [1690, 44]]) rect(x - lt * 34, 250, w, 640, BLUE(1));
  for (let i = 0; i < 9; i++) { const x = 100 + i * 210 - lt * 34; curve([[x, 250], [x + 20, 360], [x - 10, 470]], 5, BLUE(1)); }
  // the Atrato: a flat river band, paper glints
  rect(0, 820, W, 260, BLUE(.6));
  for (let i = 0; i < 9; i++) rect((i * 260 + (i % 3) * 70 - lt * 90) % (W + 300) - 100, 870 + (i % 4) * 46, 40 + (i % 3) * 30, 5, [0, 0, 0]);
  poly([[0, 836], [W, 822], [W, 842], [0, 858]], [0, 0, 0]);
  layer(() => walker(940 + lt * 40, 828, .56, Math.floor(lt * 12) / 12 * .9, { cart: false, lean: .2 }));
  // foreground leaves along the bottom and the lower sides only (the HUD corners stay clear)
  const leaves = [[-40, 1080, 420, -.5], [260, 1110, 300, -1.1], [1960, 1080, 460, -2.6], [1620, 1110, 320, -2.1], [-60, 760, 300, -.2], [1980, 700, 330, 3.0]];
  over(() => leaves.forEach(([x, y, L, a], i) => { g.save(); g.translate(x - lt * (50 + i * 8), y); g.rotate(a); blob([[0, 0], [L * .5, -L * .2], [L, 0], [L * .5, L * .2]], [.7, .85, 0]); g.restore(); }));
}
function alaska(t) {
  const lt = t - 6.3;
  clear();
  sky([[0, 300, BLUE(.2)], [300, 520, BLUE(.4)]]);
  over(() => circle(420, 470, 120, SUN(.6)));
  // spruce rows
  const r = rng(11);
  for (let row = 0; row < 2; row++) for (let i = 0; i < 18; i++) {
    const x = (i * 130 + row * 60 - lt * (row ? 70 : 30)) % (W + 200) - 100, base = 600 + row * 70, h = 120 + r() * 120 + row * 40;
    poly([[x, base], [x + 40, base - h], [x + 80, base]], BLUE(row ? 1 : .6));
  }
  rect(0, 640, W, 440, [0, 0, 0]);                                  // snow (paper)
  for (let i = 0; i < 6; i++) line([[i * 380 - lt * 60, 700 + i * 50], [i * 380 + 260 - lt * 60, 690 + i * 50]], 3, BLUE(.4));
  layer(() => walker(1060, 860, .74, Math.floor(lt * 12) / 12 * .9, { cart: false, sled: true, lean: .32 }));
}
function seaIce(t) {
  const lt = t - 6.6;
  clear(BLUE(1));
  sky([[0, 380, BLUE(.3)]]);
  rect(0, 0, W, 300, [0, 0, 0]);
  over(() => rect(0, 300, W, 80, SUN(.25)));
  // floes (paper) drifting north (to screen left)
  const r = rng(23);
  for (let i = 0; i < 16; i++) {
    const cx = (i * 170 + r() * 120 - lt * 50) % (W + 300) - 150, cy = 430 + r() * 600, s = 80 + r() * 160;
    const pts = []; for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; pts.push([cx + Math.cos(a) * s * (0.7 + r() * .5), cy + Math.sin(a) * s * .38 * (0.7 + r() * .5)]); }
    poly(pts, [0, 0, 0]);
  }
  poly([[0, 760], [520, 700], [900, 730], [1400, 690], [W, 720], [W, 1080], [0, 1080]], [0, 0, 0]);
  for (let i = 0; i < 9; i++) { const x = 120 + i * 210; poly([[x, 740], [x + 50, 690], [x + 110, 742]], BLUE(.4)); } // pressure ridge
  layer(() => { walker(980, 900, .6, Math.floor(lt * 12) / 12 * .9, { cart: false, sled: true, lean: .3 }); walker(1300, 930, .56, Math.floor(lt * 12) / 12 * .9 + .4, { cart: false, sled: true, lean: .3 }); });
}
function chukotka(t) {
  const lt = t - 9;
  clear();
  sky([[260, 560, BLUE(.2)]]);
  rect(0, 560, W, 520, BLUE(.6));
  rect(0, 640, W, 440, BLUE(1));
  poly([[0, 560], [600, 540], [1100, 552], [W, 530], [W, 580], [0, 600]], [0, 0, 0]);       // shoreline of ice
  // a small post on the shore
  rect(1360, 420, 22, 160, BLUE(1)); rect(1310, 400, 120, 50, BLUE(1));
  layer(() => walker(900, 640, .7, 0, { cart: false, sled: true, still: true, lean: 0 }));
  // the border: a dashed red line across the shore
  over(() => { for (let x = 0; x < W; x += 60) rect(x, 600, 34, 6, RED(1)); });
  // the stamp
  const st = seg(lt, .35, .55), sc = 1.6 - .6 * eo(st);
  if (st > 0) {
    g.save(); g.translate(1340, 300); g.rotate(-.12); g.scale(sc, sc);
    over(() => {
      g.lineWidth = 12; g.strokeStyle = ink(...RED(1)); g.strokeRect(-230, -96, 460, 192);
      text(COPY.stamp, 0, 48, '900 132px SC', RED(1), 'center', 'alphabetic', 18);
    });
    g.restore();
  }
}
function titleCard(t) {
  const lt = t - 13.4;
  clear();
  const sweep = eio(seg(lt, 0, .5));
  text(COPY.title, 960 + 6, 560 + 4, '900 150px SC', BLUE(1), 'center', 'alphabetic', 6);
  over(() => text(COPY.title, 960 - 6, 560 - 3, '900 150px SC', RED(.9), 'center', 'alphabetic', 6));
  text(COPY.title_sub, 960, 650, '500 40px SC', BLUE(1), 'center', 'alphabetic', 6);
  return sweep;
}
function questionCard(t) {
  clear();
  text(COPY.question, 960, 572, '900 104px SC', BLUE(1), 'center', 'alphabetic', 4);
  over(() => text(COPY.question, 952, 566, '900 104px SC', SUN(.9), 'center', 'alphabetic', 4));
}
function subtitle(t) {
  for (const s of COPY.subs) if (t >= s.t0 && t < s.t1) {
    g.font = '500 44px SC'; const w = g.measureText(s.text).width + 72;
    g.save(); g.beginPath(); g.roundRect(960 - w / 2, 948, w, 76, 10); g.fillStyle = 'rgb(0,0,0)'; g.fill(); g.restore();   // paper knockout strip
    text(s.text, 960, 1000, '500 44px SC', BLUE(1), 'center', 'alphabetic', 1);
    return s;
  }
  return null;
}

// ---------- the frame ----------
const TAGS = COPY.tags;
let lastTexts = [];
window.DUR = 16.8;
window.render = t => {
  g.setTransform(1, 0, 0, 1, 0, 0);
  const shot = shotOf(t);
  let tag = null, gate = [1, 1, 0], sweep = [1e5, 1e5, 1e5];
  const texts = [];
  if (t < 1.2) { questionCard(t); texts.push({ id: 'q', text: COPY.question, x0: 260, y0: 470, x1: 1660, y1: 600 }); }
  else if (t < 4.4) {
    patagonia(t); tag = TAGS.s1;
    // the question stays printed in the sky until the viewer has read it
    text(COPY.question, 960, 330, '900 76px SC', BLUE(1), 'center', 'alphabetic', 3);
    over(() => text(COPY.question, 954, 326, '900 76px SC', SUN(.9), 'center', 'alphabetic', 3));
    texts[0] = { id: 'q', text: COPY.question, x0: 400, y0: 250, x1: 1520, y1: 350 };
  }
  else if (t < 6.6) { jungle(t); tag = TAGS.s2; }
  else if (t < 9) { seaIce(t); tag = TAGS.s4; }
  else if (t < 13.4) {
    chukotka(t); tag = t < 9.9 ? TAGS.s5 : Object.assign([...TAGS.s5], { rolling: true }); gate = [1, 1, 1];
    const lt = t - 9; sweep[2] = -200 + eio(seg(lt, .15, .6)) * (W + 400);   // the red plate is inked on, left to right
    if (lt > .35) texts.push({ id: 'stamp', text: COPY.stamp, x0: 1060, y0: 180, x1: 1620, y1: 420 });
  } else { titleCard(t); gate = [1, 0, 1]; texts.push({ id: 'title', text: COPY.title, x0: 300, y0: 420, x1: 1620, y1: 680 }); }
  if (tag) { hud(t, tag); texts.push({ id: 'place' + shot, text: tag[1], x0: 90, y0: 160, x1: 760, y1: 210 }); }
  subtitle(t);
  lastTexts = texts;
  const kick = (t >= 9.35 && t < 9.7) ? Math.cos((t - 9.35) * 38) * (1 - (t - 9.35) / .35) * 12 : 0;   // the stamp lands
  print(plate, { inks: INKS, seed: Math.floor(t * 12), sheet: shot * 3.7, boil: .33, period: 7, off: regFor(t, kick), gate, sweep, ang: [0.2618, 0, 1.309] });
};
window.TEXTS = t => { window.render(t); return lastTexts; };
window.READY = true;

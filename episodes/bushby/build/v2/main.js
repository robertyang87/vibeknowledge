// Sample v2: second-person life-sim telling ("if you were Karl Bushby"), flat vector scenes on the left,
// a live route map and a status card on the right. One timeline drives scene, map and HUD.
// Audience-facing text comes from copy.json (a render-time copy of episodes/bushby/copy/sample-v2.json).
const C = document.getElementById('c'), g = C.getContext('2d');
const W = 1920, H = 1080;
const COPY = await (await fetch('copy.json')).json();
const TL = await (await fetch('vendor/timeline.json')).json();
const TOPO = await (await fetch('vendor/countries-50m.json')).json();
await Promise.all(['500 40px SC', '700 40px SC', '900 40px SC'].map(f => document.fonts.load(f)));

// ---------- palette ----------
const P = { bg: '#0e1624', panel: '#16223a', card: '#1b2a45', line: '#2b3d60', ink: '#f4efe6', mute: '#9fb0c8',
  route: '#ffb347', routeHi: '#ffe1a8', plan: 'rgba(244,239,230,.35)', move: '#b79cff', back: '#ff6b6b', red: '#ff5a5f',
  land: '#4a6f96', landHi: '#5a82ab', sea: '#0c182a' };

// ---------- helpers ----------
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eo = x => 1 - Math.pow(1 - x, 3);
const lerp = (a, b, k) => a + (b - a) * k;
function rr(x, y, w, h, r, fill) { g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = fill; g.fill(); }
function txt(s, x, y, font, col, align = 'left', base = 'alphabetic') { g.font = font; g.fillStyle = col; g.textAlign = align; g.textBaseline = base; g.fillText(s, x, y); }
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ---------- calendar ----------
const DAY = 86400000, EPOCH = Date.UTC(1970, 0, 1);
const dayOf = (y, m, d) => (Date.UTC(y, m - 1, d) - EPOCH) / DAY;
const D_START = dayOf(1998, 11, 1), BORN = Date.UTC(1969, 2, 30);
const BEATS = [
  { id: 'hook', t0: 0, t1: 4.6, d0: D_START, d1: D_START, view: { c: [-50, 10], k: 1 } },
  { id: 'depart', t0: 4.6, t1: 9.6, d0: D_START, d1: dayOf(1998, 12, 20), view: { c: [-70, -40], k: 3.2 } },
  { id: 'andes', t0: 9.6, t1: 13.6, d0: dayOf(1999, 1, 1), d1: dayOf(2000, 12, 31), view: { c: [-75, -12], k: 2.2 } },
  { id: 'darien', t0: 13.6, t1: 18.1, d0: dayOf(2001, 1, 15), d1: dayOf(2001, 2, 15), view: { c: [-77.3, 7.6], k: 26 } },
  { id: 'jail', t0: 18.1, t1: 22.6, d0: dayOf(2001, 2, 16), d1: dayOf(2001, 3, 6), view: { c: [-77.9, 8.3], k: 60 } },
  { id: 'rewalk', t0: 22.6, t1: 27.1, d0: dayOf(2001, 3, 6), d1: dayOf(2001, 3, 10), view: { c: [-77.9, 8.3], k: 60 } },
];
const DUR = 27.1;
const beatAt = t => BEATS.find(b => t < b.t1) || BEATS[BEATS.length - 1];
function calAt(t) { const b = beatAt(t); return lerp(b.d0, b.d1, eio(seg(t, b.t0, b.t1))); }
const fmtDate = d => { const x = new Date(EPOCH + d * DAY); return `${x.getUTCFullYear()} · ${String(x.getUTCMonth() + 1).padStart(2, '0')} · ${String(x.getUTCDate()).padStart(2, '0')}`; };
const ageAt = d => { const x = new Date(EPOCH + d * DAY), b = new Date(BORN); let a = x.getUTCFullYear() - b.getUTCFullYear(); if (x.getUTCMonth() < b.getUTCMonth() || (x.getUTCMonth() === b.getUTCMonth() && x.getUTCDate() < b.getUTCDate())) a--; return a; };

// ---------- map card ----------
const MAP = { x: 1220, y: 40, w: 660, h: 520 };
const land = topojson.feature(TOPO, TOPO.objects.countries);
const borders = topojson.mesh(TOPO, TOPO.objects.countries, (a, b) => a !== b);
const proj = d3.geoMercator();
const path = d3.geoPath(proj, g);
const PTS = TL.points;
// the 1998 plan, as a faint dashed line through the regions it named
const PLAN = [[-70.9, -53.2], [-77, -12], [-74, 4.7], [-99, 19.4], [-111, 40], [-147.7, 64.8], [-168, 65.6], [130, 62], [37.6, 55.7], [-0.3, 53.7]];
function mapView(t) {
  const b = beatAt(t), i = BEATS.indexOf(b), prev = BEATS[Math.max(0, i - 1)];
  const k = eio(seg(t, b.t0, b.t0 + 1.4));
  const lk = Math.exp(lerp(Math.log(prev.view.k), Math.log(b.view.k), k));
  const c = d3.geoInterpolate(prev.view.c, b.view.c)(k);
  return { c, k: lk };
}
function drawMap(t, cal) {
  const { x, y, w, h } = MAP;
  rr(x, y, w, h, 22, P.card);
  g.save(); g.beginPath(); g.roundRect(x + 10, y + 10, w - 20, h - 20, 16); g.clip();
  g.fillStyle = P.sea; g.fillRect(x, y, w, h);
  const v = mapView(t);
  proj.scale(105 * v.k).center(v.c).translate([x + w / 2, y + h / 2]);
  g.beginPath(); path(land); g.fillStyle = P.land; g.fill();
  g.beginPath(); path(borders); g.strokeStyle = 'rgba(12,24,42,.55)'; g.lineWidth = 1; g.stroke();
  const lw = clamp(2.2 + Math.log2(v.k) * .5, 2.2, 5);
  // plan
  g.setLineDash([3, 7]); g.beginPath(); path({ type: 'LineString', coordinates: PLAN }); g.strokeStyle = P.plan; g.lineWidth = 2; g.stroke(); g.setLineDash([]);
  // transport moves already happened
  for (const m of TL.moves) {
    if (cal < m.lo) continue;
    const f = clamp((cal - m.lo) / Math.max(1, m.hi - m.lo), 0, 1);
    const pts = m.path.map(p => proj(p)); g.beginPath();
    const n = 40, total = pts.length - 1;
    for (let k = 0; k <= n * f; k++) { const s = k / n * total, i = Math.min(total - 1, Math.floor(s)), u = s - i; const a = pts[i], bb = pts[i + 1];
      const mx = (a[0] + bb[0]) / 2, my = (a[1] + bb[1]) / 2 - Math.hypot(bb[0] - a[0], bb[1] - a[1]) * .25;
      const qx = (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * mx + u * u * bb[0], qy = (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * my + u * u * bb[1];
      k ? g.lineTo(qx, qy) : g.moveTo(qx, qy); }
    g.setLineDash([2, 6]); g.lineCap = 'round'; g.strokeStyle = (m.type === 'back' || m.type === 'fwd_rewalked') ? P.back : P.move; g.lineWidth = lw * .8; g.stroke(); g.setLineDash([]);
  }
  // route up to the calendar date
  const coords = []; let head = null;
  for (let i = 0; i < PTS.length; i++) {
    const p = PTS[i]; if (p.t > cal && !(i && cal > p.dep)) break;
    if (p.leg === 'start' && coords.length) break;
    if (p.t <= cal) coords.push([p.lon, p.lat]);
    else { const a = PTS[i - 1], f = (cal - p.dep) / (p.t - p.dep); head = d3.geoInterpolate([a.lon, a.lat], [p.lon, p.lat])(f); coords.push(head); break; }
  }
  if (!head && coords.length) head = coords[coords.length - 1];
  if (coords.length > 1) {
    g.lineJoin = 'round'; g.lineCap = 'round';
    g.beginPath(); path({ type: 'LineString', coordinates: coords }); g.strokeStyle = 'rgba(255,179,71,.25)'; g.lineWidth = lw * 3.2; g.stroke();
    g.beginPath(); path({ type: 'LineString', coordinates: coords }); g.strokeStyle = P.route; g.lineWidth = lw; g.stroke();
  }
  // start and end pins
  pin(proj([-70.917, -53.163]), P.ink, 5); pin(proj([-0.30, 53.78]), P.ink, 5);
  if (head) { const q = proj(head), pulse = .5 + .5 * Math.sin(t * 6); g.beginPath(); g.arc(q[0], q[1], 9 + pulse * 6, 0, 7); g.fillStyle = `rgba(255,179,71,${.35 - pulse * .2})`; g.fill(); pin(q, P.routeHi, 6); }
  g.restore();
}
function pin(q, col, r) { if (!q) return; g.beginPath(); g.arc(q[0], q[1], r, 0, 7); g.fillStyle = col; g.fill(); g.lineWidth = 2; g.strokeStyle = P.bg; g.stroke(); }

// ---------- status card ----------
const CARD = { x: 1220, y: 590, w: 660, h: 450 };
function drawCard(t, cal, beat) {
  const { x, y, w, h } = CARD; rr(x, y, w, h, 22, P.card);
  const bc = COPY.beats[beat.id];
  if (beat.id === 'hook') {
    txt(COPY.plan_label, x + 40, y + 76, '700 34px SC', P.mute);
    txt(COPY.plan_value, x + 40, y + 140, '900 56px SC', P.ink);
    txt(COPY.from, x + 40, y + 230, '500 34px SC', P.ink); txt('→  ' + COPY.to, x + 40, y + 284, '500 34px SC', P.ink);
    return [{ id: 'plan', text: COPY.plan_label + COPY.plan_value, x0: x, y0: y, x1: x + w, y1: y + 160 }];
  }
  txt(fmtDate(cal), x + 40, y + 78, '900 54px SC', P.ink);
  txt(ageAt(cal) + ' ' + COPY.age_unit, x + w - 40, y + 78, '700 40px SC', P.route, 'right');
  txt(bc.place, x + 40, y + 132, '500 32px SC', P.mute);
  // sleep line
  rr(x + 30, y + 160, w - 60, 70, 14, P.panel);
  txt(COPY.sleep_label + '：' + bc.sleep, x + 56, y + 207, '700 34px SC', P.ink);
  if (bc.pocket) txt(COPY.pocket_label + '：' + bc.pocket, x + 40, y + 270, '500 30px SC', P.mute);
  if (beat.id === 'jail') { const n = clamp(Math.floor(cal - dayOf(2001, 2, 16)) + 1, 1, 18); txt(COPY.jail_days.replace('{n}', n), x + 40, y + 270, '700 30px SC', P.red); }
  // plan vs actual bars (years)
  const bx = x + 40, bw = w - 80, scale = bw / 28, yrs = (cal - D_START) / 365.25;
  txt(COPY.plan_label + ' 12 ' + COPY.year_unit, bx, y + 330, '500 26px SC', P.mute);
  rr(bx, y + 342, 12 * scale, 14, 7, 'rgba(244,239,230,.35)');
  txt(COPY.real_label + ' ' + yrs.toFixed(1) + ' ' + COPY.year_unit, bx, y + 398, '500 26px SC', P.mute);
  rr(bx, y + 410, Math.max(14, yrs * scale), 14, 7, yrs > 12 ? P.red : P.route);
  txt(COPY.day_prefix + ' ' + Math.floor(cal - D_START + 1).toLocaleString('en-US') + ' ' + COPY.day_unit, x + w - 40, y + 398, '700 26px SC', P.ink, 'right');
  return [{ id: 'place-' + beat.id, text: bc.place, x0: x, y0: y + 100, x1: x + w, y1: y + 140 }, { id: 'sleep-' + beat.id, text: bc.sleep, x0: x, y0: y + 160, x1: x + w, y1: y + 230 }];
}

// ---------- the walker ----------
function person(x, y, s, ph, o = {}) {
  g.save(); g.translate(x, y); g.scale(o.flip ? -s : s, s);
  const sw = Math.sin(ph * Math.PI * 2), bob = o.sit ? 0 : Math.abs(Math.cos(ph * Math.PI * 2)) * 4;
  const leg = (a, col) => { g.save(); g.translate(0, -78 + bob); g.rotate(a); g.fillStyle = col; g.beginPath(); g.roundRect(-8, 0, 16, 78, 8); g.fill(); g.restore(); };
  if (o.sit) { g.fillStyle = '#2b3550'; g.beginPath(); g.roundRect(-10, -40, 70, 18, 8); g.fill(); g.beginPath(); g.roundRect(44, -40, 16, 40, 8); g.fill(); }
  else { leg(sw * .45, '#2b3550'); leg(-sw * .45, '#36425f'); }
  g.translate(0, bob);
  g.fillStyle = '#3f7d5c'; g.beginPath(); g.roundRect(-40, -150, 34, 64, 10); g.fill();       // backpack
  g.fillStyle = '#e8683f'; g.beginPath(); g.roundRect(-14, -156, 40, 84, 14); g.fill();      // jacket
  g.fillStyle = '#f2c9a0'; g.beginPath(); g.arc(8, -176, 20, 0, 7); g.fill();               // head
  g.fillStyle = '#5a3b26'; g.beginPath(); g.arc(4, -184, 20, Math.PI * 1.05, Math.PI * 1.95); g.fill(); // hair
  g.fillStyle = '#e8683f'; g.save(); g.translate(16, -140); g.rotate(o.cart ? -1.2 : sw * .5 - .1); g.beginPath(); g.roundRect(-6, 0, 12, 56, 6); g.fill(); g.restore(); // arm
  g.restore();
  if (o.cart) { // the cart he called the Beast
    g.save(); g.translate(x + (o.flip ? -1 : 1) * 70 * s, y); g.scale(s, s);
    g.strokeStyle = '#c9d2df'; g.lineWidth = 5; g.beginPath(); g.moveTo(-26, -96 + 0); g.lineTo(10, -60); g.stroke();
    g.fillStyle = '#3d6fa8'; g.beginPath(); g.roundRect(0, -92, 96, 56, 10); g.fill();
    g.fillStyle = '#2f5a8a'; g.fillRect(8, -84, 80, 8);
    for (const wx of [18, 80]) { g.fillStyle = '#1e2433'; g.beginPath(); g.arc(wx, -20, 20, 0, 7); g.fill(); g.fillStyle = '#c9d2df'; g.beginPath(); g.arc(wx, -20, 6, 0, 7); g.fill(); }
    g.restore();
  }
}

// ---------- scenes (inside the scene panel) ----------
const SC = { x: 40, y: 40, w: 1150, h: 1000 };
function band(y, h, col) { g.fillStyle = col; g.fillRect(SC.x, y, SC.w, h); }
function hills(y, amp, freq, phase, col) { g.beginPath(); g.moveTo(SC.x, SC.y + SC.h); for (let x = 0; x <= SC.w; x += 20) g.lineTo(SC.x + x, y - amp * (.5 + .5 * Math.sin(x * freq + phase)) - amp * .4 * Math.sin(x * freq * 2.7 + phase * 1.3)); g.lineTo(SC.x + SC.w, SC.y + SC.h); g.closePath(); g.fillStyle = col; g.fill(); }
function scenePatagonia(lt, hook) {
  band(SC.y, 360, '#f6c48a'); band(SC.y + 360, 140, '#f2a96b'); band(SC.y + 500, 120, '#e98a5b');
  g.beginPath(); g.arc(SC.x + 820, SC.y + 560, 150, 0, 7); g.fillStyle = '#ffe0a3'; g.fill();
  hills(SC.y + 600, 120, .006, 1 + lt * .02, '#8a6a8f'); hills(SC.y + 660, 80, .01, 2 + lt * .05, '#6b5277');
  g.fillStyle = '#4b3a5c'; g.fillRect(SC.x, SC.y + 700, SC.w, 300);
  g.fillStyle = '#2f2640'; g.beginPath(); g.moveTo(SC.x, SC.y + 760); g.lineTo(SC.x + SC.w, SC.y + 740); g.lineTo(SC.x + SC.w, SC.y + 800); g.lineTo(SC.x, SC.y + 830); g.closePath(); g.fill();
  for (let i = 0; i < 8; i++) { const xx = SC.x + ((i * 180 - lt * 220) % (SC.w + 180) + SC.w + 180) % (SC.w + 180) - 90; g.fillStyle = '#f6c48a'; g.fillRect(xx, SC.y + 784 - (xx - SC.x) * .02, 70, 6); }
  person(SC.x + (hook ? 360 : 420), SC.y + 790, hook ? .55 : .8, hook ? 0 : Math.floor(lt * 10) / 10 * .9, { cart: true });
}
function sceneAndes(lt, k) {
  const sky = ['#9fd3e8', '#f4d6a0', '#bfe3c0'][Math.min(2, Math.floor(k * 3))];
  band(SC.y, 1000, sky);
  if (k < .34) { hills(SC.y + 720, 140, .004, lt, '#e8b878'); hills(SC.y + 820, 90, .007, lt * 2, '#d99c5f'); }
  else if (k < .67) { g.fillStyle = '#7c8fa8'; for (let i = 0; i < 6; i++) { const xx = SC.x + i * 220 - (lt * 80) % 220; g.beginPath(); g.moveTo(xx, SC.y + 760); g.lineTo(xx + 140, SC.y + 360 + (i % 3) * 60); g.lineTo(xx + 280, SC.y + 760); g.fill(); g.fillStyle = '#f4efe6'; g.beginPath(); g.moveTo(xx + 105, SC.y + 460 + (i % 3) * 60); g.lineTo(xx + 140, SC.y + 360 + (i % 3) * 60); g.lineTo(xx + 175, SC.y + 460 + (i % 3) * 60); g.fill(); g.fillStyle = '#7c8fa8'; } }
  else { hills(SC.y + 700, 110, .006, lt, '#6fb27a'); hills(SC.y + 790, 80, .01, lt * 2, '#4f9a62'); }
  g.fillStyle = '#5b4a3a'; g.fillRect(SC.x, SC.y + 800, SC.w, 200);
  person(SC.x + 520, SC.y + 860, .8, Math.floor(lt * 12) / 12 * 1.1, { cart: k < .6 });
}
function sceneJungle(lt, night = true) {
  band(SC.y, 1000, night ? '#10241f' : '#2f6b4a');
  if (night) { g.beginPath(); g.arc(SC.x + 900, SC.y + 160, 54, 0, 7); g.fillStyle = '#f4efe6'; g.fill(); }
  const r = rng(5);
  for (let i = 0; i < 9; i++) { const xx = SC.x + i * 140 - (lt * 30) % 140; g.fillStyle = night ? '#16352d' : '#25583c'; g.fillRect(xx, SC.y + 120, 26 + r() * 30, 760); }
  for (let i = 0; i < 26; i++) { const xx = SC.x + r() * SC.w, yy = SC.y + 600 + r() * 380; g.save(); g.translate(xx, yy); g.rotate(-1 + r() * 2); g.fillStyle = night ? '#1f4a3a' : '#3f8a5a'; g.beginPath(); g.ellipse(0, 0, 90, 26, 0, 0, 7); g.fill(); g.restore(); }
  g.fillStyle = night ? '#0b1a16' : '#204a33'; g.fillRect(SC.x, SC.y + 880, SC.w, 120);
  if (night) for (let i = 0; i < 14; i++) { const a = .5 + .5 * Math.sin(lt * 4 + i * 1.7); g.beginPath(); g.arc(SC.x + r() * SC.w, SC.y + 300 + r() * 500, 3, 0, 7); g.fillStyle = `rgba(255,236,150,${a})`; g.fill(); }
  person(SC.x + 560, SC.y + 900, .78, Math.floor(lt * 10) / 10 * .9, {});
}
function sceneJail(lt) {
  band(SC.y, 1000, '#2a2f3d');
  g.fillStyle = '#3a4152'; g.fillRect(SC.x, SC.y + 760, SC.w, 240);
  g.fillStyle = '#f6d58f'; g.globalAlpha = .9; g.fillRect(SC.x + 760, SC.y + 160, 150, 110); g.globalAlpha = 1;   // window light
  g.fillStyle = 'rgba(246,213,143,.12)'; g.beginPath(); g.moveTo(SC.x + 760, SC.y + 270); g.lineTo(SC.x + 910, SC.y + 270); g.lineTo(SC.x + 760, SC.y + 900); g.lineTo(SC.x + 460, SC.y + 900); g.closePath(); g.fill();
  person(SC.x + 470, SC.y + 790, .9, 0, { sit: true });
  for (let i = 0; i < 9; i++) { g.fillStyle = '#11151f'; g.fillRect(SC.x + 80 + i * 120, SC.y, 22, 1000); }   // bars in front
  g.fillStyle = '#11151f'; g.fillRect(SC.x, SC.y + 120, SC.w, 24);
}
function sceneRewalk(lt) {
  sceneJungle(lt, false);
}
function caption(s, t0, t1, t) {
  if (!s || t < t0 || t > t1) return null;
  const a = Math.min(1, seg(t, t0, t0 + .25)) * (1 - seg(t, t1 - .2, t1));
  g.font = '700 44px SC'; const w = g.measureText(s).width + 64;
  g.globalAlpha = a; rr(SC.x + SC.w / 2 - w / 2, SC.y + SC.h - 120, w, 80, 16, 'rgba(10,14,22,.78)');
  txt(s, SC.x + SC.w / 2, SC.y + SC.h - 66, '700 44px SC', P.ink, 'center'); g.globalAlpha = 1;
  return { id: 'cap-' + t0, text: s, x0: SC.x, y0: SC.y + SC.h - 120, x1: SC.x + SC.w, y1: SC.y + SC.h - 40 };
}
function stamp(s, t, at) {
  const k = seg(t, at, at + .22); if (k <= 0) return null;
  const sc = 1.8 - .8 * eo(k);
  g.save(); g.translate(SC.x + SC.w / 2, SC.y + 360); g.rotate(-.1); g.scale(sc, sc); g.globalAlpha = Math.min(1, k * 2);
  g.font = '900 96px SC'; const tw = g.measureText(s).width + 90;
  g.strokeStyle = P.red; g.lineWidth = 10; g.strokeRect(-tw / 2, -80, tw, 160);
  txt(s, 0, 34, '900 96px SC', P.red, 'center'); g.restore(); g.globalAlpha = 1;
  return { id: 'stamp', text: s, x0: SC.x, y0: SC.y + 200, x1: SC.x + SC.w, y1: SC.y + 520 };
}

// ---------- frame ----------
let lastTexts = [];
window.DUR = DUR;
window.render = t => {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = P.bg; g.fillRect(0, 0, W, H);
  const beat = beatAt(t), cal = calAt(t), lt = t - beat.t0, texts = [];
  // scene panel
  g.save(); g.beginPath(); g.roundRect(SC.x, SC.y, SC.w, SC.h, 26); g.clip();
  if (beat.id === 'hook' || beat.id === 'depart') scenePatagonia(beat.id === 'hook' ? 0 : lt, beat.id === 'hook');
  else if (beat.id === 'andes') sceneAndes(lt, seg(t, beat.t0, beat.t1));
  else if (beat.id === 'darien') sceneJungle(lt, true);
  else if (beat.id === 'jail') sceneJail(lt);
  else sceneRewalk(lt);
  if (beat.id === 'hook') {
    g.fillStyle = 'rgba(14,22,36,.45)'; g.fillRect(SC.x, SC.y, SC.w, SC.h);
    txt(COPY.hook1, SC.x + SC.w / 2, SC.y + 360, '900 92px SC', P.ink, 'center');
    if (t > .9) { g.globalAlpha = seg(t, .9, 1.2); txt(COPY.hook2, SC.x + SC.w / 2, SC.y + 500, '900 92px SC', P.route, 'center'); g.globalAlpha = 1; }
    texts.push({ id: 'hook1', text: COPY.hook1, x0: SC.x, y0: SC.y + 260, x1: SC.x + SC.w, y1: SC.y + 380 });
    if (t > .9) texts.push({ id: 'hook2', text: COPY.hook2, x0: SC.x, y0: SC.y + 400, x1: SC.x + SC.w, y1: SC.y + 520 });
  } else {
    const c = caption(COPY.beats[beat.id].cap, beat.t0 + .2, beat.t1 - .05, t); if (c) texts.push(c);
    if (beat.id === 'rewalk') { const s = stamp(COPY.beats.rewalk.stamp, t, beat.t0 + 1.4); if (s) texts.push(s); }
  }
  g.restore();
  // map and card
  drawMap(t, cal);
  texts.push(...drawCard(t, cal, beat));
  lastTexts = texts;
};
window.TEXTS = t => { window.render(t); return lastTexts; };
window.READY = true;

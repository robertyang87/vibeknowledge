// "回家，走了二十八年" — the full film. Map shots (a satellite globe, the route drawn as it was walked) alternate with
// full-frame story scenes. Everything on screen comes from copy.json (episodes/bushby/copy/film.json); facts from FACTS.md.
// Page contract: READY, DUR, render(t) (async: imagery patches load on demand), TEXTS(t).
import * as THREE from 'three';
import { makePost } from '/core/three/post.js';
import * as S from './scene_index.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';

const W = 1920, H = 1080;
const C = await (await fetch('copy.json')).json();
const CB = C.beats;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eio = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const eo = k => 1 - Math.pow(1 - k, 3);
const lerp = (a, b, k) => a + (b - a) * k;
const lonLerp = (a, b, k) => { let d = b - a; if (d > 180) d -= 360; if (d < -180) d += 360; return a + d * k; };

// ---------- the beat sheet ----------
const DAY = 86400000;
const dayOf = (y, m, d) => Date.UTC(y, m - 1, d) / DAY;
const D_START = dayOf(1998, 11, 1), BORN = Date.UTC(1969, 2, 30);
const F = (c, l) => ({ mode: 'follow', o: c, l });
const A = (c, l, c2, l2) => ({ mode: 'abs', c, l, c2: c2 || c, l2: l2 || l });
// [id, shot, seconds, date from, date to, route from, route to, camera]
const SHEET = [
  ['who', 'intro', 7.2], ['plan', 'intro', 8.4], ['rules', 'intro', 6.0],
  // 1 depart
  ['depart', 'map', 4.4, D_START, D_START + 3, 0, 1, F([-.35, -1.9, .045], [.05, .5, 0])],
  ['departS', 'patagonia', 6.6, D_START + 3, dayOf(1998, 12, 20)],
  ['andes', 'map', 9.6, dayOf(1999, 1, 1), dayOf(2000, 11, 1), 1, 25, F([-.9, -5.2, .14], [.15, .9, 0])],
  // 2 Darien
  ['darien', 'map', 4.6, dayOf(2000, 11, 1), dayOf(2001, 1, 15), 25, 25, F([-1.4, -6.5, .11], [.2, .2, 0])],
  ['disguise', 'disguise', 7.0, dayOf(2000, 11, 20), dayOf(2001, 1, 14)],
  ['river', 'river', 6.0, dayOf(2001, 1, 31), dayOf(2001, 2, 4)],
  ['jungle', 'jungle', 6.1, dayOf(2001, 2, 5), dayOf(2001, 2, 15)],
  ['jail', 'cell', 5.5, dayOf(2001, 2, 16), dayOf(2001, 3, 6)],
  ['rewalk', 'map', 5.8, dayOf(2001, 3, 6), dayOf(2001, 3, 10), 32, 34, A([-77.84, 7.62, .028], [-77.82, 8.28, 0])],
  // 3 North America
  ['north', 'map', 9.6, dayOf(2001, 3, 10), dayOf(2002, 12, 31), 34, 72, F([-1.6, -11, .32], [.2, 1.5, 0])],
  ['shelby', 'shelby', 6.0, dayOf(2002, 12, 31), dayOf(2003, 1, 1)],
  ['canada', 'map', 7.4, dayOf(2003, 1, 2), dayOf(2005, 3, 22), 72, 91, F([1.5, -9, .32], [-.2, 1.4, 0])],
  ['alaska', 'alaska', 5.9, dayOf(2005, 1, 10), dayOf(2005, 2, 20)],
  // 4 Bering
  ['beringMap', 'map', 5.4, dayOf(2005, 12, 30), dayOf(2006, 3, 17), 91, 98, F([.6, -3.6, .085], [-.2, .6, 0])],
  ['bering', 'bering', 12.9, dayOf(2006, 3, 17), dayOf(2006, 3, 31)],
  ['landing', 'map', 6.6, dayOf(2006, 3, 31), dayOf(2006, 4, 1), 98, 100, A([-168.4, 63.9, .05], [-169.6, 66.1, 0])],
  // 5 the line stops
  ['stopped', 'map', 13.3, dayOf(2006, 4, 1), dayOf(2006, 5, 24), 100, 100, A([-169.0, 61.5, .22], [-170.2, 66.4, 0], [-171.5, 60.5, .3], [-172, 66.5, 0])],
  ['chukotka', 'map', 6.4, dayOf(2007, 4, 12), dayOf(2008, 5, 18), 100, 106, F([2.5, -4.8, .14], [-.5, .9, 0])],
  ['nosponsor', 'map', 6.4, dayOf(2008, 5, 18), dayOf(2011, 3, 10), 106, 106, A([168, 60, .5], [166.4, 68, 0], [167, 59, .55], [166.4, 68, 0])],
  ['kolyma', 'kolyma', 5.8, dayOf(2011, 3, 10), dayOf(2011, 4, 25)],
  ['ban', 'map', 11.4, dayOf(2011, 4, 25), dayOf(2013, 9, 2), 107, 109, A([158, 58, .5], [156, 67.5, 0], [156, 57, .6], [155, 67.5, 0])],
  ['protestMap', 'map', 13.3, dayOf(2013, 9, 3), dayOf(2014, 9, 10), 109, 109, A([-98, 22, .9], [-98, 37, 0], [-95, 24, .8], [-94, 38, 0]), { extra: 'protest' }],
  ['protest', 'protest', 11.5, dayOf(2013, 10, 1), dayOf(2014, 9, 10)],
  ['lifted', 'map', 7.8, dayOf(2014, 10, 23), dayOf(2016, 5, 1), 109, 113, F([2, -6.5, .2], [-.3, 1, 0])],
  ['aldan', 'aldan', 5.2, dayOf(2015, 7, 1), dayOf(2015, 7, 2)],
  ['mongolia', 'map', 12.1, dayOf(2016, 5, 1), dayOf(2017, 8, 8), 113, 122, F([1.5, -8.5, .3], [-.2, 1.2, 0])],
  // 6 west
  ['camels', 'camels', 6.8, dayOf(2017, 11, 5), dayOf(2017, 12, 31)],
  ['xinjiang', 'map', 15.1, dayOf(2018, 1, 1), dayOf(2018, 11, 1), 123, 124, A([102, 36, .6], [100, 45, 0], [92, 34, .55], [89, 44, 0])],
  ['kazakh', 'map', 6.6, dayOf(2018, 11, 1), dayOf(2019, 7, 1), 124, 127, F([1, -8, .32], [-.2, 1.2, 0])],
  ['turkmen', 'turkmen', 6.9, dayOf(2019, 7, 15), dayOf(2019, 8, 14)],
  ['iran', 'map', 13.7, dayOf(2019, 8, 14), dayOf(2019, 9, 15), 127, 127, A([62, 33, .22], [60.5, 38.6, 0], [60, 32.5, .2], [59, 38.2, 0]), { extra: 'voided' }],
  // 7 four years
  ['wait', 'map', 11.5, dayOf(2019, 10, 1), dayOf(2020, 3, 1), 127, 127, A([-60, 10, 2.3], [-104.7, 19.2, 0], [-100, 5, .5], [-104.7, 19.2, 0])],
  ['storm', 'storm', 6.1, dayOf(2020, 8, 22), dayOf(2020, 8, 23)],
  ['sealed', 'map', 12.2, dayOf(2021, 1, 1), dayOf(2022, 12, 31), 127, 127, A([60, 29, .45], [60, 40, 0], [58, 29, .5], [58, 40.5, 0])],
  ['decision', 'map', 11.8, dayOf(2023, 1, 1), dayOf(2023, 9, 1), 127, 127, A([53, 33, .32], [51, 41.5, 0], [52, 34, .3], [51, 42, 0])],
  // 8 Caspian
  ['bukhara', 'map', 7.9, dayOf(2023, 9, 24), dayOf(2024, 8, 16), 127, 130, F([1, -7.5, .3], [-.3, 1.2, 0])],
  ['caspian', 'caspian', 14.6, dayOf(2024, 8, 16), dayOf(2024, 9, 17)],
  ['caspianMap', 'map', 6.4, dayOf(2024, 8, 16), dayOf(2024, 9, 17), 130, 131, F([1.2, -4.2, .14], [-.2, .9, 0])],
  // 9 Europe
  ['turkey', 'map', 9.6, dayOf(2024, 11, 10), dayOf(2025, 5, 2), 131, 148, F([1.5, -8, .3], [-.3, 1.4, 0])],
  ['europe', 'map', 11.0, dayOf(2025, 9, 1), dayOf(2026, 9, 30), 148, 181, F([1.5, -8, .3], [-.3, 1.4, 0])],
  ['blocked', 'map', 11.4, dayOf(2026, 6, 1), dayOf(2026, 10, 2), 181, 181, A([2.2, 49.4, .055], [1.5, 51.0, 0], [2.0, 49.6, .045], [1.4, 51.05, 0])],
  ['channel', 'channel', 13.7, dayOf(2026, 10, 3), dayOf(2026, 10, 5)],
  // 10 home
  ['england', 'map', 7.4, dayOf(2026, 10, 5), dayOf(2026, 11, 1), 181, 191, F([.6, -1.8, .06], [-.05, .4, 0])],
  ['humber', 'humber', 15.0, dayOf(2026, 11, 1), dayOf(2026, 11, 1)],
  ['home', 'home', 12.1, dayOf(2026, 11, 2), dayOf(2026, 11, 2)],
  ['summary', 'map', 11.0, dayOf(2026, 11, 2), dayOf(2026, 11, 2), 193, 193, A([-20, 25, 2.5], [-20, 25, 0], [-120, 15, 2.7], [-120, 15, 0])],
  ['question', 'map', 7.6, dayOf(2026, 11, 2), dayOf(2026, 11, 2), 193, 193, A([-120, 15, 2.7], [-120, 15, 0], [-150, 10, 3.0], [-150, 10, 0])],
  ['credits', 'black', 5.0, dayOf(2026, 11, 2), dayOf(2026, 11, 2)],
];
const BEATS = []; { let t = 0; for (const [id, shot, dur, d0, d1, r0, r1, cam, extra] of SHEET) { BEATS.push({ id, shot, t0: t, t1: t + dur, d0: d0 ?? D_START, d1: d1 ?? d0 ?? D_START, r0, r1, cam, ...(extra || {}) }); t += dur; } }
const DUR = BEATS[BEATS.length - 1].t1;
const BI = Object.fromEntries(BEATS.map(b => [b.id, b]));
const beatAt = t => BEATS.find(b => t < b.t1) || BEATS[BEATS.length - 1];
const calAt = t => { const b = beatAt(t); return lerp(b.d0, b.d1, eio(seg(t, b.t0 + .3, b.t1 - .3))); };
const ymd = d => new Date(d * DAY);
const ageAt = d => { const x = ymd(d), b = new Date(BORN); let a = x.getUTCFullYear() - b.getUTCFullYear(); if (x.getUTCMonth() < b.getUTCMonth() || (x.getUTCMonth() === b.getUTCMonth() && x.getUTCDate() < b.getUTCDate())) a--; return a; };
const fmtDate = d => { const x = ymd(d); return `${x.getUTCFullYear()} · ${String(x.getUTCMonth() + 1).padStart(2, '0')} · ${String(x.getUTCDate()).padStart(2, '0')}`; };

// ---------- renderer ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H); renderer.setPixelRatio(1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('stage').appendChild(renderer.domElement);
const camera = new THREE.PerspectiveCamera(30, W / H, .001, 50);
const world = new THREE.Scene(); world.background = new THREE.Color(0x020409);
const post = makePost(renderer, world, camera, W, H, { ssaa: 1 });
post.dof.aper = 0; post.dof.maxCoc = 0;
post.bloom.strength = .28; post.bloom.radius = .3; post.bloom.threshold = .95;
post.vig.uniforms.amt.value = .55;

const ll = (lon, lat, r = 1) => { const a = THREE.MathUtils.degToRad(lat), b = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(r * Math.cos(a) * Math.sin(b), r * Math.sin(a), r * Math.cos(a) * Math.cos(b)); };
const toLL = v => { const n = v.clone().normalize(); return [THREE.MathUtils.radToDeg(Math.atan2(n.x, n.z)), THREE.MathUtils.radToDeg(Math.asin(n.y))]; };
const loadT = async f => { const t = await new THREE.TextureLoader().loadAsync(f); t.anisotropy = 16; t.colorSpace = THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t; };

// ---------- globe: a global base plus K patch slots filled on demand with the patches the camera is looking at ----------
const tex = await loadT('assets/earth.png'); tex.wrapS = THREE.RepeatWrapping;
const baseColTex = await loadT('assets/sat_global.jpg'); baseColTex.wrapS = THREE.RepeatWrapping;
const DET = await (await fetch('assets/detail.json')).json();
const K = 4, blank = new THREE.DataTexture(new Uint8Array([0, 128, 0, 255]), 1, 1); blank.needsUpdate = true;
const uni = { map: { value: tex }, baseCol: { value: baseColTex }, sun: { value: ll(-40, 25).normalize() } };
for (let i = 0; i < K; i++) { uni['det' + i] = { value: blank }; uni['sat' + i] = { value: blank }; uni['box' + i] = { value: new THREE.Vector4(0, 0, 0, 0) }; uni['on' + i] = { value: 0 }; }
const patchCode = Array.from({ length: K }, (_, i) => `
      if (on${i} > .5) { vec4 bx = box${i}; vec2 dd = deg; if (bx.x > 0. && dd.x < bx.x - 180.) dd.x += 360.; if (bx.z < 0. && dd.x > bx.z + 180.) dd.x -= 360.;
        vec2 u = (dd - bx.xy) / (bx.zw - bx.xy); vec2 f = min(u, 1. - u) * (bx.zw - bx.xy);
        float w = smoothstep(0., .16 * min(bx.z - bx.x, bx.w - bx.y), min(f.x, f.y));
        if (w > 0.) { vec2 du = dFdx(u), dv = dFdy(u); vec3 d = textureGrad(det${i}, u, du, dv).rgb; vec3 sc = textureGrad(sat${i}, u, du, dv).rgb;
          r = mix(r, d.r, w); rel = mix(rel, (d.g - .5) * 1.7, w); elev = mix(elev, d.b, w);
          float wat = step(dot(sc, vec3(.3,.59,.11)), .16) * step(sc.r, sc.b + .03);   // dark and blue: water; anything else is land, even below sea level
          lsat = mix(lsat, 1. - wat, w); lw = max(lw, w);
          sat = mix(sat, sc, w * smoothstep(.06, .025, foot)); } }`).join('');
const globeMat = new THREE.ShaderMaterial({ glslVersion: THREE.GLSL3, uniforms: uni,
  vertexShader: `out vec3 vN; out vec3 vP;
    void main(){ vN = normalize(mat3(modelMatrix) * normal); vec4 wp = modelMatrix * vec4(position,1.); vP = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`,
  fragmentShader: `out vec4 fragColor; uniform sampler2D map, baseCol, ${Array.from({ length: K }, (_, i) => `det${i}, sat${i}`).join(', ')};
    uniform vec4 ${Array.from({ length: K }, (_, i) => 'box' + i).join(', ')}; uniform float ${Array.from({ length: K }, (_, i) => 'on' + i).join(', ')};
    uniform vec3 sun; in vec3 vN; in vec3 vP;
    void main(){
      vec3 n = normalize(vP);
      float lat = asin(clamp(n.y,-1.,1.)); float lon = atan(n.x, n.z);
      vec2 uvA = vec2(lon/6.2831853+.5, lat/3.1415927+.5);
      vec2 uvB = vec2(fract(lon/6.2831853+1.), uvA.y);
      vec2 uv = uvA;   // with repeat wrapping both parameterisations sample the same texel; only the derivatives differ at the date line
      vec2 xA = dFdx(uvA), xB = dFdx(uvB), yA = dFdy(uvA), yB = dFdy(uvB);
      vec2 dx = vec2(abs(xA.x) < abs(xB.x) ? xA.x : xB.x, xA.y), dy = vec2(abs(yA.x) < abs(yB.x) ? yA.x : yB.x, yA.y);
      vec3 t = textureGrad(map, uv, dx, dy).rgb;
      float r = t.r, rel = t.g - .5, elev = 0., lsat = 0., lw = 0.;
      vec3 sat = textureGrad(baseCol, uv, dx, dy).rgb;
      vec2 deg = vec2(degrees(lon), degrees(lat));
      float foot = max((abs(dx.x) + abs(dy.x)) * 360., (abs(dx.y) + abs(dy.y)) * 180.);
      ${patchCode}
      float land = max(smoothstep(.35,.65,r), lsat * lw);
      float coast = 1. - clamp(abs(r - .5) / max(fwidth(r) * 1.1, 1e-5), 0., 1.);
      vec3 V = normalize(cameraPosition - vP);
      float fres = pow(1. - max(dot(V, vN), 0.), 3.);
      float day = .55 + .45 * max(dot(vN, sun), 0.);
      vec3 c = pow(sat, vec3(1.15)); float l = dot(c, vec3(.3,.59,.11)); c = mix(vec3(l), c, .82);
      c *= (1. + clamp(rel, -.35, .35) * 1.1 * land) * mix(.55, 1., day);
      vec3 sea = mix(vec3(.010,.022,.045), vec3(.03,.07,.12), fres) + c * .18;
      vec3 col = mix(sea, c * .95, land) + vec3(.30,.56,.88) * coast * .35;
      col += vec3(.10,.25,.45) * fres * .35;
      if (any(isnan(col)) || any(isinf(col))) col = vec3(0.);
      fragColor = vec4(clamp(col, 0., 4.), 1.);
    }` });
world.add(new THREE.Mesh(new THREE.SphereGeometry(1, 256, 128), globeMat));
world.add(new THREE.Mesh(new THREE.SphereGeometry(1.025, 128, 64), new THREE.ShaderMaterial({
  side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  vertexShader: `varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(mat3(modelMatrix)*normal); vec4 wp = modelMatrix*vec4(position,1.); vP = wp.xyz; gl_Position = projectionMatrix*viewMatrix*wp; }`,
  fragmentShader: `varying vec3 vN; varying vec3 vP; void main(){ vec3 V = normalize(cameraPosition - vP); float f = pow(clamp(dot(V, -vN) + .18, 0., 1.), 6.); vec3 c = vec3(.25,.55,1.) * f * 1.6; if (any(isnan(c)) || any(isinf(c))) c = vec3(0.); gl_FragColor = vec4(clamp(c, 0., 2.), 1.); }` })));
const rnd = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(7);
{ const n = 2500, p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const v = new THREE.Vector3(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1).normalize().multiplyScalar(30); p.set([v.x, v.y, v.z], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  world.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 1.2, sizeAttenuation: false, color: 0x8899bb, transparent: true, opacity: .55 }))); }

// patch cache: load on demand, keep a few, choose up to K that cover what the camera looks at
const cache = new Map(); let stamp = 0;
async function getPatch(i) {
  if (!cache.has(i)) cache.set(i, Promise.all([loadT(`assets/${DET[i].name}.png`), loadT(`assets/sat_${DET[i].name}.jpg`)]).then(([d, s]) => ({ d, s, used: 0 })));
  const p = await cache.get(i); p.used = ++stamp;
  if (cache.size > 5) { const ents = []; for (const [k, v] of cache) ents.push([k, await v]); ents.sort((a, b) => a[1].used - b[1].used);
    for (const [k, v] of ents.slice(0, cache.size - 5)) if (v.used < stamp - 4) { v.d.dispose(); v.s.dispose(); cache.delete(k); } }
  return p;
}
const inBox = (b, lon, lat, m) => { let lo = lon; if (b[0] > 0 && lo < b[0] - 180) lo += 360; if (b[2] < 0 && lo > b[2] + 180) lo -= 360; return lo > b[0] - m && lo < b[2] + m && lat > b[1] - m && lat < b[3] + m; };
const DBG = new URLSearchParams(location.search);
async function choosePatches(lon, lat, alt) {
  if (DBG.has('nopatch')) { for (let k = 0; k < K; k++) uni['on' + k].value = 0; return; }
  const m = Math.min(25, alt * 45);   // the view's half-width in degrees, roughly
  const cand = DET.map((d, i) => ({ i, res: (d.box[2] - d.box[0]) / d.size[0], d })).filter(c => inBox(c.d.box, lon, lat, m)).sort((a, b) => b.res - a.res).slice(-K);
  for (let k = 0; k < K; k++) {
    const c = cand[k];
    if (!c) { uni['on' + k].value = 0; continue; }
    const p = await getPatch(c.i);
    uni['det' + k].value = p.d; uni['sat' + k].value = p.s; uni['box' + k].value.set(...c.d.box); uni['on' + k].value = 1;
  }
}

// ---------- reference lines (rivers and roads only show up close) ----------
const DETAIL_LINES = [];
{ const L = await (await fetch('assets/lines.json')).json();
  const mk = (arcs, r, color, op) => { const p = [];
    for (const a of arcs) for (let i = 0; i < a.length - 1; i++) { if (Math.abs(a[i][0] - a[i + 1][0]) > 180) continue; const u = ll(...a[i], r), v = ll(...a[i + 1], r); p.push(u.x, u.y, u.z, v.x, v.y, v.z); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    const o = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: op, depthWrite: false })); o.userData.op = op; world.add(o); return o; };
  const outside = a => a.every(([lo, la]) => lo < -130 || lo > -20 || la < -60 || la > 35);
  if (DBG.has('nolines')) { /* debug: skip reference lines */ }
  DETAIL_LINES.push([mk(L.border.filter(outside), 1.00005, 0x8a9bb8, .22), 3]);
  const L10 = await (await fetch('assets/lines10.json')).json();
  mk(L10.lake, 1.00005, 0x5f8fc4, .5); DETAIL_LINES.push([mk(L10.river, 1.00004, 0x4f7fb4, .42), 1.2], [mk(L10.road, 1.00004, 0xb7a684, .28), .6]); mk(L10.border, 1.00004, 0x9aa8c2, .22); }

// ---------- the route: every segment in order, drawn by kind; one arc length runs through all of them ----------
const R = await (await fetch('assets/route.json')).json();
const NSEG = 194;   // segments 0-193 are the journey in order; later ones are transport, the voided line and the protest walk
const KINDS = { walk: [], swim: [], unknown_route: [] };
const RP = [], RA = [], segEndArc = [];   // densified head path and its arc length
let arc = 0;
const dens = (coords, step, fn) => { for (let i = 0; i < coords.length - 1; i++) { const a = ll(...coords[i]), b = ll(...coords[i + 1]); const n = Math.max(1, Math.ceil(a.angleTo(b) / step));
  for (let k = 0; k < n; k++) fn(a.clone().lerp(b, k / n).normalize(), a.clone().lerp(b, (k + 1) / n).normalize()); } };
for (let si = 0; si < NSEG; si++) {
  const s = R.segs[si], list = KINDS[s.kind] || KINDS.walk;
  dens(s.c, .0015, (p, q) => { const a0 = arc; arc += p.distanceTo(q); list.push([p, q, a0, arc]); if (!RP.length) { RP.push(p); RA.push(0); } RP.push(q); RA.push(arc); });
  segEndArc.push(arc);
}
const TOTAL = arc;
const arcAtSeg = i => i <= 0 ? 0 : segEndArc[Math.min(i, NSEG) - 1];
const pointOn = (P, Aa, s) => { let lo = 0, hi = Aa.length - 1; if (s <= 0) return P[0].clone(); if (s >= Aa[hi]) return P[hi].clone();
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (Aa[m] < s) lo = m; else hi = m; } const k = (s - Aa[lo]) / (Aa[hi] - Aa[lo] || 1); return P[lo].clone().lerp(P[hi], k).normalize(); };
const GOLD = new THREE.Color(1.0, .72, .32), SWIM = new THREE.Color(.45, .85, 1.0);
const lmat = (o) => new LineMaterial({ transparent: true, depthWrite: false, toneMapped: false, resolution: new THREE.Vector2(W, H), ...o });
const lines = [];
function addKind(list, mats) {
  const g = new LineSegmentsGeometry(); g.setPositions(list.flatMap(([p, q]) => [p.x * 1.0003, p.y * 1.0003, p.z * 1.0003, q.x * 1.0003, q.y * 1.0003, q.z * 1.0003]));
  const ends = list.map(e => e[3]);
  for (const m of mats) { const o = new LineSegments2(g, m); if (m.dashed) o.computeLineDistances(); o.renderOrder = m.userData.order || 3; world.add(o); lines.push(o); }
  return { g, ends };
}
const walkL = addKind(KINDS.walk, [lmat({ color: GOLD.clone().multiplyScalar(.5), linewidth: 10, opacity: .22, blending: THREE.AdditiveBlending }), lmat({ color: GOLD.clone().multiplyScalar(1.15), linewidth: 2.6 })]);
const swimL = addKind(KINDS.swim, [lmat({ color: SWIM.clone().multiplyScalar(.5), linewidth: 12, opacity: .3, blending: THREE.AdditiveBlending }), lmat({ color: SWIM, linewidth: 3 })]);
const unkL = addKind(KINDS.unknown_route, [lmat({ color: GOLD, linewidth: 2.2, opacity: .75, dashed: true, dashSize: .004, gapSize: .004 })]);
const upto = (ends, s) => { let lo = 0, hi = ends.length; while (lo < hi) { const m = (lo + hi) >> 1; if (ends[m] <= s + 1e-9) lo = m + 1; else hi = m; } return lo; };
const setDrawn = s => { for (const L of [walkL, swimL, unkL]) L.g.instanceCount = upto(L.ends, s); };
// extra paths with their own progress: the 2019 Turkmen line (walked, later voided) and the 2013-14 protest walk (never counted)
function extraPath(si, colorA, dashed) {
  const P = [], Aa = []; let a = 0; dens(R.segs[si].c, .002, (p, q) => { if (!P.length) { P.push(p); Aa.push(0); } a += p.distanceTo(q); P.push(q); Aa.push(a); });
  const g = new LineGeometry(); g.setPositions(P.flatMap(p => [p.x * 1.0004, p.y * 1.0004, p.z * 1.0004]));
  const m = lmat({ color: colorA, linewidth: 2.8, dashed, dashSize: .006, gapSize: .005 }); const o = new Line2(g, m); o.computeLineDistances(); o.renderOrder = 4; world.add(o);
  return { P, Aa, len: a, g, m, o, n: P.length };
}
const voided = extraPath(209, GOLD.clone().multiplyScalar(1.15), false);
const protest = extraPath(210, new THREE.Color(.85, .85, .9), true);
const RED = new THREE.Color(1.0, .38, .32);
// the plan line of the intro (overland waypoints; water only at the Bering Strait and the Strait of Dover)
const PLAN = [[-70.9, -53.2], [-69.2, -51.6], [-71.3, -42.9], [-70.6, -33.4], [-69.6, -23.6], [-70.3, -18.5], [-71.5, -16.4], [-76.9, -12.0],
  [-79.0, -8.1], [-80.6, -4.9], [-78.5, -0.2], [-76.5, 3.4], [-75.6, 6.2], [-77.2, 7.9], [-79.5, 9.0], [-82.4, 8.4], [-84.1, 9.9], [-86.3, 12.1],
  [-89.2, 13.7], [-90.5, 14.6], [-93.1, 16.75], [-96.7, 17.1], [-99.1, 19.4], [-103.3, 20.7], [-105.4, 23.2], [-107.4, 24.8], [-110.95, 29.1],
  [-112.0, 33.4], [-115.1, 36.2], [-111.9, 40.8], [-112.0, 46.6], [-111.3, 47.5], [-114.1, 51.0], [-117.6, 54.5], [-122.7, 58.8], [-128.7, 60.1],
  [-135.1, 60.7], [-141.0, 62.6], [-147.7, 64.8], [-156.8, 64.7], [-165.4, 64.5], [-168.1, 65.6], [-169.8, 66.15], [-173.2, 66.0], [-178.9, 66.3],
  [176.1, 64.7], [170.3, 67.0], [166.4, 68.05], [158.0, 66.5], [150.9, 65.7], [148.2, 62.8], [140.0, 62.6], [129.7, 62.0], [124.7, 56.7],
  [118.3, 54.0], [113.5, 52.0], [107.6, 51.8], [104.3, 52.3], [99.2, 54.9], [92.9, 56.0], [82.9, 55.0], [73.4, 55.0], [65.5, 57.15], [60.6, 56.8],
  [56.2, 58.0], [49.1, 55.8], [44.0, 56.3], [37.6, 55.75], [32.0, 54.8], [27.6, 53.9], [23.7, 52.1], [21.0, 52.2], [16.9, 52.4], [13.4, 52.5],
  [10.0, 52.0], [6.9, 51.0], [4.4, 50.85], [3.1, 50.6], [1.86, 50.95], [1.31, 51.13], [-0.13, 51.5], [-0.9, 52.6], [-0.33, 53.74]];
const PLAN_P = []; for (let i = 0; i < PLAN.length - 1; i++) { const a = ll(...PLAN[i]), b = ll(...PLAN[i + 1]); const n = Math.max(2, Math.ceil(a.angleTo(b) / .004)); for (let k = 0; k < n; k++) PLAN_P.push(a.clone().lerp(b, k / n).normalize().multiplyScalar(1.004)); }
PLAN_P.push(ll(...PLAN[PLAN.length - 1], 1.004));
const planGeo = new LineGeometry(); planGeo.setPositions(PLAN_P.flatMap(p => [p.x, p.y, p.z]));
const planMat = lmat({ color: new THREE.Color(1.0, .72, .32), linewidth: 4.5, dashed: true, dashSize: .016, gapSize: .008 });
const plan = new Line2(planGeo, planMat); plan.computeLineDistances(); plan.renderOrder = 5;
const planGlowMat = lmat({ color: new THREE.Color(1.0, .62, .22), linewidth: 16, opacity: .28, blending: THREE.AdditiveBlending });
const planGlow = new Line2(planGeo, planGlowMat); planGlow.renderOrder = 4; world.add(planGlow, plan);
const planTip = k => PLAN_P[Math.min(PLAN_P.length - 1, Math.floor(k * (PLAN_P.length - 1)))];
const ESC = [[-77.58, 8.03], [-77.85, 8.2], [-78.14, 8.41], [-78.05, 8.47], [-77.98, 8.5]];
const spr = (c, s, o = 1) => { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.18, c); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, toneMapped: false, opacity: o }));
  m.scale.setScalar(s); return m; };
const pen = spr('rgba(255,210,140,.95)', .05, 1); world.add(pen); pen.visible = false;
const h1 = spr('rgba(255,190,90,.9)', .022, .85), h2 = spr('rgba(255,170,70,.35)', .07, .3); world.add(h1, h2);
const PLACES = { ...R.pts }; [[-77.58, 8.03], [-77.69, 8.16], [-77.98, 8.5], [-78.14, 8.41]].forEach((c, i) => PLACES[CB.rewalk.labels[i]] = c);

// ---------- story scenes ----------
const SCENES = {};
for (const [k, f] of Object.entries(S.SCENE_MAKERS)) SCENES[k] = f(W, H);

// ---------- cameras ----------
const T_PLAN = BI.plan.t0, T_RULES = BI.rules.t0, T_DEPART = BI.depart.t0;
const planK = t => eio(seg(t, T_PLAN + 2.0, T_RULES - 2.8));
function introPose(t) {
  const [tl, ta] = toLL(planTip(planK(t)));
  if (t < T_PLAN) { const k = eio(seg(t, 0, T_PLAN)); return { c: [lerp(-48, -62, k), lerp(-5, -18, k), 2.9], l: [-62, -18, 0] }; }
  if (t < T_RULES) { const k = eio(seg(t, T_PLAN, T_PLAN + 1.2)), alt = Math.exp(lerp(Math.log(2.9), Math.log(1.25), k) + (Math.log(2.9) - Math.log(1.25)) * eio(seg(t, T_PLAN + 2.2, T_PLAN + 3.8)));
    return { c: [lonLerp(-62, tl, k), lerp(-18, ta - 10 * Math.min(1, alt / 2.9), k), alt], l: [lonLerp(-62, tl, k), lerp(-18, ta, k), 0] }; }
  const [el, ea] = toLL(planTip(1)), k = eio(seg(t, T_RULES, T_DEPART));
  return { c: [lonLerp(el, -60, k), lerp(ea - 10, -30, k), 2.9], l: [lonLerp(el, -60, k), lerp(ea, -30, k), 0] };
}
const routeS = (b, t) => { if (b.r0 === undefined) return 0; const k = b.id === 'darien' ? eio(seg(t, b.t0 + .2, b.t1 - .6)) : eio(seg(t, b.t0 + .4, b.t1 - .4)); return lerp(arcAtSeg(b.r0), arcAtSeg(b.r1), k); };
const extraK = (b, t) => eio(seg(t, b.t0 + .6, b.t1 - 3.0));
function headAt(b, t) {
  if (b.extra === 'voided') return pointOn(voided.P, voided.Aa, extraK(b, t) * voided.len);
  if (b.extra === 'protest') return pointOn(protest.P, protest.Aa, extraK(b, t) * protest.len);
  return pointOn(RP, RA, routeS(b, t));
}
function poseOf(b, t) {
  const head = headAt(b, t), [hl, ha] = toLL(head), cm = b.cam;
  if (!cm) return { c: [hl, ha - 8, .5], l: [hl, ha, 0] };
  if (cm.mode === 'abs') { const k = eio(seg(t, b.t0, b.t1)); return { c: cm.c.map((v, i) => i === 0 ? lonLerp(v, cm.c2[0], k) : lerp(v, cm.c2[i], k)), l: cm.l.map((v, i) => i === 0 ? lonLerp(v, cm.l2[0], k) : lerp(v, cm.l2[i], k)) }; }
  return { c: [hl + cm.o[0], ha + cm.o[1], cm.o[2]], l: [hl + cm.l[0], ha + cm.l[1], cm.l[2]] };
}
const mixPose = (a, b, k) => ({ c: a.c.map((v, i) => i === 2 ? Math.exp(lerp(Math.log(v), Math.log(b.c[i]), k)) : i === 0 ? lonLerp(v, b.c[0], k) : lerp(v, b.c[i], k)), l: a.l.map((v, i) => i === 0 ? lonLerp(v, b.l[0], k) : lerp(v, b.l[i], k)) });
function worldPose(t) {
  const b = beatAt(t), i = BEATS.indexOf(b), prev = BEATS[i - 1];
  const head = b.shot === 'intro' ? RP[0] : headAt(b, t);
  let p = b.shot === 'intro' ? introPose(t) : poseOf(b, t);
  if (b.id === 'depart') p = mixPose(introPose(b.t0 - .001), p, eio(seg(t, b.t0, b.t0 + 3.0)));
  else if (b.id === 'darien') { const k = eio(seg(t, b.t0 + 1, b.t1)); p.c[2] = Math.exp(lerp(Math.log(p.c[2]), Math.log(.05), k)); p.c[1] = lerp(p.c[1], p.c[1] + 3.6, k); }
  if (prev && prev.shot === 'map' && b.shot === 'map' && b.id !== 'depart') {   // glide from the previous map shot
    const span = Math.min(3, (b.t1 - b.t0) * .4); p = mixPose(poseOf(prev, prev.t1 - .001), p, eio(seg(t, b.t0, b.t0 + span)));
  } else if (prev && prev.shot !== 'map' && prev.shot !== 'intro' && b.shot === 'map') {   // arriving from a scene: settle down from a little higher
    const k = eio(seg(t, b.t0, b.t0 + 1.8)); p.c[2] *= lerp(1.35, 1, k);
  }
  const c = ll(p.c[0], p.c[1], 1 + p.c[2]), l = ll(p.l[0], p.l[1], 1 + p.l[2]);
  const ku = clamp((p.c[2] - .45) / 1.2); camera.position.copy(c); camera.up.copy(c).normalize().lerp(new THREE.Vector3(0, 1, 0), ku).normalize(); camera.lookAt(l);
  return { head, look: p.l, alt: p.c[2] };
}

// ---------- overlay ----------
const ov = document.getElementById('ov'), x = ov.getContext('2d');
await Promise.all([document.fonts.load('900 100px Disp', C.intro.title + C.intro.subtitle + 'KARL 0123456789'), document.fonts.load('400 30px Disp', 'DAY CHAPTER'), document.fonts.load('400 30px Disp', C.hud.date)]);
const proj = v => { const p = v.clone().project(camera); return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H, p.z]; };
const visible = v => v.clone().normalize().dot(camera.position.clone().sub(v).normalize()) > .05;
function txt(s, X, Y, font, fill, ls = 0, align = 'left', a = 1) { x.shadowColor = 'rgba(0,0,0,.55)'; x.shadowBlur = 10; x.globalAlpha = a; x.font = font; x.fillStyle = fill; x.textAlign = align; x.letterSpacing = ls + 'px'; x.fillText(s, X, Y); x.letterSpacing = '0px'; x.globalAlpha = 1; x.shadowBlur = 0; }
const fadeIO = (t, a, b, f = .35) => Math.min(seg(t, a, a + f), 1 - seg(t, b - f, b));
const shown = [];
function shade(spots) { for (const [cx, cy, r, a] of spots) { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, `rgba(4,8,14,${a})`); g.addColorStop(.55, `rgba(4,8,14,${a * .55})`); g.addColorStop(1, 'rgba(4,8,14,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H); } }
function chapter(ch, t, a, b) {
  const k = fadeIO(t, a, b, .5), dy = (1 - eo(seg(t, a, a + .8))) * 18; if (k <= 0) return;
  txt(ch.kicker, 120, 150 + dy, '500 20px Disp', '#E8B65C', 4, 'left', k);
  x.globalAlpha = k; x.fillStyle = 'rgba(232,182,92,.9)'; x.fillRect(120, 168 + dy, 40 * eo(seg(t, a, a + .8)), 2); x.globalAlpha = 1;
  txt(ch.title, 112, 300 + dy, '900 132px Disp', '#F4EEE2', 4, 'left', k);
  txt(ch.en, 122, 352 + dy, '400 22px Disp', 'rgba(220,214,200,.7)', 9, 'left', k);
  ch.desc.forEach((d, i) => txt(d, 122, 420 + i * 44 + dy, '400 30px Disp', 'rgba(236,230,218,.88)', 2, 'left', k * fadeIO(t, a + .3 + i * .25, b, .5)));
  shown.push(ch.title, ...ch.desc);
}
function hud(t, b) {   // day count, date, age, and the plan-vs-actual bar: twelve planned years, then the overrun in red
  const d = calAt(t), day = Math.floor(d - D_START) + 1, rx = W - 120, k = fadeIO(t, b.t0 + .2, b.t1 + 1, .5); if (k <= 0) return;
  txt(C.hud.day, rx - 260, 128, '500 18px Disp', 'rgba(220,214,200,.6)', 6, 'left', k);
  txt(String(day).padStart(5, '0'), rx, 150, '300 64px Disp', '#F4EEE2', 4, 'right', k);
  x.globalAlpha = k; x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(rx - 300, 178, 300, 1); x.globalAlpha = 1;
  const rows = [[C.hud.date, fmtDate(d)], [C.hud.age, ageAt(d) + C.hud.age_unit]];
  rows.forEach(([kk, v], i) => { txt(kk, rx - 300, 220 + i * 40, '400 19px Disp', 'rgba(220,214,200,.55)', 2, 'left', k); txt(v, rx, 220 + i * 40, '500 22px Disp', 'rgba(244,238,226,.92)', 1, 'right', k); });
  const yrs = (d - D_START) / 365.25, by = 320, span = 28.2, px = y => 300 * Math.min(1, y / span);
  txt(C.hud.plan, rx - 300, by, '400 17px Disp', 'rgba(220,214,200,.55)', 2, 'left', k);
  const over = yrs > 12;
  txt(over ? C.hud.over.replace('{y}', (yrs - 12).toFixed(1)) : C.hud.done.replace('{y}', yrs.toFixed(1)), rx, by, '400 17px Disp', over ? 'rgba(255,120,104,.95)' : 'rgba(232,182,92,.9)', 1, 'right', k);
  x.globalAlpha = k; x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(rx - 300, by + 14, 300, 3);
  x.fillStyle = '#E8B65C'; x.fillRect(rx - 300, by + 14, px(Math.min(yrs, 12)), 3);
  if (over) { x.fillStyle = '#FF6A5E'; x.fillRect(rx - 300 + px(12), by + 14, px(yrs) - px(12), 3); }
  x.fillStyle = 'rgba(255,255,255,.7)'; x.fillRect(rx - 300 + px(12) - 1, by + 9, 2, 13); x.globalAlpha = 1;
}
function caption(parts, t, a, b) {
  const k = fadeIO(t, a, b, .3); if (k <= 0) return;
  const g = x.createLinearGradient(0, H - 260, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${.72 * k})`); x.fillStyle = g; x.fillRect(0, H - 260, W, 260);
  x.font = '600 44px Disp'; x.letterSpacing = '2px';
  const wsum = parts.reduce((s, [p]) => s + x.measureText(p).width, 0); let cx = W / 2 - wsum / 2; x.textAlign = 'left';
  x.globalAlpha = k; x.shadowColor = 'rgba(0,0,0,.8)'; x.shadowBlur = 18;
  for (const [p, hi] of parts) { x.fillStyle = hi ? '#F2C063' : '#F4EEE2'; x.fillText(p, cx, H - 92 + (1 - k) * 8); cx += x.measureText(p).width; }
  x.shadowBlur = 0; x.letterSpacing = '0px'; x.globalAlpha = 1;
  shown.push(parts.map(p => p[0]).join(''));
}
function captions(list, t, a, b) {   // several captions share the beat, each in its own window, weighted by length
  if (!list || !list.length) return;
  const len = list.map(p => p.reduce((s, [q]) => s + q.length, 0) + 4), tot = len.reduce((s, v) => s + v, 0);
  let c0 = a; list.forEach((p, i) => { const c1 = c0 + (b - a) * len[i] / tot; caption(p, t, c0, c1); c0 = c1; });
}
function label(name, v, t, a, color = 'rgba(235,228,214,.8)', side = 1) {
  if (!visible(v)) return; const [px, py] = proj(v), k = seg(t, a, a + .5); if (k <= 0) return;
  x.globalAlpha = k; x.strokeStyle = color; x.lineWidth = 1; x.beginPath(); x.moveTo(px + 6 * side, py); x.lineTo(px + 34 * side, py); x.stroke();
  txt(name, px + 40 * side, py + 6, '400 19px Disp', color, 1, side > 0 ? 'left' : 'right', k); x.globalAlpha = 1;
}
function pin(kicker, place, lonlat, t, a, b, side, size = 44, slot = null) {   // a pulsing marker; the label sits beside it, or in a fixed slot on the left
  const v = ll(...lonlat, 1.004); if (!visible(v)) return; const k = fadeIO(t, a, b, .4); if (k <= 0) return;
  const [px, py] = proj(v), r = 14 + 10 * (.5 + .5 * Math.sin(t * 5));
  x.globalAlpha = k; x.strokeStyle = '#F2C063'; x.lineWidth = 2.5;
  x.beginPath(); x.arc(px, py, r, 0, Math.PI * 2); x.stroke(); x.fillStyle = '#FFE2A8'; x.beginPath(); x.arc(px, py, 6, 0, Math.PI * 2); x.fill();
  let lx, ly, al, tx0;
  if (slot !== null) { lx = 120; ly = 600 + slot * 120; al = 'left'; tx0 = lx;
    x.lineWidth = 1.2; x.beginPath(); x.moveTo(px - 16, py); x.lineTo(lx + 470, ly - 8); x.stroke(); }
  else { lx = px + side * 150; ly = py - 70; x.lineWidth = 1.5; x.beginPath(); x.moveTo(px + side * 18, py - 8); x.lineTo(lx, ly); x.lineTo(lx + side * 30, ly); x.stroke(); al = side > 0 ? 'left' : 'right'; tx0 = lx + side * 40; }
  x.globalAlpha = 1;
  if (slot !== null) shade([[lx + 200, ly, 420, .5 * k]]);
  txt(kicker, tx0, ly - 26, '700 26px Disp', '#F2C063', 4, al, k);
  txt(place, tx0, ly + 20, `700 ${size}px Disp`, '#F4EEE2', 2, al, k);
  shown.push(place);
}
function card(c, t, a, b) {   // a statement in the middle of the frame: red for what stopped him
  const k = fadeIO(t, a, b, .4); if (k <= 0) return; const col = c.red ? '#FF6A5E' : '#F2C063';
  shade([[W / 2, H / 2 - 40, 620, .55 * k]]);
  x.font = '700 58px Disp'; x.letterSpacing = '6px'; const w = x.measureText(c.text).width; x.letterSpacing = '0px';
  x.globalAlpha = k; x.strokeStyle = col; x.lineWidth = 2; x.strokeRect(W / 2 - w / 2 - 44, H / 2 - 112, w + 88, 108); x.globalAlpha = 1;
  txt(c.text, W / 2, H / 2 - 38, '700 58px Disp', col, 6, 'center', k);
  shown.push(c.text);
}
function sceneTags(t, b, cb) {
  shade([[120, 160, 520, .45]]);
  const k = fadeIO(t, b.t0 + .3, b.t1 - .1, .5);
  txt(cb.tag, 120, 150, '500 20px Disp', '#E8B65C', 4, 'left', k);
  x.globalAlpha = k; x.fillStyle = 'rgba(232,182,92,.9)'; x.fillRect(120, 168, 40, 2); x.globalAlpha = 1;
  txt(fmtDate(calAt(t)), 120, 216, '400 30px Disp', 'rgba(240,234,222,.9)', 3, 'left', k);
  if (cb.note) txt(cb.note, 120, 258, '400 20px Disp', 'rgba(220,214,200,.75)', 2, 'left', k);
  if (b.id === 'jail') { const n = Math.min(18, 1 + Math.floor(seg(t, b.t0 + .4, b.t1 - .4) * 18));
    txt(C.hud.jail.replace('{n}', n), W - 120, 150, '500 30px Disp', '#FF6A5E', 3, 'right', k); }
}
// when the head passes a pin, the pin shows for a while around that moment
const pinTimes = {};
for (const b of BEATS) { const cb = CB[b.id]; if (!cb || !cb.pins || b.shot !== 'map') continue;
  pinTimes[b.id] = cb.pins.map(p => { const v = ll(...p.ll); let best = b.t0 + 1, bd = 9;
    for (let t = b.t0; t < b.t1; t += .05) { const d = headAt(b, t).distanceTo(v); if (d < bd) { bd = d; best = t; } }
    const a = clamp(best - 1.6, b.t0 + .4, b.t1 - 4.8); return [a, Math.min(b.t1 - .1, a + 4.6)]; }); }

function overlay(t, w) {
  x.clearRect(0, 0, W, H); shown.length = 0;
  const b = beatAt(t), cb = CB[b.id] || {};
  if (b.id === 'credits') { const k = fadeIO(t, b.t0 + .2, DUR, .4);
    C.credits.forEach((l, i) => txt(l, W / 2, H / 2 - 40 + i * 44, '400 22px Disp', 'rgba(220,214,200,.75)', 1, 'center', k)); return; }
  if (b.shot === 'intro') {
    const I = C.intro;
    if (b.id === 'who') { const k = fadeIO(t, .4, b.t1 - .1, .6), dy = (1 - eo(seg(t, .4, 1.4))) * 16;
      shade([[W / 2, H / 2, 700, .55 * k]]);
      { const [p1, p2] = I.title.split('，'); x.font = '900 104px Disp'; x.letterSpacing = '3px';
        const w1 = x.measureText(p1).width, wc = 46, w2 = p2 ? x.measureText(p2).width : 0, x0 = W / 2 - (w1 + (p2 ? wc + w2 : 0)) / 2;
        txt(p1, x0, H / 2 - 30 + dy, '900 104px Disp', '#F4EEE2', 3, 'left', k);
        if (p2) { txt('，', x0 + w1 - 18, H / 2 - 30 + dy, '900 104px Disp', '#F4EEE2', 0, 'left', k); txt(p2, x0 + w1 + wc, H / 2 - 30 + dy, '900 104px Disp', '#F4EEE2', 3, 'left', k); } }
      const k2 = k * seg(t, 1.0, 1.8);
      x.globalAlpha = k2; x.fillStyle = 'rgba(232,182,92,.9)'; x.fillRect(W / 2 - 30, H / 2 + 22 + dy, 60, 2); x.globalAlpha = 1;
      txt(I.subtitle + '  ·  ' + I.subtitle_en, W / 2, H / 2 + 76 + dy, '500 32px Disp', 'rgba(232,182,92,.95)', 8, 'center', k2);
      if (k > 0) shown.push(I.title); if (k2 > 0) shown.push(I.subtitle);
      caption(I.who, t, 1.0, b.t1 - .15); }
    if (b.id === 'plan') {
      pin(I.start, I.start_place, PLAN[0], t, b.t0 + .4, b.t0 + 4.8, -1);
      pin(I.end, I.end_place, PLAN[PLAN.length - 1], t, T_RULES - 2.9, b.t1 - .1, 1);
      caption(I.line, t, b.t0 + .3, b.t1 - .15); }
    if (b.id === 'rules') { const k = fadeIO(t, b.t0 + .3, b.t1 - .1, .5);
      shade([[W / 2, H / 2, 760, .6 * k]]);
      txt(I.rules_kicker, W / 2, H / 2 - 150, '500 26px Disp', '#E8B65C', 8, 'center', k);
      x.globalAlpha = k; x.fillStyle = 'rgba(232,182,92,.9)'; x.fillRect(W / 2 - 24, H / 2 - 128, 48, 2); x.globalAlpha = 1;
      I.rules.forEach((r, i) => { const kk = k * fadeIO(t, b.t0 + .6 + i * .5, b.t1 - .1, .5); txt(r, W / 2, H / 2 - 30 + i * 96 + (1 - kk) * 10, '700 62px Disp', '#F4EEE2', 6, 'center', kk); if (kk > 0) shown.push(r); });
      txt(I.rules_src, W / 2, H / 2 + 200, '400 20px Disp', 'rgba(220,214,200,.55)', 4, 'center', k); }
    return;
  }
  if (b.shot !== 'map') { sceneTags(t, b, cb); captions(cb.captions, t, b.t0 + .35, b.t1 - .15); return; }
  // map shots
  if (b.id === 'summary' || b.id === 'question') {
    if (b.id === 'summary') { const n = cb.stats.length; shade([[W / 2, H / 2, 900, .6]]);
      cb.stats.forEach(([v, l], i) => { const a = b.t0 + .6 + i * .7, k = fadeIO(t, a, b.t1 - .1, .5), cx = W / 2 + (i - (n - 1) / 2) * 420;
        txt(v, cx, H / 2 - 10 + (1 - k) * 12, '900 64px Disp', i === 3 ? '#8FD8FF' : '#F4EEE2', 2, 'center', k);
        txt(l, cx, H / 2 + 46, '400 22px Disp', 'rgba(220,214,200,.8)', 2, 'center', k); if (k > 0) shown.push(v, l); }); }
    else { shade([[W / 2, H / 2, 900, .65]]);
      cb.lines.forEach((l, i) => { const k = fadeIO(t, b.t0 + .4 + i * 1.6, b.t1 - .1, .5);
        txt(l, W / 2, H / 2 - 30 + i * 100 + (1 - k) * 10, i ? '900 76px Disp' : '500 44px Disp', i ? '#F2C063' : '#F4EEE2', 4, 'center', k); if (k > 0) shown.push(l); }); }
    return;
  }
  shade([[150, 220, 760, .62], [W - 150, 200, 620, .62]]);
  hud(t, b);
  // labels, the head marker, pins
  if (b.id === 'andes' || b.id === 'darien') for (const n of ['利马', '基多', '卡利', '麦德林']) if (PLACES[n]) label(n, ll(...PLACES[n], 1.0002), t, b.t0 + .4);
  if (b.id === 'rewalk') for (const n of cb.labels) if (PLACES[n]) label(n, ll(...PLACES[n], 1.0002), t, b.t0 + .4);
  { const [hx, hy] = proj(w.head.clone().multiplyScalar(1.0003));
    if (visible(w.head) && !['summary', 'question'].includes(b.id)) { x.strokeStyle = 'rgba(255,200,120,.8)'; x.lineWidth = 1; x.beginPath(); x.arc(hx, hy, 16 + 4 * Math.sin(t * 4), 0, Math.PI * 2); x.stroke(); } }
  if (cb.pins) cb.pins.forEach((p, i) => pin(p.kicker, p.text, p.ll, t, ...pinTimes[b.id][i], p.side, 34, i));
  if (b.id === 'rewalk') {
    { const k = seg(t, b.t0 + .2, b.t0 + .9); x.globalAlpha = k; x.strokeStyle = '#FF6A5E'; x.lineWidth = 2; x.setLineDash([8, 7]); x.beginPath();
      ESC.forEach((c, i) => { const [px, py] = proj(ll(...c, 1)); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke(); x.setLineDash([]); x.globalAlpha = 1; }
    label(cb.escort, ll(-77.86, 8.21, 1.0), t, b.t0 + .3, 'rgba(255,106,94,.95)', -1);
    chapter(cb.rule, t, b.t0 + 1.4, b.t1 + 1);
  }
  if (b.id === 'protestMap' && cb.line) { const v = pointOn(protest.P, protest.Aa, protest.len * .55); label(cb.line, v, t, b.t0 + 1.5, 'rgba(225,225,235,.95)', 1); }
  if (cb.chapter) chapter(cb.chapter, t, b.t0 + .5, b.t1 - .1);
  if (cb.card) card(cb.card, t, b.t0 + (cb.chapter ? 1.6 : .6), b.t1 - .2);
  const capStart = cb.chapter ? b.t0 + .9 : b.t0 + .35;
  if (b.id !== 'rewalk') captions(cb.captions, t, capStart, b.t1 - .15); else captions(cb.captions, t, b.t0 + .35, b.t1 - .15);
}

// ---------- render ----------
async function renderAt(t) {
  const b = beatAt(t);
  let w = { head: RP[0], look: [0, 0, 0], alt: 1 };
  renderer.toneMappingExposure = 1;
  if (SCENES[b.shot]) {
    const Sc = SCENES[b.shot]; Sc.update(eio(seg(t, b.t0, b.t1)) * .6 + seg(t, b.t0, b.t1) * .4, t, seg(t, b.t0, b.t1));
    post.dof.scene = Sc.scene; post.dof.camera = Sc.camera; renderer.toneMappingExposure = Sc.exposure;
  } else if (b.shot === 'black') {
    post.dof.scene = new THREE.Scene(); post.dof.camera = camera;
  } else {
    post.dof.scene = world; post.dof.camera = camera;
    setDrawn(b.shot === 'intro' ? 0 : b.id === 'summary' || b.id === 'question' ? TOTAL : routeS(b, t));
    w = worldPose(t);
    await choosePatches(w.look[0], w.look[1], w.alt);
    const intro = b.shot === 'intro';
    const hv = w.head.clone().multiplyScalar(1.0003); h1.position.copy(hv); h2.position.copy(hv); const dc = camera.position.distanceTo(hv); h1.scale.setScalar(dc * .03); h2.scale.setScalar(dc * .075);
    h1.visible = h2.visible = !intro && !['summary', 'question'].includes(b.id);
    plan.visible = planGlow.visible = (intro && t >= T_PLAN) || b.id === 'depart'; planGeo.instanceCount = Math.floor((b.id === 'plan' ? planK(t) : t < T_PLAN ? 0 : 1) * (PLAN_P.length - 1));
    planMat.opacity = b.id === 'depart' ? 1 - seg(t, b.t0, b.t0 + 1.5) : 1; planGlowMat.opacity = .28 * planMat.opacity;
    { const drawing = b.id === 'plan' && planK(t) > 0 && planK(t) < 1; const tp = planTip(planK(t)); pen.position.copy(tp); pen.visible = drawing; pen.scale.setScalar(camera.position.distanceTo(tp) * .045); }
    for (const o of lines) o.visible = !intro;
    // the Turkmen line: drawn while he walks it, gold until the land routes close, then red and dashed for good
    const vi = BEATS.indexOf(BI.iran), si = BEATS.indexOf(BI.sealed), bi = BEATS.indexOf(b);
    voided.o.visible = bi >= vi; voided.g.instanceCount = bi === vi ? Math.floor(extraK(b, t) * (voided.n - 1)) : voided.n - 1;
    { const red = bi > si || (bi === si && t > b.t0 + 2.2); voided.m.color.copy(red ? RED : GOLD.clone().multiplyScalar(1.15)); voided.m.dashed = red; voided.m.needsUpdate = true; }
    protest.o.visible = b.id === 'protestMap'; protest.g.instanceCount = Math.floor(extraK(b, t) * (protest.n - 1));
    for (const [o, top] of DETAIL_LINES) o.material.opacity = o.userData.op * clamp((top - w.alt) / (top * .6));
  }
  let dip = Math.min(seg(t, 0, .5), 1 - seg(t, DUR - .5, DUR));
  const kind = s => s === 'map' || s === 'intro' ? 'map' : s;
  for (let i = 1; i < BEATS.length; i++) if (kind(BEATS[i].shot) !== kind(BEATS[i - 1].shot)) { const tb = BEATS[i].t0; dip = Math.min(dip, 1 - seg(t, tb - .22, tb) + seg(t, tb, tb + .3)); }
  post.vig.uniforms.fade.value = clamp(dip);
  post.composer.render();
  overlay(t, w);
  if (dip < 1) { x.fillStyle = `rgba(0,0,0,${1 - clamp(dip)})`; x.fillRect(0, 0, W, H); }
}
// render a slice of the film (?part=a,b in seconds) so a long render can be split and resumed
const PART = (DBG.get('part') || '').split(',').filter(Boolean).map(Number);
const T0 = PART.length === 2 ? PART[0] : 0;
window.DUR = PART.length === 2 ? PART[1] - PART[0] : DUR;
window.BEATS = BEATS.map(b => ({ id: b.id, shot: b.shot, t0: b.t0, t1: b.t1 }));
window.render = async t => renderAt(t + T0);
window.TEXTS = async t => { await renderAt(t); return shown.map(s => ({ id: s.replace(/[0-9]+/g, '#'), text: s, x0: 100, y0: 100, x1: 400, y1: 160 })); };
await renderAt(0);
window.READY = true;

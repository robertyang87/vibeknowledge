// Bushby sample v3: map shots and story scenes as separate full-frame shots.
// Map shots: a dark 3D globe, vector coastlines, the walked route as a glowing gold line, a camera that follows its head.
// Story scene (the cell): a dark room, one window, a light shaft, bars, tally marks counting the days.
// Page contract: READY, DUR, render(t), TEXTS(t). On-screen copy comes from copy.json (episodes/bushby/copy/sample-v3.json).
import * as THREE from 'three';
import { makePost } from '/core/three/post.js';
import { makePatagonia, makeJungle } from './scenes.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';

const W = 1920, H = 1080;
const C = await (await fetch('copy.json')).json();
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eio = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const eo = k => 1 - Math.pow(1 - k, 3);
const lerp = (a, b, k) => a + (b - a) * k;

// ---------- timeline (same beat times as sample v2, so the score lines up) ----------
const DAY = 86400000;
const dayOf = (y, m, d) => Date.UTC(y, m - 1, d) / DAY;
const D_START = dayOf(1998, 11, 1), BORN = Date.UTC(1969, 2, 30);
const BEATS = [   // shot: 'map' (the globe) or a story scene; r0/r1: route segments drawn across a map shot
  { id: 'who', shot: 'map', t0: 0, t1: 7.2, d0: D_START, d1: D_START, r0: 0, r1: 0 },
  { id: 'plan', shot: 'map', t0: 7.2, t1: 14.6, d0: D_START, d1: D_START, r0: 0, r1: 0 },
  { id: 'rules', shot: 'map', t0: 14.6, t1: 20.6, d0: D_START, d1: D_START, r0: 0, r1: 0 },
  { id: 'depart', shot: 'map', t0: 20.6, t1: 24.8, d0: D_START, d1: D_START + 3, r0: 0, r1: 1 },
  { id: 'departS', shot: 'patagonia', t0: 24.8, t1: 29.6, d0: D_START + 3, d1: dayOf(1998, 12, 20) },
  { id: 'andes', shot: 'map', t0: 29.6, t1: 33.8, d0: dayOf(1999, 1, 1), d1: dayOf(2000, 11, 1), r0: 1, r1: 25 },
  { id: 'darien', shot: 'map', t0: 33.8, t1: 38.4, d0: dayOf(2001, 1, 15), d1: dayOf(2001, 2, 4), r0: 25, r1: 30 },
  { id: 'darienS', shot: 'jungle', t0: 38.4, t1: 44.0, d0: dayOf(2001, 2, 5), d1: dayOf(2001, 2, 15) },
  { id: 'jail', shot: 'cell', t0: 44.0, t1: 49.0, d0: dayOf(2001, 2, 16), d1: dayOf(2001, 3, 6) },
  { id: 'rewalk', shot: 'map', t0: 49.0, t1: 54.5, d0: dayOf(2001, 3, 6), d1: dayOf(2001, 3, 10), r0: 32, r1: 34 },
];
const DUR = 54.5, RULE_T = 50.4;
const INTRO = new Set(['who', 'plan', 'rules']);
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

// ---------- globe ----------
const tex = await new THREE.TextureLoader().loadAsync('assets/earth.png');
tex.anisotropy = 16; tex.colorSpace = THREE.NoColorSpace;
// high-resolution relief patches along the route (make_detail.py): R land, G shaded relief, B elevation
const DET = await (await fetch('assets/detail.json')).json();
const detTex = await Promise.all(DET.map(d => new THREE.TextureLoader().loadAsync(`assets/${d.name}.png`)));
detTex.forEach(t => { t.anisotropy = 16; t.colorSpace = THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; });
// the fragment shader is generated with one block per patch (sampler arrays can't be indexed in a loop in GLSL ES 3.0)
const patchCode = DET.map((d, i) => `
      { vec4 bx = box${i}; vec2 u = (deg - bx.xy) / (bx.zw - bx.xy); vec2 f = min(u, 1. - u) * (bx.zw - bx.xy);
        float w = smoothstep(0., ${(Math.min(d.box[2] - d.box[0], d.box[3] - d.box[1]) * .06).toFixed(3)}, min(f.x, f.y));
        if (w > 0.) { vec2 du = dFdx(u), dv = dFdy(u); vec3 d = textureGrad(det${i}, u, du, dv).rgb;
          r = mix(r, d.r, w); rel = mix(rel, (d.g - .5) * 1.7, w); elev = mix(elev, d.b, w); } }`).join('');
const uni = { map: { value: tex }, sun: { value: ll(-40, 25).normalize() }, relAmt: { value: 1 }, coastAmt: { value: 1 } };
DET.forEach((d, i) => { uni['det' + i] = { value: detTex[i] }; uni['box' + i] = { value: new THREE.Vector4(...d.box) }; });
const globeMat = new THREE.ShaderMaterial({ glslVersion: THREE.GLSL3, uniforms: uni,
  vertexShader: `out vec3 vN; out vec3 vP;
    void main(){ vN = normalize(mat3(modelMatrix) * normal); vec4 wp = modelMatrix * vec4(position,1.); vP = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`,
  fragmentShader: `out vec4 fragColor; uniform sampler2D map, ${DET.map((d, i) => 'det' + i).join(', ')}; uniform vec4 ${DET.map((d, i) => 'box' + i).join(', ')};
    uniform vec3 sun; uniform float relAmt, coastAmt; in vec3 vN; in vec3 vP;
    void main(){
      vec3 n = normalize(vP);
      float lat = asin(clamp(n.y,-1.,1.)); float lon = atan(n.x, n.z);
      vec2 uvA = vec2(lon/6.2831853+.5, lat/3.1415927+.5);
      vec2 uvB = vec2(fract(lon/6.2831853+1.), uvA.y);
      vec2 uv = fwidth(uvA.x) < fwidth(uvB.x) + 1e-6 ? uvA : uvB;
      vec2 dx = dFdx(uv), dy = dFdy(uv); if (abs(dx.x) > .5 || abs(dy.x) > .5) { dx = dFdx(uvA); dy = dFdy(uvA); }
      vec3 t = textureGrad(map, uv, dx, dy).rgb;
      float r = t.r, rel = t.g - .5, elev = 0.;
      vec2 deg = vec2(degrees(lon), degrees(lat));
      ${patchCode}
      float land = smoothstep(.35,.65,r);
      float coast = 1. - clamp(abs(r - .5) / max(fwidth(r) * 1.1, 1e-5), 0., 1.);   // a one-pixel line where the land mask crosses .5
      vec3 V = normalize(cameraPosition - vP);
      float fres = pow(1. - max(dot(V, vN), 0.), 3.);
      float day = .55 + .45 * max(dot(vN, sun), 0.);
      vec3 ocean = mix(vec3(.004,.007,.014), vec3(.015,.03,.06), fres);
      vec2 g = vec2(uv.x*36., uv.y*18.); vec2 gd = abs(fract(g)-.5); vec2 gw = fwidth(g)*.9;
      float gl = max(1.-smoothstep(0.,gw.x,.5-gd.x), 1.-smoothstep(0.,gw.y,.5-gd.y));
      ocean += vec3(.06,.10,.16) * gl * .22;
      vec3 ground = (vec3(.058,.070,.090) + elev * vec3(.05,.055,.065) + clamp(rel,-.3,.3) * vec3(.22,.23,.25) * relAmt) * day;
      vec3 col = mix(ocean, ground, land);
      col += vec3(.30,.56,.88) * coast * .55 * coastAmt;
      col += vec3(.10,.25,.45) * fres * .35;
      if (any(isnan(col)) || any(isinf(col))) col = vec3(0.);   // a stray NaN would bloom into a white square
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
const DETAIL_LINES = [];   // [lines, altitude above which they fade out]
{ const L = await (await fetch('assets/lines.json')).json();
  const mk = (arcs, r, color, op) => { const p = [];
    for (const a of arcs) for (let i = 0; i < a.length - 1; i++) { if (Math.abs(a[i][0] - a[i + 1][0]) > 180) continue; const u = ll(...a[i], r), v = ll(...a[i + 1], r); p.push(u.x, u.y, u.z, v.x, v.y, v.z); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    const o = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: op, depthWrite: false })); o.userData.op = op; world.add(o); return o; };
  const outside = a => a.every(([lo, la]) => lo < -130 || lo > -20 || la < -60 || la > 35);
  mk(L.border.filter(outside), 1.00005, 0x8a9bb8, .22);   // the coastline itself is drawn by the globe shader from the land mask
  const L10 = await (await fetch('assets/lines10.json')).json();
  mk(L10.lake, 1.00005, 0x5f8fc4, .5); DETAIL_LINES.push([mk(L10.river, 1.00004, 0x4f7fb4, .42), 1.2], [mk(L10.road, 1.00004, 0xb7a684, .28), .6]); mk(L10.border, 1.00004, 0x9aa8c2, .22); }

// ---------- route: one polyline with arc length; segment ends indexed ----------
const R = await (await fetch('assets/route.json')).json();
const RP = [], segEnd = [];
for (const s of R.segs.slice(0, 35)) {
  for (let i = 0; i < s.c.length - 1; i++) { const a = ll(...s.c[i]), b = ll(...s.c[i + 1]); const n = Math.max(2, Math.ceil(a.angleTo(b) / .0015));
    for (let k = (RP.length ? 1 : 0); k <= n; k++) RP.push(a.clone().lerp(b, k / n).normalize()); }
  segEnd.push(RP.length - 1);
}
const ARC = [0]; for (let i = 1; i < RP.length; i++) ARC.push(ARC[i - 1] + RP[i].distanceTo(RP[i - 1]));
const arcAtSeg = i => i <= 0 ? 0 : ARC[segEnd[i - 1]];   // arc length at the end of the first i segments
const pointAt = s => { let i = ARC.findIndex(a => a >= s); if (i <= 0) return RP[0].clone(); const k = (s - ARC[i - 1]) / (ARC[i] - ARC[i - 1] || 1); return RP[i - 1].clone().lerp(RP[i], k).normalize(); };
const GOLD = new THREE.Color(1.0, .72, .32);
const routeGeo = new LineGeometry(); routeGeo.setPositions(RP.flatMap(p => { const q = p.clone().multiplyScalar(1.0003); return [q.x, q.y, q.z]; }));
const lineMat = (w, c, o, add) => new LineMaterial({ color: c, linewidth: w, transparent: true, opacity: o, depthWrite: false, toneMapped: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending, resolution: new THREE.Vector2(W, H) });
const core = new Line2(routeGeo, lineMat(2.6, GOLD.clone().multiplyScalar(1.15), 1, false));
const halo = new Line2(routeGeo, lineMat(10, GOLD.clone().multiplyScalar(.5), .22, true));
core.renderOrder = 3; halo.renderOrder = 2; world.add(halo, core);
const setDrawn = s => { let n = ARC.findIndex(a => a >= s); if (n < 0) n = RP.length - 1; routeGeo.instanceCount = Math.max(0, n); };
// the plan he and his father drew: a schematic line, dashed, never the walked route
const PLAN = [[-70.9, -53.2], [-71.5, -33], [-77, -12], [-79.5, 9], [-99, 19.4], [-118, 34], [-123, 49], [-150, 61], [-165.4, 64.5], [-169.7, 65.9], [-180, 66.5], [170, 67], [150, 65], [130, 62.0], [100, 58], [60, 56.5], [37.6, 55.8], [13.4, 52.5], [-0.33, 53.74]];
const PLAN_P = []; for (let i = 0; i < PLAN.length - 1; i++) { const a = ll(...PLAN[i]), b = ll(...PLAN[i + 1]); const n = Math.max(2, Math.ceil(a.angleTo(b) / .004)); for (let k = 0; k < n; k++) PLAN_P.push(a.clone().lerp(b, k / n).normalize().multiplyScalar(1.004)); }
PLAN_P.push(ll(...PLAN[PLAN.length - 1], 1.004));
const planGeo = new LineGeometry(); planGeo.setPositions(PLAN_P.flatMap(p => [p.x, p.y, p.z]));
const planMat = new LineMaterial({ color: 0xF2DDB0, linewidth: 2, dashed: true, dashSize: .012, gapSize: .009, transparent: true, opacity: .85, depthWrite: false, toneMapped: false, resolution: new THREE.Vector2(W, H) });
const plan = new Line2(planGeo, planMat); plan.computeLineDistances(); world.add(plan);
const planTip = k => PLAN_P[Math.min(PLAN_P.length - 1, Math.floor(k * (PLAN_P.length - 1)))];
// the escorted stretch (boat and helicopter, Boca de Cupe -> La Palma -> Meteti): dashed red, never part of the walk
const ESC = [[-77.58, 8.03], [-77.85, 8.2], [-78.14, 8.41], [-78.05, 8.47], [-77.98, 8.5]];
const escort = (() => { const p = []; for (let i = 0; i < ESC.length - 1; i++) { const a = ll(...ESC[i], 1.0028), b = ll(...ESC[i + 1], 1.0028); const n = 40; for (let k = 0; k < n; k++) p.push(a.clone().lerp(b, k / n)); } p.push(ll(...ESC[ESC.length - 1], 1.0028));
  const g = new THREE.BufferGeometry().setFromPoints(p); const l = new THREE.Line(g, new THREE.LineDashedMaterial({ color: 0xff5a4e, dashSize: .0007, gapSize: .0005, transparent: true, opacity: .95, toneMapped: false })); l.computeLineDistances(); return l; })();
escort.visible = false;
const spr = (c, s, o = 1) => { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.18, c); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, toneMapped: false, opacity: o }));
  m.scale.setScalar(s); return m; };
const h1 = spr('rgba(255,190,90,.9)', .022, .85), h2 = spr('rgba(255,170,70,.35)', .07, .3); world.add(h1, h2);
// labels.rewalk in the copy lists Boca de Cupe, Yaviza, Meteti, La Palma in this order
const PLACES = { ...R.pts }; [[-77.58, 8.03], [-77.69, 8.16], [-77.98, 8.5], [-78.14, 8.41]].forEach((c, i) => PLACES[C.labels.rewalk[i]] = c);

// ---------- the cell ----------
const cell = new THREE.Scene(); cell.background = new THREE.Color(0x030405); cell.fog = new THREE.Fog(0x030405, 7, 16);
const cellCam = new THREE.PerspectiveCamera(32, W / H, .05, 40);
{ const wall = new THREE.MeshStandardMaterial({ color: 0x3a3e46, roughness: .95 });
  const floor = new THREE.MeshStandardMaterial({ color: 0x1d1f23, roughness: .9 });
  const room = new THREE.Group();
  const box = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; room.add(o); return o; };
  box(6, .1, 7, floor, 0, -.05, 0);              // floor
  box(6, 3.4, .2, wall, 0, 1.7, -3);             // back wall
  box(.2, 3.4, 7, wall, -3, 1.7, 0);             // left wall
  box(.2, 3.4, 7, wall, 3, 1.7, 0);              // right wall (with the window)
  box(6, .2, 7, wall, 0, 3.4, 0);                // ceiling
  // window hole: the right wall is split around an opening
  room.children[3].visible = false;
  box(.2, 3.4, 2.6, wall, 3, 1.7, -1.7); box(.2, 3.4, 3.2, wall, 3, 1.7, 1.9);
  box(.2, 1.9, 1.2, wall, 3, .95, .3 - .1); box(.2, .9, 1.2, wall, 3, 2.95, .2);
  for (let i = 0; i < 4; i++) box(.06, .6, .06, new THREE.MeshStandardMaterial({ color: 0x111111 }), 2.95, 2.2, -.3 + i * .3);
  box(1.0, .45, 2.2, new THREE.MeshStandardMaterial({ color: 0x24272c, roughness: .8 }), -2.3, .225, -1.6);   // a bench bed
  cell.add(room);
  cell.add(new THREE.AmbientLight(0x6f86a8, .55));
  const sun = new THREE.SpotLight(0xffd9a0, 520, 18, .22, .5, 1.5); sun.position.set(7, 5.5, -.05); sun.target.position.set(.3, 0, -.05);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0005; cell.add(sun, sun.target);
  const fill = new THREE.PointLight(0x7f97bd, 10, 11, 1.4); fill.position.set(-.8, 2.6, 2.4); cell.add(fill);
  // the shaft: the window opening projected from the light onto the floor, drawn as four additive faces
  { const L = sun.position, win = [[3, 1.9, -.4], [3, 1.9, .3], [3, 2.5, .3], [3, 2.5, -.4]].map(v => new THREE.Vector3(...v));
    const flo = win.map(w => { const d = w.clone().sub(L); const k = -L.y / d.y; return L.clone().add(d.multiplyScalar(k)); });
    const pos = [], fy = [];
    for (let i = 0; i < 4; i++) { const a = win[i], b = win[(i + 1) % 4], c = flo[(i + 1) % 4], d = flo[i];
      for (const [v, f] of [[a, 0], [b, 0], [c, 1], [a, 0], [c, 1], [d, 1]]) { pos.push(v.x, v.y, v.z); fy.push(f); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('f', new THREE.Float32BufferAttribute(fy, 1));
    cell.add(new THREE.Mesh(g, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      vertexShader: `attribute float f; varying float vF; void main(){ vF = f; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `varying float vF; void main(){ gl_FragColor = vec4(vec3(1.,.84,.58) * .018 * (1.-vF*.5), 1.); }` })));
    cell.userData.shaftEnds = [win[0].clone().lerp(win[2], .5), flo[0].clone().lerp(flo[2], .5)]; }
  const dn = 260, dp = new Float32Array(dn * 3); for (let i = 0; i < dn; i++) { const k = rnd(); const [e0, e1] = cell.userData.shaftEnds; const p = e0.clone().lerp(e1, k); p.x += (rnd() - .5) * (.3 + k * .8); p.y += (rnd() - .5) * (.3 + k * .8); p.z += (rnd() - .5) * (.3 + k * .8); dp.set([p.x, p.y, p.z], i * 3); }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ size: 2, sizeAttenuation: false, color: 0xffe2b0, transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false }));
  cell.add(dust); cell.userData.dust = dust;
}
// tally marks on the back wall, one per day held
const tally = new THREE.Group(); cell.add(tally);
const tallyM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, .72, .32).multiplyScalar(1.3), toneMapped: false });
for (let d = 0; d < 18; d++) { const grp = Math.floor(d / 5), k = d % 5;
  const m = new THREE.Mesh(new THREE.BoxGeometry(.03, .42, .01), tallyM);
  if (k < 4) m.position.set(-.55 + grp * .62 + k * .1, 1.75, -2.89); else { m.position.set(-.55 + grp * .62 + .15, 1.75, -2.89); m.rotation.z = 1.0; m.scale.y = 1.35; }
  m.visible = false; tally.add(m); }

const SCENES = { patagonia: makePatagonia(W, H), jungle: makeJungle(W, H) };

// ---------- camera rigs ----------
const routeS = t => { const b = beatAt(t); if (b.r0 === undefined) return 0; const k = b.id === 'darien' ? eio(seg(t, b.t0 + .2, b.t1 - .6)) : eio(seg(t, b.t0 + .4, b.t1 - .2)); return lerp(arcAtSeg(b.r0), arcAtSeg(b.r1), k); };
// a rig: camera offset from the head (lon, lat degrees, altitude) and a look-at offset
const RIGS = {
  depart: () => ({ o: [-.35, -1.9, .045], l: [.05, .5, 0] }),
  andes: () => ({ o: [-.9, -5.2, .12], l: [.15, .9, 0] }),
  darien: () => ({ o: [-1.4, -6.5, .11], l: [.2, .2, 0] }),
  rewalk: () => ({ abs: true, c: [-77.84, 7.62, .028], l: [-77.82, 8.28, 0] }),
};
function rigPose(id, head) { const r = RIGS[id](); const [hl, ha] = toLL(head);
  if (r.abs) return { c: r.c, l: r.l };
  return { c: [hl + r.o[0], ha + r.o[1], r.o[2]], l: [hl + r.l[0], ha + r.l[1], r.l[2]] }; }
const mixPose = (a, b, k) => ({ c: a.c.map((v, i) => i === 2 ? Math.exp(lerp(Math.log(v), Math.log(b.c[i]), k)) : lerp(v, b.c[i], k)), l: a.l.map((v, i) => lerp(v, b.l[i], k)) });
// intro: the globe from space; the camera drifts with the tip of the plan line while it is drawn
const T_PLAN = 7.2, T_RULES = 14.6, T_DEPART = 20.6;
const planK = t => eio(seg(t, T_PLAN + .6, T_RULES - .6));
const lonLerp = (a, b, k) => { let d = b - a; if (d > 180) d -= 360; if (d < -180) d += 360; return a + d * k; };
function introPose(t) {
  const [tl, ta] = toLL(planTip(planK(t)));
  if (t < T_PLAN) { const k = eio(seg(t, 0, T_PLAN)); return { c: [lerp(-48, -62, k), lerp(-5, -18, k), 2.9], l: [-62, -18, 0] }; }
  if (t < T_RULES) { const k = eio(seg(t, T_PLAN, T_PLAN + 1.4)); return { c: [lonLerp(-62, tl, k), lerp(-18, ta - 10, k), 2.9], l: [lonLerp(-62, tl, k), lerp(-18, ta, k), 0] }; }
  const [el, ea] = toLL(planTip(1)), k = eio(seg(t, T_RULES, T_DEPART));
  return { c: [lonLerp(el, -60, k), lerp(ea - 10, -30, k), 2.9], l: [lonLerp(el, -60, k), lerp(ea, -30, k), 0] };
}
function worldPose(t) {
  const b = beatAt(t), head = pointAt(routeS(t));
  let p = INTRO.has(b.id) ? null : rigPose(b.id, head);
  if (INTRO.has(b.id)) p = introPose(t);
  if (b.id === 'depart') { const from = introPose(b.t0 - .001); p = mixPose(from, p, eio(seg(t, b.t0, b.t0 + 3.0))); }
  if (b.id === 'andes') { const k = eio(seg(t, b.t0, b.t0 + 1.6)); p.c[2] = Math.exp(lerp(Math.log(.35), Math.log(p.c[2]), k)); }
  if (b.id === 'darien') { p = mixPose(rigPose('andes', head), p, eio(seg(t, b.t0, b.t0 + 1.4))); const k = eio(seg(t, b.t0 + 1, b.t1)); p.c[2] = Math.exp(lerp(Math.log(p.c[2]), Math.log(.05), k)); p.c[1] = lerp(p.c[1], p.c[1] + 3.6, k); }
  if (b.id === 'rewalk') { const k = eio(seg(t, b.t0, b.t1)); p.c[2] *= lerp(1.25, .95, k); p.c[1] += lerp(-.12, 0, k); }
  const c = ll(p.c[0], p.c[1], 1 + p.c[2]), l = ll(p.l[0], p.l[1], 1 + p.l[2]);
  const ku = clamp((p.c[2] - .45) / 1.2); camera.position.copy(c); camera.up.copy(c).normalize().lerp(new THREE.Vector3(0, 1, 0), ku).normalize(); camera.lookAt(l);
  return head;
}

// ---------- overlay ----------
const ov = document.getElementById('ov'), x = ov.getContext('2d');
await Promise.all([document.fonts.load('900 100px Disp', C.intro.name + 'KARL 0123456789'), document.fonts.load('400 30px Disp', 'DAY CHAPTER'), document.fonts.load('400 30px Disp', C.hud.date)]);
const proj = v => { const p = v.clone().project(camera); return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H, p.z]; };
const visible = v => v.clone().normalize().dot(camera.position.clone().sub(v).normalize()) > .05;
function txt(s, X, Y, font, fill, ls = 0, align = 'left', a = 1) { x.globalAlpha = a; x.font = font; x.fillStyle = fill; x.textAlign = align; x.letterSpacing = ls + 'px'; x.fillText(s, X, Y); x.letterSpacing = '0px'; x.globalAlpha = 1; }
const fadeIO = (t, a, b, f = .35) => Math.min(seg(t, a, a + f), 1 - seg(t, b - f, b));
const shown = [];   // texts on screen this frame, for TEXTS(t)

function chapter(ch, t, a, b) {
  const k = fadeIO(t, a, b, .5), dy = (1 - eo(seg(t, a, a + .8))) * 18; if (k <= 0) return;
  txt(ch.kicker, 120, 150 + dy, '500 20px Disp', '#E8B65C', 4, 'left', k);
  x.globalAlpha = k; x.fillStyle = 'rgba(232,182,92,.9)'; x.fillRect(120, 168 + dy, 40 * eo(seg(t, a, a + .8)), 2); x.globalAlpha = 1;
  txt(ch.title, 112, 300 + dy, '900 132px Disp', '#F4EEE2', 4, 'left', k);
  txt(ch.en, 122, 352 + dy, '400 22px Disp', 'rgba(220,214,200,.7)', 9, 'left', k);
  ch.desc.forEach((d, i) => txt(d, 122, 420 + i * 44 + dy, '400 30px Disp', 'rgba(236,230,218,.88)', 2, 'left', k * fadeIO(t, a + .3 + i * .25, b, .5)));
  shown.push(ch.title, ...ch.desc);
}
function hud(t, b) {
  const d = calAt(t), day = Math.floor(d - D_START) + 1, rx = W - 120, k = fadeIO(t, b.t0 + .2, b.t1 + 1, .5); if (k <= 0) return;
  txt(C.hud.day, rx - 210, 128, '500 18px Disp', 'rgba(220,214,200,.6)', 6, 'left', k);
  txt(String(day).padStart(4, '0'), rx, 150, '300 64px Disp', '#F4EEE2', 4, 'right', k);
  x.globalAlpha = k; x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(rx - 300, 178, 300, 1); x.globalAlpha = 1;
  const rows = [[C.hud.date, fmtDate(d)], [C.hud.age, ageAt(d) + C.hud.age_unit], [C.hud.sleep, C.sleep[b.id] || '']];
  rows.forEach(([kk, v], i) => { txt(kk, rx - 300, 220 + i * 40, '400 19px Disp', 'rgba(220,214,200,.55)', 2, 'left', k); txt(v, rx, 220 + i * 40, '500 22px Disp', 'rgba(244,238,226,.92)', 1, 'right', k); });
  const yrs = (d - D_START) / 365.25, by = 360;
  txt(C.hud.plan, rx - 300, by, '400 17px Disp', 'rgba(220,214,200,.55)', 2, 'left', k);
  txt(C.hud.done.replace('{y}', yrs.toFixed(1)), rx, by, '400 17px Disp', 'rgba(232,182,92,.9)', 1, 'right', k);
  x.globalAlpha = k; x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(rx - 300, by + 14, 300, 3);
  x.fillStyle = '#E8B65C'; x.fillRect(rx - 300, by + 14, 300 * clamp(yrs / 12), 3); x.globalAlpha = 1;
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
function label(name, v, t, a, color = 'rgba(235,228,214,.8)', side = 1) {
  if (!visible(v)) return; const [px, py] = proj(v), k = seg(t, a, a + .5); if (k <= 0) return;
  x.globalAlpha = k; x.strokeStyle = color; x.lineWidth = 1; x.beginPath(); x.moveTo(px + 6 * side, py); x.lineTo(px + 34 * side, py); x.stroke();
  txt(name, px + 40 * side, py + 6, '400 19px Disp', color, 1, side > 0 ? 'left' : 'right', k); x.globalAlpha = 1;
}

function sceneTags(t, b) {   // story scenes: a place tag and the date, top left; the cell adds the day count held
  { const g = x.createRadialGradient(120, 160, 0, 120, 160, 520); g.addColorStop(0, 'rgba(0,0,0,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 900, 520); }
  const k = fadeIO(t, b.t0 + .3, b.t1 - .1, .5), tag = C.tags[b.id === 'departS' ? 'depart' : b.id === 'darienS' ? 'darien' : 'jail'];
  txt(tag, 120, 150, '500 20px Disp', '#E8B65C', 4, 'left', k);
  x.globalAlpha = k; x.fillStyle = 'rgba(232,182,92,.9)'; x.fillRect(120, 168, 40, 2); x.globalAlpha = 1;
  txt(fmtDate(calAt(t)), 120, 216, '400 30px Disp', 'rgba(240,234,222,.9)', 3, 'left', k);
  if (b.id === 'jail') { const n = Math.min(18, 1 + Math.floor(seg(t, b.t0 + .4, b.t1 - .4) * 18));
    txt(C.hud.jail.replace('{n}', n), W - 120, 150, '500 30px Disp', '#FF6A5E', 3, 'right', k); }
}
function overlay(t, head) {
  x.clearRect(0, 0, W, H); shown.length = 0;
  const b = beatAt(t);
  if (INTRO.has(b.id)) {
    const I = C.intro;
    if (b.id === 'who') { const k = fadeIO(t, .4, b.t1 - .1, .6), dy = (1 - eo(seg(t, .4, 1.4))) * 16;
      txt(I.name, W / 2, H / 2 - 10 + dy, '900 112px Disp', '#F4EEE2', 10, 'center', k);
      txt(I.name_en, W / 2, H / 2 + 52 + dy, '500 30px Disp', 'rgba(232,182,92,.95)', 18, 'center', k);
      if (k > 0) shown.push(I.name);
      caption(I.who, t, 1.0, b.t1 - .15); }
    if (b.id === 'plan') caption(I.line, t, b.t0 + .3, b.t1 - .15);
    if (b.id === 'rules') { const k = fadeIO(t, b.t0 + .3, b.t1 - .1, .5);
      { const g = x.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 760); g.addColorStop(0, `rgba(0,0,0,${.6 * k})`); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H); }
      txt(I.rules_kicker, W / 2, H / 2 - 150, '500 26px Disp', '#E8B65C', 8, 'center', k);
      x.globalAlpha = k; x.fillStyle = 'rgba(232,182,92,.9)'; x.fillRect(W / 2 - 24, H / 2 - 128, 48, 2); x.globalAlpha = 1;
      I.rules.forEach((r, i) => { const kk = k * fadeIO(t, b.t0 + .6 + i * .5, b.t1 - .1, .5); txt(r, W / 2, H / 2 - 30 + i * 96 + (1 - kk) * 10, '700 62px Disp', '#F4EEE2', 6, 'center', kk); if (kk > 0) shown.push(r); });
      txt(I.rules_src, W / 2, H / 2 + 200, '400 20px Disp', 'rgba(220,214,200,.55)', 4, 'center', k); }
    return;
  }
  if (b.shot !== 'map') { sceneTags(t, b); caption(C.captions[b.id === 'departS' ? 'depart' : b.id === 'darienS' ? 'darien' : b.id], t, b.t0 + .35, b.t1 - .15); return; }
  hud(t, b);
  {   // map shots: labels on the ground, the head marker
    const lab = b.id === 'andes' || b.id === 'darien' ? C.labels.andes : b.id === 'rewalk' ? C.labels.rewalk : [];
    for (const n of lab) if (PLACES[n]) label(n, ll(...PLACES[n], 1.0002), t, b.t0 + .4, undefined, 1);
    const [hx, hy] = proj(head.clone().multiplyScalar(1.0003));
    x.strokeStyle = 'rgba(255,200,120,.8)'; x.lineWidth = 1; x.beginPath(); x.arc(hx, hy, 16 + 4 * Math.sin(t * 4), 0, Math.PI * 2); x.stroke();
  }
  if (b.id === 'depart') chapter(C.chapters.depart, t, b.t0 + .6, b.t1 - .1);
  if (b.id === 'darien') chapter(C.chapters.darien, t, b.t0 + .4, b.t1 - .1);
  if (b.id === 'rewalk') {
    { const k = seg(t, b.t0 + .2, b.t0 + .9); x.globalAlpha = k; x.strokeStyle = '#FF6A5E'; x.lineWidth = 2; x.setLineDash([8, 7]); x.beginPath();
      ESC.forEach((c, i) => { const [px, py] = proj(ll(...c, 1)); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke(); x.setLineDash([]); x.globalAlpha = 1; }
    const mid = ll(-77.86, 8.21, 1.0); label(C.labels.escort, mid, t, b.t0 + .3, 'rgba(255,106,94,.95)', -1);
    chapter(C.chapters.rewalk, t, RULE_T, DUR + 1);
  }
  if (C.captions[b.id] && b.id !== 'depart' && b.id !== 'darien') caption(C.captions[b.id], t, b.t0 + .35, b.t1 - .15);
}

// ---------- render ----------
function renderAt(t) {
  const b = beatAt(t);
  let head = pointAt(0);
  renderer.toneMappingExposure = 1;
  if (b.shot === 'patagonia' || b.shot === 'jungle') {
    const S = SCENES[b.shot]; S.update(eio(seg(t, b.t0, b.t1)) * .6 + seg(t, b.t0, b.t1) * .4, t);
    post.dof.scene = S.scene; post.dof.camera = S.camera; renderer.toneMappingExposure = S.exposure;
  } else if (b.id === 'jail') {
    post.dof.scene = cell; post.dof.camera = cellCam;
    const k = eio(seg(t, b.t0, b.t1));
    cellCam.position.set(lerp(-1.6, -1.2, k), lerp(1.5, 1.45, k), lerp(4.6, 3.6, k)); cellCam.lookAt(lerp(.6, .5, k), 1.05, -1.6);
    const n = Math.min(18, 1 + Math.floor(seg(t, b.t0 + .4, b.t1 - .4) * 18)); tally.children.forEach((m, i) => m.visible = i < n);
    const dust = cell.userData.dust; dust.rotation.y = Math.sin(t * .3) * .01; dust.position.y = Math.sin(t * .7) * .03;
  } else {
    post.dof.scene = world; post.dof.camera = camera;
    const s = routeS(t); setDrawn(s); head = worldPose(t);
    const hv = head.clone().multiplyScalar(1.0003); h1.position.copy(hv); h2.position.copy(hv); const dc = camera.position.distanceTo(hv); h1.scale.setScalar(dc * .03); h2.scale.setScalar(dc * .075);
    h1.visible = h2.visible = !INTRO.has(b.id); plan.visible = (INTRO.has(b.id) && t >= T_PLAN) || b.id === 'depart'; planGeo.instanceCount = Math.floor((b.id === 'plan' ? planK(t) : t < T_PLAN ? 0 : 1) * (PLAN_P.length - 1)); planMat.opacity = b.id === 'depart' ? .85 * (1 - seg(t, b.t0, b.t0 + 1.5)) : .85;
    core.visible = halo.visible = !INTRO.has(b.id);
    { const alt = camera.position.length() - 1; for (const [o, top] of DETAIL_LINES) o.material.opacity = o.userData.op * clamp((top - alt) / (top * .6)); }
  }
  // dips to black where the shot changes (map <-> scene) and at the ends
  let dip = Math.min(seg(t, 0, .5), 1 - seg(t, DUR - .5, DUR));
  for (let i = 1; i < BEATS.length; i++) if (BEATS[i].shot !== BEATS[i - 1].shot) { const tb = BEATS[i].t0; dip = Math.min(dip, 1 - seg(t, tb - .22, tb) + seg(t, tb, tb + .3)); }
  post.vig.uniforms.fade.value = clamp(dip);
  post.composer.render();
  overlay(t, head);
  if (dip < 1) { x.fillStyle = `rgba(0,0,0,${1 - clamp(dip)})`; x.fillRect(0, 0, W, H); }
}
window.DUR = DUR;
window.render = async t => renderAt(t);
window.TEXTS = t => { renderAt(t); return shown.map(s => ({ id: s.replace(/[0-9]+/g, '#'), text: s, x0: 100, y0: 100, x1: 400, y1: 160 })); };
renderAt(0);
window.READY = true;

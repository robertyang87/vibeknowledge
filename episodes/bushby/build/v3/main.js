// Bushby v3 style frame: dark schematic globe, glowing walked route, low following camera, editorial overlay.
import * as THREE from 'three';
import { makePost } from '/core/three/post.js';

const W = 1920, H = 1080;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H); renderer.setPixelRatio(1);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
document.getElementById('stage').appendChild(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x020409);
const camera = new THREE.PerspectiveCamera(30, W / H, .001, 50);
const post = makePost(renderer, scene, camera, W, H, { ssaa: 1 });
post.dof.aper = 0; post.dof.maxCoc = 0;
post.bloom.strength = .55; post.bloom.radius = .4; post.bloom.threshold = .9;
post.vig.uniforms.amt.value = .55;

const ll = (lon, lat, r = 1) => { const a = THREE.MathUtils.degToRad(lat), b = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(r * Math.cos(a) * Math.sin(b), r * Math.sin(a), r * Math.cos(a) * Math.cos(b)); };

// ---------- globe ----------
const tex = await new THREE.TextureLoader().loadAsync('assets/earth.png');
tex.anisotropy = 16; tex.colorSpace = THREE.NoColorSpace; tex.generateMipmaps = true;
const SUN = ll(-40, 25).normalize();
const globeMat = new THREE.ShaderMaterial({ glslVersion: THREE.GLSL3,
  uniforms: { map: { value: tex }, sun: { value: SUN }, texel: { value: new THREE.Vector2(1 / 8192, 1 / 4096) } },
  vertexShader: `varying vec3 vN; varying vec3 vP; varying vec2 vUv;
    void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); vec4 wp = modelMatrix * vec4(position,1.); vP = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`,
  fragmentShader: `out vec4 fragColor; uniform sampler2D map; uniform vec3 sun; uniform vec2 texel; varying vec3 vN; varying vec3 vP; varying vec2 vUv;
    void main(){
      vec3 n = normalize(vP);
      float lat = asin(clamp(n.y,-1.,1.)); float lon = atan(n.x, n.z);
      vec2 uvA = vec2(lon/6.2831853+.5, lat/3.1415927+.5);
      vec2 uvB = vec2(fract(lon/6.2831853+1.), uvA.y);
      vec2 uv = fwidth(uvA.x) < fwidth(uvB.x) + 1e-6 ? uvA : uvB;
      vec2 dx = dFdx(uv), dy = dFdy(uv); if (abs(dx.x) > .5 || abs(dy.x) > .5) { dx = dFdx(uvA); dy = dFdy(uvA); }
      #define TX(o) textureGrad(map, uv + (o), dx, dy)
      vec3 t = TX(vec2(0.)).rgb;
      float land = smoothstep(.35,.65,t.r);
      // coastline from the mask gradient
      float e = 0.; for(int i=0;i<4;i++){ vec2 o = vec2(float(i==0)-float(i==1), float(i==2)-float(i==3)) * texel * 1.2; e += abs(TX(o).r - t.r); }
      float coast = smoothstep(.05,.6,e);
      float rel = t.g - .5;
      vec3 V = normalize(cameraPosition - vP);
      float fres = pow(1. - max(dot(V, vN), 0.), 3.);
      float day = .55 + .45 * max(dot(vN, sun), 0.);
      vec3 ocean = mix(vec3(.004,.007,.014), vec3(.015,.03,.06), fres);
      // subtle ocean graticule every 10 degrees
      vec2 g = vec2(uv.x*36., uv.y*18.); vec2 gd = abs(fract(g)-.5); vec2 gw = fwidth(g)*.9;
      float gl = max(1.-smoothstep(0.,gw.x,.5-gd.x), 1.-smoothstep(0.,gw.y,.5-gd.y));
      ocean += vec3(.06,.10,.16) * gl * .22;
      vec3 ground = vec3(.060,.072,.092) + clamp(rel,-.25,.25) * vec3(.26,.27,.30);
      ground *= day;
            vec3 col = mix(ocean, ground, land);
      col += vec3(.10,.25,.45) * fres * .35;
      fragColor = vec4(col, 1.);
    }`
});
globeMat.extensions = { derivatives: true };
scene.add(new THREE.Mesh(new THREE.SphereGeometry(1, 256, 128), globeMat));
// atmosphere
const atm = new THREE.Mesh(new THREE.SphereGeometry(1.025, 128, 64), new THREE.ShaderMaterial({
  side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  vertexShader: `varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(mat3(modelMatrix)*normal); vec4 wp = modelMatrix*vec4(position,1.); vP = wp.xyz; gl_Position = projectionMatrix*viewMatrix*wp; }`,
  fragmentShader: `varying vec3 vN; varying vec3 vP; void main(){ vec3 V = normalize(cameraPosition - vP); float f = pow(max(dot(V, -vN)+.18, 0.)*1.0, 6.); gl_FragColor = vec4(vec3(.25,.55,1.)*f*1.6, 1.); }`
}));
scene.add(atm);
// stars
{ const n = 2500, p = new Float32Array(n * 3), r = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(7);
  for (let i = 0; i < n; i++) { const v = new THREE.Vector3(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1).normalize().multiplyScalar(30); p.set([v.x, v.y, v.z], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 1.2, sizeAttenuation: false, color: 0x8899bb, transparent: true, opacity: .55 }))); }

// vector coastlines and borders
{ const L = await (await fetch('assets/lines.json')).json();
  const mk = (arcs, r, color, op) => { const p = [];
    for (const a of arcs) for (let i = 0; i < a.length - 1; i++) { if (Math.abs(a[i][0] - a[i + 1][0]) > 180) continue; const u = ll(...a[i], r), v = ll(...a[i + 1], r); p.push(u.x, u.y, u.z, v.x, v.y, v.z); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    scene.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: op, depthWrite: false }))); };
  mk(L.coast, 1.0006, 0x6fa8e8, .75); mk(L.border, 1.0005, 0x8a9bb8, .22); }

// ---------- route ----------
const R = await (await fetch('assets/route.json')).json();
function densify(coords, r) { const out = [];
  for (let i = 0; i < coords.length - 1; i++) { const a = ll(...coords[i], 1).normalize(), b = ll(...coords[i + 1], 1).normalize();
    const n = Math.max(2, Math.ceil(a.angleTo(b) / .002));
    for (let k = 0; k < n; k++) out.push(new THREE.Vector3().copy(a).lerp(b, k / n).normalize().multiplyScalar(r)); }
  out.push(ll(...coords[coords.length - 1], r)); return out; }
const upto = 29;
let pts = []; for (const s of R.segs.slice(0, upto)) if (s.kind === 'walk') pts.push(...densify(s.c, 1.0025));
const GOLD = new THREE.Color(1.0, .72, .32);
const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', .2);
const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, pts.length * 2, .0011, 8), new THREE.MeshBasicMaterial({ color: GOLD.clone().multiplyScalar(1.5), toneMapped: false }));
scene.add(tube);
const halo = new THREE.Mesh(new THREE.TubeGeometry(curve, pts.length * 2, .0032, 8), new THREE.MeshBasicMaterial({ color: GOLD.clone().multiplyScalar(.35), transparent: true, opacity: .35, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
scene.add(halo);
// head
const head = pts[pts.length - 1];
const spr = (c, s, o = 1) => { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.18, c); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, toneMapped: false, opacity: o }));
  m.scale.setScalar(s); return m; };
const h1 = spr('rgba(255,190,90,.9)', .022); h1.position.copy(head).multiplyScalar(1.001); scene.add(h1);
const h2 = spr('rgba(255,170,70,.35)', .07, .45); h2.position.copy(head); scene.add(h2);
// waypoints
const C = await (await fetch('copy.json')).json();
const wp = C.waypoints;
for (const n of wp) { const p = R.pts[n]; if (!p) continue; const d = spr('rgba(255,220,160,.8)', .014); d.position.copy(ll(...p, 1.003)); scene.add(d); }

// ---------- camera ----------
function placeCam(lon, lat, alt, tlon, tlat, tAlt = 0) {
  const c = ll(lon, lat, 1 + alt), t = ll(tlon, tlat, 1 + tAlt);
  camera.position.copy(c); camera.up.copy(c).normalize(); camera.lookAt(t); }
placeCam(-81.5, -16, .30, -76.5, 6.5, .02);

// ---------- overlay ----------
const ov = document.getElementById('ov'), x = ov.getContext('2d');
await document.fonts.load('100px Serif', C.title); await document.fonts.load('30px Sans', C.title);
const proj = v => { const p = v.clone().project(camera); return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H]; };
function txt(s, X, Y, font, fill, ls = 0, align = 'left') { x.font = font; x.fillStyle = fill; x.textAlign = align; x.letterSpacing = ls + 'px'; x.fillText(s, X, Y); x.letterSpacing = '0px'; }
function overlay() {
  x.clearRect(0, 0, W, H);
  // map labels with leader lines
  x.strokeStyle = 'rgba(255,230,190,.55)'; x.lineWidth = 1;
  for (const n of wp) { const p = R.pts[n]; if (!p) continue; const [a, b] = proj(ll(...p, 1.003));
    x.beginPath(); x.moveTo(a + 6, b); x.lineTo(a + 34, b); x.stroke(); txt(n, a + 40, b + 6, '400 19px Sans', 'rgba(235,228,214,.78)', 1); }
  const [hx, hy] = proj(head);
  x.strokeStyle = 'rgba(255,200,120,.8)'; x.beginPath(); x.arc(hx, hy, 22, 0, Math.PI * 2); x.stroke();
  x.beginPath(); x.moveTo(hx + 16, hy - 16); x.lineTo(hx + 70, hy - 70); x.lineTo(hx + 190, hy - 70); x.stroke();
  txt(C.head_label, hx + 76, hy - 80, '500 20px Sans', 'rgba(255,214,150,.95)', 1);

  // chapter block
  txt(C.chapter, 120, 150, '500 20px Sans', '#E8B65C', 4);
  x.fillStyle = 'rgba(232,182,92,.9)'; x.fillRect(120, 168, 40, 2);
  txt(C.title, 112, 300, '700 132px Serif', '#F4EEE2', 6);
  txt(C.title_en, 122, 352, '400 22px Sans', 'rgba(220,214,200,.7)', 9);
  txt(C.desc[0], 122, 420, '400 30px Serif', 'rgba(236,230,218,.88)', 2);
  txt(C.desc[1], 122, 464, '400 30px Serif', 'rgba(236,230,218,.88)', 2);

  // HUD top right
  const rx = W - 120;
  txt('DAY', rx - 210, 128, '500 18px Sans', 'rgba(220,214,200,.6)', 6, 'left');
  txt('0819', rx, 150, '300 64px Sans', '#F4EEE2', 4, 'right');
  x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(rx - 300, 178, 300, 1);
  const rows = C.rows;
  rows.forEach(([k, v], i) => { txt(k, rx - 300, 220 + i * 40, '400 19px Sans', 'rgba(220,214,200,.55)', 2); txt(v, rx, 220 + i * 40, '500 22px Sans', 'rgba(244,238,226,.92)', 1, 'right'); });
  // plan vs actual
  const by = 360; txt(C.plan, rx - 300, by, '400 17px Sans', 'rgba(220,214,200,.55)', 2);
  x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(rx - 300, by + 14, 300, 3);
  x.fillStyle = '#E8B65C'; x.fillRect(rx - 300, by + 14, 300 * 2.24 / 12, 3);
  txt(C.done, rx, by, '400 17px Sans', 'rgba(232,182,92,.9)', 1, 'right');

  // caption
  { const g = x.createLinearGradient(0, H - 260, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.72)'); x.fillStyle = g; x.fillRect(0, H - 260, W, 260); }
  const cy = H - 92; x.textAlign = 'center';
  const parts = C.caption.map(([t, k]) => [t, k ? '#F2C063' : '#F4EEE2']);
  x.font = '600 44px Serif'; x.letterSpacing = '2px';
  const wsum = parts.reduce((s, [t]) => s + x.measureText(t).width, 0); let cx = W / 2 - wsum / 2; x.textAlign = 'left';
  x.shadowColor = 'rgba(0,0,0,.8)'; x.shadowBlur = 18;
  for (const [t, c] of parts) { x.fillStyle = c; x.fillText(t, cx, cy); cx += x.measureText(t).width; }
  x.shadowBlur = 0; x.letterSpacing = '0px';
}
window.DUR = 1;
window.render = async t => { post.composer.render(); overlay(); };
await window.render(0);
window.READY = true;

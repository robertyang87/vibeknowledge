// More story scenes for the full film, in the same dark cinematic grade: one light source, fog for depth, the people small.
// Each make*(W, H) returns { scene, camera, update(k, t, raw), exposure } (k: eased 0..1 across the shot, t: film time).
import * as THREE from 'three';
import { makeWalker } from './scenes.js';

const rndOf = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
const lerp = (a, b, k) => a + (b - a) * k;

// ---------- shared pieces ----------
function sky(scene, { zen, mid, hor, sun = new THREE.Vector3(0, .1, -1), sunCol = [1, .7, .4], glow = .4, disc = 1, stars = 0 }) {
  const m = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { sun: { value: sun.clone().normalize() }, zen: { value: new THREE.Color(zen) }, mid: { value: new THREE.Color(mid) }, hor: { value: new THREE.Color(hor) }, sc: { value: new THREE.Vector3(...sunCol) }, glow: { value: glow }, disc: { value: disc }, stars: { value: stars } },
    vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: `uniform vec3 sun, zen, mid, hor, sc; uniform float glow, disc, stars; varying vec3 vD;
      float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719))) * 43758.5453); }
      void main(){ float y = max(vD.y, 0.); float s = max(dot(vD, sun), 0.);
        vec3 c = mix(hor, mid, smoothstep(0., .2, y)); c = mix(c, zen, smoothstep(.15, .75, y));
        c += sc * (pow(s, 10.) * glow + pow(s, 160.) * glow * 1.2) + sc * smoothstep(.99965, .9998, s) * disc;
        if (stars > 0.) { vec3 q = floor(vD * 700.); float st = step(.9985, h(q)) * smoothstep(.05, .3, y); c += vec3(.8,.85,1.) * st * stars; }
        gl_FragColor = vec4(c, 1.); }` });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(1500, 48, 24), m));
}
function ridge(scene, dist, height, col, seed, rough = 1, fog = false) {
  const r = rndOf(seed), sh = new THREE.Shape(), span = dist * 1.6, N = 200, ph = [r() * 9, r() * 9, r() * 9];
  sh.moveTo(-span, -5);
  for (let i = 0; i <= N; i++) { const x = -span + 2 * span * i / N, u = x / dist;
    const y = .55 * Math.sin(u * 3.1 + ph[0]) + .3 * Math.sin(u * 7.3 + ph[1]) + .18 * Math.abs(Math.sin(u * 17 + ph[2])) * rough + .08 * Math.sin(u * 41 + ph[1]) * rough;
    sh.lineTo(x, Math.max(0, (y + .6) * height)); }
  sh.lineTo(span, -5);
  const o = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshBasicMaterial({ color: col, fog })); o.position.set(0, 0, -dist); scene.add(o); return o;
}
function ground(scene, color, size = 1400, bump = .3, rough = 1, seg = 160) {
  const g = new THREE.PlaneGeometry(size, size, seg, seg); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, bump * (Math.sin(x * .07) * Math.cos(z * .05) + .6 * Math.sin(x * .21 + z * .13))); }
  g.computeVertexNormals();
  const o = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, roughness: rough })); o.receiveShadow = true; scene.add(o); return o;
}
function particles(scene, n, box, color, size, opacity, rnd) {
  const p = new Float32Array(n * 3); for (let i = 0; i < n; i++) p.set([box[0] + rnd() * (box[1] - box[0]), box[2] + rnd() * (box[3] - box[2]), box[4] + rnd() * (box[5] - box[4])], i * 3);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const o = new THREE.Points(g, new THREE.PointsMaterial({ size, sizeAttenuation: false, color, transparent: true, opacity, depthWrite: false })); o.userData = { base: p.slice(), box }; scene.add(o); return o;
}
function fall(pts, t, vy, vx = 0) {   // snow or rain falling and wrapping inside its box
  const a = pts.geometry.attributes.position, b = pts.userData.base, [x0, x1, y0, y1] = pts.userData.box, hY = y1 - y0, hX = x1 - x0;
  for (let i = 0; i < a.count; i++) { let y = b[i * 3 + 1] - vy * t; y = y0 + (((y - y0) % hY) + hY) % hY; let x = b[i * 3] + vx * t; x = x0 + (((x - x0) % hX) + hX) % hX; a.setXYZ(i, x, y, b[i * 3 + 2] + Math.sin(t + i) * .05); }
  a.needsUpdate = true;
}
function sunLight(scene, dir, color, intensity, span = 16) {
  const s = new THREE.DirectionalLight(color, intensity); s.position.copy(dir).normalize().multiplyScalar(60); s.castShadow = true; s.shadow.mapSize.set(2048, 2048);
  Object.assign(s.shadow.camera, { left: -span, right: span, top: span, bottom: -span, near: 1, far: 160 }); s.shadow.bias = -.0004; scene.add(s, s.target); return s;
}
function follow(s, dir, target) { s.target.position.copy(target); s.position.copy(dir).normalize().multiplyScalar(60).add(target); }
function makeWater(o) {   // a moving water surface with sky and sun (or moon) reflection, faded into the fog colour
  const m = new THREE.ShaderMaterial({ uniforms: { time: { value: 0 }, sun: { value: o.sun.clone().normalize() }, fogC: { value: new THREE.Color(o.fog) }, fogD: { value: o.fogD || .02 },
      deep: { value: new THREE.Color(o.deep) }, skyC: { value: new THREE.Color(o.sky) }, sc: { value: new THREE.Vector3(...(o.sunCol || [1, .9, .8])) }, amp: { value: o.amp || 1 }, sharp: { value: o.sharp || 220 } },
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform float time, fogD, amp, sharp; uniform vec3 sun, fogC, deep, skyC, sc; varying vec3 vW;
      float h(vec2 p){ return (sin(p.x*1.1 + time*.8)*.5 + sin(p.y*1.7 - time*.6 + p.x*.4)*.35 + sin((p.x+p.y)*3.7 + time*1.5)*.15 + sin(p.x*6.3 - p.y*5.1 + time*2.1)*.07) * amp; }
      void main(){ vec2 p = vW.xz; float e = .05; vec3 n = normalize(vec3(h(p) - h(p + vec2(e, 0.)), 5., h(p) - h(p + vec2(0., e))));
        vec3 V = normalize(cameraPosition - vW); vec3 R = reflect(-V, n); float fr = pow(1. - max(dot(V, n), 0.), 4.);
        vec3 c = mix(deep, skyC, .15 + fr * .7) + sc * (pow(max(dot(R, sun), 0.), sharp) * 1.6 + pow(max(dot(R, sun), 0.), 18.) * .08);
        float d = length(cameraPosition - vW); c = mix(c, fogC, 1. - exp(-pow(fogD * d, 2.)));
        gl_FragColor = vec4(c, 1.); }` });
  const w = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), m); w.rotation.x = -Math.PI / 2; return w;
}
function swimmer(mat, back = false) {   // head, shoulders and two arms; crawl or backstroke
  const g = new THREE.Group(), cap = (r, l) => { const c = new THREE.CapsuleGeometry(r, l, 5, 10); c.translate(0, -l / 2, 0); return new THREE.Mesh(c, mat); };
  const head = new THREE.Mesh(new THREE.SphereGeometry(.11, 16, 12), mat); head.position.set(0, .05, back ? -.1 : .1); g.add(head);
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(.16, .5, 6, 10), mat); body.rotation.x = Math.PI / 2; body.position.set(0, -.17, back ? .3 : -.3); g.add(body);
  const aL = new THREE.Group(), aR = new THREE.Group(); aL.position.set(-.2, 0, back ? .05 : 0); aR.position.set(.2, 0, back ? .05 : 0); aL.add(cap(.04, .45)); aR.add(cap(.04, .45)); g.add(aL, aR);
  const splM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .55, depthWrite: false }), spl = [];
  for (const a of [aL, aR]) { const s = new THREE.Mesh(new THREE.SphereGeometry(.16, 10, 6), splM); s.scale.set(1.4, .25, 1); g.add(s); spl.push([a, s]); }
  // the arm sweeps over the water in a low arc and then stays under; we see it only for the recovery
  const arm = (a, p) => { const c = ((p % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2); const rec = c < Math.PI; a.visible = rec;
    a.rotation.x = (back ? 1 : -1) * (Math.PI / 2 + Math.cos(c) * 1.1); a.rotation.z = (a.position.x < 0 ? 1 : -1) * .5; return rec ? 0 : Math.sin(c - Math.PI); };
  g.userData.pose = ph => { for (const [[a, s], p] of [[spl[0], ph], [spl[1], ph + Math.PI]]) { const k = arm(a, p); s.position.set(a.position.x * 1.6, 0, back ? -.35 : .45); s.material.opacity = .5 * Math.max(0, 1 - k * 1.4); s.visible = k < .7; }
    head.rotation.y = back ? 0 : Math.sin(ph) * .4; };
  return g;
}
function boat(mat, lamp = false) {
  const b = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.BoxGeometry(2.4, .9, 8), mat); hull.position.y = .3; b.add(hull);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 2.6), mat); cab.position.set(0, 1.4, -.8); b.add(cab);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, 3, 6), mat); mast.position.set(0, 3, -.8); b.add(mast);
  if (lamp) { const l = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, .85, .55).multiplyScalar(3), toneMapped: false })); l.position.set(0, 4.5, -.8); b.add(l); }
  return b;
}
function camel(mat) {   // a Bactrian camel: deep body, two modest humps, a long neck curving up, thin legs
  const g = new THREE.Group(), legs = [];
  const body = new THREE.Mesh(new THREE.SphereGeometry(.6, 20, 14), mat); body.scale.set(.68, .62, 1.55); body.position.y = 1.62; g.add(body);
  for (const z of [-.42, .38]) { const hump = new THREE.Mesh(new THREE.SphereGeometry(.24, 14, 10), mat); hump.scale.set(.9, 1.2, 1.1); hump.position.set(0, 1.98, z); g.add(hump); }
  const neck = new THREE.Mesh(new THREE.CapsuleGeometry(.12, .7, 6, 10), mat); neck.position.set(0, 1.75, 1.05); neck.rotation.x = 1.0; g.add(neck);
  const neck2 = new THREE.Mesh(new THREE.CapsuleGeometry(.1, .45, 6, 10), mat); neck2.position.set(0, 2.15, 1.35); neck2.rotation.x = .25; g.add(neck2);
  const head = new THREE.Mesh(new THREE.CapsuleGeometry(.09, .32, 6, 10), mat); head.position.set(0, 2.38, 1.5); head.rotation.x = 1.45; g.add(head);
  for (const [x, z] of [[-.2, .62], [.2, .62], [-.2, -.66], [.2, -.66]]) { const l = new THREE.Group(); l.position.set(x, 1.35, z); const c = new THREE.CapsuleGeometry(.055, 1.2, 5, 8); c.translate(0, -.62, 0); l.add(new THREE.Mesh(c, mat)); g.add(l); legs.push(l); }
  g.userData.pose = ph => legs.forEach((l, i) => l.rotation.x = .16 * Math.sin(ph + (i === 0 || i === 3 ? 0 : Math.PI)));
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}
function trees(scene, kind, n, place, rnd, color) {
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 1 }), grp = new THREE.Group();
  for (let i = 0; i < n; i++) { const [x, z] = place(rnd()), h = (kind === 'palm' ? 7 : 6) + rnd() * 6, t = new THREE.Group(); t.position.set(x, 0, z);
    if (kind === 'spruce') { for (let k = 0; k < 5; k++) { const c = new THREE.Mesh(new THREE.ConeGeometry(h * (.22 - k * .035), h * .32, 7), mat); c.position.y = h * (.25 + k * .16); t.add(c); }
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(.06, .1, h * .3, 5), mat); tr.position.y = h * .12; t.add(tr); }
    if (kind === 'larch') { const tr = new THREE.Mesh(new THREE.CylinderGeometry(.05, .14, h, 6), mat); tr.position.y = h / 2; t.add(tr);
      for (let k = 0; k < 9; k++) { const br = new THREE.Mesh(new THREE.CylinderGeometry(.015, .03, .8 + rnd() * 1.2, 4), mat); br.position.y = h * (.35 + k * .07); br.rotation.set(1.1 + rnd() * .4, rnd() * 6, 0); br.translateY(.4); t.add(br); } }
    if (kind === 'palm') { const lean = (rnd() - .5) * .3, tr = new THREE.Mesh(new THREE.CylinderGeometry(.12, .2, h, 6), mat); tr.position.y = h / 2; tr.rotation.z = lean; t.add(tr);
      const top = new THREE.Group(); top.position.set(-Math.sin(lean) * h, h, 0); t.add(top);
      for (let k = 0; k < 8; k++) { const f = new THREE.Mesh(new THREE.BoxGeometry(.25, .04, 2.6), mat); f.geometry.translate(0, 0, 1.3); f.rotation.set(.5 + rnd() * .3, k / 8 * Math.PI * 2, 0); top.add(f); }
      t.userData.top = top; }
    t.traverse(o => { if (o.isMesh) o.castShadow = true; }); grp.add(t); }
  scene.add(grp); return grp;
}
function textTexture(s, font, color, w = 512, h = 128) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d'); x.font = font; x.fillStyle = color; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, w / 2, h / 2); return new THREE.CanvasTexture(cv); }

// ---------- Shelby, Montana: New Year's Eve, snow, a bar; the cart is gone ----------
export function makeShelby(W, H) {
  const rnd = rndOf(71), scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(32, W / H, .1, 400);
  const FOG = 0x0c1018; scene.fog = new THREE.FogExp2(FOG, .028); sky(scene, { zen: 0x04060c, mid: 0x0a0f1a, hor: 0x161b26, glow: 0, disc: 0, stars: .4 });
  ground(scene, 0xc9d2de, 400, .05, .9);
  const wall = new THREE.MeshStandardMaterial({ color: 0x2a2724, roughness: .95 });
  const winM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, .72, .4).multiplyScalar(1.6), toneMapped: false });
  for (const side of [-1, 1]) for (let i = 0; i < 7; i++) {
    const w = 6 + rnd() * 4, h = 4 + rnd() * 3, z = -i * 10 - rnd() * 2, b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 8), wall); b.position.set(side * (9 + w / 2), h / 2, z); b.castShadow = b.receiveShadow = true; scene.add(b);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w + .4, .3, 8.4), new THREE.MeshStandardMaterial({ color: 0xe4e9f0 })); roof.position.set(b.position.x, h + .15, z); scene.add(roof);
    for (let k = 0; k < 2; k++) if (rnd() > .35) { const wn = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.4), winM); wn.position.set(side * 8.98, 1.8, z - 2 + k * 3.5); wn.rotation.y = -side * Math.PI / 2; scene.add(wn); }
  }
  // the bar: a sign glowing in the snow
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.4, .9), new THREE.MeshBasicMaterial({ map: textTexture('BAR', '700 92px serif', '#ff5a4a'), transparent: true, toneMapped: false, color: new THREE.Color(2.2, 2.2, 2.2) }));
  sign.position.set(8.9, 3.6, -9); sign.rotation.y = -Math.PI / 2; scene.add(sign);
  const neon = new THREE.PointLight(0xff5040, 14, 14, 1.5); neon.position.set(7.8, 3.4, -9); scene.add(neon);
  for (let i = 0; i < 4; i++) { const pole = new THREE.Mesh(new THREE.CylinderGeometry(.06, .08, 5.5, 6), new THREE.MeshStandardMaterial({ color: 0x111111 })); pole.position.set(-6.5, 2.75, -i * 16 + 4); scene.add(pole);
    const l = new THREE.PointLight(0xffc27a, 16, 20, 1.5); l.position.set(-6, 5.3, -i * 16 + 4); scene.add(l);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(.14, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, .8, .5).multiplyScalar(3), toneMapped: false })); bulb.position.copy(l.position); scene.add(bulb); }
  scene.add(new THREE.HemisphereLight(0x3a4a6a, 0x0a0a10, .5));
  // the empty spot by the bar, and him, alone
  const wk = makeWalker({ color: 0x0e0f12 }); wk.root.position.set(6.6, 0, -6.5); wk.root.rotation.y = -Math.PI / 2 + .3; wk.pose(0); scene.add(wk.root);
  const snow = particles(scene, 1600, [-12, 12, 0, 12, -40, 8], 0xe8eef8, 1.6, .7, rnd);
  function update(k, t) { camera.position.set(lerp(-2.2, -1.2, k), lerp(1.7, 1.6, k), lerp(9, 5.5, k)); camera.lookAt(lerp(5, 5.5, k), 1.8, -8); fall(snow, t, 1.3, .4); neon.intensity = 14 + Math.sin(t * 9) * 1.5; }
  return { scene, camera, update, exposure: 1.1 };
}

// ---------- Alaska: polar dusk, deep snow, black spruce; pulling the sled ----------
export function makeAlaska(W, H) {
  const rnd = rndOf(83), scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, W / H, .1, 2000);
  const SUN = new THREE.Vector3(.6, .04, -1);
  scene.fog = new THREE.Fog(0x8a95b8, 40, 420); sky(scene, { zen: 0x1a2446, mid: 0x5a6290, hor: 0xe0a8a0, sun: SUN, sunCol: [1, .55, .45], glow: .35, disc: .6 });
  ridge(scene, 700, 45, 0x6b6f98, 5, .8); ridge(scene, 480, 22, 0x4a4f78, 9, .5);
  ground(scene, 0xe9eef8, 1400, .6, .85);
  trees(scene, 'spruce', 140, r => { let x = (rnd() - .5) * 160; if (Math.abs(x) < 8) x += Math.sign(x || 1) * 8; return [x, 10 - rnd() * 160]; }, rnd, 0x161c24);
  scene.add(new THREE.HemisphereLight(0x9aa6d8, 0x5a5f80, 1.0));
  const sun = sunLight(scene, SUN, 0xffb4a0, 1.6, 14);
  const wk = makeWalker({ sled: true, color: 0x111318 }); wk.root.rotation.y = Math.PI; scene.add(wk.root);
  const trail = new THREE.Mesh(new THREE.PlaneGeometry(.9, 80), new THREE.MeshStandardMaterial({ color: 0xb8c2d8, roughness: 1 })); trail.rotation.x = -Math.PI / 2; trail.position.set(1, .02, 38); scene.add(trail);
  const snow = particles(scene, 900, [-20, 20, 0, 8, -30, 10], 0xffffff, 1.4, .55, rnd);
  function update(k, t) { const z = lerp(0, -4.5, k); wk.root.position.set(1, 0, z); wk.pose(t * 4.6); follow(sun, SUN, wk.root.position);
    camera.position.set(lerp(6.5, 5.5, k), lerp(1.4, 1.3, k), z + lerp(12, 10, k)); camera.lookAt(0, 1.6, z - 20); fall(snow, t, .6, 2.2); }
  return { scene, camera, update, exposure: .95 };
}

// ---------- the Bering Strait: sea ice, pressure ridges, open leads; two men pulling sleds ----------
export function makeBering(W, H) {
  const rnd = rndOf(97), scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, W / H, .1, 2000);
  const SUN = new THREE.Vector3(-.5, .06, -1);
  scene.fog = new THREE.Fog(0xb4bfd4, 50, 520); sky(scene, { zen: 0x2a3a66, mid: 0x8a98c0, hor: 0xf0d2b8, sun: SUN, sunCol: [1, .78, .55], glow: .4, disc: .8 });
  ground(scene, 0xe6edf6, 1400, .25, .6);
  const iceM = new THREE.MeshStandardMaterial({ color: 0xcfe0f2, roughness: .35, metalness: .05 });
  for (let rI = 0; rI < 9; rI++) { const z = -10 - rI * 22 - rnd() * 10, x0 = (rnd() - .5) * 60;
    for (let i = 0; i < 70; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(.6 + rnd() * 2.2, .3 + rnd() * 1.2, .6 + rnd() * 1.6), iceM);
      b.position.set(x0 + (i - 35) * .9 + rnd(), .2 + rnd() * .9, z + (rnd() - .5) * 2.5); b.rotation.set(rnd() * .9, rnd() * 3, rnd() * .9); b.castShadow = b.receiveShadow = true; scene.add(b); } }
  const lead = makeWater({ sun: SUN, fog: 0xb4bfd4, fogD: .006, deep: 0x0b1626, sky: 0x8a98c0, sunCol: [1, .8, .6], amp: .3 }); lead.scale.set(.012, .1, 1); lead.position.set(-14, .03, -40); lead.rotation.z = .2; scene.add(lead);
  scene.add(new THREE.HemisphereLight(0xb8c6ee, 0x8890a8, 1.0));
  const sun = sunLight(scene, SUN, 0xffd2a8, 2.2, 14);
  const a = makeWalker({ sled: true, color: 0x101216 }), b2 = makeWalker({ sled: true, color: 0x1a1410 }); a.root.rotation.y = b2.root.rotation.y = Math.PI; scene.add(a.root, b2.root);
  const blow = particles(scene, 700, [-25, 25, 0, 1.2, -30, 10], 0xffffff, 1.3, .5, rnd);
  function update(k, t) { const z = lerp(0, -5, k); a.root.position.set(.6, 0, z); b2.root.position.set(2.0, 0, z + 3.6); a.pose(t * 4.2); b2.pose(t * 4.2 + 1.3); follow(sun, SUN, a.root.position);
    camera.position.set(lerp(7.5, 6.2, k), lerp(1.3, 1.2, k), z + lerp(14, 11, k)); camera.lookAt(-.5, 1.4, z - 20); fall(blow, t, .1, 5); lead.material.uniforms.time.value = t; }
  return { scene, camera, update, exposure: .95 };
}

// ---------- Kolyma: a winter road through larch taiga, overcast ----------
export function makeKolyma(W, H) {
  const rnd = rndOf(101), scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, W / H, .1, 2000);
  scene.fog = new THREE.Fog(0xa8adb8, 25, 240); sky(scene, { zen: 0x7c8494, mid: 0xa2a8b4, hor: 0xc0c4cc, glow: 0, disc: 0 });
  ridge(scene, 400, 35, 0x8e939e, 3, .7, false);
  ground(scene, 0xe8ebf0, 1400, .4, .9);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(7, 1400), new THREE.MeshStandardMaterial({ color: 0xc8ccd4, roughness: .8 })); road.rotation.x = -Math.PI / 2; road.position.set(0, .03, -600); scene.add(road);
  trees(scene, 'larch', 220, r => { let x = (rnd() - .5) * 120; if (Math.abs(x) < 7) x += Math.sign(x || 1) * 7; return [x, 10 - rnd() * 180]; }, rnd, 0x2a2622);
  scene.add(new THREE.HemisphereLight(0xc8ccd8, 0x8a8e98, 1.5));
  const sun = sunLight(scene, new THREE.Vector3(.3, .5, -.6), 0xdfe4ee, .5, 14);
  const wk = makeWalker({ cart: true, color: 0x14161a }); wk.root.rotation.y = Math.PI; scene.add(wk.root);
  const snow = particles(scene, 1000, [-16, 16, 0, 9, -30, 10], 0xffffff, 1.3, .6, rnd);
  function update(k, t) { const z = lerp(0, -4.8, k); wk.root.position.set(1.4, 0, z); wk.pose(t * 5); follow(sun, new THREE.Vector3(.3, .5, -.6), wk.root.position);
    camera.position.set(lerp(-2.5, -1.8, k), lerp(1.2, 1.15, k), z + lerp(11, 9, k)); camera.lookAt(.8, 1.4, z - 20); fall(snow, t, .9, .6); }
  return { scene, camera, update, exposure: 1.0 };
}

// ---------- the protest walk: an American highway across the plains; his son walks with him ----------
export function makeProtest(W, H) {
  const rnd = rndOf(113), scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(28, W / H, .1, 2000);
  const SUN = new THREE.Vector3(.7, .22, -1);
  scene.fog = new THREE.Fog(0xd8c8a8, 80, 600); sky(scene, { zen: 0x2a4a80, mid: 0x7a9cc8, hor: 0xf0d8b0, sun: SUN, sunCol: [1, .8, .55], glow: .35, disc: .9 });
  ridge(scene, 700, 25, 0x8a8a9a, 4, .4);
  ground(scene, 0x9a8a50, 1400, .4, 1);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(9, 1400), new THREE.MeshStandardMaterial({ color: 0x2a2a2e, roughness: .85 })); road.rotation.x = -Math.PI / 2; road.position.set(0, .02, -600); road.receiveShadow = true; scene.add(road);
  const dash = new THREE.MeshStandardMaterial({ color: 0xd8b84a, emissive: 0x2a2208 });
  for (let z = 10; z > -700; z -= 9) for (const x of [-.12, .12]) { const d = new THREE.Mesh(new THREE.PlaneGeometry(.1, 4), dash); d.rotation.x = -Math.PI / 2; d.position.set(x, .03, z); scene.add(d); }
  const poleM = new THREE.MeshStandardMaterial({ color: 0x2a2018 });
  for (let z = 8; z > -400; z -= 22) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.1, .12, 8, 6), poleM); p.position.set(-9, 4, z); p.castShadow = true; scene.add(p); const cr = new THREE.Mesh(new THREE.BoxGeometry(2.2, .12, .12), poleM); cr.position.set(-9, 7.6, z); scene.add(cr); }
  scene.add(new THREE.HemisphereLight(0x9ab4dc, 0x6a5a38, 1.0));
  const sun = sunLight(scene, SUN, 0xffd8a8, 2.6, 14);
  const k1 = makeWalker({ cart: true, color: 0x15171b }), k2 = makeWalker({ color: 0x1a1612 }); k1.root.rotation.y = k2.root.rotation.y = Math.PI; scene.add(k1.root, k2.root);
  function update(k, t) { const z = lerp(0, -5.5, k); k1.root.position.set(2.6, 0, z); k2.root.position.set(3.6, 0, z + .6); k1.pose(t * 5.2); k2.pose(t * 5.2 + 2); follow(sun, SUN, k1.root.position);
    camera.position.set(lerp(8, 7, k), lerp(1.3, 1.2, k), z + lerp(13, 11, k)); camera.lookAt(1.2, 1.6, z - 22); }
  return { scene, camera, update, exposure: 1.0 };
}

// ---------- the Aldan: swimming across a wide river, larch on both banks ----------
export function makeAldan(W, H) {
  const rnd = rndOf(127), scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(32, W / H, .05, 2000);
  const SUN = new THREE.Vector3(-.6, .28, -1);
  scene.fog = new THREE.FogExp2(0x9fb0c2, .012); sky(scene, { zen: 0x4a6a9a, mid: 0x9ab2cc, hor: 0xd8e0e6, sun: SUN, sunCol: [1, .9, .75], glow: .25, disc: .8 });
  const water = makeWater({ sun: SUN, fog: 0x9fb0c2, fogD: .012, deep: 0x1a2a2e, sky: 0x9ab2cc, sunCol: [1, .92, .8], amp: .5, sharp: 300 }); scene.add(water);
  const bankM = new THREE.MeshStandardMaterial({ color: 0x3a3a2e, roughness: 1 });
  for (const z of [-90, 30]) { const b = new THREE.Mesh(new THREE.BoxGeometry(800, 3, 30), bankM); b.position.set(0, 0, z); scene.add(b); }
  trees(scene, 'larch', 160, r => [(rnd() - .5) * 300, -82 - rnd() * 30], rnd, 0x2a3320).position.y = 1.4;
  scene.add(new THREE.HemisphereLight(0xc0d0e0, 0x30362a, 1.1));
  const sun = sunLight(scene, SUN, 0xfff0d8, 1.6, 10);
  const mat = new THREE.MeshStandardMaterial({ color: 0x18160f, roughness: .6 }), sw = swimmer(mat); sw.rotation.y = Math.PI; scene.add(sw);
  function update(k, t) { sw.position.set(lerp(0, -.6, k), .02 + Math.sin(t * 3) * .02, lerp(0, -3.2, k)); sw.userData.pose(t * 3.2); water.material.uniforms.time.value = t;
    camera.position.set(lerp(2.0, 1.7, k), .7, sw.position.z + lerp(4.2, 3.6, k)); camera.lookAt(sw.position.x - .6, .1, sw.position.z - 10); }
  return { scene, camera, update, exposure: 1.0 };
}

// ---------- Mongolia: a camel caravan heading west across the steppe at dusk ----------
export function makeCamels(W, H) {
  const rnd = rndOf(131), scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(26, W / H, .1, 2000);
  const SUN = new THREE.Vector3(-1, .05, -.3);
  scene.fog = new THREE.Fog(0xc89a78, 60, 520); sky(scene, { zen: 0x232a50, mid: 0x7a6080, hor: 0xf0a070, sun: SUN, sunCol: [1, .6, .35], glow: .5, disc: 1 });
  ridge(scene, 600, 30, 0x6a4e60, 7, .5); ridge(scene, 380, 14, 0x4a3846, 11, .3);
  ground(scene, 0x8a7448, 1400, .8, 1);
  scene.add(new THREE.HemisphereLight(0x8a90b8, 0x5a4428, .9));
  const sun = sunLight(scene, SUN, 0xffb27a, 2.6, 22);
  const mat = new THREE.MeshStandardMaterial({ color: 0x1c1712, roughness: .9 }), caravan = [];
  for (let i = 0; i < 5; i++) { const c = camel(mat); c.rotation.y = -Math.PI / 2; scene.add(c); caravan.push(c); }
  const people = [makeWalker({ color: 0x15130f }), makeWalker({ color: 0x17140f }), makeWalker({ sack: false, color: 0x101114 })];
  people.forEach(p => { p.root.rotation.y = -Math.PI / 2; scene.add(p.root); });
  function update(k, t) { const x = lerp(0, -5, k);
    caravan.forEach((c, i) => { c.position.set(x + i * 3.4, 0, -8 + Math.sin(i) * .3); c.userData.pose(t * 3.6 + i); });
    people.forEach((p, i) => { p.root.position.set(x - 2 + i * 6.5, 0, -6.4 + (i === 2 ? 1.2 : 0)); p.pose(t * 4.4 + i); });
    follow(sun, SUN, new THREE.Vector3(x + 6, 0, -8));
    camera.position.set(x + lerp(14, 12, k), 1.3, lerp(10, 8, k)); camera.lookAt(x + 5, 1.7, -8); }
  return { scene, camera, update, exposure: .95 };
}

// ---------- Turkmenistan: the Karakum at noon, an escort car behind him ----------
export function makeTurkmen(W, H) {
  const rnd = rndOf(137), scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(28, W / H, .1, 2000);
  const SUN = new THREE.Vector3(.3, .9, -.4);
  scene.fog = new THREE.Fog(0xe8d6b4, 60, 500); sky(scene, { zen: 0x5a7ab0, mid: 0xb8c4d0, hor: 0xf0e2c8, sun: SUN, sunCol: [1, .95, .85], glow: .2, disc: .5 });
  const g = new THREE.PlaneGeometry(1400, 1400, 220, 220); g.rotateX(-Math.PI / 2);
  { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); if (Math.abs(x) > 6) p.setY(i, Math.max(0, 2.2 * Math.sin(x * .05 + z * .02) + 1.4 * Math.sin(x * .13 - z * .07)) * Math.min(1, (Math.abs(x) - 6) / 20)); } g.computeVertexNormals(); }
  const sand = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0xd8b880, roughness: 1 })); sand.receiveShadow = true; scene.add(sand);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(7, 1400), new THREE.MeshStandardMaterial({ color: 0x4a4440, roughness: .9 })); road.rotation.x = -Math.PI / 2; road.position.set(0, .03, -600); road.receiveShadow = true; scene.add(road);
  scene.add(new THREE.HemisphereLight(0xd0dcf0, 0xb89a68, 1.2));
  const sun = sunLight(scene, SUN, 0xfff2dc, 3.2, 18);
  const wk = makeWalker({ cart: true, color: 0x15171b }); wk.root.rotation.y = Math.PI; scene.add(wk.root);
  const car = new THREE.Group(), cm = new THREE.MeshStandardMaterial({ color: 0xd8dcdc, roughness: .4, metalness: .3 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, .7, 4.2), cm); body.position.y = .65; car.add(body);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.6, .55, 2.2), new THREE.MeshStandardMaterial({ color: 0x20262c, roughness: .2, metalness: .5 })); roof.position.set(0, 1.25, -.2); car.add(roof);
  for (const [xx, zz] of [[-.85, 1.3], [.85, 1.3], [-.85, -1.3], [.85, -1.3]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(.33, .33, .25, 14), new THREE.MeshStandardMaterial({ color: 0x111111 })); w.rotation.z = Math.PI / 2; w.position.set(xx, .33, zz); car.add(w); }
  car.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(car);
  function update(k, t) { const z = lerp(0, -5, k); wk.root.position.set(1.6, 0, z); wk.pose(t * 5); car.position.set(1.8, 0, z + 14); follow(sun, SUN, wk.root.position);
    camera.position.set(lerp(-5, -4, k), lerp(1.3, 1.2, k), z + lerp(24, 20, k)); camera.lookAt(1.2, 1.2, z - 6); }
  return { scene, camera, update, exposure: .92 };
}

// ---------- Melaque, Mexico: a tropical storm floods the town; people wade through the water ----------
export function makeStorm(W, H) {
  const rnd = rndOf(149), scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(32, W / H, .1, 1000);
  scene.fog = new THREE.FogExp2(0x1a2228, .03); sky(scene, { zen: 0x10161c, mid: 0x1e262e, hor: 0x2e3638, glow: 0, disc: 0 });
  const water = makeWater({ sun: new THREE.Vector3(.2, .6, -1), fog: 0x1a2228, fogD: .03, deep: 0x1a1c18, sky: 0x2e3638, sunCol: [.8, .85, .9], amp: .6, sharp: 60 }); water.position.y = .7; scene.add(water);
  const wall = new THREE.MeshStandardMaterial({ color: 0x6a6258, roughness: .95 }), winM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, .75, .45).multiplyScalar(1.2), toneMapped: false });
  for (const side of [-1, 1]) for (let i = 0; i < 6; i++) { const w = 5 + rnd() * 3, h = 3 + rnd() * 3, z = -i * 9; const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 7), wall); b.position.set(side * (7 + w / 2), h / 2, z); scene.add(b);
    if (rnd() > .5) { const wn = new THREE.Mesh(new THREE.PlaneGeometry(1, 1.1), winM); wn.position.set(side * 6.98, 2.2, z); wn.rotation.y = -side * Math.PI / 2; scene.add(wn); } }
  const palms = trees(scene, 'palm', 10, r => [(rnd() > .5 ? 1 : -1) * (5 + rnd() * 2), -rnd() * 50], rnd, 0x141812);
  scene.add(new THREE.HemisphereLight(0x7a8a9a, 0x202420, 1.6));
  const flash = new THREE.DirectionalLight(0xc8d8ff, 0); flash.position.set(-10, 30, -20); scene.add(flash);
  const torch = new THREE.SpotLight(0xffe2b0, 30, 30, .3, .5, 1.2); scene.add(torch, torch.target);
  const people = [makeWalker({ color: 0x101114 }), makeWalker({ color: 0x14120e })]; people.forEach(p => { p.root.rotation.y = Math.PI; scene.add(p.root); });
  const rain = particles(scene, 2600, [-14, 14, 0, 14, -30, 8], 0xb8c8d8, 1.4, .55, rnd);
  function update(k, t) { const z = lerp(-2, -5, k); people[0].root.position.set(.4, -.55, z); people[1].root.position.set(1.4, -.55, z + 1.2); people.forEach((p, i) => p.pose(t * 3 + i));
    torch.position.set(.6, 1.4, z - .2); torch.target.position.set(.4, .7, z - 8);
    palms.children.forEach((p, i) => { if (p.userData.top) p.userData.top.rotation.z = Math.sin(t * 2.5 + i) * .25; });
    flash.intensity = (Math.sin(t * 1.7) > .985 || Math.sin(t * 2.9 + 1) > .992) ? 3.5 : 0; water.material.uniforms.time.value = t * 1.5;
    camera.position.set(lerp(-1.8, -1.3, k), lerp(1.5, 1.4, k), z + lerp(5.5, 4.4, k)); camera.lookAt(.9, .9, z - 3); fall(rain, t, 14, -2); }
  return { scene, camera, update, exposure: 1.7 };
}

// ---------- the Caspian: open water, three swimmers, the support boat alongside ----------
export function makeCaspian(W, H) {
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, W / H, .05, 3000);
  const SUN = new THREE.Vector3(.8, .3, -1);
  scene.fog = new THREE.FogExp2(0xa8b8c8, .006); sky(scene, { zen: 0x3a5a8a, mid: 0x90a8c4, hor: 0xd8dee4, sun: SUN, sunCol: [1, .92, .78], glow: .3, disc: .9 });
  const water = makeWater({ sun: SUN, fog: 0xa8b8c8, fogD: .006, deep: 0x0e2230, sky: 0x90a8c4, sunCol: [1, .95, .85], amp: .9, sharp: 380 }); scene.add(water);
  scene.add(new THREE.HemisphereLight(0xc8d8ea, 0x1a2a30, 1.1));
  const sun = sunLight(scene, SUN, 0xfff2e0, 1.8, 20);
  const mat = new THREE.MeshStandardMaterial({ color: 0x1a1612, roughness: .5 }), capM = [0xf0c040, 0xe8e8e8, 0xd84a3a].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: .4 }));
  const sws = [0, 1, 2].map(i => { const s = swimmer(mat); s.children[0].material = capM[i]; s.rotation.y = Math.PI * .92; scene.add(s); return s; });
  const bt = boat(new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: .5 })); bt.rotation.y = Math.PI * .92; scene.add(bt);
  function update(k, t) { const z = lerp(0, -4, k);
    sws.forEach((s, i) => { s.position.set(i * 1.6 - 1, .02 + Math.sin(t * 2.6 + i) * .03, z + i * .9); s.userData.pose(t * 3.1 + i * 1.3); });
    bt.position.set(-9, Math.sin(t * 1.3) * .08, z - 30); bt.rotation.z = Math.sin(t * 1.1) * .03; water.material.uniforms.time.value = t;
    camera.position.set(lerp(4.5, 3.6, k), lerp(1.3, 1.1, k), z + lerp(7, 5.5, k)); camera.lookAt(-1.8, .2, z - 12); }
  return { scene, camera, update, exposure: 1.0 };
}

// ---------- the Channel: dawn, floating on his back toward the white cliffs ----------
export function makeChannel(W, H) {
  const rnd = rndOf(163), scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, W / H, .05, 3000);
  const SUN = new THREE.Vector3(1, .07, -.35);
  scene.fog = new THREE.FogExp2(0xc8b8b0, .0018); sky(scene, { zen: 0x2e3e6a, mid: 0xa0a0c0, hor: 0xf4c8a0, sun: SUN, sunCol: [1, .7, .45], glow: .55, disc: 1 });
  const water = makeWater({ sun: SUN, fog: 0xc8b8b0, fogD: .0018, deep: 0x0c1824, sky: 0xa0a0c0, sunCol: [1, .78, .55], amp: .7, sharp: 160 }); scene.add(water);
  // the cliffs ahead: a chalk wall with a broken top
  const sh = new THREE.Shape(); sh.moveTo(-600, -5); for (let i = 0; i <= 120; i++) { const x = -600 + i * 10; sh.lineTo(x, 34 + 6 * Math.sin(x * .02) + 3 * Math.sin(x * .09) + rnd() * 1.5); } sh.lineTo(600, -5);
  const cliff = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 20, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x4a4440, roughness: .9 })); cliff.position.set(60, 0, -300); scene.add(cliff);
  const top = new THREE.Mesh(new THREE.BoxGeometry(1200, 4, 22), new THREE.MeshStandardMaterial({ color: 0x4a5a38 })); top.position.set(60, 36, -290); scene.add(top);
  scene.add(new THREE.HemisphereLight(0xb0b8d8, 0x203040, 1.0));
  const sun = sunLight(scene, SUN, 0xffc8a0, 2.0, 12);
  const mat = new THREE.MeshStandardMaterial({ color: 0x1a1612, roughness: .5 }), sw = swimmer(mat, true); sw.rotation.y = Math.PI * .95; scene.add(sw);
  const bt = boat(new THREE.MeshStandardMaterial({ color: 0xdcd6cc, roughness: .5 }), true); bt.rotation.y = Math.PI * .95; scene.add(bt);
  function update(k, t) { const z = lerp(0, -3, k); sw.position.set(0, .04 + Math.sin(t * 2) * .03, z); sw.userData.pose(t * 1.6);
    bt.position.set(-8, Math.sin(t * 1.2) * .1, z - 12); water.material.uniforms.time.value = t;
    camera.position.set(lerp(3.2, 2.6, k), lerp(.8, .7, k), z + lerp(5.5, 4.6, k)); camera.lookAt(-.6, 3.0, z - 60); }
  return { scene, camera, update, exposure: 1.0 };
}

// ---------- the Humber Bridge in fog: father and brother walk with him ----------
export function makeHumber(W, H) {
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, W / H, .1, 2000);
  scene.fog = new THREE.FogExp2(0x9ca4ac, .022); scene.background = new THREE.Color(0x9ca4ac);
  const conc = new THREE.MeshStandardMaterial({ color: 0x8a8e92, roughness: .9 }), steel = new THREE.MeshStandardMaterial({ color: 0x5a5e62, roughness: .6, metalness: .3 });
  const deck = new THREE.Mesh(new THREE.BoxGeometry(14, .6, 1400), conc); deck.position.set(0, -.3, -600); deck.receiveShadow = true; scene.add(deck);
  const walkway = new THREE.Mesh(new THREE.BoxGeometry(2.6, .1, 1400), new THREE.MeshStandardMaterial({ color: 0x6a6e72 })); walkway.position.set(5.5, .05, -600); scene.add(walkway);
  for (const x of [-7, 7]) { for (let z = 10; z > -500; z -= 2.5) { const p = new THREE.Mesh(new THREE.BoxGeometry(.05, 1.1, .05), steel); p.position.set(x, .55, z); scene.add(p); }
    const rail = new THREE.Mesh(new THREE.BoxGeometry(.08, .08, 1400), steel); rail.position.set(x, 1.1, -600); scene.add(rail); }
  // a tower ahead and the main cables sagging toward it; hangers every few metres
  const towerZ = -160; for (const x of [-7.5, 7.5]) { const t = new THREE.Mesh(new THREE.BoxGeometry(2.2, 150, 3), conc); t.position.set(x, 75, towerZ); scene.add(t); }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(17, 3, 3), conc); beam.position.set(0, 140, towerZ); scene.add(beam);
  for (const x of [-7.3, 7.3]) { const pts = []; for (let i = 0; i <= 80; i++) { const z = 40 + (towerZ - 40) * i / 80, u = (z - towerZ) / 400; pts.push(new THREE.Vector3(x, 148 - 150 * Math.sqrt(Math.max(0, 1 - Math.pow(1 - Math.abs(u) * 2.2, 2))) * .9 + 2, z)); }
    const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, .35, 8), steel); scene.add(cable);
    for (let z = 30; z > towerZ; z -= 6) { const u = (z - towerZ) / 400, y = 148 - 150 * Math.sqrt(Math.max(0, 1 - Math.pow(1 - Math.abs(u) * 2.2, 2))) * .9 + 2; const hgr = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, y, 4), steel); hgr.position.set(x, y / 2, z); scene.add(hgr); } }
  for (let z = 0; z > -300; z -= 30) { const l = new THREE.PointLight(0xffd8a0, 10, 18, 1.5); l.position.set(6.8, 5, z); scene.add(l); const lb = new THREE.Mesh(new THREE.SphereGeometry(.15, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, .85, .6).multiplyScalar(3), toneMapped: false })); lb.position.copy(l.position); scene.add(lb);
    const lp = new THREE.Mesh(new THREE.CylinderGeometry(.05, .07, 5, 6), steel); lp.position.set(6.9, 2.5, z); scene.add(lp); }
  scene.add(new THREE.HemisphereLight(0xc8ccd4, 0x50545a, 1.2));
  const sun = sunLight(scene, new THREE.Vector3(.2, .8, -.3), 0xe8ecf0, .5, 12);
  const karl = makeWalker({ cart: true, color: 0x14161a }), dad = makeWalker({ color: 0x1a1814 }), bro = makeWalker({ color: 0x16151a });
  for (const p of [karl, dad, bro]) { p.root.rotation.y = Math.PI; scene.add(p.root); }
  function update(k, t) { const z = lerp(0, -5, k); karl.root.position.set(5.2, .1, z); dad.root.position.set(4.3, .1, z + .9); bro.root.position.set(6.2, .1, z + 1.3);
    karl.pose(t * 5); dad.pose(t * 5 + 1.6); bro.pose(t * 5 + .7); follow(sun, new THREE.Vector3(.2, .8, -.3), karl.root.position);
    camera.position.set(lerp(1.4, 2.2, k), lerp(1.7, 1.6, k), z + lerp(10, 8, k)); camera.lookAt(5.4, 3.5, z - 25); }
  return { scene, camera, update, exposure: 1.0 };
}

// ---------- home: a terraced street in Hull at dusk; the front door open, warm light on the step ----------
export function makeHome(W, H) {
  const rnd = rndOf(173), scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, W / H, .1, 600);
  scene.fog = new THREE.FogExp2(0x1a2030, .03); sky(scene, { zen: 0x0c1220, mid: 0x1e2638, hor: 0x3a3a48, glow: 0, disc: 0 });
  ground(scene, 0x22242a, 300, .02, .3);
  const brick = new THREE.MeshStandardMaterial({ color: 0x5a3428, roughness: .95 }), winM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, .76, .46).multiplyScalar(1.4), toneMapped: false });
  for (let i = 0; i < 14; i++) { const z = 8 - i * 6; const h = new THREE.Mesh(new THREE.BoxGeometry(6, 7, 6), brick); h.position.set(-6, 3.5, z); h.castShadow = h.receiveShadow = true; scene.add(h);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(6.4, .5, 6.1), new THREE.MeshStandardMaterial({ color: 0x1e1e22 })); roof.position.set(-6, 7.2, z); scene.add(roof);
    if (i !== 2 && rnd() > .3) for (const y of [2, 5]) { const wn = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.5), winM); wn.position.set(-2.98, y, z + 1.2); wn.rotation.y = Math.PI / 2; scene.add(wn); } }
  // the door: open, light pouring out across the step
  const doorZ = 8 - 2 * 6 - 1.2;
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, .82, .55).multiplyScalar(2.4), toneMapped: false })); glow.position.set(-2.97, 1.1, doorZ); glow.rotation.y = Math.PI / 2; scene.add(glow);
  const doorL = new THREE.SpotLight(0xffc888, 40, 14, .9, .6, 1.4); doorL.position.set(-3.5, 1.6, doorZ); doorL.target.position.set(1, 0, doorZ); scene.add(doorL, doorL.target);
  const lamp = new THREE.PointLight(0xffc27a, 12, 20, 1.5); lamp.position.set(2.5, 5, doorZ + 6); scene.add(lamp);
  scene.add(new THREE.HemisphereLight(0x3a4660, 0x101014, .6));
  const mom = makeWalker({ color: 0x15130f }), karl = makeWalker({ cart: true, color: 0x101114 }), kid = makeWalker({ color: 0x18140f }), son = makeWalker({ color: 0x12110f });
  mom.root.position.set(-2.6, 0, doorZ); mom.root.rotation.y = Math.PI / 2; kid.root.scale.setScalar(.82); kid.root.position.set(-1.6, 0, doorZ + 1.3); kid.root.rotation.y = Math.PI / 2 + .4; son.root.position.set(-1.4, 0, doorZ - 1.4); son.root.rotation.y = Math.PI / 2 - .3;
  for (const p of [mom, karl, kid, son]) { scene.add(p.root); p.pose(0); }
  const rain = particles(scene, 1200, [-10, 10, 0, 10, -30, 10], 0x9aa8bc, 1.2, .4, rnd);
  function update(k, t) { karl.root.position.set(lerp(2.2, -1.0, k), 0, lerp(doorZ + 3.5, doorZ + .2, k)); karl.root.rotation.y = -Math.PI / 2 - .4; karl.pose(k < .95 ? t * 5 : 0);
    camera.position.set(lerp(7, 6, k), lerp(1.7, 1.6, k), doorZ + lerp(9, 7.5, k)); camera.lookAt(-2.2, 1.4, doorZ); fall(rain, t, 9, -.5); }
  return { scene, camera, update, exposure: 1.1 };
}

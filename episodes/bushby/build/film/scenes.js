// Story scenes for sample v3, in the same dark cinematic grade as the globe:
// a walker built to human proportions (seen mostly as a silhouette), Patagonian steppe at dawn, the Darien canopy by day.
// Each make*() returns { scene, camera, update(k, t) } where k runs 0..1 across the shot and t is film time.
import * as THREE from 'three';

const rndOf = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
const lerp = (a, b, k) => a + (b - a) * k;

// ---------- the walker ----------
export function makeWalker({ cart = false, sack = false, sled = false, color = 0x15171b } = {}) {
  const m = new THREE.MeshStandardMaterial({ color, roughness: .75, metalness: 0 });
  const cap = (r, l) => { const g = new THREE.CapsuleGeometry(r, l, 6, 12); g.translate(0, -l / 2 - r * .6, 0); const o = new THREE.Mesh(g, m); o.castShadow = true; return o; };
  const root = new THREE.Group();
  const body = new THREE.Group(); body.position.y = .96; root.add(body);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.16, .42, 6, 12), m); torso.position.y = .33; torso.scale.set(1.08, 1, .72); torso.castShadow = true; body.add(torso);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(.05, .06, .14, 10), m); neck.position.y = .62; body.add(neck);
  const hips = new THREE.Mesh(new THREE.SphereGeometry(.15, 16, 12), m); hips.scale.set(1.05, .7, .8); hips.position.y = .02; body.add(hips);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.105, 20, 16), m); head.position.set(0, .72, .02); head.scale.set(.92, 1.08, 1); head.castShadow = true; body.add(head);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, .015, 24), m); brim.position.set(0, .79, .02); body.add(brim);   // a wide-brimmed hat
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(.085, .1, .09, 20), m); crown.position.set(0, .835, .02); body.add(crown);
  const pack = new THREE.Mesh(sack ? new THREE.SphereGeometry(.23, 16, 12) : new THREE.BoxGeometry(.32, .46, .2), m);
  pack.position.set(0, sack ? .42 : .36, sack ? -.24 : -.2); if (sack) pack.scale.set(1, 1.25, .8); pack.castShadow = true; body.add(pack);
  const limb = (x, y, up, lo, r) => { const a = new THREE.Group(); a.position.set(x, y, 0); const u = cap(r, up); a.add(u);
    const b = new THREE.Group(); b.position.y = -up - r * 1.2; a.add(b); b.add(cap(r * .9, lo)); return [a, b]; };
  const [hipL, kneeL] = limb(-.09, 0, .4, .4, .065), [hipR, kneeR] = limb(.09, 0, .4, .4, .065);
  const [shL, elL] = limb(-.21, .6, .27, .25, .048), [shR, elR] = limb(.21, .6, .27, .25, .048);
  body.add(hipL, hipR, shL, shR);
  let cartG = null;
  if (cart) {   // a two-wheeled hand cart pushed ahead of him
    cartG = new THREE.Group(); cartG.position.set(0, 0, .95); root.add(cartG);
    const box = new THREE.Mesh(new THREE.BoxGeometry(.62, .42, .9), m); box.position.y = .55; box.castShadow = true; cartG.add(box);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(.66, .06, .94), m); lid.position.y = .79; cartG.add(lid);
    for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.TorusGeometry(.25, .035, 8, 32), m); w.rotation.y = Math.PI / 2; w.position.set(s * .37, .28, .05); w.castShadow = true; cartG.add(w); cartG.userData['w' + s] = w;
      const sp = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .5, 6), m); sp.rotation.x = Math.PI / 2; w.add(sp); }
    for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .62, 6), m); h.rotation.x = Math.PI / 2 - .35; h.position.set(s * .25, .86, -.62); cartG.add(h); }
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .56, 6), m); bar.rotation.z = Math.PI / 2; bar.position.set(0, .96, -.9); cartG.add(bar);
  }
  if (sled) {   // a pulk sled on a harness, dragged behind
    const sg = new THREE.Group(); sg.position.set(0, 0, -2.0); root.add(sg);
    const tub = new THREE.Mesh(new THREE.BoxGeometry(.55, .28, 1.5), m); tub.position.y = .16; tub.castShadow = true; sg.add(tub);
    const load = new THREE.Mesh(new THREE.BoxGeometry(.5, .22, 1.2), m); load.position.y = .38; sg.add(load);
    for (const s2 of [-1, 1]) { const tr = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, 1.35, 4), m); tr.rotation.x = Math.PI / 2 - .38; tr.position.set(s2 * .17, .62, -1.3 + 2.0); sg.add(tr); }
  }
  function pose(ph) {   // ph: walk phase in radians
    const s = Math.sin(ph);
    hipL.rotation.x = -.42 * s; hipR.rotation.x = .42 * s;
    kneeL.rotation.x = .55 * Math.max(0, Math.sin(ph + 1.9)) + .05; kneeR.rotation.x = .55 * Math.max(0, Math.sin(ph + 1.9 + Math.PI)) + .05;
    body.position.y = .96 + .025 * Math.cos(2 * ph);
    if (cart) { shL.rotation.x = shR.rotation.x = -.62; elL.rotation.x = elR.rotation.x = -.5; body.rotation.x = .14; }
    else { shL.rotation.x = .32 * s; shR.rotation.x = -.32 * s; elL.rotation.x = elR.rotation.x = -.25; body.rotation.x = .06; }
    if (cartG) { cartG.userData.w1.rotation.x = cartG.userData['w-1'].rotation.x = -ph * .55; }
  }
  pose(0);
  return { root, pose };
}

// ---------- Patagonia at dawn ----------
export function makePatagonia(W, H) {
  const rnd = rndOf(11);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, W / H, .1, 2000);
  const HAZE = new THREE.Color(0xd9a77a);
  scene.fog = new THREE.Fog(HAZE, 60, 520);
  const SUN = new THREE.Vector3(-.35, .06, -1).normalize();
  // sky dome
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(1500, 64, 32), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { sun: { value: SUN } },
    vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: `uniform vec3 sun; varying vec3 vD; void main(){
      float y = max(vD.y, 0.); float s = max(dot(vD, sun), 0.);
      vec3 zen = vec3(.05,.09,.19), mid = vec3(.36,.36,.46), hor = vec3(.93,.62,.40);
      vec3 c = mix(hor, mid, smoothstep(0., .18, y)); c = mix(c, zen, smoothstep(.12, .7, y));
      c += vec3(1.,.58,.30) * pow(s, 10.) * .35 + vec3(1.,.75,.45) * pow(s, 160.) * .55 + vec3(1.,.93,.8) * smoothstep(.99965,.9998,s) * 1.1;
      gl_FragColor = vec4(c, 1.); }` })));
  // mountain ridges: three layers, farther ones paler (atmosphere)
  const ridge = (dist, height, col, seed, rough) => { const r = rndOf(seed), sh = new THREE.Shape(); const span = dist * 1.6, N = 220;
    const ph = [r() * 9, r() * 9, r() * 9]; sh.moveTo(-span, -5);
    for (let i = 0; i <= N; i++) { const x = -span + 2 * span * i / N, u = x / dist;
      let y = .55 * Math.sin(u * 3.1 + ph[0]) + .3 * Math.sin(u * 7.3 + ph[1]) + .18 * Math.abs(Math.sin(u * 17 + ph[2])) * rough + .08 * Math.sin(u * 41 + ph[1]) * rough;
      sh.lineTo(x, Math.max(0, (y + .6) * height)); }
    sh.lineTo(span, -5);
    const o = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshBasicMaterial({ color: col, fog: false })); o.position.set(0, 0, -dist); scene.add(o); };
  ridge(900, 70, 0x9d7b78, 3, 1.2); ridge(700, 46, 0x6a5560, 5, 1.0); ridge(480, 20, 0x3a3038, 9, .6);
  // ground
  const gg = new THREE.PlaneGeometry(1400, 1400, 160, 160); gg.rotateX(-Math.PI / 2);
  { const p = gg.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); if (Math.abs(x) > 7) p.setY(i, .35 * Math.sin(x * .07) * Math.cos(z * .05) + .2 * Math.sin(x * .21 + z * .13)); } gg.computeVertexNormals(); }
  const ground = new THREE.Mesh(gg, new THREE.MeshStandardMaterial({ color: 0x5a4430, roughness: 1 })); ground.receiveShadow = true; scene.add(ground);
  // the road, its shoulder line and centre dashes
  const road = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1400), new THREE.MeshStandardMaterial({ color: 0x232327, roughness: .85 })); road.rotation.x = -Math.PI / 2; road.position.set(0, .02, -600); road.receiveShadow = true; scene.add(road);
  const dashM = new THREE.MeshStandardMaterial({ color: 0xcbb37a, roughness: .6, emissive: 0x3a2e14 });
  for (let z = 10; z > -700; z -= 9) { const d = new THREE.Mesh(new THREE.PlaneGeometry(.12, 3.2), dashM); d.rotation.x = -Math.PI / 2; d.position.set(0, .03, z); scene.add(d); }
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.PlaneGeometry(.1, 1400), new THREE.MeshStandardMaterial({ color: 0x8c8370, roughness: .7 })); e.rotation.x = -Math.PI / 2; e.position.set(s * 3.0, .03, -600); scene.add(e); }
  // steppe tufts
  { const n = 5200, tuft = new THREE.IcosahedronGeometry(.3, 1); tuft.scale(1, .32, 1);
    { const p = tuft.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, Math.max(0, p.getY(i)) * (1 + .5 * Math.sin(i * 7.1))); tuft.computeVertexNormals(); }
    const im = new THREE.InstancedMesh(tuft, new THREE.MeshStandardMaterial({ color: 0x8a7444, roughness: 1 }), n); const o = new THREE.Object3D(), col = new THREE.Color();
    for (let i = 0; i < n; i++) { let x = (rnd() - .5) * 180; if (Math.abs(x) < 4) x += Math.sign(x || 1) * 4; o.position.set(x, 0, 14 - rnd() * 300); const sc = .4 + rnd() * 1.2; o.scale.set(sc * (1 + rnd() * .6), sc, sc); o.rotation.y = rnd() * 6; o.updateMatrix(); im.setMatrixAt(i, o.matrix);
      im.setColorAt(i, col.setHSL(.1 + rnd() * .03, .35 + rnd() * .15, .2 + rnd() * .14)); }
    im.castShadow = true; im.receiveShadow = true; scene.add(im); }
  // a fence line on the left, posts receding
  for (let z = 8; z > -300; z -= 4.5) { const p = new THREE.Mesh(new THREE.BoxGeometry(.08, 1.1, .08), new THREE.MeshStandardMaterial({ color: 0x241d16 })); p.position.set(-7.5, .55, z); p.castShadow = true; scene.add(p); }
  // light
  scene.add(new THREE.HemisphereLight(0x7d8fb8, 0x4a3524, .9));
  const sun = new THREE.DirectionalLight(0xffc28a, 3.2); sun.position.copy(SUN).multiplyScalar(60); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 140 }); sun.shadow.bias = -.0004;
  scene.add(sun, sun.target);
  const rim = new THREE.DirectionalLight(0xffb070, 1.4); rim.position.set(-6, 3, -20); scene.add(rim);
  // dust in the wind
  const dn = 500, dp = new Float32Array(dn * 3); for (let i = 0; i < dn; i++) dp.set([(rnd() - .5) * 30, rnd() * 3, 6 - rnd() * 40], i * 3);
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ size: 2, sizeAttenuation: false, color: 0xffd7a8, transparent: true, opacity: .35, depthWrite: false, blending: THREE.AdditiveBlending })); scene.add(dust);
  // him
  const wk = makeWalker({ cart: true }); wk.root.rotation.y = Math.PI; scene.add(wk.root);   // walking toward -z (the road ahead)
  function update(k, t) {
    const z = lerp(0, -5.5, k); wk.root.position.set(1.3, 0, z); wk.pose(t * 5.2);
    sun.target.position.set(1.3, 0, z); sun.position.copy(SUN).multiplyScalar(60).add(sun.target.position);
    camera.position.set(lerp(7.5, 6.6, k), lerp(1.3, 1.2, k), z + lerp(15, 13, k)); camera.lookAt(lerp(-.6, -.2, k), 1.9, z - 24);
    dust.position.x = (t * 2.2) % 30 - 15;
  }
  return { scene, camera, update, exposure: .95 };
}

// ---------- the Darien canopy by day ----------
export function makeJungle(W, H) {
  const rnd = rndOf(23);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, W / H, .05, 300);
  const FOG = new THREE.Color(0x203a2c); scene.background = FOG.clone(); scene.fog = new THREE.FogExp2(FOG, .075);
  const bark = new THREE.MeshStandardMaterial({ color: 0x2a2620, roughness: .95 });
  // floor
  const fg = new THREE.PlaneGeometry(200, 200, 120, 120); fg.rotateX(-Math.PI / 2);
  { const p = fg.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, .25 * Math.sin(x * .9 + z * .4) + .15 * Math.sin(z * 1.7)); } fg.computeVertexNormals(); }
  const floor = new THREE.Mesh(fg, new THREE.MeshStandardMaterial({ color: 0x241f15, roughness: 1 })); floor.receiveShadow = true; scene.add(floor);
  // trunks, kept off a winding corridor
  const path = z => 1.2 * Math.sin(z * .12);
  for (let i = 0; i < 170; i++) { const z = 6 - rnd() * 70; let x = (rnd() - .5) * 34; if (Math.abs(x - path(z)) < 1.8) x += (x > path(z) ? 2.2 : -2.2);
    const r = .12 + Math.pow(rnd(), 2) * .7, h = 30;
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(r * .7, r * 1.15, h, 14), bark); tr.position.set(x, h / 2 - .2, z); tr.rotation.z = (rnd() - .5) * .08; tr.castShadow = true; tr.receiveShadow = true; scene.add(tr);
    if (r > .45) for (let b = 0; b < 4; b++) { const bt = new THREE.Mesh(new THREE.BoxGeometry(.08, 1.4, r * 2.2), bark); const a = b * Math.PI / 2 + rnd(); bt.position.set(x + Math.cos(a) * r, .55, z + Math.sin(a) * r); bt.rotation.y = -a; bt.rotation.x = .25; scene.add(bt); } }
  // hanging vines
  for (let i = 0; i < 70; i++) { const x = (rnd() - .5) * 26, z = 4 - rnd() * 50, top = 14, bottom = 1 + rnd() * 5;
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(x, top, z), new THREE.Vector3(x + (rnd() - .5) * 1.5, (top + bottom) / 2, z + (rnd() - .5)), new THREE.Vector3(x + (rnd() - .5), bottom, z)]);
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(c, 20, .02 + rnd() * .03, 5), bark)); }
  // undergrowth: broad leaves (canvas texture with a midrib), instanced
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = 256; const x = cv.getContext('2d');
  x.fillStyle = '#fff'; x.beginPath(); x.moveTo(32, 2); x.bezierCurveTo(70, 70, 64, 190, 32, 254); x.bezierCurveTo(0, 190, -6, 70, 32, 2); x.fill();
  x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 2; x.beginPath(); x.moveTo(32, 6); x.lineTo(32, 250); x.stroke();
  const leafTex = new THREE.CanvasTexture(cv);
  const leafG = new THREE.PlaneGeometry(.32, 1.15); leafG.translate(0, .8, 0);
  const leafM = new THREE.MeshStandardMaterial({ color: 0x2f5a35, map: leafTex, alphaTest: .5, side: THREE.DoubleSide, roughness: .7 });
  { const n = 4200, im = new THREE.InstancedMesh(leafG, leafM, n), o = new THREE.Object3D(), col = new THREE.Color();
    for (let i = 0; i < n; i++) { const z = 7 - rnd() * 45; let xx = (rnd() - .5) * 22; if (Math.abs(xx - path(z)) < .9) xx += (xx > path(z) ? 1.1 : -1.1);
      o.position.set(xx, rnd() * .3, z); o.rotation.set(-.5 - rnd() * .9, rnd() * 6.3, (rnd() - .5) * .6); o.scale.setScalar(.6 + rnd() * 1.3); o.updateMatrix(); im.setMatrixAt(i, o.matrix);
      im.setColorAt(i, col.setHSL(.3 + rnd() * .05, .35, .12 + rnd() * .12)); }
    im.castShadow = true; im.receiveShadow = true; scene.add(im); }
  // light from the canopy: a sun high and slanted, plus visible shafts
  scene.add(new THREE.HemisphereLight(0x6f9a86, 0x1a140c, .55));
  const sun = new THREE.DirectionalLight(0xfff0c8, 2.6); sun.position.set(8, 30, -6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 80 }); scene.add(sun, sun.target);
  const shaftM = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: `varying vec2 vUv; void main(){ float a = smoothstep(0.,.5,vUv.x)*smoothstep(1.,.5,vUv.x) * smoothstep(0.,.35,vUv.y) * (.6+.4*vUv.y); gl_FragColor = vec4(vec3(.95,1.,.82) * a * .11, 1.); }` });
  for (let i = 0; i < 9; i++) { const s = new THREE.Mesh(new THREE.PlaneGeometry(.6 + rnd() * 1.4, 26), shaftM); s.position.set((rnd() - .5) * 12, 11, -3 - rnd() * 28); s.rotation.set(0, (rnd() - .5) * .6, .28); scene.add(s); }
  // drifting motes
  const dn = 260, dp = new Float32Array(dn * 3); for (let i = 0; i < dn; i++) dp.set([(rnd() - .5) * 14, rnd() * 6, 5 - rnd() * 30], i * 3);
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const motes = new THREE.Points(dg, new THREE.PointsMaterial({ size: 1.3, sizeAttenuation: false, color: 0xe8ffd0, transparent: true, opacity: .3, depthWrite: false, blending: THREE.AdditiveBlending })); scene.add(motes);
  // him, with a sack, no cart
  const wk = makeWalker({ sack: true }); wk.root.rotation.y = Math.PI; scene.add(wk.root);
  function update(k, t) {
    const z = lerp(0, -3.4, k), px = path(z);
    wk.root.position.set(px, .1, z); wk.root.rotation.y = Math.PI + Math.atan(1.2 * .12 * Math.cos(z * .12)); wk.pose(t * 4.4);
    sun.target.position.set(px, 0, z); sun.position.set(px + 8, 30, z - 6);
    camera.position.set(path(z + 7.5) + .9, 1.7, z + 7.8); camera.lookAt(px - .3, 1.5, z - 8);
    motes.position.y = Math.sin(t * .6) * .15; motes.position.x = Math.sin(t * .3) * .2;
  }
  return { scene, camera, update, exposure: 1.1 };
}

// ---------- Medellin: the night before, a table with the map, the compass and the sack ----------
export function makeDisguise(W, H) {
  const rnd = rndOf(41);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x050506);
  const camera = new THREE.PerspectiveCamera(30, W / H, .05, 50);
  // the table
  const wood = new THREE.MeshStandardMaterial({ color: 0x3a2618, roughness: .7 });
  const top = new THREE.Mesh(new THREE.BoxGeometry(2.4, .06, 1.4), wood); top.position.y = .75; top.receiveShadow = true; scene.add(top);
  // the map: paper with a drawn coast, contour lines and a pencil route
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 768; const x = cv.getContext('2d');
  x.fillStyle = '#d9cba8'; x.fillRect(0, 0, 1024, 768);
  for (let i = 0; i < 4000; i++) { x.fillStyle = `rgba(90,70,40,${rnd() * .05})`; x.fillRect(rnd() * 1024, rnd() * 768, 2, 2); }
  x.strokeStyle = 'rgba(70,90,110,.6)'; x.lineWidth = 3; x.beginPath(); x.moveTo(0, 210); for (let i = 0; i <= 40; i++) x.lineTo(i * 26, 210 + Math.sin(i * .7) * 30 + i * 3); x.stroke();
  x.strokeStyle = 'rgba(120,95,60,.35)'; x.lineWidth = 1.5;
  for (let r = 0; r < 9; r++) { x.beginPath(); for (let i = 0; i <= 60; i++) { const a = i / 60 * Math.PI * 2; const R = 60 + r * 24 + Math.sin(a * 3 + r) * 12; x.lineTo(640 + Math.cos(a) * R * 1.4, 470 + Math.sin(a) * R); } x.stroke(); }
  x.strokeStyle = 'rgba(160,40,30,.85)'; x.lineWidth = 4; x.setLineDash([14, 9]); x.beginPath(); x.moveTo(820, 740); x.bezierCurveTo(760, 560, 520, 520, 420, 360); x.bezierCurveTo(360, 280, 300, 250, 220, 240); x.stroke(); x.setLineDash([]);
  x.strokeStyle = 'rgba(40,30,20,.5)'; x.lineWidth = 2; x.strokeRect(20, 20, 984, 728);
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .82, 20, 20), new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(cv), roughness: .9 }));
  { const p = paper.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, .006 * Math.sin(p.getX(i) * 9) * Math.cos(p.getY(i) * 7)); paper.geometry.computeVertexNormals(); }
  paper.rotation.x = -Math.PI / 2; paper.rotation.z = .12; paper.position.set(-.15, .79, .02); paper.receiveShadow = true; scene.add(paper);
  // the compass
  const brass = new THREE.MeshStandardMaterial({ color: 0xb08a4a, metalness: .85, roughness: .3 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(.075, .078, .025, 48), brass); body.position.set(.32, .79, .1); body.castShadow = true; scene.add(body);
  const face = new THREE.Mesh(new THREE.CircleGeometry(.066, 48), new THREE.MeshStandardMaterial({ color: 0xe9e1cc, roughness: .5 })); face.rotation.x = -Math.PI / 2; face.position.set(.32, .8035, .1); scene.add(face);
  const needle = new THREE.Mesh(new THREE.ConeGeometry(.008, .11, 4), new THREE.MeshStandardMaterial({ color: 0xa0281e, roughness: .4 })); needle.rotation.set(-Math.PI / 2, 0, .4); needle.position.set(.32, .806, .1); scene.add(needle);
  // the sack, open, and a needle with thread on a folded shirt
  const sackG = new THREE.SphereGeometry(.26, 32, 20); { const p = sackG.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setXYZ(i, p.getX(i) * (1 + .12 * Math.sin(y * 20 + i)), Math.max(-.2, y) * 1.1, p.getZ(i) * (1 + .1 * Math.cos(i))); } sackG.computeVertexNormals(); }
  const sack = new THREE.Mesh(sackG, new THREE.MeshStandardMaterial({ color: 0x8a7350, roughness: 1 })); sack.position.set(.78, .98, -.25); sack.castShadow = true; scene.add(sack);
  const shirt = new THREE.Mesh(new THREE.BoxGeometry(.42, .04, .3), new THREE.MeshStandardMaterial({ color: 0x4a4038, roughness: 1 })); shirt.position.set(.55, .8, .32); shirt.rotation.y = -.3; shirt.castShadow = true; scene.add(shirt);
  const thread = new THREE.Mesh(new THREE.TorusGeometry(.03, .012, 8, 24), new THREE.MeshStandardMaterial({ color: 0x6b5a3a })); thread.rotation.x = Math.PI / 2; thread.position.set(.5, .83, .3); scene.add(thread);
  // one warm lamp
  scene.add(new THREE.AmbientLight(0x404a5a, .25));
  const lamp = new THREE.SpotLight(0xffc888, 5.5, 6, .55, .6, 1.6); lamp.position.set(-.5, 2.0, .2); lamp.target.position.set(.15, .75, .05); lamp.castShadow = true; lamp.shadow.mapSize.set(2048, 2048); lamp.shadow.bias = -.0004; scene.add(lamp, lamp.target);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.03, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, .85, .6).multiplyScalar(3), toneMapped: false })); bulb.position.copy(lamp.position);
  function update(k, t) {
    camera.position.set(lerp(-.55, -.35, k), lerp(2.05, 1.85, k), lerp(1.95, 1.6, k)); camera.lookAt(lerp(.1, .2, k), .78, -.02);
    needle.rotation.z = .4 + Math.sin(t * 1.3) * .08;
  }
  return { scene, camera, update, exposure: .8 };
}

// ---------- the Atrato river at night: floating under branches while a boat passes ----------
export function makeRiver(W, H) {
  const rnd = rndOf(57);
  const scene = new THREE.Scene(); const FOG = new THREE.Color(0x1c2b36); scene.background = FOG.clone(); scene.fog = new THREE.FogExp2(FOG, .028);
  const camera = new THREE.PerspectiveCamera(32, W / H, .05, 400);
  // water with moving ripples catching the moon
  const water = new THREE.Mesh(new THREE.PlaneGeometry(300, 300, 1, 1), new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, moon: { value: new THREE.Vector3(-40, 60, -150).normalize() }, fogC: { value: FOG } },
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform float time; uniform vec3 moon, fogC; varying vec3 vW;
      float h(vec2 p){ return sin(p.x*1.7 + time*.9)*.5 + sin(p.y*2.3 - time*.7 + p.x*.4)*.35 + sin((p.x+p.y)*4.1 + time*1.6)*.15; }
      void main(){ vec2 p = vW.xz; float e = .05; vec3 n = normalize(vec3(h(p) - h(p + vec2(e, 0.)), 6., h(p) - h(p + vec2(0., e))));
        vec3 V = normalize(cameraPosition - vW); vec3 R = reflect(-V, n);
        float s = pow(max(dot(R, moon), 0.), 260.) * 1.8 + pow(max(dot(R, moon), 0.), 24.) * .07;
        vec3 c = vec3(.006,.012,.016) + vec3(.75,.85,1.) * s;
        float d = length(cameraPosition - vW); c = mix(c, fogC, 1. - exp(-pow(.035 * d, 2.)));
        gl_FragColor = vec4(c, 1.); }` }));
  water.rotation.x = -Math.PI / 2; scene.add(water);
  // the banks: dark walls of trees on both sides
  const bark = new THREE.MeshStandardMaterial({ color: 0x0c110e, roughness: 1 });
  const leafM = new THREE.MeshStandardMaterial({ color: 0x0f1a13, roughness: 1 });
  for (const side of [-1, 1]) for (let i = 0; i < 90; i++) {
    const z = 10 - rnd() * 140, x = side * (11 + rnd() * 10), h = 12 + rnd() * 16;
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(.2, .45, h, 8), bark); tr.position.set(x, h / 2 - .5, z); scene.add(tr);
    const cr = new THREE.Mesh(new THREE.IcosahedronGeometry(3 + rnd() * 3.5, 1), leafM); cr.position.set(x - side * rnd() * 2, h - 1, z); cr.scale.y = .7; scene.add(cr); }
  scene.add(new THREE.HemisphereLight(0x6a86a8, 0x050806, 1.1));
  const moonL = new THREE.DirectionalLight(0xb8c8e8, .7); moonL.position.set(-12, 20, -40); scene.add(moonL);
  // the moon
  const moonD = new THREE.Mesh(new THREE.CircleGeometry(9, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(.95, .97, 1).multiplyScalar(2.2), fog: false, toneMapped: false }));
  moonD.position.set(-40, 60, -150); moonD.lookAt(0, 0, 0); scene.add(moonD);
  // him: a head and shoulders under a raft of branches and leaves, drifting
  const raft = new THREE.Group(); scene.add(raft);
  const headM = new THREE.MeshStandardMaterial({ color: 0x1a1612, roughness: .8 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(.11, 20, 16), headM); head.position.set(-.05, .1, .1); raft.add(head);
  for (let i = 0; i < 46; i++) { const br = new THREE.Mesh(new THREE.CylinderGeometry(.01, .016, .5 + rnd() * .6, 5), bark); br.position.set((rnd() - .5) * .9, .01 + rnd() * .06, (rnd() - .5) * .8); br.rotation.set(Math.PI / 2 + (rnd() - .5) * .3, rnd() * 6, (rnd() - .5) * .25); raft.add(br); }
  { const leaf = new THREE.PlaneGeometry(.12, .34); const im = new THREE.InstancedMesh(leaf, new THREE.MeshStandardMaterial({ color: 0x1d2c1d, side: THREE.DoubleSide, roughness: .9 }), 160); const o = new THREE.Object3D();
    for (let i = 0; i < 160; i++) { o.position.set((rnd() - .5) * 1.3, .05 + rnd() * .18, (rnd() - .5) * 1.2); o.rotation.set(-Math.PI / 2 + (rnd() - .5) * 1.2, rnd() * 6, rnd()); o.updateMatrix(); im.setMatrixAt(i, o.matrix); } raft.add(im); }
  // a boat with a lamp passing upstream in the distance
  const boat = new THREE.Group(); scene.add(boat);
  const hull = new THREE.Mesh(new THREE.BoxGeometry(1.2, .4, 6), new THREE.MeshStandardMaterial({ color: 0x0a0a0a })); hull.position.y = .1; boat.add(hull);
  const lampB = new THREE.Mesh(new THREE.SphereGeometry(.12, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, .8, .45).multiplyScalar(4), toneMapped: false })); lampB.position.set(0, 1.2, 2); boat.add(lampB);
  const pl = new THREE.PointLight(0xffc070, 60, 40, 1.3); pl.position.set(0, 1.4, 2); boat.add(pl);
  function update(k, t) {
    raft.position.set(lerp(.6, .3, k), Math.sin(t * 1.4) * .02, lerp(0, -2.4, k)); raft.rotation.y = .3 + Math.sin(t * .5) * .08;
    boat.position.set(-5.5, 0, lerp(-34, -9, k)); boat.rotation.z = Math.sin(t * 2) * .02;
    camera.position.set(lerp(4.2, 3.6, k), lerp(1.0, .85, k), raft.position.z + lerp(8.5, 7.2, k)); camera.lookAt(raft.position.x - 2.2, .4, raft.position.z - 10);
    water.material.uniforms.time.value = t;
  }
  return { scene, camera, update, exposure: 1.0 };
}

// ---------- the cell (Boca de Cupe): one window, a light shaft, tally marks counting the days ----------
export function makeCell(W, H) {
  const rnd = rndOf(7);
  const cell = new THREE.Scene(); cell.background = new THREE.Color(0x030405); cell.fog = new THREE.Fog(0x030405, 7, 16);
  const cam = new THREE.PerspectiveCamera(32, W / H, .05, 40);
  const wall = new THREE.MeshStandardMaterial({ color: 0x3a3e46, roughness: .95 }), floor = new THREE.MeshStandardMaterial({ color: 0x1d1f23, roughness: .9 });
  const room = new THREE.Group();
  const box = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; room.add(o); return o; };
  box(6, .1, 7, floor, 0, -.05, 0); box(6, 3.4, .2, wall, 0, 1.7, -3); box(.2, 3.4, 7, wall, -3, 1.7, 0); box(6, .2, 7, wall, 0, 3.4, 0);
  box(.2, 3.4, 2.6, wall, 3, 1.7, -1.7); box(.2, 3.4, 3.2, wall, 3, 1.7, 1.9); box(.2, 1.9, 1.2, wall, 3, .95, .2); box(.2, .9, 1.2, wall, 3, 2.95, .2);
  for (let i = 0; i < 4; i++) box(.06, .6, .06, new THREE.MeshStandardMaterial({ color: 0x111111 }), 2.95, 2.2, -.3 + i * .3);
  box(1.0, .45, 2.2, new THREE.MeshStandardMaterial({ color: 0x24272c, roughness: .8 }), -2.3, .225, -1.6);
  cell.add(room); cell.add(new THREE.AmbientLight(0x6f86a8, .55));
  const sun = new THREE.SpotLight(0xffd9a0, 520, 18, .22, .5, 1.5); sun.position.set(7, 5.5, -.05); sun.target.position.set(.3, 0, -.05);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0005; cell.add(sun, sun.target);
  const fill = new THREE.PointLight(0x7f97bd, 10, 11, 1.4); fill.position.set(-.8, 2.6, 2.4); cell.add(fill);
  const L = sun.position, win = [[3, 1.9, -.4], [3, 1.9, .3], [3, 2.5, .3], [3, 2.5, -.4]].map(v => new THREE.Vector3(...v));
  const flo = win.map(w => { const d = w.clone().sub(L); const k = -L.y / d.y; return L.clone().add(d.multiplyScalar(k)); });
  const pos = [], fy = [];
  for (let i = 0; i < 4; i++) { const a = win[i], b = win[(i + 1) % 4], c = flo[(i + 1) % 4], d = flo[i]; for (const [v, f] of [[a, 0], [b, 0], [c, 1], [a, 0], [c, 1], [d, 1]]) { pos.push(v.x, v.y, v.z); fy.push(f); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('f', new THREE.Float32BufferAttribute(fy, 1));
  cell.add(new THREE.Mesh(g, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: `attribute float f; varying float vF; void main(){ vF = f; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying float vF; void main(){ gl_FragColor = vec4(vec3(1.,.84,.58) * .018 * (1.-vF*.5), 1.); }` })));
  const e0 = win[0].clone().lerp(win[2], .5), e1 = flo[0].clone().lerp(flo[2], .5);
  const dn = 260, dp = new Float32Array(dn * 3); for (let i = 0; i < dn; i++) { const k = rnd(); const p = e0.clone().lerp(e1, k); p.x += (rnd() - .5) * (.3 + k * .8); p.y += (rnd() - .5) * (.3 + k * .8); p.z += (rnd() - .5) * (.3 + k * .8); dp.set([p.x, p.y, p.z], i * 3); }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ size: 2, sizeAttenuation: false, color: 0xffe2b0, transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false })); cell.add(dust);
  const tally = new THREE.Group(); cell.add(tally);
  const tallyM = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, .72, .32).multiplyScalar(1.3), toneMapped: false });
  for (let d = 0; d < 18; d++) { const grp = Math.floor(d / 5), k = d % 5; const m = new THREE.Mesh(new THREE.BoxGeometry(.03, .42, .01), tallyM);
    if (k < 4) m.position.set(-.55 + grp * .62 + k * .1, 1.75, -2.89); else { m.position.set(-.55 + grp * .62 + .15, 1.75, -2.89); m.rotation.z = 1.0; m.scale.y = 1.35; } m.visible = false; tally.add(m); }
  function update(k, t, raw) {
    const ke = k; cam.position.set(lerp(-1.6, -1.2, ke), lerp(1.5, 1.45, ke), lerp(4.6, 3.6, ke)); cam.lookAt(lerp(.6, .5, ke), 1.05, -1.6);
    const n = Math.min(18, 1 + Math.floor(Math.min(1, Math.max(0, (raw - .077) / .846)) * 18));   // keeps pace with the day count in the overlay tally.children.forEach((m, i) => m.visible = i < n);
    dust.rotation.y = Math.sin(t * .3) * .01; dust.position.y = Math.sin(t * .7) * .03;
  }
  return { scene: cell, camera: cam, update, exposure: 1 };
}

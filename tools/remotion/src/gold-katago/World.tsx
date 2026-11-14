import React, { useMemo, useLayoutEffect, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useCurrentFrame, useVideoConfig } from "remotion";
import * as T from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import type { Scene } from "./types";
const gold = "#dfad4f";
const hash = (i: number) => {
  const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => {
  x = clamp(x);
  return x * x * (3 - 2 * x);
};
type V = [number, number, number];
const vertex = `attribute float size;attribute float energy;varying float vEnergy;void main(){vEnergy=energy;vec4 p=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp(size*1700./max(.5,-p.z),1.,120.);gl_Position=projectionMatrix*p;}`;
const fragment = `uniform vec3 color;varying float vEnergy;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;float halo=exp(-d*d*6.5)*.4;float core=exp(-d*d*100.)*1.65;vec3 c=color*halo+vec3(1.,.94,.79)*core;gl_FragColor=vec4(c*vEnergy,(halo+core)*vEnergy);}`;
function Points({
  positions,
  sizes,
  energies,
  color = gold,
}: {
  positions: number[];
  sizes: number[];
  energies: number[];
  color?: string;
}) {
  const geo = useMemo(() => {
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
    g.setAttribute("size", new T.Float32BufferAttribute(sizes, 1));
    g.setAttribute("energy", new T.Float32BufferAttribute(energies, 1));
    return g;
  }, [positions, sizes, energies]);
  useEffect(() => () => geo.dispose(), [geo]);
  const uniforms = useMemo(
    () => ({ color: { value: new T.Color(color) } }),
    [color],
  );
  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={T.AdditiveBlending}
      />
    </points>
  );
}
function Filament({
  points,
  radius = 0.018,
  active = false,
}: {
  points: V[];
  radius?: number;
  active?: boolean;
}) {
  const geom = useMemo(
    () =>
      new T.TubeGeometry(
        new T.CatmullRomCurve3(points.map((p) => new T.Vector3(...p))),
        48,
        radius,
        6,
        false,
      ),
    [points, radius],
  );
  const halo = useMemo(
    () =>
      new T.TubeGeometry(
        new T.CatmullRomCurve3(points.map((p) => new T.Vector3(...p))),
        48,
        radius * 3.8,
        5,
        false,
      ),
    [points, radius],
  );
  useEffect(
    () => () => {
      geom.dispose();
      halo.dispose();
    },
    [geom, halo],
  );
  return (
    <>
      <mesh geometry={geom}>
        <meshStandardMaterial
          color={active ? "#fff0bb" : "#c5933d"}
          metalness={0.85}
          roughness={0.24}
          emissive={active ? "#ffda84" : "#b67b2d"}
          emissiveIntensity={active ? 1.8 : 0.32}
        />
      </mesh>
      <mesh geometry={halo}>
        <meshBasicMaterial
          color={active ? "#fbc568" : "#ba8536"}
          transparent
          opacity={active ? 0.08 : 0.02}
          blending={T.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}
function CinematicPass() {
  const { gl, scene, camera } = useThree();
  useLayoutEffect(() => {
    const original = gl.render.bind(gl),
      composer = new EffectComposer(gl);
    composer.setSize(1920, 1080);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new T.Vector2(960, 540),
      0.52,
      0.38,
      0.85,
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    bloom.setSize(960, 540);
    let inside = false;
    gl.render = (s, c) => {
      if (inside) {
        original(s, c);
        return;
      }
      inside = true;
      try {
        composer.render();
      } finally {
        inside = false;
      }
    };
    return () => {
      gl.render = original;
      composer.dispose();
    };
  }, [gl, scene, camera]);
  return null;
}
function Stars({ t }: { t: number }) {
  const a = useMemo(() => {
    const p: number[] = [],
      s: number[] = [],
      e: number[] = [];
    for (let i = 0; i < 950; i++) {
      p.push(
        (hash(i * 3) - 0.5) * 65,
        (hash(i * 3 + 1) - 0.5) * 38,
        (hash(i * 3 + 2) - 0.5) * 70,
      );
      s.push(0.025 + hash(i + 200) * 0.13);
      e.push(0.12 + hash(i + 30) * 0.7);
    }
    return { p, s, e };
  }, []);
  return (
    <group rotation={[0, t * 0.004, 0]}>
      <Points positions={a.p} sizes={a.s} energies={a.e} color="#cbbd97" />
    </group>
  );
}
function Camera({ t, proof, id }: { t: number; proof: boolean; id: string }) {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const p = clamp(t / (proof ? 10 : 13)),
      q = ease(p);
    if (proof || id === "hook" || id === "ending") {
      // A true dolly and orbit: foreground points cross the lens; tree reveals in depth.
      const angle = 0.82 - q * 0.65,
        dist = 5.8 + q * 6.3;
      camera.position.set(
        Math.sin(angle) * dist,
        1.35 + q * 4.7,
        Math.cos(angle) * dist,
      );
      camera.lookAt(0, 0.55 + q * 0.4, -0.2);
    } else if (
      [
        "input",
        "policy",
        "value",
        "update",
        "decision",
        "ownership",
        "global",
        "limits",
      ].includes(id)
    ) {
      const angle = 0.28 - q * 0.22;
      camera.position.set(
        Math.sin(angle) * 10.8,
        8.7 - q * 0.7,
        Math.cos(angle) * 9.5,
      );
      camera.lookAt(-0.2, 0.25, 0);
    } else if (["tree", "selection", "leaf", "budget"].includes(id)) {
      const angle = -0.24 + q * 0.48,
        dist = id === "leaf" ? 13 - q * 2 : 13;
      camera.position.set(Math.sin(angle) * dist, 4.5, Math.cos(angle) * dist);
      camera.lookAt(0, 1.9, 0);
    } else {
      const angle = 0.45 - q * 0.6;
      camera.position.set(
        Math.sin(angle) * 13,
        5.6 + Math.sin(t * 0.1) * 0.7,
        Math.cos(angle) * 13,
      );
      camera.lookAt(0, 1.35, 0);
    }
    if (camera instanceof T.PerspectiveCamera) {
      camera.fov = 43;
      camera.near = 0.05;
      camera.far = 100;
      camera.updateProjectionMatrix();
    }
  }, [camera, t, proof, id]);
  return null;
}
function Lattice({ t }: { t: number }) {
  const points = useMemo(() => {
    const p: number[] = [],
      s: number[] = [],
      e: number[] = [];
    for (let x = 0; x < 19; x++)
      for (let z = 0; z < 19; z++) {
        const xx = (x - 9) * 0.37,
          zz = (z - 9) * 0.37;
        p.push(xx, Math.sin(x * 0.45 + z * 0.28) * 0.045, zz);
        s.push(0.15 + hash(x * 19 + z) * 0.065);
        e.push(0.5 + hash(x + z * 19) * 0.45);
      }
    return { p, s, e };
  }, []);
  const paths = useMemo(() => {
    const a: V[][] = [];
    for (let i = 0; i < 3; i++) {
      const dest: V = [(i - 1) * 2.0, 1.6, -0.6 - i * 0.25];
      a.push([[0, 0.05, 0.4], [(i - 1) * 0.6, 0.7, 0.1], dest]);
      for (let j = 0; j < 3; j++) {
        const end: V = [dest[0] + (j - 1) * 0.7, 2.9, -1.2 + j * 0.4];
        a.push([dest, [dest[0] + (j - 1) * 0.4, 2.3, -1], end]);
        for (let k = 0; k < 2; k++)
          a.push([
            end,
            [end[0] + (k - 0.5) * 0.18, 3.4, -1.1],
            [end[0] + (k - 0.5) * 0.42, 3.9, -1.3 + (k - 0.5) * 0.4],
          ]);
      }
    }
    return a;
  }, []);
  const state = useMemo(() => {
    const p: number[] = [],
      s: number[] = [],
      e: number[] = [];
    for (let i = 0; i < paths.length; i++) {
      const end = paths[i][2];
      p.push(...end);
      s.push(i < 3 ? 0.42 : 0.28);
      e.push(1.25);
    }
    return { p, s, e };
  }, [paths]);
  const moving = useMemo(() => {
    const p: number[] = [],
      s: number[] = [],
      e: number[] = [];
    paths.forEach((path, i) => {
      const curve = new T.CatmullRomCurve3(
        path.map((v) => new T.Vector3(...v)),
      );
      const u = (t * 0.32 + i * 0.137) % 1;
      for (let j = 0; j < 12; j++) {
        const q = curve.getPoint(clamp(u - j * 0.009));
        p.push(q.x, q.y, q.z);
        s.push(0.12 * (1 - j / 16));
        e.push(1.5 * (1 - j / 14));
      }
    });
    return { p, s, e };
  }, [paths, t]);
  return (
    <group>
      <Points positions={points.p} sizes={points.s} energies={points.e} />
      {paths.map((p, i) => (
        <Filament
          key={"b" + i}
          points={p}
          radius={i % 4 === 0 ? 0.028 : 0.016}
          active={i === 0 || i === 2}
        />
      ))}
      <Points positions={state.p} sizes={state.s} energies={state.e} />
      <Points
        positions={moving.p}
        sizes={moving.s}
        energies={moving.e}
        color="#ffe1a0"
      />
    </group>
  );
}
function Mist({ t }: { t: number }) {
  const a = useMemo(() => {
    const p: number[] = [],
      s: number[] = [],
      e: number[] = [];
    for (let i = 0; i < 1400; i++) {
      const ang = hash(i) * Math.PI * 2,
        r = 0.3 + hash(i + 100) * 7.5;
      p.push(
        Math.cos(ang + t * 0.035) * r,
        0.03 + hash(i + 80) * 0.5,
        Math.sin(ang + t * 0.035) * r,
      );
      s.push(0.025 + hash(i + 190) * 0.06);
      e.push(0.16 + hash(i + 330) * 0.5);
    }
    return { p, s, e };
  }, [t]);
  return <Points positions={a.p} sizes={a.s} energies={a.e} />;
}
export const SpatialWorld: React.FC<{
  proof?: boolean;
  scene: Scene;
  object: T.Group | null;
  at?: number;
  model?: {
    stones: [number, number, boolean][];
    candidates: [number, number][];
  };
  labels?: Record<string, string>;
}> = ({ proof = false, scene, object, at, model, labels }) => {
  const frame = useCurrentFrame(),
    { fps } = useVideoConfig(),
    t = at ?? (proof ? frame / fps : frame / fps - scene.start);
  return (
    <>
      <CinematicPass />
      <color attach="background" args={["#030508"]} />
      <fogExp2 attach="fog" args={["#030508", 0.028]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[-4, 8, 6]} color="#fff4d1" intensity={2} />
      <pointLight position={[3, 3, -4]} color="#f0b74c" intensity={15} />
      <Camera t={t} proof={proof} id={scene.id} />
      <Stars t={frame / fps} />
      <Mist t={t} />
      {proof || ["hook", "ending"].includes(scene.id) ? (
        <Lattice t={t} />
      ) : model && labels ? (
        <KnowledgeGraph scene={scene} t={t} model={model} labels={labels} />
      ) : null}
      {object && (proof || ["hook", "ending"].includes(scene.id)) && (
        <primitive object={object} position={[0, 0, 0]} scale={1} />
      )}
    </>
  );
};

type GraphNode = { p: V; label?: string; white?: boolean; radius?: number };
type GraphEdge = { a: number; b: number; active?: boolean; curve?: V };
type Graph = { nodes: GraphNode[]; edges: GraphEdge[] };
function Label3D({
  text,
  position,
  height = 0.4,
  color = "#f4e8d1",
}: {
  text: string;
  position: V;
  height?: number;
  color?: string;
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas"),
      ctx = canvas.getContext("2d")!;
    ctx.font = "500 64px GoldSerif";
    canvas.width = Math.ceil(ctx.measureText(text).width + 50);
    canvas.height = 106;
    ctx.font = "500 64px GoldSerif";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, 53);
    const tex = new T.CanvasTexture(canvas);
    tex.colorSpace = T.SRGBColorSpace;
    return tex;
  }, [text, color]);
  return (
    <sprite
      position={position}
      scale={[(texture.image.width / texture.image.height) * height, height, 1]}
    >
      <spriteMaterial
        map={texture}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </sprite>
  );
}
function buildGraph(
  id: string,
  m: { stones: [number, number, boolean][]; candidates: [number, number][] },
  L: Record<string, string>,
): Graph {
  const nodes: GraphNode[] = [],
    edges: GraphEdge[] = [];
  const add = (p: V, label?: string, white = false, radius = 0.26) => {
    nodes.push({ p, label, white, radius });
    return nodes.length - 1;
  };
  const connect = (a: number, b: number, active = false, curve?: V) =>
    edges.push({ a, b, active, curve });
  const boardIds = [
    "input",
    "policy",
    "value",
    "update",
    "decision",
    "ownership",
    "global",
    "limits",
  ];
  if (boardIds.includes(id)) {
    for (let z = 0; z < 9; z++)
      for (let x = 0; x < 9; x++)
        add([(x - 4) * 0.8 - 3.3, 0, (z - 4) * 0.8], undefined, false, 0.12);
    for (let z = 0; z < 9; z++)
      for (let x = 0; x < 9; x++) {
        const i = z * 9 + x;
        if (x < 8) connect(i, i + 1);
        if (z < 8) connect(i, i + 9);
      }
    m.stones.forEach(([x, z, black]) => {
      nodes[z * 9 + x].white = !black;
      nodes[z * 9 + x].radius = 0.33;
    });
    if (["policy", "update", "decision"].includes(id))
      m.candidates.forEach(([x, z], i) => {
        nodes[z * 9 + x].label = String.fromCharCode(65 + i);
        nodes[z * 9 + x].radius = 0.35;
      });
    if (id === "global") {
      const mid = 40;
      [10, 16, 64, 70].forEach((i) =>
        connect(i, mid, true, [
          nodes[i].p[0] * 0.55 - 1.3,
          1.3,
          nodes[i].p[2] * 0.55,
        ]),
      );
    }
    return { nodes, edges };
  }
  if (["tree", "selection", "leaf", "budget"].includes(id)) {
    const tree = (ox: number, deep: boolean) => {
      const root = add([ox, 3.6, 0], L.now, false, 0.43);
      for (let i = 0; i < 3; i++) {
        const child = add(
          [ox + (i - 1) * 2.1, 2.15, (i - 1) * 0.75],
          String.fromCharCode(65 + i),
          true,
          0.32,
        );
        connect(root, child, i === 1);
        if (deep)
          for (let j = 0; j < 3; j++) {
            const p = nodes[child].p,
              leaf = add(
                [p[0] + (j - 1) * 0.65, 0.65, p[2] + (j - 1) * 0.8],
                undefined,
                false,
                0.25,
              );
            connect(child, leaf, i === 1 && j === 1);
            if (id === "tree" && i === 1 && j === 1)
              for (let k = 0; k < 2; k++) {
                const q = nodes[leaf].p,
                  great = add(
                    [q[0] + (k - 0.5) * 0.7, 0.1, q[2] + (k - 0.5) * 0.7],
                    undefined,
                    true,
                    0.19,
                  );
                connect(leaf, great);
              }
          }
      }
    };
    if (id === "budget") {
      tree(-3.2, false);
      tree(3.2, true);
    } else tree(0, true);
    return { nodes, edges };
  }
  if (["identity", "loop", "targets"].includes(id)) {
    for (let l = 0; l < 4; l++)
      for (let r = 0; r < 3; r++)
        for (let z = 0; z < 3; z++)
          add(
            [(l - 1.5) * 2.0, 0.5 + r * 0.85, (z - 1) * 1.1],
            undefined,
            false,
            0.24,
          );
    for (let l = 0; l < 3; l++)
      for (let r = 0; r < 9; r++)
        for (let k = 0; k < 3; k++)
          connect(l * 9 + r, (l + 1) * 9 + ((r + k * 2) % 9), k === 1);
    return { nodes, edges };
  }
  if (id === "training") {
    const ls = [L.trainGame, L.trainTarget, L.trainLearn, L.trainNew],
      pos: V[] = [
        [-3, 2.7, 0.6],
        [3, 2.7, -0.3],
        [3, 0.15, 0.6],
        [-3, 0.15, -0.3],
      ];
    pos.forEach((p, i) => add(p, ls[i], false, 0.55));
    for (let i = 0; i < 4; i++) {
      const a = nodes[i].p,
        b = nodes[(i + 1) % 4].p;
      connect(i, (i + 1) % 4, true, [
        (a[0] + b[0]) * 0.5,
        (a[1] + b[1]) * 0.5,
        (a[2] + b[2]) * 0.5 + 0.9,
      ]);
    }
    return { nodes, edges };
  }
  if (id === "dashboard") {
    add([-3, 1.65, 0], L.winLabel + " 63%", false, 0.22);
    let previous = -1;
    for (let i = 0; i <= 100; i++) {
      const a = -Math.PI / 2 + (i / 100) * Math.PI * 2;
      const n = add(
        [-3 + Math.cos(a) * 1.2, 1.65 + Math.sin(a) * 1.2, 0],
        undefined,
        false,
        0.045,
      );
      if (previous >= 0) connect(previous, n, i <= 63);
      previous = n;
    }
    add([3, 2.65, 0], L.scoreLabel + " +2.1", false, 0.12);
    const left = add([1.5, 1.2, 0], undefined, false, 0.05),
      right = add([4.5, 1.2, 0], undefined, false, 0.05);
    connect(left, right);
    for (let i = 0; i < 3; i++) {
      const x = 1.5 + i * 1.5,
        a = add([x, 0.98, 0], ["-5", "0", "+5"][i], false, 0.04),
        b = add([x, 1.38, 0], undefined, false, 0.04);
      connect(a, b);
    }
    add([3 + (2.1 / 5) * 1.5, 1.2, 0], undefined, false, 0.4);
    return { nodes, edges };
  }
  if (id === "calibration") {
    for (let i = 0; i < 10; i++) {
      const a = (i / 9 - 0.5) * 2.2;
      add(
        [Math.sin(a) * 4, 1.4 + Math.cos(a) * 0.6, Math.cos(a) * 1.6],
        undefined,
        false,
        0.35,
      );
    }
    return { nodes, edges };
  }
  if (id === "rules" || id === "payoff") {
    const labs =
      id === "rules"
        ? [L.rules, L.komi, L.model, L.effort]
        : [L.s1, L.s2, L.s3];
    labs.forEach((v, i) =>
      add(
        [(i - (labs.length - 1) / 2) * 2.6, 1.6, (i % 2) * 0.9],
        v,
        false,
        0.65,
      ),
    );
    for (let i = 1; i < nodes.length; i++) connect(i - 1, i, true);
    return { nodes, edges };
  }
  return { nodes, edges };
}
function LearningCore({ t }: { t: number }) {
  const a = useMemo(() => {
    const p: number[] = [],
      s: number[] = [],
      e: number[] = [];
    for (let i = 0; i < 420; i++) {
      const u = (i + 0.5) / 420,
        y = 1 - 2 * u,
        r = Math.sqrt(1 - y * y),
        ang = i * 2.399963;
      const rr = 0.75 + 0.25 * hash(i);
      p.push(Math.cos(ang) * r * rr, y * rr + 1.35, Math.sin(ang) * r * rr);
      s.push(0.045 + hash(i + 50) * 0.045);
      e.push(0.28 + hash(i + 100) * 0.35);
    }
    return { p, s, e };
  }, []);
  return (
    <group rotation={[0, t * 0.12, 0]}>
      <Points positions={a.p} sizes={a.s} energies={a.e} />
    </group>
  );
}
export function KnowledgeGraph({
  scene,
  model,
  labels,
  t,
}: {
  scene: Scene;
  model: {
    stones: [number, number, boolean][];
    candidates: [number, number][];
  };
  labels: Record<string, string>;
  t: number;
}) {
  const graph = useMemo(
    () => buildGraph(scene.id, model, labels),
    [scene.id, model, labels],
  );
  const board = [
    "input",
    "policy",
    "value",
    "update",
    "decision",
    "ownership",
    "global",
    "limits",
  ].includes(scene.id);
  const cloud = useMemo(() => {
    const p: number[] = [],
      s: number[] = [],
      e: number[] = [],
      white: number[] = [],
      ws: number[] = [],
      we: number[] = [];
    graph.nodes.forEach((n, i) => {
      const show =
        scene.id !== "tree" ||
        (n.radius === 0.32
          ? t >= scene.cues.edge
          : n.radius === 0.25
            ? t >= scene.cues.reply
            : n.radius === 0.19
              ? t >= scene.cues.again
              : true);
      if (n.white) {
        white.push(...n.p);
        ws.push(n.radius ?? 0.3);
        we.push(show ? 1.0 : 0);
      } else {
        p.push(...n.p);
        s.push(n.radius ?? 0.3);
        e.push(show ? (board && n.radius === 0.12 ? 0.36 : 1.0) : 0);
      }
      if (scene.id === "calibration" && i === 9) e[e.length - 1] = 0.12;
    });
    return { p, s, e, white, ws, we };
  }, [graph, board, scene.id, scene.cues, t]);
  const edgePaths = useMemo(
    () =>
      graph.edges.map((edge) => {
        const a = graph.nodes[edge.a].p,
          b = graph.nodes[edge.b].p,
          mid: V = edge.curve ?? [
            (a[0] + b[0]) / 2,
            (a[1] + b[1]) / 2 + (board ? 0 : 0.15),
            (a[2] + b[2]) / 2 + (board ? 0 : 0.32),
          ];
        return [a, mid, b];
      }),
    [graph, board],
  );
  const travel = useMemo(() => {
    const p: number[] = [],
      s: number[] = [],
      e: number[] = [];
    graph.edges
      .filter((v, i) => {
        if (["tree", "selection", "leaf"].includes(scene.id)) {
          if (scene.id === "tree" && t < scene.cues.edge) return false;
          const active = graph.edges.filter((e) => e.active),
            step =
              scene.id === "tree" && t < scene.cues.reply
                ? 0
                : Math.floor(t / 0.9) % 2,
            chosen = active[scene.id === "leaf" ? 1 - step : step];
          return v === chosen;
        }
        if (["identity", "loop", "targets"].includes(scene.id))
          return i % 27 === (Math.floor(t * 0.9) % 9) * 3 + 1;
        return v.active || (!board && i % 11 === 0);
      })
      .forEach((edge, i) => {
        const a = graph.nodes[edge.a].p,
          b = graph.nodes[edge.b].p,
          mid = edge.curve ?? [
            (a[0] + b[0]) / 2,
            (a[1] + b[1]) / 2 + 0.15,
            (a[2] + b[2]) / 2 + 0.32,
          ];
        const curve = new T.CatmullRomCurve3([
            new T.Vector3(...a),
            new T.Vector3(...mid),
            new T.Vector3(...b),
          ]),
          u = ["tree", "selection", "leaf"].includes(scene.id)
            ? (t / 0.9) % 1
            : (t * 0.4 + i * 0.14) % 1;
        for (let j = 0; j < 9; j++) {
          const q = curve.getPoint(
            scene.id === "leaf"
              ? 1 - clamp(u - j * 0.014)
              : clamp(u - j * 0.014),
          );
          p.push(q.x, q.y, q.z);
          s.push(0.16 * (1 - j / 11));
          e.push(1.3 * (1 - j / 10));
        }
      });
    return { p, s, e };
  }, [graph, board, scene.id, scene.cues, t]);
  return (
    <group
      position={
        ["loop", "targets"].includes(scene.id)
          ? [-2.4, 0, 0]
          : ["tree", "selection", "leaf"].includes(scene.id)
            ? [0, -0.4, 0]
            : [0, 0, 0]
      }
      scale={
        ["tree", "selection", "leaf"].includes(scene.id)
          ? 1.35
          : scene.id === "identity"
            ? 1.4
            : 1
      }
    >
      {["value", "ownership"].includes(scene.id) &&
        graph.nodes.slice(0, 81).map((n, i) => {
          const v =
            (Math.sin((i % 9) * 0.7 + Math.floor(i / 9) * 0.45) +
              Math.cos(Math.floor(i / 9) * 0.8 - (i % 9) * 0.3)) *
            0.36;
          return (
            <mesh
              key={"ownership" + i}
              position={[n.p[0], -0.014, n.p[2]]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[0.73, 0.73]} />
              <meshBasicMaterial
                color={v > 0 ? "#e2b965" : "#d1dae3"}
                transparent
                opacity={0.07 + Math.abs(v) * 0.2}
                depthWrite={false}
              />
            </mesh>
          );
        })}{" "}
      {scene.id === "training" && <LearningCore t={t} />}{" "}
      {["rules", "payoff"].includes(scene.id) &&
        graph.nodes.map((n, i) => {
          const on =
            scene.id === "payoff"
              ? t > [scene.cues.first, scene.cues.second, scene.cues.third][i]
              : i === Math.floor(t / 3) % 4;
          return (
            <group
              key={"orb" + i}
              position={n.p}
              rotation={[
                0.2 * Math.sin(t * 0.2 + i),
                0.25 * Math.sin(t * 0.13 + i),
                0.08 * Math.sin(t * 0.2),
              ]}
            >
              <mesh>
                <torusGeometry args={[0.53, 0.027, 12, 80]} />
                <meshStandardMaterial
                  color="#d2a254"
                  metalness={0.9}
                  roughness={0.22}
                  emissive="#d1a04d"
                  emissiveIntensity={on ? 1.2 : 0.18}
                />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0.35, 0]}>
                <torusGeometry args={[0.46, 0.012, 8, 64]} />
                <meshStandardMaterial
                  color="#ac7937"
                  metalness={0.8}
                  roughness={0.3}
                  emissive="#b88537"
                  emissiveIntensity={on ? 0.5 : 0.08}
                />
              </mesh>
            </group>
          );
        })}{" "}
      {graph.edges
        .filter(
          (edge) =>
            scene.id !== "tree" ||
            (graph.nodes[edge.b].radius === 0.32
              ? t >= scene.cues.edge
              : graph.nodes[edge.b].radius === 0.25
                ? t >= scene.cues.reply
                : graph.nodes[edge.b].radius === 0.19
                  ? t >= scene.cues.again
                  : true),
        )
        .map((edge) => {
          const i = graph.edges.indexOf(edge);
          return (
            <Filament
              key={i}
              points={edgePaths[i]}
              radius={board ? 0.006 : edge.active ? 0.026 : 0.013}
              active={
                ["identity", "loop", "targets"].includes(scene.id)
                  ? i % 27 === (Math.floor(t * 0.9) % 9) * 3 + 1
                  : scene.id === "training"
                    ? false
                    : edge.active
              }
            />
          );
        })}
      {board &&
        graph.nodes.map((n, i) =>
          n.radius === 0.33 ? (
            <mesh key={"state" + i} position={n.p}>
              <sphereGeometry args={[0.12, 24, 16]} />
              <meshStandardMaterial
                color={n.white ? "#f3eedb" : "#080b10"}
                emissive={n.white ? "#d7cbb0" : "#000000"}
                emissiveIntensity={0.12}
                metalness={0.2}
                roughness={0.3}
              />
            </mesh>
          ) : null,
        )}
      {board &&
        graph.nodes.map((n, i) =>
          !n.white && n.radius === 0.33 ? (
            <mesh
              key={"rim" + i}
              position={n.p}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <torusGeometry args={[0.17, 0.018, 8, 32]} />
              <meshStandardMaterial
                color="#e5be73"
                emissive="#c18b36"
                emissiveIntensity={0.8}
                metalness={0.8}
                roughness={0.24}
              />
            </mesh>
          ) : null,
        )}
      <Points positions={cloud.p} sizes={cloud.s} energies={cloud.e} />
      <Points
        positions={cloud.white}
        sizes={cloud.ws}
        energies={cloud.we}
        color="#f4ecdb"
      />
      <Points positions={travel.p} sizes={travel.s} energies={travel.e} />
      {graph.nodes.map((n, i) =>
        n.label &&
        (scene.id !== "tree" || n.radius !== 0.32 || t >= scene.cues.edge) ? (
          <Label3D
            key={i}
            text={n.label}
            position={[n.p[0], n.p[1] + (board ? 0.36 : 0.65), n.p[2]]}
            height={board ? 0.38 : 0.4}
          />
        ) : null,
      )}
      {scene.id === "limits" && (
        <Label3D text="?" position={[-2.65, 1.2, 0]} height={1.3} />
      )}
    </group>
  );
}

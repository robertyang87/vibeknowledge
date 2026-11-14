import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ThreeCanvas } from "@remotion/three";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Composition,
  Still,
  continueRender,
  delayRender,
  cancelRender,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import * as T from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import timeline from "../../../../episodes/katago-gold/copy/timeline.json";
import captions from "../../../../episodes/katago-gold/copy/captions.json";
import boardModel from "../../../../episodes/katago-gold/project/board-model.json";
import { drawSpatialOverlay } from "./draw";
import { SpatialWorld } from "./World";
import type { FilmData, Model } from "./types";
const data = { ...timeline, captions } as unknown as FilmData,
  model = boardModel as unknown as Model;
export const GoldFilm: React.FC<{ cover: boolean }> = ({ cover }) => {
  const canvas = useRef<HTMLCanvasElement>(null),
    frame = useCurrentFrame(),
    { fps } = useVideoConfig(),
    t = frame / fps;
  const [object, setObject] = useState<T.Group | null>(null),
    [handle] = useState(() =>
      delayRender("Load Blender geometry and localized fonts", {
        timeoutInMilliseconds: 120000,
      }),
    );
  useEffect(() => {
    const load = new Promise<T.Group>((resolve, reject) =>
      new GLTFLoader().load(
        staticFile("gold-katago/abstract/katago-spatial-lattice.glb"),
        (g) => resolve(g.scene),
        undefined,
        reject,
      ),
    );
    Promise.all([
      load,
      new FontFace(
        "GoldSerif",
        `url('${staticFile("gold-katago/fonts/serif.woff2")}')`,
      ).load(),
      new FontFace(
        "GoldSerif",
        `url('${staticFile("gold-katago/fonts/serif-bold.woff2")}')`,
        { weight: "700" },
      ).load(),
    ])
      .then(([scene, regular, bold]) => {
        document.fonts.add(regular);
        document.fonts.add(bold);
        scene.traverse((o) => {
          if (o instanceof T.Mesh) {
            const materials = Array.isArray(o.material)
              ? o.material
              : [o.material];
            materials.forEach((m) => {
              if (m.name.includes("filament")) {
                m.transparent = true;
                m.opacity = 0.15;
                m.depthWrite = false;
              }
            });
          }
        });
        setObject(scene);
        continueRender(handle);
      })
      .catch(cancelRender);
  }, [handle]);
  useLayoutEffect(() => {
    if (object && canvas.current)
      drawSpatialOverlay(canvas.current.getContext("2d")!, t, data, cover);
  }, [object, t, cover]);
  const scene =
    data.scenes.find((s) => t >= s.start && t < s.start + s.duration) ??
    data.scenes[0];
  const world = (
    <ThreeCanvas
      width={1920}
      height={1080}
      camera={{ fov: 43, position: [5, 5, 10] }}
      gl={{ antialias: true, alpha: false }}
    >
      <SpatialWorld
        at={cover ? 7 : undefined}
        proof={cover}
        scene={scene}
        object={object}
        model={model}
        labels={data.labels}
      />
    </ThreeCanvas>
  );
  return (
    <AbsoluteFill style={{ background: "#030508" }}>
      {object && world}
      <canvas
        ref={canvas}
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0, width: 1920, height: 1080 }}
      />
      {!cover && (
        <Audio src={staticFile("gold-katago/mix.wav")} premountFor={fps} />
      )}
    </AbsoluteFill>
  );
};
export const GoldKataGoCompositions: React.FC = () => (
  <>
    <Composition
      id="KataGoGold"
      component={GoldFilm}
      durationInFrames={9045}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ cover: false }}
    />
    <Still
      id="KataGoGoldCover"
      component={GoldFilm}
      width={1920}
      height={1080}
      defaultProps={{ cover: true }}
    />
  </>
);

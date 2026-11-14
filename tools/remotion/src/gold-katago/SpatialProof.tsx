import React, { useEffect, useState } from "react";
import { ThreeCanvas } from "@remotion/three";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  staticFile,
  useCurrentFrame,
} from "remotion";
import * as T from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { SpatialWorld } from "./World";
import timeline from "../../../../episodes/katago-gold/copy/timeline.json";
import type { Scene } from "./types";
export const SpatialProof: React.FC = () => {
  const frame = useCurrentFrame(),
    [object, setObject] = useState<T.Group | null>(null);
  const [handle] = useState(() => delayRender("Load Blender 3D geometry"));
  useEffect(() => {
    new GLTFLoader().load(
      staticFile("gold-katago/abstract/katago-spatial-lattice.glb"),
      (g) => {
        g.scene.traverse((o) => {
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
        setObject(g.scene);
        continueRender(handle);
      },
      undefined,
      (e) => {
        console.error(e);
        continueRender(handle);
      },
    );
  }, [handle]);
  return (
    <AbsoluteFill style={{ background: "#030508" }}>
      <ThreeCanvas
        width={1920}
        height={1080}
        camera={{ position: [7, 3, 7], fov: 43 }}
        gl={{ antialias: true, alpha: false }}
      >
        <SpatialWorld
          proof
          scene={timeline.scenes[0] as unknown as Scene}
          object={object}
        />
      </ThreeCanvas>
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 65,
          color: "#f7eed9",
          fontSize: 36,
          fontFamily: "serif",
          textShadow: "0 0 12px #ac8039",
        }}
      >
        {frame < 130
          ? "KataGo"
          : frame < 220
            ? timeline.labels.proofSecond
            : timeline.labels.proofThird}
      </AbsoluteFill>
      <Audio src={staticFile("gold-katago/mix.wav")} />
    </AbsoluteFill>
  );
};

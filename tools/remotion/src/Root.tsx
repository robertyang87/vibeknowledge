import { Composition } from "remotion";
import { SpatialProof } from "./gold-katago/SpatialProof";
import { GoldKataGoCompositions } from "./gold-katago/Film";
import { MyComposition } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <GoldKataGoCompositions />
      <MyComposition />
      <Composition
        id="KataGoSpatialProof"
        component={SpatialProof}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

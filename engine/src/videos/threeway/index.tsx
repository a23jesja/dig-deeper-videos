// "One scene, three ways": variants 1 and 2 (registered through PuppetCompositions in ../puppet/index.tsx).
import React from "react";
import { Composition } from "remotion";
import { ThreeWay1 } from "./One";
import { ThreeWay2 } from "./Two";
import { FRAMES, FPS, W, H } from "./scene";
export const ThreeWayCompositions: React.FC = () => (
  <>
    <Composition id="ThreeWay1" component={ThreeWay1} durationInFrames={FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="ThreeWay2" component={ThreeWay2} durationInFrames={FRAMES} fps={FPS} width={W} height={H} />
  </>
);

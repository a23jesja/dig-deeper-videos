// The puppet experiment's compositions (registered from Root.tsx with one import and one line).
import React from "react";
import { Composition } from "remotion";
import { PuppetTest } from "./Puppet";
import { PuppetTestToday } from "./Today";
import { FRAMES, FPS, W, H } from "./act";
import { ThreeWayCompositions } from "../threeway";
export const PuppetCompositions: React.FC = () => (
  <>
    <Composition id="PuppetTest" component={PuppetTest} durationInFrames={FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="PuppetTestToday" component={PuppetTestToday} durationInFrames={FRAMES} fps={FPS} width={W} height={H} />
    <ThreeWayCompositions />
  </>
);

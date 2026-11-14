// Entry for the 2D stick-figure films only (the approved look). Render with ENTRY=src/index2d.ts, or
// `npx remotion render src/index2d.ts Mona2D out/x.mp4`.
import React from "react";
import { Composition } from "remotion";
import { Mona2D, Mona2DThumb } from "./videos/style2d/Mona2D";
import { TOTAL as MONA2D_TOTAL } from "./videos/style2d/scenes";

export const Root2d: React.FC = () => (
  <>
    <Composition id="Mona2D" component={Mona2D} durationInFrames={MONA2D_TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="Mona2DThumb" component={Mona2DThumb} durationInFrames={3} fps={30} width={1080} height={1920} />
  </>
);

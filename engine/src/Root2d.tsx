// Entry for the 2D stick-figure films only (the approved look). Render with ENTRY=src/index2d.ts, or
// `npx remotion render src/index2d.ts Mona2D out/x.mp4`.
import React from "react";
import { Composition } from "remotion";
import { Dance, DanceThumb, Mona2D, Mona2DThumb, Titanic1, Titanic1Thumb } from "./videos/style2d/Mona2D";
import { DANCE_TOTAL } from "./videos/style2d/dance";
import { TITANIC1_TOTAL } from "./videos/style2d/titanic1";
import { TOTAL as MONA2D_TOTAL } from "./videos/style2d/scenes";

export const Root2d: React.FC = () => (
  <>
    <Composition id="Mona2D" component={Mona2D} durationInFrames={MONA2D_TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="Mona2DThumb" component={Mona2DThumb} durationInFrames={3} fps={30} width={1080} height={1920} />
    <Composition id="Titanic1" component={Titanic1} durationInFrames={TITANIC1_TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="Titanic1Thumb" component={Titanic1Thumb} durationInFrames={3} fps={30} width={1080} height={1920} />
    <Composition id="Dance" component={Dance} durationInFrames={DANCE_TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="DanceThumb" component={DanceThumb} durationInFrames={3} fps={30} width={1080} height={1920} />
  </>
);

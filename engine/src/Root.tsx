import React from "react";
import { Composition } from "remotion";
// The video code after the look was frozen (Jesper, 21 Nov 2026: "Riktning A Knopp är godkänd och fryst"): flat 2D, direction A Knopp.
// Directions B and C, the 3D card figures, the 3D sets and every film built on them are removed; git tag fore-platt-2d builds them all.
import { FlatStyle, FSW, FSH, FLAT_FRAMES } from "./craft/FlatStyle";
import { FlatMotionA, FLAT_MOTION_FRAMES } from "./craft/FlatMotion";
// the older flat films (style2d: no 3D, no card figures)
import { Dance, DanceThumb, Mona2D, Mona2DThumb, Titanic1, Titanic1Thumb } from "./videos/style2d/Mona2D";
import { DANCE_TOTAL } from "./videos/style2d/dance";
import { TITANIC1_TOTAL } from "./videos/style2d/titanic1";
import { TOTAL as MONA2D_TOTAL } from "./videos/style2d/scenes";

export const Root: React.FC = () => (
  <>
    <Composition id="FlatStyle" component={FlatStyle} durationInFrames={FLAT_FRAMES} fps={30} width={FSW} height={FSH} />
    <Composition id="FlatMotionA" component={FlatMotionA} durationInFrames={FLAT_MOTION_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Mona2D" component={Mona2D} durationInFrames={MONA2D_TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="Mona2DThumb" component={Mona2DThumb} durationInFrames={3} fps={30} width={1080} height={1920} />
    <Composition id="Titanic1" component={Titanic1} durationInFrames={TITANIC1_TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="Titanic1Thumb" component={Titanic1Thumb} durationInFrames={3} fps={30} width={1080} height={1920} />
    <Composition id="Dance" component={Dance} durationInFrames={DANCE_TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="DanceThumb" component={DanceThumb} durationInFrames={3} fps={30} width={1080} height={1920} />
  </>
);

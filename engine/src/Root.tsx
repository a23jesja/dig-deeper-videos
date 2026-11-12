import React from "react";
import { Composition } from "remotion";
import { Sheet } from "./videos/emu/Sheet";
import { EmuShort, EmuLong, EMU_FRAMES, EMU_LONG_FRAMES } from "./videos/emu/Emu";

export const Root: React.FC = () => (
  <>
    <Composition id="EmuShort" component={EmuShort} durationInFrames={EMU_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="EmuLong" component={EmuLong} durationInFrames={EMU_LONG_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Sheet" component={Sheet} durationInFrames={120} fps={30} width={2400} height={2400} />
  </>
);

import React from "react";
import { Composition } from "remotion";
import { Sheet } from "./videos/emu/Sheet";
import { EmuShort, EMU_FRAMES } from "./videos/emu/Emu";

export const Root: React.FC = () => (
  <>
    <Composition id="EmuShort" component={EmuShort} durationInFrames={EMU_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Sheet" component={Sheet} durationInFrames={120} fps={30} width={2400} height={2400} />
  </>
);

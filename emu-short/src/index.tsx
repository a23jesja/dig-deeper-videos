import React from "react";
import { Composition, registerRoot } from "remotion";
import { EmuShort, EMU_FRAMES } from "./videos/emu/Emu";
const Root: React.FC = () => <Composition id="EmuShort" component={EmuShort} durationInFrames={EMU_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);

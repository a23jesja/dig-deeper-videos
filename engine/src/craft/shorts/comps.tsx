// The Shorts as compositions: a film holds functions, so it is handed to the stage here and never through composition props.
import React from "react";
import { Stage } from "../stage/Stage";
import { ROME_PEE } from "./romePee";
import { PIRATE_PLANK } from "./piratePlank";
export const RomePee: React.FC = () => <Stage film={ROME_PEE} />;
export const ROME_PEE_FRAMES = Math.round(ROME_PEE.seconds * ROME_PEE.fps);
export const PiratePlank: React.FC = () => <Stage film={PIRATE_PLANK} />;
export const PIRATE_PLANK_FRAMES = Math.round(PIRATE_PLANK.seconds * PIRATE_PLANK.fps);

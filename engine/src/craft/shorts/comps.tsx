// The Shorts as compositions: a film holds functions, so it is handed to the stage here and never through composition props.
import React from "react";
import { Stage } from "../stage/Stage";
import { ROME_PEE } from "./romePee";
export const RomePee: React.FC = () => <Stage film={ROME_PEE} />;
export const ROME_PEE_FRAMES = Math.round(ROME_PEE.seconds * ROME_PEE.fps);

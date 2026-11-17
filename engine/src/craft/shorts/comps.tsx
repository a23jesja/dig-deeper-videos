// The Shorts as compositions: a film holds functions, so it is handed to the stage here and never through composition props.
import React from "react";
import { Stage, Thumbs } from "../stage/Stage";
import { ROME_PEE } from "./romePee";
import { PIRATE_PLANK } from "./piratePlank";
import { BLACK_FLAG } from "./blackFlag";
import { NERO_FIDDLE } from "./neroFiddle";
import { GRIP_SHEET, GRIP_SHEET_2 } from "./gripSheet";
export const RomePee: React.FC = () => <Stage film={ROME_PEE} />;
export const ROME_PEE_FRAMES = Math.round(ROME_PEE.seconds * ROME_PEE.fps);
export const PiratePlank: React.FC = () => <Stage film={PIRATE_PLANK} />;
export const PIRATE_PLANK_FRAMES = Math.round(PIRATE_PLANK.seconds * PIRATE_PLANK.fps);
export const PiratePlankThumbs: React.FC = () => <Thumbs film={PIRATE_PLANK} />;
export const RomePeeThumbs: React.FC = () => <Thumbs film={ROME_PEE} />;
export const BlackFlag: React.FC = () => <Stage film={BLACK_FLAG} />;
export const BLACK_FLAG_FRAMES = Math.round(BLACK_FLAG.seconds * BLACK_FLAG.fps);
export const BlackFlagThumbs: React.FC = () => <Thumbs film={BLACK_FLAG} />;
export const NeroFiddle: React.FC = () => <Stage film={NERO_FIDDLE} />;
export const NERO_FIDDLE_FRAMES = Math.round(NERO_FIDDLE.seconds * NERO_FIDDLE.fps);
export const NeroFiddleThumbs: React.FC = () => <Thumbs film={NERO_FIDDLE} />;
// the grip sheet (granskning/rattningar/grepp.jpg): one still shot per held prop, use and view
export const GripSheet: React.FC = () => <Stage film={GRIP_SHEET} />;
export const GRIP_SHEET_FRAMES = Math.round(GRIP_SHEET.seconds * GRIP_SHEET.fps);
export const GripSheet2: React.FC = () => <Stage film={GRIP_SHEET_2} />;
export const GRIP_SHEET_2_FRAMES = Math.round(GRIP_SHEET_2.seconds * GRIP_SHEET_2.fps);

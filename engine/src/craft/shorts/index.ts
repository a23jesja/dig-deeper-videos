// Every Short of the craft kit by name (scripts/film_info.mjs reads the shots from here; Root.tsx registers the compositions).
import type { Film } from "../stage/film";
import { ROME_PEE } from "./romePee";
import { PIRATE_PLANK } from "./piratePlank";
import { BLACK_FLAG } from "./blackFlag";
import { NERO_FIDDLE } from "./neroFiddle";
import { GRIP_SHEET, GRIP_SHEET_2, GRIP_SHEET_3, GRIP_SHEET_4, LOOK_BLACKBEARD } from "./gripSheet";
import { BB_HOOK_A, BB_HOOK_B, BB_HOOK_C } from "./blackbeardHooks";
export const FILMS: Record<string, { film: Film; comp: string }> = { "rome-pee": { film: ROME_PEE, comp: "RomePee" }, "pirate-plank": { film: PIRATE_PLANK, comp: "PiratePlank" }, "black-flag": { film: BLACK_FLAG, comp: "BlackFlag" }, "nero-fiddle": { film: NERO_FIDDLE, comp: "NeroFiddle" } };
FILMS["grip-sheet"] = { film: GRIP_SHEET, comp: "GripSheet" };
FILMS["grip-sheet-2"] = { film: GRIP_SHEET_2, comp: "GripSheet2" };
FILMS["grip-sheet-3"] = { film: GRIP_SHEET_3, comp: "GripSheet3" };
FILMS["grip-sheet-4"] = { film: GRIP_SHEET_4, comp: "GripSheet4" };
FILMS["look-blackbeard"] = { film: LOOK_BLACKBEARD, comp: "LookBlackbeard" };
FILMS["blackbeard-hook-a"] = { film: BB_HOOK_A, comp: "BlackbeardHookA" };
FILMS["blackbeard-hook-b"] = { film: BB_HOOK_B, comp: "BlackbeardHookB" };
FILMS["blackbeard-hook-c"] = { film: BB_HOOK_C, comp: "BlackbeardHookC" };
export { captions } from "../stage/film";
export { auditGrips } from "../stage/grips";

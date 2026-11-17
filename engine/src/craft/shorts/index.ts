// Every Short of the craft kit by name (scripts/film_info.mjs reads the shots from here; Root.tsx registers the compositions).
import type { Film } from "../stage/film";
import { ROME_PEE } from "./romePee";
import { PIRATE_PLANK } from "./piratePlank";
import { BLACK_FLAG } from "./blackFlag";
import { NERO_FIDDLE } from "./neroFiddle";
export const FILMS: Record<string, { film: Film; comp: string }> = { "rome-pee": { film: ROME_PEE, comp: "RomePee" }, "pirate-plank": { film: PIRATE_PLANK, comp: "PiratePlank" }, "black-flag": { film: BLACK_FLAG, comp: "BlackFlag" }, "nero-fiddle": { film: NERO_FIDDLE, comp: "NeroFiddle" } };
export { captions } from "../stage/film";

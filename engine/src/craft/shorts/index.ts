// Every Short of the craft kit by name (scripts/film_info.mjs reads the shots from here; Root.tsx registers the compositions).
import type { Film } from "../stage/film";
import { ROME_PEE } from "./romePee";
import { PIRATE_PLANK } from "./piratePlank";
export const FILMS: Record<string, { film: Film; comp: string }> = { "rome-pee": { film: ROME_PEE, comp: "RomePee" }, "pirate-plank": { film: PIRATE_PLANK, comp: "PiratePlank" } };

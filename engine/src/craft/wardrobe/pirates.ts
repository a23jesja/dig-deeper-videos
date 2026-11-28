// The pirates of Roberts' bedtime (pirate week, Short 1, the plan b3ccac2 and the reviewer's yes): four people on the one skeleton, each with
// his own headwear, hair, face, build and clothes (the wardrobe's rules 9 and 10; the cap, monocle and moustache are Sir's alone). Built from the
// kit's parts; Roberts' hair tied back (queue) and the red feather in his hat (Johnson 1724) were added to kit.ts with the reviewer's yes, 28 Nov.
import type { Look } from "../designs/common";
import type { Kit } from "./kit";

/** Bartholomew Roberts: tall and slim, clean-shaven, a black tricorn, a crimson coat over a light waistcoat */
export const ROBERTS_KIT: Kit = { name: "roberts", hat: "tricorn", hair: "queue", beard: "none", top: "coat",
  body: { w: 0.92, d: 0.9, arm: [21, 18, 16], leg: [24, 21, 18], hem: -34 }, col: { hat: "#16121a", hair: "#2a1d16", feather: "#c41e2a" } };
/** the rum pirate (Daniel's voice): short and wide, a red spotted scarf, a ginger beard, a striped shirt */
export const RUM_KIT: Kit = { name: "rum", hat: "scarf", hair: "none", beard: "full", top: "stripes",
  body: { w: 1.22, d: 1.15, arm: [25, 21, 18], leg: [27, 23, 20] }, col: { scarf: "#b8322b", beard: "#b8602a", beardHi: "#df8a4c", stripe: "#7a2e2e" } };
/** the young pirate (Will's voice): a small teen, bareheaded, messy straw-blond hair, an oversized blue shirt */
export const YOUNG_KIT: Kit = { name: "young", hat: "none", hair: "messy", beard: "none", top: "shirt", eyes: 1.18,
  body: { w: 1.0, d: 0.98, arm: [24, 22, 20], leg: [23, 20, 18], hem: -28 }, col: { hair: "#d8b25a" } };
/** a third pirate for the crew where the voice speaks of it (the reviewer's condition a): broad, bald, dark stubble, a green shirt */
export const GUNNER_KIT: Kit = { name: "gunner", hat: "none", hair: "none", beard: "stubble", top: "shirt",
  body: { w: 1.12, d: 1.08, arm: [25, 22, 19], leg: [27, 23, 20], hem: -30 }, col: { stubble: "rgba(40,30,25,0.22)" } };

const look = (col: Record<string, string>, kit: Kit): Look => ({ col, mono: false, pipe: false, moustache: false, kit } as unknown as Look);
export const ROBERTS_LOOK = look({ coat: "#9e1b2a", vest: "#e8d9a8", shirt: "#f6f0e2", tie: "#f6f0e2", trous: "#231f26", shoe: "#16110e", skin: "#e8b28c", nose: "#d4876f", hair: "#2a1d16", collar: "#f6f0e2" }, ROBERTS_KIT);
export const RUM_LOOK = look({ coat: "#efe6d4", vest: "#efe6d4", shirt: "#efe6d4", tie: "#efe6d4", trous: "#5a4632", shoe: "#2e211a", skin: "#e0a27c", nose: "#d2806a", hair: "#b8602a", collar: "#efe6d4" }, RUM_KIT);
export const YOUNG_LOOK = look({ coat: "#4d74b0", vest: "#4d74b0", shirt: "#4d74b0", tie: "#4d74b0", trous: "#7a6a52", shoe: "#3a2a22", skin: "#f3c6a0", nose: "#e99b80", hair: "#d8b25a", collar: "#4d74b0" }, YOUNG_KIT);
export const GUNNER_LOOK = look({ coat: "#5a7a44", vest: "#5a7a44", shirt: "#5a7a44", tie: "#5a7a44", trous: "#3c3328", shoe: "#221913", skin: "#c58e68", nose: "#b5735a", hair: "#2a1f19", collar: "#5a7a44" }, GUNNER_KIT);
/** heights (m): Roberts tall, the rum pirate short and wide, the young pirate small, the gunner between */
export const PIRATE_HEIGHTS = { roberts: 1.86, rum: 1.62, young: 1.48, gunner: 1.78 };

// The dinner's three people in the wardrobe (the cloud session, 25 Nov): the captain (a tricorn, a long coat with gold buttons, a full beard,
// broad), the sailor (a scarf tied round his head, a striped shirt, stubble, long and thin) and the boy (small, bareheaded, messy hair, a
// child's face with larger eyes, a shirt too big for him). Each is a Look that carries its kit; heights in metres for the scenes.
import type { Look } from "../designs/common";
import type { Kit } from "./kit";

export const CAPTAIN_KIT: Kit = { name: "captain", hat: "tricorn", hair: "none", beard: "full", top: "coat",
  body: { w: 1.24, d: 1.18, arm: [26, 22, 19], leg: [30, 26, 22], hem: -34 }, col: { hat: "#231d24", beard: "#4b3222", beardHi: "#7a5638" } };
export const SAILOR_KIT: Kit = { name: "sailor", hat: "scarf", hair: "none", beard: "stubble", top: "stripes",
  body: { w: 0.8, d: 0.84, arm: [20, 17, 15], leg: [23, 20, 17] }, col: { scarf: "#b8322b", stubble: "rgba(80,55,45,0.16)", stripe: "#2c4a7a" } };
export const BOY_KIT: Kit = { name: "boy", hat: "none", hair: "messy", beard: "none", top: "shirt", eyes: 1.22,
  body: { w: 1.02, d: 1.0, arm: [25, 23, 21], leg: [24, 21, 19], hem: -26 }, col: { hair: "#9c5a28" } };

const look = (col: Record<string, string>, kit: Kit): Look => ({ col, mono: false, pipe: false, moustache: false, kit } as unknown as Look);
export const CAPTAIN_LOOK = look({ coat: "#7b2230", vest: "#e6d6b0", shirt: "#f6f0e2", tie: "#f6f0e2", trous: "#2b2630", shoe: "#1e1714", skin: "#eab48f", nose: "#d98a73", hair: "#4b3222", collar: "#f6f0e2" }, CAPTAIN_KIT);
export const SAILOR_LOOK = look({ coat: "#f3efe6", vest: "#f3efe6", shirt: "#f3efe6", tie: "#f3efe6", trous: "#c2ab7c", shoe: "#3a2a22", skin: "#d9a079", nose: "#c98468", hair: "#2c2420", collar: "#f3efe6" }, SAILOR_KIT);
export const BOY_LOOK = look({ coat: "#efe8d8", vest: "#efe8d8", shirt: "#efe8d8", tie: "#efe8d8", trous: "#6b4f37", shoe: "#3a2a22", skin: "#f6c9a4", nose: "#ec9f86", hair: "#9c5a28", collar: "#efe8d8" }, BOY_KIT);
/** heights (m): the captain as before, the sailor a head taller than the boy and taller than the captain, the boy small */
export const KIT_HEIGHTS = { captain: 1.75, sailor: 1.9, boy: 1.42 };

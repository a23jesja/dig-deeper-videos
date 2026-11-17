// The Looks of the cast: Sir Digsworth and the side characters, all on the one card figure of cast.ts and the one skeleton of rig.ts.
// A new figure is a new Look: sizes, colours, a hat, clothes. No new drawing code.
// Heads are a quarter larger than in the first sheets (Jesper, 2026-11-16: so that the faces read at phone size): every Look's head
// and head bone carry that size in their own numbers.
import { Props } from "./rig";
import { Look, drawCast, drawHat } from "./cast";
import type { Design } from "./designs/common";

const TWEED = "#c2904c", TEAL = "#12a594";
/** Sir Digsworth: the jointed card figure with long legs, a waxed moustache no wider than his shoulders, a flared tweed jacket and a
 *  teal waistcoat, bow tie and cap band (the accent that holds against a colourful world) */
export const SIR: Look = {
  id: "sir",
  P: { thigh: 235, shin: 225, ankle: 26, foot: 132, hipW: 50, shW: 96, spine: 255, shDrop: 26, neck: 30, head: 250, upper: 150, fore: 140, hand: 84 },
  head: { a: 108, b: 115, H: 250 }, skin: "#f6cfa6", brow: "#4f3019",
  hat: "cap", hatCol: TWEED, hatBand: TEAL, hair: { col: "#6a4a2c", kind: "back" },
  mous: { col: "#4f3019", span: 1.24, curl: 1, w: 16 }, monocle: true, pipe: true,
  top: "jacket", coat: TWEED, accent: TEAL, weave: true,
  rows: [[-78, 104, 76, 80], [-10, 84, 66, 68], [70, 70, 58, 54], [170, 86, 68, 60], [232, 100, 58, 58], [258, 50, 36, 40]],
  legs: "trousers", trous: "#463a37", feet: "shoes", spats: true, sleeve: "long", arm: [30, 24, 17], leg: [34, 25, 17],
};
const ROMAN: Props = { thigh: 205, shin: 195, ankle: 24, foot: 126, hipW: 58, shW: 108, spine: 270, shDrop: 28, neck: 22, head: 240, upper: 146, fore: 134, hand: 88 };
export const BAKER: Look = {
  id: "baker", P: ROMAN, head: { a: 118, b: 115, H: 232, jaw: 1.02, round: 0.45 }, skin: "#eebf96", brow: "#4a3020",
  hat: "band", hatCol: "#fbf6ea", hair: { col: "#4a3020", kind: "short" },
  top: "tunic", coat: "#f2dc9c", accent: "#c8402f", apron: "#fdf9ef", belt: "#a05a34",
  rows: [[-150, 118, 88, 92], [-20, 112, 96, 86], [100, 104, 96, 78], [200, 110, 80, 70], [246, 112, 62, 62], [270, 56, 40, 44]],
  legs: "bare", feet: "sandals", sleeve: "short", arm: [28, 22, 16], leg: [36, 26, 17],
};
export const SOLDIER: Look = {
  id: "soldier", P: { ...ROMAN, thigh: 220, shin: 210, shW: 112, spine: 280 }, head: { a: 108, b: 112, H: 232, jaw: 1.04, round: 0.1 }, skin: "#e9b48a", brow: "#3a2a1e",
  hat: "helmet", hatCol: "#b9c3cd", mous: { col: "#3a2a1e", span: 0.8, curl: 0, w: 11 },
  top: "tunic", coat: "#cf3b30", accent: "#e23a2e", armour: true, belt: "#8a5a36",
  rows: [[-120, 112, 84, 88], [-10, 104, 86, 80], [90, 100, 84, 74], [200, 116, 84, 72], [254, 118, 64, 64], [280, 54, 40, 44]],
  legs: "bare", feet: "sandals", sleeve: "short", arm: [30, 24, 17], leg: [38, 27, 18],
};
export const MERCHANT: Look = {
  id: "merchant", P: { ...ROMAN, thigh: 190, shin: 180, spine: 280, hipW: 74, shW: 118, upper: 140, fore: 126 }, head: { a: 125, b: 125, H: 238, jaw: 1.12, round: 0.6 }, skin: "#ecc9a6", brow: "#6b4424",
  hat: "none", hair: { col: "#6b4424", kind: "bald" }, beard: "#6b4424",
  top: "tunic", coat: "#f1e6c6", accent: "#7a2f4a", cloak: "#8a2f58", belt: "#c9a03c",
  rows: [[-290, 138, 112, 112], [-150, 150, 138, 116], [0, 164, 176, 118], [110, 152, 168, 104], [205, 126, 110, 84], [254, 122, 70, 70], [280, 62, 46, 50]],
  legs: "bare", feet: "sandals", sleeve: "short", arm: [34, 27, 19], leg: [44, 31, 20],
};
/** a crusading knight: bucket helm, mail, a white surcoat with a red cross */
export const KNIGHT: Look = {
  id: "knight", P: { ...ROMAN, thigh: 225, shin: 215, shW: 116, spine: 285, hand: 90 }, head: { a: 105, b: 110, H: 230 }, skin: "#e9b48a", brow: "#3a2a1e",
  hat: "greathelm", hatCol: "#b9c3cd", top: "tunic", coat: "#f6f1e4", accent: "#d8342c", emblem: "cross", belt: "#6b4424", armCol: "#97a1ac",
  rows: [[-190, 116, 86, 90], [-20, 106, 88, 82], [90, 102, 86, 74], [205, 118, 84, 72], [260, 120, 64, 64], [286, 54, 40, 44]],
  legs: "trousers", trous: "#97a1ac", feet: "boots", sleeve: "long", arm: [31, 25, 18], leg: [38, 27, 19],
};
/** a British soldier of 1916: steel helmet, khaki tunic buttoned to the neck, belt, boots */
export const TOMMY: Look = {
  id: "tommy", P: { ...ROMAN, thigh: 228, shin: 218, spine: 258, shW: 84, hipW: 44, neck: 36, upper: 150, fore: 142, hand: 80 }, head: { a: 95, b: 105, H: 230, jaw: 0.8, round: 0.4, eye: 1.08 }, skin: "#f0c8a2", brow: "#8a5a2a",
  hat: "brodie", hatCol: "#7f7a45",
  top: "jacket", plain: true, coat: "#9a9150", accent: "#6b4424", belt: "#6b4424",
  rows: [[-66, 78, 58, 62], [-10, 70, 54, 56], [80, 60, 48, 46], [180, 72, 56, 50], [234, 86, 50, 50], [258, 44, 32, 36]],
  legs: "trousers", trous: "#8f8748", feet: "boots", sleeve: "long", arm: [24, 19, 14], leg: [29, 22, 16],
};
/** a lady of the 1890s: straw boater with a ribbon, hair in a knot, a dress to the ground */
export const LADY: Look = {
  id: "lady", P: { ...ROMAN, thigh: 205, shin: 195, shW: 86, hipW: 50, spine: 250, upper: 136, fore: 126, hand: 74, head: 230 }, head: { a: 100, b: 108, H: 225, jaw: 0.82, round: 0.6, eye: 1.1 }, skin: "#f8d6b4", brow: "#6a3f24",
  hat: "boater", hatCol: "#f0d68a", hatBand: "#3f6fd0", hair: { col: "#7a4a2a", kind: "bun" }, lash: true, lips: "#d8504c",
  top: "tunic", skirt: true, coat: "#3f6fd0", accent: "#fbf3df", belt: "#fbf3df",
  rows: [[-416, 170, 150, 170], [-300, 150, 130, 150], [-120, 112, 90, 104], [0, 78, 62, 66], [70, 62, 52, 50], [170, 76, 66, 56], [228, 88, 54, 54], [252, 44, 34, 38]],
  legs: "trousers", feet: "shoes", sleeve: "long", arm: [24, 19, 14], leg: [28, 20, 14],
};
/** a dock worker of the 1930s: bare-headed and bearded, blue work jacket, heavy boots (no flat cap: that shape is Sir Digsworth's) */
export const DOCKER: Look = {
  id: "docker", P: { ...ROMAN, thigh: 200, shin: 190, shW: 118, hipW: 62, spine: 275 }, head: { a: 120, b: 120, H: 235, jaw: 1.1, round: 0.15 }, skin: "#a9714a", brow: "#2a1c14",
  hat: "none", hair: { col: "#2a1c14", kind: "short" }, beard: "#2a1c14",
  top: "jacket", plain: true, coat: "#3f73b8", accent: "#2a1c14",
  rows: [[-60, 112, 88, 88], [0, 108, 92, 84], [100, 104, 94, 78], [195, 114, 84, 72], [248, 120, 64, 64], [274, 58, 42, 46]],
  legs: "trousers", trous: "#5a4a3a", feet: "boots", sleeve: "long", arm: [34, 27, 20], leg: [40, 29, 20],
};
/** a child: the same parts on a smaller skeleton with a larger head for its height */
export const BOY: Look = {
  id: "boy", P: { thigh: 112, shin: 106, ankle: 18, foot: 88, hipW: 38, shW: 62, spine: 150, shDrop: 16, neck: 10, head: 220, upper: 84, fore: 78, hand: 58 }, head: { a: 110, b: 112, H: 215, jaw: 0.84, round: 1, eye: 1.32 }, skin: "#f6cfa6", brow: "#b8742e",
  hat: "none", hair: { col: "#c4762a", kind: "short" },
  top: "tunic", coat: "#e2543c", accent: "#fbf3df", belt: "#7a4a2a",
  rows: [[-56, 74, 58, 60], [0, 70, 60, 56], [76, 62, 54, 48], [128, 64, 42, 42], [146, 36, 28, 30]],
  legs: "bare", feet: "sandals", sleeve: "short", arm: [19, 15, 11], leg: [24, 18, 12],
};
/** an old woman: small, white hair in a knot, a shawl over a long dark dress */
export const GRANNY: Look = {
  id: "granny", P: { ...ROMAN, thigh: 170, shin: 160, shW: 80, hipW: 50, spine: 222, neck: 14, upper: 124, fore: 114, hand: 72, head: 220 }, head: { a: 105, b: 110, H: 215, jaw: 0.74, round: 0.75, eye: 0.84 }, skin: "#f1cdb0", brow: "#d9d4cc",
  hat: "none", hair: { col: "#ece8e0", kind: "bun" },
  top: "tunic", skirt: true, coat: "#6b4a6e", accent: "#fbf3df", cloak: "#c9503c",
  rows: [[-340, 136, 112, 126], [-240, 126, 104, 118], [-100, 104, 86, 96], [0, 86, 74, 76], [90, 82, 76, 66], [170, 86, 70, 62], [204, 84, 54, 56], [224, 44, 34, 38]],
  legs: "trousers", feet: "shoes", sleeve: "long", arm: [23, 18, 13], leg: [27, 20, 14],
};
/** a Roman woman: a long dress, a shawl over one shoulder, hair in a knot */
export const ROMAN_WOMAN: Look = {
  id: "romanwoman", P: { ...ROMAN, thigh: 200, shin: 190, shW: 88, hipW: 52, spine: 250, upper: 136, fore: 126, hand: 74, head: 230 }, head: { a: 102, b: 110, H: 225, jaw: 0.84, round: 0.6, eye: 1.08 }, skin: "#efc39c", brow: "#3a2418",
  hat: "none", hair: { col: "#3a2418", kind: "bun" }, lash: true, lips: "#c8504c",
  top: "tunic", skirt: true, coat: "#3f9a8c", accent: "#fbf3df", cloak: "#e9b83a", belt: "#fbf3df",
  rows: [[-400, 132, 110, 124], [-280, 122, 102, 114], [-120, 104, 86, 96], [0, 86, 70, 72], [70, 72, 60, 56], [170, 80, 68, 58], [228, 90, 56, 56], [252, 44, 34, 38]],
  legs: "trousers", feet: "sandals", sleeve: "short", arm: [24, 19, 14], leg: [28, 20, 14],
};
// ---------------- Rome, about AD 70 ----------------
/** the emperor Vespasian: stocky, bald with a wreath, a white tunic under a purple cloak */
export const VESPASIAN: Look = {
  id: "vespasian", P: { ...ROMAN, thigh: 195, shin: 185, spine: 280, hipW: 68, shW: 120, upper: 142, fore: 130 }, head: { a: 124, b: 122, H: 240, jaw: 1.14, round: 0.35, eye: 0.84 }, skin: "#eebf96", brow: "#8a8078",
  hat: "band", hatCol: "#e2b93a", hair: { col: "#9a9088", kind: "bald" },
  top: "tunic", coat: "#7a2f8a", accent: "#e2b93a", cloak: "#fbf6ea", belt: "#e2b93a",
  rows: [[-300, 132, 106, 108], [-150, 138, 124, 108], [0, 142, 140, 106], [110, 136, 128, 96], [205, 122, 100, 80], [254, 122, 68, 68], [280, 60, 44, 48]],
  legs: "bare", feet: "sandals", sleeve: "short", arm: [32, 26, 18], leg: [42, 30, 19],
};
/** his son Titus: younger and slimmer, dark hair, a red cloak */
export const TITUS: Look = {
  id: "titus", P: { ...ROMAN, thigh: 215, shin: 205, spine: 268, shW: 104 }, head: { a: 106, b: 110, H: 232, jaw: 0.96, round: 0.3, eye: 0.86 }, skin: "#efc39c", brow: "#2e2018",
  hat: "none", hair: { col: "#2e2018", kind: "short" },
  top: "tunic", coat: "#f1d9a0", accent: "#c8402f", cloak: "#c8402f", belt: "#8a5a30",
  rows: [[-210, 112, 86, 90], [-100, 106, 86, 84], [0, 100, 84, 78], [100, 98, 82, 72], [200, 110, 80, 70], [250, 112, 62, 62], [276, 54, 40, 44]],
  legs: "bare", feet: "sandals", sleeve: "short", arm: [28, 22, 16], leg: [36, 26, 17],
};
/** a fuller at his work: a short work tunic hitched up, a headband, strong arms */
export const FULLER: Look = {
  id: "fuller", P: { ...ROMAN, shW: 112 }, head: { a: 112, b: 112, H: 230, jaw: 1.06, round: 0.3, eye: 0.86 }, skin: "#d9a070", brow: "#3a2418",
  hat: "band", hatCol: "#3f9a8c", hair: { col: "#3a2418", kind: "short" }, beard: "#3a2418",
  top: "tunic", coat: "#8fb86a", accent: "#3f7a4a", belt: "#6b4424",
  rows: [[-110, 114, 86, 90], [-10, 108, 90, 84], [100, 102, 90, 76], [200, 112, 82, 70], [248, 114, 62, 62], [272, 56, 40, 44]],
  legs: "bare", feet: "sandals", sleeve: "short", arm: [31, 25, 17], leg: [38, 27, 18],
};
/** a man of the street in a plain blue tunic */
export const CITIZEN: Look = {
  id: "citizen", P: { ...ROMAN, thigh: 200, shin: 190 }, head: { a: 110, b: 112, H: 228, jaw: 0.94, round: 0.5, eye: 0.86 }, skin: "#e3b088", brow: "#5a3a22",
  hat: "none", hair: { col: "#5a3a22", kind: "short" },
  top: "tunic", coat: "#3b7fc4", accent: "#f6c95e", belt: "#f6c95e",
  rows: [[-190, 114, 88, 92], [-60, 110, 92, 86], [60, 104, 92, 78], [190, 110, 82, 70], [244, 112, 62, 62], [268, 56, 40, 44]],
  legs: "bare", feet: "sandals", sleeve: "short", arm: [28, 22, 16], leg: [36, 26, 17],
};
/** a tax collector in plain dress: an ochre tunic, a brown cloak, thinning hair; he carries a wax tablet */
export const COLLECTOR: Look = {
  id: "collector", P: { ...ROMAN, thigh: 200, shin: 190, hipW: 64, shW: 110 }, head: { a: 114, b: 114, H: 230, jaw: 1.0, round: 0.45, eye: 0.86 }, skin: "#e9b48a", brow: "#4a3020",
  hat: "none", hair: { col: "#4a3020", kind: "bald" }, mous: { col: "#4a3020", span: 0.7, curl: 0, w: 10 },
  top: "tunic", coat: "#e2a53a", accent: "#7a4a26", cloak: "#7a4a26", belt: "#5a3a22",
  rows: [[-200, 120, 96, 98], [-80, 122, 108, 96], [40, 120, 112, 90], [130, 114, 100, 80], [205, 112, 84, 72], [248, 114, 62, 62], [272, 56, 40, 44]],
  legs: "bare", feet: "sandals", sleeve: "short", arm: [29, 23, 16], leg: [38, 27, 17],
};
// ---------------- Boston, 1773 ----------------
const COLONIST: Props = { thigh: 212, shin: 200, ankle: 24, foot: 126, hipW: 54, shW: 102, spine: 266, shDrop: 26, neck: 24, head: 238, upper: 146, fore: 134, hand: 84 };
const coat = [[-150, 110, 80, 86], [-20, 96, 78, 76], [70, 82, 70, 60], [180, 96, 76, 66], [240, 106, 60, 60], [266, 52, 38, 42]];
/** a customs officer of the Crown: black tricorn with gold edge, navy coat with buff cuffs, breeches, a powdered queue */
export const CUSTOMS: Look = {
  id: "customs", P: COLONIST, head: { a: 105, b: 112, H: 235, jaw: 0.92, round: 0.3 }, skin: "#f2cba6", brow: "#8a8a90",
  hat: "tricorn", hatCol: "#26262c", hatBand: "#e7bb48", hair: { col: "#e6e3dc", kind: "queue" },
  top: "jacket", coat: "#2f4f86", accent: "#ecd9a0", cuffs: "#ecd9a0", rows: coat,
  legs: "trousers", trous: "#ecd9a0", stockings: "#fbf7ee", feet: "shoes", buckle: true, sleeve: "long", arm: [29, 23, 17], leg: [36, 26, 16],
};
/** the ship's owner: a stout merchant in bottle green with a brown tricorn */
export const SHIPOWNER: Look = {
  id: "shipowner", P: { ...COLONIST, thigh: 198, shin: 188, hipW: 68, shW: 114, spine: 274 }, head: { a: 120, b: 122, H: 235, jaw: 1.1, round: 0.6 }, skin: "#f0c4a0", brow: "#7a6a5a",
  hat: "tricorn", hatCol: "#5a3d28", hatBand: "#c9a03c", hair: { col: "#b9b4aa", kind: "queue" },
  top: "jacket", coat: "#2f7a52", accent: "#c8402f", cuffs: "#c9a03c",
  rows: [[-150, 138, 110, 112], [-20, 140, 132, 108], [70, 142, 150, 100], [180, 124, 122, 86], [244, 118, 72, 70], [272, 60, 44, 48]],
  legs: "trousers", trous: "#3a3a44", stockings: "#fbf7ee", feet: "shoes", buckle: true, sleeve: "long", arm: [33, 26, 19], leg: [42, 30, 18],
};
/** a sailor: bare-headed with a tarred queue, a short blue jacket, wide pale trousers */
export const SAILOR: Look = {
  id: "sailor", P: { ...COLONIST, shW: 110 }, head: { a: 110, b: 115, H: 235, jaw: 1.04, round: 0.25 }, skin: "#e3b088", brow: "#2f2218",
  hat: "band", hatCol: "#c8402f", hair: { col: "#2f2218", kind: "queue" },
  top: "jacket", plain: true, coat: "#356fb0", accent: "#fbf3df",
  rows: [[-30, 104, 78, 80], [20, 100, 80, 76], [100, 96, 80, 70], [190, 106, 80, 68], [242, 112, 62, 62], [268, 54, 40, 44]],
  legs: "trousers", trous: "#efe6cf", feet: "shoes", sleeve: "long", arm: [32, 26, 19], leg: [40, 32, 26],
};
/** a dock hand: shirt sleeves, a leather apron, breeches and grey stockings */
export const DOCKHAND: Look = {
  id: "dockhand", P: COLONIST, head: { a: 110, b: 112, H: 232, jaw: 1.0, round: 0.4 }, skin: "#eebf96", brow: "#6a4424",
  hat: "none", hair: { col: "#6a4424", kind: "queue" },
  top: "tunic", coat: "#f4ecd8", accent: "#8a5a36", apron: "#8a5a36", belt: "#5a3a22",
  rows: [[-40, 104, 80, 82], [20, 100, 82, 78], [100, 94, 80, 70], [190, 104, 78, 68], [242, 110, 62, 62], [268, 54, 40, 44]],
  legs: "trousers", trous: "#6b5a44", stockings: "#b9b6ae", feet: "shoes", sleeve: "long", arm: [30, 24, 18], leg: [37, 27, 17],
};
/** a woman of the town: a white mob cap, a dress to the ground, a shawl */
export const TOWNSWOMAN: Look = {
  id: "townswoman", P: { ...COLONIST, thigh: 200, shin: 190, shW: 86, hipW: 50, spine: 248, upper: 134, fore: 124, hand: 74, head: 228 }, head: { a: 102, b: 108, H: 225, jaw: 0.84, round: 0.6, eye: 1.08 }, skin: "#f6d2b0", brow: "#7a4a2a",
  hat: "brodie", hatCol: "#fdfaf2", brim: 0.74, hair: { col: "#7a4a2a", kind: "back" }, lash: true, lips: "#d0504c",
  top: "tunic", skirt: true, coat: "#b8433a", accent: "#fbf3df", cloak: "#fbf3df", belt: "#fbf3df",
  rows: [[-400, 150, 124, 140], [-280, 134, 112, 126], [-120, 106, 88, 98], [0, 84, 68, 70], [70, 70, 58, 54], [170, 78, 66, 56], [226, 88, 54, 54], [250, 44, 34, 38]],
  legs: "trousers", feet: "shoes", sleeve: "long", arm: [24, 19, 14], leg: [28, 20, 14],
};
// ---------------- a pirate sloop, about 1720 ----------------
/** the pirate captain: a black cocked hat edged with gold, a long red coat, a black beard, sea boots */
export const CAPTAIN: Look = {
  id: "captain", P: { ...COLONIST, thigh: 215, shin: 205, shW: 114, hipW: 62, spine: 276 }, head: { a: 118, b: 118, H: 236, jaw: 1.1, round: 0.3, eye: 0.86 }, skin: "#e3b088", brow: "#1f1a18",
  hat: "tricorn", hatCol: "#1f1c22", hatBand: "#e7bb48", hair: { col: "#1f1a18", kind: "queue" }, beard: "#1f1a18",
  top: "jacket", coat: "#b3261e", accent: "#f1d9a0", cuffs: "#e7bb48",
  rows: [[-190, 124, 96, 100], [-60, 116, 100, 92], [50, 108, 100, 84], [170, 116, 96, 76], [244, 118, 68, 68], [272, 58, 42, 46]],
  legs: "trousers", trous: "#2b2a33", feet: "boots", sleeve: "long", arm: [32, 26, 19], leg: [40, 29, 19],
};
/** a pirate of the crew: a red headscarf, an open green waistcoat over a shirt, wide trousers */
export const PIRATE: Look = {
  id: "pirate", P: { ...COLONIST, shW: 110 }, head: { a: 110, b: 114, H: 232, jaw: 1.04, round: 0.3, eye: 0.86 }, skin: "#d9a070", brow: "#3a2418",
  hat: "band", hatCol: "#c8402f", hair: { col: "#3a2418", kind: "queue" }, mous: { col: "#3a2418", span: 0.8, curl: 0.4, w: 11 },
  top: "jacket", plain: true, coat: "#3f9a5c", accent: "#fbf3df",
  rows: [[-30, 106, 80, 82], [20, 102, 82, 78], [100, 98, 82, 72], [190, 108, 82, 70], [242, 114, 62, 62], [268, 54, 40, 44]],
  legs: "trousers", trous: "#efe6cf", feet: "shoes", sleeve: "long", armCol: "#fbf3df", arm: [32, 26, 19], leg: [40, 32, 26],
};
/** a pirate who has been in the wars: a blue coat, a yellow headscarf (the film puts his arm in a sling) */
export const MATE: Look = {
  id: "mate", P: { ...COLONIST, thigh: 200, shin: 190 }, head: { a: 112, b: 112, H: 230, jaw: 1.0, round: 0.45, eye: 0.86 }, skin: "#eebf96", brow: "#6a4424",
  hat: "band", hatCol: "#e2b93a", hair: { col: "#6a4424", kind: "queue" }, beard: "#6a4424",
  top: "jacket", plain: true, coat: "#356fb0", accent: "#fbf3df",
  rows: [[-30, 106, 80, 82], [20, 102, 82, 78], [100, 96, 80, 70], [190, 106, 80, 68], [242, 112, 62, 62], [268, 54, 40, 44]],
  legs: "trousers", trous: "#6b5a44", feet: "shoes", sleeve: "long", arm: [31, 25, 18], leg: [38, 28, 20],
};
/** a pirate put ashore: a torn shirt, bare legs, wild hair */
export const CASTAWAY: Look = {
  id: "castaway", P: { ...COLONIST, thigh: 205, shin: 195, shW: 100 }, head: { a: 108, b: 110, H: 228, jaw: 0.92, round: 0.4, eye: 0.86 }, skin: "#d9a070", brow: "#5a3a22",
  hat: "none", hair: { col: "#5a3a22", kind: "short" }, beard: "#5a3a22",
  top: "tunic", coat: "#e6d9b8", accent: "#7a4a26", belt: "#7a4a26",
  rows: [[-120, 108, 84, 86], [-20, 104, 86, 82], [90, 98, 84, 74], [190, 106, 80, 68], [242, 110, 62, 62], [266, 54, 40, 44]],
  legs: "bare", feet: "sandals", sleeve: "short", arm: [28, 22, 16], leg: [36, 26, 17],
};
/** a look as a design the rig can play. Every look wears the corrected beard and the corrected open mouth (cast.ts beard2, mouth2: their
 *  sheets were approved by the reviewer on 17 Nov 2026); a look that sets either flag itself keeps its own value */
export const castDesign = (L0: Look, name = L0.id): Design => { const L: Look = { beard2: true, mouth2: true, ...L0 }; return { id: L.id, name, ol: 4.6, faceW: L.head.a * 1.45, props: () => L.P, draw: drawCast(L), hat: (k, phi) => drawHat(k, L, phi) }; };
export const SIR_D = castDesign(SIR, "Sir Digsworth"), BAKER_D = castDesign(BAKER), SOLDIER_D = castDesign(SOLDIER), MERCHANT_D = castDesign(MERCHANT);
export const KNIGHT_D = castDesign(KNIGHT), TOMMY_D = castDesign(TOMMY), LADY_D = castDesign(LADY), DOCKER_D = castDesign(DOCKER), BOY_D = castDesign(BOY), GRANNY_D = castDesign(GRANNY), ROMAN_WOMAN_D = castDesign(ROMAN_WOMAN);
export const VESPASIAN_D = castDesign(VESPASIAN), TITUS_D = castDesign(TITUS), FULLER_D = castDesign(FULLER), CITIZEN_D = castDesign(CITIZEN), COLLECTOR_D = castDesign(COLLECTOR);
export const CAPTAIN_D = castDesign(CAPTAIN), PIRATE_D = castDesign(PIRATE), MATE_D = castDesign(MATE), CASTAWAY_D = castDesign(CASTAWAY);
export const CUSTOMS_D = castDesign(CUSTOMS), SHIPOWNER_D = castDesign(SHIPOWNER), SAILOR_D = castDesign(SAILOR), DOCKHAND_D = castDesign(DOCKHAND), TOWNSWOMAN_D = castDesign(TOWNSWOMAN);

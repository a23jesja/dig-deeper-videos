// The Looks of the cast: Sir Digsworth and the side characters, all on the one card figure of cast.ts and the one skeleton of rig.ts.
// A new figure is a new Look: sizes, colours, a hat, clothes. No new drawing code.
// Heads are a quarter larger than in the first sheets (Jesper, 2026-11-16: so that the faces read at phone size): every Look's head
// and head bone carry that size in their own numbers.
import { Props } from "./rig";
import { Look, drawCast, drawFingers, drawHat } from "./cast";
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
// ---------------- Rome, AD 64 ----------------
/** the emperor Nero: young and plump, reddish curls under a laurel wreath, a white tunic under a purple cloak */
export const NERO: Look = {
  id: "nero", P: { ...ROMAN, thigh: 198, shin: 188, spine: 274, hipW: 66, shW: 112, upper: 140, fore: 128 }, head: { a: 122, b: 120, H: 238, jaw: 1.08, round: 0.6, eye: 0.98 }, skin: "#f4cba8", brow: "#a8622a",
  hat: "band", hatCol: "#4f9a3f", hair: { col: "#c07a34", kind: "short" },
  top: "tunic", coat: "#fbf6ea", accent: "#e2b93a", cloak: "#7a2f8a", belt: "#e2b93a",
  rows: [[-300, 128, 104, 106], [-150, 134, 122, 106], [0, 138, 136, 104], [110, 132, 124, 94], [205, 120, 98, 78], [254, 120, 68, 68], [280, 58, 44, 48]],
  legs: "bare", feet: "sandals", sleeve: "short", arm: [31, 25, 18], leg: [41, 29, 19],
};
/** Nero as the rumour had him: in the long ungirded robe of a lyre-player, sea-green with a gold hem */
export const NERO_STAGE: Look = { ...NERO, id: "nerostage", skirt: true, coat: "#3f9a8c", accent: "#e2b93a", cloak: undefined, belt: undefined,
  rows: [[-400, 140, 116, 128], [-280, 132, 110, 118], [-150, 134, 122, 108], [0, 138, 136, 104], [110, 132, 124, 94], [205, 120, 98, 78], [254, 120, 68, 68], [280, 58, 44, 48]], legs: "trousers", sleeve: "long", armCol: "#3f9a8c" };
/** a messenger who has run all the way: a short brown tunic, a sweat band, lean */
export const RUNNER: Look = {
  id: "runner", P: { ...ROMAN, thigh: 215, shin: 205, shW: 100, hipW: 50 }, head: { a: 104, b: 110, H: 230, jaw: 0.92, round: 0.35, eye: 0.9 }, skin: "#d9a070", brow: "#2e2018",
  hat: "band", hatCol: "#c8402f", hair: { col: "#2e2018", kind: "short" },
  top: "tunic", coat: "#a8703c", accent: "#5a3a22", belt: "#5a3a22",
  rows: [[-100, 104, 80, 84], [-10, 100, 82, 78], [100, 96, 82, 72], [200, 106, 78, 68], [246, 108, 60, 60], [270, 52, 38, 42]],
  legs: "bare", feet: "sandals", sleeve: "short", arm: [27, 21, 15], leg: [35, 25, 16],
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
/** Blackbeard (Johnson 1724: "This Beard was black ... as to Breadth, it came up to his Eyes; he was accustomed to twist it with Ribbons,
 *  in small Tails ... and stuck lighted Matches under his Hat"): the captain's frame, a black cocked hat, a dark coat, the beard up to
 *  his eyes in tails tied with ribbons, and a lit slow-match on each side of his face */
export const BLACKBEARD: Look = { ...CAPTAIN, id: "blackbeard", P: { ...CAPTAIN.P, shW: 122, hipW: 66 }, head: { a: 124, b: 120, H: 240, jaw: 1.14, round: 0.25, eye: 0.82 }, skin: "#d6a47c",
  hatCol: "#141216", hatBand: "#141216", beard: "#141012", hair: { col: "#141012", kind: "queue" }, beardHigh: true, tails: ["#c8323a", "#e7bb48", "#2f6fb0", "#c8323a", "#e7bb48", "#2f6fb0"], fuses: true,
  coat: "#7a2a22", accent: "#e8d2a0", cuffs: "#e7bb48" };
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
// ---------------- a merchant ship's crew and more pirates (the Short about the black flag) ----------------
/** an old deck hand: bald with a grey beard, a loose shirt, blue trousers */
export const OLDHAND: Look = {
  id: "oldhand", P: { ...COLONIST, thigh: 205, shin: 195, shW: 106 }, head: { a: 112, b: 114, H: 232, jaw: 1.0, round: 0.4, eye: 0.9 }, skin: "#e9b48a", brow: "#8a8078",
  hat: "none", hair: { col: "#9a9088", kind: "bald" }, beard: "#9a9088",
  top: "tunic", coat: "#f4ecd8", accent: "#8a5a36", belt: "#5a3a22",
  rows: [[-40, 104, 80, 82], [20, 100, 82, 78], [100, 94, 80, 70], [190, 104, 78, 68], [242, 110, 62, 62], [268, 54, 40, 44]],
  legs: "trousers", trous: "#3f5f86", feet: "shoes", sleeve: "long", arm: [30, 24, 18], leg: [37, 27, 17],
};
/** the ship's cook: short and stout, bald, a white apron over a yellow shirt */
export const COOK: Look = {
  id: "cook", P: { ...COLONIST, thigh: 180, shin: 170, hipW: 70, shW: 116, spine: 262 }, head: { a: 122, b: 122, H: 232, jaw: 1.12, round: 0.65, eye: 0.9 }, skin: "#f0bf9c", brow: "#7a4a2a",
  hat: "band", hatCol: "#fbf6ea", hair: { col: "#7a4a2a", kind: "bald" }, mous: { col: "#7a4a2a", span: 0.9, curl: 0.2, w: 12 },
  top: "tunic", coat: "#e9b83a", accent: "#8a5a36", apron: "#fdf9ef", belt: "#8a5a36",
  rows: [[-150, 138, 110, 112], [-20, 140, 132, 108], [70, 142, 150, 100], [180, 124, 122, 86], [244, 118, 72, 70], [272, 60, 44, 48]],
  legs: "trousers", trous: "#5a4a3a", feet: "shoes", sleeve: "short", arm: [33, 26, 19], leg: [42, 30, 18],
};
/** the ship's boy: small, a blue band round red hair, a striped-free white shirt, short trousers */
export const SHIPBOY: Look = {
  id: "shipboy", P: { thigh: 112, shin: 106, ankle: 18, foot: 88, hipW: 38, shW: 62, spine: 150, shDrop: 16, neck: 10, head: 220, upper: 84, fore: 78, hand: 58 }, head: { a: 110, b: 112, H: 215, jaw: 0.84, round: 1, eye: 1.32 }, skin: "#f6cfa6", brow: "#b8742e",
  hat: "band", hatCol: "#356fb0", hair: { col: "#c4762a", kind: "short" },
  top: "tunic", coat: "#fbf3df", accent: "#356fb0", belt: "#356fb0",
  rows: [[-56, 74, 58, 60], [0, 70, 60, 56], [76, 62, 54, 48], [128, 64, 42, 42], [146, 36, 28, 30]],
  legs: "trousers", trous: "#7a5a3a", feet: "shoes", sleeve: "short", arm: [19, 15, 11], leg: [24, 18, 12],
};
/** a pirate of the same crew: an orange headscarf, a purple waistcoat, a dark beard */
export const PIRATE2: Look = {
  id: "pirate2", P: { ...COLONIST, thigh: 222, shin: 212, shW: 104 }, head: { a: 106, b: 112, H: 234, jaw: 0.94, round: 0.25, eye: 0.86 }, skin: "#b9814f", brow: "#221812",
  hat: "band", hatCol: "#e98a2c", hair: { col: "#221812", kind: "queue" }, beard: "#221812",
  top: "jacket", plain: true, coat: "#7a4a9a", accent: "#fbf3df",
  rows: [[-30, 100, 76, 78], [20, 96, 78, 74], [100, 92, 78, 68], [190, 102, 78, 66], [242, 108, 60, 60], [268, 52, 38, 42]],
  legs: "trousers", trous: "#3a3a44", feet: "boots", sleeve: "long", armCol: "#fbf3df", arm: [29, 23, 17], leg: [36, 28, 22],
};
/** a gunner of another pirate crew: big and bald with a red beard, a brown sleeveless jerkin, bare arms */
export const GUNNER: Look = {
  id: "gunner", P: { ...COLONIST, thigh: 210, shin: 200, shW: 122, hipW: 64, spine: 282 }, head: { a: 122, b: 120, H: 236, jaw: 1.14, round: 0.3, eye: 0.84 }, skin: "#eeb894", brow: "#b5532a",
  hat: "none", hair: { col: "#b5532a", kind: "bald" }, beard: "#b5532a",
  top: "tunic", coat: "#7a5a3a", accent: "#c8402f", belt: "#c8402f",
  rows: [[-40, 122, 92, 94], [20, 118, 96, 88], [100, 112, 98, 82], [195, 124, 94, 78], [250, 124, 66, 66], [276, 60, 44, 48]],
  legs: "trousers", trous: "#2b2a33", feet: "boots", sleeve: "short", arm: [36, 29, 20], leg: [42, 30, 20],
};
/** his mate: lean, a brown cocked hat without gold, a mustard coat, a grey moustache */
export const CORSAIR: Look = {
  id: "corsair", P: { ...COLONIST, thigh: 220, shin: 210, shW: 100, hipW: 50 }, head: { a: 104, b: 112, H: 236, jaw: 0.9, round: 0.3, eye: 0.88 }, skin: "#e9c3a0", brow: "#8a8a90",
  hat: "tricorn", hatCol: "#5a3d28", hair: { col: "#b9b4aa", kind: "queue" }, mous: { col: "#9a958c", span: 1.0, curl: 0.5, w: 12 },
  top: "jacket", coat: "#c9952c", accent: "#fbf3df", cuffs: "#5a3d28", rows: coat,
  legs: "trousers", trous: "#4a5a6a", feet: "boots", sleeve: "long", arm: [28, 22, 16], leg: [34, 25, 17],
};
/** men made to stand on deck in white shirts: three of them, told apart by hair, beard and build */
const shirt = (id: string, o: Partial<Look>): Look => ({
  id, P: COLONIST, head: { a: 110, b: 113, H: 232, jaw: 1.0, round: 0.35, eye: 0.88 }, skin: "#eebf96", brow: "#5a3a22",
  hat: "none", hair: { col: "#5a3a22", kind: "short" },
  top: "tunic", coat: "#fdfaf0", accent: "#d8d2c0", belt: "#6b5a44",
  rows: [[-60, 106, 82, 84], [20, 102, 84, 78], [100, 96, 82, 70], [190, 106, 80, 68], [242, 112, 62, 62], [268, 54, 40, 44]],
  legs: "trousers", trous: "#6b5a44", feet: "shoes", sleeve: "long", arm: [30, 24, 18], leg: [37, 27, 17], ...o });
export const SHIRT_A = shirt("shirta", { beard: "#5a3a22" }), SHIRT_B = shirt("shirtb", { skin: "#c98f60", brow: "#221812", hair: { col: "#221812", kind: "queue" }, trous: "#3f5f86", P: { ...COLONIST, thigh: 225, shin: 215, shW: 98 } }),
  SHIRT_C = shirt("shirtc", { skin: "#f4d2b4", brow: "#c9a24a", hair: { col: "#d9b45a", kind: "bald" }, mous: { col: "#c9a24a", span: 0.8, curl: 0.3, w: 11 }, trous: "#7a4a3a", P: { ...COLONIST, thigh: 195, shin: 185, shW: 112, hipW: 62 } });
export const SHIRT_D = shirt("shirtd", { skin: "#f6d6bc", brow: "#b5532a", hair: { col: "#c4662a", kind: "short" }, trous: "#4a6a4a", P: { ...COLONIST, thigh: 190, shin: 180, shW: 90, hipW: 46 }, head: { a: 100, b: 106, H: 224, jaw: 0.84, round: 0.7, eye: 1.04 } }),
  SHIRT_E = shirt("shirte", { skin: "#8a5a3a", brow: "#1a1410", hair: { col: "#1a1410", kind: "bald" }, beard: "#1a1410", trous: "#2b2a33", P: { ...COLONIST, thigh: 215, shin: 205, shW: 124, hipW: 66 }, head: { a: 124, b: 120, H: 238, jaw: 1.14, round: 0.25, eye: 0.86 },
    rows: [[-60, 126, 96, 98], [20, 122, 100, 92], [100, 116, 100, 84], [195, 126, 96, 80], [250, 126, 68, 68], [276, 60, 44, 48]], arm: [36, 29, 20], leg: [42, 30, 20] });
/** the master of a big merchant ship: a grey cocked hat with a white edge, a wine-red coat, white breeches, a thin moustache */
export const FRENCH_CAPT: Look = { ...CUSTOMS, id: "frenchcapt", P: { ...COLONIST, thigh: 222, shin: 212, shW: 98, hipW: 50 }, head: { a: 102, b: 110, H: 236, jaw: 0.86, round: 0.3, eye: 0.9 }, skin: "#f0c8a2", brow: "#5a3a22",
  hatCol: "#5a5a66", hatBand: "#fbf6ea", hair: { col: "#5a3a22", kind: "queue" }, mous: { col: "#5a3a22", span: 1.1, curl: 0.7, w: 9 }, coat: "#8a2f4a", accent: "#fbf3df", cuffs: "#fbf3df", trous: "#fbf7ee" };
/** his mate: broad and dark, a white cap, a red jacket, blue trousers, a short beard */
export const FRENCH_MATE: Look = { ...SAILOR, id: "frenchmate", P: { ...COLONIST, thigh: 200, shin: 190, shW: 120, hipW: 64 }, head: { a: 118, b: 118, H: 232, jaw: 1.1, round: 0.4, eye: 0.88 }, skin: "#c98f60", brow: "#221812",
  hatCol: "#fbf6ea", hair: { col: "#221812", kind: "short" }, beard: "#221812", coat: "#c8402f", accent: "#fbf3df", trous: "#356fb0",
  rows: [[-30, 116, 88, 90], [20, 112, 90, 86], [100, 108, 90, 80], [190, 118, 90, 76], [242, 122, 66, 66], [268, 58, 42, 46]] };
// ---------------- "you" (the long video "What If You Lived One Day on a Pirate Ship?") ----------------
/** you, the new hand who becomes the lookout: young and clean-shaven, short brown hair and no hat, a loose white shirt with blue stripes
 *  across it, a red neckerchief, wide canvas trousers. The same face in almost every shot of the long video, so it is kept plain and
 *  friendly */
export const YOU: Look = {
  id: "you", P: { ...COLONIST, thigh: 206, shin: 196, shW: 100, hipW: 52 }, head: { a: 104, b: 108, H: 226, jaw: 0.88, round: 0.55, eye: 1.0 }, skin: "#e2a77c", brow: "#4a2e1c",
  hat: "none", hair: { col: "#5a3620", kind: "messy" },
  // Jesper's choice for the long film: tousled brown hair, a white linen shirt, a red neckerchief, striped trousers
  top: "tunic", coat: "#f8f4ea", accent: "#e8e0cc", belt: "#8a6a44", scarf: "#c8402f",
  rows: [[-56, 104, 80, 82], [20, 100, 82, 78], [100, 94, 80, 70], [190, 102, 78, 66], [242, 108, 60, 60], [266, 52, 38, 42]],
  legs: "trousers", trous: "#efe8d8", trousStripes: "#2f5fa0", feet: "shoes", sleeve: "long", arm: [29, 23, 17], leg: [40, 34, 30],
};
/** the same in a blue-checked shirt (the choice put to Jesper with the striped one) */
export const YOU_CHECK: Look = { ...YOU, id: "youcheck", stripes: { col: "#2f5fa0", check: true } };
/** a look as a design the rig can play. Every look wears the corrected beard and the corrected open mouth (cast.ts beard2, mouth2: their
 *  sheets were approved by the reviewer on 17 Nov 2026); a look that sets either flag itself keeps its own value */
export const castDesign = (L0: Look, name = L0.id): Design => { const L: Look = { beard2: true, mouth2: true, ...L0 }; return { id: L.id, name, ol: 4.6, faceW: L.head.a * 1.45, props: () => L.P, draw: drawCast(L), fingers: drawFingers(L), hat: (k, phi) => drawHat(k, L, phi) }; };
export const SIR_D = castDesign(SIR, "Sir Digsworth"), BAKER_D = castDesign(BAKER), SOLDIER_D = castDesign(SOLDIER), MERCHANT_D = castDesign(MERCHANT);
export const KNIGHT_D = castDesign(KNIGHT), TOMMY_D = castDesign(TOMMY), LADY_D = castDesign(LADY), DOCKER_D = castDesign(DOCKER), BOY_D = castDesign(BOY), GRANNY_D = castDesign(GRANNY), ROMAN_WOMAN_D = castDesign(ROMAN_WOMAN);
export const VESPASIAN_D = castDesign(VESPASIAN), TITUS_D = castDesign(TITUS), FULLER_D = castDesign(FULLER), CITIZEN_D = castDesign(CITIZEN), COLLECTOR_D = castDesign(COLLECTOR);
export const CAPTAIN_D = castDesign(CAPTAIN), PIRATE_D = castDesign(PIRATE), MATE_D = castDesign(MATE), CASTAWAY_D = castDesign(CASTAWAY), BLACKBEARD_D = castDesign(BLACKBEARD, "Blackbeard");
export const CUSTOMS_D = castDesign(CUSTOMS), SHIPOWNER_D = castDesign(SHIPOWNER), SAILOR_D = castDesign(SAILOR), DOCKHAND_D = castDesign(DOCKHAND), TOWNSWOMAN_D = castDesign(TOWNSWOMAN);
export const OLDHAND_D = castDesign(OLDHAND), COOK_D = castDesign(COOK), SHIPBOY_D = castDesign(SHIPBOY), PIRATE2_D = castDesign(PIRATE2), GUNNER_D = castDesign(GUNNER), CORSAIR_D = castDesign(CORSAIR);
export const SHIRT_A_D = castDesign(SHIRT_A), SHIRT_B_D = castDesign(SHIRT_B), SHIRT_C_D = castDesign(SHIRT_C);
export const NERO_D = castDesign(NERO, "Nero"), NERO_STAGE_D = castDesign(NERO_STAGE), RUNNER_D = castDesign(RUNNER);
export const SHIRT_D_D = castDesign(SHIRT_D), SHIRT_E_D = castDesign(SHIRT_E), FRENCH_CAPT_D = castDesign(FRENCH_CAPT), FRENCH_MATE_D = castDesign(FRENCH_MATE);
export const YOU_D = castDesign(YOU, "you"), YOU_CHECK_D = castDesign(YOU_CHECK, "you");
/** more people of Rome, so that a crowd has women and men of different age, colour and face (their heights are set where they are cast) */
export const ROMAN_WOMAN2: Look = { ...ROMAN_WOMAN, id: "romanwoman2", head: { a: 108, b: 112, H: 232, jaw: 0.92, round: 0.45, eye: 0.96 }, skin: "#b9825a", brow: "#1c1410", hair: { col: "#1c1410", kind: "back" }, coat: "#b0483c", accent: "#f0e2c0", cloak: "#f0e2c0", belt: "#e9b83a" };
export const ROMAN_WOMAN3: Look = { ...ROMAN_WOMAN, id: "romanwoman3", head: { a: 100, b: 108, H: 220, jaw: 0.8, round: 0.75, eye: 1.16 }, skin: "#f6d3b4", brow: "#a8662a", hair: { col: "#c08a3a", kind: "bun" }, coat: "#7a6ab0", accent: "#fbf3df", cloak: "#c9d6e8", belt: "#fbf3df" };
export const GIRL: Look = { ...BOY, id: "girl", skin: "#e8b88a", brow: "#3a2418", hair: { col: "#3a2418", kind: "bun" }, lash: true, coat: "#e9b83a", accent: "#fbf3df", belt: "#c8402f" };
export const OLDMAN: Look = { ...CITIZEN, id: "oldman", head: { a: 108, b: 112, H: 226, jaw: 0.86, round: 0.4, eye: 0.8 }, skin: "#d9a882", brow: "#e8e4dc", hair: { col: "#e8e4dc", kind: "bald" }, beard: "#e8e4dc", coat: "#9a7a4a", accent: "#6b4a2e", belt: "#6b4a2e" };
/** the woman with the olives in the gladiators Short: ROMAN_WOMAN2 with her dark hair up in a bun (with the hair drawn back she read as
 *  a bald man at phone size; ROMAN_WOMAN2 itself stays as it is, for the published Nero film) */
export const ROMAN_WOMAN_OLIVES: Look = { ...ROMAN_WOMAN2, id: "romanwomanolives", hair: { col: "#1c1410", kind: "bun" } };
export const ROMAN_WOMAN_OLIVES_D = castDesign(ROMAN_WOMAN_OLIVES);
// ---------------- the animal trials: Saint-Julien in Savoy, 1587 (granskning/animal-trials/manus.md) ----------------
/** a winegrower of Saint-Julien: a long-sleeved brown tunic belted over hose, a straw hat, short brown hair */
export const VILLAGER: Look = { ...CITIZEN, id: "villager", head: { a: 112, b: 112, H: 228, jaw: 1.0, round: 0.5, eye: 0.9 }, skin: "#e2ad84", brow: "#4a3020", hat: "boater", hatCol: "#d9b86a", hatBand: "#7a5a36", hair: { col: "#4a3020", kind: "short" }, coat: "#7a6a4a", accent: "#5a4a32", belt: "#4a3a26", legs: "trousers", trous: "#5a4f40", feet: "shoes", sleeve: "long" };
/** a winegrower's wife: a long blue-grey dress with long sleeves, an apron and a white linen coif over her hair */
export const VILLAGER_WOMAN: Look = { ...ROMAN_WOMAN, id: "villagerwoman", head: { a: 104, b: 110, H: 226, jaw: 0.86, round: 0.6, eye: 1.04 }, skin: "#ecbf98", brow: "#5a3a22", hat: "brodie", hatCol: "#f6f1e4", brim: 0.7, hair: { col: "#5a3a22", kind: "back" }, coat: "#5a6a8a", accent: "#ece2c8", cloak: undefined, belt: "#ece2c8", apron: "#ece2c8", feet: "shoes", sleeve: "long" };
/** the bishop's official, who judges the case: older, grey, in a long dark violet cassock with a white collar and a black skullcap */
export const OFFICIAL: Look = { ...CITIZEN, id: "official", head: { a: 114, b: 118, H: 232, jaw: 1.04, round: 0.45, eye: 0.84 }, skin: "#ebc4a0", brow: "#a8a29a", hat: "brodie", hatCol: "#1e1a22", brim: 0.6, hair: { col: "#a8a29a", kind: "short" },
  coat: "#3a2a4a", accent: "#f4efe2", belt: "#5a3a6a", skirt: true, rows: [[-400, 150, 112, 124], [-280, 140, 104, 114], [-120, 122, 94, 100], [0, 112, 90, 86], [100, 106, 90, 78], [190, 112, 82, 70], [244, 114, 62, 62], [268, 56, 40, 44]], legs: "trousers", trous: "#2a2230", feet: "shoes", sleeve: "long" };
/** the lawyer the court gives the weevils: a long black gown with white bands at the throat and a black coif, dark hair, a sharp face */
export const ADVOCATE: Look = { ...OFFICIAL, id: "advocate", head: { a: 104, b: 112, H: 232, jaw: 0.9, round: 0.35, eye: 0.92 }, skin: "#e7bc96", brow: "#2a1c14", hatCol: "#141216", hair: { col: "#2a1c14", kind: "short" }, coat: "#1e1c22", accent: "#f6f2e8", belt: "#1e1c22" };
/** one of the experts sent to look at the field: a green doublet over hose, a brown felt hat */
export const EXPERT: Look = { ...VILLAGER, id: "expert", head: { a: 108, b: 114, H: 230, jaw: 0.96, round: 0.45, eye: 0.88 }, skin: "#ddb08a", brow: "#6a5a4a", hatCol: "#5a4030", hatBand: "#2a1c14", hair: { col: "#6a5a4a", kind: "short" }, beard: "#6a5a4a", coat: "#4a6a5a", accent: "#2a3a30", belt: "#2a1c14", trous: "#3a3a30" };
/** the court's clerk, who keeps the record: a long grey gown, bald, spectacles of his own (none drawn) */
export const CLERK: Look = { ...ADVOCATE, id: "clerk", head: { a: 108, b: 108, H: 226, jaw: 0.92, round: 0.55, eye: 0.9 }, hat: "none", hair: { col: "#7a6a5a", kind: "bald" }, coat: "#5a5a62", belt: "#3a3a42" };
/** an old winegrower for the gallery: grey hair and beard, bareheaded, a russet jerkin */
export const VILLAGER_OLD: Look = { ...VILLAGER, id: "villagerold", head: { a: 114, b: 108, H: 224, jaw: 1.02, round: 0.55, eye: 0.86 }, skin: "#d9a47c", brow: "#b8b0a4", hat: "none", hair: { col: "#b8b0a4", kind: "short" }, beard: "#b8b0a4", coat: "#8a4a2a", accent: "#5a3018", belt: "#3a2418", trous: "#4a4a3a" };
/** a younger village woman: a rust-red dress, a straw-coloured coif */
export const VILLAGER_WOMAN2: Look = { ...VILLAGER_WOMAN, id: "villagerwoman2", head: { a: 102, b: 108, H: 224, jaw: 0.84, round: 0.62, eye: 1.06 }, skin: "#f0c8a4", brow: "#8a4a22", hatCol: "#e8d49a", hair: { col: "#8a4a22", kind: "back" }, coat: "#9a4a32", accent: "#f0e6cc", belt: "#f0e6cc", apron: "#f0e6cc" };
export const VILLAGER_OLD_D = castDesign(VILLAGER_OLD), VILLAGER_WOMAN2_D = castDesign(VILLAGER_WOMAN2);
export const VILLAGER_D = castDesign(VILLAGER), VILLAGER_WOMAN_D = castDesign(VILLAGER_WOMAN), OFFICIAL_D = castDesign(OFFICIAL), ADVOCATE_D = castDesign(ADVOCATE), EXPERT_D = castDesign(EXPERT), CLERK_D = castDesign(CLERK);
export const ROMAN_WOMAN2_D = castDesign(ROMAN_WOMAN2), ROMAN_WOMAN3_D = castDesign(ROMAN_WOMAN3), GIRL_D = castDesign(GIRL), OLDMAN_D = castDesign(OLDMAN);

// ---------------- the arena (gladiators-death) ----------------
/** the heavy gladiator (a murmillo): broad and bare-chested, a bronze helmet with a broad brim and a tall red crest, a loincloth under a
 *  wide belt, a quilted guard on his sword arm, a greave on his left shin; he carries the big shield and the short sword */
export const MURMILLO: Look = {
  id: "murmillo", P: { ...ROMAN, thigh: 215, shin: 200, hipW: 66, shW: 126, spine: 270, upper: 150, fore: 138, hand: 92 }, head: { a: 112, b: 116, H: 236, jaw: 1.12, round: 0.3 }, skin: "#d69c70", brow: "#2a1c14",
  hat: "helmet", hatCol: "#c9a24a", brim: 1, crestH: 0.56, mous: { col: "#2a1c14", span: 0.9, curl: 0, w: 12 },
  top: "tunic", bare: true, coat: "#d69c70", accent: "#d8342c", loin: "#f3ead6", balteus: "#8a5a30", manica: "R", greave: "L",
  rows: [[-72, 112, 86, 90], [-10, 106, 88, 82], [90, 108, 94, 76], [200, 128, 92, 74], [254, 128, 66, 66], [280, 56, 40, 44]],
  legs: "bare", feet: "sandals", sleeve: "short", arm: [35, 28, 20], leg: [41, 30, 20],
};
/** the net fighter (a retiarius): lean and quick, bareheaded, a loincloth under a belt, the quilted guard on his left arm and the metal
 *  guard standing up from his left shoulder; he carries the trident and the net */
export const RETIARIUS: Look = {
  id: "retiarius", P: { ...ROMAN, thigh: 222, shin: 212, hipW: 52, shW: 102, spine: 262 }, head: { a: 104, b: 108, H: 228, jaw: 0.96, round: 0.35 }, skin: "#b9784c", brow: "#1a120c",
  hat: "none", hair: { col: "#1a120c", kind: "short" },
  top: "tunic", bare: true, coat: "#b9784c", accent: "#3f6fd0", loin: "#e9dcc0", balteus: "#6b4424", manica: "L", galerus: "L",
  rows: [[-70, 98, 78, 82], [-10, 92, 76, 72], [90, 92, 80, 66], [198, 108, 78, 64], [248, 110, 58, 58], [270, 50, 36, 40]],
  legs: "bare", feet: "sandals", sleeve: "short", arm: [28, 22, 16], leg: [34, 25, 17],
};
/** the referee of the games (summa rudis): an older man in a white tunic with two purple stripes, his long stick in hand */
export const REFEREE: Look = {
  id: "referee", P: ROMAN, head: { a: 108, b: 112, H: 228, jaw: 0.9, round: 0.4, eye: 0.86 }, skin: "#e2b48c", brow: "#dcd6cc", hair: { col: "#dcd6cc", kind: "bald" }, beard: "#dcd6cc",
  hat: "none", top: "tunic", coat: "#f6f1e4", accent: "#7a2f8a", clavi: "#7a2f8a", belt: "#8a5a36",
  rows: [[-150, 114, 86, 90], [-20, 108, 92, 84], [100, 102, 92, 76], [200, 108, 78, 68], [244, 110, 60, 60], [268, 54, 40, 44]],
  legs: "bare", feet: "sandals", sleeve: "short", arm: [28, 22, 16], leg: [35, 25, 17],
};
export const MURMILLO_D = castDesign(MURMILLO, "the murmillo"), RETIARIUS_D = castDesign(RETIARIUS, "the net fighter"), REFEREE_D = castDesign(REFEREE, "the referee");

// ---------------- Blackbeard getting ready (blackbeard-fuses) ----------------
/** Blackbeard in his cabin before the fight: the ribbons in his beard, no fuses yet, no sling */
export const BLACKBEARD_PREP: Look = { ...BLACKBEARD, id: "blackbeardprep", fuses: false };
/** Blackbeard ready for the fight: the fuses lit under his hat and the sling of six pistols across his chest */
export const BLACKBEARD_ARMED: Look = { ...BLACKBEARD, id: "blackbeardarmed", sling: true };
/** before the ribbons: the tails of his beard plaited but not tied with colour yet; and half way, five of six tied */
export const BLACKBEARD_BARE: Look = { ...BLACKBEARD_PREP, id: "blackbeardbare", tails: BLACKBEARD.tails!.map(() => "#2a2226") };
export const BLACKBEARD_HALF: Look = { ...BLACKBEARD_PREP, id: "blackbeardhalf", tails: BLACKBEARD.tails!.map((c, i) => (i === 4 ? "#2a2226" : c)) };
/** the fuses tucked under the hat, not lit yet */
export const BLACKBEARD_UNLIT: Look = { ...BLACKBEARD, id: "blackbeardunlit", fusesUnlit: true };
export const BLACKBEARD_PREP_D = castDesign(BLACKBEARD_PREP, "Blackbeard"), BLACKBEARD_ARMED_D = castDesign(BLACKBEARD_ARMED, "Blackbeard");
/** after the fight, one fuse pulled out (the other still under his hat) */
/** (the one he keeps is on the right of his face card: his left, as he faces us; his right hand has pulled the other) */
export const BLACKBEARD_ONE: Look = { ...BLACKBEARD_ARMED, id: "blackbeardone", fuseSide: 1 };
export const BLACKBEARD_ONE_D = castDesign(BLACKBEARD_ONE, "Blackbeard");
/** the half-done beard with its last tail being plaited, at four phases of the twist (shown in turn, they make the plait turn in his fingers) */
export const BLACKBEARD_PLAIT_D = [0, 1, 2, 3].map((k) => castDesign({ ...BLACKBEARD_PREP, id: `blackbeardplait${k}`, tails: BLACKBEARD.tails!.map((c, i) => (i === 3 ? "#2a2226" : c)), plait: { tail: 3, phase: (k * Math.PI) / 2 } }, "Blackbeard"));
/** the same tail just tied, its ribbon on (still drawn large, as in the shot where he tied it) */
export const BLACKBEARD_PLAITED_D = castDesign({ ...BLACKBEARD_PREP, id: "blackbeardplaited", plait: { tail: 3, phase: 0, tied: true } }, "Blackbeard");
export const BLACKBEARD_BARE_D = castDesign(BLACKBEARD_BARE, "Blackbeard"), BLACKBEARD_HALF_D = castDesign(BLACKBEARD_HALF, "Blackbeard"), BLACKBEARD_UNLIT_D = castDesign(BLACKBEARD_UNLIT, "Blackbeard");

// ---------------- the gladiators' school, the gate and the stands (gladiators-death) ----------------
/** the heavy gladiator at school: his helmet off, short dark hair, a bandage being wound round his left forearm */
export const MURMILLO_BARE: Look = { ...MURMILLO, id: "murmillobare", hat: "none", hair: { col: "#2a1c14", kind: "short" }, wrap: "L" };
/** the same man eating while the doctor bandages him: no arm guard and no bandage drawn on him (the doctor's winding is the only one,
 *  and the arm with the bowl is bare: Jesper's review of v3) */
export const MURMILLO_EATER: Look = { ...MURMILLO_BARE, id: "murmilloeater", wrap: undefined, manica: undefined };
const glad = (id: string, o: Partial<Look>): Look => ({ ...MURMILLO, id, ...o });
/** eight more gladiators for the line of ten at the gate, each with his own body and armour */
export const THRAEX = glad("thraex", { P: { ...ROMAN, thigh: 220, shin: 210, hipW: 56, shW: 112, spine: 268 }, head: { a: 106, b: 112, H: 230, jaw: 1.0, round: 0.3 }, skin: "#e2b48c", brow: "#6a4424", hatCol: "#b8bec8", brim: 1.25, crestH: 0.3, accent: "#3f6fd0", mous: undefined, greave: "R", manica: "R", loin: "#e9dcc0", balteus: "#3a3a44",
  rows: [[-72, 100, 80, 84], [-10, 96, 80, 76], [90, 98, 84, 70], [200, 114, 82, 68], [250, 116, 60, 60], [274, 52, 38, 42]], arm: [30, 24, 17], leg: [36, 27, 18] });
export const SECUTOR = glad("secutor", { P: { ...ROMAN, thigh: 200, shin: 188, hipW: 70, shW: 130, spine: 262 }, head: { a: 118, b: 118, H: 232, jaw: 1.2, round: 0.25 }, skin: "#a86c44", brow: "#1a120c", hatCol: "#d8dce2", brim: 0.35, crestH: 0.14, mous: undefined, beard: "#1a120c", loin: "#f3ead6", balteus: "#5a3a22",
  rows: [[-72, 120, 92, 96], [-10, 116, 96, 90], [90, 118, 100, 82], [196, 134, 96, 78], [250, 132, 70, 70], [276, 60, 42, 46]], arm: [38, 30, 21], leg: [44, 32, 21] });
export const HOPLOMACHUS = glad("hoplomachus", { head: { a: 108, b: 114, H: 232, jaw: 1.04, round: 0.35 }, skin: "#f0c8a2", brow: "#c08a3a", hatCol: "#d9b45a", brim: 1.1, crestH: 0.46, accent: "#e2b93a", mous: undefined, legs: "trousers", trous: "#efe6cf", greave: undefined, manica: "R" });
export const PROVOCATOR = glad("provocator", { P: { ...ROMAN, thigh: 208, shin: 198, hipW: 60, shW: 118, spine: 272 }, head: { a: 110, b: 114, H: 234, jaw: 1.06, round: 0.3 }, skin: "#8a5a3a", brow: "#120c08", hatCol: "#9aa2ae", brim: 0.6, crestH: 0.22, accent: "#c8402f", mous: undefined, armour: true, greave: "L", manica: "R" });
export const RETIARIUS2 = { ...RETIARIUS, id: "retiarius2", P: { ...RETIARIUS.P, thigh: 212, shin: 202, hipW: 58, shW: 108 }, head: { a: 110, b: 112, H: 230, jaw: 1.04, round: 0.4, eye: 0.86 }, skin: "#d9a070", brow: "#8a8078", hair: { col: "#9a9088", kind: "bald" as const }, beard: "#9a9088" };
export const RETIARIUS3 = { ...RETIARIUS, id: "retiarius3", head: { a: 100, b: 106, H: 224, jaw: 0.86, round: 0.6, eye: 1.0 }, skin: "#f2c9a6", brow: "#b5532a", hair: { col: "#c4662a", kind: "short" as const }, manica: "R" as const, galerus: "R" as const };
export const MURMILLO2 = glad("murmillo2", { P: { ...MURMILLO.P, thigh: 225, shin: 210, spine: 280 }, head: { a: 114, b: 118, H: 240, jaw: 1.16, round: 0.25 }, skin: "#c98f60", brow: "#3a2418", hatCol: "#b08a3a", crestH: 0.5, accent: "#2f8a5c", mous: undefined, beard: "#3a2418" });
/** the tenth, carried out on the stretcher: alive, his shin bandaged, his helmet off */
export const CARRIED = { ...RETIARIUS, id: "carried", head: { a: 106, b: 110, H: 228, jaw: 0.98, round: 0.45 }, skin: "#c98f60", brow: "#3a2418", hair: { col: "#3a2418", kind: "short" as const }, wrapLeg: "R" as const };
/** the gladiators' trainer: an old fighter, broad and bald, a grey beard, a short brown tunic and a belt */
export const TRAINER: Look = { ...CITIZEN, id: "trainer", P: { ...ROMAN, hipW: 64, shW: 124, spine: 272, upper: 150, fore: 140 }, head: { a: 114, b: 116, H: 232, jaw: 1.14, round: 0.3, eye: 0.84 }, skin: "#c98f60", brow: "#9a9088", hair: { col: "#9a9088", kind: "bald" }, beard: "#9a9088", coat: "#8a5a36", accent: "#3a2418", belt: "#3a2418", arm: [33, 27, 19], leg: [40, 29, 19] };
/** a young gladiator at the school, in a short tunic, learning to hold the practice sword */
export const PUPIL: Look = { ...CITIZEN, id: "pupil", P: { ...ROMAN, thigh: 214, shin: 204, hipW: 54, shW: 106 }, head: { a: 102, b: 106, H: 222, jaw: 0.88, round: 0.6, eye: 1.0 }, skin: "#e9b48a", brow: "#3a2418", hair: { col: "#3a2418", kind: "short" }, coat: "#d9c08a", accent: "#7a4a26", belt: "#7a4a26" };
/** the owner of the school (the lanista): round and rich, a double chin, a wine-red tunic with a gold belt */
export const OWNER: Look = { ...COLLECTOR, id: "owner", head: { a: 124, b: 122, H: 232, jaw: 1.24, round: 0.75, eye: 0.82 }, skin: "#f0c8a2", brow: "#4a3020", hair: { col: "#4a3020", kind: "bald" }, mous: undefined, coat: "#8a2f4a", accent: "#e2b93a", cloak: undefined, belt: "#e2b93a" };
/** the arena's doctor: thin and grey, a white tunic with a blue edge, a short grey beard */
export const DOCTOR: Look = { ...CITIZEN, id: "doctor", P: { ...ROMAN, hipW: 52, shW: 98 }, head: { a: 104, b: 110, H: 230, jaw: 0.9, round: 0.4, eye: 0.88 }, skin: "#ecc29c", brow: "#b9b4aa", hair: { col: "#b9b4aa", kind: "short" }, beard: "#b9b4aa", coat: "#f6f1e4", accent: "#3f6fb0", belt: "#3f6fb0" };
/** the sponsor of the games in his box: a white tunic and a purple cloak, a laurel band */
export const SPONSOR: Look = { ...CITIZEN, id: "sponsor", head: { a: 114, b: 116, H: 234, jaw: 1.06, round: 0.45, eye: 0.86 }, skin: "#e9c3a0", brow: "#5a5a5a", hat: "band", hatCol: "#4f9a3f", hair: { col: "#6a6a6a", kind: "short" }, coat: "#fbf6ea", accent: "#e2b93a", cloak: "#7a2f8a", belt: "#e2b93a" };
/** the men who carry the stretcher: plain short tunics */
export const BEARER: Look = { ...CITIZEN, id: "bearer", coat: "#a8885a", accent: "#5a3a22", belt: "#5a3a22", skin: "#a86c44", brow: "#1a120c", hair: { col: "#1a120c", kind: "short" } };
export const BEARER2: Look = { ...CITIZEN, id: "bearer2", coat: "#7a8a6a", accent: "#4a3a2a", belt: "#4a3a2a", skin: "#e9b48a", brow: "#7a4a2a", hair: { col: "#7a4a2a", kind: "bald" } };
/** the murmillo in his full helmet: the visor with its grille down over the face (Jesper: with a grille, unless it looks too poor) */
export const MURMILLO_GRILLE: Look = { ...MURMILLO, id: "murmillo-grille", visor: "grille" };
export const MURMILLO_GRILLE_D = castDesign(MURMILLO_GRILLE, "the murmillo");
export const MURMILLO_EATER_D = castDesign(MURMILLO_EATER, "the murmillo");
export const MURMILLO_BARE_D = castDesign(MURMILLO_BARE, "the murmillo"), THRAEX_D = castDesign(THRAEX), SECUTOR_D = castDesign(SECUTOR), HOPLOMACHUS_D = castDesign(HOPLOMACHUS), PROVOCATOR_D = castDesign(PROVOCATOR);
export const RETIARIUS2_D = castDesign(RETIARIUS2), RETIARIUS3_D = castDesign(RETIARIUS3), MURMILLO2_D = castDesign(MURMILLO2), CARRIED_D = castDesign(CARRIED);
export const TRAINER_D = castDesign(TRAINER), PUPIL_D = castDesign(PUPIL), OWNER_D = castDesign(OWNER), DOCTOR_D = castDesign(DOCTOR), SPONSOR_D = castDesign(SPONSOR), BEARER_D = castDesign(BEARER), BEARER2_D = castDesign(BEARER2);

// ---------------- the Nero Short, version 2 ----------------
/** the historian Tacitus, writing about fifty years after the fire: grey, clean-shaven, a white toga with a senator's broad purple stripe */
export const TACITUS: Look = { ...CITIZEN, id: "tacitus", P: { ...ROMAN, hipW: 56, shW: 104 }, head: { a: 108, b: 114, H: 234, jaw: 0.94, round: 0.35, eye: 0.84 }, skin: "#e6b890", brow: "#8a8478", hair: { col: "#aaa59a", kind: "short" },
  coat: "#f6f1e4", accent: "#7a2f8a", clavi: "#7a2f8a", cloak: "#ece4d2", belt: undefined, sleeve: "long", arm: [28, 23, 17] };
export const TACITUS_D = castDesign(TACITUS, "Tacitus");

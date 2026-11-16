// The Looks of the cast: Sir Digsworth and the side characters, all on the one card figure of cast.ts and the one skeleton of rig.ts.
// A new figure is a new Look: sizes, colours, a hat, clothes. No new drawing code.
import { Props } from "./rig";
import { Look, drawCast } from "./cast";
import type { Design } from "./designs/common";

const TWEED = "#c2904c", TEAL = "#12a594";
/** Sir Digsworth: the jointed card figure with long legs, a waxed moustache no wider than his shoulders, a flared tweed jacket and a
 *  teal waistcoat, bow tie and cap band (the accent that holds against a colourful world) */
export const SIR: Look = {
  id: "sir",
  P: { thigh: 235, shin: 225, ankle: 26, foot: 132, hipW: 50, shW: 96, spine: 255, shDrop: 26, neck: 30, head: 200, upper: 150, fore: 140, hand: 84 },
  head: { a: 86, b: 92, H: 200 }, skin: "#f6cfa6", brow: "#4f3019",
  hat: "cap", hatCol: TWEED, hatBand: TEAL, hair: { col: "#6a4a2c", kind: "back" },
  mous: { col: "#4f3019", span: 1.24, curl: 1, w: 11 }, monocle: true, pipe: true,
  top: "jacket", coat: TWEED, accent: TEAL, weave: true,
  rows: [[-78, 104, 76, 80], [-10, 84, 66, 68], [70, 70, 58, 54], [170, 86, 68, 60], [232, 100, 58, 58], [258, 50, 36, 40]],
  legs: "trousers", trous: "#463a37", feet: "shoes", spats: true, sleeve: "long", arm: [30, 24, 17], leg: [34, 25, 17],
};
const ROMAN: Props = { thigh: 205, shin: 195, ankle: 24, foot: 126, hipW: 58, shW: 108, spine: 270, shDrop: 28, neck: 22, head: 192, upper: 146, fore: 134, hand: 88 };
export const BAKER: Look = {
  id: "baker", P: ROMAN, head: { a: 94, b: 92, H: 186, jaw: 1.02, round: 0.45 }, skin: "#eebf96", brow: "#4a3020",
  hat: "band", hatCol: "#fbf6ea", hair: { col: "#4a3020", kind: "short" },
  top: "tunic", coat: "#f2dc9c", accent: "#c8402f", apron: "#fdf9ef", belt: "#a05a34",
  rows: [[-150, 118, 88, 92], [-20, 112, 96, 86], [100, 104, 96, 78], [200, 110, 80, 70], [246, 112, 62, 62], [270, 56, 40, 44]],
  legs: "bare", feet: "sandals", sleeve: "short", arm: [28, 22, 16], leg: [36, 26, 17],
};
export const SOLDIER: Look = {
  id: "soldier", P: { ...ROMAN, thigh: 220, shin: 210, shW: 112, spine: 280 }, head: { a: 86, b: 90, H: 186, jaw: 1.04, round: 0.1 }, skin: "#e9b48a", brow: "#3a2a1e",
  hat: "helmet", hatCol: "#b9c3cd", mous: { col: "#3a2a1e", span: 0.8, curl: 0, w: 9 },
  top: "tunic", coat: "#cf3b30", accent: "#e23a2e", armour: true, belt: "#8a5a36",
  rows: [[-120, 112, 84, 88], [-10, 104, 86, 80], [90, 100, 84, 74], [200, 116, 84, 72], [254, 118, 64, 64], [280, 54, 40, 44]],
  legs: "bare", feet: "sandals", sleeve: "short", arm: [30, 24, 17], leg: [38, 27, 18],
};
export const MERCHANT: Look = {
  id: "merchant", P: { ...ROMAN, thigh: 190, shin: 180, spine: 280, hipW: 74, shW: 118, upper: 140, fore: 126 }, head: { a: 100, b: 100, H: 190, jaw: 1.12, round: 0.6 }, skin: "#ecc9a6", brow: "#6b4424",
  hat: "none", hair: { col: "#6b4424", kind: "bald" }, beard: "#6b4424",
  top: "tunic", coat: "#f1e6c6", accent: "#7a2f4a", cloak: "#8a2f58", belt: "#c9a03c",
  rows: [[-290, 138, 112, 112], [-150, 150, 138, 116], [0, 164, 176, 118], [110, 152, 168, 104], [205, 126, 110, 84], [254, 122, 70, 70], [280, 62, 46, 50]],
  legs: "bare", feet: "sandals", sleeve: "short", arm: [34, 27, 19], leg: [44, 31, 20],
};
/** a crusading knight: bucket helm, mail, a white surcoat with a red cross */
export const KNIGHT: Look = {
  id: "knight", P: { ...ROMAN, thigh: 225, shin: 215, shW: 116, spine: 285, hand: 90 }, head: { a: 84, b: 88, H: 184 }, skin: "#e9b48a", brow: "#3a2a1e",
  hat: "greathelm", hatCol: "#b9c3cd", top: "tunic", coat: "#f6f1e4", accent: "#d8342c", emblem: "cross", belt: "#6b4424", armCol: "#97a1ac",
  rows: [[-190, 116, 86, 90], [-20, 106, 88, 82], [90, 102, 86, 74], [205, 118, 84, 72], [260, 120, 64, 64], [286, 54, 40, 44]],
  legs: "trousers", trous: "#97a1ac", feet: "boots", sleeve: "long", arm: [31, 25, 18], leg: [38, 27, 19],
};
/** a British soldier of 1916: steel helmet, khaki tunic buttoned to the neck, belt, boots */
export const TOMMY: Look = {
  id: "tommy", P: { ...ROMAN, thigh: 228, shin: 218, spine: 258, shW: 84, hipW: 44, neck: 36, upper: 150, fore: 142, hand: 80 }, head: { a: 76, b: 84, H: 184, jaw: 0.8, round: 0.4, eye: 1.08 }, skin: "#f0c8a2", brow: "#8a5a2a",
  hat: "brodie", hatCol: "#7f7a45",
  top: "jacket", plain: true, coat: "#9a9150", accent: "#6b4424", belt: "#6b4424",
  rows: [[-66, 78, 58, 62], [-10, 70, 54, 56], [80, 60, 48, 46], [180, 72, 56, 50], [234, 86, 50, 50], [258, 44, 32, 36]],
  legs: "trousers", trous: "#8f8748", feet: "boots", sleeve: "long", arm: [24, 19, 14], leg: [29, 22, 16],
};
/** a lady of the 1890s: straw boater with a ribbon, hair in a knot, a dress to the ground */
export const LADY: Look = {
  id: "lady", P: { ...ROMAN, thigh: 205, shin: 195, shW: 86, hipW: 50, spine: 250, upper: 136, fore: 126, hand: 74, head: 184 }, head: { a: 80, b: 86, H: 180, jaw: 0.82, round: 0.6, eye: 1.1 }, skin: "#f8d6b4", brow: "#6a3f24",
  hat: "boater", hatCol: "#f0d68a", hatBand: "#3f6fd0", hair: { col: "#7a4a2a", kind: "bun" }, lash: true, lips: "#d8504c",
  top: "tunic", skirt: true, coat: "#3f6fd0", accent: "#fbf3df", belt: "#fbf3df",
  rows: [[-416, 170, 150, 170], [-300, 150, 130, 150], [-120, 112, 90, 104], [0, 78, 62, 66], [70, 62, 52, 50], [170, 76, 66, 56], [228, 88, 54, 54], [252, 44, 34, 38]],
  legs: "trousers", feet: "shoes", sleeve: "long", arm: [24, 19, 14], leg: [28, 20, 14],
};
/** a dock worker of the 1930s: bare-headed and bearded, blue work jacket, heavy boots (no flat cap: that shape is Sir Digsworth's) */
export const DOCKER: Look = {
  id: "docker", P: { ...ROMAN, thigh: 200, shin: 190, shW: 118, hipW: 62, spine: 275 }, head: { a: 96, b: 96, H: 188, jaw: 1.1, round: 0.15 }, skin: "#a9714a", brow: "#2a1c14",
  hat: "none", hair: { col: "#2a1c14", kind: "short" }, beard: "#2a1c14",
  top: "jacket", plain: true, coat: "#3f73b8", accent: "#2a1c14",
  rows: [[-60, 112, 88, 88], [0, 108, 92, 84], [100, 104, 94, 78], [195, 114, 84, 72], [248, 120, 64, 64], [274, 58, 42, 46]],
  legs: "trousers", trous: "#5a4a3a", feet: "boots", sleeve: "long", arm: [34, 27, 20], leg: [40, 29, 20],
};
/** a child: the same parts on a smaller skeleton with a larger head for its height */
export const BOY: Look = {
  id: "boy", P: { thigh: 112, shin: 106, ankle: 18, foot: 88, hipW: 38, shW: 62, spine: 150, shDrop: 16, neck: 10, head: 176, upper: 84, fore: 78, hand: 58 }, head: { a: 88, b: 90, H: 172, jaw: 0.84, round: 1, eye: 1.32 }, skin: "#f6cfa6", brow: "#b8742e",
  hat: "none", hair: { col: "#c4762a", kind: "short" },
  top: "tunic", coat: "#e2543c", accent: "#fbf3df", belt: "#7a4a2a",
  rows: [[-56, 74, 58, 60], [0, 70, 60, 56], [76, 62, 54, 48], [128, 64, 42, 42], [146, 36, 28, 30]],
  legs: "bare", feet: "sandals", sleeve: "short", arm: [19, 15, 11], leg: [24, 18, 12],
};
/** an old woman: small, white hair in a knot, a shawl over a long dark dress */
export const GRANNY: Look = {
  id: "granny", P: { ...ROMAN, thigh: 170, shin: 160, shW: 80, hipW: 50, spine: 222, neck: 14, upper: 124, fore: 114, hand: 72, head: 176 }, head: { a: 84, b: 88, H: 172, jaw: 0.74, round: 0.75, eye: 0.84 }, skin: "#f1cdb0", brow: "#d9d4cc",
  hat: "none", hair: { col: "#ece8e0", kind: "bun" },
  top: "tunic", skirt: true, coat: "#6b4a6e", accent: "#fbf3df", cloak: "#c9503c",
  rows: [[-340, 136, 112, 126], [-240, 126, 104, 118], [-100, 104, 86, 96], [0, 86, 74, 76], [90, 82, 76, 66], [170, 86, 70, 62], [204, 84, 54, 56], [224, 44, 34, 38]],
  legs: "trousers", feet: "shoes", sleeve: "long", arm: [23, 18, 13], leg: [27, 20, 14],
};
/** a Roman woman: a long dress, a shawl over one shoulder, hair in a knot */
export const ROMAN_WOMAN: Look = {
  id: "romanwoman", P: { ...ROMAN, thigh: 200, shin: 190, shW: 88, hipW: 52, spine: 250, upper: 136, fore: 126, hand: 74, head: 184 }, head: { a: 82, b: 88, H: 180, jaw: 0.84, round: 0.6, eye: 1.08 }, skin: "#efc39c", brow: "#3a2418",
  hat: "none", hair: { col: "#3a2418", kind: "bun" }, lash: true, lips: "#c8504c",
  top: "tunic", skirt: true, coat: "#3f9a8c", accent: "#fbf3df", cloak: "#e9b83a", belt: "#fbf3df",
  rows: [[-400, 132, 110, 124], [-280, 122, 102, 114], [-120, 104, 86, 96], [0, 86, 70, 72], [70, 72, 60, 56], [170, 80, 68, 58], [228, 90, 56, 56], [252, 44, 34, 38]],
  legs: "trousers", feet: "sandals", sleeve: "short", arm: [24, 19, 14], leg: [28, 20, 14],
};
export const castDesign = (L: Look, name = L.id): Design => ({ id: L.id, name, ol: 4.6, faceW: L.head.a * 1.45, props: () => L.P, draw: drawCast(L) });
export const SIR_D = castDesign(SIR, "Sir Digsworth"), BAKER_D = castDesign(BAKER), SOLDIER_D = castDesign(SOLDIER), MERCHANT_D = castDesign(MERCHANT);
export const KNIGHT_D = castDesign(KNIGHT), TOMMY_D = castDesign(TOMMY), LADY_D = castDesign(LADY), DOCKER_D = castDesign(DOCKER), BOY_D = castDesign(BOY), GRANNY_D = castDesign(GRANNY), ROMAN_WOMAN_D = castDesign(ROMAN_WOMAN);

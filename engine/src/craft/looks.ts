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
  id: "baker", P: ROMAN, head: { a: 92, b: 92, H: 190 }, skin: "#eebf96", brow: "#4a3020",
  hat: "band", hatCol: "#fbf6ea", hair: { col: "#4a3020", kind: "short" },
  top: "tunic", coat: "#f2dc9c", accent: "#c8402f", apron: "#fdf9ef", belt: "#a05a34",
  rows: [[-150, 118, 88, 92], [-20, 112, 96, 86], [100, 104, 96, 78], [200, 110, 80, 70], [246, 112, 62, 62], [270, 56, 40, 44]],
  legs: "bare", feet: "sandals", sleeve: "short", arm: [28, 22, 16], leg: [36, 26, 17],
};
export const SOLDIER: Look = {
  id: "soldier", P: { ...ROMAN, thigh: 220, shin: 210, shW: 112, spine: 280 }, head: { a: 86, b: 90, H: 186 }, skin: "#e9b48a", brow: "#3a2a1e",
  hat: "helmet", hatCol: "#b9c3cd", mous: { col: "#3a2a1e", span: 0.8, curl: 0, w: 9 },
  top: "tunic", coat: "#cf3b30", accent: "#e23a2e", armour: true, belt: "#8a5a36",
  rows: [[-120, 112, 84, 88], [-10, 104, 86, 80], [90, 100, 84, 74], [200, 116, 84, 72], [254, 118, 64, 64], [280, 54, 40, 44]],
  legs: "bare", feet: "sandals", sleeve: "short", arm: [30, 24, 17], leg: [38, 27, 18],
};
export const MERCHANT: Look = {
  id: "merchant", P: { ...ROMAN, spine: 276, hipW: 62 }, head: { a: 90, b: 94, H: 194 }, skin: "#ecc9a6", brow: "#6b4424",
  hat: "none", hair: { col: "#6b4424", kind: "bald" }, beard: "#6b4424",
  top: "tunic", coat: "#f1e6c6", accent: "#7a2f4a", cloak: "#8a2f58", belt: "#c9a03c",
  rows: [[-300, 116, 90, 94], [-150, 112, 92, 90], [0, 114, 108, 86], [110, 110, 106, 80], [205, 106, 82, 70], [250, 110, 62, 62], [276, 54, 40, 44]],
  legs: "bare", feet: "sandals", sleeve: "short", arm: [28, 22, 16], leg: [36, 26, 17],
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
  id: "tommy", P: { ...ROMAN, thigh: 215, shin: 205, spine: 262, shW: 102 }, head: { a: 84, b: 90, H: 188 }, skin: "#f0c8a2", brow: "#5a3a20",
  hat: "brodie", hatCol: "#7f7a45", mous: { col: "#5a3a20", span: 0.72, curl: 0, w: 9 },
  top: "jacket", plain: true, coat: "#9a9150", accent: "#6b4424", belt: "#6b4424",
  rows: [[-70, 96, 72, 76], [-10, 88, 68, 70], [80, 80, 62, 58], [180, 92, 70, 62], [238, 104, 60, 60], [264, 52, 38, 42]],
  legs: "trousers", trous: "#8f8748", feet: "boots", sleeve: "long", arm: [29, 23, 17], leg: [35, 26, 18],
};
/** a lady of the 1890s: straw boater with a ribbon, hair in a knot, a dress to the ground */
export const LADY: Look = {
  id: "lady", P: { ...ROMAN, thigh: 205, shin: 195, shW: 86, hipW: 50, spine: 250, upper: 136, fore: 126, hand: 74, head: 184 }, head: { a: 82, b: 88, H: 182 }, skin: "#f8d6b4", brow: "#6a3f24",
  hat: "boater", hatCol: "#f0d68a", hatBand: "#3f6fd0", hair: { col: "#7a4a2a", kind: "bun" }, lash: true, lips: "#d8504c",
  top: "tunic", skirt: true, coat: "#3f6fd0", accent: "#fbf3df", belt: "#fbf3df",
  rows: [[-416, 170, 150, 170], [-300, 150, 130, 150], [-120, 112, 90, 104], [0, 78, 62, 66], [70, 62, 52, 50], [170, 76, 66, 56], [228, 88, 54, 54], [252, 44, 34, 38]],
  legs: "trousers", feet: "shoes", sleeve: "long", arm: [24, 19, 14], leg: [28, 20, 14],
};
/** a dock worker of the 1930s: bare-headed and bearded, blue work jacket, heavy boots (no flat cap: that shape is Sir Digsworth's) */
export const DOCKER: Look = {
  id: "docker", P: { ...ROMAN, thigh: 200, shin: 190, shW: 118, hipW: 62, spine: 275 }, head: { a: 92, b: 94, H: 192 }, skin: "#a9714a", brow: "#2a1c14",
  hat: "none", hair: { col: "#2a1c14", kind: "short" }, beard: "#2a1c14",
  top: "jacket", plain: true, coat: "#3f73b8", accent: "#2a1c14",
  rows: [[-60, 112, 88, 88], [0, 108, 92, 84], [100, 104, 94, 78], [195, 114, 84, 72], [248, 120, 64, 64], [274, 58, 42, 46]],
  legs: "trousers", trous: "#5a4a3a", feet: "boots", sleeve: "long", arm: [34, 27, 20], leg: [40, 29, 20],
};
/** a child: the same parts on a smaller skeleton with a larger head for its height */
export const BOY: Look = {
  id: "boy", P: { thigh: 120, shin: 115, ankle: 18, foot: 92, hipW: 40, shW: 70, spine: 165, shDrop: 18, neck: 14, head: 168, upper: 92, fore: 86, hand: 62 }, head: { a: 80, b: 82, H: 168 }, skin: "#f6cfa6", brow: "#8a5a2a",
  hat: "none", hair: { col: "#b8742e", kind: "short" },
  top: "tunic", coat: "#e2543c", accent: "#fbf3df", belt: "#7a4a2a",
  rows: [[-60, 78, 60, 62], [0, 74, 62, 58], [80, 68, 58, 50], [140, 72, 46, 46], [158, 40, 30, 32]],
  legs: "bare", feet: "sandals", sleeve: "short", arm: [20, 16, 12], leg: [25, 19, 13],
};
export const castDesign = (L: Look, name = L.id): Design => ({ id: L.id, name, ol: 4.6, faceW: L.head.a * 1.45, props: () => L.P, draw: drawCast(L) });
export const SIR_D = castDesign(SIR, "Sir Digsworth"), BAKER_D = castDesign(BAKER), SOLDIER_D = castDesign(SOLDIER), MERCHANT_D = castDesign(MERCHANT);
export const KNIGHT_D = castDesign(KNIGHT), TOMMY_D = castDesign(TOMMY), LADY_D = castDesign(LADY), DOCKER_D = castDesign(DOCKER), BOY_D = castDesign(BOY);

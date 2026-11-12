// Extra drawings for the long Wojtek film "The Bear Who Joined the Army": a cigarette, a mug, a rubber stamp,
// banners, road signs, an open shell crate, the bear's travelling crate, a sheep, a light bulb, an arrow.
import { Pen, INK } from "./toon";

type P2 = [number, number];
const TWO = Math.PI * 2;
const text = (p: Pen, s: string, x: number, y: number, px: number, fill: string, stroke = 0) => {
  const g = p.g;
  g.font = `900 ${px}px 'Arial Black', Impact, 'Segoe UI Black', sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  if (stroke) { g.lineWidth = stroke; g.strokeStyle = INK; g.lineJoin = "round"; g.strokeText(s, x, y); }
  g.fillStyle = fill; g.fillText(s, x, y);
};
/** the largest size (up to `base`) at which `s` fits in `width` */
const fit = (s: string, base: number, width: number) => Math.min(base, width / (0.7 * Math.max(1, s.length)));

/** a cigarette on a 300 x 80 canvas: filter on the left, ember on the right */
export const fxCig = (p: Pen) => {
  p.poly([[20, 24], [280, 24], [280, 56], [20, 56]], "#fbf7ee", 8);
  p.poly([[24, 28], [92, 28], [92, 52], [24, 52]], "#d99a4e", 0);
  p.poly([[250, 28], [276, 28], [276, 52], [250, 52]], "#e2552b", 0);
};
/** an enamel mug on a 200 x 200 canvas */
export const fxMug = (p: Pen) => {
  p.arc(150, 108, 30, 38, -90, 90, 20); p.arc(150, 108, 30, 38, -90, 90, 9, "#f4f1e6");
  p.poly([[34, 44], [150, 44], [144, 176], [40, 176]], "#f4f1e6", 8);
  p.poly([[39, 60], [146, 60], [145, 82], [40, 82]], "#3d6a8a", 0);
  p.ell(92, 44, 58, 11, "#5a3a22", 7);
};
/** a red rubber stamp on a 640 x 220 canvas */
export const fxStamp = (p: Pen, s: string) => {
  const g = p.g;
  g.save(); g.fillStyle = "rgba(255,250,240,0.92)"; g.fillRect(18, 18, 604, 184);
  g.strokeStyle = "#c8312b"; g.lineWidth = 16; g.strokeRect(18, 18, 604, 184); g.lineWidth = 5; g.strokeRect(40, 40, 560, 140); g.restore();
  text(p, s, 320, 114, fit(s, 100, 520), "#c8312b");
};
/** a banner with one or two lines ("small heading|BIG LINE") on a 1000 x 260 canvas */
export const fxBanner = (p: Pen, s: string, fill = "#f6efd8") => {
  p.poly([[14, 14], [986, 14], [986, 246], [14, 246]], fill, 11);
  const L = s.split("|");
  if (L.length === 1) text(p, L[0], 500, 134, fit(L[0], 120, 900), "#2b2430");
  else { text(p, L[0], 500, 76, fit(L[0], 52, 900), "#6a5a40"); text(p, L[1], 500, 170, fit(L[1], 92, 900), "#2b2430"); }
};
/** a road sign on a post, 400 x 640 canvas */
export const fxRoadSign = (p: Pen, s: string) => {
  p.poly([[184, 200], [216, 200], [216, 632], [184, 632]], "#8a6a4a", 8);
  p.poly([[16, 26], [384, 26], [384, 214], [16, 214]], "#f6efd8", 11);
  text(p, s, 200, 122, fit(s, 104, 330), "#2b2430");
};
/** an open crate of 25-pounder ammunition with n shells standing in it (0..4), 800 x 520 canvas */
export const fxCrateOpen = (p: Pen, n: number) => {
  p.poly([[60, 150], [740, 150], [740, 230], [60, 230]], "#5a3f22", 10);
  for (let i = 0; i < n; i++) {
    const x = 145 + i * 170;
    p.poly([[x - 50, 232], [x + 50, 232], [x + 50, 128], [x - 50, 128]], "#d9a93a", 9);
    p.poly([[x - 46, 128], [x + 46, 128], [x + 42, 66], [x + 22, 22], [x, 8], [x - 22, 22], [x - 42, 66]], "#7d8a6a", 9);
    p.stroke([[x - 44, 104], [x + 44, 104]], 9, "#c9784a");
  }
  p.poly([[40, 204], [760, 204], [760, 500], [40, 500]], "#a9814c", 12);
  for (const y of [278, 352, 426]) p.stroke([[48, y], [752, y]], 6, "#5a3a1e");
  text(p, "25 PDR", 400, 352, 120, "#2c2118");
};
/** the bear's travelling crate, 640 x 520 canvas */
export const fxBigCrate = (p: Pen) => {
  p.poly([[20, 20], [620, 20], [620, 500], [20, 500]], "#b08a56", 12);
  for (const x of [170, 320, 470]) p.stroke([[x, 28], [x, 492]], 6, "#6a4a26");
  p.poly([[20, 20], [620, 20], [620, 70], [20, 70]], "#96713f", 10); p.poly([[20, 450], [620, 450], [620, 500], [20, 500]], "#96713f", 10);
  text(p, "WOJTEK", 320, 240, 104, "#3a2a18"); text(p, "THIS SIDE UP", 320, 372, 46, "#3a2a18");
};
/** a sheep seen side-on (head to the left), 400 x 320 canvas; k = chewing 0..1 */
export const fxSheep = (p: Pen, k = 0) => {
  for (const x of [136, 176, 252, 292]) p.stroke([[x, 226], [x, 304]], 18, "#3a3432");
  for (let i = 0; i < 11; i++) { const a = (TWO * i) / 11; p.ell(214 + 122 * Math.cos(a), 168 + 70 * Math.sin(a), 38, 34, "#f4f1e6", 9); }
  p.ell(214, 168, 122, 72, "#f4f1e6", 0);
  p.ell(122, 122, 20, 11, "#4a4340", 7, 0, 360, -25);
  p.ell(86, 150 + 5 * k, 46, 38, "#4a4340", 8);
  p.dot(72, 142 + 5 * k, 8, "#ffffff"); p.dot(70, 142 + 5 * k, 4);
};
/** a light bulb (an idea), 200 x 260 canvas */
export const fxBulb = (p: Pen) => {
  for (let i = 0; i < 7; i++) { const a = Math.PI + (Math.PI * i) / 6; p.stroke([[100 + 82 * Math.cos(a), 108 + 82 * Math.sin(a)], [100 + 98 * Math.cos(a), 108 + 98 * Math.sin(a)]], 9, "#ffe14d"); }
  p.poly([[72, 150], [128, 150], [122, 214], [78, 214]], "#b9bcc4", 8);
  p.ell(100, 108, 62, 62, "#ffe14d", 9);
};
/** a fat arrow pointing right, 400 x 160 canvas */
export const fxArrow = (p: Pen) => { p.poly([[20, 56], [250, 56], [250, 16], [380, 80], [250, 144], [250, 104], [20, 104]] as P2[], "#ffe14d", 10); };

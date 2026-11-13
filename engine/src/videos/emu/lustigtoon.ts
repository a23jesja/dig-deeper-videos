// Drawings for "The Man Who Sold the Eiffel Tower" (Victor Lustig, 1925): the tower, a newspaper, a letter on
// ministry paper, a briefcase of francs, a "for sale" tag, the Statue of Liberty, a money box.
import { Pen, INK } from "./toon";

type P2 = [number, number];
const text = (p: Pen, s: string, x: number, y: number, px: number, fill: string) => {
  const g = p.g;
  g.font = `900 ${px}px 'Arial Black', Impact, 'Segoe UI Black', sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = fill; g.fillText(s, x, y);
};
const fitPx = (s: string, base: number, width: number) => Math.min(base, width / (0.66 * Math.max(1, s.length)));
const IRON = "#8d6e55", IRON_D = "#6b5140";

/** the Eiffel Tower, 700 x 1400 canvas (feet at y = 1380) */
export const fxEiffel = (p: Pen) => {
  const body: P2[] = [[60, 1380], [200, 1380], [232, 1190], [350, 1075], [468, 1190], [500, 1380], [640, 1380], [556, 1000], [452, 700], [374, 170], [360, 124], [360, 44], [340, 44], [340, 124], [326, 170], [248, 700], [144, 1000]];
  p.poly(body, IRON, 12);
  p.clip(body, () => {
    for (let y = 150; y < 1380; y += 62) { p.stroke([[0, y], [700, y + 62]], 5, IRON_D); p.stroke([[700, y], [0, y + 62]], 5, IRON_D); }
  });
  p.poly(body, null, 12);
  p.poly([[122, 986], [578, 986], [578, 1018], [122, 1018]], IRON_D, 9);
  p.poly([[232, 690], [468, 690], [468, 714], [232, 714]], IRON_D, 9);
  p.poly([[300, 296], [400, 296], [400, 314], [300, 314]], IRON_D, 8);
  p.poly([[344, 8], [356, 8], [356, 46], [344, 46]], IRON_D, 6);
};
/** a "for sale" tag hung on something, 420 x 260 canvas */
export const fxForSale = (p: Pen, s = "FOR SALE") => {
  p.stroke([[210, 6], [210, 40]], 8);
  p.poly([[20, 40], [400, 40], [400, 240], [20, 240]], "#fff3c4", 11);
  text(p, s, 210, 142, fitPx(s, 86, 350), "#c8312b");
};
/** a newspaper, 420 x 520 canvas: masthead, a small tower, lines of print */
export const fxNewspaper = (p: Pen, head = "LE JOURNAL") => {
  p.poly([[20, 16], [400, 16], [400, 504], [20, 504]], "#f1ecdc", 10);
  text(p, head, 210, 62, fitPx(head, 56, 340), "#2b2430"); p.stroke([[40, 100], [380, 100]], 6);
  p.poly([[70, 300], [100, 300], [106, 250], [130, 228], [154, 250], [160, 300], [190, 300], [172, 220], [150, 160], [134, 122], [126, 122], [110, 160], [88, 220]], IRON, 6);
  for (let i = 0; i < 7; i++) p.stroke([[220, 130 + i * 28], [i === 6 ? 320 : 380, 130 + i * 28]], 7, "#8b8478");
  for (let i = 0; i < 5; i++) p.stroke([[44, 340 + i * 30], [i === 4 ? 260 : 380, 340 + i * 30]], 7, "#8b8478");
};
/** a letter on official paper with a seal, 420 x 520 canvas */
export const fxLetter = (p: Pen, head = "MINISTÈRE") => {
  p.poly([[20, 16], [400, 16], [400, 504], [20, 504]], "#fbf6e6", 10);
  text(p, head, 210, 64, fitPx(head, 50, 330), "#2a3f7a"); p.stroke([[60, 104], [360, 104]], 5, "#2a3f7a");
  for (let i = 0; i < 8; i++) p.stroke([[52, 150 + i * 34], [i === 7 ? 220 : 368, 150 + i * 34]], 7, "#8b8478");
  p.ell(318, 432, 44, 44, "#c8312b", 7); p.ell(318, 432, 24, 24, "#e2607a", 0);
};
/** an open briefcase full of banknotes, 520 x 380 canvas */
export const fxCash = (p: Pen) => {
  p.poly([[40, 170], [480, 170], [480, 350], [40, 350]], "#6a4a2c", 11);
  p.poly([[60, 30], [460, 30], [480, 170], [40, 170]], "#7a5a3a", 11);
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) { const x = 72 + c * 98, y = 196 + r * 70; p.poly([[x, y], [x + 86, y], [x + 86, y + 54], [x, y + 54]], "#bfe0a8", 6); p.ell(x + 43, y + 27, 15, 15, "#8fc07a", 4); }
  p.poly([[226, 4], [294, 4], [294, 34], [226, 34]], null, 9);
};
/** the Statue of Liberty, far away, 420 x 900 canvas */
export const fxLiberty = (p: Pen) => {
  const C = "#7fb7a4";
  p.poly([[120, 890], [300, 890], [286, 640], [134, 640]], "#b9b3a6", 10);
  p.poly([[150, 640], [270, 640], [262, 330], [236, 250], [184, 250], [158, 330]], C, 10);
  p.poly([[236, 280], [286, 190], [300, 80], [318, 82], [312, 200], [262, 330]], C, 9);
  p.poly([[292, 80], [326, 80], [334, 40], [309, 6], [284, 40]], "#e2bb4c", 8);
  p.ell(210, 210, 44, 50, C, 10);
  for (const a of [-60, -30, 0, 30, 60]) { const r = (a * Math.PI) / 180; p.stroke([[210 + 44 * Math.sin(r), 176 - 40 * Math.cos(r)], [210 + 84 * Math.sin(r), 150 - 76 * Math.cos(r)]], 10, INK); p.stroke([[210 + 44 * Math.sin(r), 176 - 40 * Math.cos(r)], [210 + 80 * Math.sin(r), 152 - 72 * Math.cos(r)]], 5, C); }
  p.poly([[142, 420], [196, 400], [204, 500], [150, 520]], "#9ccfbc", 8);
};
/** the "Rumanian Box": a mahogany money box with a crank and two slots, 520 x 380 canvas */
export const fxMoneyBox = (p: Pen) => {
  p.poly([[40, 80], [480, 80], [480, 350], [40, 350]], "#7a3f2a", 12);
  p.poly([[40, 80], [480, 80], [480, 120], [40, 120]], "#5a2c1c", 0);
  for (const y of [170, 250]) p.poly([[90, y], [300, y], [300, y + 22], [90, y + 22]], "#1c1410", 5);
  p.ell(400, 220, 46, 46, "#d0a53c", 9); p.stroke([[400, 220], [452, 168]], 12, INK); p.dot(456, 164, 15, "#2b2026");
  for (const x of [70, 450]) for (const y of [100, 330]) p.dot(x, y, 8, "#d0a53c");
};

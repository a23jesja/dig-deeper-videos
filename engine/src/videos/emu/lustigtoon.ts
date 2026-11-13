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

// ---------------- extra drawings for the long film ----------------
/** one banknote, 320 x 170 canvas (fake = a red cross through it) */
export const fxNote = (p: Pen, fake = false) => {
  p.poly([[14, 14], [306, 14], [306, 156], [14, 156]], "#bfe0a8", 9);
  p.poly([[34, 34], [286, 34], [286, 136], [34, 136]], null, 4);
  p.ell(160, 85, 34, 34, "#8fc07a", 5); text(p, "$", 160, 88, 44, "#3a5a2c");
  if (fake) { p.stroke([[30, 30], [290, 140]], 14, "#c8312b"); p.stroke([[290, 30], [30, 140]], 14, "#c8312b"); }
};
/** a clock face with one hand (k = turns), 300 x 300 canvas */
export const fxClock = (p: Pen, k = 0) => {
  p.ell(150, 150, 132, 132, "#fbf6e6", 12);
  for (let i = 0; i < 12; i++) { const a = (Math.PI * 2 * i) / 12; p.stroke([[150 + 104 * Math.sin(a), 150 - 104 * Math.cos(a)], [150 + 120 * Math.sin(a), 150 - 120 * Math.cos(a)]], i % 3 ? 5 : 10); }
  const a = Math.PI * 2 * k; p.stroke([[150, 150], [150 + 92 * Math.sin(a), 150 - 92 * Math.cos(a)]], 12); p.dot(150, 150, 12);
};
/** a safe, 420 x 480 canvas; open = the door swung aside and banknotes inside */
export const fxSafe = (p: Pen, open = false) => {
  p.poly([[30, 30], [390, 30], [390, 450], [30, 450]], "#5a6470", 12);
  if (open) { p.poly([[60, 60], [360, 60], [360, 420], [60, 420]], "#262a30", 8); for (let r = 0; r < 3; r++) p.poly([[90, 330 - r * 44], [330, 330 - r * 44], [330, 366 - r * 44], [90, 366 - r * 44]], "#bfe0a8", 6); }
  else { p.poly([[60, 60], [360, 60], [360, 420], [60, 420]], "#6f7a88", 8); p.ell(210, 240, 62, 62, "#c9ccd2", 9); for (let i = 0; i < 4; i++) { const a = (Math.PI * i) / 2 + 0.5; p.stroke([[210, 240], [210 + 56 * Math.cos(a), 240 + 56 * Math.sin(a)]], 9); } p.poly([[318, 210], [344, 210], [344, 290], [318, 290]], "#c9ccd2", 6); }
};
/** a candlestick telephone, 240 x 360 canvas */
export const fxPhone = (p: Pen) => {
  p.poly([[60, 330], [180, 330], [164, 290], [76, 290]], "#2b2b30", 9);
  p.poly([[108, 290], [132, 290], [132, 120], [108, 120]], "#2b2b30", 8);
  p.ell(120, 96, 40, 34, "#2b2b30", 9); p.ell(120, 92, 22, 16, "#6f7a88", 0);
  p.stroke([[132, 200], [196, 200], [196, 120]], 9); p.poly([[176, 60], [216, 60], [222, 130], [170, 130]], "#2b2b30", 8);
};
/** a key, 320 x 150 canvas */
export const fxKey = (p: Pen) => {
  p.ell(70, 75, 52, 52, "#d0a53c", 10); p.ell(70, 75, 22, 22, "#fbf6e6", 7);
  p.poly([[118, 62], [300, 62], [300, 88], [118, 88]], "#d0a53c", 9);
  p.poly([[236, 88], [262, 88], [262, 122], [236, 122]], "#d0a53c", 8); p.poly([[276, 88], [300, 88], [300, 112], [276, 112]], "#d0a53c", 8);
};
/** a station locker, 420 x 620 canvas; open = full of banknotes and two printing plates */
export const fxLocker = (p: Pen, open = false) => {
  p.poly([[30, 20], [390, 20], [390, 600], [30, 600]], "#7a8794", 12);
  if (!open) { p.poly([[56, 46], [364, 46], [364, 574], [56, 574]], "#8f9ba8", 8); for (let i = 0; i < 4; i++) p.stroke([[110, 90 + i * 22], [310, 90 + i * 22]], 7, "#5a6470"); p.ell(330, 320, 16, 16, "#2b2b30", 6); text(p, "51", 210, 250, 90, "#3a4450"); return; }
  p.poly([[56, 46], [364, 46], [364, 574], [56, 574]], "#22262c", 8);
  for (let r = 0; r < 5; r++) for (let c = 0; c < 2; c++) p.poly([[78 + c * 142, 300 + r * 52], [200 + c * 142, 300 + r * 52], [200 + c * 142, 342 + r * 52], [78 + c * 142, 342 + r * 52]], "#bfe0a8", 6);
  for (const x of [84, 220]) { p.poly([[x, 100], [x + 116, 100], [x + 116, 250], [x, 250]], "#8d6e55", 8); p.poly([[x + 16, 118], [x + 100, 118], [x + 100, 232], [x + 16, 232]], null, 5); }
};
/** a knotted rope hanging down, 80 x 900 canvas */
export const fxRope = (p: Pen) => { p.stroke([[40, 0], [40, 900]], 26, INK); p.stroke([[40, 0], [40, 900]], 14, "#c9a777"); for (let y = 90; y < 900; y += 150) p.ell(40, y, 22, 16, "#b08a56", 7); };
/** a barred window in a brick wall, 700 x 560 canvas */
export const fxBars = (p: Pen) => {
  p.poly([[10, 10], [690, 10], [690, 550], [10, 550]], "#a5694f", 12);
  for (let r = 0; r < 7; r++) for (let c = 0; c < 6; c++) p.poly([[20 + c * 112 + (r % 2 ? 56 : 0), 20 + r * 76], [124 + c * 112 + (r % 2 ? 56 : 0), 20 + r * 76], [124 + c * 112 + (r % 2 ? 56 : 0), 88 + r * 76], [20 + c * 112 + (r % 2 ? 56 : 0), 88 + r * 76]], null, 4);
  p.poly([[220, 130], [480, 130], [480, 420], [220, 420]], "#1c2026", 12);
  for (let i = 1; i < 5; i++) p.stroke([[220 + i * 52, 130], [220 + i * 52, 420]], 14, "#8f9ba8");
};
/** Alcatraz: a rock in the bay with the prison and a lighthouse, 1000 x 520 canvas (waterline at y = 480) */
export const fxAlcatraz = (p: Pen) => {
  p.poly([[40, 480], [120, 360], [260, 300], [420, 270], [640, 280], [820, 340], [960, 480]], "#8f8a80", 12);
  p.poly([[300, 300], [300, 190], [660, 190], [660, 290]], "#d9d2c0", 10);
  for (let i = 0; i < 8; i++) p.poly([[324 + i * 42, 214], [344 + i * 42, 214], [344 + i * 42, 250], [324 + i * 42, 250]], "#3a4450", 0);
  p.poly([[720, 320], [720, 150], [760, 150], [760, 330]], "#f4efe0", 9); p.poly([[708, 150], [772, 150], [740, 104]], "#c8312b", 8); p.dot(740, 168, 12, "#ffe14d");
};
/** a sheriff's star, 200 x 200 canvas */
export const fxStar = (p: Pen) => { const pts: P2[] = []; for (let i = 0; i < 10; i++) { const a = (Math.PI * 2 * i) / 10 - Math.PI / 2, r = i % 2 ? 40 : 92; pts.push([100 + r * Math.cos(a), 100 + r * Math.sin(a)]); } p.poly(pts, "#e2bb4c", 9); p.dot(100, 100, 14, "#b98f2c"); };
/** a wallet, 260 x 200 canvas */
export const fxWallet = (p: Pen) => { p.poly([[20, 40], [240, 40], [240, 170], [20, 170]], "#7a4a2c", 10); p.stroke([[20, 96], [240, 96]], 6, "#5a3420"); p.poly([[150, 20], [226, 20], [226, 60], [150, 60]], "#bfe0a8", 6); p.ell(206, 124, 14, 14, "#d0a53c", 6); };

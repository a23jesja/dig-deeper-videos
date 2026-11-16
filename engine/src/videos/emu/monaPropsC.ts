// Drawings for shots 51-70 of "The Man Who Stole the Mona Lisa" (chapter 5, the empty wall, and the first wrong man):
// the notice board at the Louvre, a train of the right size, a poster column, a news kiosk, the things inside bubbles.
import { Pen, INK } from "./toon";
import { drawMona, fxMona, fxThumb, fxFrontPage } from "./monatoon";

type P2 = [number, number];
const B = (x0: number, y0: number, x1: number, y1: number): P2[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const text = (p: Pen, s: string, x: number, y: number, px: number, fill: string, stroke = 0, font = "'Arial Black', Impact, 'Segoe UI Black', sans-serif") => {
  const g = p.g;
  g.font = `900 ${px}px ${font}`; g.textAlign = "center"; g.textBaseline = "middle";
  if (stroke) { g.lineWidth = stroke; g.strokeStyle = INK; g.lineJoin = "round"; g.strokeText(s, x, y); }
  g.fillStyle = fill; g.fillText(s, x, y);
};
const RED = "#d8382f", PAPER = "#fbf6e6", GOLD = "#d9a93a";

/** a notice board on two legs, 900 x 860 canvas (stands on y = 850): the museum is closed */
export const fxClosedBoard = (p: Pen) => {
  for (const x of [170, 730]) p.poly(B(x - 20, 520, x + 20, 850), "#6a4a2c", 9);
  for (const x of [170, 730]) p.poly(B(x - 60, 830, x + 60, 852), "#5a3f26", 8);
  p.poly(B(20, 20, 880, 560), "#8a2f33", 12); p.poly(B(48, 48, 852, 532), null, 6);
  text(p, "THE MUSEUM IS", 450, 122, 62, "#f1d98a");
  text(p, "CLOSED", 450, 286, 168, "#ffffff");
  p.poly(B(250, 404, 650, 496), "#f6efd8", 7); text(p, "7 DAYS", 450, 453, 66, "#8a2f33");
};

/** a magnifying glass with the thumb print large inside it, 340 x 340 canvas (the same glass as fxLens) */
export const fxLensPrint = (p: Pen) => {
  const g = p.g;
  p.line([[210, 210], [316, 316]], "#6a4424", 22);
  g.save(); g.beginPath(); g.arc(140, 140, 108, 0, Math.PI * 2); g.clip();
  g.fillStyle = "#e6f1fa"; g.fillRect(0, 0, 340, 340);
  g.translate(140 - 220 * 0.78, 140 - 236 * 0.78); g.scale(0.78, 0.78); fxThumb(p, true);
  g.restore();
  p.arc(140, 140, 112, 112, 0, 360, 22, INK); p.arc(140, 140, 112, 112, 0, 360, 10, "#c9ccd2");
  p.stroke([[66, 120], [112, 66]], 10, "rgba(255,255,255,0.75)");
};

/** rails on sleepers, 2400 x 24 canvas: the rail's top edge is at y = 3 */
export const fxRails = (p: Pen) => {
  for (let x = 20; x < 2400; x += 72) p.poly(B(x, 12, x + 32, 22), "#6a4a2c", 3);
  p.poly(B(-10, 3, 2410, 12), "#8f9ba8", 3);
};
/** a hand and a sleeve reaching in from the lower right, 500 x 500 canvas: the fist is at (100, 100) */
export const fxArmC = (p: Pen) => {
  p.line([[176, 176], [560, 560]], "#5a5648", 92);
  p.line([[150, 150], [160, 160]], "#f4efe0", 98);
  p.ell(100, 100, 56, 50, "#ffe2c2", 10, 0, 360, 45);
  for (const d of [-22, 0, 22]) p.stroke([[78 + d, 92 - d], [104 + d, 118 - d]], 5, "#c99a78");
};
/** a steam locomotive and one carriage, 1500 x 640 canvas (the wheels stand on y = 600); it faces screen-right */
export const fxTrainC = (p: Pen) => {
  const BODY = "#2f4a44", DARK = "#22262c", CAR = "#7a3f2a";
  // steam
  for (const [x, y, r] of [[1290, 96, 50], [1220, 52, 40], [1150, 26, 28]] as const) p.ell(x, y, r, r * 0.74, "#eeeef2", 7);
  // carriage
  p.poly(B(40, 250, 640, 500), CAR, 11); p.poly(B(22, 222, 658, 256), "#3a3530", 9);
  for (let i = 0; i < 4; i++) p.poly(B(80 + i * 112, 290, 160 + i * 112, 390), "#bfe3f5", 7);
  p.poly(B(540, 284, 610, 496), "#6a3422", 7); p.poly(B(554, 300, 596, 372), "#bfe3f5", 5); p.dot(602, 410, 7, GOLD);
  p.stroke([[60, 430], [520, 430]], 6, "#e9c85a");
  p.poly(B(640, 452, 710, 470), DARK, 6);
  for (const x of [130, 240, 440, 550]) { p.ell(x, 552, 48, 48, DARK, 10); p.ell(x, 552, 18, 18, "#8f9ba8", 5); }
  // locomotive: cab, boiler, smokebox, chimney, dome
  p.poly(B(700, 190, 920, 500), BODY, 11); p.poly(B(682, 164, 938, 196), DARK, 9);
  p.poly(B(736, 232, 880, 340), "#bfe3f5", 7);
  p.poly(B(920, 300, 1400, 480), BODY, 11);
  for (const x of [1040, 1180]) p.stroke([[x, 304], [x, 476]], 7, "#e9c85a");
  p.poly(B(1380, 286, 1450, 492), DARK, 10);
  p.poly(B(1300, 170, 1356, 300), DARK, 9); p.poly(B(1284, 146, 1372, 178), DARK, 8);
  p.ell(1130, 300, 48, 44, GOLD, 9, 180, 360); p.poly(B(1082, 292, 1178, 308), GOLD, 7);
  p.poly(B(700, 480, 1470, 506), RED, 8);
  p.poly(B(1450, 440, 1490, 470), "#8f9ba8", 6); p.poly([[1450, 506], [1492, 590], [1420, 590]], RED, 8);
  for (const x of [790, 950, 1110]) { p.ell(x, 532, 68, 68, DARK, 10); p.ell(x, 532, 50, 50, "#3a4450", 5); p.ell(x, 532, 16, 16, "#c9ccd2", 5); }
  for (const x of [1270, 1380]) { p.ell(x, 558, 42, 42, DARK, 10); p.ell(x, 558, 15, 15, "#8f9ba8", 5); }
  p.stroke([[790, 560], [1110, 560]], 16, INK); p.stroke([[790, 560], [1110, 560]], 7, "#4a5560");
};
/** a plain wooden table seen from the front, 600 x 520 canvas (stands on y = 510; the top is at y = 60) */
export const fxTableC = (p: Pen) => {
  for (const x of [80, 520]) p.poly(B(x - 22, 110, x + 22, 510), "#6a4a2c", 9);
  p.poly(B(60, 110, 540, 170), "#7a5236", 8);
  p.poly(B(20, 60, 580, 112), "#9a6a40", 10);
};
/** trunks and bags waiting on the quay, 900 x 520 canvas (stand on y = 510) */
export const fxLuggage = (p: Pen) => {
  p.poly(B(40, 250, 480, 510), "#8a5a34", 11); for (const x of [130, 390]) p.poly(B(x - 18, 250, x + 18, 510), "#6a4424", 6); p.poly(B(236, 340, 284, 390), GOLD, 6);
  p.poly(B(500, 330, 860, 510), "#5a6f8a", 11); p.poly(B(640, 300, 720, 334), null, 10); for (const x of [570, 790]) p.poly(B(x - 14, 330, x + 14, 510), "#3f5068", 5);
  p.poly(B(120, 110, 430, 250), "#a9794e", 11); p.poly(B(236, 86, 314, 114), null, 10); p.poly(B(250, 160, 300, 200), GOLD, 6);
  p.ell(650, 268, 120, 66, "#b9a682", 10); p.stroke([[560, 250], [740, 250]], 6, "#8a7a5a");
};

/** a Paris poster column, 800 x 1300 canvas (stands on y = 1290): green, with a domed top */
export const fxColumn = (p: Pen) => {
  const G = "#2f5a4a", GD = "#234438";
  p.ell(400, 280, 300, 190, "#3f6f5c", 11, 180, 360); p.poly(B(376, 40, 424, 100), GD, 8); p.ell(400, 34, 26, 26, GOLD, 7);
  p.poly(B(110, 268, 690, 340), GD, 10);
  p.poly(B(140, 340, 660, 1200), G, 11);
  for (const x of [140, 660]) p.stroke([[x + (x < 400 ? 34 : -34), 352], [x + (x < 400 ? 34 : -34), 1190]], 9, "rgba(255,255,255,0.10)");
  p.poly(B(110, 1196, 690, 1290), GD, 10);
};
/** the reward poster, 460 x 620 canvas: a heading with room round it, her picture, lines of small print */
export const fxReward = (p: Pen) => {
  p.poly(B(20, 16, 440, 604), "#f6e9b8", 10); p.poly(B(44, 40, 416, 580), null, 4);
  text(p, "REWARD", 230, 100, 66, RED);
  drawMona(p, 140, 158, 180, 252);
  text(p, "MISSING", 230, 462, 46, "#2b2430");
  for (let i = 0; i < 2; i++) p.stroke([[96, 516 + i * 30], [364, 516 + i * 30]], 7, "#8b8478");
};

/** the front of a news kiosk, 1800 x 1040 canvas: green boards, a striped canopy along the top, a line to hang papers on (y = 250) */
export const fxKiosk = (p: Pen) => {
  const g = p.g;
  g.fillStyle = "#2f5a4a"; g.fillRect(0, 0, 1800, 1040);
  for (let x = 0; x <= 1800; x += 120) { g.fillStyle = "rgba(0,0,0,0.16)"; g.fillRect(x - 3, 0, 6, 1040); g.fillStyle = "rgba(255,255,255,0.05)"; g.fillRect(x + 3, 0, 5, 1040); }
  g.fillStyle = "#234438"; g.fillRect(0, 900, 1800, 140); g.fillStyle = INK; g.fillRect(0, 894, 1800, 9);
  for (let i = 0; i < 15; i++) {
    const x = i * 120;
    p.poly([[x, 0], [x + 120, 0], [x + 120, 120], [x + 60, 168], [x, 120]], i % 2 ? "#f4efe0" : "#c8553a", 8);
  }
  p.stroke([[0, 250], [1800, 250]], 10, INK); p.stroke([[0, 250], [1800, 250]], 4, "#e9dfc8");
  // the counter, with the day's papers in piles
  p.poly(B(-20, 850, 1820, 894), "#8a5a34", 9);
  for (const [x, n] of [[330, 2], [520, 3], [1280, 3], [1470, 2]] as const) for (let i = 0; i < n; i++) { p.poly(B(x - 70, 826 - i * 22, x + 70, 850 - i * 22), i % 2 ? "#e9e2cf" : "#f6efdc", 5); p.stroke([[x - 50, 838 - i * 22], [x + 10, 838 - i * 22]], 5, "#2b2430"); }
};
/** a front page hanging from the line by two pegs, 600 x 830 canvas (the line passes at y = 40) */
export const fxHungPage = (p: Pen, mast: string, head: string) => {
  const g = p.g; g.save(); g.translate(0, 70); fxFrontPage(p, mast, head); g.restore();
  for (const x of [150, 450]) { p.poly(B(x - 13, 8, x + 13, 104), "#c9a25a", 6); p.stroke([[x - 13, 40], [x + 13, 40]], 5, "#8a6a3c"); }
};

/** inside a thought bubble: her picture and a question mark, 900 x 620 canvas */
export const fxMonaQ = (p: Pen) => {
  const g = p.g; g.save(); g.translate(70, 40); g.scale(0.58, 0.58); fxMona(p); g.restore();
  text(p, "?", 690, 330, 470, RED, 26);
};
/** inside a bubble: her picture struck out, 700 x 920 canvas */
export const fxMonaNo = (p: Pen) => {
  fxMona(p);
  for (const l of [[[110, 210], [590, 710]], [[590, 210], [110, 710]]] as P2[][]) p.stroke(l, 96, INK);
  for (const l of [[[110, 210], [590, 710]], [[590, 210], [110, 710]]] as P2[][]) p.stroke(l, 62, RED);
};
/** the patch of wall with the four hooks, numbered: fxHooks with every number disc the same distance from its hook, 700 x 920 canvas */
export const fxHooksC = (p: Pen, numbers = 0) => {
  const g = p.g; g.fillStyle = "#c2474b"; g.fillRect(40, 40, 620, 840);
  g.setLineDash([22, 16]); g.lineWidth = 10; g.strokeStyle = "rgba(50,14,18,0.9)"; g.strokeRect(40, 40, 620, 840); g.setLineDash([]);
  ([[190, 150], [510, 150], [190, 760], [510, 760]] as P2[]).forEach(([x, y], i) => {
    p.poly(B(x - 30, y - 38, x + 30, y + 6), "#5c6470", 8); p.stroke([[x, y], [x, y + 62], [x + 38, y + 62], [x + 38, y + 30]], 22, INK); p.stroke([[x, y], [x, y + 62], [x + 38, y + 62], [x + 38, y + 30]], 10, "#b9c0ca");
    // the hook reaches from x - 34 to x + 49: the disc sits 24 clear of it on the inner side
    if (i < numbers) { const bx = x < 350 ? x + 49 + 24 + 38 : x - 34 - 24 - 38; p.ell(bx, y + 14, 38, 38, "#ffe14d", 7); text(p, String(i + 1), bx, y + 17, 50, "#2b2430"); }
  });
};
/** a small card: an open notebook, a pen and an ink pot (a writer), 520 x 300 canvas */
export const fxWriterCard = (p: Pen) => {
  p.poly(B(14, 14, 506, 286), "#f6efd8", 11);
  p.poly([[70, 110], [210, 96], [214, 236], [74, 250]], PAPER, 7); p.poly([[210, 96], [350, 110], [346, 250], [214, 236]], PAPER, 7);
  for (let i = 0; i < 4; i++) { p.stroke([[96, 136 + i * 26], [190, 128 + i * 26]], 5, "#8b8478"); p.stroke([[234, 128 + i * 26], [i === 3 ? 290 : 326, 136 + i * 26]], 5, "#8b8478"); }
  p.poly(B(396, 176, 466, 250), "#2b2b30", 8); p.poly(B(408, 156, 454, 180), "#3a3f48", 7);
  p.line([[300, 214], [430, 60]], "#f4f1ea", 16); p.poly([[300, 214], [286, 244], [318, 226]], "#2b2430", 5);
  for (let i = 0; i < 4; i++) p.stroke([[352 + i * 20, 152 - i * 24], [384 + i * 20, 150 - i * 24]], 5, "#c9c4b6");
};
/** inside a thought bubble: two men nobody can make out yet, 900 x 520 canvas */
export const fxSuspects = (p: Pen) => {
  const D = "#3a3540";
  for (const [x, hat] of [[250, true], [650, false]] as const) {
    p.poly([[x - 170, 510], [x - 150, 380], [x - 70, 320], [x + 70, 320], [x + 150, 380], [x + 170, 510]], D, 10);
    p.ell(x, 220, 92, 108, D, 10);
    if (hat) { p.ell(x, 136, 108, 78, "#22202a", 10, 180, 360); p.poly(B(x - 150, 128, x + 150, 152), "#22202a", 8); }
    text(p, "?", x, 250, 150, "#ffe14d");
  }
};
/** a tied sack with something lumpy in it, 320 x 360 canvas (stands on y = 350) */
export const fxSack = (p: Pen) => {
  p.poly([[60, 350], [34, 250], [58, 150], [120, 96], [200, 96], [262, 150], [286, 250], [260, 350]], "#b9a682", 10);
  p.poly([[120, 96], [104, 40], [160, 58], [216, 40], [200, 96]], "#c9b892", 9);
  p.stroke([[112, 96], [208, 96]], 12, "#6a4a2c");
  p.stroke([[96, 190], [120, 300]], 5, "#9a8762"); p.stroke([[214, 170], [226, 290]], 5, "#9a8762");
};
/** fxTableC half as wide again, 900 x 520 canvas */
export const fxTableWide = (p: Pen) => { const g = p.g; g.save(); g.scale(1.5, 1); fxTableC(p); g.restore(); };
/** a speech or thought bubble with a picture filling it, 520 x 420 canvas (the same shape and tail as the stock bubbles);
 *  the picture is drawn by `inner` on its own cw x ch canvas */
export const fxPicBubble = (p: Pen, flip: boolean, thought: boolean, cw: number, ch: number, inner: (p: Pen) => void) => {
  const cx = 260, cy = 180, d = flip ? -1 : 1, pts: P2[] = [];
  if (thought) { p.ell(cx - d * 150, cy + 176, 26, 22, "#ffffff", 8); p.ell(cx - d * 196, cy + 214, 15, 13, "#ffffff", 7); }
  else p.poly([[cx - d * 150, cy + 110], [cx - d * 208, cy + 224], [cx - d * 80, cy + 140]], "#ffffff", 10);
  for (let i = 0; i < 64; i++) { const a = (Math.PI * 2 * i) / 64, w = thought ? 1 + 0.05 * Math.sin(a * 9) : 1; pts.push([cx + 240 * w * Math.cos(a), cy + 165 * w * Math.sin(a)]); }
  p.poly(pts, "#ffffff", 11);
  if (!thought) p.poly([[cx - d * 140, cy + 116], [cx - d * 196, cy + 206], [cx - d * 90, cy + 136]], "#ffffff", 0);
  const k = Math.min(300 / cw, 236 / ch), g = p.g;
  g.save(); g.translate(cx - (cw * k) / 2, cy - (ch * k) / 2); g.scale(k, k); inner(p); g.restore();
};
/** a liner at the quay seen over the roof of the train, 1800 x 700 canvas (the water line is y = 690): two raked funnels, masts, smoke */
export const fxSteamer = (p: Pen) => {
  for (const [x, y, r] of [[560, 70, 60], [470, 40, 46], [1010, 70, 60], [920, 40, 46]] as const) p.ell(x, y, r, r * 0.6, "#d9d9e0", 7);
  for (const x of [330, 1420]) { p.stroke([[x, 520], [x, 120]], 10); p.stroke([[x - 70, 200], [x + 70, 200]], 6); }
  p.stroke([[330, 130], [1420, 130]], 3);
  for (const x of [640, 1090]) { p.poly([[x - 60, 400], [x - 30, 110], [x + 80, 110], [x + 70, 400]], "#e9b93a", 11); p.poly([[x - 32, 170], [x - 30, 110], [x + 80, 110], [x + 78, 170]], "#22262c", 9); }
  p.poly(B(430, 330, 1340, 420), "#f4f1ea", 10); p.poly(B(330, 410, 1470, 500), "#f4f1ea", 10);
  for (let i = 0; i < 16; i++) p.ell(480 + i * 54, 374, 13, 13, "#3f5568", 4);
  for (let i = 0; i < 20; i++) p.poly(B(370 + i * 54, 440, 398 + i * 54, 474), "#3f5568", 4);
  p.poly([[90, 490], [1640, 490], [1760, 470], [1640, 690], [170, 690]], "#2b3040", 12);
  p.poly([[158, 640], [1668, 640], [1640, 690], [170, 690]], "#9a3b34", 0); p.poly([[90, 490], [1640, 490], [1760, 470], [1640, 690], [170, 690]], null, 12);
};

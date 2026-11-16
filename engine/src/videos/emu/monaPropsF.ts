// Drawings and extra people for shots 111-132 of "The Man Who Stole the Mona Lisa" (monaShots4b.ts): the 1932 magazine,
// the people nobody ever found, the Uffizi's dressing, the newspaper stand, today's visitors, the army camp, the
// churchyard, the 1947 front page and the cell.
import { Pen, INK, Outfit, SKINS } from "./toon";
import { Who } from "./castbase";
import { drawMona } from "./monatoon";
import { PER_SOLDIER } from "./monacast";

type P2 = [number, number];
const B = (x0: number, y0: number, x1: number, y1: number): P2[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const text = (p: Pen, s: string, x: number, y: number, px: number, fill: string, stroke = 0, font = "'Arial Black', Impact, 'Segoe UI Black', sans-serif", weight = 900) => {
  const g = p.g; g.font = `${weight} ${px}px ${font}`; g.textAlign = "center"; g.textBaseline = "middle";
  if (stroke) { g.lineWidth = stroke; g.strokeStyle = INK; g.lineJoin = "round"; g.strokeText(s, x, y); }
  g.fillStyle = fill; g.fillText(s, x, y);
};
const fit = (s: string, base: number, width: number) => Math.min(base, width / (0.82 * Math.max(1, s.length)));
const RED = "#d8382f", PAPER = "#f1ecdc", SERIF = "Georgia, 'Times New Roman', serif";
const W = (i: number, okey: string, o: Outfit): Who => ({ i, o, okey });

// ---------------- extra people ----------------
/** the forger of the marquis story: a painter in a smock and a beret */
export const FORGER = W(140, "forger", { jacket: "#d9cfb0", pants: "#4a4038", boots: "#4a3324", hat: "beret", cap: "#7a2f3a", moustache: "#2b2026", beard: "#2b2026", buttons: "#8a7a5a", skin: "#f0c8a0" });
/** a newspaper man of 1947 */
export const NEWSMAN = W(141, "newsman47", { jacket: "#5a6a7a", pants: "#3a3d48", boots: INK, hat: "hair", hair: "#6a4a2a", buttons: "#c9ccd2", tie: "#c8312b", skin: "#f5c9a0" });
/** Peruggia in uniform with his rifle, and two other Italian soldiers */
export const PER_RIFLE: Who = { i: PER_SOLDIER.i, okey: "perSoldierRifle", o: { ...PER_SOLDIER.o, rifle: true } };
export const SOLDIERS: Who[] = [
  W(142, "soldier0", { ...PER_SOLDIER.o, moustache: undefined, skin: "#f5c9a0", rifle: true }),
  W(143, "soldier1", { ...PER_SOLDIER.o, moustache: undefined, skin: "#ecd0b6", build: "stout", glasses: true, rifle: true }),
];
/** today's visitors: bare heads and caps, bright jackets, jeans */
const M_JACKET = ["#e0533d", "#3d8fe0", "#f2c744", "#49b36b", "#8a5ad6", "#ef8a3c", "#4ac0c8", "#d94f8a", "#6b7a8f", "#f4f1ea", "#2f3a44", "#b5d94a"];
const M_HAIR = ["#2b2026", "#6a4a2a", "#d9b24a", "#8a8a90", "#b0523a", "#1c1a1a", "#c9772e"];
export const MODERN: Who[] = Array.from({ length: 24 }, (_, k) => {
  const o: Outfit = { jacket: M_JACKET[(k * 5 + 1) % 12], pants: k % 3 ? "#3f5f8a" : "#3a3d48", boots: k % 2 ? "#f4f1ea" : "#3a3530", skin: SKINS[(k * 3) % 4], hat: k % 4 === 2 ? "cap" : "hair",
    hair: M_HAIR[(k * 4 + 2) % 7], cap: M_JACKET[(k * 7 + 3) % 12], buttons: M_JACKET[(k * 5 + 1) % 12], ...(k % 5 === 1 ? { glasses: true } : {}), ...(k % 6 === 3 ? { build: "stout" as const } : {}) };
  return W(150 + k, "modern" + k, k % 4 === 1 ? { ...o, dress: M_JACKET[(k * 7 + 4) % 12] } : o);
});

// ---------------- 111: the magazine ----------------
/** the magazine of 1932, 560 x 720 canvas */
export const fxPost32 = (p: Pen) => {
  p.poly(B(20, 16, 540, 704), "#f4e9c8", 10); p.poly(B(20, 16, 540, 176), "#2a4f9a", 10);
  text(p, "THE SATURDAY", 280, 64, 34, "#f1d98a"); text(p, "EVENING POST", 280, 122, 54, "#ffffff");
  text(p, "25 JUNE", 280, 214, 30, "#2b2430"); text(p, "1932", 280, 300, 116, RED, 12);
  text(p, "WHO REALLY", 280, 402, 38, "#2b2430"); text(p, "STOLE HER?", 280, 448, 38, "#2b2430");
  drawMona(p, 205, 486, 150, 204);
};

// ---------------- 112: never found ----------------
/** somebody nobody ever found: a blank cut-out with a dashed edge in the 600 x 1000 space of a person, a question mark for a face */
export const fxGhost = (p: Pen, hat: "tophat" | "beret") => {
  const g = p.g, parts: (() => void)[] = [
    () => g.ellipse(300, 548, 94, 130, 0, 0, 7), () => g.ellipse(300, 309, 112, 106, 0, 0, 7),
    hat === "tophat" ? () => { g.rect(234, 66, 132, 156); g.rect(196, 204, 208, 24); } : () => g.ellipse(304, 222, 132, 54, -0.1, 0, 7),
    () => g.rect(262, 396, 76, 44),
    () => { g.moveTo(214, 462); g.lineTo(240, 470); g.lineTo(204, 656); g.lineTo(180, 650); g.closePath(); g.moveTo(386, 462); g.lineTo(360, 470); g.lineTo(396, 656); g.lineTo(420, 650); g.closePath(); },
  ];
  g.lineJoin = "round"; g.lineCap = "butt"; g.setLineDash([24, 16]);
  for (const part of parts) { g.beginPath(); part(); g.lineWidth = 26; g.strokeStyle = INK; g.stroke(); }
  g.setLineDash([]);
  g.globalCompositeOperation = "destination-out"; for (const part of parts) { g.beginPath(); part(); g.fillStyle = "#000"; g.fill(); }
  g.globalCompositeOperation = "destination-over"; for (const part of parts) { g.beginPath(); part(); g.fillStyle = "#f3e6d3"; g.fill(); }
  g.globalCompositeOperation = "destination-over";
  for (const s of [-1, 1]) { p.stroke([[300 + s * 17, 640], [300 + s * 22, 962]], 22, INK); }
  g.globalCompositeOperation = "source-over";
  for (const s of [-1, 1]) { p.stroke([[300 + s * 17, 640], [300 + s * 22, 960]], 12, "#f3e6d3"); p.stroke([[300 + s * 14, 964], [300 + s * 44, 964]], 20, INK); p.stroke([[300 + s * 15, 964], [300 + s * 43, 964]], 11, "#f3e6d3"); }
  text(p, "?", 300, 322, 168, "#2b2430");
};

// ---------------- 116: the Uffizi ----------------
/** an engraved brass plate, 900 x 220 canvas: "SMALL LINE|BIG LINE" */
export const fxBrass = (p: Pen, s: string) => {
  p.poly(B(12, 12, 888, 208), "#c9a24a", 11); p.poly(B(34, 34, 866, 186), null, 4);
  const L = s.split("|"); text(p, L[0], 450, 76, fit(L[0], 44, 740), "#3a2a14"); text(p, L[1], 450, 142, fit(L[1], 74, 760), "#3a2a14");
  for (const [x, y] of [[52, 52], [848, 52], [52, 168], [848, 168]]) p.dot(x, y, 7, "#6a4a1c");
};
/** the Italian flag on a tall pole, 420 x 1000 canvas (stands on y = 990). base = a round foot (indoors), else planted in the
 *  ground; flip = the pole on the screen-right and the cloth flying to the screen-left; cols = the three bands from the pole */
export const IT_COLS = ["#3f9a55", "#ffffff", "#d8382f"], FR_COLS = ["#2a4f9a", "#ffffff", "#d8382f"];
export const fxFlagPole = (p: Pen, base = true, flip = false, cols = IT_COLS) => {
  const g = p.g; g.save(); if (flip) { g.translate(420, 0); g.scale(-1, 1); }
  if (base) { p.ell(70, 974, 62, 16, "#6a4a1c", 8); p.poly(B(52, 930, 88, 974), "#8a6a2c", 7); }
  p.poly(B(60, 40, 80, base ? 940 : 990), "#8a6a4a", 7); p.ell(70, 34, 17, 17, "#e9c85a", 7);
  cols.forEach((c, i) => p.poly([[80 + i * 104, 70 + i * 6], [184 + i * 104, 76 + i * 6], [184 + i * 104, 286 + i * 6], [80 + i * 104, 280 + i * 6]], c, 0));
  p.poly([[80, 70], [392, 88], [392, 298], [80, 280]], null, 10);
  g.restore();
};
/** two brass posts and a red rope between them, 1000 x 440 canvas (floor at y = 430) */
export const fxRope = (p: Pen) => {
  const rope: P2[] = []; for (let i = 0; i <= 20; i++) { const u = i / 20; rope.push([90 + 820 * u, 120 + 150 * 4 * u * (1 - u)]); }
  p.line(rope, "#b03a44", 16);
  for (const x of [90, 910]) { p.ell(x, 418, 54, 14, "#a87c22", 8); p.poly(B(x - 12, 96, x + 12, 414), "#d9a93a", 8); p.ell(x, 84, 24, 24, "#e9c85a", 8); }
};

// ---------------- 119: the newspaper stand ----------------
/** a newspaper stand with an awning and an empty board for six front pages, 1400 x 1300 canvas (ground at y = 1290) */
export const fxKiosk = (p: Pen) => {
  for (const x of [96, 1264]) p.poly(B(x, 300, x + 40, 1000), "#5a3a26", 9);
  p.poly(B(130, 316, 1270, 992), "#2f5a4a", 11);
  for (const y of [338, 668]) p.stroke([[150, y], [1250, y]], 5, "#e9dfc8");
  p.poly(B(84, 988, 1316, 1290), "#8a5a34", 11); for (let i = 1; i < 8; i++) p.stroke([[84 + i * 154, 1030], [84 + i * 154, 1280]], 5, "#6a4424");
  p.poly(B(60, 966, 1340, 1010), "#6a4424", 9);
  const top: P2 = [150, 190], n = 10, g = p.g;
  for (let i = 0; i < n; i++) { const a = i / n, b = (i + 1) / n; p.poly([[top[0] + 1100 * a, 190], [top[0] + 1100 * b, 190], [60 + 1280 * b, 316], [60 + 1280 * a, 316]], i % 2 ? "#f4efe0" : "#c8312b", 0); }
  p.poly([[150, 190], [1250, 190], [1340, 316], [60, 316]], null, 11);
  for (let i = 0; i < n; i++) { g.beginPath(); g.arc(60 + 1280 * (i + 0.5) / n, 316, 64, 0, Math.PI); g.fillStyle = i % 2 ? "#f4efe0" : "#c8312b"; g.fill(); g.lineWidth = 9; g.strokeStyle = INK; g.stroke(); }
  p.poly(B(380, 60, 1020, 196), "#fff3c4", 11); text(p, "JOURNAUX", 700, 132, 92, "#2b2430");
};

// ---------------- 121: today ----------------
/** a telephone held up to take a picture, seen from behind: her on its screen, 160 x 300 canvas */
export const fxPhoneCam = (p: Pen) => {
  p.poly([[26, 10], [134, 10], [150, 26], [150, 274], [134, 290], [26, 290], [10, 274], [10, 26]], "#22242c", 9);
  p.poly(B(24, 34, 136, 256), "#b9d6ea", 0); drawMona(p, 38, 60, 84, 118); p.dot(80, 273, 7, "#8a8f9c");
};

// ---------------- 123: the army camp ----------------
// (the flag: fxFlagPole(p, false))

// ---------------- 125, 126: the churchyard ----------------
/** a length of churchyard wall, 1600 x 300 canvas (ground at y = 292). pillar = a gate pillar at its screen-left end */
export const fxYardWall = (p: Pen, pillar = false) => {
  p.poly(B(0, 40, 1600, 292), "#cfc4a8", 9);
  for (let r = 0; r < 4; r++) { p.stroke([[0, 104 + r * 62], [1600, 104 + r * 62]], 4, "#a89c80"); for (let i = 0; i < 9; i++) { const x = 60 + i * 190 + (r % 2) * 95; p.stroke([[x, 42 + r * 62], [x, 104 + r * 62]], 4, "#a89c80"); } }
  p.poly(B(0, 12, 1600, 48), "#b3a688", 9);
  for (const [x, w] of [[180, 150], [820, 210], [1380, 120]]) { p.ell(x, 40, w, 46, "#5c8a52", 7, 0, 180); p.ell(x - w * 0.4, 70, w * 0.36, 40, "#6f9a66", 0); }
  if (pillar) { p.poly(B(6, 26, 86, 292), "#c2b698", 9); p.poly(B(0, 4, 92, 30), "#a89c80", 9); }
};
/** a small chapel with a cross, 700 x 900 canvas (stands on y = 890) */
export const fxChapel = (p: Pen) => {
  p.poly(B(120, 430, 580, 890), "#eadcc0", 11); p.poly([[84, 440], [350, 214], [616, 440]], "#7a8a9a", 11);
  p.poly(B(310, 150, 390, 262), "#e2d2b2", 9); p.poly([[296, 156], [350, 104], [404, 156]], "#7a8a9a", 9);
  p.stroke([[350, 30], [350, 108]], 20, INK); p.stroke([[318, 58], [382, 58]], 20, INK); p.stroke([[350, 30], [350, 108]], 9, "#d9a93a"); p.stroke([[318, 58], [382, 58]], 9, "#d9a93a");
  p.poly(B(334, 190, 366, 246), "#3a3530", 6);
  const door: P2[] = [[290, 890], [290, 700]]; for (let i = 0; i <= 12; i++) { const a = Math.PI * (1 + i / 12); door.push([350 + 60 * Math.cos(a), 700 + 60 * Math.sin(a)]); } door.push([410, 890]);
  p.poly(door, "#6a4528", 9); p.ell(350, 540, 46, 46, "#9cc4e6", 9); p.stroke([[350, 496], [350, 584]], 6); p.stroke([[306, 540], [394, 540]], 6);
};
/** a stone cross on a grave, 300 x 460 canvas (stands on y = 452) */
export const fxCrossGrave = (p: Pen) => {
  p.poly([[124, 40], [176, 40], [176, 140], [250, 140], [250, 192], [176, 192], [176, 420], [124, 420], [124, 192], [50, 192], [50, 140], [124, 140]], "#b9b4aa", 10);
  p.poly(B(84, 412, 216, 452), "#9a958b", 9);
};
/** a plain old headstone, leaning a little, 300 x 380 canvas (stands on y = 372) */
export const fxOldStone = (p: Pen) => {
  const top: P2[] = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * (1 + i / 12); top.push([150 + 100 * Math.cos(a), 150 + 100 * Math.sin(a)]); }
  p.rot = [0.06, 150, 372]; p.poly([[50, 372], ...top, [250, 372]], "#a9a499", 10);
  for (const y of [170, 214, 258]) p.stroke([[90, y], [210, y]], 7, "#8a857b"); p.rot = null;
};
/** fresh earth in front of a headstone, with a bunch of flowers, 800 x 240 canvas (ground at y = 232) */
export const fxMound = (p: Pen) => {
  p.ell(400, 228, 372, 128, "#8a6a48", 10, 180, 360); p.stroke([[60, 230], [740, 230]], 10);
  for (const [x, y] of [[190, 190], [330, 150], [520, 160], [610, 200]]) p.ell(x, y, 34, 12, "#775a3c", 0);
  for (const [x, y, c] of [[360, 176, "#e04a5a"], [400, 150, "#f2c744"], [440, 176, "#e04a5a"], [404, 196, "#ffffff"]] as const) { p.stroke([[400, 226], [x, y]], 6, "#3f7a4a"); p.ell(x, y, 20, 20, c, 6); p.dot(x, y, 6, "#a87c22"); }
};

// ---------------- 127: the front page of 1947 ----------------
/** a front page pinned to the wall: his death, 600 x 760 canvas */
export const fxObitPage = (p: Pen) => {
  p.poly(B(20, 16, 580, 744), PAPER, 10); text(p, "DAILY COURIER", 300, 68, 54, "#2b2430", 0, SERIF); p.stroke([[44, 108], [556, 108]], 6);
  text(p, "PERUGGIA", 300, 168, 82, RED); text(p, "IS DEAD", 300, 250, 82, RED);
  p.poly(B(60, 310, 280, 590), "#cfc6b4", 8);
  p.clip(B(64, 314, 276, 586), () => { p.poly([[80, 600], [100, 500], [170, 470], [240, 500], [260, 600]], "#5a4a3a", 7); p.ell(170, 410, 56, 66, "#ecc9a0", 7); p.ell(170, 362, 62, 30, "#3a2a1e", 0, 180, 360); p.stroke([[142, 436], [170, 428], [198, 436]], 9, "#2b2026"); p.dot(150, 404, 6); p.dot(190, 404, 6); });
  for (let i = 0; i < 8; i++) p.stroke([[312, 324 + i * 37], [i === 7 ? 470 : 550, 324 + i * 37]], 8, "#8b8478");
  for (let i = 0; i < 3; i++) p.stroke([[60, 630 + i * 36], [i === 2 ? 380 : 550, 630 + i * 36]], 8, "#8b8478");
  for (const x of [48, 552]) { p.ell(x, 36, 13, 13, "#c8312b", 6); }
};

// ---------------- 128: the cell ----------------
/** the front of a cell: a stone wall with a barred window, 1900 x 900 canvas (floor at y = 900; 4 mm a unit when the
 *  card is 7.6 m wide). The window is three gaps of 150 wide, so somebody behind its middle stands between two bars. */
export const CELL = { x0: 538, w: 450, top: 400, bot: 675 };
export const fxCellFront = (p: Pen) => {
  const g = p.g, { x0, w, top, bot } = CELL, x1 = x0 + w, hole = () => { g.beginPath(); g.rect(0, 0, 1900, 900); g.rect(x0, top, w, bot - top); };
  hole(); g.fillStyle = "#a8a092"; g.fill("evenodd");
  g.save(); hole(); g.clip("evenodd");
  for (let r = 0; r < 9; r++) { p.stroke([[0, r * 104], [1900, r * 104]], 5, "#857e72"); for (let i = 0; i < 11; i++) { const x = i * 190 + (r % 2) * 95; p.stroke([[x, r * 104], [x, r * 104 + 104]], 5, "#857e72"); } }
  g.restore();
  p.poly(B(x0, top, x1, bot), null, 9);
  for (const y of [top + 30, bot - 28]) p.poly(B(x0, y - 11, x1, y + 11), "#4a505c", 7);
  for (let k = 1; k < 3; k++) { const x = x0 + 150 * k; p.poly(B(x - 12, top, x + 12, bot), "#5c6470", 7); p.stroke([[x - 4, top + 8], [x - 4, bot - 8]], 3, "#8f9ba8"); }
  p.poly(B(x0 - 34, top - 30, x1 + 34, top), "#8f8779", 9); p.poly(B(x0 - 34, bot, x1 + 34, bot + 34), "#8f8779", 9);
};

// ---------------- round 2 ----------------
/** the front of the cathedral under the dome (laid over the far view of Florence), 390 x 330 canvas: marble bands, three doors, a round window */
export const fxDuomoFront = (p: Pen) => {
  for (let i = 0; i < 6; i++) p.stroke([[8, 40 + i * 50], [382, 40 + i * 50]], 5, i % 2 ? "#9fb7a0" : "#d9b7a8");
  const arch = (cx: number, w: number, h: number, fill: string) => { const pts: P2[] = [[cx - w, 326], [cx - w, 326 - h]]; for (let i = 0; i <= 10; i++) { const a = Math.PI * (1 + i / 10); pts.push([cx + w * Math.cos(a), 326 - h + w * Math.sin(a)]); } pts.push([cx + w, 326]); p.poly(pts, fill, 6); };
  arch(195, 40, 110, "#6a4528"); arch(75, 26, 78, "#6a4528"); arch(315, 26, 78, "#6a4528");
  p.ell(195, 100, 42, 42, "#5d6f7a", 7); p.stroke([[195, 58], [195, 142]], 4, "#eadfc6"); p.stroke([[153, 100], [237, 100]], 4, "#eadfc6");
  for (const x of [75, 315]) p.poly(B(x - 13, 70, x + 13, 150), "#5d6f7a", 5);
};
/** a garden path of beaten earth, seen from above (laid flat on the ground), 200 x 1000 canvas */
export const fxLane = (p: Pen) => {
  const g = p.g; g.fillStyle = "#cdb48a"; g.fillRect(0, 0, 200, 1000);
  for (const x of [5, 195]) p.stroke([[x, 0], [x, 1000]], 10, "#a8906a");
};
/** the inside of a cell seen through its window: dim stone, 600 x 480 canvas */
export const fxCellInside = (p: Pen) => {
  const g = p.g; g.fillStyle = "#6f6960"; g.fillRect(0, 0, 600, 480);
  for (let r = 0; r < 6; r++) { p.stroke([[0, r * 80], [600, r * 80]], 4, "#57524a"); for (let i = 0; i < 5; i++) { const x = i * 150 + (r % 2) * 75; p.stroke([[x, r * 80], [x, r * 80 + 80]], 4, "#57524a"); } }
};

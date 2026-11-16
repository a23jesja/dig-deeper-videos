// The places of "The Man Who Stole the Mona Lisa" and what tells them apart. The rooms themselves are built in
// world.ts (zone "louvre": one room every 60 m; zone "office": the room with the desk or the judge's bench);
// this file hangs the dressing on their walls, so that no two places look like the same room.
import { Pen, INK } from "./toon";
import { Ctx, fx } from "./monaKit";

type P2 = [number, number];
const B = (x0: number, y0: number, x1: number, y1: number): P2[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const text = (p: Pen, s: string, x: number, y: number, px: number, fill: string, font = "'Arial Black', Impact, sans-serif") => {
  const g = p.g; g.font = `900 ${px}px ${font}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = fill; g.fillText(s, x, y);
};
const fit = (s: string, base: number, width: number) => Math.min(base, width / (0.82 * Math.max(1, s.length)));

// ---------------- rooms of the "louvre" zone (x centres) ----------------
/** Picasso's studio in Paris: pale walls, a tall studio window, canvases */
export const STUDIO = 300;
/** Alfredo Geri's gallery shop in Florence: dark green walls, a counter */
export const SHOP = 360;
/** open country: grass to the horizon under the sky (use country() for what stands on it) */
export const COUNTRY = -200;

// ---------------- drawings ----------------
/** an engraved plate, 900 x 220 canvas: "SMALL LINE|BIG LINE" or one line */
const fxPlaque = (p: Pen, s: string, fill = "#1f2a44", ink = "#e9c85a") => {
  p.poly(B(12, 12, 888, 208), fill, 11); p.poly(B(34, 34, 866, 186), null, 4);
  const L = s.split("|");
  if (L.length === 1) text(p, L[0], 450, 114, fit(L[0], 96, 760), ink);
  else { text(p, L[0], 450, 76, fit(L[0], 44, 760), ink); text(p, L[1], 450, 142, fit(L[1], 74, 760), ink); }
  for (const [x, y] of [[52, 52], [848, 52], [52, 168], [848, 168]]) p.dot(x, y, 7, ink);
};
/** a street map pinned to the wall, 900 x 640 canvas: a river, blocks, red pins */
const fxCityMap = (p: Pen) => {
  p.poly(B(14, 14, 886, 626), "#efe6cf", 11);
  const g = p.g; g.save(); g.beginPath(); g.rect(22, 22, 856, 596); g.clip();
  for (let i = 0; i < 9; i++) for (let j = 0; j < 6; j++) { g.fillStyle = (i + j) % 3 ? "#e2d6b8" : "#d6c8a6"; g.fillRect(40 + i * 94 + (j % 2) * 12, 40 + j * 96, 78, 80); }
  p.stroke([[0, 250], [200, 300], [420, 250], [640, 330], [900, 290]], 46, "#9cc4e6");
  p.stroke([[0, 250], [200, 300], [420, 250], [640, 330], [900, 290]], 4, "#6a94b6");
  for (const [a, b] of [[[120, 20], [180, 620]], [[520, 20], [470, 620]], [[20, 480], [880, 430]]] as [P2, P2][]) p.stroke([a, b], 12, "#fbf6e6");
  g.restore();
  for (const [x, y] of [[300, 180], [520, 260], [610, 420], [230, 470], [700, 150]]) { p.stroke([[x, y], [x, y - 34]], 5, INK); p.ell(x, y - 44, 15, 15, "#c8312b", 5); }
};
/** a board of wanted notices, 620 x 560 canvas */
const fxNotices = (p: Pen) => {
  p.poly(B(12, 12, 608, 548), "#8a6a44", 11);
  ([[40, 40, -3], [330, 52, 4], [60, 300, 3], [340, 290, -2]] as const).forEach(([x, y, r], i) => {
    const g = p.g; g.save(); g.translate(x + 120, y + 105); g.rotate((r * Math.PI) / 180); g.translate(-120, -105);
    p.poly(B(0, 0, 240, 210), "#f6efd8", 6); p.ell(120, 82, 34, 38, i % 2 ? "#cfc6ad" : "#d9cfb5", 5);
    p.stroke([[50, 150], [190, 150]], 9, "#6a5a40"); p.stroke([[70, 178], [170, 178]], 7, "#a39678"); p.dot(120, 12, 8, "#c8312b"); g.restore();
  });
};
/** a gilt-framed landscape, 900 x 660 canvas */
const fxLandscape = (p: Pen, k = 0) => {
  p.poly(B(12, 12, 888, 648), "#d9a93a", 11); p.poly(B(60, 60, 840, 600), ["#9cc4e6", "#f0c890", "#b8c4d8"][k % 3], 7);
  const g = p.g; g.save(); g.beginPath(); g.rect(64, 64, 772, 532); g.clip();
  p.ell(680, 190, 54, 54, "#fff3c4", 0);
  p.poly([[60, 420], [240, 300], [400, 400], [560, 280], [840, 430], [840, 600], [60, 600]], ["#6a8a5c", "#8a7a4a", "#5c7a8a"][k % 3], 6);
  p.poly([[60, 500], [300, 450], [560, 520], [840, 470], [840, 600], [60, 600]], ["#4f7a4a", "#6a6a3a", "#4a6a6a"][k % 3], 6);
  p.poly(B(330, 380, 420, 470), "#f4efe0", 5); p.poly([[318, 384], [375, 330], [432, 384]], "#b0523a", 5);
  g.restore(); p.poly(B(60, 60, 840, 600), null, 7);
};
/** a wall of books, 900 x 760 canvas */
const fxBookshelf = (p: Pen) => {
  p.poly(B(12, 12, 888, 748), "#6a4528", 11);
  const cols = ["#8a2f2f", "#2f5a3c", "#2a4f7a", "#b08a3a", "#5a3a5a", "#3a3a40", "#a0522d"];
  for (let r = 0; r < 4; r++) {
    const y0 = 36 + r * 178; p.poly(B(34, y0, 866, y0 + 160), "#4a2f1a", 5);
    let x = 44, i = r * 3;
    while (x < 830) { const w = 26 + ((i * 37) % 30), h = 120 + ((i * 53) % 34), lean = i % 11 === 5; if (x + w > 856) break;
      if (lean) p.poly([[x, y0 + 158], [x + 30, y0 + 158 - h], [x + 30 + w, y0 + 166 - h], [x + w, y0 + 158]], cols[i % 7], 4);
      else { p.poly(B(x, y0 + 158 - h, x + w, y0 + 158), cols[i % 7], 4); p.stroke([[x + 5, y0 + 178 - h], [x + w - 5, y0 + 178 - h]], 3, "#e9c85a"); }
      x += w + (lean ? 34 : 4); i++; }
  }
};
/** a round wall clock, 320 x 320 canvas */
const fxWallClock = (p: Pen, h: number, m: number) => {
  p.ell(160, 160, 146, 146, "#7a5236", 11); p.ell(160, 160, 118, 118, "#fbf6e6", 7);
  for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6; p.stroke([[160 + 96 * Math.sin(a), 160 - 96 * Math.cos(a)], [160 + 110 * Math.sin(a), 160 - 110 * Math.cos(a)]], 7); }
  const ah = ((h % 12) + m / 60) * (Math.PI / 6), am = (m * Math.PI) / 30;
  p.stroke([[160, 160], [160 + 58 * Math.sin(ah), 160 - 58 * Math.cos(ah)]], 13); p.stroke([[160, 160], [160 + 88 * Math.sin(am), 160 - 88 * Math.cos(am)]], 8); p.dot(160, 160, 11);
};
/** newspaper front pages pinned in rows, 900 x 620 canvas */
const fxPinnedPages = (p: Pen) => {
  p.poly(B(12, 12, 888, 608), "#a88a5c", 11);
  for (let i = 0; i < 6; i++) { const x = 40 + (i % 3) * 282, y = 40 + Math.floor(i / 3) * 284;
    p.poly(B(x, y, x + 250, y + 250), "#f6efd8", 6); p.poly(B(x + 18, y + 18, x + 232, y + 56), "#2b2430", 0);
    p.poly(B(x + 18, y + 72, x + 120, y + 160), "#cfc6ad", 4);
    for (let k = 0; k < 5; k++) p.stroke([[x + 136, y + 80 + k * 20], [x + 232, y + 80 + k * 20]], 6, "#a39678");
    for (let k = 0; k < 3; k++) p.stroke([[x + 18, y + 182 + k * 22], [x + 232, y + 182 + k * 22]], 6, "#a39678"); p.dot(x + 125, y + 8, 8, "#c8312b"); }
};
/** a photographer's painted backdrop on a roller, 900 x 900 canvas */
const fxBackdrop = (p: Pen) => {
  p.poly(B(40, 60, 860, 880), "#b9c4d8", 11); p.poly(B(20, 30, 880, 86), "#8a5a34", 9);
  const g = p.g; g.save(); g.beginPath(); g.rect(48, 92, 804, 780); g.clip();
  p.ell(250, 330, 150, 70, "#e9eef6", 0); p.ell(600, 250, 190, 80, "#e9eef6", 0);
  p.poly([[40, 700], [300, 560], [520, 680], [860, 540], [860, 880], [40, 880]], "#8fa3b8", 6);
  p.poly(B(640, 420, 700, 720), "#d8dde6", 6); p.poly(B(620, 400, 720, 430), "#d8dde6", 6); g.restore();
};
/** a flag on a staff fixed to the wall, 520 x 720 canvas: three vertical bands */
const fxWallFlag = (p: Pen, cols: [string, string, string]) => {
  p.stroke([[60, 700], [60, 30]], 20, INK); p.stroke([[60, 700], [60, 30]], 10, "#b08a3a"); p.ell(60, 26, 18, 18, "#e9c85a", 6);
  for (const y of [470, 690]) { p.poly(B(22, y - 16, 98, y + 16), "#b08a3a", 7); p.dot(36, y, 6, INK); p.dot(84, y, 6, INK); } // wall brackets
  cols.forEach((c, i) => p.poly(B(72 + i * 140, 60, 212 + i * 140, 380), c, 0)); p.poly(B(72, 60, 492, 380), null, 9);
};
/** a judge's coat of arms: scales on a shield, 420 x 480 canvas */
const fxScales = (p: Pen) => {
  p.poly([[30, 30], [390, 30], [390, 280], [210, 450], [30, 280]], "#2a4f7a", 11);
  p.stroke([[210, 90], [210, 340]], 14, "#e9c85a"); p.stroke([[90, 140], [330, 140]], 12, "#e9c85a");
  for (const x of [90, 330]) { p.stroke([[x, 140], [x - 44, 250]], 5, "#e9c85a"); p.stroke([[x, 140], [x + 44, 250]], 5, "#e9c85a"); p.ell(x, 256, 54, 16, "#e9c85a", 5); }
};
/** a stone farmhouse with a tiled roof, 1100 x 700 canvas (stands on y = 690) */
const fxStoneHouse = (p: Pen, roof = "#b0523a") => {
  p.poly(B(120, 300, 980, 690), "#e2d6b8", 11); p.poly([[70, 310], [550, 80], [1030, 310]], roof, 11);
  p.poly(B(470, 470, 630, 690), "#6a4528", 9); for (const x of [200, 760]) { p.poly(B(x, 420, x + 140, 560), "#9cc4e6", 8); p.stroke([[x + 70, 420], [x + 70, 560]], 6); p.poly(B(x - 26, 410, x, 570), "#4f7a5a", 6); p.poly(B(x + 140, 410, x + 166, 570), "#4f7a5a", 6); }
  p.poly(B(760, 110, 840, 240), "#c9bda0", 8);
  for (const [x, y] of [[160, 610], [300, 350], [690, 640], [900, 380], [400, 640]]) p.stroke([[x, y], [x + 60, y]], 5, "#b8ab8c");
};
/** a chateau with two round towers, 1500 x 900 canvas (stands on y = 890) */
const fxChateau = (p: Pen) => {
  p.poly(B(330, 380, 1170, 890), "#efe6cf", 11); p.poly([[300, 390], [750, 190], [1200, 390]], "#5a6f8a", 11);
  for (const x of [200, 1140]) { p.poly(B(x, 300, x + 160, 890), "#e6dcc2", 11); p.poly([[x - 24, 310], [x + 80, 60], [x + 184, 310]], "#5a6f8a", 11); p.poly(B(x + 56, 420, x + 104, 520), "#3f5f8a", 7); p.poly(B(x + 56, 620, x + 104, 720), "#3f5f8a", 7); }
  p.poly([[670, 890], [670, 700], [750, 640], [830, 700], [830, 890]], "#6a4528", 9);
  for (let i = 0; i < 5; i++) { const x = 400 + i * 150; if (i === 2) continue; p.poly(B(x, 470, x + 80, 600), "#3f5f8a", 7); p.poly(B(x, 690, x + 80, 820), "#3f5f8a", 7); }
};
/** a village church with a bell tower, 700 x 1000 canvas (stands on y = 990) */
const fxCampanile = (p: Pen) => {
  p.poly(B(40, 560, 480, 990), "#eadcc0", 11); p.poly([[20, 570], [260, 400], [500, 570]], "#b0523a", 11);
  p.poly(B(440, 220, 620, 990), "#e2d2b2", 11); p.poly([[420, 230], [530, 60], [640, 230]], "#b0523a", 11);
  p.poly(B(496, 290, 564, 400), "#3a3530", 7); p.ell(530, 372, 22, 26, "#d9a93a", 5);
  p.poly([[200, 990], [200, 800], [260, 750], [320, 800], [320, 990]], "#6a4528", 9); p.ell(260, 660, 44, 44, "#9cc4e6", 8);
};
/** an army tent, 760 x 520 canvas (stands on y = 510) */
const fxArmyTent = (p: Pen) => {
  p.poly([[30, 510], [380, 60], [730, 510]], "#9a9a72", 11); p.poly([[380, 60], [300, 510], [460, 510]], "#5c5c44", 7);
  p.stroke([[380, 60], [380, 20]], 9); for (const s of [-1, 1]) p.stroke([[380 + s * 300, 420], [380 + s * 360, 508]], 5);
};
/** a row of sandbags, 900 x 260 canvas */
const fxSandbags = (p: Pen) => { for (let r = 0; r < 2; r++) for (let i = 0; i < 5 - r; i++) p.ell(110 + i * 170 + r * 85, 190 - r * 100, 96, 58, r ? "#c2ab7a" : "#b39c6c", 9); };
/** hills on the horizon, 1800 x 400 canvas */
const fxHills = (p: Pen, c1 = "#8fb07a", c2 = "#6f9a66") => {
  p.poly([[0, 400], [0, 270], [260, 200], [520, 280], [820, 190], [1120, 290], [1420, 210], [1800, 290], [1800, 400]], c1, 9);
  p.poly([[0, 400], [0, 330], [340, 280], [700, 340], [1050, 290], [1400, 345], [1800, 310], [1800, 400]], c2, 9);
};
/** a cypress tree, 260 x 760 canvas (stands on y = 750) */
const fxCypress = (p: Pen) => { p.poly(B(112, 600, 148, 750), "#6a4528", 8); p.poly([[130, 20], [200, 300], [214, 520], [170, 640], [90, 640], [46, 520], [60, 300]], "#3f6a4a", 10); };

// ---------------- the office zone (desk at x = -2.2, back wall at z = 6) ----------------
const WZ = 5.92;
/** police headquarters: a pinned street map, wanted notices, the plate on the wall */
export const police = (c: Ctx) => {
  c.out.office = "minister";
  fx(c, "setMap", 900, 640, fxCityMap, -4.7, 3.15, WZ, 2.7); fx(c, "setNotices", 620, 560, fxNotices, 0.9, 2.85, WZ, 1.7);
  fx(c, "setPlaque|POLICE HEADQUARTERS", 900, 220, (p) => fxPlaque(p, "PARIS|POLICE HEADQUARTERS"), -1.75, 4.55, WZ, 2.6);
};
/** the office of the director of the Louvre: gilt-framed landscapes, his name plate */
export const directorRoom = (c: Ctx) => {
  c.out.office = "minister";
  fx(c, "setLand0", 900, 660, (p) => fxLandscape(p, 0), -4.7, 3.1, WZ, 2.5); fx(c, "setLand1", 900, 660, (p) => fxLandscape(p, 1), 0.9, 3.0, WZ, 1.9);
  fx(c, "setPlaque|DIRECTOR", 900, 220, (p) => fxPlaque(p, "THE LOUVRE|THE DIRECTOR", "#5a2f2f"), -1.75, 4.55, WZ, 2.6);
};
/** a poet's study: a wall of books */
export const poetStudy = (c: Ctx) => {
  c.out.office = "minister";
  fx(c, "setBooks", 900, 760, fxBookshelf, -4.9, 2.85, WZ, 3.3); fx(c, "setBooks", 900, 760, fxBookshelf, 0.9, 2.85, WZ, 3.3);
};
/** a newspaper office (stand people around x = 4.4): pinned front pages, a clock, the paper's name */
export const newsroom = (c: Ctx, name = "PARIS-JOURNAL") => {
  c.out.office = "minister";
  fx(c, "setPages", 900, 620, fxPinnedPages, 6.6, 2.95, WZ, 2.7); fx(c, "setClock", 320, 320, (p) => fxWallClock(p, 10, 10), 2.6, 3.7, WZ, 0.9);
  fx(c, `setPlaque|${name}`, 900, 220, (p) => fxPlaque(p, `NEWSPAPER|${name}`, "#2b2430", "#f6efd8"), 4.5, 4.55, WZ, 2.6);
};
/** the photographers' studio of the Louvre (stand people around x = 4.4): a painted backdrop on a roller */
export const photoStudio = (c: Ctx) => {
  c.out.office = "minister";
  fx(c, "setBackdrop", 900, 900, fxBackdrop, 4.6, 2.75, WZ, 3.4);
};
/** a courtroom (the judge's bench at x = 0; put the judge on y = 0.55 so that he sits above it): flag and scales. where = "fr" | "it" */
export const court = (c: Ctx, where: "fr" | "it" = "it") => {
  c.out.office = "parliament";
  fx(c, `setFlag${where}`, 520, 720, (p) => fxWallFlag(p, where === "it" ? ["#3f8a4a", "#f4efe0", "#c8312b"] : ["#2a4f9a", "#f4efe0", "#c8312b"]), -2.6, 3.4, WZ, 1.5);
  fx(c, "setScales", 420, 480, fxScales, 0, 4.0, WZ, 1.3);
};

// ---------------- open country (zone "louvre", around x = COUNTRY) ----------------
/** what stands in the countryside: "france" (a chateau, 1516), "village" (Dumenza: a church with a bell tower and a stone
 *  house under the Alps), "front" (army tents and sandbags, 1915), "savoy" (a stone house in France, 1925). People stand at z = 0..4. */
export const country = (c: Ctx, kind: "france" | "village" | "front" | "savoy", cx = COUNTRY) => {
  fx(c, "setHills", 1800, 400, (p) => fxHills(p), cx, 4.5, 90, 150);
  if (kind === "france") { fx(c, "setChateau", 1500, 900, fxChateau, cx + 2.5, 5.4, 26, 19); for (const x of [-9, -6.4]) fx(c, "setCypress", 260, 760, fxCypress, cx + x, 3.3, 20, 2.3); }
  else if (kind === "village") { fx(c, "setCampanile", 700, 1000, fxCampanile, cx + 5.5, 4.6, 22, 6.6); fx(c, "setHouse", 1100, 700, (p) => fxStoneHouse(p), cx - 5.5, 2.5, 16, 8); for (const x of [-11, 10.5]) fx(c, "setCypress", 260, 760, fxCypress, cx + x, 3.6, 18, 2.5); }
  else if (kind === "front") { for (const [x, z] of [[-5, 12], [3.4, 15], [9, 11]]) fx(c, "setTent", 760, 520, fxArmyTent, cx + x, 1.6, z, 4.8); fx(c, "setBags", 900, 260, fxSandbags, cx - 0.5, 0.55, 5.4, 3.8); fx(c, "setBags", 900, 260, fxSandbags, cx + 4.2, 0.55, 5.8, 3.8); }
  else { fx(c, "setHouse", 1100, 700, (p) => fxStoneHouse(p, "#7a8a9a"), cx + 4.5, 2.5, 15, 8); for (const x of [-8.5, -6.2, 11]) fx(c, "setCypress", 260, 760, fxCypress, cx + x, 3.3, 17, 2.3); }
};

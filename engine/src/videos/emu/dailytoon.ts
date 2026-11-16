// Drawings for the daily shorts of 13 November 2026: the Microsoft 365 outage, Friday the 13th, and how
// Grand Theft Auto began. All our own drawings: no logos, no screenshots, no product artwork.
import { Pen, INK } from "./toon";

type P2 = [number, number];
const TWO = Math.PI * 2;
const text = (p: Pen, s: string, x: number, y: number, px: number, fill: string, stroke = 0) => {
  const g = p.g;
  g.font = `900 ${px}px 'Arial Black', Impact, 'Segoe UI Black', sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  if (stroke) { g.lineWidth = stroke; g.strokeStyle = INK; g.lineJoin = "round"; g.strokeText(s, x, y); }
  g.fillStyle = fill; g.fillText(s, x, y);
};
const fit = (s: string, base: number, width: number) => Math.min(base, width / (0.82 * Math.max(1, s.length)));
const box = (x0: number, y0: number, x1: number, y1: number): P2[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const RED = "#d8382f", GREEN = "#3faa55", PAPER = "#fbf6e6";

// ---------------- the outage ----------------
/** an envelope, 300 x 220 canvas */
export const fxEnvelope = (p: Pen) => {
  p.poly(box(16, 20, 284, 200), PAPER, 10);
  p.stroke([[16, 20], [150, 124], [284, 20]], 9);
  p.stroke([[16, 200], [112, 104]], 6, "#b9b09a"); p.stroke([[284, 200], [188, 104]], 6, "#b9b09a");
};
/** a desktop computer screen on its stand, 520 x 480 canvas. state: "mail" (an envelope), "down" (a red cross), "wait" (hourglass dots) */
export const fxMonitor = (p: Pen, state: "mail" | "down" | "wait" = "mail") => {
  p.poly([[210, 380], [310, 380], [330, 440], [190, 440]], "#7c8592", 9);
  p.poly(box(130, 436, 390, 468), "#5c6470", 9);
  p.poly(box(20, 20, 500, 384), "#3a4150", 12);
  p.poly(box(48, 48, 472, 356), state === "down" ? "#e9e2d6" : "#cfe6f7", 7);
  if (state === "mail") {
    p.poly(box(160, 128, 360, 268), PAPER, 9); p.stroke([[160, 128], [260, 208], [360, 128]], 8);
    p.ell(372, 122, 30, 30, GREEN, 7); p.stroke([[358, 122], [369, 134], [388, 110]], 8, "#ffffff");
  } else if (state === "down") {
    p.poly(box(160, 128, 360, 268), "#d8d2c4", 9); p.stroke([[160, 128], [260, 208], [360, 128]], 8, "#8b8478");
    p.stroke([[150, 96], [370, 300]], 44, INK); p.stroke([[370, 96], [150, 300]], 44, INK);
    p.stroke([[150, 96], [370, 300]], 26, RED); p.stroke([[370, 96], [150, 300]], 26, RED);
  } else {
    for (let i = 0; i < 3; i++) p.ell(190 + i * 70, 202, 22, 22, "#6f7a88", 7);
  }
};
/** a server cabinet, 300 x 600 canvas. state 0 = switched off (dark), 1 = running (green lights), 2 = overloaded (red, smoking) */
export const fxServer = (p: Pen, state = 1) => {
  p.poly(box(20, 30, 280, 580), state === 0 ? "#4a505c" : "#5f6878", 12);
  for (let i = 0; i < 6; i++) {
    const y = 60 + i * 84;
    p.poly(box(46, y, 254, y + 60), state === 0 ? "#2f343c" : "#39404c", 6);
    for (let k = 0; k < 4; k++) p.stroke([[66 + k * 26, y + 18], [66 + k * 26, y + 42]], 8, state === 0 ? "#444a54" : "#7c8592");
    p.dot(214, y + 30, 14, INK); p.dot(214, y + 30, 10, state === 0 ? "#3a3f48" : state === 1 ? "#6fe08a" : "#ff5a4a");
  }
  if (state === 2) for (const [x, y, r] of [[90, 20, 34], [150, -4, 44], [214, 22, 32]] as const) p.ell(x, y + 40, r, r * 0.8, "#b9bec6", 7);
};
/** the globe, 520 x 520 canvas, with n red warning pins on it */
export const fxGlobe = (p: Pen, n = 0) => {
  const C: P2[] = []; for (let i = 0; i < 64; i++) C.push([260 + 236 * Math.cos((TWO * i) / 64), 260 + 236 * Math.sin((TWO * i) / 64)]);
  p.poly(C, "#6fb6e6", 13);
  p.clip(C, () => {
    p.poly([[70, 150], [150, 96], [236, 110], [250, 170], [206, 236], [226, 300], [176, 380], [130, 330], [120, 250], [76, 220]], "#7fc47a", 7);
    p.poly([[290, 110], [372, 80], [456, 130], [470, 220], [420, 250], [380, 220], [340, 250], [300, 200]], "#7fc47a", 7);
    p.poly([[330, 280], [400, 290], [420, 370], [372, 440], [330, 380]], "#7fc47a", 7);
    p.poly([[430, 380], [500, 370], [500, 440], [450, 450]], "#7fc47a", 7);
  });
  p.poly(C, null, 13);
  const pins: P2[] = [[150, 170], [196, 300], [356, 150], [420, 190], [372, 350], [300, 130], [110, 240], [460, 410], [250, 420], [326, 230], [84, 320], [410, 300]];
  for (let i = 0; i < Math.min(n, pins.length); i++) { const [x, y] = pins[i]; p.ell(x, y, 21, 21, RED, 7); text(p, "!", x, y + 2, 30, "#ffffff"); }
};
/** "not an attack": a masked burglar's face under a red bar, 420 x 420 canvas */
export const fxNoHacker = (p: Pen) => {
  p.ell(210, 210, 186, 186, "#ffffff", 0);
  p.poly([[110, 330], [124, 196], [160, 120], [210, 96], [260, 120], [296, 196], [310, 330]], "#3a4150", 10);
  p.ell(210, 214, 74, 86, "#ffe2c2", 9);
  p.poly(box(132, 180, 288, 226), "#22262c", 8); p.ell(178, 203, 15, 11, "#ffffff", 0); p.ell(242, 203, 15, 11, "#ffffff", 0); p.dot(180, 204, 6); p.dot(244, 204, 6);
  p.arc(210, 262, 26, 12, 20, 160, 8);
  const R: P2[] = []; for (let i = 0; i < 64; i++) R.push([210 + 186 * Math.cos((TWO * i) / 64), 210 + 186 * Math.sin((TWO * i) / 64)]);
  p.poly(R, null, 0); p.g.lineWidth = 40; p.g.strokeStyle = INK; p.path(R, true); p.g.stroke(); p.g.lineWidth = 24; p.g.strokeStyle = RED; p.path(R, true); p.g.stroke();
  p.stroke([[80, 340], [340, 80]], 44, INK); p.stroke([[80, 340], [340, 80]], 26, RED);
};
/** a round restaurant table with a white cloth, 420 x 400 canvas (the floor is at y = 392) */
export const fxTable = (p: Pen) => {
  p.poly(box(196, 150, 224, 380), "#6a4a2c", 8); p.poly(box(150, 372, 270, 392), "#6a4a2c", 8);
  p.poly([[40, 96], [380, 96], [356, 230], [300, 206], [250, 236], [196, 206], [140, 236], [96, 206], [64, 230]], "#ffffff", 10);
  p.ell(210, 96, 172, 34, "#ffffff", 10);
  p.ell(210, 90, 60, 13, "#e9e2d6", 6);
};
/** a pile of n dinner plates, 300 x 420 canvas (the pile stands on y = 404) */
export const fxPlates = (p: Pen, n = 3) => {
  for (let i = 0; i < n; i++) { const y = 392 - i * 26, w = 120 - (i % 2) * 6, x = 150 + (i % 3 - 1) * 5; p.ell(x, y, w, 15, "#fbfbf6", 7); p.ell(x, y - 3, w * 0.6, 7, "#dfe6ee", 0); }
};
/** a tear-off calendar leaf: a coloured head ("FRIDAY") and a big date ("13"), 420 x 480 canvas */
export const fxCalendar = (p: Pen, head: string, big: string, col = RED, cross = false) => {
  p.poly(box(22, 44, 398, 460), PAPER, 12);
  p.poly(box(22, 44, 398, 150), col, 12);
  // the heading sits below the two rings and the number is sized to the page, so neither is ever cut
  for (const x of [120, 300]) { p.poly(box(x - 13, 10, x + 13, 70), "#c9ccd2", 7); }
  text(p, head, 210, 114, fit(head, 50, 320), "#ffffff");
  text(p, big, 210, 312, fit(big, 232, 310), "#2b2430");
  if (cross) { p.stroke([[60, 190], [360, 430]], 34, INK); p.stroke([[360, 190], [60, 430]], 34, INK); p.stroke([[60, 190], [360, 430]], 18, RED); p.stroke([[360, 190], [60, 430]], 18, RED); }
};

// ---------------- Friday the 13th ----------------
/** a black cat sitting, 420 x 460 canvas (sits on y = 446); k = tail swish -1..1 */
export const fxCat = (p: Pen, k = 0) => {
  const B = "#2a2630";
  p.line([[300, 400], [372, 360 - 20 * k], [384 + 26 * k, 270], [352 + 40 * k, 214]], B, 22);
  p.poly([[110, 440], [104, 300], [150, 220], [250, 214], [316, 290], [330, 440]], B, 11);
  p.poly([[112, 240], [92, 132], [150, 168], [246, 168], [308, 132], [288, 240], [250, 286], [150, 286]], B, 11);
  p.ell(160, 214, 22, 17, "#f2d24a", 5); p.ell(240, 214, 22, 17, "#f2d24a", 5); p.ell(160, 214, 6, 15, INK, 0); p.ell(240, 214, 6, 15, INK, 0);
  p.poly([[190, 240], [210, 240], [200, 252]], "#e58a9a", 4);
  for (const s of [-1, 1]) { p.stroke([[200 + s * 22, 252], [200 + s * 76, 244]], 4, "#c9c4d0"); p.stroke([[200 + s * 22, 258], [200 + s * 74, 268]], 4, "#c9c4d0"); }
  p.ell(160, 440, 34, 13, B, 8); p.ell(250, 440, 34, 13, B, 8);
};
/** a step ladder, 360 x 800 canvas (feet on y = 790) */
export const fxLadder = (p: Pen) => {
  const W = "#c9a25a";
  p.line([[250, 60], [340, 786]], "#a8823f", 20);
  p.line([[150, 40], [40, 786]], W, 24); p.line([[220, 40], [250, 786]], W, 24);
  for (let i = 0; i < 6; i++) { const u = 0.14 + i * 0.145, xa = 150 - 110 * u, xb = 220 + 30 * u, y = 40 + 746 * u; p.line([[xa, y], [xb, y]], W, 16); }
  p.poly(box(130, 22, 240, 56), "#a8823f", 9);
};
/** a wall mirror, 320 x 440 canvas; cracked = a star of cracks */
export const fxMirror = (p: Pen, cracked = false) => {
  p.ell(160, 220, 140, 200, "#b98f2c", 12); p.ell(160, 220, 112, 172, "#d6ecf5", 8);
  p.stroke([[110, 130], [150, 96]], 12, "#ffffff"); p.stroke([[96, 176], [120, 150]], 9, "#ffffff");
  if (cracked) for (const [x, y] of [[70, 110], [240, 90], [262, 250], [200, 370], [90, 340], [56, 230]] as P2[]) p.stroke([[160, 220], [(160 + x) / 2 + 12, (220 + y) / 2 - 8], [x, y]], 6, "#3a4450");
};
/** a panelled door with a brass plate, 460 x 860 canvas (threshold at y = 850) */
export const fxDoor = (p: Pen, plate = "ROOM 13") => {
  p.poly(box(20, 20, 440, 850), "#5a3a26", 13);
  p.poly(box(50, 50, 410, 850), "#8a5a34", 10);
  for (const [y0, y1] of [[250, 470], [520, 800]]) p.poly(box(90, y0, 370, y1), "#7a4c2a", 7);
  p.poly(box(96, 96, 364, 204), "#e2bb4c", 9); text(p, plate, 230, 152, fit(plate, 70, 250), "#2b2430");
  p.ell(368, 500, 20, 20, "#e2bb4c", 8);
};
/** a long dinner table with a white cloth and two candlesticks, 1400 x 420 canvas (floor at y = 410) */
export const fxLongTable = (p: Pen) => {
  for (const x of [130, 1270]) p.poly(box(x - 16, 250, x + 16, 404), "#6a4a2c", 8);
  p.poly([[40, 120], [1360, 120], [1360, 290], [1250, 262], [1140, 292], [1030, 262], [920, 292], [810, 262], [700, 292], [590, 262], [480, 292], [370, 262], [260, 292], [150, 262], [40, 290]], "#ffffff", 11);
  p.poly(box(40, 96, 1360, 132), "#f4f0e6", 11);
  for (const x of [470, 930]) { p.poly(box(x - 9, 30, x + 9, 100), "#e2bb4c", 6); p.poly(box(x - 26, 92, x + 26, 106), "#e2bb4c", 6); p.poly([[x, 2], [x + 12, 22], [x, 36], [x - 12, 22]], "#ffb43a", 5); }
};
/** a share-price chart that climbs and then falls off a cliff, 640 x 460 canvas; k = how much of the line is drawn (0..1) */
export const fxChart = (p: Pen, k = 1) => {
  p.poly(box(16, 16, 624, 444), PAPER, 11);
  for (let i = 1; i < 5; i++) p.stroke([[60, 60 + i * 72], [590, 60 + i * 72]], 3, "#d9d2c0");
  p.stroke([[60, 50], [60, 400], [596, 400]], 9);
  const L: P2[] = [[70, 330], [130, 300], [180, 316], [240, 250], [300, 262], [350, 190], [400, 130], [430, 150], [470, 372], [560, 390]];
  const n = Math.max(2, Math.round(1 + k * (L.length - 1))), pts = L.slice(0, n);
  p.stroke(pts, 22, INK); p.stroke(pts.slice(0, Math.min(n, 8)), 12, GREEN); if (n > 8) p.stroke(pts.slice(7), 12, RED);
  if (n >= L.length) p.poly([[560, 424], [520, 372], [600, 372]], RED, 7);
};
/** a plain three-band flag on a short staff, 360 x 300 canvas. kind "it" (green, white, red upright) or "es" (red, yellow, red across) */
export const fxFlag3 = (p: Pen, kind: "it" | "es") => {
  p.poly(box(18, 10, 38, 292), "#8a6a4a", 7);
  if (kind === "it") ["#3f9a55", "#ffffff", "#d8382f"].forEach((c, i) => p.poly(box(38 + i * 100, 30, 138 + i * 100, 210), c, 0));
  else { p.poly(box(38, 30, 338, 210), "#d8382f", 0); p.poly(box(38, 75, 338, 165), "#f2c63a", 0); }
  p.poly(box(38, 30, 338, 210), null, 10);
};
/** a horseshoe, 300 x 320 canvas */
export const fxHorseshoe = (p: Pen) => {
  const pts: P2[] = []; for (let i = 0; i <= 28; i++) { const a = Math.PI * (1 + i / 28); pts.push([150 + 100 * Math.cos(a), 150 + 110 * Math.sin(a)]); }
  const L: P2[] = [[50, 280], ...pts.slice().reverse().map(([x, y]) => [300 - x, y] as P2), [250, 280]];
  p.stroke(L, 64, INK); p.stroke(L, 44, "#9aa2ae");
  for (const [x, y] of [[62, 220], [70, 140], [112, 74], [188, 74], [230, 140], [238, 220]] as P2[]) p.dot(x, y, 7, "#3a4450");
};

// ---------------- Grand Theft Auto ----------------
/** a cartoon saloon car seen from the side, 700 x 340 canvas (tyres stand on y = 322), nose to the right.
 *  kind "cop": black and white with a light bar (lit = which lamp is on, 0 none / 1 / 2); "robber": red, a swag bag on the roof. spin = wheel angle. */
export const fxCar = (p: Pen, kind: "cop" | "robber", spin = 0, lit = 0, mad = false) => {
  const body = kind === "cop" ? "#f4f1ea" : "#d8483a";
  if (kind === "robber") { p.poly([[250, 66], [236, 22], [262, 4], [300, 4], [328, 22], [312, 66]], "#c9a777", 9); text(p, "$", 282, 38, 44, "#5a4020"); }
  else {
    p.poly(box(292, 44, 412, 74), "#3a4150", 8);
    p.poly(box(300, 26, 350, 60), lit === 1 ? "#ff5a4a" : "#8a2f2a", 7); p.poly(box(354, 26, 404, 60), lit === 2 ? "#5aa0ff" : "#2a4a8a", 7);
  }
  p.poly([[196, 150], [246, 70], [454, 70], [520, 150]], body, 11);
  p.poly([[226, 144], [262, 90], [340, 90], [340, 144]], "#bfe3f5", 7); p.poly([[362, 144], [362, 90], [442, 90], [486, 144]], "#bfe3f5", 7);
  p.poly([[44, 258], [40, 186], [70, 150], [600, 150], [656, 180], [664, 258]], body, 12);
  if (kind === "cop") { p.poly([[200, 154], [470, 154], [470, 254], [200, 254]], "#2b2f3a", 0); text(p, "POLICE", 335, 206, 54, "#f4f1ea"); p.poly([[44, 258], [40, 186], [70, 150], [600, 150], [656, 180], [664, 258]], null, 12); }
  p.poly(box(30, 236, 76, 262), "#9aa2ae", 7); p.poly(box(634, 236, 676, 262), "#9aa2ae", 7);
  p.ell(640, 196, 16, 14, mad ? "#ff5a4a" : "#ffe14d", 6);
  if (mad) { p.stroke([[560, 160], [612, 178]], 10); }
  for (const x of [170, 530]) {
    p.ell(x, 262, 60, 60, "#2b2b30", 11); p.ell(x, 262, 28, 28, "#c9ccd2", 6);
    for (let i = 0; i < 3; i++) { const a = spin + (TWO * i) / 3; p.stroke([[x, 262], [x + 26 * Math.cos(a), 262 + 26 * Math.sin(a)]], 7, "#5c6470"); }
  }
};
/** a row of city blocks, 1600 x 760 canvas (the street is at y = 752) */
export const fxCity = (p: Pen) => {
  const B: [number, number, number, string][] = [[20, 260, 330, "#c9b79a"], [280, 200, 520, "#a9b6c4"], [480, 300, 400, "#d6a58a"], [780, 220, 600, "#b9c4a8"], [1000, 280, 360, "#c4b0c9"], [1280, 300, 480, "#a9b6c4"]];
  for (const [x, w, h, c] of B) {
    p.poly(box(x, 752 - h, x + w, 752), c, 11);
    for (let yy = 752 - h + 44; yy < 700; yy += 84) for (let xx = x + 34; xx < x + w - 50; xx += 74) p.poly(box(xx, yy, xx + 40, yy + 50), "#5d7f9a", 5);
  }
};
/** a beige 1990s computer with a top-down street on the screen, 560 x 520 canvas. chaos = police cars piled on the player's car */
export const fxOldPC = (p: Pen, chaos = false) => {
  p.poly(box(60, 400, 500, 500), "#d9d2bd", 11); p.poly(box(330, 432, 470, 450), "#3a3f48", 5); p.dot(110, 450, 9, GREEN);
  p.poly(box(30, 20, 530, 404), "#e4ddc8", 12);
  const S = box(70, 54, 490, 356); p.poly(S, "#6f9a5a", 8);
  p.clip(S, () => {
    p.poly(box(230, 40, 330, 370), "#5c6470", 0); p.poly(box(60, 180, 500, 250), "#5c6470", 0);
    for (let y = 60; y < 360; y += 44) if (y < 170 || y > 250) p.poly(box(276, y, 284, y + 24), "#f2e9c0", 0);
    for (const [x, y] of [[100, 80], [380, 76], [100, 280], [380, 284]] as P2[]) p.poly(box(x, y, x + 90, y + 66), "#b98a6a", 5);
    const car = (x: number, y: number, c: string, a: number) => { p.g.save(); p.g.translate(x, y); p.g.rotate(a); p.poly(box(-30, -17, 30, 17), c, 5); p.poly(box(-10, -13, 12, 13), "#bfe3f5", 0); p.g.restore(); };
    if (chaos) { car(280, 214, "#d8483a", 0.3); car(226, 196, "#f4f1ea", 0.5); car(336, 232, "#f4f1ea", -2.5); car(290, 160, "#f4f1ea", 1.7); for (const [x, y] of [[256, 196], [312, 226], [286, 184]] as P2[]) { p.ell(x, y, 13, 13, "#ffe14d", 4); } }
    else { car(280, 300, "#d8483a", -Math.PI / 2); car(280, 100, "#f4f1ea", -Math.PI / 2); }
  });
  p.poly(S, null, 8);
};
/** a beetle (a "bug"), 320 x 320 canvas */
export const fxBug = (p: Pen) => {
  for (const s of [-1, 1]) for (const [y, dy] of [[120, -40], [170, 0], [220, 44]] as P2[]) p.stroke([[160 + s * 60, y], [160 + s * 118, y + dy], [160 + s * 140, y + dy + 26]], 11);
  p.stroke([[136, 66], [108, 18]], 9); p.stroke([[184, 66], [212, 18]], 9);
  p.ell(160, 86, 50, 40, "#3a4150", 10);
  p.ell(160, 184, 86, 104, "#d8382f", 11); p.stroke([[160, 84], [160, 286]], 8);
  for (const [x, y] of [[122, 150], [198, 150], [112, 216], [208, 216], [140, 258], [180, 258]] as P2[]) p.dot(x, y, 13, INK);
  p.dot(142, 78, 8, "#ffffff"); p.dot(178, 78, 8, "#ffffff");
};
/** a plain big-box computer game with a title ("LINE|LINE") and a small heading, 420 x 540 canvas. No artwork, no logo. */
export const fxGameBox = (p: Pen, head: string, title: string, col = "#2f5a8a") => {
  p.poly([[44, 30], [392, 30], [392, 520], [44, 520]], col, 12);
  p.poly([[20, 54], [44, 30], [44, 520], [20, 500]], "#1f2a44", 9);
  p.poly(box(76, 150, 360, 400), PAPER, 8);
  text(p, head, 218, 96, fit(head, 44, 270), "#f1d98a");
  const L = title.split("|"), px = Math.min(...L.map((l) => fit(l, 70, 250)));
  L.forEach((l, i) => text(p, l, 218, 275 + (i - (L.length - 1) / 2) * px * 1.18, px, "#2b2430"));
  p.stroke([[100, 452], [336, 452]], 9, "#f1d98a");
};
/** a waste-paper bin, 300 x 360 canvas */
export const fxBin = (p: Pen) => {
  p.poly([[50, 90], [250, 90], [224, 344], [76, 344]], "#8f9ba8", 11);
  for (const x of [104, 150, 196]) p.stroke([[x, 110], [x + (150 - x) * 0.14, 326]], 6, "#5a6470");
  p.poly(box(34, 62, 266, 96), "#7a8794", 10);
  p.poly([[110, 60], [128, 24], [168, 14], [196, 40], [184, 62]], PAPER, 7);
};
/** a crash star with a word in it, 520 x 420 canvas */
export const fxCrash = (p: Pen, s = "CRASH!") => {
  const pts: P2[] = []; for (let i = 0; i < 24; i++) { const a = (TWO * i) / 24, r = i % 2 ? 0.62 : 1; pts.push([260 + 244 * r * Math.cos(a), 210 + 196 * r * Math.sin(a)]); }
  p.poly(pts, "#ffe14d", 12); text(p, s, 260, 214, fit(s, 96, 330), RED, 14);
};

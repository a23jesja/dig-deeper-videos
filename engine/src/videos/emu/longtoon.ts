// Extra drawings for the long film "The Army That Lost a War to Birds": speech / thought bubbles with picture
// icons (a machine gun, a target, a medal, a coin, an emu tank ...), rabbits, a height marker, paper, big cartridges.
import { Pen, INK } from "./toon";

type P2 = [number, number];
const TWO = Math.PI * 2;
const text = (p: Pen, s: string, x: number, y: number, px: number, fill: string, stroke = 0) => {
  const g = p.g;
  g.font = `900 ${px}px 'Arial Black', Impact, 'Segoe UI Black', sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  if (stroke) { g.lineWidth = stroke; g.strokeStyle = INK; g.lineJoin = "round"; g.strokeText(s, x, y); }
  g.fillStyle = fill; g.fillText(s, x, y);
};
export type Icon = "gun" | "target" | "tick" | "medal" | "q" | "coin" | "tank" | "no" | "bang";
const icon = (p: Pen, kind: Icon, cx: number, cy: number) => {
  switch (kind) {
    case "gun": { // Lewis gun: fat barrel, pan magazine, stock, tripod
      p.band([[cx - 20, cy - 6], [cx + 122, cy - 6]], "#4b505b", 30, 6, "round");
      p.poly([[cx - 122, cy - 16], [cx - 20, cy - 22], [cx - 20, cy + 10], [cx - 118, cy + 16]], "#8a5a34", 7);
      p.ell(cx - 6, cy - 34, 52, 15, "#6a6b4c", 7);
      for (const dx of [-46, 44]) p.stroke([[cx + 6, cy + 10], [cx + 6 + dx, cy + 84]], 9);
      p.stroke([[cx + 6, cy + 10], [cx + 6, cy + 84]], 9);
      break;
    }
    case "target": for (const [r, c] of [[98, "#d8382f"], [72, "#ffffff"], [47, "#d8382f"], [22, "#ffffff"]] as const) p.ell(cx, cy, r, r, c, r === 98 ? 9 : 5); p.dot(cx, cy, 9, "#d8382f"); break;
    case "tick": p.stroke([[cx - 78, cy + 4], [cx - 22, cy + 62], [cx + 86, cy - 62]], 46, INK); p.stroke([[cx - 78, cy + 4], [cx - 22, cy + 62], [cx + 86, cy - 62]], 28, "#3faa55"); break;
    case "medal": {
      p.poly([[cx - 82, cy - 96], [cx - 38, cy - 96], [cx - 28, cy - 6], [cx - 76, cy - 6]], "#c8382f", 7);
      p.poly([[cx - 38, cy - 96], [cx + 6, cy - 96], [cx + 14, cy - 6], [cx - 28, cy - 6]], "#2f5fae", 7);
      p.ell(cx - 34, cy + 40, 52, 52, "#e9b93a", 9); p.ell(cx - 34, cy + 40, 30, 30, "#f6d873", 5);
      text(p, "?", cx + 88, cy + 4, 170, "#2b2430");
      break;
    }
    case "q": text(p, "?", cx, cy + 6, 220, "#2b2430"); break;
    case "bang": text(p, "!", cx, cy + 6, 220, "#e04a34"); break;
    case "coin": p.ell(cx, cy, 92, 92, "#e9b93a", 10); p.ell(cx, cy, 70, 70, "#f6d873", 5); text(p, "£", cx, cy + 6, 120, "#8a6412"); break;
    case "no": text(p, "NO", cx, cy + 8, 170, "#d8382f", 16); break;
    case "tank": { // an emu's head and neck on a tank
      p.poly([[cx - 150, cy + 44], [cx + 150, cy + 44], [cx + 124, cy + 96], [cx - 124, cy + 96]], "#3d4046", 8);
      for (let i = -2; i <= 2; i++) p.ell(cx + i * 54, cy + 70, 20, 20, "#8b8f97", 6);
      p.poly([[cx - 128, cy - 8], [cx + 104, cy - 8], [cx + 140, cy + 44], [cx - 150, cy + 44]], "#6f7d4c", 8);
      p.poly([[cx - 60, cy - 54], [cx + 40, cy - 54], [cx + 58, cy - 8], [cx - 78, cy - 8]], "#7d8b58", 8);
      p.band([[cx + 40, cy - 34], [cx + 150, cy - 44]], "#4b505b", 16, 5, "round");
      p.band([[cx - 14, cy - 54], [cx - 22, cy - 112]], "#8fa9c2", 26, 6, "round");
      p.ell(cx - 22, cy - 126, 34, 27, "#8fa9c2", 7);
      p.poly([[cx + 4, cy - 134], [cx + 54, cy - 122], [cx + 4, cy - 112]], "#4b4440", 6);
      p.ell(cx - 14, cy - 130, 10, 10, "#fff4dc", 4); p.dot(cx - 12, cy - 129, 5.5);
      for (let i = 0; i < 4; i++) p.stroke([[cx - 44 + i * 12, cy - 150], [cx - 48 + i * 14, cy - 166]], 5, "#3a3440");
      break;
    }
  }
};
/** speech (tail) or thought (little clouds) bubble on a 520 x 420 canvas with one picture in it */
export const fxBubble = (p: Pen, kind: Icon, thought = false, flip = false) => {
  const cx = 260, cy = 180, s = flip ? -1 : 1;
  if (thought) { p.ell(cx - s * 150, cy + 176, 26, 22, "#ffffff", 8); p.ell(cx - s * 196, cy + 214, 15, 13, "#ffffff", 7); }
  else p.poly([[cx - s * 150, cy + 110], [cx - s * 208, cy + 224], [cx - s * 80, cy + 140]], "#ffffff", 10);
  const pts: P2[] = [];
  for (let i = 0; i < 64; i++) { const a = (TWO * i) / 64, w = thought ? 1 + 0.05 * Math.sin(a * 9) : 1; pts.push([cx + 240 * w * Math.cos(a), cy + 165 * w * Math.sin(a)]); }
  p.poly(pts, "#ffffff", 11);
  if (!thought) p.poly([[cx - s * 140, cy + 116], [cx - s * 196, cy + 206], [cx - s * 90, cy + 136]], "#ffffff", 0);
  icon(p, kind, cx, cy);
};
/** rabbit in profile on a 300 x 240 canvas, facing right; k = 0 crouched .. 1 stretched in mid-hop */
export const fxRabbit = (p: Pen, k: number) => {
  const fur = "#bda58c", st = 20 * k;
  p.stroke([[96, 176], [70 - st, 206]], 20, INK); p.stroke([[96, 176], [70 - st, 206]], 12, fur);
  p.stroke([[186, 176], [214 + st, 204]], 16, INK); p.stroke([[186, 176], [214 + st, 204]], 9, fur);
  p.ell(140, 150, 78 + 8 * k, 46 - 6 * k, fur, 8);
  p.ell(62, 140, 15, 15, "#ffffff", 6);
  for (const a of [-24, -6]) p.ell(214 + a * 0.5, 62, 12, 42, fur, 7, 0, 360, a);
  p.ell(216, 112, 36, 31, fur, 8);
  p.dot(228, 106, 5.5); p.dot(250, 118, 4.5, "#e58a8a");
};
/** height marker: a bracket and "6 FT" on a 260 x 600 canvas */
export const fxHeight = (p: Pen) => {
  p.stroke([[60, 20], [20, 20], [20, 580], [60, 580]], 22, INK); p.stroke([[60, 20], [20, 20], [20, 580], [60, 580]], 11, "#ffe14d");
  text(p, "6 FT", 158, 300, 76, "#ffe14d", 16);
};
/** a sheet of paper (the major's report) on a 200 x 260 canvas */
export const fxPaper = (p: Pen) => {
  p.poly([[20, 16], [180, 16], [180, 244], [20, 244]], "#fbf6e6", 8);
  for (let i = 0; i < 6; i++) p.stroke([[42, 56 + i * 30], [i === 5 ? 110 : 158, 56 + i * 30]], 7, "#8b8478");
};
/** a rifle cartridge standing on its base, on a 120 x 400 canvas */
export const fxRound = (p: Pen) => {
  p.poly([[28, 388], [92, 388], [92, 150], [76, 112], [70, 40], [60, 14], [50, 40], [44, 112], [28, 150]], "#dba93c", 9);
  p.poly([[44, 112], [76, 112], [70, 40], [60, 14], [50, 40]], "#c9784a", 0); p.stroke([[44, 112], [76, 112]], 6);
  p.stroke([[28, 366], [92, 366]], 6);
};
/** "=" */
export const fxEquals = (p: Pen) => { for (const y of [70, 130]) { p.stroke([[30, y], [170, y]], 40, INK); p.stroke([[30, y], [170, y]], 24, "#ffffff"); } };
/** a drop of sweat on an 80 x 110 canvas */
export const fxSweat = (p: Pen) => { p.poly([[40, 8], [66, 66], [56, 92], [40, 100], [24, 92], [14, 66]], "#8fd0f0", 7); };

// ---------------- the Wojtek film ----------------
/** speech bubble with words in it, on a 620 x 420 canvas */
export const fxSay = (p: Pen, s: string, flip = false) => {
  const cx = 310, cy = 170, d = flip ? -1 : 1, pts: P2[] = [];
  p.poly([[cx - d * 170, cy + 110], [cx - d * 236, cy + 232], [cx - d * 96, cy + 142]], "#ffffff", 10);
  for (let i = 0; i < 64; i++) { const a = (TWO * i) / 64; pts.push([cx + 292 * Math.cos(a), cy + 152 * Math.sin(a)]); }
  p.poly(pts, "#ffffff", 11);
  p.poly([[cx - d * 160, cy + 116], [cx - d * 222, cy + 212], [cx - d * 106, cy + 138]], "#ffffff", 0);
  const lines = s.split("|");
  lines.forEach((l, i) => text(p, l, cx, cy + (i - (lines.length - 1) / 2) * 86, lines.length > 1 ? 76 : 88, "#2b2430"));
};
/** a card with a heading and one big line (dog tag, paybook, name), on a 520 x 300 canvas */
export const fxCard = (p: Pen, head: string, big: string, fill = "#f6efd8") => {
  p.poly([[14, 14], [506, 14], [506, 286], [14, 286]], fill, 11);
  text(p, head, 260, 78, 50, "#6a5a40");
  text(p, big, 260, 190, big.length > 8 ? 62 : big.length > 5 ? 90 : 110, "#2b2430");
};
/** round "no animals" sign on a 300 x 300 canvas: a paw print under a red bar */
export const fxNoPets = (p: Pen) => {
  p.ell(150, 150, 132, 132, "#ffffff", 0); 
  p.ell(150, 176, 46, 38, "#3a2f2a", 0);
  for (const [x, y] of [[92, 124], [128, 96], [172, 96], [208, 124]]) p.ell(x, y, 19, 23, "#3a2f2a", 0);
  p.arc(150, 150, 122, 122, 0, 360, 26, "#d8382f");
  p.stroke([[66, 66], [234, 234]], 26, "#d8382f");
  p.arc(150, 150, 136, 136, 0, 360, 7);
};
/** four-point sparkle on a 200 x 200 canvas */
export const fxSparkle = (p: Pen) => {
  const pts: P2[] = [];
  for (let i = 0; i < 8; i++) { const a = (TWO * i) / 8, r = i % 2 ? 22 : 92; pts.push([100 + r * Math.cos(a), 100 + r * Math.sin(a)]); }
  p.poly(pts, "#ffe14d", 8);
};

// Drawings used only by shots 71-89 of "The Man Who Stole the Mona Lisa" (monaShots3b.ts): the cell bars, the bag
// with the two stone heads, the detective's reasoning, the cloth pulled back (seen from above), the trunk with its
// false bottom and the round inset that shows what lies in it.
import { Pen, INK } from "./toon";
import { drawMona, fxMona, fxStatue } from "./monatoon";

type P2 = [number, number];
const B = (x0: number, y0: number, x1: number, y1: number): P2[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const GOLD = "#d9a93a";
/** draw fn (made for a dw x dh canvas) into the box (x, y, w, h) */
const inBox = (p: Pen, x: number, y: number, w: number, h: number, dw: number, dh: number, fn: () => void) => { const g = p.g; g.save(); g.translate(x, y); g.scale(w / dw, h / dh); fn(); g.restore(); };

/** prison bars with wide gaps, 1200 x 800 canvas: a gap (not a bar) is at the middle of the card */
export const fxBarsD = (p: Pen) => {
  for (const y of [86, 706]) p.poly(B(0, y - 17, 1200, y + 17), "#4a505c", 8);
  for (let i = 0; i < 8; i++) { const x = 75 + i * 150; p.poly(B(x - 13, 0, x + 13, 800), "#5c6470", 8); p.stroke([[x - 5, 8], [x - 5, 792]], 4, "#8f9ba8"); }
};

/** a leather bag with two stone heads looking out of it, carried by its handle, 460 x 480 canvas (the grip is at the top middle) */
export const fxSackD = (p: Pen) => {
  p.arc(230, 252, 150, 216, 180, 360, 26, INK); p.arc(230, 252, 150, 216, 180, 360, 12, "#6a4424");
  for (const [cx, cy] of [[160, 214], [302, 204]] as P2[]) {
    p.ell(cx, cy, 54, 70, "#c4bdae", 9);
    p.poly([[cx - 54, cy - 20], [cx - 34, cy - 68], [cx + 34, cy - 68], [cx + 54, cy - 20], [cx + 30, cy - 38], [cx, cy - 46], [cx - 30, cy - 38]], "#a8a092", 7);
    for (const s of [-1, 1]) p.ell(cx + s * 22, cy - 6, 11, 7, "#8f8779", 4);
    p.stroke([[cx, cy], [cx - 4, cy + 24], [cx + 8, cy + 26]], 5, "#8f8779");
  }
  p.poly([[46, 252], [414, 252], [390, 456], [70, 456]], "#8a5a34", 11);
  p.poly(B(40, 240, 420, 284), "#6a4424", 8); p.poly(B(206, 250, 254, 300), GOLD, 6);
  for (const x of [120, 340]) p.stroke([[x, 290], [x + (x < 230 ? 6 : -6), 446]], 5, "#6a4424");
};

/** "if they had the statues, they have her too": a stone head, an arrow, the Mona Lisa; 900 x 360 canvas */
export const fxThenD = (p: Pen) => {
  inBox(p, 40, 14, 242, 332, 320, 440, () => fxStatue(p));
  p.stroke([[330, 180], [520, 180]], 46, INK); p.poly([[500, 96], [604, 180], [500, 264]], "#ffe14d", 11); p.stroke([[330, 180], [512, 180]], 26, "#ffe14d");
  inBox(p, 636, 10, 259, 340, 700, 920, () => fxMona(p));
};

/** short lines bursting from a point (a knock, a start), 320 x 320 canvas */
export const fxBurstD = (p: Pen, n = 5, a0 = -1.2, a1 = 1.2) => {
  for (let i = 0; i < n; i++) {
    const a = a0 + ((a1 - a0) * i) / (n - 1), l: P2[] = [[160 + 62 * Math.cos(a), 160 + 62 * Math.sin(a)], [160 + 136 * Math.cos(a), 160 + 136 * Math.sin(a)]];
    p.stroke(l, 24, INK); p.stroke(l, 11, "#ffe14d");
  }
};

/** Seen from above: the panel lying on the table under a cloth. k = how far the cloth has been folded back from the
 *  far end (0 = covered, 1 = her head and shoulders show). 1100 x 860 canvas; the top of the canvas is the far side. */
export const fxRevealD = (p: Pen, k = 0) => {
  const CL = "#ece5d2", FOLD = "#c2b594", px = 292, py = 66, pw = 516, ph = 722;
  if (k > 0.02) { p.poly(B(px - 4, py - 34, px + pw + 44, py + ph + 16), "#6a4424", 0); p.poly(B(px - 16, py - 16, px + pw + 16, py + ph + 16), "#b08a56", 10); drawMona(p, px, py, pw, ph); }
  const yT = 34 + 540 * k, cloth: P2[] = [[52, yT], [1048, yT]];
  for (let i = 0; i <= 8; i++) cloth.push([1050 + (i % 2 ? 14 : 0), yT + ((826 - yT) * i) / 8]);
  for (let i = 0; i <= 14; i++) cloth.push([1050 - (1000 * i) / 14, 826 + (i % 2 ? 0 : 14)]);
  for (let i = 0; i <= 8; i++) cloth.push([50 - (i % 2 ? 0 : 14), 826 - ((826 - yT) * i) / 8]);
  p.poly(cloth, CL, 11);
  p.clip(cloth, () => {
    // the shape of the flat thing under it, and a few creases
    p.stroke([[px - 22, py - 22], [px + pw + 22, py - 22], [px + pw + 22, py + ph + 22], [px - 22, py + ph + 22], [px - 22, py - 22]], 7, FOLD);
    for (const [a, b] of [[[150, 60], [120, 800]], [[930, 50], [972, 800]], [[60, 640], [280, 700]], [[1040, 610], [830, 690]]] as [P2, P2][]) p.stroke([a, b], 5, FOLD);
  });
  if (k > 0.02) {
    // the part that was folded back lies on top, underside up
    const d = Math.min(60 + 190 * k, 800 - yT), fold: P2[] = [[46, yT - 6], [1054, yT - 6]];
    for (let i = 0; i <= 12; i++) fold.push([1054 - (1008 * i) / 12, yT + d + (i % 2 ? 12 : 0)]);
    p.poly(fold, "#d9cfb4", 10);
    for (let i = 1; i < 6; i++) p.stroke([[46 + i * 168, yT + 8], [46 + i * 168 + 14, yT + d - 10]], 5, "#b3a580");
  }
};

/** The wooden trunk seen from the front, 900 x 820 canvas (stands on y = 796; the box is 780 wide).
 *  open: the lid stands up behind · panel 0..1: the painting standing in it (1 = up, 0 = laid down out of sight) ·
 *  things 0..3: his shirts, boots and brushes packed on top · cut: the front cut away low down to show the false bottom */
export type TrunkD = { open?: boolean; panel?: number; things?: number; cut?: boolean };
export const fxTrunkD = (p: Pen, o: TrunkD = {}) => {
  const W = "#8a5a34", WD = "#6a4424";
  if (!o.open) {
    p.poly(B(60, 430, 840, 790), W, 12); p.poly([[60, 430], [92, 346], [808, 346], [840, 430]], "#9a6a40", 12);
    for (const x of [170, 730]) p.poly(B(x - 27, 346, x + 27, 790), WD, 7);
    p.poly(B(408, 408, 492, 482), GOLD, 8); p.dot(450, 446, 9, INK);
    for (const x of [92, 808]) p.poly(B(x - 22, 560, x + 22, 626), "#3a3f48", 6);
    return;
  }
  p.poly([[60, 430], [112, 150], [788, 150], [840, 430]], "#7a4c2a", 12); p.poly([[106, 414], [148, 182], [752, 182], [794, 414]], "#b99a72", 6);
  p.poly(B(74, 392, 826, 440), "#3a2616", 7);
  const n = o.things ?? 0;
  if (n > 0) { // folded shirts
    p.poly(B(112, 372, 392, 444), "#9fb0c6", 8); p.poly(B(120, 326, 384, 376), "#f1ecdc", 8); p.poly(B(128, 282, 376, 330), "#f6f2e6", 8);
    p.poly([[214, 282], [252, 318], [290, 282]], "#dcd6c4", 6); for (const x of [252, 252]) p.dot(x, 312, 6, "#b9b2a0");
    for (const y of [344, 352]) p.stroke([[150, y + 12], [354, y + 12]], 4, "#cfc8b4");
  }
  if (n > 1) { // a pair of boots, standing
    for (const x of [470, 420]) { p.poly([[x, 250], [x + 62, 250], [x + 62, 372], [x + 128, 388], [x + 136, 444], [x, 444]], x === 470 ? "#4a3324" : "#3a2a1e", 9); p.poly(B(x - 4, 240, x + 66, 268), "#6a4a34", 7); }
  }
  if (n > 2) { // a tin with his brushes
    for (const [x, t] of [[672, 236], [712, 214], [752, 244]] as P2[]) { p.stroke([[x, 372], [x, t + 40]], 20, INK); p.stroke([[x, 372], [x, t + 40]], 10, "#c9a25a"); p.poly(B(x - 14, t, x + 14, t + 46), "#2b2b30", 6); }
    p.poly(B(646, 356, 778, 444), "#8f9ba8", 9); p.poly(B(646, 372, 778, 392), "#5f8ac0", 0); p.poly(B(646, 356, 778, 444), null, 9);
  }
  const up = o.panel ?? 0;
  if (up > 0.02) { const t = 92 + (1 - up) * 350; p.poly(B(312, t, 588, t + 378), "#b08a56", 10); drawMona(p, 324, t + 12, 252, 353); p.poly(B(324, t + 12, 576, t + 365), null, 6); }
  p.poly(B(60, 430, 840, 790), W, 12);
  for (const x of [170, 730]) p.poly(B(x - 27, 430, x + 27, 790), WD, 7);
  p.poly(B(408, 430, 492, 500), GOLD, 8); p.dot(450, 466, 9, INK);
  for (const x of [92, 808]) p.poly(B(x - 22, 560, x + 22, 626), "#3a3f48", 6);
  if (o.cut) {
    // the front cut open: under the board that looks like the bottom lies the panel
    const win: P2[] = [];
    for (let i = 0; i <= 12; i++) win.push([232 + i * 36.3, 592 + (i % 2 ? 14 : 0)]);
    for (let i = 0; i <= 12; i++) win.push([668 - i * 36.3, 776 - (i % 2 ? 0 : 0)]);
    p.poly(win, "#2e1d10", 9);
    p.poly(B(238, 628, 662, 656), "#d9b26a", 6); for (const x of [330, 450, 570]) p.stroke([[x, 632], [x, 652]], 3, "#a8824f");
    p.poly(B(262, 716, 638, 748), "#b08a56", 6); p.poly(B(266, 716, 634, 726), "#6f9488", 0); p.poly(B(262, 716, 638, 748), null, 6);
    p.poly(win, null, 9);
  }
};

/** a round inset on a pointer: the Mona Lisa, upright. 700 x 560 canvas; the pointer's tip is at (20, 545) */
export const fxInsetD = (p: Pen) => {
  p.poly([[262, 372], [20, 545], [318, 428]], "#ffffff", 10);
  p.ell(440, 250, 215, 215, "#ffffff", 11);
  p.poly([[268, 366], [44, 528], [312, 420]], "#ffffff", 0);
  p.poly(B(318, 82, 562, 418), "#b08a56", 9); drawMona(p, 328, 92, 224, 314); p.poly(B(328, 92, 552, 406), null, 5);
};

/** Where the near hand of somebody walking in the side view is: [metres ahead of the feet, metres above the ground].
 *  phase = the stride phase that walk() uses (undefined = standing). Follows bodySide() in toon.ts. */
export const sideHand = (phase: number | undefined, scale = 1): [number, number] => {
  const HH = 222, Wd = 236, u = Wd / 100, ankY = 975 - 4 * u, legLen = 1.52 * HH - 4 * u, S = 370, rad = Math.PI / 180;
  let hipY = ankY - legLen * 0.995, lean = 0, nearFwd = 0;
  if (phase !== undefined) {
    const st = (ph: number) => {
      const c = (((phase + ph) % 1) + 1) % 1;
      if (c < 0.5) { const s = c / 0.5; return { x: S / 2 - S * s, stance: true, s }; }
      const s = (c - 0.5) / 0.5;
      return { x: -S / 2 + S * s - (S / Math.PI) * Math.sin(2 * Math.PI * s), stance: false, s };
    };
    const nL = st(0), fL = st(0.5), stance = nL.stance ? nL : fL, Leff = legLen * (1 - 0.035 * Math.sin(Math.PI * stance.s));
    hipY = ankY - Math.sqrt(Math.max(1, Leff * Leff - stance.x * stance.x));
    lean = 4 + 2 * Math.cos(4 * Math.PI * phase); nearFwd = nL.x / (S / 2);
  }
  const chin = hipY + 0.12 * HH - 1.1 * HH, sx = 300 + 2 * u + 0.05 * 0.31 * Wd, sy = chin + 0.14 * HH, aLen = 0.95 * HH;
  const ang = -30 * rad * nearFwd, a2 = ang + 16 * rad * Math.sign(ang || 1);
  const hx = sx + (Math.sin(ang) + Math.sin(a2)) * aLen * 0.5, hy = sy + (Math.cos(ang) + Math.cos(a2)) * aLen * 0.5;
  const c = Math.cos(lean * rad), s = Math.sin(lean * rad), X = 300 + (hx - 300) * c - (hy - hipY) * s, Y = hipY + (hx - 300) * s + (hy - hipY) * c;
  return [(X - 300) * 0.00216 * scale, (975 - Y) * 0.00216 * scale];
};

/** a short arrow pointing straight down, 200 x 300 canvas (the tip is at the bottom middle) */
export const fxArrowD = (p: Pen) => {
  p.poly([[70, 12], [130, 12], [130, 160], [184, 160], [100, 288], [16, 160], [70, 160]], "#ffe14d", 12);
};

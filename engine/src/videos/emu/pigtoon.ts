// The Pig War (1859): the pig, seen side-on, in the same flat ink-outlined style as the rest of the cast
// (design canvas 900 x 1000, trotters at y = 975, snout to the right), plus the film's extra drawings: the two flags,
// a warship, a cannon, a rifle, a potato plant, a headstone.
import { Pen, INK, mul } from "./toon";

type P2 = [number, number];
type C3 = [number, number, number];
const TWO = Math.PI * 2;
const PINK = "#f1a9a4", PINK_D = "#dc8f8c", SNOUT = "#e98f8c";
const SH: C3 = [0.78, 0.7, 0.76];
const thickAngle = (light: number) => Math.atan2(-Math.sin(light) + 0.8, -Math.cos(light));
const blob = (cx: number, cy: number, rx: number, ry: number, n = 72): P2[] => {
  const pts: P2[] = [];
  for (let i = 0; i < n; i++) { const a = (TWO * i) / n; pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
  return pts;
};
const text = (p: Pen, s: string, x: number, y: number, px: number, fill: string) => {
  const g = p.g;
  g.font = `900 ${px}px 'Arial Black', Impact, 'Segoe UI Black', sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = fill; g.fillText(s, x, y);
};

export type PigMode = "stand" | "walk" | "eat" | "dead";
export type PigOpts = { mode?: PigMode; phase?: number; k?: number; blink?: number; light?: number; expr?: "calm" | "happy" | "shock" };

export const pigSide = (p: Pen, o: PigOpts = {}) => {
  const { mode = "stand", phase = 0, k = 0, blink = 0, light = -2.1, expr = "calm" } = o;
  const thick = thickAngle(light), sole = 975;
  if (mode === "dead") {
    // on its back, trotters in the air, eyes crossed out
    const by = 838;
    for (const x of [300, 380, 520, 600]) { p.stroke([[x, by - 100], [x + (x < 450 ? -14 : 14), by - 236]], 46, INK); p.stroke([[x, by - 100], [x + (x < 450 ? -14 : 14), by - 236]], 28, PINK_D); p.ell(x + (x < 450 ? -15 : 15), by - 244, 22, 15, "#5a4038", 7); }
    const bp = blob(450, by, 262, 132);
    p.gradFill(bp, PINK, mul(PINK, SH), light, 0.3); p.inkRing(bp, 11, thick, 0.4);
    p.poly([[648, by - 78], [700, by - 150], [716, by - 66]], PINK_D, 9);
    const hp = blob(690, by + 22, 112, 100);
    p.gradFill(hp, PINK, mul(PINK, SH), light, 0.3); p.inkRing(hp, 10, thick, 0.4);
    p.ell(792, by + 30, 46, 52, SNOUT, 9); p.ell(800, by + 12, 8, 12, "#8a4a48", 0); p.ell(800, by + 46, 8, 12, "#8a4a48", 0);
    for (const [a, b] of [[[-16, -16], [16, 16]], [[-16, 16], [16, -16]]]) p.stroke([[690 + a[0], by - 12 + a[1]], [690 + b[0], by - 12 + b[1]]], 8);
    p.poly([[742, by + 70], [770, by + 78], [760, by + 112], [738, by + 100]], "#e2607a", 6);
    return;
  }
  const eat = mode === "eat", walk = mode === "walk";
  const bob = walk ? 8 * Math.cos(2 * TWO * phase) : 0, by = 760 + bob;
  // legs (far pair darker)
  const leg = (x: number, ph: number, far: boolean) => {
    const sw = walk ? 46 * Math.sin(TWO * (phase + ph)) : 0, up = walk ? Math.max(0, Math.cos(TWO * (phase + ph))) * 26 : 0;
    const fx = x + sw, fy = sole - 26 - up, c = far ? PINK_D : PINK;
    p.stroke([[x, by + 70], [fx, fy]], 62, INK); p.stroke([[x, by + 70], [fx, fy]], 44, c);
    p.ell(fx, fy + 10, 32, 18, "#5a4038", 8);
  };
  leg(330, 0.5, true); leg(590, 0, true);
  // curly tail
  const tl: P2[] = []; for (let i = 0; i <= 24; i++) { const a = (i / 24) * TWO * 1.6, r = 34 - i * 0.9; tl.push([176 - i * 1.2 + r * Math.cos(a), by - 60 + r * Math.sin(a)]); }
  p.stroke(tl, 20, INK); p.stroke(tl, 9, PINK_D);
  // body
  const bp = blob(450, by, 262, 152);
  p.gradFill(bp, PINK, mul(PINK, SH), light, 0.3);
  p.inkRing(bp, 11, thick, 0.4);
  leg(300, 0, false); leg(560, 0.5, false);
  // head: lowered to the ground when eating
  const hx = eat ? 694 : 704, hy = (eat ? by + 92 + 10 * Math.sin(k * TWO) : by - 34) + (expr === "shock" ? -10 : 0);
  p.poly([[hx - 70, hy - 70], [hx - 30, hy - 150], [hx + 4, hy - 72]], PINK_D, 9);                 // far ear
  const hp = blob(hx, hy, 118, 104);
  p.gradFill(hp, PINK, mul(PINK, SH), light, 0.3);
  p.inkRing(hp, 10, thick, 0.4);
  p.poly([[hx - 30, hy - 78], [hx + 22, hy - 160], [hx + 50, hy - 70]], PINK, 9);                  // near ear
  const sx = hx + 108, sy = hy + (eat ? 30 : 16);
  p.ell(sx, sy, 48, 54, SNOUT, 9); p.ell(sx + 8, sy - 18, 8, 12, "#8a4a48", 0); p.ell(sx + 8, sy + 18, 8, 12, "#8a4a48", 0);
  const ex = hx + 40, ey = hy - 26;
  if (blink > 0.6 || expr === "happy" || eat) p.arc(ex, ey + 4, 15, 10, expr === "happy" || eat ? 200 : 20, expr === "happy" || eat ? 340 : 160, 7);
  else { p.dot(ex, ey, expr === "shock" ? 15 : 11); p.dot(ex + (expr === "shock" ? 0 : 3), ey - 3, expr === "shock" ? 6 : 3.5, "#ffffff"); }
  if (expr === "shock") p.ell(hx + 62, hy + 62, 14, 16, "#5a1e28", 6);
  else p.arc(hx + 56, hy + 44, 30, 22, 20, 120, 6);
};

// ---------------- props drawn as cards ----------------
/** the Stars and Stripes of 1859 (33 stars) on a pole, 520 x 720 canvas */
export const fxFlagUS = (p: Pen, wave = 0) => {
  p.poly([[30, 14], [50, 14], [50, 712], [30, 712]], "#8a6a4a", 8);
  const x0 = 54, x1 = 500, y0 = 30, h = 286, sk = 10 * Math.sin(wave);
  for (let i = 0; i < 13; i++) p.poly([[x0, y0 + (i * h) / 13], [x1, y0 + (i * h) / 13 + sk], [x1, y0 + ((i + 1) * h) / 13 + sk], [x0, y0 + ((i + 1) * h) / 13]], i % 2 ? "#ffffff" : "#c8312b", 0);
  p.poly([[x0, y0], [x0 + 190, y0 + sk * 0.42], [x0 + 190, y0 + (7 * h) / 13 + sk * 0.42], [x0, y0 + (7 * h) / 13]], "#2a3f7a", 0);
  let n = 0;
  for (let r = 0; r < 5; r++) { const m = r % 2 ? 6 : 7; for (let c = 0; c < m; c++) { p.dot(x0 + 20 + (r % 2 ? 12.5 : 0) + c * 25, y0 + 18 + r * 29 + sk * 0.2, 6.5, "#ffffff"); n++; } }
  p.poly([[x0, y0], [x1, y0 + sk], [x1, y0 + h + sk], [x0, y0 + h]], null, 9);
};
/** the Union Jack on a pole, 520 x 720 canvas */
export const fxFlagUK = (p: Pen, wave = 0) => {
  p.poly([[30, 14], [50, 14], [50, 712], [30, 712]], "#8a6a4a", 8);
  const x0 = 54, x1 = 500, y0 = 30, y1 = 316, sk = 10 * Math.sin(wave), g = p.g;
  const quad: P2[] = [[x0, y0], [x1, y0 + sk], [x1, y1 + sk], [x0, y1]];
  p.poly(quad, "#2a3f7a", 0);
  p.clip(quad, () => {
    p.stroke([[x0, y0], [x1, y1 + sk]], 58, "#ffffff"); p.stroke([[x0, y1], [x1, y0 + sk]], 58, "#ffffff");
    p.stroke([[x0, y0], [x1, y1 + sk]], 20, "#c8312b"); p.stroke([[x0, y1], [x1, y0 + sk]], 20, "#c8312b");
    p.stroke([[(x0 + x1) / 2, y0 - 10], [(x0 + x1) / 2, y1 + 20]], 92, "#ffffff"); p.stroke([[x0, (y0 + y1) / 2], [x1, (y0 + y1) / 2 + sk]], 92, "#ffffff");
    p.stroke([[(x0 + x1) / 2, y0 - 10], [(x0 + x1) / 2, y1 + 20]], 54, "#c8312b"); p.stroke([[x0, (y0 + y1) / 2], [x1, (y0 + y1) / 2 + sk]], 54, "#c8312b");
  });
  void g;
  p.poly(quad, null, 9);
};
/** a steam-and-sail warship of the 1850s, broadside on, 1000 x 760 canvas (waterline at y = 700) */
export const fxWarship = (p: Pen) => {
  for (const [x, h] of [[250, 520], [500, 590], [740, 500]] as const) {
    p.poly([[x - 9, 700 - h], [x + 9, 700 - h], [x + 9, 520], [x - 9, 520]], "#8a6a4a", 7);
    for (const [yy, w] of [[700 - h + 60, 150], [700 - h + 200, 190]] as const) { p.poly([[x - w, yy], [x + w, yy], [x + w - 10, yy + 104], [x - w + 10, yy + 104]], "#f4efe0", 8); p.stroke([[x - w - 8, yy], [x + w + 8, yy]], 10, "#6a4a2c"); }
  }
  p.poly([[590, 400], [640, 400], [640, 520], [590, 520]], "#2b2b30", 8);                                  // funnel
  p.poly([[40, 500], [960, 500], [900, 690], [110, 690]], "#23262e", 12);                                  // hull
  p.poly([[62, 548], [948, 548], [934, 596], [78, 596]], "#f4efe0", 0);
  for (let i = 0; i < 7; i++) p.poly([[150 + i * 110, 556], [196 + i * 110, 556], [196 + i * 110, 590], [150 + i * 110, 590]], "#23262e", 0);   // gun ports
  p.stroke([[960, 500], [1000, 440]], 12, "#6a4a2c");                                                    // bowsprit
  p.poly([[60, 380], [60, 470], [150, 452], [150, 398]], "#c8312b", 6); p.stroke([[60, 500], [60, 372]], 8, "#6a4a2c");   // ensign
  p.poly([[60, 380], [100, 380], [100, 420], [60, 420]], "#2a3f7a", 0);
};
/** a field cannon on its carriage, muzzle to the right, 420 x 260 canvas */
export const fxCannon = (p: Pen) => {
  p.poly([[60, 150], [250, 132], [256, 162], [70, 190]], "#7a5a3a", 8);                                    // trail
  p.poly([[150, 92], [400, 70], [404, 116], [156, 146]], "#3a3d42", 9);                                    // barrel
  p.ell(150, 119, 22, 30, "#3a3d42", 8);
  p.ell(214, 186, 62, 62, "#8a6a4a", 10); p.ell(214, 186, 44, 44, "#c9a777", 6); p.dot(214, 186, 12);
  for (let i = 0; i < 6; i++) { const a = (TWO * i) / 6; p.stroke([[214, 186], [214 + 44 * Math.cos(a), 186 + 44 * Math.sin(a)]], 6, "#6a4a2c"); }
};
/** a long rifle, muzzle to the right, 560 x 120 canvas */
export const fxRifle = (p: Pen) => {
  p.poly([[20, 40], [150, 46], [176, 60], [150, 86], [60, 96], [20, 90]], "#8a5a34", 8);
  p.poly([[150, 50], [540, 50], [540, 64], [150, 70]], "#4a4d55", 7);
  p.poly([[150, 62], [380, 62], [380, 78], [150, 82]], "#8a5a34", 6);
};
/** a potato plant: a tuft of leaves and two tubers, 220 x 220 canvas */
export const fxPotato = (p: Pen, eaten = false) => {
  if (!eaten) for (const [x, y, r, a] of [[70, 110, 44, -30], [110, 84, 50, 0], [150, 110, 44, 30]] as const) p.ell(x, y, r * 0.62, r, "#5f9a45", 8, 0, 360, a);
  else p.stroke([[110, 150], [112, 118]], 9, "#5f9a45");
  p.ell(80, 176, 34, 24, "#c9a25e", 8, 0, 360, -12); if (!eaten) p.ell(142, 180, 30, 22, "#b98f4e", 8, 0, 360, 10);
};
/** a headstone, 420 x 480 canvas; lines "A|B|C" */
export const fxGrave = (p: Pen, s: string) => {
  const pts: P2[] = [[50, 470], [50, 190]];
  for (let i = 0; i <= 16; i++) { const a = Math.PI - (Math.PI * i) / 16; pts.push([210 + 160 * Math.cos(a), 190 - 150 * Math.sin(a)]); }
  pts.push([370, 470]);
  p.poly(pts, "#b9b6ae", 12);
  s.split("|").forEach((l, i) => text(p, l, 210, 170 + i * 84, i === 1 ? 62 : 52, "#3a3a40"));
};

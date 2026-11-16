// Pompeii: the guard dog (side view, nose to the right of the picture; mirror it with the place's mirror flag), drawn in
// code the way the emus and the pig are (design canvas 900 x 1000, paws at y = 975), plus the few small things of the
// Roman street that are drawn as cards: a loaf, a coin, a pumice stone, a falling roof tile. Same flat ink-outlined style.
import { Pen, INK, mul } from "./toon";

type P2 = [number, number];
type C3 = [number, number, number];
const TWO = Math.PI * 2;
const FUR = "#cf9d5c", FUR_D = "#b07f43", MUZZLE = "#efd7a8", EAR = "#7a4a28", COLLAR = "#c8312b", GOLDC = "#e9b93a";
const SH: C3 = [0.74, 0.68, 0.72];
const thickAngle = (light: number) => Math.atan2(-Math.sin(light) + 0.8, -Math.cos(light));
const blob = (cx: number, cy: number, rx: number, ry: number, rot = 0, n = 64): P2[] => {
  const pts: P2[] = [], c = Math.cos(rot), s = Math.sin(rot);
  for (let i = 0; i < n; i++) { const a = (TWO * i) / n, x = rx * Math.cos(a), y = ry * Math.sin(a); pts.push([cx + x * c - y * s, cy + x * s + y * c]); }
  return pts;
};

export type DogMode = "sit" | "stand" | "run" | "bark";
export type DogOpts = { mode?: DogMode; phase?: number; k?: number; blink?: number; light?: number; chain?: boolean; expr?: "calm" | "happy" | "shock" };

/** a chain of grey links along a polyline */
const chainLine = (p: Pen, pts: P2[]) => {
  let carry = 0;
  for (let i = 0; i + 1 < pts.length; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], L = Math.hypot(x1 - x0, y1 - y0), a = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
    for (let d = carry; d < L; d += 24) { const t = d / L, k = Math.round(d / 24) % 2; p.ell(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, k ? 8 : 15, k ? 15 : 9, k ? "#6f767e" : "#9aa1a9", 4.5, 0, 360, a); }
    carry = 0;
  }
};

export const dogSide = (p: Pen, o: DogOpts = {}) => {
  const { mode = "stand", phase = 0, k = 0, blink = 0, light = -2.1, chain = false, expr = "calm" } = o;
  const thick = thickAngle(light), sole = 975, run = mode === "run", sit = mode === "sit", bark = mode === "bark";
  const wag = Math.sin(TWO * k);
  const fill = (pts: P2[], c: string, w = 11) => { p.gradFill(pts, c, mul(c, SH), light, 0.3); p.inkRing(pts, w, thick, 0.4); };
  const limb = (a: P2, b: P2, w: number, c: string) => { p.stroke([a, b], w + 14, INK); p.stroke([a, b], w, c); };
  const paw = (x: number, y: number, c = "#e6c690") => p.ell(x, y, 50, 25, c, 8);
  const bob = run ? 14 * Math.cos(2 * TWO * phase) : 0;
  const by = (sit ? 735 : run ? 650 : 705) + bob;
  // ---- the chain on the ground (behind everything): from the stake at the left to under the collar ----
  const hx = sit ? 690 : run ? 760 : bark ? 735 : 705, hy = sit ? 470 : run ? 510 : bark ? 520 : 545;
  if (chain) {
    p.poly([[22, 880], [58, 880], [64, 968], [18, 968]], "#7b5a3a", 9); p.ell(40, 888, 16, 16, null, 7);
    chainLine(p, [[44, 896], [120, 955], [330, 962], [560, 962], [hx - 100, hy + 150]]);
  }
  // ---- legs: far pair darker, then tail, body, near pair ----
  const swing = (ph: number, amp: number) => amp * Math.sin(TWO * (phase + ph)), lift = (ph: number, amp: number) => amp * Math.max(0, Math.cos(TWO * (phase + ph)));
  if (sit) {
    limb([600, by + 40], [600, sole - 22], 46, FUR_D); paw(624, sole - 14, "#d9b878");
  } else if (run) {
    const fl = (x: number, ph: number, c: string) => { const sw = swing(ph, 110), up = lift(ph, 70); limb([x, by + 50], [x + sw, sole - 26 - up], 44, c); p.ell(x + sw + 14, sole - 14 - up, 40, 20, c === FUR_D ? "#d9b878" : "#e6c690", 8); };
    fl(600, 0.5, FUR_D); fl(260, 0.0, FUR_D);
  } else {
    limb([590, by + 60], [596, sole - 24], 58, FUR_D); paw(612, sole - 14, "#d9b878");
    limb([300, by + 60], [294, sole - 24], 58, FUR_D); paw(316, sole - 14, "#d9b878");
  }
  // tail
  const tl: P2[] = sit ? [[170, 880], [110, 872 - 40 * wag], [48, 836 - 90 * wag]] : run ? [[190, by - 40], [120, by - 130], [60, by - 190 + 20 * wag]] : [[185, by - 50], [112, by - 120], [70, by - 215 + 55 * wag]];
  p.stroke(tl, 52, INK); p.stroke(tl, 34, FUR);
  // body
  if (sit) {
    fill(blob(470, by, 250, 128, -0.62), FUR);
    fill(blob(300, 835, 150, 130), FUR);
    p.ell(370, sole - 12, 76, 24, "#e6c690", 8);
  } else if (run) {
    fill(blob(440, by, 285, 118, -0.06), FUR);
  } else fill(blob(430, by, 258, 128), FUR);
  // near legs
  if (sit) { limb([560, by + 20], [560, sole - 22], 50, FUR); paw(588, sole - 14); }
  else if (run) {
    const fl = (x: number, ph: number) => { const sw = swing(ph, 110), up = lift(ph, 70); limb([x, by + 50], [x + sw, sole - 26 - up], 48, FUR); p.ell(x + sw + 14, sole - 14 - up, 42, 21, "#e6c690", 8); };
    fl(560, 0.0); fl(310, 0.5);
  } else {
    limb([550, by + 60], [556, sole - 24], 62, FUR); paw(574, sole - 14);
    limb([340, by + 60], [334, sole - 24], 62, FUR); paw(356, sole - 14);
  }
  // neck, then the collar on it, then the head
  const nx = sit ? 620 : 590, ny = sit ? 640 : 640;
  fill(blob((nx + hx) / 2 - 10, (ny + hy) / 2 + 50, 110, 128, Math.atan2(hy - ny, hx - nx) - 1.2), FUR, 9);
  const cx0 = hx - 78, cy0 = hy + 70;
  p.stroke([[cx0 - 26, cy0 - 18], [cx0 + 34, cy0 + 38]], 38, INK); p.stroke([[cx0 - 24, cy0 - 16], [cx0 + 32, cy0 + 36]], 26, COLLAR);
  p.ell(cx0 + 14, cy0 + 46, 17, 17, GOLDC, 6);
  const sh = expr === "shock" ? -10 : 0;
  fill(blob(hx, hy + sh, 108, 96), FUR, 10);
  // muzzle, nose, mouth
  const mx = hx + 96, my = hy + sh + 36;
  p.ell(mx, my, 74, 48, MUZZLE, 9);
  p.dot(mx + 62, my - 18, 21, INK); p.dot(mx + 54, my - 25, 6, "#ffffff");
  if (bark || run) {   // mouth open: dark inside, tongue
    p.poly([[mx - 30, my + 14], [mx + 62, my + 12], [mx + 52, my + 74], [mx - 8, my + 66]], "#5a1e28", 8);
    p.ell(mx + 18, my + 62, 26, 20, "#e86e78", 5);
  } else if (expr === "happy" || sit) { p.arc(mx + 6, my + 2, 52, 28, 10, 130, 6); p.ell(mx + 16, my + 46, 22, 17, "#e86e78", 5); }
  else p.arc(mx + 8, my - 2, 50, 24, 10, 120, 6);
  // eye
  const ex = hx + 36, ey = hy + sh - 26;
  if (blink > 0.6) p.arc(ex, ey + 4, 18, 12, 200, 340, 7);
  else { p.dot(ex, ey, expr === "shock" || bark ? 18 : 14); p.dot(ex + 4, ey - 5, expr === "shock" || bark ? 7 : 4.5, "#ffffff"); }
  p.stroke([[ex - 22, ey - 30 + (expr === "shock" ? -6 : 0)], [ex + 22, ey - 40 + (bark ? 8 : 0)]], 8);   // brow
  // floppy ear: a long teardrop hanging from the top of the head (streaming back at a run)
  const er = run ? -0.75 : 0.12, ea = run ? [hx - 70, hy + sh - 30] : [hx - 54, hy + sh + 22];
  fill(blob(ea[0], ea[1], 38, 86, er), EAR, 8);
  if (bark) for (let i = 0; i < 3; i++) p.arc(mx + 118, my - 6, 36 + i * 34, 46 + i * 36, -40, 40, 9);   // sound
};

// ---------------- small cards of the street ----------------
/** a round loaf of bread with scored top, 220 x 160 canvas */
export const fxLoaf = (p: Pen) => {
  p.ell(110, 90, 90, 56, "#c98c4a", 9);
  p.ell(98, 72, 56, 28, "#dba463", 0);
  for (const x of [58, 94, 130, 166]) p.stroke([[x - 14, 48], [x + 6, 108]], 7, "#8a5424");
};
/** a gold coin, 100 x 100 canvas */
export const fxCoin = (p: Pen) => { p.ell(50, 50, 38, 38, "#e9b93a", 8); p.ell(50, 50, 24, 24, null, 4, 0, 360); p.stroke([[40, 52], [60, 52]], 5, "#b98a22"); };
/** a falling stone of pumice, pale and pitted, 200 x 180 canvas */
export const fxPumice = (p: Pen, seed = 1) => {
  const pts: P2[] = [];
  for (let i = 0; i < 14; i++) { const a = (TWO * i) / 14, r = 74 + 20 * Math.sin(seed * 3.1 + i * 2.3) + 8 * Math.cos(seed + i * 5.1); pts.push([100 + r * Math.cos(a), 90 + 0.86 * r * Math.sin(a)]); }
  p.poly(pts, "#e9e2d2", 9);
  for (const [x, y, r] of [[74, 70, 11], [120, 106, 13], [96, 128, 8], [128, 64, 8], [66, 112, 7], [106, 82, 6]] as const) p.ell(x, y, r, r * 0.8, "#b9b09c", 0);
  p.stroke([[60, 62], [90, 44]], 7, "#fbf8ef");
};
/** a roof tile (terracotta), 240 x 140 canvas */
export const fxTile = (p: Pen) => { p.poly([[30, 110], [60, 24], [190, 24], [214, 110]], "#c9663a", 9); p.stroke([[100, 30], [92, 104]], 6, "#8a3e20"); p.stroke([[150, 30], [150, 104]], 6, "#8a3e20"); };
/** a clay cup, 100 x 100 canvas */
export const fxCup = (p: Pen) => { p.stroke([[78, 40], [92, 52], [76, 66]], 9, INK); p.stroke([[78, 40], [92, 52], [76, 66]], 4.5, "#c9663a"); p.poly([[18, 24], [82, 24], [72, 84], [28, 84]], "#c9663a", 8); p.stroke([[24, 38], [76, 38]], 6, "#8a3e20"); };

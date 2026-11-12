// Wojtek, the Syrian brown bear who served in the Polish army, drawn with the Pen API in the same flat
// ink-outlined style as the human cast. Design canvas 900 x 1000, soles at y = 975, seen from the front,
// standing upright (an adult is ~1.8 m; the cub is the same drawing with a bigger head, placed at a smaller scale).
import { Pen, INK, mul, mix, rnd } from "./toon";

type P2 = [number, number];
type C3 = [number, number, number];
const TWO = Math.PI * 2;
const rad = (d: number) => (d * Math.PI) / 180;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const FUR = "#8a5c3a", FUR_D = "#6b4429", BELLY = "#a87a4e", MUZZ = "#d2b08a";
const SH: C3 = [0.66, 0.64, 0.72];
const thickAngle = (light: number) => Math.atan2(-Math.sin(light) + 0.8, -Math.cos(light));
const blob = (cx: number, cy: number, rx: number, ry: number, egg = 0, n = 72, seed = 1, fuzz = 0): P2[] => {
  const pts: P2[] = [];
  for (let i = 0; i < n; i++) {
    const a = (TWO * i) / n, sa = Math.sin(a), ca = Math.cos(a), w = 1 + egg * sa, f = 1 + fuzz * Math.abs(Math.sin(a * 11 + seed));
    pts.push([cx + rx * w * f * ca, cy + ry * f * sa]);
  }
  return pts;
};
const limb = (p: Pen, pts: P2[], w0: number, w1: number, fill: string) => {
  const L: P2[] = [], R: P2[] = [], n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const h = lerp(w0, w1, i / (n - 1)) / 2;
    L.push([pts[i][0] + nx * h, pts[i][1] + ny * h]); R.push([pts[i][0] - nx * h, pts[i][1] - ny * h]);
  }
  p.poly([...L, ...R.reverse()], fill, 9);
  const e = pts[n - 1]; p.ell(e[0], e[1], w1 * 0.62, w1 * 0.56, fill, 9);
};
const curve3 = (a: P2, k: P2, b: P2, n = 10): P2[] => {
  const out: P2[] = [];
  for (let i = 0; i <= n; i++) { const t = i / n, s = 1 - t; out.push([s * s * a[0] + 2 * s * t * k[0] + t * t * b[0], s * s * a[1] + 2 * s * t * k[1] + t * t * b[1]]); }
  return out;
};

export type BearExpr = "calm" | "happy" | "shock" | "sleepy" | "proud";
export type BearPose = "stand" | "salute" | "carry" | "drink" | "cheer" | "wave" | "sit";
export type BearOpts = {
  pose?: BearPose; expr?: BearExpr; blink?: number; look?: number; cub?: boolean; light?: number; seed?: number;
  /** walking / marching on the hind legs: gait cycle 0..1 */
  phase?: number; walk?: boolean;
  /** soldier's field cap; stripes = corporal's two chevrons on the arm */
  cap?: boolean; stripes?: boolean;
  /** pose amount 0..1 (salute arm up, bottle to the mouth, cheer height) */
  k?: number;
  /** what is written on the carried crate */
  crate?: string;
};

export const bearFront = (p: Pen, o: BearOpts = {}) => {
  const { pose = "stand", expr = "calm", blink = 0, look = 0, cub = false, light = rad(-120), seed = 1, phase = 0, walk = false, k = 1 } = o;
  const cx = 450, sole = 975, thick = thickAngle(light);
  const hk = cub ? 1.28 : 1, sit = pose === "sit";
  const sway = walk ? 14 * Math.sin(TWO * phase) : 0, bob = walk ? 12 * Math.cos(2 * TWO * phase) : 0;
  const by = (sit ? 700 : 640) + bob, bx = cx + sway;       // belly centre
  const bodyRy = sit ? 190 : 225, headY = by - bodyRy - 62 * hk + (sit ? 12 : 0);
  // ---- legs ----
  for (const [s, ph] of [[-1, 0], [1, 0.5]] as const) {
    const up = walk ? Math.max(0, Math.sin(TWO * (phase + ph))) * 52 : 0;
    if (sit) { limb(p, [[bx + s * 96, by + 120], [bx + s * 176, by + 190], [bx + s * 214, sole - 34]], 96, 78, FUR_D); for (const d of [-22, 0, 22]) p.stroke([[bx + s * 214 + d, sole - 62], [bx + s * 214 + d * 1.3, sole - 80]], 7); continue; }
    const fx = cx + s * 92, fy = sole - 30 - up;
    limb(p, [[bx + s * 84, by + 120], [lerp(bx + s * 84, fx, 0.5) + s * 8, (by + 120 + fy) / 2], [fx, fy]], 112, 92, FUR_D);
    p.ell(fx, fy + 12, 64, 26, FUR_D, 9);
    for (const d of [-30, 0, 30]) p.stroke([[fx + d, fy + 20], [fx + d * 1.15, fy + 36]], 7);
  }
  // ---- arms behind the body (hanging / raised) ----
  const shY = by - bodyRy * 0.55, sh = (s: number): P2 => [bx + s * 140, shY];
  const hang = (s: number): P2[] => curve3(sh(s), [bx + s * 208, shY + 120], [bx + s * 188, shY + 262 - (walk ? 26 * s * Math.sin(TWO * phase) : 0)]);
  const armL = pose === "cheer" ? curve3(sh(-1), [bx - 230, shY - 60 * k], [bx - 214, shY - 200 * k]) : hang(-1);
  let armR: P2[] | null = pose === "cheer" || pose === "wave" ? curve3(sh(1), [bx + 232, shY - 60 * k], [bx + 216 + (pose === "wave" ? 24 * Math.sin(k * 6) : 0), shY - 200]) : pose === "stand" || pose === "sit" ? hang(1) : null;
  if (pose !== "carry") limb(p, armL, 86, 70, FUR_D);
  if (armR) limb(p, armR, 86, 70, FUR_D);
  // ---- body: a big pear with a lighter belly ----
  const bp = blob(bx, by, 190, bodyRy, 0.16, 84, seed, 0.02);
  p.gradFill(bp, FUR, mul(FUR, SH), light, 0.3);
  p.clip(bp, () => {
    p.ell(bx, by + 40, 118, bodyRy * 0.72, BELLY, 0);
    for (let i = 0; i < 14; i++) { const fx = bx - 160 + 320 * rnd(seed + i, 3), fy = by - 150 + 300 * rnd(seed + i, 5); p.stroke([[fx, fy], [fx + 4, fy + 22]], 5, mix(FUR, INK, 0.28)); }
  });
  p.inkRing(bp, 11, thick, 0.4);
  if (o.stripes) for (const y of [0, 22]) p.stroke([[bx + 150, shY + 60 + y], [bx + 172, shY + 82 + y], [bx + 194, shY + 60 + y]], 9, "#f2e9d0");
  // ---- head ----
  const hx = bx * 0.4 + cx * 0.6 + look * 6, hy = headY;
  for (const s of [-1, 1]) { p.ell(hx + s * 92 * hk, hy - 72 * hk, 40 * hk, 38 * hk, FUR, 10); p.ell(hx + s * 92 * hk, hy - 70 * hk, 20 * hk, 19 * hk, "#c08a72", 0); }
  const hp = blob(hx, hy, 122 * hk, 104 * hk, -0.06, 64, seed + 3, 0.012);
  p.gradFill(hp, FUR, mul(FUR, SH), light, 0.35);
  p.inkRing(hp, 10, thick, 0.4);
  const my = hy + 34 * hk;
  p.ell(hx, my, 62 * hk, 46 * hk, MUZZ, 7);
  p.ell(hx, my - 20 * hk, 25 * hk, 16 * hk, "#2b2026", 0);
  const open = expr === "shock" || (pose === "drink" && k > 0.6);
  if (open) p.ell(hx, my + 16 * hk, 15 * hk, 17 * hk, "#5a1e28", 5);
  else if (expr === "happy" || expr === "proud") { p.arc(hx, my + 2 * hk, 26 * hk, 22 * hk, 20, 160, 6); }
  else p.stroke([[hx, my - 6 * hk], [hx, my + 10 * hk], [hx - 16 * hk, my + 18 * hk]], 5);
  if (!open && expr !== "happy" && expr !== "proud") p.stroke([[hx, my + 10 * hk], [hx + 16 * hk, my + 18 * hk]], 5);
  for (const s of [-1, 1]) {
    const ex = hx + s * 50 * hk + look * 5, ey = hy - 16 * hk;
    if (blink > 0.6 || expr === "happy" || expr === "sleepy") p.arc(ex, ey + (expr === "happy" ? 4 : 0), 13 * hk, 9 * hk, expr === "happy" ? 200 : 20, expr === "happy" ? 340 : 160, 6);
    else { p.dot(ex, ey, (expr === "shock" ? 13 : 10) * hk); if (expr === "shock") p.dot(ex, ey, 5 * hk, "#ffffff"); else p.dot(ex - 3, ey - 3, 3 * hk, "#ffffff"); }
    if (expr === "proud") p.stroke([[ex - s * 14 * hk, ey - 24 * hk], [ex + s * 12 * hk, ey - 18 * hk]], 6);
  }
  if (o.cap) { // field cap with a brass eagle button
    p.poly([[hx - 88 * hk, hy - 76 * hk], [hx + 84 * hk, hy - 92 * hk], [hx + 96 * hk, hy - 136 * hk], [hx - 20 * hk, hy - 162 * hk], [hx - 96 * hk, hy - 124 * hk]], "#8d8048", 9);
    p.stroke([[hx - 88 * hk, hy - 84 * hk], [hx + 86 * hk, hy - 100 * hk]], 8, "#6f6438");
    p.dot(hx - 6 * hk, hy - 120 * hk, 9 * hk, INK); p.dot(hx - 6 * hk, hy - 120 * hk, 6.5 * hk, "#e2bb4c");
  }
  // ---- arms in front of the body ----
  if (pose === "salute") limb(p, curve3(sh(1), [bx + 236, shY - 20], [lerp(bx + 188, hx + 118 * hk, k), lerp(shY + 250, hy - 40 * hk, k)]), 86, 70, FUR_D);
  if (pose === "drink") {
    const hand: P2 = [lerp(bx + 188, hx + 74 * hk, k), lerp(shY + 250, my + 44 * hk, k)];
    limb(p, curve3(sh(1), [bx + 240, shY + 40], hand), 86, 70, FUR_D);
    const a = rad(lerp(0, -118, k)), R = (q: P2): P2 => [hand[0] + q[0] * Math.cos(a) - q[1] * Math.sin(a), hand[1] + q[0] * Math.sin(a) + q[1] * Math.cos(a)];
    p.poly([R([-24, 30]), R([24, 30]), R([24, -70]), R([10, -96]), R([10, -150]), R([-10, -150]), R([-10, -96]), R([-24, -70])], "#cfe3d8", 7);
    p.poly([R([-24, 20]), R([24, 20]), R([24, -40]), R([-24, -40])], "#f6f2e6", 4);
  }
  if (pose === "carry") {
    // an ammunition crate held against the chest, both arms wrapped under it
    const cy = shY + 150 + (walk ? 6 * Math.sin(2 * TWO * phase) : 0), w = 300, h = 150;
    p.poly([[bx - w / 2, cy - h / 2], [bx + w / 2, cy - h / 2], [bx + w / 2, cy + h / 2], [bx - w / 2, cy + h / 2]], "#b98a52", 10);
    for (const yy of [-25, 25]) p.stroke([[bx - w / 2 + 8, cy + yy], [bx + w / 2 - 8, cy + yy]], 4, "#5a3a1e");
    const g = p.g; g.font = "900 54px 'Arial Black', Impact, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#2c2118"; g.fillText(o.crate ?? "25 PDR", bx, cy + 2);
    for (const s of [-1, 1]) limb(p, curve3(sh(s), [bx + s * 250, shY + 110], [bx + s * 150, cy + h / 2 + 6]), 86, 74, FUR_D);
  }
};

/** the company badge: a bear carrying an artillery shell, on a 400 x 440 canvas */
export const fxBadge = (p: Pen) => {
  const pts: P2[] = [];
  for (let i = 0; i < 48; i++) { const a = (TWO * i) / 48; pts.push([200 + 180 * Math.cos(a), 220 + 200 * Math.sin(a)]); }
  p.poly(pts, "#f4efe0", 12); p.poly(pts.map(([x, y]) => [200 + (x - 200) * 0.9, 220 + (y - 220) * 0.9] as P2), null, 5);
  // bear in profile, walking right, a shell in its arms
  p.ell(180, 250, 62, 96, FUR, 8); p.ell(204, 138, 50, 44, FUR, 8); p.ell(176, 100, 16, 16, FUR, 7); p.ell(232, 104, 15, 15, FUR, 7);
  p.ell(244, 150, 24, 18, MUZZ, 6); p.dot(262, 144, 7); p.dot(214, 130, 6);
  for (const x of [150, 206]) { p.stroke([[x, 320], [x + 6, 388]], 40, INK); p.stroke([[x, 320], [x + 6, 388]], 26, FUR_D); }
  p.poly([[214, 300], [330, 214], [342, 196], [330, 190], [312, 198], [196, 276]], "#c9a23c", 8);
  p.stroke([[170, 216], [250, 250]], 34, INK); p.stroke([[170, 216], [250, 250]], 22, FUR_D);
};

// Emus for "The Great Emu War" short, drawn with the Pen API in a 900 x 1000 design space (ground at y = 975,
// the bird stands around x = 420 facing screen-right). Same ink / shading language as the human cast in toon.ts.
import { Pen, INK, shade } from "./toon";

type P2 = [number, number];
export const EMU_W = 900, EMU_H = 1000, EMU_GROUND = 975;
const BODY = "#8d7a66", BODY_SH = "#5f5046", NECK = "#8196ad", NECK_SH = "#5d6f85", HEAD = "#4b4652", BEAK = "#2d2a30", LEG = "#746c62", LEG_FAR = "#59534c";
const rot = (p: P2, a: number, c: P2): P2 => [c[0] + (p[0] - c[0]) * Math.cos(a) - (p[1] - c[1]) * Math.sin(a), c[1] + (p[0] - c[0]) * Math.sin(a) + (p[1] - c[1]) * Math.cos(a)];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp2 = (a: P2, b: P2, t: number): P2 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const sm = (x: number) => { const u = Math.max(0, Math.min(1, x)); return u * u * (3 - 2 * u); };
const quad = (a: P2, c: P2, b: P2, n = 16): P2[] => {
  const out: P2[] = [];
  for (let i = 0; i <= n; i++) { const t = i / n, s = 1 - t; out.push([s * s * a[0] + 2 * s * t * c[0] + t * t * b[0], s * s * a[1] + 2 * s * t * c[1] + t * t * b[1]]); }
  return out;
};
/** closed outline of a tapering tube along a polyline */
const tube = (pts: P2[], w0: number, w1: number): P2[] => {
  const L: P2[] = [], Rr: P2[] = [], n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let nx = -(b[1] - a[1]), ny = b[0] - a[0];
    const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const h = 0.5 * lerp(w0, w1, i / (n - 1));
    L.push([pts[i][0] + nx * h, pts[i][1] + ny * h]); Rr.push([pts[i][0] - nx * h, pts[i][1] - ny * h]);
  }
  return [...L, ...Rr.reverse()];
};

export type EmuMode = "stand" | "walk" | "run" | "peck";
export type EmuOpts = {
  mode?: EmuMode; phase?: number;
  /** 0 = head up .. 1 = beak at the ground (peck mode) */
  down?: number;
  /** small extra beak jab toward the ground, 0..1 */
  jab?: number;
  /** swallowed lump travelling down the neck, 0 (head) .. 1 (body); < 0 = none */
  gulp?: number;
  blink?: number; wide?: boolean;
  /** head turned to look at the viewer's side (-1 back over the shoulder, 0 ahead) */
  turn?: number;
  /** slouch hat perched on the head (the winner's trophy) */
  hat?: boolean;
  seed?: number;
};

/** stride (design units) and stance fraction per gait: the stance foot moves back exactly `stride` so it stays planted */
export const GAIT: Record<"walk" | "run", { stride: number; st: number; lift: number; bob: number }> = {
  walk: { stride: 230, st: 0.6, lift: 70, bob: 9 },
  run: { stride: 340, st: 0.38, lift: 150, bob: 24 },
};

const LID = "#6a6474";
const eyeAt = (p: Pen, e: P2, r: number, lid: number, wide: boolean, look: P2, lidMin = 0.42) => {
  p.ell(e[0], e[1], r, r, "#ffffff", 4.5);
  p.dot(e[0] + look[0], e[1] + look[1], wide ? r * 0.3 : r * 0.42, INK);
  const k = Math.max(wide ? 0 : lidMin, lid); // deadpan: the lid always covers the top of the eye
  if (k > 0.02) {
    const y = e[1] - r + 2 * r * k;
    p.clip([[e[0] - r - 6, e[1] - r - 8], [e[0] + r + 6, e[1] - r - 8], [e[0] + r + 6, y], [e[0] - r - 6, y]], () => p.ell(e[0], e[1], r, r, LID, 4.5));
    const half = Math.sqrt(Math.max(0, r * r - (y - e[1]) ** 2));
    p.stroke([[e[0] - half - 1, y], [e[0] + half + 1, y]], 4.5);
  }
};
const slouchHat = (p: Pen, c: P2, a: number, s = 1) => {
  const R = (x: number, y: number): P2 => rot([c[0] + x * s, c[1] + y * s], a, c);
  const col = "#9a8a5c";
  p.poly([R(-78, -18), R(78, -18), R(70, -6), R(-70, -6)], shade(col, 0.72), 6);
  p.poly([R(-44, -18), R(-40, -62), R(-8, -54), R(8, -54), R(40, -62), R(44, -18)], col, 6);
  p.poly([R(-44, -30), R(44, -30), R(44, -20), R(-44, -20)], "#5f5636", 0);
  p.poly([R(46, -16), R(80, -20), R(62, -52), R(46, -36)], col, 6);
  const b = R(57, -32); p.ell(b[0], b[1], 6 * s, 6 * s, "#e8c45a", 2.5);
};

/** side view, facing screen-right */
export const emuSide = (p: Pen, o: EmuOpts = {}) => {
  const { mode = "stand", phase = 0, down = 0, jab = 0, gulp = -1, blink = 0, wide = false, turn = 0, hat = false, seed = 1 } = o;
  const two = Math.PI * 2, g = mode === "walk" || mode === "run" ? GAIT[mode] : null;
  const bob = g ? g.bob * Math.cos(2 * two * phase) : 0;
  const kd = mode === "peck" ? sm(down) : 0;
  const lean = mode === "run" ? 0.2 : mode === "walk" ? 0.04 : 0.34 * kd;
  const crouch = 26 * kd;
  const H: P2 = [400, 585 + bob + crouch];
  const C = rot([H[0] + 8, H[1] - 78], lean, H);
  const ba = lean - 0.1;
  // ---- legs (behind the body) ----
  const leg = (ph: number, hip: P2, far: boolean) => {
    let fx = hip[0] + (far ? -6 : 14), fy = EMU_GROUND, toe = 0;
    if (g) {
      const f = ((ph % 1) + 1) % 1;
      if (f < g.st) fx = hip[0] + g.stride / 2 - g.stride * (f / g.st);
      else { const u = (f - g.st) / (1 - g.st); fx = hip[0] - g.stride / 2 + g.stride * sm(u); fy = EMU_GROUND - g.lift * Math.sin(Math.PI * u); toe = 0.9 * Math.sin(Math.PI * u); }
    }
    const l1 = 190, l2 = 225, dx = fx - hip[0], dy = fy - hip[1], d = Math.min(l1 + l2 - 2, Math.hypot(dx, dy));
    const a0 = Math.atan2(dy, dx), a1 = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
    // bird "knee" (the ankle) bends backward: toward the tail
    const k: P2 = [hip[0] + l1 * Math.cos(a0 + a1), hip[1] + l1 * Math.sin(a0 + a1)];
    const foot: P2 = [hip[0] + d * Math.cos(a0), hip[1] + d * Math.sin(a0)];
    const col = far ? LEG_FAR : LEG;
    p.poly(tube([hip, k], 58, 26), far ? shade(BODY_SH, 0.9) : BODY_SH, 7);
    p.poly(tube([k, foot], 22, 15), col, 7);
    p.ell(k[0], k[1], 13, 13, col, 6);
    for (const [len, ang] of [[66, 0.05], [52, -0.42], [30, 2.75]] as const) {
      const a = ang + toe;
      p.line([foot, [foot[0] + len * Math.cos(a), foot[1] + len * Math.sin(a) - (toe ? 0 : 3)]], col, 9, true);
    }
  };
  p.ol = 5;
  leg(phase + 0.5, [H[0] - 26, H[1] + 6], true);
  // ---- neck + head pose ----
  const nb = rot([C[0] + 150, C[1] - 52], ba, C);
  const pump = mode === "walk" ? 34 * Math.sin(2 * two * phase) : mode === "run" ? 10 * Math.sin(2 * two * phase) : 0;
  const up: P2 = mode === "run" ? [nb[0] + 175 + pump, nb[1] - 215] : [nb[0] + 62 + pump, nb[1] - 318];
  const gnd: P2 = [nb[0] + 205, EMU_GROUND - 58 + 26 * (1 - jab)];
  const hd: P2 = kd > 0 ? [lerp(up[0], gnd[0], kd) + 60 * Math.sin(Math.PI * kd), lerp(up[1], gnd[1], kd)] : up;
  const ha = kd > 0 ? 1.25 * kd : mode === "run" ? 0.12 : 0;
  const mid = lerp2(nb, hd, 0.5), dxn = hd[0] - nb[0], dyn = hd[1] - nb[1], ln = Math.hypot(dxn, dyn) || 1;
  const bulge = mode === "run" ? -34 : lerp(-46, 70, kd);
  const ctl: P2 = [mid[0] + (-dyn / ln) * bulge, mid[1] + (dxn / ln) * bulge];
  const nc = quad(nb, ctl, hd, 18);
  const drawNeck = () => {
    const tb = tube(nc, 58, 34);
    p.poly(tb, NECK, 0);
    p.clip(tb, () => { // shaded underside + sparse dark feather ticks
      p.stroke(nc.map(([x, y]) => [x - 16, y + 6] as P2), 14, NECK_SH);
      for (let i = 3; i < 16; i += 2) { const [x, y] = nc[i]; p.stroke([[x - 9, y - 5], [x + 2, y + 5]], 3.2, "#3c4352"); }
    });
    p.poly(tb, null, 8);
    if (gulp >= 0 && gulp <= 1) { const [x, y] = nc[Math.round((1 - gulp) * 16) + 1]; p.ell(x, y, 30, 26, NECK, 8); }
  };
  // ---- body ----
  const body: P2[] = [];
  for (let i = 0; i < 72; i++) {
    const th = (i / 72) * two; // canvas angle: 0 = toward the chest, PI/2 = down, PI = tail
    let r = 1;
    const low = Math.max(0, Math.sin(th)), back = Math.max(0, -Math.cos(th));
    r += 0.07 * low * Math.abs(Math.sin(th * 9 + seed)); // shaggy belly
    r += 0.3 * back * back * Math.max(0, Math.sin(th - 0.25)); // drooping tail
    r += 0.05 * back * Math.abs(Math.sin(th * 11 + seed * 2));
    const q: P2 = [C[0] + 192 * r * Math.cos(th), C[1] + 132 * r * Math.sin(th)];
    body.push(rot(q, ba, C));
  }
  drawNeck();
  p.shadedFill(body, BODY, BODY_SH, -2.2, 190, 0.4, 0.85, 1.3);
  p.clip(body, () => {
    for (let i = 0; i < 9; i++) { // feather strokes sweeping toward the tail
      const fx = C[0] + 110 - i * 34 + 14 * Math.sin(i * 2.3 + seed), fy = C[1] - 30 + 26 * Math.sin(i * 1.7 + seed);
      const a = rot([fx, fy], ba, C), b = rot([fx - 46, fy + 40], ba, C), c = rot([fx - 30, fy + 8], ba, C);
      p.stroke(quad(a, c, b, 6), 5, i % 2 ? "#6c5c4f" : "#a8957f");
    }
  });
  p.poly(body, null, 9);
  // feather ruff where the neck meets the body
  const ruff = rot([C[0] + 138, C[1] - 44], ba, C);
  p.ell(ruff[0], ruff[1], 46, 40, BODY, 0);
  p.arc(ruff[0], ruff[1], 46, 40, 200, 330, 7);
  leg(phase, [H[0] + 14, H[1] + 14], false);
  // ---- head ----
  const T = (x: number, y: number): P2 => rot([hd[0] + x, hd[1] + y], ha, hd);
  const beakOpen = jab > 0.6 ? 7 : 0;
  p.poly([T(30, -15), T(104, 2 - beakOpen), T(34, 6)], BEAK, 6);
  p.poly([T(32, 6), T(96, 8 + beakOpen), T(30, 21)], shade(BEAK, 1.5), 6);
  const hp: P2[] = [];
  for (let i = 0; i < 40; i++) { const th = (i / 40) * two; hp.push(T(46 * Math.cos(th), 38 * Math.sin(th))); }
  p.shadedFill(hp, HEAD, shade(HEAD, 0.72), -2.2, 46, 0.4);
  p.poly(hp, null, 8);
  for (const [x0, y0, x1, y1] of [[-22, -33, -40, -58], [-6, -37, -14, -66], [10, -36, 10, -60]]) p.stroke([T(x0, y0), T(x1, y1)], 6);
  eyeAt(p, T(12, -8), 16, blink, wide, [4 - 6 * Math.abs(turn), turn ? 2 : 1]);
  if (hat) slouchHat(p, T(-2, -30), ha - 0.12, 0.92);
};

export type EmuFrontOpts = { phase?: number; walk?: boolean; blink?: number; wide?: boolean; tilt?: number; hat?: boolean; seed?: number; look?: number };
/** front view (staring at the lens), centred on x = 450 */
export const emuFront = (p: Pen, o: EmuFrontOpts = {}) => {
  const { phase = 0, walk = false, blink = 0, wide = false, tilt = 0, hat = false, seed = 1, look = 0 } = o;
  const two = Math.PI * 2, bob = walk ? 12 * Math.cos(2 * two * phase) : 0, sway = walk ? 14 * Math.sin(two * phase) : 0;
  const cx = 450 + sway, cy = 610 + bob;
  p.ol = 5;
  for (const s of [-1, 1]) {
    const lift = walk ? Math.max(0, Math.sin(two * phase) * s) * 70 : 0;
    const hip: P2 = [cx + s * 48, cy + 110], foot: P2 = [450 + s * 56, EMU_GROUND - lift], knee: P2 = [lerp(hip[0], foot[0], 0.5) + s * 10, lerp(hip[1], foot[1], 0.45)];
    p.poly(tube([hip, knee], 50, 24), BODY_SH, 7);
    p.poly(tube([knee, foot], 22, 16), LEG, 7);
    for (const a of [-0.55, 0, 0.55]) p.line([foot, [foot[0] + 44 * Math.sin(a), foot[1] + (lift ? 26 : 9) * Math.cos(a)]], LEG, 9, true);
  }
  const body: P2[] = [];
  for (let i = 0; i < 72; i++) {
    const th = (i / 72) * two, low = Math.max(0, Math.sin(th));
    const r = 1 + 0.08 * low * Math.abs(Math.sin(th * 8 + seed)) + 0.06 * low;
    body.push([cx + 158 * r * Math.cos(th), cy + 172 * r * Math.sin(th)]);
  }
  const hd: P2 = [cx + 120 * Math.sin(tilt), 262 + bob * 1.4 + 20 * Math.abs(Math.sin(tilt))];
  const nb: P2 = [cx, cy - 120];
  const nc = quad(nb, [lerp(nb[0], hd[0], 0.3), lerp(nb[1], hd[1], 0.55)], hd, 14);
  const tb = tube(nc, 62, 40);
  p.poly(tb, NECK, 0);
  p.clip(tb, () => { p.stroke(nc.map(([x, y]) => [x - 22, y] as P2), 14, NECK_SH); for (let i = 2; i < 13; i += 2) { const [x, y] = nc[i]; p.stroke([[x - 6 + (i % 4) * 4, y - 6], [x + (i % 4) * 4, y + 6]], 3.2, "#3c4352"); } });
  p.poly(tb, null, 8);
  p.shadedFill(body, BODY, BODY_SH, -2.2, 170, 0.4, 0.85, 1.3);
  p.clip(body, () => { for (let i = 0; i < 8; i++) { const x = cx - 105 + i * 30, y = cy - 20 + 30 * Math.sin(i * 1.9 + seed); p.stroke(quad([x, y], [x + 4, y + 30], [x - 6, y + 56], 6), 5, i % 2 ? "#6c5c4f" : "#a8957f"); } });
  p.poly(body, null, 9);
  p.ell(cx, cy - 122, 50, 34, BODY, 0); p.arc(cx, cy - 122, 50, 34, 190, 350, 7);
  const T = (x: number, y: number): P2 => rot([hd[0] + x, hd[1] + y], tilt, hd);
  const hp: P2[] = [];
  for (let i = 0; i < 40; i++) { const th = (i / 40) * two; hp.push(T(58 * Math.cos(th), 46 * Math.sin(th))); }
  p.shadedFill(hp, HEAD, shade(HEAD, 0.72), -2.2, 58, 0.4);
  p.poly(hp, null, 8);
  for (const [x0, y0, x1, y1] of [[-18, -42, -30, -70], [0, -45, 0, -76], [18, -42, 30, -68]]) p.stroke([T(x0, y0), T(x1, y1)], 6);
  for (const s of [-1, 1]) eyeAt(p, T(s * 28, -8), 19, blink, wide, [3 * look, 2], 0.36);
  p.poly([T(-17, 8), T(17, 8), T(0, 50)], BEAK, 6);
  p.stroke([T(-5, 18), T(-3, 22)], 3, "#55505a"); p.stroke([T(5, 18), T(3, 22)], 3, "#55505a");
  if (hat) slouchHat(p, T(0, -36), tilt + 0.14, 1.05);
};

// Emus for the Great Emu War, drawn with the Pen API in the same flat ink-outlined style as the human cast.
// Design canvas 900 x 1000, soles at y = 975 (a 1.8 m bird), facing screen-right in the side view.
// Motion is built from real bird mechanics so nothing slides or snaps:
//  - legs are two-bone IK with the ankle joint bending BACKWARD, stance feet planted (they move back at exactly the
//    travelling speed: cast.ts derives `phase` from the distance travelled, EMU_WALK_M / EMU_RUN_M per cycle);
//  - walk: head holds still in space and then thrusts forward once per step (the ratite / pigeon head bob);
//  - run: body pitched forward, neck stretched, a flight phase between the steps;
//  - peck: the body tips from the hip, the neck arches over and the bill jabs at the grain, then lifts and swallows
//    (a bump travels down the throat).
import { Pen, INK, mul, shade, mix, rnd } from "./toon";

type P2 = [number, number];
type C3 = [number, number, number];
const rad = (d: number) => (d * Math.PI) / 180;
const TWO = Math.PI * 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const smooth = (x: number) => { const u = clamp(x); return u * u * (3 - 2 * u); };
const rot = (q: P2, a: number, c: P2): P2 => {
  const co = Math.cos(a), si = Math.sin(a), x = q[0] - c[0], y = q[1] - c[1];
  return [c[0] + x * co - y * si, c[1] + x * si + y * co];
};
const bez = (p0: P2, p1: P2, p2: P2, p3: P2, n = 18): P2[] => {
  const out: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, s = 1 - t, a = s * s * s, b = 3 * s * s * t, c = 3 * s * t * t, d = t * t * t;
    out.push([a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]]);
  }
  return out;
};
/** closed outline around a centre line with a width that varies along it */
const ribbon = (c: P2[], w: (t: number) => number): P2[] => {
  const L: P2[] = [], R: P2[] = [], n = c.length;
  for (let i = 0; i < n; i++) {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(n - 1, i + 1)];
    let nx = -(b[1] - a[1]), ny = b[0] - a[0];
    const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const h = w(i / (n - 1)) / 2;
    L.push([c[i][0] + nx * h, c[i][1] + ny * h]); R.push([c[i][0] - nx * h, c[i][1] - ny * h]);
  }
  return [...L, ...R.reverse()];
};

export const EMU_W = 900, EMU_H = 1000;
/** the side view is drawn this far left of its design coordinates; the bird's hip sits at x = EMU_HIP_X on the card */
export const EMU_SHIFT = 90, EMU_HIP_X = 400 - EMU_SHIFT;
/** metres travelled per full gait cycle (two steps); SU = 0.00216 m per design unit */
export const EMU_WALK_M = 2 * 300 * 0.00216, EMU_RUN_M = (2 * 230 / 0.32) * 0.00216;

const FEATHER = "#8a6a50", FEATHER_D = "#6d5240", SKIN_N = "#8fa9c2", SKIN_D = "#6f8aa6", BEAK = "#4b4440", LEG = "#75655a", LEG_FAR = "#5e5048";
const SH_F: C3 = [0.66, 0.64, 0.72];
const DEF_LIGHT = rad(-120);
const thickAngle = (light: number) => Math.atan2(-Math.sin(light) + 0.8, -Math.cos(light));

export type EmuExpr = "calm" | "deadpan" | "alarm" | "smug";
export type EmuOpts = {
  mode?: "stand" | "walk" | "run" | "peck";
  /** gait cycle 0..1 (near foot lands at 0, far foot at 0.5) */
  phase?: number;
  /** head-down amount 0 (upright) .. 1 (bill at the grain); jab = extra thrust -1..1 while down; gulp = 0..1 bump down the throat */
  peck?: number; jab?: number; gulp?: number;
  /** how low the bill goes at peck = 1: design-unit height above the soles (wheat heads ~330, ground ~30) */
  reach?: number;
  blink?: number; look?: number; expr?: EmuExpr; seed?: number; light?: number;
  /** small idle head turn / tilt in degrees */
  nod?: number;
  /** body colour variation */
  tint?: number;
  /** the pack leader: a big dark bird with a tall black crest; cap = an officer's cap (the "emu command") */
  leader?: boolean; cap?: boolean;
};

/** two-bone leg, ankle joint bending backward (-x) */
const ikBack = (hip: P2, foot: P2, l1: number, l2: number): P2 => {
  const dx = foot[0] - hip[0], dy = foot[1] - hip[1], d = clamp(Math.hypot(dx, dy), 1, l1 + l2 - 0.01);
  const A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), k = Math.atan2(dy, dx) + A;
  return [hip[0] + l1 * Math.cos(k), hip[1] + l1 * Math.sin(k)];
};

const featherCol = (seed: number, tint = 0) => {
  const v = rnd(seed, 31) - 0.5 + tint;
  return v > 0.22 ? "#9a7858" : v < -0.22 ? "#7a5e4a" : FEATHER;
};

/** the eye: orange iris, heavy lid for the deadpan stare */
const eye = (p: Pen, x: number, y: number, r: number, expr: EmuExpr, blink: number, look: number, skin: string) => {
  const open = expr === "alarm" ? 1.18 : 1;
  const R = r * open;
  p.ell(x, y, R, R, "#fff4dc", 3.2);
  if (blink < 0.95) {
    p.dot(x + look * R * 0.28, y + (expr === "alarm" ? 0 : R * 0.08), R * (expr === "alarm" ? 0.56 : 0.72), "#f08f2a");
    p.dot(x + look * R * 0.34, y + (expr === "alarm" ? 0 : R * 0.1), R * (expr === "alarm" ? 0.26 : 0.36), INK);
  }
  const lid = Math.max(blink, expr === "deadpan" ? 0.42 : expr === "smug" ? 0.5 : expr === "calm" ? 0.2 : 0);
  if (lid > 0.02) {
    // upper lid: skin-coloured cap from the top down to `lid` of the eye, with an ink edge
    const yl = y - R + 2 * R * Math.min(1, lid), pts: P2[] = [];
    for (let i = 0; i <= 20; i++) { const a = Math.PI + (Math.PI * i) / 20; pts.push([x + (R + 2) * Math.cos(a), y + (R + 2) * Math.sin(a)]); }
    const half = Math.sqrt(Math.max(0, R * R - (yl - y) ** 2));
    p.clip(ellC(x, y, R + 1.6, R + 1.6), () => { p.poly([[x - R - 4, y - R - 4], [x + R + 4, y - R - 4], [x + R + 4, yl], [x - R - 4, yl]], skin, 0); });
    p.stroke([[x - half, yl], [x + half, yl]], 3.4);
    p.arc(x, y, R, R, 180, 360, 3.2);
  }
  if (expr === "smug") p.arc(x, y + R * 0.2, R * 1.05, R * 0.8, 20, 160, 3);
};
const ellC = (cx: number, cy: number, rx: number, ry: number, n = 32): P2[] => {
  const pts: P2[] = [];
  for (let i = 0; i < n; i++) pts.push([cx + rx * Math.cos((TWO * i) / n), cy + ry * Math.sin((TWO * i) / n)]);
  return pts;
};

/** shaggy body outline: an egg with feather scallops along the belly and back end */
const bodyPts = (cx: number, cy: number, rx: number, ry: number, tilt: number, seed: number, n = 96): P2[] => {
  const pts: P2[] = [];
  for (let i = 0; i < n; i++) {
    const a = (TWO * i) / n, ca = Math.cos(a), sa = Math.sin(a);
    // fuller behind (-x), a little pointed at the chest
    const egg = 1 + 0.1 * -ca + 0.05 * Math.cos(2 * a);
    // scallops on the lower half and the back; smooth along the top of the back
    const low = clamp((sa + 0.25) / 0.8) + 0.6 * clamp((-ca - 0.3) / 0.5);
    const sc = 1 + 0.045 * Math.min(1, low) * Math.abs(Math.sin(a * 9 + seed * 1.7));
    pts.push(rot([cx + rx * egg * sc * ca, cy + ry * sc * sa], tilt, [cx, cy]));
  }
  return pts;
};

const foot = (p: Pen, x: number, y: number, pitch: number, colr: string, s = 1) => {
  const R = (q: P2): P2 => rot([x + q[0] * s, y + q[1] * s], pitch, [x, y]);
  // three toes: a long middle one, a shorter raised one, and the heel pad
  p.stroke([R([-4, -6]), R([14, 2]), R([62, 4])], 13 * s, INK);
  p.stroke([R([10, -2]), R([44, -12])], 11 * s, INK);
  p.stroke([R([-4, -6]), R([14, 2]), R([62, 4])], 7.5 * s, colr);
  p.stroke([R([10, -2]), R([44, -12])], 6 * s, colr);
  p.stroke([R([60, 4]), R([68, 5])], 4 * s, INK);
};

/** side view, facing screen-right */
export const emuSide = (p: Pen, o: EmuOpts = {}) => {
  const { mode = "stand", phase = 0, jab = 0, gulp = -1, reach = 330, blink = 0, look = 0, expr = "calm", seed = 1, light = DEF_LIGHT, nod = 0, tint = 0 } = o;
  const k = mode === "peck" ? clamp(o.peck ?? 1) : clamp(o.peck ?? 0);
  const sole = 975, HX = 400, hipRest = 628, l1 = 168, l2 = 186;
  p.g.save(); p.g.translate(-EMU_SHIFT, 0);
  const fcol = o.leader ? "#4d4046" : featherCol(seed, tint), thick = thickAngle(light);
  // ---- gait: foot targets relative to the hip (x forward), hip height ----
  type Leg = { x: number; h: number; pitch: number; near: boolean };
  const legs: Leg[] = [];
  let hipY = hipRest, pitch = 0, headBob = 0, neckLean = 0;
  if (mode === "walk") {
    const S = 300;
    const st = (ph: number) => {
      const c = (((phase + ph) % 1) + 1) % 1;
      if (c < 0.5) { const s = c / 0.5; return { x: S / 2 - S * s, h: 0, s, stance: true }; }
      const s = (c - 0.5) / 0.5;
      return { x: -S / 2 + S * s - (S / Math.PI) * 0.6 * Math.sin(TWO * s), h: 74 * Math.sin(Math.PI * s) ** 1.3, s, stance: false };
    };
    const a = st(0), b = st(0.5);
    for (const [L, near] of [[b, false], [a, true]] as const)
      legs.push({ x: L.x, h: L.h, pitch: L.stance ? 0 : rad(-34 * Math.sin(Math.PI * L.s) * (1 - 1.5 * L.s)), near });
    hipY = hipRest - 4 + 9 * Math.cos(2 * TWO * phase); // lowest at each footfall
    pitch = rad(1.5 * Math.cos(2 * TWO * phase));
    // head bob: holds back while the body travels, then thrusts forward (twice per cycle)
    const c2 = (((phase * 2) % 1) + 1) % 1;
    headBob = c2 < 0.62 ? lerp(22, -24, c2 / 0.62) : lerp(-24, 22, smooth((c2 - 0.62) / 0.38));
  } else if (mode === "run") {
    const SF = 0.32, S = 460;
    const st = (ph: number) => {
      const c = (((phase + ph) % 1) + 1) % 1;
      if (c < SF) { const s = c / SF; return { x: S / 2 - S * s, h: 0, s, stance: true }; }
      const s = (c - SF) / (1 - SF);
      return { x: -S / 2 + S * smooth(s) - 40 * Math.sin(Math.PI * s), h: 150 * Math.sin(Math.PI * Math.min(1, s * 1.15)) ** 1.1 * (s < 0.87 ? 1 : (1 - s) / 0.13), s, stance: false };
    };
    const a = st(0), b = st(0.5);
    for (const [L, near] of [[b, false], [a, true]] as const)
      legs.push({ x: L.x, h: L.h, pitch: L.stance ? rad(-10 * L.s) : rad(-55 * Math.sin(Math.PI * L.s) * (1 - 1.35 * L.s)), near });
    hipY = hipRest - 26 + 22 * Math.cos(2 * TWO * (phase - SF / 2)); // dips at mid-stance, floats in between
    pitch = rad(15 + 3 * Math.sin(2 * TWO * phase));
    neckLean = 34;
    headBob = 8 * Math.sin(2 * TWO * phase + 1);
  } else {
    legs.push({ x: -34, h: 0, pitch: 0, near: false }, { x: 30, h: 0, pitch: 0, near: true });
    if (mode === "peck" || k > 0) pitch = rad(25 * k);
    hipY = hipRest + 6 * k;
  }
  const hip: P2 = [HX, hipY];
  const B = (q: P2): P2 => rot([q[0], q[1] + (hipY - hipRest)], pitch, hip); // body-space point -> canvas
  // ---- far leg, tail, body, near leg ----
  const drawLeg = (L: Leg) => {
    const hj: P2 = [HX + (L.near ? 8 : -14), hipY + 14];
    const ft: P2 = [HX + L.x + (L.near ? 0 : -6), sole - 10 - L.h];
    const kn = ikBack(hj, ft, l1, l2);
    const lc = L.near ? LEG : LEG_FAR, fc = L.near ? fcol : shade(fcol, 0.8);
    // feathered drumstick
    const thigh = ribbon([hj, [lerp(hj[0], kn[0], 0.55) - 6, lerp(hj[1], kn[1], 0.55)], kn], (t) => lerp(62, 20, t));
    p.poly(thigh, fc, 8);
    p.stroke([kn, ft], 21, INK); p.stroke([kn, ft], 13, lc);
    p.dot(kn[0], kn[1], 12.5, INK); p.dot(kn[0], kn[1], 8, lc);
    foot(p, ft[0], ft[1] + 6, L.pitch, lc);
  };
  drawLeg(legs[0]); drawLeg(legs[1]);
  // drooping tail feathers
  const tail = [[232, 520], [196, 566], [168, 640], [186, 706], [222, 668], [240, 716], [282, 668]].map((q) => B(q as P2));
  p.poly(tail, shade(fcol, 0.84), 9);
  // ---- neck + head (computed first, drawn before the body so the neck grows out of the chest) ----
  const Nb = B([508, 506]);
  const L = 318;
  // direction of the head from the neck base, measured from straight up, clockwise (forward)
  const reachA = Math.min(146, 90 + (Math.asin(clamp((sole - reach - Nb[1] - 20) / L, -1, 1)) * 180) / Math.PI); // angle that puts the bill at `reach`
  const th = rad(lerp(9 + neckLean + nod * 0.3, reachA, smooth(k)) + (k > 0.5 ? 5 * jab : 0));
  const Len = L * (1 + (k > 0.5 ? 0.05 * jab : 0));
  const Hc: P2 = [Nb[0] + Len * Math.sin(th) + headBob * (1 - k), Nb[1] - Len * Math.cos(th)];
  const tb = th + rad(lerp(24, -58, k)), tt = th + rad(lerp(-20, 34, k)); // tangents at the base / at the head
  const ha = rad(lerp(4 - neckLean * 0.2 + nod, 66, smooth(k)) + (k > 0.5 ? 6 * jab : 0)); // bill direction
  const att: P2 = rot([Hc[0] - 26, Hc[1] + 20], ha, Hc);
  const c1: P2 = [Nb[0] + 0.42 * L * Math.sin(tb), Nb[1] - 0.42 * L * Math.cos(tb)];
  const c2: P2 = [att[0] - 0.36 * L * Math.sin(tt), att[1] + 0.36 * L * Math.cos(tt)];
  const nc = bez([Nb[0] - 14, Nb[1] + 26], c1, c2, att, 22);
  const nw = (t: number) => lerp(78, 34, Math.pow(t, 0.7)) + (gulp >= 0 ? 16 * Math.exp(-(((t - (1 - gulp)) / 0.09) ** 2)) : 0);
  const neck = ribbon(nc, nw);
  p.gradFill(neck, SKIN_N, SKIN_D, light, 0.3);
  // shaggy feathers run about halfway up the neck, ending in a ragged edge
  p.clip(neck, () => {
    const n = nc.length, cut = Math.round(n * 0.46);
    const low = ribbon(nc.slice(0, cut + 1), (t) => 120);
    p.poly(low, fcol, 0);
    for (let i = 0; i < 7; i++) {
      const q = nc[cut], d = nc[cut + 1], dx = d[0] - q[0], dy = d[1] - q[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, s = (i - 3) * 13;
      p.poly([[q[0] + nx * (s - 9), q[1] + ny * (s - 9)], [q[0] + nx * s + (dx / l) * 26, q[1] + ny * s + (dy / l) * 26], [q[0] + nx * (s + 9), q[1] + ny * (s + 9)]], fcol, 0);
    }
  });
  p.inkRing(neck, 9, thick, 0.35);
  const bp = bodyPts(...B([392, 566]), 178, 122, pitch - rad(7), seed);
  p.gradFill(bp, fcol, mul(fcol, SH_F), light, 0.3);
  p.clip(bp, () => {
    // feather flicks, darker toward the belly
    for (let i = 0; i < 26; i++) {
      const fx = 250 + 290 * rnd(seed + i, 3), fy = 480 + 170 * rnd(seed + i, 5), q = B([fx, fy]), len = 26 + 18 * rnd(seed + i, 7);
      p.stroke([[q[0], q[1]], [q[0] - len * 0.5, q[1] + len * 0.75], [q[0] - len * 0.62, q[1] + len]], 5, mix(fcol, INK, 0.3));
    }
    const w0 = B([330, 560]), w1 = B([250, 640]), w2 = B([420, 668]);
    p.stroke(bez(w0, [w0[0] - 70, w0[1] + 20], [w1[0] - 10, w1[1] - 20], w1, 10), 6, mix(fcol, INK, 0.42));
    p.stroke(bez(w1, [w1[0] + 50, w1[1] + 34], [w2[0] - 60, w2[1] + 16], w2, 10), 6, mix(fcol, INK, 0.42));
  });
  p.inkRing(bp, 10, thick, 0.4);
  // head: small bean, dark downy crown, long flat bill
  p.rot = [ha, Hc[0], Hc[1]];
  const hx = Hc[0], hy = Hc[1];
  const bill: P2[] = [[hx + 30, hy - 15], [hx + 66, hy - 9], [hx + 104, hy + 6], [hx + 100, hy + 14], [hx + 62, hy + 20], [hx + 28, hy + 20]];
  p.poly(bill, BEAK, 8);
  p.stroke([[hx + 44, hy + 7], [hx + 98, hy + 9]], 3.4);
  p.dot(hx + 70, hy - 1, 3.2);
  const hp = ellC(hx, hy, 50, 40, 40);
  p.gradFill(hp, SKIN_N, SKIN_D, light - ha, 0.35);
  p.clip(hp, () => { p.ell(hx - 16, hy - 30, 52, 30, "#4a4350", 0); });
  p.inkRing(hp, 8.5, thick - ha, 0.35);
  // wispy crown feathers (stand up when alarmed)
  const up = (expr === "alarm" ? 1.7 : 1) * (o.leader ? 2.4 : 1);
  if (!o.cap) for (let i = 0; i < 5; i++) {
    const a0 = rad(-150 + i * 22), bx = hx + 46 * Math.cos(a0), by = hy + 37 * Math.sin(a0);
    p.stroke([[bx, by], [bx + (-10 + i * 3) * up, by - 15 * up]], o.leader ? 8 : 5, o.leader ? "#17141a" : "#3a3440");
  }
  if (o.cap) { p.poly([[hx - 50, hy - 26], [hx + 34, hy - 30], [hx + 40, hy - 62], [hx - 46, hy - 66]], "#8f8250", 7); p.poly([[hx + 26, hy - 32], [hx + 72, hy - 22], [hx + 28, hy - 22]], "#3b2a1e", 6); p.dot(hx + 6, hy - 48, 7, INK); p.dot(hx + 6, hy - 48, 5, "#e2bb4c"); }
  eye(p, hx + 14, hy - 5, 15.5, expr, blink, look, SKIN_N);
  p.rot = null;
  p.g.restore();
};

/** front view (walking toward the lens) or back view (walking away); phase as in the side view */
export const emuFront = (p: Pen, o: EmuOpts & { back?: boolean } = {}) => {
  const { mode = "stand", phase = 0, blink = 0, look = 0, expr = "calm", seed = 1, light = DEF_LIGHT, back = false, nod = 0, tint = 0 } = o;
  const sole = 975, cx0 = 450, fcol = o.leader ? "#4d4046" : featherCol(seed, tint), thick = thickAngle(light);
  const moving = mode === "walk" || mode === "run", run = mode === "run";
  const lift = run ? 150 : 78, sway = moving ? (run ? 16 : 11) * Math.sin(TWO * phase) : 0;
  const bob = moving ? (run ? 24 : 10) * Math.cos(2 * TWO * phase) : 0;
  const cx = cx0 + sway, by = 598 + bob - (run ? 16 : 0);
  // legs: the lifted foot folds up and comes toward the middle
  const legs = [[-1, 0], [1, 0.5]].map(([s, ph]) => {
    const up = moving ? Math.max(0, Math.sin(TWO * (phase + ph))) : 0;
    return { s, up };
  });
  const drawLeg = (s: number, up: number) => {
    const hj: P2 = [cx + s * 46, by + 78], ft: P2 = [cx0 + s * (58 - 16 * up), sole - 8 - lift * up];
    const kn: P2 = [lerp(hj[0], ft[0], 0.45) + s * (10 + 26 * up), lerp(hj[1], ft[1], 0.46) + 10 * up];
    p.poly(ribbon([hj, [lerp(hj[0], kn[0], 0.5), lerp(hj[1], kn[1], 0.5)], kn], (t) => lerp(60, 20, t)), shade(fcol, back ? 0.86 : 0.92), 8);
    p.stroke([kn, ft], 21, INK); p.stroke([kn, ft], 13, LEG);
    p.dot(kn[0], kn[1], 12.5, INK); p.dot(kn[0], kn[1], 8, LEG);
    // three toes splayed toward the viewer (or the heel from behind)
    const ty = ft[1] + 8, sp = back ? 0.6 : 1;
    for (const [dx, dy, w] of [[-26 * sp, 6, 11], [26 * sp, 6, 11], [0, 12, 13]] as const) {
      p.stroke([[ft[0], ty - 8], [ft[0] + dx, ty + dy - 4 + 10 * up]], w, INK);
      p.stroke([[ft[0], ty - 8], [ft[0] + dx, ty + dy - 4 + 10 * up]], w - 5.5, LEG);
    }
  };
  // from behind: the tail droops over the legs
  for (const l of legs) drawLeg(l.s, l.up);
  // neck: a column with a gentle counter-sway, head on top
  const nb: P2 = [cx, by - 104], hc: P2 = [cx0 + sway * 0.35 + nod * 1.2, 196 + bob * 0.45 + (run ? 26 : 0)];
  const nc = bez(nb, [nb[0] - sway * 0.6, nb[1] - 110], [hc[0] + sway * 0.5, hc[1] + 130], [hc[0], hc[1] + 26], 16);
  const neck = ribbon(nc, (t) => lerp(86, 40, Math.pow(t, 0.7)));
  p.gradFill(neck, back ? SKIN_D : SKIN_N, SKIN_D, light, 0.3);
  p.clip(neck, () => {
    const cut = Math.round(nc.length * 0.44), q = nc[cut];
    p.poly(ribbon(nc.slice(0, cut + 1), () => 130), fcol, 0);
    for (let i = -3; i <= 3; i++) p.poly([[q[0] + i * 14 - 9, q[1] + 2], [q[0] + i * 14, q[1] - 26], [q[0] + i * 14 + 9, q[1] + 2]], fcol, 0);
  });
  p.inkRing(neck, 9, thick, 0.35);
  // body: fluffy upright egg
  const bp: P2[] = [];
  for (let i = 0; i < 90; i++) {
    const a = (TWO * i) / 90, ca = Math.cos(a), sa = Math.sin(a);
    const sc = 1 + 0.05 * clamp((sa + 0.3) / 0.9) * Math.abs(Math.sin(a * 8 + seed));
    bp.push([cx + 128 * (1 + 0.08 * sa) * sc * ca, by + 138 * sc * sa]);
  }
  p.gradFill(bp, fcol, mul(fcol, SH_F), light, 0.3);
  p.clip(bp, () => {
    for (let i = 0; i < 22; i++) {
      const fx = cx - 100 + 200 * rnd(seed + i, 3), fy = by - 90 + 200 * rnd(seed + i, 5), len = 24 + 16 * rnd(seed + i, 7);
      p.stroke([[fx, fy], [fx + (fx - cx) * 0.06, fy + len]], 5, mix(fcol, INK, 0.3));
    }
    if (back) p.ell(cx, by + 120, 76, 70, shade(fcol, 0.8), 0);
  });
  p.inkRing(bp, 10, thick, 0.4);
  if (back) {
    const tl: P2[] = [[cx - 62, by + 84], [cx - 44, by + 176], [cx - 14, by + 150], [cx, by + 196], [cx + 14, by + 150], [cx + 44, by + 176], [cx + 62, by + 84]];
    p.poly(tl, shade(fcol, 0.82), 9);
  }
  const hp = ellC(hc[0], hc[1], 52, 44, 40);
  p.gradFill(hp, back ? "#5b5562" : SKIN_N, back ? "#4a4350" : SKIN_D, light, 0.35);
  p.clip(hp, () => { p.ell(hc[0], hc[1] - 36, 60, 30, "#4a4350", 0); });
  p.inkRing(hp, 8.5, thick, 0.35);
  const up = (expr === "alarm" ? 1.7 : 1) * (o.leader ? 2.4 : 1);
  if (!o.cap) for (let i = -2; i <= 2; i++) p.stroke([[hc[0] + i * 15, hc[1] - 41 + Math.abs(i) * 3], [hc[0] + i * 19, hc[1] - 41 - (15 - Math.abs(i) * 3) * up]], o.leader ? 8 : 5, o.leader ? "#17141a" : "#3a3440");
  if (o.cap) { p.poly([[hc[0] - 56, hc[1] - 26], [hc[0] + 56, hc[1] - 26], [hc[0] + 62, hc[1] - 64], [hc[0] - 62, hc[1] - 64]], "#8f8250", 7); p.ell(hc[0], hc[1] - 25, 46, 9, "#3b2a1e", 6, 0, 180); p.dot(hc[0], hc[1] - 46, 7, INK); p.dot(hc[0], hc[1] - 46, 5, "#e2bb4c"); }
  if (!back) {
    for (const s of [-1, 1]) eye(p, hc[0] + s * 27, hc[1] - 5, 14, expr, blink, look, SKIN_N);
    // bill pointing at the viewer: a short kite with two nostrils
    p.poly([[hc[0] - 17, hc[1] + 6], [hc[0], hc[1] - 2], [hc[0] + 17, hc[1] + 6], [hc[0] + 6, hc[1] + 44], [hc[0] - 6, hc[1] + 44]], BEAK, 7);
    p.dot(hc[0] - 6, hc[1] + 14, 2.6); p.dot(hc[0] + 6, hc[1] + 14, 2.6);
  }
};

// ---------------- effect cards ----------------
/** a loose feather */
export const fxFeather = (p: Pen) => {
  p.poly([[20, 100], [60, 40], [130, 14], [182, 30], [150, 74], [86, 104]], "#9a7858", 7);
  p.stroke([[24, 98], [176, 32]], 4);
};
/** round dust puff kicked up by a bullet or a foot; t = 0..1 */
export const fxDust = (p: Pen, t: number, colr = "#e2c08f") => {
  const s = 0.45 + 0.75 * t, g = p.g;
  g.save(); g.globalAlpha = 1;
  for (const [x, y, r] of [[150, 190, 70], [95, 205, 52], [205, 208, 55], [150, 140, 50]] as const)
    p.ell(150 + (x - 150) * s, 230 + (y - 230) * s, r * s, r * s * 0.85, colr, 0);
  g.restore();
};
/** muzzle flash: a spiky star with a hot core */
export const fxMuzzle = (p: Pen, k: number) => {
  const pts: P2[] = [], n = 9;
  for (let i = 0; i < n * 2; i++) {
    const a = (TWO * i) / (n * 2) + k * 1.3, r = i % 2 ? 46 : 120 + 30 * Math.sin(i * 2.4 + k * 5);
    pts.push([150 + r * Math.cos(a) * 1.15, 150 + r * Math.sin(a) * 0.8]);
  }
  p.poly(pts, "#ffd23c", 8);
  p.ell(150, 150, 46, 34, "#fff7d6", 0);
};
/** "!" alarm mark */
export const fxBang = (p: Pen) => {
  p.poly([[70, 20], [130, 20], [116, 170], [84, 170]], "#ff5a3c", 9);
  p.ell(100, 220, 24, 24, "#ff5a3c", 9);
};
/** smoke wisp from a jammed gun; t = 0..1 */
export const fxSmoke = (p: Pen, t: number) => {
  const up = 60 * t;
  for (const [x, y, r, c] of [[130, 210, 46, "#9a98a3"], [165, 165, 54, "#b1afba"], [118, 120, 44, "#c3c1cb"], [160, 80, 34, "#d2d0d9"]] as const)
    p.ell(x + 10 * Math.sin(t * 6 + y), y - up * (1 - y / 260), r * (0.7 + 0.5 * t), r * (0.62 + 0.45 * t), c, 0);
};
/** a brass cartridge case */
export const fxCase = (p: Pen) => { p.poly([[30, 40], [150, 40], [170, 60], [150, 80], [30, 80]], "#d9a93a", 7); p.stroke([[52, 42], [52, 78]], 5); };

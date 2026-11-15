// The stick figure in 2D (SVG), laid out in screen space: plain white head with a black outline, a face of a few
// black strokes and dots, thin black limbs, mitten hands, and a garment that reads as clothing.
//
// Rig (2026-11-15): a parent-child chain, solved once in `solve()`:
//   hip -> torso -> neck -> head        (lean at the hip, an own angle at the neck, squash and stretch that keeps volume)
//   shoulder -> elbow -> wrist -> hand  (two-bone IK to a hand target; rubber-hose limbs that may stretch a little)
//   hip -> knee -> ankle -> foot
// Limbs are quadratic Bezier curves through the joint, never straight segments. Draw order, back to front:
//   back arm (+ what it holds) | legs, torso | head, face, monocle, moustache, pipe, hat | front arm (+ what it holds)
// The pipe hangs from the corner of the mouth. Given a frame `f` the figure is never still: it breathes, blinks every
// 2.5-4 s, and its pupils and brows follow `lookAt`. The same points give the boxes the layout check uses.
import React from "react";

export const INK = "#16131a";
export type Face = { eye: number; lookX: number; lookY: number; browY: [number, number]; browTilt: [number, number]; open: number; smile: number; width: number };
export const FACES = {
  neutral: { eye: 1, lookX: 0, lookY: 0, browY: [0, 0], browTilt: [0, 0], open: 0, smile: 0.3, width: 1 },
  shock: { eye: 1.3, lookX: 0, lookY: 0, browY: [1, 1], browTilt: [-0.28, -0.28], open: 1, smile: 0, width: 0.85 },
  sly: { eye: 0.3, lookX: 0.75, lookY: 0, browY: [-0.35, 0.6], browTilt: [0.3, -0.12], open: 0, smile: -0.4, width: 0.75 },
  glee: { eye: 1, lookX: 0, lookY: 0.1, browY: [1, 1], browTilt: [-0.2, -0.2], open: 0, smile: 1.7, width: 1.5 },
  worried: { eye: 1.12, lookX: 0, lookY: 0, browY: [0.6, 0.6], browTilt: [-0.5, -0.5], open: 0, smile: -0.9, width: 0.9 },
  stern: { eye: 1, lookX: 0, lookY: 0, browY: [-0.4, -0.4], browTilt: [0.32, 0.32], open: 0, smile: -0.3, width: 0.9 },
} satisfies Record<string, Face>;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const c01 = (t: number) => Math.min(1, Math.max(0, t));
export const mixFace = (a: Face, b: Face, t: number): Face => ({
  eye: lerp(a.eye, b.eye, t), lookX: lerp(a.lookX, b.lookX, t), lookY: lerp(a.lookY, b.lookY, t),
  browY: [lerp(a.browY[0], b.browY[0], t), lerp(a.browY[1], b.browY[1], t)], browTilt: [lerp(a.browTilt[0], b.browTilt[0], t), lerp(a.browTilt[1], b.browTilt[1], t)],
  open: lerp(a.open, b.open, t), smile: lerp(a.smile, b.smile, t), width: lerp(a.width, b.width, t),
});

// ---------------------------------------------------------------- easing: cubic-bezier curves, as in CSS
/** cubic-bezier(x1, y1, x2, y2) as a function of 0..1 (y may leave 0..1: anticipation and overshoot) */
export const bez = (x1: number, y1: number, x2: number, y2: number) => (x: number) => {
  x = c01(x);
  let lo = 0, hi = 1, t = x;
  for (let i = 0; i < 20; i++) { const xt = 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t; if (xt < x) lo = t; else hi = t; t = (lo + hi) / 2; }
  return 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t;
};
export const EASE = {
  inOut: bez(0.65, 0, 0.35, 1),       // most moves
  soft: bez(0.45, 0, 0.55, 1),        // drifts and camera
  out: bez(0.22, 1, 0.36, 1),         // arrives fast, settles
  in: bez(0.55, 0, 1, 0.45),          // falls, slides away
  back: bez(0.34, 1.56, 0.64, 1),     // overshoot and settle
  anticipate: bez(0.36, 0, 0.66, -0.56), // pulls back before it goes
};
/** eased progress of a move that starts at frame t0 and lasts dur frames */
export const tw = (t: number, t0: number, dur: number, e: (x: number) => number = EASE.inOut) => e((t - t0) / dur);

// ---------------------------------------------------------------- life
const seedOf = (c: Costume) => { let h = 7; for (const ch of c.coat + (c.hatColor ?? "") + c.shape) h = (h * 31 + ch.charCodeAt(0)) % 9973; return h; };
/** eye openness 0..1 at frame f: a blink every 2.5-4 s (75-120 frames), irregular, different for every seed */
export const blinkAt = (f: number, seed: number) => {
  const iv = [78 + (seed % 23), 96 + ((seed * 7) % 25), 84 + ((seed * 13) % 31)], total = iv[0] + iv[1] + iv[2];
  let p = (((f + seed * 17) % total) + total) % total;
  for (const d of iv) { if (p < d) return p < 5 ? [0.6, 0.12, 0.04, 0.12, 0.6][Math.floor(p)] : 1; p -= d; }
  return 1;
};

export type Hat = "flat" | "guard" | "bowler" | "top" | "beret" | "lady" | "kepi" | "tweed" | "boater";
export type Costume = {
  shape: "jacket" | "coat" | "smock" | "dress";
  coat: string; shade: string;
  collar?: string; buttons?: string; belt?: string; pocket?: boolean; stripes?: string; vest?: string; bow?: string; tweed?: boolean;
  hat?: Hat; hatColor?: string; band?: string;
  tash?: "brush" | "curl" | "walrus" | "handle"; forelock?: boolean; monocle?: boolean; pipe?: boolean;
  shoe?: string; armLen?: number;
};
/** all lengths in metres unless they end in px; x to the right, y up, origin on the ground between the feet */
export type Pose = {
  x: number; y: number; k: number;       // ground point on screen (px) and pixels per metre
  turn?: number;                          // -1..1: where the face and the hat's peak point (0 = at us)
  lean?: number; bob?: number; stretch?: number; // degrees at the hip (+ = to screen right), metres, factor (volume is kept)
  neck?: number;                           // extra degrees at the neck: the head leads or drags behind the torso
  handL?: [number, number]; handR?: [number, number]; // hand targets (L = the arm on screen left)
  footL?: [number, number]; footR?: [number, number]; // foot positions [x, lift]
  walkDir?: number;                        // -1 / 1: knees bend this way (side-on walk)
  front?: "L" | "R";                       // the arm drawn in front of the head; default: the near arm for the turn
  headTilt?: number; face?: Face; hatLift?: number;
  lookAt?: [number, number];               // a point on screen (px): pupils and brows follow it
  pipeSide?: -1 | 1;                       // which corner of the mouth holds the pipe; default: the side he faces
  shock?: number; sweat?: number;          // effect lines: frames since they started (undefined = none)
  still?: boolean;                         // no breathing and no blinking (a figure in a picture)
};
/** where a hand holds something: wrist on screen (px), forearm direction (degrees), scale, and the ground under the figure */
export type Grip = { x: number; y: number; ang: number; k: number; gy: number };
export type Hold = { L?: (g: Grip) => React.ReactNode; R?: (g: Grip) => React.ReactNode };

const HEAD_R = 0.3, HIP = 0.72, SHO: [number, number] = [0.2, 0.33], NECK_V = 0.47, NECK_L = 0.23, UA = 0.24, FA = 0.23, TH = 0.31, SH = 0.31;
type P2 = [number, number];
/** two-bone IK; the limb may stretch up to `slack` (rubber hose) before the target is out of reach */
const ik = (a: P2, b: P2, l1: number, l2: number, pick: (j: P2, alt: P2) => boolean, slack = 1.22): { j: P2; end: P2 } => {
  let dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1e-6;
  if (d > (l1 + l2) * 0.999) { const s = Math.min(slack, d / ((l1 + l2) * 0.999)); l1 *= s; l2 *= s; }
  const max = (l1 + l2) * 0.999;
  if (d > max) { dx *= max / d; dy *= max / d; d = max; }
  const end: P2 = [a[0] + dx, a[1] + dy], m = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - m * m));
  const ux = dx / d, uy = dy / d, j1: P2 = [a[0] + ux * m - uy * h, a[1] + uy * m + ux * h], j2: P2 = [a[0] + ux * m + uy * h, a[1] + uy * m - ux * h];
  return { j: pick(j1, j2) ? j1 : j2, end };
};
const HEM: Record<Costume["shape"], [number, number]> = { jacket: [-0.2, 0.235], coat: [-0.32, 0.25], smock: [-0.42, 0.275], dress: [-0.55, 0.36] };
const HAT_TOP: Record<Hat, number> = { flat: 0.42, guard: 0.5, bowler: 0.47, top: 0.72, beret: 0.42, lady: 0.4, kepi: 0.52, tweed: 0.42, boater: 0.44 };
const HAT_HALF: Record<Hat, number> = { flat: 0.37, guard: 0.37, bowler: 0.38, top: 0.34, beret: 0.37, lady: 0.36, kepi: 0.33, tweed: 0.39, boater: 0.39 };

/** the figure's joints on screen (px). With a frame `f` the pose breathes. */
export const solve = (p: Pose, c: Costume, f?: number) => {
  const k = p.k, th = ((p.lean ?? 0) * Math.PI) / 180, turn = p.turn ?? 0, al = c.armLen ?? 1, seed = seedOf(c);
  const br = f !== undefined && !p.still ? Math.sin(f * 0.105 + seed) : 0;                 // one breath in about two seconds
  const st = (p.stretch ?? 1) * (1 + 0.016 * br), wide = 1 / Math.sqrt(st), hip = HIP + (p.bob ?? 0) + 0.006 * br;
  const S = (m: P2): P2 => [p.x + m[0] * k, p.y - m[1] * k];
  /** torso space (origin at the hips) -> metres */
  const T = (u: number, v: number): P2 => [u * wide * Math.cos(th) + v * st * Math.sin(th), hip - u * wide * Math.sin(th) + v * st * Math.cos(th)];
  const headDeg = (p.lean ?? 0) + (p.neck ?? 0) + (p.headTilt ?? 0), nk = (((p.lean ?? 0) + (p.neck ?? 0) + 0.4 * (p.headTilt ?? 0)) * Math.PI) / 180;
  const neck = T(0, NECK_V), head: P2 = [neck[0] + Math.sin(nk) * NECK_L, neck[1] + Math.cos(nk) * NECK_L];
  const sx = SHO[0] * (1 - 0.22 * Math.abs(turn)), sho = [T(-sx + 0.03 * turn, SHO[1]), T(sx + 0.03 * turn, SHO[1])];
  const hands = [p.handL ?? [-0.3, 0.6], p.handR ?? [0.3, 0.6]] as P2[];
  const arms = [0, 1].map((i) => {
    const s = i ? 1 : -1;
    const r = ik(sho[i], hands[i], UA * al, FA * al, (a, b) => (a[0] - b[0]) * s > 0.02 ? true : (b[0] - a[0]) * s > 0.02 ? false : a[1] < b[1]);
    return { sho: sho[i], elb: r.j, hand: r.end };
  });
  const feet = [p.footL ?? [-0.09, 0], p.footR ?? [0.09, 0]] as P2[];
  const legs = [0, 1].map((i) => {
    const s = i ? 1 : -1, hj = T(s * 0.08, -0.03), ank: P2 = [feet[i][0], feet[i][1] + 0.07];
    const dir = p.walkDir ?? s * 0.5;
    const r = ik(hj, ank, TH, SH, (a, b) => (a[0] - b[0]) * dir > 0, 1.06);
    return { hip: hj, knee: r.j, ank: r.end, foot: feet[i] };
  });
  const back = p.front ? (p.front === "L" ? 1 : 0) : turn >= 0 ? 1 : 0;
  const hatTop = c.hat ? HAT_TOP[c.hat] : HEAD_R, hatHalf = c.hat ? HAT_HALF[c.hat] : HEAD_R;
  const xs = [head[0] - hatHalf, head[0] + hatHalf, ...arms.flatMap((a) => [a.hand[0] - 0.06, a.hand[0] + 0.06, a.elb[0]]), ...legs.flatMap((l) => [l.foot[0] - 0.12, l.foot[0] + 0.12]), -HEM[c.shape][1], HEM[c.shape][1]];
  const ys = [head[1] + hatTop, ...arms.map((a) => a.hand[1] + 0.06), 0];
  const hs = S(head);
  return {
    k, turn, th, st, wide, S, T, head: hs, headDeg, headR: HEAD_R * k, arms, legs, back, seed, hipS: S(T(0, 0)),
    /** boxes on screen: the face (head circle), and everything including hat, hands and feet */
    faceBox: { x: hs[0] - HEAD_R * k, y: hs[1] - HEAD_R * k, w: 2 * HEAD_R * k, h: 2 * HEAD_R * k },
    box: { x: p.x + Math.min(...xs) * k, y: p.y - Math.max(...ys) * k, w: (Math.max(...xs) - Math.min(...xs)) * k, h: Math.max(...ys) * k },
  };
};
/** where the two hands are, for scenes that put something exactly in a grip */
export const grips = (p: Pose, c: Costume, f?: number): { L: Grip; R: Grip } => {
  const g = solve(p, c, f), one = (i: number): Grip => { const a = g.arms[i], w = g.S(a.hand), e = g.S(a.elb); return { x: w[0], y: w[1], ang: (Math.atan2(w[1] - e[1], w[0] - e[0]) * 180) / Math.PI, k: g.k, gy: p.y }; };
  return { L: one(0), R: one(1) };
};

const HatShape: React.FC<{ c: Costume; turn: number }> = ({ c, turn }) => {
  const col = c.hatColor ?? INK, band = c.band ?? INK, o = { stroke: INK, strokeWidth: 0.02, strokeLinejoin: "round" as const }, pk = turn * 0.12;
  switch (c.hat) {
    case "flat": case "tweed": return (<g>
      <path d={`M${-0.3 + pk} -0.2 Q${0.02 + pk * 2} -0.3 ${0.36 * Math.sign(turn || 1) + pk} -0.19 L${0.3 * Math.sign(turn || 1) + pk} -0.15 Z`} fill={col} {...o} />
      <path d="M-0.37 -0.17 Q-0.38 -0.4 0 -0.42 Q0.38 -0.4 0.37 -0.17 Q0 -0.25 -0.37 -0.17 Z" fill={col} {...o} />
      {c.hat === "tweed" && <><path d="M-0.2 -0.36 L-0.12 -0.2 M0 -0.41 L0 -0.23 M0.2 -0.36 L0.12 -0.2" stroke="rgba(60,36,14,0.45)" strokeWidth={0.014} fill="none" /><circle cx={0} cy={-0.42} r={0.03} fill={col} {...o} /></>}
    </g>);
    case "guard": return (<g>
      <path d={`M${-0.3 + pk} -0.16 Q${pk * 2.4} -0.06 ${0.3 + pk} -0.16 L${0.26 + pk} -0.21 L${-0.26 + pk} -0.21 Z`} fill={INK} {...o} />
      <rect x={-0.29} y={-0.3} width={0.58} height={0.1} fill={band} {...o} />
      <path d="M-0.29 -0.3 L-0.37 -0.44 Q0 -0.56 0.37 -0.44 L0.29 -0.3 Z" fill={col} {...o} />
      <path d="M-0.29 -0.3 L0.29 -0.3" stroke="#f0bd3c" strokeWidth={0.022} />
      <circle cx={pk * 1.6} cy={-0.37} r={0.055} fill="#f0bd3c" {...o} />
    </g>);
    case "kepi": return (<g>
      <path d={`M${-0.28 + pk} -0.16 Q${pk * 2.4} -0.07 ${0.28 + pk} -0.16 L${0.25 + pk} -0.21 L${-0.25 + pk} -0.21 Z`} fill={INK} {...o} />
      <path d="M-0.29 -0.2 L-0.26 -0.5 L0.26 -0.5 L0.29 -0.2 Z" fill={col} {...o} />
      <rect x={-0.29} y={-0.28} width={0.58} height={0.075} fill={band} {...o} />
      <circle cx={pk * 1.6} cy={-0.39} r={0.045} fill="#f0bd3c" {...o} />
    </g>);
    case "bowler": return (<g>
      <path d="M-0.27 -0.2 Q-0.28 -0.48 0 -0.47 Q0.28 -0.48 0.27 -0.2 Z" fill={col} {...o} />
      <rect x={-0.275} y={-0.26} width={0.55} height={0.06} fill={band} />
      <path d="M-0.38 -0.19 Q0 -0.13 0.38 -0.19 L0.38 -0.215 Q0 -0.17 -0.38 -0.215 Z" fill={col} {...o} />
    </g>);
    case "top": return (<g>
      <path d="M-0.22 -0.22 L-0.24 -0.71 L0.24 -0.71 L0.22 -0.22 Z" fill={col} {...o} />
      <rect x={-0.225} y={-0.31} width={0.45} height={0.08} fill={band} />
      <path d="M-0.34 -0.2 Q0 -0.14 0.34 -0.2 L0.34 -0.23 Q0 -0.18 -0.34 -0.23 Z" fill={col} {...o} />
    </g>);
    case "beret": return (<g>
      <path d="M-0.3 -0.2 Q-0.44 -0.34 -0.2 -0.4 Q0.1 -0.46 0.34 -0.36 Q0.42 -0.26 0.3 -0.2 Q0 -0.27 -0.3 -0.2 Z" fill={col} {...o} />
      <path d="M0.02 -0.42 L0.04 -0.47" stroke={INK} strokeWidth={0.025} strokeLinecap="round" />
    </g>);
    case "lady": return (<g>
      <path d="M-0.24 -0.2 Q-0.25 -0.4 0 -0.4 Q0.25 -0.4 0.24 -0.2 Z" fill={col} {...o} />
      <path d="M-0.36 -0.17 Q0 -0.1 0.36 -0.17 L0.36 -0.21 Q0 -0.27 -0.36 -0.21 Z" fill={col} {...o} />
      <rect x={-0.245} y={-0.27} width={0.49} height={0.055} fill={band} />
      <circle cx={0.17} cy={-0.28} r={0.06} fill={band} {...o} />
    </g>);
    case "boater": return (<g>
      <rect x={-0.25} y={-0.43} width={0.5} height={0.2} fill={col} {...o} />
      <rect x={-0.25} y={-0.31} width={0.5} height={0.07} fill={band} />
      <path d="M-0.39 -0.2 L0.39 -0.2 L0.39 -0.235 L-0.39 -0.235 Z" fill={col} {...o} />
    </g>);
    default: return null;
  }
};

/** the mouth in head space: centre x, y, half width, curve */
const mouthOf = (f: Face, c: Costume, turn: number) => { const sq = 1 - 0.22 * Math.abs(turn); return { sq, ox: turn * 0.13, y: c.tash ? 0.17 : 0.12, w: 0.1 * f.width * sq, sm: f.smile * 0.06 }; };
const FaceShape: React.FC<{ f: Face; c: Costume; turn: number; id: string }> = ({ f, c, turn, id }) => {
  const { sq, ox, y: my, w, sm } = mouthOf(f, c, turn);
  const eyes = [-1, 1].map((s, i) => {
    const far = s * turn < 0 ? 1 - 0.3 * Math.abs(turn) : 1, ex = ox + s * 0.105 * sq + f.lookX * 0.034, ey = -0.03 - f.lookY * 0.03;
    // the brows follow the look: both rise when he looks up, the one on the side he looks to rises a little more
    const slit = f.eye < 0.6, by = ey - 0.115 - Math.min(0.05, f.browY[i] * 0.04) - 0.012 * Math.max(0, s * f.lookX) + (slit ? 0.02 : 0), bt = s * f.browTilt[i] * 40 - f.lookX * 5;
    return (<g key={i}>
      {slit ? <path d={`M${ex - 0.045 * far} ${ey} Q${ex} ${ey + 0.018 * (0.6 - f.eye)} ${ex + 0.045 * far} ${ey}`} stroke={INK} strokeWidth={0.02} strokeLinecap="round" fill="none" />
        : <ellipse cx={ex} cy={ey} rx={0.03 * far} ry={0.042 * Math.min(1.3, f.eye)} fill={INK} />}
      <path d={`M-0.048 0.004 Q0 -0.012 0.048 0.004`} transform={`translate(${ox + s * 0.105 * sq + f.lookX * 0.012} ${by}) rotate(${bt}) scale(${far} 1)`} stroke={INK} strokeWidth={0.022} strokeLinecap="round" fill="none" />
    </g>);
  });
  return (<g clipPath={`url(#${id})`}>
    {c.forelock && <path d={`M-0.3 -0.12 Q-0.2 -0.34 0.1 -0.3 Q0.3 -0.26 0.3 -0.14 Q0.12 -0.24 ${-0.04 + ox} -0.17 Q-0.16 -0.14 -0.3 -0.04 Z`} fill={INK} />}
    {eyes}
    {f.open > 0.05 ? <ellipse cx={ox} cy={my + 0.03 * f.open} rx={0.05 * f.width * sq} ry={0.014 + 0.06 * f.open} fill={INK} />
      : <path d={`M${ox - w} ${my - sm * 0.6} Q${ox} ${my + sm} ${ox + w} ${my - sm * 0.6}`} stroke={INK} strokeWidth={0.02} strokeLinecap="round" fill="none" />}
    {c.tash === "brush" && <path d={`M${ox - 0.085} 0.085 Q${ox} 0.045 ${ox + 0.085} 0.085 Q${ox} 0.12 ${ox - 0.085} 0.085 Z`} fill={INK} />}
    {c.tash === "walrus" && <path d={`M${ox} 0.06 Q${ox - 0.1} 0.05 ${ox - 0.13} 0.15 Q${ox - 0.06} 0.1 ${ox} 0.11 Q${ox + 0.06} 0.1 ${ox + 0.13} 0.15 Q${ox + 0.1} 0.05 ${ox} 0.06 Z`} fill={INK} />}
    {c.tash === "curl" && <path d={`M${ox} 0.075 Q${ox - 0.08} 0.115 ${ox - 0.17} 0.05 Q${ox - 0.08} 0.085 ${ox} 0.06 Q${ox + 0.08} 0.085 ${ox + 0.17} 0.05 Q${ox + 0.08} 0.115 ${ox} 0.075 Z`} fill={INK} stroke={INK} strokeWidth={0.012} strokeLinejoin="round" />}
    {c.tash === "handle" && <path d={`M${ox} 0.06 Q${ox - 0.1} 0.15 ${ox - 0.2} 0.08 Q${ox - 0.25} 0.03 ${ox - 0.215} -0.02 Q${ox - 0.21} 0.06 ${ox - 0.13} 0.06 Q${ox - 0.06} 0.05 ${ox} 0.03 Q${ox + 0.06} 0.05 ${ox + 0.13} 0.06 Q${ox + 0.21} 0.06 ${ox + 0.215} -0.02 Q${ox + 0.25} 0.03 ${ox + 0.2} 0.08 Q${ox + 0.1} 0.15 ${ox} 0.06 Z`} fill={INK} />}
  </g>);
};

const LIGHT = "#fff3c4";
/** effect lines in head space: shock lines above the hat, sweat drops off the temple */
const Effects: React.FC<{ p: Pose; c: Costume; turn: number }> = ({ p, c, turn }) => {
  const top = (c.hat ? HAT_TOP[c.hat] : HEAD_R) + 0.07, side = turn >= 0 ? -1 : 1;
  return (<g>
    {p.shock !== undefined && p.shock >= 0 && [-150, -125, -100, -78, -55, -30].map((a, i) => {
      const grow = EASE.back(p.shock! / 7), r0 = top + 0.035 * Math.sin(p.shock! * 0.5 + i), len = (i % 2 ? 0.1 : 0.15) * grow, ca = Math.cos((a * Math.PI) / 180), sa = Math.sin((a * Math.PI) / 180);
      const d = `M${ca * r0} ${sa * r0 * 0.92} L${ca * (r0 + len)} ${sa * (r0 + len) * 0.92}`;
      return <g key={i}><path d={d} stroke={INK} strokeWidth={0.058} strokeLinecap="round" /><path d={d} stroke={LIGHT} strokeWidth={0.03} strokeLinecap="round" /></g>;
    })}
    {p.sweat !== undefined && p.sweat >= 0 && [0, 1].map((i) => {
      const a = (p.sweat! + i * 14) % 28, x = side * (0.33 + 0.007 * a), y = -0.16 - 0.011 * a + 0.0007 * a * a;
      return <path key={i} d="M0 -0.05 Q0.035 0 0 0.03 Q-0.035 0 0 -0.05 Z" transform={`translate(${x} ${y}) rotate(${side * (35 + a * 3)})`} fill="#9fd0ee" stroke={INK} strokeWidth={0.014} opacity={a > 22 ? (28 - a) / 6 : 1} />;
    })}
  </g>);
};

let uid = 0;
/** One figure. `part`: "all"; "rear" (back arm, legs, torso, head) and "front" (front arm) when something has to pass
 *  between them; "hands" draws only the mittens. `hold` puts a prop in a hand, in that arm's layer, under the mitten. */
export const Fig: React.FC<{ p: Pose; c: Costume; part?: "all" | "rear" | "front" | "hands"; f?: number; hold?: Hold }> = ({ p, c, part = "all", f, hold }) => {
  const g = solve(p, c, f), k = g.k, id = React.useMemo(() => `f${uid++}`, []);
  const LW = 0.046 * k, OW = 0.02 * k, turn = g.turn, dx = turn * 0.05;
  /** a limb as one curve from a to b that bows through the joint j */
  const hose = (a: P2, j: P2, b: P2, bow = 0.72) => { const A = g.S(a), J = g.S(j), B = g.S(b), C: P2 = [J[0] + bow * (J[0] - (A[0] + B[0]) / 2), J[1] + bow * (J[1] - (A[1] + B[1]) / 2)]; return { A, B, C, d: `M${A[0]} ${A[1]} Q${C[0]} ${C[1]} ${B[0]} ${B[1]}` }; };
  const mitten = (i: number) => {
    const a = g.arms[i], h = hose(a.sho, a.elb, a.hand), ang = Math.atan2(h.B[1] - h.C[1], h.B[0] - h.C[0]), ux = Math.cos(ang), uy = Math.sin(ang), s = i ? 1 : -1;
    const hx = h.B[0] + ux * 0.02 * k, hy = h.B[1] + uy * 0.02 * k, tx = hx - uy * 0.045 * k * s * -1 - ux * 0.01 * k, ty = hy + ux * 0.045 * k * s * -1 - uy * 0.01 * k;
    return (<g key={`h${i}`}>
      <circle cx={tx} cy={ty} r={0.028 * k} fill="#fbf6ea" stroke={INK} strokeWidth={OW * 0.9} />
      <circle cx={hx} cy={hy} r={0.058 * k} fill="#fbf6ea" stroke={INK} strokeWidth={OW} />
      <path d={`M${hx + ux * 0.02 * k - uy * 0.03 * k} ${hy + uy * 0.02 * k + ux * 0.03 * k} Q${hx + ux * 0.045 * k} ${hy + uy * 0.045 * k} ${hx + ux * 0.02 * k + uy * 0.03 * k} ${hy + uy * 0.02 * k - ux * 0.03 * k}`} stroke={INK} strokeWidth={OW * 0.6} fill="none" strokeLinecap="round" opacity={0.7} />
    </g>);
  };
  if (part === "hands") return <g>{[0, 1].map(mitten)}</g>;
  const arm = (i: number) => {
    const a = g.arms[i], h = hose(a.sho, a.elb, a.hand), q = 0.44;
    const m: P2 = [lerp(h.A[0], h.C[0], q), lerp(h.A[1], h.C[1], q)], n: P2 = [lerp(h.C[0], h.B[0], q), lerp(h.C[1], h.B[1], q)], e: P2 = [lerp(m[0], n[0], q), lerp(m[1], n[1], q)];
    const sleeve = `M${h.A[0]} ${h.A[1]} Q${m[0]} ${m[1]} ${e[0]} ${e[1]}`, fn = hold?.[i ? "R" : "L"];
    return (<g key={`a${i}`}>
      <path d={h.d} stroke={INK} strokeWidth={LW} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* a short sleeve over the top of the arm, so the garment reads as clothing */}
      <path d={sleeve} stroke={INK} strokeWidth={0.1 * k + OW * 2} strokeLinecap="round" fill="none" />
      <path d={sleeve} stroke={c.stripes ? "#f6f2e6" : i === g.back ? c.shade : c.coat} strokeWidth={0.1 * k} strokeLinecap="round" fill="none" />
      {fn && fn({ x: h.B[0], y: h.B[1], ang: (Math.atan2(h.B[1] - h.C[1], h.B[0] - h.C[0]) * 180) / Math.PI, k, gy: p.y })}
      {mitten(i)}
    </g>);
  };
  if (part === "front") return <g>{arm(1 - g.back)}</g>;
  const [hem, hw] = HEM[c.shape], dress = c.shape === "dress";
  const body = `M-0.13 -0.44 Q-0.215 -0.43 -0.225 -0.3 ${dress ? "Q-0.16 -0.05 -0.2 0.02" : ""} L${-hw} ${-hem - 0.04} Q${-hw} ${-hem} ${-hw + 0.04} ${-hem} L${hw - 0.04} ${-hem} Q${hw} ${-hem} ${hw} ${-hem - 0.04} ${dress ? "L0.2 0.02 Q0.16 -0.05 0.225 -0.3" : "L0.225 -0.3"} Q0.215 -0.43 0.13 -0.44 Z`;
  const tt = `translate(${g.hipS[0]} ${g.hipS[1]}) rotate(${p.lean ?? 0}) scale(${k * g.wide} ${k * g.st})`;
  const face: Face = (() => {
    let fc = p.face ?? FACES.neutral;
    if (p.lookAt) { const vx = (p.lookAt[0] - g.head[0]) / (1.6 * k), vy = (g.head[1] - p.lookAt[1]) / (1.6 * k), n = Math.max(1, Math.hypot(vx, vy)); fc = { ...fc, lookX: vx / n, lookY: vy / n }; }
    if (f !== undefined && !p.still) fc = { ...fc, eye: fc.eye * blinkAt(f, g.seed) };
    return fc;
  })();
  const mo = mouthOf(face, c, turn), ps = p.pipeSide ?? (turn < -0.25 ? -1 : 1), pcx = mo.ox + ps * mo.w * 0.85, pcy = mo.y + (face.open > 0.05 ? 0.025 * face.open : -mo.sm * 0.45);
  return (
    <g>
      {arm(g.back)}
      {g.legs.map((l, i) => {
        const h = hose(l.hip, l.knee, l.ank, 0.6), ft = g.S(l.foot), toe = p.walkDir ?? (i ? 0.3 : -0.3), lift = l.foot[1];
        return (<g key={i}>
          <path d={h.d} stroke={INK} strokeWidth={LW} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <ellipse cx={ft[0] + toe * 0.05 * k} cy={ft[1] - 0.04 * k} rx={0.105 * k} ry={0.05 * k} fill={c.shoe ?? INK} stroke={INK} strokeWidth={OW} transform={`rotate(${Math.sign(toe || 1) * Math.min(28, lift * 160)} ${ft[0]} ${ft[1] - 0.04 * k})`} />
        </g>);
      })}
      <g transform={tt}>
        <clipPath id={`${id}b`}><path d={body} /></clipPath>
        <path d={body} fill={c.coat} />
        <g clipPath={`url(#${id}b)`}>
          {c.stripes && [-0.36, -0.24, -0.12, 0, 0.12].map((y) => <rect key={y} x={-0.4} y={y} width={0.8} height={0.06} fill={c.stripes} />)}
          {c.tweed && [-0.4, -0.3, -0.2, -0.1, 0, 0.1, 0.2].map((y) => <path key={y} d={`M-0.4 ${y} L0.4 ${y + 0.08}`} stroke="rgba(60,36,14,0.28)" strokeWidth={0.012} />)}
          {c.vest && <path d={`M${-0.07 + dx} -0.44 L${0.07 + dx} -0.44 L${0.1 + dx} ${-hem} L${-0.1 + dx} ${-hem} Z`} fill={c.vest} stroke={INK} strokeWidth={0.014} />}
          {/* shade on the side away from the light, a pale rim on the lit side */}
          <path d={`M0.1 -0.5 L0.5 -0.5 L0.5 0.7 L0.16 0.7 Z`} fill={c.shade} opacity={0.55} />
          <path d={`M-0.5 -0.5 L-0.2 -0.5 L${-hw + 0.035} 0.7 L-0.5 0.7 Z`} fill="#ffffff" opacity={0.16} />
        </g>
        {!c.vest && !dress && <path d={`M${dx} -0.4 L${dx} ${-hem}`} stroke={INK} strokeWidth={0.014} opacity={0.8} />}
        {c.buttons && (c.vest ? [-0.26, -0.14, -0.02] : [-0.3, -0.19, -0.08, 0.03]).map((y) => <circle key={y} cx={dx + (c.vest ? 0 : 0.035)} cy={y} r={0.02} fill={c.buttons} stroke={INK} strokeWidth={0.008} />)}
        {c.pocket && <path d="M0.08 -0.02 L0.17 -0.02 L0.17 0.07 L0.08 0.07 Z M0.105 -0.02 L0.105 -0.075" stroke={INK} strokeWidth={0.012} fill="none" />}
        {c.belt && <g><rect x={-hw} y={-0.03} width={2 * hw} height={0.055} fill={c.belt} stroke={INK} strokeWidth={0.012} clipPath={`url(#${id}b)`} /><rect x={dx - 0.035} y={-0.04} width={0.07} height={0.075} fill="#f0bd3c" stroke={INK} strokeWidth={0.012} /></g>}
        <path d={body} fill="none" stroke={INK} strokeWidth={0.02} strokeLinejoin="round" />
        {c.collar && <path d={`M${dx} -0.38 L${-0.13 + dx} -0.45 L${-0.1 + dx} -0.31 Z M${dx} -0.38 L${0.13 + dx} -0.45 L${0.1 + dx} -0.31 Z`} fill={c.collar} stroke={INK} strokeWidth={0.014} strokeLinejoin="round" />}
        {c.bow && <g transform={`translate(${dx} -0.4)`}><path d="M0 0 L-0.1 -0.055 L-0.1 0.055 Z M0 0 L0.1 -0.055 L0.1 0.055 Z" fill={c.bow} stroke={INK} strokeWidth={0.014} strokeLinejoin="round" /><circle r={0.025} fill={c.bow} stroke={INK} strokeWidth={0.012} /></g>}
      </g>
      <g transform={`translate(${g.head[0]} ${g.head[1]}) rotate(${g.headDeg}) scale(${k})`}>
        <clipPath id={id}><circle r={HEAD_R} /></clipPath>
        <circle r={HEAD_R} fill="#fdfbf5" />
        <g clipPath={`url(#${id})`}><circle cx={0.2} cy={0.14} r={0.3} fill="none" stroke="#e4dccd" strokeWidth={0.1} /></g>
        <FaceShape f={face} c={c} turn={turn} id={id} />
        <circle r={HEAD_R} fill="none" stroke={INK} strokeWidth={0.02} />
        {c.monocle && <g><circle cx={turn * 0.13 - 0.105 * (1 - 0.22 * Math.abs(turn))} cy={-0.03} r={0.075} fill="rgba(207,233,255,0.25)" stroke="#e2a92c" strokeWidth={0.018} /><circle cx={turn * 0.13 - 0.105 * (1 - 0.22 * Math.abs(turn))} cy={-0.03} r={0.086} fill="none" stroke={INK} strokeWidth={0.008} /><path d={`M${turn * 0.13 - 0.105 * (1 - 0.22 * Math.abs(turn)) - 0.03} ${0.05} q-0.05 0.12 -0.02 0.24`} stroke="#e2a92c" strokeWidth={0.008} fill="none" /></g>}
        {/* the pipe hangs from the corner of the mouth; its smoke drifts up */}
        {c.pipe && <g transform={`translate(${pcx} ${pcy}) scale(${ps} 1)`}>
          {f !== undefined && [0, 1, 2].map((i) => { const a = (f * 0.8 + i * 30) % 90; return <circle key={i} cx={0.2 + 0.0015 * a + 0.03 * Math.sin(a * 0.11 + i)} cy={-0.03 - a * 0.0065} r={0.028 + 0.0009 * a} fill="#e9edf4" opacity={0.5 * (1 - a / 90)} />; })}
          <path d="M0 0 Q0.08 0.05 0.17 0.07" stroke={INK} strokeWidth={0.026} strokeLinecap="round" fill="none" />
          <path d="M0.15 0.01 L0.25 0.01 L0.235 0.12 L0.165 0.12 Z" fill="#5a3a20" stroke={INK} strokeWidth={0.014} strokeLinejoin="round" />
        </g>}
        <g transform={`translate(0 ${-(p.hatLift ?? 0)}) rotate(${(p.hatLift ?? 0) * 90})`}><HatShape c={c} turn={turn} /></g>
        <Effects p={p} c={c} turn={turn} />
      </g>
      {part === "all" && arm(1 - g.back)}
    </g>
  );
};

/** pose after walking `s` metres (side-on), feet planted; dir = -1 walks to screen left */
export const walk = (x0: number, y: number, k: number, s: number, L: number, dir: number): Pose => {
  const n = Math.max(1, Math.round(L / 0.4)), C = (2 * L) / n, dlt = 0.05 * C, e = (t: number) => t * t * (3 - 2 * t);
  s = Math.min(L, Math.max(0, s));
  const feet = [0, 1].map((i) => {
    const o = i * 0.5, u = (s + dlt) / C - o, kk = Math.floor(u), ph = u - kk, plant = (q: number) => (q + o + 0.3) * C - dlt;
    let d = plant(kk), lift = 0;
    if (ph >= 0.6) { const t = (ph - 0.6) / 0.4; d = plant(kk) + (plant(kk + 1) - plant(kk)) * e(t); lift = 0.07 * Math.sin(Math.PI * t); }
    return { d: (d - s) * dir, lift, ph };
  });
  const a = 0.16 * Math.cos(2 * Math.PI * feet[0].ph);
  return {
    x: x0 + dir * s * k, y, k, turn: 0.75 * dir, walkDir: dir, bob: -0.035 + 0.02 * Math.cos(4 * Math.PI * (feet[0].ph - 0.3)), lean: 3 * dir,
    footL: [feet[0].d, feet[0].lift], footR: [feet[1].d, feet[1].lift],
    handL: [-0.12 - a * dir, 0.62 + Math.abs(a) * 0.2], handR: [0.12 + a * dir, 0.62 + Math.abs(a) * 0.2],
  };
};

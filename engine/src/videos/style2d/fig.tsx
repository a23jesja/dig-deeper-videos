// The stick figure in 2D (SVG), laid out in screen space: plain white head with a black outline, a face of a few
// black strokes and dots, thin black limbs, mitten hands, and a garment that reads as clothing.
//
// RIG. A parent-child chain, solved once in `solve()`:
//   hip -> spine (lean at the hip, a bend in the back) -> neck -> head
//   shoulder (rises when the arm does) -> elbow -> wrist -> hand   two-bone IK to a hand target, may stretch a little
//   hip -> knee -> ankle -> foot
// Every limb is ONE curved path with round caps: it leaves the first joint along the first bone, turns in a tight
// round bend at the elbow or knee, and arrives along the second bone. No straight segments, no corners.
//
// DRAW ORDER inside a figure, back to front (Z_ORDER below, levels 4-7):
//   4 back arm and what it holds | 5 legs, torso | 6 head, face, monocle, moustache, pipe, hat | 7 front arm and what it holds
// A two-handed prop (`hold.both`) is drawn on level 7 and BOTH mittens are drawn over it, so both hands grip it.
// The pipe hangs from the corner of the mouth and tips up out of the way when a hand comes near: it never crosses an arm.
//
// LIFE. Given a frame `f` the figure is never a frozen cutout: it breathes, blinks every 2.5-4 s, its pupils and brows
// follow `lookAt`, `nervous` makes the eyes dart and the brows quiver, `shock` and `sweat` draw effect lines that
// pulse and jitter. The same solved points give the boxes the layout check uses.
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
  bend?: number;                           // degrees the back curves on top of the lean (+ = chest to screen right)
  neck?: number;                           // extra degrees at the neck: the head leads or drags behind the torso
  handL?: [number, number]; handR?: [number, number]; // hand targets (L = the arm on screen left)
  footL?: [number, number]; footR?: [number, number]; // foot positions [x, lift]
  walkDir?: number;                        // -1 / 1: knees bend this way (side-on walk)
  front?: "L" | "R";                       // the arm drawn in front of the head; default: the near arm for the turn
  headTilt?: number; face?: Face; hatLift?: number;
  lookAt?: [number, number];               // a point on screen (px): pupils and brows follow it
  pipeSide?: -1 | 1;                       // which corner of the mouth holds the pipe; default: the side he faces
  shock?: number; sweat?: number;          // effect lines: frames since they started (undefined = none)
  nervous?: number;                        // 0..1: pupils dart, brows quiver, the head trembles
  still?: boolean;                         // no breathing and no blinking (a figure in a picture)
};
/** where a hand holds something: wrist on screen (px), forearm direction (degrees), scale, and the ground under the figure */
export type Grip = { x: number; y: number; ang: number; k: number; gy: number };
/** what the hands hold: one prop per hand, drawn in that arm's layer under its mitten; or one prop for both hands */
export type Hold = { L?: (g: Grip) => React.ReactNode; R?: (g: Grip) => React.ReactNode; both?: (l: Grip, r: Grip) => React.ReactNode };
export type Part = "all" | "rear" | "front" | "hands" | "backArm" | "body" | "head" | "frontArm";
/** The strict draw order of a scene, back to front. 1-3 and 8 are scene layers (`Layer` in scenes.tsx, drawn by
 *  Mona2D.tsx); 4-7 are inside every figure (this file). Within a layer, things sort by their `z`, then by list order. */
export const Z_ORDER = [
  "1 painted sky, twinkling stars            (layer sky)",
  "2 the sea in bands, floats sorted into it (layer sea)",
  "3 background props and crowd              (layer bg)",
  "4 back arm and what it holds              (figure)",
  "5 legs and torso                          (figure)",
  "6 head, face, monocle, moustache, pipe, hat (figure)",
  "7 front arm and what it holds             (figure)",
  "8 railing and framing, then tags and captions (layer fg)",
] as const;

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
  const tb = Math.tan(((p.bend ?? 0) * Math.PI) / 180);
  const T = (u: number, v: number): P2 => { const uu = u * wide + v * st * tb; return [uu * Math.cos(th) + v * st * Math.sin(th), hip - uu * Math.sin(th) + v * st * Math.cos(th)]; };
  const spine = (p.lean ?? 0) + 0.7 * (p.bend ?? 0);
  const headDeg = spine + (p.neck ?? 0) + (p.headTilt ?? 0), nk = ((spine + (p.neck ?? 0) + 0.4 * (p.headTilt ?? 0)) * Math.PI) / 180;
  const neck = T(0, NECK_V), head: P2 = [neck[0] + Math.sin(nk) * NECK_L, neck[1] + Math.cos(nk) * NECK_L];
  const hands = [p.handL ?? [-0.3, 0.6], p.handR ?? [0.3, 0.6]] as P2[];
  // a shoulder rises with its arm
  const sx = SHO[0] * (1 - 0.22 * Math.abs(turn)), sho = [-1, 1].map((s, i) => { const base = T(s * sx + 0.03 * turn, SHO[1]); return T(s * sx + 0.03 * turn, SHO[1] + 0.04 * c01((hands[i][1] - base[1]) / 0.4)); });
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
    // seen from the front a knee bends towards us, not sideways: only part of the bend shows, the leg just gets shorter
    const side = p.walkDir === undefined ? 0.45 : 1, knee: P2 = [lerp((hj[0] + r.end[0]) / 2, r.j[0], side), lerp((hj[1] + r.end[1]) / 2, r.j[1], side)];
    return { hip: hj, knee, ank: r.end, foot: feet[i] };
  });
  const back = p.front ? (p.front === "L" ? 1 : 0) : turn >= 0 ? 1 : 0;
  const hatTop = c.hat ? HAT_TOP[c.hat] : HEAD_R, hatHalf = c.hat ? HAT_HALF[c.hat] : HEAD_R;
  const xs = [head[0] - hatHalf, head[0] + hatHalf, ...arms.flatMap((a) => [a.hand[0] - 0.06, a.hand[0] + 0.06, a.elb[0]]), ...legs.flatMap((l) => [l.foot[0] - 0.12, l.foot[0] + 0.12]), -HEM[c.shape][1], HEM[c.shape][1]];
  const ys = [head[1] + hatTop, ...arms.map((a) => a.hand[1] + 0.06), 0];
  const hs = S(head);
  return {
    k, turn, th, st, wide, S, T, head: hs, headDeg, headR: HEAD_R * k, arms, legs, back, seed, hipS: S(T(0, 0)), neckS: S(neck),
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
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
/** effect lines in head space: shock lines that pop, pulse and jitter above the hat; sweat drops off the temple */
const Effects: React.FC<{ p: Pose; c: Costume; turn: number }> = ({ p, c, turn }) => {
  const top = (c.hat ? HAT_TOP[c.hat] : HEAD_R) + 0.07, side = turn >= 0 ? -1 : 1;
  return (<g>
    {p.shock !== undefined && p.shock >= 0 && [-160, -136, -112, -90, -68, -44, -20].map((a0, i) => {
      const age = p.shock!, a = ((a0 + (hash(i * 13 + Math.floor(age / 2)) - 0.5) * 10) * Math.PI) / 180;      // re-drawn every second frame
      const grow = EASE.back(age / 6), pulse = 0.72 + 0.28 * Math.sin(age * 0.9 + i * 2.1), r0 = top + 0.01 + 0.035 * hash(i * 7 + Math.floor(age / 3));
      const len = (i % 2 ? 0.09 : 0.17) * grow * pulse, ca = Math.cos(a), sa = Math.sin(a), d = `M${ca * r0} ${sa * r0 * 0.92} L${ca * (r0 + len)} ${sa * (r0 + len) * 0.92}`;
      return <g key={i}><path d={d} stroke={INK} strokeWidth={0.058} strokeLinecap="round" /><path d={d} stroke={LIGHT} strokeWidth={0.03} strokeLinecap="round" /></g>;
    })}
    {p.sweat !== undefined && p.sweat >= 0 && [0, 1].map((i) => {
      const a = (p.sweat! + i * 14) % 28, x = side * (0.33 + 0.007 * a), y = -0.16 - 0.011 * a + 0.0007 * a * a;
      return <path key={i} d="M0 -0.05 Q0.035 0 0 0.03 Q-0.035 0 0 -0.05 Z" transform={`translate(${x} ${y}) rotate(${side * (35 + a * 3)})`} fill="#9fd0ee" stroke={INK} strokeWidth={0.014} opacity={a > 22 ? (28 - a) / 6 : 1} />;
    })}
  </g>);
};

let uid = 0;
/** One figure, drawn in the strict order back arm | legs, torso | head | front arm.
 *  `part`: "all"; "rear" (levels 4-6) and "front" (level 7) when something must pass between them (a child he
 *  carries); single levels ("backArm", "body", "head", "frontArm") for the rig sheet; "hands" = the mittens only. */
export const Fig: React.FC<{ p: Pose; c: Costume; part?: Part; f?: number; hold?: Hold }> = ({ p, c, part = "all", f, hold }) => {
  const g = solve(p, c, f), k = g.k, id = React.useMemo(() => `f${uid++}`, []);
  const LW = 0.046 * k, OW = 0.02 * k, turn = g.turn, dx = turn * 0.05, nv = f !== undefined ? p.nervous ?? 0 : 0;
  /** a limb as one curve: out of joint a along the first bone, a tight round bend at j, into b along the second bone */
  const limb = (a: P2, j: P2, b: P2, tight = 1.15) => {
    const A = g.S(a), J = g.S(j), B = g.S(b), C1: P2 = [A[0] + tight * (J[0] - A[0]), A[1] + tight * (J[1] - A[1])], C2: P2 = [B[0] + tight * (J[0] - B[0]), B[1] + tight * (J[1] - B[1])];
    return { A, J, B, C1, C2, d: `M${A[0]} ${A[1]} C${C1[0]} ${C1[1]} ${C2[0]} ${C2[1]} ${B[0]} ${B[1]}`, ang: Math.atan2(B[1] - J[1], B[0] - J[0]) };
  };
  const arms = g.arms.map((a) => limb(a.sho, a.elb, a.hand));
  const grip = (i: number): Grip => ({ x: arms[i].B[0], y: arms[i].B[1], ang: (arms[i].ang * 180) / Math.PI, k, gy: p.y });
  /** the hand: a mitten on the wrist, turned along the forearm, thumb towards the body */
  const mitten = (i: number) => {
    const h = arms[i], s = i ? 1 : -1, ty = s * 0.05 * k * Math.max(-1, Math.min(1, Math.sin(h.ang) * 3));
    return (<g key={`h${i}`} transform={`translate(${h.B[0]} ${h.B[1]}) rotate(${(h.ang * 180) / Math.PI})`}>
      <circle cx={0.012 * k} cy={ty} r={0.027 * k} fill="#fbf6ea" stroke={INK} strokeWidth={OW * 0.9} />
      <ellipse cx={0.03 * k} cy={0} rx={0.066 * k} ry={0.055 * k} fill="#fbf6ea" stroke={INK} strokeWidth={OW} />
      <path d={`M${0.055 * k} ${-0.03 * k} Q${0.078 * k} 0 ${0.055 * k} ${0.03 * k}`} stroke={INK} strokeWidth={OW * 0.6} fill="none" strokeLinecap="round" opacity={0.65} />
    </g>);
  };
  if (part === "hands") return <g>{[0, 1].map(mitten)}</g>;
  const arm = (i: number, hand = true) => {
    const h = arms[i], q = 0.42, L = (a: P2, b: P2): P2 => [lerp(a[0], b[0], q), lerp(a[1], b[1], q)];
    const p01 = L(h.A, h.C1), p12 = L(h.C1, h.C2), p23 = L(h.C2, h.B), p012 = L(p01, p12), p123 = L(p12, p23), e = L(p012, p123);
    const sleeve = `M${h.A[0]} ${h.A[1]} C${p01[0]} ${p01[1]} ${p012[0]} ${p012[1]} ${e[0]} ${e[1]}`, fn = hold?.[i ? "R" : "L"];
    return (<g key={`a${i}`}>
      <path d={h.d} stroke={INK} strokeWidth={LW} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* a short sleeve over the top of the arm, so the garment reads as clothing; the back arm's is in shade */}
      <path d={sleeve} stroke={INK} strokeWidth={0.1 * k + OW * 2} strokeLinecap="round" fill="none" />
      <path d={sleeve} stroke={c.stripes ? "#f6f2e6" : i === g.back ? c.shade : c.coat} strokeWidth={0.1 * k} strokeLinecap="round" fill="none" />
      {fn && fn(grip(i))}
      {hand && mitten(i)}
    </g>);
  };
  const two = !!hold?.both;
  /** level 4 */
  const backArm = arm(g.back, !two);
  /** level 7: the front arm; a two-handed prop goes here, with both mittens over it */
  const frontArm = (<g>{arm(1 - g.back, !two)}{two && hold!.both!(grip(0), grip(1))}{two && mitten(g.back)}{two && mitten(1 - g.back)}</g>);
  if (part === "front" || part === "frontArm") return frontArm;
  if (part === "backArm") return <g>{backArm}</g>;
  const [hem, hw] = HEM[c.shape], dress = c.shape === "dress";
  const body = `M-0.13 -0.44 Q-0.215 -0.43 -0.225 -0.3 ${dress ? "Q-0.16 -0.05 -0.2 0.02" : ""} L${-hw} ${-hem - 0.04} Q${-hw} ${-hem} ${-hw + 0.04} ${-hem} L${hw - 0.04} ${-hem} Q${hw} ${-hem} ${hw} ${-hem - 0.04} ${dress ? "L0.2 0.02 Q0.16 -0.05 0.225 -0.3" : "L0.225 -0.3"} Q0.215 -0.43 0.13 -0.44 Z`;
  const tt = `translate(${g.hipS[0]} ${g.hipS[1]}) rotate(${p.lean ?? 0}) skewX(${-(p.bend ?? 0)}) scale(${k * g.wide} ${k * g.st})`;
  /** level 5 */
  const legsTorso = (<g>
    {g.legs.map((l, i) => {
      const h = limb(l.hip, l.knee, l.ank, 1.1), ft = g.S(l.foot), toe = p.walkDir ?? (i ? 0.3 : -0.3), lift = l.foot[1];
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
  </g>);
  // the face: where he looks, the blink, and nerves
  const face: Face = (() => {
    let fc = p.face ?? FACES.neutral;
    if (p.lookAt) { const vx = (p.lookAt[0] - g.head[0]) / (1.6 * k), vy = (g.head[1] - p.lookAt[1]) / (1.6 * k), n = Math.max(1, Math.hypot(vx, vy)); fc = { ...fc, lookX: vx / n, lookY: vy / n }; }
    if (nv > 0) { const q = Math.sin(f! * 1.3 + g.seed) * 0.3 * nv; fc = { ...fc, lookX: Math.max(-1, Math.min(1, fc.lookX + (hash(Math.floor(f! / 6) + g.seed) - 0.5) * 1.5 * nv)), browY: [fc.browY[0] + q, fc.browY[1] - q * 0.6] }; }
    if (f !== undefined && !p.still) fc = { ...fc, eye: fc.eye * blinkAt(f, g.seed) };
    return fc;
  })();
  // the pipe: stem in the corner of the mouth; it tips up, out of the way, when a hand comes near the bowl
  const mo = mouthOf(face, c, turn), ps = p.pipeSide ?? (turn < -0.25 ? -1 : 1), pcx = mo.ox + ps * mo.w * 0.85, pcy = mo.y + (face.open > 0.05 ? 0.025 * face.open : -mo.sm * 0.45);
  const hr = (g.headDeg * Math.PI) / 180, bx = pcx + ps * 0.2, by = pcy + 0.06, bowl: P2 = [g.head[0] + (bx * Math.cos(hr) - by * Math.sin(hr)) * k, g.head[1] + (bx * Math.sin(hr) + by * Math.cos(hr)) * k];
  const near = Math.max(...arms.map((a) => c01(1.25 - Math.hypot(a.B[0] - bowl[0], a.B[1] - bowl[1]) / (0.26 * k))));
  const mx = turn * 0.13 - 0.105 * (1 - 0.22 * Math.abs(turn));
  /** level 6 */
  const head = (
    <g transform={`translate(${g.head[0]} ${g.head[1]}) rotate(${g.headDeg + 1.3 * nv * Math.sin((f ?? 0) * 1.9)}) scale(${k})`}>
      <clipPath id={id}><circle r={HEAD_R} /></clipPath>
      <circle r={HEAD_R} fill="#fdfbf5" />
      <g clipPath={`url(#${id})`}><circle cx={0.2} cy={0.14} r={0.3} fill="none" stroke="#e4dccd" strokeWidth={0.1} /></g>
      <FaceShape f={face} c={c} turn={turn} id={id} />
      <circle r={HEAD_R} fill="none" stroke={INK} strokeWidth={0.02} />
      {c.monocle && <g><circle cx={mx} cy={-0.03} r={0.075} fill="rgba(207,233,255,0.25)" stroke="#e2a92c" strokeWidth={0.018} /><circle cx={mx} cy={-0.03} r={0.086} fill="none" stroke={INK} strokeWidth={0.008} /><path d={`M${mx - 0.03} 0.05 q-0.05 0.12 -0.02 0.24`} stroke="#e2a92c" strokeWidth={0.008} fill="none" /></g>}
      {c.pipe && <g transform={`translate(${pcx} ${pcy}) scale(${ps} 1) rotate(${-52 * near})`}>
        {f !== undefined && [0, 1, 2].map((i) => { const a = (f * 0.8 + i * 30) % 90; return <circle key={i} cx={0.2 + 0.0015 * a + 0.03 * Math.sin(a * 0.11 + i)} cy={-0.03 - a * 0.0065} r={0.028 + 0.0009 * a} fill="#e9edf4" opacity={0.5 * (1 - a / 90)} />; })}
        <path d="M0 0 Q0.08 0.05 0.17 0.07" stroke={INK} strokeWidth={0.026} strokeLinecap="round" fill="none" />
        <path d="M0.15 0.01 L0.25 0.01 L0.235 0.12 L0.165 0.12 Z" fill="#5a3a20" stroke={INK} strokeWidth={0.014} strokeLinejoin="round" />
      </g>}
      <g transform={`translate(0 ${-(p.hatLift ?? 0)}) rotate(${(p.hatLift ?? 0) * 90})`}><HatShape c={c} turn={turn} /></g>
      <Effects p={p} c={c} turn={turn} />
    </g>
  );
  if (part === "body") return legsTorso;
  if (part === "head") return head;
  return (<g>{backArm}{legsTorso}{head}{part === "all" && frontArm}</g>);
};

/** Sir Digsworth's costume: tweed cap and jacket, waistcoat, bow tie, monocle, handlebar moustache, pipe */
export const SIR: Costume = { shape: "jacket", coat: "#a47a48", shade: "#6b4a26", tweed: true, vest: "#5c6b38", buttons: "#f0bd3c", bow: "#c0342c", collar: "#fdf8ee", hat: "tweed", hatColor: "#8f6d42", tash: "handle", monocle: true, pipe: true, shoe: "#5a3a20" };
/** the reusable Sir Digsworth: the rig above in his costume. `p` is the pose, `f` the frame (breath, blink, smoke). */
export const SirDigsworth: React.FC<{ p: Pose; f?: number; hold?: Hold; part?: Part }> = (props) => <Fig {...props} c={SIR} />;
/** his cane, for `hold: { L: cane }`: knob in the grip, a fixed length, hanging a little with the forearm */
export const cane = (g: Grip): React.ReactNode => {
  const a = ((90 + (g.ang - 90) * 0.35) * Math.PI) / 180, len = 0.83 * g.k, x1 = g.x + Math.cos(a) * len, y1 = Math.min(g.gy - 0.012 * g.k, g.y + Math.sin(a) * len);
  return (<g>
    <path d={`M${g.x} ${g.y} L${x1} ${y1}`} stroke={INK} strokeWidth={0.04 * g.k} strokeLinecap="round" /><path d={`M${g.x} ${g.y} L${x1} ${y1}`} stroke="#5a3a20" strokeWidth={0.018 * g.k} strokeLinecap="round" />
    <circle cx={g.x} cy={g.y - 0.012 * g.k} r={0.036 * g.k} fill="#f0bd3c" stroke={INK} strokeWidth={0.011 * g.k} />
  </g>);
};
/** his telescope, for `hold: { both: telescope("L") }`: the barrel runs through BOTH grips; `eye` names the hand at the eyepiece */
export const telescope = (eye: "L" | "R") => (l: Grip, r: Grip): React.ReactNode => {
  const n = eye === "L" ? l : r, fr = eye === "L" ? r : l, d = Math.hypot(fr.x - n.x, fr.y - n.y) || 1, ux = (fr.x - n.x) / d, uy = (fr.y - n.y) / d, k = n.k;
  const x0 = n.x - ux * 0.13 * k, y0 = n.y - uy * 0.13 * k, x1 = fr.x + ux * 0.2 * k, y1 = fr.y + uy * 0.2 * k, mx = lerp(n.x, fr.x, 0.45), my = lerp(n.y, fr.y, 0.45);
  return (<g>
    <path d={`M${x0} ${y0} L${x1} ${y1}`} stroke={INK} strokeWidth={0.082 * k} strokeLinecap="round" /><path d={`M${x0} ${y0} L${mx} ${my}`} stroke="#b98a52" strokeWidth={0.054 * k} strokeLinecap="round" />
    <path d={`M${mx} ${my} L${x1} ${y1}`} stroke={INK} strokeWidth={0.107 * k} strokeLinecap="round" /><path d={`M${mx} ${my} L${x1} ${y1}`} stroke="#e2a92c" strokeWidth={0.079 * k} strokeLinecap="round" />
    <path d={`M${lerp(mx, x1, 0.8)} ${lerp(my, y1, 0.8)} L${x1} ${y1}`} stroke="#fff1b8" strokeWidth={0.04 * k} strokeLinecap="round" opacity={0.8} />
  </g>);
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

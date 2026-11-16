// The skeleton of the cast, separate from every drawing (DAILY-RULES "Our own character design": the rig is separate from the skin).
// A pose is a set of joint angles and foot targets with no sizes in it; a design supplies the bone lengths (Props) and draws on the
// solved joints. The skeleton is solved in 3D (x = the figure's left, y = up, z = the way the figure faces) and then turned by the
// view angle, so the front, three-quarter, side and back views come from the same pose and are equally tall and wide.
export type V3 = [number, number, number];
export type P2 = [number, number];
const R = Math.PI / 180;

/** bone lengths of one design, in design units (about 1000 = a tall figure) */
export type Props = {
  thigh: number; shin: number; ankle: number; foot: number;
  /** half the distance between the hip joints / the shoulder joints */
  hipW: number; shW: number;
  /** pelvis to neck base; how far the shoulder joints sit below the neck base; neck base to skull base; height of the head */
  spine: number; shDrop: number; neck: number; head: number;
  upper: number; fore: number; hand: number;
};
/** direction of one bone: [swing forward (+) or back (-), out to the side], degrees from hanging straight down */
export type Seg = [number, number];
/** a planted foot: where the sole lands, in leg lengths, x out from under its own hip, z forward, y above the ground;
 *  pitch > 0 = on the toe (heel lifted), pitch < 0 = on the heel (toe lifted); toe = how far the foot is turned out */
export type FootIK = { x?: number; z?: number; y?: number; pitch?: number; toe?: number };
/** a free leg: thigh and shin directions */
export type LegFK = { th: Seg; sh: Seg; pitch?: number; toe?: number };
export type Leg = FootIK | LegFK;
export type Pose = {
  /** pelvis: sideways, up (negative = lower than standing), forward, in leg lengths. The pelvis is lowered by itself until planted feet reach. */
  px?: number; py?: number; pz?: number;
  /** spine: lean forward, tilt toward the figure's left, chest turned toward the figure's left; hip line tilt (left hip up) */
  lean?: number; roll?: number; twist?: number; hipTilt?: number;
  /** head: turned toward the figure's left, nodding down, tilted toward the figure's left */
  head?: [number, number, number];
  armL?: [Seg, Seg]; armR?: [Seg, Seg];
  /** the hand bent forward from the forearm, degrees */
  handL?: number; handR?: number;
  legL?: Leg; legR?: Leg;
};
export type Side = "L" | "R";
export type Joint = "pelvis" | "neck" | "skull" | "crown" | "shL" | "shR" | "elL" | "elR" | "wrL" | "wrR" | "tipL" | "tipR"
  | "hipL" | "hipR" | "knL" | "knR" | "anL" | "anR" | "heelL" | "heelR" | "toeL" | "toeR";
export type Sk = {
  P: Props; pose: Pose;
  /** view angle in degrees (0 = front, 90 = side facing screen-right, 180 = back, -90 = side facing screen-left) and its sine and cosine */
  yaw: number; sin: number; cos: number;
  /** joints on the picture plane (x right, y down, the ground under the figure at y = 0), their depth toward the lens, and in 3D */
  j: Record<Joint, P2>; z: Record<Joint, number>; v: Record<Joint, V3>;
  /** where the face points: 0 = at the lens, 90 = screen-right; and how far the head is tipped clockwise on the picture */
  faceYaw: number; headTilt: number;
  /** which side is nearer the lens */
  near: Side; far: Side;
};

const add = (a: V3, b: V3, k = 1): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const dir = ([sw, out]: Seg, s: number): V3 => [s * Math.sin(out * R), -Math.cos(out * R) * Math.cos(sw * R), Math.cos(out * R) * Math.sin(sw * R)];
const isFK = (l: Leg): l is LegFK => (l as LegFK).th !== undefined;

/** the foot from its ankle or its contact point: returns ankle, heel and toe */
const footFrom = (P: Props, s: number, pitch: number, toeOut: number, at: { ankle?: V3; sole?: V3 }) => {
  const p = pitch * R, t = toeOut * R;
  const f0: V3 = [s * Math.sin(t), 0, Math.cos(t)];
  const f: V3 = [f0[0] * Math.cos(p), -Math.sin(p), f0[2] * Math.cos(p)], n: V3 = [f0[0] * Math.sin(p), Math.cos(p), f0[2] * Math.sin(p)];
  if (at.ankle) { const heel = add(add(at.ankle, n, -P.ankle), f, -0.27 * P.foot); return { ankle: at.ankle, heel, toe: add(heel, f, P.foot) }; }
  const c = at.sole!, heel0 = add(c, f0, -0.27 * P.foot), toe0 = add(c, f0, 0.73 * P.foot);
  const heel = pitch > 0 ? add(toe0, f, -P.foot) : heel0, toe = pitch > 0 ? toe0 : add(heel0, f, P.foot);
  return { ankle: add(add(heel, f, 0.27 * P.foot), n, P.ankle), heel, toe };
};

export const solve = (P: Props, pose: Pose, yaw = 0): Sk => {
  const LL = P.thigh + P.shin, legs = { L: pose.legL ?? {}, R: pose.legR ?? {} } as Record<Side, Leg>;
  const pel: V3 = [(pose.px ?? 0) * LL, LL + P.ankle + (pose.py ?? 0) * LL, (pose.pz ?? 0) * LL];
  const ht = (pose.hipTilt ?? 0) * R, hipOff = (s: number): V3 => [s * P.hipW * Math.cos(ht), s * P.hipW * Math.sin(ht), 0];
  const v = {} as Record<Joint, V3>;
  // planted feet first: they decide how high the pelvis can be
  const planted: [Side, { ankle: V3; heel: V3; toe: V3 }][] = [];
  for (const side of ["L", "R"] as Side[]) {
    const l = legs[side], s = side === "L" ? 1 : -1;
    if (isFK(l)) continue;
    const sole: V3 = [s * (P.hipW + (l.x ?? 0.03) * LL), (l.y ?? 0) * LL, (l.z ?? 0) * LL];
    const f = footFrom(P, s, l.pitch ?? 0, l.toe ?? 14, { sole });
    planted.push([side, f]);
    const h = add(pel, hipOff(s)), dx = Math.hypot(f.ankle[0] - h[0], f.ankle[2] - h[2]), reach = LL * 0.996;
    if (dx < reach) pel[1] = Math.min(pel[1], f.ankle[1] + Math.sqrt(reach * reach - dx * dx) - hipOff(s)[1]);
  }
  v.pelvis = pel; v.hipL = add(pel, hipOff(1)); v.hipR = add(pel, hipOff(-1));
  for (const side of ["L", "R"] as Side[]) {
    const l = legs[side], s = side === "L" ? 1 : -1, H = v[`hip${side}`];
    if (isFK(l)) {
      const kn = add(H, dir(l.th, s), P.thigh), an = add(kn, dir(l.sh, s), P.shin), f = footFrom(P, s, l.pitch ?? 0, l.toe ?? 8, { ankle: an });
      v[`kn${side}`] = kn; v[`an${side}`] = an; v[`heel${side}`] = f.heel; v[`toe${side}`] = f.toe;
    } else {
      const f = planted.find((q) => q[0] === side)![1], A = f.ankle, a = P.thigh, b = P.shin;
      const d0 = sub(A, H), d = Math.max(Math.abs(a - b) + 1, Math.min(a + b - 0.01, Math.hypot(d0[0], d0[1], d0[2]))), u = norm(d0);
      const ca = (a * a + d * d - b * b) / (2 * a * d), F: V3 = [s * 0.16, 0, 1], w = norm(sub(F, [u[0] * dot(F, u), u[1] * dot(F, u), u[2] * dot(F, u)]));
      v[`kn${side}`] = add(add(H, u, a * ca), w, a * Math.sqrt(Math.max(0, 1 - ca * ca)));
      v[`an${side}`] = A; v[`heel${side}`] = f.heel; v[`toe${side}`] = f.toe;
    }
  }
  // free legs only: stand the figure on its lowest point
  if (!planted.length) {
    const low = Math.min(v.heelL[1], v.toeL[1], v.heelR[1], v.toeR[1]);
    for (const k of Object.keys(v) as Joint[]) v[k] = [v[k][0], v[k][1] - low, v[k][2]];
  }
  const lean = (pose.lean ?? 0) * R, roll = (pose.roll ?? 0) * R, tw = (pose.twist ?? 0) * R;
  const d: V3 = [Math.sin(roll), Math.cos(roll) * Math.cos(lean), Math.cos(roll) * Math.sin(lean)];
  const lat = norm(sub([1, 0, 0], [d[0] * d[0], d[1] * d[0], d[2] * d[0]])), fwd = cross(lat, d);
  const ax: V3 = add([lat[0] * Math.cos(tw), lat[1] * Math.cos(tw), lat[2] * Math.cos(tw)], fwd, -Math.sin(tw));
  v.neck = add(v.pelvis, d, P.spine);
  const nd = norm(add(d, [0, 1, 0]));
  v.skull = add(v.neck, nd, P.neck); v.crown = add(v.skull, nd, P.head);
  for (const side of ["L", "R"] as Side[]) {
    const s = side === "L" ? 1 : -1, arm = (side === "L" ? pose.armL : pose.armR) ?? [[0, 9], [6, 5]] as [Seg, Seg];
    const sh = add(add(v.neck, d, -P.shDrop), ax, s * P.shW), el = add(sh, dir(arm[0], s), P.upper), wr = add(el, dir(arm[1], s), P.fore);
    const hb = (side === "L" ? pose.handL : pose.handR) ?? 0;
    v[`sh${side}`] = sh; v[`el${side}`] = el; v[`wr${side}`] = wr; v[`tip${side}`] = add(wr, dir([arm[1][0] + hb, arm[1][1]], s), P.hand);
  }
  const c = Math.cos(yaw * R), sn = Math.sin(yaw * R), j = {} as Record<Joint, P2>, z = {} as Record<Joint, number>;
  for (const k of Object.keys(v) as Joint[]) { j[k] = [v[k][0] * c + v[k][2] * sn, -v[k][1]]; z[k] = v[k][2] * c - v[k][0] * sn; }
  const h = pose.head ?? [0, 0, 0], faceYaw = yaw + (pose.twist ?? 0) * 0.6 + h[0];
  const ndx = nd[0] * c + nd[2] * sn, headTilt = Math.atan2(ndx, nd[1]) / R + h[1] * Math.sin(faceYaw * R) + h[2] * Math.cos(faceYaw * R);
  const near: Side = z.shR >= z.shL ? "R" : "L";
  return { P, pose, yaw, sin: sn, cos: c, j, z, v, faceYaw, headTilt, near, far: near === "R" ? "L" : "R" };
};

// ---------------- poses (no sizes: they fit every design) ----------------
export const POSES: Record<string, Pose> = {
  /** standing at ease, feet a little apart and turned out */
  stand: { legL: { x: 0.04, toe: 24 }, legR: { x: 0.04, toe: 24 }, armL: [[0, 10], [10, 4]], armR: [[0, 10], [10, 4]] },
  /** the same seen from the side: feet forward, one arm a little ahead */
  standSide: { legL: { x: 0.02, z: -0.03, toe: 6 }, legR: { x: 0.02, z: 0.04, toe: 6 }, armL: [[-10, 6], [2, 3]], armR: [[8, 6], [26, 3]], lean: 2 },
  /** running: pushing off the back toe, the front knee high, the body leaning in */
  run: { lean: 17, pz: 0.05, legL: { z: -0.42, pitch: 44, toe: 4 }, legR: { th: [64, 2], sh: [-6, 0], pitch: 8 }, armL: [[38, 8], [118, 6]], armR: [[-56, 12], [14, 6]], head: [0, -8, 0] },
  /** the same with the far hand holding the cap on */
  runCap: { lean: 22, pz: 0.08, legL: { z: -0.44, pitch: 46, toe: 4 }, legR: { th: [70, 2], sh: [-2, 0], pitch: 10 }, armL: [[112, 6], [212, 4]], armR: [[-60, 12], [10, 6]], head: [0, -10, 0] },
  /** rearing back from something: weight on the bent back leg, the front heel dug in, hands thrown up */
  recoil: { lean: -17, pz: -0.2, py: -0.06, legL: { z: -0.3, toe: 20 }, legR: { z: 0.5, pitch: -28, toe: 4 }, armL: [[48, 26], [128, 16]], armR: [[72, 22], [146, 8]], handL: -20, handR: -20, head: [0, -9, 0] },
  /** a long stride with the weight over the bent front leg, pointing ahead */
  point: { lean: 11, pz: 0.14, legL: { z: -0.42, pitch: 34, toe: 6 }, legR: { z: 0.44, toe: 4 }, armL: [[-38, 12], [-8, 8]], armR: [[86, 5], [84, 0]], head: [0, -4, 0] },
  /** stopping dead: leaning back, the front leg braced straight on its heel, arms flung out for balance */
  skid: { lean: -21, pz: -0.1, py: -0.12, legL: { z: -0.14, toe: 18 }, legR: { z: 0.58, pitch: -24, toe: 4 }, armL: [[-72, 28], [-118, 18]], armR: [[118, 18], [152, 8]], head: [0, 6, 0] },
  /** tripping: the body pitches forward over the planted foot, the other leg flies up behind, hands thrown out to break the fall */
  stumble: { lean: 38, pz: 0.3, py: -0.04, legL: { z: -0.12, pitch: 30, toe: 6 }, legR: { th: [-30, 2], sh: [-100, 0], pitch: 30 }, armL: [[62, 14], [70, 8]], armR: [[88, 10], [100, 4]], handL: -30, handR: -30, head: [0, -24, 0] },
  /** winding up to throw: weight back on the bent rear leg, the throwing arm cocked behind the head, the other arm aiming */
  throw: { lean: -13, pz: -0.15, py: -0.05, legL: { z: -0.34, toe: 30 }, legR: { z: 0.42, pitch: -16, toe: 4 }, armL: [[82, 10], [78, 4]], armR: [[-112, 24], [-158, 10]], head: [0, -7, 0] },
  /** a fencer's lunge with the cane */
  lunge: { lean: 13, pz: 0.22, py: -0.2, legL: { z: -0.46, toe: 70 }, legR: { z: 0.56, toe: 2 }, armL: [[-58, 20], [-138, 10]], armR: [[92, 4], [90, 0]], head: [0, -2, 0] },
};

// Human bodies move like humans (Jesper, 19 November 2026, after the gladiator Short; DAILY-RULES.md on claude/emu-short-cloud):
// "armar, händer och ben poseras ofta på sätt som ingen människa rör sig". The joint limits of the skeleton, read from the solved
// pose in the figure's own frame (x = his left, y = up, z = the way he faces), and the measures the body check (bodyCheck.ts) uses
// for the three tests of the rule: no straight arm held out at shoulder height, weight on a foot under the hips, and something to sit
// or kneel on. A pose outside the limits is a fault of the film check, which stops the delivery (scripts/deliver.sh).
import type { Pose, Sk, V3, Side } from "../rig";

const R = 180 / Math.PI;
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V3): V3 => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const scale = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
/** the angle between two directions, degrees */
export const angle = (a: V3, b: V3) => Math.acos(Math.max(-1, Math.min(1, dot(norm(a), norm(b))))) * R;
/** v turned about the unit axis k by th radians (Rodrigues) */
const turn = (v: V3, k: V3, th: number): V3 => { const c = Math.cos(th), s = Math.sin(th), kv = cross(k, v), kd = dot(k, v);
  return [v[0] * c + kv[0] * s + k[0] * kd * (1 - c), v[1] * c + kv[1] * s + k[1] * kd * (1 - c), v[2] * c + kv[2] * s + k[2] * kd * (1 - c)]; };

/** The ranges of a real adult's joints, degrees (the rule: elbows and knees bend one way, 0-150; shoulders, hips, wrists and the neck
 *  have real ranges). Kept a little generous: a drawn figure that is near the end of a range is not yet wrong */
export const LIMITS = {
  /** the elbow and the knee bend at most this far, and only one way */
  elbowMax: 150, kneeMax: 150,
  /** the upper arm turned about its own length: the plane the elbow bends in may lie at most this far from where it lies with no
   *  turn (forward with the arm hanging; up with the arm held forward). Past it the forearm bends backward: a broken elbow */
  armTurn: 120,
  /** the upper arm at most this far behind the line of the body (straight back is 90) and across the chest past the middle */
  armBack: 65, armAcross: 60,
  /** the thigh at most this far behind the line of the body, out to the side, and across the other leg */
  thighBack: 45, thighOut: 70, thighAcross: 35,
  /** the hand bent from the forearm, either way */
  wrist: 80,
  /** the head turned, nodded down (+) or tipped back (-), tilted; the spine leaned forward (+) or back (-), bent sideways, twisted */
  neckTurn: 80, neckDown: 70, neckBack: 55, neckTilt: 40, leanFwd: 95, leanBack: 30, roll: 40, twist: 55,
  /** an elbow straighter than this is locked (the rule: never fully straight unless the action needs it) */
  locked: 5,
};

export type LimitFault = { part: string; what: string; by: number };
const SIDES: Side[] = ["L", "R"];
const sideName = (s: Side) => (s === "L" ? "left" : "right");

/** The body's own frame at the chest: out = toward the side `s` (his left for L), up = along the spine, fwd = the way the chest faces.
 *  A direction is read in it as [out, up, fwd], so that the left and the right arm are measured alike */
const chestFrame = (sk: Sk) => { const v = sk.v, up = norm(sub(v.neck, v.pelvis)), l0 = sub(v.shL, v.shR), lat = norm(sub(l0, scale(up, dot(l0, up)))), fwd = cross(lat, up);
  return (d: V3, s: Side): V3 => [dot(d, lat) * (s === "L" ? 1 : -1), dot(d, up), dot(d, fwd)]; };
/** The hips' frame: the figure's own (the pelvis does not turn with the chest's twist) */
const hipFrame = (d: V3, s: Side): V3 => [d[0] * (s === "L" ? 1 : -1), d[1], d[2]];

/** How far the elbow's bending plane is turned from where it lies with no turn of the upper arm, degrees (0..180). The arm is
 *  swung from hanging straight down to where it points by the shortest way, and the forward direction is swung with it: that is
 *  where the forearm goes when the elbow bends with no turn. Null where it cannot be told: an elbow nearly straight, or the upper arm
 *  near straight up (there the shortest way turns over) */
export const elbowTurn = (u0: V3, f0: V3): number | null => {
  const u = norm(u0), f = norm(f0), bend = angle(u, f); if (bend < 20) return null;
  const down: V3 = [0, -1, 0], el = angle(down, u); if (el > 150) return null;
  const ax = cross(down, u), al = len(ax), neutral: V3 = al < 1e-6 ? [0, 0, 1] : turn([0, 0, 1], scale(ax, 1 / al), (el / R));
  const b = norm(sub(f, scale(u, dot(f, u)))); return angle(neutral, b);
};

/** Every joint of a solved skeleton outside its range */
export const jointLimits = (sk: Sk): LimitFault[] => {
  const v = sk.v, p: Pose = sk.pose, L = LIMITS, out: LimitFault[] = [], chest = chestFrame(sk);
  const bad = (part: string, what: string, by: number) => out.push({ part, what, by });
  for (const s of SIDES) { const n = sideName(s);
    // the elbow
    const u = sub(v[`el${s}`], v[`sh${s}`]), f = sub(v[`wr${s}`], v[`el${s}`]), eb = angle(u, f);
    if (eb > L.elbowMax + 0.5) bad(`${n} elbow`, `the ${n} elbow is bent ${eb.toFixed(0)} degrees (at most ${L.elbowMax})`, eb - L.elbowMax);
    const cu = chest(u, s), cf = chest(f, s), tw = elbowTurn(cu, cf);
    if (tw !== null && tw > L.armTurn) bad(`${n} elbow`, `the ${n} forearm bends the wrong way: its elbow's plane is turned ${tw.toFixed(0)} degrees (at most ${L.armTurn})`, tw - L.armTurn);
    // the shoulder: the upper arm behind the body, or across the chest
    const ud = norm(cu), back = Math.asin(Math.max(-1, Math.min(1, -ud[2]))) * R, across = Math.asin(Math.max(-1, Math.min(1, -ud[0]))) * R;
    if (back > L.armBack) bad(`${n} shoulder`, `the ${n} upper arm is ${back.toFixed(0)} degrees behind the body (at most ${L.armBack})`, back - L.armBack);
    if (across > L.armAcross) bad(`${n} shoulder`, `the ${n} upper arm is ${across.toFixed(0)} degrees across the chest (at most ${L.armAcross})`, across - L.armAcross);
    // the wrist
    const hb = (s === "L" ? p.handL : p.handR) ?? 0; if (Math.abs(hb) > L.wrist) bad(`${n} wrist`, `the ${n} hand is bent ${Math.abs(hb).toFixed(0)} degrees at the wrist (at most ${L.wrist})`, Math.abs(hb) - L.wrist);
    // the knee: at most 150, and only forward (the shin goes back from the knee)
    const t = sub(v[`kn${s}`], v[`hip${s}`]), h = sub(v[`an${s}`], v[`kn${s}`]), kb = angle(t, h);
    if (kb > L.kneeMax + 0.5) bad(`${n} knee`, `the ${n} knee is bent ${kb.toFixed(0)} degrees (at most ${L.kneeMax})`, kb - L.kneeMax);
    // (in the figure's own frame: a knee bending as it should turns the shin backward about the figure's left-right line, so that
    // thigh x shin points to his left; the knee's hinge lies across the thigh, and with the thigh straight out to the side it cannot
    // be told which way is back)
    if (kb > 15) { const nt = norm(t), hinge = cross(nt, norm(h));
      if (Math.abs(nt[0]) < 0.7 && hinge[0] < -Math.sin(25 / R)) bad(`${n} knee`, `the ${n} knee bends the wrong way (the shin goes forward from it)`, kb); }
    // the hip: the thigh behind the body, out to the side, across the other leg
    const td = hipFrame(norm(t), s), tBack = td[2] < 0 ? Math.atan2(-td[2], -td[1]) * R : 0, tOut = Math.asin(Math.max(-1, Math.min(1, td[0]))) * R;
    if (tBack > L.thighBack) bad(`${n} hip`, `the ${n} thigh is ${tBack.toFixed(0)} degrees behind the body (at most ${L.thighBack})`, tBack - L.thighBack);
    if (tOut > L.thighOut) bad(`${n} hip`, `the ${n} thigh is ${tOut.toFixed(0)} degrees out to the side (at most ${L.thighOut})`, tOut - L.thighOut);
    if (-tOut > L.thighAcross) bad(`${n} hip`, `the ${n} thigh is ${(-tOut).toFixed(0)} degrees across the other leg (at most ${L.thighAcross})`, -tOut - L.thighAcross); }
  // the neck and the spine, from the pose itself
  const [hT, hN, hL] = p.head ?? [0, 0, 0];
  if (Math.abs(hT) > L.neckTurn) bad("neck", `the head is turned ${Math.abs(hT).toFixed(0)} degrees (at most ${L.neckTurn})`, Math.abs(hT) - L.neckTurn);
  if (hN > L.neckDown) bad("neck", `the head is nodded ${hN.toFixed(0)} degrees down (at most ${L.neckDown})`, hN - L.neckDown);
  if (-hN > L.neckBack) bad("neck", `the head is tipped ${(-hN).toFixed(0)} degrees back (at most ${L.neckBack})`, -hN - L.neckBack);
  if (Math.abs(hL) > L.neckTilt) bad("neck", `the head is tilted ${Math.abs(hL).toFixed(0)} degrees (at most ${L.neckTilt})`, Math.abs(hL) - L.neckTilt);
  const ln = p.lean ?? 0, rl = p.roll ?? 0, tw = p.twist ?? 0;
  if (ln > L.leanFwd) bad("spine", `the body is bent ${ln.toFixed(0)} degrees forward (at most ${L.leanFwd})`, ln - L.leanFwd);
  if (-ln > L.leanBack) bad("spine", `the body is bent ${(-ln).toFixed(0)} degrees back (at most ${L.leanBack})`, -ln - L.leanBack);
  if (Math.abs(rl) > L.roll) bad("spine", `the body is bent ${Math.abs(rl).toFixed(0)} degrees to the side (at most ${L.roll})`, Math.abs(rl) - L.roll);
  if (Math.abs(tw) > L.twist) bad("spine", `the chest is twisted ${Math.abs(tw).toFixed(0)} degrees (at most ${L.twist})`, Math.abs(tw) - L.twist);
  return out;
};

/** An elbow locked straight with the arm lifted (more than 30 degrees from hanging): the rule's "never fully straight unless the
 *  action needs it". Returns the sides */
export const lockedElbows = (sk: Sk): Side[] => SIDES.filter((s) => { const v = sk.v, u = sub(v[`el${s}`], v[`sh${s}`]), f = sub(v[`wr${s}`], v[`el${s}`]);
  return angle(u, f) < LIMITS.locked && angle(u, [0, -1, 0]) > 30; });

/** How low the pelvis is against standing (1 = standing, 0.5 = a deep squat), and how far the thighs reach forward from hanging
 *  (90 = level, as when sitting): the measures of the support test */
export const lowness = (sk: Sk) => { const P = sk.P, stand = P.thigh + P.shin + P.ankle, v = sk.v;
  const th = (s: Side) => angle(sub(v[`kn${s}`], v[`hip${s}`]), [0, -1, 0]);
  return { low: (v.pelvis[1] - Math.min(v.heelL[1], v.toeL[1], v.heelR[1], v.toeR[1])) / stand, thigh: Math.max(th("L"), th("R")) }; };

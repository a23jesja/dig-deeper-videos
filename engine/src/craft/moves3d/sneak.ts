// 3D step 2, the movement sheet, piece 1: sneaking. The cabin boy creeps across the cabin floor toward the chart table, low, on his toes,
// his hands up in front of him; half way he glances back over his shoulder toward the door (toward the lens), afraid, then on again.
// The walk is the rig's own (motion.ts walk, unchanged); the sneak is laid over it: the pelvis low and the body leaning in, each swinging
// foot lifted higher and set down toe first, the arms held up. Nothing here changes the frozen look.
import { ease } from "../stage/acting";
import { figure } from "../clips/clipKit";
import type { Pose, FootIK } from "../rig";

type Seg2 = [number, number];
const smooth = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
const softMax = (a: number, b: number, k: number) => (a + b + Math.sqrt((a - b) * (a - b) + k * k)) / 2;
/** the piece starts this far into his walk, so he is already creeping in the first frame (cut on the action) */
export const SNEAK_OFF = 1.1;
export const SNEAK = { step: 0.55, tau: 0.78, dist: 3.4, lift: 2.0, toe: 18 };
/** fists drawn up to the chest, the elbows in: a scared boy creeping (open hands held up read as offering something, the first stills) */
const ARM_L: [Seg2, Seg2] = [[22, 12], [138, 4]], ARM_R: [Seg2, Seg2] = [[14, 12], [130, 4]];

export const sneakBoy = (heading = -90) => {
  const m = figure("sir", 0, heading); m.stand(0.25);
  m.walk(SNEAK.dist, { step: SNEAK.step, tau: SNEAK.tau, keep: true }); m.stand(4);
  const O = SNEAK_OFF, T = (x: number) => x + O;      // (piece seconds to the mover's)
  // fear: brows up, eyes wide (under 0.5, where the rig would open the lid in one frame), the mouth a small tight line
  ease(m, -9, { py: -0.1, lean: 13, head: [40, -6, 0] }, 0.01, { face: { pupil: 1, gaze: [-0.5, 0.05], brow: 0.85, wide: 0.42, smile: -0.6, mouth: 0.26, teeth: 0.8, lid: 0 } });
  // the glance back over his shoulder toward the door (the lens): the head turns, the eyes go first
  ease(m, T(0.95), { py: -0.16, lean: 7, head: [58, -6, 3] }, 0.55, { face: { pupil: 1, gaze: [1, -0.05], brow: 1, wide: 0.47, smile: -0.8, mouth: 0.34, teeth: 0.9, lid: 0 } });      // (ducking lower as he looks: the fright in the body too)
  // and on again, a little lower, quicker breath
  ease(m, T(1.9), { py: -0.12, lean: 14, head: [40, -8, 0] }, 0.5, { face: { pupil: 1, gaze: [-0.55, 0.1], brow: 0.8, wide: 0.4, smile: -0.6, mouth: 0.26, teeth: 0.8, lid: 0 } });
  // (the head stays in the design's three-quarter drawing all through: it switches drawings at |sin(faceYaw)| 0.45 and 0.85, and a glance from
  //  profile to three-quarter flipped the ear and the cap in one frame, the flicker check of draft d1, 1.37 s. Body in profile (-90), the face
  //  at -50 creeping (pupils ahead), -32 glancing back: both inside 27-58 degrees, with the walk's twist halved)
  const legY = (k: "legL" | "legR", t: number) => ((m.sample(t).pose[k] as FootIK | undefined)?.y ?? 0);
  /** how long ago this foot landed (seconds), or null if it is in the air or landed more than 0.3 s ago */
  const landedAgo = (k: "legL" | "legR", t: number) => { if (legY(k, t) > 0) return null; for (let j = 1; j <= 18; j++) if (legY(k, t - j / 60) > 0) return (j - 0.5) / 60; return null; };
  /** how soon this foot lifts (seconds), or null if it is in the air or lifts more than 0.3 s from now */
  const liftIn = (k: "legL" | "legR", t: number) => { if (legY(k, t) > 0) return null; for (let j = 1; j <= 18; j++) if (legY(k, t + j / 60) > 0) return (j - 0.5) / 60; return null; };
  const hook = (t: number, p: Pose): Pose => {
    const q = { ...p } as Pose;
    for (const k of ["legL", "legR"] as const) { const l = q[k] as FootIK | undefined; if (!l || (l as { th?: unknown }).th !== undefined) continue;
      const y = l.y ?? 0;
      if (y > 0) {      // (swinging: lifted higher (the knee comes up), the toe kept pointing down from the push-off to the landing)
        // (the height eased at both ends (zero speed as it leaves and as it touches): the walk's own lift starts at full speed, and doubled
        //  it jerked the heel 17 px a frame in one frame at every lift-off, motion2 on draft d2)
        q[k] = { ...l, y: SNEAK.lift * 0.11 * smooth(Math.min(1, y / 0.11)), pitch: softMax(SNEAK.toe, l.pitch ?? 0, 10) }; continue; }      // (a soft max: the hard one stopped the toe's turn in one frame, 13-14 px a frame, d4)
      // (planted: it lands on its toe, which stays where it touched, and the heel comes down over 0.22 s; then the walk's own roll onto the
      //  toe before it lifts, never the walk's heel-first landing)
      //  toe before it lifts, over 0.3 s (the walk's own roll, 0.16 s, raised the heel 30 px a frame within two frames: motion2 on draft d3)
      const ago = landedAgo(k, t), land = ago === null ? 0 : SNEAK.toe * (1 - smooth(ago / 0.22)), until = liftIn(k, t), roll = until === null ? 0 : 30 * smooth(1 - until / 0.3);
      q[k] = { ...l, pitch: Math.max(land, roll) }; }
    const sw = 6 * Math.sin(t * Math.PI * 2 / (2 * SNEAK.tau));      // (a small swing left in the raised arms)
    q.armL = [[ARM_L[0][0] + sw, ARM_L[0][1]], [ARM_L[1][0] + sw, ARM_L[1][1]]]; q.armR = [[ARM_R[0][0] - sw, ARM_R[0][1]], [ARM_R[1][0] - sw, ARM_R[1][1]]];
    q.handL = 10; q.handR = 10; q.twist = (q.twist ?? 0) * 0.5; return q; };
  return { m, hook, off: O };
};

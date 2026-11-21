// Small helpers for staging a figure with the motion library in metres, and a few acting pieces that several films use.
import { Mover } from "../motion";
import type { Design } from "../designs/common";
import type { Pose, Seg } from "../rig";
import { legM } from "./film";

/** a Mover placed in metres: x, z on the ground of the world, facing in degrees (0 = toward +z, 90 = toward +x) */
export type MM = Mover & { LL: number; D: Design; h: number };
export const mover = (D: Design, h: number, x: number, z: number, facing: number): MM => { const LL = legM(D, h); return Object.assign(new Mover([x / LL, z / LL], facing), { LL, D, h }); };
/** metres to the Mover's own unit (leg lengths) */
export const mt = (m: MM, metres: number) => metres / m.LL;
/** treading on the spot (a fuller in his tub, somebody stamping): the knees come up in turn */
export const tread = (m: Mover, t0: number, dur: number, period = 0.4, lift = 56) => {
  for (let t = t0, i = 0; t < t0 + dur; t += period, i++) m.actAt(t, (i % 2 ? { legL: { th: [lift, 6], sh: [-34, 0], pitch: 24 }, roll: -3, py: 0.015 } : { legR: { th: [lift, 6], sh: [-34, 0], pitch: 24 }, roll: 3, py: 0.015 }) as Partial<Pose>, period * 0.92, { in: period * 0.36, out: period * 0.36, antic: 0, over: 1.3 });
};
/** a small repeated move between two arm poses (wagging a finger, waving a smell away, shaking a box) */
export const wag = (m: Mover, t0: number, dur: number, a: Partial<Pose>, b: Partial<Pose>, period = 0.3, o0: Parameters<Mover["actAt"]>[3] & { /** no beat starts after this time (a cut: a new movement begun three frames before it reads as a slip, the review of the eye patch Short v1s); the first pose stays under to the end */ lastBeat?: number } = {}) => {
  const { lastBeat, ...o } = o0;
  // the first pose lies under the whole move, so the hand keeps its shape and the arm never drops between two beats
  m.actAt(t0 - 0.1, a, dur + 0.2, { in: 0.14, out: 0.2, antic: 0, over: 1.1, ...o });
  const starts: number[] = []; for (let t = t0; t < t0 + dur && (lastBeat === undefined || t <= lastBeat); t += period / 2) starts.push(t);
  // (with lastBeat the last beat is held to the end of the move: ending, it went back to the first pose, a new movement just before the cut)
  starts.forEach((t, i) => { const last = lastBeat !== undefined && i === starts.length - 1; m.actAt(t, i % 2 ? b : a, last ? Math.max(period * 0.62, t0 + dur + 0.2 - t) : period * 0.62, { in: period * 0.26, out: last ? 0 : period * 0.26, antic: 0, over: 1.2, ...o }); });
};
export const arm = (a: number, b: number, c: number, d: number): [Seg, Seg] => [[a, b], [c, d]];

/** a point (Jesper's library rule 1, 21 Nov 2026): the arm rises over `up` seconds, is held at most one second, and comes down over
 *  `down`; the eyes go to the target first. pose is the pointing pose (the gesture library's point, aimed); hold is cut to 1 s */
export const pointAt = (m: Mover, t0: number, pose: Partial<Pose>, hold: number, o: { up?: number; down?: number; face?: import("../designs/common").Face } = {}) => {
  const up = o.up ?? 0.32, down = o.down ?? 0.34, h = Math.min(1.0, hold);
  m.actAt(t0, pose, up + h + down, { in: up, out: down, glide: true, antic: 0, face: o.face });
  return { t0, held: [t0 + up, t0 + up + h] as [number, number], t1: t0 + up + h + down };
};

/** a pose laid on at t0 that eases in over `dur` seconds (slow at both ends) and holds until a later one takes over: a body never starts
 *  or stops a move at full speed (the motion check's jerk test, the shot library review of round 2) */
export const ease = (m: Mover, t0: number, pose: Partial<Pose>, dur: number, o: Omit<NonNullable<Parameters<Mover["actAt"]>[3]>, "in" | "glide"> = {}) => m.actAt(t0, pose, 30, { ...o, in: dur, glide: true, antic: 0 });

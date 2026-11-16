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
export const wag = (m: Mover, t0: number, dur: number, a: Partial<Pose>, b: Partial<Pose>, period = 0.3, o: Parameters<Mover["actAt"]>[3] = {}) => {
  for (let t = t0, i = 0; t < t0 + dur; t += period / 2, i++) m.actAt(t, i % 2 ? b : a, period * 0.62, { in: period * 0.26, out: period * 0.26, antic: 0, over: 1.2, ...o });
};
export const arm = (a: number, b: number, c: number, d: number): [Seg, Seg] => [[a, b], [c, d]];

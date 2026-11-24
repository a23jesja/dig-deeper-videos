// 3D step 2, the movement sheet: who is in each piece (shot) and what each adds to a figure's own layer.
import { SHOTS, HEIGHTS, BOY, CAPTAIN, type Who, type Extra } from "./core";
import { sneakBoy } from "./sneak";
import { carryScene, CARRY } from "./carry";

const shot = (id: string) => SHOTS.find((s) => s.id === id)!;
const S1 = (): Who[] => { const b = sneakBoy(-90), s = shot("S1");
  return [{ name: "boy", at: s.figs.boy, walk: s.walk!.boy, h: HEIGHTS.boy, rimSide: 1, off: b.off, sun: true,
    cast: { name: "boy", m: b.m, who: "sir", look: BOY, seed: 12, armWipe: false, pose: b.hook, hands: { L: [[0, "fist"]], R: [[0, "fist"]] } } }]; };
/** piece 2, carrying: the captain backing up (facing right), the boy following (facing left), the chest between them (moved on the plate) */
const S2 = (): Who[] => { const sc = carryScene();
  return [{ name: "captain", at: [sc.atC, CARRY.y], walk: [1, 0], h: HEIGHTS.captain, rimSide: 1, off: 0, sun: true,
      cast: { name: "captain", m: sc.cap.m, who: "sir", look: CAPTAIN, seed: 1, armWipe: false, pose: sc.hook("captain", HEIGHTS.captain), hands: { L: [[0, "grip"]], R: [[0, "grip"]] } } },
    { name: "boy", at: [sc.atB, CARRY.y], walk: [1, 0], h: HEIGHTS.boy, rimSide: 1, off: 0, sun: true,
      cast: { name: "boy", m: sc.boy.m, who: "sir", look: BOY, seed: 12, armWipe: false, pose: sc.hook("boy", HEIGHTS.boy), hands: { L: [[0, "grip"]], R: [[0, "grip"]] } } }]; };
export const WHO: Record<string, () => Who[]> = { S1, S2 };
/** the things a piece moves on the plate, frame by frame (written for Blender by scripts/moves_props.mjs) */
export const PROPS: Record<string, () => { name: string; frames: number[][] }[]> = {
  S2: () => { const sc = carryScene(), s = shot("S2"), n = Math.round((s.t1 - s.t0) * 30); return [{ name: "chest", frames: Array.from({ length: n }, (_, f) => { const c = sc.chestAt(f / 30); return [c.x, c.y, c.z]; }) }]; } };
export const EXTRAS: Record<string, Record<string, Extra>> = {};

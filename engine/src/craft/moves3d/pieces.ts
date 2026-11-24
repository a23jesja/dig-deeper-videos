// 3D step 2, the movement sheet: who is in each piece (shot) and what each adds to a figure's own layer.
import { SHOTS, HEIGHTS, BOY, type Who, type Extra } from "./core";
import { sneakBoy } from "./sneak";

const shot = (id: string) => SHOTS.find((s) => s.id === id)!;
const S1 = (): Who[] => { const b = sneakBoy(-90), s = shot("S1");
  return [{ name: "boy", at: s.figs.boy, walk: s.walk!.boy, h: HEIGHTS.boy, rimSide: 1, off: b.off, sun: true,
    cast: { name: "boy", m: b.m, who: "sir", look: BOY, seed: 12, armWipe: false, pose: b.hook, hands: { L: [[0, "fist"]], R: [[0, "fist"]] } } }]; };
export const WHO: Record<string, () => Who[]> = { S1 };
export const EXTRAS: Record<string, Record<string, Extra>> = {};

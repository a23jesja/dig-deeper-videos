// A test, not a film (Jesper, 19 Nov 2026): Blackbeard's cabin at night painted by SDXL and split by depth (world/painted.ts), beside
// the same cabin in our usual 3D (world/cabin.ts cabinNight). Five seconds each, one after the other, in 1080 x 1920: the same lens
// going slowly in, the same two figures in the same places before it, the same light on them and the same grade over the picture.
// Nothing of it goes into a film until Jesper has chosen.
import * as THREE from "three";
import type { Film, Actor, Cam } from "../stage/film";
import { lens } from "../stage/staging";
import { paintedSet, type Layers } from "../world/painted";
import { CABIN, cabinNight } from "../world/cabin";
import { glow } from "../world/fire";
import type { Sun } from "../world/kit";
import { POSES, type Pose } from "../rig";
import { SIR_D, BLACKBEARD_D } from "../looks";
import type { Design } from "../designs/common";

// (the push of 0.3 m keeps both whole with a hand's width or more to each edge at its end: at 0.45 Blackbeard's hat came 30 px from it)
const SECONDS = 5, FOV = 50, EYE = 1.35, PUSH = 0.3;
/** the night: a warm light from the front left (the lantern's side, high), a blue night sky light, a dark floor */
//   (low, 17 degrees: in the 3D cabin a higher light falls on them through the beams and their faces go grey, so that the two versions
//   would not light them alike)
export const NIGHT: Sun = { from: [-3, 1.75, 5], color: "#ffcf9a", power: 1.6, sky: "#7482bd", ground: "#3a2a20", fill: 1.05, reach: 5 };
/** the grade over both: the night's blue at the edges, warm where the two stand */
export const NIGHT_GRADE = "radial-gradient(ellipse 70% 55% at 50% 52%, rgba(255,238,214,1) 0%, rgba(214,206,226,1) 55%, rgba(150,160,212,1) 100%)";

/** the two before a lens at (x, z) on a floor at height y, looking along -z: Sir to the left, Blackbeard to the right, 3.4 m off */
const two = (x: number, y: number, z: number, V: ReturnType<typeof lens>, t: number): Actor[] => {
  const at = (dx: number, dz: number): [number, number, number] => [x + dx, y, z - 3.4 + dz];
  const fig = (name: string, D: Design, h: number, p: [number, number, number], off: number, look: number): Actor => {
    // standing at ease, the head turned to the other and back a little as he listens (no gesture: the gesture library is not approved yet)
    const pose: Pose = { ...POSES.stand, head: [look + 4 * Math.sin(t * 1.3 + off), 2, 0] };
    return { name, D, h, at: p, heading: V.toward(p[0], p[2], off), pose, o: {} }; };
  return [fig("sir", SIR_D, 1.75, at(-0.44, 0), 22, 12), fig("bb", BLACKBEARD_D, 1.92, at(0.32, -0.1), -18, -10)];
};
const film = (id: string, world: () => THREE.Group, V: ReturnType<typeof lens>, x: number, y: number, z: number, extra?: (g: THREE.Group, T: number, cam: Cam) => void): Film => ({
  id, fps: 30, seconds: SECONDS, range: [4, 6], sky: "#0b1530", world, words: [], hook: { text: [], a: 0, b: 0 },
  grade: () => NIGHT_GRADE,
  shots: [{ id: "push", a: 0, b: SECONDS, cam: (_t, u) => V.push(PUSH * u), sun: { target: [x, y, z - 3.4], reach: 4 }, capsTop: 1500,
    cast: (t) => two(x, y, z, V, t), things: extra ? (g, _c, _t, T, cam) => extra(g, T, cam) : undefined }],
});

/** the painted version: the lens at the origin, the layers 2.4, 3.9 and 7 m before it */
export const cabinPainted = (L: Layers): Film => { const V = lens(0, EYE, 0, 0, -1, 0, FOV);
  return film("cabin-test-painted", () => paintedSet(L, [0, EYE, 0], FOV, { near: 2.4, mid: 3.9, far: 7 }, NIGHT), V, 0, 0, 0); };
/** the 3D version: the same lens at the cabin's open front, the two in front of the table, the stool behind Sir, the lantern lit */
export const cabin3d = (): Film => { const x = CABIN.at[0] + 0.3, y = CABIN.at[1], z = CABIN.at[2] + 3.6, V = lens(x, y + EYE, z, 0, -1, 0, FOV);
  const flame: [number, number, number] = [CABIN.at[0] + CABIN.flame[0], y + CABIN.flame[1], CABIN.at[2] + CABIN.flame[2]];
  return film("cabin-test-3d", () => cabinNight(NIGHT), V, x, y, z, (g, T, cam) => glow(g, flame, 0.5, 0.5, T, Math.atan2(cam.pos[0] - flame[0], cam.pos[2] - flame[2]), 2)); };

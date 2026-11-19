// A test, not a film (Jesper, 19 Nov 2026): Blackbeard's cabin at night painted by SDXL and split by depth (world/painted.ts), beside
// the same cabin in our usual 3D (world/cabin.ts cabinNight). Five seconds each, one after the other, in 1080 x 1920: the same lens
// going slowly in, the same two figures in the same places before it, the same light on them and the same grade over the picture.
// Nothing of it goes into a film until Jesper has chosen.
import * as THREE from "three";
import type { Film, Actor, Cam } from "../stage/film";
import { lens } from "../stage/staging";
import { paintedSet, type Layers } from "../world/painted";
import { CABIN, CABIN_NIGHT, cabinNight, inCabin } from "../world/cabin";
import { dust, floorGlint, foreBeam, lampRays } from "../world/air";
import { glow } from "../world/fire";
import type { Sun, CardLight } from "../world/kit";
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
const two = (x: number, y: number, z: number, V: ReturnType<typeof lens>, t: number, noShade = false): Actor[] => {
  const at = (dx: number, dz: number): [number, number, number] => [x + dx, y, z - 3.4 + dz];
  const fig = (name: string, D: Design, h: number, p: [number, number, number], off: number, look: number): Actor => {
    // standing at ease, the head turned to the other and back a little as he listens (no gesture: the gesture library is not approved yet)
    const pose: Pose = { ...POSES.stand, head: [look + 4 * Math.sin(t * 1.3 + off), 2, 0] };
    return { name, D, h, at: p, heading: V.toward(p[0], p[2], off), pose, o: {}, noShade }; };
  return [fig("sir", SIR_D, 1.75, at(-0.44, 0), 22, 12), fig("bb", BLACKBEARD_D, 1.92, at(0.32, -0.1), -18, -10)];
};
const film = (id: string, world: () => THREE.Group, V: ReturnType<typeof lens>, x: number, y: number, z: number, extra?: (g: THREE.Group, T: number, cam: Cam) => void, light?: CardLight, noShade = false): Film => ({
  id, fps: 30, seconds: SECONDS, range: [4, 6], sky: "#0b1530", world, words: [], hook: { text: [], a: 0, b: 0 },
  grade: () => NIGHT_GRADE, light,
  shots: [{ id: "push", a: 0, b: SECONDS, cam: (_t, u) => V.push(PUSH * u), sun: { target: [x, y, z - 3.4], reach: 4 }, capsTop: 1500,
    cast: (t) => two(x, y, z, V, t, noShade), things: extra ? (g, _c, _t, T, cam) => extra(g, T, cam) : undefined }],
});

/** the painted version: the lens at the origin, the layers 2.4, 3.9 and 7 m before it. The figures take the painting's own light:
 *  its lantern high on the left (on the middle layer, 3.9 m off), its moonlit window behind on the right (on the far layer, 7 m) */
export const cabinPainted = (L: Layers): Film => { const V = lens(0, EYE, 0, 0, -1, 0, FOV);
  const light: CardLight = { amb: "#8a7f86", rim: 0.9, lights: [{ at: [-0.88, 1.86, -3.6], color: "#ffb36a", power: 0.75, reach: 3.2 }, { at: [0.92, 2.0, -7], color: "#8fb0ff", power: 0.55, reach: 6 }] };
  return film("cabin-test-painted", () => paintedSet(L, [0, EYE, 0], FOV, { near: 2.4, mid: 3.9, far: 7 }, NIGHT), V, 0, 0, 0, undefined, light); };

/** the night cabin's weak sky light (the lantern and the moon do the lighting; world/cabin.ts cabinNight) */
export const CABIN_SKY: Sun = { from: [-3, 1.75, 5], color: "#ffd9b0", power: 0.25, sky: "#55649e", ground: "#2a1e18", fill: 0.42, reach: 5 };
/** The 3D version, built to match the painted cabin (Jesper 19 Nov): the same lens at the cabin's open front, the two before the
 *  table, the lantern hung between and behind them as the room's light, the moon through the windows. On the figures: warm from the
 *  lantern's side, cold from the windows', a thin rim. In the air: dust in the lantern's light and in the moon's shafts, the lantern's
 *  glow, its gleam in the polished floor, and a beam close over the lens, out of focus */
export const cabin3d = (sea?: TexImageSource): Film => { const x = CABIN.at[0] + 0.3, y = CABIN.at[1], z = CABIN.at[2] + 3.6, V = lens(x, y + EYE, z, 0, -1, 0, FOV);
  const hang = inCabin(CABIN_NIGHT.hang), lampAt: [number, number, number] = [hang[0], y + CABIN_NIGHT.hang[1], hang[2]];
  const win = inCabin([0.9, 0, -CABIN.d / 2]), winAt: [number, number, number] = [win[0], y + CABIN.winY + CABIN.winH / 2, win[2]], winL = inCabin([-1.25, 0, -CABIN.d / 2]);
  // (Jesper 19 Nov: "lika mörka som rummet där lyktan inte når, med varmt sken på lyktans sida och en tunn kall kant från fönstret": a
  // dark ground light like the room's shadows, the lamp warm on its side and falling off with the distance, the windows an edge only)
  const light: CardLight = { amb: "#3f3a45", rim: 1.0, lights: [{ at: lampAt, color: "#ffa95e", power: 1.25, reach: 1.7, rimK: 0.6 }, { at: winAt, color: "#8fb0ff", power: 0.75, reach: 4, body: 0 }, { at: [winL[0], winAt[1], winL[2]], color: "#8fb0ff", power: 0.6, reach: 4, body: 0 }] };
  return film("cabin-test-3d", () => cabinNight(CABIN_SKY, { sea }), V, x, y, z, (g, T, cam) => {
    const toL = Math.atan2(cam.pos[0] - lampAt[0], cam.pos[2] - lampAt[2]); glow(g, lampAt, 1.1, 1.1, T, toL, 2); glow(g, lampAt, 0.45, 0.45, T, toL, 5);
    // the lantern's rays in the dusty air, spreading down and out over the dark beams and the wall behind them (never over them)
    lampRays(g, lampAt, cam, 1.9, "#ffb268", 0.55, 2, 0.55);
    // (the dust round the lamp hangs above the heads, so that no mote lies on a face)
    dust(g, [lampAt[0], lampAt[1] + 0.02, lampAt[2] - 0.1], 0.42, 55, "#ffc890", T, 1);
    for (const wx of CABIN.win) { const w0 = inCabin([wx, 0, -CABIN.d / 2 + 0.5]); dust(g, [w0[0], y + 0.9, w0[2]], 0.45, 26, "#b6c8ff", T, 3 + wx, 0.014); }
    dust(g, [cam.pos[0] + 0.25, cam.pos[1] + 0.35, cam.pos[2] - 0.9], 0.35, 5, "#ffd2a0", T, 9, 0.05);
    // the moon pooled and gleaming on the polished floor behind their feet
    floorGlint(g, [inCabin([0.75, 0, -0.55])[0], y, inCabin([0.75, 0, -0.55])[2]], cam, "#9fb8ff", 0.8, 0.4);
    // (a thin band at the very top: thicker, the lantern rose into it as the lens went in and went dark)
    foreBeam(g, cam, 0.7, 0.03); }, light, true); };
//   (noShade: the figures take their light from the card light alone. The world's hard shadows on them drew the moon's window as a red
//   square on Blackbeard's coat and hard edges of their own hats over Sir's cheek and Blackbeard's beard)

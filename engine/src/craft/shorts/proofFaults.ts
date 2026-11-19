// THE QUALITY GATE, gate 3 (Jesper, 19 Nov 2026): "Before the checks may approve anything, the build deliberately makes three faults (a
// figure sitting in the air above a seat, an arm locked straight out, a foot inside a sofa) and shows that the checks stop every one.
// This is repeated whenever a check or a set changes." This film is that proof, and nothing else: three shots, each with one fault made
// on purpose, so that `film_info proof-faults body` must FAIL with each of them named. It is never delivered.
import * as THREE from "three";
import type { Film, Shot, Actor } from "../stage/film";
import { lens } from "../stage/staging";
import { POSES } from "../rig";
import { SIR_D } from "../looks";
import { mesh, box, skyDome, sunRig } from "../world/kit";
import { dayLight, DAY } from "./gestureSheet";

const world = () => { const g = new THREE.Group();
  g.add(mesh(box(30, 0.1, 30), "#c9b48e", { at: [0, -0.05, 0] }), mesh(box(30, 4, 0.2), "#e7dcc4", { at: [0, 2, -3], line: 0 }), skyDome("#7fb6ec", "#cfe6fb"));
  const rig = sunRig(DAY, [0, 0, 0]); g.add(rig); g.userData.rig = rig; return g; };
const V = lens(0, 1.0, 3.7, 0, -1, 0, 46), LEN = 2, shots: Shot[] = [];
const sir = (pose: Partial<typeof POSES.stand>, at: [number, number, number] = [0, 0, 0]): Actor => ({ name: "sir", D: SIR_D, h: 1.75, at, heading: V.toward(at[0], at[2], 0), pose: { ...POSES.stand, ...pose }, o: { handL: "relaxed", handR: "relaxed" } });
const add = (id: string, cast: Actor, things?: (g: THREE.Group) => void) => { const a = shots.length * LEN;
  shots.push({ id, a, b: a + LEN, still: 1, cam: () => V.cam, sun: { target: [0, 0.8, 0], reach: 5 }, cast: () => [cast], things: things ? (g) => things(g) : undefined }); };

// A. sitting in the air: a seated man whose hips are about 0.35 m above a low bench under him (the animal trials' gallery bench)
add("A-sits-in-the-air", sir({ py: -0.36, legL: { th: [86, 6], sh: [4, 4] }, legR: { th: [86, 6], sh: [4, 4] }, armL: [[18, 8], [50, 4]], armR: [[18, 8], [50, 4]] }),
  (g) => g.add(mesh(box(1.0, 0.22, 0.3), "#7a5a36", { at: [0, 0.11, -0.3] })));
// B. an arm locked straight out at shoulder height, held the whole shot (two seconds): no pointing hand
add("B-arm-locked-straight-out", sir({ armR: [[0, 90], [0, 90]] }));
// C. a foot inside a sofa: he stands with his left foot in the sofa's seat block
add("C-foot-inside-a-sofa", sir({}), (g) => { g.add(mesh(box(1.4, 0.42, 0.8), "#4a6ea8", { at: [0.75, 0.21, -0.1] }), mesh(box(1.4, 0.5, 0.2), "#3e5f93", { at: [0.75, 0.67, -0.42] })); });

export const PROOF_FAULTS: Film = { id: "proof-faults", fps: 30, seconds: shots.length * LEN, range: [0, 999], sky: "#9cc8f0", world, shots, words: [], hook: { text: [], a: 0, b: 0 }, light: dayLight(DAY.from, [0, 1, 0]) };

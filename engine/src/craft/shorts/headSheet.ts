// The head sheet (the shot library review, round 2, 20 Nov 2026): Sir's head every 10 degrees all the way round, as the rig turns it, with
// his mouth shut and talking, so that the pipe can be seen held in his mouth at every angle. One frame per head: frames 0-35 the mouth shut
// (0, 10, ... 350 degrees from facing the lens), frames 36-71 the same angles talking. scripts/head_sheet.sh lays the frames out as one
// sheet. It is never delivered.
import * as THREE from "three";
import type { Film, Shot } from "../stage/film";
import { lens } from "../stage/staging";
import { POSES } from "../rig";
import { SIR_D } from "../looks";
import { mesh, box, skyDome, sunRig } from "../world/kit";
import { dayLight, DAY } from "./gestureSheet";

const world = () => { const g = new THREE.Group();
  g.add(mesh(box(30, 0.1, 30), "#c9b48e", { at: [0, -0.05, 0] }), mesh(box(30, 4, 0.2), "#e7dcc4", { at: [0, 2, -3], line: 0 }), skyDome("#7fb6ec", "#cfe6fb"));
  const rig = sunRig(DAY, [0, 0, 0]); g.add(rig); g.userData.rig = rig; return g; };
// the lens on the head and shoulders: 3 m off at the head's height
const V = lens(0, 1.5, 3.0, 0, -1, 0, 30), FPS = 30, N = 72;
// one shot per head (each its own scene, so that the mirror image is decided for it as a film's shot decides it, film.ts castOf)
const shots: Shot[] = Array.from({ length: N }, (_, f) => { const deg = (f % 36) * 10, talk = f >= 36;
  return { id: `${deg}-${talk ? "talking" : "shut"}`, a: f / FPS, b: (f + 1) / FPS, still: 0, cam: () => V.cam, sun: { target: [0, 1.5, 0], reach: 4 },
    cast: () => [{ name: "sir", D: SIR_D, h: 1.75, at: [0, 0, 0] as [number, number, number], heading: V.toward(0, 0, deg), pose: { ...POSES.stand }, o: { handL: "relaxed" as const, handR: "relaxed" as const, face: talk ? { mouth: 0.6, smile: 0.3, brow: 0.4 } : { smile: 0.3 } } }] } as Shot; });
export const HEAD_SHEET: Film = { id: "head-sheet", fps: FPS, seconds: N / FPS, range: [0, 999], sky: "#9cc8f0", world, shots, words: [], hook: { text: [], a: 0, b: 0 }, light: dayLight(DAY.from, [0, 1, 0]) };

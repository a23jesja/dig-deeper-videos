// Step D: three daylight stills of a street in Pompeii before the eruption, from the world kit (kit.ts, props.ts, pompeii.ts) with
// the cast of step B standing in it as cards (people.ts). The figures hold, lean on or use the things around them.
//   frame 0 = behind the baker's counter, bread near the lens, Sir Digsworth walking past outside
//   frame 1 = low from the ground past the cart: the soldier leans on a column, Vesuvius at the end of the street
//   frame 2 = from above: the merchant counts coins at his table, the dog pulls at its chain
// PROPS='{"audio":false}' node scripts/stills.mjs PompeiiStills out/craft/pomp_ 0-2 0.5 jpeg
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { setOutline } from "./kit";
import { chainLink } from "./props";
import { pompeiiStreet, POMPEII_SHOTS, DOG_RING, WALK } from "./pompeii";
import { figureCard, beastCard } from "./people";
import { POSES, Pose } from "../rig";
import { Mover } from "../motion";
import { SIR_D, BAKER_D, SOLDIER_D, MERCHANT_D, BOY_D, ROMAN_WOMAN_D } from "../looks";
import { DOG, BEAST_POSES } from "../beast";

/** a moment out of a walk or a run, for a still */
const stride = (run = false, at = 0.5): Pose => { const m = new Mover([0, 0], 0); if (run) m.run(5); else m.walk(3); return m.sample(m.end * at).pose; };
const WALKING = stride(false, 0.47), WALKING2 = stride(false, 0.62), RUNNING = stride(true, 0.5);

const Scene: React.FC = () => {
  const fr = Math.min(useCurrentFrame(), POMPEII_SHOTS.length - 1), { camera } = useThree(), shot = POMPEII_SHOTS[fr];
  const root = useMemo(() => pompeiiStreet(), []);
  const figs = useMemo(() => {
    const g = new THREE.Group(), c = shot.cam, t = shot.tilt ?? 0, add = (m: { mesh: THREE.Mesh }) => g.add(m.mesh);
    // Sir Digsworth walks along the sidewalk past the bakery, his eyes on the bread
    add(figureCard(SIR_D, { ...WALKING, head: [-34, 4, 0] }, { face: { gaze: [-0.5, 0.2], brow: 0.5, smile: 0.6 }, sway: 0.4 }, { at: [3.2, WALK, -0.72], heading: 180, h: 1.8 }, c, t));
    // the baker holds a loaf out over his counter
    add(figureCard(BAKER_D, { ...POSES.stand, lean: 8, armL: [[66, 12], [84, 2]], armR: [[30, 10], [60, -10]], head: [14, -2, 0] }, { prop: "loaf", handL: "grip", face: { smile: 1, brow: 0.3 } }, { at: [4.5, WALK + 0.1, 0.78], heading: -112, h: 1.72 }, c, t));
    // the soldier leans back against his column, arms crossed, one foot over the other
    add(figureCard(SOLDIER_D, { ...POSES.stand, lean: -9, pz: -0.05, legL: { x: 0.04, toe: 20 }, legR: { x: -0.1, z: 0.12, pitch: 26, toe: 10 }, armL: [[24, 6], [104, -46]], armR: [[28, 6], [98, -50]], head: [26, 2, 0] }, { handL: "fist", handR: "fist", face: { lid: 0.4, smile: 0.2 } }, { at: [-2.08, WALK, 2.72], heading: 84, h: 1.8 }, c, t));
    // the merchant sits at his table counting coins
    add(figureCard(MERCHANT_D, { ...POSES.stand, py: -0.42, pz: -0.16, lean: 16, legL: { x: 0.08, z: 0.3, toe: 14 }, legR: { x: 0.08, z: 0.3, toe: 14 }, armL: [[58, 16], [74, -14]], armR: [[64, 12], [84, -8]], head: [0, 20, 0] }, { handR: "point", handL: "open", face: { gaze: [0, 0.8], brow: -0.3, smile: 0.5 } }, { at: [3.5, WALK, 7.72], heading: -42, h: 1.66 }, c, t));
    // the dog strains at its chain toward the street; the chain is real and runs from the ring in the wall to its collar
    const dog = beastCard(DOG, BEAST_POSES.strain, { at: [2.3, WALK, 9.7], heading: -100, h: 0.56 }, c, t); add(dog);
    g.add(chainLink(DOG_RING, dog.collar, 0.07, 18));
    // people on their way down the street
    add(figureCard(ROMAN_WOMAN_D, { ...WALKING2 }, { sway: 0.5, face: { smile: 0.5 } }, { at: [-3.0, WALK, -3.4], heading: 12, h: 1.62 }, c, t));
    add(figureCard(BOY_D, RUNNING, { handL: "fist", handR: "fist", face: { smile: 1, mouth: 0.4, brow: 0.5 } }, { at: [0.7, 0, -6.5], heading: 175, h: 1.2 }, c, t));
    add(figureCard(ROMAN_WOMAN_D, WALKING, { sway: 0.5 }, { at: [3.0, WALK, -9.5], heading: 180, h: 1.6 }, c, t));
    return g;
  }, [fr]);
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.set(...shot.cam); cam.fov = shot.fov; cam.near = 0.1; cam.far = 2500; cam.lookAt(...shot.look); cam.updateProjectionMatrix();
  setOutline(3.4, 1920);
  return (<><primitive object={root} dispose={null} /><primitive object={figs} dispose={null} /></>);
};
export const POMPEII_STILLS = POMPEII_SHOTS.length;
export const PompeiiStills: React.FC = () => (
  <AbsoluteFill style={{ background: "#a9dcff" }}>
    <ThreeCanvas width={1080} height={1920} shadows="percentage" flat gl={{ antialias: true }} camera={{ fov: 55, near: 0.1, far: 2500 }}>
      <Scene />
    </ThreeCanvas>
  </AbsoluteFill>
);

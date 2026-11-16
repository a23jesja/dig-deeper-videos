// Step D: three daylight stills of Griffin's Wharf in Boston on the afternoon of 16 December 1773, hours before the tea went into the
// harbour. The world kit (kit.ts, props.ts, boston.ts) with the cast of step B standing in it as cards (people.ts). The figures hold,
// lean on or use the things around them.
//   frame 0 = from the deck behind stacked tea chests: Sir Digsworth comes up the gangplank
//   frame 1 = low from the planks past a cask and a coil of rope: the customs officer leans on a lamp post, masts and spire beyond
//   frame 2 = from the rigging: the ship's owner counts coins on a cask, his dog pulls at its rope
// PROPS='{"audio":false}' node scripts/stills.mjs BostonStills out/craft/bost_ 0-2 0.5 jpeg         (props: night: true = the evening light)
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, getInputProps, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { setOutline, rod } from "./kit";
import { coins, barrel, ring } from "./props";
import { bostonWharf, DECK } from "./boston";
import { figureCard, beastCard } from "./people";
import { POSES, Pose } from "../rig";
import { Mover } from "../motion";
import { SIR_D, CUSTOMS_D, SHIPOWNER_D, SAILOR_D, DOCKHAND_D, TOWNSWOMAN_D, BOY_D } from "../looks";
import { DOG, BEAST_POSES } from "../beast";

export type Shot = { cam: [number, number, number]; look: [number, number, number]; fov: number; tilt?: number };
export const BOSTON_SHOTS: Shot[] = [
  { cam: [10.55, 2.95, 4.3], look: [5.6, 1.15, 0.9], fov: 52 },
  { cam: [2.05, 0.32, 9.1], look: [2.9, 2.5, -8], fov: 56 },
  { cam: [11.2, 6.6, 0.9], look: [12.3, 1.8, -2.4], fov: 50, tilt: 0.55 },
];
const stride = (run = false, at = 0.5): Pose => { const m = new Mover([0, 0], 0); if (run) m.run(5); else m.walk(3); return m.sample(m.end * at).pose; };
const WALK_A = stride(false, 0.47), WALK_B = stride(false, 0.62), RUN = stride(true, 0.5);

const Scene: React.FC = () => {
  const fr = Math.min(useCurrentFrame(), BOSTON_SHOTS.length - 1), { camera } = useThree(), ip = getInputProps() as { night?: boolean; shot?: Shot }, shot = ip.shot ?? BOSTON_SHOTS[fr], night = !!ip.night;
  const root = useMemo(() => bostonWharf({ night }), [night]);
  const figs = useMemo(() => {
    const g = new THREE.Group(), c = shot.cam, t = shot.tilt ?? 0, add = (m: { mesh: THREE.Mesh }) => g.add(m.mesh);
    // Sir Digsworth comes up the gangplank, one hand on the rope, looking up at the ship
    add(figureCard(SIR_D, { ...WALK_A, lean: 9, armR: [[58, 22], [96, 6]], head: [16, -12, 0] }, { handR: "grip", face: { gaze: [0.3, -0.5], brow: 0.6, smile: 0.5 }, sway: 0.3 }, { at: [7.75, 0.42, 2.25], heading: 62, h: 1.8 }, c, t));
    // a dock hand carries a chest of tea down the wharf behind him
    add(figureCard(DOCKHAND_D, { ...WALK_B, lean: -6, armL: [[30, 10], [98, -10]], armR: [[30, 10], [98, -10]] }, { handL: "grip", handR: "grip", prop: "loaf" as never, face: { brow: -0.4, lid: 0.2 } }, { at: [4.7, 0, -1.6], heading: 205, h: 1.74 }, c, t));
    // the customs officer leans back against his lamp post, arms crossed, watching the ship
    add(figureCard(CUSTOMS_D, { ...POSES.stand, lean: -8, pz: -0.05, legL: { x: 0.04, toe: 20 }, legR: { x: -0.1, z: 0.12, pitch: 26, toe: 10 }, armL: [[24, 6], [104, -46]], armR: [[28, 6], [98, -50]], head: [-30, 2, 0] }, { handL: "fist", handR: "fist", face: { lid: 0.4, brow: -0.5, gaze: [-0.7, 0], smile: -0.3 } }, { at: [2.72, 0, 5.52], heading: 150, h: 1.8 }, c, t));
    // the ship's owner sits on a chest on deck and counts coins on a cask
    add(figureCard(SHIPOWNER_D, { ...POSES.stand, py: -0.42, pz: -0.16, lean: 15, legL: { x: 0.08, z: 0.3, toe: 14 }, legR: { x: 0.08, z: 0.3, toe: 14 }, armL: [[58, 16], [74, -14]], armR: [[64, 12], [84, -8]], head: [0, 22, 0] }, { handR: "point", handL: "open", face: { gaze: [0, 0.8], smile: 0.7, brow: 0.2 } }, { at: [12.95, DECK + 0.05, -2.75], heading: 165, h: 1.68 }, c, t));
    // his dog strains at its rope toward the gulls; the rope is real and runs from the ring on the capstan to its collar
    const dog = beastCard(DOG, BEAST_POSES.strain, { at: [11.0, DECK + 0.05, -0.55], heading: 250, h: 0.56 }, c, t); add(dog);
    g.add(rod([12.2, DECK + 0.5, 2.75], dog.collar, 0.02, "#dcc38a", { line: 0.5 }), ring([12.2, DECK + 0.5, 2.72]));
    // a sailor hauls on the hoist that lifts a chest out of the hold
    add(figureCard(SAILOR_D, { ...POSES.stand, lean: -24, pz: -0.22, py: -0.1, legL: { x: 0.03, z: 0.34, toe: 8 }, legR: { x: 0.03, z: -0.12, toe: 20 }, armL: [[62, 8], [70, 0]], armR: [[72, 8], [78, 0]], head: [0, -14, 0] }, { handL: "grip", handR: "grip", face: { brow: -1, lid: 0.3, mouth: 0.3 } }, { at: [13.9, DECK + 0.05, -6.0], heading: 240, h: 1.76 }, c, t));
    // the town goes about its day at the head of the wharf
    add(figureCard(TOWNSWOMAN_D, WALK_B, { sway: 0.5, face: { smile: 0.5 } }, { at: [-1.6, 0, -6.5], heading: 10, h: 1.6 }, c, t));
    add(figureCard(BOY_D, RUN, { handL: "fist", handR: "fist", face: { smile: 1, mouth: 0.4, brow: 0.5 } }, { at: [4.6, 0, -9.5], heading: 20, h: 1.18 }, c, t));
    add(figureCard(DOCKHAND_D, WALK_A, { handL: "fist", handR: "fist" }, { at: [-3.8, 0, -13], heading: 180, h: 1.74 }, c, t));
    return g;
  }, [fr, night]);
  // the cask the owner counts on, with his coins
  const extra = useMemo(() => { const g = new THREE.Group(), b = barrel(0.8, 0.34); b.position.set(12.6, DECK + 0.05, -2.2); const cn = coins(30, 5); cn.position.set(12.6, DECK + 0.86, -2.2); cn.scale.setScalar(1.5); g.add(b, cn); return g; }, []);
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.set(...shot.cam); cam.fov = shot.fov; cam.near = 0.1; cam.far = 2500; cam.lookAt(...shot.look); cam.updateProjectionMatrix();
  setOutline(3.4, 1920);
  return (<><primitive object={root} dispose={null} /><primitive object={extra} dispose={null} /><primitive object={figs} dispose={null} /></>);
};
export const BOSTON_STILLS = BOSTON_SHOTS.length;
export const BostonStills: React.FC = () => (
  <AbsoluteFill style={{ background: "#b4ddf7" }}>
    <ThreeCanvas width={1080} height={1920} shadows="percentage" flat gl={{ antialias: true }} camera={{ fov: 55, near: 0.1, far: 2500 }}>
      <Scene />
    </ThreeCanvas>
  </AbsoluteFill>
);

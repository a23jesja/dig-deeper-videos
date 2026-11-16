// Step D: three daylight stills of a street in Pompeii before the eruption, from the world kit (kit.ts, props.ts, pompeii.ts).
//   frame 0 = behind the baker's counter, 1 = low past the cart toward the portico and Vesuvius, 2 = from above over the merchant's table
// PROPS='{"audio":false}' node scripts/stills.mjs PompeiiStills out/craft/pomp_ 0-2 0.5 jpeg
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { card, setOutline } from "./kit";
import { pompeiiStreet, POMPEII_SHOTS, POMPEII_MARKS } from "./pompeii";
import { Ink } from "../ink";
import { solve, POSES, Pose, Props } from "../rig";
import { Design, FigOpts } from "../designs/common";
import { DIRECTIONS } from "../designs";

const tall = (P: Props) => P.thigh + P.shin + P.ankle + P.spine + P.neck + P.head * 1.2;
/** a figure of the cast as a card: `heading` is the way it faces in the world, `cam` where it is seen from, Hm its height in metres */
export const figureCard = (D: Design, pose: Pose, o: FigOpts, at: readonly number[], cam: number[], Hm = 1.75, tilt = 0) => {
  const P = D.props(o.who ?? "sir"), T = tall(P), s = 0.9, cw = Math.round(T * 1.5 * s), ch = Math.round(T * 1.22 * s), feet = 0.96;
  const az = Math.atan2(cam[0] - at[0], cam[2] - at[2]), yaw = at[3] - (az * 180) / Math.PI;
  const m = card(`${D.id}${at.join()}`, cw, ch, (cw / (T * s)) * Hm, (ch / (T * s)) * Hm, feet, (g) => { g.translate(cw / 2, ch * feet); g.scale(s, s); D.draw(new Ink(g, D.ol), solve(P, pose, yaw), o); });
  m.position.set(at[0], at[1], at[2]); m.rotation.order = "YXZ"; m.rotation.y = az; m.rotation.x = -tilt * Math.atan2(cam[1] - at[1] - Hm * 0.5, Math.hypot(cam[0] - at[0], cam[2] - at[2]));
  return m;
};

const Scene: React.FC = () => {
  const fr = Math.min(useCurrentFrame(), POMPEII_SHOTS.length - 1), { camera } = useThree(), shot = POMPEII_SHOTS[fr];
  const root = useMemo(() => pompeiiStreet(), []);
  const figs = useMemo(() => {
    const g = new THREE.Group(), D = DIRECTIONS[3].D, M = POMPEII_MARKS, t = shot.tilt ?? 0;
    g.add(figureCard(D, { ...POSES.point, armR: [[30, 8], [70, 4]], lean: 5 }, { who: "sir" }, M.sirWalk, shot.cam, 1.78, t));
    g.add(figureCard(D, { ...POSES.stand, roll: -7, px: 0.03, armL: [[20, 6], [100, -40]], armR: [[24, 6], [96, -44]] }, { who: "baker" }, M.soldier, shot.cam, 1.72, t));
    g.add(figureCard(D, { ...POSES.stand, lean: 16, armL: [[40, 10], [86, -6]], armR: [[46, 10], [80, -6]], head: [0, 16, 0] }, { who: "baker", handR: "point", face: { gaze: [0, 0.7] } }, M.merchant, shot.cam, 1.7, t));
    g.add(figureCard(D, { ...POSES.stand, armL: [[20, 12], [78, -8]] }, { who: "baker", prop: "loaf", handL: "grip" }, M.baker, shot.cam, 1.7, t));
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

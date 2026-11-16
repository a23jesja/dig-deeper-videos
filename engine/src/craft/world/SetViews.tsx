// Looks at a set of the world kit from a few cameras, with no figures: for building and checking a world before a film is staged in it.
// PROPS='{"audio":false,"set":"rome"}' node scripts/stills.mjs SetViews out/craft/set_ 0-5 0.5 jpeg
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, getInputProps, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { setOutline, aimSun } from "./kit";
import { romeStreet } from "./rome";

type View = { pos: [number, number, number]; look: [number, number, number]; fov: number; reach?: number };
const SETS: Record<string, { make: () => THREE.Group; views: View[] }> = {
  rome: { make: romeStreet, views: [
    { pos: [-0.6, 1.5, 9.5], look: [1.6, 1.3, 0], fov: 60 },          // down the street toward the amphitheatre, the corner on the right
    { pos: [0.3, 1.35, 6.8], look: [3.4, 1.0, 3.2], fov: 55 },        // the corner: the jar, the table, the laundry behind
    { pos: [2.4, 1.6, -0.2], look: [8, 1.0, -0.6], fov: 60 },         // into the laundry
    { pos: [0.8, 1.0, -6.5], look: [-0.6, 2.2, 12], fov: 60 },        // back up the street toward the temple
    { pos: [-1.2, 3.0, 4.8], look: [3.2, 0.9, 3.8], fov: 50 },        // from above (25 degrees) onto the corner
    { pos: [1.0, 0.45, 1.5], look: [-3.2, 1.9, -1.2], fov: 62 },      // low, toward the portico
  ] },
};
export const SET_VIEWS = 6;
const Scene: React.FC = () => {
  const fr = useCurrentFrame(), { camera } = useThree(), p = getInputProps() as { set?: string }, S = SETS[p.set ?? "rome"], v = S.views[Math.min(fr, S.views.length - 1)];
  const root = useMemo(() => S.make(), []);
  const c = camera as THREE.PerspectiveCamera; c.position.set(...v.pos); c.fov = v.fov; c.near = 0.1; c.far = 3000; c.lookAt(...v.look); c.updateProjectionMatrix();
  aimSun(root.userData.rig, v.look, v.reach ?? 10); setOutline(3.4, 1920);
  return <primitive object={root} dispose={null} />;
};
export const SetViews: React.FC = () => (
  <AbsoluteFill style={{ background: "#a9dcff" }}>
    <ThreeCanvas width={1080} height={1920} shadows="soft" flat gl={{ antialias: true }} camera={{ fov: 55, near: 0.1, far: 3000 }}><Scene /></ThreeCanvas>
  </AbsoluteFill>
);

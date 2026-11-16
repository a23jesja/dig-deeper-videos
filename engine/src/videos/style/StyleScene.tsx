// "The guard discovers the empty wall" (the Louvre, 1911) in the decided look: the stick guard in the toon-shaded,
// outlined Salon Carre. Same story beats as three3d/ThreeWay3 (the walk, feet and timing come from guard.ts):
//   0-145   the camera travels with the guard, in front of him, as he strolls past the pictures, stops and looks
//   146-221 cut-in on the four bare hooks, seen from where he stands
//   222-299 on the guard, close: he spins round to the camera, hands up, glances left and right, ends on us
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { buildLouvre } from "./world";
import { bodyAt, key, walkAt } from "../three3d/guard";
import { InkPass, noInkFallback } from "../emu/ink";
import { Arm, Face, makeGuard, Pose } from "./stick";
import { loadAssets } from "./StyleSheet";

const W = 1920, H = 1080;
type Assets = Awaited<ReturnType<typeof loadAssets>>;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const ease = (t: number) => { t = clamp01(t); return t * t * (3 - 2 * t); };
type V3 = [number, number, number];
const mix = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/** the guard's whole pose at a frame */
export const guardPose = (f: number): Pose => {
  const { b, feet, sway, hip, speed } = walkAt(f), th = (b.yaw * Math.PI) / 180;
  const lx = Math.cos(th), lz = -Math.sin(th), fx = Math.sin(th), fz = Math.cos(th);
  const px = b.x + lx * sway, pz = b.z + lz * sway;
  const shock = key(f, [[128, 0], [137, 0.45], [160, 0.6], [214, 0.7], [218, 1], [300, 1]]);
  const up = key(f, [[214, 0], [226, 1.12], [232, 0.97], [237, 1], [262, 1], [278, 0], [300, 0]]);
  const shrug = key(f, [[262, 0], [278, 1], [300, 1]]);
  const headYaw = key(f, [[0, -8], [112, -8], [124, -6], [129, -10], [137, 36], [141, 30], [152, 30], [166, 0], [213, 0], [240, 0], [246, 5], [255, -30], [266, -30], [270, -32], [281, 28], [288, 28], [296, 0], [300, 0]]);
  const headPitch = key(f, [[0, 0.02], [118, 0.02], [124, 0.08], [131, -0.02], [137, -0.12], [146, -0.14], [168, -0.22], [213, -0.2], [224, -0.02], [232, 0.1], [240, 0.0], [300, 0.0]]);
  const headRoll = key(f, [[0, 0], [118, 0], [125, 0.1], [131, 0], [137, -0.1], [166, 0], [300, 0]]);
  const twist = key(f, [[128, 0], [138, 24], [146, 24], [166, 0], [246, 0], [255, -10], [270, -10], [281, 10], [296, 0], [300, 0]]);
  const blink = Math.max(key(f, [[40, 0], [42, 1], [45, 0]]), key(f, [[96, 0], [98, 1], [101, 0]]), key(f, [[119, 0], [121, 1], [123, 0], [125, 1], [128, 0]]));
  const leanBack = key(f, [[214, 0], [226, 0.16], [236, 0.06], [300, 0.04]]);
  const lookX = key(f, [[128, 0], [134, 1], [146, 0.6], [166, 0], [246, 0], [253, -1], [268, -1], [279, 1], [288, 1], [296, 0], [300, 0]]);
  const open = key(f, [[128, 0], [137, 0.35], [160, 0.5], [214, 0.6], [219, 1.1], [226, 1], [262, 1], [276, 0.7], [300, 0.75]]);

  const arms = [0, 1].map((i): Arm => {
    const opp = feet[1 - i], fore = (opp.x - px) * fx + (opp.z - pz) * fz;
    const phi = THREE.MathUtils.clamp(fore * 1.7, -0.55, 0.6), al = 0.3, be = 0.32 + 0.55 * Math.max(0, phi);
    const shake = Math.sin(f * 1.9 + i) * 0.05 * clamp01(up) * (1 - shrug);
    let u: V3 = [Math.sin(al), -Math.cos(al) * Math.cos(phi), Math.cos(al) * Math.sin(phi)];
    let v: V3 = [Math.sin(al * 0.4), -Math.cos(phi + be), Math.sin(phi + be)];
    u = mix(mix(u, [0.78, 0.56, 0.12], up), [0.55, -0.8, 0.12], shrug);
    v = mix(mix(v, [0.3 + shake, 1, 0.22], up), [0.8, 0.42, 0.5], shrug);
    return { u, v };
  }) as [Arm, Arm];
  const face: Face = {
    eye: (1 + 0.3 * shock) * (1 - 0.92 * blink), pupil: 1, lookX, lookY: 0, browY: [shock, shock], browTilt: [-0.28 * shock, -0.28 * shock],
    open, smile: 0.3 * (1 - clamp01(shock * 3)), width: lerp(1, 0.85, clamp01(open)),
  };
  return {
    x: px, z: pz, yaw: b.yaw, hip, lean: 0.05 * speed - leanBack + 0.03 * shrug, roll: sway * 1.6, twist: twist * 0.5,
    stretch: 1 + 0.05 * up * (1 - shrug),
    feet: [feet[0], feet[1]], arms, head: { yaw: headYaw, pitch: headPitch, roll: headRoll }, face,
  };
};

const CUT = 146, CUT2 = 222; // the wide shot ends while he stares at the wall; he steps back during the cut-in
const cameraAt = (f: number, cam: THREE.PerspectiveCamera) => {
  if (f < CUT) {
    // travels with him from in front, looking back along the wall, so his face is in view the whole way and when he looks at the wall
    const gx = bodyAt(Math.min(f, 128)).x, t = clamp01(f / 128);
    cam.position.set(gx + lerp(2.4, 2.0, t), 1.3, lerp(2.95, 2.6, ease(f / CUT)));
    cam.fov = 46;
    cam.lookAt(gx - 0.2, 0.86, 0.7); // aimed past him at the wall, so the wall fills the picture behind him
  } else if (f < CUT2) {
    const t = (f - CUT) / (CUT2 - 1 - CUT);
    cam.position.set(lerp(0.34, 0.24, t), lerp(1.5, 1.53, t), lerp(1.3, 1.15, t));
    cam.fov = 56;
    cam.lookAt(0, 1.6, 0);
  } else {
    const t = ease((f - CUT2) / (299 - CUT2));
    cam.position.set(lerp(0.5, 0.6, t), 1.32, lerp(4.0, 3.8, t));
    cam.fov = 36;
    cam.lookAt(0.8, 1.27, 1.5);
  }
  cam.near = 0.1; cam.far = 80;
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld(true);
};

const Inner: React.FC<{ assets: Assets; ready: () => void }> = ({ assets, ready }) => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const world = useMemo(() => {
    const stage = buildLouvre(assets);
    const guard = makeGuard();
    stage.root.add(guard.root);
    noInkFallback(stage.root);
    return { stage, guard };
  }, [assets]);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, cam, { widthNear: 7.5, widthFar: 4.5, distNear: 3, distFar: 30 }),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
  }), [scene, cam]);
  useEffect(() => () => fx.ink.dispose(), [fx]);
  useMemo(() => { scene.background = new THREE.Color(0x1a0f0c); }, [scene]);
  useEffect(() => { ready(); }, [ready]);

  world.guard.pose(guardPose(f));
  world.guard.root.visible = !(f >= CUT && f < CUT2); // the cut-in is seen from where he stands
  cameraAt(f, cam);
  return (
    <>
      <primitive object={world.stage.root} dispose={null} />
      <EffectComposer multisampling={4}>
        <primitive object={fx.ink} dispose={null} />
        <primitive object={fx.tone} dispose={null} />
      </EffectComposer>
    </>
  );
};

export const StyleScene: React.FC = () => {
  const [handle] = useState(() => delayRender("style scene: loading models and paintings", { timeoutInMilliseconds: 120000 }));
  const [assets, setAssets] = useState<Assets | null>(null);
  useEffect(() => {
    let dead = false;
    loadAssets().then((a) => { if (!dead) setAssets(a); }).catch((e) => { console.error(e); throw e; });
    return () => { dead = true; };
  }, []);
  const ready = useMemo(() => () => continueRender(handle), [handle]);
  return (
    <AbsoluteFill style={{ background: "#1a0f0c" }}>
      {assets && (
        <ThreeCanvas width={W} height={H} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }} camera={{ fov: 34, near: 0.1, far: 80 }}>
          <Inner assets={assets} ready={ready} />
        </ThreeCanvas>
      )}
    </AbsoluteFill>
  );
};

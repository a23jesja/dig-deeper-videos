// Character sheet for the decided look: the guard and Sir Digsworth as stickmen with volume, standing in the
// Salon Carre set of variant 3 (muted wall, the painted pictures of variant 1 in the frames, toon shading and
// black outlines on everything). One still per frame:
//   0      line-up: guard front, guard side, Sir Digsworth front, Sir Digsworth side
//   1-3    guard, close: neutral, shock, suspicious
//   4-6    Sir Digsworth, close: neutral, glee, suspicious
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MODEL_IDS, Models } from "../three3d/stage";
import { buildLouvre } from "./world";
import { InkPass, noInkFallback } from "../emu/ink";
import { FACES, Face, mirror, makeGuard, makeSir, SIR_ARMS, Stick } from "./stick";

export { WALL } from "./world";
const W = 1920, H = 1080, Z = 2.2;
type Assets = { models: Models; paints: THREE.Texture[] };
export const loadAssets = async (): Promise<Assets> => {
  const gl = new GLTFLoader(), tl = new THREE.TextureLoader();
  const [models, paints] = await Promise.all([
    Promise.all(MODEL_IDS.map((id) => gl.loadAsync(staticFile(`three3d/polyhaven/${id}/${id}.gltf`)).then((g) => [id, g.scene] as const))),
    Promise.all([0, 1, 2, 3, 4, 5, 6].map((i) => tl.loadAsync(staticFile(`style/paint/p${i}.jpg`)).then((t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }))),
  ]);
  return { models: Object.fromEntries(models), paints };
};

const CLOSE: [number, Face][] = [[0, FACES.neutral], [0, FACES.shock], [0, FACES.suspicious], [1, FACES.neutral], [1, FACES.glee], [1, mirror(FACES.suspicious)]];
const CX = -2.35; // close-ups stand between two pictures
const XS = [-2.45, -1.3, -0.05, 1.15]; // guard front, guard side, Sir front, Sir side

const Inner: React.FC<{ assets: Assets; ready: () => void }> = ({ assets, ready }) => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  const world = useMemo(() => {
    const stage = buildLouvre(assets);
    const figs: Stick[] = [makeGuard(), makeGuard(), makeSir(), makeSir()];
    for (const s of figs) stage.root.add(s.root);
    noInkFallback(stage.root);
    return { stage, figs };
  }, [assets]);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, cam, { widthNear: 7.5, widthFar: 4.5, distNear: 3, distFar: 30 }),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
  }), [scene, cam]);
  useEffect(() => () => fx.ink.dispose(), [fx]);
  useMemo(() => { scene.background = new THREE.Color(0x1a0f0c); }, [scene]);
  useEffect(() => { ready(); }, [ready]);

  const close = f >= 1 ? CLOSE[Math.min(f, 6) - 1] : null;
  world.figs.forEach((s, i) => {
    const sir = i >= 2, side = i % 2 === 1;
    s.root.visible = !close || i === close[0] * 2;
    s.pose({ x: close ? CX : XS[i], z: Z, yaw: side ? 90 : 0, head: side ? { yaw: sir ? -43 : -25 } : undefined, arms: sir ? SIR_ARMS : undefined, face: close && s.root.visible ? close[1] : FACES.neutral });
  });
  if (close) { cam.position.set(CX + 0.1, 1.45, Z + 2.25); cam.fov = 30; cam.lookAt(CX, 1.38, Z); }
  else { cam.position.set(-0.65, 1.2, Z + 4.75); cam.fov = 34; cam.lookAt(-0.65, 1.02, Z); }
  cam.near = 0.1; cam.far = 80;
  cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
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

export const StyleSheet: React.FC = () => {
  const [handle] = useState(() => delayRender("style: loading models and paintings", { timeoutInMilliseconds: 120000 }));
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

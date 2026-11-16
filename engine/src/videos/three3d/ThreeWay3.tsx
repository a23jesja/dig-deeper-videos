// "The guard discovers the empty wall" (the Louvre, 1911), variant 3: real 3D.
// CC0 models (Poly Haven) dress the room, the guard is a primitive-built 3D figure (guard.ts), signs are canvas
// textures, the light is designed for the scene (stage.ts). Three shots, hard cuts:
//   0-169   wide, slow dolly to the right with the guard (parallax: plant and bench in front, rope, wall, far room)
//   170-214 cut-in on the four bare hooks, seen from where he stands
//   215-299 back on the guard: he spins round, hands up, looks left and right
// Everything is a pure function of the frame. Models load behind delayRender.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { MODEL_IDS, Models, Stage } from "./stage";
import { Guard } from "./guard";

const W = 1920, H = 1080;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };

const cameraAt = (f: number, cam: THREE.PerspectiveCamera) => {
  if (f < 170) {
    const t = f / 169, e = lerp(t, ease(t), 0.5);
    cam.position.set(lerp(-1.35, 1.25, e), 1.45, lerp(7.5, 7.0, e));
    cam.fov = 34;
    cam.lookAt(lerp(-1.1, 1.3, e), 1.62, 0);
  } else if (f < 215) {
    const t = (f - 170) / 44;
    cam.position.set(lerp(0.34, 0.24, t), lerp(1.5, 1.53, t), lerp(1.3, 1.15, t));
    cam.fov = 56;
    cam.lookAt(0, 1.6, 0);
  } else {
    const t = ease((f - 215) / 84);
    cam.position.set(lerp(-0.6, -0.42, t), 1.38, lerp(5.25, 4.95, t));
    cam.fov = 36;
    cam.lookAt(0.3, 1.14, 0.6);
  }
  cam.near = 0.1; cam.far = 80;
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld(true);
};

const Inner: React.FC<{ models: Models; ready: () => void }> = ({ models, ready }) => {
  const f = useCurrentFrame();
  const { camera, scene, gl } = useThree();
  const world = useMemo(() => {
    const stage = new Stage(models), guard = new Guard();
    stage.root.add(guard.root);
    return { stage, guard };
  }, [models]);
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.32;
    scene.background = new THREE.Color(0x1a0f0c);
    pm.dispose();
  }, [gl, scene]);
  useEffect(() => { ready(); }, [ready]);
  world.guard.update(f);
  world.guard.setGhost(f >= 170 && f < 215);
  cameraAt(f, camera as THREE.PerspectiveCamera);
  return <primitive object={world.stage.root} dispose={null} />;
};

export const ThreeWay3: React.FC = () => {
  const [handle] = useState(() => delayRender("three3d: loading CC0 models", { timeoutInMilliseconds: 120000 }));
  const [models, setModels] = useState<Models | null>(null);
  useEffect(() => {
    let dead = false;
    const loader = new GLTFLoader();
    Promise.all(MODEL_IDS.map((id) => loader.loadAsync(staticFile(`three3d/polyhaven/${id}/${id}.gltf`)).then((g) => [id, g.scene] as const)))
      .then((all) => { if (!dead) setModels(Object.fromEntries(all)); })
      .catch((e) => { console.error(e); throw e; });
    return () => { dead = true; };
  }, []);
  const ready = useMemo(() => () => continueRender(handle), [handle]);
  return (
    <AbsoluteFill style={{ background: "#1a0f0c" }}>
      {models && (
        <ThreeCanvas width={W} height={H} shadows gl={{ antialias: true, powerPreference: "high-performance" }} camera={{ fov: 34, near: 0.1, far: 80 }}>
          <Inner models={models} ready={ready} />
        </ThreeCanvas>
      )}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(20,6,2,0.38) 100%)" }} />
    </AbsoluteFill>
  );
};

// Check pictures for the environment kit: one still per part (composition EnvKit, frames 0-9).
//   0 trees   1 grass and ground   2 road, cobbles, deck   3-5 sky: day, dusk, night   6 water   7 weather and particles
//   8 lights that light   9 clear shadows from one light
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { Part, SkyMood, SKY, keyLight, loadModels, makeBulbSign, makeDebris, makeDust, makeFire, makeGrass, makeLantern, makeRain, makeRocket, makeSky, makeSmoke, makeSnow, makeSparks, makeTree, makeWater, makeWindow, model, surfacePlane } from "./index";

type Built = { root: THREE.Group; parts: Part[]; cam: { pos: [number, number, number]; look: [number, number, number]; fov: number }; t: number; follow?: (p: THREE.Vector3) => void };
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const std = (c: string, rough = 0.9) => new THREE.MeshStandardMaterial({ color: c, roughness: rough });
const boxM = (w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y + h / 2, z); b.castShadow = true; b.receiveShadow = true; return b; };
const base = (mood: SkyMood, sun: THREE.Vector3, sunI: number, o: { hemi?: number; size?: number; center?: THREE.Vector3 } = {}) => {
  const root = new THREE.Group(), parts: Part[] = [], sky = makeSky(mood, sun), L = SKY[mood];
  const key = keyLight(sun, L.sun, sunI, { size: o.size ?? 26, center: o.center });
  root.add(sky.obj, key.obj, new THREE.HemisphereLight(L.mid, mood === "night" ? "#10121c" : "#6a5a48", o.hemi ?? (mood === "night" ? 0.35 : 0.9)));
  parts.push(sky);
  return { root, parts, sky };
};
const SCENES: (() => Built)[] = [
  () => { // 0 trees
    const sun = V(-0.55, 0.62, 0.5), { root, parts, sky } = base("day", sun, 3.4);
    root.add(surfacePlane("soil", -40, 40, -40, 40, 6));
    const g = makeGrass(-16, 16, -14, 12, 3, { blades: 60000, height: 0.3 }); root.add(g.obj); parts.push(g);
    for (const [x, z, h, s, n] of [[-2.2, 0, 8.5, 1, 9000], [5.6, -5, 6.2, 2, 6000], [-9.5, -8, 7.2, 3, 6000]] as number[][]) { const t = makeTree(s, { height: h, leaves: n }); t.obj.position.set(x, 0, z); root.add(t.obj); parts.push(t); }
    return { root, parts, cam: { pos: [3.5, 2.0, 13.5], look: [-0.8, 3.6, 0], fov: 42 }, t: 2.3, follow: sky.follow };
  },
  () => { // 1 grass and ground
    const sun = V(0.2, 0.32, -0.92), { root, parts, sky } = base("day", sun, 3.6);
    root.add(surfacePlane("soil", -40, 40, -40, 40, 5));
    const path = (x: number, z: number) => Math.abs(x - 0.9 * Math.sin(z * 0.35) + 0.4) > 0.75;
    const g = makeGrass(-9, 9, -16, 4, 5, { blades: 140000, height: 0.5, mask: path }); root.add(g.obj); parts.push(g);
    const t = makeTree(7, { height: 6, leaves: 5000 }); t.obj.position.set(-5.5, 0, -12); root.add(t.obj); parts.push(t);
    return { root, parts, cam: { pos: [0.6, 0.55, 3.6], look: [-0.2, 0.5, -3], fov: 46 }, t: 1.7, follow: sky.follow };
  },
  () => { // 2 road, cobbles, planked deck
    const sun = V(-0.75, 0.38, 0.35), { root, parts, sky } = base("day", sun, 3.4);
    root.add(surfacePlane("road", -30, -3.2, -30, 12, 7), surfacePlane("cobbles", -3.2, 3.6, -30, 12, 3.2), surfacePlane("planks", 3.6, 30, -30, 12, 3.4));
    root.add(boxM(0.25, 0.16, 42, -3.2, 0, -9, std("#9a968c")), boxM(0.18, 0.1, 42, 3.6, 0, -9, std("#6b4a2e")));
    root.add(model("covered_car", -6.6, 0, -6.5, { height: 1.5, yaw: 0.25 }), model("Barrel_01", -0.6, 0, -2.2, { height: 0.95 }), model("wooden_crate_02", 1.2, 0, -3.4, { height: 0.7, yaw: 0.5 }), model("painted_wooden_bench", 6.3, 0, -4.2, { height: 0.95, yaw: -0.5 }), model("vintage_suitcase", 5.0, 0, -1.4, { height: 0.55, yaw: 0.9 }));
    return { root, parts, cam: { pos: [0.6, 1.25, 4.6], look: [0.2, 0.25, -4.5], fov: 50 }, t: 1, follow: sky.follow };
  },
  ...(["day", "dusk", "night"] as SkyMood[]).map((mood) => (): Built => { // 3-5 sky
    const sun = mood === "dusk" ? V(0.25, 0.1, -0.96) : mood === "night" ? V(-0.4, 0.42, -0.8) : V(0.5, 0.55, -0.67), { root, parts, sky } = base(mood, sun, mood === "night" ? 0.7 : 2.6);
    root.add(surfacePlane("soil", -200, 200, -200, 200, 8));
    const g = makeGrass(-14, 14, -26, 2, 9, { blades: 50000, height: 0.35 }); root.add(g.obj); parts.push(g);
    const t = makeTree(4, { height: 7, leaves: 5000 }); t.obj.position.set(-6.5, 0, -16); root.add(t.obj); parts.push(t);
    return { root, parts, cam: { pos: [0, 1.5, 5], look: [0, 6.2, -20], fov: 60 }, t: 4, follow: sky.follow };
  }),
  () => { // 6 water
    const sun = V(0.12, 0.16, -0.98), { root, parts, sky } = base("dusk", sun, 2.2);
    const w = makeWater({ size: 900, deep: "#0c2440", shallow: "#2a6f8c", skyTop: SKY.dusk.mid, skyHor: SKY.dusk.hor, sunCol: "#ffd9a0", sunDir: sun, amp: 0.28, fogCol: SKY.dusk.hor, fogFar: 520 });
    root.add(w.obj); parts.push(w);
    root.add(surfacePlane("planks", -3.2, 3.2, -1, 14, 3)); (root.children[root.children.length - 1] as THREE.Mesh).position.y = 0.9;
    for (const x of [-3, 3]) for (const z of [0, 4, 8, 12]) root.add(boxM(0.28, 2.4, 0.28, x, -1.2, z, std("#5a4632")));
    const buoy = model("lifebuoy", -6.5, 0.05, -5, { height: 0.9, tilt: -1.2 }); root.add(buoy);
    [[-3, 2.1, 0.2], [3, 2.1, 0.2]].forEach(([x, y, z], i) => { const l = makeLantern(V(x, y, z), { post: 1.2, power: 30 }); root.add(l.obj); parts.push(l); w.lamps[i].set(x, y, z, 14); w.lampCols[i].set("#ffb45e"); });
    return { root, parts, cam: { pos: [0.9, 2.5, 13.5], look: [-0.6, 0.9, -8], fov: 50 }, t: 3.1, follow: sky.follow };
  },
  () => { // 7 weather and particles
    const sun = V(-0.3, 0.6, 0.6), { root, parts, sky } = base("dusk", sun, 1.5, { hemi: 0.6 });
    root.add(surfacePlane("cobbles", -40, 40, -40, 14, 3.2));
    root.add(boxM(44, 9, 1, 0, 0, -13, std("#7d7468")));
    const rain = makeRain({ x0: -13, x1: -3.2, y0: 0, y1: 9, z0: -11, z1: 4 }, 5200), snow = makeSnow({ x0: 3.6, x1: 13, y0: 0, y1: 9, z0: -11, z1: 4 }, 3600);
    const fire = makeFire(V(0, 0.95, -3.5), 0.9, { power: 110 }), smoke = makeSmoke(V(0, 1.6, -3.5), 26, { rise: 7, lean: V(0.3, 0, 0) });
    const sparks = makeSparks(V(-1.9, 0.2, -1.2), 240, { power: 4.2 }), dust = makeDust(V(-7, 0, 1.2), V(1, 0, 0), 34, { reach: 13 }), debris = makeDebris({ x0: -8, x1: 9, y0: 0.3, y1: 3.4, z0: -4, z1: 1.5 }, 80);
    root.add(model("Barrel_01", 0, 0, -3.5, { height: 0.95 }), rain.obj, snow.obj, fire.obj, smoke.obj, sparks.obj, dust.obj, debris.obj); parts.push(rain, snow, fire, smoke, sparks, dust, debris);
    return { root, parts, cam: { pos: [0.2, 1.7, 8.2], look: [0, 2.3, -4], fov: 58 }, t: 2.4, follow: sky.follow };
  },
  () => { // 8 lights that light
    const sun = V(-0.4, 0.5, 0.75), { root, parts, sky } = base("night", sun, 0.35, { hemi: 0.22 });
    root.add(surfacePlane("cobbles", -40, 40, -40, 14, 3.2));
    root.add(boxM(30, 8, 1, 0, 0, -8, std("#8d8478")), boxM(1.3, 2.3, 0.2, -1.2, 0, -7.45, std("#4a3220")));
    for (const [x, y] of [[-6.5, 2.3], [-4, 2.3], [2.6, 2.3], [-6.5, 5.6], [-4, 5.6], [-1.2, 5.6], [2.6, 5.6], [5.4, 5.6]]) { const wd = makeWindow(V(x, y, -7.48), { power: y > 4 ? 10 : 22 }); root.add(wd.obj); parts.push(wd); }
    const sign = makeBulbSign(V(4.6, 3.5, -7.4), "HOTEL", { w: 3.4, h: 1.15 }), lan = makeLantern(V(-3.2, 3.3, -2.6), { post: 3.15, power: 70, shadow: true }), fire = makeFire(V(2.2, 0.95, -1.6), 0.85, { power: 95 });
    const rocket = makeRocket(0, V(9, 0, -30), V(6.5, 26, -34), { power: 26000 });
    root.add(sign.obj, lan.obj, fire.obj, rocket.obj, model("Barrel_01", 2.2, 0, -1.6, { height: 0.95 }), model("wooden_crate_02", -5.2, 0, -3.2, { height: 0.7, yaw: 0.4 }), model("painted_wooden_bench", -0.6, 0, -5.6, { height: 0.95 })); parts.push(sign, lan, fire, rocket);
    return { root, parts, cam: { pos: [0.4, 1.6, 8.5], look: [0.6, 3.6, -6], fov: 58 }, t: 2.1, follow: sky.follow };
  },
  () => { // 9 clear shadows from one light
    const sun = V(-0.78, 0.36, 0.5), { root, parts, sky } = base("day", sun, 4.2, { hemi: 0.6, size: 20 });
    root.add(surfacePlane("cobbles", -40, 3, -40, 14, 3.2), surfacePlane("planks", 3, 40, -40, 14, 3.4));
    const t = makeTree(2, { height: 6.5, leaves: 6000 }); t.obj.position.set(-5.5, 0, -5); root.add(t.obj); parts.push(t);
    const lan = makeLantern(V(-0.6, 3.2, -4.2), { post: 3.05, power: 0 }); root.add(lan.obj); parts.push(lan);
    root.add(model("painted_wooden_bench", 1.8, 0, -4.6, { height: 0.95, yaw: 0.2 }), model("wooden_crate_02", 5.2, 0, -3.4, { height: 0.75, yaw: 0.5 }), model("Barrel_01", 6.3, 0, -4.4, { height: 0.95 }));
    return { root, parts, cam: { pos: [1.0, 1.7, 6.2], look: [0.6, 1.2, -3], fov: 50 }, t: 1.4, follow: sky.follow };
  },
];
export const ENV_PARTS = SCENES.length;

const Inner: React.FC<{ i: number }> = ({ i }) => {
  const { camera, gl } = useThree();
  const b = useMemo(() => SCENES[i](), [i]);
  const fx = useMemo(() => ({ bloom: new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.9, luminanceThreshold: 1.0, luminanceSmoothing: 0.25, mipmapBlur: true, levels: 7, radius: 0.7 }), tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }) }), []);
  gl.shadowMap.type = THREE.PCFSoftShadowMap;
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.set(...b.cam.pos); cam.up.set(0, 1, 0); cam.lookAt(...b.cam.look); cam.fov = b.cam.fov; cam.near = 0.2; cam.far = 3000; cam.updateProjectionMatrix(); cam.layers.enable(3);
  for (const p of b.parts) p.update(b.t);
  b.follow?.(cam.position);
  return (<><primitive object={b.root} dispose={null} /><EffectComposer multisampling={4}><primitive object={fx.bloom} dispose={null} /><primitive object={fx.tone} dispose={null} /></EffectComposer></>);
};
export const EnvKit: React.FC = () => {
  const f = useCurrentFrame();
  const [ok, setOk] = useState(false);
  const [h] = useState(() => delayRender("env kit assets"));
  useEffect(() => {
    loadModels((p) => staticFile(p)).then(() => { setOk(true); continueRender(h); });
  }, [h]);
  if (!ok) return null;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <ThreeCanvas key={f} width={1920} height={1080} shadows gl={{ antialias: false, stencil: false, powerPreference: "high-performance" }} camera={{ fov: 45, near: 0.2, far: 3000 }}>
        <Inner i={Math.min(SCENES.length - 1, f)} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

// Free 3D models for props and vehicles. Source: Poly Haven (polyhaven.com), licence CC0 1.0: "You can use our assets
// for any purpose, including commercial work. You do not need to give credit" (polyhaven.com/license, read 2026-11-15).
// Downloaded by scripts/get_models.py into public/env/models/<name>/. Load them once before the scene is built.
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export const MODEL_NAMES = ["lifebuoy", "Lantern_01", "vintage_suitcase", "wooden_crate_02", "Barrel_01", "covered_car", "painted_wooden_bench"] as const;
export type ModelName = (typeof MODEL_NAMES)[number];
export const MODELS: Partial<Record<ModelName, THREE.Group>> = {};
export const loadModels = (url: (path: string) => string, names: readonly ModelName[] = MODEL_NAMES) => Promise.all(names.map((n) => new Promise<void>((ok) => {
  new GLTFLoader().load(url(`env/models/${n}/${n}_1k.gltf`), (g) => { g.scene.traverse((o) => { o.castShadow = true; o.receiveShadow = true; }); MODELS[n] = g.scene; ok(); }, undefined, (e) => { console.warn("model failed", n, e); ok(); });
})));
/** a copy of a loaded model, set on the ground at (x, z), turned `yaw`, scaled so that it is `height` metres tall (or by `scale`) */
export const model = (name: ModelName, x: number, y: number, z: number, o: { yaw?: number; height?: number; scale?: number; tilt?: number } = {}) => {
  const src = MODELS[name]; const g = new THREE.Group(); if (!src) return g;
  const m = src.clone(true), box = new THREE.Box3().setFromObject(m), size = box.getSize(new THREE.Vector3());
  const s = o.scale ?? (o.height ? o.height / size.y : 1);
  m.position.set(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2);
  g.add(m); g.scale.setScalar(s); g.position.set(x, y, z); g.rotation.set(o.tilt ?? 0, o.yaw ?? 0, 0);
  return g;
};

// Shared helpers of the environment kit: seeded random numbers, canvas textures, soft sprites.
// Everything in the kit is a pure function of time t (seconds), so every frame renders the same on every machine.
import * as THREE from "three";

export type Part = { obj: THREE.Object3D; update: (t: number) => void };
export const rng = (seed: number) => { let s = (seed * 9301 + 49297) % 233280 || 1; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; };
const cache = new Map<string, THREE.CanvasTexture>();
/** a canvas texture drawn once; `key` names it */
export const canvasTex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D, r: () => number) => void, repeat = false, srgb = true) => {
  let t = cache.get(key);
  if (!t) {
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    const g = cv.getContext("2d")!; draw(g, rng(key.length * 131 + w));
    t = new THREE.CanvasTexture(cv); t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = 16;
    if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    cache.set(key, t);
  }
  return t;
};
/** round soft blob, white, for glows, dust and smoke */
export const softTex = (hard = 0) => canvasTex("soft" + hard, 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(hard, "rgba(255,255,255,1)"); gr.addColorStop(Math.min(1, hard + 0.35), "rgba(255,255,255,0.35)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
/** additive glow that feeds the bloom: colour may exceed 1 */
export const glow = (color: THREE.ColorRepresentation, size: number, gain = 1) => {
  const c = new THREE.Color(color).multiplyScalar(gain);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex(), color: c, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true }));
  s.scale.setScalar(size); s.layers.set(3); return s;
};
/** layer 3 is the engine's "no ink" layer (ink.ts NOINK): cards, particles and glows are not outlined */
export const noInk = <T extends THREE.Object3D>(o: T) => { o.traverse((c) => c.layers.set(3)); return o; };

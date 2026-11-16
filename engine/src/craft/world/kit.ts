// The world kit (DAILY-RULES "The world look"): real 3D props with a toon finish. Flat bright colours in three tones, a black
// outline, thickness and their own shadows, one strong light with crisp shadows. Every object keeps its own colour.
// Units are metres, y is up. Everything here is shared by every film; no film's own folder builds props.
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export const INK3 = "#17121c";
let RAMP: THREE.DataTexture | null = null;
/** the three tones of every toon surface: shadow, half-tone, light */
const ramp = () => {
  if (!RAMP) { RAMP = new THREE.DataTexture(new Uint8Array([120, 120, 120, 255, 196, 196, 196, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat); RAMP.minFilter = RAMP.magFilter = THREE.NearestFilter; RAMP.needsUpdate = true; }
  return RAMP;
};
const mats = new Map<string, THREE.MeshToonMaterial>();
/** a flat toon colour (cached per colour and texture) */
export const toon = (color: string, map?: THREE.Texture, side: THREE.Side = THREE.FrontSide, glow?: string) => {
  const key = color + (map ? map.uuid : "") + side + (glow ?? ""); let m = mats.get(key);
  if (!m) { m = new THREE.MeshToonMaterial({ color, gradientMap: ramp(), map: map ?? null, side, emissive: glow ?? "#000000" }); mats.set(key, m); }
  return m;
};
/** the black contour: the object's hull pushed out along its normals and drawn inside out, a constant width on the screen */
const OUTLINE = new THREE.ShaderMaterial({
  side: THREE.BackSide, uniforms: { px: { value: 3.2 }, res: { value: 1920 } },
  vertexShader: `uniform float px; uniform float res; attribute float lineW;
    void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vec3 n = normalize(normalMatrix * normal);
      float k = px * lineW * 2.0 * (-mv.z) / (res * projectionMatrix[1][1]); mv.xyz += n * k; gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `void main() { gl_FragColor = vec4(0.008, 0.006, 0.012, 1.0); }`,
});
export const setOutline = (px: number, res: number) => { OUTLINE.uniforms.px.value = px; OUTLINE.uniforms.res.value = res; };
const hulls = new WeakMap<THREE.BufferGeometry, THREE.BufferGeometry>();
const hullOf = (g: THREE.BufferGeometry, w: number) => {
  let h = hulls.get(g);
  if (!h) {
    const c = new THREE.BufferGeometry(); c.setAttribute("position", g.getAttribute("position").clone()); if (g.index) c.setIndex(g.index.clone());
    h = mergeVertices(c, 1e-4); h.computeVertexNormals();
    h.setAttribute("lineW", new THREE.BufferAttribute(new Float32Array(h.getAttribute("position").count).fill(w), 1)); hulls.set(g, h);
  }
  return h;
};
/** glow = a colour the thing gives off by itself, so that it keeps its colour in deep shade (bread under an awning, a lamp) */
export type MeshO = { at?: [number, number, number]; rot?: [number, number, number]; scale?: [number, number, number] | number; line?: number; shadow?: boolean; receive?: boolean; map?: THREE.Texture; side?: THREE.Side; glow?: string };
/** a toon mesh with its outline. line = width of its contour (1 = normal, 0 = none) */
export const mesh = (geo: THREE.BufferGeometry, color: string, o: MeshO = {}) => {
  const m = new THREE.Mesh(geo, toon(color, o.map, o.side, o.glow));
  m.castShadow = o.shadow !== false; m.receiveShadow = o.receive !== false;
  if (o.at) m.position.set(...o.at); if (o.rot) m.rotation.set(...o.rot);
  if (o.scale !== undefined) (typeof o.scale === "number" ? m.scale.setScalar(o.scale) : m.scale.set(...o.scale));
  if (o.line !== 0) { const h = new THREE.Mesh(hullOf(geo, o.line ?? 1), OUTLINE); h.castShadow = false; h.receiveShadow = false; m.add(h); }
  return m;
};
export const group = (kids: THREE.Object3D[], at?: [number, number, number], rotY = 0) => { const g = new THREE.Group(); g.add(...kids); if (at) g.position.set(...at); g.rotation.y = rotY; return g; };
// ---------------- geometry shorthands (cached) ----------------
const geos = new Map<string, THREE.BufferGeometry>();
const G = <T extends THREE.BufferGeometry>(key: string, make: () => T) => { let g = geos.get(key); if (!g) { g = make(); geos.set(key, g); } return g as T; };
export const box = (w: number, h: number, d: number) => G(`b${w},${h},${d}`, () => new THREE.BoxGeometry(w, h, d));
export const cyl = (r0: number, r1: number, h: number, n = 20, open = false) => G(`c${r0},${r1},${h},${n},${open}`, () => new THREE.CylinderGeometry(r0, r1, h, n, 1, open));
export const ball = (r: number, n = 20) => G(`s${r},${n}`, () => new THREE.SphereGeometry(r, n, Math.round(n * 0.7)));
export const torus = (r: number, t: number, n = 28) => G(`t${r},${t},${n}`, () => new THREE.TorusGeometry(r, t, 10, n));
/** a turned shape (pots, columns, loaves): the profile as [radius, height] pairs from the bottom up */
export const lathe = (key: string, prof: [number, number][], n = 24) => G("l" + key, () => new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(Math.max(r, 0.0001), y)), n));
/** a flat shape with thickness (an awning, a sign, a wheel rim) from an outline in the xy plane */
export const slab = (key: string, pts: [number, number][], depth: number) => G("e" + key, () => {
  const s = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y))); const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false }); g.translate(0, 0, -depth / 2); return g;
});

/** a solid with a flat outline seen from above (a hull, a deck, a pier): pts = [x, z] round the outline, from height y0 up to y1 */
export const prism = (key: string, pts: [number, number][], y0: number, y1: number) => G("p" + key + y0 + y1, () => {
  const g = new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z))), { depth: y1 - y0, bevelEnabled: false }); g.rotateX(-Math.PI / 2); g.translate(0, y0, 0); return g;
});
/** a round rod from a to b (a mast, a spar, a rope, a rail) */
export const rod = (a: [number, number, number], b: [number, number, number], r: number, color: string, o: MeshO = {}) => {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), len = A.distanceTo(B), m = mesh(cyl(r, r, 1, 10), color, o);
  m.scale.set(1, len, 1); m.position.copy(A).lerp(B, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  return m;
};

// ---------------- painted flat textures ----------------
const texs = new Map<string, THREE.CanvasTexture>();
export const paint = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D, r: () => number) => void, repeat?: [number, number]) => {
  let t = texs.get(key);
  if (!t) {
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h; let s = key.length * 7919 + 13;
    draw(cv.getContext("2d")!, () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; });
    t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16; t.wrapS = t.wrapT = THREE.RepeatWrapping; texs.set(key, t);
  }
  if (repeat) { t = t.clone(); t.repeat.set(...repeat); t.needsUpdate = true; }
  return t;
};

// ---------------- light ----------------
export type Sun = { from: [number, number, number]; color?: string; power?: number; sky?: string; ground?: string; fill?: number; reach?: number };
/** one strong light with crisp shadows, and a weak sky light so shadows keep their colour. `reach` = half the size of the lit area */
export const sunRig = (o: Sun, target: [number, number, number] = [0, 0, 0]) => {
  const sun = new THREE.DirectionalLight(o.color ?? "#fff4dc", o.power ?? 3.1), R = o.reach ?? 26;
  sun.position.set(target[0] + o.from[0], target[1] + o.from[1], target[2] + o.from[2]); sun.target.position.set(...target);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 1.2;
  const c = sun.shadow.camera; c.left = -R; c.right = R; c.top = R; c.bottom = -R; c.near = 1; c.far = 160; c.updateProjectionMatrix();
  const hemi = new THREE.HemisphereLight(o.sky ?? "#cfe4ff", o.ground ?? "#b79a7a", o.fill ?? 1.25);
  return group([sun, sun.target, hemi]);
};
/** a sky as a huge inward ball with a painted vertical gradient */
export const skyDome = (top: string, horizon: string, low = horizon) => {
  const t = paint(`sky${top}${horizon}${low}`, 16, 512, (g) => { const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, top); gr.addColorStop(0.5, horizon); gr.addColorStop(1, low); g.fillStyle = gr; g.fillRect(0, 0, 16, 512); });
  const m = new THREE.Mesh(new THREE.SphereGeometry(900, 24, 16), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, fog: false, depthWrite: false }));
  m.renderOrder = -10; return m;
};

// ---------------- figures as cards ----------------
/** a figure drawn in code on a card that stands in the world, faces the lens and casts its own shadow.
 *  w, h = size of the card in metres, feet = where the soles are on the canvas (0..1 from the top), draw paints the canvas */
export const card = (key: string, cw: number, ch: number, w: number, h: number, feet: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const cv = document.createElement("canvas"); cv.width = cw; cv.height = ch; draw(cv.getContext("2d")!);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16; t.name = key;
  const geo = new THREE.PlaneGeometry(w, h); geo.translate(0, h * (feet - 0.5), 0);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }));
  m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: t, alphaTest: 0.5 });
  m.castShadow = true; m.receiveShadow = false;
  return m;
};
/** turn a card to face the camera (about the vertical axis only, so the feet stay on the ground) */
export const faceCam = (m: THREE.Object3D, cam: THREE.Vector3) => { m.rotation.y = Math.atan2(cam.x - m.position.x, cam.z - m.position.z); };

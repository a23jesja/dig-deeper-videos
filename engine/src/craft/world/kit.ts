// The world kit (DAILY-RULES "The world look"): real 3D props with a toon finish. Flat bright colours in three tones, a black
// outline, thickness and their own shadows, one strong light with crisp shadows. Every object keeps its own colour.
// Units are metres, y is up. Everything here is shared by every film; no film's own folder builds props.
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export const INK3 = "#17121c";
let RAMP: THREE.DataTexture | null = null;
/** the three tones of every toon surface: shadow, half-tone, light */
const ramp = () => {
  if (!RAMP) { RAMP = new THREE.DataTexture(new Uint8Array([150, 150, 150, 255, 208, 208, 208, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat); RAMP.minFilter = RAMP.magFilter = THREE.NearestFilter; RAMP.needsUpdate = true; }
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
  fragmentShader: `void main() { gl_FragColor = vec4(0.033, 0.018, 0.011, 1.0); }`,
});
export const setOutline = (px: number, res: number) => { OUTLINE.uniforms.px.value = px; OUTLINE.uniforms.res.value = res; };
/** the width of the contour on the screen, in pixels of a picture `res` high (the figures on cards are drawn with the same width) */
export const outlinePx = () => ({ px: OUTLINE.uniforms.px.value as number, res: OUTLINE.uniforms.res.value as number });
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
/** part of a ring: `turn` radians of it */
export const arc = (r: number, t: number, turn: number, n = 16) => G(`a${r},${t},${turn},${n}`, () => new THREE.TorusGeometry(r, t, 8, n, turn));
/** a turned shape (pots, columns, loaves): the profile as [radius, height] pairs from the bottom up */
export const lathe = (key: string, prof: [number, number][], n = 24) => G("l" + key, () => new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(Math.max(r, 0.0001), y)), n));
/** a flat outline in the xy plane given thickness along z, with its two faces (three's own ExtrudeGeometry leaves the faces out
 *  in this version, so the solid is built here): the faces from the triangulated outline, the walls from its edges */
const extrude = (pts: [number, number][], holes: [number, number][][], depth: number) => {
  const V = (q: [number, number][]) => q.map(([x, y]) => new THREE.Vector2(x, y));
  const outer = V(pts); if (THREE.ShapeUtils.isClockWise(outer)) outer.reverse();
  const hs = holes.map((h) => { const q = V(h); if (!THREE.ShapeUtils.isClockWise(q)) q.reverse(); return q; });
  const faces = THREE.ShapeUtils.triangulateShape(outer, hs), all = [outer, ...hs].flat(), pos: number[] = [], z0 = -depth / 2, z1 = depth / 2;
  for (const [a, b, c] of faces) { pos.push(all[a].x, all[a].y, z1, all[b].x, all[b].y, z1, all[c].x, all[c].y, z1); pos.push(all[c].x, all[c].y, z0, all[b].x, all[b].y, z0, all[a].x, all[a].y, z0); }
  for (const ring of [outer, ...hs]) for (let i = 0; i < ring.length; i++) { const a = ring[i], b = ring[(i + 1) % ring.length]; pos.push(a.x, a.y, z0, b.x, b.y, z0, b.x, b.y, z1, a.x, a.y, z0, b.x, b.y, z1, a.x, a.y, z1); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  const uv: number[] = []; for (let i = 0; i < pos.length; i += 3) uv.push(pos[i], pos[i + 1]); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals(); return g;
};
/** a flat shape with thickness (an awning, a sign, a sail, a blade) from an outline in the xy plane */
export const slab = (key: string, pts: [number, number][], depth: number) => G("e" + key, () => extrude(pts, [], depth));

/** a flat shape with thickness and holes in it (a wall with an arched gateway) */
export const slabHoles = (key: string, pts: [number, number][], holes: [number, number][][], depth: number) => G("h" + key, () => extrude(pts, holes, depth));
/** a solid with a flat outline seen from above (a hull, a deck, a pier): pts = [x, z] round the outline, from height y0 up to y1 */
export const prism = (key: string, pts: [number, number][], y0: number, y1: number) => G("p" + key + y0 + y1, () => { const g = extrude(pts.map(([x, z]) => [x, -z] as [number, number]), [], y1 - y0); g.translate(0, 0, (y1 - y0) / 2); g.rotateX(-Math.PI / 2); g.translate(0, y0, 0); g.computeVertexNormals(); return g; });
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
export type Sun = { from: [number, number, number]; color?: string; power?: number; sky?: string; ground?: string; fill?: number; reach?: number; /** light thrown back from the ground and the walls onto the sides turned from the sun (no shadows) */ bounce?: number };
/** one strong light with crisp shadows, a sky light so shadows keep their colour, and a weak light back from the lit side of the
 *  street onto the side in shade. `reach` = half the size of the area that gets shadows. Aim it for each shot with `aimSun`. */
export const sunRig = (o: Sun, target: [number, number, number] = [0, 0, 0]) => {
  const sun = new THREE.DirectionalLight(o.color ?? "#fff4dc", o.power ?? 3.1);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.012; sun.shadow.radius = 1;
  const hemi = new THREE.HemisphereLight(o.sky ?? "#cfe4ff", o.ground ?? "#b79a7a", o.fill ?? 1.25), g = group([sun, sun.target, hemi]);
  if (o.bounce) { const b = new THREE.DirectionalLight("#fff0d8", o.bounce); b.position.set(-o.from[0], o.from[1] * 0.35, -o.from[2]); b.castShadow = false; g.add(b, b.target); }
  g.userData.sun = sun; g.userData.from = o.from; aimSun(g, target, o.reach ?? 26);
  return g;
};
/** point the shadow area at what a shot shows: the smaller the area, the sharper the edge of every shadow in it */
export const aimSun = (rig: THREE.Object3D, target: [number, number, number], reach: number) => {
  const sun = rig.userData.sun as THREE.DirectionalLight, f = rig.userData.from as [number, number, number];
  sun.position.set(target[0] + f[0], target[1] + f[1], target[2] + f[2]); sun.target.position.set(...target); sun.target.updateMatrixWorld();
  const c = sun.shadow.camera; c.left = -reach; c.right = reach; c.top = reach; c.bottom = -reach; c.near = 1; c.far = 160; c.updateProjectionMatrix();
};
/** the direction toward the sun, for what has to know it (the shade on the cards) */
export const sunDir = (rig: THREE.Object3D) => new THREE.Vector3(...(rig.userData.from as [number, number, number])).normalize();
/** a sky as a huge inward ball with a painted vertical gradient */
export const skyDome = (top: string, horizon: string, low = horizon) => {
  const t = paint(`sky${top}${horizon}${low}`, 16, 512, (g) => { const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, top); gr.addColorStop(0.5, horizon); gr.addColorStop(1, low); g.fillStyle = gr; g.fillRect(0, 0, 16, 512); });
  const m = new THREE.Mesh(new THREE.SphereGeometry(900, 24, 16), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, fog: false, depthWrite: false }));
  m.renderOrder = -10; return m;
};

// ---------------- figures as cards ----------------
/** the shade that falls on a card: the card keeps its drawn colours, and where an awning, a column or a wall stands between it and
 *  the sun a cool tone is laid over the drawing. The shadow is looked up a little toward the sun from the card, so that the card
 *  never shades itself. `userData.lookBack` (world metres) moves that look-up further: a hand drawn in front of what it holds looks up
 *  its shade where the hand is on its figure, so that it is not shaded by its own figure */
const shadeMat = (map: THREE.Texture, toSun: THREE.Vector3) => {
  const m = new THREE.ShadowMaterial({ color: "#1c2a4a", opacity: 0.36, transparent: true, depthWrite: false, side: THREE.DoubleSide });
  m.userData.lookBack = { value: new THREE.Vector3() };
  m.polygonOffset = true; m.polygonOffsetFactor = -2; m.polygonOffsetUnits = -4;
  m.onBeforeCompile = (sh) => {
    sh.uniforms.cardMap = { value: map }; sh.uniforms.toSun = { value: toSun }; sh.uniforms.lookBack = m.userData.lookBack;
    sh.vertexShader = sh.vertexShader.replace("void main() {", "uniform vec3 toSun; uniform vec3 lookBack; varying vec2 vCardUv;\nvoid main() { vCardUv = uv;")
      .replace("#include <shadowmap_vertex>", "worldPosition.xyz += toSun * 0.3 + lookBack;\n#include <shadowmap_vertex>");
    sh.fragmentShader = sh.fragmentShader.replace("void main() {", "uniform sampler2D cardMap; varying vec2 vCardUv;\nvoid main() { if (texture2D(cardMap, vCardUv).a < 0.5) discard;");
  };
  return m;
};
/** The scene's light on the figures (Jesper 19 Nov, after the painted-cabin test: "Figurerna får scenens ljus: varmt från lyktans
 *  sida, kallt från fönstrets sida, och en tunn ljuskant runt konturen. De får inte vara ljusare än rummet runt dem"). A card is
 *  drawn at full strength; with a light set, two layers go over it through its own outline:
 *    - the first multiplies it by the light that reaches it: `amb` everywhere, and each light by how much the card's side turns toward
 *      it (the card is read as rounded across its width) and how near it is. It can only darken and tint, never make the figure brighter
 *      than its drawing;
 *    - the second adds a thin edge of light along the outline on the side that faces each light (a rim).
 *  `reach` = metres at which a light has fallen to half; `rim` = how strong the edges are (0 = none). Colours as on the screen.
 *  The Stage sets it per shot (film.light / shot.light); without it the cards are as they always were */
/** (per light: `body` = how much it lights the figure's side turned to it, `rimK` = how strong its edge is; 1 when left out. A window's
 *  moonlight is a thin cold edge only: body 0) */
export type CardLight = { amb: string; lights: { at: [number, number, number]; color: string; power: number; reach: number; body?: number; rimK?: number }[]; rim?: number };
let CARD_LIGHT: CardLight | null = null;
export const setCardLight = (l: CardLight | null) => { CARD_LIGHT = l; };
const rgb = (hex: string) => { const n = parseInt(hex.replace("#", ""), 16); return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255); };
const LIGHT_VS = `varying vec2 vUv; varying vec3 vW; varying vec3 vR; varying vec3 vN;
  void main() { vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vR = normalize((modelMatrix * vec4(1.0, 0.0, 0.0, 0.0)).xyz);
    vN = normalize((modelMatrix * vec4(0.0, 0.0, 1.0, 0.0)).xyz); gl_Position = projectionMatrix * viewMatrix * w; }`;
const LIGHT_HEAD = `uniform sampler2D cardMap; uniform vec2 texel; uniform vec3 lp[3]; uniform vec3 lc[3]; uniform float lk[3]; uniform float lr[3]; uniform float lb[3]; uniform float lq[3]; uniform int ln;
  varying vec2 vUv; varying vec3 vW; varying vec3 vR; varying vec3 vN;
  float A(vec2 o) { return texture2D(cardMap, vUv + o * texel).a; }
  float att(int i) { vec3 d = lp[i] - vW; float r = length(d); return 1.0 / (1.0 + (r * r) / (lr[i] * lr[i])); }`;
const cardLight = (map: THREE.Texture, cw: number, ch: number, L: CardLight) => {
  const P = L.lights.slice(0, 3), pad = <T,>(a: T[], z: T) => [...a, z, z, z].slice(0, 3);
  const u = () => ({ cardMap: { value: map }, texel: { value: new THREE.Vector2(1 / cw, 1 / ch) }, ln: { value: P.length }, amb: { value: rgb(L.amb) }, rimK: { value: L.rim ?? 0.8 },
    lp: { value: pad(P.map((l) => new THREE.Vector3(...l.at)), new THREE.Vector3()) }, lc: { value: pad(P.map((l) => rgb(l.color)), new THREE.Vector3()) },
    lk: { value: pad(P.map((l) => l.power), 0) }, lr: { value: pad(P.map((l) => l.reach), 1) }, lb: { value: pad(P.map((l) => l.body ?? 1), 0) }, lq: { value: pad(P.map((l) => l.rimK ?? 1), 0) } });
  const common = { transparent: true, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -6 };
  // the light that reaches the card, multiplied over it
  const mul = new THREE.ShaderMaterial({ ...common, uniforms: u(), vertexShader: LIGHT_VS, blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.DstColorFactor, blendDst: THREE.ZeroFactor,
    fragmentShader: `${LIGHT_HEAD} uniform vec3 amb;
      void main() { if (texture2D(cardMap, vUv).a < 0.5) discard; float sx = (vUv.x - 0.5) * 2.6; vec3 n = normalize(vN * 0.8 + vR * sx + vec3(0.0, 0.2, 0.0)); vec3 c = amb;
        for (int i = 0; i < 3; i++) { if (i >= ln) break; vec3 d = normalize(lp[i] - vW); c += lc[i] * lk[i] * lb[i] * max(0.0, dot(n, d)) * att(i); }
        gl_FragColor = vec4(min(c, vec3(1.0)), 1.0); }` });
  // the rim: a thin edge of each light along the outline, on the side that faces it
  const rim = new THREE.ShaderMaterial({ ...common, uniforms: u(), vertexShader: LIGHT_VS, blending: THREE.AdditiveBlending,
    fragmentShader: `${LIGHT_HEAD} uniform float rimK;
      void main() { if (texture2D(cardMap, vUv).a < 0.5) discard; float w = 5.0; float e = 1.0 - min(min(A(vec2(w, 0.0)), A(vec2(-w, 0.0))), min(A(vec2(0.0, w)), A(vec2(0.0, -w))));
        if (e < 0.5) discard; vec2 g = vec2(A(vec2(-w, 0.0)) - A(vec2(w, 0.0)), A(vec2(0.0, -w)) - A(vec2(0.0, w))); if (length(g) < 0.01) discard; vec2 o = normalize(g); vec3 c = vec3(0.0);
        for (int i = 0; i < 3; i++) { if (i >= ln) break; vec3 d = normalize(lp[i] - vW); vec2 dl = normalize(vec2(dot(d, vR), d.y) + 1e-5); float s = max(0.0, dot(o, dl)); c += lc[i] * lk[i] * lq[i] * s * s * att(i); }
        gl_FragColor = vec4(c * rimK, 1.0); }` });
  return { mul, rim };
};
/** a figure drawn in code on a card that stands in the world, faces the lens, casts its own shadow and takes the shade of the world.
 *  w, h = size of the card in metres, feet = where the soles are on the canvas (0..1 from the top), draw paints the canvas;
 *  toSun = the direction toward the sun (kit.sunDir), without it the card takes no shade */
export const card = (key: string, cw: number, ch: number, w: number, h: number, feet: number, draw: (g: CanvasRenderingContext2D) => void, toSun?: THREE.Vector3) => {
  const cv = document.createElement("canvas"); cv.width = cw; cv.height = ch; draw(cv.getContext("2d")!);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16; t.name = key;
  const geo = new THREE.PlaneGeometry(w, h); geo.translate(0, h * (feet - 0.5), 0);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }));
  m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: t, alphaTest: 0.5 });
  m.castShadow = true; m.receiveShadow = false;
  if (toSun) { const sh = new THREE.Mesh(geo, shadeMat(t, toSun)); sh.receiveShadow = true; sh.castShadow = false; sh.renderOrder = 2; m.add(sh); }
  if (CARD_LIGHT) { const L = cardLight(t, cw, ch, CARD_LIGHT), a = new THREE.Mesh(geo, L.mul), b = new THREE.Mesh(geo, L.rim);
    for (const [k, o] of [a, b].entries()) { o.castShadow = false; o.receiveShadow = false; o.renderOrder = 3 + k; o.userData.own = true; m.add(o); } }
  return m;
};
/** turn a card to face the camera (about the vertical axis only, so the feet stay on the ground) */
export const faceCam = (m: THREE.Object3D, cam: THREE.Vector3) => { m.rotation.y = Math.atan2(cam.x - m.position.x, cam.z - m.position.z); };

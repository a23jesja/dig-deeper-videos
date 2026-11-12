// The cast of the emu short as lit flat sprites in the 3D world (pool / actors / effect cards from the
// cartoon-3d-short skill), plus the staging of every shot: stage(id, f, cam) lists every card on screen and
// propsAt(f) poses the 3D props (guns, lorry, brass, cartridges, scoreboard).
import * as THREE from "three";
import {
  Pen, bodyFront, bodySide, setTalk, SIR_DIGSWORTH, DIGGER, MAJOR, FARMERS, fxBurst, fxStars, fxShadow, fxContact, fxPuff,
  Outfit, Expr, FrontOpts, SideOpts,
} from "./toon";
import { emuSide, emuFront, GAIT, EmuOpts, EmuFrontOpts } from "./critters";
import { FPS, SHOTS, V3, smooth, clamp01, easeOut, FENCE_Z, GAP, ROAD_Z, PAD, DAM, FARM, HEAP, truckX, chaseEmuX, truckBounce, leaveX, FIRE5, FIRE8, JAM, firing } from "./story";
import { TALK } from "./talk";
import { LIGHTS } from "./lights";
import { NOINK } from "./ink";
import { cardShade, blobMaterial, CARD_K } from "./cardshade";

// ---------------- canvas pool ----------------
type Entry = { cv: HTMLCanvasElement; tex: THREE.CanvasTexture; w: number; h: number };
export type Req = { key: string; w: number; h: number; k: number; draw: (p: Pen) => void; tex?: THREE.CanvasTexture };
const makeEntry = (w: number, h: number): Entry => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { cv, tex, w, h };
};
export class Pool {
  private live = new Map<string, Entry>();
  private free: Entry[] = [];
  private reqs: Req[] = [];
  req(key: string, w: number, h: number, k: number, draw: (p: Pen) => void) {
    const r: Req = { key: `${w}x${h}|${key}`, w, h, k, draw };
    this.reqs.push(r);
    return r;
  }
  flush() {
    const want = new Map<string, Req[]>();
    for (const r of this.reqs) { const l = want.get(r.key); if (l) l.push(r); else want.set(r.key, [r]); }
    for (const [key, e] of this.live) if (!want.has(key)) { this.live.delete(key); this.free.push(e); }
    for (const [key, rs] of want) {
      let e = this.live.get(key);
      if (!e) {
        const r = rs[0], i = this.free.findIndex((x) => x.w === r.w && x.h === r.h);
        e = i >= 0 ? this.free.splice(i, 1)[0] : makeEntry(r.w, r.h);
        const g = e.cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, e.w, e.h); g.setTransform(r.k, 0, 0, r.k, 0, 0);
        r.draw(new Pen(g));
        e.tex.needsUpdate = true;
        this.live.set(key, e);
      }
      for (const r of rs) r.tex = e.tex;
    }
    this.reqs = [];
  }
}

// ---------------- sprite meshes ----------------
const blank = (() => { const c = document.createElement("canvas"); c.width = c.height = 2; return new THREE.CanvasTexture(c); })();
export const SU = 0.00216; // metres per design unit: 1000 units = 2.16 m
export const SU_SWING = 2.3 / 1830; // swing canvas: rope of 1830 units = 2.3 m
const BODY = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
const CARD = new THREE.PlaneGeometry(1, 1);
/** world roots that hold actors (to find the scene's sun when world.ts does not pass it) */
const ROOTS = new Set<THREE.Object3D>();

/** lit flat character: cardShade() material, receives shadows (dims to the bright floor only), casts its silhouette
 *  when world.ts says so (golden). Drawn after the contact blobs (renderOrder 1). */
export class Actor {
  mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial; dmat: THREE.MeshDepthMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D, geo: THREE.BufferGeometry = BODY) {
    this.mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.dmat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.customDepthMaterial = this.dmat;
    // rim width is in output pixels: tell the card shader the render height (1920 = 1080 x 1920 frame)
    this.mesh.onBeforeRender = (r) => { const rt = r.getRenderTarget(); CARD_K.uPx.value = (rt ? rt.height : r.domElement.height) / 1920; };
    this.mesh.castShadow = false; this.mesh.receiveShadow = true; this.mesh.visible = false;
    this.mesh.rotation.order = "YXZ"; this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
    ROOTS.add(parent);
  }
  bind() { const t = this.r?.tex; if (t) { this.mat.map = t; this.dmat.map = t; } }
}
/** unlit effect card: hard cut-out (ink drawings), soft see-through (dust, mist) or a multiply ground blob */
export class Fx {
  mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; soft: THREE.MeshBasicMaterial; blob: THREE.MeshBasicMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.soft = new THREE.MeshBasicMaterial({ map: blank, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.blob = blobMaterial(blank);
    this.mesh = new THREE.Mesh(CARD, this.mat);
    this.mesh.visible = false; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  use(soft: boolean) { this.mesh.material = soft ? this.soft : this.mat; }
  bind() {
    const t = this.r?.tex;
    if (!t) return;
    if (this.r!.key.includes("|blob|")) {
      // no mipmaps: at grazing views the mip chain averages the blob with its white surround and it fades out
      if (t.generateMipmaps) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; }
      this.blob.map = t; this.mesh.material = this.blob; this.mesh.renderOrder = 0.5;
    }
    else { this.mat.map = t; this.soft.map = t; this.mesh.renderOrder = 0; }
  }
}

// ---------------- placements ----------------
export type Place = {
  key: string; draw: (p: Pen) => void; x: number; y: number; z: number;
  scale?: number; mirror?: boolean; yaw?: number; geo?: "body" | "emu" | "emuF"; roll?: number; size?: [number, number, number];
};
export type FxPlace = { key: string; cw: number; ch: number; draw: (p: Pen) => void; x: number; y: number; z: number; w: number; h: number; flat?: boolean; rot?: number; soft?: boolean };
/** sun = world direction TOWARD the sun (optional: when absent the scene's shadow-casting light is used) */
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; sun?: THREE.Vector3 };

const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const q = (v: number, n = 120) => Math.round(v * n) / n;
/** head-shape seed: 7 shapes, so marching soldiers in step still share canvases */
const seedOf = (i: number) => ((i * 5 + 3) % 7) + 1;
/** drawing resolution by distance: [canvas w, h, scale from the 600 x 1000 design]; sized for the 1440 x 2560 final */
const tier = (d: number): [number, number, number] =>
  d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];

// ---------------- light ----------------
const SUN = new THREE.Vector3(0.5, 0.75, -0.4).normalize();
const tmp = new THREE.Vector3();
let LNAME: "day" | "golden" = "day";
const sunOf = (root: THREE.Object3D) => {
  let s: THREE.DirectionalLight | null = null;
  root.traverse((o) => { if (!s && o instanceof THREE.DirectionalLight && o.castShadow) s = o; });
  return s as THREE.DirectionalLight | null;
};
/** the sun of the world that is calling: the attached root whose sun target sits on this camera's view axis */
const findSun = (cam: CamInfo, out: THREE.Vector3) => {
  if (cam.sun) return out.copy(cam.sun).normalize();
  let best: THREE.DirectionalLight | null = null, err = Infinity;
  for (const r of ROOTS) {
    if (!r.parent) continue;
    const s = sunOf(r);
    if (!s) continue;
    const d = tmp.copy(s.target.position).sub(cam.pos), e = Math.abs(d.dot(cam.right)) / (d.length() || 1);
    if (e < err) { err = e; best = s; }
  }
  return best ? out.copy(best.position).sub(best.target.position).normalize() : out;
};
/** canvas angle the sun comes FROM on an upright card facing the camera, in 45-degree steps (small texture cache) */
const light2D = (cam: CamInfo, mirror: boolean) => {
  const sx = SUN.dot(cam.right) * (mirror ? -1 : 1), sy = -SUN.y;
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
};

/** front / side view and mirroring for someone at (x, z) walking along (dx, dz); fs = foreshortening of the walk */
const viewOf = (cam: CamInfo, x: number, z: number, dx: number, dz: number) => {
  const tx = cam.pos.x - x, tz = cam.pos.z - z, tl = Math.hypot(tx, tz) || 1;
  const c = (tx * dx + tz * dz) / tl;
  return { side: c < 0.57, mirror: dx * cam.right.x + dz * cam.right.z < 0, fs: Math.round(Math.sqrt(Math.max(0, 1 - c * c)) * 20) / 20 };
};

// ---------------- life: blinks and reaction timing ----------------
/** reference expression and action changes land 0-3 f before the word onset */
const LEAD = 2 / FPS;
/** eyelid 0 open .. 1 shut. Reference: gaps 0.5-2.3 s, 4-frame blink half / shut / shut / half, plus a blink across
 *  every expression swap (the shut frames hide the swap) */
const LID = [0.5, 1, 1, 0.5];
const lidAt = (t: number, i: number, swaps: number[] = []) => {
  const f = Math.round(t * FPS);
  for (const ts of swaps) { const k = f - Math.round((ts - LEAD) * FPS) + 1; if (k >= 0 && k < 4) return LID[k]; }
  let s = Math.round(-60 * hh(i, 9));
  for (let n = 0; s <= f && n < 400; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(15 + 54 * hh(i * 31 + n, 13)); // next blink 0.5-2.3 s later
  }
  return 0;
};
const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));

type Who = { i: number; o: Outfit; okey: string };
/** one character drawing in the 600 x 1000 design space, sized by distance, lit from the scene's sun */
const person = (cam: CamInfo, who: Who, x: number, y: number, z: number, view: { side: boolean; mirror: boolean }, fo: FrontOpts, so: SideOpts, scale = 1): Place & { tierKey: string } => {
  const d = cam.pos.distanceTo(tmp.set(x, y + 1.2, z)) / scale;
  const [w, h, k] = tier(d);
  const mirror = view.side && view.mirror, light = light2D(cam, mirror), seed = seedOf(who.i);
  const f2: FrontOpts = { ...fo, light, seed }, s2: SideOpts = { ...so, light, seed };
  const key = view.side ? `S|${who.okey}|${fkey(s2)}` : `F|${who.okey}|${fkey(f2)}`;
  return {
    key, x, y, z, scale, mirror, tierKey: `${w}`,
    draw: (p) => (view.side ? bodySide(p, who.o, s2) : bodyFront(p, who.o, f2)),
    size: [w, h, k],
  };
};

/** ground shadow under a standing / sitting card (review rounds 2-4), multiply, blue-violet: a TIGHT contact pool right under
 *  the feet (~.5 on screen at the core) so nobody floats, plus by day (cards cast no real shadow) a lighter soft tail
 *  stretched AWAY from the sun, length ~1.6 m / tan(sun elevation), capped. Golden: world.ts casts real card shadows. */
const CONTACT: Record<"day" | "golden", [number, number, number]> = { day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33] };
const TAIL: [number, number, number] = [0.42, 0.44, 0.62];
const toSrgb = (v: number) => { const c = clamp01(v); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c: [number, number, number], k: number) => "#" + c.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
const blob = (out: Stage, x: number, y: number, z: number, sc = 1, k = 1) => {
  const hl = Math.hypot(SUN.x, SUN.z) || 1, ox = -SUN.x / hl, oz = -SUN.z / hl, rot = Math.atan2(-ox, -oz);
  if (LNAME === "day") {
    const el = Math.asin(Math.min(0.99, Math.max(0.1, SUN.y)));
    const len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))) * sc, h = len + 0.55 * sc, c = 0.3 * h; // feet at v = .2 of the card
    const tc = hexOf(TAIL, k);
    out.fx.push({ key: `blob|shadow|${tc}`, cw: 128, ch: 256, draw: (p) => fxShadow(p, tc), x: x + ox * c, y: y + 0.018, z: z + oz * c,
      w: 0.72 * sc, h, flat: true, rot });
  }
  const cc = hexOf(CONTACT[LNAME], k);
  out.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x: x + ox * 0.03 * sc, y: y + 0.022, z: z + oz * 0.03 * sc,
    w: 0.52 * sc, h: 0.4 * sc, flat: true, rot });
};


// ---------------- staging helpers ----------------
export type Stage = { places: Place[]; fx: FxPlace[] };
const SIR: Who = { i: 501, o: SIR_DIGSWORTH, okey: "sir" };
const MAJ: Who = { i: 502, o: MAJOR, okey: "maj" };
const DIG1: Who = { i: 503, o: DIGGER, okey: "d1" };
const DIG2: Who = { i: 504, o: { ...DIGGER, skin: "#f5c9a0", moustache: "#4a3426" }, okey: "d2" };
const FARMER: Who[] = FARMERS.map((o, k) => ({ i: 510 + k, o, okey: `fm${k}` }));
const FRONT = { side: false, mirror: false };
const T = (f: number) => f / FPS;

/** a person; view = "front" or a walking direction (dx, dz) for the profile */
const man = (out: Stage, cam: CamInfo, who: Who, x: number, y: number, z: number, fo: FrontOpts, view: "front" | [number, number] = "front", so: SideOpts = {}, sc = 1, shadow = true, talk = 0) => {
  const v = view === "front" ? FRONT : { ...viewOf(cam, x, z, view[0], view[1]), side: true };
  const pl = person(cam, who, x, y, z, v, fo, so, sc);
  if (talk > 0.12) { const d = pl.draw, tk = q(talk, 8); pl.key += `|t${tk}`; pl.draw = (p) => { setTalk(tk); d(p); setTalk(0); }; }
  out.places.push(pl);
  if (shadow) blob(out, x, y, z, sc);
};
const emuTier = (d: number): [number, number, number] => (d < 3.5 ? [1980, 2200, 2.2] : d < 7 ? [1260, 1400, 1.4] : d < 16 ? [630, 700, 0.7] : d < 42 ? [324, 360, 0.36] : [180, 200, 0.2]);
type EmuP = { mode?: "stand" | "walk" | "run" | "peck"; dist?: number; down?: number; jab?: number; gulp?: number; blink?: number; wide?: boolean; hat?: boolean; front?: boolean;
  tilt?: number; turn?: number; sc?: number; y?: number; shadow?: boolean };
/** an emu at (x, z) heading (dx, dz); dist = metres travelled (drives the gait so the feet stay planted) */
const emu = (out: Stage, cam: CamInfo, i: number, x: number, z: number, dx: number, dz: number, o: EmuP = {}) => {
  const sc = o.sc ?? 1, y = o.y ?? 0, mode = o.mode ?? "stand";
  const tx = cam.pos.x - x, tz = cam.pos.z - z, tl = Math.hypot(tx, tz) || 1, dl = Math.hypot(dx, dz) || 1;
  const c = (tx * dx + tz * dz) / (tl * dl);
  const front = o.front ?? c > 0.8;
  const [w, h, k] = emuTier(cam.pos.distanceTo(tmp.set(x, y + 1.2, z)) / sc);
  const seed = (i % 3) + 1, gait = mode === "walk" || mode === "run" ? GAIT[mode] : null;
  const phase = gait ? q((((o.dist ?? 0) / ((gait.stride * SU * sc) / gait.st) + hh(i, 21)) % 1 + 1) % 1, 24) : 0;
  if (front) {
    const fo: EmuFrontOpts = { phase, walk: !!gait, blink: q(o.blink ?? 0, 2), wide: o.wide, tilt: q(o.tilt ?? 0, 40), hat: o.hat, seed };
    out.places.push({ key: `EF|${fkey(fo)}`, geo: "emuF", x, y, z, scale: sc, draw: (p) => emuFront(p, fo), size: [w, h, k] });
  } else {
    const eo: EmuOpts = { mode, phase, down: q(o.down ?? 0, 24), jab: q(o.jab ?? 0, 6), gulp: o.gulp === undefined || o.gulp < 0 ? -1 : q(o.gulp, 16), blink: q(o.blink ?? 0, 2),
      wide: o.wide, hat: o.hat, turn: o.turn ?? 0, seed };
    out.places.push({ key: `ES|${fkey(eo)}`, geo: "emu", x, y, z, scale: sc, mirror: dx * cam.right.x + dz * cam.right.z < 0, draw: (p) => emuSide(p, eo), size: [w, h, k] });
  }
  if (o.shadow !== false) blob(out, x, y, z, 1.25 * sc);
};
/** the eating loop: head down, three quick pecks, head up, swallow, blink (period 3.4 s, offset per bird) */
const peckAt = (t: number, i: number): EmuP => {
  const u = (((t + 3.4 * hh(i, 31)) % 3.4) + 3.4) % 3.4;
  if (u < 0.36) return { mode: "peck", down: u / 0.36 };
  if (u < 1.32) { const v = (u - 0.36) / 0.96; return { mode: "peck", down: 1, jab: Math.max(0, Math.sin(v * Math.PI * 3)) ** 2 }; }
  if (u < 1.74) return { mode: "peck", down: 1 - (u - 1.32) / 0.42 };
  if (u < 2.4) return { mode: "stand", gulp: (u - 1.74) / 0.66 };
  return { mode: "stand", blink: u > 2.55 && u < 2.68 ? 1 : 0 };
};
const puff = (out: Stage, x: number, y: number, z: number, u: number, s = 1) => {
  if (u < 0 || u >= 1) return;
  out.fx.push({ key: `puff${q(u, 20)}`, cw: 300, ch: 300, draw: (p) => fxPuff(p, q(u, 20)), x, y: y + 0.3 * s, z, w: 1.5 * s, h: 1.5 * s, soft: true });
};
const burst = (out: Stage, x: number, y: number, z: number, u: number, s: number, col = "#ffe27a") => {
  if (u < 0 || u >= 1) return;
  out.fx.push({ key: `burst${q(u, 12)}${col}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, q(u, 12), col, 9, 40, 220), x, y, z, w: s, h: s });
};
/** ricochet spark: short yellow rays flying out from a tiny core (300 x 300) */
const spark = (p: Pen, u: number) => {
  for (let i = 0; i < 7; i++) { const a = (i * Math.PI * 2) / 7 + 0.3, r0 = 22 + 70 * u, r1 = r0 + 55 * (1 - u * 0.6); p.stroke([[150 + r0 * Math.cos(a), 150 + r0 * Math.sin(a)], [150 + r1 * Math.cos(a), 150 + r1 * Math.sin(a)]], 17, "#241726"); p.stroke([[150 + r0 * Math.cos(a), 150 + r0 * Math.sin(a)], [150 + r1 * Math.cos(a), 150 + r1 * Math.sin(a)]], 9, "#ffd84a"); }
  if (u < 0.35) p.ell(150, 150, 20, 20, "#fff6c9", 6);
};
const stars = (out: Stage, x: number, y: number, z: number, t: number, i: number) => {
  const u = q((t * 0.9 + hh(i)) % 1, 30);
  out.fx.push({ key: `stars${u}`, cw: 420, ch: 210, draw: (p) => fxStars(p, u), x, y, z, w: 0.75, h: 0.375 });
};
/** drop-in for the line-up: 0 before f0, falls 1.5 m in 6 frames, tiny settle */
const dropY = (f: number, f0: number) => (f < f0 ? -1 : 1.5 * (1 - easeOut((f - f0) / 6)) ** 2 + (f - f0 >= 6 && f - f0 < 10 ? 0.05 * Math.sin(((f - f0 - 6) / 4) * Math.PI) : 0));

// ---------------- 3D prop poses ----------------
export type GunPose = { x: number; y: number; z: number; yaw: number; pitch: number; spin: number; kick: number; tripod: boolean };
export type Props = {
  guns: GunPose[];
  truck: { x: number; y: number; z: number; yaw: number; pitch: number; roll: number; wheel: number; gunPitch: number; gunYaw: number } | null;
  heap: boolean; bench: number; board: [number, number] | null; eaten: number;
};
export const G5: V3 = [PAD[0] + 0.2, 0, -2.5];
export const AIM5: [number, number] = [-0.38, 0.925];
export const G7: V3 = [DAM[0], 0, DAM[2] - 14.5];
const fireKick = (f: number) => (firing(f) ? (f % 2 ? 1 : 0.35) : 0);
/** muzzle of a gun pose in world space */
export const muzzle = (g: GunPose): V3 => {
  const L = 0.86, cy = Math.cos(g.pitch), sy = Math.sin(g.pitch);
  return [g.x + Math.sin(g.yaw) * L * cy, g.y + 1.24 + L * sy, g.z + Math.cos(g.yaw) * L * cy];
};
export const propsAt = (id: number, f: number): Props => {
  const t = T(f), P: Props = { guns: [], truck: null, heap: false, bench: -1, board: null, eaten: f >= 296 ? clamp01((f - 296) / 55) : 0 };
  const gun = (x: number, y: number, z: number, yaw: number, pitch = 0, spin = 0, kick = 0): GunPose => ({ x, y, z, yaw, pitch, spin, kick, tripod: true });
  if (id === 1 && f < 87) P.guns.push(gun(-1.35, 0, 4.7, -Math.PI / 2));
  if (id === 1 && f >= 125) P.guns.push({ ...gun(2.0, -0.55, 6.2, 0.6, -0.5), tripod: true });
  if (id === 4) [[0.62, 524, 2.75], [-0.62, 531, -2.75]].forEach(([x, f0, yaw]) => { const y = dropY(f, f0); if (y >= 0) P.guns.push(gun(x, y, ROAD_Z - 0.25, yaw)); });
  if (id === 5 || id === 6) {
    const k = fireKick(f);
    P.guns.push(gun(G5[0], 0, G5[2], Math.atan2(AIM5[0], AIM5[1]) + (id === 6 ? 0.25 * Math.sin(t * 5) : 0), 0.02 + 0.015 * k, f >= FIRE5[0] ? (f - FIRE5[0]) * 0.5 : 0, k));
  }
  if (id === 7 || id === 8) {
    const k = fireKick(f), jam = f >= JAM, droop = jam ? -0.2 * smooth((f - JAM - 2) / 8) : 0;
    P.guns.push(gun(G7[0], 0, G7[2], 0, 0.02 + 0.02 * k + droop, f >= FIRE8[0] ? (Math.min(f, JAM) - FIRE8[0]) * 0.5 : 0, k));
  }
  if (id === 9 || id === 10) {
    const b = truckBounce(f), mv = f >= 985;
    P.truck = { x: truckX(f), y: mv ? b.y : 0, z: ROAD_Z, yaw: 0, pitch: mv ? b.pitch : 0, roll: mv ? b.roll : 0, wheel: (truckX(f) + 30) / 0.42,
      gunPitch: f >= 1043 ? 0.5 * Math.sin(t * 13 + 1.3) + 0.25 * Math.sin(t * 7.3) : 0.03 * Math.sin(t * 2), gunYaw: f >= 1043 ? 0.35 * Math.sin(t * 5.1) : 0 };
  }
  if (id === 14 && f < 1632) { const b = truckBounce(1000 + f); P.truck = { x: leaveX(f), y: b.y * 0.6, z: ROAD_Z, yaw: Math.PI, pitch: b.pitch * 0.6, roll: b.roll * 0.6, wheel: -leaveX(f) / 0.42, gunPitch: -0.5, gunYaw: 0 }; }
  if (id === 11) P.heap = true;
  if (id === 12 && f >= 1378) P.bench = Math.max(0, Math.min(10, Math.floor((f - 1386) / 4) + 1));
  if (id === 15) P.board = [f >= 1675 ? 1 : 0, f >= 1705 ? 1 : 0];
  return P;
};

// ---------------- the shots ----------------
const N_MOB = 230;
const mobAt = (i: number, t: number) => {
  // walking north into the wheat through the broken fence; each bird has a lane, funnels to the gap, fans out and stops to eat
  const x0 = (hh(i, 41) - 0.5) * 40, z0 = -74 + hh(i, 42) * 70, zs = FENCE_Z + 2 + hh(i, 43) * 16;
  const z = Math.min(zs, z0 + 1.45 * (t - 5.07) + 6), kf = smooth((z + 16) / 22) * (1 - 0.55 * smooth((z - FENCE_Z) / 8));
  const xg = (GAP[0] + 0.6) + hh(i, 44) * (GAP[1] - GAP[0] - 1.2), x = x0 + (xg - x0) * kf + (z > FENCE_Z ? (hh(i, 45) - 0.5) * 14 * smooth((z - FENCE_Z) / 8) : 0);
  return { x, z, eating: z >= zs - 0.01, dist: z - z0 };
};
const N50 = 50, M5: V3 = [PAD[0] - 4.5, 0, 9], RUN0 = 640;
const fiftyAt = (i: number, f: number) => {
  const a = hh(i, 51) * Math.PI * 2, r = Math.sqrt(hh(i, 52)), x0 = M5[0] + Math.cos(a) * r * 4.6, z0 = M5[2] + Math.sin(a) * r * 5;
  const ra = Math.atan2(z0 - M5[2], x0 - M5[0]) + (hh(i, 53) - 0.5) * 0.9, d = Math.max(0, (f - RUN0 - 5 * hh(i, 54)) / FPS), dist = 6 * d * smooth(d / 0.5);
  return { x: x0 + Math.cos(ra) * dist, z: z0 + Math.sin(ra) * dist, dx: Math.cos(ra), dz: Math.sin(ra), dist, face: hh(i, 55) < 0.5 ? 1 : -1 };
};
const N_DAM = 150;
const damAt = (i: number, t: number) => {
  const row = Math.floor(i / 10), x = DAM[0] + ((i % 10) - 4.5) * 2.0 + (hh(i, 61) - 0.5) * 2.4, stop = DAM[2] + 11.3 + row * 2.2 + hh(i, 62) * 2.6;
  const z0 = stop + 9 + hh(i, 63) * 3, z = Math.max(stop, z0 - 1.5 * (t - 25.2));
  return { x, z, stopped: z <= stop + 0.01, dist: z0 - z };
};

export const stage = (id: number, f: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] }, t = T(f), s = SHOTS[id - 1];
  LNAME = s.light;
  findSun(cam, SUN);
  const talk = TALK[Math.min(TALK.length - 1, f)] ?? 0;
  const bl = (i: number) => lidAt(t, i);
  switch (id) {
    case 1: {
      if (f < 87) {
        man(out, cam, SIR, 0.02, 0, -3.2, { mode: "stand", expr: "neutral", point: smooth((f - 8) / 8), blink: bl(1), facing: 0 }, "front", {}, 1, true, talk);
        man(out, cam, DIG1, -0.45, 0, 4.7, {}, [-1, 0], { mode: "push", pose: 0.9, expr: "stern", blink: bl(2), hand: [468, 468] });
        [[-2.75, 4.5], [-3.45, 5.6], [-3.95, 4.1]].forEach(([x, z], i) => emu(out, cam, i, x, z, 1, 0, { blink: bl(10 + i) }));
      } else if (f < 125) {
        emu(out, cam, 0, 0, 6, 0, -1, { front: true, blink: f >= 99 && f < 103 ? 1 : 0, tilt: 0.22 * smooth((f - 108) / 7) });
        emu(out, cam, 1, 1.5, 8.2, 0, -1, { front: true, blink: bl(11) }); emu(out, cam, 2, -1.6, 7.8, 0, -1, { front: true, blink: bl(12) });
      } else {
        const ex: Expr[] = ["dazed", "pained", "dazed"];
        [[1.25, 5.2, DIG1], [0.4, 5.0, MAJ], [-0.45, 5.2, DIG2]].forEach(([x, z, w], i) => {
          man(out, cam, w as Who, x as number, 0, z as number, { mode: "sit", expr: ex[i], blink: bl(20 + i) });
          stars(out, x as number, 1.45, z as number, t, i);
        });
        emu(out, cam, 0, -1.3, 5.5, 0, -1, { front: true, hat: true, wide: true, sc: 1.1, blink: f >= 138 && f < 141 ? 1 : 0 });
      }
      break;
    }
    case 2: {
      if (f < 296) {
        for (let i = 0; i < N_MOB; i++) {
          const m = mobAt(i, t), m2 = mobAt(i, t + 0.2);
          if (m.eating) emu(out, cam, i, m.x, m.z, i % 2 ? 1 : -1, 0, peckAt(t, i));
          else emu(out, cam, i, m.x, m.z, m2.x - m.x, m2.z - m.z, { mode: "walk", dist: m.dist, blink: bl(i) });
        }
      } else {
        const near: [number, number, number][] = [[1.3, 13.4, -1], [0.0, 14.0, 1], [-1.25, 13.3, 1]];
        near.forEach(([x, z, d], i) => emu(out, cam, i, x, z, d, 0, peckAt(t, i * 7 + 1)));
        for (let i = 0; i < 16; i++) emu(out, cam, 30 + i, (hh(i, 71) - 0.5) * 26, 17 + hh(i, 72) * 22, i % 2 ? 1 : -1, 0, peckAt(t, 30 + i));
      }
      break;
    }
    case 3: {
      const ex: Expr[] = ["pained", "shock", "nervous"];
      [[FARM[0] - 3.5, FARM[2] - 2.3], [FARM[0] - 4.6, FARM[2] - 2.75], [FARM[0] - 5.65, FARM[2] - 2.25]].forEach(([x, z], i) => {
        const beg = 0.5 + 0.5 * Math.sin(t * 7 + i * 1.4), hop = 0.05 * Math.max(0, Math.sin(t * 7 + i * 1.4));
        man(out, cam, FARMER[i], x, hop, z, { mode: "stand", expr: ex[i], cheer: q(0.55 + 0.45 * beg, 12), blink: bl(40 + i), look: 0 });
      });
      emu(out, cam, 3, FARM[0] - 6.4, FARM[2] + 4.2, -1, 0, peckAt(t, 5));
      emu(out, cam, 4, FARM[0] - 2.6, FARM[2] + 5.4, 1, 0, peckAt(t, 9));
      break;
    }
    case 4: {
      const zr = ROAD_Z;
      const ym = dropY(f, 455), y1 = dropY(f, 486), y2 = dropY(f, 494);
      if (ym >= 0) { man(out, cam, MAJ, 0, ym, zr, { mode: "stand", expr: "stern", blink: bl(50) }, "front", {}, 1, ym < 0.05); puff(out, 0, 0, zr - 0.2, (f - 461) / 12); }
      if (y1 >= 0) { man(out, cam, DIG1, 1.3, y1, zr, { mode: "stand", expr: "neutral", blink: bl(51) }, "front", {}, 1, y1 < 0.05); puff(out, 1.3, 0, zr - 0.2, (f - 492) / 12); }
      if (y2 >= 0) { man(out, cam, DIG2, -1.3, y2, zr, { mode: "stand", expr: "grin", blink: bl(52) }, "front", {}, 1, y2 < 0.05); puff(out, -1.3, 0, zr - 0.2, (f - 500) / 12); }
      puff(out, 0.62, 0, zr - 0.5, (f - 530) / 12, 0.8); puff(out, -0.62, 0, zr - 0.5, (f - 537) / 12, 0.8);
      break;
    }
    case 5: case 6: {
      const crew = true;
      if (crew) {
        const gx = G5[0] - AIM5[0] * 0.95, gz = G5[2] - AIM5[1] * 0.95, sh = firing(f) ? 0.012 * (f % 2 ? 1 : -1) : 0;
        if (id === 5 || f < 700) man(out, cam, DIG1, gx + sh, 0, gz, {}, AIM5, { mode: "push", pose: 0.9, expr: f >= FIRE5[0] ? "grin" : "stern", blink: bl(60), hand: [468, 468] });
        else man(out, cam, DIG1, gx, 0, gz, { mode: "stand", expr: "shock", look: Math.sin(t * 5) > 0 ? 1 : -1, blink: 0 });
        if (id === 5 || f < 700) man(out, cam, MAJ, G5[0] - 1.1, 0, G5[2] - 1.1, {}, AIM5, { mode: "stand", expr: "stern", blink: bl(61) });
        else man(out, cam, MAJ, G5[0] - 1.1, 0, G5[2] - 1.1, { mode: "stand", expr: "pained", blink: bl(61), shrug: 1 });
        
      }
      if (id === 5 || f < 700) for (let i = 0; i < N50; i++) {
        const e = fiftyAt(i, f);
        if (f < FIRE5[0] + 2) emu(out, cam, i, e.x, e.z, e.face, 0, peckAt(t, i));
        else if (e.dist <= 0) emu(out, cam, i, e.x, e.z, e.face, 0, { mode: "stand", wide: true });
        else { emu(out, cam, i, e.x, e.z, e.dx, e.dz, { mode: "run", dist: e.dist, wide: true, front: false }); if (i % 3 === 0) puff(out, e.x - e.dx * 1.2, 0, e.z - e.dz * 1.2, ((f + i * 5) % 14) / 14, 0.9); }
      }
      if (id === 6 && f >= 700) for (let i = 0; i < 7; i++) {
        const d = i % 2 ? 1 : -1, x = PAD[0] - 0.2 - d * (11 + i * 3.2) + d * 9 * (t - 23.33), z = -0.6 + i * 0.75;
        emu(out, cam, 80 + i, x, z, d, 0, { mode: "run", dist: 9 * t + i, wide: true, front: false });
      }
      if (firing(f) && id === 5) {
        const g = propsAt(5, f).guns[0], m = muzzle(g);
        if (f % 2) burst(out, m[0], m[1], m[2], 0.25, 0.75);
        for (let k = 0; k < 3; k++) { const n = Math.floor((f - FIRE5[0]) / 3) - k, u = ((f - FIRE5[0]) - n * 3 - 0) / 9; if (n >= 0) puff(out, M5[0] + (hh(n, 81) - 0.5) * 8, 0, M5[2] + (hh(n, 82) - 0.5) * 8, u, 0.7); }
      }
      break;
    }
    case 7: case 8: {
      const wide8 = id === 8 && f >= 936;
      if (!wide8) {
        const sh = firing(f) ? 0.012 * (f % 2 ? 1 : -1) : 0;
        man(out, cam, DIG1, G7[0], 0, G7[2] - 0.95 + sh, {}, [0, 1], { mode: "push", pose: 0.9, expr: f >= JAM ? "shock" : f >= FIRE8[0] ? "grin" : "stern", blink: bl(70), hand: [468, 468] });
        if (id === 7) man(out, cam, MAJ, G7[0] - 1.35, 0, G7[2] - 1.0, {}, [0, 1], { mode: "stand", expr: "stern", blink: bl(71) });
      }
      if (id === 7 || wide8) for (let i = 0; i < N_DAM; i++) {
        const e = damAt(i, t);
        if (wide8) emu(out, cam, i, e.x, e.z, 0, -1, { front: true, blink: (f >= 941 && f < 944 && i % 2 === 0) || bl(i) > 0.5 ? 1 : 0, tilt: i % 10 === 4 ? 0.2 * smooth((f - 939) / 6) : 0 });
        else if (e.stopped && Math.floor(i / 10) === 0) emu(out, cam, i, e.x, e.z, i % 2 ? 1 : -1, 0, peckAt(t, i));
        else if (e.stopped) emu(out, cam, i, e.x, e.z, 0, -1, { front: true, blink: bl(i) });
        else emu(out, cam, i, e.x, e.z, 0, -1, { mode: "walk", dist: e.dist, front: true, blink: bl(i) });
      }
      if (id === 8 && !wide8) {
        const g = propsAt(8, f).guns[0], m = muzzle(g);
        if (firing(f) && f % 2) burst(out, m[0], m[1], m[2], 0.25, 0.7);
        if (firing(f)) { const n = (f - FIRE8[0]) % 6, u = n / 6; out.fx.push({ key: "case", cw: 60, ch: 120, draw: (p) => { p.poly([[18, 10], [42, 10], [42, 110], [18, 110]], "#d9a938", 7); }, x: g.x + 0.12 + 0.5 * u, y: 1.3 + 0.5 * u - 1.6 * u * u, z: g.z - 0.1 - 0.25 * u, w: 0.05, h: 0.1, rot: u * 9 }); }
        for (let k = 0; k < 3; k++) puff(out, g.x, 1.42 + 0.45 * ((f - JAM - k * 5) / 22), g.z + 0.05, (f - JAM - k * 5) / 22, 0.45);
        burst(out, g.x, 1.3, g.z - 0.05, (f - JAM) / 5, 0.6, "#ffffff");
      }
      break;
    }
    case 9: case 10: {
      const x = truckX(f), b = truckBounce(f), mv = f >= 985, by = mv ? b.y : 0, onBed = id === 10 && f >= 1100;
      const hop = onBed ? 0.22 * Math.abs(Math.sin(t * 13.0 - 0.5)) : 0;
      // driver in the open cab, gunner standing on the tray behind the pedestal gun
      man(out, cam, DIG2, x + 2.55, 0.62 + by, ROAD_Z + (onBed ? 0 : -0.38), { mode: "sit", expr: f >= 1043 ? "nervous" : "stern", blink: bl(90) }, "front", {}, 0.82, false);
      if (onBed) man(out, cam, DIG1, x + 0.55, 1.02 + by + hop, ROAD_Z, {}, [1, 0], { mode: "push", pose: 0.75, expr: "shock", blink: 0, hand: [455, 455 + 40 * Math.sin(t * 13)] }, 1, false);
      else man(out, cam, DIG1, x + 0.75, 1.02 + by + (f >= 1043 ? 0.12 * Math.abs(Math.sin(t * 13 - 0.5)) : 0), ROAD_Z + 0.36, { mode: "stand", expr: f >= 1043 ? "shock" : "stern", blink: bl(91) }, "front", {}, 1, false);
      if (!onBed && f >= 1000) for (let i = 0; i < 5; i++) {
        const ex = chaseEmuX(f, i), ez = ROAD_Z + [0.3, -1.0, 1.3, -0.4, 0.9][i];
        emu(out, cam, i, ex, ez, 1, 0, { mode: "run", dist: ex + 40, front: true, wide: false });
        puff(out, ex - 1.2, 0, ez, ((f + i * 4) % 12) / 12, 0.9);
      }
      if (mv) for (let k = 0; k < 3; k++) puff(out, x - 0.6 - 0.9 * k, 0.1, ROAD_Z + (k - 1) * 0.5, ((f + k * 5) % 15) / 15, 1.3);
      if (onBed && f >= 1132) { const u = (f - 1132) / 26; if (u < 1) out.fx.push({ key: "hatfly", cw: 200, ch: 120, draw: (p) => { p.poly([[10, 96], [190, 96], [176, 112], [24, 112]], "#6f6442", 6); p.poly([[52, 96], [58, 34], [100, 44], [142, 34], [148, 96]], "#9a8a5c", 6); },
        x: x + 0.55 - 3.2 * u, y: 3.2 + by + 1.4 * u - 2.2 * u * u, z: ROAD_Z - 0.1, w: 0.62, h: 0.37, rot: -u * 5 }); }
      break;
    }
    case 11: {
      if (f < 1272) {
        const ex: Expr[] = ["dazed", "pained", "relief"];
        [[HEAP[0] + 1.45, DIG1], [HEAP[0], MAJ], [HEAP[0] - 1.45, DIG2]].forEach(([x, w], i) => man(out, cam, w as Who, x as number, 0, HEAP[2] + 2.7, { mode: "sit", expr: ex[i], blink: bl(100 + i) }));
      } else {
        [MAJ, DIG1, DIG2].forEach((w, i) => {
          const x = -8.8 - 1.25 * (t - 42.4) - i * 1.3, ph = (((t * 1.25) / 1.6 + i * 0.37) % 1 + 1) % 1;
          man(out, cam, w, x, 0, ROAD_Z + (i - 1) * 0.12, {}, [-1, 0], { mode: "march", phase: q(ph, 60), expr: i === 0 ? "stern" : "pained", stomp: 0.5, stride: 0.9, blink: bl(110 + i) });
        });
        emu(out, cam, 2, -5.6, ROAD_Z - 3.4, -1, 0, { mode: "stand", blink: bl(113) });
      }
      break;
    }
    case 12: {
      if (f < 1378) {
        [[MAJ, 0, 0], [DIG1, -1.3, 0.85], [DIG2, -1.3, -0.85]].forEach(([w, dx, dz], i) => {
          const x = -20.5 + 1.5 * (t - 43.8) + (dx as number), ph = (((t * 1.5) / 1.6 + i * 0.5) % 1 + 1) % 1;
          man(out, cam, w as Who, x, 0, ROAD_Z + (dz as number), { mode: "march", phase: q(ph, 60), expr: "stern", blink: bl(120 + i), lift: 50 });
        });
      } else {
        const bx = HEAP[0] - 10, n = Math.floor((f - 1386) / 4) + 1;
        emu(out, cam, 1, bx, HEAP[2] + 1.25, 0, -1, { front: true, blink: f >= 1432 && f < 1436 ? 1 : 0, tilt: -0.28 * smooth((f - 1424) / 8), wide: f < 1424 && n > 0 && n <= 10 });
        if (n >= 1 && n <= 10 && (f - 1386) % 4 < 3) burst(out, bx + 0.765 - (n - 1) * 0.17, 1.06, HEAP[2] - 0.05, ((f - 1386) % 4) / 3, 0.32, "#ffffff");
      }
      break;
    }
    case 13: {
      if (f < 1505) man(out, cam, MAJ, 0, 0, ROAD_Z, { mode: "stand", expr: "stern", blink: bl(130), point: smooth((f - 1462) / 8) }, "front", {}, 1, true, talk * 0.9);
      else {
        const z = 7.6 - 0.95 * (t - 50.17);
        emu(out, cam, 0, 0, z, 0, -1, { mode: "walk", dist: 0.95 * (t - 50.17), front: true, blink: 0 });
        emu(out, cam, 1, 1.9, z + 2.6, 0, -1, { mode: "walk", dist: 0.95 * (t - 50.17) + 0.3, front: true }); emu(out, cam, 2, -2.0, z + 3.1, 0, -1, { mode: "walk", dist: 0.95 * (t - 50.17) + 0.6, front: true });
        for (let k = 0; k < 2; k++) { const n = Math.floor((f - 1508) / 4) - k, u = ((f - 1508) - n * 4) / 7; if (n >= 0 && u < 1) out.fx.push({ key: `spark${q(u, 7)}`, cw: 300, ch: 300, draw: (p) => spark(p, q(u, 7)), x: (hh(n, 91) - 0.5) * 0.6, y: 0.7 + hh(n, 92) * 0.6, z: z - 0.3, w: 0.62, h: 0.62, rot: n * 1.3 }); }
      }
      break;
    }
    case 14: {
      if (f < 1632) {
        const x = leaveX(f), b = truckBounce(1000 + f);
        man(out, cam, DIG1, x + 0.9, 1.02 + b.y * 0.6, ROAD_Z + 0.4, { mode: "sit", expr: "dazed", blink: bl(140) }, "front", {}, 1, false);
        man(out, cam, MAJ, x + 0.9, 1.02 + b.y * 0.6, ROAD_Z - 0.4, { mode: "sit", expr: "pained", blink: bl(141) }, "front", {}, 1, false);
        for (let k = 0; k < 4; k++) puff(out, x + 1.6 + 1.1 * k, 0.0, ROAD_Z + (k % 2 - 0.5) * 0.8, ((f + k * 4) % 16) / 16, 0.9);
      } else {
        const near: [number, number, number][] = [[1.3, 13.4, -1], [0.0, 14.0, 1], [-1.25, 13.3, 1]];
        near.forEach(([x, z, d], i) => {
          if (i === 1 && f >= 1650) emu(out, cam, i, x, z, 0, -1, { front: true, blink: f >= 1660 && f < 1664 ? 1 : 0 });
          else emu(out, cam, i, x, z, d, 0, peckAt(t, i * 7 + 1));
        });
        for (let i = 0; i < 16; i++) emu(out, cam, 30 + i, (hh(i, 71) - 0.5) * 26, 17 + hh(i, 72) * 22, i % 2 ? 1 : -1, 0, peckAt(t, 30 + i));
      }
      break;
    }
    case 15: {
      const sh = smooth((f - 1705) / 7);
      man(out, cam, SIR, 0.9, 0, -3, { mode: "stand", expr: f >= 1705 ? "neutral" : "neutral", shrug: sh > 0.05 ? q(sh, 10) : undefined, blink: bl(1) }, "front", {}, 1, true, talk);
      const g = f >= 1732 && f < 1752 ? (f - 1732) / 20 : -1;
      emu(out, cam, 0, -0.5, -3.1, 1, 0, { mode: "stand", hat: true, wide: f >= 1675 && f < 1700, gulp: g, blink: f >= 1754 && f < 1758 ? 1 : 0, front: false });
      break;
    }
  }
  return out;
};

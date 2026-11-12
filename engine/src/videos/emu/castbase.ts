// The cast as lit flat sprites in the 3D world (from the claude-animated-shorts cast.ts, MIT, generalised).
// Each frame every character asks for a drawing (a key + a draw call); the pool keeps one canvas per distinct
// drawing. Characters are yaw-only billboards shaded by cardShade(); standing ones get a soft multiply contact blob.
// Cards, effects and blobs live on the NOINK layer so the world ink pass never outlines their quads.
import * as THREE from "three";
import { Pen, bodyFront, bodySide, setTalk, fxShadow, fxContact, Outfit, FrontOpts, SideOpts } from "./toon";
import { emuSide, emuFront, EmuOpts, EMU_HIP_X } from "./emutoon";
import { bearFront, BearOpts } from "./beartoon";
import { NOINK } from "./ink";
import { cardShade, blobMaterial, CARD_K } from "./cardshade";
import { FPS, clamp01 } from "./story";

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
export type GeoName = "body" | "emuSide" | "emuFront";
const plane = (w: number, h: number, ox: number, sole: number) => { const g = new THREE.PlaneGeometry(w * SU, h * SU); g.translate((w / 2 - ox) * SU, (sole - h / 2) * SU, 0); return g; };
export const GEO: Record<GeoName, THREE.BufferGeometry> = {
  body: plane(600, 1000, 300, 975),
  emuSide: plane(900, 1000, EMU_HIP_X, 975),
  emuFront: plane(900, 1000, 450, 975),
};
const CARD = new THREE.PlaneGeometry(1, 1);

/** lit flat character: cardShade() material, receives shadows, casts its silhouette when the light preset says so */
export class Actor {
  mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial; dmat: THREE.MeshDepthMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.mat.alphaToCoverage = false;
    this.dmat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(GEO.body, this.mat);
    this.mesh.customDepthMaterial = this.dmat;
    this.mesh.onBeforeRender = (r) => { const rt = r.getRenderTarget(); CARD_K.uPx.value = (rt ? rt.height : r.domElement.height) / 1920; };
    this.mesh.castShadow = false; this.mesh.receiveShadow = true; this.mesh.visible = false;
    this.mesh.rotation.order = "YXZ"; this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  bind() { const t = this.r?.tex; if (t) { this.mat.map = t; this.dmat.map = t; } }
}
/** unlit effect card: hard cut-out (ink drawings), soft see-through (dust, smoke) or a multiply ground blob */
export class Fx {
  mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; soft: THREE.MeshBasicMaterial; blob: THREE.MeshBasicMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mat.alphaToCoverage = false;
    this.soft = new THREE.MeshBasicMaterial({ map: blank, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.blob = blobMaterial(blank);
    this.mesh = new THREE.Mesh(CARD, this.mat);
    this.mesh.visible = false; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  bind(opacity = 1, tint = 0xffffff) {
    const t = this.r?.tex;
    if (!t) return;
    if (this.r!.key.includes("|blob|")) {
      if (t.generateMipmaps) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; }
      this.blob.map = t; this.mesh.material = this.blob; this.mesh.renderOrder = 0.5;
    } else {
      this.mat.map = t; this.soft.map = t; this.soft.opacity = opacity; this.mat.color.set(tint); this.soft.color.set(tint);
      this.mesh.renderOrder = this.mesh.material === this.soft ? 2 : 0;
    }
  }
}

// ---------------- placements ----------------
export type Place = {
  key: string; draw: (p: Pen) => void; x: number; y: number; z: number;
  scale?: number; mirror?: boolean; yaw?: number; geo?: GeoName; roll?: number; size?: [number, number, number]; shadow?: boolean;
};
export type FxPlace = { key: string; cw: number; ch: number; draw: (p: Pen) => void; x: number; y: number; z: number; w: number; h: number;
  flat?: boolean; rot?: number; soft?: boolean; opacity?: number; tint?: number; lit?: boolean };
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; sun: THREE.Vector3; light: "day" | "golden" };
export type Stage = { places: Place[]; fx: FxPlace[] };

export const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
export const q = (v: number, n = 120) => Math.round(v * n) / n;
/** head-shape seed (7 shapes) */
const seedOf = (i: number) => ((i * 5 + 3) % 7) + 1;
/** drawing resolution by distance: [scale from the design canvas]; sized for the 1440 x 2560 final */
const tierK = (d: number) => (d < 2.6 ? 3.0 : d < 5.5 ? 1.8 : d < 14 ? 0.8 : d < 32 ? 0.4 : 0.22);

const tmp = new THREE.Vector3();
/** canvas angle the sun comes FROM on an upright card facing the camera, in 45-degree steps (small texture cache) */
const light2D = (cam: CamInfo, mirror: boolean) => {
  const sx = cam.sun.dot(cam.right) * (mirror ? -1 : 1), sy = -cam.sun.y;
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
};
/** which drawing to use for someone at (x, z) facing along (dx, dz): front, back or side (+ mirror) */
export const viewOf = (cam: CamInfo, x: number, z: number, dx: number, dz: number) => {
  const tx = cam.pos.x - x, tz = cam.pos.z - z, tl = Math.hypot(tx, tz) || 1, dl = Math.hypot(dx, dz) || 1;
  const c = (tx * dx + tz * dz) / (tl * dl);
  return { c, mirror: dx * cam.right.x + dz * cam.right.z < 0, fs: Math.round(Math.sqrt(Math.max(0, 1 - c * c)) * 20) / 20 };
};

// ---------------- life: blinks ----------------
const LID = [0.5, 1, 1, 0.5];
/** eyelid 0 open .. 1 shut: 4-frame blinks every 0.5-2.3 s, plus a blink across every expression swap */
export const lidAt = (t: number, i: number, swaps: number[] = []) => {
  const f = Math.round(t * FPS);
  for (const ts of swaps) { const k = f - Math.round(ts * FPS) + 3; if (k >= 0 && k < 4) return LID[k]; }
  let s = Math.round(-60 * hh(i, 9));
  for (let n = 0; s <= f && n < 600; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(15 + 54 * hh(i * 31 + n, 13));
  }
  return 0;
};
const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));

export type Who = { i: number; o: Outfit; okey: string };
export type PersonOpts = { side?: boolean; mirror?: boolean; scale?: number; talk?: number; fo?: FrontOpts; so?: SideOpts; yaw?: number };
/** one human drawing in the 600 x 1000 design space, sized by distance, lit from the scene's sun */
export const person = (out: Stage, cam: CamInfo, who: Who, x: number, y: number, z: number, o: PersonOpts = {}, shadow = true): Place => {
  const scale = o.scale ?? 1, d = cam.pos.distanceTo(tmp.set(x, y + 1.2, z)) / scale, k = tierK(d);
  const side = !!o.side, mirror = side && !!o.mirror, light = light2D(cam, mirror), seed = seedOf(who.i);
  const talk = Math.round(clamp01(o.talk ?? 0) * 4) / 4;
  const f2: FrontOpts = { ...(o.fo ?? {}), light, seed }, s2: SideOpts = { ...(o.so ?? {}), light, seed };
  const key = (side ? `S|${who.okey}|${fkey(s2)}` : `F|${who.okey}|${fkey(f2)}`) + `|t${talk}`;
  const pl: Place = {
    key, x, y, z, scale, mirror, geo: "body", yaw: o.yaw,
    draw: (p) => { setTalk(talk); if (side) bodySide(p, who.o, s2); else bodyFront(p, who.o, f2); setTalk(0); },
    size: [Math.round(600 * k), Math.round(1000 * k), k],
  };
  out.places.push(pl);
  if (shadow) blob(out, cam, x, y, z, scale);
  return pl;
};

export type EmuAct = EmuOpts & { i: number; x: number; y?: number; z: number; dx: number; dz: number; scale?: number; view?: "side" | "front" | "back"; mirror?: boolean; shadow?: boolean; roll?: number };
/** one emu: picks the side / front / back drawing from the travel direction relative to the lens */
export const emu = (out: Stage, cam: CamInfo, a: EmuAct): Place => {
  const { i, x, z, dx, dz } = a, y = a.y ?? 0, scale = a.scale ?? 0.92 + 0.12 * hh(i, 41);
  const v = viewOf(cam, x, z, dx, dz);
  const view = a.view ?? (v.c > 0.66 ? "front" : v.c < -0.66 ? "back" : "side");
  const mirror = view === "side" && (a.mirror ?? v.mirror);
  const d = cam.pos.distanceTo(tmp.set(x, y + 1.2, z)) / scale, k = tierK(d) * 0.9;
  const light = light2D(cam, mirror);
  const phaseQ = a.mode === "run" ? 20 : 30;
  const o: EmuOpts = { mode: a.mode, phase: a.phase === undefined ? undefined : Math.round((((a.phase % 1) + 1) % 1) * phaseQ) / phaseQ, peck: a.peck === undefined ? undefined : q(a.peck, 16),
    jab: a.jab === undefined ? undefined : q(a.jab, 4), gulp: a.gulp === undefined || a.gulp < 0 ? undefined : q(a.gulp, 10), reach: a.reach, blink: a.blink, look: a.look,
    expr: a.expr, seed: (i % 9) + 1, nod: a.nod === undefined ? undefined : q(a.nod, 0.5), light, leader: a.leader, cap: a.cap };
  if (view !== "side") { o.peck = undefined; o.jab = undefined; o.gulp = undefined; if (o.mode === "peck") o.mode = "stand"; }
  const key = `E|${view}|${fkey(o)}`;
  const pl: Place = {
    key, x, y, z, scale, mirror, roll: a.roll, geo: view === "side" ? "emuSide" : "emuFront",
    draw: (p) => (view === "side" ? emuSide(p, o) : emuFront(p, { ...o, back: view === "back" })),
    size: [Math.round(900 * k), Math.round(1000 * k), k],
  };
  out.places.push(pl);
  if (a.shadow !== false) blob(out, cam, x, y, z, scale * 1.25);
  return pl;
};

/** ground shadow under a standing card: a tight contact pool under the feet, plus by day a soft tail away from the sun */
const CONTACT: Record<"day" | "golden", [number, number, number]> = { day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33] };
const TAIL: [number, number, number] = [0.42, 0.44, 0.62];
const toSrgb = (v: number) => { const c = clamp01(v); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c: [number, number, number], k: number) => "#" + c.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
export const blob = (out: Stage, cam: CamInfo, x: number, y: number, z: number, sc = 1, k = 1) => {
  const S = cam.sun, hl = Math.hypot(S.x, S.z) || 1, ox = -S.x / hl, oz = -S.z / hl, rot = Math.atan2(-ox, -oz);
  const el = Math.asin(Math.min(0.99, Math.max(0.1, S.y)));
  const len = Math.min(cam.light === "golden" ? 4.2 : 2.4, Math.max(0.5, 1.6 / Math.tan(el))) * sc, h = len + 0.55 * sc, c = 0.3 * h;
  const tc = hexOf(TAIL, k * (cam.light === "golden" ? 0.85 : 1));
  out.fx.push({ key: `blob|shadow|${tc}`, cw: 128, ch: 256, draw: (p) => fxShadow(p, tc), x: x + ox * c, y: y + 0.018, z: z + oz * c, w: 0.72 * sc, h, flat: true, rot });
  const cc = hexOf(CONTACT[cam.light], k);
  out.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x: x + ox * 0.03 * sc, y: y + 0.022, z: z + oz * 0.03 * sc, w: 0.52 * sc, h: 0.4 * sc, flat: true, rot });
};

export type BearAct = BearOpts & { x: number; y?: number; z: number; scale?: number; shadow?: boolean };
/** Wojtek: always the front drawing (he faces the lens); the cub is the same bear at a small scale */
export const bear = (out: Stage, cam: CamInfo, a: BearAct): Place => {
  const y = a.y ?? 0, scale = a.scale ?? (a.cub ? 0.5 : 1.02);
  const d = cam.pos.distanceTo(tmp.set(a.x, y + 1.0, a.z)) / scale, k = tierK(d) * 0.9;
  const o: BearOpts = { pose: a.pose, expr: a.expr, blink: a.blink, look: a.look, cub: a.cub, light: light2D(cam, false), seed: 1,
    phase: a.phase === undefined ? undefined : Math.round((((a.phase % 1) + 1) % 1) * 24) / 24, walk: a.walk, cap: a.cap, stripes: a.stripes, k: a.k === undefined ? undefined : q(a.k, 8), crate: a.crate };
  const pl: Place = { key: `B|${fkey(o)}`, x: a.x, y, z: a.z, scale, geo: "emuFront", draw: (p) => bearFront(p, o), size: [Math.round(900 * k), Math.round(1000 * k), k] };
  out.places.push(pl);
  if (a.shadow !== false) blob(out, cam, a.x, y, a.z, scale * 1.5);
  return pl;
};

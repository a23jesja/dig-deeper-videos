// Extra sets for "I Survived the Titanic: Part 3", all plain three.js geometry on top of the environment kit and living in
// zone "deck" next to the ship (deckset.ts): lifeboat hulls (with room for seated people), the liner seen from the water in ONE
// piece (it can sit low by the bow and slide under), an upturned lifeboat for thirty men, floating debris, the Carpathia
// (one funnel) and her deck at dawn. A film chooses what shows with a DeckState per shot and frame.
import * as THREE from "three";
import { Batch, V, box, col, quad, rod } from "./geo";
import { NOINK } from "./ink";
import { surfaceMaterial } from "./env";
import { Part, makeSky, makeSmoke, makeWater, surfacePlane, glow, model, canvasTex } from "./env";

export type DeckSet = "deck" | "night" | "dawn" | "cdeck";
/** what is visible and how the ship stands: tilt (radians, bow down), xw = where the sea reaches up the deck (deck metres,
 *  the ship sinks to put it there), liner = the liner seen from the water, boats / raft / carp / debris = extra pieces */
export type DeckState = { set: DeckSet; tilt?: number; xw?: number; liner?: { pitch: number; sink: number } | null; boats?: "deck" | "night" | null; raft?: boolean; carp?: boolean; debris?: boolean | "near" | "wreck"; bench?: number; dress?: boolean; foam?: boolean; calm?: boolean; fgDavits?: [number, number, number] };

export const SEA = -0.55;
/** lifeboats on the water: deck view (rowing away from the boat deck) and the night set (the camera sits in the first one) */
export const BOATS_NIGHT: { x: number; z: number; yaw: number }[] = [{ x: 0.3, z: 3.4, yaw: 0 }, { x: 24, z: 46, yaw: 0.5 }, { x: -22, z: 62, yaw: -0.4 }];
export const BOATS_DECK: { x: number; z: number; yaw: number; vz: number }[] = [{ x: 8.6, z: 22.5, yaw: 0.6, vz: 0.7 }, { x: 3.2, z: 32, yaw: 0.3, vz: 0.6 }, { x: 14.5, z: 34, yaw: -0.4, vz: 0.6 }, { x: 9, z: 40, yaw: 0.2, vz: 0.5 }];
/** the upturned lifeboat (night and dawn): centre, and the standing places for thirty men */
export const RAFT = { x: 0, z: 12, y: SEA + 0.43, L: 6.3 };
/** the liner seen from the water: centre, yaw (the stern points at the camera) */
export const LINER = { x: -50, z: 300, yaw: Math.PI / 2 - 0.35, len: 120, beam: 13, hullH: 8 };
/** the Carpathia at first light */
export const CARP = { x: -20, z: 125, yaw: -0.3, len: 28, beam: 4, hullH: 2 };
export const CDECK_Y = 7;
export const boatAt = (i: number, t: number): { x: number; z: number; yaw: number } => { const b = BOATS_DECK[i]; return { x: b.x, z: b.z + b.vz * (t - 6.4), yaw: b.yaw }; };

/** a lofted boat hull (the engine's lifeboat shape). flip = keel up (the upturned boat) */
export const loft = (b: Batch, cx: number, cy: number, cz: number, yaw: number, o: { L?: number; Wd?: number; flip?: boolean; inside?: boolean } = {}) => {
  const L = o.L ?? 3.5, Wd = o.Wd ?? 1.14, NS = 18, BANDS = 10, cream = ["#9d8f6c", "#e6dcc0", "#b4a584", "#f0e8d2", "#9d8f6c", "#e6dcc0", "#b4a584", "#f0e8d2", "#9d8f6c", "#e6dcc0", "#b4a584"];
  const m = new THREE.Matrix4().makeTranslation(cx, cy, cz).multiply(new THREE.Matrix4().makeRotationY(yaw));
  const W = (u: number) => Wd * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(u), 2.4)), 0.62), yg = (u: number) => 1.12 + 0.3 * u * u, yk = (u: number) => 0.05 + 0.5 * Math.pow(Math.abs(u), 2.6), wf = (s: number) => 0.14 + 0.86 * Math.pow(Math.sin((s * Math.PI) / 2), 0.75);
  const pt = (u: number, s: number, j: number, sg: number) => { let y = yk(u) + (yg(u) - yk(u)) * s; if (o.flip) y = 0.47 - y; return V(u * L, y, sg * (W(u) * wf(s) + 0.035 * (j + 1) * (W(u) > 0.05 ? 1 : 0))); };
  for (let j = 0; j < BANDS; j++) for (const sg of [-1, 1]) for (let i = 0; i < NS; i++) {
    const u0 = -1 + (2 * i) / NS, u1 = -1 + (2 * (i + 1)) / NS, s0 = j / BANDS, s1 = (j + 1) / BANDS;
    b.add(quad(pt(u0, s0, j, sg), pt(u1, s0, j, sg), pt(u1, s1, j, sg), pt(u0, s1, j, sg)), col(cream[j], THREE.DoubleSide), m);
  }
  if (!o.flip) {
    for (const sg of [-1, 1]) for (let i = 0; i < NS; i++) { const u0 = -1 + (2 * i) / NS, u1 = -1 + (2 * (i + 1)) / NS, a = pt(u0, 1, BANDS, sg), c = pt(u1, 1, BANDS, sg); b.add(rod(a.clone().setY(a.y + 0.02), c.clone().setY(c.y + 0.02), 0.06, 0.06, 6), col("#4a301c"), m); }
    b.add(box(0, 0.42, 0, 2 * L * 0.92, 0.05, Wd * 1.3), col("#5b3d22"), m);
    for (const u of [-0.62, -0.21, 0.21, 0.62]) b.add(box(u * L, 0.58, 0, 0.3, 0.06, 2 * W(u) - 0.05), col("#6e4a28"), m);
  } else {
    b.add(box(0, 0.4, 0, 2 * L * 0.78, 0.1, Wd * 1.1), col("#6e4a28"), m);   // the flat bottom boards the men stand on
    b.add(box(0, 0.3, 0, 2 * L * 0.78, 0.12, 0.05), col("#3b2a1a"), m);
  }
};

/** the liner: hull (plan outline extruded), white decks, funnels (buff, black tops), masts, lifeboats, lit portholes and windows.
 *  Local frame: length along x, the bow at -x, the waterline at y = 0. */
export const makeLiner = (o: { len: number; beam: number; hullH: number; funnelX: number[]; funnelR: number; funnelH: number; funnelCol: string; topCol: string; hull: string; house: string; lit: boolean; smoke: boolean; pr?: number; masts?: boolean; vs?: number; front?: boolean }) => {
  const g = new THREE.Group(), b = new Batch(), L = o.len, B = o.beam, H = o.hullH, parts: Part[] = [];
  const shape = new THREE.Shape();
  shape.moveTo(L / 2, -B * 0.42); shape.lineTo(L / 2 - 4, -B / 2); shape.lineTo(-L * 0.24, -B / 2); shape.quadraticCurveTo(-L * 0.44, -B / 2, -L / 2, 0); shape.quadraticCurveTo(-L * 0.44, B / 2, -L * 0.24, B / 2); shape.lineTo(L / 2 - 4, B / 2); shape.lineTo(L / 2, B * 0.42); shape.closePath();
  const hullG = new THREE.ExtrudeGeometry(shape, { depth: H + 4, bevelEnabled: false }).rotateX(-Math.PI / 2).translate(0, -4, 0);
  b.add(hullG, col(o.hull));
  const red = new THREE.ExtrudeGeometry(shape, { depth: 3.2, bevelEnabled: false }).rotateX(-Math.PI / 2).translate(0, -2.4, 0).scale(1.004, 1, 1.004); b.add(red, col("#7a1f1c"));
  const wh = new THREE.ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: false }).rotateX(-Math.PI / 2).translate(0, H - 0.5, 0).scale(1.006, 1, 1.006); b.add(wh, col("#e9e4d6"));
  b.add(box(L * 0.04, H, 0, L * 0.74, 4, B * 0.7), col(o.house));
  b.add(box(L * 0.04, H + 4, 0, L * 0.56, 3.2, B * 0.52), col(o.house));
  b.add(box(-L * 0.3, H + 7.2, 0, L * 0.1, 2.6, B * 0.62), col(o.house)); b.add(box(-L * 0.3, H + 9.8, 0, L * 0.1 + 0.6, 0.25, B * 0.66), col("#cfc7b4"));
  for (const x of o.funnelX) { b.add(new THREE.CylinderGeometry(o.funnelR, o.funnelR * 1.06, o.funnelH, 24).translate(x, H + 4 + o.funnelH / 2, 0), col(o.funnelCol)); b.add(new THREE.CylinderGeometry(o.funnelR * 1.02, o.funnelR * 1.02, o.funnelH * 0.22, 24).translate(x, H + 4 + o.funnelH * 0.89, 0), col(o.topCol)); }
  if (o.masts !== false) for (const x of [-L * 0.38, L * 0.34]) b.add(rod(V(x, H, 0), V(x, H + 26, 0), 0.22, 0.12), col("#2a2420"));
  for (const sg of [-1, 1]) for (let i = 0; i < 9; i++) b.add(box(-L * 0.28 + i * L * 0.075, H + 4, sg * (B * 0.26 + 0.6), 5.2, 1.3, 1.1), col("#d9cfb4"));   // the lifeboats on the boat deck
  b.build(g, true);
  if (o.lit) {
    const pr = new THREE.InstancedMesh(new THREE.CircleGeometry(o.pr ?? 0.2, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.1, 0.5), fog: false, side: THREE.DoubleSide }), 700), m4 = new THREE.Matrix4(); let n = 0;
    for (const sg of [-1, 1]) {
      for (const y of [H - 2.2, H - 3.9]) for (let x = -L * 0.3; x < L * 0.46; x += 1.7) pr.setMatrixAt(n++, m4.makeTranslation(x, y, sg * (B / 2 + 0.05)));
      for (const y of [H + 1.6, H + 5.4]) for (let x = -L * 0.3; x < L * 0.3; x += 1.9) pr.setMatrixAt(n++, m4.makeTranslation(x + L * 0.04, y, sg * (y > H + 3 ? B * 0.26 + 0.03 : B * 0.35 + 0.03)));
    }
    for (let x = L * 0.45; x < L * 0.5; x += 1.7) for (const y of [H + 1.6]) pr.setMatrixAt(n++, m4.makeTranslation(L * 0.4 + (x - L * 0.45), y, B * 0.36));
    pr.count = n; pr.layers.set(NOINK); pr.frustumCulled = false; g.add(pr);
  }
  if (o.lit && o.front) {   // rows of lit windows on the front of the deckhouse, so the ship reads when it comes straight toward the lens
    const fw = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.9, 1.0).rotateY(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1.3, 0.6), fog: false, side: THREE.DoubleSide }), 120), m5 = new THREE.Matrix4(); let k = 0;
    for (const y of [H + 1.4, H + 3.0, H + 5.2, H + 6.8]) for (let z = -B * 0.3; z <= B * 0.3 + 0.01; z += 1.5) fw.setMatrixAt(k++, m5.makeTranslation(-L * 0.33 - 0.06, y, z));
    fw.count = k; fw.layers.set(NOINK); fw.frustumCulled = false; g.add(fw);
  }
  g.scale.y = o.vs ?? 1;
  if (o.smoke) for (const x of o.funnelX) { const sm = makeSmoke(V(x, H + 4 + o.funnelH, 0), 22, { rise: 20, lean: V(0.6, 0, 0.2), size: o.funnelR * 1.5, color: "#2a2f44", opacity: 0.6 }); g.add(sm.obj); parts.push(sm); }
  return { obj: g, parts };
};

/** everything of the extra sets, built once; returns the function that poses it per frame */
export const buildSets = (root: THREE.Group, parts: Part[], skyNight: Part & { follow: (p: THREE.Vector3) => void }, waterNight: Part & { lamps: THREE.Vector4[] }) => {
  const dawnSun = new THREE.Vector3(0.18, 0.1, 0.97);
  const water2 = makeWater({ size: 1600, y: SEA, deep: "#27384e", shallow: "#566f86", skyTop: "#5a6a98", skyHor: "#f2b98c", sunCol: "#ffd9a0", sunDir: dawnSun, amp: 0.06, fogCol: "#e6b090", fogFar: 760 }); root.add(water2.obj); parts.push(water2);
  const sky2 = makeSky("dusk", dawnSun, { dome: false, clouds: 7 }); root.add(sky2.obj); parts.push(sky2);
  // ---- lifeboats ----
  const boatGroup = (x: number, z: number, yaw: number, lantern = true) => {
    const g = new THREE.Group(), bb = new Batch(); loft(bb, 0, 0, 0, 0); bb.build(g, true); g.position.set(x, SEA + 0.05, z); g.rotation.y = yaw;
    for (const sg of [-1, 1]) for (const u of [-0.9, 0.9]) { const ob = new THREE.Group(), ob2 = new Batch(); ob2.add(rod(V(0, 0, 0), V(0, -0.35, sg * 2.2), 0.04), col("#8a6238")); ob2.build(ob, false); ob.position.set(u, 1.2, sg * 1.0); (g.userData.oars ||= []).push(ob); g.add(ob); }
    if (lantern) { const gl = glow("#ffb648", 1.1, 1.8); gl.position.set(0, 1.6, 0); g.add(gl); }
    return g;
  };
  const deckBoats = BOATS_DECK.map((b) => boatGroup(b.x, b.z, b.yaw)), nightBoats = BOATS_NIGHT.map((b, i) => boatGroup(b.x, b.z, b.yaw, i > 0));
  const dGroup = new THREE.Group(), nGroup = new THREE.Group(); deckBoats.forEach((g) => dGroup.add(g)); nightBoats.forEach((g) => nGroup.add(g)); root.add(dGroup, nGroup);
  // ---- the liner (night) and the Carpathia (dawn) ----
  const liner = makeLiner({ len: LINER.len, beam: LINER.beam, hullH: LINER.hullH, funnelX: [-0.2, -0.06, 0.08, 0.22].map((k) => k * LINER.len), funnelR: 1.8, funnelH: 11, funnelCol: "#d6a24a", topCol: "#15161c", hull: "#252c40", house: "#e9e4d6", lit: true, smoke: true, pr: 0.6, masts: false });
  const linerG = new THREE.Group(); linerG.add(liner.obj); root.add(linerG); parts.push(...liner.parts);
  const carp = makeLiner({ len: CARP.len, beam: CARP.beam, hullH: CARP.hullH, funnelX: [0.02 * CARP.len], funnelR: 1.0, funnelH: 5.2, funnelCol: "#c7442a", topCol: "#15161c", hull: "#1a1c24", house: "#efe9da", lit: true, smoke: true, pr: 0.9, masts: false, vs: 2.2, front: true });
  const carpG = new THREE.Group(); carpG.add(carp.obj); carpG.position.set(CARP.x, SEA, CARP.z); carpG.rotation.y = CARP.yaw; root.add(carpG); parts.push(...carp.parts);
  // ---- the upturned lifeboat ----
  const raftG = new THREE.Group(); { const bb = new Batch(); loft(bb, RAFT.x, RAFT.y - 0.47, RAFT.z, 0, { L: RAFT.L, Wd: 1.25, flip: true }); bb.add(box(RAFT.x, RAFT.y - 0.04, RAFT.z + 0.1, RAFT.L * 1.9, 0.14, 0.2), col("#4a3322")); bb.add(box(RAFT.x, RAFT.y - 0.02, RAFT.z + 0.38, RAFT.L * 1.7, 0.1, 0.5), col("#5a4030")); bb.build(raftG, true); } root.add(raftG);
  // ---- floating debris: planks and deck chairs ----
  const debG = new THREE.Group(); {
    const bb = new Batch(), wood = col("#b08a5a"), dark = col("#8a6a44"), cane = col("#d8c08a");
    const spots: [number, number, number, number][] = [[-2.4, 6.2, 0.4, 0], [1.6, 7.6, -0.7, 1], [-4.2, 9, 1.1, 0], [3.6, 9.5, 0.2, 1], [-1.0, 11, -0.3, 1], [0.4, 5.4, 1.3, 0], [-5.5, 7.5, 0.8, 1], [5.6, 6.6, -1.0, 0], [0.5, 15, 0.6, 0], [-2.8, 13, -0.2, 1], [4.5, 11.5, 1.0, 1], [-7, 10, 0.1, 0]];
    for (const [x, z, yaw, kind] of spots) {
      if (kind === 0) { bb.add(box(x, SEA + 0.08, z, 3.4, 0.1, 0.4, yaw), wood); bb.add(box(x + 0.9 * Math.cos(yaw), SEA + 0.16, z - 0.9 * Math.sin(yaw), 1.3, 0.09, 0.3, yaw + 0.9), dark); }
      else { bb.add(box(x, SEA + 0.1, z, 0.8, 0.06, 0.85, yaw), cane); bb.add(box(x - 0.36 * Math.cos(yaw), SEA + 0.1, z + 0.36 * Math.sin(yaw), 0.06, 0.9, 0.85, yaw), cane); bb.add(box(x, SEA + 0.1, z, 0.05, 0.5, 0.06, yaw + 0.8), wood); }
    }
    bb.build(debG, true);
  } root.add(debG);
  // ---- flotsam close to the camera (swimming, the raft): planks and a deck chair on the water within a few metres ----
  const nearG = new THREE.Group(); {
    const bb = new Batch(), wood = col("#b08a5a"), dark = col("#8a6a44"), cane = col("#d8c08a");
    let sd = 7; const rnd = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
    const bits: [number, number, number, number, number][] = [];   // x, z, yaw, length, kind
    for (let k = 0; k < 12; k++) bits.push([(rnd() - 0.5) * 2.0, -1.95 + rnd() * 1.05, rnd() * 3.1, 0.3 + rnd() * 0.45, k % 4 === 0 ? 1 : 0]);        // right under the swimmer's camera
    for (let k = 0; k < 60; k++) bits.push([(rnd() - 0.5) * 8.4, 1.7 + rnd() * 7.5, rnd() * 3.1, 0.3 + rnd() * 0.9, 0]);           // between the camera and the raft
    for (const [x, z, yaw, len, k] of bits) {
      if (k === 0) { bb.add(box(x, SEA + 0.1, z, len, 0.04, 0.06 + 0.07 * rnd(), yaw), rnd() > 0.5 ? wood : dark); }
      else { bb.add(box(x, SEA + 0.1, z, len * 0.8, 0.06, len * 0.7, yaw), cane); bb.add(box(x, SEA + 0.12, z, 0.05, 0.3, 0.05, yaw), wood); }
    }
    bb.build(nearG, true);
  } root.add(nearG);
  // ---- wreckage you can read at phone size: a panelled door with a handle, a deck chair, planks with grain and nails, lifebelts ----
  const wreckG = new THREE.Group(); {
    const doorTex = canvasTex("t3door", 256, 512, (g, r) => {
      g.fillStyle = "#6e4a2c"; g.fillRect(0, 0, 256, 512);
      for (let i = 0; i < 90; i++) { g.strokeStyle = `rgba(${40 + 40 * r()},${24 + 20 * r()},12,0.35)`; g.lineWidth = 1 + r() * 2; const x = r() * 256; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (r() - 0.5) * 8, 512); g.stroke(); }
      for (const [x, y, w, h] of [[34, 34, 80, 190], [142, 34, 80, 190], [34, 262, 80, 210], [142, 262, 80, 210]]) { g.fillStyle = "#8a6038"; g.fillRect(x, y, w, h); g.lineWidth = 7; g.strokeStyle = "#3a2412"; g.strokeRect(x, y, w, h); g.strokeStyle = "#a87a4a"; g.lineWidth = 3; g.strokeRect(x + 8, y + 8, w - 16, h - 16); }
      g.fillStyle = "#e8c456"; g.beginPath(); g.arc(224, 256, 15, 0, 7); g.fill(); g.strokeStyle = "#3a2412"; g.lineWidth = 4; g.stroke(); g.fillStyle = "#e8c456"; g.fillRect(190, 252, 36, 9);
      g.fillStyle = "#c9b070"; for (const y of [60, 450]) { g.fillRect(2, y, 26, 16); g.strokeRect(2, y, 26, 16); }
    });
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.07, 1.9), [0, 1, 2, 3, 4, 5].map((i) => new THREE.MeshStandardMaterial(i === 2 ? { map: doorTex, roughness: 0.8 } : { color: "#5a3a20", roughness: 0.9 })));
    door.position.set(0.55, SEA + 0.12, 4.7); door.rotation.set(0.04, 0.5, 0.05); wreckG.add(door);
    const ringTex = canvasTex("t3ring", 256, 64, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#c8282c" : "#f4f0e4"; g.fillRect(i * 32, 0, 32, 64); } g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(0, 0, 256, 6); g.fillRect(0, 58, 256, 6); }, true);
    for (const [x, z] of [[-0.6, 3.3], [1.05, 6.2]]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.13, 12, 32).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ map: ringTex, roughness: 0.7 })); ring.position.set(x, SEA + 0.15, z); wreckG.add(ring); }
    const caneTex = canvasTex("t3cane", 128, 128, (g) => { g.fillStyle = "#e8d8a8"; g.fillRect(0, 0, 128, 128); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#3a5a8a" : "#f2ead0"; g.fillRect(0, i * 16, 128, 16); } g.strokeStyle = "rgba(60,40,20,0.5)"; g.lineWidth = 3; g.strokeRect(2, 2, 124, 124); });
    const chair = new THREE.Group(); {
      const wood = new THREE.MeshStandardMaterial({ color: "#a8763e", roughness: 0.8 });
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.05, 1.5), [0, 1, 2, 3, 4, 5].map((i) => i === 2 ? new THREE.MeshStandardMaterial({ map: caneTex }) : wood)); seat.rotation.x = -0.42; seat.position.set(0, 0.42, 0); chair.add(seat);
      for (const sx of [-0.38, 0.38]) { const rail = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 1.7), wood); rail.rotation.x = -0.42; rail.position.set(sx, 0.42, 0); chair.add(rail); const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.8, 0.07), wood); leg.position.set(sx, 0.35, 0.7); leg.rotation.x = 0.3; chair.add(leg); }
      chair.position.set(-0.4, SEA + 0.05, 6.0); chair.rotation.set(0, 0.7, 0.18); wreckG.add(chair);
    }
    const pm = surfaceMaterial("planks", { bump: 3, rough: 0.8 });
    for (const [x, z, yaw, len] of [[0.95, 3.0, 0.3, 1.8], [-0.95, 4.7, -0.5, 2.2], [0.1, 7.1, 1.2, 2.6], [-0.7, 8.3, 0.2, 2.0], [0.9, 7.8, -0.4, 1.6], [-1.3, 6.8, 0.9, 1.4]] as [number, number, number, number][]) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(len, 0.07, 0.3), pm); m.position.set(x, SEA + 0.1, z); m.rotation.y = yaw; m.rotation.z = 0.04; wreckG.add(m);
      for (let k = 0; k < 3; k++) { const nail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 6), new THREE.MeshStandardMaterial({ color: "#2a2a2a" })); nail.position.set(x + (k - 1) * len * 0.3 * Math.cos(yaw), SEA + 0.15, z - (k - 1) * len * 0.3 * Math.sin(yaw)); wreckG.add(nail); }
    }
  } root.add(wreckG);
  // ---- ripples: thin bright streaks lying on the night water (calm shots would otherwise be a flat dark surface) ----
  const ripG = new THREE.Mesh(new THREE.PlaneGeometry(80, 80).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({
    map: canvasTex("t3ripples", 512, 512, (g, r) => { g.clearRect(0, 0, 512, 512); g.lineCap = "round";
      for (let i = 0; i < 260; i++) { const x = r() * 512, y = r() * 512, l = 18 + r() * 60, a = (r() - 0.5) * 0.5; g.strokeStyle = `rgba(190,215,255,${0.16 + 0.3 * r()})`; g.lineWidth = 1.5 + r() * 2.5; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y + 6 * (r() - 0.5), x + l * Math.cos(a), y + l * Math.sin(a)); g.stroke(); } }, true),
    transparent: true, depthWrite: false, fog: true, opacity: 0.9 }));
  { const uv = ripG.geometry.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 40, uv.getY(i) * 40); }
  ripG.position.set(0, SEA + 0.075, 6); ripG.layers.set(NOINK); ripG.renderOrder = 0.5; root.add(ripG);
  // ---- the Carpathia's deck at first light (high above the water) ----
  const cdeck = new THREE.Group(); {
    const pl = surfacePlane("planks", -40, 40, -9, 9.4, 3.4, { bump: 3, rough: 0.85 }); pl.position.y = 0.03; cdeck.add(pl);
    const bb = new Batch(), white = col("#e8e4d8"), wood = col("#7a5232");
    for (let x = -39; x <= 39.01; x += 1.5) bb.add(box(x, 0, 9, 0.07, 1.1, 0.07), white);
    for (const y of [0.36, 0.72]) bb.add(box(0, y, 9, 80, 0.045, 0.045), white); bb.add(box(0, 1.08, 9, 80, 0.07, 0.13), wood);
    bb.add(box(0, -CDECK_Y - 1, 9.6, 90, CDECK_Y + 1, 0.3), col("#1a1c24"));   // the hull side below the rail
    bb.add(box(0, 0, -9.5, 90, 3.3, 1), col("#efe9da")); bb.add(box(0, 3.3, -9.5, 90, 0.2, 1.6), col("#cfc7b4"));
    for (let x = -36; x <= 36; x += 3) { if (Math.round(x / 3) % 4 === 0) bb.add(box(x, 0, -8.95, 0.95, 2.15, 0.06), col("#6b4a2e")); else { bb.add(box(x, 1.3, -8.95, 1.25, 1.1, 0.06), col("#8a6a44")); bb.add(box(x, 1.38, -8.92, 1.05, 0.94, 0.06), col("#3a4a5c")); } }
    bb.build(cdeck, true);
    cdeck.add(model("lifebuoy", 4.5, 1.55, -8.9, { height: 0.75, tilt: Math.PI / 2 }), model("lifebuoy", -9, 1.55, -8.9, { height: 0.75, tilt: Math.PI / 2 }), model("vintage_suitcase", 14, 0.03, -6, { height: 0.5, yaw: 0.5 }), model("wooden_crate_02", -14, 0.03, -6.5, { height: 0.7, yaw: 0.3 }));
    cdeck.position.y = CDECK_Y; root.add(cdeck);
  }
  // ---- two davits right in front of the camera (the empty station seen from the rail), ropes swinging ----
  const fgD = new THREE.Group(), ropes: THREE.Group[] = []; {
    const bb = new Batch(), wh = col("#e8e4d8");
    for (const sg of [-1, 1]) {   // rooted on the deck edge, an arm arching out over the water, the rope falls hanging to the sea
      bb.add(box(sg * 1.2, 0, 0, 0.24, 3.4, 0.24), wh); bb.add(rod(V(sg * 1.2, 3.3, 0), V(sg * 1.2, 3.9, 1.1), 0.11), wh); bb.add(rod(V(sg * 1.2, 3.9, 1.1), V(sg * 1.2, 3.6, 2.3), 0.1), wh);
      bb.add(box(sg * 1.2, 0, 0.2, 0.5, 0.2, 0.5), col("#3a3d4a"));
      const rg = new THREE.Group(), rb = new Batch(); rb.add(rod(V(0, 0, 0), V(sg * 0.05, -3.4, 0.05), 0.06), col("#c9b891")); rb.add(box(sg * 0.05, -3.9, 0.05, 0.3, 0.5, 0.3), col("#3a3d4a")); rb.add(rod(V(sg * 0.05, -3.9, 0.05), V(sg * 0.15, -4.7, 0.12), 0.05), col("#c9b891")); rb.build(rg, false); rg.position.set(sg * 1.2, 3.6, 2.3); fgD.add(rg); ropes.push(rg);
    }
    for (let x = -9; x <= 9.01; x += 1.5) if (Math.abs(x) > 1.9) bb.add(box(x, 0, 0.1, 0.09, 1.1, 0.09), wh);   // the deck rail across the bottom, open where the davits swing out
    for (const y of [0.4, 0.78]) { bb.add(box(-5.3, y, 0.1, 6.8, 0.05, 0.05), wh); bb.add(box(5.3, y, 0.1, 6.8, 0.05, 0.05), wh); }
    bb.add(box(-5.3, 1.1, 0.1, 6.8, 0.08, 0.14), col("#7a5232")); bb.add(box(5.3, 1.1, 0.1, 6.8, 0.08, 0.14), col("#7a5232"));
    bb.build(fgD, true); fgD.visible = false; root.add(fgD);
  }
  const all = [dGroup, nGroup, linerG, carpG, raftG, debG, nearG, cdeck];
  return (st: DeckState, t: number) => {
    const set = st.set;
    dGroup.visible = st.boats === "deck"; nGroup.visible = st.boats === "night";
    linerG.visible = !!st.liner && set === "night"; carpG.visible = !!st.carp; raftG.visible = !!st.raft; debG.visible = false; wreckG.visible = st.debris === "wreck"; fgD.visible = !!st.fgDavits; if (st.fgDavits) { fgD.position.set(...st.fgDavits); ropes.forEach((r, i) => { r.rotation.x = 0.2 * Math.sin(t * 1.7 + i * 2); r.rotation.z = 0.1 * Math.sin(t * 1.3 + i); }); } nearG.visible = st.debris === "near"; cdeck.visible = set === "cdeck";
    const dawn = set === "dawn" || set === "cdeck";
    water2.obj.visible = dawn; waterNight.obj.visible = !dawn; sky2.obj.visible = dawn; skyNight.obj.visible = !dawn;
    deckBoats.forEach((g, i) => { (g.userData.oars || []).forEach((o: THREE.Group, k: number) => { o.rotation.y = 0.45 * Math.sin(t * 2.6 + i + (k % 2) * Math.PI); }); const p = boatAt(i, t); g.position.set(p.x, SEA + 0.05 + 0.05 * Math.sin(t * 1.3 + i), p.z); g.rotation.z = 0.03 * Math.sin(t * 1.1 + i); });
    nightBoats.forEach((g, i) => { g.position.y = SEA + 0.05 + 0.06 * Math.sin(t * 1.2 + i * 2); g.rotation.z = 0.025 * Math.sin(t * 0.9 + i); });
    if (st.liner) { const { pitch, sink } = st.liner; linerG.position.set(LINER.x, SEA - sink, LINER.z); linerG.rotation.set(0, LINER.yaw, 0); liner.obj.rotation.z = pitch; liner.obj.position.y = 0; }
    ripG.visible = (set === "night" || set === "deck" || set === "dawn") && (st.calm === true || st.debris === "wreck"); (ripG.material as THREE.MeshBasicMaterial).map!.offset.set(0.004 * t, 0.002 * t);
    debG.position.y = 0.06 * Math.sin(t * 1.1); nearG.position.y = 0.05 * Math.sin(t * 1.0 + 1); raftG.position.y = 0.04 * Math.sin(t * 0.8);
    return { dawn, water2, sky2 };
  };
};
export const raftSpots = (n = 30): { x: number; z: number; kneel: boolean }[] => {
  // five rows of six: the two front rows kneel, the three behind them stand
  const out: { x: number; z: number; kneel: boolean }[] = [];
  for (let i = 0; i < n; i++) { const row = Math.floor(i / 6), k = i % 6; out.push({ x: RAFT.x + (k - 2.5) * 0.72 + (row % 2) * 0.32 - 0.16, z: RAFT.z - 1.0 + row * 0.5, kneel: row < 2 }); }
  return out;
};

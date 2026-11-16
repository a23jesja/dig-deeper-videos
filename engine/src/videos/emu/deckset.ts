// The boat deck of a liner at night (zone "deck"), built from the environment kit (env/): a planked deck with grain,
// seams and wear, the ship's rail, a lifeboat station with davits, the deckhouse with lit windows and lanterns,
// three funnels with smoke, a starry sky with a moon and clouds, the sea with waves and reflections, the hull with
// lit portholes, CC0 props, and distress rockets that light the whole scene. Lengthwise is x; the sea side is +z.
import * as THREE from "three";
import { Batch, V, box, col, lam, quad, rod } from "./geo";
import { NOINK } from "./ink";
import { SEA, LINER, buildSets, DeckState } from "./t3sets";
import { Part, makeLantern, makeRocket, makeSky, makeSmoke, makeWater, model, surfacePlane, glow, SKY } from "./env";

/** sea: the water level (the deck is close above it); boat: centre of the lifeboat hung out at the first station (its keel y);
 *  gaps: where the rail is open (the first for the lifeboat on its davits, the second for the empty station of a boat that has gone) */
export const DECK = { railZ: 14.5, houseZ: -9, sea: -0.55, boat: [-12, 0.2, 15.1] as [number, number, number], gaps: [[-15.9, -8.1], [7.4, 10.6]] as [number, number][], gone: 9 };
/** a camera frame on the deck: scenes are written looking along +z from the origin (+x = screen-left) and set down at A, turned TH */
export type Frame = { A: [number, number]; TH: number };
export const FRAME_SEA: Frame = { A: [0, 0], TH: 0 };                              // looking at the rail, the boat and the sea
export const toWorld = (fr: Frame, p: [number, number, number]): [number, number, number] =>
  [fr.A[0] + p[0] * Math.cos(fr.TH) + p[2] * Math.sin(fr.TH), p[1], fr.A[1] - p[0] * Math.sin(fr.TH) + p[2] * Math.cos(fr.TH)];
/** foreground piece: a pulley block hanging on its rope from a davit, high at the edge of the low shot (world x, y, z) */
export const HANGING: [number, number, number] = [-0.5, 2.3, -1.5];
/** distress rockets: [fired at (s), from, apex]. A film sets these before the world is built. */
export const ROCKETS: { t0: number; from: [number, number, number]; apex: [number, number, number]; rise?: number; radius?: number; glow?: number }[] = [];
/** where the lifeboat on the water lies (the camera sits in it in one shot) */
export const WATER_BOAT: [number, number, number] = [9, DECK.sea + 0.1, 21.0];

const parts: Part[] = [];
let ship: THREE.Group, shipPivot: THREE.Group, benchG: THREE.Group;
let rockets: ReturnType<typeof makeRocket>[] = [], water: ReturnType<typeof makeWater> | null = null, sky: ReturnType<typeof makeSky> | null = null;
let applySets: ((st: DeckState, t: number) => { sky2: Part & { follow: (p: THREE.Vector3) => void } }) | null = null;
/** where a point of the ship's own frame (x along the ship, y up from the deck, z to the sea) stands in the world while she tilts and sinks */
export const deckPt = (st: DeckState | undefined, x: number, y: number, z: number): [number, number, number] => {
  const t = st?.tilt ?? 0, py = deckSink(st), c = Math.cos(t), s = Math.sin(t);
  return [x * c - y * s, py + x * s + y * c, z];
};
/** how far the ship has sunk (m): the sea at the deck's xw reaches up the tilted deck */
export const deckSink = (st?: DeckState) => (st && st.tilt && st.xw !== undefined ? Math.min(0, SEA - st.xw * Math.sin(st.tilt)) : 0);
export const updateDeck = (t: number, camPos: THREE.Vector3, st: DeckState = { set: "deck" }) => {
  for (const p of parts) p.update(t);
  sky?.follow(camPos);
  const r = applySets?.(st, t); r?.sky2.follow(camPos);
  if (water) (water.obj as THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>).material.uniforms.uAmp.value = st.calm ? 0.035 : 0.3;
  benchG.visible = st.bench !== undefined; if (st.bench !== undefined) benchG.position.set(st.bench, 0, 6.2);
  shipPivot.visible = st.set === "deck"; shipPivot.rotation.z = st.tilt ?? 0; shipPivot.position.y = deckSink(st);
  if (water) rockets.forEach((r, i) => { if (i < 4) { const p = r.pos(t); water!.lamps[i].set(p.x, p.y, p.z, 24 * r.level(t)); water!.lampCols[i].set("#eef3ff"); } });
};
/** lit things that must not glow behind or between a main figure: [x, y, z, radius] in the world (deck lanterns and windows, the liner's lights) */
export const lamps = (st: DeckState | undefined): [number, number, number, number][] => {
  const out: [number, number, number, number][] = [];
  if (!st || st.set === "deck") {
    for (const x of [-22.5, -10.5, 1.5, 13.5]) out.push([...deckPt(st, x, 2.75, DECK.houseZ + 0.45), 0.5]);
    for (let x = -66; x <= 66; x += 3) if (Math.round(x / 3) % 4 !== 0) out.push([...deckPt(st, x, 1.85, DECK.houseZ + 0.02), 0.65]);
  }
  if (false as boolean && st?.liner && st.set === "night") {   // the liner's far-off lights (100 m away) are not counted: they pass behind the boat in shot 8
    const L = LINER; for (let k = -0.3; k <= 0.4; k += 0.1) for (const y of [L.hullH - 2.2, L.hullH + 1.6, L.hullH + 5.4]) { const c = Math.cos(L.yaw), s = Math.sin(L.yaw), lx = k * L.len; out.push([L.x + lx * c, SEA - st.liner.sink + y, L.z - lx * s, 1.2]); } }
  return out;
};
/** the brightest burning rocket: how bright (0..1) and where */
export const deckFlare = (t: number): { k: number; pos: THREE.Vector3 } | null => {
  let best: { k: number; pos: THREE.Vector3 } | null = null;
  for (const r of rockets) { const k = r.level(t); if (!best || k > best.k) best = { k, pos: r.pos(t) }; }
  return best;
};

export const buildDeck = (root: THREE.Group) => {
  parts.length = 0;
  const zone = new THREE.Group(); ship = zone; shipPivot = new THREE.Group(); shipPivot.add(zone); root.add(shipPivot);   // the ship (deck, rail, house, funnels): tilts and sinks as one piece
  const b = new Batch(), R = DECK.railZ, H = DECK.houseZ, S = DECK.sea, white = col("#e8e4d8"), wood = col("#7a5232"), dark = col("#1b1d26");
  // the deck: planks with grain, caulked seams, nail heads and a worn track
  const planks = surfacePlane("planks", -70, 70, -40, R + 0.4, 3.4, { bump: 3, rough: 0.85 }); planks.position.y = 0.03; zone.add(planks);
  // the sea, the sky, the hull with two rows of lit portholes
  water = makeWater({ size: 1400, y: S, deep: "#050c1c", shallow: "#12284a", skyTop: SKY.night.top, skyHor: "#1b2a4c", sunCol: "#cfd9ff", sunDir: new THREE.Vector3(-0.35, 0.42, 0.84), amp: 0.3, fogCol: "#121c36", fogFar: 520 });
  root.add(water.obj); parts.push(water);
  sky = makeSky("night", new THREE.Vector3(-0.35, 0.42, 0.84), { dome: false, clouds: 6 }); root.add(sky.obj); parts.push(sky);
  b.add(box(0, S - 2, R + 0.45, 140, -S + 2, 0.3), dark);
  const port = new THREE.InstancedMesh(new THREE.CircleGeometry(0.08, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.4, 1.0, 0.5), fog: false }), 130), m4 = new THREE.Matrix4(); let pi = 0;
  for (const y of [-0.45]) for (let x = -64; x <= 64; x += 2) { if (Math.abs(x - WATER_BOAT[0]) > 14) port.setMatrixAt(pi++, m4.makeTranslation(x + (y < -1 ? 1 : 0), y, R + 0.62)); }   // none near the boat of the wide shot: they read as glowing balls in its corners
  port.count = pi; port.layers.set(NOINK); zone.add(port);
  // the rail: posts, two bars, a wooden top rail; open where a boat has been lowered (DECK.gap)
  const gaps = DECK.gaps, segs: [number, number][] = []; { let x0 = -70; for (const [a, c] of gaps) { segs.push([x0, a]); x0 = c; } segs.push([x0, 70]); }
  for (let x = -69; x <= 69.01; x += 1.5) if (!gaps.some(([a, c]) => x > a && x < c)) b.add(box(x, 0, R, 0.07, 1.1, 0.07), white);
  for (const [x0, x1] of segs) { for (const y of [0.36, 0.72]) b.add(box((x0 + x1) / 2, y, R, x1 - x0, 0.045, 0.045), white); b.add(box((x0 + x1) / 2, 1.08, R, x1 - x0, 0.07, 0.13), wood); b.add(box(x0, 0, R, 0.09, 1.12, 0.09), white); b.add(box(x1, 0, R, 0.09, 1.12, 0.09), white); }
  // the lifeboat station: davits with the lifeboat hung out in the rail opening on its falls (clinker hull, gunwale, thwarts)
  const [bx, by, bz] = DECK.boat;
  for (const s of [-1, 1]) { b.add(box(bx + s * 4.6, 0, R - 0.35, 0.18, 3.5, 0.18), white); b.add(box(bx + s * 4.6, 3.5, R + 0.4, 0.14, 0.14, 1.9), white); }
  for (const s of [-1, 1]) { const gx = DECK.gone; b.add(box(gx + s * 4.6, 0, R - 0.35, 0.18, 3.5, 0.18), white); b.add(box(gx + s * 4.6, 3.5, R + 0.4, 0.14, 0.14, 1.9), white); { const rg = new THREE.Group(), rb = new Batch(); rb.add(rod(V(0, 0, 0), V(s * 0.12, -2.4, 0.1), 0.09), col("#c9b891")); rb.add(box(s * 0.12, -2.95, 0.1, 0.34, 0.55, 0.34), col("#3a3d4a")); rb.add(rod(V(s * 0.12, -2.95, 0.1), V(s * 0.3, -3.9, 0.25), 0.08), col("#c9b891")); rb.build(rg, true); rg.position.set(gx + s * 4.6, 3.45, R + 1.25); zone.add(rg); parts.push({ obj: rg, update: (t: number) => { rg.rotation.x = 0.16 * Math.sin(t * 1.7 + s); rg.rotation.z = 0.08 * Math.sin(t * 1.3 + 2 * s); } }); } }   // the empty davits of the boat that has gone, the falls hanging
  { const bb = new Batch(), pv = V(bx, 3.5, bz), m = new THREE.Matrix4().makeTranslation(-pv.x, -pv.y, -pv.z);
    const L = 3.5, NS = 28, BANDS = 5, cream = ["#cfc3a4", "#ddd3b8", "#cfc3a4", "#ddd3b8", "#e8e0cc"];
    const W = (u: number) => 1.14 * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(u), 2.4)), 0.62), yg = (u: number) => by + 1.12 + 0.3 * u * u, yk = (u: number) => by + 0.05 + 0.5 * Math.pow(Math.abs(u), 2.6), wf = (s: number) => 0.14 + 0.86 * Math.pow(Math.sin((s * Math.PI) / 2), 0.75);
    const pt = (u: number, s: number, j: number, sg: number) => V(bx + u * L, yk(u) + (yg(u) - yk(u)) * s, bz + sg * (W(u) * wf(s) + 0.035 * (j + 1) * (W(u) > 0.05 ? 1 : 0)));
    for (let j = 0; j < BANDS; j++) for (const sg of [-1, 1]) for (let i = 0; i < NS; i++) {
      const u0 = -1 + (2 * i) / NS, u1 = -1 + (2 * (i + 1)) / NS, s0 = j / BANDS, s1 = (j + 1) / BANDS;
      const a = pt(u0, s0, j, sg), c = pt(u1, s0, j, sg), d = pt(u1, s1, j, sg), e = pt(u0, s1, j, sg);
      bb.add(quad(a, c, d, e), col(cream[j], THREE.DoubleSide), m);
    }
    for (const sg of [-1, 1]) for (let i = 0; i < NS; i++) {   // the gunwale: a dark teak rail along the sheer
      const u0 = -1 + (2 * i) / NS, u1 = -1 + (2 * (i + 1)) / NS, a = pt(u0, 1, BANDS, sg), c = pt(u1, 1, BANDS, sg);
      bb.add(rod(a.clone().setY(a.y + 0.02), c.clone().setY(c.y + 0.02), 0.06, 0.06, 6), col("#4a301c"), m);
    }
    bb.add(box(bx, by + 0.42, bz, 6.4, 0.05, 1.5), col("#5b3d22"), m);                                   // the bottom boards
    for (const u of [-0.62, -0.21, 0.21, 0.62]) bb.add(box(bx + u * L, by + 0.58, bz, 0.3, 0.06, 2 * W(u) - 0.05), col("#6e4a28"), m);   // thwarts
    for (const sg of [-1, 1]) { bb.add(rod(V(bx + sg * 4.6, 3.45, bz), V(bx + sg * 3.2, by + 1.2, bz), 0.022), col("#c9b891")); bb.add(box(bx + sg * 3.2, by + 1.1, bz, 0.16, 0.22, 0.16), col("#3a3d4a"), m); }
    const grp = new THREE.Group(); grp.position.copy(pv); bb.build(grp, true); zone.add(grp);
    parts.push({ obj: grp, update: (t: number) => { grp.rotation.x = 0.012 * Math.sin(t * 1.3); grp.rotation.z = 0.006 * Math.sin(t * 0.9 + 1); } });
  }
  // the deckhouse: white wall, lit windows, doors, roof edge
  b.add(box(0, 0, H - 4, 140, 3.3, 8), col("#e9e4d6")); b.add(box(0, 3.3, H - 4, 140.6, 0.2, 8.7), col("#cfc7b4"));
  const win = lam("deckWindow", () => ({ color: "#ffdf9a", emissive: "#ffb648", emissiveIntensity: 1.6 }));
  for (let x = -66; x <= 66; x += 3) {
    if (Math.round(x / 3) % 4 === 0) b.add(box(x, 0, H + 0.02, 0.95, 2.15, 0.06), col("#6b4a2e"));
    else { b.add(box(x, 1.3, H + 0.02, 1.25, 1.1, 0.06), col("#8a6a44")); b.add(box(x, 1.38, H + 0.04, 1.05, 0.94, 0.06), win); const gl = glow("#ffb648", 2.6, 0.35); gl.position.set(x, 1.85, H + 0.2); zone.add(gl); }
  }
  // funnels on the deckhouse roof: buff with a black top, smoke drifting aft
  for (const x of [-12, 21, 50]) {
    b.add(new THREE.CylinderGeometry(2.3, 2.45, 12, 28).translate(x, 3.5 + 6, H - 1.5), col("#d6a24a")); b.add(new THREE.CylinderGeometry(2.34, 2.34, 3.2, 28).translate(x, 3.5 + 12 + 1.6, H - 1.5), dark);
    const sm = makeSmoke(new THREE.Vector3(x, 19.2, H - 1.5), 22, { rise: 22, lean: new THREE.Vector3(-0.8, 0, 0.1), size: 3.4, color: "#2a2f44", opacity: 0.7 }); zone.add(sm.obj); parts.push(sm);
  }
  // foreground: a wooden pulley block hanging on its rope
  { const [hx, hy, hz] = HANGING; b.add(rod(V(hx, hy + 0.2, hz), V(hx + 0.15, hy + 4, hz), 0.022), col("#c9b891")); b.add(box(hx, hy - 0.22, hz, 0.2, 0.42, 0.14), col("#7a5232")); b.add(new THREE.CylinderGeometry(0.11, 0.11, 0.06, 14).rotateX(Math.PI / 2).translate(hx, hy - 0.02, hz + 0.08), col("#3a3d4a")); b.add(rod(V(hx, hy - 0.22, hz), V(hx, hy - 0.5, hz), 0.03), col("#3a3d4a")); }
  // the lifeboat on the water, seen from inside at its stern: the bow stem and gunwales rise a hand above the camera's eye
  const [wx, wy, wz] = WATER_BOAT, bw = col("#8a6238"), bd = col("#6e4c2a");
  for (const s of [-1, 1]) { b.add(rod(V(wx + s * 0.95, wy + 0.05, wz + 1.2), V(wx + s * 0.8, wy + 0.08, wz - 1.3), 0.07), bw); b.add(rod(V(wx + s * 0.8, wy + 0.08, wz - 1.3), V(wx, wy + 0.16, wz - 2.8), 0.07), bw); b.add(rod(V(wx + s * 0.9, wy - 0.12, wz + 1.2), V(wx + s * 0.72, wy - 0.12, wz - 1.3), 0.1), bd); b.add(rod(V(wx + s * 0.72, wy - 0.12, wz - 1.3), V(wx, wy - 0.05, wz - 2.8), 0.1), bd); }
  // the near boat's planking: solid sides and bow, so the bottom of the wide shot is the boat and the water, not the liner's hull
  for (const s of [-1, 1]) {
    b.add(quad(V(wx + s * 0.95, wy - 0.2, wz + 1.2), V(wx + s * 0.72, wy - 0.2, wz - 1.3), V(wx + s * 0.8, wy + 0.08, wz - 1.3), V(wx + s * 0.95, wy + 0.05, wz + 1.2)), col("#6e4c2a", THREE.DoubleSide));
    b.add(quad(V(wx + s * 0.72, wy - 0.2, wz - 1.3), V(wx, wy - 0.1, wz - 2.8), V(wx, wy + 0.16, wz - 2.8), V(wx + s * 0.8, wy + 0.08, wz - 1.3)), col("#6e4c2a", THREE.DoubleSide));
  }
  b.add(box(wx, wy - 0.06, wz - 2.8, 0.12, 0.2, 0.12), bw);
  b.add(box(wx, wy + 0.12, wz - 1.2, 1.7, 0.06, 0.34), bw); b.add(rod(V(wx - 1.5, wy + 0.5, wz - 0.9), V(wx - 0.5, wy + 0.3, wz + 0.9), 0.03), col("#c9b891"));
  for (const y of [-0.2, -0.62, -1.05, -1.5, -1.95]) b.add(box(0, y, R + 0.605, 140, 0.035, 0.02), col("#0a0c14"));   // plate seams
  b.add(box(0, S + 0.1, R + 0.61, 140, 0.45, 0.02), col("#7a1f1c")); b.add(box(0, -0.38, R + 0.61, 140, 0.38, 0.02), col("#e9e4d6"));   // the red waterline band and the white rail band on the hull
  b.build(zone, true);
  // lanterns on the deckhouse wall (they light the deck for real) and CC0 props along the wall and the rail
  for (const x of [-22.5, -10.5, 1.5, 13.5]) { const l = makeLantern(new THREE.Vector3(x, 2.75, H + 0.45), { power: 26, reach: 14 }); zone.add(l.obj); parts.push(l); }
  zone.add(model("lifebuoy", 4.5, 1.55, H + 0.12, { height: 0.75, tilt: Math.PI / 2 }), model("lifebuoy", -7.5, 1.55, H + 0.12, { height: 0.75, tilt: Math.PI / 2 }), model("painted_wooden_bench", 7.5, 0.03, H + 0.75, { height: 0.9 }));
  { const bb = new Batch(), wd = col("#7a5232"), dk = col("#3a3d4a"); benchG = new THREE.Group();   // a deck bench that can slide
    bb.add(box(0, 0.42, 0, 1.7, 0.07, 0.46), wd); bb.add(box(0, 0.5, -0.22, 1.7, 0.5, 0.05), wd); for (const sx of [-0.75, 0.75]) for (const sz of [-0.18, 0.18]) bb.add(box(sx, 0, sz, 0.06, 0.42, 0.06), dk);
    bb.build(benchG, true); benchG.visible = false; zone.add(benchG); }
  // distress rockets
  rockets = ROCKETS.map((r) => makeRocket(r.t0, new THREE.Vector3(...r.from), new THREE.Vector3(...r.apex), { power: 1000, glowTime: r.glow ?? 5.5, rise: r.rise, radius: r.radius }));
  for (const r of rockets) { root.add(r.obj); parts.push(r); }
  applySets = buildSets(root, parts, sky!, water!) as typeof applySets;
};

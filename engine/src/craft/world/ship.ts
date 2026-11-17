// A pirate sloop at sea on a clear day, built from the world kit. The ship lies along z with her bow toward -z; the deck is at y = 0
// and the sea at y = SEA. Starboard is +x: there the rail has a gap and a plank runs out over the water. Aft (toward +z) the
// quarterdeck rises with the wheel and the cabin door. Far off lie a small island with a palm and a merchant ship under sail.
// Shared set: every Short on the sailing ship uses it.
import * as THREE from "three";
import { mesh, group, box, cyl, ball, lathe, slab, rod, paint, torus, sunRig, skyDome } from "./kit";
import { C, barrel, crate, ropeCoil, wheel, cloud, doorway, painted, yardSail, yard } from "./props";

export const SEA = -2.3;
/** where things are, for the films that play here */
export const SHIP = {
  half: 2.8,                                                   // half the width of the deck
  plank: { x0: 2.5, x1: 5.9, z: 0.6, y: 0.07 },                 // the plank over the starboard side
  mast: [0, 0, -1.6] as [number, number, number], mastTop: 13.4,
  quarter: { z: 4.9, y: 1.1 },                                  // where the quarterdeck begins and how high it is
  island: [17, SEA, -7] as [number, number, number],           // the middle of the little island off the starboard bow
  palm: [17.9, SEA + 0.55, -8.0] as [number, number, number],     // the foot of the island's palm
  merchant: [-46, SEA, -70] as [number, number, number],       // the merchant ship far off the port bow
  staff: { at: [-2.4, 1.2, 8.1] as [number, number, number], h: 3.4 },   // the flagstaff on the port quarter: its foot and its height
  aft: 1.2,                                                    // the height of the quarterdeck's planks
};
const planks = (key: string, a: string, b: string, line: string) => paint(key, 256, 256, (g, r) => {
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 3 ? a : b; g.fillRect(i * 32, 0, 32, 256); g.fillStyle = line; g.fillRect(i * 32, 0, 3, 256); const y = Math.floor(r() * 220); g.fillRect(i * 32, y, 32, 3); }
});
const waves = () => paint("seawaves", 512, 512, (g, r) => {
  g.fillStyle = "#2f8fd6"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 46; i++) { const x = r() * 512, y = r() * 512, w = 40 + r() * 70; g.strokeStyle = i % 3 ? "#5fb2ea" : "#1f74bd"; g.lineWidth = 5; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w / 2, y - 12, x + w, y); g.stroke(); }
});
/** a ship's gun on its carriage, pointing toward +x */
export const cannon = () => group([mesh(box(0.9, 0.22, 0.6), "#7a4a26", { at: [0, 0.2, 0] }), mesh(cyl(0.13, 0.17, 1.3, 14), "#2b2a33", { at: [0.25, 0.44, 0], rot: [0, 0, -Math.PI / 2] }), mesh(cyl(0.16, 0.16, 0.08, 14), "#2b2a33", { at: [-0.4, 0.44, 0], rot: [0, 0, Math.PI / 2] }),
  ...[[-0.3, 0.3], [0.3, 0.3], [-0.3, -0.3], [0.3, -0.3]].map(([x, z]) => mesh(cyl(0.13, 0.13, 0.08, 12), "#5a3a22", { at: [x, 0.13, z], rot: [Math.PI / 2, 0, 0] }))]);
/** a palm tree: a leaning trunk with rings, a crown of fronds that droop, two coconuts */
export const palm = (h = 4) => { const k = h / 4, g = group([rod([0, 0, 0], [0.5 * k, h, 0.1], 0.13 * Math.sqrt(k), "#9a6a3a")]);
  for (let i = 1; i < 6; i++) g.add(mesh(torus(0.135 * Math.sqrt(k), 0.02, 10), "#7a5230", { at: [0.5 * k * (i / 6), h * (i / 6), 0.1 * (i / 6)], rot: [Math.PI / 2, 0, 0], line: 0, shadow: false }));
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; g.add(mesh(box(1.9 * k, 0.06, 0.5 * k), i % 2 ? "#3f9a5c" : "#2f7a46", { at: [0.5 * k + Math.cos(a) * 0.85 * k, h - 0.18 * k, 0.1 + Math.sin(a) * 0.85 * k], rot: [0, -a, -0.38], line: 0.7 })); }
  for (const s of [-1, 1]) g.add(mesh(ball(0.11 * Math.sqrt(k), 10), "#6a4424", { at: [0.5 * k + s * 0.12, h - 0.3 * k, 0.1 + 0.1] }));
  return g; };
/** the pirates' own sloop seen from far off, sailing away: her hull, one mast with mainsail and jib, a black flag. She heads toward -z */
export const farSloop = () => { const g = group([mesh(box(4.6, 2.2, 15), "#4a2f22", { at: [0, 1.1, 0], shadow: false }), mesh(box(4.7, 0.45, 15.05), C.ochre, { at: [0, 1.75, 0], line: 0.6, shadow: false }), rod([0, 2.2, -1.5], [0, 15, -1.5], 0.2, "#8a6a3e", { shadow: false }),
    mesh(slab("farmain", [[0.3, 3.2], [6.3, 3.5], [4.8, 12.6], [0.3, 10.4]], 0.08), "#f6efdc", { at: [0, 0, -1.5], rot: [0, -Math.PI / 2, 0], shadow: false }), mesh(slab("farjib", [[-0.4, 3.2], [-7.4, 2.0], [-0.4, 11.6]], 0.08), "#fbf6ea", { at: [0, 0, -1.5], rot: [0, -Math.PI / 2, 0], shadow: false }),
    mesh(box(0.06, 1.3, 2.0), "#17141a", { at: [0, 15.3, -0.4], shadow: false })]); return g; };
/** a ship far away: a hull and three masts of square sails. Her flag is added by the film */
export const farShip = () => { const g = group([mesh(box(4, 2.6, 16), "#5a3a22", { at: [0, 1.3, 0], shadow: false }), mesh(box(4.1, 0.5, 16.1), C.ochre, { at: [0, 2.1, 0], line: 0.6, shadow: false })]);
  for (const [z, h] of [[-5, 13], [0, 16], [5, 12]]) { g.add(rod([0, 2.6, z], [0, 2.6 + h, z], 0.16, "#7a5a36", { shadow: false })); for (const [y, w] of [[0.3, 6.4], [0.62, 5]]) g.add(mesh(box(w, h * 0.27, 0.12), "#f6efdc", { at: [0, 2.6 + h * y, z + 0.2], shadow: false })); }
  return g; };

/** a stretch of a merchant ship's side, as seen from another ship's deck: her planking with a painted strake and two gun ports, the
 *  bulwark and its rail, the deck behind it, a mast with the foot of a square sail, shrouds, casks. She faces +x; her crew stand at
 *  x = -0.75 on the deck, which lies at y = MERCHANT_DECK */
export const MERCHANT_DECK = 0.35;
export const merchantSide = (len = 11) => {
  const g = new THREE.Group(), d = MERCHANT_DECK;
  g.add(mesh(box(0.4, d + 0.72 - SEA, len), "#6a4630", { at: [-0.2, (d + 0.72 + SEA) / 2, 0] }), mesh(box(0.46, 0.4, len + 0.02), "#3f77b4", { at: [-0.2, d - 0.35, 0], line: 0.6 }), mesh(box(0.46, 0.14, len + 0.02), "#f1e4c4", { at: [-0.2, d - 0.72, 0], line: 0 }));
  g.add(mesh(box(0.56, 0.1, len + 0.06), "#e8cf8a", { at: [-0.2, d + 0.76, 0], line: 0.7 }));
  // along the bulwark: a painted band, rope coils hung on pins, the heads of the timbers
  g.add(mesh(box(0.44, 0.13, len + 0.02), "#f1e4c4", { at: [-0.2, d + 0.42, 0], line: 0.5 }), mesh(box(0.44, 0.07, len + 0.02), "#3f77b4", { at: [-0.2, d + 0.25, 0], line: 0 }));
  for (const z of [-3.4, -2.0, -0.42, 0.42, 2.0, 3.4]) g.add(mesh(torus(0.13, 0.035, 14), "#dcc38a", { at: [0.03, d + 0.5, z], rot: [0, Math.PI / 2, 0], scale: [1, 1.5, 1], line: 0.6, shadow: false }), mesh(cyl(0.025, 0.025, 0.2, 6), "#7a5a36", { at: [0.03, d + 0.76, z], line: 0.5, shadow: false }));
  for (const z of [-3.2, -1.1, 1.1, 3.2]) g.add(mesh(box(0.08, 0.5, 0.6), "#3a2a22", { at: [0.02, d - 1.25, z], line: 0.6, shadow: false }));
  g.add(mesh(box(7, 0.2, len), "#d8b780", { at: [-3.7, d - 0.1, 0], line: 0 }));
  g.add(rod([-3.1, d, 0.9], [-3.1, d + 14, 0.9], 0.3, "#8a6a3e"), mesh(box(0.12, 4.6, 7.4), "#f6efdc", { at: [-3.0, d + 5.6, 0.9] }), rod([-3.0, d + 3.2, -3.0], [-3.0, d + 3.2, 4.8], 0.1, "#7a5a36"));
  // her shrouds come down to the rail well clear of where the crew stand
  for (const z of [3.0, 3.8, 4.6]) g.add(rod([-0.3, d + 0.8, z], [-3.0, d + 9, 0.9], 0.03, "#3a3028", { line: 0.4 }));
  for (let i = 1; i < 7; i++) { const u = i / 9, x = -0.3 - 2.7 * u, y = d + 0.8 + 8.2 * u; g.add(rod([x, y, 3.0 - 2.1 * u], [x, y, 4.6 - 3.7 * u], 0.016, "#3a3028", { line: 0, shadow: false })); }
  // on deck behind them: the fife rail at the mast's foot with its coils, a hatch
  g.add(mesh(box(0.1, 0.9, 1.9), "#8a6a3e", { at: [-2.3, d + 0.45, 0.9] }), mesh(box(0.2, 0.08, 2.1), "#e8cf8a", { at: [-2.3, d + 0.9, 0.9], line: 0.6 }), mesh(box(1.5, 0.2, 1.3), "#8a5e2c", { at: [-1.7, d + 0.1, -2.6] }));
  { const b = barrel(0.9, 0.32); b.position.set(-1.9, d, -1.5); const c = crate(0.6); c.position.set(-2.1, d, 2.6); g.add(b, c); }
  return g;
};

/** the plank as a thing by itself: its two boards with their grain, the nails of the battens underneath, a knot. It lies along x
 *  with its middle at the origin and its top at y = 0.035 */
export const plankBoard = () => { const p = SHIP.plank, len = p.x1 - p.x0 + 0.9, x0 = (p.x0 - 0.9 + p.x1) / 2, g = new THREE.Group();
  g.add(mesh(box(len, 0.07, 0.52), "#e3c68c"), mesh(box(len - 0.1, 0.006, 0.014), "#a8854e", { at: [0, 0.037, 0.02], line: 0, shadow: false }));
  for (const [x, z, l] of [[3.0, -0.15, 1.1], [4.4, -0.11, 0.8], [5.3, -0.17, 0.5], [3.5, 0.16, 0.9], [4.9, 0.13, 0.9], [2.7, 0.19, 0.4]]) g.add(mesh(box(l, 0.005, 0.008), "#c9a868", { at: [x - x0, 0.037, z], line: 0, shadow: false }));
  for (const x of [3.3, 4.6, 5.75]) for (const z of [-0.19, -0.07, 0.09, 0.2]) g.add(mesh(ball(0.016, 6), "#5a4634", { at: [x - x0, 0.039, z], scale: [1, 0.4, 1], line: 0, shadow: false }));
  g.add(mesh(ball(0.035, 8), "#b08a52", { at: [4.05 - x0, 0.036, -0.13], scale: [1.4, 0.1, 1], line: 0, shadow: false })); return g; };
export const pirateShip = () => {
  const root = new THREE.Group(), W = SHIP.half, deckMap = (planks("deckplanks2", "#d8b780", "#cba86e", "#8a6a40"), paint("deckplanks2", 256, 256, () => {}, [3, 1]));
  root.add(skyDome("#2a7fdc", "#9fd6ff", "#e6f5ff"));
  const rig = sunRig({ from: [9, 14, 6], power: 1.55, fill: 1.8, bounce: 0.8, reach: 12 }, [0, 0, 0]); root.add(rig); root.userData.rig = rig;
  // the sea
  // the sea, which drifts: the stage calls tick with the film's time
  const sea = mesh(box(1600, 0.2, 1600), "#ffffff", { at: [0, SEA - 0.1, 0], map: (waves(), paint("seawaves", 512, 512, () => {}, [130, 130])), line: 0, shadow: false }); root.add(sea);
  root.userData.tick = (t: number) => { const m = (sea.material as THREE.MeshToonMaterial).map; if (m) m.offset.set(t * 0.012 + 0.004 * Math.sin(t * 1.3), t * 0.02); };
  // the hull: a dark body with a yellow strake, a pointed bow, a square stern
  const hullC = "#4a2f22";
  root.add(mesh(box(W * 2 + 0.3, 2.9, 17), hullC, { at: [0, -1.5, 0] }), mesh(box(W * 2 + 0.36, 0.45, 17.04), C.ochre, { at: [0, -0.5, 0], line: 0.6 }), mesh(box(W * 2 + 0.36, 0.2, 17.04), "#2b1d1a", { at: [0, -0.95, 0], line: 0 }));
  root.add(mesh(box(4.1, 2.9, 4.1), hullC, { at: [0, -1.5, -8.5], rot: [0, Math.PI / 4, 0] }), mesh(box(4.16, 0.45, 4.16), C.ochre, { at: [0, -0.5, -8.5], rot: [0, Math.PI / 4, 0], line: 0.6 }));
  // the deck and the forecastle point
  root.add(mesh(box(W * 2, 0.16, 17), "#ffffff", { at: [0, -0.08, 0], map: deckMap, line: 0 }), mesh(box(3.9, 0.16, 3.9), "#d8b780", { at: [0, -0.08, -8.5], rot: [0, Math.PI / 4, 0], line: 0 }));
  // the bulwarks with their rail; on the starboard side a gap where the plank runs out
  const wall = (x: number, z0: number, z1: number) => root.add(mesh(box(0.16, 0.9, z1 - z0), "#a8562f", { at: [x, 0.45, (z0 + z1) / 2] }), mesh(box(0.3, 0.09, z1 - z0 + 0.06), "#e8cf8a", { at: [x, 0.94, (z0 + z1) / 2], line: 0.7 }));
  wall(-W, -8.5, 8.5); wall(W, -8.5, SHIP.plank.z - 0.55); wall(W, SHIP.plank.z + 0.55, 8.5);
  for (const s of [-1, 1]) root.add(mesh(box(0.16, 0.9, 4.05), "#a8562f", { at: [s * 1.42, 0.45, -9.93], rot: [0, s * Math.PI / 4, 0] }), mesh(box(0.3, 0.09, 4.1), "#e8cf8a", { at: [s * 1.42, 0.94, -9.93], rot: [0, s * Math.PI / 4, 0], line: 0.7 }));
  root.add(mesh(box(W * 2, 0.9, 0.16), "#a8562f", { at: [0, 0.45, 8.5] }));
  // the plank: lashed down on deck, reaching out over the water. It is a named thing of the world, so that a shot in which it has gone
  // overboard can leave it out (Shot.hide) and move a board of its own (plankBoard)
  { const p = SHIP.plank, pg = new THREE.Group(); pg.name = "plank"; const bd = plankBoard(); bd.position.set((p.x0 - 0.9 + p.x1) / 2, p.y - 0.035, p.z); pg.add(bd);
    for (const x of [1.9, 2.45]) pg.add(mesh(box(0.1, 0.12, 0.6), "#5a4634", { at: [x, p.y + 0.03, p.z], line: 0.6 }));
    root.add(pg); root.userData.named = [pg]; }
  // the mast with its boom and gaff, the mainsail and the jib, shrouds with ratlines on both sides
  const [mx, , mz] = SHIP.mast, top = SHIP.mastTop;
  root.add(rod([mx, 0, mz], [mx, top, mz], 0.22, "#8a6a3e"), mesh(cyl(0.34, 0.34, 0.12, 14), "#7a5a36", { at: [mx, 0.06, mz] }), mesh(cyl(0.6, 0.5, 0.14, 14), "#7a5a36", { at: [mx, 9.4, mz] }));
  root.add(rod([mx, 2.7, mz + 0.2], [mx, 3.1, mz + 6.6], 0.13, "#7a5a36"), rod([mx, 9.0, mz + 0.2], [mx, 11.6, mz + 5.0], 0.11, "#7a5a36"));
  { const sail = mesh(slab("mainsail", [[0.35, 2.9], [6.5, 3.25], [4.95, 11.4], [0.35, 9.0]], 0.06), "#f6efdc", { at: [mx, 0, mz], rot: [0, -Math.PI / 2, 0] }); root.add(sail);
    // the sail is cloths sewn side by side, with two bands of reef points and a patch or two (drawn on both of its faces)
    const foot = (x: number) => 2.9 + (x - 0.35) * (0.35 / 6.15), head = (x: number) => (x < 4.95 ? 9.0 + (x - 0.35) * (2.4 / 4.6) : 3.25 + (6.5 - x) * (8.15 / 1.55)), leech = (y: number) => 6.5 - (y - 3.25) * (1.55 / 8.15);
    for (const side of [-1, 1]) { const X = mx + side * 0.045;
      for (let x = 1.05; x < 6.4; x += 0.72) root.add(rod([X, foot(x) + 0.05, mz + x], [X, head(x) - 0.05, mz + x], 0.018, "#cbb98c", { line: 0, shadow: false }));
      for (const up of [1.5, 3.0]) { const y = 3.0 + up, x1 = leech(y) - 0.1; root.add(mesh(box(0.02, 0.16, x1 - 0.45), "#e4d6b0", { at: [X, y, mz + (x1 + 0.45) / 2], line: 0, shadow: false })); for (let x = 0.8; x < x1; x += 0.48) root.add(rod([X + side * 0.012, y, mz + x], [X + side * 0.012, y - 0.3, mz + x + 0.03], 0.016, "#8a7a56", { line: 0, shadow: false })); }
      root.add(mesh(box(0.02, 0.62, 0.74), "#dccb9c", { at: [X, 7.6, mz + 2.2], rot: [0.1, 0, 0], line: 0.5, shadow: false }), mesh(box(0.02, 0.5, 0.5), "#d3c08e", { at: [X, 5.3, mz + 4.5], rot: [-0.2, 0, 0], line: 0.5, shadow: false }));
      for (const x of [-1.5, -2.7, -3.9, -5.1, -6.3]) root.add(rod([X, 3.0 + (x + 0.4) * (1.5 / 7.2) + 0.05, mz + x], [X, 1.5 + (x + 7.6) * (9.1 / 7.2) - 0.08, mz + x], 0.016, "#d9cba6", { line: 0, shadow: false })); }
    root.add(mesh(slab("jib", [[-0.4, 3.0], [-7.6, 1.5], [-0.4, 10.6]], 0.06), "#fbf6ea", { at: [mx, 0, mz], rot: [0, -Math.PI / 2, 0] })); }
  root.add(rod([mx, 0.6, -10.6], [mx, 2.3, -13.8], 0.14, "#8a6a3e"), rod([mx, 11.2, mz], [mx, 2.2, -13.6], 0.025, "#3a3028", { line: 0.4 }));
  for (const s of [-1, 1]) { const a: [number, number, number][] = [[s * W, 0.95, mz - 0.9], [s * W, 0.95, mz], [s * W, 0.95, mz + 0.9]]; for (const p of a) root.add(rod(p, [mx, 9.3, mz], 0.028, "#3a3028", { line: 0.4 }));
    for (let i = 1; i < 9; i++) { const u = i / 10, y = 0.95 + (9.3 - 0.95) * u, x = s * W * (1 - u); root.add(rod([x, y, mz - 0.9 * (1 - u)], [x, y, mz + 0.9 * (1 - u)], 0.016, "#3a3028", { line: 0, shadow: false })); } }
  // the quarterdeck: its front with the cabin door and two windows, steps up on the port side, a rail, the wheel, a stern lantern
  { const q = SHIP.quarter; root.add(mesh(box(W * 2 - 0.2, q.y, 8.5 - q.z), "#a8562f", { at: [0, q.y / 2, (q.z + 8.5) / 2] }), mesh(box(W * 2 - 0.1, 0.1, 8.5 - q.z + 0.1), "#ffffff", { at: [0, q.y + 0.05, (q.z + 8.5) / 2], map: deckMap, line: 0.6 }));
    const d = doorway("#2f7a52", 0.3, 0.8, 0.98); d.rotation.y = Math.PI; d.position.set(0.9, 0, q.z - 0.01); root.add(d);
    for (const x of [-0.2, -0.95]) root.add(mesh(box(0.5, 0.4, 0.06), "#f6e3a0", { at: [x, 0.62, q.z - 0.03], line: 0.6 }), mesh(box(0.06, 0.4, 0.07), "#5a3a22", { at: [x, 0.62, q.z - 0.04], line: 0, shadow: false }));
    for (let i = 0; i < 4; i++) root.add(mesh(box(0.9, 0.275, 0.3), "#c98f52", { at: [-2.2, 0.1375 + i * 0.275, q.z - 1.05 + i * 0.3] }));
    for (const x of [-2.6, -1.3, 0, 1.3, 2.6]) root.add(mesh(box(0.1, 0.8, 0.1), "#e8cf8a", { at: [x, q.y + 0.5, q.z + 0.1] })); root.add(mesh(box(W * 2 - 0.3, 0.09, 0.16), "#e8cf8a", { at: [0, q.y + 0.92, q.z + 0.1], line: 0.7 }));
    // the wheel on its post: a named thing, so that a shot from inboard on the quarterdeck can leave it out (Shot.hide "wheel")
    { const w = wheel(0.55); w.position.set(0, q.y + 0.95, q.z + 1.6); const wg = group([w, mesh(box(0.2, 0.95, 0.2), "#5a4634", { at: [0, q.y + 0.47, q.z + 1.75] })]); wg.name = "wheel"; root.add(wg); (root.userData.named as THREE.Object3D[]).push(wg); }
    // the rail round the quarterdeck, and the flagstaff on the port quarter
    for (const s of [-1, 1]) { for (const z of [q.z + 0.1, 6.1, 7.3, 8.4]) root.add(mesh(box(0.1, 0.8, 0.1), "#e8cf8a", { at: [s * (W - 0.12), q.y + 0.5, z] })); root.add(mesh(box(0.16, 0.09, 8.5 - q.z + 0.06), "#e8cf8a", { at: [s * (W - 0.12), q.y + 0.92, (q.z + 8.5) / 2], line: 0.7 }), mesh(box(0.08, 0.06, 8.5 - q.z), "#e8cf8a", { at: [s * (W - 0.12), q.y + 0.52, (q.z + 8.5) / 2], line: 0.5 })); }
    for (const x of [-2.0, -1.0, 1.0, 2.0]) root.add(mesh(box(0.1, 0.8, 0.1), "#e8cf8a", { at: [x, q.y + 0.5, 8.42] })); root.add(mesh(box(W * 2 - 0.2, 0.09, 0.16), "#e8cf8a", { at: [0, q.y + 0.92, 8.42], line: 0.7 }), mesh(box(W * 2 - 0.3, 0.06, 0.08), "#e8cf8a", { at: [0, q.y + 0.52, 8.42], line: 0.5 }));
    { const [sx, sy, sz] = SHIP.staff.at; root.add(rod([sx, sy, sz], [sx, sy + SHIP.staff.h, sz], 0.05, "#8a6a3e"), mesh(ball(0.09, 10), C.gold, { at: [sx, sy + SHIP.staff.h + 0.06, sz] }), mesh(box(0.22, 0.12, 0.22), "#7a5a36", { at: [sx, sy + 0.06, sz] })); }
    // the stern lantern: a named thing (a shot that looks aft past somebody's head can leave it out, Shot.hide "lantern")
    { const lg = group([rod([0, q.y, 8.4], [0, q.y + 2.0, 8.4], 0.05, C.iron), mesh(box(0.34, 0.44, 0.34), "#ffd75a", { at: [0, q.y + 2.2, 8.4] }), mesh(box(0.42, 0.08, 0.42), C.iron, { at: [0, q.y + 2.46, 8.4] })]); lg.name = "lantern"; root.add(lg); (root.userData.named as THREE.Object3D[]).push(lg); } }
  // on deck: the hatch with its grating, guns on the port side, casks and crates, coils of rope, a pile of shot, a bucket
  root.add(mesh(box(1.9, 0.22, 1.6), "#8a5e2c", { at: [-0.3, 0.11, 2.4] })); for (let i = 0; i < 5; i++) root.add(mesh(box(1.7, 0.03, 0.12), "#2b1d1a", { at: [-0.3, 0.235, 1.8 + i * 0.3], line: 0, shadow: false }));
  for (const z of [-3.6, 0.2]) { const c = cannon(); c.rotation.y = Math.PI; c.position.set(-1.9, 0, z); root.add(c); root.add(mesh(box(0.2, 0.5, 0.7), "#2b1d1a", { at: [-W, 0.45, z], line: 0, shadow: false })); }
  { const b1 = barrel(0.95, 0.34); b1.position.set(-2.2, 0, -1.7); const b2 = barrel(0.8, 0.3, "#c98a4a"); b2.position.set(-1.55, 0, -1.4); const c1 = crate(0.7); c1.position.set(1.9, 0, -3.4); const c2 = crate(0.55, "#d09a5a"); c2.position.set(1.95, 0.7, -3.35); c2.rotation.y = 0.4;
    const r1 = ropeCoil(0.4, 3); r1.position.set(1.2, 0, -5.6); const r2 = ropeCoil(0.34, 4); r2.position.set(-1.9, 0, 3.6); root.add(b1, b2, c1, c2, r1, r2);
    for (const [x, y, z] of [[0, 0, 0], [0.2, 0, 0], [0.1, 0, 0.17], [0.1, 0.16, 0.06]]) root.add(mesh(ball(0.1, 12), "#2b2a33", { at: [-2.15 + x, 0.1 + y, -5.0 + z] }));
    root.add(mesh(lathe("bucket", [[0.14, 0], [0.18, 0.3], [0.16, 0.3], [0.13, 0.03]], 12), "#b0703c", { at: [2.2, 0, 3.2] })); }
  // far off: the island with its palm, the merchant ship, clouds
  { const [ix, iy, iz] = SHIP.island; root.add(mesh(ball(1, 20), "#f1dc9a", { at: [ix, iy - 0.3, iz], scale: [5.2, 0.95, 3.8], shadow: false, line: 0.9 })); const p = palm(2.5); p.position.set(...SHIP.palm); root.add(p);
    // on the sand: a starfish, shells, a piece of driftwood
    for (const [x, z, c, r] of [[2.3, 1.5, "#fbf3df", 0.07], [-0.7, 2.6, "#f4c9a0", 0.06], [2.9, 0.4, "#fbf3df", 0.08]] as [number, number, string, number][]) root.add(mesh(ball(r, 8), c, { at: [ix + x, iy - 0.3 + 0.95 * Math.sqrt(Math.max(0, 1 - (x / 5.2) ** 2 - (z / 3.8) ** 2)) , iz + z], scale: [1, 0.35, 1], line: 0.6, shadow: false }));
    root.add(rod([ix - 2.6, iy + 0.42, iz + 1.2], [ix - 1.5, iy + 0.5, iz + 0.9], 0.07, "#b89a6a"));
    // the sand is not bare: ripples the wind has drawn across it, tufts of beach grass, pebbles and shells, foam where the sea meets it
    const sy = (x: number, z: number) => iy - 0.3 + 0.95 * Math.sqrt(Math.max(0, 1 - (x / 5.2) ** 2 - (z / 3.8) ** 2));
    for (let i = 0; i < 22; i++) { const z0 = -3.0 + i * 0.29 + 0.08 * Math.sin(i * 2.1), x0 = -4.2 + ((i * 37) % 10) * 0.42, len = 1.5 + ((i * 13) % 5) * 0.35; let prev: [number, number, number] | null = null;
      for (let k = 0; k <= 6; k++) { const x = x0 + (len * k) / 6, z = z0 + 0.06 * Math.sin(k * 1.3 + i); if (1 - (x / 5.2) ** 2 - (z / 3.8) ** 2 < 0.12) { prev = null; continue; } const q: [number, number, number] = [ix + x, sy(x, z) - 0.006, iz + z]; if (prev) root.add(rod(prev, q, 0.026, "#d2b668", { line: 0, shadow: false })); prev = q; } }
    for (const [x, z, s] of [[-2.9, 0.2, 1], [-0.4, -0.9, 1.2], [1.9, -0.3, 0.9], [-3.4, -1.4, 1.1], [-1.9, 2.5, 0.8], [0.4, 0.7, 0.7], [3.2, -1.6, 1.2], [-0.9, -2.2, 1], [-2.4, 1.5, 0.75], [-0.2, 2.1, 0.7]] as number[][]) for (let k = 0; k < 6; k++) { const a = k * 1.05 + x;
      root.add(rod([ix + x + 0.03 * Math.cos(a), sy(x, z) - 0.02, iz + z + 0.03 * Math.sin(a)], [ix + x + (0.1 + 0.03 * (k % 3)) * s * Math.cos(a), sy(x, z) + (0.26 + 0.06 * (k % 3)) * s, iz + z + 0.1 * s * Math.sin(a)], 0.014, k % 2 ? "#6aa84f" : "#4f8f3f", { line: 0.5, shadow: false })); }
    for (let i = 0; i < 26; i++) { const x = -4.0 + ((i * 61) % 80) / 10, z = -2.6 + ((i * 29) % 56) / 10; if (1 - (x / 5.2) ** 2 - (z / 3.8) ** 2 < 0.1) continue;
      root.add(mesh(ball(0.035 + 0.02 * (i % 3), 8), ["#fbf3df", "#f4c9a0", "#c9b8a0", "#e89a8a", "#b9a184"][i % 5], { at: [ix + x, sy(x, z), iz + z], scale: [1.3, 0.4, 1], rot: [0, i, 0], line: 0.5, shadow: false })); }
    { const x = -1.2, z = 2.0; for (let k = 0; k < 5; k++) { const a = (k / 5) * 6.283; root.add(mesh(ball(1, 8), "#f08a3c", { at: [ix + x + 0.07 * Math.cos(a), sy(x, z) + 0.004, iz + z + 0.07 * Math.sin(a)], scale: [0.09, 0.02, 0.035], rot: [0, -a, 0], line: 0.6, shadow: false })); } }
    for (let i = 0; i < 64; i++) { const a = (i / 64) * 6.283, k = 0.955 + 0.012 * Math.sin(i * 2.7); root.add(mesh(ball(1, 8), i % 3 ? "#ffffff" : "#d6ecfb", { at: [ix + 5.2 * k * Math.cos(a), SEA + 0.015, iz + 3.8 * k * Math.sin(a)], scale: [0.3 + 0.08 * (i % 3), 0.02, 0.1 + 0.03 * (i % 2)], rot: [0, -a + Math.PI / 2, 0], line: 0, shadow: false })); } }
  { const s = farShip(); s.position.set(...SHIP.merchant); s.rotation.y = 0.5; root.add(s); }
  for (const [x, y, z, s] of [[-170, 110, -420, 34], [150, 150, -500, 44], [-40, 190, -540, 30], [260, 100, -400, 26], [-220, 120, 300, 36], [200, 140, 340, 40], [420, 130, -60, 38]] as number[][]) { const c = cloud(s); c.position.set(x, y, z); if (Math.abs(x) > 300) c.rotation.y = Math.PI / 2; root.add(c); }
  void group; void painted;
  return root;
};

// ---------------- two ships side by side (the Short about the black flag) ----------------
/** a small merchant ship, whole across her deck. In her own space she lies along z with her bow toward -z and her starboard side
 *  (+x) toward the ship alongside; her deck is at y = MERCHANT_DECK. Aft stands a thin mast (BRIG.mast) whose sail is not part of
 *  her: the world adds it as a thing of its own (yardSail), so that a film can strike it. Her crew stand between that mast and the
 *  starboard rail. `strake` = the colour of her painted band (another colour = another ship) */
export const BRIG = { half: 3.0, rail: 0.85, mast: [-0.6, 3.0] as [number, number], sail: { x: -0.6, z: 3.0, top: 7.4, w: 5.6, h: 4.4 }, pins: [2.86, 4.3] as [number, number] };
export const merchantBrig = (strake = "#3f77b4", len = 15) => {
  const g = new THREE.Group(), d = MERCHANT_DECK, H = BRIG.half, hullC = "#6a4630", wallC = "#96683c", deckMap = (planks("brigdeck", "#e0c48c", "#d2b276", "#96744a"), paint("brigdeck", 256, 256, () => {}, [3, 1]));
  const bowZ = -len / 2, q = Math.PI / 4, dia = H * Math.SQRT2 + 0.06;
  g.add(mesh(box(H * 2 + 0.3, 2.9 + d, len), hullC, { at: [0, d - 0.05 - (2.9 + d) / 2, 0] }), mesh(box(H * 2 + 0.36, 0.4, len + 0.02), strake, { at: [0, d - 0.35, 0], line: 0.6 }), mesh(box(H * 2 + 0.36, 0.14, len + 0.02), "#f1e4c4", { at: [0, d - 0.72, 0], line: 0 }));
  g.add(mesh(box(dia, 2.9 + d, dia), hullC, { at: [0, d - 0.05 - (2.9 + d) / 2, bowZ], rot: [0, q, 0] }), mesh(box(dia + 0.06, 0.4, dia + 0.06), strake, { at: [0, d - 0.35, bowZ], rot: [0, q, 0], line: 0.6 }));
  g.add(mesh(box(H * 2, 0.16, len), "#ffffff", { at: [0, d - 0.08, 0], map: deckMap, line: 0 }), mesh(box(dia - 0.2, 0.16, dia - 0.2), "#e0c48c", { at: [0, d - 0.08, bowZ], rot: [0, q, 0], line: 0 }));
  // her bulwarks with a painted band and the rail on top; gun ports on her sides
  for (const s of [-1, 1]) {
    g.add(mesh(box(0.16, BRIG.rail - 0.05, len), wallC, { at: [s * H, d + (BRIG.rail - 0.05) / 2, 0] }), mesh(box(0.3, 0.09, len + 0.06), "#e8cf8a", { at: [s * H, d + BRIG.rail, 0], line: 0.7 }), mesh(box(0.2, 0.13, len + 0.02), "#f1e4c4", { at: [s * H, d + 0.5, 0], line: 0.5 }), mesh(box(0.2, 0.07, len + 0.02), strake, { at: [s * H, d + 0.33, 0], line: 0 }));
    g.add(mesh(box(0.16, BRIG.rail - 0.05, dia), wallC, { at: [s * H / 2, d + (BRIG.rail - 0.05) / 2, bowZ - H / 2], rot: [0, s * q, 0] }), mesh(box(0.3, 0.09, dia + 0.05), "#e8cf8a", { at: [s * H / 2, d + BRIG.rail, bowZ - H / 2], rot: [0, s * q, 0], line: 0.7 }));
    for (const z of [-4.6, -1.6, 1.4, 4.4]) g.add(mesh(box(0.08, 0.5, 0.6), "#3a2a22", { at: [s * (H + 0.17), d - 1.25, z], line: 0.6, shadow: false }));
  }
  g.add(mesh(box(H * 2, BRIG.rail - 0.05, 0.16), wallC, { at: [0, d + (BRIG.rail - 0.05) / 2, len / 2] }), mesh(box(H * 2 + 0.2, 0.09, 0.3), "#e8cf8a", { at: [0, d + BRIG.rail, len / 2], line: 0.7 }));
  // the main mast forward with two yards (her big sails are furled), its shrouds; the thin mast aft
  { const mz = -2.6; g.add(rod([0, d, mz], [0, d + 13.5, mz], 0.22, "#8a6a3e"), mesh(cyl(0.34, 0.34, 0.12, 14), "#7a5a36", { at: [0, d + 0.06, mz] }));
    for (const [y, l] of [[6.2, 7.2], [10.4, 5.6]]) { const yd = yard(l); yd.position.set(0, d + y, mz + 0.24); g.add(yd); }
    for (const s of [-1, 1]) { for (const z of [mz - 0.9, mz, mz + 0.9]) g.add(rod([s * H, d + BRIG.rail, z], [0, d + 9.6, mz], 0.028, "#3a3028", { line: 0.4 }));
      for (let i = 1; i < 9; i++) { const u = i / 10, y = d + BRIG.rail + (9.6 - BRIG.rail) * u, x = s * H * (1 - u); g.add(rod([x, y, mz - 0.9 * (1 - u)], [x, y, mz + 0.9 * (1 - u)], 0.016, "#3a3028", { line: 0, shadow: false })); } }
    g.add(mesh(box(1.9, 0.9, 0.1), "#8a6a3e", { at: [0, d + 0.45, mz + 0.9] }), mesh(box(2.1, 0.08, 0.2), "#e8cf8a", { at: [0, d + 0.9, mz + 0.9], line: 0.6 })); }
  { const [mx, mz] = BRIG.mast; g.add(rod([mx, d, mz], [mx, d + 10.4, mz], 0.17, "#8a6a3e"), mesh(cyl(0.28, 0.28, 0.12, 14), "#7a5a36", { at: [mx, d + 0.06, mz] }), mesh(cyl(0.2, 0.2, 0.1, 12), "#7a5a36", { at: [mx, d + 2.9, mz], line: 0.6 })); }
  // on deck: a hatch with its grating, casks and crates out of the way of the crew, the pin rail on the starboard side with its coils,
  // a lantern aft (she is steered with a tiller, out of the way)
  g.add(mesh(box(1.7, 0.22, 1.5), "#8a5e2c", { at: [-1.2, d + 0.11, 1.4] })); for (let i = 0; i < 4; i++) g.add(mesh(box(1.5, 0.03, 0.12), "#2b1d1a", { at: [-1.2, d + 0.235, 0.9 + i * 0.33], line: 0, shadow: false }));
  { const b1 = barrel(0.95, 0.34); b1.position.set(-2.3, d, 0.2); const b2 = barrel(0.8, 0.3, "#c98a4a"); b2.position.set(-2.35, d, 6.6); const c1 = crate(0.7); c1.position.set(-2.2, d, 5.8); const r1 = ropeCoil(0.36, 3); r1.position.set(-1.6, d, -0.6); g.add(b1, b2, c1, r1); }
  { const [px, pz] = BRIG.pins; g.add(mesh(box(0.12, 0.06, 1.3), "#7a5a36", { at: [px, d + 0.62, pz], line: 0.6 }));
    for (const z of [-0.5, -0.17, 0.17, 0.5]) g.add(mesh(cyl(0.022, 0.022, 0.24, 6), "#5a3a22", { at: [px, d + 0.68, pz + z], line: 0.5, shadow: false }));
    for (const z of [-0.5, 0.17]) g.add(mesh(torus(0.12, 0.034, 14), "#dcc38a", { at: [px - 0.07, d + 0.44, pz + z], rot: [0, Math.PI / 2, 0], scale: [1, 1.5, 1], line: 0.6, shadow: false })); }
  { g.add(rod([0, d + BRIG.rail, len / 2], [0, d + 2.5, len / 2], 0.05, C.iron), mesh(box(0.3, 0.4, 0.3), "#ffd75a", { at: [0, d + 2.7, len / 2] }), mesh(box(0.38, 0.08, 0.38), C.iron, { at: [0, d + 2.94, len / 2] })); }
  return g;
};
/** where things are in the world of the two ships (world coordinates) */
export const FLAGSEA = { mx: -8.2, mz: 1.5, cloth: SHIP.aft + 1.15, staff: [SHIP.staff.at[0], SHIP.staff.at[2]] as [number, number], staffTop: 6.0, rail: -8.2 + BRIG.half, deck: MERCHANT_DECK,
  /** the merchant's after mast, the plane of its sail and the height of its yard, her pin rail (world) */
  mast: [-8.2 + BRIG.mast[0], 1.5 + BRIG.mast[1]] as [number, number], yard: MERCHANT_DECK + BRIG.sail.top, pins: [-8.2 + BRIG.pins[0], 1.5 + BRIG.pins[1]] as [number, number] };
/** how far the evening has come at the film time T (0 = clear day, 1 = a red evening): the film sets it, the world's light follows */
export const dusk = { at: (_T: number) => 0 };
/** the pirate sloop with a merchant ship lying close on her port side. The sloop's plank is gone; along her quarterdeck's port rail a
 *  waist cloth is lashed up, breast high, behind which a crew can hide. Named things (Shot.hide): "merchant" (the whole merchant
 *  ship), "msail" (the sail on her after mast) and the sloop's "wheel". The light turns to a red evening by `dusk.at` */
export const flagSea = () => {
  const root = pirateShip(), W = SHIP.half, q = SHIP.quarter, x = -(W - 0.12) - 0.11, z0 = q.z + 0.12, z1 = 7.72, top = FLAGSEA.cloth;
  const old = root.userData.named as THREE.Object3D[]; old.find((o) => o.name === "plank")!.visible = false;
  root.add(mesh(box(0.05, top - SHIP.aft, z1 - z0), "#e2cf9e", { at: [x, (top + SHIP.aft) / 2, (z0 + z1) / 2], line: 0.8 }), mesh(box(0.06, 0.15, z1 - z0), "#b3261e", { at: [x, top - 0.22, (z0 + z1) / 2], line: 0, shadow: false }));
  for (let z = z0; z <= z1 + 0.01; z += (z1 - z0) / 4) root.add(rod([x + 0.06, SHIP.aft, z], [x + 0.06, top + 0.06, z], 0.035, "#8a6a3e"), mesh(torus(0.05, 0.014, 10), "#dcc38a", { at: [x + 0.03, top - 0.08, z], rot: [0, Math.PI / 2, 0], line: 0.5, shadow: false }));
  // her flagstaff is lengthened, so that a flag run up to its top flies clear above every head
  { const [sx, , sz] = SHIP.staff.at; root.add(rod([sx, SHIP.staff.at[1] + SHIP.staff.h, sz], [sx, FLAGSEA.staffTop, sz], 0.04, "#8a6a3e"), mesh(ball(0.07, 10), C.gold, { at: [sx, FLAGSEA.staffTop + 0.05, sz] })); }
  const brig = merchantBrig(); brig.name = "merchant"; brig.position.set(FLAGSEA.mx, 0, FLAGSEA.mz);
  const sail = yardSail(BRIG.sail.w, BRIG.sail.h); sail.name = "msail"; sail.position.set(FLAGSEA.mx + BRIG.sail.x, MERCHANT_DECK + BRIG.sail.top, FLAGSEA.mz + BRIG.sail.z);
  root.add(brig, sail); root.userData.named = [...old.filter((o) => o.name !== "plank"), brig, sail];
  // the evening: a red veil inside the sky, and the sun and the sky light turn warm
  const veilTex = paint("duskveil", 16, 512, (g) => { const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#7a2440"); gr.addColorStop(0.42, "#e8503a"); gr.addColorStop(0.56, "#ffb060"); gr.addColorStop(1, "#ffb060"); g.fillStyle = gr; g.fillRect(0, 0, 16, 512); });
  const veil = new THREE.Mesh(new THREE.SphereGeometry(880, 24, 16), new THREE.MeshBasicMaterial({ map: veilTex, side: THREE.BackSide, fog: false, depthWrite: false, transparent: true, opacity: 0 })); veil.renderOrder = -9; root.add(veil);
  const rig = root.userData.rig as THREE.Object3D, sun = rig.userData.sun as THREE.DirectionalLight, hemi = rig.children.find((o) => (o as THREE.HemisphereLight).isHemisphereLight) as THREE.HemisphereLight;
  const day = sun.color.clone(), skyDay = hemi.color.clone(), red = new THREE.Color("#ff8a5a"), skyRed = new THREE.Color("#ff9a8a"), base = root.userData.tick as (t: number) => void;
  root.userData.tick = (T: number) => { base(T); const k = Math.max(0, Math.min(1, dusk.at(T))); (veil.material as THREE.MeshBasicMaterial).opacity = k; veil.visible = k > 0.001; sun.color.copy(day).lerp(red, k); hemi.color.copy(skyDay).lerp(skyRed, k); };
  return root;
};
/** what a figure may not stand in or walk through in flagSea (Film.solids): rails, masts, the waist cloth, the water between the
 *  ships, the guns and casks on the sloop's deck. The merchant's parts are named, so they do not count where a shot hides her */
export const FLAGSEA_SOLIDS = [
  { name: "the sloop's port rail", x: [-2.88, -2.72], z: [-8.5, 4.9], top: 0.95 }, { name: "the sloop's starboard rail", x: [2.72, 2.88], z: [-8.5, 4.9], top: 0.95 },
  { name: "the waist cloth", x: [-2.84, -2.72], z: [5.0, 7.75], top: FLAGSEA.cloth }, { name: "the quarterdeck's front", x: [-2.8, 2.8], z: [4.9, 5.0], top: SHIP.aft },
  { name: "the sloop's mast", x: [-0.25, 0.25], z: [-1.85, -1.35], top: 13 }, { name: "the flagstaff", x: [-2.48, -2.32], z: [8.02, 8.18], top: 6 },
  { name: "a gun", x: [-2.5, -1.4], z: [-0.15, 0.55], top: 0.6 }, { name: "a gun", x: [-2.5, -1.4], z: [-3.95, -3.25], top: 0.6 }, { name: "the casks", x: [-2.55, -1.25], z: [-2.05, -1.1], top: 0.9 },
  { name: "the water between the ships", x: [-5.1, -2.9], z: [-6, 9], top: 99, named: "merchant" },
  { name: "the merchant's starboard rail", x: [-5.28, -5.12], z: [-6, 9], top: 1.2, named: "merchant" }, { name: "the merchant's port rail", x: [-11.28, -11.12], z: [-6, 9], top: 1.2, named: "merchant" },
  { name: "the merchant's after mast", x: [-9.0, -8.6], z: [4.3, 4.7], top: 10, named: "merchant" }, { name: "the merchant's main mast", x: [-8.45, -7.95], z: [-1.35, -0.85], top: 13, named: "merchant" },
] as { name: string; x: [number, number]; z: [number, number]; top: number; named?: string }[];

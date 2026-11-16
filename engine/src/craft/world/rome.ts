// A street corner in Rome about AD 70, built from the world kit: a fuller's laundry open to the street with its treading stalls and
// drying cloth, a big jar at the corner, houses down both sides (each its own colour, with doors in frames, shuttered windows, tiled
// roofs and painted words), a portico, stepping stones, a fountain, a cook-shop counter. The street runs along z. Toward -z it opens
// on the great amphitheatre being built (begun under Vespasian); toward +z a temple closes it. x < 0 is the left side.
// Shared set: every Short on the Roman street uses it.
import * as THREE from "three";
import { mesh, group, box, paint, sunRig, skyDome } from "./kit";
import { C, amphora, jar, basket, sack, cart, column, table, fountain, house, cloud, awning, House, streetJar, treadingStall, dryingPole, barCounter, bench, cypress, temple, amphitheatreSite, painted, loaf, windowAt, sunShade, wallShelf, wallLamp, treadingTub } from "./props";

export const WALK = 0.28;
/** where things stand, for the films that play here */
export const ROME = {
  jar: [3.5, WALK, 3.5] as [number, number, number],          // the big jar at the corner, against the house wall
  box: [2.65, WALK, 3.8] as [number, number, number],         // where the collector's strongbox stands beside the jar (the films put it there)
  stall: [8.15, WALK + 0.1, -1.55] as [number, number, number], // the first treading stall inside the laundry (it opens toward -x)
  tub: [6.3, WALK + 0.1, 0.1] as [number, number, number],     // the round treading tub in the middle of the laundry's yard
  shopFront: 4.1,                                             // x of the laundry's open front
};
const paving = () => paint("paving", 512, 512, (g, r) => {
  const n = 5, c = 512 / n, P: number[][][] = [];
  for (let i = 0; i <= n; i++) { P.push([]); for (let k = 0; k <= n; k++) P[i].push([i * c + (i % n ? (r() - 0.5) * c * 0.5 : 0), k * c + (k % n ? (r() - 0.5) * c * 0.5 : 0)]); }
  g.fillStyle = "#8e90a0"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < n; i++) for (let k = 0; k < n; k++) {
    const q = [P[i][k], P[i + 1][k], P[i + 1][k + 1], P[i][k + 1]], cx = (q[0][0] + q[2][0]) / 2, cy = (q[0][1] + q[2][1]) / 2;
    g.fillStyle = ["#a3a5b4", "#9497a6", "#aeb0bd", "#9b9eac"][(i * 3 + k * 5) % 4]; g.beginPath();
    q.forEach(([x, y], m) => { const X = cx + (x - cx) * 0.965, Y = cy + (y - cy) * 0.965; if (m) g.lineTo(X, Y); else g.moveTo(X, Y); }); g.closePath(); g.fill();
  }
});
const slabs = () => paint("slabs", 256, 256, (g) => { g.fillStyle = "#e6d9b4"; g.fillRect(0, 0, 256, 256); g.strokeStyle = "#b3a377"; g.lineWidth = 5; g.strokeRect(0, 0, 256, 256); g.beginPath(); g.moveTo(128, 0); g.lineTo(128, 256); g.stroke(); });

/** the fuller's laundry: an open-fronted shop on the right side around z = 0. Its front stands on x = 4.1 */
const laundry = () => {
  const g = new THREE.Group(), W = 5.0, H = 3.4, D = 4.8, x0 = ROME.shopFront;
  g.add(mesh(box(D, 0.1, W), "#d9c9a2", { at: [x0 + D / 2, WALK + 0.05, 0] }));
  g.add(mesh(box(0.25, H, W), "#fbf3df", { at: [x0 + D, WALK + H / 2, 0] }), mesh(box(0.06, 1.1, W), C.red, { at: [x0 + D - 0.15, WALK + 0.65, 0], line: 0.6 }));
  for (const s of [-1, 1]) g.add(mesh(box(D, H, 0.25), "#f6c95e", { at: [x0 + D / 2, WALK + H / 2, s * W / 2] }));
  for (const s of [-1, 1]) g.add(mesh(box(0.46, H, 0.46), "#fbf3df", { at: [x0 + 0.05, WALK + H / 2, s * (W / 2 - 0.2)] }), mesh(box(0.5, 1.1, 0.5), C.red, { at: [x0 + 0.05, WALK + 0.55, s * (W / 2 - 0.2)], line: 0.6 }));
  g.add(mesh(box(0.46, 0.5, W), C.woodD, { at: [x0 + 0.05, WALK + H - 0.25, 0] }));
  const roof = group([mesh(box(1.5, 0.16, W + 0.7), C.terra)], [x0 + D - 0.5, WALK + H + 0.08, 0]); for (let z = -W / 2; z <= W / 2; z += 0.46) roof.add(mesh(box(1.54, 0.1, 0.12), "#b55a30", { at: [0, 0.1, z], line: 0.5 })); g.add(roof);
  // three treading stalls along the back wall, a rinsing basin, cloth on poles, baskets of washing
  for (const [i, z] of [-1.55, -0.2, 1.15].entries()) { const st = treadingStall(i === 1 ? "#d4c468" : "#cdb95a"); st.rotation.y = -Math.PI / 2; st.position.set(x0 + D - 0.75, WALK + 0.1, z); g.add(st); }
  g.add(mesh(box(1.0, 0.6, 1.5), "#d8cdb4", { at: [x0 + 4.0, WALK + 0.4, 1.55] }), mesh(box(0.8, 0.04, 1.3), "#7cc0e0", { at: [x0 + 4.0, WALK + 0.69, 1.55], line: 0, shadow: false }));
  { const p = dryingPole(3.2, 2.35, [[-1.05, 0.8, 1.25, "#fbf6ea"], [-0.1, 0.9, 1.5, "#f6e3b4"], [0.9, 0.75, 1.15, "#fbf6ea"]]); p.position.set(x0 + 2.3, WALK + 0.1, 2.0); g.add(p); }
  { const b = basket(0.34, 0.3); b.position.set(x0 + 0.75, WALK + 0.1, -1.5); g.add(b, mesh(box(0.5, 0.16, 0.4), "#fbf6ea", { at: [x0 + 0.75, WALK + 0.46, -1.5], rot: [0, 0.3, 0.08] })); }
  g.add(mesh(box(1.6, 0.06, 0.3), C.woodD, { at: [x0 + 1.0, WALK + 1.75, -2.3] })); for (const dx of [-0.5, 0, 0.5]) { const j = jar(0.34); j.position.set(x0 + 1.0 + dx, WALK + 1.78, -2.3); g.add(j); }
  { const sh = wallShelf(3.6, 5); sh.rotation.y = -Math.PI / 2; sh.position.set(x0 + D - 0.13, WALK + 2.05, -0.2); g.add(sh); for (const z of [-1.2, 0.5]) g.add(mesh(box(0.3, 0.14, 0.4), z < 0 ? "#fbf6ea" : "#e9a07c", { at: [x0 + D - 0.3, WALK + 2.15, z] })); }
  { const t = treadingTub(); t.position.set(...ROME.tub); g.add(t); }
  // the name of the trade over the door, painted on a board
  { const t = painted(["FVLLONICA"], 2.6, 0.5, { ink: "#b3261e", bg: "#fbf3df", edge: "#b3261e" }); t.rotation.y = -Math.PI / 2; t.position.set(x0 - 0.2, WALK + H - 0.25, 0); g.add(t); }
  return g;
};

export const romeStreet = () => {
  const root = new THREE.Group();
  root.add(skyDome("#2f86e0", "#a9dcff", "#e8f6ff"));
  const rig = sunRig({ from: [-9, 15, 7], power: 1.5, fill: 1.75, bounce: 0.85, reach: 12 }, [0, 0, 0]); root.add(rig); root.userData.rig = rig;
  // ground, road, sidewalks, kerbs
  root.add(mesh(box(600, 0.2, 600), "#dccb9c", { at: [0, -0.32, -100], line: 0, shadow: false }));
  root.add(mesh(box(4.2, 0.3, 80), "#ffffff", { at: [0, -0.15, 0], map: (paving(), paint("paving", 512, 512, () => {}, [1.4, 26])), line: 0 }));
  for (const s of [-1, 1]) {
    root.add(mesh(box(2.0, WALK + 0.3, 80), "#ffffff", { at: [s * 3.1, (WALK - 0.3) / 2, 0], map: (slabs(), paint("slabs", 256, 256, () => {}, [1, 34])) }));
    root.add(mesh(box(0.22, WALK + 0.32, 80), C.stoneL, { at: [s * 2.1, (WALK - 0.28) / 2, 0], line: 0.7 }));
  }
  // stepping stones across the road, in two places
  for (const z of [-4.2, 9.6]) for (const x of [-1.25, 0, 1.25]) root.add(mesh(box(0.9, 0.3, 0.62), C.stone, { at: [x, 0.15, z] }));
  // houses: every one its own colour
  const left: House[] = [
    { w: 7, h: 5.0, d: 6, wall: "#fbf3df", dado: C.red, door: -1.4, doorCol: C.green, windows: [1.6, -1.4], shutter: C.green, signs: [{ x: 1.7, y: 2.0, w: 2.7, h: 0.95, lines: ["HELVIVM", "AED · O · V · F"], ink: "#b3261e", bg: "#fbf3df" }] },
    { w: 7.6, h: 5.6, d: 6, wall: "#f3b58c", dado: "#7a2f2a", door: 2.0, doorCol: C.blue, windows: [-2.2, 2.0], shutter: C.blue, signs: [{ x: -1.3, y: 1.75, w: 1.5, h: 0.42, lines: ["SALVE"], ink: "#4a3020", bg: "#f3b58c" }] },
    { w: 7, h: 4.6, d: 6, wall: "#f6c95e", dado: C.red, shop: -0.4, windows: [2.4], shutter: C.green, awning: [C.blue, C.cloth] },
    { w: 7, h: 5.2, d: 6, wall: "#fbf3df", dado: C.ochre, door: 0, doorCol: "#9a4a2a", windows: [-2, 2], shutter: C.blue },
    { w: 7, h: 4.8, d: 6, wall: "#e9a07c", dado: "#7a2f2a", door: -1, windows: [1.8], shutter: C.green },
  ];
  const right: House[] = [
    { w: 7, h: 5.2, d: 6, wall: "#f6c95e", dado: "#7a2f2a", door: 1.5, doorCol: C.blue, windows: [-1.5, 1.5], shutter: C.blue },
    { w: 7, h: 5.4, d: 6, wall: "#fbf3df", dado: C.red, shop: 0.6, windows: [-2.3], shutter: C.green, awning: [C.ochre, C.cloth], signs: [{ x: -2.2, y: 1.9, w: 1.9, h: 0.5, lines: ["FELICITER"], ink: "#b3261e", bg: "#fbf3df" }] },
    { w: 7.5, h: 4.6, d: 6, wall: "#f3b58c", dado: C.red, door: -1.5, doorCol: C.green, windows: [1.5], shutter: C.green },
    { w: 7, h: 5.2, d: 6, wall: "#fbf3df", dado: C.ochre, door: 1, windows: [-2, 1], shutter: C.blue },
  ];
  let z = 17.6;
  for (const h of left) { const g = house(h); g.rotation.y = Math.PI / 2; g.position.set(-4.1, WALK, z - h.w / 2); root.add(g); z -= h.w + 0.12; }
  { const g = house(right[0]); g.rotation.y = -Math.PI / 2; g.position.set(4.1, WALK, 9.75 + 3.5); root.add(g); }
  { const g = house({ w: 7.1, h: 4.8, d: 6, wall: "#fbf3df", dado: C.red, door: 2.3, doorCol: C.blue, windows: [-2.2, 0.6], shutter: C.blue }); g.rotation.y = -Math.PI / 2; g.position.set(4.1, WALK, 6.13); root.add(g);
    // the wall by the jar: a window under a sun shade, a lamp on its arm, a shelf of jars over a bench
    const onWall = (o: THREE.Object3D, z: number, y: number, x = 4.09) => { o.rotation.y = -Math.PI / 2; o.position.set(x, WALK + y, z); root.add(o); };
    onWall(windowAt(C.green), 4.55, 2.2); onWall(sunShade(1.5, 0.85, C.green, C.cloth), 4.55, 3.05); onWall(wallShelf(1.5, 3), 6.1, 1.62); onWall(wallLamp(), 3.3, 2.45); onWall(bench(1.5), 6.1, 0, 3.86); }
  root.add(laundry());
  z = -2.62; for (const h of right.slice(1)) { const g = house(h); g.rotation.y = -Math.PI / 2; g.position.set(4.1, WALK, z - h.w / 2); root.add(g); z -= h.w + 0.12; }
  // the portico on the left sidewalk: three columns and a beam with its roof
  for (const cz of [2.4, -0.8, -4.0]) { const c = column(3.3, 0.23); c.position.set(-2.55, WALK, cz); root.add(c); }
  root.add(mesh(box(0.6, 0.36, 7.4), C.marble, { at: [-2.55, WALK + 3.48, -0.8] }), mesh(box(1.9, 0.14, 7.6), C.terra, { at: [-3.3, WALK + 3.73, -0.8], rot: [0, 0, 0.16] }));
  // the corner by the laundry: the big jar (the collector's table and strongbox are moved by the films)
  { const j = streetJar(0.82); j.position.set(...ROME.jar); root.add(j); }
  // street furniture: the fountain, a bench, the cook-shop counter, jars, a cart further down
  { const f = fountain(); f.position.set(-2.95, WALK, 6.3); f.rotation.y = Math.PI / 2; root.add(f); }
  { const b = bench(1.8); b.rotation.y = Math.PI / 2; b.position.set(-3.85, WALK, 0.8); root.add(b); }
  { const b = barCounter(2.4); b.rotation.y = -Math.PI / 2; b.position.set(3.7, WALK, -5.6); root.add(b); for (const dz of [-0.5, 0.2]) { const l = loaf(0.13); l.position.set(3.7, WALK + 0.97, -6.45 + dz * 0.5); root.add(l); } }
  for (const [x, zz, t] of [[-3.6, 4.2, 0], [-3.3, 3.8, 1], [3.6, -9.2, 0], [3.3, -9.8, 2], [-3.4, -8.5, 1], [-3.5, 11.2, 2]] as number[][]) { const o = t === 0 ? amphora(0.95) : t === 1 ? jar(0.7) : basket(); o.position.set(x, WALK, zz); if (t === 0) { o.rotation.z = 0.24; o.position.y += 0.02; } root.add(o); }
  { const c = cart(); c.position.set(0.5, 0, -10.5); c.rotation.y = 0.5; root.add(c); const a = amphora(0.9); a.position.set(0.4, 0.77, -10.7); a.rotation.z = 0.2; root.add(a); const s = sack(0.3); s.position.set(0.7, 0.77, -10.1); root.add(s); }
  { const a = awning(2.6, 1.3, 2.8, C.green, C.cloth); a.rotation.y = Math.PI / 2; a.position.set(-4.0, WALK, 12.0); root.add(a); const t = table(1.3, 0.6, 0.74); t.rotation.y = Math.PI / 2; t.position.set(-3.3, WALK, 12.0); root.add(t); for (const dz of [-0.4, 0, 0.4]) { const o = jar(0.4); o.position.set(-3.3, WALK + 0.78, 12 + dz); root.add(o); } }
  // far toward -z: the square, the great amphitheatre being built, tall trees, hills; toward +z: a temple closes the street
  { const a = amphitheatreSite(40, 9); a.position.set(10, 0, -112); a.rotation.y = 0.25; root.add(a); }
  for (const [x, zz, h] of [[-13, -34, 8], [-17, -41, 9], [15, -36, 8.5], [-24, -52, 10], [22, -47, 9]] as number[][]) { const t = cypress(h); t.position.set(x, 0, zz); root.add(t); }
  root.add(mesh(box(60, 0.12, 30), "#e9dcb6", { at: [0, -0.2, -54], line: 0, shadow: false }));
  for (const [x, zz, r, hh, col] of [[-170, -330, 150, 46, "#8fc06a"], [140, -380, 190, 60, "#7fb562"], [-20, -460, 260, 40, "#a4cc7c"]] as [number, number, number, number, string][]) root.add(mesh(new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), col, { at: [x, -2, zz], scale: [r, hh, r * 0.6], shadow: false, receive: false, line: 0.9 }));
  { const t = temple(9, 6.5); t.rotation.y = Math.PI; t.position.set(0, 0, 33); root.add(t); }
  for (const s of [-1, 1]) root.add(mesh(box(8, 5, 6), s < 0 ? "#f3b58c" : "#fbf3df", { at: [s * 9, 2.5, 27] }), mesh(box(8.5, 0.3, 6.5), C.terra, { at: [s * 9, 5.15, 27] }));
  for (const [x, y, zz, s] of [[-170, 150, -520, 34], [150, 190, -600, 44], [-40, 235, -640, 30], [260, 120, -500, 26], [-120, 130, 300, 36], [140, 170, 340, 40]] as number[][]) { const c = cloud(s); c.position.set(x, y, zz); root.add(c); }
  return root;
};

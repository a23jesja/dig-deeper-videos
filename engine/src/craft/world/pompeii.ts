// A street in Pompeii on a clear day before the eruption, built from the world kit. The street runs along z; looking toward -z
// the town gate closes it and Vesuvius (one green peak, as it was before 79) stands behind. x < 0 is the left side, x > 0 the right.
// The sidewalks are 0.28 m above the road. Shared set: the Pompeii Short and any other Roman street scene use it.
import * as THREE from "three";
import { mesh, group, box, lathe, paint, sunRig, skyDome } from "./kit";
import { C, loaf, amphora, jar, basket, sack, cart, column, table, stool, coins, counter, oven, mill, fountain, house, cloud, awning, ring, House } from "./props";

export const WALK = 0.28; // height of the sidewalks
const paving = () => paint("paving", 512, 512, (g, r) => {
  g.fillStyle = "#9a9ca8"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 46; i++) { g.fillStyle = ["#8c8e9b", "#a6a8b3", "#90929e"][i % 3]; const x = r() * 512, y = r() * 512, w = 50 + r() * 60, h = 40 + r() * 50; g.beginPath(); g.ellipse(x, y, w / 2, h / 2, r() * 3, 0, 7); g.fill(); g.lineWidth = 5; g.strokeStyle = "#5d5f6c"; g.stroke(); }
});
const slabs = () => paint("slabs", 256, 256, (g) => { g.fillStyle = "#dccfab"; g.fillRect(0, 0, 256, 256); g.strokeStyle = "#a8996f"; g.lineWidth = 5; g.strokeRect(0, 0, 256, 256); g.beginPath(); g.moveTo(128, 0); g.lineTo(128, 256); g.stroke(); });

/** the bakery: an open-fronted shop on the right side, seen from the street and from inside. Its front stands on x = 4.1 around z = 0 */
const bakery = () => {
  const g = new THREE.Group(), W = 4.6, H = 3.3, D = 4.6, x0 = 4.1;
  g.add(mesh(box(D, 0.1, W), "#c9b38a", { at: [x0 + D / 2, WALK + 0.05, 0] }));                               // floor
  g.add(mesh(box(0.25, H, W), C.plaster, { at: [x0 + D, WALK + H / 2, 0] }));                                  // back wall
  for (const s of [-1, 1]) g.add(mesh(box(D, H, 0.25), C.ochre, { at: [x0 + D / 2, WALK + H / 2, s * W / 2] }));     // side walls
  for (const s of [-1, 1]) g.add(mesh(box(0.42, H, 0.42), C.red, { at: [x0 + 0.05, WALK + H / 2, s * (W / 2 - 0.2)] })); // front pillars
  g.add(mesh(box(0.42, 0.5, W), C.woodD, { at: [x0 + 0.05, WALK + H - 0.25, 0] }));                            // lintel
  g.add(mesh(box(D + 0.6, 0.16, W + 0.6), C.terra, { at: [x0 + D / 2, WALK + H + 0.08, 0] }));                  // roof
  const cn = counter(3.0, 0.95, 0.6); cn.rotation.y = -Math.PI / 2; cn.position.set(x0 - 0.15, WALK, 0); g.add(cn);
  for (const [z, x, r] of [[-1.05, 0, 0.17], [-0.62, 0.06, 0.16], [-0.2, -0.04, 0.17], [0.24, 0.05, 0.16], [-0.42, -0.02, 0.15]] as number[][]) { const l = loaf(r); l.position.set(x0 - 0.15 + x, WALK + 0.95 + (z === -0.42 ? 0.13 : 0), z); l.rotation.y = z * 3; g.add(l); }
  const bk = basket(0.3, 0.26); bk.position.set(x0 - 0.15, WALK + 0.95, 0.95); g.add(bk);
  for (const [dx, dz, dy] of [[0, 0, 0.2], [0.12, 0.1, 0.3], [-0.1, 0.06, 0.32]] as number[][]) { const l = loaf(0.13); l.position.set(x0 - 0.15 + dx, WALK + 0.95 + dy, 0.95 + dz); l.rotation.set(0.5, dx * 9, 0.3); g.add(l); }
  const ov = oven(); ov.rotation.y = -Math.PI / 2; ov.position.set(x0 + D - 1.1, WALK + 0.1, -1.1); g.add(ov);
  const ml = mill(); ml.position.set(x0 + D - 1.0, WALK + 0.1, 1.25); g.add(ml);
  const tb = table(1.5, 0.75, 0.86); tb.position.set(x0 + 1.75, WALK + 0.1, 0.55); tb.rotation.y = 0.12; g.add(tb);
  for (const [dx, dz, r] of [[-0.45, 0.05, 0.19], [0.0, -0.08, 0.2], [0.42, 0.1, 0.18], [-0.2, 0.2, 0.16]] as number[][]) { const l = loaf(r); l.position.set(x0 + 1.75 + dx, WALK + 0.1 + 0.9, 0.55 + dz); l.rotation.y = dx * 5; g.add(l); }
  const sk = sack(0.34); sk.position.set(x0 + 0.9, WALK + 0.1, -1.6); g.add(sk);
  const aw = awning(3.6, 1.7, 3.0, C.red, C.cloth); aw.rotation.y = -Math.PI / 2; aw.position.set(x0 - 0.1, WALK, 0); g.add(aw);
  return g;
};

export type Shot = { cam: [number, number, number]; look: [number, number, number]; fov: number; tilt?: number };
export const POMPEII_SHOTS: Shot[] = [
  // 1. behind the baker's counter, bread close to the lens, the street beyond
  { cam: [6.75, 1.72, 1.35], look: [-1.2, 1.0, -3.6], fov: 58 },
  // 2. low from the ground past the cart, the portico's columns, Vesuvius at the end of the street
  { cam: [0.95, 0.3, 8.9], look: [-1.5, 2.4, -8], fov: 62 },
  // 3. from above: the merchant's table on the sidewalk, the dog on its chain
  { cam: [0.35, 5.0, 12.3], look: [2.75, 0.75, 8.1], fov: 46, tilt: 0.55 },
];
/** where the figures of the three stills stand: [x, y, z, heading in degrees (0 = toward +z, 90 = toward +x)] */
export const POMPEII_MARKS = {
  sirWalk: [0.35, 0, -2.6, 20], soldier: [-2.12, WALK, 1.55, 60], merchant: [3.05, WALK, 7.55, -10], dog: [2.2, WALK, 9.6, 200], dogRing: [3.98, WALK + 0.55, 8.9],
  baker: [4.9, WALK + 0.1, -0.7, -90],
} as const;

export const pompeiiStreet = () => {
  const root = new THREE.Group();
  root.add(skyDome("#2f86e0", "#a9dcff", "#e8f6ff"));
  root.add(sunRig({ from: [-9, 15, 7], power: 3.2, fill: 1.3, reach: 30 }, [0, 0, -4]));
  // ground, road, sidewalks, stepping stones
  root.add(mesh(box(400, 0.2, 400), "#d8c79a", { at: [0, -0.32, -100], line: 0, shadow: false }));
  root.add(mesh(box(4.2, 0.3, 70), "#ffffff", { at: [0, -0.15, -12], map: (paving(), paint("paving", 512, 512, () => {}, [2, 30])), line: 0 }));
  for (const s of [-1, 1]) {
    root.add(mesh(box(2.0, WALK + 0.3, 70), "#ffffff", { at: [s * 3.1, (WALK - 0.3) / 2, -12], map: (slabs(), paint("slabs", 256, 256, () => {}, [1, 30])) }));
    root.add(mesh(box(0.22, WALK + 0.32, 70), C.stoneL, { at: [s * 2.1, (WALK - 0.28) / 2, -12], line: 0.7 }));
  }
  for (const x of [-1.25, 0, 1.25]) root.add(mesh(box(0.9, 0.3, 0.6), C.stone, { at: [x, 0.15, -4.4] }));
  // houses down both sides
  const left: House[] = [
    { w: 7, h: 5.2, d: 6, wall: "#f6e3b4", dado: C.red, door: -1.6, windows: [1.2, -1.6], shutter: C.green },
    { w: 7, h: 4.4, d: 6, wall: C.plaster, dado: C.ochre, shop: 0.4, windows: [-2.4], shutter: C.blue, awning: [C.blue, C.cloth] },
    { w: 7.5, h: 5.6, d: 6, wall: "#f2c9a0", dado: "#7a2f2a", door: 1.8, windows: [-1.8, 1.8], shutter: C.green },
    { w: 7, h: 4.6, d: 6, wall: C.plaster, dado: C.red, shop: -0.6, windows: [2.3], shutter: C.blue, awning: [C.green, C.cloth] },
    { w: 7, h: 5.0, d: 6, wall: "#f6e3b4", dado: C.ochre, door: 0, windows: [-2, 2] },
  ];
  const right: House[] = [
    { w: 7, h: 4.8, d: 6, wall: C.plaster, dado: C.ochre, door: 1.6, windows: [-1.4, 1.6], shutter: C.blue },
    { w: 7, h: 5.4, d: 6, wall: "#f2c9a0", dado: C.red, shop: 0.5, windows: [-2.3], shutter: C.green, awning: [C.ochre, C.cloth] },
    { w: 7.5, h: 4.5, d: 6, wall: "#f6e3b4", dado: "#7a2f2a", door: -1.5, windows: [1.5], shutter: C.green },
    { w: 7, h: 5.2, d: 6, wall: C.plaster, dado: C.red, door: 1, windows: [-2, 1] },
  ];
  // left side: the portico with its columns stands in front of the second house, around z = 0
  let z = 15.5;
  for (const h of left) { const g = house(h); g.rotation.y = Math.PI / 2; g.position.set(-4.1, WALK, z - h.w / 2); root.add(g); z -= h.w + 0.12; }
  z = 15.5;
  { const g = house(right[0]); g.rotation.y = -Math.PI / 2; g.position.set(4.1, WALK, z - 3.5); root.add(g); z -= 7.12; }
  z = 2.4; root.add(bakery()); z = -2.42;
  for (const h of right.slice(1)) { const g = house(h); g.rotation.y = -Math.PI / 2; g.position.set(4.1, WALK, z - h.w / 2); root.add(g); z -= h.w + 0.12; }
  { const g = house({ w: 5.8, h: 5.0, d: 6, wall: "#f6e3b4", dado: C.red, door: -0.9, windows: [1.5], shutter: C.blue }); g.rotation.y = -Math.PI / 2; g.position.set(4.1, WALK, 5.5); root.add(g); }
  // the portico: three columns and a beam on the left sidewalk
  for (const cz of [1.9, -1.3, -4.5]) { const c = column(3.3, 0.23); c.position.set(-2.55, WALK, cz); root.add(c); }
  root.add(mesh(box(0.6, 0.36, 7.4), C.marble, { at: [-2.55, WALK + 3.48, -1.3] }), mesh(box(1.9, 0.14, 7.6), C.terra, { at: [-3.3, WALK + 3.73, -1.3], rot: [0, 0, 0.16] }));
  // the cart on the road, loaded with jars and sacks
  { const c = cart(); c.position.set(-0.75, 0, 6.3); c.rotation.y = 0.5; root.add(c); const a = amphora(0.9); a.position.set(-0.9, 0.77, 6.0); a.rotation.z = 0.2; root.add(a); const j = jar(0.6); j.position.set(-0.45, 0.77, 6.5); root.add(j); const s = sack(0.3); s.position.set(-1.0, 0.77, 6.9); root.add(s); }
  // street furniture
  { const f = fountain(); f.position.set(-2.9, WALK, 9.4); f.rotation.y = Math.PI / 2; root.add(f); }
  for (const [x, zz, t] of [[-3.5, 4.6, 0], [-3.2, 4.1, 1], [3.6, -6.2, 0], [3.3, -6.8, 2], [-3.4, -8.5, 1], [3.5, 13, 0]] as number[][]) { const o = t === 0 ? amphora(0.95) : t === 1 ? jar(0.7) : basket(); o.position.set(x, WALK, zz); if (t === 0) { o.rotation.z = 0.24; o.position.y += 0.02; } root.add(o); }
  // the merchant's table with his coins, a stool, and the ring his dog is chained to
  { const t = table(1.25, 0.72, 0.74); t.position.set(2.85, WALK, 8.3); t.rotation.y = 0.1; root.add(t); const c = coins(34, 3); c.position.set(2.72, WALK + 0.78, 8.32); root.add(c); const s = stool(); s.position.set(3.25, WALK, 7.35); root.add(s); const b = basket(0.2, 0.18); b.position.set(3.3, WALK + 0.78, 8.42); root.add(b); root.add(ring([3.98, WALK + 0.55, 8.9])); }
  // the town gate that closes the street, and Vesuvius behind it
  for (const s of [-1, 1]) root.add(mesh(box(3.4, 8.5, 3.2), C.stoneL, { at: [s * 4.0, 4.25, -40] }), mesh(box(3.8, 0.5, 3.6), C.stone, { at: [s * 4.0, 8.7, -40] }));
  root.add(mesh(box(4.8, 2.6, 2.6), C.stoneL, { at: [0, 6.4, -40] }), mesh(box(11.6, 0.4, 3.0), C.stone, { at: [0, 7.9, -40], line: 0.7 }));
  root.add(mesh(lathe("vesuvio", [[330, 0], [250, 38], [170, 86], [112, 122]], 28), "#63a850", { at: [20, -2, -560], shadow: false, receive: false, line: 1.1 }));
  root.add(mesh(lathe("vesuvioTop", [[112, 122], [62, 150], [26, 166], [0.001, 170]], 28), "#a89c86", { at: [20, -2, -560], shadow: false, receive: false, line: 1.1 }));
  for (const [x, y, zz, s] of [[-170, 150, -520, 34], [150, 190, -600, 44], [-40, 235, -640, 30], [260, 120, -500, 26]] as number[][]) { const c = cloud(s); c.position.set(x, y, zz); root.add(c); }
  return root;
};

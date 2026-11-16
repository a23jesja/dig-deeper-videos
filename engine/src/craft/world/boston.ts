// Griffin's Wharf in Boston on the 16th of December 1773: a wooden wharf with warehouses along one side and a tea ship moored along
// the other, the town and the meeting house at the end. Built from the world kit. The wharf runs along z (the town lies toward -z),
// its planks are at y = 0, the ship's deck at y = DECK. x < 0 is the warehouse side, x > WHARF_X is the ship.
// night = the evening of the raid: a cold moon as the one strong light and warm lamps along the wharf.
import * as THREE from "three";
import { mesh, group, box, cyl, lathe, prism, rod, paint, sunRig, skyDome } from "./kit";
import { C, teaChest, barrel, ropeCoil, bollard, lampPost, crate, mast, house, cloud, coins, ring, wheel } from "./props";

export const DECK = 1.5, WHARF_X = 7.6;
const planks = (key: string, a: string, b: string, line: string) => paint(key, 256, 256, (g, r) => {
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 3 ? a : b; g.fillRect(0, i * 32, 256, 32); g.fillStyle = line; g.fillRect(0, i * 32, 256, 3); const x = Math.floor(r() * 220); g.fillRect(x, i * 32, 3, 32); }
});
/** the outline of the hull seen from above: the bow toward -z */
const HULL: [number, number][] = [[12.2, -19], [14.2, -15], [15.6, -9], [15.9, 0], [15.7, 8], [15.0, 12.2], [9.4, 12.2], [8.7, 8], [8.5, 0], [8.8, -9], [10.2, -15]];
const inset = (k: number): [number, number][] => HULL.map(([x, z]) => [12.2 + (x - 12.2) * k, -3 + (z + 3) * k]);

const ship = () => {
  const g = new THREE.Group();
  g.add(mesh(prism("hullLow", HULL, -2.2, 0.75), "#2b2a33"), mesh(prism("hullUp", HULL, 0.75, DECK), "#d9a441"), mesh(prism("hullWale", inset(1.012), 0.62, 0.8), "#2b2a33", { line: 0.6 }));
  g.add(mesh(prism("deck", inset(0.965), DECK, DECK + 0.05), "#ffffff", { map: (planks("deckplanks", "#d2b078", "#c6a26a", "#8a6a40"), paint("deckplanks", 256, 256, () => {}, [0.4, 0.4])), line: 0 }));
  // the bulwark round the deck, open where the gangplank comes aboard
  for (let i = 0; i < HULL.length; i++) {
    const [x0, z0] = HULL[i], [x1, z1] = HULL[(i + 1) % HULL.length], len = Math.hypot(x1 - x0, z1 - z0), wharfSide = x0 < 9.5 && x1 < 9.5 && Math.min(z0, z1) < 3.4 && Math.max(z0, z1) > 1;
    const seg = (a: number, b: number) => { const m = mesh(box(len * (b - a), 0.9, 0.16), "#b0613a", { at: [x0 + (x1 - x0) * (a + b) / 2, DECK + 0.45, z0 + (z1 - z0) * (a + b) / 2], rot: [0, -Math.atan2(z1 - z0, x1 - x0), 0] }); g.add(m); const r = mesh(box(len * (b - a) + 0.08, 0.09, 0.26), "#3a2a20", { at: [x0 + (x1 - x0) * (a + b) / 2, DECK + 0.93, z0 + (z1 - z0) * (a + b) / 2], rot: [0, -Math.atan2(z1 - z0, x1 - x0), 0], line: 0.6 }); g.add(r); };
    if (wharfSide) { const u0 = (1.2 - Math.min(z0, z1)) / Math.abs(z1 - z0), u1 = (3.2 - Math.min(z0, z1)) / Math.abs(z1 - z0), fl = z1 < z0; seg(0, fl ? 1 - u1 : u0); seg(fl ? 1 - u0 : u1, 1); } else seg(0, 1);
  }
  // the quarterdeck aft, the hatch, the capstan, the wheel
  g.add(mesh(box(5.6, 1.15, 4.2), "#b0613a", { at: [12.2, DECK + 0.575, 9.9] }), mesh(box(5.8, 0.08, 4.4), "#ffffff", { at: [12.2, DECK + 1.19, 9.9], map: paint("deckplanks", 256, 256, () => {}, [1.4, 1]), line: 0.6 }));
  for (const x of [10.6, 12.2, 13.8]) g.add(mesh(box(0.7, 0.5, 0.06), "#f1e2a0", { at: [x, DECK + 0.62, 7.78], line: 0.6, shadow: false }));
  g.add(mesh(box(2.6, 0.3, 2.2), "#8a5e2c", { at: [12.3, DECK + 0.15, -5.2] }), mesh(box(2.2, 0.04, 1.8), "#1d1a20", { at: [12.3, DECK + 0.31, -5.2], line: 0, shadow: false }));
  g.add(mesh(lathe("capstan", [[0.42, 0], [0.42, 0.1], [0.24, 0.2], [0.2, 0.7], [0.36, 0.78], [0.36, 0.95], [0.001, 0.95]]), "#8a5e2c", { at: [12.2, DECK, 3.0] }));
  { const w = wheel(0.5); w.position.set(12.2, DECK + 1.19 + 0.75, 9.0); g.add(w, mesh(box(0.16, 0.8, 0.16), "#5a4634", { at: [12.2, DECK + 1.19 + 0.4, 9.12] })); }
  // three masts, the bowsprit, the stays
  for (const [z, h] of [[-11.5, 20], [-2.5, 23], [6.2, 17]] as number[][]) { const m = mast(h, 3.5, DECK); m.position.set(12.2, 0, z); g.add(m); }
  g.add(rod([12.2, DECK + 0.6, -17.5], [12.2, DECK + 4.6, -26], 0.2, "#8a6a3e"), rod([12.2, 20, -11.5], [12.2, DECK + 4.4, -25.6], 0.03, "#3a3028", { line: 0.5 }), rod([12.2, 23, -2.5], [12.2, 13, -11.5], 0.03, "#3a3028", { line: 0.5 }), rod([12.2, 17, 6.2], [12.2, 12, -2.5], 0.03, "#3a3028", { line: 0.5 }));
  g.add(mesh(box(0.05, 1.1, 1.9), C.red, { at: [12.2, 16.4, 7.3], line: 0.6 }));
  // tea: stacked by the hatch and along the rail, one chest hanging from the hoist over the hatch
  const chest = (x: number, y: number, z: number, ry = 0) => { const c = teaChest(); c.position.set(x, y, z); c.rotation.y = ry; g.add(c); };
  for (const [x, y, z, r] of [[10.3, 0, -3.4, 0.1], [10.95, 0, -3.5, -0.05], [10.6, 0.5, -3.45, 0.2], [14.2, 0, -4.2, 0.3], [14.3, 0, -3.5, -0.1], [14.25, 0.5, -3.85, 0.1], [13.9, 0, -6.9, 0], [14.5, 0, -6.8, 0.2], [9.75, 0, 2.6, 0.1], [9.8, 0, 3.3, -0.1], [9.78, 0.5, 2.95, 0.25], [10.5, 0, 3.4, 0.4]] as number[][]) chest(x, DECK + 0.05 + y, z, r);
  g.add(rod([12.2, 11.5, -2.5], [12.3, 7.2, -5.2], 0.09, "#7a5a36"), rod([12.3, 7.2, -5.2], [12.3, 3.6, -5.2], 0.025, "#dcc38a", { line: 0.5 })); chest(12.3, 3.1, -5.2, 0.5);
  { const b = barrel(0.9, 0.32); b.position.set(13.6, DECK + 0.05, -1.0); g.add(b); const c2 = ropeCoil(0.4, 3); c2.position.set(10.1, DECK + 0.05, -8); g.add(c2); }
  return g;
};

export type BostonO = { night?: boolean };
export const bostonWharf = (o: BostonO = {}) => {
  const root = new THREE.Group(), N = !!o.night;
  root.add(N ? skyDome("#0b1230", "#243a66", "#3a4f7a") : skyDome("#3b8fe2", "#b4ddf7", "#eaf6ff"));
  root.add(N ? sunRig({ from: [8, 14, -6], color: "#bcd2ff", power: 1.05, sky: "#5a6fa8", ground: "#3a3550", fill: 0.85, reach: 34 }, [4, 0, -2]) : sunRig({ from: [-10, 13, 9], power: 1.85, fill: 1.7, reach: 34 }, [4, 0, -2]));
  // the harbour water, the wharf on its piles
  root.add(mesh(box(900, 0.2, 900), N ? "#1f3f6e" : "#3f93d6", { at: [0, -1.7, -100], line: 0, shadow: false, map: (paint("waves", 256, 256, (g, r) => { g.fillStyle = "#ffffff"; g.fillRect(0, 0, 256, 256); g.strokeStyle = "rgba(255,255,255,1)"; g.fillStyle = "rgba(20,40,90,0.16)"; for (let i = 0; i < 26; i++) { const x = r() * 256, y = r() * 256; g.fillRect(x, y, 34 + r() * 30, 5); } }), paint("waves", 256, 256, () => {}, [80, 80])) }));
  root.add(mesh(box(WHARF_X * 2, 0.4, 62), "#ffffff", { at: [0, -0.2, -8], map: (planks("wharfplanks", "#c9a66b", "#bd9a60", "#7d5f3a"), paint("wharfplanks", 256, 256, () => {}, [4, 16])) }));
  root.add(mesh(box(0.3, 0.46, 62), "#8a6a40", { at: [WHARF_X - 0.15, -0.21, -8], line: 0.7 }));
  for (let z = -38; z <= 22; z += 4) root.add(mesh(cyl(0.22, 0.22, 2.2, 10), "#5a4634", { at: [WHARF_X - 0.25, -1.1, z] }));
  // warehouses along the far side of the wharf
  const sheds: [number, number, string, string, number?][] = [[9, 6.4, "#b5553a", "#3f6f4a"], [8, 5.2, "#e8dcc0", "#2f4f86", 1], [9.5, 7.0, "#8e9db0", "#7a2f2a"], [8, 5.6, "#b5553a", "#e9c46a", 1], [9, 6.2, "#e8dcc0", "#3f6f4a"], [9, 6.8, "#b5553a", "#2f4f86"]];
  let z = 20;
  for (const [w, h, wall, shut, shop] of sheds) {
    const b = house({ w, h, d: 8, wall, dado: wall === "#e8dcc0" ? "#b9ad92" : "#8a4030", roof: "#5d6672", door: shop ? undefined : -w * 0.22, shop: shop ? 0.3 : undefined, windows: [w * 0.26, -w * 0.3], shutter: shut });
    b.rotation.y = Math.PI / 2; b.position.set(-WHARF_X, 0, z - w / 2); root.add(b); z -= w + 0.15;
  }
  root.add(ship());
  // the gangplank, the mooring lines
  root.add(mesh(box(2.6, 0.08, 1.0), "#b98a50", { at: [8.2, 0.76, 2.2], rot: [0, 0, 0.62] }), rod([7.3, 0.75, 1.72], [9.2, 2.42, 1.72], 0.03, "#dcc38a", { line: 0.5 }), rod([7.3, 0, 1.72], [7.3, 0.8, 1.72], 0.05, "#5a4634"));
  for (const zb of [-12, -4, 6]) { const b = bollard(); b.position.set(WHARF_X - 0.7, 0, zb); root.add(b); root.add(rod([WHARF_X - 0.7, 0.62, zb], [8.9, DECK + 0.6, zb + 1.5], 0.035, "#dcc38a", { line: 0.5 })); }
  // what stands on the wharf: lamps, casks, crates, rope, tea waiting to go ashore
  for (const zl of [-14, -3.2, 5.4, 15]) { const l = lampPost(2.9, N); l.position.set(2.3, 0, zl); root.add(l); if (N) { const p = new THREE.PointLight("#ffb347", 26, 13, 1.6); p.position.set(2.7, 2.5, zl); root.add(p); } }
  for (const [x, zz, t] of [[3.1, 7.3, 0], [3.75, 7.9, 0], [1.05, 7.0, 2], [-5.6, 2.4, 1], [-5.2, 3.3, 1], [-5.5, 2.8, 3], [5.9, -1.2, 4], [6.5, -0.9, 4], [6.2, -1.05, 5], [-5.8, -6.5, 0], [5.6, -9.5, 2], [-5.9, 9.6, 1], [-5.3, 10.5, 0]] as number[][]) {
    const p = t === 0 ? barrel() : t === 1 ? crate(0.75) : t === 2 ? ropeCoil() : t === 3 ? crate(0.6, "#b0703c") : teaChest();
    p.position.set(x, t === 3 ? 0.75 : t === 5 ? 0.5 : 0, zz); p.rotation.y = x * 2.1; root.add(p);
  }
  // the town at the head of the wharf: roofs, the brick tower and white spire of the meeting house, low hills, ships at anchor
  for (const [x, w, h, col] of [[-22, 9, 7, "#b5553a"], [-12, 8, 6, "#e8dcc0"], [6, 9, 7.5, "#c9a06a"], [16, 8, 6, "#b5553a"], [26, 9, 7, "#8e9db0"], [-32, 8, 6.5, "#e8dcc0"]] as [number, number, number, string][]) { const b = house({ w, h, d: 7, wall: col, dado: "#8a7a66", roof: "#5d6672", door: 0, windows: [w * 0.28, -w * 0.28], shutter: "#3f6f4a" }); b.position.set(x, 0, -44); root.add(b); }
  root.add(mesh(box(6, 21, 6), "#b5553a", { at: [-3, 10.5, -58] }), mesh(box(4.4, 5, 4.4), "#f4efe2", { at: [-3, 23.5, -58] }), mesh(cyl(0.1, 2.3, 14, 8), "#f4efe2", { at: [-3, 33, -58] }), mesh(box(7.4, 0.5, 7.4), "#f4efe2", { at: [-3, 21.2, -58], line: 0.7 }));
  root.add(mesh(lathe("hillA", [[150, 0], [110, 16], [60, 28], [0.001, 32]], 22), N ? "#2f4a4a" : "#6fb05a", { at: [-80, -1, -260], shadow: false, receive: false }), mesh(lathe("hillB", [[190, 0], [120, 20], [50, 34], [0.001, 38]], 22), N ? "#34504c" : "#7dbb62", { at: [110, -1, -300], shadow: false, receive: false }));
  for (const [x, zz, sc] of [[60, -70, 0.7], [95, -30, 0.55], [130, -110, 0.6]] as number[][]) { const s2 = group([mesh(prism("farhull", [[0, -9], [2.4, -4], [2.6, 5], [0, 7], [-2.6, 5], [-2.4, -4]], -1, 1.4), "#2b2a33")]); for (const mz of [-4, 1]) s2.add(rod([0, 1, mz], [0, 14, mz], 0.2, "#8a6a3e"), rod([-3, 8, mz], [3, 8, mz], 0.12, "#f3ead2")); s2.position.set(x, -0.5, zz); s2.scale.setScalar(sc * 1.8); s2.rotation.y = x; root.add(s2); }
  if (!N) for (const [x, y, zz, s3] of [[-120, 120, -420, 30], [90, 150, -480, 40], [10, 190, -520, 28]] as number[][]) { const c = cloud(s3); c.position.set(x, y, zz); root.add(c); }
  void coins; void ring; void C;
  return root;
};

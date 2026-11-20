// The great cabin of a pirate ship (Blackbeard's, in the Short about his fuses): a low room of dark planks under heavy beams, three
// stern windows with the sea behind them, a table with a lantern and a chart, a stool, a sea chest, and a mirror on the side wall.
// Built round its own origin: the floor at y = 0, the windows in the back wall at z = -d/2, the room open toward +z where the lens
// stands. The deck overhead lies on the walls and the beams hang under it; it casts no shadow, so that the daylight of the world still
// falls in from above. (Blackbeard v4: without it, the sky and a sail showed over the back wall wherever the lens looked a little up.)
// `cabinSea` puts it beside the two ships of flagSea, far enough off that neither ship shows through its windows.
import * as THREE from "three";
import { mesh, group, box, cyl, ball, sunRig, paint, type Sun } from "./kit";
import { C, table, stool, chest } from "./props";
import { flagSea } from "./ship";
import type { V3 } from "../stage/film";
import { lightShaft } from "./air";

export const CABIN = { w: 4.4, d: 3.4, h: 2.3, win: [-1.25, 0, 1.25], winW: 0.72, winH: 0.78, winY: 0.98,
  /** where the cabin stands in the world (its floor's middle) */ at: [42, 0.6, 0] as V3,
  /** in the cabin's own terms: the table's middle, the lantern's flame, the stool, the mirror's glass */
  table: [0.6, 0, -0.95] as V3, flame: [0.9, 0.96, -1.1] as V3, stool: [-0.45, 0, -0.12] as V3, mirror: [-2.08, 1.52, -0.45] as V3 };
/** a point given in the cabin's own terms, in the world */
export const inCabin = (p: V3): V3 => [CABIN.at[0] + p[0], CABIN.at[1] + p[1], CABIN.at[2] + p[2]];

/** the cabin; `rich` = its wood with grain and shifting colour, and the floor, the table and the chest polished so that they catch
 *  the light (the night cabin, Jesper 19 Nov: "Trä med struktur och färgskiftningar i stället för slät brun yta, och blanka ytor som
 *  speglar ljuset"). Without it the cabin is as the Blackbeard Short has it */
/** `door` = a doorway in the right-hand wall (+x), its middle this far along z: an opening 0.82 m wide and 1.92 m high in a frame, a dark
 *  passage beyond it; the leaf itself is the shot's (cabinDoor), so that it can swing (the shot library's "open a door") */
export const DOOR = { w: 0.82, h: 1.92 };
export const cabin = (o: { rich?: boolean; door?: number } = {}) => {
  const { w, d, h, win, winW, winH, winY } = CABIN, g = new THREE.Group(), wood = "#6a4428", woodD = "#4a2e1c", t = 0.12, z0 = -d / 2;
  // the floor of broad planks
  const floor = mesh(box(w, 0.1, d), "#8a5a36", { at: [0, -0.05, 0] }); floor.userData.gloss = true; g.add(floor);
  for (let x = -w / 2 + 0.24; x < w / 2; x += 0.24) g.add(mesh(box(0.014, 0.004, d), "#6a4428", { at: [x, 0.002, 0], line: 0, shadow: false }));
  // the back wall, built of pieces round the three stern windows, each with its frame and a cross of bars
  g.add(mesh(box(w, winY, t), wood, { at: [0, winY / 2, z0] }), mesh(box(w, h - winY - winH, t), wood, { at: [0, winY + winH + (h - winY - winH) / 2, z0] }));
  const edges = [-w / 2, ...win.flatMap((x) => [x - winW / 2, x + winW / 2]), w / 2];
  for (let i = 0; i < edges.length; i += 2) if (edges[i + 1] - edges[i] > 0.01) g.add(mesh(box(edges[i + 1] - edges[i], winH, t), wood, { at: [(edges[i] + edges[i + 1]) / 2, winY + winH / 2, z0] }));
  for (const x of win) {
    for (const s of [-1, 1]) g.add(mesh(box(0.06, winH + 0.1, t + 0.04), woodD, { at: [x + (s * winW) / 2, winY + winH / 2, z0], line: 0.5 }));
    for (const y of [winY - 0.03, winY + winH + 0.03]) g.add(mesh(box(winW + 0.12, 0.06, t + 0.04), woodD, { at: [x, y, z0], line: 0.5 }));
    g.add(mesh(box(0.03, winH, 0.03), woodD, { at: [x, winY + winH / 2, z0], line: 0.3, shadow: false }), mesh(box(winW, 0.03, 0.03), woodD, { at: [x, winY + winH / 2, z0], line: 0.3, shadow: false }));
  }
  // a bench seat under the windows
  g.add(mesh(box(w - 0.3, 0.08, 0.42), woodD, { at: [0, 0.46, z0 + 0.27] }), mesh(box(w - 0.3, 0.42, 0.06), woodD, { at: [0, 0.21, z0 + 0.46], line: 0.5 }));
  // the side walls, panelled, and the beams overhead
  for (const s of [-1, 1]) { const dz = s > 0 ? o.door : undefined;
    if (dz === undefined) g.add(mesh(box(t, h, d), wood, { at: [(s * w) / 2, h / 2, 0] }));
    else { const z0 = dz - DOOR.w / 2, z1 = dz + DOOR.w / 2, x = (s * w) / 2;
      // the wall round the opening, its frame, and the dark passage beyond (a box closed on every side but the opening)
      g.add(mesh(box(t, h, z0 + d / 2), wood, { at: [x, h / 2, (z0 - d / 2) / 2] }), mesh(box(t, h, d / 2 - z1), wood, { at: [x, h / 2, (z1 + d / 2) / 2] }), mesh(box(t, h - DOOR.h, DOOR.w), wood, { at: [x, (h + DOOR.h) / 2, dz] }));
      for (const zz of [z0, z1]) g.add(mesh(box(t + 0.04, DOOR.h + 0.06, 0.07), woodD, { at: [x, (DOOR.h + 0.06) / 2, zz], line: 0.5 }));
      g.add(mesh(box(t + 0.04, 0.07, DOOR.w + 0.14), woodD, { at: [x, DOOR.h + 0.035, dz], line: 0.5 }));
      // the passage beyond: a hollow of dark planks (floor, ceiling, far wall and side walls), deep enough for the leaf to swing out into
      //  it (the shot library review: the door must open wide enough that the passage shows)
      { const px = x + t / 2, D = 1.4, Wd = DOOR.w + 0.9, Hh = DOOR.h + 0.25, dark = "#2a1a10";
        g.add(mesh(box(D, 0.06, Wd), dark, { at: [px + D / 2, -0.03, dz], line: 0, shadow: false }), mesh(box(D, 0.06, Wd), dark, { at: [px + D / 2, Hh, dz], line: 0, shadow: false }),
          mesh(box(0.06, Hh, Wd), "#1c120b", { at: [px + D, Hh / 2, dz], line: 0, shadow: false }), mesh(box(D, Hh, 0.06), dark, { at: [px + D / 2, Hh / 2, dz - Wd / 2], line: 0, shadow: false }), mesh(box(D, Hh, 0.06), dark, { at: [px + D / 2, Hh / 2, dz + Wd / 2], line: 0, shadow: false })); }
    }
    // (no panel strips beside a door: a figure stands there, and a thin strip behind him seemed to go through him)
    for (let z = -d / 2 + 0.55; z < d / 2; z += 0.8) { if (dz !== undefined && Math.abs(z - dz) < DOOR.w / 2 + 0.9) continue; g.add(mesh(box(0.02, h - 0.3, 0.05), woodD, { at: [s * (w / 2 - 0.07), h / 2, z], line: 0.3, shadow: false })); } }
  for (let z = -d / 2 + 0.35; z < d / 2; z += 0.78) g.add(mesh(box(w, 0.17, 0.2), woodD, { at: [0, h, z], line: 0.5 }));
  // the deck overhead, its underside level with the tops of the walls, a little wider and deeper than the room so that no seam shows
  g.add(mesh(box(w + t, 0.08, d + t), "#5a3a22", { at: [0, h + 0.04, -t / 2], line: 0.4, shadow: false }));
  for (let x = -w / 2 + 0.3; x < w / 2; x += 0.3) g.add(mesh(box(0.012, 0.004, d), woodD, { at: [x, h - 0.002, 0], line: 0, shadow: false, receive: false }));
  // the mirror on the left wall, its glass toward +x
  g.add(group([mesh(box(0.06, 0.66, 0.5), C.gold, { line: 0.6 }), mesh(box(0.066, 0.56, 0.4), "#cfe3ee", { line: 0.3, shadow: false }), mesh(box(0.068, 0.5, 0.06), "#eef6fa", { at: [0, 0.04, -0.08], rot: [0.5, 0, 0], line: 0, shadow: false })], [CABIN.mirror[0] + 0.02, CABIN.mirror[1], CABIN.mirror[2]]));
  // the table with a chart, a bottle and the lantern
  const tb = table(1.3, 0.8, 0.76); tb.position.set(...CABIN.table); tb.userData.gloss = true; g.add(tb);
  g.add(mesh(box(0.6, 0.006, 0.42), "#efe2bc", { at: [CABIN.table[0] - 0.2, 0.765, CABIN.table[2] + 0.05], rot: [0, 0.2, 0], line: 0.4, shadow: false }));
  // (named: seen past a head it shows as a thin green sliver standing up behind the chin, the shot library's 08; a shot whose lens puts it
  //  behind a head leaves it out, Shot.hide "table bottle")
  const bottle = mesh(cyl(0.035, 0.045, 0.22, 10), "#3f6a3a", { at: [CABIN.table[0] - 0.45, 0.87, CABIN.table[2] - 0.15], line: 0.5 }); bottle.name = "table bottle"; g.add(bottle); g.userData.named = [bottle];
  const [fx, fy, fz] = CABIN.flame;
  g.add(mesh(box(0.16, 0.02, 0.16), "#2b2a33", { at: [fx, 0.77, fz], line: 0.5 }), mesh(box(0.14, 0.2, 0.14), "#ffe7a8", { at: [fx, 0.88, fz], line: 0.6, shadow: false }), mesh(box(0.17, 0.03, 0.17), "#2b2a33", { at: [fx, 0.99, fz], line: 0.5 }),
    mesh(cyl(0.012, 0.012, 0.05, 8), "#fbf3df", { at: [fx, fy - 0.08, fz], line: 0, shadow: false }), mesh(ball(0.02, 8), "#ffb040", { at: [fx, fy - 0.04, fz], line: 0, shadow: false }));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(mesh(box(0.012, 0.2, 0.012), "#2b2a33", { at: [fx + sx * 0.07, 0.88, fz + sz * 0.07], line: 0, shadow: false }));
  const st = stool(); st.position.set(...CABIN.stool); g.add(st);
  const ch = chest(false, false, 0.7, 0.42, 0.44); ch.position.set(1.65, 0, -1.15); ch.rotation.y = -0.35; ch.userData.gloss = true; g.add(ch);
  if (o.rich) richWood(g);
  return g;
};

/** planks with grain: a pale picture of boards (0.24 m wide, a metre long per repeat) with streaks of grain, knots and each board a
 *  little lighter or darker, multiplied with the thing's own colour, so that the wood keeps its colour and gains its structure */
const grain = () => paint("woodgrain", 512, 512, (g, r) => {
  const bw = 512 / 4.2; for (let i = 0; i < 5; i++) { const x0 = i * bw, v = 0.8 + r() * 0.2; g.fillStyle = `rgb(${Math.round(255 * v)},${Math.round(247 * v)},${Math.round(236 * v)})`; g.fillRect(x0, 0, bw, 512);
    for (let k = 0; k < 26; k++) { const x = x0 + r() * bw, a = 0.05 + r() * 0.12; g.strokeStyle = `rgba(70,40,20,${a})`; g.lineWidth = 0.8 + r() * 2.2; g.beginPath(); g.moveTo(x, 0);
      for (let y = 0; y <= 512; y += 32) g.lineTo(x + Math.sin(y / (40 + r() * 30) + k) * 3, y); g.stroke(); }
    if (r() < 0.7) { const kx = x0 + bw * (0.3 + r() * 0.4), ky = r() * 512, q = g.createRadialGradient(kx, ky, 1, kx, ky, 12); q.addColorStop(0, "rgba(60,30,14,0.55)"); q.addColorStop(1, "rgba(60,30,14,0)"); g.fillStyle = q; g.fillRect(kx - 14, ky - 14, 28, 28); }
    g.fillStyle = "rgba(40,22,10,0.55)"; g.fillRect(x0, 0, 2.5, 512); } });
/** every wooden thing of the cabin given the grain (scaled to its size), and the polished ones (userData.gloss: the floor, the table,
 *  the chest) a shine that shows the lamp and the moon in them */
const richWood = (root: THREE.Object3D) => {
  const base = grain(), maps = new Map<string, THREE.Texture>(), mapFor = (a: number, b: number, turn: boolean) => { const k = `${a.toFixed(1)}:${b.toFixed(1)}:${turn}`; let m = maps.get(k);
    if (!m) { m = base.clone(); m.wrapS = m.wrapT = THREE.RepeatWrapping; m.repeat.set(Math.max(0.3, a), Math.max(0.3, b)); if (turn) m.rotation = Math.PI / 2; m.needsUpdate = true; maps.set(k, m); } return m; };
  const glossy = new Set<THREE.Object3D>(); root.traverse((x) => { if (x.userData.gloss) x.traverse((y) => glossy.add(y)); });
  root.traverse((x) => { const m = x as THREE.Mesh; if (!m.isMesh || !(m.material instanceof THREE.MeshToonMaterial)) return; const mt = m.material, c = mt.color, hsl = { h: 0, s: 0, l: 0 }; c.getHSL(hsl);
    // wood: brown (orange hues, not grey, not bright): the lantern's glass, the chart, the brass and the bottle stay as they are
    if (hsl.h < 0.03 || hsl.h > 0.12 || hsl.s < 0.2 || hsl.l > 0.45) return;
    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); const z = m.geometry.boundingBox!.getSize(new THREE.Vector3()), dims = [z.x, z.y, z.z].sort((p, q) => q - p);
    const map = mapFor(dims[1], dims[0], z.y > z.x && z.y > z.z);
    m.material = glossy.has(m) ? new THREE.MeshPhongMaterial({ color: c.clone(), map, shininess: 70, specular: new THREE.Color("#8a6a48") }) : new THREE.MeshToonMaterial({ color: c.clone(), map, gradientMap: mt.gradientMap }); });
};
/** The cabin at night (Jesper 19 Nov, with the painted cabin as the model to match): the rich cabin, a lantern hung from a beam that is
 *  a real light (warm, throwing shadows on the walls, the floor and the figures), the moon behind the windows shining in blue in shafts
 *  you can see, and the night sea and sky beyond the windows (a painted picture there when one is given: Jesper allows painted sky and
 *  sea outside windows). `light` = the world's weak sky light (the sun rig every world has). The lantern's place, the moon's and the
 *  shafts are in CABIN_NIGHT for the shot that adds the dust, the glows and the figures' light */
//   (the lantern hangs from the beam nearest the lens, above the heads of who stands before the table, so that its warm light falls on
//   their faces: the reference Shorts' one motivated light on the people who matter; behind them it only lit their backs)
export const CABIN_NIGHT = { hang: [0.24, 2.02, 0.99] as V3, moon: [-1.5, 3.6, -3.4] as V3, moonAim: [0.6, 0, -0.6] as V3 };
//   (and to the left of the stern, so that the shafts slant to the right: straight in, seen from the lens at the cabin's front, they fell
//   just behind the two who stand before the table; slanted, the middle one crosses the gap between them and the outer ones show at the sides)
//   (the moon stands high over the stern, so that its shafts fall steeply and reach the floor at the table's front edge, behind whoever
//   stands before it: lower, they slanted over the figures and laid a blue haze on them; higher, the table hid them)
export const cabinNight = (light: Sun, o: { sea?: TexImageSource; door?: number } = {}) => {
  const root = new THREE.Group(), c = cabin({ rich: true, door: o.door }); c.position.set(...CABIN.at); root.add(c); root.userData.named = [...((c.userData.named as THREE.Object3D[]) ?? [])];
  const W = (p: V3) => inCabin(p) as V3, y = CABIN.at[1], zb = CABIN.at[2] - CABIN.d / 2 - 2.6;
  // beyond the windows: the painted night sea (or a plain night blue without a picture)
  const sea = new THREE.MeshBasicMaterial({ color: o.sea ? "#ffffff" : "#16305e", toneMapped: false });
  if (o.sea) { const t = new THREE.Texture(o.sea); t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; sea.map = t; }
  const back = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 4.8), sea); back.position.set(CABIN.at[0] + 0.2, y + 1.15, zb); back.name = "night sea"; root.add(back);
  // the lantern on its rope from the beam above: a dark iron frame round warm glass, a flame in it
  const [hx, hy, hz] = CABIN_NIGHT.hang, L = new THREE.Group(), K = new THREE.Group(); L.position.set(...W([hx, 0, hz])); L.position.y = y + hy; L.name = "hanging lantern"; K.scale.setScalar(0.72); L.add(K);
  // (its cap, a cone of iron, and the ring it hangs by: so that it reads as a lantern, not as a little window)
  K.add(mesh(cyl(0.02, 0.13, 0.08, 4), "#2b2a33", { at: [0, 0.185, 0], rot: [0, Math.PI / 4, 0], line: 0.5, shadow: false }), mesh(cyl(0.035, 0.035, 0.012, 10), "#2b2a33", { at: [0, 0.24, 0], rot: [Math.PI / 2, 0, 0], line: 0, shadow: false }));
  L.add(mesh(cyl(0.006, 0.006, CABIN.h - hy - 0.16, 6), "#2a2018", { at: [0, (CABIN.h - hy) / 2 + 0.09, 0], line: 0.3, shadow: false }));
  K.add(mesh(box(0.2, 0.025, 0.2), "#2b2a33", { at: [0, 0.13, 0], line: 0.5, shadow: false }), mesh(box(0.22, 0.03, 0.22), "#2b2a33", { at: [0, -0.13, 0], line: 0.5, shadow: false }));
  const glass = new THREE.Mesh(box(0.15, 0.22, 0.15), new THREE.MeshBasicMaterial({ color: "#ffc45e", transparent: true, opacity: 0.82, toneMapped: false })); glass.castShadow = false; K.add(glass);
  K.add(mesh(box(0.014, 0.22, 0.16), "#2b2a33", { at: [0, 0, 0], line: 0, shadow: false }), mesh(box(0.16, 0.014, 0.16), "#2b2a33", { at: [0, 0.03, 0], line: 0, shadow: false }));
  K.add(new THREE.Mesh(cyl(0.012, 0.012, 0.06, 8), new THREE.MeshBasicMaterial({ color: "#fff1d0", toneMapped: false })));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) K.add(mesh(box(0.014, 0.26, 0.014), "#2b2a33", { at: [sx * 0.09, 0, sz * 0.09], line: 0, shadow: false }));
  const fl = new THREE.Mesh(ball(0.026, 10), new THREE.MeshBasicMaterial({ color: "#ffe2a0", toneMapped: false })); fl.position.y = 0.045; fl.scale.set(1, 1.6, 1); K.add(fl); root.add(L);
  // its light: warm, falling off across the room, throwing shadows
  const lamp = new THREE.PointLight("#ffa354", 7, 8, 1.15); lamp.position.copy(L.position); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -0.002; lamp.shadow.radius = 4; root.add(lamp);
  // the moon: a cold light from beyond the windows, falling in through them onto the floor (the window bars cast their shadows)
  const moon = new THREE.SpotLight("#9bb8ff", 45, 12, 0.62, 0.7, 1.2); moon.position.set(...W(CABIN_NIGHT.moon)); moon.position.y = y + CABIN_NIGHT.moon[1];
  moon.target.position.set(...W(CABIN_NIGHT.moonAim)); moon.target.position.y = y; moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); moon.shadow.bias = -0.0015; root.add(moon, moon.target);
  // (named, so that a shot whose lens cannot see the windows may leave it out: Shot.hide "moon")
  moon.name = "moon"; root.userData.named = [...((root.userData.named as THREE.Object3D[]) ?? []), moon];
  // the shafts you can see: from each window down to the floor along the moon's way, and a soft warm cone under the lantern
  const mp = new THREE.Vector3(...W(CABIN_NIGHT.moon)); mp.y = y + CABIN_NIGHT.moon[1];
  // (one named group: a shot whose lens cannot see the windows may leave them out, Shot.hide "moon shafts": seen across the room they were
  //  streaks of light from nowhere, the shot library review of round 2)
  const shafts = new THREE.Group(); shafts.name = "moon shafts"; root.add(shafts); root.userData.named = [...((root.userData.named as THREE.Object3D[]) ?? []), shafts];
  for (const x of CABIN.win) { const wc = new THREE.Vector3(...W([x, 0, -CABIN.d / 2 + 0.06])); wc.y = y + CABIN.winY + CABIN.winH / 2; const dir = wc.clone().sub(mp).normalize(), k = (wc.y - y) / -dir.y, end = wc.clone().addScaledVector(dir, k);
    shafts.add(lightShaft(wc.toArray() as V3, end.toArray() as V3, 0.36, 0.9, "#86a4ee", 1.1)); }
  const rig = sunRig(light, inCabin([0, 0, 0])); root.add(rig); root.userData.rig = rig;
  return root;
};
/** flagSea with the cabin beside it */
export const cabinSea = () => { const root = flagSea(), c = cabin(); c.position.set(...CABIN.at); root.add(c); root.userData.named = [...((root.userData.named as THREE.Object3D[]) ?? []), ...((c.userData.named as THREE.Object3D[]) ?? [])]; return root; };

/** the door's leaf for the doorway in the right-hand wall (cabin `door`): planks in a frame with an iron ring handle, hinged on its front
 *  edge (the +z side) and swung `open` degrees into the room. Returned with where its handle is now (in the world), for the hand */
export const cabinDoor = (doorZ: number, open: number, /** hinged on the back edge (-z) instead of the front: it opens toward the room's open front */ back = false) => { const g = new THREE.Group(), th = 0.05, { w, h } = { w: DOOR.w - 0.07 - th / 2 - 0.01, h: DOOR.h - 0.03 };
  // (the leaf between the jambs' inner faces, and its hinge a half thickness in from the jamb so that it swings clear of it: the leaf was
  //  as wide as the opening and lay 1.5 cm in both jambs, shut and swinging; bodyCheck's thing test, the shot library's 07)
  const leaf = new THREE.Group(); leaf.add(mesh(box(th, h, w), "#5a3a22", { at: [0, h / 2, -w / 2], line: 0.6 }));
  for (const k of [0.25, 0.5, 0.75]) leaf.add(mesh(box(th + 0.006, h - 0.1, 0.012), "#3e2716", { at: [0, h / 2, -w * k], line: 0, shadow: false }));
  for (const yy of [0.35, h - 0.35]) leaf.add(mesh(box(th + 0.01, 0.06, w - 0.06), "#3e2716", { at: [0, yy, -w / 2], line: 0.3, shadow: false }));
  const HX = -th / 2 - 0.035, HY = 1.0, HZ = -w + 0.09;
  leaf.add(mesh(box(0.05, 0.05, 0.012), "#2b2a33", { at: [HX + 0.01, HY, HZ], line: 0.3, shadow: false }));
  leaf.name = "door"; g.add(leaf);
  const hx = CABIN.w / 2 - 0.06 - th / 2, hz = back ? doorZ - DOOR.w / 2 + 0.035 + th / 2 + 0.005 : doorZ + DOOR.w / 2 - 0.035 - th / 2 - 0.005;
  // (hinged at the back, the leaf is the same one turned half round: it reaches toward +z from its hinge and swings into the room the other way)
  const turn = back ? Math.PI : 0; g.position.set(...inCabin([hx, 0, hz])); g.rotation.y = turn + (back ? -1 : 1) * (open * Math.PI) / 180;
  if (back) leaf.scale.x = -1;
  const a = g.rotation.y, hx2 = back ? -HX : HX, handle: V3 = [g.position.x + hx2 * Math.cos(a) + HZ * Math.sin(a), CABIN.at[1] + HY, g.position.z - hx2 * Math.sin(a) + HZ * Math.cos(a)];
  return { g, handle };
};

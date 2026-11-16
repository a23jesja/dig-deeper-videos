// The Salon Carre set: red wall with dado and gold rail, parquet, a doorway to a sunlit room, the bare spot with
// four iron hooks and its brass plate, dressed with CC0 models from Poly Haven (public/three3d/polyhaven, see the
// LICENSE.txt there): gilt frames, a bench, a marble bust on a tall table, a console with a vase, a potted plant,
// a chandelier. Paintings in the frames, the signs and the surfaces are canvas textures (paint.ts).
import * as THREE from "three";
import { cardTexture, dadoMap, paintingTexture, parquetMap, patchTexture, plateTexture, salonSignTexture, wallMap } from "./paint";

export const MODEL_IDS = [
  "fancy_picture_frame_01", "fancy_picture_frame_02", "hanging_picture_frame_01", "hanging_picture_frame_02", "hanging_picture_frame_03",
  "marble_bust_01", "painted_wooden_bench", "potted_plant_02", "Chandelier_01", "antique_ceramic_vase_01", "ClassicConsole_01", "side_table_tall_01",
] as const;
export type Models = Record<string, THREE.Object3D>;

export const SPOT = { x: 0, y: 1.8, w: 0.64, h: 0.88 };          // where the painting hung
export const HOOKS: [number, number][] = [[-0.2, 2.06], [0.2, 2.06], [-0.2, 1.56], [0.2, 1.56]];
export const PLATE = { x: 0, y: 1.17, w: 0.92, h: 0.305 };
const DOOR = { x0: 3.3, x1: 4.7, h: 2.75 };
const WALL_H = 5.2, WALL_T = 0.4;

type Anchor = "bottom" | "center" | "top" | "back";
/** clone a model, put its anchor point at the origin of a wrapper group, enable shadows */
const place = (src: THREE.Object3D, o: { p: [number, number, number]; s?: number; ry?: number; rx?: number; anchor?: Anchor }) => {
  const inner = src.clone(true), wrap = new THREE.Group();
  inner.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(inner), c = bb.getCenter(new THREE.Vector3());
  const a = o.anchor ?? "bottom";
  inner.position.sub(new THREE.Vector3(c.x, a === "bottom" ? bb.min.y : a === "top" ? bb.max.y : c.y, a === "back" ? bb.min.z : c.z));
  inner.traverse((m) => { if ((m as THREE.Mesh).isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  wrap.add(inner);
  wrap.position.set(...o.p);
  wrap.scale.setScalar(o.s ?? 1);
  wrap.rotation.set(o.rx ?? 0, o.ry ?? 0, 0);
  return { wrap, inner, size: bb.getSize(new THREE.Vector3()) };
};

export class Stage {
  root = new THREE.Group();
  hookLight: THREE.SpotLight;
  key: THREE.DirectionalLight;

  /** opts.wall: base colour of the wall covering; opts.paints: painted pictures (textures) to hang in the frames */
  constructor(models: Models, opts: { wall?: string; paints?: THREE.Texture[] } = {}) {
    const pictureFor = (i: number, aspect: number) => {
      const ps = opts.paints!;
      const order = ps.map((t, k) => ({ k, d: Math.abs(Math.log(aspect / (t.image.width / t.image.height))) })).sort((a, b) => a.d - b.d);
      const src = ps[order[i % 2].k]; // the two closest shapes take turns, so neighbours differ
      const t = src.clone(), pa = src.image.width / src.image.height;
      if (pa > aspect) { t.repeat.set(aspect / pa, 1); t.offset.set((1 - aspect / pa) / 2, 0); }
      else { t.repeat.set(1, pa / aspect); t.offset.set(0, (1 - pa / aspect) / 2); }
      t.needsUpdate = true;
      return t;
    };
    const R = this.root;
    const add = <T extends THREE.Object3D>(o: T, parent: THREE.Object3D = R) => { parent.add(o); return o; };
    const box = (w: number, h: number, d: number, m: THREE.Material, p: [number, number, number], cast = true) => {
      const o: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
      o.position.set(...p); o.castShadow = cast; o.receiveShadow = true;
      return add(o);
    };
    const std = (color: number, rough = 0.9, metal = 0, map?: THREE.Texture) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, map });
    const gilt = std(0xd9a93c, 0.38, 0.85), iron = std(0x2a2a2e, 0.55, 0.6), brass = std(0xd8b04a, 0.3, 0.9), stone = std(0xe9dfc8, 0.9);

    // ---- floor ----
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(26, 20), std(0xffffff, 0.5, 0, parquetMap(13, 10)));
    floor.rotation.x = -Math.PI / 2; floor.position.set(-1, 0, 1); floor.receiveShadow = true;
    add(floor);

    // ---- the wall, with the doorway cut out (three boxes) ----
    const wallSeg = (x0: number, x1: number, y0: number, y1: number) => {
      const w = x1 - x0, h = y1 - y0;
      const m = std(0xffffff, 0.95, 0, wallMap(w / 1.1, h / 1.1, opts.wall));
      return box(w, h, WALL_T, m, [(x0 + x1) / 2, (y0 + y1) / 2, -WALL_T / 2]);
    };
    wallSeg(-11, DOOR.x0, 0, WALL_H); wallSeg(DOOR.x1, 8, 0, WALL_H); wallSeg(DOOR.x0, DOOR.x1, DOOR.h, WALL_H);
    box(0.4, WALL_H, 12, std(opts.wall ? new THREE.Color(opts.wall).getHex() : 0x8a2026, 0.95), [8.0, WALL_H / 2, 5.8]); // side wall on the right
    // dado, gold rail, skirting, cornice
    for (const [x0, x1] of [[-11, DOOR.x0 - 0.16], [DOOR.x1 + 0.16, 7.8]]) {
      const w = x1 - x0, cx = (x0 + x1) / 2;
      box(w, 0.92, 0.05, std(0xffffff, 0.6, 0, dadoMap(w / 0.95)), [cx, 0.46, 0.025]);
      box(w, 0.055, 0.085, gilt, [cx, 0.95, 0.042]);
      box(w, 0.14, 0.075, std(0x3a2212, 0.6), [cx, 0.07, 0.038]);
    }
    box(19, 0.16, 0.12, gilt, [-1.5, 4.55, 0.06]);
    // door casing in pale stone, gold keystone
    const cw = 0.18;
    box(cw, DOOR.h + cw, WALL_T + 0.12, stone, [DOOR.x0 - cw / 2, (DOOR.h + cw) / 2, -WALL_T / 2 + 0.03]);
    box(cw, DOOR.h + cw, WALL_T + 0.12, stone, [DOOR.x1 + cw / 2, (DOOR.h + cw) / 2, -WALL_T / 2 + 0.03]);
    box(DOOR.x1 - DOOR.x0 + 2 * cw, cw, WALL_T + 0.12, stone, [(DOOR.x0 + DOOR.x1) / 2, DOOR.h + cw / 2, -WALL_T / 2 + 0.03]);
    box(0.22, 0.26, 0.1, gilt, [(DOOR.x0 + DOOR.x1) / 2, DOOR.h + 0.11, 0.06]);

    // ---- the sunlit room behind the doorway ----
    const cream = new THREE.MeshStandardMaterial({ color: 0xf6ead0, roughness: 0.95, emissive: 0xffe2a8, emissiveIntensity: 0.22 });
    box(10, WALL_H, 0.3, cream, [4, WALL_H / 2, -6.2], false);
    box(0.3, WALL_H, 6, cream, [1.2, WALL_H / 2, -3.3], false);
    box(0.3, WALL_H, 6, cream, [6.9, WALL_H / 2, -3.3], false);
    box(10, 0.9, 0.06, std(0xcdb48a, 0.8), [4, 0.45, -6.02], false);

    // ---- the bare spot: paler patch, four iron hooks, brass plate ----
    const patch = new THREE.Mesh(new THREE.PlaneGeometry(SPOT.w, SPOT.h), new THREE.MeshStandardMaterial({ map: patchTexture(), transparent: true, roughness: 0.95, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    patch.position.set(SPOT.x, SPOT.y, 0.004); patch.receiveShadow = true;
    add(patch);
    for (const [hx, hy] of HOOKS) {
      const h = add(new THREE.Group());
      h.position.set(hx, hy, 0); h.scale.setScalar(1.35);
      const part = (g: THREE.BufferGeometry, p: [number, number, number], rx = 0) => {
        const m = new THREE.Mesh(g, iron); m.position.set(...p); m.rotation.x = rx; m.castShadow = true; m.receiveShadow = true; h.add(m); return m;
      };
      part(new THREE.CylinderGeometry(0.026, 0.03, 0.008, 20), [0, 0, 0.004], Math.PI / 2);          // rose plate
      part(new THREE.CylinderGeometry(0.009, 0.011, 0.075, 12), [0, 0, 0.04], Math.PI / 2);          // peg out of the wall
      part(new THREE.SphereGeometry(0.0105, 12, 10), [0, 0, 0.0775]);
      part(new THREE.CylinderGeometry(0.008, 0.009, 0.04, 12), [0, 0.02, 0.0775]);                   // upturned tip
      part(new THREE.SphereGeometry(0.0095, 12, 10), [0, 0.042, 0.0775]);
    }
    const plate = box(PLATE.w, PLATE.h, 0.014, new THREE.MeshStandardMaterial({ map: plateTexture(), roughness: 0.42, metalness: 0.35 }), [PLATE.x, PLATE.y, 0.008]);
    plate.material = [brass, brass, brass, brass, plate.material as THREE.Material, brass];

    // ---- room sign over the doorway ----
    const sign = box(1.5, 0.35, 0.03, new THREE.MeshStandardMaterial({ map: salonSignTexture(), roughness: 0.6 }), [(DOOR.x0 + DOOR.x1) / 2, DOOR.h + 0.5, 0.02]);
    const dark = std(0x12302b, 0.6);
    sign.material = [dark, dark, dark, dark, sign.material as THREE.Material, dark];

    // ---- CC0 frames with painted canvases ----
    const frames: { id: string; x: number; y: number; s: number; kind: number; tilt?: number }[] = [
      { id: "fancy_picture_frame_02", x: -1.55, y: 1.92, s: 1.75, kind: 0 },
      { id: "fancy_picture_frame_01", x: 1.72, y: 1.95, s: 2.45, kind: 1 },
      { id: "hanging_picture_frame_01", x: -3.15, y: 2.0, s: 1.7, kind: 0 },
      { id: "fancy_picture_frame_01", x: -4.95, y: 1.95, s: 2.6, kind: 3 },
      { id: "hanging_picture_frame_02", x: -0.05, y: 3.42, s: 2.5, kind: 1, tilt: 0.07 },
      { id: "fancy_picture_frame_02", x: 1.95, y: 3.5, s: 1.6, kind: 0, tilt: 0.07 },
      { id: "hanging_picture_frame_03", x: -1.95, y: 3.45, s: 2.5, kind: 2, tilt: 0.07 },
      { id: "fancy_picture_frame_01", x: -3.75, y: 3.55, s: 2.3, kind: 2, tilt: 0.07 },
      { id: "hanging_picture_frame_03", x: -5.5, y: 3.5, s: 2.6, kind: 0, tilt: 0.07 },
      { id: "hanging_picture_frame_01", x: 5.75, y: 2.1, s: 1.8, kind: 0 },
      { id: "hanging_picture_frame_02", x: 6.0, y: 3.6, s: 2.2, kind: 3, tilt: 0.07 },
      { id: "fancy_picture_frame_02", x: -6.6, y: 1.95, s: 1.7, kind: 0 },
    ];
    frames.forEach((fr, i) => {
      const { wrap, inner } = place(models[fr.id], { p: [fr.x, fr.y, 0.012], s: fr.s, anchor: "back", rx: fr.tilt ?? 0 });
      if (fr.tilt) wrap.position.z += 0.05 * fr.s;
      wrap.updateMatrixWorld(true);
      const hide: THREE.Mesh[] = [];
      inner.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        const mat = m.material as THREE.MeshStandardMaterial, name = mat.name;
        if (/glass/.test(name)) hide.push(m);
        else if (/canvas|artwork/.test(name)) {
          hide.push(m);
          // a plane of our own at the canvas, so the picture does not depend on the model's UVs
          const bb = new THREE.Box3().setFromObject(m), size = bb.getSize(new THREE.Vector3()), c = bb.getCenter(new THREE.Vector3());
          wrap.worldToLocal(c);
          const w = size.x / fr.s, h = size.y / fr.s;
          const pic = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: opts.paints ? pictureFor(i, w / h) : paintingTexture(i + 3, fr.kind, w / h), roughness: 0.55 }));
          pic.position.set(c.x, c.y, c.z + 0.002); pic.receiveShadow = true;
          wrap.add(pic);
        } else if (/^hanging/.test(fr.id)) {
          // these frames are white wood: gild them to match the room
          const g = mat.clone(); g.color.set(0xc8962e); g.metalness = 0.8; g.roughness = 0.42; m.material = g;
        }
      });
      for (const m of hide) m.visible = false;
      add(wrap);
    });

    // ---- brass stanchions and a red rope in front of the wall ----
    const ropeZ = 0.62, posts = [-7.2, -5.6, -4.0, -2.4, -0.8, 0.8, 2.4];
    const velvet = std(0x7a1420, 0.95);
    for (const x of posts) {
      const cyl = (rt: number, rb: number, h: number, y: number) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 24), brass); m.position.set(x, y, ropeZ); m.castShadow = true; m.receiveShadow = true; add(m); };
      cyl(0.15, 0.17, 0.035, 0.0175); cyl(0.022, 0.022, 0.9, 0.48);
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.045, 20, 14), brass); ball.position.set(x, 0.96, ropeZ); ball.castShadow = true; add(ball);
    }
    for (let i = 0; i + 1 < posts.length; i++) {
      const a = posts[i], b = posts[i + 1], pts: THREE.Vector3[] = [];
      for (let k = 0; k <= 16; k++) { const t = k / 16; pts.push(new THREE.Vector3(a + (b - a) * t, 0.9 - 0.2 * 4 * t * (1 - t), ropeZ)); }
      const rope = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, 0.018, 10), velvet);
      rope.castShadow = true; rope.receiveShadow = true; add(rope);
    }
    // a little card on the post left of the bare spot
    const card = box(0.3, 0.176, 0.008, new THREE.MeshStandardMaterial({ map: cardTexture(), roughness: 0.5 }), [-0.8, 1.1, ropeZ + 0.03]);
    const cardEdge = std(0x1c2a4a, 0.6);
    card.material = [cardEdge, cardEdge, cardEdge, cardEdge, card.material as THREE.Material, cardEdge];
    card.rotation.x = -0.12;

    // ---- furniture and dressing (CC0 models) ----
    add(place(models.painted_wooden_bench, { p: [2.75, 0, 3.5], s: 1.2, ry: Math.PI }).wrap);
    add(place(models.side_table_tall_01, { p: [2.92, 0, 0.42], s: 1.25 }).wrap);
    add(place(models.marble_bust_01, { p: [2.92, 0.761 * 1.25, 0.42], s: 1.25, ry: 0.35 }).wrap);
    add(place(models.potted_plant_02, { p: [5.2, 0, 0.5], s: 1.5, ry: 1.0 }).wrap);
    add(place(models.potted_plant_02, { p: [-2.9, 0, 4.5], s: 1.7, ry: 2.4 }).wrap);
    add(place(models.ClassicConsole_01, { p: [5.6, 0, -5.6], s: 1.15 }).wrap);
    add(place(models.antique_ceramic_vase_01, { p: [5.6, 0.949 * 1.15, -5.6], s: 1.5 }).wrap);
    add(place(models.fancy_picture_frame_02, { p: [5.5, 2.35, -6.0], s: 1.9, anchor: "back" }).wrap);
    const chand = place(models.Chandelier_01, { p: [-2.7, 4.42, 2.4], s: 1.9, anchor: "top" });
    chand.inner.traverse((o) => { o.castShadow = false; });
    add(chand.wrap);
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.2, 8), iron); chain.position.set(-2.7, 5.02, 2.4); add(chain);

    // ---- lighting ----
    // key: daylight from the glass roof, high and from the front left, soft-edged shadows
    const key = this.key = new THREE.DirectionalLight(0xfff0d8, 2.5);
    key.position.set(-4.2, 10.5, 6.5); key.target.position.set(0, 0.6, 0.6);
    key.castShadow = true; key.shadow.mapSize.set(4096, 4096);
    const sc = key.shadow.camera; sc.left = -10; sc.right = 10; sc.top = 8; sc.bottom = -8; sc.near = 1; sc.far = 32;
    key.shadow.bias = -0.0004; key.shadow.normalBias = 0.025; key.shadow.radius = 3;
    add(key); add(key.target);
    // fill: cool sky bounce from above, warm bounce off the floor; a soft frontal fill without shadows
    add(new THREE.HemisphereLight(0xd6defa, 0x7a4a2a, 1.05));
    const fill = new THREE.DirectionalLight(0xdfe6ff, 0.45); fill.position.set(3, 3, 9); fill.target.position.set(0, 1.4, 0); add(fill); add(fill.target);
    // accent on the bare spot (as if from the roof light): makes the patch read and gives each hook its own shadow
    const hl = this.hookLight = new THREE.SpotLight(0xfff4e0, 26, 9, 0.2, 0.75, 1.6);
    hl.position.set(-1.0, 4.3, 2.3); hl.target.position.set(0, 1.72, 0);
    hl.castShadow = true; hl.shadow.mapSize.set(2048, 2048); hl.shadow.bias = -0.0003; hl.shadow.camera.near = 1.5; hl.shadow.camera.far = 7; hl.shadow.radius = 2.5;
    add(hl); add(hl.target);
    // the sun through the doorway: a warm patch on the parquet, cut to shape by the door opening
    const sun = new THREE.SpotLight(0xffd9a0, 620, 16, 0.42, 0.25, 1.7);
    sun.position.set(4.0, 3.5, -5.2); sun.target.position.set(4.0, 0, 3.2);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.002; sun.shadow.normalBias = 0.06; sun.shadow.camera.near = 1; sun.shadow.camera.far = 14; sun.shadow.radius = 4;
    add(sun); add(sun.target);
    // light for the far room itself (points away from the salon, so it cannot leak through the wall)
    const far = new THREE.SpotLight(0xfff0cc, 75, 12, 1.0, 0.6, 1.5);
    far.position.set(4.0, 3.4, -0.9); far.target.position.set(4.0, 0.9, -6.2);
    add(far); add(far.target);
  }
}

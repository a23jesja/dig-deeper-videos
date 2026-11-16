// Environment kit, parts 1 and 2: trees with thousands of separate leaves that stir in the wind, and grass made of
// separate blades whose tips catch the light. Both are instanced (one draw call each) and move in the vertex shader.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Part, rng } from "./util";

const windPatch = (mat: THREE.Material, uTime: { value: number }, body: string) => {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = uTime;
    sh.vertexShader = "uniform float uTime;\n" + sh.vertexShader
      .replace("#include <begin_vertex>", `#include <begin_vertex>\n vec3 ip = instanceMatrix[3].xyz; float ph = ip.x * 1.7 + ip.y * 2.3 + ip.z * 1.1; vec3 envSway = vec3(0.0);\n ${body}`)
      .replace("#include <project_vertex>", THREE.ShaderChunk.project_vertex.replace("mvPosition = instanceMatrix * mvPosition;", "mvPosition = instanceMatrix * mvPosition; mvPosition.xyz += envSway;"));
  };
  return mat;
};
export type TreeOpts = { height?: number; leaves?: number; spread?: number; colors?: [string, string, string]; bark?: string; wind?: number };
/** a broadleaf tree: trunk and branches grown from a seed, and `leaves` separate leaves (default 7000) */
export const makeTree = (seed = 1, o: TreeOpts = {}): Part => {
  const r = rng(seed), H = o.height ?? 7, N = o.leaves ?? 7000, wind = o.wind ?? 1, uTime = { value: 0 };
  const geos: THREE.BufferGeometry[] = [], tips: { p: THREE.Vector3; rad: number }[] = [], up = new THREE.Vector3(0, 1, 0);
  const grow = (a: THREE.Vector3, dir: THREE.Vector3, len: number, rad: number, depth: number) => {
    const b = a.clone().addScaledVector(dir, len);
    const g = new THREE.CylinderGeometry(rad * 0.68, rad, len, 7, 1).translate(0, len / 2, 0);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up, dir)); g.translate(a.x, a.y, a.z); geos.push(g);
    if (depth <= 2) tips.push({ p: b, rad: 0.5 + len * 0.55 });
    if (depth === 0) return;
    const n = 2 + (r() > 0.45 ? 1 : 0);
    for (let k = 0; k < n; k++) {
      const nd = dir.clone().add(new THREE.Vector3(r() - 0.5, r() * 0.35, r() - 0.5).multiplyScalar(1.5 * (o.spread ?? 1))).normalize(); nd.y = Math.abs(nd.y) * 0.8 + 0.2; nd.normalize();
      grow(b, nd, len * (0.66 + 0.14 * r()), rad * 0.62, depth - 1);
    }
  };
  grow(new THREE.Vector3(), new THREE.Vector3((r() - 0.5) * 0.12, 1, (r() - 0.5) * 0.12).normalize(), H * 0.34, H * 0.035, 4);
  const trunk = new THREE.Mesh(mergeGeometries(geos), new THREE.MeshStandardMaterial({ color: o.bark ?? "#6b4a33", roughness: 1 }));
  trunk.castShadow = true; trunk.receiveShadow = true;
  // leaves: a small folded card each, clustered round the twig ends, lighter towards the top and the outside
  const leaf = new THREE.PlaneGeometry(0.26, 0.15, 2, 1); const lp = leaf.attributes.position as THREE.BufferAttribute; for (let i = 0; i < lp.count; i++) lp.setZ(i, Math.abs(lp.getX(i)) * 0.35);
  leaf.computeVertexNormals();
  const mat = windPatch(new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.75, color: "#ffffff" }), uTime,
    `transformed.z += sin(uTime * 5.3 + ph) * 0.045 * ${wind.toFixed(2)} * (1.0 + position.x * 6.0);\n transformed.y += sin(uTime * 7.1 + ph * 1.3) * position.x * 0.22 * ${wind.toFixed(2)};\n float gust = sin(uTime * 1.25 + ip.x * 0.32 + ip.z * 0.24) * 0.5 + sin(uTime * 0.55 + ip.z * 0.15) * 0.5;\n envSway = vec3(gust * 0.05, 0.0, gust * 0.02) * ${wind.toFixed(2)} * clamp(ip.y / ${H.toFixed(1)}, 0.0, 1.0);`);
  const im = new THREE.InstancedMesh(leaf, mat, N); im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color();
  const [c0, c1, c2] = (o.colors ?? ["#2f6b2a", "#5c9a34", "#a6c94a"]).map((h) => new THREE.Color(h));
  let top = 0; for (const t of tips) top = Math.max(top, t.p.y);
  for (let i = 0; i < N; i++) {
    const t = tips[Math.floor(r() * tips.length)], th = r() * 6.283, ph = Math.acos(2 * r() - 1), rad = t.rad * Math.cbrt(r());
    p.set(t.p.x + rad * Math.sin(ph) * Math.cos(th), t.p.y + rad * Math.cos(ph) * 0.8, t.p.z + rad * Math.sin(ph) * Math.sin(th));
    e.set(r() * 1.2 - 0.6, r() * 6.283, r() * 1.2 - 0.6); q.setFromEuler(e); s.setScalar(0.7 + 0.8 * r());
    im.setMatrixAt(i, m4.compose(p, q, s));
    const lit = THREE.MathUtils.clamp((p.y - top * 0.45) / (top * 0.55) * 0.75 + rad / t.rad * 0.3 + (r() - 0.5) * 0.35, 0, 1);
    c.copy(lit < 0.5 ? c0 : c1).lerp(lit < 0.5 ? c1 : c2, lit < 0.5 ? lit * 2 : lit * 2 - 1); im.setColorAt(i, c);
  }
  im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
  const obj = new THREE.Group(); obj.add(trunk, im);
  return { obj, update: (t) => { uTime.value = t; } };
};
export type GrassOpts = { blades?: number; height?: number; colors?: [string, string]; wind?: number; mask?: (x: number, z: number) => boolean };
/** a patch of grass x0..x1 by z0..z1: separate blades (default 45 000), dark at the root, pale at the tip, bending in the wind */
export const makeGrass = (x0: number, x1: number, z0: number, z1: number, seed = 1, o: GrassOpts = {}): Part => {
  const r = rng(seed), N = o.blades ?? 45000, hgt = o.height ?? 0.42, wind = o.wind ?? 1, uTime = { value: 0 };
  const g = new THREE.PlaneGeometry(0.045, 1, 1, 4).translate(0, 0.5, 0); const pos = g.attributes.position as THREE.BufferAttribute, col = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) { const y = pos.getY(i); pos.setX(i, pos.getX(i) * (1 - y * 0.92)); pos.setZ(i, y * y * 0.22); const k = 0.32 + 0.95 * y * y; col.set([k, k, k], i * 3); }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
  const mat = windPatch(new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.6, vertexColors: true }), uTime,
    `float bend = position.y * position.y; float w = sin(uTime * 2.1 + ip.x * 0.9 + ip.z * 0.7) * 0.6 + sin(uTime * 3.7 + ph) * 0.25 + sin(uTime * 0.8 + ip.x * 0.2) * 0.5;\n transformed.x += w * 0.16 * bend * ${wind.toFixed(2)}; transformed.z += w * 0.07 * bend * ${wind.toFixed(2)};`);
  const im = new THREE.InstancedMesh(g, mat, N); im.receiveShadow = true; im.frustumCulled = false;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), p = new THREE.Vector3(), c = new THREE.Color();
  const [g0, g1] = (o.colors ?? ["#3f7a2c", "#9cc24a"]).map((h) => new THREE.Color(h));
  let n = 0;
  for (let i = 0; i < N * 3 && n < N; i++) {
    const x = x0 + (x1 - x0) * r(), z = z0 + (z1 - z0) * r(); if (o.mask && !o.mask(x, z)) continue;
    const clump = 0.6 + 0.8 * (0.5 + 0.5 * Math.sin(x * 1.7) * Math.sin(z * 1.3 + 1));
    p.set(x, 0, z); e.set((r() - 0.5) * 0.5, r() * 6.283, (r() - 0.5) * 0.5); q.setFromEuler(e); s.set(0.8 + 0.7 * r(), hgt * clump * (0.6 + 0.8 * r()), 1);
    im.setMatrixAt(n, m4.compose(p, q, s)); c.copy(g0).lerp(g1, r() * 0.8 + 0.1); im.setColorAt(n, c); n++;
  }
  im.count = n; im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
  return { obj: im, update: (t) => { uTime.value = t; } };
};

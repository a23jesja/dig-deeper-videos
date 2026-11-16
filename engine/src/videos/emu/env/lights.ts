// Environment kit, parts 7 and 8: lights that really light the scene, each with a glow round it (the glow colours go
// above 1 and feed the bloom), and one key light per scene that throws clear shadows.
//   lantern, bulbSign (a sign framed with bulbs that chase), litWindow, fire, rocket (a distress rocket that climbs,
//   bursts and lights everything under it), keyLight (the one shadow-casting sun or moon).
import * as THREE from "three";
import { Part, rng, glow, softTex, canvasTex, noInk } from "./util";
import { makeSparks } from "./particles";

/** the scene's one shadow-casting light. `dir` points FROM the scene TO the light. Returns the light (add it and its target). */
export const keyLight = (dir: THREE.Vector3, color: THREE.ColorRepresentation, intensity: number, o: { size?: number; center?: THREE.Vector3; map?: number; soft?: number } = {}) => {
  const l = new THREE.DirectionalLight(color, intensity), c = o.center ?? new THREE.Vector3(), size = o.size ?? 24;
  l.position.copy(c).addScaledVector(dir.clone().normalize(), 120); l.target.position.copy(c);
  l.castShadow = true; l.shadow.mapSize.set(o.map ?? 4096, o.map ?? 4096); l.shadow.radius = o.soft ?? 2.2;
  const sc = l.shadow.camera; sc.left = -size; sc.right = size; sc.top = size; sc.bottom = -size; sc.near = 10; sc.far = 300; sc.updateProjectionMatrix();
  l.shadow.bias = -0.0004; l.shadow.normalBias = 0.03;
  const g = new THREE.Group(); g.add(l, l.target);
  return { obj: g, light: l };
};
/** a lantern on a post or hung at `at`: warm point light, glass that glows, a halo; it flickers a little */
export const makeLantern = (at: THREE.Vector3, o: { color?: string; power?: number; post?: number; reach?: number; shadow?: boolean } = {}): Part & { light: THREE.PointLight } => {
  const col = o.color ?? "#ffb45e", P = o.power ?? 45, g = new THREE.Group();
  if (o.post) { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, o.post, 10).translate(0, -o.post / 2 - 0.16, 0), new THREE.MeshStandardMaterial({ color: "#22242c", roughness: 0.6, metalness: 0.4 })); post.castShadow = true; g.add(post); }
  const cage = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.3, 8), new THREE.MeshStandardMaterial({ color: "#1c1e26", roughness: 0.5, metalness: 0.5, wireframe: false, transparent: true, opacity: 0.35 }));
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.14, 8).translate(0, 0.22, 0), new THREE.MeshStandardMaterial({ color: "#1c1e26", roughness: 0.5, metalness: 0.5 }));
  const glass = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 10), new THREE.MeshBasicMaterial({ color: P > 0 ? new THREE.Color(col).multiplyScalar(5) : new THREE.Color("#d9d2bc"), fog: false })); glass.layers.set(3);
  const light = new THREE.PointLight(col, P, o.reach ?? 16, 2); light.castShadow = !!o.shadow; if (o.shadow) { light.shadow.mapSize.set(1024, 1024); light.shadow.bias = -0.002; }
  const halo = glow(col, 1.5, 1.6); halo.visible = P > 0;
  g.add(cage, cap, glass, light, halo); g.position.copy(at);
  return { obj: g, light, update: (t) => { const k = 1 + 0.06 * Math.sin(t * 13.1) + 0.04 * Math.sin(t * 31.7 + 1); light.intensity = P * k; halo.scale.setScalar(1.5 * k); } };
};
/** a sign with a row of bulbs round it: the bulbs chase, and the sign lights what is in front of it */
export const makeBulbSign = (at: THREE.Vector3, text: string, o: { w?: number; h?: number; color?: string; yaw?: number } = {}): Part => {
  const w = o.w ?? 3.2, h = o.h ?? 1.1, col = o.color ?? "#ffcf6a", g = new THREE.Group();
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: canvasTex("sign_" + text, 1024, Math.round(1024 * h / w), (c) => {
    const H = Math.round(1024 * h / w); c.fillStyle = "#7a1f1c"; c.fillRect(0, 0, 1024, H); c.strokeStyle = "#e9c46a"; c.lineWidth = 14; c.strokeRect(34, 34, 956, H - 68);
    c.fillStyle = "#fff1c4"; c.font = `900 ${Math.round(H * 0.5)}px 'Arial Black', Impact, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(text, 512, H / 2 + 6, 860);
  }), roughness: 0.7, emissive: "#ffffff", emissiveIntensity: 0.25 }));
  (face.material as THREE.MeshStandardMaterial).emissiveMap = (face.material as THREE.MeshStandardMaterial).map;
  const back = new THREE.Mesh(new THREE.BoxGeometry(w + 0.16, h + 0.16, 0.12).translate(0, 0, -0.07), new THREE.MeshStandardMaterial({ color: "#2a1c14", roughness: 0.8 })); back.castShadow = true;
  const pts: [number, number][] = []; const nx = Math.round(w / 0.22), ny = Math.round(h / 0.22);
  for (let i = 0; i <= nx; i++) { pts.push([-w / 2 + (i * w) / nx, h / 2 + 0.02]); } for (let i = 1; i <= ny; i++) pts.push([w / 2 + 0.02, h / 2 - (i * h) / ny]);
  for (let i = 1; i <= nx; i++) pts.push([w / 2 - (i * w) / nx, -h / 2 - 0.02]); for (let i = 1; i < ny; i++) pts.push([-w / 2 - 0.02, -h / 2 + (i * h) / ny]);
  const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 10, 8), new THREE.MeshBasicMaterial({ fog: false }), pts.length); bulbs.layers.set(3);
  const m4 = new THREE.Matrix4(), base = new THREE.Color(col);
  pts.forEach((p, i) => bulbs.setMatrixAt(i, m4.makeTranslation(p[0], p[1], 0.05)));
  const halo = new THREE.Group(); pts.forEach((p, i) => { if (i % 2 === 0) { const s = glow(col, 0.42, 0.9); s.position.set(p[0], p[1], 0.08); halo.add(s); } });
  const light = new THREE.PointLight(col, 26, 12, 2); light.position.set(0, 0, 1.2);
  g.add(back, face, bulbs, halo, light); g.position.copy(at); g.rotation.y = o.yaw ?? 0;
  const c = new THREE.Color();
  return { obj: g, update: (t) => { pts.forEach((_, i) => { const on = (i + Math.floor(t * 6)) % 3 !== 0; bulbs.setColorAt(i, c.copy(base).multiplyScalar(on ? 5.5 : 0.7)); }); if (bulbs.instanceColor) bulbs.instanceColor.needsUpdate = true; halo.children.forEach((s, k) => { (s as THREE.Sprite).material.opacity = (k * 2 + Math.floor(t * 6)) % 3 !== 0 ? 1 : 0.2; }); } };
};
/** a lit window in a wall facing +z at `at`: glowing panes, a frame, light spilling out onto the ground */
export const makeWindow = (at: THREE.Vector3, o: { w?: number; h?: number; color?: string; power?: number; yaw?: number } = {}): Part => {
  const w = o.w ?? 1.1, h = o.h ?? 1.4, col = o.color ?? "#ffcf80", g = new THREE.Group();
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(2.6), fog: false })); pane.layers.set(3);
  const bars = new THREE.Group(), fm = new THREE.MeshStandardMaterial({ color: "#3a2a1c", roughness: 0.8 });
  for (const [bw, bh, x, y] of [[w + 0.12, 0.07, 0, h / 2], [w + 0.12, 0.07, 0, -h / 2], [0.07, h, -w / 2, 0], [0.07, h, w / 2, 0], [0.045, h, 0, 0], [w, 0.045, 0, 0]]) bars.add(new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.07).translate(x, y, 0.03), fm));
  const light = new THREE.PointLight(col, o.power ?? 30, 11, 2); light.position.set(0, -0.1, 0.9);
  const halo = glow(col, Math.max(w, h) * 2.2, 0.55); halo.position.z = 0.1;
  g.add(pane, bars, light, halo); g.position.copy(at); g.rotation.y = o.yaw ?? 0;
  return { obj: g, update: () => {} };
};
const flameTex = () => canvasTex("envflame", 128, 256, (g) => { const gr = g.createRadialGradient(64, 190, 4, 64, 150, 120); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.25, "rgba(255,230,140,0.95)"); gr.addColorStop(0.6, "rgba(255,120,30,0.55)"); gr.addColorStop(1, "rgba(255,60,0,0)"); g.fillStyle = gr; g.beginPath(); g.moveTo(64, 6); g.bezierCurveTo(120, 110, 122, 200, 64, 250); g.bezierCurveTo(6, 200, 8, 110, 64, 6); g.fill(); });
/** a fire at `at`: tongues of flame, sparks, a flickering light that throws moving shadows */
export const makeFire = (at: THREE.Vector3, size = 1, o: { power?: number; shadow?: boolean } = {}): Part & { light: THREE.PointLight } => {
  const g = new THREE.Group(), r = rng(31), P = o.power ?? 90, n = 14, seed = Array.from({ length: n }, () => [r(), r(), r()]);
  const flames = new THREE.Group(); for (let i = 0; i < n; i++) flames.add(new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex(), color: new THREE.Color(3.2, 2.2, 1.2), blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true })));
  const light = new THREE.PointLight("#ff8a3a", P, 22, 2); light.position.set(0, 0.7 * size, 0); light.castShadow = !!o.shadow; if (o.shadow) { light.shadow.mapSize.set(1024, 1024); light.shadow.bias = -0.003; }
  const halo = glow("#ff8a3a", 4.2 * size, 1.1); halo.position.y = 0.6 * size;
  const sparks = makeSparks(new THREE.Vector3(0, 0.4 * size, 0), 120, { power: 3.2 * size, spread: 0.25, life: 1.6, size: 0.05 });
  g.add(noInk(flames), light, halo, sparks.obj); g.position.copy(at);
  return { obj: g, light, update: (t) => {
    flames.children.forEach((c, i) => { const [a, b, d] = seed[i], u = (a + t * (0.9 + 0.8 * b)) % 1, s = c as THREE.Sprite; s.position.set((b - 0.5) * 0.5 * size * (1 - u), (0.25 + u * 1.25) * size, (d - 0.5) * 0.5 * size * (1 - u)); s.scale.set(0.55 * size * (1 - 0.6 * u), 1.0 * size * (1 - 0.5 * u), 1); s.material.opacity = Math.sin(Math.PI * Math.min(1, u * 1.15)) * 0.9; });
    const k = 1 + 0.16 * Math.sin(t * 17.3) + 0.1 * Math.sin(t * 41.1 + 2) + 0.08 * Math.sin(t * 7.7); light.intensity = P * k; light.position.x = 0.08 * Math.sin(t * 23); halo.scale.setScalar(4.2 * size * k); sparks.update(t);
  } };
};
/** a distress rocket fired at t0 from `from`: a bright thin head with a tapering trail climbs to `apex` in `rise` seconds and bursts into a
 *  star: 10-14 arms shooting out, each a line of sparks of different sizes that curve down under gravity and fade out one by one.
 *  No halo sprite: the glow comes only from the bright sparks through the bloom. Everything is a pure function of time.
 *  `level(t)` is its brightness 0..1 (for anything that wants to follow it) and `pos(t)` where it is. */
export const makeRocket = (t0: number, from: THREE.Vector3, apex: THREE.Vector3, o: { rise?: number; glowTime?: number; power?: number; color?: string; arms?: number; radius?: number; noDepth?: boolean; shadow?: boolean } = {}) => {
  const rise = o.rise ?? 1.3, hold = o.glowTime ?? 5, P = o.power ?? 9000, col = o.color ?? "#f2f6ff", g = new THREE.Group(), r = rng(41);
  const ARMS = o.arms ?? 12, PER = 16, R = o.radius ?? 9, TR = 60, GL = 90, N = 1 + TR + ARMS * PER + GL + 3;
  const light = new THREE.PointLight(col, 0, 0, 2);
  light.castShadow = !!o.shadow; if (o.shadow) { light.shadow.mapSize.set(2048, 2048); light.shadow.bias = -0.002; light.shadow.camera.far = 400; }
  const P3 = new Float32Array(N * 3), SZ = new Float32Array(N), AL = new Float32Array(N), TN = new Float32Array(N * 3), geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(P3, 3)); geo.setAttribute("size", new THREE.BufferAttribute(SZ, 1)); geo.setAttribute("alpha", new THREE.BufferAttribute(AL, 1)); geo.setAttribute("tint", new THREE.BufferAttribute(TN, 3));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: !o.noDepth, blending: THREE.AdditiveBlending, fog: false, uniforms: { uScale: { value: 1000 } },
    vertexShader: "attribute float size; attribute float alpha; attribute vec3 tint; varying float vA; varying vec3 vC; uniform float uScale; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = max(1.5, size * uScale / -mv.z); vA = alpha; vC = tint; }",
    fragmentShader: "varying float vA; varying vec3 vC; void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; if (d > 1.0) discard; float k = pow(1.0 - d, 3.0) * 3.0 + pow(1.0 - d, 1.4) * 0.35; gl_FragColor = vec4(vC * k, vA); }",
  });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false;
  const v2 = new THREE.Vector2();
  pts.onBeforeRender = (renderer, _s, camera) => { renderer.getDrawingBufferSize(v2); mat.uniforms.uScale.value = v2.y / (2 * Math.tan((((camera as THREE.PerspectiveCamera).fov ?? 40) * Math.PI) / 360)); };
  g.add(light, noInk(pts));
  // the arms: Fibonacci directions with a little jitter; every spark has its own size, life, flicker phase and tint
  const dirs = Array.from({ length: ARMS }, (_, i) => { const y = 1 - (2 * (i + 0.5)) / ARMS, rr = Math.sqrt(1 - y * y), az = i * 2.399963 + 0.4 + (r() - 0.5) * 0.3; return new THREE.Vector3(rr * Math.cos(az), y, rr * Math.sin(az)).normalize(); });
  type Sp = { d: THREE.Vector3; f: number; sz: number; life: number; ph: number; tint: [number, number, number]; fall: number; reach: number };
  const tints: [number, number, number][] = [[5, 4.7, 4.2], [4.2, 4.6, 5.2], [5, 4, 2.6]];
  const arms: Sp[] = [];
  for (let a = 0; a < ARMS; a++) for (let k = 0; k < PER; k++) { const f = k / (PER - 1), big = r() < 0.22; arms.push({ d: dirs[a], f, sz: (0.09 + 0.3 * f ** 1.4) * (0.55 + 0.9 * r()) * (big ? 1.6 : 1), life: 1.3 + (hold * 0.92 - 1.3) * r() ** 0.8 * (0.6 + 0.4 * f), ph: r() * 6.28, tint: tints[Math.floor(r() * 3 * r() ** 0.5)], fall: 0.25 + 0.85 * f, reach: 0.22 + 0.78 * f }); }
  const glit: Sp[] = Array.from({ length: GL }, () => { const az = r() * 6.283, el = Math.acos(2 * r() - 1); return { d: new THREE.Vector3(Math.sin(el) * Math.cos(az), Math.cos(el), Math.sin(el) * Math.sin(az)), f: r(), sz: 0.05 + 0.13 * r() ** 2, life: 0.8 + 2.4 * r(), ph: r() * 6.28, tint: tints[Math.floor(r() * 3)], fall: 0.5 + 0.8 * r(), reach: 0.1 + 0.9 * r() } });
  const tj = Array.from({ length: TR }, () => [r() - 0.5, r() - 0.5, r() - 0.5]);
  const ease = (u: number) => 1 - (1 - u) * (1 - u);
  const path = (t: number) => { const u = Math.min(1, Math.max(0, (t - t0) / rise)); return from.clone().lerp(apex, ease(u)); };
  const pos = (t: number) => path(t).add(new THREE.Vector3(0, -Math.max(0, t - t0 - rise) * 1.6, 0));
  const level = (t: number) => { const a = t - t0; if (a < 0) return 0; if (a < rise) return 0.06 + 0.1 * (a / rise); const b = a - rise; return b < 0.12 ? 0.16 + 0.84 * (b / 0.12) : Math.max(0, 1 - (b - 0.12) / hold) ** 1.5; };
  const G = 1.1, tmp = new THREE.Vector3();
  const put = (i: number, p: THREE.Vector3 | number[], size: number, alpha: number, tint: number[], gain = 1) => {
    const x = Array.isArray(p) ? p : [p.x, p.y, p.z]; P3[i * 3] = x[0]; P3[i * 3 + 1] = x[1]; P3[i * 3 + 2] = x[2]; SZ[i] = size; AL[i] = Math.max(0, Math.min(1, alpha)); TN[i * 3] = tint[0] * gain; TN[i * 3 + 1] = tint[1] * gain; TN[i * 3 + 2] = tint[2] * gain;
  };
  return { obj: g, light, pos, level, update: (t: number) => {
    const a = t - t0, k = level(t), p = pos(t), b = a - rise; g.visible = a >= -0.01 && k > 0.002;
    light.position.copy(p); light.intensity = P * k;
    let i = 0;
    // the head: a thin hot point; the trail behind it tapers away
    put(i++, p, 0.8, a >= 0 && b < 0 ? 1 : 0, [6, 5.2, 4.2]);
    const tf = b < 0 ? 1 : Math.max(0, 1 - b / 0.5);
    for (let n = 0; n < TR; n++) { const u = n / TR, tt = Math.min(t, t0 + rise) - u * 0.8, q = path(tt); put(i++, tmp.set(q.x + tj[n][0] * 0.5 * u, q.y + tj[n][1] * 0.5 * u, q.z + tj[n][2] * 0.5 * u), 0.05 + 0.55 * (1 - u) ** 1.3, tt < t0 ? 0 : tf * (1 - u) ** 1.1, [4.5, 2.8, 1.2]); }
    // the burst: arms of sparks, then glitter
    const out = b >= 0, ex = out ? 1 - Math.exp(-b * 3.0) : 0, slow = out ? Math.log(1 + b) * 0.09 : 0;
    for (const s of arms) {
      const life = s.life, al = !out ? 0 : Math.min(1, b / 0.04) * Math.min(1, Math.max(0, (life - b) / 0.7)) * (b > life * 0.5 ? 0.7 + 0.3 * Math.sin(b * 26 + s.ph) : 1);
      const reach = R * (s.reach * (ex + slow));
      put(i++, tmp.set(apex.x + s.d.x * reach, apex.y + s.d.y * reach - 0.5 * G * b * b * s.fall, apex.z + s.d.z * reach), s.sz, al, s.tint);
    }
    for (const s of glit) {
      const al = !out ? 0 : Math.min(1, b / 0.04) * Math.min(1, Math.max(0, (s.life - b) / 0.5)) * (0.65 + 0.35 * Math.sin(b * 31 + s.ph)), reach = R * 0.8 * s.reach * (ex + slow * 0.5);
      put(i++, tmp.set(apex.x + s.d.x * reach, apex.y + s.d.y * reach - 0.5 * G * b * b * s.fall, apex.z + s.d.z * reach), s.sz, al, s.tint);
    }
    // the flash at the moment of the burst: a few hot points that die in a tenth of a second
    for (let n = 0; n < 3; n++) put(i++, apex, [1.6, 0.9, 0.5][n], out ? Math.max(0, 1 - b / [0.09, 0.16, 0.26][n]) : 0, [5, 4.6, 3.8], 1);
    geo.attributes.position.needsUpdate = true; geo.attributes.size.needsUpdate = true; geo.attributes.alpha.needsUpdate = true; geo.attributes.tint.needsUpdate = true;
  } };
};

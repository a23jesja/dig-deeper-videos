// Environment kit, part 4: the sky. A gradient dome, clouds in three layers that drift at different speeds, and for
// night a field of stars and a moon. Three moods: day, dusk, night.
import * as THREE from "three";
import { Part, canvasTex, rng, noInk } from "./util";

export type SkyMood = "day" | "dusk" | "night";
type Look = { top: string; mid: string; hor: string; sun: string; cloud: [string, string, string]; cloudA: number; stars: number };
export const SKY: Record<SkyMood, Look> = {
  day: { top: "#2f6fcc", mid: "#6ea6e6", hor: "#c4dcf2", sun: "#fff4d6", cloud: ["#ffffff", "#e8edf6", "#b9c6de"], cloudA: 0.95, stars: 0 },
  dusk: { top: "#3a3a78", mid: "#b0689a", hor: "#ffb36b", sun: "#ffcf8a", cloud: ["#ffd0a0", "#e88a7e", "#6d5a92"], cloudA: 0.9, stars: 0.25 },
  night: { top: "#03050f", mid: "#0a1230", hor: "#182648", sun: "#cfd9ff", cloud: ["#3a4a78", "#1f2a4c", "#0e1428"], cloudA: 0.75, stars: 1 },
};
const cloudTex = (k: number, c: [string, string, string]) => canvasTex(`envcloud2_${k}_${c.join("")}`, 512, 256, (g) => {
  // a heap of very soft puffs: shadow colour low, body colour in the middle, lit colour on the crowns; flat underneath
  const r = rng(k * 17 + 3), hex = (h: string, a: number) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
  const lumps = Array.from({ length: 7 + Math.floor(r() * 4) }, () => ({ x: 90 + r() * 332, w: 50 + r() * 60 }));
  const pass = (col: string, lift: number, sc: number, a: number, n: number) => { for (let i = 0; i < n; i++) { const l = lumps[Math.floor(r() * lumps.length)], x = l.x + (r() - 0.5) * l.w, hgt = (0.35 + 0.65 * Math.sin(((l.x - 90) / 332) * Math.PI)) * 95, y = 176 - r() * hgt - lift, rad = (20 + 30 * r()) * sc, gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, hex(col, a)); gr.addColorStop(1, hex(col, 0)); g.fillStyle = gr; g.fillRect(x - rad, y - rad, 2 * rad, 2 * rad); } };
  pass(c[2], -8, 1.5, 0.5, 90); pass(c[1], 6, 1.25, 0.5, 110); pass(c[0], 24, 0.9, 0.55, 90);
  g.globalCompositeOperation = "destination-out"; const fl = g.createLinearGradient(0, 168, 0, 214); fl.addColorStop(0, "rgba(0,0,0,0)"); fl.addColorStop(1, "rgba(0,0,0,1)"); g.fillStyle = fl; g.fillRect(0, 168, 512, 88); g.globalCompositeOperation = "source-over";
});
/** the sky, centred on the camera each frame (call update(t, cameraPosition)); sunDir points at the sun or moon */
export const makeSky = (mood: SkyMood, sunDir = new THREE.Vector3(0.4, 0.5, 0.75), o: { clouds?: number; radius?: number; dome?: boolean } = {}): Part & { follow: (p: THREE.Vector3) => void } => {
  const L = SKY[mood], R = o.radius ?? 900, obj = new THREE.Group();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(R, 40, 20), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { cTop: { value: new THREE.Color(L.top) }, cMid: { value: new THREE.Color(L.mid) }, cHor: { value: new THREE.Color(L.hor) }, cSun: { value: new THREE.Color(L.sun) }, uSun: { value: sunDir.clone().normalize() }, uGlow: { value: mood === "night" ? 0.35 : mood === "dusk" ? 0.9 : 0.5 } },
    vertexShader: "varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `varying vec3 vDir; uniform vec3 cTop, cMid, cHor, cSun, uSun; uniform float uGlow;
      void main(){ float h = clamp(vDir.y, 0.0, 1.0); vec3 c = mix(cHor, cMid, smoothstep(0.0, 0.22, h)); c = mix(c, cTop, smoothstep(0.18, 0.75, h));
        float s = max(dot(normalize(vDir), uSun), 0.0); c += cSun * (pow(s, 6.0) * 0.25 + pow(s, 60.0) * 0.6) * uGlow; if (vDir.y < 0.0) c = cHor * (1.0 + vDir.y * 0.6);
        gl_FragColor = vec4(c, 1.0); }`,
  }));
  dome.renderOrder = -10; if (o.dome !== false) obj.add(dome);
  if (L.stars > 0) {
    const n = Math.round(2600 * L.stars), pos = new Float32Array(n * 3), r = rng(11);
    for (let i = 0; i < n; i++) { const az = r() * 6.283, el = Math.asin(0.02 + 0.98 * r()); pos.set([R * 0.98 * Math.cos(el) * Math.cos(az), R * 0.98 * Math.sin(el), R * 0.98 * Math.cos(el) * Math.sin(az)], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    for (const [size, k, count] of [[2.0, 1.3, n], [3.4, 2.4, Math.round(n * 0.12)], [5.5, 3.6, Math.round(n * 0.015)]] as [number, number, number][]) {
      const gg = g.clone(); gg.setDrawRange(0, count);
      const p = new THREE.Points(gg, new THREE.PointsMaterial({ size, sizeAttenuation: false, color: new THREE.Color(k, k, k * 1.12), fog: false, depthWrite: false, transparent: true, opacity: mood === "night" ? 1 : 0.6 }));
      p.frustumCulled = false; p.renderOrder = -9; obj.add(p);
    }
  }
  // the sun or the moon: a disc with a soft halo
  const disc = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex("envdisc", 128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "#fff"); gr.addColorStop(0.42, "#fff"); gr.addColorStop(0.5, "rgba(255,255,255,0.35)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }),
    color: new THREE.Color(L.sun).multiplyScalar(mood === "night" ? 2.2 : 3.2), fog: false, depthWrite: false, transparent: true }));
  disc.position.copy(sunDir).normalize().multiplyScalar(R * 0.95); disc.scale.setScalar(R * (mood === "night" ? 0.09 : 0.12)); disc.renderOrder = -8; obj.add(disc);
  // clouds: three layers at different distances and heights, each turning about the camera at its own speed
  const layers: { g: THREE.Group; speed: number }[] = [], n = o.clouds ?? 7, rr = rng(5);
  [[0.86, 0.1, 0.004, 1.0], [0.7, 0.2, 0.008, 0.8], [0.52, 0.34, 0.014, 0.62]].forEach(([dist, elev, speed, sc], li) => {
    const lg = new THREE.Group();
    for (let i = 0; i < n; i++) {
      const az = (i / n) * 6.283 + rr() * 0.5, el = elev + (rr() - 0.4) * 0.09, d = R * dist, w = R * (0.3 + 0.22 * rr()) * sc;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: cloudTex(li * 4 + (i % 4), L.cloud), transparent: true, opacity: L.cloudA * (0.75 + 0.25 * rr()), depthWrite: false, fog: false }));
      m.position.set(d * Math.cos(el) * Math.cos(az), d * Math.sin(el), d * Math.cos(el) * Math.sin(az)); m.scale.set(w, w * 0.42, 1); m.lookAt(0, m.position.y * 0.3, 0); m.renderOrder = -7 + li; lg.add(m);
    }
    layers.push({ g: lg, speed }); obj.add(lg);
  });
  noInk(obj);
  return { obj, update: (t) => { for (const l of layers) l.g.rotation.y = t * l.speed; }, follow: (p) => { obj.position.copy(p); } };
};

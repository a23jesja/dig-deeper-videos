// Environment kit, part 3: ground surfaces with structure, lines and wear. Road (asphalt with lane lines, cracks
// and patches), cobblestones, a planked deck, and soil. Each is a colour texture plus a height texture (bump), so
// the light catches the joints and the grain.
import * as THREE from "three";
import { canvasTex } from "./util";

type Draw = (g: CanvasRenderingContext2D, r: () => number, bump: boolean) => void;
const pair = (key: string, size: number, draw: Draw) => ({
  map: canvasTex(key, size, size, (g, r) => draw(g, r, false), true),
  bump: canvasTex(key + "_bump", size, size, (g, r) => draw(g, r, true), true, false),
});
const speckle = (g: CanvasRenderingContext2D, r: () => number, n: number, size: number, a: number, S: number) => {
  for (let i = 0; i < n; i++) { const v = r() > 0.5 ? 255 : 0; g.fillStyle = `rgba(${v},${v},${v},${a * r()})`; g.fillRect(r() * S, r() * S, size * (0.5 + r()), size * (0.5 + r())); }
};
const asphalt: Draw = (g, r, bump) => {
  const S = 1024; g.fillStyle = bump ? "#808080" : "#4a4b50"; g.fillRect(0, 0, S, S);
  speckle(g, r, 26000, 3, bump ? 0.5 : 0.22, S);
  for (let i = 0; i < 5; i++) { g.fillStyle = bump ? "rgba(150,150,150,0.5)" : `rgba(30,30,34,${0.25 + 0.2 * r()})`; g.fillRect(r() * S, r() * S, 120 + 200 * r(), 70 + 120 * r()); }   // repair patches
  for (const x of [330, 694]) { const gr = g.createLinearGradient(x - 90, 0, x + 90, 0); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.5, bump ? "rgba(90,90,90,0.5)" : "rgba(255,255,255,0.07)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(x - 90, 0, 180, S); }   // tyre wear
  g.strokeStyle = bump ? "#202020" : "rgba(18,18,20,0.85)"; g.lineWidth = 2.5;
  for (let i = 0; i < 9; i++) { let x = r() * S, y = r() * S; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 9; k++) { x += (r() - 0.5) * 90; y += 30 + 40 * r(); g.lineTo(x, y); } g.stroke(); }   // cracks
  if (!bump) {   // painted lines, worn through
    g.fillStyle = "#e9e6da"; for (let y = 0; y < S; y += 256) g.fillRect(504, y + 30, 16, 150);
    g.fillRect(40, 0, 14, S); g.fillRect(970, 0, 14, S);
    g.globalCompositeOperation = "destination-out"; speckle(g, r, 900, 9, 0, S); g.globalCompositeOperation = "source-over";
    for (let i = 0; i < 1400; i++) { g.fillStyle = "rgba(74,75,80,0.9)"; const onLine = [40, 504, 970][Math.floor(r() * 3)]; g.fillRect(onLine + r() * 16, r() * S, 2 + 6 * r(), 2 + 10 * r()); }
  }
};
const cobbles: Draw = (g, r, bump) => {
  const S = 1024, n = 10, c = S / n; g.fillStyle = bump ? "#101010" : "#2c2924"; g.fillRect(0, 0, S, S);
  for (let j = 0; j < n; j++) for (let i = -1; i < n; i++) {
    const x = i * c + (j % 2) * c * 0.5 + (r() - 0.5) * 6, y = j * c + (r() - 0.5) * 6, w = c - 9 - 6 * r(), h = c - 9 - 6 * r(), t = 96 + 60 * r(), worn = r() > 0.82;
    const draw = (ox: number) => {
      g.fillStyle = bump ? `rgb(${t + 60},${t + 60},${t + 60})` : `rgb(${t + (worn ? 30 : 0)},${t * 0.95 + (worn ? 26 : 0)},${t * 0.88 + (worn ? 18 : 0)})`;
      g.beginPath(); g.roundRect(x + ox + 4, y + 4, w, h, 16 + 10 * r()); g.fill();
      if (!bump) { g.strokeStyle = "rgba(255,255,255,0.16)"; g.lineWidth = 3; g.beginPath(); g.moveTo(x + ox + 16, y + 9); g.lineTo(x + ox + w - 12, y + 9); g.stroke();
        g.strokeStyle = "rgba(0,0,0,0.25)"; g.beginPath(); g.moveTo(x + ox + 14, y + h); g.lineTo(x + ox + w - 8, y + h); g.stroke(); }
    };
    draw(0); if (x + w > S) draw(-S);
  }
  speckle(g, r, 9000, 3, bump ? 0.25 : 0.12, S);
};
const planks: Draw = (g, r, bump) => {
  const S = 1024, n = 8, h = S / n; g.fillStyle = bump ? "#909090" : "#a8845a"; g.fillRect(0, 0, S, S);
  for (let j = 0; j < n; j++) {
    const y = j * h, tone = r();
    if (!bump) { g.fillStyle = `rgba(${tone > 0.5 ? "255,232,190" : "70,44,20"},${0.06 + 0.12 * r()})`; g.fillRect(0, y, S, h); }
    g.strokeStyle = bump ? "rgba(60,60,60,0.35)" : "rgba(70,44,20,0.22)"; g.lineWidth = 1.2;
    for (let k = 0; k < 14; k++) { const yy = y + 6 + r() * (h - 12); g.beginPath(); g.moveTo(0, yy); for (let x = 0; x <= S; x += 64) g.lineTo(x, yy + (r() - 0.5) * 5); g.stroke(); }   // grain
    g.fillStyle = bump ? "#101010" : "#2a1a0e"; g.fillRect(0, y, S, 5);                                                   // seam (caulking)
    for (let k = 0; k < 2; k++) { const x = Math.floor(r() * S); g.fillRect(x, y, 4, h); for (const dx of [-14, 14]) for (const dy of [22, h - 22]) { g.beginPath(); g.arc(x + dx, y + dy, 4, 0, 7); g.fill(); } }   // butt joints and nail heads
  }
  if (!bump) {   // a worn, paler track where people walk, and a few stains
    const gr = g.createLinearGradient(0, 300, 0, 724); gr.addColorStop(0, "rgba(255,240,210,0)"); gr.addColorStop(0.5, "rgba(255,240,210,0.16)"); gr.addColorStop(1, "rgba(255,240,210,0)"); g.fillStyle = gr; g.fillRect(0, 300, S, 424);
    for (let i = 0; i < 7; i++) { const x = r() * S, y = r() * S, rad = 30 + 60 * r(), st = g.createRadialGradient(x, y, 0, x, y, rad); st.addColorStop(0, "rgba(40,26,12,0.22)"); st.addColorStop(1, "rgba(40,26,12,0)"); g.fillStyle = st; g.fillRect(x - rad, y - rad, 2 * rad, 2 * rad); }
  }
};
const soil: Draw = (g, r, bump) => {
  const S = 1024; g.fillStyle = bump ? "#707070" : "#6a5236"; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 60; i++) { const x = r() * S, y = r() * S, rad = 60 + 140 * r(), gr = g.createRadialGradient(x, y, 0, x, y, rad), dark = r() > 0.5; gr.addColorStop(0, bump ? `rgba(${dark ? 40 : 190},${dark ? 40 : 190},${dark ? 40 : 190},0.35)` : dark ? "rgba(52,38,22,0.4)" : "rgba(128,104,70,0.35)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - rad, y - rad, 2 * rad, 2 * rad); }
  speckle(g, r, 30000, 3, bump ? 0.5 : 0.2, S);
  for (let i = 0; i < 260; i++) { const x = r() * S, y = r() * S, s = 3 + 9 * r(); g.fillStyle = bump ? "#e0e0e0" : `rgb(${150 + 50 * r()},${140 + 40 * r()},${120 + 40 * r()})`; g.beginPath(); g.ellipse(x, y, s, s * 0.7, r() * 3, 0, 7); g.fill(); }   // pebbles
};
export type SurfaceName = "road" | "cobbles" | "planks" | "soil";
const DRAW: Record<SurfaceName, Draw> = { road: asphalt, cobbles, planks, soil };
/** a lit material for one surface; `tile` = metres covered by one repeat of the texture */
export const surfaceMaterial = (name: SurfaceName, o: { bump?: number; rough?: number; tint?: THREE.ColorRepresentation } = {}) => {
  const t = pair("surf_" + name, 1024, DRAW[name]);
  return new THREE.MeshStandardMaterial({ map: t.map, bumpMap: t.bump, bumpScale: o.bump ?? 2.5, roughness: o.rough ?? 0.92, metalness: 0, color: o.tint ?? "#ffffff" });
};
/** a flat rectangle of a surface on the ground (y = 0), x0..x1 by z0..z1, the texture's rows running along x */
export const surfacePlane = (name: SurfaceName, x0: number, x1: number, z0: number, z1: number, tile = 4, o: Parameters<typeof surfaceMaterial>[1] = {}) => {
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0).rotateX(-Math.PI / 2).translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
  const uv = g.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * (x1 - x0)) / tile, (uv.getY(i) * (z1 - z0)) / tile);
  const m = new THREE.Mesh(g, surfaceMaterial(name, o)); m.receiveShadow = true; return m;
};

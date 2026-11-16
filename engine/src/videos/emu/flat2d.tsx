// The film as a flat 2D cartoon: the same shot list, cast and cards as the 3D version, but drawn straight onto one
// canvas. No 3D rooms, no lights, no shadows: a drawn backdrop per room, then every figure and card painted back to
// front at the place (and size) the shot's camera gives it. Everything is vector drawing at the final resolution.
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Pen } from "./toon";
import { Show } from "./scenes";
import { SU, CamInfo, FxPlace, GeoName } from "./castbase";
import { EMU_HIP_X } from "./emutoon";

const INK = "#1d1626";
/** design-space anchor (x of the feet, y of the sole) of each kind of figure */
const ANCHOR: Record<GeoName, [number, number]> = { body: [300, 975], emuSide: [EMU_HIP_X, 975], emuFront: [450, 975], wide: [1200, 1690] };

type Proj = (x: number, y: number, z: number) => { x: number; y: number; d: number; ppm: number };
type G = CanvasRenderingContext2D;

// ---------------- backdrops ----------------
const picCache = new Map<number, HTMLCanvasElement>();
/** the pictures on the gallery walls: a flat landscape with one to three standing figures, as in the 3D rooms */
const picture = (k: number) => {
  let cv = picCache.get(k);
  if (cv) return cv;
  cv = document.createElement("canvas"); cv.width = cv.height = 256;
  const g = cv.getContext("2d")!;
  const sky = ["#7f9fb6", "#b89f6e", "#5a6a62", "#8a7a9a", "#9a6a58", "#6a7f8a"][k % 6];
  g.fillStyle = sky; g.fillRect(0, 0, 256, 256);
  g.fillStyle = "#4f5f45"; g.beginPath(); g.moveTo(0, 190); for (let x = 0; x <= 256; x += 16) g.lineTo(x, 172 + 26 * Math.sin(x / 40 + k)); g.lineTo(256, 256); g.lineTo(0, 256); g.fill();
  const n = 1 + (k % 3);
  for (let i = 0; i < n; i++) {
    const x = (256 * (i + 1)) / (n + 1);
    g.fillStyle = ["#b9483a", "#c9a25a", "#3f5f8a", "#e9dfc8"][(k + i) % 4]; g.strokeStyle = INK; g.lineWidth = 5;
    g.beginPath(); g.ellipse(x, 196, 28, 62, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = "#e8c4a0"; g.beginPath(); g.arc(x, 118, 19, 0, 7); g.fill(); g.stroke();
  }
  picCache.set(k, cv);
  return cv;
};
const poly = (g: G, pts: { x: number; y: number }[], fill: string, line = 0) => {
  g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath();
  g.fillStyle = fill; g.fill();
  if (line) { g.lineWidth = line; g.strokeStyle = INK; g.lineJoin = "round"; g.stroke(); }
};
/** a wall-mounted rectangle (x0..x1, y0..y1) on the plane z */
const wallRect = (P: Proj, x0: number, x1: number, y0: number, y1: number, z: number) => [P(x0, y1, z), P(x1, y1, z), P(x1, y0, z), P(x0, y0, z)];
/** a floor of boards: seams across, staggered board ends between them */
const floor = (g: G, P: Proj, cx: number, w: number, zb: number, zn: number, col: string, seam: string, W: number, H: number, step = 1.5) => {
  const a = P(cx - w / 2, 0, zb), b = P(cx + w / 2, 0, zb);
  poly(g, [a, b, { x: b.x < a.x ? -W : 2 * W, y: 3 * H }, { x: b.x < a.x ? 2 * W : -W, y: 3 * H }], col);
  g.strokeStyle = seam; g.lineCap = "round";
  for (let z = zb - step, r = 0; z > zn; z -= step, r++) {
    const l = P(cx - w / 2, 0, z), q = P(cx + w / 2, 0, z);
    g.lineWidth = Math.max(1.5, 0.02 * l.ppm); g.beginPath(); g.moveTo(l.x, l.y); g.lineTo(q.x, q.y); g.stroke();
    for (let x = -w / 2 + (r % 2 ? 1.2 : 0.3); x < w / 2; x += 2.4) { const t = P(cx + x, 0, z), u = P(cx + x, 0, z + step); g.lineWidth = Math.max(1.2, 0.014 * t.ppm); g.beginPath(); g.moveTo(t.x, t.y); g.lineTo(u.x, u.y); g.stroke(); }
  }
};
const GALLERY_PICS: [number, number, number, number][] = [[-3.5, 2.85, 2.2, 2.6], [7.4, 2.6, 2.0, 2.6], [-7.2, 2.5, 2.6, 1.9], [11.2, 2.8, 2.4, 2.2], [-11.0, 2.9, 2.0, 2.5], [5.6, 6.1, 3.4, 2.2], [-5.4, 6.1, 3.0, 2.4], [0, 6.2, 3.2, 2.4], [10.4, 6.0, 2.6, 2.2], [-10.2, 6.1, 2.8, 2.2]];
/** a layer of the backdrop: painted when everything farther than `z` has been painted (people beyond it show through its openings) */
type Layer = { z: number; paint: () => void };
const papers = new Map<string, HTMLCanvasElement>();
/** wallpaper: a small repeating leaf on the wall colour (one tile = 1.6 m) */
const paper = (hex: string) => {
  let cv = papers.get(hex);
  if (cv) return cv;
  cv = document.createElement("canvas"); cv.width = cv.height = 256;
  const g = cv.getContext("2d")!; g.fillStyle = hex; g.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
    const cx = x * 64 + (y % 2 ? 32 : 0) + 16, cy = y * 64 + 32;
    g.fillStyle = "rgba(0,0,0,0.11)"; g.beginPath(); g.moveTo(cx, cy - 22); g.quadraticCurveTo(cx + 18, cy, cx, cy + 22); g.quadraticCurveTo(cx - 18, cy, cx, cy - 22); g.fill();
    g.fillStyle = "rgba(255,230,190,0.09)"; g.beginPath(); g.arc(cx, cy, 5, 0, 7); g.fill();
  }
  papers.set(hex, cv);
  return cv;
};
/** a sheet of light: a soft-edged warm shape added to whatever is under it */
const lightSheet = (g: G, pts: { x: number; y: number }[], k: number, blur: number) => {
  g.save(); g.globalCompositeOperation = "lighter"; g.filter = `blur(${blur.toFixed(1)}px)`; g.fillStyle = `rgba(255,205,130,${k})`;
  g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath(); g.fill(); g.restore();
};
const framed = (g: G, P: Proj, x: number, y: number, w: number, h: number, z: number, k: number, lw: number) => {
  const o = wallRect(P, x - w / 2 - 0.13, x + w / 2 + 0.13, y - h / 2 - 0.13, y + h / 2 + 0.13, z), q = wallRect(P, x - w / 2, x + w / 2, y - h / 2, y + h / 2, z);
  poly(g, o, "#e2b33c", lw);
  const x0 = Math.min(q[0].x, q[1].x), x1 = Math.max(q[0].x, q[1].x);
  g.drawImage(picture(k), x0, q[0].y, x1 - x0, q[2].y - q[0].y);
  poly(g, q, "rgba(0,0,0,0)", lw * 0.8);
};
/** The Salon Carre (red) and the Uffizi (green) in three layers of depth: the sunlit room seen through the doorway,
 *  the papered wall hung with gilt frames (with the doorway cut out of it), and the parquet with its pools of light. */
const gallery = (g: G, P: Proj, cx: number, wall: string, k0: number, far: string, zn: number, W: number, H: number): Layer[] => {
  const zb = 6.05, w = 30, lw = Math.max(3, 0.035 * P(cx, 1, zb).ppm), D0 = cx + 2.7, D1 = cx + 5.1, DH = 3.8, zf = 16.4;
  const beyond = () => {
    const flw = Math.max(2, 0.035 * P(cx + 5, 1, zf).ppm);
    poly(g, wallRect(P, cx + 0.3, cx + 10.6, 0, 9, zf), far);
    for (const x of [cx + 0.3, cx + 10.6]) poly(g, [P(x, 9, zf), P(x, 9, zb), P(x, 0, zb), P(x, 0, zf)], shade(far, 0.8), flw);
    poly(g, [P(cx + 0.3, 0, zf), P(cx + 10.6, 0, zf), P(cx + 10.6, 0, zb), P(cx + 0.3, 0, zb)], "#efe6d2", flw);
    poly(g, wallRect(P, cx + 0.3, cx + 10.6, 0, 0.9, zf), "#6b3b1c", flw); poly(g, wallRect(P, cx + 0.3, cx + 10.6, 0.9, 0.98, zf), "#e2b33c", flw * 0.7);
    // the tall window: the light we see
    const wr = wallRect(P, cx + 5.8, cx + 8.2, 1.14, 5.84, zf);
    poly(g, wallRect(P, cx + 5.65, cx + 8.35, 1.0, 6.0, zf), "#efe6cf", flw); poly(g, wr, "#fff7dc", flw * 0.8);
    g.strokeStyle = "#efe6cf"; g.lineWidth = flw * 1.4;
    const m = (a: { x: number; y: number }, b: { x: number; y: number }) => { g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); };
    m(P(cx + 7.0, 1.14, zf), P(cx + 7.0, 5.84, zf)); for (const y of [2.6, 4.2]) m(P(cx + 5.8, y, zf), P(cx + 8.2, y, zf));
    const c0 = P(cx + 7.0, 3.5, zf), r = 4.2 * c0.ppm, gr = g.createRadialGradient(c0.x, c0.y, 0, c0.x, c0.y, r);
    gr.addColorStop(0, "rgba(255,236,180,0.55)"); gr.addColorStop(1, "rgba(255,236,180,0)");
    g.save(); g.globalCompositeOperation = "lighter"; g.fillStyle = gr; g.fillRect(c0.x - r, c0.y - r, 2 * r, 2 * r); g.restore();
    framed(g, P, cx + 3.6, 2.7, 1.5, 1.9, zf, k0 + 3, flw); framed(g, P, cx + 9.7, 2.7, 1.2, 1.8, zf, k0 + 5, flw);
    lightSheet(g, [P(cx + 5.85, 0, 16.2), P(cx + 8.15, 0, 16.2), P(cx + 5.3, 0, zb), P(cx + 2.75, 0, zb)], 0.5, flw * 1.5);
  };
  const front = () => {
    for (const s of [-1, 1]) { // side walls, only seen in the widest shots
      const x = cx + s * (w / 2), near = Math.max(zn, -18);
      poly(g, [P(x, 9, zb), P(x, 9, near), P(x, 0, near), P(x, 0, zb)], shade(wall, 0.82), lw);
      poly(g, [P(x, 1.09, zb), P(x, 1.09, near), P(x, 0, near), P(x, 0, zb)], "#5c3319", lw);
    }
    // the wall with the doorway cut out of it, papered
    const o = wallRect(P, cx - w / 2, cx + w / 2, 0, 9, zb), d = wallRect(P, D0, D1, 0, DH, zb), tl = P(cx + w / 2, 9, zb), s = (1.6 * tl.ppm) / 256;
    const pat = g.createPattern(paper(wall), "repeat")!; pat.setTransform(new DOMMatrix().translate(tl.x, tl.y).scale(s));
    g.beginPath(); o.forEach((q, i) => (i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y))); g.closePath(); d.forEach((q, i) => (i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y))); g.closePath();
    g.fillStyle = pat; g.fill("evenodd");
    poly(g, wallRect(P, cx - w / 2, cx + w / 2, 8.2, 8.7, zb), "#e2b33c", lw); poly(g, wallRect(P, cx - w / 2, cx + w / 2, 8.7, 9, zb), "#efe6cf", lw);
    GALLERY_PICS.forEach(([x, y, pw, ph], i) => framed(g, P, cx + x, y, pw, ph, zb, k0 + i, lw));
    // dado and rail, broken at the doorway; then the doorway's cream jambs and gilt lintel
    for (const [x0, x1] of [[cx - w / 2, D0], [D1, cx + w / 2]]) { poly(g, wallRect(P, x0, x1, 0, 1.0, zb), "#6b3b1c"); poly(g, wallRect(P, x0, x1, 1.0, 1.1, zb), "#e2b33c", lw * 0.8); }
    for (const x of [D0 - 0.19, D1 - 0.07]) poly(g, wallRect(P, x, x + 0.26, 0, DH + 0.1, zb), "#efe6cf", lw);
    poly(g, wallRect(P, D0 - 0.25, D1 + 0.25, DH, DH + 0.3, zb), "#e2b33c", lw); poly(g, wallRect(P, D0 - 0.4, D1 + 0.4, DH + 0.3, DH + 0.42, zb), "#efe6cf", lw);
    // light from the skylight across wall and pictures
    for (const [xt, xb] of [[1.6, -2.75], [-7.0, -11.3], [11.0, 6.6]]) lightSheet(g, [P(cx + xt + 1.0, 8.2, zb), P(cx + xt - 1.0, 8.2, zb), P(cx + xb - 1.0, 1.12, zb), P(cx + xb + 1.0, 1.12, zb)], 0.3, lw * 2.5);
    // the floor in front of the wall (the doorway's sill joins the far floor), then its pools of light
    const a = P(cx - w / 2, 0, zb), b = P(cx + w / 2, 0, zb), dl = P(D0, 0, zb), dr = P(D1, 0, zb);
    floor(g, P, cx, w, zb, zn, "#d2a05c", "rgba(96,58,24,0.5)", W, H);
    g.lineWidth = lw; g.strokeStyle = INK;
    for (const [u, v] of [[a, dr], [dl, b]] as const) { g.beginPath(); g.moveTo(u.x, u.y); g.lineTo(v.x, v.y); g.stroke(); }
    for (const [, xb] of [[1.6, -2.75], [-7.0, -11.3], [11.0, 6.6]]) lightSheet(g, [P(cx + xb + 1.0, 0, 5.9), P(cx + xb - 1.0, 0, 5.9), P(cx + xb - 2.9, 0, 2.4), P(cx + xb - 0.5, 0, 2.4)], 0.26, lw * 2.5);
    lightSheet(g, [P(cx + 5.3, 0, zb), P(cx + 2.75, 0, zb), P(cx + 1.4, 0, 1.6), P(cx + 4.0, 0, 1.6)], 0.42, lw * 2.5);
  };
  return [{ z: zf, paint: beyond }, { z: zb, paint: front }];
};
/** any other place, until it gets a backdrop of its own: a plain wall and floor */
const plainRoom = (g: G, P: Proj, cx: number, zb: number, zn: number, wall: string, fl: string, W: number, H: number): Layer[] => [{ z: zb, paint: () => {
  poly(g, wallRect(P, cx - 40, cx + 40, 0, 12, zb), wall);
  floor(g, P, cx, 80, zb, zn, fl, "rgba(60,40,20,0.35)", W, H);
  const a = P(cx - 40, 0, zb), b = P(cx + 40, 0, zb);
  g.lineWidth = Math.max(3, 0.035 * a.ppm); g.strokeStyle = INK; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
} }];
const shade = (hex: string, k: number) => "#" + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * k).toString(16).padStart(2, "0")).join("");
/** which backdrops exist: the film can be rendered flat once every place it visits is listed here */
export const FLAT_ROOMS = ["louvre:0", "louvre:240"];
const backdrop = (g: G, P: Proj, zone: string, camX: number, camZ: number, W: number, H: number): Layer[] => {
  const zn = camZ + 0.6;
  g.fillStyle = "#e9e2d0"; g.fillRect(0, 0, W, H);
  if (zone === "louvre") {
    const room = [0, 60, 120, 180, 240].reduce((a, b) => (Math.abs(b - camX) < Math.abs(a - camX) ? b : a));
    if (room === 0) return gallery(g, P, 0, "#a82a31", 0, "#3f7f84", zn, W, H);
    if (room === 240) return gallery(g, P, 240, "#567a62", 7, "#9a5a48", zn, W, H);
    return plainRoom(g, P, room, room === 60 ? 5.05 : room === 120 ? 4.05 : 4.55, zn, room === 60 ? "#cfc7b6" : room === 120 ? "#d6caae" : "#cf966e", room === 60 ? "#b5ad9e" : "#a37c55", W, H);
  }
  return plainRoom(g, P, camX, 8, zn, "#cfe0ee", "#d8ceb8", W, H);
};

// ---------------- one frame ----------------
const cam3 = new THREE.PerspectiveCamera(40, 16 / 9, 0.2, 1500), right = new THREE.Vector3(), fwd = new THREE.Vector3(), v = new THREE.Vector3();
export const drawFlat = (g: G, show: Show, id: number, f: number, W: number, H: number) => {
  const c = show.camAt(id, f), shot = show.shots[id - 1];
  cam3.aspect = W / H; cam3.fov = c.fov; cam3.position.set(...c.pos); cam3.up.set(0, 1, 0); cam3.lookAt(...c.look);
  cam3.updateProjectionMatrix(); cam3.updateMatrixWorld(); cam3.matrixWorldInverse.copy(cam3.matrixWorld).invert();
  right.setFromMatrixColumn(cam3.matrixWorld, 0); cam3.getWorldDirection(fwd);
  const tanH = Math.tan((c.fov * Math.PI) / 360);
  const P: Proj = (x, y, z) => {
    const d = Math.max(0.05, v.set(x, y, z).sub(cam3.position).dot(fwd));
    v.set(x, y, z).project(cam3);
    return { x: (v.x * 0.5 + 0.5) * W, y: (0.5 - v.y * 0.5) * H, d, ppm: H / 2 / (d * tanH) };
  };
  const ci: CamInfo = { pos: cam3.position, right, sun: new THREE.Vector3(0.5, 0.8, -0.3).normalize(), light: shot.light };
  const st = show.sceneAt(id, f, ci);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = "source-over"; g.filter = "none";
  const layers = backdrop(g, P, shot.zone, c.pos[0], c.pos[2], W, H);
  type Item = { d: number; i: number; top: boolean; paint: () => void };
  const items: Item[] = layers.map((l, i) => ({ d: P(c.pos[0], 0, l.z).d + 0.02, i: -10 + i, top: false, paint: l.paint }));
  const wallD = Math.min(...layers.map((l) => P(c.pos[0], 0, l.z).d));
  st.places.forEach((p, i) => {
    const q = P(p.x, p.y, p.z), [ox, sole] = ANCHOR[p.geo ?? "body"], s = SU * q.ppm * (p.scale ?? 1);
    if (q.d < 0.3) return;
    const body = () => { g.translate(q.x, q.y); g.scale(p.mirror ? -s : s, s); g.translate(-ox, -sole); p.draw(new Pen(g)); };
    items.push({ d: q.d, i, top: false, paint: body });
    // the figure's shadow: its own silhouette laid on the floor, away from the light (upper left), painted before any figure
    if (q.d < wallD && s > 0.05) items.push({ d: wallD - 0.001, i: -5, top: false, paint: () => {
      const bw = Math.ceil(600 * s) + 8, bh = Math.ceil(1000 * s) + 8, og = shadowCtx(bw, bh);
      og.setTransform(1, 0, 0, 1, 0, 0); og.globalCompositeOperation = "source-over"; og.clearRect(0, 0, bw, bh);
      og.translate(bw / 2, bh - 4 - 25 * s); og.scale(p.mirror ? -s : s, s); og.translate(-ox, -sole); p.draw(new Pen(og));
      og.setTransform(1, 0, 0, 1, 0, 0); og.globalCompositeOperation = "source-in"; og.fillStyle = "#2a1630"; og.fillRect(0, 0, bw, bh);
      g.globalAlpha = 0.2; g.transform(1, 0, -0.62, 0.3, q.x, q.y); g.drawImage(og.canvas, -bw / 2, -(bh - 4 - 25 * s));
    } });
  });
  st.fx.forEach((p: FxPlace, i) => {
    if (p.flat) return;
    const q = P(p.x, p.y, p.z);
    if (q.d < 0.3) return;
    items.push({ d: q.d, i: 1000 + i, top: !!p.top, paint: () => {
      g.globalAlpha = p.opacity ?? 1; g.translate(q.x, q.y); g.rotate(-(p.rot ?? 0)); g.scale((p.w * q.ppm) / p.cw, (p.h * q.ppm) / p.ch); g.translate(-p.cw / 2, -p.ch / 2); p.draw(new Pen(g));
    } });
  });
  // back to front; the caption-like cards (banners, bubbles, stamps) after everything else, over the vignette
  items.sort((a, b) => Number(a.top) - Number(b.top) || b.d - a.d || a.i - b.i);
  let shaded = false;
  const vignette = () => {
    const gr = g.createRadialGradient(W * 0.42, H * 0.4, H * 0.35, W * 0.5, H * 0.5, H * 1.05);
    gr.addColorStop(0, "rgba(40,10,40,0)"); gr.addColorStop(1, "rgba(40,10,40,0.42)");
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = "multiply"; g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore(); shaded = true;
  };
  for (const it of items) { if (it.top && !shaded) vignette(); g.save(); it.paint(); g.restore(); }
  if (!shaded) vignette();
};
let SH: CanvasRenderingContext2D | null = null;
/** one scratch canvas for the shadows, grown when a bigger figure needs it */
const shadowCtx = (w: number, h: number) => {
  if (!SH || SH.canvas.width < w || SH.canvas.height < h) { const cv = document.createElement("canvas"); cv.width = Math.max(w, SH?.canvas.width ?? 0); cv.height = Math.max(h, SH?.canvas.height ?? 0); SH = cv.getContext("2d")!; }
  return SH;
};

export const Flat2D: React.FC<{ show: Show; id: number; alpha: number; W: number; H: number }> = ({ show, id, alpha, W, H }) => {
  const f = useCurrentFrame(), ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { const g = ref.current?.getContext("2d"); if (g) drawFlat(g, show, id, f, W, H); }, [f, id, show, W, H]);
  return <AbsoluteFill style={{ opacity: alpha }}><canvas ref={ref} width={W} height={H} style={{ width: "100%", height: "100%" }} /></AbsoluteFill>;
};

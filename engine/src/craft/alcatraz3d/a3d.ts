// Alcatraz in the new style: the flat Knopp figures standing on the floor of the Blender cell block (blender/alcatraz3d/set.py).
// A figure's foot is a point on the 3D floor; each frame's projection (cam/<id>.json, written by Blender) gives where that point and the
// top of his head fall in the picture, so the figure stands on the floor at the right size and moves with the plate when the lens moves
// (parallax). Under his feet a contact shadow: a circle on the floor, projected. Over him the plate's light (cabin v5's card light): the
// warm lamp's side warmer, the far side cold. Nothing stands in front of a figure (checked per frame against the floor and solid map).
// The frozen look is not touched: the figures are drawn by the frozen rig (flat.ts) unchanged; what is new here sits on top of it.
import type { Face, Look } from "../designs/common";
import { ease } from "../stage/acting";
import { FM, D, figure, castAt, jointPx, scaleOf, footY, heightOf, type Cast, type Fig } from "../clips/clipKit";
import { Ink } from "../ink";
import SPEC from "./shots.json";
import N02 from "./cam/n02.json";
import N03 from "./cam/n03.json";
import N05 from "./cam/n05.json";

type G = CanvasRenderingContext2D;
type P2 = [number, number];
type Mat = number[][];
const CAMS: Record<string, Mat[]> = { n02: N02.frames, n03: N03.frames, n05: N05.frames };
export type ShotSpec = (typeof SPEC.shots)[number];
export const SHOTS3D: ShotSpec[] = SPEC.shots;
export const FIG_H = 1.75;      // a figure's height in metres (the rig's height 1.0 is this tall on the floor)
const smooth = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

/** the world point (x, y, z in metres) in picture pixels at frame fr of a shot, and its depth along the lens */
export const project = (id: string, fr: number, p: [number, number, number]): [number, number, number] => {
  const F = CAMS[id], P = F[Math.max(0, Math.min(F.length - 1, fr))];
  const v = [0, 1, 2].map((r) => P[r][0] * p[0] + P[r][1] * p[1] + P[r][2] * p[2] + P[r][3]);
  return [v[0] / v[2], v[1] / v[2], v[2]]; };

// ------------------------------------------------------------------ the people ------------------------------------------------------------------
/** the guard and the inmate as Looks on the rig (the same as in the flat Alcatraz, alcatraz.ts) */
export const GUARD: Look = { col: { coat: "#33456a", vest: "#33456a", shirt: "#dfe5ec", tie: "#1b2235", trous: "#2a3756", shoe: "#1d1a22", cap: "#2c3b5c", hair: "#8d8a86" }, band: "#15192a", badge: "#e8c45a", mono: false, pipe: false, brow: "#6e6a66" };
export const INMATE: Look = { col: { coat: "#7ea6cf", vest: "#9dbedd", shirt: "#9dbedd", tie: "#9dbedd", trous: "#33405a", shoe: "#26222a", cap: "#3a3f4c", hair: "#3a2a20" }, band: "#3a3f4c", mono: false, pipe: false, moustache: false };

/** a figure of a shot: who he is, his acting (the rig's mover) and where his feet are on the floor */
export type Who3 = { name: string; cast: Cast; at: [number, number]; plantDx?: number };
export const PLANT3 = { float: false, sink: false, behind: false, noShadow: false };      // the checks' planted faults (A3D_PLANT)

const guardN03 = (): Who3 => { const s = 1.4, m = figure("sir", 0, 32); m.stand(s + 1);
  // pleased with the count: a small smile and a nod, the eyes on the cell; then a glance back at it
  ease(m, -1, { head: [6, 4, 0] }, 0.01, { face: { pupil: 1, gaze: [-0.6, 0.1], smile: 0.3, lid: 0.05, brow: 0.35, mouth: 0 } });
  ease(m, 0.25, { head: [10, 10, 0] }, 0.45, { face: { pupil: 1, gaze: [-0.7, 0.2], smile: 0.45, lid: 0.1, brow: 0.45, mouth: 0 } });
  ease(m, 0.9, { head: [6, 2, 0] }, 0.45, { face: { pupil: 1, gaze: [-0.5, 0.0], smile: 0.4, lid: 0.05, brow: 0.35, mouth: 0 } });
  return { name: "guard", at: [-0.12, -0.62], cast: { name: "guard", m, who: "sir", look: GUARD, seed: 12, armWipe: false, hands: { L: [[0, "relaxed"]], R: [[0, "relaxed"]] } } }; };
const inmateN05 = (): Who3 => { const s = 2.5, m = figure("sir", 0, 10); m.stand(s + 1);
  // listening at the vent; the light comes; he freezes, eyes wide, shoulders up (over 0.5 s: no face jumps)
  ease(m, -1, { head: [0, 0, 0] }, 0.01, { face: { pupil: 1, gaze: [0.6, 0.2], lid: 0.1 } });
  ease(m, 0.9, { head: [-6, -4, 0], lean: -4 }, 0.5, { face: { pupil: 0.7, gaze: [0.8, 0.0], wide: 1, brow: 1, mouth: 0.18, smile: -0.5, lid: 0 } });
  return { name: "inmate", at: [0.30, 2.30], cast: { name: "inmate", m, who: "sir", look: INMATE, seed: 41, armWipe: false, hands: { L: [[0, "fist"]], R: [[0, "fist"]] } } }; };
export const WHO: Record<string, () => Who3[]> = { n01: () => [], n02: () => [], n03: () => [guardN03()], n04: () => [], n05: () => [inmateN05()] };

/** where a figure stands in the picture at frame fr: the screen point of his feet, his scale, and the 2D camera that draws him there */
export const atOf = (w: Who3): [number, number] => PLANT3.behind ? (w.name === "guard" ? [w.at[0], 0.45] : [-0.8, 2.85]) : w.at;
export const placeOf = (id: string, fr: number, w: Who3) => {
  const [x, y] = atOf(w), ft = project(id, fr, [x, y, 0]), hd = project(id, fr, [x, y, FIG_H]);
  const hpx = ft[1] - hd[1], z = hpx / (FM.PPM * heightOf(w.cast.who));
  const fx = FM.W / 2;      // the figure is made at x 0 m: its feet at the picture's middle in the rig's own world
  // (PLANT3.float / sink: the checks' planted faults, the feet drawn 10 px above the floor or 10 px into it)
  const dy = PLANT3.float ? -10 : PLANT3.sink ? 10 : 0;
  // (the rig's shoes stand on the ground line's top edge, FM.GY - FM.LINE / 2: that line is put on the projected floor point)
  return { foot: [ft[0], ft[1]] as P2, depth: ft[2], z, cx: fx - (ft[0] - FM.W / 2) / z, cy: LINE_TOP - (ft[1] + dy - FM.H / 2) / z, hpx }; };
export const LINE_TOP = FM.GY - FM.LINE / 2;

/** the contact shadow: a circle of 0.32 m on the floor round the feet, projected, soft */
export const shadowPoly = (id: string, fr: number, w: Who3): P2[] => { const [x, y] = atOf(w), pts: P2[] = [];
  for (let k = 0; k < 24; k++) { const a = (k / 24) * Math.PI * 2, p = project(id, fr, [x + Math.cos(a) * 0.32, y + Math.sin(a) * 0.22, 0]); pts.push([p[0], p[1]]); }
  return pts; };

/** the plate's light on a figure (cabin v5's card light): cold and dark over all, warm from the lamp's or the torch's side */
const cardLight = (g: G, warm: P2, r: number, a = 1) => {
  g.save(); g.globalCompositeOperation = "source-atop";
  g.fillStyle = `rgba(28,30,58,${0.30 * a})`; g.fillRect(0, 0, FM.W, FM.H);
  const gr = g.createRadialGradient(warm[0], warm[1], 0, warm[0], warm[1], r); gr.addColorStop(0, `rgba(255,169,94,${0.32 * a})`); gr.addColorStop(0.55, `rgba(255,169,94,${0.12 * a})`); gr.addColorStop(1, "rgba(255,169,94,0)");
  g.fillStyle = gr; g.fillRect(0, 0, FM.W, FM.H); g.restore(); };

let OFF: HTMLCanvasElement | OffscreenCanvas | null = null;
const off = () => { if (!OFF) OFF = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(FM.W, FM.H) : Object.assign(document.createElement("canvas"), { width: FM.W, height: FM.H }); return OFF; };

/** the figures of a shot at its frame fr, over the plate (already on the picture): shadow, figure, its light, its cartoon extras */
export const paintFigures = (g: G, id: string, fr: number, whos: Who3[], extra?: (g: G, f: Fig, pl: ReturnType<typeof placeOf>, t: number) => void) => {
  const t = fr / FM.FPS;
  for (const w of whos) {
    const pl = placeOf(id, fr, w), f = castAt([w.cast], t)[0];
    if (!PLANT3.noShadow) { const sp = shadowPoly(id, fr, w); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = "blur(6px)"; g.beginPath(); sp.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = "rgba(8,8,16,0.5)"; g.fill(); g.filter = "none"; g.restore(); }
    const o = off(), h = o.getContext("2d") as unknown as G; h.setTransform(1, 0, 0, 1, 0, 0); h.clearRect(0, 0, FM.W, FM.H);
    h.setTransform(pl.z, 0, 0, pl.z, FM.W / 2 - pl.z * pl.cx, FM.H / 2 - pl.z * pl.cy);
    const sc = scaleOf(f.who); h.save(); h.translate(f.x, footY(f.who)); h.scale(sc, sc); D.draw(new Ink(h, D.ol), f.sk, f.o); h.restore();
    h.setTransform(1, 0, 0, 1, 0, 0); const sh = SHOTS3D.find((s) => s.id === id)!;
    const lamp = project(id, fr, [1.35, -1.7, 2.35]), warm: P2 = lamp[2] > 0 ? [lamp[0], lamp[1]] : [pl.foot[0] + 600, pl.foot[1] - pl.hpx];
    cardLight(h, warm, 1500);
    if (sh.torch.power > 0 && id === "n05") { const u = smooth(fr / Math.max(1, Math.round((sh.t1 - sh.t0) * FM.FPS) - 1)), A = sh.torch.at, tp = project(id, fr, [lerp(A[0][0], A[1][0], u), lerp(A[0][1], A[1][1], u) - 0.6, lerp(A[0][2], A[1][2], u)]);
      h.save(); h.globalCompositeOperation = "source-atop"; const gr = h.createRadialGradient(tp[0], tp[1], 0, tp[0], tp[1], 380); gr.addColorStop(0, "rgba(255,226,176,0.22)"); gr.addColorStop(1, "rgba(255,226,176,0)"); h.fillStyle = gr; h.fillRect(0, 0, FM.W, FM.H); h.restore(); }
    if (extra) { h.setTransform(pl.z, 0, 0, pl.z, FM.W / 2 - pl.z * pl.cx, FM.H / 2 - pl.z * pl.cy); extra(h, f, pl, t); h.setTransform(1, 0, 0, 1, 0, 0); }
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(o as CanvasImageSource, 0, 0); g.restore();
  } };

/** the inmate's fright in shot 5, drawn over his own picture only: the face goes pale, sweat springs out at the temples and runs down */
export const fright = (h: G, f: Fig, pl: ReturnType<typeof placeOf>, t: number) => {
  // (the head's own radius from the rig, figBox's skull width: measured skull to crown it took in the cap and the body; and multiply, so the
  //  outlines stay dark and only the skin goes green: a see-through wash over the lines read as a ghost, my review of the style test v2)
  const s0 = jointPx(f, "skull"), c0 = jointPx(f, "crown"), sk: P2 = [(s0[0] + c0[0]) / 2, (s0[1] + c0[1]) / 2], hr = Math.hypot(c0[0] - s0[0], c0[1] - s0[1]) * 0.52, u = smooth((t - 1.0) / 0.5);
  if (u > 0) { const cv = h.canvas as HTMLCanvasElement, mk = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(cv.width, cv.height) : Object.assign(document.createElement("canvas"), { width: cv.width, height: cv.height });
    const m = mk.getContext("2d") as unknown as G; m.drawImage(cv as CanvasImageSource, 0, 0);      // the figure's own shape, to cut the tint back to it
    h.save(); h.beginPath(); h.ellipse(sk[0], sk[1], hr * 1.7, hr * 1.02, 0, 0, Math.PI * 2); h.clip(); h.beginPath(); h.rect(sk[0] - 2 * hr, sk[1] - hr * 0.52, 4 * hr, 3 * hr); h.clip(); h.globalCompositeOperation = "multiply";      // (the face and the ears, below the cap's brim)
    h.fillStyle = `rgba(196,236,204,${0.85 * u})`; h.fillRect(sk[0] - hr, sk[1] - hr, 2 * hr, 2 * hr); h.restore();
    h.save(); h.setTransform(1, 0, 0, 1, 0, 0); h.globalCompositeOperation = "destination-in"; h.drawImage(mk as CanvasImageSource, 0, 0); h.restore(); }
  // three drops, each born at the temple and running down 3-5 px a frame, then fading (never across the eyes)
  for (const [t0, side, dy0] of [[1.15, 1, -40], [1.35, -1, -30], [1.6, 1, -10]] as [number, number, number][]) { const a = t - t0; if (a < 0 || a > 0.9) continue;
    const x = sk[0] + side * hr * 0.8, y = sk[1] + hr * 0.1 + dy0 * 0.6 + a * 90, al = a < 0.15 ? a / 0.15 : a > 0.7 ? (0.9 - a) / 0.2 : 1;
    h.save(); h.globalAlpha = al; h.beginPath(); h.moveTo(x, y - 34); h.quadraticCurveTo(x + 18, y + 3, x, y + 15); h.quadraticCurveTo(x - 18, y + 3, x, y - 34); h.closePath();
    h.fillStyle = "#bfe6ff"; h.fill(); h.lineWidth = 4; h.strokeStyle = "#241726"; h.stroke(); h.restore(); } void pl; };

/** shot 3: the guard's torch, switched off, hanging from his belt at his right hip (he held it in shot 2: it does not vanish) */
export const beltTorch = (h: G, f: Fig) => {
  const hp = jointPx(f, "hipR"), hl = jointPx(f, "hipL"), w = Math.hypot(hp[0] - hl[0], hp[1] - hl[1]) || 60, x = hp[0] + (hp[0] - hl[0]) * 0.35, y = hp[1] - w * 0.05, L = w * 0.95, r = w * 0.17;
  h.save(); h.lineJoin = "round"; h.lineWidth = 8; h.strokeStyle = "#241726";
  h.fillStyle = "#3b3f48"; h.beginPath(); h.roundRect(x - r * 0.55, y - r * 0.3, r * 1.1, r * 0.7, 4); h.fill(); h.stroke();      // the belt clip
  h.fillStyle = "#59606c"; h.beginPath(); h.roundRect(x - r * 0.5, y, r, L, r * 0.4); h.fill(); h.stroke();                    // the barrel, hanging down
  h.fillStyle = "#8a8f99"; h.beginPath(); h.roundRect(x - r * 0.7, y + L - r * 0.3, r * 1.4, r * 0.9, r * 0.3); h.fill(); h.stroke();      // the head, its lens dark (off)
  h.restore(); };

/** the over-the-shoulder shot: the guard's back and cap close at the right edge, dark and out of focus (he is between the lens and the cell).
 *  Drawn in the picture's own pixels (it is a foreground mass at the edge, out of focus), moving a little against the lens's drift */
export const OTS = { head: [905, 820] as P2, r: 240 };
export const otsGuard = (g: G, id: string, fr: number) => {
  const k = fr / Math.max(1, CAMS[id].length - 1), hx = OTS.head[0] + 18 * smooth(k), hy = OTS.head[1] + 6 * smooth(k), r = OTS.r;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = "blur(16px)";
  // shoulder and back: one dark navy mass from the edge and the bottom; the neck; the cap's crown and its dark band
  g.fillStyle = "#1b2438"; g.beginPath(); g.moveTo(FM.W + 60, FM.H + 60); g.lineTo(hx - 1.9 * r, FM.H + 60); g.quadraticCurveTo(hx - 1.7 * r, hy + 1.25 * r, hx - 0.6 * r, hy + 1.05 * r);
  g.quadraticCurveTo(hx + 0.6 * r, hy + 0.85 * r, FM.W + 60, hy + 0.8 * r); g.closePath(); g.fill();
  g.fillStyle = "#a07a62"; g.beginPath(); g.ellipse(hx, hy + 0.78 * r, 0.3 * r, 0.42 * r, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#7d7a76"; g.beginPath(); g.ellipse(hx, hy + 0.38 * r, 0.68 * r, 0.42 * r, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#222e48"; g.beginPath(); g.ellipse(hx, hy + 0.1 * r, 0.82 * r, 0.75 * r, 0, Math.PI, 0); g.fill();
  g.fillStyle = "#11141f"; g.fillRect(hx - 0.82 * r, hy + 0.02 * r, 1.64 * r, 0.24 * r);
  g.filter = "none"; g.restore(); };

/** the torch's beam in the air (the plate has the light it throws; this is the dust it lights): from the guard's hand to the head */
export const beam = (g: G, a: P2, b: P2, r: number, al: number) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = "screen";
  for (const [w, k] of [[1, 0.10], [0.6, 0.10], [0.3, 0.12]] as [number, number][]) { const gr = g.createLinearGradient(a[0], a[1], b[0], b[1]); gr.addColorStop(0, `rgba(255,232,180,${k * 2 * al})`); gr.addColorStop(1, `rgba(255,232,180,${k * 0.4 * al})`);
    g.fillStyle = gr; g.beginPath(); g.moveTo(a[0] + nx * 6, a[1] + ny * 6); g.lineTo(b[0] + nx * r * w, b[1] + ny * r * w); g.lineTo(b[0] - nx * r * w, b[1] - ny * r * w); g.lineTo(a[0] - nx * 6, a[1] - ny * 6); g.closePath(); g.fill(); }
  g.restore(); };
export { lerp, smooth };

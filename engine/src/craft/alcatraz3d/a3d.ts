// Alcatraz in the new style: the flat Knopp figures standing on the floor of the Blender cell block (blender/alcatraz3d/set.py).
// A figure's foot is a point on the 3D floor; each frame's projection (cam/<id>.json, written by Blender) gives where that point and the
// top of his head fall in the picture, so the figure stands on the floor at the right size and moves with the plate when the lens moves
// (parallax). Under his feet a contact shadow: a circle on the floor, projected. Over him the plate's light (cabin v5's card light): the
// warm lamp's side warmer, the far side cold. Nothing stands in front of a figure (checked per frame against the floor and solid map).
// The frozen look is not touched: the figures are drawn by the frozen rig (flat.ts) unchanged; what is new here sits on top of it.
import type { Face, Look } from "../designs/common";
import { ease } from "../stage/acting";
import { FM, D, figure, castAt, jointPx, scaleOf, footY, heightOf, px, reach, poseAt, figBox, type Cast, type Fig } from "../clips/clipKit";
import { solve, type Pose } from "../rig";
import { mt } from "../stage/acting";
import { Ink } from "../ink";
import SPEC from "./film.json";
import { CAMS as CAMS0 } from "./cams";
import MOUTH_G01 from "./mouth-g01.json";
import MOUTH_G02 from "./mouth-g02.json";

type G = CanvasRenderingContext2D;
type P2 = [number, number];
type Mat = number[][];
const CAMS: Record<string, Mat[]> = CAMS0;
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
export type Who3 = { name: string; cast: Cast; at: [number, number]; torch?: boolean };
export const PLANT3 = { float: false, sink: false, behind: false, noShadow: false };      // the checks' planted faults (A3D_PLANT)

// the guard's torch in his right hand, aimed at the fake head (shots 2 and 3, the same hand, lit in both: the review of v3 points 2, 5, 16)
export const HEAD3: [number, number, number] = [-0.81, 0.82, 0.73];
const torchArm = (m: ReturnType<typeof figure>) => { let ref: Pose | null = null;
  return (t: number, p: Pose, heading: number): Pose => {
    if (!ref) { const a = poseAt({ name: "guard", m, who: "sir" }, 0), sk = solve(D.props("sir"), a.pose, heading), pel = sk.j.pelvis as unknown as number[], s = scaleOf("sir");
      const x = px(0), target: [number, number] = [x + pel[0] * s - 170, footY("sir") + pel[1] * s - 150];      // (at the chest: the bed below the hand, so the lamp points down at it, the review of v9 point 1)      // the hand in front of his chest, toward the cell
      ref = reach("sir", x, a.pose, a.heading, "R", target, false, { elbowBelow: true }); }
    return { ...p, armR: ref.armR }; }; };
const guard = (smileK: number, talk = false): Who3 => { const s = 1.6, m = figure("sir", 0, -38); m.stand(s + 1);
  // (the mouth shut when the narrator speaks: the frozen look's closed mouth; pleased by the eyes and brows)
  if (talk) {      // n02: his eyes go down to the bed as the lamp swings onto it; he says goodnight to it
    ease(m, -1, { head: [-8, 4, 0] }, 0.01, { face: { pupil: 1, gaze: [-0.6, 0.2], smile: 0.12, lid: 0.12, brow: 0.3, mouth: 0 } });
    ease(m, 0.1, { head: [-12, 12, 0] }, 0.6, { face: { pupil: 1, gaze: [-0.8, 0.6], smile: 0.15, lid: 0.18, brow: 0.35, mouth: 0 } });
  } else {         // n03: the lamp still on the bed; he looks round at us as the narrator says it was fake
    ease(m, -1, { head: [-12, 12, 0] }, 0.01, { face: { pupil: 1, gaze: [-0.8, 0.6], smile: 0, lid: 0.15, brow: 0.35, mouth: 0 } });
    ease(m, 0.2, { head: [-3, 3, 0] }, 0.55, { face: { pupil: 1, gaze: [0.15, 0.05], smile: 0, lid: 0.08, brow: 0.6, mouth: 0 } });
  }
  return { name: "guard", at: [0.78, -0.42], torch: true, cast: { name: "guard", m, who: "sir", look: GUARD, seed: 12, armWipe: false, pose: torchArm(m), hands: { L: [[0, "relaxed"]], R: [[0, "grip"]] }, ...(talk ? { mouth: { t0: 0, len: MOUTH_G01.mouth.length, mouth: MOUTH_G01.mouth } } : {}) } }; };
const inmateN05 = (): Who3 => { const m = figure("sir", 0, -90); m.stand(4);
  // (the approved react, no walk: a walk's arm swing at this size ran 30 px a frame and the flicker measure failed its frames)
  // listening at the vent, his head turned back to it; the light comes; his head swings round to it; he flinches back, the shoulders up, eyes
  // wide (every change over 0.5 s or more, the head trailing the body)
  ease(m, -1, { head: [26, 4, 0] }, 0.01, { face: { pupil: 1, gaze: [0.7, 0.25], lid: 0.1 } });
  ease(m, 0.3, { head: [30, 0, 0] }, 0.5, { face: { pupil: 1, gaze: [0.8, 0.1], brow: 0.5, lid: 0 } });
  ease(m, 0.95, { lean: -6, head: [34, -2, 0] }, 0.6, { face: { pupil: 0.7, gaze: [0.85, 0.0], wide: 1, brow: 1, mouth: 0.2, smile: -0.5, lid: 0 } });
  FRIGHT_AT.n05 = 1.05;
  return { name: "inmate", at: [0.30, 2.40], cast: { name: "inmate", m, who: "sir", look: INMATE, seed: 41, armWipe: false, hands: { L: [[0, "fist"]], R: [[0, "fist"]] } } }; };
// ------------------------------------------------------------------ the rest of the film's people ------------------------------------------------------------------
const lerpArm = (a: Pose["armL"], b: Pose["armL"], w: number): Pose["armL"] => [0, 1].map((i) => [0, 1].map((k) => a![i][k] + (b![i][k] - a![i][k]) * w)) as Pose["armL"];
const env = (t: number, a: number, up: number, b: number, down: number) => (t < a ? 0 : t < a + up ? smooth((t - a) / up) : t < b ? 1 : t < b + down ? 1 - smooth((t - b) / down) : 0);
/** n06: by the dug vent, proud: a look down at the hole, then at us with a grin and the brows up */
const inmateN06 = (): Who3 => { const m = figure("sir", 0, 22); m.stand(5);
  ease(m, -1, { head: [14, 12, 0] }, 0.01, { face: { pupil: 1, gaze: [0.6, 0.6], smile: 0.2 } });
  ease(m, 1.0, { head: [4, 0, 0] }, 0.6, { face: { pupil: 1, gaze: [0, 0], smile: 0.65, brow: 0.6 } });
  ease(m, 2.3, { head: [8, 4, 0] }, 0.6, { face: { pupil: 1, gaze: [0.4, 0.3], smile: 0.5, brow: 0.3 } });
  return { name: "inmate", at: [0.35, 2.35], cast: { name: "inmate", m, who: "sir", look: INMATE, seed: 41, armWipe: false, hands: { L: [[0, "fist"]], R: [[0, "fist"]] } } }; };
/** n07: points at the raft on the floor (the approved point: the eyes first, the arm up, held, down; the elbow a little bent) */
const RAFT7: [number, number, number] = [399.9, 0.6, 0.15];
const inmateN07 = (): Who3 => { const m = figure("sir", 0, -25); m.stand(5); const id = "n07";
  ease(m, -1, { head: [-6, 0, 0] }, 0.01, { face: { pupil: 1, smile: 0.3, gaze: [0, 0.05] } });
  ease(m, 0.3, { head: [-18, 14, 0] }, 0.35, { face: { pupil: 1, smile: 0.55, brow: 0.6, gaze: [-1, 0.7] } });
  ease(m, 2.0, { head: [-6, 2, 0] }, 0.45, { face: { pupil: 1, smile: 0.45, gaze: [0, 0.1] } });
  const UP = 0.55, HOLD0 = 0.95, HOLD1 = 1.8, DOWN = 2.3; let held: Pose["armR"] | null = null; const w3: Who3 = { name: "inmate", at: [400.75, 0.9], cast: null as unknown as Cast };
  const heldArm = () => { if (held) return held; const { pose: p, heading } = poseAt({ name: "inmate", m, who: "sir", seed: 7 }, HOLD0), sk = solve(D.props("sir"), p, heading), s = scaleOf("sir"), x = px(0);
    const sh = sk.j.shR as unknown as number[], shp: P2 = [x + sh[0] * s, footY("sir") + sh[1] * s], pl = placeOf(id, 0, w3), q = project(id, 0, RAFT7), tg = toRig(pl, [q[0], q[1]]);
    const P = D.props("sir"), armLen = (P.upper + P.fore + P.hand) * s, dx = tg[0] - shp[0], dy = tg[1] - shp[1], l = Math.hypot(dx, dy) || 1;
    held = reach("sir", x, p, heading, "R", [shp[0] + (dx / l) * 0.9 * armLen, shp[1] + (dy / l) * 0.9 * armLen], true, { bend: 22 }).armR; return held; };
  w3.cast = { name: "inmate", m, who: "sir", look: INMATE, seed: 7, armWipe: false, pose: (t: number, p: Pose) => { const w = env(t, UP, HOLD0 - UP, HOLD1, DOWN - HOLD1); return w <= 0 ? p : { ...p, armR: lerpArm(p.armR, heldArm(), w) }; },
    hands: { L: [[0, "relaxed"]], R: [[0, "relaxed"], [0.88, "point"], [1.9, "fist"]] } };
  return w3; };
/** n08: three men on the roof, crouched a little, looking round as the searchlight passes over them (different caps and hair: no clones) */
const roofMan = (i: number): Who3 => { const m = figure("sir", 0, [18, 0, -18][i]); m.stand(5);
  ease(m, -1, { lean: 14, head: [[-20, 6, 0], [0, 10, 0], [20, 6, 0]][i] as [number, number, number] }, 0.01, { face: { pupil: 1, gaze: [[-0.5, -0.4], [0, -0.6], [0.5, -0.4]][i] as P2, brow: 0.6 } });
  ease(m, 0.8 + i * 0.25, { lean: 18, head: [[-6, -4, 0], [10, -6, 0], [6, -4, 0]][i] as [number, number, number] }, 0.6, { face: { pupil: 0.8, gaze: [[0.2, -0.8], [0.4, -0.8], [-0.2, -0.8]][i] as P2, brow: 1, wide: 0.6 } });
  const look: Look = { ...INMATE, col: { ...INMATE.col!, ...[{}, { cap: "#4a3a2c", hair: "#5a3a24" }, { cap: "#3b4a40", hair: "#8a6a40" }][i] }, band: ["#3a3f4c", "#4a3a2c", "#3b4a40"][i] };
  return { name: `man${i + 1}`, at: [[99.15, -0.1], [100.0, 0.2], [100.85, -0.1]][i] as [number, number], cast: { name: `man${i + 1}`, m, who: "sir", look, seed: 20 + i, armWipe: false, hands: { L: [[0, "fist"]], R: [[0, "fist"]] } } }; };
/** n10: sunrise, the guard at the cell calls in (Daniel, "Rise and shine, sunshine.", the mouth from the take) */
const guardN10 = (): Who3 => { const m = figure("sir", 0, -38); m.stand(4);
  ease(m, -1, { head: [-10, 4, 0], lean: 3 }, 0.01, { face: { pupil: 1, gaze: [-0.75, 0.1], smile: 0.3, brow: 0.5 } });
  ease(m, 0.8, { head: [-14, 8, 0], lean: 6 }, 0.5, { face: { pupil: 1, gaze: [-0.8, 0.2], smile: 0.2, brow: 0.6 } });
  return { name: "guard", at: [0.78, -0.42], cast: { name: "guard", m, who: "sir", look: GUARD, seed: 12, armWipe: false, hands: { L: [[0, "relaxed"]], R: [[0, "relaxed"]] }, mouth: { t0: 0, len: MOUTH_G02.mouth.length, mouth: MOUTH_G02.mouth } } }; };
/** n11: close on the guard: it is a dummy; his face goes red, steam from his ears, the alarm's light pulsing (the cartoon exaggeration) */
const guardN11 = (): Who3 => { const m = figure("sir", 0, -20); m.stand(4);
  ease(m, -1, { head: [-6, 2, 0] }, 0.01, { face: { pupil: 1, gaze: [-0.6, 0.1], smile: 0.1 } });
  ease(m, 0.35, { head: [-2, -8, 0], lean: -8 }, 0.5, { face: { pupil: 0.6, gaze: [-0.3, 0], wide: 1, brow: 1, mouth: 0.4, smile: -0.6, lid: 0 } });
  return { name: "guard", at: [0.78, -0.42], cast: { name: "guard", m, who: "sir", look: GUARD, seed: 13, armWipe: false, hands: { L: [[0, "open"]], R: [[0, "open"]] } } }; };
export const FRIGHT_AT: Record<string, number> = { n05: 1.6, n11: 0.45 };
export const FRIGHT_COL: Record<string, [number, number, number]> = { n05: [186, 222, 190], n11: [226, 96, 80] };
export const WHO: Record<string, () => Who3[]> = { n01: () => [], n02: () => [guard(1, true)], n03: () => [guard(0)], n04: () => [], n05: () => [inmateN05()],
  n06: () => [inmateN06()], n07: () => [inmateN07()], n08: () => [roofMan(0), roofMan(1), roofMan(2)], n09: () => [], n10: () => [guardN10()], n11: () => [guardN11()], n12: () => [], n13: () => [], n14: () => [] };

/** where a figure stands in the picture at frame fr: the screen point of his feet, his scale, and the 2D camera that draws him there.
 *  A walking figure's feet move: the rig's own sideways travel, in metres, is added along the world's x */
export const atOf = (w: Who3): [number, number] => PLANT3.behind ? (w.name === "guard" ? [w.at[0], 0.45] : [-0.8, 2.85]) : w.at;
export const placeOf = (id: string, fr: number, w: Who3) => {
  const f = castAt([w.cast], fr / FM.FPS)[0], mpp = FIG_H / (FM.PPM * heightOf(w.cast.who)), walk = (f.x - FM.W / 2) * mpp;
  const [x0, y] = atOf(w), x = x0 + walk, ft = project(id, fr, [x, y, 0]), hd = project(id, fr, [x, y, FIG_H]);
  const hpx = ft[1] - hd[1], z = hpx / (FM.PPM * heightOf(w.cast.who));
  // (PLANT3.float / sink: the checks' planted faults, the feet drawn 10 px above the floor or 10 px into it)
  const dy = PLANT3.float ? -10 : PLANT3.sink ? 10 : 0;
  // (the rig's shoes stand on the ground line's top edge, FM.GY - FM.LINE / 2: that line is put on the projected floor point)
  return { foot: [ft[0], ft[1]] as P2, depth: ft[2], z, cx: f.x - (ft[0] - FM.W / 2) / z, cy: LINE_TOP - (ft[1] + dy - FM.H / 2) / z, hpx, world: [x, y] as P2, f, mpp }; };
export const LINE_TOP = FM.GY - FM.LINE / 2;

/** the torch in the hand (the grip rule: palm and thumb behind the barrel, the fingers wrapped over it in front), aimed at a picture point;
 *  drawn in the rig's world (the figure's transform). Returns the lens in the rig's world */
export const torchGeo = (f: Fig, aim: P2) => { const wr = jointPx(f, "wrR"), tp = jointPx(f, "tipR"), hc: P2 = [wr[0] + (tp[0] - wr[0]) * 0.45, wr[1] + (tp[1] - wr[1]) * 0.45];
  const a = Math.atan2(aim[1] - hc[1], aim[0] - hc[0]), L = 0.27 / FIG_H * FM.PPM * heightOf(f.who); return { hc, a, L, lens: [hc[0] + Math.cos(a) * L * 0.56, hc[1] + Math.sin(a) * L * 0.56] as P2 }; };
/** where the torch points at frame fr: Blender's torch target, eased over the shot as set.py eases it (so the lamp, the cone and the plate's spot agree) */
export const torchTarget = (id: string, fr: number): [number, number, number] => { const sh = SHOTS3D.find((s) => s.id === id)!, n = Math.round((sh.t1 - sh.t0) * FM.FPS), u = smooth(Math.min(1, fr / Math.max(1, n))), A = sh.torch.at;
  return [lerp(A[0][0], A[1][0], u), lerp(A[0][1], A[1][1], u), lerp(A[0][2], A[1][2], u)]; };
export const aimRig = (id: string, fr: number, pl: ReturnType<typeof placeOf>): P2 => { const q = project(id, fr, torchTarget(id, fr)); return toRig(pl, [q[0], q[1]]); };
export const torchGrip = (h: G, f: Fig, aim: P2, on: boolean): P2 => {
  const { hc, a, L } = torchGeo(f, aim), r = 15, ux = Math.cos(a), uy = Math.sin(a);
  h.save(); h.translate(hc[0], hc[1]); h.rotate(a); h.lineJoin = "round"; h.strokeStyle = "#241726"; h.lineWidth = 8;
  h.fillStyle = "#4a505c"; h.beginPath(); h.roundRect(-L * 0.45, -r, L * 0.82, 2 * r, r * 0.6); h.fill(); h.stroke();                  // the barrel
  h.fillStyle = "#7d8490"; h.beginPath(); h.roundRect(L * 0.32, -r * 1.45, L * 0.24, 2.9 * r, 6); h.fill(); h.stroke();                  // the head
  h.fillStyle = on ? "#fff3c4" : "#3a3f48"; h.beginPath(); h.roundRect(L * 0.52, -r * 1.2, 10, 2.4 * r, 4); h.fill(); h.stroke();       // the lens
  // the four fingers over the barrel, side by side along it, their tips curling round its far side out of sight
  h.fillStyle = "#f7c9a3"; h.lineWidth = 6;
  for (const dx of [-16, -3, 10, 23]) { h.beginPath(); h.roundRect(dx - 6, -r - 9, 13, 2 * r + 10, 6); h.fill(); h.stroke(); }
  h.restore(); return [hc[0] + ux * L * 0.56, hc[1] + uy * L * 0.56]; };

/** the contact shadow: a circle of 0.32 m on the floor round the feet, projected, soft */
export const shadowPoly = (id: string, fr: number, w: Who3): P2[] => { const [x, y] = placeOf(id, fr, w).world, pts: P2[] = [];
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
const toScreen = (pl: ReturnType<typeof placeOf>, q: P2): P2 => [pl.z * (q[0] - pl.cx) + FM.W / 2, pl.z * (q[1] - pl.cy) + FM.H / 2];
export const toRig = (pl: ReturnType<typeof placeOf>, q: P2): P2 => [(q[0] - FM.W / 2) / pl.z + pl.cx, (q[1] - FM.H / 2) / pl.z + pl.cy];
/** the torch's lens as a world point (for Blender's light): the rig's offsets from the feet, in metres, along the world's x and up */
export const lensWorld = (pl: ReturnType<typeof placeOf>, lens: P2): [number, number, number] => [pl.world[0] + (lens[0] - pl.f.x) * pl.mpp, pl.world[1] - 0.05, (LINE_TOP - lens[1]) * pl.mpp];
export const LENS: Record<string, { screen: P2; world: [number, number, number]; aim: P2; ang: number }[]> = {};

/** the figures of a shot at its frame fr, over the plate: shadow, figure, its light (on the fill only: the outlines keep the frozen look's
 *  ink, the review of v3 point 10), the fright on the head's skin only (point 11), then the things in front: the torch, the sweat */
export const paintFigures = (g: G, id: string, fr: number, whos: Who3[]) => {
  const t = fr / FM.FPS; LENS[id] = [];
  for (const w of whos) {
    const pl = placeOf(id, fr, w), f = pl.f;
    if (!PLANT3.noShadow) { const sp = shadowPoly(id, fr, w); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = "blur(6px)"; g.beginPath(); sp.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = "rgba(8,8,16,0.5)"; g.fill(); g.filter = "none"; g.restore(); }
    const o = off(), h = o.getContext("2d", { willReadFrequently: true }) as unknown as G; h.setTransform(1, 0, 0, 1, 0, 0); h.clearRect(0, 0, FM.W, FM.H);
    h.setTransform(pl.z, 0, 0, pl.z, FM.W / 2 - pl.z * pl.cx, FM.H / 2 - pl.z * pl.cy);
    const sc = scaleOf(f.who); h.save(); h.translate(f.x, footY(f.who)); h.scale(sc, sc); D.draw(new Ink(h, D.ol), f.sk, f.o); h.restore();
    h.setTransform(1, 0, 0, 1, 0, 0);
    // the box the figure covers, to read and write its pixels
    // (the whole picture: a box from figBox missed the cap's edge and drew a seam through it, the review of v9 point 2)
    const x0 = 0, y0 = 0, x1 = FM.W, y1 = FM.H; void figBoxScreen;
    const ww = Math.max(1, x1 - x0), hh = Math.max(1, y1 - y0), orig = h.getImageData(x0, y0, ww, hh);
    const sh = SHOTS3D.find((s) => s.id === id)!, lamp = project(id, fr, [1.35, -1.7, 2.35]), warm: P2 = lamp[2] > 0 ? [lamp[0], lamp[1]] : [pl.foot[0] + 600, pl.foot[1] - pl.hpx];
    cardLight(h, warm, 1500);
    if (sh.torch.power > 0 && id === "n05") { const u = smooth(fr / Math.max(1, Math.round((sh.t1 - sh.t0) * FM.FPS) - 1)), A = sh.torch.at, tp = project(id, fr, [lerp(A[0][0], A[1][0], u), lerp(A[0][1], A[1][1], u) - 0.6, lerp(A[0][2], A[1][2], u)]);
      h.save(); h.globalCompositeOperation = "source-atop"; const gr = h.createRadialGradient(tp[0], tp[1], 0, tp[0], tp[1], 380); gr.addColorStop(0, "rgba(255,226,176,0.22)"); gr.addColorStop(1, "rgba(255,226,176,0)"); h.fillStyle = gr; h.fillRect(0, 0, FM.W, FM.H); h.restore(); }
    // the pixels: the outlines back to their own ink; the fright's pale on the head's skin (ears too), nothing outside the head
    const lit = h.getImageData(x0, y0, ww, hh), O = orig.data, L = lit.data, fa = FRIGHT_AT[id], u = fa === undefined ? 0 : smooth((t - fa) / 0.9);
    const s0 = toScreen(pl, jointPx(f, "skull")), c0 = toScreen(pl, jointPx(f, "crown")), chin = s0[1] + 0.12 * Math.hypot(c0[0] - s0[0], c0[1] - s0[1]);
    for (let yy = 0; yy < hh; yy++) for (let xx = 0; xx < ww; xx++) { const k = (yy * ww + xx) * 4; if (O[k + 3] < 8) continue;
      const r = O[k], gg = O[k + 1], b = O[k + 2], lum = 0.3 * r + 0.59 * gg + 0.11 * b;
      if (Math.abs(r - 36) + Math.abs(gg - 23) + Math.abs(b - 38) < 46 || lum > 222) { L[k] = r; L[k + 1] = gg; L[k + 2] = b; L[k + 3] = O[k + 3]; continue; }
      if (u > 0 && y0 + yy < chin && r > gg && gg > b && r - b > 45 && lum > 120) { const m = 0.72 * u, C = FRIGHT_COL[id] ?? [186, 222, 190]; L[k] = L[k] * (1 - m) + C[0] * m; L[k + 1] = L[k + 1] * (1 - m) + C[1] * m; L[k + 2] = L[k + 2] * (1 - m) + C[2] * m; } }
    h.putImageData(lit, x0, y0);
    h.setTransform(pl.z, 0, 0, pl.z, FM.W / 2 - pl.z * pl.cx, FM.H / 2 - pl.z * pl.cy);
    if (w.torch) { const aim = aimRig(id, fr, pl), lens = torchGrip(h, f, aim, true), g0 = torchGeo(f, aim);
      LENS[id].push({ screen: toScreen(pl, lens), world: lensWorld(pl, lens), aim: toScreen(pl, aim), ang: g0.a }); }
    if (u > 0 && id === "n05") sweat(h, f, t - fa);
    if (u > 0 && id === "n11") steam(h, f, t - fa);
    h.setTransform(1, 0, 0, 1, 0, 0);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(o as CanvasImageSource, 0, 0); g.restore();
  } };
const figBoxScreen = (pl: ReturnType<typeof placeOf>, f: Fig): [number, number, number, number] => {
  const P = figBox(f).map((q) => toScreen(pl, q as P2)); return [Math.min(...P.map((q) => q[0])), Math.min(...P.map((q) => q[1])), Math.max(...P.map((q) => q[0])), Math.max(...P.map((q) => q[1]))]; };

/** the sweat of the fright: one drop at a time on each side, each born at the same place on the temple, running down the cheek inside the
 *  head's outline and gone before it nears the edge (the independent review points 18 and 19) */
export const sweat = (h: G, f: Fig, a0: number) => {
  const s0 = jointPx(f, "skull"), c0 = jointPx(f, "crown"), sk: P2 = [(s0[0] + c0[0]) / 2, (s0[1] + c0[1]) / 2], hr = Math.hypot(c0[0] - s0[0], c0[1] - s0[1]) * 0.52;
  for (const [t0, side] of [[0.25, 1], [0.95, 1]] as [number, number][])      /* (his far cheek only: he faces left, so a drop on the near side ran onto his nose) */ { const a = a0 - t0; if (a < 0 || a > 0.62) continue;
    const x = sk[0] + side * hr * 0.38, y = sk[1] + hr * 0.2 + (a / 0.62) * hr * 0.3,      /* (below the eyes, on the lower cheek, inside the head) */ al = a < 0.25 ? a / 0.25 : a > 0.42 ? (0.62 - a) / 0.2 : 1, d = hr * 0.11;
    h.save(); h.globalAlpha = Math.max(0, Math.min(1, al)); h.beginPath(); h.moveTo(x, y - d * 1.8); h.quadraticCurveTo(x + d, y + d * 0.2, x, y + d * 0.8); h.quadraticCurveTo(x - d, y + d * 0.2, x, y - d * 1.8); h.closePath();
    h.fillStyle = "#bfe6ff"; h.fill(); h.lineWidth = 5; h.strokeStyle = "#241726"; h.stroke(); h.restore(); } };

/** n11: steam from both ears, puffs rising slowly and fading (each born at the ear, 0.6 s, at most 6 px a frame) */
export const steam = (h: G, f: Fig, a0: number) => {
  const s0 = jointPx(f, "skull"), c0 = jointPx(f, "crown"), sk: P2 = [(s0[0] + c0[0]) / 2, (s0[1] + c0[1]) / 2], hr = Math.hypot(c0[0] - s0[0], c0[1] - s0[1]) * 0.52;
  for (let k = 0; k < 8; k++) { const t0 = 0.15 + k * 0.22, a = a0 - t0; if (a < 0 || a > 0.9) continue; const side = k % 2 ? 1 : -1;
    const x = sk[0] + side * (hr * 1.05 + a * 70), y = sk[1] + hr * 0.05 - a * 150, r = hr * (0.13 + a * 0.22), al = (a < 0.15 ? a / 0.15 : 1) * (1 - a / 0.9);
    h.save(); h.globalAlpha = Math.max(0, al) * 0.9; h.fillStyle = "#f2f2f4"; h.lineWidth = 5; h.strokeStyle = "#241726";
    h.beginPath(); h.arc(x, y, r, 0, Math.PI * 2); h.arc(x + r * 0.7, y - r * 0.4, r * 0.75, 0, Math.PI * 2); h.fill(); h.stroke(); h.restore(); } };

/** the torch's beam in the air, from the lens to the bars (beyond them the plate's own light carries it: the beam starts in front of the bars
 *  at the lamp, the independent review point 17) */
export const beamTo = (g: G, id: string, fr: number) => {
  // (a soft cone along the lamp's own axis, from the lens to the bars, widening and fading; the plate's spot lies where the axis meets the bed:
  //  a thin upright stick from the lens read as a wick, the review of v9 point 1)
  for (const L of LENS[id] ?? []) { const a = L.world, b = torchTarget(id, fr), k = Math.min(1, (0 - a[1]) / ((b[1] - a[1]) || 1e-6)), mw: [number, number, number] = [a[0] + (b[0] - a[0]) * k, 0, a[2] + (b[2] - a[2]) * k], q = project(id, fr, mw);
    const A = L.screen, len = Math.max(60, Math.hypot(q[0] - A[0], q[1] - A[1])), ux = Math.cos(L.ang), uy = Math.sin(L.ang), nx = -uy, ny = ux, B: P2 = [A[0] + ux * len, A[1] + uy * len], r0 = 16, r1 = Math.max(60, len * 0.26);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = "screen"; g.filter = "blur(6px)";
    for (const [w, k2] of [[1, 0.09], [0.6, 0.11]] as [number, number][]) { const gr = g.createLinearGradient(A[0], A[1], B[0], B[1]); gr.addColorStop(0, `rgba(255,236,190,${k2 * 2})`); gr.addColorStop(1, "rgba(255,236,190,0)");
      g.fillStyle = gr; g.beginPath(); g.moveTo(A[0] + nx * r0 * w, A[1] + ny * r0 * w); g.lineTo(B[0] + nx * r1 * w, B[1] + ny * r1 * w); g.lineTo(B[0] - nx * r1 * w, B[1] - ny * r1 * w); g.lineTo(A[0] - nx * r0 * w, A[1] - ny * r0 * w); g.closePath(); g.fill(); }
    g.filter = "none"; g.restore(); } };
export { lerp, smooth };

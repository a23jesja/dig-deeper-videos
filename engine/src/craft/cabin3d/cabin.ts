// 3D step 1 (23 Nov 2026, night): the captain and the cabin boy, flat Knopp figures (the frozen rig, unchanged), standing on the floor of the
// Blender cabin (blender/cabin/set.py). Each frame's projection (cam/<id>.json, written by Blender) puts a figure's feet on their floor point
// and his head at 1.75 m above it, so he stands in the room at its size and moves with the plate as the lens drifts. Under each foot a soft
// contact shadow on the floor. Over him the cabin's light: the low evening sun is behind him (the stern windows), so his front is in the
// warm shade and a warm rim runs along his window side; the ink keeps the frozen look's colour.
// The joke (both lines [OWN], no fact): "Boy! Where is my treasure map?" (George) - "You're standing on it, Captain." (Daniel).
import type { Face, Look } from "../designs/common";
import { ease } from "../stage/acting";
import { FM, D, figure, castAt, jointPx, scaleOf, footY, heightOf, px, reach, poseAt, type Cast, type Fig } from "../clips/clipKit";
import { solve, type Pose } from "../rig";
import { Ink } from "../ink";
import { mouthAt } from "../motion";
import SPEC from "./shots.json";
import CAM_A from "./cam/A.json";
import CAM_B from "./cam/B.json";
import CAM_A2 from "./cam/A2.json";
import CAM_E from "./cam/E.json";
import CAM_D from "./cam/D.json";
import C01 from "../../../voice/cabin/c01/pick.json";
import C02 from "../../../voice/cabin/c02/pick.json";
import { DRAWN } from "../alcatraz/alcatraz";

type G = CanvasRenderingContext2D;
type P2 = [number, number];
type Mat = number[][];
const CAMS: Record<string, Mat[]> = { A: CAM_A.frames, A2: CAM_A2.frames, B: CAM_B.frames, E: CAM_E.frames, D: CAM_D.frames };
export type Shot3 = (typeof SPEC.shots)[number];
export const SHOTS: Shot3[] = SPEC.shots;
export const FIG_H = 1.75;
export const FIGS = SPEC.figs as unknown as Record<string, [number, number]>;
const smooth = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const env = (t: number, a: number, up: number, b: number, down: number) => (t < a ? 0 : t < a + up ? smooth((t - a) / up) : t < b ? 1 : t < b + down ? 1 - smooth((t - b) / down) : 0);
const lerpArm = (a: Pose["armL"], b: Pose["armL"], w: number): Pose["armL"] => [0, 1].map((i) => [0, 1].map((k) => a![i][k] + (b![i][k] - a![i][k]) * w)) as Pose["armL"];

/** a world point (metres) in picture pixels at frame fr of a shot, and its depth along the lens */
export const project = (id: string, fr: number, p: [number, number, number]): [number, number, number] => {
  const F = CAMS[id], P = F[Math.max(0, Math.min(F.length - 1, fr))];
  const v = [0, 1, 2].map((r) => P[r][0] * p[0] + P[r][1] * p[1] + P[r][2] * p[2] + P[r][3]);
  return [v[0] / v[2], v[1] / v[2], v[2]]; };

// ------------------------------------------------------------------ the two of them ------------------------------------------------------------------
/** the captain: a deep blue coat with a red waistcoat, a black cap, a dark beard-less moustache (the frozen rig's own parts, recoloured) */
export const CAPTAIN: Look = { col: { coat: "#24305a", vest: "#a3262e", shirt: "#f1ead8", tie: "#f1ead8", trous: "#2a2a34", shoe: "#1b1820", cap: "#1d1d26", hair: "#3a2a20" }, band: "#c9a24a", mono: false, pipe: false };
/** the cabin boy: a striped-blue shirt colour, brown trousers, a red cap, clean-shaven */
export const BOY: Look = { col: { coat: "#5b86b8", vest: "#7aa2cf", shirt: "#f4f0e6", tie: "#7aa2cf", trous: "#6a4a32", shoe: "#3a2a20", cap: "#b8343a", hair: "#7a4a26" }, band: "#8a2228", mono: false, pipe: false, moustache: false };

/** the mouth from a take's word times (pick.json), each frame's change at most 0.12 (the flicker rule), shut outside the words */
const mouthTrack = (words: { w: string; a: number; b: number }[], t0: number, n: number): number[] => {
  const raw: number[] = []; for (let f = 0; f < n; f++) { const t = f / FM.FPS - t0; raw.push(t < 0 ? 0 : mouthAt(words, t) * 0.9); }
  // (a mouth that shuts for one or two frames between syllables and opens again flickers (the flicker check, v2-v3): each frame takes the
  //  smaller of the largest openings within two frames either side, so a gap of up to four frames is bridged; then at most 0.1 a frame)
  const mx = raw.map((_, f) => Math.max(...raw.slice(Math.max(0, f - 2), f + 3))), cl0 = mx.map((_, f) => Math.min(...mx.slice(Math.max(0, f - 2), f + 3)));
  // (and a one-frame peak is taken down the same way, then the whole softened over five frames: a mouth that crossed a drawing's step and
  //  back in one frame flickered, v6)
  const mn = cl0.map((_, f) => Math.min(...cl0.slice(Math.max(0, f - 1), f + 2))), op = mn.map((_, f) => Math.max(...mn.slice(Math.max(0, f - 1), f + 2))), K5 = [1, 4, 6, 4, 1];
  const cl = op.map((_, f) => { let a = 0, wsum = 0; for (let d = -2; d <= 2; d++) { const q = op[f + d]; if (q === undefined) continue; a += K5[d + 2] * q; wsum += K5[d + 2]; } return a / wsum; });
  const out: number[] = []; let prev = 0; for (let f = 0; f < n; f++) { const v = prev + Math.max(-0.1, Math.min(0.1, cl[f] - prev)); out.push(v); prev = v; } return out; };

/** h = his height in metres; sil = drawn as a dark silhouette (the over-the-shoulder foreground) */
export type Who3 = { name: string; cast: Cast; at: [number, number]; h: number; rimSide: 1 | -1; redAt?: number; sweatAt?: number; sil?: boolean };
export const HEIGHTS = (SPEC as unknown as { heights: Record<string, number> }).heights;
/** the 2D camera that puts a standing figure (drawn at px(0)) with his feet on the floor point (x, y) and his head h above it, at frame fr */
/** (a shot may scale its figures at their feet: "scaleAt": "feet" in shots.json. Seen close and from above, the flat card's full height
 *  projects with a huge perspective (his head nearly level with the lens), so the boots were drawn ten times too big in v18's first E;
 *  measured over the lowest 0.15 m, the part in the picture is the right size) */
const SCALE_AT: Record<string, string> = Object.fromEntries(SPEC.shots.map((q) => [q.id, (q as { scaleAt?: string }).scaleAt ?? "height"]));
export const geo = (id: string, fr: number, at: [number, number], h: number, dy = 0) => { const ft = project(id, fr, [at[0], at[1], 0]), feetOnly = SCALE_AT[id] === "feet", hh = feetOnly ? 0.15 : h, hd = project(id, fr, [at[0], at[1], hh]);
  const z = (ft[1] - hd[1]) / (FM.PPM * heightOf("sir") * (hh / h)); return { foot: [ft[0], ft[1]] as P2, depth: ft[2], z, cx: px(0) - (ft[0] - FM.W / 2) / z, cy: footY("sir") - (ft[1] + dy - FM.H / 2) / z, hpx: ft[1] - hd[1] }; };      // (the rig's soles are drawn at footY: that line on the floor point)
/** a world point in the figure's own drawing space (so a hand can be put on a thing in the room) */
export const toLocal = (id: string, fr: number, at: [number, number], h: number, p: [number, number, number]): P2 => { const G0 = geo(id, fr, at, h), q = project(id, fr, p); return [(q[0] - FM.W / 2) / G0.z + G0.cx, (q[1] - FM.H / 2) / G0.z + G0.cy]; };
/** the checks' planted faults (scripts/cabin_check.mjs) */
export const PLANT = { float: false, sink: false, slide: false, lean: false, fgOverFace: false };

/** v18 (after v17's reviews): five short shots, a strong pose in each, the joke shown in the picture.
 *  (seeds 1, 2 and 12 give no blink inside these shots: a blink while a face changes flickers; pupils one size; wide under 0.5 and the lid
 *   unchanged (past 0.5 the rig opens the lid in one frame); gaze down at most 0.7 (the pupil left the eye at 1); every move slow enough for
 *   the flicker rule's ~11 px a frame: scripts/cabin_check.mjs measures each joint and the face's slide) */
const ARMS_OUT: [Seg2, Seg2] = [[6, 34], [46, 20]];
type Seg2 = [number, number];
/** a fist on the hip (the elbow out to the side, the forearm bent back to the waist) */
export const AKIMBO: [Seg2, Seg2] = [[14, 46], [120, 40]];
const armsTo = (from: number, dur: number, L?: [Seg2, Seg2], R?: [Seg2, Seg2]) => (t: number, p: Pose): Pose => { const w = env(t, from, dur, 99, 0); if (w <= 0) return p;
  return { ...p, ...(L ? { armL: lerpArm(p.armL, L, w) } : {}), ...(R ? { armR: lerpArm(p.armR, R, w) } : {}) }; };
/** A (0-1.3 s): the captain at the chart table, his head down over it; his right hand on the papers sweeps them off the table's left end
 *  (0.15-0.75: the arm swings out 8 degrees, the papers fly from under it, set.py), his eyes come up (0.8) and his head begins to turn
 *  toward the boy as he shouts "Boy!" (1.0) */
const captainA = (): Who3 => { const s = 1.3, m = figure("sir", 0, 0); m.stand(s + 1);
  ease(m, -1, { head: [-6, 24, 0], lean: 10, roll: -5 }, 0.01, { face: { pupil: 1, gaze: [-0.8, 0.7], brow: -0.6, smile: -0.2, lid: 0.2 } });
  ease(m, 0.15, { head: [-8, 26, -4], lean: 12, roll: -7 }, 0.55, { face: { pupil: 1, gaze: [-0.9, 0.7], brow: -0.9, smile: -0.4, lid: 0.25 } });
  ease(m, 0.75, { head: [-8, 26, -4], lean: 12, roll: -7 }, 0.4, { face: { pupil: 1, gaze: [0.7, -0.1], brow: -1, smile: -0.6, wide: 0.25, lid: 0 } });
  ease(m, 1.0, { head: [0, 8, 0], lean: 4, roll: -2 }, 0.6, { face: { pupil: 1, gaze: [0.7, -0.1], brow: -1, smile: -0.6, wide: 0.25, lid: 0 } });
  // (the sweep: the arm out from 46 to 54 degrees over 0.6 s, its forearm with it; the hand stays at the table top's height)
  const sweep = (t: number, p: Pose): Pose => { const u = smooth((t - 0.15) / 0.6), o = 46 + 8 * u, arm: Pose["armR"] = [[10, o], [18, o - 4]]; return { ...p, armR: arm }; };
  return { name: "captain", at: FIGS.captain, h: HEIGHTS.captain, rimSide: 1, cast: { name: "captain", m, who: "sir", look: CAPTAIN, seed: 1, armWipe: false, pose: (t, p) => sweep(t, p),
    hands: { L: [[0, "relaxed"]], R: [[0, "relaxed"]] }, mouth: { t0: 0, len: 39, mouth: mouthTrack(C01.words, 1.0, 39) } } }; };
/** A2 (1.3-2.7 s): low, three-quarter: turned toward the boy (heading 35), both arms thrown out, leaning in as he shouts "Where is my
 *  treasure map?"; at 0.5 he leans further in and his brows come down harder */
const captainA2 = (): Who3 => { const s = 1.4, m = figure("sir", 0, 35); m.stand(s + 1);
  ease(m, -1, { head: [8, -8, 3], lean: 4 }, 0.01, { face: { pupil: 1, gaze: [0.3, -0.2], brow: -1, smile: -0.7, wide: 0.3, lid: 0 } });
  ease(m, 0.45, { head: [12, -4, 6], lean: 9 }, 0.8, { face: { pupil: 1, gaze: [0.3, -0.1], brow: -1, smile: -0.8, wide: 0.35, lid: 0 } });
  const arms = (t: number, p: Pose): Pose => ({ ...p, armL: ARMS_OUT, armR: ARMS_OUT });
  return { name: "captain", at: FIGS.captain, h: HEIGHTS.captain, rimSide: 1, cast: { name: "captain", m, who: "sir", look: CAPTAIN, seed: 1, armWipe: false, pose: arms,
    hands: { L: [[0, "open"]], R: [[0, "open"]] }, mouth: { t0: 0, len: 42, mouth: mouthTrack(C01.words, -0.3, 42) } } }; };
/** B (2.7-4.4 s): high over the captain's left shoulder: the boy looks down at the captain's boots (0-0.6), points at them (0.05-1.15),
 *  answers (0.15), grins (1.0) */
const boyB = (): Who3 => { const s = 1.7, m = figure("sir", 0, -26); m.stand(s + 1);
  ease(m, -1, { head: [-6, 0, 0] }, 0.01, { face: { pupil: 1, gaze: [-0.6, 0], smile: 0.1, brow: 0.6 } });
  ease(m, 0.0, { head: [-6, 16, 0], lean: 6 }, 0.6, { face: { pupil: 1, gaze: [-0.7, 0.7], smile: 0.2, brow: 0.4 } });
  ease(m, 1.0, { head: [-8, 4, 4], lean: -3, roll: -4 }, 0.65, { face: { pupil: 1, gaze: [-0.6, 0.3], smile: 1, brow: 0.7, lid: 0.25 } });
  // (the finger aims at the captain's right boot on the floor, projected into his drawing: the arm straight out toward it, raised over 1.1 s)
  const point = (t: number, p: Pose, heading: number): Pose => { const w = env(t, 0.05, 1.1, 99, 0); if (w <= 0) return p;
    const q = toLocal("B", Math.round(t * FM.FPS), FIGS.boy, HEIGHTS.boy, [FIGS.captain[0] - 0.08, FIGS.captain[1], 0.05]), r = reach("sir", px(0), p, heading, "R", q, true, { bend: 12 }); return { ...p, armR: lerpArm(p.armR, r.armR, w) }; };
  return { name: "boy", at: FIGS.boy, h: HEIGHTS.boy, rimSide: -1, cast: { name: "boy", m, who: "sir", look: BOY, seed: 2, armWipe: false, pose: point,
    hands: { L: [[0, "relaxed"]], R: [[0, "relaxed"], [0.45, "point"]] }, mouth: { t0: 0, len: 51, mouth: mouthTrack(C02.words, 0.18, 51) } } }; };
/** B: the captain from behind, the dark shape in front: he looks down at his boots as the boy points (0.55) */
const captainB = (): Who3 => { const s = 1.7, m = figure("sir", 0, 0); m.stand(s + 1);
  ease(m, -1, { head: [0, 0, 0] }, 0.01, {}); ease(m, 0.55, { head: [0, 14, 0], lean: 4 }, 0.6, {});
  return { name: "captain", at: FIGS.captain, h: HEIGHTS.captain, rimSide: 1, sil: true, cast: { name: "captain", m, who: "sir", look: { ...CAPTAIN, moustache: false }, seed: 13, armWipe: false, hands: { L: [[0, "relaxed"]], R: [[0, "relaxed"]] } } }; };
/** the lifted boot's free leg (thigh and shin directions, the foot's pitch): the sole 2-3 cm off the floor (the standing leg is a little
 *  bent, so a straight free leg would reach into the floor) */
export const LIFT_LEG: { th: [number, number]; sh: [number, number]; pitch: number } = { th: [14, 26], sh: [-24, 0], pitch: 0 };      // (3.4 cm up and 7 cm out to his side, so the X under it shows: the search of 23 Nov, v18)
/** E (4.4-5.5 s): his boots on the map, close: his hip goes over the left foot (0-0.25), the right boot lifts 2.5 cm (0.25-0.85) and the
 *  red X shows under it. (the pelvis lowered a little on purpose: left to the rig, it was lowered onto both feet and stopped being so when
 *  the boot came off the floor, a kink in the body's movement, v13) */
const captainE = (): Who3 => { const s = 1.1, m = figure("sir", 0, 0); m.stand(s + 1); const PY = -0.03;
  const LIFT = PLANT.float ? { th: [LIFT_LEG.th[0] + 40, LIFT_LEG.th[1]], sh: [LIFT_LEG.sh[0] + 20, 0], pitch: LIFT_LEG.pitch } : LIFT_LEG;
  const HIP = PLANT.lean ? -0.07 : 0.06;      // (px > 0 moves his pelvis over his left foot, the one that stays down: the check's weight test)
  ease(m, -1, { head: [0, 14, 0], lean: 4, py: PY }, 0.01, {});
  ease(m, 0.0, { head: [0, 14, 0], lean: 4, px: HIP, py: PY }, 0.25, {});
  ease(m, 0.2, { head: [0, 14, 0], lean: 4, px: HIP, py: PY, legR: LIFT } as Partial<Pose>, 0.85, {});
  // (both fists on his hips, as he stands over the map: his hands up at his waist, out of the close picture of his boots)
  const akimbo = (t: number, p: Pose): Pose => ({ ...p, armL: AKIMBO, armR: AKIMBO });
  return { name: "captain", at: FIGS.captain, h: HEIGHTS.captain, rimSide: 1, cast: { name: "captain", m, who: "sir", look: CAPTAIN, seed: 12, armWipe: false, pose: akimbo, hands: { L: [[0, "fist"]], R: [[0, "fist"]] } } }; };
/** D (5.5-7.0 s): three-quarter, waist up (heading 35): he looks down at his boot, then up at the boy (0.3-1.0); his face goes red (0.15),
 *  sweat (0.4); a sheepish grin (0.8); his left fist on his hip, his right hand coming up open, a small "oh well" (0.5-1.3) */
const captainD = (): Who3 => { const s = 1.5, m = figure("sir", 0, 35); m.stand(s + 1);
  ease(m, -1, { head: [0, 18, 0], lean: 4 }, 0.01, { face: { pupil: 1, gaze: [0, 0.7], brow: 0.8, wide: 0.45, smile: -0.4, mouth: 0.35 } });
  ease(m, 0.3, { head: [0, 18, 0], lean: 4 }, 0.35, { face: { pupil: 1, gaze: [0.6, 0], brow: 0.8, wide: 0.45, smile: -0.5, mouth: 0.3 } });
  ease(m, 0.55, { head: [10, 2, -4], lean: 0 }, 0.8, { face: { pupil: 1, gaze: [0.6, 0], brow: 0.7, wide: 0.45, smile: -0.2, mouth: 0.25 } });
  ease(m, 0.65, { head: [10, 2, -4], lean: 0 }, 0.85, { face: { pupil: 1, gaze: [0.6, 0], brow: 0.6, smile: 0.7, teeth: 1, mouth: 0.25 } });      // (0.85 s: faster, the grin's eye change flickered, v18)
  const arms = (t: number, p: Pose): Pose => armsTo(0.4, 1.05, undefined, [[8, 18], [56, 12]])(t, { ...p, armL: AKIMBO });
  return { name: "captain", at: FIGS.captain, h: HEIGHTS.captain, rimSide: 1, redAt: 0.15, sweatAt: 0.4, cast: { name: "captain", m, who: "sir", look: CAPTAIN, seed: 12, armWipe: false, pose: arms,
    hands: { L: [[0, "fist"]], R: [[0, "open"]] } } }; };
export const WHO: Record<string, () => Who3[]> = { A: () => [captainA()], A2: () => [captainA2()], B: () => [captainB(), boyB()], E: () => [captainE()], D: () => [captainD()] };
export const TABLE_TOP = 0.488;

// ------------------------------------------------------------------ placing and painting ------------------------------------------------------------------
export const LINE_TOP = FM.GY - FM.LINE / 2;
/** where a figure stands in the picture at frame fr: the screen point of his feet, his scale, and the 2D camera that draws him there */
export const placeOf = (id: string, fr: number, w: Who3) => { const f = castAt([w.cast], fr / FM.FPS)[0];
  // (planted faults for the checks: a figure skating 2 mm a frame; the captain in front moved 35 cm over the boy)
  const at: [number, number] = [w.at[0] + (PLANT.slide && !w.sil ? 0.002 * fr : 0) + (PLANT.fgOverFace && w.sil ? 0.35 : 0), w.at[1]];
  return { ...geo(id, fr, at, w.h, PLANT.sink ? 10 : 0), f }; };
export const toScreen = (pl: ReturnType<typeof placeOf>, q: P2): P2 => [pl.z * (q[0] - pl.cx) + FM.W / 2, pl.z * (q[1] - pl.cy) + FM.H / 2];
/** each foot's world point on the floor (metres), from the rig's sole: its sideways offset and its height above the ground */
export const feetOf = (id: string, fr: number, w: Who3) => { const pl = placeOf(id, fr, w), mpp = w.h / (FM.PPM * heightOf(w.cast.who)), ax = w.at[0] + (PLANT.slide && !w.sil ? 0.002 * fr : 0);
  return (["L", "R"] as const).map((sd) => { const an = jointPx(pl.f, "an" + sd), he = jointPx(pl.f, "heel" + sd), to = jointPx(pl.f, "toe" + sd), sx = (an[0] - pl.f.x) * mpp, up = (footY(pl.f.who) - Math.max(he[1], to[1])) * mpp; return { side: sd, world: [ax + sx, w.at[1]] as P2, up, screen: toScreen(pl, an) }; }); };

let OFF: OffscreenCanvas | HTMLCanvasElement | null = null;
const off = () => { if (!OFF) OFF = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(FM.W, FM.H) : Object.assign(document.createElement("canvas"), { width: FM.W, height: FM.H }); return OFF; };

/** the lens's blur (circle of confusion, px) for a thing at depth d when the shot is focused on its focus figure's head: the same optics as
 *  Blender's depth of field on the plate (sensor 24 mm high = 1920 px) */
export const cocPx = (id: string, fr: number, d: number) => { const S = SHOTS.find((q) => q.id === id)!, fo = FIGS[S.cam.focus], sF = project(id, fr, [fo[0], fo[1], 1.4])[2] * 1000, f = S.cam.lens, N = S.cam.fstop;
  return ((f * f) / (N * (sF - f))) * (Math.abs(d * 1000 - sF) / (d * 1000)) * (FM.H / 24); };
/** a box blur of an RGBA picture in place (premultiplied, two passes each way): the soft edge of the dark shape in front */
const softEdge = (D: Uint8ClampedArray, W: number, H: number, r: number) => { const N = W * H, a = new Float32Array(N * 4), b = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) { const al = D[i * 4 + 3] / 255; a[i * 4] = D[i * 4] * al; a[i * 4 + 1] = D[i * 4 + 1] * al; a[i * 4 + 2] = D[i * 4 + 2] * al; a[i * 4 + 3] = D[i * 4 + 3]; }
  const pass = (src: Float32Array, dst: Float32Array, horiz: boolean) => { const n = horiz ? W : H, m = horiz ? H : W, st = horiz ? 4 : W * 4, inv = 1 / (2 * r + 1);
    for (let l = 0; l < m; l++) { const base = horiz ? l * W * 4 : l * 4; for (let ch = 0; ch < 4; ch++) { let acc = 0; for (let q = -r; q <= r; q++) acc += src[base + Math.min(n - 1, Math.max(0, q)) * st + ch];
        for (let q = 0; q < n; q++) { dst[base + q * st + ch] = acc * inv; acc += src[base + Math.min(n - 1, q + r + 1) * st + ch] - src[base + Math.max(0, q - r) * st + ch]; } } } };
  pass(a, b, true); pass(b, a, false); pass(a, b, true); pass(b, a, false);
  for (let i = 0; i < N; i++) { const al = a[i * 4 + 3]; D[i * 4 + 3] = al; if (al > 0.5) { const f = 255 / al; D[i * 4] = a[i * 4] * f; D[i * 4 + 1] = a[i * 4 + 1] * f; D[i * 4 + 2] = a[i * 4 + 2] * f; } } };
/** the camera's place in the room at frame fr (the centre of the projection 3x4: the point the matrix sends to nothing) */
const camAt = (id: string, fr: number): [number, number, number] => { const F = CAMS[id], P = F[Math.max(0, Math.min(F.length - 1, fr))];
  const a = P[0], b = P[1], c = P[2], det = (m: number[][]) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const M = [a.slice(0, 3), b.slice(0, 3), c.slice(0, 3)], r = [-a[3], -b[3], -c[3]], D0 = det(M);
  const col = (k: number) => det(M.map((row, i) => row.map((v, j) => (j === k ? r[i] : v)))) / D0; return [col(0), col(1), col(2)]; };
/** the low sun through the stern windows (set.py: rays going toward -y and down, 0.42 down for each 1 along): a point at height z casts its
 *  shadow 2.38 z toward the lens side of the room. The floor is in sun where a ray back toward the sun passes a window pane: the panes
 *  (each window's two columns and three rows, between its mullions) drawn on the floor in the picture, as white on a mask */
const SUN_BACK = 1 / 0.42, PANES: [number, number, number, number][] = (() => { const out: [number, number, number, number][] = [], Z = [0.95, 1.232, 1.268, 1.532, 1.568, 1.85];
  for (const [a, b] of [[-1.6, -0.7], [-0.45, 0.45], [0.7, 1.6]]) { const m = (a + b) / 2; for (const [x0, x1] of [[a, m - 0.02], [m + 0.02, b]]) for (let r = 0; r < 3; r++) out.push([x0, x1, Z[r * 2], Z[r * 2 + 1]]); } return out; })();
let SH: OffscreenCanvas | HTMLCanvasElement | null = null, SM: OffscreenCanvas | HTMLCanvasElement | null = null;
const cnv = () => (typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(FM.W, FM.H) : Object.assign(document.createElement("canvas"), { width: FM.W, height: FM.H }));
/** a figure's shadow on the floor: his own drawn outline (the offscreen picture of him) carried by an affine map from his upright card to
 *  the floor along the sun's rays, darkening the floor only where the sun falls on it (the panes' patches, their edges softened by five
 *  passes a few centimetres apart: the sun's own size) */
const castShadow = (g: G, id: string, fr: number, w: Who3, fig: OffscreenCanvas | HTMLCanvasElement) => {
  const c = camAt(id, fr), [x, y] = w.at, vx = x - c[0], vy = y - c[1], vl = Math.hypot(vx, vy) || 1, rx = -vy / vl, ry = vx / vl, hw = 0.3;
  const P0 = project(id, fr, [x - rx * hw, y - ry * hw, 0]), P1 = project(id, fr, [x + rx * hw, y + ry * hw, 0]), P2 = project(id, fr, [x, y, 1]);
  const Q2 = project(id, fr, [x, y - SUN_BACK, 0]);
  // (the affine map sending P0, P1, P2 to P0, P1, Q2: solved for the 2x3 matrix)
  const sx = [P0[0], P1[0], P2[0]], sy = [P0[1], P1[1], P2[1]], dx = [P0[0], P1[0], Q2[0]], dy = [P0[1], P1[1], Q2[1]];
  const den = sx[0] * (sy[1] - sy[2]) + sx[1] * (sy[2] - sy[0]) + sx[2] * (sy[0] - sy[1]); if (Math.abs(den) < 1e-6) return;
  const solve3 = (v: number[]) => [(v[0] * (sy[1] - sy[2]) + v[1] * (sy[2] - sy[0]) + v[2] * (sy[0] - sy[1])) / den, (v[0] * (sx[2] - sx[1]) + v[1] * (sx[0] - sx[2]) + v[2] * (sx[1] - sx[0])) / den,
    (v[0] * (sx[1] * sy[2] - sx[2] * sy[1]) + v[1] * (sx[2] * sy[0] - sx[0] * sy[2]) + v[2] * (sx[0] * sy[1] - sx[1] * sy[0])) / den];
  const ax = solve3(dx), ay = solve3(dy);
  SH ??= cnv(); SM ??= cnv(); const sh = SH.getContext("2d") as unknown as G, sm = SM.getContext("2d") as unknown as G;
  sh.setTransform(1, 0, 0, 1, 0, 0); sh.clearRect(0, 0, FM.W, FM.H); sh.setTransform(ax[0], ay[0], ax[1], ay[1], ax[2], ay[2]); sh.drawImage(fig as CanvasImageSource, 0, 0);
  sh.setTransform(1, 0, 0, 1, 0, 0); sh.globalCompositeOperation = "source-in"; sh.fillStyle = "#0e0705"; sh.fillRect(0, 0, FM.W, FM.H); sh.globalCompositeOperation = "source-over";
  sm.setTransform(1, 0, 0, 1, 0, 0); sm.clearRect(0, 0, FM.W, FM.H); sm.fillStyle = "rgba(255,255,255,0.2)";
  for (const d of [-0.06, -0.03, 0, 0.03, 0.06]) for (const [x0, x1, z0, z1] of PANES) { const q = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]].map(([px, pz]) => project(id, fr, [px + d, 3.2 - pz * SUN_BACK + d, 0]));
    sm.beginPath(); q.forEach((p, i) => (i ? sm.lineTo(p[0], p[1]) : sm.moveTo(p[0], p[1]))); sm.closePath(); sm.fill(); }
  sh.globalCompositeOperation = "destination-in"; sh.drawImage(SM as CanvasImageSource, 0, 0); sh.globalCompositeOperation = "source-over";
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 0.6; g.drawImage(SH as CanvasImageSource, 0, 0); g.restore(); };
/** the figures of a shot at frame fr over the plate, the farthest first: contact shadows, the figure, the cabin's light on his fill (the ink
 *  kept), the red face and the sweat, the lens blur at his depth. Nothing is drawn but the rig's own figure (its own two hands) */
export const paintFigures = (g: G, id: string, fr: number, whos: Who3[]) => {
  const t = fr / FM.FPS;
  const order = whos.map((w) => ({ w, pl: placeOf(id, fr, w) })).sort((p, q) => q.pl.depth - p.pl.depth);
  for (const { w, pl } of order) {
    const f = pl.f;
    // contact shadows: a soft dark ellipse under each foot on the floor (a radial gradient, squashed to the floor's ellipse in the picture:
    // the canvas blur filter does nothing in the headless render, so v17's were hard-edged and faint), smaller and fainter as a foot lifts
    if (!w.sil) for (const ft of feetOf(id, fr, w)) { const c = project(id, fr, [ft.world[0], ft.world[1] + 0.02, 0]), ex = project(id, fr, [ft.world[0] + 0.16, ft.world[1] + 0.02, 0]), ey = project(id, fr, [ft.world[0], ft.world[1] + 0.12, 0]);
      const rx = Math.max(4, Math.hypot(ex[0] - c[0], ex[1] - c[1])), ry = Math.max(2, Math.hypot(ey[0] - c[0], ey[1] - c[1])), al = 0.8 * Math.max(0.25, 1 - ft.up * 10);
      g.save(); g.setTransform(1, 0, 0, ry / rx, c[0], c[1]); const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx); gr.addColorStop(0, `rgba(14,7,5,${al})`); gr.addColorStop(0.55, `rgba(14,7,5,${al * 0.6})`); gr.addColorStop(1, "rgba(14,7,5,0)");
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, rx, 0, Math.PI * 2); g.fill(); g.restore(); }
    const o = off(), h = o.getContext("2d", { willReadFrequently: true }) as unknown as G; h.setTransform(1, 0, 0, 1, 0, 0); h.clearRect(0, 0, FM.W, FM.H);
    h.setTransform(pl.z, 0, 0, pl.z, FM.W / 2 - pl.z * pl.cx, FM.H / 2 - pl.z * pl.cy);
    const sc = scaleOf(f.who); h.save(); h.translate(f.x, footY(f.who)); h.scale(sc, sc); D.draw(new Ink(h, D.ol), f.sk, f.o); h.restore();
    if (w.sweatAt !== undefined && t > w.sweatAt) sweat(h, f, t - w.sweatAt);
    h.setTransform(1, 0, 0, 1, 0, 0);
    const img = h.getImageData(0, 0, FM.W, FM.H), Dd = img.data, Wd = FM.W, N = Wd * FM.H, isInk = (k: number) => Math.abs(Dd[k] - 36) + Math.abs(Dd[k + 1] - 23) + Math.abs(Dd[k + 2] - 38) < 46;
    const ink = new Uint8Array(N); for (let k = 0, i = 0; i < N; i++, k += 4) ink[i] = Dd[k + 3] > 8 && isInk(k) ? 1 : Dd[k + 3] > 8 ? 2 : 0;
    const rim = Math.max(5, Math.round(16 * pl.z)), dx = w.rimSide;      // (the rim's side fixed per figure: taken from the window's place against his feet it flipped as the lens drifted, every inner line's rim jumping sides in one frame, the flicker of v9-v15)
    if (w.sil) {
      // the over-the-shoulder foreground: the captain with his back to us. The lens looks toward the stern windows, so his back is the
      // shadow side: one flat dark shade with the frozen look's outline round him (the lines inside, his face's, left out: we see the back of
      // him), and a warm rim where the windows' light catches his edge. Seen without his moustache (the Look), so the outline is the back of
      // his head, his cap, his ears and his coat
      const iw = Math.max(3, Math.round(D.ol * scaleOf(f.who) * pl.z * 0.9));
      const nearOut = (x: number, y: number) => { for (let dy = -iw; dy <= iw; dy += 1) for (let dx2 = -iw; dx2 <= iw; dx2 += 1) { const xx = x + dx2, yy = y + dy; if (xx < 0 || yy < 0 || xx >= Wd || yy >= FM.H || !ink[yy * Wd + xx]) return true; } return false; };
      for (let y = 0; y < FM.H; y++) for (let x = 0; x < Wd; x++) { const i = y * Wd + x; if (!ink[i]) continue; const k = i * 4;
        if (ink[i] === 1 && nearOut(x, y)) { Dd[k] = 36; Dd[k + 1] = 24; Dd[k + 2] = 22; Dd[k + 3] = 255; continue; }
        const yr = y - rim, xr = x + dx * rim, edge = yr < 0 || ink[yr * Wd + x] === 0 || (xr >= 0 && xr < Wd && ink[y * Wd + xr] === 0);
        Dd[k] = edge ? 150 : 60; Dd[k + 1] = edge ? 92 : 43; Dd[k + 2] = edge ? 52 : 34; Dd[k + 3] = 255; }
      softEdge(Dd, Wd, FM.H, Math.max(3, Math.round(5 * pl.z)));      // (a soft edge: the review of v17 saw stair steps on the cut-out's edge; the canvas blur does nothing headless)
    } else {
      // the light, on the fill only (the ink keeps its colour): the warm shade of a figure with the sun behind him, as dim as the room
      // around him; a warm rim inside the outline toward the windows and on top; the red of embarrassment spreading from the cheeks
      const s0 = toScreen(pl, jointPx(f, "skull")), c0 = toScreen(pl, jointPx(f, "crown")), hr = Math.hypot(c0[0] - s0[0], c0[1] - s0[1]) / 2, hc: P2 = [(s0[0] + c0[0]) / 2, (s0[1] + c0[1]) / 2 + hr * 0.2];
      const ru = w.redAt === undefined ? 0 : smooth((t - w.redAt) / 0.5);
      // (every weight smooth, no pixel sorted by a hard threshold: the anti-aliased edges of thin lines crossed such thresholds from frame to
      //  frame and flickered, v9-v16. wf = how much a pixel is fill (not ink), from its distance to the ink's colour and its alpha; the rim
      //  only on the figure's own edge (a neighbour toward the windows outside him), not along every inner line)
      const A = (i: number) => Dd[i * 4 + 3] / 255, wf = (k: number) => Math.min(1, Math.max(0, (Math.abs(Dd[k] - 36) + Math.abs(Dd[k + 1] - 23) + Math.abs(Dd[k + 2] - 38) - 30) / 40)) * (Dd[k + 3] / 255);
      const out = new Float32Array(N * 3);
      for (let y = 0; y < FM.H; y++) for (let x = 0; x < Wd; x++) { const i = y * Wd + x, k = i * 4; if (Dd[k + 3] < 2) continue; const f0 = wf(k); if (f0 <= 0) { out[i * 3] = Dd[k]; out[i * 3 + 1] = Dd[k + 1]; out[i * 3 + 2] = Dd[k + 2]; continue; }
        let r = Dd[k] * 0.8 + 6, gg = Dd[k + 1] * 0.7, b = Dd[k + 2] * 0.66;
        const xr = Math.min(Wd - 1, Math.max(0, x + dx * rim)), yr = y - Math.round(rim * 0.7), outside = yr < 0 ? 1 : Math.max(1 - A(yr * Wd + xr), 1 - A(y * Wd + xr));
        if (outside > 0) { const q = outside; r = r * (1 - q) + Math.min(255, r * 1.18 + 52) * q; gg = gg * (1 - q) + Math.min(255, gg * 1.1 + 28) * q; b = b * (1 - q) + (b * 0.96 + 4) * q; }
        if (ru > 0) { const sk = Math.min(1, Math.max(0, (Dd[k] - Dd[k + 2] - 45) / 30)) * (Dd[k] > Dd[k + 1] && Dd[k + 1] > Dd[k + 2] ? 1 : 0), dd = Math.hypot(x - hc[0], (y - hc[1]) * 1.15) / hr;
          if (sk > 0 && dd < 1.0) { const mm = 0.72 * ru * sk * Math.min(1, (1.0 - dd) / 0.4); r = r * (1 - mm) + 214 * mm; gg = gg * (1 - mm) + 58 * mm; b = b * (1 - mm) + 52 * mm; } }
        out[i * 3] = Dd[k] * (1 - f0) + r * f0; out[i * 3 + 1] = Dd[k + 1] * (1 - f0) + gg * f0; out[i * 3 + 2] = Dd[k + 2] * (1 - f0) + b * f0; }
      for (let i = 0; i < N; i++) if (Dd[i * 4 + 3] >= 2) { Dd[i * 4] = out[i * 3]; Dd[i * 4 + 1] = out[i * 3 + 1]; Dd[i * 4 + 2] = out[i * 3 + 2]; }
    }
    h.putImageData(img, 0, 0);
    if (!w.sil) castShadow(g, id, fr, w, o);
    // (no canvas blur on the figures: the filter works in stills but not in the headless render, so the stills misled (v13-v18); the
    //  figures stand in the focused plane in every shot, and the plate keeps Blender's own depth of field)
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(o as CanvasImageSource, 0, 0); g.restore();
  } };

/** sweat: drops born on the temple, running down inside the head's outline, one after another */
export const sweat = (h: G, f: Fig, a0: number) => {
  const s0 = jointPx(f, "skull"), c0 = jointPx(f, "crown"), sk: P2 = [(s0[0] + c0[0]) / 2, (s0[1] + c0[1]) / 2], hr = Math.hypot(c0[0] - s0[0], c0[1] - s0[1]) * 0.52;
  for (const [t0, side] of [[0, 1], [0.3, -1], [0.65, 1]] as [number, number][]) { const a = a0 - t0; if (a < 0 || a > 0.7) continue;
    // (on the temples, outside the eyes and above the moustache: v17's drops ran into the eye; the outline as thick as the figure's own)
    const x = sk[0] + side * hr * 0.84, y = sk[1] - hr * 0.5 + (a / 0.7) * hr * 0.28, al = a < 0.12 ? a / 0.12 : a > 0.55 ? (0.7 - a) / 0.15 : 1, d = hr * 0.1;
    h.save(); h.globalAlpha = Math.max(0, Math.min(1, al)); h.beginPath(); h.moveTo(x, y - d * 1.8); h.quadraticCurveTo(x + d, y + d * 0.2, x, y + d * 0.8); h.quadraticCurveTo(x - d, y + d * 0.2, x, y - d * 1.8); h.closePath();
    h.fillStyle = "#bfe6ff"; h.fill(); h.lineWidth = D.ol * scaleOf(f.who); h.strokeStyle = "#241726"; h.lineJoin = "round"; h.stroke(); h.restore(); } };

export { lerp, smooth };

// ------------------------------------------------------------------ captions ------------------------------------------------------------------
import { captions, capWidth } from "../stage/film";
/** the voice's times in the film (the mix places each take from its own start: audio/cabin3d_audio.py) */
export const VOICE_AT = { c01: 1.0, c02: 2.88 };
const WORDS = [...C01.words.map((w) => ({ ...w, a: w.a + VOICE_AT.c01, b: w.b + VOICE_AT.c01, line: "c01" })), ...C02.words.map((w) => ({ ...w, a: w.a + VOICE_AT.c02, b: w.b + VOICE_AT.c02, line: "c02" }))];
export const CAPS = captions(WORDS, () => false, SHOTS.slice(1).map((s) => s.t0));
/** where the band stands in each shot (pixels from the top): the lower third, below the faces, chests and hands; in B above the boy (stage/film.ts allows a shot's band above its figures) */
const CAP_TOPS: Record<string, number> = { A: 1440, A2: 1440, B: 470, E: 1440, D: 1680 };      // (B: above the boy's head: his chest and hands fill the lower third)
export const captionAt = (T: number) => { const c = CAPS.find((q) => T >= q.a - 0.03 && T < q.b); if (!c) return null; const sh = SHOTS.find((s) => T >= s.t0 && T < s.t1) ?? SHOTS[SHOTS.length - 1];
  const sz = Math.round(96 * Math.min(1, 8.9 / capWidth(c.text))), w = Math.min(1020, capWidth(c.text) * 1.194 * sz), top = CAP_TOPS[sh.id] ?? 1440;
  return { text: c.text, sz, box: [540 - w / 2, top, 540 + w / 2, top + sz * 1.08] as [number, number, number, number] }; };
export const paintCaption = (g: G, T: number) => { const c = captionAt(T); if (!c) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = `900 ${c.sz}px 'Arial Black', Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "top"; g.lineJoin = "round";
  g.lineWidth = 18; g.strokeStyle = "#141018"; g.strokeText(c.text, 540, c.box[1]); g.fillStyle = "#fff4c2"; g.fillText(c.text, 540, c.box[1]); g.restore(); };

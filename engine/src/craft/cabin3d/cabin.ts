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
import CAM_C from "./cam/C.json";
import CAM_D from "./cam/D.json";
import C01 from "../../../voice/cabin/c01/pick.json";
import C02 from "../../../voice/cabin/c02/pick.json";
import { DRAWN } from "../alcatraz/alcatraz";

type G = CanvasRenderingContext2D;
type P2 = [number, number];
type Mat = number[][];
const CAMS: Record<string, Mat[]> = { A: CAM_A.frames, B: CAM_B.frames, C: CAM_C.frames, D: CAM_D.frames };
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
export const geo = (id: string, fr: number, at: [number, number], h: number, dy = 0) => { const ft = project(id, fr, [at[0], at[1], 0]), hd = project(id, fr, [at[0], at[1], h]);
  const z = (ft[1] - hd[1]) / (FM.PPM * heightOf("sir")); return { foot: [ft[0], ft[1]] as P2, depth: ft[2], z, cx: px(0) - (ft[0] - FM.W / 2) / z, cy: footY("sir") - (ft[1] + dy - FM.H / 2) / z, hpx: ft[1] - hd[1] }; };      // (the rig's soles are drawn at footY: that line on the floor point)
/** a world point in the figure's own drawing space (so a hand can be put on a thing in the room) */
export const toLocal = (id: string, fr: number, at: [number, number], h: number, p: [number, number, number]): P2 => { const G0 = geo(id, fr, at, h), q = project(id, fr, p); return [(q[0] - FM.W / 2) / G0.z + G0.cx, (q[1] - FM.H / 2) / G0.z + G0.cy]; };
/** the checks' planted faults (scripts/cabin_check.mjs) */
export const PLANT = { float: false, sink: false, slide: false, lean: false, fgOverFace: false };

/** 06's guard: both hands come up at his sides, palms out (as in eiffel.ts guard, the approved reaction) */
const guardArms = (name: string, m: ReturnType<typeof figure>, xm: number, T: number, UP = 0.35) => { const arms: Record<string, Pose> = {};
  const armsAt = (out: number): Pose => { const k = String(out); if (arms[k]) return arms[k]; const { pose: p0, heading } = poseAt({ name, m, who: "sir" }, T + 0.6), x = px(xm), sc = scaleOf("sir");
    const sk = solve(D.props("sir"), p0, heading), kk = sk.j.skull as unknown as number[], kx = x + kk[0] * sc, ky = footY("sir") + kk[1] * sc;
    const q = reach("sir", x, p0, heading, "R", [kx - out * sc, ky + 60 * sc], false, { elbowBelow: true });
    return (arms[k] = reach("sir", x, q, heading, "L", [kx + (out + 30) * sc, ky + 140 * sc], false, { elbowBelow: true })); };
  return (t: number, p: Pose): Pose => { const w = env(t, T, UP, 99, 0.2); if (w <= 0) return p; const a = armsAt(120); return { ...p, armL: lerpArm(p.armL, a.armL, w), armR: lerpArm(p.armR, a.armR, w) }; }; };

/** a shrug: both arms out to the sides, the forearms up, palms up (the hands at chest height, a forearm's length out from the body) */
export const RUM = { out: 48 };
export const SHRUG: { up: [[number, number], [number, number]]; upR: [[number, number], [number, number]] } = { up: [[6, 34], [46, 20]], upR: [[6, 36], [60, 22]] };      // (his right hand comes off the table to a lower, wider place: a shorter way, at most 11 px a frame)
/** a shrug: both arms out to the sides and down, the forearms forward, palms open (set directly) */
  // (1.15 s: the hands at most 11 px a frame, the flicker rule)
const shrugArms = (_name: string, _m: ReturnType<typeof figure>, T: number) => (t: number, p: Pose): Pose => { const w = env(t, T, 1.15, 99, 0.2); if (w <= 0) return p;
  return { ...p, armL: lerpArm(p.armL, SHRUG.up, w) }; };      // (the left arm only: the right hand leans on the table)
/** A: the captain rummages in the papers on the table at his right (his far hand at the table top, to and fro), the papers fly off
 *  (Blender, 0.45-1.25 s), he straightens, throws his hands up and shouts the line (0.8 s) */
const captainA = (): Who3 => { const s = 2.4, m = figure("sir", 0, 0); m.stand(s + 1);
  // (0-0.7 s rummaging: his head turned down toward the table at his right, the hand to and fro on the papers; 0.72 he straightens and
  //  turns his head to the boy, 0.8 "Boy!"; from 0.85 both arms out, palms up, a "where is it?" shrug; 1.6 he leans toward the boy)
  ease(m, -1, { head: [-6, 24, 0], lean: 10, roll: -5 }, 0.01, { face: { pupil: 1, gaze: [-0.8, 0.7], brow: -0.6, smile: -0.2, lid: 0.2 } });
  ease(m, 0.25, { head: [-6, 26, -4], lean: 12, roll: -7 }, 0.5, { face: { pupil: 1, gaze: [-0.9, 0.7], brow: -0.8, smile: -0.3, lid: 0.25 } });
  // (his eyes go to the boy first, his head still (0.45-0.8); then the head follows over 0.8 s, the eyes held: the pupils' swing and the
  //  face's slide one after the other, each under the flicker rule's 11 px a frame; together they flickered, v5)
  ease(m, 0.4, { head: [-6, 26, -4], lean: 12, roll: -7 }, 0.6, { face: { pupil: 1, gaze: [0.7, -0.1], brow: -1, smile: -0.6, wide: 0.25, lid: 0 } });
  ease(m, 0.95, { head: [4, -6, 2], lean: -4, roll: 2 }, 0.9, { face: { pupil: 1, gaze: [0.7, -0.1], brow: -1, smile: -0.6, wide: 0.25, lid: 0 } });
  ease(m, 1.8, { head: [8, -2, 5], lean: 3, roll: 5 }, 0.55, { face: { pupil: 1, gaze: [0.8, 0], brow: -1, smile: -0.7, wide: 0.3, lid: 0 } });
  // (the hand's target is the papers on the table top, projected from the room into his drawing each frame: it stays on them as the lens
  //  drifts; to and fro 1.4 times a second between two points 7 cm apart)
  const at = FIGS.captain, hM = HEIGHTS.captain;
  // (the arm set directly, straight out and down toward the table at his right, swinging to and fro 1.4 times a second over the papers)
  const rummage = (t: number, p: Pose): Pose => { const w = env(t, -1, 0.01, 99, 0);      // (his right hand stays on the table, leaning on it, after the rummaging: the papers fall clear of it) if (w <= 0) return p;
    // (the to and fro dies away before the hand leaves the table)
    const k = Math.sin(t * Math.PI * 2 * 1.4) * (1 - smooth((t - 0.45) / 0.35)), arm: Pose["armR"] = [[8 + 10 * k, RUM.out], [16 + 14 * k, RUM.out - 4]]; return { ...p, armR: lerpArm(p.armR, arm, w) }; };
  const shrug = shrugArms("captain", m, 0.75);
  return { name: "captain", at: FIGS.captain, h: HEIGHTS.captain, rimSide: 1, cast: { name: "captain", m, who: "sir", look: CAPTAIN, seed: 1, armWipe: false, pose: (t, p) => shrug(t, rummage(t, p)),
    hands: { L: [[0, "relaxed"], [0.95, "open"]], R: [[0, "relaxed"]] }, mouth: { t0: 0, len: 72, mouth: mouthTrack(C01.words, 0.7, 72) } } }; };
const boyA = (): Who3 => { const s = 2.4, m = figure("sir", 0, -30); m.stand(s + 1);
  ease(m, -1, { head: [-8, 2, 0] }, 0.01, { face: { pupil: 1, gaze: [-0.7, 0.1], smile: 0.2 } });
  ease(m, 0.6, { head: [-12, 8, 0], lean: 4 }, 0.4, { face: { pupil: 1, gaze: [-0.8, 0.5], smile: 0.1, brow: 0.5 } });      // (he watches the papers fly)
  ease(m, 1.3, { head: [-6, -2, 3], lean: -6 }, 0.35, { face: { pupil: 1, gaze: [-0.6, 0], smile: 0.1, brow: 0.8, wide: 0.2 } });      // (the shout: he leans back)
  return { name: "boy", at: FIGS.boy, h: HEIGHTS.boy, rimSide: -1, cast: { name: "boy", m, who: "sir", look: BOY, seed: 31, armWipe: false, hands: { L: [[0, "relaxed"]], R: [[0, "relaxed"]] } } }; };
/** B: over the captain's shoulder: the boy looks down at the captain's boot (0.05), points at it (0.35-1.5), answers (0.2), grins (1.15) */
const boyB = (): Who3 => { const s = 2.2, m = figure("sir", 0, -26); m.stand(s + 1);
  ease(m, -1, { head: [-6, 0, 0] }, 0.01, { face: { pupil: 1, gaze: [-0.6, 0], smile: 0.1, brow: 0.6 } });
  ease(m, 0.0, { head: [-6, 16, 0], lean: 6 }, 0.6, { face: { pupil: 1, gaze: [-0.7, 0.7], smile: 0.2, brow: 0.4 } });      // (0.6 s: his pupils move with the nod, not ahead of it: the flicker check)
  ease(m, 1.05, { head: [-8, 2, 4], lean: -3, roll: -4 }, 0.9, { face: { pupil: 1, gaze: [-0.6, 0], smile: 1, brow: 0.7, lid: 0.25 } });      // (the grin)
  // (the point: the near arm down and out toward the boot on the floor at the lower left, the finger out; held, then lowered)
  // (the finger aims at the captain's right boot on the floor, projected into his drawing: the arm straight out toward it)
  // (raised over 1.1 s and held to the cut: faster, the finger moved 28 px a frame)
  const point = (t: number, p: Pose, heading: number): Pose => { const w = env(t, 0.05, 1.1, 99, 0); if (w <= 0) return p;
    const q = toLocal("B", Math.round((t) * FM.FPS), FIGS.boy, HEIGHTS.boy, [FIGS.captain[0] - 0.08, FIGS.captain[1], 0.05]), r = reach("sir", px(0), p, heading, "R", q, true, { bend: 12 }); return { ...p, armR: lerpArm(p.armR, r.armR, w) }; };
  return { name: "boy", at: FIGS.boy, h: HEIGHTS.boy, rimSide: -1, cast: { name: "boy", m, who: "sir", look: BOY, seed: 2, armWipe: false, pose: point,
    hands: { L: [[0, "relaxed"]], R: [[0, "relaxed"], [0.45, "point"]] }, mouth: { t0: 0, len: 66, mouth: mouthTrack(C02.words, 0.2, 66) } } }; };
/** the lifted boot's free leg (thigh and shin directions, the foot's pitch): found by scripts/cabin_check.mjs's search so the sole is 2-4 cm
 *  off the floor (the standing leg is a little bent, so a straight free leg would reach into the floor) */
export const LIFT_LEG: { th: [number, number]; sh: [number, number]; pitch: number } = { th: [20, 3], sh: [-30, 0], pitch: 0 };      // (2.7 cm up, 2.4 cm aside: the search of 23 Nov)
/** (wide held under 0.5 and the lid never changed: past 0.5 the rig opens the lid in one frame (v7), and a lid opening slowly thins its
 *  crescent under a pixel, which flickers (v8-v9))
 *  (the seeds of the blinks: 1, 2 and 12 give no blink inside these shots; a blink while a face changes flickers, the check of v4)
 *  C and D are one take of the captain cut in two (C full figure, D his face close): off = where the shot starts in it.
 *  0.05 he looks down at his boot; 0.3 his hip goes over his left foot; 0.45 he lifts the right boot 2.7 cm off the map (the left foot carries
 *  him); 0.85 his eyes go wide (the map under the boot); cut at 1.3; 1.35 his face goes red, 1.6 sweat, 1.85 a sheepish grin */
const captainCD = (off: number, red: boolean): Who3 => { const s = 2.4, m = figure("sir", 0, -16), T = (x: number) => x - off; m.stand(s + 1);
  // (the pelvis lowered a little on purpose (the knees a touch bent): left to the rig, it was lowered onto both feet and stopped being so when
  //  the boot came off the floor, a kink in the body's movement that made the brows' thin lines flicker, v13)
  const PY = -0.03;
  ease(m, -1, { head: [-6, 0, 0] }, 0.01, { face: { pupil: 1, gaze: [0.2, 0], brow: -0.6, smile: -0.4 } });
  ease(m, T(0.0), { head: [-6, 8, 0], lean: 4, py: PY }, 0.4, { face: { pupil: 1, gaze: [0, 0.7], brow: -0.2, smile: -0.2} });      // (his eyes go down first)
  ease(m, T(0.3), { head: [-6, 13, 0], lean: 6, py: PY }, 0.8, { face: { pupil: 1, gaze: [0, 0.7], brow: -0.2, smile: -0.2} });
  // (an act layer moves a leg as a free leg (thigh and shin directions, LIFT_LEG); the hip first goes over the left foot (px), so the body
  //  never leans in the air)
  const LIFT = PLANT.float ? { th: [LIFT_LEG.th[0] + 22, 3], sh: [LIFT_LEG.sh[0], 0], pitch: LIFT_LEG.pitch } : LIFT_LEG;
  const HIP = PLANT.lean ? -0.07 : 0.06;      // (px > 0 moves his pelvis over his left foot, the one that stays down: the check's weight test)
  ease(m, T(0.3), { head: [-6, 13, 0], lean: 6, px: HIP, py: PY }, 0.15, { face: { pupil: 1, gaze: [0, 0.7], brow: 0.2, smile: -0.2} });
  ease(m, T(0.45), { head: [-6, 13, 0], lean: 6, px: HIP, legR: LIFT, py: PY } as Partial<Pose>, 0.7, { face: { pupil: 1, gaze: [0, 0.7], brow: 0.8, wide: 0.45, smile: -0.4 } });
  ease(m, T(0.65), { head: [-6, 13, 0], lean: 6, px: HIP, legR: LIFT, py: PY } as Partial<Pose>, 0.9,      // (the head still: only the eyes and the mouth change, a nod over it flickered the brows' thin lines, v11)
    { face: { pupil: 1, gaze: [0.1, 0.7], brow: 0.8, wide: 0.45, smile: -0.4, mouth: 0.35 } });
  ease(m, T(1.32), { head: [-2, 4, 0], lean: 2, px: HIP, legR: LIFT, py: PY } as Partial<Pose>, 0.3, { face: { pupil: 1, gaze: [0.3, 0.1], brow: 0.8, wide: 0.45, smile: -0.6, mouth: 0.35 } });
  ease(m, T(1.8), { head: [4, 2, -5], lean: 0, px: HIP, legR: LIFT, py: PY } as Partial<Pose>, 0.6, { face: { pupil: 1, gaze: [0.4, 0], brow: 0.6, smile: 0.7, teeth: 1, mouth: 0.25 } });
  return { name: "captain", at: FIGS.captain, h: HEIGHTS.captain, rimSide: 1, ...(red ? { redAt: T(1.35), sweatAt: T(1.6) } : {}), cast: { name: "captain", m, who: "sir", look: CAPTAIN, seed: 12, armWipe: false, hands: { L: [[0, "relaxed"]], R: [[0, "relaxed"]] } } }; };
/** B: the captain from behind, the foreground silhouette: he listens, then looks down at his boot as the boy points (0.55) */
const captainB = (): Who3 => { const s = 2.2, m = figure("sir", 0, 0); m.stand(s + 1);
  ease(m, -1, { head: [0, 0, 0] }, 0.01, {}); ease(m, 0.55, { head: [0, 18, 0], lean: 5 }, 0.45, {});
  return { name: "captain", at: FIGS.captain, h: HEIGHTS.captain, rimSide: 1, sil: true, cast: { name: "captain", m, who: "sir", look: { ...CAPTAIN, moustache: false }, seed: 13, armWipe: false, hands: { L: [[0, "relaxed"]], R: [[0, "relaxed"]] } } }; };
export const WHO: Record<string, () => Who3[]> = { A: () => [captainA()], B: () => [captainB(), boyB()], C: () => [captainCD(0, false)], D: () => [captainCD(1.3, true)] };
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
/** the figures of a shot at frame fr over the plate, the farthest first: contact shadows, the figure, the cabin's light on his fill (the ink
 *  kept), the red face and the sweat, the lens blur at his depth. Nothing is drawn but the rig's own figure (its own two hands) */
export const paintFigures = (g: G, id: string, fr: number, whos: Who3[]) => {
  const t = fr / FM.FPS;
  const order = whos.map((w) => ({ w, pl: placeOf(id, fr, w) })).sort((p, q) => q.pl.depth - p.pl.depth);
  for (const { w, pl } of order) {
    const f = pl.f;
    // contact shadows: a soft ellipse under each foot on the floor, smaller and fainter as a foot lifts
    if (!w.sil) for (const ft of feetOf(id, fr, w)) { const pts: P2[] = []; for (let k = 0; k < 20; k++) { const a = (k / 20) * Math.PI * 2, q = project(id, fr, [ft.world[0] + Math.cos(a) * 0.12, ft.world[1] + 0.02 + Math.sin(a) * 0.08, 0]); pts.push([q[0], q[1]]); }
      const al = 0.55 * Math.max(0.3, 1 - ft.up * 10), bl = Math.max(4, 7 * pl.z); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = `blur(${bl.toFixed(1)}px)`; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = `rgba(18,9,7,${al})`; g.fill(); g.filter = "none"; g.restore(); }
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
        if (ink[i] === 1 && nearOut(x, y)) { Dd[k] = 30; Dd[k + 1] = 20; Dd[k + 2] = 28; Dd[k + 3] = 255; continue; }
        const yr = y - rim, xr = x + dx * rim, edge = yr < 0 || ink[yr * Wd + x] === 0 || (xr >= 0 && xr < Wd && ink[y * Wd + xr] === 0);
        Dd[k] = edge ? 132 : 46; Dd[k + 1] = edge ? 80 : 34; Dd[k + 2] = edge ? 50 : 38; Dd[k + 3] = 255; }
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
    const bl = cocPx(id, fr, w.sil ? project(id, fr, [w.at[0], w.at[1], w.h * 0.8])[2] : pl.depth) / 2;
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = `blur(${Math.max(0.2, bl).toFixed(2)}px)`;      // (always on, at least 0.2 px: a blur switched on at a threshold (0.6, then 0.15 px) went on and off as the lens drifted, a flicker in v8 and v13)
    g.drawImage(o as CanvasImageSource, 0, 0); g.filter = "none"; g.restore();
  } };

/** sweat: drops born on the temple, running down inside the head's outline, one after another */
export const sweat = (h: G, f: Fig, a0: number) => {
  const s0 = jointPx(f, "skull"), c0 = jointPx(f, "crown"), sk: P2 = [(s0[0] + c0[0]) / 2, (s0[1] + c0[1]) / 2], hr = Math.hypot(c0[0] - s0[0], c0[1] - s0[1]) * 0.52;
  for (const [t0, side] of [[0, 1], [0.3, -1], [0.65, 1]] as [number, number][]) { const a = a0 - t0; if (a < 0 || a > 0.7) continue;
    const x = sk[0] + side * hr * 0.62, y = sk[1] - hr * 0.1 + (a / 0.7) * hr * 0.45, al = a < 0.2 ? a / 0.2 : a > 0.5 ? (0.7 - a) / 0.2 : 1, d = hr * 0.12;
    h.save(); h.globalAlpha = Math.max(0, Math.min(1, al)); h.beginPath(); h.moveTo(x, y - d * 1.8); h.quadraticCurveTo(x + d, y + d * 0.2, x, y + d * 0.8); h.quadraticCurveTo(x - d, y + d * 0.2, x, y - d * 1.8); h.closePath();
    h.fillStyle = "#bfe6ff"; h.fill(); h.lineWidth = 6; h.strokeStyle = "#241726"; h.stroke(); h.restore(); } };

export { lerp, smooth };

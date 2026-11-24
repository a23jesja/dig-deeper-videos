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
import CAM_A1b from "./cam/A1b.json";
import CAM_A2a from "./cam/A2a.json";
import CAM_A2b from "./cam/A2b.json";
import CAM_B1 from "./cam/B1.json";
import CAM_B2 from "./cam/B2.json";
import CAM_E from "./cam/E.json";
import CAM_D1 from "./cam/D1.json";
import CAM_D2 from "./cam/D2.json";
import C01 from "../../../voice/cabin/c01/pick.json";
import C02 from "../../../voice/cabin/c02w/pick.json";      // (the boy: Will, chosen by Jesper on 25 Nov; Daniel stays for adults)
import { DRAWN } from "../alcatraz/alcatraz";

type G = CanvasRenderingContext2D;
type P2 = [number, number];
type Mat = number[][];
const CAMS: Record<string, Mat[]> = { A: CAM_A.frames, A1b: CAM_A1b.frames, A2a: CAM_A2a.frames, A2b: CAM_A2b.frames, B1: CAM_B1.frames, B2: CAM_B2.frames, E: CAM_E.frames, D1: CAM_D1.frames, D2: CAM_D2.frames };
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
const mouthTrack = (words: { w: string; a: number; b: number }[], t0: number, n: number, rate = 0.1): number[] => {      // (rate: at most this much opening a frame; close-ups slower, v53)
  const raw: number[] = []; for (let f = 0; f < n; f++) { const t = f / FM.FPS - t0; raw.push(t < 0 ? 0 : mouthAt(words, t) * 0.9); }
  // (a mouth that shuts for one or two frames between syllables and opens again flickers (the flicker check, v2-v3): each frame takes the
  //  smaller of the largest openings within two frames either side, so a gap of up to four frames is bridged; then at most 0.1 a frame)
  const mx = raw.map((_, f) => Math.max(...raw.slice(Math.max(0, f - 2), f + 3))), cl0 = mx.map((_, f) => Math.min(...mx.slice(Math.max(0, f - 2), f + 3)));
  // (and a one-frame peak is taken down the same way, then the whole softened over five frames: a mouth that crossed a drawing's step and
  //  back in one frame flickered, v6)
  const mn = cl0.map((_, f) => Math.min(...cl0.slice(Math.max(0, f - 1), f + 2))), op = mn.map((_, f) => Math.max(...mn.slice(Math.max(0, f - 1), f + 2))), K5 = [1, 4, 6, 4, 1];
  const cl = op.map((_, f) => { let a = 0, wsum = 0; for (let d = -2; d <= 2; d++) { const q = op[f + d]; if (q === undefined) continue; a += K5[d + 2] * q; wsum += K5[d + 2]; } return a / wsum; });
  const out: number[] = []; let prev = 0; for (let f = 0; f < n; f++) { const v = prev + Math.max(-rate, Math.min(rate, cl[f] - prev)); out.push(v); prev = v; }
  // (v53: a one-frame peak or dip, which the rate limit leaves at every turn (0.375, 0.412, 0.375), drawn as a plateau: at a peak the mouth's
  //  edge went out and back in one frame and flickered in the boy's close-up, 3.80 s)
  for (let pass = 0; pass < 2; pass++) for (let f = 1; f < n - 1; f++) { const a = out[f - 1], b = out[f], c = out[f + 1]; if ((b > a && b > c) || (b < a && b < c)) out[f] = b > a ? Math.max(a, c) : Math.min(a, c); }
  // (then rounded over seven frames, so a turn passes through standing still slowly: with a smile moving the lips at the same time, the
  //  plateau's sharp corner still put the boy's lower lip out and back at 3.83 s)
  const B7 = [1, 6, 15, 20, 15, 6, 1]; return out.map((_, f) => { let s7 = 0, w7 = 0; for (let d = -3; d <= 3; d++) { const q = out[f + d]; if (q === undefined) continue; s7 += B7[d + 3] * q; w7 += B7[d + 3]; } return s7 / w7; }); };
/** a speaker's mouth over the whole film, cut to one shot: per shot the track started shut at every cut, so the boy's mouth was closed in
 *  the middle of his sentence as B2 began (v53). rate: the opening's limit a frame, the same over the whole line */
const filmTrack = (words: { w: string; a: number; b: number }[], at: number, t0: number, n: number, rate = 0.1): number[] => {
  const F0 = Math.round(t0 * FM.FPS), N = Math.round(SHOTS[SHOTS.length - 1].t1 * FM.FPS) + 1; return mouthTrack(words, at, N, rate).slice(F0, F0 + n); };

/** h = his height in metres; sil = drawn as a dark silhouette (the over-the-shoulder foreground) */
export type Who3 = { name: string; cast: Cast; at: [number, number]; h: number; rimSide: 1 | -1; redAt?: number; redMax?: number; sweatAt?: number; sil?: boolean; key?: number };
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
export const PLANT = { float: false, sink: false, slide: false, lean: false, fgOverFace: false, sweatOut: false, legOut: false, capWide: false };

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
/** v28: the poses change on the cuts (the reviewer's yes, 24 Nov): every cut changes the size or the angle by 30 degrees or more, and a
 *  move starts at the end of one shot and lands in the first frames of the next (cut on the action). Each character has one timeline in
 *  the film's own time; a shot builds him at its own heading (the way he faces, seen from its lens) from that timeline. Inside a shot
 *  something small happens every 0.5-1 s (face, breath, a shoulder, a nod), each part under 11 px a frame */
const SHOT_T0 = Object.fromEntries(SPEC.shots.map((q) => [q.id, q.t0])) as Record<string, number>;
const lerpPose = (a: [Seg2, Seg2], b: [Seg2, Seg2], u: number): [Seg2, Seg2] => lerpArm(a, b, Math.min(1, Math.max(0, u))) as [Seg2, Seg2];
const OUT_L: [Seg2, Seg2] = [[14, 40], [36, 28]], FISTS: [Seg2, Seg2] = [[16, 28], [96, 20]], LEAN_OUT: [Seg2, Seg2] = [[4, 42], [30, 34]];
/** the captain's timeline (film seconds):
 *  0.0-0.55 bent over the table, his right hand on the papers; 0.45-1.0 the sweep (the papers go, set.py); 0.62-1.05 he straightens up,
 *  his head comes up, eyes wide, brows down; his right hand stays at the table, out of the close-up (A1b); 1.0 "Boy!";
 *  1.3-2.15 both arms out wide; 1.45 he
 *  leans in; 1.85-2.35 his hands come in toward fists; 2.1 he leans right in on "treasure map?"; 2.4-2.7 his arms out and down.
 *  4.4-5.9 (E) both fists on his hips, his right boot raised off the X (up at 5.95); 5.9-6.7 (D2) his face, red, eyes squeezed, a grin with
 *  teeth, the head tipping, sweat from 6.15, while the boot goes down out of the picture (5.95-6.6); 6.7-7.4 (D1) full, boot down, eyes at the boy, a sheepish grin */
const captainG = (id: string, heading: number): Who3 => { const t0 = SHOT_T0[id], T = (x: number) => x - t0, m = figure("sir", 0, heading); m.stand(9);
  const late = t0 >= 4.4, PY = -0.03, HIP = PLANT.lean ? -0.07 : 0.06;
  const LIFT = PLANT.float ? { th: [LIFT_LEG.th[0] + 40, LIFT_LEG.th[1]], sh: [LIFT_LEG.sh[0] + 20, 0], pitch: LIFT_LEG.pitch } : PLANT.legOut ? { th: [0, 38], sh: [0, 38], pitch: 0 } : LIFT_LEG;      // (legOut: v26's fault, a straight leg swung 38 degrees out: the joint check must fail it)
  if (!late) {
    ease(m, -9, { head: [-6, 24, 0], lean: 14, roll: -6 }, 0.01, { face: { pupil: 1, gaze: [-0.8, 0.7], brow: -0.6, smile: -0.6, lid: 0.2, teeth: 1 } });      // (step 1: clenched, his teeth shut tight)
    ease(m, T(0.15), { head: [-8, 26, -4], lean: 16, roll: -8 }, 0.25, { face: { pupil: 1, gaze: [-0.9, 0.7], brow: -0.9, smile: -0.6, lid: 0.25 } });
    ease(m, T(0.45), { head: [-5.6, 19.4, -2.8], lean: 10.6, roll: -5.6 }, 0.3, {});      // (his head starts up in the wide shot, slowly, a third of the way: v52's whole move in 0.6 s flickered in his eyes (the flicker check on the delivered file, 0.37-0.63 s) and ran on into the close-up)
    ease(m, T(0.785), { head: [1, 3, 1], lean: 1, roll: 1 }, 0.01, { face: { pupil: 1, gaze: [0.7, -0.1], brow: -1, smile: -0.85, wide: 0.35, lid: 0, teeth: 0 } });      // (and lands on the cut into the shout's close-up: head up, the teeth gone, the corners of the mouth down (cut on the action))
    ease(m, T(0.8), { head: [1, 3, 1], lean: 1, roll: 1 }, 0.01,      /* (v53: the head still in the shout's close-up, its small settle set on the cut: any start from rest inside the close-up flickered at the outlines (0.83 and 0.97 s)) */ { face: { pupil: 1, gaze: [0.7, -0.1], brow: -1, smile: -0.8, wide: 0.35, lid: 0 } });
    ease(m, T(1.45), { head: [6, -6, 3], lean: 7 }, 0.45, { face: { pupil: 1, gaze: [0.3, -0.2], brow: -1, smile: -0.8, wide: 0.35, lid: 0 } });
    ease(m, T(2.05), { head: [10, -10, 5], lean: 15 }, 0.01, { face: { pupil: 1, gaze: [1, 0.15], brow: -1, smile: -1, wide: 0, lid: 0.25, mouth: 1 } });      // (pupils right, at the boy: at 0.6 they sat in the middle on a near-frontal head, into the lens, v34)      // (angriest: brows right down, eyes a little narrowed and on the boy, mouth wide; not the boy's sly half lid, v31)      // (step 3, set on the cut: leaning right in, angriest, eyes narrowed, his mouth wide)
  } else {
    ease(m, -9, { head: [6, 6, -3], lean: 2, py: PY }, 0.01, { face: { pupil: 1, gaze: [0, 0.7], brow: 0.8, wide: 0.45, smile: -0.4, mouth: 0.35 } });
    ease(m, T(4.05), { head: [0, 14, 0], lean: 4, px: HIP, py: PY }, 0.4, {});
    ease(m, T(4.45), { head: [0, 14, 0], lean: 4, px: HIP * 1.8, py: PY, roll: -3 }, 1.35, {}); /* (the knee raise reads: the hips go over the standing leg and the body tips toward it, v44) */ m.actAt(T(4.4), { legR: LIFT } as Partial<Pose>, 6.6 - 4.4, { in: 1.55, out: 0.65, antic: 0, glide: true });      // (the lift as its own layer: it eases out into the planted stand 6.0-6.55, so D1 opens with the boot up as E ends and he sets it down; held it read as planted, v32)      // (up by 5.35: the X clear 0.55 s before the cut, the reviewer)      // (the boot up in 0.75 s, toe up: the X under the toe shows)
    // (25 Nov order, the reviewer: E ends as the X shows (5.9), then his face (D2) while the boot goes down out of the picture, then the full
    //  shot D1 with the boot down; the same eases for both shots, so the face, head, red and sweat carry across the cut)
    ease(m, T(5.87), { head: [6, 6, -3], lean: 2, py: PY }, 0.01, { face: { pupil: 1, gaze: [0.6, 0], sad: 0, smile: 1, mouth: 0.55, teeth: 1, squeeze: 1, brow: -0.3, wide: 0 } });      // (the punchline, set on the cut into his face: eyes squeezed shut, a wide grin with teeth)
    ease(m, T(6.2), { head: [10, 6, 6], lean: -2, py: PY + 0.045 }, 0.42, {});      /* (his shoulders come up and his head tips in the middle of D2: v44 held one face for 0.7 s) */
    ease(m, T(6.68), { head: [6, 6, -3], lean: 2, py: PY }, 0.01, { face: { pupil: 1, gaze: [0.75, -0.05], squeeze: 0, teeth: 0, brow: 0.65, wide: 0.26, smile: 0.65, mouth: 0.38, sad: 0.15 } });      // (on the cut to the full shot: eyes open, at the boy, the grin begun (v53: from -0.2 the grin in D1 flickered in his eyes))
    ease(m, T(6.72), { head: [6, 6, -3], lean: 2, py: PY }, 0.65, { face: { pupil: 1, gaze: [0.6, 0], brow: 0.6, wide: 0.2, smile: 1, mouth: 0.4, sad: 0.25 } });      // (his head settles and a sheepish grin)      // (v53: the head settles on the cut from D2 (its 0.5 s settle in D1 flickered in his eyes, 6.93-7.07 s); only the grin eases in)
  }
  let JAB: { side: "L" | "R"; arm: [Seg2, Seg2] } | null = null;
  const arms = (t: number, p: Pose, hd: number): Pose => { const g = t + t0;
    if (g >= 4.4) { const kb = smooth((g - 4.5) / 1.2) * (1 - smooth((g - 5.95) / 0.65)), HL: [Seg2, Seg2] = [[0, 60], [-40, -30]], HR: [Seg2, Seg2] = [[-15, 55], [40, -40]];      // (E and D1: fists really on his hips, elbows out (searched on D1's picture: v45's AKIMBO angles held the fists up at his shoulders); the elbows go out a little more for balance while the knee is up)
      if (id === "D2") return { ...p, armL: [[15, 45], [40, -40]], armR: HR };      // (D2, turned three-quarter: the far fist set out at the side of his waist so it shows, as in D1; with D1's angles it went behind his body, v47)
      return { ...p, armL: lerpPose(HL, [[0, 68], [-44, -30]], kb), armR: lerpPose(HR, [[-15, 63], [44, -40]], kb) }; }
    const sw = smooth(g / 0.8),      /* (his hand sweeps across the table top from right of the papers to past them: it reaches them at about 0.4 s, when they start to slide; v34's hand stood still while they flew) */ tableR: [Seg2, Seg2] = lerpPose([[0, 40], [60, 30]], [[0, 50], [0, 60]], sw);      // (from right of the stack to its back edge at the table top's height, pushing it off: searched; v39's hand ended above the stack)
    // (A1b is a close-up of his shout: both hands go down and out of it (his right hand leaves the table 0.6-1.1); the arms go out wide
    //  from 1.3, just before the cut into A2a, and land in it: cut on the action)
    // (A2a "where is my": both arms flung wide and low, both palms open toward the room; the move starts while A1b's close-up hides the hands
    //  (they stay under its frame) and goes on through A2a; v34's half-way pose with a hanging fist was slack. Palms up at the chest was searched
    //  too: from his hands at his knees it needs 350 px, over a second at the 11 px rule, more than A2a's 0.65 s)
    const out = smooth((g - 0.75) / 1.6), fist = 0, down = 0, WIDE: [Seg2, Seg2] = [[6, 44], [44, 30]];
    const R0 = lerpPose(tableR, WIDE, out),      /* (his right hand stays at the table, out of the close-up at its left, until the arms go out: moving it down crossed the close-up too fast) */ L0 = lerpPose(p.armL as [Seg2, Seg2], [[6, 34], [34, 22]], out);      // (the far arm a little less wide: it travels further in the picture)
    const f = (a: [Seg2, Seg2]) => lerpPose(lerpPose(a, FISTS, fist), LEAN_OUT, down);
    // (cut on the action into A2b: the jab starts in A2a's last quarter second (30 % of the way, within 11 px a frame), A2b opens at 80 % and lands
    //  in its first 8 frames; v47 snapped from the wide arms to the jab on the cut, the review)
    const JL: [Seg2, Seg2] = [[90, -11], [78, 4]], FR: [Seg2, Seg2] = [[-30, 5], [60, 0]], pre = (gg: number, a: [Seg2, Seg2], b: [Seg2, Seg2]) => lerpPose(a, b, 0.15 * smooth((gg - 1.8) / 0.25));
    const o05 = smooth((2.05 - 0.75) / 1.6), L05 = pre(2.05, lerpPose(p.armL as [Seg2, Seg2], [[6, 34], [34, 22]], o05), JL), R05 = lerpPose(lerpPose(lerpPose([[0, 40], [60, 30]], [[0, 50], [0, 60]], 1), WIDE, o05), FR, 0.08);
    if (g >= 2.05) { // (the jab: the arm on the screen's right side reaches up and out to the right, toward the boy (raised: in the close-up a level arm left the picture and crossed the caption), solved once and held;
      //  the other fist at his chest. v29's set angles pointed the finger back across his own chin)
      if (!JAB) { const sk = solve(D.props("sir"), p, hd), sc = scaleOf("sir"), J = (n: string) => sk.j[n as keyof typeof sk.j] as unknown as number[], right: "L" | "R" = J("shL")[0] > J("shR")[0] ? "L" : "R", sh = J("sh" + right), L = 0.92 * sc * (D.props("sir").upper + D.props("sir").fore + D.props("sir").hand);
        const r = reach("sir", px(0), p, hd, right, [px(0) + sh[0] * sc + L * 0.42, footY("sir") + sh[1] * sc + L * 0.14], true, { bend: 24 }); JAB = { side: right, arm: (right === "L" ? r.armL : r.armR) as [Seg2, Seg2] }; }
      const HANG: [Seg2, Seg2] = [[-30, 5], [60, 0]], s2 = 0.88 + 0.12 * smooth((g - 2.05) / 0.36), pump = 4 * Math.sin((g - 2.35) * Math.PI * 2 * 2.4) * smooth((g - 2.35) / 0.15), J2: [Seg2, Seg2] = [[JAB.arm[0][0] + pump, JAB.arm[0][1]], [JAB.arm[1][0] + pump * 0.6, JAB.arm[1][1]]];
      return JAB.side === "L" ? { ...p, armL: lerpPose(L05, J2, s2), armR: R05 } : { ...p, armR: lerpPose(R05, J2, s2), armL: L05 }; }      /* (the free hand stays at his hip through A2b, where A2a leaves it: v51 jumped it to his belly on the cut) */      // (the other hand open at his belly, as open as in A2a (no change of shape on the cut, v48); one clear jab reads better)      // (A2b: the outstretched arm at his shoulder's height, its finger jabbing at the boy)      // (A2b: the finger jabs at the boy, small and quick)
    return { ...p, armR: lerpPose(f(R0), FR, 0.08 * smooth((g - 1.86) / 0.19)), armL: pre(g, f(L0), JL) }; };      // (both arms start before the cut: the jab 15 %, the other toward his belly 8 %; the other hand stays open in A2b, so nothing changes shape on the cut, v48)
  const shot = SPEC.shots.find((q) => q.id === id)!, n = Math.round((shot.t1 - shot.t0) * FM.FPS);
  return { name: "captain", at: FIGS.captain, h: HEIGHTS.captain, rimSide: 1, ...(late ? { redAt: T(5.95), redMax: 1.35, sweatAt: T(6.15) } : id === "A2b" ? { redAt: -1, redMax: 0.7 } : {}),
    cast: { name: "captain", m, who: "sir", look: CAPTAIN, seed: late ? 12 : 1, armWipe: false, pose: arms, hands: late ? { L: [[0, "fist"]], R: [[0, "fist"]] } : t0 >= 5.9 ? { L: [[0, "open"]], R: [[0, "open"]] } : id === "A2a" ? (heading > 0 ? { L: [[0, "open"], [0.43, "point"]], R: [[0, "open"]] } : { L: [[0, "open"]], R: [[0, "open"], [0.43, "point"]] }) : t0 >= 2.05 ? (heading > 0 ? { L: [[0, "point"]], R: [[0, "open"]] } : { L: [[0, "open"]], R: [[0, "point"]] }) : { L: [[0, "open"]], R: [[0, "relaxed"]] },
      ...(late ? {} : { mouth: { t0: 0, len: n, mouth: filmTrack(C01.words, VOICE_AT.c01, t0, n).map((v, f) => { const g = t0 + f / FM.FPS; return Math.min(1, id === "A1b" ? (g < 0.97 ? 0 : (1 - smooth((g - 1.12) / 0.4)) * Math.max(v * 1.6, 1) + smooth((g - 1.12) / 0.4) * v * 1.4)      /* (v53: the shout closes over 0.22 s, not in one frame at 1.32: the step flickered in the circle round his eyes) */ : id === "A2b" ? Math.max(v * 1.4, 0.9) : id === "A2a" && g < 1.53 ? 0 : v * (heading > 20 ? 0.8 : 1)); }) } }) } }; };      // (A2a: shut in the pause until "where": v39 opened it with no word on screen)      // (A1b: shut as it opens, then the shout as wide as the drawing goes; A2b: never under 0.7)      // (A1b: the shout's mouth wide open; A2b: never under 0.7, the angriest)      // (A1b: the shout's mouth wide open)
/** the boy's timeline (film seconds): 2.7 looking down at the captain's boots, his arm up pointing at them (it is up as the shot opens:
 *  the pose changes on the cut); 2.88 "You're standing on it, Captain."; 3.25-3.7 he looks up at the captain; 3.9-4.35 a big grin, his
 *  shoulders up, his head tipped */
const boyG = (id: string, heading: number): Who3 => { const t0 = SHOT_T0[id], T = (x: number) => x - t0, m = figure("sir", 0, heading); m.stand(9);
  ease(m, -9, { head: [-6, 12, 0], lean: 5 }, 0.01, { face: { pupil: 1, gaze: [-0.4, 0.55], smile: 0.2, brow: 0.5 } });
  ease(m, T(3.0), { head: [-8, -6, 2], lean: -1 }, 0.42, { face: { pupil: 1, gaze: [-0.6, -0.55], smile: 0.15, brow: 0.8 } });      // (eyes open as B2 begins; the smile lowers the lids by 4.3: the sly change reads, v44)      // (his eyes go up at the end of B1 and are up as B2 opens)
  ease(m, T(3.45), { head: [-8, -6, 2], lean: -1 }, 0.01, { face: { pupil: 1, gaze: [-0.6, -0.55], smile: 0.36, brow: 0.8 } });      // (v53: on the cut into B2 the smile is already past 0.3, where the design's smiling lower lid switches on with its full outline: crossing it inside the close-up flickered, 3.83 s)
  ease(m, T(3.55), { head: [-8, -6, 2], lean: -1 }, 0.85, { face: { pupil: 1, gaze: [-0.6, -0.55], smile: 1, brow: 0.8 } });      // (v53: the head still and the smile over 0.7 s: v52's roll and lift with the smile in the close-up flickered in his eyes, 3.97-4.23 s)
  // (the arm solved once for the shot, at its first frame, and held: re-solved every frame it flipped between two answers when his
  //  shoulders lifted, 20 px in a frame, v28)
  // (a straight arm, the finger 35 degrees down toward the screen's left in both shots, found by search on the picture (upper arm and forearm
  //  both at 35 degrees): the reach solver bent the arm differently in B1 and B2, v29-v30)
  const POINT: [Seg2, Seg2] = id === "B1" ? [[5, 55], [5, 55]] : [[30, 50], [30, 50]];
  const HIP: [Seg2, Seg2] = [[20, 25], [60, 0]];      // (his other hand on his hip, the elbow out: searched on B1's picture; the captain's AKIMBO angles put the boy's fist up by his shoulder, v35)
  const point = (t: number, p: Pose): Pose => ({ ...p, armR: POINT, armL: id === "B1" ? HIP : [[-15, 15], [10, -10]] });      // (B2: the elbow out as in B1 and the fist on his hip below the picture (searched): v49 let the arm hang, a jump across the cut)      // (B2's close-up: the arm hangs, out of the picture below; on the hip its fist sat on the bottom edge)      // (his other hand on his hip: a cocky stance, and out of the caption band above his feet, v34)
  const shot = SPEC.shots.find((q) => q.id === id)!, n = Math.round((shot.t1 - shot.t0) * FM.FPS);
  return { name: "boy", at: FIGS.boy, h: HEIGHTS.boy, rimSide: -1, key: 0.6, cast: { name: "boy", m, who: "sir", look: BOY, seed: 2, armWipe: false, pose: point,
    hands: { L: [[0, "fist"]], R: [[0, "point"]] }, mouth: { t0: 0, len: n, mouth: filmTrack(C02.words, VOICE_AT.c02, t0, n, id === "B2" ? 0.05 : 0.07).map((v, f) => (t0 + f / FM.FPS < VOICE_AT.c02 + C02.words[0].a - 0.08 ? 0 : v * (id === "B2" ? 0.75 : 0.85))) } } }; };      // (shut until just before "you're" (0.08 s, so the drawn mouth shows open as the word and its caption begin: at -0.02 the smoothing opened it 0.1 s late, v53); v51 opened it with no word)
/** B: the captain from behind, the dark shape in front: he looks down at his boots as the boy points (0.55) */
const captainB = (): Who3 => { const s = 1.7, m = figure("sir", 0, 0); m.stand(s + 1);
  ease(m, -1, { head: [0, 0, 0] }, 0.01, {}); ease(m, 0.55, { head: [0, 14, 0], lean: 4 }, 0.6, {});
  return { name: "captain", at: FIGS.captain, h: HEIGHTS.captain, rimSide: 1, sil: true, cast: { name: "captain", m, who: "sir", look: { ...CAPTAIN, moustache: false }, seed: 13, armWipe: false, hands: { L: [[0, "relaxed"]], R: [[0, "relaxed"]] } } }; };
/** the lifted boot's free leg (thigh and shin directions, the foot's pitch): the sole 2-3 cm off the floor (the standing leg is a little
 *  bent, so a straight free leg would reach into the floor) */
/** E's step (the boot lifted and set down again, the test of 24 Nov): which way along his facing and how far, in leg lengths */
export const E_STEP = { ahead: -0.14, dur: 0.75, at: 0.25 };
export const LIFT_LEG: { th: [number, number]; sh: [number, number]; pitch: number } = { th: [22, 11], sh: [-58, -10], pitch: -3 };      // (the knee out and the shin back in under it: the leg bends visibly at the knee in the front view)      // (the knee a little out to the side so it shows bent in the front view)      // (pitch -3: the sole level as it lifts (searched: at -10 the drawn toe swung up 260 px and the boot turned nose-up))
export const WHO: Record<string, () => Who3[]> = { A: () => [captainG("A", 0)], A1b: () => [captainG("A1b", 30)], A2a: () => [captainG("A2a", 35)], A2b: () => [captainG("A2b", 25)],
  B1: () => [boyG("B1", -16)], B2: () => [boyG("B2", -40)], E: () => [captainG("E", 0)], D1: () => [captainG("D1", 0)], D2: () => [captainG("D2", 35)] };
export const TABLE_TOP = 0.488;

// ------------------------------------------------------------------ placing and painting ------------------------------------------------------------------
export const LINE_TOP = FM.GY - FM.LINE / 2;
/** where a figure stands in the picture at frame fr: the screen point of his feet, his scale, and the 2D camera that draws him there */
export const placeOf = (id: string, fr: number, w: Who3) => { const f = castAt([w.cast], fr / FM.FPS)[0];
  // (planted faults for the checks: a figure skating 2 mm a frame; the captain in front moved 35 cm over the boy)
  const at: [number, number] = [w.at[0] + (PLANT.slide && !w.sil ? 0.002 * fr : 0) + (PLANT.fgOverFace && w.sil ? 0.35 : 0), w.at[1]];
  return { ...geo(id, fr, at, w.h, PLANT.sink ? 10 : 0), f }; };
/** a hand's drawn length on the screen (the rig's hand prop at this shot's scale): the checks measure a hand's reach with it */
export const handPx = (who: Parameters<typeof scaleOf>[0], pl: ReturnType<typeof placeOf>) => D.props(who).hand * scaleOf(who) * pl.z;
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
// (each window's whole opening, its bars left out: drawn pane by pane with five soft passes, v19's shadow showed the bars as a ghosted
//  grid and stepped edges, the independent review)
const SUN_BACK = 1 / 0.42, PANES: [number, number, number, number][] = [[-1.6, -0.7, 0.95, 1.85], [-0.45, 0.45, 0.95, 1.85], [0.7, 1.6, 0.95, 1.85]];
let SH: OffscreenCanvas | HTMLCanvasElement | null = null, SM: OffscreenCanvas | HTMLCanvasElement | null = null;
const cnv = () => (typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(FM.W, FM.H) : Object.assign(document.createElement("canvas"), { width: FM.W, height: FM.H }));
/** a figure's shadow on the floor: his own drawn outline (the offscreen picture of him) carried by an affine map from his upright card to
 *  the floor along the sun's rays, darkening the floor only where the sun falls on it (the panes' patches, their edges softened by five
 *  passes a few centimetres apart: the sun's own size) */
const SUN_SHOTS = new Set(["A", "E", "D1"]);      // (the captain's cast shadow in the sun: A, E and D1, where both reviewers saw it start at his soles on the sunlit floor)
const castShadow = (g: G, id: string, fr: number, w: Who3, fig: OffscreenCanvas | HTMLCanvasElement) => {
  const c = camAt(id, fr), [x, y] = w.at, vx = x - c[0], vy = y - c[1], vl = Math.hypot(vx, vy) || 1, rx = -vy / vl, ry = vx / vl, hw = 0.3;
  // (the hinge on the DRAWN soles: the card stands about 40 px lower and draws about 1.3 times wider than the projected world points, so with the
  //  hinge on those the legs fell on the far side of it and his shadow folded away behind him, no shadow in the sun patch: the reviewer on v44)
  const HZ = Math.min(0.3, 0.35 * vl / SUN_BACK), W0 = project(id, fr, [x - rx * hw, y - ry * hw, 0]),      // (HZ: the shadow's reference height, small enough that the floor point it maps to stays in front of the lens: in E (0.45 m away) 0.3 m mapped behind the camera and his shadow vanished, v46)
  W1 = project(id, fr, [x + rx * hw, y + ry * hw, 0]), WC = project(id, fr, [x, y, 0]), WQ = project(id, fr, [x, y - SUN_BACK * HZ, 0]);
  const pl = placeOf(id, fr, w), f = pl.f, ppm = (footY(f.who) - (jointPx(f, "crown") as unknown as number[])[1]) / (w.h * 0.97), dirx = (W1[0] - W0[0]), diry = (W1[1] - W0[1]), dl = Math.hypot(dirx, diry) || 1;
  const C = toScreen(pl, [f.x, footY(f.who)]), half = (hw * ppm) * pl.z, ratio = (2 * half) / dl;
  const P0 = [C[0] - dirx / dl * half, C[1] - diry / dl * half], P1 = [C[0] + dirx / dl * half, C[1] + diry / dl * half], P2 = toScreen(pl, [f.x, footY(f.who) - HZ * ppm]);
  const Q2 = [C[0] + (WQ[0] - WC[0]) * ratio, C[1] + (WQ[1] - WC[1]) * ratio];      // (the map measured 0.3 m up, not 1 m: close to the lens a point 1 m up projected wildly, shot E)
  // (the affine map sending P0, P1, P2 to P0, P1, Q2: solved for the 2x3 matrix)
  const sx = [P0[0], P1[0], P2[0]], sy = [P0[1], P1[1], P2[1]], dx = [P0[0], P1[0], Q2[0]], dy = [P0[1], P1[1], Q2[1]];
  const den = sx[0] * (sy[1] - sy[2]) + sx[1] * (sy[2] - sy[0]) + sx[2] * (sy[0] - sy[1]); if (Math.abs(den) < 1e-6) return;
  const solve3 = (v: number[]) => [(v[0] * (sy[1] - sy[2]) + v[1] * (sy[2] - sy[0]) + v[2] * (sy[0] - sy[1])) / den, (v[0] * (sx[2] - sx[1]) + v[1] * (sx[0] - sx[2]) + v[2] * (sx[1] - sx[0])) / den,
    (v[0] * (sx[1] * sy[2] - sx[2] * sy[1]) + v[1] * (sx[2] * sy[0] - sx[0] * sy[2]) + v[2] * (sx[0] * sy[1] - sx[1] * sy[0])) / den];
  const ax = solve3(dx), ay = solve3(dy);
  SH ??= cnv(); SM ??= cnv(); const sh = SH.getContext("2d") as unknown as G, sm = SM.getContext("2d") as unknown as G;
  sh.setTransform(1, 0, 0, 1, 0, 0); sh.clearRect(0, 0, FM.W, FM.H); sh.setTransform(ax[0], ay[0], ax[1], ay[1], ax[2], ay[2]); sh.drawImage(fig as CanvasImageSource, 0, 0);
  sh.setTransform(1, 0, 0, 1, 0, 0); sh.globalCompositeOperation = "source-in"; sh.fillStyle = "#3a1806"; sh.fillRect(0, 0, FM.W, FM.H); sh.globalCompositeOperation = "source-over";
  sm.setTransform(1, 0, 0, 1, 0, 0); sm.clearRect(0, 0, FM.W, FM.H); sm.fillStyle = "#ffffff";
  for (const d of [0]) for (const [x0, x1, z0, z1] of PANES) { const q = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]].map(([px, pz]) => project(id, fr, [px + d, Math.max(3.2 - pz * SUN_BACK + d, c[1] + 0.12), 0]));      // (the patch's far end held in front of the lens: behind it the corners projected wildly, E v46)
    sm.beginPath(); q.forEach((p, i) => (i ? sm.lineTo(p[0], p[1]) : sm.moveTo(p[0], p[1]))); sm.closePath(); sm.fill(); }
  // (minus the table's own shadow on the floor, from its box and the sun's slope: the hand's shadow fell inside it as a floating blob in A, v34-v40.
  //  v41-v44 used the canvas's brightness for this, but the plate is not on that canvas: it read black everywhere and took every cast shadow away)
  { const TX0 = -1.447, TX1 = -0.583, TY0 = 0.823, TH = 0.488, L = TH * SUN_BACK, q = [[TX0, TY0 + 0.02], [TX1, TY0 + 0.02], [TX1, TY0 - L], [TX0, TY0 - L]].map(([px, py]) => project(id, fr, [px, py, 0]));
    sm.globalCompositeOperation = "destination-out"; sm.fillStyle = "#000"; sm.beginPath(); q.forEach((p, i) => (i ? sm.lineTo(p[0], p[1]) : sm.moveTo(p[0], p[1]))); sm.closePath(); sm.fill(); sm.globalCompositeOperation = "source-over"; }
  // (only when his soles stand in the sun: a shadow that does not start at the feet floats (A2a v51, where the sun patch lies in front of him); then
  //  only the contact shadows under his feet are drawn)
  sh.globalCompositeOperation = "destination-in"; sh.drawImage(SM as CanvasImageSource, 0, 0); sh.globalCompositeOperation = "source-over";
  // (and the shadow left in the sun must touch the soles: in A2a v52 the patch held his sole point but the shadow's sunny part lay 30 px
  //  off the feet, floating (the independent review); a band across the soles, as wide as his stance, must hold some of it)
  { const bx = Math.round(Math.max(0, C[0] - half * 1.4)), by = Math.round(Math.max(0, C[1] + 6)), bw = Math.round(Math.min(FM.W - bx, half * 2.8)), bh = Math.round(Math.min(FM.H - by, 36));      /* (the band just below the soles, outside the boots: at the soles themselves the boots cover the shadow and A2a's floating patch passed) */
    if (C[1] > FM.H || bw < 2 || bh < 2) return;
    const px = sh.getImageData(bx, by, bw, bh).data; let n = 0; for (let i = 3; i < px.length; i += 4) if (px[i] > 100) n++;
    if (n < 0.08 * bw * bh) return; }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); for (const [ox, oy] of [[0, 0], [3, 2], [-3, 2], [2, -3], [-2, -3]]) { g.globalAlpha = 0.5 / 5 * (ox || oy ? 1.05 : 0.8); g.drawImage(SH as CanvasImageSource, ox, oy); } g.restore(); };      // (five copies a few px apart: a soft edge like the table's shadow, v45's was hard; no canvas blur headless)
/** the figures of a shot at frame fr over the plate, the farthest first: contact shadows, the figure, the cabin's light on his fill (the ink
 *  kept), the red face and the sweat, the lens blur at his depth. Nothing is drawn but the rig's own figure (its own two hands) */
export const paintFigures = (g: G, id: string, fr: number, whos: Who3[]) => {
  const t = fr / FM.FPS;
  const order = whos.map((w) => ({ w, pl: placeOf(id, fr, w) })).sort((p, q) => q.pl.depth - p.pl.depth);
  for (const { w, pl } of order) {
    const f = pl.f;
    // contact shadows: a soft dark ellipse under each foot on the floor (a radial gradient, squashed to the floor's ellipse in the picture:
    // the canvas blur filter does nothing in the headless render, so v17's were hard-edged and faint), smaller and fainter as a foot lifts
    if (!w.sil) for (const ft of feetOf(id, fr, w)) { const c0 = project(id, fr, [ft.world[0], ft.world[1] + 0.02, 0]), ex = project(id, fr, [ft.world[0] + 0.16, ft.world[1] + 0.02, 0]), ey = project(id, fr, [ft.world[0], ft.world[1] + 0.12, 0]);
      // (centred on the floor under the drawn foot (its ankle's x on the figure's ground line), so it stays on the floor when the foot lifts and the gap
      //  shows: v39's sat on the projected world point, behind the boot, so a lifted boot read as sliding back, the reviewer)
      const an = jointPx(f, "an" + ft.side), c = toScreen(pl, [an[0], footY(f.who) - 4]);
      const kl = 1 - 0.5 * Math.min(1, ft.up / 0.04), rx = Math.max(4, kl * Math.hypot(ex[0] - c0[0], ex[1] - c0[1])), ry = Math.max(2, kl * Math.hypot(ey[0] - c0[0], ey[1] - c0[1])), al = ft.up > 0.004 ? 0.75 : 0.8;      /* (a lifted boot: a smaller, darker shadow right under it, so the gap reads as a lift; the full-size one spread too thin to see, v40) */      // (a lifted boot keeps a clear soft shadow on the floor under it, so the gap reads as a lift, v40)
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
      const ru = w.redAt === undefined ? 0 : smooth((t - w.redAt) / 0.5) * (w.redMax ?? 1);
      // (every weight smooth, no pixel sorted by a hard threshold: the anti-aliased edges of thin lines crossed such thresholds from frame to
      //  frame and flickered, v9-v16. wf = how much a pixel is fill (not ink), from its distance to the ink's colour and its alpha; the rim
      //  only on the figure's own edge (a neighbour toward the windows outside him), not along every inner line)
      const A = (i: number) => Dd[i * 4 + 3] / 255, wf = (k: number) => Math.min(1, Math.max(0, (Math.abs(Dd[k] - 36) + Math.abs(Dd[k + 1] - 23) + Math.abs(Dd[k + 2] - 38) - 30) / 40)) * (Dd[k + 3] / 255);
      const out = new Float32Array(N * 3); let kx0 = Wd, kx1 = 0; if (w.key) for (let y = 0; y < FM.H; y += 8) for (let x = 0; x < Wd; x += 4) if (Dd[(y * Wd + x) * 4 + 3] > 128) { kx0 = Math.min(kx0, x); kx1 = Math.max(kx1, x); }
      for (let y = 0; y < FM.H; y++) for (let x = 0; x < Wd; x++) { const i = y * Wd + x, k = i * 4; if (Dd[k + 3] < 2) continue; const f0 = wf(k); if (f0 <= 0) { out[i * 3] = Dd[k]; out[i * 3 + 1] = Dd[k + 1]; out[i * 3 + 2] = Dd[k + 2]; continue; }
        let r = Dd[k] * 0.8 + 6, gg = Dd[k + 1] * 0.7, b = Dd[k + 2] * 0.66;
        if (w.key) { const q = w.key * Math.min(1, Math.max(0, (dx > 0 ? x - kx0 : kx1 - x) / Math.max(1, kx1 - kx0))); r = r * (1 + 0.42 * q) + 22 * q; gg = gg * (1 + 0.3 * q) + 12 * q; b = b * (1 + 0.08 * q); }      // (a warm light from the windows' side across him (B), graded smoothly over his width: the side wall behind him is dark, v39)
        const xr = Math.min(Wd - 1, Math.max(0, x + dx * rim)), yr = y - Math.round(rim * 0.7), outside = yr < 0 ? 0 : Math.max(1 - A(yr * Wd + xr), 1 - A(y * Wd + xr));
        if (outside > 0) { const q = outside; r = r * (1 - q) + Math.min(255, r * 1.18 + 52) * q; gg = gg * (1 - q) + Math.min(255, gg * 1.1 + 28) * q; b = b * (1 - q) + (b * 0.96 + 4) * q; }
        if (ru > 0) { const sk = Math.min(1, Math.max(0, (Dd[k] - Dd[k + 2] - 45) / 30)) * Math.min(1, Math.max(0, (Dd[k] - 150) / 40))      /* (smooth: the colour-order test was a hard step that the outlines' soft edges crossed from frame to frame, a flicker at the eyes, v23) */, dd = Math.hypot(x - hc[0], (y - hc[1]) * 1.15) / hr;
          if (sk > 0 && dd < 1.0) { const mm = 0.72 * ru * sk * Math.min(1, (1.0 - dd) / 0.4); r = r * (1 - mm) + 214 * mm; gg = gg * (1 - mm) + 58 * mm; b = b * (1 - mm) + 52 * mm; } }
        out[i * 3] = Dd[k] * (1 - f0) + r * f0; out[i * 3 + 1] = Dd[k + 1] * (1 - f0) + gg * f0; out[i * 3 + 2] = Dd[k + 2] * (1 - f0) + b * f0; }
      for (let i = 0; i < N; i++) if (Dd[i * 4 + 3] >= 2) { Dd[i * 4] = out[i * 3]; Dd[i * 4 + 1] = out[i * 3 + 1]; Dd[i * 4 + 2] = out[i * 3 + 2]; }
    }
    h.putImageData(img, 0, 0);
    if (!w.sil && SUN_SHOTS.has(id)) castShadow(g, id, fr, w, o);      // (only where the plate's own sun patch lies under his feet in the picture: in A2a the geometric patch and the plate's light disagree and a shadow floated 30 px off his feet through v52b, two independent reviews)
    // (no canvas blur on the figures: the filter works in stills but not in the headless render, so the stills misled (v13-v18); the
    //  figures stand in the focused plane in every shot, and the plate keeps Blender's own depth of field)
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(o as CanvasImageSource, 0, 0); g.restore();
  } };

/** where sweat may run (on the skin, in the head's own units: its centre 0, its radius 1, x toward the screen's right, y down): in three-
 *  quarter (facing the screen's right, D) the near cheek and temple between the ear and the eye, under the cap's band; the drops' places
 *  and the check's skin zone (scripts/cabin_check.mjs) both come from here. v19's drop sat on the cap's gold band and beside the cap */
export const SWEAT_ZONE = { x0: -0.92, x1: -0.14, y0: -0.34, y1: 0.2 };
export const SWEAT_DROPS: [number, number, number][] = [[0, -0.3, -0.17]];      // (one drop, in the clear patch of skin between the ear, the squeezed eye and the cap (two touched the eye and the ear at full size, v37); grown before the cut into D2 and running slowly through it, so it is never a tiny dark dot)
/** each drop's place in the head's units at time a0 after the sweating starts, or null when it isn't there (it lives 0.7 s) */
/** where a drop sits on the head (in head radii): on a turned head as listed; on a front-facing head (D1) out beside the eye, between it and
 *  the ear, a little lower (the face is wide from the front: v34's drop sat on the eye's outline, v35's first try above its corner) */
export const dropAt = (dr: { x: number; y: number }, sin: number) => Math.abs(sin) < 0.25 ? { x: dr.x * 2.3, y: dr.y * 0.5 - 0.03 } : { x: dr.x, y: dr.y };      // (front: between the eye ring and the head's outline: at 1.9 it touched his eye, at 2.55 the outline when his head tips (D1, v52))      // (from the front the temple between the cap's brim and the moustache's curled tip is about a third of a head radius high: a short run, inside it)
export const sweatDrops = (a0: number) => SWEAT_DROPS.map(([t0, x, y]) => { const a = a0 - t0; return a < 0 || a > 1.4 ? null : { x, y: (PLANT.sweatOut ? -0.75 : y) + (a / 1.2) * 0.07, al: 1, sz: Math.min(1, a / 0.2, (1.4 - a) / 0.2) }; });      // (a drop grows in and shrinks away, never see-through: a quick fade flickered, v21)
/** sweat: drops on the skin of the near cheek and temple, running down, one after another, with an outline as thick as the figure's own */
export const sweat = (h: G, f: Fig, a0: number) => {
  const s0 = jointPx(f, "skull"), c0 = jointPx(f, "crown"), sk: P2 = [(s0[0] + c0[0]) / 2, (s0[1] + c0[1]) / 2], R0 = Math.hypot(c0[0] - s0[0], c0[1] - s0[1]) / 2, side = f.sk.sin >= 0 ? 1 : -1;
  for (const dr of sweatDrops(a0)) { if (!dr) continue;
    const q = dropAt(dr, f.sk.sin), x = sk[0] + side * q.x * R0, y = sk[1] + q.y * R0, d = Math.max(R0 * 0.046, 22) * Math.max(0.05, dr.sz);      // (the strip of skin between the cap's brim and the ear is about a quarter of a head radius high in the close-up: v35's bigger drops lay on the ear)      // (never smaller than in a close-up: D1's drops were a few pixels on the phone, v34)
    h.save(); h.globalAlpha = Math.max(0, Math.min(1, dr.al)); h.beginPath(); h.moveTo(x, y - d * 1.8); h.quadraticCurveTo(x + d, y + d * 0.2, x, y + d * 0.8); h.quadraticCurveTo(x - d, y + d * 0.2, x, y - d * 1.8); h.closePath();
    h.fillStyle = "#bfe6ff"; h.fill(); h.lineWidth = D.ol * scaleOf(f.who) * 0.8 * Math.min(1, 0.25 + dr.sz);      /* (a thin outline while it grows: v35's new drop was all outline and read as a black mole) */ h.strokeStyle = "#241726"; h.lineJoin = "round"; h.stroke(); h.restore(); } };

export { lerp, smooth };

// ------------------------------------------------------------------ captions ------------------------------------------------------------------
import { captions, capWidth } from "../stage/film";
/** the voice's times in the film (the mix places each take from its own start: audio/cabin3d_audio.py) */
export const VOICE_AT = { c01: 1.0, c02: 2.95 };      // (Will is quicker than Daniel: at 2.95 'on' falls just after the cut into B2, as before, and the line ends 4.37, before E)
const WORDS = [...C01.words.map((w, i) => ({ ...w, w: i === 0 ? w.w.replace(/[,.]$/, "!") : w.w, a: w.a + VOICE_AT.c01, b: w.b + VOICE_AT.c01, line: "c01" })), ...C02.words.map((w) => ({ ...w, a: w.a + VOICE_AT.c02, b: w.b + VOICE_AT.c02, line: "c02" }))];
// (one word at a time, in step with the voice: DAILY-RULES point 6; the shared captions() groups one to three words, v34. Each word stays until
//  the next one starts, or 0.3 s past its end in a pause; never past a cut by less than 0.4 s)
export const CAPS = ((): { a: number; b: number; text: string }[] => { const cuts = SHOTS.slice(1).map((s) => s.t0), out = WORDS.map((w, i) => {
  const n = WORDS[i + 1], b = n && n.line === w.line && n.a - w.b < 0.3 ? n.a : w.b + 0.3; return { a: w.a, b, text: w.w.toUpperCase().replace(/[.,":;]/g, "") }; });
  for (const c of out) for (const x of cuts) if (x > c.a + 0.15 && x < c.b && c.b - x < 0.4) c.b = x;
  return out; })();
void captions;
/** where the band stands in each shot (pixels from the top): the lower third, below the faces, chests and hands; in B above the boy (stage/film.ts allows a shot's band above its figures) */
const CAP_TOPS: Record<string, number> = { A: 1400, A1b: 1515, A2a: 1400, A2b: 1660, B1: 1400, B2: 1400, E: 1400, D1: 1400, D2: 1400 };      // (one height for every word, the reviewer on v44; A1b lower because at 1400 "BOY!" lay on his chin in the close-up; A2b lower: at 1400 the words would lie on his chest and fist in a medium shot, so they sit over his thighs)
export const captionAt = (T: number) => { const c = CAPS.find((q) => T >= q.a - 0.03 && T < q.b); if (!c) return null; const sh = SHOTS.find((s) => T >= s.t0 && T < s.t1) ?? SHOTS[SHOTS.length - 1];
  const sz = Math.round(96 * Math.min(1, 8.9 / capWidth(c.text))), w = Math.min(1020, capWidth(c.text) * 1.194 * sz) * (PLANT.capWide ? 1.6 : 1), top = (CAP_TOPS[sh.id] ?? 1440) - (PLANT.capWide ? 110 : 0);      // (capWide: the planted caption, wider and down at the hands' height: the check must fail it)
  return { text: c.text, sz, box: [540 - w / 2, top, 540 + w / 2, top + sz * 1.08] as [number, number, number, number] }; };
export const paintCaption = (g: G, T: number) => { const c = captionAt(T); if (!c) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = `900 ${c.sz}px 'Arial Black', Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "top"; g.lineJoin = "round";
  g.lineWidth = 18; g.strokeStyle = "#141018"; g.strokeText(c.text, 540, c.box[1]); g.fillStyle = "#fff4c2"; g.fillText(c.text, 540, c.box[1]); g.restore(); };

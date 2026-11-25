// The Short "The captain's dinner": who is in each shot and what they do, in film time. The captain sits on his stool at the table's right
// end, in profile facing the table (left), his head turned to the lens; the crewman and the boy stand in front of the table's left half,
// facing him. Nobody walks. The pudding (3D, on the plate) is taken by the crewman's hand in 1a and held in it after: its place every frame
// comes from that hand (scripts/dinner_props.mjs writes it for Blender), and in the held shots his hand is solved onto its fixed place.
// Voices: George narrates and is the captain (two short shouted lines), Daniel the crewman, Will the boy (voice/dinner/*, pick.json).
import { SAILOR_LOOK } from "../wardrobe/cast";
import type { Pose } from "../rig";
import { solve } from "../rig";
import { ease } from "../stage/acting";
import { figure, D, scaleOf, heightOf, FM, jointPx, footY, px } from "../clips/clipKit";
import type { Look } from "../designs/common";
import { SHOTS, HEIGHTS, CAPTAIN, BOY, PLANT, headingIn, viewOf, project, unproject, type Who } from "./core";
import SPEC from "./shots.json";
import N1 from "../../../voice/dinner/n1/pick.json";
import N3 from "../../../voice/dinner/n3/pick.json";
import N5 from "../../../voice/dinner/n5/pick.json";
import N7 from "../../../voice/dinner/n7/pick.json";
import K2 from "../../../voice/dinner/k2/pick.json";
import K6 from "../../../voice/dinner/k6/pick.json";
import D4 from "../../../voice/dinner/d4/pick.json";
import W8 from "../../../voice/dinner/w8/pick.json";

type Seg2 = [number, number];
type P3 = [number, number, number];
const R = Math.PI / 180;
const smooth = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
/** the crewman: a brown coat, a cream waistcoat, a red neckerchief, a dark blue cap, his own brown moustache (the frozen rig's parts, recoloured) */
export const CREW: Look = SAILOR_LOOK;      // (v6: the sailor of the wardrobe)
const FIGS = SPEC.figs as unknown as Record<string, [number, number]>;
export { FIGS };
export const PLATE: [number, number] = SPEC.plate as [number, number];
export const TABLE_TOP = 0.488;
/** the voices: each take placed so its speech starts on its beat (onsets measured: the file's first 0.03-0.1 s are silence) */
export const VOICES = [
  { id: "n1", who: "narrator", at: -0.05, p: N1 }, { id: "k2", who: "captain", at: 1.99, p: K2 }, { id: "n3", who: "narrator", at: 2.72, p: N3 },
  { id: "d4", who: "crew", at: 12.15, p: D4 }, { id: "n5", who: "narrator", at: 13.35, p: N5 }, { id: "k6", who: "captain", at: 15.4, p: K6 },
  { id: "n7", who: "narrator", at: 16.75, p: N7 }, { id: "w8", who: "boy", at: 22.0, p: W8 }] as const;
export const FILM_S = SHOTS[SHOTS.length - 1].t1;

/** a speaker's mouth at film time T: the take's loudness (env30), at most 0.12 a frame, every turn held a frame (as cabin.ts), and inside
 *  his talking shot never under 0.22 (the design's lower lip switches at 0.2: it must not cross inside a shot) */
const mouthOf = (ids: string[], t0: number, t1: number) => { const n = Math.round((FILM_S + 0.5) * FM.FPS), tr: number[] = []; let prev = 0, lastDir = 0, held = false, dv0 = 0;      /* (dv0: the last step; each step at most 0.04 more than it, so the mouth builds up its speed: from rest to 0.1 in one frame it flickered in the eye circle, 12.20 s) */
  for (let f = 0; f < n; f++) { const T = f / FM.FPS; let tg = 0; for (const v of VOICES) if (ids.includes(v.id)) { const k = Math.round((T - v.at) * FM.FPS), e = (v.p as { env30: number[] }).env30; if (k >= 0 && k < e.length) tg = Math.max(tg, ((e[k - 1] ?? 0) + e[k] + (e[k + 1] ?? 0)) / 3); }      /* (three frames averaged: the first syllable's spike put the lip out and back, an eye-circle flicker at 12.20 s) */
    let v = prev + Math.max(-0.1, Math.min(0.1, Math.max(dv0 - 0.04, Math.min(dv0 + 0.04, tg - prev)))); dv0 = v - prev; const dir = Math.abs(v - prev) < 1e-4 ? 0 : Math.sign(v - prev);
    if (dir !== 0 && lastDir !== 0 && dir !== lastDir && !held) { v = prev; held = true; } else { held = false; if (dir !== 0) lastDir = dir; }
    tr.push(v); prev = v; }
  return (T: number) => { const k = Math.round(T * FM.FPS); return T >= t0 && T < t1 ? 0.22 + 0.7 * (tr[k] ?? 0) : null; }; };

/** the arm in the picture's plane (the figures are near profile): two links putting the grip (the forearm's line through 0.45 of the hand)
 *  on T, in skeleton units from his ground point; the elbow bent the way an elbow bends. Returns how far short it falls (skeleton units) */
const armTo = (sk: ReturnType<typeof solve>, side: "L" | "R", T: [number, number], toWrist = false): { arm: [Seg2, Seg2]; miss: number } => {
  // (the arm swings in the figure's own front-back plane; seen at a heading its sideways part in the picture is shortened by sin(heading):
  //  the target is taken back into that plane (x / sin), solved there, and the arm's swings are the same in the picture)
  const P = sk.P, S = sk.j[`sh${side}`] as unknown as number[], a = P.upper, b = toWrist ? P.fore : P.fore + 0.45 * P.hand, sn = Math.abs(sk.sin) > 0.3 ? sk.sin : Math.sign(sk.sin || 1) * 0.3;
  let dx = (T[0] - S[0]) / sn, dy = T[1] - S[1]; const d0 = Math.hypot(dx, dy), lim = (a + b) * 0.999, d = Math.min(d0, lim);
  if (d0 > lim) { dx *= lim / d0; dy *= lim / d0; }
  const base = Math.atan2(dx, dy), A = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
  const sols = [1, -1].map((sg) => { const s1 = base - sg * A, ex = Math.sin(s1) * a, ey = Math.cos(s1) * a, s2 = Math.atan2(dx - ex, dy - ey); return [s1 / R, s2 / R]; });
  const [s1, s2] = sols.find(([u, v]) => v - u >= -0.5) ?? sols[0];
  return { arm: [[s1, 0], [s2, 0]], miss: Math.max(0, d0 - lim) };
};
/** a world point in a figure's skeleton units (his card plane: along the picture's right from his pelvis's floor point, and up) */
const skOf = (id: string, at: [number, number], h: number, pelX: number, p: P3): [number, number] => { const v = viewOf(id), u = (scaleOf("sir") / FM.PPM) * (h / heightOf("sir"));
  return [((p[0] - at[0]) * v.right[0] + (p[1] - at[1]) * v.right[1]) / u + pelX, -p[2] / u]; };
/** where the ray through picture point q meets the vertical plane through the floor point `at` across the lens */
export const onCard = (id: string, fr: number, q: [number, number], at: [number, number]): P3 => { const a = unproject(id, fr, q, 1), b = unproject(id, fr, q, 3), v = viewOf(id);
  const n = [v.d[0], v.d[1]], fa = (a[0] - at[0]) * n[0] + (a[1] - at[1]) * n[1], fb = (b[0] - at[0]) * n[0] + (b[1] - at[1]) * n[1], u = fa / (fa - fb);
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u]; };
/** the head turned so the face is in the design's three-quarter drawing toward the lens (|sin| of its turn about 0.7) */
const headTo = (yaw: number, nod = 0, tilt = 0): [number, number, number] => [Math.sign(yaw) * 45 - yaw, nod, tilt];

// ------------------------------------------------------------------ the pudding ------------------------------------------------------------------
/** the pudding's centre over the hand that holds it: it rests on the open palm (forearm level: the rig draws that hand palm up) */
const PUD_UP = 0.09;      // (the pudding's base over the grip: on the open palm)      // (its own radius over the open palm: held lower, the hand drawn over it hid it, the first stills)
/** the held shots: the crewman's holding arm is set (upper arm a little forward, the forearm level, the open hand palm up) and the pudding
 *  is put on that hand (its place written for Blender from the drawn hand at the shot's first frame); in 5a and 6 he raises it */
export const HELD: Record<string, [Seg2, Seg2]> = { "1a": [[24, 6], [136, 2]], "3a": [[24, 6], [136, 2]], "3b": [[20, 6], [128, 2]], "3c": [[40, 6], [104, 2]], "3d": [[40, 6], [104, 2]], "4": [[14, 6], [118, 2]], "5a": [[92, 6], [118, 2]], "6": [[56, 6], [150, 2]], "8a": [[40, 6], [104, 2]], "8c": [[40, 6], [104, 2]] };      // (held up by his shoulder, toward the lens side of him: held out low it lay between him and the captain and their hands met, the stills of 17:55)      // (close to his chest: held out, his hand met the captain's knees in the two-shots, the stills of 17:50)
/** 1a: the pudding on the plate until his hand has it (0.42 s), then lifted up and away to the left, out of the picture */
export const PUD_PLATE: P3 = [PLATE[0], PLATE[1], TABLE_TOP + 0.04];
export const pud1a = (t: number): P3 => { const u = smooth((t - 0.42) / 0.75); return [PUD_PLATE[0] - 0.42 * u, PUD_PLATE[1] - 0.12 * u, PUD_PLATE[2] + 0.3 * u * (1.2 - 0.2 * u)]; };
/** the pudding (world) in 1a at frame fr (the held shots' places come from the hand: scripts/dinner_props.mjs) */
export const pudAt = (_id: string, _fr: number): P3 | null => null;      // (no shot moves it now: 1a opens with it in his hand)
export { PUD_UP };
/** how far each holding hand fell short of its target in the last solve (metres): the checks read it */
export const MISS: Record<string, number> = {};

// ------------------------------------------------------------------ the figures ------------------------------------------------------------------
const SH = Object.fromEntries(SHOTS.map((s) => [s.id, s]));
const HANDS_ON_KNEES: [Seg2, Seg2] = [[0, 8], [28, -6]];      /* (on his thighs near the hips: on the knees the big hand reached over the table's corner in shot 5, dinner_depth) */      // (on his thighs, near the body: on the knees his hands reached out to the crewman's, 17:55)
/** the captain on his stool (the rig's seat: pelvis back 0.52 and down 0.43 leg lengths over the feet, as clip 07's approved sit) */
export const SIT = { pz: -0.52, py: -0.43, lean: 8 };
const captain = (id: string): Who => { const s = SH[id], t0 = s.t0, T = (x: number) => x - 0.02, yaw = headingIn(id, [-1, 0]), m = figure("sir", 0, yaw); m.stand(40);
  const H = (nod = 0, tilt = 0) => headTo(yaw, nod, tilt), seat = { ...SIT, py: SIT.py + (PLANT.seatHigh ? 0.05 / 0.414 : 0) };
  // faces in film time: reaching for his pudding (0-1.2), staring at the empty plate (1.2-2.0), "Hey!" (2.0-2.7), glaring (2.7-13), biting his
  // lip (13.1-15), "That was MY pudding!" leaning in (15-16.3), deflated (16.3-18.5), worried, then pale at "vote him out" (20.7)
  ease(m, -1, { ...seat, head: H(4) }, 0.01, { face: { pupil: 1, gaze: [-0.5, 0.5], smile: 0.6, brow: 0.5, wide: 0.2, lid: 0 } });
  ease(m, T(1.2), { ...seat, head: H(8) }, 0.01, { face: { pupil: 1, gaze: [-0.6, 0.6], smile: -0.5, brow: 0.9, wide: 0.45, lid: 0, mouth: 0 } });
  ease(m, T(2.0), { ...seat, lean: 14, head: H(-6) }, 0.01, { face: { pupil: 1, gaze: [-0.6, -0.1], smile: -0.8, brow: -1, wide: 0.3, lid: 0 } });
  ease(m, T(2.7), { ...seat, head: H(0) }, 0.01, { face: { pupil: 1, gaze: [-0.7, 0], smile: -0.7, brow: -0.9, wide: 0, lid: 0.25, mouth: 0 } });
  ease(m, T(13.4), { ...seat, head: H(4) }, 0.01, { face: { pupil: 1, gaze: [-0.7, 0.1], smile: -0.9, brow: -1, teeth: 1, mouth: 0.1, lid: 0.3 } });
  ease(m, T(14.3), { ...seat, head: H(4) }, 0.6, { face: { pupil: 1, gaze: [-0.7, 0.1], smile: -1, brow: -1, teeth: 1, mouth: 0.1, lid: 0.45 } });      // (biting it harder: the eyes narrow)
  ease(m, T(15.3), { ...seat, lean: 26, head: H(-4) }, 0.01, { face: { pupil: 1, gaze: [-0.7, 0], smile: -0.9, brow: -1, wide: 0.35, lid: 0, teeth: 0 } });
  ease(m, T(16.7), { ...seat, lean: 4, head: H(10) }, 0.01, { face: { pupil: 1, gaze: [-0.6, 0.3], smile: -0.5, brow: 0.2, sad: 0.6, wide: 0, lid: 0.2, mouth: 0 } });
  ease(m, T(18.9), { ...seat, lean: 6, head: H(4) }, 0.01, { face: { pupil: 1, gaze: [-0.6, 0], smile: -0.4, brow: 0.6, sad: 0.6, wide: 0.2, lid: 0, mouth: 0 } });
  ease(m, T(20.4), { ...seat, lean: 3, head: H(0, -3) }, 1.9, { face: { pupil: 1, gaze: [-0.6, 0], smile: -0.8, brow: 0.8, sad: 1, wide: 0.38, lid: 0, mouth: 0 } });      /* (slow and small, the gaze kept: over 0.9 s it flickered in his eyes, flicker2 on t2-t3) */      // (he understands: eyes wide, brows up in the middle)
  const mouth = id === "2" ? mouthOf(["k2"], s.t0, s.t1) : id === "7" ? mouthOf(["k6"], s.t0, s.t1) : null;
  const at = FIGS.captain;
  const hook = (t: number, p: Pose, heading: number): Pose => { const g = t, sk = solve(D.props("sir"), p, heading), pelX = (sk.j.pelvis as unknown as number[])[0];
    let q: Pose = { ...p, armL: HANDS_ON_KNEES, armR: HANDS_ON_KNEES, twist: 0 };
    if (g < 2.7) {      // reaching for the pudding: from his knee (0.55 s) to over the plate's near edge (1.1 s), held there through "Hey!"
      const tgt: P3 = [-0.72, PLATE[1], 0.6], T2 = skOf(id, at, HEIGHTS.captain, pelX, tgt), r = armTo(sk, sk.near, T2);
      q = { ...q, [`arm${sk.near}`]: r.arm, [`hand${sk.near}`]: 0 } as Pose; }
    if (g >= 2.0 && g < 2.7) q = { ...q, armL: [[40, 26], [150, 8]], armR: [[40, 26], [150, 8]] };      // ("Hey!": both fists up at his chest, inside the close-up)
    if (g >= 15.3 && g < 16.7) {      // both hands flat on the table top, leaning in
      for (const [side, dz] of [[sk.near, 0], [sk.far, 0.01]] as ["L" | "R", number][]) { const tgt: P3 = [-0.68 - dz * 3, PLATE[1], TABLE_TOP + 0.03 + (PLANT.handIn ? -0.04 : 0)], r = armTo(sk, side, skOf(id, at, HEIGHTS.captain, pelX, tgt));
        q = { ...q, [`arm${side}`]: r.arm, [`hand${side}`]: 90 - r.arm[1][0] } as Pose; /* (the hand flat on the top, pointing along it) */ MISS["captain table " + side] = r.miss; } }
    return q; };
  return { name: "captain", at, walk: viewOf(id).right, h: HEIGHTS.captain, rimSide: 1, off: t0, sun: false, redAt: id === "2" ? 2.05 : id === "3b" ? -1 : id === "5" ? 13.6 : id === "7" ? -1 : undefined, redMax: id === "5" ? 0.75 : id === "7" ? 1.1 : id === "3b" ? 0.5 : 0.8,
    cast: { name: "captain", m, who: "sir", look: CAPTAIN, seed: 33,      /* (seed 33: his one blink at 14.0 s, between the faces; seed 1 blinked in "MY pudding!") */ armWipe: false, pose: hook,
      hands: { L: [[0, (t0 >= 15.3 && t0 < 16.7) ? "open" : t0 >= 2.0 && t0 < 2.7 ? "fist" : t0 < 2.7 ? "open" : "relaxed"]], R: [[0, (t0 >= 15.3 && t0 < 16.7) ? "open" : t0 >= 2.0 && t0 < 2.7 ? "fist" : t0 < 2.7 ? "open" : "relaxed"]] },
      ...(mouth ? { mouth: { t0: 0, len: Math.round(s.t1 * FM.FPS), mouth: Array.from({ length: Math.round(s.t1 * FM.FPS) }, (_, f) => mouth(f / FM.FPS) ?? 0) }      /* (indexed by the film's frame, as castAt reads it: by the shot's frame every mouth stayed shut, the review of v3) */ } : {}) } };
};

const crew = (id: string): Who => { const s = SH[id], t0 = s.t0, T = (x: number) => x - 0.02, yaw = headingIn(id, [1, 0]), m = figure("sir", 0, yaw); m.stand(40);
  const H = (nod = 0, tilt = 0) => headTo(yaw, nod, tilt);
  ease(m, -1, { lean: 6, head: H(4) }, 0.01, { face: { pupil: 1, gaze: [0.4, 0.4], smile: 0.8, brow: 0.3, lid: 0.15 } });
  ease(m, T(4.3), { lean: 2, head: H(-6) }, 0.01, { face: { pupil: 1, gaze: [0.3, 0.3], smile: 1, brow: 0.6, lid: 0.55 } });      // (pleased with it, eyes half shut)
  ease(m, T(7.3), { lean: 4, head: H(2) }, 0.01, { face: { pupil: 1, gaze: [0.7, 0], smile: 0.7, brow: -0.2, lid: 0.2 } });
  ease(m, T(8.7), { lean: 12, head: H(-2) }, 0.01, { face: { pupil: 1, gaze: [0.8, 0], smile: -0.8, brow: -1, teeth: 1, mouth: 0.1, lid: 0.25 } });      // (the growl: teeth bared, no words)
  ease(m, T(9.8), { lean: -4, head: H(-12) }, 0.01, { face: { pupil: 1, gaze: [0.3, -0.6], smile: 1, brow: 0.8, lid: 0, wide: 0.2, teeth: 0, mouth: 0 } });      // (holding it up, admiring)
  ease(m, T(12.1), { lean: 2, head: H(0) }, 0.01, { face: { pupil: 1, gaze: [0.7, 0], smile: 0.8, brow: 0.5, lid: 0.2 } });
  ease(m, T(16.7), { lean: 4, head: H(2) }, 0.01, { face: { pupil: 1, gaze: [0.7, 0], smile: 0.6, brow: 0.2, lid: 0.15, mouth: 0 } });
  ease(m, T(21.9), { lean: 2, head: H(-4) }, 0.01, { face: { pupil: 1, gaze: [0.6, -0.2], smile: 0.9, brow: 0.6, lid: 0.1 } });
  const mouth = id === "6" ? mouthOf(["d4"], s.t0, s.t1) : null, at: [number, number] = FIGS.crew;      // (1a: just off the picture's left, at the table's front edge, so his arm reaches the plate; after the cut he stands back)
  // (the held hand's grip at the shot's first frame, in skeleton units from his ground point: the pin for every frame after)
  const PIN: [number, number] | null = HELD[id] ? (() => { const p0 = m.sample(t0).pose, nn = solve(D.props("sir"), p0, yaw).near, sk0 = solve(D.props("sir"), { ...p0, twist: 0, [`arm${nn}`]: HELD[id], [`hand${nn}`]: 90 - HELD[id][1][0] } as Pose, yaw), n = sk0.near, W = sk0.j[`wr${n}`] as unknown as number[], T = sk0.j[`tip${n}`] as unknown as number[];
    void T; return [W[0] - (PLANT.pudOff ? 0.03 / ((scaleOf("sir") / FM.PPM) * (HEIGHTS.crew / heightOf("sir"))) : 0), W[1]]; })() : null;      // (the WRIST pinned; the hand kept level from it: pinning the grip through a bent hand drifted 1 cm)
  const hook = (t: number, p: Pose, heading: number): Pose => { const g = t, fr = Math.round((t - t0) * FM.FPS), sk = solve(D.props("sir"), p, heading), pelX = (sk.j.pelvis as unknown as number[])[0];
    let q: Pose = { ...p, armL: [[20, 25], [60, 0]], armR: [[20, 25], [60, 0]], twist: 0 };      // (the free hand on his hip: hanging, it fell out of the close-ups' bottom edge)
    // the hand that holds the pudding: on it every frame (its world place fixed in each held shot, its path in 1a)
    if (false) { const P = pud1a(t - t0), px1 = project(id, fr, [P[0], P[1], P[2] - PUD_UP]), tgt = onCard(id, fr, [px1[0], px1[1]], at);      // (the palm's point under the pudding, seen on his card)
      const r = armTo(sk, sk.near, skOf(id, at, HEIGHTS.crew, pelX, tgt)); q = { ...q, [`arm${sk.near}`]: r.arm, [`hand${sk.near}`]: 90 - r.arm[1][0] } as Pose; MISS["crew " + id] = r.miss; }
    else if (PIN) {      // (pinned: the hand solved onto where it was at the shot's first frame, so his breathing does not move it off the pudding)
      const r = armTo(sk, sk.near, PIN, true); q = { ...q, [`arm${sk.near}`]: r.arm, [`hand${sk.near}`]: 90 - r.arm[1][0] } as Pose; MISS["crew " + id] = r.miss; }      // (the open hand flat, palm up, under it: in line with a raised forearm its fingers stood up in front of the pudding)
    if (g >= 8.7 && g < 9.8) q = { ...q, [`arm${sk.far}`]: [[70, 8], [84, 2]] } as Pose;      // (the jab: the other hand points at the captain)
    if (g >= 21.9) { const up = smooth((g - 22.25) / 1.4); q = { ...q, [`arm${sk.far}`]: [[lerp(20, 12, up), lerp(25, 168, up)], [lerp(60, 14, up), lerp(0, 172, up)]] } as Pose; }      /* (up by his side, slowly: seen from the side it rises straight, not out in an arc over the picture's edge; 0.45 s moved the hand 60 px a frame, motion2) */      // (his vote: the free hand up after the boy's)
    return q; };
  return { name: "crew", at, walk: viewOf(id).right, h: HEIGHTS.crew, rimSide: -1, off: t0, sun: false, key: 0.5,
    cast: { name: "crew", m, who: "sir", look: CREW, seed: 26, /* (no blink in his close shots: seed 5 blinked in 3b, an eye flicker at 4.47 s) */ armWipe: false, pose: hook,
      hands: yaw > 0 ? { L: [[0, t0 >= 8.7 && t0 < 9.8 ? "point" : t0 >= 21.9 ? "open" : "relaxed"]], R: [[0, "open"]] } : { L: [[0, "open"]], R: [[0, t0 >= 8.7 && t0 < 9.8 ? "point" : t0 >= 21.9 ? "open" : "relaxed"]] },
      ...(mouth ? { mouth: { t0: 0, len: Math.round(s.t1 * FM.FPS), mouth: Array.from({ length: Math.round(s.t1 * FM.FPS) }, (_, f) => mouth(f / FM.FPS) ?? 0) }      /* (indexed by the film's frame, as castAt reads it: by the shot's frame every mouth stayed shut, the review of v3) */ } : {}) } };
};

const boy = (id: string): Who => { const s = SH[id], t0 = s.t0, T = (x: number) => x - 0.02, yaw = headingIn(id, [1, 0]), m = figure("sir", 0, yaw); m.stand(40);
  const H = (nod = 0, tilt = 0) => headTo(yaw, nod, tilt);
  ease(m, -1, { lean: 3, head: H(-4, 6) }, 0.01, { face: { pupil: 1, gaze: [0.6, 0], smile: 1, brow: 0.5, lid: 0.35 } });      // (cheeky: a sly smile, the head tipped)
  ease(m, T(16.7), { lean: 2, head: H(0) }, 0.01, { face: { pupil: 1, gaze: [0.7, 0], smile: 0.5, brow: 0.3, lid: 0.1 } });
  ease(m, T(21.9), { lean: 1, head: H(-8, 4) }, 0.01, { face: { pupil: 1, gaze: [0.6, -0.1], smile: 0.6, brow: 0.8, lid: 0 } });
  const mouth = id === "8c" ? mouthOf(["w8"], s.t0, s.t1) : null;
  const AKIMBO: [Seg2, Seg2] = [[20, 25], [60, 0]];
  const hook = (t: number, p: Pose, heading: number): Pose => { const g = t, sk = solve(D.props("sir"), p, heading);
    let q: Pose = { ...p, armL: AKIMBO, armR: AKIMBO, twist: 0 };
    if (g >= 21.9) { const up = smooth((g - 21.92) / 1.6); q = { ...q, [`arm${sk.far}`]: [[lerp(20, 12, up), lerp(25, 168, up)], [lerp(60, 14, up), lerp(0, 172, up)]] } as Pose; }      // ("All in favour?": his far hand up by his side. KNOWN FAULT (v4 STOPP): it rises behind his head and does not show; the near hand, tried, crossed his face      // ("All in favour?": his hand up by his side
    return q; };
  return { name: "boy", at: FIGS.boy, walk: viewOf(id).right, h: HEIGHTS.boy, rimSide: -1, off: t0, sun: false, key: 0.4,
    cast: { name: "boy", m, who: "sir", look: BOY, seed: 14, /* (his blinks in the wide shots only, 3d 5a 8a: seed 12 blinked in shot 6, an eye flicker at 12.20 s) */ armWipe: false, pose: hook, hands: { L: [[0, t0 >= 21.9 ? "open" : "fist"]], R: [[0, t0 >= 21.9 ? "open" : "fist"]] },
      ...(mouth ? { mouth: { t0: 0, len: Math.round(s.t1 * FM.FPS), mouth: Array.from({ length: Math.round(s.t1 * FM.FPS) }, (_, f) => mouth(f / FM.FPS) ?? 0) }      /* (indexed by the film's frame, as castAt reads it: by the shot's frame every mouth stayed shut, the review of v3) */ } : {}) } };
};

/** who is in each shot: everyone the shot's camera sees (any of his head, middle, sides or feet in the picture); nobody in the room may be
 *  missing from a picture that shows where he stands (dinner_check 7 found eight shots without a figure that was in view) */
const BUILD: Record<string, (id: string) => Who> = { captain, crew, boy };
export const inPicture = (id: string, nm: string) => { const at = FIGS[nm], hh = nm === "boy" ? 1.5 : 1.75;
  return [[0, 0], [0, hh * 0.5], [0, hh], [-0.35, hh * 0.6], [0.35, hh * 0.6], [-0.3, 0.3], [0.3, 0.3]].some(([dx, z]) => { const q = project(id, 0, [at[0] + dx, at[1], z]); return q[2] > 0 && q[0] > -20 && q[0] < FM.W + 20 && q[1] > -20 && q[1] < FM.H + 20; }); };
export const WHO: Record<string, () => Who[]> = Object.fromEntries(SHOTS.map((S) => [S.id, () => ["boy", "crew", "captain"].filter((nm) => inPicture(S.id, nm)).map((nm) => BUILD[nm](S.id))]));

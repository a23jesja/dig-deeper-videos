// The Short "The captain's dinner" v6 (25 Nov): who is in each shot and what they do, in film time (granskning/kaptenens-middag/
// bildlista-v6.md, fallbacks 1-5). The wardrobe's people (wardrobe/cast.ts): the captain on his sea chest at the table's right end, turned
// toward its front and the lens (3/4 in the front views), his hands on the table; the sailor in front of the table's left half and the boy
// beside him, both turned toward the captain and the lens. Nobody walks. The pudding is drawn flat in the sailor's ink (the reviewer, 25 Nov):
// in shot 1 his left hand grips it on the captain's plate and lifts it; after, it lies on his left palm with his fingers over its edge (the
// two-layer hand, paintPudding). His right hand slaps the book (shot 3) and points (shot 6). Every hand on a surface is solved onto it each
// frame (armTo: the table, the plate, the book). Voices as v5 (the same takes, no new characters).
import { SAILOR_LOOK } from "../wardrobe/cast";
import type { Pose, Side } from "../rig";
import { solve } from "../rig";
import { ease as ease0 } from "../stage/acting";
/** every eased change of pose or face takes at least 0.45 s (set on a cut, 0.01, stays instant): a head nodding 9 degrees in 0.2 s moved the
 *  eyes 8-10 px a frame and back, and its eyes flickered (flicker2 on the v6 test 3, 100 frames) */
const ease = (...a: Parameters<typeof ease0>) => { const [m, t0, pose, dur, o] = a; if (dur < 0.05) return ease0(m, t0, pose, dur, o);
  const { head: _h, ...rest } = pose as Pose; void _h; return ease0(m, t0, rest, Math.max(dur, 0.45), o); };
/** a slow small move of the head inside a shot (a nod, the chin up or down): at most about 5 degrees over 0.7-0.8 s (the reviewer's question:
 *  does flicker2 pass it? measured on the render) */
const easeH = (...a: Parameters<typeof ease0>) => { const [m, t0, pose, dur, o] = a; return ease0(m, t0, pose, Math.max(dur, 0.7), o); };      /* (and the head is set on the cuts only: a nod or a tilt
  turns the drawn head, and its eyes' outlines flickered at every nod even over 0.45 s: 300 px in an eye at 9 degrees, 60 with none, the frames 122-140 test) */
import { figure, D, scaleOf, heightOf, FM, jointPx, footY, thighUnder, px, reach, poseAt } from "../clips/clipKit";
/** the vote (the cloud session, 25 Nov): at "All in favour?" the sailor's left fist and the boy's right fist come down on the table on one beat,
 *  the contact frame 696 (23.20) with the thunk, and both say "Aye!" [OWN]; the captain beside them. Where each fist lands (on the table's top,
 *  clear of the book; a fist stands 2.4 cm over the top as the captain's) */
export const VOTE = { hit: 690 / 30, lift0: 22.78, top0: 22.87, crew: [-1.22, 0.92] as [number, number], crewTop: 0.0, boy: [-1.38, 1.2] as [number, number] };      // (the sailor's fist on the 1724 rule book on the table, the boy's from across the table; crewTop set below from the book's top)
/** a fist on the table by the rig's own reach (onto the spot where the lens sees it on his card), and the raised pose over it: the forearm
 *  lifted (the slap's way: searched, the raised pose had two near answers and flipped) */
const fistOnTable = (id: string, fr: number, at: [number, number], h: number, sk: ReturnType<typeof solve>, q: Pose, heading: number, side: Side, spot: [number, number], top = 0.488) => {
  const pelX = (sk.j.pelvis as unknown as number[])[0], P: P3 = [spot[0], spot[1], top + 0.024 + (PLANT.handIn ? -0.04 : 0)], T0 = skSeen(id, fr, at, h, pelX, P), sc = scaleOf("sir");
  const tgt: [number, number] = [px(0) + (T0[0] - pelX) * sc, footY("sir") + T0[1] * sc];
  const r = reach("sir", px(0) - pelX * sc, { ...q, [`hand${side}`]: 0 } as Pose, heading, side, tgt, false, { mid: true, elbowDown: true }) as Pose & Record<string, [Seg2, Seg2]>;
  const aH = r[`arm${side}`] as [Seg2, Seg2]; return { aH, aT: [[aH[0][0] + 10, aH[0][1]], [aH[1][0] + 30, aH[1][1]]] as [Seg2, Seg2], P }; };
const SV_OUT = [0, 70, 0, 90], SV_UP = [-10, 95, -10, 125];      // (the sailor's vote: out to his side, then up beside his cheek. Higher, the rig draws his head over the hand and it is gone, the vote stills)
/** where the boy stands: his place at the far left in every shot he is seen in; in 15a, the vote's insert where only his sleeve and fist are
 *  seen, he has stepped to the table's left end to bring his fist down (from his place it is out of reach) */
export const BOY_AT = (id: string): [number, number] => (id === "14" || id === "15a" ? BOY_TABLE : FIGS.boy);
/** the boy walks from his place to the table's left end while shots 12 and 13 show the sailor alone (18.7-22.0, 3.3 s): neither place is in
 *  those pictures, and he is not drawn in them (the reviewer, 26 Nov: from (-2.3, 0.34) to the table's end in 0.35 s was impossible) */
export const BOY_TABLE: [number, number] = [-1.65, 1.15], BOY_WALKING = ["12", "13"];
const BOY_OUT = [0, 80, 0, 90], BOY_UP = [-10, 100, -10, 140], BOY_FOLD = [15, 18, 80, -55];      // (the boy's arm out to his side before it goes up: the vote raise never crosses his face)
const SLAP_REF = new Map<string, [[number, number], [number, number]]>();
const KF_CACHE = new Map<string, [[number, number], [number, number]]>();
import SEATJ from "./props/seat.json";
import { hand as inkHand, Ink, type P2 } from "../ink";
import { DRAWN } from "../alcatraz/alcatraz";
import { handFlip, type Look } from "../designs/common";
import { SHOTS, HEIGHTS, CAPTAIN, BOY, PLANT, headingIn, viewOf, project, unproject, cardToWorld, type Who, type Placed, type Extra } from "./core";
import SPEC from "./shots.json";
import N1 from "../../../voice/dinner/n1/pick.json";
import N3 from "../../../voice/dinner/n3/pick.json";
import N5 from "../../../voice/dinner/n5/pick.json";
import N7 from "../../../voice/dinner/n7/pick.json";
import K2 from "../../../voice/dinner/k2/pick.json";
import K6 from "../../../voice/dinner/k6/pick.json";
import D4 from "../../../voice/dinner/d4/pick.json";
import W8 from "../../../voice/dinner/w8/pick.json";
import AYE_C from "../../../voice/dinner/aye-crew/pick.json";
import AYE_B from "../../../voice/dinner/aye-boy/pick.json";

type Seg2 = [number, number];
type P3 = [number, number, number];
type G = CanvasRenderingContext2D;
const R = Math.PI / 180;
const smooth = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const lerp3 = (a: P3, b: P3, u: number): P3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
/** u from 0 to 1 over [a, b] in film time, eased */
const span = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
export const CREW: Look = SAILOR_LOOK;
const FIGS = SPEC.figs as unknown as Record<string, [number, number]>;
export { FIGS };
const FACING = (SPEC as unknown as { facing: Record<string, [number, number]> }).facing;
export const PLATE: [number, number] = SPEC.plate as [number, number];
export const BOOK: [number, number] = (SPEC as unknown as { book: [number, number] }).book;
export const TABLE_TOP = 0.488;
/** the plate's top (the carved plate at 0.9: its rim 2 cm over the table), the book's top cover (blender/dinner/set.py) */
export const PLATE_TOP = TABLE_TOP + 0.018, BOOK_TOP = TABLE_TOP + 0.059;
/** the voices: each take placed so its speech starts on its beat (as v5) */
export const VOICES = [
  { id: "n1", who: "narrator", at: -0.05, p: N1 }, { id: "k2", who: "captain", at: 1.99, p: K2 }, { id: "n3", who: "narrator", at: 2.72, p: N3 },
  { id: "d4", who: "crew", at: 12.15, p: D4 }, { id: "n5", who: "narrator", at: 13.35, p: N5 }, { id: "k6", who: "captain", at: 15.4, p: K6 },
  { id: "n7", who: "narrator", at: 16.75, p: N7 }, { id: "w8", who: "boy", at: 22.0, p: W8 },
  { id: "aye-crew", who: "crew", at: 22.92, p: AYE_C }, { id: "aye-boy", who: "boy", at: 22.97, p: AYE_B }] as const;      // (the vote's "Aye!" [OWN], on the fists' beat)
export const FILM_S = SHOTS[SHOTS.length - 1].t1;
const SH = Object.fromEntries(SHOTS.map((s) => [s.id, s]));

/** a speaker's mouth at film time T (as v5: the take's loudness, at most 0.1 a frame, every turn held a frame; inside his talking shot never
 *  under 0.22, so the lower lip never switches inside a shot) */
const mouthOf = (ids: string[], t0: number, t1: number) => { const n = Math.round((FILM_S + 0.5) * FM.FPS), tr: number[] = []; let prev = 0, lastDir = 0, held = false, dv0 = 0;
  for (let f = 0; f < n; f++) { const T = f / FM.FPS; let tg = 0; for (const v of VOICES) if (ids.includes(v.id)) { const k = Math.round((T - v.at) * FM.FPS), e = (v.p as { env30: number[] }).env30; if (k >= 0 && k < e.length) tg = Math.max(tg, ((e[k - 1] ?? 0) + e[k] + (e[k + 1] ?? 0)) / 3); }
    let v = prev + Math.max(-0.1, Math.min(0.1, Math.max(dv0 - 0.04, Math.min(dv0 + 0.04, tg - prev)))); dv0 = v - prev; const dir = Math.abs(v - prev) < 1e-4 ? 0 : Math.sign(v - prev);
    if (dir !== 0 && lastDir !== 0 && dir !== lastDir && !held) { v = prev; held = true; } else { held = false; if (dir !== 0) lastDir = dir; }
    tr.push(v); prev = v; }
  return (T: number) => { const k = Math.round(T * FM.FPS); return T >= t0 - 1e-6 && T < t1 ? 0.22 + 0.7 * Math.max(0, tr[k] ?? 0) : null; }; };      // (from the shot's first frame: by float it read 1.5999 and the mouth fell to 0.19 there, rule 14)
/** chewing (silent): the mouth between 0.24 and 0.42, about 3.5 times a second, never under 0.22 inside the shot (the lip's switch) */
const chew = (T: number, a: number, b: number) => (T < a || T > b ? 0.24 : 0.33 - 0.09 * Math.cos((T - a) * 2 * Math.PI * 3.4));
/** a face kept clear of castAt's switches: the lid under 0.3 (over it the lid snaps to 0.42 or shut) and `wide` under 0.5 (over it the lid is
 *  forced open), so nothing pops in an eye between frames (flicker2 on the v6 test render: eye flicker at every crossing) */
const capFace = (f: Record<string, unknown>) => ({ ...f, lid: Math.min(0.28, (f.lid as number) ?? 0.06), wide: Math.min(0.28, (f.wide as number) ?? 0) });
/** a track of mouth values by film frame (castAt reads it by the film's frame) */
const mouthTrack = (s: { t1: number }, f: (T: number) => number | null) => ({ t0: 0, len: Math.round(s.t1 * FM.FPS), mouth: Array.from({ length: Math.round(s.t1 * FM.FPS) }, (_, k) => f(k / FM.FPS) ?? 0) });

/** the arm in the figure's own plane: two links putting the grip (the forearm's line through 0.45 of the hand, or the wrist) on T, in skeleton
 *  units from his ground point; the sideways part shortened by sin(heading) undone (v5). Returns how far short it falls */
const armTo = (sk: ReturnType<typeof solve>, side: Side, T: [number, number], toWrist = false): { arm: [Seg2, Seg2]; miss: number } => {
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
/** a world point as the drawn card shows it, in skeleton units: its picture point taken back through the card's own flat transform (placeOf:
 *  the card scaled to his height at his floor point), not through the plane (onCard): under perspective a point at the table's height lands
 *  2-4 cm off on the card, the check of 25 Nov. pelSk: the pelvis's x in skeleton units */
const skSeen = (id: string, fr: number, at: [number, number], h: number, pelSk: number, w: P3): [number, number] => {
  const ft = project(id, fr, [at[0], at[1], 0]), hd = project(id, fr, [at[0], at[1], h]), z = (ft[1] - hd[1]) / (FM.PPM * heightOf("sir")), sc = scaleOf("sir");
  const cx = px(0) - (ft[0] - FM.W / 2) / z, cy = footY("sir") - (ft[1] + (PLANT.float ? -12 : 0) - FM.H / 2) / z, q = project(id, fr, w);
  const card: [number, number] = [(q[0] - FM.W / 2) / z + cx, (q[1] - FM.H / 2) / z + cy];
  return [(card[0] - px(0)) / sc + pelSk, (card[1] - footY("sir")) / sc]; };
/** where the ray through picture point q meets the vertical plane through the floor point `at` across the lens */
export const onCard = (id: string, fr: number, q: [number, number], at: [number, number]): P3 => { const a = unproject(id, fr, q, 1), b = unproject(id, fr, q, 3), v = viewOf(id);
  const n = [v.d[0], v.d[1]], fa = (a[0] - at[0]) * n[0] + (a[1] - at[1]) * n[1], fb = (b[0] - at[0]) * n[0] + (b[1] - at[1]) * n[1], u = fa / (fa - fb);
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u]; };
/** the head turned so the face is in the design's three-quarter drawing (|sin| of its turn 0.7), toward the side the body turns */
const headTo = (yaw: number, nod = 0, tilt = 0): [number, number, number] => [Math.sign(yaw || 1) * 45 - yaw, nod, tilt];
/** a point in a figure's own floor frame: f metres forward, r to his right, z up, from his floor point */
const local = (nm: string, f: number, r: number, z: number): P3 => { const [x, y] = FIGS[nm], F = FACING[nm], l = Math.hypot(F[0], F[1]), fx = F[0] / l, fy = F[1] / l;
  return [x + fx * f + fy * r, y + fy * f - fx * r, z]; };      // (his right: (fy, -fx))
/** how far each solved hand fell short in the last frame (metres): the checks read it */
export const MISS: Record<string, number> = {};
/** every hand put on a surface this frame: "shot:frame:who:side" -> the surface and the world point (the checks read it) */
export const TARGETS: Record<string, { on: "table" | "plate" | "book"; w: P3 }> = {};

// ------------------------------------------------------------------ the captain ------------------------------------------------------------------
/** on his chest (the rig's seat: pelvis back 0.52 and down 0.43 leg lengths over the feet, as clip 07's approved sit) */
export const SIT = { pz: -0.52, py: -0.43, lean: 8 };
/** where his hands rest: his right (the far one in the front views, on the table's side) on the table beside the plate, his left (the near one)
 *  on his left knee (across his body to the table it fell 9 cm short, the first check) */
const CAP_HAND = { R: [-0.64, 1.0, TABLE_TOP + 0.022] as P3 };      // (by his own end of the table: by the plate it lay beside the sailor's hanging hand and read as the two holding hands, the independent review of v6-t13)
/** the sailor's free arm hanging by his thigh (forward 16 and out 22 it lay by the captain's hand on the table in the picture: holding hands) */
const CREW_REST: [[number, number], [number, number]] = [[4, 10], [14, 4]];
const capKnee = (up = 0): P3 => local("captain", 0.2, -0.1, 0.27 + up);
const ON_PLATE: P3 = [PLATE[0] + 0.07, PLATE[1] + 0.04, PLATE_TOP + 0.012];
/** the half rise in shot 10 (film time): up 15.30-15.45 (the seat at most 10 cm over the chest), the fists down on the table at 15.45 (the
 *  contact frame), held, down again 16.40-16.70 */
export const RISE = { up0: 14.4, hit: 15.45, down0: 16.75, down1: 17.25, lift: 0.06 };      // (a clear half rise, 10 cm off the chest, its start slow: at 2 cm he did not seem to rise at all, the review; the reviewer allows over 10 cm with the feet on the floor)      // (the rise from 15.0, slower: a 0.15 s rise jolted the body in motion2)
const captain = (id: string): Who => { const s = SH[id], yaw = headingIn(id, FACING.captain), m = figure("sir", 0, yaw); m.stand(40);
  const T = (x: number) => x - 0.02, H = (nod = 0, tilt = 0) => headTo(yaw, nod, tilt), seat = { ...SIT };
  const F = (o: Record<string, unknown>) => ({ face: capFace({ pupil: 1, smile: 0, brow: 0, lid: 0.06, wide: 0, sad: 0, squeeze: 0, smirk: 0, teeth: 0, mouth: 0, ...o }) });      // (every value set: one left out kept the last, the squeeze of 6 stayed into 10)
  // the faces, on the words (film time)
  ease(m, -1, { ...seat, head: H(6) }, 0.01, F({ gaze: [-0.4, 0.6], smile: 0.5, brow: 0.4, lid: 0.05 }));      // (1: looking down at his plate, pleased)
  ease(m, T(0.9), { ...seat, head: H(0) }, 0.5, F({ gaze: [-0.8, 0.1], smile: 0.34, brow: 0.7, wide: 0.15 }));      // (his eyes follow the pudding away, left; the smile kept over 0.3 inside the shot)
  ease(m, T(1.6), { ...seat, head: H(-2) }, 0.01, F({ gaze: [-0.7, 0], smile: -0.5, brow: 1, wide: 0.6, lid: 0, mouth: 0.22 }));      // (2: eyes wide; the mouth from 0.22 in his talking shot, rule 14)
  ease(m, T(1.95), { ...seat, lean: 14, head: H(-6) }, 0.12, F({ gaze: [-0.6, -0.1], smile: -0.8, brow: -1, wide: 0.3, lid: 0 }));      // (the fist, "Hey!")
  ease(m, T(4.7), { ...seat, head: H(2) }, 0.01, F({ gaze: [-0.7, 0], smile: -0.6, brow: -0.4, lid: 0.15 }));      // (4: watching)
  ease(m, T(5.3), { ...seat, head: H(4) }, 0.3, F({ gaze: [-0.7, 0], smile: -0.8, brow: -1, lid: 0.3 }));      // (the brows down)
  ease(m, T(8.7), { ...seat, head: H(0) }, 0.01, F({ gaze: [-0.7, 0], smile: -0.7, brow: -0.8, lid: 0.2 }));
  ease(m, T(9.1), { ...seat, lean: 0, head: H(-6) }, 0.2, F({ gaze: [-0.6, 0], smile: -0.8, brow: -0.9, lid: 0.82 }));      // (6: leans back, eyes nearly shut (the lids, never the squeeze's chevrons: they switch in one frame))
  ease(m, T(13.3), { ...seat, head: H(2) }, 0.01, F({ gaze: [-0.7, 0], smile: -0.8, brow: -0.9, lid: 0.2, mouth: 0.24 }));      // (9: his mouth over 0.22 all through the shot, which ends in his shout: never across the lip's switch, rule 14)
  ease(m, T(13.4), { ...seat, head: H(2) }, 0.15, F({ gaze: [-0.7, 0], smile: -0.8, brow: -0.9, lid: 0.15, wide: 0.2, mouth: 0.42 }));      // (opens his mouth to protest)
  ease(m, T(14.0), { ...seat, head: H(4) }, 0.25, F({ gaze: [-0.7, 0], smile: -1, brow: -1, lid: 0.2, mouth: 0.24, teeth: 1 }));      // (clenches his teeth: the mouth kept over 0.22, rule 14)
  ease(m, T(14.4), { ...seat, lean: 20, head: H(2) }, 1.05, F({ gaze: [-0.7, 0], smile: -1, brow: -1, lid: 0.2, wide: 0.2, sweat: 0.6, mouth: 0.24, teeth: 1 }));      // (begins to rise, the first sweat)
  ease(m, T(15.3), { ...seat, lean: 20, head: H(-4) }, 0.35, F({ gaze: [-0.7, 0], smile: -0.9, brow: -1, wide: 0.2, lid: 0.2, sweat: 1, mouth: 0.22 }));      // (10: up, the slam; sweating. His lids and eyes' size kept from 14.6 to the end of 10b: changing as he rose, his eyes' outlines flickered, test 7)
  ease(m, T(16.2), { ...seat, lean: 20, head: H(-4) }, 0.5, F({ gaze: [-0.7, 0], smile: -0.6, brow: 0.2, sad: 0.4, wide: 0.2, lid: 0.2, sweat: 1 }));      // (sinks back)
  ease(m, T(16.7), { ...seat, lean: 20, head: H(-4) }, 0.01, F({ gaze: [-0.6, 0], smile: 0.34, brow: -0.6, lid: 0.1, sweat: 0.5 }));      /* (the proud face from the cut: a smile across 0.3 in the shot broke rule 14) */      // (11 opens as 10b ends: he sits down in this wider shot, not in the close-up (137 px a frame there, motion2))
  ease(m, T(16.75), { ...seat, lean: 4, head: H(-4) }, 0.45, F({ gaze: [-0.6, 0], smile: 0.34, brow: -0.6, lid: 0.1 }));      // (the chest beat, proud)
  ease(m, T(18.2), { ...seat, lean: 2, head: H(-6) }, 0.35, F({ gaze: [-0.4, 0], smile: 0.7, brow: 0.3, lid: 0.45 }));      // (pleased with himself)
  ease(m, T(23.48), { ...seat, lean: 6, head: H(6) }, 0.01, F({ gaze: [-0.5, 0.5], smile: -0.6, brow: 0.6, sad: 0.8, lid: 0.1 }));
  easeH(m, T(23.5), { ...seat, lean: 14, py: SIT.py - 0.02, head: H(5) }, 0.7, F({ gaze: [-0.5, 0.7], smile: -0.7, brow: 0.8, sad: 1, lid: 0.2 }));      // (15: his shoulders sink)
  const mouth = id === "2" ? mouthOf(["k2"], s.t0, s.t1) : id === "9" ? mouthOf(["k6"], 15.38, s.t1) : id === "10b" ? mouthOf(["k6"], s.t0, s.t1) : null;      // (9: "That" before the cut, the voice from 15.38)
  const at = FIGS.captain;
  const hook = (t: number, p: Pose, heading: number): Pose => { const g = t, sk = solve(D.props("sir"), p, heading), pelX = (sk.j.pelvis as unknown as number[])[0];
    let q: Pose = { ...p, twist: 0 };
    // (the seat on the chest's top every frame: the drawn underside of his thighs at the pelvis measured and the pelvis moved so it lies there;
    //  as he leaned it rose 3.4 cm off it, the first check. In the half rise it goes up to RISE.lift over it, the feet kept)
    // (the seat on the chest's top: the drawn underside of his thighs at the pelvis measured and the pelvis moved so it lies there. Measured
    //  on each of five frames round this one and averaged: measured on this frame alone the lowest point could change and he jumped 1.4 px in
    //  one frame, out and back at his eyes as he rose, flicker2 on test 6 frames 446-455)
    const mpp = HEIGHTS.captain / (FM.PPM * heightOf("sir")), LL = (D.props("sir").thigh + D.props("sir").shin + D.props("sir").ankle) * scaleOf("sir") * mpp, TH = D.props("sir").thigh * scaleOf("sir");
    const seatDpy = (pp: Pose, hd: number, gt: number) => { const up = gt >= RISE.up0 && gt < RISE.down1 ? span(gt, RISE.up0, RISE.hit) * (1 - span(gt, RISE.down0, RISE.down1)) : 0;
      const want = (SEATJ.things[0].frames[0] as number[])[2] + up * RISE.lift + (PLANT.seatHigh ? 0.05 : 0); let qq: Pose = { ...pp, twist: 0 };
      for (let it = 0; it < 6; it++) { const skq = solve(D.props("sir"), qq, hd), gq = { name: "captain", who: "sir" as const, x: 0, sk: skq, o: {} }, px0 = jointPx(gq, "pelvis")[0];
        const pen = (x: number) => 0.1 * TH * Math.min(1, Math.max(0, (Math.abs(x - px0) - 0.28 * TH) / (0.1 * TH)));      /* (the window's edge faded) */
        const lowY = thighUnder(gq).filter(([x]) => Math.abs(x - px0) < 0.38 * TH).reduce((m, [x, y]) => Math.max(m, y - pen(x)), -1e9), h = (footY("sir") - lowY) * mpp;
        qq = { ...qq, py: (qq.py ?? SIT.py) + (want - h) / LL }; }
      return (qq.py ?? SIT.py) - (pp.py ?? SIT.py); };
    const CAPC = { name: "captain", m, who: "sir" as const, seed: 33 } as unknown as Parameters<typeof poseAt>[0];
    let dsum = 0; for (let k = -2; k <= 2; k++) { if (k === 0) { dsum += seatDpy(p, heading, g); continue; } const a = poseAt(CAPC, g + k / FM.FPS); dsum += seatDpy(a.pose, a.heading, g + k / FM.FPS); }
    q = { ...q, py: (p.py ?? SIT.py) + dsum / 5 };
    const sk2 = solve(D.props("sir"), q, heading), pel2 = (sk2.j.pelvis as unknown as number[])[0];
    const fr = Math.round((t - s.t0) * FM.FPS), seen = (w: P3): P3 => { const q = project(id, fr, w); return onCard(id, fr, [q[0], q[1]], at); };      // (a surface point where the lens sees it, on his card: the hand lands on it in the picture)
    const put = (side: Side, w: P3, flat = true, on: "table" | "plate" | null = "table") => { if (on) TARGETS[`${id}:${fr}:captain:${side}`] = { on, w };       /* (the wrist set back from the spot by 0.45 of the level hand as the picture shows it: solved to the forearm's line the bent hand's grip landed 10-60 px off, the first check) */
      const T0 = skSeen(id, fr, at, HEIGHTS.captain, pel2, w); let tw: [number, number] = flat ? [T0[0] - 0.45 * sk2.P.hand * sk2.sin, T0[1]] : T0, r = armTo(sk2, side, tw, flat);
      for (let it = 0; it < 3; it++) { const qq = { ...q, [`arm${side}`]: r.arm, [`hand${side}`]: flat ? 90 - r.arm[1][0] : 0 } as Pose, sq = solve(D.props("sir"), qq, heading), Wj = sq.j[`wr${side}`] as unknown as number[], Tj = sq.j[`tip${side}`] as unknown as number[];
        const gx = Wj[0] + 0.45 * (Tj[0] - Wj[0]), gy = Wj[1] + 0.45 * (Tj[1] - Wj[1]); tw = [tw[0] + T0[0] - gx, tw[1] + T0[1] - gy]; r = armTo(sk2, side, tw, flat); }      /* (the drawn grip measured and the aim moved by its error: a few px off after the first solve, the check) */
      q = { ...q, [`arm${side}`]: r.arm, [`hand${side}`]: flat ? 90 - r.arm[1][0] : 0 } as Pose; MISS[`captain ${side}`] = r.miss; };
    void pelX; void sk;
    // both hands on the table by the plate (his right behind it, his left at its front), unless a gesture takes one
    const dz = (PLANT.handIn ? -0.04 : 0);
    let hR = CAP_HAND.R;
    let lifted = false;
    const ox = 0.08 * span(g, 15.0, 15.25) * (1 - span(g, 16.8, 17.2)), back = g > 16.8 && g < 17.2 ? 0.03 * Math.sin(Math.PI * (g - 16.8) / 0.4) : 0;      /* (out over the table and back, both in the air: switched it jumped 8 cm, motion2; slid back on the table it broke rule 4) */
    if (g >= 15.0 && g < 17.2) { const lift = (g < RISE.hit ? 0.05 * span(g, 15.0, 15.25) * (1 - span(g, 15.25, RISE.hit)) : 0) + back;      /* (down onto the table slowing to it: a hard stop is a jolt in motion2) */      // (fists up off the table and down on it at 15.45)
      hR = [CAP_HAND.R[0] - ox, CAP_HAND.R[1] - 0.02 * ox / 0.08, CAP_HAND.R[2] + lift * 1.2 + 0.012 * Math.min(1, ox / 0.08 + (g < 16.8 ? 1 : 0))]; lifted = lift > 0.001; }      /* (out over the table, away from his body: lifted 12 cm by his side it went behind him, rule 10 in 9) */      // (his right fist up off the table and down on it at 15.45; a fist stands 1.2 cm higher than a flat hand)      // (a fist stands 1.2 cm higher than a flat hand)
    // (15: his hand stays on the table: from shot 2's low camera the plate's top is not seen and the hand on it was drawn 11.5 cm off, rule 4)
    put("R", [hR[0], hR[1], hR[2] + dz], true, lifted ? null : "table");
    // his left hand: on his knee, and from there (blended from the knee's own solved arm, the hand's bend with it: switched from it the arm
    // jumped, motion2 on the v6 test) the fist up by his shoulder at "Hey!", the fist up as he rises and shouts, the beat on his chest
    const kr = armTo(sk2, "L", skOf(id, at, HEIGHTS.captain, pel2, capKnee())), knee = kr.arm, kh = 70 - knee[1][0]; MISS["captain L"] = kr.miss;
    const mixL = (tg: [Seg2, Seg2], u: number, hEnd = 0) => { q = { ...q, armL: [[lerp(knee[0][0], tg[0][0], u), lerp(knee[0][1], tg[0][1], u)], [lerp(knee[1][0], tg[1][0], u), lerp(knee[1][1], tg[1][1], u)]], handL: lerp(kh, hEnd, u) } as Pose; };
    if (g >= 1.6 && g < 2.7) mixL([[30, 66], [150, 46]], span(g, 1.6, 2.2));      // ("Hey!": the fist out by his shoulder, clear of his beard and mouth)
    else if (g >= 14.7 && g < 16.7) mixL(knee, 0);      // (rising and shouting: the left fist clenched on his knee. Raised, the far arm is drawn over his body in this 3/4 view (the rig's front order) and the fist lay over his beard and mouth as he spoke, the v6 test 2 stills at 15.27-15.40)      // (rising and shouting: the fist stays up to the cut, lowered it went out through 10b's edge)
    else if (g >= 16.7 && g < 18.7) {      // (11: from the fist up (as at the cut) down onto his chest, a beat, back to his knee, then up by his shoulder)
      const lA = (x: [Seg2, Seg2], y: [Seg2, Seg2], u: number): [Seg2, Seg2] => [[lerp(x[0][0], y[0][0], u), lerp(x[0][1], y[0][1], u)], [lerp(x[1][0], y[1][0], u), lerp(x[1][1], y[1][1], u)]];
      const CHEST: [Seg2, Seg2] = [[20, 10], [110, 0]], UP: [Seg2, Seg2] = [[30, 66], [150, 46]], KN = knee as [Seg2, Seg2];      /* (the beat low on his chest, the fist up out by his shoulder as at "Hey!": higher on the chest and raised forward the far arm lay over his beard and mouth, the test 2 stills) */
      const back = span(g, 17.2, 17.6), upu = span(g, 17.8, 18.6);      /* (the fist up after the others' hands, not with them: all at once the picture changed past flicker2's 2000 px) */
      const tg = lA(lA(lA(KN, CHEST, span(g, 16.75, 17.1)), KN, back), UP, upu); mixL(tg, Math.max(1 - back, upu)); }      /* (from the knee, as at the cut) */
    else mixL(knee, 0);
    return q; };
  const fistAt = (t0: number) => (t0 >= 13.3 && t0 < 16.7 ? "fist" : "open");
  return { name: "captain", at, walk: viewOf(id).right, h: HEIGHTS.captain, rimSide: 1, off: s.t0, sun: false,
    redAt: id === "2" ? 2.0 : id === "9" ? 14.4 : id === "10b" ? 14.9 : undefined, redMax: id === "10b" ? 1.15 : id === "9" ? 1.0 : 0.6,
    cast: { name: "captain", m, who: "sir", look: CAPTAIN, seed: 33, armWipe: false, pose: hook,
      hands: { L: id === "9" ? [[0, "relaxed"], [14.7, "fist"]] : [[0, (s.t0 >= 1.6 && s.t0 < 2.7) || id === "10b" || (s.t0 >= 16.7 && s.t0 < 18.7) ? "fist" : "relaxed"]], R: [[0, fistAt(s.t0)]] },      // (9: the hand closes as it leaves his knee)
      ...(mouth ? { mouth: mouthTrack(s, mouth) } : {}) } };
};

// ------------------------------------------------------------------ the sailor ------------------------------------------------------------------
/** the pudding (flat, his ink): its radius in metres, no wider than his hand is long; how many bites are gone by film time t */
export const PUD_R = 0.08;      // (at 6.2 cm it read as a dot in the medium shots, the first stills; Knopp's hand is 17 cm long)
export const bitesAt = (t: number) => (t >= 10.62 ? 2 : t >= 4.82 ? 1 : 0);
/** the slap on the book (shot 3): his right hand from over the book down onto its cover at 2.77 (the contact frame), then flat on it */
export const SLAP = { hit: 2.9 };
const SLAP_UP = 18;      // (the forearm lifted 30 degrees over the contact pose before the slap)      // (frame 86: the hand from 10 cm over the cover in 5 frames; from 16 cm in 2 it jolted, motion2)
/** where the pudding's middle is, in his own frame (forward, to his right, up; metres), at film time t, from shot 1's hand-over on (it lies on
 *  his right palm: the hand nearer the lens in the front views) */
const PCH: P3 = [0.24, 0.16, 0.66], PNOSE: P3 = [0.3, 0.08, 1.0], PMOUTH: P3 = [0.27, 0.06, 0.93], PHIGH: P3 = [0.12, 0.34, 1.22], PAWAY: P3 = [0.05, 0.46, 0.7], PTOAST: P3 = [0.12, 0.42, 1.1], PUP: P3 = [0.2, -0.08, 0.86];
/** the pudding's keyframes from 1.6 on (film time, its middle in his own frame): between two, eased (span); the arm is solved on each and its angles
 *  lerped (in the hook). (3: up to his nose, a sniff, on to his mouth; 4: the bite at 4.80; 5: up, out of the boy's reach; 7: high, the big bite
 *  at 10.60, swung away at 11.50; 8: the toast by his face (toast: out to his right, never before his speaking mouth; up: toward his middle,
 *  away from the boy's eye; the first stills)) */
/** a keyframe's place: a point in his own frame (metres, for places by his body), a place on his drawn face (the bites and the sniff: Knopp's
 *  head is half his height, so a point in metres "at his mouth" lay at his shoulder, the 360 px crops of test 2), or a set arm (up by his head) */
export type PK = P3 | { face: "mouth" | "nose" } | { fk: [Seg2, Seg2] };
const KMOUTH: PK = { face: "mouth" },      /* (8: the toast is the pudding lifted before his chest toward his middle (PUP): out to his right, or up beside his head, it lay across the boy's face, my review of the 2 fps frames) */
  KNOSE: PK = { face: "nose" }, KHIGH: PK = { fk: [[120, 85], [190, 40]] };
export const PUD_KF: [number, PK][] = [[1.6, PCH], [3.2, PCH], [3.9, KNOSE], [4.15, KNOSE], [4.8, KMOUTH], [4.95, KMOUTH], [5.45, PCH], [5.75, PCH], [6.2, PUP], [9.3, PUP],      /* (4: after the bite and his chewing, he lifts it to admire it, 5.75-6.2: the sailor's singles get something new every 1-2 s, the reviewer) */
  [10.6, KMOUTH], [10.75, KMOUTH], [11.1, PCH], [11.4, PCH], [11.8, PAWAY], [12.1, PAWAY], [13.0, PUP], [13.3, PUP], [13.34, PCH], [18.9, PCH], [19.5, PUP], [20.2, PCH], [20.85, PCH], [21.3, PUP], [21.85, PCH], [24.5, PCH]]      /* (13: he lifts it again with the chin up, 20.85-21.85) */      /* (12, the sailor alone: he lifts the pudding to show it and takes it back, 18.9-20.2, more life (the review); the boy is not in that picture) */;
/** the keyframe segment at t: [from, to, its eased weight] (after the last, his chest) */
export const pudSeg = (t: number): [PK, PK, number, number, number] => { for (let k = 0; k + 1 < PUD_KF.length; k++) { const [a, A] = PUD_KF[k], [b, B] = PUD_KF[k + 1]; if (t >= a && t < b) return [A, B, span(t, a, b), k, k + 1]; } return [PCH, PCH, 0, -1, -1]; };      /* (k: the keyframes' indices; -1 after the toast: his chest) */      /* (after the toast: his chest, solved at 13.3 and 24) */
/** a place on the drawn head in skeleton units (as the rig draws A's head: about the skull joint, turned with the face, tilted with the head) */
const faceSk = (sk: ReturnType<typeof solve>, which: "mouth" | "nose"): [number, number] => {
  const R = Math.PI / 180, sn = Math.sin(sk.faceYaw * R), as = Math.abs(sn), view = as < 0.45 ? "front" : as < 0.85 ? "q" : "side";
  const p: [number, number] = which === "mouth" ? (view === "front" ? [sn * 34, -40] : view === "q" ? [62, -44] : [92, -32]) : (view === "front" ? [sn * 40, -72] : view === "q" ? [82, -74] : [110, -70]);
  const fx = view !== "front" && sn < 0 ? -p[0] : p[0], c = Math.cos(sk.headTilt * R), si = Math.sin(sk.headTilt * R), o = sk.j.skull as unknown as [number, number];
  return [o[0] + fx * c - p[1] * si, o[1] + fx * si + p[1] * c]; };
/** where the pudding's middle is, in his own frame (forward, to his right, up; metres), at film time t (on his right palm from shot 1's hand-over) */
export const pudAt = (t: number): P3 => {
  if (t < 1.6) return lerp3([0.3, 0.02, 0.76], PCH, span(t, 1.3, 1.6));      // (1: from the hand-over in front of him to his chest)
  if (t >= 16.7 && t < 18.7) return lerp3(PCH, PHIGH, span(t, 17.1, 17.85));      // (11: hands up, the pudding with it (the arm by a set pose there))
  const [A, B, u] = pudSeg(t), w = (k: PK): P3 => (Array.isArray(k) ? k : (k as { face?: string }).face === "nose" ? PNOSE : (k as { face?: string }).face ? PMOUTH : PHIGH); return lerp3(w(A), w(B), u); };      /* (in metres for the record only: the hand goes by the keyframes) */
/** shot 1: his left hand round the pudding on the plate, lifted toward him (0.10-0.90); his right palm comes under it and takes it (1.30) */
export const HANDOVER = { lift0: 0.33, lift1: 0.95, under0: 1.0, give: 1.3 };      // (the lift from 0.33: the ting at 0.333 as it leaves the plate)
const crew = (id: string): Who => { const s = SH[id], yaw = headingIn(id, FACING.crew), m = figure("sir", 0, yaw); m.stand(40);
  const T = (x: number) => x - 0.02, H = (nod = 0, tilt = 0) => headTo(yaw, nod, tilt), F = (o: Record<string, unknown>) => ({ face: capFace({ pupil: 1, smile: 0, brow: 0, lid: 0.06, wide: 0, sad: 0, squeeze: 0, smirk: 0, teeth: 0, mouth: 0, ...o }) });
  ease(m, -1, { lean: 4, head: H(4) }, 0.01, F({ gaze: [0.5, 0.4], smile: 0.9, brow: 0.4, lid: 0.2 }));      // (1: sly, taking it)
  ease(m, T(2.7), { lean: 2, head: H(0) }, 0.01, F({ gaze: [0.6, 0.1], smile: 0.6, brow: 0.2, lid: 0.15 }));
  ease(m, T(3.6), { lean: 2, head: H(-8) }, 0.25, F({ gaze: [0.3, -0.3], smile: 0.32, brow: 0.5, lid: 0.6 }));      /* (the sniff with his mouth shut: smiling, its corner stuck up over the pudding like a beak, the review) */      // (the sniff, eyes half shut; his lean kept while his hand lies on the book: leaning back it drew 2 cm off it)
  ease(m, T(4.2), { lean: 2, head: H(2, 4) }, 0.2, F({ gaze: [0.6, 0], smile: 0.9, smirk: 0.8, brow: 1, lid: 0.1 }));      // (brows up, a crooked grin)
  ease(m, T(4.7), { lean: 2, head: H(0) }, 0.01, F({ gaze: [0.6, 0.2], smile: 0.8, brow: 0.5, lid: 0.3, mouth: 0.24 }));      // (4: chewing; the mouth never under 0.22 in this shot)
  ease(m, T(5.7), { lean: 2, head: H(0) }, 0.45, F({ gaze: [0.3, -0.3], smile: 0.9, smirk: 0.6, brow: 1, lid: 0.15, mouth: 0.24 }));      // (4: eyes up on the pudding as he lifts it, brows up)
  ease(m, T(6.4), { lean: 2, head: H(0) }, 0.01, F({ gaze: [-0.5, 0.2], smile: 0.6, smirk: 0.4, brow: 0.3, lid: 0.2 }));      // (5: eyeing the boy)
  ease(m, T(8.7), { lean: 12, head: H(-2) }, 0.01, F({ gaze: [0.8, 0], smile: 0.34, smirk: 0.8, brow: -1, lid: 0.25 }));      // (6: leans at the captain, points, mouth shut; set on the cut: eased over it his smile crossed 0.3 in the shot, rule 14)
  ease(m, T(9.8), { lean: 2, head: H(-8) }, 0.4, F({ gaze: [0.4, -0.5], smile: 0.9, brow: 0.8, lid: 0, wide: 0.2, mouth: 0.24 }));      // (7: admiring it high, then chewing)
  ease(m, T(12.1), { lean: 2, head: H(0) }, 0.01, F({ gaze: [0.7, 0], smile: 0.6, smirk: 0.8, brow: 0.5, lid: 0.15 }));      // (8: the toast, a crooked smile)
  easeH(m, T(12.5), { lean: 2, head: H(5) }, 0.7, F({ gaze: [0.7, 0], smile: 0.7, smirk: 0.8, brow: 0.6, lid: 0.3 }));      // (a nod)
  ease(m, T(13.08), { lean: 2, head: H(5) }, 0.15, F({ gaze: [0.7, 0], smile: 0.7, smirk: 0.8, brow: 0.6, lid: 0.2 }));
  ease(m, T(16.7), { lean: 2, head: H(0) }, 0.01, F({ gaze: [0.7, 0], smile: 0.4, brow: 0.2, lid: 0.1 }));
  ease(m, T(17.3), { lean: -8, head: H(-6) }, 0.8, F({ gaze: [0.7, 0], smile: 0.4, brow: 0.9, wide: 0, lid: 0.1 }));      // (11: leans back, a hand up; the smile kept over 0.3 inside the shot)
  ease(m, T(18.7), { lean: 2, head: H(0) }, 0.01, F({ gaze: [-0.6, 0.1], smile: 0.5, brow: 0.4, lid: 0.1 }));      // (12: looks at the boy)
  ease(m, T(20.2), { lean: 2, head: H(0, 4) }, 0.2, F({ gaze: [-0.6, 0.1], smile: 0.9, smirk: 0.9, brow: 0.6, lid: 0.3 }));      // (a crooked grin)
  ease(m, T(20.5), { lean: 2, head: H(0) }, 0.01, F({ gaze: [0.6, 0], smile: 0.6, brow: 0.4, lid: 0.1 }));
  easeH(m, T(20.55), { lean: 2, head: H(5) }, 0.7, F({ gaze: [0.6, 0], smile: 0.7, brow: 0.5, lid: 0.2 }));      // (13: a nod,
  ease(m, T(21.1), { lean: 2, head: H(5) }, 0.15, F({ gaze: [0.6, 0], smile: 0.7, brow: 0.5, lid: 0.2 }));
  easeH(m, T(21.3), { lean: 0, head: H(0) }, 0.7, F({ gaze: [0.6, -0.2], smile: 0.8, brow: 0.7, lid: 0.15 }));      //  the chin up)
  ease(m, T(22.0), { lean: 0, head: H(-4) }, 0.01, F({ gaze: [-0.4, 0], smile: 0.8, brow: 0.6, lid: 0.1 }));      // (14: his hand up)
  const talk = id === "8" ? mouthOf(["d4"], s.t0, s.t1) : id === "15a" || id === "15b" ? mouthOf(["aye-crew"], s.t0, s.t1) : null;
  const chewing = id === "4" ? (T0: number) => chew(T0, 4.95, 5.9) : id === "7" ? (T0: number) => chew(T0, 10.7, 11.5) : null;
  const at: [number, number] = FIGS.crew;
  const hook = (t: number, p: Pose, heading: number): Pose => { const g = t, sk = solve(D.props("sir"), p, heading), pelX = (sk.j.pelvis as unknown as number[])[0];
    let q: Pose = { ...p, twist: 0 };
    const fr = Math.round((t - s.t0) * FM.FPS), seen = (w: P3): P3 => { const q = project(id, fr, w); return onCard(id, fr, [q[0], q[1]], at); };
    const put = (side: Side, w: P3, hb?: number, onSurface = false, on?: "plate" | "book", lift = 0) => { if (on) TARGETS[`${id}:${fr}:crew:${side}`] = { on, w };
      const T0 = onSurface ? skSeen(id, fr, at, HEIGHTS.crew, pelX, w) : skOf(id, at, HEIGHTS.crew, pelX, w), T1: [number, number] = [T0[0], T0[1] - lift];      /* (lift: skeleton units straight up in the picture from where the lens sees w) */
      let tw: [number, number] = hb === 0 ? T1 : [T1[0] - 0.45 * sk.P.hand * sk.sin, T1[1]], r = armTo(sk, side, tw, hb !== 0);
      for (let it = 0; it < 3; it++) { const qq = { ...q, [`arm${side}`]: r.arm, [`hand${side}`]: hb ?? 90 - r.arm[1][0] } as Pose, sq = solve(D.props("sir"), qq, heading), Wj = sq.j[`wr${side}`] as unknown as number[], Tj = sq.j[`tip${side}`] as unknown as number[];
        const gx = Wj[0] + 0.45 * (Tj[0] - Wj[0]), gy = Wj[1] + 0.45 * (Tj[1] - Wj[1]); tw = [tw[0] + T1[0] - gx, tw[1] + T1[1] - gy]; r = armTo(sk, side, tw, hb !== 0); }      /* (the drawn grip onto its place, as the captain's) */ q = { ...q, [`arm${side}`]: r.arm, [`hand${side}`]: hb ?? 90 - r.arm[1][0] } as Pose; MISS[`crew ${id} ${side}`] = r.miss; return r; };
    const pudW = (P: P3) => local("crew", P[0], P[1], P[2]);      // (the pudding's middle in the world)
    const base = (P: P3): P3 => [P[0], P[1], P[2] - 0.9 * PUD_R];      // (on a palm: the grip under its middle)
    // the left hand: shot 1, round the pudding on the plate and lifting it; then on his hip, or the book (3), the point (6), up by his ear (14)
    const h0L = ((p as Pose & { handL?: number }).handL ?? 0), h0R = ((p as Pose & { handR?: number }).handR ?? 0);      /* (the hands' own rest bend: lerped to and from it, a set value jumped the fingertips, motion2) */
    const rSk = PUD_R / ((scaleOf("sir") / FM.PPM) * (HEIGHTS.crew / heightOf("sir")));      /* (the pudding's radius in his skeleton units) */
    const lA = (x: [Seg2, Seg2], y: [Seg2, Seg2], v: number): [Seg2, Seg2] => [[lerp(x[0][0], y[0][0], v), lerp(x[0][1], y[0][1], v)], [lerp(x[1][0], y[1][0], v), lerp(x[1][1], y[1][1], v)]];
    if (g < 1.6) { const P0: P3 = [PLATE[0], PLATE[1], PLATE_TOP + (PLANT.pudOff ? 0.01 : 0)], P1 = pudW([0.3, 0.02, 0.76]), u = span(g, HANDOVER.lift0, HANDOVER.lift1);
      const REST: [Seg2, Seg2] = CREW_REST, lA = (x: [Seg2, Seg2], y: [Seg2, Seg2], v: number): [Seg2, Seg2] => [[lerp(x[0][0], y[0][0], v), lerp(x[0][1], y[0][1], v)], [lerp(x[1][0], y[1][0], v), lerp(x[1][1], y[1][1], v)]];
      if (g < HANDOVER.give + 0.02) { if (u < 0.001) put("L", P0, 0, true, undefined, 0.9 * rSk); else put("L", lerp3(P0, [P1[0], P1[1], P1[2] - 0.9 * PUD_R], u), 0, true, undefined, 0.9 * rSk); }      /* (lifted the same way it lay: switched from the surface's projection to the card's it jumped 2-4 cm, motion2) */      /* (on the plate: its base where the lens sees the plate's top, his grip 0.9 r over it) */ else { const r = put("L", [P1[0], P1[1], P1[2] - 0.9 * PUD_R], 0, true, undefined, 0.9 * rSk), back = span(g, HANDOVER.give + 0.02, HANDOVER.give + 0.5); q = { ...q, armL: lA(r.arm as [Seg2, Seg2], REST, back), handL: lerp(0, h0L, back) } as Pose; }      /* (back to his side from where it let go: from fixed angles it jumped 120 px, motion2) */
      // the right hand: from his hip up under the pudding (0.95-1.30), then carrying it to his chest
      if (g > HANDOVER.give) put("R", base(pudW(pudAt(g))));
      else if (g >= 0.55) { const qs = q, rB = put("R", base(P1)).arm as [Seg2, Seg2], u = span(g, 0.55, HANDOVER.give);      /* (from his side to under the pudding, the angles lerped onto the arm solved there (exact at 1.30): solved per frame or eased onto, the elbow jumped, motion2) */
        q = { ...qs, armR: lA(REST, rB, u), handR: lerp(h0R, 90 - rB[1][0], u) } as Pose; }
      else q = { ...q, armR: REST } as Pose; }
    else { q = { ...q, armL: CREW_REST } as Pose;
      // (his right hand with the pudding: the rig's own reach (a search over the arm's swing and its raise out to the side) onto each keyframe, the
      //  angles lerped between two (the hand exact on each: the bites on his mouth at 4.80 and 10.60). The two-link solver swings in his own plane
      //  only, and facing the lens it fell short: the bites came at his chest and "high" at his shoulder, the 360 px crops of test 2. Solved every
      //  frame, the elbow swung 57-67 px a frame near his shoulder, motion2. The pudding is drawn on the hand wherever it is)
      // (each keyframe solved once, on his own pose at its time (cached): solved on every frame's pose the search's answer jittered with his
      //  breathing, the elbow 35-70 px a frame, motion2)
      const sc = scaleOf("sir"), CAST = { name: "crew", m, who: "sir" as const, seed: 26 } as unknown as Parameters<typeof poseAt>[0];
      const solveKF = (K: PK, tk: number): [Seg2, Seg2] => { if (!Array.isArray(K) && "fk" in K) return K.fk;
        const key = `${id}|${tk}|${JSON.stringify(K)}`, hit = KF_CACHE.get(key); if (hit) return hit;
        const a = poseAt(CAST, tk), pk = { ...a.pose, twist: 0, armL: CREW_REST } as Pose, skk = solve(D.props("sir"), pk, a.heading), pX = (skk.j.pelvis as unknown as number[])[0], x0 = px(0) - pX * sc;
        const T0 = Array.isArray(K) ? skOf(id, at, HEIGHTS.crew, pX, base(pudW(K as P3))) : ((F2) => [F2[0], F2[1] + 0.9 * rSk] as [number, number])(faceSk(skk, (K as { face: "mouth" | "nose" }).face));      /* (on his face: the pudding's middle there, his grip 0.9 r under it) */
        const tgt: [number, number] = [px(0) + (T0[0] - pX) * sc, footY("sir") + T0[1] * sc];
        let r = reach("sir", x0, { ...pk, handR: 0 }, a.heading, "R", tgt, false, { mid: true }); const a1 = r.armR as [Seg2, Seg2];
        r = reach("sir", x0, { ...pk, armR: a1, handR: 90 - a1[1][0] }, a.heading, "R", tgt, false, { mid: true });      /* (twice: the hand levelled under the pudding, then the grip found again) */
        const out = r.armR as [Seg2, Seg2]; KF_CACHE.set(key, out); return out; };
      const setR = (A: [Seg2, Seg2], B: [Seg2, Seg2], u: number, hB?: number) => { q = { ...q, armR: lA(A, B, u), handR: lerp(90 - A[1][0], hB ?? 90 - B[1][0], u) } as Pose; };
      // (a hold keeps the pose it was reached with: solved again at the hold's end the search gave another answer and the arm swung over to it, motion2 in 4)
      const solveIdx = (k: number): [Seg2, Seg2] => k < 0 ? solveKF(PCH, 13.3) : k > 0 && PUD_KF[k][1] === PUD_KF[k - 1][1] ? solveIdx(k - 1) : solveKF(PUD_KF[k][1], PUD_KF[k][0]);
      const [, , u, ka, kb] = pudSeg(g), sA = solveIdx(ka), sB = solveIdx(kb);
      if (false && g >= 20.5 && g < 23.2) { const base0 = lA(sA, sB, u), OUT: [Seg2, Seg2] = [[SV_OUT[0], SV_OUT[1]], [SV_OUT[2], SV_OUT[3]]], UP: [Seg2, Seg2] = [[SV_UP[0], SV_UP[1]], [SV_UP[2], SV_UP[3]]];      /* (13-14: he votes with the pudding hand, out to his side first and then up by his ear, as the boy does: the reviewer, the vote that failed v5) */
        const o = span(g, 20.5, 21.0), w = span(g, 20.9, 21.4); q = { ...q, armR: lA(lA(base0, OUT, o), UP, w), handR: lerp(lerp(90 - base0[1][0], 0, o), 0, w) } as Pose; }
      else setR(sA, sB, u); }
    if (g >= VOTE.lift0) { const { aH, aT, P } = fistOnTable(id, fr, at, HEIGHTS.crew, sk, q, heading, "L", VOTE.crew, BOOK_TOP), A0 = q.armL as [Seg2, Seg2];      // (15: his left fist up and down on the table on the beat, held there)
      if (g >= VOTE.hit - 0.005) TARGETS[`${id}:${fr}:crew:L`] = { on: "book", w: P };
      q = { ...q, armL: g < VOTE.top0 ? lA(A0, aT, span(g, VOTE.lift0, VOTE.top0)) : lA(aT, aH, span(g, VOTE.top0, VOTE.hit - 0.005)), handL: 0 } as Pose; }
    if (g >= 2.7 && g < 4.7) { const top: P3 = [BOOK[0] - 0.02, BOOK[1] - 0.02, BOOK_TOP + 0.012 + (PLANT.handInBook ? -0.02 : 0)], up = 1 - span(g, 2.7, SLAP.hit - 0.005);
      // (3: the slap, from 16 cm over the book onto its cover at the contact frame, then flat on it. The rig's own reach (a search over the arm's
      //  swing and its raise out to the side): facing the lens, the book lies to his side, and the two-link solver, swinging in his own plane only,
      //  fell short of it as he breathed, the check)
      if (up === 0) TARGETS[`${id}:${fr}:crew:L`] = { on: "book", w: top };
      const T0 = skSeen(id, fr, at, HEIGHTS.crew, pelX, top), sc = scaleOf("sir"), tgtAt = (v: number): [number, number] => [px(0) + (T0[0] - pelX) * sc, footY("sir") + (T0[1] - (0.08 * v) / ((scaleOf("sir") / FM.PPM) * (HEIGHTS.crew / heightOf("sir")))) * sc];
      // (the search started from the arm solved once at the contact frame on his own pose there (cached): started from his hanging arm, its pull
      //  toward it changed as he breathed and the hand slid 3.5 px on the book, rule 4)
      const key = `slap|${id}`; if (!SLAP_REF.has(key)) { const C0 = { name: "crew", m, who: "sir" as const, seed: 26 } as unknown as Parameters<typeof poseAt>[0], a0 = poseAt(C0, SLAP.hit), p0 = { ...a0.pose, twist: 0, armL: CREW_REST } as Pose, s0 = solve(D.props("sir"), p0, a0.heading), pX0 = (s0.j.pelvis as unknown as number[])[0], fr0 = Math.round((SLAP.hit - s.t0) * FM.FPS), T1 = skSeen(id, fr0, at, HEIGHTS.crew, pX0, top);
        SLAP_REF.set(key, (reach("sir", px(0) - pX0 * sc, { ...p0, handL: 0 }, a0.heading, "L", [px(0) + (T1[0] - pX0) * sc, footY("sir") + T1[1] * sc], false, { mid: true, elbowDown: true }) as Pose).armL as [Seg2, Seg2]); }
      const rch = (v: number) => reach("sir", px(0) - pelX * sc, { ...q, armL: SLAP_REF.get(key), handL: 0 } as Pose, heading, "L", tgtAt(v), false, { mid: true, elbowDown: true }), qH = rch(0);
      if (up > 0) { const aH = qH.armL as [Seg2, Seg2], aT: [Seg2, Seg2] = [[aH[0][0] + 8, aH[0][1]], [aH[1][0] + SLAP_UP, aH[1][1]]], v = 1 - up;      /* (the raised pose is the contact pose with the forearm lifted: searched, the raised pose had two near answers and flipped, motion2) */      /* (down from the raised pose to the contact pose, the angles lerped: searched every frame the elbow flipped at frame 1, motion2) */
        q = { ...qH, armL: [[lerp(aT[0][0], aH[0][0], v), lerp(aT[0][1], aH[0][1], v)], [lerp(aT[1][0], aH[1][0], v), lerp(aT[1][1], aH[1][1], v)]], handL: 0 } as Pose; }
      else q = { ...qH, handL: 0 } as Pose; }
    if (PLANT.frontArm && g >= 2.7 && g < 4.7) q = { ...q, armL: [[-70, 12], [-30, 0]] } as Pose;      // (the planted fault for the proof: in shot 3, a front view, his left arm swung back behind his back)
    if (g >= 8.7 && g < 10.2) { const u = span(g, 8.7, 9.1) * (1 - span(g, 9.75, 10.2));      /* (eased in and out in the one shot 6-7) */ q = { ...q, armL: [[lerp(CREW_REST[0][0], 46, u), lerp(CREW_REST[0][1], 8, u)], [lerp(CREW_REST[1][0], 58, u), 0]] } as Pose; }      /* (the point stops short of the captain: at 62/74 the fingertip went into his beard, the review) */      // (6: pointing at the captain's chest: at his face the arm lay over it, the first check)
      // (13-14: his left hand up by his ear at "vote" (20.99), palm to the lens, kept up)
    return q; };
  const kindL = s.t0 < 1.6 ? "grip" : s.t0 >= 2.7 && s.t0 < 4.7 ? "open" : "relaxed";
  return { name: "crew", at, walk: viewOf(id).right, h: HEIGHTS.crew, rimSide: -1, off: s.t0, sun: false, key: 0.5,
    cast: { name: "crew", m, who: "sir", look: CREW, seed: 26, armWipe: false, pose: hook,
      hands: { L: id === "7" ? [[0, "point"], [10.0, "relaxed"]] : id === "15a" || id === "15b" ? [[0, "fist"]] : [[0, kindL]], R: [[0, "grip"]] },
      ...(talk ? { mouth: mouthTrack(s, talk) } : chewing ? { mouth: mouthTrack(s, (T0) => (T0 >= s.t0 && T0 < s.t1 ? chewing(T0) : null)) } : {}) } };
};

// ------------------------------------------------------------------ the boy ------------------------------------------------------------------
const boy = (id: string): Who => { const s = SH[id], yaw = headingIn(id, FACING.boy), m = figure("sir", 0, yaw); m.stand(40);
  const T = (x: number) => x - 0.02, H = (nod = 0, tilt = 0) => headTo(yaw, nod, tilt), F = (o: Record<string, unknown>) => ({ face: capFace({ pupil: 1, smile: 0, brow: 0, lid: 0.06, wide: 0, sad: 0, squeeze: 0, smirk: 0, teeth: 0, mouth: 0, ...o }) });
  ease(m, -1, { lean: 3, head: H(-4, 6) }, 0.01, F({ gaze: [0.6, 0], smile: 0.5, brow: 0.5, lid: 0.15 }));
  ease(m, T(0.6), { lean: 12, head: H(4, 4) }, 0.35, F({ gaze: [0.7, 0.3], smile: 0.8, brow: 0.9, wide: 0.4, lid: 0 }));      // (1: he leans to see the pudding taken)
  ease(m, T(4.7), { lean: 3, head: H(-4, 6) }, 0.01, F({ gaze: [0.6, 0], smile: 0.5, brow: 0.5, lid: 0.15 }));
  ease(m, T(5.6), { lean: 14, head: H(0, 4) }, 0.25, F({ gaze: [0.7, 0.2], smile: 0.6, brow: 0.9, wide: 0.4, lid: 0 }));      // (4: leans in, eager)
  ease(m, T(6.4), { lean: 6, head: H(0) }, 0.01, F({ gaze: [0.7, 0.2], smile: 0.5, brow: 0.8, wide: 0.4, lid: 0, mouth: 0.26 }));      // (5: the mouth open a little the whole shot (the lip's switch))
  ease(m, T(6.5), { lean: 16, head: H(4) }, 0.3, F({ gaze: [0.7, 0.1], smile: 0.5, brow: 0.9, wide: 0.5, lid: 0, mouth: 0.3 }));      // (leans forward)
  ease(m, T(7.2), { lean: 16, head: H(6) }, 0.2, F({ gaze: [0.7, 0.1], smile: 0.5, brow: 0.9, wide: 0.5, lid: 0, mouth: 0.38 }));      /* (the smile kept under 0.6 and his gaze level in his close shot: the smiling lower lid cut his pupil, the review) */      // (licks his lips: the tongue shows)
  ease(m, T(7.8), { lean: 10, head: H(2) }, 0.2, F({ gaze: [0.7, 0.1], smile: 0.5, brow: 0.7, wide: 0.3, lid: 0, mouth: 0.28 }));
  ease(m, T(8.3), { lean: 6, head: H(0, 4) }, 0.25, F({ gaze: [0.6, 0], smile: 0.55, brow: 0.6, lid: 0.25, mouth: 0.3 }));      // (smiles)
  ease(m, T(8.7), { lean: 3, head: H(-4, 6) }, 0.01, F({ gaze: [0.6, 0], smile: 0.5, brow: 0.5, lid: 0.15 }));
  ease(m, T(9.0), { lean: -4, head: H(8, 4) }, 0.2, F({ gaze: [0.5, 0.2], smile: 1, brow: 0.6, lid: 0.75 }));      // (6: he giggles, eyes nearly shut)
  ease(m, T(9.8), { lean: 3, head: H(-4, 6) }, 0.4, F({ gaze: [0.7, -0.2], smile: 0.6, brow: 0.8, lid: 0.05 }));      // (7: eyes on the pudding up high)
  ease(m, T(11.1), { lean: 14, head: H(0) }, 0.25, F({ gaze: [0.7, 0.1], smile: 0.4, brow: 1, wide: 0.5, lid: 0 }));      // (reaches for it, 11.10)
  ease(m, T(11.6), { lean: 2, head: H(-6) }, 0.25, F({ gaze: [0.7, 0], smile: 0.32, brow: 0.9, sad: 0.9, lid: 0 }));      // (it swings away: disappointed, brows up in the middle; the smile kept over 0.3 inside the shot)
  ease(m, T(12.1), { lean: 3, head: H(-4, 6) }, 0.01, F({ gaze: [0.6, 0], smile: 0.5, brow: 0.5, lid: 0.15 }));
  ease(m, T(16.7), { lean: 3, head: H(-4, 6) }, 0.01, F({ gaze: [0.6, 0], smile: 0.5, brow: 0.5, lid: 0.15 }));
  ease(m, T(17.4), { lean: -10, head: H(-6) }, 0.25, F({ gaze: [0.7, 0], smile: 0.32, brow: 1, wide: 0.6, lid: 0 }));      // (11: leans back, a hand up; the smile kept over 0.3)
  ease(m, T(18.7), { lean: 2, head: H(0) }, 0.01, F({ gaze: [0.7, 0], smile: 0.5, brow: 0.5, lid: 0.1 }));      // (12: looks at the sailor)
  easeH(m, T(19.4), { lean: 2, head: H(5) }, 0.7, F({ gaze: [0.7, 0], smile: 0.7, brow: 0.6, lid: 0.2 }));      // (nods)
  easeH(m, T(20.1), { lean: 2, head: H(0) }, 0.7, F({ gaze: [0.7, 0], smile: 0.7, brow: 0.6, lid: 0.2 }));
  ease(m, T(20.2), { lean: 2, head: H(0, 6) }, 0.2, F({ gaze: [0.7, 0], smile: 0.9, smirk: 0.8, brow: 0.6, lid: 0.3 }));      // (a crooked grin)
  ease(m, T(22.0), { lean: 0, head: H(-4) }, 0.01, F({ gaze: [0.5, -0.1], smile: 0.6, brow: 0.8, lid: 0, mouth: 0.22 }));      // (14: his hand up, "All in favour?")
  ease(m, T(22.8), { lean: 0, head: H(-6) }, 0.2, F({ gaze: [0.5, -0.1], smile: 1, brow: 0.8, lid: 0.25, mouth: 0.22 }));      // (grins)
  const talk = id === "14" ? mouthOf(["w8"], s.t0, s.t1) : id === "15a" || id === "15b" ? mouthOf(["aye-boy"], s.t0, s.t1) : null;
  const AKIMBO: [Seg2, Seg2] = [[BOY_FOLD[0], BOY_FOLD[1]], [BOY_FOLD[2], BOY_FOLD[3]]];      /* (his arms folded before his chest, over the table: on his hips the table hid them, rule 10, now he stands behind it) */
  const hook = (t: number, p: Pose, heading: number): Pose => { const g = t, sk = solve(D.props("sir"), p, heading); void sk;
    let q: Pose = { ...p, armL: AKIMBO, armR: AKIMBO, twist: 0 };
    if (g >= 11.05 && g < 11.9) { const u = span(g, 11.1, 11.35) * (1 - span(g, 11.55, 11.85)); q = { ...q, armR: [[lerp(20, 70, u), lerp(25, 8, u)], [lerp(60, 90, u), 0]] } as Pose; }      // (7: his hand out for the pudding, back as it swings away)
    if (g >= VOTE.lift0) { const fr = Math.round((t - s.t0) * FM.FPS), { aH, P } = fistOnTable(id, fr, BOY_AT(id), HEIGHTS.boy, sk, q, heading, "R", VOTE.boy), UPP: [Seg2, Seg2] = [[BOY_UP[0], BOY_UP[1]], [BOY_UP[2], BOY_UP[3]]];      // (15: from his raised hand down onto the table on the beat)
      if (g >= VOTE.hit + 0.0 - 0.005) TARGETS[`${id}:${fr}:boy:R`] = { on: "table", w: P };
      const v = span(g, VOTE.lift0 + 0.05, VOTE.hit - 0.005); q = { ...q, armR: [[lerp(UPP[0][0], aH[0][0], v), lerp(UPP[0][1], aH[0][1], v)], [lerp(UPP[1][0], aH[1][0], v), lerp(UPP[1][1], aH[1][1], v)]], handR: 0 } as Pose; }
    else if (g >= 21.0 && g < 23.2) { const u = span(g, 21.0, 22.35);      /* (slower: 0.2-0.3 s jumped 60-130 px, motion2) */      // (his right hand up by his ear, palm to the lens; down again in 15)
      const o = span(g, 21.0, 21.5), w = span(g, 21.4, 22.35), x1 = BOY_OUT;      /* (out to his side first, then up by his ear: straight there the hand crossed his face, test 6 frame 652) */
      q = { ...q, armR: [[lerp(lerp(20, x1[0], o), BOY_UP[0], w), lerp(lerp(25, x1[1], o), BOY_UP[1], w)], [lerp(lerp(60, x1[2], o), BOY_UP[2], w), lerp(lerp(0, x1[3], o), BOY_UP[3], w)]], handR: lerp((p as Pose & { handR?: number }).handR ?? 0, 0, u) } as Pose; }      /* (up beside his head from his side: to the forward raise the hand crossed his mouth in 13, my review) */
    return q; };
  return { name: "boy", at: BOY_AT(id), walk: viewOf(id).right, h: HEIGHTS.boy, rimSide: -1, off: s.t0, sun: false, key: 0.4,
    cast: { name: "boy", m, who: "sir", look: BOY, seed: 14, armWipe: false, pose: hook,
      hands: { L: [[0, "fist"]], R: id === "13" ? [[0, "fist"], [21.0, "open"]] : [[0, (s.t0 >= 22.0 && s.t0 < 22.9) || (s.t0 >= 8.7 && s.t0 < 12.1) ? "open" : "fist"]] },
      ...(talk ? { mouth: mouthTrack(s, talk) } : {}) } };
};

// ------------------------------------------------------------------ the pudding (flat, in the sailor's ink) ------------------------------------------------------------------
/** the pudding drawn in the sailor's own layer: in shot 1 behind his gripping left hand (his fingers round its side) until his right palm takes
 *  it (1.30); then on his right palm with his fingers drawn again over its near edge (the two-layer hand). In card pixels (the canvas has his card's transform) */
/** side = shot 1's grip round its side (its middle at the hand, its base 0.9 r under it); else on the palm (its base on the hand) */
export const pudOf = (pl: Placed, side = false, hs: Side = "R") => { const f = pl.f, W = jointPx(f, "wr" + hs), Tp = jointPx(f, "tip" + hs), mpp = HEIGHTS.crew / (FM.PPM * heightOf("sir")), r = PUD_R / mpp;
  const g: P2 = [W[0] + 0.45 * (Tp[0] - W[0]), W[1] + 0.45 * (Tp[1] - W[1])];
  return { grip: g, c: (side ? g : [g[0], g[1] - 0.9 * r]) as P2, base: (side ? [g[0], g[1] + 0.9 * r] : g) as P2, r, mpp }; };
/** the pudding as drawn at film time t in shot `id` (card pixels): while it stands on the plate (before the lift) its base is where the lens sees
 *  the plate's top, his gripping hand over its side; from the lift it eases onto his hand over 0.2 s (drawn from the hand alone its base stood
 *  14 px over the plate: the rig's limits move the drawn grip off the solved one, the check) */
export const pudDrawn = (id: string, fr: number, pl: Placed, t: number) => { if (t >= HANDOVER.give) return { ...pudOf(pl, false, "R"), side: false };
  const p = pudOf(pl, true, "L"), q = project(id, fr, [PLATE[0], PLATE[1], PLATE_TOP + (PLANT.pudOff ? 0.01 : 0)]), card: P2 = [(q[0] - FM.W / 2) / pl.z + pl.cx, (q[1] - FM.H / 2) / pl.z + pl.cy];
  const k = 1 - span(t, HANDOVER.lift0, HANDOVER.lift0 + 0.2), dx = (card[0] - p.base[0]) * k, dy = (card[1] - p.base[1]) * k;
  return { ...p, c: [p.c[0] + dx, p.c[1] + dy] as P2, base: [p.base[0] + dx, p.base[1] + dy] as P2, side: true }; };
const pudShape = (h: G, c: P2, r: number, bites: number, ol: number) => {
  const k = new Ink(h, ol), dome: P2[] = [], N = 40;
  for (let i = 0; i <= N; i++) { const a = Math.PI + (i / N) * Math.PI; dome.push([c[0] + r * Math.cos(a), c[1] + 0.9 * r + 1.15 * r * Math.sin(a)]); }
  const base: P2[] = [[c[0] + r * 1.05, c[1] + 0.9 * r], [c[0] - r * 1.05, c[1] + 0.9 * r]];
  const body: P2[] = [...dome, ...base];
  const B9 = 1e5, bitesAt: P2[][] = [[[c[0] + r * 0.75, c[1] - r * 0.35], 0.42 * r], [[c[0] + r * 0.2, c[1] - r * 0.25], 0.4 * r]].slice(0, bites).map(([q, rr]) => {
    const qq = q as P2, rad = rr as unknown as number; return Array.from({ length: 16 }, (_, j) => [qq[0] + rad * Math.cos((j / 16) * 2 * Math.PI), qq[1] + rad * Math.sin((j / 16) * 2 * Math.PI)] as P2); });
  h.save(); if (bitesAt.length) { h.beginPath(); h.rect(-B9, -B9, 2 * B9, 2 * B9); for (const b of bitesAt) k.trace(b); h.clip("evenodd"); }
  k.group([body], "#8a4320");      // (the dark pudding)
  k.group([[...Array.from({ length: 24 }, (_, j) => { const a = Math.PI + (j / 23) * Math.PI; return [c[0] + 0.72 * r * Math.cos(a), c[1] + 0.05 * r + 0.62 * r * Math.sin(a)] as P2; }),
    [c[0] + 0.55 * r, c[1] + 0.1 * r], [c[0] + 0.3 * r, c[1] + 0.32 * r], [c[0] + 0.05 * r, c[1] + 0.12 * r], [c[0] - 0.25 * r, c[1] + 0.34 * r], [c[0] - 0.55 * r, c[1] + 0.1 * r]]], "#f4ecd8");      // (the cream, dripping)
  if (bites < 2) k.group([Array.from({ length: 18 }, (_, j) => [c[0] + 0.14 * r * Math.cos((j / 18) * 2 * Math.PI), c[1] - 0.66 * r + 0.14 * r * Math.sin((j / 18) * 2 * Math.PI)] as P2)], "#c0141e");      // (the cherry, gone with the second bite)
  h.restore(); };
/** the sailor's extra drawing: the pudding (behind his hand in shot 1, on it after) and his fingers over its edge; a contact shadow while it
 *  stands on the plate. Every hand drawn again here is his own left hand (registered for limb_check) */
export const crewExtra = (id: string): Extra => { const s = SH[id];
  return {
    back: (h, pl, fr) => { const t = s.t0 + fr / FM.FPS; if (t >= HANDOVER.give) return; const p = pudDrawn(id, fr, pl, t);
      if (t < 0.6) { h.save(); h.globalAlpha = 0.35 * (1 - span(t, 0.33, 0.55)); h.fillStyle = "#140a06"; h.beginPath(); h.ellipse(p.base[0], p.base[1], p.r * 1.05, p.r * 0.22, 0, 0, 2 * Math.PI); h.fill(); h.restore(); }      // (its contact shadow on the plate, fading as it lifts)
    },
    // (the pudding in front of the hand that holds it, that hand's fingers drawn again over its edge: in shot 1 behind his gripping fist it was
    //  hidden, and at the hand-over it seemed to come from nowhere, the independent review of v6-t13. From the hand-over it moves from his left
    //  grip to his right palm over 0.2 s)
    front: (h, pl, fr) => { const t = s.t0 + fr / FM.FPS, f = pl.f, sk = f.sk, sc = scaleOf(f.who), side: Side = t < HANDOVER.give ? "L" : "R";
      let p = t < HANDOVER.give ? pudDrawn(id, fr, pl, t) : pudOf(pl, false, "R");
      if (t >= HANDOVER.give && t < HANDOVER.give + 0.2) { const a = pudOf(pl, true, "L"), u = span(t, HANDOVER.give, HANDOVER.give + 0.2); p = { ...p, c: [lerp(a.c[0], p.c[0], u), lerp(a.c[1], p.c[1], u)] as P2 }; }
      pudShape(h, p.c, p.r, bitesAt(t), 9 * sc);
      const hf = handFlip(sk, side, "grip"); h.save(); h.translate(f.x, footY(f.who)); h.scale(sc, sc);
      inkHand(new Ink(h, 9), hf.w, hf.d, sk.P.hand, "grip", (CREW.col?.skin ?? "#d9a079"), hf.flip, false, 9, "fingers"); DRAWN_HELD.push({ who: "crew", at: hf.w, rig: true }); h.restore(); } }; };
const DRAWN_HELD = ((DRAWN as unknown as { heldHands?: { who: string; at: P2; rig: boolean }[] }).heldHands ??= []);

/** who is in each shot: everyone the shot's camera sees (any of his head, middle, sides or feet in the picture) */
const BUILD: Record<string, (id: string) => Who> = { captain, crew, boy };
export const inPicture = (id: string, nm: string) => { if (nm === "boy" && BOY_WALKING.includes(id)) return false; const at = nm === "boy" ? BOY_AT(id) : FIGS[nm], hh = HEIGHTS[nm] ?? 1.75;
  return [[0, 0], [0, hh * 0.5], [0, hh], [0, hh * 0.65], [0, hh * 0.8], [-0.45, hh * 0.75], [0.45, hh * 0.75], [-0.35, hh * 0.6], [0.35, hh * 0.6], [-0.3, 0.3], [0.3, 0.3]].some(      /* (the head's middle too: in a close-up nothing else of him is in the picture) */([dx, z]) => { const q = project(id, 0, [at[0] + dx, at[1], z]); return q[2] > 0 && q[0] > -20 && q[0] < FM.W + 20 && q[1] > -20 && q[1] < FM.H + 20; }); };
export const WHO: Record<string, () => Who[]> = Object.fromEntries(SHOTS.map((S) => [S.id, () => ["boy", "crew", "captain"].filter((nm) => inPicture(S.id, nm)).map((nm) => BUILD[nm](S.id))]));
export const EXTRAS: Record<string, Record<string, Extra>> = Object.fromEntries(SHOTS.map((S) => [S.id, { crew: crewExtra(S.id) }]));

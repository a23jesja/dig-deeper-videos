// The Short "The captain's dinner" v6 (25 Nov): who is in each shot and what they do, in film time (granskning/kaptenens-middag/
// bildlista-v6.md, fallbacks 1-5). The wardrobe's people (wardrobe/cast.ts): the captain on his sea chest at the table's right end, turned
// toward its front and the lens (3/4 in the front views), his hands on the table; the sailor in front of the table's left half and the boy
// beside him, both turned toward the captain and the lens. Nobody walks. The pudding is drawn flat in the sailor's ink (the reviewer, 25 Nov):
// in shot 1 his left hand grips it on the captain's plate and lifts it; after, it lies on his left palm with his fingers over its edge (the
// two-layer hand, paintPudding). His right hand slaps the book (shot 3) and points (shot 6). Every hand on a surface is solved onto it each
// frame (armTo: the table, the plate, the book). Voices as v5 (the same takes, no new characters).
import { SAILOR_LOOK } from "../wardrobe/cast";
import { kitMouth, pupilAt, qPupils } from "../wardrobe/kit";
import type { Pose, Side } from "../rig";
import { solve } from "../rig";
import { ease as ease0 } from "../stage/acting";
/** every eased change of pose or face takes at least 0.45 s (set on a cut, 0.01, stays instant): a head nodding 9 degrees in 0.2 s moved the
 *  eyes 8-10 px a frame and back, and its eyes flickered (flicker2 on the v6 test 3, 100 frames) */
const ease = (...a: Parameters<typeof ease0>) => { const [m, t0, pose, dur, o] = a; if (dur < 0.05) return ease0(m, t0, pose, dur, o);
  const { head: _h, ...rest } = pose as Pose; void _h; return ease0(m, t0, rest, Math.max(dur, 0.45), o); };
/** a slow small move of the head inside a shot (a nod, the chin up or down): at most about 5 degrees over 0.7-0.8 s (the reviewer's question:
 *  does flicker2 pass it? measured on the render) */
const easeH = (...a: Parameters<typeof ease0>) => { const [m, t0, pose, dur, o] = a; const { head: _h, ...rest } = pose as Pose; void _h; return ease0(m, t0, rest, Math.max(dur, 0.7), o); };      /* (the head kept still after all: even 5 degrees over 0.7 s flickered the eyes, flicker2 on test 15 in 8, 12, 13) */      /* (and the head is set on the cuts only: a nod or a tilt
  turns the drawn head, and its eyes' outlines flickered at every nod even over 0.45 s: 300 px in an eye at 9 degrees, 60 with none, the frames 122-140 test) */
import { figure, D, scaleOf, heightOf, FM, jointPx, footY, thighUnder, px, reach, poseAt } from "../clips/clipKit";
/** the vote (the cloud session, 25 Nov): at "All in favour?" the sailor's left fist and the boy's right fist come down on the table on one beat,
 *  the contact frame 696 (23.20) with the thunk, and both say "Aye!" [OWN]; the captain beside them. Where each fist lands (on the table's top,
 *  clear of the book; a fist stands 2.4 cm over the top as the captain's) */
export const VOTE = { hit: 690 / 30, lift0: 22.55, top0: 22.75, crew: [-1.22, 0.92] as [number, number], crewTop: 0.0, boy: [-1.38, 1.2] as [number, number] };      // (the sailor's fist on the 1724 rule book on the table, the boy's from across the table; crewTop set below from the book's top)
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
export const BOY_AT = (id: string): [number, number] => FIGS.boy;      // (at his place the whole film (the walk is gone: the reviewer's choice 3, his fist into his own palm))
/** the boy walks from his place to the table's left end while shots 12 and 13 show the sailor alone (18.7-22.0, 3.3 s): neither place is in
 *  those pictures, and he is not drawn in them (the reviewer, 26 Nov: from (-2.3, 0.34) to the table's end in 0.35 s was impossible) */
export const BOY_TABLE: [number, number] = [-1.65, 1.15], BOY_WALKING: string[] = [];      // (he walks while 8-11 look toward the captain's side (12.1-18.7, 6.6 s): in 12-13 the sailor faces right and every camera on his face saw the boy's way)
const BOY_POINT = [70, 14, 95, -12], BOY_PALM = [25, 15, 85, -50], BOY_HIT = [25, 15, 95, -40], BOY_WIND = [-80, 20, 200, 0];      // (v6c: the wind-up, his fist up by his ear)      // (the vote: his left palm before his chest, his right fist down into it)
const BOY_OUT = [0, 80, 0, 90], BOY_UP = [-10, 100, -10, 140], BOY_FOLD = [15, 18, 80, -55], BOY_SIDE7: [Seg2, Seg2] = [[-12, 28], [8, 22]];      // (the boy's arm out to his side before it goes up: the vote raise never crosses his face)
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
/** the cheat per shot (the cloud session, 26 Nov: placing cheated per shot, as in film): a figure's place moved in one shot, out of the
 *  picture or away from another's face; shots.json "cheat": { name: [dx, dy] } (the captain's chest moves with him in Blender) */
export const POS = (nm: string, id: string): [number, number] => { const c = ((SPEC.shots as unknown as { id: string; cheat?: Record<string, [number, number]> }[]).find((s) => s.id === id)?.cheat ?? {})[nm] ?? [0, 0], b = nm === "boy" ? BOY_AT(id) : FIGS[nm]; return [b[0] + c[0] + (PLANT_CHEAT.id === id && PLANT_CHEAT.nm === nm ? PLANT_CHEAT.d[0] : 0), b[1] + c[1] + (PLANT_CHEAT.id === id && PLANT_CHEAT.nm === nm ? PLANT_CHEAT.d[1] : 0)]; };
/** cheat_check's planted faults move a figure here (never in a film) */
export const PLANT_CHEAT: { id: string; nm: string; d: [number, number] } = { id: "", nm: "", d: [0, 0] };
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
  { id: "aye-crew", who: "crew", at: 23.05, p: AYE_C }, { id: "aye-boy", who: "boy", at: 22.96, p: AYE_B }]      // (both within 2 frames of the contact, frame 690) as const;      // (the vote's "Aye!" [OWN], on the fists' beat)
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
const chew = (T: number, a: number, b: number) => (T < a || T > b ? 0.24 : 0.24 + (0.09 - 0.09 * Math.cos((T - a) * 2 * Math.PI * 3.4)) * (1 - span(T, b - 0.3, b)));      /* (faded out at its end: it stopped mid-chew, and the mouth jumped under the eye, flicker2 frame 177) */
/** a face kept clear of castAt's switches: the lid under 0.3 (over it the lid snaps to 0.42 or shut) and `wide` under 0.5 (over it the lid is
 *  forced open), so nothing pops in an eye between frames (flicker2 on the v6 test render: eye flicker at every crossing) */
/** v6c, the independent review of v6 point 9 (dinner_check 18): no lid's line across a pupil. The upper lid and the smiling lower lid are
 *  kept off the pupil in every eye a head draws (front, three-quarter near and far, profile; the sailor's and the captain's eyes and the boy's
 *  larger ones; the gaze either way, as a head turned left mirrors it), each line with half its ink (4.5) and 3 more, so a glance eased between two faces stays clear too: the lid comes down to just over the
 *  pupil, the smile up to just under it. kit.ts draws them as before; only the values asked for are lowered */
const LID_ES = [1, 1.22], lowOf = (sm: number) => 0.3 * sm * Math.max(0, Math.min(1, (sm - 0.3) / 0.4));
const lidsClear = (f: Record<string, unknown>, lid: number, sm: number) => { const g = (f.gaze as [number, number]) ?? [0, 0], wide = (f.wide as number) ?? 0, low = lowOf(sm), HW = 7.5, NOSE = qPupils({}).nose;
  for (const es of LID_ES) for (const gx of [g[0], -g[0]]) { const ey = -118 + (es - 1) * 30, rr = { wide, pupil: (f.pupil as number) ?? 1, gaze: [gx, g[1]] as [number, number] }, gq: [number, number] = [Math.min(1, 0.45 + 0.7 * Math.max(0, gx)), g[1]];
    const eyes: [number, number, number, { x: number; y: number; pr: number }][] = [[10 - (es - 1) * 20, ey, es, pupilAt(10 - (es - 1) * 20, ey, es, { ...rr, gaze: gq } as never)], [76, ey, 0.8 * es, pupilAt(76, ey, 0.8 * es, { ...rr, gaze: gq } as never, NOSE)],
      [66, ey, 0.9 * es, pupilAt(66, ey, 0.9 * es, { ...rr, gaze: [Math.max(0.35, gx), g[1]] } as never)], ...[-1, 1].map((sd) => { const cx = sd * 46 * (es > 1 ? 1.05 : 1); return [cx, ey, es, pupilAt(cx, ey, es, rr as never)] as [number, number, number, { x: number; y: number; pr: number }]; })];
    for (const [cx, cy, sc, q] of eyes) { const ry = 40 * sc * (1 + 0.15 * wide), xn = Math.max(-1, Math.min(1, (q.x - cx) / (30 * sc + 4))), top = q.y - q.pr, bot = q.y + q.pr;
      if (lid > 0.02) { const ye = cy - ry + 2 * ry * lid - ry * 0.12 + 0.24 * ry * (1 - xn * xn); if (ye + HW > top && ye - HW < bot) return false; }
      if (low > 0.02) { const ye = cy + ry - 2 * ry * low + ry * 0.1 - 0.2 * ry * (1 - xn * xn); if (ye + HW > top && ye - HW < bot) return false; } } }
  return true; };
const capFace = (f: Record<string, unknown>) => { let lid = Math.min(0.28, (f.lid as number) ?? 0.06), sm = (f.smile as number) ?? 0; const wide = Math.min(0.28, (f.wide as number) ?? 0), g = { ...f, wide };
  while (lid > 0 && !lidsClear(g, lid, 0)) lid = Math.max(0, +(lid - 0.01).toFixed(2));
  while (sm > 0.31 && !lidsClear(g, 0, sm)) sm = Math.max(0.31, +(sm - 0.01).toFixed(2));
  return { ...f, lid, smile: sm, wide }; };
/** a track of mouth values by film frame (castAt reads it by the film's frame) */
const mouthTrack = (s: { t1: number }, f: (T: number) => number | null) => ({ t0: 0, len: Math.round(s.t1 * FM.FPS), mouth: Array.from({ length: Math.round(s.t1 * FM.FPS) }, (_, k) => f(k / FM.FPS) ?? 0) });

/** v6c (dinner_check 16): an arm as drawn kept human in one frame: folded past 145 degrees, its forearm opened toward the upper arm's line;
 *  straight (over 158) with its forearm or hand past the torso's midline, the forearm bent away from it; each as little as does it, found by
 *  halving (continuous in the pose, so no jump). The hand moves a little; used where a lerp between two good arms passes a bad one */
const armHuman = (q: Pose, side: Side, heading: number): Pose => { const key = `arm${side}` as "armL" | "armR", A = q[key] as unknown as [Seg2, Seg2]; if (!A) return q;
  const m = (arm: [Seg2, Seg2]) => { const s2 = solve(D.props("sir"), { ...q, [key]: arm } as Pose, heading), J2 = (n: string) => s2.j[n as keyof typeof s2.j] as unknown as number[], S0 = J2(`sh${side}`), E0 = J2(`el${side}`), W0 = J2(`wr${side}`), T0 = J2(`tip${side}`), nk = J2("neck"), pv = J2("pelvis");
    const u1 = [S0[0] - E0[0], S0[1] - E0[1]], u2 = [W0[0] - E0[0], W0[1] - E0[1]], inter = (Math.acos(Math.max(-1, Math.min(1, (u1[0] * u2[0] + u1[1] * u2[1]) / ((Math.hypot(u1[0], u1[1]) || 1) * (Math.hypot(u2[0], u2[1]) || 1))))) * 180) / Math.PI;
    const dn = [pv[0] - nk[0], pv[1] - nk[1]], so = (p: number[]) => (p[0] - nk[0]) * dn[1] - (p[1] - nk[1]) * dn[0], sS = Math.sign(so(S0)) || 1, across = [W0, T0].some((p) => so(p) * sS < -12 * Math.hypot(dn[0], dn[1]));
    return { flex: 180 - inter, across }; };
  const m0 = m(A); let lo = 0, hi = 1;
  if (m0.flex > 145) { const open = (k: number): [Seg2, Seg2] => [A[0], [lerp(A[1][0], A[0][0], k), lerp(A[1][1], A[0][1], k)]]; if (m(open(1)).flex > 145) return q;
    for (let it = 0; it < 12; it++) { const md = (lo + hi) / 2; if (m(open(md)).flex > 145) lo = md; else hi = md; } return { ...q, [key]: open(hi) } as Pose; }
  if (m0.across && m0.flex < 22) { const dir = Math.sign(A[1][0] - A[0][0]) || 1, bend = (k: number): [Seg2, Seg2] => [A[0], [A[1][0] + dir * 60 * k, A[1][1]]]; if (m(bend(1)).flex < 22) return q;
    for (let it = 0; it < 12; it++) { const md = (lo + hi) / 2; if (m(bend(md)).flex < 22) lo = md; else hi = md; } return { ...q, [key]: bend(hi) } as Pose; }
  return q; };
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
const local = (nm: string, f: number, r: number, z: number, base?: [number, number]): P3 => { const [x, y] = base ?? FIGS[nm], F = FACING[nm], l = Math.hypot(F[0], F[1]), fx = F[0] / l, fy = F[1] / l;
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
const CAP_HAND = { R: [-0.62, 1.0, TABLE_TOP + 0.022] as P3 };      // (by his own end of the table: by the plate it lay beside the sailor's hanging hand and read as the two holding hands, the independent review of v6-t13)
/** the sailor's free arm hanging by his thigh (forward 16 and out 22 it lay by the captain's hand on the table in the picture: holding hands) */
const CREW_REST: [[number, number], [number, number]] = [[4, 10], [14, 4]];
const capKnee = (up = 0): P3 => local("captain", 0.2, -0.1, 0.27 + up);
const ON_PLATE: P3 = [PLATE[0] + 0.07, PLATE[1] + 0.04, PLATE_TOP + 0.012];
/** the half rise in shot 10 (film time): up 15.30-15.45 (the seat at most 10 cm over the chest), the fists down on the table at 15.45 (the
 *  contact frame), held, down again 16.40-16.70 */
export const RISE = { up0: 14.4, hit: 15.45, down0: 16.75, down1: 18.4, lift: 0.06 };      // (a clear half rise, 10 cm off the chest, its start slow: at 2 cm he did not seem to rise at all, the review; the reviewer allows over 10 cm with the feet on the floor)      // (the rise from 15.0, slower: a 0.15 s rise jolted the body in motion2)
const captain = (id: string): Who => { const s = SH[id], yaw = headingIn(id, FACING.captain), m = figure("sir", 0, yaw); m.stand(40);
  const T = (x: number) => x - 0.02, H = (nod = 0, tilt = 0) => headTo(yaw, nod, tilt), seat = { ...SIT };
  const F = (o: Record<string, unknown>) => ({ face: capFace({ pupil: 1, smile: 0, brow: 0, lid: 0.06, wide: 0, sad: 0, squeeze: 0, smirk: 0, teeth: 0, mouth: 0, ...o }) });      // (every value set: one left out kept the last, the squeeze of 6 stayed into 10)
  // the faces, on the words (film time)
  // (v6c, the hook (the cloud session): in frame 0 he looks away from the sailor and does something: humming to himself, pleased, eyes away
  //  up the cabin, his mouth moving; at 0.9 his eyes catch the pudding going. The mouth kept over 0.2 all through the shot, rule 14)
  ease(m, -1, { ...seat, head: H(6) }, 0.01, F({ gaze: [0.7, -0.3], smile: 0.5, brow: 0.4, lid: 0.05, mouth: 0.26 }));      // (1: humming, eyes away)
  for (const [tq, mo] of [[0.12, 0.32], [0.3, 0.24], [0.48, 0.34], [0.66, 0.25]] as [number, number][]) ease(m, T(tq), { ...seat, head: H(6) }, 0.14, F({ gaze: [0.7, -0.3], smile: 0.5, brow: 0.4, lid: 0.05, mouth: mo }));
  ease(m, T(0.9), { ...seat, head: H(0) }, 0.5, F({ gaze: [-0.8, 0.1], smile: 0.34, brow: 0.7, wide: 0.15, mouth: 0.24 }));      // (his eyes follow the pudding away, left; the smile kept over 0.3 inside the shot)
  ease(m, T(1.6), { ...seat, head: H(-2) }, 0.01, F({ gaze: [-0.7, 0], smile: -0.5, brow: 1, wide: 0.6, lid: 0, mouth: 0.22 }));      // (2: eyes wide; the mouth from 0.22 in his talking shot, rule 14)
  ease(m, T(1.95), { ...seat, lean: 14, head: H(-6) }, 0.12, F({ gaze: [-0.6, -0.1], smile: -0.8, brow: -1, wide: 0.3, lid: 0 }));      // (the fist, "Hey!")
  ease(m, T(4.7), { ...seat, head: H(2) }, 0.01, F({ gaze: [-0.7, 0], smile: -0.6, brow: -0.4, lid: 0.15 }));      // (4: watching)
  ease(m, T(5.3), { ...seat, head: H(4) }, 0.3, F({ gaze: [-0.7, 0], smile: -0.8, brow: -1, lid: 0.3 }));      // (the brows down)
  ease(m, T(8.7), { ...seat, head: H(0) }, 0.01, F({ gaze: [-0.7, 0], smile: -0.7, brow: -0.8, lid: 0.2 }));
  ease(m, T(9.1), { ...seat, lean: 0, head: H(-6) }, 0.2, F({ gaze: [-0.6, 0], smile: -0.8, brow: -0.9, lid: 0.82 }));      // (6: leans back, eyes nearly shut (the lids, never the squeeze's chevrons: they switch in one frame))
  ease(m, T(13.3), { ...seat, head: H(2) }, 0.01, F({ gaze: [-0.7, 0], smile: -0.8, brow: -0.9, lid: 0.2, mouth: 0.24 }));      // (9: his mouth over 0.22 all through the shot, which ends in his shout: never across the lip's switch, rule 14)
  ease(m, T(13.4), { ...seat, head: H(2) }, 0.15, F({ gaze: [-0.7, 0], smile: -0.8, brow: -0.9, lid: 0.15, wide: 0.2, mouth: 0.42 }));      // (opens his mouth to protest)
  ease(m, T(14.0), { ...seat, head: H(4) }, 0.25, F({ gaze: [-0.7, 0], smile: -1, brow: -1, lid: 0.2, mouth: 0.24, teeth: 1 }));      // (clenches his teeth: the mouth kept over 0.22, rule 14)
  ease(m, T(14.4), { ...seat, lean: 16, head: H(2) }, 1.05, F({ gaze: [-0.7, 0], smile: -1, brow: -1, lid: 0.2, wide: 0.2, sweat: 0.6, mouth: 0.24, teeth: 1 }));      // (begins to rise, the first sweat)
  ease(m, T(15.3), { ...seat, lean: 20, head: H(-4) }, 0.35, F({ gaze: [-0.7, 0], smile: -0.9, brow: -1, wide: 0.2, lid: 0.2, sweat: 1, mouth: 0.22 }));      // (10: up, the slam; sweating. His lids and eyes' size kept from 14.6 to the end of 10b: changing as he rose, his eyes' outlines flickered, test 7)
  ease(m, T(16.2), { ...seat, lean: 20, head: H(-4) }, 0.5, F({ gaze: [-0.7, 0], smile: -0.6, brow: 0.2, sad: 0.4, wide: 0.2, lid: 0.2, sweat: 1 }));      // (sinks back)
  ease(m, T(16.7), { ...seat, lean: 20, head: H(-4) }, 0.01, F({ gaze: [-0.6, 0], smile: 0.34, brow: -0.6, lid: 0.1, sweat: 0.5 }));      /* (the proud face from the cut: a smile across 0.3 in the shot broke rule 14) */      // (11 opens as 10b ends: he sits down in this wider shot, not in the close-up (137 px a frame there, motion2))
  ease(m, T(16.75), { ...seat, lean: 4, head: H(-4) }, 1.4, F({ gaze: [-0.6, 0], smile: 0.34, brow: -0.6, lid: 0.1 }));      // (the chest beat, proud)
  ease(m, T(18.2), { ...seat, lean: 2, head: H(-6) }, 0.35, F({ gaze: [-0.4, 0], smile: 0.7, brow: 0.3, lid: 0.45 }));      // (pleased with himself)
  ease(m, T(23.6), { ...seat, lean: 6, head: H(6) }, 0.01, F({ gaze: [-0.5, 0.5], smile: -0.6, brow: 0.6, sad: 0.8, lid: 0.1 }));
  easeH(m, T(23.62), { ...seat, lean: 14, py: SIT.py - 0.02, head: H(5) }, 0.68, F({ gaze: [-0.5, 0.7], smile: -0.7, brow: 0.8, sad: 1, lid: 0.2 }));      // (15: his shoulders sink)
  for (const [tq, mo] of [[23.9, 0.3], [24.02, 0.24], [24.14, 0.32], [24.26, 0.25]] as [number, number][]) ease(m, T(tq), { ...seat, lean: 14, py: SIT.py - 0.02, head: H(5) }, 0.1, F({ gaze: [-0.5, 0.7], smile: -0.7, brow: 0.8, sad: 1, lid: 0.2, mouth: mo }));      // (v6c, life in 15b: his lip trembles as he sinks)
  const mouth = id === "2" ? mouthOf(["k2"], s.t0, s.t1) : id === "9" ? mouthOf(["k6"], 15.38, s.t1) : id === "10b" ? mouthOf(["k6"], s.t0, s.t1) : null;      // (9: "That" before the cut, the voice from 15.38)
  const at = POS("captain", id);
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
        /* (the thighs' underside read at the pelvis's own x, interpolated along its outline (the lowest where it crosses more than once): a window of
           points let a far point in or out and he jumped 3 px (test 15 frame 453), or 100 px with the window's edge raised (test 16, 10b)) */
        const U = thighUnder(gq); let lowY = -1e9; for (let k = 0; k + 1 < U.length; k++) { const [x0, y0] = U[k], [x1, y1] = U[k + 1]; if ((x0 - px0) * (x1 - px0) <= 0 && x0 !== x1) lowY = Math.max(lowY, y0 + ((y1 - y0) * (px0 - x0)) / (x1 - x0)); }
        if (lowY < -1e8) lowY = U.reduce((m, [x, y]) => (Math.abs(x - px0) < Math.abs(m[0] - px0) ? [x, y] : m), U[0])[1];
        const h = (footY("sir") - lowY) * mpp;
        qq = { ...qq, py: (qq.py ?? SIT.py) + (want - h) / LL }; }
      return (qq.py ?? SIT.py) - (pp.py ?? SIT.py); };
    const CAPC = { name: "captain", m, who: "sir" as const, seed: 33 } as unknown as Parameters<typeof poseAt>[0];
    let dsum = 0; for (let k = -4; k <= 4; k++) { if (k === 0) { dsum += seatDpy(p, heading, g); continue; } const a = poseAt(CAPC, g + k / FM.FPS); dsum += seatDpy(a.pose, a.heading, g + k / FM.FPS); }
    q = { ...q, py: (p.py ?? SIT.py) + dsum / 9 };      // (nine frames: over five a kink where the outline's crossing changed side still jolted his head, flicker2 frame 510)
    const sk2 = solve(D.props("sir"), q, heading), pel2 = (sk2.j.pelvis as unknown as number[])[0];
    const fr = Math.round((t - s.t0) * FM.FPS), seen = (w: P3): P3 => { const q = project(id, fr, w); return onCard(id, fr, [q[0], q[1]], at); };      // (a surface point where the lens sees it, on his card: the hand lands on it in the picture)
    const put = (side: Side, w: P3, flat = true, on: "table" | "plate" | null = "table") => { if (on) TARGETS[`${id}:${fr}:captain:${side}`] = { on, w };       /* (the wrist set back from the spot by 0.45 of the level hand as the picture shows it: solved to the forearm's line the bent hand's grip landed 10-60 px off, the first check) */
      const T0 = skSeen(id, fr, at, HEIGHTS.captain, pel2, w); let tw: [number, number] = flat ? [T0[0] - 0.45 * sk2.P.hand * sk2.sin, T0[1]] : T0, r = armTo(sk2, side, tw, flat);
      for (let it = 0; it < 6; it++) { const qq = { ...q, [`arm${side}`]: r.arm, [`hand${side}`]: flat ? 90 - r.arm[1][0] : 0 } as Pose, sq = solve(D.props("sir"), qq, heading), Wj = sq.j[`wr${side}`] as unknown as number[], Tj = sq.j[`tip${side}`] as unknown as number[];
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
    if (g >= 1.4 && g < 2.7) mixL([[30, 66], [150, 46]], span(g, 1.4, 2.55), kh);      /* (the hand's bend kept as the fist goes up: turning it, the fist flickered at his knee, flicker2 frame 54) */      // ("Hey!": the fist out by his shoulder, clear of his beard and mouth)
    else if (g >= 14.7 && g < 16.7) mixL(knee, 0);      // (rising and shouting: the left fist clenched on his knee. Raised, the far arm is drawn over his body in this 3/4 view (the rig's front order) and the fist lay over his beard and mouth as he spoke, the v6 test 2 stills at 15.27-15.40)      // (rising and shouting: the fist stays up to the cut, lowered it went out through 10b's edge)
    else if (g >= 16.7 && g < 18.7) {      // (11: from the fist up (as at the cut) down onto his chest, a beat, back to his knee, then up by his shoulder)
      const lA = (x: [Seg2, Seg2], y: [Seg2, Seg2], u: number): [Seg2, Seg2] => [[lerp(x[0][0], y[0][0], u), lerp(x[0][1], y[0][1], u)], [lerp(x[1][0], y[1][0], u), lerp(x[1][1], y[1][1], u)]];
      const CHEST: [Seg2, Seg2] = [[20, 10], [110, 0]], UP: [Seg2, Seg2] = [[30, 66], [150, 46]], KN = knee as [Seg2, Seg2];      /* (the beat low on his chest, the fist up out by his shoulder as at "Hey!": higher on the chest and raised forward the far arm lay over his beard and mouth, the test 2 stills) */
      const back = span(g, 17.35, 17.9), upu = span(g, 17.95, 18.65);      /* (the fist up after the others' hands, not with them: all at once the picture changed past flicker2's 2000 px) */
      const tg = lA(lA(lA(KN, CHEST, span(g, 16.72, 17.3)), KN, back), UP, upu); mixL(tg, Math.max(1 - back, upu)); }      /* (from the knee, as at the cut) */
    else mixL(knee, 0);
    if ((g >= 13.3 && g < 15.62) || (g >= 16.7 && g < 18.7)) { q = armHuman(q, "L", heading); q = armHuman(q, "R", heading); }      // (v6c: the slam and the chest beat passed a folded or a straight arm across his body, rule 16)
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
/** (v6c: carried on his right hand, the pudding's middle 1.2 of its radius over his grip, its bowl's foot just over his fist: at 0.9 his
 *  curled fingers, drawn over it, hid the bowl and most of the dome, the reviewer's 1:1 crop of frame 180) */
export const PUD_HOLD = 1.2;
export const PUD_R = 0.11;      // (v6c: 0.11, a bowl about 22 cm across, carried from under it: at 0.08 it was a blob of ink under his fist at 360 px, the reviewer)      // (at 6.2 cm it read as a dot in the medium shots, the first stills; Knopp's hand is 17 cm long)
export const bitesAt = (t: number) => (t >= 4.82 ? 1 : 0);      // (v6c: one bite, shot 4; in 7 he holds it up before his chin and chews: his near arm could not reach his mouth within the limits there, dinner_check 16)
/** the slap on the book (shot 3): his right hand from over the book down onto its cover at 2.77 (the contact frame), then flat on it */
export const SLAP = { hit: 2.9 };
const SLAP_UP = 18;      // (the forearm lifted 30 degrees over the contact pose before the slap)      // (frame 86: the hand from 10 cm over the cover in 5 frames; from 16 cm in 2 it jolted, motion2)
/** where the pudding's middle is, in his own frame (forward, to his right, up; metres), at film time t, from shot 1's hand-over on (it lies on
 *  his right palm: the hand nearer the lens in the front views) */
const PMID: P3 = [0.25, 0.0, 0.95], PAYE: P3 = [0.2, 0.55, 1.05] as P3,      /* (v6c 15a, the reviewer: with his "Aye!" the pudding held up forward and out to his right, away from his mouth and ear, its bowl seen) */ PCH: P3 = [0.24, 0.16, 0.66], PNOSE: P3 = [0.3, 0.08, 1.0], PMOUTH: P3 = [0.27, 0.06, 0.93], PHIGH: P3 = [0.12, 0.34, 1.22], PAWAY: P3 = [0.05, 0.46, 0.7], PTOAST: P3 = [0.12, 0.42, 1.1], PUP: P3 = [0.2, -0.08, 0.86];
/** the pudding's keyframes from 1.6 on (film time, its middle in his own frame): between two, eased (span); the arm is solved on each and its angles
 *  lerped (in the hook). (3: up to his nose, a sniff, on to his mouth; 4: the bite at 4.80; 5: up, out of the boy's reach; 7: high, the big bite
 *  at 10.60, swung away at 11.50; 8: the toast by his face (toast: out to his right, never before his speaking mouth; up: toward his middle,
 *  away from the boy's eye; the first stills)) */
/** a keyframe's place: a point in his own frame (metres, for places by his body), a place on his drawn face (the bites and the sniff: Knopp's
 *  head is half his height, so a point in metres "at his mouth" lay at his shoulder, the 360 px crops of test 2), or a set arm (up by his head) */
/** how far out past his shoulder the pudding arm's elbow is kept (picture px at the rig's scale; dinner_check 16) */
const ELB_OUT = 10;
export type PK = P3 | { face: "mouth" | "nose" } | { fk: [Seg2, Seg2] };
const KVOTE: PK = { fk: [[-10, 95], [-10, 125]] }, KMOUTH: PK = { face: "mouth" },      /* (8: the toast is the pudding lifted before his chest toward his middle (PUP): out to his right, or up beside his head, it lay across the boy's face, my review of the 2 fps frames) */
  KAYE: PK = { fk: [[-20, 150], [40, 120]] as [Seg2, Seg2] },      /* (v6c 15a: "Aye!" with the pudding held up high over his head, raised out by his side: away from his mouth, his ear and the boy's face, its bowl against the wall) */
  KNOSE: PK = { face: "nose" }, KHIGH: PK = { fk: [[120, 85], [190, 40]] };
export const PUD_KF: [number, PK][] = [[1.6, PCH], [3.2, PCH], [3.9, PMID], [4.69, PMID], [4.7, KMOUTH], [6.4, KMOUTH], [6.45, PUP], [9.3, PUP],      /* (4: the pudding kept at his mouth as he chews; it goes down on the cut, out of the picture in 5: coming down, his hand and the pudding flickered, flicker2 frames 157-166) */      /* (4: slower down from his mouth, no lift after: his striped sleeve moving fast flickered in the close shot, flicker2) */      /* (4: after the bite and his chewing, he lifts it to admire it, 5.75-6.2: the sailor's singles get something new every 1-2 s, the reviewer) */
  [9.9, PMID], [11.25, PMID],      /* (v6c, Jesper on v6's arms: 3 the pudding up before his chin (PMID), he eyes it (to his nose his near arm folded past 150 or reached across the boy's face); 7 up before his chin, the bite, back before his chin and down to his chest (high over his head and swung away, his near arm went up over the boy's head and out at him as if offering it): dinner_check 16) */
  [11.8, PCH], [12.08, PCH], [12.1, PUP], [13.3, PUP], [13.9, PCH],      /* (8: the toast set on the cut, still in the shot: moving, his sleeve flickered) */ [18.9, PCH], [19.5, PUP], [20.2, PCH], [23.1, PCH], [23.3, PAYE], [24.6, PAYE]]      /* (13: no lift (his sleeve flickered); 15a: the pudding up toward his chin with his "Aye!", slow) */      /* (15a: his "Aye!" with the pudding lifted high on his near, seen side: his fist on the book lay behind him from every camera that sees his face) */      /* (13: he lifts it again with the chin up, 20.85-21.85) */      /* (12, the sailor alone: he lifts the pudding to show it and takes it back, 18.9-20.2, more life (the review); the boy is not in that picture) */;
/** the keyframe segment at t: [from, to, its eased weight] (after the last, his chest) */
export const pudSeg = (t: number): [PK, PK, number, number, number] => { for (let k = 0; k + 1 < PUD_KF.length; k++) { const [a, A] = PUD_KF[k], [b, B] = PUD_KF[k + 1]; if (t >= a && t < b) return [A, B, span(t, a, b), k, k + 1]; } return [PCH, PCH, 0, -1, -1]; };      /* (k: the keyframes' indices; -1 after the toast: his chest) */      /* (after the toast: his chest, solved at 13.3 and 24) */
/** a place on the drawn head in skeleton units (as the rig draws A's head: about the skull joint, turned with the face, tilted with the head) */
const faceSk = (sk: ReturnType<typeof solve>, which: "mouth" | "nose"): [number, number] => {
  const R = Math.PI / 180, sn = Math.sin(sk.faceYaw * R), as = Math.abs(sn), view = as < 0.45 ? "front" : as < 0.85 ? "q" : "side";
  // (v6c: the wardrobe figures draw their mouth where kitMouth puts it (q: 30, -64 shut), not at A's place (62, -44): the bites aimed at
  //  A's mouth, low on the cheek)
  const km = kitMouth(view, 0.24), p: [number, number] = which === "mouth" ? [km.x, km.y + 6] : (view === "front" ? [sn * 40, -72] : view === "q" ? [82, -74] : [110, -70]);
  const fx = view !== "front" && sn < 0 ? -p[0] : p[0], c = Math.cos(sk.headTilt * R), si = Math.sin(sk.headTilt * R), o = sk.j.skull as unknown as [number, number];
  return [o[0] + fx * c - p[1] * si, o[1] + fx * si + p[1] * c]; };
/** where the pudding's middle is, in his own frame (forward, to his right, up; metres), at film time t (on his right palm from shot 1's hand-over) */
export const pudAt = (t: number): P3 => {
  if (t < 1.6) return lerp3([0.3, 0.02, 0.76], PCH, span(t, HANDOVER.give, HANDOVER.give + 0.3));      // (1: from the hand-over in front of him to his chest)
  if (t >= 16.7 && t < 18.7) return lerp3(PCH, PHIGH, span(t, 17.1, 17.85));      // (11: hands up, the pudding with it (the arm by a set pose there))
  const [A, B, u] = pudSeg(t), w = (k: PK): P3 => (Array.isArray(k) ? k : (k as { face?: string }).face === "nose" ? PNOSE : (k as { face?: string }).face ? PMOUTH : PHIGH); return lerp3(w(A), w(B), u); };      /* (in metres for the record only: the hand goes by the keyframes) */
/** shot 1: his left hand round the pudding on the plate, lifted toward him (0.10-0.90); his right palm comes under it and takes it (1.30) */
export const HANDOVER = { lift0: -0.25, lift1: 0.4, under0: 0.45, give: 0.75 };      // (v6c, the hook (the cloud session): the pudding already rising off the captain's plate in frame 0, a third of the way up; the swish at frame 0)
const crew = (id: string): Who => { const s = SH[id], yaw = headingIn(id, FACING.crew), m = figure("sir", 0, yaw); m.stand(40);
  const T = (x: number) => x - 0.02, H = (nod = 0, tilt = 0) => headTo(yaw, nod, tilt), F = (o: Record<string, unknown>) => ({ face: capFace({ pupil: 1, smile: 0, brow: 0, lid: 0.06, wide: 0, sad: 0, squeeze: 0, smirk: 0, teeth: 0, mouth: 0, ...o }) });
  ease(m, -1, { lean: 4, head: H(4) }, 0.01, F({ gaze: [0.5, 0.4], smile: 0.9, brow: 0.4, lid: 0.2 }));      // (1: sly, taking it)
  ease(m, T(2.7), { lean: 2, head: H(0) }, 0.01, F({ gaze: [0.6, 0.1], smile: 0.6, brow: 0.2, lid: 0.15 }));
  ease(m, T(3.6), { lean: 2, head: H(-8, 0) }, 0.25, F({ gaze: [0.3, -0.3], smile: 0.32, brow: 0.5, lid: 0.6 }));      /* (the sniff with his mouth shut: smiling, its corner stuck up over the pudding like a beak, the review) */      // (the sniff, eyes half shut; his lean kept while his hand lies on the book: leaning back it drew 2 cm off it)
  ease(m, T(4.2), { lean: 2, head: H(2, 4) }, 0.2, F({ gaze: [0.6, 0], smile: 0.9, smirk: 0.8, brow: 1, lid: 0.1 }));      // (brows up, a crooked grin)
  ease(m, T(4.7), { lean: 6, head: H(8, 0) }, 0.01, F({ gaze: [0.6, 0.2], smile: 0.8, brow: 0.5, lid: 0.25, mouth: 0.24 }));      // (v6c: leaning into the bite, his head bent 8 and his body 6 toward the pudding at his mouth, Jesper on v6) (v6b: lid 0.25, not 0.3 at castAt's switch: crossing it at 5.9 s flickered the eye, flicker2 frame 177) (4: chewing; the mouth never under 0.22 in this shot)
  ease(m, T(5.05), { lean: 8, head: H(8, 0) }, 0.45, F({ gaze: [0.6, 0.2], smile: 0.9, brow: 0.8, lid: 0.25, mouth: 0.24 }));      // (v6c, life in 4: he sways into the chewing, brows up, relishing it)
  ease(m, T(5.55), { lean: 6, head: H(8, 0) }, 0.8, F({ gaze: [0.3, -0.3], smile: 0.9, smirk: 0.6, brow: 1, lid: 0.15, mouth: 0.24 }));      // (4: eyes up on the pudding as he lifts it, brows up)
  ease(m, T(6.4), { lean: 2, head: H(0) }, 0.01, F({ gaze: [-0.5, 0.2], smile: 0.6, smirk: 0.4, brow: 0.3, lid: 0.2 }));      // (5: eyeing the boy)
  ease(m, T(8.7), { lean: 12, head: H(-2) }, 0.01, F({ gaze: [0.8, 0], smile: 0.34, smirk: 0.8, brow: -1, lid: 0.25 }));      // (6: leans at the captain, points, mouth shut; set on the cut: eased over it his smile crossed 0.3 in the shot, rule 14)
  ease(m, T(9.8), { lean: 2, head: H(-8) }, 0.5, F({ gaze: [0.4, -0.5], smile: 0.9, brow: 0.8, lid: 0, wide: 0.2, mouth: 0.24 }));      // (7: admiring it high, then chewing)
  ease(m, T(10.35), { lean: 4, head: H(6, 0) }, 0.25, F({ gaze: [0.4, 0.3], smile: 0.9, brow: 0.8, lid: 0.3, wide: 0, mouth: 0.24 }));      // (v6c: 7, leaning to the pudding before his chin, eyes down on it)
  ease(m, T(11.0), { lean: 2, head: H(0) }, 0.4, F({ gaze: [0.4, 0], smile: 0.9, brow: 0.8, lid: 0.1, wide: 0.2, mouth: 0.24 }));      // (up again, chewing)
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
  ease(m, T(23.08), { lean: 2, head: H(0) }, 0.01, F({ gaze: [0.4, 0.3], smile: 0.8, brow: -0.6, lid: 0.1, mouth: 0.24 }));      // (15a: the fist on the book, "Aye!": the mouth open from the cut, never across the lip's switch, rule 14)
  const talk = id === "8" ? mouthOf(["d4"], s.t0, s.t1) : id === "15a" || id === "15b" ? mouthOf(["aye-crew"], s.t0, s.t1) : null;
  const chewing = id === "4" ? (T0: number) => chew(T0, 4.95, 6.8) : id === "7" ? (T0: number) => chew(T0, 10.7, 11.5) : null;
  const at: [number, number] = POS("crew", id);
  const hook = (t: number, p: Pose, heading: number): Pose => { const g = t, sk = solve(D.props("sir"), p, heading), pelX = (sk.j.pelvis as unknown as number[])[0];
    let q: Pose = { ...p, twist: 0 };
    const fr = Math.round((t - s.t0) * FM.FPS), seen = (w: P3): P3 => { const q = project(id, fr, w); return onCard(id, fr, [q[0], q[1]], at); };
    const put = (side: Side, w: P3, hb?: number, onSurface = false, on?: "plate" | "book", lift = 0) => { if (on) TARGETS[`${id}:${fr}:crew:${side}`] = { on, w };
      const T0 = onSurface ? skSeen(id, fr, at, HEIGHTS.crew, pelX, w) : skOf(id, at, HEIGHTS.crew, pelX, w), T1: [number, number] = [T0[0], T0[1] - lift];      /* (lift: skeleton units straight up in the picture from where the lens sees w) */
      let tw: [number, number] = hb === 0 ? T1 : [T1[0] - 0.45 * sk.P.hand * sk.sin, T1[1]], r = armTo(sk, side, tw, hb !== 0);
      for (let it = 0; it < 3; it++) { const qq = { ...q, [`arm${side}`]: r.arm, [`hand${side}`]: hb ?? 90 - r.arm[1][0] } as Pose, sq = solve(D.props("sir"), qq, heading), Wj = sq.j[`wr${side}`] as unknown as number[], Tj = sq.j[`tip${side}`] as unknown as number[];
        const gx = Wj[0] + 0.45 * (Tj[0] - Wj[0]), gy = Wj[1] + 0.45 * (Tj[1] - Wj[1]); tw = [tw[0] + T1[0] - gx, tw[1] + T1[1] - gy]; r = armTo(sk, side, tw, hb !== 0); }      /* (the drawn grip onto its place, as the captain's) */ q = { ...q, [`arm${side}`]: r.arm, [`hand${side}`]: hb ?? 90 - r.arm[1][0] } as Pose; MISS[`crew ${id} ${side}`] = r.miss; return r; };
    const pudW = (P: P3) => local("crew", P[0], P[1], P[2], at);      /* (from his place in this shot, the cheat included) */      // (the pudding's middle in the world)
    const base = (P: P3): P3 => [P[0], P[1], P[2] - PUD_HOLD * PUD_R];      // (on a palm: the grip under its middle)
    // the left hand: shot 1, round the pudding on the plate and lifting it; then on his hip, or the book (3), the point (6), up by his ear (14)
    const h0L = ((p as Pose & { handL?: number }).handL ?? 0), h0R = ((p as Pose & { handR?: number }).handR ?? 0);      /* (the hands' own rest bend: lerped to and from it, a set value jumped the fingertips, motion2) */
    const rSk = PUD_R / ((scaleOf("sir") / FM.PPM) * (HEIGHTS.crew / heightOf("sir")));      /* (the pudding's radius in his skeleton units) */
    const lA = (x: [Seg2, Seg2], y: [Seg2, Seg2], v: number): [Seg2, Seg2] => [[lerp(x[0][0], y[0][0], v), lerp(x[0][1], y[0][1], v)], [lerp(x[1][0], y[1][0], v), lerp(x[1][1], y[1][1], v)]];
    if (g < 1.6) { const P0: P3 = [PLATE[0], PLATE[1], PLATE_TOP + (PLANT.pudOff ? 0.01 : 0)], P1 = pudW([0.3, 0.02, 0.76]), u = span(g, HANDOVER.lift0, HANDOVER.lift1);
      const REST: [Seg2, Seg2] = CREW_REST, lA = (x: [Seg2, Seg2], y: [Seg2, Seg2], v: number): [Seg2, Seg2] => [[lerp(x[0][0], y[0][0], v), lerp(x[0][1], y[0][1], v)], [lerp(x[1][0], y[1][0], v), lerp(x[1][1], y[1][1], v)]];
      if (g < HANDOVER.give + 0.02) { if (u < 0.001) put("L", P0, 0, true, undefined, 0.9 * rSk); else put("L", lerp3(P0, [P1[0], P1[1], P1[2] - 0.9 * PUD_R], u), 0, true, undefined, 0.9 * rSk); }      /* (lifted the same way it lay: switched from the surface's projection to the card's it jumped 2-4 cm, motion2) */      /* (on the plate: its base where the lens sees the plate's top, his grip 0.9 r over it) */ else { const r = put("L", [P1[0], P1[1], P1[2] - 0.9 * PUD_R], 0, true, undefined, 0.9 * rSk), back = span(g, HANDOVER.give + 0.02, HANDOVER.give + 0.5); q = { ...q, armL: lA(r.arm as [Seg2, Seg2], REST, back), handL: lerp(0, h0L, back) } as Pose; }      /* (back to his side from where it let go: from fixed angles it jumped 120 px, motion2) */
      // the right hand: from his hip up under the pudding (0.95-1.30), then carrying it to his chest
      if (g > HANDOVER.give) put("R", base(pudW(pudAt(g))));
      else if (g >= HANDOVER.give - 0.75) { const qs = q, rB = put("R", base(P1)).arm as [Seg2, Seg2], u = span(g, HANDOVER.give - 0.75, HANDOVER.give);      /* (from his side to under the pudding, the angles lerped onto the arm solved there (exact at 1.30): solved per frame or eased onto, the elbow jumped, motion2) */
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
        const a = poseAt(CAST, Math.min(Math.max(tk, s.t0), s.t1 - 0.01)), pk = { ...a.pose, twist: 0, armL: CREW_REST } as Pose, skk = solve(D.props("sir"), pk, a.heading), pX = (skk.j.pelvis as unknown as number[])[0], x0 = px(0) - pX * sc;
        const shSk = (skk.j.shR as unknown as number[])[0], skX = (skk.j.skull as unknown as number[])[0], bo = Math.sign(shSk - skX) * 1.3 * rSk;      /* (v6c: the pudding's side at the mouth's outer corner, toward his eating arm, its bite toward the lips; its middle on the mouth needed an arm folded past 150 degrees, rule 16) */
        const T0 = Array.isArray(K) ? skOf(id, at, HEIGHTS.crew, pX, base(pudW(K as P3))) : ((F2) => [F2[0] + bo, F2[1] + (PUD_HOLD + 0.3) * rSk] as [number, number])(faceSk(skk, (K as { face: "mouth" | "nose" }).face));      /* (on his face: the pudding's middle there, his grip 0.9 r under it) */
        const tgt: [number, number] = [px(0) + (T0[0] - pX) * sc, footY("sir") + T0[1] * sc];
        // (v6c, Jesper on v6: "Handrörelserna på han som äter kaptenens pudding ser konstiga och onormala ut": the search put the upper arm up and
        //  in across his chest (139 degrees in, shot 4) with the elbow under his chin; dinner_check 16. The elbow is now kept out past his shoulder
        //  (ELB_OUT px, on the shoulder's own side of his body) and under the line to the target: the upper arm hangs down and out, the forearm
        //  brings the pudding in, as a person eats)
        const shX = x0 + (skk.j.shR as unknown as number[])[0] * sc, nkX = x0 + (skk.j.neck as unknown as number[])[0] * sc, so = Math.sign(shX - nkX) || 1;
        // (the arm as dinner_check 16 measures it in the drawing: the elbow's bend and the upper arm's turn in toward the body's middle. The
        //  rig's own elbow limit (150) is not the drawn bend: with the arm's raise the drawing folded to 171-177 degrees, shots 7 and 8. So the
        //  elbow is tried further out past the shoulder until the drawn arm is within the limits (140 / 20, a margin under the check's 150 / 30: the arm is held while he leans and breathes),
        //  and of those the one whose grip comes nearest the target is kept)
        const drawn = (arm: [Seg2, Seg2], tg: [number, number] = tgt) => { const s2 = solve(D.props("sir"), { ...pk, armR: arm, handR: 90 - arm[1][0] } as Pose, a.heading), J2 = (n: string) => s2.j[n as keyof typeof s2.j] as unknown as number[];
          const S0 = J2("shR"), E0 = J2("elR"), W0 = J2("wrR"), T0 = J2("tipR"), nk = J2("neck"), pv = J2("pelvis"), u1 = [S0[0] - E0[0], S0[1] - E0[1]], u2 = [W0[0] - E0[0], W0[1] - E0[1]];
          const flex = 180 - (Math.acos(Math.max(-1, Math.min(1, (u1[0] * u2[0] + u1[1] * u2[1]) / ((Math.hypot(u1[0], u1[1]) || 1) * (Math.hypot(u2[0], u2[1]) || 1))))) * 180) / Math.PI;
          const dn = [pv[0] - nk[0], pv[1] - nk[1]], sS = Math.sign((S0[0] - nk[0]) * dn[1] - (S0[1] - nk[1]) * dn[0]) || 1, ua = [E0[0] - S0[0], E0[1] - S0[1]], inward = (Math.atan2(-(ua[0] * dn[1] - ua[1] * dn[0]) * sS, ua[0] * dn[0] + ua[1] * dn[1]) * 180) / Math.PI;
          const gq = [x0 + (W0[0] + 0.45 * (T0[0] - W0[0])) * sc, footY("sir") + (W0[1] + 0.45 * (T0[1] - W0[1])) * sc], miss = Math.hypot(gq[0] - tg[0], gq[1] - tg[1]);
          const bendSide = Math.sign((E0[0] - S0[0]) * (W0[1] - E0[1]) - (E0[1] - S0[1]) * (W0[0] - E0[0]));
          return { bendSide, flex, inward, miss, bad: Math.max(0, flex - 140) + (inward < 150 ? Math.max(0, inward - 20) : 0) + (E0[1] < W0[1] ? 5 + (W0[1] - E0[1]) * 0.05 : 0) }; };      /* (the elbow under the wrist: raised over it, the arm at his mouth bent the other way from his chest's and folded through itself on the way, shot 7) */
        // (v6c: every keyframe of a shot bent to the same side as his chest's (PCH, solved first) where an arm within the limits allows it: an arm
        //  bent the other way has to open through straight between them, and his hand swung down to his hip and back, shots 3 and 7)
        const pref = K === PCH ? 0 : drawn(solveKF(PCH, s.t0)).bendSide;
        const searchAt = (tg: [number, number]) => { let best: { arm: [Seg2, Seg2]; bad: number; miss: number } | null = null;
        for (const EO of [-40, -30, -20, -10, 0, ELB_OUT, 20, 30, 45, 60, 80]) { const eo = so > 0 ? shX + EO : -(shX - EO), opt = { mid: true, elbowOut: eo, elbowDown: true };
          let r = reach("sir", x0, { ...pk, handR: 0 }, a.heading, "R", tg, false, opt); const a1 = r.armR as [Seg2, Seg2];
          r = reach("sir", x0, { ...pk, armR: a1, handR: 90 - a1[1][0] }, a.heading, "R", tg, false, opt);      /* (twice: the hand levelled under the pudding, then the grip found again) */
          const arm = r.armR as [Seg2, Seg2], m = drawn(arm, tg); const bd = m.bad + (pref && m.bendSide !== pref ? 3 : 0); if (!best || bd < best.bad - 1e-6 || (Math.abs(bd - best.bad) < 1e-6 && m.miss < best.miss)) best = { arm, bad: bd, miss: m.miss }; }
          return best!; };
        let best = searchAt(tgt);
        // (v6c: a place on his face no arm within the limits reaches (the sniff in shot 3, his near arm: 190 px short, the drawn elbow folded
        //  past 150 to get there) is brought down toward his chin, a quarter at a time, until one does: the pudding held up under his face and
        //  his head bent to it, never an arm folded through itself)
        if (!Array.isArray(K) && (best.miss > 40 || best.bad > 1e-6)) { const sk0 = skk.j.skull as unknown as number[], side = Math.sign(shSk - skX) || 1, chin: [number, number] = [px(0) + (sk0[0] + side * (rSk + 12) - pX) * sc, footY("sir") + (sk0[1] + PUD_HOLD * rSk) * sc];
          for (const k of [0.25, 0.5, 0.75, 1]) { const tg: [number, number] = [lerp(tgt[0], chin[0], k), lerp(tgt[1], chin[1], k)], b = searchAt(tg); if (b.bad < 1e-6 && b.miss < 25) { best = b; break; } if (k === 1 && b.bad <= best.bad) best = b; } }
        const out = best!.arm; KF_CACHE.set(key, out);
        return out; };
      // (v6c: between two arms bent to opposite sides in the drawing, the angles lerped folded the drawn arm through itself, 157-178 degrees at
      //  the elbow (dinner_check 16, shot 7: his chest's arm bent one way, his mouth's the other). Then (or when the lerp folds the drawn arm past 145 on the way) the
      //  move goes through the arm straight, half way: it opens and bends again, as an arm does)
      const sideR = (A: [Seg2, Seg2]) => { const s2 = solve(D.props("sir"), { ...q, armR: A, handR: 90 - A[1][0] } as Pose, heading), J2 = (n: string) => s2.j[n as keyof typeof s2.j] as unknown as number[], S0 = J2("shR"), E0 = J2("elR"), W0 = J2("wrR");
        const u1 = [S0[0] - E0[0], S0[1] - E0[1]], u2 = [W0[0] - E0[0], W0[1] - E0[1]], flex = 180 - (Math.acos(Math.max(-1, Math.min(1, (u1[0] * u2[0] + u1[1] * u2[1]) / ((Math.hypot(u1[0], u1[1]) || 1) * (Math.hypot(u2[0], u2[1]) || 1))))) * 180) / Math.PI;
        return { side: Math.sign((E0[0] - S0[0]) * (W0[1] - E0[1]) - (E0[1] - S0[1]) * (W0[0] - E0[0])), flex }; };
      const folds = (A: [Seg2, Seg2], B: [Seg2, Seg2]) => sideR(A).side !== sideR(B).side || [0.25, 0.5, 0.75].some((v) => sideR(lA(A, B, v)).flex > 145);
      const setR = (A: [Seg2, Seg2], B: [Seg2, Seg2], u: number, hB?: number) => { let arm = lA(A, B, u);
        if (u > 0 && u < 1 && folds(A, B)) { const m0 = (A[0][0] + B[0][0]) / 2, m1 = (A[0][1] + B[0][1]) / 2, M: [Seg2, Seg2] = [[m0, m1], [m0, m1]]; arm = u < 0.5 ? lA(A, M, u * 2) : lA(M, B, u * 2 - 1); }
        /* (and a frame that still folds past 145 has its forearm opened toward the upper arm's line, as little as keeps it there: continuous in u) */
        if (u > 0 && u < 1 && sideR(arm).flex > 145) { let lo = 0, hi = 1; const open = (k: number): [Seg2, Seg2] => [arm[0], [lerp(arm[1][0], arm[0][0], k), lerp(arm[1][1], arm[0][1], k)]];
          if (sideR(open(1)).flex <= 145) { for (let it = 0; it < 12; it++) { const mid = (lo + hi) / 2; if (sideR(open(mid)).flex > 145) lo = mid; else hi = mid; } arm = open(hi); } }
        q = { ...q, armR: arm, handR: lerp(90 - A[1][0], hB ?? 90 - B[1][0], u) } as Pose; };
      // (a hold keeps the pose it was reached with: solved again at the hold's end the search gave another answer and the arm swung over to it, motion2 in 4)
      const solveIdx = (k: number): [Seg2, Seg2] => k < 0 ? solveKF(PCH, 13.3) : k > 0 && PUD_KF[k][1] === PUD_KF[k - 1][1] ? solveIdx(k - 1) : solveKF(PUD_KF[k][1], PUD_KF[k][0]);
      const [, , u, ka, kb] = pudSeg(g), sA = solveIdx(ka), sB = solveIdx(kb);
      if (false && g >= 20.5 && g < 23.2) { const base0 = lA(sA, sB, u), OUT: [Seg2, Seg2] = [[SV_OUT[0], SV_OUT[1]], [SV_OUT[2], SV_OUT[3]]], UP: [Seg2, Seg2] = [[SV_UP[0], SV_UP[1]], [SV_UP[2], SV_UP[3]]];      /* (13-14: he votes with the pudding hand, out to his side first and then up by his ear, as the boy does: the reviewer, the vote that failed v5) */
        const o = span(g, 20.5, 21.0), w = span(g, 20.9, 21.4); q = { ...q, armR: lA(lA(base0, OUT, o), UP, w), handR: lerp(lerp(90 - base0[1][0], 0, o), 0, w) } as Pose; }
      else setR(sA, sB, u); }
    if (false && g >= VOTE.lift0) { const { aH, aT, P } = fistOnTable(id, fr, at, HEIGHTS.crew, sk, q, heading, "L", VOTE.crew, BOOK_TOP), A0 = q.armL as [Seg2, Seg2];      // (15: his left fist up and down on the table on the beat, held there)
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
    if (g >= 8.7 && g < 10.75) { const u = span(g, 8.7, 9.1) * (1 - span(g, 9.7, 10.75));      /* (eased in and out in the one shot 6-7) */ q = { ...q, armL: [[lerp(CREW_REST[0][0], 46, u), lerp(CREW_REST[0][1], 8, u)], [lerp(CREW_REST[1][0], 58, u), 0]] } as Pose; }      /* (the point stops short of the captain: at 62/74 the fingertip went into his beard, the review) */      // (6: pointing at the captain's chest: at his face the arm lay over it, the first check)
      // (13-14: his left hand up by his ear at "vote" (20.99), palm to the lens, kept up)
    if (g >= 23.1 && g < 23.65) q = armHuman(q, "R", heading);      // (v6c: 15a's lift to "Aye!" kept within rule 16)
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
  ease(m, T(8.2), { lean: 6, head: H(0, 4) }, 0.5, F({ gaze: [0.6, 0], smile: 0.55, brow: 0.6, lid: 0.25, mouth: 0.3 }));      // (smiles)
  ease(m, T(8.7), { lean: 3, head: H(-4, 6) }, 0.01, F({ gaze: [0.6, 0], smile: 0.5, brow: 0.5, lid: 0.15 }));
  ease(m, T(9.0), { lean: -4, head: H(8, 4) }, 0.2, F({ gaze: [0.5, 0.2], smile: 1, brow: 0.6, lid: 0.75 }));      // (6: he giggles, eyes nearly shut)
  ease(m, T(9.8), { lean: 3, head: H(-4, 6) }, 0.8, F({ gaze: [0.7, -0.2], smile: 0.6, brow: 0.8, lid: 0.05 }));      // (7: eyes on the pudding up high)
  ease(m, T(11.1), { lean: 14, head: H(0) }, 0.25, F({ gaze: [0.7, 0.1], smile: 0.4, brow: 1, wide: 0.5, lid: 0 }));      // (reaches for it, 11.10)
  ease(m, T(11.6), { lean: 2, head: H(-6) }, 0.8, F({ gaze: [0.7, 0], smile: 0.32, brow: 0.9, sad: 0.9, lid: 0 }));      // (it swings away: disappointed, brows up in the middle; the smile kept over 0.3 inside the shot)
  ease(m, T(12.1), { lean: 3, head: H(-4, 6) }, 0.01, F({ gaze: [0.6, 0], smile: 0.5, brow: 0.5, lid: 0.15 }));
  ease(m, T(16.7), { lean: 3, head: H(-4, 6) }, 0.01, F({ gaze: [0.6, 0], smile: 0.5, brow: 0.5, lid: 0.15 }));
  ease(m, T(17.4), { lean: -10, head: H(-6) }, 0.25, F({ gaze: [0.7, 0], smile: 0.32, brow: 1, wide: 0.6, lid: 0 }));      // (11: leans back, a hand up; the smile kept over 0.3)
  ease(m, T(18.7), { lean: 2, head: H(0) }, 0.01, F({ gaze: [0.7, 0], smile: 0.5, brow: 0.5, lid: 0.1 }));      // (12: looks at the sailor)
  easeH(m, T(19.4), { lean: 2, head: H(5) }, 0.7, F({ gaze: [0.7, 0], smile: 0.7, brow: 0.6, lid: 0.2 }));      // (nods)
  easeH(m, T(20.1), { lean: 2, head: H(0) }, 0.7, F({ gaze: [0.7, 0], smile: 0.7, brow: 0.6, lid: 0.2 }));
  ease(m, T(20.2), { lean: 2, head: H(0, 6) }, 0.2, F({ gaze: [0.7, 0], smile: 0.9, smirk: 0.8, brow: 0.6, lid: 0.3 }));      // (a crooked grin)
  ease(m, T(22.0), { lean: 0, head: H(-4) }, 0.01, F({ gaze: [0.5, -0.1], smile: 0.6, brow: 0.8, lid: 0, mouth: 0.22 }));      // (14: his hand up, "All in favour?")
  ease(m, T(22.8), { lean: 0, head: H(-6) }, 0.2, F({ gaze: [0.5, -0.1], smile: 1, brow: 0.8, lid: 0.25, mouth: 0.22 }));      // (grins)
  const talk = id === "14" ? mouthOf(["w8", "aye-boy"], s.t0, s.t1) : null;      // (v6c: his "Aye!" in 14 with the slap, the reviewer's choice A)
  const AKIMBO: [Seg2, Seg2] = [[BOY_FOLD[0], BOY_FOLD[1]], [BOY_FOLD[2], BOY_FOLD[3]]];      /* (his arms folded before his chest, over the table: on his hips the table hid them, rule 10, now he stands behind it) */
  const hook = (t: number, p: Pose, heading: number): Pose => { const g = t, sk = solve(D.props("sir"), p, heading); void sk;
    let q: Pose = { ...p, armL: AKIMBO, armR: AKIMBO, twist: 0 };
    // (v6c, the independent review of v6 (rule 10): in the three-quarter shots his far arm folded behind the near one read as one arm (1, 7);
    //  in 7 it hangs at his far side, held a little out from his shirt so its sleeve shows beside him)
    if (id === "7") { const far = sk.far; q = { ...q, [`arm${far}`]: BOY_SIDE7 } as Pose; }
    if (g >= 10.85 && g < 12.1) { const u = span(g, 10.85, 11.5) * (1 - span(g, 11.55, 12.1)); q = { ...q, armR: [[lerp(AKIMBO[0][0], 70, u), lerp(AKIMBO[0][1], 8, u)], [lerp(AKIMBO[1][0], 90, u), lerp(AKIMBO[1][1], 0, u)]] } as Pose; }      // (7: his hand out for the pudding, back as it swings away; from his folded arms (from the old hip pose it jumped, motion2))
    if (g >= 22.73) { const UPP: [Seg2, Seg2] = [[BOY_POINT[0], BOY_POINT[1]], [BOY_POINT[2], BOY_POINT[3]]], WIND: [Seg2, Seg2] = [[BOY_WIND[0], BOY_WIND[1]], [BOY_WIND[2], BOY_WIND[3]]], PALM: [Seg2, Seg2] = [[BOY_PALM[0], BOY_PALM[1]], [BOY_PALM[2], BOY_PALM[3]]], HIT: [Seg2, Seg2] = [[BOY_HIT[0], BOY_HIT[1]], [BOY_HIT[2], BOY_HIT[3]]];      // (15a: his left palm up before his chest, his right fist from up by his ear down into it on the beat: out of the table's reach from his place, the reviewer's choice 3)
      const w = span(g, 22.78, 22.92), MIDP: [Seg2, Seg2] = [[22, 25], [80, -25]], lA2 = (x: [Seg2, Seg2], y: [Seg2, Seg2], k: number): [Seg2, Seg2] => [[lerp(x[0][0], y[0][0], k), lerp(x[0][1], y[0][1], k)], [lerp(x[1][0], y[1][0], k), lerp(x[1][1], y[1][1], k)]]; q = { ...q, armL: [[lerp(AKIMBO[0][0], PALM[0][0], w), lerp(AKIMBO[0][1], PALM[0][1], w)], [lerp(AKIMBO[1][0], PALM[1][0], w), lerp(AKIMBO[1][1], PALM[1][1], w)]], handL: 0, armR: g < 22.9 ? lA2(UPP, WIND, span(g, 22.73, 22.9)) : lA2(WIND, HIT, span(g, 22.9, VOTE.hit - 0.005)), handR: 0 } as Pose; }      /* (v6c, the reviewer: a wind-up, his fist up by his ear over 5 frames from the point (683-687), then down into his palm on 690) */      /* (from the point, a short stroke down into his palm) */      /* (his hand up all through 14, the stroke in 15a's smaller two-shot: any descent in his close shot was too fast in pixels, motion2) */      /* (by a pose between, his hand up through "favour?": straight from up by his ear to the palm the forearm swept a wide arc, motion2) */
    else if (g >= 21.4 && g < 23.2) { const u = span(g, 21.5, 22.2), PT = BOY_POINT;      // (14: "All in favour?" with his finger pointing out before him (the reviewer's choice): a raised hand had to come down to his palm too fast for motion2)
      q = { ...q, armR: [[lerp(AKIMBO[0][0], PT[0], u), lerp(AKIMBO[0][1], PT[1], u)], [lerp(AKIMBO[1][0], PT[2], u), lerp(AKIMBO[1][1], PT[3], u)]], handR: 0 } as Pose; }
    if (g >= 22.6 && g < 23.1) q = armHuman(q, "R", heading);      // (v6c: the wind-up's lerps folded his arm to 175 degrees, rule 16)
    // (v6c, the review of v6 point 9: shot 5 stood still. He rubs his hands, eager, while the narrator tells of the captain's cabin: both
    //  forearms swinging a little in turn, 2.2 times a second, faded in and out)
    if (g >= 6.5 && g < 8.65) { const a = Math.sin((g - 6.5) * 2 * Math.PI * 2.2) * 7 * span(g, 6.5, 6.8) * (1 - span(g, 8.3, 8.65)), L0 = q.armL as unknown as [Seg2, Seg2], R0 = q.armR as unknown as [Seg2, Seg2];
      q = { ...q, armL: [L0[0], [L0[1][0] + a, L0[1][1]]], armR: [R0[0], [R0[1][0] - a, R0[1][1]]] } as Pose; }
    return q; };
  return { name: "boy", at: POS("boy", id), walk: viewOf(id).right, h: HEIGHTS.boy, rimSide: -1, off: s.t0, sun: false, key: 0.4,
    cast: { name: "boy", m, who: "sir", look: BOY, seed: 14, armWipe: false, pose: hook,
      hands: { L: id === "14" ? [[0, "fist"], [VOTE.lift0, "open"]] : [[0, "fist"]], R: id === "13" ? [[0, "fist"]] : id === "14" ? [[0, "fist"], [21.5, "point"], [22.73, "fist"]] : id === "15a" ? [[0, "fist"]] : [[0, (s.t0 >= 22.0 && s.t0 < 22.9) || (s.t0 >= 8.7 && s.t0 < 12.1) ? "open" : "fist"]] },
      ...(talk ? { mouth: mouthTrack(s, talk) } : {}) } };
};

// ------------------------------------------------------------------ the pudding (flat, in the sailor's ink) ------------------------------------------------------------------
/** the pudding drawn in the sailor's own layer: in shot 1 behind his gripping left hand (his fingers round its side) until his right palm takes
 *  it (1.30); then on his right palm with his fingers drawn again over its near edge (the two-layer hand). In card pixels (the canvas has his card's transform) */
/** side = shot 1's grip round its side (its middle at the hand, its base 0.9 r under it); else on the palm (its base on the hand) */
export const pudOf = (pl: Placed, side = false, hs: Side = "R") => { const f = pl.f, W = jointPx(f, "wr" + hs), Tp = jointPx(f, "tip" + hs), mpp = HEIGHTS.crew / (FM.PPM * heightOf("sir")), r = PUD_R / mpp;
  const g: P2 = [W[0] + 0.45 * (Tp[0] - W[0]), W[1] + 0.45 * (Tp[1] - W[1])];
  return { grip: g, c: (side ? g : [g[0], g[1] - PUD_HOLD * r]) as P2, base: (side ? [g[0], g[1] + 0.9 * r] : [g[0], g[1] - (PUD_HOLD - 0.9) * r]) as P2, r, mpp }; };
/** the pudding as drawn at film time t in shot `id` (card pixels): while it stands on the plate (before the lift) its base is where the lens sees
 *  the plate's top, his gripping hand over its side; from the lift it eases onto his hand over 0.2 s (drawn from the hand alone its base stood
 *  14 px over the plate: the rig's limits move the drawn grip off the solved one, the check) */
export const pudDrawn = (id: string, fr: number, pl: Placed, t: number) => { if (t >= HANDOVER.give) return { ...pudOf(pl, false, "R"), side: false };
  const p = pudOf(pl, true, "L"), q = project(id, fr, [PLATE[0], PLATE[1], PLATE_TOP + (PLANT.pudOff ? 0.01 : 0)]), card: P2 = [(q[0] - FM.W / 2) / pl.z + pl.cx, (q[1] - FM.H / 2) / pl.z + pl.cy];
  const k = 1 - span(t, HANDOVER.lift0, HANDOVER.lift0 + 0.2), dx = (card[0] - p.base[0]) * k, dy = (card[1] - p.base[1]) * k;
  return { ...p, c: [p.c[0] + dx, p.c[1] + dy] as P2, base: [p.base[0] + dx, p.base[1] + dy] as P2, side: true }; };
// (v6c, the reviewer on the v6c stills: the pudding read as a bird, its tall pointed dome a head, the small red cherry an eye and the bite a
//  beak. Now a pudding in its bowl: a blue-banded bowl (its bottom on the base point, where it stands on the plate), a round dark dome low
//  in it, a round cream cap with round drips, and a big round cherry with its own ink on top: no point and no dot)
const pudShape = (h: G, c: P2, r: number, bites: number, ol: number) => {
  const k = new Ink(h, ol), ring = (x: number, y: number, rx: number, ry: number, a0 = 0, a1 = 2 * Math.PI, n = 32): P2[] => Array.from({ length: n + 1 }, (_, j) => { const a = a0 + ((a1 - a0) * j) / n; return [x + rx * Math.cos(a), y + ry * Math.sin(a)] as P2; });
  const rimY = c[1] + 0.3 * r, botY = c[1] + 0.9 * r;
  const bowl: P2[] = [[c[0] - 1.05 * r, rimY], [c[0] + 1.05 * r, rimY], ...ring(c[0], rimY, 1.05 * r, botY - rimY, 0, Math.PI, 24).slice(1, -1).map(([x, y]) => [x, y] as P2)];
  const band: P2[] = [...ring(c[0], rimY, 1.0 * r, (botY - rimY) * 0.98, 0.18 * Math.PI, 0.82 * Math.PI, 16), ...ring(c[0], rimY, 0.82 * r, (botY - rimY) * 0.72, 0.82 * Math.PI, 0.18 * Math.PI, 16)];
  const dome: P2[] = [...ring(c[0], rimY, 0.92 * r, 0.82 * r, Math.PI, 2 * Math.PI, 28)];
  const cream: P2[] = [...ring(c[0], rimY - 0.42 * r, 0.62 * r, 0.42 * r, Math.PI, 2 * Math.PI, 20), ...[0.62, 0.3, -0.05, -0.38, -0.62].flatMap((u, j, A) => { const x0 = c[0] + u * r, x1 = c[0] + (A[j + 1] ?? -0.62) * r; return j + 1 < A.length ? ring((x0 + x1) / 2, rimY - 0.42 * r, Math.abs(x1 - x0) / 2, (j % 2 ? 0.14 : 0.24) * r, 0, Math.PI, 8) : []; })];
  const B9 = 1e5, bitesAt: P2[][] = [[[c[0] + r * 0.78, c[1] - r * 0.02], 0.36 * r]].slice(0, bites).map(([q, rr]) => ring((q as P2)[0], (q as P2)[1], rr as unknown as number, rr as unknown as number, 0, 2 * Math.PI, 16));
  h.save(); if (bitesAt.length) { h.beginPath(); h.rect(-B9, -B9, 2 * B9, 2 * B9); for (const b of bitesAt) k.trace(b); h.clip("evenodd"); }
  k.group([dome], "#6e3418");      // (the dark pudding, low and round in its bowl)
  k.group([cream], "#f4ecd8");      // (the cream, a round cap with round drips)
  h.restore();
  k.group([bowl], "#eef0f2"); k.group([band], "#3a5f9a");      // (the bowl, a blue band round it: drawn after the pudding, its rim over the dome's foot)
  k.group([ring(c[0], rimY - 0.82 * r, 0.24 * r, 0.24 * r, 0, 2 * Math.PI, 20)], "#c0141e");      // (the cherry, big and round, on the cream's top)
};
/** the sailor's extra drawing: the pudding (behind his hand in shot 1, on it after) and his fingers over its edge; a contact shadow while it
 *  stands on the plate. Every hand drawn again here is his own left hand (registered for limb_check) */
export const crewExtra = (id: string): Extra => { const s = SH[id];
  return {
    back: (h, pl, fr) => { const t = s.t0 + fr / FM.FPS; if (t >= HANDOVER.give) return; const p = pudDrawn(id, fr, pl, t);
      if (t < 0.6) { h.save(); h.globalAlpha = 0.35 * (1 - span(t, HANDOVER.lift0, HANDOVER.lift0 + 0.22)); h.fillStyle = "#140a06"; h.beginPath(); h.ellipse(p.base[0], p.base[1], p.r * 1.05, p.r * 0.22, 0, 0, 2 * Math.PI); h.fill(); h.restore(); }      // (its contact shadow on the plate, fading as it lifts)
    },
    // (the pudding in front of the hand that holds it, that hand's fingers drawn again over its edge: in shot 1 behind his gripping fist it was
    //  hidden, and at the hand-over it seemed to come from nowhere, the independent review of v6-t13. From the hand-over it moves from his left
    //  grip to his right palm over 0.2 s)
    front: (h, pl, fr) => { const t = s.t0 + fr / FM.FPS, f = pl.f, sk = f.sk, sc = scaleOf(f.who), side: Side = t < HANDOVER.give ? "L" : "R";
      let p = t < HANDOVER.give ? pudDrawn(id, fr, pl, t) : pudOf(pl, false, "R");
      if (t >= HANDOVER.give && t < HANDOVER.give + 0.2) { const a = pudOf(pl, true, "L"), u = span(t, HANDOVER.give, HANDOVER.give + 0.2); p = { ...p, c: [lerp(a.c[0], p.c[0], u), lerp(a.c[1], p.c[1], u)] as P2 }; }
      pudShape(h, p.c, p.r, bitesAt(t), 7 * sc);      // (v6c: its ink 7, a prop's, finer than the figures' 9: at 9 the bowl's band and rim ran together)
      const hf = handFlip(sk, side, "grip"); h.save(); h.translate(f.x, footY(f.who)); h.scale(sc, sc);
      inkHand(new Ink(h, 9), hf.w, hf.d, sk.P.hand, "grip", (CREW.col?.skin ?? "#d9a079"), hf.flip, false, 9, "fingers"); DRAWN_HELD.push({ who: "crew", at: hf.w, rig: true }); h.restore(); } }; };
const DRAWN_HELD = ((DRAWN as unknown as { heldHands?: { who: string; at: P2; rig: boolean }[] }).heldHands ??= []);

/** who is in each shot: everyone the shot's camera sees (any of his head, middle, sides or feet in the picture) */
const BUILD: Record<string, (id: string) => Who> = { captain, crew, boy };
export const inPicture = (id: string, nm: string) => { if (nm === "boy" && BOY_WALKING.includes(id)) return false; const at = POS(nm, id), hh = HEIGHTS[nm] ?? 1.75;
  return [[0, 0], [0, hh * 0.5], [0, hh], [0, hh * 0.65], [0, hh * 0.8], [-0.45, hh * 0.75], [0.45, hh * 0.75], [-0.35, hh * 0.6], [0.35, hh * 0.6], [-0.3, 0.3], [0.3, 0.3]].some(      /* (the head's middle too: in a close-up nothing else of him is in the picture) */([dx, z]) => { const q = project(id, 0, [at[0] + dx, at[1], z]); return q[2] > 0 && q[0] > -20 && q[0] < FM.W + 20 && q[1] > -20 && q[1] < FM.H + 20; }); };
export const WHO: Record<string, () => Who[]> = Object.fromEntries(SHOTS.map((S) => [S.id, () => ["boy", "crew", "captain"].filter((nm) => inPicture(S.id, nm)).map((nm) => BUILD[nm](S.id))]));
export const EXTRAS: Record<string, Record<string, Extra>> = Object.fromEntries(SHOTS.map((S) => [S.id, { crew: crewExtra(S.id) }]));

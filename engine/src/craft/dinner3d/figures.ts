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
import { ease } from "../stage/acting";
import { figure, D, scaleOf, heightOf, FM, jointPx, footY, thighUnder, px, reach } from "../clips/clipKit";
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
  { id: "n7", who: "narrator", at: 16.75, p: N7 }, { id: "w8", who: "boy", at: 22.0, p: W8 }] as const;
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
const CAP_HAND = { R: [-0.7, 1.02, TABLE_TOP + 0.022] as P3 };
const capKnee = (up = 0): P3 => local("captain", 0.2, -0.1, 0.27 + up);
const ON_PLATE: P3 = [PLATE[0] + 0.07, PLATE[1] + 0.04, PLATE_TOP + 0.012];
/** the half rise in shot 10 (film time): up 15.30-15.45 (the seat at most 10 cm over the chest), the fists down on the table at 15.45 (the
 *  contact frame), held, down again 16.40-16.70 */
export const RISE = { up0: 15.3, hit: 15.45, down0: 16.4, down1: 16.68, lift: 0.04 };
const captain = (id: string): Who => { const s = SH[id], yaw = headingIn(id, FACING.captain), m = figure("sir", 0, yaw); m.stand(40);
  const T = (x: number) => x - 0.02, H = (nod = 0, tilt = 0) => headTo(yaw, nod, tilt), seat = { ...SIT };
  const F = (o: Record<string, unknown>) => ({ face: { pupil: 1, smile: 0, brow: 0, lid: 0.06, wide: 0, sad: 0, squeeze: 0, smirk: 0, teeth: 0, mouth: 0, ...o } });      // (every value set: one left out kept the last, the squeeze of 6 stayed into 10)
  // the faces, on the words (film time)
  ease(m, -1, { ...seat, head: H(6) }, 0.01, F({ gaze: [-0.4, 0.6], smile: 0.5, brow: 0.4, lid: 0.05 }));      // (1: looking down at his plate, pleased)
  ease(m, T(0.9), { ...seat, head: H(0) }, 0.5, F({ gaze: [-0.8, 0.1], smile: 0.34, brow: 0.7, wide: 0.15 }));      // (his eyes follow the pudding away, left; the smile kept over 0.3 inside the shot)
  ease(m, T(1.6), { ...seat, head: H(-2) }, 0.15, F({ gaze: [-0.7, 0], smile: -0.5, brow: 1, wide: 0.6, lid: 0, mouth: 0.22 }));      // (2: eyes wide; the mouth from 0.22 in his talking shot, rule 14)
  ease(m, T(1.95), { ...seat, lean: 14, head: H(-6) }, 0.12, F({ gaze: [-0.6, -0.1], smile: -0.8, brow: -1, wide: 0.3, lid: 0 }));      // (the fist, "Hey!")
  ease(m, T(4.7), { ...seat, head: H(2) }, 0.01, F({ gaze: [-0.7, 0], smile: -0.6, brow: -0.4, lid: 0.15 }));      // (4: watching)
  ease(m, T(5.3), { ...seat, head: H(4) }, 0.3, F({ gaze: [-0.7, 0], smile: -0.8, brow: -1, lid: 0.3 }));      // (the brows down)
  ease(m, T(8.7), { ...seat, head: H(0) }, 0.01, F({ gaze: [-0.7, 0], smile: -0.7, brow: -0.8, lid: 0.2 }));
  ease(m, T(9.1), { ...seat, lean: 0, head: H(-6) }, 0.2, F({ gaze: [-0.6, 0], smile: -0.8, brow: -0.9, lid: 0.82 }));      // (6: leans back, eyes nearly shut (the lids, never the squeeze's chevrons: they switch in one frame))
  ease(m, T(13.3), { ...seat, head: H(2) }, 0.01, F({ gaze: [-0.7, 0], smile: -0.8, brow: -0.9, lid: 0.2, mouth: 0.16 }));      // (9: opens his mouth to protest, small: never over 0.2 in this shot)
  ease(m, T(14.0), { ...seat, head: H(4) }, 0.25, F({ gaze: [-0.7, 0], smile: -1, brow: -1, lid: 0.35, mouth: 0, teeth: 0 }));      // (presses his lips)
  ease(m, T(15.0), { ...seat, lean: 12, head: H(2) }, 0.3, F({ gaze: [-0.7, 0], smile: -1, brow: -1, lid: 0.2, wide: 0.2, sweat: 0.6 }));      // (begins to rise, the first sweat)
  ease(m, T(15.3), { ...seat, lean: 22, head: H(-4) }, 0.01, F({ gaze: [-0.7, 0], smile: -0.9, brow: -1, wide: 0.4, lid: 0, sweat: 1, mouth: 0.22 }));      // (10: up, the slam; sweating)
  ease(m, T(16.4), { ...seat, lean: 6, head: H(6) }, 0.28, F({ gaze: [-0.6, 0.2], smile: -0.6, brow: 0.2, sad: 0.4, wide: 0.1, lid: 0.1, sweat: 1 }));      // (sinks back)
  ease(m, T(16.7), { ...seat, lean: 4, head: H(-4) }, 0.01, F({ gaze: [-0.6, 0], smile: 0.34, brow: -0.6, lid: 0.1 }));      // (11: the chest beat, proud)
  ease(m, T(18.2), { ...seat, lean: 2, head: H(-6) }, 0.35, F({ gaze: [-0.4, 0], smile: 0.7, brow: 0.3, lid: 0.45 }));      // (pleased with himself)
  ease(m, T(23.2), { ...seat, lean: 6, head: H(6) }, 0.01, F({ gaze: [-0.5, 0.5], smile: -0.6, brow: 0.6, sad: 0.8, lid: 0.1 }));
  ease(m, T(23.3), { ...seat, lean: 14, py: SIT.py - 0.02, head: H(10) }, 0.35, F({ gaze: [-0.5, 0.7], smile: -0.7, brow: 0.8, sad: 1, lid: 0.2 }));      // (15: his shoulders sink)
  const mouth = id === "2" ? mouthOf(["k2"], s.t0, s.t1) : id === "10a" || id === "10b" ? mouthOf(["k6"], s.t0, s.t1) : null;
  const at = FIGS.captain;
  const hook = (t: number, p: Pose, heading: number): Pose => { const g = t, sk = solve(D.props("sir"), p, heading), pelX = (sk.j.pelvis as unknown as number[])[0];
    let q: Pose = { ...p, twist: 0 };
    // (the seat on the chest's top every frame: the drawn underside of his thighs at the pelvis measured and the pelvis moved so it lies there;
    //  as he leaned it rose 3.4 cm off it, the first check. In the half rise it goes up to RISE.lift over it, the feet kept)
    const up = g >= RISE.up0 - 0.05 && g < RISE.down1 ? span(g, RISE.up0 - 0.05, RISE.hit - 0.03) * (1 - span(g, RISE.down0, RISE.down1)) : 0;
    const want = (SEATJ.things[0].frames[0] as number[])[2] + up * RISE.lift + (PLANT.seatHigh ? 0.05 : 0), mpp = HEIGHTS.captain / (FM.PPM * heightOf("sir")), LL = (D.props("sir").thigh + D.props("sir").shin + D.props("sir").ankle) * scaleOf("sir") * mpp;
    for (let it = 0; it < 6; it++) { const skq = solve(D.props("sir"), q, heading), gq = { name: "captain", who: "sir" as const, x: 0, sk: skq, o: {} }, px0 = jointPx(gq, "pelvis")[0], TH = D.props("sir").thigh * scaleOf("sir");
      const low = thighUnder(gq).filter(([x]) => Math.abs(x - px0) < 0.33 * TH).reduce((a, b) => (b[1] > a[1] ? b : a)), h = (footY("sir") - low[1]) * mpp;
      q = { ...q, py: (q.py ?? SIT.py) + (want - h) / LL }; }
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
    if (g >= 15.0 && g < RISE.down1) { const lift = g < RISE.hit ? 0.06 * span(g, 15.0, 15.36) * (1 - span(g, 15.38, RISE.hit)) : 0;      // (fists up off the table and down on it at 15.45)
      hR = [CAP_HAND.R[0] + 0.02, CAP_HAND.R[1] - 0.02, CAP_HAND.R[2] + lift * 2 + 0.012]; lifted = lift > 0.001; }      // (his right fist up off the table and down on it at 15.45; a fist stands 1.2 cm higher than a flat hand)      // (a fist stands 1.2 cm higher than a flat hand)
    if (g >= 23.6 - 0.35) hR = lerp3(CAP_HAND.R, ON_PLATE, span(g, 23.25, 23.6));      // (15: his hand onto the empty plate)
    put("R", [hR[0], hR[1], hR[2] + dz], true, lifted || (g > 23.25 && g < 23.6) ? null : g >= 23.6 ? "plate" : "table");
    if (g >= 1.95 - 0.14 && g < 2.7) { const u = span(g, 1.81, 1.95); q = { ...q, armL: [[lerp(20, 30, u), lerp(8, 66, u)], [lerp(60, 150, u), lerp(0, 46, u)]], handL: 0 } as Pose; }      // ("Hey!": his left fist up out by his shoulder, clear of his beard and mouth: at his chest it lay over them, the first stills)
    else if (g >= 16.8 && g < 18.7) { const beat = span(g, 16.8, 16.95) * (1 - span(g, 17.05, 17.2)) + span(g, 17.2, 17.35) * (1 - span(g, 17.45, 17.6)), up = span(g, 17.6, 17.95);      // (11: two beats on his chest, then the fist up by his shoulder)
      q = { ...q, armL: [[lerp(lerp(20, 34, beat), 70, up), lerp(10, 40, up)], [lerp(lerp(70, 150, beat), 175, up), lerp(0, 20, up)]], handL: 0 } as Pose; }
    else if (g >= 15.0 && g < 15.6) { const u = span(g, 15.05, 15.4); q = { ...q, armL: [[lerp(10, 34, u), lerp(-10, 60, u)], [lerp(40, 150, u), lerp(10, 40, u)]], handL: 0 } as Pose; }      // (10: his left fist up by his shoulder as he shouts)
    else { const r = armTo(sk2, "L", skOf(id, at, HEIGHTS.captain, pel2, capKnee())); q = { ...q, armL: r.arm, handL: 70 - r.arm[1][0] } as Pose; MISS["captain L"] = r.miss; }      // (his left hand on his knee)
    return q; };
  const fistAt = (t0: number) => (t0 >= 13.3 && t0 < 16.7 ? "fist" : "open");
  return { name: "captain", at, walk: viewOf(id).right, h: HEIGHTS.captain, rimSide: 1, off: s.t0, sun: false,
    redAt: id === "2" ? 2.0 : id === "9" ? 14.4 : id === "10a" || id === "10b" ? 14.9 : undefined, redMax: id === "10a" || id === "10b" ? 1.15 : id === "9" ? 0.75 : 0.6,
    cast: { name: "captain", m, who: "sir", look: CAPTAIN, seed: 33, armWipe: false, pose: hook,
      hands: { L: [[0, (s.t0 >= 1.6 && s.t0 < 2.7) || (s.t0 >= 15.3 && s.t0 < 15.6) || (s.t0 >= 16.7 && s.t0 < 18.7) ? "fist" : "relaxed"]], R: [[0, fistAt(s.t0)]] },
      ...(mouth ? { mouth: mouthTrack(s, mouth) } : {}) } };
};

// ------------------------------------------------------------------ the sailor ------------------------------------------------------------------
/** the pudding (flat, his ink): its radius in metres, no wider than his hand is long; how many bites are gone by film time t */
export const PUD_R = 0.08;      // (at 6.2 cm it read as a dot in the medium shots, the first stills; Knopp's hand is 17 cm long)
export const bitesAt = (t: number) => (t >= 10.62 ? 2 : t >= 4.82 ? 1 : 0);
/** the slap on the book (shot 3): his right hand from over the book down onto its cover at 2.77 (the contact frame), then flat on it */
export const SLAP = { hit: 2.77 };
/** where the pudding's middle is, in his own frame (forward, to his right, up; metres), at film time t, from shot 1's hand-over on (it lies on
 *  his right palm: the hand nearer the lens in the front views) */
export const pudAt = (t: number): P3 => {
  const chest: P3 = [0.24, 0.16, 0.66], nose: P3 = [0.3, 0.08, 1.0], mouthP: P3 = [0.27, 0.06, 0.93], high: P3 = [0.12, 0.34, 1.22], away: P3 = [0.05, 0.46, 0.7], toast: P3 = [0.12, 0.42, 1.1], up: P3 = [0.2, -0.08, 0.86];      /* (toast: up beside his face, out to his right: before his chin it lay over his speaking mouth; up (5): toward his middle, away from the boy on his right: out to his right it lay over the boy's eye; the first stills) */
  if (t < 1.6) return lerp3([0.3, 0.02, 0.76], chest, span(t, 1.3, 1.6));      // (1: from the hand-over in front of him to his chest)
  if (t < 3.55) return chest; if (t < 4.7) return lerp3(chest, nose, span(t, 3.55, 3.8) * (1 - span(t, 4.1, 4.45)));      // (3: up to his nose, a sniff, down)
  if (t < 6.4) return lerp3(chest, mouthP, span(t, 4.72, 4.82) * (1 - span(t, 4.95, 5.2)));      // (4: a bite at 4.80)
  if (t < 8.7) return lerp3(chest, up, span(t, 7.0, 7.4));      // (5: up, out of the boy's reach)
  if (t < 9.8) return up;
  if (t < 12.1) { const hi = span(t, 9.85, 10.1) * (1 - span(t, 10.4, 10.55)), bite = span(t, 10.45, 10.6) * (1 - span(t, 10.75, 11.0)), sw = span(t, 11.45, 11.75);
    return lerp3(lerp3(lerp3(chest, high, hi), mouthP, bite), away, sw); }      // (7: high, the big bite at 10.60, swung away at 11.50)
  if (t < 13.3) return lerp3(chest, toast, span(t, 12.1, 12.2));      // (8: the toast by his face, never before his mouth)
  if (t >= 16.7 && t < 18.7) return lerp3(chest, high, span(t, 17.35, 17.65));      // (11: hands up, the pudding with it)
  return chest; };
/** shot 1: his left hand round the pudding on the plate, lifted toward him (0.10-0.90); his right palm comes under it and takes it (1.30) */
export const HANDOVER = { lift0: 0.33, lift1: 0.95, under0: 1.0, give: 1.3 };      // (the lift from 0.33: the ting at 0.333 as it leaves the plate)
const crew = (id: string): Who => { const s = SH[id], yaw = headingIn(id, FACING.crew), m = figure("sir", 0, yaw); m.stand(40);
  const T = (x: number) => x - 0.02, H = (nod = 0, tilt = 0) => headTo(yaw, nod, tilt), F = (o: Record<string, unknown>) => ({ face: { pupil: 1, smile: 0, brow: 0, lid: 0.06, wide: 0, sad: 0, squeeze: 0, smirk: 0, teeth: 0, mouth: 0, ...o } });
  ease(m, -1, { lean: 4, head: H(4) }, 0.01, F({ gaze: [0.5, 0.4], smile: 0.9, brow: 0.4, lid: 0.2 }));      // (1: sly, taking it)
  ease(m, T(2.7), { lean: 2, head: H(0) }, 0.01, F({ gaze: [0.6, 0.1], smile: 0.6, brow: 0.2, lid: 0.15 }));
  ease(m, T(3.6), { lean: 2, head: H(-8) }, 0.25, F({ gaze: [0.3, -0.3], smile: 0.6, brow: 0.5, lid: 0.6 }));      // (the sniff, eyes half shut; his lean kept while his hand lies on the book: leaning back it drew 2 cm off it)
  ease(m, T(4.2), { lean: 2, head: H(2, 4) }, 0.2, F({ gaze: [0.6, 0], smile: 0.9, smirk: 0.8, brow: 1, lid: 0.1 }));      // (brows up, a crooked grin)
  ease(m, T(4.7), { lean: 2, head: H(0) }, 0.01, F({ gaze: [0.6, 0.2], smile: 0.8, brow: 0.5, lid: 0.3, mouth: 0.24 }));      // (4: chewing; the mouth never under 0.22 in this shot)
  ease(m, T(6.4), { lean: 2, head: H(0) }, 0.01, F({ gaze: [-0.5, 0.2], smile: 0.6, smirk: 0.4, brow: 0.3, lid: 0.2 }));      // (5: eyeing the boy)
  ease(m, T(8.7), { lean: 12, head: H(-2) }, 0.01, F({ gaze: [0.8, 0], smile: 0.34, smirk: 0.8, brow: -1, lid: 0.25 }));      // (6: leans at the captain, points, mouth shut; set on the cut: eased over it his smile crossed 0.3 in the shot, rule 14)
  ease(m, T(9.8), { lean: 2, head: H(-8) }, 0.01, F({ gaze: [0.4, -0.5], smile: 0.9, brow: 0.8, lid: 0, wide: 0.2, mouth: 0.24 }));      // (7: admiring it high, then chewing)
  ease(m, T(12.1), { lean: 2, head: H(0) }, 0.01, F({ gaze: [0.7, 0], smile: 0.6, smirk: 0.8, brow: 0.5, lid: 0.15 }));      // (8: the toast, a crooked smile)
  ease(m, T(12.9), { lean: 2, head: H(8) }, 0.15, F({ gaze: [0.7, 0], smile: 0.7, smirk: 0.8, brow: 0.6, lid: 0.3 }));      // (a nod)
  ease(m, T(13.08), { lean: 2, head: H(0) }, 0.15, F({ gaze: [0.7, 0], smile: 0.7, smirk: 0.8, brow: 0.6, lid: 0.2 }));
  ease(m, T(16.7), { lean: 2, head: H(0) }, 0.01, F({ gaze: [0.7, 0], smile: 0.4, brow: 0.2, lid: 0.1 }));
  ease(m, T(17.4), { lean: -8, head: H(-6) }, 0.25, F({ gaze: [0.7, 0], smile: 0.32, brow: 0.9, wide: 0.5, lid: 0 }));      // (11: leans back, a hand up; the smile kept over 0.3 inside the shot)
  ease(m, T(18.7), { lean: 2, head: H(0) }, 0.01, F({ gaze: [-0.6, 0.1], smile: 0.5, brow: 0.4, lid: 0.1 }));      // (12: looks at the boy)
  ease(m, T(20.2), { lean: 2, head: H(0, 4) }, 0.2, F({ gaze: [-0.6, 0.1], smile: 0.9, smirk: 0.9, brow: 0.6, lid: 0.3 }));      // (a crooked grin)
  ease(m, T(20.5), { lean: 2, head: H(0) }, 0.01, F({ gaze: [0.6, 0], smile: 0.6, brow: 0.4, lid: 0.1 }));
  ease(m, T(20.9), { lean: 2, head: H(10) }, 0.15, F({ gaze: [0.6, 0], smile: 0.7, brow: 0.5, lid: 0.2 }));      // (13: a nod,
  ease(m, T(21.1), { lean: 2, head: H(0) }, 0.15, F({ gaze: [0.6, 0], smile: 0.7, brow: 0.5, lid: 0.2 }));
  ease(m, T(21.5), { lean: 0, head: H(-10) }, 0.2, F({ gaze: [0.6, -0.2], smile: 0.8, brow: 0.7, lid: 0.15 }));      //  the chin up)
  ease(m, T(22.0), { lean: 0, head: H(-4) }, 0.01, F({ gaze: [-0.4, 0], smile: 0.8, brow: 0.6, lid: 0.1 }));      // (14: his hand up)
  const talk = id === "8" ? mouthOf(["d4"], s.t0, s.t1) : null;
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
    const rSk = PUD_R / ((scaleOf("sir") / FM.PPM) * (HEIGHTS.crew / heightOf("sir")));      /* (the pudding's radius in his skeleton units) */
    if (g < 1.6) { const P0: P3 = [PLATE[0], PLATE[1], PLATE_TOP + (PLANT.pudOff ? 0.01 : 0)], P1 = pudW([0.3, 0.02, 0.76]), u = span(g, HANDOVER.lift0, HANDOVER.lift1);
      if (g < HANDOVER.give + 0.02) { if (u < 0.001) put("L", P0, 0, true, undefined, 0.9 * rSk); else put("L", lerp3([P0[0], P0[1], P0[2] + 0.9 * PUD_R], P1, u), 0); }      /* (on the plate: its base where the lens sees the plate's top, his grip 0.9 r over it) */ else { const back = span(g, HANDOVER.give, HANDOVER.give + 0.25); q = { ...q, armL: [[lerp(30, 16, back), lerp(10, 22, back)], [lerp(80, 58, back), 0]] } as Pose; }
      // the right hand: from his hip up under the pudding (0.95-1.30), then carrying it to his chest
      if (g >= HANDOVER.under0) put("R", base(lerp3(lerp3(pudW([0.1, 0.3, 0.45]), P1, span(g, HANDOVER.under0, HANDOVER.give)), pudW(pudAt(g)), g > HANDOVER.give ? 1 : 0)));
      else q = { ...q, armR: [[16, 22], [58, 0]] } as Pose; }
    else { put("R", base(pudW(pudAt(g)))); q = { ...q, armL: [[16, 22], [58, 0]] } as Pose; }
    if (g >= 2.7 && g < 4.7) { const top: P3 = [BOOK[0] - 0.02, BOOK[1] - 0.02, BOOK_TOP + 0.012 + (PLANT.handInBook ? -0.02 : 0)], up = 1 - span(g, 2.705, SLAP.hit - 0.005);
      // (3: the slap, from 16 cm over the book onto its cover at the contact frame, then flat on it. The rig's own reach (a search over the arm's
      //  swing and its raise out to the side): facing the lens, the book lies to his side, and the two-link solver, swinging in his own plane only,
      //  fell short of it as he breathed, the check)
      if (up === 0) TARGETS[`${id}:${fr}:crew:L`] = { on: "book", w: top };
      const T0 = skSeen(id, fr, at, HEIGHTS.crew, pelX, top), sc = scaleOf("sir"), tgt: [number, number] = [px(0) + (T0[0] - pelX) * sc, footY("sir") + (T0[1] - (0.16 * up) / ((scaleOf("sir") / FM.PPM) * (HEIGHTS.crew / heightOf("sir")))) * sc];
      q = { ...reach("sir", px(0) - pelX * sc, { ...q, handL: 0 }, heading, "L", tgt, false, { mid: true, elbowDown: true }), handL: 0 } as Pose; }
    if (g >= 8.7 && g < 9.8) { const u = span(g, 8.72, 8.85); q = { ...q, armL: [[lerp(16, 62, u), lerp(22, 6, u)], [lerp(58, 74, u), 0]] } as Pose; }      // (6: pointing at the captain's chest: at his face the arm lay over it, the first check)
    if (g >= 20.8 && g < 23.2) { const u = span(g, 20.82, 21.0); q = { ...q, armL: [[lerp(16, 140, u), lerp(22, 60, u)], [lerp(58, 200, u), lerp(0, 20, u)]], handL: 0 } as Pose; }      // (13-14: his left hand up by his ear at "vote" (20.99), palm to the lens, kept up)
    return q; };
  const kindL = s.t0 < 1.6 ? "grip" : s.t0 >= 2.7 && s.t0 < 4.7 ? "open" : s.t0 >= 8.7 && s.t0 < 9.8 ? "point" : s.t0 >= 20.5 && s.t0 < 23.2 ? "open" : "relaxed";
  return { name: "crew", at, walk: viewOf(id).right, h: HEIGHTS.crew, rimSide: -1, off: s.t0, sun: false, key: 0.5,
    cast: { name: "crew", m, who: "sir", look: CREW, seed: 26, armWipe: false, pose: hook,
      hands: { L: [[0, kindL]], R: [[0, "grip"]] },
      ...(talk ? { mouth: mouthTrack(s, talk) } : chewing ? { mouth: mouthTrack(s, (T0) => (T0 >= s.t0 && T0 < s.t1 ? chewing(T0) : null)) } : {}) } };
};

// ------------------------------------------------------------------ the boy ------------------------------------------------------------------
const boy = (id: string): Who => { const s = SH[id], yaw = headingIn(id, FACING.boy), m = figure("sir", 0, yaw); m.stand(40);
  const T = (x: number) => x - 0.02, H = (nod = 0, tilt = 0) => headTo(yaw, nod, tilt), F = (o: Record<string, unknown>) => ({ face: { pupil: 1, smile: 0, brow: 0, lid: 0.06, wide: 0, sad: 0, squeeze: 0, smirk: 0, teeth: 0, mouth: 0, ...o } });
  ease(m, -1, { lean: 3, head: H(-4, 6) }, 0.01, F({ gaze: [0.6, 0], smile: 0.5, brow: 0.5, lid: 0.15 }));
  ease(m, T(0.6), { lean: 12, head: H(4, 4) }, 0.35, F({ gaze: [0.7, 0.3], smile: 0.8, brow: 0.9, wide: 0.4, lid: 0 }));      // (1: he leans to see the pudding taken)
  ease(m, T(4.7), { lean: 3, head: H(-4, 6) }, 0.01, F({ gaze: [0.6, 0], smile: 0.5, brow: 0.5, lid: 0.15 }));
  ease(m, T(5.6), { lean: 14, head: H(0, 4) }, 0.25, F({ gaze: [0.7, 0.2], smile: 0.6, brow: 0.9, wide: 0.4, lid: 0 }));      // (4: leans in, eager)
  ease(m, T(6.4), { lean: 6, head: H(0) }, 0.01, F({ gaze: [0.7, 0.2], smile: 0.5, brow: 0.8, wide: 0.4, lid: 0, mouth: 0.26 }));      // (5: the mouth open a little the whole shot (the lip's switch))
  ease(m, T(6.5), { lean: 16, head: H(4) }, 0.3, F({ gaze: [0.7, 0.3], smile: 0.6, brow: 0.9, wide: 0.5, lid: 0, mouth: 0.3 }));      // (leans forward)
  ease(m, T(7.2), { lean: 16, head: H(6) }, 0.2, F({ gaze: [0.7, 0.3], smile: 0.9, brow: 0.9, wide: 0.5, lid: 0, mouth: 0.38 }));      // (licks his lips: the tongue shows)
  ease(m, T(7.8), { lean: 10, head: H(2) }, 0.2, F({ gaze: [0.7, 0.2], smile: 0.6, brow: 0.7, wide: 0.3, lid: 0, mouth: 0.28 }));
  ease(m, T(8.3), { lean: 6, head: H(0, 4) }, 0.25, F({ gaze: [0.6, 0], smile: 1, brow: 0.6, lid: 0.25, mouth: 0.3 }));      // (smiles)
  ease(m, T(8.7), { lean: 3, head: H(-4, 6) }, 0.01, F({ gaze: [0.6, 0], smile: 0.5, brow: 0.5, lid: 0.15 }));
  ease(m, T(9.0), { lean: -4, head: H(8, 4) }, 0.2, F({ gaze: [0.5, 0.2], smile: 1, brow: 0.6, lid: 0.75 }));      // (6: he giggles, eyes nearly shut)
  ease(m, T(9.8), { lean: 3, head: H(-4, 6) }, 0.01, F({ gaze: [0.7, -0.2], smile: 0.6, brow: 0.8, lid: 0.05 }));      // (7: eyes on the pudding up high)
  ease(m, T(11.1), { lean: 14, head: H(0) }, 0.25, F({ gaze: [0.7, 0.1], smile: 0.4, brow: 1, wide: 0.5, lid: 0 }));      // (reaches for it, 11.10)
  ease(m, T(11.6), { lean: 2, head: H(-6) }, 0.25, F({ gaze: [0.7, 0], smile: 0.32, brow: 0.9, sad: 0.9, lid: 0 }));      // (it swings away: disappointed, brows up in the middle; the smile kept over 0.3 inside the shot)
  ease(m, T(12.1), { lean: 3, head: H(-4, 6) }, 0.01, F({ gaze: [0.6, 0], smile: 0.5, brow: 0.5, lid: 0.15 }));
  ease(m, T(16.7), { lean: 3, head: H(-4, 6) }, 0.01, F({ gaze: [0.6, 0], smile: 0.5, brow: 0.5, lid: 0.15 }));
  ease(m, T(17.4), { lean: -10, head: H(-6) }, 0.25, F({ gaze: [0.7, 0], smile: 0.32, brow: 1, wide: 0.6, lid: 0 }));      // (11: leans back, a hand up; the smile kept over 0.3)
  ease(m, T(18.7), { lean: 2, head: H(0) }, 0.01, F({ gaze: [0.7, 0], smile: 0.5, brow: 0.5, lid: 0.1 }));      // (12: looks at the sailor)
  ease(m, T(19.8), { lean: 2, head: H(12) }, 0.15, F({ gaze: [0.7, 0], smile: 0.7, brow: 0.6, lid: 0.2 }));      // (nods)
  ease(m, T(20.0), { lean: 2, head: H(0) }, 0.15, F({ gaze: [0.7, 0], smile: 0.7, brow: 0.6, lid: 0.2 }));
  ease(m, T(20.2), { lean: 2, head: H(0, 6) }, 0.2, F({ gaze: [0.7, 0], smile: 0.9, smirk: 0.8, brow: 0.6, lid: 0.3 }));      // (a crooked grin)
  ease(m, T(22.0), { lean: 0, head: H(-4) }, 0.01, F({ gaze: [0.5, -0.1], smile: 0.6, brow: 0.8, lid: 0, mouth: 0.22 }));      // (14: his hand up, "All in favour?")
  ease(m, T(22.8), { lean: 0, head: H(-6) }, 0.2, F({ gaze: [0.5, -0.1], smile: 1, brow: 0.8, lid: 0.25, mouth: 0.22 }));      // (grins)
  const talk = id === "14" ? mouthOf(["w8"], s.t0, s.t1) : null;
  const AKIMBO: [Seg2, Seg2] = [[20, 25], [60, 0]];
  const hook = (t: number, p: Pose, heading: number): Pose => { const g = t, sk = solve(D.props("sir"), p, heading); void sk;
    let q: Pose = { ...p, armL: AKIMBO, armR: AKIMBO, twist: 0 };
    if (g >= 11.05 && g < 11.9) { const u = span(g, 11.1, 11.35) * (1 - span(g, 11.55, 11.85)); q = { ...q, armR: [[lerp(20, 70, u), lerp(25, 8, u)], [lerp(60, 90, u), 0]] } as Pose; }      // (7: his hand out for the pudding, back as it swings away)
    if ((g >= 17.3 && g < 18.7) || (g >= 21.9 && g < 23.2)) { const u = g >= 21.9 ? span(g, 21.92, 22.15) : span(g, 17.35, 17.65);      // (his right hand up by his ear, palm to the lens; down again in 15)
      q = { ...q, armR: [[lerp(20, 140, u), lerp(25, 60, u)], [lerp(60, 200, u), lerp(0, 20, u)]], handR: 0 } as Pose; }
    return q; };
  return { name: "boy", at: FIGS.boy, walk: viewOf(id).right, h: HEIGHTS.boy, rimSide: -1, off: s.t0, sun: false, key: 0.4,
    cast: { name: "boy", m, who: "sir", look: BOY, seed: 14, armWipe: false, pose: hook,
      hands: { L: [[0, "fist"]], R: [[0, (s.t0 >= 16.7 && s.t0 < 18.7) || (s.t0 >= 22.0 && s.t0 < 23.2) || (s.t0 >= 9.8 && s.t0 < 12.1) ? "open" : "fist"]] },
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
    back: (h, pl, fr) => { const t = s.t0 + fr / FM.FPS; if (t >= HANDOVER.give) return; const p = pudDrawn(id, fr, pl, t), sc = scaleOf(pl.f.who);
      if (t < 0.6) { h.save(); h.globalAlpha = 0.35 * (1 - span(t, 0.33, 0.55)); h.fillStyle = "#140a06"; h.beginPath(); h.ellipse(p.base[0], p.base[1], p.r * 1.05, p.r * 0.22, 0, 0, 2 * Math.PI); h.fill(); h.restore(); }      // (its contact shadow on the plate, fading as it lifts)
      pudShape(h, p.c, p.r, 0, 9 * sc); },
    front: (h, pl, fr) => { const t = s.t0 + fr / FM.FPS; if (t < HANDOVER.give) return; const p = pudOf(pl, false, "R"), f = pl.f, sk = f.sk, sc = scaleOf(f.who); pudShape(h, p.c, p.r, bitesAt(t), 9 * sc);
      // (his own left fingers again, over the pudding's near edge: the rig's hand at his wrist with its own turn and flip, the fingers' layer only)
      const hf = handFlip(sk, "R", "grip"); h.save(); h.translate(f.x, footY(f.who)); h.scale(sc, sc);
      inkHand(new Ink(h, 9), hf.w, hf.d, sk.P.hand, "grip", (CREW.col?.skin ?? "#d9a079"), hf.flip, false, 9, "fingers"); DRAWN_HELD.push({ who: "crew", at: hf.w, rig: true }); h.restore(); } }; };
const DRAWN_HELD = ((DRAWN as unknown as { heldHands?: { who: string; at: P2; rig: boolean }[] }).heldHands ??= []);

/** who is in each shot: everyone the shot's camera sees (any of his head, middle, sides or feet in the picture) */
const BUILD: Record<string, (id: string) => Who> = { captain, crew, boy };
export const inPicture = (id: string, nm: string) => { const at = FIGS[nm], hh = HEIGHTS[nm] ?? 1.75;
  return [[0, 0], [0, hh * 0.5], [0, hh], [0, hh * 0.65], [0, hh * 0.8], [-0.45, hh * 0.75], [0.45, hh * 0.75], [-0.35, hh * 0.6], [0.35, hh * 0.6], [-0.3, 0.3], [0.3, 0.3]].some(      /* (the head's middle too: in a close-up nothing else of him is in the picture) */([dx, z]) => { const q = project(id, 0, [at[0] + dx, at[1], z]); return q[2] > 0 && q[0] > -20 && q[0] < FM.W + 20 && q[1] > -20 && q[1] < FM.H + 20; }); };
export const WHO: Record<string, () => Who[]> = Object.fromEntries(SHOTS.map((S) => [S.id, () => ["boy", "crew", "captain"].filter((nm) => inPicture(S.id, nm)).map((nm) => BUILD[nm](S.id))]));
export const EXTRAS: Record<string, Record<string, Extra>> = Object.fromEntries(SHOTS.map((S) => [S.id, { crew: crewExtra(S.id) }]));

// Roberts' bedtime (pirate week, Short 1): who is in each shot and what they do, in film time (shot list v5, the reviewer's yes 28 Nov,
// granskning/roberts-laggdags/stopp-manus-bildlista.md). The four pirates (wardrobe/pirates.ts) on the one skeleton; each figure's card at his
// pelvis's floor point on the deck (shots.json figs, a shot's own place overriding it), turned by the shot's camera. The helpers that keep the
// eyes and mouths from flickering are copied from dinner3d/figures.ts at 1c99a4b (karna-andringar.md).
import { pupilAt, qPupils } from "../wardrobe/kit";
import { POSES, type Pose } from "../rig";
const POSES_STAND = POSES.stand;
import { ease as ease0 } from "../stage/acting";
import { figure, FM, scaleOf, footY } from "../clips/clipKit";
import { Ink } from "../ink";
import { KIT_DESIGN } from "../wardrobe/kit";
import { hookMugPose, mugSide, mugAt, mugOpening, holdOutPose, POUR_ARM, reachPose, gripOf, teaPose } from "./props";
import { drawMug, bottle, mugFront, fingers, SKIN, PEWTER, PEWTER_IN, drawTea, drawPuff } from "./propsDraw";
import { RUM, mouthMid, type P2 } from "./rum";
import { ROBERTS_LOOK, RUM_LOOK, YOUNG_LOOK, GUNNER_LOOK } from "../wardrobe/pirates";
import type { Look } from "../designs/common";
import { SHOTS, HEIGHTS, headingIn, viewOf, project, placeOf, type Who, type Extra, type Placed } from "./core";
import SPEC from "./shots.json";
import TL from "../../../voice/roberts/timeline.json";
import N1 from "../../../voice/roberts/n1/pick.json";
import N2 from "../../../voice/roberts/n2/pick.json";
import D3 from "../../../voice/roberts/d3/pick.json";
import N4 from "../../../voice/roberts/n4/pick.json";
import N5 from "../../../voice/roberts/n5/pick.json";
import N6 from "../../../voice/roberts/n6/pick.json";
import N7 from "../../../voice/roberts/n7/pick.json";
import N8 from "../../../voice/roberts/n8/pick.json";
import D9 from "../../../voice/roberts/d9/pick.json";
import N10 from "../../../voice/roberts/n10/pick.json";
import N11 from "../../../voice/roberts/n11/pick.json";
import N12 from "../../../voice/roberts/n12/pick.json";
import W13 from "../../../voice/roberts/w13/pick.json";
import N14 from "../../../voice/roberts/n14/pick.json";
import N15 from "../../../voice/roberts/n15/pick.json";

const ease = (...a: Parameters<typeof ease0>) => { const [m, t0, pose, dur, o] = a; if (dur < 0.05) return ease0(m, t0, pose, dur, o);
  const { head: _h, ...rest } = pose as Pose; void _h; return ease0(m, t0, rest, Math.max(dur, 0.45), o); };
const SH = Object.fromEntries(SHOTS.map((s) => [s.id, s]));
const PICKS: Record<string, unknown> = { n1: N1, n2: N2, d3: D3, n4: N4, n5: N5, n6: N6, n7: N7, n8: N8, d9: D9, n10: N10, n11: N11, n12: N12, w13: W13, n14: N14, n15: N15 };
/** the voices: each take placed on its start in the timeline (voice/roberts/timeline.json); the rum pirate speaks d3 and d9, the young pirate w13 */
export const VOICES = (TL as { voices: { id: string; start: number }[] }).voices.map((v) => ({ id: v.id, who: v.id[0] === "d" ? "rum" : v.id[0] === "w" ? "young" : "narrator", at: v.start, p: PICKS[v.id] as { words: { w: string; a: number; b: number }[]; env30?: number[] } }));
export const FILM_S = SHOTS[SHOTS.length - 1].t1;
const LOOKS: Record<string, Look> = { roberts: ROBERTS_LOOK, rum: RUM_LOOK, young: YOUNG_LOOK, gunner: GUNNER_LOOK };
const FIGS = (SPEC as unknown as { figs: Record<string, [number, number]> }).figs, FACING = (SPEC as unknown as { facing: Record<string, [number, number]> }).facing;
/** a figure's pelvis floor point in a shot: the shot's own place, else his usual one */
export const POS = (nm: string, id: string): [number, number] => ((SH[id] as unknown as { place?: Record<string, [number, number]> }).place ?? {})[nm] ?? FIGS[nm];
const headTo = (yaw: number, nod = 0, tilt = 0): [number, number, number] => [Math.sign(yaw || 1) * 45 - yaw, nod, tilt];
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
const mouthOf = (ids: string[], t0: number, t1: number) => { const n = Math.round((FILM_S + 0.5) * FM.FPS), tr: number[] = []; let prev = 0, lastDir = 0, held = false, dv0 = 0;
  for (let f = 0; f < n; f++) { const T = f / FM.FPS; let tg = 0; for (const v of VOICES) if (ids.includes(v.id)) { const k = Math.round((T - v.at) * FM.FPS), e = (v.p as { env30: number[] }).env30; if (k >= 0 && k < e.length) tg = Math.max(tg, ((e[k - 1] ?? 0) + e[k] + (e[k + 1] ?? 0)) / 3); }
    let v = prev + Math.max(-0.1, Math.min(0.1, Math.max(dv0 - 0.04, Math.min(dv0 + 0.04, tg - prev)))); dv0 = v - prev; const dir = Math.abs(v - prev) < 1e-4 ? 0 : Math.sign(v - prev);
    if (dir !== 0 && lastDir !== 0 && dir !== lastDir && !held) { v = prev; held = true; } else { held = false; if (dir !== 0) lastDir = dir; }
    tr.push(v); prev = v; }
  return (T: number) => { const k = Math.round(T * FM.FPS); return T >= t0 - 1e-6 && T < t1 ? 0.22 + 0.7 * Math.max(0, tr[k] ?? 0) : null; }; };      // (from the shot's first frame: by float it read 1.5999 and the mouth fell to 0.19 there, rule 14)
const mouthTrack = (s: { t1: number }, f: (T: number) => number | null) => ({ t0: 0, len: Math.round(s.t1 * FM.FPS), mouth: Array.from({ length: Math.round(s.t1 * FM.FPS) }, (_, k) => f(k / FM.FPS) ?? 0) });
/** a pirate standing in a shot, turned to his facing in that shot's view, his mouth on his own lines (the actions come shot by shot) */
/** a shot's own body headings (shots.json "yaw"), where its action needs one (shot 1: the rum pirate's toast at 45 as on the sheet; shot 8: the pour's pair) */
const YAW = (id: string, nm: string): number | undefined => ((SH[id] as unknown as { yaw?: Record<string, number> }).yaw ?? {})[nm];
type Act = (m: ReturnType<typeof figure>, yaw: number, s: { t0: number; t1: number }, F: (o: Record<string, unknown>) => Record<string, unknown>) => { hands?: Record<string, [number, string][]> };
/** what a figure does in a shot (the drinking things: the reviewer's decisions 28 Nov, sheet v3, props.ts) */
const ACTS: Record<string, Record<string, Act>> = {
  // shot 1, the hook: the rum pirate raises his mug in a toast beside his beard, the elbow bent, the forearm up; on its way up until the dark
  "1": { roberts: (m, yaw, s, F) => { const head = headTo(yaw), r = teaPose(yaw, head);
      ease(m, -1, { [`arm${r.side}`]: (r.pose as unknown as Record<string, unknown>)[`arm${r.side}`] } as Partial<Pose>, 0.01);
      // (the blow: he leans his head to the lantern and purses his lips, 0.9-1.5 s; the lantern goes out at BLOW1.out)
      ease(m, s.t0 + BLOW1.a, { head: [head[0], 8, -6] as [number, number, number] }, 0.25, F({ mouth: 0.32, gaze: [0.7, 0.35], wide: 0.1 }));
      ease(m, s.t0 + BLOW1.b, { head }, 0.35, F({ mouth: 0, gaze: [0.4, 0.1], smile: 0.3 }));
      return { hands: { [r.side]: [[0, "grip"]] } }; },
    rum: (m, yaw, s) => { const p = hookMugPose(yaw, gapUnits("1", "rum", yaw)), sd = p.armR !== (POSES_STAND_ARM.R as unknown) && JSON.stringify(p.armR) !== JSON.stringify(STAND.armR) ? "R" : "L";
    ease(m, s.t0 + 0.15, { head: p.head, [`arm${sd}`]: (p as unknown as Record<string, unknown>)[`arm${sd}`] } as Partial<Pose>, BLOW1.out - 0.15);      // (it comes to rest as the lantern dies: frozen in the dark)
    return { hands: { [sd]: [[0, "grip"]] } }; } },
  // shot 2: the young pirate hauls the bell rope twice (the rope drawn by us, shots.json hide; its pulls ROPE2)
  "2": { young: (m, yaw, s, F) => { const r = ROPE2(); ease(m, -1, { [`arm${r.side}`]: r.up } as Partial<Pose>, 0.01, F({ gaze: [0.5, -0.3], mouth: 0.2 }));
      for (const [a, d] of ROPE2_PULLS) { ease(m, s.t0 + a, { [`arm${r.side}`]: r.down } as Partial<Pose>, 0.22, F({ gaze: [0.5, -0.4], mouth: 0.5, squeeze: 0.3 })); ease(m, s.t0 + a + d, { [`arm${r.side}`]: r.up } as Partial<Pose>, 0.32, F({ gaze: [0.5, -0.3], mouth: 0.2 })); }
      return { hands: { [r.side]: [[0, "grip"]] } }; } },
  // shot 3: the gunner and the young pirate groan as each lantern dies (shots.json lamps): the head drops a little, the brows sag, the mouth opens
  "3": { gunner: (m, yaw, s, F) => { groan(m, yaw, s, F, 0.05); return {}; }, young: (m, yaw, s, F) => { groan(m, yaw, s, F, 0.12); return {}; } },
  // shot 4: in the dark, the rum pirate holds his mug beside his beard, lower than the toast (no forearm-up rule: with his head bent down to
  // peer into it the beard came within 4 units of a raised mug), and squints at it (his line d3 on the mouth)
  "4": { rum: (m, yaw, s, F) => { const p = hookMugPose(yaw, gapUnits("4", "rum", yaw), 14, -999), sd = JSON.stringify(p.armR) !== JSON.stringify(STAND.armR) ? "R" : "L";
    ease(m, -1, { head: [p.head![0], 8, 0] as [number, number, number], [`arm${sd}`]: (p as unknown as Record<string, unknown>)[`arm${sd}`] } as Partial<Pose>, 0.01, F({ gaze: [0.8, 0.5], lid: 0.32, squeeze: 0.15, brow: -0.4 }));
    ease(m, s.t0 + 1.6, { head: p.head }, 0.4,      /* (the pose solved for this nod (14): the beard comes nearer the mug as he leans in) */ F({ gaze: [0.85, 0.6], lid: 0.45, squeeze: 0.25, brow: -0.6 }));      // (he leans in closer, the squint harder)
    return { hands: { [sd]: [[0, "grip"]] } }; } },
  // shot 8, the pour: the young pirate holds his mug out at his waist (POUR_ARM); the rum pirate's arm is set per the pair's placing (POUR8 below)
  "8": { young: (m, yaw, s) => { const p = holdOutPose(yaw, POUR_ARM), sd = JSON.stringify(p.armR) !== JSON.stringify(STAND.armR) ? "R" : "L";
    ease(m, s.t0, { [`arm${sd}`]: (p as unknown as Record<string, unknown>)[`arm${sd}`] } as Partial<Pose>, 0.01); return { hands: { [sd]: [[0, "grip"]] } }; },
    rum: (m, yaw, s) => { const r = POUR8(); ease(m, s.t0, { head: r.pose.head, [`arm${r.side}`]: (r.pose as unknown as Record<string, unknown>)[`arm${r.side}`] } as Partial<Pose>, 0.01); void yaw; return { hands: { [r.side]: [[0, "grip"]] } }; } } };
const groan: (m: ReturnType<typeof figure>, yaw: number, s: { t0: number }, F: (o: Record<string, unknown>) => Record<string, unknown>, lag: number) => void = (m, yaw, s, F, lag) => {
  const lamps = ((SH["3"] as unknown as { lamps?: { at: number }[] }).lamps ?? []).map((l) => l.at), h = headTo(yaw);
  lamps.forEach((at, i) => { ease(m, s.t0 + at + lag, { head: [h[0], 6 + 4 * i, 0] as [number, number, number] }, 0.3, F({ sad: 0.4 + 0.2 * i, mouth: 0.45, gaze: [0.2, -0.2], brow: -0.3 })); }); };
/** shot 1's blow (film seconds from the shot's start): the lips purse at a, the breath reaches the lantern and it goes out at out, done at b */
export const BLOW1 = { a: 0.9, out: 1.45, b: 1.55 };
const STAND = (POSES_STAND as unknown as Pose), POSES_STAND_ARM = { R: (POSES_STAND as unknown as Pose).armR };
const pirate = (nm: string) => (id: string): Who => { const s = SH[id], yaw = YAW(id, nm) ?? headingIn(id, FACING[nm]), m = figure("sir", 0, yaw); m.stand(40);
  const F = (o: Record<string, unknown>) => ({ face: capFace({ pupil: 1, smile: 0, brow: 0, lid: 0.06, wide: 0, sad: 0, squeeze: 0, smirk: 0, teeth: 0, mouth: 0, ...o }) });
  ease(m, -1, { head: headTo(yaw) }, 0.01, F({ gaze: [0, 0] }));
  const act = ACTS[id]?.[nm]?.(m, yaw, s, F) ?? {};
  const own = VOICES.filter((v) => v.who === nm).map((v) => v.id), talk = own.length ? mouthOf(own, s.t0, s.t1) : null;
  return { name: nm, at: POS(nm, id), walk: viewOf(id).right, h: HEIGHTS[nm], rimSide: -1, off: s.t0, sun: false, key: 0.4,
    cast: { name: nm, m, who: "sir", look: LOOKS[nm], seed: 31, armWipe: false, hands: { L: [[0, "relaxed"]], R: [[0, "relaxed"]], ...(act.hands ?? {}) },
      ...(talk ? { mouth: mouthTrack(s, talk) } : {}) } } as unknown as Who; };
const BUILT_WHO: Record<string, Record<string, Who>> = {};
const BUILD0: Record<string, (id: string) => Who> = { roberts: pirate("roberts"), rum: pirate("rum"), young: pirate("young"), gunner: pirate("gunner") };
const BUILD: Record<string, (id: string) => Who> = Object.fromEntries(Object.entries(BUILD0).map(([nm, b]) => [nm, (id: string) => { const w = b(id); (BUILT_WHO[id] ??= {})[nm] = w; return w; }]));
/** who is in each shot: the shot's own places (shots.json place); a figure with none there is not in it */
export const inPicture = (id: string, nm: string) => { const pl = (SH[id] as unknown as { place?: Record<string, unknown> }).place ?? {}; if (!(nm in pl)) return false;
  const at = POS(nm, id), hh = HEIGHTS[nm] ?? 1.75; return [[0, 0], [0, hh * 0.5], [0, hh * 0.9]].some(([dx, z]) => { const q = project(id, 0, [at[0] + dx, at[1], z]); return q[2] > 0 && q[0] > -200 && q[0] < FM.W + 200 && q[1] > -200 && q[1] < FM.H + 200; }); };
export const WHO: Record<string, () => Who[]> = Object.fromEntries(SHOTS.map((S) => [S.id, () => ["gunner", "young", "rum", "roberts"].filter((nm) => inPicture(S.id, nm)).map((nm) => BUILD[nm](S.id))]));
export const EXTRAS: Record<string, Record<string, Extra>> = Object.fromEntries(SHOTS.map((S) => [S.id, {}]));
/** a figure standing in a shot (no action), to place props and solve reaches before its own build */
const standWho = (id: string, nm: string, yaw: number) => ({ name: nm, cast: { name: nm, m: (() => { const m = figure("sir", 0, yaw); m.stand(40); ease(m, -1, { head: headTo(yaw) }, 0.01); return m; })(), who: "sir", look: LOOKS[nm], seed: 31, armWipe: false, hands: { L: [[0, "relaxed"]], R: [[0, "relaxed"]] } }, at: POS(nm, id), walk: viewOf(id).right, h: HEIGHTS[nm], rimSide: -1, off: SH[id].t0 } as unknown as Who);
/** shot 2's bell rope (set.py: the bell's rope at 2.38, -1.14, from 1.6 m down to 0.7), held at 1.05 m and pulled down to 0.88 */
const ROPE = { x: 2.38, y: -1.14, top: 1.6, bot: 0.7, hold: 1.05, pull: 0.88 }, ROPE2_PULLS: [number, number][] = [[0.12, 0.3], [0.8, 0.3]];
let R2: { side: "L" | "R"; up: unknown; down: unknown } | null = null;
const ROPE2 = () => { if (R2) return R2; const id = "2", yaw = YAW(id, "young")!, pl = placeOf(id, 0, standWho(id, "young", yaw)), at = (z: number) => { const q = project(id, 0, [ROPE.x, ROPE.y, z]); return fromScreen(pl, [q[0], q[1]]); };
  const up = reachPose(yaw, at(ROPE.hold), headTo(yaw), undefined, { clearFace: 20 }), down = reachPose(yaw, at(ROPE.pull), headTo(yaw), up.side, { clearFace: 20 });
  R2 = { side: up.side, up: (up.pose as unknown as Record<string, unknown>)[`arm${up.side}`], down: (down.pose as unknown as Record<string, unknown>)[`arm${up.side}`] }; return R2; };
/** the 20 px the reviewer wants between a vessel and the face, in a figure's skeleton units at his size in this shot (+2 px): measured on the
 *  sheet at its own scale, 24 px became 19 in shot 1, where the rum pirate stands smaller (the contact review of the Sunday stills) */
const gapUnits = (id: string, nm: string, yaw: number) => { const pl = placeOf(id, 0, standWho(id, nm, yaw)), ppu = pl.z * scaleOf(pl.f.who); return Math.min(25, Math.max(15, 22 / ppu + 2)); };      // (+2 px for the figure's own small sway; the solve itself holds the gap across 3 degrees of head turn either way (props.ts); 25 the most the arm reaches with the forearm up)
/** a figure's own card space on the layer paintFigures hands its extras (the transform it draws the figure with) */
const inCard = (h: CanvasRenderingContext2D, pl: Placed) => { const sc = scaleOf(pl.f.who); h.translate(pl.f.x, footY(pl.f.who)); h.scale(sc, sc); return new Ink(h, KIT_DESIGN.ol); };
const toCardOf = (pl: Placed, q: P2): P2 => { const sc = scaleOf(pl.f.who); return [pl.z * (pl.f.x + sc * q[0] - pl.cx) + FM.W / 2, pl.z * (footY(pl.f.who) + sc * q[1] - pl.cy) + FM.H / 2]; };      // (skeleton units to the picture)
const fromScreen = (pl: Placed, p: P2): P2 => { const sc = scaleOf(pl.f.who); return [((p[0] - FM.W / 2) / pl.z + pl.cx - pl.f.x) / sc, ((p[1] - FM.H / 2) / pl.z + pl.cy - footY(pl.f.who)) / sc]; };
// shot 2: the rope from the bell down through the young pirate's grip, its tail hanging below his hand (pulled down as far as his hand
// went: its length kept), between his palm and his fingers; the bell's ring at the bottom of each pull
EXTRAS["2"].young = { front: (h, pl, fr) => { const g = h as unknown as CanvasRenderingContext2D, k = inCard(g, pl), sk = pl.f.sk, r = ROPE2(), T = fr / FM.FPS;
  const P = (z: number) => { const q = project("2", fr, [ROPE.x, ROPE.y, z]); return fromScreen(pl, [q[0], q[1]]); }, top = P(ROPE.top), hand = gripOf(sk, r.side), h0 = P(ROPE.hold);
  const ppm = (P(ROPE.bot)[1] - P(ROPE.top)[1]) / (ROPE.top - ROPE.bot), tail: P2 = [hand[0], hand[1] + (ROPE.hold - ROPE.bot) * ppm];      // (the tail hangs straight down from his hand, its length the rope's below his grip); void h0
  void h0;
  const line = (pts: P2[], w: number, c: string) => { g.save(); g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const q of pts.slice(1)) g.lineTo(q[0], q[1]); g.stroke(); g.restore(); };
  line([top, hand, tail], 15, "#241a1e"); line([top, hand, tail], 7, "#c9b48a");
  fingers(k, sk, r.side, SKIN(YOUNG_LOOK));
  for (const [a] of ROPE2_PULLS) { const u = (T - a - 0.2) / 0.3; if (u > 0 && u < 1) { const b = P(1.72); g.save(); g.strokeStyle = `rgba(255,236,170,${Math.sin(Math.PI * u)})`; g.lineWidth = 6; g.lineCap = "round";
      for (const sd of [-1, 1]) for (const rr of [60, 95]) { g.beginPath(); g.arc(b[0], b[1], rr + 20 * u, sd < 0 ? Math.PI * 0.8 : -Math.PI * 0.2, sd < 0 ? Math.PI * 1.2 : Math.PI * 0.2); g.stroke(); } g.restore(); } } } };
// shot 1: Roberts' teacup, and his breath toward the lantern on the barrel while he blows
const LAMP1: [number, number, number] = [-0.34, -1.74, 1.08];      // (the barrel's lantern's glass, set.py BARREL_LAMP + its middle)
EXTRAS["1"].roberts = { front: (h, pl, fr) => { const g = h as unknown as CanvasRenderingContext2D, k = inCard(g, pl), sk = pl.f.sk, T = fr / FM.FPS;
  drawTea(k, sk, mugSide(sk), SKIN(ROBERTS_LOOK));
  const u = (T - BLOW1.a - 0.15) / (BLOW1.out - BLOW1.a + 0.05); if (u > 0 && u < 1) { const mo = mouthMid(sk, 0.32).c, lp = project("1", fr, LAMP1), to = fromScreen(pl, [lp[0], lp[1]]); drawPuff(g, mo, to, u, 1); } } };
// shot 4: his mug in the dark (no splash)
EXTRAS["4"].rum = { front: (h, pl) => { const k = inCard(h as unknown as CanvasRenderingContext2D, pl); drawMug(k, pl.f.sk, mugSide(pl.f.sk), SKIN(RUM_LOOK)); } };
// shot 1: the toast's mug in the rum pirate's hand, the splash while it rises
EXTRAS["1"].rum = { front: (h, pl, fr) => { const k = inCard(h as unknown as CanvasRenderingContext2D, pl), T = fr / FM.FPS + SH["1"].t0, up = T > SH["1"].t0 + 0.3 && T < SH["1"].t0 + 1.8;
  drawMug(k, pl.f.sk, mugSide(pl.f.sk), SKIN(RUM_LOOK), undefined, up); } };
/** shot 8's pour: the rum pirate's arm reaching the bottle whose neck is down in the young pirate's mug, solved once from the two standing
 *  figures' placings (the camera is still); the bottle drawn on the young pirate's layer (the rum pirate stands 4 cm farther, drawn first),
 *  then the mug's front wall over its neck, then both men's fingers */
let P8: { pose: Pose; side: "L" | "R"; residual: number } | null = null;
const POUR8 = () => { if (P8) return P8; const id = "8", yy = YAW(id, "young")!, yr = YAW(id, "rum")!;
  const young = { name: "young", cast: { name: "young", m: (() => { const m = figure("sir", 0, yy); m.stand(40); const p = holdOutPose(yy, POUR_ARM); ease(m, SH[id].t0, { head: headTo(yy), armR: p.armR, armL: p.armL } as Partial<Pose>, 0.01); return m; })(), who: "sir", look: YOUNG_LOOK, seed: 31, armWipe: false, hands: { L: [[0, "grip"]], R: [[0, "grip"]] } }, at: POS("young", id), walk: viewOf(id).right, h: HEIGHTS.young, rimSide: -1, off: SH[id].t0 } as unknown as Who;
  const rumS = { name: "rum", cast: { name: "rum", m: (() => { const m = figure("sir", 0, yr); m.stand(40); ease(m, -1, { head: headTo(yr) }, 0.01); return m; })(), who: "sir", look: RUM_LOOK, seed: 31, armWipe: false, hands: { L: [[0, "relaxed"]], R: [[0, "relaxed"]] } }, at: POS("rum", id), walk: viewOf(id).right, h: HEIGHTS.rum, rimSide: -1, off: SH[id].t0 } as unknown as Who;
  const py = placeOf(id, 0, young), pr = placeOf(id, 0, rumS), b = bottleOf(py.f.sk), gR = fromScreen(pr, toCardOf(py, b.g));
  const r = reachPose(yr, gR, [Math.sign(yr || 1) * 45 - yr, 10, 0], mugSide(pr.f.sk), { clearFace: 45 });
  P8 = { pose: r.pose, side: r.side, residual: r.cost }; return P8; };
/** the pour's bottle in the young pirate's skeleton units: the neck's tip in his mug's opening (its near side), the bottle up and out toward the
 *  pourer at POUR_TILT (props.ts pourInto) */
const bottleOf = (sk: Parameters<typeof mugSide>[0]) => { const m = mugAt(sk, mugSide(sk)), op = mugOpening(m), f = Math.sign(Math.sin(sk.faceYaw * Math.PI / 180) || 1);
  return { m, ...pourIntoF([(op.x0 + op.x1) / 2 - f * 14, op.y], op.y, -f) }; };
EXTRAS["8"].young = { front: (h, pl, fr) => { const g = h as unknown as CanvasRenderingContext2D, k = inCard(g, pl), b = bottleOf(pl.f.sk);
  const rw = BUILT_WHO["8"]?.rum, pr = rw ? placeOf("8", fr, rw) : null;
  // (the bottle's grip end where the rum pirate's hand actually is: from the neck's tip toward his grip, its length kept)
  let p = b; if (pr) { const gR = fromScreen(pl, toCardOf(pr, gripOf(pr.f.sk, P8!.side))), d = [b.n[0] - gR[0], b.n[1] - gR[1]], l = Math.hypot(d[0], d[1]) || 1, u: P2 = [d[0] / l, d[1] / l]; p = { ...b, ...pourAlong(b.n, u) }; }
  k.group([b.m.body], PEWTER); k.group([b.m.rim], PEWTER_IN); bottle(k, p); mugFront(k, b.m); fingers(k, pl.f.sk, mugSide(pl.f.sk), SKIN(YOUNG_LOOK));
  if (pr) { g.setTransform(pr.z, 0, 0, pr.z, FM.W / 2 - pr.z * pr.cx, FM.H / 2 - pr.z * pr.cy); fingers(inCard(g, pr), pr.f.sk, P8!.side, SKIN(RUM_LOOK)); } } };
/** the bottle from its neck's tip n back along -u (u: its way down, grip to neck), held near its bottom (props.ts POUR_BACK) */
const pourAlong = (n: P2, u: P2) => { const back = 0.12, L = RUM.body * (1 - back) + RUM.neck, g: P2 = [n[0] - u[0] * L, n[1] - u[1] * L];
  return { u, n, g, b0: [g[0] - u[0] * RUM.body * back, g[1] - u[1] * RUM.body * back] as P2, b1: [g[0] + u[0] * RUM.body * (1 - back), g[1] + u[1] * RUM.body * (1 - back)] as P2 }; };
const pourIntoF = (into: P2, rimY: number, side: number) => { const a = (52 * Math.PI) / 180, n: P2 = [into[0], rimY + 14]; return pourAlong(n, [side * Math.sin(a), Math.cos(a)]); };

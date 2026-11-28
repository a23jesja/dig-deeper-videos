// Roberts' bedtime (pirate week, Short 1): who is in each shot and what they do, in film time (shot list v5, the reviewer's yes 28 Nov,
// granskning/roberts-laggdags/stopp-manus-bildlista.md). The four pirates (wardrobe/pirates.ts) on the one skeleton; each figure's card at his
// pelvis's floor point on the deck (shots.json figs, a shot's own place overriding it), turned by the shot's camera. The helpers that keep the
// eyes and mouths from flickering are copied from dinner3d/figures.ts at 1c99a4b (karna-andringar.md).
import { pupilAt, qPupils } from "../wardrobe/kit";
import type { Pose } from "../rig";
import { ease as ease0 } from "../stage/acting";
import { figure, FM } from "../clips/clipKit";
import { ROBERTS_LOOK, RUM_LOOK, YOUNG_LOOK, GUNNER_LOOK } from "../wardrobe/pirates";
import type { Look } from "../designs/common";
import { SHOTS, HEIGHTS, headingIn, viewOf, project, type Who, type Extra } from "./core";
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
const pirate = (nm: string) => (id: string): Who => { const s = SH[id], yaw = headingIn(id, FACING[nm]), m = figure("sir", 0, yaw); m.stand(40);
  const F = (o: Record<string, unknown>) => ({ face: capFace({ pupil: 1, smile: 0, brow: 0, lid: 0.06, wide: 0, sad: 0, squeeze: 0, smirk: 0, teeth: 0, mouth: 0, ...o }) });
  ease(m, -1, { head: headTo(yaw) }, 0.01, F({ gaze: [0, 0] }));
  const own = VOICES.filter((v) => v.who === nm).map((v) => v.id), talk = own.length ? mouthOf(own, s.t0, s.t1) : null;
  return { name: nm, at: POS(nm, id), walk: viewOf(id).right, h: HEIGHTS[nm], rimSide: -1, off: s.t0, sun: false, key: 0.4,
    cast: { name: nm, m, who: "sir", look: LOOKS[nm], seed: 31, armWipe: false, hands: { L: [[0, "relaxed"]], R: [[0, "relaxed"]] },
      ...(talk ? { mouth: mouthTrack(s, talk) } : {}) } } as unknown as Who; };
const BUILD: Record<string, (id: string) => Who> = { roberts: pirate("roberts"), rum: pirate("rum"), young: pirate("young"), gunner: pirate("gunner") };
/** who is in each shot: the shot's own places (shots.json place); a figure with none there is not in it */
export const inPicture = (id: string, nm: string) => { const pl = (SH[id] as unknown as { place?: Record<string, unknown> }).place ?? {}; if (!(nm in pl)) return false;
  const at = POS(nm, id), hh = HEIGHTS[nm] ?? 1.75; return [[0, 0], [0, hh * 0.5], [0, hh * 0.9]].some(([dx, z]) => { const q = project(id, 0, [at[0] + dx, at[1], z]); return q[2] > 0 && q[0] > -200 && q[0] < FM.W + 200 && q[1] > -200 && q[1] < FM.H + 200; }); };
export const WHO: Record<string, () => Who[]> = Object.fromEntries(SHOTS.map((S) => [S.id, () => ["gunner", "young", "rum", "roberts"].filter((nm) => inPicture(S.id, nm)).map((nm) => BUILD[nm](S.id))]));
export const EXTRAS: Record<string, Record<string, Extra>> = Object.fromEntries(SHOTS.map((S) => [S.id, {}]));

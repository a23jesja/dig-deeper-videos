// Roberts' bedtime (pirate week, Short 1): a copy of the dinner's core (dinner3d/core.ts at 1c99a4b), the reviewer's decision of 28 Nov:
// roberts3d is built on a copy now and film3d is drawn out of the two after Roberts, before Blackbeard. Every change here that belongs to the
// core is listed in granskning/roberts-laggdags/karna-andringar.md. Left out of the copy: the cabin's sun through the stern windows, the chest
// and the captain's seat shadows. Added: the light per shot (night: the moon cool, the lanterns' warm rim; dawn: grey).
import { KIT_DESIGN, kitOf } from "../wardrobe/kit";
import type { Look } from "../designs/common";
import { FM, D, castAt, jointPx, scaleOf, footY, heightOf, px, type Cast } from "../clips/clipKit";
import { CUT } from "../motion";
import { Ink } from "../ink";
import SPEC from "./shots.json";
import CAMS_ALL from "./cams.json";

type G = CanvasRenderingContext2D;
type P2 = [number, number];
type Mat = number[][];
export type Shot = { id: string; t0: number; t1: number; what: string; static?: boolean; light?: "night" | "dawn";
  cam: { lens: number; fstop: number; focus: string; focusPoint?: number[]; keys?: unknown[]; from?: unknown[]; at?: number[] } };
export const SHOTS = SPEC.shots as unknown as Shot[];
export const HEIGHTS = SPEC.heights as Record<string, number>;
const CAMS = CAMS_ALL as unknown as Record<string, Mat[]>;
/** a shot's camera set from outside (a tuner tries cameras on the real figures) */
export const setCam = (id: string, frames: Mat[]) => { CAMS[id] = frames; };
export const smooth = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));

/** the planted faults of the movement checks (scripts/moves_check.mjs): each must fail */
export const PLANT: Record<string, boolean> = { oldBlink: false, float: false, turn27: false };

/** a world point (metres) in picture pixels at frame fr of a shot, and its depth along the lens */
export const project = (id: string, fr: number, p: [number, number, number]): [number, number, number] => {
  const F = CAMS[id], P = F[Math.max(0, Math.min(F.length - 1, fr))];
  const v = [0, 1, 2].map((r) => P[r][0] * p[0] + P[r][1] * p[1] + P[r][2] * p[2] + P[r][3]);
  return [v[0] / v[2], v[1] / v[2], v[2]]; };
/** the camera's place in the room (the centre of the projection) */
export const camAt = (id: string, fr: number): [number, number, number] => { const F = CAMS[id], P = F[Math.max(0, Math.min(F.length - 1, fr))];
  const a = P[0], b = P[1], c = P[2], det = (m: number[][]) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const M = [a.slice(0, 3), b.slice(0, 3), c.slice(0, 3)], r = [-a[3], -b[3], -c[3]], D0 = det(M);
  const col = (k: number) => det(M.map((row, i) => row.map((v, j) => (j === k ? r[i] : v)))) / D0; return [col(0), col(1), col(2)]; };

/** a shot's view: the lens's horizontal direction and the picture's right, on the floor (from the camera matrix's depth row) */
export const viewOf = (id: string): { d: [number, number]; right: [number, number] } => { const P = CAMS[id][0], l = Math.hypot(P[2][0], P[2][1]) || 1, d: [number, number] = [P[2][0] / l, P[2][1] / l]; return { d, right: [d[1], -d[0]] }; };
/** the rig's heading (0 = facing the lens, 90 = the picture's right) of a figure facing the world floor direction f, in a shot */
export const headingIn = (id: string, f: [number, number]) => { const v = viewOf(id); return (Math.atan2(f[0] * v.right[0] + f[1] * v.right[1], -(f[0] * v.d[0] + f[1] * v.d[1])) * 180) / Math.PI; };
/** a world point at depth `depth` along the lens seen at picture point q */
export const unproject = (id: string, fr: number, q: P2, depth: number): [number, number, number] => { const F = CAMS[id], P = F[Math.max(0, Math.min(F.length - 1, fr))];
  const A = [0, 1].map((r) => [0, 1, 2].map((c) => P[r][c] - q[r] * P[2][c])), b = [0, 1].map((r) => -(P[r][3] - q[r] * P[2][3])), M = [...A, [P[2][0], P[2][1], P[2][2]]], B = [...b, depth - P[2][3]];
  const det = (m: number[][]) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const D0 = det(M); return [0, 1, 2].map((k) => det(M.map((row, i) => row.map((v, j) => (j === k ? B[i] : v)))) / D0) as [number, number, number]; };

// ------------------------------------------------------------------ the figures ------------------------------------------------------------------
// (v6: the wardrobe, 25 Nov: the captain, the sailor and the boy are their own people, no longer Sir in other colours; wardrobe/cast.ts)
export type { Look };
/** a figure in a piece. at: his floor point when his card's pelvis is at card x 0; walk: the world floor direction of his card's +x;
 *  off: the piece starts this many seconds into his own timeline (he is already moving in the first frame) */
export type Who = { name: string; cast: Cast; at: [number, number]; walk: [number, number]; h: number; rimSide: 1 | -1; off: number; key?: number; sun?: boolean; redAt?: number; redMax?: number };

/** where a figure is at frame fr: his card (the rig's figure with its pelvis moved to card x px(0)), the floor point under his pelvis, and
 *  the 2D camera that draws his card with its ground line on that floor point and his height h above it */
/** our own blinks, across the cuts: half, half (the shot's last two frames but one), shut (its last frame and the next shot's first), half,
 *  half; each step held two frames, as the rig's blink. Inside a shot a blink changed an eye by 50-570 px from one frame to the next (flicker2);
 *  across a cut the measure starts again. By film frame of the cut (the next shot's first frame), per figure: about one every 5-6 s */
export const CUT_BLINKS: Record<string, number[]> = {};      // (set when the cuts are known: our own blinks across cuts, where a face is still)
export const placeOf = (id: string, fr: number, w: Who) => {
  // (no blinks in this film: the stage's own switch, a cut "0 s away" (motion.ts CUT, BLINK_CUT), so no blink is begun. A blink in these medium
  //  and close shots is 50-570 px of change in an eye from one frame to the next, the frozen flicker measure's fail (v6 test 2: 107 frames);
  //  no seed kept the blinks out of view, the search over 3000 seeds; v57 had none inside its shots either)
  const cutWas = CUT.left; CUT.left = 0;
  const f0 = castAt([w.cast], fr / FM.FPS + w.off)[0], k = w.h / heightOf(w.cast.who);
  CUT.left = cutWas;
  // (v6c, the reviewer: no shot may open with a lid more than half shut in its first 3 frames: 14 opened on a shut eye, 660. The lid shuts on the
  //  outgoing shot's last frame only, half before it and on the next shot's first two. Planted: oldBlink, shut on both sides of the cut as v6c)
  { const F = Math.round(fr + w.off * FM.FPS), k0 = (CUT_BLINKS[w.name] ?? []).map((c) => F - c).find((d) => (PLANT.oldBlink ? d >= -3 : d >= -2) && d <= (PLANT.oldBlink ? 2 : 1));
    if (k0 !== undefined) f0.o.face = { ...(f0.o.face ?? {}), lid: PLANT.oldBlink ? (k0 === -1 || k0 === 0 ? 1 : 0.42) : k0 === -1 ? 1 : 0.42 }; }
  const at: [number, number] = [w.at[0], w.at[1]];      // (his pelvis's floor point: the seat over the stool, a standing man over his feet)
  const ft = project(id, fr, [at[0], at[1], 0]), hd = project(id, fr, [at[0], at[1], w.h]), dy = PLANT.float ? -12 : 0;
  const z = (ft[1] - hd[1]) / (FM.PPM * heightOf(w.cast.who)), pelX = jointPx(f0, "pelvis")[0] - f0.x;
  const f = { ...f0, x: px(0) - pelX }, s = 0; void s;
  return { f, at, depth: ft[2], z, cx: px(0) - (ft[0] - FM.W / 2) / z, cy: footY(f.who) - (ft[1] + dy - FM.H / 2) / z, hpx: ft[1] - hd[1], k, pelX };
};
export type Placed = ReturnType<typeof placeOf>;
export const toScreen = (pl: Placed, q: P2): P2 => [pl.z * (q[0] - pl.cx) + FM.W / 2, pl.z * (q[1] - pl.cy) + FM.H / 2];
export const handPx = (pl: Placed) => D.props(pl.f.who).hand * scaleOf(pl.f.who) * pl.z;
/** a point of his card (card pixels) in the world: on the vertical plane through his floor point along his way (metres) */
export const cardToWorld = (w: Who, pl: Placed, q: P2): [number, number, number] => { const mpp = w.h / (FM.PPM * heightOf(w.cast.who)), u = (q[0] - px(0)) * mpp, up = (footY(pl.f.who) - q[1]) * mpp;
  return [pl.at[0] + w.walk[0] * u, pl.at[1] + w.walk[1] * u, up]; };
/** each foot: its heel and toe in the world (metres; z = height above the floor) and in the picture as drawn */
export const feetOf = (id: string, fr: number, w: Who, pl = placeOf(id, fr, w)) => (["L", "R"] as const).map((sd) => {
  const he = jointPx(pl.f, "heel" + sd), to = jointPx(pl.f, "toe" + sd), an = jointPx(pl.f, "an" + sd);
  return { side: sd, heel: cardToWorld(w, pl, he), toe: cardToWorld(w, pl, to), ankle: cardToWorld(w, pl, an), heelPx: toScreen(pl, he), toePx: toScreen(pl, to), anPx: toScreen(pl, an) }; });

// ------------------------------------------------------------------ painting (as cabin.ts paints step 1) ------------------------------------------------------------------
const cnv = () => (typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(FM.W, FM.H) : Object.assign(document.createElement("canvas"), { width: FM.W, height: FM.H }));
let OFF: OffscreenCanvas | HTMLCanvasElement | null = null, SH: OffscreenCanvas | HTMLCanvasElement | null = null, SM: OffscreenCanvas | HTMLCanvasElement | null = null;
export type Extra = { back?: (h: G, pl: Placed, fr: number) => void; front?: (h: G, pl: Placed, fr: number) => void };

/** the figures of a shot over the plate, the farthest first: contact shadows, the figure (with a piece's extra drawing in his own layer), the
 *  cabin's light on his fill (the ink kept), his cast shadow where the sun falls. Nothing but the rig's own two hands is drawn for a hand */
/** the figures' fills graded to each shot's light (per channel: multiply, then add): night, the moon cool over them; dawn, a grey morning. The
 *  rim on the lens's far side: night, the lanterns' warm edge; dawn, a pale one (the cabin had the sunset's warm rim, dinner3d) */
const GRADE: Record<string, number[]> = { night: [0.62, 0.66, 0.82, 4, 6, 14], dawn: [0.78, 0.76, 0.76, 6, 6, 8] };
const RIMC: Record<string, number[]> = { night: [1.22, 1.08, 0.9, 58, 26, 4], dawn: [1.08, 1.08, 1.1, 30, 28, 30] };
/** the figures dimmed as a shot's lanterns go out (shots.json lamps: each one's light off its fill, faded over the plate's own 4 frames),
 *  so a figure never stays lit on a deck gone dark; also the lanterns already out at its start (dark) */
export const dimAt = (id: string, fr: number) => { const sh = SHOTS.find((q) => q.id === id) as unknown as { lamps?: { at: number; out: number[] }[]; dark?: number[] };
  const T = fr / FM.FPS; let n = (sh.dark ?? []).length * 0.5; for (const l of sh.lamps ?? []) n += l.out.length * Math.max(0, Math.min(1, ((T - l.at) * FM.FPS) / 4));
  return Math.max(0.55, 1 - 0.07 * n); };
export const paintFigures = (g: G, id: string, fr: number, whos: Who[], extras: Record<string, Extra> = {}) => {
  const order = whos.map((w) => ({ w, pl: placeOf(id, fr, w) })).sort((p, q) => q.pl.depth - p.pl.depth);
  for (const { w, pl } of order) {
    const f = pl.f;
    for (const ft of feetOf(id, fr, w, pl)) {      // contact shadows under each foot, smaller and fainter as it lifts
      const up = Math.min(ft.heel[2], ft.toe[2]), mid: [number, number] = [(ft.heel[0] + ft.toe[0]) / 2, (ft.heel[1] + ft.toe[1]) / 2];
      const c0 = project(id, fr, [mid[0], mid[1] + 0.02, 0]), ex = project(id, fr, [mid[0] + 0.16, mid[1] + 0.02, 0]), ey = project(id, fr, [mid[0], mid[1] + 0.12, 0]);
      const an = jointPx(f, "an" + ft.side), c = toScreen(pl, [an[0], footY(f.who) - 4]), hangK = 1;
      const kl = 1 - 0.5 * Math.min(1, Math.max(0, up) / 0.04), L1 = Math.hypot(ex[0] - c0[0], ex[1] - c0[1]), L2 = Math.hypot(ey[0] - c0[0], ey[1] - c0[1]);
      const rx = Math.max(4, kl * Math.max(L1, L2)) * (hangK < 1 ? 1.25 : 1), ry = Math.max(2, Math.min(0.6 * rx, kl * Math.min(L1, L2))) * (hangK < 1 ? 0.8 : 1), al = (up > 0.004 ? 0.75 : 0.8) * hangK;
      g.save();
      g.setTransform(1, 0, 0, ry / rx, c[0], c[1]); const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx); gr.addColorStop(0, `rgba(14,7,5,${al})`); gr.addColorStop(0.55, `rgba(14,7,5,${al * 0.6})`); gr.addColorStop(1, "rgba(14,7,5,0)");
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, rx, 0, Math.PI * 2); g.fill(); g.restore(); }
    OFF ??= cnv(); const o = OFF, h = o.getContext("2d", { willReadFrequently: true }) as unknown as G; h.setTransform(1, 0, 0, 1, 0, 0); h.clearRect(0, 0, FM.W, FM.H);
    h.setTransform(pl.z, 0, 0, pl.z, FM.W / 2 - pl.z * pl.cx, FM.H / 2 - pl.z * pl.cy);
    const ex = extras[w.name]; if (ex?.back) { h.save(); ex.back(h, pl, fr); h.restore(); }
    const sc = scaleOf(f.who); h.save(); h.translate(f.x, footY(f.who)); h.scale(sc, sc); const Dz = kitOf(f.o.look) ? KIT_DESIGN : D; Dz.draw(new Ink(h, Dz.ol), f.sk, f.o); h.restore();
    if (ex?.front) { h.save(); ex.front(h, pl, fr); h.restore(); }
    h.setTransform(1, 0, 0, 1, 0, 0);
    const img = h.getImageData(0, 0, FM.W, FM.H), Dd = img.data, Wd = FM.W, N = Wd * FM.H, rim = Math.max(5, Math.round(16 * pl.z)), dx = w.rimSide;
    const s0 = toScreen(pl, jointPx(f, "skull")), c0 = toScreen(pl, jointPx(f, "crown")), hr = Math.hypot(c0[0] - s0[0], c0[1] - s0[1]) / 2, hc: P2 = [(s0[0] + c0[0]) / 2, (s0[1] + c0[1]) / 2 + hr * 0.2];
    const ru = w.redAt === undefined ? 0 : smooth((fr / FM.FPS + w.off - w.redAt) / 0.5) * (w.redMax ?? 1);
    const dm = dimAt(id, fr), GR0 = GRADE[(SHOTS.find((S) => S.id === id)?.light) ?? "night"], GR = [GR0[0] * dm, GR0[1] * dm, GR0[2] * dm, GR0[3], GR0[4], GR0[5]], RIM = RIMC[(SHOTS.find((S) => S.id === id)?.light) ?? "night"];
    const A = (i: number) => Dd[i * 4 + 3] / 255, wf = (k: number) => Math.min(1, Math.max(0, (Math.abs(Dd[k] - 36) + Math.abs(Dd[k + 1] - 23) + Math.abs(Dd[k + 2] - 38) - 30) / 40)) * (Dd[k + 3] / 255);
    const out = new Float32Array(N * 3); let kx0 = Wd, kx1 = 0; if (w.key) for (let y = 0; y < FM.H; y += 8) for (let x = 0; x < Wd; x += 4) if (Dd[(y * Wd + x) * 4 + 3] > 128) { kx0 = Math.min(kx0, x); kx1 = Math.max(kx1, x); }
    for (let y = 0; y < FM.H; y++) for (let x = 0; x < Wd; x++) { const i = y * Wd + x, k = i * 4; if (Dd[k + 3] < 2) continue; const f0 = wf(k); if (f0 <= 0) { out[i * 3] = Dd[k]; out[i * 3 + 1] = Dd[k + 1]; out[i * 3 + 2] = Dd[k + 2]; continue; }
      let r = Dd[k] * GR[0] + GR[3], gg = Dd[k + 1] * GR[1] + GR[4], b = Dd[k + 2] * GR[2] + GR[5];
      if (w.key) { const q = w.key * Math.min(1, Math.max(0, (dx > 0 ? x - kx0 : kx1 - x) / Math.max(1, kx1 - kx0))); r = r * (1 + 0.42 * q) + 22 * q; gg = gg * (1 + 0.3 * q) + 12 * q; b = b * (1 + 0.08 * q); }
      const xr = Math.min(Wd - 1, Math.max(0, x + dx * rim)), yr = y - Math.round(rim * 0.7), outside = yr < 0 ? 0 : Math.max(1 - A(yr * Wd + xr), 1 - A(y * Wd + xr));
      if (outside > 0) { const q = outside; r = r * (1 - q) + Math.min(255, r * RIM[0] + RIM[3]) * q; gg = gg * (1 - q) + Math.min(255, gg * RIM[1] + RIM[4]) * q; b = b * (1 - q) + Math.min(255, b * RIM[2] + RIM[5]) * q; }
      if (ru > 0) { const sk = Math.min(1, Math.max(0, (Dd[k] - Dd[k + 2] - 45) / 30)) * Math.min(1, Math.max(0, (Dd[k] - 150) / 40)), dd = Math.hypot(x - hc[0], (y - hc[1]) * 1.15) / hr;
        if (sk > 0 && dd < 1.0) { const mm = 0.72 * ru * sk * Math.min(1, (1.0 - dd) / 0.4); r = r * (1 - mm) + 214 * mm; gg = gg * (1 - mm) + 58 * mm; b = b * (1 - mm) + 52 * mm; } }      /* (the red of anger from the cheeks, cabin.ts) */
      out[i * 3] = Dd[k] * (1 - f0) + r * f0; out[i * 3 + 1] = Dd[k + 1] * (1 - f0) + gg * f0; out[i * 3 + 2] = Dd[k + 2] * (1 - f0) + b * f0; }
    for (let i = 0; i < N; i++) if (Dd[i * 4 + 3] >= 2) { Dd[i * 4] = out[i * 3]; Dd[i * 4 + 1] = out[i * 3 + 1]; Dd[i * 4 + 2] = out[i * 3 + 2]; }
    h.putImageData(img, 0, 0);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(o as CanvasImageSource, 0, 0); g.restore();
  } };

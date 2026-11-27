// The Short "The captain's dinner" (24 Nov evening): flat Knopp figures (the frozen rig, unchanged) in the step-1 cabin, as moves3d/core.ts
// puts them there (copied, not shared, so the movement sheet's code stays as it was). Every shot's camera holds still but the first; each
// figure's card is drawn at the floor point under his PELVIS (the seated captain's seat is over his stool), in the shot's own view: his
// heading and his card's world direction come from the shot's camera (cards stand across the lens).
import { KIT_DESIGN, kitOf } from "../wardrobe/kit";
import { CAPTAIN_LOOK, BOY_LOOK } from "../wardrobe/cast";
import type { Look } from "../designs/common";
import { FM, D, castAt, jointPx, scaleOf, footY, heightOf, px, type Cast } from "../clips/clipKit";
import { CUT } from "../motion";
import { Ink } from "../ink";
import SPEC from "./shots.json";
import CAMS_ALL from "./cams.json";

type G = CanvasRenderingContext2D;
type P2 = [number, number];
type Mat = number[][];
export type Shot = { id: string; t0: number; t1: number; what: string; static?: boolean;
  cam: { lens: number; fstop: number; focus: string; focusPoint?: number[]; keys?: unknown[]; from?: unknown[]; at?: number[] } };
export const SHOTS = SPEC.shots as unknown as Shot[];
export const HEIGHTS = SPEC.heights as Record<string, number>;
const CAMS = CAMS_ALL as unknown as Record<string, Mat[]>;
/** a shot's camera set from outside (scripts/dinner_v6_tune.mjs tries cameras on the real figures) */
export const setCam = (id: string, frames: Mat[]) => { CAMS[id] = frames; };
export const smooth = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));

/** the planted faults of the movement checks (scripts/moves_check.mjs): each must fail */
export const PLANT = { hookHi: false, pudLift: false, capOutD5: false, capTurn0: false, seatHigh: false, pudOff: false, handIn: false, armIn: false, float: false, handInBook: false, frontArm: false };

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
export const CAPTAIN: Look = CAPTAIN_LOOK;
export const BOY: Look = BOY_LOOK;
/** a figure in a piece. at: his floor point when his card's pelvis is at card x 0; walk: the world floor direction of his card's +x;
 *  off: the piece starts this many seconds into his own timeline (he is already moving in the first frame) */
export type Who = { name: string; cast: Cast; at: [number, number]; walk: [number, number]; h: number; rimSide: 1 | -1; off: number; key?: number; sun?: boolean; redAt?: number; redMax?: number };

/** where a figure is at frame fr: his card (the rig's figure with its pelvis moved to card x px(0)), the floor point under his pelvis, and
 *  the 2D camera that draws his card with its ground line on that floor point and his height h above it */
/** our own blinks, across the cuts: half, half (the shot's last two frames but one), shut (its last frame and the next shot's first), half,
 *  half; each step held two frames, as the rig's blink. Inside a shot a blink changed an eye by 50-570 px from one frame to the next (flicker2);
 *  across a cut the measure starts again. By film frame of the cut (the next shot's first frame), per figure: about one every 5-6 s */
export const CUT_BLINKS: Record<string, number[]> = { captain: [81, 192, 363, 561], crew: [48, 261, 469, 615], boy: [141, 501, 660] };      // (only where his face is still: a blink during a nod or a lean flickered, test 9 (the boy at 261, the sailor at 399))
export const placeOf = (id: string, fr: number, w: Who) => {
  // (no blinks in this film: the stage's own switch, a cut "0 s away" (motion.ts CUT, BLINK_CUT), so no blink is begun. A blink in these medium
  //  and close shots is 50-570 px of change in an eye from one frame to the next, the frozen flicker measure's fail (v6 test 2: 107 frames);
  //  no seed kept the blinks out of view, the search over 3000 seeds; v57 had none inside its shots either)
  const cutWas = CUT.left; CUT.left = 0;
  const f0 = castAt([w.cast], fr / FM.FPS + w.off)[0], k = w.h / heightOf(w.cast.who);
  CUT.left = cutWas;
  { const F = Math.round(fr + w.off * FM.FPS), k0 = (CUT_BLINKS[w.name] ?? []).map((c) => F - c).find((d) => d >= -3 && d <= 2);
    if (k0 !== undefined) f0.o.face = { ...(f0.o.face ?? {}), lid: k0 === -1 || k0 === 0 ? 1 : 0.42 }; }
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
/** the low sun through the stern windows: rays toward -y, 0.42 down for each 1 along (set.py); the windows' panes */
const SUN_BACK = 1 / 0.42, PANES: [number, number, number, number][] = [[-1.6, -0.7, 0.95, 1.85], [-0.45, 0.45, 0.95, 1.85], [0.7, 1.6, 0.95, 1.85]];
/** his shadow cast by the sun on the floor, only where the sun falls (the panes' patches less the table's own shadow), from his drawn outline:
 *  the same construction as step 1's (cabin.ts castShadow), the hinge on his drawn soles */
const castShadow = (g: G, id: string, fr: number, w: Who, pl: Placed, fig: OffscreenCanvas | HTMLCanvasElement) => {
  const c = camAt(id, fr), [x, y] = pl.at, vx = x - c[0], vy = y - c[1], vl = Math.hypot(vx, vy) || 1, rx = -vy / vl, ry = vx / vl, hw = 0.3;
  const HZ = Math.min(0.3, 0.35 * vl / SUN_BACK), W0 = project(id, fr, [x - rx * hw, y - ry * hw, 0]), W1 = project(id, fr, [x + rx * hw, y + ry * hw, 0]), WC = project(id, fr, [x, y, 0]), WQ = project(id, fr, [x, y - SUN_BACK * HZ, 0]);
  const f = pl.f, ppm = (footY(f.who) - jointPx(f, "crown")[1]) / (w.h * 0.97), dirx = W1[0] - W0[0], diry = W1[1] - W0[1], dl = Math.hypot(dirx, diry) || 1;
  const C = toScreen(pl, [f.x, footY(f.who)]), half = hw * ppm * pl.z, ratio = (2 * half) / dl;
  const P0 = [C[0] - (dirx / dl) * half, C[1] - (diry / dl) * half], P1 = [C[0] + (dirx / dl) * half, C[1] + (diry / dl) * half], P2 = toScreen(pl, [f.x, footY(f.who) - HZ * ppm]);
  const Q2 = [C[0] + (WQ[0] - WC[0]) * ratio, C[1] + (WQ[1] - WC[1]) * ratio];
  const sx = [P0[0], P1[0], P2[0]], sy = [P0[1], P1[1], P2[1]], dx = [P0[0], P1[0], Q2[0]], dy = [P0[1], P1[1], Q2[1]];
  const den = sx[0] * (sy[1] - sy[2]) + sx[1] * (sy[2] - sy[0]) + sx[2] * (sy[0] - sy[1]); if (Math.abs(den) < 1e-6) return;
  const solve3 = (v: number[]) => [(v[0] * (sy[1] - sy[2]) + v[1] * (sy[2] - sy[0]) + v[2] * (sy[0] - sy[1])) / den, (v[0] * (sx[2] - sx[1]) + v[1] * (sx[0] - sx[2]) + v[2] * (sx[1] - sx[0])) / den,
    (v[0] * (sx[1] * sy[2] - sx[2] * sy[1]) + v[1] * (sx[2] * sy[0] - sx[0] * sy[2]) + v[2] * (sx[0] * sy[1] - sx[1] * sy[0])) / den];
  const ax = solve3(dx), ay = solve3(dy);
  SH ??= cnv(); SM ??= cnv(); const sh = SH.getContext("2d") as unknown as G, sm = SM.getContext("2d") as unknown as G;
  sh.setTransform(1, 0, 0, 1, 0, 0); sh.clearRect(0, 0, FM.W, FM.H); sh.setTransform(ax[0], ay[0], ax[1], ay[1], ax[2], ay[2]); sh.drawImage(fig as CanvasImageSource, 0, 0);
  sh.setTransform(1, 0, 0, 1, 0, 0); sh.globalCompositeOperation = "source-in"; sh.fillStyle = "#3a1806"; sh.fillRect(0, 0, FM.W, FM.H); sh.globalCompositeOperation = "source-over";
  sm.setTransform(1, 0, 0, 1, 0, 0); sm.clearRect(0, 0, FM.W, FM.H); sm.fillStyle = "#ffffff";
  for (const [x0, x1, z0, z1] of PANES) { const q = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]].map(([px0, pz]) => project(id, fr, [px0, Math.max(3.2 - pz * SUN_BACK, c[1] + 0.12), 0]));
    sm.beginPath(); q.forEach((p, i) => (i ? sm.lineTo(p[0], p[1]) : sm.moveTo(p[0], p[1]))); sm.closePath(); sm.fill(); }
  { const TX0 = -1.447, TX1 = -0.583, TY0 = 0.823, TH = 0.488, L = TH * SUN_BACK, q = [[TX0, TY0 + 0.02], [TX1, TY0 + 0.02], [TX1, TY0 - L], [TX0, TY0 - L]].map(([px0, py]) => project(id, fr, [px0, py, 0]));
    sm.globalCompositeOperation = "destination-out"; sm.fillStyle = "#000"; sm.beginPath(); q.forEach((p, i) => (i ? sm.lineTo(p[0], p[1]) : sm.moveTo(p[0], p[1]))); sm.closePath(); sm.fill(); sm.globalCompositeOperation = "source-over"; }
  sh.globalCompositeOperation = "destination-in"; sh.drawImage(SM as CanvasImageSource, 0, 0); sh.globalCompositeOperation = "source-over";
  /* (no band test under the soles here, unlike step 1: a walking figure crosses the sun's strips, and a test that switches the shadow on and
     off in one frame would pop. The sun comes straight down the room (no sideways part), so a shadow always lies in the same strip as the feet
     that cast it, and never floats away from them) */
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); for (const [ox, oy] of [[0, 0], [3, 2], [-3, 2], [2, -3], [-2, -3]]) { g.globalAlpha = 0.5 / 5 * (ox || oy ? 1.05 : 0.8); g.drawImage(SH as CanvasImageSource, ox, oy); } g.restore(); };

/** extra drawing a piece adds to a figure's own layer (a held tool, the fingers in front of it): called with the figure's offscreen canvas set
 *  to his card's transform, before and after the rig draws him */
export type Extra = { back?: (h: G, pl: Placed, fr: number) => void; front?: (h: G, pl: Placed, fr: number) => void };

/** the figures of a shot over the plate, the farthest first: contact shadows, the figure (with a piece's extra drawing in his own layer), the
 *  cabin's light on his fill (the ink kept), his cast shadow where the sun falls. Nothing but the rig's own two hands is drawn for a hand */
export const paintFigures = (g: G, id: string, fr: number, whos: Who[], extras: Record<string, Extra> = {}) => {
  const order = whos.map((w) => ({ w, pl: placeOf(id, fr, w) })).sort((p, q) => q.pl.depth - p.pl.depth);
  for (const { w, pl } of order) {
    const f = pl.f;
    for (const ft of feetOf(id, fr, w, pl)) {      // contact shadows under each foot, smaller and fainter as it lifts
      const up = Math.min(ft.heel[2], ft.toe[2]), mid: [number, number] = [(ft.heel[0] + ft.toe[0]) / 2, (ft.heel[1] + ft.toe[1]) / 2];
      const c0 = project(id, fr, [mid[0], mid[1] + 0.02, 0]), ex = project(id, fr, [mid[0] + 0.16, mid[1] + 0.02, 0]), ey = project(id, fr, [mid[0], mid[1] + 0.12, 0]);
      const an = jointPx(f, "an" + ft.side), c = toScreen(pl, [an[0], footY(f.who) - 4]);
      const kl = 1 - 0.5 * Math.min(1, Math.max(0, up) / 0.04), L1 = Math.hypot(ex[0] - c0[0], ex[1] - c0[1]), L2 = Math.hypot(ey[0] - c0[0], ey[1] - c0[1]);
      const rx = Math.max(4, kl * Math.max(L1, L2)), ry = Math.max(2, Math.min(0.6 * rx, kl * Math.min(L1, L2))), al = up > 0.004 ? 0.75 : 0.8;
      g.save(); g.setTransform(1, 0, 0, ry / rx, c[0], c[1]); const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx); gr.addColorStop(0, `rgba(14,7,5,${al})`); gr.addColorStop(0.55, `rgba(14,7,5,${al * 0.6})`); gr.addColorStop(1, "rgba(14,7,5,0)");
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
    const A = (i: number) => Dd[i * 4 + 3] / 255, wf = (k: number) => Math.min(1, Math.max(0, (Math.abs(Dd[k] - 36) + Math.abs(Dd[k + 1] - 23) + Math.abs(Dd[k + 2] - 38) - 30) / 40)) * (Dd[k + 3] / 255);
    const out = new Float32Array(N * 3); let kx0 = Wd, kx1 = 0; if (w.key) for (let y = 0; y < FM.H; y += 8) for (let x = 0; x < Wd; x += 4) if (Dd[(y * Wd + x) * 4 + 3] > 128) { kx0 = Math.min(kx0, x); kx1 = Math.max(kx1, x); }
    for (let y = 0; y < FM.H; y++) for (let x = 0; x < Wd; x++) { const i = y * Wd + x, k = i * 4; if (Dd[k + 3] < 2) continue; const f0 = wf(k); if (f0 <= 0) { out[i * 3] = Dd[k]; out[i * 3 + 1] = Dd[k + 1]; out[i * 3 + 2] = Dd[k + 2]; continue; }
      let r = Dd[k] * 0.8 + 6, gg = Dd[k + 1] * 0.7, b = Dd[k + 2] * 0.66;
      if (w.key) { const q = w.key * Math.min(1, Math.max(0, (dx > 0 ? x - kx0 : kx1 - x) / Math.max(1, kx1 - kx0))); r = r * (1 + 0.42 * q) + 22 * q; gg = gg * (1 + 0.3 * q) + 12 * q; b = b * (1 + 0.08 * q); }
      const xr = Math.min(Wd - 1, Math.max(0, x + dx * rim)), yr = y - Math.round(rim * 0.7), outside = yr < 0 ? 0 : Math.max(1 - A(yr * Wd + xr), 1 - A(y * Wd + xr));
      if (outside > 0) { const q = outside; r = r * (1 - q) + Math.min(255, r * 1.18 + 52) * q; gg = gg * (1 - q) + Math.min(255, gg * 1.1 + 28) * q; b = b * (1 - q) + (b * 0.96 + 4) * q; }
      if (ru > 0) { const sk = Math.min(1, Math.max(0, (Dd[k] - Dd[k + 2] - 45) / 30)) * Math.min(1, Math.max(0, (Dd[k] - 150) / 40)), dd = Math.hypot(x - hc[0], (y - hc[1]) * 1.15) / hr;
        if (sk > 0 && dd < 1.0) { const mm = 0.72 * ru * sk * Math.min(1, (1.0 - dd) / 0.4); r = r * (1 - mm) + 214 * mm; gg = gg * (1 - mm) + 58 * mm; b = b * (1 - mm) + 52 * mm; } }      /* (the red of anger from the cheeks, cabin.ts) */
      out[i * 3] = Dd[k] * (1 - f0) + r * f0; out[i * 3 + 1] = Dd[k + 1] * (1 - f0) + gg * f0; out[i * 3 + 2] = Dd[k + 2] * (1 - f0) + b * f0; }
    for (let i = 0; i < N; i++) if (Dd[i * 4 + 3] >= 2) { Dd[i * 4] = out[i * 3]; Dd[i * 4 + 1] = out[i * 3 + 1]; Dd[i * 4 + 2] = out[i * 3 + 2]; }
    h.putImageData(img, 0, 0);
    if (w.sun) castShadow(g, id, fr, w, pl, o);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(o as CanvasImageSource, 0, 0); g.restore();
  } };

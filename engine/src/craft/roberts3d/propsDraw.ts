// Roberts' bedtime: the drinking things as drawn, shared by the film (figures.ts, a figure's front layer) and the sheet (PropSheet.tsx): the mug in
// a hand with its handle, its dark inside and a splash on its way up; the rum bottle; the mug's front wall over a neck poured into it. Skeleton
// units of the figure holding them (props.ts has the geometry, prop_check.mjs measures it).
import { Ink, hand as inkHand } from "../ink";
import { solve } from "../rig";
import { handFlip } from "../designs/common";
import { mugAt, MUG, teaAt, TEA } from "./props";
import { RUM, type P2 } from "./rum";

export const PEWTER = "#9ea4a8", PEWTER_IN = "#4a4e52", RUMC = "#c07a2a", GLASS = "#2f5a3a";
/** the mug in a hand: its body, the dark inside seen in its rim, the rim, a handle on the side away from his face, then his fingers over it */
export const drawMug = (k: Ink, sk: ReturnType<typeof solve>, side: "L" | "R", skin: string, at?: P2, splash = false) => {
  const m = mugAt(sk, side), dx = at ? at[0] - m.c[0] : 0, dy = at ? at[1] - m.c[1] : 0, sh = (P: P2[]) => P.map(([x, y]) => [x + dx, y + dy] as P2);
  const f = Math.sign(Math.sin(sk.faceYaw * Math.PI / 180) || 1), hx = m.c[0] + dx + f * (MUG.w / 2), cy = m.c[1] + dy;
  k.group([[[hx, cy - 24], [hx + f * 22, cy - 22], [hx + f * 26, cy + 4], [hx + f * 20, cy + 20], [hx, cy + 18], [hx, cy + 8], [hx + f * 12, cy + 8], [hx + f * 14, cy - 10], [hx, cy - 12]]], PEWTER);      // (the handle at the mug as drawn: already moved with it)
  k.group([sh(m.body)], PEWTER); k.group([sh(m.rim)], PEWTER_IN);
  if (splash) { const top = m.c[1] + dy - MUG.h / 2, cx = m.c[0] + dx, kk = new Ink(k.g, 4);      // (the rum slopping over the rim on its way up: a tongue over the back edge and three drops, its own thin ink)
    kk.group([[[cx - f * 26, top + 2], [cx - f * 22, top - 10], [cx - f * 12, top - 18], [cx + f * 2, top - 20], [cx + f * 14, top - 14], [cx + f * 22, top - 4], [cx + f * 24, top + 3]]], RUMC);
    for (const [ox, oy, r] of [[-f * 26, -34, 6], [-f * 6, -40, 5], [f * 14, -32, 4.5]] as [number, number, number][]) kk.group([Array.from({ length: 12 }, (_, i): P2 => [cx + ox + r * Math.cos((i / 12) * 2 * Math.PI), top + oy + r * 1.25 * Math.sin((i / 12) * 2 * Math.PI)])], RUMC); }
  const hf = handFlip(sk, side, "grip"); inkHand(k, hf.w, hf.d, sk.P.hand, "grip", skin, hf.flip, false, k.ol, "fingers");
  return { ...m, c: [m.c[0] + dx, m.c[1] + dy] as P2 }; };
export const SKIN = (L: unknown) => (L as { col: { skin: string } }).col.skin;
/** the rum bottle (the independent review, 28 Nov: a box and a stick read as a green knife): a rounded bottom, straight sides, a sloping
 *  shoulder over the last fifth of the body, the neck with a lip ring at its mouth, and a pale stripe of shine down the glass */
export const bottle = (k: Ink, p: { u: P2; n: P2; b0: P2; b1: P2 }) => { const u = p.u, nn: P2 = [-u[1], u[0]], at = (c: P2, along: number, w: number): P2 => [c[0] + u[0] * along + nn[0] * w, c[1] + u[1] * along + nn[1] * w];
  const BW = RUM.bodyW / 2, NW = RUM.neckW / 2, body = Math.hypot(p.b1[0] - p.b0[0], p.b1[1] - p.b0[1]), sh = body * 0.2, r = BW * 0.45;
  const side = (sg: number): P2[] => [at(p.b0, r, sg * BW), at(p.b0, r * 0.3, sg * BW * 0.9), at(p.b0, 0, sg * (BW - r))];
  const out: P2[] = [...side(1).reverse(), ...side(-1), at(p.b1, -sh, -BW), at(p.b1, -sh * 0.45, -BW * 0.82), at(p.b1, 0, -NW * 1.15), at(p.n, -7, -NW), at(p.n, -6, -NW * 1.35), at(p.n, 0, -NW * 1.35),
    at(p.n, 0, NW * 1.35), at(p.n, -6, NW * 1.35), at(p.n, -7, NW), at(p.b1, 0, NW * 1.15), at(p.b1, -sh * 0.45, BW * 0.82), at(p.b1, -sh, BW)];
  k.group([out], GLASS);
  const kk = new Ink(k.g, 0); kk.group([[at(p.b0, r + 6, BW * 0.38), at(p.b1, -sh - 4, BW * 0.38), at(p.b1, -sh - 4, BW * 0.12), at(p.b0, r + 6, BW * 0.12)]], "#6f9a76", 0); };      // (the shine, no ink)
/** the mug's front wall (from the rim's front half down), drawn over a neck poured into it */
export const mugFront = (k: Ink, m: { c: P2 }) => { const y = m.c[1] - MUG.h / 2;
  k.group([[...Array.from({ length: 11 }, (_, i): P2 => [m.c[0] - MUG.w / 2 + (MUG.w * i) / 10, y + (MUG.rd / 2) * Math.sin((i / 10) * Math.PI)]), [m.c[0] + MUG.w / 2, m.c[1] + MUG.h / 2], [m.c[0] - MUG.w / 2, m.c[1] + MUG.h / 2]]], PEWTER); };
/** a figure's gripping fingers over what he holds (the two-layer hand's front layer) */
export const fingers = (k: Ink, sk: ReturnType<typeof solve>, side: "L" | "R", skin: string) => { const hf = handFlip(sk, side, "grip"); inkHand(k, hf.w, hf.d, sk.P.hand, "grip", skin, hf.flip, false, k.ol, "fingers"); };
/** Roberts' teacup on its saucer (white porcelain with a red rim line), his fingers over the saucer's edge */
export const drawTea = (k: Ink, sk: ReturnType<typeof solve>, side: "L" | "R", skin: string) => { const t = teaAt(sk, side), f = Math.sign(Math.sin(sk.faceYaw * Math.PI / 180) || 1), c = t.cup, s = t.saucer;
  const ell = (cx: number, cy: number, rx: number, ry: number, n = 20) => Array.from({ length: n }, (_, i): P2 => [cx + rx * Math.cos((i / n) * 2 * Math.PI), cy + ry * Math.sin((i / n) * 2 * Math.PI)]);
  k.group([ell(s[0], s[1], TEA.sw / 2, TEA.sd / 2)], "#f2efe6");
  const hx = c[0] + f * TEA.w / 2; k.group([[[hx, c[1] - 8], [hx + f * 14, c[1] - 8], [hx + f * 16, c[1] + 4], [hx, c[1] + 8], [hx, c[1] + 2], [hx + f * 8, c[1] + 1], [hx + f * 8, c[1] - 3], [hx, c[1] - 3]]], "#f2efe6");
  k.group([[[c[0] - TEA.w / 2, c[1] - TEA.h / 2], [c[0] + TEA.w / 2, c[1] - TEA.h / 2], [c[0] + TEA.w * 0.36, c[1] + TEA.h / 2], [c[0] - TEA.w * 0.36, c[1] + TEA.h / 2]]], "#f2efe6");
  k.group([ell(c[0], c[1] - TEA.h / 2, TEA.w / 2, 6)], "#7a4a2a");      // (the tea seen in the rim)
  fingers(k, sk, side, skin); };
/** the puff of breath from his mouth toward a point (the lantern): three short curved strokes, fading, at frame-local progress u (0-1) */
export const drawPuff = (g: CanvasRenderingContext2D, from: P2, to: P2, u: number, px: number) => { if (u <= 0 || u >= 1) return; const d = [to[0] - from[0], to[1] - from[1]], L = Math.hypot(d[0], d[1]) || 1, e = [d[0] / L, d[1] / L], n = [-e[1], e[0]];
  g.save(); g.lineCap = "round"; g.strokeStyle = `rgba(235,240,255,${0.85 * Math.sin(Math.PI * u)})`; g.lineWidth = 5 * px;
  for (const [o, a, b] of [[-14, 0.15, 0.55], [0, 0.25, 0.75], [14, 0.2, 0.6]] as [number, number, number][]) { const a0 = Math.min(1, a + u * 0.35), b0 = Math.min(1, b + u * 0.35), p0 = [from[0] + d[0] * a0 + n[0] * o * px, from[1] + d[1] * a0 + n[1] * o * px], p1 = [from[0] + d[0] * b0 + n[0] * o * px, from[1] + d[1] * b0 + n[1] * o * px], m = [(p0[0] + p1[0]) / 2 + n[0] * 8 * px, (p0[1] + p1[1]) / 2 + n[1] * 8 * px];
    g.beginPath(); g.moveTo(p0[0], p0[1]); g.quadraticCurveTo(m[0], m[1], p1[0], p1[1]); g.stroke(); }
  g.restore(); };

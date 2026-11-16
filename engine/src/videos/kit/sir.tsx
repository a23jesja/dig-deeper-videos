// Sir Digsworth as a cut-out puppet made of the main sheet's own front-view drawing (pieces cut by
// scripts/sir_cut.py). With every angle at 0 the pieces lie exactly where they were drawn: the rest pose IS the sheet.
// Joints turn the pieces; nothing is redrawn. All angles in degrees, clockwise on screen, relative to the sheet pose.
import React from "react";
import { staticFile } from "remotion";
import data from "./sirf.json";
import side from "./sirs.json";
import { PARTS } from "./puppet";

type Piece = { x: number; y: number; w: number; h: number; z: number };
const PIECES = data.pieces as Record<string, Piece>;
const JT = data.joints as Record<string, number[]>;
export const SIR_W = data.w, SIR_H = data.h, SIR_GROUND = 829, SIR_CX = 165;

export type SirHand = "rest" | "open" | "pointing" | "fist" | "waving" | "thumb";
export type SirPose = {
  x: number; y: number; s: number;          // where his ground point (between the feet) is on screen, and px per sheet px
  flip?: boolean;                             // mirror the whole figure (never for a front view: the monocle would change eye)
  lean?: number; bob?: number;                // body turn about the hips (deg), lift (sheet px, up)
  head?: number;                              // head tilt about the neck
  shoR?: number; elbR?: number; wriR?: number; handR?: SirHand;   // the free arm (left in the picture)
  shoL?: number; elbL?: number; wriL?: number;                      // the cane arm (right in the picture)
  hipR?: number; kneeR?: number; hipL?: number; kneeL?: number;
  cap?: { dx: number; dy: number; rot: number };                    // the cap lifted off the head (sheet px, deg)
};
/** showcase gloves from the parts sheet: wrist (fractions of the picture), direction there (deg), `side` = drawn pointing sideways */
const HANDS: Record<Exclude<SirHand, "rest">, { ax: number; ay: number; dir: number; side?: boolean }> = {
  open: { ax: 0.42, ay: 0.93, dir: -90 }, pointing: { ax: 0.07, ay: 0.56, dir: -4, side: true }, fist: { ax: 0.4, ay: 0.93, dir: -80 },
  waving: { ax: 0.3, ay: 0.66, dir: -52 }, thumb: { ax: 0.1, ay: 0.7, dir: 0, side: true },
};
const HAND_SCALE = 0.62;   // parts-sheet gloves -> the size of the glove on the main sheet

type M = [number, number, number, number, number, number];
const mul = (a: M, b: M): M => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
const rot = (deg: number, p: number[]): M => { const t = (deg * Math.PI) / 180, c = Math.cos(t), s = Math.sin(t); return [c, s, -s, c, p[0] - c * p[0] + s * p[1], p[1] - s * p[0] - c * p[1]]; };
const tr = (x: number, y: number): M => [1, 0, 0, 1, x, y];
const ap = (m: M, p: number[]): [number, number] => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
const css = (m: M) => `matrix(${m.map((v) => v.toFixed(4)).join(" ")})`;

/** matrices of every piece and the screen boxes for the layout check */
export const solveSir = (p: SirPose) => {
  const f = p.flip ? -1 : 1;
  const root: M = mul([p.s * f, 0, 0, p.s, p.x, p.y], tr(-SIR_CX, -SIR_GROUND));
  const hipC = [SIR_CX, 548];
  const body = mul(mul(root, tr(0, -(p.bob ?? 0))), rot(p.lean ?? 0, hipC));
  const head = mul(body, rot(p.head ?? 0, JT.neck));
  const capM = p.cap ? mul(mul(head, tr(p.cap.dx, p.cap.dy)), rot(p.cap.rot, JT.cap)) : head;
  const aRu = mul(body, rot(p.shoR ?? 0, JT.shoR)), aRl = mul(aRu, rot(p.elbR ?? 0, JT.elbR)), hR = mul(aRl, rot(p.wriR ?? 0, JT.wriR));
  const aLu = mul(body, rot(p.shoL ?? 0, JT.shoL)), aLl = mul(aLu, rot(p.elbL ?? 0, JT.elbL)), hL = mul(aLl, rot(p.wriL ?? 0, JT.wriL));
  const lRu = mul(mul(root, tr(0, -(p.bob ?? 0))), rot(p.hipR ?? 0, JT.hipR)), lRl = mul(lRu, rot(p.kneeR ?? 0, JT.kneeR));
  const lLu = mul(mul(root, tr(0, -(p.bob ?? 0))), rot(p.hipL ?? 0, JT.hipL)), lLl = mul(lLu, rot(p.kneeL ?? 0, JT.kneeL));
  const m: Record<string, M> = { torso: body, head, head_bare: head, armR_edge: aRu, armL_edge: aLu, cap: capM, armR_upper: aRu, armR_lower: aRl, handR_rest: hR, armL_upper: aLu, armL_lower: aLl, handL_cane: hL, legR_upper: lRu, legR_lower: lRl, legL_upper: lLu, legL_lower: lLl };
  const pts: [number, number][] = [];
  for (const [n, pc] of Object.entries(PIECES)) for (const c of [[pc.x, pc.y], [pc.x + pc.w, pc.y], [pc.x, pc.y + pc.h], [pc.x + pc.w, pc.y + pc.h]]) pts.push(ap(m[n], c));
  const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
  const hc = ap(head, [data.head.cx, data.head.cy]), hr = data.head.r * p.s;
  return { m, hR, box: { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }, faceBox: { x: hc[0] - hr, y: hc[1] - hr, w: 2 * hr, h: 2 * hr } };
};

export const Sir: React.FC<{ p: SirPose }> = ({ p }) => {
  const g = solveSir(p), shape = p.handR ?? "rest";
  const order = Object.entries(PIECES).filter(([n]) => n !== (p.cap ? "head" : "head_bare")).sort((a, b) => a[1].z - b[1].z);
  // forearm direction on the sheet, for the showcase gloves
  const fore = (Math.atan2(JT.wriR[1] - JT.elbR[1], JT.wriR[0] - JT.elbR[0]) * 180) / Math.PI;
  const world = fore + (p.lean ?? 0) + (p.shoR ?? 0) + (p.elbR ?? 0) + (p.wriR ?? 0);
  const glove = () => {
    if (shape === "rest") return null;
    const h = HANDS[shape], im = PARTS[`sir/hand_${shape}`], up = h.side && Math.cos((world * Math.PI) / 180) < 0;
    return <g key="glove" transform={`${css(g.hR)} translate(${JT.wriR[0]} ${JT.wriR[1]}) rotate(${fore - (up ? -h.dir : h.dir)}) scale(${HAND_SCALE} ${up ? -HAND_SCALE : HAND_SCALE}) translate(${-h.ax * im.w} ${-h.ay * im.h})`}>
      <image href={staticFile(`kit/sir/hand_${shape}.png`)} width={im.w} height={im.h} /></g>;
  };
  // the outer edge of a bent elbow: a piece of outline round the joint (not on the sheet, which has no bent arm)
  const elbow = (n: "R" | "L", m: M, ang: number) => {
    if (Math.abs(ang) < 4) return null;
    const e = JT[`elb${n}`], w = JT[`wri${n}`], sh = JT[`sho${n}`], r = (data.half as Record<string, number[]>)[`arm${n}`][ang > 0 ? 1 : 0] - 2.2;
    // from the outer edge of the upper arm round to the outer edge of the turned forearm
    const sd = ang > 0 ? -Math.PI / 2 : Math.PI / 2, a0 = Math.atan2(e[1] - sh[1], e[0] - sh[0]) + sd, a1 = a0 + (ang * Math.PI) / 180;
    const pt = (a: number, q = r) => `${(e[0] + q * Math.cos(a)).toFixed(2)} ${(e[1] + q * Math.sin(a)).toFixed(2)}`;
    return <g key={`e${n}`} transform={css(m)}><path d={`M${e[0]} ${e[1]} L${pt(a0 - Math.sign(ang) * 0.06, r + 2)} A${r + 2} ${r + 2} 0 0 ${ang > 0 ? 1 : 0} ${pt(a1 + Math.sign(ang) * 0.06, r + 2)} Z`} fill={`rgb(${(data.tweed as number[]).join(",")})`} />
      <path d={`M${pt(a0)} A${r} ${r} 0 0 ${ang > 0 ? 1 : 0} ${pt(a1)}`} stroke="#191612" strokeWidth={5.2} strokeLinecap="round" fill="none" /></g>;
  };
  return (
    <g>
      <ellipse cx={p.x} cy={p.y + 2 * p.s} rx={150 * p.s} ry={17 * p.s} fill="rgba(60,40,20,0.25)" />
      {order.map(([n, pc]) => (n === "handR_rest" ? (shape === "rest" ? <image key={n} href={staticFile(`kit/sirf/${n}.png`)} x={pc.x} y={pc.y} width={pc.w} height={pc.h} transform={css(g.m[n])} /> : glove())
        : <React.Fragment key={n}><image href={staticFile(`kit/sirf/${n}.png`)} x={pc.x} y={pc.y} width={pc.w} height={pc.h} transform={css(g.m[n])} opacity={n.endsWith("_edge") ? Math.min(1, Math.max(0, (Math.abs((n === "armR_edge" ? p.shoR : p.shoL) ?? 0) - 3) / 10)) : 1} />
          {n === "armR_lower" && elbow("R", g.m.armR_upper, p.elbR ?? 0)}{n === "armL_lower" && elbow("L", g.m.armL_upper, p.elbL ?? 0)}</React.Fragment>))}
    </g>
  );
};

// ---------------------------------------------------------------------------------------------------------------
// Side view (faces screen right; `flip` turns him to face left). Pieces cut by scripts/sir_cut_side.py.
const SP = side.pieces as Record<string, Piece>, SJ = side.joints as Record<string, number[]>;
export const SIDE_W = side.w, SIDE_H = side.h, SIDE_GROUND = 822, SIDE_CX = 124;
export type SirSidePose = {
  x: number; y: number; s: number; flip?: boolean; lean?: number; bob?: number; head?: number;
  shoN?: number; elbN?: number; wriN?: number; handN?: SirHand;   // the near arm
  shoF?: number;                                                    // the far arm with the cane
  hipN?: number; kneeN?: number; hipF?: number; kneeF?: number;
};
export const solveSirSide = (p: SirSidePose) => {
  const f = p.flip ? -1 : 1, root: M = mul(mul([p.s * f, 0, 0, p.s, p.x, p.y], tr(-SIDE_CX, -SIDE_GROUND)), tr(0, -(p.bob ?? 0)));
  const body = mul(root, rot(p.lean ?? 0, SJ.hip)), head = mul(body, rot(p.head ?? 0, SJ.neck));
  const aU = mul(body, rot(p.shoN ?? 0, SJ.shoN)), aL = mul(aU, rot(p.elbN ?? 0, SJ.elbN)), hN = mul(aL, rot(p.wriN ?? 0, SJ.wriN));
  const lN = mul(root, rot(p.hipN ?? 0, SJ.hip)), lF = mul(root, rot(p.hipF ?? 0, SJ.hip));
  const m: Record<string, M> = { torso: body, head, armN_upper: aU, armN_lower: aL, handN_rest: hN, armF: mul(body, rot(p.shoF ?? 0, SJ.shoF)),
    legN_upper: lN, legN_lower: mul(lN, rot(p.kneeN ?? 0, SJ.knee)), legF_upper: lF, legF_lower: mul(lF, rot(p.kneeF ?? 0, SJ.knee)) };
  const pts: [number, number][] = [];
  for (const [n, pc] of Object.entries(SP)) for (const c of [[pc.x, pc.y], [pc.x + pc.w, pc.y], [pc.x, pc.y + pc.h], [pc.x + pc.w, pc.y + pc.h]]) pts.push(ap(m[n], c));
  const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]), hc = ap(head, [side.head.cx, side.head.cy]), hr = side.head.r * p.s;
  return { m, hN, box: { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }, faceBox: { x: hc[0] - hr, y: hc[1] - hr, w: 2 * hr, h: 2 * hr } };
};
export const SirSide: React.FC<{ p: SirSidePose }> = ({ p }) => {
  const g = solveSirSide(p), shape = p.handN ?? "rest";
  const sameLegs = (p.hipF ?? 0) === (p.hipN ?? 0) && (p.kneeF ?? 0) === (p.kneeN ?? 0);
  const order = Object.entries(SP).filter(([n]) => !(sameLegs && n.startsWith("legF"))).sort((a, b) => a[1].z - b[1].z);
  const fore = (Math.atan2(SJ.wriN[1] - SJ.elbN[1], SJ.wriN[0] - SJ.elbN[0]) * 180) / Math.PI;
  const world = fore + (p.lean ?? 0) + (p.shoN ?? 0) + (p.elbN ?? 0) + (p.wriN ?? 0);
  const glove = () => {
    if (shape === "rest") return null;
    const h = HANDS[shape], im = PARTS[`sir/hand_${shape}`], up = h.side && Math.cos((world * Math.PI) / 180) < 0;
    return <g key="glove" transform={`${css(g.hN)} translate(${SJ.wriN[0]} ${SJ.wriN[1]}) rotate(${fore - (up ? -h.dir : h.dir)}) scale(${HAND_SCALE} ${up ? -HAND_SCALE : HAND_SCALE}) translate(${-h.ax * im.w} ${-h.ay * im.h})`}>
      <image href={staticFile(`kit/sir/hand_${shape}.png`)} width={im.w} height={im.h} /></g>;
  };
  const ang = p.elbN ?? 0, e = SJ.elbN, w = SJ.wriN, sh = SJ.shoN, r = (side.half as Record<string, number[]>).armN[ang > 0 ? 1 : 0] - 2.2;
  const sd = ang > 0 ? -Math.PI / 2 : Math.PI / 2, a0 = Math.atan2(e[1] - sh[1], e[0] - sh[0]) + sd, a1 = a0 + (ang * Math.PI) / 180;
  const pt = (a: number, q = r) => `${(e[0] + q * Math.cos(a)).toFixed(2)} ${(e[1] + q * Math.sin(a)).toFixed(2)}`;
  return (
    <g>
      <ellipse cx={p.x + 20 * p.s * (p.flip ? -1 : 1)} cy={p.y + 2 * p.s} rx={130 * p.s} ry={16 * p.s} fill="rgba(60,40,20,0.25)" />
      {order.map(([n, pc]) => (n === "handN_rest" && shape !== "rest" ? glove() : <React.Fragment key={n}>
        <image href={staticFile(`kit/sirs/${n}.png`)} x={pc.x} y={pc.y} width={pc.w} height={pc.h} transform={css(g.m[n])} />
        {n === "armN_lower" && Math.abs(ang) >= 4 && <g transform={css(g.m.armN_upper)}><path d={`M${e[0]} ${e[1]} L${pt(a0 - Math.sign(ang) * 0.06, r + 2)} A${r + 2} ${r + 2} 0 0 ${ang > 0 ? 1 : 0} ${pt(a1 + Math.sign(ang) * 0.06, r + 2)} Z`} fill={`rgb(${(side.tweed as number[]).join(",")})`} />
          <path d={`M${pt(a0)} A${r} ${r} 0 0 ${ang > 0 ? 1 : 0} ${pt(a1)}`} stroke="#191612" strokeWidth={5.2} strokeLinecap="round" fill="none" /></g>}
      </React.Fragment>))}
    </g>
  );
};

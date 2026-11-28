// Roberts' bedtime: the drinking things (the reviewer's decision 28 Nov: no vessel ever touches a mouth; on Knopp's face the mouth's corner sits
// between the nose and the eye, and a bottle reaching it crossed one of them). The mug held up beside the beard at the chin's height in the hook
// (shot 1); the rum poured with the bottle's neck down inside a held mug, hidden behind its front rim (shot 8); the mugs dipped into the open
// barrel, hidden by its front wall (shot 14). Skeleton units (the card's own), shared by the sheets, the film and the checks.
import { solve, POSES, type Pose } from "../rig";
import { D } from "../clips/clipKit";
import { beardOutline } from "../wardrobe/kit";
import { headOutline, mouthMid, RUM, type P2 } from "./rum";

type Sk = ReturnType<typeof solve>;
const R = Math.PI / 180;
const inPoly = (p: P2, P: P2[]) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) if ((P[i][1] > p[1]) !== (P[j][1] > p[1]) && p[0] < ((P[j][0] - P[i][0]) * (p[1] - P[i][1])) / (P[j][1] - P[i][1]) + P[i][0]) c = !c; return c; };
const dSeg = (p: P2, a: P2, b: P2) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy || 1, u = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L)); return Math.hypot(p[0] - a[0] - u * dx, p[1] - a[1] - u * dy); };
/** the least distance from any of the points to a polygon (negative when one is inside) */
export const gapTo = (pts: P2[], P: P2[]) => Math.min(...pts.map((q) => (inPoly(q, P) ? -1 : Math.min(...P.map((a, i) => dSeg(q, a, P[(i + 1) % P.length]))))));

/** a mug (pewter): its body w x h, the rim an ellipse of depth rd, a handle on the side away from the drinker's face */
export const MUG = { w: 62, h: 74, rd: 16 };
/** the mug in a hand: its middle a little up from the grip (the fingers round its body), upright; outline points for the checks */
export const mugAt = (sk: Sk, side: "L" | "R", lift = 0): { c: P2; body: P2[]; rim: P2[] } => {
  const W = sk.j[`wr${side}`] as unknown as P2, T = sk.j[`tip${side}`] as unknown as P2, g: P2 = [W[0] + 0.45 * (T[0] - W[0]), W[1] + 0.45 * (T[1] - W[1])], c: P2 = [g[0], g[1] - 6 - lift];
  const x0 = c[0] - MUG.w / 2, x1 = c[0] + MUG.w / 2, y0 = c[1] - MUG.h / 2, y1 = c[1] + MUG.h / 2;
  const rim = Array.from({ length: 20 }, (_, i): P2 => [c[0] + (MUG.w / 2) * Math.cos((i / 20) * 2 * Math.PI), y0 + (MUG.rd / 2) * Math.sin((i / 20) * 2 * Math.PI)]);
  return { c, body: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], rim }; };
/** the face's parts the mug must keep clear of (skeleton units): the beard's outline and the head's lower face as eyes, nose and mouth sit in it
 *  (the mouth's middle with its size; the check measures each in picture px) */
export const faceGuard = (sk: Sk) => ({ beard: beardOutline(sk), mouth: mouthMid(sk, 0.7), head: headOutline(sk) });
/** the hook's pose: the arm on his face's side raised so the mug stands beside the beard at the chin's height, clear of the beard by `gap`
 *  skeleton units (the check wants 20 px in the picture), within rule 16's bend; found by search; u (0-1) eases it up from his chest */
export const hookMugPose = (heading: number, gap = 24, nod = -6): Pose => {
  const base: Pose = { ...POSES.stand, head: [Math.sign(heading || 1) * 45 - heading, nod, 0] } as Pose;
  const sk0 = solve(D.props("sir"), base, heading), f = Math.sign(Math.sin(sk0.faceYaw * R) || 1), nk = sk0.j.neck as unknown as P2;
  const side: "L" | "R" = Math.sign((sk0.j.shR as unknown as P2)[0] - nk[0]) === f ? "R" : "L", key = side === "R" ? "armR" : "armL";
  const beard0 = beardOutline(sk0), chinY = Math.max(...beard0.map((q) => q[1])) - 20, edgeX = f > 0 ? Math.max(...beard0.map((q) => q[0])) : Math.min(...beard0.map((q) => q[0]));
  const want: P2 = [edgeX + f * (MUG.w / 2 + gap + 6), chinY];
  let best: { arm: [[number, number], [number, number]]; cost: number } | null = null;
  for (let s1 = 0; s1 <= 170; s1 += 10) for (let o1 = -20; o1 <= 80; o1 += 10) for (let s2 = 0; s2 <= 150; s2 += 10) {
    const arm: [[number, number], [number, number]] = [[s1, o1], [s2, 0]], sk = solve(D.props("sir"), { ...base, [key]: arm } as Pose, heading);
    const S = sk.j[`sh${side}`] as unknown as P2, E = sk.j[`el${side}`] as unknown as P2, Wr = sk.j[`wr${side}`] as unknown as P2;
    const u1 = [S[0] - E[0], S[1] - E[1]], u2 = [Wr[0] - E[0], Wr[1] - E[1]], bend = 180 - (Math.acos(Math.max(-1, Math.min(1, (u1[0] * u2[0] + u1[1] * u2[1]) / ((Math.hypot(u1[0], u1[1]) || 1) * (Math.hypot(u2[0], u2[1]) || 1))))) * 180) / Math.PI;
    if (bend > 140) continue;
    const m = mugAt(sk, side), g = gapTo(m.body, beardOutline(sk)), cost = Math.hypot(m.c[0] - want[0], m.c[1] - want[1]) + (g < gap ? 40 * (gap - g) : 0);
    if (!best || cost < best.cost) best = { arm, cost }; }
  return { ...base, [key]: best!.arm, [`hand${side}`]: 0 } as Pose; };
export const mugSide = (sk: Sk): "L" | "R" => { const f = Math.sign(Math.sin(sk.faceYaw * R) || 1), nk = sk.j.neck as unknown as P2; return Math.sign((sk.j.shR as unknown as P2)[0] - nk[0]) === f ? "R" : "L"; };
void RUM;

// ---- shot 8, the pour: the young pirate holds his mug out at his chest; the rum pirate's bottle comes down into it neck first, its neck's tip
// below the mug's rim, hidden by the mug's front (drawn in two layers: the body and its dark inside, the bottle, then the front wall over it) ----
/** a held-out mug's rim line (y) and opening (x from-to) in skeleton units of its holder */
export const mugOpening = (m: { c: P2 }) => ({ y: m.c[1] - MUG.h / 2, x0: m.c[0] - MUG.w / 2 + 6, x1: m.c[0] + MUG.w / 2 - 6 });
/** the young pirate's held-out pose: his near arm forward at his chest (the mug in front of him, clear of his face) */
export const holdOutPose = (heading: number, arm: [[number, number], [number, number]] = [[55, 10], [70, 0]]): Pose => { const base: Pose = { ...POSES.stand, head: [Math.sign(heading || 1) * 45 - heading, 6, 0] } as Pose;
  const sk0 = solve(D.props("sir"), base, heading), f = Math.sign(Math.sin(sk0.faceYaw * R) || 1), nk = sk0.j.neck as unknown as P2, side: "L" | "R" = Math.sign((sk0.j.shR as unknown as P2)[0] - nk[0]) === f ? "R" : "L";
  return { ...base, [side === "R" ? "armR" : "armL"]: arm } as Pose; };
/** the bottle pouring down into a mug at world-free skeleton point `into` (the opening's middle, in the pourer's own units): the bottle's way u
 *  down toward it at `tilt` degrees from straight down, its neck's tip `depth` under the rim line; the pourer's hand on its body */
export const pourInto = (into: P2, rimY: number, tilt = 35, depth = 14, side = 1, back = POUR_BACK) => { const a = tilt * R, u: P2 = [side * Math.sin(a), Math.cos(a)], n: P2 = [into[0], rimY + depth];
  const L = RUM.body * (1 - back) + RUM.neck, g: P2 = [n[0] - u[0] * L, n[1] - u[1] * L], b0: P2 = [g[0] - u[0] * RUM.body * back, g[1] - u[1] * RUM.body * back], b1: P2 = [g[0] + u[0] * RUM.body * (1 - back), g[1] + u[1] * RUM.body * (1 - back)];
  return { u, n, g, b0, b1 }; };

// ---- shot 14, the dip: the barrel's lid knocked in, a mug dipped into it and lifted out dripping; while it is in the barrel the barrel's front
// wall hides its lower part (the barrel drawn in two layers: its back and dark inside, then the mug, then its front wall) ----
export const BARREL = { w: 150, h: 190, rd: 34 };
/** the barrel standing at floor point x (skeleton units of the figure beside it), its rim line and opening */
export const barrelAt = (x: number, floorY: number) => ({ x, floorY, rimY: floorY - BARREL.h, x0: x - BARREL.w / 2 + 10, x1: x + BARREL.w / 2 - 10 });

// ---- shot 8 as a pair (sheet v2): the rum pirate stands on the young pirate's face side, facing him, the bottle in his near hand coming down
// from beyond the mug (never from the young pirate's own side, where it crossed his face on sheet v1) ----
const armBend = (sk: Sk, side: "L" | "R") => { const S = sk.j[`sh${side}`] as unknown as P2, E = sk.j[`el${side}`] as unknown as P2, Wr = sk.j[`wr${side}`] as unknown as P2;
  const u1 = [S[0] - E[0], S[1] - E[1]], u2 = [Wr[0] - E[0], Wr[1] - E[1]]; return 180 - (Math.acos(Math.max(-1, Math.min(1, (u1[0] * u2[0] + u1[1] * u2[1]) / ((Math.hypot(u1[0], u1[1]) || 1) * (Math.hypot(u2[0], u2[1]) || 1))))) * 180) / Math.PI; };
export const gripOf = (sk: Sk, side: "L" | "R"): P2 => { const W = sk.j[`wr${side}`] as unknown as P2, T = sk.j[`tip${side}`] as unknown as P2; return [W[0] + 0.45 * (T[0] - W[0]), W[1] + 0.45 * (T[1] - W[1])]; };
/** an arm reaching its grip to `want` (the figure's own units) within rule 16's bend, either arm; the residual says how near it got */
export const reachPose = (heading: number, want: P2, head: [number, number, number], prefer?: "L" | "R", opt: { clearFace?: number; elbowDown?: boolean } = {}) => {
  const base: Pose = { ...POSES.stand, head } as Pose; let best: { pose: Pose; side: "L" | "R"; cost: number } | null = null;
  for (const side of (prefer ? [prefer] : ["L", "R"]) as ("L" | "R")[]) { const key = side === "R" ? "armR" : "armL";
    for (let s1 = 0; s1 <= 170; s1 += 5) for (let o1 = -20; o1 <= 80; o1 += 10) for (let s2 = 0; s2 <= 150; s2 += 5) {
      const pose = { ...base, [key]: [[s1, o1], [s2, 0]] } as Pose, sk = solve(D.props("sir"), pose, heading); if (armBend(sk, side) > 140) continue;
      const g = gripOf(sk, side); let cost = Math.hypot(g[0] - want[0], g[1] - want[1]);
      // (clearFace: the elbow, the wrist, the hand and the forearm's middle never over his own head or beard (sheet v1 had the pourer's arm across his beard);
      //  elbowDown: the elbow under the shoulder, so a lowering arm never bunches its sleeve up into the chin)
      if (opt.clearFace) { const E = sk.j[`el${side}`] as unknown as P2, W = sk.j[`wr${side}`] as unknown as P2, T = sk.j[`tip${side}`] as unknown as P2, pts: P2[] = [E, W, T, g, [(E[0] + W[0]) / 2, (E[1] + W[1]) / 2]];
        const gap = Math.min(gapTo(pts, headOutline(sk)), gapTo(pts, beardOutline(sk))); const cf = opt.clearFace; if (gap < cf) cost += 400 + 10 * (cf - gap); }      // (the pourer 45: the hand's own half-size and 20 clear)
      if (opt.elbowDown) { const E = sk.j[`el${side}`] as unknown as P2, S = sk.j[`sh${side}`] as unknown as P2; if (E[1] < S[1] + 20) cost += 200 + (S[1] + 20 - E[1]) * 5; }
      if (!best || cost < best.cost) best = { pose: { ...pose, [`hand${side}`]: 0 } as Pose, side, cost }; } }
  return best!; };
/** the pour as a pair: the young pirate (heading yaw, scale sY px per unit) holds his mug out; the rum pirate (scale sR) stands dx px away on
 *  the young one's face side, his heading turned back to face him; the bottle from his grip down into the mug, neck tip `depth` under its rim.
 *  The distance is searched so his grip lands on the bottle's (residual under 4 units). Points in the young pirate's units unless named R. */
export const pourPair = (yaw: number, sY: number, sR: number, tilt = 35, depth = 14, fault = false, arm: [[number, number], [number, number]] = [[55, 10], [70, 0]]) => {
  const young = solve(D.props("sir"), holdOutPose(yaw, arm), yaw), side = mugSide(young), m = mugAt(young, side), op = mugOpening(m), f = Math.sign(Math.sin(young.faceYaw * R) || 1);
  const into: P2 = fault ? [op.x1 + 6, op.y + 26] : [(op.x0 + op.x1) / 2 - f * 14, op.y], p = pourInto(into, op.y, tilt, fault ? 0 : depth, -f);      // (the tip toward the opening's near side: a flat neck then crosses the rim line inside the opening, not through the wall)      // (the fault: the neck's tip on the mug's side wall, under its rim, drawn over it: through the wall)
  const rumHeading = -Math.sign(yaw || 1) * 15, nod: [number, number, number] = [Math.sign(rumHeading || 1) * 45 - rumHeading, 10, 0], rumArm = mugSide(solve(D.props("sir"), POSES.stand as Pose, rumHeading));      // (his arm on his face's side, toward the young pirate: drawn in front of his body, never a hand poking out from behind his beard)
  let best: { dx: number; r: ReturnType<typeof reachPose>; score: number } | null = null;
  for (let dx = Math.round(330 * sY); dx <= 760; dx += 10) { /* (from 330 young units: the two heads about 50 px apart, never touching) */ const want: P2 = [(p.g[0] * sY - f * dx) / sR, (p.g[1] * sY) / sR], r = reachPose(rumHeading, want, nod, rumArm, { clearFace: 45 });
    // (among the distances he reaches, the one keeping the bottle's bottom, his grip and his hand farthest from his own beard and face)
    const sk = solve(D.props("sir"), r.pose, rumHeading), toR = (q: P2): P2 => [(q[0] * sY - f * dx) / sR, (q[1] * sY) / sR];
    const pts: P2[] = [toR(p.b0), toR([(p.b0[0] + p.g[0]) / 2, (p.b0[1] + p.g[1]) / 2]), toR(p.g), sk.j[`wr${r.side}`] as unknown as P2, sk.j[`tip${r.side}`] as unknown as P2];
    const clear = Math.min(gapTo(pts, beardOutline(sk)), gapTo(pts, headOutline(sk))), score = (r.cost < 4 ? 0 : 1000 + r.cost) - Math.min(clear, 80);
    if (!best || score < best.score) best = { dx, r, score }; }
  const rum = solve(D.props("sir"), best!.r.pose, rumHeading);
  return { arm, young, side, m, op, p, f, rum, rumSide: best!.r.side, rumPose: best!.r.pose, rumHeading, dx: f * best!.dx, residual: best!.r.cost }; };

// ---- shot 14 (sheet v2): Knopp's arms are short (shoulder at half his height), so the dipping barrel stands waist-high to him (a keg, its rim
// at his hips); the mug is lowered into it until its lower half is under the rim, then the barrel's front wall hides that half ----
export const KEG = { w: 150, h: 175, rd: 34 };      // (rim just over his hips: the most his arm reaches down to, shoulder to grip 137 units)
/** the dip: the young pirate (heading yaw) lowers his mug into the keg standing on the floor on his face side; fault: the mug pushed out
 *  through the keg's side wall (its middle at the wall's edge, under the rim) */
export const dipPose = (yaw: number, fault = false) => {
  const sk0 = solve(D.props("sir"), POSES.stand as Pose, yaw), f = Math.sign(Math.sin(sk0.faceYaw * R) || 1), kx = f * 135, rimY = -KEG.h;
  const mugC: P2 = [kx - f * 14, rimY + 4], want: P2 = [mugC[0], mugC[1] + 6];
  const r = reachPose(yaw, want, [Math.sign(yaw || 1) * 45 - yaw, 18, 0], undefined, { clearFace: 20, elbowDown: true }), sk = solve(D.props("sir"), r.pose, yaw), m = mugAt(sk, r.side);
  const kx2 = fault ? m.c[0] + f * (KEG.w / 2 - 12) : kx;      // (the fault: the keg moved out so its wall runs through the lowered mug)
  return { sk, side: r.side, m, keg: { x: kx2, rimY, floorY: 0, x0: kx2 - KEG.w / 2 + 12, x1: kx2 + KEG.w / 2 - 12 }, f, residual: r.cost }; };
/** the young pirate's arm holding his mug out for the pour: low enough that the bottle's bottom stays 37 px or more from the pourer's beard (sheet v3) */
/** where the pourer's hand holds the bottle: this share of its body behind the grip (a pour is held near the bottom, so the rest shows toward the mug) */
export const POUR_BACK = 0.12;
export const POUR_ARM: [[number, number], [number, number]] = [[45, 10], [30, 0]];

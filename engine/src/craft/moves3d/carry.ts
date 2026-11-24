// 3D step 2, the movement sheet, piece 2: carrying (the two-shot). The captain and the cabin boy carry the treasure chest (the cabin's own 3D
// chest, Poly Haven CC0, at 0.55 of its size) across the cabin, facing each other: the captain backs up (facing right, going left), the boy
// follows (facing left). Each holds his end's handle with both hands, arms long and nearly straight, the bodies leaning back against the
// weight, knees bent, faces straining; half way they heave it up a little.
// The chest's way is made from theirs (between their hands, bobbing with their steps) and written to Blender (props/S2.json, by
// scripts/moves_props.mjs), which moves the chest on the plate; their arms are then solved onto its handles every frame (two links in the
// picture's plane: the walk is in profile). Knopp's short arms (0.52 m on the captain) do not reach a handle behind his back or below his
// belly without the chest going into his coat, so they face each other and hold it at chest height.
// Backing up is the rig's own forward walk played backward in time: the toe lands first and the heel rolls down after, as people walk
// backward. The walks are the rig's own (motion.ts, unchanged).
import { ease } from "../stage/acting";
import { figure, scaleOf, heightOf, FM, D } from "../clips/clipKit";
import { solve, type Pose } from "../rig";
import type { Mover } from "../motion";
import { PLANT } from "./core";

type Seg2 = [number, number];
const R = Math.PI / 180;
const smooth = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
export const CARRY = { tau: 0.62, stepCap: 0.42, piece: 3.0, w0: 0.9, chestScale: 0.55, lean: -7, py: -0.07, sep: 1.2, y: 0.45, x0: 0.15, gripUp: 0.0 };
/** the chest at CARRY.chestScale (Blender's model, measured): half its length to the middle of an end handle, the handle's height over its
 *  bottom, half its depth, its height */
export const CHEST = { halfLen: 0.468 * CARRY.chestScale, handleZ: 0.2625 * CARRY.chestScale, halfDepth: 0.26 * CARRY.chestScale, height: 0.617 * CARRY.chestScale };

/** world metres per unit of the rig's skeleton, for a figure h metres tall (the card's scale and the world's) */
const wPerSk = (h: number) => (scaleOf("sir") / FM.PPM) * (h / heightOf("sir"));

/** a carrier: his mover (a forward walk long enough for the piece, sampled from w0 on; backward = sampled from the far end back), the piece's
 *  mover in his cast (a proxy with the time turned round when he backs up), and his pelvis's ground point along the way (world metres) */
const carrier = (name: "captain" | "boy", h: number, heading: number, backward: boolean, step: number) => {
  const m0 = figure("sir", 0, heading); m0.stand(0.3); m0.walk(5.0 * step / 0.42, { step, tau: CARRY.tau, keep: true }); m0.stand(4);
  const mt = (t: number) => (backward ? CARRY.w0 + CARRY.piece - t : CARRY.w0 + t);
  const m = new Proxy(m0, { get: (o, p) => (p === "sample" ? (t: number) => o.sample(mt(t)) : p === "landedAt" ? (s: "L" | "R", t: number) => o.landedAt(s, mt(t)) : (o as unknown as Record<string | symbol, unknown>)[p as string]) }) as Mover;
  const k = h / heightOf("sir"), LL = (m0 as unknown as { LL: number }).LL;
  const pelU = (t: number) => m.sample(t).x * LL * k;      // (piece time t; the card's +x is the world's +x)
  return { name, h, heading, m, m0, mt, k, pelU };
};

/** the arm in the picture's plane (in profile): the upper arm's and forearm's swings that put the grip (the forearm's line carried on through
 *  0.45 of the hand, as clipKit's reach "mid") on T, in skeleton units from his ground point; the elbow bent the way an elbow bends */
const armTo = (sk: ReturnType<typeof solve>, side: "L" | "R", T: [number, number]): { arm: [Seg2, Seg2]; miss: number } => {
  const P = sk.P, S = sk.j[`sh${side}`] as unknown as number[], a = P.upper, b = P.fore + 0.45 * P.hand, sn = Math.sign(sk.sin) || 1;
  let dx = T[0] - S[0], dy = T[1] - S[1]; const d0 = Math.hypot(dx, dy), lim = (a + b) * 0.999, d = Math.min(d0, lim);
  if (d0 > lim) { dx *= lim / d0; dy *= lim / d0; }
  const base = Math.atan2(dx * sn, dy), A = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
  const sols = [1, -1].map((sg) => { const s1 = base - sg * A, ex = S[0] + Math.sin(s1) * sn * a, ey = S[1] + Math.cos(s1) * a, s2 = Math.atan2((S[0] + dx - ex) * sn, S[1] + dy - ey); return [s1 / R, s2 / R]; });
  const [s1, s2] = sols.find(([u, v]) => v - u >= -0.5) ?? sols[0];
  return { arm: [[s1, 0], [s2, 0]], miss: Math.max(0, d0 - lim) };
};

export const carryScene = () => {
  const cap = carrier("captain", 1.75, 90, true, CARRY.stepCap), boy = carrier("boy", 1.5, -90, false, CARRY.stepCap * 1.75 / 1.5);      // (the boy's steps longer for his shorter legs: the same pace in the world)
  // where each stands at the piece's start: the captain's pelvis at x0, the boy's sep behind him along +x
  const atC = CARRY.x0 - cap.pelU(0), atB = CARRY.x0 + CARRY.sep - boy.pelU(0);
  const pelX = { captain: (t: number) => atC + cap.pelU(t), boy: (t: number) => atB + boy.pelU(t) };
  /** the chest at piece time t: its centre (world) between them, bobbing with the average of their steps, heaved 3 cm from 1.45 s */
  const chestAt = (t: number) => {
    const mid = (pelX.captain(t) + pelX.boy(t)) / 2 - 0.005, bob = ((cap.m.sample(t).pose.py ?? 0) * 0.414 + (boy.m.sample(t).pose.py ?? 0) * 0.355) / 2;
    const heave = 0.03 * smooth((t - 1.45) / 0.35) * (1 - smooth((t - 2.3) / 0.5));
    return { x: mid, y: CARRY.y, z: 0.405 + bob * 0.6 + heave };
  };
  /** the grip on each end's handle (world): the captain's at the chest's left end, the boy's at its right */
  const grip = (who: "captain" | "boy", t: number): [number, number, number] => { const c = chestAt(t), off = PLANT.toolOff && who === "boy" ? 0.03 : 0;
    return [c.x + (who === "captain" ? -CHEST.halfLen : CHEST.halfLen) + off, c.y, c.z + CHEST.handleZ + CARRY.gripUp]; };
  const hook = (who: "captain" | "boy", h: number) => (t: number, p: Pose, heading: number): Pose => {
    const q = { ...p, twist: 0 } as Pose, g = grip(who, t), u = wPerSk(h), T: [number, number] = [(g[0] - pelX[who](t)) / u, -g[2] / u];
    const sk = solve(D_PROPS(), q, heading);
    // (both hands on the one handle; the far one 1.5 cm higher on it, so the two fists do not lie exactly one on the other)
    const near = sk.near, far = sk.far, An = armTo(sk, near, T), Af = armTo(sk, far, [T[0], T[1] - 0.015 / u]);
    MISS[who] = Math.max(An.miss, Af.miss) * u;
    return { ...q, [`arm${near}`]: An.arm, [`arm${far}`]: Af.arm, handL: 0, handR: 0 } as Pose; };
  // faces: the strain. The captain, backing up: teeth clenched, brows down, eyes narrowed on the boy; at the heave (1.5 s) his eyes squeeze
  // shut, then open again. The boy: eyes wide, teeth gritted; at the heave his eyes squeeze shut too.
  // (the heads in the design's three-quarter drawing all through (|sin| of the face's turn 0.45-0.85): the captain faces right, turned 40
  //  toward the lens; the boy faces left, the same)
  ease(cap.m0, -99, { lean: CARRY.lean, py: CARRY.py, head: [-40, -4, -3] }, 0.01, { face: { pupil: 1, gaze: [0.6, 0], brow: -0.7, smile: -0.5, teeth: 1, mouth: 0.3, lid: 0.25 } });
  ease(boy.m0, -99, { lean: CARRY.lean + 1, py: CARRY.py, head: [40, -4, 3] }, 0.01, { face: { pupil: 1, gaze: [-0.6, -0.15], brow: -0.5, sad: 0.6, smile: -0.8, teeth: 1, mouth: 0.32, lid: 0.2 } });      // (effort: brows knit up in the middle, eyes narrowed, teeth gritted; brows up with wide eyes read as bored, the first full-size still)
  // (the eases at the movers' own times: the captain's runs backward, so his face changes are laid at mt of the piece times, latest first)
  // (the captain's: squeezed from piece time 1.1-1.5 to 1.8-2.25; in his mover's time (2.4 down to 1.65) the squeeze is laid at mt(2.25) and the
  //  open face again at mt(1.5), each easing in forward over its length, which the piece plays backward)
  ease(cap.m0, cap.mt(2.25), { lean: CARRY.lean - 3, py: CARRY.py - 0.02, head: [-36, -8, -6] }, 0.45, { face: { pupil: 1, gaze: [0.6, 0], brow: -1, smile: -0.7, teeth: 1, mouth: 0.32, squeeze: 1 } });
  ease(cap.m0, cap.mt(1.5), { lean: CARRY.lean, py: CARRY.py, head: [-40, -4, -3] }, 0.4, { face: { pupil: 1, gaze: [0.6, 0], brow: -0.7, smile: -0.5, teeth: 1, mouth: 0.3, lid: 0.25, squeeze: 0 } });
  ease(boy.m0, boy.mt(1.5), { lean: CARRY.lean - 2, py: CARRY.py - 0.02, head: [36, -8, 6] }, 0.4, { face: { pupil: 1, gaze: [-0.6, -0.15], brow: -0.7, sad: 0.6, smile: -0.9, teeth: 1, mouth: 0.32, squeeze: 1 } });
  ease(boy.m0, boy.mt(2.3), { lean: CARRY.lean + 1, py: CARRY.py, head: [40, -4, 3] }, 0.45, { face: { pupil: 1, gaze: [-0.6, -0.15], brow: -0.5, sad: 0.6, smile: -0.8, teeth: 1, mouth: 0.32, lid: 0.2, squeeze: 0 } });
  return { cap, boy, pelX, chestAt, grip, hook, atC, atB };
};
/** how far each carrier's grip falls short of its handle (metres), the last frame solved: the check reads it */
export const MISS: Record<string, number> = { captain: 0, boy: 0 };
const D_PROPS = () => D.props("sir");

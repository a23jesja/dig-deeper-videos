// Four-legged animals in the same language as the cast (cast.ts): card pieces that shadow each other, brass pins at the joints, the same
// paper eyes, and a head that turns because its parts sit at angles round it. A Beast is a set of sizes and colours on one four-legged
// skeleton, so a dog, a pig, a bear or a horse is a new set of numbers, not a new drawing. The skeleton is solved in 3D and turned by
// the view angle like the human one (0 = facing the lens, 90 = facing screen-right, 180 = from behind).
import { Ink, P2, R, ellPts, seg, mid, shade, shift, add, sub, unit } from "./ink";
import { LINE, BRASS } from "./cast";

export type Beast = {
  id: string;
  /** hip to shoulder, upper and lower leg, half-height of the body at the shoulders and at the hips, half-width of the body, length of the neck */
  len: number; legU: number; legL: number; bodyH: number; bodyHr: number; bodyW: number; neck: number;
  /** the head: half-width, half-length of the skull, height; then the length of the snout */
  head: { a: number; b: number; H: number }; snout: number;
  ear: "flop" | "prick" | "round"; tail: number; tailW: number;
  col: string; patch: string; nose: string; collar?: string; legW: number[];
};
/** legs: [upper, lower] swing forward (+) in degrees for front-left, front-right, hind-left, hind-right */
export type BeastPose = { pitch?: number; fl?: number[]; fr?: number[]; hl?: number[]; hr?: number[]; neck?: number; head?: [number, number]; tail?: number; mouth?: number };
export const DOG: Beast = { id: "dog", len: 300, legU: 105, legL: 112, bodyH: 74, bodyHr: 62, bodyW: 80, neck: 84, head: { a: 62, b: 58, H: 108 }, snout: 66, ear: "flop", tail: 150, tailW: 13,
  col: "#e0a85e", patch: "#8f5a2c", nose: "#2a1f1a", collar: "#d8342c", legW: [26, 19, 14] };
export const BEAST_POSES: Record<string, BeastPose> = {
  stand: { fl: [3, -3], fr: [-5, 5], hl: [-6, 14], hr: [4, 8], neck: 52, tail: 40 },
  /** pulling at a chain: chest down, front legs braced ahead, hind legs driving, the neck stretched */
  strain: { pitch: 1, fl: [38, 14], fr: [26, 6], hl: [-32, -6], hr: [-42, -16], neck: 14, head: [0, -8], tail: 8, mouth: 1 },
  trot: { fl: [34, 8], fr: [-28, -52], hl: [-30, 6], hr: [26, -20], neck: 44, tail: 48 },
};
type V3 = [number, number, number];
const piece = (k: Ink, pts: P2[], fill: string) => { k.shape(shift(pts, 5, 6), "rgba(52,32,16,0.24)", 0); k.shape(pts, fill); };
const pin = (k: Ink, p: P2, r = 6) => { k.dot(p[0], p[1], r, "#7d5f1a"); k.dot(p[0], p[1], r - 1.6, BRASS); };

/** draw the animal with its feet on y = 0 around x = 0; returns where a chain or lead meets the collar */
export const drawBeast = (B: Beast) => (k: Ink, pose: BeastPose, yaw: number): P2 => {
  const ink0 = k.ink; k.ink = LINE;
  const c = Math.cos(yaw * R), s = Math.sin(yaw * R), pt = (pose.pitch ?? 0) * R, ax: V3 = [0, -Math.sin(pt), Math.cos(pt)];
  const C: V3 = [0, 0, 0], at3 = (o: V3, d: V3, l: number): V3 => [o[0] + d[0] * l, o[1] + d[1] * l, o[2] + d[2] * l], dir = (deg: number): V3 => [0, -Math.cos(deg * R), Math.sin(deg * R)];
  const Sh = at3(C, ax, B.len / 2), Hp = at3(C, ax, -B.len / 2), lw = B.bodyW * 0.72;
  const legs = ([["fl", Sh, 1], ["fr", Sh, -1], ["hl", Hp, 1], ["hr", Hp, -1]] as [keyof BeastPose, V3, number][]).map(([n, o, sx]) => {
    const a = (pose[n] as number[] | undefined) ?? [0, 0], top: V3 = [o[0] + sx * lw * (o === Sh ? 0.82 : 1.28), o[1] - (o === Sh ? B.bodyH : B.bodyHr) * 0.35, o[2]], kn = at3(top, dir(a[0]), B.legU), paw = at3(kn, dir(a[1]), B.legL);
    return { top, kn, paw, sx };
  });
  const low = Math.min(...legs.map((l) => l.paw[1])) - B.legW[2];
  const pr = (v: V3): P2 & { d?: number } => { const q = [v[0] * c + v[2] * s, -(v[1] - low)] as P2 & { d?: number }; q.d = v[2] * c - v[0] * s; return q; };
  const nk = ((pose.neck ?? 45) * R) - pt, nd: V3 = [0, Math.sin(nk), Math.cos(nk)], nb = at3(Sh, ax, B.bodyH * 0.2), hc3 = at3(at3(nb, [0, 1, 0], B.bodyH * 0.3), nd, B.neck);
  const tl = (pose.tail ?? 30) * R, tb = at3(Hp, [0, 1, 0], B.bodyHr * 0.4), tt = at3(tb, [0, Math.sin(tl), -Math.cos(tl)], B.tail);
  const P = { sh: pr(Sh), hp: pr(Hp), nb: pr(nb), hc: pr(hc3), tb: pr(tb), tt: pr(tt) };
  const leg = (l: (typeof legs)[number]) => { const a = pr(l.top), b = pr(l.kn), p = pr(l.paw); piece(k, seg(b, p, B.legW[1], B.legW[2]), B.col); piece(k, ellPts(p[0] + s * B.legW[2] * 0.5, p[1] + B.legW[2] * 0.3, B.legW[2] * (1.25 + 0.35 * Math.abs(c)), B.legW[2] * 0.85), shade(B.col, 0.9)); piece(k, seg(a, b, B.legW[0], B.legW[1]), B.col); pin(k, b, 5.5); };
  const nearSide = s >= 0 ? -1 : 1, far = legs.filter((l) => l.sx !== nearSide), near = legs.filter((l) => l.sx === nearSide);
  const tail = () => piece(k, seg(P.tb, P.tt, B.tailW, B.tailW * 0.35), B.col);
  const body = () => {
    const rx = (r: number) => Math.hypot(B.bodyW * 1.12 * c, r * 0.92 * s), parts = [ellPts(P.hp[0], P.hp[1], rx(B.bodyHr), B.bodyHr), ellPts(P.sh[0], P.sh[1], rx(B.bodyH), B.bodyH)];
    if (Math.hypot(P.sh[0] - P.hp[0], P.sh[1] - P.hp[1]) > 12) parts.push(seg(P.hp, P.sh, B.bodyHr * 0.97, B.bodyH * 0.97));
    for (const q of parts) k.shape(shift(q, 5, 6), "rgba(52,32,16,0.24)", 0);
    k.group(parts, B.col, k.ol * 1.2);
    k.clip(parts[parts.length - 1], () => k.shape(ellPts(mid(P.hp, P.sh, 0.3)[0], mid(P.hp, P.sh, 0.3)[1] - B.bodyHr * 0.5, B.len * 0.2 * Math.max(0.35, Math.abs(s)), B.bodyHr * 0.7), B.patch, 0));
    if (c > 0.5) k.clip(parts[1], () => k.shape(ellPts(P.sh[0], P.sh[1] + B.bodyH * 0.35, B.bodyW * 0.62, B.bodyH * 0.7), shade(B.col, 1.3), 0));
  };
  let collarAt: P2 = P.nb;
  const head = () => {
    const phi = (yaw + (pose.head?.[0] ?? 0)) * R, hs = Math.sin(phi), hcx = Math.cos(phi), { a, b, H } = B.head, w = Math.hypot(a * hcx, b * hs), cx = P.hc[0], cy = P.hc[1], tilt = (pose.head?.[1] ?? 0) * hs;
    const p3 = (X: number, Z: number) => ({ x: X * hcx + Z * hs, d: Z * hcx - X * hs }), az = (deg: number, rho = 1) => p3(a * Math.sin(deg * R) * rho, b * Math.cos(deg * R) * rho);
    // the neck with its collar
    const neck = seg(P.nb, [cx, cy + H * 0.1], B.bodyH * 0.62, H * 0.36); piece(k, neck, B.col);
    if (B.collar) { const u = unit(sub([cx, cy], P.nb)), m0 = add(P.nb, u, B.neck * 0.62), m1 = add(P.nb, u, B.neck * 0.8); k.clip(neck, () => k.shape(seg(m0, m1, 200, 200, 0, 0.3, true), B.collar!, k.ol)); collarAt = add(mid(m0, m1), [-u[1] * H * 0.3 * (hs >= 0 ? -1 : 1) * Math.abs(hs) - hcx * 0, u[0] * H * 0.3 * (hs >= 0 ? -1 : 1) * Math.abs(hs) + H * 0.26 * Math.abs(hcx)]); pin(k, collarAt, 6); }
    k.g.save(); k.g.translate(cx, cy); k.g.rotate(-tilt * R);
    const ear = (sd: number) => { const e = az(sd * 96); const base: P2 = [e.x, -0.36 * H]; if (B.ear === "flop") piece(k, ellPts(base[0] + sd * 0.1 * a * hcx, base[1] + 0.34 * H, 0.26 * a * Math.max(0.5, Math.abs(hcx) + 0.3), 0.4 * H, sd * 8 * hcx), B.patch); else piece(k, [[base[0] - 0.22 * a, base[1] + 0.1 * H], [base[0] + sd * 0.1 * a, base[1] - 0.42 * H], [base[0] + 0.22 * a, base[1] + 0.1 * H]], B.patch); return e.d; };
    const snout = () => { const r0: P2 = [(b * 0.45) * hs, 0.12 * H], r1: P2 = [(b + B.snout) * hs, 0.2 * H], sp = seg(r0, r1, 0.36 * H, 0.27 * H); piece(k, sp, shade(B.col, 1.12)); const m = pose.mouth ?? 0;
      if (m > 0.05 && Math.abs(hs) > 0.4) { k.shape(seg(add(r0, [0, 0.3 * H]), add(r1, [-hs * B.snout * 0.2, 0.3 * H + 0.1 * H * m]), 0.1 * H, 0.08 * H), shade(B.col, 1.05)); k.shape(seg(add(mid(r0, r1, 0.5), [0, 0.34 * H]), add(r1, [-hs * B.snout * 0.1, 0.4 * H + 0.14 * H * m]), 0.06 * H, 0.07 * H), "#e86e78"); }
      piece(k, ellPts(r1[0] + hs * 0.2 * H, r1[1] - 0.12 * H, 0.14 * H * Math.max(0.6, Math.abs(hcx) + 0.4), 0.11 * H), B.nose); if (Math.abs(hcx) > 0.5) k.line([[r1[0], r1[1] + 0.02 * H], [r1[0], r1[1] + 0.2 * H]], k.ol); };
    const farEar = hs >= 0 ? 1 : -1;
    if (hcx < -0.15) snout();
    ear(farEar);
    piece(k, ellPts(0, 0, w, H / 2), B.col);
    if (hcx >= -0.15) snout();
    for (const sd of [farEar, -farEar]) { const e = az(sd * 34, 0.74); if (e.d < 0.1 * b || hcx < -0.2) continue; const fs = Math.max(0.35, Math.cos(sd * 34 * R + phi)), r = 0.2 * a; k.shape(ellPts(e.x, -0.14 * H, r * fs, r), "#fffdf6"); k.shape(ellPts(e.x + hs * r * 0.25, -0.13 * H, r * fs * 0.52, r * 0.52), "#2a1f1a", 0); }
    ear(-farEar);
    k.g.restore();
  };
  const headFirst = (P.hc.d ?? 0) < -B.len * 0.2;
  for (const l of far) leg(l);
  if (c > 0.2) tail();
  if (headFirst) head();
  body();
  if (c <= 0.2) tail();
  for (const l of near) leg(l);
  if (!headFirst) head();
  for (const l of near) pin(k, pr(l.top), 6);
  k.ink = ink0;
  return collarAt;
};

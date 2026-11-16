// A second skin on the same skeleton (rig.ts) and the same motions (motion.ts), for the comparison Jesper asked for before the look
// is frozen: the stick gentleman. A round white head with no nose or ears, dot eyes, a tweed flat cap, a gold monocle with a thin
// chain hanging straight down, a bushy moustache, a bent pipe, a tweed jacket over a mustard waistcoat, a red bow tie, white mittens,
// thin black legs and a cane. Everything is drawn here in code; no picture file is used. Like cast.ts it is ONE drawing that turns:
// every part of the face and the cap sits at an angle round the ball of the head and is projected by the view angle.
// Nothing in rig.ts or motion.ts is changed for it: a GentLook is drawn on the joints the skeleton already gives.
import { Ink, P2, R, spline, ellPts, seg, mid, shade, clamp, lerp, hand, angle, len, sub, add, unit } from "./ink";
import { Sk, Side, Props, Joint, solve } from "./rig";
import { FigOpts, Face, Design, frame, shoePts, thumbFlip, layers, cane } from "./designs/common";
import { ribbon, hull, swapPose } from "./cast";
import { SIR, BAKER } from "./looks";

export type GentLook = {
  id: string; P: Props;
  /** radius of the ball of the head */
  R: number; skin: string; line: string;
  hat: "cap" | "band" | "none"; hatCol: string;
  mous?: string; monocle?: boolean; pipe?: boolean;
  /** plain = one garment with no lapels, waistcoat or tie (a tunic); apron = a cloth over its front */
  coat: string; weave?: boolean; plain?: boolean; vest?: string; tie?: string; apron?: string;
  glove: string; leg: string; seat: string;
  /** torso rows [height above the pelvis, half-width from the front, depth in front of the spine, depth behind] from the hem up */
  rows: number[][];
};
const GOLD = "#dcb548", PIPE = "#4a3222", WEAVE = "rgba(40,36,22,0.2)", MOUTH = "#4a1a22";

const cyOf = (L: GentLook) => 0.84 * L.R;
type HV = { Rh: number; cy: number; sn: number; cs: number };
const view = (L: GentLook, phiDeg: number): HV => ({ Rh: L.R, cy: cyOf(L), sn: Math.sin(phiDeg * R), cs: Math.cos(phiDeg * R) });
/** a point on the ball of the head: az round it (0 = straight ahead, 90 = the figure's left), el up from its equator; rho > 1 stands off it */
const onBall = (h: HV, az: number, el: number, rho = 1) => { const c = Math.cos(el * R) * h.Rh * rho, X = c * Math.sin(az * R), Z = c * Math.cos(az * R); return { x: X * h.cs + Z * h.sn, y: -h.cy - h.Rh * rho * Math.sin(el * R), d: Z * h.cs - X * h.sn }; };

/** the flat cap: a soft crown wider than the head, six panels meeting at a button, a short peak over the brow */
const capDraw = (k: Ink, L: GentLook, h: HV, lift: number, away: boolean) => {
  const { Rh, sn, cs } = h, yb = -h.cy - 0.42 * Rh, capX = 0.1 * Rh * sn, col = L.hatCol, wc = 1.17 * Rh, g = k.g;
  g.save(); g.translate(-lift * 16 * sn, -lift * 0.42 * Rh); g.translate(capX, yb); g.rotate((5 * sn - lift * 10 * sn) * R); g.translate(-capX, -yb);
  if (!away) {
    const inn: P2[] = [], out: P2[] = [];
    for (let az = -66; az <= 66; az += 11) {
      const c = Math.cos(((az * 90) / 66) * R), ri = 1.02 * Rh, ro = ri + 0.5 * Rh * c, p = (r: number): number => r * Math.sin(az * R) * cs + r * Math.cos(az * R) * sn + capX;
      inn.push([p(ri), yb - 0.02 * Rh]); out.push([p(ro), yb + 0.03 * Rh + 0.045 * Rh * c]);
    }
    k.shape(hull([...inn, ...out]), shade(col, 0.82));
  }
  const crown = spline(([[-0.97 * wc, 0.0], [-1.07 * wc, -0.3], [-0.76 * wc, -0.76], [0, -0.92], [0.76 * wc, -0.76], [1.07 * wc, -0.3], [0.97 * wc, 0.0], [0.5 * wc, 0.09], [0, 0.11], [-0.5 * wc, 0.09]] as P2[]).map(([x, y]) => [x + capX, yb + y * Rh] as P2), true, 6);
  k.shape(crown, col, 0);
  if (L.weave) k.tweed(crown, WEAVE, [capX, yb - 0.4 * Rh], 0, 13, 2.2);
  const top: P2 = [capX * 1.3, yb - 0.86 * Rh];
  k.clip(crown, () => {
    for (let az = 0; az < 360; az += 60) {
      const dep = Math.cos(az * R) * cs - Math.sin(az * R) * sn; if (dep < -0.08) continue;
      const e: P2 = [wc * (Math.sin(az * R) * cs + Math.cos(az * R) * sn) + capX, yb + 0.04 * Rh];
      k.line(spline([top, [lerp(top[0], e[0], 0.72), yb - 0.5 * Rh], e], false, 8), k.ol * 0.5, shade(col, 0.55));
    }
  });
  k.shape(crown, null);
  k.shape(ellPts(top[0], top[1] - 0.03 * Rh, 0.1 * Rh, 0.055 * Rh), shade(col, 0.8));
  g.restore();
};
/** a figure's cap by itself, lying or flying: its middle at the origin, seen from the angle phi */
export const drawGentHat = (L: GentLook) => (k: Ink, phiDeg: number) => {
  if (L.hat !== "cap") return; const ink0 = k.ink, h = view(L, phiDeg); k.ink = L.line; k.g.save(); k.g.translate(0, h.cy + 0.8 * h.Rh);
  capDraw(k, L, h, 0, h.cs < -0.3); k.g.restore(); k.ink = ink0;
};

const headDraw = (k: Ink, L: GentLook, phiDeg: number, f: Face, o: FigOpts) => {
  const h = view(L, phiDeg), { Rh, cy, sn, cs } = h, phi = phiDeg * R, away = cs < -0.3, DARK = "#1d1b1c";
  const m = f.mouth ?? 0, sm = f.smile ?? 0, bw = f.brow ?? 0, lid = f.lid ?? 0.16, gz = f.gaze ?? [0, 0], sway = o.sway ?? 0;
  const ball = ellPts(0, -cy, Rh, Rh, 0, 0, 360, 48);
  const bowlAt = { x: 0.8 * Rh * cs + 1.25 * Rh * sn, y: -cy + 0.6 * Rh + 10 * m, d: 1.25 * Rh * cs - 0.8 * Rh * sn };
  const pipe = () => {
    const r0 = onBall(h, 13, -31, 0.97), b = bowlAt;
    const stem = spline([[r0.x, r0.y + 8 * m], [lerp(r0.x, b.x, 0.55), lerp(r0.y, b.y, 0.5) + 0.2 * Rh], [b.x, b.y]], false, 8);
    k.line(stem, 10 + k.ol * 1.5); k.line(stem, 10, PIPE);
    const bowl = spline([[b.x - 17, b.y - 36], [b.x + 17, b.y - 36], [b.x + 21, b.y - 6], [b.x + 11, b.y + 12], [b.x - 11, b.y + 12], [b.x - 21, b.y - 6]], true, 4);
    k.shape(bowl, shade(PIPE, 1.18)); k.line([[b.x - 15, b.y - 36], [b.x + 15, b.y - 36]], k.ol * 1.5);
  };
  const mous = (s: number) => {
    // From the front the two halves spread over the ball. From the side the near half sweeps back along the cheek to its curled tip
    // and the far half stands out in front of the face, so the same moustache reads in profile (as in cast.ts).
    const lift = (az: number) => -(az > 25 ? sm * 7 : 0) + 3 * m, y0 = onBall(h, 0, -21).y, dirx = sn >= 0 ? 1 : -1, near = s * dirx < 0;
    const G = ([[0, 0, 1.05], [9, 5, 1.07], [19, 9, 1.08], [29, 8, 1.09], [37, -1, 1.1], [41, -14, 1.1]] as number[][]).map(([az, dy, rho]) => { const q = onBall(h, s * az, -21, rho); return [q.x, q.y + (dy * Rh) / 120 + lift(az)] as P2; });
    const S = (near ? [[0.99, 0], [0.9, 6], [0.78, 10], [0.66, 8], [0.58, -2], [0.56, -15]] : [[0.99, 0], [1.07, 5], [1.17, 8], [1.25, 4], [1.29, -5], [1.28, -15]]).map(([x, dy], n) => [dirx * x * Rh, y0 + (dy * Rh) / 120 + lift(n > 2 ? 40 : 0)] as P2);
    const q = cs > -0.3 ? sn * sn : 0, pts = G.map((g, n) => [lerp(g[0], S[n][0], q), lerp(g[1], S[n][1], q)] as P2);
    k.shape(ribbon(pts, [0.095, 0.125, 0.12, 0.09, 0.05, 0.015].map((w) => w * Rh)), L.mous!);
  };
  const mFront = (s: number) => onBall(h, s * 34, -21).d >= 0;
  const eye = (s: number) => {
    const q = onBall(h, s * 25, 6, 0.985); if (q.d < 0.12 * Rh) return;
    const fs = clamp(Math.cos(s * 25 * R + phi), 0.45, 1), r = 0.085 * Rh * (1 + 0.24 * (f.wide ?? 0)), rx = r * Math.max(fs, 0.62), ex = q.x + gz[0] * 5, ey = q.y + gz[1] * 5;
    if (lid >= 0.8) {
      // shut: a happy arc when he smiles, a short line when he blinks
      const w = 0.15 * Rh * Math.max(fs, 0.62);
      k.line(sm > 0.4 ? spline([[q.x - w, q.y + 5], [q.x, q.y - 9], [q.x + w, q.y + 5]], false, 8) : [[q.x - w * 0.9, q.y + 1], [q.x + w * 0.9, q.y + 1]], k.ol * 1.05);
    } else {
      k.shape(ellPts(ex, ey, rx, r * 1.08), DARK, 0);
      if (lid > 0.3) { const y = ey - r + 2 * r * lid * 0.8; k.shape([[ex - rx - 3, ey - r - 3], [ex + rx + 3, ey - r - 3], [ex + rx + 3, y], [ex - rx - 3, y]], L.skin, 0); k.line([[ex - rx * 1.7, y], [ex + rx * 1.7, y]], k.ol * 0.9); }
    }
    // the brows come out only when the face does something: up for surprise, down toward the middle for a frown
    if (Math.abs(bw) > 0.12) {
      const bi = onBall(h, s * 9, 6), bo = onBall(h, s * 42, 6), by = q.y - r - 0.045 * Rh;
      k.line([[bi.x, by - 2 - 0.05 * Rh * Math.max(bw, 0) + 0.1 * Rh * Math.max(-bw, 0)], [bo.x, by - 0.05 * Rh * Math.max(bw, 0) - 0.04 * Rh * Math.max(-bw, 0)]], 0.055 * Rh * Math.min(1, Math.abs(bw) * 1.6 + 0.4));
    }
    if (L.monocle && s > 0) {
      const ry = 0.25 * Rh, rxx = Math.max(ry * fs, ry * 0.62), ring = ellPts(q.x, q.y, rxx, ry), g = k.g, out = onBall(h, 80, 6).x >= q.x ? 1 : -1;
      k.clip(ring, () => { g.globalAlpha = 0.22; k.shape(ring, "#bfe6f2", 0); g.globalAlpha = 0.8; k.line([[q.x - rxx * 0.6, q.y + ry * 0.15], [q.x - rxx * 0.1, q.y - ry * 0.65]], rxx * 0.18, "#ffffff"); g.globalAlpha = 1; });
      k.shape(ring, null, 11.5); const i0 = k.ink; k.ink = GOLD; k.shape(ring, null, 6.4); k.ink = i0;
      // the chain: thin, from the outer edge of the frame straight down; it trails a little when he moves
      const a: P2 = [q.x + out * rxx * 0.93, q.y + ry * 0.36], n = 15;
      for (let i = 1; i <= n; i++) { const u = i / n, x = a[0] + out * 3 * u - sway * sn * 26 * u * u, y = a[1] + u * 1.2 * Rh; k.dot(x, y, 3.7, L.line); k.dot(x, y, 2.3, GOLD); }
    }
  };
  const mouth = () => {
    const q = onBall(h, 0, -40); if (q.d < 0.3 * Rh) return; const fx = clamp(cs, 0.55, 1);
    if (m > 0.05) {
      const laugh = sm > 0.35, rx = (laugh ? 0.25 : 0.1 + 0.05 * m) * Rh * fx, ry = (0.05 + 0.2 * m) * Rh, y0 = q.y - 0.02 * Rh;
      const lips = laugh ? [[q.x - rx, y0] as P2, ...ellPts(q.x, y0, rx, ry * 1.5, 0, 180, 0, 16).reverse()] : ellPts(q.x, y0 + ry * 0.6, rx, ry);
      k.shape(lips, MOUTH); if (m > 0.35) k.clip(lips, () => k.shape(ellPts(q.x, y0 + ry * (laugh ? 1.5 : 1.5), rx * 0.62, ry * 0.6), "#e0707a", 0)); k.shape(lips, null);
    } else if (!L.mous && sm > 0.2) k.line(spline([[q.x - 0.16 * Rh * fx, q.y - 14], [q.x, q.y - 2], [q.x + 0.16 * Rh * fx, q.y - 14]], false, 8), k.ol);
    else if (sm < -0.25) k.line(spline([[q.x - 0.13 * Rh * fx, q.y + 5], [q.x, q.y - 5], [q.x + 0.13 * Rh * fx, q.y + 5]], false, 8), k.ol);
  };
  const pipeBehind = bowlAt.d < -0.15 * Rh;
  if (L.pipe && pipeBehind) pipe();
  if (L.mous && cs > -0.5) for (const s of [-1, 1]) if (!mFront(s)) mous(s);
  k.shape(ball, L.skin); k.shadeEdge(ball, shade(L.skin, 0.9), 16, 12); k.shape(ball, null);
  if (!away) {
    const far = sn >= 0 ? 1 : -1;
    mouth();
    eye(far); eye(-far);
    if (L.mous) for (const s of [far, -far]) if (mFront(s)) mous(s);
    if (L.pipe && !pipeBehind) pipe();
  }
  if (!o.hatOff) {
    if (L.hat === "cap") capDraw(k, L, h, o.capLift ?? 0, away);
    else if (L.hat === "band") k.clip(ball, () => k.shape([[-2 * Rh, -cy - 0.62 * Rh], [2 * Rh, -cy - 0.62 * Rh], [2 * Rh, -cy - 0.4 * Rh], [-2 * Rh, -cy - 0.4 * Rh]], L.hatCol));
  }
};

/** mirrored when he faces screen-right in a side view: his marks (the monocle, the pipe) are on his left, so they would be hidden.
 *  The pose stays the true one (left and right limbs are swapped before the mirror), only the skin is flipped, as in cast.ts. */
export const gentMirrored = (L: GentLook, yawDeg: number) => { const y = ((((yawDeg + 180) % 360) + 360) % 360) - 180; return !!L.monocle && y > 52 && y < 128; };
export const drawGent = (L: GentLook) => {
  const inner = drawTrue(L);
  return (k: Ink, sk: Sk, o: FigOpts) => {
    if (!gentMirrored(L, sk.yaw)) return inner(k, sk, o, "L");
    k.g.save(); k.g.scale(-1, 1);
    inner(k, solve(sk.P, swapPose(sk.pose), -sk.yaw), { ...o, handL: o.handR, handR: o.handL, face: o.face ? { ...o.face, gaze: o.face.gaze ? [-o.face.gaze[0], o.face.gaze[1]] : undefined } : undefined }, "R");
    k.g.restore();
  };
};
const drawTrue = (L: GentLook) => (k: Ink, sk: Sk, o: FigOpts, caneSide: Side) => {
  const ink0 = k.ink; k.ink = L.line;
  const F = frame(sk), P = sk.P, f = o.face ?? {}, front = sk.cos > 0.12, back = sk.cos < -0.12, d = Math.sign(sk.sin) || 1, rows = L.rows, top = rows[rows.length - 1][0], hem = rows[0][0];
  const J = (n: string, s: Side) => sk.j[(n + s) as Joint];
  const row = (a: number) => { let i = 0; while (i < rows.length - 2 && rows[i + 1][0] < a) i++; const t = clamp((a - rows[i][0]) / (rows[i + 1][0] - rows[i][0]), 0, 1); return [0, 1, 2, 3].map((j) => lerp(rows[i][j], rows[i + 1][j], t)); };
  const S = (l: number, a: number, onBack = false) => { const r = row(a), u = clamp(l / r[1], -1, 1); return F.Q(l, (onBack ? -r[3] : r[2]) * Math.sqrt(1 - u * u), a); };
  const sw = (o.sway ?? 0) * sk.sin, hemAt = (i: number) => -sw * (i === 0 ? 24 : i === 1 ? 9 : 0);
  const outline = () => { const c = Math.abs(sk.cos), s = Math.abs(sk.sin), fr = sk.sin >= 0; return spline([...rows.map(([a, w, df, db], i) => F.T(Math.hypot(w * c, (fr ? df : db) * s) + hemAt(i), a)), ...rows.map(([a, w, df, db], i) => F.T(-Math.hypot(w * c, (fr ? db : df) * s) + hemAt(i), a)).reverse()], true, 5); };
  // thin black legs in one line from the hip through the knee to the ankle, and a small shoe
  const leg = (s: Side) => {
    const sp = shoePts(sk, s, 40, 0.2, 0.14);
    k.shape(sp.pts, L.leg, k.ol * 0.5);
    k.line([J("hip", s), J("kn", s), J("an", s), add(J("an", s), [0, P.ankle * 0.7])], 15, L.leg);
  };
  const arm = (s: Side) => {
    const Sh = J("sh", s), E = J("el", s), W = J("wr", s), T = J("tip", s), kind = (s === "L" ? o.handL : o.handR) ?? "relaxed";
    if (o.prop === "cane" && s === caneSide) { const g = mid(W, T, 0.45); cane(k, g, W[1] < sk.j.pelvis[1] - 40 ? [g[0] + 46 * (sk.cos >= 0 ? 1 : -1) * (caneSide === "L" ? 1 : -1), g[1] + 360] : [g[0] + 10 * d, 0], 9, "#3f352c"); }
    hand(k, W, len(sub(T, W)) > 6 ? angle(W, T) : angle(E, W), P.hand * 1.12, kind, L.glove, thumbFlip(sk, s), false, k.ol);
    const up = seg(Sh, E, 25, 21), low = seg(E, mid(E, W, 0.96), 21, 17);
    k.group([up, low], L.coat, k.ol);
    if (L.weave) { k.tweed(up, WEAVE, Sh, angle(Sh, E) - 90, 13, 2.2); k.tweed(low, WEAVE, E, angle(E, W) - 90, 13, 2.2); }
    if (!L.plain) k.shape(seg(mid(E, W, 0.93), mid(E, W, 1.03), 18, 18, 0, 0.3, true), "#fdfdf8", k.ol * 0.7);
  };
  const torso = () => {
    const t = outline();
    // the seat of the trousers under the hem, and a short neck
    k.shape(spline([F.T(-P.hipW - 26, hem + 46), F.T(P.hipW + 26, hem + 46), F.T(P.hipW + 20, hem - 26), F.T(0, hem - 34), F.T(-P.hipW - 20, hem - 26)], true, 4), L.seat);
    k.shape(seg(F.T(0, top - 14), sk.j.skull, 20, 20, 0, 0.3, true), L.skin);
    k.shape(t, L.coat, 0); if (L.weave) k.tweed(t, WEAVE, F.o, F.tilt, 13, 2.2);
    k.clip(t, () => {
      if (!L.plain && front) {
        if (L.vest) k.shape([S(-34, top - 16), S(34, top - 16), S(42, top * 0.3), S(22, hem + 44), S(0, hem + 28), S(-22, hem + 44), S(-42, top * 0.3)], L.vest, k.ol);
        k.shape([S(-22, top + 2), S(22, top + 2), S(0, top * 0.72)], "#fdfdf8", k.ol);
        for (const s of [-1, 1]) { k.shape([S(s * 22, top + 4), S(s * 68, top * 0.86), S(s * 54, top * 0.74), S(s * 10, top * 0.42)], shade(L.coat, 1.14)); k.line([S(s * 10, top * 0.42), S(s * 32, hem)], k.ol); }
        for (const s of [-1, 1]) k.line([S(s * 58, top * 0.16), S(s * 86, top * 0.17)], k.ol * 0.7);
      }
      if (!L.plain && back) { k.line([S(0, top - 16, true), S(0, hem + 70, true)], k.ol * 0.7); k.line([S(0, hem + 70, true), S(0, hem, true)], k.ol * 1.3); k.shape([S(-32, top + 10, true), S(32, top + 10, true), S(36, top - 14, true), S(-36, top - 14, true)], shade(L.coat, 0.84), k.ol); }
      if (!L.plain && !front && !back && L.vest) k.shadeEdge(t, L.vest, 20 * d, 0);
      if (L.apron && front) k.shape([S(-rows[3][1] * 0.62, top * 0.78), S(rows[3][1] * 0.62, top * 0.78), S(rows[0][1] * 0.7, hem + 22), S(-rows[0][1] * 0.7, hem + 22)], L.apron, k.ol);
      if (L.apron && !front && !back) k.shadeEdge(t, L.apron, 24 * d, 0);
    });
    k.shape(t, null);
    if (!L.plain && front) {
      if (L.vest) for (const a of [0.56, 0.42, 0.28]) k.dot(S(0, top * a)[0], S(0, top * a)[1], 5, shade(L.vest, 0.5));
      if (L.tie) { const c = S(0, top - 12); for (const s of [-1, 1]) k.shape([c, S(s * 38, top + 6), S(s * 38, top - 30)], L.tie); k.shape(ellPts(c[0], c[1], 9, 11), shade(L.tie, 0.8)); }
    } else if (!L.plain && !back && L.tie) { const c = F.T(36 * d, top - 12); k.shape([c, [c[0] + 28 * d, c[1] - 16], [c[0] + 28 * d, c[1] + 16]], L.tie); }
  };
  const head = () => { k.g.save(); k.g.translate(sk.j.skull[0], sk.j.skull[1]); k.g.rotate(sk.headTilt * R); headDraw(k, L, sk.faceYaw, f, o); k.g.restore(); };
  layers(sk, { arm, leg, torso, head });
  k.ink = ink0;
};

const ROWS = [[-74, 100, 74, 78], [-6, 90, 68, 70], [80, 80, 60, 56], [176, 88, 66, 58], [234, 98, 56, 56], [258, 48, 34, 38]];
/** the stick gentleman on Sir Digsworth's own bone lengths, so that every motion plays the same on both skins */
export const GENT: GentLook = {
  id: "gent", P: SIR.P, R: 132, skin: "#fbfbf6", line: "#262220", hat: "cap", hatCol: "#8e866c", mous: "#5c4332", monocle: true, pipe: true,
  coat: "#8e866c", weave: true, vest: "#c9a13a", tie: "#b3362c", glove: "#fdfdf8", leg: "#1d1b1c", seat: "#4a3f36", rows: ROWS,
};
/** a side character in the same form: the Roman baker of the test clip (his own bone lengths, a headband, a tunic and an apron) */
export const GENT_BAKER: GentLook = {
  id: "gent-baker", P: BAKER.P, R: 124, skin: "#fbfbf6", line: "#262220", hat: "band", hatCol: "#c8402f",
  coat: "#e9d9b4", plain: true, apron: "#fdf6e6", glove: "#fdfdf8", leg: "#1d1b1c", seat: "#b99a6a",
  rows: [[-150, 108, 84, 86], [-40, 104, 82, 82], [80, 98, 76, 70], [176, 100, 74, 64], [240, 104, 58, 58], [266, 50, 36, 40]],
};
export const gentDesign = (L: GentLook, name = L.id): Design => ({ id: L.id, name, ol: 6, faceW: L.R * 1.5, props: () => L.P, draw: drawGent(L), hat: drawGentHat(L) });
export const GENT_D = gentDesign(GENT, "Streckherren"), GENT_BAKER_D = gentDesign(GENT_BAKER);

// The motion library of the cast, built on the skeleton only (rig.ts), so it fits every design.
// A Mover is a small script of moves (stand, walk, run, turn, act ...). It plans every footstep on the ground in world space first:
// a foot is either planted at one fixed spot or in the air between two spots, and the pelvis travels over the planted feet. The feet
// can therefore never slide, and the figure moves exactly as far as its steps carry it. Upper-body acting (point, recoil, duck ...)
// is laid on top as layers whose weight dips the wrong way first (the wind-up) and shoots a little past (the overshoot).
// All distances are in leg lengths (thigh + shin), all times in seconds; sample(t) is a pure function of time.
import { Pose, Seg, Side, FootIK, LegFK, Props, solve } from "./rig";
import type { HandKind } from "./ink";

const R = Math.PI / 180;
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
type V2 = [number, number];
const fwd = (psi: number): V2 => [Math.sin(psi * R), Math.cos(psi * R)], left = (psi: number): V2 => [Math.cos(psi * R), -Math.sin(psi * R)];
const other = (s: Side): Side => (s === "L" ? "R" : "L");

/** a number that changes over time: keys joined by smooth ramps */
class Track {
  k: [number, number][] = [];
  constructor(v0 = 0) { this.k.push([-1e9, v0]); }
  last() { return this.k[this.k.length - 1][1]; }
  /** hold the present value until t0, then reach v at t1 */
  ramp(t0: number, t1: number, v: number) { this.k.push([t0, this.at(t0)], [Math.max(t1, t0 + 1e-4), v]); this.k.sort((a, b) => a[0] - b[0]); }
  at(t: number) {
    const k = this.k; let i = 0; while (i < k.length - 1 && k[i + 1][0] <= t) i++;
    if (i >= k.length - 1) return k[k.length - 1][1];
    return lerp(k[i][1], k[i + 1][1], smooth((t - k[i][0]) / (k[i + 1][0] - k[i][0])));
  }
}
/** one footprint: the foot stands at (x, z) pointing `ang` from t0 until t1; h = how high it swung to get there */
/** `out` = when this foot would leave the ground if the gait simply went on (so the next move can carry on from it without a stop) */
type Plant = { t0: number; t1: number; x: number; z: number; ang: number; h: number; run: boolean; out?: number };
type PKey = { t: number; x: number; z: number };
export type Face = { gaze?: V2; lid?: number; wide?: number; brow?: number; mouth?: number; smile?: number; /** one eye shut: the eye on the left (-1) or the right (1) of the picture (designs/common.ts) */ shut?: number };
export type Layer = { t0: number; t1: number; in: number; out: number; pose: Partial<Pose>; handL?: HandKind; handR?: HandKind; face?: Face; antic: number; over: number; glide?: boolean };
export type Sample = {
  pose: Pose;
  /** where the figure stands (the ground under its pelvis), in leg lengths: x = screen-right, z = toward the lens; yaw = the view angle for solve() */
  x: number; z: number; yaw: number;
  /** how far the whole figure is lifted off the ground (climbing), in leg lengths; and how far loose things trail (-1..1, + = behind the way it faces) */
  y: number; sway: number;
  handL: HandKind; handR: HandKind; face: Face;
  /** for things that follow late (cap, coat tails, chain): forward speed and vertical speed of the body a moment ago, leg lengths per second */
  drag: number; bounce: number;
  /** debug: the footprints in the world [x, z, planted] */
  feet: Record<Side, [number, number, boolean]>;
};

// ---------------- acting poses (upper body; the feet stay with the planner) ----------------
export const ACTS: Record<string, Partial<Pose> & { shapeL?: HandKind; shapeR?: HandKind; face?: Face }> = {
  point: { lean: 7, twist: -8, armR: [[84, 6], [82, 0]], armL: [[-22, 12], [-4, 8]], head: [0, -4, 0], shapeR: "point", face: { brow: -0.5, lid: 0.1 } },
  recoil: { lean: -17, pz: -0.13, py: -0.05, armL: [[48, 26], [128, 16]], armR: [[72, 22], [146, 8]], shapeL: "open", shapeR: "open", head: [0, -9, 0], face: { wide: 1, lid: 0, brow: 1, mouth: 0.6 } },
  duck: { py: -0.4, lean: 30, armL: [[150, 24], [236, 8]], armR: [[156, 24], [240, 8]], shapeL: "open", shapeR: "open", head: [0, 22, 0], face: { lid: 0.7, brow: -1 } },
  carry: { lean: -5, armL: [[26, 10], [96, -8]], armR: [[26, 10], [96, -8]], shapeL: "grip", shapeR: "grip" },
  windup: { lean: -13, pz: -0.1, twist: 18, armL: [[82, 10], [78, 4]], armR: [[-112, 24], [-158, 10]], shapeR: "fist", shapeL: "open", head: [0, -7, 0] },
  release: { lean: 20, pz: 0.12, twist: -20, armL: [[-40, 16], [-10, 10]], armR: [[70, 8], [60, 0]], shapeR: "open", head: [0, 4, 0] },
  talk: { armR: [[20, 14], [100, -6]], shapeR: "open", head: [0, -2, 0] },
  /** sitting down on something: the pelvis back and low, hands on the knees */
  sit: { py: -0.46, pz: -0.2, lean: -5, armL: [[34, 8], [78, -10]], armR: [[34, 8], [78, -10]], head: [0, 2, 0] },
  /** on hands and knees: the first thing on the way up from lying */
  allfours: { py: -0.62, lean: 64, armL: [[12, 12], [4, 6]], armR: [[16, 12], [8, 6]], shapeL: "open", shapeR: "open", head: [0, -42, 0] },
  /** on the way up from the ground: crouched, hands pushing off */
  kneel: { py: -0.5, lean: 36, armL: [[36, 16], [14, 8]], armR: [[40, 16], [18, 8]], shapeL: "open", shapeR: "open", head: [0, -22, 0] },
  /** hauling on a rope: leaning far back against it, both hands gripping ahead */
  pull: { lean: -27, pz: -0.24, py: -0.1, armL: [[62, 8], [70, 0]], armR: [[72, 8], [78, 0]], shapeL: "grip", shapeR: "grip", head: [0, -8, 0], face: { brow: -1, lid: 0.3, mouth: 0.3 } },
  /** pouring from a jug: one hand tips it, the other steadies */
  pour: { lean: 9, armR: [[62, 10], [112, -18]], handR: 62, armL: [[40, 12], [92, -28]], shapeR: "grip", shapeL: "open", head: [0, 14, 0], face: { gaze: [0.2, 0.7] } },
  /** on the ground, face down: arms bent ahead of him, shins in the air */
  down: { lean: 86, py: -0.89, armL: [[128, 30], [44, 8]], armR: [[122, 30], [40, 8]], shapeL: "open", shapeR: "open", head: [0, -62, 0], legL: { th: [-86, 4], sh: [-166, 0], pitch: 30 }, legR: { th: [-84, 4], sh: [-138, 0], pitch: 40 }, face: { lid: 1, brow: -0.6 } },
  /** climbing: one hand and the opposite knee high, then the other pair */
  climbA: { lean: 6, armL: [[162, 10], [186, 4]], armR: [[70, 12], [150, 6]], shapeL: "grip", shapeR: "grip", legR: { th: [78, 6], sh: [-6, 0], pitch: 20 }, legL: { th: [6, 4], sh: [-14, 0], pitch: 30 }, head: [0, -20, 0] },
  climbB: { lean: 6, armR: [[162, 10], [186, 4]], armL: [[70, 12], [150, 6]], shapeL: "grip", shapeR: "grip", legL: { th: [78, 6], sh: [-6, 0], pitch: 20 }, legR: { th: [6, 4], sh: [-14, 0], pitch: 30 }, head: [0, -20, 0] },
  trip: { lean: 40, py: -0.06, armL: [[62, 14], [70, 8]], armR: [[88, 10], [100, 4]], shapeL: "open", shapeR: "open", head: [0, -24, 0], face: { wide: 1, lid: 0, brow: 1, mouth: 0.8 } },
};

export class Mover {
  t = 0; P: V2; psi: number;
  /** half the distance between the feet when standing, in leg lengths */
  w = 0.12;
  private feet: Record<Side, Plant[]> = { L: [], R: [] };
  private pel: PKey[] = [];
  private yawT: Track; private lean = new Track(0); private runW = new Track(0); private rise = new Track(0);
  private layers: Layer[] = []; private next: Side = "R";
  /** when the hat leaves the head (a fall) and when it is back on (picked up while getting up; null = it stays where it fell) */
  hats: { off: number; on: number | null }[] = [];
  /** true while a walk or run was told to keep going: the next move carries on from it instead of starting from a stand */
  private moving = false; private marks: { t: number; k: string; x: number; big?: number }[] = [];
  constructor(at: V2, facing: number) {
    this.P = at; this.psi = facing; this.yawT = new Track(facing);
    for (const s of ["L", "R"] as Side[]) this.feet[s].push(this.spot(s, at, facing, -1e9));
    this.pel.push({ t: 0, x: at[0], z: at[1] });
  }
  private spot(s: Side, P: V2, psi: number, t0: number, h = 0.08, run = false): Plant {
    const l = left(psi), k = s === "L" ? this.w : -this.w;
    return { t0, t1: 1e9, x: P[0] + l[0] * k, z: P[1] + l[1] * k, ang: psi + (s === "L" ? 11 : -11), h, run };
  }
  private lastPlant(s: Side) { return this.feet[s][this.feet[s].length - 1]; }
  /** lift a foot at `lift` and put it down at `land` on a new spot */
  private put(s: Side, lift: number, land: number, p: Plant) {
    const prev = this.lastPlant(s); prev.t1 = Math.max(prev.t0 + 0.02, Math.min(lift, land - 0.06)); p.t0 = land; this.feet[s].push(p);
  }
  stand(dur: number) { this.t += dur; this.pel.push({ t: this.t, x: this.P[0], z: this.P[1] }); return this; }
  /** walk `dist` leg lengths the way the figure faces, then bring the feet together.
   *  keep = do not stop: no closing step and no straightening up, so the next move (more running, a stumble, a fall) grows out of
   *  this one. A walk or run that follows a kept one carries on in stride. */
  walk(dist: number, o: { run?: boolean; step?: number; tau?: number; keep?: boolean } = {}) {
    const run = !!o.run, tau = o.tau ?? (run ? 0.33 : 0.5), ref = o.step ?? (run ? 1.22 : 0.52), cont = this.moving;
    const n = Math.max(cont ? 1 : 2, Math.round(dist / ref + (cont ? 0 : 0.5))), L = cont ? dist / n : dist / (n - 0.5), T0 = this.t, d = fwd(this.psi), P0 = this.P;
    // a running foot is on the ground for under half a step, so between two feet both are in the air
    const half = run ? 0.23 : 0.55, lead = cont ? 0 : run ? 0.25 : 0.4, m = (k: number) => T0 + (k + lead) * tau, pos = (k: number) => (cont ? k : k - 0.5) * L, at = (a: number): V2 => [P0[0] + d[0] * a, P0[1] + d[1] * a];
    if (!cont) this.pel.push({ t: T0, x: P0[0], z: P0[1] });
    for (let k = 1; k <= n; k++) { const p = at(pos(k)); this.pel.push({ t: m(k), x: p[0], z: p[1] }); }
    let s = this.next;
    for (let k = 1; k <= n + (o.keep ? 0 : 1); k++) {
      const land = k <= n ? m(k) - half * tau : m(n) + (run ? 0.5 : 0.45) * tau, prev = this.lastPlant(s);
      const lift = prev.out !== undefined ? prev.out : k <= 2 ? Math.max(T0 + 0.02, land - (run ? 1.05 : k === 1 ? 0.8 : 0.9) * tau) : m(k - 2) + half * tau;
      const pl = this.spot(s, at(pos(Math.min(k, n))), this.psi, land, k > n ? 0.05 : run ? 0.36 : 0.11, run); if (k <= n) pl.out = m(k) + half * tau;
      this.put(s, lift, land, pl);
      s = other(s);
    }
    this.next = s; this.P = at(pos(n));
    this.lean.ramp(T0, T0 + tau * (cont ? 0.8 : 1.2), run ? 17 : 3.5); this.runW.ramp(T0, T0 + tau * (cont ? 0.5 : 1), run ? 1 : 0);
    if (o.keep) { this.t = m(n); this.moving = true; return this; }
    this.t = m(n) + (run ? 0.8 : 0.72) * tau; this.moving = false;
    this.pel.push({ t: this.t, x: this.P[0], z: this.P[1] });
    // a small lean back past upright when it stops (the overshoot)
    this.lean.ramp(m(n) - tau * 0.6, m(n) + tau * 0.35, run ? -9 : -2.5); this.lean.ramp(m(n) + tau * 0.35, this.t + 0.18, 0);
    this.runW.ramp(m(n) - tau * 0.3, this.t, 0);
    return this;
  }
  run(dist: number, o: { step?: number; tau?: number; keep?: boolean } = {}) { return this.walk(dist, { ...o, run: true }); }
  /** turn on the spot by `deg` (positive = toward the figure's left); each quarter turn is two small steps */
  turn(deg: number, dur?: number) {
    const parts = Math.max(1, Math.ceil(Math.abs(deg) / 95)), each = deg / parts, td = (dur ?? 0.42 * parts + 0.14) / parts;
    for (let i = 0; i < parts; i++) {
      const T0 = this.t, psi1 = this.psi + each, a: Side = each > 0 ? "L" : "R", b = other(a);
      this.put(a, T0 + 0.02, T0 + td * 0.5, this.spot(a, this.P, psi1, 0, 0.06));
      this.put(b, T0 + td * 0.46, T0 + td * 0.96, this.spot(b, this.P, psi1, 0, 0.06));
      this.yawT.ramp(T0, T0 + td, psi1); this.psi = psi1; this.t = T0 + td;
    }
    this.pel.push({ t: this.t, x: this.P[0], z: this.P[1] });
    return this;
  }
  /** move one foot: `ahead` leg lengths forward (negative = back), e.g. the step back of a recoil */
  step(s: Side, ahead: number, dur = 0.22) {
    const prev = this.lastPlant(s), d = fwd(this.psi);
    this.put(s, this.t + 0.02, this.t + dur, { t0: 0, t1: 1e9, x: prev.x + d[0] * ahead, z: prev.z + d[1] * ahead, ang: prev.ang, h: 0.08, run: false });
    return this;
  }
  /** lay an acting pose over the body for `dur` seconds. wait = false starts it without moving the clock (so it plays over the next move) */
  /** glide = the act starts and ends at rest, at an even pace between (a long move: lifting an arm to the head, lowering it); the
   *  default starts at full speed and settles slowly, which is right for a quick gesture but makes a long move jump, most of it in two
   *  frames (the review of Blackbeard v4: the arm from the hip to the hat brim in two frames) */
  act(name: keyof typeof ACTS | Partial<Pose>, dur: number, o: { in?: number; out?: number; wait?: boolean; antic?: number; over?: number; glide?: boolean; face?: Face; handL?: HandKind; handR?: HandKind } = {}) {
    const a = typeof name === "string" ? ACTS[name] : (name as Partial<Pose> & { shapeL?: HandKind; shapeR?: HandKind; face?: Face }), { shapeL: handL, shapeR: handR, face, ...pose } = a;
    this.layers.push({ t0: this.t, t1: this.t + dur, in: o.in ?? 0.28, out: o.out ?? 0.3, pose, handL: o.handL ?? handL, handR: o.handR ?? handR, face: o.face ?? face, antic: o.glide ? 0 : o.antic ?? 0.16, over: o.over ?? 1.6, glide: o.glide });
    if (o.wait !== false) this.stand(dur);
    return this;
  }
  /** the same, at a set time (for gestures on spoken words, or a face that stays through several moves); never moves the clock */
  actAt(t0: number, name: keyof typeof ACTS | Partial<Pose>, dur: number, o: { in?: number; out?: number; antic?: number; over?: number; glide?: boolean; face?: Face; handL?: HandKind; handR?: HandKind } = {}) {
    const t = this.t; this.t = t0; this.act(name, dur, { ...o, wait: false }); this.t = t; return this;
  }
  /** the toe catches: short stuttering steps with the body pitched forward and the hands thrown out. It grows out of a run that was
   *  kept going. fall = he does not recover: the stumble is kept going too, and its pitch holds until fall() takes it to the ground */
  stumble(o: { fall?: boolean } = {}) {
    const T0 = this.t; this.marks.push({ t: T0 + 0.04, k: "scuff", x: this.P[0] });
    this.walk(1.1, { run: true, tau: 0.2, step: 0.32, keep: !!o.fall });
    this.layers.push({ t0: T0, t1: o.fall ? this.t + 0.34 : T0 + 0.75, in: 0.14, out: o.fall ? 0.3 : 0.45, pose: (({ shapeL, shapeR, face, ...p }) => p)(ACTS.trip), handL: "open", handR: "open", face: ACTS.trip.face, antic: 0, over: 2.2 });
    return this;
  }
  /** fall forward to the ground and lie there for `hold` seconds. After a stumble that was kept going, the fall is the same forward
   *  pitch carried on down: the figure never straightens up in between */
  fall(hold = 0.8) {
    const T0 = this.t, d = fwd(this.psi), a = ACTS.down, { shapeL, shapeR, face, ...pose } = a;
    this.layers.push({ t0: T0, t1: T0 + 0.34 + hold + 0.3, in: 0.3, out: 0.34, pose, handL: shapeL, handR: shapeR, face, antic: 0, over: 1.2 });
    this.pel.push({ t: T0, x: this.P[0], z: this.P[1] }); this.P = [this.P[0] + d[0] * 0.8, this.P[1] + d[1] * 0.8];
    this.t = T0 + 0.34; this.pel.push({ t: this.t, x: this.P[0], z: this.P[1] }); this.lean.ramp(T0 + 0.1, T0 + 0.4, 0); this.runW.ramp(T0, T0 + 0.2, 0); this.moving = false;
    this.marks.push({ t: T0 + 0.27, k: "thud", x: this.P[0], big: 1.1 }, { t: T0 + 0.3, k: "scuff", x: this.P[0] });
    this.hats.push({ off: T0 + 0.2, on: null });
    return this.stand(hold);
  }
  /** get up from the ground without changing place: the knees are pulled under the body (hands and knees), then a crouch, then up.
   *  into = straight into the next move from the crouch (a run out of a crouch), without standing up first */
  getup(o: { into?: boolean } = {}) {
    const T0 = this.t;
    for (const s of ["L", "R"] as Side[]) this.put(s, T0 + 0.04 + (s === "L" ? 0 : 0.1), T0 + 0.34 + (s === "L" ? 0 : 0.1), this.spot(s, this.P, this.psi, 0, 0.03));
    const h = this.hats[this.hats.length - 1]; if (h && h.on === null) h.on = T0 + 0.74;
    this.act("allfours", 0.56, { in: 0.26, out: 0.26, antic: 0, over: 1.2, wait: false }).stand(0.32);
    if (!o.into) return this.act("kneel", 0.62, { in: 0.3, out: 0.34, antic: 0 }).stand(0.2);
    this.act("kneel", 0.78, { in: 0.28, out: 0.36, antic: 0, wait: false });
    return this.stand(0.42);
  }
  /** climb up by `height` leg lengths: alternating hand-and-knee pulls */
  climb(height: number, pulls = 4) {
    const each = 0.42, T0 = this.t;
    for (let i = 0; i < pulls; i++) { const a = ACTS[i % 2 ? "climbB" : "climbA"], { shapeL, shapeR, face, ...pose } = a; this.layers.push({ t0: T0 + i * each - 0.06, t1: T0 + (i + 1) * each + 0.1, in: 0.2, out: 0.2, pose, handL: shapeL, handR: shapeR, face, antic: 0, over: 1.4 }); }
    this.rise.ramp(T0, T0 + pulls * each, this.rise.last() + height);
    return this.stand(pulls * each);
  }
  get end() { return this.t; }
  /** the sounds this motion makes, each at the moment it happens: a step for every foot that lands, a scuff, a thud.
   *  t in seconds, x where it happens in leg lengths (for placing it left or right) */
  cues(): { t: number; k: string; x: number; run?: boolean; big?: number }[] {
    const out: { t: number; k: string; x: number; run?: boolean; big?: number }[] = [...this.marks];
    for (const s of ["L", "R"] as Side[]) this.feet[s].slice(1).forEach((p) => { if (p.h > 0.04) out.push({ t: p.t0, k: "step", x: p.x, run: p.run }); });
    return out.sort((a, b) => a.t - b.t);
  }

  // ---------------- sampling ----------------
  /** where the body stood (its ground point) when the foot that is down on side s at time t was put down; null while it is in the
   *  air. The card that draws the figure keeps a planted foot where it was drawn when it landed (people.ts plantFix) */
  landedAt(s: Side, t: number): V2 | null {
    const f = this.feet[s]; let i = 0; while (i < f.length - 1 && f[i + 1].t0 <= t) i++;
    const p = f[i]; if (!(t <= p.t1 || i === f.length - 1)) return null; return this.pelAt(Math.max(this.pel[0].t, p.t0));
  }
  private pelAt(t: number): V2 {
    const k = this.pel; if (t <= k[0].t) return [k[0].x, k[0].z]; if (t >= k[k.length - 1].t) return [k[k.length - 1].x, k[k.length - 1].z];
    let i = 0; while (k[i + 1].t <= t) i++;
    const a = k[i], b = k[i + 1], h = b.t - a.t, u = (t - a.t) / h;
    const tan = (j: number, c: "x" | "z") => {
      if (j <= 0 || j >= k.length - 1) return 0;
      const d0 = k[j][c] - k[j - 1][c], d1 = k[j + 1][c] - k[j][c]; if (d0 * d1 <= 0) return 0;
      const s = (k[j + 1][c] - k[j - 1][c]) / (k[j + 1].t - k[j - 1].t), lim = 3 * Math.min(Math.abs(d0) / (k[j].t - k[j - 1].t), Math.abs(d1) / (k[j + 1].t - k[j].t));
      return Math.sign(s) * Math.min(Math.abs(s), lim);
    };
    const H = (c: "x" | "z") => { const u2 = u * u, u3 = u2 * u; return (2 * u3 - 3 * u2 + 1) * a[c] + (u3 - 2 * u2 + u) * h * tan(i, c) + (-2 * u3 + 3 * u2) * b[c] + (u3 - u2) * h * tan(i + 1, c); };
    return [H("x"), H("z")];
  }
  /** a foot at time t: where it is, how high, which way it points, how it is pitched, whether it stands */
  private footAt(s: Side, t: number) {
    const f = this.feet[s]; let i = 0; while (i < f.length - 1 && f[i + 1].t0 <= t) i++;
    const p = f[i];
    if (t <= p.t1 || i === f.length - 1) {
      // planted: heel first as it lands, onto the toe before it leaves
      const land = clamp((t - p.t0) / 0.07, 0, 1), leave = p.t1 > 1e8 ? 0 : clamp((t - (p.t1 - (p.run ? 0.07 : 0.16))) / (p.run ? 0.07 : 0.16), 0, 1);
      return { x: p.x, z: p.z, y: 0, ang: p.ang, pitch: (p.run ? -4 : -14) * (1 - land) * (i ? 1 : 0) + (p.run ? 34 : 30) * smooth(leave), down: true };
    }
    // (the body check of 18 November: the foot came down while still travelling, and skidded the last centimetres along the ground.
    // It now rises a little before it moves on, and is over its new spot before it comes down, straight down onto it)
    const q = f[i + 1], u = clamp((t - p.t1) / (q.t0 - p.t1), 0, 1), e = smooth(clamp((u - 0.04) / 0.8, 0, 1)), far = Math.hypot(q.x - p.x, q.z - p.z);
    const up = Math.sin(Math.PI * Math.min(1, u * 1.08)) ** 0.8 * q.h * (far > 0.05 || q.h < 0.09 ? 1 : 0.6);
    return { x: lerp(p.x, q.x, e), z: lerp(p.z, q.z, e), y: up, ang: lerp(p.ang, q.ang, e), pitch: lerp(p.run ? 34 : 30, q.run ? -4 : -14, smooth(clamp(u * 1.5 - 0.1, 0, 1))) + (q.run ? 28 : 8) * Math.sin(Math.PI * u) * (u < 0.5 ? 1 : 0.3), down: false };
  }
  private weight(l: Layer, t: number) {
    if (t <= l.t0 || t >= l.t1) return 0;
    const u = (t - l.t0) / l.in, v = (l.t1 - t) / l.out;
    let w = 1;
    if (u < 1 && l.glide) w = smooth(u);
    else if (u < 1) { const a = 0.2; if (u < a && l.antic) w = -l.antic * Math.sin((Math.PI * u) / a); else { const q = (u - (l.antic ? a : 0)) / (1 - (l.antic ? a : 0)) - 1; w = 1 + (l.over + 1) * q * q * q + l.over * q * q; } }
    return v < 1 ? Math.min(w, smooth(v)) : w;
  }
  sample(t: number): Sample {
    const P = this.pelAt(t), psi = this.yawT.at(t), f = fwd(psi), l = left(psi), run = this.runW.at(t);
    const pose: Pose = {}, feet = {} as Sample["feet"], rel = {} as Record<Side, { lx: number; lz: number; y: number }>;
    for (const s of ["L", "R"] as Side[]) {
      const ft = this.footAt(s, t), dx = ft.x - P[0], dz = ft.z - P[1], lx = dx * l[0] + dz * l[1], lz = dx * f[0] + dz * f[1], sg = s === "L" ? 1 : -1;
      rel[s] = { lx, lz, y: ft.y }; feet[s] = [ft.x, ft.z, ft.down];
      const ik: FootIK = { x: sg * lx, z: lz, y: ft.y, pitch: ft.pitch, toe: sg * (ft.ang - psi) };
      if (s === "L") pose.legL = ik; else pose.legR = ik;
    }
    // arms, shoulders and bounce follow the feet, so they start, stop and change gait with them
    const sep = clamp((rel.R.lz - rel.L.lz) / lerp(0.52, 0.95, run), -1.25, 1.25), air = Math.min(rel.L.y, rel.R.y);
    // the arms swing against the legs (left arm forward with the right foot); in a walk they hang almost straight and the hand is loose
    // (a fuller swing, the elbow a little bent: hanging almost straight with fists and a small swing, the walk read as a shuffle, the shot
    //  library review of round 2)
    // (the shot library's round 3: the arm swinging forward carried its forearm 48 degrees out, where the loose hand is drawn open, palm up,
    //  "like a tray", and the swing hardly showed. Now a fuller swing from the shoulder and the forearm kept nearer the line of the arm)
    const up = lerp(30, 46, run) * sep, bend = lerp(10, 82, run), fw = (q: number) => 4 * Math.max(0, q) * (1 - run);
    pose.armL = [[up, lerp(8, 14, run)], [up + bend + fw(sep), 5]]; pose.armR = [[-up, lerp(8, 14, run)], [-up + bend + fw(-sep), 5]];
    pose.handL = pose.handR = 8;
    pose.twist = -9 * sep * (1 + 0.6 * run); pose.lean = this.lean.at(t); pose.head = [0, -(pose.lean ?? 0) * 0.45, 0];
    // the body rises over the standing foot and sinks when both feet are apart (walk); in a run it sinks into each landing and
    // lifts while both feet are in the air
    pose.py = -0.012 - (1 - run) * 0.05 * sep * sep - run * (0.1 - 1.0 * air - 0.02 * Math.abs(sep));
    // nobody stands like a post: when the feet are still the weight drifts from foot to foot, the head and the arms move a little
    const dt0 = 1 / 60, Pb = this.pelAt(t - dt0), still = clamp(1 - Math.hypot(P[0] - Pb[0], P[1] - Pb[1]) / dt0 / 0.35, 0, 1) * (1 - run);
    pose.px = 0.02 * Math.sin(2.3 * t + 0.4) * still; pose.roll = 1.3 * Math.sin(2.3 * t + 1.0) * still; pose.hipTilt = -1.6 * Math.sin(2.3 * t + 0.4) * still;
    pose.head = [3 * Math.sin(1.1 * t) * still, (pose.head as number[])[1], 1.6 * Math.sin(1.7 * t + 2) * still];
    pose.armL[1][0] += 3 * Math.sin(2.3 * t) * still; pose.armR[1][0] -= 3 * Math.sin(2.3 * t + 0.7) * still;
    // a hand that swings in a walk or pumps in a run is loosely closed; an open hand would read as reaching out
    let handL: HandKind = run > 0.5 ? "fist" : "relaxed", handR: HandKind = handL; const face: Face = {};      // (a walking hand hangs loose: the review of round 2)
    for (const L of this.layers) {
      const w = this.weight(L, t); if (!w) continue;
      const P0 = pose as Record<string, unknown>, Lp = L.pose as Record<string, unknown>;
      for (const key of Object.keys(Lp)) {
        const a = P0[key], b = Lp[key];
        if (typeof b === "number") P0[key] = lerp((a as number) ?? 0, b, w);
        else if (key === "head") { const h = (a as number[]) ?? [0, 0, 0], g = b as number[]; P0[key] = [0, 1, 2].map((i) => lerp(h[i], g[i], w)); }
        else if (key === "armL" || key === "armR") { const h = a as [Seg, Seg], g = b as [Seg, Seg]; P0[key] = [0, 1].map((i) => [lerp(h[i][0], g[i][0], w), lerp(h[i][1], g[i][1], w)]); }
        else if (key === "legL" || key === "legR") { const base = a as FootIK; P0[key] = { ...base, fk: b as LegFK, fkW: Math.max(base.fkW ?? 0, clamp(w, 0, 1)) }; }
      }
      if (w > 0.5) { if (L.handL) handL = L.handL; if (L.handR) handR = L.handR; }
      if (L.face) { const ww = clamp(w, 0, 1), F = face as Record<string, unknown>, G = L.face as Record<string, unknown>; for (const key of Object.keys(G)) { const b = G[key]; F[key] = typeof b === "number" ? lerp((F[key] as number) ?? (key === "lid" ? 0.18 : 0), b, ww) : b; } }
    }
    const dt = 1 / 60, vel = (tt: number) => { const a = this.pelAt(tt), b = this.pelAt(tt - dt); return ((a[0] - b[0]) * f[0] + (a[1] - b[1]) * f[1]) / dt; };
    const drag = vel(t - 0.1), now = vel(t), lateLean = this.lean.at(t - 0.12) - this.lean.at(t);
    // loose things trail behind steady motion, lag further when it starts and swing ahead when it stops
    const sway = clamp(0.5 * drag / 3.2 + 1.5 * (now - drag) / 3.2 - lateLean / 40, -1.3, 1.3);
    return { pose, x: P[0], z: P[1], y: this.rise.at(t), yaw: psi, handL, handR, face, drag, bounce: 0, sway, feet };
  }
}

/** where a figure's hat is at time t. on = it sits on the head as drawn. Otherwise it is in the air or on the ground: x along the
 *  ground and y above it in design units (the same units as the figure, from the same ground point as Sample.x * leg length),
 *  rot in degrees. It leaves the head in the fall, flies ahead, lands beside the figure, and is picked up while getting up. */
export const hatAt = (m: Mover, P: Props, t: number): { on: boolean; x: number; y: number; rot: number } => {
  const LL = P.thigh + P.shin, h = m.hats.find((q) => t >= q.off && (q.on === null || t < q.on));
  if (!h) return { on: true, x: 0, y: 0, rot: 0 };
  const head = (tt: number) => { const s = m.sample(tt), sk = solve(P, s.pose, s.yaw); return { x: s.x * LL + sk.j.crown[0], y: -sk.j.crown[1] + s.y * LL, dir: Math.sin(s.yaw * R) >= 0 ? 1 : -1 }; };
  const a = head(h.off), fly = 0.5, rest = { x: a.x + a.dir * 0.42 * LL, y: P.head * 0.12 }, u = (t - h.off) / fly;
  let x: number, y: number, rot: number;
  if (u < 1) { x = lerp(a.x, rest.x, u); y = lerp(a.y, rest.y, u) + 0.55 * LL * 4 * u * (1 - u) * 0.5; rot = a.dir * -220 * u; }
  else { const b = Math.max(0, 1 - (t - h.off - fly) / 0.22); x = rest.x + a.dir * 0.05 * LL * (1 - b); y = rest.y + 0.06 * LL * Math.sin(Math.PI * (1 - b)) * b; rot = a.dir * (-220 - 20 * (1 - b)); rot = Math.round(rot / 180) * 180 * (1 - b) + rot * b; }
  if (h.on !== null && t > h.on - 0.26) { const q = smooth((t - (h.on - 0.26)) / 0.26), b = head(t); x = lerp(x, b.x, q); y = lerp(y, b.y, q); rot = rot * (1 - q); }
  return { on: false, x, y, rot };
};
/** camera shake on impacts: the picture's offset in pixels at time t for a list of hits (when, how hard 0..1, how long it rings).
 *  A pure function of time, so every frame renders the same; the hardest moment is the frame of the hit itself. */
export const shake = (t: number, hits: { t: number; amp: number; dur?: number }[], px = 14): [number, number] => {
  let x = 0, y = 0;
  for (const h of hits) { const u = (t - h.t) / (h.dur ?? 0.5); if (u < 0 || u > 1) continue; const e = (1 - u) ** 2 * h.amp * px; x += Math.sin(t * 91 + h.t * 7) * e; y += Math.cos(t * 77 + h.t * 5) * e * 0.75; }
  return [x, y];
};
/** eyes that blink by themselves: the upper lid's extra closing at time t (0..1); seed gives each figure its own rhythm.
 *  One blink is five frames at 30 a second: half lid, shut, shut, half lid, then open again (BLINK). The lid never stops between half
 *  and shut, where the eye was drawn as an empty ring, and the shut eye is held for two frames, so that no frame of a blink differs
 *  from both its neighbours while they are alike (Jesper 2026-11-20: the eye patch Short flickered at its blinks, an empty ring between
 *  two arcs; DAILY-RULES, Impossible things 9, and the flicker check scripts/flicker.py) */
export const BLINK = [0.5, 1, 1, 0.5];
export const blink = (t: number, seed = 0) => {
  const period = 2.6 + (Math.abs(Math.sin(seed * 12.9898)) * 1.8), u = (t + seed * 0.77) % period, k = Math.floor(u * 30 + 1e-6);
  return k < BLINK.length ? BLINK[k] : 0;
};
/** the mouth from the caption word timings: opens on each word and closes between words (a = start, b = end in seconds) */
export const mouthAt = (words: { a: number; b: number; w: string }[], t: number) => {
  for (const w of words) if (t >= w.a - 0.02 && t <= w.b + 0.03) {
    const n = Math.max(1, Math.round((w.b - w.a) / 0.17)), u = clamp((t - w.a) / Math.max(0.08, w.b - w.a), 0, 1);
    return 0.18 + 0.72 * Math.abs(Math.sin(Math.PI * u * n)) * Math.sin(Math.PI * clamp(u * 1.1, 0, 1)) ** 0.4;
  }
  return 0;
};

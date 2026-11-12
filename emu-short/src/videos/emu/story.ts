// Timeline of "The Great Emu War" short (Sir Digsworth): shots timed to the voice (voice/words.json), world layout
// constants, story motion (truck, mobs) and the camera grammar of the cartoon-3d-short skill: slow push-ins on every
// hold, smootherstep glides, hard cuts on big reframes, 7-frame impact kicks.
export const FPS = 30;
export const TOTAL = 1770;
export const D0 = 0; // ground height (kept for build.ts)
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 3;

// ---------------- places (metres; +z = north into the wheat, the dirt road runs along x) ----------------
export const FENCE_Z = 12;            // front edge of the wheat field (x -70..70, z 12..130)
export const GAP: [number, number] = [-4, 4]; // broken stretch of fence where the mob walks in
export const ROAD_Z = -22;
export const PAD: V3 = [-120, 0, 0];  // open paddock west of the field (fifty emus, the scatter)
export const DAM: V3 = [100, 0, -4];  // farm dam east of the field
export const FARM: V3 = [46, 0, -3];  // farmhouse, tank and windmill
export const HEAP: V3 = [12, 0, -15]; // spent cartridge heap

// ---------------- shots ----------------
export type Light = "day" | "golden";
export type ShotDef = { id: number; a: number; b: number; light: Light; sunAz?: number; sunEl?: number };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 152, light: "day" },       // hook: Sir Digsworth, the stand-off, the stare, "And lost."
  { id: 2, a: 152, b: 356, light: "day" },     // 20,000 emus march into the wheat and eat it
  { id: 3, a: 356, b: 428, light: "day" },     // the farmers beg
  { id: 4, a: 428, b: 562, light: "day" },     // one major, two soldiers, two machine guns
  { id: 5, a: 562, b: 664, light: "day" },     // fifty emus, open fire
  { id: 6, a: 664, b: 746, light: "day" },     // the emus ran, in every direction
  { id: 7, a: 746, b: 878, light: "day", sunAz: 150, sunEl: 50 },     // ambush by the dam, a thousand walk up
  { id: 8, a: 878, b: 950, light: "day" },     // the gun fired, and jammed
  { id: 9, a: 950, b: 1043, light: "day" },    // gun on a lorry, the chase
  { id: 10, a: 1043, b: 1180, light: "day" },  // too slow, too bumpy
  { id: 11, a: 1180, b: 1314, light: "golden", sunAz: 125, sunEl: 20 }, // one week, 2,500 bullets, the army went home
  { id: 12, a: 1314, b: 1452, light: "day" },  // second try, ten bullets per bird
  { id: 13, a: 1452, b: 1575, light: "day" },  // the major: like tanks
  { id: 14, a: 1575, b: 1670, light: "golden", sunAz: 165, sunEl: 20 }, // the army left, the emus stayed
  { id: 15, a: 1670, b: TOTAL, light: "golden", sunAz: 135, sunEl: 20 }, // emus one, Australia nil
];
export const XFADE: Record<number, number> = { 11: 8, 12: 8, 14: 8 };
export const FLASH_AT = 148;
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

// ---------------- story motion ----------------
/** the lorry on the road (shots 9-10): x of its rear axle; it chases east (+x) */
export const CHASE0 = 950;
export const truckX = (f: number) => -30 + 7.2 * Math.max(0, (f - 985) / FPS) * smooth((f - 985) / 20);
/** the chased emus pull away from f 1043 */
export const chaseEmuX = (f: number, i: number) => truckX(f) + 7.5 + i * 1.5 + (f > 1043 ? 3.4 * ((f - 1043) / FPS) : 0);
/** lorry bounce on the paddock ruts: vertical offset (m) and pitch (rad) */
export const truckBounce = (f: number) => {
  const k = f >= 1043 ? 1 + 1.2 * smooth((f - 1090) / 20) : 0.6, t = f / FPS;
  return { y: k * 0.085 * Math.abs(Math.sin(t * 13.0)) + k * 0.03 * Math.sin(t * 31), pitch: k * 0.035 * Math.sin(t * 13.0 + 0.8), roll: k * 0.03 * Math.sin(t * 9.1) };
};
/** shot 14: the lorry leaves west along the road */
export const leaveX = (f: number) => 6 - 9 * ((f - 1575) / FPS);
/** gun firing windows (frames) */
export const FIRE5: [number, number] = [625, 664];
export const FIRE8: [number, number] = [893, 921];
export const JAM = 925;
export const firing = (f: number) => (f >= FIRE5[0] && f < FIRE5[1]) || (f >= FIRE8[0] && f < FIRE8[1]);

// ---------------- camera ----------------
// Grammar (motion.md): every move is a symmetric smootherstep glide of 18-40 f (peak speed = 1.875 x distance / dur,
// so dur >= 0.075 x the move in 720p px keeps the peak near the reference 14-25 px/f); a reframe bigger than about
// half a frame width or 40 % zoom is a hard cut on its key frame. Glides are centred on the old key frame (the
// whoosh in the sound mix peaks there), so a glide key starts dur/2 earlier. Holds push in (dolly toward the look
// point or a fov zoom near walls/towers): 0.15-0.35 %/f, ~0.6 %/f for ~35 f on the punch words. Rolls of 4-8 deg
// over >= 18 f on emphasis beats, held tilt <= 0.07 rad.
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
/** reference camera ease: symmetric smootherstep (attack = release, ~10 f each on a 23 f move) */
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
const T = (f: number) => f / FPS;
/** push-in factor since f0: the subject grows ~rate per frame; `punch` raises it (with 8 f soft edges) for the first n frames */
const pushK = (f: number, f0: number, rate: number, punch = 0, n = 35) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
/** dolly push: camera slides toward the look point by factor k */
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
/** zoom push (camera stays put, for lenses next to towers / houses): tan(fov/2) shrinks by k */
const zoom = (pos: V3, look: V3, fov: number, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos, look, fov: (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) * k), ...rest });
/** a roll-only move on top of an existing framing */
const rolled = (s: (f: number) => Shot, roll: number) => (f: number): Shot => ({ ...s(f), roll });


// ---- framings ----
const st = (pos: V3, look: V3, fov: number, f0: number, rate = 0.002, rest: Partial<Cam> = {}, punch = 0) => (f: number): Shot => dolly(pos, look, pushK(f, f0, rate, punch), { fov, ...rest });
const zm = (pos: V3, look: V3, fov: number, f0: number, rate = 0.002, rest: Partial<Cam> = {}) => (f: number): Shot => zoom(pos, look, fov, pushK(f, f0, rate), rest);
const P = PAD[0], DX = DAM[0], DZ = DAM[2];
const CAMS: Record<number, Key[]> = {
  1: [
    { f: 0, s: st([0.0, 1.75, -7.6], [-0.75, 1.25, 4], 40, 0, 0.0011) },          // Sir Digsworth presenting the stand-off
    { f: 87, cut: true, s: st([0.3, 1.5, 3.0], [0, 1.45, 6], 30, 87, 0.003, { roll: -0.03 }) }, // "emus": the stare
    { f: 125, cut: true, s: st([0.1, 1.3, -2.8], [-0.1, 1.0, 5.2], 44, 125, 0.004, { roll: 0.03 }) }, // "And lost."
  ],
  2: [
    { f: 152, s: zm([40, 24, -34], [-2, 0, -2], 40, 152, 0.0016) },                // the mob marching on the wheat
    { f: 232, cut: true, s: st([9.5, 3.2, -1.5], [0, 1.0, 9], 42, 232, 0.002) },   // streaming through the broken fence
    { f: 296, cut: true, s: st([0.3, 1.25, 5.4], [0.05, 0.85, 13.6], 44, 296, 0.0025, { roll: 0.03 }) }, // "eating everything"
  ],
  3: [{ f: 356, s: st([FARM[0] - 5.4, 1.6, FARM[2] - 10.6], [FARM[0] - 4.6, 1.3, FARM[2] - 2.4], 40, 356, 0.003) }],
  4: [
    { f: 428, s: st([0.0, 1.5, ROAD_Z - 11.4], [0, 1.15, ROAD_Z], 36, 428, 0.0008) },
    { f: 518, dur: 26, s: st([0.0, 1.35, ROAD_Z - 10.9], [0, 1.1, ROAD_Z], 36, 518, 0.0008, { roll: 0.025 }) },
  ],
  5: [
    { f: 562, s: st([P + 0.3, 2.4, -12], [P - 1.2, 1.1, 4], 42, 562, 0.002) },  // over the gun crew at the mob
    { f: 622, dur: 20, s: st([P + 0.2, 2.0, -11], [P - 1.3, 1.0, 4], 42, 622, 0.0015, { roll: -0.035 }, 0.004) }, // "opened fire"
  ],
  6: [
    { f: 664, s: zm([P - 4.5, 20, -10], [P - 4.5, 0, 9], 40, 664, 0.0012) },                  // the scatter from above
    { f: 700, cut: true, s: st([P - 0.1, 1.35, -8.7], [P - 0.2, 1.1, -3.5], 38, 700, 0.0025, { roll: 0.03 }) }, // the crew, emus streaking past
  ],
  7: [
    { f: 746, s: st([DX + 10, 7, DZ - 30], [DX, 0.5, DZ - 9], 42, 746, 0.0022) }, // the dam and the hidden gun
    { f: 806, cut: true, s: st([DX - 0.7, 2.7, DZ - 21.6], [DX - 0.55, 1.1, DZ + 4], 44, 806, 0.0016) }, // over the gun: the thousand
  ],
  8: [
    { f: 878, s: st([DX + 2.7, 1.8, DZ - 15.6], [DX + 0.05, 1.27, DZ - 14.3], 36, 878, 0.002, {}, 0.005) }, // the gun, side on
    { f: 936, cut: true, s: st([DX + 0.2, 1.5, DZ - 2.0], [DX, 1.55, DZ + 14.5], 30, 936, 0.004) }, // the emus stare
  ],
  9: [
    { f: 950, s: st([-22.6, 1.9, ROAD_Z - 9.0], [-28.0, 1.35, ROAD_Z], 44, 950, 0.002) }, // gun on a lorry
    { f: 1004, cut: true, s: (f) => { const x = truckX(f); return { pos: [x + 19, 1.5, ROAD_Z - 1.1], look: [x + 4, 1.25, ROAD_Z + 0.1], fov: 40 }; } }, // chase toward the lens
  ],
  10: [
    { f: 1043, s: (f) => { const x = truckX(f); return { pos: [x + 20.5, 1.7, ROAD_Z - 1.6], look: [x + 5, 1.2, ROAD_Z + 0.2], fov: 40, roll: -0.03 }; } },
    { f: 1100, cut: true, s: (f) => { const x = truckX(f), k = pushK(f, 1100, 0.002); return { pos: [x + 3.9 - 0.6 * (1 - k) * 5, 2.35, ROAD_Z - 5.6 * k], look: [x + 1.2, 2.0, ROAD_Z], fov: 40, roll: 0.035 * Math.sin((f - 1100) / 30) }; } },
  ],
  11: [
    { f: 1180, s: st([HEAP[0] + 1.55, 0.8, HEAP[2] - 3.5], [HEAP[0] + 1.05, 0.42, HEAP[2] - 0.9], 40, 1180, 0.002) }, // tally crate + brass
    { f: 1218, dur: 34, s: st([HEAP[0] + 0.3, 2.0, HEAP[2] - 6.6], [HEAP[0], 0.8, HEAP[2] + 1.2], 42, 1218, 0.0015) }, // pull back: the heap, the crew
    { f: 1272, cut: true, s: st([-3.5, 1.7, ROAD_Z - 9.5], [-11, 1.3, ROAD_Z], 42, 1272, 0.002) }, // went home
  ],
  12: [
    { f: 1314, s: st([-8.6, 1.25, ROAD_Z - 0.9], [-17, 1.35, ROAD_Z], 40, 1314, 0.0005) }, // they came back
    { f: 1378, cut: true, s: st([HEAP[0] - 9.9, 1.32, HEAP[2] - 4.6], [HEAP[0] - 10, 1.18, HEAP[2]], 38, 1378, 0.0012) }, // ten bullets, one bird
  ],
  13: [
    { f: 1452, s: st([0.3, 1.6, ROAD_Z - 4.4], [-0.15, 1.45, ROAD_Z], 34, 1452, 0.003) }, // the major
    { f: 1505, cut: true, s: st([0.5, 0.7, 2.0], [0, 1.2, 7], 42, 1505, 0.001, { roll: -0.035 }) }, // like tanks
  ],
  14: [
    { f: 1575, s: st([9.5, 1.5, ROAD_Z - 1.2], [-20, 1.6, ROAD_Z + 0.4], 42, 1575, 0.001) }, // the lorry leaves
    { f: 1632, cut: true, s: st([-1.6, 1.2, 7.4], [0.3, 0.95, 13.8], 40, 1632, 0.003) },   // the emus stayed
  ],
  15: [
    { f: 1670, s: st([0.2, 1.7, -10.2], [0.15, 1.75, -3], 40, 1670, 0.0018) },
    { f: 1700, dur: 24, s: st([0.2, 1.7, -9.8], [0.15, 1.75, -3], 40, 1700, 0.0015, { roll: 0.025 }) },
  ],
};

// impact kicks (reference v14): the image offset flips sign every frame (~3 px at 720p per unit), decays to 0 in
// 7 f, roll +-0.23 deg per unit; they start on the first frame at/after the event. No hand-held float.
const KICKS: [number, number][] = [[4.18, 1.2], [15.17, 0.7], [16.2, 0.7], [17.47, 1.0], [20.85, 0.8], [29.9, 0.6], [30.84, 1.3], [55.79, 0.7], [56.77, 0.7]];
export const kickAt = (t: number) => {
  let a = 0;
  for (const [t0, g] of KICKS) {
    const n = Math.floor((t - t0) * FPS + 1e-6);
    if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  return a;
};
export const camAt = (id: number, f: number): Cam => {
  const c = run(CAMS[id], f), a = kickAt(T(f));
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a; // metres at the look distance for 3 px x a
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};
/** frame at which the current key's move has finished (for picking billboard views per key, not per frame) */
export const keyEnd = (id: number, f: number) => {
  let e = 0;
  for (const k of CAMS[id]) if (f >= k.f) e = k.f + (k.cut ? 0 : k.dur ?? 24);
  return Math.max(f, e);
};


// ---------------- lens ----------------
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
export const DOF: Dof[] = [
  { f: 0, cInf: 7, focus: () => [0.45, 1.7, -3.2] },     // Sir Digsworth sharp, the stand-off a little soft
  { f: 87, cInf: 14 },                                    // the stare
  { f: 125, cInf: 10 },
  { f: 152, cInf: 0 },                                    // aerial + fence
  { f: 296, cInf: 12 },                                   // eating MS
  { f: 356, cInf: 9 },                                    // farmers
  { f: 428, cInf: 8 },                                    // line-up
  { f: 562, cInf: 0 },                                    // paddock wides
  { f: 700, cInf: 11 },                                   // crew MS
  { f: 746, cInf: 0 },                                    // dam wide
  { f: 806, cInf: 3, focus: () => [DAM[0], 1.3, DAM[2] + 13] },
  { f: 878, cInf: 14 },                                   // gun insert
  { f: 936, cInf: 12 },
  { f: 950, cInf: 7 },
  { f: 1004, cInf: 0 },
  { f: 1100, cInf: 9 },                                   // on the lorry
  { f: 1180, cInf: 13 },                                  // brass insert
  { f: 1218, dur: 34, cInf: 8 },
  { f: 1272, cInf: 0 },
  { f: 1378, cInf: 10 },
  { f: 1452, cInf: 13 },                                  // the major
  { f: 1505, cInf: 9, focus: () => [0, 1.3, 6.5] },
  { f: 1575, cInf: 0 },
  { f: 1632, cInf: 11 },
  { f: 1670, cInf: 9 },
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
/** what the lens focuses on (DOF): the DOF table's focus point, else the camera look point */
export const focusAt = (id: number, f: number): V3 => {
  const d = dofAt(f);
  return d.focus ? d.focus(f) : camAt(id, f).look;
};



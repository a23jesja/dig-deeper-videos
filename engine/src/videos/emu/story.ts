// Timeline of "The Great Emu War" short: shots timed to the voice words (voice/emu-short/words.json, frame numbers
// at 30 fps in the comments), the places everything stands, and the camera grammar of the engine: continuous slow
// push-ins, symmetric smootherstep glides of 18-40 f, hard cuts on big reframes, 7-frame kicks on impacts.
export const FPS = 30;
export const TOTAL = 1650;
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 3;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 0 -> 1 between frames a and b (smooth) */
export const ramp = (f: number, a: number, b: number) => smooth((f - a) / (b - a));

// ---------------- words (frame each word starts) ----------------
export const F = {
  // "In 1932, Australia sent its army to war against twenty thousand emus."
  australia: 46, army1: 74, against: 95, twenty: 113, emus1: 136,
  // "The emus won."
  the_emus_won: 163, won: 181,
  // "Twenty thousand hungry emus had marched onto the wheat farms of Western Australia, eating everything in sight."
  farm: 209, marched: 268, wheat: 292, western: 318, eating: 359, sight: 391,
  // "So the army sent one major, two soldiers, two machine guns and ten thousand bullets."
  so: 408, one: 431, major: 439, two_soldiers: 463, soldiers: 467, two_guns: 492, guns: 503, ten: 528, bullets: 544,
  // "Easy, right?"
  easy: 571, right: 582,
  // "But when the guns opened fire, the emus split into small groups and ran in every direction."
  but: 606, opened: 623, fire: 637, the_emus: 662, split: 675, groups: 699, ran: 722, direction: 746,
  // "So the major set an ambush at a dam."
  dam1: 771, ambush: 803, dam: 827,
  // "A thousand emus walked straight towards the gun,"
  thousand: 843, walked: 874, gun: 913,
  // "and it jammed."
  and_it: 934, jammed: 942,
  // "Next, he put a gun on a truck."
  next: 971, put: 985, a_gun: 994, truck: 1013,
  // "But the truck couldn't catch the birds, and the ride was so bumpy the gunner never fired a shot."
  but_truck: 1030, catch_: 1051, birds: 1063, ride: 1083, bumpy: 1110, gunner: 1125, never: 1140, shot: 1163,
  // "After six days and two and a half thousand bullets, the army went home."
  after: 1180, six: 1186, days: 1194, two_and: 1208, bullets2: 1243, the_army: 1267, home: 1286,
  // "They came back for a second try."
  they: 1307, second: 1339,
  // "Final score, by the major's count: 986 emus, for nearly ten thousand bullets."
  final: 1367, by: 1397, count: 1414, n986: 1421, emus3: 1470, for_: 1489, nearly: 1499, ten2: 1507, bullets3: 1525,
  // "And the emus?" / "They're still there."
  and_the: 1554, emus4: 1563, theyre: 1591, still: 1598, there: 1605, voice_end: 1623,
};

// ---------------- shots ----------------
export type Light = "day" | "golden";
export type Zone = "camp" | "farm" | "plain" | "dam" | "track" | "office" | "dock" | "cassino" | "zoo" | "scot" | "isle";
/** height of the Monte Cassino hillside (zone "cassino") */
export const hillY = (x: number, z: number) => 62 * smooth((z - 34) / 190) ** 1.25 * Math.max(0, 1 - (x / 190) ** 2);
export type ShotDef = { id: number; name: string; a: number; b: number; zone: Zone; light: Light; sunAz?: number; sunEl?: number; horde?: boolean;
  /** a second sun set-up from frame `split` on (for a shot whose two halves look opposite ways) */
  split?: number; sunAz2?: number; sunEl2?: number };
export const SHOTS: ShotDef[] = [
  { id: 1, name: "hook: the army poses, the horde behind", a: 0, b: 95, zone: "camp", light: "day", horde: true, sunAz: 115 },
  { id: 2, name: "hook: twenty thousand emus", a: 95, b: 163, zone: "camp", light: "day", horde: true, sunAz: 115 },
  { id: 3, name: "hook: the emus won", a: 163, b: 205, zone: "camp", light: "day", sunAz: 110 },
  { id: 4, name: "emus march onto the wheat farms and eat", a: 205, b: 405, zone: "farm", light: "day", sunAz: 105 },
  { id: 5, name: "one major, two soldiers, two guns, 10,000 bullets", a: 405, b: 571, zone: "camp", light: "day", sunAz: 110 },
  { id: 6, name: "easy, right?", a: 571, b: 606, zone: "camp", light: "day", sunAz: 110 },
  { id: 7, name: "guns open fire, emus split and run", a: 606, b: 771, zone: "plain", light: "day", sunAz: 100 },
  { id: 8, name: "ambush at a dam, a thousand emus walk up", a: 771, b: 934, zone: "dam", light: "day", sunAz: 110 },
  { id: 9, name: "the gun jams", a: 934, b: 971, zone: "dam", light: "day", sunAz: 110 },
  { id: 10, name: "a gun on a truck", a: 971, b: 1030, zone: "track", light: "day", sunAz: 100 },
  { id: 11, name: "the truck cannot catch the birds", a: 1030, b: 1180, zone: "track", light: "day", sunAz: 100 },
  { id: 12, name: "six days, 2,500 bullets, the army goes home", a: 1180, b: 1307, zone: "camp", light: "golden", sunAz: 80, sunEl: 13, split: 1262, sunAz2: 5, sunEl2: 8 },
  { id: 13, name: "they come back", a: 1307, b: 1367, zone: "farm", light: "day", sunAz: 105 },
  { id: 14, name: "final score", a: 1367, b: 1554, zone: "camp", light: "day", sunAz: 110 },
  { id: 15, name: "the emus are still there", a: 1554, b: TOTAL, zone: "farm", light: "golden", sunAz: 28, sunEl: 9 },
];
/** crossfades (frames) at place / time changes; a white 4-frame flash after the hook */
export const XFADE: Record<number, number> = { 5: 8, 8: 8, 10: 6, 12: 10, 13: 8, 14: 6, 15: 10 };
export const FLASH_AT = 205;

export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
/** layers to draw at frame f: base shot, plus the next shot fading in during a crossfade */
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

// ---------------- places (metres; each zone has its own origin, y = 0 is the ground) ----------------
// camp: the trio faces the lens (south, -z); the rise with the horde starts at z = 14
export const TRIO: V3[] = [[0, 0, 0], [-1.15, 0, 0.7], [1.15, 0, 0.7]]; // major, soldier 1, soldier 2
export const CAMP_GUNS: V3[] = [[-1.35, 0, -1.9], [1.35, 0, -1.9]];
export const CRATES_AT: V3 = [0, 0, -2.7];
export const SIR_HOOK: V3 = [0, 0, -5.8];
export const WINNER: V3 = [-0.1, 0, -6.2];
export const SIR_EASY: V3 = [3.2, 0, -4.5];
export const RISE_Z0 = 14;
export const riseY = (z: number) => 15 * smooth((z - RISE_Z0) / 110) ** 1.15;
// farm: the wheat field, fence along z = 4 with a gap, house and windmill behind the field
export const FIELD = { x0: -46, x1: 46, z0: 6, z1: 76 };
export const FARMER_AT: V3 = [1.2, 0, 2.2];
export const SIR_END: V3 = [-0.5, 0, -2.2];
// plain: two guns side by side firing +z at the mob
export const PLAIN_GUNS: V3[] = [[-0.9, 0, 0], [0.9, 0, 0]];
export const MOB: V3 = [0, 0, 34];
// dam: water at (0, 20), the bank the ambush hides behind curves round the south side
export const DAM = { cx: 0, cz: 12.5, r: 4.5, bankR: 7.7, bankW: 2.8, bankH: 1.15 };
export const DAM_GUN: V3 = [0, DAM.bankH, DAM.cz - DAM.bankR + 0.1];
/** height of the dam bank at (x, z) */
export const bankY = (x: number, z: number) => {
  const dx = x - DAM.cx, dz = z - DAM.cz, r = Math.hypot(dx, dz), a = Math.atan2(dz, dx); // a in (-PI, PI], south side = negative
  if (a > -0.12 || a < -Math.PI + 0.12) return 0;
  const end = smooth(Math.min(a + Math.PI - 0.12, -0.12 - a) / 0.5);
  const u = (r - DAM.bankR) / DAM.bankW;
  return Math.abs(u) >= 1 ? 0 : DAM.bankH * end * Math.cos((Math.PI / 2) * u) ** 2;
};
// track: the truck drives along +x at z = 0
export const TRUCK_V = 7.5, EMU_V = 10.5;
/** truck x at frame f (shot 11): accelerates away from rest */
export const truckX = (f: number) => { const t = Math.max(0, (f - 1024) / FPS); return t < 1 ? 0.5 * TRUCK_V * t * t : TRUCK_V * (t - 0.5); };
export const runnersX = (f: number) => 14 + truckX(1030) + EMU_V * ((f - 1030) / FPS);
/** ground bumps the wheels hit on the track (shot 11): body bounce in metres and pitch in radians */
export const truckBounce = (f: number) => {
  if (f < 1024) return { y: 0, pitch: 0, roll: 0 };
  const t = f / FPS, k = ramp(f, 1024, 1050) * (f >= 1083 ? 1.35 : 1);
  return {
    y: k * (0.1 * Math.abs(Math.sin(t * 9.3)) + 0.09 * Math.abs(Math.sin(t * 14.9 + 1))),
    pitch: k * (0.055 * Math.sin(t * 11.1) + 0.03 * Math.sin(t * 17.3 + 2)),
    roll: k * 0.035 * Math.sin(t * 8.1 + 0.7),
  };
};

/** golden hour: where the lens stands as the army walks off, and the way they go (toward the low sun) */
export const HOME_CAM: V3 = [6.0, 2.7, -3.2];
export const HOME_DIR: [number, number] = [-0.94, 0.34];

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export type Shot = Partial<Cam> & { pos: V3; look: V3 };
export type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
/** camera ease: symmetric smootherstep */
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
export const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
/** push-in factor since f0: the subject grows ~rate per frame; `punch` raises it (8 f soft edges) for the first n frames */
export const pushK = (f: number, f0: number, rate: number, punch = 0, n = 35) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
/** dolly push: the camera slides toward the look point by factor k */
export const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
/** zoom push (the camera stays put, for shots with something close to the lens): tan(fov/2) shrinks by k */
export const zoom = (pos: V3, look: V3, fov: number, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos, look, fov: (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) * k), ...rest });
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

const CAMS: Record<number, Key[]> = {
  // 1 hook: Sir Digsworth low in the frame, the proud trio above him, the horde on the rise above them
  1: [
    { f: 0, s: (f) => dolly([0, 3.25, -10.6], [0, 1.45, 1.5], pushK(f, 0, 0.0016), { fov: 40 }) },
    { f: 52, dur: 40, s: (f) => dolly([0.25, 2.35, -5.4], [0, 1.5, 1.0], pushK(f, 52, 0.0022), { fov: 38, roll: -0.03 }) }, // "sent its army to war"
  ],
  // 2 the rise: twenty thousand emus stare down (punch push on "twenty thousand")
  2: [
    { f: 95, s: (f) => dolly([0, 3.0, 3.5], [0, 4.6, 74], pushK(f, 95, 0.0022, 0.007, 40), { fov: 47, roll: 0.035 }) },
  ],
  // 3 "the emus won": the dazed trio above, one unbothered emu looking into the lens below them
  3: [
    { f: 163, s: (f) => zoom([0, 2.6, -8.4], [-0.05, 0.95, -0.9], 36, pushK(f, 163, 0.0022), { roll: -0.03 }) },
  ],
  // 4 the farm: wide on the mob walking into the wheat -> the farmer -> pecking close-up
  4: [
    { f: 205, s: (f) => zoom([-1.0, 3.6, -5.5], [1.2, 1.5, 24], 44, pushK(f, 205, 0.0016)) },
    { f: 288, cut: true, s: (f) => dolly([FARMER_AT[0] + 0.45, 1.5, -2.6], [FARMER_AT[0], 1.22, FARMER_AT[2]], pushK(f, 288, 0.0022), { fov: 38, roll: 0.03 }) }, // "wheat farms"
    { f: 359, cut: true, s: (f) => zoom([-3.6, 1.2, 6.3], [-0.9, 0.95, 10.8], 42, pushK(f, 359, 0.002), { roll: -0.03 }) }, // "eating everything"
  ],
  // 5 the army: each thing lands on its word and the lens steps back to keep them all in frame
  5: [
    { f: 405, s: (f) => dolly([0, 1.55, -5.6], [0, 1.4, 0], pushK(f, 405, 0.0015), { fov: 38 }) },
    { f: 456, dur: 20, s: (f) => dolly([0, 1.62, -7.9], [0, 1.3, 0.3], pushK(f, 456, 0.0012), { fov: 38 }) }, // "two soldiers"
    { f: 484, dur: 20, s: (f) => dolly([0, 2.1, -9.4], [0, 0.8, -0.7], pushK(f, 484, 0.0012), { fov: 38 }) }, // "two machine guns"
    { f: 520, dur: 20, s: (f) => dolly([0, 3.0, -10.6], [0, 0.2, -1.6], pushK(f, 520, 0.0012), { fov: 40 }) }, // "ten thousand bullets"
  ],
  // 6 "Easy, right?": Sir Digsworth, close
  6: [
    { f: 571, s: (f) => dolly([SIR_EASY[0] + 0.22, 1.5, SIR_EASY[2] - 2.9], [SIR_EASY[0], 1.2, SIR_EASY[2]], pushK(f, 571, 0.003), { fov: 36, roll: 0.03 }) },
  ],
  // 7 the plain: the guns fire -> from above the mob bursts into groups -> low among the runners
  7: [
    { f: 606, s: (f) => dolly([5.4, 1.5, -4.2], [0.15, 1.12, 0.1], pushK(f, 606, 0.002), { fov: 44, roll: -0.03 }) },
    { f: 656, cut: true, s: (f) => dolly([0, 9.5, 18.5], [0, 0.6, 34], pushK(f, 656, 0.0008), { fov: 46 }) }, // "the emus split"
    { f: 722, cut: true, s: (f) => dolly([-3.2, 1.05, 21.5], [2.5, 1.35, 35], pushK(f, 722, 0.0018), { fov: 44, roll: 0.045 }) }, // "ran in every direction"
  ],
  // 8 the dam: behind the ambush looking over the bank and the water -> down the gun at the thousand walking up
  8: [
    { f: 771, s: (f) => zoom([0.3, 2.55, -2.6], [0, 1.25, 9], 42, pushK(f, 771, 0.0018)) },
    { f: 843, cut: true, s: (f) => zoom([0.62, 2.42, DAM_GUN[2] - 3.3], [-0.35, 1.35, 18], 35, pushK(f, 843, 0.001, 0.003, 30)) }, // "a thousand emus"
  ],
  // 9 the jam: the gun three-quarters on, the gunner behind it
  9: [
    { f: 934, s: (f) => dolly([2.6, DAM_GUN[1] + 0.95, DAM_GUN[2] + 3.6], [0.05, DAM_GUN[1] + 0.6, DAM_GUN[2] + 0.2], pushK(f, 934, 0.0026), { fov: 44, roll: 0.03 }) },
  ],
  // 10 the truck gets its gun
  10: [
    { f: 971, s: (f) => dolly([8.6, 2.1, 7.6], [0.1, 1.45, 0], pushK(f, 971, 0.002), { fov: 44 }) },
  ],
  // 11 the chase: ahead of the birds looking back -> the bouncing truck -> the gunner
  11: [
    { f: 1030, s: (f) => { const x = runnersX(f); return { pos: [x + 6.5, 3.6, 0.7] as V3, look: [x - 8, 1.05, 0.1] as V3, fov: 44, roll: 0.03 }; } },
    { f: 1083, cut: true, s: (f) => { const x = truckX(f); return dolly([x + 8.2, 1.6, 7.0], [x + 0.1, 1.5, 0], pushK(f, 1083, 0.002), { fov: 44, roll: -0.04 }); } }, // "the ride was so bumpy"
    { f: 1125, cut: true, s: (f) => { const x = truckX(f); return zoom([x + 3.4, 2.95, 3.5], [x - 0.95, 2.12, 0], 38, pushK(f, 1125, 0.0022), { roll: 0.035 }); } }, // "the gunner"
  ],
  // 12 golden hour: the pile of brass and the tally -> the trio walks off into the sun, an emu watches
  12: [
    { f: 1180, s: (f) => dolly([1.55, 0.62, -5.3], [0.1, 0.42, -2.7], pushK(f, 1180, 0.002), { fov: 40, roll: -0.03 }) },
    { f: 1262, cut: true, s: (f) => dolly(HOME_CAM, add(HOME_CAM, [HOME_DIR[0] * 10, -1.7, HOME_DIR[1] * 10]), pushK(f, 1262, 0.0012), { fov: 42 }) }, // "the army went home"
  ],
  // 13 they march back in along the fence
  13: [
    { f: 1307, s: (f) => { const x = -2.0 + 2.2 * ((f - 1307) / 60); return dolly([x, 1.5, -4.7], [x, 1.25, 2.6], pushK(f, 1307, 0.0012), { fov: 42 }); } },
  ],
  // 14 the scoreboard -> the empty crates all around
  14: [
    { f: 1367, s: (f) => zoom([0.1, 2.3, -7.6], [0.1, 2.3, -0.6], 40, pushK(f, 1367, 0.0012)) },
    { f: 1483, cut: true, s: (f) => zoom([0, 2.9, -11.2], [-0.45, 2.5, -1.4], 44, pushK(f, 1483, 0.0016), { roll: -0.03 }) }, // "for nearly ten thousand bullets"
  ],
  // 15 Sir Digsworth by the fence -> up and over him to the field full of emus
  15: [
    { f: 1554, s: (f) => dolly([SIR_END[0] + 0.5, 1.5, -5.3], [SIR_END[0] + 0.1, 1.2, SIR_END[2]], pushK(f, 1554, 0.002), { fov: 38 }) },
    { f: 1584, dur: 36, s: (f) => dolly([0, 2.9, -8.0], [0.1, 0.9, 16], pushK(f, 1584, 0.0004), { fov: 42 }) }, // "They're still there."
  ],
};

// impact kicks: the image offset flips sign every frame and decays to 0 in 7 f
const KICKS: [number, number][] = [
  [436, 0.5], [465, 0.4], [470, 0.4], [493, 0.5], [499, 0.5], [534, 0.9], // things landing in the army shot
  [623, 0.5], [630, 0.5], [637, 0.6], [644, 0.5], [651, 0.5], // guns firing
  [916, 0.5], [922, 0.5], [928, 0.5], [942, 1.2], // dam: three bursts, then the jam
  [1001, 0.8], // gun dropped on the truck bed
  [1090, 0.9], [1101, 0.8], [1110, 1.2], [1120, 0.8], [1133, 0.9], [1146, 1.0], [1157, 0.8], [1168, 0.9], // bumps
  [1421, 0.5], [1437, 0.5], [1453, 0.7], // chalk
];
export const kickAt = (f: number) => {
  let a = 0;
  for (const [f0, g] of KICKS) { const n = f - f0; if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5; }
  return a;
};
/** adds an impact kick of strength a to a camera */
export const kicked = (c: Cam, a: number): Cam => {
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a;
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};
export const camAt = (id: number, f: number): Cam => kicked(run(CAMS[id], f), kickAt(f));
/** the lens table -> lens at frame f (shared by every film) */
export const dofFrom = (TABLE: Dof[]) => (f: number) => {
  let i = 0; while (i + 1 < TABLE.length && f >= TABLE[i + 1].f) i++;
  const d = TABLE[i], p = TABLE[Math.max(0, i - 1)];
  const k = d.dur ? glide((f - d.f) / d.dur) : 1;
  const fa = d.focus, fb = p.focus;
  const focus = !fa ? undefined : d.dur && fb && k < 1 ? (ff: number): V3 => { const a = fb(ff), b = fa(ff); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]; } : fa;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus };
};
/** shots + crossfades -> layers to draw at frame f */
export const layersFrom = (shots: ShotDef[], xfade: Record<number, number>) => (f: number): { id: number; alpha: number }[] => {
  for (const s of shots) {
    const x = xfade[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: (shots.find((s) => f >= s.a && f < s.b) ?? shots[shots.length - 1]).id, alpha: 1 }];
};

// ---------------- lens: depth of field ----------------
/** cInf = blur-disc radius in px at 1080x1920 for things at infinity; 0 = all sharp. focus = world point (else the look point) */
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
export const DOF: Dof[] = [
  { f: 0, cInf: 9, focus: () => add(SIR_HOOK, [0, 1.6, 0]) },          // Sir Digsworth sharp, the army and the horde soft
  { f: 52, dur: 40, cInf: 7, focus: () => [0, 1.6, 0] },               // rack to the trio
  { f: 95, cInf: 0 },                                                   // the horde: all sharp
  { f: 163, cInf: 5, focus: () => add(WINNER, [0, 1.6, 0]) },         // the winner
  { f: 205, cInf: 0 },                                                  // farm wide
  { f: 288, cInf: 12, focus: () => add(FARMER_AT, [0, 1.6, 0]) },      // the farmer
  { f: 359, cInf: 9, focus: () => [-1.4, 1.0, 10.2] },                // pecking close-up
  { f: 405, cInf: 5, focus: () => [0, 1.5, 0] },                       // the army line-up
  { f: 571, cInf: 14, focus: () => add(SIR_EASY, [0, 1.6, 0]) },       // Sir Digsworth
  { f: 606, cInf: 8, focus: () => [0, 1.2, 0] },                       // guns firing
  { f: 656, cInf: 0 },                                                  // aerial
  { f: 722, cInf: 6, focus: () => [1.5, 1.2, 31] },                    // among the runners
  { f: 771, cInf: 3, focus: () => [0, 1.6, DAM_GUN[2]] },                       // ambush wide
  { f: 843, cInf: 5, focus: () => [0, 1.3, 18] },                     // the thousand (gun in front is soft)
  { f: 934, cInf: 9, focus: () => [0, 1.7, DAM_GUN[2] - 0.3] },                    // the jam
  { f: 971, cInf: 6, focus: () => [0, 1.5, 0] },                       // truck
  { f: 1030, cInf: 4, focus: (f) => [runnersX(f), 1.3, 1] },           // the birds in front, the truck behind
  { f: 1083, cInf: 5, focus: (f) => [truckX(f), 1.5, 0] },
  { f: 1125, cInf: 10, focus: (f) => [truckX(f) - 1.2, 2.5, 0] },     // the gunner
  { f: 1180, cInf: 13, focus: () => [0.1, 0.3, -2.7] },                // the brass
  { f: 1262, cInf: 4, focus: () => [HOME_CAM[0] + HOME_DIR[0] * 2.6, 1.7, HOME_CAM[2] + HOME_DIR[1] * 2.6] },                   // walking home
  { f: 1307, cInf: 7, focus: (f) => [-2.0 + 2.2 * ((f - 1307) / 60), 1.4, 2.6] },
  { f: 1367, cInf: 4, focus: () => [0, 2.2, -0.6] },                   // scoreboard
  { f: 1483, cInf: 0 },
  { f: 1554, cInf: 12, focus: () => add(SIR_END, [0, 1.6, 0]) },       // Sir Digsworth
  { f: 1584, dur: 36, cInf: 3, focus: () => [0, 1.5, 3] },          // the field behind him
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? glide((f - d.f) / d.dur) : 1;
  const fa = d.focus, fb = p.focus;
  const focus = !fa ? undefined : d.dur && fb && k < 1 ? (ff: number): V3 => { const a = fb(ff), b = fa(ff); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]; } : fa;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus };
};

// What happens in every shot of "The Great Emu War", frame by frame: who stands where, what they do on which
// word, where the guns point, when crates land, what the board says and which wheat has been eaten.
// Pure functions of (shot id, frame); world.ts turns the result into meshes.
import { Pen, fxBurst, fxPuff, fxStars, SIR_DIGSWORTH, MAJOR, DIGGER, DIGGER2, FARMER, Expr, FrontOpts, SideOpts, Outfit } from "./toon";
import { EmuOpts, EmuExpr, EMU_WALK_M, EMU_RUN_M, fxDust, fxMuzzle, fxFeather, fxBang, fxSmoke, fxCase } from "./emutoon";
import { Stage, CamInfo, person, emu, hh, q, lidAt, SU } from "./castbase";
import {
  FPS, F, V3, clamp01, smooth, lerp, ramp, TRIO, CAMP_GUNS, CRATES_AT, SIR_HOOK, WINNER, SIR_EASY, RISE_Z0, riseY, FIELD, FARMER_AT, SIR_END,
  PLAIN_GUNS, MOB, DAM, DAM_GUN, bankY, truckX, runnersX, truckBounce, EMU_V, HOME_CAM, HOME_DIR,
} from "./story";
import talkJson from "./talk.json";

const TALK = talkJson as number[];
export const talkAt = (f: number) => TALK[Math.max(0, Math.min(TALK.length - 1, f))] ?? 0;

// ---------------- prop state ----------------
export type GunS = { pos: V3; yaw: number; pitch?: number; roll?: number; recoil?: number; h?: number; legs?: boolean };
export type CrateS = { pos: V3; yaw: number };
export type TruckS = { x: number; z: number; yaw: number; y: number; pitch: number; roll: number; wheel: number; wheelY: number[]; gunPitch: number; gunYaw: number; gunLift: number };
export type BoardS = { pos: V3; key: string; draw: (g: CanvasRenderingContext2D) => void };
export type Scene = Stage & { guns: GunS[]; crates: CrateS[]; truck?: TruckS; board?: BoardS; tally?: { pos: V3; n: number }; brass?: boolean; aftermath?: boolean; fan: number };

const SIR = { i: 3, o: SIR_DIGSWORTH, okey: "sir" };
const WHO: Record<"major" | "s1" | "s2" | "farmer", { i: number; o: Outfit; okey: string }> = {
  major: { i: 2, o: MAJOR, okey: "major" }, s1: { i: 4, o: DIGGER, okey: "dig1" }, s2: { i: 6, o: DIGGER2, okey: "dig2" }, farmer: { i: 5, o: FARMER, okey: "farmer" },
};
const TR = ["major", "s1", "s2"] as const;
const T = (f: number) => f / FPS;
/** falls in from above and lands at `land` with one small rebound; returns the height above the ground, or -1 before it appears */
const dropY = (f: number, land: number, from = 1.5) => {
  const n = f - (land - 6);
  if (n < 0) return -1;
  if (n < 6) return from * (1 - (n / 6) ** 2);
  const m = n - 6;
  return m < 6 ? 0.1 * Math.sin((Math.PI * m) / 6) : 0;
};
const dust = (out: Stage, f: number, f0: number, x: number, y: number, z: number, s = 1, dur = 12) => {
  const u = (f - f0) / dur;
  if (u < 0 || u >= 1) return;
  out.fx.push({ key: `dust${q(u, 12)}`, cw: 300, ch: 300, draw: (p) => fxDust(p, q(u, 12)), x, y: y + 0.32 * s, z, w: 1.5 * s, h: 1.5 * s, soft: true, opacity: 0.85 * (1 - u) ** 0.8 });
};
const sirAt = (out: Stage, cam: CamInfo, f: number, at: V3, fo: FrontOpts) =>
  person(out, cam, SIR, at[0], at[1], at[2], { fo: { mode: "stand", blink: lidAt(T(f), 3), ...fo }, talk: talkAt(f) });
/** muzzle flash + recoil for a gun that fires on the given frames (each shot shows 2 frames) */
const firing = (f: number, shots: number[]) => { for (const s of shots) if (f >= s && f < s + 2) return f - s + 1; return 0; };
const burst = (a: number, b: number, step = 3, off = 0) => { const o: number[] = []; for (let x = a + off; x < b; x += step) o.push(x); return o; };
const flash = (out: Stage, k: number, at: V3, s = 1) => {
  if (!k) return;
  out.fx.push({ key: `muzzle${k}`, cw: 300, ch: 300, draw: (p) => fxMuzzle(p, k), x: at[0], y: at[1], z: at[2], w: 0.95 * s, h: 0.95 * s });
};
const emuBlink = (f: number, i: number) => lidAt(T(f), i + 50);

// ---------------- the wheat ----------------
/** how far the mob has eaten into the field (everything at larger x is stubble) */
const frontier = (z: number, f: number) => 4.5 - 1.3 * T(Math.min(f, 359) - 205) + 2.2 * Math.sin(z * 0.37) + 1.1 * Math.sin(z * 1.3 + 1);
/** the three birds of the pecking close-up */
const PECKERS: { x: number; z: number; off: number }[] = [{ x: -1.4, z: 10.2, off: 0 }, { x: 0.25, z: 11.6, off: 11 }, { x: 1.9, z: 13.0, off: 21 }];
/** close-up: the standing wheat ends on a line that runs just in front of the three bills; the ground toward the lens is already stubble */
const cuEdge = (z: number) => -2.45 + 1.18 * (z - 10.2);
const PECK_N = 30;
/** peck cycle: 0 up .. 1 down, two jabs while down, a swallow on the way up */
const peckAt = (n: number) => {
  const c = ((n % PECK_N) + PECK_N) % PECK_N;
  const k = c < 8 ? smooth(c / 8) : c < 18 ? 1 : c < 25 ? 1 - smooth((c - 18) / 7) : 0;
  const jab = c >= 8 && c < 18 ? Math.sin(((c - 8) / 5) * Math.PI * 2) : 0;
  const gulp = c >= 22 ? (c - 22) / 8 : -1;
  return { k, jab, gulp, cyc: Math.floor(n / PECK_N), c };
};
/** 1 = standing wheat, 0 = eaten (stubble), in between while a clump is being pulled down */
export const wheatAt = (id: number, f: number, x: number, z: number) => {
  if (id === 13 || id === 15) return x < -34 + 3 * Math.sin(z * 0.4) ? 1 : 0;
  if (id !== 4) return 1;
  if (f >= 359) {
    if (z < 9.3 || x > cuEdge(z)) { if (x > -9 && z < 17) return 0; }
  } else if (x > frontier(z, f)) return 0;
  if (f >= 359 && x > frontier(z, f) && !(x > -9 && z < 17)) return 0;
  if (f >= 359) for (const p of PECKERS) {
    // each bird clears the clumps right in front of its bill, one bite per jab
    const dx = x - (p.x - 1.3), dz = z - p.z, d = Math.hypot(dx * 0.8, dz);
    if (d < 1.0) { const bite = Math.floor(d / 0.4), at = 359 + p.off + 10 + bite * 5 - 30; if (f >= at) return 1 - clamp01((f - at) / 3); }
  }
  return 1;
};

// ---------------- instanced crowds ----------------
export type CrowdSpec = { n: number; view: "front" | "side"; buckets: number; k: number;
  at: (i: number) => { x: number; y: number; z: number; s: number; mirror?: boolean } | null; pose: (b: number) => EmuOpts };
const HORDE_N = 2600;
export const crowdFor = (id: number, f: number): CrowdSpec | null => {
  if (id === 1 || id === 2) return {
    n: HORDE_N, view: "front", buckets: 6, k: 0.42,
    at: (i) => {
      const u = hh(i, 1), z = RISE_Z0 + 2 + 104 * u ** 1.25, x = (hh(i, 2) - 0.5) * 2 * (20 + (z - RISE_Z0) * 0.95);
      if (z < RISE_Z0 + 13 && Math.abs(x) < 17) return null; // the front rows are individual actors
      return { x, y: riseY(z), z, s: 0.9 + 0.2 * hh(i, 3) };
    },
    pose: (b) => ({ mode: "stand", expr: "deadpan", seed: b + 1, nod: 5 * Math.sin(f / 23 + b * 1.9), blink: lidAt(T(f), 200 + b) }),
  };
  if (id === 4 || id === 13 || id === 15) return {
    n: id === 4 ? 520 : 700, view: "side", buckets: 8, k: 0.36,
    at: (i) => {
      const z = (id === 4 ? 27 : 19) + (FIELD.z1 - 2 - (id === 4 ? 27 : 19)) * hh(i, 4) ** 0.8, x0 = id === 4 ? frontier(z, f) + 1.5 : -30;
      const x = x0 + (FIELD.x1 - 1 - x0) * hh(i, 5);
      return { x, y: 0, z, s: 0.9 + 0.2 * hh(i, 6), mirror: hh(i, 7) > 0.5 };
    },
    pose: (b) => { const p = peckAt(f + b * 4 + (b % 3) * 7); return { mode: "peck", peck: p.k, jab: p.jab, reach: 150, seed: b + 1, expr: "calm" }; },
  };
  if (id === 8 && f >= 843) return {
    n: 960, view: "front", buckets: 8, k: 0.36,
    at: (i) => {
      const lead = damLead(f), depth = 3 + 62 * hh(i, 8) ** 0.85, z = lead + depth, x = (hh(i, 9) - 0.5) * 2 * (5 + depth * 0.42);
      return { x, y: 0, z, s: 0.9 + 0.2 * hh(i, 10) };
    },
    pose: (b) => ({ mode: f >= 920 ? "stand" : "walk", phase: damPhase(f) + b / 8, seed: b + 1, expr: f >= 920 ? "alarm" : "deadpan" }),
  };
  return null;
};
/** z of the front rank of the thousand walking up to the dam: they stop when the gun opens up */
const damLead = (f: number) => 22.6 - 1.9 * T(Math.min(f, 920) - 843);
const damPhase = (f: number) => (1.9 * T(Math.min(f, 920) - 771)) / EMU_WALK_M;

// ---------------- the shots ----------------
export const sceneAt = (id: number, f: number, cam: CamInfo): Scene => {
  const out: Scene = { places: [], fx: [], guns: [], crates: [], fan: f * 0.07 };
  const t = T(f);
  const trio = (pos: V3[], fo: (k: number) => FrontOpts) => TR.forEach((n, k) => person(out, cam, WHO[n], pos[k][0], pos[k][1], pos[k][2], { fo: { mode: "stand", blink: lidAt(t, 10 + k), ...fo(k) } }));
  switch (id) {
    case 1: case 2: {
      // the proud trio and their two guns; Sir Digsworth in front (shot 1); the horde's front rows as actors
      if (id === 1) {
        sirAt(out, cam, f, SIR_HOOK, { expr: f < F.australia ? "neutral" : "smile", point: f >= 40 ? q(ramp(f, 40, 50), 4) : undefined });
        trio(TRIO, (k) => ({ expr: k === 0 ? "stern" : k === 1 ? "smile" : "neutral" }));
        CAMP_GUNS.forEach((g, k) => out.guns.push({ pos: g, yaw: Math.PI + (k ? -0.5 : 0.5) }));
      }
      for (let i = 0; i < 64; i++) {
        const row = i % 4, z = RISE_Z0 + 1.2 + row * 3.1 + hh(i, 21) * 1.4, x = (((i >> 2) + 0.5) / 16 - 0.5) * 32 + (row % 2) * 1.1 + (hh(i, 22) - 0.5) * 0.8;
        emu(out, cam, { i, x, y: riseY(z), z, dx: 0, dz: -1, view: "front", mode: "stand", expr: "deadpan", blink: emuBlink(f, i),
          nod: 5 * Math.sin(f / 21 + i * 1.3) + (id === 2 && f >= F.emus1 ? 4 : 0), shadow: z < RISE_Z0 + 8 });
      }
      break;
    }
    case 3: {
      // "The emus won.": the dazed trio sits in a row with stars, their guns knocked over; below them, close to the
      // lens, one unbothered emu looks straight at us
      const ex: Expr[] = ["dazed", "pained", "dazed"];
      TR.forEach((n, k) => {
        const p = TRIO[k], x = p[0] * 1.05, z = 2.6 + p[2] * 0.4;
        person(out, cam, WHO[n], x, 0, z, { fo: { mode: "sit", expr: ex[k], blink: 0 } });
        const u = q((t * 0.9 + k * 0.33) % 1, 30);
        out.fx.push({ key: `stars${u}`, cw: 420, ch: 210, draw: (pp) => fxStars(pp, u), x, y: 1.4, z, w: 0.78, h: 0.39 });
      });
      out.guns.push({ pos: [-2.25, 0.12, 1.6], yaw: 2.2, roll: 1.35 }, { pos: [2.3, 0.12, 1.9], yaw: 3.9, roll: -1.35 });
      emu(out, cam, { i: 2, x: WINNER[0], z: WINNER[2], dx: 0, dz: -1, view: "front", mode: "stand", scale: 1.0,
        expr: f >= F.won ? "smug" : "deadpan", blink: f >= F.won + 6 && f < F.won + 12 ? [0.5, 1, 1, 1, 1, 0.5][f - F.won - 6] : 0, nod: f >= F.won ? 5 : 0 });
      for (let k = 0; k < 3; k++) { // a few feathers drift down between them
        const u = ((f - 150 + k * 23) % 70) / 70;
        out.fx.push({ key: "feather", cw: 200, ch: 120, draw: fxFeather, x: -1.5 + k * 1.5 + 0.25 * Math.sin(u * 7 + k), y: 3.0 - 2.9 * u, z: 0.2 + 0.3 * k, w: 0.34, h: 0.2, rot: 0.6 * Math.sin(u * 9 + k) });
      }
      break;
    }
    case 4: {
      // the mob walks into the wheat (leaders at the eating front), the rest peck in the stubble behind them
      const wideF = Math.min(f, 359);
      for (let i = 0; i < 42; i++) { // leaders, walking -x with the front
        const z = 7.2 + (i % 14) * 1.45 + hh(i, 31) * 0.9, lag = 0.6 + 2.8 * hh(i, 32) + Math.floor(i / 14) * 2.3;
        const x = frontier(z, wideF) + lag, d = 1.3 * T(wideF - 205) + hh(i, 33) * 3;
        if (f >= 359 && z < 15 && x < 7) continue; // the close-up birds take over here
        emu(out, cam, { i, x, z, dx: -1, dz: 0, mode: f < 359 ? "walk" : "stand", phase: d / EMU_WALK_M, expr: "calm", blink: emuBlink(f, i), shadow: false });
      }
      for (let i = 0; i < 34; i++) { // peckers on the stubble
        const z = 7.5 + 19 * hh(i, 34), x = frontier(z, wideF) + 5.5 + 30 * hh(i, 35), p = peckAt(f + Math.floor(hh(i, 36) * 30));
        if (f >= 359 && x < 7 && z < 15) continue;
        emu(out, cam, { i: i + 30, x, z, dx: hh(i, 37) > 0.5 ? 1 : -1, dz: 0, view: "side", mode: "peck", peck: p.k, jab: p.jab, gulp: p.gulp, reach: 150, expr: "calm", shadow: x < 20 });
      }
      if (f >= 288 && f < 359) {
        // the farmer at his fence: jaw drops, hands go up
        const up = q(ramp(f, F.wheat - 2, F.wheat + 4), 6);
        person(out, cam, WHO.farmer, FARMER_AT[0], 0, FARMER_AT[2], { fo: { mode: "stand", expr: f >= F.wheat - 2 ? "shock" : "nervous", cheer: up || undefined, look: f < F.western ? -1 : 1, blink: 0 } });
      }
      if (f >= 359) PECKERS.forEach((pk, i) => {
        const p = peckAt(f - 359 - pk.off + 30);
        emu(out, cam, { i: i + 70, x: pk.x, z: pk.z, dx: -1, dz: 0, view: "side", mode: "peck", peck: p.k, jab: p.jab, gulp: p.gulp, reach: 345, scale: 1.0, expr: "calm", blink: emuBlink(f, i + 70) });
        // chaff flies where the bill strikes
        if (p.k >= 1 && p.c >= 9 && p.c < 17) { const u = ((p.c - 9) % 5) / 5; dust(out, 0, -u * 6, pk.x - 1.3, 0.55, pk.z - 0.05, 0.42, 6); }
      });
      break;
    }
    case 5: {
      // one major, two soldiers, two machine guns, ten thousand bullets: each lands on its word
      const lands = [436, 465, 470];
      TR.forEach((n, k) => {
        const y = dropY(f, lands[k]);
        if (y < 0) return;
        const p = TRIO[k];
        person(out, cam, WHO[n], p[0], y, p[2], { fo: { mode: "stand", expr: k === 0 ? "stern" : f >= F.bullets + 6 ? "grin" : k === 1 ? "smile" : "neutral", blink: lidAt(t, 10 + k) } }, y < 0.02);
        dust(out, f, lands[k], p[0], 0, p[2] - 0.15, 1.0);
      });
      [493, 499].forEach((ld, k) => {
        const y = dropY(f, ld, 1.3);
        if (y < 0) return;
        out.guns.push({ pos: [CAMP_GUNS[k][0], y, CAMP_GUNS[k][2]], yaw: Math.PI + (k ? -0.6 : 0.6) });
        dust(out, f, ld, CAMP_GUNS[k][0], 0, CAMP_GUNS[k][2] - 0.2, 0.9);
      });
      // exactly one crate: "10,000 ROUNDS"; a few cartridges hop out of it on "bullets"
      const cy = dropY(f, 534, 1.5);
      if (cy >= 0) {
        out.crates.push({ pos: [CRATES_AT[0], cy, CRATES_AT[2]], yaw: 0.04 });
        dust(out, f, 534, CRATES_AT[0] - 0.6, 0, CRATES_AT[2] - 0.5, 1.1); dust(out, f, 534, CRATES_AT[0] + 0.6, 0, CRATES_AT[2] - 0.5, 1.1);
        for (let k = 0; k < 5; k++) { const n = f - (F.bullets - 2) - k; if (n >= 0 && n < 14) out.fx.push({ key: "case", cw: 200, ch: 120, draw: fxCase, x: CRATES_AT[0] + (k - 2) * 0.28 + (k - 2) * 0.02 * n, y: 0.8 + 0.16 * n - 0.0125 * n * n, z: CRATES_AT[2] - 0.1, w: 0.2, h: 0.12, rot: n * 0.7 + k }); }
      }
      break;
    }
    case 6: {
      sirAt(out, cam, f, SIR_EASY, { expr: f >= F.right - 2 ? "smile" : "neutral", shrug: f >= F.right - 2 ? q(ramp(f, F.right - 2, F.right + 5), 5) : undefined, headTilt: f >= F.right ? 5 : 0 });
      break;
    }
    case 7: {
      const fireA = burst(F.opened, 708, 6), fireB = burst(F.opened, 708, 6, 3);
      const k0 = firing(f, fireA), k1 = firing(f, fireB);
      PLAIN_GUNS.forEach((g, k) => {
        const kk = k ? k1 : k0;
        out.guns.push({ pos: g, yaw: (k ? -0.07 : 0.07) + (f >= 664 ? 0.5 * Math.sin(f / 9 + k * 2) : 0), recoil: kk ? 0.05 : 0, pitch: kk ? -0.03 : 0 });
        if (f < 722) flash(out, kk, [g[0], 0.97, g[2] + 1.12], f >= 656 ? 1.6 : 1);
        if (f < 656) { // ejected brass arcs out to the side
          for (const s of k ? fireB : fireA) { const n = f - s; if (n >= 0 && n < 10) out.fx.push({ key: "case", cw: 200, ch: 120, draw: fxCase, x: g[0] + 0.25 + 0.05 * n, y: 1.0 + 0.09 * n - 0.014 * n * n, z: g[2] - 0.05 * n, w: 0.11, h: 0.066, rot: n * 0.9 }); }
        }
      });
      if (f < 656) {
        // gunners behind the guns, the major beside them
        PLAIN_GUNS.forEach((g, k) => person(out, cam, WHO[k ? "s2" : "s1"], g[0], 0, g[2] - 0.66, { side: true, mirror: true,
          so: { mode: "push", pose: 1, expr: f >= F.opened ? "stern" : "neutral", hand: [433, 548], blink: lidAt(t, 20 + k) } }));
        person(out, cam, WHO.major, -2.2, 0, -0.9, { side: true, mirror: true, so: { mode: "stand", expr: "stern", blink: lidAt(t, 12) } });
      }
      // the mob: 54 birds, 6 groups; from "the emus split" each group bolts its own way
      const t0 = 664;
      if (f >= 656 && f < 722) {
        for (let i = 0; i < 54; i++) {
          const g = i % 6, ang = (g / 6) * Math.PI * 2 + 0.35, dx = Math.cos(ang), dz = Math.sin(ang);
          const r0 = 1.2 + 4.2 * Math.sqrt(hh(i, 41)), a0 = hh(i, 42) * 6.28, x0 = MOB[0] + r0 * Math.cos(a0), z0 = MOB[2] + r0 * Math.sin(a0) * 0.8;
          const tt = Math.max(0, (f - t0 - (i % 3)) / FPS), d = tt < 0.3 ? (5.6 / 0.6) * tt * tt : 5.6 * (tt - 0.15);
          // members close up on their group's lane as they run
          const lane = smooth(tt / 0.8), gx = MOB[0] + dx * 1.5 + (-dz) * ((Math.floor(i / 6) % 3) - 1) * 1.1, gz = MOB[2] + dz * 1.5 + dx * ((Math.floor(i / 6) % 3) - 1) * 1.1;
          const back = (Math.floor(i / 18)) * 1.7;
          const x = lerp(x0, gx - dx * back, lane) + dx * d, z = lerp(z0, gz - dz * back, lane) + dz * d;
          emu(out, cam, { i, x, z, dx, dz, mode: f >= t0 + (i % 3) ? "run" : "stand", phase: d / EMU_RUN_M + hh(i, 43), expr: "alarm", shadow: true });
          if (tt > 0.15 && i % 3 === 0) dust(out, 0, -(((f + i * 3) % 12)), x - dx * 0.9, 0, z - dz * 0.9, 1.1, 12);
        }
        // bullets kick up the ground where the mob was standing
        for (let k = 0; k < 6; k++) { const s = 660 + k * 8; dust(out, f, s, MOB[0] + (hh(k, 44) - 0.5) * 7, 0, MOB[2] + (hh(k, 45) - 0.5) * 6, 1.3, 10); }
      }
      if (f >= 722) {
        // down among them: birds tear past the lens in every direction
        const lanes: [number, number, number, number, number][] = [ // x0, z0, heading (rad), speed, start offset (s)
          [-9, 29, 0.12, 9.5, 0], [12, 33, Math.PI - 0.15, 9, 0.1], [-11, 37, -0.1, 10, 0.35], [14, 27.5, Math.PI + 0.2, 9.5, 0.5],
          [1, 52, -Math.PI / 2 - 0.25, 9, 0], [5, 50, -Math.PI / 2 + 0.2, 9.5, 0.45], [-2, 30, Math.PI / 2 + 0.3, 9, 0.2], [4, 32, Math.PI / 2 - 0.35, 9.5, 0.6],
          [-12, 43, 0.3, 9, 0.2], [15, 41, Math.PI - 0.3, 9.5, 0.7], [-10, 33, -0.25, 10, 0.9], [13, 30, Math.PI + 0.1, 9, 1.0],
          [-8, 26.5, 0.05, 9.5, 0.55], [11, 26, Math.PI - 0.05, 9, 0.25], [-13, 31, 0.0, 9, 1.15], [16, 35, Math.PI, 9.5, 0.4], [-9, 47, 0.2, 9, 0.6], [12, 46, Math.PI - 0.2, 9, 0.15],
        ];
        lanes.forEach(([x0, z0, a, v, off], i) => {
          const d = v * (T(f - 722) + 0.35 - off * 0.5), dx = Math.cos(a), dz = Math.sin(a), x = x0 + dx * d, z = z0 + dz * d;
          emu(out, cam, { i: i + 5, x, z, dx, dz, mode: "run", phase: d / EMU_RUN_M + hh(i, 46), expr: "alarm" });
          dust(out, 0, -((f + i * 5) % 12), x - dx * 0.9, 0, z - dz * 0.9, 1.0, 12);
        });
      }
      break;
    }
    case 8: case 9: {
      const gy = (x: number, z: number) => bankY(x, z);
      const fire = id === 8 ? burst(916, 934, 3) : [934, 937, 940];
      const kk = firing(f, fire), jam = id === 9 && f >= F.jammed;
      const shake = jam && f < F.jammed + 6 ? 0.06 * ((f - F.jammed) % 2 ? -1 : 1) * (1 - (f - F.jammed) / 6) : 0;
      const thump = id === 9 && (f === 955 || f === 956 || f === 963 || f === 964);
      out.guns.push({ pos: DAM_GUN, yaw: 0, h: 0.45, recoil: kk ? 0.05 : 0, pitch: (kk ? -0.03 : 0) + (jam ? 0.07 : 0) + shake + (thump ? 0.03 : 0) });
      const mz: V3 = [DAM_GUN[0], DAM_GUN[1] + 0.52, DAM_GUN[2] + 1.12];
      flash(out, kk, mz, id === 8 ? 0.55 : 1.15);
      if (id === 8 && f >= 843) person(out, cam, WHO.s1, 0, gy(0, DAM_GUN[2] - 0.78) - 0.05, DAM_GUN[2] - 0.78, { fo: { mode: "stand", back: true, blink: 0 } }, false);
      const gz = DAM_GUN[2] - 0.78;
      if (id === 8 && f < 843) {
        // the ambush from behind: the gunner at the gun, the major and the second man crouched low behind the bank
        person(out, cam, WHO.s1, 0, gy(0, gz) - 0.05, gz, { fo: { mode: "stand", back: true, blink: 0 } }, false);
        person(out, cam, WHO.major, -0.98, gy(-0.98, gz + 0.1) - 0.02, gz + 0.1, { fo: { mode: "sit", back: true, point: f >= F.ambush - 3 ? q(ramp(f, F.ambush - 3, F.ambush + 4), 5) || undefined : undefined, blink: 0 } }, false);
        person(out, cam, WHO.s2, 0.98, gy(0.98, gz + 0.05) - 0.02, gz + 0.05, { fo: { mode: "sit", back: true, blink: 0 } }, false);
      }
      if (id === 8) {
        // front ranks of the thousand as actors (the rest is the instanced crowd)
        const lead = damLead(f), ph = damPhase(f);
        if (f >= 843) for (let i = 0; i < 40; i++) {
          const row = i % 4, z = lead + row * 1.5 + hh(i, 51) * 0.8, x = (((i >> 2) + 0.5) / 10 - 0.5) * 12 + (row % 2) * 0.6 + (hh(i, 52) - 0.5) * 0.5;
          emu(out, cam, { i, x, z, dx: 0, dz: -1, view: "front", mode: f >= 920 ? "stand" : "walk", phase: ph + hh(i, 53), expr: f >= 918 ? "alarm" : "deadpan", blink: f >= 918 ? 0 : emuBlink(f, i) });
        }
        for (let k = 0; k < 5; k++) dust(out, f, 918 + k * 3, (hh(k, 54) - 0.5) * 7, 0, lead - 0.6 - hh(k, 55) * 1.2, 1.3, 10);
      } else {
        // the jam: the gunner behind his gun, facing us
        person(out, cam, WHO.s1, 0, gy(0, gz) - 0.05, gz, { fo: { mode: "stand", expr: jam ? (f < 952 ? "shock" : "pained") : "stern", cheer: f >= 952 ? q(0.5 + 0.5 * Math.abs(Math.sin((f - 952) * 0.5)), 6) : undefined,
          tilt: thump ? 4 : 0, blink: jam ? 0 : lidAt(t, 20) } }, false);
        if (jam) {
          const u = q(clamp01((f - F.jammed) / 26), 13);
          out.fx.push({ key: `smoke${u}`, cw: 300, ch: 300, draw: (p) => fxSmoke(p, u), x: mz[0], y: mz[1] + 0.25 + 0.5 * u, z: mz[2] - 0.95, w: 0.75, h: 0.75, soft: true, opacity: 0.9 });
          if (f < F.jammed + 18) out.fx.push({ key: "bang", cw: 200, ch: 260, draw: fxBang, x: 0.42, y: gy(0, gz) + 1.78 + 0.05 * Math.sin(f), z: gz + 0.05, w: 0.26, h: 0.34 });
          if (f < F.jammed + 5) { const u2 = q((f - F.jammed) / 5, 5); out.fx.push({ key: `burst${u2}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, u2, "#ffe9a8", 8), x: mz[0], y: mz[1] - 0.02, z: mz[2] - 1.05, w: 0.9, h: 0.9 }); }
        }
      }
      break;
    }
    case 10: case 11: {
      const x = id === 10 ? (f >= 1024 ? truckX(f) : 0) : truckX(f), bo = truckBounce(f);
      const dropU = id === 10 ? clamp01((f - F.put) / (1001 - F.put)) : 1, lift = id === 10 ? 0.75 * (1 - dropU * dropU) : 0;
      const dip = id === 10 && f >= 1001 && f < 1013 ? -0.07 * Math.sin(((f - 1001) / 12) * Math.PI) * (1 - (f - 1001) / 12) : 0;
      const idle = id === 10 && f >= F.truck ? 0.012 * Math.sin(f * 2.4) : 0;
      const wild = id === 11 && f >= 1083;
      const ts: TruckS = { x, z: 0, yaw: 0, y: bo.y + dip + idle, pitch: bo.pitch, roll: bo.roll, wheel: x / 0.43,
        wheelY: [0, 1, 2, 3].map((k) => (id === 11 ? 0.05 * Math.max(0, Math.sin(f * 0.9 + k * 1.7)) : 0)),
        gunPitch: wild ? 0.45 * Math.sin(f * 0.61) + 0.2 * Math.sin(f * 1.13 + 1) : 0, gunYaw: wild ? 0.3 * Math.sin(f * 0.47 + 2) : 0, gunLift: lift };
      out.truck = ts;
      const bedY = 0.82 + ts.y, front = (px: number, pz: number) => { const tx = cam.pos.x - px, tz = cam.pos.z - pz; return tx / (Math.hypot(tx, tz) || 1) > 0.62; };
      // gunner on the bed: thrown into the air by every bump, never gets a shot off
      const hop = id === 11 ? Math.max(0, 0.42 * Math.abs(Math.sin(t * 9.3 + 0.9)) - 0.08) * (f >= 1083 ? 1.25 : 0.7) : 0;
      const gx = x - 1.22, gFront = front(gx, 0);
      if (gFront) person(out, cam, WHO.s1, gx, bedY + hop, 0, { fo: { mode: "stand", expr: id === 10 ? (f >= 1003 ? "grin" : "neutral") : Math.sin(f * 0.5) > 0 ? "shock" : "pained",
        cheer: id === 11 && f >= 1083 ? q(0.55 + 0.45 * Math.sin(f * 0.8), 6) : undefined, tilt: id === 11 && f >= 1083 ? 9 * Math.sin(f * 0.7) : 0, blink: id === 10 ? lidAt(t, 20) : 0 } }, false);
      else person(out, cam, WHO.s1, gx, bedY + hop, 0.05, { side: true, so: { mode: id === 10 && f < 1003 ? "stand" : "push", pose: id === 10 ? 1 : q(0.75 + 0.25 * Math.sin(f * 0.7), 8),
        expr: id === 10 ? (f >= 1003 ? "grin" : "neutral") : hop > 0.12 ? "shock" : "pained", hand: [455, 440], blink: id === 10 ? lidAt(t, 20) : 0 } }, false);
      // the major drives; in the chase the second man rides beside him
      const cabY = ts.y;
      if (f >= 1125) { /* the gunner's close-up: the cab is below the frame */ }
      else if (front(x + 0.3, 0)) {
        person(out, cam, WHO.major, x + 0.3, 0.52 + cabY, 0.38, { scale: 0.8, fo: { mode: "stand", expr: id === 10 ? (f >= 1003 ? "grin" : "stern") : "stern", blink: lidAt(t, 12) } }, false);
        if (id === 11) person(out, cam, WHO.s2, x + 0.3, 0.52 + cabY, -0.38, { scale: 0.8, fo: { mode: "stand", expr: "nervous", blink: 0 } }, false);
      } else person(out, cam, WHO.major, x + 0.22, 0.68 + cabY, 0.25, { scale: 0.8, side: true, so: { mode: "swing", pose: 0.12, expr: "stern", blink: lidAt(t, 12) } }, false);
      if (id === 10) {
        dust(out, f, 1001, -0.45, 1.25, 0.4, 0.8, 10);
        if (f >= F.truck) for (let k = 0; k < 3; k++) { const u = (((f - F.truck) + k * 6) % 18) / 18; out.fx.push({ key: `puff${q(u, 9)}`, cw: 300, ch: 300, draw: (p) => fxPuff(p, q(u, 9)), x: x - 2.7 - 0.6 * u, y: 0.45 + 0.3 * u, z: 0.5, w: 0.8, h: 0.8, soft: true, opacity: 0.9 }); }
      } else {
        // the birds, well ahead and pulling away (they keep to the lens side of the track so the truck stays in view)
        const rx = runnersX(f);
        if (f < 1083) for (let i = 0; i < 7; i++) {
          const ex = rx - (i % 3) * 1.7 - hh(i, 61) * 0.8, ez = 0.4 + ((i % 4) - 1.5) * 0.72 + (hh(i, 62) - 0.5) * 0.3, d = EMU_V * T(f - 1030);
          emu(out, cam, { i, x: ex, z: ez, dx: 1, dz: 0, mode: "run", phase: d / EMU_RUN_M + hh(i, 63), expr: i % 3 === 0 ? "smug" : "calm", blink: emuBlink(f, i) });
          if (i % 2 === 0) dust(out, 0, -((f + i * 4) % 12), ex - 1.0, 0, ez, 0.9, 12);
        }
        for (let k = 0; k < 4; k++) dust(out, 0, -((f + k * 3) % 12), x - 2.3 - k * 0.5, 0, k % 2 ? 0.85 : -0.85, 1.5 + 0.2 * k, 12);
      }
      break;
    }
    case 12: {
      // golden hour: the silent gun, the tally of six days, the brass; then the trio trudges off toward the sun
      out.tally = { pos: [-0.62, 0, -2.25], n: Math.max(0, Math.min(6, Math.floor((f - (F.six - 2)) / 3) + 1)) };
      out.brass = true;
      if (f < 1262) {
        out.guns.push({ pos: [1.05, 0, -2.0], yaw: 2.6 });
        const u = q(((f - 1180) % 40) / 40, 20);
        out.fx.push({ key: `smoke${u}`, cw: 300, ch: 300, draw: (p) => fxSmoke(p, u), x: 1.05 - 0.5, y: 1.1 + 0.4 * u, z: -2.0 - 0.85, w: 0.5, h: 0.5, soft: true, opacity: 0.55 * (1 - u) });
      } else {
        // three backs walking away from the lens, the gun over one shoulder; an emu in the foreground watches them go
        const d0 = 9.6 + 1.1 * T(f - 1262), rt: [number, number] = [-HOME_DIR[1], HOME_DIR[0]];
        TR.forEach((n, k) => {
          const side = (k === 0 ? 0 : k === 1 ? 1 : -1) * 1.3, d = d0 - (k === 0 ? 0 : 0.45);
          const x = HOME_CAM[0] + HOME_DIR[0] * d + rt[0] * side, z = HOME_CAM[2] + HOME_DIR[1] * d + rt[1] * side;
          person(out, cam, WHO[n], x, 0, z, { fo: { mode: "stroll", back: true, phase: (d / 1.4 + k * 0.37) % 1, lift: 60, tilt: 3, blink: 0 } });
          if (k === 1) out.guns.push({ pos: [x + rt[0] * 0.16, 1.4, z + rt[1] * 0.16], yaw: Math.atan2(HOME_DIR[0], HOME_DIR[1]) + Math.PI, pitch: -0.55, legs: false });
        });
        const ex = HOME_CAM[0] + HOME_DIR[0] * 2.6 + rt[0] * 0.05, ez = HOME_CAM[2] + HOME_DIR[1] * 2.6 + rt[1] * 0.05;
        emu(out, cam, { i: 4, x: ex, z: ez, dx: HOME_DIR[0], dz: HOME_DIR[1], view: "back", mode: "stand", scale: 1.0, expr: "calm", nod: 4 * Math.sin(f / 13) });
      }
      break;
    }
    case 13: {
      // back for a second try: marching in along the fence (lens tracks them), the birds in the stubble look up
      const xm = -0.95 + 2.2 * ((f - 1307) / 60);
      TR.forEach((n, k) => {
        const x = xm - k * 1.05;
        person(out, cam, WHO[n], x, 0, 2.6, { side: true, mirror: true, so: { mode: "march", phase: ((x + 20) / 1.6) % 1, stomp: 1, stride: 1, expr: "stern", blink: lidAt(t, 10 + k) } });
        if (k === 1) out.guns.push({ pos: [x + 0.1, 1.36, 2.62], yaw: Math.PI / 2, pitch: -0.45, legs: false });
      });
      for (let i = 0; i < 14; i++) {
        const x = -7 + 15 * hh(i, 71), z = 7 + 12 * hh(i, 72), up = ramp(f, F.second - 6 + (i % 4) * 2, F.second + 2 + (i % 4) * 2), p = peckAt(f + Math.floor(hh(i, 73) * 30));
        emu(out, cam, { i, x, z, dx: hh(i, 74) > 0.5 ? 1 : -1, dz: 0, view: "side", mode: "peck", peck: p.k * (1 - up), jab: p.jab * (1 - up), reach: 150, expr: up > 0.5 ? "deadpan" : "calm", blink: emuBlink(f, i) });
      }
      break;
    }
    case 14: {
      // the scoreboard: the major chalks up his own count
      const n986 = f < F.n986 ? "" : f < F.n986 + 15 ? "9" : f < F.n986 + 31 ? "98" : "986";
      const bul = f < F.nearly + 4 ? "" : "9,860";
      const head = clamp01((f - F.final) / 10), emuL = f >= F.count - 6, bulL = f >= F.for_ - 2;
      out.board = { pos: [0, 0, -0.3], key: `${q(head, 10)}|${emuL}|${n986}|${bulL}|${bul}`, draw: (g) => drawBoard(g, head, emuL, n986, bulL, bul) };
      person(out, cam, WHO.major, 0.95, 0, -1.5, { scale: 1, fo: { mode: "stand", expr: f >= F.emus3 ? "smile_closed" : "stern", point: f >= F.count - 4 ? q(ramp(f, F.count - 4, F.count + 3), 5) : undefined, blink: lidAt(t, 12) } });
      if (f >= 1483) {
        out.aftermath = true;
        person(out, cam, WHO.s1, -1.65, 0, -3.4, { fo: { mode: "sit", expr: "dazed", blink: 0 } });
        person(out, cam, WHO.s2, -0.55, 0, -4.9, { fo: { mode: "sit", expr: "relief", blink: lidAt(t, 21) } });
        out.guns.push({ pos: [1.75, 0, -3.5], yaw: 2.4 }, { pos: [-1.9, 0.12, -4.4], yaw: 0.7, roll: 1.35 });
      }
      break;
    }
    case 15: {
      // "And the emus?" Sir Digsworth by the fence; "They're still there": the field is full of them, one strolls up
      sirAt(out, cam, f, SIR_END, { expr: f >= F.there + 12 ? "neutral" : f >= F.theyre ? "smile" : "neutral", shrug: f >= F.emus4 - 2 && f < F.theyre - 4 ? q(ramp(f, F.emus4 - 2, F.emus4 + 5) * (1 - ramp(f, F.theyre - 12, F.theyre - 4)), 5) || undefined : undefined,
        look: f >= 1612 ? -1 : 0 });
      for (let i = 0; i < 40; i++) {
        const z = 7 + 20 * hh(i, 81), x = -13 + 26 * hh(i, 82), p = peckAt(f + Math.floor(hh(i, 83) * 30)), walk = i % 5 === 0;
        const d = 1.2 * T(f - 1554);
        if (walk) emu(out, cam, { i, x: x + (hh(i, 84) > 0.5 ? 1 : -1) * d, z, dx: hh(i, 84) > 0.5 ? 1 : -1, dz: 0, view: "side", mode: "walk", phase: d / EMU_WALK_M + hh(i, 85), expr: "calm" });
        else emu(out, cam, { i, x, z, dx: hh(i, 84) > 0.5 ? 1 : -1, dz: 0, view: "side", mode: "peck", peck: p.k, jab: p.jab, gulp: p.gulp, reach: 150, expr: "calm" });
      }
      // the visitor: walks up along the fence beside him, stops and stares into the lens
      const arrive = 1616, x1 = 0.6, v = 1.25, xw = x1 + v * Math.max(0, T(arrive - f));
      if (f < arrive) emu(out, cam, { i: 7, x: xw, z: -3.0, dx: -1, dz: 0, view: "side", mode: "walk", scale: 0.92, phase: (v * T(f - 1500)) / EMU_WALK_M, expr: "calm" });
      else emu(out, cam, { i: 7, x: x1, z: -3.0, dx: 0, dz: -1, view: "front", mode: "stand", scale: 0.92, expr: "deadpan", blink: f >= 1634 && f < 1638 ? [0.5, 1, 1, 0.5][f - 1634] : 0, nod: 4 });
      break;
    }
  }
  return out;
};

// ---------------- the scoreboard's chalk ----------------
const chalk = (g: CanvasRenderingContext2D, s: string, x: number, y: number, px: number, colr = "#f4f1e6", align: CanvasTextAlign = "center") => {
  g.font = `900 ${px}px 'Arial Black', Impact, 'Segoe UI Black', sans-serif`; g.textAlign = align; g.textBaseline = "middle";
  g.fillStyle = "rgba(0,0,0,0.25)"; g.fillText(s, x + 4, y + 5);
  g.fillStyle = colr; g.fillText(s, x, y);
};
export const drawBoard = (g: CanvasRenderingContext2D, head: number, emuL: boolean, n: string, bulL: boolean, bul: string) => {
  const W = 1024, H = 756;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = "#2f4a3c"; g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(255,255,255,0.05)"; for (let i = 0; i < 40; i++) g.fillRect((i * 173) % W, (i * 97) % H, 160, 9);
  g.strokeStyle = "#e9e4d2"; g.lineWidth = 8; g.strokeRect(22, 22, W - 44, H - 44);
  if (head > 0) {
    g.save(); g.beginPath(); g.rect(0, 0, W * head, H); g.clip();
    chalk(g, "FINAL SCORE", W / 2, 118, 104, "#ffe27a");
    g.strokeStyle = "#ffe27a"; g.lineWidth = 9; g.beginPath(); g.moveTo(150, 190); g.lineTo(W - 150, 190); g.stroke();
    g.restore();
  }
  if (emuL) chalk(g, "EMUS", 70, 340, 96, "#f4f1e6", "left");
  if (n) chalk(g, n, W - 70, 340, 168, "#ffffff", "right");
  if (bulL) chalk(g, "BULLETS", 70, 590, 82, "#f4f1e6", "left");
  if (bul) chalk(g, bul, W - 70, 590, 128, "#ff9d86", "right");
};
/** chalk tally on the side of a crate: n strokes, the fifth drawn across the first four */
export const drawTally = (g: CanvasRenderingContext2D, n: number) => {
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 512, 256);
  g.strokeStyle = "#f6f2e4"; g.lineWidth = 17; g.lineCap = "round";
  for (let i = 0; i < Math.min(n, 4); i++) { g.beginPath(); g.moveTo(92 + i * 58, 52); g.lineTo(84 + i * 58, 204); g.stroke(); }
  if (n >= 5) { g.beginPath(); g.moveTo(48, 176); g.lineTo(312, 78); g.stroke(); }
  if (n >= 6) { g.beginPath(); g.moveTo(392, 52); g.lineTo(384, 204); g.stroke(); }
};
export { SU, Pen };

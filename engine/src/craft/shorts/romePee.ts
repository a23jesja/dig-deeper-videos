// Short: "Why did Rome tax pee?" One street corner in Rome (world/rome.ts), played on the stage (stage/Stage.tsx).
// The shots are cut to the narration's lines (voice/rome-pee): each shot names the lines it covers, so a new reading moves the cuts.
// Sources and what must not be claimed: granskning/rome-pee/manus.md. In the picture nobody pays anybody, the fuller never touches
// the jar in the street, and the collector is a man in plain dress.
import * as THREE from "three";
import { Film, Shot, Cam, V3, Staged, Word, Sound, play, talk, glide, smooth, mix3 } from "../stage/film";
import { mover, mt, tread, wag, arm } from "../stage/acting";
import type { MM } from "../stage/acting";
import { lens, once, noShade, put, between, ahead, near } from "../stage/staging";
import { romeStreet, ROME, WALK } from "../world/rome";
import { mesh, box, ball, group, rod } from "../world/kit";
import { chest, coin, amphora, painted, waxTablet, basket } from "../world/props";
import { SIR_D, VESPASIAN_D, TITUS_D, FULLER_D, CITIZEN_D, COLLECTOR_D } from "../looks";
import type { Pose } from "../rig";
import words from "../../../voice/rome-pee/words.json";
import lines from "../../../voice/rome-pee/lines.json";

const W = words as Word[], L = Object.fromEntries((lines as { id: string; a: number; b: number }[]).map((l) => [l.id, l]));
const cut = (a: string, b: string) => (L[a].b + L[b].a) / 2;       // a cut falls in the pause between two lines
const END = L.end.b + 0.6;
/** when a word of a line is spoken (film seconds) */
const at = (line: string, re: RegExp) => W.find((w) => w.line === line && re.test(w.w))!.a;
const [JX, , JZ] = ROME.jar, BOX = ROME.box;
const P = (o: Partial<Pose>) => o;

// ---------------- the things of the corner (made once, moved by the shots) ----------------
const CHEST_FULL = once(() => chest(true, true)), CHEST_EMPTY = once(() => chest(true, false, 0.44, 0.28, 0.3)), COIN = once(() => noShade(coin(0.05))), COIN_BIG = once(() => noShade(coin(0.075))), JUG = once(() => amphora(0.62)), TABLET = once(() => noShade(waxTablet()));
const CARD = once(() => { const g = group([mesh(box(0.46, 0.62, 0.02), "#fbf6ea", { shadow: false })]), flat = { line: 0.5, shadow: false } as const;
  // a street urinal of Paris, drawn as the round iron kiosk it was: a green drum on a base, a band of small openings, a cap, a lamp
  g.add(mesh(box(0.2, 0.03, 0.012), "#24523a", { at: [0, -0.115, 0.012], ...flat }), mesh(box(0.17, 0.25, 0.012), "#2f7a52", { at: [0, 0.025, 0.012], ...flat }), mesh(box(0.21, 0.035, 0.012), "#24523a", { at: [0, 0.165, 0.012], ...flat }), mesh(box(0.13, 0.03, 0.012), "#2f7a52", { at: [0, 0.195, 0.012], ...flat }), mesh(box(0.04, 0.06, 0.012), "#f6c95e", { at: [0, 0.24, 0.012], ...flat }));
  for (const x of [-0.055, -0.018, 0.018, 0.055]) g.add(mesh(box(0.02, 0.05, 0.012), "#fbf6ea", { at: [x, 0.1, 0.016], line: 0, shadow: false }));
  const t = painted(["VESPASIENNE"], 0.42, 0.085, { ink: "#2a1a14", bg: "#fbf6ea", line: 0 }); t.position.set(0, -0.2, 0.012); g.add(t);
  const t2 = painted(["PARIS"], 0.2, 0.06, { ink: "#b3261e", bg: "#fbf6ea", line: 0 }); t2.position.set(0, -0.27, 0.012); g.add(t2); g.traverse((q) => { q.receiveShadow = false; }); return noShade(g); });
const lid = (ch: THREE.Object3D, open: number) => { const l = ch.children.find((c) => c.userData.lid) ?? ch.children[4]; l.rotation.x = -1.9 * open; };
const strongbox = (into: THREE.Group, ry: number, open = 1, p: V3 = BOX) => { const c = put(into, CHEST_FULL(), p, ry); lid(c, open); return c; };
/** the smell of the jar: three wavy lines rising from its mouth, and flies going round it */
const stink = (into: THREE.Group, t: number, cam: Cam, p: V3 = [JX, WALK + 0.84, JZ]) => {
  const dx = cam.pos[0] - p[0], dz = cam.pos[2] - p[2], n = Math.hypot(dx, dz) || 1, rx = -dz / n, rz = dx / n;   // across the picture
  for (let k = 0; k < 3; k++) { const o = (k - 1) * 0.17; let a: V3 | null = null;
    for (let i = 0; i <= 9; i++) { const y = i * 0.075, s = 0.05 * Math.sin(i * 0.9 - t * 5 + k * 2) * (0.4 + i * 0.08), q: V3 = [p[0] + rx * (o + s), p[1] + 0.06 + y + ((t * 0.25 + k * 0.13) % 0.075), p[2] + rz * (o + s)];
      if (a) into.add(rod(a, q, 0.014, "#93a82e", { line: 0, shadow: false })); a = q; } }
  for (let k = 0; k < 4; k++) { const a = t * (5 + k) + k * 1.7, r = 0.3 + 0.08 * k, q: V3 = [p[0] + rx * Math.cos(a) * r + (dx / n) * 0.1, p[1] + 0.22 + 0.16 * Math.sin(a * 1.3 + k) + k * 0.07, p[2] + rz * Math.cos(a) * r + (dz / n) * 0.1];
    into.add(mesh(ball(0.02, 8), "#2a2622", { at: q, line: 0, shadow: false }), mesh(box(0.045, 0.004, 0.02), "#e8eef2", { at: [q[0], q[1] + 0.02, q[2]], rot: [0, a, 0.5 * Math.sin(t * 60 + k)], line: 0, shadow: false })); }
};

// ---------------- poses that several shots use ----------------
/** a hand over the nose and mouth (the right hand), leaning away */
const NOSE = P({ armR: arm(106, 6, 167, -52), handR: 10, lean: -9 }), FAN_A = P({ armL: arm(34, 40, 100, 66) }), FAN_B = P({ armL: arm(44, 22, 118, 28) });
const DISGUST = { brow: -0.7, lid: 0.3, smile: -1 };

// ---------------- the sound of what happens: times are seconds into the shot, written with the variables the motion uses ----------------
/** a footstep for every foot a figure puts down in the first `len` seconds of the shot. `off` = the Mover's own time minus the shot's time
 *  (a shot that plays its figures at t + 1 has off = 1). Two feet that land together are pulled 0.06 s apart so they are heard as two */
const feet = (m: MM, off: number, len: number, o: { g?: number; p?: number } = {}): Sound[] => {
  const out: Sound[] = [];
  for (const c of m.cues()) { if (c.k !== "step" || c.t - off < 0 || c.t - off > len) continue; let t = c.t - off; const last = out[out.length - 1]; if (last && t - last.t < 0.05) t = last.t + 0.06;
    out.push({ t, k: "step", g: o.g ?? 1, p: o.p ?? 0, ...(c.run ? { run: true } : {}) }); }
  return out.filter((c) => c.t <= len);
};
/** the moments of wag(m, t0, dur, a, b, period): one for each full swing, `lead` seconds from its start, kept inside the shot */
const swings = (t0: number, dur: number, period: number, len: number, lead = 0): number[] => { const o: number[] = []; for (let t = t0; t < t0 + dur - 1e-6; t += period) if (t + lead >= 0 && t + lead < len - 0.05) o.push(t + lead); return o; };

const shots: Shot[] = [];
const add = (s: Shot) => shots.push(s);

// 1. THE HOOK: the jar near the lens, its smell and its flies, a strongbox of gold beside it, Sir Digsworth springing back from it
{
  const V = lens(3.1, 1.65, 1.4, 0, 1, -14, 72);
  const sir = mover(SIR_D, 1.8, 3.12, 4.72, 172);
  sir.actAt(-1, { lean: 26, head: [0, 14, 0], armL: arm(20, 16, 60, 10), armR: arm(30, 14, 80, 0) }, 1.25, { out: 0.16, face: { brow: 0.6, gaze: [0.2, 0.8] } });
  sir.stand(0.22).step("R", -0.28, 0.2).step("L", -0.26, 0.2).stand(4);
  sir.actAt(0.2, { ...NOSE, lean: -14, head: [0, -8, 0] }, 9, { in: 0.16, over: 2.4, handR: "relaxed", face: { ...DISGUST, wide: 0.7, lid: 0, gaze: [0.2, 0.7] } }); wag(sir, 0.5, 4, FAN_A, FAN_B, 0.32, { handL: "open" });
  const hookLen = cut("hook", "need");
  add({ id: "hook", a: 0, b: hookLen, still: 1.0,
    // his two steps back, then a soft whoosh for each wave of his hand (wag at 0.5, one swing every 0.32 s); the flies of the jar all through
    sounds: [{ t: 0.02, k: "scuff", g: 0.8 }, ...feet(sir, 0, hookLen, { g: 0.9 }), ...swings(0.5, 4, 0.64, hookLen, -0.08).map((t): Sound => ({ t, k: "whoosh", dur: 0.25, g: 0.25, p: 0.15 }))],
    beds: [{ k: "flies", a: 0, b: hookLen, g: 1 }],
    cam: (_t, u) => V.push(0.18 * u), sun: { target: [3, 0, 4], reach: 6 },
    cast: (t, T) => [play("sir", SIR_D, sir, t, [0, WALK, 0], 1.8, { talk: talk(W, T, ["hook"]) })],
    things: (g, _c, t, _T, cam) => { strongbox(g, Math.PI + 0.25); stink(g, t, cam); } });
}
// 2. ROME. THE EMPEROR VESPASIAN HAS A PROBLEM: he comes up the street with his money chest, his son behind him, the great
//    amphitheatre rising at the end of the street
const needMid = at("need", /^The$/) + 2.1;
{
  const V = lens(1.0, 0.45, 3.2, 0, -1, 9, 60);
  const v = mover(VESPASIAN_D, 1.76, 0.9, -1.55, 0); v.act("carry", 9, { wait: false, in: 0.01, face: { brow: -0.8, smile: -0.7 } }).walk(mt(v, 9));
  const ti = mover(TITUS_D, 1.84, 1.75, -2.9, 0); ti.walk(mt(ti, 9)); ti.actAt(-1, { armR: arm(40, 10, 150, -30), head: [20, 6, 0] }, 9, { handR: "relaxed", face: { brow: 0.5, gaze: [0.6, 0.2] } }); wag(ti, 0.4, 4, P({ head: [24, 4, 0] }), P({ head: [-18, 4, 0] }), 1.3);
  const streetLen = needMid - cut("hook", "need"), vSteps = feet(v, 1.0, streetLen, { g: 1.35, p: -0.2 });      // his figures are played at t + 1.0
  add({ id: "street", a: cut("hook", "need"), b: needMid, still: 1.5,
    // the emperor's heavy steps, his son's lighter ones, and the creak of the chest on every second step of the emperor
    sounds: [...vSteps, ...feet(ti, 1.0, streetLen, { g: 0.8, p: 0.25 }), ...vSteps.filter((_, i) => i % 2 === 1).map((c): Sound => ({ t: c.t + 0.03, k: "creak", dur: 0.45, g: 0.5, p: -0.2 }))],
    cam: () => V.cam, sun: { target: [0.8, 0, 0], reach: 9 },
    cast: (t) => [play("ti", TITUS_D, ti, t + 1.0, [0, 0, 0], 1.84, { seed: 5 }), play("v", VESPASIAN_D, v, t + 1.0, [0, 0, 0], 1.76)],
    things: (g, c) => { const m = ahead(c.v, between(c.v.joint("wrL"), c.v.joint("wrR")), 0.2), ch = put(g, CHEST_EMPTY(), [m[0], m[1] - 0.22, m[2]], 0); lid(ch, 0); } });
}
// 3. THE TREASURY IS EMPTY: he turns the chest over and shakes it; one coin falls out, bounces and rolls away; his son looks in
//    and claps a hand to his brow
{
  const V = lens(2.0, 1.3, 2.6, -0.6, -0.8, -3, 54), [vx, vz] = V.spot(2.4, -0.25), [tx, tz] = V.spot(3.05, 0.62);
  const v = mover(VESPASIAN_D, 1.76, vx, vz, V.toward(vx, vz, -14)); v.stand(6);
  v.actAt(-1, { armL: arm(74, 14, 118, -6), armR: arm(74, 14, 118, -6), lean: 4, head: [0, 16, 0] }, 9, { in: 0.2, handL: "grip", handR: "grip", face: { brow: -0.6, smile: -0.6, gaze: [0, 0.8] } });
  wag(v, 0.35, 0.9, P({ py: 0.02, roll: 3 }), P({ py: -0.02, roll: -3 }), 0.22);
  v.actAt(1.25, { head: [-10, 30, 0] }, 9, { in: 0.2, face: { brow: -1, smile: -1, lid: 0.25, gaze: [-0.5, 0.9] } });
  const ti = mover(TITUS_D, 1.84, tx, tz, V.toward(tx, tz, -26)); ti.stand(6);
  ti.actAt(-1, { lean: 16, head: [-16, 14, 0], armL: arm(20, 14, 60, 10), armR: arm(20, 14, 60, 10) }, 2.4, { out: 0.2, face: { brow: 0.8, wide: 0.5, gaze: [-0.6, 0.5] } });
  ti.actAt(1.3, { armR: arm(120, 16, 200, -40), lean: -4, head: [0, 12, 0] }, 9, { in: 0.18, over: 2.2, handR: "open", face: { brow: -0.4, lid: 0.9, smile: -0.8 } });
  const DROP = 0.5, FALL = 0.4, BOUNCE = Math.PI / 8, SLAP = 1.3 + 0.18 - 0.02, dropAt = DROP + FALL;       // the coin leaves the box, falls for FALL s, bounces every BOUNCE s; his son's hand lands at SLAP
  add({ id: "empty", a: needMid, b: cut("need", "guess"), still: 0.7,
    // the box turned over and shaken (0.35 to 1.25 s), the coin landing, bouncing twice and rolling off, the hand slapped to the brow
    sounds: [{ t: 0.35, k: "rattle", dur: 0.9, g: 0.8, p: -0.2 }, { t: dropAt, k: "coin", p: 0.15 }, { t: dropAt + BOUNCE, k: "coin", g: 0.5, p: 0.2 }, { t: dropAt + 2 * BOUNCE, k: "coin", g: 0.25, p: 0.25 },
      { t: dropAt + 0.4, k: "coinroll", dur: 0.8, g: 0.5, p: 0.3 }, { t: SLAP, k: "tap", g: 1.1, p: 0.3 }],
    cam: (_t, u) => V.push(0.15 * u), sun: { target: [0.5, 0, 0.8], reach: 6 },
    cast: (t) => [play("ti", TITUS_D, ti, t, [0, 0, 0], 1.84, { seed: 5 }), play("v", VESPASIAN_D, v, t, [0, 0, 0], 1.76)],
    things: (g, c, t, _T, cam) => {
      const flip = smooth((t - 0.05) / 0.3), mid = ahead(c.v, between(c.v.joint("wrL"), c.v.joint("wrR")), 0.22), ch = put(g, CHEST_EMPTY(), [mid[0], mid[1] - 0.2 + 0.3 * flip, mid[2]], c.v.heading * Math.PI / 180);
      ch.rotation.z = Math.PI * flip + 0.16 * Math.sin(t * 28) * (t > 0.35 && t < 1.25 ? 1 : 0); lid(ch, flip);
      // the one coin: it drops out, bounces twice and rolls off; it falls in the open between the two men, on the lens side
      const u = t - DROP; if (u > 0) { const fall = FALL, y = u < fall ? 1.02 - 0.945 * (u / fall) ** 2 : 0.075 + Math.abs(Math.sin((u - fall) * 8)) * 0.22 * Math.exp(-(u - fall) * 2.4), roll = Math.max(0, u - fall), p0 = near(between(c.v.at, c.ti.at, 0.5), cam, 0.55);
        const k = put(g, COIN_BIG(), [p0[0] + roll * 0.3, y, p0[2] + roll * 0.12], 0); k.rotation.set(Math.PI / 2, 0.9, u * 9); }
    } });
}
// 4. "MY GUESS WAS A FINE FOR PEEING IN THE STREET": Sir Digsworth marches up to the man at the jar with a wagging finger; the man
//    takes fright and runs. "WRONG!": Sir Digsworth starts back
const guessWrong = at("guess", /Wrong/) - cut("need", "guess");
{
  const V = lens(0.3, 0.9, 3.8, 1, 0, 8, 56);
  const sir = mover(SIR_D, 1.8, 3.25, 5.05, 180); sir.walk(mt(sir, 0.94)).stand(0.1); const stop = sir.t;
  wag(sir, -0.4, guessWrong + 0.3, P({ armR: arm(104, 6, 150, 0), lean: 8, head: [0, -4, 0] }), P({ armR: arm(96, 6, 118, 0), lean: 8, head: [0, -4, 0] }), 0.36, { handR: "point", face: { brow: -0.8, smile: -0.4 } });
  sir.actAt(guessWrong - 0.1, "recoil", 4, { in: 0.14, over: 2.4, face: { wide: 1, lid: 0, brow: 1, mouth: 0.5 } }); sir.stand(5);
  const man = mover(CITIZEN_D, 1.68, 2.95, 3.27, 62); man.actAt(-1, { armL: arm(26, 8, 60, -30), armR: arm(26, 8, 60, -30), head: [-8, 10, 0] }, stop + 0.9, { out: 0.16 });
  man.stand(stop - 0.25).act("recoil", 0.42, { in: 0.12, face: { wide: 1, lid: 0, brow: 1, mouth: 0.7 } }).turn(118, 0.3).walk(mt(man, 7), { run: true });
  const guessLen = cut("guess", "wash") - cut("need", "guess");
  add({ id: "guess", a: cut("need", "guess"), b: cut("guess", "wash"), still: 1.25,
    // Sir Digsworth's marching steps, the other man's running steps (the Mover marks them as runs), the scuff as he starts at "Wrong!"
    sounds: [...feet(sir, 0, guessLen, { g: 1, p: -0.1 }), ...feet(man, 0, guessLen, { g: 0.9, p: 0.3 }), { t: guessWrong, k: "scuff", g: 0.9, p: -0.1 }],
    cam: (_t, u) => V.push(0.12 * u), sun: { target: [3, 0, 3.8], reach: 6 },
    cast: (t, T) => [play("man", CITIZEN_D, man, t, [0, WALK, 0], 1.68, { seed: 7 }), play("sir", SIR_D, sir, t, [0, WALK, 0], 1.8, { talk: talk(W, T, ["guess"]) })],
    things: (g, _c, t, _T, cam) => stink(g, t, cam) });
}
// 5. PEE WAS USEFUL: in his laundry the fuller pours a jug of it into a stall; Sir Digsworth leans in to look, and wishes he had not
const washMid = at("wash", /Laundries/) - 0.08;
const [ux, uy, uz] = ROME.tub;
/** the washing in the tub: cloth in folds that sink under the foot that comes down and bulge beside it, and what splashes out in
 *  arcs each time a foot lands. `down` = which side is pressed (-1, 1) and how far (0..1) */
const washing = (into: THREE.Group, t: number, period = 0.5, splash = true) => {
  const ph = (t / period) % 2, side = ph < 1 ? 1 : -1, press = Math.sin(Math.PI * (ph % 1));
  for (const [dx, dz, w, k, col] of [[-0.24, 0.1, 0.3, -1, "#fbf6ea"], [0.24, -0.08, 0.3, 1, "#fbf6ea"], [0, 0.26, 0.26, 0, "#f1e4c4"], [0.02, -0.28, 0.26, 0, "#f1e4c4"], [-0.02, 0, 0.22, 0, "#fbf6ea"]] as [number, number, number, number, string][])
    into.add(mesh(ball(1, 12), col, { at: [ux + dx, uy + 0.3, uz + dz], scale: [w, 0.1 + 0.07 * (k === 0 ? 0.3 * press : k === side ? -press : press), w * 0.8], rot: [0, dx * 3, 0], line: 0.7 }));
  if (!splash) return;
  // drops thrown out to both sides from the foot that has just landed
  const u = ph % 1; if (u < 0.7) for (let k = 0; k < 14; k++) { const a = (k / 14) * 6.283 + Math.floor(t / period) * 1.3, v = 1.1 + 0.7 * ((k * 7) % 3) / 2, tt = u * period, x = Math.cos(a) * v * tt, z = Math.sin(a) * v * tt, y = 0.34 + (3.0 + 0.6 * (k % 3)) * tt - 7 * tt * tt;
    if (y > 0.05) into.add(mesh(ball(0.036 - 0.012 * u, 8), "#d9c23c", { at: [ux - side * 0.2 + x, uy + y, uz + z], line: 0, shadow: false })); }
};
{
  // the lens stands at the shop's door: the tub in front, the fuller behind it on the left tipping a jug into it, Sir Digsworth
  // bending in from the right
  const V = lens(ux - 2.25, 1.25, uz, 1, 0, -8, 60), [fx, fz] = V.spot(2.75, -0.56), [qx, qz] = V.spot(2.7, 0.4);
  const f = mover(FULLER_D, 1.74, fx, fz, 28); f.stand(6); f.actAt(-1, { lean: 10, armR: arm(64, 8, 104, 0), armL: arm(52, 8, 92, 0), head: [-10, 14, 0] }, 9, { in: 0.2, handR: "grip", handL: "grip", face: { smile: 0.36, brow: 0.3, gaze: [0.5, 0.7] } });
  const sir = mover(SIR_D, 1.8, qx, qz, 196); sir.stand(6); sir.actAt(-1, { lean: 30, py: -0.08, head: [0, 4, 0], armL: arm(20, 16, 60, 10), armR: arm(30, 10, 90, 0) }, 1.8, { out: 0.16, face: { brow: 0.9, wide: 0.5, gaze: [-0.5, 0.7] } });
  sir.actAt(0.7, { ...NOSE, lean: -5, py: -0.1, head: [0, -6, 0] }, 4, { in: 0.16, over: 2.2, handR: "relaxed", face: { ...DISGUST, wide: 0.6, lid: 0, gaze: [-0.5, 0.6] } });
  const pourLen = washMid - cut("guess", "wash");
  add({ id: "pour", a: cut("guess", "wash"), b: washMid, still: 0.4,
    // the stream runs the whole shot; Sir Digsworth pulls back with the hand to his nose at 0.7 s (in 0.16 s)
    sounds: [{ t: 0, k: "pour", dur: pourLen, g: 0.9, p: -0.2 }, { t: 0.7 + 0.04, k: "scuff", g: 0.8, p: 0.3 }],
    cam: (_t, u) => V.push(0.1 * u), sun: { target: [6, 0, 0], reach: 6 },
    cast: (t) => [play("f", FULLER_D, f, t, [0, uy, 0], 1.74, { seed: 9 }), play("sir", SIR_D, sir, t, [0, uy, 0], 1.8)],
    things: (g, c, t, _T, cam) => {
      // the jug lies across his hands in the plane of the picture, its mouth down toward the tub; what runs out falls straight into the washing
      const m = between(c.f.joint("wrL"), c.f.joint("wrR")), jb = near([m[0], m[1] + 0.02, m[2] - 0.1], cam, 0.14), j = put(g, JUG(), jb, 0), tilt = 2.0; j.rotation.set(tilt, 0, 0);
      const mz = jb[2] + Math.sin(tilt) * 0.62, my = jb[1] + Math.cos(tilt) * 0.62, y1 = uy + 0.32;
      for (let i = 0; i < 7; i++) { const u0 = i / 7, u1 = (i + 1) / 7, q = (u: number): V3 => [jb[0], my - (my - y1) * u * u, mz + (uz - 0.05 - mz) * u]; g.add(rod(q(u0), q(u1), 0.02 + 0.004 * Math.sin(t * 30 + i), "#d9c23c", { line: 0, shadow: false })); }
      washing(g, t, 0.5, false);
    } });
}
// 6. LAUNDRIES WASHED WOOL WITH IT: from the side, at the height of the tub's brim, the fuller treads the cloth: one knee up, then
//    the other, the cloth sinking under each foot and the wash flying out
{
  const V = lens(ux - 2.6, 1.3, uz, 1, 0, 0, 50);
  const f = mover(FULLER_D, 1.74, ux, uz, 0); f.stand(6); f.actAt(-1, { lean: 8, armL: arm(30, 20, 96, 10), armR: arm(30, 20, 96, 10), head: [0, 12, 0] }, 9, { handL: "fist", handR: "fist", face: { smile: 0.36, brow: 0.5, lid: 0.12, gaze: [0, 0.7] } });
  tread(f, -0.5, 6, 0.5, 86); wag(f, -0.5, 6, P({ armL: arm(46, 20, 110, 10), armR: arm(10, 20, 70, 10) }), P({ armL: arm(10, 20, 70, 10), armR: arm(46, 20, 110, 10) }), 1.0);
  const treadLen = cut("wash", "tax") - washMid, TREAD0 = -0.5, TREAD_P = 0.5;       // tread(f, TREAD0, 6, TREAD_P): the cloth gives under a foot at the start of each period
  const treads: Sound[] = []; for (let i = 0; ; i++) { const t = TREAD0 + TREAD_P * (i + 1) - 0.02; if (t > treadLen) break; if (t < -0.05) continue; const tc = Math.max(0, t);
    treads.push({ t: tc, k: "squelch", g: 1, p: i % 2 ? 0.1 : -0.1 }); if (i % 2) treads.push({ t: tc + 0.02, k: "splash", big: 0.35, g: 0.6, p: 0.1 }); }
  add({ id: "tread", a: washMid, b: cut("wash", "tax"), still: 0.62,
    // a squelch for every foot that comes down in the tub, a small splash with every second one
    sounds: treads,
    cam: (_t, u) => V.push(0.12 * u), sun: { target: [6, 0, 0], reach: 6 },
    cast: (t) => [play("f", FULLER_D, f, t, [0, uy + 0.2, 0], 1.74, { seed: 9, blink: false })],
    things: (g, _c, t) => { washing(g, t - 0.5 + 6 * 0.5, 0.5); const j = put(g, JUG(), [ux - 1.15, uy, uz + 0.95], 0); j.rotation.z = 0; g.add(mesh(box(0.5, 0.05, 0.42), "#f1e4c4", { at: [ux - 1.0, uy + 0.03, uz - 0.9], rot: [0, 0.5, 0] })); } });
}
// 7. SO VESPASIAN PUT A TAX ON IT: he points at the jar; the collector, a man with a wax tablet, sets his strongbox down beside it
{
  const V = lens(0.25, 1.5, 3.6, 1, 0, -6, 62), [vx, vz] = V.spot(2.45, -0.44), [cx, cz] = V.spot(3.0, 0.66);
  const v = mover(VESPASIAN_D, 1.76, vx, vz, V.toward(vx, vz, 22)); v.stand(6);
  v.actAt(-0.3, { armL: arm(20, 28, 24, 36), lean: 6, head: [-26, 12, 0] }, 9, { in: 0.22, handL: "point", face: { brow: -0.4, smile: 0.38, gaze: [0.6, 0.7] } }); wag(v, 0.4, 3, P({ armL: arm(20, 28, 24, 36) }), P({ armL: arm(26, 24, 36, 30) }), 0.6, { handL: "point" });
  v.actAt(1.0, { head: [26, 2, 0], armR: arm(40, 24, 112, 24), lean: 2 }, 0.75, { in: 0.18, out: 0.22, antic: 0.3, over: 1.6, handR: "open", face: { brow: 0.6, smile: 0.38, gaze: [0.9, 0] } });
  v.actAt(1.8, { armL: arm(36, 24, 54, 30), lean: 11 }, 0.4, { in: 0.1, out: 0.2, antic: 0.4, over: 1.8, handL: "point" });
  const col = mover(COLLECTOR_D, 1.78, cx, cz + 0.5, 180); col.walk(mt(col, 0.5)).turn(48, 0.3).stand(5);
  col.actAt(-1, { armL: arm(40, 10, 104, -14), armR: arm(44, 12, 96, -30), head: [0, 12, 0] }, 9, { handL: "grip", handR: "point", face: { gaze: [-0.5, 0.5], smile: 0.36 } });
  wag(col, 1.0, 3, P({ armR: arm(44, 12, 96, -30), head: [0, 16, 0] }), P({ armR: arm(48, 10, 104, -22), head: [0, 16, 0] }), 0.3, { handR: "point" });
  const taxLen = cut("tax", "titus") - cut("wash", "tax");
  add({ id: "tax", a: cut("wash", "tax"), b: cut("tax", "titus"), still: 1.5,
    // the stylus on the wax with each swing of the collector's hand (wag at 1.0 s, 0.3 s a swing), a whoosh as the emperor's arm points (and again at his wag at 0.4 s), the collector's steps
    sounds: [{ t: 0.02, k: "whoosh", dur: 0.25, g: 0.35, p: -0.2 }, { t: 0.4 - 0.08, k: "whoosh", dur: 0.2, g: 0.25, p: -0.2 }, ...feet(col, 0, taxLen, { g: 0.7, p: 0.3 }), ...swings(1.0, 3, 0.3, taxLen).map((t): Sound => ({ t, k: "scratch", g: 0.7, p: 0.3 }))],
    cam: (_t, u) => V.push(0.1 * u), sun: { target: [3, 0, 3.8], reach: 6 },
    cast: (t) => [play("col", COLLECTOR_D, col, t, [0, WALK, 0], 1.78, { seed: 6 }), play("v", VESPASIAN_D, v, t, [0, WALK, 0], 1.76)],
    things: (g, c, t, _T, cam) => { strongbox(g, -Math.PI / 2); const p = near(c.col.joint("tipL"), cam, 0.05), k = put(g, TABLET(), [p[0], p[1] + 0.06, p[2]], 0); k.lookAt(cam.pos[0], p[1], cam.pos[2]); stink(g, t, cam); } });
}
// 8. HIS SON TITUS COMPLAINED: Titus leans away from the jar with a hand over his nose and jabs a finger at it
{
  const V = lens(0.9, 1.4, 3.9, 1, 0, 0, 54), [tx, tz] = V.spot(2.0, 0.2);
  const ti = mover(TITUS_D, 1.84, tx, tz, V.toward(tx, tz, 24)); ti.stand(0.15).step("L", -0.14, 0.18).stand(5);
  ti.actAt(-1, { ...NOSE, lean: -8, roll: -8, head: [-16, -4, -6] }, 9, { in: 0.2, handR: "relaxed", face: { brow: -1, lid: 0.25, smile: -1, gaze: [-0.8, 0.5] } });
  wag(ti, 0.3, 4, P({ armL: arm(46, -10, 54, -40) }), P({ armL: arm(72, 0, 98, -14) }), 0.5, { handL: "point" });
  wag(ti, 0.2, 4, P({ head: [-24, -4, -6], roll: -11 }), P({ head: [-6, -4, -6], roll: -5 }), 0.44);
  ti.actAt(1.2, { armL: arm(100, 24, 156, 30), lean: -15, py: 0.02 }, 0.5, { in: 0.14, out: 0.2, antic: 0.4, over: 1.8, handL: "open" });
  const titusLen = cut("titus", "coin") - cut("tax", "titus");
  add({ id: "titus", a: cut("tax", "titus"), b: cut("titus", "coin"), still: 1.0,
    // his step back, and a small whoosh on each jab of his finger (wag at 0.3 s, a jab every 0.5 s); the flies
    sounds: [...feet(ti, 0, titusLen, { g: 0.7, p: 0.2 }), ...swings(0.3, 4, 0.5, titusLen, -0.07).map((t): Sound => ({ t, k: "whoosh", dur: 0.2, g: 0.3, p: 0.2 }))],
    beds: [{ k: "flies", a: 0, b: titusLen, g: 0.8 }],
    cam: (_t, u) => V.push(0.1 * u), sun: { target: [3, 0, 3.9], reach: 6 },
    cast: (t) => [play("ti", TITUS_D, ti, t, [0, WALK, 0], 1.84, { seed: 5 })],
    things: (g, _c, t, _T, cam) => { strongbox(g, -Math.PI / 2); stink(g, t, cam); } });
}
// 9. THE EMPEROR HELD A COIN UNDER HIS NOSE. "DOES IT SMELL?": the emperor in profile, the coin between finger and thumb, his son
//    drawing his head back from it; the amphitheatre far down the street
const coinAsk = at("coin", /Does/) - cut("titus", "coin");
{
  const V = lens(0.9, 1.5, 3.9, 0, -1, -2, 52), [vx, vz] = V.spot(2.15, -0.32), [tx, tz] = V.spot(2.6, 0.24);
  const v = mover(VESPASIAN_D, 1.76, vx, vz, 86); v.stand(6);
  v.actAt(-0.25, { armR: arm(88, 4, 124, 0), handR: 20, lean: 7, head: [0, -6, 0] }, 9, { in: 0.3, over: 2.0, handR: "point", face: { brow: 0.6, smile: 0.38 } });
  const ti = mover(TITUS_D, 1.84, tx, tz, -62); ti.stand(6);
  ti.actAt(-0.15, { lean: -10, pz: -0.04, head: [10, -6, 0], armL: arm(40, 20, 130, 10) }, 9, { in: 0.22, over: 2.2, handL: "open", face: { brow: 0.9, wide: 0.6, lid: 0, gaze: [-0.9, 0.5], smile: -0.6 } });
  ti.actAt(coinAsk + 0.25, { lean: 0, head: [10, 4, 0] }, 4, { in: 0.3, face: { brow: 0.4, lid: 0.3, gaze: [-0.9, 0.6], smile: -0.2 } });
  v.actAt(0.9, { armR: arm(92, 4, 128, 0), lean: 11, pz: 0.03 }, 0.5, { in: 0.14, out: 0.2, antic: 0.3, over: 1.6, handR: "point" });
  v.actAt(coinAsk - 0.1, { armR: arm(94, 4, 132, 0), lean: 12, head: [0, -10, 4] }, 1.2, { in: 0.18, out: 0.3, antic: 0.3, over: 1.6, handR: "point", face: { brow: 1, smile: 0.38 } });
  ti.actAt(0.95, { lean: -17, pz: -0.07, head: [10, -10, 0] }, 0.6, { in: 0.14, out: 0.25, antic: 0.2, over: 1.6 });
  ti.actAt(1.7, { lean: -3, head: [10, 8, 0] }, 0.45, { in: 0.2, out: 0.2, antic: 0.2, over: 1.3, face: { brow: 0.6, lid: 0.35, gaze: [-0.9, 0.7], smile: -0.4 } });
  wag(ti, coinAsk + 0.5, 2, P({ head: [24, 4, 0] }), P({ head: [-2, 4, 0] }), 0.36);
  add({ id: "coin", a: cut("titus", "coin"), b: cut("coin", "yet"), still: 2.6,
    // the coin comes up into the hold (his arm arrives at -0.25 + 0.3 s) and his son draws his head back (from -0.15 s, in 0.22 s)
    sounds: [{ t: -0.25 + 0.3 + 0.05, k: "ting", g: 0.8, p: -0.2 }, { t: 0.02, k: "scuff", g: 0.6, p: 0.3 }, { t: 0.9, k: "whoosh", dur: 0.2, g: 0.3, p: -0.2 }, { t: 0.97, k: "scuff", g: 0.5, p: 0.3 }, { t: 1.72, k: "sniff", g: 0.9, p: 0.25 }, { t: coinAsk - 0.1, k: "whoosh", dur: 0.2, g: 0.3, p: -0.2 }],
    cam: (_t, u) => V.push(0.3 * smooth(u)), sun: { target: [0.9, 0, 1.6], reach: 5 },
    cast: (t, T) => [play("ti", TITUS_D, ti, t, [0, 0, 0], 1.84, { seed: 5 }), play("v", VESPASIAN_D, v, t, [0, 0, 0], 1.76, { seed: 4, talk: t > coinAsk - 0.05 ? talk(W, T, ["coin"]) : 0 })],
    things: (g, c, _t, _T, cam) => { const p = near(c.v.joint("tipR"), cam, -0.03), k = put(g, COIN(), [p[0] + 0.035, p[1] + 0.02, p[2]], 0); k.rotation.set(Math.PI / 2, 0, 0); } });
}
// 10. "NO. YET IT COMES FROM PEE.": the emperor laughs and flips the coin high
{
  // he stands where he stood in the coin scene; the lens has come round to his front, the same street behind him
  const C9 = lens(0.9, 1.5, 3.9, 0, -1, -2, 52), [vx, vz] = C9.spot(2.15, -0.32), V = lens(1.75, 0.85, 4.15, -0.36, -0.93, 3, 50), [tx, tz] = V.spot(4.2, 0.56);
  const v = mover(VESPASIAN_D, 1.76, vx, vz, V.toward(vx, vz, -12)); v.stand(6);
  v.actAt(-1, { armR: arm(40, 10, 122, 4), armL: arm(30, 10, 104, -40), lean: -8, head: [6, -10, 4] }, 9 + 1, { handR: "fist", handL: "open", face: { smile: 1, lid: 0.06, wide: 0.3, brow: 0.9 } });
  // his son, behind him: shakes his head ("No"), throws up a hand and stalks off down the street
  const h0 = V.toward(tx, tz, -30), away = (Math.atan2(-0.2, -0.93) * 180) / Math.PI, ti = mover(TITUS_D, 1.84, tx, tz, h0);
  ti.stand(0.95).turn(((away - h0 + 540) % 360) - 180, 0.35).walk(mt(ti, 6));
  ti.actAt(-1, { armL: arm(40, 10, 100, -50), armR: arm(44, 10, 104, -50), head: [-10, 4, 0] }, 0.85 + 1, { in: 0.01, out: 0.15, handL: "fist", handR: "fist", face: { brow: -0.8, lid: 0.3, smile: -0.8, gaze: [-0.7, 0] } });
  wag(ti, 0.02, 0.7, P({ head: [-30, 4, 0] }), P({ head: [10, 4, 0] }), 0.34);
  ti.actAt(0.8, { armR: arm(120, 30, 176, 20), lean: -4 }, 0.6, { in: 0.16, out: 0.3, antic: 0.3, over: 1.8, handR: "open", face: { brow: -1, lid: 0.3, smile: -1 } });
  for (const t0 of [0.3, 1.2]) v.actAt(t0, { armR: arm(60, 10, 150, 4), py: 0.014 }, 0.26, { in: 0.08, out: 0.16, antic: 0.3, over: 2 });
  wag(v, 0.1, 3, P({ py: 0.012, lean: -11 }), P({ py: -0.008, lean: -5 }), 0.3);
  const TOSS = [0.36, 1.26], FLIGHT = 0.75, yetLen = cut("yet", "point") - cut("coin", "yet");       // the coin leaves his hand at each TOSS and is caught FLIGHT s later
  add({ id: "yet", a: cut("coin", "yet"), b: cut("yet", "point"), still: 0.62,
    // a ting as each toss leaves his thumb, a tap as the coin lands in his palm
    sounds: [...TOSS.flatMap((t0): Sound[] => [{ t: t0, k: "ting", g: 0.8, p: -0.1 }, ...(t0 + FLIGHT < yetLen ? [{ t: t0 + FLIGHT, k: "tap", g: 0.7, p: -0.1 } as Sound] : [])]), ...feet(ti, 0, yetLen, { g: 0.6, p: 0.35 })],
    cam: (_t, u) => V.push(0.12 * u), sun: { target: [0.7, 0, 1.2], reach: 6 },
    cast: (t, T) => [play("ti", TITUS_D, ti, t, [0, 0, 0], 1.84, { seed: 5 }), play("v", VESPASIAN_D, v, t, [0, 0, 0], 1.76, { seed: 4, blink: false, talk: Math.max(0.55, talk(W, T, ["yet"])) })],
    things: (g, c, t, _T, cam) => { const p = near(c.v.joint("tipR"), cam, 0.06); let up = 0, spin = 0; for (const t0 of TOSS) { const u = (t - t0) / FLIGHT; if (u > 0 && u < 1) { up = 0.5 * 4 * u * (1 - u); spin = u * 18.8; } }
      const k = put(g, COIN_BIG(), [p[0], p[1] + 0.12 + up, p[2]], 0); k.rotation.set(Math.PI / 2 + spin, 0.3, 0); } });
}
// 11. THAT IS WHY ROME TAXED PEE: the coin lands on the heap in the strongbox by the jar; the collector marks it on his tablet
const pointMid = at("point", /^The$/) - 0.12;
{
  const V = lens(1.15, 1.35, 5.15, 0.75, -0.66, -9, 54), [cx, cz] = V.spot(2.75, -0.48);
  const col = mover(COLLECTOR_D, 1.78, cx, cz, V.toward(cx, cz, 16)); col.stand(6);
  col.actAt(-1, { py: -0.5, lean: 30, armL: arm(46, 10, 110, -16), armR: arm(50, 12, 100, -34), head: [0, 18, 0] }, 9, { handL: "grip", handR: "point", face: { gaze: [-0.3, 0.8], smile: 0.6 } });
  wag(col, 0.6, 3, P({ armR: arm(50, 12, 100, -34) }), P({ armR: arm(54, 10, 108, -24) }), 0.3, { handR: "point" });
  const HEAP_FALL = 0.34, heapLen = pointMid - cut("yet", "point");       // the coin lands on the heap at HEAP_FALL and bounces every PI/16 s
  add({ id: "heap", a: cut("yet", "point"), b: pointMid, still: 0.2,
    // the coin in the chest, louder, two small bounces; then the stylus on the tablet (wag at 0.6 s, 0.3 s a swing)
    sounds: [{ t: HEAP_FALL, k: "coin", g: 1.5, p: -0.1 }, { t: HEAP_FALL + Math.PI / 16, k: "coin", g: 0.6, p: -0.1 }, { t: HEAP_FALL + 2 * Math.PI / 16, k: "coin", g: 0.3, p: -0.1 },
      ...swings(0.6, 3, 0.3, heapLen).map((t): Sound => ({ t, k: "scratch", g: 0.7, p: 0.3 }))],
    cam: (_t, u) => V.push(0.12 * u), sun: { target: [3, 0, 3.9], reach: 5 },
    cast: (t) => [play("col", COLLECTOR_D, col, t, [0, WALK, 0], 1.78, { seed: 6 })],
    things: (g, c, t, _T, cam) => { strongbox(g, -0.85);
      // the emperor's coin drops in from above, lands on the heap and settles
      const fall = HEAP_FALL, u = t / fall, top: V3 = [BOX[0], WALK + 0.5, BOX[2]], k = put(g, COIN_BIG(), u < 1 ? [top[0] - 0.1 * (1 - u), top[1] + 1.15 * (1 - u * u), top[2] + 0.25 * (1 - u)] : [top[0], top[1] + 0.07 * Math.abs(Math.sin((t - fall) * 16)) * Math.exp(-(t - fall) * 7), top[2]], 0); k.rotation.set(u < 1 ? u * 9 : 0.25, 0, u < 1 ? u * 5 : 0.2);
      const p = near(c.col.joint("tipL"), cam, 0.05), tb = put(g, TABLET(), [p[0], p[1] + 0.06, p[2]], 0); tb.lookAt(cam.pos[0], cam.pos[1], cam.pos[2]); stink(g, t, cam); } });
}
// 12. THE MONEY DID NOT SMELL: Sir Digsworth, beside the jar and its flies, holds one coin to his nose and finds nothing wrong with it
{
  const V = lens(3.12, 1.6, JZ + 3.1, 0, -1, -2, 52), [qx, qz] = V.spot(2.25, -0.26);
  const sir = mover(SIR_D, 1.8, qx, qz, V.toward(qx, qz, 10)); sir.stand(6);
  sir.actAt(-1, { armL: arm(75, 14, 172, -39), handL: 0, head: [-4, 4, 0], lean: 3 }, 2.0, { out: 0.3, handL: "point", face: { brow: 0.4, lid: 0.5, gaze: [0, 0.4] } });
  sir.actAt(0.95, { armL: arm(60, 40, 128, 44), head: [8, -4, -4], lean: -3 }, 9, { in: 0.3, over: 2, handL: "point", face: { brow: 1, smile: 1, wide: 0.3, gaze: [0.5, -0.1] } });
  sir.actAt(1.1, { armR: arm(20, 34, 86, 60) }, 9, { in: 0.25, over: 2, handR: "open" });
  const sniffLen = cut("point", "end") - pointMid;
  add({ id: "sniff", a: pointMid, b: cut("point", "end"), still: 0.3,
    // the coin is already under his nose when the shot opens (held until 0.95 s): a sniff at once and a second, shorter one; at 0.95 s the arm swings out with it
    sounds: [{ t: 0.12, k: "sniff", p: -0.1 }, { t: 0.42, k: "sniff", g: 0.7, p: -0.1 }, { t: 0.95 - 0.05, k: "whoosh", dur: 0.3, g: 0.3, p: 0.1 }],
    beds: [{ k: "flies", a: 0, b: sniffLen, g: 1 }],
    cam: (_t, u) => V.push(0.1 * u), sun: { target: [3, 0, 4], reach: 6 },
    cast: (t, T) => [play("sir", SIR_D, sir, t, [0, WALK, 0], 1.8, { talk: talk(W, T, ["point"]) })],
    things: (g, c, t, _T, cam) => { const p = near(c.sir.joint("tipL"), cam, 0.05), k = put(g, COIN(), [p[0], p[1] - 0.01, p[2]], 0); k.rotation.set(Math.PI / 2, 0, 0); stink(g, t, cam); } });
}
// 13. IN PARIS, STREET URINALS WERE LATER NAMED AFTER HIM: Sir Digsworth comes up the street toward the lens, takes a picture card
//     out of his jacket and holds it up
const endMid = at("end", /Vespasiennes/) - 0.5;
{
  const sir = mover(SIR_D, 1.8, 3.0, 14.7, 180); sir.walk(mt(sir, 3.2)); const stop = sir.t; sir.stand(5);
  // the lens goes backward before him and lets him gain on it; it stops when he stops
  const V = (t: number) => lens(3.2, 0.7, sir.sample(t).z * sir.LL - 2.75 + 0.5 * smooth(t / stop), 0, 1, 12, 62);
  sir.actAt(0.2, { armR: arm(30, -6, 128, -52), lean: 2 }, 0.75, { in: 0.2, out: 0.2, handR: "grip", face: { smile: 0.6, gaze: [0, 0.4] } });
  sir.actAt(0.85, { armR: arm(26, 60, 150, 34), head: [-14, -2, 0] }, 9, { in: 0.25, over: 2, handR: "grip", face: { brow: 0.7, smile: 0.9, gaze: [-0.6, -0.2] } });
  const walkLen = endMid - cut("point", "end");
  add({ id: "walk", a: cut("point", "end"), b: endMid, still: 2.0,
    // his footsteps toward the lens; the hand into the jacket (0.2 s, in 0.2) and the card slid out at 0.85 s, when it appears
    sounds: [...feet(sir, 0, walkLen, { g: 1, p: 0 }), { t: 0.2 + 0.2, k: "paper", g: 0.5 }, { t: 0.85 - 0.04, k: "paper", g: 1 }],
    cam: (t) => V(t).cam, sun: { target: [3, 0, 12.5], reach: 8 },
    cast: (t, T) => [play("sir", SIR_D, sir, t, [0, WALK, 0], 1.8, { talk: talk(W, T, ["end"]) })],
    things: (g, c, t, _T, cam) => { if (t < 0.85) return; const p = near(c.sir.joint("tipR"), cam, 0.05), k = put(g, CARD(), [p[0], p[1] + 0.24, p[2]], 0); k.lookAt(cam.pos[0], p[1] + 0.24, cam.pos[2]); } });
  // 14. VESPASIENNES: he has stopped and holds the card out in front of him, seen from the side with the street behind; he taps the
  //     name with a finger of the other hand, then turns to the lens
  const V2 = lens(3.55, 1.55, 9.75, -0.45, 0.89, 2, 58), [qx, qz] = V2.spot(1.95, 0.21), tip = at("end", /Vespasiennes/) + 0.95 - endMid;
  const s2 = mover(SIR_D, 1.8, qx, qz, 63); s2.stand(8);
  s2.actAt(-1, { armL: arm(50, 6, 150, 0), lean: 4, head: [0, -4, 0] }, 9 + 1, { handL: "grip", face: { brow: 0.8, smile: 1, gaze: [-0.8, 0] } });
  wag(s2, 0.1, tip - 0.2, P({ armR: arm(18, 4, 114, 0) }), P({ armR: arm(18, 4, 126, 0) }), 0.4, { handR: "point" });
  // then he turns to the lens, delighted, the open hand still under the name
  s2.actAt(tip, { armR: arm(18, 4, 108, 0), head: [30, -4, 0], lean: 0 }, 3, { in: 0.22, antic: 0.3, over: 1.6, handR: "open", face: { smile: 1, lid: 0, wide: 0.4, brow: 1, gaze: [0.6, 0] } });
  const cardLen = END - endMid;
  add({ id: "card", a: endMid, b: END, still: 0.75,
    // his finger knocks on the card with each swing of the wag (from 0.1 s, 0.4 s a swing); he turns to the lens at tip (in 0.22 s)
    sounds: [...swings(0.1, tip - 0.2, 0.4, cardLen, 0.4 * 0.5 + 0.05).map((t): Sound => ({ t, k: "tap", g: 0.9, p: -0.3 })), { t: tip + 0.04, k: "whoosh", dur: 0.3, g: 0.5, p: -0.2 }],
    cam: (_t, u) => V2.push(0.1 * u), sun: { target: [3, 0, 11], reach: 6 },
    cast: (t, T) => [play("sir", SIR_D, s2, t, [0, WALK, 0], 1.8, { talk: talk(W, T, ["end"]) })],
    // he holds the card by its near edge, so that the name on it lies under the finger of his other hand
    things: (g, c, _t, _T, cam) => { const h = c.sir.joint("tipL"), p = near([h[0] + 0.892 * 0.17, h[1] - 0.05, h[2] + 0.451 * 0.17], cam, -0.04), k = put(g, CARD(), p, 0); k.lookAt(cam.pos[0], p[1], cam.pos[2]); } });
}

export const ROME_PEE: Film = {
  id: "rome-pee", fps: 30, seconds: END, sky: "#a9dcff", world: romeStreet, shots, words: W,
  hook: { text: ["WHY DID ROME", "TAX PEE?"], a: 0, b: L.hook.b + 0.2 },
  sign: { text: "Dramatised. The story is from Suetonius; nobody knows who paid the tax.", a: L.coin.a + 0.1, b: L.coin.a + 2.1 },
  thumbs: [
    { T: cut("titus", "coin") + 2.5, cam: lens(1.55, 1.5, 3.7, -0.1, -1, -1, 32).cam, words: ["A TAX", "ON PEE?!"], side: "right", at: "middle", size: 132 },
    { T: 1.0, cam: lens(3.75, 1.45, 1.0, -0.12, 1, -9, 44).cam, words: ["ROME", "TAXED", "THIS"], side: "left", at: "middle", size: 120 },
    { T: cut("coin", "yet") + 0.62, cam: lens(1.2, 1.5, 3.95, -0.42, -0.9, -1, 30).cam, words: ["DOES IT", "SMELL?"], side: "left", at: "middle", size: 132 },
  ],
  hits: [], beds: [{ k: "street", a: 0, b: END, g: 1 }], music: "roman", audio: "craft/rome-pee.wav",
};

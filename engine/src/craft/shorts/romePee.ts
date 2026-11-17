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
const END = L.end.b + 1.3;
/** when a word of a line is spoken (film seconds) */
const at = (line: string, re: RegExp) => W.find((w) => w.line === line && re.test(w.w))!.a;
const [JX, , JZ] = ROME.jar, BOX = ROME.box;
const P = (o: Partial<Pose>) => o;

// ---------------- the things of the corner (made once, moved by the shots) ----------------
const CHEST_FULL = once(() => chest(true, true)), CHEST_EMPTY = once(() => chest(true, false, 0.44, 0.28, 0.3)), COIN = once(() => noShade(coin(0.05))), COIN_BIG = once(() => noShade(coin(0.075))), JUG = once(() => amphora(0.62)), TABLET = once(() => noShade(waxTablet()));
const CARD_W = 0.8, CARD_H = 0.6;
const CARD = once(() => { const g = group([mesh(box(CARD_W, CARD_H, 0.02), "#fbf6ea", { shadow: false })]), flat = { line: 0.5, shadow: false } as const;
  // the name across the top, as tall as the card allows; under it a street urinal of Paris, drawn as the round iron kiosk it was (a green
  // drum on a base, a band of small openings, a cap, a lamp) with the city beside it; the foot of the card is left bare for the hands
  const t = painted(["VESPASIENNE"], 0.76, 0.15, { ink: "#2a1a14", bg: "#fbf6ea", line: 0, pad: 0.04 }); t.position.set(0, 0.2, 0.012); g.add(t);
  const k = group([mesh(box(0.2, 0.03, 0.012), "#24523a", { at: [0, -0.115, 0.012], ...flat }), mesh(box(0.17, 0.25, 0.012), "#2f7a52", { at: [0, 0.025, 0.012], ...flat }), mesh(box(0.21, 0.035, 0.012), "#24523a", { at: [0, 0.165, 0.012], ...flat }), mesh(box(0.13, 0.03, 0.012), "#2f7a52", { at: [0, 0.195, 0.012], ...flat }), mesh(box(0.04, 0.06, 0.012), "#f6c95e", { at: [0, 0.24, 0.012], ...flat })]);
  for (const x of [-0.055, -0.018, 0.018, 0.055]) k.add(mesh(box(0.02, 0.05, 0.012), "#fbf6ea", { at: [x, 0.1, 0.016], line: 0, shadow: false }));
  k.scale.set(0.7, 0.7, 1); k.position.set(-0.12, -0.07, 0); g.add(k);
  const t2 = painted(["PARIS"], 0.24, 0.075, { ink: "#b3261e", bg: "#fbf6ea", line: 0 }); t2.position.set(0.23, -0.05, 0.012); g.add(t2); g.traverse((q) => { q.receiveShadow = false; }); return noShade(g); });
const lid = (ch: THREE.Object3D, open: number) => { const l = ch.children.find((c) => c.userData.lid) ?? ch.children[4]; l.rotation.x = -1.9 * open; };
const strongbox = (into: THREE.Group, ry: number, open = 1, p: V3 = BOX) => { const c = put(into, CHEST_FULL(), p, ry); lid(c, open); c.traverse((q) => { q.receiveShadow = false; }); return c; };
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
  const v = mover(VESPASIAN_D, 1.76, 0.9, -1.55, 0); v.act("carry", 9, { wait: false, in: 0.01, face: { brow: -0.8, smile: -0.7 } }).walk(mt(v, 9));
  const ti = mover(TITUS_D, 1.84, 1.75, -2.9, 0); ti.walk(mt(ti, 9)); ti.actAt(-1, { armR: arm(40, 10, 150, -30), head: [20, 6, 0] }, 9, { handR: "relaxed", face: { brow: 0.5, gaze: [0.6, 0.2] } }); wag(ti, 0.4, 4, P({ head: [24, 4, 0] }), P({ head: [-18, 4, 0] }), 1.3);
  // the lens goes backward before them, low over the paving: they stay big and the street slides past
  const V = (t: number, u: number) => lens(1.0, 0.3, v.sample(t + 1.0).z * v.LL + 2.6 - 0.4 * u, 0, -1, 14, 60);
  const streetLen = needMid - cut("hook", "need"), vSteps = feet(v, 1.0, streetLen, { g: 1.35, p: -0.2 });      // his figures are played at t + 1.0
  add({ id: "street", a: cut("hook", "need"), b: needMid, still: 1.5,
    // the emperor's heavy steps, his son's lighter ones, and the creak of the chest on every second step of the emperor
    sounds: [...vSteps, ...feet(ti, 1.0, streetLen, { g: 0.8, p: 0.25 }), ...vSteps.filter((_, i) => i % 2 === 1).map((c): Sound => ({ t: c.t + 0.03, k: "creak", dur: 0.45, g: 0.5, p: -0.2 }))],
    cam: (t, u) => V(t, u).cam, sun: { target: [0.9, 0, 1.6], reach: 10 },
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
  ti.actAt(1.3, { armR: arm(120, 16, 200, -40), lean: -4, head: [0, 12, 0] }, 9, { in: 0.18, over: 2.2, handR: "open", face: { brow: -1, lid: 0.45, smile: -1, gaze: [0, 0.6] } });
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
  // the lens stands at the shop's door: the tub in front on the left, the fuller behind it tipping a jug into it, Sir Digsworth
  // on the floor to the right of it, bending in over the brim
  const V = lens(ux - 2.7, 1.3, uz + 0.3, 1, 0, -6, 62), [fx, fz] = V.spot(3.2, -0.8), [qx, qz] = V.spot(2.75, 0.56);
  const f = mover(FULLER_D, 1.74, fx, fz, 28); f.stand(6); f.actAt(-1, { lean: 10, armR: arm(64, 8, 104, 0), armL: arm(52, 8, 92, 0), head: [-10, 14, 0] }, 9, { in: 0.2, handR: "grip", handL: "grip", face: { smile: 0.36, brow: 0.3, gaze: [0.5, 0.7] } });
  const sir = mover(SIR_D, 1.8, qx, qz, 208); sir.stand(6); sir.actAt(-1, { lean: 24, py: -0.08, head: [0, 4, 0], armL: arm(24, 10, 36, 0), armR: arm(24, 10, 36, 0) }, 1.8, { out: 0.16, face: { brow: 0.9, wide: 0.5, gaze: [-0.5, 0.7] } });
  sir.actAt(0.7, { ...NOSE, lean: -5, py: -0.1, head: [0, -6, 0] }, 4, { in: 0.16, over: 2.2, handR: "relaxed", face: { ...DISGUST, wide: 0.6, lid: 0, gaze: [-0.5, 0.6] } });
  const pourLen = washMid - cut("guess", "wash");
  add({ id: "pour", a: cut("guess", "wash"), b: washMid, still: 0.4,
    // the stream runs the whole shot; Sir Digsworth pulls back with the hand to his nose at 0.7 s (in 0.16 s)
    sounds: [{ t: 0, k: "pour", dur: pourLen, g: 0.9, p: -0.2 }, { t: 0.7 + 0.04, k: "scuff", g: 0.8, p: 0.3 }],
    cam: (_t, u) => V.push(0.1 * u), sun: { target: [6, 0, 0], reach: 6 },
    cast: (t) => [play("f", FULLER_D, f, t, [0, uy, 0], 1.74, { seed: 9 }), { ...play("sir", SIR_D, sir, t, [0, uy, 0], 1.8), noShade: true }],
    things: (g, c, t, _T, cam) => {
      // the jug lies across his hands in the plane of the picture, its mouth down toward the tub; what runs out falls straight into the washing
      const m = between(c.f.joint("wrL"), c.f.joint("wrR")), jb = near([m[0], m[1] + 0.02, m[2] - 0.1], cam, 0.14), j = put(g, JUG(), jb, 0), tilt = 2.0; j.rotation.set(tilt, 0, 0);
      const mz = jb[2] + Math.sin(tilt) * 0.62, my = jb[1] + Math.cos(tilt) * 0.62, y1 = uy + 0.32;
      for (let i = 0; i < 7; i++) { const u0 = i / 7, u1 = (i + 1) / 7, q = (u: number): V3 => [jb[0] + (ux + 0.15 - jb[0]) * u, my - (my - y1) * u * u, mz + (uz - 0.1 - mz) * u]; g.add(rod(q(u0), q(u1), 0.02 + 0.004 * Math.sin(t * 30 + i), "#d9c23c", { line: 0, shadow: false })); }
      washing(g, t, 0.5, false);
    } });
}
// 6. LAUNDRIES WASHED WOOL WITH IT: from the side, at the height of the tub's brim, the fuller treads the cloth: one knee up, then
//    the other, the cloth sinking under each foot and the wash flying out
{
  const V = lens(ux - 2.6, 1.3, uz, 1, 0, 0, 50);
  const f = mover(FULLER_D, 1.74, ux, uz, 0); f.stand(6); f.actAt(-1, { lean: 8, armL: arm(30, 20, 96, 10), armR: arm(30, 20, 96, 10), head: [0, 12, 0] }, 9, { handL: "fist", handR: "fist", face: { smile: 0.36, brow: 0.5, lid: 0.12, gaze: [0, 0.7] } });
  tread(f, -0.5, 6, 0.36, 104); wag(f, -0.5, 6, P({ armL: arm(64, 20, 124, 10), armR: arm(-6, 20, 56, 10), head: [10, 12, 0] }), P({ armL: arm(-6, 20, 56, 10), armR: arm(64, 20, 124, 10), head: [-10, 12, 0] }), 0.72);
  const treadLen = cut("wash", "tax") - washMid, TREAD0 = -0.5, TREAD_P = 0.36;       // tread(f, TREAD0, 6, TREAD_P): the cloth gives under a foot at the start of each period
  const treads: Sound[] = []; for (let i = 0; ; i++) { const t = TREAD0 + TREAD_P * (i + 1) - 0.02; if (t > treadLen) break; if (t < -0.05) continue; const tc = Math.max(0, t);
    treads.push({ t: tc, k: "squelch", g: 1, p: i % 2 ? 0.1 : -0.1 }); if (i % 2) treads.push({ t: tc + 0.02, k: "splash", big: 0.35, g: 0.6, p: 0.1 }); }
  add({ id: "tread", a: washMid, b: cut("wash", "tax"), still: 0.62,
    // a squelch for every foot that comes down in the tub, a small splash with every second one
    sounds: treads,
    cam: (_t, u) => V.push(0.12 * u), sun: { target: [6, 0, 0], reach: 6 },
    cast: (t) => [play("f", FULLER_D, f, t, [0, uy + 0.2, 0], 1.74, { seed: 9, blink: false })],
    things: (g, _c, t) => { washing(g, t - TREAD0 + 4 * TREAD_P, TREAD_P); const j = put(g, JUG(), [ux - 1.15, uy, uz + 0.95], 0); j.rotation.z = 0; g.add(mesh(box(0.5, 0.05, 0.42), "#f1e4c4", { at: [ux - 1.0, uy + 0.03, uz - 0.9], rot: [0, 0.5, 0] })); } });
}
// 7. SO VESPASIAN PUT A TAX ON IT: he jabs a finger at the jar, twice; turns to the collector and swings his open hand up; and brings
//    it down flat on the strongbox's lid, on "tax" and again on "it", so that the gold jumps. The collector, who has set the box down
//    beside the jar, straightens with his tablet, starts at the first blow and writes it down
const TAX_HITS: { t: number; amp: number; dur?: number }[] = [], HOP = once(() => [0, 1, 2].map(() => COIN().clone()));
{
  const V = lens(0.25, 1.5, 3.6, 1, 0, -6, 62), [vx, vz] = V.spot(2.45, -0.44), [cx, cz] = V.spot(3.0, 0.58), T0 = cut("wash", "tax");
  const UP = at("tax", /^put/) - T0 - 0.14, SLAP = [at("tax", /^tax/) - T0 + 0.02, at("tax", /^it/) - T0];
  const v = mover(VESPASIAN_D, 1.76, vx, vz, V.toward(vx, vz, 22)); v.stand(UP).turn(16, 0.26).stand(6);
  // the finger at the jar; drawn back to his chest (when the collector has straightened and stands clear) and stabbed down at it again
  v.actAt(-0.3, { armL: arm(20, 28, 24, 36), lean: 6, head: [-26, 12, 0] }, UP + 0.3 + 0.12, { in: 0.22, out: 0.1, handL: "point", face: { brow: -0.4, smile: 0.38, gaze: [0.6, 0.7] } });
  wag(v, 0.42, UP - 0.42, P({ armL: arm(24, 12, 126, 0), lean: 2 }), P({ armL: arm(20, 28, 24, 36), lean: 8 }), 0.26, { handL: "point" });
  // he turns to the collector; the hand comes in to his shoulder and goes straight up, open (a bent arm, so that it keeps clear of
  // the collector); the other goes to his belt
  v.actAt(UP, { armL: arm(20, 6, 170, 0), lean: -2 }, 0.34, { in: 0.14, out: 0.1, antic: 0, over: 1, handL: "open" });
  v.actAt(UP + 0.12, { armL: arm(148, 18, 164, 8), lean: -4, py: 0.02, head: [30, -8, 0] }, SLAP[0] - UP - 0.16, { in: 0.24, out: 0.1, antic: 0, over: 1.3, handL: "open", face: { brow: 1, smile: 0.7, lid: 0, wide: 0.3, gaze: [0.8, -0.2] } });
  v.actAt(UP, { armR: arm(24, 8, 84, -34) }, 9, { in: 0.3, antic: 0, over: 1.2, handR: "fist" });
  // down on the lid with it, the elbow first; it springs off the wood and comes down again
  v.actAt(SLAP[0] - 0.16, { armL: arm(30, 10, 146, 4), lean: 6 }, 0.2, { in: 0.1, out: 0.08, antic: 0, over: 1, handL: "open" });
  v.actAt(SLAP[0] - 0.08, { armL: arm(14, 10, 40, 10), lean: 13, py: -0.03, head: [12, 14, 0] }, 9, { in: 0.08, antic: 0, over: 1, handL: "open", face: { brow: -0.4, smile: 0.8, gaze: [0.5, 0.8] } });
  v.actAt(SLAP[0] + 0.1, { armL: arm(18, 10, 54, 8), lean: 7, py: 0 }, SLAP[1] - SLAP[0] - 0.1, { in: 0.18, out: 0.12, antic: 0, over: 1, handL: "open" });
  // and he looks round at the collector and nods
  v.actAt(SLAP[1] + 0.06, { head: [34, 2, 0] }, 9, { in: 0.18, antic: 0, over: 1.3, face: { brow: 0.8, smile: 1, gaze: [0.9, 0] } });
  wag(v, SLAP[1] + 0.2, 3, P({ head: [34, 10, 0] }), P({ head: [34, -2, 0] }), 0.3);
  const col = mover(COLLECTOR_D, 1.78, cx, cz, 228); col.stand(6);
  col.actAt(-1, { lean: 38, py: -0.2, armL: arm(52, 8, 40, 0), armR: arm(52, 8, 40, 0), head: [0, 20, 0] }, 0.45 + 1, { in: 0.01, out: 0.4, handL: "open", handR: "open", face: { gaze: [0, 0.9], brow: 0.4 } });
  col.actAt(0.55, { armL: arm(40, 10, 104, -14), armR: arm(42, 2, 98, -42), head: [0, 12, 0] }, 9, { in: 0.4, antic: 0, over: 1.4, handL: "grip", handR: "point", face: { gaze: [-0.5, 0.5], smile: 0.36 } });
  wag(col, 1.0, 3, P({ armR: arm(42, 2, 98, -42), head: [0, 16, 0] }), P({ armR: arm(46, 0, 106, -34), head: [0, 16, 0] }), 0.3, { handR: "point" });
  col.actAt(SLAP[0], { py: 0.04, lean: -6 }, 0.32, { in: 0.08, out: 0.2, antic: 0, over: 1.6, face: { brow: 1, wide: 0.8, lid: 0, gaze: [-0.6, 0.8] } });       // he starts at the blow
  const taxLen = cut("tax", "titus") - T0;
  for (const [i, s] of SLAP.entries()) TAX_HITS.push({ t: T0 + s, amp: i ? 0.25 : 0.35, dur: 0.22 });
  add({ id: "tax", a: T0, b: cut("tax", "titus"), still: 1.5,
    // a small whoosh on each jab of his finger and a larger one as the hand goes up; the flat hand on the lid, twice, and the gold in the box
    // jumping; the box set down at the start, and the collector's stylus on the wax (wag at 1.0 s, 0.3 s a swing)
    sounds: [...swings(0.42, UP - 0.42, 0.26, taxLen, 0.1).map((t): Sound => ({ t, k: "whoosh", dur: 0.18, g: 0.25, p: -0.2 })), { t: UP + 0.05, k: "whoosh", dur: 0.3, g: 0.4, p: -0.2 }, { t: 0.06, k: "thunk", g: 0.8, p: 0.3 },
      { t: SLAP[0], k: "thunk", g: 1.1, p: 0 }, { t: SLAP[0] + 0.05, k: "coin", g: 0.9, p: 0.1 }, { t: SLAP[1], k: "thunk", g: 0.9, p: 0 }, { t: SLAP[1] + 0.05, k: "coin", g: 0.7, p: 0.1 },
      ...swings(1.0, 3, 0.3, taxLen).map((t): Sound => ({ t, k: "scratch", g: 0.7, p: 0.3 }))],
    cam: (_t, u) => V.push(0.1 * u), sun: { target: [3, 0, 3.8], reach: 6 },
    cast: (t) => [play("col", COLLECTOR_D, col, t, [0, WALK, 0], 1.78, { seed: 6 }), play("v", VESPASIAN_D, v, t, [0, WALK, 0], 1.76)],
    things: (g, c, t, _T, cam) => { strongbox(g, -Math.PI / 2); if (t > 0.65) { const p = near(c.col.joint("tipL"), cam, 0.05), k = put(g, TABLET(), [p[0], p[1] + 0.06, p[2]], 0); k.lookAt(cam.pos[0], p[1], cam.pos[2]); }
      // three coins of the heap hop at each blow and fall back on it
      for (const s of SLAP) { const u = (t - s) / 0.34; if (u > 0 && u < 1) HOP().forEach((k, i) => { const a = i * 2.1 + s * 9; put(g, k, [BOX[0] + 0.07 * Math.cos(a) * (1 + u), WALK + 0.5 + (0.16 + 0.05 * i) * 4 * u * (1 - u), BOX[2] + 0.09 * Math.sin(a) * (1 + u)], 0); k.rotation.set(u * (7 + i), 0, u * 4); }); }
      stink(g, t, cam); } });
}
// 8. HIS SON TITUS COMPLAINED: Titus leans away from the jar with a hand over his nose and jabs a finger at it
{
  const V = lens(0.9, 1.4, 3.9, 1, 0, 0, 54), [tx, tz] = V.spot(2.0, 0.06);
  const ti = mover(TITUS_D, 1.84, tx, tz, V.toward(tx, tz, 24)); ti.stand(0.15).step("L", -0.14, 0.18).stand(0.7).step("R", -0.1, 0.18).stand(5);
  ti.actAt(-1, { ...NOSE, lean: -8, roll: -8, head: [-16, -4, -6] }, 9, { in: 0.2, handR: "relaxed", face: { brow: -1, lid: 0.25, smile: -1, gaze: [-0.8, 0.5] } });
  wag(ti, 0.3, 0.76, P({ armL: arm(46, -10, 54, -40) }), P({ armL: arm(72, 0, 98, -14) }), 0.38, { handL: "point" });
  wag(ti, 0.2, 0.9, P({ head: [-24, -4, -6], roll: -11 }), P({ head: [-6, -4, -6], roll: -5 }), 0.44);
  ti.actAt(1.04, { armL: arm(110, 12, 162, 14), lean: -13, py: 0.02 }, 0.42, { in: 0.14, out: 0.16, antic: 0.4, over: 1.8, handL: "open" });
  ti.actAt(1.44, { lean: -14, roll: -9, head: [-34, -2, -8] }, 9, { in: 0.2, antic: 0, over: 1.4, face: { brow: -1, lid: 0.45, smile: -1, gaze: [-0.9, 0.2] } });
  wag(ti, 1.5, 3, P({ armL: arm(62, 14, 142, -6) }), P({ armL: arm(72, 0, 152, -34) }), 0.26, { handL: "open" });
  const titusLen = cut("titus", "coin") - cut("tax", "titus");
  add({ id: "titus", a: cut("tax", "titus"), b: cut("titus", "coin"), still: 1.0,
    // his step back, and a small whoosh on each jab of his finger (wag at 0.3 s, a jab every 0.5 s); the flies
    sounds: [...feet(ti, 0, titusLen, { g: 0.7, p: 0.2 }), ...swings(0.3, 0.76, 0.38, titusLen, -0.07).map((t): Sound => ({ t, k: "whoosh", dur: 0.2, g: 0.3, p: 0.2 })), { t: 1.0, k: "whoosh", dur: 0.25, g: 0.4, p: 0.2 }, ...swings(1.5, 3, 0.26, titusLen).map((t): Sound => ({ t, k: "whoosh", dur: 0.15, g: 0.2, p: 0.2 }))],
    beds: [{ k: "flies", a: 0, b: titusLen, g: 0.8 }],
    cam: (_t, u) => V.push(0.1 * u), sun: { target: [3, 0, 3.9], reach: 6 },
    cast: (t) => [play("ti", TITUS_D, ti, t, [0, WALK, 0], 1.84, { seed: 5 })],
    things: (g, _c, t, _T, cam) => { strongbox(g, -Math.PI / 2); stink(g, t, cam); } });
}
// 9. THE EMPEROR HELD A COIN UNDER HIS NOSE. "DOES IT SMELL?": the coin comes up from the emperor's belt to his son's nose; the son
//    starts back, turns his face away, and sniffs at it after all; the amphitheatre far down the street
const coinAsk = at("coin", /Does/) - cut("titus", "coin");
{
  const V = lens(0.9, 1.5, 3.9, 0, -1, -2, 52), [vx, vz] = V.spot(2.15, -0.44), [tx, tz] = V.spot(2.6, 0.27), UP = 0.4, AWAY = 1.45, SNIFF = 2.05;
  const v = mover(VESPASIAN_D, 1.76, vx, vz, 86); v.stand(6);
  v.actAt(-1, { armR: arm(24, 6, 70, 0), lean: 2 }, UP + 0.1 + 1, { in: 0.01, out: 0.1, handR: "point", face: { brow: 0.4, smile: 0.38, gaze: [0.8, 0] } });
  v.actAt(UP, { armR: arm(68, 4, 130, 0), lean: 7, head: [0, -6, 0] }, 9, { in: 0.2, antic: 0.5, over: 2.0, handR: "point", face: { brow: 0.7, smile: 0.38, gaze: [0.8, -0.2] } });
  v.actAt(AWAY - 0.1, { armR: arm(72, 4, 134, 0), lean: 10, pz: 0.02 }, 9, { in: 0.16, antic: 0.3, over: 1.6, handR: "point" });      // he leans in after him
  v.actAt(coinAsk - 0.1, { head: [0, -12, 6], lean: 11 }, 1.3, { in: 0.18, out: 0.3, antic: 0.3, over: 1.6, face: { brow: 1, smile: 0.38, gaze: [0.8, -0.2] } });
  const ti = mover(TITUS_D, 1.84, tx, tz, -62); ti.stand(6);
  ti.actAt(-1, { armL: arm(40, 10, 100, -50), armR: arm(44, 10, 104, -50), head: [-24, 2, 0], lean: -2 }, UP + 0.15 + 1, { in: 0.01, out: 0.1, handL: "fist", handR: "fist", face: { brow: -0.8, lid: 0.3, smile: -0.8, gaze: [0.6, 0] } });
  ti.actAt(UP + 0.12, { lean: -17, pz: -0.07, head: [10, -10, 0], armL: arm(46, 20, 134, 10), armR: arm(20, 14, 60, 10) }, AWAY - UP, { in: 0.14, out: 0.2, antic: 0, over: 2.2, handL: "open", face: { brow: 1, wide: 0.8, lid: 0, gaze: [-0.9, 0.5], smile: -0.7 } });
  ti.actAt(AWAY, { lean: -14, pz: -0.04, head: [-30, -6, 0], armL: arm(60, 24, 150, 14), armR: arm(20, 14, 60, 10) }, SNIFF - AWAY, { in: 0.14, out: 0.2, antic: 0.2, over: 1.6, handL: "open", face: { brow: -0.6, lid: 0.3, smile: -1, gaze: [0.7, 0] } });
  ti.actAt(SNIFF - 0.1, { lean: -2, pz: 0, head: [10, 12, 0], armL: arm(20, 14, 60, 10), armR: arm(20, 14, 60, 10) }, 9, { in: 0.25, antic: 0.3, over: 1.4, face: { brow: 0.3, lid: 0.35, gaze: [-0.9, 0.8], smile: -0.4 } });
  for (const t0 of [SNIFF + 0.2, SNIFF + 0.5]) ti.actAt(t0, { head: [10, 19, 0], py: -0.012 }, 0.2, { in: 0.07, out: 0.1, antic: 0, over: 1.2 });
  // nothing: he straightens and opens his hands
  ti.actAt(coinAsk + 0.45, { lean: -2, head: [10, -2, 0], armL: arm(30, 30, 84, 40), armR: arm(30, 30, 84, 40) }, 9, { in: 0.25, antic: 0.3, over: 1.6, handL: "open", handR: "open", face: { brow: 1, wide: 0.5, lid: 0, gaze: [-0.9, 0.3], smile: -0.1 } });
  add({ id: "coin", a: cut("titus", "coin"), b: cut("coin", "yet"), still: 2.6,
    // the coin swung up (a ting as it stops under the nose), the son's foot as he starts back, the emperor leaning in, two sniffs
    sounds: [{ t: UP - 0.05, k: "whoosh", dur: 0.25, g: 0.4, p: -0.2 }, { t: UP + 0.2, k: "ting", g: 0.8, p: -0.1 }, { t: UP + 0.16, k: "scuff", g: 0.6, p: 0.3 }, { t: AWAY - 0.1, k: "whoosh", dur: 0.2, g: 0.3, p: -0.2 }, { t: AWAY + 0.04, k: "scuff", g: 0.5, p: 0.3 },
      { t: SNIFF + 0.2, k: "sniff", g: 0.9, p: 0.25 }, { t: SNIFF + 0.5, k: "sniff", g: 0.7, p: 0.25 }],
    cam: (_t, u) => V.push(0.3 * smooth(u)), sun: { target: [0.9, 0, 1.6], reach: 5 },
    cast: (t, T) => [{ ...play("ti", TITUS_D, ti, t, [0, 0, 0], 1.84, { seed: 5, blink: false }), noShade: true }, play("v", VESPASIAN_D, v, t, [0, 0, 0], 1.76, { seed: 4, blink: false, talk: t > coinAsk - 0.05 ? talk(W, T, ["coin"]) : 0 })],
    things: (g, c, _t, _T, cam) => { const p = near(c.v.joint("tipR"), cam, -0.03), k = put(g, COIN(), [p[0] + 0.035, p[1] + 0.02, p[2]], 0); k.rotation.set(Math.PI / 2, 0, 0); } });
}
// 10. "NO. YET IT COMES FROM PEE.": Titus stalks off down the street with his arms folded, shaking his head; the emperor keeps
//     beside him, laughing, flips the coin up from his outer hand as he walks (it flies beside his head, on the side away from his
//     son), catches it and wags a finger at him; Titus throws up a hand and turns his face away. The lens goes
//     backward before them
{
  const yetLen = cut("yet", "point") - cut("coin", "yet"), PRE = 0.9, TX = 1.34, VX = 0.56, Z1 = 2.1;      // they are played PRE seconds into their walk, so they are in stride when the shot opens
  const ti = mover(TITUS_D, 1.84, TX, Z1, 180); ti.walk(mt(ti, 7));
  const v = mover(VESPASIAN_D, 1.76, VX, Z1 + 0.2, 180); v.walk(mt(v, 7), { step: (0.52 * ti.LL) / v.LL });      // the same pace as his son
  ti.actAt(-1, { armL: arm(40, 10, 100, -50), armR: arm(44, 10, 104, -50), head: [0, 6, 0], lean: 4 }, 9 + 1, { in: 0.01, handL: "fist", handR: "fist", face: { brow: -0.9, lid: 0.3, smile: -0.9, gaze: [0, 0.3] } });
  wag(ti, PRE + 0.05, 0.7, P({ head: [-26, 6, 0] }), P({ head: [22, 6, 0] }), 0.34);       // "No"
  const SHOW = 1.2;       // the finger is wagged at him: up goes his outer hand, and his face turns away
  ti.actAt(PRE + SHOW, { armR: arm(123, 23, 174, 13), head: [34, -4, 0], lean: 0 }, 0.6, { in: 0.16, out: 0.24, antic: 0.3, over: 1.4, handR: "open", face: { brow: -1, lid: 0.35, smile: -1, gaze: [0.8, 0] } });
  // the coin is in his outer hand, the one away from his son
  v.actAt(-1, { armL: arm(44, 16, 118, 12), armR: arm(30, 10, 104, -40), lean: -4, head: [-22, -6, 4] }, 9 + 1, { in: 0.01, handL: "fist", handR: "open", face: { smile: 1, lid: 0.06, wide: 0.3, brow: 0.9, gaze: [-0.7, 0] } });
  wag(v, PRE + 0.05, 3, P({ py: 0.014, lean: -8 }), P({ py: -0.006, lean: -2 }), 0.3);       // he laughs
  const TOSS = 0.2, FLIGHT = 0.78, COIN_X = 0.38;       // the coin leaves his hand at TOSS and is caught FLIGHT s later; it flies COIN_X m out from him
  v.actAt(PRE + TOSS - 0.14, { armL: arm(70, 10, 124, 4), py: 0.03 }, 0.4, { in: 0.12, out: 0.22, antic: 0.5, over: 1.6, handL: "open" });      // the hand flicks it up
  v.actAt(PRE + TOSS - 0.06, { head: [14, -20, 4] }, FLIGHT - 0.08, { in: 0.14, out: 0.22, antic: 0, over: 1.3, face: { smile: 1, lid: 0, wide: 0.5, brow: 1, gaze: [0.6, -0.9] } });      // and his eyes go after it
  v.actAt(PRE + TOSS + FLIGHT - 0.06, { armL: arm(40, 16, 108, 12), py: -0.05, head: [6, 8, 4] }, 0.3, { in: 0.07, out: 0.14, antic: 0, over: 1.6, handL: "fist" });      // and gives as he catches it
  // he draws it in to his belt and wags a finger at his son, leaning over to him
  v.actAt(PRE + SHOW - 0.1, { armR: arm(84, 30, 112, 26), armL: arm(30, 0, 100, -30), lean: 2, roll: 7, head: [-30, -4, 6] }, 9, { in: 0.2, antic: 0.4, over: 1.8, handR: "point", handL: "fist", face: { smile: 1, lid: 0.06, wide: 0.4, brow: 1, gaze: [-0.9, 0] } });
  wag(v, PRE + SHOW + 0.25, 3, P({ armR: arm(88, 32, 118, 28) }), P({ armR: arm(80, 28, 104, 22) }), 0.26, { handR: "point" });
  const camAt = (t: number): Cam => { const z = ti.sample(t + PRE).z * ti.LL; return { pos: [1.55, 1.3, z - 3.05], look: [0.95, 1.22, z + 0.2], fov: 56 }; };
  add({ id: "yet", a: cut("coin", "yet"), b: cut("yet", "point"), still: 0.62,
    // their feet; a ting as the toss leaves his thumb, a tap as the coin lands in his palm; a whoosh for the son's hand
    sounds: [...feet(ti, PRE, yetLen, { g: 0.8, p: -0.2 }), ...feet(v, PRE, yetLen, { g: 0.7, p: 0.2 }), { t: TOSS, k: "ting", g: 0.8, p: 0.3 }, { t: TOSS + FLIGHT, k: "tap", g: 0.7, p: 0.3 }, { t: SHOW + 0.02, k: "whoosh", dur: 0.25, g: 0.4, p: -0.2 }],
    cam: (t) => camAt(t), sun: { target: [0.9, 0, 0.2], reach: 7 },
    cast: (t, T) => [play("ti", TITUS_D, ti, t + PRE, [0, 0, 0], 1.84, { seed: 5 }), play("v", VESPASIAN_D, v, t + PRE, [0, 0, 0], 1.76, { seed: 4, blink: false, talk: Math.max(0.55, talk(W, T, ["yet"])) })],
    // in the hand the coin rides on his fingers; in flight it keeps to one line beside his head, clear of his face
    things: (g, c, t, _T, cam) => { const h = near(c.v.joint("tipL"), cam, 0.06), u = (t - TOSS) / FLIGHT, fly = u > 0 && u < 1, w = fly ? smooth(Math.min(1, u / 0.2, (1 - u) / 0.2)) : 0, up = fly ? 0.62 * 4 * u * (1 - u) : 0;
      const k = put(g, COIN_BIG(), [h[0] + (c.v.at[0] - COIN_X - h[0]) * w, h[1] + 0.1 + up, h[2]], 0); k.rotation.set(Math.PI / 2 + (fly ? u * 18.8 : 0), 0.3, 0); } });
}
// 11. THAT IS WHY ROME TAXED PEE: the coin lands on the heap in the strongbox by the jar; the collector, crouched behind the box,
//     watches it fall, marks it on his tablet with two strokes, then looks up and shakes a fist in triumph
const pointMid = at("point", /^The$/) - 0.12;
{
  const V = lens(1.15, 1.35, 5.15, 0.75, -0.66, -9, 54), [cx, cz] = V.spot(2.8, -0.36);
  const col = mover(COLLECTOR_D, 1.78, cx, cz, V.toward(cx, cz, 14)); col.stand(6);
  const HEAP_FALL = 0.34, heapLen = pointMid - cut("yet", "point"), MARK = [0.72, 0.98], PAT = 1.3;       // the coin lands on the heap at HEAP_FALL and bounces every PI/16 s
  col.actAt(-1, { py: -0.5, lean: 26, armL: arm(46, 10, 110, -16), armR: arm(50, 12, 100, -34), head: [0, -6, 0] }, 9 + 1, { in: 0.01, handL: "grip", handR: "point", face: { gaze: [0.2, -0.7], brow: 0.8, wide: 0.4 } });
  col.actAt(HEAP_FALL - 0.1, { head: [0, 22, 0], lean: 32 }, MARK[0] - HEAP_FALL, { in: 0.12, out: 0.15, antic: 0, over: 1.8, face: { gaze: [0.2, 0.9], brow: 1, wide: 0.8, smile: 0.5 } });
  for (const t0 of MARK) col.actAt(t0, { armR: arm(60, 12, 116, -18), head: [-8, 14, 0] }, 0.2, { in: 0.07, out: 0.1, antic: 0.5, over: 1.5, handR: "point", face: { gaze: [-0.3, 0.8], smile: 0.6 } });
  col.actAt(PAT, { armR: arm(118, 22, 168, 8), lean: 18, py: -0.44, head: [0, -8, 0] }, 9, { in: 0.2, antic: 0.5, over: 1.8, handR: "fist", face: { smile: 1, brow: 0.8, lid: 0, gaze: [0, 0] } });
  wag(col, PAT + 0.2, 3, P({ armR: arm(124, 22, 176, 8), py: -0.42 }), P({ armR: arm(110, 22, 156, 8), py: -0.46 }), 0.3, { handR: "fist" });
  add({ id: "heap", a: cut("yet", "point"), b: pointMid, still: 0.2,
    // the coin in the chest, louder, two small bounces; the stylus twice; a small whoosh for each shake of his fist
    sounds: [{ t: HEAP_FALL, k: "coin", g: 1.5, p: -0.1 }, { t: HEAP_FALL + Math.PI / 16, k: "coin", g: 0.6, p: -0.1 }, { t: HEAP_FALL + 2 * Math.PI / 16, k: "coin", g: 0.3, p: -0.1 },
      ...MARK.map((t): Sound => ({ t: t + 0.05, k: "scratch", g: 0.8, p: 0.3 })), ...swings(PAT + 0.2, 3, 0.3, heapLen).map((t): Sound => ({ t, k: "whoosh", dur: 0.2, g: 0.3, p: 0.1 }))],
    cam: (_t, u) => V.push(0.12 * u), sun: { target: [3, 0, 3.9], reach: 5 },
    cast: (t) => [play("col", COLLECTOR_D, col, t, [0, WALK, 0], 1.78, { seed: 6, blink: false })],
    // the box stands end-on to the lens with its lid up on the far side from the collector, so that the lid hides nobody
    things: (g, c, t, _T, cam) => { strongbox(g, -2.42);
      // the emperor's coin drops in from above, lands on the heap and settles: a coin like the others in the box
      const fall = HEAP_FALL, u = t / fall, top: V3 = [BOX[0], WALK + 0.5, BOX[2]], k = put(g, COIN(), u < 1 ? [top[0] - 0.1 * (1 - u), top[1] + 1.15 * (1 - u * u), top[2] + 0.25 * (1 - u)] : [top[0], top[1] + 0.07 * Math.abs(Math.sin((t - fall) * 16)) * Math.exp(-(t - fall) * 7), top[2]], 0); k.rotation.set(u < 1 ? u * 9 : 0.25, 0, u < 1 ? u * 5 : 0.2);
      const p = near(c.col.joint("tipL"), cam, 0.05), tb = put(g, TABLET(), [p[0], p[1] + 0.06, p[2]], 0); tb.lookAt(cam.pos[0], cam.pos[1], cam.pos[2]); stink(g, t, cam); } });
}
// 12. THE MONEY DID NOT SMELL: Sir Digsworth, beside the jar and its flies, holds one coin to his nose and finds nothing wrong with it
{
  const V = lens(3.12, 1.6, JZ + 3.1, 0, -1, -2, 52), [qx, qz] = V.spot(2.25, -0.26);
  const sir = mover(SIR_D, 1.8, qx, qz, V.toward(qx, qz, 10)); sir.stand(6);
  sir.actAt(-1, { armL: arm(75, 14, 172, -39), handL: 0, head: [-4, 4, 0], lean: 3 }, 2.0, { out: 0.3, handL: "point", face: { brow: 0.4, lid: 0.5, gaze: [0, 0.4] } });
  sir.actAt(0.95, { armL: arm(98, 46, 170, 36), head: [8, -6, -4], lean: -3 }, 9, { in: 0.36, antic: 0, over: 1.3, handL: "point", face: { brow: 1, smile: 1, wide: 0.3, gaze: [0.5, -0.1] } });
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
// 13. IN PARIS, STREET URINALS WERE LATER NAMED AFTER HIM: Sir Digsworth strides up the pavement along the yellow house, seen from
//     the street a little ahead of him, lecturing with a raised finger; then he throws his arm out at something on the wall ahead
const endMid = at("end", /Vespasiennes/) - 0.5;
/** the poster on the yellow house's wall: the card of the earlier versions, half as large again, fixed where it hangs */
const PZ = 13.25, PY = WALK + 2.5, POSTER = once(() => { const k = CARD().clone(); k.scale.setScalar(1.5); k.rotation.y = -Math.PI / 2; k.position.set(4.07, PY, PZ); return k; });
{
  const walkLen = endMid - cut("point", "end"), cardLen = END - endMid, X = 3.2, STOPZ = PZ + 0.62, ARR = walkLen + 0.34;
  // one walk through both shots: he comes to a stand under the poster ARR seconds in, a third of a second after the cut
  const pace = (d: number) => { const m = mover(SIR_D, 1.8, X, 0, 180); m.walk(mt(m, d)); return m.t; };
  let dist = 2; while (pace(dist) < ARR && dist < 9) dist += 0.05;
  const Z0 = STOPZ + dist, sir = mover(SIR_D, 1.8, X, Z0, 180); sir.walk(mt(sir, dist)); const stop = sir.t;
  const HOLD = 0.96 - (stop - walkLen) - 0.2; sir.turn(62, 0.2).stand(HOLD); const leave = sir.t; sir.turn(-62, 0.2).run(mt(sir, 4.5), { tau: 0.3, step: 0.9 });      // and off he trots
  // the finger of a man who knows something, wagged at the lens as he walks
  sir.actAt(0.12, { armR: arm(62, 12, 156, 0), head: [-16, -2, 0], lean: 2 }, 1.7, { in: 0.25, out: 0.2, antic: 0.3, over: 1.6, handR: "point", face: { brow: 0.7, smile: 0.9, gaze: [-0.6, -0.1] } });
  wag(sir, 0.45, 1.2, P({ armR: arm(68, 12, 166, 0) }), P({ armR: arm(56, 12, 142, 0) }), 0.34, { handR: "point" });
  // "named after him": the arm thrown out ahead of him, up at the wall
  sir.actAt(1.95, { armR: arm(104, 14, 118, 6), lean: 5, head: [0, -10, 0] }, stop - 1.95 - 0.1, { in: 0.2, out: 0.14, antic: 0.5, over: 1.8, handR: "point", face: { brow: 1, smile: 0.8, lid: 0, wide: 0.3, gaze: [0, -0.6] } });
  // 14. VESPASIENNES: he stops under the poster, turns to us and raps his finger up at the name; then he walks on out of the
  //     picture, and the lens goes in to the poster until the name fills it
  const TAP = at("end", /Vespasiennes/) - cut("point", "end");
  sir.actAt(stop - 0.12, { armR: arm(150, 34, 164, 22), lean: -3, head: [10, -8, 0] }, leave - stop + 0.1, { in: 0.2, out: 0.2, antic: 0.3, over: 1.7, handR: "point", face: { brow: 1, smile: 1, lid: 0, wide: 0.3, gaze: [0.4, 0] } });
  wag(sir, TAP, 0.62, P({ armR: arm(156, 36, 172, 24) }), P({ armR: arm(142, 32, 150, 20) }), 0.3, { handR: "point" });
  // he looks back at us over his shoulder as he goes
  sir.actAt(leave + 0.1, { head: [34, 0, 0], armR: arm(30, 20, 80, 10) }, 9, { in: 0.25, antic: 0, over: 1.4, handR: "open", face: { brow: 0.8, smile: 1, gaze: [-0.6, 0] } });
  // the lens goes backward in the street beside him and lets him gain on it
  const camAt = (t: number): Cam => { const z = sir.sample(t).z * sir.LL, k = smooth(t / walkLen); return { pos: [1.2, 1.2, z - 2.35 + 0.35 * k], look: [X + 0.6, 1.3, z - 0.1], fov: 56 }; };
  add({ id: "walk", a: cut("point", "end"), b: endMid, still: 2.0,
    // his footsteps up the pavement; a whoosh as the arm goes out
    sounds: [...feet(sir, 0, walkLen, { g: 1, p: 0.1 }), { t: 1.95, k: "whoosh", dur: 0.3, g: 0.4, p: 0.1 }],
    cam: (t) => camAt(t), sun: { target: [3, 0, 14.5], reach: 9 },
    cast: (t, T) => [play("sir", SIR_D, sir, t, [0, WALK, 0], 1.8, { talk: talk(W, T, ["end"]), blink: false })] });
  // the lens faces the wall; from the rap on, it goes in and up to the poster and narrows on it
  const GO = leave - walkLen + 0.4, C0: V3 = [0.2, 1.45, PZ + 0.42], L0: V3 = [4.1, 1.85, PZ + 0.42], C1: V3 = [0.9, 1.9, PZ], L1: V3 = [4.1, PY, PZ];
  add({ id: "card", a: endMid, b: END, still: 0.75,
    // his last steps and the scuff as he stops; his finger on the wall twice; his steps away
    sounds: [...feet(sir, walkLen, cardLen, { g: 1, p: 0.1 }), { t: stop - walkLen, k: "scuff", g: 0.7 }, { t: TAP - walkLen + 0.02, k: "tap", g: 1, p: -0.1 }, { t: TAP - walkLen + 0.32, k: "tap", g: 0.8, p: -0.1 }, ],
    cam: (t) => { const k = smooth((t - GO) / (cardLen - GO - 0.25)); return { pos: mix3(C0, C1, k), look: mix3(L0, L1, k), fov: 56 - 16 * k }; }, sun: { target: [3, 0, PZ], reach: 7 },
    cast: (t, T) => [play("sir", SIR_D, sir, t + walkLen, [0, WALK, 0], 1.8, { talk: talk(W, T, ["end"]), blink: false })],
    things: (g) => { g.add(POSTER()); } });
}

export const ROME_PEE: Film = {
  id: "rome-pee", fps: 30, seconds: END, sky: "#a9dcff", world: romeStreet, shots, words: W,
  hook: { text: ["WHY DID ROME", "TAX PEE?"], a: 0, b: L.hook.b + 0.2 },
  sign: { text: "Dramatised. The story is from Suetonius; nobody knows who paid the tax.", a: L.coin.a + 0.1, b: L.coin.a + 2.1 },
  // each is the film's own frame at that time (text.md names the times), with the words laid over it
  thumbs: [
    { T: 1.0, words: ["A TAX", "ON PEE?!"], y: 0.715, size: 132 },
    { T: cut("guess", "wash") + 0.95, words: ["WASHED", "WITH PEE?!"], y: 0.66, size: 132 },
    { T: pointMid + 0.45, words: ["DOES IT", "SMELL?"], y: 0.72, size: 132 },
  ],
  hits: TAX_HITS, beds: [{ k: "street", a: 0, b: END, g: 1 }], music: "roman", audio: "craft/rome-pee.wav",
};

// Short: "Why did Rome tax pee?" One street corner in Rome about AD 70 (world/rome.ts), played on the stage (stage/Stage.tsx).
// The shots are cut to the narration's lines (voice/rome-pee): each shot names the lines it covers, so a new reading moves the cuts.
// Sources and what must not be claimed: granskning/fragor.md, question 1.
import * as THREE from "three";
import { Film, Shot, Cam, V3, Actor, Staged, Word, play, talk, glide, smooth, mix3 } from "../stage/film";
import { mover, mt, tread, wag, arm, MM } from "../stage/acting";
import { romeStreet, ROME, WALK } from "../world/rome";
import { mesh, box, group } from "../world/kit";
import { table, coins, chest, coin, amphora, painted, C } from "../world/props";
import { SIR_D, VESPASIAN_D, TITUS_D, FULLER_D, CITIZEN_D, SOLDIER_D } from "../looks";
import type { Pose } from "../rig";
import words from "../../../voice/rome-pee/words.json";
import lines from "../../../voice/rome-pee/lines.json";

const W = words as Word[], L = Object.fromEntries((lines as { id: string; a: number; b: number }[]).map((l) => [l.id, l]));
const cut = (a: string, b: string) => (L[a].b + L[b].a) / 2;       // a cut falls in the pause between two lines
const END = L.end.b + 0.55;
/** when a word of a line is spoken (film seconds) */
const at = (line: string, re: RegExp) => W.find((w) => w.line === line && re.test(w.w))!.a;
const [JX, , JZ] = ROME.jar, [TX, , TZ] = ROME.taxTable;
const P = (o: Partial<Pose>) => o;

// ---------------- the things of the corner (made once, moved by the shots) ----------------
const once = <T,>(make: () => T) => { let v: T | undefined; return () => (v ??= make()); };
const TABLE = once(() => { const g = group([table(0.8, 0.6, 0.74)]); const c = coins(22, 5); c.position.set(-0.1, 0.78, 0); c.scale.setScalar(1.3); g.add(c); return g; });
const CHEST_FULL = once(() => chest(true, true)), CHEST_EMPTY = once(() => chest(true, false, 0.5, 0.3, 0.34)), COIN = once(() => { const c = coin(0.045); c.traverse((o) => { o.castShadow = false; }); return c; }), JUG = once(() => amphora(0.7));
const CARD = once(() => { const g = group([mesh(box(0.46, 0.62, 0.02), "#fbf6ea", { shadow: false })]), flat = { line: 0.5, shadow: false } as const;
  // a street urinal of Paris, drawn as the round iron kiosk it was: a green drum on a base, a band of small openings, a cap, a lamp
  g.add(mesh(box(0.2, 0.03, 0.012), "#24523a", { at: [0, -0.115, 0.012], ...flat }), mesh(box(0.17, 0.25, 0.012), "#2f7a52", { at: [0, 0.025, 0.012], ...flat }), mesh(box(0.21, 0.035, 0.012), "#24523a", { at: [0, 0.165, 0.012], ...flat }), mesh(box(0.13, 0.03, 0.012), "#2f7a52", { at: [0, 0.195, 0.012], ...flat }), mesh(box(0.04, 0.06, 0.012), "#f6c95e", { at: [0, 0.24, 0.012], ...flat }));
  for (const x of [-0.055, -0.018, 0.018, 0.055]) g.add(mesh(box(0.02, 0.05, 0.012), "#fbf6ea", { at: [x, 0.1, 0.016], line: 0, shadow: false }));
  const t = painted(["VESPASIENNE"], 0.42, 0.085, { ink: "#2a1a14", bg: "#fbf6ea", line: 0 }); t.position.set(0, -0.2, 0.012); g.add(t);
  const t2 = painted(["PARIS"], 0.2, 0.06, { ink: "#b3261e", bg: "#fbf6ea", line: 0 }); t2.position.set(0, 0.275, 0.004); t2.position.y = -0.27; g.add(t2); return g; });
const put = (into: THREE.Group, o: THREE.Object3D, at: V3, ry = 0) => { o.position.set(...at); o.rotation.set(0, ry, 0); into.add(o); return o; };
const corner = (into: THREE.Group, tableAt: V3 = [TX, WALK, TZ], chestAt: V3 | null = [TX + 0.1, WALK, TZ + 0.75]) => { put(into, TABLE(), tableAt, Math.PI / 2 + 0.1); if (chestAt) put(into, CHEST_FULL(), chestAt, -Math.PI / 2 - 0.3); };
const between = (a: V3, b: V3, u = 0.5): V3 => mix3(a, b, u);

// ---------------- poses that several shots use ----------------
/** a hand over the nose (the right hand), leaning away */
const NOSE = P({ armR: arm(110, 20, 166, -48), handR: 20, lean: -9 }), FAN_A = P({ armL: arm(34, 40, 100, 66) }), FAN_B = P({ armL: arm(44, 22, 118, 28) });
const DISGUST = { brow: -0.7, lid: 0.3, smile: -1 };
const COUNT_A = P({ lean: 16, head: [0, 20, 0], armR: arm(46, 8, 82, -12), armL: arm(38, 10, 70, -6) }), COUNT_B = P({ lean: 16, head: [0, 20, 0], armR: arm(58, 14, 70, 6), armL: arm(38, 10, 70, -6) });
/** a point `d` metres in front of a figure (things held before the body stand off the card, on the side the figure faces) */
const ahead = (a: Staged, p: V3, d: number): V3 => [p[0] + Math.sin((a.heading * Math.PI) / 180) * d, p[1], p[2] + Math.cos((a.heading * Math.PI) / 180) * d];
const lid = (ch: THREE.Object3D, open: number) => { (ch.children[ch.children.length - 2] as THREE.Object3D).rotation.x = -1.9 * open; };
const CHEST_AT: V3 = [2.9, WALK, 3.98];

const shots: Shot[] = [];
const add = (s: Shot) => shots.push(s);

// 1. THE HOOK: the jar at the corner with a man at it, the collector counting coins beside it, Sir Digsworth holding his nose
{
  const sir = mover(SIR_D, 1.8, 1.55, 3.72, -66); sir.actAt(-1, { ...NOSE, px: 0.05, roll: -5, head: [-22, -4, 4] }, 9, { in: 0.2, handR: "grip", face: { ...DISGUST, gaze: [-0.8, 0.2] } }); wag(sir, 0, 3, FAN_A, FAN_B, 0.34, { handL: "open" }); sir.stand(0.3).step("L", -0.2, 0.22).stand(3);
  const man = mover(CITIZEN_D, 1.68, JX - 0.62, JZ - 0.18, 90); man.stand(4); man.actAt(-1, { armL: arm(26, 8, 60, -30), armR: arm(26, 8, 60, -30), head: [8, 10, 0] }, 9, {});
  const col = mover(SOLDIER_D, 1.8, TX + 0.48, TZ + 0.05, -90); col.stand(4); wag(col, -0.2, 4, COUNT_A, COUNT_B, 0.7, { handR: "grip", handL: "open", face: { gaze: [0, 0.8], smile: 0.3 } });
  add({ id: "hook", a: 0, b: cut("hook", "need"), still: 1.0,
    cam: glide({ pos: [-1.25, 1.72, 3.64], look: [4.1, 0.8, 3.6], fov: 62 }, { pos: [-1.0, 1.7, 3.64], look: [4.1, 0.8, 3.6], fov: 62 }),
    sun: { target: [3, 0, 3.7], reach: 6 },
    cast: (t, T) => [play("man", CITIZEN_D, man, t, [0, WALK, 0], 1.68), play("col", SOLDIER_D, col, t, [0, WALK, 0], 1.8), play("sir", SIR_D, sir, t, [0, 0, 0], 1.8, { talk: talk(W, T, ["hook"]) })],
    things: (g) => corner(g) });
}
// 2. ROME. THE NEW EMPEROR, VESPASIAN: he comes up the street with his money chest, the great amphitheatre rising behind him
const needMid = at("need", /needs/) - 0.08;
{
  const v = mover(VESPASIAN_D, 1.76, 0.6, -1.5, 0); v.act("carry", 9, { wait: false, in: 0.01, face: { brow: -0.8, smile: -0.7 } }).walk(mt(v, 9));
  const ti = mover(TITUS_D, 1.84, 1.45, -3.0, 0); ti.walk(mt(ti, 9));
  add({ id: "street", a: cut("hook", "need"), b: needMid, still: 1.3,
    cam: glide({ pos: [1.05, 0.42, 2.6], look: [0.85, 1.42, -6], fov: 60 }, { pos: [1.05, 0.42, 4.3], look: [0.85, 1.46, -6], fov: 60 }, false),
    sun: { target: [0.5, 0, 0], reach: 9 },
    cast: (t) => [play("ti", TITUS_D, ti, t + 1.2, [0, 0, 0], 1.84, { seed: 5 }), play("v", VESPASIAN_D, v, t + 1.2, [0, 0, 0], 1.76)],
    things: (g, c) => { const m = ahead(c.v, between(c.v.joint("wrL"), c.v.joint("wrR")), 0.2), ch = put(g, CHEST_EMPTY(), [m[0], m[1] - 0.24, m[2]], 0); lid(ch, 0); } });
}
// 3. NEEDS MONEY. A GREAT DEAL OF IT: he turns the chest over above his head and shakes it; one coin falls out and rolls away
{
  const v = mover(VESPASIAN_D, 1.76, 0.75, 1.6, 20); v.stand(6); v.actAt(-1, { armL: arm(166, 12, 180, -8), armR: arm(166, 12, 180, -8), lean: -5, head: [0, -24, 0] }, 9, { in: 0.2, handL: "grip", handR: "grip", face: { brow: -1, smile: -0.9, gaze: [0, -0.8] } });
  wag(v, 0.1, 1.3, { py: 0.02, roll: 3 }, { py: -0.02, roll: -3 }, 0.24); v.actAt(1.45, { armL: arm(70, 14, 130, -8), armR: arm(70, 14, 130, -8), lean: 8, head: [0, 30, 0] }, 3, { in: 0.3, over: 1.8, handL: "grip", handR: "grip", face: { brow: -1, smile: -1, lid: 0.3, gaze: [0, 0.8] } });
  const ti = mover(TITUS_D, 1.84, 1.02, 0.6, -24); ti.stand(6); ti.actAt(-1, { lean: 6, head: [16, -16, 0], armL: arm(30, 12, 96, -10) }, 1.9, { out: 0.25, handL: "open", face: { brow: 0.7, gaze: [-0.5, -0.6] } }); ti.actAt(1.6, { armL: arm(12, 30, 76, 50), armR: arm(12, 30, 76, 50), py: 0.012, head: [10, 4, -6] }, 3, { in: 0.2, over: 2, handL: "open", handR: "open", face: { brow: 0.8, smile: -0.4, gaze: [-0.4, 0.2] } });
  add({ id: "empty", a: needMid, b: cut("need", "guess"), still: 0.9,
    cam: glide({ pos: [2.5, 1.3, 4.35], look: [0.8, 1.5, 1.5], fov: 58 }, { pos: [2.38, 1.32, 4.15], look: [0.8, 1.52, 1.5], fov: 58 }),
    sun: { target: [0.5, 0, 1.6], reach: 6 },
    cast: (t) => [play("ti", TITUS_D, ti, t, [0, 0, 0], 1.84, { seed: 5 }), play("v", VESPASIAN_D, v, t, [0, 0, 0], 1.76)],
    things: (g, c, t) => {
      const k0 = smooth((t - 1.45) / 0.35), mid = ahead(c.v, between(c.v.joint("wrL"), c.v.joint("wrR")), 0.05 + 0.2 * k0), ch = put(g, CHEST_EMPTY(), [mid[0], mid[1] + 0.42 - 0.52 * k0, mid[2]], 0.3); ch.rotation.z = Math.PI * (1 - 0.82 * k0) + 0.14 * Math.sin(t * 26) * (t < 1.4 ? 1 : 0); lid(ch, 1);
      // the one coin: it drops out, bounces and rolls off toward the lens
      const u = t - 0.55; if (u > 0) { const y0 = c.v.joint("crown")[1] + 0.3, y = u < 0.55 ? y0 - (y0 - 0.05) * (u / 0.55) ** 2 : 0.05 + Math.abs(Math.sin((u - 0.55) * 9)) * 0.18 * Math.exp(-(u - 0.55) * 2.6), roll = Math.max(0, u - 0.55);
        const k = put(g, COIN(), [mid[0] + 0.3 + roll * 0.35, y, mid[2] + 0.5 + roll * 0.5], 0); k.rotation.set(Math.PI / 2, 0.6, -roll * 9 + u * 7); }
    } });
}
// 4. "I GUESSED IT WAS A FINE": Sir Digsworth comes up the sidewalk wagging a finger at the man by the jar, who takes fright and runs
const guessWrong = (W.find((w) => w.line === "guess" && /Wrong/.test(w.w))?.a ?? L.guess.b - 0.5) - cut("need", "guess");
{
  const sir = mover(SIR_D, 1.8, 2.45, 4.25, 180); sir.walk(mt(sir, 0.95)).stand(0.1); const stop = sir.t;
  wag(sir, -0.3, stop + 0.9, P({ armR: arm(100, 6, 152, 0), head: [0, -4, 0] }), P({ armR: arm(92, 6, 122, 0), head: [0, -4, 0] }), 0.36, { handR: "point", face: { brow: -0.8, smile: -0.4 } });
  sir.actAt(guessWrong - 0.12, "recoil", 3, { in: 0.14, over: 2.4, face: { wide: 1, lid: 0, brow: 1, mouth: 0.5 } }); sir.stand(4);
  const man = mover(CITIZEN_D, 1.68, JX - 0.62, JZ - 0.18, 90); man.actAt(-1, { armL: arm(26, 8, 60, -30), armR: arm(26, 8, 60, -30), head: [8, 10, 0] }, 1.0, { out: 0.2 }); man.stand(0.95).act("recoil", 0.5, { in: 0.14, face: { wide: 1, lid: 0, brow: 1, mouth: 0.7 } }).turn(90, 0.34).walk(mt(man, 6), { run: true });
  add({ id: "guess", a: cut("need", "guess"), b: cut("guess", "wash"), still: 1.15,
    cam: glide({ pos: [-0.35, 1.2, 3.42], look: [3.0, 1.15, 3.3], fov: 58 }, { pos: [-0.2, 1.2, 3.3], look: [3.0, 1.15, 3.2], fov: 58 }),
    sun: { target: [3, 0, 3.4], reach: 6 },
    cast: (t, T) => [play("man", CITIZEN_D, man, t, [0, WALK, 0], 1.68, { seed: 7 }), play("sir", SIR_D, sir, t, [0, WALK, 0], 1.8, { talk: talk(W, T, ["guess"]) })],
    things: (g) => corner(g) });
}
// 5. PEE WAS USEFUL: in his laundry the fuller pours a jug of it into a stall; Sir Digsworth leans in to look, and wishes he had not
const washMid = at("wash", /Laundries/) - 0.08;
{
  const [sx, sy, sz] = ROME.stall;
  const f = mover(FULLER_D, 1.74, sx - 0.95, sz, 90); f.stand(6); f.actAt(-1, "pour", 9, { in: 0.2, face: { smile: 0.9, gaze: [0.4, 0.6] } });
  const sir = mover(SIR_D, 1.8, sx - 1.8, sz - 0.2, 40); sir.stand(6); sir.actAt(-1, { lean: 18, head: [8, 12, 0], armL: arm(20, 16, 60, 10) }, 1.6, { out: 0.2, face: { brow: 0.9, wide: 0.5, gaze: [0.7, 0.4] } }); sir.actAt(0.75, { ...NOSE, lean: -12, head: [-10, -6, 0] }, 4, { in: 0.16, over: 2.2, handR: "grip", face: { ...DISGUST, wide: 0.6, lid: 0, gaze: [0.7, 0.3] } });
  add({ id: "pour", a: cut("guess", "wash"), b: washMid, still: 0.5,
    cam: glide({ pos: [6.85, 1.3, 1.75], look: [7.0, 1.02, -1.6], fov: 58 }, { pos: [6.95, 1.3, 1.6], look: [7.05, 1.02, -1.6], fov: 58 }),
    sun: { target: [7, 0, -1], reach: 6 },
    cast: (t) => [play("sir", SIR_D, sir, t, [0, sy, 0], 1.8), play("f", FULLER_D, f, t, [0, sy, 0], 1.74, { seed: 9 })],
    things: (g, c) => { const p = between(c.f.joint("wrL"), c.f.joint("wrR")), tilt = 1.15, j = put(g, JUG(), [p[0] - 0.12, p[1] - 0.06, p[2] + 0.02], 0); j.rotation.z = -tilt;
      const mx = p[0] - 0.12 + Math.sin(tilt) * 0.7, my = p[1] - 0.06 + Math.cos(tilt) * 0.7, y1 = sy + 0.32; g.add(mesh(box(0.04, my - y1, 0.04), "#d9c23c", { at: [mx + 0.03, (my + y1) / 2, p[2] + 0.02], line: 0, shadow: false })); } });
}
// 6. LAUNDRIES WASHED WOOL WITH IT: from above, the fuller treads the cloth in his stall
{
  const [sx, sy, sz] = ROME.stall;
  const f = mover(FULLER_D, 1.74, sx, sz, -90); f.stand(6); f.actAt(-1, { armL: arm(6, 62, 24, 92), armR: arm(6, 62, 24, 92), lean: 5, head: [0, 14, 0] }, 9, { handL: "grip", handR: "grip", face: { smile: 0.9, gaze: [0, 0.6] } }); tread(f, -0.4, 6, 0.44);
  add({ id: "tread", a: washMid, b: cut("wash", "tax"), still: 0.8,
    cam: glide({ pos: [5.75, 2.3, -1.0], look: [8.05, 1.36, -1.52], fov: 56 }, { pos: [6.0, 2.25, -1.05], look: [8.05, 1.36, -1.52], fov: 56 }),
    sun: { target: [7, 0, 0], reach: 6 },
    cast: (t) => [play("f", FULLER_D, f, t, [0, sy + 0.12, 0], 1.74, { seed: 9 })],
    things: (g, _c, t) => { for (const [dx, dz, ph] of [[-0.12, 0.2, 0], [0.1, -0.22, 1.6]] as number[][]) { const c = mesh(box(0.36, 0.1 + 0.03 * Math.sin(t * 14 + ph), 0.3), "#fbf6ea", { at: [sx + dx, sy + 0.36, sz + dz], rot: [0, ph, 0] }); g.add(c); } } });
}
// 7. SO VESPASIAN PUT A TAX ON IT: he points at the jar, and the collector sets his strongbox down beside it
{
  const v = mover(VESPASIAN_D, 1.76, 2.5, 3.3, -58); v.stand(6); v.actAt(-0.2, { armR: arm(30, 34, 44, 60), lean: 4, head: [22, 0, 0] }, 9, { in: 0.22, handR: "point", face: { brow: -0.5, smile: 0.7, gaze: [0.7, 0] } });
  const col = mover(SOLDIER_D, 1.8, 3.2, 5.3, 180); col.act("carry", 9, { wait: false, in: 0.01, out: 0.3 }).walk(mt(col, 0.85)); const set = col.t;
  col.actAt(set - 0.1, { lean: 34, py: -0.2, armL: arm(30, 10, 40, 0), armR: arm(30, 10, 40, 0), head: [0, 20, 0] }, 0.6, { in: 0.22, out: 0.25, handL: "open", handR: "open" }); col.stand(4);
  const carried = (t: number) => t < set + 0.22;
  add({ id: "tax", a: cut("wash", "tax"), b: cut("tax", "titus"), still: 1.75,
    cam: glide({ pos: [-0.35, 0.55, 3.54], look: [3.2, 1.3, 3.5], fov: 66 }, { pos: [-0.15, 0.55, 3.54], look: [3.2, 1.3, 3.5], fov: 66 }),
    sun: { target: [3, 0, 3.6], reach: 6 },
    cast: (t) => [play("col", SOLDIER_D, col, t, [0, WALK, 0], 1.8), play("v", VESPASIAN_D, v, t, [0, WALK, 0], 1.76)],
    things: (g, c, t) => { const m = ahead(c.col, between(c.col.joint("wrL"), c.col.joint("wrR")), 0.22), ch = put(g, CHEST_FULL(), carried(t) ? [m[0], m[1] - 0.26, m[2]] : CHEST_AT, -Math.PI / 2); lid(ch, carried(t) ? 0 : smooth((t - set - 0.35) / 0.3)); } });
}
// 8. HIS SON TITUS COMPLAINED: Titus backs away from the jar, a hand over his nose, pointing back at it
{
  const ti = mover(TITUS_D, 1.84, 2.35, 3.15, -150); ti.stand(0.2).step("R", -0.22, 0.2).step("L", -0.2, 0.2).stand(4); ti.actAt(-1, { ...NOSE, lean: -12, head: [14, -6, -4] }, 9, { in: 0.2, handR: "grip", face: { brow: -1, lid: 0.25, smile: -1, gaze: [0.7, 0.3] } }); wag(ti, 0.55, 2.2, P({ armL: arm(36, 26, 66, 46), head: [26, -6, -4] }), P({ armL: arm(44, 18, 84, 30), head: [2, -6, -4] }), 0.5, { handL: "point" });
  add({ id: "titus", a: cut("tax", "titus"), b: cut("titus", "coin"), still: 1.2,
    cam: glide({ pos: [0.9, 0.85, 1.7], look: [2.55, 1.42, 3.45], fov: 52 }, { pos: [0.75, 0.85, 1.55], look: [2.5, 1.42, 3.35], fov: 52 }),
    sun: { target: [3, 0, 3.4], reach: 6 },
    cast: (t) => [play("ti", TITUS_D, ti, t, [0, WALK, 0], 1.84, { seed: 5 })],
    things: (g) => { lid(put(g, CHEST_FULL(), CHEST_AT, -Math.PI / 2), 1); } });
}
// 9. HE HELD A COIN UNDER HIS NOSE. "DOES IT SMELL?": the two in profile on the street, the lens going in on the coin and the nose
const coinAsk = at("coin", /Does/) - cut("titus", "coin");
{
  const v = mover(VESPASIAN_D, 1.76, 0.9, 0.68, 0); v.stand(0.15).step("R", 0.14, 0.24).stand(6); v.actAt(0.1, { armR: arm(100, 4, 124, 0), lean: 9, head: [0, -6, 0] }, 9, { in: 0.3, over: 2.0, handR: "grip", face: { brow: 0.5, smile: 0.8 } });
  const ti = mover(TITUS_D, 1.84, 0.9, 1.44, 180); ti.stand(6); ti.actAt(0.25, { lean: -11, pz: -0.05, head: [0, -4, 0], armL: arm(20, 24, 100, 30), armR: arm(20, 24, 100, 30) }, 9, { in: 0.2, over: 2.2, handL: "open", handR: "open", face: { brow: 0.9, wide: 0.7, lid: 0, gaze: [-0.4, 0.3], smile: -0.6 } });
  add({ id: "coin", a: cut("titus", "coin"), b: cut("coin", "yet"), still: 2.6,
    cam: (_t, u) => { const k = smooth((u - 0.2) / 0.6); return { pos: mix3([-2.0, 1.36, 1.09], [-1.45, 1.42, 1.1], k), look: mix3([0.9, 0.95, 1.09], [0.9, 1.08, 1.1], k), fov: 50 - 4 * k }; },
    sun: { target: [0.9, 0, 1.1], reach: 5 },
    cast: (t, T) => [play("ti", TITUS_D, ti, t, [0, 0, 0], 1.84, { seed: 5 }), play("v", VESPASIAN_D, v, t, [0, 0, 0], 1.76, { seed: 4, talk: t > coinAsk - 0.05 ? talk(W, T, ["coin"]) : 0 })],
    things: (g, c) => { const p = c.v.joint("tipR"), k = put(g, COIN(), [p[0] - 0.05, p[1] + 0.05, p[2] + 0.03], 0); k.rotation.set(0, 0, Math.PI / 2); } });
}
// 10. "NO. YET IT COMES FROM PEE.": the emperor laughs and flips the coin
{
  const v = mover(VESPASIAN_D, 1.76, 1.25, 0.82, 24); v.stand(6); v.actAt(-1, { armR: arm(40, 16, 128, 10), lean: -5, head: [8, -6, 4] }, 9, { handR: "open", face: { smile: 1, lid: 0.85, brow: 0.5 } }); v.actAt(0.55, { armR: arm(60, 16, 150, 10) }, 0.3, { in: 0.1, out: 0.16 });
  add({ id: "yet", a: cut("coin", "yet"), b: cut("yet", "end"), still: 0.95,
    cam: glide({ pos: [2.3, 1.45, 2.95], look: [1.3, 1.22, 0.82], fov: 36 }, { pos: [2.23, 1.45, 2.8], look: [1.3, 1.24, 0.82], fov: 36 }),
    sun: { target: [0.9, 0, 1.1], reach: 5 },
    cast: (t, T) => [play("v", VESPASIAN_D, v, t, [0, 0, 0], 1.76, { seed: 4, talk: talk(W, T, ["yet"]) })],
    things: (g, c, t) => { const p = ahead(c.v, c.v.joint("tipR"), 0.1), u = (t - 0.6) / 0.8, up = u > 0 && u < 1 ? 0.5 * 4 * u * (1 - u) : 0, k = put(g, COIN(), [p[0], p[1] + 0.05 + up, p[2]], 0); k.rotation.set(Math.PI / 2 + (u > 0 && u < 1 ? u * 12.6 : 0), 0.4, 0.3); } });
}
// 11. THAT IS WHY: MONEY: the coin lands in the strongbox by the jar and the collector shuts the lid on it
const endMid = at("end", /^And/) - 0.2;
{
  const col = mover(SOLDIER_D, 1.8, 3.6, 3.75, -50); col.stand(6); col.actAt(-1, "kneel", 9, { in: 0.2, face: { smile: 0.8, gaze: [-0.4, 0.7] } }); col.actAt(0.5, { armR: arm(80, 10, 50, 0), armL: arm(80, 10, 50, 0) }, 3, { in: 0.2, over: 2 });
  add({ id: "chest", a: cut("yet", "end"), b: endMid, still: 0.25,
    cam: glide({ pos: [1.5, 2.05, 5.45], look: [3.05, 0.72, 3.8], fov: 52 }, { pos: [1.6, 2.0, 5.3], look: [3.05, 0.72, 3.8], fov: 52 }),
    sun: { target: [3, 0, 3.8], reach: 5 },
    cast: (t) => [play("col", SOLDIER_D, col, t, [0, WALK, 0], 1.8)],
    things: (g, _c, t) => { lid(put(g, CHEST_FULL(), CHEST_AT, -0.75), 1 - smooth((t - 0.62) / 0.35));
      const u = t / 0.36; if (u < 1) { const k = put(g, COIN(), [CHEST_AT[0] - 0.6 * (1 - u), WALK + 0.36 + 1.1 * (1 - u) + 0.5 * 4 * u * (1 - u), CHEST_AT[2] + 0.5 * (1 - u)], 0); k.rotation.set(u * 9, 0, u * 5); } } });
}
// 12. AND IN PARIS, STREET URINALS WERE LATER: Sir Digsworth by the jar pulls a picture card from his jacket and holds it up
const parisMid = at("end", /named/) - 0.1;
{
  const sir = mover(SIR_D, 1.8, 2.45, 3.2, -128); sir.stand(8);
  sir.actAt(-1, { armL: arm(30, 10, 120, -40), lean: 2 }, 0.9, { out: 0.2, handL: "grip", face: { smile: 0.6, gaze: [0, 0.4] } });
  sir.actAt(0.35, { armL: arm(20, 80, 180, 0), head: [16, 4, 0], lean: -3 }, 9, { in: 0.3, over: 2, handL: "grip", face: { brow: 0.7, smile: 0.9, gaze: [0.7, -0.2] } });
  sir.actAt(0.9, { armR: arm(70, -20, 164, -62) }, 9, { in: 0.25, handR: "point" });
  add({ id: "paris", a: endMid, b: parisMid, still: 1.2,
    cam: glide({ pos: [0.2, 0.6, 1.75], look: [2.6, 1.3, 3.55], fov: 56 }, { pos: [0.4, 0.62, 1.9], look: [2.6, 1.33, 3.55], fov: 56 }),
    sun: { target: [3, 0, 3.4], reach: 6 },
    cast: (t, T) => [play("sir", SIR_D, sir, t, [0, WALK, 0], 1.8, { talk: talk(W, T, ["end"]) })],
    things: (g, c, t, _T, cam) => { const p = c.sir.joint("tipL"), k = put(g, CARD(), [p[0], p[1] + 0.22, p[2]], 0); k.lookAt(cam.pos[0], p[1] + 0.22, cam.pos[2]); k.translateZ(0.06); k.visible = t > 0.3; lid(put(g, CHEST_FULL(), CHEST_AT, -Math.PI / 2), 0); } });
  // 13. NAMED AFTER HIM: VESPASIENNES: close on the card and his face beside it; he taps the name, and tips his cap
  const tip = at("end", /vespasiennes/) + 0.75 - parisMid;
  const s2 = mover(SIR_D, 1.8, 2.45, 3.2, -120); s2.stand(8);
  s2.actAt(-1, { armL: arm(20, 80, 180, 0), head: [20, 2, 4], lean: -3 }, 9, { handL: "grip", face: { brow: 0.8, smile: 1, gaze: [0.8, -0.1] } });
  wag(s2, 0.1, tip - 0.2, P({ armR: arm(70, -20, 164, -62) }), P({ armR: arm(66, -14, 156, -50) }), 0.42, { handR: "point" });
  s2.actAt(tip, { armR: arm(118, 24, 196, 14), head: [0, -6, 0] }, 3, { in: 0.22, handR: "grip", face: { smile: 1, lid: 0.9, brow: 0.5 } });
  add({ id: "name", a: parisMid, b: END, still: 0.9,
    cam: glide({ pos: [0.8, 1.5, 1.85], look: [2.38, 1.56, 3.34], fov: 56 }, { pos: [0.9, 1.5, 1.95], look: [2.38, 1.58, 3.34], fov: 56 }),
    sun: { target: [3, 0, 3.4], reach: 6 },
    cast: (t, T) => [play("sir", SIR_D, s2, t, [0, WALK, 0], 1.8, { talk: talk(W, T, ["end"]), extra: { capLift: t > tip + 0.12 ? 0.5 * smooth((t - tip - 0.12) / 0.2) * (1 - smooth((t - tip - 0.75) / 0.3)) : 0 } })],
    things: (g, c, _t, _T, cam) => { const p = c.sir.joint("tipL"), k = put(g, CARD(), [p[0], p[1] + 0.22, p[2]], 0); k.lookAt(cam.pos[0], p[1] + 0.22, cam.pos[2]); k.translateZ(0.06); } });
}
void (0 as unknown as [Cam, Actor, Staged, MM, typeof C]);

export const ROME_PEE: Film = {
  id: "rome-pee", fps: 30, seconds: END, sky: "#a9dcff", world: romeStreet, shots, words: W,
  hook: { text: ["WHY DID ROME", "TAX PEE?"], a: 0, b: L.hook.b + 0.2 },
  sign: { text: "Dramatised. The story is from Suetonius; nobody knows who paid the tax.", a: L.tax.a, b: L.tax.a + 2.0 },
  hits: [], audio: "craft/rome-pee.wav",
};

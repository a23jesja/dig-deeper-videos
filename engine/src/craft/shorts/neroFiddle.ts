// Short: "Did Nero really fiddle while Rome burned?" Rome in the fire of AD 64 (world/rome.ts romeFire): the burning street, the
// villa at Antium, the emperor's gardens, his private stage. Played on the stage (stage/Stage.tsx); the shots are cut to the
// narration's lines (voice/nero-fiddle). Sources and what must not be claimed: granskning/nero-fiddle/manus.md.
// The fiddle exists only in the picture of the saying (shots 1 to 3 and 9 to 10). Nobody lights anything; the film does not say who did.
import * as THREE from "three";
import { Film, Shot, Cam, V3, Staged, Word, play, talk, smooth } from "../stage/film";
import { mover, mt, wag, arm, MM } from "../stage/acting";
import { lens, once, noShade, put, near } from "../stage/staging";
import { romeFire, FIRE, WALK } from "../world/rome";
import { mesh, box, ball } from "../world/kit";
import { flames, sparks, smoke, embers, flicker } from "../world/fire";
import { fiddle, fiddleBow, cithara, grapes, bundle, tent, gateLeaf, C } from "../world/props";
import { SIR_D, NERO_D, NERO_STAGE_D, RUNNER_D, CITIZEN_D, ROMAN_WOMAN_D, GRANNY_D, BOY_D, BAKER_D, FULLER_D, MERCHANT_D, COLLECTOR_D } from "../looks";
import type { Pose } from "../rig";
import type { Design } from "../designs/common";
import words from "../../../voice/nero-fiddle/words.json";
import lines from "../../../voice/nero-fiddle/lines.json";

const W = words as Word[], L = Object.fromEntries((lines as { id: string; a: number; b: number }[]).map((l) => [l.id, l]));
const cut = (a: string, b: string) => (L[a].b + L[b].a) / 2;       // a cut falls in the pause between two lines
const END = L.cithara.b + 1.9;
/** when a word of a line is spoken (film seconds) */
const at = (line: string, re: RegExp) => W.find((w) => w.line === line && re.test(w.w))!.a;
const P = (o: Partial<Pose>) => o;
const rad = (d: number) => (d * Math.PI) / 180, clamp = (u: number) => Math.max(0, Math.min(1, u));
const OPEN = { handL: "open", handR: "open" } as const;
const on = (name: string, D: Design, m: MM, t: number, y: number, o: Parameters<typeof play>[6] = {}) => play(name, D, m, t, [0, y, 0], m.h, o);
/** the moments of wag(m, t0, dur, a, b, period): one for each swing, kept inside a shot `len` long */
const swings = (t0: number, dur: number, period: number, len: number): number[] => { const o: number[] = []; for (let t = t0; t < t0 + dur - 1e-6; t += period) if (t >= 0 && t < len - 0.05) o.push(t); return o; };

// ---------------- the things of the film (made once, moved by the shots) ----------------
const FIDDLE = once(() => noShade(fiddle(0.6))), BOW = once(() => noShade(fiddleBow(0.62))), CITH = once(() => noShade(cithara(0.62))), GRAPES = once(() => noShade(grapes(0.032)));
const BUNDLES = [0, 1, 2, 3].map((i) => once(() => bundle(0.2 + 0.03 * (i % 2), ["#d9c08a", "#c8a06a", "#e6d2a8", "#b98a5a"][i])));
const TENT_UP = once(() => tent(2.2, 2.4, 1.7, 1)), TENT_B = once(() => tent(2.4, 2.6, 1.8, 1, "#e6d2a8")), TENTS = [0.2, 0.4, 0.6, 0.8, 1].map((u) => once(() => tent(2.2, 2.4, 1.7, u)));
const LEAF_L = once(() => gateLeaf(FIRE.gate.w / 2, FIRE.gate.h)), LEAF_R = once(() => gateLeaf(FIRE.gate.w / 2, FIRE.gate.h));
/** the cithara with its strings set for this frame: `out[i]` = how far string i stands out of line (metres), gone = a string that has snapped */
const cith = (g: THREE.Group, p: V3, ry: number, tilt: number, out: (i: number) => number = () => 0, gone = -1) => { const c = put(g, CITH(), p, ry); c.rotation.z = tilt;
  (c.userData.strings as THREE.Mesh[]).forEach((s, i) => { s.position.x = (i - 3) * 0.62 * 0.62 * 0.085 + out(i); s.visible = i !== gone; }); return c; };
/** the street on fire, as seen along it toward +z: flames in windows and along the roofs on both sides, smoke, sparks, embers on the road */
const streetFire = (g: THREE.Group, T: number, cam: Cam, k = 1, first = true) => {
  const q = Math.PI / 2, e = cam.pos;
  if (first) flames(g, [-4.0, WALK + 1.9, 4.5], T, 1.5 * k, 1.0, 2, q, 1, e); flames(g, [-4.0, WALK + 1.9, 8.4], T, 1.4 * k, 1.0, 2, q, 2, e); flames(g, [-4.05, WALK + 5.6, 6.6], T, 2.4 * k, 6, 5, q, 3, e);
  flames(g, [4.0, WALK + 2.0, 4.55], T, 1.5 * k, 0.9, 2, q, 4, e); flames(g, [4.05, WALK + 4.8, 6.1], T, 2.3 * k, 6, 5, q, 5, e);
  flames(g, [-4.05, WALK + 5.0, 14], T, 3.0 * k, 6, 4, q, 6, e); flames(g, [4.05, WALK + 5.2, 13.2], T, 3.0 * k, 6, 4, q, 7, e); flames(g, [0, 7.2, 31.5], T, 4.5 * k, 9, 5, 0, 8, e);
  smoke(g, [-4.2, 6.5, 7], T, 7, 11, 1.7, 1.5, -2, "#4a4654", 1); smoke(g, [4.2, 6, 6], T, 7, 11, 1.6, -1.2, -2, "#4a4654", 2); smoke(g, [0, 9, 30], T, 8, 16, 3, 2, 0, "#4a4654", 3);
  sparks(g, [-3.6, 3, 6], T, 12, 3, 6, 1); sparks(g, [3.6, 3, 6], T, 12, 3, 6, 2); sparks(g, [0, 4, 14], T, 14, 7, 8, 3);
  embers(g, [-2.6, WALK, 4.2], T, 0.5, 8, 1); embers(g, [2.5, WALK, 5.2], T, 0.5, 8, 2);
};
const hex = (r: number, g: number, b: number) => `rgb(${Math.round(Math.min(255, r))},${Math.round(Math.min(255, g))},${Math.round(Math.min(255, b))})`;
/** the light of a night with a fire in it, laid over the picture: warm round (cx, cy) (per cent of the picture), blue toward the edges */
const fireNight = (T: number, cx = 50, cy = 46, dark = 1) => { const f = flicker(T); return `radial-gradient(ellipse 95% 62% at ${cx}% ${cy}%, ${hex(255 * f, 214 * f, 160 * f)} 0%, ${hex(216 * f, 132 * f, 96 * f)} 36%, ${hex(92 - 26 * dark, 74 - 22 * dark, 132 - 20 * dark)} 76%, ${hex(48 - 16 * dark, 46 - 16 * dark, 104 - 20 * dark)} 100%)`; };

const shots: Shot[] = [];
const add = (s: Shot) => shots.push(s);
/** which light lies over each stretch of the film (film seconds): set by the shots */
const GRADES: { a: number; b: number; g: (T: number) => string | null }[] = [];

// The picture of the saying, used by shots 1, 3, 9 and 10: Nero and Sir Digsworth in the road, the street burning behind them
const NX = 0.62, NZ = 1.7, SX = -0.3, SZ = 1.8;
/** the fiddle under Nero's chin and the bow in his hand; `held` = false when Sir Digsworth has taken it */
const fiddleOn = (g: THREE.Group, n: Staged, cam: Cam) => { const k = n.joint("neck"), f = put(g, FIDDLE(), near([k[0] - 0.12, k[1] - 0.1, k[2]], cam, 0.1), rad(156)); f.rotation.z = -0.1; return f; };
const bowIn = (g: THREE.Group, n: Staged, cam: Cam) => { const h = n.joint("tipR"), b = put(g, BOW(), near([h[0] + 0.12, h[1] - 0.02, h[2]], cam, 0.16), rad(168)); b.rotation.z = 0.1; return b; };
/** Nero fiddling: the fiddle on his left shoulder, the bow going to and fro, his eyes shut */
const fiddler = (dur: number) => { const n = mover(NERO_D, 1.74, NX, NZ, 172); n.stand(9);
  n.actAt(-1, { armL: arm(66, 34, 118, 6), armR: arm(40, 10, 84, -30), head: [14, 4, 12], lean: -2 }, dur + 1, { in: 0.01, out: 0.12, handL: "grip", handR: "grip", face: { lid: 0.95, smile: 1, brow: 0.6 } });
  wag(n, 0, dur - 0.05, P({ armR: arm(44, 0, 92, -50), roll: 3 }), P({ armR: arm(36, 22, 78, -10), roll: -3 }), 0.56, { handR: "grip" }); return n; };

// 1. THE HOOK: the picture of the saying. Night, the street on fire; the emperor saws at a fiddle with his eyes shut, and Sir
//    Digsworth points at it with his whole arm, looks at us, and points again
{
  const b0 = cut("hook", "flames"), V = lens(0.2, 1.45, -1.2, 0, 1, -3, 58);
  const nero = fiddler(b0 + 0.2);
  const sir = mover(SIR_D, 1.8, SX, SZ, 196); sir.stand(9);
  sir.actAt(-1, { armR: arm(86, 52, 98, 58), armL: arm(20, 10, 60, 0), head: [-44, 4, 0], lean: 6 }, 10, { in: 0.01, handR: "point", handL: "fist", face: { wide: 1, lid: 0, brow: 1, gaze: [-0.8, 0.2] } });
  wag(sir, 0.1, 1.2, P({ armR: arm(90, 52, 102, 58) }), P({ armR: arm(82, 52, 92, 56) }), 0.3, { handR: "point" });
  sir.actAt(1.5, { head: [10, -2, 0], armR: arm(60, 40, 110, 50), lean: 0 }, 0.8, { in: 0.16, out: 0.16, antic: 0.2, over: 1.4, handR: "open", face: { wide: 1, lid: 0, brow: 1 } });
  // two people run for it along the far pavement
  const r1 = mover(CITIZEN_D, 1.74, 3.1, 13, 180), r2 = mover(ROMAN_WOMAN_D, 1.66, -3.2, 15, 180); for (const m of [r1, r2]) m.run(mt(m, 16));
  for (const m of [r1, r2]) m.actAt(-1, { armL: arm(60, 20, 120, 0), armR: arm(60, 20, 120, 0) }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { wide: 1, lid: 0, brow: 1, mouth: 0.5, smile: -1 } });
  GRADES.push({ a: 0, b: b0, g: (T) => fireNight(T, 50, 40) });
  add({ id: "hook", a: 0, b: b0, still: 0.5,
    sounds: [...swings(0, b0 - 0.1, 0.28, b0).map((t, i) => ({ t, k: "scratch", g: 0.7, p: -0.3 + 0.1 * (i % 2) })), { t: 0.4, k: "crack", g: 0.6, p: 0.5 }, { t: 1.6, k: "crack", g: 0.6, p: -0.5 }, { t: 2.3, k: "whoosh", g: 0.5 }],
    cam: (_t, u) => V.push(0.22 * u), sun: { target: [0, 0, 3], reach: 9 },
    cast: (t, T) => [on("r1", CITIZEN_D, r1, t, WALK, { seed: 3 }), on("r2", ROMAN_WOMAN_D, r2, t, WALK, { seed: 4 }), on("nero", NERO_D, nero, t, 0, { seed: 5, blink: false }), on("sir", SIR_D, sir, t, 0, { talk: talk(W, T, ["hook"]), blink: false })],
    things: (g, c, _t, T, cam) => { streetFire(g, T, cam); fiddleOn(g, c.nero, cam); bowIn(g, c.nero, cam); put(g, BUNDLES[0](), near(c.r1.joint("tipL"), cam, 0.1)); put(g, BUNDLES[1](), near(c.r2.joint("tipL"), cam, 0.1)); } });
}
// 2. FLAMES EVERYWHERE, AND HE PLAYS A TUNE! Close on Sir Digsworth in the light of the fire: he throws an arm out at the flames
//    and shakes his fist toward the emperor. Behind him people get away along the pavement: a man drags an old woman by the hand and
//    waits for her, a woman runs with a child, a man with a bundle on his back
{
  const a0 = cut("hook", "flames"), b0 = cut("flames", "notso"), len = b0 - a0, V = lens(1.7, 1.5, 0.2, -0.78, 0.62, -4, 50), PLAYS = at("flames", /^plays/) - a0;
  const sir = mover(SIR_D, 1.8, SX, SZ, V.toward(SX, SZ, 8)); sir.stand(9);
  sir.actAt(-1, { armL: arm(96, 60, 104, 70), armR: arm(20, 10, 60, 0), head: [40, -6, 0], lean: -3 }, PLAYS + 1, { in: 0.01, out: 0.14, handL: "open", handR: "fist", face: { wide: 1, lid: 0, brow: 1 } });
  wag(sir, 0.1, PLAYS - 0.3, P({ armL: arm(110, 66, 124, 74), head: [46, -10, 0] }), P({ armL: arm(84, 54, 90, 62), head: [30, -2, 0] }), 0.5, { handL: "open" });
  sir.actAt(PLAYS - 0.16, { armR: arm(120, 30, 170, 6), head: [-34, -2, 0], lean: 6 }, 9, { in: 0.16, antic: 0.3, over: 1.6, handR: "fist", face: { brow: -1, lid: 0, wide: 0.6, smile: -0.8 } });
  wag(sir, PLAYS + 0.06, 3, P({ armR: arm(126, 26, 178, 0) }), P({ armR: arm(112, 34, 160, 14) }), 0.26, { handR: "fist" });
  // the man who drags the old woman along and stops to wait for her
  const man = mover(FULLER_D, 1.76, -3.3, 5.6, 180), gran = mover(GRANNY_D, 1.5, -3.25, 6.5, 180);
  man.walk(mt(man, 1.7), { step: 0.62, tau: 0.4 }).stand(0.7).walk(mt(man, 4), { step: 0.62, tau: 0.4 }); gran.walk(mt(gran, 1.3), { step: 0.5, tau: 0.36 }).stand(0.2).walk(mt(gran, 4), { step: 0.5, tau: 0.36 });
  man.actAt(-1, { armL: arm(-40, 30, -60, 20), twist: -20, head: [0, 0, 0] }, 10, { in: 0.01, handL: "grip", face: { brow: -0.6, lid: 0, wide: 0.6, smile: -0.8 } });
  man.actAt(1.3, { twist: 40, head: [80, 6, 0], armR: arm(60, 30, 110, 40) }, 0.8, { in: 0.2, out: 0.2, antic: 0, over: 1.2, handR: "open", face: { brow: 1, lid: 0, wide: 0.8, mouth: 0.6 } });
  gran.actAt(-1, { lean: 16, armR: arm(70, 10, 90, 0), armL: arm(30, 10, 80, 0), head: [0, -10, 0] }, 10, { in: 0.01, handR: "open", handL: "grip", face: { brow: 0.8, lid: 0.3, mouth: 0.4, smile: -0.8 } });
  const woman = mover(ROMAN_WOMAN_D, 1.66, -1.5, 9.2, 180), boy = mover(BOY_D, 1.12, -1.0, 9.0, 180); for (const m of [woman, boy]) m.run(mt(m, 12), m === boy ? { step: 1.5, tau: 0.26 } : { step: 1.0 });
  woman.actAt(-1, { armR: arm(-30, 30, -50, 20), armL: arm(60, 10, 120, -20), head: [0, -4, 0] }, 10, { in: 0.01, handR: "grip", handL: "grip", face: { wide: 1, lid: 0, brow: 1, mouth: 0.5, smile: -1 } });
  boy.actAt(-1, { armL: arm(150, 30, 170, 20), head: [-50, -10, 0] }, 10, { in: 0.01, handL: "grip", face: { wide: 1, lid: 0, brow: 1, mouth: 0.6 } });
  const baker = mover(BAKER_D, 1.72, -3.4, 11.5, 180); baker.stand(0.5).run(mt(baker, 12), { step: 0.95 });
  baker.actAt(-1, { lean: 26, armL: arm(150, 20, 200, -10), armR: arm(150, 20, 200, -10), head: [0, -16, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: -1, lid: 0.2, mouth: 0.5, smile: -1 } });
  GRADES.push({ a: a0, b: b0, g: (T) => fireNight(T, 30, 44) });
  add({ id: "flames", a: a0, b: b0, still: PLAYS + 0.3,
    sounds: [{ t: 0.1, k: "whoosh", g: 0.5, p: -0.4 }, { t: PLAYS - 0.1, k: "whoosh", g: 0.6, p: 0.3 }, { t: 0.5, k: "crack", g: 0.7, p: -0.6 }, { t: 1.7, k: "crack", g: 0.6, p: -0.4 },
      ...woman.cues().filter((q) => q.k === "step" && q.t < len).map((q) => ({ t: q.t, k: "step", run: true, g: 0.7, p: -0.3 })), ...man.cues().filter((q) => q.k === "step" && q.t < len).map((q) => ({ t: q.t, k: "step", g: 0.6, p: -0.6 }))],
    cam: (_t, u) => V.push(0.14 * u), sun: { target: [-1.5, 0, 4], reach: 9 },
    cast: (t, T) => [on("baker", BAKER_D, baker, t, WALK, { seed: 2 }), on("gran", GRANNY_D, gran, t, WALK, { seed: 3 }), on("man", FULLER_D, man, t, WALK, { seed: 4 }), on("woman", ROMAN_WOMAN_D, woman, t, 0, { seed: 5 }), on("boy", BOY_D, boy, t, 0, { seed: 6 }),
      on("sir", SIR_D, sir, t, 0, { talk: talk(W, T, ["flames"]), blink: false })],
    things: (g, c, _t, T, cam) => { streetFire(g, T, cam, 1, false); const b = c.baker.joint("neck"); put(g, BUNDLES[2](), near([b[0], b[1] - 0.1, b[2] + 0.2], cam, -0.12)).scale.setScalar(1.7); } });
}
// 3. NOT SO FAST: close on the two of them. Sir Digsworth has caught the bow in mid stroke and holds up a finger; the emperor opens
//    his eyes and looks round at him
{
  const a0 = cut("flames", "notso"), b0 = cut("notso", "away"), V = lens(0.33, 1.3, -0.35, 0, 1, 5, 52), GRAB = 0.2;
  const nero = mover(NERO_D, 1.74, NX, NZ, 172); nero.stand(9);
  nero.actAt(-1, { armL: arm(66, 34, 118, 6), armR: arm(40, 10, 84, -30), head: [14, 4, 12], lean: -2 }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { lid: 0.95, smile: 1, brow: 0.6 } });
  wag(nero, -0.4, GRAB + 0.4, P({ armR: arm(44, 0, 92, -50) }), P({ armR: arm(36, 22, 78, -10) }), 0.56, { handR: "grip" });
  nero.actAt(GRAB + 0.1, { head: [44, 0, 4] }, 9, { in: 0.2, antic: 0.2, over: 1.4, face: { lid: 0, wide: 0.7, brow: 1, smile: -0.2, gaze: [0.8, 0] } });
  wag(nero, GRAB + 0.3, 2, P({ armR: arm(42, 6, 88, -36) }), P({ armR: arm(38, 14, 82, -24) }), 0.2, { handR: "grip" });
  const sir = mover(SIR_D, 1.8, 0.04, SZ + 0.05, 186); sir.stand(9);
  sir.actAt(-1, { armR: arm(70, 30, 100, 44), armL: arm(46, 16, 150, 0), head: [-30, 0, 0], lean: 8 }, 10, { in: 0.01, handR: "grip", handL: "point", face: { brow: -0.6, lid: 0.1, smile: 0.3, gaze: [-0.7, 0] } });
  wag(sir, 0.3, 2, P({ armL: arm(46, 22, 154, 10) }), P({ armL: arm(46, 10, 146, -10) }), 0.34, { handL: "point" });
  GRADES.push({ a: a0, b: b0, g: (T) => fireNight(T, 50, 40) });
  add({ id: "notso", a: a0, b: b0, still: 0.7,
    sounds: [{ t: 0.0, k: "scratch", g: 0.7, p: -0.2 }, { t: GRAB, k: "tap", g: 0.9, p: -0.1 }, { t: 0.6, k: "crack", g: 0.5, p: 0.5 }],
    cam: (_t, u) => V.push(0.08 * u), sun: { target: [0, 0, 3], reach: 8 },
    cast: (t, T) => [on("nero", NERO_D, nero, t, 0, { seed: 5, blink: false }), on("sir", SIR_D, sir, t, 0, { talk: talk(W, T, ["notso"]), blink: false })],
    things: (g, c, _t, T, cam) => { streetFire(g, T, cam); fiddleOn(g, c.nero, cam); bowIn(g, c.nero, cam); } });
}
// 4. WHEN THE FIRE BEGAN, SAYS TACITUS, NERO WAS NOT EVEN IN ROME: day, the terrace of the villa above the sea. He lets grapes down
//    into his mouth; a messenger runs in, bends over his knees, and points back along the coast, where smoke stands; Nero looks,
//    starts so that the grapes fly, and runs
const SIGN = { a: cut("notso", "away") + 0.04, b: cut("gardens", "six") };
{
  const a0 = cut("notso", "away"), b0 = cut("away", "gardens"), len = b0 - a0, v = FIRE.villa, V = lens(v.x + 3.2, v.y + 1.45, v.z + 4.6, 0.3, -1, -4, 58);
  const HERE = at("away", /^says/) - a0 - 0.1, POINT = HERE + 0.55, JUMP = at("away", /^not/) - a0 - 0.05, GO = JUMP + 0.5;
  const [nx, nz] = V.spot(3.0, 0.32), nero = mover(NERO_D, 1.74, nx, nz, V.toward(nx, nz, -10)); nero.stand(GO).turn(74, 0.24).run(mt(nero, 6));
  nero.actAt(-1, { armR: arm(164, 22, 196, -6), armL: arm(20, 14, 60, 4), head: [-10, -34, 0], lean: -8 }, JUMP + 1, { in: 0.01, out: 0.06, handR: "grip", handL: "relaxed", face: { lid: 0.7, smile: 0.8, mouth: 0.7, gaze: [0, -0.8] } });
  wag(nero, 0.2, POINT - 0.3, P({ armR: arm(160, 22, 188, -6) }), P({ armR: arm(168, 22, 202, -6) }), 0.6, { handR: "grip" });
  nero.actAt(POINT + 0.1, { head: [40, -4, 0], lean: 0 }, JUMP - POINT - 0.1, { in: 0.2, out: 0.08, antic: 0, over: 1.2, face: { lid: 0.2, brow: 0.4, mouth: 0.2, gaze: [0.8, 0] } });
  nero.actAt(JUMP, "recoil", GO - JUMP + 0.1, { in: 0.08, out: 0.14, antic: 0, over: 1.5 });
  nero.actAt(GO, { armL: arm(60, 20, 120, 0), armR: arm(60, 20, 120, 0), lean: 10 }, 9, { in: 0.14, antic: 0, over: 1.2, handL: "fist", handR: "fist", face: { wide: 1, lid: 0, brow: 1, mouth: 0.6, smile: -1 } });
  const [m0x, m0z] = V.spot(1.5, -2.6), [m1x, m1z] = V.spot(3.25, -0.62), run = Math.hypot(m1x - m0x, m1z - m0z);
  const msg = mover(RUNNER_D, 1.78, m0x, m0z, (Math.atan2(m1x - m0x, m1z - m0z) * 180) / Math.PI); msg.run(mt(msg, run)).stand(9);
  msg.actAt(HERE, { lean: 40, py: -0.12, armL: arm(44, 10, 30, 0), armR: arm(44, 10, 30, 0), head: [0, 20, 0] }, POINT - HERE + 0.05, { in: 0.16, out: 0.14, antic: 0, over: 1.3, handL: "open", handR: "open", face: { lid: 0.6, brow: -0.6, mouth: 0.9 } });
  msg.actAt(POINT, { lean: 8, twist: -30, armL: arm(100, 70, 104, 76), head: [-30, -4, 0] }, 9, { in: 0.2, antic: 0.3, over: 1.6, handL: "point", face: { wide: 1, lid: 0, brow: 1, mouth: 0.8 } });
  wag(msg, POINT + 0.3, 3, P({ armL: arm(106, 70, 112, 76), py: 0.02 }), P({ armL: arm(94, 70, 96, 76), py: -0.02 }), 0.34, { handL: "point" });
  const [fx, fz] = V.spot(330, -74);
  add({ id: "away", a: a0, b: b0, still: POINT + 0.4,
    sounds: [...msg.cues().filter((q) => q.k === "step" && q.t < HERE).map((q) => ({ t: q.t, k: "step", run: true, g: 0.9, p: -0.5 })), { t: HERE, k: "scuff", g: 0.9, p: -0.2 }, { t: POINT, k: "whoosh", g: 0.5, p: -0.3 }, { t: JUMP, k: "whoosh", g: 0.7, p: 0.3 }, { t: JUMP + 0.5, k: "tap", g: 0.5, p: 0.4 },
      ...nero.cues().filter((q) => q.k === "step" && q.t > GO && q.t < len).map((q) => ({ t: q.t, k: "step", run: true, g: 0.9, p: 0.1 }))],
    cam: (_t, u) => V.push(0.16 * u), sun: { target: [v.x + 4, v.y, v.z + 1], reach: 8 },
    cast: (t) => [on("msg", RUNNER_D, msg, t, v.y, { seed: 2 }), on("nero", NERO_D, nero, t, v.y, { seed: 5 })],
    things: (g, c, t, T, cam) => {
      // the smoke of Rome, far along the coast: a glow at its foot
      smoke(g, [fx, 6, fz], T * 0.5, 9, 78, 20, 50, 0, "#5a5664", 5); g.add(mesh(ball(1, 14), "#ff8a3a", { at: [fx, 2, fz], scale: [34, 10, 10], line: 0, shadow: false, receive: false, glow: "#e0521a" }));
      // the grapes: over his mouth, then thrown up as he starts
      const h = near(c.nero.joint("tipR"), cam, 0.06), u = t - JUMP; if (u < 0) put(g, GRAPES(), [h[0], h[1] + 0.1, h[2]]); else if (u < 1.1) { const q = put(g, GRAPES(), [nx + 0.5 * u, v.y + 2.25 + 3.2 * u - 4.9 * u * u, nz - 0.2 * u]); q.rotation.z = u * 9; }
    } });
}
// 5. HE CAME BACK AND OPENED HIS OWN GARDENS TO THE HOMELESS: a smoky dawn, inside the garden gate. The leaves swing open under his
//    hands; he steps aside and waves people in. They come past him without a look, each with his own trouble; to one side two men
//    get a tent up
{
  const a0 = cut("away", "gardens"), b0 = cut("gardens", "six"), len = b0 - a0, q = FIRE.garden, gw = FIRE.gate.w, V = lens(q.x + 0.2, 1.6, q.z + 5.3, -0.03, -1, 3, 62), OPENED = 0.7;
  const nero = mover(NERO_D, 1.74, q.x, q.z - 0.7, 0); nero.stand(0.15).walk(mt(nero, 1.0), { step: 0.6, tau: 0.36 }).turn(-80, 0.24).walk(mt(nero, 1.0), { step: 0.6, tau: 0.36 }).turn(124, 0.3).stand(9);
  nero.actAt(-1, { armL: arm(84, 30, 90, 20), armR: arm(84, 30, 90, 20), lean: 12 }, OPENED + 1.1, { in: 0.01, out: 0.2, ...OPEN, face: { brow: -0.4, lid: 0.1, smile: -0.2 } });
  nero.actAt(2.3, { armL: arm(100, 60, 130, 50), head: [-30, 0, 0] }, 9, { in: 0.24, antic: 0.3, over: 1.4, handL: "open", face: { brow: 0.4, lid: 0, mouth: 0.4 } });
  wag(nero, 2.5, 4, P({ armL: arm(70, 70, 60, 80) }), P({ armL: arm(110, 50, 150, 30) }), 0.62, { handL: "open" });
  // the people: seven, each on his own line through the gate and then out to one side of the picture
  const lane = (D: Design, h: number, x: number, t0: number, side: number, step: number) => { const m = mover(D, h, q.x + x, q.z - 1.3 - 1.5 * t0, 0), o = { step: step * 2, tau: 0.4 }; m.stand(0.55).walk(mt(m, 4.4 + 1.5 * t0), { ...o, keep: true }).turn(side * 36, 0.3).walk(mt(m, 5), o); return m; };
  const cough = lane(CITIZEN_D, 1.74, -0.5, 0.25, 1, 0.3); cough.actAt(-1, { lean: 14, armR: arm(60, 10, 150, -30), head: [0, 14, 0] }, 10, { in: 0.01, handR: "fist", face: { lid: 0.8, brow: -0.8, mouth: 0.5 } }); wag(cough, 1.0, 6, P({ lean: 22, py: -0.03 }), P({ lean: 10 }), 0.42);
  const mother = lane(ROMAN_WOMAN_D, 1.66, 0.6, 0.5, -1, 0.28); mother.actAt(-1, { armL: arm(40, 30, 60, 40), armR: arm(60, 10, 120, -20), head: [-24, 10, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: 0.8, lid: 0.1, smile: -0.6, gaze: [-0.4, 0.7] } });
  const kid = lane(BOY_D, 1.12, 1.1, 0.5, -1, 0.2); kid.actAt(-1, { armR: arm(150, 30, 170, 20), head: [50, -14, 0] }, 10, { in: 0.01, handR: "grip", face: { wide: 1, lid: 0, brow: 1, mouth: 0.4 } });
  const looker = lane(MERCHANT_D, 1.72, 0.0, 1.0, -1, 0.3); looker.actAt(-1, { armL: arm(60, 10, 110, -20), armR: arm(60, 10, 110, -20), lean: 4 }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: 0.6, lid: 0, wide: 0.6, smile: -0.8 } });
  for (const t0 of [2.0, 3.2]) looker.actAt(t0, { twist: 40, head: [80, -6, 0] }, 0.7, { in: 0.2, out: 0.2, antic: 0, over: 1.2 });
  const sacker = lane(BAKER_D, 1.72, 0.9, 1.6, -1, 0.26); sacker.actAt(-1, { lean: 30, armL: arm(-30, 20, -50, 10), armR: arm(-30, 20, -50, 10), head: [0, -20, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: -1, lid: 0.3, mouth: 0.5, smile: -0.8 } });
  const gran = lane(GRANNY_D, 1.5, -0.4, 1.3, 1, 0.18); gran.actAt(-1, { lean: 18, armR: arm(60, 6, 80, 0), armL: arm(30, 10, 70, 0), head: [0, -8, 0] }, 10, { in: 0.01, handR: "grip", handL: "open", face: { brow: 0.6, lid: 0.4, smile: -0.5 } });
  const last = lane(COLLECTOR_D, 1.76, 0.3, 2.2, 1, 0.3); last.actAt(-1, { armL: arm(150, 20, 200, -10), armR: arm(30, 10, 70, 0), head: [0, -4, 0] }, 10, { in: 0.01, handL: "grip", face: { brow: 0.2, lid: 0.3, smile: -0.4 } });
  const folk: [string, Design, MM][] = [["cough", CITIZEN_D, cough], ["mother", ROMAN_WOMAN_D, mother], ["kid", BOY_D, kid], ["looker", MERCHANT_D, looker], ["sacker", BAKER_D, sacker], ["gran", GRANNY_D, gran], ["last", COLLECTOR_D, last]];
  GRADES.push({ a: a0, b: b0, g: () => "linear-gradient(180deg, #b6aecb 0%, #f2c9b4 46%, #f6e2cf 100%)" });
  add({ id: "gardens", a: a0, b: b0, still: 2.5,
    sounds: [{ t: 0.15, k: "creak", g: 1.0, dur: 0.7 }, { t: OPENED, k: "thud", g: 0.8 }, ...cough.cues().filter((c) => c.k === "step" && c.t < len).map((c) => ({ t: c.t, k: "step", g: 0.6, p: -0.2 })), ...mother.cues().filter((c) => c.k === "step" && c.t < len).map((c) => ({ t: c.t, k: "step", g: 0.5, p: 0.2 })),
      { t: 1.3, k: "scuff", g: 0.5, p: -0.3 }, { t: 2.2, k: "scuff", g: 0.5, p: -0.3 }, { t: 2.0, k: "flap", g: 0.7, p: 0.7 }, { t: 2.6, k: "sack", g: 0.6, p: 0.3 }],
    cam: (_t, u) => V.push(0.2 * u), sun: { target: [q.x, 0, q.z + 2], reach: 11 },
    cast: (t) => [on("nero", NERO_D, nero, t, 0, { seed: 5 }), ...folk.map(([n, D, m], i) => on(n, D, m, t, 0, { seed: i + 1 }))],
    things: (g, c, t, T, cam) => {
      const o = 1.75 * smooth((t - 0.15) / (OPENED - 0.15)); put(g, LEAF_L(), [q.x - gw / 2, 0, q.z], -o); put(g, LEAF_R(), [q.x + gw / 2, 0, q.z], Math.PI + o);
      smoke(g, [q.x - 10, 5, q.z - 40], T * 0.6, 8, 40, 9, 16, 0, "#6a6672", 1); smoke(g, [q.x + 14, 5, q.z - 52], T * 0.6, 8, 44, 10, 14, 0, "#6a6672", 2);
      put(g, BUNDLES[0](), near(c.looker.joint("tipL"), cam, 0.1)); put(g, BUNDLES[1](), near(c.mother.joint("tipR"), cam, 0.1)); put(g, BUNDLES[3](), near(c.last.joint("tipL"), cam, -0.1));
      const s = c.sacker.joint("tipL"); put(g, BUNDLES[2](), [s[0], 0, s[2] - 0.25]).scale.setScalar(1.5);
    } });
}

// 6. THE FIRE RAGED FOR SIX DAYS: from above the roofs, looking down the street. The fire walks from house to house toward us
//    while the sky turns from night to day six times over; a roof falls in; small figures run
{
  const a0 = cut("gardens", "six"), b0 = cut("six", "rumour"), len = b0 - a0, V = lens(0.6, 13.5, -10.5, 0, 1, -25, 56), FALL = 1.35;
  const front = (t: number) => 17 - 8.2 * t;      // how far down the street the fire has come (z)
  const run = ([[CITIZEN_D, 1.74, -0.8, 16], [ROMAN_WOMAN_D, 1.66, 0.9, 18], [BAKER_D, 1.72, 0.2, 21], [FULLER_D, 1.76, -1.4, 23]] as [Design, number, number, number][]).map(([D, h, x, z], i) => { const m = mover(D, h, x, z, 180); m.run(mt(m, 14));
    m.actAt(-1, { armL: arm(150, 30, 180, 14), armR: arm(150, 30, 180, 14) }, 10, { in: 0.01, ...OPEN, face: { wide: 1, lid: 0, brow: 1, mouth: 0.6 } }); return { D, m, name: "run" + i }; });
  // the sky goes round six times: dark, light, dark ... (a soft swing, not a flash)
  GRADES.push({ a: a0, b: b0, g: (T) => { const u = (T - a0) / len, day = 0.5 - 0.5 * Math.cos(u * 12 * Math.PI), f = flicker(T), k = (a: number, b: number) => a + (b - a) * day;
    return `linear-gradient(180deg, ${hex(k(52, 196), k(52, 214), k(120, 255))} 0%, ${hex(k(150, 236), k(104, 190), k(110, 170))} 46%, ${hex(255 * f, 190 * f, 130 * f)} 100%)`; } });
  add({ id: "six", a: a0, b: b0, still: FALL + 0.25,
    sounds: [{ t: 0.1, k: "crack", g: 0.8, p: -0.4 }, { t: 0.7, k: "crack", g: 0.8, p: 0.4 }, { t: FALL, k: "smash", g: 1.1, big: 1.4, p: -0.3 }, { t: 1.9, k: "crack", g: 0.7, p: 0.3 }],
    cam: (_t, u) => V.push(1.2 * u), sun: { target: [0, 3, 6], reach: 16 },
    cast: (t) => run.map((q, i) => on(q.name, q.D, q.m, t, 0, { seed: i + 1 })),
    things: (g, _c, t, T, cam) => {
      const q = Math.PI / 2, e = cam.pos, zf = front(t);
      for (let z = 17; z > -6; z -= 2.6) if (z > zf) { const age = Math.min(1, (z - zf) / 5), s = Math.round(z * 3);
        flames(g, [-4.6, WALK + 5.3, z], T, 1.4 + 2.0 * age, 1.6, 2, q, s, e); flames(g, [4.6, WALK + 5.1, z - 1.2], T, 1.4 + 2.0 * age, 1.6, 2, q, s + 3, e); }
      smoke(g, [-5, 8, 12], T, 8, 14, 2.4, 2, -3, "#4a4654", 1); smoke(g, [5, 8, 10], T, 8, 14, 2.4, -2, -3, "#4a4654", 2); sparks(g, [0, 6, 10], T, 24, 9, 9, 3);
      flames(g, [0, 7.2, 31.5], T, 5, 9, 5, 0, 8, e);
      // a roof falls in on the left: its slab drops and tips, sparks burst from where it was
      const u = t - FALL; if (u > 0 && u < 0.9) { const slab = mesh(box(5.2, 0.3, 5.4), C.terra, { at: [-7.1, WALK + 5.5 - 3.2 * Math.min(1, u * u * 4), 6.6], rot: [0.5 * Math.min(1, u * 3), 0, -0.3 * Math.min(1, u * 3)], line: 0.8 }); g.add(slab);
        for (let k = 0; k < 18; k++) { const a = k * 0.7, v = 2.5 + (k % 5); g.add(mesh(ball(0.07, 6), k % 2 ? "#ffb02a" : "#ffe680", { at: [-6.6 + Math.cos(a) * v * u * 0.6, WALK + 5.6 + v * u - 4 * u * u, 6.6 + Math.sin(a) * v * u * 0.6], line: 0, shadow: false, glow: "#ff8a00" })); } }
      // the sun and the moon go over in turn
      const day = ((t / len) * 6) % 1, sunUp = day < 0.5, w = (sunUp ? day : day - 0.5) * 2; g.add(mesh(ball(1, 16), sunUp ? "#ffe680" : "#f2f0e6", { at: [-150 + 300 * w, 70 + 60 * Math.sin(Math.PI * w), 330], scale: sunUp ? 13 : 9, line: 0.6, shadow: false, receive: false, glow: sunUp ? "#ffb02a" : "#b8b6ae" }));
    } });
}
// 7. AND A RUMOUR SPREAD: evening in the garden camp. A man whispers into a woman's ear and mimes plucking strings; she claps a hand
//    to her mouth, turns and whispers it on; the third points up toward the palace. Behind them two men get a tent up
const SANG = at("rumour", /^Nero/) - 0.12;
{
  const a0 = cut("six", "rumour"), b0 = SANG, q = FIRE.garden, V = lens(q.x + 1.0, 1.5, q.z + 8.0, 0, 1, -3, 56), ON = 0.95, POINT = 1.85;
  const who = (D: Design, h: number, d: number, l: number, off: number) => { const [x, z] = V.spot(d, l), m = mover(D, h, x, z, V.toward(x, z, off)); m.stand(9); return m; };
  const a = who(CITIZEN_D, 1.74, 2.95, -0.42, -30), b = who(ROMAN_WOMAN_D, 1.66, 2.65, 0.08, 6), c = who(MERCHANT_D, 1.72, 2.95, 0.6, 20);
  a.actAt(-1, { lean: 10, roll: 8, armL: arm(60, 20, 150, -30), armR: arm(50, 0, 110, -30), head: [40, 4, 8] }, 10, { in: 0.01, handR: "open", handL: "open", face: { brow: 0.8, lid: 0.1, mouth: 0.5, gaze: [0.8, 0] } });
  wag(a, 0.1, ON - 0.1, P({ armR: arm(50, 0, 116, -40) }), P({ armR: arm(50, 0, 100, -16) }), 0.24, { handR: "open" });
  a.actAt(ON + 0.1, { lean: 0, roll: 0, head: [24, 0, 0], armL: arm(20, 10, 50, 0), armR: arm(20, 10, 50, 0) }, 9, { in: 0.3, antic: 0, over: 1.1, handL: "relaxed", handR: "relaxed", face: { brow: 0.6, lid: 0.1, smile: 0.3, gaze: [0.7, 0] } });
  wag(a, ON + 0.5, 3, P({ head: [24, 12, 0] }), P({ head: [24, -4, 0] }), 0.4);
  b.actAt(-1, { head: [-30, 0, -6], armL: arm(20, 10, 60, 0), armR: arm(20, 10, 60, 0) }, 10, { in: 0.01, handL: "relaxed", handR: "relaxed", face: { brow: 0.4, lid: 0.1, gaze: [-0.6, 0] } });
  b.actAt(0.5, { armR: arm(50, 16, 156, -30), head: [-20, -4, 0] }, ON - 0.5 + 0.1, { in: 0.14, out: 0.1, antic: 0.2, over: 1.5, handR: "open", face: { wide: 1, lid: 0, brow: 1, mouth: 0.7 } });
  b.actAt(ON, { lean: 8, roll: 8, armL: arm(60, 20, 150, -30), head: [44, 4, 8] }, 9, { in: 0.2, antic: 0.2, over: 1.4, handL: "open", face: { brow: 0.8, lid: 0, mouth: 0.5, gaze: [0.8, 0] } });
  c.actAt(-1, { armL: arm(20, 10, 60, 0), armR: arm(20, 10, 60, 0), head: [-20, 0, 0] }, 10, { in: 0.01, handL: "relaxed", handR: "relaxed", face: { brow: 0.2, lid: 0.2 } });
  c.actAt(ON + 0.2, { head: [-34, 0, 0] }, POINT - ON - 0.1, { in: 0.16, out: 0.1, antic: 0, over: 1.2, face: { wide: 0.8, lid: 0, brow: 1, mouth: 0.4, gaze: [-0.7, 0] } });
  c.actAt(POINT, { armL: arm(168, 14, 178, 6), head: [10, -22, 0], lean: -4 }, 9, { in: 0.2, antic: 0.3, over: 1.6, handL: "point", face: { wide: 1, lid: 0, brow: 1, mouth: 0.6, gaze: [0.5, -0.8] } });
  GRADES.push({ a: a0, b: b0, g: () => "linear-gradient(180deg, #8f8ab8 0%, #f0c0a4 52%, #f6dcc4 100%)" });
  add({ id: "rumour", a: a0, b: b0, still: POINT + 0.2,
    sounds: [{ t: 0.05, k: "sniff", g: 0.5, p: -0.4 }, { t: 0.5, k: "whoosh", g: 0.4 }, { t: ON, k: "sniff", g: 0.5, p: 0.1 }, { t: POINT, k: "whoosh", g: 0.5, p: 0.4 }, { t: 0.4, k: "flap", g: 0.5, p: -0.6 }],
    cam: (_t, u) => V.push(0.1 * u), sun: { target: [q.x + 5.8, 0, q.z + 11], reach: 9 },
    cast: (t) => [on("a", CITIZEN_D, a, t, 0, { seed: 1 }), on("c", MERCHANT_D, c, t, 0, { seed: 3 }), on("b", ROMAN_WOMAN_D, b, t, 0, { seed: 2 })],
    things: (g, _c, _t, T) => { const [tx, tz] = V.spot(8.5, -2.5), [ux, uz] = V.spot(9.5, 2.6); put(g, TENT_UP(), [tx, 0, tz], 0.2); put(g, TENT_B(), [ux, 0, uz], -0.3);
      smoke(g, [q.x - 6, 6, q.z - 40], T * 0.6, 8, 44, 10, 16, 0, "#6a6672", 1); } });
}
// 8. WHILE ROME BURNED, NERO SANG OF THE FALL OF TROY: the picture the rumour paints (dark round its edge). Nero on his own stage in
//    the long robe of a lyre-player, a hand on his breast, singing with his mouth wide open, the city burning behind him
{
  const a0 = SANG, b0 = cut("rumour", "answer"), s = FIRE.stage, V = lens(s.x + 0.1, 1.5, s.z - 4.0, 0, 1, 8, 54), TROY = at("rumour", /^fall/) - a0;
  const nero = mover(NERO_STAGE_D, 1.74, s.x - 0.1, s.z - 0.2, 180); nero.stand(9);
  nero.actAt(-1, { armR: arm(40, 14, 128, -44), armL: arm(34, 34, 96, 30), head: [0, -18, 6], lean: -6 }, 10, { in: 0.01, handR: "open", handL: "grip", face: { lid: 0.9, brow: 1, mouth: 1 } });
  wag(nero, 0, 4, P({ roll: 5, head: [10, -22, 8], py: 0.02 }), P({ roll: -5, head: [-10, -14, -6], py: -0.01 }), 1.1);
  nero.actAt(TROY - 0.2, { armR: arm(150, 40, 176, 30), lean: -10 }, 9, { in: 0.3, antic: 0.3, over: 1.4, handR: "open", face: { lid: 0.9, brow: 1, mouth: 1 } });
  GRADES.push({ a: a0, b: b0, g: (T) => { const f = flicker(T); return `radial-gradient(ellipse 78% 56% at 50% 45%, ${hex(255 * f, 214 * f, 170 * f)} 0%, ${hex(222 * f, 138 * f, 100 * f)} 44%, #3a2440 84%, #1c1226 100%)`; } });
  add({ id: "sang", a: a0, b: b0, still: TROY + 0.2,
    sounds: [{ t: 0.1, k: "ting", g: 0.6, p: 0.2 }, { t: 0.9, k: "ting", g: 0.6, p: 0.2 }, { t: 1.7, k: "ting", g: 0.6, p: 0.2 }, { t: 0.5, k: "crack", g: 0.6, p: -0.5 }, { t: 2.1, k: "crack", g: 0.6, p: 0.5 }],
    cam: (_t, u) => V.push(0.3 * u), sun: { target: [s.x, 1, s.z], reach: 9 },
    cast: (t) => [on("nero", NERO_STAGE_D, nero, t, s.y, { seed: 5, blink: false })],
    things: (g, c, t, T, cam) => {
      const e = cam.pos; for (const [x, h, i] of [[-13, 3.4, 1], [-6.4, 3.9, 2], [0.6, 3.0, 3], [7, 3.6, 4], [13.6, 3.3, 5]]) { if (i === 3) continue; flames(g, [s.x + x, h + 0.3, s.z + 10.6], T, 3.0, 4.6, 4, 0, i, e); flames(g, [s.x + x - 1.2, h * 0.62, s.z + 10.3], T, 1.3, 0, 1, 0, i + 5, e); }
      smoke(g, [s.x - 6, 9, s.z + 13], T, 8, 14, 2.6, 2, 0, "#4a4654", 1); smoke(g, [s.x + 7, 9, s.z + 13], T, 8, 14, 2.6, -2, 0, "#4a4654", 2); sparks(g, [s.x, 5, s.z + 9], T, 24, 16, 9, 3);
      const h = near(c.nero.joint("tipL"), cam, 0.1); cith(g, [h[0] + 0.14, h[1] - 0.42, h[2]], Math.PI, 0.12, (i) => 0.012 * Math.sin(T * 40 + i) * (((t * 1.25) % 1) < 0.3 ? 1 : 0));
    } });
}
// 9. SANG, PERHAPS. FIDDLED, NEVER: back in the picture of the saying. Sir Digsworth rocks a hand (perhaps), then takes the fiddle from
//    under the emperor's chin, holds it up and shakes his head. The emperor looks at his empty hands
const LATER = at("answer", /^The/) - 0.14;
{
  const a0 = cut("rumour", "answer"), b0 = LATER, V = lens(0.2, 1.45, -0.9, 0, 1, -3, 58), FID = at("answer", /^Fiddled/) - a0, NEVER = at("answer", /^never/) - a0, TAKE = FID - 0.1;
  const nero = fiddler(TAKE + 0.1);
  nero.actAt(TAKE + 0.1, { armL: arm(60, 30, 110, 10), armR: arm(52, 20, 100, -10), head: [20, 22, 0], lean: 4 }, 9, { in: 0.2, antic: 0, over: 1.3, ...OPEN, face: { lid: 0, wide: 0.8, brow: 1, smile: -0.6, gaze: [0, 0.9] } });
  nero.actAt(NEVER + 0.2, { head: [48, 0, 0] }, 9, { in: 0.2, antic: 0, over: 1.2, face: { lid: 0, wide: 0.6, brow: 1, smile: -0.8, gaze: [0.8, 0] } });
  const sir = mover(SIR_D, 1.8, SX, SZ, 196); sir.stand(9);
  sir.actAt(-1, { armL: arm(60, 30, 118, 10), armR: arm(20, 10, 50, 0), head: [-10, 0, 8] }, TAKE + 1, { in: 0.01, out: 0.12, handL: "open", handR: "relaxed", face: { brow: 0.6, lid: 0.2, smile: 0.2 } });
  wag(sir, 0.1, TAKE - 0.3, P({ armL: arm(60, 38, 118, 26), head: [-10, 0, 14] }), P({ armL: arm(60, 22, 118, -6), head: [-10, 0, -4] }), 0.36, { handL: "open" });
  sir.actAt(TAKE - 0.12, { armR: arm(84, 56, 100, 60), lean: 8, head: [-40, 4, 0] }, 0.34, { in: 0.14, out: 0.08, antic: 0.2, over: 1.4, handR: "grip" });
  sir.actAt(TAKE + 0.2, { armR: arm(56, 36, 104, 26), head: [0, 0, 0], lean: 0 }, 9, { in: 0.24, antic: 0, over: 1.4, handR: "grip", face: { brow: -0.6, lid: 0.1, smile: -0.4 } });
  wag(sir, NEVER, 2, P({ head: [20, 0, 0] }), P({ head: [-20, 0, 0] }), 0.34);
  GRADES.push({ a: a0, b: b0, g: (T) => fireNight(T, 50, 40) });
  add({ id: "never", a: a0, b: b0, still: NEVER + 0.25,
    sounds: [...swings(0, TAKE - 0.1, 0.28, b0 - a0).map((t) => ({ t, k: "scratch", g: 0.6, p: -0.3 })), { t: TAKE, k: "whoosh", g: 0.6 }, { t: TAKE + 0.14, k: "tap", g: 0.7 }, { t: 0.6, k: "crack", g: 0.5, p: 0.5 }],
    cam: (_t, u) => V.push(0.14 * u), sun: { target: [0, 0, 3], reach: 9 },
    cast: (t, T) => [on("nero", NERO_D, nero, t, 0, { seed: 5, blink: false }), on("sir", SIR_D, sir, t, 0, { talk: talk(W, T, ["answer"]), blink: false })],
    things: (g, c, t, T, cam) => { streetFire(g, T, cam);
      const f = fiddleOn(g, c.nero, cam), k = smooth((t - TAKE) / 0.26), h = near(c.sir.joint("tipR"), cam, 0.1); f.position.set(f.position.x + (h[0] + 0.12 - f.position.x) * k, f.position.y + (h[1] - 0.3 - f.position.y) * k, f.position.z + (h[2] - f.position.z) * k); f.rotation.z = -0.1 + 0.5 * k;
      if (t < TAKE + 0.1) bowIn(g, c.nero, cam); else { const u = t - TAKE - 0.1, n = c.nero.joint("tipR"); if (u < 0.6) { const b = put(g, BOW(), [n[0] + 0.1, Math.max(0.03, n[1] - 4.9 * u * u), n[2] - 0.2], rad(168)); b.rotation.z = 0.1 - 3 * u; } } } });
}
// 10. THE FIDDLE CAME ABOUT A THOUSAND YEARS LATER: from low down. Sir Digsworth blows on the fiddle and it goes up in sparks; he
//     watches them rise and dusts his hands. The emperor snatches at them
{
  const a0 = LATER, b0 = cut("answer", "cithara"), V = lens(-0.2, 1.0, -1.6, 0.08, 1, 10, 56), BLOW = 0.45, GONE = BLOW + 0.3;
  const sir = mover(SIR_D, 1.8, SX, SZ, 190); sir.stand(9);
  sir.actAt(-1, { armR: arm(56, 36, 104, 26), armL: arm(20, 10, 50, 0), head: [-34, 0, 0], lean: 2 }, GONE + 1.1, { in: 0.01, out: 0.2, handR: "grip", handL: "relaxed", face: { brow: -0.4, lid: 0.1 } });
  sir.actAt(BLOW - 0.2, { lean: 8, roll: -8, head: [-44, -4, 0] }, 0.5, { in: 0.14, out: 0.2, antic: 0.3, over: 1.4, face: { lid: 0.5, brow: 0.6, mouth: 0.25 } });
  sir.actAt(GONE + 0.1, { head: [-20, -34, 0], lean: -6, armR: arm(60, 30, 110, 20) }, 9, { in: 0.3, antic: 0, over: 1.2, handR: "open", face: { brow: 1, lid: 0, wide: 0.6, smile: 0.4, gaze: [0, -1] } });
  wag(sir, GONE + 0.9, 2, P({ armL: arm(50, 6, 112, -34), armR: arm(50, 6, 104, -30) }), P({ armL: arm(50, 6, 100, -28), armR: arm(50, 6, 114, -36) }), 0.26, OPEN);
  const nero = mover(NERO_D, 1.74, NX, NZ, 180); nero.stand(9);
  nero.actAt(-1, { armL: arm(60, 30, 110, 10), armR: arm(52, 20, 100, -10), head: [40, 0, 0] }, GONE + 1.2, { in: 0.01, out: 0.2, ...OPEN, face: { lid: 0, wide: 0.6, brow: 1, smile: -0.8, gaze: [0.8, 0] } });
  wag(nero, GONE + 0.2, 3, P({ armL: arm(150, 30, 176, 10), armR: arm(110, 20, 150, 0), head: [20, -26, 0], py: 0.03 }), P({ armL: arm(110, 30, 150, 10), armR: arm(152, 20, 178, 0), head: [34, -22, 0], py: -0.02 }), 0.44, { ...OPEN, face: { lid: 0, wide: 1, brow: 1, mouth: 0.5, gaze: [0.3, -0.9] } });
  GRADES.push({ a: a0, b: b0, g: (T) => fireNight(T, 56, 52) });
  add({ id: "later", a: a0, b: b0, still: GONE + 0.7,
    sounds: [{ t: BLOW, k: "whoosh", g: 0.7, dur: 0.5 }, { t: GONE, k: "ting", g: 0.9 }, { t: GONE + 0.2, k: "ting", g: 0.6, p: 0.2 }, { t: GONE + 0.5, k: "ting", g: 0.5, p: -0.2 }, ...swings(GONE + 0.9, 1.2, 0.26, b0 - a0).map((t) => ({ t, k: "tap", g: 0.5, p: -0.3 })), ...swings(GONE + 0.2, 1.8, 0.44, b0 - a0).map((t) => ({ t, k: "whoosh", g: 0.35, p: 0.4 }))],
    cam: (_t, u) => V.push(0.12 * u), sun: { target: [0, 0, 3], reach: 9 },
    cast: (t, T) => [on("nero", NERO_D, nero, t, 0, { seed: 5, blink: false }), on("sir", SIR_D, sir, t, 0, { talk: talk(W, T, ["answer"]), blink: false })],
    things: (g, c, t, T, cam) => { streetFire(g, T, cam);
      const h = near(c.sir.joint("tipR"), cam, 0.1), p: V3 = [h[0] + 0.12, h[1] - 0.3, h[2]], k = 1 - smooth((t - BLOW) / 0.3);
      if (k > 0.02) { const f = put(g, FIDDLE(), p, rad(156)); f.rotation.z = 0.4; f.scale.setScalar(k); }
      // the sparks it turns into: a cloud that rises, spreads and goes out
      const u = t - BLOW - 0.1; if (u > 0 && u < 2.2) for (let i = 0; i < 30; i++) { const a = i * 2.4, v = 0.3 + 0.5 * ((i * 7) % 10) / 10, r = 0.034 * Math.max(0, 1 - u / (1.4 + 0.08 * (i % 9)));
        if (r > 0.004) g.add(mesh(ball(1, 6), i % 3 ? "#ffb02a" : "#ffe680", { at: [p[0] + 0.1 + Math.cos(a) * v * u * 0.7 + 0.12 * Math.sin(u * 5 + i), p[1] + 0.1 + (0.6 + v) * u, p[2] + Math.sin(a) * v * u * 0.3], scale: r, line: 0, shadow: false, receive: false, glow: "#ff8a00" })); } } });
}
// 11. HIS INSTRUMENT WAS THE CITHARA: a cithara comes down into the emperor's arms; his knees give, he hugs it and beams
const LYRE = at("cithara", /^kind/) - 0.32, SEVEN = at("cithara", /^seven/), WIDE = L.cithara.b - 0.45;
{
  const a0 = cut("answer", "cithara"), b0 = LYRE, V = lens(NX - 0.05, 1.45, NZ - 2.55, 0, 1, -8, 46), CATCH = 0.55;
  const nero = mover(NERO_D, 1.74, NX, NZ, 180); nero.stand(9);
  nero.actAt(-1, { armL: arm(70, 30, 110, 20), armR: arm(70, 30, 110, 20), head: [0, -30, 0] }, CATCH + 1, { in: 0.01, out: 0.06, ...OPEN, face: { lid: 0, wide: 1, brow: 1, mouth: 0.5, gaze: [0, -1] } });
  nero.actAt(CATCH - 0.02, { py: -0.16, lean: 10, armL: arm(34, 14, 88, -40), armR: arm(34, 14, 88, -40), head: [0, 10, 0] }, 0.4, { in: 0.08, out: 0.24, antic: 0, over: 1.5, handL: "grip", handR: "grip", face: { lid: 0.9, brow: -0.6, smile: -0.4 } });
  nero.actAt(CATCH + 0.34, { armL: arm(30, 14, 84, -40), armR: arm(30, 14, 84, -40), head: [10, 4, 8], lean: -3 }, 9, { in: 0.24, antic: 0, over: 1.3, handL: "grip", handR: "grip", face: { lid: 0.2, brow: 1, smile: 1, mouth: 0.4 } });
  wag(nero, CATCH + 0.7, 3, P({ roll: 4, py: 0.02 }), P({ roll: -4, py: -0.01 }), 0.5);
  GRADES.push({ a: a0, b: b0, g: (T) => fireNight(T, 50, 42) });
  add({ id: "cithara", a: a0, b: b0, still: CATCH + 0.6,
    sounds: [{ t: 0.1, k: "fall", g: 0.7, dur: 0.45 }, { t: CATCH, k: "thunk", g: 0.9 }, { t: CATCH + 0.04, k: "ting", g: 0.9 }, { t: CATCH + 0.2, k: "ting", g: 0.6, p: 0.2 }, { t: 1.2, k: "crack", g: 0.5, p: -0.5 }],
    cam: (_t, u) => V.push(0.14 * u), sun: { target: [0, 0, 3], reach: 9 },
    cast: (t) => [on("nero", NERO_D, nero, t, 0, { seed: 5, blink: false })],
    things: (g, c, t, T, cam) => { streetFire(g, T, cam);
      const l = c.nero.joint("tipL"), r = c.nero.joint("tipR"), hold = near([NX, 0.62, NZ], cam, 0.14), u = t - CATCH;
      cith(g, u < 0 ? [hold[0] + 0.9 * u, hold[1] + 4.9 * u * u * 2.2, hold[2]] : hold, Math.PI, u < 0 ? 1.5 * u : 0.06, (i) => (u > 0 && u < 0.5 ? 0.014 * Math.sin(T * 50 + i * 2) * (1 - u * 2) : 0)); } });
}
// 12. A KIND OF LYRE WITH SEVEN STRINGS: close on the instrument against his chest. His finger goes across the strings, one at a
//     time, and each one trembles as it sounds
{
  const a0 = LYRE, b0 = WIDE, len = b0 - a0, V = lens(NX - 0.02, 1.1, NZ - 1.05, 0, 1, -2, 40), P0 = 0.2, GAP = (len - 0.45) / 7;
  const nero = mover(NERO_D, 1.74, NX, NZ, 180); nero.stand(9);
  nero.actAt(-1, { armL: arm(30, 10, 84, -44), armR: arm(40, 30, 86, 30), head: [6, 20, 0] }, 10, { in: 0.01, handL: "grip", handR: "point", face: { lid: 0.3, brow: 0.6, smile: 0.8, gaze: [0, 0.9] } });
  nero.actAt(P0, { armR: arm(40, -4, 86, -40) }, 9, { in: len - 0.5, antic: 0, over: 1, handR: "point" });
  GRADES.push({ a: a0, b: b0, g: (T) => fireNight(T, 50, 50, 0.5) });
  add({ id: "strings", a: a0, b: b0, still: P0 + GAP * 3.4,
    sounds: [0, 1, 2, 3, 4, 5, 6].map((i) => ({ t: P0 + i * GAP, k: "ting", g: 0.9, p: -0.3 + 0.1 * i })),
    cam: (_t, u) => V.push(0.05 * u), sun: { target: [0, 0, 3], reach: 8 },
    cast: (t) => [on("nero", NERO_D, nero, t, 0, { seed: 5, blink: false })],
    things: (g, c, t, T, cam) => { const p = near([NX + 0.02, 0.8, NZ], cam, 0.14);
      cith(g, p, Math.PI, 0.05, (i) => { const u = t - (P0 + (6 - i) * GAP); return u > 0 && u < 0.5 ? 0.012 * Math.sin(u * 70) * (1 - u * 2) : 0; });
      sparks(g, [0, 1, 6], T, 8, 4, 4, 5); } });
}
// 13. THE END: both of them again. Nero sings at the top of his voice and sweeps the strings; Sir Digsworth puts his fingers in his
//     ears; the seventh string snaps, and the emperor looks at it
{
  const a0 = WIDE, V = lens(0.2, 1.45, -1.35, 0, 1, -3, 58), SNAP = END - a0 - 0.95;
  const nero = mover(NERO_D, 1.74, NX, NZ, 174); nero.stand(9);
  nero.actAt(-1, { armL: arm(44, 10, 104, -44), armR: arm(50, 10, 96, -20), head: [0, -20, 6], lean: -6 }, SNAP + 1.06, { in: 0.01, out: 0.1, handL: "grip", handR: "open", face: { lid: 0.9, brow: 1, mouth: 1 } });
  wag(nero, 0, SNAP - 0.05, P({ armR: arm(54, 30, 100, 26), roll: 4, head: [8, -24, 8] }), P({ armR: arm(46, -6, 92, -44), roll: -4, head: [-8, -16, -4] }), 0.42, { handR: "open" });
  nero.actAt(SNAP + 0.04, { py: -0.03, head: [10, 26, 0], armR: arm(50, 20, 96, 10), lean: 6 }, 9, { in: 0.1, antic: 0, over: 1.5, handR: "open", face: { lid: 0, wide: 0.8, brow: -1, smile: -1, gaze: [0.2, 0.9] } });
  const sir = mover(SIR_D, 1.8, SX - 0.06, SZ, 196); sir.stand(9);
  sir.actAt(-1, { armL: arm(20, 10, 50, 0), armR: arm(20, 10, 50, 0), head: [-30, 0, 0] }, 1.25, { in: 0.01, out: 0.1, handL: "relaxed", handR: "relaxed", face: { brow: 0.4, lid: 0.1, gaze: [-0.7, 0] } });
  sir.actAt(0.22, { armL: arm(70, 50, 160, 6), armR: arm(70, 50, 160, 6), head: [0, 6, 0], py: -0.03, lean: -4 }, 9, { in: 0.2, antic: 0.2, over: 1.5, handL: "point", handR: "point", face: { lid: 0.9, brow: -1, smile: -1 } });
  wag(sir, 0.6, SNAP - 0.7, P({ roll: 3 }), P({ roll: -3 }), 0.42);
  sir.actAt(SNAP + 0.25, { head: [-36, 4, 0] }, 9, { in: 0.2, antic: 0, over: 1.2, face: { lid: 0, brow: 0.8, wide: 0.5, smile: 0.3, gaze: [-0.8, 0.3] } });
  GRADES.push({ a: a0, b: END + 1, g: (T) => fireNight(T, 50, 40) });
  add({ id: "snap", a: a0, b: END, still: 0.9,
    sounds: [...swings(0, SNAP - 0.05, 0.21, END - a0).map((t, i) => ({ t, k: "ting", g: 0.7, p: -0.2 + 0.1 * (i % 3) })), { t: SNAP, k: "snap", g: 1.1, p: -0.2 }, { t: SNAP + 0.05, k: "ting", g: 1.1, p: -0.2 }, { t: 0.5, k: "crack", g: 0.5, p: 0.5 }],
    cam: (_t, u) => V.push(0.16 * u), sun: { target: [0, 0, 3], reach: 9 },
    cast: (t) => [on("nero", NERO_D, nero, t, 0, { seed: 5, blink: false }), on("sir", SIR_D, sir, t, 0, { blink: false })],
    things: (g, c, t, T, cam) => { streetFire(g, T, cam);
      const l = c.nero.joint("tipL"), p = near([l[0] - 0.02, l[1] - 0.3, l[2]], cam, 0.12), u = t - SNAP;
      cith(g, p, Math.PI, 0.08, (i) => (u < 0 ? 0.012 * Math.sin(T * 44 + i * 1.7) : 0), u > 0 ? 6 : -1);
      // the snapped string: it whips up and curls
      if (u > 0) { const k = Math.min(1, u / 0.25), x = p[0] - 3 * 0.62 * 0.62 * 0.085; for (let j = 0; j < 6; j++) g.add(mesh(ball(0.008, 6), "#fbf6ea", { at: [x - 0.03 * j * k - 0.02 * Math.sin(j * 1.3 + u * 6) * k, p[1] + 0.62 * 0.36 + 0.05 * j + 0.06 * k * Math.sin(j * 0.9), p[2] + 0.06], line: 0, shadow: false })); } } });
}

export const NERO_FIDDLE: Film = {
  id: "nero-fiddle", fps: 30, seconds: END, sky: "#a9dcff", world: romeFire, shots, words: W,
  hook: { text: ["DID NERO FIDDLE", "WHILE ROME BURNED?"], a: 0, b: L.hook.b + 0.2, size: 76 },
  sign: { text: "Dramatised. After the Roman historian Tacitus.", a: SIGN.a, b: SIGN.b },
  grade: (T) => GRADES.find((q) => T >= q.a && T < q.b)?.g(T) ?? null,
  // each is the film's own frame at that time (text.md names the times), with the words laid over it
  thumbs: [
    { T: 0.5, words: ["DID NERO", "FIDDLE?"], y: 0.68, size: 150 },
    { T: SANG + 1.2, words: ["OR DID", "HE SING?"], y: 0.7, size: 140 },
    { T: LATER + 1.3, words: ["NO", "FIDDLE"], y: 0.7, size: 150 },
  ],
  hits: [{ t: cut("gardens", "six") + 1.35, amp: 0.5, dur: 0.3 }],
  beds: [{ k: "fire", a: 0, b: SIGN.a, g: 0.9 }, { k: "sea", a: SIGN.a, b: cut("away", "gardens"), g: 0.7 }, { k: "fire", a: SIGN.b, b: cut("six", "rumour"), g: 1 }, { k: "fire", a: SANG, b: END, g: 0.8 }], music: "roman", audio: "craft/nero-fiddle.wav",
};

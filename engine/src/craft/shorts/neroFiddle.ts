// Short: "Did Nero really fiddle while Rome burned?" Rome in the fire of AD 64 (world/rome.ts romeFire): the burning street, the
// villa at Antium, the emperor's gardens, his private stage. Played on the stage (stage/Stage.tsx); the shots are cut to the
// narration's lines (voice/nero-fiddle). Sources and what must not be claimed: granskning/nero-fiddle/manus.md.
// The fiddle exists only in the picture of the saying (shots 1 to 3 and 9 to 10). No sign in the picture: the note that the scenes are
// dramatised, and the source, stand in the description (leverans/nero-fiddle/text.md). Nobody lights anything; the film does not say who did.
import * as THREE from "three";
import { Film, Shot, Cam, V3, Staged, Word, play, talk, smooth, mix3 } from "../stage/film";
import { mover, mt, wag, arm, MM } from "../stage/acting";
import { lens, once, noShade, put, near, carry, palm, aside, span, stageAt, fingers } from "../stage/staging";
import { wield, letGo, blend, quiet, vanish, inHand, onShoulder, fiddlePlay, fiddlePose, bowPose, fiddleAt, citharaHold, citharaPose, citharaPlace, pluckPose, reach, jointsOf, Stand, GRAPES as GRAPES_P, BUNDLE, FIDDLE as FIDDLE_P, BOW as BOW_P } from "../stage/grips";
import { romeFire, FIRE, WALK } from "../world/rome";
import { mesh, box, ball } from "../world/kit";
import { flames, sparks, smoke, embers, flicker, glow, flying } from "../world/fire";
import { fiddleByNeck, fiddleBow, cithara, grapes, bundle, bundleHeld, tent, gateLeaf, C } from "../world/props";
import { SIR_D, NERO_D, NERO_STAGE_D, RUNNER_D, CITIZEN_D, ROMAN_WOMAN_D, ROMAN_WOMAN2_D, ROMAN_WOMAN3_D, GIRL_D, OLDMAN_D, GRANNY_D, BAKER_D, FULLER_D, MERCHANT_D } from "../looks";
import type { Pose } from "../rig";
import type { Design } from "../designs/common";
import words from "../../../voice/nero-fiddle/words.json";
import lines from "../../../voice/nero-fiddle/lines.json";

const W = words as Word[], L = Object.fromEntries((lines as { id: string; a: number; b: number }[]).map((l) => [l.id, l]));
const cut = (a: string, b: string) => (L[a].b + L[b].a) / 2;       // a cut falls in the pause between two lines
/** the last shot ends soon after the last word; a short coda then leads back into the first frame, so that the film loops */
const END13 = L.cithara.b + 1.3, CODA = 0.85, END = END13 + CODA;
/** when a word of a line is spoken (film seconds) */
const at = (line: string, re: RegExp) => W.find((w) => w.line === line && re.test(w.w))!.a;
const P = (o: Partial<Pose>) => o;
const rad = (d: number) => (d * Math.PI) / 180, clamp = (u: number) => Math.max(0, Math.min(1, u));
const OPEN = { handL: "open", handR: "open" } as const;
const on = (name: string, D: Design, m: MM, t: number, y: number, o: Parameters<typeof play>[6] = {}) => play(name, D, m, t, [0, y, 0], m.h, o);
/** the moments of wag(m, t0, dur, a, b, period): one for each swing, kept inside a shot `len` long */
const swings = (t0: number, dur: number, period: number, len: number): number[] => { const o: number[] = []; for (let t = t0; t < t0 + dur - 1e-6; t += period) if (t >= 0 && t < len - 0.05) o.push(t); return o; };

// ---------------- the things of the film (made once, moved by the shots) ----------------
const FIDDLE = once(() => noShade(fiddleByNeck(0.6))), BOW = once(() => noShade(fiddleBow(0.62))), CITH = once(() => noShade(cithara(0.62))), GRAPES = once(() => noShade(grapes(0.032)));
const BUNDLES = [0, 1, 2, 3].map((i) => once(() => bundle(0.2 + 0.03 * (i % 2), ["#d9c08a", "#c8a06a", "#e6d2a8", "#b98a5a"][i])));
/** bundles carried by the knot (stage/grips.ts BUNDLE): in the hand or over the shoulder */
const HELD = [0, 1, 2, 3].map((i) => once(() => noShade(bundleHeld(0.18 + 0.02 * (i % 2), ["#d9c08a", "#c8a06a", "#e6d2a8", "#b98a5a"][i]))));
const TENT_UP = once(() => tent(2.2, 2.4, 1.7, 1)), TENT_B = once(() => tent(2.4, 2.6, 1.8, 1, "#e6d2a8")), TENTS = [0.2, 0.4, 0.6, 0.8, 1].map((u) => once(() => tent(2.2, 2.4, 1.7, u)));
const LEAF_L = once(() => gateLeaf(FIRE.gate.w / 2, FIRE.gate.h)), LEAF_R = once(() => gateLeaf(FIRE.gate.w / 2, FIRE.gate.h));
/** the cithara with its strings set for this frame: `out[i]` = how far string i stands out of line (metres), gone = a string that has snapped */
const cith = (g: THREE.Group, p: V3, ry: number, tilt: number, out: (i: number) => number = () => 0, gone = -1) => { const c = put(g, CITH(), p, ry); c.rotation.z = tilt;
  (c.userData.strings as THREE.Mesh[]).forEach((s, i) => { s.position.x = (i - 3) * 0.62 * 0.62 * 0.085 + out(i); s.visible = i !== gone; s.scale.x = 1; }); return c; };
/** the same for a cithara that is put in place by a hand: sets its strings for this frame and gives it back. thick = how much thicker
 *  than life the strings are drawn (a close shot, where they must be counted) */
const strum = (c: THREE.Object3D, out: (i: number) => number = () => 0, gone = -1, thick = 1) => { (c.userData.strings as THREE.Mesh[]).forEach((s, i) => { s.position.x = (i - 3) * 0.62 * 0.62 * 0.085 + out(i); s.visible = i !== gone; s.scale.x = thick; }); return c; };
/** the street on fire, as seen along it toward +z: ragged fire along the roofs on both sides and out of the windows, its glow on the
 *  walls and on the road, smoke, sparks, burning scraps in the air, embers on the road. k = how big; first = the nearest window too */
const streetFire = (g: THREE.Group, T: number, cam: Cam, k = 1, first = true) => {
  const q = Math.PI / 2, e = cam.pos;
  flames(g, [-4.05, WALK + 5.5, 6.6], T, 3.4 * k, 7, 5, q, 3, e); flames(g, [4.05, WALK + 4.8, 6.1], T, 3.2 * k, 7, 5, q, 5, e);
  flames(g, [-4.05, WALK + 5.0, 14], T, 4.4 * k, 7, 4, q, 6, e); flames(g, [4.05, WALK + 5.2, 13.2], T, 4.2 * k, 7, 4, q, 7, e);
  flames(g, [-4.05, WALK + 5.2, 22], T, 5 * k, 7, 3, q, 9, e); flames(g, [4.05, WALK + 5.2, 21], T, 5 * k, 7, 3, q, 10, e); flames(g, [0, 7.2, 31.5], T, 6.5 * k, 10, 5, 0, 8, e);
  if (first) flames(g, [-3.95, WALK + 1.7, 4.5], T, 2.0 * k, 1.0, 2, q, 1, e);
  flames(g, [-3.95, WALK + 1.7, 8.4], T, 2.3 * k, 1.2, 2, q, 2, e); flames(g, [3.95, WALK + 1.8, 4.55], T, 2.0 * k, 1.0, 2, q, 4, e); flames(g, [3.95, WALK + 1.7, 9.6], T, 2.3 * k, 1.2, 2, q, 11, e);
  glow(g, [-3.92, WALK + 2.7, 6.4], 8, 6, T, q, 1); glow(g, [3.92, WALK + 2.7, 6.8], 8, 6, T, q, 2); glow(g, [-3.92, WALK + 3, 15], 9, 7, T, q, 3); glow(g, [3.92, WALK + 3, 14.5], 9, 7, T, q, 4); glow(g, [0, 0.03, 9], 6, 16, T, 0, 5, true);
  smoke(g, [-4.2, 7.5, 7], T, 7, 11, 1.7, 2.2, -2, "#4a4654", 1); smoke(g, [4.2, 7, 6], T, 7, 11, 1.6, -1.8, -2, "#4a4654", 2); smoke(g, [0, 10, 30], T, 8, 16, 3, 3, 0, "#4a4654", 3);
  sparks(g, [-3.6, 3, 6], T, 12, 3, 6, 1); sparks(g, [3.6, 3, 6], T, 12, 3, 6, 2); sparks(g, [0, 4, 14], T, 14, 7, 8, 3);
  flying(g, [0, 2.4, 5], T, 16, 7, 3.6, 5, 1);
  embers(g, [-2.6, WALK, 4.2], T, 0.5, 8, 1); embers(g, [2.5, WALK, 5.2], T, 0.5, 8, 2);
};
const hex = (r: number, g: number, b: number) => `rgb(${Math.round(Math.min(255, r))},${Math.round(Math.min(255, g))},${Math.round(Math.min(255, b))})`;
/** The light of a night with a fire in it, laid over the picture: the sky above is dark, and from the roofs down everything stands in
 *  the fire's warm light, to the very bottom of the picture, so that the figures are solid from head to foot (the dark is in the sky
 *  and far down the street, not on them). cy = how far down the picture the warm light begins (per cent) */
const fireNight = (T: number, _cx = 50, cy = 46, dark = 1) => { const f = flicker(T); return `linear-gradient(180deg, ${hex(50 - 12 * dark, 48 - 12 * dark, 110 - 16 * dark)} 0%, ${hex(126, 100, 150)} ${Math.max(8, cy - 22)}%, ${hex(255 * f, 208 * f, 152 * f)} ${cy + 8}%, ${hex(250 * f, 196 * f, 146 * f)} 100%)`; };

const shots: Shot[] = [];
const add = (s: Shot) => shots.push(s);
/** the first shot, kept for the coda that leads back into it */
let HOOK: Shot;
/** which light lies over each stretch of the film (film seconds): set by the shots */
const GRADES: { a: number; b: number; g: (T: number) => string | null }[] = [];

// The picture of the saying, used by shots 1, 3 and 9: Nero and Sir Digsworth in the road, the street burning behind them
const NX = 0.62, NZ = 1.7, SX = -0.3, SZ = 1.8;
const mixCam = (a: Cam, b: Cam, k: number): Cam => ({ pos: mix3(a.pos, b.pos, k), look: mix3(a.look, b.look, k), fov: a.fov + (b.fov - a.fov) * k });
/** Nero where he plays in the road, seen through a lens */
const NST = (cam: Cam): Stand => ({ D: NERO_D, at: [NX, 0, NZ], heading: 172, h: 1.74, cam, pose: { lean: -2 } });
/** Nero as he stands at time t (his joints, without drawing him): for poses that must meet his hands */
const neroAt = (m: MM, t: number, cam: Cam) => { const a = on("nero", NERO_D, m, t, 0, { seed: 5, blink: false }); return { ...a, joint: jointsOf({ D: NERO_D, at: a.at, heading: a.heading, h: a.h, cam, pose: a.pose }) } as unknown as Staged; };
/** Nero fiddling: the fiddle under his chin on his left shoulder, his left hand round its neck, the bow drawn to and fro across the
 *  strings by his right hand (stage/grips.ts fiddlePose and bowPose, solved for the lens of the shot); his eyes shut */
const fiddler = (dur: number, cam: Cam) => { const s = NST(cam), n = mover(NERO_D, 1.74, NX, NZ, 172); n.stand(9);
  n.actAt(-1, { ...fiddlePose(s), lean: -2 }, dur + 1, { in: 0.01, out: 0.12, handL: "grip", handR: "grip", face: { lid: 0.95, smile: 1, brow: 0.6 } });
  wag(n, 0, dur - 0.05, P({ ...bowPose(s, 0.2), roll: 3 }), P({ ...bowPose(s, 0.44), roll: -3 }), 0.56, { handR: "grip" }); return n; };
// 1. THE HOOK: the picture of the saying. Night, the street on fire; the emperor saws at a fiddle with his eyes shut, and Sir
//    Digsworth points at it with his whole arm, looks at us, and points again
{
  const b0 = cut("hook", "flames"), V = lens(0.2, 1.45, -1.2, 0, 1, -3, 58);
  const nero = fiddler(b0 + 0.2, V.cam);
  const sir = mover(SIR_D, 1.8, SX, SZ, 196); sir.stand(9);
  sir.actAt(-1, { armR: arm(86, 52, 98, 58), armL: arm(20, 10, 60, 0), head: [-44, 4, 0], lean: 6 }, 10, { in: 0.01, handR: "point", handL: "fist", face: { wide: 1, lid: 0, brow: 1, gaze: [-0.8, 0.2] } });
  wag(sir, 0.1, 1.2, P({ armR: arm(90, 52, 102, 58) }), P({ armR: arm(82, 52, 92, 56) }), 0.3, { handR: "point" });
  sir.actAt(1.45, { head: [10, -2, 0], armR: arm(60, 40, 110, 50), lean: 0 }, 0.85, { in: 0.26, out: 0.24, antic: 0.2, over: 1.4, handR: "open", face: { wide: 1, lid: 0, brow: 1 } });
  // two people run for it along the far pavement
  const r1 = mover(CITIZEN_D, 1.74, 3.1, 13, 180), r2 = mover(ROMAN_WOMAN_D, 1.66, -3.2, 15, 180); for (const m of [r1, r2]) m.run(mt(m, 16));
  for (const m of [r1, r2]) m.actAt(-1, { armL: arm(60, 20, 120, 0), armR: arm(60, 20, 120, 0) }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { wide: 1, lid: 0, brow: 1, mouth: 0.5, smile: -1 } });
  GRADES.push({ a: 0, b: b0, g: (T) => fireNight(T, 50, 28) });
  HOOK = { id: "hook", a: 0, b: b0, still: 0.5,
    sounds: [...swings(0, b0 - 0.1, 0.28, b0).map((t, i) => ({ t, k: "scratch", g: 0.7, p: -0.3 + 0.1 * (i % 2) })), { t: 0.4, k: "crack", g: 0.6, p: 0.5 }, { t: 1.6, k: "crack", g: 0.6, p: -0.5 }, { t: 2.3, k: "whoosh", g: 0.5 }],
    cam: (_t, u) => V.push(0.22 * u), sun: { target: [0, 0, 3], reach: 9 },
    cast: (t, T) => [on("r1", CITIZEN_D, r1, t, WALK, { seed: 3 }), on("r2", ROMAN_WOMAN_D, r2, t, WALK, { seed: 4 }), on("nero", NERO_D, nero, t, 0, { seed: 5, blink: false }), on("sir", SIR_D, sir, t, 0, { talk: talk(W, T, ["hook"]), blink: false })],
    things: (g, c, _t, T, cam) => { streetFire(g, T, cam); fiddlePlay(g, FIDDLE(), BOW(), c.nero, cam);
      wield(g, inHand(HELD[0]()), BUNDLE, "carry", c.r1, "L", cam); wield(g, inHand(HELD[1]()), BUNDLE, "carry", c.r2, "L", cam); } };
  add(HOOK);
}
// 2. FLAMES EVERYWHERE, AND HE PLAYS A TUNE! Seen across the street at a burning house: fire out of its windows and along its roof.
//    Sir Digsworth, turned half toward it, throws an arm out at the flames and then shakes his fist toward the emperor. Behind him the
//    people get away along the street: a woman with her bundle and a girl by the hand, a man who drags an old woman and waits for her,
//    a man bent under a sack, a woman with a bundle on her shoulder
{
  const a0 = cut("hook", "flames"), b0 = cut("flames", "notso"), len = b0 - a0, V = lens(1.6, 1.45, 1.0, -0.72, 0.69, 6, 58), PLAYS = at("flames", /^plays/) - a0;
  const [sx, sz] = V.spot(2.5, 0.44), sir = mover(SIR_D, 1.8, sx, sz, V.toward(sx, sz, -44)); sir.stand(9);
  sir.actAt(-1, { armR: arm(96, 60, 104, 70), armL: arm(20, 10, 60, 0), head: [-40, -6, 0], lean: -3 }, PLAYS + 1, { in: 0.01, out: 0.14, handR: "open", handL: "fist", face: { wide: 1, lid: 0, brow: 1, smile: -0.6 } });
  wag(sir, 0.1, PLAYS - 0.3, P({ armR: arm(110, 66, 124, 74), head: [-46, -10, 0] }), P({ armR: arm(84, 54, 90, 62), head: [-30, -2, 0] }), 0.5, { handR: "open" });
  sir.actAt(PLAYS - 0.16, { armL: arm(124, 62, 168, 56), head: [34, -2, 0], lean: 6 }, 9, { in: 0.16, antic: 0.3, over: 1.6, handL: "fist", face: { brow: -1, lid: 0, wide: 0.6, smile: -0.8 } });
  wag(sir, PLAYS + 0.06, 3, P({ armL: arm(130, 58, 176, 50) }), P({ armL: arm(116, 66, 158, 62) }), 0.26, { handL: "fist", face: { brow: -1, lid: 0, wide: 0.6, smile: -0.8 } });
  const FEAR = { wide: 1, lid: 0, brow: 1, mouth: 0.5, smile: -1 };
  // the woman with her bundle in her arms and the girl she pulls along by the hand
  const woman = mover(ROMAN_WOMAN2_D, 1.72, -1.75, 9.8, 180), girl = mover(GIRL_D, 1.14, -1.2, 9.6, 180); woman.run(mt(woman, 12), { step: 1.0 }); girl.run(mt(girl, 12), { step: 1.5, tau: 0.26 });
  woman.actAt(-1, { armR: arm(50, 6, 96, -30), armL: arm(-30, 30, -50, 20), head: [0, -4, 0], lean: 6 }, 10, { in: 0.01, handR: "grip", handL: "grip", face: FEAR });
  girl.actAt(-1, { armR: arm(150, 30, 170, 20), head: [50, -10, 0] }, 10, { in: 0.01, handR: "grip", face: { wide: 1, lid: 0, brow: 1, mouth: 0.6, smile: -0.8 } });
  // the man who drags the old woman along the pavement and stops to wait for her
  const man = mover(FULLER_D, 1.78, -2.9, 6.6, 180), gran = mover(GRANNY_D, 1.5, -2.95, 7.5, 180);
  man.walk(mt(man, 1.7), { step: 0.62, tau: 0.4 }).stand(0.7).walk(mt(man, 4), { step: 0.62, tau: 0.4 }); gran.walk(mt(gran, 1.3), { step: 0.5, tau: 0.36 }).stand(0.2).walk(mt(gran, 4), { step: 0.5, tau: 0.36 });
  man.actAt(-1, { armL: arm(-40, 30, -60, 20), twist: -20, head: [0, 0, 0] }, 10, { in: 0.01, handL: "grip", face: { brow: -0.6, lid: 0, wide: 0.6, smile: -0.8 } });
  man.actAt(1.2, { twist: 44, head: [52, 6, 0], armR: arm(60, 30, 110, 40) }, 0.95, { in: 0.34, out: 0.3, antic: 0, over: 1.2, handR: "open", face: { brow: 1, lid: 0, wide: 0.8, mouth: 0.6, smile: -0.8 } });
  gran.actAt(-1, { lean: 16, armR: arm(70, 10, 90, 0), armL: arm(30, 10, 80, 0), head: [0, -10, 0] }, 10, { in: 0.01, handR: "open", handL: "grip", face: { brow: 0.8, lid: 0.3, mouth: 0.4, smile: -0.8 } });
  // the man bent under a sack, and the woman with a bundle on her shoulder, a moment later
  const baker = mover(BAKER_D, 1.7, -1.4, 13.6, 180); baker.stand(0.3).run(mt(baker, 14), { step: 0.95 });
  baker.actAt(-1, { lean: 26, armL: arm(150, 20, 200, -10), armR: arm(150, 20, 200, -10), head: [0, -16, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: -1, lid: 0.2, mouth: 0.5, smile: -1 } });
  const w3 = mover(ROMAN_WOMAN3_D, 1.6, -3.6, 15.5, 180); w3.stand(0.5).run(mt(w3, 14), { step: 1.0 });
  w3.actAt(-1, { armL: arm(150, 24, 196, -4), armR: arm(60, 20, 120, 0), head: [-30, -4, 0] }, 10, { in: 0.01, handL: "grip", handR: "fist", face: FEAR });
  GRADES.push({ a: a0, b: b0, g: (T) => fireNight(T, 50, 30) });
  // two pictures (a new one every 1.5-2.5 s in the first five seconds): the burning house, then closer on Sir Digsworth as he turns
  const MID = (b0 - a0) / 2, ax = sx - 1.6, az = sz - 1.0, an = Math.hypot(ax, az), V2 = lens(1.6 + ax * 0.32, 1.5, 1.0 + az * 0.32, ax / an, az / an, 4, 50);      // closer, and looking straight at him
  const flamesShot: Shot = { id: "flames", a: a0, b: b0, still: PLAYS + 0.3,
    sounds: [{ t: 0.1, k: "whoosh", g: 0.5, p: -0.4 }, { t: PLAYS - 0.1, k: "whoosh", g: 0.6, p: 0.3 }, { t: 0.5, k: "crack", g: 0.55, p: -0.6 }, { t: 1.7, k: "crack", g: 0.6, p: -0.4 },
      ...woman.cues().filter((q) => q.k === "step" && q.t < len).map((q) => ({ t: q.t, k: "step", run: true, g: 0.7, p: -0.3 })), ...man.cues().filter((q) => q.k === "step" && q.t < len).map((q) => ({ t: q.t, k: "step", g: 0.6, p: -0.6 }))],
    cam: (_t, u) => V.push(0.14 * u), sun: { target: [-2, 0, 5], reach: 9 },
    cast: (t, T) => [on("w3", ROMAN_WOMAN3_D, w3, t, WALK, { seed: 7 }), on("baker", BAKER_D, baker, t, 0, { seed: 2 }), on("gran", GRANNY_D, gran, t, WALK, { seed: 3 }), on("man", FULLER_D, man, t, WALK, { seed: 4 }), on("woman", ROMAN_WOMAN2_D, woman, t, 0, { seed: 5 }), on("girl", GIRL_D, girl, t, 0, { seed: 6 }),
      on("sir", SIR_D, sir, t, 0, { talk: talk(W, T, ["flames"]), blink: false })],
    things: (g, c, _t, T, cam) => { streetFire(g, T, cam, 1.15);
      wield(g, inHand(HELD[2]()), BUNDLE, "carry", c.woman, "R", cam); onShoulder(g, HELD[3](), c.w3, "L", cam, 0.19);
      const b = c.baker.joint("neck"); put(g, BUNDLES[2](), near([b[0], b[1] - 0.12, b[2]], cam, -0.1)).scale.setScalar(1.7); } };
  add({ ...flamesShot, b: a0 + MID, still: Math.min(PLAYS + 0.3, MID - 0.1), sounds: flamesShot.sounds?.filter((q) => q.t < MID) });
  add({ ...flamesShot, id: "flames2", a: a0 + MID, still: Math.max(0.2, PLAYS + 0.3 - MID), sounds: flamesShot.sounds?.filter((q) => q.t >= MID).map((q) => ({ ...q, t: q.t - MID })),
    cam: (t) => V2.push(0.08 * (MID + t) / (b0 - a0)),
    cast: (t, T) => flamesShot.cast(t + MID, T), things: (g, c, t, T, cam) => flamesShot.things!(g, c, t + MID, T, cam) });
}
// 3. NOT SO FAST: close on the two of them. Sir Digsworth has caught the bow in mid stroke and holds up a finger; the emperor opens
//    his eyes and looks round at him
{
  const a0 = cut("flames", "notso"), b0 = cut("notso", "away"), V = lens(0.33, 1.3, -0.35, 0, 1, 5, 52), GRAB = 0.2;
  const s3 = NST(V.cam), nero = mover(NERO_D, 1.74, NX, NZ, 172); nero.stand(9);
  nero.actAt(-1, { ...fiddlePose(s3), lean: -2 }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { lid: 0.95, smile: 1, brow: 0.6 } });
  wag(nero, -0.4, GRAB + 0.4, P(bowPose(s3, 0.2)), P(bowPose(s3, 0.44)), 0.56, { handR: "grip" });
  nero.actAt(GRAB + 0.1, { head: [44, 0, 4] }, 9, { in: 0.2, antic: 0.2, over: 1.4, face: { lid: 0, wide: 0.7, brow: 1, smile: -0.2, gaze: [0.8, 0] } });
  // where the bow is when he catches it: from Nero's fist through the strings; Sir Digsworth's fist closes on it beyond the strings
  const N3 = neroAt(nero, GRAB, V.cam), frog = mix3(N3.joint("wrR"), N3.joint("tipR"), 0.5), across = fiddleAt(N3, V.cam).bowAt;
  const bd = [across[0] - frog[0], across[1] - frog[1], across[2] - frog[2]], bn = Math.hypot(...bd) || 1, CATCHP: V3 = [frog[0] + (bd[0] / bn) * 0.5, frog[1] + (bd[1] / bn) * 0.5, frog[2] + (bd[2] / bn) * 0.5];
  const S3: Stand = { D: SIR_D, at: [0.04, 0, SZ + 0.05], heading: 186, h: 1.8, cam: V.cam, pose: { lean: 8 } };
  const sir = mover(SIR_D, 1.8, 0.04, SZ + 0.05, 186); sir.stand(9);
  sir.actAt(-1, { armR: arm(70, 30, 100, 44), armL: arm(46, 16, 150, 0), head: [-30, 0, 0], lean: 8 }, 10, { in: 0.01, handR: "open", handL: "point", face: { brow: -0.6, lid: 0.1, smile: 0.3, gaze: [-0.7, 0] } });
  sir.actAt(GRAB - 0.12, { ...reach(S3, "R", CATCHP) }, 9, { in: 0.12, antic: 0, over: 1.2, handR: "grip", handL: "point" });
  wag(sir, 0.3, 2, P({ armL: arm(46, 22, 154, 10) }), P({ armL: arm(46, 10, 146, -10) }), 0.34, { handL: "point" });
  GRADES.push({ a: a0, b: b0, g: (T) => fireNight(T, 50, 18) });
  add({ id: "notso", a: a0, b: b0, still: 0.7,
    sounds: [{ t: 0.0, k: "scratch", g: 0.7, p: -0.2 }, { t: GRAB, k: "tap", g: 0.9, p: -0.1 }, { t: 0.6, k: "crack", g: 0.5, p: 0.5 }],
    cam: (_t, u) => V.push(0.08 * u), sun: { target: [0, 0, 3], reach: 8 },
    cast: (t, T) => [on("nero", NERO_D, nero, t, 0, { seed: 5, blink: false }), on("sir", SIR_D, sir, t, 0, { talk: talk(W, T, ["notso"]), blink: false })],
    things: (g, c, t, T, cam) => { streetFire(g, T, cam);
      // the bow: across the strings while he plays; from the moment it is caught it lies still, from his fist across the strings into
      // the fist that stopped it
      if (t < GRAB) fiddlePlay(g, FIDDLE(), BOW(), c.nero, cam); else { fiddlePlay(g, FIDDLE(), BOW(), c.nero, cam, { bowTo: palm(c.sir, "R") }); fingers(g, c.sir, ["R"], cam, 0.17); } } });
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
  nero.actAt(POINT + 0.1, { head: [40, -4, 0], lean: 0 }, JUMP - POINT - 0.1, { in: 0.2, out: 0.08, antic: 0, over: 1.2, face: { lid: 0, wide: 0.8, brow: 1, mouth: 0.3, smile: -0.7, gaze: [0.8, 0] } });
  nero.actAt(JUMP, "recoil", GO - JUMP + 0.1, { in: 0.08, out: 0.14, antic: 0, over: 1.5 });
  nero.actAt(GO, { armL: arm(60, 20, 120, 0), armR: arm(60, 20, 120, 0), lean: 10 }, 9, { in: 0.14, antic: 0, over: 1.2, handL: "fist", handR: "fist", face: { wide: 1, lid: 0, brow: 1, mouth: 0.6, smile: -1 } });
  const [m0x, m0z] = V.spot(1.5, -2.6), [m1x, m1z] = V.spot(3.25, -0.62), run = Math.hypot(m1x - m0x, m1z - m0z);
  const msg = mover(RUNNER_D, 1.78, m0x, m0z, (Math.atan2(m1x - m0x, m1z - m0z) * 180) / Math.PI); msg.run(mt(msg, run)).stand(9);
  msg.actAt(HERE, { lean: 40, py: -0.12, armL: arm(44, 10, 30, 0), armR: arm(44, 10, 30, 0), head: [0, 20, 0] }, POINT - HERE + 0.05, { in: 0.16, out: 0.14, antic: 0, over: 1.3, handL: "open", handR: "open", face: { lid: 0.5, brow: 1, mouth: 0.7, smile: -1 } });
  msg.actAt(POINT, { lean: 8, twist: -30, armL: arm(100, 70, 104, 76), head: [-30, -4, 0] }, 9, { in: 0.2, antic: 0.3, over: 1.6, handL: "point", face: { wide: 1, lid: 0, brow: 1, mouth: 0.5, smile: -1 } });
  wag(msg, POINT + 0.3, 3, P({ armL: arm(106, 70, 112, 76), py: 0.02 }), P({ armL: arm(94, 70, 96, 76), py: -0.02 }), 0.34, { handL: "point", face: { wide: 1, lid: 0, brow: 1, mouth: 0.5, smile: -1 } });
  let GR0: V3 | null = null;      // where the grapes' stalk leaves his hand
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
      const u = t - JUMP;
      if (u < 0) wield(g, GRAPES(), GRAPES_P, "hold", c.nero, "R", cam);
      else { const camJ = V.push(0.16 * JUMP / len); GR0 ??= quiet(() => near(palm(stageAt(on("nero", NERO_D, nero, JUMP, v.y, { seed: 5 }), camJ), "R"), camJ, 0.05));
        letGo(g, GRAPES(), GRAPES_P, GR0, [0.5, 3.2, -0.2], u, v.y, cam, { centre: [0, -0.18], r: 0.07, spin: 1.2 }); }
    } });
}
// 5. HE CAME BACK AND OPENED HIS OWN GARDENS TO THE HOMELESS: a smoky dawn, inside the garden, low down. The gate stands open; the
//    emperor is at its leaf with a hand on it and waves them in. They come through one after another with air between them, each with
//    his own trouble, and go off across the grass: a mother with a girl by the hand, a man who coughs, a woman with her bundle in her
//    arms, a man bent under a sack, an old man and an old woman together
{
  const a0 = cut("away", "gardens"), b0 = cut("gardens", "six"), len = b0 - a0, q = FIRE.garden, gw = FIRE.gate.w, V = lens(q.x + 0.5, 1.1, q.z + 6.0, -0.02, -1, 11, 54);
  const nero = mover(NERO_D, 1.74, q.x + 1.3, q.z + 1.75, V.toward(q.x + 1.3, q.z + 1.75, -26)); nero.stand(9);
  const CALM = { brow: 0.4, lid: 0.1, smile: -0.2, mouth: 0.3 };
  nero.actAt(-1, { armL: arm(84, 62, 104, 70), armR: arm(42, 36, 96, 38), head: [-30, 0, 0], lean: 2 }, 10, { in: 0.01, handL: "open", handR: "open", face: CALM });
  wag(nero, 0.2, 5, P({ armR: arm(44, 36, 114, 32) }), P({ armR: arm(40, 40, 84, 46) }), 0.7, { handL: "open", handR: "open", face: CALM });
  // each on his own line through the gate, a good step behind the one before, and then off to the side across the grass
  const lane = (D: Design, h: number, x: number, back: number, pace = 0.3, veer = -32) => { const m = mover(D, h, q.x + x, q.z - back, 0), o = { step: pace * 2, tau: 0.4 }; m.walk(mt(m, back + 1.0), { ...o, keep: true }).turn(veer, 0.3).walk(mt(m, 7), o); return m; };
  const SAD = { brow: 0.8, lid: 0.1, smile: -0.7 };
  const mother = lane(ROMAN_WOMAN_D, 1.66, -0.45, -0.4, 0.3, -26); mother.actAt(-1, { armL: arm(24, 26, 34, 30), armR: arm(44, 8, 100, -24), head: [24, 6, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { ...SAD, gaze: [0.4, 0.5] } });
  const girl = lane(GIRL_D, 1.12, 0.13, -0.4, 0.44, -26); girl.actAt(-1, { armR: arm(130, 30, 160, 20), head: [50, -14, 0] }, 10, { in: 0.01, handR: "grip", face: { wide: 1, lid: 0, brow: 1, mouth: 0.4, smile: -0.3 } });
  const cough = lane(CITIZEN_D, 1.74, 0.0, 2.3, 0.3, -10); cough.actAt(-1, { lean: 14, armR: arm(60, 10, 150, -30), head: [0, 14, 0] }, 10, { in: 0.01, handR: "fist", face: { lid: 0.8, brow: -0.8, mouth: 0.5, smile: -0.8 } });
  wag(cough, 1.0, 6, P({ lean: 22, py: -0.03 }), P({ lean: 10 }), 0.42, { handR: "fist", face: { lid: 0.8, brow: -0.8, mouth: 0.5, smile: -0.8 } });
  const woman2 = lane(ROMAN_WOMAN2_D, 1.72, -0.6, 4.1, 0.3, -30); woman2.actAt(-1, { armL: arm(46, 6, 96, -34), armR: arm(46, 6, 96, -34), head: [30, 2, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { ...SAD, gaze: [0.6, 0] } });
  const sacker = lane(BAKER_D, 1.7, -0.05, 5.8, 0.26, -12); sacker.actAt(-1, { lean: 28, armL: arm(150, 20, 200, -10), armR: arm(150, 20, 200, -10), head: [0, -20, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: -1, lid: 0.3, mouth: 0.5, smile: -0.8 } });
  const oldman = lane(OLDMAN_D, 1.64, -0.5, 7.4, 0.2, -20); oldman.actAt(-1, { lean: 12, armR: arm(-20, 10, -60, 10), armL: arm(30, 20, 70, 30), head: [24, 4, 0] }, 10, { in: 0.01, handR: "fist", handL: "open", face: { brow: 0.6, lid: 0.3, smile: -0.5 } });
  const gran = lane(GRANNY_D, 1.5, 0.0, 7.5, 0.2, -20); gran.actAt(-1, { lean: 18, armR: arm(60, 6, 80, 0), armL: arm(30, 10, 70, 0), head: [0, -8, 0] }, 10, { in: 0.01, handR: "grip", handL: "open", face: { brow: 0.6, lid: 0.4, smile: -0.5 } });
  const folk: [string, Design, MM][] = [["gran", GRANNY_D, gran], ["oldman", OLDMAN_D, oldman], ["sacker", BAKER_D, sacker], ["woman2", ROMAN_WOMAN2_D, woman2], ["cough", CITIZEN_D, cough], ["girl", GIRL_D, girl], ["mother", ROMAN_WOMAN_D, mother]];
  GRADES.push({ a: a0, b: b0, g: () => "linear-gradient(180deg, #b6aecb 0%, #f2c9b4 46%, #f6e2cf 100%)" });
  add({ id: "gardens", a: a0, b: b0, still: 2.2,
    sounds: [{ t: 0.05, k: "creak", g: 0.9, dur: 0.6 }, ...cough.cues().filter((c) => c.k === "step" && c.t < len).map((c) => ({ t: c.t, k: "step", g: 0.6, p: -0.2 })), ...mother.cues().filter((c) => c.k === "step" && c.t < len).map((c) => ({ t: c.t, k: "step", g: 0.5, p: 0.2 })),
      { t: 1.3, k: "scuff", g: 0.5, p: -0.3 }, { t: 2.2, k: "scuff", g: 0.5, p: -0.3 }, { t: 2.6, k: "sack", g: 0.6, p: 0.3 }],
    cam: (_t, u) => V.push(0.08 * u), sun: { target: [q.x, 0, q.z + 2], reach: 11 },
    cast: (t) => [...folk.map(([n, D, m], i) => on(n, D, m, t, 0, { seed: i + 1 })), on("nero", NERO_D, nero, t, 0, { seed: 5 })],
    things: (g, c, t, T, cam) => {
      // the far leaf is still swinging open as we come in; the near one stands open under his hand
      const o = 1.2 + 0.55 * smooth(t / 0.6); put(g, LEAF_L(), [q.x - gw / 2, 0, q.z], -o); put(g, LEAF_R(), [q.x + gw / 2, 0, q.z], Math.PI + 1.75);
      smoke(g, [q.x - 10, 5, q.z - 40], T * 0.6, 8, 40, 9, 16, 0, "#6a6672", 1); smoke(g, [q.x + 14, 5, q.z - 52], T * 0.6, 8, 44, 10, 14, 0, "#6a6672", 2);
      wield(g, inHand(HELD[1]()), BUNDLE, "carry", c.mother, "R", cam); carry(g, BUNDLES[0](), c.woman2, "R", c.woman2, "L", cam, { d: 0.08, drop: 0.2 });
      const s = c.sacker.joint("neck"); put(g, BUNDLES[2](), near([s[0], s[1] - 0.12, s[2]], cam, -0.1)).scale.setScalar(1.6);
    } });
}

// 6. THE FIRE RAGED FOR SIX DAYS: from above the roofs, looking down the street. The fire walks from house to house toward us
//    while the sky turns from night to day six times over; a roof falls in; small figures run
{
  const a0 = cut("gardens", "six"), b0 = cut("six", "rumour"), len = b0 - a0, V = lens(0.4, 5.4, -3.5, 0, 1, -12, 58), FALL = 1.35;
  const front = (t: number) => 17 - 8.2 * t;      // how far down the street the fire has come (z)
  const FRIGHT = { wide: 1, lid: 0, brow: 1, mouth: 0.6, smile: -0.8 };
  const run = ([[CITIZEN_D, 1.74, -0.9, 10], [ROMAN_WOMAN2_D, 1.72, 0.9, 12], [BAKER_D, 1.7, 0.1, 14.5], [FULLER_D, 1.78, -1.6, 16.5], [GIRL_D, 1.14, -1.05, 16.7]] as [Design, number, number, number][]).map(([D, h, x, z], i) => { const m = mover(D, h, x, z, 180); m.run(mt(m, 14), i === 4 ? { step: 1.5, tau: 0.26 } : i === 2 ? { step: 0.95 } : undefined);
    // one looks back as he runs, one hugs her bundle, one is bent under a sack, one pulls a girl along by the hand
    if (i === 0) { m.actAt(-1, { head: [0, -4, 0] }, 10, { in: 0.01, face: FRIGHT }); m.actAt(0.4, { twist: 44, head: [64, -6, 0] }, 0.9, { in: 0.34, out: 0.3, antic: 0, over: 1.2, face: FRIGHT }); }
    if (i === 1) m.actAt(-1, { armL: arm(46, 6, 96, -34), armR: arm(46, 6, 96, -34), lean: 8 }, 10, { in: 0.01, handL: "grip", handR: "grip", face: FRIGHT });
    if (i === 2) m.actAt(-1, { lean: 26, armL: arm(150, 20, 200, -10), armR: arm(150, 20, 200, -10), head: [0, -16, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: -1, lid: 0.2, mouth: 0.5, smile: -1 } });
    if (i === 3) m.actAt(-1, { armR: arm(-30, 30, -50, 20), twist: -16 }, 10, { in: 0.01, handR: "grip", face: FRIGHT });
    if (i === 4) m.actAt(-1, { armL: arm(150, 30, 170, 20), head: [-40, -10, 0] }, 10, { in: 0.01, handL: "grip", face: FRIGHT });
    return { D, m, name: "run" + i }; });
  // the sky goes round six times: dark, light, dark ... (a soft swing, not a flash)
  GRADES.push({ a: a0, b: b0, g: (T) => { const u = (T - a0) / len, day = 0.5 - 0.5 * Math.cos(u * 12 * Math.PI), f = flicker(T), k = (a: number, b: number) => a + (b - a) * day;
    return `linear-gradient(180deg, ${hex(k(52, 196), k(52, 214), k(120, 255))} 0%, ${hex(k(150, 236), k(104, 190), k(110, 170))} 46%, ${hex(255 * f, 190 * f, 130 * f)} 100%)`; } });
  add({ id: "six", a: a0, b: b0, still: FALL + 0.25,
    sounds: [{ t: 0.1, k: "crack", g: 0.55, p: -0.4 }, { t: 0.7, k: "crack", g: 0.55, p: 0.4 }, { t: FALL, k: "smash", g: 0.75, big: 1.0, p: -0.3 }, { t: 1.9, k: "crack", g: 0.55, p: 0.3 }],
    cam: (_t, u) => V.push(0.8 * u), sun: { target: [0, 3, 6], reach: 16 },
    cast: (t) => run.map((q, i) => on(q.name, q.D, q.m, t, 0, { seed: i + 1 })),
    things: (g, c, t, T, cam) => {
      carry(g, BUNDLES[0](), c.run1, "R", c.run1, "L", cam, { d: 0.08, drop: 0.2 }); { const s = c.run2.joint("neck"); put(g, BUNDLES[2](), near([s[0], s[1] - 0.12, s[2]], cam, -0.1)).scale.setScalar(1.6); }
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
  const S8: Stand = { D: NERO_STAGE_D, at: [s.x - 0.1, s.y, s.z - 0.2], heading: 180, h: 1.74, cam: V.cam, pose: { lean: -6 } };
  nero.actAt(-1, { armR: arm(40, 14, 128, -44), armL: (citharaPose(S8, false) as { armL: [[number, number], [number, number]] }).armL, head: [0, -18, 6], lean: -6 }, 10, { in: 0.01, handR: "open", handL: "grip", face: { lid: 0.9, brow: 1, mouth: 1 } });
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
      citharaHold(g, strum(CITH(), (i) => 0.012 * Math.sin(T * 40 + i) * (((t * 1.25) % 1) < 0.3 ? 1 : 0)), c.nero, cam, false);
    } });
}
// 9. SANG, PERHAPS. FIDDLED, NEVER: close on the fiddle. The emperor saws on with his eyes shut; a hand comes in, takes the fiddle by
//    its neck and draws it out from under his chin. The picture goes with the fiddle to Sir Digsworth, who holds it up and shakes his head
const LATER = at("answer", /^The/) - 0.14;
{
  const a0 = cut("rumour", "answer"), b0 = LATER, FID = at("answer", /^Fiddled/) - a0, NEVER = at("answer", /^never/) - a0, TAKE = FID - 0.1;
  const VA = lens(0.42, 1.42, -0.2, 0.06, 1, 0, 46), VB = lens(0.02, 1.45, -0.25, -0.06, 1, 0, 46);
  const nero = fiddler(TAKE + 0.1, VA.cam);
  nero.actAt(TAKE + 0.02, { armL: arm(34, 26, 74, 24), armR: arm(30, 14, 60, 0), head: [20, 14, 0], lean: 4 }, 9, { in: 0.16, antic: 0, over: 1.3, handL: "open", handR: "grip", face: { lid: 0, wide: 0.8, brow: 1, smile: -0.6, gaze: [0.6, 0.6] } });
  const sir = mover(SIR_D, 1.8, SX, SZ, 196); sir.stand(9);
  const DRY = { brow: 0.6, lid: 0.2, smile: 0.2 }, FIRM = { brow: -0.6, lid: 0.1, smile: -0.4 };
  sir.actAt(-1, { armL: arm(60, 30, 118, 10), armR: arm(20, 10, 50, 0), head: [-10, 0, 8] }, TAKE + 1, { in: 0.01, out: 0.12, handL: "open", handR: "relaxed", face: DRY });
  wag(sir, 0.1, TAKE - 0.3, P({ armL: arm(60, 38, 118, 26), head: [-10, 0, 14] }), P({ armL: arm(60, 22, 118, -6), head: [-10, 0, -4] }), 0.36, { handL: "open", handR: "relaxed", face: DRY });
  // his hand to the fiddle's neck, beyond Nero's hand, as it is at the moment he takes it
  const S9: Stand = { D: SIR_D, at: [SX, 0, SZ], heading: 196, h: 1.8, cam: VA.cam, pose: { lean: 8 } }, TAKEP = fiddleAt(neroAt(nero, TAKE, VA.cam), VA.cam).scroll;
  sir.actAt(TAKE - 0.14, { ...reach(S9, "R", TAKEP), lean: 8, head: [-40, 4, 0] }, 0.4, { in: 0.14, out: 0.1, antic: 0.2, over: 1.4, handR: "grip", handL: "relaxed", face: DRY });
  sir.actAt(TAKE + 0.24, { armR: arm(64, 56, 116, 60), armL: arm(20, 10, 50, 0), head: [0, 0, 0], lean: 0 }, 9, { in: 0.26, antic: 0, over: 1.4, handR: "grip", handL: "relaxed", face: FIRM });
  wag(sir, NEVER, 2, P({ head: [20, 0, 0] }), P({ head: [-20, 0, 0] }), 0.34, { handR: "grip", handL: "relaxed", face: FIRM });
  GRADES.push({ a: a0, b: b0, g: (T) => fireNight(T, 50, 16) });
  add({ id: "never", a: a0, b: b0, still: NEVER + 0.25,
    sounds: [...swings(0, TAKE - 0.1, 0.28, b0 - a0).map((t) => ({ t, k: "scratch", g: 0.6, p: -0.3 })), { t: TAKE, k: "whoosh", g: 0.6 }, { t: TAKE + 0.14, k: "tap", g: 0.7 }, { t: 0.6, k: "crack", g: 0.5, p: 0.5 }],
    cam: (t) => mixCam(VA.cam, VB.cam, smooth((t - TAKE - 0.05) / 0.5)), sun: { target: [0, 0, 3], reach: 9 },
    cast: (t, T) => [on("nero", NERO_D, nero, t, 0, { seed: 5, blink: false }), on("sir", SIR_D, sir, t, 0, { talk: talk(W, T, ["answer"]), blink: false })],
    things: (g, c, t, T, cam) => { streetFire(g, T, cam);
      // the fiddle goes from under his chin into the hand that takes it by the neck (through both their hands); the bow comes down
      // to hang from Nero's hand
      const k = smooth((t - TAKE) / 0.3), up = (q: THREE.Group) => wield(q, FIDDLE(), FIDDLE_P, "up", c.sir, "R", cam, { at: -0.1 }), low = (q: THREE.Group) => wield(q, BOW(), BOW_P, "lowered", c.nero, "R", cam);
      if (t < TAKE) fiddlePlay(g, FIDDLE(), BOW(), c.nero, cam);
      else { if (k < 0.999) blend(g, FIDDLE(), k, (q) => fiddlePlay(q, FIDDLE(), null, c.nero, cam), up, "fiddle", "nero L & sir R"); else up(g);
        if (k < 0.999) blend(g, BOW(), k, (q) => span(q, BOW(), palm(c.nero, "R"), fiddleAt(c.nero, cam).bowAt, cam, 0.12), low, "bow", "nero R"); else low(g); } } });
}
// 10. THE FIDDLE CAME ABOUT A THOUSAND YEARS LATER: from low down, looking up past them into the night. Sir Digsworth holds the fiddle
//     up by its neck and blows on it: it goes up in sparks. He watches them rise into the dark and dusts his hands
{
  const a0 = LATER, b0 = cut("answer", "cithara"), V = lens(-0.12, 0.62, 0.1, 0.04, 1, 20, 58), BLOW = 0.45, GONE = BLOW + 0.3;
  const sir = mover(SIR_D, 1.8, SX, SZ, V.toward(SX, SZ, 26)); sir.stand(9);
  sir.actAt(-1, { armR: arm(64, 56, 116, 60), armL: arm(20, 10, 50, 0), head: [-30, -10, 0], lean: 2 }, GONE + 1.1, { in: 0.01, out: 0.2, handR: "grip", handL: "relaxed", face: { brow: -0.4, lid: 0.1, smile: -0.2 } });
  sir.actAt(BLOW - 0.2, { lean: 6, roll: -6, head: [-40, -14, 0] }, 0.5, { in: 0.14, out: 0.2, antic: 0.3, over: 1.4, handR: "grip", handL: "relaxed", face: { lid: 0.5, brow: 0.6, mouth: 0.25, smile: -0.2 } });
  sir.actAt(GONE + 0.1, { head: [-20, -34, 0], lean: -6, armR: arm(60, 30, 110, 20) }, 9, { in: 0.3, antic: 0, over: 1.2, handR: "open", handL: "relaxed", face: { brow: 1, lid: 0, wide: 0.6, smile: 0.4, gaze: [0, -1] } });
  wag(sir, GONE + 0.9, 2, P({ armL: arm(50, 6, 112, -34), armR: arm(50, 6, 104, -30) }), P({ armL: arm(50, 6, 100, -28), armR: arm(50, 6, 114, -36) }), 0.26, { ...OPEN, face: { brow: 1, lid: 0.1, smile: 0.5 } });
  GRADES.push({ a: a0, b: b0, g: (T) => fireNight(T, 50, 30) });
  add({ id: "later", a: a0, b: b0, still: GONE + 0.7,
    sounds: [{ t: BLOW, k: "whoosh", g: 0.7, dur: 0.5 }, { t: GONE, k: "ting", g: 0.9 }, { t: GONE + 0.2, k: "ting", g: 0.6, p: 0.2 }, { t: GONE + 0.5, k: "ting", g: 0.5, p: -0.2 }, ...swings(GONE + 0.9, 1.2, 0.26, b0 - a0).map((t) => ({ t, k: "tap", g: 0.5, p: -0.3 })), ...swings(GONE + 0.2, 1.8, 0.44, b0 - a0).map((t) => ({ t, k: "whoosh", g: 0.35, p: 0.4 }))],
    cam: (_t, u) => V.push(0.1 * u), sun: { target: [0, 0, 3], reach: 9 },
    cast: (t, T) => [on("sir", SIR_D, sir, t, 0, { talk: talk(W, T, ["answer"]), blink: false })],
    things: (g, c, t, T, cam) => { streetFire(g, T, cam);
      // the fiddle held up by its neck: it shrinks into his fist as he blows, and what it was goes up as sparks
      const k = 1 - smooth((t - BLOW) / 0.3), p = aside(palm(c.sir, "R"), cam, 0, 0.26);
      if (k > 0.02) { FIDDLE().scale.setScalar(k); wield(g, FIDDLE(), FIDDLE_P, "up", c.sir, "R", cam, { at: -0.1 }); } else { FIDDLE().scale.setScalar(1); vanish(FIDDLE(), FIDDLE_P); }
      const u = t - BLOW - 0.1; if (u > 0 && u < 2.2) for (let i = 0; i < 34; i++) { const a = i * 2.4, v = 0.3 + 0.5 * ((i * 7) % 10) / 10, r = 0.036 * Math.max(0, 1 - u / (1.4 + 0.08 * (i % 9)));
        if (r > 0.004) g.add(mesh(ball(1, 6), i % 3 ? "#ffb02a" : "#ffe680", { at: aside([p[0], p[1] + (0.7 + v) * u, p[2] - 0.1], cam, -0.34 * u - Math.abs(Math.cos(a)) * v * u * 0.6 + 0.06 * Math.sin(u * 5 + i)), scale: r, line: 0, shadow: false, receive: false, glow: "#ff8a00" })); } } });
}
// 11. HIS INSTRUMENT WAS THE CITHARA: seen a quarter round from in front of him. He looks up with his hands out; a cithara comes down
//     out of the night into them; his knees give under it, he hugs it to him and beams
const LYRE = at("cithara", /^kind/) - 0.32, SEVEN = at("cithara", /^seven/), WIDE = L.cithara.b - 0.45;
{
  const a0 = cut("answer", "cithara"), b0 = LYRE, V = lens(NX - 1.1, 1.4, NZ - 2.2, 0.447, 0.894, -3, 48), CATCH = 0.55;
  const nero = mover(NERO_D, 1.74, NX, NZ, V.toward(NX, NZ, 32)); nero.stand(9);
  const JOY = { lid: 0.2, brow: 1, smile: 1, mouth: 0.4 };
  nero.actAt(-1, { armL: arm(66, 20, 88, 10), armR: arm(66, 20, 88, 10), head: [-20, -30, 0], lean: -4 }, CATCH + 1, { in: 0.01, out: 0.06, ...OPEN, face: { lid: 0, wide: 1, brow: 1, mouth: 0.5, gaze: [-0.3, -1] } });
  // when it lands: his left hand round its arm, his right hand open on its strings, hugging it to him (solved for where he stands)
  const S11: Stand = { D: NERO_D, at: [NX, 0, NZ], heading: V.toward(NX, NZ, 32), h: 1.74, cam: V.cam }, HUG = citharaPose(S11, true);
  nero.actAt(CATCH - 0.02, { py: -0.16, lean: 10, ...HUG, head: [0, 10, 0] }, 0.6, { in: 0.08, out: 0.24, antic: 0, over: 1.5, handL: "grip", handR: "open", face: { lid: 0.9, brow: -0.6, smile: -0.4 } });
  nero.actAt(CATCH + 0.34, { ...HUG, head: [10, -4, 8], lean: -3 }, 9, { in: 0.24, antic: 0, over: 1.3, handL: "grip", handR: "open", face: JOY });
  wag(nero, CATCH + 0.7, 3, P({ roll: 4, py: 0.02 }), P({ roll: -4, py: -0.01 }), 0.5, { handL: "grip", handR: "open", face: JOY });
  let K0: { base: V3; tilt: number } | null = null;      // where it stands in his arms when it lands
  GRADES.push({ a: a0, b: b0, g: (T) => fireNight(T, 50, 24) });
  add({ id: "cithara", a: a0, b: b0, still: CATCH + 0.6,
    sounds: [{ t: 0.1, k: "fall", g: 0.7, dur: 0.45 }, { t: CATCH, k: "thunk", g: 0.9 }, { t: CATCH + 0.04, k: "ting", g: 0.9 }, { t: CATCH + 0.2, k: "ting", g: 0.6, p: 0.2 }, { t: 1.2, k: "crack", g: 0.5, p: -0.5 }],
    cam: (_t, u) => V.push(0.14 * u), sun: { target: [0, 0, 3], reach: 9 },
    cast: (t) => [on("nero", NERO_D, nero, t, 0, { seed: 5, blink: false })],
    things: (g, c, t, T, cam) => { streetFire(g, T, cam);
      const u = t - CATCH, tw = (i: number) => (u > 0 && u < 0.5 ? 0.014 * Math.sin(T * 50 + i * 2) * (1 - u * 2) : 0);
      if (u >= 0) citharaHold(g, strum(CITH(), tw), c.nero, cam, true);
      else { const camC = V.push(0.14 * CATCH / (b0 - a0)); K0 ??= quiet(() => citharaPlace(stageAt(on("nero", NERO_D, nero, CATCH, 0, { seed: 5, blink: false }), camC), camC));
        const p = aside([K0.base[0], K0.base[1] + 10.8 * u * u, K0.base[2]], cam, -0.8 * u), r = K0.tilt + 1.5 * u; span(g, strum(CITH(), tw), p, aside(p, cam, Math.cos(r), Math.sin(r)), cam, 0.06); } } });
}
// 12. A KIND OF LYRE WITH SEVEN STRINGS: the instrument alone against the night, held out at his side: a hand behind its box, the
//     other hand's finger on the strings. The finger goes from string to string, seven of them, and each trembles as it sounds
{
  const a0 = LYRE, b0 = WIDE, len = b0 - a0, CX = NX + 0.42, V = lens(CX, 0.95, NZ + 1.15, 0, -1, 14, 40), P0 = 0.2, GAP = (len - 0.45) / 7;
  const GLAD = { lid: 0.3, brow: 0.6, smile: 0.8, gaze: [0.6, 0.6] as [number, number] };
  // his finger goes to each string in turn, from the far one to the near one (stage/grips.ts pluckPose); his poses are solved for the
  // lens of the shot, which looks up at the strings from below: so first where the strings are, then the lens, then the poses again
  const OUT = 0.22;      // held out at his side, so that the night is behind it
  const posed = (cam: Cam) => { const S: Stand = { D: NERO_D, at: [NX, 0, NZ], heading: 0, h: 1.74, cam }, HOLD = (citharaPose(S, false, 0.62, OUT) as { armL: [[number, number], [number, number]] }).armL, m = mover(NERO_D, 1.74, NX, NZ, 0); m.stand(9);
    m.actAt(-1, { armL: HOLD, ...pluckPose(S, 6, 0.62, OUT), head: [30, 14, 0] }, 10, { in: 0.01, handL: "grip", handR: "point", face: GLAD });
    for (let i = 1; i < 7; i++) m.actAt(P0 + i * GAP - 0.1, { armL: HOLD, ...pluckPose(S, 6 - i, 0.62, OUT), head: [30, 14, 0] }, 9, { in: 0.1, antic: 0, over: 1, handL: "grip", handR: "point", face: GLAD }); return m; };
  const where = (m: MM, cam: Cam) => { const K = citharaPlace(neroAt(m, 0.1, cam), cam, 0.62, OUT), hs = aside(K.base, cam, -0.62 * 0.56 * Math.sin(K.tilt), 0.62 * 0.56 * Math.cos(K.tilt)); return lens(hs[0] + 0.06, hs[1] - 0.6, NZ + 1.15, 0, -1, 24, 34).cam; };
  const C12 = where(posed(V.cam), V.cam), nero = posed(C12), eye = (): Cam => C12;
  GRADES.push({ a: a0, b: b0, g: (T) => fireNight(T, 50, 40, 0.5) });
  add({ id: "strings", a: a0, b: b0, still: P0 + GAP * 3.4,
    sounds: [0, 1, 2, 3, 4, 5, 6].map((i) => ({ t: P0 + i * GAP, k: "ting", g: 0.9, p: -0.3 + 0.1 * i })),
    cam: () => eye(), sun: { target: [NX, 0, NZ], reach: 8 },
    cast: (t) => [on("nero", NERO_D, nero, t, 0, { seed: 5, blink: false })],
    things: (g, c, t, T, cam) => {
      citharaHold(g, strum(CITH(), (i) => { const u = t - (P0 + (6 - i) * GAP); return u > 0 && u < 0.5 ? 0.012 * Math.sin(u * 70) * (1 - u * 2) : 0; }, -1, 1.7), c.nero, cam, true, 0.62, { out: OUT });
      flying(g, [CX, 2.6, NZ - 3], T, 6, 3, 2, 2, 7); } });
}
// 13. THE END: the two of them from the side of the street, the burning house behind. Nero sings at the top of his voice and sweeps the
//     strings; behind him Sir Digsworth puts his fingers in his ears; the seventh string snaps, and the emperor looks at it
{
  const a0 = WIDE, V = lens(1.99, 1.45, -0.22, -0.62, 0.78, -2, 58), SNAP = END13 - a0 - 0.75;
  const nero = mover(NERO_D, 1.74, NX, NZ, V.toward(NX, NZ, 22)); nero.stand(9);
  const SING = { lid: 0.9, brow: 1, mouth: 1 }, S13: Stand = { D: NERO_D, at: [NX, 0, NZ], heading: V.toward(NX, NZ, 22), h: 1.74, cam: V.cam, pose: { lean: -6 } };
  const HOLD13 = (citharaPose(S13, false) as { armL: [[number, number], [number, number]] }).armL;
  nero.actAt(-1, { armL: HOLD13, ...pluckPose(S13, 3), head: [0, -20, 6], lean: -6 }, 10, { in: 0.01, handL: "grip", handR: "open", face: SING });
  // he sweeps his open hand across the strings, from the far side to the near and back
  wag(nero, 0, SNAP - 0.05, P({ ...pluckPose(S13, 1), roll: 4, head: [8, -24, 8] }), P({ ...pluckPose(S13, 5), roll: -4, head: [-8, -16, -4] }), 0.42, { handL: "grip", handR: "open", face: SING });
  nero.actAt(SNAP + 0.04, { py: -0.03, head: [10, 26, 0], armL: HOLD13, ...pluckPose(S13, 4), lean: 6 }, 9, { in: 0.1, antic: 0, over: 1.5, handL: "grip", handR: "open", face: { lid: 0, wide: 0.8, brow: -1, smile: -1, gaze: [0.2, 0.9] } });
  const sir = mover(SIR_D, 1.8, SX - 0.06, SZ, V.toward(SX - 0.06, SZ, -14)); sir.stand(9);
  const PAIN = { lid: 0.9, brow: -1, smile: -1 };
  sir.actAt(-1, { armL: arm(20, 10, 50, 0), armR: arm(20, 10, 50, 0), head: [-30, 0, 0] }, 1.25, { in: 0.01, out: 0.1, handL: "relaxed", handR: "relaxed", face: { brow: 0.4, lid: 0.1, gaze: [-0.7, 0] } });
  sir.actAt(0.22, { armL: arm(70, 50, 160, 6), armR: arm(70, 50, 160, 6), head: [0, 6, 0], py: -0.03, lean: -4 }, 9, { in: 0.2, antic: 0.2, over: 1.5, handL: "point", handR: "point", face: PAIN });
  wag(sir, 0.6, SNAP - 0.7, P({ roll: 3 }), P({ roll: -3 }), 0.42, { handL: "point", handR: "point", face: PAIN });
  sir.actAt(SNAP + 0.25, { head: [-36, 4, 0] }, 9, { in: 0.2, antic: 0, over: 1.2, handL: "point", handR: "point", face: { lid: 0, brow: 0.8, wide: 0.5, smile: 0.3, gaze: [-0.8, 0.3] } });
  GRADES.push({ a: a0, b: END + 1, g: (T) => fireNight(T, 50, 28) });
  add({ id: "snap", a: a0, b: END13, still: 0.9,
    sounds: [...swings(0, SNAP - 0.05, 0.21, END13 - a0).map((t, i) => ({ t, k: "ting", g: 0.7, p: -0.2 + 0.1 * (i % 3) })), { t: SNAP, k: "snap", g: 0.7, p: -0.2 }, { t: SNAP + 0.05, k: "ting", g: 0.8, p: -0.2 }, { t: 0.5, k: "crack", g: 0.5, p: 0.5 }],
    cam: (_t, u) => V.push(0.16 * u), sun: { target: [0, 0, 3], reach: 9 },
    cast: (t) => [on("sir", SIR_D, sir, t, 0, { blink: false }), on("nero", NERO_D, nero, t, 0, { seed: 5, blink: false })],
    things: (g, c, t, T, cam) => { streetFire(g, T, cam, 1.1);
      const u = t - SNAP, ci = citharaHold(g, strum(CITH(), (i) => (u < 0 ? 0.012 * Math.sin(T * 44 + i * 1.7) : 0), u > 0 ? 6 : -1), c.nero, cam, true), p: V3 = [ci.position.x, ci.position.y, ci.position.z];
      // the snapped string: it whips up and curls
      if (u > 0) { const k = Math.min(1, u / 0.25); for (let j = 0; j < 6; j++) g.add(mesh(ball(0.008, 6), "#fbf6ea", { at: near(aside(p, cam, 0.098 + 0.03 * j * k + 0.02 * Math.sin(j * 1.3 + u * 6) * k, 0.62 * 0.36 + 0.05 * j + 0.06 * k * Math.sin(j * 0.9)), cam, 0.06), line: 0, shadow: false })); } } });
}
// 14. THE CODA: back in the burning street a moment before the first frame: the emperor fiddles, Sir Digsworth points. The lens runs
//     straight on into the first frame, so that the film loops
{
  const H = HOOK, len = H.b - H.a;
  add({ id: "loop", a: END13, b: END, still: CODA - 0.04, sounds: [{ t: 0.1, k: "scratch", g: 0.6, p: -0.3 }, { t: 0.4, k: "scratch", g: 0.6, p: -0.2 }],
    cam: (t) => H.cam(t - CODA, (t - CODA) / len), sun: H.sun,
    cast: (t, T) => H.cast(t - CODA, T - END), things: (g, c, t, T, cam) => H.things?.(g, c, t - CODA, T - END, cam) });
}

export const NERO_FIDDLE: Film = {
  id: "nero-fiddle", fps: 30, seconds: END, sky: "#a9dcff", world: romeFire, shots, words: W,
  hook: { text: ["DID NERO FIDDLE", "WHILE ROME BURNED?"], a: 0, b: cut("hook", "flames"), size: 76 },
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

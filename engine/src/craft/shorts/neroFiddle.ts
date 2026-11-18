// Short: "Did Nero really fiddle while Rome burned?" Rome in the fire of AD 64 (world/rome.ts romeFire): the burning street, the
// villa at Antium, the emperor's gardens, his private stage. Played on the stage (stage/Stage.tsx); the shots are cut to the
// narration's lines (voice/nero-fiddle). Sources and what must not be claimed: granskning/nero-fiddle/manus.md.
// The fiddle exists only in the picture of the saying (shots 1 to 3 and 9 to 10). No sign in the picture: the note that the scenes are
// dramatised, and the source, stand in the description (leverans/nero-fiddle/text.md). Nobody lights anything; the film does not say who did.
import * as THREE from "three";
import { Film, Shot, Cam, V3, Staged, Word, play, talk, smooth, mix3 } from "../stage/film";
import { mover, mt, wag, arm, MM } from "../stage/acting";
import { lens, once, noShade, put, near, carry, palm, aside, span, stageAt, fingers } from "../stage/staging";
import { wield, letGo, blend, quiet, vanish, inHand, onShoulder, fiddlePlay, fiddlePose, bowPose, fiddleAt, citharaHold, citharaPose, citharaPlace, pluckPose, reach, jointsOf, usePose, Stand, GRAPES as GRAPES_P, BUNDLE, FIDDLE as FIDDLE_P, BOW as BOW_P, PEN, SCROLL } from "../stage/grips";
import { romeFire, FIRE, WALK } from "../world/rome";
import { mesh, box, ball, cyl, group, paint } from "../world/kit";
import { flames, sparks, smoke, embers, flicker, glow, flying } from "../world/fire";
import { fiddleByNeck, fiddleBow, cithara, grapes, bundle, bundleHeld, tent, gateLeaf, painted, table, scrollHeld, reedPen, C } from "../world/props";
import { SIR_D, NERO_D, TACITUS_D, RUNNER_D, CITIZEN_D, ROMAN_WOMAN_D, ROMAN_WOMAN2_D, ROMAN_WOMAN3_D, GIRL_D, OLDMAN_D, GRANNY_D, BAKER_D, FULLER_D, MERCHANT_D } from "../looks";
import type { Pose } from "../rig";
import type { Design } from "../designs/common";
import words from "../../../voice/nero-fiddle/words.json";
import lines from "../../../voice/nero-fiddle/lines.json";

const W = words as Word[], L = Object.fromEntries((lines as { id: string; a: number; b: number }[]).map((l) => [l.id, l]));
const cut = (a: string, b: string) => (L[a].b + L[b].a) / 2;       // a cut falls in the pause between two lines
/** the last shot ends soon after the last word; a short coda then leads back into the first frame, so that the film loops */
/** the end: after the closing line (Jesper's, version 2) a short coda leads into the first frame: from the end of the last word to "Did"
 *  1.44 s (a test of a short silence before the loop, GROWTH.md) */
const LAST = W[W.length - 1].b, END13 = LAST + 0.6, CODA = 0.84, END = END13 + CODA;
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
  wag(n, 0, dur - 0.05, P({ ...bowPose(s, 0.2), roll: 6, head: [8, 4, 6] }), P({ ...bowPose(s, 0.44), roll: -6, head: [-8, 10, -6] }), 0.56, { handR: "grip" }); return n; };
// 1. THE HOOK: the picture of the saying. Night, the street on fire; the emperor saws at a fiddle with his eyes shut, and Sir
//    Digsworth points at it with his whole arm, looks at us, and points again
{
  const b0 = cut("hook", "flames"), V = lens(0.2, 1.45, -1.2, 0, 1, -3, 58);
  const nero = fiddler(b0 + 0.2, V.cam);
  // Sir Digsworth strides in from the right of the picture (moving from the very first frame) and throws his arm out at the emperor
  const IN = 0.7, sir = mover(SIR_D, 1.8, SX - 0.85, SZ + 0.08, 92); sir.walk(mt(sir, 0.82), { step: 0.62, tau: 0.3 }).turn(104, 0.3).stand(9);
  sir.actAt(-1, { armR: arm(30, 14, 60, 10), armL: arm(20, 10, 60, 0), head: [-30, 0, 0], lean: 4 }, IN + 0.2, { in: 0.01, out: 0.14, handR: "relaxed", handL: "fist", face: { wide: 1, lid: 0, brow: 1, gaze: [-0.8, 0.2] } });
  sir.actAt(IN - 0.12, { armR: arm(86, 52, 98, 58), armL: arm(20, 10, 60, 0), head: [-44, 4, 0], lean: 6 }, 9, { in: 0.22, antic: 0.25, over: 1.4, handR: "point", handL: "fist", face: { wide: 1, lid: 0, brow: 1, gaze: [-0.8, 0.2] } });
  wag(sir, IN + 0.25, 0.55, P({ armR: arm(90, 52, 102, 58) }), P({ armR: arm(82, 52, 92, 56) }), 0.3, { handR: "point" });
  sir.actAt(1.45, { head: [10, -2, 0], armR: arm(60, 40, 110, 50), lean: 0 }, 0.85, { in: 0.26, out: 0.24, antic: 0.2, over: 1.4, handR: "open", face: { wide: 1, lid: 0, brow: 1 } });
  // two people run for it along the far pavement
  const r1 = mover(CITIZEN_D, 1.74, 3.1, 13, 180), r2 = mover(ROMAN_WOMAN_D, 1.66, -3.2, 15, 180); for (const m of [r1, r2]) m.run(mt(m, 16));
  for (const m of [r1, r2]) m.actAt(-1, { armL: arm(60, 20, 120, 0), armR: arm(60, 20, 120, 0) }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { wide: 1, lid: 0, brow: 1, mouth: 0.5, smile: -1 } });
  GRADES.push({ a: 0, b: b0, g: (T) => fireNight(T, 50, 28) });
  HOOK = { id: "hook", a: 0, b: b0, still: 0.5,
    sounds: [...sir.cues().filter((q) => q.k === "step" && q.t < b0).map((q) => ({ t: q.t, k: "step", g: 0.6 })), ...swings(0, b0 - 0.1, 0.28, b0).map((t, i) => ({ t, k: "scratch", g: 0.7, p: -0.3 + 0.1 * (i % 2) })), { t: 0.4, k: "crack", g: 0.6, p: 0.5 }, { t: 1.6, k: "crack", g: 0.6, p: -0.5 }, { t: 2.3, k: "whoosh", g: 0.5 }],
    cam: (_t, u) => V.push(0.36 * u), sun: { target: [0, 0, 3], reach: 9 },
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
// 4. WHEN THE FIRE BEGAN, SAYS TACITUS, ... Tacitus at his desk some fifty years later, writing it down: a scroll in one hand, the pen in
//    the other, his name on a plaque on the wall beside him (version 2: so that nobody takes the messenger at the villa for him)
const TAC_A = cut("notso", "away"), TAC_B = (W.find((w) => w.line === "away" && /^Tacitus/.test(w.w))!.b + at("away", /^Nero/)) / 2;
const STUDY = { x: 0, z: -150 };
const STUDY_ROOM = once(() => { const { x, z } = STUDY, g = new THREE.Group(), wall = "#e8d6b0", wood = "#8a5a30";
  g.add(mesh(box(6, 0.1, 5), "#b98a5a", { at: [x, -0.05, z] }), mesh(box(6, 3.2, 0.16), wall, { at: [x, 1.6, z - 1.6] }), mesh(box(0.16, 3.2, 5), wall, { at: [x - 2.6, 1.6, z] }), mesh(box(0.16, 3.2, 5), wall, { at: [x + 2.6, 1.6, z] }));
  g.add(mesh(box(6, 0.24, 0.2), "#b3261e", { at: [x, 0.12, z - 1.5], line: 0.5 }));
  // shelves of scrolls behind him, their round ends toward us
  for (const [sx, sy] of [[-1.55, 0.9], [-1.55, 1.45], [1.55, 0.9], [1.55, 1.45]] as [number, number][]) { g.add(mesh(box(1.2, 0.05, 0.36), wood, { at: [x + sx, sy, z - 1.38], line: 0.5 }));
    for (let i = 0; i < 7; i++) g.add(mesh(cyl(0.045, 0.045, 0.32, 10), i % 3 ? "#efe2bc" : "#e2cf9e", { at: [x + sx - 0.5 + i * 0.16, sy + 0.07, z - 1.36], rot: [Math.PI / 2, 0, 0], line: 0.4, shadow: false })); }
  const desk = table(1.1, 0.6, 0.9); desk.position.set(x - 0.95, 0, z - 0.75); g.add(desk);
  for (let i = 0; i < 4; i++) g.add(mesh(cyl(0.04, 0.04, 0.34, 10), "#efe2bc", { at: [x - 1.2 + i * 0.12, 0.95, z - 0.75 + (i % 2) * 0.06], rot: [0, 0, Math.PI / 2], line: 0.4, shadow: false }));
  // his name, on a plaque on the wall above his head (clear of his face, and whole inside the picture)
  const plaque = painted(["TACITUS"], 1.0, 0.3, { ink: "#fbf3df", bg: "#7a2f2a", edge: "#e7bb48", pad: 0.14 }); plaque.position.set(x + 0.16, 2.44, z - 1.5); g.add(plaque);
  return g; });
const QUILL = once(() => noShade(reedPen())), SCROLL_O = once(() => noShade(scrollHeld())), PEN_TIP = new THREE.Vector3(0.14, 0, 0);
// the sheet's own writing (props.ts scrollHeld): line i on the canvas at y = 20 + 16 i, 5 px high, from x = 16; the sheet 0.3 x 0.38 m
// hangs from the roller at its origin
const LY = (i: number) => -0.015 - (0.38 * (22.5 + 16 * i)) / 256, LX0 = -0.15 + (0.3 * 16) / 192, LLEN = (i: number) => (0.3 * (150 - (((20 + 16 * i) * 7) % 40))) / 192;
const PAPER = once(() => paint("scrollbare", 8, 8, (q) => { q.fillStyle = "#efe2bc"; q.fillRect(0, 0, 8, 8); })), INK = once(() => paint("scrollink", 8, 8, (q) => { q.fillStyle = "#4a3a2a"; q.fillRect(0, 0, 8, 8); }));
// version 2b (review: he stood still for 2.5 s): he writes two lines you can see fill in, the pen running along each; the lens comes in
// slowly; an oil lamp flickers on a bracket on the wall beside him; he still looks up on "says Tacitus"
{
  // he stands where he stood in version 2; the lens is nearer (waist up), so that the writing reads on a phone and stays above the captions
  const a0 = TAC_A, b0 = TAC_B, V0 = lens(STUDY.x + 0.25, 1.55, STUDY.z + 2.9, -0.05, -1, -1, 46), [tx, tz] = V0.spot(3.05, -0.05), hd = V0.toward(tx, tz, 14);
  const V = lens(STUDY.x + 0.22, 1.24, STUDY.z + 2.1, -0.05, -1, 0, 46);
  const tac = mover(TACITUS_D, 1.76, tx, tz, hd); tac.stand(9);
  const HOLD = usePose(SCROLL, "hold", "L"), DOWN = { brow: 0.2, lid: 0.5, smile: 0.2 };
  const S4: Stand = { D: TACITUS_D, at: [tx, 0, tz], heading: hd, h: 1.76, cam: V.cam, pose: HOLD }, j = jointsOf(S4);
  const wr = Math.sign((j("shR")[0] - j("shL")[0]) * (aside([0, 0, 0], V.cam, 1)[0]) + (j("shR")[2] - j("shL")[2]) * (aside([0, 0, 0], V.cam, 1)[2])) || -1;
  tac.actAt(-1, { ...HOLD, head: [0, 12, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: DOWN });      // (only the scroll's arm here: the sheet is read off it below)
  // where the sheet hangs (his left hand holds it still), and which side of it the lens sees
  const sheet = quiet(() => { const st = stageAt(on("tac", TACITUS_D, tac, 0.3, 0, { seed: 7 }), V.cam); wield(new THREE.Group(), SCROLL_O(), SCROLL, "hold", st, "L", V.cam); SCROLL_O().updateMatrixWorld(true); return SCROLL_O().matrixWorld.clone(); });
  const face = new THREE.Vector3(...V.cam.pos).applyMatrix4(sheet.clone().invert()).z >= 0 ? 1 : -1;
  const onSheet = (x: number, y: number): V3 => new THREE.Vector3(face * x, y, 0).applyMatrix4(sheet).toArray() as V3;
  // the reach that puts the pen's tip on a point of the sheet: first the hand a little above and before it, then corrected twice by where
  // the tip really lands with that reach (one correction for the whole shot left the tip 3-4 cm under the line)
  const guess = (P: V3) => aside(near(P, V.cam, 0.06), V.cam, -wr * 0.02, 0.1);
  const tipFor = (T: V3) => quiet(() => { const m = mover(TACITUS_D, 1.76, tx, tz, hd); m.stand(9); m.actAt(-1, { ...HOLD, ...reach(S4, "R", T) }, 10, { in: 0.01, handL: "grip", handR: "grip" });
    const st = stageAt(on("tac", TACITUS_D, m, 0.5, 0, { seed: 7 }), V.cam); wield(new THREE.Group(), QUILL(), PEN, "write", st, "R", V.cam, { d: 0.1 }); QUILL().updateMatrixWorld(true); return QUILL().localToWorld(PEN_TIP.clone()); });
  const hand = (x: number, i: number) => { const P = onSheet(x, LY(i)); let T = guess(P);
    for (let n = 0; n < 2; n++) { const tp = tipFor(T); T = [T[0] + P[0] - tp.x, T[1] + P[1] - tp.y, T[2] + P[2] - tp.z]; } return reach(S4, "R", T); };
  const LINES: [number, number, number][] = [[5, 0.2, 0.95], [6, 1.1, 1.62]];
  // from the first frame his pen is at the start of the line; every step holds until the next has taken over (an arm that let go fell
  // back to his side for a moment)
  tac.actAt(-1, { ...HOLD, ...hand(LX0, 5), head: [0, 12, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: DOWN });
  for (const [i, w0, w1] of LINES) { const n = 6, dt = (w1 - w0) / n;
    tac.actAt(w0 - 0.14, { ...HOLD, ...hand(LX0, i), head: [0, 13, 0] }, 0.2, { in: 0.12, out: 0.02, antic: 0, over: 1, handL: "grip", handR: "grip", face: DOWN });
    for (let k = 1; k <= n; k++) tac.actAt(w0 + (k - 1) * dt, { ...HOLD, ...hand(LX0 + (LLEN(i) * k) / n, i), head: [0, 12 + (k % 2), 0] }, k < n ? dt * 2 : i === 6 ? 9 : 0.3, { in: dt, out: 0.02, antic: 0, over: 1, handL: "grip", handR: "grip", face: DOWN }); }
  tac.actAt(1.75, { head: [-16, -4, 0] }, 9, { in: 0.3, antic: 0, over: 1.1, handL: "grip", handR: "grip", face: { brow: 0.6, lid: 0.1, smile: 0.3, gaze: [-0.4, 0] } });
  const LAMP: V3 = [STUDY.x + 0.72, 1.2, STUDY.z - 1.44];
  GRADES.push({ a: a0, b: b0, g: () => "linear-gradient(180deg, #f3e2c4 0%, #f6e6cc 55%, #f0d8b4 100%)" });
  add({ id: "tacitus", a: a0, b: b0, still: 0.6,
    sounds: [...[0.25, 0.5, 0.75, 1.15, 1.4].map((t) => ({ t, k: "scratch", g: 0.35 })), { t: 1.7, k: "paper", g: 0.4 }],
    cam: (_t, u) => V.push(0.1 * smooth(u)), sun: { target: [STUDY.x, 0, STUDY.z], reach: 6 },
    cast: (t) => [on("tac", TACITUS_D, tac, t, 0, { seed: 7 })],
    things: (g, c, t, T, cam) => { g.add(STUDY_ROOM()); const S = wield(g, SCROLL_O(), SCROLL, "hold", c.tac, "L", cam); wield(g, QUILL(), PEN, "write", c.tac, "R", cam, { d: 0.1 });
      // the lines still to come are bare sheet; the line he is on fills in as far as the pen's tip has gone
      S.updateMatrixWorld(true); QUILL().updateMatrixWorld(true); const tip = S.worldToLocal(QUILL().localToWorld(PEN_TIP.clone())), xf = face * tip.x;
      const onS = (m: THREE.Mesh) => { m.applyMatrix4(S.matrixWorld); g.add(m); };
      const top = -0.015 - (0.38 * 98) / 256, bot = -0.015 - (0.38 * 252) / 256;
      onS(mesh(box(0.28, top - bot, 0.008), "#ffffff", { at: [0, (top + bot) / 2, 0], map: PAPER(), line: 0, shadow: false }));
      for (const [i, w0, w1] of LINES) { const L = LLEN(i), e = t < w0 ? 0 : t >= w1 ? L : Math.max(0, Math.min(L, xf - LX0));
        if (e > 0.004) onS(mesh(box(e, 0.0074, 0.01), "#ffffff", { at: [face * (LX0 + e / 2), LY(i), 0], map: INK(), line: 0, shadow: false })); }
      // the oil lamp on its bracket, its flame breathing, and the warm light it throws on the wall
      g.add(mesh(box(0.34, 0.04, 0.16), "#8a5a30", { at: [LAMP[0], LAMP[1], LAMP[2]], line: 0.5 }), mesh(ball(0.07, 12), "#b5653a", { at: [LAMP[0], LAMP[1] + 0.05, LAMP[2]], scale: [1.4, 0.55, 1], line: 0.5 }),
        mesh(cyl(0.018, 0.024, 0.07, 8), "#b5653a", { at: [LAMP[0] + 0.1, LAMP[1] + 0.06, LAMP[2]], rot: [0, 0, Math.PI / 2], line: 0.4 }));
      flames(g, [LAMP[0] + 0.14, LAMP[1] + 0.07, LAMP[2]], T, 0.075, 0, 1, 0, 3, cam.pos);
      glow(g, [LAMP[0] + 0.1, LAMP[1] + 0.25, STUDY.z - 1.5], 1.3, 1.3, T, 0, 3); } });
}
// 5. ... NERO WAS NOT EVEN IN ROME: day, the terrace of the villa above the sea, a signpost in the picture: "ANTIUM – 50 km from Rome",
//    its arrow pointing along the coast at the smoke. He lets grapes down into his mouth; a messenger runs in and points back at the
//    smoke; the emperor looks, and starts so that the grapes fly. Also the second half of the closing line ("And he probably wasn't even
//    there."): the same terrace, without the messenger
const SIGNPOST = once(() => { const g = new THREE.Group(); g.add(mesh(box(0.1, 2.3, 0.1), "#7a4a26", { at: [0, 1.15, 0], line: 0.6 }));
  const b = painted(["ANTIUM", "50 km from Rome"], 1.12, 0.48, { ink: "#3a2414", bg: "#f3e2b8", edge: "#7a4a26", pad: 0.1 }); b.position.set(0.1, 2.0, 0.07); g.add(b);
  // the arrow above the board, toward the smoke (along +x of the post, which the film turns to face the lens: the smoke rises on the
  // horizon to the right, in the open sky above the emperor)
  const arrow = group([mesh(box(0.7, 0.1, 0.04), "#b3261e", { at: [0.2, 0, 0], line: 0.5 }), mesh(box(0.2, 0.2, 0.04), "#b3261e", { at: [0.56, 0, 0], rot: [0, 0, Math.PI / 4], line: 0.5 })]); arrow.position.set(0.1, 2.42, 0.08); g.add(arrow);      // above the board, clear of every head
  return g; });
const villaShot = (id: string, a0: number, b0: number, messenger: boolean) => {
  const len = b0 - a0, v = FIRE.villa, V = lens(v.x + 3.2, v.y + 1.45, v.z + 4.6, 0.3, -1, -4, 58);
  const HERE = 0.4, POINT = HERE + 0.45, LOOK = POINT + 0.25, JUMP = Math.min(len - 0.35, LOOK + 0.45);
  const [nx, nz] = V.spot(3.0, 0.32), nero = mover(NERO_D, 1.74, nx, nz, V.toward(nx, nz, -10)); nero.stand(9);
  nero.actAt(-1, { armR: arm(164, 22, 196, -6), armL: arm(20, 14, 60, 4), head: [-10, -34, 0], lean: -8 }, messenger ? JUMP + 1 : 10, { in: 0.01, out: 0.06, handR: "grip", handL: "relaxed", face: { lid: 0.7, smile: 0.8, mouth: 0.7, gaze: [0, -0.8] } });
  wag(nero, 0.1, messenger ? LOOK - 0.1 : len, P({ armR: arm(160, 22, 188, -6) }), P({ armR: arm(168, 22, 202, -6) }), 0.6, { handR: "grip" });
  if (messenger) { nero.actAt(LOOK, { head: [40, -4, 0], lean: 0 }, JUMP - LOOK, { in: 0.2, out: 0.08, antic: 0, over: 1.2, face: { lid: 0, wide: 0.8, brow: 1, mouth: 0.3, smile: -0.7, gaze: [0.8, 0] } });
    nero.actAt(JUMP, "recoil", 9, { in: 0.08, antic: 0, over: 1.5 }); }
  const [m0x, m0z] = V.spot(1.5, -2.6), [m1x, m1z] = V.spot(3.25, -0.62), run = Math.hypot(m1x - m0x, m1z - m0z);
  const msg = mover(RUNNER_D, 1.78, m0x, m0z, (Math.atan2(m1x - m0x, m1z - m0z) * 180) / Math.PI); msg.run(mt(msg, run)).stand(9);
  msg.actAt(HERE, { lean: 40, py: -0.12, armL: arm(44, 10, 30, 0), armR: arm(44, 10, 30, 0), head: [0, 20, 0] }, POINT - HERE + 0.05, { in: 0.16, out: 0.14, antic: 0, over: 1.3, handL: "open", handR: "open", face: { lid: 0.5, brow: 1, mouth: 0.7, smile: -1 } });
  msg.actAt(POINT, { lean: 8, twist: -30, armL: arm(100, 70, 104, 76), head: [-30, -4, 0] }, 9, { in: 0.2, antic: 0.3, over: 1.6, handL: "point", face: { wide: 1, lid: 0, brow: 1, mouth: 0.5, smile: -1 } });
  let GR0: V3 | null = null;
  const [fx, fz] = V.spot(330, 64), [px, pz] = V.spot(3.7, -0.5);      // about 11 degrees right of the lens axis: above the emperor
  GRADES.push({ a: a0, b: b0, g: () => null });
  add({ id, a: a0, b: b0, still: messenger ? POINT + 0.4 : len * 0.6,
    sounds: messenger ? [...msg.cues().filter((q) => q.k === "step" && q.t < HERE).map((q) => ({ t: q.t, k: "step", run: true, g: 0.9, p: -0.5 })), { t: HERE, k: "scuff", g: 0.9, p: -0.2 }, { t: POINT, k: "whoosh", g: 0.5, p: -0.3 }, { t: JUMP, k: "whoosh", g: 0.7, p: 0.3 }] : [{ t: 0.3, k: "splash", g: 0.25 }],
    cam: (_t, u) => V.push(0.16 * u), sun: { target: [v.x + 4, v.y, v.z + 1], reach: 8 },
    cast: (t) => [...(messenger ? [on("msg", RUNNER_D, msg, t, v.y, { seed: 2 })] : []), on("nero", NERO_D, nero, t, v.y, { seed: 5 })],
    things: (g, c, t, T, cam) => {
      // the smoke of Rome, far along the coast: a glow at its foot; the signpost at the balustrade, its arrow toward the smoke
      smoke(g, [fx, 6, fz], T * 0.5, 9, 78, 20, 50, 0, "#5a5664", 5); g.add(mesh(ball(1, 14), "#ff8a3a", { at: [fx, 2, fz], scale: [34, 10, 10], line: 0, shadow: false, receive: false, glow: "#e0521a" }));
      const sp = SIGNPOST(); sp.position.set(px, v.y, pz); sp.rotation.set(0, Math.atan2(cam.pos[0] - px, cam.pos[2] - pz), 0); g.add(sp);
      const u = t - JUMP;
      if (!messenger || u < 0) wield(g, GRAPES(), GRAPES_P, "hold", c.nero, "R", cam);
      else { const camJ = V.push(0.16 * JUMP / len); GR0 ??= quiet(() => near(palm(stageAt(on("nero", NERO_D, nero, JUMP, v.y, { seed: 5 }), camJ), "R"), camJ, 0.05));
        letGo(g, GRAPES(), GRAPES_P, GR0, [0.5, 3.2, -0.2], u, v.y, cam, { centre: [0, -0.18], r: 0.07, spin: 1.2 }); }
    } });
};
villaShot("away", TAC_B, cut("away", "gardens"), true);
/** the six days from above: two seconds, ending at the cut before the rumour (Jesper: at most two seconds from above) */
const SIX_B = cut("six", "rumour"), SIX_A = SIX_B - 2.0;
// 6. HE CAME BACK AND OPENED HIS OWN GARDENS TO THE HOMELESS: a smoky dawn, inside the garden, low down. The gate stands open; the
//    emperor is at its leaf with a hand on it and waves them in. They come through one after another with air between them, each with
//    his own trouble, and go off across the grass: a mother with a girl by the hand, a man who coughs, a woman with her bundle in her
//    arms, a man bent under a sack, an old man and an old woman together
{
  const a0 = cut("away", "gardens"), b0 = SIX_A, len = b0 - a0, q = FIRE.garden, gw = FIRE.gate.w, V = lens(q.x + 0.5, 1.1, q.z + 6.0, -0.02, -1, 11, 54);
  const nero = mover(NERO_D, 1.74, q.x + 1.3, q.z + 1.75, V.toward(q.x + 1.3, q.z + 1.75, -26)); nero.stand(9);
  const CALM = { brow: 0.4, lid: 0.1, smile: -0.2, mouth: 0.3 };
  nero.actAt(-1, { armL: arm(84, 62, 104, 70), armR: arm(42, 36, 96, 38), head: [-30, 0, 0], lean: 2 }, 10, { in: 0.01, handL: "open", handR: "open", face: CALM });
  wag(nero, 0.2, 5, P({ armR: arm(44, 36, 114, 32) }), P({ armR: arm(40, 40, 84, 46) }), 0.7, { handL: "open", handR: "open", face: CALM });
  // each on his own line through the gate, a good step behind the one before, and then off to the side across the grass
  const lane = (D: Design, h: number, x: number, back: number, pace = 0.3, veer = -32) => { const m = mover(D, h, q.x + x, q.z - back, 0), o = { step: pace * 2, tau: 0.4 }; m.walk(mt(m, back + 1.0), { ...o, keep: true }).turn(veer, 0.3).walk(mt(m, 7), o); return m; };
  const SAD = { brow: 0.8, lid: 0.1, smile: -0.7 };
  const mother = lane(ROMAN_WOMAN_D, 1.66, -0.45, -0.4, 0.3, -26); mother.actAt(-1, { armL: arm(24, 26, 34, 30), armR: arm(44, 8, 100, -24), head: [24, 6, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { ...SAD, gaze: [0.4, 0.5] } });
  // a girl of about twelve (her face well above the captions as she comes nearer; a smaller child walked with her face behind them)
  const girl = lane(GIRL_D, 1.5, 0.13, -0.4, 0.44, -26); girl.actAt(-1, { armR: arm(50, 30, 64, 26), head: [50, -14, 0] }, 10, { in: 0.01, handR: "grip", face: { wide: 1, lid: 0, brow: 1, mouth: 0.4, smile: -0.3 } });
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

// 7. THE FIRE RAGED FOR SIX DAYS: from above the roofs, looking down the street, two seconds. The fire walks from house to house toward
//    us; a roof falls in; small figures run; a counter high in the picture goes DAY I to DAY VI (version 2: the sky no longer swings
//    from night to day, which at this pace would flicker)
{
  const a0 = SIX_A, b0 = SIX_B, len = b0 - a0, V = lens(0.4, 5.4, -3.5, 0, 1, -12, 58), FALL = 1.2;
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
  GRADES.push({ a: a0, b: b0, g: (T) => { const f = flicker(T); return `linear-gradient(180deg, ${hex(70, 62, 120)} 0%, ${hex(176, 120, 120)} 46%, ${hex(255 * f, 190 * f, 130 * f)} 100%)`; } });
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
    } });
}
// 8. AND A RUMOUR SPREAD: evening in the garden camp. A man whispers into a woman's ear and mimes plucking strings; she claps a hand
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
// 9. WHILE ROME BURNED, NERO SANG OF THE FALL OF TROY: the picture the rumour paints (dark round its edge). Nero on his own stage in
//    his own white and purple (version 2: not the green robe of a lyre-player), a hand on his breast, singing with his mouth wide open, the city burning behind him
{
  const a0 = SANG, b0 = cut("rumour", "answer"), s = FIRE.stage, V = lens(s.x + 0.1, 1.5, s.z - 4.0, 0, 1, 8, 54), TROY = at("rumour", /^fall/) - a0;
  const nero = mover(NERO_D, 1.74, s.x - 0.1, s.z - 0.2, 180); nero.stand(9);
  const S8: Stand = { D: NERO_D, at: [s.x - 0.1, s.y, s.z - 0.2], heading: 180, h: 1.74, cam: V.cam, pose: { lean: -6 } };
  nero.actAt(-1, { armR: arm(40, 14, 128, -44), armL: (citharaPose(S8, false) as { armL: [[number, number], [number, number]] }).armL, head: [0, -18, 6], lean: -6 }, 10, { in: 0.01, handR: "open", handL: "grip", face: { lid: 0.9, brow: 1, mouth: 1 } });
  wag(nero, 0, 4, P({ roll: 5, head: [10, -22, 8], py: 0.02 }), P({ roll: -5, head: [-10, -14, -6], py: -0.01 }), 1.1);
  nero.actAt(TROY - 0.2, { armR: arm(150, 40, 176, 30), lean: -10 }, 9, { in: 0.3, antic: 0.3, over: 1.4, handR: "open", face: { lid: 0.9, brow: 1, mouth: 1 } });
  GRADES.push({ a: a0, b: b0, g: (T) => { const f = flicker(T); return `radial-gradient(ellipse 78% 56% at 50% 45%, ${hex(255 * f, 214 * f, 170 * f)} 0%, ${hex(222 * f, 138 * f, 100 * f)} 44%, #3a2440 84%, #1c1226 100%)`; } });
  add({ id: "sang", a: a0, b: b0, still: TROY + 0.2,
    sounds: [{ t: 0.1, k: "ting", g: 0.6, p: 0.2 }, { t: 0.9, k: "ting", g: 0.6, p: 0.2 }, { t: 1.7, k: "ting", g: 0.6, p: 0.2 }, { t: 0.5, k: "crack", g: 0.6, p: -0.5 }, { t: 2.1, k: "crack", g: 0.6, p: 0.5 }],
    cam: (_t, u) => V.push(0.3 * u), sun: { target: [s.x, 1, s.z], reach: 9 },
    cast: (t) => [on("nero", NERO_D, nero, t, s.y, { seed: 5, blink: false })],
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
  // the picture starts toward Sir Digsworth as his hand comes in, so that the hand is seen closing on the scroll (inside the frame)
  // before it draws the fiddle away; his hand is solved for the camera as it is at that moment
  const CAM9 = (t: number) => mixCam(VA.cam, VB.cam, smooth((t - TAKE + 0.45) / 0.8)), GRAB = TAKE - 0.1;
  const S9: Stand = { D: SIR_D, at: [SX, 0, SZ], heading: 196, h: 1.8, cam: CAM9(TAKE), pose: { lean: 8 } }, TAKEP = fiddleAt(neroAt(nero, TAKE, CAM9(TAKE)), CAM9(TAKE)).scroll;
  sir.actAt(GRAB - 0.2, { ...reach(S9, "R", TAKEP), lean: 8, head: [-40, 4, 0] }, 0.54, { in: 0.2, out: 0.1, antic: 0.2, over: 1.4, handR: "grip", handL: "relaxed", face: DRY });
  sir.actAt(TAKE + 0.24, { armR: arm(64, 56, 116, 60), armL: arm(20, 10, 50, 0), head: [0, 0, 0], lean: 0 }, 9, { in: 0.26, antic: 0, over: 1.4, handR: "grip", handL: "relaxed", face: FIRM });
  wag(sir, NEVER, 2, P({ head: [20, 0, 0] }), P({ head: [-20, 0, 0] }), 0.34, { handR: "grip", handL: "relaxed", face: FIRM });
  GRADES.push({ a: a0, b: b0, g: (T) => fireNight(T, 50, 16) });
  add({ id: "never", a: a0, b: b0, still: NEVER + 0.25,
    sounds: [...swings(0, TAKE - 0.1, 0.28, b0 - a0).map((t) => ({ t, k: "scratch", g: 0.6, p: -0.3 })), { t: GRAB, k: "tap", g: 0.7 }, { t: TAKE, k: "whoosh", g: 0.6 }, { t: 0.6, k: "crack", g: 0.5, p: 0.5 }],
    cam: CAM9, sun: { target: [0, 0, 3], reach: 9 },
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
const LYRE = at("cithara", /^kind/) - 0.32, SEVEN = at("cithara", /^seven/), WIDE = at("cithara", /^strings/);
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
      // the playing hand drawn again well in front of the strings, so that its finger is seen on the string it plucks (version 2)
      fingers(g, c.nero, ["R"], cam, 0.5, true);
      flying(g, [CX, 2.6, NZ - 3], T, 6, 3, 2, 2, 7); } });
}
// 13. SO NO FIDDLE. MAYBE A LYRE. The two of them from the side of the street, the burning house behind: Nero sings at the top of his
//     voice and sweeps the seven strings; behind him Sir Digsworth puts his fingers in his ears (version 2: no string snaps, so that the
//     cithara has its seven strings in every picture)
const AND = (at("close", /^lyre/) + 0.43 + at("close", /^And/)) / 2;
{
  const a0 = WIDE, b0 = AND, V = lens(1.99, 1.45, -0.22, -0.62, 0.78, -2, 58);
  const nero = mover(NERO_D, 1.74, NX, NZ, V.toward(NX, NZ, 22)); nero.stand(9);
  const SING = { lid: 0.9, brow: 1, mouth: 1 }, S13: Stand = { D: NERO_D, at: [NX, 0, NZ], heading: V.toward(NX, NZ, 22), h: 1.74, cam: V.cam, pose: { lean: -6 } };
  const HOLD13 = (citharaPose(S13, false) as { armL: [[number, number], [number, number]] }).armL;
  nero.actAt(-1, { armL: HOLD13, ...pluckPose(S13, 3), head: [0, -20, 6], lean: -6 }, 10, { in: 0.01, handL: "grip", handR: "open", face: SING });
  // he sweeps his open hand across the strings, from the far side to the near and back
  wag(nero, 0, b0 - a0, P({ ...pluckPose(S13, 1), roll: 4, head: [8, -24, 8] }), P({ ...pluckPose(S13, 5), roll: -4, head: [-8, -16, -4] }), 0.42, { handL: "grip", handR: "open", face: SING });
  const sir = mover(SIR_D, 1.8, SX - 0.06, SZ, V.toward(SX - 0.06, SZ, -14)); sir.stand(9);
  const PAIN = { lid: 0.9, brow: -1, smile: -1 };
  sir.actAt(-1, { armL: arm(20, 10, 50, 0), armR: arm(20, 10, 50, 0), head: [-30, 0, 0] }, 1.25, { in: 0.01, out: 0.1, handL: "relaxed", handR: "relaxed", face: { brow: 0.4, lid: 0.1, gaze: [-0.7, 0] } });
  sir.actAt(0.22, { armL: arm(70, 50, 160, 6), armR: arm(70, 50, 160, 6), head: [0, 6, 0], py: -0.03, lean: -4 }, 9, { in: 0.2, antic: 0.2, over: 1.5, handL: "point", handR: "point", face: PAIN });
  wag(sir, 0.6, b0 - a0, P({ roll: 3 }), P({ roll: -3 }), 0.42, { handL: "point", handR: "point", face: PAIN });
  GRADES.push({ a: a0, b: b0, g: (T) => fireNight(T, 50, 28) });
  add({ id: "lyre", a: a0, b: b0, still: 1.2,
    sounds: [...swings(0, b0 - a0 - 0.05, 0.21, b0 - a0).map((t, i) => ({ t, k: "ting", g: 0.7, p: -0.2 + 0.1 * (i % 3) })), { t: 0.5, k: "crack", g: 0.5, p: 0.5 }],
    cam: (_t, u) => V.push(0.16 * u), sun: { target: [0, 0, 3], reach: 9 },
    cast: (t) => [on("sir", SIR_D, sir, t, 0, { blink: false }), on("nero", NERO_D, nero, t, 0, { seed: 5, blink: false })],
    things: (g, c, _t, T, cam) => { streetFire(g, T, cam, 1.1); citharaHold(g, strum(CITH(), (i) => 0.012 * Math.sin(T * 44 + i * 1.7)), c.nero, cam, true); } });
}
// 14. AND HE PROBABLY WASN'T EVEN THERE. The terrace at Antium again, the smoke far along the coast and the signpost: the emperor at his
//     ease with his grapes
villaShot("there", AND, END13, false);
// 15. THE CODA: back in the burning street a moment before the first frame: the emperor fiddles, Sir Digsworth points. The lens runs
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
    { T: 1.5, words: ["DID NERO", "FIDDLE?"], y: 0.68, size: 150 },      // Sir Digsworth whole in the picture, pointing (at 0.5 s he was still stepping in)
    { T: SANG + 1.2, words: ["OR DID", "HE SING?"], y: 0.7, size: 140 },
    { T: LATER + 1.3, words: ["NO", "FIDDLE"], y: 0.7, size: 150 },
  ],
  hits: [{ t: SIX_A + 1.2, amp: 0.5, dur: 0.3 }],
  // our own lines (DAILY-RULES, "Our own lines"), as bubbles over the picture: the rumour whispered on, and the emperor at his cithara
  // while Sir Digsworth holds his ears
  // (each up at least 1.2 s, so that it can be read at phone size)
  bubbles: [{ a: cut("six", "rumour") + 0.05, b: cut("six", "rumour") + 1.3, text: "Psst!", who: "a" }, { a: cut("six", "rumour") + 1.32, b: SANG - 0.06, text: "Did you hear?", who: "b" },
    { a: WIDE + 0.45, b: AND - 0.05, text: "Sing along!", who: "nero" }],
  labels: [{ a: SIX_A, b: SIX_B, top: 310, text: (T) => "DAY " + ["I", "II", "III", "IV", "V", "VI"][Math.max(0, Math.min(5, Math.floor(((T - SIX_A) / (SIX_B - SIX_A)) * 6)))] }],
  beds: [{ k: "fire", a: 0, b: TAC_A, g: 0.9 }, { k: "sea", a: TAC_B, b: cut("away", "gardens"), g: 0.7 }, { k: "fire", a: SIX_A, b: SIX_B, g: 1 }, { k: "fire", a: SANG, b: AND, g: 0.8 }, { k: "sea", a: AND, b: END13, g: 0.6 }, { k: "fire", a: END13, b: END, g: 0.8 }], music: "roman", audio: "craft/nero-fiddle.wav",
};

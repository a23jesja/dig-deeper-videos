// Short: "Why did pirates fly a black flag?" Two ships side by side (world/ship.ts flagSea), played on the stage (stage/Stage.tsx).
// The shots are cut to the narration's lines (voice/black-flag). Sources and what must not be claimed: granskning/black-flag/manus.md.
// The flag is black with a white hourglass (no skull); the friendly flag is a made-up merchant ensign.
import * as THREE from "three";
import { Film, Shot, Cam, V3, Staged, Word, play, talk, smooth, mix3 } from "../stage/film";
import { mover, mt, wag, arm, MM } from "../stage/acting";
import { lens, once, noShade, put, near, palm, palmThen, aside, stageAt, fingers } from "../stage/staging";
import { wield, spy, spyEye, spyPose, sheathed, hiltFor, letGo, carryBy, blend, quiet, heldOver, reach, setDown, jointsOf, Stand, SABRE, SPYGLASS, LINSTOCK, MUG as MUG_P, PISTOL as PISTOL_P, BUCKET as BUCKET_P } from "../stage/grips";
import { flagSea, FLAGSEA, FLAGSEA_SOLIDS, SHIP, MERCHANT_DECK, merchantBrig, BRIG, dusk } from "../world/ship";
import { mesh, box, ball, rod, cyl, paint } from "../world/kit";
import { clothFlag, gunSmoke, yardSail, chest, sabre, scabbard, pistolHeld, mugHeld, bucketHeld, linstock, spyglass, crate, barrel, bottle, FlagKind } from "../world/props";
import { SIR_D, CAPTAIN_D, PIRATE_D, MATE_D, PIRATE2_D, CUSTOMS_D, SAILOR_D, OLDHAND_D, COOK_D, SHIPBOY_D, SHIPOWNER_D, GUNNER_D, CORSAIR_D, SHIRT_A_D, SHIRT_B_D, SHIRT_C_D, SHIRT_D_D, SHIRT_E_D, DOCKHAND_D, DOCKER_D, FRENCH_CAPT_D, FRENCH_MATE_D } from "../looks";
import type { Pose } from "../rig";
import type { Design } from "../designs/common";
import words from "../../../voice/black-flag/words.json";
import lines from "../../../voice/black-flag/lines.json";

const W = words as Word[], L = Object.fromEntries((lines as { id: string; a: number; b: number }[]).map((l) => [l.id, l]));
const cut = (a: string, b: string) => (L[a].b + L[b].a) / 2;       // a cut falls in the pause between two lines
/** the last shot ends a little after the last word; a short coda then leads back into the first frame, so that the film loops */
const END12 = L.worked.b + 1.05, CODA = 0.9, END = END12 + CODA;
/** when a word of a line is spoken (film seconds) */
const at = (line: string, re: RegExp) => W.find((w) => w.line === line && re.test(w.w))!.a;
const P = (o: Partial<Pose>) => o;
const rad = (d: number) => (d * Math.PI) / 180, clamp = (u: number) => Math.max(0, Math.min(1, u));
const MD = MERCHANT_DECK, QD = SHIP.aft, [SX, SZ] = FLAGSEA.staff, TOP = FLAGSEA.staffTop;
/** both hands in the air */
const UP = (k = 0): Partial<Pose> => ({ armL: arm(148 + k, 34, 178, 16), armR: arm(148 - k, 34, 178, 16) });
const OPEN = { handL: "open", handR: "open" } as const;

// ---------------- the things of the two ships (made once, moved by the shots) ----------------
const FLAG: Record<FlagKind, () => ReturnType<typeof clothFlag>> = { pirate: once(() => clothFlag("pirate")), red: once(() => clothFlag("red")), friendly: once(() => clothFlag("friendly")), tarpaulin: once(() => clothFlag("tarpaulin", 1.25, 0.95)), white: once(() => clothFlag("white", 1.3, 0.9)) };
/** a flag on the sloop's staff with its upper corner at the height `top`: wind 1 = flying, 0 = limp. It flies toward -z */
const fly = (g: THREE.Group, kind: FlagKind, top: number, T: number, wind = 1, p: [number, number] = [SX - 0.05, SZ], ry = Math.PI / 2) => { const f = FLAG[kind](); f.wave(T, wind); return put(g, f.obj, [p[0], top, p[1]], ry); };
const CUTS = [0, 1, 2, 3, 4].map(() => once(() => noShade(sabre(0.6))));
/** a cutlass in a figure's fist, held for one of its uses (stage/grips.ts SABRE); `to` = [another use, how far toward it] */
const sword = (g: THREE.Group, i: number, a: Staged, cam: Cam, use = "raised", side: "L" | "R" = "R", to?: [string, number]) => wield(g, CUTS[i](), SABRE, use, a, side, cam, to ? { blend: to } : {});
/** the scabbards worn on a baldric at the left hip */
const SCABS = [0, 1, 2].map(() => once(() => noShade(scabbard(0.5))));
const BRIG2 = once(() => merchantBrig()), BRIG_GREEN = once(() => merchantBrig("#3f8a52")), BRIG_RED = once(() => merchantBrig("#b3432e")), SAIL_SET = once(() => yardSail(BRIG.sail.w, BRIG.sail.h, 0));
const SAILS = [0, 0.25, 0.5, 0.75, 1].map((d) => once(() => yardSail(BRIG.sail.w, BRIG.sail.h, d)));
/** the merchant's after sail on its yard at the height y, struck by `drop` (0 = set, 1 = bunched) */
const sailAt = (g: THREE.Group, y: number, drop: number, dx = 0) => put(g, SAILS[Math.round(clamp(drop) * 4)](), [FLAGSEA.mx + BRIG.sail.x + dx, y, FLAGSEA.mz + BRIG.sail.z]);
const STRUCK = MD + 1.05;       // where the yard lies when the sail has been struck
const BUCKET = once(() => noShade(bucketHeld(0.3))), MUG = once(() => noShade(mugHeld(0.14))), PISTOL = once(() => { const p = noShade(pistolHeld()); p.scale.setScalar(0.7); return p; }), PISTOL_TMP = once(() => { const p = noShade(pistolHeld()); p.scale.setScalar(0.7); return p; });
/** the merchant captain's glass: its eye end at the origin; held lowered by its middle (MIDG along it) */
const GLASS = once(() => { const s = noShade(spyglass()); s.scale.setScalar(1.2); return s; }), MIDG = 0.235;
const LENS = once(() => mesh(cyl(0.052, 0.052, 0.012, 24), "#ffffff", { rot: [0, 0, Math.PI / 2], line: 0.8, shadow: false, map: paint("glassflag", 128, 128, (g) => {
  g.fillStyle = "#bfe3fb"; g.fillRect(0, 0, 128, 128); g.fillStyle = "#3f8fd0"; g.fillRect(0, 86, 128, 42); g.fillStyle = "#6a4a2c"; g.fillRect(40, 30, 5, 64); g.fillStyle = "#17141a"; g.fillRect(45, 30, 46, 30); g.fillStyle = "#f6f1e4"; g.fillRect(62, 37, 12, 16); }) }));
const CHEST_GOLD = once(() => chest(true, true, 0.56, 0.32, 0.38)), MATCH = once(() => noShade(linstock(0.9)));
const CHEST_A = once(() => chest(false, false, 0.84, 0.52, 0.54)), CHEST_B = once(() => chest(false, false, 0.7, 0.46, 0.48)), CHEST_OPEN = once(() => chest(true, false, 0.62, 0.36, 0.4)), CRATE = once(() => crate(0.7)), TARBARREL = once(() => barrel(0.9, 0.32, "#8a5a36"));
const BOTTLE = once(() => noShade(bottle(0.3))), BOOT = once(() => noShade(new THREE.Group().add(mesh(box(0.3, 0.09, 0.12), "#3a2a22", { at: [0.05, 0.045, 0], shadow: false }), mesh(box(0.14, 0.3, 0.12), "#4a3628", { at: [-0.04, 0.22, 0], shadow: false }))));
/** a rope from a to b */
const line = (g: THREE.Group, a: V3, b: V3, r = 0.014, col = "#cdb57a") => g.add(rod(a, b, r, col, { line: 0.5, shadow: false }));
/** turns a thing over by k half turns about a line along its own x at the height hy (a chest about the handles it is held by) */
const flipAbout = (o: THREE.Object3D, hy: number, k: number) => { if (k <= 0.001) return; o.updateMatrixWorld(true); const a = o.localToWorld(new THREE.Vector3(0, hy, 0)); o.rotateX(Math.PI * k); o.updateMatrixWorld(true); o.position.add(a.sub(o.localToWorld(new THREE.Vector3(0, hy, 0)))); };
/** the moments of wag(m, t0, dur, a, b, period): one for each swing, kept inside a shot `len` long */
const swings = (t0: number, dur: number, period: number, len: number): number[] => { const o: number[] = []; for (let t = t0; t < t0 + dur - 1e-6; t += period) if (t >= 0 && t < len - 0.05) o.push(t); return o; };
/** somebody whose knees knock: a small quick sway, all through the shot */
const quake = (m: MM, t0 = 0, dur = 6, k = 2.4) => wag(m, t0, dur, P({ roll: k, py: -0.01 }), P({ roll: -k, py: 0.01 }), 0.17);
/** a figure of the cast standing on a deck at the height y */
const on = (name: string, D: Design, m: MM, t: number, y: number, o: Parameters<typeof play>[6] = {}) => play(name, D, m, t, [0, y, 0], m.h, o);

/** the moments that shake the camera, set by the shots they belong to */
const SIGHT = { hit: 0 }, FIGHT = { hit: 0 }, GUN = { hit: 0 };
const shots: Shot[] = [];
const add = (s: Shot) => shots.push(s);
/** the first shot, kept for the coda that leads back into it */
let HOOK: Shot;

// 1. THE HOOK: on the merchant's deck her crew back away with their hands in the air, while on the ship close alongside a black flag
//    runs up its staff and snaps open. Sir Digsworth peeps out from behind the mast: at us, up at the flag, and in again
{
  const V = lens(-11.0, 1.75, 4.77, 1, 0.12, -8, 64), b0 = cut("hook", "guess"), RISE = 0.7, DROP = 0.4;
  const who = (D: Design, h: number, d: number, l: number, off: number) => { const [x, z] = V.spot(d, l), m = mover(D, h, x, z, V.toward(x, z, off)); m.stand(8); return m; };
  // the cook lets his bucket go, looks down after it and up again
  const cook = who(COOK_D, 1.58, 3.9, 1.08, -6);
  cook.actAt(-1, { armL: arm(150, 36, 180, 14), armR: arm(14, 12, 26, 6), lean: -4, head: [0, -4, 0] }, 10, { in: 0.01, handL: "open", handR: "grip", face: { wide: 1, lid: 0, brow: 1, mouth: 0.5, smile: -0.8 } });
  cook.actAt(DROP, { armR: arm(152, 36, 182, 14) }, 9, { in: 0.24, antic: 0, over: 1.5, handR: "open" });
  cook.actAt(DROP + 0.5, { head: [-16, 26, 0], lean: 4 }, 0.6, { in: 0.14, out: 0.2, antic: 0, over: 1.2, face: { wide: 1, lid: 0, brow: 1, mouth: 0.7, gaze: [0, 0.9] } }); quake(cook, 0, 6, 1.6);
  // the ship's boy: his hands are up at once; he peeks back at the flag over his shoulder
  const boy = who(SHIPBOY_D, 1.28, 3.8, -0.08, 4);
  boy.actAt(-1, { armL: arm(46, 12, 150, -22), armR: arm(46, 12, 150, -22), lean: -2 }, 10, { in: 0.01, ...OPEN, face: { wide: 1, lid: 0, brow: 1, mouth: 0.4, smile: -0.6 } });
  boy.actAt(1.05, { twist: 30, head: [66, -14, 0] }, 0.62, { in: 0.16, out: 0.16, antic: 0, over: 1.3, face: { wide: 1, lid: 0, brow: 1, mouth: 0.6, gaze: [0.8, -0.5] } }); quake(boy, 0, 6, 3);
  // the sailor is late: his hands come up, he swallows, he looks back
  const sailor = who(SAILOR_D, 1.82, 5.1, -0.02, -6);
  sailor.actAt(-1, { armL: arm(40, 24, 96, 10), armR: arm(40, 24, 96, 10), head: [40, -8, 0] }, 1.14, { in: 0.01, out: 0.1, ...OPEN, face: { wide: 0.8, lid: 0, brow: 0.8, gaze: [0.7, -0.4] } });
  sailor.actAt(0.12, { ...UP(-3), head: [0, -2, 0] }, 9, { in: 0.3, antic: 0.3, over: 1.5, ...OPEN, face: { wide: 1, lid: 0, brow: 1, mouth: 0.3, smile: -1 } });
  sailor.actAt(0.95, { head: [0, 16, 0], py: -0.03 }, 0.3, { in: 0.1, out: 0.14, antic: 0, over: 1 });
  sailor.actAt(1.5, { twist: 24, head: [62, -12, 0] }, 0.8, { in: 0.2, out: 0.2, antic: 0, over: 1.2 });
  // the captain has been looking at the flag; he turns to the front and puts his hands up slowly, chin high
  const mc = who(CUSTOMS_D, 1.9, 5.1, 0.5, 2);
  mc.actAt(-1, { armL: arm(30, 20, 70, 10), armR: arm(30, 20, 70, 10), twist: 26, head: [70, -16, 0] }, 1.5, { in: 0.01, out: 0.26, handL: "fist", handR: "fist", face: { brow: -0.6, lid: 0.1, smile: -0.7, gaze: [0.8, -0.5] } });
  mc.actAt(0.5, { ...UP(2), head: [0, -10, 0] }, 9, { in: 0.55, antic: 0.2, over: 1.2, ...OPEN, face: { brow: 0.6, lid: 0, wide: 0.6, smile: -1 } });
  // the old hand has had his hands up from the start, and his knees knock
  const old = who(OLDHAND_D, 1.74, 5.1, 0.96, 10);
  old.actAt(-1, { ...UP(-5), lean: 3, head: [-10, -4, 0] }, 10, { in: 0.01, ...OPEN, face: { wide: 1, lid: 0, brow: 1, mouth: 0.6, smile: -1 } });
  wag(old, 0.3, 5, P({ head: [-22, -4, 0] }), P({ head: [4, -4, 0] }), 0.34); quake(old, 0, 6, 3.4);
  // Sir Digsworth behind the mast: he leans out to look at us, then up at the flag, and draws his head in again
  const [sx, sz] = V.spot(2.78, -0.52), sir = mover(SIR_D, 1.8, sx, sz, V.toward(sx, sz, 0)); sir.stand(8);
  sir.actAt(-1, { roll: 15, lean: 4, armL: arm(34, 4, 128, -34), armR: arm(30, 10, 80, 0), head: [0, -4, 8] }, 10, { in: 0.01, handL: "open", handR: "fist", face: { wide: 1, lid: 0, brow: 1, mouth: 0.8 } });
  sir.actAt(0.85, { head: [34, -20, 8] }, 0.95, { in: 0.16, out: 0.16, antic: 0.3, over: 1.5, face: { wide: 1, lid: 0, brow: 1, mouth: 0.4, gaze: [0.6, -0.7] } });
  sir.actAt(1.9, { roll: -2, lean: 8, py: -0.08, head: [0, 8, 0], armL: arm(40, 10, 100, -20) }, 9, { in: 0.2, antic: 0.2, over: 1.3, handL: "fist", face: { wide: 0.7, lid: 0.2, brow: -0.4 } });
  // the bucket lands nearer the lens than the crew, so that it lies below the words
  const [bx, bz] = V.spot(2.0, 0.4), fall = 0.45; let B0: { p: V3; over: boolean } | null = null;      // where the bucket's bail leaves the cook's hand
  HOOK = { id: "hook", a: 0, b: b0, still: 0.6,
    sounds: [{ t: 0.02, k: "rope", g: 0.9, p: 0.5 }, { t: RISE, k: "flap", g: 1.2, p: 0.5 }, { t: DROP + fall, k: "thunk", g: 0.9, p: -0.1 }, { t: DROP + fall + 0.22, k: "rattle", g: 0.6, p: -0.1, dur: 0.5 }, { t: 0.3, k: "creak", g: 0.6 }, { t: 1.3, k: "flap", g: 0.7, p: 0.5 }, { t: 1.9, k: "scuff", g: 0.7, p: -0.6 }],
    cam: (_t, u) => V.push(0.2 * u), sun: { target: [-7.5, MD, 6], reach: 9 },
    cast: (t, T) => [on("old", OLDHAND_D, old, t, MD, { seed: 2 }), on("mc", CUSTOMS_D, mc, t, MD, { seed: 4 }), on("sailor", SAILOR_D, sailor, t, MD, { seed: 6 }), on("boy", SHIPBOY_D, boy, t, MD, { seed: 8, blink: false }), on("cook", COOK_D, cook, t, MD, { seed: 9, blink: false }),
      on("sir", SIR_D, sir, t, MD, { talk: talk(W, T, ["hook"]), blink: false })],
    things: (g, c, t, T, cam) => {
      fly(g, "pirate", 4.5 + 0.75 * smooth(t / RISE), T, 0.7 + 0.3 * smooth((t - 0.2) / 0.4));
      // the bucket: it hangs by its bail from the cook's hand; when his arms fly up it leaves his hand, falls to the deck and tips over
      const u = t - DROP;
      if (u < 0) wield(g, BUCKET(), BUCKET_P, "carry", c.cook, "R", cam);
      else { const camD = V.push(0.2 * DROP / b0);
        B0 ??= quiet(() => { const s = stageAt(on("cook", COOK_D, cook, DROP, MD, { seed: 9, blink: false }), camD); return { p: near(palm(s, "R"), camD, 0.05), over: heldOver(s, "R", camD) }; });
        const c0: V3 = [B0.p[0], B0.p[1] - 0.33, B0.p[2]], vy = 0.9, T1 = (vy + Math.sqrt(vy * vy + 19.6 * Math.max(0.05, c0[1] - MD - 0.16))) / 9.8;
        letGo(g, BUCKET(), BUCKET_P, B0.p, [(bx - c0[0]) / T1, vy, (bz - c0[2]) / T1], u, MD, cam, { centre: [0, -0.33], r: 0.16, spin: 0.45, mirror: B0.over, rests: [0, 90, -90] }); }
    } };
  add(HOOK);
}
// 2. TO SAY, WE WILL KILL YOU ALL? Close on Sir Digsworth, who leans out from behind the mast and says it as a question, draws a
//    finger across his throat and swallows
{
  const a0 = cut("hook", "guess"), b0 = cut("guess", "offer"), V = lens(-6.7, 1.9, 4.75, -1, 0, -4, 46), KILL = at("guess", /^kill/) - a0, DONE = L.guess.b - a0;
  const sir = mover(SIR_D, 1.8, -9.2, 4.74, 80); sir.stand(8);
  sir.actAt(-1, { roll: -13, lean: 6, armR: arm(46, 30, 126, 4), armL: arm(30, 10, 80, 0), head: [8, -12, -8] }, 10, { in: 0.01, handR: "open", handL: "fist", face: { wide: 0.9, lid: 0, brow: 1, gaze: [-0.4, -0.7] } });
  sir.actAt(0.2, { head: [-6, -2, -8] }, 9, { in: 0.2, antic: 0, over: 1.2, face: { wide: 0.8, lid: 0, brow: 0.9 } });
  // the finger: up beside the neck, then across it
  sir.actAt(KILL - 0.3, { armR: arm(40, 44, 152, 30) }, 0.34, { in: 0.16, out: 0.06, antic: 0, over: 1.2, handR: "point" });
  sir.actAt(KILL - 0.02, { armR: arm(40, 4, 152, -34), head: [-6, -8, 6] }, DONE - KILL + 0.1, { in: 0.2, out: 0.16, antic: 0, over: 1.3, handR: "point", face: { wide: 1, lid: 0, brow: 1 } });
  sir.actAt(DONE + 0.06, { head: [0, 16, -4], py: -0.04, armR: arm(46, 30, 126, 4) }, 0.26, { in: 0.1, out: 0.12, antic: 0, over: 1, handR: "open", face: { lid: 0.6, brow: -0.6, smile: -0.6 } });
  add({ id: "guess", a: a0, b: b0, still: KILL + 0.12,
    sounds: [{ t: 0.4, k: "flap", g: 0.6, p: 0.6 }, { t: KILL - 0.02, k: "whoosh", g: 0.5 }, { t: DONE + 0.08, k: "tap", g: 0.5 }, { t: 0.1, k: "creak", g: 0.5 }],
    cam: (_t, u) => V.push(0.12 * u), sun: { target: [-8.8, 1.6, 5], reach: 7 },
    cast: (t, T) => [on("sir", SIR_D, sir, t, MD, { talk: talk(W, T, ["guess"]), blink: false })],
  });
}
// 3. NO. IT WAS AN OFFER: at the sloop's rail. The captain shakes his head, points up at his flag and holds out an open hand; behind
//    him two of his men nod, each in his own time
{
  const a0 = cut("guess", "offer"), b0 = cut("offer", "creep"), V = lens(-4.8, 3.75, 6.3, 1, 0, -24, 54), IT = at("offer", /^It/) - a0, OFFER = at("offer", /^offer/) - a0;
  const cap = mover(CAPTAIN_D, 1.86, -2.2, 6.3, 270); cap.stand(8);
  cap.actAt(-1, { armR: arm(52, 14, 150, 6), armL: arm(14, 10, 40, 0), head: [0, -2, 0] }, IT + 1, { in: 0.01, out: 0.12, handR: "point", handL: "fist", face: { brow: -0.3, smile: 0.3, lid: 0.1 } });
  wag(cap, 0.06, IT - 0.14, P({ head: [17, -2, 0], armR: arm(52, 22, 150, 16) }), P({ head: [-17, -2, 0], armR: arm(52, 6, 150, -6) }), 0.3, { handR: "point" });
  cap.actAt(IT - 0.1, { armL: arm(166, 22, 178, 14), head: [20, -16, 0] }, OFFER - IT + 0.1, { in: 0.2, out: 0.1, antic: 0.3, over: 1.5, handL: "point", face: { brow: 0.7, smile: 0.6, lid: 0, gaze: [0.6, -0.7] } });
  cap.actAt(OFFER - 0.06, { armL: arm(164, 24, 176, 16), armR: arm(84, 12, 114, 0), lean: 6, head: [0, 0, 0] }, 9, { in: 0.2, antic: 0.2, over: 1.5, handL: "point", handR: "open", face: { brow: 0.9, smile: 1, lid: 0 } });
  wag(cap, OFFER + 0.2, 2, P({ armR: arm(88, 12, 120, 0) }), P({ armR: arm(80, 12, 106, 0) }), 0.36, { handR: "open" });
  const p1 = mover(PIRATE_D, 1.8, -1.7, 5.88, 262); p1.stand(8);
  p1.actAt(-1, { armL: arm(36, 4, 104, -34), armR: arm(36, 4, 104, -34), head: [-14, 0, 0] }, 10, { in: 0.01, ...OPEN, face: { smile: 0.9, brow: 0.5, lid: 0.1 } });
  wag(p1, IT - 0.05, 3, P({ head: [-14, 18, 0], lean: 5 }), P({ head: [-14, -6, 0], lean: 0 }), 0.34);
  const p2 = mover(MATE_D, 1.66, -1.7, 6.72, 280); p2.stand(8);
  p2.actAt(-1, { armR: arm(60, 20, 120, 10), armL: arm(12, 8, 30, 0), head: [14, 0, 0] }, 10, { in: 0.01, handR: "open", handL: "fist", face: { smile: 0.7, brow: 0.8, lid: 0 } });
  wag(p2, IT + 0.14, 3, P({ head: [14, 16, 0], armR: arm(64, 20, 96, 10) }), P({ head: [14, -4, 0], armR: arm(60, 20, 132, 10) }), 0.42, { handR: "open" });
  add({ id: "offer", a: a0, b: b0, still: OFFER + 0.3,
    sounds: [{ t: IT - 0.1, k: "whoosh", g: 0.5, p: 0.3 }, { t: OFFER - 0.04, k: "whoosh", g: 0.4, p: -0.1 }, { t: 0.5, k: "flap", g: 0.6, p: 0.6 }, { t: 0.2, k: "creak", g: 0.5 }],
    cam: (_t, u) => V.push(0.1 * u), sun: { target: [-2.2, 2, 6.3], reach: 6 },
    cast: (t) => [on("p1", PIRATE_D, p1, t, QD, { seed: 3 }), on("p2", MATE_D, p2, t, QD, { seed: 7 }), on("cap", CAPTAIN_D, cap, t, QD, { seed: 5 })] });
}
// 4. PIRATES OFTEN CREPT CLOSE UNDER A FRIENDLY FLAG: from high on the merchant ship as the sloop draws near under a made-up
//    merchant ensign. Along her waist cloth only hats and eyes show: four pirates peep over it, each in his own time; one comes up
//    too far and the captain pulls him down by the head. On the merchant's rail a sailor stands on a crate and waves
const PEEP: Partial<Pose> = { py: -0.5, lean: 4, head: [0, 0, 0], armL: arm(74, 16, 104, -6), armR: arm(74, 16, 104, -6) }, DUCK: Partial<Pose> = { py: -0.84, lean: 14, head: [0, 6, 0] };
const CROUCH: Partial<Pose> = { py: -0.8, lean: 24, head: [0, -22, 0] };
const SWAP = at("creep", /^then/) - 0.12;
{
  const a0 = cut("offer", "creep"), len = SWAP - a0, V = lens(-8.35, 3.2, 5.18, 0.97, 0.24, -9, 50), UPT = 1.15, PULL = 1.95, SZ0 = 6.28;
  const gap = (t: number) => 0.3 + 1.2 * (1 - smooth(clamp(t / (len + 0.2))));
  const low = (D: Design, h: number, z: number, off: number) => { const m = mover(D, h, -2.32, z, 270 + off); m.stand(8); return m; };
  const GRIP = { handL: "grip", handR: "grip" } as const;
  // the nearest one keeps looking from side to side
  const pir = low(PIRATE_D, 1.8, 5.34, 0);
  pir.actAt(-1, PEEP, 10, { in: 0.01, ...GRIP, face: { brow: -0.6, lid: 0.1, gaze: [0.6, 0] } });
  wag(pir, 0.2, 6, P({ head: [26, 0, 0] }), P({ head: [-26, 0, 0] }), 1.1);
  pir.actAt(PULL + 0.1, DUCK, 0.5, { in: 0.1, out: 0.2, antic: 0, over: 1.2, ...GRIP });
  // the tall one: down at first, then up head and shoulders with a grin and a wave, until a hand comes down on his head
  const tall = low(PIRATE2_D, 1.9, 5.87, -8);
  tall.actAt(-1, { ...DUCK, armL: arm(74, 16, 104, -6), armR: arm(74, 16, 104, -6) }, 10, { in: 0.01, ...GRIP, face: { smile: 0.6, lid: 0.1 } });
  tall.actAt(0.35, PEEP, UPT - 0.3, { in: 0.2, out: 0.1, antic: 0, over: 1.2, ...GRIP, face: { smile: 0.8, brow: 0.6, lid: 0 } });
  tall.actAt(UPT, { py: -0.08, lean: 0, armL: arm(150, 40, 184, 30), head: [0, -4, 0] }, PULL - UPT + 0.06, { in: 0.3, out: 0.1, antic: 0.2, over: 1.4, handL: "open", handR: "grip", face: { smile: 1, brow: 1, lid: 0, mouth: 0.5 } });
  wag(tall, UPT + 0.3, PULL - UPT - 0.34, P({ armL: arm(156, 26, 192, 6) }), P({ armL: arm(146, 50, 172, 56) }), 0.34, { handL: "open" });
  tall.actAt(PULL + 0.04, DUCK, 9, { in: 0.1, antic: 0, over: 1.5, ...GRIP, face: { lid: 0.9, brow: -0.8, smile: -0.6 } });
  // the captain: eyes over the cloth, then a look at the tall one and an arm out to pull him down, then a finger to his lips
  const cap = low(CAPTAIN_D, 1.86, 6.42, -14);
  cap.actAt(-1, PEEP, 10, { in: 0.01, ...GRIP, face: { brow: -0.8, lid: 0.15, gaze: [0.3, 0] } });
  cap.actAt(UPT + 0.3, { head: [-48, -8, 0] }, PULL - UPT - 0.1, { in: 0.14, out: 0.1, antic: 0, over: 1.3, face: { brow: -1, lid: 0, wide: 0.7, smile: -0.8 } });
  cap.actAt(PULL - 0.2, { armR: arm(120, 64, 112, 74), head: [-50, -4, 0], py: -0.36 }, 0.5, { in: 0.14, out: 0.2, antic: 0, over: 1.3, handR: "open", handL: "grip", face: { brow: -1, lid: 0, smile: -1 } });
  cap.actAt(PULL + 0.4, { armL: arm(60, 6, 152, -24), head: [-20, 0, 0] }, 9, { in: 0.2, antic: 0, over: 1.2, handL: "point", handR: "grip", face: { brow: -1, lid: 0.15, smile: -0.4 } });
  // the mate bobs up and down
  const mate = low(MATE_D, 1.66, 6.95, -20);
  mate.actAt(-1, PEEP, 10, { in: 0.01, ...GRIP, face: { brow: 0.4, lid: 0, wide: 0.5, gaze: [-0.4, 0] } });
  for (const t0 of [0.5, 1.6, 2.5]) mate.actAt(t0, DUCK, 0.5, { in: 0.14, out: 0.2, antic: 0, over: 1.2, ...GRIP });
  // the merchant's sailor on his crate, waving; a mug in his other hand
  const sailor = mover(SAILOR_D, 1.82, FLAGSEA.rail - 0.58, SZ0, 84); sailor.stand(8);
  sailor.actAt(-1, { armL: arm(150, 40, 176, 36), armR: arm(24, 44, 70, 60), head: [0, -4, 0] }, 10, { in: 0.01, handL: "open", handR: "grip", face: { smile: 1, brow: 0.7, lid: 0 } });
  wag(sailor, 0, 6, P({ armL: arm(154, 30, 184, 12) }), P({ armL: arm(146, 50, 166, 60) }), 0.5, { handL: "open" });
  add({ id: "creep", a: a0, b: SWAP, still: UPT - 0.3, hide: ["merchant", "msail"],
    sounds: [{ t: 0.1, k: "creak", g: 0.7 }, { t: 0.9, k: "flap", g: 0.7, p: 0.3 }, { t: UPT, k: "scuff", g: 0.6, p: -0.1 }, { t: PULL + 0.02, k: "thunk", g: 0.6, p: -0.1 }, { t: 2.4, k: "creak", g: 0.6 }, { t: 2.9, k: "flap", g: 0.6, p: 0.3 }, { t: 0.5, k: "scuff", g: 0.4, p: 0.2 }, { t: 1.6, k: "scuff", g: 0.4, p: 0.2 }],
    // the lens rides on the merchant ship, so the sloop glides closer
    cam: (t) => { const c = V.cam, d = -gap(t); return { pos: [c.pos[0] + d, c.pos[1], c.pos[2]], look: [c.look[0] + d, c.look[1], c.look[2]], fov: c.fov }; },
    sun: { target: [-4, 1.5, 6.5], reach: 13 },
    cast: (t) => [on("pir", PIRATE_D, pir, t, QD, { seed: 3 }), on("tall", PIRATE2_D, tall, t, QD, { seed: 1 }), on("cap", CAPTAIN_D, cap, t, QD, { seed: 5 }), on("mate", MATE_D, mate, t, QD, { seed: 7 }),
      { ...on("sailor", SAILOR_D, sailor, t, MD, { seed: 6 }), at: [FLAGSEA.rail - 0.58 - gap(t), MD + 0.7, SZ0] as V3 }],
    things: (g, c, t, T, cam) => {
      const dx = -gap(t); put(g, BRIG2(), [FLAGSEA.mx + dx, 0, FLAGSEA.mz]); put(g, SAIL_SET(), [FLAGSEA.mx + BRIG.sail.x + dx, FLAGSEA.yard, FLAGSEA.mz + BRIG.sail.z]);
      fly(g, "friendly", 4.8, T, 1); put(g, CRATE(), [FLAGSEA.rail - 0.58 + dx, MD, SZ0]); wield(g, MUG(), MUG_P, "hold", c.sailor, "R", cam);
    } });
}
// 5. THEN RAN UP THE BLACK ONE: low on the merchant's deck, behind her sailor. The ensign is hauled down, the black flag shoots up and
//    snaps open, and the pirates rise behind the cloth one after another with their blades in the air. The sailor's wave stops; his
//    mug drops
{
  const b0 = cut("creep", "meant"), V = lens(-8.6, 1.0, 6.3, 1, 0, 11, 60), SNAP = 0.72, MUGT = 0.62; let M5: { p: V3; over: boolean } | null = null;
  const up = (D: Design, h: number, x: number, z: number, t0: number, off: number) => { const m = mover(D, h, x, z, 270 + off); m.stand(8);
    m.actAt(-1, { ...CROUCH, armR: arm(30, 10, 96, -10), armL: arm(30, 10, 80, 0) }, t0 + 1.02, { in: 0.01, out: 0.01, handR: "grip", handL: "fist" });
    m.actAt(t0, { armR: arm(158, 30, 186, 10), armL: arm(60, 40, 110, 30), lean: -4, head: [0, -6, 0] }, 9, { in: 0.2, antic: 0.2, over: 1.7, handR: "grip", handL: "fist", face: { brow: -1, lid: 0, wide: 0.7, mouth: 1, smile: 0.4 } });
    wag(m, t0 + 0.3, 3, P({ armR: arm(164, 24, 190, 4), py: 0.02 }), P({ armR: arm(150, 36, 178, 18), py: -0.02 }), 0.3 + 0.03 * off / 10, { handR: "grip" }); return m; };
  const pir = up(PIRATE_D, 1.8, -1.75, 5.9, 0.3, -8), mate = up(MATE_D, 1.66, -2.2, 6.3, 0.46, 0), peeker = up(PIRATE2_D, 1.9, -1.75, 6.75, 0.38, 6), cap = up(CAPTAIN_D, 1.86, -2.2, 7.25, 0.54, 10);
  const [x, z] = V.spot(2.85, -0.5), sailor = mover(SAILOR_D, 1.82, x, z, 84); sailor.stand(8);
  sailor.actAt(-1, { armL: arm(160, 34, 190, 30), armR: arm(24, 44, 70, 60) }, 10, { in: 0.01, handL: "open", handR: "grip" });
  wag(sailor, -0.3, 0.6, P({ armL: arm(164, 24, 196, 4) }), P({ armL: arm(156, 46, 176, 56) }), 0.5, { handL: "open" });
  sailor.actAt(MUGT - 0.04, { armR: arm(24, 50, 60, 70), py: -0.03 }, 0.5, { in: 0.08, out: 0.2, antic: 0, over: 1.4, handR: "open" });
  sailor.actAt(MUGT + 0.3, { armR: arm(150, 34, 180, 16), lean: -5 }, 9, { in: 0.34, antic: 0, over: 1.2, handR: "open" });
  quake(sailor, 0.5, 5, 2.6);
  add({ id: "swap", a: SWAP, b: b0, still: 1.0,
    sounds: [{ t: 0.02, k: "rope", g: 0.9, p: 0.6 }, { t: 0.3, k: "rope", g: 0.9, p: 0.6 }, { t: SNAP, k: "flap", g: 1.3, p: 0.5 }, ...[0.3, 0.38, 0.46, 0.54].map((t, i) => ({ t: t + 0.1, k: "shing", g: 0.8, p: -0.2 + 0.2 * i })), { t: MUGT + 0.45, k: "ting", g: 0.9, p: -0.6 }, { t: MUGT + 0.6, k: "rattle", g: 0.5, p: -0.6, dur: 0.4 }],
    cam: (_t, u) => V.push(0.16 * u), sun: { target: [-4.5, 1.5, 6.5], reach: 9 },
    cast: (t) => [on("pir", PIRATE_D, pir, t, QD, { seed: 3, blink: false }), on("peeker", PIRATE2_D, peeker, t, QD, { seed: 1, blink: false }), on("mate", MATE_D, mate, t, QD, { seed: 7, blink: false }), on("cap", CAPTAIN_D, cap, t, QD, { seed: 5, blink: false }), on("sailor", SAILOR_D, sailor, t, MD, { seed: 6 })],
    things: (g, c, t, T, cam) => {
      const d = smooth(t / 0.4); if (d < 1) fly(g, "friendly", 4.8 - 3.2 * d, T, 1 - 0.8 * d);
      fly(g, "pirate", 2.3 + 3.7 * smooth((t - 0.18) / 0.5), T, 0.3 + 0.7 * smooth((t - 0.5) / 0.3));
      ([["pir", 0.3], ["peeker", 0.38], ["mate", 0.46], ["cap", 0.54]] as [string, number][]).forEach(([n, t0], i) => { if (t > t0 + 0.04) sword(g, i, c[n], cam); });
      // the mug: by its ear in his hand; his hand opens, it falls, lands on the deck and lies on its side with the ear up
      const u = t - MUGT;
      if (u < 0) wield(g, MUG(), MUG_P, "hold", c.sailor, "R", cam);
      else { const camM = V.push(0.16 * MUGT / (b0 - SWAP));
        M5 ??= quiet(() => { const s = stageAt(on("sailor", SAILOR_D, sailor, MUGT, MD, { seed: 6 }), camM); return { p: near(palm(s, "R"), camM, 0.05), over: heldOver(s, "R", camM) }; });
        letGo(g, MUG(), MUG_P, M5.p, [0, 0.3, 0], u, MD, cam, { centre: [0.07, 0], r: 0.065, spin: 0.7, mirror: M5.over, rests: [0, -90] }); }
    } });
}
// 6. IT MEANT, GIVE UP NOW, AND WE SHOW MERCY: from the sloop's quarterdeck, past the two of them and across the water. The captain
//    acts it out toward the other ship: a finger up, a point at their sail and his hand pressed down twice, then an open hand and a
//    hand on his heart. Beside him one of his men studies his nails, then copies the hand on the heart with his eyes shut. Across the
//    water the merchant captain stands at his rail with his arms folded, takes it in, and looks round at his men
{
  const a0 = cut("creep", "meant"), b0 = cut("meant", "sight"), V = lens(-0.2, 3.3, 8.3, -0.8, -0.6, -18, 60);
  const GIVE = at("meant", /^give/) - a0, NOW = at("meant", /^now/) - a0, AND = at("meant", /^and/) - a0, MERCY = at("meant", /^mercy/) - a0;
  const cap = mover(CAPTAIN_D, 1.86, -2.2, 6.6, 15); cap.stand(8);
  cap.actAt(-1, { armR: arm(56, 22, 160, 10), armL: arm(14, 10, 40, 0), head: [-44, -8, 0] }, GIVE + 1, { in: 0.01, out: 0.1, handR: "point", handL: "fist", face: { brow: 0.8, lid: 0, smile: 0.2 } });
  cap.actAt(GIVE - 0.12, { armR: arm(84, 30, 96, 26), lean: 8, head: [-44, -10, 0] }, NOW - GIVE + 0.1, { in: 0.14, out: 0.08, antic: 0.4, over: 1.7, handR: "point", handL: "fist", face: { brow: -0.6, lid: 0, wide: 0.5 } });
  wag(cap, NOW - 0.04, AND - NOW - 0.06, P({ armR: arm(44, 14, 50, 10), lean: 10, py: -0.03, head: [-44, -4, 0] }), P({ armR: arm(74, 14, 84, 10), lean: 4, head: [-44, -4, 0] }), 0.42, { handR: "open", handL: "fist", face: { brow: -0.6, lid: 0, wide: 0.5 } });
  cap.actAt(AND - 0.1, { armL: arm(22, 12, 56, 4), armR: arm(44, 16, 100, 30), lean: -4, head: [-44, -8, 0] }, MERCY - AND + 0.12, { in: 0.2, out: 0.1, antic: 0.2, over: 1.5, ...OPEN, face: { brow: 1, smile: 1, lid: 0 } });
  cap.actAt(MERCY - 0.08, { armR: arm(28, 12, 122, -48), armL: arm(22, 12, 56, 4), lean: 14, head: [-30, 14, 6] }, 9, { in: 0.24, antic: 0, over: 1.3, ...OPEN, face: { brow: 1, smile: 1, lid: 0.7 } });
  cap.actAt(MERCY + 0.55, { head: [-44, -8, 6] }, 9, { in: 0.2, antic: 0, over: 1.2, ...OPEN, face: { brow: 0.6, smile: 1, lid: 0, gaze: [0, -0.3] } });
  const p2 = mover(MATE_D, 1.66, -2.1, 6.02, 30); p2.stand(8);
  p2.actAt(-1, { armR: arm(46, 16, 132, -16), armL: arm(14, 8, 40, 0), head: [6, 20, 0] }, MERCY + 1.1, { in: 0.01, out: 0.2, handR: "open", handL: "fist", face: { lid: 0.4, brow: 0.3, gaze: [0, 0.8] } });
  wag(p2, 0.2, AND - 0.3, P({ armR: arm(46, 16, 138, -16) }), P({ armR: arm(46, 16, 126, -10) }), 0.7, { handR: "open", handL: "fist", face: { lid: 0.4, brow: 0.3, gaze: [0, 0.8] } });
  p2.actAt(AND + 0.1, { head: [-40, -6, 0] }, MERCY - AND, { in: 0.2, out: 0.1, antic: 0, over: 1.2, handR: "open", handL: "fist", face: { lid: 0, brow: 0.8, gaze: [-0.7, 0] } });
  p2.actAt(MERCY + 0.14, { armR: arm(28, 12, 122, -48), head: [-8, 10, -8], lean: 6 }, 9, { in: 0.3, antic: 0.2, over: 1.3, handR: "open", handL: "fist", face: { smile: 1, lid: 1, brow: 1 } });
  // the one it is said to: on his own deck across the water, arms folded; he leans to hear, and looks round at his men
  const mcap = mover(CUSTOMS_D, 1.9, -5.9, 5.6, 70); mcap.stand(8);
  const STIFF = { brow: -0.7, lid: 0.15, smile: -0.8 };
  mcap.actAt(-1, { armL: arm(34, 26, 70, -50), armR: arm(34, 26, 70, -50), head: [0, -8, 0] }, 10, { in: 0.01, handL: "fist", handR: "fist", face: STIFF });
  mcap.actAt(NOW, { lean: 8, head: [0, -4, 6] }, AND - NOW + 0.2, { in: 0.3, out: 0.2, antic: 0, over: 1.1, handL: "fist", handR: "fist", face: { brow: 0.6, lid: 0, wide: 0.6, smile: -0.8 } });
  mcap.actAt(MERCY + 0.3, { head: [-56, -2, 0] }, 9, { in: 0.24, antic: 0, over: 1.1, handL: "fist", handR: "fist", face: { brow: 0.8, lid: 0, wide: 0.6, smile: -0.6, gaze: [-0.8, 0] } });
  add({ id: "meant", a: a0, b: b0, still: MERCY + 0.4, hide: ["lantern", "wheel"],
    sounds: [{ t: GIVE - 0.1, k: "whoosh", g: 0.5 }, ...swings(NOW - 0.04, AND - NOW - 0.06, 0.42, b0 - a0).map((t) => ({ t, k: "whoosh", g: 0.35 })), { t: AND - 0.08, k: "whoosh", g: 0.5 }, { t: MERCY + 0.1, k: "tap", g: 0.7 }, { t: 0.3, k: "flap", g: 0.6, p: 0.6 }, { t: 1.7, k: "flap", g: 0.5, p: 0.6 }, { t: 1.0, k: "creak", g: 0.5 }],
    cam: (_t, u) => V.push(0.14 * u), sun: { target: [-3, 2, 6.6], reach: 8 },
    cast: (t) => [on("mcap", CUSTOMS_D, mcap, t, MD, { seed: 4 }), on("p2", MATE_D, p2, t, QD, { seed: 7 }), on("cap", CAPTAIN_D, cap, t, QD, { seed: 5 })],
    things: (g, _c, _t, T) => { fly(g, "pirate", TOP, T, 1); } });
}
// 7. SOME SHIPS GAVE UP AT THE VERY SIGHT: from the water between the ships. The merchant captain has the black flag in his spyglass;
//    he lowers it, swallows, changes it to his other hand, draws his hanger and cuts the halyard that is belayed beside him: the rope
//    flies up, the sail comes down behind them, and his men put their hands up
{
  const a0 = cut("meant", "sight"), b0 = cut("sight", "red"), V = lens(-3.3, 2.15, 5.1, -1, 0.06, -12, 58), LOW = 0.62, GULP = 0.9, PASS = 1.0, DRAW = 1.16, SLASH = 1.6, LAND = SLASH + 0.6;
  const A: V3 = [-5.3, MD + 0.86, 5.52], B: V3 = [FLAGSEA.mx + BRIG.sail.x, FLAGSEA.yard, 6.85];      // the halyard: belayed at the rail beside him, up to the yard
  const mc = mover(CUSTOMS_D, 1.9, -5.75, 5.25, 46); mc.stand(LOW + 0.16).turn(30, 0.3).stand(8);
  const PEER = { brow: -0.5, lid: 0.2, smile: -0.3 }, SHOCK = { wide: 1, lid: 0, brow: 1, mouth: 0.4, smile: -0.8 }, GRIM = { brow: -1, lid: 0, wide: 0.6, smile: -1 };
  // the glass at his eye, his two hands on the tube, the eye at the eyepiece shut; it points at the black flag on the sloop's staff
  const TARGET: V3 = [SX - 0.05, TOP - 0.6, SZ], ST: Stand = { D: CUSTOMS_D, at: [-5.75, MD, 5.25], heading: 46, h: 1.9, cam: V.cam, pose: { head: [0, -22, 0], lean: -4 } };
  mc.actAt(-1, { ...spyPose(ST, TARGET), head: [0, -22, 0], lean: -4 }, LOW + 1.24, { in: 0.01, out: 0.14, handR: "grip", handL: "grip", face: { ...PEER, shut: spyEye(V.cam, ST.at, TARGET) } });
  mc.actAt(LOW, { armR: arm(34, 8, 76, -24), head: [0, 0, 0], lean: 0 }, PASS - LOW + 0.3, { in: 0.24, out: 0.1, antic: 0, over: 1.2, handR: "grip", handL: "fist", face: SHOCK });
  mc.actAt(GULP, { head: [0, 15, 0], py: -0.03 }, 0.2, { in: 0.08, out: 0.1, antic: 0, over: 1, handR: "grip", handL: "fist", face: SHOCK });
  // the glass goes over to his left hand, which takes it down to his side
  mc.actAt(PASS - 0.22, { armL: arm(34, 8, 76, -24) }, 0.46, { in: 0.14, out: 0.1, antic: 0, over: 1.1, handL: "grip", handR: "grip", face: SHOCK });
  mc.actAt(PASS + 0.22, { armL: arm(18, 14, 44, 6) }, 9, { in: 0.2, antic: 0, over: 1.1, handL: "grip", handR: "grip", face: GRIM });
  // the hanger: his right hand to the hilt at his left hip, out and up over his shoulder, then down through the rope on his right
  // his right hand across to the hilt at his left hip (solved for where he stands, so that it closes on the hilt)
  const ST76: Stand = { D: CUSTOMS_D, at: [-5.75, MD, 5.25], heading: 76, h: 1.9, cam: V.cam, pose: { twist: 10 } };
  mc.actAt(DRAW - 0.1, { ...reach(ST76, "R", hiltFor(ST76, "L")), twist: 10 }, 0.3, { in: 0.1, out: 0.06, antic: 0, over: 1.1, handR: "grip", handL: "grip", face: GRIM });
  mc.actAt(DRAW + 0.18, { armR: arm(150, 40, 200, 10), twist: -18, lean: -4, head: [-30, -6, 0] }, SLASH - DRAW - 0.2, { in: 0.18, out: 0.04, antic: 0, over: 1.2, handR: "grip", handL: "grip", face: GRIM });
  mc.actAt(SLASH - 0.02, { armR: arm(36, 34, 46, 40), twist: 12, lean: 8, head: [-30, 4, 0] }, 0.5, { in: 0.07, out: 0.2, antic: 0, over: 1.5, handR: "grip", handL: "grip", face: GRIM });
  mc.actAt(SLASH + 0.42, { armR: arm(20, 16, 40, 10), head: [0, -24, 0], lean: -3 }, 9, { in: 0.24, antic: 0, over: 1.2, handR: "grip", handL: "grip", face: { wide: 0.8, lid: 0, brow: 1, smile: -0.8, gaze: [0, -1] } });
  const WORRY = { wide: 0.8, lid: 0, brow: 0.9, smile: -0.7 };
  const sailor = mover(SAILOR_D, 1.82, -7.3, 4.37, 96); sailor.stand(8);
  sailor.actAt(-1, { armL: arm(20, 10, 60, 0), armR: arm(20, 10, 60, 0), head: [8, -4, 0] }, 10, { in: 0.01, handL: "fist", handR: "fist", face: WORRY });
  sailor.actAt(SLASH + 0.1, { head: [30, -28, 0] }, 0.5, { in: 0.14, out: 0.14, antic: 0, over: 1.2, handL: "fist", handR: "fist", face: WORRY });
  sailor.actAt(LAND - 0.2, { ...UP(-3), head: [0, -4, 0] }, 9, { in: 0.26, antic: 0.2, over: 1.5, ...OPEN, face: WORRY });
  // the ship's boy stands in front of the sailor, his fists at his mouth
  const cook = mover(SHIPBOY_D, 1.28, -6.8, 4.73, 96); cook.stand(8);
  cook.actAt(-1, { armL: arm(40, 10, 110, -20), armR: arm(40, 10, 110, -20), head: [8, -14, 0] }, 10, { in: 0.01, handL: "fist", handR: "fist", face: { wide: 0.9, lid: 0, brow: 1, mouth: 0.3, smile: -0.8 } });
  cook.actAt(SLASH + 0.2, { head: [30, -28, 0] }, 0.5, { in: 0.14, out: 0.14, antic: 0, over: 1.2, handL: "fist", handR: "fist", face: { wide: 1, lid: 0, brow: 1, mouth: 0.5, smile: -0.8 } });
  cook.actAt(LAND + 0.02, { ...UP(4), head: [0, -4, 0] }, 9, { in: 0.26, antic: 0.2, over: 1.5, ...OPEN, face: { wide: 1, lid: 0, brow: 1, mouth: 0.3, smile: -0.8 } });
  const yardY = (t: number) => { const u = (t - SLASH - 0.03) / 0.57; return u <= 0 ? FLAGSEA.yard : u < 1 ? FLAGSEA.yard - (FLAGSEA.yard - STRUCK) * u * u : STRUCK + 0.14 * Math.abs(Math.sin((u - 1) * 9)) * Math.exp(-(u - 1) * 5); };
  SIGHT.hit = a0 + LAND;
  add({ id: "sight", a: a0, b: b0, still: 0.3, hide: ["msail"],
    sounds: [{ t: GULP, k: "tap", g: 0.5 }, { t: DRAW + 0.1, k: "shing", g: 0.9 }, { t: SLASH, k: "crack", g: 0.9, p: -0.2 }, { t: SLASH + 0.05, k: "rattle", g: 1.0, dur: 0.6 }, { t: SLASH + 0.08, k: "whoosh", g: 0.9, dur: 0.5 }, { t: LAND, k: "thud", g: 1.2, big: 1.4 }, { t: LAND + 0.05, k: "sack", g: 0.9 }, { t: LAND + 0.2, k: "ting", g: 0.6, p: -0.2 }],
    cam: (_t, u) => V.push(0.08 * u), sun: { target: [-6.5, 1.5, 5.3], reach: 8 },
    cast: (t) => [on("sailor", SAILOR_D, sailor, t, MD, { seed: 6 }), { ...on("cook", SHIPBOY_D, cook, t, MD, { seed: 9 }), noShade: true }, on("mc", CUSTOMS_D, mc, t, MD, { seed: 4, blink: false })],
    things: (g, c, t, _T, cam) => {
      sailAt(g, yardY(t), (t - SLASH) / 0.55);
      // the halyard: cut above his shoulder; its lower end drops by the rail and its upper end flies up to the yard
      const C = mix3(A, B, 0.14), u = t - SLASH;
      if (u < 0) line(g, A, B, 0.02); else { line(g, A, [A[0], Math.max(A[1] + 0.06, C[1] - 16 * u * u), A[2] + 0.3 * clamp(u / 0.24)], 0.02); if (u < 0.3) line(g, mix3(C, B, u * 3), mix3(C, B, Math.min(1, u * 3 + 0.22)), 0.02); }
      // the spyglass: at his eye with both hands on the tube; lowered into his right hand by its middle; over to his left hand through both
      const lowR = (q: THREE.Group) => wield(q, GLASS(), SPYGLASS, "lowered", c.mc, "R", cam, { at: MIDG }), lowL = (q: THREE.Group) => wield(q, GLASS(), SPYGLASS, "lowered", c.mc, "L", cam, { at: MIDG });
      if (t < LOW) spy(g, GLASS(), c.mc, cam, TARGET);
      else if (t < LOW + 0.26) blend(g, GLASS(), smooth((t - LOW) / 0.26), (q) => spy(q, GLASS(), c.mc, cam, TARGET), lowR, "spyglass", "mc R");
      else if (t < PASS - 0.1) lowR(g);
      else if (t < PASS + 0.06) blend(g, GLASS(), smooth((t - PASS + 0.1) / 0.16), lowR, lowL, "spyglass", "mc R+L");
      else lowL(g);
      // the hanger: in its scabbard on his baldric; drawn, up over his shoulder, down through the halyard, and lowered
      sheathed(g, SCABS[0](), c.mc, "L", cam, { drawn: t > DRAW });
      if (t > DRAW) { const k = (u0: number, u1: number) => smooth((t - u0) / (u1 - u0));
        if (t < DRAW + 0.08) sword(g, 0, c.mc, cam, "draw");
        else if (t < DRAW + 0.3) sword(g, 0, c.mc, cam, "draw", "R", ["chop", k(DRAW + 0.08, DRAW + 0.3)]);
        else if (t < SLASH - 0.04) sword(g, 0, c.mc, cam, "chop");
        else if (t < SLASH + 0.08) sword(g, 0, c.mc, cam, "chop", "R", ["struck", k(SLASH - 0.04, SLASH + 0.08)]);
        else if (t < SLASH + 0.42) sword(g, 0, c.mc, cam, "struck");
        else if (t < SLASH + 0.66) sword(g, 0, c.mc, cam, "struck", "R", ["lowered", k(SLASH + 0.42, SLASH + 0.66)]);
        else sword(g, 0, c.mc, cam, "lowered"); }
    } });
}
// 8. FIGHT BACK, AND A RED FLAG MIGHT FOLLOW, NO MERCY: on another ship, behind her captain. He shakes his fist and fires his pistol;
//    the pirates duck, the black flag comes down and a red one goes up, the sky turns red, and the blades come out one by one. He
//    lowers the pistol at his side and looks round at us
const RED = { a: cut("sight", "red"), b: cut("red", "answer"), up: 0 };
{
  const a0 = RED.a, b0 = RED.b, V = lens(-7.6, 1.0, 7.9, 0.981, -0.192, 15, 60), FIRE = at("red", /^back/) - a0 + 0.12, RED0 = at("red", /^red/) - a0 - 0.3, NM = at("red", /^no/) - a0;
  RED.up = a0 + RED0;
  const [sx, sz] = V.spot(1.95, 0.33), stub = mover(SHIPOWNER_D, 1.7, sx, sz, 96); stub.stand(8);
  stub.actAt(-1, { armR: arm(160, 30, 196, 16), armL: arm(70, 40, 112, 34), lean: 4 }, NM + 1.2, { in: 0.01, out: 0.2, handR: "fist", handL: "grip" });
  wag(stub, 0, FIRE - 0.1, P({ armR: arm(166, 24, 200, 6) }), P({ armR: arm(152, 40, 184, 30) }), 0.26, { handR: "fist" });
  stub.actAt(FIRE - 0.2, { armL: arm(98, 44, 106, 38), lean: 8 }, 0.24, { in: 0.14, out: 0.04, antic: 0, over: 1.2, handL: "grip" });
  stub.actAt(FIRE, { armL: arm(122, 46, 154, 40), lean: -6, pz: -0.05 }, 0.4, { in: 0.05, out: 0.26, antic: 0, over: 1.6, handL: "grip" });
  stub.actAt(FIRE + 0.5, { armR: arm(60, 30, 120, 10), lean: 0 }, NM - FIRE - 0.7, { in: 0.3, out: 0.2, antic: 0, over: 1.1, handR: "fist" });
  stub.actAt(RED0 + 0.9, { py: -0.05, lean: -5, armR: arm(30, 20, 60, 10) }, 9, { in: 0.5, antic: 0, over: 1, handR: "open" });
  stub.actAt(NM - 0.2, { armL: arm(16, 22, 30, 16), twist: 30, head: [84, 4, 0] }, 9, { in: 0.3, antic: 0, over: 1.2, handL: "grip", face: { wide: 1, lid: 0, brow: 1, mouth: 0.3, smile: -0.9, gaze: [0.6, 0] } });
  stub.actAt(NM + 0.5, { head: [84, 14, 0], py: -0.03 }, 0.26, { in: 0.1, out: 0.12, antic: 0, over: 1 });
  const draw = (D: Design, h: number, x: number, z: number, i: number, off: number) => { const m = mover(D, h, x, z, 262 + off), t0 = RED0 + 0.75 + 0.2 * i; m.stand(8);
    m.actAt(-1, { armR: arm(20, 12, 50, 0), armL: arm(20, 12, 50, 0), head: [-off, 0, 0] }, 10, { in: 0.01, handR: "fist", handL: "fist", face: { brow: 0.4, smile: 0.4, lid: 0.1 } });
    m.actAt(FIRE + 0.03 + 0.03 * i, "duck", 0.46, { in: 0.08, out: 0.22, antic: 0, over: 1.2 });
    m.actAt(FIRE + 0.6 + 0.05 * i, { head: [i % 2 ? 40 : -40, 0, 0] }, RED0 - FIRE - 0.3, { in: 0.2, out: 0.2, antic: 0, over: 1.1, face: { brow: -0.8, lid: 0.15, smile: -0.5 } });
    m.actAt(t0, { armR: arm(152, 32, 184, 12), lean: 4, head: [-off, -4, 0] }, 9, { in: 0.2, antic: 0.5, over: 1.7, handR: "grip", face: { brow: -1, lid: 0, wide: 0.5, mouth: 0.7, smile: 0.7 } });
    wag(m, t0 + 0.4, 3, P({ armR: arm(158, 26, 190, 6) }), P({ armR: arm(146, 38, 176, 20) }), 0.5 + 0.06 * i, { handR: "grip" }); return { m, t0 }; };
  const mate = draw(MATE_D, 1.66, -2.2, 5.6, 2, -10), peeker = draw(PIRATE2_D, 1.9, -1.8, 6.1, 1, -4), cap = draw(CAPTAIN_D, 1.86, -2.2, 6.6, 0, 4), pir = draw(PIRATE_D, 1.8, -1.8, 7.05, 3, 10);
  // the captain's order: an arm thrown up toward the staff and down
  cap.m.actAt(RED0 - 0.5, { armL: arm(150, 50, 180, 40), head: [40, -10, 0] }, 0.6, { in: 0.2, out: 0.14, antic: 0.3, over: 1.6, handL: "point", face: { brow: -1, lid: 0, smile: -0.4 } });
  const team: [string, Design, typeof mate][] = [["mate", MATE_D, mate], ["peeker", PIRATE2_D, peeker], ["cap", CAPTAIN_D, cap], ["pir", PIRATE_D, pir]];
  FIGHT.hit = a0 + FIRE;
  let M0: { p: V3; d: [number, number] } | null = null;      // where the muzzle is, and the way it points, when the pistol goes off
  add({ id: "red", a: a0, b: b0, still: RED0 + 1.5, hide: ["merchant", "msail"],
    sounds: [{ t: FIRE, k: "blast", g: 0.8, p: 0.4, big: 0.6 }, { t: FIRE + 0.1, k: "scuff", g: 0.7, p: -0.3 }, { t: RED0 - 0.3, k: "rope", g: 0.9, p: 0.3 }, { t: RED0 + 0.1, k: "rope", g: 0.9, p: 0.3 }, { t: RED0 + 0.62, k: "flap", g: 1.3, p: 0.3 }, ...team.map(([, , q], i) => ({ t: q.t0 + 0.06, k: "shing", g: 0.9, p: -0.5 + 0.2 * i })), { t: NM - 0.1, k: "scuff", g: 0.6, p: 0.5 }, { t: NM + 0.52, k: "tap", g: 0.5, p: 0.5 }],
    cam: (_t, u) => V.push(0.12 * u), sun: { target: [-4.5, 1.5, 7], reach: 10 },
    cast: (t) => [...team.map(([n, D, q], i) => on(n, D, q.m, t, QD, { seed: i + 2, blink: false })), on("stub", SHIPOWNER_D, stub, t, MD, { seed: 8, blink: false })],
    things: (g, c, t, T, cam) => {
      put(g, BRIG_GREEN(), [FLAGSEA.mx, 0, FLAGSEA.mz]); sailAt(g, FLAGSEA.yard, 0);
      const dn = smooth((t - RED0 + 0.35) / 0.4); if (dn < 1) fly(g, "pirate", TOP - 3.6 * dn, T, 1 - 0.8 * dn);
      if (t > RED0 - 0.05) fly(g, "red", 2.4 + (TOP - 2.4) * smooth((t - RED0) / 0.55), T, 0.3 + 0.7 * smooth((t - RED0 - 0.35) / 0.3));
      team.forEach(([n, , q], i) => { if (t > q.t0 + 0.05) sword(g, i, c[n], cam); });
      // his pistol: the butt in his left hand, held up along his arm, aimed and kicked up by the shot; lowered at his side at the end
      if (t < NM - 0.2) wield(g, PISTOL(), PISTOL_P, "up", c.stub, "L", cam);
      else if (t < NM + 0.1) wield(g, PISTOL(), PISTOL_P, "up", c.stub, "L", cam, { blend: ["lowered", smooth((t - NM + 0.2) / 0.3)] });
      else wield(g, PISTOL(), PISTOL_P, "lowered", c.stub, "L", cam);
      if (t >= FIRE) { M0 ??= quiet(() => { const camF = V.push(0.12 * FIRE / (b0 - a0)), s = stageAt(on("stub", SHIPOWNER_D, stub, FIRE, MD, { seed: 8, blink: false }), camF), o = PISTOL_TMP();
          wield(new THREE.Group(), o, PISTOL_P, "up", s, "L", camF); o.updateMatrixWorld(true); const m = o.localToWorld(new THREE.Vector3(0.495, 0.148, 0)), d = o.localToWorld(new THREE.Vector3(1.2, 0.148, 0)).sub(m.clone());
          return { p: m.toArray() as V3, d: [d.x, d.z] as [number, number] }; });
        gunSmoke(g, M0.p, M0.d[0], M0.d[1], t - FIRE, 0.75); }
    } });
}
// 9. THE BLACK FLAG WAS MEANT TO WIN THE TREASURE WITHOUT A FIGHT: back on the first ship. In the middle of the picture two pirates
//    carry the treasure across the deck between them, a small open chest of gold on top of a big one, with short steps under its
//    weight, their blades still in their belts; the one behind yawns. Behind them the crew stand in a row at the rail, unhurt, with
//    their hands up, each with his own trouble. The black flag flies over it all
{
  const a0 = cut("red", "answer"), b0 = cut("answer", "tarp"), len = b0 - a0, Z0 = 7.4, V = lens(-10.9, 1.25, Z0 - 0.43, 0.995, 0.1, 8, 62), X = -6.6, HALF = 0.68, PACE = 0.45;
  const who = (D: Design, h: number, d: number, l: number, off: number) => { const [x, z] = V.spot(d, l), m = mover(D, h, x, z, V.toward(x, z, off)); m.stand(8); return m; };
  // the two who carry, each with a hand in one of the chest's end handles: the one in front leans forward against the load, the one
  // behind leans back; both with bent knees and short steps
  const lead = mover(PIRATE2_D, 1.9, X, Z0 - HALF, 180), rear = mover(MATE_D, 1.66, X, Z0 + HALF, 180);
  lead.walk(mt(lead, PACE * (len + 0.6)), { step: 0.24, tau: 0.46 }); rear.walk(mt(rear, PACE * (len + 0.6)), { step: 0.24 * (1.9 / 1.66), tau: 0.46 });      // the same pace for the long legs and the short
  lead.actAt(-1, { lean: 12, py: -0.1, armL: arm(-24, 8, -34, 4), armR: arm(-24, 8, -34, 4), head: [0, -6, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: -1, lid: 0.3, mouth: 0.3, smile: -0.8 } });
  wag(lead, 0.2, 6, P({ lean: 15, py: -0.12 }), P({ lean: 9, py: -0.08 }), 1.2);
  rear.actAt(-1, { lean: -10, py: -0.12, armL: arm(34, 8, 44, 4), armR: arm(34, 8, 44, 4), head: [0, 0, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: -0.4, lid: 0.3, smile: -0.3 } });
  rear.actAt(1.3, { head: [0, -14, 6] }, 1.3, { in: 0.34, out: 0.3, antic: 0, over: 1.1, face: { lid: 0.95, brow: 0.7, mouth: 1 } });
  wag(rear, 0.5, 6, P({ lean: -12, py: -0.14 }), P({ lean: -8, py: -0.1 }), 1.2);
  // the crew along the rail: tired arms, a stiff chin, an itching nose, a yawn that is catching, a boy on his toes
  const old = who(OLDHAND_D, 1.76, 5.25, -1.75, -6);
  old.actAt(-1, { ...UP(0), head: [10, -2, 0] }, 10, { in: 0.01, ...OPEN, face: { lid: 0.4, brow: 0.2, smile: -0.5 } });
  old.actAt(0.5, { armL: arm(108, 40, 150, 20), armR: arm(104, 40, 146, 20), lean: 5 }, 0.95, { in: 0.7, out: 0.12, antic: 0, over: 1, ...OPEN, face: { lid: 0.7, brow: -0.2 } });
  old.actAt(2.1, { armL: arm(112, 40, 152, 20), armR: arm(108, 40, 150, 20), lean: 5 }, 0.9, { in: 0.6, out: 0.12, antic: 0, over: 1, ...OPEN, face: { lid: 0.7, brow: -0.2 } });
  const mc = who(CUSTOMS_D, 1.9, 5.4, -1.32, -2);
  mc.actAt(-1, { ...UP(2), head: [-30, -10, 0] }, 10, { in: 0.01, ...OPEN, face: { brow: -0.8, lid: 0.15, smile: -1, gaze: [-0.7, 0.5] } });
  mc.actAt(1.0, { head: [26, -8, 0] }, 9, { in: 1.8, antic: 0, over: 1, face: { brow: -0.8, lid: 0.15, smile: -1, gaze: [0.6, 0.5] } });
  const cook = who(COOK_D, 1.58, 5.25, -0.9, 2), SCR = 1.5;
  cook.actAt(-1, { ...UP(4), head: [0, -4, 0] }, 10, { in: 0.01, ...OPEN, face: { brow: 0.4, lid: 0.1, smile: -0.4 } });
  cook.actAt(SCR - 0.5, { head: [0, -4, 0] }, 0.5, { in: 0.2, out: 0.1, antic: 0, over: 1, face: { brow: -0.6, lid: 0.5, smile: -0.6, gaze: [0, 0.6] } });
  cook.actAt(SCR, { armR: arm(52, 20, 158, -30), head: [0, 6, 0] }, 0.85, { in: 0.22, out: 0.1, antic: 0, over: 1.2, handR: "point", face: { lid: 0.8, brow: 0.6, smile: 0.5 } });
  wag(cook, SCR + 0.24, 0.5, P({ armR: arm(52, 20, 162, -30) }), P({ armR: arm(52, 20, 152, -26) }), 0.16, { handR: "point" });
  cook.actAt(SCR + 0.86, { armR: arm(158, 30, 186, 10), py: 0.03 }, 0.4, { in: 0.1, out: 0.2, antic: 0, over: 1.8, handR: "open", face: { wide: 1, lid: 0, brow: 1, smile: -0.8 } });
  const sailor = who(SAILOR_D, 1.82, 5.4, -0.48, 6);
  sailor.actAt(-1, { ...UP(-3), head: [-20, 0, 0] }, 10, { in: 0.01, ...OPEN, face: { lid: 0.2, brow: 0.2, smile: -0.3, gaze: [-0.6, 0.4] } });
  sailor.actAt(2.5, { head: [-10, -14, 0], lean: -5 }, 1.1, { in: 0.34, out: 0.3, antic: 0, over: 1.1, face: { lid: 0.95, brow: 0.7, mouth: 1 } });
  const boy = who(SHIPBOY_D, 1.28, 5.2, -0.04, 10);
  boy.actAt(-1, { ...UP(4), head: [-30, -8, 0] }, 10, { in: 0.01, ...OPEN, face: { wide: 0.9, lid: 0, brow: 0.9, gaze: [-0.7, 0.4] } });
  wag(boy, 0.2, 5, P({ py: 0.05, head: [-30, -10, 0] }), P({ py: 0, head: [-10, -4, 0] }), 0.9);
  add({ id: "answer", a: a0, b: b0, still: 1.9, hide: ["msail"],
    sounds: [...lead.cues().filter((q) => q.k === "step" && q.t < len).map((q) => ({ t: q.t, k: "step", surface: "wood", g: 0.9, p: 0 })), ...rear.cues().filter((q) => q.k === "step" && q.t < len).map((q) => ({ t: q.t + 0.07, k: "step", surface: "wood", g: 0.8, p: 0.2 })),
      { t: 0.3, k: "coin", g: 0.6, p: 0.1 }, { t: 1.5, k: "coin", g: 0.6, p: 0 }, { t: 2.7, k: "coin", g: 0.6, p: -0.1 }, { t: 0.5, k: "creak", g: 0.6 }, { t: 2.3, k: "creak", g: 0.6 }, { t: 0.6, k: "flap", g: 0.6, p: 0.3 }, { t: 2.6, k: "flap", g: 0.6, p: 0.3 },
      ...swings(SCR + 0.24, 0.5, 0.16, len).map((t) => ({ t, k: "scratch", g: 0.5, p: 0 })), { t: SCR + 0.9, k: "whoosh", g: 0.5, p: 0 }],
    cam: (t) => lens(-10.9, 1.25, (on("lead", PIRATE2_D, lead, t, MD).at[2] + on("rear", MATE_D, rear, t, MD).at[2]) / 2 - 0.43, 0.995, 0.1, 8, 62).cam, sun: { target: [-7.5, MD, 6.5], reach: 10 },
    cast: (t) => [on("mc", CUSTOMS_D, mc, t, MD, { seed: 4 }), on("sailor", SAILOR_D, sailor, t, MD, { seed: 6 }), on("old", OLDHAND_D, old, t, MD, { seed: 2 }), on("cook", COOK_D, cook, t, MD, { seed: 9 }), on("boy", SHIPBOY_D, boy, t, MD, { seed: 8 }),
      { ...on("rear", MATE_D, rear, t, MD, { seed: 7 }), noShade: true }, { ...on("lead", PIRATE2_D, lead, t, MD, { seed: 1 }), noShade: true }],      // no shade on the two who carry, so that their hands in the rings read
    things: (g, c, t, T, cam) => {
      fly(g, "pirate", TOP, T, 1);
      // the load hangs between the lead man's hand behind him and the rear man's hand in front of him: the big chest by its two rope
      // handles, the small open chest of gold standing on its lid
      const big = carryBy(g, CHEST_A(), c.lead, "L", c.rear, "L", cam, 0.1); big.updateMatrixWorld(true);
      const tp = big.localToWorld(new THREE.Vector3(0, 0.52, 0)), top = put(g, CHEST_GOLD(), [tp.x, tp.y, tp.z]); top.rotation.copy(big.rotation);
      // each man's blade stays in its scabbard on his baldric
      sheathed(g, SCABS[1](), c.lead, "L", cam); sheathed(g, SCABS[2](), c.rear, "L", cam);
    } });
}
// 10. ONE CREW HAD NO BLACK FLAG: on another sloop, alone on the sea. One of her men is bent over the flag chest; he lifts it by its
//     two sides, turns it over in front of him and shakes it. Nothing. He sets it down and shrugs. His mate holds the bare halyard out
//     at his side and sees something off to the side
const TARP = { a: cut("answer", "tarp"), mid: at("tarp", /^so/) - 0.1, b: cut("tarp", "worked") };
{
  const a0 = TARP.a, b0 = TARP.mid, V = lens(-0.1, 1.3, 3.75, 0, -1, -6, 56), LIFT = 0.3, DOWN = 1.25, CX = -0.35, CZ = 1.0;
  const gun = mover(GUNNER_D, 1.9, CX - 0.02, CZ - 0.5, 4); gun.stand(8);
  const LOOK = { brow: -0.7, lid: 0.2, smile: -0.7, mouth: 0, gaze: [0, 0.9] as [number, number] }, SOUR = { brow: -0.5, lid: 0.25, smile: -1, mouth: 0 };
  gun.actAt(-1, { lean: 34, armL: arm(54, 10, 46, -6), armR: arm(54, 10, 46, -6), head: [0, 12, 0] }, LIFT + 1, { in: 0.01, out: 0.1, handL: "open", handR: "open", face: LOOK });
  // his hands in the chest's two end handles, held up in front of him (solved for where he stands)
  const ST10: Stand = { D: GUNNER_D, at: [CX - 0.02, 0, CZ - 0.5], heading: 4, h: 1.9, cam: V.cam, pose: { lean: 6 } }, J10 = jointsOf(ST10), CC = mix3(J10("pelvis"), J10("neck"), 0.3);
  const AR = (reach(ST10, "R", aside(CC, V.cam, -0.394)) as { armR: [[number, number], [number, number]] }).armR, AL = (reach(ST10, "L", aside(CC, V.cam, 0.394)) as { armL: [[number, number], [number, number]] }).armL;
  const nud = (a: [[number, number], [number, number]], d: number): [[number, number], [number, number]] => [[a[0][0] + d, a[0][1]], [a[1][0] + d, a[1][1]]];
  gun.actAt(LIFT, { lean: 6, armL: AL, armR: AR, head: [0, 18, 0] }, DOWN - LIFT + 0.04, { in: 0.2, out: 0.14, antic: 0.2, over: 1.3, handL: "grip", handR: "grip", face: LOOK });
  wag(gun, LIFT + 0.24, DOWN - LIFT - 0.3, P({ armL: nud(AL, 5), armR: nud(AR, -5) }), P({ armL: nud(AL, -5), armR: nud(AR, 5) }), 0.16, { handL: "grip", handR: "grip", face: LOOK });
  gun.actAt(DOWN + 0.1, { armL: arm(30, 18, 82, 22), armR: arm(30, 18, 82, 22), head: [-10, 0, 10], py: 0.02 }, 9, { in: 0.2, antic: 0.2, over: 1.6, handL: "open", handR: "open", face: SOUR });
  wag(gun, DOWN + 0.45, 2, P({ head: [14, 0, 10] }), P({ head: [-22, 0, 10] }), 0.4, { handL: "open", handR: "open", face: SOUR });
  const cor = mover(CORSAIR_D, 1.76, 0.76, -0.45, -8); cor.stand(8);
  const WATCH = { brow: 0.6, lid: 0.1, smile: -0.2, gaze: [-0.6, 0.3] as [number, number] };
  cor.actAt(-1, { armR: arm(112, 52, 162, 44), armL: arm(20, 10, 60, 0), head: [-24, -6, 0] }, 10, { in: 0.01, handR: "grip", handL: "fist", face: WATCH });
  wag(cor, 0.2, 0.9, P({ armR: arm(112, 52, 156, 44) }), P({ armR: arm(112, 52, 168, 44) }), 0.36, { handR: "grip", handL: "fist", face: WATCH });
  cor.actAt(b0 - a0 - 0.5, { head: [64, 4, 0], armL: arm(84, 60, 92, 66) }, 9, { in: 0.16, antic: 0.3, over: 1.6, handL: "point", handR: "grip", face: { brow: 1, lid: 0, wide: 0.7, smile: 0.7, gaze: [0.9, 0] } });
  add({ id: "empty", a: a0, b: b0, still: DOWN + 0.5, hide: ["merchant", "msail"],
    sounds: [{ t: 0.05, k: "sack", g: 0.7 }, ...swings(LIFT + 0.24, DOWN - LIFT - 0.3, 0.16, b0 - a0).map((t) => ({ t, k: "rattle", g: 0.5, dur: 0.14 })), { t: DOWN + 0.05, k: "thunk", g: 0.9 }, { t: 0.3, k: "rope", g: 0.6, p: 0.4 }, { t: 0.2, k: "creak", g: 0.5 }],
    cam: (_t, u) => V.push(0.12 * u), sun: { target: [0, 0.5, 0.5], reach: 6 },
    cast: (t) => [on("cor", CORSAIR_D, cor, t, 0, { seed: 4 }), on("gun", GUNNER_D, gun, t, 0, { seed: 2 })],
    things: (g, c, t, _T, cam) => {
      put(g, CRATE(), [CX, 0, CZ]);
      // the chest: on the crate; lifted by its two end handles, turned over about them and shaken; set down again
      const kl = smooth((t - LIFT) / 0.22) * (1 - smooth((t - DOWN + 0.1) / 0.2)), kf = smooth((t - LIFT - 0.18) / 0.3) * (1 - smooth((t - DOWN + 0.42) / 0.3));
      const held = (q: THREE.Group) => { const o = carryBy(q, CHEST_OPEN(), c.gun, "R", c.gun, "L", cam, 0.1); flipAbout(o, 0.36 * 0.68, kf); };
      const rest = (q: THREE.Group) => setDown(q, CHEST_OPEN(), "chest", [CX, 0.7, CZ], cam).rotateY(Math.PI / 2);      // end on, its open lid edge on to us
      if (kl < 0.002) rest(g); else if (kl > 0.998) held(g); else blend(g, CHEST_OPEN(), kl, rest, held, "chest", "gun R+L");
      // the bare halyard in the mate's closed hand
      line(g, near(palm(c.cor, "R"), cam, 0.04), [SHIP.mast[0] + 0.1, 9.3, SHIP.mast[2]], 0.012); fingers(g, c.cor, ["R"], cam, 0.08);
    } });
}
// 11. SO THEY HOISTED A DIRTY TARPAULIN AND FIRED A GUN: from the quarterdeck. The mate whips a filthy tarpaulin off a cask, bends it
//     to the halyard and hauls it up the mast, dripping. Men in white shirts come across the deck and fall in in a row behind the
//     gun, facing us, each trying to look like one of a crew. In front the gunner, on one knee, puts his match to the gun; it goes
//     off, and the row jumps to attention
{
  const a0 = TARP.mid, b0 = TARP.b, len = b0 - a0, V = lens(-1.4, 2.5, 5.05, -0.05, -1, -8.7, 54), OFF = 0.38, BEND = 0.75, HAUL = 0.95, UPT = 1.95, FIRE = at("tarp", /^fired/) - a0 + 0.14, MX = SHIP.mast[0], MZ = SHIP.mast[2];
  const cor = mover(CORSAIR_D, 1.8, -0.55, -0.95, 30); cor.stand(8);
  cor.actAt(-1, { lean: 22, armL: arm(60, 30, 70, 30), armR: arm(64, 20, 76, 20), head: [-20, 8, 0] }, OFF + 1.1, { in: 0.01, out: 0.1, handL: "grip", handR: "grip", face: { brow: 1, smile: 0.8, lid: 0 } });
  cor.actAt(OFF - 0.14, { lean: -8, armL: arm(150, 30, 180, 20), armR: arm(140, 20, 170, 10), twist: 20 }, 0.4, { in: 0.12, out: 0.2, antic: 0.3, over: 1.6, handL: "grip", handR: "grip", face: { brow: 1, smile: 0.8, lid: 0 } });
  cor.actAt(OFF + 0.3, { armL: arm(70, 0, 110, -20), armR: arm(70, 0, 120, -20), lean: 6, head: [10, 6, 0] }, HAUL - OFF - 0.3, { in: 0.16, out: 0.08, antic: 0, over: 1.2, handL: "grip", handR: "grip", face: { brow: -0.6, lid: 0.2, smile: 0.3 } });
  wag(cor, HAUL, UPT - HAUL, P({ armL: arm(150, 8, 176, -4), armR: arm(60, 8, 110, -4), lean: -4, head: [0, -30, 0] }), P({ armL: arm(60, 8, 110, -4), armR: arm(150, 8, 176, -4), lean: 6, head: [0, -30, 0] }), 0.34, { handL: "grip", handR: "grip", face: { brow: 0.6, lid: 0, gaze: [0, -1] } });
  cor.actAt(UPT + 0.02, { armL: arm(30, 30, 20, 50), armR: arm(30, 30, 20, 50), lean: -6, head: [0, -34, 0] }, 9, { in: 0.24, antic: 0, over: 1.3, handL: "fist", handR: "fist", face: { brow: 0.8, lid: 0, smile: 1, gaze: [0, -1] } });
  cor.actAt(FIRE + 0.02, "duck", 0.5, { in: 0.08, out: 0.26, antic: 0, over: 1.2 });
  const gun = mover(GUNNER_D, 1.9, -1.45, 1.0, 316); gun.stand(8);
  const KEEN = { brow: -0.6, lid: 0.3, smile: 0.2 };
  gun.actAt(-1, "kneel", 10, { in: 0.01 });
  gun.actAt(-1, { armR: arm(40, 20, 110, 0), armL: arm(30, 10, 70, -10), head: [-30, 0, 0] }, 10, { in: 0.01, handR: "grip", handL: "fist", face: KEEN });
  // he blows on his match, looks round and up at the tarpaulin going aloft, then puts the match to the touch hole
  gun.actAt(0.15, { armR: arm(50, 14, 138, -10), head: [-10, 10, 0] }, 0.75, { in: 0.2, out: 0.16, antic: 0, over: 1.2, handR: "grip", handL: "fist", face: { brow: -0.4, lid: 0.4, mouth: 0.25 } });
  gun.actAt(HAUL + 0.2, { head: [56, -24, 0] }, UPT - HAUL + 0.1, { in: 0.24, out: 0.2, antic: 0.2, over: 1.3, handR: "grip", handL: "fist", face: { brow: 1, lid: 0, wide: 0.6, smile: 0.6, gaze: [0.6, -0.8] } });
  wag(gun, FIRE - 0.85, 0.5, P({ armR: arm(44, 20, 128, 0) }), P({ armR: arm(44, 20, 112, 0) }), 0.2, { handR: "grip", handL: "fist", face: { brow: -0.8, lid: 0.3 } });
  gun.actAt(FIRE - 0.26, { armR: arm(74, 26, 60, 20), lean: 16, head: [0, 14, 0] }, 0.3, { in: 0.2, out: 0.05, antic: 0.2, over: 1.2, handR: "grip", handL: "fist", face: { brow: -1, lid: 0.5 } });
  gun.actAt(FIRE + 0.02, { lean: -14, head: [0, -10, 0], armR: arm(110, 30, 150, 20) }, 0.6, { in: 0.06, out: 0.3, antic: 0, over: 1.4, handR: "grip", handL: "open", face: { wide: 1, lid: 0, brow: 1, mouth: 0.5 } });
  gun.actAt(FIRE + 0.7, { armL: arm(150, 34, 186, 10), head: [0, -8, 0] }, 9, { in: 0.2, antic: 0.2, over: 1.6, handR: "grip", handL: "fist", face: { brow: 0.8, lid: 0, smile: 1, mouth: 0.6 } });
  // the men in white shirts: they come across the deck one behind the other and fall in in a row behind the gun, facing us, each
  // trying to look fierce; when the gun goes off they jump to attention
  const FIERCE = { brow: -1, lid: 0.2, smile: -1 };
  const row = ([[SHIRT_A_D, 1.78], [SHIRT_B_D, 1.9], [SHIRT_C_D, 1.64], [SHIRT_D_D, 1.7], [SHIRT_E_D, 1.86]] as [Design, number][]).map(([D, h], i) => {
    const x1 = -2.5 + 0.42 * i, z1 = -0.5, m = mover(D, h, x1 + 2.6, z1, 270), t1 = 0.05; m.stand(t1).walk(mt(m, 2.6), { step: 0.62 * (1.78 / h), tau: 0.38 }).turn(90, 0.3).stand(8);      // in file from the starboard side, one pace for the tall and the short
    const there = t1 + 2.6 / 1.2 + 0.45;
    if (i === 0) m.actAt(there, { armL: arm(30, 50, -20, 60), armR: arm(30, 50, -20, 60), lean: -6 }, FIRE - there + 0.1, { in: 0.3, out: 0.06, antic: 0, over: 1.3, handL: "fist", handR: "fist", face: FIERCE });
    if (i === 1) m.actAt(there, { armR: arm(150, 30, 100, 60) }, FIRE - there + 0.1, { in: 0.3, out: 0.06, antic: 0.2, over: 1.5, handR: "fist", handL: "fist", face: { brow: -1, lid: 0, mouth: 0.5, smile: -0.6 } });
    if (i === 2) m.actAt(there, { armL: arm(40, 0, 100, -60), armR: arm(40, 0, 100, -60), lean: -8, head: [0, -10, 0] }, FIRE - there + 0.1, { in: 0.3, out: 0.06, antic: 0, over: 1.2, handL: "fist", handR: "fist", face: { brow: -1, lid: 0.3, smile: -0.8 } });
    if (i === 3) m.actAt(there, { armR: arm(30, 50, -20, 60), armL: arm(30, 50, -20, 60) }, FIRE - there + 0.1, { in: 0.2, out: 0.06, antic: 0, over: 1.4, handL: "fist", handR: "fist", face: FIERCE });
    if (i === 4) m.actAt(there, { armL: arm(150, 34, 178, 16), lean: -4 }, FIRE - there + 0.1, { in: 0.3, out: 0.06, antic: 0.2, over: 1.5, handL: "fist", handR: "fist", face: { brow: -1, lid: 0, mouth: 0.6, smile: -0.6 } });
    m.actAt(FIRE + 0.04 + 0.03 * i, { py: 0.04, lean: -5, armL: arm(8, 6, 10, 2), armR: arm(8, 6, 10, 2), head: [0, -8, 0] }, 9, { in: 0.07, antic: 0, over: 1.8, handL: "fist", handR: "fist", face: { wide: 1, lid: 0, brow: 1, smile: -0.6 } });
    return { D, m, name: "shirt" + i }; });
  const tarpY = (t: number) => 1.15 + 2.45 * smooth((t - HAUL) / (UPT - HAUL)), BX = -0.15, BZ = -1.15;
  GUN.hit = a0 + FIRE;
  add({ id: "hoist", a: a0, b: b0, still: UPT + 0.25, hide: ["merchant", "msail"],
    sounds: [{ t: OFF - 0.1, k: "tear", g: 0.8, p: 0.4, dur: 0.4 }, { t: OFF + 0.1, k: "flap", g: 0.8, p: 0.4 }, ...swings(HAUL, UPT - HAUL, 0.17, len).map((t) => ({ t, k: "rope", g: 0.8, p: 0.3 })), { t: UPT + 0.05, k: "flap", g: 1.1, p: 0.3 }, { t: UPT + 0.5, k: "drip", g: 0.7, p: 0.3 }, { t: UPT + 0.9, k: "drip", g: 0.7, p: 0.3 },
      ...row[0].m.cues().filter((q) => q.k === "step" && q.t < 2.6).map((q) => ({ t: q.t, k: "step", surface: "wood", g: 0.7, p: 0.2 })), { t: FIRE, k: "blast", g: 1.3, p: -0.5, big: 1.5 }, { t: FIRE + 0.08, k: "scuff", g: 0.8, p: 0.2 }, { t: FIRE + 0.3, k: "creak", g: 0.8 }],
    cam: (_t, u) => V.push(0.2 * u), sun: { target: [-0.5, 0.5, -0.5], reach: 10 },
    cast: (t) => [on("cor", CORSAIR_D, cor, t, 0, { seed: 4 }), ...row.map((q, i) => ({ ...on(q.name, q.D, q.m, t, 0, { seed: i + 1 }), noShade: true })), { ...on("gun", GUNNER_D, gun, t, 0, { seed: 2, blink: false }), noShade: true }],
    things: (g, c, t, T, cam) => {
      put(g, TARBARREL(), [BX, 0, BZ]);
      // the tarpaulin: over the cask, whipped off, bent to the halyard, up the mast
      const f = FLAG.tarpaulin(), h = near(c.cor.joint("tipL"), cam, 0.05), k = smooth((t - OFF + 0.1) / 0.2), up = t >= BEND, y = up ? tarpY(t) : 0;
      f.wave(T, up ? 0.15 + 0.85 * smooth((t - HAUL - 0.3) / 0.7) : 0);
      if (up) put(g, f.obj, [MX - 0.24, y, MZ + 0.08], Math.PI); else put(g, f.obj, [BX + 0.2 + (h[0] - BX - 0.2) * k, 0.98 + (h[1] + 0.25 - 0.98) * k, BZ + 0.34 + (h[2] - BZ - 0.34) * k], Math.PI);
      line(g, [MX - 0.22, up ? y : 1.2, MZ + 0.08], [MX - 0.1, 9.3, MZ], 0.012); if (up) line(g, [MX - 0.22, y - 0.9, MZ + 0.08], near(c.cor.joint("tipR"), cam, 0.04), 0.012);
      // flies over the cask until the tarpaulin goes; drops from it once it is up
      if (t < OFF + 0.4) for (let i = 0; i < 4; i++) g.add(mesh(ball(0.022, 6), "#17141a", { at: [BX + 0.3 * Math.sin(T * 7 + i * 2), 1.25 + 0.14 * Math.sin(T * 9 + i), BZ + 0.2 * Math.cos(T * 6 + i * 3)], line: 0, shadow: false }));
      if (t > UPT) for (let i = 0; i < 3; i++) { const u = ((t - UPT) * 1.3 + i * 0.37) % 1; g.add(mesh(ball(0.03, 6), "#6f5d44", { at: [MX - 0.5 - 0.3 * i, y - 0.95 - 3.6 * u * u, MZ + 0.3], scale: [1, 1.6, 1], line: 0, shadow: false })); }
      // the gunner's match, and the gun's smoke out over the side
      const kk = (u0: number, u1: number) => smooth((t - u0) / (u1 - u0));
      if (t < FIRE - 0.26) wield(g, MATCH(), LINSTOCK, "ready", c.gun, "R", cam);
      else if (t < FIRE) wield(g, MATCH(), LINSTOCK, "ready", c.gun, "R", cam, { blend: ["fire", kk(FIRE - 0.26, FIRE - 0.04)] });
      else if (t < FIRE + 0.3) wield(g, MATCH(), LINSTOCK, "fire", c.gun, "R", cam, { blend: ["ready", kk(FIRE, FIRE + 0.3)] });
      else wield(g, MATCH(), LINSTOCK, "ready", c.gun, "R", cam);
      if (t >= HAUL && t < UPT + 0.1) fingers(g, c.cor, ["L", "R"], cam, 0.08);
      gunSmoke(g, [-2.7, 1.15, 0.3], -0.45, 0.9, t - FIRE, 1.8);
    } });
}
// 12. IT WORKED: over the sloop's rail the big ship lies close. Her crew put their hands up, one after another, and her white flag
//     comes down. Sir Digsworth, at the edge of the picture and seen from the waist up, watches them, says it to us with a small
//     shrug, looks up at the tarpaulin overhead, and a drop from it lands on his cap
{
  const a0 = TARP.b, V = lens(1.0, 1.7, -5.9, -1, 0, 7, 58), SAY = L.worked.a - a0, SAID = L.worked.b - a0, DRIP = SAID + 0.75, FX = -7.2, FZ = -8.5;
  // he stands at the edge, half turned to the ship: he looks up at the tarpaulin as he says it, a finger up at it; then he turns to us
  // and shrugs; a drop from it lands on his cap, and he looks up again with a hand to the cap
  const sir = mover(SIR_D, 1.8, -2.4, -6.4, 40); sir.stand(8);
  sir.actAt(-1, { armR: arm(64, 30, 150, 20), armL: arm(20, 10, 50, 0), head: [-12, -34, 0], lean: -6 }, SAID + 1.1, { in: 0.01, out: 0.16, handR: "point", handL: "relaxed", face: { brow: 1, wide: 0.6, lid: 0, gaze: [0, -1] } });
  sir.actAt(SAID + 0.08, { armL: arm(30, 26, 88, 36), armR: arm(30, 26, 88, 36), py: 0.03, head: [48, -2, 6], lean: 0 }, DRIP - SAID + 0.3, { in: 0.22, out: 0.14, antic: 0.2, over: 1.5, ...OPEN, face: { brow: 1, lid: 0.1, smile: 0.6 } });
  sir.actAt(DRIP + 0.02, { py: -0.05, head: [48, 8, 0], lean: 2 }, 0.3, { in: 0.07, out: 0.14, antic: 0, over: 1.5, face: { lid: 1, brow: -0.8, smile: -0.5 } });
  sir.actAt(DRIP + 0.36, { armR: arm(70, 20, 168, -20), head: [-12, -30, 0], lean: -4 }, 9, { in: 0.24, antic: 0, over: 1.2, handR: "open", face: { brow: -0.4, lid: 0.3, smile: -0.4, gaze: [0, -1] } });
  // the big ship's crew at her rail: four different men, two rows, the hands going up one after another
  const crew = ([[DOCKER_D, 1.9, -5.5, -4.58, 0.2], [DOCKHAND_D, 1.68, -4.75, -5.04, 0.5], [FRENCH_CAPT_D, 1.84, -5.5, -5.5, 0.8], [FRENCH_MATE_D, 1.78, -4.75, -5.96, 1.1]] as [Design, number, number, number, number][]).map(([D, h, x, z, t0], i) => { const m = mover(D, h, x, z, 90 + (i - 1.5) * 6); m.stand(8);
    m.actAt(-1, { armL: arm(20, 10, 60, 0), armR: arm(20, 10, 60, 0), head: [i % 2 ? 20 : -20, -4, 0] }, 10, { in: 0.01, handL: "fist", handR: "fist", face: { wide: 1, lid: 0, brow: 1, smile: -0.8 } });
    // the two in front put their hands on their heads and the two behind (on the hatch, a step higher) their arms up: four faces
    m.actAt(t0, { ...(i % 2 ? { armL: arm(132, 44, 176, -46), armR: arm(132, 44, 176, -46) } : UP(-4)), head: [0, -2, 0] }, 9, { in: 0.24, antic: 0.3, over: 1.6, ...OPEN }); quake(m, t0 + 0.4, 5, 1.6 + 0.5 * i); return { D, m, name: "fr" + i }; });
  add({ id: "worked", a: a0, b: END12, still: SAY + 0.6, hide: ["merchant", "msail"],
    sounds: [{ t: 0.3, k: "rope", g: 0.7, p: 0.4 }, { t: 0.8, k: "rope", g: 0.7, p: 0.4 }, { t: 1.3, k: "flap", g: 0.6, p: 0.4 }, { t: SAY, k: "whoosh", g: 0.4, p: -0.5 }, { t: DRIP, k: "drip", g: 1.2, p: -0.5 }, { t: DRIP + 0.55, k: "drip", g: 0.9, p: -0.5 }, { t: 0.2, k: "creak", g: 0.5 }],
    cam: (_t, u) => V.push(0.05 * u), sun: { target: [-4, 0.5, -6], reach: 12 },
    cast: (t, T) => [...crew.map((q, i) => on(q.name, q.D, q.m, t, MD + (i % 2 ? 0 : 0.3), { seed: i + 3 })), { ...on("sir", SIR_D, sir, t, 0, { talk: talk(W, T, ["worked"]), blink: false }), noShade: true }],
    things: (g, c, t, T) => {
      put(g, BRIG_RED(), [FX, 0, FZ]); put(g, TARBARREL(), [-2.3, 0, -5.3]);
      const fy = 5.4 - 3.9 * smooth((t - 0.2) / 1.2); fly(g, "white", fy, T, 1 - 0.75 * smooth((t - 0.5) / 0.9), [FX + BRIG.mast[0] + 0.2, FZ + BRIG.mast[1]], -Math.PI / 2);
      // the drops from the tarpaulin overhead: one lands on his cap
      const top = c.sir.joint("crown");
      for (const [t0, dx] of [[DRIP, 0], [DRIP + 0.55, 0.05]] as [number, number][]) { const fallT = 0.5, u = t - t0 + fallT; if (u > 0 && u < fallT) g.add(mesh(ball(0.02, 8), "#8a7556", { at: [top[0] + 0.12, top[1] + 0.06 + 4.9 * (fallT * fallT - u * u), top[2] + dx], scale: [1, 1.7, 1], line: 0.3, shadow: false }));
        else if (u >= fallT && u < fallT + 0.2) for (let k = 0; k < 5; k++) { const a = k * 1.26, v = u - fallT; g.add(mesh(ball(0.02, 6), "#6f5d44", { at: [top[0] + 0.12, top[1] + 0.06 + 1.6 * v - 9 * v * v, top[2] + dx + Math.cos(a) * v * 1.1], line: 0, shadow: false })); } }
    } });
}
// 13. THE CODA: back on the merchant's deck a moment before the first frame: her crew's hands going up, the black flag at the foot of
//     its staff, Sir Digsworth behind the mast. The lens runs straight on into the first frame, so that the film loops
{
  const H = HOOK, len = H.b - H.a;
  add({ id: "loop", a: END12, b: END, still: CODA - 0.04, hide: H.hide, sounds: [{ t: 0.12, k: "creak", g: 0.5 }, { t: 0.5, k: "scuff", g: 0.4, p: -0.4 }],
    cam: (t) => H.cam(t - CODA, (t - CODA) / len), sun: H.sun,
    cast: (t, T) => H.cast(t - CODA, T - END), things: (g, c, t, T, cam) => H.things?.(g, c, t - CODA, T - END, cam) });
}

dusk.at = (T: number) => (T >= RED.a && T < RED.b ? smooth((T - RED.up) / 0.9) : 0);
export const BLACK_FLAG: Film = {
  id: "black-flag", fps: 30, seconds: END, sky: "#9fd6ff", world: flagSea, shots, words: W,
  hook: { text: ["WHY DID PIRATES", "FLY BLACK FLAGS?"], a: 0, b: L.hook.b + 0.2, size: 84 },
  solids: FLAGSEA_SOLIDS,
  // each is the film's own frame at that time (text.md names the times), with the words laid over it
  thumbs: [
    { T: 0.6, words: ["WHY A", "BLACK FLAG?"], y: 0.66, size: 140 },
    { T: RED.up + 1.5, words: ["RED MEANT", "NO MERCY"], y: 0.72, size: 132 },
    { T: TARP.mid + 2.2, words: ["NO FLAG?", "NO PROBLEM"], y: 0.72, size: 126 },
  ],
  hits: [{ t: SIGHT.hit, amp: 0.3, dur: 0.3 }, { t: FIGHT.hit, amp: 0.35, dur: 0.25 }, { t: GUN.hit, amp: 0.9, dur: 0.4 }],
  beds: [{ k: "sea", a: 0, b: END, g: 1 }, { k: "wind", a: 0, b: END, g: 0.4 }], music: "shanty", audio: "craft/black-flag.wav",
};

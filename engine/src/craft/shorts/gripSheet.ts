// The grip sheet: every prop that is held in the films, in a figure's hand, in its use pose and lowered, from the front and from the
// side, close enough to see the fingers and the thumb. It is a film like the others (one still shot per picture), so that what the
// sheet shows is exactly what stage/grips.ts puts in a hand in the films. scripts/grip_sheet.sh renders it to granskning/rattningar.
// A shot is named <prop>-<use>-<view>; the script lays the sheet out by those names.
import * as THREE from "three";
import { Film, Shot, Cam, V3, Staged, play, mix3 } from "../stage/film";
import { mover, MM } from "../stage/acting";
import { lens, once, noShade, near, palm, fuseSmoke, aside, span } from "../stage/staging";
import { glow } from "../world/fire";
import { GLADIUS, NET, STICK, TRIDENT, SHIELD_ARM, shieldOn, pole, polePose, Stand, PISTOL, SABRE, MUG, SPYGLASS, BUCKET, LINSTOCK, FIDDLE, BOW, GRAPES, BUNDLE, wield, spy, spyEye, spyPose, aimPose, usePose, sheathed, drawSabre, drawPose, reach, liftPose, haul, haulPose, carryBy, fiddlePose, fiddlePlay, citharaPose, citharaHold, shoulderPose, onShoulder, inHand, letGo, jointsOf, handshake, handOn, RIBBON, SPILL, FUSE, WOODSWORD, BOWL, SPOON, ROLL, COIN, MAPPA, PEN, SCROLL, OLIVE } from "../stage/grips";
import { flagSea } from "../world/ship";
import { group, mesh, box } from "../world/kit";
import { gladius, scutum, trident, netBunch, refStick, spyglass, pistolHeld, sabre, mugHeld, scabbard, bucketHeld, linstock, chest, fiddle, fiddleBow, fiddleByNeck, cithara, grapes, bundleHeld, bench, ribbonBow, tray, spill, fuseCord, pistolSling, openBook, woodSword, stretcher, bowl, bowlRim, spoon, bandageRoll, coinHeld, mappa, reedPen, scrollHeld, olive } from "../world/props";
import { MURMILLO_GRILLE_D, MURMILLO_D, RETIARIUS_D, REFEREE_D, CUSTOMS_D, SHIPOWNER_D, PIRATE_D, SAILOR_D, PIRATE2_D, CAPTAIN_D, COOK_D, GUNNER_D, DOCKER_D, DOCKHAND_D, NERO_D, NERO_STAGE_D, ROMAN_WOMAN2_D, CITIZEN_D, BLACKBEARD_D, YOU_D, SIR_D, BLACKBEARD_PREP_D, BLACKBEARD_ARMED_D, SHIPBOY_D, OLDHAND_D, MURMILLO_BARE_D, CARRIED_D, TRAINER_D, PUPIL_D, OWNER_D, DOCTOR_D, SPONSOR_D, BEARER_D, BEARER2_D } from "../looks";
import type { HandKind } from "../ink";
import type { Pose } from "../rig";
import type { Design, Face } from "../designs/common";

const on = (name: string, D: Design, m: MM, t: number) => play(name, D, m, t, [0, 0, 0], m.h, { blink: false });
// the props as the films use them
const GLASS = once(() => { const s = noShade(spyglass()); s.scale.setScalar(1.2); return s; });
const GLASS_MID = once(() => { const s = noShade(spyglass()); s.position.x = -0.24; const g = group([s]); g.scale.setScalar(1.2); return g; });
const PISTOL_O = once(() => { const p = noShade(pistolHeld()); p.scale.setScalar(0.7); return p; });
const SABRE_O = once(() => noShade(sabre(0.6))), MUG_O = once(() => noShade(mugHeld(0.14))), SCAB = once(() => noShade(scabbard(0.5)));

const X = 0.6, Z = 2.0, V = lens(X, 1.4, Z + 3.0, 0, -1, 0, 50), LEN = 0.4;
const shots: Shot[] = [];
/** one picture: a figure at the mark, turned `turn` degrees from facing the lens, in a pose (solved for where he stands), with the
 *  thing put in its hand */
const card = (id: string, D: Design, h: number, turn: number, pose: (s: Stand) => Partial<Pose>, hands: { handL?: "grip" | "relaxed"; handR?: "grip" | "relaxed"; face?: Face }, thing: (g: THREE.Group, a: Staged, cam: Cam) => void, dx = 0) => {
  const x = X + dx, heading = V.toward(x, Z, turn), m = mover(D, h, x, Z, heading); m.stand(9);
  m.actAt(-1, { armL: [[16, 12], [34, 6]], armR: [[16, 12], [34, 6]], ...pose({ D, at: [x, 0, Z], heading, h, cam: V.cam }) }, 10, { in: 0.01, handL: "relaxed", handR: "relaxed", ...hands, face: { brow: 0.2, lid: 0.15, ...hands.face } });
  const a = shots.length * LEN;
  shots.push({ id, a, b: a + LEN, still: LEN / 2, hide: ["merchant", "msail"], cam: () => V.cam, sun: { target: [X, 1, Z], reach: 6 },
    cast: (t) => [on("fig", D, m, t)], things: (g, c, _t, _T, cam) => thing(g, c.fig, cam) });
};
const VIEWS: [string, number][] = [["front", 0], ["side", 58]];
// what he looks at through the glass and what he aims the pistol at: far off to the side he is turned to
for (const [view, turn] of VIEWS) {
  const way = turn ? 1 : -1, SEEN: V3 = [X + way * 6, 2.5, Z + 1.2], MARK: V3 = [X + way * 6, 1.5, Z + 1.2];
  // the spyglass: at the eye, pointing where he looks, a hand on the tube and the other supporting it further out; lowered, held at its middle
  card(`spyglass-look-${view}`, CUSTOMS_D, 1.9, turn, (s) => ({ ...spyPose({ ...s, pose: { head: [turn ? 0 : 30, -8, 0] } }, SEEN), head: [turn ? 0 : 30, -8, 0] }), { handL: "grip", handR: "grip", face: { shut: spyEye(V.cam, [X - way * 0.25, 1.7, Z], SEEN, V.toward(X - way * 0.25, Z, turn)), lid: 0.7, brow: -0.2 } }, (g, a, cam) => spy(g, GLASS(), a, cam, SEEN), -way * 0.25);
  card(`spyglass-lowered-${view}`, CUSTOMS_D, 1.9, turn, () => usePose(SPYGLASS, "lowered", "R"), { handR: "grip" }, (g, a, cam) => wield(g, GLASS_MID(), SPYGLASS, "lowered", a, "R", cam));
  // the pistol: aimed along the arm, away from him; lowered, pointing down and forward
  card(`pistol-aim-${view}`, SHIPOWNER_D, 1.7, turn, (s) => aimPose(s, MARK, "R"), { handR: "grip" }, (g, a, cam) => wield(g, PISTOL_O(), PISTOL, "aim", a, "R", cam), -way * 0.47);
  card(`pistol-lowered-${view}`, SHIPOWNER_D, 1.7, turn, () => usePose(PISTOL, "lowered", "R"), { handR: "grip" }, (g, a, cam) => wield(g, PISTOL_O(), PISTOL, "lowered", a, "R", cam));
  // the sabre: in the hand at the ready and raised; lowered; and in its scabbard at the hip
  card(`sabre-ready-${view}`, PIRATE_D, 1.8, turn, () => usePose(SABRE, "ready", "R"), { handR: "grip" }, (g, a, cam) => wield(g, SABRE_O(), SABRE, "ready", a, "R", cam));
  card(`sabre-raised-${view}`, PIRATE2_D, 1.9, turn, () => usePose(SABRE, "raised", "R"), { handR: "grip" }, (g, a, cam) => wield(g, SABRE_O(), SABRE, "raised", a, "R", cam));
  card(`sabre-lowered-${view}`, PIRATE_D, 1.8, turn, () => usePose(SABRE, "lowered", "R"), { handR: "grip" }, (g, a, cam) => wield(g, SABRE_O(), SABRE, "lowered", a, "R", cam));
  card(`sabre-sheathed-${view}`, PIRATE2_D, 1.9, turn, () => (turn ? {} : { armL: [[18, 30], [26, 22]] }), {}, (g, a, cam) => sheathed(g, SCAB(), a, "L", cam));
  // the mug: by its ear, upright; lowered at his side, still upright
  card(`mug-hold-${view}`, SAILOR_D, 1.82, turn, () => usePose(MUG, "hold", "R"), { handR: "grip" }, (g, a, cam) => wield(g, MUG_O(), MUG, "hold", a, "R", cam));
  card(`mug-lowered-${view}`, SAILOR_D, 1.82, turn, () => usePose(MUG, "lowered", "R"), { handR: "grip" }, (g, a, cam) => wield(g, MUG_O(), MUG, "lowered", a, "R", cam));
}
export const GRIP_SHEET: Film = {
  id: "grip-sheet", fps: 30, seconds: shots.length * LEN, sky: "#a9dcff", world: flagSea, shots, words: [],
  hook: { text: [""], a: -1, b: -0.5 },
};

// ---------------- sheet 2: the two corrections of sheet 1, and every other thing held in the films in work ----------------
const shots2: Shot[] = [];
type Fig = { D: Design; h: number; dx?: number; turn: number; pose: (s: Stand) => Partial<Pose>; hands?: { handL?: HandKind; handR?: HandKind }; face?: Face };
const REST: [[number, number], [number, number]] = [[16, 12], [34, 6]];
/** one picture with one or more figures at the mark, each turned `turn` degrees from facing the lens, posed for where he stands */
const card2 = (id: string, figs: Fig[], thing: (g: THREE.Group, c: Staged[], cam: Cam) => void, W = V) => {
  const ms = figs.map((f) => { const x = X + (f.dx ?? 0), heading = W.toward(x, Z, f.turn), m = mover(f.D, f.h, x, Z, heading); m.stand(9);
    m.actAt(-1, { armL: REST, armR: REST, ...f.pose({ D: f.D, at: [x, 0, Z], heading, h: f.h, cam: W.cam }) }, 10, { in: 0.01, handL: "relaxed", handR: "relaxed", ...f.hands, face: { brow: 0.2, lid: 0.15, ...f.face } }); return { f, m }; });
  const a = shots2.length * LEN;
  shots2.push({ id, a, b: a + LEN, still: LEN / 2, hide: ["merchant", "msail"], cam: () => W.cam, sun: { target: [X, 1, Z], reach: 6 },
    cast: (t) => ms.map(({ f, m }, i) => on(`f${i}`, f.D, m, t)), things: (g, c, _t, _T, cam) => thing(g, ms.map((_, i) => c[`f${i}`]), cam) });
};
const both = (make: (view: string, turn: number, way: number) => void) => { for (const [view, turn] of VIEWS) make(view, turn, turn ? 1 : -1); };
const R1 = { handR: "grip" as HandKind }, L1 = { handL: "grip" as HandKind }, LR = { handL: "grip" as HandKind, handR: "grip" as HandKind };
const SAB2 = once(() => noShade(sabre(0.6))), SCAB2 = once(() => noShade(scabbard(0.5))), PISTOL2 = once(() => { const p = noShade(pistolHeld()); p.scale.setScalar(0.7); return p; });
const BUCKET_O = once(() => noShade(bucketHeld(0.3))), LINSTOCK_O = once(() => noShade(linstock(0.9))), CHEST_O = once(() => chest(false, false, 0.62, 0.36, 0.4)), MUG_DROP = once(() => noShade(mugHeld(0.14)));
const FID_PLAY = once(() => noShade(fiddleByNeck(0.6))), FID_NECK = once(() => noShade(fiddleByNeck(0.6))), BOW_O = once(() => noShade(fiddleBow(0.62))), CITH = once(() => noShade(cithara(0.62))), GRAPE = once(() => noShade(grapes(0.032)));
const BUNDLE_O = once(() => noShade(bundleHeld(0.2))), BLOCK = once(() => noShade(group([mesh(box(0.12, 0.2, 0.08), "#7a5a36", { at: [0, 0, 0], line: 0.7, shadow: false })])));
// the corrections: the pistol in one piece with his eyes on what he aims at; the scabbard held by a baldric
both((view, turn, way) => card2(`pistol-aim-${view}`, [{ D: SHIPOWNER_D, h: 1.7, dx: -way * 0.47, turn, pose: (s) => aimPose(s, [X + way * 6, 1.5, Z + 1.2], "R"), hands: R1 }], (g, [a], cam) => wield(g, PISTOL2(), PISTOL, "aim", a, "R", cam)));
both((view, turn) => card2(`pistol-lowered-${view}`, [{ D: SHIPOWNER_D, h: 1.7, turn, pose: () => usePose(PISTOL, "lowered", "R"), hands: R1 }], (g, [a], cam) => wield(g, PISTOL2(), PISTOL, "lowered", a, "R", cam)));
both((view, turn) => card2(`sabre-sheathed-${view}`, [{ D: PIRATE2_D, h: 1.9, turn, pose: () => (turn ? {} : { armL: [[18, 30], [26, 22]] }) }], (g, [a], cam) => sheathed(g, SCAB2(), a, "L", cam)));
// the hanger as it cuts the halyard: drawn back, and through
both((view, turn) => card2(`sabre-chop-${view}`, [{ D: CAPTAIN_D, h: 1.86, turn, pose: () => usePose(SABRE, "chop", "R"), hands: R1, face: { brow: -0.8, lid: 0, mouth: 0.4 } }], (g, [a], cam) => wield(g, SAB2(), SABRE, "chop", a, "R", cam)));
both((view, turn) => card2(`sabre-struck-${view}`, [{ D: CAPTAIN_D, h: 1.86, turn, pose: () => ({ ...usePose(SABRE, "struck", "R"), lean: 8 }), hands: R1, face: { brow: -0.8, lid: 0.1 } }], (g, [a], cam) => wield(g, SAB2(), SABRE, "struck", a, "R", cam)));
// the bucket by its bail
both((view, turn) => card2(`bucket-carry-${view}`, [{ D: COOK_D, h: 1.72, turn, pose: () => usePose(BUCKET, "carry", "R"), hands: R1 }], (g, [a], cam) => wield(g, BUCKET_O(), BUCKET, "carry", a, "R", cam)));
both((view, turn) => card2(`bucket-raised-${view}`, [{ D: COOK_D, h: 1.72, turn, pose: (s) => liftPose(s, "R", 0.42, 0.58), hands: R1, face: { wide: 1, lid: 0, brow: 1, mouth: 0.6 } }], (g, [a], cam) => wield(g, BUCKET_O(), BUCKET, "raised", a, "R", cam)));
// a rope hauled hand over hand, down from a block
both((view, turn, way) => { const top: V3 = [X + (turn ? 0.55 : 0.12), 3.3, Z + 0.25]; card2(`rope-haul-${view}`, [{ D: SAILOR_D, h: 1.82, turn, pose: (s) => ({ ...haulPose(s, top), lean: -10 }), hands: LR, face: { brow: -0.6, lid: 0.3, mouth: 0.3 } }], (g, [a], cam) => { haul(g, a, cam, top, 0); const b = BLOCK(); b.position.set(top[0], top[1] + 0.1, top[2]); g.add(b); }); void way; });
// the linstock: put to the gun, and held ready
both((view, turn) => card2(`linstock-fire-${view}`, [{ D: GUNNER_D, h: 1.76, turn, pose: () => ({ ...usePose(LINSTOCK, "fire", "R"), lean: 10 }), hands: R1 }], (g, [a], cam) => wield(g, LINSTOCK_O(), LINSTOCK, "fire", a, "R", cam)));
both((view, turn) => card2(`linstock-ready-${view}`, [{ D: GUNNER_D, h: 1.76, turn, pose: () => usePose(LINSTOCK, "ready", "R"), hands: R1 }], (g, [a], cam) => wield(g, LINSTOCK_O(), LINSTOCK, "ready", a, "R", cam)));
// the chest by its two end handles, between two men walking one behind the other
for (const [view, turn] of [["side", 90], ["front", 40]] as [string, number][]) {
  const k = turn === 90 ? 1 : 0.8, H: V3[] = [[X - 0.394 * k, 0.86, Z], [X + 0.394 * k, 0.86, Z]];
  card2(`chest-carry-${view}`, [{ D: DOCKER_D, h: 1.9, dx: -0.62 * k, turn, pose: (s) => ({ ...reach(s, "R", H[0]), lean: -4 }), hands: R1, face: { brow: -0.6, mouth: 0.3 } }, { D: DOCKHAND_D, h: 1.7, dx: 0.6 * k, turn, pose: (s) => ({ ...reach(s, "R", H[1]), lean: 6 }), hands: R1, face: { brow: -0.6, mouth: 0.3 } }],
    (g, [a, b], cam) => carryBy(g, CHEST_O(), a, "R", b, "R", cam));
}
// the mug that is let go: in his hand, falling, down on the deck
const LOW = lens(X, 1.05, Z + 2.6, 0, -1, -13, 52);      // the mug's pictures look lower, so that the deck it lands on is in them
card2("mug-hand-side", [{ D: SAILOR_D, h: 1.82, turn: 58, pose: () => usePose(MUG, "hold", "R"), hands: R1 }], (g, [a], cam) => wield(g, MUG_DROP(), MUG, "hold", a, "R", cam), LOW);
for (const [id, tt] of [["mug-falling-side", 0.3], ["mug-landed-side", 1.4]] as [string, number][]) card2(id, [{ D: SAILOR_D, h: 1.82, turn: 58, pose: () => usePose(MUG, "hold", "R"), hands: { handR: "open" }, face: { wide: 1, lid: 0, brow: 1, mouth: 0.5, gaze: [0.3, 0.9] } }],
  (g, [a], cam) => { letGo(g, MUG_DROP(), MUG, near(palm(a, "R"), cam, 0.05), [0, 0, 0], tt, 0, cam, { centre: [0.07, 0], r: 0.065, spin: 0.6, rests: [0, -90] }); }, LOW);
// the fiddle and its bow: played, and lowered (the fiddle by its neck, the bow by its frog)
both((view, turn) => card2(`fiddle-play-${view}`, [{ D: NERO_D, h: 1.74, turn, pose: (s) => fiddlePose(s), hands: LR, face: { lid: 0.5, brow: 0.6, smile: 0.5 } }], (g, [a], cam) => fiddlePlay(g, FID_PLAY(), BOW_O(), a, cam)));
both((view, turn) => card2(`fiddle-lowered-${view}`, [{ D: NERO_D, h: 1.74, turn, pose: () => ({ ...usePose(FIDDLE, "lowered", "L"), ...usePose(BOW, "lowered", "R") }), hands: LR }], (g, [a], cam) => { wield(g, FID_NECK(), FIDDLE, "lowered", a, "L", cam); wield(g, BOW_O(), BOW, "lowered", a, "R", cam); }));
// the cithara: held against his side, and played
both((view, turn) => card2(`cithara-hold-${view}`, [{ D: NERO_STAGE_D, h: 1.74, turn, pose: (s) => citharaPose(s, false), hands: L1 }], (g, [a], cam) => citharaHold(g, CITH(), a, cam, false)));
both((view, turn) => card2(`cithara-play-${view}`, [{ D: NERO_STAGE_D, h: 1.74, turn, pose: (s) => citharaPose(s, true), hands: { handL: "grip", handR: "open" }, face: { lid: 0.4, smile: 0.4 } }], (g, [a], cam) => citharaHold(g, CITH(), a, cam, true)));
// grapes by the stalk: held up, and lowered
both((view, turn) => card2(`grapes-hold-${view}`, [{ D: ROMAN_WOMAN2_D, h: 1.64, turn, pose: () => usePose(GRAPES, "hold", "R"), hands: R1, face: { smile: 0.5 } }], (g, [a], cam) => wield(g, GRAPE(), GRAPES, "hold", a, "R", cam)));
both((view, turn) => card2(`grapes-lowered-${view}`, [{ D: ROMAN_WOMAN2_D, h: 1.64, turn, pose: () => usePose(GRAPES, "lowered", "R"), hands: R1 }], (g, [a], cam) => wield(g, GRAPE(), GRAPES, "lowered", a, "R", cam)));
// the bundle: over the shoulder, and in the hand
both((view, turn) => card2(`bundle-shoulder-${view}`, [{ D: CITIZEN_D, h: 1.76, turn, pose: (s) => shoulderPose(s, "R"), hands: R1 }], (g, [a], cam) => onShoulder(g, BUNDLE_O(), a, "R", cam)));
both((view, turn) => card2(`bundle-carry-${view}`, [{ D: CITIZEN_D, h: 1.76, turn, pose: () => usePose(BUNDLE, "carry", "R"), hands: R1 }], (g, [a], cam) => wield(g, inHand(BUNDLE_O()), BUNDLE, "carry", a, "R", cam)));
export const GRIP_SHEET_2: Film = { ...GRIP_SHEET, id: "grip-sheet-2", seconds: shots2.length * LEN, shots: shots2 };

// ---------------- sheet 3: the sabre as a person holds it, its draw in three steps, and the spyglass at the eye we see ----------------
const shots3: Shot[] = [];
const card3 = (id: string, figs: Fig[], thing: (g: THREE.Group, c: Staged[], cam: Cam) => void) => { const before = shots2.length; card2(id, figs, thing); const s = shots2.pop()!; void before; const a = shots3.length * LEN; shots3.push({ ...s, a, b: a + LEN }); };
const SAB3 = once(() => noShade(sabre(0.6))), SCAB3 = once(() => noShade(scabbard(0.5))), GLASS3 = once(() => { const s = noShade(spyglass()); s.scale.setScalar(1.2); return s; });
both((view, turn) => card3(`sabre-ready-${view}`, [{ D: PIRATE_D, h: 1.8, turn, pose: () => usePose(SABRE, "ready", "R"), hands: R1, face: { brow: -0.6 } }], (g, [a], cam) => wield(g, SAB3(), SABRE, "ready", a, "R", cam)));
// the draw only where it can be read: at a slant from the scabbard's side (the hand crosses his belly to the hilt, the blade comes out
// forward along the sheath, clear of his face)
const DRAW_VIEWS: [string, number][] = [["scab", -28]];
for (const [k, n] of [[0, 1], [0.45, 2], [0.85, 3]] as [number, number][]) for (const [view, turn] of DRAW_VIEWS) card3(`sabre-draw${n}-${view}`, [{ D: CAPTAIN_D, h: 1.86, turn, pose: (s) => { const body = { twist: 6 + 36 * k, lean: -10 * k }; return { ...drawPose({ ...s, pose: body }, "L", k), ...body }; }, hands: LR, face: { brow: -0.8, lid: 0.1 } }], (g, [a], cam) => drawSabre(g, SAB3(), SCAB3(), a, "L", cam, k));
both((view, turn) => card3(`sabre-raised-${view}`, [{ D: PIRATE2_D, h: 1.9, turn, pose: () => usePose(SABRE, "raised", "R"), hands: R1, face: { brow: -0.8, mouth: 0.5 } }], (g, [a], cam) => wield(g, SAB3(), SABRE, "raised", a, "R", cam)));
both((view, turn) => card3(`sabre-lowered-${view}`, [{ D: PIRATE_D, h: 1.8, turn, pose: () => ({ ...usePose(SABRE, "lowered", "R"), armL: [[-16, 14], [-8, 12]] }), hands: R1 }], (g, [a], cam) => wield(g, SAB3(), SABRE, "lowered", a, "R", cam)));
both((view, turn) => card3(`sabre-sheathed-${view}`, [{ D: PIRATE2_D, h: 1.9, turn, pose: () => (turn ? {} : { armL: [[18, 30], [26, 22]] }) }], (g, [a], cam) => sheathed(g, SCAB3(), a, "L", cam)));
// the spyglass only with his head turned to what he looks at: seen from the side, looking either way
for (const [view, turn, way] of [["right", 58, 1], ["left", -58, -1]] as [string, number, number][]) { const seen: V3 = [X + way * 6, 1.95, Z + 1.2], dx = -way * 0.25;
  card3(`spyglass-look-${view}`, [{ D: CUSTOMS_D, h: 1.9, dx, turn, pose: (s) => spyPose(s, seen), hands: LR, face: { shut: spyEye(V.cam, [X + dx, 0, Z], seen, V.toward(X + dx, Z, turn)), lid: 0.7, brow: -0.3 } }], (g, [a], cam) => spy(g, GLASS3(), a, cam, seen)); }
export const GRIP_SHEET_3: Film = { ...GRIP_SHEET, id: "grip-sheet-3", seconds: shots3.length * LEN, shots: shots3 };

// ---------------- a look sheet: Blackbeard, his beard up to his eyes in ribboned tails, and the lit matches under his hat ----------------
const shotsBB: Shot[] = [];
const cardBB = (id: string, figs: Fig[], thing: (g: THREE.Group, c: Staged[], cam: Cam) => void) => { card2(id, figs, thing); const s = shotsBB.length * LEN, sh = shots2.pop()!; shotsBB.push({ ...sh, a: s, b: s + LEN }); };
for (const [view, turn] of [["front", 0], ["slant", 28], ["side", 58], ["otherside", -50]] as [string, number][])
  cardBB(`blackbeard-look-${view}`, [{ D: BLACKBEARD_D, h: 1.92, turn, pose: () => ({ armL: [[14, 22], [30, 18]], armR: [[14, 22], [30, 18]] }), face: { brow: -0.9, lid: 0.15, smile: 0.25 } }], (g, [a], cam) => fuseSmoke(g, a, 1.3 + turn * 0.01, cam));
export const LOOK_BLACKBEARD: Film = { ...GRIP_SHEET, id: "look-blackbeard", seconds: shotsBB.length * LEN, shots: shotsBB };

// ---------------- a look sheet: "you", the lookout of the long video, from four sides and beside Sir Digsworth ----------------
const shotsYou: Shot[] = [];
const cardYou = (id: string, figs: Fig[]) => { card2(id, figs, () => {}); const s = shotsYou.length * LEN, sh = shots2.pop()!; shotsYou.push({ ...sh, a: s, b: s + LEN }); };
const YOU_REST = { armL: [[12, 16], [22, 12]] as [[number, number], [number, number]], armR: [[12, 16], [22, 12]] as [[number, number], [number, number]] }, YOU_FACE: Face = { brow: 0.3, lid: 0.1, smile: 0.35 };
for (const [view, turn] of [["front", 0], ["slant", 28], ["side", 58], ["back", 180]] as [string, number][]) cardYou(`you-look-${view}`, [{ D: YOU_D, h: 1.76, turn, pose: () => YOU_REST, face: YOU_FACE }]);
const CLOSE = { armL: [[8, 7], [14, 5]] as [[number, number], [number, number]], armR: [[8, 7], [14, 5]] as [[number, number], [number, number]] };
cardYou("you-with-sir", [{ D: YOU_D, h: 1.76, dx: -0.42, turn: 24, pose: () => CLOSE, face: YOU_FACE }, { D: SIR_D, h: 1.8, dx: 0.42, turn: -24, pose: () => CLOSE, face: { brow: 0.4, smile: 0.4 } }]);
// (the checked shirt was the other choice put to Jesper; he chose the white shirt, so it is no longer on the sheet)
export const LOOK_YOU: Film = { ...GRIP_SHEET, id: "look-you", seconds: shotsYou.length * LEN, shots: shotsYou };

// ---------------- sheet 4: the arena: the gladius and the shield, the trident and the net, the referee's stick ----------------
const shots4: Shot[] = [];
const card4 = (id: string, figs: Fig[], thing: (g: THREE.Group, c: Staged[], cam: Cam) => void, W = V) => { card2(id, figs, thing, W); const s = shots2.pop()!, a = shots4.length * LEN; shots4.push({ ...s, a, b: a + LEN }); };
const GLAD = once(() => noShade(gladius(0.5))), SCUTUM = once(() => noShade(scutum())), TRI = once(() => noShade(trident(1.6))), NETB = once(() => noShade(netBunch(0.17))), STICK_O = once(() => noShade(refStick(1.35)));
const WIDE = lens(X, 1.2, Z + 2.3, 0, -1, -2, 80);      // a trident is longer than a man is tall: a wider lens, still on the main deck
/** a point beside a figure standing at `at` and facing `heading`: `r` metres to his right, `f` forward, `up` high */
const by = (at: V3, heading: number, r: number, f: number, up: number): V3 => { const h = (heading * Math.PI) / 180; return [at[0] - Math.cos(h) * r + Math.sin(h) * f, at[1] + up, at[2] + Math.sin(h) * r + Math.cos(h) * f]; };
const MUR: Omit<Fig, "turn" | "pose"> = { D: MURMILLO_D, h: 1.84, hands: LR, face: { brow: -0.7, lid: 0.15 } };
// the gladius in his right fist with the shield on his left arm: at the ready, thrust, lowered
for (const [view, turn] of [...VIEWS, ["otherside", -58], ["back", 180]] as [string, number][]) {
  card4(`gladius-ready-${view}`, [{ ...MUR, turn, pose: () => ({ ...usePose(GLADIUS, "ready", "R"), armL: SHIELD_ARM }) }], (g, [a], cam) => { wield(g, GLAD(), GLADIUS, "ready", a, "R", cam); shieldOn(g, SCUTUM(), a, "L", cam); }, WIDE);
  if (view === "back") continue;
  card4(`gladius-thrust-${view}`, [{ ...MUR, turn, pose: () => ({ ...usePose(GLADIUS, "thrust", "R"), armL: SHIELD_ARM, lean: 8 }) }], (g, [a], cam) => { wield(g, GLAD(), GLADIUS, "thrust", a, "R", cam); shieldOn(g, SCUTUM(), a, "L", cam); }, WIDE);
  card4(`gladius-lowered-${view}`, [{ ...MUR, turn, pose: () => ({ ...usePose(GLADIUS, "lowered", "R"), armL: SHIELD_ARM }) }], (g, [a], cam) => { wield(g, GLAD(), GLADIUS, "lowered", a, "R", cam); shieldOn(g, SCUTUM(), a, "L", cam); }, WIDE);
}
// the trident: thrust in both hands (the rear hand at his hip), and held up in one; the net gathered in a fist, carried and swung back
const RET: Omit<Fig, "turn" | "pose"> = { D: RETIARIUS_D, h: 1.86, hands: LR, face: { brow: -0.6, lid: 0.1 } };
for (const [view, turn] of [["slant", 30], ["side", 58]] as [string, number][]) {
  card4(`trident-thrust-${view}`, [{ ...RET, dx: -0.62, turn, pose: (s) => polePose(s, "R", by(s.at, s.heading, 0.14, 0.16, 0.98), by(s.at, s.heading, 0.1, 3, 1.5), 0.5) }],
    (g, [a], cam) => pole(g, TRI(), a, cam, "R", by(a.at, a.heading, 0.1, 3, 1.5), { len: 1.9, name: "trident" }), WIDE);
}
both((view, turn) => {
  card4(`trident-ready-${view}`, [{ ...RET, turn, pose: () => ({ ...usePose(TRIDENT, "ready", "L"), ...usePose(NET, "carry", "R") }) }], (g, [a], cam) => { wield(g, TRI(), TRIDENT, "ready", a, "L", cam, { at: 0.75 }); wield(g, NETB(), NET, "carry", a, "R", cam); }, WIDE);
  card4(`net-swing-${view}`, [{ ...RET, turn, pose: () => ({ ...usePose(NET, "swing", "R"), ...usePose(TRIDENT, "ready", "L") }) }], (g, [a], cam) => { wield(g, NETB(), NET, "swing", a, "R", cam); wield(g, TRI(), TRIDENT, "ready", a, "L", cam, { at: 0.75 }); }, WIDE);
});
// the referee's stick: upright in one hand, and across in both, the way he parts two fighters
const REF: Omit<Fig, "turn" | "pose"> = { D: REFEREE_D, h: 1.74, hands: LR, face: { brow: 0.4 } };
both((view, turn) => {
  card4(`stick-ready-${view}`, [{ ...REF, turn, pose: () => usePose(STICK, "ready", "R") }], (g, [a], cam) => wield(g, STICK_O(), STICK, "ready", a, "R", cam, { at: 0.4 }));
  card4(`stick-across-${view}`, [{ ...REF, turn: turn ? 30 : 0, pose: (s) => polePose(s, "L", by(s.at, s.heading, -0.24, 0.3, 1.12), by(s.at, s.heading, 3, 0.3, 1.12), 0.48) }],
    (g, [a], cam) => pole(g, STICK_O(), a, cam, "L", by(a.at, a.heading, 3, 0.3, 1.12), { back: 0.36, len: 1.35, name: "stick" }));
});
export const GRIP_SHEET_4: Film = { ...GRIP_SHEET, id: "grip-sheet-4", seconds: shots4.length * LEN, shots: shots4 };

// ---------------- sheet 5: Blackbeard getting ready, the gladiators' school and the stands ----------------
const shots5: Shot[] = [];
const card5 = (id: string, figs: Fig[], thing: (g: THREE.Group, c: Staged[], cam: Cam) => void, W = V) => { card2(id, figs, thing, W); const s = shots2.pop()!, a = shots5.length * LEN; shots5.push({ ...s, a, b: a + LEN }); };
// (13 cm up, 16 cm down: the drawn fist is 11 cm high, and a 17 cm fuse hardly showed out of it)
const FUSE_UP = once(() => noShade(fuseCord(0.13))), FUSE_DOWN = once(() => noShade(fuseCord(0.16)));
const RIB = once(() => noShade(ribbonBow("#2f6fb0", 1.3))), TRAY_O = once(() => tray()), SPILL_O = once(() => noShade(spill())), FUSE_O = once(() => noShade(fuseCord())), FUSE_LIT = once(() => noShade(fuseCord(0.17, true)));
const SLING_O = once(() => pistolSling(0.62)), BOOK_O = once(() => openBook()), WOOD = once(() => noShade(woodSword())), STRETCH = once(() => stretcher(1.9)), SCUTUM5 = once(() => noShade(scutum()));
const BOWL_O = once(() => noShade(bowlRim())), SPOON_O = once(() => noShade(spoon())), ROLL_O = once(() => noShade(bandageRoll())), COIN_O = once(() => noShade(coinHeld(0.04))), MAPPA_O = once(() => noShade(mappa()));
const PEN_O = once(() => noShade(reedPen())), SCROLL_O = once(() => noShade(scrollHeld())), OLIVE_O = once(() => noShade(olive())), OLIVES = once(() => noShade(bowlRim(0.07, true))), BENCH = once(() => bench(1.6));
/** which way (+1 right, -1 left in the picture) a figure's right shoulder lies from his left */
export const rightWay = (s: Stand) => { const j = jointsOf(s), r = aside([0, 0, 0], s.cam, 1); return Math.sign((j("shR")[0] - j("shL")[0]) * r[0] + (j("shR")[2] - j("shL")[2]) * r[2]) || -1; };
/** the glow at the lit end of a held thing (a prop with userData.tip) */
const tipGlow = (g: THREE.Group, o: THREE.Object3D, cam: Cam, w = 0.12) => { o.updateMatrixWorld(true); const q = new THREE.Vector3(...(o.userData.tip as V3)).applyMatrix4(o.matrixWorld); glow(g, [q.x, q.y, q.z], w, w, 0, Math.atan2(cam.pos[0] - q.x, cam.pos[2] - q.z)); };
/** the two hands of a figure on a thing carried before his chest, `half` metres to each side of its middle, `up` of the way from his
 *  pelvis to his neck and `fwd` metres in front of him */
export const twoHands = (s: Stand, up = 0.45, half = 0.25, fwd = 0.18): Partial<Pose> => { const j = jointsOf(s), c = near(mix3(j("pelvis"), j("neck"), up), s.cam, fwd), w = rightWay(s); return { ...reach(s, "R", aside(c, s.cam, w * half)), ...reach(s, "L", aside(c, s.cam, -w * half)) }; };
const GUARD5 = {};
const FIERCE: Face = { brow: -0.9, lid: 0.15, smile: -0.3, mouth: 0 };
export const SIT: Partial<Pose> = { py: -0.5, legL: { th: [86, 6], sh: [4, 4] }, legR: { th: [86, -6], sh: [4, -4] } };
const standAt = (D: Design, dx: number, turn: number, h: number, pose: Partial<Pose>, W = V): Stand => { const x = X + dx; return { D, at: [x, 0, Z], heading: W.toward(x, Z, turn), h, cam: W.cam, pose: { armL: REST, armR: REST, ...pose } }; };

// Blackbeard: a ribbon tied round a tail of his beard, the boy's tray of ribbons, the spill lit at the lantern, a fuse tucked under the
// hat, the sling lifted, a lit fuse blown on (the sling on his chest), the book read out on deck
both((view, turn) => card5(`ribbon-tie-${view}`, [{ D: BLACKBEARD_PREP_D, h: 1.92, turn, pose: (s) => { const j = jointsOf(s), w = rightWay(s), c = near(mix3(j("neck"), j("pelvis"), 0.16), s.cam, 0.16); return { ...reach(s, "R", aside(c, s.cam, w * 0.02)), ...reach(s, "L", aside(c, s.cam, -w * 0.06, 0.04)), head: [0, 12, 0] }; }, hands: LR, face: { ...FIERCE, lid: 0.45, gaze: [0, 0.9] } }],
  (g, [a], cam) => { wield(g, RIB(), RIBBON, "tie", a, "R", cam, { d: 0.14 }); }));
both((view, turn) => card5(`tray-carry-${view}`, [{ D: SHIPBOY_D, h: 1.28, turn, pose: (s) => twoHands(s, 0.5, 0.25, 0.2), hands: LR, face: { wide: 0.6, brow: 0.7, lid: 0 } }],
  (g, [a], cam) => { carryBy(g, TRAY_O(), a, "L", a, "R", cam); TRAY_O().rotateX(0.55); }));
both((view, turn) => card5(`spill-light-${view}`, [{ D: SHIPBOY_D, h: 1.28, turn, pose: () => usePose(SPILL, "light", "R"), hands: R1, face: { wide: 0.8, brow: 1, lid: 0, mouth: 0.3 } }],
  (g, [a], cam) => { wield(g, SPILL_O(), SPILL, "light", a, "R", cam); tipGlow(g, SPILL_O(), cam); }));
// the fuse is pushed up under the brim: the fist round its middle just below the brim at his temple, its upper half going up behind the
// hat (behind his card, so that the hat hides its top end) and its lower half hanging by his cheek in front of him, as it then hangs in
// the films (version 2: drawn as two halves, since one cord behind his card hid the lower half too)
both((view, turn) => card5(`fuse-tuck-${view}`, [{ D: BLACKBEARD_PREP_D, h: 1.92, turn, pose: (s) => { const j = jointsOf(s), w = rightWay(s); return { ...reach(s, "R", aside(near(j("skull"), s.cam, 0.06), s.cam, w * 0.25, 0.22)), head: [0, 4, 0] }; }, hands: R1, face: FIERCE }],
  (g, [a], cam) => { wield(g, FUSE_UP(), FUSE, "tuck", a, "R", cam, { d: -0.05, at: 0 }); wield(g, FUSE_DOWN(), FUSE, "tuck", a, "R", cam, { d: 0.03, at: 0.16 }); }));
both((view, turn) => card5(`sling-lift-${view}`, [{ D: BLACKBEARD_D, h: 1.92, turn, pose: (s) => ({ ...twoHands(s, 0.62, 0.32, 0.22), head: [0, 10, 0] }), hands: LR, face: FIERCE }],
  (g, [a], cam) => { carryBy(g, SLING_O(), a, "L", a, "R", cam); fuseSmoke(g, a, 1, cam); }));
both((view, turn) => card5(`fuse-blow-${view}`, [{ D: BLACKBEARD_ARMED_D, h: 1.92, turn, pose: (s) => { const j = jointsOf(s), w = rightWay(s), m = mix3(j("neck"), j("skull"), 0.5); return reach(s, "R", aside(near(m, s.cam, 0.14), s.cam, w * 0.05, -0.16)); }, hands: R1, face: { brow: -0.4, lid: 0.3, mouth: 0, smile: -0.3 } }],
  (g, [a], cam) => { wield(g, FUSE_LIT(), FUSE, "blow", a, "R", cam); tipGlow(g, FUSE_LIT(), cam, 0.16); fuseSmoke(g, a, 1, cam); }));
both((view, turn) => card5(`book-read-${view}`, [{ D: OLDHAND_D, h: 1.74, turn, pose: (s) => ({ ...twoHands(s, 0.66, 0.27, 0.24), head: [0, 8, 0] }), hands: LR, face: { brow: 0.8, lid: 0.1, mouth: 0.5 } }],
  (g, [a], cam) => { carryBy(g, BOOK_O(), a, "L", a, "R", cam); }));

// the gladiators: the practice sword with the trainer's hand on the pupil's wrist, the stretcher, the bowl and the spoon on the bench,
// the bandage, the coin, the sponsor's cloth, the pen and the scroll, the olive, the hands that pull the beaten man up, a hand on a
// shoulder
for (const [view, tp, tt] of [["front", 40, -40], ["side", 62, -62]] as [string, number, number][]) { const pup = standAt(PUPIL_D, -0.3, tp, 1.76, usePose(WOODSWORD, "guard", "R"));
  card5(`woodsword-guard-${view}`, [{ D: PUPIL_D, h: 1.76, dx: -0.3, turn: tp, pose: () => usePose(WOODSWORD, "guard", "R"), hands: R1, face: { brow: 0.6, lid: 0.1, mouth: 0.2 } },
    { D: TRAINER_D, h: 1.8, dx: 0.3, turn: tt, pose: (s) => ({ ...reach(s, "L", near(jointsOf(pup)("wrR"), s.cam, 0.08)), lean: 8 }), hands: { handL: "grip" }, face: { brow: -0.6, lid: 0.2 } }],
    (g, [p, t], cam) => { wield(g, WOOD(), WOODSWORD, "guard", p, "R", cam); handOn(t, "L", p, "wrR", cam, "wrist"); }); }
{ const W2 = lens(X, 1.4, Z + 3.0, 0, -1, -2, 70), hy = 0.8, ms = [mover(BEARER_D, 1.76, X - 0.95, Z, 90), mover(BEARER2_D, 1.74, X + 0.95, Z, 90), mover(CARRIED_D, 1.8, X + 0.05, Z - 0.28, 90)];      // on the main deck (further back the lens is outside the ship)
  for (const m of ms) m.stand(9);
  const st = (D: Design, m: MM, x: number): Stand => ({ D, at: [x, 0, Z], heading: 90, h: m.h, cam: W2.cam });
  // each bearer holds the near pole in his near (right) hand: the rear one in front of his hip, the front one behind his
  ms[0].actAt(-1, { ...reach(st(BEARER_D, ms[0], X - 0.95), "R", [X - 0.89, hy, Z + 0.08]), armL: [[10, 8], [20, 4]] }, 10, { in: 0.01, handR: "grip", handL: "relaxed", face: { brow: 0.4, lid: 0.2 } });
  ms[1].actAt(-1, { ...reach(st(BEARER2_D, ms[1], X + 0.95), "R", [X + 0.89, hy, Z + 0.08]), armL: [[10, 8], [20, 4]] }, 10, { in: 0.01, handR: "grip", handL: "relaxed", face: { brow: 0.4, lid: 0.2 } });
  // the tenth sits up on it, leaning back on his left arm, waving to the stands with his right; his shin is bandaged
  ms[2].actAt(-1, { py: -1, lean: -18, legL: { th: [88, 4], sh: [90, 2] }, legR: { th: [86, -2], sh: [88, 0] }, armL: [[-24, 18], [-14, 10]], armR: [[150, 26], [172, 10]], head: [-34, -4, 0] }, 10, { in: 0.01, handL: "open", handR: "open", face: { brow: 0.4, lid: 0.4, smile: 0.3 } });
  const a0 = shots5.length * LEN;
  shots5.push({ id: "stretcher-carry-side", a: a0, b: a0 + LEN, still: LEN / 2, hide: ["merchant", "msail"], cam: () => W2.cam, sun: { target: [X, 1, Z], reach: 6 },
    cast: (t) => [on("b0", BEARER_D, ms[0], t), on("b1", BEARER2_D, ms[1], t), play("man", CARRIED_D, ms[2], t, [0, hy + 0.02, 0], ms[2].h, { blink: false })],
    things: (g, c, _t, _T, cam) => { carryBy(g, STRETCH(), c.b0, "R", c.b1, "R", cam, 0.02); } }); }
/** which of a figure's hands is the nearer to the lens (the one that shows when he is seen from the side): facing to the right of the
 *  picture his right hand is toward us, facing to the left his left; seen from the front, the left */
export const nearHand = (heading: number, cam: Cam): "L" | "R" => { const h = (heading * Math.PI) / 180, r = aside([0, 0, 0], cam, 1), f = Math.sin(h) * r[0] + Math.cos(h) * r[2]; return f > 0.3 ? "R" : "L"; };
/** the hands of a figure eating: the nearer hand by the rim of a bowl at his upper chest (the bowl inward of it, below the other
 *  hand, which is at his mouth) */
export const eating = (s: Stand, base: Partial<Pose> = {}): Partial<Pose> => { const sp = { ...s, pose: base }, j = jointsOf(sp), b = nearHand(s.heading, s.cam), e = b === "L" ? "R" : "L", wb = b === "R" ? rightWay(s) : -rightWay(s), chest = mix3(j("neck"), j("pelvis"), 0.26), mouth = mix3(j("neck"), j("skull"), 0.45);
  return { ...base, ...reach(sp, b, aside(near(chest, s.cam, 0.2), s.cam, wb * 0.13, 0)), ...reach(sp, e, aside(near(mouth, s.cam, 0.14), s.cam, -wb * 0.05, -0.07)) }; };
for (const [view, turn] of [["front", 0], ["slant", 30]] as [string, number][]) (() => card5(`bowl-eat-${view}`, [{ D: MURMILLO_BARE_D, h: 1.84, turn, pose: (s) => eating(s, SIT), hands: LR, face: { brow: 0.3, lid: 0.3, mouth: 0.4, smile: 0.2 } }],
  (g, [a], cam) => { const b = BENCH(); b.position.set(X, 0, Z - 0.32); g.add(b); const h = nearHand(a.heading, cam); wield(g, BOWL_O(), BOWL, "rim", a, h, cam); wield(g, SPOON_O(), SPOON, "eat", a, h === "L" ? "R" : "L", cam); }))();
// the bandage: the gladiator holds his left forearm out to the doctor across the picture (so that the turns of linen round it show);
// the doctor holds the roll against it, the strip running from the roll onto the arm, and his other hand supports the elbow
for (const [view, tm, td] of [["front", -32, 34], ["side", -64, 62]] as [string, number, number][]) { const ARM: Partial<Pose> = { armL: [[64, 8], [88, 2]] }, mur = standAt(MURMILLO_BARE_D, 0.32, tm, 1.84, ARM);
  card5(`bandage-wrap-${view}`, [{ D: DOCTOR_D, h: 1.72, dx: -0.36, turn: td, pose: (s) => { const j = jointsOf(mur); return { ...reach(s, "R", near(mix3(j("elL"), j("wrL"), 0.55), s.cam, 0.08)), ...reach(s, "L", near([j("elL")[0], j("elL")[1] - 0.03, j("elL")[2]], s.cam, 0.06)), head: [0, 12, 0] }; }, hands: { handR: "grip", handL: "open" }, face: { brow: 0.3, lid: 0.4 } },
    { D: MURMILLO_BARE_D, h: 1.84, dx: 0.32, turn: tm, pose: () => ARM, hands: { handL: "fist" }, face: { brow: 0.2, lid: 0.3, smile: -0.2 } }],
    (g, [d, m], cam) => { wield(g, ROLL_O(), ROLL, "wrap", d, "R", cam); handOn(d, "L", m, "elL", cam, "arm"); const r = palm(d, "R"), q = mix3(m.joint("elL"), m.joint("wrL"), 0.5), s = group([mesh(box(1, 0.045, 0.004), "#f6f2e6", { at: [0.5, 0, 0], line: 0.4, shadow: false })]); span(g, s, near(r, cam, 0.06), near(q, cam, 0.06), cam, 0); s.scale.x = Math.hypot(r[0] - q[0], r[1] - q[1], r[2] - q[2]); }); }
both((view, turn) => card5(`coin-show-${view}`, [{ D: OWNER_D, h: 1.7, turn, pose: () => ({ ...usePose(COIN, "show", "R"), head: [0, 6, 0] }), hands: R1, face: { brow: 0.6, lid: 0.3, smile: 0.7 } }],
  (g, [a], cam) => { wield(g, COIN_O(), COIN, "show", a, "R", cam, { d: 0.1 }); }));
both((view, turn) => card5(`cloth-wave-${view}`, [{ D: SPONSOR_D, h: 1.76, turn, pose: () => usePose(MAPPA, "wave", "R"), hands: R1, face: { brow: 0.6, smile: 0.6, mouth: 0.3 } }],
  (g, [a], cam) => { wield(g, MAPPA_O(), MAPPA, "wave", a, "R", cam); }));
both((view, turn) => card5(`pen-write-${view}`, [{ D: DOCTOR_D, h: 1.72, turn, pose: (s) => { const ps = { ...s, pose: usePose(SCROLL, "hold", "L") }, j = jointsOf(ps), w = rightWay(s), top = mix3(j("wrL"), j("tipL"), 0.5), mid: V3 = [top[0], top[1] - 0.2, top[2]]; return { ...usePose(SCROLL, "hold", "L"), ...reach(ps, "R", aside(near(mid, s.cam, 0.06), s.cam, -w * 0.02, 0.1)), head: [0, 10, 0] }; }, hands: LR, face: { brow: 0.2, lid: 0.45, smile: 0.4 } }],
  (g, [a], cam) => { wield(g, SCROLL_O(), SCROLL, "hold", a, "L", cam); wield(g, PEN_O(), PEN, "write", a, "R", cam, { d: 0.1 }); }));
for (const [view, turn] of [["front", 0], ["slant", 30]] as [string, number][]) (() => card5(`olive-eat-${view}`, [{ D: ROMAN_WOMAN2_D, h: 1.62, turn, pose: (s) => eating(s), hands: LR, face: { lid: 0.45, mouth: 0.3, smile: 0.2 } }],
  (g, [a], cam) => { const h = nearHand(a.heading, cam); wield(g, OLIVES(), BOWL, "rim", a, h, cam); wield(g, OLIVE_O(), OLIVE, "eat", a, h === "L" ? "R" : "L", cam, { d: 0.12 }); }))();
{ const meet: V3 = [X + 0.08, 0.98, Z + 0.12];
  card5("hands-pull-front", [{ D: MURMILLO_D, h: 1.84, dx: -0.32, turn: 55, pose: (s) => ({ ...reach(s, "R", meet), lean: 10 }), hands: R1, face: { brow: 0.3, smile: 0.4, mouth: 0 } },
    { D: RETIARIUS_D, h: 1.86, dx: 0.48, turn: -55, pose: (s) => ({ py: -0.5, lean: -8, ...reach({ ...s, pose: { py: -0.5, lean: -8 } }, "L", meet) }), hands: { handL: "grip" }, face: { brow: 0.6, lid: 0.1, smile: 0.2 } }],
    (_g, [m, r], cam) => { handshake(m, "R", r, "L", cam); }); }
{ const mur = standAt(MURMILLO_BARE_D, -0.24, 8, 1.84, {});
  card5("shoulder-arm-front", [{ D: MURMILLO_BARE_D, h: 1.84, dx: -0.24, turn: 8, pose: () => ({}), face: { smile: 0.5, brow: 0.3, mouth: 0 } },
    { D: RETIARIUS_D, h: 1.86, dx: 0.32, turn: -8, pose: (s) => reach(s, "R", near(jointsOf(mur)("shL"), s.cam, 0.06)), hands: { handR: "open" }, face: { smile: 0.5, brow: 0.4 } }],
    (_g, [m, r], cam) => { handOn(r, "R", m, "shL", cam, "shoulder"); });
  const mur2 = standAt(MURMILLO_D, -0.3, 25, 1.84, GUARD5);
  card5("shoulder-pat-side", [{ D: MURMILLO_D, h: 1.84, dx: -0.3, turn: 25, pose: () => GUARD5, hands: LR, face: { brow: -0.3, lid: 0.3, mouth: 0 } },
    { D: OWNER_D, h: 1.7, dx: 0.42, turn: -35, pose: (s) => reach(s, "R", near(jointsOf(mur2)("shL"), s.cam, 0.08)), hands: { handR: "open" }, face: { smile: 0.7, brow: 0.6 } }],
    (_g, [m, o], cam) => { handOn(o, "R", m, "shL", cam, "shoulder"); }); }
// the murmillo in his full helmet, the visor with its grille down (Jesper: with a grille, unless it looks too poor): from the front and
// from the side, the gladius at the ready and the shield on his arm
both((view, turn) => card5(`murmillo-grille-${view}`, [{ D: MURMILLO_GRILLE_D, h: 1.84, turn, pose: () => ({ ...usePose(GLADIUS, "ready", "R"), armL: SHIELD_ARM }), hands: LR, face: { brow: -0.7, lid: 0.15 } }],
  (g, [a], cam) => { wield(g, GLAD(), GLADIUS, "ready", a, "R", cam); shieldOn(g, SCUTUM(), a, "L", cam); }));
export const GRIP_SHEET_5: Film = { ...GRIP_SHEET, id: "grip-sheet-5", seconds: shots5.length * LEN, shots: shots5 };


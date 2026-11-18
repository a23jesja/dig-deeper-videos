// The grip sheet: every prop that is held in the films, in a figure's hand, in its use pose and lowered, from the front and from the
// side, close enough to see the fingers and the thumb. It is a film like the others (one still shot per picture), so that what the
// sheet shows is exactly what stage/grips.ts puts in a hand in the films. scripts/grip_sheet.sh renders it to granskning/rattningar.
// A shot is named <prop>-<use>-<view>; the script lays the sheet out by those names.
import * as THREE from "three";
import { Film, Shot, Cam, V3, Staged, play } from "../stage/film";
import { mover, MM } from "../stage/acting";
import { lens, once, noShade, near, palm, fuseSmoke } from "../stage/staging";
import { GLADIUS, NET, STICK, TRIDENT, SHIELD_ARM, shieldOn, pole, polePose, Stand, PISTOL, SABRE, MUG, SPYGLASS, BUCKET, LINSTOCK, FIDDLE, BOW, GRAPES, BUNDLE, wield, spy, spyEye, spyPose, aimPose, usePose, sheathed, drawSabre, drawPose, reach, liftPose, haul, haulPose, carryBy, fiddlePose, fiddlePlay, citharaPose, citharaHold, shoulderPose, onShoulder, inHand, letGo } from "../stage/grips";
import { flagSea } from "../world/ship";
import { group, mesh, box } from "../world/kit";
import { gladius, scutum, trident, netBunch, refStick, spyglass, pistolHeld, sabre, mugHeld, scabbard, bucketHeld, linstock, chest, fiddle, fiddleBow, fiddleByNeck, cithara, grapes, bundleHeld } from "../world/props";
import { MURMILLO_D, RETIARIUS_D, REFEREE_D, CUSTOMS_D, SHIPOWNER_D, PIRATE_D, SAILOR_D, PIRATE2_D, CAPTAIN_D, COOK_D, GUNNER_D, DOCKER_D, DOCKHAND_D, NERO_D, NERO_STAGE_D, ROMAN_WOMAN2_D, CITIZEN_D, BLACKBEARD_D, YOU_D, YOU_CHECK_D, SIR_D } from "../looks";
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

// ---------------- a look sheet: "you", the lookout of the long video, from four sides, beside Sir Digsworth, and in a checked shirt ----------------
const shotsYou: Shot[] = [];
const cardYou = (id: string, figs: Fig[]) => { card2(id, figs, () => {}); const s = shotsYou.length * LEN, sh = shots2.pop()!; shotsYou.push({ ...sh, a: s, b: s + LEN }); };
const YOU_REST = { armL: [[12, 16], [22, 12]] as [[number, number], [number, number]], armR: [[12, 16], [22, 12]] as [[number, number], [number, number]] }, YOU_FACE: Face = { brow: 0.3, lid: 0.1, smile: 0.35 };
for (const [view, turn] of [["front", 0], ["slant", 28], ["side", 58], ["back", 180]] as [string, number][]) cardYou(`you-look-${view}`, [{ D: YOU_D, h: 1.76, turn, pose: () => YOU_REST, face: YOU_FACE }]);
const CLOSE = { armL: [[8, 7], [14, 5]] as [[number, number], [number, number]], armR: [[8, 7], [14, 5]] as [[number, number], [number, number]] };
cardYou("you-with-sir", [{ D: YOU_D, h: 1.76, dx: -0.42, turn: 24, pose: () => CLOSE, face: YOU_FACE }, { D: SIR_D, h: 1.8, dx: 0.42, turn: -24, pose: () => CLOSE, face: { brow: 0.4, smile: 0.4 } }]);
for (const [view, turn] of [["front", 0], ["slant", 28]] as [string, number][]) cardYou(`you-check-${view}`, [{ D: YOU_CHECK_D, h: 1.76, turn, pose: () => YOU_REST, face: YOU_FACE }]);
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


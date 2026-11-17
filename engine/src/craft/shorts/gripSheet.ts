// The grip sheet: every prop that is held in the films, in a figure's hand, in its use pose and lowered, from the front and from the
// side, close enough to see the fingers and the thumb. It is a film like the others (one still shot per picture), so that what the
// sheet shows is exactly what stage/grips.ts puts in a hand in the films. scripts/grip_sheet.sh renders it to granskning/rattningar.
// A shot is named <prop>-<use>-<view>; the script lays the sheet out by those names.
import * as THREE from "three";
import { Film, Shot, Cam, V3, Staged, play } from "../stage/film";
import { mover, MM } from "../stage/acting";
import { lens, once, noShade } from "../stage/staging";
import { Stand, PISTOL, SABRE, MUG, SPYGLASS, wield, spy, spyEye, spyPose, aimPose, usePose, sheathed } from "../stage/grips";
import { flagSea } from "../world/ship";
import { group } from "../world/kit";
import { spyglass, pistolHeld, sabre, mugHeld, scabbard } from "../world/props";
import { CUSTOMS_D, SHIPOWNER_D, PIRATE_D, SAILOR_D, PIRATE2_D } from "../looks";
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
  card(`spyglass-look-${view}`, CUSTOMS_D, 1.9, turn, (s) => ({ ...spyPose({ ...s, pose: { head: [turn ? 0 : 30, -8, 0] } }, SEEN), head: [turn ? 0 : 30, -8, 0] }), { handL: "grip", handR: "grip", face: { shut: spyEye(V.cam, [X - way * 0.25, 1.7, Z], SEEN), lid: 0.3, brow: -0.2 } }, (g, a, cam) => spy(g, GLASS(), a, cam, SEEN), -way * 0.25);
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

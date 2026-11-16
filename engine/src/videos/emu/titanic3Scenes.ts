// Ten-second test for "I Survived the Titanic", part 3, in the locked style: sheet poses as cards in the detailed 3D
// world (deckset.ts, built from the environment kit). A distress rocket lights the deck. Three cameras:
//   shot 1 (0-110)    low on the deck looking down the ship: Sir Digsworth (right, near), the officer, the lifeboat hung out
//                     in the rail opening (left) with a lady and a child in it, the first rocket bursting over the sea
//   shot 2 (110-240)  close-up of Sir Digsworth: the shock, then he waves (the engine has no cap-lift pose)
//   shot 3 (240-300)  from a boat on the water: the rail from below, Sir Digsworth, the officer and a gentleman at the open rail, a second rocket
// No narration yet: the rockets are in the fact sheet with one source family only, so nothing is claimed in words.
import { Cam, Key, ShotDef, V3, run, pushK, zoom, dofFrom, layersFrom } from "./story";
import { Scene, Show } from "./scenes";
import { CamInfo, lidAt } from "./castbase";
import { person } from "./castbase";
import { SIR } from "./scenes";
import { INK, Outfit } from "./toon";
import { DECK, Frame, ROCKETS, WATER_BOAT, toWorld } from "./deckset";

export const DECK_TOTAL = 300;
const S2 = 110, S3 = 240, WAVE = 168;
export const HOOK_END = 70;
/** the hook as text: where it sits on screen (px), in a free band above the heads */
export const HOOK = { text: "LOOK UP!", x: 60, y: 310, w: 960, h: 150, size: 132 };
const OFFICER_O = { i: 41, o: { jacket: "#3f5a94", pants: "#34497a", boots: INK, hat: "peaked", cap: "#f1efe6", moustache: "#5b3a22", buttons: "#e2bb4c", gent: true } as Outfit, okey: "officer" };
const LADY = { i: 52, o: { jacket: "#7b5ac9", pants: "#3b3f52", boots: "#4a3426", hat: "bonnet", dress: "#c25a7a", gent: true } as Outfit, okey: "lady" };
const KID = { i: 57, o: { jacket: "#2c4a7a", pants: "#2c4a7a", boots: INK, hat: "cap", cap: "#f1efe6", build: "kid", gent: true } as Outfit, okey: "kid" };
const GENT = { i: 63, o: { jacket: "#8a7a68", pants: "#55505e", boots: INK, hat: "tophat", cap: "#55505e", beard: "#6b4a2a", buttons: "#c9a94a", gent: true } as Outfit, okey: "gent" };
/** the cast of the test, for the family still (SirLook frame 1) */
export const FAMILY = { officer: OFFICER_O.o, lady: LADY.o, kid: KID.o, gent: GENT.o };
export const PASSENGERS = ["lady", "kid"];
export const SHOT_KIND: Record<number, "medium" | "close" | "wide"> = { 1: "medium", 2: "close", 3: "wide" };
const L = { zone: "deck" as const, light: "night" as const, sunAz: 118 };
export const DECK_SHOTS: ShotDef[] = [
  { id: 1, name: "hook: the rocket bursts, the lifeboat hangs out", a: 0, b: S2, ...L },
  { id: 2, name: "close-up: Sir Digsworth, shock, then a wave", a: S2, b: S3, ...L },
  { id: 3, name: "from the water: the rail from below, three at the opening", a: S3, b: DECK_TOTAL, ...L, sunAz: 60 },
];
export const layersDeck = layersFrom(DECK_SHOTS, {});

// ---- shot 1: camera low on the deck, looking down the ship toward the lifeboat station (heading a: degrees from -x toward the sea side +z)
const C1: V3 = [2, 1.0, 7], A1 = 20, PITCH1 = 4;
const dir1 = [-Math.cos((A1 * Math.PI) / 180), Math.sin((A1 * Math.PI) / 180)], right1 = [-dir1[1], dir1[0]];
/** a point d metres ahead of the shot-1 camera and u metres to the right, at height y */
const rel1 = (d: number, u: number, y: number): V3 => [C1[0] + dir1[0] * d + right1[0] * u, y, C1[2] + dir1[1] * d + right1[1] * u];
const SIR1 = rel1(4.55, 0.46, 0), OFFICER = rel1(19, 0.12, 0);
const BOAT_SEATS: { lady: V3; kid: V3 } = { lady: [-13.9, 1.0, DECK.boat[2] + 0.35], kid: [-14.9, 1.0, DECK.boat[2] - 0.2] };
ROCKETS.length = 0;
ROCKETS.push({ t0: -0.9, rise: 1.4, from: rel1(24, -3, 1.5), apex: rel1(60, -4.5, 10.4), radius: 5 }, { t0: 6.95, rise: 1.3, from: [11, 1.5, 7], apex: [9.5, 33, -30], radius: 8 });

// ---- shot 2: the close-up looks along the deck at Sir Digsworth where he stands
const SIR2: V3 = [-3, 0, 6];
const FRAME_CLOSE: Frame = { A: [SIR2[0], SIR2[2]], TH: (108 * Math.PI) / 180 };
// ---- shot 3: from a boat on the water, 6.8 m from the three at the open rail, a little below them
const GONE = DECK.gone, THREE: Record<string, V3> = { gent: [GONE - 0.7, 0.03, 14.1], sir: [GONE, 0.03, 14.1], officer: [GONE + 0.7, 0.03, 14.1] };
const PITCH3 = 4, FOV3 = 35, CAMH3 = 0.5;
const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: (f) => zoom([C1[0], C1[1], C1[2]], [C1[0] + dir1[0] * 20, C1[1] + 20 * Math.tan((PITCH1 * Math.PI) / 180), C1[2] + dir1[1] * 20], 38, pushK(f, 0, 0.0001)) }],
  2: [{ f: S2, s: (f) => zoom(toWorld(FRAME_CLOSE, [-0.14, 1.23, -2.8]), toWorld(FRAME_CLOSE, [-0.14, 1.14, 0]), 36, pushK(f, S2, 0.0004)) }],
  3: [{ f: S3, s: (f) => zoom([WATER_BOAT[0], WATER_BOAT[1] + CAMH3 + 0.03 * Math.sin(f * 0.12), WATER_BOAT[2] - 0.3], [WATER_BOAT[0] + 0.05, WATER_BOAT[1] + CAMH3 + 20 * Math.tan((PITCH3 * Math.PI) / 180), 0.9], FOV3, pushK(f, S3, 0.0002), { roll: 0.012 * Math.sin(f * 0.1) }) }],
};
export const camAtDeck = (id: number, f: number): Cam => run(CAMS[id], f);
export const dofAtDeck = dofFrom([{ f: 0, cInf: 3, focus: () => [SIR1[0], 1.4, SIR1[2]] as V3 }, { f: S2, cInf: 7, focus: () => toWorld(FRAME_CLOSE, [0, 1.5, 0]) }, { f: S3, cInf: 0 }]);

export const sceneAtDeck = (id: number, f: number, cam: CamInfo): Scene => {
  const out: Scene = { places: [], fx: [], guns: [], crates: [], fan: 0 };
  const t = f / 30;
  if (id === 1) {
    // the lifeboat: a lady and a child sit in it (hull hides their legs), Sir Digsworth and the officer stand on the deck
    person(out, cam, LADY, ...BOAT_SEATS.lady, { fo: { mode: "sit", expr: "shock", blink: lidAt(t, 52) } }, false);
    person(out, cam, KID, ...BOAT_SEATS.kid, { fo: { mode: "sit", expr: "nervous", blink: lidAt(t, 57) } }, false);
    person(out, cam, OFFICER_O, OFFICER[0], 0, OFFICER[2], { fo: { mode: "stand", expr: "stern", blink: lidAt(t, 41) } });
    person(out, cam, SIR, SIR1[0], 0, SIR1[2], { fo: { mode: "stand", expr: "shock", headTilt: -9, look: -1, blink: lidAt(t, 3) } });
  } else if (id === 2) {
    const w = f >= WAVE ? 0.5 + 0.5 * Math.sin((f - WAVE) * 0.42) : undefined;
    person(out, cam, SIR, SIR2[0], 0, SIR2[2], { fo: { mode: "stand", expr: f < WAVE - 4 ? "shock" : "smile", wave: w, blink: lidAt(t, 3, [(WAVE - 4) / 30]) } });
  } else {
    person(out, cam, GENT, ...THREE.gent, { fo: { mode: "stand", expr: "shock", blink: lidAt(t, 63) } });
    person(out, cam, SIR, ...THREE.sir, { fo: { mode: "stand", expr: "shock", blink: lidAt(t, 3) } });
    person(out, cam, OFFICER_O, ...THREE.officer, { fo: { mode: "stand", expr: "stern", blink: lidAt(t, 41) } });
  }
  return out;
};
export const DECK_SHOW: Show = { shots: DECK_SHOTS, camAt: camAtDeck, sceneAt: sceneAtDeck, crowdFor: () => null, wheatAt: () => 1 };

/** for scripts/kit_check.mjs titanic3test */
export const FILM_CHECK = { shots: DECK_SHOTS, camAt: camAtDeck, sceneAt: sceneAtDeck, kinds: SHOT_KIND, hook: { lines: [HOOK.text], x: HOOK.x, y: HOOK.y, w: HOOK.w, h: HOOK.h, size: HOOK.size, end: HOOK_END }, rockets: ROCKETS, passengers: PASSENGERS };

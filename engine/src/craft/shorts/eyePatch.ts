// Short: the pirate eye patch tale (20 Nov 2026; granskning/ogonlapp/manus.md). Sir Digsworth tells it (bm_george) and is not seen. A pirate
// with a patch stands on the sunny deck; below deck his shipmate, with no patch, cannot see a thing; the pirate, down there, has moved the
// patch to the other eye (only ever in a cut) and sees. Then what is known: the eye takes minutes to get used to the dark, MythBusters
// called the idea plausible in 2007, and nothing from the pirates' own time says they did it. The tale is told as a tale and the facts as
// facts. Only the approved shot types (Jesper, 20 Nov: 04 hold with both hands, 08 sit, standing talk without stiff arms, empty set
// shots): nobody walks, no door, no hand to the face. The patch's eye is the script's (Shot.patchEye) and the checks hold it there.
import * as THREE from "three";
import { Film, Shot, Cam, V3, Word, play, mix3 } from "../stage/film";
import { mover, wag, ease, type MM } from "../stage/acting";
import { lens, once, noShade, near, aside } from "../stage/staging";
import { reach, jointsOf, carryBy, type Stand } from "../stage/grips";
import { FLAGSEA_SOLIDS, MERCHANT_DECK } from "../world/ship";
import { CABIN, inCabin, cabinSea } from "../world/cabin";
import { glow } from "../world/fire";
import { logBook, chest } from "../world/props";
import { PIRATE_D, MATE_D } from "../looks";
import { POSES, type Pose, type Seg } from "../rig";
import type { Design, FigOpts, Face } from "../designs/common";
import { rightWay } from "./gripSheet";
import W0 from "../../../voice/eye-patch/words.json";
import L0 from "../../../voice/eye-patch/lines.json";

type Lines = Record<string, { id: string; a: number; b: number }>;
const W = W0 as Word[], L = Object.fromEntries((L0 as { id: string; a: number; b: number }[]).map((x) => [x.id, x])) as Lines;
type Lens = ReturnType<typeof lens>;
const MD = MERCHANT_DECK, FL = CABIN.at[1], H = 1.78, HM = 1.74;
/** where a cut falls: half way through the pause between two lines */
const cut = (a: string, b: string) => (L[a].b + L[b].a) / 2;
const T = { s2: cut("hook", "idea"), s3: cut("idea", "deck"), s4: cut("deck", "below"), s5: L.mins.a + 0.8, s6: cut("mins", "patch"), s7: cut("patch", "flip"),
  s8: cut("flip", "myth"), s8b: cut("myth", "verdict"), s9: cut("verdict", "but"), s10: cut("none", "proof"), s11: cut("proof", "trick"), end: L.trick.b + 1.5 };
const shots: Shot[] = [];
const on = (name: string, D: Design, m: MM, t: number, y: number, extra: FigOpts = {}, seed = 1) => ({ ...play(name, D, m, t, [0, y, 0], m.h, { blink: true, seed, extra }), noShade: true });
const P = (o: Partial<Pose>) => o;
/** arms hanging at rest, a little out and bent (the shot library: straight arms read as an A stance) */
const REST: Partial<Pose> = { armL: [[4, 13], [16, 9]], armR: [[4, 13], [16, 9]] };
const LOOSE = { handL: "relaxed" as const, handR: "relaxed" as const };
const SQUINT: Face = { brow: -0.6, lid: 0.62, smile: -0.1 }, SMUG: Face = { brow: 0.5, lid: 0.2, smile: 0.7 }, LOST: Face = { brow: 0.9, lid: 0, wide: 0.8, mouth: 0.15, smile: -0.3 };

// ---------------- the deck in the sun ----------------
const DECK = lens(-10.9, 1.5, 2.2, 1, 0, -2, 50);
const deckAt = (d: number, l: number): [number, number] => DECK.spot(d, l);
/** the pirate on deck, his patch on his right eye ("A"), turned a little from the lens, at ease; his head goes slowly round */
const pirateDeck = (id: string, a: number, b: number, V: Lens, push: number, face: Face, o: { bubble?: string; mate?: boolean } = {}): Shot => {
  const [x, z] = deckAt(3.2, 0.08), m = mover(PIRATE_D, H, x, z, V.toward(x, z, 16)); m.w = 0.09; m.stand(9);
  ease(m, -1, { ...REST, head: [-4, 3, 0] }, 0.01, { ...LOOSE, face });
  ease(m, 0.35, { ...REST, head: [5, 1, 0], px: 0.015, hipTilt: -2 }, 1.1, { ...LOOSE, face });
  ease(m, 1.9, { ...REST, head: [-3, 4, 0], px: 0, hipTilt: 0 }, 1.0, { ...LOOSE, face });
  let mate: MM | null = null; const [mx, mz] = deckAt(4.8, -0.62);
  if (o.mate) { mate = mover(MATE_D, HM, mx, mz, V.toward(mx, mz, -24)); mate.w = 0.09; mate.stand(9);
    ease(mate, -1, { ...REST, head: [8, -6, 0], lean: 3 }, 0.01, { ...LOOSE, face: SQUINT });
    ease(mate, 0.5, { ...REST, head: [-6, -9, 0], lean: 5, py: -0.01 }, 1.0, { ...LOOSE, face: { ...SQUINT, lid: 0.75 } }); }
  return { id, a, b, still: (b - a) * 0.6, patchEye: { pirate: "A" }, sounds: [{ t: 0.0, k: "splash", g: 0.5 }], cam: (_t, u) => V.push(push * u), sun: { target: [x, MD, z], reach: 6 },
    cast: (t) => [on("pirate", PIRATE_D, m, t, MD, { patch: "A" }, 3), ...(mate ? [on("mate", MATE_D, mate, t, MD, {}, 5)] : [])],
  } as Shot; };
// (every shot shows the whole figure with room to the edges: the motion check fails a figure cut by the edge)
const FACE = lens(-10.9 + 0.25, 1.45, 2.2 + 0.02, 1, -0.01, -3, 50);

// ---------------- below deck: the great cabin, dark ----------------
const CX = CABIN.at[0], CZ = CABIN.at[2];
const cabinLens = (x: number, y: number, z: number, fx: number, fz: number, pitch: number, fov: number) => lens(CX + x, FL + y, CZ + z, fx, fz, pitch, fov);
const lantern = (g: THREE.Group, T2: number, cam: Cam) => { const p = inCabin(CABIN.flame); glow(g, p, 0.35, 0.35, T2, Math.atan2(cam.pos[0] - p[0], cam.pos[2] - p[2]), 2); };
/** the mate below, no patch, blind in the dark: his hands out before him with the elbows bent, feeling the air, his head turning */
const FEEL1: [Seg, Seg] = [[22, 14], [78, 8]], FEEL2: [Seg, Seg] = [[18, 10], [70, 12]];
const mateBlind = (m: MM, len: number) => { ease(m, -1, { armL: FEEL1, armR: FEEL2, head: [10, -2, 0], lean: 6 }, 0.01, { handL: "open", handR: "open", face: LOST });
  wag(m, 0.2, len, P({ armL: FEEL1, armR: FEEL2, head: [14, -3, 0], lean: 6 }), P({ armL: FEEL2, armR: FEEL1, head: [-10, -1, 0], lean: 7 }), 1.6, { handL: "open", handR: "open", face: LOST, glide: true }); };
const mateShot = (id: string, a: number, b: number, V: Lens, at: V3, turn: number, o: { bubble?: [number, number, string] } = {}): Shot => {
  const m = mover(MATE_D, HM, at[0], at[2], V.toward(at[0], at[2], turn)); m.w = 0.09; m.stand(9); mateBlind(m, b - a + 0.5);
  return { id, a, b, still: (b - a) * 0.5, cam: (_t, u) => V.push(0.06 * u), sun: { target: at, reach: 4 },
    cast: (t) => [on("mate", MATE_D, m, t, FL, {}, 5)], things: (g, _c, _t, T2, cam) => lantern(g, T2, cam),
  } as Shot; };

// 1. WHY DID PIRATES WEAR EYE PATCHES? The pirate on the sunny deck, his patch on his right eye, the lens going in a little
shots.push(pirateDeck("hook", 0, T.s2, FACE, 0.18, SMUG));
// 2. ONE IDEA: TO SEE IN THE DARK. Below, in the dark, his shipmate feels the air before him
const MAT_AT = inCabin([0.1, 0, 0.25]);
shots.push(mateShot("dark", T.s2, T.s3, cabinLens(0.05, 1.3, 3.05, 0.0, -1, -3, 54), MAT_AT, 8));
// 3. UP ON DECK, THE SUN IS BLINDING. Both on deck, the mate screwing up his eyes against the sun, the pirate at ease
shots.push(pirateDeck("sun", T.s3, T.s4, DECK, 0.12, SMUG, { mate: true }));
// 4. GO BELOW, AND YOU CAN'T SEE A THING. The mate below, wider: the dark room round him. "Who blew out the sun?"
shots.push(mateShot("below", T.s4, T.s5, cabinLens(0.0, 1.3, 3.0, 0.02, -1, -1, 54), MAT_AT, 4, { bubble: [L.below.b + 0.05, L.mins.a + 0.75, "Who blew out the sun?!"] }));
// 5. EYES NEED TWENTY TO THIRTY MINUTES TO GET USED TO THE DARK. Close on the mate, still feeling his way
shots.push(mateShot("mins", T.s5, T.s6, cabinLens(0.45, 1.3, 2.95, -0.12, -1, -3, 54), MAT_AT, 12));
// 6. BUT AN EYE UNDER A PATCH IS ALREADY USED TO IT. Back on deck, closer, on the patch
shots.push(pirateDeck("patch", T.s6, T.s7, lens(-10.9 + 0.45, 1.5, 2.2 + 0.02, 1, -0.01, -3, 46), 0.1, { ...SMUG, smile: 0.8 }));

// 7. FLIP THE PATCH, AND YOU CAN SEE. Below: the patch is on his left eye now ("B"), and he reads the log in the dark, holding it in both
//    hands (the shot library's 04: the thumbs in front, the fingers behind), pleased; behind him his shipmate still feels his way
const PIR_AT = inCabin([-0.3, 0, 0.25]), BOOK = once(() => noShade(logBook()));
const holdShot = (id: string, a: number, b: number, V: Lens, mateToo: boolean): Shot => {
  const hd = V.toward(PIR_AT[0], PIR_AT[2], 14), m = mover(PIRATE_D, H, PIR_AT[0], PIR_AT[2], hd); m.w = 0.09; m.stand(9);
  const rs: Stand = { D: PIRATE_D, at: PIR_AT, heading: hd, h: H, cam: V.cam, pose: {} }, rj = jointsOf(rs), rw = rightWay(rs);
  const hold = (k: number, fwd: number, tilt = 0): Partial<Pose> => { const rc = near(mix3(rj("pelvis"), rj("neck"), k), V.cam, fwd); return { ...reach(rs, "R", aside(rc, V.cam, rw * 0.27, tilt)), ...reach(rs, "L", aside(rc, V.cam, -rw * 0.27, -tilt)) }; };
  const T0 = { handL: "thumb" as const, handR: "thumb" as const };
  ease(m, -1, { ...hold(0.52, 0.36), head: [0, 6, 0] }, 0.01, { ...T0, face: { brow: 0.6, lid: 0.12, smile: 0.6, gaze: [0, -0.5] } });
  ease(m, 0.4, { ...hold(0.55, 0.38), head: [-3, 8, 0] }, 0.8, { ...T0, face: { brow: 0.9, lid: 0.05, smile: 0.8, gaze: [0, -0.6] } });
  ease(m, 1.5, { ...hold(0.53, 0.37, 0.02), head: [3, 6, 0] }, 0.7, { ...T0, face: { brow: 0.7, lid: 0.1, smile: 0.8, gaze: [0, -0.5] } });
  let mt2: MM | null = null; const MB = inCabin([0.3, 0, -0.42]);
  if (mateToo) { mt2 = mover(MATE_D, HM, MB[0], MB[2], V.toward(MB[0], MB[2], 65)); mt2.w = 0.09; mt2.stand(9); mateBlind(mt2, b - a + 0.5); }
  return { id, a, b, still: (b - a) * 0.5, patchEye: { pirate: "B" }, cam: (_t, u) => V.push(0.06 * u), sun: { target: PIR_AT, reach: 4 },
    cast: (t) => [on("pirate", PIRATE_D, m, t, FL, { patch: "B", handL: "thumb", handR: "thumb" }, 3), ...(mt2 ? [on("mate", MATE_D, mt2, t, FL, {}, 5)] : [])],
    things: (g, c, _t, T2, cam) => { lantern(g, T2, cam); carryBy(g, BOOK(), c.pirate, "L", c.pirate, "R", cam, 0.1, "carry", true); } } as Shot; };
shots.push(holdShot("flip", T.s7, T.s8, cabinLens(0.02, 1.3, 3.6, 0.0, -1, -3, 54), true));

// 8. IN 2007, MYTHBUSTERS TESTED THE IDEA. THEIR VERDICT: PLAUSIBLE. He sits on a sea chest below (the shot library's 08: three
//    quarters on, the coat over his lap, the hands on his thighs), the patch on his left eye, nodding slowly
{ const V = cabinLens(-0.2, 1.2, 2.95, 0.0, -1, -3, 50), V2 = cabinLens(-0.75, 1.15, 2.75, 0.14, -1, -3, 50), p = inCabin([-0.35, 0, 0.3]), hd = V.toward(p[0], p[2], 55), fw: [number, number] = [Math.sin((hd * Math.PI) / 180), Math.cos((hd * Math.PI) / 180)];
  const SIT: Partial<Pose> = { py: -0.42, legL: { th: [84, 8], sh: [6, 4] }, legR: { th: [84, -8], sh: [6, -4] } };
  const LAP: [Seg, Seg] = [[16, 6], [66, 2]], LAPF: [Seg, Seg] = [[10, 8], [56, 4]];
  const SEAT = once(() => { const gS = chest(false, false, 0.62, 0.29, 0.42); gS.position.set(p[0] - fw[0] * 0.14, FL, p[2] - fw[1] * 0.14); return noShade(gS); });
  // (two shots: one lens for the test, another for the verdict, so that no shot runs over five seconds)
  const sit = (id: string, a: number, b: number, VV: Lens, first: boolean): Shot => ({ id, a, b, still: (b - a) * 0.5, patchEye: { pirate: "B" }, hide: ["table bottle"],
    ...(first ? { newScene: { pirate: "a later moment below deck: he sits on a sea chest in another part of the cabin, the log put away" } } : {}), cam: (_t, u) => VV.push(0.06 * u), sun: { target: p, reach: 4 },
    cast: (t) => { const T2 = a + t; return [{ name: "pirate", D: PIRATE_D, h: H, at: p, heading: hd, noShade: true, pose: { ...POSES.stand, ...SIT, armL: LAPF, armR: LAP, head: [-6 + 5 * Math.sin(T2 * 1.1), 4 + 3 * Math.sin(T2 * 0.8), 0] },
      o: { handL: "relaxed", handR: "relaxed", patch: "B", face: { brow: 0.5 + 0.2 * Math.sin(T2 * 0.9), lid: 0.15, smile: 0.6 } } }]; },
    things: (g, _c, _t, T2, cam) => { lantern(g, T2, cam); g.add(SEAT()); } } as Shot);
  shots.push(sit("sit", T.s8, T.s8b, V, true), sit("verdict", T.s8b, T.s9, V2, false)); }

// 9. BUT DID REAL PIRATES DO IT? NOBODY KNOWS. On deck again, the patch on his right eye
shots.push(pirateDeck("nobody", T.s9, T.s10, FACE, 0.12, { brow: 0.3, lid: 0.25, smile: 0.2 }));
// 10. NO PICTURE OR RECORD FROM THEIR TIME SAYS SO. The cabin's table with its chart, nobody there
shots.push({ id: "record", a: T.s10, b: T.s11, still: 1.5, cam: (_t, u) => cabinLens(0.35, 1.35, 1.55, -0.1, -1, -14, 40).push(0.08 * u), sun: { target: inCabin(CABIN.table), reach: 4 },
  cast: () => [], things: (g, _c, _t, T2, cam) => lantern(g, T2, cam) } as Shot);
// 11. STILL. A VERY CLEVER TRICK. On deck, framed as the first shot, so that the film loops: "Arr. Which eye was it again?"
shots.push(pirateDeck("end", T.s11, T.end, FACE, 0.18, SMUG, { bubble: "Arr. Which eye was it again?" }));

// (the words at the top of the picture, over the sky or the beams: lower, they lay over the figures' chests and hands)
for (const s of shots) s.capsTop = 160;

/** below deck is dark: a tint over the cabin's shots, deepest where the mate cannot see, lighter where the pirate's dark eye sees */
const DARK = "radial-gradient(ellipse 65% 50% at 50% 50%, rgba(120,122,160,1) 0%, rgba(48,50,84,1) 100%)";
const SEEN = "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(232,226,236,1) 0%, rgba(150,154,196,1) 100%)";
const gradeAt = (T2: number) => { const s = shots.find((q) => T2 >= q.a && T2 < q.b); return !s ? null : ["dark", "below", "mins"].includes(s.id) ? DARK : ["flip", "sit", "verdict", "record"].includes(s.id) ? SEEN : null; };

export const EYE_PATCH: Film = {
  id: "eye-patch", fps: 30, seconds: T.end, sky: "#a9dcff", world: cabinSea, shots, words: W, solids: FLAGSEA_SOLIDS, grade: gradeAt,
  hook: { text: ["WHY DID PIRATES", "WEAR EYE PATCHES?"], a: 0, b: T.s2, size: 84 },
  // our own lines (DAILY-RULES, "Our own lines"), as bubbles: the mate in the dark, and the pirate at the end, which leads back to the start
  bubbles: [{ a: L.below.b + 0.05, b: L.mins.a + 0.75, text: "Who blew out the sun?!", who: "mate" }, { a: L.trick.b + 0.1, b: T.end - 0.05, text: "Arr. Which eye was it?", who: "pirate" }],
  thumbs: [
    { T: 1.6, words: ["THE EYE", "PATCH TRICK"], y: 0.7, size: 140 },
    { T: T.s7 + 1.0, words: ["HE CAN", "SEE IN THE DARK"], y: 0.72, size: 120 },
    { T: T.s5 + 1.2, words: ["WHO BLEW", "OUT THE SUN?"], y: 0.72, size: 120 },
  ],
};

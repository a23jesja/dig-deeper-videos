// Short: the pirate eye patch tale (20 Nov 2026; granskning/ogonlapp/manus.md). Sir Digsworth tells it (bm_george) and is not seen. A pirate
// with a patch stands on the sunny deck; below deck his shipmate, with no patch, cannot see a thing; the pirate, down there, has moved the
// patch to the other eye (only ever in a cut) and sees. Then what is known: the eye takes minutes to get used to the dark, MythBusters
// called the idea plausible in 2007, and nothing from the pirates' own time says they did it. The tale is told as a tale and the facts as
// facts. Only the approved shot types (Jesper, 20 Nov: 04 hold with both hands, 08 sit, standing talk without stiff arms, empty set
// shots): nobody walks, no door, no hand to the face. The patch's eye is the script's (Shot.patchEye) and the checks hold it there.
import * as THREE from "three";
import { Film, Shot, Cam, V3, Word, play, mix3 } from "../stage/film";
import { mover, wag, ease, type MM } from "../stage/acting";
import { lens, once, noShade, near, aside, put } from "../stage/staging";
import { reach, jointsOf, carryBy, type Stand } from "../stage/grips";
import { FLAGSEA_SOLIDS, MERCHANT_DECK } from "../world/ship";
import { CABIN, inCabin, cabinSea } from "../world/cabin";
import { glow } from "../world/fire";
import { logBook, chest, clothFlag, piratePrint } from "../world/props";
import { rod } from "../world/kit";
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
// (the review of the script, 20 Nov: the deck shots stood him straight on with straight arms, the same frame four times, portraits. Now he
//  holds a small chest by its handles before him (both hands, the shot library's 04), shifts his weight and looks about; the black flag
//  flies on its pole behind him in the wind; one shot is close on the patch, another seen low from his side)
const DECK = lens(-10.9, 1.5, 2.2, 1, 0, -2, 50);
const deckAt = (d: number, l: number): [number, number] => DECK.spot(d, l);
/** where the chest is held: this far up from his hips toward his neck, this far toward the lens */
const KH = 0.28, FH = 0.26;      // (tried 0.24-0.32 and 0.2-0.32: lower, the elbow bent the wrong way; higher, the arms went straight out)
const PIR_DECK = deckAt(3.2, 0.08), CHEST_S = once(() => noShade(chest(false, false, 0.3, 0.22, 0.24)));
// (the chest close before him: held 10 cm nearer the lens than his hands, it looked wider than his hands' span and its ring handles stood
//  out past his fists, so that the fists seemed to miss them; v1 at full size)
const CHEST_D = Number(process.env.CHEST_D ?? 0.03);
const FLAG = once(() => clothFlag("pirate", 1.1, 0.75)), POLE_AT = deckAt(4.7, 0.7);
const flagpole = (g: THREE.Group, T2: number) => { g.add(rod([POLE_AT[0], MD, POLE_AT[1]], [POLE_AT[0], MD + 3.3, POLE_AT[1]], 0.035, "#5a3a22"));
  const f = FLAG(); f.wave(T2, 1); put(g, f.obj, [POLE_AT[0], MD + 3.25, POLE_AT[1]], Math.PI / 2); };
const deckBeds = (len: number) => [{ k: "sea", a: 0, b: len, g: 0.8 }, { k: "wind", a: 0, b: len, g: 0.45 }, { k: "birds", a: 0, b: len, g: 0.3 }, { k: "flap", a: 0, b: len, g: 0.35 }];
/** the pirate on deck, his patch on his right eye ("A"), the chest in his hands; `moves`: his weight from one foot to the other, the chest
 *  lifted a little and settled, his head round to the sea and back */
const pirateDeck = (id: string, a: number, b: number, V: Lens, push: number, face: Face, o: { mate?: boolean; moves?: boolean; close?: boolean; turn?: number } = {}): Shot => {
  const [x, z] = PIR_DECK, hd = V.toward(x, z, o.turn ?? 16), m = mover(PIRATE_D, H, x, z, hd); m.w = 0.09; m.stand(9);
  const rs: Stand = { D: PIRATE_D, at: [x, MD, z], heading: hd, h: H, cam: V.cam, pose: {} }, rj = jointsOf(rs), rw = rightWay(rs);
  const hold = (k: number, fwd: number, tilt = 0): Partial<Pose> => { const rc = near(mix3(rj("pelvis"), rj("neck"), k), V.cam, fwd); return { ...reach(rs, "R", aside(rc, V.cam, rw * 0.235, tilt)), ...reach(rs, "L", aside(rc, V.cam, -rw * 0.235, -tilt)) }; };
  const G = { handL: "grip" as const, handR: "grip" as const };
  // (close on his face, his arms hang: the chest in his hands came out of the picture at its side, an arm cut half way by the edge)
  const H0 = (k: Partial<Pose>) => (o.close ? { ...REST, head: k.head } : k);
  ease(m, -1, H0({ ...hold(KH, FH), head: [-4, 3, 0] }), 0.01, { ...(o.close ? LOOSE : G), face });
  if (o.moves) { ease(m, 0.3, { ...hold(KH + 0.03, FH + 0.01, 0.01), head: [10, 1, 0], px: 0.025, hipTilt: -3 }, 0.9, { ...G, face });
    ease(m, 1.5, { ...hold(KH, FH, -0.01), head: [-8, 5, 0], px: -0.015, hipTilt: 2 }, 1.0, { ...G, face: { ...face, smile: (face.smile ?? 0) + 0.1 } });
    ease(m, 2.7, { ...hold(KH + 0.01, FH), head: [2, 2, 0], px: 0.01, hipTilt: -1 }, 0.9, { ...G, face }); }
  else ease(m, 0.4, H0({ ...hold(KH + 0.01, FH), head: [3, 4, 0] }), 1.4, { ...(o.close ? LOOSE : G), face });
  let mate: MM | null = null; const [mx, mz] = deckAt(4.6, -0.7);
  if (o.mate) { mate = mover(MATE_D, HM, mx, mz, V.toward(mx, mz, -24)); mate.w = 0.09; mate.stand(9);
    ease(mate, -1, { ...REST, head: [8, -6, 0], lean: 3 }, 0.01, { ...LOOSE, face: SQUINT });
    ease(mate, 0.5, { ...REST, head: [-6, -9, 0], lean: 5, py: -0.01 }, 1.0, { ...LOOSE, face: { ...SQUINT, lid: 0.75 } }); }
  return { id, a, b, still: (b - a) * 0.6, patchEye: { pirate: "A" }, ...(o.close ? { closeUp: { pirate: "close on the patch, as the script says" } } : {}),
    newScene: { pirate: "up on deck in the sun: another place than below" }, sounds: [], beds: deckBeds(b - a), cam: (_t, u) => V.push(push * u), sun: { target: [x, MD, z], reach: 6 },
    cast: (t) => [on("pirate", PIRATE_D, m, t, MD, { patch: "A", ...(o.close ? LOOSE : G) }, 3), ...(mate ? [on("mate", MATE_D, mate, t, MD, {}, 5)] : [])],
    things: (g, c, _t, T2, cam) => { flagpole(g, T2); if (!o.close) carryBy(g, CHEST_S(), c.pirate, "L", c.pirate, "R", cam, CHEST_D); } } as Shot; };
const FACE = lens(-10.9 + 0.25, 1.45, 2.2 + 0.02, 1, -0.01, -3, 50);

// ---------------- below deck: the great cabin, dark ----------------
const CX = CABIN.at[0], CZ = CABIN.at[2];
const cabinLens = (x: number, y: number, z: number, fx: number, fz: number, pitch: number, fov: number) => lens(CX + x, FL + y, CZ + z, fx, fz, pitch, fov);
/** below deck: the water against the hull, muffled, and the timbers creaking now and then */
const BELOW = (len: number) => [{ k: "lap", a: 0, b: len, g: 0.7 }];
const lantern = (g: THREE.Group, T2: number, cam: Cam) => { const p = inCabin(CABIN.flame); glow(g, p, 0.35, 0.35, T2, Math.atan2(cam.pos[0] - p[0], cam.pos[2] - p[2]), 2); };
/** the mate below, no patch, blind in the dark: his hands up before his chest with the fingers loose, feeling the air, his head turning.
 *  (The review of the script: the hands spread with the palms to the lens; now chest high and relaxed, and each shot its own way) */
const FEELS: [[Seg, Seg], [Seg, Seg]][] = [
  [[[10, 6], [104, -14]], [[8, 8], [96, -10]]],      // both hands up before his chest, the elbows by his sides (reaching far out toward the lens, the arm hid its elbow)
  [[[38, 4], [96, -6]], [[14, 8], [70, -10]]],         // one reaching forward at chest height, the other lower by his belt
  [[[22, 6], [118, -14]], [[34, 4], [100, -10]]]];       // both close to his chest, one higher
/** the other end of a hand's search: the upper arm a little further out, the forearm a little lower */
const swing = (q: [Seg, Seg], k: number): [Seg, Seg] => [[q[0][0] - 6 * k, q[0][1] + 5], [q[1][0] - 14 * k, q[1][1] + 4]];
const mateBlind = (m: MM, len: number, v: number) => { const F = FEELS[v % 3], A = F, B: [[Seg, Seg], [Seg, Seg]] = [swing(F[0], 1), swing(F[1], -0.6)], R2 = { handL: "relaxed" as const, handR: "relaxed" as const };
  ease(m, -1, { armL: A[0], armR: A[1], head: [10, -2, 0], lean: 6 }, 0.01, { ...R2, face: LOST });
  wag(m, 0.2, len, P({ armL: A[0], armR: A[1], head: [14, -3, 0], lean: 6 }), P({ armL: B[0], armR: B[1], head: [-10, -1, 0], lean: 7 }), 1.5 + 0.2 * v, { ...R2, face: LOST, glide: true }); };
const mateShot = (id: string, a: number, b: number, V: Lens, at: V3, turn: number, v: number): Shot => {
  const m = mover(MATE_D, HM, at[0], at[2], V.toward(at[0], at[2], turn)); m.w = 0.09; m.stand(9); mateBlind(m, b - a + 0.5, v);
  return { id, a, b, still: (b - a) * 0.5, cam: (_t, u) => V.push(0.06 * u), sun: { target: at, reach: 4 }, sounds: [{ t: 0.08, k: "creak", g: 0.6 }], beds: BELOW(b - a),
    cast: (t) => [on("mate", MATE_D, m, t, FL, {}, 5)], things: (g, _c, _t, T2, cam) => lantern(g, T2, cam) } as Shot; };

// the pirate below, the patch on his left eye now ("B"), READING the log in the dark: the book held in both hands as in the shot library's
// 04, tipped up toward his face so that its pages face him, his eyes down on it (the review of the script: he must be seen to read)
const PIR_AT = inCabin([-0.3, 0, 0.25]), BOOK = once(() => noShade(logBook()));
const holdShot = (id: string, a: number, b: number, V: Lens, mateToo: boolean, first: boolean): Shot => {
  const hd = V.toward(PIR_AT[0], PIR_AT[2], 22), m = mover(PIRATE_D, H, PIR_AT[0], PIR_AT[2], hd); m.w = 0.09; m.stand(9);
  const rs: Stand = { D: PIRATE_D, at: PIR_AT, heading: hd, h: H, cam: V.cam, pose: {} }, rj = jointsOf(rs), rw = rightWay(rs);
  const rcOf = (k: number, fwd: number) => near(mix3(rj("pelvis"), rj("neck"), k), V.cam, fwd);
  const hold = (k: number, fwd: number, tilt = 0): Partial<Pose> => { const rc = rcOf(k, fwd); return { ...reach(rs, "R", aside(rc, V.cam, rw * 0.27, tilt)), ...reach(rs, "L", aside(rc, V.cam, -rw * 0.27, -tilt)) }; };
  const T0 = { handL: "grip" as const, handR: "grip" as const }, READ = { gaze: [-0.1, 0.9] as [number, number] };      // (gaze y: + is down)
  ease(m, -1, { ...hold(0.58, 0.41), head: [-8, 24, 0] }, 0.01, { ...T0, face: { brow: 0.6, lid: 0.48, smile: 0.6, ...READ } });
  ease(m, 0.3, { ...hold(0.58, 0.41), head: [-12, 25, 0], px: 0.012 }, 0.9, { ...T0, face: { brow: 0.9, lid: 0.45, smile: 0.8, ...READ } });
  ease(m, 1.4, { ...hold(0.57, 0.41, 0.02), head: [-6, 24, 0], px: 0 }, 0.8, { ...T0, face: { brow: 0.7, lid: 0.48, smile: 0.85, ...READ } });
  const at = rcOf(0.57, 0.41);
  let mt2: MM | null = null; const MB = inCabin([0.3, 0, -0.42]);
  if (mateToo) { mt2 = mover(MATE_D, HM, MB[0], MB[2], V.toward(MB[0], MB[2], 65)); mt2.w = 0.09; mt2.stand(9); mateBlind(mt2, b - a + 0.5, first ? 1 : 2); }
  return { id, a, b, still: (b - a) * 0.5, patchEye: { pirate: "B" }, ...(first ? {} : { newScene: { pirate: "below deck again: another place than the deck" } }),
    look: { pirate: { at, what: "the log in his hands" } }, cam: (_t, u) => V.push(0.06 * u), sun: { target: PIR_AT, reach: 4 }, sounds: [{ t: first ? 0.0 : 0.4, k: first ? "creak" : "paper", g: 0.8 }], beds: BELOW(b - a),
    cast: (t) => [on("pirate", PIRATE_D, m, t, FL, { patch: "B", ...T0 }, 3), ...(mt2 ? [on("mate", MATE_D, mt2, t, FL, {}, 5)] : [])],
    things: (g, c, _t, T2, cam) => { lantern(g, T2, cam); // (he reads it: its pages face him, so the lens sees its cover, with his fingers over the cover and the thumbs on the pages behind;
      //  tipped a little back so that its top leans toward his face)
      carryBy(g, BOOK(), c.pirate, "L", c.pirate, "R", cam, 0.1, "carry"); BOOK().rotateY(Math.PI); BOOK().rotateX(0.35); } } as Shot; };

// 1. WHY DID PIRATES WEAR EYE PATCHES? (the review: opening b, the strange thing already happening on the first frame) Below deck in the
//    dark the pirate reads the log, his patch on his left eye, while his shipmate behind him feels the air. A creak on the first frame
shots.push(holdShot("hook", 0, T.s2, cabinLens(0.02, 1.3, 3.6, 0.0, -1, -3, 54), true, true));
// 2. ONE IDEA: TO SEE IN THE DARK. The mate alone, feeling his way
const MAT_AT = inCabin([0.1, 0, 0.25]);
shots.push(mateShot("dark", T.s2, T.s3, cabinLens(0.05, 1.3, 3.05, 0.0, -1, -3, 54), MAT_AT, -70, 0));
// 3. UP ON DECK, THE SUN IS BLINDING. Both on deck in the sun, the mate screwing up his eyes, the pirate with his chest shifting his weight
shots.push(pirateDeck("sun", T.s3, T.s4, DECK, 0.12, SMUG, { mate: true, moves: true }));
// 4. GO BELOW, AND YOU CAN'T SEE A THING. The mate below, wider: the dark room round him. "Who blew out the sun?"
shots.push(mateShot("below", T.s4, T.s5, cabinLens(0.0, 1.3, 3.0, 0.02, -1, -1, 54), MAT_AT, 4, 1));
// 5. EYES NEED TWENTY TO THIRTY MINUTES TO GET USED TO THE DARK. The mate from his other side, still feeling his way
shots.push(mateShot("mins", T.s5, T.s6, cabinLens(0.45, 1.3, 2.95, -0.12, -1, -3, 54), MAT_AT, 60, 2));
// 6. BUT AN EYE UNDER A PATCH IS ALREADY USED TO IT. Close on his face and the patch (Shot.closeUp: the head whole, the body cut across the chest)
shots.push(pirateDeck("patch", T.s6, T.s7, lens(PIR_DECK[0] - 1.7, MD + 1.6, PIR_DECK[1] + 0.03, 1, -0.02, 1, 36), 0.08, { ...SMUG, smile: 0.8 }, { close: true }));
// 7. FLIP THE PATCH, AND YOU CAN SEE. Below, the patch on his left eye: he reads, closer than in the opening
shots.push(holdShot("flip", T.s7, T.s8, cabinLens(-0.15, 1.3, 3.05, -0.05, -1, -4, 50), false, false));

// 8. IN 2007, MYTHBUSTERS TESTED THE IDEA. THEIR VERDICT: PLAUSIBLE. He sits on a sea chest below (the shot library's 08: three
//    quarters on, the coat over his lap, the hands on his thighs), the patch on his left eye, nodding slowly
{ const V = cabinLens(-0.2, 1.2, 2.95, 0.0, -1, -3, 50), V2 = cabinLens(-0.75, 1.15, 2.75, 0.14, -1, -3, 50), p = inCabin([-0.35, 0, 0.3]), hd = V.toward(p[0], p[2], 55), fw: [number, number] = [Math.sin((hd * Math.PI) / 180), Math.cos((hd * Math.PI) / 180)];
  const SIT: Partial<Pose> = { py: -0.42, legL: { th: [84, 8], sh: [6, 4] }, legR: { th: [84, -8], sh: [6, -4] } };
  const LAP: [Seg, Seg] = [[16, 6], [66, 2]], LAPF: [Seg, Seg] = [[10, 8], [56, 4]];
  const SEAT = once(() => { const gS = chest(false, false, 0.62, 0.29, 0.42); gS.position.set(p[0] - fw[0] * 0.14, FL, p[2] - fw[1] * 0.14); return noShade(gS); });
  // (two shots: one lens for the test, another for the verdict, so that no shot runs over five seconds)
  const sit = (id: string, a: number, b: number, VV: Lens, first: boolean): Shot => ({ id, a, b, still: (b - a) * 0.5, patchEye: { pirate: "B" }, hide: ["table bottle"],
    sounds: first ? [{ t: 0.1, k: "creak", g: 0.5 }] : [], beds: BELOW(b - a),
    ...(first ? { newScene: { pirate: "a later moment below deck: he sits on a sea chest in another part of the cabin, the log put away" } } : {}), cam: (_t, u) => VV.push(0.06 * u), sun: { target: p, reach: 4 },
    cast: (t) => { const T2 = a + t; return [{ name: "pirate", D: PIRATE_D, h: H, at: p, heading: hd, noShade: true, pose: { ...POSES.stand, ...SIT, armL: LAPF, armR: LAP, head: [-6 + 5 * Math.sin(T2 * 1.1), 4 + 3 * Math.sin(T2 * 0.8), 0] },
      o: { handL: "relaxed", handR: "relaxed", patch: "B", face: { brow: 0.5 + 0.2 * Math.sin(T2 * 0.9), lid: 0.15, smile: 0.6 } } }]; },
    things: (g, _c, _t, T2, cam) => { lantern(g, T2, cam); g.add(SEAT()); } } as Shot);
  shots.push(sit("sit", T.s8, T.s8b, V, true), sit("verdict", T.s8b, T.s9, V2, false)); }

// 9. BUT DID REAL PIRATES DO IT? NOBODY KNOWS. On deck again, the patch on his right eye
// (the review: another frame than the others: low, from his left side, looking a little up at him against the sail)
shots.push(pirateDeck("nobody", T.s9, T.s10, lens(PIR_DECK[0] - 2.3, MD + 0.95, PIR_DECK[1] - 1.55, 0.83, 0.56, 6, 52), 0.1, { brow: 0.3, lid: 0.25, smile: 0.2 }, { moves: true, turn: 40 }));
// 10. NO PICTURE OR RECORD FROM THEIR TIME SAYS SO. (The review: show what is said.) On the cabin's back wall between two windows, an old
//     picture of pirates drawn by us: three of them on a deck, every one with both eyes, no patch; the lens goes in on it
const PRINT = once(() => noShade(piratePrint())), PRINT_AT = inCabin([0.62, 0, -CABIN.d / 2 + 0.1]);
shots.push({ id: "record", a: T.s10, b: T.s11, still: 1.5, sounds: [{ t: 0.2, k: "creak", g: 0.4 }], beds: [{ k: "lap", a: 0, b: T.s11 - T.s10, g: 0.7 }],
  cam: (_t, u) => lens(PRINT_AT[0], FL + 1.38, PRINT_AT[2] + 1.75, 0, -1, 0, 40).push(0.35 * u), sun: { target: [PRINT_AT[0], FL + 1.3, PRINT_AT[2]], reach: 4 },
  cast: () => [], things: (g, _c, _t, T2, cam) => { lantern(g, T2, cam); PRINT().position.set(PRINT_AT[0], FL + 1.38, PRINT_AT[2]); g.add(PRINT()); } } as Shot);
// 11. STILL. A VERY CLEVER TRICK. On deck, framed as the first shot, so that the film loops: "Arr. Which eye was it again?"
shots.push(pirateDeck("end", T.s11, T.end, FACE, 0.18, SMUG));

// (the words at the top of the picture, over the sky or the beams: lower, they lay over the figures' chests and hands)
for (const s of shots) s.capsTop = 160;

/** below deck is dark: a tint over the cabin's shots, deepest where the mate cannot see, lighter where the pirate's dark eye sees */
const BRIGHT = "radial-gradient(ellipse 72% 58% at 50% 55%, rgba(255,250,246,1) 0%, rgba(190,192,226,1) 100%)";
const DARK = "radial-gradient(ellipse 65% 50% at 50% 50%, rgba(120,122,160,1) 0%, rgba(48,50,84,1) 100%)";
const SEEN = "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(232,226,236,1) 0%, rgba(150,154,196,1) 100%)";
// (the low shot looks up across the sunlit deck: the boards in the lower half went white; a light veil keeps them wood)
const SUNLOW = "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 55%, rgba(222,214,200,1) 100%)";
const gradeAt = (T2: number) => { const s = shots.find((q) => T2 >= q.a && T2 < q.b); return !s ? null : s.id === "nobody" ? SUNLOW : s.id === "hook" ? BRIGHT : ["dark", "below", "mins"].includes(s.id) ? DARK : ["flip", "sit", "verdict", "record"].includes(s.id) ? SEEN : null; };

export const EYE_PATCH: Film = {
  id: "eye-patch", fps: 30, seconds: T.end, music: "shanty", audio: "craft/eye-patch.wav", sky: "#a9dcff", world: cabinSea, shots, words: W, solids: FLAGSEA_SOLIDS, grade: gradeAt,
  hook: { text: ["WHY DID PIRATES", "WEAR EYE PATCHES?"], a: 0, b: T.s2, size: 84, top: 150 },
  // our own lines (DAILY-RULES, "Our own lines"), as bubbles: the mate in the dark, and the pirate at the end, which leads back to the start
  bubbles: [{ a: L.below.b + 0.05, b: L.mins.a + 0.75, text: "Who blew out the sun?!", who: "mate" }, { a: L.trick.b + 0.1, b: T.end - 0.05, text: "Arr. Which eye was it?", who: "pirate" }],
  thumbs: [
    { T: 1.6, words: ["THE EYE", "PATCH TRICK"], y: 0.7, size: 140 },
    { T: T.s7 + 1.0, words: ["HE CAN", "SEE IN THE DARK"], y: 0.72, size: 120 },
    { T: T.s5 + 1.2, words: ["WHO BLEW", "OUT THE SUN?"], y: 0.72, size: 120 },
  ],
};

// Short: the pirate eye patch tale (20 Nov 2026; granskning/ogonlapp/manus.md). Sir Digsworth tells it (bm_george) and is not seen. A pirate
// with a patch stands on the sunny deck; below deck his shipmate, with no patch, cannot see a thing; the pirate, down there, has moved the
// patch to the other eye (only ever in a cut) and sees. Then what is known: the eye takes minutes to get used to the dark, MythBusters
// called the idea plausible in 2007, and nothing from the pirates' own time says they did it. The tale is told as a tale and the facts as
// facts. Only the approved shot types (Jesper, 20 Nov: 04 hold with both hands, 08 sit, standing talk without stiff arms, empty set
// shots): nobody walks, no door, no hand to the face. The patch's eye is the script's (Shot.patchEye) and the checks hold it there.
import * as THREE from "three";
import { Film, Shot, Cam, V3, Word, Actor, play, mix3 } from "../stage/film";
import { mover, wag, ease, type MM } from "../stage/acting";
import { lens, once, noShade, near, aside, put } from "../stage/staging";
import { reach, jointsOf, carryBy, type Stand } from "../stage/grips";
import { FLAGSEA_SOLIDS, MERCHANT_DECK } from "../world/ship";
import { CABIN, inCabin, cabinSea } from "../world/cabin";
import { glow } from "../world/fire";
import { logBook, clothFlag, piratePrint } from "../world/props";
import { rod, mesh, box, type CardLight } from "../world/kit";
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

// ---------------- v1c (the review of v1b, 20 Nov): below deck dark behind shut shutters, the patch's move shown in two close-ups (deck,
// a whoosh, the dark), the same open book in his hands in every shot, the mate searching with his eyes and hands, no shot still for more
// than 2.5 s, no jump cut, no picture twice, and the last shot the first one again so that the film loops ----------------
const KK = 0.52, FF = 0.36;      // (the shot library 04's grip; 0.55-0.6 high turned an elbow the wrong way at some lenses)
const BOOK = once(() => noShade(logBook(0.54, 0.36, 0.25))), T0H = { handL: "thumb" as const, handR: "thumb" as const };
const READ: Face = { brow: 0.6, lid: 0.42, smile: 0.6, gaze: [-0.1, 0.9] };      // (gaze y: + is down)
/** the pirate reading the open log, held in both hands as in the shot library's 04 (the thumbs over the pages, the fingers behind), turned
 *  a little toward him so that it shows as an open book; his eyes down on it. `sun`: on deck with the patch on his right eye; else below,
 *  the patch on his left eye and the right eye's pupil wide. `looks`: from `looks` on he looks up from the book at the lens, pleased */
const reader = (at: V3, y: number, V: Lens, turn: number, sun: boolean, len: number, o: { looks?: number; moves?: boolean; gx?: number } = {}) => {
  const hd = V.toward(at[0], at[2], turn), m = mover(PIRATE_D, H, at[0], at[2], hd); m.w = 0.09; m.stand(9);
  // (the arms solved once, as the shot library's 04 holds its book, from a lens straight before him: the joint angles are his own and hold
  //  the book the same way in every shot, whatever lens sees it. Solved toward each shot's own lens, the elbows twisted at side views)
  const hr0 = (hd * Math.PI) / 180, ref = lens(at[0] + Math.sin(hr0) * 3.6, y + 1.3, at[2] + Math.cos(hr0) * 3.6, -Math.sin(hr0), -Math.cos(hr0), -3, 50);
  const rs: Stand = { D: PIRATE_D, at: [at[0], y, at[2]], heading: hd, h: H, cam: V.cam, pose: {} }, rj = jointsOf(rs), rw = rightWay(rs); void ref;
  const rcOf = (k: number, fwd: number) => near(mix3(rj("pelvis"), rj("neck"), k), V.cam, fwd);
  const hold = (k: number, fwd: number, tilt = 0): Partial<Pose> => { const rc = rcOf(k, fwd); return { ...reach(rs, "R", aside(rc, V.cam, rw * 0.27, tilt)), ...reach(rs, "L", aside(rc, V.cam, -rw * 0.27, -tilt)) }; };
  const face = (f: Face): Face => ({ ...f, ...(f.gaze && o.gx !== undefined ? { gaze: [o.gx, f.gaze[1]] as [number, number] } : {}), ...(sun ? {} : { pupil: 1.45 }) });
  ease(m, -1, { ...hold(KK, FF), head: [-6, 18, 0] }, 0.01, { ...T0H, face: face(READ) });
  ease(m, 0.25, { ...hold(KK, FF, 0.015), head: [-10, 19, 0], px: 0.015, hipTilt: -2 }, 0.8, { ...T0H, face: face({ ...READ, smile: 0.75 }) });
  // (moves: his head drops further to the page and comes back; a third grip solved for it turned his left elbow the wrong way)
  if (o.moves) ease(m, 1.6, { ...hold(KK, FF, 0.015), head: [-4, 22, 0] }, 0.6, { ...T0H, face: face({ ...READ, brow: 0.8 }) });
  if (o.looks !== undefined) ease(m, o.looks, { ...hold(KK, FF), head: [2, 3, 0], px: 0 }, 0.5, { ...T0H, face: face({ brow: 0.9, lid: 0.15, smile: 0.9 }) });
  const lookAt = rcOf(KK, FF);
  return { m, cast: (t: number) => on("pirate", PIRATE_D, m, t, y, { patch: sun ? "A" : "B", ...T0H }, 3), book: (g: THREE.Group, c: Record<string, any>, cam: Cam) => { carryBy(g, BOOK(), c.pirate, "L", c.pirate, "R", cam, 0.1, "carry", true); },
    look: { pirate: { at: lookAt, what: "the log in his hands", to: o.looks ?? 99 } }, len };
};
/** the mate below, no patch, blind in the dark: screwing up his eyes, his eyes searching one way and the other, his head turning, one hand
 *  feeling the air ahead at chest height with loose fingers and the other near his chest; each shot its own way (the review of v1b: he
 *  smiled and stood still, a palm flat to the lens, the same picture twice) */
const SEARCH = (g: number): Face => ({ brow: 0.95, lid: 0.38, wide: 0, mouth: 0.04, smile: -0.9, gaze: [g, -0.1] });      // (worried, squinting: with the mouth open he seemed to smile, the review of v1b)
const FEEL: [[Seg, Seg], [Seg, Seg]][] = [
  [[[36, 6], [96, -6]], [[8, 10], [70, -12]]],
  [[[12, 8], [74, -10]], [[34, 4], [100, -4]]],
  [[[40, 2], [104, -8]], [[16, 12], [96, -16]]]];
const mate = (at: V3, V: Lens, turn: number, v: number, len: number, hang = false) => {
  const m = mover(MATE_D, HM, at[0], at[2], V.toward(at[0], at[2], turn)); m.w = 0.09; m.stand(9);
  const [A, B] = hang ? [REST.armL as [Seg, Seg], REST.armR as [Seg, Seg]] : FEEL[v % 3], R2 = { handL: "relaxed" as const, handR: "relaxed" as const }, sw = (q: [Seg, Seg], k: number): [Seg, Seg] => [[q[0][0] + 8 * k, q[0][1] + 4], [q[1][0] + 10 * k, q[1][1] + 6]];
  ease(m, -1, { armL: A, armR: B, head: [18, -4, 0], lean: 6 }, 0.01, { ...R2, face: SEARCH(0.8) });
  wag(m, 0.1, len + 0.5, P({ armL: A, armR: B, head: [22, -5, 4], lean: 6, px: 0.012 }), P({ armL: sw(A, 1), armR: sw(B, -1), head: [-20, -2, -4], lean: 8, px: -0.012 }), 1.3 + 0.15 * v, { ...R2, face: SEARCH(-0.8), glide: true });
  return { cast: (t: number) => on("mate", MATE_D, m, t, FL, {}, 5) };
};

// below deck: the shutters closed over the windows, the room lit only by the lantern on the table: dark, with warm light on the faces
// from the lantern's side and a thin rim so that the figures read on a phone
const CX = CABIN.at[0], CZ = CABIN.at[2];
/** a lens on a figure standing at `at` (floor height y), looking along the way `yaw` (degrees; 0 = toward -z, into the cabin's back wall,
 *  90 = toward +x): "full" shows the whole figure with room to every edge, "close" his head and shoulders (Shot.closeUp), "two" a little
 *  wider for two. (Placed by hand in v1c's first try, nine lenses cut a figure at the edge) */
const frameOn = (at: V3, y: number, yaw: number, kind: "full" | "close" | "two", fov?: number, far = 1) => { const r = (yaw * Math.PI) / 180, fx = Math.sin(r), fz = -Math.cos(r);
  const f = fov ?? (kind === "close" ? 36 : kind === "two" ? 54 : 50), d = far * (kind === "close" ? 1.75 : (kind === "two" ? 1.3 : 1.18) / Math.tan(((f / 2) * Math.PI) / 180)), h = kind === "close" ? 1.74 : 1.25;
  return lens(at[0] - fx * d, y + h, at[2] - fz * d, fx, fz, kind === "close" ? 0 : -3, f); };
const cabinLens = (x: number, y: number, z: number, fx: number, fz: number, pitch: number, fov: number) => lens(CX + x, FL + y, CZ + z, fx, fz, pitch, fov);
const LANT_AT = inCabin(CABIN.flame);
const SHUTTERS = once(() => { const g = new THREE.Group();
  for (const wx of CABIN.win) { const c = inCabin([wx, CABIN.winY + CABIN.winH / 2, -CABIN.d / 2 + 0.085]); g.add(mesh(box(CABIN.winW + 0.12, CABIN.winH + 0.12, 0.04), "#3a2416", { at: c, line: 0.5 }));
    for (const dx of [-0.2, 0, 0.2]) g.add(mesh(box(0.012, CABIN.winH + 0.1, 0.045), "#24160c", { at: [c[0] + dx * CABIN.winW, c[1], c[2] + 0.002], line: 0, shadow: false })); }
  return noShade(g); });
// (and a weak cool fill from the room's open side, so that a face turned away from the lantern still reads in a close-up)
const DARK_LIGHT: CardLight = { amb: "#544e5c", rim: 1.0, lights: [{ at: [LANT_AT[0], FL + 1.1, LANT_AT[2]], color: "#ffb468", power: 2.6, reach: 3.6, rimK: 0.8 }, { at: inCabin([-0.2, 1.6, 1.9]), color: "#a8b0d8", power: 0.9, reach: 3.0, rimK: 0 }] };
const below = (g: THREE.Group, T2: number, cam: Cam, noGlow = false) => { g.add(SHUTTERS()); if (!noGlow) glow(g, [LANT_AT[0], FL + 0.88, LANT_AT[2]], 0.6, 0.6, T2, Math.atan2(cam.pos[0] - LANT_AT[0], cam.pos[2] - LANT_AT[2]), 3); };
const BELOW = (len: number) => [{ k: "lap", a: 0, b: len, g: 0.7 }];
type ShotO = { id: string; a: number; b: number; V: Lens; push?: number; cast: ((t: number) => Actor)[]; things?: (g: THREE.Group, c: Record<string, any>, cam: Cam) => void; sun: boolean; patch?: "A" | "B"; look?: Shot["look"]; close?: boolean; sounds?: Shot["sounds"]; hide?: string[]; newScene?: Shot["newScene"] };
const add = (o: ShotO) => shots.push({ id: o.id, a: o.a, b: o.b, still: (o.b - o.a) * 0.5, cam: (_t, u) => o.V.push((o.push ?? 0.06) * u), sun: { target: o.sun ? [PIR_DECK[0], MD, PIR_DECK[1]] : inCabin([0, 0, 0]), reach: o.sun ? 6 : 4 },
  ...(o.patch ? { patchEye: { pirate: o.patch } } : {}), ...(o.close ? { closeUp: { pirate: "close on his face and the patch", mate: "close on his face in the dark" } } : {}), look: o.look, hide: o.hide, newScene: o.newScene,
  ...(o.sun ? {} : { light: DARK_LIGHT }), sounds: o.sounds ?? [], beds: o.sun ? deckBeds(o.b - o.a) : BELOW(o.b - o.a),
  cast: (t) => o.cast.map((f) => f(t)), things: (g, c, _t, T2, cam) => { if (o.sun) flagpole(g, T2); else below(g, T2, cam, o.id.startsWith("record")); o.things?.(g, c, cam); } } as Shot);

// ---------------- the deck in the sun ----------------
const DECK = lens(-10.9, 1.5, 2.2, 1, 0, 0, 50);      // (level: tipped down, a hatch at the bottom right corner was cut by the edge)
const deckAt = (d: number, l: number): [number, number] => DECK.spot(d, l);
const PIR_DECK = deckAt(3.2, 0.08), PIR_DECK3: V3 = [PIR_DECK[0], MD, PIR_DECK[1]];
// (the flag lower on its pole, so that it flies whole in the picture under the words: at the top it was cut by the edge, and the words lay over it)
const FLAG = once(() => clothFlag("pirate", 1.0, 0.68)), POLE_AT = deckAt(4.7, 0.72);
const flagpole = (g: THREE.Group, T2: number) => { g.add(rod([POLE_AT[0], MD, POLE_AT[1]], [POLE_AT[0], MD + 2.55, POLE_AT[1]], 0.035, "#5a3a22"));
  const f = FLAG(); f.wave(T2, 1); put(g, f.obj, [POLE_AT[0], MD + 2.5, POLE_AT[1]], Math.PI / 2); };
const deckBeds = (len: number) => [{ k: "sea", a: 0, b: len, g: 0.8 }, { k: "wind", a: 0, b: len, g: 0.45 }, { k: "birds", a: 0, b: len, g: 0.3 }, { k: "flap", a: 0, b: len, g: 0.35 }];
const FACE = lens(-10.9 + 0.25, 1.45, 2.2 + 0.02, 1, -0.01, -3, 50);
const MATE_DECK = deckAt(5.0, -0.78);

// ---------------- the shots ----------------
const PIR_AT = inCabin([-0.3, 0, 0.25]), MAT_AT = inCabin([0.32, 0, -0.42]), MAT_AT2 = inCabin([0.1, 0, 0.25]);
const WIDE = cabinLens(0.02, 1.3, 3.6, 0.0, -1, -3, 54);
const S = {
  s2: T.s2, s3: T.s3, s4: T.s4, s4b: L.below.b, s5: L.mins.a + 0.8, s5b: L.mins.a + 2.3, s6: T.s6, s6b: L.patch.a + 1.4, s7: T.s7, s8: T.s8, s8b: L.myth.a + 2.0, s9: T.s8b, s10: T.s9, s10b: L.but.b + 0.15, s11: T.s10, s11b: L.proof.a + 1.6, s12: T.s11, s12b: L.trick.b - 0.25, end: T.end };
// 1. (0 - 2.4) WHY DID PIRATES WEAR EYE PATCHES? In the dark below, the pirate reads calmly while his shipmate behind him feels the air. A
//    creak on the first frame. The last shot is this one again
const opening = (id: string, a: number, b: number) => { const r = reader(PIR_AT, FL, WIDE, 22, false, b - a), mt = mate(MAT_AT, WIDE, 65, 0, b - a);
  add({ id, a, b, V: WIDE, cast: [r.cast, mt.cast], things: r.book, sun: false, patch: "B", look: r.look, sounds: [{ t: 0, k: "creak", g: 0.8 }], ...(id === "hook" ? {} : { newScene: { pirate: "the same moment below as the opening: the film loops" } }) }); };
opening("hook", 0, S.s2);
// 2. (2.4 - 4.8) ONE IDEA: TO SEE IN THE DARK. The mate closer, from his left, screwing up his eyes, a hand feeling ahead
{ const V = frameOn(MAT_AT2, FL, 30, "full", 46, 1.2), mt = mate(MAT_AT2, V, -55, 1, S.s3 - S.s2); add({ id: "dark", a: S.s2, b: S.s3, V, cast: [mt.cast], sun: false }); }
// 3. (4.8 - 7.2) UP ON DECK, THE SUN IS BLINDING. On deck in the sun: the pirate reads (the patch on his right eye), the mate squints
//    (the lens tipped 4 degrees up and the two half a step further off: tipped down, the merchant's hatch stood cut by the bottom right
//    corner, the review of v1b)
{ const SV = lens(-10.9, 1.5, 2.2, 1, 0, 4, 50), P3 = DECK.spot(3.5, 0.05), MS = DECK.spot(5.1, -0.8), PS: V3 = [P3[0], MD, P3[1]];
  const r = reader(PS, MD, SV, 24, true, S.s4 - S.s3, { moves: true }), mm = mover(MATE_D, HM, MS[0], MS[1], SV.toward(MS[0], MS[1], -24)); mm.w = 0.09; mm.stand(9);
  ease(mm, -1, { ...REST, head: [8, -6, 0], lean: 3 }, 0.01, { ...LOOSE, face: SQUINT }); ease(mm, 0.5, { ...REST, head: [-6, -9, 0], lean: 5, py: -0.01 }, 1.0, { ...LOOSE, face: { ...SQUINT, lid: 0.75 } });
  add({ id: "sun", a: S.s3, b: S.s4, V: SV, push: 0.08, cast: [r.cast, (t) => on("mate", MATE_D, mm, t, MD, {}, 5)], things: r.book, sun: true, patch: "A", look: r.look, newScene: { pirate: "up on deck in the sun: another place than below" } }); }
// 4. (7.2 - 9.45) GO BELOW, AND YOU CAN'T SEE A THING. Below, wide and dark, the mate small in the room, feeling his way, from the far side
{ const V = frameOn(MAT_AT2, FL, -32, "full", 50, 1.55), mt = mate(MAT_AT2, V, 60, 2, S.s4b - S.s4); add({ id: "below", a: S.s4, b: S.s4b, V, cast: [mt.cast], sun: false, sounds: [{ t: 0.05, k: "creak", g: 0.6 }] }); }
// 5. (9.45 - 11.15) "Who blew out the sun?!" Close on the mate's face in the dark
{ const V = frameOn(MAT_AT2, FL, -12, "close"), mt = mate(MAT_AT2, V, 25, 0, S.s5 - S.s4b, true); add({ id: "who", a: S.s4b, b: S.s5, V, push: 0.03, cast: [mt.cast], sun: false, close: true }); }
// 6. (11.15 - 12.65) EYES NEED TWENTY TO THIRTY MINUTES... The pirate reads on, calm, closer than the opening
{ const V = frameOn(PIR_AT, FL, -20, "full", 46), r = reader(PIR_AT, FL, V, 18, false, S.s5b - S.s5, { moves: true }); add({ id: "calm", a: S.s5, b: S.s5b, V, cast: [r.cast], things: r.book, sun: false, patch: "B", look: r.look }); }
// 7. (12.65 - 14.15) ...TO GET USED TO THE DARK. The mate from behind his right shoulder, still feeling his way
{ const V = frameOn(MAT_AT, FL, 38, "full", 50), mt = mate(MAT_AT, V, 60, 1, S.s6 - S.s5b); add({ id: "mins", a: S.s5b, b: S.s6, V, cast: [mt.cast], sun: false }); }
// 8. (14.15 - 15.6) BUT AN EYE UNDER A PATCH... On deck, the pirate reading in the sun, from low at his side
{ const V = lens(PIR_DECK[0] - 2.6, MD + 0.95, PIR_DECK[1] - 1.75, 0.83, 0.56, 5, 52), r = reader(PIR_DECK3, MD, V, 20, true, S.s6b - S.s6); add({ id: "deck2", a: S.s6, b: S.s6b, V, cast: [r.cast], things: r.book, sun: true, patch: "A", look: r.look, newScene: { pirate: "up on deck in the sun: another place than below" } }); }
// 9. (15.6 - 17.1) ...IS ALREADY USED TO IT. Close on his face in the sun: the patch over his right eye (the first of the pair)
{ const V = frameOn(PIR_DECK3, MD, 90, "close"), r = reader(PIR_DECK3, MD, V, 16, true, S.s7 - S.s6b, { looks: 0.2 }); add({ id: "patch", a: S.s6b, b: S.s7, V, push: 0.05, cast: [r.cast], things: r.book, sun: true, patch: "A", close: true }); }
// 10. (17.1 - 19.4) FLIP THE PATCH, AND YOU CAN SEE. A whoosh, and close on his face in the dark: the patch over his LEFT eye now, his right
//     eye wide open with a big dark pupil (the second of the pair: the move itself is never shown)
{ const V = frameOn(PIR_AT, FL, 0, "close"), r = reader(PIR_AT, FL, V, 14, false, S.s8 - S.s7, { looks: 0.15 }); add({ id: "flip", a: S.s7, b: S.s8, V, push: 0.04, cast: [r.cast], things: r.book, sun: false, patch: "B", close: true, sounds: [{ t: 0, k: "whoosh", g: 0.9 }], newScene: { pirate: "below deck: the patch moved to his other eye between the two close-ups" } }); }
// 11. (19.4 - 21.4) IN 2007, MYTHBUSTERS... The pirate reading, seen from his right, with the lantern beside him
{ const V = frameOn(PIR_AT, FL, 34, "full", 48), r = reader(PIR_AT, FL, V, 18, false, S.s8b - S.s8, { moves: true }); add({ id: "myth", a: S.s8, b: S.s8b, V, cast: [r.cast], things: r.book, sun: false, patch: "B", look: r.look }); }
// 12. (21.4 - 23.5) ...TESTED THE IDEA. The mate turned the other way, feeling along the dark
{ const V = frameOn(MAT_AT2, FL, -24, "full", 50, 1.15), mt = mate(MAT_AT2, V, -60, 2, S.s9 - S.s8b); add({ id: "test", a: S.s8b, b: S.s9, V, cast: [mt.cast], sun: false }); }
// 13. (23.5 - 25.45) THEIR VERDICT: PLAUSIBLE. The pirate looks up from the book at us, pleased
{ const V = frameOn(PIR_AT, FL, 18, "full", 44, 1.12), r = reader(PIR_AT, FL, V, 10, false, S.s10 - S.s9, { looks: 0.4 }); add({ id: "verdict", a: S.s9, b: S.s10, V, cast: [r.cast], things: r.book, sun: false, patch: "B" }); }
// 14. (25.45 - 27.5) BUT DID REAL PIRATES DO IT? On deck in the sun, seen from his other side, reading
{ const V = frameOn(PIR_DECK3, MD, 118, "full", 50), r = reader(PIR_DECK3, MD, V, 18, true, S.s10b - S.s10, { moves: true });
  add({ id: "real", a: S.s10, b: S.s10b, V, cast: [r.cast], things: r.book, sun: true, patch: "A", look: r.look, newScene: { pirate: "up on deck in the sun: another place than below" } }); }
// 15. (27.5 - 28.95) NOBODY KNOWS. Close on him in the sun: he looks up from the book and shrugs with his face
{ const V = frameOn(PIR_DECK3, MD, 70, "close"), r = reader(PIR_DECK3, MD, V, 8, true, S.s11 - S.s10b, { looks: 0.1 }); add({ id: "nobody", a: S.s10b, b: S.s11, V, push: 0.05, cast: [r.cast], things: r.book, sun: true, patch: "A", close: true }); }
// 16-17. (28.95 - 32.2) NO PICTURE OR RECORD FROM THEIR TIME SAYS SO. Below, in the lantern light on the wall, the old picture of pirates
//    drawn by us: wide, then close on their faces, every one with both eyes
const PRINT = once(() => noShade(piratePrint())), PRINT_AT = inCabin([0.62, 0, -CABIN.d / 2 + 0.1]);
const print = (g: THREE.Group) => { PRINT().position.set(PRINT_AT[0], FL + 1.38, PRINT_AT[2]); g.add(PRINT()); };
add({ id: "record", a: S.s11, b: S.s11b, V: lens(PRINT_AT[0] - 0.08, FL + 1.36, PRINT_AT[2] + 1.15, 0.07, -1, 0, 42), push: 0.15, cast: [], things: (g) => print(g), sun: false, sounds: [{ t: 0.2, k: "creak", g: 0.4 }] });
add({ id: "record2", a: S.s11b, b: S.s12, V: lens(PRINT_AT[0] + 0.02, FL + 1.39, PRINT_AT[2] + 0.75, -0.02, -1, 0, 34), push: 0.12, cast: [], things: (g) => print(g), sun: false });
// 18. (32.2 - 33.9) STILL. A VERY CLEVER TRICK. Close on him below, looking up from the book, smug
{ const V = frameOn(PIR_AT, FL, -25, "close"), r = reader(PIR_AT, FL, V, 8, false, S.s12b - S.s12, { looks: 0.1 }); add({ id: "trick", a: S.s12, b: S.s12b, V, push: 0.04, cast: [r.cast], things: r.book, sun: false, patch: "B", close: true }); }
// 19. (33.9 - end) The opening again, and the bubble: "Arr. Which eye was it?"
opening("end", S.s12b, S.end);
for (const s of shots) s.capsTop = 160;

/** below deck is dark (the shutters shut); the deck in the sun. The opening is a little lighter than the rest below, so that it reads on a phone */
const DARK = "radial-gradient(ellipse 66% 52% at 50% 50%, rgba(222,212,214,1) 0%, rgba(150,142,160,1) 45%, rgba(54,52,82,1) 100%)";
const HOOKDARK = "radial-gradient(ellipse 70% 56% at 50% 50%, rgba(240,232,232,1) 0%, rgba(172,164,180,1) 45%, rgba(64,62,94,1) 100%)";
const SUNLOW = "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 55%, rgba(222,214,200,1) 100%)";
const gradeAt = (T2: number) => { const s = shots.find((q) => T2 >= q.a && T2 < q.b); if (!s) return null; if (["hook", "end"].includes(s.id)) return HOOKDARK; if (s.id === "deck2") return SUNLOW; return ["sun", "deck2", "patch", "real", "nobody"].includes(s.id) ? null : DARK; };

export const EYE_PATCH: Film = {
  id: "eye-patch", fps: 30, seconds: T.end, music: "shanty", audio: "craft/eye-patch.wav", sky: "#a9dcff", world: cabinSea, shots, words: W, solids: FLAGSEA_SOLIDS, grade: gradeAt,
  hook: { text: ["WHY DID PIRATES", "WEAR EYE PATCHES?"], a: 0, b: T.s2, size: 84, top: 150 },
  bubbles: [{ a: L.below.b + 0.05, b: S.s5 - 0.05, text: "Who blew out the sun?!", who: "mate" }, { a: L.trick.b + 0.1, b: T.end - 0.05, text: "Arr. Which eye was it?", who: "pirate" }],
  thumbs: [
    { T: 1.6, words: ["THE EYE", "PATCH TRICK"], y: 0.7, size: 140 },
    { T: S.s7 + 1.0, words: ["HE CAN", "SEE IN THE DARK"], y: 0.72, size: 120 },
    { T: S.s4b + 0.8, words: ["WHO BLEW", "OUT THE SUN?"], y: 0.72, size: 120 },
  ],
};

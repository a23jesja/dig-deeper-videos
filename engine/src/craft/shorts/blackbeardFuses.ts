// Short: "Why did Blackbeard light fuses in his beard?" (granskning/blackbeard-fuses/manus.md, version 2), opening with the hook lab's
// chosen clip b (its first two shots and Sir Digsworth's question, as approved). The narration is voice/blackbeard-fuses (bm_george);
// the shots are cut to its lines. Most of it is played in his great cabin (world/cabin.ts), where he makes himself ready: the ribbons in
// his beard, the fuses under his hat, the sling of six pistols. Then what it was for, where the story comes from, and the last breath of
// smoke that fills the picture and loops to the first frame (him walking out of the smoke).
import * as THREE from "three";
import { Film, Shot, Cam, V3, Word, play, talk, smooth, mix3 as mix } from "../stage/film";
import { mover, mt, wag, arm, MM } from "../stage/acting";
import { lens, once, noShade, near, fuseSmoke, aside, stageAt, palm } from "../stage/staging";
import { wield, usePose, reach, jointsOf, carryBy, vanish, setDown, quiet, Stand, SABRE, RIBBON, SPILL, FUSE } from "../stage/grips";
import { FLAGSEA_SOLIDS, MERCHANT_DECK } from "../world/ship";
import { CABIN, inCabin, cabinSea } from "../world/cabin";
import { bank, glow } from "../world/fire";
import { barrel, sabre, tray, spill, fuseCord, pistolSling, openBook, ribbonBow } from "../world/props";
import { SIR_D, SAILOR_D, OLDHAND_D, SHIPBOY_D, COOK_D, PIRATE2_D, TOWNSWOMAN_D, BLACKBEARD_ARMED_D, BLACKBEARD_PREP_D, BLACKBEARD_BARE_D, BLACKBEARD_HALF_D, BLACKBEARD_UNLIT_D, BLACKBEARD_D, BLACKBEARD_ONE_D } from "../looks";
import type { Pose } from "../rig";
import type { Design, Face } from "../designs/common";
import W0 from "../../../voice/blackbeard-fuses/words.json";
import L0 from "../../../voice/blackbeard-fuses/lines.json";

type Lines = Record<string, { id: string; a: number; b: number }>;
const W = W0 as Word[], L = Object.fromEntries((L0 as { id: string; a: number; b: number }[]).map((x) => [x.id, x])) as Lines;
const P = (o: Partial<Pose>) => o, MD = MERCHANT_DECK, FL = CABIN.at[1];
const on = (name: string, D: Design, m: MM, t: number, y: number, o: Parameters<typeof play>[6] = {}) => play(name, D, m, t, [0, y, 0], m.h, o);
const MENACE: Face = { brow: -1, lid: 0.25, smile: 0.35, gaze: [0, 0] };
const GRIM: Face = { brow: -0.9, lid: 0.2, smile: -0.3, mouth: 0 };
const CUTLASS = once(() => noShade(sabre(0.6))), BARREL = once(() => barrel(0.9, 0.32, "#8a5a36"));
const TRAY_O = once(() => tray()), SPILL_O = once(() => noShade(spill())), RIB = once(() => noShade(ribbonBow("#2f6fb0", 1.3)));
const FUSE_R = once(() => noShade(fuseCord())), FUSE_L = once(() => noShade(fuseCord())), FUSE_LIT = once(() => noShade(fuseCord(0.17, true))), SLING = once(() => pistolSling(0.62)), BOOK = once(() => openBook());
type Lens = ReturnType<typeof lens>;
/** the gun smoke over a deck: soft banks d metres ahead of the lens and l to its right, behind the faces */
const powder = (g: THREE.Group, T: number, cam: Cam, V: Lens, y: number, banks: ([number, number, number, number] | [number, number, number, number, number])[], seed = 0) =>
  banks.forEach(([d, l, w, o, h = 1.8], i) => { const [x, z] = V.spot(d, l); bank(g, [x, y, z], T, Math.atan2(cam.pos[0] - x, cam.pos[2] - z), w, h, Math.max(4, Math.round((w * 2 * h) / 1.8)), 1.6 * Math.sqrt(h / 1.8), o, 0.12, seed + i * 3); });
/** the lantern's light in the cabin: a warm glow round its flame */
const lantern = (g: THREE.Group, T: number, cam: Cam) => { const p = inCabin(CABIN.flame); glow(g, p, 0.5, 0.5, T, Math.atan2(cam.pos[0] - p[0], cam.pos[2] - p[2]), 2); };
/** the glow at the lit end of a held thing */
const tipGlow = (g: THREE.Group, o: THREE.Object3D, cam: Cam, w = 0.14) => { o.updateMatrixWorld(true); const q = new THREE.Vector3(...(o.userData.tip as V3)).applyMatrix4(o.matrixWorld); glow(g, [q.x, q.y, q.z], w, w, 0, Math.atan2(cam.pos[0] - q.x, cam.pos[2] - q.z)); };
const rightWay = (s: Stand) => { const j = jointsOf(s), r = aside([0, 0, 0], s.cam, 1); return Math.sign((j("shR")[0] - j("shL")[0]) * r[0] + (j("shR")[2] - j("shL")[2]) * r[2]) || -1; };
const SIT: Partial<Pose> = { py: -0.5, legL: { th: [84, 8], sh: [6, 4] }, legR: { th: [84, -8], sh: [6, -4] } };
const STAND: Partial<Pose> = { py: 0, legL: { th: [0, 4], sh: [0, 3] }, legR: { th: [0, -4], sh: [0, -3] } };
/** where the cut between two lines falls: half way through the pause */
const cut = (a: string, b: string) => (L[a].b + L[b].a) / 2;
const shots: Shot[] = [];
const T = { s1: cut("hook", "why"), s2: 3.89, s3: cut("guess", "no"), s4: cut("no", "beard"), s5: 11.5, s6: cut("beard", "fuses"), s7: 16.6, s8: cut("fuses", "pistols"), s9: cut("pistols", "hell"), s10: cut("hell", "surrender"), s11: cut("surrender", "book"), s12: cut("book", "costume"), end: 37.0 };

// 1. BLACKBEARD'S BEARD SMOKED IN BATTLE. He strides out of the smoke with his cutlass up, the lens low and looking up at him; the crew
// scatter (the hook lab's clip b, now with the sling of pistols across his chest: "In Time of Action, he wore a Sling")
{ const LOW = lens(-10.6, 0.95, 1.3, 1, 0.06, 9, 56), [rx, rz] = LOW.spot(3.9, 0.15), bb = mover(BLACKBEARD_ARMED_D, 1.92, rx, rz, LOW.toward(rx, rz, 0)); bb.walk(mt(bb, 1.4), { step: 0.6, tau: 0.45 }).stand(9);
  bb.actAt(-1, { ...usePose(SABRE, "raised", "R"), armL: arm(20, 30, 50, 30), head: [0, 6, 0], lean: 4 }, 10, { in: 0.01, handL: "fist", handR: "grip", face: { ...MENACE, mouth: 0.5 } });
  const backer = (D: Design, h: number, d: number, l: number, off: number, t0: number) => { const [x, z] = LOW.spot(d, l), m = mover(D, h, x, z, LOW.toward(x, z, off)); m.stand(9);
    m.actAt(-1, { armL: arm(40, 24, 96, 10), armR: arm(40, 24, 96, 10), head: [0, -4, 0] }, 10, { in: 0.01, handL: "open", handR: "open", face: { wide: 0.8, lid: 0, brow: 0.8, smile: -0.6 } });
    m.actAt(t0, { armL: arm(148, 34, 178, 16), armR: arm(148, 34, 178, 16), lean: -8, py: -0.02 }, 9, { in: 0.3, antic: 0.2, over: 1.4, handL: "open", handR: "open", face: { wide: 1, lid: 0, brow: 1, mouth: 0.6, smile: -1 } });
    wag(m, 0.4, 5, P({ roll: 2.4, py: -0.01 }), P({ roll: -2.4, py: 0.01 }), 0.17); return m; };
  const sailor = backer(SAILOR_D, 1.82, 3.3, -0.95, -24, 0.4), old = backer(OLDHAND_D, 1.74, 3.9, 1.2, 14, 0.55);
  shots.push({ id: "hook", a: 0, b: T.s1, still: 1.2,
    sounds: [{ t: 0.0, k: "blast", g: 1.0 }, { t: 0.05, k: "shing", g: 0.7, p: 0.2 }, ...bb.cues().filter((q) => q.k === "step" && q.t < T.s1).map((q) => ({ t: q.t, k: "step", g: 0.8 }))],
    cam: (_t, u) => LOW.push(0.15 * u), sun: { target: [-7.5, MD, 3], reach: 9 },
    cast: (t) => [on("bb", BLACKBEARD_ARMED_D, bb, t, MD, { seed: 3 }), on("sailor", SAILOR_D, sailor, t, MD, { seed: 6 }), on("old", OLDHAND_D, old, t, MD, { seed: 2 })],
    things: (g, c, _t, T2, cam) => { powder(g, T2, cam, LOW, MD, [[5.8, 0, 6, 0.75], [4.6, -1.8, 1.8, 0.4], [4.8, 1.9, 1.8, 0.4]], 2); fuseSmoke(g, c.bb, T2, cam); wield(g, CUTLASS(), SABRE, "raised", c.bb, "R", cam); } }); }

// 2. his face close: the smoke curls past his eyes, the glow on his cheeks breathes, he smiles slowly ("Why would anyone ...")
const DECK = lens(-10.9, 1.5, 2.2, 1, 0, -2, 56);
const faceLens = (p: V3, from: [number, number], d = 0.9, fov = 34, pitch = 3) => { const n = Math.hypot(from[0], from[1]) || 1, fx = from[0] / n, fz = from[1] / n; return lens(p[0] - fx * d, p[1] - 0.05, p[2] - fz * d, fx, fz, pitch, fov); };
const faceShot = (id: string, a0: number, b0: number, D: Design, y: number, at: [number, number], V: Lens, extra?: (g: THREE.Group, T2: number, cam: Cam) => void): Shot => {
  const m = mover(D, 1.92, at[0], at[1], V.toward(at[0], at[1], 8)); m.stand(9);
  m.actAt(-1, { armL: arm(16, 26, 40, 30), armR: arm(16, 26, 40, 30), head: [6, 10, 0] }, 10, { in: 0.01, handL: "fist", handR: "fist", face: { brow: -1, lid: 0.3, smile: 0 } });
  m.actAt(0.2, { head: [0, 4, -4] }, 9, { in: 0.5, antic: 0, over: 1.1, face: { brow: -1, lid: 0.4, smile: 0.7 } });
  return { id, a: a0, b: b0, still: (b0 - a0) * 0.7, sounds: [], cam: (_t, u) => V.push(0.08 * u), sun: { target: [at[0], y, at[1]], reach: 6 },
    cast: (t) => [on("bb", D, m, t, y, { seed: 3 })], things: (g, c, _t, T2, cam) => { extra?.(g, T2, cam); fuseSmoke(g, c.bb, T2, cam); } };
};
{ const [x, z] = DECK.spot(3.4, 0.1), V = faceLens([x, MD + 1.74, z], [DECK.cam.pos[0] < x ? 1 : -1, 0.12], 1.75, 38, -4);
  shots.push(faceShot("face", T.s1, T.s2, BLACKBEARD_ARMED_D, MD, [x, z], V, (g, T2, cam) => powder(g, T2, cam, V, MD, [[3.6, -0.2, 3.4, 0.6], [4.6, 0.9, 3.0, 0.5]], 7))); }

// 3. WHY WOULD ANYONE DO THAT? TO KEEP HIS FACE WARM? Sir Digsworth leans out from behind a barrel, eyebrows up; then he holds his hands
// to his own moustache as if to a fire, sniffs, and coughs
{ const SV = lens(-8.0, 1.25, 5.7, -0.15, -1, 4, 42), [kx, kz] = SV.spot(1.7, -0.25), [sx, sz] = SV.spot(2.0, 0.05), sir = mover(SIR_D, 1.8, sx, sz, SV.toward(sx, sz, 10)); sir.stand(9);
  const g0 = L.guess.a - T.s2;
  sir.actAt(-1, { roll: -16, lean: 6, py: -0.1, armL: arm(30, 10, 80, 0), armR: arm(40, 20, 110, 10), head: [10, 0, -10] }, 10, { in: 0.01, handL: "fist", handR: "open", face: { wide: 0.9, lid: 0, brow: 1, mouth: 0.3 } });
  sir.actAt(0.3, { head: [-8, -6, -8] }, 9, { in: 0.3, antic: 0, over: 1.2, face: { wide: 0.6, lid: 0.1, brow: 1, mouth: 0.4, smile: -0.2 } });
  // he straightens up from behind the barrel and warms his hands at his moustache
  sir.actAt(g0 - 0.2, { roll: 0, lean: 4, py: 0, armL: arm(60, 30, 150, 40), armR: arm(60, 30, 150, 40), head: [0, 4, 0] }, 9, { in: 0.3, antic: 0.1, over: 1.2, handL: "open", handR: "open", face: { brow: 0.8, lid: 0.3, smile: 0.4 } });
  wag(sir, g0 + 0.15, 0.9, P({ armL: arm(60, 34, 150, 44), armR: arm(60, 26, 150, 36) }), P({ armL: arm(60, 26, 150, 36), armR: arm(60, 34, 150, 44) }), 0.3, { handL: "open", handR: "open", face: { brow: 0.8, lid: 0.3, smile: 0.4 } });
  sir.actAt(g0 + 1.3, { head: [0, -14, 0], lean: -6, py: 0.02 }, 0.5, { in: 0.08, out: 0.25, antic: 0.2, over: 1.5, handL: "open", handR: "open", face: { brow: 1, lid: 0.9, mouth: 0.8, smile: -0.4 } });
  shots.push({ id: "sir", a: T.s2, b: T.s3, still: 1.4, sounds: [{ t: 0.15, k: "scuff", g: 0.6 }, { t: g0 + 0.9, k: "sniff", g: 0.9 }, { t: g0 + 1.3, k: "sniff", g: 0.7, p: 0.2 }],
    cam: (_t, u) => SV.push(0.1 * u), sun: { target: [-8.0, MD, 4], reach: 6 },
    cast: (t, T2) => [on("sir", SIR_D, sir, t, MD, { talk: talk(W, T2, ["why", "guess"]), blink: false })],
    things: (g, _c, _t, T2, cam) => { g.add(BARREL()); BARREL().position.set(kx, MD, kz); powder(g, T2, cam, SV, MD, [[3.8, 0.6, 3.0, 0.55]], 6); } }); }

// ---------------- in the great cabin ----------------
/** a Stand for solving a pose of a figure that will stand at `at` (world) facing `heading`, seen through V */
const standOf = (D: Design, at: V3, heading: number, V: Lens, pose: Partial<Pose> = {}): Stand => ({ D, at, heading, h: D === SHIPBOY_D ? 1.28 : 1.92, cam: V.cam, pose });
/** a point on a figure's head: `side` (+1 right, -1 left in the picture) r metres off the middle of his skull, `down` lower */
const atHead = (s: Stand, side: number, r: number, down: number): V3 => { const j = jointsOf(s); return aside(near(j("skull"), s.cam, 0.06), s.cam, side * r, -down); };
const CX = CABIN.at[0], CZ = CABIN.at[2];
/** a lens in the cabin: at (x, y, z) in the cabin's own terms, looking along (fx, fz) */
const cabinLens = (x: number, y: number, z: number, fx: number, fz: number, pitch: number, fov: number) => lens(CX + x, FL + y, CZ + z, fx, fz, pitch, fov);
const BB_AT = { stool: inCabin(CABIN.stool), mirror: inCabin([-1.45, 0, -0.35]), table: inCabin([0.05, 0, -0.05]) };

// 4. NO. WATCH HIM GET READY FOR A FIGHT. He gets up heavily from the stool and holds out his hand; the boy hurries in with a tray of
// ribbons
{ const V = cabinLens(-0.2, 1.25, 2.95, -0.09, -1, -3, 46), bb = mover(BLACKBEARD_BARE_D, 1.92, BB_AT.stool[0], BB_AT.stool[2], V.toward(BB_AT.stool[0], BB_AT.stool[2], 18)); bb.stand(9);
  // the boy steps up from behind the table toward us, the tray held out in both hands
  const ex = CX + 0.38, ez = CZ + 0.5, eh = V.toward(ex, ez, -25), boy = mover(SHIPBOY_D, 1.28, ex - Math.sin((eh * Math.PI) / 180) * 0.45, ez - Math.cos((eh * Math.PI) / 180) * 0.45, eh); boy.walk(mt(boy, 0.45), { step: 0.36, tau: 0.22 }).stand(9);
  const ys = standOf(SHIPBOY_D, [ex, FL, ez], eh, V), yj = jointsOf(ys), yc = near(mix(yj("pelvis"), yj("neck"), 0.6), V.cam, 0.2), yw = rightWay(ys);
  bb.actAt(-1, { ...SIT, armL: arm(20, 20, 60, 20), armR: arm(20, 20, 60, 20), lean: 8, head: [0, 6, 0] }, 10, { in: 0.01, handL: "fist", handR: "fist", face: GRIM });
  bb.actAt(0.25, { ...STAND, lean: 4, head: [0, 2, 0] }, 9, { in: 0.7, antic: 0.25, over: 1.1, face: GRIM });
  bb.actAt(1.1, { armR: arm(64, 26, 92, 10), head: [-22, 4, 0] }, 9, { in: 0.3, antic: 0, over: 1.2, handR: "open", face: { ...GRIM, brow: -0.6 } });
  boy.actAt(-1, { ...reach(ys, "R", aside(yc, V.cam, yw * 0.25)), ...reach(ys, "L", aside(yc, V.cam, -yw * 0.25)), head: [-14, -6, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { wide: 0.7, brow: 0.8, lid: 0, mouth: 0.2 } });
  shots.push({ id: "ready", a: T.s3, b: T.s4, still: 1.6, sounds: [{ t: 0.3, k: "creak", g: 0.8 }, ...boy.cues().filter((q) => q.k === "step").map((q) => ({ t: q.t, k: "step", g: 0.5, p: 0.3 }))],
    cam: (_t, u) => V.push(0.06 * u), sun: { target: inCabin([0, 0, 0]), reach: 4 },
    cast: (t) => [on("bb", BLACKBEARD_BARE_D, bb, t, FL, { seed: 3 }), on("boy", SHIPBOY_D, boy, t, FL, { seed: 8 })],
    things: (g, c, _t, T2, cam) => { lantern(g, T2, cam); carryBy(g, TRAY_O(), c.boy, "L", c.boy, "R", cam); TRAY_O().rotateX(0.55); } }); }


// 5. FIRST HE TWISTED HIS BEARD, WHICH GREW UP TO HIS EYES, ... He stands before the mirror (the lens is the mirror: he looks at
// himself in it, that is at us), twisting a tail of his beard; the boy holds up the tray beside him
{ const V = cabinLens(-0.75, 1.42, 1.9, -0.06, -1, -2, 40), at = inCabin([-0.85, 0, -0.4]), bb = mover(BLACKBEARD_HALF_D, 1.92, at[0], at[2], V.toward(at[0], at[2], 0)); bb.stand(9);
  const bs = standOf(BLACKBEARD_HALF_D, at, V.toward(at[0], at[2], 0), V), j = jointsOf(bs), w = rightWay(bs), c = near(mix(j("neck"), j("pelvis"), 0.16), V.cam, 0.16);
  const TW = (k: number) => ({ ...reach(bs, "R", aside(c, V.cam, w * (0.02 + 0.015 * k), 0.01 * k)), ...reach(bs, "L", aside(c, V.cam, -w * (0.06 - 0.01 * k), 0.04)) });
  bb.actAt(-1, { ...TW(0), head: [0, 10, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { ...GRIM, lid: 0.35, gaze: [0, 0.4] } });
  wag(bb, 0.2, 3, P(TW(1)), P(TW(-1)), 0.28, { handL: "grip", handR: "grip", face: { ...GRIM, lid: 0.35, gaze: [0, 0.4] } });
  const [bx, bz] = V.spot(2.1, 0.55), boy = mover(SHIPBOY_D, 1.28, bx, bz, V.toward(bx, bz, -30)); boy.stand(9);
  const ys = standOf(SHIPBOY_D, [bx, FL, bz], V.toward(bx, bz, -30), V), yj = jointsOf(ys), yc = near(mix(yj("pelvis"), yj("neck"), 0.75), V.cam, 0.2), yw = rightWay(ys);
  boy.actAt(-1, { ...reach(ys, "R", aside(yc, V.cam, yw * 0.25)), ...reach(ys, "L", aside(yc, V.cam, -yw * 0.25)), head: [-20, -8, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { wide: 0.5, brow: 0.6, lid: 0.1 } });
  shots.push({ id: "beard", a: T.s4, b: T.s5, still: 1.2, sounds: [{ t: 0.4, k: "rope", g: 0.4 }],
    cam: (_t, u) => V.push(0.06 * u), sun: { target: inCabin([-0.5, 0, -0.2]), reach: 4 },
    cast: (t) => [on("bb", BLACKBEARD_HALF_D, bb, t, FL, { seed: 3 }), on("boy", SHIPBOY_D, boy, t, FL, { seed: 8 })],
    things: (g, c2, _t, T2, cam) => { lantern(g, T2, cam); carryBy(g, TRAY_O(), c2.boy, "L", c2.boy, "R", cam); TRAY_O().rotateX(0.7); } }); }

// 6. ... INTO LITTLE TAILS WITH RIBBONS. Close on his hands: he ties a blue ribbon round the last tail
{ const at = inCabin([-0.85, 0, -0.4]), V0 = cabinLens(-0.75, 1.42, 1.9, -0.06, -1, -2, 40), hd = V0.toward(at[0], at[2], 0), bs = standOf(BLACKBEARD_HALF_D, at, hd, V0), j = jointsOf(bs), chest = mix(j("neck"), j("pelvis"), 0.12);
  const V = lens(chest[0] + 0.06, chest[1] + 0.02, chest[2] + 1.05, -0.06, -1, 0, 34), bb = mover(BLACKBEARD_HALF_D, 1.92, at[0], at[2], hd); bb.stand(9);
  const bs2 = standOf(BLACKBEARD_HALF_D, at, hd, V), j2 = jointsOf(bs2), w = rightWay(bs2), c = near(mix(j2("neck"), j2("pelvis"), 0.16), V.cam, 0.16);
  const TIE = (k: number) => ({ ...reach(bs2, "R", aside(c, V.cam, w * (0.02 + 0.02 * k), 0.012 * k)), ...reach(bs2, "L", aside(c, V.cam, -w * 0.06, 0.04 - 0.01 * k)) });
  bb.actAt(-1, { ...TIE(0), head: [0, 12, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { ...GRIM, lid: 0.45, gaze: [0, 0.9] } });
  wag(bb, 0.1, 3, P(TIE(1)), P(TIE(-1)), 0.22, { handL: "grip", handR: "grip", face: { ...GRIM, lid: 0.45, gaze: [0, 0.9] } });
  shots.push({ id: "tie", a: T.s5, b: T.s6, still: 1.4, sounds: [{ t: 0.5, k: "tear", g: 0.25 }, { t: 1.6, k: "tear", g: 0.25 }],
    cam: (_t, u) => V.push(0.04 * u), sun: { target: at, reach: 4 },
    cast: (t) => [on("bb", BLACKBEARD_HALF_D, bb, t, FL, { seed: 3 })],
    things: (g, c2, _t, T2, cam) => { lantern(g, T2, cam); wield(g, RIB(), RIBBON, "tie", c2.bb, "R", cam, { d: 0.14 }); } }); }

// 7. THEN HE TUCKED SLOW-BURNING FUSES UNDER HIS HAT, ... He pushes a piece of slow match under the brim on each side of his face
const TUCK_AT = inCabin([0.15, 0, 0.35]);
{ const V = cabinLens(0.05, 1.5, 2.35, 0.04, -1, 0, 38), hd = V.toward(TUCK_AT[0], TUCK_AT[2], 10), bb = mover(BLACKBEARD_PREP_D, 1.92, TUCK_AT[0], TUCK_AT[2], hd); bb.stand(9);
  const bs = standOf(BLACKBEARD_PREP_D, TUCK_AT, hd, V), w = rightWay(bs), IN = 1.45;
  const UP = { ...reach(bs, "R", atHead(bs, w, 0.21, 0.03)), ...reach(bs, "L", atHead(bs, -w, 0.21, 0.03)) };
  bb.actAt(-1, { armL: arm(20, 20, 60, 20), armR: arm(20, 20, 60, 20), head: [0, 4, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: GRIM });
  bb.actAt(0.15, { ...UP, head: [0, 2, 0] }, IN - 0.15, { in: 0.35, out: 0.01, antic: 0.1, over: 1.1, handL: "grip", handR: "grip", face: { ...GRIM, lid: 0.4 } });
  bb.actAt(IN, { armL: arm(24, 24, 70, 24), armR: arm(24, 24, 70, 24), head: [0, 6, 0] }, 9, { in: 0.35, antic: 0, over: 1.1, handL: "fist", handR: "fist", face: MENACE });
  const look = (t: number) => (t < IN ? BLACKBEARD_PREP_D : BLACKBEARD_UNLIT_D);
  shots.push({ id: "tuck", a: T.s6, b: T.s7, still: 1.0, sounds: [{ t: IN - 0.1, k: "scratch", g: 0.5 }],
    cam: (_t, u) => V.push(0.06 * u), sun: { target: TUCK_AT, reach: 4 },
    cast: (t) => [on("bb", look(t), bb, t, FL, { seed: 3 })],
    things: (g, c2, t, T2, cam) => { lantern(g, T2, cam); if (t < IN) { wield(g, FUSE_R(), FUSE, "tuck", c2.bb, "R", cam); wield(g, FUSE_L(), FUSE, "tuck", c2.bb, "L", cam); } else { vanish(FUSE_R(), FUSE); vanish(FUSE_L(), FUSE); } } }); }

// 8. ... SO THEY SMOKED BESIDE HIS BEARD. The boy lights them with a spill from the lantern at arm's length, and jumps back (the
// captain turns his face to the boy, so that the fuse the boy lights is on the boy's side and the spill never crosses his face)
{ const V = cabinLens(0.5, 1.32, 2.95, -0.15, -1, 0, 50), hd = V.toward(TUCK_AT[0], TUCK_AT[2], -40), bb = mover(BLACKBEARD_UNLIT_D, 1.92, TUCK_AT[0], TUCK_AT[2], hd); bb.stand(9);
  // the big man stoops to the boy, so that the boy can reach his fuse with the spill held out before him
  const STOOP = { lean: 24, py: -0.07, head: [-14, 14, 0] as [number, number, number] }, bs = standOf(BLACKBEARD_UNLIT_D, TUCK_AT, hd, V, STOOP), w = rightWay(bs), LIT = 1.0, tip = atHead(bs, -w, 0.13, 0.15);
  bb.actAt(-1, { armL: arm(24, 24, 70, 24), armR: arm(24, 24, 70, 24), ...STOOP }, 10, { in: 0.01, handL: "fist", handR: "fist", face: MENACE });
  bb.actAt(LIT + 0.3, { lean: 2, py: 0, head: [0, 0, 0] }, 9, { in: 0.6, antic: 0, over: 1.1, face: { ...MENACE, smile: 0.5 } });
  const bx0 = TUCK_AT[0] + 0.52, bz0 = TUCK_AT[2] + 0.12, boy = mover(SHIPBOY_D, 1.28, bx0, bz0, -100); boy.stand(LIT + 0.1).walk(mt(boy, -0.45), { step: 0.3, tau: 0.15 }).stand(9);
  // the spill's tip goes to the end of the fuse nearer the boy (where the drawing marks it), the spill at about 40 degrees up to it
  const ends = quiet(() => { const st = stageAt(on("bb", BLACKBEARD_UNLIT_D, bb, LIT - 0.05, FL, { seed: 3 }), V.cam); return (["fuseA", "fuseB"] as const).map((n) => st.mark?.(n)).filter((p): p is V3 => !!p); });
  const fe = ends.sort((p, q) => Math.hypot(p[0] - bx0, p[2] - bz0) - Math.hypot(q[0] - bx0, q[2] - bz0))[0] ?? tip, rr = aside([0, 0, 0], V.cam, 1), toBoy = Math.sign((bx0 - fe[0]) * rr[0] + (bz0 - fe[2]) * rr[2]) || -w;
  const ys = standOf(SHIPBOY_D, [bx0, FL, bz0], -100, V), hand = aside(fe, V.cam, toBoy * 0.42 * 0.77, -0.42 * 0.64);
  boy.actAt(-1, { ...reach(ys, "L", hand), lean: 6, head: [0, -10, 0] }, 10, { in: 0.01, handL: "grip", handR: "open", face: { wide: 0.9, brow: 1, lid: 0, mouth: 0.3, gaze: [0, -0.4] } });
  boy.actAt(LIT + 0.05, { armR: arm(140, 30, 170, 10), lean: -12, head: [0, -6, 0] }, 9, { in: 0.18, antic: 0.1, over: 1.4, handL: "grip", handR: "open", face: { wide: 1, brow: 1, lid: 0, mouth: 0.8, smile: -0.6 } });
  // the spill is as long as it must be to reach from his hand to the fuse when he lights it (the boy is short, and a 42 cm spill
  // ended in the beard): measured once, at the moment of lighting, and kept for the whole shot
  const SPL = quiet(() => { const st = stageAt(on("boy", SHIPBOY_D, boy, LIT, FL, { seed: 8 }), V.cam), q = palm(st, "L"); return Math.max(0.3, Math.min(0.75, Math.hypot(q[0] - fe[0], q[1] - fe[1], q[2] - fe[2]))); });
  const look = (t: number) => (t < LIT ? BLACKBEARD_UNLIT_D : BLACKBEARD_D);
  shots.push({ id: "light", a: T.s7, b: T.s8, still: 1.6, sounds: [{ t: LIT - 0.05, k: "spray", g: 0.35 }, { t: LIT + 0.1, k: "scuff", g: 0.6 }, ...boy.cues().filter((q) => q.k === "step").map((q) => ({ t: q.t, k: "step", g: 0.5 }))],
    cam: (_t, u) => V.push(0.06 * u), sun: { target: TUCK_AT, reach: 4 },
    cast: (t) => [on("bb", look(t), bb, t, FL, { seed: 3 }), on("boy", SHIPBOY_D, boy, t, FL, { seed: 8 })],
    // (the spill points at the fuse, his wrist bent up to it: with his forearm it stood straight up; once it is lit and he jumps back, it
    // points up and back his own way as he pulls it away from the captain's face)
    things: (g, c2, t, T2, cam) => { lantern(g, T2, cam); SPILL_O().scale.x = SPL / 0.42; wield(g, SPILL_O(), SPILL, "light", c2.boy, "L", cam, { aim: t < LIT + 0.05 ? fe : aside(palm(c2.boy, "L"), cam, -toBoy * 0.25, 0.43) }); tipGlow(g, SPILL_O(), cam); if (t >= LIT) fuseSmoke(g, c2.bb, T2 - (T.s7 + LIT) + 0.2, cam); } }); }

// 9. ADD SIX PISTOLS ACROSS HIS CHEST. He lifts the sling off the table, puts it on over his head, sags at the knees under the weight,
// straightens, and pats the butts
{ const at = inCabin([0.35, 0, 0.1]), V = cabinLens(0.2, 1.4, 2.8, 0.03, -1, -2, 42), hd = V.toward(at[0], at[2], 5), bb = mover(BLACKBEARD_D, 1.92, at[0], at[2], hd); bb.stand(9);
  const bs = standOf(BLACKBEARD_D, at, hd, V), j = jointsOf(bs), w = rightWay(bs), lay = near([at[0], FL + 0.84, at[2] - 0.32], V.cam, 0), UPA = 0.25, OVER = 0.9, ON = 1.25;
  const low = near(mix(j("pelvis"), j("neck"), 0.15), V.cam, 0.22), high: V3 = [j("crown")[0], j("crown")[1] + 0.12, j("crown")[2]];
  const hands = (p: V3, half: number) => ({ ...reach(bs, "R", aside(p, V.cam, w * half)), ...reach(bs, "L", aside(p, V.cam, -w * half)) });
  bb.actAt(-1, { ...hands(lay, 0.32), lean: 18, head: [0, 14, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: GRIM });
  bb.actAt(UPA, { ...hands(low, 0.32), lean: 2, head: [0, 4, 0] }, OVER - UPA, { in: 0.3, out: 0.01, antic: 0, over: 1, handL: "grip", handR: "grip", face: GRIM });
  bb.actAt(OVER, { ...hands(near(high, V.cam, 0.08), 0.32), head: [0, -4, 0] }, ON - OVER + 0.05, { in: 0.25, out: 0.01, handL: "grip", handR: "grip", face: GRIM });
  bb.actAt(ON, { armL: arm(24, 24, 70, 24), armR: arm(30, 20, 110, -20), py: -0.06, lean: 6 }, 0.4, { in: 0.12, out: 0.25, antic: 0, over: 1.2, handL: "fist", handR: "open", face: { ...GRIM, mouth: 0 } });
  bb.actAt(ON + 0.5, { armL: arm(24, 24, 70, 24), armR: arm(30, 20, 110, -20), py: 0, head: [0, 2, 0] }, 9, { in: 0.3, handL: "fist", handR: "open", face: MENACE });
  wag(bb, ON + 0.9, 1.2, P({ armR: arm(32, 20, 116, -22) }), P({ armR: arm(28, 18, 104, -18) }), 0.28, { handL: "fist", handR: "open", face: MENACE });
  const look = (t: number) => (t < ON ? BLACKBEARD_D : BLACKBEARD_ARMED_D);
  shots.push({ id: "pistols", a: T.s8, b: T.s9, still: 1.9, sounds: [{ t: UPA + 0.1, k: "rattle", g: 0.6 }, { t: ON, k: "thud", g: 0.6 }, { t: ON + 0.95, k: "tap", g: 0.5 }, { t: ON + 1.25, k: "tap", g: 0.5 }],
    cam: (_t, u) => V.push(0.05 * u), sun: { target: at, reach: 4 },
    cast: (t) => [on("bb", look(t), bb, t, FL, { seed: 3 })],
    things: (g, c2, t, T2, cam) => { lantern(g, T2, cam); fuseSmoke(g, c2.bb, T2, cam); if (t < UPA) setDown(g, SLING(), "sling", lay, cam, 0); else if (t < ON) carryBy(g, SLING(), c2.bb, "L", c2.bb, "R", cam); else vanish(SLING(), "sling"); } }); }

// 10. NOW HE LOOKED LIKE SOMETHING OUT OF HELL. His face close in the lantern light, the smoke curling past his eyes, a slow smile
{ const at = inCabin([0.35, 0, 0.1]), V0 = cabinLens(0.2, 1.4, 2.8, 0.03, -1, -2, 42), V = faceLens([at[0], FL + 1.74, at[2]], [-0.08, -1], 1.6, 36, -4);
  void V0; shots.push(faceShot("hell", T.s9, T.s10, BLACKBEARD_ARMED_D, FL, [at[0], at[2]], V, (g, T2, cam) => lantern(g, T2, cam))); }

// 11. IT WAS PROBABLY MEANT TO MAKE CREWS GIVE UP WITHOUT A FIGHT. Across the water from behind him at his rail: the merchant's crew see
// the smoking figure, and their hands go up one after another
{ const S = lens(-0.75, 1.75, 1.45, -1, 0.08, -2, 42), [bx, bz] = S.spot(1.65, -0.18), bb = mover(BLACKBEARD_ARMED_D, 1.92, bx, bz, S.toward(bx, bz, 180)); bb.stand(9);
  bb.actAt(-1, { armL: arm(20, 30, 50, 30), armR: arm(20, 30, 50, 30), lean: -2 }, 10, { in: 0.01, handL: "fist", handR: "fist", face: MENACE });
  const crew = ([[SAILOR_D, 1.82, 5.6, 0.55, 0.3], [COOK_D, 1.58, 5.4, -0.15, 0.8], [OLDHAND_D, 1.74, 6.0, 0.15, 1.35], [PIRATE2_D, 1.9, 6.3, -0.6, 1.9]] as [Design, number, number, number, number][]).map(([D, h, d, l, t0]) => {
    const [x, z] = S.spot(d, l), m = mover(D, h, x, z, S.toward(x, z, 0)); m.stand(9);
    m.actAt(-1, { armL: arm(16, 14, 30, 8), armR: arm(16, 14, 30, 8), head: [0, -4, 0] }, 10, { in: 0.01, handL: "relaxed", handR: "relaxed", face: { wide: 0.8, lid: 0, brow: 0.9, smile: -0.6 } });
    m.actAt(t0, { armL: arm(150, 30, 176, 12), armR: arm(150, 30, 176, 12), lean: -4 }, 9, { in: 0.35, antic: 0.15, over: 1.3, handL: "open", handR: "open", face: { wide: 1, lid: 0, brow: 1, mouth: 0.5, smile: -0.8 } });
    return { D, m }; });
  shots.push({ id: "surrender", a: T.s10, b: T.s11, still: 2.4, sounds: [{ t: 0.4, k: "flap", g: 0.4 }],
    cam: (_t, u) => S.push(0.05 * u), sun: { target: [-5.5, MD, 1.5], reach: 9 },
    cast: (t) => [on("bb", BLACKBEARD_ARMED_D, bb, t, 0, { seed: 3 }), ...crew.map(({ D, m }, i) => on(`c${i}`, D, m, t, MD, { seed: 11 + i }))],
    things: (g, c2, _t, T2, cam) => { fuseSmoke(g, c2.bb, T2, cam); } }); }

// 12. NEARLY ALL OF THIS COMES FROM ONE BOOK, PRINTED SIX YEARS AFTER HE DIED. On a deck years later a sailor reads it out to a few
// listeners, who stare; the ship's boy hides behind the mast
{ const R = lens(-7.25, 1.5, 3.9, -0.12, -1, -1, 46), [rx, rz] = R.spot(2.7, 0.1), rd = mover(OLDHAND_D, 1.74, rx, rz, R.toward(rx, rz, -15)); rd.stand(9);
  const rs = standOf(OLDHAND_D, [rx, MD, rz], R.toward(rx, rz, -15), R), rj = jointsOf(rs), rc = near(mix(rj("pelvis"), rj("neck"), 0.66), R.cam, 0.24), rw = rightWay(rs);
  rd.actAt(-1, { ...reach(rs, "R", aside(rc, R.cam, rw * 0.27)), ...reach(rs, "L", aside(rc, R.cam, -rw * 0.27)), head: [0, 8, 0] }, 10, { in: 0.01, handL: "grip", handR: "grip", face: { brow: 0.8, lid: 0.1, mouth: 0.5 } });
  wag(rd, 0, 6, P({ head: [-4, 8, 0] }), P({ head: [4, 6, 0] }), 0.9, { handL: "grip", handR: "grip", face: { brow: 0.8, lid: 0.1, mouth: 0.5 } });
  const listen = ([[SAILOR_D, 1.82, 3.5, -0.75, 40], [TOWNSWOMAN_D, 1.64, 3.2, 0.85, -40], [SHIPBOY_D, 1.28, 4.6, -0.2, 20]] as [Design, number, number, number, number][]).map(([D, h, d, l, off], i) => {
    const [x, z] = R.spot(d, l), m = mover(D, h, x, z, R.toward(x, z, off)); m.stand(9);
    m.actAt(-1, { armL: arm(20, 12, 70, 10), armR: arm(20, 12, 70, 10), head: [0, -2, 0] }, 10, { in: 0.01, handL: "relaxed", handR: "relaxed", face: { wide: 0.9, lid: 0, brow: 1, mouth: i === 1 ? 0.5 : 0.2, smile: -0.4 } });
    if (D === SHIPBOY_D) m.actAt(1.6, { px: -0.35, armL: arm(60, -20, 120, -20), armR: arm(60, -20, 120, -20), head: [-20, 0, 0] }, 9, { in: 0.35, antic: 0.2, over: 1.2, handL: "fist", handR: "fist", face: { wide: 1, lid: 0, brow: 1, mouth: 0.5, smile: -0.8 } });
    return { D, m }; });
  shots.push({ id: "book", a: T.s11, b: T.s12, still: 2.0, sounds: [{ t: 0.3, k: "paper", g: 0.5 }, { t: 2.6, k: "paper", g: 0.4 }],
    cam: (_t, u) => R.push(0.06 * u), sun: { target: [rx, MD, rz], reach: 7 },
    cast: (t) => [on("rd", OLDHAND_D, rd, t, MD, { seed: 2 }), ...listen.map(({ D, m }, i) => on(`l${i}`, D, m, t, MD, { seed: 21 + i }))],
    things: (g, c2) => { carryBy(g, BOOK(), c2.rd, "L", c2.rd, "R", R.cam); } }); }

// 13. SO THE FIRE WAS A COSTUME. Back in the cabin after the fight he pulls one fuse from under his hat and blows on it; the smoke rolls
// at us and fills the picture (the last frame is smoke, and the first frame is him walking out of smoke)
{ const at = inCabin([0.15, 0, 0.35]), V = cabinLens(0.05, 1.55, 2.2, 0.03, -1, 0, 38), hd = V.toward(at[0], at[2], 6), bb = mover(BLACKBEARD_ARMED_D, 1.92, at[0], at[2], hd); bb.stand(9);
  const bs = standOf(BLACKBEARD_ARMED_D, at, hd, V), w = rightWay(bs), j = jointsOf(bs), mouth = mix(j("neck"), j("skull"), 0.5), PULL = 0.55, LIPS = 1.25, BLOW = 1.55;
  bb.actAt(-1, { armL: arm(24, 24, 70, 24), armR: arm(24, 24, 70, 24), head: [0, 4, 0] }, 10, { in: 0.01, handL: "fist", handR: "fist", face: { ...GRIM, brow: -0.4 } });
  bb.actAt(0.1, reach(bs, "R", atHead(bs, w, 0.2, 0.08)), PULL, { in: 0.3, out: 0.01, handR: "grip", face: { ...GRIM, brow: -0.4 } });
  bb.actAt(PULL + 0.1, reach(bs, "R", aside(near(mouth, V.cam, 0.14), V.cam, w * 0.05, -0.16)), 9, { in: LIPS - PULL - 0.1, antic: 0, handR: "grip", face: { brow: -0.4, lid: 0.3, mouth: 0, smile: -0.3 } });
  bb.actAt(BLOW, { head: [0, -2, 0], lean: -2 }, 9, { in: 0.25, face: { brow: 0.2, lid: 0.6, mouth: 0.15, smile: -0.2 } });
  const look = (t: number) => (t < PULL + 0.1 ? BLACKBEARD_ARMED_D : BLACKBEARD_ONE_D);
  shots.push({ id: "costume", a: T.s12, b: T.end, still: 1.3, sounds: [{ t: PULL + 0.05, k: "scratch", g: 0.5 }, { t: BLOW, k: "whoosh", g: 0.8, dur: 1.6 }],
    cam: (_t, u) => V.push(0.08 * u), sun: { target: at, reach: 4 },
    cast: (t) => [on("bb", look(t), bb, t, FL, { seed: 3 })],
    things: (g, c2, t, T2, cam) => { lantern(g, T2, cam); fuseSmoke(g, c2.bb, T2, cam);
      if (t < PULL + 0.1) return; wield(g, FUSE_LIT(), FUSE, "blow", c2.bb, "R", cam); tipGlow(g, FUSE_LIT(), cam);
      // the breath of smoke: it rolls from his mouth toward the lens and grows until it fills the picture
      const k = smooth((t - BLOW) / 2.6); if (k <= 0) return; const p = mix(near(mouth, cam, 0.25), cam.pos, 0.82 * k);
      bank(g, [p[0], p[1] - 0.35 - 0.6 * k, p[2]], T2, Math.atan2(cam.pos[0] - p[0], cam.pos[2] - p[2]), 0.5 + 2.4 * k, 0.6 + 1.6 * k, 9, 0.4 + 1.3 * k, 0.5 + 0.5 * k, 0.04, 41, 0x9a948e); } }); }

export const BLACKBEARD_FUSES: Film = {
  id: "blackbeard-fuses", fps: 30, seconds: T.end, sky: "#a9dcff", world: cabinSea, shots, words: W, solids: FLAGSEA_SOLIDS,
  hook: { text: ["BLACKBEARD'S", "BEARD SMOKED", "IN BATTLE."], a: 0, b: T.s1, size: 80 },
  // our own lines (DAILY-RULES, "Our own lines"), as bubbles over the picture: he admires himself in the mirror, a merchant sailor as
  // his crew gives up, and a listener when the book is named as nearly the only source (the boy's "Hold still, Captain!" is left out:
  // above the boy's head it covered the beard and the spill reaching the fuse, which is what that shot is about)
  bubbles: [{ a: T.s4 + 1.1, b: T.s5 - 0.05, text: "Gorgeous.", who: "bb" }, { a: T.s10 + 1.0, b: T.s10 + 2.5, text: "Nope!", who: "c0" }, { a: T.s11 + 2.35, b: T.s11 + 3.95, text: "Is any of it true?", who: "l0" }],
  beds: [{ k: "sea", a: 0, b: T.end, g: 0.6 }, { k: "wind", a: 0, b: T.end, g: 0.3 }, { k: "fire", a: 0, b: T.end, g: 0.25 }], audio: "craft/blackbeard-fuses.wav",
};

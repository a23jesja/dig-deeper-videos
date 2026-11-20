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
import { rod, mesh, box, cyl, type CardLight } from "../world/kit";
import { PIRATE_D, MATE_SHORT_D } from "../looks";
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
const KK = 0.52, FF = 0.36, HW = 0.31;      // (HW: half the hands' spacing, the book's grips apart (0.54 wide, 4 cm out each side): at 0.27 the book sat centred between hands closer than its grips, so each fist hid behind its edge at some lenses, the independent review of v1g)
//      // (the shot library 04's grip; 0.55-0.6 high turned an elbow the wrong way at some lenses)
// (held 4 cm out past its edges: the fists show at its sides and the thumbs come over the edge, as at 750 in v1d; held at the edge, the fists hid behind it and the thumbs lay on the page like two blobs, the reviews of v1d and v1f)
const BOOK = once(() => noShade(logBook(0.54, 0.36, 0.25, 0.04))), T0H = { handL: "thumb" as const, handR: "thumb" as const };
const READ: Face = { brow: 0.6, lid: 0.42, smile: 0.6, gaze: [-0.1, 0.9] };      // (gaze y: + is down)
/** the book turned round on its upright middle line: its cover to the lens and its pages to him, as a book is held to be read (the review
 *  of v1k: with its pages to the lens he read the back of it). The grips lie either side of that line, so the hands stay on them; his
 *  fingers lie on the cover and his thumbs inside on the pages, out of sight, so no thumbs are drawn */
const turnBook = () => { const o = BOOK(); o.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(o), mid = box.getCenter(new THREE.Vector3()), up = new THREE.Vector3(0, 1, 0);
  o.position.sub(mid).applyAxisAngle(up, Math.PI).add(mid); o.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(up, Math.PI)); o.updateMatrixWorld(true); };
/** the book tipped about the line through its two grips (the hands stay on it), its pages turned up toward his face: reading, not showing */
const tiltBook = (a: number) => { const o = BOOK(), g0 = (o.userData.grips as V3[])[0]; o.updateMatrixWorld(true); const pW = o.localToWorld(new THREE.Vector3(0, g0[1], g0[2])), ax = new THREE.Vector3(1, 0, 0).applyQuaternion(o.quaternion).normalize();
  o.position.sub(pW).applyAxisAngle(ax, a).add(pW); o.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(ax, a)); o.updateMatrixWorld(true); };
/** the pirate reading the open log, held in both hands as in the shot library's 04 (the thumbs over the pages, the fingers behind), turned
 *  a little toward him so that it shows as an open book; his eyes down on it. `sun`: on deck with the patch on his right eye; else below,
 *  the patch on his left eye and the right eye's pupil wide. `looks`: from `looks` on he looks up from the book at the lens, pleased */
const reader = (at: V3, y: number, V: Lens, turn: number, sun: boolean, len: number, o: { looks?: number; moves?: boolean; gx?: number; lines?: boolean; tilt?: number; reads?: number; puzzled?: number; wide?: number; closeUp?: boolean; lookFace?: number } = {}) => {
  const hd = V.toward(at[0], at[2], turn), m = mover(PIRATE_D, H, at[0], at[2], hd); m.w = 0.09; m.stand(9);
  // (the arms solved once, as the shot library's 04 holds its book, from a lens straight before him: the joint angles are his own and hold
  //  the book the same way in every shot, whatever lens sees it. Solved toward each shot's own lens, the elbows twisted at side views)
  const hr0 = (hd * Math.PI) / 180, ref = lens(at[0] + Math.sin(hr0) * 3.6, y + 1.3, at[2] + Math.cos(hr0) * 3.6, -Math.sin(hr0), -Math.cos(hr0), -3, 50);
  // (reads: the book held before his own chest and turned to his eyes, seen from the side at three quarters, as one reads; else held toward the
  //  lens as the shot library's 04 shows it. The review of v1d: "the pages always face the lens")
  //  (reads = f: the book held toward a point f of the way from straight before him to the lens, so it turns from the lens toward him; the
  //   arms solved toward that same point. Toward his own front the arms went straight out and the book flipped, 20 Nov)
  const camA = Math.atan2(V.cam.pos[0] - at[0], V.cam.pos[2] - at[2]), dA = Math.atan2(Math.sin(camA - hr0), Math.cos(camA - hr0)), rA = hr0 + (o.reads ?? 1) * dA;
  const HC = o.reads !== undefined ? lens(at[0] + Math.sin(rA) * 3.6, y + 1.3, at[2] + Math.cos(rA) * 3.6, -Math.sin(rA), -Math.cos(rA), -3, 50).cam : V.cam; void ref;
  const rs: Stand = { D: PIRATE_D, at: [at[0], y, at[2]], heading: hd, h: H, cam: HC, pose: {} }, rj = jointsOf(rs), rw = rightWay(rs);
  const rcOf = (k: number, fwd: number) => near(mix3(rj("pelvis"), rj("neck"), k), HC, fwd);
  // (closeUp: the book's edges lie outside the picture, so its thumbs are not drawn (a thumb alone on the page with no hand to it, the
  //  independent review of v1g) and the hands keep the narrower spacing, at which the arms stay inside the picture)
  const hw = o.closeUp ? 0.27 : HW;
  const hold = (k: number, fwd: number, tilt = 0): Partial<Pose> => { const rc = rcOf(k, fwd); return { ...reach(rs, "R", aside(rc, HC, rw * hw, tilt)), ...reach(rs, "L", aside(rc, HC, -rw * hw, -tilt)) }; };
  const face = (f: Face): Face => ({ ...f, ...(f.gaze && o.gx !== undefined ? { gaze: [o.gx, f.gaze[1]] as [number, number] } : {}), ...(sun ? {} : { pupil: 1.45 }) });
  const hy = -0.9 * turn * (o.reads ?? 1);      // (his head turned to where the book lies)
  ease(m, -1, { ...hold(KK, FF, 0.015), head: [o.lines ? hy - 7 : -6, 18, 0] }, 0.01, { ...T0H, face: face(READ) });
  if (!o.lines) ease(m, 0.25, { ...hold(KK, FF, 0.015), head: [-10, 19, 0], px: 0.015, hipTilt: -2 }, 0.8, { ...T0H, face: face({ ...READ, smile: 0.75 }) });
  // (moves: his head drops further to the page and comes back; a third grip solved for it turned his left elbow the wrong way)
  if (o.moves) ease(m, 1.6, { ...hold(KK, FF, 0.015), head: [-4, 22, 0] }, 0.6, { ...T0H, face: face({ ...READ, brow: 0.8 }) });
  // (lines: his head follows the lines across the page, a little to one side and back, from the first frame: the review of v1d, "he does not
  //  read", and the opening that stood still)
  //  (a line read: the eyes and the head go slowly along it from left to right, then back quickly to the start of the next; the head down
  //   to the page, the lids low)
  if (o.lines) { const LT = 1.15, R0 = P({ ...hold(KK, FF, 0.015), head: [hy - 6, 27, 0] }), R1 = P({ ...hold(KK, FF, 0.015), head: [hy + 6, 28, 0] });
    for (let t = 0.0; t < len + 0.3; t += LT) { m.actAt(t, R0, 0.28, { in: 0.12, out: 0.12, antic: 0, over: 1, ...T0H, face: face({ ...READ, lid: 0.56, gaze: [-0.4, 1] }) });
      m.actAt(t + 0.28, R1, LT - 0.3, { in: 0.25, out: 0.25, antic: 0, over: 1, ...T0H, face: face({ ...READ, lid: 0.56, gaze: [0.4, 1] }) }); } }
  // (after he looks up he keeps moving: a small nod and sway, pleased with himself; holding still he read as a frozen picture for a second,
  //  the independent review of v1g)
  const hl = -(o.lookFace ?? 0.7) * turn;      // (his head toward the lens when he looks up: see below)
  // (when he looks up at us his head turns to the lens; turned with his body, the patch, nose and moustache were cut by the head's outline,
  //  the independent review of v1k)
  if (o.looks !== undefined) ease(m, o.looks, { ...hold(KK, FF, 0.015), head: [hl + 2, 3, 0], px: 0 }, 0.5, { ...T0H, face: face({ brow: 0.9, lid: 0.15, smile: 0.9 }) });
  // (the nod laid after the look-up pose: laid before it, the later pose held him still to the end of the shot, the still-figure test, v1k)
  if (o.looks !== undefined && o.looks + 0.6 < len) wag(m, o.looks + 0.6, len - o.looks - 0.4, P({ ...hold(KK, FF, 0.015), head: [hl + 4, 5, 3], px: 0.012 }), P({ ...hold(KK, FF, 0.015), head: [hl - 3, 1, -3], px: -0.01 }), 1.0, { ...T0H, face: face({ brow: 0.9, lid: 0.15, smile: 0.9 }), glide: true });
  // (puzzled: from `puzzled` on he looks up from the book, brows up and askew, eyes up and to the side, his head cocked: "Arr. Which eye was
  //  it?" was said with the reading smile, the independent review of v1f. wide: from `wide` on his open eye goes wide, he can see)
  if (o.puzzled !== undefined) ease(m, o.puzzled, { ...hold(KK, FF, 0.015), head: [hl + 6, -2, 9], px: 0 }, 0.45, { ...T0H, face: face({ brow: 1, lid: 0, wide: 0.4, mouth: 0, smile: -0.3, gaze: [0.6, -0.7] }) });
  if (o.wide !== undefined) ease(m, o.wide, { ...hold(KK, FF, 0.015), head: [2, 0, 0], px: 0 }, 0.3, { ...T0H, face: face({ brow: 1, lid: 0, wide: 0.9, mouth: 0.3, smile: 0.9 }) });
  const lookAt = rcOf(KK, FF);
  return { m, cast: (t: number) => on("pirate", PIRATE_D, m, t, y, { patch: sun ? "A" : "B", ...T0H }, 3), book: (g: THREE.Group, c: Record<string, any>, cam: Cam) => { carryBy(g, BOOK(), c.pirate, "L", c.pirate, "R", o.reads !== undefined ? HC : cam, 0.1, "carry", false); turnBook(); if (o.tilt) tiltBook(o.tilt); },
    look: { pirate: { at: lookAt, what: "the log in his hands", to: o.looks ?? o.puzzled ?? 99 } }, len };
};
/** the mate below, no patch, blind in the dark: screwing up his eyes, his eyes searching one way and the other, his head turning, one hand
 *  feeling the air ahead at chest height with loose fingers and the other near his chest; each shot its own way (the review of v1b: he
 *  smiled and stood still, a palm flat to the lens, the same picture twice) */
const SEARCH = (g: number): Face => ({ brow: 1, lid: 0.12, wide: 0.35, mouth: 0.5, smile: -1, gaze: [g, -0.1] });      // (worried, peering: the squint with low lids read as a smug grin in v1e, our own look)
const SHOUT: Face = { brow: 1, lid: 0, wide: 0.9, mouth: 0.85, smile: -0.8, gaze: [0.4, -0.2] };      // (eyes wide open, brows up: the v1e look showed him calm, lids half down)
// (the review of v1d: he "presented", forearms out and palms up, the same in every shot. Now his forearms reach forward low, where a loose hand
//  is drawn edge on, each shot its own way; a stumble now and then; one hand feeling along the table's edge)
const FEEL: [[Seg, Seg], [Seg, Seg]][] = [
  [[[16, 6], [26, 4]], [[6, 8], [16, 6]]],
  [[[8, 8], [16, 6]], [[16, 6], [26, 4]]],
  [[[14, 4], [22, 2]], [[10, 10], [18, 8]]]];      // (low and a little out from the body, the hands loose: further out or forward, the hand was drawn palm up, "presenting", the independent review of v1f)
const mate = (at: V3, V: Lens, turn: number, v: number, len: number, o: { hang?: boolean; shout?: boolean; stumble?: number; heads?: number } = {}) => {
  const m = mover(MATE_SHORT_D, HM, at[0], at[2], V.toward(at[0], at[2], turn)); m.w = 0.09; m.stand(9);
  const [A, B] = o.hang ? [REST.armL as [Seg, Seg], REST.armR as [Seg, Seg]] : FEEL[v % 3], R2 = { handL: "relaxed" as const, handR: "relaxed" as const }, sw = (q: [Seg, Seg], k: number): [Seg, Seg] => [[q[0][0] + 8 * k, q[0][1] + 4], [q[1][0] + 8 * k, q[1][1] + 6]];
  const F0 = o.shout ? SHOUT : SEARCH(0.8), F1 = o.shout ? { ...SHOUT, gaze: [-0.4, -0.2] as [number, number] } : SEARCH(-0.8);
  ease(m, -1, { armL: A, armR: B, head: [18, -4, 0], lean: 6 }, 0.01, { ...R2, face: F0 });
  // (always moving: the head round from side to side with the eyes, the hands searching; a period that never stops for long)
  const hs = o.heads ?? (o.shout ? 0.4 : 0.7);      // (at full swing his far eye was cut by the head's outline, the independent review of v1m)
  wag(m, 0.0, len + 0.5, P({ armL: A, armR: B, head: [24 * hs, -5, 5 * hs], lean: 6, px: 0.014 }), P({ armL: sw(A, 1), armR: sw(B, -1), head: [-22 * hs, -2, -5 * hs], lean: 8, px: -0.014 }), 0.95 + 0.12 * v, { ...R2, face: F1, glide: true });
  if (o.stumble !== undefined) { ease(m, o.stumble, { armL: sw(A, 1.5), armR: sw(B, 1.5), lean: 11, px: 0.035, py: -0.02, head: [10, 8, 6] }, 0.32, { ...R2, face: { ...F0, wide: 0.7, lid: 0, mouth: 0.4 } });
    ease(m, o.stumble + 0.55, { armL: A, armR: B, lean: 6, px: 0, py: 0, head: [-14, -3, 0] }, 0.4, { ...R2, face: F1 });
    // (searching again after he has caught himself: the pose above held him still to the end of the shot, the still-figure test, v1k)
    if (o.stumble + 1.0 < len) wag(m, o.stumble + 1.0, len - o.stumble - 0.5, P({ armL: A, armR: B, head: [-14 + 20 * hs, -5, 5 * hs], lean: 6, px: 0.012 }), P({ armL: sw(A, 1), armR: sw(B, -1), head: [-14 - 18 * hs, -2, -5 * hs], lean: 8, px: -0.012 }), 0.95 + 0.12 * v, { ...R2, face: F1, glide: true }); }
  return { cast: (t: number) => on("mate", MATE_SHORT_D, m, t, FL, {}, 5) };
};
/** the mate at the table's front edge, his right hand on it, feeling along it from one end toward the other, his left hand searching the air */
const TABLE_EDGE = (x: number): V3 => inCabin([x, 0.76 + 0.025, CABIN.table[2] + 0.4 - 0.035]);      // (the fist on the front edge itself: 5 cm in, it lay on the top like a blob, the independent review of v1f)
const mateTable = (at: V3, V: Lens, turn: number, len: number) => {
  const hd = V.toward(at[0], at[2], turn), m = mover(MATE_SHORT_D, HM, at[0], at[2], hd); m.w = 0.09; m.stand(9);
  const st: Stand = { D: MATE_SHORT_D, at: [at[0], FL, at[2]], heading: hd, h: HM, cam: V.cam, pose: {} };
  const onEdge = (x: number) => { const q = TABLE_EDGE(x); return reach(st, "R", [q[0], FL + 0.76 + 0.035 + 0.1, q[2]]); };      // (the fist on the top just in from the edge: at the edge it sank into it, the independent review of v1i)      // (the palm on the top, the hand lying on it)
  const R2 = { handL: "relaxed" as const, handR: "fist" as const }, L0: [Seg, Seg] = [[8, 14], [22, 6]];      // (the hanging hand a little out from his hip: in at the front it read as on his groin, the independent review of v1i)      // (the hand curled over the table's edge: laid open, it was drawn palm up)
  ease(m, -1, { ...onEdge(0.3), armL: L0, head: [-16, 6, 0], lean: 8 }, 0.01, { ...R2, face: SEARCH(0.6) });
  ease(m, 0.15, { ...onEdge(0.37), armL: [[12, 8], [30, -4]], head: [12, 7, 3], lean: 9 }, 0.8, { ...R2, face: SEARCH(-0.7) });
  ease(m, 1.05, { ...onEdge(0.44), armL: [[6, 12], [24, -10]], head: [-10, 6, -3], lean: 8 }, 0.8, { ...R2, face: SEARCH(0.7) });
  ease(m, 1.95, { ...onEdge(0.5), armL: L0, head: [16, 5, 4], lean: 9 }, 0.8, { ...R2, face: SEARCH(-0.6) });
  return { cast: (t: number) => on("mate", MATE_SHORT_D, m, t, FL, {}, 5) };
};

// below deck: the shutters closed over the windows, the room lit only by the lantern on the table: dark, with warm light on the faces
// from the lantern's side and a thin rim so that the figures read on a phone
const CX = CABIN.at[0], CZ = CABIN.at[2];
/** a lens on a figure standing at `at` (floor height y), looking along the way `yaw` (degrees; 0 = toward -z, into the cabin's back wall,
 *  90 = toward +x): "full" shows the whole figure with room to every edge, "close" his head and shoulders (Shot.closeUp), "two" a little
 *  wider for two. (Placed by hand in v1c's first try, nine lenses cut a figure at the edge) */
/** aim: the lens turned this many degrees off him, so that he stands to one side of the picture (the same lens place) */
const frameOn = (at: V3, y: number, yaw: number, kind: "full" | "close" | "two", fov?: number, far = 1, hc = 1.74, aim = 0) => { const r = (yaw * Math.PI) / 180, fx = Math.sin(r), fz = -Math.cos(r), ra = r + (aim * Math.PI) / 180;
  const f = fov ?? (kind === "close" ? 36 : kind === "two" ? 54 : 50), d = far * (kind === "close" ? 1.75 : (kind === "two" ? 1.3 : 1.18) / Math.tan(((f / 2) * Math.PI) / 180)), h = kind === "close" ? hc : 1.25;
  return lens(at[0] - fx * d, y + h, at[2] - fz * d, Math.sin(ra), -Math.cos(ra), kind === "close" ? 0 : -3, f); };
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
type ShotO = { id: string; a: number; b: number; V: Lens; push?: number; cast: ((t: number) => Actor)[]; things?: (g: THREE.Group, c: Record<string, any>, cam: Cam) => void; sun: boolean; patch?: "A" | "B"; look?: Shot["look"]; close?: boolean; sounds?: Shot["sounds"]; hide?: string[]; newScene?: Shot["newScene"]; matchCut?: string; noPole?: boolean };
const add = (o: ShotO) => shots.push({ id: o.id, a: o.a, b: o.b, still: (o.b - o.a) * 0.5, cam: (_t, u) => o.V.push((o.push ?? 0.06) * u), sun: { target: o.sun ? [PIR_DECK[0], MD, PIR_DECK[1]] : inCabin([0, 0, 0]), reach: o.sun ? 6 : 4 },
  ...(o.patch ? { patchEye: { pirate: o.patch } } : {}), ...(o.close ? { closeUp: { pirate: "close on his face and the patch", mate: "close on his face in the dark" } } : {}), look: o.look, hide: [...(o.hide ?? []), ...(o.sun ? ["cabin room"] : ["table bottle", "cabin mirror"])], newScene: o.newScene, matchCut: o.matchCut,
  ...(o.sun ? {} : { light: DARK_LIGHT }), sounds: o.sounds ?? [], beds: o.sun ? deckBeds(o.b - o.a) : BELOW(o.b - o.a),
  cast: (t) => o.cast.map((f) => f(t)), things: (g, c, _t, T2, cam) => { if (o.sun) { if (!o.noPole) flagpole(g, T2); } else below(g, T2, cam, o.id.startsWith("record")); o.things?.(g, c, cam); } } as Shot);

// ---------------- the deck in the sun ----------------
const DECK = lens(-10.9, 1.5, 2.2, 1, 0, 0, 50);      // (level: tipped down, a hatch at the bottom right corner was cut by the edge)
const deckAt = (d: number, l: number): [number, number] => DECK.spot(d, l);
const PIR_DECK = deckAt(3.2, 0.08), PIR_DECK3: V3 = [PIR_DECK[0], MD, PIR_DECK[1]];
// (the flag lower on its pole, so that it flies whole in the picture under the words: at the top it was cut by the edge, and the words lay over it)
const FLAG = once(() => clothFlag("pirate", 1.0, 0.68)), POLE_AT = deckAt(4.0, -1.3);      // (the pole off to the side: by the pirate it stood on or along his head in four shots, the independent review of v1i)
const flagpole = (g: THREE.Group, T2: number) => { g.add(rod([POLE_AT[0], MD, POLE_AT[1]], [POLE_AT[0], MD + 2.55, POLE_AT[1]], 0.035, "#5a3a22"));
  const f = FLAG(); f.wave(T2, 1); put(g, f.obj, [POLE_AT[0], MD + 2.5, POLE_AT[1]], Math.PI / 2); };
const deckBeds = (len: number) => [{ k: "sea", a: 0, b: len, g: 0.8 }, { k: "wind", a: 0, b: len, g: 0.45 }, { k: "birds", a: 0, b: len, g: 0.3 }, { k: "flap", a: 0, b: len, g: 0.35 }];
const FACE = lens(-10.9 + 0.25, 1.45, 2.2 + 0.02, 1, -0.01, -3, 50);
const MATE_SHORT_DECK = deckAt(5.0, -0.78);

// ---------------- the shots ----------------
const PIR_AT = inCabin([-0.3, 0, 0.25]), MAT_AT = inCabin([0.32, 0, -0.42]), MAT_AT2 = inCabin([0.1, 0, 0.25]);
const WIDE = cabinLens(0.02, 1.3, 3.6, 0.0, -1, -3, 54);
const TLT = 0.6;      // (the book's top tipped away from the lens: its pages turned up toward his face, as one reads)
const NH = 1.85, NF = 3.6, NL = -0.55, RY = 118, RD = 5.6, RH = 2.6, RP = -14, VY = 0, VM = -50, VT = 20, NY = 100, NT = 8, NB = [1.6, 1.4, 8];
const MA = 9, TA = -8;      // (mins and test to one side of the picture: centred they were the same picture as below and dark, the independent reviewer of v1n)
const CF = 1.38, C1 = [1.75, -3], C2 = [0.95, 0], C3 = [1.55, 0], C4 = [1.35, -7], C5 = [2.0, 0];      // (far, aim of calm, myth, verdict, trick and real: four cabin shots of him alike and real like deck2 in v1k, the review's independent reviewer)      // (calm's lens 1.38 back: at 1.5 a blue thing on the floor was cut by the corner, the independent review of v1i)
const SUNZ = 2.0, SUNH = 2.0, SUNP = -5, D2X = 0, D2Y = 0.55, D2P = 5;      // (sun: the lens higher, so the boom stands clear above both heads; deck2: lower, so the deck lantern hides behind him, not at his jaw: the independent review of v1k)
const PY = 90, PH = 1.68;      // (the deck close-up from 90 degrees at 1.68 m: the boom and the sail above his head with sea between; from 50 two shrouds, from 110 the flag's pole and from 25 the flag ended on his head, the independent reviews of v1g and v1i)      // (the deck close-up from 50 degrees, the sails behind him: from 90 the flag's corner sat on his head (the independent review of v1g), from 110 and 140 a pole ran down into his head (our own look at v1h))
const NR = 15;      // (the close-up in 'nobody' from 15 degrees: from 40-62 the flag's pole stood up out of his head)
const CAN_AT = W.find((w) => w.line === "flip" && /^can/i.test(w.w))!.a - 0.1;      // ("...and you CAN see": his eye goes wide)
const FLIP_AT = W.find((w) => w.line === "flip" && /flip/i.test(w.w))!.a - 0.03;      // (the cut on the word "Flip", with the whoosh: the review of v1d)
const S = {
  s2: T.s2, s3: T.s3, s4: T.s4, s4b: L.below.b, s5: L.mins.a + 0.8, s5b: L.mins.a + 2.3, s6: T.s6, s6b: L.patch.a + 1.4, s7: FLIP_AT, s8: T.s8, s8b: L.myth.a + 2.0, s9: T.s8b, s10: T.s9, s10b: L.but.b + 0.15, s11: T.s10, s11b: L.proof.a + 1.6, s12: T.s11, s12b: L.trick.b - 0.25, end: T.end };
// 1. (0 - 2.4) WHY DID PIRATES WEAR EYE PATCHES? In the dark below, the pirate reads calmly, his head following the lines from the first
//    frame, while his shipmate behind him feels the air and stumbles. A creak on the first frame. The last shot is this one again
const opening = (id: string, a: number, b: number) => { const r = reader(PIR_AT, FL, WIDE, 22, false, b - a, { lines: true, ...(id === "end" ? { puzzled: 0.45 } : {}) }), mt = mate(MAT_AT, WIDE, 48, 2, b - a, { stumble: 0.35, heads: 0.5 });      // (turned 65 with his head swinging 24 more, he stood in bare profile on frame one, the independent review of v1f)
  add({ id, a, b, V: WIDE, cast: [r.cast, mt.cast], things: r.book, sun: false, patch: "B", look: r.look, sounds: [{ t: 0, k: "creak", g: 0.8 }, { t: 0.4, k: "thud", g: 0.3 }], ...(id === "hook" ? {} : { newScene: { pirate: "the same moment below as the opening: the film loops" } }) }); };
opening("hook", 0, S.s2);
// 2. ONE IDEA: SO THEY NEVER FOUGHT BLIND. The mate at the table, his hand feeling along its edge, his eyes screwed up
const TBL_AT = inCabin([0.5, 0, -0.18]), YW = 70, TN = -40;
{ const V = frameOn(TBL_AT, FL, YW, "two", 50, 1), mt = mateTable(TBL_AT, V, TN, S.s3 - S.s2); add({ id: "dark", a: S.s2, b: S.s3, V, cast: [mt.cast], sun: false, hide: ["cabin stool"] }); }      // (the stool hidden: it stood before his feet, cutting one, in seconds 2-5: the independent review of v1f)
// 3. UP ON DECK, THE SUN IS BLINDING. On deck in the sun: the pirate reads (the patch on his right eye), the mate squints
//    (the lens tipped 4 degrees up and the two half a step further off: tipped down, the merchant's hatch stood cut by the bottom right
//    corner, the review of v1b)
{ const SV = lens(-10.9, SUNH, SUNZ, 1, 0, SUNP, 50), P3 = DECK.spot(3.5, 0.05), MS = DECK.spot(5.1, -0.8), PS: V3 = [P3[0], MD, P3[1]];
  const r = reader(PS, MD, SV, 24, true, S.s4 - S.s3, { moves: true }), mm = mover(MATE_SHORT_D, HM, MS[0], MS[1], SV.toward(MS[0], MS[1], -24)); mm.w = 0.09; mm.stand(9);
  ease(mm, -1, { ...REST, head: [8, -6, 0], lean: 3 }, 0.01, { ...LOOSE, face: SQUINT }); ease(mm, 0.5, { ...REST, head: [-6, -9, 0], lean: 5, py: -0.01 }, 1.0, { ...LOOSE, face: { ...SQUINT, lid: 0.75 } });
  add({ id: "sun", a: S.s3, b: S.s4, V: SV, push: 0.08, cast: [r.cast, (t) => on("mate", MATE_SHORT_D, mm, t, MD, {}, 5)], things: r.book, sun: true, patch: "A", look: r.look, newScene: { pirate: "up on deck in the sun: another place than below" } }); }
// 4. GO BELOW, AND YOU CAN'T SEE A THING. Below, wide and dark, the mate small in the room, feeling his way, stumbling
{ const V = frameOn(MAT_AT2, FL, -32, "full", 50, 1.4), mt = mate(MAT_AT2, V, 60, 1, S.s4b - S.s4, { stumble: 1.0 }); add({ id: "below", a: S.s4, b: S.s4b, V, cast: [mt.cast], sun: false, sounds: [{ t: 0.05, k: "creak", g: 0.6 }, { t: 1.05, k: "thud", g: 0.35 }] }); }
// 5. "Who blew out the sun?!" Close on the mate's face in the dark, shouting, his head high in the picture
{ const V = frameOn(MAT_AT2, FL, -12, "close", 36, 1, 1.62), mt = mate(MAT_AT2, V, 25, 0, S.s5 - S.s4b, { hang: true, shout: true }); add({ id: "who", a: S.s4b, b: S.s5, V, push: 0.03, cast: [mt.cast], sun: false, close: true }); }
// 6. EYES NEED TWENTY TO THIRTY MINUTES... The pirate reading, seen from his left at three quarters, the book tipped up to him, his head
//    following the lines
{ const V = frameOn(PIR_AT, FL, -38, "full", 80, C1[0], 1.74, C1[1]), r = reader(PIR_AT, FL, V, 24, false, S.s5b - S.s5, { lines: true, tilt: TLT }); add({ id: "calm", a: S.s5, b: S.s5b, V, cast: [r.cast], things: r.book, sun: false, patch: "B", look: r.look }); }
// 7. ...TO GET USED TO THE DARK. The mate from behind his right shoulder, his hands low and searching
{ const V = frameOn(MAT_AT, FL, 46, "full", 50, 1.55, 1.74, MA), mt = mate(MAT_AT, V, 60, 2, S.s6 - S.s5b); add({ id: "mins", a: S.s5b, b: S.s6, V, cast: [mt.cast], sun: false }); }
// 8. BUT AN EYE UNDER A PATCH... On deck, the pirate reading in the sun, from low at his side
{ const V = lens(PIR_DECK[0] - 2.6 + D2X, MD + D2Y, PIR_DECK[1] - 1.75, 0.83, 0.56, D2P, 52), r = reader(PIR_DECK3, MD, V, 20, true, S.s6b - S.s6); add({ id: "deck2", a: S.s6, b: S.s6b, V, hide: ["brigcask", "brigcoil"], cast: [r.cast], things: r.book, sun: true, patch: "A", look: r.look, newScene: { pirate: "up on deck in the sun: another place than below" } }); }
// 9. ...IS ALREADY USED TO IT. Close on his face in the sun: the patch over his right eye (the first of the pair)
{ const V = frameOn(PIR_DECK3, MD, PY, "close", undefined, 1, PH), r = reader(PIR_DECK3, MD, V, 8, true, S.s7 - S.s6b, { looks: 0.2, closeUp: true }); add({ id: "patch", a: S.s6b, b: S.s7, V, push: 0.05, cast: [r.cast], things: r.book, sun: true, patch: "A", close: true }); }
// 10. FLIP THE PATCH, AND YOU CAN SEE. On "Flip", a whoosh and close on his face in the dark: the patch over his LEFT eye now, his right eye
//     wide open with a big dark pupil (the second of the pair: the move itself is never shown)
{ const V = frameOn(PIR_AT, FL, 0, "close"), r = reader(PIR_AT, FL, V, 14, false, S.s8 - S.s7, { looks: 0.15, wide: CAN_AT - S.s7, closeUp: true }); add({ id: "flip", a: S.s7, b: S.s8, V, push: 0.04, cast: [r.cast], things: r.book, sun: false, patch: "B", close: true, sounds: [{ t: 0, k: "whoosh", g: 0.9 }], newScene: { pirate: "below deck: the patch moved to his other eye between the two close-ups" }, matchCut: "the patch's move: the same close-up on deck and in the dark, the patch on the other eye, with a whoosh (the review of v1c and v1d)" }); }
// 11. IN 2007, MYTHBUSTERS... He reads in the dark at three quarters from his right, the book tipped up to him, his head following the lines
{ const V = frameOn(PIR_AT, FL, 40, "two", 46, C2[0], 1.74, C2[1]), r = reader(PIR_AT, FL, V, 30, false, S.s8b - S.s8, { lines: true, tilt: TLT }); add({ id: "myth", a: S.s8, b: S.s8b, V, cast: [r.cast], things: r.book, sun: false, patch: "B", look: r.look }); }
// 12. ...TESTED THE IDEA. The mate turned the other way, hands low, a stumble
{ const V = frameOn(MAT_AT2, FL, -24, "full", 50, 1.15, 1.74, TA), mt = mate(MAT_AT2, V, -60, 2, S.s9 - S.s8b, { stumble: 0.6 }); add({ id: "test", a: S.s8b, b: S.s9, V, cast: [mt.cast], sun: false, hide: ["cabin stool"], sounds: [{ t: 0.65, k: "thud", g: 0.3 }] }); }
// 13. THEIR VERDICT: PLAUSIBLE. From his right, further off, the room round him: he looks up from the book at us, pleased
// (waist up from his left, he looks at us with his eyes, his head still turned a little with his body: front on he was the same picture as
//  calm, myth and trick, and a reverse angle stood behind the back wall, the review's independent reviewer of v1k)
{ const V = frameOn(PIR_AT, FL, VY, "full", 50, C3[0], 1.74, C3[1]), r = reader(PIR_AT, FL, V, VT, false, S.s10 - S.s9, { looks: 0.4 }), vm = mate(TBL_AT, V, VM, 1, S.s10 - S.s9, { heads: 0.5 });      // (searching with his hands low behind the pirate: his hand on the table swung over the pirate's fist and its forearm vanished, the independent review of v1m)
  add({ id: "verdict", a: S.s9, b: S.s10, V, cast: [r.cast, vm.cast], things: r.book, sun: false, patch: "B", hide: ["cabin stool"] }); }
// 14. BUT DID REAL PIRATES DO IT? On deck in the sun, seen from his other side, reading
{ const V = (() => { const r0 = (RY * Math.PI) / 180, fx = Math.sin(r0), fz = -Math.cos(r0); return lens(PIR_DECK3[0] - fx * RD, MD + RH, PIR_DECK3[2] - fz * RD, fx, fz, RP, 50); })(), r = reader(PIR_DECK3, MD, V, 18, true, S.s10b - S.s10, { lines: true });      // (reading line by line: he stood still for 1.8 s, the independent review of v1m)
  add({ id: "real", a: S.s10, b: S.s10b, V, hide: ["brigcask", "brigcoil"], cast: [r.cast], things: r.book, sun: true, patch: "A", look: r.look, newScene: { pirate: "up on deck in the sun: another place than below" } }); }
// 15. NOBODY KNOWS. (now the mate, see below) Close, from low down against the sky and the sail: he looks up from the book (after 'real', which showed him whole
//     from the same size and pose, the cut jumped: the independent review of v1f)
// (the mate on deck in the sun, squinting, shaking his head: "nobody knows". Him, not the pirate: the pirate's close-up here was the same
//  picture as the one at 'patch', whatever its size, the sharpened twice test after the review's independent reviewer of v1k)
{ const MS = DECK.spot(5.1, NL), MS3: V3 = [MS[0], MD, MS[1]], V = (() => { const r = (NY * Math.PI) / 180, fx = Math.sin(r), fz = -Math.cos(r); return lens(MS3[0] - fx * NF, MD + NH, MS3[2] - fz * NF, fx, fz, -10, 48); })(), mm = mover(MATE_SHORT_D, HM, MS[0], MS[1], V.toward(MS[0], MS[1], 20)); mm.w = 0.09; mm.stand(9);
  ease(mm, -1, { ...REST, head: [0, -4, 0], lean: 3 }, 0.01, { ...LOOSE, face: SQUINT });
  wag(mm, 0.15, S.s11 - S.s10b, P({ ...REST, head: [16, -3, 3], lean: 3, px: 0.008 }), P({ ...REST, head: [-16, -3, -3], lean: 4, px: -0.008 }), 0.6, { ...LOOSE, face: { ...SQUINT, lid: 0.6, mouth: 0, smile: -0.5, brow: 0.6 }, glide: true });      // (puzzled, lips pressed: with the mouth open the squint read as a grin)
  add({ id: "nobody", a: S.s10b, b: S.s11, V, push: 0.04, cast: [(t) => on("mate", MATE_SHORT_D, mm, t, MD, {}, 5)], sun: true, noPole: true }); }      // (no flagpole: it stood close before the lens at the left edge)
// 16-17. NO PICTURE OR RECORD FROM THEIR TIME SAYS SO. Below, on the wall by a small lantern that lights it, the old picture of pirates drawn
//    by us: wide, then close on their faces, every one with both eyes
const PRINT = once(() => noShade(piratePrint())), PRINT_AT = inCabin([0.62, 0, -CABIN.d / 2 + 0.1]);
// (a ship's lantern on an iron bracket beside the picture: a glowing glass between four dark corner posts, a dark base, a four-sided cap and a
//  ring on top. A plain glowing box above the picture did not read as a lantern and its cap touched the words: the independent review of v1f)
const LAMP_AT: V3 = [PRINT_AT[0] + 0.36, FL + 1.44, PRINT_AT[2] + 0.12];
const WALL_LAMP = once(() => { const gL = new THREE.Group(), [lx, ly, lz] = LAMP_AT, ink = "#24232b";
  const glass = mesh(cyl(0.04, 0.04, 0.12, 12), "#ffd389", { at: [lx, ly, lz], line: 0 }); glass.traverse((q) => { if ((q as THREE.Mesh).isMesh && !(q as any).isLineSegments) (q as THREE.Mesh).material = new THREE.MeshBasicMaterial({ color: "#ffc76a" }); });      // (lit from inside)
  gL.add(glass);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) gL.add(mesh(box(0.012, 0.13, 0.012), ink, { at: [lx + sx * 0.042, ly, lz + sz * 0.042], line: 0.3 }));
  gL.add(mesh(box(0.11, 0.025, 0.11), ink, { at: [lx, ly - 0.075, lz], line: 0.4 }), mesh(cyl(0.012, 0.075, 0.06, 4), ink, { at: [lx, ly + 0.095, lz], rot: [0, Math.PI / 4, 0], line: 0.4 }));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.005, 6, 14), new THREE.MeshBasicMaterial({ color: ink })); ring.position.set(lx, ly + 0.14, lz); gL.add(ring);
  gL.add(mesh(box(0.012, 0.012, 0.13), ink, { at: [lx, ly + 0.16, lz - 0.06], line: 0.3 }), mesh(box(0.012, 0.03, 0.012), ink, { at: [lx, ly + 0.15, lz], line: 0.3 }));      // (the bracket from the wall)
  const pl = new THREE.PointLight("#ffb46a", 1.6, 1.4, 1.6); pl.position.set(lx - 0.1, ly, lz + 0.1); gL.add(pl); return gL; });
const print = (g: THREE.Group, T2: number, cam: Cam) => { PRINT().position.set(PRINT_AT[0], FL + 1.38, PRINT_AT[2]); g.add(PRINT()); g.add(WALL_LAMP()); glow(g, LAMP_AT, 0.3, 0.3, T2, Math.atan2(cam.pos[0] - LAMP_AT[0], cam.pos[2] - LAMP_AT[2]), 4); };
add({ id: "record", a: S.s11, b: S.s11b, V: lens(PRINT_AT[0] + 0.09, FL + 1.42, PRINT_AT[2] + 1.85, 0.0, -1, 5, 44), push: 0.15, cast: [], things: (g, _c, cam) => print(g, S.s11, cam), sun: false, sounds: [{ t: 0.2, k: "creak", g: 0.4 }], hide: ["cabin stool"] });
add({ id: "record2", a: S.s11b, b: S.s12, V: lens(PRINT_AT[0] + 0.07, FL + 1.39, PRINT_AT[2] + 0.75, -0.02, -1, 0, 34), push: 0.12, cast: [], things: (g, _c, cam) => print(g, S.s11b, cam), sun: false });
// 18. STILL. A VERY CLEVER TRICK. Below, from low down at his right, the whole of him against the beams: he looks up from the book at us,
//     smug (in v1d this was a close-up like the flip one: the review, "the same close-up twice")
{ const V = frameOn(PIR_AT, FL, 15, "full", 60, C4[0], 1.74, C4[1]);      // (closer than myth and the end: at 54 degrees and 1.0 it was the same picture as myth, the independent review of v1i)
  const r = reader(PIR_AT, FL, V, 30, false, S.s12b - S.s12, { looks: 0.1 }); add({ id: "trick", a: S.s12, b: S.s12b, V, push: 0.04, cast: [r.cast], things: r.book, sun: false, patch: "B" }); }
// 19. The opening again, and the bubble: "Arr. Which eye was it?"
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

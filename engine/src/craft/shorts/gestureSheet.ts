// The gesture sheet (Jesper, 19 Nov 2026: "Skicka ett blad med alla gester på Sir Digsworth och en bifigur, framifrån och från sidan.
// STOPP. Jag godkänner bladet innan det används"), and Blackbeard's tricorn from every side (Jesper: "Kontrollera Blackbeards trekantiga
// hatt från alla vinklar, så att spetsen inte blir en platt svart kil"). One still shot per picture, as the grip sheets are; the body
// check runs over it like over a film. It stands outdoors in daylight: the light standard's outdoor variant (the sun as the light, the
// sky as the fill, the sun's rim on the figures), which the review asked to see.
import * as THREE from "three";
import type { Film, Shot, Actor, Staged, Cam, V3 } from "../stage/film";
import { lens, once, noShade, carry, grip } from "../stage/staging";
import { reach, jointsOf, handshake, handOn } from "../stage/grips";
import { GESTURES, type Aim } from "../stage/gestures";
import { POSES, type Pose } from "../rig";
import { SIR_D, VILLAGER_D, BLACKBEARD_D } from "../looks";
import type { Design } from "../designs/common";
import { mesh, box, group, skyDome, sunRig, type Sun, type CardLight } from "../world/kit";
import { refStick, plainBook, stool } from "../world/props";

/** daylight outdoors: the sun high on the left in front, a bright sky */
export const DAY: Sun = { from: [-6, 9, 7], color: "#fff3dc", power: 2.6, sky: "#cfe4ff", ground: "#c9b48e", fill: 1.3, reach: 6 };
/** the light standard outdoors, on the figures: the sky's cool light everywhere (the shade side), the sun warm on its side and as a rim */
export const dayLight = (sunFrom: V3, at: V3): CardLight => { const n = Math.hypot(...sunFrom), far: V3 = [at[0] + (sunFrom[0] / n) * 60, at[1] + (sunFrom[1] / n) * 60, at[2] + (sunFrom[2] / n) * 60];
  return { amb: "#b9c3d8", rim: 0.8, lights: [{ at: far, color: "#fff0d6", power: 0.42, reach: 1000, rimK: 0.9 }] }; };

const world = () => { const g = new THREE.Group();
  g.add(mesh(box(40, 0.1, 40), "#d8c49c", { at: [0, -0.05, 0] }), mesh(box(40, 6, 0.2), "#e7dcc4", { at: [0, 3, -4], line: 0 }));
  g.add(skyDome("#7fb6ec", "#cfe6fb"));
  const rig = sunRig(DAY, [0, 0, 0]); g.add(rig); g.userData.rig = rig; return g; };

const LEN = 0.4, shots: Shot[] = [], STAND = POSES.stand;
type Fig = { name: string; D: Design; h: number; at: V3; heading: number; pose: Partial<Pose>; hands: { handL?: string; handR?: string } };
const actor = (f: Fig): Actor => ({ name: f.name, D: f.D, h: f.h, at: f.at, heading: f.heading, pose: { ...STAND, ...f.pose } as Pose, o: { handL: f.hands.handL as never, handR: f.hands.handR as never } });
const add = (id: string, cam: Cam, figs: Fig[], things?: (g: THREE.Group, c: Record<string, Staged>, cam: Cam) => void) => {
  const a = shots.length * LEN; shots.push({ id, a, b: a + LEN, still: LEN / 2, cam: () => cam, sun: { target: [0, 0.8, 0], reach: 5 }, capsTop: 1700,
    light: dayLight(DAY.from, [0, 1, 0]), cast: () => figs.map(actor), things: things ? (g, c, _t, _T, cm) => things(g, c, cm) : undefined }); };

/** a lens on one figure at the origin, the whole of him in the picture */
const ONE = lens(0, 1.0, 3.7, 0, -1, 0, 46), PAIR = lens(0, 1.0, 4.6, 0, -1, 0, 46);
const WHO: [string, Design, number][] = [["sir", SIR_D, 1.75], ["villager", VILLAGER_D, 1.74]];
const STOOL = once(() => noShade(stool())), STICK = once(() => noShade(refStick(1.1))), BOOK = once(() => noShade(plainBook(0.26, 0.2)));

// ---- single gestures: each on Sir and on the villager, from the front (aimed to the side) and in profile (aimed ahead) ----
const SINGLE = ["point", "explain", "shrug", "crossed", "head", "eyes", "cheer", "flex", "stickShoulder", "stickDown", "kneel", "kneelhand", "getup", "sit", "fallen"];
for (const name of SINGLE) { const G = GESTURES[name];
  // (a kneeling figure is seen from the front three-quarter, 35 degrees: straight on, the raised knee and the hands on it point at the lens)
  // (and the hand over the eyes: straight on, the head bowed into the hand bows toward the lens and the hand lies at the mouth)
  const front = (G.needs === "ground" && name !== "fallen") || name === "eyes" ? 35 : 0;
  // (a stick on the shoulder reads only from the front: side-on, behind the head, it shows above and below it, through it in the
  // picture; three-quarter, the hand is before the chest and the stick lies across it. From the side the stick is carried down, stickDown)
  const views = ([["front", "side", front], ["side", "ahead", 90]] as [string, Aim, number][]).filter((v) => name !== "stickShoulder" || v[0] === "front");
  for (const [who, D, h] of WHO) for (const [view, aim, turn] of views) {
    const fig: Fig = { name: who, D, h, at: [0, 0, 0], heading: ONE.toward(0, 0, turn), pose: G.pose(aim, 0.3), hands: G.hands };
    add(`${name}-${who}-${view}`, ONE.cam, [fig], (g, c, cam) => {
      // the stool as high as the seated man's seat: its top a hand under his hip joint, its front edge just behind the joint (a seated card
      // draws its shins in its own plane: a stool further forward stands in them)
      if (G.needs === "seat") { const s = STOOL(), j = c[who].joint("pelvis"), hd = (c[who].heading * Math.PI) / 180, top = Math.max(0.2, j[1] - 0.13); s.scale.set(1, top / 0.47, 1); const back = view === "front" ? 0.25 : 0.1; s.position.set(j[0] - Math.sin(hd) * back, 0, j[2] - Math.cos(hd) * back); g.add(s); }
      if (name === "stickShoulder") grip(g, STICK(), c[who], "R", cam, [-0.3, 1]);
      if (name === "stickDown") grip(g, STICK(), c[who], "R", cam, view === "front" ? [0.12, -1] : [0.3, -1]); }); } }

// ---- gestures done to somebody: a pair in profile, facing each other; the hands are put on each other by the reach solver ----
const A: V3 = [-0.48, 0, 0], B: V3 = [0.48, 0, 0], hA = PAIR.toward(A[0], A[2], 90), hB = PAIR.toward(B[0], B[2], -90);
const stand = (D: Design, at: V3, heading: number, h: number, pose: Partial<Pose>) => ({ D, at, heading, h, cam: PAIR.cam, pose: { ...STAND, ...pose } });
const palmOf = (s: ReturnType<typeof stand>, side: "L" | "R"): V3 => { const j = jointsOf(s) as (n: string) => V3, w = j(`wr${side}`), t = j(`tip${side}`); return [(w[0] + t[0]) / 2, (w[1] + t[1]) / 2, (w[2] + t[2]) / 2]; };
{ // stop: Sir holds up his hand toward the villager, who stops
  const g = GESTURES.stop; add("stop-pair-side", PAIR.cam, [{ name: "sir", D: SIR_D, h: 1.75, at: [-0.6, 0, 0], heading: hA, pose: g.pose("ahead", 0), hands: g.hands },
    { name: "villager", D: VILLAGER_D, h: 1.74, at: [0.6, 0, 0], heading: hB, pose: { lean: -3, head: [0, 2, 0] }, hands: {} }]); }
{ // the handshake: Sir's hand out, the villager's hand put on it
  const g = GESTURES.handshake, sa = stand(SIR_D, [-0.44, 0, 0], hA, 1.75, g.pose("ahead", 0)), pa = palmOf(sa, "R"), sb = stand(VILLAGER_D, [0.44, 0, 0], hB, 1.74, {});
  const armB = reach(sb, "R", pa); add("handshake-pair-side", PAIR.cam, [{ name: "sir", D: SIR_D, h: 1.75, at: sa.at, heading: hA, pose: g.pose("ahead", 0), hands: g.hands },
    { name: "villager", D: VILLAGER_D, h: 1.74, at: sb.at, heading: hB, pose: armB, hands: { handR: "grip" } }], (gg, c, cam) => handshake(c.sir, "R", c.villager, "R", cam)); }
{ // give and take: Sir holds out a book, the villager's hand comes to it
  const g = GESTURES.give, sa = stand(SIR_D, [-0.46, 0, 0], hA, 1.75, g.pose("ahead", 0)), pa = palmOf(sa, "R"), sb = stand(VILLAGER_D, [0.46, 0, 0], hB, 1.74, {});
  // (the villager takes it with his near hand, the left: facing Sir, his right arm is the far one and its forearm hides behind him)
  const armB = reach(sb, "L", [pa[0] + 0.27, pa[1], pa[2]]); add("give-pair-side", PAIR.cam, [{ name: "sir", D: SIR_D, h: 1.75, at: sa.at, heading: hA, pose: g.pose("ahead", 0), hands: g.hands },
    { name: "villager", D: VILLAGER_D, h: 1.74, at: sb.at, heading: hB, pose: armB, hands: { handL: "grip" } }], (gg, c, cam) => carry(gg, BOOK(), c.sir, "R", c.villager, "L", cam)); }
{ // the hand on a shoulder: side by side facing the lens, Sir's left hand on the villager's right shoulder
  // (Sir a little nearer the lens, so that his hand on the villager's shoulder lies in front of it: level with him, it was drawn behind his arm)
  const sb = stand(VILLAGER_D, [0.3, 0, 0], PAIR.toward(0.3, 0, -10), 1.74, {}), shR = (jointsOf(sb) as (n: string) => V3)("shR"), sa = stand(SIR_D, [-0.3, 0, 0.1], PAIR.toward(-0.3, 0.1, 10), 1.75, GESTURES.shoulder.pose("side", 0));
  const armA = reach(sa, "L", [shR[0], shR[1] + 0.02, shR[2]]); add("shoulder-pair-front", PAIR.cam, [{ name: "sir", D: SIR_D, h: 1.75, at: sa.at, heading: sa.heading, pose: { ...GESTURES.shoulder.pose("side", 0), ...armA }, hands: GESTURES.shoulder.hands },
    { name: "villager", D: VILLAGER_D, h: 1.74, at: sb.at, heading: sb.heading, pose: { head: [-20, 0, 0] }, hands: {} }], (gg, c, cam) => handOn(c.sir, "L", c.villager, "shR", cam)); }
{ // pulling up: Sir leans back and holds the hand of the villager sitting on the ground, who reaches up to it
  // (the one on the ground sits up with his knees bent and his feet drawn in, so that he sits close to Sir's feet without touching them,
  // and takes Sir's hand with his near hand, the left: lying back with his legs out, his shoulder was a metre from Sir's hand)
  const g = GESTURES.pullup, sa = stand(SIR_D, [-0.5, 0, 0], hA, 1.75, g.pose("ahead", 0)), pa = palmOf(sa, "R");
  // (sitting ON the ground: the thighs rise forward from the hips to the raised knees, the shins come down to the feet; with the thighs level
  // the figure rested on its feet and crouched over nothing)
  const fallen: Partial<Pose> = { legL: { th: [122, 12], sh: [38, 8] } as never, legR: { th: [116, 6], sh: [30, 4] } as never, lean: 4, armR: [[-30, 16], [-24, 12]], head: [0, -12, 0] };
  const sb = stand(VILLAGER_D, [0.4, 0, 0], hB, 1.74, fallen), armB = reach(sb, "L", pa);
  add("pullup-pair-side", PAIR.cam, [{ name: "sir", D: SIR_D, h: 1.75, at: sa.at, heading: hA, pose: g.pose("ahead", 0), hands: g.hands },
    { name: "villager", D: VILLAGER_D, h: 1.74, at: sb.at, heading: hB, pose: { ...fallen, ...armB }, hands: { handL: "grip", handR: "open" } }], (gg, c, cam) => handshake(c.sir, "R", c.villager, "L", cam)); }

// ---- Blackbeard's tricorn from every side: turned in steps of 30 degrees, and seen from above and from below ----
// (wide enough for the whole hat over the head: closer, the top edge cut the hat off)
const HAT = (pitch: number, up: number) => lens(0, 1.72 + up, 2.0, 0, -1, pitch, 32);
for (let yaw = 0; yaw < 360; yaw += 30) add(`hat-${String(yaw).padStart(3, "0")}`, HAT(0, 0).cam, [{ name: "bb", D: BLACKBEARD_D, h: 1.92, at: [0, 0, 0], heading: HAT(0, 0).toward(0, 0, yaw), pose: {}, hands: {} }]);
add("hat-above", HAT(-18, 0.88).cam, [{ name: "bb", D: BLACKBEARD_D, h: 1.92, at: [0, 0, 0], heading: 0, pose: {}, hands: {} }]);
add("hat-below", HAT(28, -0.85).cam, [{ name: "bb", D: BLACKBEARD_D, h: 1.92, at: [0, 0, 0], heading: 0, pose: {}, hands: {} }]);

export const GESTURE_SHEET: Film = { id: "gesture-sheet", fps: 30, seconds: shots.length * LEN, range: [0, 999], sky: "#9cc8f0", world, shots, words: [], hook: { text: [], a: 0, b: 0 } };

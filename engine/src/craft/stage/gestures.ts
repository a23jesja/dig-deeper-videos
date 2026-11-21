// The gesture library (Jesper, 19 Nov 2026, "Human bodies move like humans": "Bygg gestbiblioteket ... Skriv varje gest som en människa
// gör den: handform, handflatans riktning, armbågens böjning, kroppens vridning och blickens riktning"). Built once, approved as a
// sheet (shorts/gestureSheet.ts), then reused by every film. Nothing here is used in a film before Jesper has approved the sheet.
//
// Every gesture is a pose in the body's own terms (rig.ts: an arm is [upper arm, forearm], each [swing forward, out to the side] in
// degrees from hanging), inside the joint limits (humanBody.ts) by construction. A card cannot show depth: an arm reaching toward the
// lens is drawn over the body (the body check's test m). So a gesture that is aimed somewhere is written for two directions:
//   "side"  = to the figure's side, in the picture's plane when he faces the lens (the front view);
//   "ahead" = straight ahead, in the picture's plane when he is seen in profile (the side view, or a pair facing each other).
// Two-person gestures (stop, hand on a shoulder, handshake, pull up, give and take) are staged as a pair in profile; their contact is
// declared with grips.handshake / handOn / carry, so that the checks know the hands meet on purpose. The reference Shorts' lesson 1
// (DAILY-RULES, 19 Nov): avoid these unless the story is that action, then show it as a close-up of the hands.
import type { Pose, Seg, LegFK, FootIK } from "../rig";
import { POSES } from "../rig";
import type { HandKind } from "../ink";

export type Aim = "side" | "ahead";
export type Gesture = {
  /** how a person does it: hand shape, palm, elbow, body turn, eyes */
  how: string;
  /** the pose at the time t (seconds; a gesture may move a little: an explaining hand opens outward on the stressed word) */
  pose: (aim: Aim, t: number) => Partial<Pose>;
  hands: { handL?: HandKind; handR?: HandKind };
  /** a gesture done to somebody: staged as a pair in profile */
  pair?: true;
  /** a gesture that needs something under the figure (a seat, the floor): the sheet puts it there */
  needs?: "seat" | "ground";
  /** DAILY-RULES lesson 1: avoid unless the story is this action; then a close-up of the hands */
  avoid?: true;
  /** the least turn from the lens (degrees, 0 = facing it) at which the gesture may be shown; under it, it is not used */
  minTurn?: number;
};

const REST: [Seg, Seg] = [[0, 10], [10, 4]];
/** an arm that lies in one plane: the upper arm `a1` and the forearm `a2` degrees from hanging, toward the side or ahead, `off` degrees
 *  out of that plane (an elbow is bent by a2 - a1) */
const planar = (aim: Aim, a1: number, a2: number, off = 8): [Seg, Seg] => (aim === "side" ? [[off, a1], [off + 4, a2]] : [[a1, off], [a2, off]]);
const STAND = POSES.stand;
/** a figure's legs and pelvis kneeling on the right knee, the left foot planted ahead. Solved so that the right foot's toes rest on the
 *  ground beside the planted foot and the knee is down (0.04 leg lengths up: its own roundness): py -0.51, the shin back at -100, the foot
 *  tipped 20 (at -0.53 and 60 the foot sank 14 cm into the ground) */
const KNEEL: Partial<Pose> = { py: -0.51, legL: { z: 0.42, x: 0.04, toe: 10 } as FootIK, legR: { th: [-6, 4], sh: [-100, 0], pitch: 20 } as LegFK };

/** Jesper's library rules of 21 Nov 2026 (the flat 2D look frozen), checked by scripts/flat_check.mjs on every clip:
 *  1. Point: at something further away, the elbow slightly bent, the eyes on the target, at most one second; never straight at another
 *     figure's body at close range (clip.points: the hold, the target's distance from every other figure, the finger's aim, the gaze).
 *  2. Animals and things that turn up come in from the side or out of a hole that is seen before they come, never out of empty ground
 *     (clip.appear: a side entry starts outside the picture, a hole is drawn from its first frame).
 *  3. Rest: a figure standing still shifts its weight, breathes and moves its head a little (motion.ts, the idle; the check fails a
 *     figure whose body is dead still for a second). */
export const LIBRARY_RULES = ["point far, elbow bent, eyes on it, at most 1 s", "things enter from the side or a seen hole", "standing still: weight, breath, head"];

export const GESTURES: Record<string, Gesture> = {
  point: { how: "The body turns a little toward the target and the eyes go to it. The pointing arm is raised toward it, a little under shoulder height, the elbow bent (about 30 degrees, never locked), the index finger out and the other fingers curled. The other arm hangs at ease. Jesper, 21 Nov 2026: at something further away, never straight at another figure's body at close range; held at most one second (acting.ts pointAt; the check reads clip.points).",
    pose: (aim) => ({ ...STAND, armR: planar(aim, 62, 92), armL: REST, twist: aim === "side" ? -10 : 0, lean: aim === "ahead" ? 4 : 0, head: aim === "side" ? [-30, 0, 0] : [0, -2, 0] }), hands: { handR: "point", handL: "relaxed" } },
  explain: { how: "Both hands in front of the chest at waist height, palms up and open, the elbows bent about 60 degrees close to the body. On the stressed words the hands open outward a little and come back. The eyes on the listener.",
    pose: (_aim, t) => { const o = 42 + 12 * Math.max(0, Math.sin(t * 3.2)); return { ...STAND, armL: [[18, 20], [70, o]], armR: [[18, 20], [70, o]], head: [0, 2, 0] }; }, hands: { handL: "open", handR: "open" } },
  shrug: { how: "The elbows stay close to the body and bend about 60 degrees, the forearms open outward with the palms up, the head tilts to one side. \"I don't know.\"",
    pose: () => ({ ...STAND, armL: [[6, 14], [55, 60]], armR: [[6, 14], [55, 60]], head: [0, 4, 14] }), hands: { handL: "open", handR: "open" } },
  crossed: { how: "The forearms lie over each other across the lower chest, the hands tucked at the other side, the upper arms down along the body. Never at shoulder height.",
    pose: () => ({ ...STAND, armR: [[22, -8], [80, -62]], armL: [[24, -8], [78, -58]], head: [0, -2, 0] }), hands: { handL: "relaxed", handR: "relaxed" } },
  stop: { how: "One arm forward toward the other person, the elbow bent about 60 degrees, the hand at chest height with the palm out toward him and the fingers up. The body leans back a little; the eyes on him.",
    pose: (aim) => ({ ...STAND, armR: planar(aim, 40, 100), armL: REST, lean: -4, twist: aim === "side" ? -12 : 0, head: aim === "side" ? [-25, 0, 0] : [0, 0, 0] }), hands: { handR: "open", handL: "relaxed" }, pair: true },
  shoulder: { how: "Standing beside him, the near arm goes up and across to his shoulder, the elbow bent about 70 degrees, the hand resting on top of the shoulder, palm down. The heads turn toward each other.",
    pose: () => ({ ...STAND, head: [20, 0, 0] }), hands: { handL: "open", handR: "relaxed" }, pair: true, avoid: true },
  handshake: { how: "Facing each other close (less than a metre between the chests), the right hands meet at waist height between them, the elbows bent about 55 degrees, the thumbs up. Eyes on each other.",
    pose: () => ({ ...STAND, armR: planar("ahead", 28, 82, 6), armL: REST }), hands: { handR: "grip", handL: "relaxed" }, pair: true, avoid: true },
  pullup: { how: "The one who pulls stands with his feet apart, the knees bent and the body leaning back, the pulling arm bent about 30 degrees; the one on the ground reaches up and the hands hold each other.",
    pose: () => ({ ...STAND, lean: -14, py: -0.1, legL: { z: -0.2, x: 0.08, toe: 18 } as FootIK, legR: { z: 0.04, x: 0.06, toe: 10 } as FootIK, armR: planar("ahead", 58, 42, 6), armL: REST }), hands: { handR: "grip", handL: "relaxed" }, pair: true, avoid: true },
  give: { how: "Facing each other, the giver holds the thing out at chest height with the elbow bent about 50 degrees; the taker's hand comes to the same thing, his elbow bent too. Eyes on the thing, then on each other.",
    pose: () => ({ ...STAND, armR: planar("ahead", 30, 78, 6), armL: REST }), hands: { handR: "grip", handL: "relaxed" }, pair: true },
  kneel: { how: "Down on the right knee, the left foot planted ahead with the shin upright, the body upright or leaning a little forward. One hand rests on the raised knee, the other hangs.",
    pose: () => ({ ...KNEEL, lean: 6, armL: [[30, 8], [60, 4]], armR: REST, head: [0, 6, 0] }), hands: { handL: "relaxed", handR: "relaxed" }, needs: "ground" },
  kneelhand: { how: "The beaten man: down on one knee with one hand on the ground beside him, the body leaning over it, the head down.",
    pose: () => ({ ...KNEEL, lean: 44, armR: [[10, 16], [14, 12]], armL: [[30, 8], [60, 4]], head: [0, 4, 0] }), hands: { handL: "relaxed", handR: "open" }, needs: "ground" },
  // (the review, 19 Nov, after the tightened seat check: seen from the front, a seated card's shins hang straight down under its hips, so
  //  a seat cannot be under the hips without the shins inside it; every front-view sitter sat in the air in front of his seat. Sitting is
  //  shown at three quarters or in profile only, never from the front)
  sit: { minTurn: 45, how: "Sitting on the front half of a seat, the thighs level, the shins down, the feet flat. The hands rest on the thighs, the back upright. Shown at three quarters or in profile only, never from the front.",
    pose: () => ({ py: -0.36, legL: { th: [86, 6], sh: [4, 4] } as LegFK, legR: { th: [86, 6], sh: [4, 4] } as LegFK, armL: [[14, 8], [50, 4]], armR: [[14, 8], [50, 4]], lean: 2 }), hands: { handL: "relaxed", handR: "relaxed" }, needs: "seat" },
  fallen: { how: "Fallen on his back side: sitting on the ground, the legs out in front, the body leaning back on both hands planted behind him, the head up.",
    pose: () => ({ legL: { th: [84, 10], sh: [82, 8] } as LegFK, legR: { th: [80, 4], sh: [74, 2] } as LegFK, lean: -28, armL: [[-38, 18], [-30, 14]], armR: [[-38, 18], [-30, 14]], head: [0, -10, 0] }), hands: { handL: "open", handR: "open" }, needs: "ground" },
  getup: { how: "Getting up from one knee: the front foot planted, the body leaning forward over it, both hands pushing on the raised knee, the eyes ahead.",
    pose: () => ({ ...KNEEL, lean: 26, armL: [[30, 8], [42, 6]], armR: [[30, -6], [42, -12]], head: [0, -14, 0] }), hands: { handL: "open", handR: "open" }, needs: "ground" },
  head: { how: "Both hands on the sides of the head, the elbows up and out to the sides, bent about 130 degrees, the eyes wide. \"Oh no.\"",
    pose: () => ({ ...STAND, armL: [[25, 60], [15, -160]], armR: [[25, 60], [15, -160]], head: [0, -4, 0] }), hands: { handL: "open", handR: "open" } },
  eyes: { how: "One hand over the eyes, palm in, the elbow bent and forward, the head bowed down into the hand (the eyes come to the hand); the other arm hangs.",
    pose: () => ({ ...STAND, armR: [[72, 18], [176, -46]], armL: REST, head: [0, 34, 0], lean: 8 }), hands: { handR: "open", handL: "relaxed" } },
  cheer: { how: "Both arms up over the head in a V, the elbows almost straight (bent about 20 degrees), the hands open or in fists, the head up.",
    // (in profile, "ahead", the arms go up a little behind the head: raised forward, the near arm lay over the face. With the arm raised past
    // level, a positive swing takes it back: the rig's swing turns over with the arm)
    pose: (aim) => { const [sw, fw] = aim === "ahead" ? [42, 44] : [12, 8]; return { ...STAND, armL: [[sw, 142], [fw, 160]], armR: [[sw, 142], [fw, 160]], head: [0, -10, 0] }; }, hands: { handL: "fist", handR: "fist" } },
  flex: { how: "Both upper arms out to the sides at shoulder height, the forearms straight up, bent 90 degrees at the elbow, the fists tight, the chest out, a grin.",
    // (the flex reads from the front and from three-quarter, not side-on: in profile the arms out to the sides point at the lens and the near
    // forearm rises in front of the face, and elbows back with the fists behind the head would bend the elbows the wrong way)
    pose: () => ({ ...STAND, armL: [[0, 86], [0, 176]], armR: [[0, 86], [0, 176]], lean: -3 }), hands: { handL: "fist", handR: "fist" } },
  stickShoulder: { how: "A stick in one hand, the hand up at the front of the shoulder, the elbow bent and forward, the stick leaning back against the shoulder. The other arm hangs. (The referee's stick: never level across the body in two hands.)",
    pose: () => ({ ...STAND, armR: [[35, 15], [160, 10]], armL: REST }), hands: { handR: "grip", handL: "relaxed" } },
  stickDown: { how: "A stick in one hand at the side, the arm hanging with the elbow a little bent, the stick pointing down and a little forward.",
    pose: () => ({ ...STAND, armR: [[4, 12], [16, 12]], armL: REST }), hands: { handR: "grip", handL: "relaxed" } },
};

// ---- the gestures in a film ----
/** A gesture's upper body only (arms, hands, head, spine), for a figure that a film's Mover keeps on its feet: the Mover plants and walks
 *  the legs itself, and a pose's own standing legs blended into its walk broke the solve (gladiators v5) */
export const upper = (p: Partial<Pose>): Partial<Pose> => { const { legL: _l, legR: _r, px: _x, py: _y, pz: _z, ...rest } = p; void _l; void _r; void _x; void _y; void _z; return rest; };
/** Kneeling on the right knee in a film: a Mover takes the legs an act names as free legs (motion.ts blends them as joint angles), so the
 *  kneeling leg is the sheet's own free right leg (the shin back on the ground, the foot tipped 20) with the pelvis at -0.51, and the left
 *  foot stays planted where the Mover stands him (a planted-foot leg named in an act broke the solve, gladiators v5) */
/** (gladiators v5, the independent review: with the pelvis straight down over the planted foot, that foot lay behind his hips and its
 *  shin slanted back from a knee hanging in the air at the hem of his kilt. The pelvis goes back half a leg's length (pz), so the planted
 *  foot is ahead of him: its thigh about level, its shin upright under its knee, the foot flat; the right knee on the ground under the hips) */
export const KNEEL_PLANTED: Partial<Pose> = { py: -0.51, pz: -0.5, legR: { th: [-6, 4], sh: [-100, 0], pitch: 20 } as LegFK };
/** the beaten man's kneel with a hand on the ground (kneelhand): lower, the hips sat back toward the right heel (the kneeling thigh 40
 *  degrees forward to its knee on the ground), so that the body leaning over can put its hand flat on the sand beside the front foot. Upright
 *  on one knee the card's short arm stopped 21 cm above the sand (the independent review: "handen i marken") */
export const KNEEL_LOW: Partial<Pose> = { py: -0.63, pz: -0.62, legR: { th: [40, 4], sh: [-100, 0], pitch: 20 } as LegFK };
/** standing up again after a kneel, in a film: the right leg straight down under him, the pelvis back up and forward over the planted foot */
export const STAND_UP: Partial<Pose> = { py: 0, pz: 0, legR: { th: [0, 4], sh: [0, 2], pitch: 0 } as LegFK };
/** a kneeling gesture (kneel, kneelhand, getup) for a film: its upper body on the planted kneel */
export const kneeling = (name: "kneel" | "kneelhand" | "getup", aim: Aim = "side"): Partial<Pose> => ({ ...upper(GESTURES[name].pose(aim, 0)), ...(name === "kneelhand" ? KNEEL_LOW : KNEEL_PLANTED) });

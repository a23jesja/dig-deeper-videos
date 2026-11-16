// The script of the step C test clip, without any drawing: the motion, the camera and the sound cues come from the same source, so the
// picture (SirMotion.tsx) and the sound (scripts/cues.mjs -> audio/craft_sfx.py) can never drift apart.
// Sir Digsworth walks in from the side, stops, turns to us, points at the mountain, says his line with a gesture on each stressed
// word, flinches when it blows, runs, stumbles, falls, gets up and runs out of the picture. The baker flees through the same picture
// on the same motions.
import { Mover } from "./motion";
import words from "../../voice/kit-test/words.json";

export type W = { w: string; a: number; b: number };
export const WORDS = words as W[], SAY = WORDS[WORDS.length - 1].b + 0.25, TFPS = 30;
/** the clip starts this far into the script, so that he is already on his way into the picture in the first frame */
export const T_OFF = 1.15;
const FEAR = { wide: 1, lid: 0, brow: 1, mouth: 0.7, smile: -0.8 };
const script = () => {
  const m = new Mover([-3.6, 0], 90);
  m.walk(3.6).stand(0.2).turn(-90);
  // he points at the top of the mountain, where the smoke comes from, and looks the same way
  const POINT = { armL: [[4, 103], [4, 106]], roll: 3, px: 0.04, head: [24, -6, 0] } as const;
  m.act(POINT as never, 0.95, { handL: "point", face: { gaze: [0.9, -0.35], brow: 0.6 } });
  const sayAt = m.end, w = (i: number) => sayAt + WORDS[i].a;
  m.stand(SAY);
  // a gesture on each stressed word: "I SAY! That MOUNTAIN was NOT smoking YESTERDAY."
  m.actAt(w(0) - 0.08, { armR: [[24, 26], [150, 6]], lean: -3, head: [0, -6, 0] }, 0.6, { in: 0.14, out: 0.2, handR: "point", face: { brow: 0.8, wide: 0.4 } });
  m.actAt(w(2) - 0.05, POINT as never, 0.72, { in: 0.16, out: 0.22, handL: "point", face: { gaze: [0.9, -0.35], brow: 0.3 } });
  m.actAt(w(5) - 0.08, { armR: [[14, 48], [62, 58]], armL: [[10, 30], [40, 30]], px: -0.04, head: [-9, 3, 5] }, 0.42, { in: 0.12, out: 0.16, handR: "open", handL: "open", face: { brow: -0.6, lid: 0.1 } });
  m.actAt(w(7) - 0.06, { armL: [[12, 40], [74, 66]], armR: [[12, 40], [74, 66]], py: 0.012, head: [8, -3, -6] }, 0.7, { in: 0.16, out: 0.25, handL: "open", handR: "open", face: { brow: 1, wide: 0.5, gaze: [0.5, -0.1] } });
  const boom = m.end;
  m.step("R", -0.2, 0.16).act({ armL: [[16, 66], [34, 152]], armR: [[16, 66], [34, 152]], lean: -9, py: -0.07, head: [24, -10, 0] }, 0.8, { in: 0.13, over: 2.6, handL: "open", handR: "open", face: { ...FEAR, gaze: [0.9, -0.3] } });
  const flee = m.end;
  m.turn(-90); const run0 = m.end;
  m.run(2.8).stumble().fall(0.4);
  const fell = m.end;
  m.getup(); const up = m.end;
  m.run(6);
  // the fear stays on his face from the bang to the end; half-way through the first run he looks back at the mountain
  m.actAt(flee, {}, m.end - flee, { in: 0.1, face: FEAR });
  m.actAt(run0 + 0.35, { head: [70, -4, 0] }, 0.5, { in: 0.14, out: 0.18, face: { ...FEAR, gaze: [0.9, -0.2] } });
  // the baker: off to the right until the bang, then he runs through the picture the same way
  const b = new Mover([3.9, 0], -90);
  b.stand(boom + 0.75).run(19);
  b.actAt(boom, {}, 20, { face: FEAR });
  b.actAt(boom + 0.5, { armL: [[150, 20], [200, 10]], armR: [[150, 20], [200, 10]] }, 20, { in: 0.3, handL: "open", handR: "open" });
  return { m, b, sayAt, boom, flee, fell, up, end: up + 0.72 };
};
export const SIR_TEST = script();
export const SIR_TEST_FRAMES = Math.round((SIR_TEST.end - T_OFF) * TFPS);
const smooth = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
const CAM0 = SIR_TEST.m.sample(T_OFF).x + 0.8;
/** the camera, in leg lengths along the ground (script time): it lets him walk in, follows a little late, rests with him in the left
 *  third so that the mountain and its smoke stand free beside him, follows the flight, and stops so that he runs out of the picture */
export const sirTestCam = (t: number) => {
  const S = SIR_TEST, at = (q: number) => 0.5 * (S.m.sample(q - 0.35).x + S.m.sample(q - 0.1).x);
  const rest = 0.3 * smooth((t - S.sayAt + 1.6) / 0.9);
  if (t < S.flee) return Math.max(CAM0, at(t)) + rest;
  // in the flight the camera keeps up with him (no lag: he would outrun it) and leaves him room ahead
  const k = smooth((t - S.flee) / 0.7), held = S.m.sample(Math.min(t, S.up - 0.25) - 0.05).x - 0.24;
  return (Math.max(CAM0, at(S.flee)) + 0.3) * (1 - k) + held * k;
};
/** every sound of the clip on the frame it happens (clip frames) */
export const sirTestCues = () => {
  const S = SIR_TEST, f = (t: number) => Math.round((t - T_OFF) * TFPS), pan = (t: number, x: number) => Math.max(-0.9, Math.min(0.9, (x - sirTestCam(t)) / 1.1));
  // k = the figure's leg length over Sir Digsworth's (positions are in each figure's own leg lengths)
  const steps = (mv: Mover, g: number, k = 1) => mv.cues().filter((c) => c.t > T_OFF && c.t < S.end && Math.abs(c.x * k - sirTestCam(c.t)) < 1.6).map((c) => ({ f: f(c.t), k: c.k, p: pan(c.t, c.x * k), g, ...(c.run ? { run: true } : {}), ...(c.big ? { big: c.big } : {}) }));
  return {
    fps: TFPS, frames: SIR_TEST_FRAMES, voice: { file: "voice/kit-test/voice.wav", frame: f(S.sayAt) },
    cues: [...steps(S.m, 1), ...steps(S.b, 0.7, 0.824), { f: f(S.boom), k: "blast", p: 0.5, g: 0.9 }, { f: f(S.boom) + 3, k: "crack", p: 0.5, g: 0.8 }],
    beds: [{ k: "wind", f0: 0, f1: SIR_TEST_FRAMES, g: 0.8 }, { k: "rumble", f0: Math.max(0, f(S.sayAt) - 20), f1: f(S.boom) + 6, g: 0.5 }, { k: "rumble", f0: f(S.boom), f1: SIR_TEST_FRAMES, g: 1 }],
  };
};

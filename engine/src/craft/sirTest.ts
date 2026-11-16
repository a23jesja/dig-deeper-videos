// The script of the step C test clip, without any drawing: the motion, the camera and the sound cues come from the same source, so the
// picture (SirMotion.tsx) and the sound (scripts/cues.mjs -> audio/craft_sfx.py) can never drift apart.
import { Mover } from "./motion";
import words from "../../voice/kit-test/words.json";

export type W = { w: string; a: number; b: number };
export const WORDS = words as W[], SAY = WORDS[WORDS.length - 1].b + 0.25, TFPS = 30;
const script = () => {
  const m = new Mover([-3.5, 0], 90);
  m.stand(0.2).walk(3.5).stand(0.2).turn(-90);
  m.act({ armL: [[6, 80], [6, 85]], roll: 3, head: [22, -5, 0] }, 1.0, { handL: "point", face: { gaze: [0.9, -0.2], brow: 0.5 } });
  const sayAt = m.end;
  m.act({ armR: [[18, 16], [98, -8]], armL: [[4, 26], [30, 40]], head: [10, -2, 0] }, SAY, { in: 0.3, handR: "open", face: { gaze: [0.5, -0.1] } });
  const boom = m.end;
  m.step("R", -0.2, 0.16).act({ armL: [[16, 66], [34, 152]], armR: [[16, 66], [34, 152]], lean: -9, py: -0.07, head: [24, -10, 0] }, 0.85, { in: 0.13, over: 2.6, handL: "open", handR: "open", face: { wide: 1, lid: 0, brow: 1, mouth: 0.8, smile: -0.8, gaze: [0.9, -0.2] } });
  const flee = m.end;
  m.turn(-90).run(3.6).stumble().stand(0.9);
  return { m, sayAt, boom, flee };
};
export const SIR_TEST = script();
export const SIR_TEST_FRAMES = Math.ceil(SIR_TEST.m.end * TFPS);
/** the camera follows him a little late (in leg lengths along the ground) */
export const sirTestCam = (t: number) => {
  const S = SIR_TEST, follow = 0.5 * (S.m.sample(t - 0.35).x + S.m.sample(t - 0.1).x);
  return t < S.flee ? Math.max(-1.5, follow) : follow - 0.55 * Math.min(1, (t - S.flee) / 0.8);
};
/** every sound of the clip on the frame it happens */
export const sirTestCues = () => {
  const S = SIR_TEST, f = (t: number) => Math.round(t * TFPS), pan = (t: number, x: number) => Math.max(-0.9, Math.min(0.9, (x - sirTestCam(t)) / 1.1));
  return {
    fps: TFPS, frames: SIR_TEST_FRAMES, voice: { file: "voice/kit-test/voice.wav", frame: f(S.sayAt) },
    cues: [...S.m.cues().map((c) => ({ f: f(c.t), k: c.k, p: pan(c.t, c.x), ...(c.run ? { run: true } : {}), ...(c.big ? { big: c.big } : {}) })), { f: f(S.boom), k: "blast", p: 0.5, g: 0.9 }, { f: f(S.boom) + 3, k: "crack", p: 0.5, g: 0.8 }],
    beds: [{ k: "wind", f0: 0, f1: SIR_TEST_FRAMES, g: 0.8 }, { k: "rumble", f0: f(S.sayAt) - 20, f1: f(S.boom) + 6, g: 0.5 }, { k: "rumble", f0: f(S.boom), f1: SIR_TEST_FRAMES, g: 1 }],
  };
};

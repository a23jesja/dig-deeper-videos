// Step C test stage: the motion library (motion.ts) played by any design on the skeleton, on a bare floor.
// The script is the test clip Jesper asked for: walks in from the side, turns, points, says a line, flinches, runs out and stumbles.
//   props: { design: 0..5 (which direction of step A draws it), marks: true (show the planned footprints) }
// PROPS='{"audio":false,"design":0,"marks":true}' node scripts/stills.mjs MotionTest out/craft/mo_ 0-440:20 0.33 jpeg
import React from "react";
import { AbsoluteFill, Audio, Sequence, getInputProps, staticFile, useCurrentFrame } from "remotion";
import { Ink } from "./ink";
import { solve } from "./rig";
import { Mover, blink, mouthAt } from "./motion";
import { DIRECTIONS } from "./designs";
import words from "../../voice/kit-test/words.json";

export const MW = 1920, MH = 1080, MFPS = 30;
const BG = "#e9dcc0", FLOOR = "#cdb98f";
type W = { w: string; a: number; b: number };
const WORDS = words as W[], SAY = WORDS[WORDS.length - 1].b + 0.3;

/** the test script; returns the mover and when the line starts */
const script = () => {
  const m = new Mover([-4.4, 0], 90);
  m.stand(0.25).walk(3.3).stand(0.15).turn(-90);
  m.act({ armL: [[8, 80], [8, 84]], roll: 3, head: [26, -4, 0] }, 1.1, { handL: "point" });
  const sayAt = m.end;
  m.act("talk", SAY, { in: 0.3 });
  m.step("R", -0.22).act("recoil", 0.95, { in: 0.16, over: 2.4 });
  m.turn(90).run(3.2).stumble().stand(0.6);
  return { m, sayAt };
};
const S = script();
export const MOTION_FRAMES = Math.ceil(S.m.end * MFPS);

export const MotionTest: React.FC = () => {
  const fr = useCurrentFrame(), p = getInputProps() as { design?: number; marks?: boolean; audio?: boolean };
  const D = DIRECTIONS[p.design ?? 0].D, P = D.props("sir"), LL = P.thigh + P.shin, sc = 560 / (LL + P.ankle + P.spine + P.neck + P.head * 1.2), FY = 900, CX = MW / 2;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <canvas width={MW} height={MH} ref={(cv) => {
        if (!cv) return;
        const g = cv.getContext("2d")!, t = fr / MFPS, s = S.m.sample(t);
        g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = BG; g.fillRect(0, 0, MW, MH); g.fillStyle = FLOOR; g.fillRect(0, FY, MW, MH - FY);
        const X = (x: number) => CX + x * LL * sc;
        if (p.marks) for (const side of ["L", "R"] as const) { const f = s.feet[side]; g.fillStyle = f[2] ? "#c0353a" : "#3b6fb5"; g.fillRect(X(f[0]) - 3, FY + 14 + (side === "L" ? 0 : 14), 6, 12); }
        const sk = solve(P, s.pose, s.yaw), talking = t >= S.sayAt && t < S.sayAt + SAY;
        g.fillStyle = "rgba(60,40,20,0.22)"; g.beginPath(); g.ellipse(X(s.x), FY + 6, P.shW * 1.6 * sc, 12, 0, 0, 7); g.fill();
        g.save(); g.translate(X(s.x), FY); g.scale(sc, sc);
        D.draw(new Ink(g, D.ol), sk, { who: "sir", handL: s.handL, handR: s.handR, capLift: Math.min(0.5, Math.max(0, Math.abs(s.drag) - 1.4) * 0.22),
          face: { ...s.face, lid: Math.max(s.face.lid ?? 0.18, blink(t, 3)), mouth: Math.max(s.face.mouth ?? 0, talking ? mouthAt(WORDS, t - S.sayAt) : 0) } });
        g.restore();
        if (p.marks) { g.fillStyle = "#3b2a1a"; g.font = "700 30px Arial"; g.fillText(`${t.toFixed(2)} s`, 30, 50); }
      }} />
      {p.audio !== false && <Sequence from={Math.round(S.sayAt * MFPS)}><Audio src={staticFile("craft/kit-test.wav")} /></Sequence>}
    </AbsoluteFill>
  );
};

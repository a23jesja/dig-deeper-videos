// The striped sleeve before and after the stripe fix (the reviewer, 27 Nov: rule 17, the stripes of the upper arm and the forearm crossing at
// the elbow): the captain, the sailor and the boy at three-quarter, the near arm straight and bent 45, 90 and 130 degrees at the elbow.
//   PROPS='{}' node scripts/stills.mjs SleeveSheet out/sleeve/before_ 0-0 1 png
import React, { useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame, delayRender, continueRender } from "remotion";
import { Ink } from "../ink";
import { solve, POSES, type Pose } from "../rig";
import { KIT_DESIGN } from "./kit";
import { CAPTAIN_LOOK, SAILOR_LOOK, BOY_LOOK, KIT_HEIGHTS } from "./cast";

export const SSW = 2400, SSH = 1500;
const BG = "#efe6d2", TXT = "#2b1d12";
const PEOPLE = [{ name: "KAPTENEN", look: CAPTAIN_LOOK, h: KIT_HEIGHTS.captain }, { name: "SJÖMANNEN", look: SAILOR_LOOK, h: KIT_HEIGHTS.sailor }, { name: "POJKEN", look: BOY_LOOK, h: KIT_HEIGHTS.boy }];
export const BENDS = [0, 45, 90, 130];
export const SleeveSheet: React.FC = () => {
  const f = useCurrentFrame(), ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const hd = delayRender(); const g = ref.current!.getContext("2d")!; g.fillStyle = BG; g.fillRect(0, 0, SSW, SSH);
    const text = (t: string, x: number, y: number, px: number) => { g.setTransform(1, 0, 0, 1, 0, 0); g.font = `700 ${px}px Arial`; g.textAlign = "center"; g.fillStyle = TXT; g.fillText(t, x, y); };
    const yaw = 38, s0 = solve(KIT_DESIGN.props("sir"), POSES.stand, yaw), near = s0.near;
    PEOPLE.forEach((p, r) => BENDS.forEach((b, c) => { const x = 330 + c * 580, y = 470 + r * 480, up = -35;
      const pose: Pose = { ...POSES.stand, head: [Math.sign(yaw) * 45 - yaw, 0, 0], [`arm${near}`]: [[up, 8], [up + b, 4]] } as Pose;
      const sk = solve(KIT_DESIGN.props("sir"), pose, yaw), s = 0.62 * (p.h / 1.75);
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(x, y); g.scale(s, s); KIT_DESIGN.draw(new Ink(g, KIT_DESIGN.ol), sk, { who: "sir", look: p.look, face: { pupil: 1, smile: 0.3, gaze: [0.3, 0] } }); g.restore();
      if ((globalThis as unknown as { DEBUG_SLEEVE?: boolean }).DEBUG_SLEEVE !== undefined || f === 1) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(x, y); g.scale(s, s);
        const J = (n: string) => sk.j[(n + near) as keyof typeof sk.j] as unknown as number[], S = J("sh"), E = J("el"), W = J("wr"), un = (v: number[]) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
        const uS = un([S[0] - E[0], S[1] - E[1]]), uW = un([W[0] - E[0], W[1] - E[1]]), nb = un([uS[0] - uW[0], uS[1] - uW[1]]), t = [-nb[1], nb[0]];
        g.lineWidth = 2; g.strokeStyle = "#ff00ff"; g.beginPath(); g.moveTo(E[0] - t[0] * 120, E[1] - t[1] * 120); g.lineTo(E[0] + t[0] * 120, E[1] + t[1] * 120); g.stroke();
        const dB = uW, nB = [-dB[1], dB[0]]; g.strokeStyle = "#00c000"; for (const u of [-38, -14, 10]) { const c = [E[0] + dB[0] * u, E[1] + dB[1] * u]; g.beginPath(); g.moveTo(c[0] - nB[0] * 60, c[1] - nB[1] * 60); g.lineTo(c[0] + nB[0] * 60, c[1] + nB[1] * 60); g.stroke(); }
        g.fillStyle = "#ff0000"; for (const q of [S, E, W]) { g.beginPath(); g.arc(q[0], q[1], 5, 0, 7); g.fill(); } g.restore(); }
      if (r === 0) text(`armbåge ${b}°`, x, 60, 34); if (c === 0) text(p.name, 110, y - 200, 26); }));
    continueRender(hd); }, [f]);
  return <AbsoluteFill><canvas ref={ref} width={SSW} height={SSH} /></AbsoluteFill>;
};

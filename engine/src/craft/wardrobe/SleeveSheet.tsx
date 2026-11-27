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
      if (r === 0) text(`armbåge ${b}°`, x, 60, 34); if (c === 0) text(p.name, 110, y - 200, 26); }));
    continueRender(hd); }, [f]);
  return <AbsoluteFill><canvas ref={ref} width={SSW} height={SSH} /></AbsoluteFill>;
};

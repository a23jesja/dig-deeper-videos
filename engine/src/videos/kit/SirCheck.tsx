// Check pictures for Sir Digsworth's cut-out puppet.
// Frame 0: the sheet's front view (left) next to the puppet in the same pose (right). Frame 1: the same for the side view.
// Frame 2: five poses. Frame 3: every hand shape at double size on the arm.
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Sir, SirHand, SirPose, SirSide, SirSidePose, SIDE_CX, SIDE_GROUND, SIDE_H, SIDE_W, SIR_CX, SIR_GROUND, SIR_H, SIR_W } from "./sir";
import data from "./sirf.json";
import side from "./sirs.json";

const PRE = Object.keys(data.pieces).map((n) => `kit/sirf/${n}.png`).concat(Object.keys(side.pieces).map((n) => `kit/sirs/${n}.png`), ["open", "pointing", "fist", "waving", "thumb"].map((n) => `kit/sir/hand_${n}.png`), ["kit/sir/view_front.png", "kit/sir/view_side.png"]);
export const POSES: Record<string, Partial<SirPose>> = {
  standing: {},
  pointing: { shoR: 62, elbR: 22, handR: "pointing", head: -3 },
  armsUp: { shoR: 142, elbR: 16, handR: "open", shoL: -128, elbL: -18, wriL: -30, head: -2 },
  cap: { shoR: 128, elbR: 68, wriR: 10, handR: "fist", cap: { dx: -34, dy: -58, rot: -16 }, head: 3 },
};
export const STEP: Partial<SirSidePose> = { hipN: -14, kneeN: 14, hipF: 20, kneeF: 0, shoN: 14, elbN: -12, shoF: -4, bob: -4, lean: 1.5 };
const label = (x: number, t: string) => <text x={x} y={1040} textAnchor="middle" fontFamily="Arial" fontSize={30} fill="#3a2f22">{t}</text>;
export const SirCheck: React.FC = () => {
  const f = useCurrentFrame(), gy = 960, s = 1.05;
  return (
    <AbsoluteFill style={{ background: "#f6efdc" }}>
      <div style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0 }}>{PRE.map((n) => <Img key={n} src={staticFile(n)} />)}</div>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        {f === 0 && <>
          <image href={staticFile("kit/sir/view_front.png")} x={560 - SIR_CX * s} y={gy - SIR_GROUND * s} width={SIR_W * s} height={SIR_H * s} />
          <Sir p={{ x: 1360, y: gy, s }} />{label(560, "Huvudbladet")}{label(1360, "Dockan")}
        </>}
        {f === 1 && <>
          <image href={staticFile("kit/sir/view_side.png")} x={560 - SIDE_CX * s} y={gy - SIDE_GROUND * s} width={SIDE_W * s} height={SIDE_H * s} />
          <SirSide p={{ x: 1360, y: gy, s }} />{label(600, "Huvudbladet")}{label(1400, "Dockan")}
        </>}
        {f === 2 && <>
          <Sir p={{ x: 200, y: 930, s: 0.86, ...POSES.standing }} /><SirSide p={{ x: 560, y: 930, s: 0.86, ...STEP }} />
          <Sir p={{ x: 1010, y: 930, s: 0.86, ...POSES.pointing }} /><Sir p={{ x: 1380, y: 930, s: 0.86, ...POSES.armsUp }} /><Sir p={{ x: 1740, y: 930, s: 0.86, ...POSES.cap }} />
          {label(200, "står")}{label(580, "mitt i ett steg")}{label(1010, "pekar")}{label(1380, "båda armarna upp")}{label(1740, "lyfter på kepsen")}
        </>}
        {f === 3 && (["rest", "open", "pointing", "fist", "waving", "thumb"] as SirHand[]).map((h, i) => {
          // head and raised arm at twice the size of the pose picture (0.86 -> 1.72)
          const col = i % 3, row = (i / 3) | 0, x0 = col * 640, y0 = row * 540;
          return <g key={h}><clipPath id={`c${i}`}><rect x={x0 + 8} y={y0 + 8} width={624} height={524} /></clipPath>
            <g clipPath={`url(#c${i})`}><rect x={x0 + 8} y={y0 + 8} width={624} height={524} fill="#ead9b8" />
              <Sir p={{ x: x0 + 387, y: y0 + 1357, s: 1.72, shoR: 128, elbR: 40, handR: h }} /></g></g>;
        })}
      </svg>
    </AbsoluteFill>
  );
};

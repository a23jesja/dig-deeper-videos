// Check pictures for the figure kit: frame 0 = wardrobe on the plain figure, frame 1 = heads, mouths and hands.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { HandShape, HATS, KitPreload, Look, Pose, Puppet } from "./puppet";

const G = ["uniform", "sailor", "suit", "trench", "armour", "tunic", "dress", "smock", "chef", "greatcoat", "striped", "sweater"];
const TINT = ["#7d8f5a", "#5f86c4", "#6c6f7c", "#c9b083", "#b9c1cf", "#b98a3e", "#d46a7e", "#f3efe2", "#f6f2e6", "#4d6aa0", "#f6f2e6", "#b0473a"];
const H = Object.keys(HATS);
export const KitTest: React.FC = () => {
  const f = useCurrentFrame();
  const fig = (l: Look, p: Partial<Pose>, i: number, n: number, row: number, k = 190) => <Puppet key={`${row}-${i}`} l={l} p={{ x: 110 + (i * 1700) / (n - 1), y: 500 + row * 520, k, ...p }} />;
  return (
    <AbsoluteFill style={{ background: "#d9c9a8" }}>
      <KitPreload />
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        {f === 0 && <>
          {G.map((g, i) => fig({ kind: "base", garment: g, tint: TINT[i], hat: H[i], hatTint: i % 2 ? TINT[i] : undefined, tash: i % 3 === 0 ? ["tash_handlebar", "tash_thin", "tash_walrus", "beard_goatee"][(i / 3) | 0] : undefined }, { handR: [0.42, 1.25 + 0.03 * i], shapeR: "open", head: i % 2 ? "face_smile" : "face_neutral" }, i, 12, 0))}
          {(["rest", "open", "pointing", "fist", "waving", "thumb"] as HandShape[]).map((s, i) => fig({ kind: "sir" }, { shapeL: s, shapeR: s, handL: [-0.5, 1.0 + 0.12 * i], handR: [0.55, 0.8 + 0.2 * i], head: ["talk_closed", "talk_slight", "talk_open", "talk_wide", "talk_oo", "talk_smile"][i] }, i, 12, 1))}
          {["expr_neutral", "expr_wink", "expr_surprised", "expr_suspicious", "expr_angry", "expr_laugh"].map((h, i) => fig({ kind: "sir" }, { head: h, lean: (i - 2.5) * 4, handL: [-0.3, 0.75], shapeR: "pointing", handR: [0.6, 1.3] }, i + 6, 12, 1))}
        </>}
        {f === 2 && <>
          {(["rest", "open", "pointing", "fist", "waving", "thumb"] as HandShape[]).flatMap((sh, i) => [
            <Puppet key={`a${i}`} l={i % 2 ? { kind: "sir" } : { kind: "base", garment: "greatcoat", tint: "#4f6ea8" }} p={{ x: 170 + i * 320, y: 520, k: 235, shapeL: sh, shapeR: sh, handL: [-0.42, 0.77], handR: [0.62, 1.38] }} />,
            <Puppet key={`b${i}`} l={i % 2 ? { kind: "base" } : { kind: "sir" }} p={{ x: 170 + i * 320, y: 1050, k: 235, shapeL: sh, shapeR: sh, handL: [-0.6, 1.75], handR: [0.3, 1.1] }} />,
          ])}
        </>}
        {f === 1 && <>
          {["face_neutral", "face_smile", "face_laugh", "face_sad", "face_angry", "face_shock", "face_worried", "face_suspicious", "face_smug", "face_tired", "face_dizzy", "face_cry"].map((h, i) => fig({ kind: "base" }, { head: h, handL: [-0.4, 0.8 + 0.1 * i], handR: [0.3 + 0.03 * i, 1.6], shapeR: "fist", footL: [-0.2, 0.02 * i] }, i, 12, 0))}
          {["talk_closed", "talk_slight", "talk_open", "talk_wide", "talk_oo", "talk_smile", "head_side", "head_front"].map((h, i) => fig({ kind: "base", garment: G[i], tint: TINT[i], beard: i === 3 ? "beard_full" : undefined, hair: i === 4 ? "hair_short" : i === 5 ? "hair_bun" : undefined }, { head: h, headFlip: i === 6, kneeDir: i > 5 ? 1 : undefined, footL: i > 5 ? [-0.25, 0] : undefined, footR: i > 5 ? [0.25, 0.1] : undefined }, i, 12, 1))}
        </>}
      </svg>
    </AbsoluteFill>
  );
};

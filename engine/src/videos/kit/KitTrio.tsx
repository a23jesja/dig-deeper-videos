// The one check picture before a film is built: Sir Digsworth, a guard and a thief in Paris, 1911.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { KitPreload, Look, PARTS, Pose, Puppet } from "./puppet";

export const SIR: Look = { kind: "sir" };
export const GUARD: Look = { kind: "base", garment: "greatcoat", tint: "#4f6ea8", hat: "officer", hatTint: "#4f6ea8", tash: "tash_walrus" };
export const THIEF: Look = { kind: "base", garment: "smock", tint: "#f4efe1", hat: "flatcap", hatTint: "#8a7660", tash: "tash_thin" };
/** Sir Digsworth's cane, from a hand on the handle down to the ground */
export const Cane: React.FC<{ hx: number; hy: number; gy: number; lean?: number }> = ({ hx, hy, gy, lean = 4 }) => {
  const im = PARTS["sir/cane"], h = gy - hy + 30, w = (h * im.w) / im.h;
  return <g transform={`translate(${hx} ${gy}) rotate(${lean})`}><image href={staticFile("kit/sir/cane.png")} x={-w * 0.3} y={-h} width={w} height={h} /></g>;
};
export const KitTrio: React.FC = () => {
  const k = 400, gy = 1480;
  const sir: Pose = { x: 190, y: gy, k, head: "talk_open", handL: [-0.38, 0.8], shapeL: "fist", angL: 60, handR: [0.4, 0.78], headTilt: -3 };
  const guard: Pose = { x: 545, y: gy, k, head: "face_suspicious", handR: [0.34, 0.8], handL: [-0.34, 0.8] };
  const thief: Pose = { x: 890, y: gy, k, head: "face_smug", handL: [-0.18, 0.95], handR: [0.2, 0.9], shapeL: "fist", shapeR: "fist", lean: -4, headTilt: -5, footL: [-0.16, 0], footR: [0.1, 0] };
  return (
    <AbsoluteFill style={{ background: "#2a1a16" }}>
      <KitPreload />
      <Img src={staticFile("kit/bg/paris.jpg")} style={{ position: "absolute", width: 1248 * 0.9, height: 2208 * 0.9, left: -22, top: -68 }} />
      <AbsoluteFill style={{ background: "linear-gradient(100deg, rgba(255,214,140,0.28) 0%, rgba(255,214,140,0) 45%, rgba(40,30,60,0.22) 100%)" }} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
        <Cane hx={sir.x - 0.4 * k} hy={gy - 0.8 * k} gy={gy} />
        <Puppet p={sir} l={SIR} />
        <Puppet p={guard} l={GUARD} />
        <Puppet p={thief} l={THIEF} />
      </svg>
    </AbsoluteFill>
  );
};

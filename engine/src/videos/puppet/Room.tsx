// A simple painted room, drawn in code: wall, wainscot, floorboards, a warm window glow and an empty picture frame.
import React from "react";
import { AbsoluteFill } from "remotion";
export const FLOOR_Y = 930;
export const Room: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(#e9dcc0 0%, #dccba8 62%)" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: 760, background: "radial-gradient(900px 620px at 72% 38%, rgba(255,244,214,0.75), rgba(255,244,214,0) 70%)" }} />
    <div style={{ position: "absolute", left: 1400, top: 150, width: 340, height: 270, background: "#cdb98f", border: "16px solid #7a5a3a", boxShadow: "0 10px 0 rgba(60,40,20,0.18), inset 0 0 0 6px #a88a5c" }} />
    <div style={{ position: "absolute", left: 0, top: 640, width: "100%", height: 150, background: "linear-gradient(#b89a70, #a3855c)", borderTop: "10px solid #8a6c48", borderBottom: "12px solid #6f553a" }} />
    <div style={{ position: "absolute", left: 0, top: 802, width: "100%", height: 278, background: "repeating-linear-gradient(90deg, #9a7650 0 236px, #7b5a3a 236px 240px)" }} />
    <div style={{ position: "absolute", left: 0, top: 802, width: "100%", height: 278, background: "linear-gradient(rgba(40,25,10,0.0), rgba(40,25,10,0.35))" }} />
    <AbsoluteFill style={{ background: "radial-gradient(1500px 900px at 50% 45%, rgba(0,0,0,0) 60%, rgba(40,25,10,0.28))" }} />
  </AbsoluteFill>
);
export const Shadow: React.FC<{ x: number; w?: number }> = ({ x, w = 300 }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: FLOOR_Y - 22, width: w, height: 44, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(40,25,10,0.45), rgba(40,25,10,0))" }} />
);

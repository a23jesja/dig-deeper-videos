// The painted Salon Carre wall (public/threeway/gallery.png, painted by the local image model) with everything
// that must be exact drawn on top in code: the gold rail, sunlight from the doorway, the paler patch where the
// picture hung, four iron hooks, the brass plate. Children (the guard) are drawn inside the same camera.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { SPOT, FLOOR_Y, W, H, camera } from "./scene";

const Hook: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg style={{ position: "absolute", left: x - 14, top: y - 14 }} width={28} height={40} viewBox="0 0 28 40">
    <ellipse cx={15} cy={30} rx={9} ry={4} fill="rgba(40,10,12,0.35)" />
    <rect x={7} y={2} width={14} height={12} rx={2} fill="#3b3d44" stroke="#17141a" strokeWidth={2.5} />
    <path d="M14 12 V26 Q14 33 21 30" fill="none" stroke="#17141a" strokeWidth={7} strokeLinecap="round" />
    <path d="M14 12 V26 Q14 33 21 30" fill="none" stroke="#8d9199" strokeWidth={3} strokeLinecap="round" />
    <circle cx={14} cy={8} r={2} fill="#c9ccd2" />
  </svg>
);

export const Gallery: React.FC<{ f: number; children?: React.ReactNode }> = ({ f, children }) => {
  const c = camera(f), x0 = SPOT.x - SPOT.w / 2, y0 = SPOT.y - SPOT.h / 2;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: `${c.cx}px ${c.cy}px`, transform: `scale(${c.zoom})` }}>
        <Img src={staticFile("threeway/gallery.png")} style={{ position: "absolute", left: 0, top: 0, width: W, height: H }} />
        {/* gold rail on the dado */}
        <div style={{ position: "absolute", left: 330, top: 553, width: W - 330, height: 15, background: "linear-gradient(#f0d58a, #c79a3a 55%, #8a6420)", borderTop: "3px solid #3a2414", borderBottom: "3px solid #3a2414" }} />
        {/* the open doorway: a sunlit room behind, and its light across the floor and up the wall */}
        <div style={{ position: "absolute", left: 44, top: 70, width: 236, height: 700, background: "linear-gradient(#fff6d8, #ffe9b0 70%, #f3d596)", boxShadow: "0 0 60px 30px rgba(255,236,170,0.55), inset 0 0 0 5px #b9a27a" }} />
        <div style={{ position: "absolute", left: 0, top: 770, width: 1100, height: 310, background: "linear-gradient(105deg, rgba(255,232,160,0.7) 0%, rgba(255,232,160,0.42) 38%, rgba(255,232,160,0) 62%)", clipPath: "polygon(2% 0, 27% 0, 100% 100%, 0 100%)", filter: "blur(10px)" }} />
        <div style={{ position: "absolute", left: 330, top: 0, width: 520, height: 560, background: "linear-gradient(115deg, rgba(255,220,150,0.30), rgba(255,220,150,0) 60%)" }} />
        {/* where the picture hung: a slightly paler, cleaner rectangle of wall */}
        <div style={{ position: "absolute", left: x0, top: y0, width: SPOT.w, height: SPOT.h, background: "rgba(255,170,150,0.16)", boxShadow: "inset 0 0 0 2px rgba(60,10,14,0.28)" }} />
        {[[0.2, 0.14], [0.8, 0.14], [0.2, 0.82], [0.8, 0.82]].map(([u, v], i) => <Hook key={i} x={x0 + SPOT.w * u} y={y0 + SPOT.h * v} />)}
        {/* brass plate */}
        <div style={{ position: "absolute", left: SPOT.x - 150, top: y0 + SPOT.h + 22, width: 300, height: 58, background: "linear-gradient(#f3dc8c, #c9a03c 60%, #a37c26)", border: "3px solid #3a2414", borderRadius: 4, boxShadow: "0 4px 0 rgba(40,10,12,0.35)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, color: "#2a1a0c", lineHeight: 1.1 }}>
          <div style={{ fontSize: 21, letterSpacing: 1.5 }}>LEONARDO DA VINCI</div>
          <div style={{ fontSize: 19, letterSpacing: 3 }}>LA JOCONDE</div>
        </div>
        {children}
        {/* soft vignette */}
        <AbsoluteFill style={{ background: "radial-gradient(1500px 900px at 45% 45%, rgba(0,0,0,0) 62%, rgba(30,10,8,0.3))" }} />
      </div>
    </AbsoluteFill>
  );
};
/** contact shadow: a dark core under the feet and a longer, softer cast shadow falling away from the doorway (to the right) */
export const ContactShadow: React.FC<{ x: number; spread?: number }> = ({ x, spread = 1 }) => (
  <>
    <div style={{ position: "absolute", left: x - 40, top: FLOOR_Y - 16, width: 330 * spread, height: 46, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(50,24,10,0.34), rgba(50,24,10,0))", transform: "skewX(-38deg)", filter: "blur(5px)" }} />
    <div style={{ position: "absolute", left: x - 70 * spread, top: FLOOR_Y - 12, width: 140 * spread, height: 24, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(40,18,8,0.6), rgba(40,18,8,0))" }} />
  </>
);

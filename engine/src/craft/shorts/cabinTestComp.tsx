// The painted-cabin test as a composition (cabinTest.ts): the three painted layers are loaded before the first frame is drawn, then
// the painted version plays for five seconds and the 3D version for five, each with a small label saying which it is.
import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, Sequence, continueRender, delayRender, staticFile } from "remotion";
import { Stage } from "../stage/Stage";
import { cabinPainted, cabin3d } from "./cabinTest";
import type { Layers } from "../world/painted";

export const CABIN_TEST_FRAMES = 300;
const load = (src: string) => new Promise<HTMLImageElement>((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error(`could not load ${src}`)); i.src = src; });
const Label: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", left: 28, top: 28, padding: "8px 16px", background: "rgba(10,12,20,0.72)", color: "#ffffff", font: "700 34px Arial, sans-serif", borderRadius: 10 }}>{text}</div>);

export const CabinTest: React.FC = () => {
  const [handle] = useState(() => delayRender("the painted layers"));
  const [L, setL] = useState<Layers | null>(null);
  const [sea, setSea] = useState<HTMLImageElement | null>(null);
  useEffect(() => { Promise.all(["far", "mid", "near", "night-sea"].map((k) => load(staticFile(`craft/cabin-test/${k}.png`)))).then(([far, mid, near, s]) => { setL({ far, mid, near }); setSea(s); continueRender(handle); }); }, [handle]);
  const painted = useMemo(() => (L ? cabinPainted(L) : null), [L]), solid = useMemo(() => (sea ? cabin3d(sea) : null), [sea]);
  if (!painted || !solid) return null;
  return (
    <AbsoluteFill style={{ background: "#0b1530" }}>
      <Sequence durationInFrames={150}><Stage film={painted} /><Label text="MÅLAD: SDXL + TRE DJUPLAGER" /></Sequence>
      <Sequence from={150} durationInFrames={150}><Stage film={solid} /><Label text="NY 3D-KAJUTA" /></Sequence>
    </AbsoluteFill>);
};

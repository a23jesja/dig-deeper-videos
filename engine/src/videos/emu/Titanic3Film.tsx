// "I Survived the Titanic: Part 3" (Short, 1080 x 1920): the 3D deck world with the engine's drawn cast, hook text, one-word captions, sound.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { Film, FilmView } from "./Emu";
import { loadModels } from "./env/models";
import { SHOW_T3, TOTAL_T3, HOOK, HOOK_END, WORDS_T3, layersT3, dofAtT3 } from "./titanic3";

const FILM: Film = { W: 1080, H: 1920, total: TOTAL_T3, flashAt: -100, show: SHOW_T3, layersAt: layersT3, dofAt: dofAtT3, words: WORDS_T3.filter((w) => w.a * 30 >= HOOK_END + 1), audio: "titanic/mix-3.wav", cap: { top: "67.5%", size: 92, stroke: 14 } };
export const TITANIC3_FRAMES = TOTAL_T3;
export const Titanic3: React.FC = () => {
  const f = useCurrentFrame();
  const [ok, setOk] = useState(false);
  const [h] = useState(() => delayRender("models"));
  useEffect(() => { loadModels((p) => staticFile(p)).then(() => { setOk(true); continueRender(h); }); }, [h]);
  if (!ok) return null;
  const pop = f === 0 ? 1 : f === 1 ? 1.08 : 1;
  return (
    <AbsoluteFill>
      <FilmView film={FILM} />
      {f < HOOK_END && <div style={{ position: "absolute", left: HOOK.x, width: HOOK.w, top: HOOK.y, height: HOOK.h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Arial Black', Impact, sans-serif", fontSize: HOOK.size, lineHeight: 1.06, color: "#ffe14d",
        WebkitTextStroke: "16px #101014", paintOrder: "stroke fill", textShadow: "0 7px 0 rgba(16,16,20,0.9)", whiteSpace: "nowrap", scale: String(pop), letterSpacing: -2 } as React.CSSProperties}>{HOOK.lines.map((l) => <div key={l}>{l}</div>)}</div>}
    </AbsoluteFill>
  );
};

// Test composition for the locked look (DAILY-RULES "The look: the emu Short"): the engine's own code-drawn cast
// (toon.ts) as cards on the Titanic's boat deck at night (titanic3Test.ts), the set built from the environment kit.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { Film, FilmView } from "./Emu";
import { loadModels } from "./env/models";
import { DECK_SHOW, DECK_TOTAL, HOOK, HOOK_END, layersDeck, dofAtDeck } from "./titanic3Scenes";

const FILM: Film = { W: 1080, H: 1920, total: DECK_TOTAL, flashAt: -100, show: DECK_SHOW, layersAt: layersDeck, dofAt: dofAtDeck, words: [], audio: "env/deck-mix-2.wav", cap: { top: "67.5%", size: 92, stroke: 14 } };
export const TITANIC3_TEST_FRAMES = DECK_TOTAL;
export const Titanic3Test: React.FC = () => {
  const f = useCurrentFrame();
  const [ok, setOk] = useState(false);
  const [h] = useState(() => delayRender("models"));
  useEffect(() => { loadModels((p) => staticFile(p)).then(() => { setOk(true); continueRender(h); }); }, [h]);
  if (!ok) return null;
  const pop = f === 0 ? 1 : f === 1 ? 1.08 : 1;
  return (
    <AbsoluteFill>
      <FilmView film={FILM} />
      {f < HOOK_END && <div style={{ position: "absolute", left: HOOK.x, width: HOOK.w, top: HOOK.y, height: HOOK.h, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Arial Black', Impact, sans-serif", fontSize: HOOK.size, color: "#ffe14d",
        WebkitTextStroke: "18px #101014", paintOrder: "stroke fill", textShadow: "0 7px 0 rgba(16,16,20,0.9)", whiteSpace: "nowrap", scale: String(pop), letterSpacing: -2 } as React.CSSProperties}>{HOOK.text}</div>}
    </AbsoluteFill>
  );
};

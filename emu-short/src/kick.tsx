// Forces one more R3F render after everything (incl. the post composer) has mounted, and holds the Remotion
// screenshot until it is done. Needed because @remotion/three advances before the composer subscribes.
import React from "react";
import { useThree } from "@react-three/fiber";
import { continueRender, delayRender, useCurrentFrame } from "remotion";
export const Kick: React.FC = () => {
  const f = useCurrentFrame();
  const { advance } = useThree();
  React.useLayoutEffect(() => {
    const h = delayRender("kick " + f);
    const id = setTimeout(() => { advance(performance.now()); continueRender(h); }, 0);
    return () => { clearTimeout(id); continueRender(h); };
  }, [f, advance]);
  return null;
};

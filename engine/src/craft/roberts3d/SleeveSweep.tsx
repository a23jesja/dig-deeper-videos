// The sleeve's proof (the reviewer's yes of 28 Nov to kit.ts a and b, condition 1): the rum pirate's striped arm bends from straight to 120
// degrees and back over 4 s (a smooth sine), at about the film's size, so the stripes' fade (a) and the crease's rounding (b) can be seen not
// to jump; scripts/sleeve_check.mjs measures the same geometry frame by frame, flicker2 the pixels. PROPS='{"plant":"stepFillet"}' (or
// noFade, noFillet) draws the planted fault.
//   PROPS='{}' node scripts/stills.mjs SleeveSweep ... / npx remotion render SleeveSweep
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Ink } from "../ink";
import { solve, POSES, type Pose } from "../rig";
import { KIT_DESIGN, SLEEVE_PLANT } from "../wardrobe/kit";
import { RUM_LOOK, PIRATE_HEIGHTS } from "../wardrobe/pirates";
import { mugSide } from "./props";

export const SWW = 1080, SWH = 1920, SW_N = 120;
/** the sweep's arm at frame f: the upper arm still, the forearm turning 0 -> 120 -> 0 degrees from it */
export const sweepPose = (f: number, yaw = 45): { pose: Pose; side: "L" | "R"; bend: number } => { const bend = 120 * (1 - Math.cos((2 * Math.PI * f) / SW_N)) / 2;
  const sk0 = solve(KIT_DESIGN.props("sir"), POSES.stand as Pose, yaw), side = mugSide(sk0);
  return { pose: { ...POSES.stand, head: [45 - yaw, 0, 0], [side === "R" ? "armR" : "armL"]: [[35, 40], [35 + bend, 0]] } as Pose, side, bend }; };
export const SleeveSweep: React.FC<{ plant?: string }> = ({ plant }) => { const fr = useCurrentFrame();
  SLEEVE_PLANT.noFade = plant === "noFade"; SLEEVE_PLANT.stepFillet = plant === "stepFillet"; SLEEVE_PLANT.noFillet = plant === "noFillet";
  return <AbsoluteFill style={{ background: "#d9cdb4" }}><canvas width={SWW} height={SWH} ref={(cv) => { if (!cv) return; const g = cv.getContext("2d")!; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, SWW, SWH);
    const p = sweepPose(fr), sk = solve(KIT_DESIGN.props("sir"), p.pose, 45), s = 2.0 * (PIRATE_HEIGHTS.rum / 1.75);
    g.translate(SWW / 2, 1500); g.scale(s, s); KIT_DESIGN.draw(new Ink(g, KIT_DESIGN.ol), sk, { who: "sir", look: RUM_LOOK, face: { pupil: 1, mouth: 0.2, lid: 0.06 }, handR: "relaxed", handL: "relaxed" } as never); }} /></AbsoluteFill>; };

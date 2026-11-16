// Test sheets for the drawings (look at these before anything goes into a scene).
// node scripts/stills.mjs Sheet out/emu/sheet_ 0 1   with PROPS='{"page":"emu"}'
import React from "react";
import { AbsoluteFill, getInputProps, useCurrentFrame } from "remotion";
import { Pen, bodyFront, bodySide, setTalk, SIR_DIGSWORTH, DIGGER, DIGGER2, MAJOR, FARMER, Expr } from "./toon";
import { emuSide, emuFront, fxFeather, fxDust, fxMuzzle, fxBang, fxSmoke } from "./emutoon";
import { bearFront, fxBadge } from "./beartoon";
import { pigSide, fxFlagUS, fxFlagUK, fxWarship, fxCannon, fxRifle, fxPotato, fxGrave } from "./pigtoon";

import * as M from "./monatoon";
import * as C from "./monacast";
type C0 = { i: number; o: import("./toon").Outfit };
type Cell = { w: number; h: number; draw: (p: Pen) => void; label?: string };
const Cv: React.FC<{ c: Cell; s: number }> = ({ c, s }) => (
  <div style={{ position: "relative", width: c.w * s, height: c.h * s, background: "#cfe0c8", border: "1px solid #789" }}>
    <canvas width={c.w * s} height={c.h * s} ref={(cv) => {
      if (!cv) return;
      const g = cv.getContext("2d")!;
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.setTransform(s, 0, 0, s, 0, 0);
      c.draw(new Pen(g));
    }} />
    <div style={{ position: "absolute", left: 4, top: 2, font: "14px sans-serif", color: "#234" }}>{c.label}</div>
  </div>
);

const pages = (f: number): Record<string, { s: number; cells: Cell[] }> => {
  const E = (label: string, draw: (p: Pen) => void): Cell => ({ w: 900, h: 1000, draw, label });
  const H = (label: string, draw: (p: Pen) => void): Cell => ({ w: 600, h: 1000, draw, label });
  const X = (label: string, draw: (p: Pen) => void, w = 300, h = 300): Cell => ({ w, h, draw, label });
  return {
    emu: { s: 0.4, cells: [
      E("stand calm", (p) => emuSide(p, { mode: "stand", expr: "calm" })),
      E("stand deadpan", (p) => emuSide(p, { mode: "stand", expr: "deadpan", seed: 2 })),
      E("alarm", (p) => emuSide(p, { mode: "stand", expr: "alarm", seed: 3 })),
      E("smug blink .5", (p) => emuSide(p, { mode: "stand", expr: "smug", blink: 0.5, seed: 4 })),
      ...[0, 0.125, 0.25, 0.375].map((ph) => E("walk " + ph, (p) => emuSide(p, { mode: "walk", phase: ph }))),
      ...[0, 0.1, 0.2, 0.32, 0.5, 0.66, 0.8, 0.9].map((ph) => E("run " + ph, (p) => emuSide(p, { mode: "run", phase: ph, expr: "alarm" }))),
      ...[0.25, 0.5, 0.75, 1].map((k) => E("peck " + k, (p) => emuSide(p, { mode: "peck", peck: k }))),
      E("peck jab", (p) => emuSide(p, { mode: "peck", peck: 1, jab: 1 })),
      E("peck ground", (p) => emuSide(p, { mode: "peck", peck: 1, reach: 40 })),
      E("gulp", (p) => emuSide(p, { mode: "stand", gulp: 0.5 })),
      E("front stand", (p) => emuFront(p, { expr: "deadpan" })),
      ...[0.1, 0.25, 0.6].map((ph) => E("front walk " + ph, (p) => emuFront(p, { mode: "walk", phase: ph, seed: 5 }))),
      E("front run", (p) => emuFront(p, { mode: "run", phase: 0.25, expr: "alarm", seed: 7 })),
      E("back walk", (p) => emuFront(p, { mode: "walk", phase: 0.25, back: true })),
      E("back run", (p) => emuFront(p, { mode: "run", phase: 0.75, back: true, seed: 9 })),
    ] },
    anim: { s: 0.5, cells: [
      E("walk", (p) => emuSide(p, { mode: "walk", phase: (f / 30) % 1 })),
      E("run", (p) => emuSide(p, { mode: "run", phase: (f / 11) % 1, expr: "alarm" })),
      E("front walk", (p) => emuFront(p, { mode: "walk", phase: (f / 30) % 1 })),
      E("back run", (p) => emuFront(p, { mode: "run", phase: (f / 11) % 1, back: true })),
    ] },
    people: { s: 0.42, cells: [
      ...(["neutral", "smile", "shock", "stern"] as Expr[]).map((e) => H("sir " + e, (p) => { setTalk(0); bodyFront(p, SIR_DIGSWORTH, { mode: "stand", expr: e, seed: 3 }); })),
      H("sir talk", (p) => { setTalk(0.8); bodyFront(p, SIR_DIGSWORTH, { mode: "stand", expr: "neutral", seed: 3 }); setTalk(0); }),
      H("sir point", (p) => bodyFront(p, SIR_DIGSWORTH, { mode: "stand", expr: "smile", seed: 3, point: 1 })),
      H("sir shrug", (p) => bodyFront(p, SIR_DIGSWORTH, { mode: "stand", expr: "neutral", seed: 3, shrug: 1 })),
      H("sir side", (p) => bodySide(p, SIR_DIGSWORTH, { mode: "stand", seed: 3 })),
      H("major", (p) => bodyFront(p, MAJOR, { mode: "stand", expr: "stern", seed: 2 })),
      H("major side", (p) => bodySide(p, MAJOR, { mode: "march", phase: 0.2, seed: 2 })),
      H("digger", (p) => bodyFront(p, DIGGER, { mode: "stand", expr: "neutral", seed: 4 })),
      H("digger2", (p) => bodyFront(p, DIGGER2, { mode: "stand", expr: "nervous", seed: 6 })),
      H("digger side push", (p) => bodySide(p, DIGGER, { mode: "push", pose: 1, seed: 4, hand: [470, 560] })),
      H("digger sit", (p) => bodyFront(p, DIGGER2, { mode: "sit", expr: "dazed", seed: 6 })),
      H("farmer", (p) => bodyFront(p, FARMER, { mode: "stand", expr: "shock", seed: 5, cheer: 1 })),
      H("farmer side", (p) => bodySide(p, FARMER, { mode: "stand", expr: "shock", seed: 5 })),
    ] },
    sir: { s: 1.9, cells: [
      H("front", (p) => { setTalk(0); bodyFront(p, SIR_DIGSWORTH, { mode: "stand", expr: "neutral", seed: 3 }); }),
      H("talk", (p) => { setTalk(0.9); bodyFront(p, SIR_DIGSWORTH, { mode: "stand", expr: "smile", seed: 3 }); setTalk(0); }),
    ] },
    bear: { s: 0.44, cells: [
      E("stand calm", (p) => bearFront(p, {})),
      E("happy cap", (p) => bearFront(p, { expr: "happy", cap: true })),
      E("salute", (p) => bearFront(p, { pose: "salute", cap: true, expr: "proud", stripes: true })),
      E("carry walk", (p) => bearFront(p, { pose: "carry", walk: true, phase: 0.2, cap: true })),
      E("drink", (p) => bearFront(p, { pose: "drink", expr: "happy" })),
      E("cheer shock", (p) => bearFront(p, { pose: "cheer", expr: "shock" })),
      E("sit sleepy", (p) => bearFront(p, { pose: "sit", expr: "sleepy" })),
      E("cub", (p) => bearFront(p, { cub: true, expr: "calm" })),
      E("cub drink", (p) => bearFront(p, { cub: true, pose: "drink", k: 1 })),
      E("walk .6", (p) => bearFront(p, { walk: true, phase: 0.6, cap: true })),
      X("badge", fxBadge, 400, 440),
    ] },
    pig: { s: 0.34, cells: [
      E("stand", (p) => pigSide(p, { mode: "stand" })), E("walk .25", (p) => pigSide(p, { mode: "walk", phase: 0.25 })), E("eat", (p) => pigSide(p, { mode: "eat", k: 0.25 })),
      E("shock", (p) => pigSide(p, { mode: "stand", expr: "shock" })), E("dead", (p) => pigSide(p, { mode: "dead" })), E("happy", (p) => pigSide(p, { mode: "stand", expr: "happy" })),
      X("US", (p) => fxFlagUS(p, 0.5), 520, 720), X("UK", (p) => fxFlagUK(p, 0.5), 520, 720), X("warship", fxWarship, 1000, 760), X("cannon", fxCannon, 420, 260),
      X("rifle", fxRifle, 560, 120), X("potato", (p) => fxPotato(p), 220, 220), X("eaten", (p) => fxPotato(p, true), 220, 220), X("grave", (p) => fxGrave(p, "R.I.P.|THE PIG|1859"), 420, 480),
    ] },
    fx: { s: 1, cells: [
      X("feather", fxFeather, 200, 120), X("dust .2", (p) => fxDust(p, 0.2)), X("dust .8", (p) => fxDust(p, 0.8)),
      X("muzzle", (p) => fxMuzzle(p, 0)), X("muzzle 1", (p) => fxMuzzle(p, 1)), X("bang", fxBang, 200, 260), X("smoke", (p) => fxSmoke(p, 0.5)),
    ] },
    mona: { s: 0.34, cells: [
      X("mona framed", (p) => M.fxMona(p), 700, 920), X("mona glass", (p) => M.fxMona(p, true), 700, 920), X("hooks", (p) => M.fxHooks(p, 4), 700, 920), X("other portrait", (p) => M.fxOtherPortrait(p), 700, 920),
      X("frame", (p) => M.fxFrameEmpty(p), 700, 920), X("glass", (p) => M.fxGlassPane(p), 560, 760), X("panel", (p) => M.fxPanel(p), 460, 640), X("panel back", (p) => M.fxPanel(p, true), 460, 640),
      X("bundle", (p) => M.fxBundle(p), 520, 400), X("smock", (p) => M.fxSmock(p), 380, 600),
      ...[0, 1, 2].map((k) => X("door " + k, (p) => M.fxDoorS(p, k), 520, 900)), ...[0, 1].map((k) => X("knob " + k, (p) => M.fxKnob(p, k), 760, 520)), X("pliers", (p) => M.fxPliers(p), 360, 220),
      ...[0, 1, 2, 3, 4].map((k) => X("trunk " + k, (p) => M.fxTrunk(p, k), 820, 600)), ...[0, 0.6, 1].map((k) => X("cloth " + k, (p) => M.fxCloth(p, k), 620, 300)),
      X("louvre", (p) => M.fxLouvre(p), 1800, 640), X("florence", (p) => M.fxFlorence(p), 1600, 700), X("notre dame", (p) => M.fxNotreDame(p), 560, 660), X("alps", (p) => M.fxAlps(p), 1800, 620),
      ...(["blank", "start", "mona", "other", "cubist"] as const).map((k) => X("easel " + k, (p) => M.fxEasel(p, k), 640, 1040)), X("camera", (p) => M.fxCamera(p), 560, 820), X("camera flash", (p) => M.fxCamera(p, true), 560, 820),
      X("statue", (p) => M.fxStatue(p), 320, 440), X("suitcase", (p) => M.fxSuitcase(p), 460, 340), X("thumb", (p) => M.fxThumb(p), 440, 440), X("file", (p) => M.fxFile(p), 600, 720),
      X("front page", (p) => M.fxFrontPage(p), 600, 760), X("magazine", (p) => M.fxMagazine(p), 560, 720), X("letter", (p) => M.fxHandLetter(p, "Leonardo"), 620, 780), X("letter big", (p) => M.fxHandLetter(p, "", "I will make|my FORTUNE"), 620, 780),
      X("love", (p) => M.fxLove(p), 320, 240), X("clock", (p) => M.fxClock2(p, 7, 0), 320, 320), X("measure", (p) => M.fxMeasure(p, "77 cm"), 760, 200), X("tick", (p) => M.fxMark(p, true), 320, 320), X("cross", (p) => M.fxMark(p, false), 320, 320),
      X("poster", (p) => M.fxPoster(p), 460, 620), X("train", (p) => M.fxTrain(p), 1300, 480), X("barrier", (p) => M.fxBarrier(p), 1000, 420), X("bell", (p) => M.fxBell(p, 0.6), 340, 340), X("lens", (p) => M.fxLens(p), 340, 340),
      X("bars", (p) => M.fxCellBars(p), 1000, 760), X("paint", (p) => M.fxPaintPot(p), 340, 340), X("canvas", (p) => M.fxSupport(p, false), 420, 260), X("wood", (p) => M.fxSupport(p, true), 420, 260),
      X("sign", (p) => M.fxSign(p, "HOTEL", "TRIPOLI-ITALIA"), 900, 300), X("cupboard", (p) => M.fxCupboard(p), 420, 720), X("post", (p) => M.fxPost(p), 200, 520),
    ] },
    hats: { s: 0.56, cells: [
      ...[1, 2, 3, 4, 5, 6, 7].map((sd) => H("tophat walk seed " + sd, (p) => bodySide(p, C.FOLK[0].o, { mode: "march", phase: 0.05 + 0.1 * sd, seed: sd }))),
      ...(["tophat", "bowler", "cap", "shako", "peaked", "slouch", "crown", "bicorne", "beret", "bonnet", "hair"] as const).map((h, k) => H(h + " walk", (p) => bodySide(p, { ...C.FOLK[0].o, hat: h, cap: "#5a4a3a", hair: "#5a3b2a" }, { mode: "march", phase: 0.0, seed: 1 + (k % 7) }))),
      ...(["tophat", "bowler", "cap", "shako", "peaked", "slouch", "crown", "bicorne", "beret", "bonnet", "hair"] as const).map((h, k) => H(h + " stand", (p) => bodySide(p, { ...C.FOLK[0].o, hat: h, cap: "#5a4a3a", hair: "#5a3b2a" }, { mode: "stand", seed: 2 + (k % 6) }))),
    ] },
    hatwalk: { s: 0.5, cells: [
      ...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => H("tophat " + k / 8, (p) => bodySide(p, C.FOLK[0].o, { mode: "march", phase: k / 8, seed: 4 }))),
      ...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => H("bowler " + k / 8, (p) => bodySide(p, C.DETECTIVE.o, { mode: "march", phase: k / 8, seed: 6 }))),
      ...[1, 2, 3, 5, 7].map((sd) => H("tophat stand " + sd, (p) => bodySide(p, C.MARQUIS.o, { mode: "stand", seed: sd }))),
      ...[1, 4, 6].map((sd) => H("tophat front " + sd, (p) => bodyFront(p, C.MARQUIS.o, { mode: "stand", seed: sd }))),
    ] },
    backs: { s: 0.5, cells: [
      ...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => H("folk" + k + " back", (p) => bodyFront(p, C.FOLK[k].o, { mode: "stand", back: true, seed: ((C.FOLK[k].i * 5 + 3) % 7) + 1 }))),
      ...([["guard", C.GUARD1], ["cop", C.COPS[0]], ["detective", C.DETECTIVE], ["marquis", C.MARQUIS], ["per", C.PER], ["smock", C.PER_SMOCK], ["kafka", C.KAFKA], ["director", C.DIRECTOR], ["leonardo", C.LEONARDO], ["king", C.KING], ["napoleon", C.NAPOLEON], ["picasso", C.PICASSO], ["work1", C.WORK1], ["beroud", C.BEROUD]] as [string, C0][])
        .map(([n, w]) => H(n + " back", (p) => bodyFront(p, w.o, { mode: "stand", back: true, seed: ((w.i * 5 + 3) % 7) + 1 }))),
    ] },
    monacast: { s: 0.36, cells: [
      ...([["per", C.PER], ["smock", C.PER_SMOCK], ["soldier", C.PER_SOLDIER], ["suit", C.PER_SUIT], ["guard1", C.GUARD1], ["guard2", C.GUARD2], ["porter", C.PORTER], ["director", C.DIRECTOR], ["work1", C.WORK1], ["plumber", C.PLUMBER], ["beroud", C.BEROUD], ["photog", C.PHOTOG],
        ["leonardo", C.LEONARDO], ["king", C.KING], ["napoleon", C.NAPOLEON], ["cop", C.COPS[0]], ["detective", C.DETECTIVE], ["judge", C.JUDGE], ["carab", C.CARAB1], ["pieret", C.PIERET], ["editor", C.EDITOR], ["apollinaire", C.APOLLINAIRE], ["picasso", C.PICASSO], ["kafka", C.KAFKA], ["brod", C.BROD],
        ["geri", C.GERI], ["poggi", C.POGGI], ["marquis", C.MARQUIS], ["rich0", C.RICH[0]], ["folk0", C.FOLK[0]], ["folk1", C.FOLK[1]], ["folk3", C.FOLK[3]]] as [string, C0][]).map(([n, w]) => H(n, (p) => bodyFront(p, w.o, { mode: "stand", expr: "smile", seed: w.i * 7 + 3 }))),
      H("leonardo back", (p) => bodyFront(p, C.LEONARDO.o, { mode: "stand", back: true, seed: 3 })), H("leonardo side", (p) => bodySide(p, C.LEONARDO.o, { mode: "march", phase: 0.2, seed: 3 })),
      H("napoleon side", (p) => bodySide(p, C.NAPOLEON.o, { mode: "march", phase: 0.2, seed: 3 })), H("per side", (p) => bodySide(p, C.PER_SMOCK.o, { mode: "march", phase: 0.2, seed: 3 })), H("kafka side", (p) => bodySide(p, C.KAFKA.o, { mode: "stand", seed: 3 })),
      H("per sit", (p) => bodyFront(p, C.PER.o, { mode: "sit", expr: "nervous", seed: 3 })), H("per shock", (p) => bodyFront(p, C.PER_SMOCK.o, { mode: "stand", expr: "shock", seed: 3 })),
    ] },
  };
};

export const Sheet: React.FC = () => {
  const f = useCurrentFrame();
  const page = (getInputProps() as { page?: string }).page ?? "emu";
  const pg = pages(f)[page];
  return (
    <AbsoluteFill style={{ background: "#e9efe4", display: "flex", flexDirection: "row", flexWrap: "wrap", alignContent: "flex-start", gap: 4, padding: 6 }}>
      {pg.cells.map((c, i) => <Cv key={i} c={c} s={pg.s} />)}
    </AbsoluteFill>
  );
};

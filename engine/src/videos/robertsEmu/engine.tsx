// Roberts' bedtime in the Emu look: the film's engine. Each shot is a Blender plate of the deck (public/remu/<id>, its lanterns fading out as
// shots.json says) drifting slowly, the Emu Short's toon figures (../emu/toon.ts) placed on the deck by the plate's own camera (their feet on the
// deck at their depth, their size from it), farther ones drawn first and softer, props drawn in their hands, effects, and the spoken words one
// at a time as in the Emu Short. No 3D staging beyond that.
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Pen, bodyFront, setTalk, LAST_HANDS, type Outfit, type FrontOpts } from "../emu/toon";
import SPEC from "./shots.json";
import CAMS from "./cams.json";

export const FPS = 30, W = 1080, H = 1920;
export type P2 = [number, number];
export type V3 = [number, number, number];
type Mat = number[][];
const CAM = CAMS as unknown as Record<string, Mat>;
export type ShotSpec = { id: string; t0: number; t1: number; light?: string; lamps?: { at: number; out: number[] }[]; dark?: number[]; what?: string };
export const SPECS = (SPEC as unknown as { shots: ShotSpec[] }).shots;
/** a world point (metres, z up) in picture pixels for a shot, and its depth */
export const proj = (id: string, p: V3): V3 => { const P = CAM[id]; const v = [0, 1, 2].map((r) => P[r][0] * p[0] + P[r][1] * p[1] + P[r][2] * p[2] + P[r][3]); return [v[0] / v[2], v[1] / v[2], v[2]]; };
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const ease = (u: number) => { const x = clamp(u); return x * x * (3 - 2 * x); };
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

/** a figure in a shot: its outfit, its floor point (metres) and height over time, its drawing options, what it holds, its effects */
export type Actor = {
  o: Outfit; h: number; at: (t: number) => [number, number]; f: (t: number) => FrontOpts;
  talk?: (t: number) => number; lift?: (t: number) => number;       // (metres off the deck: a jump, a fall)
  hold?: (p: Pen, hands: P2[], t: number, toD: (q: P2) => P2) => void;      // drawn after the body, in its design space, the hands where bodyFront put them; toD: a picture point in that space
  fx?: (p: Pen, t: number, toD: (q: P2) => P2) => void; rot?: (t: number) => number;      // degrees about the feet (a fall, a wobble)
  sharp?: boolean;                                                  // in focus whatever its depth
  clip?: (t: number) => P2[] | null;                                // the picture region it may show in (one climbing out of the hatch: above its near rim)
};
export type Shot = { id: string; actors: Actor[]; drift?: [number, number, number, number]; blur?: number; focus?: number; tint?: string; black?: boolean;
  under?: (g: CanvasRenderingContext2D, t: number) => void; over?: (g: CanvasRenderingContext2D, t: number) => void; capY?: number;
  extraZones?: (t: number) => number[][];
  moon?: boolean;      // (a moonlit shot: each figure cooled a little and given a pale rim on the moon's side, the cloud session's point 8)      // (faces drawn in over(): the eyes in the dark, the parchment, the book)
};

/** the toon drawing is 600 x 1000 design units, the soles at 985 and the crown at about 150 */
const SOLE = 985, TALL = 835;
const drawActor = (g: CanvasRenderingContext2D, id: string, a: Actor, t: number, focus: number) => {
  const [x, y] = a.at(t), z0 = a.lift?.(t) ?? 0, ft = proj(id, [x, y, z0]), hd = proj(id, [x, y, z0 + a.h]); if (ft[2] <= 0.2) return;
  const k = (ft[1] - hd[1]) / TALL, blur = a.sharp ? 0 : Math.min(6, Math.abs(ft[2] - focus) * 1.1);
  // (every figure's contact with the deck: a soft dark pool under its feet on the deck itself, smaller and fainter as it lifts; the cloud
  //  session on still B: in the dark they seemed to float)
  { const g0 = proj(id, [x, y, 0]), up = Math.max(0, z0), kk = (g0[1] - proj(id, [x, y, a.h])[1]) / TALL, rx = 150 * kk * (1 - Math.min(0.6, up * 1.2)), ry = rx * 0.28, al = 0.55 * (1 - Math.min(0.8, up * 1.6));
    if (z0 > -0.3) { g.save(); g.translate(g0[0], g0[1]); g.scale(1, ry / rx); const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx); gr.addColorStop(0, `rgba(5,4,10,${al})`); gr.addColorStop(0.6, `rgba(5,4,10,${al * 0.55})`); gr.addColorStop(1, "rgba(5,4,10,0)"); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, rx, 0, 7); g.fill(); g.restore(); } }
  g.save(); const cl = a.clip?.(t); if (cl) { g.beginPath(); cl.forEach(([x2, y2], i) => (i ? g.lineTo(x2, y2) : g.moveTo(x2, y2))); g.closePath(); g.clip(); }
  g.translate(ft[0], ft[1]); if (a.rot) g.rotate((a.rot(t) * Math.PI) / 180); g.scale(k, k); g.translate(-300, -SOLE);
  if (blur > 0.4) g.filter = `blur(${blur / k}px)`;
  setTalk(a.talk?.(t) ?? 0); const p = new Pen(g); bodyFront(p, a.o, a.f(t)); setTalk(0);
  const r = ((a.rot?.(t) ?? 0) * Math.PI) / 180, toD = (q: P2): P2 => { const dx = q[0] - ft[0], dy = q[1] - ft[1], c = Math.cos(-r), s = Math.sin(-r); return [(dx * c - dy * s) / k + 300, (dx * s + dy * c) / k + SOLE]; };
  const hands = LAST_HANDS.slice(); if (a.hold) a.hold(p, hands, t, toD); if (a.fx) a.fx(p, t, toD);
  g.restore(); };

/** a shot's plates as its lanterns go out: each next one faded in over 4 frames */
const plateMix = (s: ShotSpec, t: number): [number, number][] => { let out: [number, number][] = [[1, 1]];
  (s.lamps ?? []).forEach((l, j) => { const u = ((t - l.at) * FPS) / 4; if (u <= 0) return; out = u >= 1 ? [[j + 2, 1]] : [...out, [j + 2, u]]; }); return out; };

/** the spoken words one at a time, as in the Emu Short (white, a dark outline), from the takes' word timings on the voice timeline */
export type Word = { w: string; a: number; b: number };
export const ShotView: React.FC<{ shot: Shot; spec: ShotSpec; t: number; words: Word[]; T: number }> = ({ shot, spec, t, words, T }) => {
  const u = (t) / Math.max(0.1, spec.t1 - spec.t0), d = shot.drift ?? [1.04, 1.0, 0, 0], sc = lerp(d[0], d[1], u), dx = d[2] * u, dy = d[3] * u;
  const focus = shot.focus ?? 3, word = words.find((w) => T >= w.a && T < w.b);
  // (words never over a face or a hand: each figure's head and arms zone, from its crown down to its hips and as wide as its arms reach, in the
  //  picture with the drift; the caption's band goes where none is, the lower places first)
  const zones = shot.actors.map((a) => { const [x, y] = a.at(t), z0 = a.lift?.(t) ?? 0, ft = proj(spec.id, [x, y, z0]), hd = proj(spec.id, [x, y, z0 + a.h]), k = (ft[1] - hd[1]) / TALL;
    const X = (v: number) => (v - W / 2) * sc + W / 2 + dx, Y = (v: number) => (v - H * 0.6) * sc + H * 0.6 + dy; return [X(ft[0] - 230 * k), Y(ft[1] - 860 * k), X(ft[0] + 230 * k), Y(ft[1] - 380 * k)]; })
    .concat((shot.extraZones?.(t) ?? []));
  const band = (y: number) => [140, y, 940, y + 130], hit = (b: number[], z: number[]) => b[0] < z[2] && b[2] > z[0] && b[1] < z[3] && b[3] > z[1];
  const capY = [shot.capY ?? 1460, 1600, 1720, 1460, 1320, 1180, 380, 260].find((y) => zones.every((z) => !hit(band(y), z))) ?? (shot.capY ?? 1460);
  return <AbsoluteFill style={{ background: "#070a14", overflow: "hidden" }}>
    <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${sc})`, transformOrigin: "50% 60%" }}>
      {shot.black ? null : plateMix(spec, t).map(([n, op]) => <Img key={n} src={staticFile(`remu/${spec.id}/${String(n).padStart(4, "0")}.jpg`)} style={{ position: "absolute", width: W, height: H, opacity: op, filter: `blur(${shot.blur ?? 2.5}px)` }} />)}
      {shot.tint ? <AbsoluteFill style={{ background: shot.tint }} /> : null}
      <AbsoluteFill><canvas width={W} height={H} ref={(cv) => { if (!cv) return; const g = cv.getContext("2d")!; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
        shot.under?.(g, t);
        const order = shot.actors.map((a) => ({ a, z: proj(spec.id, [...a.at(t), 0] as V3)[2] })).sort((p, q) => q.z - p.z);
        for (const { a } of order) { if (!shot.moon) { drawActor(g, spec.id, a, t, focus); continue; }
          const f0 = proj(spec.id, [...a.at(t), 0] as V3), f1 = proj(spec.id, [...a.at(t), a.h] as V3); if (f0[1] - f1[1] < 260) { drawActor(g, spec.id, a, t, focus); continue; }
          OFF ??= Object.assign(document.createElement("canvas"), { width: W, height: H }); RIMC ??= Object.assign(document.createElement("canvas"), { width: W, height: H });
          const o = OFF.getContext("2d")!, r = RIMC.getContext("2d")!; o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, W, H); drawActor(o, spec.id, a, t, focus);
          o.globalCompositeOperation = "source-atop"; o.fillStyle = "rgba(20,30,70,0.22)"; o.fillRect(0, 0, W, H); o.globalCompositeOperation = "source-over";      // (cooled a little: moonlight)
          const sz = Math.max(4, Math.round((f0[1] - f1[1]) * 0.012));
          r.setTransform(1, 0, 0, 1, 0, 0); r.clearRect(0, 0, W, H); r.globalCompositeOperation = "source-over"; r.drawImage(OFF, 0, 0); r.globalCompositeOperation = "destination-out"; r.drawImage(OFF, sz, sz * 0.6);
          r.globalCompositeOperation = "source-in"; r.fillStyle = "rgba(190,210,255,0.85)"; r.fillRect(0, 0, W, H); r.globalCompositeOperation = "source-over";
          g.drawImage(OFF, 0, 0); g.drawImage(RIMC, 0, 0); }
        shot.over?.(g, t); }} /></AbsoluteFill>
    </AbsoluteFill>
    {word ? <div style={{ position: "absolute", left: 0, right: 0, top: capY, textAlign: "center", fontFamily: "'Arial Black', Arial, sans-serif", fontWeight: 900, fontSize: 104, color: "#ffffff", WebkitTextStroke: "14px #1b1420", paintOrder: "stroke fill", letterSpacing: 1 }}>{word.w.replace(/[.,!?]+$/, "")}</div> : null}
  </AbsoluteFill>; };

let OFF: HTMLCanvasElement | null = null, RIMC: HTMLCanvasElement | null = null;
export const useLocal = (T: number) => { const s = SPECS.find((q) => T >= q.t0 && T < q.t1) ?? SPECS[SPECS.length - 1]; return { spec: s, t: T - s.t0 }; };
export const useT = () => useCurrentFrame() / FPS;

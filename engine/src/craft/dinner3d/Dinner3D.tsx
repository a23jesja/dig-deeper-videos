// The Short "The captain's dinner": each frame the Blender plate (public/din3d/<shot>/NNNN.jpg; a held camera has one plate) and over it the
// flat Knopp figures (core.ts, figures.ts) and the words. Sound: craft/dinner3d.wav (audio/dinner3d_audio.py).
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from "remotion";
import { FM } from "../clips/clipKit";
import { capWidth } from "../stage/film";
import { SHOTS, paintFigures, placeOf, toScreen, handPx, type Who } from "./core";
import { jointPx } from "../clips/clipKit";
import { WHO, VOICES, FILM_S } from "./figures";

export const DINNER_S = FILM_S;
const BUILT: Record<string, Who[]> = Object.fromEntries(SHOTS.map((s) => [s.id, WHO[s.id]()]));
export const shotAtD = (t: number) => { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1].t0 - 1e-6) i++; const s = SHOTS[i], n = Math.round((s.t1 - s.t0) * FM.FPS); return { s, fr: Math.min(n - 1, Math.round((t - s.t0) * FM.FPS)) }; };
/** the hook's question (the first line's own six words), whole, while it is said and a little after (2.0 s); then the spoken words one at a
 *  time (DAILY-RULES 6), each until the next starts or 0.3 s past its end, never running on past a cut by less than 0.4 s */
const QUESTION = { a: 0, b: 2.0, text: "WHO ATE THE PIRATE|CAPTAIN'S DINNER?" };      // (two lines: in one the six words were 37 px, too small on a phone)
const WORDS = VOICES.filter((v) => v.id !== "n1").flatMap((v) => (v.p.words as { w: string; a: number; b: number }[]).map((w) => ({ w: w.w, a: w.a + v.at + 0.05, b: w.b + v.at + 0.05, line: v.id })));
export const CAPS = (() => { const cuts = SHOTS.slice(1).map((s) => s.t0), out = WORDS.map((w, i) => { const n = WORDS[i + 1], b = n && n.line === w.line && n.a - w.b < 0.3 ? n.a : w.b + 0.3;
  return { a: w.a, b, text: w.w.toUpperCase().replace(/[.,":;]/g, "").replace("FAVOR", "FAVOUR") }; });
  // (a word shown under 0.2 s ("the", "a") joins the next word of its line: alone it popped on for a frame or two, a flicker in the text, t1 20.67 s)
  const merged: typeof out = []; for (let i = 0; i < out.length; i++) { const c = out[i], n = out[i + 1], wi = WORDS[i], wn = WORDS[i + 1];
    if (n && wn && wn.line === wi.line && c.b - c.a < 0.2) { n.a = c.a; n.text = c.text + " " + n.text; continue; } merged.push(c); }
  for (const c of merged) for (const x of cuts) if (x > c.a + 0.15 && x < c.b && c.b - x < 0.4) c.b = x;
  return [QUESTION, ...merged]; })();
/** the band's top per shot (px): the lower third, below faces and the hands at the table */
/** each shot's caption band (its top, px): the first of these heights (low under the figures, then high over them) where the band, as wide as
 *  the shot's widest word, meets no face (the head's circle below its cap) and no hand in any frame of the shot (dinner_check 6) */
const TOPS = [1450, 1500, 1400, 1520, 1540, 330, 380, 430, 480, 300, 1350, 1300, 1250, 1200, 560, 640, 720];
export const CAP_TOPS: Record<string, number> = (() => { const out: Record<string, number> = {};
  for (const S of SHOTS) { const n = Math.round((S.t1 - S.t0) * FM.FPS), whos = BUILT[S.id], words = CAPS.filter((c) => c.b > S.t0 && c.a < S.t1);
    const lines = Math.max(1, ...words.map((c) => c.text.split("|").length)), cw = Math.max(0, ...words.map((c) => Math.max(...c.text.split("|").map(capWidth)))), sz = Math.round(96 * Math.min(1, 8.9 / Math.max(cw, 0.1))), w = Math.min(1020, cw * 1.194 * sz) + 20, hgt = sz * 1.1 * lines + 12;
    const boxes: [number, number, number, number][] = [], heads: [number, number, number][] = [];
    for (let fr = 0; fr < n; fr += 2) for (const wh of whos) { const pl = placeOf(S.id, fr, wh), P = (j: string) => toScreen(pl, jointPx(pl.f, j)), a = P("skull"), b = P("crown"), hr = Math.hypot(b[0] - a[0], b[1] - a[1]) / 2;
      heads.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, hr * 1.1]);
      for (const sd of ["L", "R"]) { const u = P("wr" + sd), v = P("tip" + sd), r = handPx(pl) * 0.45; boxes.push([Math.min(u[0], v[0]) - r, Math.min(u[1], v[1]) - r, Math.max(u[0], v[0]) + r, Math.max(u[1], v[1]) + r]); } }
    const clear = (top: number) => { const bx = [540 - w / 2, top - (lines - 1) * sz * 1.1 - 6, 540 + w / 2, top + sz * 1.1 + 6];
      if (bx[1] < 0.15 * FM.H || bx[3] > 0.85 * FM.H) return false;
      for (const h of heads) { const cx = Math.max(bx[0], Math.min(h[0], bx[2])), cy = Math.max(bx[1], Math.min(h[1], bx[3])); if (Math.hypot(cx - h[0], cy - h[1]) < h[2] && bx[3] > h[1] - 0.45 * h[2]) return false; }
      for (const hb of boxes) if (hb[0] < bx[2] && hb[2] > bx[0] && hb[1] < bx[3] && hb[3] > bx[1]) return false;
      return true; };
    out[S.id] = TOPS.find(clear) ?? -1; void hgt; }
  return out; })();
export const captionAt = (T: number) => { const c = CAPS.find((q) => T >= q.a - 0.03 && T < q.b); if (!c) return null; const sh = SHOTS.find((s) => T >= s.t0 && T < s.t1) ?? SHOTS[SHOTS.length - 1];
  const lines = c.text.split("|"), cw = Math.max(...lines.map(capWidth)), sz = Math.round(96 * Math.min(1, 8.9 / cw)), w = Math.min(1020, cw * 1.194 * sz), top = (CAP_TOPS[sh.id] ?? 430) - (lines.length - 1) * sz * 1.1;
  return { text: c.text, lines, sz, box: [540 - w / 2, top, 540 + w / 2, top + sz * 1.08 * lines.length + (lines.length - 1) * sz * 0.02] as [number, number, number, number] }; };
export const paintCaption = (g: CanvasRenderingContext2D, T: number) => { const c = captionAt(T); if (!c) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = `900 ${c.sz}px 'Arial Black', Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "top"; g.lineJoin = "round";
  g.lineWidth = 18; g.strokeStyle = "#141018"; g.fillStyle = "#fff4c2"; c.lines.forEach((l, i) => { const y = c.box[1] + i * c.sz * 1.1; g.strokeText(l, 540, y); g.fillText(l, 540, y); }); g.restore(); };
export const Dinner3D: React.FC<{ muted?: boolean }> = ({ muted = false }) => {
  const t = useCurrentFrame() / FM.FPS, { s, fr } = shotAtD(t), pf = s.static ? 0 : fr;
  return <AbsoluteFill style={{ background: "#1a1210" }}>
    <Img src={staticFile(`din3d/${s.id}/${String(pf + 1).padStart(4, "0")}.jpg`)} style={{ width: FM.W, height: FM.H }} />
    <AbsoluteFill><canvas width={FM.W} height={FM.H} ref={(cv) => { if (cv) { const g = cv.getContext("2d")!; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, FM.W, FM.H); paintFigures(g, s.id, fr, BUILT[s.id]); paintCaption(g, t); } }} /></AbsoluteFill>
    {muted ? null : <Audio src={staticFile("craft/dinner3d.wav")} />}
  </AbsoluteFill>; };

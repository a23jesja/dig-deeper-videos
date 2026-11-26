// The Short "The captain's dinner": each frame the Blender plate (public/din3d/<shot>/NNNN.jpg; a held camera has one plate) and over it the
// flat Knopp figures (core.ts, figures.ts) and the words. Sound: craft/dinner3d.wav (audio/dinner3d_audio.py).
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from "remotion";
import { FM } from "../clips/clipKit";
import { capWidth } from "../stage/film";
import { BEARD_PLANT } from "../wardrobe/kit";
import { SHOTS, paintFigures, placeOf, toScreen, handPx, PLANT, project, type Who } from "./core";
import SPEC_D from "./shots.json";
import { jointPx } from "../clips/clipKit";
import { WHO, VOICES, FILM_S, EXTRAS } from "./figures";

export const DINNER_S = FILM_S;
const BUILT: Record<string, Who[]> = Object.fromEntries(SHOTS.map((s) => [s.id, WHO[s.id]()]));
export const shotAtD = (t: number) => { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1].t0 - 1e-6) i++; const s = SHOTS[i], n = Math.round((s.t1 - s.t0) * FM.FPS); return { s, fr: Math.min(n - 1, Math.round((t - s.t0) * FM.FPS)) }; };
/** the hook's question (the first line's own six words), whole, while it is said and a little after (2.0 s); then the spoken words one at a
 *  time (DAILY-RULES 6), each until the next starts or 0.3 s past its end, never running on past a cut by less than 0.4 s */
const QUESTION = { a: 0, b: 1.6, text: "WHO ATE THE PIRATE|CAPTAIN'S DINNER?" };      // (v6: whole while shot 1 lasts, 0-1.6 s, the list)      // (two lines: in one the six words were 37 px, too small on a phone)
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
const TOPS = [1450, 1500, 1400, 1520, 1540, 330, 380, 430, 480, 300, 1350, 1300, 1250, 1200, 560, 640, 720, 1580, 1600, 1150, 1100, 800, 880, 960];
/** a figure's body in the picture as capsules [x0, y0, x1, y1, r]: arms, torso, legs (the words never over a body or an arm, the reviewer 25 Nov) */
export const bodyCaps = (pl: ReturnType<typeof placeOf>): [number, number, number, number, number][] => { const P = (j: string) => toScreen(pl, jointPx(pl.f, j)), a = P("skull"), b = P("crown"), hr = Math.hypot(b[0] - a[0], b[1] - a[1]) / 2, out: [number, number, number, number, number][] = [];
  const seg = (j0: string, j1: string, r: number) => { const u = P(j0), v = P(j1); out.push([u[0], u[1], v[0], v[1], r]); };
  for (const sd of ["L", "R"]) { seg("sh" + sd, "el" + sd, 0.28 * hr); seg("el" + sd, "wr" + sd, 0.26 * hr); seg("wr" + sd, "tip" + sd, 0.42 * hr); }      // (the arms and hands first: ARM_CAPS of them)
  for (const sd of ["L", "R"]) { seg("hip" + sd, "kn" + sd, 0.3 * hr); seg("kn" + sd, "an" + sd, 0.26 * hr); seg("an" + sd, "toe" + sd, 0.2 * hr); }
  seg("neck", "pelvis", 0.75 * hr); seg("shL", "shR", 0.35 * hr); seg("hipL", "hipR", 0.35 * hr); return out; };
/** how many of bodyCaps' capsules are arms and hands (the words never over them, nor over a face or the action: the reviewer, 25 Nov) */
export const ARM_CAPS = 6;
/** does a box meet a capsule */
export const boxHitsCap = (bx: number[], c: number[]) => { for (let k = 0; k <= 12; k++) { const x = c[0] + ((c[2] - c[0]) * k) / 12, y = c[1] + ((c[3] - c[1]) * k) / 12, cx = Math.max(bx[0], Math.min(x, bx[2])), cy = Math.max(bx[1], Math.min(y, bx[3])); if (Math.hypot(cx - x, cy - y) < c[4]) return true; } return false; };
const XCS = [540, 330, 750, 260, 820], BOOK_AT = SPEC_D.book as [number, number];
export const CAP_X: Record<string, number> = {}, CAP_ON_BODY: Record<string, boolean> = {}, CAP_SCALE: Record<string, number> = {};
export const CAP_TOPS: Record<string, number> = (() => { const out: Record<string, number> = {};
  for (const S of SHOTS) { const n = Math.round((S.t1 - S.t0) * FM.FPS), whos = BUILT[S.id], words = CAPS.filter((c) => c.b > S.t0 && c.a < S.t1);
    const lines = Math.max(1, ...words.map((c) => c.text.split("|").length)), cw = Math.max(0, ...words.map((c) => Math.max(...c.text.split("|").map(capWidth)))), sz = Math.round(96 * Math.min(1, 8.9 / Math.max(cw, 0.1))), w = Math.min(1020, cw * 1.194 * sz) + 20, hgt = sz * 1.1 * lines + 12;
    const boxes: [number, number, number, number][] = [], heads: [number, number, number][] = [], caps: number[][] = [], arms: number[][] = [];
    for (let fr = 0; fr < n; fr += 2) for (const wh of whos) { const pl = placeOf(S.id, fr, wh), P = (j: string) => toScreen(pl, jointPx(pl.f, j)), a = P("skull"), b = P("crown"), hr = Math.hypot(b[0] - a[0], b[1] - a[1]) / 2;
      heads.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, hr * 1.1]); if (fr % 6 === 0) { const bc = bodyCaps(pl); caps.push(...bc.slice(ARM_CAPS)); arms.push(...bc.slice(0, ARM_CAPS)); }
      for (const sd of ["L", "R"]) { const u = P("wr" + sd), v = P("tip" + sd), r = handPx(pl) * 0.45; boxes.push([Math.min(u[0], v[0]) - r, Math.min(u[1], v[1]) - r, Math.max(u[0], v[0]) + r, Math.max(u[1], v[1]) + r]); } }
    for (let fr = 0; fr < n; fr += 6) { const q = project(S.id, fr, [BOOK_AT[0], BOOK_AT[1], 0.53]); arms.push([q[0], q[1], q[0], q[1], 110]); }      /* (the book, part of the action) */
    const clear = (top: number, xc: number, bodies = true, k = 1) => { const bx = [xc - (w * k) / 2, top - (lines - 1) * sz * k * 1.1 - 6, xc + (w * k) / 2, top + sz * k * 1.1 + 6];
      if (bx[1] < 0.15 * FM.H || bx[3] > 0.85 * FM.H || bx[0] < 24 || bx[2] > FM.W - 24) return false;
      for (const c of arms) if (boxHitsCap(bx, c)) return false;
      if (bodies) for (const c of caps) if (boxHitsCap(bx, c)) return false;
      for (const h of heads) { const cx = Math.max(bx[0], Math.min(h[0], bx[2])), cy = Math.max(bx[1], Math.min(h[1], bx[3])); if (Math.hypot(cx - h[0], cy - h[1]) < h[2] && bx[3] > h[1] - 0.45 * h[2]) return false; }
      for (const hb of boxes) if (hb[0] < bx[2] && hb[2] > bx[0] && hb[1] < bx[3] && hb[3] > bx[1]) return false;
      return true; };
    let pick: [number, number] | null = null;      /* (clear of bodies, at full size, then smaller; only then over a still torso's coat (the reviewer), noted) */
    for (const bodies of [true, false]) { for (const k of [1, 0.8, 0.65]) { for (const xc of XCS) { const t = TOPS.find((tp) => clear(tp, xc, bodies, k)); if (t !== undefined) { pick = [t, xc]; CAP_SCALE[S.id] = k; break; } } if (pick) break; } if (pick) { CAP_ON_BODY[S.id] = !bodies; break; } }      /* (clear of bodies where it can be, the reviewer: "if it can"; else clear of faces and hands as before, noted) */
    out[S.id] = pick ? pick[0] : -1; CAP_X[S.id] = pick ? pick[1] : 540; void hgt; }
  return out; })();
export const captionAt = (T: number) => { const c = CAPS.find((q) => T >= q.a - 0.03 && T < q.b); if (!c) return null; const sh = SHOTS.find((s) => T >= s.t0 && T < s.t1) ?? SHOTS[SHOTS.length - 1];
  const lines = c.text.split("|"), cw = Math.max(...lines.map(capWidth)), sz = Math.round(96 * Math.min(1, 8.9 / cw) * (CAP_SCALE[sh.id] ?? 1)), w = Math.min(1020, cw * 1.194 * sz), top = (CAP_TOPS[sh.id] ?? 430) - (lines.length - 1) * sz * 1.1;
  const xc = CAP_X[sh.id] ?? 540; return { text: c.text, lines, sz, xc, box: [xc - w / 2, top, xc + w / 2, top + sz * 1.08 * lines.length + (lines.length - 1) * sz * 0.02] as [number, number, number, number] }; };
export const paintCaption = (g: CanvasRenderingContext2D, T: number) => { const c = captionAt(T); if (!c) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = `900 ${c.sz}px 'Arial Black', Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "top"; g.lineJoin = "round";
  g.lineWidth = 18; g.strokeStyle = "#141018"; g.fillStyle = "#fff4c2"; c.lines.forEach((l, i) => { const y = c.box[1] + i * c.sz * 1.1; g.strokeText(l, c.xc, y); g.fillText(l, c.xc, y); }); g.restore(); };
/** the camera on the action, done on the finished picture (the plate and the figures; the words stay still): a short push in at "Hey!"
 *  (2.00-2.22, to 1.05, held to the cut) and, at the fist on the table (15.467, its contact frame), a 4 % punch in with a small shake that dies in
 *  0.25 s, the figures with the plate (the reviewer: scale and move the whole frame, no new plates). In picture pixels about the frame's middle */
export const camFx = (t: number): { s: number; dx: number; dy: number } => {
  const sm = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  if (t >= 1.6 && t < 2.7) return { s: 1 + 0.04 * sm((t - 1.9) / 0.5), dx: 0, dy: 0 };
  // (the slam: a 3 % push over the eight frames up to the contact frame, held to the cut into 10b.
  //  At most about 11 px a frame at the picture's edge: as a jump of 4 % on the contact frame it changed 67000 px at once, flicker2 on test 2)
  const HIT = 464 / FM.FPS, A = HIT - 8 / FM.FPS;      /* (eight frames: in four, the eyes near the picture's edge flickered, test 7) */
  if (t >= A && t < HIT) return { s: 1 + 0.03 * sm((t - A) / (HIT - A)), dx: 0, dy: 0 };
  if (t >= HIT && t < 469 / FM.FPS) return { s: 1.03, dx: 0, dy: 0 };
  // (15a, the vote's insert: the same push onto the fists' thud on frame 696, held to the cut: the table jolts with the blow (the reviewer: something
  //  happens at the thud); the props are one still plate, so the picture itself moves)
  const V = 690 / FM.FPS, V0 = V - 8 / FM.FPS; if (t >= V0 && t < V) return { s: 1 + 0.025 * sm((t - V0) / (V - V0)), dx: 0, dy: 0 }; if (t >= V && t < 23.5) return { s: 1.025, dx: 0, dy: 0 };      // (held to the cut: a shake or a push back out is a move out and back, and flicker2 failed it at every frame, 20000 px at the contact frame on test 4)
  return { s: 1, dx: 0, dy: 0 }; };
// (the loop: a hard cut from the last frame to the first, on a matching picture (15 is shot 1's camera); the seam is a cut like the others (the cloud session, 25 Nov: a dissolve reads as an end))
export const Dinner3D: React.FC<{ muted?: boolean; plant?: string }> = ({ muted = false, plant }) => {
  if (plant === "beardHoles") BEARD_PLANT.holes = true; else if (plant) (PLANT as Record<string, boolean>)[plant] = true;      // (a planted fault for a proof still only: PROPS='{"plant":"frontArm"}')
  const t = useCurrentFrame() / FM.FPS, { s, fr } = shotAtD(t), pf = s.static ? 0 : fr, fx = camFx(t);
  return <AbsoluteFill style={{ background: "#1a1210" }}>
    <AbsoluteFill style={{ transform: `translate(${fx.dx}px, ${fx.dy}px) scale(${fx.s})`, transformOrigin: "50% 50%" }}>
      <Img src={staticFile(`din3d/${s.id}/${String(pf + 1).padStart(4, "0")}.jpg`)} style={{ width: FM.W, height: FM.H }} />
      <AbsoluteFill><canvas width={FM.W} height={FM.H} ref={(cv) => { if (cv) { const g = cv.getContext("2d")!; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, FM.W, FM.H); paintFigures(g, s.id, fr, BUILT[s.id], EXTRAS[s.id]); } }} /></AbsoluteFill>
    </AbsoluteFill>
    <AbsoluteFill><canvas width={FM.W} height={FM.H} ref={(cv) => { if (cv) { const g = cv.getContext("2d")!; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, FM.W, FM.H); paintCaption(g, t); } }} /></AbsoluteFill>
    {muted ? null : <Audio src={staticFile("craft/dinner3d.wav")} />}
  </AbsoluteFill>; };

// The Short "The captain's dinner": each frame the Blender plate (public/din3d/<shot>/NNNN.jpg; a held camera has one plate) and over it the
// flat Knopp figures (core.ts, figures.ts) and the words. Sound: craft/dinner3d.wav (audio/dinner3d_audio.py).
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from "remotion";
import { FM } from "../clips/clipKit";
import { capWidth } from "../stage/film";
import { BEARD_PLANT, tricornTrim, kitOf } from "../wardrobe/kit";
import { scaleOf, footY } from "../clips/clipKit";
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
/** v6c: a head as the words must keep clear of it: its circle with the bandana or hair and its ink (1.1 of its radius, the head's outline 126-132 of 130), the captain's tricorn too (a
 *  second circle over his crown); circles [x, y, r] in the picture */
export const headZones = (nm: string, x: number, y: number, hr: number): [number, number, number][] => nm === "captain" ? [[x, y, hr * 1.1], [x, y - hr * 0.75, hr * 1.2]] : [[x, y, hr * 1.1]];
export const boxHitsCap = (bx: number[], c: number[]) => { for (let k = 0; k <= 12; k++) { const x = c[0] + ((c[2] - c[0]) * k) / 12, y = c[1] + ((c[3] - c[1]) * k) / 12, cx = Math.max(bx[0], Math.min(x, bx[2])), cy = Math.max(bx[1], Math.min(y, bx[3])); if (Math.hypot(cx - x, cy - y) < c[4]) return true; } return false; };
const XCS = [540, 330, 750, 260, 820, 210, 870],      /* (v6c: further out to the sides, clear of a whole head) */ BOOK_AT = SPEC_D.book as [number, number];
export const CAP_X: Record<string, number> = {}, CAP_ON_BODY: Record<string, boolean> = {}, CAP_SCALE: Record<string, number> = {};
export const CAP_TOPS: Record<string, number> = (() => { const out: Record<string, number> = {};
  for (const S of SHOTS) { const n = Math.round((S.t1 - S.t0) * FM.FPS), whos = BUILT[S.id], words = CAPS.filter((c) => c.b > S.t0 && c.a < S.t1);
    const lines = Math.max(1, ...words.map((c) => c.text.split("|").length)), cw = Math.max(0, ...words.map((c) => Math.max(...c.text.split("|").map(capWidth)))), sz = Math.round(96 * Math.min(1, 8.9 / Math.max(cw, 0.1))), w = Math.min(1020, cw * 1.194 * sz) + 20, hgt = sz * 1.1 * lines + 12;
    const boxes: [number, number, number, number][] = [], heads: [number, number, number][] = [], caps: number[][] = [], arms: number[][] = [];
    for (let fr = 0; fr < n; fr += 2) for (const wh of whos) { const pl = placeOf(S.id, fr, wh), P = (j: string) => toScreen(pl, jointPx(pl.f, j)), a = P("skull"), b = P("crown"), hr = Math.hypot(b[0] - a[0], b[1] - a[1]) / 2;
      heads.push(...headZones(wh.name, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, hr)); if (fr % 6 === 0) { const bc = bodyCaps(pl); caps.push(...bc.slice(ARM_CAPS)); arms.push(...bc.slice(0, ARM_CAPS)); }
      for (const sd of ["L", "R"]) { const u = P("wr" + sd), v = P("tip" + sd), r = handPx(pl) * 0.45; boxes.push([Math.min(u[0], v[0]) - r, Math.min(u[1], v[1]) - r, Math.max(u[0], v[0]) + r, Math.max(u[1], v[1]) + r]); } }
    for (let fr = 0; fr < n; fr += 6) { const q = project(S.id, fr, [BOOK_AT[0], BOOK_AT[1], 0.53]); arms.push([q[0], q[1], q[0], q[1], 110]); }      /* (the book, part of the action) */
    const clear = (top: number, xc: number, bodies = true, k = 1) => { const bx = [xc - (w * k) / 2, top - (lines - 1) * sz * k * 1.1 - 6, xc + (w * k) / 2, top + sz * k * 1.1 + 6];
      const dbg = (why: string) => { if (typeof process !== "undefined" && process.env?.DEBUGCAP === S.id) { const g = globalThis as unknown as { CAPWHY?: Record<string, number> }; (g.CAPWHY ??= {})[why] = (g.CAPWHY[why] ?? 0) + 1; } return false; };
      if (bx[1] < 0.15 * FM.H || bx[3] > 0.85 * FM.H || bx[0] < 24 || bx[2] > FM.W - 24) return dbg("band");
      for (const c of arms) if (boxHitsCap(bx, c)) return dbg("arm");
      if (bodies) for (const c of caps) if (boxHitsCap(bx, c)) return dbg("body");
      for (const h of heads) { const cx = Math.max(bx[0], Math.min(h[0], bx[2])), cy = Math.max(bx[1], Math.min(h[1], bx[3])); if (Math.hypot(cx - h[0], cy - h[1]) < h[2]) return dbg("head"); }      /* (v6c: clear of the whole head, its bandana, hair and hat: lying over its top it covered the sailor's bandana in shot 4) */
      for (const hb of boxes) if (hb[0] < bx[2] && hb[2] > bx[0] && hb[1] < bx[3] && hb[3] > bx[1]) return dbg("hand");
      return true; };
    let pick: [number, number] | null = null;      /* (clear of bodies, at full size, then smaller; only then over a still torso's coat (the reviewer), noted) */
    for (const bodies of [true, false]) { for (const k of [1, 0.8, 0.65, 0.55]) { for (const xc of XCS) { const t = TOPS.find((tp) => clear(tp, xc, bodies, k)); if (t !== undefined) { pick = [t, xc]; CAP_SCALE[S.id] = k; break; } } if (pick) break; } if (pick) { CAP_ON_BODY[S.id] = !bodies; break; } }      /* (clear of bodies where it can be, the reviewer: "if it can"; else clear of faces and hands as before, noted) */
    out[S.id] = pick ? pick[0] : -1; CAP_X[S.id] = pick ? pick[1] : 540; void hgt; if (typeof process !== "undefined" && process.env?.DEBUGCAP === S.id) console.log("CAPWHY", S.id, JSON.stringify((globalThis as unknown as { CAPWHY?: Record<string, number> }).CAPWHY)); }
  return out; })();
/** v6c, 10b (the cloud session's yes on 27 Nov, a named exception to rule 6 for 10b alone): the close-up has no free place, so its words lie on
 *  the captain's hat, on its crown only: inside the hat's outline with that outline seen round them (CROWN.edge), above the gold trim along the
 *  brim (CROWN.brim), and CROWN.face px or more from his face. For one frame: the hat in the picture (the push camFx applied: the words do not
 *  move with it) and a box's distances to the hat's edge (inside: +), to the trim (above it: +) and to the face */
export const CROWN = { edge: 16, brim: 16, face: 20 };
/** a point of the head's own frame in skeleton units, as the head draws it (at the skull joint, turned by headTilt, mirrored when the face turns left;
 *  the film's own copy: film code never imports the checks' code, limb_check's guard) */
const headPt = (sk: { faceYaw: number; headTilt: number; j: { skull: unknown } }, p: [number, number]): [number, number] => { const R = Math.PI / 180, sn = Math.sin(sk.faceYaw * R), as = Math.abs(sn), view = as < 0.45 ? "front" : as < 0.85 ? "q" : "side", fx = view !== "front" && sn < 0 ? -p[0] : p[0];
  const c = Math.cos(sk.headTilt * R), s2 = Math.sin(sk.headTilt * R), o = sk.j.skull as [number, number]; return [o[0] + fx * c - p[1] * s2, o[1] + fx * s2 + p[1] * c]; };
const dSeg = (p: number[], a: number[], b: number[]) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy || 1, u = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L)); return Math.hypot(p[0] - a[0] - u * dx, p[1] - a[1] - u * dy); };
const inPg = (pt: number[], P: number[][]) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) if ((P[i][1] > pt[1]) !== (P[j][1] > pt[1]) && pt[0] < ((P[j][0] - P[i][0]) * (pt[1] - P[i][1])) / (P[j][1] - P[i][1]) + P[i][0]) c = !c; return c; };
export const hatAt = (id: string, fr: number) => { const cap = BUILT[id]?.find((w) => w.name === "captain"); if (!cap) return null; const pl = placeOf(id, fr, cap), f = pl.f, sk = f.sk, kit = kitOf(f.o.look); if (kit?.hat !== "tricorn") return null;
  const sh = SHOTS.find((q) => q.id === id)!, cf = camFx(sh.t0 + fr / FM.FPS), sc = scaleOf(f.who), as = Math.abs(Math.sin((sk.faceYaw * Math.PI) / 180)), fwd = as < 0.45 ? 0 : as < 0.85 ? 0.7 : 1, t = tricornTrim(fwd);
  const scr = (q: [number, number]) => { const p = headPt(sk, q), v = toScreen(pl, [f.x + p[0] * sc, footY(f.who) + p[1] * sc]); return [(v[0] - FM.W / 2) * cf.s + FM.W / 2 + cf.dx, (v[1] - FM.H / 2) * cf.s + FM.H / 2 + cf.dy]; };
  const hull = t.hull.map(scr), trim = t.trim.map((r) => r.map(scr)), head = Array.from({ length: 60 }, (_, i) => scr([126 * Math.cos((i / 60) * 2 * Math.PI), -128 + 132 * Math.sin((i / 60) * 2 * Math.PI)]));
  const face = head.filter((q) => !inPg(q, hull)), u = Math.hypot(...[0, 1].map((k) => scr([100, -128])[k] - scr([0, -128])[k])) / 100;
  return { hull, trim, face, unit: u }; };
/** a box [x0, y0, x1, y1] against the hat of one frame: edge (least distance inside the hat's outline, negative outside), brim (the box's bottom
 *  above the trim, least over its width; negative: on or under it), face (least distance to the face's outline below the hat) */
export const crownGaps = (H: NonNullable<ReturnType<typeof hatAt>>, b: number[]) => { const pts: number[][] = []; for (let i = 0; i <= 12; i++) { const x = b[0] + ((b[2] - b[0]) * i) / 12, y = b[1] + ((b[3] - b[1]) * i) / 12; pts.push([x, b[1]], [x, b[3]], [b[0], y], [b[2], y]); }
  let edge = 1e9; for (const p of pts) { let d = 1e9; for (let i = 0; i < H.hull.length; i++) d = Math.min(d, dSeg(p, H.hull[i], H.hull[(i + 1) % H.hull.length])); edge = Math.min(edge, inPg(p, H.hull) ? d : -d); }
  let brim = 1e9; for (const r of H.trim) for (let i = 0; i + 1 < r.length; i++) { const a = r[i], c = r[i + 1]; for (let k = 0; k <= 4; k++) { const x = a[0] + ((c[0] - a[0]) * k) / 4, y = a[1] + ((c[1] - a[1]) * k) / 4;
    const half = 7 * H.unit; if (x >= b[0] - half && x <= b[2] + half) brim = Math.min(brim, y - half - b[3]); else brim = Math.min(brim, Math.hypot(Math.max(b[0] - x, 0, x - b[2]), Math.max(b[1] - y, 0, y - b[3])) - half); } }
  let face = 1e9; for (const q of H.face) face = Math.min(face, Math.hypot(Math.max(b[0] - q[0], 0, q[0] - b[2]), Math.max(b[1] - q[1], 0, q[1] - b[3])));
  return { edge, brim, face }; };
/** 10b's words: the largest size and the place on the crown where the box keeps CROWN's distances in every frame of the shot (null: none) */
let CROWN_PICK: { xc: number; top: number; k: number; gaps: { edge: number; brim: number; face: number } } | null | undefined;
export const crownPick = () => { if (CROWN_PICK !== undefined) return CROWN_PICK; CROWN_PICK = null; const S = SHOTS.find((q) => q.id === "10b"); if (!S) return null;
  const n = Math.round((S.t1 - S.t0) * FM.FPS), Hs = Array.from({ length: n }, (_, fr) => hatAt("10b", fr)); if (Hs.some((h) => !h)) return null;
  const words = CAPS.filter((c) => c.b > S.t0 && c.a < S.t1), lines = Math.max(1, ...words.map((c) => c.text.split("|").length)), cw = Math.max(0.1, ...words.map((c) => Math.max(...c.text.split("|").map(capWidth)))), sz = Math.round(96 * Math.min(1, 8.9 / cw)), w = Math.min(1020, cw * 1.194 * sz);
  for (const k of [1, 0.9, 0.8, 0.7, 0.6, 0.5]) { let best: typeof CROWN_PICK = null;
    for (let xc = 120; xc <= 960; xc += 10) for (let top = Math.round(0.15 * FM.H); top <= Math.round(0.85 * FM.H); top += 6) { const t0 = top - (lines - 1) * sz * k * 1.1, bx = [xc - (w * k) / 2 - 10, t0 - 10, xc + (w * k) / 2 + 10, t0 + sz * k * 1.08 * lines + 10];      // (the words' box with their 9 px stroke)
      if (bx[1] < 0.15 * FM.H || bx[3] > 0.85 * FM.H || bx[0] < 24 || bx[2] > FM.W - 24) continue;
      let m = { edge: 1e9, brim: 1e9, face: 1e9 }, ok = true; for (const H of Hs) { const g = crownGaps(H!, bx); m = { edge: Math.min(m.edge, g.edge), brim: Math.min(m.brim, g.brim), face: Math.min(m.face, g.face) }; if (g.edge < CROWN.edge || g.brim < CROWN.brim || g.face < CROWN.face) { ok = false; break; } }
      if (ok && (!best || Math.min(m.edge, m.brim) > Math.min(best.gaps.edge, best.gaps.brim))) best = { xc, top, k, gaps: m }; }
    if (best) { CROWN_PICK = best; break; } }
  return CROWN_PICK; };
export const captionAt = (T: number) => { const c = CAPS.find((q) => T >= q.a - 0.03 && T < q.b); if (!c) return null; const sh = SHOTS.find((s) => T >= s.t0 && T < s.t1) ?? SHOTS[SHOTS.length - 1];
  const cp = sh.id === "10b" ? crownPick() : null, lines = c.text.split("|"), cw = Math.max(...lines.map(capWidth)), sz = Math.round(96 * Math.min(1, 8.9 / cw) * (cp ? cp.k : CAP_SCALE[sh.id] ?? 1)), w = Math.min(1020, cw * 1.194 * sz), top = (cp ? cp.top : CAP_TOPS[sh.id] ?? 430) - (lines.length - 1) * sz * 1.1;
  const xc = cp ? cp.xc : CAP_X[sh.id] ?? 540; return { text: c.text, lines, sz, xc, box: [xc - w / 2, top, xc + w / 2, top + sz * 1.08 * lines.length + (lines.length - 1) * sz * 0.02] as [number, number, number, number] }; };
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
  const V = 690 / FM.FPS, V0 = V - 8 / FM.FPS; if (t >= V0 && t < V) return { s: 1 + 0.025 * sm((t - V0) / (V - V0)), dx: 0, dy: 0 }; if (t >= V && t < 23.1) return { s: 1.025, dx: 0, dy: 0 };      // (held to the cut: a shake or a push back out is a move out and back, and flicker2 failed it at every frame, 20000 px at the contact frame on test 4)
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

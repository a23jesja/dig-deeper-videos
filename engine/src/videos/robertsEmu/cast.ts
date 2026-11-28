// Roberts' bedtime (Emu look): the cast's outfits, the props in toon style (drawn in a figure's 600 x 1000 design space at its hands), the crowd
// placed on the open deck clear of every barrel, crate, the mast, the hatch and the bell post (set.py), and the voice's words.
import { Pen, INK, GOLD, type Outfit } from "../emu/toon";
import type { P2, Actor, Word } from "./engine";
import TL from "../../../voice/roberts/timeline.json";
import N1 from "../../../voice/roberts/n1/pick.json";
import N2 from "../../../voice/roberts/n2/pick.json";
import D3 from "../../../voice/roberts/d3/pick.json";
import N4 from "../../../voice/roberts/n4/pick.json";
import N5 from "../../../voice/roberts/n5/pick.json";
import N6 from "../../../voice/roberts/n6/pick.json";
import N7 from "../../../voice/roberts/n7/pick.json";
import N8 from "../../../voice/roberts/n8/pick.json";
import D9 from "../../../voice/roberts/d9/pick.json";
import N10 from "../../../voice/roberts/n10/pick.json";
import N11 from "../../../voice/roberts/n11/pick.json";
import N12 from "../../../voice/roberts/n12/pick.json";
import W13 from "../../../voice/roberts/w13/pick.json";
import N14 from "../../../voice/roberts/n14/pick.json";
import N15 from "../../../voice/roberts/n15/pick.json";

export const ROBERTS: Outfit = { jacket: "#a8262c", pants: "#2c2630", boots: "#1d1a20", hat: "tricorn", buttons: "#e9b93a", sash: "#1d1a20", moustache: "#3a2416" };
export const RUM: Outfit = { jacket: "#efe6d4", pants: "#5a4a3a", boots: "#2a2220", hat: "bandana", cap: "#c42a2e", belt: "#3a2a20", beard: "#c0662c", build: "stout" };
export const YOUNG: Outfit = { jacket: "#4f76b4", pants: "#7a6a50", boots: "#3a2a20", hat: "hair", hair: "#e0b24a", build: "kid" };
export const GUNNER: Outfit = { jacket: "#4f7a4a", pants: "#4a4038", boots: "#2a2220", hat: null, build: "stout", moustache: "#3a2a20" };
const JACKETS = ["#c9b27a", "#6a4a8a", "#d8d0c0", "#9a5a2a", "#3f6f8f", "#b04a3a", "#7a7a4a", "#5a3a2a"], CAPS = ["#2a4f9a", "#2f7a4a", "#c42a2e", "#d9a441", "#6a2a6a"];
const HAIR = ["#3a2a1a", "#1a1410", "#8a5a2a", "#c9a24a"], BEARDS = ["#3a2a1a", "#8a4a20", "#1a1410"];
/** a crew member (seeded): a bandana or bare hair, sometimes a beard or moustache, a jacket colour */
export const crew = (i: number): Outfit => { const r = (k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
  const o: Outfit = { jacket: JACKETS[Math.floor(r(1) * JACKETS.length)], pants: ["#3d4440", "#4a3a2a", "#3b3f52"][Math.floor(r(2) * 3)], boots: "#2a2220", build: r(3) < 0.3 ? "stout" : "adult" };
  if (r(4) < 0.55) { o.hat = "bandana"; o.cap = CAPS[Math.floor(r(5) * CAPS.length)]; } else { o.hat = "hair"; o.hair = HAIR[Math.floor(r(6) * HAIR.length)]; }
  if (r(7) < 0.3) o.beard = BEARDS[Math.floor(r(8) * BEARDS.length)]; else if (r(7) < 0.6) o.moustache = BEARDS[Math.floor(r(9) * BEARDS.length)];
  return o; };
export const rnd = (i: number, k: number) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };

// ---- the deck's solid things (set.py): nobody stands in them ----
const ROUND: [number, number, number][] = [[-3.2, 1.6, 0.42], [-3.7, 1.2, 0.42], [-0.34, -1.74, 0.42], [-2.6, 1.75, 0.38], [4.6, -1.6, 0.42], [0.6, 0.2, 0.3], [2.26, -1.14, 0.2]];
const BOXES: [number, number, number, number][] = [[3.2, 4.0, 1.3, 2.1], [-5.4, -4.6, 1.1, 1.9], [-2.3, -1.1, -0.6, 0.5]];
export const clearOfThings = (x: number, y: number, r = 0.22) => x > -5.7 && x < 5.7 && y > -1.95 && y < 1.95 && ROUND.every(([cx, cy, cr]) => Math.hypot(x - cx, y - cy) > cr + r) && BOXES.every(([x0, x1, y0, y1]) => x < x0 - r || x > x1 + r || y < y0 - r || y > y1 + r);
/** n crew places in a deck region, each clear of the things and of each other (0.5 m) */
export const crowdPlaces = (n: number, x0: number, x1: number, y0: number, y1: number, seed = 1, keep: [number, number][] = []): [number, number][] => {
  const out: [number, number][] = []; for (let k = 0; k < 4000 && out.length < n; k++) { const x = x0 + (x1 - x0) * rnd(seed + k, 1), y = y0 + (y1 - y0) * rnd(seed + k, 2);
    if (clearOfThings(x, y) && [...out, ...keep].every(([a, b]) => Math.hypot(a - x, b - y) > 0.5)) out.push([x, y]); } return out; };

// ---- props, in the holder's design space (u: about 1 per 100th of a head's width; a head is about 236 wide) ----
const PEWTER = "#a8aeb2", PEWTER_IN = "#3e4246", GLASS = "#2f6a42";
/** a pewter mug held at h (the hand on its side), tilted by a degrees; full shows the rum; glint a moonlit spark */
export const mug = (p: Pen, h: P2, a = 0, full = true, glint = 0) => { const g = p.g; g.save(); g.translate(h[0], h[1] - 18); g.rotate((a * Math.PI) / 180);
  p.poly([[34, -30], [58, -26], [62, 6], [52, 22], [34, 18], [34, 8], [48, 8], [50, -12], [34, -16]], PEWTER, 6);      // (the handle)
  p.poly([[-36, -46], [36, -46], [34, 40], [-34, 40]], PEWTER, 7); p.ell(0, -46, 36, 11, full ? "#7a3a12" : PEWTER_IN, 6);
  p.stroke([[-24, -30], [-24, 28]], 6, "#dfe3e6");
  if (glint > 0) { g.globalAlpha = glint; p.ell(-20, -40, 9, 9, "#f6f2d8", 0); p.stroke([[-20, -60], [-20, -20]], 3, "#f6f2d8"); p.stroke([[-40, -40], [0, -40]], 3, "#f6f2d8"); g.globalAlpha = 1; }
  g.restore(); };
/** a rum bottle from its base at h, its neck along the angle a (degrees; 0 = straight up) */
export const bottle = (p: Pen, h: P2, a = 0) => { const g = p.g; g.save(); g.translate(h[0], h[1]); g.rotate((a * Math.PI) / 180);
  p.poly([[-24, 10], [24, 10], [24, -70], [10, -92], [10, -130], [14, -134], [14, -142], [-14, -142], [-14, -134], [-10, -130], [-10, -92], [-24, -70]], GLASS, 6);
  p.stroke([[-12, 0], [-12, -66]], 6, "#7fb28c"); g.restore(); };
/** Roberts' teacup on its saucer, held at h */
export const teacup = (p: Pen, h: P2, steam = 0) => { const g = p.g; g.save(); g.translate(h[0], h[1] - 10);
  p.ell(0, 6, 46, 10, "#f2efe6", 5); p.poly([[-26, -30], [26, -30], [18, 4], [-18, 4]], "#f2efe6", 5); p.ell(0, -30, 26, 7, "#7a4a2a", 4);
  p.poly([[26, -22], [38, -20], [36, -6], [22, -6], [24, -12], [30, -12], [30, -16], [25, -16]], "#f2efe6", 4); p.stroke([[-22, -24], [22, -24]], 4, "#c42a2e");
  if (steam > 0) { g.globalAlpha = steam; for (const dx of [-10, 6]) p.stroke([[dx, -42], [dx + 8, -60], [dx - 4, -78], [dx + 6, -96]], 5, "#eef2f6"); g.globalAlpha = 1; }
  g.restore(); };
/** a gold pocket watch on its chain, held at h */
export const watch = (p: Pen, h: P2) => { p.ell(h[0], h[1] - 12, 22, 22, GOLD, 5); p.ell(h[0], h[1] - 12, 15, 15, "#fbf6e6", 3); p.stroke([[h[0], h[1] - 12], [h[0], h[1] - 24]], 3, INK); p.stroke([[h[0], h[1] - 12], [h[0] + 9, h[1] - 12]], 3, INK); };
/** a fiddle under the chin and its bow (a crew member playing) */
export const fiddle = (p: Pen, hL: P2, hR: P2, t: number) => { p.poly([[hL[0] - 10, hL[1] - 70], [hL[0] + 60, hL[1] - 110], [hL[0] + 80, hL[1] - 80], [hL[0] + 10, hL[1] - 40]], "#8a4a1a", 5);
  const b = Math.sin(t * 14) * 30; p.stroke([[hR[0] - 70 + b, hR[1] - 40], [hR[0] + 50 + b, hR[1] - 90]], 4, "#d8c8a0"); };

// ---- the voice: each line's words on the timeline (whisper's "o" + "'clock" joined) ----
const PICKS: Record<string, { words: Word[] }> = { n1: N1, n2: N2, d3: D3, n4: N4, n5: N5, n6: N6, n7: N7, n8: N8, d9: D9, n10: N10, n11: N11, n12: N12, w13: W13, n14: N14, n15: N15 } as never;
const joinApos = (ws: Word[]) => ws.reduce<Word[]>((o, w) => { const L = o[o.length - 1]; if (L && /^['’]/.test(w.w)) o[o.length - 1] = { w: L.w + w.w, a: L.a, b: w.b }; else o.push({ ...w }); return o; }, []);
export const VOICE = (TL as { voices: { id: string; start: number }[] }).voices.map((v) => ({ id: v.id, at: v.start, words: joinApos(PICKS[v.id].words) }));
export const WORDS: Word[] = VOICE.flatMap((v) => v.words.map((w, i, ws) => ({ w: w.w, a: w.a + v.at, b: Math.min(w.b + v.at + 0.25, (ws[i + 1]?.a ?? w.b + 0.4) + v.at) })));
/** a speaker's mouth (0-1) at film time T: open while one of their words is spoken */
export const talkOf = (ids: string[], T: number) => { for (const v of VOICE) if (ids.includes(v.id)) for (const w of v.words) { const a = w.a + v.at, b = w.b + v.at; if (T >= a && T < b) return 0.35 + 0.65 * Math.abs(Math.sin((T - a) * 16)); } return 0; };
export type { Actor };

/** a teapot held at h, tipped by a degrees (pouring from its spout to the left of the hand) */
export const teapot = (p: Pen, h: P2, a = 0) => { const g = p.g; g.save(); g.translate(h[0], h[1] - 20); g.rotate((a * Math.PI) / 180); g.scale(0.62, 0.62);
  p.poly([[-66, -10], [-96, -40], [-104, -36], [-74, 6]], "#f2efe6", 5); p.ell(0, 0, 56, 46, "#f2efe6", 6); p.ell(0, -46, 30, 9, "#f2efe6", 5); p.ell(0, -56, 9, 7, "#c42a2e", 4);
  p.arc(58, 0, 24, 28, -80, 80, 7, "#f2efe6"); p.stroke([[-40, 8], [40, 8]], 5, "#c42a2e"); g.restore(); };
/** the articles: a parchment unrolled to u (0-1) between two rolls, its title and lines; (cx, cy) its middle, w its width in px */
export const articles = (g: CanvasRenderingContext2D, cx: number, cy: number, w: number, u: number, mark: number) => { const hw = (w / 2) * Math.max(0.04, u), h = w * 1.25;
  g.save(); g.fillStyle = "#efdcae"; g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.rect(cx - hw, cy - h / 2, 2 * hw, h); g.fill(); g.stroke();
  for (const sx of [-1, 1]) { g.fillStyle = "#d9c08a"; g.beginPath(); g.ellipse(cx + sx * hw, cy, 26, h / 2 + 18, 0, 0, 7); g.fill(); g.stroke(); }
  if (u > 0.55) { g.globalAlpha = Math.min(1, (u - 0.55) / 0.3); g.fillStyle = "#3a2414"; g.textAlign = "center"; g.font = `900 ${Math.round(w * 0.12)}px Georgia, serif`; g.fillText("ARTICLES", cx, cy - h * 0.32);
    g.font = `700 ${Math.round(w * 0.06)}px Georgia, serif`; ["I. Every man a vote", "II. Fair shares of prize", "III. No gaming for money"].forEach((l, i) => g.fillText(l, cx, cy - h * 0.16 + i * w * 0.1));
    g.fillStyle = "#8a1a1a"; g.font = `900 ${Math.round(w * 0.058)}px Georgia, serif`; g.fillText("IV. LIGHTS OUT AT EIGHT", cx, cy + h * 0.2);
    if (mark > 0) { g.strokeStyle = "#c42a2e"; g.lineWidth = 9; g.globalAlpha = mark; g.beginPath(); g.ellipse(cx, cy + h * 0.18, w * 0.47, w * 0.09, 0, 0, 7); g.stroke(); } }
  g.restore(); };
/** the 1724 book (Johnson, A General History of the Pyrates) lying on the deck at (cx, cy), its cover open by u, pages fluttering */
export const book = (g: CanvasRenderingContext2D, cx: number, cy: number, w: number, open: number, t: number) => { g.save(); g.translate(cx, cy); g.lineWidth = 9; g.strokeStyle = INK;
  g.fillStyle = "#5a2a1a"; g.beginPath(); g.rect(-w / 2, -w * 0.33, w, w * 0.66); g.fill(); g.stroke();
  g.fillStyle = "#f1e6c8"; for (let i = 0; i < 4; i++) { const f = Math.sin(t * 18 + i * 1.3) * 0.5 + 0.5, x = -w * 0.02 - f * w * 0.42 * open; g.beginPath(); g.moveTo(0, -w * 0.3); g.quadraticCurveTo(x, -w * 0.36 - 10 * f, x, -w * 0.3); g.lineTo(x, w * 0.3); g.quadraticCurveTo(x / 2, w * 0.36, 0, w * 0.3); g.closePath(); g.fill(); g.stroke(); }
  g.fillStyle = "#e9b93a"; g.textAlign = "center"; g.font = `900 ${Math.round(w * 0.075)}px Georgia, serif`; g.fillText("A GENERAL HISTORY", w * 0.24, -w * 0.08); g.fillText("OF THE PYRATES", w * 0.24, w * 0.02); g.font = `900 ${Math.round(w * 0.1)}px Georgia, serif`; g.fillText("1724", w * 0.24, w * 0.18);
  g.restore(); };
/** an hourglass held at h, turned by a degrees, its sand running by s (0-1) */
export const hourglass = (p: Pen, h: P2, a: number, s: number) => { const g = p.g; g.save(); g.translate(h[0], h[1] - 40); g.rotate((a * Math.PI) / 180);
  p.poly([[-40, -66], [40, -66], [40, -56], [-40, -56]], "#7a4a22", 5); p.poly([[-40, 56], [40, 56], [40, 66], [-40, 66]], "#7a4a22", 5);
  p.poly([[-32, -56], [32, -56], [4, 0], [32, 56], [-32, 56], [-4, 0]], "#cfe4f0", 5);
  const top = 1 - s; p.poly([[-26 * top, -6 - 40 * top], [26 * top, -6 - 40 * top], [3, -4], [-3, -4]], "#e0b04a", 0); p.poly([[-30, 52], [30, 52], [26 * s, 52 - 40 * s], [-26 * s, 52 - 40 * s]], "#e0b04a", 0);
  g.restore(); };

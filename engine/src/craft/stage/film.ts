// A film as data: shots with a camera, the cast of each shot played from the motion library, and the things they hold. One stage
// (Stage.tsx) plays any film in any world of the kit, so a Short is a script of shots and never its own engine.
// Time: T = seconds from the start of the film, t = seconds from the start of the shot.
import type { CardLight } from "../world/kit";
import type * as THREE from "three";
import type { Design, FigOpts } from "../designs/common";
import type { Pose, Props, Joint } from "../rig";
import { Mover, blink, mouthAt } from "../motion";

export type V3 = [number, number, number];
export type Cam = { pos: V3; look: V3; fov: number };
/** one figure on one frame: where its soles are, the way it faces (0 = toward +z, 90 = toward +x), its height, pose and face */
export type Actor = { name: string; D: Design; at: V3; heading: number; h: number; pose: Pose; o: FigOpts;
  /** for each foot that is down: where the body stood (on the ground) when it was put down (people.ts plantFix keeps the foot still in
   *  the picture from then on) */
  land?: { L?: V3 | null; R?: V3 | null };
  /** a figure thrown through the air: `at` is then the middle of its body and it is turned this many degrees in the picture */
  spin?: number;
  /** true = the figure takes no shade from the others in the shot (a shadow that would lie on it as a blot) */
  noShade?: boolean };
/** a figure placed in the world on this frame: where its joints are, so that real things can be put in its hands */
export type Staged = Actor & { joint: (j: Joint) => V3; mesh: THREE.Mesh;
  /** where a place the drawing noted is in the world ("eyeA", "eyeB": the eyes); how the shot sees the cards (for the fingers layer) */
  mark?: (name: string) => V3 | null; val?: (name: string) => number | null; seen?: { fov: number; toSun?: THREE.Vector3 } };
export type Word = { w: string; a: number; b: number; line?: string };
export type Shot = {
  id: string; a: number; b: number;
  /** the moment of the shot that stands for it in the sketch (seconds into the shot) */
  still?: number;
  /** the shot begins a new scene for these figures (by name: another place or another time), so what they held in their last shot need
   *  not be in their hands here; the reason is said. Without it, a figure keeps what it held from its last shot in the same hands
   *  (grips.ts auditGrips, the continuity between shots: the independent review of gladiators v5) */
  newScene?: Record<string, string>;
  /** where a figure looks in this shot (by name): a point, from and to (seconds into the shot); motionCheck.ts holds his head to it
   *  within 25 degrees (the shot library review: a man pointing at a window looked at the lens) */
  look?: Record<string, { at: V3; from?: number; to?: number; what?: string }>;
  /** figures this shot shows from behind on purpose (walking away), with the reason: motionCheck.ts bars a head drawn past 60 degrees otherwise */
  away?: Record<string, string>;
  cam: (t: number, u: number) => Cam;
  /** the middle and half the size of the area that gets sharp shadows; default: 9 m round what the camera looks at */
  sun?: { target: V3; reach: number };
  /** the scene's light on the figures in this shot (kit.CardLight), instead of the film's */
  light?: CardLight;
  /** which of a figure's own eyes wears the eye patch in this shot, as the script says ("A" his right, "B" his left): motionCheck fails a
   *  shot where the patch is drawn on the other one */
  patchEye?: Record<string, "A" | "B">;
  /** a figure framed close on purpose (a close-up on his face): the edge test then holds only his head whole in the picture, and lets his
   *  body go past the edge. The value says why */
  closeUp?: Record<string, string>;
  /** a cut into this shot to nearly the same picture on purpose (a match cut), and why: the jump cut test lets it pass */
  matchCut?: string;
  /** named things of the world that are not there in this shot (the world lists them in userData.named) */
  hide?: string[];
  cast: (t: number, T: number) => Actor[];
  /** real things that move in this shot (in hands, falling, rolling): add them to `into` */
  things?: (into: THREE.Group, cast: Record<string, Staged>, t: number, T: number, cam: Cam) => void;
  /** the sounds of what happens in this shot, and what lies under it: times in seconds into the shot */
  sounds?: Sound[]; beds?: Bed[];
  /** where this shot's captions stand, in pixels from the picture's top (CAP_TOP when left out): above or below the figures, so that
   *  no line lies over a face, a chest, hands or what they are doing (the review of gladiators v4); the film check reads it */
  capsTop?: number;
};
/** a sound on the picture: what kind (audio/craft_sfx.py makes it), when, how loud (1 = its normal level), where from left (-1) to right (1) */
export type Sound = { t: number; k: string; g?: number; p?: number; dur?: number; big?: number; run?: boolean; surface?: string };
/** a sound that lies under a stretch of the film (the sea, wind, flies) */
export type Bed = { k: string; a: number; b: number; g?: number };
/** a thumbnail proposal (1280 x 720): one moment of the film, a camera of its own, a few big words on one side of the picture */
/** a thumbnail proposal of a Short (1080 x 1920): the film's own frame at the time T, so that the same picture can be chosen as a frame
 *  in the app, with two or three huge words laid over it. y = where the top of the words lies, as a part of the height (keep clear of the
 *  top and bottom 15 %, of faces and of signs); cam = another lens than the film's (only for a long video's thumbnail) */
export type Thumb = { T: number; cam?: Cam; words: string[]; y?: number; side?: "left" | "right" | "center"; size?: number; tilt?: number };
export type Caption = { a: number; b: number; text: string };
export type Solid = { name: string; x: [number, number]; z: [number, number]; top: number; named?: string };
export type Film = {
  id: string; fps: number; seconds: number; sky: string;
  /** the length the film must have, when it is not a Short's 25-40 s (the animal trials: a length test of 45-55 s, Jesper 17 Nov) */
  range?: [number, number];
  /** the world, built once; its sun rig is in userData.rig (kit.sunRig) */
  world: () => THREE.Group;
  shots: Shot[];
  words: Word[];
  /** the question, on screen with the voice in the first seconds */
  hook: { text: string[]; a: number; b: number; /** the height of its letters in pixels (108 when left out) */ size?: number; /** its top in pixels from the top of the picture (above the figures when they fill the lower half); low by default */ top?: number };
  /** a small sign when something is dramatised: never in the first five seconds, two seconds long */
  sign?: { text: string; a: number; b: number };
  /** words laid over the picture for a while, in the captions' letters, high in the picture (a counter of days, a name): `text` may
   *  change with the film's time; `top` = pixels from the top (300 when left out), `col` its colour */
  labels?: { a: number; b: number; text: (T: number) => string; top?: number; size?: number; col?: string }[];
  /** speech bubbles: our own short lines (DAILY-RULES, "Our own lines") laid over the picture without moving the voice. `who` is the
   *  speaker's name in the shot's cast: the bubble stands above his head and its tail points at it; dx, dy move it from there (px).
   *  Never a historical quote: no quotation marks, nothing that carries a fact. */
  bubbles?: { a: number; b: number; text: string; who: string; dx?: number; dy?: number; size?: number }[];
  /** a veil of smoke over the whole picture: it thickens from nothing at `a` to `to` (0-1) at `b` and stays (a film that ends in smoke,
   *  so that its loop back to the first frame comes out of the smoke) */
  veils?: { a: number; b: number; col: string; to: number }[];
  /** impacts that shake the camera */
  hits?: { t: number; amp: number; dur?: number }[];
  /** what lies under the whole film (film seconds), and the name of its music in audio/film_music.py */
  beds?: Bed[]; music?: string;
  /** a tint laid over the whole picture at the film time T, under the words: a CSS background (a gradient) that is multiplied with
   *  the picture, so that the world and the figures take the same light (a night with a fire in it, a red evening). null = none */
  grade?: (T: number) => string | null;
  /** the scene's light on the figures (kit.CardLight): warm from a lamp's side, cold from a window's, a thin rim; none = unlit cards */
  light?: CardLight;
  /** what a figure may not stand in or walk through (scripts/film_info.mjs check): boxes on the ground of the world, with the height
   *  of their top (a figure whose feet are above the top is on it, not in it). named = the box belongs to a named thing of the world
   *  and does not count in a shot that hides that thing */
  solids?: Solid[];
  /** a test film whose shots are separate cases side by side (a proof, a sheet, the shot library), never cut together: the tests that read
   *  across cuts (a jump cut, the same picture twice) and the still test leave it alone */
  cases?: boolean;
  /** thumbnail proposals, clearly different from each other */
  thumbs?: Thumb[];
  audio?: string;
};

const tall = (P: Props) => P.thigh + P.shin + P.ankle + P.spine + P.neck + P.head;
/** metres per leg length of a figure h metres tall: the unit the motion library moves in */
export const legM = (D: Design, h: number) => { const P = D.props("sir"); return ((P.thigh + P.shin) * h) / tall(P); };
/** a figure played by a Mover at the Mover's time tm: the Mover's ground (x to the right, z toward the lens of a camera that
 *  looks along -z) is laid in the world at `origin`, turned by `turn` degrees about the vertical */
export const play = (name: string, D: Design, m: Mover, tm: number, origin: V3, h: number, o: { turn?: number; talk?: number; extra?: FigOpts; seed?: number; /** false = the eyes do not blink in this shot (a laugh, a held look) */ blink?: boolean } = {}): Actor => {
  const s = m.sample(tm), LL = legM(D, h), a = ((o.turn ?? 0) * Math.PI) / 180, x = s.x * LL, z = s.z * LL;
  const W = (q: [number, number] | null): V3 | null => (q ? [origin[0] + q[0] * LL * Math.cos(a) + q[1] * LL * Math.sin(a), origin[1] + s.y * LL, origin[2] - q[0] * LL * Math.sin(a) + q[1] * LL * Math.cos(a)] : null);
  return { name, D, h, at: [origin[0] + x * Math.cos(a) + z * Math.sin(a), origin[1] + s.y * LL, origin[2] - x * Math.sin(a) + z * Math.cos(a)], heading: s.yaw + (o.turn ?? 0), pose: s.pose, land: { L: W(m.landedAt("L", tm)), R: W(m.landedAt("R", tm)) },
    o: { handL: s.handL, handR: s.handR, sway: s.sway, capLift: Math.min(0.45, Math.max(0, Math.abs(s.drag) - 1.6) * 0.16), ...o.extra,
      face: { ...s.face, lid: Math.max(s.face.lid ?? 0.16, o.blink === false ? 0 : blink(tm, o.seed ?? 3)), mouth: Math.max(s.face.mouth ?? 0, o.talk ?? 0), ...o.extra?.face } } };
};
/** how far the mouth is open at film time T for the one who says the lines `ids` (0 when somebody else speaks) */
export const talk = (words: Word[], T: number, ids?: string[]) => { const w = ids ? words.filter((q) => ids.includes(q.line ?? "")) : words; return w.length && T >= w[0].a - 0.05 && T <= w[w.length - 1].b + 0.1 ? mouthAt(w, T) : 0; };
/** caption chunks from the word timings: two or three words, never wider than the picture, a new chunk after a full stop and
 *  after a comma that ends two words or more */
/** how wide a caption is in the caption type, in letters of ordinary width (the band holds about 9.3; a little more is set a little smaller) */
/** where the question's first line stands, and the captions when a shot does not say */
export const hookTop = (film: Film) => film.hook.top ?? 1292 - Math.round((film.hook.size ?? 108) * 1.09) * Math.max(0, film.hook.text.length - 2);
export const CAP_TOP = 1440;
/** the boxes the visible lines of text cover at film time T, [x0, y0, x1, y1] in pixels (the Stage draws them; the check reads them) */
export const textBoxes = (film: Film, T: number, caps: { a: number; b: number; text: string }[]): { text: string; box: [number, number, number, number] }[] => {
  if (T >= film.hook.a && T < film.hook.b) { const sz = film.hook.size ?? 108, top = hookTop(film), lh = sz * 1.08; return film.hook.text.map((l, i) => { const w = Math.min(1000, capWidth(l) * 1.194 * sz); return { text: l, box: [540 - w / 2, top + i * lh, 540 + w / 2, top + (i + 1) * lh] as [number, number, number, number] }; }); }
  const c = caps.find((q) => T >= q.a - 0.03 && T < q.b); if (!c) return [];
  const sh = film.shots.find((x) => T >= x.a && T < x.b), sz = Math.round(96 * Math.min(1, 8.9 / capWidth(c.text))), w = Math.min(1020, capWidth(c.text) * 1.194 * sz), top = sh?.capsTop ?? CAP_TOP;
  return [{ text: c.text, box: [540 - w / 2, top, 540 + w / 2, top + sz * 1.08] }];
};
export const capWidth = (t: string) => [...t.toUpperCase().replace(/[.,":;]/g, "")].reduce((n, ch) => n + (ch === " " ? 0.44 : /[I!']/.test(ch) ? 0.47 : /[MW]/.test(ch) ? 1.4 : 1), 0) * 0.68;
const WEAK_ART = /^(a|an|the)$/i, WEAK_LINK = /^(and|of|on|in|with|to|for|from|at|by|as|or|but|his|her|its)$/i, bare = (w: string) => w.replace(/[^A-Za-z']/g, "");
/** the captions of a film: the words two or three at a time. A caption never runs past a comma or a full stop, and inside a clause
 *  the breaks are chosen so that no caption ends on "a", "the" or "of", no name is split in two and no word stands alone if it can be helped */
/** the shortest time a caption stays up when nothing comes after it at once (seconds) */
const CAP_MIN = 0.6;
export const captions = (words: Word[], skip: (w: Word) => boolean = () => false, /** the times of the film's cuts */ cuts: number[] = []): Caption[] => {
  const out: Caption[] = [], clauses: Word[][] = []; let cur: Word[] = [];
  for (const w of words) { if (skip(w)) { if (cur.length) clauses.push(cur); cur = []; continue; } if (cur.length && w.line !== cur[0].line) { clauses.push(cur); cur = []; } cur.push(w); if (/[.,!?;:]"?$/.test(w.w)) { clauses.push(cur); cur = []; } }
  if (cur.length) clauses.push(cur);
  for (const c of clauses) {
    // the cheapest way to cut the clause into pieces of one to three words (dynamic programming over where the last piece starts)
    const n = c.length, best: number[] = [0], from: number[] = [0];
    const cost = (i: number, j: number) => { const ws = c.slice(i, j), last = bare(ws[ws.length - 1].w), text = ws.map((q) => q.w).join(" ");
      let k = 0.6; if (ws.length > 1 && capWidth(text) > 9.5) k += 50; if (ws.length === 1 && n > 1) k += j < n ? 2.3 : 2;
      if (j < n) { if (WEAK_ART.test(last) || WEAK_LINK.test(last)) k += 3; if (i + 0 <= j - 1 && /^[A-Z]/.test(c[j - 1].w) && /^[A-Z]/.test(c[j].w) && j - 1 > 0) k += 3; }
      return k; };
    for (let j = 1; j <= n; j++) { best[j] = Infinity; for (let i = Math.max(0, j - 3); i < j; i++) { const v = best[i] + cost(i, j); if (v < best[j]) { best[j] = v; from[j] = i; } } }
    const cuts: number[] = []; for (let j = n; j > 0; j = from[j]) cuts.unshift(j);
    let i = 0; for (const j of cuts) { const ws = c.slice(i, j); out.push({ a: ws[0].a, b: ws[ws.length - 1].b + 0.12, text: ws.map((q) => q.w).join(" ").toUpperCase().replace(/[.,":;]/g, "") }); i = j; }
  }
  // a caption stays until the next one comes, if the gap is short, so that the band does not flicker
  out.forEach((c, i) => { const n = out[i + 1]; if (n && n.a - c.b < 0.25) c.b = n.a; });
  // and it stays long enough to be read (the voice's timings can end a short last word almost where it starts: "Right?" stood for four
  // frames), but never into the next one
  out.forEach((c, i) => { const n = out[i + 1], want = c.a + CAP_MIN; if (c.b < want) c.b = n ? Math.max(c.b, Math.min(want, n.a)) : want; });
  // a caption that would run a moment past a cut (less than 0.4 s) ends on the cut, when it has been up long enough to be read: text
  // that hangs over into the next picture looks like a slip
  // a caption that the voice says in a moment ("INTO" stood four frames) comes up a little early, into the pause before it, if there is one
  out.forEach((c, i) => { if (c.b - c.a >= 0.4) return; const p = out[i - 1], first = Math.max(p ? p.b : 0, c.a - 0.3); c.a = Math.min(c.a, Math.max(first, c.b - 0.4)); });
  for (const c of out) for (const x of cuts) if (x > c.a + 0.5 && x < c.b && c.b - x < 0.4) c.b = x;
  return out;
};
export const smooth = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
export const mix3 = (a: V3, b: V3, u: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
/** a camera that glides from one framing to another over the shot */
export const glide = (from: Cam, to: Cam, ease = true) => (_t: number, u: number): Cam => { const k = ease ? smooth(u) : u; return { pos: mix3(from.pos, to.pos, k), look: mix3(from.look, to.look, k), fov: from.fov + (to.fov - from.fov) * k }; };
export const shotAt = (film: Film, T: number) => film.shots.find((s) => T >= s.a && T < s.b) ?? film.shots[film.shots.length - 1];

/** A shot's cast with each figure's mirror image fixed for the whole shot (the shot library review C: Sir turned across the angle where his
 *  drawing is mirrored, so that his monocle shows, and his head was redrawn the other way round between two frames). The mirror is
 *  decided once, by how the figure stands to the lens on the shot's first frame; every caller (the stage, the checks) uses this */
const LOCKED = new WeakMap<Shot, Shot["cast"]>();
export const castOf = (s: Shot): Shot["cast"] => { const had = LOCKED.get(s); if (had) return had;
  let lock: Map<string, boolean> | null = null;
  const f: Shot["cast"] = (t, T) => { if (!lock) { lock = new Map(); const c0 = s.cam(0, 0); for (const a of s.cast(0, s.a)) if (a.D.mirrorAt) lock.set(a.name, a.D.mirrorAt(a.heading - (Math.atan2(c0.pos[0] - a.at[0], c0.pos[2] - a.at[2]) * 180) / Math.PI)); }
    return s.cast(t, T).map((a) => (lock!.has(a.name) && a.o.mirror === undefined ? { ...a, o: { ...a.o, mirror: lock!.get(a.name) } } : a)); };
  LOCKED.set(s, f); return f; };

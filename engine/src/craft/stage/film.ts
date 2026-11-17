// A film as data: shots with a camera, the cast of each shot played from the motion library, and the things they hold. One stage
// (Stage.tsx) plays any film in any world of the kit, so a Short is a script of shots and never its own engine.
// Time: T = seconds from the start of the film, t = seconds from the start of the shot.
import type * as THREE from "three";
import type { Design, FigOpts } from "../designs/common";
import type { Pose, Props, Joint } from "../rig";
import { Mover, blink, mouthAt } from "../motion";

export type V3 = [number, number, number];
export type Cam = { pos: V3; look: V3; fov: number };
/** one figure on one frame: where its soles are, the way it faces (0 = toward +z, 90 = toward +x), its height, pose and face */
export type Actor = { name: string; D: Design; at: V3; heading: number; h: number; pose: Pose; o: FigOpts;
  /** a figure thrown through the air: `at` is then the middle of its body and it is turned this many degrees in the picture */
  spin?: number;
  /** true = the figure takes no shade from the others in the shot (a shadow that would lie on it as a blot) */
  noShade?: boolean };
/** a figure placed in the world on this frame: where its joints are, so that real things can be put in its hands */
export type Staged = Actor & { joint: (j: Joint) => V3; mesh: THREE.Mesh };
export type Word = { w: string; a: number; b: number; line?: string };
export type Shot = {
  id: string; a: number; b: number;
  /** the moment of the shot that stands for it in the sketch (seconds into the shot) */
  still?: number;
  cam: (t: number, u: number) => Cam;
  /** the middle and half the size of the area that gets sharp shadows; default: 9 m round what the camera looks at */
  sun?: { target: V3; reach: number };
  /** named things of the world that are not there in this shot (the world lists them in userData.named) */
  hide?: string[];
  cast: (t: number, T: number) => Actor[];
  /** real things that move in this shot (in hands, falling, rolling): add them to `into` */
  things?: (into: THREE.Group, cast: Record<string, Staged>, t: number, T: number, cam: Cam) => void;
  /** the sounds of what happens in this shot, and what lies under it: times in seconds into the shot */
  sounds?: Sound[]; beds?: Bed[];
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
export type Film = {
  id: string; fps: number; seconds: number; sky: string;
  /** the world, built once; its sun rig is in userData.rig (kit.sunRig) */
  world: () => THREE.Group;
  shots: Shot[];
  words: Word[];
  /** the question, on screen with the voice in the first seconds */
  hook: { text: string[]; a: number; b: number; /** the height of its letters in pixels (108 when left out) */ size?: number };
  /** a small sign when something is dramatised: never in the first five seconds, two seconds long */
  sign?: { text: string; a: number; b: number };
  /** impacts that shake the camera */
  hits?: { t: number; amp: number; dur?: number }[];
  /** what lies under the whole film (film seconds), and the name of its music in audio/film_music.py */
  beds?: Bed[]; music?: string;
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
  return { name, D, h, at: [origin[0] + x * Math.cos(a) + z * Math.sin(a), origin[1] + s.y * LL, origin[2] - x * Math.sin(a) + z * Math.cos(a)], heading: s.yaw + (o.turn ?? 0), pose: s.pose,
    o: { handL: s.handL, handR: s.handR, sway: s.sway, capLift: Math.min(0.45, Math.max(0, Math.abs(s.drag) - 1.6) * 0.16), ...o.extra,
      face: { ...s.face, lid: Math.max(s.face.lid ?? 0.16, o.blink === false ? 0 : blink(tm, o.seed ?? 3)), mouth: Math.max(s.face.mouth ?? 0, o.talk ?? 0), ...o.extra?.face } } };
};
/** how far the mouth is open at film time T for the one who says the lines `ids` (0 when somebody else speaks) */
export const talk = (words: Word[], T: number, ids?: string[]) => { const w = ids ? words.filter((q) => ids.includes(q.line ?? "")) : words; return w.length && T >= w[0].a - 0.05 && T <= w[w.length - 1].b + 0.1 ? mouthAt(w, T) : 0; };
/** caption chunks from the word timings: two or three words, never wider than the picture, a new chunk after a full stop and
 *  after a comma that ends two words or more */
/** how wide a caption is in the caption type, in letters of ordinary width (the band holds about 9.3; a little more is set a little smaller) */
export const capWidth = (t: string) => [...t.toUpperCase().replace(/[.,":;]/g, "")].reduce((n, ch) => n + (ch === " " ? 0.44 : /[I!']/.test(ch) ? 0.47 : /[MW]/.test(ch) ? 1.4 : 1), 0) * 0.68;
const WEAK_ART = /^(a|an|the)$/i, WEAK_LINK = /^(and|of|on|in|with|to|for|from|at|by|as|or|but|his|her|its)$/i, bare = (w: string) => w.replace(/[^A-Za-z']/g, "");
/** the captions of a film: the words two or three at a time. A caption never runs past a comma or a full stop, and inside a clause
 *  the breaks are chosen so that no caption ends on "a", "the" or "of", no name is split in two and no word stands alone if it can be helped */
export const captions = (words: Word[], skip: (w: Word) => boolean = () => false): Caption[] => {
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
  return out;
};
export const smooth = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
export const mix3 = (a: V3, b: V3, u: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
/** a camera that glides from one framing to another over the shot */
export const glide = (from: Cam, to: Cam, ease = true) => (_t: number, u: number): Cam => { const k = ease ? smooth(u) : u; return { pos: mix3(from.pos, to.pos, k), look: mix3(from.look, to.look, k), fov: from.fov + (to.fov - from.fov) * k }; };
export const shotAt = (film: Film, T: number) => film.shots.find((s) => T >= s.a && T < s.b) ?? film.shots[film.shots.length - 1];

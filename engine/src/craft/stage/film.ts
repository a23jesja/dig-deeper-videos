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
export type Actor = { name: string; D: Design; at: V3; heading: number; h: number; pose: Pose; o: FigOpts };
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
  cast: (t: number, T: number) => Actor[];
  /** real things that move in this shot (in hands, falling, rolling): add them to `into` */
  things?: (into: THREE.Group, cast: Record<string, Staged>, t: number, T: number, cam: Cam) => void;
};
export type Caption = { a: number; b: number; text: string };
export type Film = {
  id: string; fps: number; seconds: number; sky: string;
  /** the world, built once; its sun rig is in userData.rig (kit.sunRig) */
  world: () => THREE.Group;
  shots: Shot[];
  words: Word[];
  /** the question, on screen with the voice in the first seconds */
  hook: { text: string[]; a: number; b: number };
  /** a small sign when something is dramatised: never in the first five seconds, two seconds long */
  sign?: { text: string; a: number; b: number };
  /** impacts that shake the camera */
  hits?: { t: number; amp: number; dur?: number }[];
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
/** caption chunks from the word timings: two or three words, never wider than the picture, a new chunk after a full stop */
export const captions = (words: Word[], skip: (w: Word) => boolean = () => false): Caption[] => {
  const out: Caption[] = []; let cur: Word[] = [];
  const flush = () => { if (cur.length) out.push({ a: cur[0].a, b: cur[cur.length - 1].b + 0.12, text: cur.map((q) => q.w).join(" ").toUpperCase().replace(/[.,":;]/g, "") }); cur = []; };
  for (const w of words) { if (skip(w)) { flush(); continue; } if (cur.length && (cur.length >= 3 || [...cur, w].map((q) => q.w).join(" ").length > 14 || /[.!?]"?$/.test(cur[cur.length - 1].w) || w.line !== cur[0].line)) flush(); cur.push(w); }
  flush();
  // a caption stays until the next one comes, if the gap is short, so that the band does not flicker
  out.forEach((c, i) => { const n = out[i + 1]; if (n && n.a - c.b < 0.25) c.b = n.a; });
  return out;
};
export const smooth = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
export const mix3 = (a: V3, b: V3, u: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
/** a camera that glides from one framing to another over the shot */
export const glide = (from: Cam, to: Cam, ease = true) => (_t: number, u: number): Cam => { const k = ease ? smooth(u) : u; return { pos: mix3(from.pos, to.pos, k), look: mix3(from.look, to.look, k), fov: from.fov + (to.fov - from.fov) * k }; };
export const shotAt = (film: Film, T: number) => film.shots.find((s) => T >= s.a && T < s.b) ?? film.shots[film.shots.length - 1];

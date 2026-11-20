// Where the film's speech bubbles stand and how strongly they show, shared by the Stage (which draws them) and the flicker check
// (which watches their boxes). A bubble is placed once, from where the speaker's head is in the picture at the moment it starts,
// and then stands still: it fades in over six frames and holds. Before (to the eye patch Short v1q) it followed the head on every
// frame and popped up with an overshoot, so it moved a few pixels from frame to frame, which Jesper saw as flicker (DAILY-RULES,
// Impossible things 9).
import * as THREE from "three";
import { Film, castOf, shotAt } from "./film";

const SW = 1080, SH = 1920;
/** frames over which a bubble fades in, and out */
export const BUBBLE_IN = 6, BUBBLE_OUT = 4;
/** where a place in the world is on the picture, seen by `cam` (null behind the lens) */
export const toScreen = (cam: { pos: number[]; look: number[]; fov: number }, p: [number, number, number]): [number, number] | null => {
  const c = new THREE.PerspectiveCamera(cam.fov, SW / SH, 0.1, 3000); c.position.set(cam.pos[0], cam.pos[1], cam.pos[2]); c.lookAt(cam.look[0], cam.look[1], cam.look[2]); c.updateMatrixWorld();
  const v = new THREE.Vector3(p[0], p[1], p[2]).project(c); return v.z > 1 ? null : [((v.x + 1) / 2) * SW, ((1 - v.y) / 2) * SH];
};
export type BubbleAt = { text: string; px: number; x: number; y: number; w: number; h: number; bx: number; tip: [number, number]; op: number; box: [number, number, number, number] };
const placed = new WeakMap<object, Map<number, [number, number]>>();
/** the speaker's head in the picture at the bubble's first frame (kept, so that every frame of the bubble uses the same place) */
const headAt = (film: Film, i: number): [number, number] => {
  let m = placed.get(film); if (!m) { m = new Map(); placed.set(film, m); }
  const got = m.get(i); if (got) return got;
  const q = film.bubbles![i], T = Math.ceil(q.a * film.fps - 1e-6) / film.fps, shot = shotAt(film, T), t = T - shot.a, cam = shot.cam(t, t / (shot.b - shot.a));
  const who = castOf(shot)(t, T).find((x) => x.name === q.who), head = who ? toScreen(cam, [who.at[0], who.at[1] + who.h * 1.03, who.at[2]]) : null, H: [number, number] = head ?? [SW / 2, 760];
  m.set(i, H); return H;
};
/** the bubbles showing at film time T */
export const bubblesAt = (film: Film, T: number): BubbleAt[] => (film.bubbles ?? []).flatMap((q, i) => {
  if (T < q.a || T >= q.b) return [];
  const H = headAt(film, i), px = q.size ?? 72, w = Math.round(Math.min(SW - 80, q.text.length * px * 0.66 + 80)), h = Math.round(px * 1.12 + 44);
  const x = Math.round(Math.max(40 + w / 2, Math.min(SW - 40 - w / 2, H[0] + (q.dx ?? 0)))), y = Math.round(Math.max(40 + h, Math.min(1400, H[1] + (q.dy ?? -px * 2.6))));
  // fade in over BUBBLE_IN frames and out over BUBBLE_OUT, eased; the bubble itself never moves or changes size
  const fIn = (T - q.a) * film.fps, fOut = (q.b - T) * film.fps, e = (k: number) => { const c = Math.max(0, Math.min(1, k)); return c * c * (3 - 2 * c); };
  const op = e((fIn + 1) / BUBBLE_IN) * e(fOut / BUBBLE_OUT);
  // the tail: from the bubble's lower edge toward the top of the head, stopping short of it (aimed at the forehead, it ran into the
  // headband or the hair in a close-up, the eye patch Short v1g); its base slides along the lower edge to above the head
  const bx = Math.max(x - w / 2 + 50, Math.min(x + w / 2 - 50, H[0])), dx = H[0] - bx, dy = H[1] - y, far = Math.hypot(dx, dy) || 1, reach = Math.min(110, far * 0.5);
  const tip: [number, number] = [Math.round(bx + (dx / far) * reach), Math.round(y + (dy / far) * reach)];
  return [{ text: q.text, px, x, y, w, h, bx, tip, op, box: [x - w / 2 - 8, Math.min(y - h, tip[1]) - 8, x + w / 2 + 8, Math.max(y, tip[1]) + 8] }];
});

// "The guard discovers the empty wall": the ten-second timeline shared by variant 1 (engine drawing) and
// variant 2 (puppet). 1920 x 1080, 30 fps, 300 frames. All positions in screen pixels.
export const FRAMES = 300, FPS = 30, W = 1920, H = 1080;
export const FLOOR_Y = 890;                 // where the soles stand
export const SPOT = { x: 960, y: 345, w: 190, h: 250 };   // the bare patch (centre, size)
export const FIG = 0.6;                     // on-screen size of one design unit of the engine's 600 x 1000 figure cell
const cl = (x: number) => Math.max(0, Math.min(1, x));
export const sm = (x: number) => { const t = cl(x); return t * t * (3 - 2 * t); };

const CYCLE = 24;                           // frames per gait cycle (two steps): a stroll
const STRIDE = 0.7;                         // of the engine's 370-unit step
const PX_PER_PHASE = 2 * 370 * FIG;         // the body moves two steps per cycle, so planted feet do not slide
/** stride envelope of the first walk: full until frame 96, then two more steps shrinking to a stop at frame 120 (phase 5.0) */
const strideA = (f: number) => STRIDE * (f < 96 ? 1 : 1 - sm((f - 96) / 24));
/** the walk back: one cycle (two steps), frames 144..168, stride swelling and shrinking */
const strideB = (f: number) => (f <= 144 || f >= 168 ? 0 : STRIDE * Math.sin((Math.PI * (f - 144)) / 24) ** 2);
const integrate = (fn: (f: number) => number, f0: number, f1: number) => {
  let s = 0; const n = Math.max(1, Math.ceil((f1 - f0) * 4));
  for (let i = 0; i < n; i++) s += fn(f0 + ((i + 0.5) * (f1 - f0)) / n) * ((f1 - f0) / n);
  return s;
};
const X_STOP = 1345;                        // where he stops, right of the bare spot
const X0 = X_STOP - (PX_PER_PHASE / CYCLE) * integrate(strideA, 0, 120);

export type View = "sideR" | "sideL" | "front" | "back";
export type Guard = { x: number; view: View; walking: boolean; phase: number; stride: number; shock: number; arms: number; facing: -1 | 0 | 1; look: number };
export const guard = (f: number): Guard => {
  const g: Guard = { x: X_STOP, view: "sideR", walking: false, phase: 0, stride: 0, shock: 0, arms: 0, facing: 0, look: 0 };
  if (f < 120) {                            // strolls in, passes the spot, two more steps, stops
    g.x = X0 + (PX_PER_PHASE / CYCLE) * integrate(strideA, 0, f); g.walking = true; g.phase = (f / CYCLE) % 1; g.stride = strideA(f);
  } else if (f < 130) {                     // stands
  } else if (f < 144) {                     // double take: turns towards us, head back to the wall
    g.view = "front"; g.facing = -1; g.look = -0.9;
  } else if (f < 168) {                     // two steps back
    g.view = "sideL"; g.walking = true; g.phase = ((f - 144) / CYCLE) % 1; g.stride = strideB(f);
    g.x = X_STOP - (PX_PER_PHASE / CYCLE) * integrate(strideB, 144, f);
  } else {
    g.x = X_STOP - (PX_PER_PHASE / CYCLE) * integrate(strideB, 144, 168);
    if (f < 215) g.view = "back";           // faces the hooks
    else {                                  // shock: hands up, then looks left and right
      g.view = "front"; g.shock = 1;
      g.arms = sm((f - 217) / 8) * (1 - sm((f - 252) / 12));
      g.facing = f >= 262 && f < 279 ? -1 : f >= 281 && f < 297 ? 1 : 0; g.look = g.facing * 0.9;
    }
  }
  return g;
};
/** camera: push in on the hooks during 170..215 */
export const camera = (f: number) => {
  const k = sm((f - 170) / 14) * (1 - sm((f - 204) / 12));
  return { zoom: 1 + 1.35 * k, cx: SPOT.x, cy: SPOT.y + 30 };
};

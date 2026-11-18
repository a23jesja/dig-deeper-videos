// The sets of Saint-Julien (world/stjulien.ts) seen from where the length-test Short will shoot them, for checking the world before any
// figure is staged in it: the vineyard close and wide, the empty field with its spring, the square, and the court room three ways (the
// whole room from the gallery's end, over the empty dock toward the window, and across at the gallery bench).
import type { Film, Shot } from "../stage/film";
import { lens } from "../stage/staging";
import { stJulienWorld, SJ, inCourt, vineAt } from "../world/stjulien";

const LEN = 0.4, views: [string, ReturnType<typeof lens>, [number, number, number]][] = [];
{ const [x, , z] = vineAt(3, 0.6); views.push(["vines-close", lens(x + 0.1, 1.15, z + 0.85, 0, -1, -10, 46), [x, 1, z]]); }
{ const [x, , z] = vineAt(10, 0.55); views.push(["vines-wide", lens(x + 2, 2.3, z + 5.5, -0.25, -1, -12, 56), [x, 0, z - 4]]); }
{ const [fx, , fz] = SJ.field.at; views.push(["field", lens(fx - 1, 1.6, fz + SJ.field.d / 2 + 4, 0, -1, -6, 56), [fx, 0, fz]]); }
{ const [qx, , qz] = SJ.square.at; views.push(["square", lens(qx, 1.8, qz + 9, 0, -1, -2, 56), [qx, 0, qz]]); }
{ const p = inCourt([0.5, 2.4, 2.6]); views.push(["court", lens(p[0], p[1], p[2], -0.25, -1, -14, 54), inCourt([-0.2, 0, -1])]); }
{ const p = inCourt([1.25, 1.3, 1.25]); views.push(["dock", lens(p[0], p[1], p[2], -0.05, -1, -4, 50), inCourt([1.0, 0, -1.2])]); }
{ const p = inCourt([-1.3, 1.3, 1.3]); views.push(["gallery", lens(p[0], p[1], p[2], -1, -0.1, -4, 44), inCourt([-3.4, 0, 1.0])]); }
const shots: Shot[] = views.map(([id, V, target], i) => ({ id, a: i * LEN, b: (i + 1) * LEN, still: LEN / 2, cam: () => V.cam, sun: { target, reach: 10 }, cast: () => [] }));
export const ST_JULIEN_SETS: Film = { id: "sj-sets", fps: 30, seconds: shots.length * LEN, sky: "#b8e0ff", world: stJulienWorld, shots, words: [], hook: { text: [""], a: -1, b: -0.5 } };

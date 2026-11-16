// Timeline of the long film "The Man Who Stole the Mona Lisa" (1920 x 1080, 10 min 10 s). The shots themselves
// (start word, place, camera, action) live in monaShots*.ts; this file turns them into the engine's tables.
import { Cam, Dof, ShotDef, dofFrom, layersFrom, zoom, pushK, clamp01 } from "./story";
import { CamInfo } from "./castbase";
import { Scene, Show } from "./scenes";
import { Sh, TOTAL_M, liftIcons } from "./monaKit";
import { SHOTS_1 } from "./monaShots1";
import { SHOTS_2 } from "./monaShots2";
import { SHOTS_3 } from "./monaShots3";
import { SHOTS_3B } from "./monaShots3b";
import { SHOTS_4 } from "./monaShots4";
import { SHOTS_4B } from "./monaShots4b";

export const SH: Sh[] = [...SHOTS_1, ...SHOTS_2, ...SHOTS_3, ...SHOTS_3B, ...SHOTS_4, ...SHOTS_4B];
SH.forEach((s, i) => { if (i && s.a <= SH[i - 1].a) throw new Error(`shot "${s.name}" (${s.a}) does not start after "${SH[i - 1].name}" (${SH[i - 1].a})`); });
export { TOTAL_M };
export const SHOTS_M: ShotDef[] = SH.map((s, i) => ({ id: i + 1, name: s.name, a: i ? s.a : 0, b: i + 1 < SH.length ? SH[i + 1].a : TOTAL_M, zone: s.zone, light: s.zone === "paris" ? "day" : s.light ?? "day", sunAz: s.light === "golden" ? 215 : s.zone === "office" || s.zone === "louvre" || s.zone === "paris" ? 210 : 105, ...(s.light === "golden" ? { sunEl: 24 } : {}) }));
/** cross-fades are kept short (6 frames at most): a longer one leaves the old shot's cards hanging as ghosts over the new shot */
export const XFADE_M: Record<number, number> = Object.fromEntries(SH.map((s, i) => [i + 1, Math.min(6, s.x ?? 0)]).filter(([, x]) => x > 0));
/** the white flash that ends the hook: on the cut to Sir Digsworth's introduction */
export const FLASH_M = SHOTS_M[SH.findIndex((s) => s.name.startsWith("intro"))]?.a ?? -100;
export const layersM = layersFrom(SHOTS_M, XFADE_M);
export const camAtM = (id: number, f: number): Cam => {
  const s = SH[id - 1], d = SHOTS_M[id - 1], [pos, look, fov, rate] = s.cam, u = clamp01((f - d.a) / Math.max(1, d.b - d.a));
  const mv = s.mv ?? [[0, 0, 0], [0, 0, 0]];
  const sh = zoom([pos[0] + mv[0][0] * u, pos[1] + mv[0][1] * u, pos[2] + mv[0][2] * u], [look[0] + mv[1][0] * u, look[1] + mv[1][1] * u, look[2] + mv[1][2] * u], fov, pushK(f, d.a, Math.min(rate ?? 0.0005, 0.07 / Math.max(1, d.b - d.a))));
  return { fov: 40, roll: 0, ...sh };
};
export const dofAtM = dofFrom([{ f: 0, cInf: 0 }] as Dof[]);
export const sceneAtM = (id: number, f: number, cam: CamInfo): Scene => {
  const out: Scene = { places: [], fx: [], guns: [], crates: [], fan: 0 };
  const d = SHOTS_M[id - 1];
  SH[id - 1].draw({ out, f, a: d.a, b: d.b, n: f - d.a, t: f / 30, cam });
  const c = camAtM(id, f);
  liftIcons(out, c.pos, c.look);
  return out;
};
export const MONA_SHOW: Show = { shots: SHOTS_M, camAt: camAtM, sceneAt: sceneAtM, crowdFor: () => null, wheatAt: () => 1 };

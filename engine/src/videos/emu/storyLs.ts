// Timeline of the short "The Man Who Sold the Eiffel Tower" (Victor Lustig, 1080 x 1920, 42 s). Every shot starts on
// a word of the voice (voice/lustig-short/words.json -> wordsLs.json). Portrait: near subjects low, far ones above.
import { Cam, Dof, Key, ShotDef, V3, Zone, run, pushK, zoom, dofFrom, layersFrom } from "./story";
import wordsJson from "./wordsLs.json";

type Wd = { w: string; a: number; b: number; line: string };
const WORDS = wordsJson as Wd[];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
export const atS = (line: string, word?: string, n = 0): number => {
  const L = WORDS.filter((w) => w.line === line);
  if (!L.length) throw new Error(`no line ${line}`);
  if (!word) return Math.round(L[0].a * 30);
  const m = L.filter((w) => norm(w.w) === norm(word));
  if (!m[n]) throw new Error(`no word "${word}" (${n}) in line ${line}`);
  return Math.round(m[n].a * 30);
};
const at = atS;
export const TOTAL_LS = 1262;
/** where the tower stands in zone "paris" (a drawing 46 m wide, 92 m tall) */
export const TOWER: V3 = [0, 0, 120];

const DEFS: [number, string, number, Zone][] = [
  [1, "hook: a con man sold the Eiffel Tower", 0, "paris"],
  [2, "and tried to sell it again", at("hook2") - 4, "paris"],
  [3, "Victor Lustig", at("who") - 5, "paris"],
  [4, "the tower is too expensive to repair", at("news") - 4, "paris"],
  [5, "a government official; scrap dealers at a hotel", at("pose") - 4, "office"],
  [6, "in secrecy: the tower is for sale", at("secret") - 4, "office"],
  [7, "Poisson pays 70,000 francs", at("poisson") - 4, "office"],
  [8, "he flees to Austria", at("flee") - 4, "scot"],
  [9, "too embarrassed to tell the police", at("shame") - 4, "paris"],
  [10, "he tries again; the police are told", at("again") - 4, "office"],
  [11, "he escapes to America", at("again", "escaped") - 6, "dock"],
  [12, "the tower is still there", at("end") - 5, "paris"],
];
export const SHOTS_LS: ShotDef[] = DEFS.map(([id, name, a, zone], i) => ({ id, name, a, b: i + 1 < DEFS.length ? DEFS[i + 1][2] : TOTAL_LS, zone, light: "day" as const, sunAz: zone === "office" ? 150 : 105 }));
export const ALS: number[] = [0, ...SHOTS_LS.map((s) => s.a)];
export const XFADE_LS: Record<number, number> = { 5: 8, 8: 8, 9: 8, 10: 8, 11: 8, 12: 10 };
export const FLASH_LS = ALS[3];
export const layersLs = layersFrom(SHOTS_LS, XFADE_LS);

const Zm = zoom, P = pushK;
const one = (id: number, pos: V3, look: V3, fov: number, rate = 0.0008, rest: Partial<Cam> = {}): Key[] => [{ f: ALS[id], s: (f) => Zm(pos, look, fov, P(f, ALS[id], rate), rest) }];
const CAMS: Record<number, Key[]> = {
  1: one(1, [0, 2.2, -11], [0, 5.07, 30], 46, 0.0006),
  2: one(2, [0, 1.9, -5.5], [0, 2.79, 20], 46, 0.0006),
  3: one(3, [0, 1.75, -4.6], [0, 1.55, 0], 36, 0.0014),
  4: one(4, [0, 1.9, -5.5], [0, 2.79, 20], 46, 0.0006),
  5: one(5, [1.7, 1.9, -6.6], [1.7, 1.75, 1.5], 40, 0.0004),
  6: one(6, [1.75, 1.9, -5.8], [1.75, 2.0, 1.5], 40, 0.0003),
  7: one(7, [1.9, 1.9, -5.8], [1.9, 1.95, 1.0], 40, 0.0004),
  8: one(8, [0, 1.9, -7.6], [0, 1.7, 1], 40, 0.0006),
  9: one(9, [0, 1.9, -5.5], [0, 2.79, 20], 46, 0.0006),
  10: one(10, [1.4, 1.9, -6.9], [1.4, 1.85, 1.5], 40, 0.0003),
  11: one(11, [8, 4.75, 2.0], [8, 5.2, 9.2], 38, 0.0008),
  12: one(12, [0, 2.2, -11], [0, 5.07, 30], 46, 0.0006),
};
export const camAtLs = (id: number, f: number): Cam => run(CAMS[id], f);
const DOF_LS: Dof[] = [{ f: 0, cInf: 0 }, { f: ALS[3], cInf: 6, focus: () => [0, 1.6, 0] }, { f: ALS[4], cInf: 0 }];
export const dofAtLs = dofFrom(DOF_LS);

// Timeline of the long film "The Man Who Sold the Eiffel Tower" (Victor Lustig, 1920 x 1080, 3 min 1 s). Every shot
// starts on a word of the voice (voice/lustig-long/words.json -> wordsLL.json).
import { Cam, Dof, Key, ShotDef, V3, Zone, run, pushK, zoom, dofFrom, layersFrom } from "./story";
import { SHORE } from "./storyP";
import wordsJson from "./wordsLL.json";

type Wd = { w: string; a: number; b: number; line: string };
const WORDS = wordsJson as Wd[];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
export const atLL = (line: string, word?: string, n = 0): number => {
  const L = WORDS.filter((w) => w.line === line);
  if (!L.length) throw new Error(`no line ${line}`);
  if (!word) return Math.round(L[0].a * 30);
  const m = L.filter((w) => norm(w.w) === norm(word));
  if (!m[n]) throw new Error(`no word "${word}" (${n}) in line ${line}`);
  return Math.round(m[n].a * 30);
};
const at = atLL;
export const TOTAL_LL = 5480;

const DEFS: [number, string, number, Zone][] = [
  [1, "hook: a forged letter sold the Eiffel Tower", 0, "paris"],
  [2, "it was not his", at("hook2") - 4, "paris"],
  [3, "he tried to sell it again", at("hook3") - 4, "paris"],
  [4, "I'm Sir Digsworth: Victor Lustig", at("intro") - 5, "paris"],
  [5, "born 1890 in Bohemia", at("born") - 5, "scot"],
  [6, "expelled on his first day of school", at("born", "On") - 3, "office"],
  [7, "a school report calls him an idiot", at("report") - 3, "office"],
  [8, "four languages", at("languages") - 4, "office"],
  [9, "ocean liners: a Broadway show that does not exist", at("liners") - 5, "dock"],
  [10, "the money box", at("box") - 4, "office"],
  [11, "six hours later, a second note", at("trick") - 3, "office"],
  [12, "he sells the box", at("sell") - 3, "office"],
  [13, "the Texas sheriff, paid back in fake money", at("sheriff") - 4, "camp"],
  [14, "Paris 1925: the tower is too expensive", at("paris") - 5, "paris"],
  [15, "the forged paper; Deputy Director-General", at("plan") - 4, "office"],
  [16, "scrap dealers at the hotel; the secret", at("hotel") - 4, "office"],
  [17, "Poisson pays: a bribe, then 70,000 francs", at("poisson") - 4, "office"],
  [18, "Austria: nothing in the newspapers", at("austria") - 4, "scot"],
  [19, "Poisson is too ashamed", at("austria", "Poisson") - 3, "paris"],
  [20, "he tries again; the police", at("again") - 4, "paris"],
  [21, "he sails for America", at("again", "Lustig") - 4, "dock"],
  [22, "Al Capone's 50,000 dollars", at("capone") - 5, "office"],
  [23, "broke: Capone gives him 5,000", at("capone2") - 3, "office"],
  [24, "printing money for five years", at("fake") - 5, "office"],
  [25, "Billy May telephones the agents", at("billy") - 4, "office"],
  [26, "arrested; a key he will not explain", at("key") - 4, "office"],
  [27, "the locker at Times Square", at("key", "It") - 3, "office"],
  [28, "out of jail on a rope; 27 days", at("escape") - 4, "paris"],
  [29, "caught in Pittsburgh", at("alcatraz") - 4, "paris"],
  [30, "Alcatraz for 20 years", at("alcatraz", "sent") - 4, "isle"],
  [31, "1947; apprentice salesman", at("death") - 5, "office"],
  [32, "still not for sale", at("end") - 5, "paris"],
  [33, "outro", at("outro") - 4, "paris"],
];
export const SHOTS_LL: ShotDef[] = DEFS.map(([id, name, a, zone], i) => ({ id, name, a, b: i + 1 < DEFS.length ? DEFS[i + 1][2] : TOTAL_LL, zone, light: "day" as const, sunAz: zone === "office" ? 150 : 105 }));
export const ALL: number[] = [0, ...SHOTS_LL.map((s) => s.a)];
export const XFADE_LL: Record<number, number> = { 5: 8, 6: 8, 9: 8, 10: 8, 13: 8, 14: 8, 15: 8, 18: 8, 19: 8, 21: 8, 22: 8, 28: 8, 30: 10, 31: 8, 32: 10 };
export const FLASH_LL = ALL[4];
export const layersLL = layersFrom(SHOTS_LL, XFADE_LL);

const Zm = zoom, P = pushK;
const one = (id: number, pos: V3, look: V3, fov: number, rate = 0.0005, rest: Partial<Cam> = {}): Key[] => [{ f: ALL[id], s: (f) => Zm(pos, look, fov, P(f, ALL[id], rate), rest) }];
const TOWN = (id: number, cx = 0, rate = 0.0005) => one(id, [cx, 1.9, -9], [cx, 5.3, 30], 42, rate);          // people small, the whole tower
const NEAR = (id: number, cx = 0, rate = 0.0006) => one(id, [cx, 1.8, -6], [cx, 3.6, 20], 42, rate);          // people larger, still the whole tower
const ROOM = (id: number, cx: number, z = -6.4, y = 1.9, rate = 0.0005) => one(id, [cx, 1.9, z], [cx, y, 1.5], 34, rate);
const DECK = (id: number) => one(id, [8.4, 4.9, 1.6], [8.4, 5.0, 9.2], 36, 0.0006);
const CAMS: Record<number, Key[]> = {
  1: TOWN(1), 2: NEAR(2), 3: NEAR(3),
  4: one(4, [0.2, 1.7, -9.4], [0.2, 1.4, -2], 35, 0.001),
  5: one(5, [0.5, 1.3, -4.4], [0.5, 1.05, 0.5], 36, 0.0006),
  6: ROOM(6, 1.6), 7: ROOM(7, 1.4, -5.2), 8: ROOM(8, 2.4, -6.2, 2.1),
  9: DECK(9),
  10: ROOM(10, 1.4), 11: one(11, [1.4, 1.5, -4.4], [1.4, 1.45, 1.2], 34, 0.0006), 12: ROOM(12, 1.4),
  13: one(13, [0, 1.8, -7.4], [0, 1.6, 0.5], 36, 0.0006),
  14: NEAR(14),
  15: ROOM(15, 1.9, -5.6, 2.0), 16: ROOM(16, 1.5, -6.6, 2.0), 17: ROOM(17, 2.0, -5.8, 2.05),
  18: one(18, [0, 1.8, -7.2], [0, 1.7, 1], 36, 0.0006),
  19: NEAR(19), 20: NEAR(20, 0.2),
  21: DECK(21),
  22: ROOM(22, 2.0, -6.6, 2.0), 23: ROOM(23, 1.3, -5.6, 2.0), 24: ROOM(24, 1.5, -6.4, 2.0), 25: ROOM(25, 1.3, -6.2, 2.0), 26: ROOM(26, 1.5, -6.2, 2.1), 27: ROOM(27, 1.5, -6.2, 2.0),
  28: one(28, [0, 1.9, -7.5], [0, 2.6, 4], 38, 0.0005),
  29: one(29, [0, 1.8, -7.4], [0, 1.7, 1], 36, 0.0006),
  30: one(30, [SHORE, 2.4, -7], [SHORE, 2.6, 30], 38, 0.0005),
  31: ROOM(31, 1.6, -6.0, 2.0),
  32: TOWN(32), 33: TOWN(33, 0, 0.0003),
};
export const camAtLL = (id: number, f: number): Cam => run(CAMS[id], f);
export const dofAtLL = dofFrom([{ f: 0, cInf: 0 }] as Dof[]);

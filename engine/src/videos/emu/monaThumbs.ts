// Thumbnail scenes for "The Man Who Stole the Mona Lisa": three variants, one per frame (0, 1, 2), built from the
// film's own rooms, cast and drawings. Rendered as stills without captions; the words are added by scripts/thumb2.py.
// Chosen against the 14 thumbnails that rank for this story today (out/mona/review/thumbnail-survey.md): nobody
// shows the lump under the smock, the trunk, or the newspapers; nobody has a narrator reacting; nearly all are dark.
import { Cam, ShotDef, layersFrom, dofFrom, Dof } from "./story";
import { CamInfo } from "./castbase";
import { Scene, Show } from "./scenes";
import { Pen, INK } from "./toon";
import { fxPanel, fxHooks, fxFrameEmpty, fxFrontPage } from "./monatoon";
import { PER_SMOCK, PER, PER_SUIT, PER_SOLDIER, PICASSO, GERI, POGGI, LEONARDO, DETECTIVE, JUDGE, EDITOR, DIRECTOR, APOLLINAIRE, PHOTOG } from "./monacast";
import { STUDIO, SHOP, COUNTRY, country, police, court, newsroom, directorRoom, poetStudy, photoStudio } from "./monaSets";
import { Sh, ROOM, P, S, sir, fx, room, office } from "./monaKit";

type P2 = [number, number];
/** the lump under the smock: white cloth pulled tight over a rectangle, a corner of gilt frame showing below the hem. 520 x 700 canvas */
const fxLump = (p: Pen) => {
  p.poly([[300, 560], [470, 540], [486, 660], [318, 684]], "#e2b33c", 11); p.poly([[330, 586], [446, 572], [456, 636], [340, 652]], "#6a4a2a", 6);
  const c: P2[] = [[70, 90], [250, 40], [440, 70], [480, 300], [470, 560], [300, 600], [90, 570], [50, 320]];
  p.poly(c, "#f4f1ea", 12);
  p.clip(c, () => { for (const [a, b] of [[[120, 80], [100, 580]], [[250, 50], [270, 600]], [[400, 70], [420, 580]]] as [P2, P2][]) p.stroke([a, b], 6, "#c9c4b6"); p.poly([[50, 470], [480, 440], [480, 620], [50, 620]], "rgba(120,110,90,0.18)", 0); });
  p.poly(c, null, 12);
  for (const y of [170, 280, 390]) { p.dot(262, y, 13, INK); p.dot(262, y, 8, "#c9c4b6"); }
};

/** an open trunk in two parts, so that the painting can stand between them: the raised lid (760 x 420) and the box (760 x 420) */
const fxLid = (p: Pen) => { p.poly([[40, 400], [90, 40], [670, 40], [720, 400]], "#6a4528", 12); p.poly([[96, 372], [132, 84], [628, 84], [664, 372]], "#8a5a34", 7); for (const x of [250, 510]) p.poly([[x - 22, 400], [x - 14, 40], [x + 14, 40], [x + 22, 400]], "#4a2f1a", 6); };
const fxBox = (p: Pen) => { p.poly([[30, 20], [730, 20], [730, 400], [30, 400]], "#8a5a34", 12); p.poly([[30, 20], [730, 20], [730, 70], [30, 70]], "#6a4528", 8); for (const x of [200, 560]) p.poly([[x - 26, 20], [x + 26, 20], [x + 26, 400], [x - 26, 400]], "#4a2f1a", 6); p.poly([[340, 96], [420, 96], [420, 170], [340, 170]], "#e2b33c", 7); p.dot(380, 136, 10, INK); };

const T: Sh[] = [
  // A: the thief strolls off with a rectangular lump under his smock, past the four bare hooks; Sir Digsworth aghast, pointing
  { name: "thumb A: under his smock", a: 0, zone: "louvre", cam: [[0.25, 1.4, 0.9], [0.25, 1.45, 6], 34, 0], draw: (c) => {
    fx(c, "hooksBig", 700, 920, (p) => fxHooks(p, 0), 0.8, 1.72, 5.86, 1.1);
    S(c, PER_SMOCK, -0.72, 4.45, { phase: 0.14, expr: "grin", scale: 0.96 });
    fx(c, "lump", 520, 700, fxLump, -0.74, 0.86, 4.36, 0.52, -0.05);
    sir(c, 1.02, 3.4, { expr: "shock", point: 1 });
  } },
  // B: the open trunk in his room, the painting standing in it; Sir Digsworth beside it in horror
  { name: "thumb B: two years in a trunk", a: 1, zone: "louvre", cam: [[ROOM - 1.25, 1.3, 0.2], [ROOM - 1.25, 1.25, 3], 34, 0], draw: (c) => {
    // on the free floor under the window, clear of the room's table
    fx(c, "tLid", 760, 420, fxLid, ROOM - 1.8, 0.98, 3.2, 1.36);
    fx(c, "tPanel", 460, 640, (p) => fxPanel(p), ROOM - 1.8, 1.02, 3.05, 0.66, 0.05);
    fx(c, "tBox", 760, 420, fxBox, ROOM - 1.8, 0.4, 2.9, 1.4);
    sir(c, ROOM - 0.6, 2.2, { expr: "shock", look: -1 });
  } },
  // C: an empty gilt frame and front pages with her face on every one; Sir Digsworth shrugs
  { name: "thumb C: famous by theft", a: 2, zone: "louvre", cam: [[0.25, 1.4, 0.9], [0.25, 1.45, 6], 34, 0], draw: (c) => {
    fx(c, "frameE", 700, 920, fxFrameEmpty, -0.15, 1.3, 5.86, 1.0);
    ([[-1.12, 1.42, -0.1], [-1.62, 0.86, 0.14], [-0.62, 0.72, 0.06]] as const).forEach(([x, y, r], i) => fx(c, "fp" + i, 600, 760, (p) => fxFrontPage(p, ["LE MATIN", "THE TIMES", "LA STAMPA"][i], i % 2 ? "MONA LISA|GONE!" : "MONA LISA|STOLEN!"), x, y, 5.0 - i * 0.1, 0.8, r));
    sir(c, 1.02, 3.4, { expr: "smile", shrug: 1 });
  } },
  // ---- frames 3..: previews of the sets (not thumbnails): look at these after changing a room ----
  { name: "set: Picasso's studio", a: 3, zone: "louvre", cam: room(STUDIO, 0), draw: (c) => { P(c, PICASSO, STUDIO + 1, 2.6, {}); } },
  { name: "set: Geri's shop", a: 4, zone: "louvre", cam: room(SHOP, 0), draw: (c) => { P(c, GERI, SHOP + 2.6, 3.4, {}); P(c, POGGI, SHOP - 1, 2.6, {}); } },
  { name: "set: country, village", a: 5, zone: "louvre", cam: [[COUNTRY, 1.8, -7], [COUNTRY, 2.6, 10], 40, 0], draw: (c) => { country(c, "village"); P(c, PER, COUNTRY, 1.5, {}); } },
  { name: "set: country, france", a: 6, zone: "louvre", cam: [[COUNTRY, 1.8, -7], [COUNTRY, 2.6, 10], 40, 0], draw: (c) => { country(c, "france"); P(c, LEONARDO, COUNTRY, 1.5, {}); } },
  { name: "set: country, front", a: 7, zone: "louvre", cam: [[COUNTRY, 1.8, -7], [COUNTRY, 2.6, 10], 40, 0], draw: (c) => { country(c, "front"); P(c, PER_SOLDIER, COUNTRY, 1.5, {}); } },
  { name: "set: police", a: 8, zone: "office", cam: office(-2.4), draw: (c) => { police(c); P(c, DETECTIVE, -2.2, 2.4, {}); } },
  { name: "set: court", a: 9, zone: "office", cam: office(0), draw: (c) => { court(c, "it"); P(c, JUDGE, 0, 1.3, {}, { y: 0.55 }); P(c, PER_SUIT, 2.2, 0.2, { back: true }); } },
  { name: "set: newsroom", a: 10, zone: "office", cam: office(4.4), draw: (c) => { newsroom(c); P(c, EDITOR, 4.4, 2.4, {}); } },
  { name: "set: director", a: 11, zone: "office", cam: office(-2.4), draw: (c) => { directorRoom(c); P(c, DIRECTOR, -2.2, 2.4, {}); } },
  { name: "set: poet", a: 12, zone: "office", cam: office(-2.4), draw: (c) => { poetStudy(c); P(c, APOLLINAIRE, -2.2, 2.4, {}); } },
  { name: "set: photo studio", a: 13, zone: "office", cam: office(4.4), draw: (c) => { photoStudio(c); P(c, PHOTOG, 4.4, 2.4, {}); } },
];
const SHOTS_T: ShotDef[] = T.map((s, i) => ({ id: i + 1, name: s.name, a: i, b: i + 1, zone: s.zone, light: "day" as const, sunAz: 210 }));
const camAtT = (id: number): Cam => { const [pos, look, fov] = T[id - 1].cam; return { pos, look, fov, roll: 0 }; };
const sceneAtT = (id: number, _f: number, cam: CamInfo): Scene => {
  const out: Scene = { places: [], fx: [], guns: [], crates: [], fan: 0 };
  T[id - 1].draw({ out, f: 1000, a: 0, b: 2000, n: 1000, t: 33.3, cam });
  return out;
};
export const THUMB_SHOW: Show = { shots: SHOTS_T, camAt: camAtT, sceneAt: sceneAtT, crowdFor: () => null, wheatAt: () => 1 };
export const layersT = layersFrom(SHOTS_T, {});
export const dofAtT = dofFrom([{ f: 0, cInf: 0 }] as Dof[]);
export { P };

// "The Man Who Stole the Mona Lisa", shots 71-89: the rest of chapter 6 (the wrong men) and chapter 7 (the trunk).
// +x is screen-left.
import { fxCalendar } from "./dailytoon";
import { fxThumb, fxLens, fxHandLetter, fxStatue, fxEasel, fxCloth, fxFile, fxOtherPortrait, fxPanel } from "./monatoon";
import { PER, GUARD2, WORK1, WORK2, WORK3, PLUMBER, COPS, DETECTIVE, JUDGE, PIERET, APOLLINAIRE, PICASSO, FOLK } from "./monacast";
import { ramp } from "./story";
import { Sh, Ctx, at, STAIR, ROOM, WALL_Y, room, P, S, walk, wav, fx, pop, ban, tag, stamp, sparkle, sweat, wall, sayTo, thinkTo, bubTo, nameOver, hold, q } from "./monaKit";
import { STUDIO, police, poetStudy, court } from "./monaSets";
import { louvre } from "./monaShots1";
import { fxBarsD, fxSackD, fxThenD, fxBurstD, fxRevealD, fxTrunkD, fxInsetD, fxArrowD, sideHand, TrunkD } from "./monaPropsD";

const PS = { scale: 0.9 };
const cal = (c: Ctx, f0: number, head: string, big: string, x: number, y: number, z: number, w: number, col = "#d8382f", f1 = 1e9) => pop(c, f0, `cal|${head}|${big}`, 420, 480, (p) => fxCalendar(p, head, big, col), x, y, z, w, 0, f1);
/** the thief's room: the table with the cloth over her */
const clothTable = (c: Ctx) => fx(c, "cloth0", 620, 300, (p) => fxCloth(p, 0), ROOM - 0.1, 1.08, 2.85, 1.15);
/** the trunk stands against the back wall of his room, between the table and the bed */
const T_X = ROOM + 1.7, T_Z = 3.5;
/** where Peruggia stands beside it, in the gap between the table and the trunk */
const P_X = ROOM + 0.84, P_Z = 3.05;
const trunkD = (c: Ctx, o: TrunkD) => fx(c, `trunkD|${o.open ? 1 : 0}|${o.panel ?? 0}|${o.things ?? 0}|${o.cut ? 1 : 0}`, 900, 820, (p) => fxTrunkD(p, o), T_X, 0.592, T_Z, 1.3);
/** Picasso's studio: his easel, and the two stone heads on the stool */
const studio = (c: Ctx, statues: boolean) => {
  fx(c, "easelcubist", 640, 1040, (p) => fxEasel(p, "cubist"), STUDIO - 0.95, 0.795, 3.6, 0.95);
  if (statues) for (const s of [-1, 1]) fx(c, "statue", 320, 440, fxStatue, STUDIO + 2.6 + s * 0.15, 0.875, 3.6, 0.34);
};
const STUDIO_CAM = room(STUDIO, 1.8, -2.8, 0, 1.2);
const COURT_CAM: Sh["cam"] = [[0.3, 2.0, -6.2], [0.3, 1.65, 1.5], 34, 0.0005];
const TRUNK_CAM: Sh["cam"] = [[ROOM + 0.95, 1.6, -1.15], [ROOM + 0.95, 0.79, 3.05], 36, 0];
/** where the two men stand in front of the judge's bench (one each side of it), and a walker who is glad to go */
const CX = 1.45, CZ = -0.25;
const glad = { v: 1.2, expr: "smile" as const };

export const SHOTS_3B: Sh[] = [
  { name: "he once worked as secretary to the poet Guillaume Apollinaire", a: at("s6_3", "He") - 3, zone: "office", cam: [[-2.3, 1.75, -5.0], [-2.3, 1.6, 1.5], 34, 0], draw: (c) => {
    poetStudy(c);
    const PX = -0.4, PZ = 1.6, reach = 0.55;
    P(c, APOLLINAIRE, -2.2, 2.4, { expr: "smile", look: 1 });
    // his secretary hands him a letter across the end of the desk
    P(c, PIERET, PX, PZ, { expr: "smile", look: -1, facing: -1, point: reach });
    fx(c, "letterA", 620, 780, (p) => fxHandLetter(p), PX - 0.231 - 0.204 * reach - 0.11, 1.18, PZ - 0.06, 0.3, 0.12);
    // no card on the books: the poet's name sits over his head on the bare wall between the shelves, the secretary's beside him against the panelling
    ban(c, c.a + 18, "HIS FORMER|ASSISTANT", PX + 0.95, 1.05, PZ - 0.05, 1.1);
    ban(c, at("s6_3", "Guillaume") - 3, "THE POET|APOLLINAIRE", -2.2, 2.07, 2.35, 1.3);
  } },
  { name: "two of the statues have ended up with his friend Pablo Picasso", a: at("s6_3", "And") - 3, zone: "louvre", x: 8, cam: STUDIO_CAM, draw: (c) => {
    const pb = at("s6_3", "Pablo") - 3, named = c.f >= pb;
    studio(c, true);
    P(c, PICASSO, STUDIO + 1.2, 2.9, { expr: named ? "grin" : "smile", look: named ? 0 : 1, facing: named ? 0 : 1, wave: wav(c, named && c.f < pb + 36) }, { scale: 0.92 });
    tag(c, c.a + 10, "TAKEN FROM", "THE LOUVRE", STUDIO + 2.62, 1.45, 3.6, 0.95);
    nameOver(c, pb, "THE PAINTER|PABLO PICASSO", STUDIO + 1.2, 2.9, { scale: 0.92, w: 1.4 });
  } },
  { name: "Apollinaire and Picasso panic and give the statues back", a: at("s6_4") - 4, zone: "louvre", cam: STUDIO_CAM, draw: (c) => {
    const th = at("s6_4", "They") - 3, PX = STUDIO + 1.2, PZ = 2.9, AX = STUDIO + 0.3, AZ = 2.7, t0 = c.a - 4, arr = t0 + 30;
    studio(c, c.f < th);
    // Apollinaire hurries in, they panic, then they carry the heads away in a bag
    if (c.f < arr) walk(c, APOLLINAIRE, STUDIO - 1.9, AX, AZ, t0, { v: 2.2 });
    else if (c.f < th + 4) { P(c, APOLLINAIRE, AX, AZ, { expr: "shock", look: 1, cheer: 0.6 }); sweat(c, AX - 0.44, 1.62, AZ - 0.05); }
    else walk(c, APOLLINAIRE, AX, STUDIO + 9, AZ, th + 4, { v: 0.8 });
    if (c.f < th) { P(c, PICASSO, PX, PZ, { expr: c.f >= arr - 8 ? "shock" : "neutral", look: -1, cheer: c.f >= arr ? 0.7 : undefined }, { scale: 0.92 }); if (c.f >= arr) sweat(c, PX + 0.4, 1.5, PZ - 0.05); }
    else if (c.f < th + 10) { P(c, PICASSO, PX, PZ, { expr: "shock", look: 1, facing: 1 }, { scale: 0.92 }); hold(c, "sackD", 460, 480, fxSackD, PX, PZ, 1, 0.5, { scale: 0.92 }); }
    else {
      const x = walk(c, PICASSO, PX, STUDIO + 9, PZ, th + 10, { scale: 0.92, v: 0.8 }), d = x - PX, [hx, hy] = sideHand(d > 0 ? (d / 1.6) % 1 : undefined, 0.92);
      fx(c, "sackD", 460, 480, fxSackD, x + hx, hy - 0.221, PZ - 0.06, 0.5);
    }
    stamp(c, th + 26, "RETURNED", STUDIO + 2.3, 1.9, 3.6, 1.3);
  } },
  { name: "on 7 September the police arrest Apollinaire: surely they have the Mona Lisa too", a: at("s6_5") - 4, zone: "office", x: 8, cam: [[-0.6, 1.9, -5.3], [-0.6, 1.23, 1.5], 34, 0], draw: (c) => {
    police(c);
    const on = at("s6_5", "On") - 3, ar = at("s6_5", "arrest") - 3, iff = at("s6_5", "If") - 3, t0 = c.a - 6, arr = t0 + 92;
    P(c, DETECTIVE, -2.2, 2.4, { expr: "stern", look: 1 });
    // two policemen bring him in and stand him in front of the detective's desk; at "arrest" one takes him by the arm
    walk(c, COPS[0], 5.2, 0.0, 1.75, t0, { v: 1.7, then: { expr: "neutral", look: 1 } });
    walk(c, APOLLINAIRE, 6.0, 0.8, 1.45, t0, { v: 1.7, then: { expr: c.f >= ar ? "shock" : "neutral", look: -1 } });
    walk(c, COPS[2], 6.8, 1.6, 1.7, t0, { v: 1.7, then: { expr: "neutral", look: -1, point: c.f >= ar ? 1 : undefined } });
    // the wall keeps to the map, the notices and one date; the detective's reasoning comes after the date has gone
    cal(c, on, "SEPTEMBER 1911", "7", -1.5, 3.15, 5.8, 1.15, "#d8382f", iff);
    thinkTo(c, iff, -2.2, 2.4, fxThenD, "thenD", 900, 360, 1.15, { side: 1, w: 2.0, top: 1.95 });
  } },
  { name: "the poet spends several days in prison", a: at("s6_6") - 4, zone: "louvre", x: 8, cam: [[STAIR - 3.05, 1.5, -2.4], [STAIR - 3.05, 1.45, 4], 34, 0.0006], draw: (c) => {
    const HX = STAIR - 2.2;
    // he stands in a gap between two bars, a hand on each; nothing is laid over the bars
    P(c, APOLLINAIRE, HX, 2.3, { expr: "pained", headTilt: 5, cheer: 0.8 });
    fx(c, "barsD", 1200, 800, fxBarsD, HX - 0.127, 1.7, 1.6, 6.0);
  } },
  { name: "Picasso is brought before the judge: he is terrified", a: at("s6_6", "Then") - 3, zone: "office", x: 8, cam: COURT_CAM, draw: (c) => {
    court(c, "fr");
    const te = at("s6_6", "terrified") - 3, t0 = c.a - 6, arr = t0 + 62;
    P(c, JUDGE, 0, 1.3, { expr: "stern", look: 1 }, { y: 0.55, shadow: false });
    // a policeman walks him in to the front of the bench and leaves again
    if (c.f < arr) walk(c, PICASSO, 5.6, CX, CZ, t0, { scale: 0.92, v: 2.0 });
    else { P(c, PICASSO, CX, CZ, { expr: c.f >= te ? "shock" : "pained", look: -1, facing: -1 }, { scale: 0.92 }); if (c.f >= te) sweat(c, CX + 0.38, 1.5, CZ - 0.05); }
    if (c.f < arr + 2) walk(c, COPS[1], 6.8, 2.65, 0.35, t0, { v: 2.0 });
    else walk(c, COPS[1], 2.65, 8, 0.35, arr + 2, { v: 2.4, gone: true });
  } },
  { name: "face to face with his friend, Picasso says he has never seen him before", a: at("s6_7") - 4, zone: "office", cam: [[0, 1.85, -5.0], [0, 1.82, 1.3], 34, 0.0004], draw: (c) => {
    court(c, "fr");
    const nv = at("s6_7", "never") - 3, t0 = c.a - 4, arr = t0 + 57, deny = c.f >= nv;
    P(c, JUDGE, 0, 1.3, { expr: "stern", look: deny ? 1 : c.f >= arr ? -1 : 1 }, { y: 0.55, shadow: false });
    // the two friends face each other across the bench; then Picasso turns away from him
    P(c, PICASSO, CX, CZ, deny ? { expr: "pained", look: 1, facing: 1, shrug: q(ramp(c.f, nv, nv + 8), 8) || undefined } : { expr: "shock", look: -1, facing: -1 }, { scale: 0.92 });
    sweat(c, CX + 0.4, 1.5, CZ - 0.05);
    if (c.f < arr) walk(c, APOLLINAIRE, -4.3, -CX, CZ, t0, { v: 1.5 });
    else S(c, APOLLINAIRE, -CX, CZ, { mirror: true, expr: c.f >= nv + 10 ? "shock" : "smile" });
    sayTo(c, nv, "I don't know|this man!", CX, CZ, { side: -1, w: 1.2, scale: 0.92 });
    pop(c, nv + 10, "burstUp", 320, 320, (p) => fxBurstD(p, 3, -2.25, -0.9), -CX + 0.22, 1.9, CZ - 0.05, 0.32, 0, nv + 34);
  } },
  { name: "there is no evidence at all: both men are let go", a: at("s6_8") - 4, zone: "office", cam: COURT_CAM, draw: (c) => {
    court(c, "fr");
    const no = at("s6_8", "no") - 3, bo = at("s6_8", "Both") - 3, le = at("s6_8", "let") - 3, free = c.f >= bo;
    P(c, JUDGE, 0, 1.3, { expr: "neutral", shrug: c.f >= no && !free ? q(ramp(c.f, no, no + 8), 8) || undefined : undefined }, { y: 0.55, shadow: false });
    tag(c, no, "PROOF AGAINST THEM", "NONE", 3.0, 3.3, 5.8, 2.0, "#f6efd8", bo);
    // both throw up their arms, then each walks out the way he came
    if (c.f < bo + 14) P(c, PICASSO, CX, CZ, { expr: free ? "relief_open" : "neutral", look: free ? 0 : -1, cheer: free ? 0.8 : undefined }, { scale: 0.92 });
    else walk(c, PICASSO, CX, 9, CZ, bo + 14, { ...glad, scale: 0.92 });
    if (c.f < bo + 18) P(c, APOLLINAIRE, -CX, CZ, { expr: free ? "relief_open" : "neutral", look: free ? 0 : 1, cheer: free ? 0.8 : undefined });
    else walk(c, APOLLINAIRE, -CX, -9, CZ, bo + 18, glad);
    stamp(c, le, "RELEASED", 3.0, 3.3, 5.8, 2.4);
  } },
  { name: "two great artists, for a few days simply suspects; but they did not steal her", a: at("s6_9") - 4, zone: "paris", x: 8, cam: [[0, 0.9, -3.2], [0, 1.75, 0.8], 42, 0.0003], draw: (c) => {
    const su = at("s6_9", "suspects") - 3, bu = at("s6_9", "But") - 3, ex = c.f >= bu ? "grin" : c.f >= su ? "pained" : "smile";
    louvre(c);
    // seen from low down: the two men stand tall in front of the museum; two name cards at one height, and one stamp between and above them
    P(c, APOLLINAIRE, 1.35, 0.8, { expr: ex, look: -1 }); P(c, PICASSO, -1.35, 0.8, { expr: ex, look: 1 }, { scale: 0.92 });
    ban(c, c.a + 8, "THE POET|APOLLINAIRE", 1.35, 2.15, 0.75, 1.6); ban(c, c.a + 14, "THE PAINTER|PICASSO", -1.35, 2.15, 0.75, 1.6);
    stamp(c, su, "UNDER SUSPICION", 0, 2.8, 0.75, 1.6, 0.06, bu);
    stamp(c, bu, "INNOCENT", 0, 2.8, 0.75, 1.6, -0.06);
  } },
  { name: "the man who did is still in Paris, and the police are about to knock", a: at("s6_10") - 4, zone: "louvre", x: 8, cam: room(ROOM, 0.5, -2.6, 0.0005, 1.25), draw: (c) => {
    const kn = at("s6_10", "knock") - 3, PX = ROOM + 1.5, heard = c.f >= kn;
    clothTable(c);
    P(c, PER, PX, 2.5, { expr: heard ? "shock" : "smile", look: -1, facing: -1 }, PS);
    nameOver(c, c.a + 8, "THE REAL THIEF|VINCENZO PERUGGIA", PX, 2.5, { scale: 0.9, w: 2.2, f1: kn });
    // the knocking comes from the door, off screen to the right, clear of the bed; he turns toward it
    [0, 12, 24, 40, 52].forEach((d, k) => pop(c, kn + d, "burstIn", 320, 320, (p) => fxBurstD(p, 5, Math.PI - 1.0, Math.PI + 1.0), ROOM - 1.72, 1.2 + (k % 2) * 0.25, 1.0, 0.95, 0, kn + d + 11));
    bubTo(c, kn + 6, "bang", PX, 2.5, { scale: 0.9, side: 1, w: 0.8, top: 1.64 });
  } },
  // ---------------- 7. the trunk ----------------
  { name: "the police question everyone who has worked at the Louvre, including a house painter", a: at("s7_1") - 5, zone: "office", x: 8, cam: [[-0.05, 1.9, -5.4], [-0.05, 1.23, 1.5], 34, 0], draw: (c) => {
    police(c);
    const an = at("s7_1", "And") - 3, PX = 2.35, PZ = 1.85;
    P(c, DETECTIVE, -2.2, 2.4, { expr: "stern", look: 1 });
    // a queue in front of his desk, everybody facing him
    S(c, PLUMBER, -0.2, 1.7, { expr: "neutral" }); S(c, WORK1, 0.65, 1.95, { expr: "neutral" }); S(c, WORK3, 1.5, 1.7, { expr: "stern" });
    S(c, PER, PX, PZ, { scale: 0.9, expr: "neutral" }); if (c.f >= an) sweat(c, PX + 0.34, 1.4, PZ - 0.05);
    S(c, WORK2, 3.2, 1.65, { expr: "neutral" });
    ban(c, c.a + 8, "ONE BY ONE|ALL MUSEUM STAFF", 3.9, 3.35, 5.8, 3.0, "#fff3c4", an);
    // the card and its arrow single out the short man in the brown jacket
    ban(c, an, "AMONG THEM|THE THIEF HIMSELF", PX, 2.4, PZ - 0.05, 1.8);
    pop(c, an + 4, "ban|arrowD", 200, 300, fxArrowD, PX, 1.92, PZ - 0.05, 0.26);
  } },
  { name: "a detective comes to his room, asks, looks around, believes him and leaves", a: at("s7_2") - 4, zone: "louvre", x: 8, cam: room(ROOM, -0.1, -3.4, 0.0005, 1.3), draw: (c) => {
    const ak = at("s7_2", "asks") - 3, an = at("s7_2", "answer") - 3, lo = at("s7_2", "looks") - 3, be = at("s7_2", "believes") - 3, le = at("s7_2", "leaves") - 3;
    const DX = ROOM + 0.85, DZ = 1.45, PX = ROOM - 1.2, PZ = 1.8, t0 = c.a - 4, arr = t0 + 61;
    // the covered table stands between the two men the whole time
    clothTable(c);
    P(c, PER, PX, PZ, { expr: c.f >= be ? "relief" : "neutral", look: 1 }, PS); if (c.f < be) sweat(c, PX + 0.36, 1.42, PZ - 0.05);
    if (c.f < arr) walk(c, DETECTIVE, ROOM + 4.3, DX, DZ, t0, { v: 1.5 });
    else if (c.f < le) {
      const looking = c.f >= lo && c.f < be, s = Math.sin((c.f - lo) / 6);
      if (looking) P(c, DETECTIVE, DX, DZ, { expr: "stern", look: s < 0 ? 1 : -1, facing: -1, point: 0.7 }); else S(c, DETECTIVE, DX, DZ, { expr: c.f >= be ? "smile" : "stern" });
      if (looking) fx(c, "lens", 340, 340, fxLens, DX - 0.374 - 0.198, 1.16 + 0.198, DZ - 0.06, 0.46, -Math.PI / 2);
    } else walk(c, DETECTIVE, DX, ROOM + 7, DZ, le, { v: 0.6 });
    sayTo(c, ak, "21 August.|Your alibi?", DX, DZ, { side: -1, w: 1.55, top: 1.95, f1: an });
    sayTo(c, an, "I can|explain.", PX, PZ, { side: 1, w: 1.5, scale: 0.9, f1: lo });
    bubTo(c, be, "tick", DX, DZ, { thought: true, side: -1, w: 0.9, top: 1.95, f1: le + 6 });
  } },
  { name: "the Mona Lisa is in that room", a: at("s7_3") - 8, zone: "louvre", cam: [[ROOM - 0.1, 2.5, 1.2], [ROOM - 0.1, 0.87, 2.85], 30, 0.0009], draw: (c) => {
    // seen from above: she lies on the table, and the cloth is drawn back from her face
    const k = Math.round(ramp(c.f, c.a + 14, c.a + 36) * 10) / 10;
    c.out.fx.push({ key: `revealD${k}`, cw: 1100, ch: 860, draw: (p) => fxRevealD(p, k), x: ROOM - 0.1, y: 0.89, z: 2.9, w: 0.98, h: (0.98 * 860) / 1100, flat: true, rot: Math.PI });
  } },
  { name: "the thumbprint, and his fingerprints in the police's own files: nobody puts them together", a: at("s7_4") - 4, zone: "office", x: 8, cam: [[-2.2, 1.3, -2.3], [-2.2, 1.506, 2.4], 34, 0], draw: (c) => {
    police(c);
    const po = at("s7_4", "police") - 3, nb = at("s7_4", "Nobody") - 3, X = -2.2, Z = 2.4, two = c.f >= po, lost = c.f >= nb, s = Math.sin((c.f - po) / 7);
    // the detective holds the print from the Louvre in one hand and the thief's record in the other, and does not see it
    P(c, DETECTIVE, X, Z, lost ? { expr: "neutral", shrug: 1 } : two ? { expr: "neutral", cheer: 1, look: s > 0 ? -1 : 1 } : { expr: "neutral", wave: 0, look: -1 });
    fx(c, "thumbG", 440, 440, (p) => fxThumb(p), lost ? X - 0.52 : X - 0.53, lost ? 1.3 : 1.65, Z - 0.06, 0.5);
    if (two) fx(c, "file", 600, 720, (p) => fxFile(p), lost ? X + 0.53 : X + 0.552, lost ? 1.37 : 1.73, Z - 0.06, 0.5);
    // one label at a time, in the order the narrator names them, on the bare wall above his head
    tag(c, c.a + 10, "LEFT ON THE GLASS", "ONE PRINT", X + 0.2, 2.44, Z - 0.05, 0.9, "#f6efd8", po + 4); tag(c, po + 4, "ALREADY ON RECORD", "HIS PRINTS", X + 0.2, 2.44, Z - 0.05, 0.9, "#f6efd8", nb);
    bubTo(c, nb + 6, "q", X, Z, { thought: true, side: 1, w: 0.8, top: 1.97 });
  } },
  { name: "she stays where she is: at first on his table, under a cloth", a: at("s7_5") - 4, zone: "louvre", x: 8, cam: room(ROOM, 0.25, -2.4, 0.0005, 1.2), draw: (c) => {
    clothTable(c);
    // his hand rests on the end of the cloth
    P(c, PER, ROOM + 0.95, 2.6, { expr: "smile", look: -1, facing: -1, point: 1 }, PS);
    tag(c, at("s7_5", "At") - 3, "HIDEAWAY", "No. 1", ROOM - 0.1, 2.15, 2.85, 1.2);
  } },
  { name: "then a wooden trunk with a false bottom: his things on top, the most wanted object in Europe underneath", a: at("s7_5", "Then") - 3, zone: "louvre", cam: [[T_X - 0.25, 0.96, T_Z - 3.2], [T_X - 0.25, 0.56, T_Z], 34, 0], draw: (c) => {
    const op = at("s7_5", "wooden") - 7, fa = at("s7_5", "false") - 3, hi = at("s7_5", "His", 1) - 3, mo = at("s7_5", "most") - 3;
    // the panel leans on the shut trunk; the lid opens and she stands in it; she is laid down under the board; his things go on top
    const open = c.f >= op, up = !open ? 0 : c.f < fa ? 1 : Math.round((1 - ramp(c.f, fa, fa + 8)) * 4) / 4, things = c.f < hi ? 0 : c.f < hi + 9 ? 1 : c.f < hi + 18 ? 2 : 3;
    if (!open) fx(c, "panelD", 460, 640, (p) => fxPanel(p), T_X - 0.28, 0.335, T_Z - 0.3, 0.42, 0.1);
    trunkD(c, { open, panel: up, things, cut: c.f >= fa + 8 });
    // both cards on the bare wall over the trunk, clear of the bed
    tag(c, c.a + 8, "HIDEAWAY", "No. 2", T_X + 0.28, 1.29, T_Z - 0.05, 0.6);
    ban(c, fa + 8, "A SECRET COMPARTMENT", T_X - 1.0, 1.19, T_Z - 0.05, 1.15);
    pop(c, mo, "bub|insetD", 700, 560, fxInsetD, T_X - 0.754, 0.531, T_Z - 0.02, 0.9);
  } },
  { name: "a house painter in a rented room, alone with Leonardo da Vinci", a: at("s7_6") - 4, zone: "louvre", cam: TRUNK_CAM, draw: (c) => {
    // he has taken her out of the open trunk and stood her on the table, his hand on the side of the panel
    trunkD(c, { open: true, panel: 0, things: 3 });
    P(c, PER, P_X, P_Z, { expr: "smile", look: -1, facing: -1, point: 1 }, PS);
    fx(c, "panelD", 460, 640, (p) => fxPanel(p), P_X - 0.39 - 0.19, 1.165, P_Z - 0.06, 0.42);
    sparkle(c, at("s7_6", "Leonardo") - 3, P_X - 0.58, 1.2, P_Z - 0.1, 0.3);
    ban(c, at("s7_6", "alone") - 3, "HIS ROOMMATE|THE MONA LISA", ROOM - 0.05, 1.85, P_Z - 0.05, 1.2);
  } },
  { name: "one year passes, then two", a: at("s7_7") - 4, zone: "louvre", cam: TRUNK_CAM, draw: (c) => {
    const tw = at("s7_7", "Then") - 3;
    trunkD(c, {});
    P(c, PER, P_X, P_Z, { expr: c.f >= tw ? "neutral" : "smile", look: 1 }, PS);
    // one calendar on the wall above the trunk: the year changes
    cal(c, c.a + 4, "PARIS", "1912", T_X + 0.2, 1.6, 3.9, 0.75, "#3a4150", tw); cal(c, tw, "PARIS", "1913", T_X + 0.2, 1.6, 3.9, 0.75, "#3a4150");
  } },
  { name: "the Louvre gives up and hangs a portrait by Raphael in her place; Paris stops looking", a: at("s7_8") - 4, zone: "louvre", x: 8, cam: [[0.2, 1.7, -1.8], [0.2, 1.3, 6], 34, 0], draw: (c) => {
    const gv = at("s7_8", "gives") - 3, hg = at("s7_8", "hangs") - 3, ra = at("s7_8", "Raphael") - 3, an = at("s7_8", "And") - 3, u = ramp(c.f, hg, hg + 24), done = c.f >= hg + 40;
    wall(c, "hooks");
    // the portrait leans against the wall under the four hooks; two workmen, seen from behind, lift it onto them, each holding one side of the frame
    fx(c, "otherPortrait", 700, 920, fxOtherPortrait, 0, q(0.69 + (WALL_Y - 0.69) * u, 100), 5.6, 1.0);
    const arms = c.f < hg || c.f >= hg + 30 ? undefined : Math.max(0.05, q(u, 20));
    // nobody leaves or enters the frame: the workmen turn round when it hangs, and a visitor who was looking at the big picture strolls past it without a glance
    P(c, WORK1, 0.82, 5.2, done ? { expr: "smile", look: -1 } : { back: true, cheer: arms }); P(c, WORK3, -0.82, 5.2, done ? { expr: "smile", look: 1 } : { back: true, cheer: arms });
    P(c, GUARD2, -1.5, 4.7, { expr: c.f >= an ? "smile_closed" : "neutral", look: 1, shrug: c.f >= gv && c.f < hg ? q(ramp(c.f, gv, gv + 8), 8) || undefined : undefined });
    if (c.f < an - 6) P(c, FOLK[12], -2.4, 4.0, { back: true });
    else walk(c, FOLK[12], -2.4, 9, 4.0, an - 6, { v: 1.5 });
    ban(c, ra, "THE STAND-IN|A RAPHAEL", 0, 2.97, 5.6, 2.2);
  } },
];

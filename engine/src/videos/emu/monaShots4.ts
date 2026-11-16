// "The Man Who Stole the Mona Lisa", shots 90-110: chapter 8 (a letter from Leonardo) and chapter 9 (why?).
import { fxCalendar, fxFlag3 } from "./dailytoon";
import { fxMona, fxPanel, fxHandLetter } from "./monatoon";
import { PER, PER_SUIT, LEONARDO, NAPOLEON, JUDGE, CARAB1, CARAB2, GERI, POGGI, MARQUIS, RICH, FOLK } from "./monacast";
import { Who } from "./castbase";
import { FrontOpts, Pen, INK, mix } from "./toon";
import { ramp, clamp01, FPS } from "./story";
import { Sh, Ctx, at, GAL, ROOM, FLOR, UFF, P, S, sir, walk, wav, fx, pop, ban, stamp, sparkle, sweat, wall, sayTo, thinkTo, bubTo, nameOver, underArm } from "./monaKit";
import { SHOP, COUNTRY, court, country } from "./monaSets";
import { frontHand, sideHand, fxDuomo, fxFlagPole, fxHotel, fxTrunk, fxFalseBottom, fxEnvelope, fxLetterPile, fxLetterHands, fxLensL, fxEaselPanel, fxWallPhone, fxDrawers, fxJug, fxToItaly, fxArmOver, fxCuffs, fxLire, fxPoliceHat, fxDoorPane } from "./monaPropsE";

type Cam = Sh["cam"];
type XY = [number, number];
const PS = { scale: 0.9 };
const cal = (c: Ctx, f0: number, head: string, big: string, x: number, y: number, z: number, w: number, col = "#d8382f", f1 = 1e9) => pop(c, f0, `cal|${head}|${big}`, 420, 480, (p) => fxCalendar(p, head, big, col), x, y, z, w, 0, f1);
/** monaKit's walk, and whether the walker has arrived */
const walkH = (c: Ctx, who: Who, x0: number, x1: number, z: number, f0: number, o: { scale?: number; v?: number; then?: FrontOpts; hide?: boolean; expr?: FrontOpts["expr"] } = {}) => {
  const v = o.v ?? 1.5, d = Math.abs(x1 - x0), u = clamp01((c.f - f0) / Math.max(1, (d / v) * FPS));
  const x = walk(c, who, x0, x1, z, f0, o);
  return { x, done: u >= 1, hand: sideHand(who, x, u > 0 && u < 1 ? ((d * u) / 1.6) % 1 : undefined, x1 > x0, o.scale ?? 1) };
};

// ---------------- hands on what is carried ----------------
/** an arm of `who` drawn over the thing he carries: from the shoulder s to the hand h that grips it ([x, y] in metres) */
const armOver = (c: Ctx, who: Who, s: XY, h: XY, z: number) => {
  const dx = Math.round((h[0] - s[0]) * 40) / 40, dy = Math.round((h[1] - s[1]) * 40) / 40, col = mix(who.o.jacket, INK, 0.5);
  fx(c, `arm${col}${dx}_${dy}`, 400, 400, (p) => fxArmOver(p, col, dx, dy), s[0] + dx / 2, s[1] + dy / 2, z, 0.6);
};
/** a picture carried against the body by somebody walking sideways: its top stays under the chin, and his arm comes down
 *  over it to a hand on its leading edge. mirror = he walks to the screen-left */
const carryPic = (c: Ctx, who: Who, key: string, cw: number, ch: number, draw: (p: Pen) => void, x: number, z: number, mirror: boolean, scale: number, w: number) => {
  const dir = mirror ? 1 : -1, cy = 0.66 * scale;
  fx(c, key, cw, ch, draw, x + dir * 0.02, cy, z - 0.06, w, -dir * 0.04);
  armOver(c, who, [x - dir * 0.02, 1.12 * scale], [x + dir * (w / 2 - 0.02), cy + (w * ch) / cw / 2 - 0.07], z - 0.08);
};
/** a picture clamped under the arm of somebody seen from the front (monaKit underArm), with that arm and its hand on it */
const underArmH = (c: Ctx, who: Who, key: string, cw: number, ch: number, draw: (p: Pen) => void, x: number, z: number, side: 1 | -1, w: number, scale: number, dy: number) => {
  underArm(c, key, cw, ch, draw, x, z, side, w, { scale, dy });
  armOver(c, who, [x + side * 0.165 * scale, 1.14 * scale], [x + side * (0.3 * scale - w / 2 + 0.03), 0.9 * scale + dy - (w * ch) / cw / 2 + 0.06], z - 0.08);
};

// ---------------- Florence: the square, the hotel ----------------
/** the cathedral square as a backdrop that closes the paved square in front of the lamps and trees of zone "paris" */
const duomo = (c: Ctx) => fx(c, "duomo", 2900, 820, fxDuomo, 0, 4.2, 13, 30.2);
/** Peruggia's trunk: ONE prop, 0.9 m wide, in every shot. y0 = what it stands on (the floor, the bed) */
const TRW = 0.99, TRH = (TRW * 760) / 900;
const trunkAt = (c: Ctx, st: number, x: number, y0: number, z: number) => fx(c, `trunk${st}`, 900, 760, (p) => fxTrunk(p, st), x, y0 + TRH / 2 - (12 / 760) * TRH, z, TRW);
/** the trunk carried as he walks sideways: it hangs by its handle from his swinging near hand, clear of the ground, in front of his legs */
const trunkCarry = (c: Ctx, [hx, hy]: XY, z: number) => trunkAt(c, 0, hx, Math.max(0.16, hy - 0.4), z - 0.06);

// ---------------- Geri's shop ----------------
// The people stand near the back wall, in front of the bare wall to the right of the street door, so that no card lies
// on a picture, on the door or on its window.
const SCAM: Cam = [[SHOP - 5.3, 1.9, -1.7], [SHOP - 5.3, 1.25, 3], 36, 0.0002];
const GZ = 3.9;
/** the pane of the street door, drawn over the bare white square of the set */
const doorPane = (c: Ctx) => fx(c, "doorPane", 400, 400, fxDoorPane, SHOP - 4.2, 1.9, 4.34, 0.84);

// ---------------- the hotel room: the left half of the Florence room (bed, washstand, a telephone on the wall) ----------------
const HCX = FLOR + 1.0, HCAM: Cam = [[HCX, 1.85, -4.2], [HCX, 1.22, 3], 36, 0.0003];
const PXH = HCX + 1.7, GXH = HCX - 0.7, PHONE = HCX - 2.34, BX = FLOR + 4.6;
const hotelRoom = (c: Ctx, off = false) => {
  fx(c, "drawers", 520, 520, fxDrawers, FLOR + 1.6, 0.53, 3.56, 1.0); fx(c, "jug", 320, 330, fxJug, FLOR + 1.3, 1.255, 3.86, 0.4);
  fx(c, `wallPhone${off}`, 400, 460, (p) => fxWallPhone(p, off), PHONE, 1.465, 4.28, 0.7);
};

// ---------------- the Uffizi ----------------
const easel = (c: Ctx) => fx(c, "easelPanel", 640, 1100, fxEaselPanel, UFF + 0.45, 1.127, 4.6, 1.3);

/** six forgeries in a row on the bare middle of the wall */
const FAKES = [1.8, 1.08, 0.36, -0.36, -1.08, -1.8];
/** six millionaires: where each comes in, where he stops, how deep, how tall (nobody stands in front of the doorway) */
const RICHP: [number, number, number, number][] = [[6.2, 1.85, 4.5, 1.0], [-6.2, -0.05, 4.7, 0.95], [-6.2, -0.95, 3.9, 1.0], [-6.2, -1.9, 4.7, 1.05], [-6.2, -2.85, 4.0, 0.97], [-6.2, -3.75, 4.5, 0.92]];

export const SHOTS_4: Sh[] = [
  // ---------------- 8. a letter from Leonardo ----------------
  { name: "November 1913, Florence, Italy", a: at("s8_1") - 5, zone: "paris", x: 10, cam: [[0, 1.8, -3.5], [0, 2.9, 20], 42, 0.0003], draw: (c) => {
    duomo(c); fx(c, "flagPole", 520, 1300, fxFlagPole, 6.2, 3.18, 9, 2.56);
    ban(c, c.a + 8, "TWO YEARS LATER|FLORENCE, 1913", -2.0, 3.5, 2, 2.4);
    S(c, FOLK[1], 3.55, 4.5, { expr: "smile" }); S(c, FOLK[0], 2.4, 4.5, { mirror: true, expr: "smile" });
    walk(c, FOLK[11], -5.2, -2.3, 2.6, c.a - 4, { v: 1.0 }); walk(c, FOLK[8], 1.4, -6, 9.5, c.a - 10, { v: 1.0 });
  } },
  { name: "an art dealer called Alfredo Geri opens a letter from Paris", a: at("s8_1", "art") - 6, zone: "louvre", x: 8, cam: SCAM, draw: (c) => {
    doorPane(c);
    const op = at("s8_1", "opens") - 3, gx = SHOP - 5.93, [hx, hy] = frontHand(GERI, gx, "point", 0.45);
    P(c, GERI, gx, GZ, { expr: c.f >= op + 14 ? "shock" : "smile", look: -1, facing: -1, point: 0.45 });
    if (c.f >= op) fx(c, "letterL", 620, 780, (p) => fxHandLetter(p, "Leonardo"), hx - 0.12, hy + 0.13, GZ - 0.06, 0.36, 0.1);
    else fx(c, "envelope", 320, 240, fxEnvelope, hx - 0.13, hy + 0.04, GZ - 0.06, 0.36, 0.08);
    nameOver(c, at("s8_1", "Alfredo") - 3, "ART DEALER|ALFREDO GERI", gx, GZ, { w: 1.5 });
  } },
  { name: "the writer has the Mona Lisa and wants to bring her home; he signs: Leonardo", a: at("s8_2") - 4, zone: "louvre", cam: [[SHOP - 0.7, 1.6, -0.5], [SHOP - 0.7, 1.6, 2.0], 30, 0.0002], draw: (c) => {
    const le = at("s8_2", "Leonardo") - 3, mona = c.f >= at("s8_2", "Mona") - 3, flag = c.f >= at("s8_2", "home") - 3, sign = c.f >= le;
    fx(c, `letterH${mona}${flag}${sign}`, 760, 1040, (p) => fxLetterHands(p, { cuff: "#b08a3a", mona, flag, sign: sign ? "Leonardo" : "" }), SHOP - 0.7, 1.546, 2.0, 1.0);
    sparkle(c, le, SHOP - 0.8, 1.47, 1.9, 0.3);
  } },
  { name: "Geri shows the letter to Giovanni Poggi of the Uffizi; they invite Leonardo to Florence", a: at("s8_3") - 4, zone: "louvre", cam: SCAM, draw: (c) => {
    // Geri holds the letter out to Poggi, who stands side-on, his nose at the sheet
    doorPane(c);
    const gi = at("s8_3", "Giovanni") - 3, to = at("s8_3", "Together") - 3, gx = SHOP - 4.87, px = gx - 1.15, pt = 0.45 + 0.35 * ramp(c.f, c.a + 12, c.a + 22), [hx, hy] = frontHand(GERI, gx, "point", pt);
    P(c, GERI, gx, GZ, { expr: c.f >= to ? "grin" : "smile", look: -1, facing: -1, point: pt });
    fx(c, "letterL", 620, 780, (p) => fxHandLetter(p, "Leonardo"), hx - 0.13, hy + 0.1, GZ - 0.06, 0.36, 0.12);
    S(c, POGGI, px, GZ, { mirror: true, expr: c.f < c.a + 26 ? "neutral" : c.f >= to ? "smile" : "shock" });
    nameOver(c, gi, "MUSEUM DIRECTOR|GIOVANNI POGGI", px, GZ, { w: 1.9, f1: to });
    sayTo(c, to, "Come and|see us!", px, GZ, { side: -1, w: 1.5 });
  } },
  { name: "in December a small man arrives with a wooden trunk", a: at("s8_4") - 4, zone: "paris", x: 8, cam: [[0, 1.4, -3.7], [0, 2.02, 20], 42, 0.0002], draw: (c) => {
    duomo(c);
    const w = walkH(c, PER_SUIT, 4.6, 1.1, 1.3, c.a - 8, { ...PS, v: 1.25, then: { expr: "smile", look: -1 } });
    if (w.done) trunkAt(c, 0, w.x + 0.8, 0.03, 1.3); else trunkCarry(c, w.hand, 1.3);
    ban(c, c.a + 6, "A FEW WEEKS LATER", -2.3, 3.1, 2, 1.9);
  } },
  { name: "he takes a room at the hotel Tripoli-Italia", a: at("s8_4", "He") - 3, zone: "paris", cam: [[0, 2.0, -5.5], [0, 1.66, 4.2], 30, 0.0003], draw: (c) => {
    // the door (x = 0.93) is near the middle; he carries the trunk up to it and arrives as the shot ends
    fx(c, "hotel", 1800, 1050, fxHotel, -0.98, 3.46, 4.2, 12);
    trunkCarry(c, walkH(c, PER_SUIT, 4.6, 0.93, 3.5, c.a - 4, { ...PS, v: 1.1 }).hand, 3.5);
  } },
  { name: "he tells the two men his price: 500,000 lire", a: at("s8_5") - 4, zone: "louvre", x: 8, cam: HCAM, draw: (c) => {
    const fv = at("s8_5", "Five") - 3;
    hotelRoom(c);
    P(c, PER_SUIT, PXH, 2.0, { expr: "grin", look: -1, facing: -1, point: c.f >= fv ? 0.5 : undefined }, PS); trunkAt(c, 0, PXH + 0.85, 0.03, 1.8);
    P(c, GERI, GXH, 2.0, { expr: c.f >= fv + 10 ? "shock" : "smile", look: 1, facing: 1 }); P(c, POGGI, HCX - 1.5, 2.2, { expr: c.f >= fv + 14 ? "shock" : "neutral", look: 1, facing: 1 });
    sayTo(c, fv, "L. 500,000!", PXH, 2.0, { side: -1, w: 2.0, top: 1.9, scale: 0.9 });
  } },
  { name: "he opens the trunk, lifts out the false bottom and unwraps a panel of poplar wood", a: at("s8_6") - 4, zone: "louvre", cam: [[BX - 0.05, 2.7, -2.2], [BX - 0.05, 1.19, 2.75], 34, 0.0002], mv: [[0.1, -0.15, 0.5], [0.1, 0, 0]], draw: (c) => {
    const st = c.f < at("s8_6", "opens") - 3 ? 0 : c.f < at("s8_6", "lifts") - 3 ? 1 : c.f < at("s8_6", "unwraps") - 3 ? 2 : 3, px = BX + 1.15, [hx, hy] = frontHand(PER_SUIT, px, "point", 0.8, 0.9);
    hotelRoom(c); trunkAt(c, st, BX, 0.65, 2.75);
    P(c, PER_SUIT, px, 2.75, { expr: st === 3 ? "grin" : "smile", look: -1, facing: -1, point: st >= 2 ? 0.8 : undefined }, PS);
    if (st === 2) fx(c, "falseBottom", 560, 380, fxFalseBottom, hx - 0.2, hy + 0.08, 2.69, 0.6, 0.25);
    if (st === 3) fx(c, "panelOut", 460, 640, (p) => fxPanel(p), hx - 0.24, hy + 0.24, 2.69, 0.56, 0.06);
    P(c, GERI, FLOR + 3.45, 3.0, { expr: st === 3 ? "shock" : "smile", look: 1 }); P(c, POGGI, FLOR + 2.75, 3.3, { expr: st === 3 ? "shock" : "neutral", look: 1 });
  } },
  { name: "Geri and Poggi keep very calm", a: at("s8_7") - 4, zone: "louvre", cam: [[FLOR + 2.875, 1.45, 0.3], [FLOR + 2.875, 1.45, 3.0], 30, 0.0009], draw: (c) => {
    const j = 0.012 * Math.sin(c.f * 1.9), gx = FLOR + 3.45, px = FLOR + 2.3;
    hotelRoom(c);
    P(c, GERI, gx + j, 3.0, { expr: "smile", look: 1 }); sweat(c, gx + 0.2, 1.66, 2.9);
    P(c, POGGI, px - j, 3.0, { expr: "smile", look: 1 }); sweat(c, px - 0.2, 1.66, 2.9);
  } },
  { name: "they take her to the Uffizi, to be sure", a: at("s8_7", "They") - 3, zone: "louvre", x: 8, cam: [[UFF + 0.45, 2.3, -2.0], [UFF + 0.45, 1.1, 6], 34, 0.0004], draw: (c) => {
    const pt = 0.8 + 0.04 * Math.sin(c.f / 9), px = UFF + 1.45, [hx, hy] = frontHand(POGGI, px, "point", pt);
    easel(c);
    P(c, POGGI, px, 4.4, { expr: "smile", look: -1, facing: -1, point: pt }); fx(c, "lensL", 340, 340, fxLensL, hx - 0.198, hy + 0.198, 4.3, 0.46);
    S(c, GERI, UFF - 0.7, 4.4, { mirror: true, expr: "nervous" });
    ban(c, at("s8_7", "Uffizi") - 3, "THE UFFIZI GALLERY", UFF + 0.45, 2.85, 5.4, 2.2);
  } },
  { name: "she is real", a: at("s8_8") - 8, zone: "louvre", cam: [[UFF + 0.45, 1.3, 1.77], [UFF + 0.45, 1.3, 4.6], 30, 0.0008], draw: (c) => {
    easel(c);
    stamp(c, at("s8_8", "real") - 3, "GENUINE", UFF - 0.31, 1.55, 4.5, 0.62);
  } },
  { name: "they promise Leonardo his money; then they call the police", a: at("s8_9") - 4, zone: "louvre", x: 8, cam: HCAM, draw: (c) => {
    // promised his money, Peruggia turns away to his trunk and dreams of it; behind his back Poggi goes to the telephone
    const th = at("s8_9", "Then") - 3, go = th - 16, px = PHONE + 0.553, pz = 3.6 + 0.72 * clamp01((c.f - go) / 14);
    hotelRoom(c, c.f >= th);
    if (c.f < th) P(c, PER_SUIT, PXH, 2.0, { expr: "grin", look: -1, facing: -1 }, PS); else S(c, PER_SUIT, PXH, 2.0, { mirror: true, expr: "grin", scale: 0.9 });
    trunkAt(c, 0, PXH + 0.85, 0.03, 1.8);
    // Geri, turned to Peruggia, promises the money: the bubble with the banknotes is his
    P(c, GERI, GXH, 2.0, { expr: "smile", look: 1, facing: 1 });
    thinkTo(c, c.a + 8, GXH, 2.0, fxLire, "lire", 420, 300, 0.5, { side: 1, w: 1.8, f1: th });
    P(c, POGGI, px, pz, c.f < go ? { expr: "smile", look: 1 } : { back: true, wave: c.f >= th ? 0 : undefined });
    thinkTo(c, th + 4, px, pz, fxPoliceHat, "policeHat", 360, 240, 0.4, { side: -1, w: 1.35 });
  } },
  { name: "Vincenzo Peruggia is arrested in his hotel room", a: at("s8_10") - 4, zone: "louvre", cam: HCAM, draw: (c) => {
    const ar = at("s8_10", "arrested") - 3, c1 = PXH - 0.55;
    hotelRoom(c);
    P(c, PER_SUIT, PXH, 2.0, { expr: c.f >= ar - 10 ? "shock" : "grin", look: -1, cheer: c.f >= ar ? 0.8 : undefined }, PS); trunkAt(c, 0, PXH + 0.85, 0.03, 1.8);
    // the first carabiniere stops side-on beside him with a hand on him; the second faces him, the handcuffs ready
    if (walk(c, CARAB1, HCX - 4.3, c1, 2.05, c.a - 12, { v: 2.6, expr: "stern" }) >= c1 - 0.01) armOver(c, CARAB1, [c1 + 0.02, 1.13], [PXH - 0.2, 0.98], 1.95);
    const w2 = walkH(c, CARAB2, HCX - 4.9, HCX - 0.75, 2.6, c.a - 4, { v: 2.5, then: { expr: "stern", look: 1, facing: 1 } });
    if (w2.done) { const [hx, hy] = frontHand(CARAB2, w2.x, "hangL"); fx(c, "cuffs", 200, 360, fxCuffs, hx, hy - 0.115, 2.54, 0.15); }
    stamp(c, ar, "CAUGHT", HCX + 0.2, 2.62, 2.4, 2.0);
  } },
  // ---------------- 9. why? ----------------
  { name: "so why did he do it?", a: at("s9_1") - 5, zone: "louvre", x: 8, cam: [[GAL + 0.3, 2.2, -2.6], [GAL + 0.3, 1.22, 6], 34, 0.0006], draw: (c) => {
    wall(c, "other", GAL);
    sir(c, GAL + 1.0, 4.6, { shrug: ramp(c.f, c.a + 8, c.a + 16) });
    bubTo(c, c.a + 10, "q", GAL + 1.0, 4.6, { side: 1, w: 0.9 });
  } },
  { name: "Peruggia has an answer ready: he is a patriot", a: at("s9_2") - 4, zone: "office", x: 8, cam: [[1.6, 1.9, -6.6], [1.6, 1.5, 1.5], 34, 0.0004], draw: (c) => {
    court(c, "it");
    const pa = at("s9_2", "patriot") - 3, px = 3.2, on = c.f >= pa, [hx, hy] = frontHand(PER_SUIT, px, "cheerR", 0.45, 0.9);
    P(c, JUDGE, 0, 1.3, { expr: "stern", look: 1, facing: 1 }, { y: 0.55, shadow: false });
    P(c, CARAB1, 4.65, 0.5, { expr: "stern", look: -1, facing: -1 });
    P(c, PER_SUIT, px, 0.2, { expr: on ? "grin" : "smile", look: -1, facing: -1, cheer: on ? 0.45 : undefined }, PS);
    pop(c, pa, "flagIt", 360, 300, (p) => fxFlag3(p, "it"), hx - 0.262, hy + 0.245, 0.14, 0.62);
    sayTo(c, pa, "I did it|for Italy!", px, 0.2, { side: -1, w: 2.1, top: 1.9, scale: 0.9 });
  } },
  { name: "Napoleon stole her from Italy, he says, and he has simply brought her home", a: at("s9_2", "Napoleon") - 4, zone: "louvre", x: 8, cam: [[GAL, 2.4, -5], [GAL, 1.3, 6], 34, 0.0004], draw: (c) => {
    const br = at("s9_2", "brought") - 3, nx = GAL - 1.05;
    ban(c, c.a + 6, "PERUGGIA'S VERSION", GAL, 3.7, 5.4, 3.2);
    pop(c, c.a + 6, "tag|toItaly", 520, 300, fxToItaly, GAL + 1.55, 2.0, 5.9, 1.0);
    // Napoleon brings her in from Italy (the doorway on the left) and hangs her in the Louvre
    const n = walkH(c, NAPOLEON, GAL + 4.4, nx, 3.4, c.a + 6, { scale: 0.92, v: 2.6, then: { expr: c.f >= br ? "shock" : "grin", look: 1, facing: 1 } }), hung = n.x <= GAL + 0.1;
    if (!hung) carryPic(c, NAPOLEON, "monaCarry", 700, 920, (p) => fxMona(p), n.x, 3.4, false, 0.92, 0.5);
    if (n.done) nameOver(c, c.a + 6 + 66, "EMPEROR|NAPOLEON", nx, 3.4, { w: 1.3, top: 1.78, scale: 0.92 });
    wall(c, hung && c.f < br ? "mona" : "hooks", GAL);
    // Peruggia comes in after him and waits; then he takes her down and carries her back the way she came
    if (c.f < br - 22) walk(c, PER, GAL + 4.9, GAL + 2.5, 2.9, c.a + 36, { ...PS, v: 2.0, hide: true });
    else if (c.f < br) walk(c, PER, GAL + 2.5, GAL + 0.6, 2.9, br - 22, { ...PS, v: 2.6 });
    else carryPic(c, PER, "monaCarry", 700, 920, (p) => fxMona(p), walk(c, PER, GAL + 0.6, GAL + 4.9, 2.9, br, { ...PS, v: 1.8 }), 2.9, true, 0.9, 0.5);
  } },
  { name: "one problem: Napoleon never stole her", a: at("s9_3") - 4, zone: "louvre", cam: [[GAL + 0.5, 1.9, -2.6], [GAL + 0.5, 1.3, 6], 34, 0.0004], draw: (c) => {
    const nv = at("s9_3", "never") - 3, nx = GAL + 1.2;
    wall(c, "hooks", GAL);
    P(c, NAPOLEON, nx, 3.6, { expr: c.f >= nv ? "shock" : "grin", look: -1 }, { scale: 0.92 });
    underArmH(c, NAPOLEON, "monaArm", 700, 920, (p) => fxMona(p), nx, 3.6, -1, 0.5, 0.92, -0.1);
    stamp(c, nv, "NOT TRUE", GAL + 1.0, 2.8, 3.5, 1.7);
  } },
  { name: "Leonardo carried her to France himself, 250 years before Napoleon was born", a: at("s9_3", "Leonardo") - 3, zone: "louvre", x: 8, cam: [[COUNTRY, 1.5, -4.3], [COUNTRY, 1.9, 12], 40, 0.0003], draw: (c) => {
    country(c, "france");
    const w = walkH(c, LEONARDO, COUNTRY + 4.2, COUNTRY + 1.0, 1.5, c.a - 10, { v: 1.2, then: { expr: "smile", look: -1 } });
    if (w.done) underArmH(c, LEONARDO, "panelF", 460, 640, (p) => fxPanel(p), w.x, 1.5, 1, 0.42, 1, -0.14);
    else carryPic(c, LEONARDO, "panelF", 460, 640, (p) => fxPanel(p), w.x, 1.5, false, 1, 0.42);
    ban(c, c.a + 8, "FRANCE, 1516", COUNTRY + 2.95, 3.5, 2, 1.6);
    ban(c, at("s9_3", "two") - 3, "250 YEARS|BEFORE NAPOLEON", COUNTRY - 2.3, 3.4, 2, 2.4);
  } },
  { name: "a second problem: his letters to his family", a: at("s9_4") - 4, zone: "louvre", x: 8, cam: [[ROOM, 1.85, -2.6], [ROOM, 1.36, 3], 36, 0.0003], draw: (c) => {
    const le = at("s9_4", "letters") - 3, px = ROOM + 1.1, [hx, hy] = frontHand(PER, px, "point", 0.5, 0.9);
    P(c, PER, px, 2.9, { expr: "smile", look: -1, facing: -1, point: 0.5 }, PS);
    fx(c, "letterW", 620, 780, (p) => fxHandLetter(p, "Vincenzo"), hx - 0.11, hy + 0.1, 2.84, 0.3, 0.12);
    fx(c, "letterPile", 520, 300, fxLetterPile, ROOM - 0.1, 1.037, 2.6, 0.62);
    ban(c, le, "PROBLEM No. 2|HIS OWN WORDS", ROOM - 0.1, 2.58, 2.8, 2.4);
  } },
  { name: "four months after the theft he promises he is about to make his fortune", a: at("s9_4", "In") - 3, zone: "louvre", cam: [[ROOM + 1.5, 2.1, 0.6], [ROOM + 1.5, 2.1, 3.2], 30, 0.00015], draw: (c) => {
    const fm = at("s9_4", "four") - 3, on = c.f >= at("s9_4", "promises") - 3;
    fx(c, `letterV${on}`, 760, 1040, (p) => fxLetterHands(p, { cuff: "#6a5340", sign: "Vincenzo", quote: on ? "I will make|my fortune!" : undefined }), ROOM + 1.5, 2.073, 3.2, 1.0);
    cal(c, fm, "DECEMBER", "1911", ROOM + 2.3, 2.2, 3.15, 0.5, "#3a4150");
    ban(c, fm, "4 MONTHS|AFTER THE CRIME", ROOM + 0.71, 2.2, 3.15, 0.62);
  } },
  { name: "a third story: a mysterious marquis who sold six forgeries to six millionaires", a: at("s9_5") - 4, zone: "louvre", x: 8, cam: [[GAL, 2.25, -3.0], [GAL, 1.4, 4.65], 34, 0], mv: [[0, 0.15, -2.0], [0, -0.1, 0]], draw: (c) => {
    // the camera starts close on the marquis (left of the middle) and pulls back as his customers walk in
    const mq = at("s9_5", "marquis") - 3, s1 = at("s9_5", "six") - 3, s2 = at("s9_5", "six", 1) - 3, mx = GAL + 1.0;
    ban(c, c.a + 8, "THEORY No. 3", GAL, 3.3, 5.4, 2.2, "#fff3c4", mq - 12);
    walk(c, MARQUIS, GAL + 5.0, mx, 3.0, c.a + 10, { v: 1.5, then: { expr: "grin", cheer: c.f >= s1 ? 0.5 : undefined } });
    nameOver(c, mq - 12, "EDUARDO|DE VALFIERNO", mx - 0.35, 3.0, { w: 1.9, top: 2.15, f1: s1 });
    FAKES.forEach((x, k) => pop(c, s1 + k * 4, "monaFake", 700, 920, (p) => fxMona(p), GAL + x, 2.8, 5.85, 0.66));
    ban(c, s1 + 26, "6 FAKES", GAL, 3.56, 5.4, 1.3, "#ffd9c9");
    RICHP.forEach(([x0, x1, z, scale], k) => {
      const d = Math.abs(x1 - x0), on = c.f >= s2 + k * 3;
      const pose: FrontOpts = [{ expr: "grin", wave: wav(c, on, k) }, { expr: "laugh", cheer: on ? 0.5 : undefined }, { expr: "grin", cheer: on ? 0.75 : undefined }, { expr: "smile", wave: wav(c, on, k) }, { expr: "laugh", look: 1 }, { expr: "grin", cheer: on ? 0.35 : undefined, look: 1 }][k] as FrontOpts;
      const w = walkH(c, RICH[k], GAL + x0, GAL + x1, z, s2 - 3 - Math.round((d / 2) * FPS), { v: 2, hide: true, scale, then: pose });
      if (k === 2 && w.done && on) { const [hx, hy] = frontHand(RICH[2], w.x, "cheerR", 0.75, scale); fx(c, "lireHand", 420, 300, fxLire, hx - 0.03, hy + 0.08, z - 0.06, 0.34); }
    });
  } },
];

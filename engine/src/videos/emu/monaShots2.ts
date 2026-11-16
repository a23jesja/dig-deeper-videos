// "The Man Who Stole the Mona Lisa", shots 26-50: chapter 3 (Monday morning) and chapter 4 (four hooks).
// +x is screen-left. Where a camera looks down a little, the feet stand about 71 % down the frame, clear of the caption.
import { Pen } from "./toon";
import { Who } from "./castbase";
import { fxCalendar, fxNoHacker } from "./dailytoon";
import { fxBundle, fxSmock, fxMark, fxGlassPane, fxFrameEmpty, fxPanel, fxPliers, fxMona, fxCamera, fxEasel, fxClock2 } from "./monatoon";
import { fxStaffWall, fxSmockOk, fxOldStory, fxDoorB, fxLockB, fxPadlock, fxPanelBack, fxAtDoor, fxMonaPhoto, fxMonaAsk, fxBadge, fxBellB, fxSteps, fxHand, fxArm } from "./monaPropsB";
import { PER, PER_SMOCK, GUARD1, GUARD2, PORTER, WORK1, WORK2, WORK3, PLUMBER, BEROUD, PHOTOG, FOLK } from "./monacast";
import { ramp, clamp01 } from "./story";
import { Sh, Ctx, at, GAL, STAIR, WALL_Y, WALL_Z, near, ins, P, S, sir, walk, wav, fx, pop, ban, tag, bub, sparkle, sweat, wall, hold, underArm, sayTo, thinkTo, bubTo, nameOver } from "./monaKit";
import { photoStudio } from "./monaSets";
import { louvre } from "./monaShots1";

type Draw = (p: Pen) => void;
const PS = { scale: 0.9 };
const cal = (c: Ctx, f0: number, head: string, big: string, x: number, y: number, z: number, w: number, f1 = 1e9) => pop(c, f0, `cal|${head}|${big}`, 420, 480, (p) => fxCalendar(p, head, big, "#d8382f"), x, y, z, w, 0, f1);
/** a thing that turns up on frame f0 and then stands still on its base: (x, y0) = the middle of its foot */
const put = (c: Ctx, f0: number, key: string, cw: number, ch: number, draw: Draw, x: number, y0: number, z: number, w: number, rot = 0, soft = false) => {
  if (c.f < f0) return;
  const k = c.f - f0 < 5 ? 0.6 + 0.4 * ((c.f - f0 + 1) / 5) : 1, h = (w * ch) / cw;
  c.out.fx.push({ key, cw, ch, draw, x, y: y0 + (h * k) / 2, z, w: w * k, h: h * k, rot, ...(soft ? { soft: true } : {}) });
};
/** the wrapped painting on a man walking in side view (dir = -1 he walks to the screen-right, +1 to the screen-left): clamped against his side, below the chin */
const carry = (c: Ctx, x: number, z: number, dir: 1 | -1, y = 0) => fx(c, "bundle", 520, 400, fxBundle, x + dir * 0.05, 0.7 + y, z - 0.14, 0.6, -dir * 0.08);
/** the two hands of somebody who holds a flat thing in front of him by its side edges (hw = half its width) */
const grip = (c: Ctx, x: number, y: number, z: number, hw: number) => { for (const s of [-1, 1]) fx(c, "handB", 60, 60, fxHand, x + s * hw, y, z, 0.085); };
/** the bare panel clamped under his arm, on its side, below the chin */
const panelArm = (c: Ctx, x: number, y: number, z: number, side: 1 | -1) => {
  fx(c, "panel", 460, 640, (p) => fxPanel(p), x + side * 0.27, y + 0.78, z - 0.14, 0.5, side * (Math.PI / 2 - 0.1));
  fx(c, "handB", 60, 60, fxHand, x + side * 0.3, y + 0.55, z - 0.2, 0.085);
};
const tuck = (c: Ctx, x: number, z: number, side: 1 | -1) => underArm(c, "bundle", 520, 400, fxBundle, x, z, side, 0.6, { scale: 0.9 });

// ---------------- the staff door, in the wall of the Louvre (zone "paris", seen from close) ----------------
const DOOR = 22.5, WALL_ZP = 30.9, LANE = 30.1;
/** the stretch of wall with the staff door at x = DOOR (its notice is part of the drawing). The far drawing of the Louvre
 *  is not used in these shots: the wall fills the frame */
const staffWall = (c: Ctx) => fx(c, "staffWall", 3200, 1200, fxStaffWall, DOOR + 1, 3, WALL_ZP, 16);
const porter = (c: Ctx, fo: Parameters<typeof P>[4]) => P(c, PORTER, DOOR - 1.2, 30.35, fo);
/** somebody walks along the wall to the door at xd, turns his back to us and steps into the dark of the doorway */
const goIn = (c: Ctx, who: Who, x0: number, xd: number, z: number, f0: number, o: { scale?: number; v?: number } = {}) => {
  const v = o.v ?? 1.3, fa = f0 + Math.round((Math.abs(xd - x0) / v) * 30), n = c.f - fa;
  if (c.f < f0 || n >= 10) return;
  if (n < 0) { walk(c, who, x0, xd, z, f0, { scale: o.scale, v }); return; }
  const u = n / 10, k = Math.round(255 - 170 * u);
  P(c, who, xd, z + 0.3 * u, { back: true, mode: "march", phase: 0.25 + 0.5 * u }, { scale: (o.scale ?? 1) * (1 - 0.05 * u), shadow: n < 4 }).tint = (k << 16) | (k << 8) | Math.min(255, k + 14);
};

// ---------------- the back stairs (room STAIR): the steps on the screen-left, the door to the outside on the back wall ----------------
const SD_X = STAIR - 2.6, KNOB_X = SD_X - 0.388, KNOB_Y = 1.07;
/** shake = it is being pushed or rattled */
const stairDoor = (c: Ctx, state: number, shake = false) => fx(c, `doorB${state}`, 520, 900, (p) => fxDoorB(p, state), SD_X + (shake ? 0.012 * Math.sin(c.f * 2.4) : 0), 1.22, 4.8, 1.4, shake ? 0.005 * Math.sin(c.f * 2.4) : 0);
/** the height of the stairs under somebody at depth z */
const stepY = (z: number) => Math.max(0, Math.min(1.8, 0.435 * (z - 0.44)));
/** what he leaves on the stairs, against the banister: the glass on the second step, the frame two steps higher */
const leftGlass = (c: Ctx, f0 = -1e9) => put(c, f0, "glassPane", 560, 760, fxGlassPane, STAIR + 2.62, 0.4, 1.26, 0.86, -0.17, true);
const leftFrame = (c: Ctx, f0 = -1e9) => put(c, f0, "frameE", 700, 920, fxFrameEmpty, STAIR + 2.72, 0.6, 1.72, 1.0, -0.11);
/** where he stands at the foot of the stairs */
const FOOT_X = STAIR + 4.5, FOOT_Z = 0.3;

export const SHOTS_2: Sh[] = [
  // ---------------- 3. Monday morning ----------------
  { name: "Monday 21 August 1911, seven in the morning", a: at("s3_1") - 5, zone: "paris", light: "golden", x: 8, cam: [[0, 1.6, -6], [0, 2.2, 20], 42, 0.0005], draw: (c) => {
    // he comes in close to us, left of the middle, and stops there turned to the museum; the date and the hour up in the sky
    louvre(c);
    cal(c, c.a + 6, "AUGUST", "21", -1.45, 3.6, 1, 0.9);
    pop(c, at("s3_1", "Seven") - 3, "clock7", 320, 320, (p) => fxClock2(p, 7, 0), -2.75, 3.6, 1, 0.85);
    walk(c, PER, 4.6, 1.3, -1, c.a, { ...PS, v: 1.3, then: { expr: "smile", look: -1, facing: -1 } });
  } },
  { name: "the Louvre is closed: only workmen in white smocks go in", a: at("s3_2") - 4, zone: "paris", light: "golden", cam: [[23.7, 1.55, 22.5], [23.7, 1.12, 30.9], 40, 0.0004], draw: (c) => {
    // the staff door is a door in the wall of the museum; three different workmen, unevenly spaced, walk in through it
    staffWall(c);
    porter(c, { expr: "smile", look: 1, facing: 1 });
    goIn(c, WORK1, 29.7, DOOR, LANE, c.a - 60, { v: 1.35 });
    goIn(c, WORK2, 29.9, DOOR, LANE - 0.25, c.a + 5, { v: 1.3 });
    if (c.f >= c.a + 40) goIn(c, WORK3, 30.3, DOOR, LANE + 0.1, c.a + 40, { v: 1.4 });
    ban(c, at("s3_2", "same") - 3, "ALL DRESSED ALIKE", DOOR + 2.5, 2.8, 30, 2.0);
  } },
  { name: "Peruggia puts on a white smock and walks in", a: at("s3_3") - 4, zone: "paris", light: "golden", cam: [[24.1, 1.5, 24.4], [24.1, 1.12, 30.9], 40, 0.0003], draw: (c) => {
    // the smock hangs from his hand, he holds it out, then he is in it (a sparkle) and walks to the door
    const pu = at("s3_3", "puts") - 2, on = pu + 14, wk = at("s3_3", "walks") - 6, x0 = DOOR + 3.6;
    staffWall(c);
    porter(c, { expr: "neutral", look: 1, facing: 1 });
    if (c.f < pu) { P(c, PER, x0, LANE, { expr: "smile", look: -1 }, PS); hold(c, "smock", 380, 600, fxSmock, x0, LANE, -1, 0.36, { scale: 0.9 }); }
    else if (c.f < on) { P(c, PER, x0, LANE, { expr: "smile", look: -1, point: 1 }, PS); fx(c, "smock", 380, 600, fxSmock, x0 - 0.4, 0.575, LANE - 0.15, 0.62); }
    else if (c.f < wk) P(c, PER_SMOCK, x0, LANE, { expr: "grin", look: -1, facing: -1 }, PS);
    else walk(c, PER_SMOCK, x0, DOOR + 1.4, LANE, wk, { ...PS, v: 1.25, then: { expr: "smile", look: -1, facing: -1 } });
    sparkle(c, on, x0, 1.1, LANE - 0.3, 0.8);
  } },
  { name: "nobody at the door knows he has left: they see the smock", a: at("s3_4") - 4, zone: "paris", light: "golden", cam: [[22.5, 1.5, 23.9], [22.5, 0.95, 30.9], 40, 0.0004], draw: (c) => {
    // Peruggia | the door | the porter. The porter looks at him, thinks "a smock: fine", waves him in, and he goes in
    const nb = at("s3_4", "Nobody") - 3, wk = nb + 32, px = DOOR + 1.7, inn = wk + Math.round((1.7 / 1.25) * 30), X = c.b - 4;
    staffWall(c);
    porter(c, { expr: c.f >= nb ? "smile" : "neutral", look: c.f >= inn + 8 ? 0 : 1, facing: c.f >= inn + 8 ? 0 : 1, wave: wav(c, c.f >= wk - 12 && c.f < inn) });
    if (c.f < wk) P(c, PER_SMOCK, px, LANE, { expr: c.f >= nb + 12 ? "smile" : "nervous", look: -1, facing: -1 }, PS);
    else goIn(c, PER_SMOCK, px, DOOR, LANE, wk, { ...PS, v: 1.25 });
    tag(c, c.a + 8, "NO LONGER", "ON THE STAFF", px, 2.74, LANE - 0.05, 1.0, "#f6efd8", wk);
    thinkTo(c, nb, DOOR - 1.2, 30.35, fxSmockOk, "smockOk", 700, 600, 0.6, { side: -1, w: 1.6, f1: X });
  } },
  { name: "for a hundred years: he hid in a cupboard all night", a: at("s3_5") - 4, zone: "louvre", x: 8, cam: [[STAIR - 1.0, 1.9, -3.4], [STAIR - 1.0, 1.25, 3.9], 36, 0.0005], draw: (c) => {
    // he stands by the door, at its depth, and looks at the old story (a picture on a card); it is crossed out and he shrugs
    const by = at("s3_5", "By") - 3, px = STAIR - 0.85, pz = 3.9;
    stairDoor(c, 0);
    pop(c, c.a + 6, "tag|oldStory", 700, 760, fxOldStory, STAIR + 0.95, 2.15, 4.6, 1.7);
    pop(c, by, "noCup", 320, 320, (p) => fxMark(p, false), STAIR + 0.95, 1.98, 4.5, 0.95);
    P(c, PER_SMOCK, px, pz, c.f < by ? { expr: "neutral", look: 1, facing: 1 } : { expr: "grin", shrug: c.f >= by + 10 ? 1 : undefined }, PS);
    ban(c, by + 8, "HIS VERSION|NO HIDING", px, 2.2, pz - 0.05, 1.45);
  } },
  { name: "you do not need a plan if you have the right coat", a: at("s3_5", "It") - 3, zone: "louvre", cam: [[STAIR - 1.1, 1.5, -3.1], [STAIR - 1.1, 1.5, 5], 34, 0.0007], draw: (c) => {
    // the smock hangs on its peg on the wall; he points at it
    const pl = at("s3_5", "plan") - 3, co = at("s3_5", "coat") - 3;
    stairDoor(c, 0);
    sir(c, STAIR + 0.5, 2.6, { headTilt: c.f >= pl && c.f < co ? 5 * ramp(c.f, pl, pl + 8) : 0, point: c.f >= co ? ramp(c.f, co, co + 8) : undefined, expr: c.f >= co ? "grin" : "smile" });
    fx(c, "smock", 380, 600, fxSmock, STAIR - 1.0, 1.6, 4.96, 1.0); sparkle(c, co, STAIR - 1.0, 2.0, 4.8, 0.8);
  } },
  { name: "he waits until the Salon Carre is empty", a: at("s3_6") - 4, zone: "louvre", x: 8, cam: [[0.8, 1.8, -3.6], [0.8, 1.5, 6], 34, 0.0005], draw: (c) => {
    // he waits by the doorway until the guard has walked out of the room
    wall(c, "glass");
    const gx = walk(c, GUARD1, -1.3, -8.5, 3.4, c.a + 4, { v: 1.2, gone: true });
    P(c, PER_SMOCK, 2.15, 4.6, { expr: gx < -5.5 ? "grin" : "neutral", look: -1, facing: -1 }, PS);
  } },
  { name: "he lifts her off her four hooks and carries her to the staircase", a: at("s3_6", "Then") - 3, zone: "louvre", cam: [[1.9, 1.7, -1.5], [1.9, 0.8, 6], 34, 0.0006], draw: (c) => {
    // his back to us, both hands under the frame the whole time: he lifts it off the hooks, lowers it to his chest and
    // sidesteps with it to the doorway, as one carries a big picture
    const lf = at("s3_6", "lifts") - 3, t0 = lf + 34, z = 5.3;
    const up = ramp(c.f, lf + 12, lf + 20), dn = ramp(c.f, lf + 22, lf + 32), cv = ramp(c.f, lf + 3, lf + 11) * (1 - 0.65 * dn);
    wall(c, "hooks");
    let x = 0;
    if (c.f < lf + 3) x = walk(c, PER_SMOCK, 0.9, 0, z, c.a - 6, { ...PS, v: 1.5 });
    else {
      x = c.f < t0 ? 0 : Math.min(3.3, (0.85 * (c.f - t0)) / 30);
      P(c, PER_SMOCK, x, z, { back: true, cheer: cv, ...(c.f >= t0 && x < 3.3 ? { mode: "march" as const, phase: ((x / 0.7) % 1 + 1) % 1, lift: 25 } : {}) }, { ...PS, y: 0.07 * up * (1 - dn) });
    }
    const w = 1 - 0.1 * dn, y1 = c.f >= lf + 11 ? 1.026 + 0.2675 * cv + 0.07 * up * (1 - dn) + 0.657 * w : WALL_Y, z1 = WALL_Z - 0.1 * up - 0.15 * dn;
    fx(c, "monaglass", 700, 920, (p) => fxMona(p, true), x, y1, z1, w, 0.03 * up * (1 - dn));
  } },
  { name: "on the stairs he takes off the glass case and the frame", a: at("s3_7") - 4, zone: "louvre", x: 8, cam: [[STAIR + 3.4, 1.9, -4.5], [STAIR + 3.4, 1.0, 3], 36, 0.0005], draw: (c) => {
    // he stands on the stairs, the picture upright on the step beside him under his hand, looking at it. Off comes the glass
    // (it leans on the banister), then the frame (beside it); the bare panel goes under his arm and he comes down
    const gl = at("s3_7", "glass") - 3, fr = at("s3_7", "frame") - 3, lv = at("s3_7", "leaves") - 3, px = FOOT_X, zs = 1.36;
    const u = ramp(c.f, lv, lv + 26), z = zs - (zs - FOOT_Z) * u, y = 0.4 * (1 - u);
    leftFrame(c, fr); leftGlass(c, gl);
    if (c.f < fr) {
      P(c, PER_SMOCK, px, zs, { expr: "neutral", look: -1, facing: -1, point: 1 }, { ...PS, y: 0.4 });
      fx(c, c.f < gl ? "monaglass" : "monamona", 700, 920, (p) => fxMona(p, c.f < gl), px - 0.88, 0.4 + 0.657, 1.3, 1.0);
    } else {
      P(c, PER_SMOCK, px, z, u > 0 && u < 1 ? { mode: "march", phase: (u * 1.5) % 1, expr: "smile" } : { expr: "smile", look: -1, facing: u >= 1 ? 0 : -1 }, { ...PS, y });
      panelArm(c, px, y, z, -1);
    }
    sparkle(c, gl, STAIR + 2.58, 1.2, 1.0, 0.7); sparkle(c, fr, STAIR + 2.68, 1.6, 1.4, 0.7);
  } },
  { name: "now she is only a piece of wood", a: at("s3_8") - 4, zone: "louvre", cam: [[STAIR + 3.65, 1.3, -3.3], [STAIR + 3.65, 0.8, 0.3], 30, 0.001], draw: (c) => {
    // he holds the panel in front of him, a hand on each side edge, below his chin, and turns it round: bare poplar
    const turn = at("s3_8", "piece") + 2, px = FOOT_X, t = clamp01((c.f - turn) / 5), back = t > 0.5, kx = Math.max(0.05, Math.abs(Math.cos(Math.PI * t)));
    leftFrame(c); leftGlass(c);
    P(c, PER_SMOCK, px, FOOT_Z, { expr: back ? "grin" : "smile" }, PS);
    c.out.fx.push({ key: back ? "panelBack" : "panel", cw: 460, ch: 640, draw: back ? fxPanelBack : (p) => fxPanel(p), x: px, y: 0.65, z: FOOT_Z - 0.15, w: 0.52 * kx, h: 0.7235 });
    grip(c, px, 0.7, FOOT_Z - 0.2, 0.26 * Math.max(kx, 0.3));
    tag(c, turn + 6, "ONLY A PANEL OF", "POPLAR", px - 0.8, 0.7, FOOT_Z - 0.1, 0.66);
  } },
  { name: "he takes off his smock, wraps her in it and tucks her under his arm", a: at("s3_8", "takes") - 3, zone: "louvre", cam: [[STAIR + 3.6, 1.7, -4.4], [STAIR + 3.6, 0.75, 0.3], 36, 0.0006], draw: (c) => {
    // panel under one arm; the smock comes off into the other hand; he wraps (a hand on each end of the parcel); then it goes under his arm
    const so = at("s3_8", "smock") - 3, wr = at("s3_8", "wraps") - 3, tu = at("s3_8", "tucks") - 3, u = ramp(c.f, tu, tu + 8), px = FOOT_X, z = FOOT_Z;
    leftFrame(c); leftGlass(c);
    if (c.f < wr) {
      P(c, c.f < so ? PER_SMOCK : PER, px, z, { expr: "neutral" }, PS);
      panelArm(c, px, 0, z, -1);
      if (c.f >= so) hold(c, "smock", 380, 600, fxSmock, px, z, 1, 0.36, { scale: 0.9 });
    } else {
      P(c, PER, px, z, { expr: c.f >= tu ? "grin" : "neutral" }, PS);
      fx(c, "bundle", 520, 400, fxBundle, px + 0.27 * u, 0.74 + 0.07 * u, z - 0.14, 0.6, 0.1 * u);
      if (u < 0.5) grip(c, px, 0.76, z - 0.2, 0.27);
    }
    sparkle(c, so, px + 0.25, 0.9, z - 0.2, 0.6); sparkle(c, wr, px, 0.9, z - 0.2, 0.7);
  } },
  { name: "the door at the bottom of the stairs is locked", a: at("s3_9") - 4, zone: "louvre", cam: [[SD_X + 0.95, 1.6, -0.8], [SD_X + 0.75, 0.85, 4.4], 36, 0.0005], draw: (c) => {
    // he walks to the door, the parcel under his arm, and tries the knob with his free hand, his back to us; it does not give
    const lk = at("s3_9", "locked") - 3, xk = SD_X + 0.12, z = 4.4, f0 = c.a - 10, arr = f0 + Math.round((3.3 / 1.35) * 30);
    stairDoor(c, 0, c.f >= lk - 4 && c.f < lk + 14);
    if (c.f < arr) { const x = walk(c, PER, xk + 3.3, xk, z, f0, { ...PS, v: 1.35 }); carry(c, x, z, -1); }
    else { P(c, PER, xk, z, { back: true, point: ramp(c.f, arr, arr + 8) }, PS); tuck(c, xk, z, 1); }
    pop(c, lk + 4, "padlock", 300, 360, fxPadlock, SD_X + 0.12, 2.0, 4.55, 0.46);
  } },
  { name: "a screwdriver: he removes the doorknob", a: at("s3_10") - 4, zone: "louvre", cam: ins(KNOB_X, KNOB_Y + 0.12, 4.6, 2.9, 30, 0.0006), draw: (c) => {
    // the lock, close: his hand brings the screwdriver, its tip in a screw; the four screws come out one by one, then the knob is in his other hand
    const scr = at("s3_10", "screwdriver") - 3, rem = at("s3_10", "removes") - 3, off = c.f >= rem + 28;
    const n = c.f < rem + 4 ? 4 : Math.max(0, 3 - Math.floor((c.f - rem - 4) / 6)), tool = c.f >= scr, w = tool && !off ? Math.round(Math.sin(c.f * 1.3)) : 0;
    fx(c, `lockB${n}${tool}${w}${off}`, 1600, 900, (p) => fxLockB(p, n, tool, w, off), KNOB_X, KNOB_Y + 0.12, 4.6, 3.2);
  } },
  { name: "the door stays shut, and now he hears footsteps", a: at("s3_10", "stays") - 3, zone: "louvre", cam: [[SD_X + 0.95, 1.6, -0.8], [SD_X + 0.75, 0.85, 4.4], 36, 0.0006], draw: (c) => {
    // he pushes the door (the knob is gone: a hole), it does not move; he turns round; at the footsteps his head goes to the stairs
    const ft = at("s3_10", "footsteps") - 3, tn = c.a + 26, xk = SD_X + 0.12, z = 4.4;
    stairDoor(c, 1, c.f > c.a + 3 && c.f < tn - 6);
    if (c.f < tn) { P(c, PER, xk, z, { back: true, point: 1 }, PS); tuck(c, xk, z, 1); }
    else { P(c, PER, xk, z, c.f >= ft ? { expr: "shock", look: 1, facing: 1 } : { expr: "nervous", look: -1 }, PS); tuck(c, xk, z, 1); sweat(c, xk - 0.2, 1.47, z - 0.1); }
    bubTo(c, ft, "bang", xk, z, { side: 1, scale: 0.9, w: 0.8 });
    // the steps are heard from the stairs, off to the screen-left
    const sk = Math.floor(c.f / 5) % 2;
    pop(c, ft - 4, `steps${sk}`, 360, 300, (p) => fxSteps(p, sk), SD_X + 2.75, 1.3, 4.3, 1.1);
  } },
  { name: "it is a plumber called Sauvet: he sees a workman, not a thief", a: at("s3_11") - 4, zone: "louvre", cam: [[STAIR + 5.2, 1.8, -6.2], [STAIR + 3.0, 1.15, 0.4], 36, 0.0004], draw: (c) => {
    // the plumber comes down the stairs and stops at their foot; across the hall, far off, Peruggia waits by the door. What the plumber makes of it is in his bubble
    const se = at("s3_11", "sees") - 3, tf = at("s3_11", "He", 1) - 3, go = at("s3_11", "thief") + 12, X = STAIR + 4.2, z0 = 0.35, V = 0.054;
    const z = Math.max(z0, 2.0 - V * (c.f - c.a + 4)), arr = c.a - 4 + Math.ceil((2.0 - z0) / V);
    fx(c, "doorB1", 520, 900, (p) => fxDoorB(p, 1), SD_X, 1.22, 4.5, 1.4);
    P(c, PER, STAIR + 1.35, 0.9, { expr: "nervous", look: 1, facing: 1 }, PS); tuck(c, STAIR + 1.35, 0.9, -1);
    leftFrame(c); leftGlass(c);
    if (c.f < arr) P(c, PLUMBER, X, z, { mode: "march", phase: (((2.0 - z) / 0.92) % 1 + 1) % 1, expr: "neutral" }, { y: stepY(z) });
    else if (c.f < go) S(c, PLUMBER, X, z0, { expr: c.f >= se ? "smile" : "neutral" });
    else walk(c, PLUMBER, X, X - 4, z0, go, { v: 1.7 });
    nameOver(c, arr + 2, "A PLUMBER|SAUVET", X, z0, { w: 1.9, f1: se - 2 });
    thinkTo(c, se, X, z0, fxAtDoor, "atDoor", 600, 500, 0.9, { side: -1, w: 2.3, f1: tf });
    thinkTo(c, tf, X, z0, fxNoHacker, "noThief", 420, 420, 0.72, { side: -1, w: 2.3, f1: go });
  } },
  { name: "so the plumber opens it for him", a: at("s3_12") - 4, zone: "louvre", cam: [[SD_X + 0.9, 1.6, -0.8], [SD_X + 0.75, 0.95, 4.45], 36, 0.0006], draw: (c) => {
    // Peruggia on the right of the door, the plumber comes in from the left with his pliers, turns the spindle, the door
    // opens on daylight; the plumber steps aside, still turned to Peruggia, and waves him through
    const op = at("s3_12", "opens") + 6, open = c.f >= op, xs = SD_X + 0.11, z = 4.4, f0 = c.a - 6, arr = f0 + Math.round((1.4 / 1.8) * 30), bk = op + 3, gp = op + 12, xp = SD_X - 1.1, zp = 4.45;
    stairDoor(c, open ? 2 : 1);
    if (c.f < arr) walk(c, PLUMBER, xs + 1.4, xs, z, f0, { v: 1.8 });
    else if (c.f < bk) { P(c, PLUMBER, xs, z, { back: true, point: 1 }); if (!open) fx(c, "pliers", 360, 220, fxPliers, xs - 0.52, 1.14 + 0.02 * Math.sin(c.f * 1.6), z - 0.12, 0.34); }
    else { const u = ramp(c.f, bk, bk + 12); P(c, PLUMBER, xs + 1.0 * u, z, { expr: "smile", look: -1, facing: -1, ...(u < 1 ? { mode: "march" as const, phase: u } : { wave: wav(c, true) }) }); }
    const ar2 = gp + Math.round((1.05 / 1.8) * 30);
    if (c.f < gp) { P(c, PER, xp, zp, { expr: open ? "smile" : "nervous", look: 1, facing: 1 }, PS); tuck(c, xp, zp, -1); if (!open) sweat(c, xp - 0.2, 1.47, zp - 0.1); }
    else if (c.f < ar2) { const x = walk(c, PER, xp, SD_X - 0.05, zp, gp, { ...PS, v: 1.8 }); carry(c, x, zp, 1); }
    else { const u = clamp01((c.f - ar2) / 10); P(c, PER, SD_X - 0.05, zp + 0.08 * u, { back: true, mode: "march", phase: 0.25 + 0.5 * u }, PS); tuck(c, SD_X - 0.05, zp + 0.08 * u, 1); }
    sparkle(c, op, SD_X, 1.6, 4.4, 1.0);
  } },
  { name: "he walks out into the morning and goes home, with the Mona Lisa", a: at("s3_13") - 5, zone: "paris", light: "golden", x: 8, cam: [[5.4, 1.8, -6], [5.4, 2.0, 20], 42, 0.0004], mv: [[-5.2, 0, 0], [-5.2, 0, 0]], draw: (c) => {
    // the camera walks with him: he stays on the screen-left with the square ahead of him, and no lamp post ever stands behind him
    louvre(c);
    const x = 7.43 - 5.2 * ((c.f - c.a) / (c.b - c.a)), z = -0.5;
    S(c, PER, x, z, { ...PS, phase: ((((7.43 - x) / 1.6) % 1) + 1) % 1 });
    carry(c, x, z, -1); fx(c, "handB", 60, 60, fxHand, x - 0.04, 0.74, z - 0.2, 0.085);
    ban(c, at("s3_13", "With") - 3, "UNDER HIS ARM|THE PAINTING", x, 2.15, z - 0.1, 2.0, "#fff3c4", c.b - 4);
  } },
  { name: "and nobody notices", a: at("s3_14") - 8, zone: "louvre", x: 8, cam: [[0.9, 1.75, -2.6], [0.9, 0.9, 5.8], 34, 0.0009], draw: (c) => {
    // the four bare hooks between two guards who do not look: one dozes on his feet, the other strolls off whistling
    wall(c, "hooks");
    P(c, GUARD2, -1.15, 4.7, { expr: "smile_closed", headTilt: 5 });
    const x = 0.95 + 1.1 * ((c.f - c.a + 8) / 30);
    S(c, GUARD1, x, 4.5, { mirror: true, phase: ((((x - 0.95) / 1.6) % 1) + 1) % 1, expr: "whistle" });
  } },
  // ---------------- 4. four hooks ----------------
  { name: "all of Monday: four bare hooks; the guards are not alarmed", a: at("s4_1") - 5, zone: "louvre", cam: [[0, 1.75, -1.5], [0, 1.0, 5.8], 34, 0.0004], draw: (c) => {
    // the hooks are counted while the two guards stroll in from the sides; they look at the wall, turn and shrug
    const fo = at("s4_1", "four") - 2, no = at("s4_1", "not") - 3, X = c.b - 4;
    wall(c, "hooks");
    ([[190, 150], [510, 150], [190, 760], [510, 760]] as [number, number][]).forEach(([hx, hy], i) =>
      pop(c, fo + 4 * i, `hookNo${i + 1}`, 100, 100, (p) => fxBadge(p, i + 1), -(hx - 80 - 350) / 700, WALL_Y + (460 - hy - 12) / 700, WALL_Z - 0.02, 0.12));
    cal(c, c.a + 6, "MONDAY", "21", 1.85, 2.5, 5.6, 0.62, X);
    walk(c, GUARD1, 4.4, 1.3, 4.6, fo - 4, { v: 0.95, hide: true, then: c.f < no ? { back: true } : { expr: "neutral", look: -1, shrug: 1 } });
    walk(c, GUARD2, -4.4, -1.3, 4.6, fo + 6, { v: 0.95, hide: true, then: c.f < no + 5 ? { back: true } : { expr: "smile", look: 1, shrug: 1 } });
  } },
  { name: "the museum's photographers may take paintings to their studio", a: at("s4_2") - 4, zone: "office", x: 8, cam: [[4.4, 1.9, -5.6], [4.4, 1.1, 1.5], 34, 0.0005], draw: (c) => {
    // the photographer works his camera (his hand on it), which points at a painting on an easel
    const fl = (c.f - c.a) % 50 < 4 && c.f > c.a + 20, X = c.b - 4;
    photoStudio(c);
    fx(c, "easelother", 640, 1040, (p) => fxEasel(p, "other"), 3.2, 0.95, 2.6, 1.15);
    fx(c, `cam${fl}`, 560, 820, (p) => fxCamera(p, fl), 5.2, 0.79, 2.3, 1.05);
    P(c, PHOTOG, 6.0, 2.3, { expr: "smile", look: -1, facing: -1, point: 1 });
    ban(c, c.a + 8, "THE LOUVRE|PHOTO ROOM", 7.9, 3.1, 5.4, 2.6, "#fff3c4", X);
  } },
  { name: "the guards assume she is having her picture taken", a: at("s4_2", "guards") - 5, zone: "louvre", x: 8, cam: [[-0.3, 1.7, -1.5], [-0.3, 1.75, 6], 34, 0.0006], draw: (c) => {
    // the guard stands clear of the four hooks (all four stay visible); his thought belongs to him and stays off the painted figure
    wall(c, "hooks");
    P(c, GUARD2, -1.55, 5.0, { expr: "smile", look: 1 });
    const fl = (c.f - c.a) % 40 < 4;
    thinkTo(c, c.a + 6, -1.55, 5.0, (p) => fxMonaPhoto(p, fl), `monaPhoto${fl}`, 900, 520, 0.72, { side: -1, w: 1.4 });
  } },
  { name: "Tuesday: the painter Louis Beroud comes to paint her and finds four hooks", a: at("s4_3") - 5, zone: "louvre", cam: [[-0.3, 1.8, -4], [-0.3, 1.2, 5.8], 34, 0.0005], draw: (c) => {
    // two visitors study the big painting (one each side of its figure); the calendar hangs on bare wall. The painter, whole
    // in the frame from the start, carries his easel in ahead of him, sets it down, looks at the wall and sees the hooks
    const pa = at("s4_3", "painter") - 3, fi = at("s4_3", "finds") - 3, z = 5.0, x0 = 4.0, x1 = 2.3, f0 = pa - 8, fa = f0 + Math.round(((x0 - x1) / 1.0) * 30);
    wall(c, "hooks");
    cal(c, c.a + 6, "TUESDAY", "22", -1.4, 3.3, 5.6, 0.9);
    P(c, FOLK[4], -2.5, 4.3, { back: true }); P(c, FOLK[7], -4.1, 4.7, { back: true, headTilt: -3 });
    const x = walk(c, BEROUD, x0, x1, z, f0, { v: 1.0, gone: true });
    if (c.f >= fa) S(c, BEROUD, x1, z, { expr: c.f >= fi ? "shock" : "smile" });
    const k = ramp(c.f, fa, fa + 10), bob = c.f > f0 && k <= 0 ? 0.03 * Math.abs(Math.sin(((x0 - x) / 0.8) * Math.PI)) : 0, up = k <= 0 ? 0.16 : 0.16 * (1 - k);
    fx(c, "easelblank", 640, 1040, (p) => fxEasel(p, "blank"), x - 0.86 - 0.04 * k, 0.8125 + up + bob, z - 0.1 + 0.2 * k, 1.0, 0.07 * (1 - k));
    if (k < 1) fx(c, "armBe", 200, 80, (p) => fxArm(p, "#8a7c64"), x - 0.2, 0.98 + bob, z - 0.14, -0.36, 0.05);
    nameOver(c, fa + 2, "THE PAINTER|LOUIS BÉROUD", x1, z, { w: 1.9, f1: fi - 2 });
    bubTo(c, fi, "bang", x1, z, { side: 1 });
  } },
  { name: "he asks a guard when she will be back; the guard goes to ask", a: at("s4_4") - 4, zone: "louvre", cam: [[3.2, 1.75, -2.6], [3.2, 0.75, 5.8], 34, 0.0006], draw: (c) => {
    // the two men face each other: the painter points back at the hooks and asks (his bubble at his head), the guard
    // shrugs and walks off to ask
    const go = at("s4_4", "goes") - 3, X = c.b - 4;
    wall(c, "hooks");
    fx(c, "easelblank", 640, 1040, (p) => fxEasel(p, "blank"), 1.6, 0.88, 3.9, 1.0);
    P(c, BEROUD, 2.6, 3.6, { expr: "stern", look: 1, facing: 1, point: c.f < go ? 0.8 : undefined });
    thinkTo(c, c.a + 8, 2.6, 3.6, fxMonaAsk, "monaAsk", 700, 520, 0.56, { side: -1, w: 1.4, f1: Math.min(go + 20, X) });
    if (c.f < go) P(c, GUARD1, 4.63, 3.8, { expr: "neutral", look: -1, facing: -1, shrug: c.f >= c.a + 44 ? 1 : undefined });
    else walk(c, GUARD1, 4.63, 8.6, 3.8, go, { v: 1.8, gone: true });
  } },
  { name: "the photographers do not have her", a: at("s4_5") - 4, zone: "office", x: 8, cam: [[4.4, 1.9, -5.6], [4.4, 1.1, 1.5], 34, 0.0005], draw: (c) => {
    // the guard has come to ask; the photographer turns to him and shrugs (his bubble at his head); the easel holds another picture
    const X = c.b - 4;
    photoStudio(c);
    fx(c, "easelother", 640, 1040, (p) => fxEasel(p, "other"), 3.2, 0.95, 2.6, 1.15);
    fx(c, "camfalse", 560, 820, (p) => fxCamera(p), 5.2, 0.79, 2.3, 1.05);
    P(c, PHOTOG, 6.0, 2.3, { expr: c.f >= c.a + 10 ? "relief_open" : "neutral", look: 1, facing: 1, shrug: c.f >= c.a + 8 ? 1 : undefined });
    P(c, GUARD1, 7.7, 2.5, { expr: c.f >= c.a + 24 ? "stern" : "neutral", look: -1, facing: -1 });
    ban(c, c.a - 9, "THE LOUVRE|PHOTO ROOM", 7.9, 3.1, 5.4, 2.6, "#fff3c4", X);
    sayTo(c, c.a + 10, "She is|not here!", 6.0, 2.3, { side: -1, w: 1.5, top: 1.72, f1: X });
  } },
  { name: "eleven o'clock on Tuesday: she has been gone for more than a day", a: at("s4_6") - 4, zone: "louvre", x: 8, cam: [[0.3, 1.8, -2.6], [0.3, 1.2, 5.8], 34, 0.0005], draw: (c) => {
    // the guard runs back in from the doorway, stares at the hooks, throws up his hands; the bell rings, the second guard runs in.
    // Clock and bell hang on the plain wall either side of the hooks, the card between them
    const sh = at("s4_6", "She") - 3, X = c.b - 4;
    wall(c, "hooks");
    pop(c, c.a + 6, "clock11", 320, 320, (p) => fxClock2(p, 11, 0), 1.75, 3.05, 5.75, 0.8);
    const k = Math.round(Math.sin(c.f * 0.9) * 4) / 4;
    pop(c, sh, `bellB${k}`, 340, 340, (p) => fxBellB(p, k), -1.75, 3.05, 5.75, 0.8);
    walk(c, GUARD1, 5.0, 1.35, 4.6, c.a - 4, { v: 3.0, then: c.f < sh - 8 ? { back: true } : { expr: "shock", look: -1, cheer: 0.8 } });
    walk(c, GUARD2, -5.4, -1.35, 4.6, sh - 4, { v: 3.2, hide: true, then: { expr: "shock", look: 1, cheer: 0.8 } });
    tag(c, at("s4_6", "more") - 3, "MISSING SINCE", "MONDAY MORNING", 0, 3.0, 5.5, 1.45, "#ffd9c9", X);
  } },
];
export { clamp01, PER, WORK1, GAL, bub };

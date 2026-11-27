// The wardrobe (the cloud session, 25 Nov, after Jesper: "Varför ser alla gubbar likadan ut i videon, alla har keps, bara i olika färger"):
// the cap, the monocle and the moustache are Sir Digsworth's alone. This file is a copy of designs/flat.ts (A, Knopp, frozen) that draws
// other people on the same skeleton: their own hat (a tricorn, a scarf tied round the head, none with their own hair), beard (full, stubble,
// none), face (a child's larger eyes), body (broad, long and thin, small) and clothes (a captain's long coat with gold buttons, a sailor's
// striped shirt, a boy's too-big shirt). Rig and skin stay apart: the skeleton, the poses and every check read the same joints. Sir is never
// drawn from here (designs/flat.ts is untouched); a figure uses this design when its Look carries a `kit` (see kitOf).
import { Ink, P2, sym, spline, ellPts, seg, mid, add } from "../ink";
import { Sk, Side, Props } from "../rig";
import { Design, FigOpts, Face, Who, frame, torsoPts, J, limb, handAt, shoePts, layers, headPose, headToWorld, seated, type Look } from "../designs/common";

// ---------------- the wardrobe ----------------
export type Kit = {
  name: string;
  /** what is on the head */ hat: "tricorn" | "scarf" | "none";
  /** the hair under or instead of it */ hair: "messy" | "none";
  /** the beard */ beard: "full" | "stubble" | "none";
  /** a child's face: the eyes this much larger and a little lower */ eyes?: number;
  /** the body: the torso's rows scaled across (w) and in depth (d), the arms' and legs' widths */ body: { w: number; d: number; arm: number[]; leg: number[]; hem?: number };
  /** the clothes: a long coat with gold buttons and skirts over the thighs, a striped shirt, a big loose shirt */ top: "coat" | "stripes" | "shirt";
  col: Record<string, string>;
};
/** the kit a figure's Look carries, if any */
export const kitOf = (lk?: Look | null): Kit | null => ((lk as unknown as { kit?: Kit } | undefined)?.kit ?? null);
/** the kit being drawn (drawFlat sets it for each figure) */
const KIT: { k: Kit | null; sweat: number } = { k: null, sweat: 0 };
/** where a kit's mouth sits and how far it opens, per view (head frame): nearer the head's middle and smaller than Sir's, so the whole open
 *  mouth with its lip stays at least an ink line inside the head's outline at every angle and opening (the sheet's review: at Sir's place the
 *  open mouth reached the outline at the chin, in three-quarter and at 60 degrees) */
export const kitMouth = (view: "front" | "q" | "side", mouth: number, smirk = 0, tx = 0) => view === "q"
  ? { x: 30 + smirk * 4, y: -74 + 10 * (1 - Math.min(1, mouth / 0.5)), w: 15 * (1 + 0.3 * mouth), s: 0.58, m0: Math.max(mouth, 0.2) }
  : view === "front" ? { x: tx * 0.8 + smirk * 4, y: -70, w: 18 * (1 + 0.3 * mouth), s: 0.62, m0: Math.max(mouth, 0.2) }
  : { x: 50, y: -74, w: 11 * (1 + 0.3 * mouth), s: 0.48, m0: Math.max(mouth, 0.16) };
const kitMouthDraw = (k: Ink, view: "front" | "q" | "side", r: FR, tx = 0) => { const m = kitMouth(view, r.mouth, r.smirk, tx); k.clip(ellPts(0, -128, 117, 123, 0, 0, 360, 60), () => mouthAt(k, m.x, m.y, m.w, m.s, { ...r, mouth: m.m0 }, "#e0806e")); };
/** the hat's outline in the head's own frame for a view (fwd: 0 from the front, 0.7 three-quarter, 1 profile, facing +x), for the checks too */
export const hatOutline = (kit: Kit, fwd: number): P2[] => {
  if (kit.hat === "tricorn") return tricorn(fwd).hull;
  if (kit.hat === "scarf") return scarfPts(fwd);
  if (kit.hair === "messy") return messyHair(fwd);
  return [];
};
/** the tricorn's outline and the gold trim along its brim's edge toward us (head frame), as kitHat draws them: for 10b's words on the crown */
export const tricornTrim = (fwd: number) => { const t = tricorn(fwd), runs: P2[][] = []; let run: P2[] = [];
  for (const q of [...t.loop, t.loop[0]]) { if (q[2] > -20) run.push([q[0], q[1]]); else { if (run.length > 2) runs.push(run); run = []; } } if (run.length > 2) runs.push(run);
  return { hull: t.hull, trim: runs }; };
/** the tricorn as a 3D brim turned up in three corners (front, back left, back right) seen from the view's angle: the corners low (never
 *  under -206 in the head's frame, so above the brows at their highest, -192), the edges between them turned up to the crown */
const tricorn = (fwd: number) => {
  const yaw = Math.asin(Math.max(-1, Math.min(1, fwd))), loop: [number, number, number][] = [];
  for (let i = 0; i < 72; i++) { const a = (i / 72) * Math.PI * 2, c = Math.cos(3 * a), k = (1 + c) / 2;      // (1 at a corner, 0 mid-edge)
    const r = 118 + 66 * k, y = -306 + 92 * k + (Math.abs(a) < 0.3 || Math.abs(a - Math.PI * 2) < 0.3 ? 6 : 0);
    loop.push([r * Math.sin(a + yaw), y, r * Math.cos(a + yaw)]); }
  const crown: P2[] = ellPts(0, -272, 104, 58, 0, 0, 360, 30);
  const pts: P2[] = [...loop.map(([x, y]) => [x, y] as P2), ...crown], hull = convexHull(pts);
  return { loop, hull, crown };
};
const convexHull = (P: P2[]): P2[] => { const p = [...P].sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o: P2, a: P2, b: P2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo: P2[] = [], up: P2[] = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); } return [...lo.slice(0, -1), ...up.slice(0, -1)]; };
/** a scarf tied over the head: the head's top above a line from the brow (-200, front) to the nape (-150, back) */
const scarfPts = (fwd: number): P2[] => { const out: P2[] = [];
  // (tight on the head, 4 over its outline, closed along its lower edge: the first draft took the edge's line out past the head in front, a
  //  point that read as a cap's peak, the sheet's review; at -200 its edge lay on the brows)
  const line = (x: number) => -214 + Math.max(0, -x / 130) * 60 * fwd;
  for (let i = 0; i <= 60; i++) { const a = Math.PI + (i / 60) * Math.PI, x = 127 * Math.cos(a), y = -128 + 133 * Math.sin(a); if (y <= line(x)) out.push([x, y]); }
  return out; };
/** the scarf's knot and its two tails at the back of the head (drawn behind the head) */
const scarfKnot = (fwd: number): P2[][] => { if (fwd < 0.3) return []; const bx = -122 * fwd;
  return [ellPts(bx - 8, -168, 22, 18), spline([[bx - 4, -162], [bx - 34, -120], [bx - 46, -70], [bx - 30, -66], [bx - 18, -112]]), spline([[bx + 4, -160], [bx - 10, -110], [bx - 8, -60], [bx + 8, -62], [bx + 10, -114]])]; };
/** a boy's messy hair: the top of the head with tufts, the fringe ending above the brows (-190) */
const messyHair = (fwd: number): P2[] => { const out: P2[] = [];
  // (on the head's own outline at the sides, tufts only over the crown (a from 205 to 335 degrees): the first draft's straight fringe ran out
  //  past the head on both sides, a dark strip read as a cap's brim, the sheet's review)
  const fr = (x: number) => -192 + Math.max(0, -x / 126) * 70 * fwd;      // (the fringe's line: above the brows in front, lower at the back)
  for (let i = 0; i <= 48; i++) { const a = Math.PI * (1 + i / 48), deg = (a * 180) / Math.PI, tuft = deg > 205 && deg < 335 && i % 2 ? 1.09 : 1.0;
    const x = 126 * tuft * Math.cos(a), y = -128 + 132 * tuft * Math.sin(a); if (y <= fr(x)) out.push([x, y]); }
  return out; };
/** the full beard (head frame, three-quarter facing +x, or from the front, or in profile): round the jaw from the ears, under the eyes
 *  (never above -74 where an eye is), out past the chin; the mouth is drawn over it after */
const beardPts = (view: "front" | "q" | "side"): P2[] => view === "front"
  ? spline([[-118, -100], [-132, -40], [-96, 22], [0, 52], [96, 22], [132, -40], [118, -100], [92, -84], [60, -72], [0, -76], [-60, -72], [-92, -84]])
  : view === "q" ? spline([[-104, -104], [-128, -48], [-96, 18], [-8, 54], [78, 34], [122, -18], [126, -50], [110, -60], [80, -66], [40, -76], [-6, -78], [-60, -82], [-84, -96]])
  : spline([[-46, -112], [-60, -50], [-30, 16], [60, 52], [130, 20], [150, -30], [138, -58], [108, -64], [70, -66], [30, -72], [-10, -86], [-24, -104]]);
/** stubble: a light shadow on the jaw and chin only, under the cheeks (the first draft, from under the eyes, read as a dirty face) */
const stubblePts = (view: "front" | "q" | "side"): P2[] => view === "front"
  ? spline([[-108, -60], [-104, -20], [-64, 2], [0, 8], [64, 2], [104, -20], [108, -60], [80, -46], [40, -30], [0, -26], [-40, -30], [-80, -46]])
  : view === "q" ? spline([[-100, -62], [-96, -20], [-46, 2], [40, 4], [100, -16], [120, -46], [100, -40], [62, -24], [20, -26], [-40, -40], [-80, -56]])
  : spline([[-20, -60], [-14, -20], [30, 2], [100, -2], [136, -32], [112, -36], [70, -26], [20, -40]]);

type F = ReturnType<typeof frame>;
export const TURQ = "#1fb3a6";
/** the full beard's outline in the figure's own units, as beardOverlay draws it (for the beard check: no skin or window inside it) */
export const beardOutline = (sk: Sk): P2[] => { const sn = Math.sin(sk.faceYaw * (Math.PI / 180)), as = Math.abs(sn), flip = sn < 0, view: "front" | "q" | "side" = as < 0.45 ? "front" : as < 0.85 ? "q" : "side";
  const c = Math.cos(sk.headTilt * (Math.PI / 180)), si = Math.sin(sk.headTilt * (Math.PI / 180)), o = sk.j.skull as unknown as P2, fx = view !== "front" && flip ? -1 : 1;
  return beardPts(view).map(([x, y]) => [o[0] + fx * x * c - y * si, o[1] + fx * x * si + y * c] as P2); };
/** the beard check's planted fault: the beard cut with holes a little wider than the arm (the v6-t13 bug) */
export const BEARD_PLANT = { holes: false };
const GOLD = "#e8b630", MOUTH = "#5b1f2a", TONGUE = "#e46a6a", TEAR = "#7cc8ee", WHITE = "#ffffff";
/** the face check's switch (scripts/face_order.mjs): false draws the nose before the monocle's ring at three-quarter, as in v4 */
/** cuffSwap: the far hand changes layer in a turn as the sweep passes the coat's edge at the cuff (false: at HAND_SWAP, v6/v7 draft, a notch) */
export const FACE = { noseLast: true, qMoustache: true, pupilClear: true, earSliver: true, chainBehindPipe: true, cuffSwap: true };
/** the look being drawn (drawFlat sets it for each figure): Sir's own unless the figure has a Look (common.ts) */
const LOOK = { col: null as null | Record<string, string>, band: null as null | string, badge: null as null | string, mono: true, pipe: true, moustache: true, brow: null as null | string, brim: 52 };
/** a colour of the figure being drawn: the Look's, else the spec's */
const lc = (k: string, base: string) => (LOOK.col && LOOK.col[k]) || base;
/** the three-quarter nose's ellipse, head-local, with half its outline */
const Q_NOSE = [104, -84, 17 + 4.5, 14 + 4.5];
/** the three-quarter pipe as last drawn (its corner, way and droop), drawn again over the monocle's chain (see the head) */
const Q_PIPE: { at: [P2, number, number] | null } = { at: null };
/** both pupils at three-quarter for a face (the face check reads them): the near eye and the far one, which keeps clear of the nose */
export const qPupils = (f: Face) => { const r = rd(f), gz: P2 = [Math.min(1, 0.45 + 0.7 * Math.max(0, r.gaze[0])), r.gaze[1]], q = { ...r, gaze: gz };
  return { near: pupilAt(10, -118, 1, q), far: pupilAt(76, -118, 0.8, q, Q_NOSE), nose: Q_NOSE }; };
/** the three-quarter moustache, the near half and the far: both inside the head's outline, the far one about 60 % of the near one as it shows
 *  past the nose (v6: centred 52, the far half 0.55 wide and 1.2 tall, both 6 lower, the near half 0.82; at 78 with the far half 0.5 wide the
 *  nose covered all but 18 % of it and "halva försvinner när han vrider på huvudet", Jesper before and the review of v5). FACE.qMoustache =
 *  false gives the v5 moustache, the face check's planted fault */
export const qMoustache = () => { const Q = FACE.qMoustache ? { cx: 52, sx: 0.55, sy: 1.2, dy: 6, ns: 0.82 } : { cx: 78, sx: 0.5, sy: 1, dy: 0, ns: 1 };
  return { near: mirror(MOUS_A).map(([x, y]) => [x * Q.ns + Q.cx, y + Q.dy] as P2), far: MOUS_A.map(([x, y]) => [x * Q.sx + Q.cx, -80 + (y + 80) * Q.sy + Q.dy] as P2) }; };

/** a flat shape with the even outline: the ink is drawn under the fill, so the same width shows outside every part */
const fl = (k: Ink, pts: P2[], col: string) => k.group([pts], col);
/** a line inside a part, as wide as the outline that shows */
const ln = (k: Ink, pts: P2[], w = 0.85) => k.line(pts, k.ol * w);
/** a band of colour with an outline (a pipe stem, a monocle ring, a chain) */
const band = (k: Ink, pts: P2[], w: number, col: string, ol = k.ol * 0.85) => { k.line(pts, w + 2 * ol); k.line(pts, w, col); };
const mirror = (pts: P2[], cx = 0): P2[] => pts.map(([x, y]) => [2 * cx - x, y] as P2);
const at = (pts: P2[], dx: number, dy = 0): P2[] => pts.map(([x, y]) => [x + dx, y + dy] as P2);

/** the face values with their defaults */
const rd = (f: Face) => ({ smile: f.smile ?? 0, mouth: f.mouth ?? 0, brow: f.brow ?? 0, lid: f.lid ?? 0.06, wide: f.wide ?? 0, sad: f.sad ?? 0, tear: f.tear ?? 0,
  smirk: f.smirk ?? 0, teeth: f.teeth ?? 0, squeeze: f.squeeze ?? 0, pupil: f.pupil ?? 1, gaze: (f.gaze ?? [0, 0]) as P2 });
type FR = ReturnType<typeof rd>;

// ---------------- the three ways of drawing an eye ----------------
/** eyes squeezed hard shut: a chevron pointing at the nose (nose = +1 if the nose lies toward +x) */
const chevron = (k: Ink, cx: number, cy: number, rx: number, h: number, nose: number) => ln(k, [[cx - nose * rx, cy - h], [cx + nose * rx * 0.7, cy], [cx - nose * rx, cy + h]], 1.15);
/** the lids inside an eye's clip: the upper one down from the top, the lower one up from the bottom (a smile pushes it up) */
const lids = (k: Ink, cx: number, cy: number, rx: number, ry: number, lid: number, low: number, skin: string, bow = 0.12) => {
  if (lid > 0.02) { const y = cy - ry + 2 * ry * lid, e = spline([[cx - rx - 4, y - ry * bow], [cx, y + ry * bow], [cx + rx + 4, y - ry * bow]], false, 8);
    k.shape([[cx - rx - 6, cy - ry - 8], [cx + rx + 6, cy - ry - 8], ...e.slice().reverse()], skin, 0); ln(k, e); }
  if (low > 0.02) { const y = cy + ry - 2 * ry * low, e = spline([[cx - rx - 4, y + ry * 0.1], [cx, y - ry * 0.1], [cx + rx + 4, y + ry * 0.1]], false, 8);
    k.shape([[cx - rx - 6, cy + ry + 8], [cx + rx + 6, cy + ry + 8], ...e.slice().reverse()], skin, 0); ln(k, e); }
};
type EyeFn = (k: Ink, cx: number, cy: number, s: number, r: FR, skin: string, nose: number, avoid?: number[]) => void;
/** the pupil as drawn: its middle and radius. avoid = an ellipse [x, y, rx, ry] (the nose, drawn over the eyes) the pupil keeps clear of: it
 *  moves toward the eye's middle until the nose no longer covers it (v6: at three-quarter, looking down and right, the far pupil went under the
 *  nose and the eye stood empty, 06, the review of v6). FACE.pupilClear = false is the check's planted fault */
export const pupilAt = (cx: number, cy: number, s: number, r: FR, avoid?: number[]) => {
  const rx = 30 * s, ry = 40 * s * (1 + 0.15 * r.wide), pr = 16 * s * r.pupil, gp = pupilIn(r.gaze);
  const base = { x: cx + gp[0] * (rx - pr * 0.72 - 2 * s), y: cy + 4 * s + gp[1] * (ry - pr * 0.8 - 3 * s), pr };
  const clear = (q: { x: number; y: number; pr: number }) => { if (!avoid) return true; const [ax, ay, arx, ary] = avoid, m = q.pr + 6;
    for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, px = q.x + Math.cos(a) * m, py = q.y + Math.sin(a) * m; if (((px - ax) / arx) ** 2 + ((py - ay) / ary) ** 2 <= 1) return false; } return true; };
  // (it moves straight away from the nose's middle, as little as clears it, so it stays toward the side he looks: moved only toward the eye's
  //  middle it ended on the other side of it from the near pupil, and he looked cross-eyed)
  if (!FACE.pupilClear || !avoid || clear(base)) return base;
  const dx = base.x - avoid[0], dy = base.y - avoid[1], l = Math.hypot(dx, dy) || 1;
  for (let t = 1; t <= 40; t++) { const q = { x: base.x + (dx / l) * t, y: base.y + (dy / l) * t, pr }; if (((q.x - cx) / (rx - pr * 0.5)) ** 2 + ((q.y - cy - 4 * s) / (ry - pr * 0.6)) ** 2 > 1) break; if (clear(q)) return q; }
  return { x: cx, y: cy - 0.3 * ry, pr }; };
/** the pupil's place in the eye as drawn (-1..1 each way), kept inside the eye: the gaze's two parts were each taken to the edge, so a gaze
 *  down and to the side ([1, 0.9]) put the pupil outside the oval, clipped away, and both eyes stood empty (the shot types v4 draft, 06).
 *  clamp = false gives the pupil as it was (the check's planted fault) */
export const pupilIn = (g: P2, clamp = true): P2 => { const m = Math.hypot(g[0], g[1]); return clamp && m > 1 ? [g[0] / m, g[1] / m] : g; };
/** the gaze an eye is drawn with in a view (as sirFront, sirQ and sirSide pass it): mirrored with the head, a three-quarter head looking
 *  the way it faces, a profile eye never looking back into the head */
export const drawnGaze = (view: "front" | "q" | "side", flip: boolean, gaze: P2): P2 => { const g: P2 = view !== "front" && flip ? [-gaze[0], gaze[1]] : gaze;
  return view === "q" ? [Math.min(1, 0.45 + 0.7 * Math.max(0, g[0])), g[1]] : view === "side" ? [Math.max(0.35, g[0]), g[1]] : g; };
/** A: a tall white oval with a big round black pupil */
const eyeA: EyeFn = (k, cx, cy, s, r, skin, nose, avoid) => {
  const rx = 30 * s, ry = 40 * s * (1 + 0.15 * r.wide);
  if (r.squeeze > 0.5) return chevron(k, cx, cy, rx * 0.9, ry * 0.5, nose);
  // (a shut eye is always one arc bowed down: with a smile over 0.5 it turned to a "^", two shapes for the same blink, the review of v3)
  if (r.lid > 0.93) { const d = ry * 0.32; ln(k, spline([[cx - rx, cy], [cx, cy + d], [cx + rx, cy]], false, 8), 1.15); return; }
  const ball = ellPts(cx, cy, rx, ry, 0, 0, 360, 40);
  fl(k, ball, WHITE);
  // (the pupil travels to the eye's edge: at three-quarter, looking at Ada, it stayed near the middle and he seemed to look at the lens)
  k.clip(ball, () => { const q = pupilAt(cx, cy, s, r, avoid); k.dot(q.x, q.y, q.pr);
    // (the smiling lower lid grows with the smile from 0.3 to 0.7: switched on at 0.5 it jumped, the eyes from heavy to wide in one
    //  frame, the review of the shot types v1)
    lids(k, cx, cy, rx, ry, r.lid, 0.3 * r.smile * Math.max(0, Math.min(1, (r.smile - 0.3) / 0.4)), skin); });
};

// ---------------- brows, mouth, tear, pipe, monocle ----------------
/** the brows' two ends, inner and outer (y down): up as a whole with `brow`, the inner end down when cross, up when sad */
const browEnds = (r: FR, cx: number, base: number, s: number, half: number, side: number): [P2, P2] => {
  const raise = Math.max(0, r.brow) * 12 * s + (r.wide > 0.3 ? 8 * s : 0), cross = Math.max(0, -r.brow);
  return [[cx - side * half, base - raise + cross * 14 * s - r.sad * 14 * s], [cx + side * half, base - raise - cross * 5 * s + r.sad * 7 * s]];
};
/** the mouth: a curve, or open (a dark shape with a tongue, or clenched teeth) */
/** lip: the lower lip's colour (A: the open mouth a third taller with the lower lip drawn under it, so a speaking mouth reads on a phone, Jesper
 *  approving the A sheet) */
const mouthAt = (k: Ink, x: number, y: number, w: number, s: number, r: FR, lip?: string) => {
  const sm = r.smile, cl = -sm * 12 * s + r.smirk * 4 * s, cr = -sm * 12 * s - r.smirk * 15 * s;
  if (r.mouth > 0.08) {
    const H = (lip ? 61 : 46) * s * r.mouth, top = spline([[x - w, y + cl], [x, y + (sm < 0 ? -H * 0.2 : sm * 3 * s)], [x + w, y + cr]], false, 8);
    const bot = spline([[x + w, y + cr], [x, y + H + Math.max(0, sm) * 10 * s], [x - w, y + cl]], false, 8), m = [...top, ...bot.slice(1)];
    if (lip && r.mouth > 0.2) { const lb = spline([[x + w * 0.7, y + cr + H * 0.5], [x, y + H + Math.max(0, sm) * 10 * s + 7 * s], [x - w * 0.7, y + cl + H * 0.5]], false, 8); band(k, lb, 9 * s, lip, k.ol * 0.6); }
    fl(k, m, MOUTH);
    k.clip(m, () => { if (r.teeth > 0.4) { k.shape([[x - w - 6, y - 60 * s], [x + w + 6, y - 60 * s], [x + w + 6, y + H * 0.62], [x - w - 6, y + H * 0.62]], WHITE, 0); ln(k, [[x - w, y + H * 0.32], [x + w, y + H * 0.32]], 0.5); }
      else k.shape(ellPts(x, y + H + 6 * s, w * 0.62, H * 0.5), TONGUE, 0); });
  } else ln(k, spline([[x - w, y + cl], [x + r.smirk * w * 0.15, y + sm * 8 * s], [x + w, y + cr]], false, 8), 0.95);
};
/** a tear under an eye, and its wet track */
const tearAt = (k: Ink, x: number, y: number, s: number, amt: number) => {
  if (amt < 0.05) return;
  band(k, [[x, y], [x + 2 * s, y + 26 * s * amt]], 9 * s, TEAR, k.ol * 0.5);
  const d = at(spline([[0, 0], [10 * s, 20 * s], [9 * s, 31 * s], [0, 37 * s], [-9 * s, 31 * s], [-10 * s, 20 * s]]), x + 2 * s, y + 24 * s * amt);
  fl(k, d, TEAR);
};
/** a pipe from the corner of the mouth: the stem out and a little down, the bowl upright (d = which way it points) */
/** droop 0..1: the pipe tips down in the corner of a gaping, frightened mouth (the review of the motion test: it stayed level in the gape) */
const pipeAt = (k: Ink, a: P2, s: number, d = 1, droop = 0) => {
  k.at(a[0], a[1], d * droop * 52, false, () => {
    const b: P2 = [62 * s * d, 16 * s];
    band(k, [[0, 0], b], 11 * s, "#3b2416");
    const bowl: P2[] = [[b[0] - 13 * s * d, b[1] - 36 * s], [b[0] + 19 * s * d, b[1] - 36 * s], [b[0] + 15 * s * d, b[1] + 8 * s], [b[0] - 10 * s * d, b[1] + 8 * s]];
    fl(k, bowl, "#8a4b26"); k.line([bowl[0], bowl[1]], 8 * s, k.ink); k.mark("pipe", b[0] + 3 * s * d, b[1] - 14 * s); });      // (the bowl's middle, for the check that no hand touches it)
};
// (clenched teeth hold the pipe: it tips 0.3 as far (v6; 0.5 in v5); tipped further its bowl lay on the raised hand in 06, the reviews of v4 and v6)
const droopOf = (r: FR) => Math.max(0, Math.min(1, r.wide)) * (1 - 0.7 * Math.max(0, Math.min(1, r.teeth)));
/** how far a mouth's corners come down with the corners turned down (the pipe rides that corner: in the frightened grimace it stayed at the
 *  resting corner, up at the moustache beside the mouth, as if hanging from the moustache, the review of the shot types v4). Only down, so a
 *  smile leaves the pipe where the approved clips have it */
const cornerDown = (r: FR, s: number) => Math.max(0, -r.smile) * 12 * s;
/** an ear seen from the side: a filled oval and the curve of its bowl opening forward */
const ear = (k: Ink, x: number, y: number, rx: number, ry: number, skin: string) => { fl(k, ellPts(x, y, rx, ry, 0, 0, 360, 28), skin); ln(k, ellPts(x + rx * 0.2, y, rx * 0.5, ry * 0.55, 0, 110, 250, 10), 0.6); };
const monoRing = (k: Ink, cx: number, cy: number, rx: number, ry: number, w: number) => { const r = ellPts(cx, cy, rx, ry, 0, 0, 360, 40); band(k, r, w, GOLD, k.ol * 0.55); };
/** the chain: thin, gold, from the monocle's lower outer edge in a soft bow to the waistcoat */
const chainAt = (k: Ink, a: P2, b: P2, bow: P2, w: number) => band(k, spline([a, bow, b], false, 10), w, GOLD, Math.max(2, w * 0.55));
/** a flat cap from the front: the crown wider than the head, the turquoise band, the brim in front. top = the crown's top, y0 = where the brim sits */
const capFront = (k: Ink, hw: number, y0: number, top: number, col: string, brim: number) => {
  const cr = spline([[-hw * 1.06, y0 - 8], [-hw * 1.14, y0 - (y0 - top) * 0.5], [-hw * 0.82, top + 14], [0, top], [hw * 0.86, top + 10], [hw * 1.16, y0 - (y0 - top) * 0.52], [hw * 1.08, y0 - 8], [0, y0]]);
  fl(k, cr, col);
  fl(k, [[-hw * 1.04, y0 - 30], [hw * 1.06, y0 - 30], [hw * 1.02, y0 - 6], [-hw * 1.0, y0 - 6]], LOOK.band ?? TURQ);
  if (LOOK.badge) fl(k, [[0, y0 - 52], [16, y0 - 40], [10, y0 - 20], [-10, y0 - 20], [-16, y0 - 40]], LOOK.badge);
  fl(k, spline([[-hw * 0.95, y0 - 10], [0, y0 + brim], [hw * 0.95, y0 - 10], [hw * 0.8, y0 - 4], [0, y0 + brim * 0.45], [-hw * 0.8, y0 - 4]]), col);
  fl(k, ellPts(0, top + 3, hw * 0.12, hw * 0.06), col);
};
/** the same from the side, facing +x: the crown pushed forward over the brim, the band, the brim jutting out */
const capSide = (k: Ink, back: number, front: number, y0: number, top: number, col: string, brim: number) => {
  fl(k, spline([[front + brim, y0 - 2], [front + brim * 0.85, y0 - 16], [front - 10, y0 - 22], [front - 4, y0 + 2]]), col);
  const cr = spline([[back - 6, y0 - 4], [back - 12, y0 - (y0 - top) * 0.55], [back + (front - back) * 0.25, top + 4], [back + (front - back) * 0.6, top], [front + 18, top + (y0 - top) * 0.32], [front + 24, y0 - 14], [front, y0 - 4]]);
  fl(k, cr, col);
  fl(k, [[back - 4, y0 - 30], [front + 20, y0 - 30], [front + 16, y0 - 6], [back - 2, y0 - 6]], LOOK.band ?? TURQ);
  if (LOOK.badge) fl(k, [[front - 6, y0 - 52], [front + 8, y0 - 40], [front + 4, y0 - 20], [front - 14, y0 - 20], [front - 18, y0 - 40]], LOOK.badge);
};

/** the full beard after the arms (the sheet's review: drawn with the head, the sleeves' rounded tops lay over it and the arms looked loose):
 *  over the arms' upper part, but never over a forearm or a hand drawn in front of the head; then the mouth over the beard (the same clip) */
/** the full beard over the arms' upper part, then each forearm and hand in `over` drawn again over it, clipped to the forearm and the hand
 *  (the arm's own drawing, so it fits it exactly): cut out with holes a little wider than the arm, the beard showed the window or the
 *  waistcoat through the gap (a white wedge as the fist went up, a round hole at the chest beat), the independent review of v6-t13 */
const beardOverlay = (k: Ink, sk: Sk, r: FR, B: Body, P: Props, over: Side[], arm?: (sd: Side) => void) => { const kit = KIT.k; if (!kit || kit.beard !== "full") return;
  const sn = Math.sin(sk.faceYaw * (Math.PI / 180)), as = Math.abs(sn), flip = sn < 0, view: "front" | "q" | "side" = as < 0.45 ? "front" : as < 0.85 ? "q" : "side";
  if (BEARD_PLANT.holes) { const B9 = 1e4, holes: P2[][] = over.flatMap((sd) => { const E = J(sk, "el", sd), W = J(sk, "wr", sd), T = J(sk, "tip", sd), hc: P2 = [(W[0] + T[0]) / 2, (W[1] + T[1]) / 2];
      return [seg(E, W, B.arm[1] + 6, B.arm[2] + 6, 0, 0.3, true), ellPts(hc[0], hc[1], P.hand * 0.95, P.hand * 0.95, 0, 0, 360, 20), ellPts(E[0], E[1], B.arm[1] + 6, B.arm[1] + 6, 0, 0, 360, 16)]; });
    const g = k.g; g.save(); g.beginPath(); g.rect(-B9, -B9, 2 * B9, 2 * B9); for (const h of holes) k.trace(h); g.clip("evenodd");
    k.at(sk.j.skull[0], sk.j.skull[1], sk.headTilt, view !== "front" && flip, () => { fl(k, beardPts(view), kit.col.beard); kitMouthDraw(k, view, r, sn * 34); }); g.restore(); return; }      /* (the planted fault: the old holes) */
  k.at(sk.j.skull[0], sk.j.skull[1], sk.headTilt, view !== "front" && flip, () => { const bp = beardPts(view); fl(k, bp, kit.col.beard);
    k.clip(bp, () => { for (const [a, b, c] of BEARD_STRANDS[view]) k.line(spline([a, b, c], false, 8), 5, kit.col.beardHi ?? "#7a5638"); });
    kitMouthDraw(k, view, r, sn * 34); });      /* (the mouth over the beard, under a hand that passes it) */
  // (v6c, the independent review of v6: the arm drawn again through a capsule 30 wider than the forearm and a circle at the elbow cut the
  //  upper arm's red sleeve into the beard with no ink, notches in shot 11 (515-560), and covered the beard's ink against the coat (frames 0,
  //  50); seam_check. Now only the forearm and the hand are drawn again, as a shape of their own with its whole ink outline, and only over the
  //  beard (its outline grown by its ink): outside it nothing changes, and where the forearm passes before the beard its edge is inked)
  if (arm) { const bo = beardOutline(sk), cx = bo.reduce((a, q) => a + q[0] / bo.length, 0), cy = bo.reduce((a, q) => a + q[1] / bo.length, 0), zone = bo.map(([x, y]) => { const dx = x - cx, dy = y - cy, l = Math.hypot(dx, dy) || 1; return [x + (dx / l) * 8, y + (dy / l) * 8] as P2; });
    for (const sd of over) k.clip(zone, () => arm(sd)); }
 };
/** two or three lighter strands in the beard, so it is not a flat dark hole in a close shot (the reviewer, cosmetic) */
const BEARD_STRANDS: Record<string, [P2, P2, P2][]> = { q: [[[-90, -40], [-80, 0], [-50, 26]], [[70, -10], [60, 20], [30, 40]], [[-20, 10], [-14, 30], [-4, 44]]],
  front: [[[-90, -40], [-80, 0], [-50, 26]], [[90, -40], [80, 0], [50, 26]], [[0, 14], [0, 30], [0, 44]]], side: [[[-20, -60], [-26, -20], [0, 16]], [[80, 10], [70, 30], [50, 42]]] };

// ---------------- the kit's head parts (in the head's own frame, facing +x; fwd as hatOutline) ----------------
/** behind the head: the scarf's knot and tails */
const kitBack = (k: Ink, fwd: number) => { const kit = KIT.k; if (!kit) return; if (kit.hat === "scarf") for (const p of scarfKnot(fwd)) fl(k, p, kit.col.scarf); };
/** on the face, before the brows, the mouth and the eyes (so the mouth is always drawn over a beard): stubble, a beard, the hair */
const kitFace = (k: Ink, view: "front" | "q" | "side", fwd: number) => { const kit = KIT.k; if (!kit) return;
  const head = ellPts(0, -128, 126, 132, 0, 0, 360, 60);
  if (kit.beard === "stubble") k.clip(head, () => { const st = stubblePts(view); k.shape(st, kit.col.stubble, 0); k.clip(st, () => { for (let x = -130; x < 150; x += 16) for (let y = -70; y < 20; y += 14) k.dot(x + ((y / 14) % 2) * 8, y, 2.2, "rgba(60,40,32,0.55)"); }); });
  // (the full beard is not drawn here: beardOverlay draws it after the arms, so it lies over the arms' upper part, and the mouth over it)
  if (kit.hat === "none" && kit.hair === "messy") fl(k, messyHair(fwd), kit.col.hair);
};
/** sweat (the captain's rage, the list): two drops at the temple on the head's back side, under the hat's brim, clear of the eyes, the brows and
 *  the beard (the reviewer's rules: never into an eye nor over the beard), inside the head's outline; they grow with `sweat` (0-1) */
const kitSweat = (k: Ink, view: "front" | "q" | "side") => { const a = KIT.sweat; if (a < 0.05) return;
  const spots: [number, number, number][] = view === "front" ? [[-104, -172, 1], [98, -150, 0.8]] : view === "q" ? [[-86, -176, 1], [-102, -146, 0.8]] : [[-30, -176, 1], [-56, -150, 0.8]];
  for (const [x, y, s] of spots) { const r = 11 * s * a; k.group([spline([[x, y - 1.9 * r], [x + r, y], [x + 0.6 * r, y + r * 0.9], [x - 0.6 * r, y + r * 0.9], [x - r, y]])], "#bfe6f2"); } };
/** the hat, last */
const kitHat = (k: Ink, fwd: number) => { const kit = KIT.k; if (!kit) return; kitSweat(k, fwd === 0 ? "front" : fwd < 0.9 ? "q" : "side");
  if (kit.hat === "scarf") { const sc = scarfPts(fwd); fl(k, sc, kit.col.scarf); k.clip(sc, () => { for (let x = -140; x < 140; x += 34) for (let y = -280; y < -150; y += 30) k.dot(x + ((y / 30) % 2) * 17, y, 5, "#f4ecd8"); }); }
  if (kit.hat === "tricorn") { const t = tricorn(fwd); fl(k, t.hull, kit.col.hat);
    // (the gold trim along the brim's edge on the side toward us)
    const front = t.loop.map(([x, y, z]) => (z > -20 ? [x, y] : null)); let run: P2[] = [];
    const flush = () => { if (run.length > 2) band(k, run, 7, GOLD, k.ol * 0.4); run = []; };
    for (const q of [...front, ...front.slice(0, 1)]) { if (q) run.push(q as P2); else flush(); } flush(); }
};

// ---------------- the specification of one direction ----------------
type Body = { rows: number[][]; arm: number[]; leg: number[]; shoeW: number; neck: number };
type Col = { skin: string; nose: string; hair: string; cap: string; coat: string; vest: string; shirt: string; tie: string; trous: string; shoe: string; dress: string; stock: string; collar: string };
export type FlatSpec = {
  id: string; name: string; ol: number; faceW: number; sir: { P: Props; B: Body }; other: { P: Props; B: Body }; col: Col;
  /** waistcoat over shirt sleeves (no coat) */ noCoat?: boolean;
  /** how far the face slides as the head turns from the lens */ turn: number;
  sirFront: (k: Ink, r: FR, tx: number, lift: number) => void; sirSide: (k: Ink, r: FR, lift: number, mono?: boolean) => void;
  otherFront: (k: Ink, r: FR, tx: number) => void; otherSide: (k: Ink, r: FR) => void;
  /** a three-quarter head, facing the picture's right (drawn mirrored for the left): turning, the head goes front, three-quarter, side, each
   *  drawing held for frames, never front to side in one frame (the review of the motion test). mono = which eye the monocle shows on: his
   *  right eye is the near one facing right, the far one facing left */
  sirQ?: (k: Ink, r: FR, lift: number, mono: "near" | "far") => void; otherQ?: (k: Ink, r: FR) => void; chainQ?: { near: [P2, P2]; far: [P2, P2] };
  /** the monocle and the bow of its chain, head-local (front: x before the turn slide), and where it ends on the waistcoat [to the left, above the pelvis] */
  chainFront: [P2, P2]; chainSide: [P2, P2]; chainEnd: [number, number]; chainW: number;
  /** the waistcoat's top, its point at the bottom, and half its width (front marks) */ vest: [number, number, number];
};

const drawFlat = (c: FlatSpec) => (k: Ink, sk: Sk, o: FigOpts) => {
  const lk = o.look; LOOK.col = lk?.col ?? null; LOOK.band = lk?.band ?? null; LOOK.badge = lk?.badge ?? null; LOOK.mono = lk?.mono ?? true; LOOK.pipe = lk?.pipe ?? true; LOOK.moustache = lk?.moustache ?? true; LOOK.brow = lk?.brow ?? null; LOOK.brim = lk?.brim ?? 52;
  KIT.k = kitOf(lk); KIT.sweat = Math.max(0, Math.min(1, ((o.face ?? {}) as { sweat?: number }).sweat ?? 0)); const kit = KIT.k; if (kit) { LOOK.mono = false; LOOK.pipe = false; LOOK.moustache = false; }
  const other = o.who === "baker", { P: _p, B: B0 } = other ? c.other : c.sir, B = kitBody(B0, kit), Fr = frame(sk), P = sk.P, r = rd(o.face ?? {}), hp = headPose(sk), C = (lk?.col ? { ...c.col, ...lk.col } : c.col) as Col;
  void _p; const front = sk.cos > 0.35, sideOn = Math.abs(sk.sin) > 0.6, d = Math.sign(sk.sin) || 1, sit = other ? 0 : seated(sk);
  const leg = (s: Side) => {
    // (seated, in profile: the trousers' seat behind the hips, down to the seat's top, drawn with the far leg so the near thigh lies over it;
    //  with the coat's hem up off the lap there was a gap between the coat and the seat behind him, and he seemed to hover)
    const seatPad = sit > 0 && sideOn && s === sk.far ? [ellPts(...Fr.Q(0, -16, 2), 30 + 8 * sit, B.leg[0] * 0.98)] : [];
    k.group([...limb(J(sk, "hip", s), J(sk, "kn", s), J(sk, "an", s), B.leg), ...seatPad], other ? C.stock : C.trous);
    const sh = shoeDrawn(sk, s, B.shoeW); fl(k, sh.pts, C.shoe); k.line([sh.a, sh.b], k.ol * 0.9, k.ink, "butt");
    // (the long coat's skirt over this thigh, from the hip to 0.8 of the way to the knee, wider than the leg: it lies along the thigh, so it
    //  follows the leg as he sits, on his lap and never through the stool under it)
    if (kit?.top === "coat") { const h = J(sk, "hip", s), kn = J(sk, "kn", s), e = mid(h, kn, 0.8); k.group([seg(mid(h, kn, -0.1), e, B.leg[0] + 16, B.leg[1] + 22, 0, 0.3, true)], C.coat); }
  };
  /** the forearm (its cuff and its sleeve's lower piece, with its own ink) and the hand: what beardOverlay draws again over the beard */
  const foreArm = (s: Side) => { const S = J(sk, "sh", s), E = J(sk, "el", s), W = J(sk, "wr", s), kind = (s === "L" ? o.handL : o.handR) ?? "relaxed";
    if (!other) k.group([seg(mid(E, W, 0.8), mid(E, W, 1.04), B.arm[2] * 0.92, B.arm[2] * 0.92, 0, 0.3, true)], C.shirt);
    k.group([limb(S, E, W, B.arm)[1]], other ? C.dress : c.noCoat ? C.shirt : C.coat); if (kit?.top === "coat") goldCuff(S, E, W); handAt(k, sk, s, kind, C.skin); };
  // (v6c, the cloud session's yes on 27 Nov: the captain's coat sleeves end in a cuff edged in gold, on both arms in every view, so a hand
  //  reads as coming out of a sleeve; the sleeve's own outline, not the cuff, is what shows the arm (dinner_check 10). CUFF in this file)
  const goldCuff = (S: P2, E: P2, W: P2) => { const w = B.arm[2] * CUFF[2], cf = seg(mid(E, W, CUFF[0]), mid(E, W, CUFF[1]), w, w, 0, 0.3, true); k.group([cf], C.coat);
    const a = mid(E, W, CUFF[0]), L = Math.hypot(W[0] - E[0], W[1] - E[1]) || 1, d: P2 = [(W[0] - E[0]) / L, (W[1] - E[1]) / L], n: P2 = [-d[1], d[0]], c0: P2 = [a[0] + d[0] * 7, a[1] + d[1] * 7];
    k.clip(cf, () => k.line([[c0[0] - n[0] * 60, c0[1] - n[1] * 60], [c0[0] + n[0] * 60, c0[1] + n[1] * 60]], 8, GOLD)); };
  const arm = (s: Side) => {
    const S = J(sk, "sh", s), E = J(sk, "el", s), W = J(sk, "wr", s), kind = (s === "L" ? o.handL : o.handR) ?? "relaxed";
    if (!other) k.group([seg(mid(E, W, 0.8), mid(E, W, 1.04), B.arm[2] * 0.92, B.arm[2] * 0.92, 0, 0.3, true)], C.shirt);
    const sleeve = limb(S, E, W, B.arm); k.group(sleeve, other ? C.dress : c.noCoat ? C.shirt : C.coat);
    // (v6c, the review of v6 point 4 and dinner_check 17: each segment's stripes were drawn through both pieces of the sleeve, so with the elbow
    //  bent past about 20 degrees the upper arm's stripes ran on across the forearm and crossed its own, a net. Each family now stays on its own
    //  side of the elbow's bisector; straight (bent under 20 degrees) the upper arm's side reaches 18 past the elbow, past its last stripe, so a
    //  straight arm draws as before, pixel for pixel. Only the stripes' clip changes: their colour, width, spacing and the order are as before)
    const uS = ((v: P2): P2 => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; })([S[0] - E[0], S[1] - E[1]]), uW = ((v: P2): P2 => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; })([W[0] - E[0], W[1] - E[1]]);
    const bend = (Math.acos(Math.max(-1, Math.min(1, -(uS[0] * uW[0] + uS[1] * uW[1])))) * 180) / Math.PI, nb0: P2 = [uS[0] - uW[0], uS[1] - uW[1]], nl = Math.hypot(nb0[0], nb0[1]), nb: P2 = nl > 1e-6 ? [nb0[0] / nl, nb0[1] / nl] : uS;
    const sideOf = (off: number, sgn: number): P2[] => { const o: P2 = [E[0] - nb[0] * off, E[1] - nb[1] * off], t: P2 = [-nb[1], nb[0]], F = 1e4; return [[o[0] + t[0] * F, o[1] + t[1] * F], [o[0] + t[0] * F + nb[0] * sgn * F, o[1] + t[1] * F + nb[1] * sgn * F], [o[0] - t[0] * F + nb[0] * sgn * F, o[1] - t[1] * F + nb[1] * sgn * F], [o[0] - t[0] * F, o[1] - t[1] * F]]; };
    // (and each family runs two stripes on past the elbow, into its own side up to the bisector: from 10 past it the forearm's first stripe left
    //  the outer corner of a bent elbow bare, a white wedge, the reviewer on the v6c stills. Only past 20 degrees, where the line is the bisector itself:
    //  under it a straight arm's line lies 17 past the elbow and an extra stripe showed short of it, so a straight arm draws as before)
    // (and the forearm's stripes slide into step with the upper arm's as the elbow bends (their distances from the elbow the same mod 24, so
    //  each pair meets on the bisector as a chevron): out of step, a stripe met a gap there and left a white wedge, the reviewer on the v6c
    //  stills, frame 180. The slide grows with the bend from 10 degrees to its full at 30, none for a straight arm or one at rest)
    const LA = Math.hypot(E[0] - S[0], E[1] - S[1]), dl = ((((LA - 20) % 24) + 24) % 24), ph = (dl > 12 ? dl - 24 : dl) * Math.max(0, Math.min(1, (bend - 10) / 20));
    const ext = bend >= 20 ? 48 : 0, own: [P2, P2, P2[], number, number, number][] = [[S, E, sideOf(17 * Math.max(0, 1 - bend / 20), 1), 0, ext, 0], [E, W, sideOf(0, -1), ext, 0, ph]];
    if (kit?.top === "stripes") for (const piece of sleeve) k.clip(piece, () => { for (const [a, b, H, pre, post, sh] of own) k.clip(H, () => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, d: P2 = [(b[0] - a[0]) / L, (b[1] - a[1]) / L], n: P2 = [-d[1], d[0]];
      for (let u = 10 + sh - pre; u < L + 10 + post; u += 24) { const c0: P2 = [a[0] + d[0] * u, a[1] + d[1] * u]; k.line([[c0[0] - n[0] * 60, c0[1] - n[1] * 60], [c0[0] + n[0] * 60, c0[1] + n[1] * 60]], 10, kit.col.stripe); } }); });
    if (kit?.top === "coat") goldCuff(S, E, W);
    handAt(k, sk, s, kind, C.skin);
  };
  let torsoPoly: P2[] = [];
  const torso = () => {
    if (B.neck) k.group([seg(Fr.T(0, P.spine - 20), sk.j.skull, B.neck, B.neck * 0.92)], C.skin);
    // (the coat's hem comes up as the thighs bend toward level, so a seated figure's thighs show on the seat: hanging 34 under the hip the
    //  coat covered them and its hem sank in front of the seat, the review of the shot types v2)
    const flexOf = (s: Side) => { const h = J(sk, "hip", s), kn = J(sk, "kn", s); return Math.abs(Math.atan2(Math.abs(kn[0] - h[0]), kn[1] - h[1])) * (180 / Math.PI); };
    const flex = Math.max(0, Math.min(1, (Math.max(flexOf("L"), flexOf("R")) - 35) / 45));
    // (seated, the hem comes up above the thighs and the coat's front falls back off the lap, so the whole thigh shows level on the seat:
    //  with the hem 4 under the hip and the front 50 deep, the coat covered the thighs to the knees and he read as squatting, Jesper on the
    //  shot types v3: "låren vilar ovanpå den, fötterna i marken framför. Inte på huk")
    const l0 = B.rows[0][0] + 30 * flex, rows = B.rows.map((q, i) => (i === 0 ? [l0 + sit * (30 - l0), q[1], q[2] - sit * 30, q[3]] : i === 1 ? [q[0] + sit * 44, q[1], q[2] - sit * 14, q[3]] : q));
    const t = torsoPts(sk, rows), dz = Math.max(...B.rows.map((q) => q[2])) * 0.8; torsoPoly = t;
    const Q = (l: number, a: number) => Fr.Q(l, dz, a);
    if (other) {
      fl(k, t, C.dress);
      if (front) k.clip(t, () => { const a = P.spine; fl(k, [Q(-B.rows[B.rows.length - 2][1] * 0.8, a + 4), Q(0, a - 40), Q(B.rows[B.rows.length - 2][1] * 0.8, a + 4)], C.collar); });
      return;
    }
    const [vt, vb, vw] = c.vest;
    fl(k, t, c.noCoat ? C.shirt : C.coat);
    if (kit && kit.top !== "coat") { k.clip(t, () => {
      if (kit.top === "stripes") for (let a = -40; a < P.spine + 20; a += 24) k.line([Fr.T(-300, a), Fr.T(300, a)], 10, kit.col.stripe);
      else { const x = sk.sin * 30; ln(k, [Fr.Q(0, dz, P.spine - 40), Fr.Q(0, dz, P.spine - 110)], 0.6); for (const a of [P.spine - 60, P.spine - 95]) k.dot(...Fr.Q(0, dz, a), 4); void x;
        for (const [l, a0, a1] of [[-0.6, 20, 60], [0.5, 10, 50]] as number[][]) ln(k, [Fr.Q(B.rows[2][1] * l, dz, a0), Fr.Q(B.rows[2][1] * l * 0.8, dz, a1)], 0.5); }
      // the neckline: an open collar
      fl(k, [Fr.Q(-30, dz, P.spine + 4), Fr.Q(0, dz, P.spine - 40), Fr.Q(30, dz, P.spine + 4)], C.skin); });
      return; }
    k.clip(t, () => {
      if (kit) for (const sd of [-1, 1]) for (const a of [P.spine - 50, P.spine - 95, P.spine - 140]) { const p = Fr.Q(sd * (c.vest[2] + 22), dz, a); fl(k, ellPts(p[0], p[1], 8, 8), GOLD); }
      if (front) {
        if (c.noCoat) fl(k, [Q(-vw * 1.6, vt - 40), Q(-vw * 0.55, vt + 4), Q(0, vt - 44), Q(vw * 0.55, vt + 4), Q(vw * 1.6, vt - 40), Q(vw * 1.6, vb - 30), Q(-vw * 1.6, vb - 30)], C.vest);
        else fl(k, [Q(-vw, vt), Q(vw, vt), Q(vw * 1.15, vb + 26), Q(0, vb), Q(-vw * 1.15, vb + 26)], C.vest);
        fl(k, [Q(-vw * 0.55, vt + 14), Q(vw * 0.55, vt + 14), Q(0, vt - 46)], C.shirt);
        k.group([[Q(-7, vt + 8), Q(7, vt + 8), Q(9, vt - 30), Q(0, vt - 40), Q(-9, vt - 30)]], C.tie);
        for (const a of [0.3, 0.52, 0.74]) { const p = Q(0, vb + 18 + (vt - 60 - vb) * a); k.dot(p[0], p[1], 4.5); }
      } else if (sideOn) {
        const df = Math.max(...B.rows.map((q) => q[2]));
        if (c.noCoat) k.shape([Fr.Q(0, -400, vb - 30), Fr.Q(0, -400, vt - 60), Fr.Q(0, df * 0.2, vt - 30), Fr.Q(0, 400, vt - 40), Fr.Q(0, 400, vb - 30)], C.vest, k.ol * 0.85);
        else k.shape([Fr.Q(0, df * 0.5, vb + 10), Fr.Q(0, df * 0.62, vt), Fr.Q(0, df + 60, vt), Fr.Q(0, df + 60, vb + 10)], C.vest, k.ol * 0.85);
      }
    });
  };
  const head = () => {
    const sn = Math.sin(sk.faceYaw * (Math.PI / 180)), as = Math.abs(sn), flip = sn < 0;
    const view = !c.sirQ ? (hp.side ? "side" : "front") : as < 0.45 ? "front" : as < 0.85 ? "q" : "side";
    // (a mirrored head's gaze turned with it: the gaze is given in the picture, so a head drawn mirrored for the left looked the other way)
    const rv: FR = view !== "front" && flip ? { ...r, gaze: [-r.gaze[0], r.gaze[1]] } : r;
    k.at(sk.j.skull[0], sk.j.skull[1], sk.headTilt, view !== "front" && flip, () => {
      if (other) (view === "side" ? c.otherSide(k, rv) : view === "q" ? c.otherQ!(k, rv) : c.otherFront(k, rv, sn * c.turn));
      else (view === "side" ? c.sirSide(k, rv, o.capLift ?? 0, !flip) : view === "q" ? c.sirQ!(k, rv, o.capLift ?? 0, flip ? "far" : "near") : c.sirFront(k, rv, sn * c.turn, o.capLift ?? 0));
    });
    if (other || !LOOK.mono) return;
    const w = headToWorld(sk, view !== "front" && flip), dz = Math.max(...B.rows.map((q) => q[2])), end = Fr.Q(c.chainEnd[0], dz * 0.8, c.chainEnd[1]);
    // (the monocle on his right eye only: seen from his left side it is behind his head, and so is its chain)
    // (the chain ends in a small gold button on the coat: it ended loose on the cloth, the review of the shot types v2)
    const clasp = (p: P2) => fl(k, ellPts(p[0], p[1], 8, 8), "#e8c45a");
    // (in profile the chain ends on the waistcoat's front, at the coat's edge: at 0.7 of its depth it ended inside the coat's shoulder, v3;
    //  22 over the end used from the front and at three-quarter, which stays as Jesper approved it in v3)
    if (view === "side") { if (!flip) { const a = w(c.chainSide[0]), b = Fr.T(dz * 0.95 * d, c.chainEnd[1] - 22); chainAt(k, a, b, [(a[0] + b[0]) / 2 - 14 * d, (a[1] + b[1]) / 2 + 26], c.chainW); clasp(b); } }
    else if (view === "q") { const q = c.chainQ![flip ? "far" : "near"], a = w(q[0]); chainAt(k, a, end, w(q[1]), c.chainW); clasp(end);
      // (v6: the pipe drawn again over the chain, below the moustache: its stem points toward us, so the chain hangs behind it; turned to his
      //  left the chain hung in front of the stem, the review of v6)
      const qa = Q_PIPE.at; if (qa && FACE.chainBehindPipe) k.at(sk.j.skull[0], sk.j.skull[1], sk.headTilt, flip, () => k.clip([[-400, -46], [400, -46], [400, 400], [-400, 400]], () => pipeAt(k, qa[0], 1, qa[1], qa[2]))); }
    else { const tx = sn * c.turn; chainAt(k, w([c.chainFront[0][0] + tx, c.chainFront[0][1]]), end, w([c.chainFront[1][0] + tx, c.chainFront[1][1]]), c.chainW); clasp(end); }
  };
  // (v5: turning between front and side, 24 to 37 degrees off the lens, the far arm comes out from behind the body instead of jumping in
  //  front of it in one frame: it is drawn behind, and the part of it that lies over the body is shown from the body's far edge inward as he
  //  turns toward the lens. Switched at 30 degrees, the far arm changed layer in one frame in the turns of 03, Jesper on v4, "Ja")
  const as = Math.abs(sk.sin);
  if (!other && o.armWipe !== false && as > ARM_WIPE[0] && as < ARM_WIPE[1]) {
    const far = sk.far, near = sk.near; arm(far); leg(far); leg(near); torso(); head();
    // (the line sweeps the whole figure, from past its far side (nothing shown over it: the side's order, the far arm under everything) to past
    //  its near side (all of it: the front's order, the far arm over the legs too); swept over the body alone, the far arm went from under the
    //  legs to over them in one frame where the front's order took over, v5 draft)
    const u = (ARM_WIPE[1] - as) / (ARM_WIPE[1] - ARM_WIPE[0]), m = P.hand + 20;
    const xs = [...torsoPoly.map((p) => p[0]), ...["sh", "el", "wr", "tip", "kn", "an", "hip"].flatMap((n) => [J(sk, n, far)[0], J(sk, n, near)[0]])], x0 = Math.min(...xs) - m, x1 = Math.max(...xs) + m;
    // (the line spends most of the turn crossing the far arm itself, from its outer edge to its inner, and the rest passing the figure beyond
    //  it: swept evenly over the whole figure it crossed the sleeve in a frame or two, a jump again, v5 draft)
    const ax = ["sh", "el", "wr", "tip"].map((n) => J(sk, n, far)[0]), aw = B.arm[0], a0 = Math.min(...ax) - aw, a1 = Math.max(...ax) + aw;
    const side = Math.sign(J(sk, "sh", far)[0] - J(sk, "sh", near)[0]) || 1, xFar = side > 0 ? x1 : x0, xNear = side > 0 ? x0 : x1, aOut = side > 0 ? a1 : a0, aIn = side > 0 ? a0 : a1;
    const line = u < 0.1 ? xFar + (aOut - xFar) * (u / 0.1) : u < 0.9 ? aOut + (aIn - aOut) * ((u - 0.1) / 0.8) : aIn + (xNear - aIn) * ((u - 0.9) / 0.1), B9 = 1e4;
    const half: P2[] = side > 0 ? [[line, -B9], [B9, -B9], [B9, B9], [line, B9]] : [[-B9, -B9], [line, -B9], [line, B9], [-B9, B9]];
    // (v6: the hand is left out of the sweep: the sleeve is swept, the hand changes layer whole as the line passes its middle, and no line is
    //  drawn over it; swept with the arm, the hand was cut straight through and a thin line ran across it, the review of v5)
    // (v6: the hand's part is everything past the cuff's end, across the forearm: a circle round the hand cut across the sleeve above the cuff,
    //  leaving a notch where the coat's edge met the cuff and a faint line over the sleeve, the review of v6)
    const W2 = J(sk, "wr", far), T2 = J(sk, "tip", far), E0 = J(sk, "el", far), hc: P2 = [(W2[0] + T2[0]) / 2, (W2[1] + T2[1]) / 2], ewL = Math.hypot(W2[0] - E0[0], W2[1] - E0[1]) || 1;
    const dd: P2 = [(W2[0] - E0[0]) / ewL, (W2[1] - E0[1]) / ewL], nn: P2 = [-dd[1], dd[0]], c0: P2 = [W2[0] + dd[0] * (0.04 * ewL + 1), W2[1] + dd[1] * (0.04 * ewL + 1)], HR = P.hand * 1.6;
    const handPts: P2[] = [[c0[0] + nn[0] * HR, c0[1] + nn[1] * HR], [c0[0] - nn[0] * HR, c0[1] - nn[1] * HR], [c0[0] - nn[0] * HR + dd[0] * 2 * HR, c0[1] - nn[1] * HR + dd[1] * 2 * HR], [c0[0] + nn[0] * HR + dd[0] * 2 * HR, c0[1] + nn[1] * HR + dd[1] * 2 * HR]];
    const outside = (fn: () => void) => { const g = k.g; g.save(); g.beginPath(); g.rect(-B9, -B9, 2 * B9, 2 * B9); k.trace(handPts); g.clip("evenodd"); fn(); g.restore(); };
    // (the hand changes layer where it lies least under the coat's edge: about 16 % of it at |sin| 0.35, against 25 % at the sweep's ends; it
    //  overlaps the coat somewhere all through the turn, so this is the smallest change the hand can make, as the review of v5 allowed)
    // (v7: the hand changes layer as the sweep line passes the coat's edge at the cuff's height: while the line is inside that edge the sleeve
    //  just above the cuff lies over the coat, so the hand does too; past it nothing of the sleeve there lies over the coat, and the hand goes
    //  under it with no step. At a set |sin| (0.35) the sleeve still lay over the coat above the cuff while the coat covered the hand below:
    //  a notch at the cuff, the review of v6 and the v7 render. HAND_SWAP is kept for a cuff off the coat, where nothing overlaps)
    // (tested across the sleeve's whole width at the cuff, where the hand's part meets the rest of the arm: the coat widens above the cuff,
    //  and tested at one height the sleeve still lay over a sliver of it, a small step and a short line at the cuff, 03 frames 92-93 of the v7 render)
    const inPoly = (P: P2[], x: number, y: number) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
    // (how much of an edge across the forearm at c, the hand's width each side, lies on the coat where the sweep shows the arm over it)
    // (on the edge across the forearm at c, within w each side of the arm's line: how much of the coat (its outline counted, half of its stroke
    //  lies outside the polygon) lies where the sweep shows the arm over it, and how much where it does not)
    const onCoat = (x: number, y: number) => inPoly(torsoPoly, x, y) || inPoly(torsoPoly, x + 10, y) || inPoly(torsoPoly, x - 10, y);
    const coatAt = (c: P2, w: number) => { let o = 0, n = 0; for (let i = 0; i < 25; i++) { const v = -w + (2 * w * i) / 24, x = c[0] + nn[0] * v, y = c[1] + nn[1] * v; if (onCoat(x, y)) { if (side > 0 ? x > line : x < line) o += (2 * w) / 24; else n += (2 * w) / 24; } } return { o, n }; };
    // (v7: a hand under the coat keeps the forearm's lower part with it, from 0.7 of the way from the elbow, where the sleeve is all there is:
    //  an edge across the arm drawn through a soft clip shows the layers under it, and across the cuff and the hand the sleeve's brown showed as
    //  a thin line over the skin, v7 render frames 87-94)
    const c1: P2 = [E0[0] + dd[0] * 0.7 * ewL, E0[1] + dd[1] * 0.7 * ewL], LB = 0.3 * ewL + 2 * HR;
    const behindPts: P2[] = [[c1[0] + nn[0] * HR, c1[1] + nn[1] * HR], [c1[0] - nn[0] * HR, c1[1] - nn[1] * HR], [c1[0] - nn[0] * HR + dd[0] * LB, c1[1] - nn[1] * HR + dd[1] * LB], [c1[0] + nn[0] * HR + dd[0] * LB, c1[1] + nn[1] * HR + dd[1] * LB]];
    // (v7: the arm in front from c1 or under the coat from c1, whichever leaves less of a step where the sleeve meets the coat's edge at c1:
    //  in front, the coat's edge stops at the sleeve where the sweep does not yet show it (n); under it, the sleeve covers the edge where the
    //  sweep shows it (o). The sweep crosses the arm one way, so the choice changes once. With the arm off the coat there, at HAND_SWAP.
    //  (in front from c1 at the first sight of the coat in the sweep, its outline stopped in a corner on the waistcoat, v7 render frame 40)
    const W1 = B.arm[1] + 8, { o: o1, n: n1 } = coatAt(c1, W1);
    const handShown = !FACE.cuffSwap || o1 + n1 === 0 || o1 === n1 ? as < HAND_SWAP : o1 > n1;
    // (for the check: the step left at c1 and the least the sweep allows there, marked as points apart)
    k.mark("cuffA", 0, 0); k.mark("cuffStep", handShown ? n1 : o1, 0); k.mark("cuffMin", Math.min(o1, n1), 0);
    // (v7: the arm drawn whole on a canvas of its own and laid on through the clip: drawn through the clip shape by shape, its outline (a
    //  dark shape under the fill) showed at the clip's soft edge as a thin line across the sleeve, v7 render frames 40-42 and 92-94)
    const flatten = (setClip: (g: CanvasRenderingContext2D) => void, fn: () => void) => { const g = k.g, cv = (g as unknown as { canvas?: { width: number; height: number } }).canvas, Off = (globalThis as unknown as { OffscreenCanvas?: new (w: number, h: number) => { getContext(t: "2d"): CanvasRenderingContext2D } }).OffscreenCanvas;
      if (!cv || !Off || !cv.width) { g.save(); setClip(g); fn(); g.restore(); return; }
      const off = new Off(cv.width, cv.height), og = off.getContext("2d"); og.setTransform(g.getTransform()); k.g = og; try { fn(); } finally { k.g = g; }
      g.save(); setClip(g); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(off as unknown as CanvasImageSource, 0, 0); g.restore(); };
    const without = (pts: P2[], fn: () => void) => { const g = k.g; g.save(); g.beginPath(); g.rect(-B9, -B9, 2 * B9, 2 * B9); k.trace(pts); g.clip("evenodd"); fn(); g.restore(); };
    // (v7: in front, the sleeve and the hand are shown through one clip, their union: two clips meeting at the cuff, each with a soft edge, let
    //  the coat under them show through as a thin dashed line across the hand, the v7 render)
    const area = (P2s: P2[]) => P2s.reduce((a, p, i) => { const q = P2s[(i + 1) % P2s.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0);
    // (v7: in front, the hand takes the forearm's lower part with it, from c1 as under the coat: from the cuff's end the hand's top above it
    //  stayed under the coat, a notch in its outline, v7 render frame 92)
    const hp = Math.sign(area(behindPts)) === Math.sign(area(half)) ? behindPts : [...behindPts].reverse();
    if (!FACE.cuffSwap) { outside(() => k.clip(half, () => arm(far))); if (handShown) k.clip(handPts, () => arm(far)); }
    else if (handShown) flatten((g) => { g.beginPath(); k.trace(half); k.trace(hp); g.clip("nonzero"); }, () => arm(far));
    else flatten((g) => { g.beginPath(); g.rect(-B9, -B9, 2 * B9, 2 * B9); k.trace(behindPts); g.clip("evenodd"); g.beginPath(); k.trace(half); g.clip(); }, () => arm(far));
    // (the cut drawn as the coat's edge where it crosses the sleeve, inside the body, never over the hand: without it the sleeve looked sliced)
    // (v7: kept off a circle round the hand too: the line's stroke reached over the hand's top above the cuff, a small dark square in it, v7
    //  render frames 91-92; and off the forearm's part under the coat when the hand is there)
    const HC = Math.max(Math.hypot(hc[0] - W2[0], hc[1] - W2[1]), P.hand * 0.6) + 12, circ: P2[] = Array.from({ length: 24 }, (_, i) => [hc[0] + HC * Math.cos((i * Math.PI) / 12), hc[1] + HC * Math.sin((i * Math.PI) / 12)] as P2);
    if (u > 0 && u < 1) { const S2 = J(sk, "sh", far), E2 = J(sk, "el", far), cutLine = () => k.clip(torsoPoly, () => { for (const piece of limb(S2, E2, W2, B.arm)) k.clip(piece, () => k.line([[line, -B9], [line, B9]], k.ol)); });
      if (!FACE.cuffSwap) outside(cutLine); else without(behindPts, () => without(circ, cutLine)); }
    arm(near); beardOverlay(k, sk, r, B, P, [near], foreArm); return;
  }
  // (v6c, the cloud session's yes on 27 Nov: turned from the lens (the side's order) the captain's far arm lies under his coat, and a forearm
  //  brought forward to the table, his lap or his chin showed only its hand beside the waistcoat, a hand out of the coat, the review of v6 and
  //  the reviewer on shot 9 frame 463. Brought forward (farForeOver), its forearm from the elbow, with its own outline, its cuff and its hand
  //  are drawn over the coat, under the head and the near arm)
  layers(sk, { arm, leg, torso: () => { torso(); if (!other && farForeOver(sk, kit, o.armWipe)) foreArm(sk.far); }, head });
  beardOverlay(k, sk, r, B, P, Math.abs(sk.sin) > 0.5 ? [sk.near] : [sk.far, sk.near], foreArm);
};
/** where the far arm comes out from behind the body in a turn (|sin| of the facing); [0, 0] switches it in one frame at 0.5 (the v4 order,
 *  the bytes check's planted fault) */
export const ARM_WIPE: [number, number] = [0.15, 0.8];
/** the captain's cuff: from and to (shares of the way from the elbow to the wrist) and its half-width against the sleeve's at the wrist */
export const CUFF: [number, number, number] = [0.76, 1.0, 1.15];
/** is a coat's far forearm drawn over the coat: in the side's order (|sin| over 0.5, with no sweep), always, so it never changes layer inside a
 *  shot (by the forearm's angle it came and went in 11 as the hand moved on the table, a layer switch in one frame). The captain sits through the
 *  film with his hands forward (the table, his knee, his chest); none hangs at his side behind him. For kit.ts and dinner_check 10 */
export const farForeOver = (sk: Sk, kit: Kit | null, armWipe?: boolean) => kit?.top === "coat" && armWipe === false && Math.abs(sk.sin) > 0.5;
/** where the far hand changes layer in a turn (|sin|): front's order under it, the side's over it */
export const HAND_SWAP = 0.35;
/** a shoe as drawn: no part of it below the ground line (y = 0): turning, lifting or setting down a foot, its toe went 5-10 px through the
 *  line (the review of the motion test). clamp = false gives the shoe as it was (the check's planted fault) */
export const shoeDrawn = (sk: Sk, side: Side, W: number, clamp = true) => {
  const sh = shoePts(sk, side, W, 0.34, 0.2);
  // (a foot whose toe or heel touches the ground has its drawn shoe touch it too: with the heel a little up the shoe's rounded toe stood
  //  5-11 px above the line, a floating foot, the independent review of v4. The shoe comes down until its lowest point is on the line)
  const touch = clamp && Math.max(sk.j[`heel${side}`][1], sk.j[`toe${side}`][1]) > -0.5, low = Math.max(...sh.pts.map((p) => p[1])), dy = touch && low < 0 ? -low : 0;
  const cl = (p: P2): P2 => [p[0], clamp ? Math.min(p[1] + dy, 0) : p[1]];
  return { pts: sh.pts.map(cl), a: cl(sh.O), b: cl(add(sh.O, sh.ex, sh.span)), kk: sh.kk };
};
/** the body sizes for a kit: the torso's rows scaled across and in depth, the limbs' widths its own; the coat's hem lower for a long coat */
export const kitBody = (B: Body, kit: Kit | null): Body => kit ? { ...B, rows: B.rows.map(([a, w, df, db], i) => [i === 0 && kit.body.hem ? a + kit.body.hem : a, w * kit.body.w, df * kit.body.d, db * kit.body.d]), arm: kit.body.arm, leg: kit.body.leg } : B;
const design = (c: FlatSpec): Design => ({ id: c.id, name: c.name, ol: c.ol, faceW: c.faceW, props: (w: Who) => (w === "baker" ? c.other.P : c.sir.P), draw: drawFlat(c) });

// ======================= A: KNOPP — a round head half his height, a small round body =======================
const CA: Col = { skin: "#f7c9a3", nose: "#ef9f86", hair: "#4a2e1e", cap: "#9b6b43", coat: "#9b6b43", vest: TURQ, shirt: "#fffaf0", tie: "#d9483b", trous: "#6e5a4a", shoe: "#3a2a22",
  dress: "#f2a33a", stock: "#3d3346", collar: "#fffaf0" };
const ADA_HAIR_A = "#2e2a3a";
/** A's moustache, the right half (8 higher than on the sheet, with the mouth: a chin under the open mouth) */
const MOUS_A: P2[] = [[0, -72], [30, -80], [62, -74], [88, -84], [98, -106], [112, -100], [102, -68], [66, -58], [30, -62], [0, -66]];
const A_SPEC: FlatSpec = {
  id: "flatA", name: "A Knopp", ol: 9, faceW: 160, turn: 34,
  sir: { P: { thigh: 70, shin: 64, ankle: 16, foot: 92, hipW: 40, shW: 60, spine: 150, shDrop: 18, neck: 4, head: 262, upper: 74, fore: 68, hand: 60 },
    B: { rows: [[-34, 58, 50, 46], [0, 66, 64, 50], [50, 74, 76, 52], [100, 70, 66, 48], [132, 62, 50, 42], [150, 40, 34, 30], [162, 22, 22, 20]], arm: [23, 19, 17], leg: [27, 23, 20], shoeW: 42, neck: 0 } },
  other: { P: { thigh: 66, shin: 60, ankle: 16, foot: 80, hipW: 34, shW: 50, spine: 140, shDrop: 16, neck: 4, head: 244, upper: 66, fore: 62, hand: 54 },
    B: { rows: [[-80, 80, 66, 62], [-40, 66, 56, 52], [0, 52, 44, 40], [60, 42, 38, 32], [110, 52, 40, 34], [128, 40, 30, 26], [148, 20, 20, 18]], arm: [19, 16, 14], leg: [15, 13, 11], shoeW: 34, neck: 0 } },
  col: CA, chainFront: [[-74, -92], [-96, -2]], chainSide: [[42, -74], [40, 10]], chainEnd: [-34, 64], chainW: 4.5, vest: [150, -4, 36],
  sirFront: (k, r, tx, lift) => {
    for (const s of [-1, 1]) fl(k, ellPts(s * 126, -118, 24, 30), lc('skin', CA.skin));
    fl(k, ellPts(0, -128, 128, 132, 0, 0, 360, 60), lc('skin', CA.skin));
    kitFace(k, "front", 0);
    for (const s of [-1, 1]) { const [i, o] = browEnds(r, s * 46 + tx, -172, 1, 20, s); k.line([i, o], 15 + k.ol * 1.7); k.line([i, o], 15, LOOK.brow ?? CA.hair); }
    // (the eyes and the monocle are drawn after the mouth, the pipe and the moustache, below: drawn before, the moustache lay over the eyes'
    //  lower edge and the monocle's ring while the monocle's cord lay on top, the independent review of the motion test v4)
    // (the mouth always shows under the moustache, closed a small dark mouth, so it can move with the voice; the pipe sits in its corner:
    //  Jesper choosing A, 21 Nov)
    const mw = 24 * (1 + 0.4 * r.mouth);
    // (the mouth's top under the moustache, so the open mouth, a third taller, ends above the chin: lower, it went past the head's edge)
    // (moustache and mouth 8 higher than on the sheet, so a narrow chin shows under the open mouth: it reached the head's edge, the review of
    //  the motion test)
    // (shut, a mouth 0.2 open, so it reads at phone size: at 0.13 it was a strip of 2-4 px; the pipe rides the mouth's corner down as it
    //  opens: it stayed under the moustache while the mouth gaped, the review of the shot types v1)
    const m0 = Math.max(r.mouth, 0.2);
    if (KIT.k) { if (KIT.k.beard !== "full") kitMouthDraw(k, "front", r, tx); } else mouthAt(k, tx + r.smirk * 4, -52, mw, 1, { ...r, mouth: m0 }, "#e0806e");
    if (LOOK.pipe) pipeAt(k, [tx + mw - 2, -48 + 61 * (m0 - 0.2) * 0.45 + cornerDown(r, 1)], 1, 1, droopOf(r));
    // (v6: turned toward three-quarter, the half on the side he turns to is shortened just enough to stay inside the head: at tx 15 its tip went
    //  6 past the outline. At tx 0, as in 01 and 04, nothing changes)
    const sideK = Math.min(1, (118 - Math.abs(tx)) / 112), R = MOUS_A.map(([x, y]) => [x * (tx > 0 ? sideK : 1), y] as P2), Lh = mirror(MOUS_A).map(([x, y]) => [x * (tx < 0 ? sideK : 1), y] as P2);
    if (LOOK.moustache) fl(k, at(spline([...R, ...Lh.reverse()]), tx), lc('hair', CA.hair));
    { const es = KIT.k?.eyes ?? 1; for (const s of [-1, 1]) eyeA(k, s * 46 * (es > 1 ? 1.05 : 1) + tx, -118 + (es - 1) * 30, es, r, lc('skin', CA.skin), -s); }
    if (LOOK.mono) monoRing(k, -46 + tx, -118, 42, 52, 7);
    fl(k, ellPts(tx, -84, 17, 14), lc('nose', CA.nose));
    tearAt(k, tx + 54, -82, 1, r.tear); tearAt(k, tx - 38, -82, 0.9, r.tear * 0.7);
    if (KIT.k) kitHat(k, 0); else { k.g.save(); k.g.translate(-lift * 12, -lift * 50); capFront(k, 124, -206, -312, lc('cap', CA.cap), 12); k.g.restore(); }
  },
  sirSide: (k, r, lift, mono = true) => {
    if (KIT.k) kitBack(k, 1);
    fl(k, ellPts(0, -128, 124, 132, 0, 0, 360, 60), lc('skin', CA.skin));
    ear(k, -34, -112, 22, 30, lc('skin', CA.skin));
    kitFace(k, "side", 1);
    const [i, o] = browEnds(r, 66, -172, 0.9, 18, -1); k.line([i, o], 14 + k.ol * 1.7); k.line([i, o], 14, LOOK.brow ?? CA.hair);      // (side -1: the brow's inner end toward the nose; the other way a scared brow read as cross in profile)
    // (from the side the pipe's mouthpiece is in the mouth under the moustache, not at the moustache's tip: Jesper choosing A. The mouth is drawn
    //  after the stem, so it shows in profile too: it was hidden by the moustache and the pipe while he walked in, the review of the motion test)
    if (LOOK.pipe) pipeAt(k, [104, -40], 1, 1, droopOf(r));
    if (KIT.k) { if (KIT.k.beard !== "full") kitMouthDraw(k, "side", r); } else mouthAt(k, 92, -40, 14 * (1 + 0.4 * r.mouth), 0.9, { ...r, mouth: Math.max(r.mouth, 0.16) }, "#e0806e");
    if (LOOK.moustache) fl(k, spline([[70, -72], [108, -76], [130, -80], [140, -100], [151, -94], [140, -66], [112, -58], [74, -62]]), lc('hair', CA.hair));
    eyeA(k, 66, -118 + ((KIT.k?.eyes ?? 1) - 1) * 30, 0.9 * (KIT.k?.eyes ?? 1), { ...r, gaze: [Math.max(0.35, r.gaze[0]), r.gaze[1]] }, lc('skin', CA.skin), 1);      // (after the moustache, as front and three-quarter)
    if (mono && LOOK.mono) monoRing(k, 66, -118, 36, 50, 7);
    fl(k, ellPts(126, -82, 19, 16), lc('nose', CA.nose));
    tearAt(k, 72, -82, 1, r.tear);
    if (KIT.k) kitHat(k, 1); else { k.g.save(); k.g.translate(-lift * 40, -lift * 50); k.g.rotate(-lift * 0.25); capSide(k, -128, 112, -206, -312, lc('cap', CA.cap), LOOK.brim); k.g.restore(); }
  },
  // three-quarter, facing the picture's right: the near eye (his right) full, the far eye narrower by the edge, the nose by the edge, the near
  // half of the moustache long and the far one short, the near ear on the head's left
  sirQ: (k, r, lift, mono) => {
    // (the far ear just showing past the cheek: from the front both ears popped out in one frame, the review of v2. v6: larger and further out,
    //  so its skin shows past the cheek: at 120 with 12 only its outline came out, a black half-moon at the head's edge, the review of v6)
    if (FACE.earSliver) ear(k, 126, -114, 17, 25, lc('skin', CA.skin)); else ear(k, 120, -114, 12, 22, lc('skin', CA.skin));
    if (KIT.k) kitBack(k, 0.7);
    fl(k, ellPts(0, -128, 126, 132, 0, 0, 360, 60), lc('skin', CA.skin));
    ear(k, -92, -114, 20, 28, lc('skin', CA.skin));
    kitFace(k, "q", 0.7);
    for (const [x, hw] of [[10, 20], [74, 14]] as [number, number][]) { const [i, o] = browEnds(r, x, -172, 1, hw, x < 40 ? -1 : 1); k.line([i, o], 15 + k.ol * 1.7); k.line([i, o], 15, LOOK.brow ?? CA.hair); }
    // (a three-quarter head looks the way it faces: the pupils start 0.45 toward that side and the gaze adds to it. At the gaze alone the near
    //  pupil sat in the eye's middle while he pointed at Ada and he seemed to look into the lens, the review of v3)
    const gz: P2 = [Math.min(1, 0.45 + 0.7 * Math.max(0, r.gaze[0])), r.gaze[1]];
    // (v1-v4: the monocle's ring was drawn after the nose, the review of the shot types v1; v5: the nose last, below)
    const es = KIT.k?.eyes ?? 1, ey = -118 + (es - 1) * 30;
    const eyesAndMono = () => { eyeA(k, 10 - (es - 1) * 20, ey, es, { ...r, gaze: gz }, lc('skin', CA.skin), 1); eyeA(k, 76, ey, 0.8 * es, { ...r, gaze: gz }, lc('skin', CA.skin), -1, Q_NOSE); };
    const ring = () => { if (!LOOK.mono) return; if (mono === "near") monoRing(k, 10, -118, 42, 52, 7); else monoRing(k, 76, -118, 34, 44, 7); };
    // (the mouth nearer the head's middle, kept inside the head's outline with a narrow chin under it, its open height 0.8 of the front's: at
    //  the nose's side the jaw curves up and the open mouth and its lip went out past the outline, over the collar; closed it shows below the
    //  moustache as clearly as from the front. The review of the motion test v3)
    const mw = 18 * (1 + 0.4 * r.mouth), head = ellPts(0, -128, 126, 132, 0, 0, 360, 60);
    // (closing, the mouth comes down 10 below the moustache's edge and keeps a small open shape: at -58 the closed mouth lay under the
    //  moustache, 2-4 px, unseen at phone size)
    // (at rest the small dark mouth of the front, 0.13 open, no tongue: at 0.26 it stood open with its tongue while he was silent, the
    //  independent review of v4; it sits 14 lower when closed, under the moustache's edge)
    const my = -58 + 14 * (1 - Math.min(1, r.mouth / 0.5));
    const m0 = Math.max(r.mouth, 0.2);
    if (KIT.k) { if (KIT.k.beard !== "full") kitMouthDraw(k, "q", r); } else k.clip(head, () => mouthAt(k, 62 + r.smirk * 4, my, mw, 0.8, { ...r, mouth: m0 }, "#e0806e"));
    // (the pipe stays in his left mouth corner: turned to his left that corner is the far one, at the mouth's nose side; turned to his right
    //  (drawn mirrored) it is the near one, at the mouth's back, the stem going out the same way on the screen as from the front. It jumped
    //  to the other corner in one frame, the review of v2)
    const pa: P2 = mono === "far" ? [62 - mw + 2, my + 4 + 61 * 0.8 * (m0 - 0.2) * 0.45 + cornerDown(r, 0.8)] : [62 + mw - 2, my + 4 + 61 * 0.8 * (m0 - 0.2) * 0.45 + cornerDown(r, 0.8)];
    if (LOOK.pipe) { pipeAt(k, pa, 1, mono === "far" ? -1 : 1, droopOf(r)); Q_PIPE.at = [pa, mono === "far" ? -1 : 1, droopOf(r)]; } else Q_PIPE.at = null;
    // (the far half 0.6 of the near one: at 0.34 the moustache doubled in size the frame the head turned to the front, the review of v2)
    // (the far half 0.5, the whole moustache 6 nearer the middle: at 0.6 from 84 its tip and the pipe came close to the head's outline, v3)
    // (v6: see qMoustache)
    const { near, far } = qMoustache();
    if (LOOK.moustache) fl(k, spline([...far, ...[...near].reverse()]), lc('hair', CA.hair));
    eyesAndMono();      // (after the moustache: the eyes and the monocle over it, the cord over them as before)
    // (v5: the nose over the eyes and the monocle's ring in every view, as from the front and in profile: turned to his left the ring on the
    //  far eye lay over the nose, Jesper on the shot types v4, "Ja"; this undoes the order the review of v1 asked for. FACE.noseLast = false
    //  is the check's planted fault, the order of v4)
    if (FACE.noseLast) { ring(); fl(k, ellPts(104, -84, 17, 14), lc('nose', CA.nose)); } else { fl(k, ellPts(104, -84, 17, 14), lc('nose', CA.nose)); ring(); }
    tearAt(k, 84, -82, 0.9, r.tear); tearAt(k, 18, -82, 1, r.tear * 0.7);
    if (KIT.k) kitHat(k, 0.7); else { k.g.save(); k.g.translate(-lift * 20 + 18, -lift * 50); capFront(k, 124, -206, -312, lc('cap', CA.cap), 12); k.g.restore(); }
  },
  otherQ: (k, r) => {
    fl(k, ellPts(-56, -252, 42, 40), ADA_HAIR_A);
    fl(k, ellPts(0, -120, 120, 124, 0, 0, 360, 60), CA.skin);
    ear(k, -92, -110, 18, 24, CA.skin);
    fl(k, spline([[-118, -100], [-124, -170], [-84, -232], [10, -250], [96, -226], [122, -176], [118, -140], [80, -172], [30, -184], [-20, -178], [-70, -160], [-100, -122]]), ADA_HAIR_A);
    for (const [x, hw] of [[14, 18], [76, 12]] as [number, number][]) { const [i, o] = browEnds(r, x, -176, 0.95, hw, x < 40 ? -1 : 1); k.line([i, o], 9 + k.ol * 1.7); k.line([i, o], 9, ADA_HAIR_A); }
    const gz: P2 = [Math.min(1, 0.45 + 0.7 * Math.max(0, r.gaze[0])), r.gaze[1]];      // (as Sir's: a three-quarter head looks the way it faces)
    eyeA(k, 14, -124, 0.95, { ...r, gaze: gz }, CA.skin, 1); eyeA(k, 78, -124, 0.76, { ...r, gaze: gz }, CA.skin, -1);
    if (r.lid < 0.9 && r.squeeze < 0.5) { ln(k, [[-10, -150], [-20, -162]], 0.7); ln(k, [[96, -146], [104, -156]], 0.7); }
    fl(k, ellPts(104, -90, 10, 8), CA.nose);
    k.clip(ellPts(0, -120, 120, 124, 0, 0, 360, 60), () => mouthAt(k, 68, -58, 16 * (1 + 0.3 * r.mouth), 0.95, r));
    tearAt(k, 84, -88, 0.9, r.tear);
  },
  chainQ: { near: [[-24, -78], [-50, -4]], far: [[56, -80], [10, 0]] },
  otherFront: (k, r, tx) => {
    fl(k, ellPts(0, -262, 44, 40), ADA_HAIR_A);
    for (const s of [-1, 1]) fl(k, ellPts(s * 118, -112, 20, 26), CA.skin);
    fl(k, ellPts(0, -120, 120, 124, 0, 0, 360, 60), CA.skin);
    fl(k, spline([[-124, -110], [-128, -170], [-90, -232], [0, -250], [90, -232], [128, -170], [124, -110], [100, -160], [40, -186], [tx, -176], [-60, -190], [-104, -160]]), ADA_HAIR_A);
    for (const s of [-1, 1]) { const [i, o] = browEnds(r, s * 44 + tx, -176, 0.95, 18, s); k.line([i, o], 9 + k.ol * 1.7); k.line([i, o], 9, ADA_HAIR_A); }
    for (const s of [-1, 1]) { eyeA(k, s * 44 + tx, -124, 0.95, r, CA.skin, -s); if (r.lid < 0.9 && r.squeeze < 0.5) ln(k, [[s * 70 + tx, -150], [s * 82 + tx, -162]], 0.7); }
    fl(k, ellPts(tx, -88, 10, 8), CA.nose);
    mouthAt(k, tx, -56, 20 * (1 + 0.3 * r.mouth), 0.95, r);
    tearAt(k, tx + 52, -88, 0.9, r.tear);
  },
  otherSide: (k, r) => {
    fl(k, ellPts(-92, -236, 42, 40), ADA_HAIR_A);
    fl(k, ellPts(0, -120, 118, 124, 0, 0, 360, 60), CA.skin);
    fl(k, spline([[-116, -90], [-122, -170], [-80, -232], [10, -248], [80, -226], [110, -186], [60, -190], [10, -176], [-30, -150], [-60, -96]]), ADA_HAIR_A);
    const [i, o] = browEnds(r, 64, -176, 0.9, 16, -1); k.line([i, o], 9 + k.ol * 1.7); k.line([i, o], 9, ADA_HAIR_A);
    eyeA(k, 64, -124, 0.88, { ...r, gaze: [Math.max(0.35, r.gaze[0]), r.gaze[1]] }, CA.skin, 1);
    if (r.lid < 0.9 && r.squeeze < 0.5) ln(k, [[88, -150], [100, -160]], 0.7);
    fl(k, ellPts(118, -92, 11, 9), CA.nose);
    mouthAt(k, 96, -58, 12 * (1 + 0.3 * r.mouth), 0.9, r);
    tearAt(k, 70, -88, 0.9, r.tear);
  },
};

/** the wardrobe's design: A's drawing with the kit's parts (the Look must carry a kit) */
export const KIT_DESIGN: Design = { ...design(A_SPEC), id: "kitA", name: "A Knopp, wardrobe" };
export { A_SPEC as KIT_SPEC };

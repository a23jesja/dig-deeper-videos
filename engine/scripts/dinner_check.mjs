// The Short "The captain's dinner": the checks of impossible things, every frame of every shot.
//   1  seat: the seated captain's drawn seat (the lowest of his thighs' undersides at the pelvis) lies on his stool's top, within 1 cm
//   2  feet: no foot point below the floor (0.5 cm); a foot point at floor height is drawn on the floor's line (within 3 px)
//   3  the pudding: in every held shot the crewman's grip is under the pudding (the place Blender put it), within 1 cm
//   4  the table: the captain's hands on the table (shot 7) lie on its top: no point of the hand under the top (0.5 cm) or more than 3 cm over it
//   5  frame edges: a hand is inside the picture with a margin, or wholly out of it
//   8  no face covered: a farther figure's face is never under a nearer figure
//   7  nobody missing: a figure of the room not drawn in a shot is wholly out of its picture
//   6  words: the caption band between 15 % and 85 % of the height, never over a face (the head's circle below the cap) or a hand
//   9  no hand over the own mouth while speaking: no point of the drawn mouth with its lower lip under the figure's own hand as the rig draws
//      it (the real `hand` shape, its thumb included, grown by half the ink line), the hand that is drawn over the head (side order: the near
//      one; from the front both) (DAILY-RULES "Hands and the body"; v5 shot 6, the thumb on the crewman's lip)
//  10  no one-armed look in medium and close shots (the figure 50 % of the picture's height or more): each arm whose drawn area is in the
//      picture shows at least 15 % of it (not under his own legs, torso, head and cap or near arm as the side order draws them, nor under a
//      nearer figure); an arm hidden by a named object is listed in HIDDEN_BY with that object (v5 8c, the crewman's arm behind his head)
//   +  writes the root for the frozen measures (motion2, flicker2, and step 1's depth check): out/din3d/root
//  11  the mouth inside the head: every point of the drawn mouth with its lip at least an ink line inside the head's outline (the figure
//      sheet's review, 25 Nov: open mouths at Sir's place reached the outline at the chin)
//  14  no face switch inside a shot (v57): a figure's mouth never crosses 0.2 (the lower lip comes and goes there) and his smile never 0.3 (the
//      smiling lower lid starts there); his eyes never cross the squeeze's 0.5 (chevrons); planted smileCross: the crewman's smile 0.6 lower from halfway
//  15  a cut between two shots that both show a figure's whole head turns the lens at least 30 degrees and changes his size at least 1.3 times
//  16  arms move like human arms: the elbow bent at most 150 degrees; a forearm or hand past the torso's midline only with its elbow seen and
//      bent; the upper arm in toward the body's middle at most 30 degrees (Jesper on v6 shot 4 and 11-13 s; see the rule below)
//  17  no crossing stripes on a striped sleeve (the review of v6, point 4)
//  18  no lid's line across a pupil (the review of v6, point 9)
//  12  the head's drawing does not change inside a shot: the face's turn never crosses 15-28 or 50-60 degrees within a shot, where the
//      head and the tricorn change drawing (the sheet's review: the hat's shape jumps there)
// Planted faults (each must fail, and on its own rule: the run exits 1 only when that rule fired): --plant seatHigh (the seat 5 cm over the
// stool, rule 1), pudOff (the grip 3 cm off the pudding, 3), handIn (the hands 4 cm into the table top, 4), float (a figure 12 px over the
// floor, 2), capLow (the words in the bottom 15 %, 6), missing (the boy left out of the first shot that sees him, 7), faceHide (the boy put
// 0.5 m behind the crewman as shot 4's lens sees them, 8), mouthHand (each speaker's near hand moved onto his mouth, 9), oneArm (the
// crewman's far arm raised up behind his head, as v5's 8c, in every medium and close shot, 10), mouthOut (every mouth 40 out and 20
// down in the head's frame, 11), turnCross (the crewman's face turning 0 to 40 degrees more through his first shot, 12).
//   node scripts/dinner_check.mjs [--plant seatHigh|pudOff|handIn|float|capLow|missing|faceHide|mouthHand|oneArm|mouthOut|turnCross]
import * as esbuild from "esbuild"; import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const NOTE6 = {}, NOTE8 = {}, STATE8 = {}, NOTE18 = {};
/** the shots' own figures (as the tuner's MAIN): their faces never hidden at all */
const OWN8 = { 1: ["crew", "captain"], 2: ["captain"], 3: ["crew"], 4: ["crew"], 5: ["boy"], 7: ["crew"], 8: ["crew"], 9: ["captain"], "10b": ["captain"], 11: ["captain"], 12: ["crew"], 13: ["crew"], 14: ["boy"], "15a": [], "15b": ["captain"] };
const arg = (k) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : null), plant = arg("--plant");
const out = "out/_din_check.mjs";
// (flat.ts keeps its design's body sizes (A_SPEC) to itself: the bundle alone exports them to this check, the file is not changed)
const exportSpec = { name: "spec", setup(b) { b.onLoad({ filter: /designs[\\/]flat\.ts$/ }, (a) => ({ contents: fs.readFileSync(a.path, "utf8") + "\nexport { A_SPEC };\n", loader: "ts" })); } };
await esbuild.build({ plugins: [exportSpec], stdin: { contents: 'export * from "./src/craft/dinner3d/core"; export * from "./src/craft/dinner3d/figures"; export { captionAt, CAP_TOPS, camFx, bodyCaps, boxHitsCap, CAP_ON_BODY, ARM_CAPS, headZones } from "./src/craft/dinner3d/Dinner3D"; export { thighUnder, scaleOf, D, FM, jointPx, footY, heightOf } from "./src/craft/clips/clipKit"; export * as BG from "./src/craft/checks/bodyGeom"; export { kitOf, kitBody, beardOutline, pupilAt, qPupils } from "./src/craft/wardrobe/kit"; export { A_SPEC } from "./src/craft/designs/flat";', resolveDir: ".", loader: "tsx" }, bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "error", loader: { ".json": "json" }, external: ["remotion", "react"] });
const M = await import(pathToFileURL(out).href); fs.rmSync(out);
const { SHOTS, WHO, PLANT, placeOf, toScreen, feetOf, project, jointPx, handPx, FM, cardToWorld, thighUnder, scaleOf, D, captionAt, PUD_UP, TABLE_TOP } = M;
const CHECK_PLANTS = { lidCut: 18, stripeNet: 17, sleeveNoInk: 10, capLow: 6, missing: 7, faceHide: 8, headPeek: 8, hide40: 8, mouthHand: 9, oneArm: 10, mouthOut: 11, turnCross: 12, seatEdge: 1, faceEdge: 13, frontArm: 10, smileCross: 14 }, RULE_OF = { seatHigh: 1, pudOff: 3, handIn: 4, handInBook: 4, float: 2, ...CHECK_PLANTS };
if (plant && !(plant in CHECK_PLANTS)) { if (!(plant in PLANT)) throw new Error("no such planted fault: " + plant); PLANT[plant] = true; }
const { BG, A_SPEC, footY, VOICES, kitOf, kitBody } = M; if (D.id !== "flatA") throw new Error("the checks' body sizes are A's: the design is " + D.id); const BODY = A_SPEC.sir.B;
// (an arm hidden by a named thing in the set, so it is no one-armed look: "shot:figure:near|far" -> the thing.
//  HIDDEN_BY is used ONLY when a named thing really hides the arm AND both his hands still show in the still; never to let a pose through that
//  reads as one-armed (the cloud session, 25 Nov). The seated captain is put right by his pose (3/4, his far hand on the table), never by this
//  list. Every entry is reported in the film STOPP with its frames and a still. None in v6)
const HIDDEN_BY = {};
// (who speaks when: each take from its place to its end)
const SPEAKS = VOICES.filter((v) => v.who !== "narrator").map((v) => ({ who: v.who, t0: v.at, t1: v.at + v.p.words[v.p.words.length - 1].b + 0.1 }));      // (to his last word: the take's silent tail ran into the next shot)
if (plant === "faceHide") { const v = M.viewOf("4"), d = Math.hypot(v.d[0], v.d[1]); M.FIGS.boy = [M.FIGS.crew[0] + (0.5 * v.d[0]) / d, M.FIGS.crew[1] + (0.5 * v.d[1]) / d]; }
const NOTES13 = {}, NOTES5 = {}, HPOS = {}, FACE14 = {};
// (faceEdge, the planted fault: the crewman moved sideways in the picture so its left edge runs through the middle of his near eye)
let missingDone = false; const armStat = {}, geomOut = [], turns = {}; let turnShot = null;
// (v6: the sea chest: [x, y, top, turn]; its top 0.56 x 0.40 m, the iron bands inside it)
const SEAT = JSON.parse(fs.readFileSync("src/craft/dinner3d/props/seat.json", "utf8")).things[0].frames[0], STOOL_TOP = SEAT[2], CH_TURN = (SEAT[3] * Math.PI) / 180;
if (plant === "seatEdge") { SEAT[0] += 0.22 * Math.cos(CH_TURN); SEAT[1] += 0.22 * Math.sin(CH_TURN); }      // (the planted fault: the chest 22 cm along its length, his seat over its end)
const onChest = (x, y) => { const dx = x - SEAT[0], dy = y - SEAT[1], u = dx * Math.cos(CH_TURN) + dy * Math.sin(CH_TURN), v = -dx * Math.sin(CH_TURN) + dy * Math.cos(CH_TURN); return Math.abs(u) <= 0.28 && Math.abs(v) <= 0.2; };
const TABLE = { x0: -1.447, x1: -0.583, y0: 0.823, y1: 1.397 }, { PLATE, BOOK, PLATE_TOP, BOOK_TOP, TARGETS, RISE, PUD_R, pudOf, HANDOVER, SIT } = M;
const faults = [], dump = {}, regions = [], fig0 = {}; let frames = 0, F0 = 0;
const hull = (P) => { const p = [...P].sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); } return [...lo.slice(0, -1), ...up.slice(0, -1)]; };
const worst = { seat: 0, grip: 0, table: [9, -9] };
const CUT15 = {}, CUTS = [], SLIDE = {};      // (each shot's first frame: the lens's direction and each whole-headed figure's size)
for (const S of SHOTS) {
  const n = Math.round((S.t1 - S.t0) * FM.FPS); let whos = WHO[S.id](); dump[S.id] = [];
  if (plant === "missing" && !missingDone && whos.some((w) => w.name === "boy")) { whos = whos.filter((w) => w.name !== "boy"); missingDone = true; }
  for (let fr = 0; fr < n; fr++) { frames++; const row = [], T = S.t0 + fr / FM.FPS;
    const placed = whos.map((w) => ({ w, pl: placeOf(S.id, fr, w) })), heads = [], hands = [], HEADS6 = [];
    for (const { w, pl } of placed) {
      const f = pl.f, scr = (j) => toScreen(pl, jointPx(f, j)), key = S.id + ":" + w.name;
      { const P = (j) => scr(j).map((v) => Math.round(v)), s0 = scr("skull"), c0 = scr("crown"), hr = Math.hypot(c0[0] - s0[0], c0[1] - s0[1]) / 2, lw = Math.round(0.17 * hr);
        heads.push([(s0[0] + c0[0]) / 2, (s0[1] + c0[1]) / 2, hr * 1.1]); HEADS6.push(...M.headZones(w.name, (s0[0] + c0[0]) / 2, (s0[1] + c0[1]) / 2, hr));
        const limbs = ["L", "R"].flatMap((d) => [[P("sh" + d), P("el" + d)], [P("el" + d), P("wr" + d)], [P("wr" + d), P("tip" + d)], [P("hip" + d), P("kn" + d)], [P("kn" + d), P("an" + d)], [P("an" + d), P("toe" + d)], [P("heel" + d), P("toe" + d)]]);
        // (each joint's own depth: the figure's floor point's depth less how far the joint stands toward the lens in the rig (sk.z), in metres)
        const kz = (scaleOf("sir") / FM.PPM) * (w.h / M.heightOf("sir")), jd = (j) => +(project(S.id, fr, cardToWorld(w, pl, jointPx(f, j)))[2] - ((f.sk.z[j] ?? 0) - f.sk.z.pelvis) * kz).toFixed(3);      /* (the joint's own point on his card, at its height: under a tilted lens a hand at 35 cm is 12 cm nearer than the floor point) */      /* (from the pelvis: the card stands on his pelvis's floor point) */
        const limbD = ["L", "R"].flatMap((d) => [["sh" + d, "el" + d], ["el" + d, "wr" + d], ["wr" + d, "tip" + d], ["hip" + d, "kn" + d], ["kn" + d, "an" + d], ["an" + d, "toe" + d], ["heel" + d, "toe" + d]]).map(([a, b]) => Math.min(jd(a), jd(b)));
        row.push({ name: key, sil: false, depth: pl.depth, limbDepth: limbD, headDepth: jd("skull"), head: [Math.round((s0[0] + c0[0]) / 2), Math.round((s0[1] + c0[1]) / 2), Math.round(hr * 1.1)], headF: [+((s0[0] + c0[0]) / 2).toFixed(2), +((s0[1] + c0[1]) / 2).toFixed(2)],
          trunk: hull(["neck", "shL", "shR", "hipL", "hipR"].map((j) => scr(j))).map((q) => q.map((v) => Math.round(v))), limbs, lw });
        fig0[key] = w.at; }
      // 18 no lid's line across a pupil (the independent review of v6, point 9: the sailor's lid cut his pupil in frame 0 and 616-658, the
      //    boy's in 693-704): each eye drawn open (lid at most 0.93, squeeze at most 0.5), its pupil where kit.ts puts it (pupilAt, the far
      //    eye at three-quarter kept clear of the nose), the upper lid's edge (lid > 0.02) and the smiling lower lid's (smile over 0.3) as
      //    kit.ts lids() draws them (a bow of 0.12 and 0.1 of the eye's height), each with half its ink line (4.5): the band may not lie over
      //    the pupil. A lid clear of the pupil, or over all of it, passes. Planted: v6 itself
      { const fc = f.o.face ?? {}, kit = kitOf(f.o.look), lid = (fc.lid ?? 0.06) + (plant === "lidCut" && w.name === "boy" ? 0.25 : 0), smile = fc.smile ?? 0, wide = fc.wide ?? 0, g0 = fc.gaze ?? [0, 0];
        const Fb = Math.round(fr + S.t0 * FM.FPS), blink = (M.CUT_BLINKS[w.name] ?? []).some((c) => Fb - c >= -3 && Fb - c <= 2);      /* (a blink over a cut (core.ts CUT_BLINKS): its two half-lid frames pass the lid over the pupil as any blink does; listed, not failed) */
        if (blink) (NOTE18[`${S.id} ${w.name}`] ??= []).push(fr);
        else if ((fc.squeeze ?? 0) <= 0.5 && lid <= 0.93) { const sn = Math.sin((f.sk.faceYaw * Math.PI) / 180), as = Math.abs(sn), view = as < 0.45 ? "front" : as < 0.85 ? "q" : "side", es = kit?.eyes ?? 1, ey = -118 + (es - 1) * 30, tx = sn * 34;
          const low = 0.3 * smile * Math.max(0, Math.min(1, (smile - 0.3) / 0.4)), rr = { wide, pupil: fc.pupil ?? 1, gaze: g0 };
          const gq = [Math.min(1, 0.45 + 0.7 * Math.max(0, g0[0])), g0[1]], NOSE = M.qPupils(fc).nose;
          const eyes = view === "q" ? [[10 - (es - 1) * 20, ey, es, M.pupilAt(10 - (es - 1) * 20, ey, es, { ...rr, gaze: gq })], [76, ey, 0.8 * es, M.pupilAt(76, ey, 0.8 * es, { ...rr, gaze: gq }, NOSE)]]
            : view === "side" ? [[66, ey, 0.9 * es, M.pupilAt(66, ey, 0.9 * es, { ...rr, gaze: [Math.max(0.35, g0[0]), g0[1]] })]]
            : [-1, 1].map((sd) => { const cx = sd * 46 * (es > 1 ? 1.05 : 1) + tx; return [cx, ey, es, M.pupilAt(cx, ey, es, rr)]; });
          for (const [cx, cy, sc, q] of eyes) { const rx = 30 * sc, ry = 40 * sc * (1 + 0.15 * wide), xn = Math.max(-1, Math.min(1, (q.x - cx) / (rx + 4))), HW = 4.5;
            const bands = []; if (lid > 0.02) { const y0 = cy - ry + 2 * ry * lid; bands.push(["upper", y0 - ry * 0.12 + 2 * ry * 0.12 * (1 - xn * xn)]); }
            if (low > 0.02) { const y1 = cy + ry - 2 * ry * low; bands.push(["lower", y1 + ry * 0.1 - 0.2 * ry * (1 - xn * xn)]); }
            for (const [nm, ye] of bands) { const top = q.y - q.pr, bot = q.y + q.pr, over = nm === "upper" ? ye + HW - top : bot - (ye - HW);
              if (ye + HW > top && ye - HW < bot && over < 2 * q.pr + 2 * HW) faults.push(`18 ${S.id} frame ${fr} ${w.name}: his ${nm} lid's line across his pupil (${Math.round((100 * Math.min(over, 2 * q.pr)) / (2 * q.pr))} % of its height under the lid)`); } } } }
      // 14 (the face's values this frame, gathered per shot and figure)
      { const fc = f.o.face ?? {}, k14 = `${S.id}:${w.name}`, sm = (fc.smile ?? 0) + (plant === "smileCross" && w.name === "crew" && fr > n / 2 ? -0.6 : 0); (FACE14[k14] ??= []).push([fc.mouth ?? 0, sm, fc.squeeze ?? 0]); }
      if (fr === 0) { const s0 = scr("skull"), c0 = scr("crown"), hr = Math.hypot(c0[0] - s0[0], c0[1] - s0[1]) / 2, hc = [(s0[0] + c0[0]) / 2, (s0[1] + c0[1]) / 2];
        if (hc[0] - hr > 0 && hc[0] + hr < FM.W && hc[1] - hr > 0 && hc[1] + hr < FM.H) (CUT15[S.id] ??= {})[w.name] = pl.z; }
      // 1 the seat: on the chest's top within 1 cm (in the half rise, shot 10, up to 10 cm over it and never under), and his whole seat on it: the
      //   pelvis's floor point and his hips each side (0.21 m along his right, 0.12 m fore and aft) inside the chest's top
      if (w.name === "captain") { const TH = D.props("sir").thigh * scaleOf("sir"), px0 = jointPx(f, "pelvis")[0], under = thighUnder(f).filter(([x]) => Math.abs(x - px0) < 0.33 * TH), low = under.reduce((a, b) => (b[1] > a[1] ? b : a)), h = cardToWorld(w, pl, low)[2];
        const rising = T >= RISE.up0 - 0.05 && T < RISE.down1, dz = h - STOOL_TOP, bad = rising ? dz < -0.01 || dz > 0.15 : Math.abs(dz) > 0.01;      /* (rising: up to 15 cm, the reviewer 25 Nov, his feet on the floor (rule 2)) */
        if (!rising) worst.seat = Math.max(worst.seat, Math.abs(dz)); if (bad) faults.push(`1 ${S.id} frame ${fr}: the captain's seat ${(dz * 100).toFixed(1)} cm ${dz > 0 ? "over" : "into"} the chest${rising ? " (rising: 0-10 cm allowed)" : ""}`);
        const Fc = M.FIGS && JSON.parse(fs.readFileSync("src/craft/dinner3d/shots.json", "utf8")).facing.captain, fl = Math.hypot(Fc[0], Fc[1]), fx = Fc[0] / fl, fy = Fc[1] / fl, [ax, ay] = pl.at;
        for (const [r, fo] of [[0, 0], [0.21, 0], [-0.21, 0], [0, 0.12], [0, -0.12]]) if (!onChest(ax + fy * r + fx * fo, ay - fx * r + fy * fo)) { faults.push(`1 ${S.id} frame ${fr}: the captain's seat off the chest's top (${r ? "his hip" : fo ? "fore/aft" : "his pelvis"})`); break; } }
      // 2 the feet
      for (const ft of feetOf(S.id, fr, w, pl)) for (const [pt, px, nm] of [[ft.heel, ft.heelPx, "heel"], [ft.toe, ft.toePx, "toe"]]) {
        if (pt[2] < -0.005) faults.push(`2 ${S.id} frame ${fr} ${w.name} ${ft.side} ${nm}: ${(-pt[2] * 100).toFixed(1)} cm into the floor`);
        if (pt[2] <= 0.005) { const fl = project(S.id, fr, [pt[0], pt[1], Math.max(0, pt[2])]), dv = px[1] - fl[1]; if (Math.abs(dv) > 3 && px[1] > 0 && px[1] < FM.H) faults.push(`2 ${S.id} frame ${fr} ${w.name} ${ft.side} ${nm}: drawn ${Math.abs(dv).toFixed(1)} px ${dv > 0 ? "into" : "above"} the floor`); } }
      // 3 the pudding: in shot 1, before he lifts it (0.10), it stands on the plate: its base where the lens sees the plate's top, within 0.5 cm;
      //   it is never wider than his hand is long
      if (w.name === "crew" && T < HANDOVER.lift0) { const p = M.pudDrawn(S.id, fr, pl, T), b = toScreen(pl, p.base), q = project(S.id, fr, [PLATE[0], PLATE[1], PLATE_TOP]), cmPx = pl.z / p.mpp / 100, d = Math.hypot(b[0] - q[0], b[1] - q[1]) / cmPx;
        worst.grip = Math.max(worst.grip, d / 100); if (d > 0.5) faults.push(`3 ${S.id} frame ${fr}: the pudding's base ${d.toFixed(1)} cm off the plate's top`); }
      if (w.name === "crew" && fr === 0 && 2 * PUD_R > 1.4 * (D.props("sir").hand * scaleOf("sir")) * (w.h / (FM.PPM * M.heightOf("sir")))) faults.push(`3 ${S.id}: the pudding wider than 1.4 of his hand's length`);      /* (v6c: a bowl carried from under it may be wider than the hand is long; 1.4 of it, about 24 cm, at most) */
      // 4 every hand put on a surface (the table, the plate, the book): the point on it (its top, 0.5 to 4 cm over it, inside its edges) and the
      //   drawn hand there in the picture (its grip within 8 px of where the lens sees that point; the hand short of it by at most 1 cm)
      for (const sd of ["L", "R"]) { const tg = TARGETS[`${S.id}:${fr}:${w.name}:${sd}`]; if (!tg) continue; const [x, y, z] = tg.w;
        const top = tg.on === "table" ? TABLE_TOP : tg.on === "plate" ? PLATE_TOP : BOOK_TOP, inside = tg.on === "table" ? x > TABLE.x0 && x < TABLE.x1 && y > TABLE.y0 && y < TABLE.y1 : tg.on === "plate" ? Math.hypot(x - PLATE[0], y - PLATE[1]) < 0.11 : Math.hypot(x - BOOK[0], y - BOOK[1]) < 0.11;
        const dz = z - top; if (tg.on === "table") worst.table = [Math.min(worst.table[0], dz), Math.max(worst.table[1], dz)];
        if (!inside || dz < 0.005 || dz > 0.04) faults.push(`4 ${S.id} frame ${fr}: the ${w.name}'s ${sd} hand ${(dz * 100).toFixed(1)} cm ${dz < 0 ? "into" : "over"} the ${tg.on}${inside ? "" : " (off its edge)"}`);
        const Wp = jointPx(f, "wr" + sd), Tp = jointPx(f, "tip" + sd), gp = toScreen(pl, [Wp[0] + 0.45 * (Tp[0] - Wp[0]), Wp[1] + 0.45 * (Tp[1] - Wp[1])]), q = project(S.id, fr, tg.w), e = Math.hypot(gp[0] - q[0], gp[1] - q[1]);
        const cmPx = pl.z / ((w.h / (FM.PPM * M.heightOf("sir")))) / 100, ecm = e / cmPx; worst.place = Math.max(worst.place ?? 0, ecm);
        if (ecm > 2) faults.push(`4 ${S.id} frame ${fr}: the ${w.name}'s ${sd} hand drawn ${ecm.toFixed(1)} cm (${e.toFixed(0)} px) from its place on the ${tg.on}`);
        /* (no slide: while his hand rests on the same place, the drawn hand moves under 2 px from frame to frame) */
        const ks = `${S.id}:${w.name}:${sd}`, prevS = SLIDE[ks]; if (prevS && prevS.fr === fr - 1 && Math.hypot(prevS.w[0] - tg.w[0], prevS.w[1] - tg.w[1], prevS.w[2] - tg.w[2]) < 1e-4 && Math.hypot(prevS.g[0] - gp[0], prevS.g[1] - gp[1]) > 2) faults.push(`4 ${S.id} frame ${fr}: the ${w.name}'s ${sd} hand slides ${Math.hypot(prevS.g[0] - gp[0], prevS.g[1] - gp[1]).toFixed(1)} px on the ${tg.on}`);
        SLIDE[ks] = { fr, w: tg.w, g: gp }; }
      // 13 no face feature cut by the picture's edge: the edge never passes through an eye, the nose or the mouth (the reviewer, 25 Nov: a head
      //    cut without its features (the back of the head, hair, hat, an ear) is listed, not failed); a speaker's head wholly in the picture
      { const kit = kitOf(f.o.look), sc0 = scaleOf(f.who), sxy = (q) => toScreen(pl, [f.x + q[0] * sc0, footY(f.who) + q[1] * sc0]), feats0 = BG.faceFeatures(f.sk, kit, f.o.face ?? {}).map((ring) => ring.map(sxy)), shift = plant === "faceEdge" && w.name === "crew" ? -feats0[0].reduce((a, q) => a + q[0] / feats0[0].length, 0) : 0;
        const inF = (p) => p[0] + shift >= 0 && p[0] + shift <= FM.W && p[1] >= 0 && p[1] <= FM.H, feats = feats0;
        const cut = feats.find((ring) => { const n = ring.filter(inF).length; return n > 0 && n < ring.length; });
        if (cut) faults.push(`13 ${S.id} frame ${fr} ${w.name}: the picture's edge cuts through his ${feats.indexOf(cut) === feats.length - 1 ? "mouth" : feats.indexOf(cut) === feats.length - 2 ? "nose" : "eye"}`);
        const s0 = scr("skull"), c0 = scr("crown"), hr = Math.hypot(c0[0] - s0[0], c0[1] - s0[1]) / 2 * (w.name === "captain" ? 1.35 : 1.08), hc = [(s0[0] + c0[0]) / 2, (s0[1] + c0[1]) / 2];
        let inn = 0; const N = 24; for (let k = 0; k < N; k++) for (const rr of [0.35, 0.7, 1]) { const a = (k / N) * 2 * Math.PI, x = hc[0] + rr * hr * Math.cos(a), y = hc[1] + rr * hr * Math.sin(a); if (x >= 0 && x <= FM.W && y >= 0 && y <= FM.H) inn++; }
        const frac = inn / (N * 3); if (frac < 1 && frac > 0) { const k13 = `${S.id} ${w.name}`; NOTES13[k13] = Math.max(NOTES13[k13] ?? 0, frac); if (frac > 0.25 && !(OWN8[S.id] ?? []).includes(w.name) && S.id !== "10b") faults.push(`13 ${S.id} frame ${fr} ${w.name}: ${Math.round(frac * 100)} % of his head at the picture's edge (a neighbour: a quarter or less, or whole)`); }      /* (the reviewer 26 Nov) */
        if (SPEAKS.some((v) => v.who === w.name && T >= v.t0 && T < v.t1) && feats.some((ring) => ring.filter(inF).length < ring.length)) faults.push(`13 ${S.id} frame ${fr} ${w.name}: he speaks with his face not whole in the picture`); }      /* (a speaker's eyes, nose and mouth whole; his hat or the back of his head may be cut, the close-up of 10b) */
      // 5 the edges
      for (const sd of ["L", "R"]) { const wr = scr("wr" + sd), tp = scr("tip" + sd), r = handPx(pl) * 0.45,      /* (half a hand round the line from wrist to fingertips: the open hand is about as wide as half its length) */ xs = [wr[0], tp[0]], ys = [wr[1], tp[1]];
        hands.push([Math.min(...xs) - r, Math.min(...ys) - r, Math.max(...xs) + r, Math.max(...ys) + r]);
        const inside = Math.min(...xs) - r > 40 && Math.max(...xs) + r < FM.W - 40 && Math.min(...ys) - r > 40 && Math.max(...ys) + r < FM.H - 40, gone = Math.max(...xs) + r < 0 || Math.min(...xs) - r > FM.W || Math.max(...ys) + r < 0 || Math.min(...ys) - r > FM.H;
        // (v6: the hands of a figure whose head is in the picture; a neighbour seen only as a sliver at the edge is the shot's framing, listed)
        const s1 = scr("skull"), c1 = scr("crown"), hh = Math.hypot(c1[0] - s1[0], c1[1] - s1[1]) / 2, hcx = (s1[0] + c1[0]) / 2, hcy = (s1[1] + c1[1]) / 2, headIn = hcx - hh > 0 && hcx + hh < FM.W && hcy - hh > 0 && hcy + hh < FM.H;
        const k5 = `${S.id} ${w.name} ${sd}`; (HPOS[k5] ??= []).push([(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2]);
        // (a sliver's hand at the edge passes only if its arm can be followed in the picture to his shoulder: a lone hand at the edge reads as an
        //  extra hand, Eiffel v11; the reviewer, 25 Nov)
        const shp = scr("sh" + sd), shIn = shp[0] > 0 && shp[0] < FM.W && shp[1] > 0 && shp[1] < FM.H;
        if (!inside && !gone) { if (headIn || !shIn || SPEAKS.some((v) => v.who === w.name && T >= v.t0 && T < v.t1)) faults.push(`5 ${S.id} frame ${fr} ${w.name}: his ${sd} hand cut by the picture's edge${!headIn && !shIn ? " (a lone hand: his arm not in the picture)" : ""}`); else NOTES5[k5] = true; } }
    }
    // 9 and 10: the drawn parts of each figure (skeleton units, then the picture)
    { const sil = placed.map(({ w, pl }) => { const f = pl.f, s = scaleOf(f.who), scr = (p) => toScreen(pl, [f.x + p[0] * s, footY(f.who) + p[1] * s]);
        let sk = f.sk; const kinds = { L: f.o.handL ?? "relaxed", R: f.o.handR ?? "relaxed" };
        const ft = project(S.id, fr, [pl.at[0], pl.at[1], 0]), hd = project(S.id, fr, [pl.at[0], pl.at[1], w.h]), tall = (ft[1] - hd[1]) / FM.H;
        if (plant === "frontArm" && w.name === "crew" && Math.abs(sk.sin) <= 0.5) { const fa = sk.far, pv = sk.j.pelvis, j = { ...sk.j }; j["el" + fa] = [pv[0] - 30 * Math.sign(sk.sin || 1), pv[1] - 110]; j["wr" + fa] = [pv[0] - 40 * Math.sign(sk.sin || 1), pv[1] - 40]; j["tip" + fa] = [pv[0] - 30 * Math.sign(sk.sin || 1), pv[1] - 5]; sk = { ...sk, j }; }      /* (frontArm, the planted fault: in a front view his far arm behind his back) */
        if (plant === "oneArm" && w.name === "crew") { const fa = sk.far, sh = sk.j["sh" + fa], j = { ...sk.j }; j["el" + fa] = [sh[0], sh[1] - 74]; j["wr" + fa] = [sh[0] + 4, sh[1] - 142]; j["tip" + fa] = [sh[0] + 6, sh[1] - 202]; sk = { ...sk, j }; }
        const kit = kitOf(f.o.look), B = kitBody(BODY, kit);      // (a wardrobe figure: its own body, coat and hat)
        const parts = { L: BG.armParts(sk, "L", kinds.L, B), R: BG.armParts(sk, "R", kinds.R, B) };
        const all = [BG.torsoPoly(sk, B), ...BG.headPolys(sk, kit), ...parts.L.all, ...parts.R.all, ...BG.legPolys(sk, B, kit)].map((P) => P.map(scr));
        return { w, pl, f, sk, s, scr, kinds, parts, tall, all, kit, B }; });
      for (const g of sil) {
        // (--geom shot:frame writes the parts as the checks see them, in the picture, for an overlay on the rendered frame)
        if (arg("--geom") === `${S.id}:${fr}`) { const G = (P) => P.map((q) => g.scr(q).map((v) => +v.toFixed(1))); geomOut.push({ who: g.w.name, near: g.sk.near, mouth: G(BG.mouthPts(g.sk, g.f.o.face ?? {}, g.kit)),
          handL: g.parts.L.hand.map(G), handR: g.parts.R.hand.map(G), armL: g.parts.L.all.map(G), armR: g.parts.R.all.map(G), occ: BG.occluders(g.sk, g.B, g.sk.far, g.kinds[g.sk.near], g.kit).map(G) }); }
        // 9 the own hand over the mouth while he speaks
        if (SPEAKS.some((v) => v.who === g.w.name && T >= v.t0 && T < v.t1)) { const mp = BG.mouthPts(g.sk, g.f.o.face ?? {}, g.kit);
          for (const sd of ["L", "R"]) { if (Math.abs(g.sk.sin) > 0.5 && sd !== g.sk.near) continue;
            let hp = g.parts[sd].hand; if (plant === "mouthHand" && sd === g.sk.near) { const c = hp.flat().reduce((a, q, _, A) => [a[0] + q[0] / A.length, a[1] + q[1] / A.length], [0, 0]), mc = mp[Math.floor(mp.length / 2)]; hp = hp.map((P) => P.map((q) => [q[0] + mc[0] - c[0], q[1] + mc[1] - c[1]])); }
            const grown = hp.map((P) => BG.grow(P, 4.5)), hit = mp.filter((q) => grown.some((P) => BG.inPoly(q, P))).length;      // (the pudding is checked below)
            if (hit) faults.push(`9 ${S.id} frame ${fr} ${g.w.name}: his ${sd === g.sk.near ? "near" : "far"} hand over his mouth while he speaks (${hit} of ${mp.length} mouth points)`); } }
        // 11 the mouth inside the head
        { const mp = BG.mouthPts(g.sk, g.f.o.face ?? {}, g.kit, plant === "mouthOut" ? [40, 20] : [0, 0]), out = mp.filter((q) => !BG.insideHead(g.sk, q)).length;
          if (out) faults.push(`11 ${S.id} frame ${fr} ${g.w.name}: ${out} of ${mp.length} mouth points outside the head's outline`); }
        // 12 (the face's turn this frame, gathered per shot and figure)
        { if (plant === "turnCross" && g.w.name === "crew") turnShot ??= S.id; const k = `${S.id}:${g.w.name}`, add = plant === "turnCross" && turnShot === S.id && g.w.name === "crew" ? (40 * fr) / n : 0;
          (turns[k] ??= []).push(Math.abs(g.sk.faceYaw) + add); }
        // 9 (the pudding in his ink, in front of everything he draws, counts as a hand: never over his mouth while he speaks)
        if (g.w.name === "crew" && SPEAKS.some((v) => v.who === "crew" && T >= v.t0 && T < v.t1)) { const p = M.pudDrawn(S.id, fr, g.pl, T), mp = BG.mouthPts(g.sk, g.f.o.face ?? {}, g.kit);
          const hit = mp.map((q) => g.scr(q)).filter((q) => { const c = toScreen(g.pl, p.c), rr = (p.r * g.pl.z) + 4.5 * g.s * g.pl.z; return Math.hypot(q[0] - c[0], q[1] - c[1]) < rr; }).length;
          if (hit) faults.push(`9 ${S.id} frame ${fr} crew: the pudding over his mouth while he speaks (${hit} of ${mp.length} mouth points)`); }
        // 10 a one-armed look (in a medium or close shot: its tallest figure 50 % of the picture or more; every figure whose head is in it)
        const shotTall = Math.max(...sil.map((o) => o.tall)), hc = g.scr(BG.headPt(g.sk, [0, -128]));
        if (shotTall >= 0.3 && hc[0] > 0 && hc[0] < FM.W && hc[1] > 0 && hc[1] < FM.H) { const share = {};
          for (const sd of ["L", "R"]) { const own = BG.occluders(g.sk, g.B, sd, g.kinds[g.sk.near], g.kit), seenOf = (polys) => { const pts = BG.fillPts(polys, 5); let inside = 0, seen = 0;
              for (const q of pts) { const p = g.scr(q); if (p[0] < 0 || p[0] > FM.W || p[1] < 0 || p[1] > FM.H) continue; inside++;
                if (own.some((P) => BG.inPoly(q, P))) continue; if (sil.some((o) => o !== g && o.pl.depth < g.pl.depth && o.all.some((P) => BG.inPoly(p, P)))) continue; seen++; }
              return { n: pts.length, inside, seen }; };
            share[sd] = { arm: seenOf(g.parts[sd].all), hand: seenOf(g.parts[sd].hand), sleeve: seenOf(g.parts[sd].sleeve) };
            /* (v6c: a coat's sleeve lying over the coat is the coat's own red with no edge to read: the captain's far arm down his side in 2 and 15b
               read as a hand out of the coat, the independent review of v6. For a coat, the sleeve counts as seen only off the torso) */
            /* (the reviewer, 26 Nov: a near arm before the body has its whole own ink outline from shoulder to hand and reads; only a far arm drawn behind
               the body (|sin| over 0.15, ARM_WIPE), its sleeve shown over the body clipped by the sweep with no outline of its own, is the coat's colour
               with no edge. Planted: sleeveNoInk takes the near arm as having no outline either, and must fail) */
            if ((g.kit?.top === "coat" || g.kit?.top === "shirt") && ((sd === g.sk.far && Math.abs(g.sk.sin) > 0.15) || plant === "sleeveNoInk")) { const tp = BG.torsoPoly(g.sk, g.B), pts = BG.fillPts(g.parts[sd].sleeve, 5); let off = 0;
              for (const q of pts) { const p = g.scr(q); if (p[0] < 0 || p[0] > FM.W || p[1] < 0 || p[1] > FM.H) continue; if (own.some((P) => BG.inPoly(q, P)) || BG.inPoly(q, tp)) continue;
                if (sil.some((o) => o !== g && o.pl.depth < g.pl.depth && o.all.some((P) => BG.inPoly(p, P)))) continue; off++; }
              share[sd].sleeve = { ...share[sd].sleeve, seen: Math.min(share[sd].sleeve.seen, off) }; } }
          for (const sd of ["L", "R"]) { const a = share[sd].arm, h = share[sd].hand, k = `${S.id}:${g.w.name}:${sd === g.sk.near ? "near" : "far"}`;
            if (a.inside < 0.3 * a.n) continue;      // (an arm mostly out of the picture is framing, not a missing arm)
            const fa = a.seen / a.n, fh = h.seen / h.n, st = (armStat[k] ??= { arm: 9, hand: 9 }); st.arm = Math.min(st.arm, fa); st.hand = Math.min(st.hand, fh);
            // (an arm reads as there when 15 % of its drawn area shows, or a quarter of its hand: shot 7's far hand on the table, behind the near one)
            /* (v6c, the independent review of v6: a hand seen with no sleeve to it (the captain's hand out of his coat at the hip in 2 and 15b, his
               fingers behind the waistcoat in 1 and 11) and the boy one-armed in the 3/4 shots both passed, as a quarter of a hand counted as the
               arm. Now the arm is seen only by its sleeve: 25 % of it at least, and a hand seen (10 %) with less sleeve than that fails) */
            const fsl = share[sd].sleeve.seen / share[sd].sleeve.n;
            if (process.env.DEBUG10 === `${S.id}:${fr}`) console.log(`DEBUG10 ${g.w.name} ${sd === g.sk.near ? "near" : "far"} sin ${g.sk.sin.toFixed(2)} sleeve ${fsl.toFixed(2)} hand ${fh.toFixed(2)} arm ${fa.toFixed(2)} inside ${a.inside}/${a.n} tall ${shotTall.toFixed(2)}`);
            if (fsl < 0.25 && fh >= 0.1 && !HIDDEN_BY[k]) faults.push(`10 ${S.id} frame ${fr} ${g.w.name}: his ${sd === g.sk.near ? "near" : "far"} hand seen (${(fh * 100).toFixed(0)} %) without its arm (${(fsl * 100).toFixed(0)} % of the sleeve)`);
            else if ((fsl < 0.25 || (fh < 0.1 && fsl < 0.5)) && !HIDDEN_BY[k]) faults.push(`10 ${S.id} frame ${fr} ${g.w.name}: his ${sd === g.sk.near ? "near" : "far"} arm hidden, ${(fsl * 100).toFixed(0)} % of its sleeve and ${(fh * 100).toFixed(0)} % of its hand seen (one-armed look)`);
            if (false && fa < 0.15 && fh < 0.25 && !HIDDEN_BY[k]) faults.push(`10 ${S.id} frame ${fr} ${g.w.name}: his ${sd === g.sk.near ? "near" : "far"} arm hidden, ${(fa * 100).toFixed(0)} % of it and ${(fh * 100).toFixed(0)} % of its hand seen (one-armed look)`); } } }
    // 16 the arm moves like a human arm (Jesper on v6, 27 Nov: "Handrörelserna på han som äter kaptenens pudding ser konstiga och onormala ut";
    //    DAILY-RULES "Human bodies move like humans": elbows bend one way, 0-150 degrees). In every shot where the figure is 30 % of the picture
    //    or more, for each arm whose sleeve shows (the elbow, the sleeve and the hand as the rig draws them, under what the figure itself and a
    //    nearer figure draw over them, the far arm's sweep (ARM_WIPE) followed as kit.ts draws it):
    //    a) the elbow bends at most 150 degrees: the drawn angle at the elbow between upper arm and forearm at least 30 degrees
    //    b) an arm brought across the body shows its elbow: when any seen point of the forearm or hand lies past the torso's midline (neck to
    //       pelvis) on the side away from its own shoulder, the elbow (a disc of the sleeve's width there) is at least half seen and the arm is
    //       bent there (the angle at most 160 degrees). v6 shot 4: the far forearm came up across the chest to the mouth with its elbow behind
    //       the body, the arm starting mid-chest; 11-13 s: the arm stretched straight across the belly, a rubber hose
    //    c) the upper arm's turn in toward the body's middle (from the torso's down line, in the picture) at most 30 degrees, or raised past 150
    //       (a hand up over the head): the flat rig draws every arm at its full length, so an upper arm held in across the chest is never seen
    //       shortened toward the lens and reads as a hose (v6 shots 3, 4, 7, 8: 42 to 139 degrees in); the elbow hangs down or out
    // 17 no stripes crossing on a striped sleeve (the review of v6, point 4: the stripes net on the folded arm, frames 141-191 and 405). kit.ts
    //    draws each segment's stripes (across it, 24 apart, 120 long) through every piece of the sleeve; where the upper arm's and the forearm's
    //    stripes meet at more than 20 degrees inside the drawn sleeve, at a point a viewer sees, they cross. None may (zero tolerance)
    for (const g of sil) {
      if (g.tall < 0.3) continue; const sk = g.sk, Jn = (n) => sk.j[n], as = Math.abs(sk.sin), torso = BG.torsoPoly(sk, g.B), heads = BG.headPolys(sk, g.kit), legs = BG.legPolys(sk, g.B, g.kit);
      const wipe = g.f.o.armWipe !== false && !(as <= 0.15 || as >= 0.8), u = (0.8 - as) / 0.65;      /* (the far arm's sweep as kit.ts/flat.ts draw it; with armWipe false the layers' order: under the body past |sin| 0.5, over it before) */
      const sweepShown = (() => { if (!wipe) return () => (g.f.o.armWipe === false ? as <= 0.5 : as <= 0.15); const far = sk.far, near = sk.near, m = sk.P.hand + 20;
        const xs = [...torso.map((p) => p[0]), ...["sh", "el", "wr", "tip", "kn", "an", "hip"].flatMap((n) => [Jn(n + far)[0], Jn(n + near)[0]])], x0 = Math.min(...xs) - m, x1 = Math.max(...xs) + m;
        const ax = ["sh", "el", "wr", "tip"].map((n) => Jn(n + far)[0]), aw = g.B.arm[0], a0 = Math.min(...ax) - aw, a1 = Math.max(...ax) + aw;
        const side = Math.sign(Jn("sh" + far)[0] - Jn("sh" + near)[0]) || 1, xFar = side > 0 ? x1 : x0, xNear = side > 0 ? x0 : x1, aOut = side > 0 ? a1 : a0, aIn = side > 0 ? a0 : a1;
        const line = u < 0.1 ? xFar + (aOut - xFar) * (u / 0.1) : u < 0.9 ? aOut + (aIn - aOut) * ((u - 0.1) / 0.8) : aIn + (xNear - aIn) * ((u - 0.9) / 0.1);
        return (q) => (side > 0 ? q[0] > line : q[0] < line); })();
      // (a point of arm sd, in skeleton units: seen when in the picture, not under what the figure draws over that arm, not under a nearer figure)
      const seen = (sd, q) => { const p = g.scr(q); if (p[0] < 0 || p[0] > FM.W || p[1] < 0 || p[1] > FM.H) return false;
        if (sd === sk.far && g.parts[sk.near].all.some((P) => BG.inPoly(q, P))) return false;
        if (sd === sk.far && !sweepShown(q) && [torso, ...heads, ...legs].some((P) => BG.inPoly(q, P))) return false;
        return !sil.some((o) => o !== g && o.pl.depth < g.pl.depth && o.all.some((P) => BG.inPoly(p, P))); };
      const neck = Jn("neck"), pel = Jn("pelvis"), dn = [pel[0] - neck[0], pel[1] - neck[1]], dl = Math.hypot(dn[0], dn[1]) || 1, sideOf = (q) => ((q[0] - neck[0]) * dn[1] - (q[1] - neck[1]) * dn[0]) / dl;
      for (const sd of ["L", "R"]) {
        const Sh = Jn("sh" + sd), El = Jn("el" + sd), Wr = Jn("wr" + sd), Tp = Jn("tip" + sd), sl = BG.fillPts(g.parts[sd].sleeve, 6), slSeen = sl.filter((q) => seen(sd, q)).length / (sl.length || 1);
        if (slSeen < 0.1) continue;      // (an arm not seen has no angle to judge; rule 10 judges a hidden arm)
        const a1 = [Sh[0] - El[0], Sh[1] - El[1]], a2 = [Wr[0] - El[0], Wr[1] - El[1]], ang = (Math.acos(Math.max(-1, Math.min(1, (a1[0] * a2[0] + a1[1] * a2[1]) / ((Math.hypot(...a1) || 1) * (Math.hypot(...a2) || 1))))) * 180) / Math.PI;
        const r = g.B.arm[1] * 0.9, disc = []; for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) { const x = -r + (2 * r * i) / 6, y = -r + (2 * r * j) / 6; if (x * x + y * y <= r * r) disc.push([El[0] + x, El[1] + y]); }
        const elSeen = disc.filter((q) => seen(sd, q)).length / disc.length, sS = Math.sign(sideOf(Sh)) || 1;
        const fore = []; for (let i = 0; i <= 20; i++) { const t = i / 20; fore.push([El[0] + (Wr[0] - El[0]) * t, El[1] + (Wr[1] - El[1]) * t]); } for (let i = 1; i <= 6; i++) { const t = i / 6; fore.push([Wr[0] + (Tp[0] - Wr[0]) * t, Wr[1] + (Tp[1] - Wr[1]) * t]); }
        const across = fore.filter((q) => sideOf(q) * sS < -12 && seen(sd, q)).length;
        const ua = [El[0] - Sh[0], El[1] - Sh[1]], inward = (Math.atan2(-(ua[0] * dn[1] - ua[1] * dn[0]) * sS, ua[0] * dn[0] + ua[1] * dn[1]) * 180) / Math.PI;      /* (degrees from the down line, + toward the body's middle) */
        const who = `${S.id} frame ${fr} ${g.w.name}: his ${sd === sk.near ? "near" : "far"} arm`;
        if (process.env.DEBUG16 && (process.env.DEBUG16 === "all" || process.env.DEBUG16 === `${S.id}:${g.w.name}`)) console.log(`DEBUG16 ${who} (${sd}) sin ${sk.sin.toFixed(2)} elbow ${ang.toFixed(0)} deg, elbow seen ${(elSeen * 100).toFixed(0)} %, sleeve seen ${(slSeen * 100).toFixed(0)} %, across ${across}, upper arm in ${inward.toFixed(0)} deg, elbow at ${g.scr(El).map((v) => Math.round(v)).join(",")}`);
        if (ang < 30) faults.push(`16 ${who} bent ${(180 - ang).toFixed(0)} degrees at the elbow (at most 150)`);
        if (across && (elSeen < 0.5 || ang > 160)) faults.push(`16 ${who} across the body (${across} seen points past the midline) ${elSeen < 0.5 ? `with its elbow hidden (${(elSeen * 100).toFixed(0)} % seen)` : `straight (${ang.toFixed(0)} degrees at the elbow)`}`);
        if (inward > 30 && inward < 150) faults.push(`16 ${who}: the upper arm turned ${inward.toFixed(0)} degrees in across the body (at most 30 from the down line, or raised over 150)`);
        // 17 the stripes
        if (g.kit?.top === "stripes" || plant === "stripeAll") { const fam = (a, b, pre = 0, post = 0, sh = 0) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, d = [(b[0] - a[0]) / L, (b[1] - a[1]) / L], n = [-d[1], d[0]], out = []; for (let k = 10 + sh - pre; k < L + 10 + post; k += 24) { const c = [a[0] + d[0] * k, a[1] + d[1] * k]; out.push([[c[0] - n[0] * 60, c[1] - n[1] * 60], [c[0] + n[0] * 60, c[1] + n[1] * 60]]); } return { d, out }; };
          const ARM_EXT = (180 - ang) >= 20 ? 48 : 0;      /* (kit.ts: each family two stripes on past the elbow from 20 degrees of bend, filling the outer corner) */
          const LA = Math.hypot(El[0] - Sh[0], El[1] - Sh[1]), dl = ((((LA - 20) % 24) + 24) % 24), PH = (dl > 12 ? dl - 24 : dl) * Math.max(0, Math.min(1, (180 - ang - 10) / 20));      /* (kit.ts: the forearm's stripes in step with the upper arm's as the elbow bends) */
          const A = fam(Sh, El, 0, ARM_EXT), Bf = fam(El, Wr, ARM_EXT, 0, PH), cr = Math.abs(A.d[0] * Bf.d[1] - A.d[1] * Bf.d[0]), sleeve = g.parts[sd].sleeve.slice(1);      /* (the sleeve's two pieces; the cuff under them has no stripes) */
          const uS = [(Sh[0] - El[0]) / (Math.hypot(Sh[0] - El[0], Sh[1] - El[1]) || 1), (Sh[1] - El[1]) / (Math.hypot(Sh[0] - El[0], Sh[1] - El[1]) || 1)], uW = [(Wr[0] - El[0]) / (Math.hypot(Wr[0] - El[0], Wr[1] - El[1]) || 1), (Wr[1] - El[1]) / (Math.hypot(Wr[0] - El[0], Wr[1] - El[1]) || 1)];
          const bendS = (Math.acos(Math.max(-1, Math.min(1, -(uS[0] * uW[0] + uS[1] * uW[1])))) * 180) / Math.PI, nb0 = [uS[0] - uW[0], uS[1] - uW[1]], nl = Math.hypot(nb0[0], nb0[1]), nb = nl > 1e-6 ? [nb0[0] / nl, nb0[1] / nl] : uS, offA = 17 * Math.max(0, 1 - bendS / 20);
          if (Math.asin(Math.min(1, cr)) * 180 / Math.PI > 20) { let x = 0;
            for (const [p1, p2] of A.out) for (const [q1, q2] of Bf.out) { const r0 = [p2[0] - p1[0], p2[1] - p1[1]], s0 = [q2[0] - q1[0], q2[1] - q1[1]], den = r0[0] * s0[1] - r0[1] * s0[0]; if (Math.abs(den) < 1e-9) continue;
              const t = ((q1[0] - p1[0]) * s0[1] - (q1[1] - p1[1]) * s0[0]) / den, v = ((q1[0] - p1[0]) * r0[1] - (q1[1] - p1[1]) * r0[0]) / den; if (t < 0 || t > 1 || v < 0 || v > 1) continue;
              const q = [p1[0] + r0[0] * t, p1[1] + r0[1] * t], fq = (q[0] - El[0]) * nb[0] + (q[1] - El[1]) * nb[1];
              if (plant !== "stripeNet" && !(fq > -offA && fq < 0)) continue;      /* (kit.ts since v6c: each family on its own side of the elbow's bisector, the upper arm's 18 past it when straight; stripeNet, the planted fault, draws them as v6 did, through both pieces) */
              if (sleeve.some((P) => BG.inPoly(q, P)) && seen(sd, q)) x++; }
            if (x) faults.push(`17 ${who}'s stripes cross ${x} times (the upper arm's and the forearm's stripes at ${(Math.asin(Math.min(1, cr)) * 180 / Math.PI).toFixed(0)} degrees inside the sleeve)`); } } } }
    }
    // 8 no face covered: a farther figure's face (the head's circle below its cap, 0.8 of its radius) is not under a nearer figure's body (the
    //  hull of its joints and the head's circle) in any frame
    { const geo = placed.map(({ w, pl }) => { const J = (j) => toScreen(pl, jointPx(pl.f, j)), s0 = J("skull"), c0 = J("crown"), hr = Math.hypot(c0[0] - s0[0], c0[1] - s0[1]) / 2;
        const body = hull(["neck", "shL", "shR", "elL", "elR", "wrL", "wrR", "tipL", "tipR", "hipL", "hipR", "knL", "knR", "anL", "anR"].map(J));
        return { name: w.name, depth: pl.depth, hc: [(s0[0] + c0[0]) / 2, (s0[1] + c0[1]) / 2], r: hr * 1.1, body }; });
      const inPoly = (pt, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) if ((P[i][1] > pt[1]) !== (P[j][1] > pt[1]) && pt[0] < ((P[j][0] - P[i][0]) * (pt[1] - P[i][1])) / (P[j][1] - P[i][1]) + P[i][0]) c = !c; return c; };
      for (const far of geo) for (const near of geo) { if (near === far || near.depth >= far.depth) continue;
        const own8 = (OWN8[S.id] ?? []).includes(far.name), dx8 = !own8 && far.name === "boy" ? (plant === "headPeek" ? 1.3 : plant === "hide40" ? 0.75 : 0) * far.r : 0;      /* (the planted faults: the boy's head moved aside, a part of it out from behind (headPeek) or 40 % hidden (hide40)) */
        const pts = []; for (let k = 0; k < 24; k++) { const a = (k / 24) * Math.PI * 2; for (const rr of [0, 0.35, 0.7, 0.95]) pts.push([far.hc[0] + dx8 + Math.cos(a) * rr * far.r * 1.12, far.hc[1] + Math.sin(a) * rr * far.r]); }      /* (v6c: the whole head with its ears, cheeks and temples (the independent review of v6: the sailor's head over the captain's cheek and ear in 9, over the boy's temple in 12, missed by the face's inner ellipse)) */      /* (the face, every figure: rule 8) */
        const inF = pts.filter((q) => q[0] >= 0 && q[0] <= FM.W && q[1] >= 0 && q[1] <= FM.H), hit = inF.filter((q) => inPoly(q, near.body) || Math.hypot(q[0] - near.hc[0], q[1] - near.hc[1]) < near.r).length;
        if (own8) { if (hit > 0) faults.push(`8 ${S.id} frame ${fr}: the ${far.name}'s face is under the ${near.name} (${hit} of ${pts.length} points)`); }
        else if (inF.length && hit > 0) faults.push(`8 ${S.id} frame ${fr}: the ${far.name}'s head ${Math.round((hit / inF.length) * 100)} % behind the ${near.name}`);      /* (rule 8 in full: no face, nor head, hidden at all, the reviewer 26 Nov) */
        else if (false) { const fr8 = hit / inF.length, st = fr8 <= 0.1 ? "seen" : fr8 >= 0.98 ? "hidden" : "part";      /* (a background figure: his whole head with its hair and ears seen (10 % or less hidden) or none of it (98 % or more), one state through the shot: the reviewer, 26 Nov) */
          if (st === "part") faults.push(`8 ${S.id} frame ${fr}: the ${far.name}'s head ${Math.round(fr8 * 100)} % behind the ${near.name} (neither clearly seen nor wholly hidden)`); else { (STATE8[`${S.id} ${far.name}`] ??= new Set()).add(st); if (st === "hidden") NOTE8[`${S.id} ${far.name}`] = true; } } } }
    // 7 nobody missing: a figure of the room that is not drawn in a shot must be wholly out of its picture (his head and feet projected)
    if (fr === 0) for (const nm of ["captain", "crew", "boy"]) { if (whos.some((w) => w.name === nm)) continue; const at = M.POS(nm, S.id), hh = nm === "boy" ? 1.5 : 1.75;
      for (const [dx, z] of [[0, 0], [0, hh * 0.5], [0, hh], [-0.35, hh * 0.6], [0.35, hh * 0.6], [-0.3, 0.3], [0.3, 0.3]]) { const q = project(S.id, 0, [at[0] + dx, at[1], z]); if (q[2] > 0 && q[0] > -20 && q[0] < FM.W + 20 && q[1] > -20 && q[1] < FM.H + 20) { faults.push(`7 ${S.id}: the ${nm} stands in the picture but is not drawn`); break; } } }
    // 6 the words
    const c = captionAt(T); if (c) { const b = [...c.box]; if (plant === "capLow") { b[1] += 300; b[3] += 300; }
      if (b[1] < 0.15 * FM.H || b[3] > 0.85 * FM.H) faults.push(`6 ${S.id} frame ${fr}: "${c.text}" outside 15-85 % (${Math.round(b[1])}-${Math.round(b[3])})`);
      for (const h of HEADS6) { const cx = Math.max(b[0], Math.min(h[0], b[2])), cy = Math.max(b[1], Math.min(h[1], b[3])); if (Math.hypot(cx - h[0], cy - h[1]) < h[2]) {      /* (v6c, the review of v6 and the cloud session: never over any part of a head, its cap, bandana, hair or hat included: the old test let the words lie over the head's top 0.55, "IT WAS / HIS OWN / CREW" on the sailor's bandana in shot 4) */ faults.push(`6 ${S.id} frame ${fr}: "${c.text}" over a head`); break; } }
      for (const hb of hands) if (hb[0] < b[2] && hb[2] > b[0] && hb[1] < b[3] && hb[3] > b[1] && hb[2] > 0 && hb[0] < FM.W) { faults.push(`6 ${S.id} frame ${fr}: "${c.text}" over a hand`); break; }
      if (fr % 3 === 0) { let arm = false, body = false; for (const p of placed) M.bodyCaps(p.pl).forEach((cp, i) => { if (M.boxHitsCap(b, cp)) { if (i < M.ARM_CAPS) arm = true; else body = true; } });
        if (arm) faults.push(`6 ${S.id} frame ${fr}: "${c.text}" over an arm or a hand`); else if (body && !M.CAP_ON_BODY[S.id]) faults.push(`6 ${S.id} frame ${fr}: "${c.text}" over a body`); else if (body) NOTE6[S.id] = true; } }      /* (never over an arm or a hand; over a still torso only where the shot had no free place, the reviewer 25 Nov) */      /* (the reviewer 25 Nov: never over a body or an arm) */
    const cf = M.camFx(T), cfx = (x, y) => [(x - FM.W / 2) * cf.s + FM.W / 2 + cf.dx, (y - FM.H / 2) * cf.s + FM.H / 2 + cf.dy];      // (the digital push and shake on the picture: the eyes move with it, the words do not)
    regions.push({ F: F0 + fr, shot: S.id, eyes: placed.map((p) => { const J = (j) => toScreen(p.pl, jointPx(p.pl.f, j)), a = J("skull"), b = J("crown"), r = Math.hypot(b[0] - a[0], b[1] - a[1]) / 2, yaw = (p.pl.f.sk.faceYaw * Math.PI) / 180;
      const [ex, ey] = cfx((a[0] + b[0]) / 2 + 0.5 * r * Math.sin(yaw), (a[1] + b[1]) / 2 + 0.05 * r); return [Math.round(ex), Math.round(ey), Math.round(0.5 * r * cf.s)]; }), text: c ? [[Math.round(c.box[0] - 10), Math.round(c.box[1] - 6), Math.round(c.box[2] + 10), Math.round(c.box[3] + 6)]] : [] , beard: placed.filter((p) => kitOf(p.pl.f.o.look)?.beard === "full").map((p) => { const f = p.pl.f, sc = scaleOf(f.who), sxy = (q) => cfx(...toScreen(p.pl, [f.x + q[0] * sc, footY(f.who) + q[1] * sc]));
      const J = (j) => cfx(...toScreen(p.pl, jointPx(f, j))), a = J("skull"), b = J("crown"), hr = Math.hypot(b[0] - a[0], b[1] - a[1]) / 2, mo = BG.mouthPts(f.sk, f.o.face ?? {}, kitOf(f.o.look)).map(sxy);
      const ex = placed.flatMap((q) => (q === p ? M.bodyCaps(q.pl).slice(0, M.ARM_CAPS) : M.bodyCaps(q.pl)).map((cp) => {      /* (his own arms and hands only, others' whole bodies: his own torso lies under the whole beard and took it all out of the measure) */ const u = cfx(cp[0], cp[1]), v = cfx(cp[2], cp[3]); return [u[0], u[1], v[0], v[1], cp[4] * 1.15 + 4]; }));      /* (every arm, hand and body over the beard, a little widened: only the beard itself is measured; widened much, the old holes beside the arm went unseen) */
      return { poly: M.beardOutline(f.sk).map(sxy).map((q) => q.map(Math.round)), ex: ex.map((e) => e.map(Math.round)), mouth: [Math.min(...mo.map((q) => q[0])) - 12, Math.min(...mo.map((q) => q[1])) - 12, Math.max(...mo.map((q) => q[0])) + 12, Math.max(...mo.map((q) => q[1])) + 12].map(Math.round) }; }) });
    dump[S.id].push(row); }
  for (const [k, v] of Object.entries(FACE14)) if (k.startsWith(S.id + ":")) { const who = k.split(":")[1];
    for (const [i, th, nm] of [[0, 0.2, "mouth"], [1, 0.3, "smile"], [2, 0.5, "squeeze"]]) { const lo = Math.min(...v.map((q) => q[i])), hi = Math.max(...v.map((q) => q[i])); if (lo < th - 1e-6 && hi > th + 1e-6) faults.push(`14 ${S.id} ${who}: his ${nm} crosses ${th} inside the shot (${lo.toFixed(2)}-${hi.toFixed(2)})`); } }
  for (const [k, v] of Object.entries(turns)) if (k.startsWith(S.id + ":")) { const lo = Math.min(...v), hi = Math.max(...v);
    for (const [a, b] of [[15, 28], [50, 60]]) if (lo < b && hi > a && (lo < a || hi > b || hi - lo > 0.5)) faults.push(`12 ${S.id} ${k.split(":")[1]}: the face turns ${lo.toFixed(1)}-${hi.toFixed(1)} degrees, into ${a}-${b}, where the head's drawing changes`); }
  F0 += n; }
if (!plant) {
  const R = "out/din3d/root"; fs.mkdirSync(path.join(R, "out/cab3d"), { recursive: true }); fs.mkdirSync(path.join(R, "src/craft/cabin3d/cam"), { recursive: true });
  fs.writeFileSync(path.join(R, "out/cab3d/figs.json"), JSON.stringify(dump));
  const spec = JSON.parse(fs.readFileSync("src/craft/dinner3d/shots.json", "utf8")); spec.figs = fig0;
  spec.shots = spec.shots.map((s) => ({ ...s, cam: { ...s.cam, focus: s.id + ":" + s.cam.focus } }));
  fs.writeFileSync(path.join(R, "src/craft/cabin3d/shots.json"), JSON.stringify(spec, null, 1));
  const CAMS = JSON.parse(fs.readFileSync("src/craft/dinner3d/cams.json", "utf8"));
  for (const s of spec.shots) { const n = Math.round((s.t1 - s.t0) * 30), fr = CAMS[s.id]; fs.writeFileSync(path.join(R, `src/craft/cabin3d/cam/${s.id}.json`), JSON.stringify({ id: s.id, frames: Array.from({ length: n }, (_, k) => fr[Math.min(k, fr.length - 1)]) }));
    const mp = `out/din3d/${s.id}/map.npz`; if (fs.existsSync(mp)) { fs.mkdirSync(path.join(R, "out/cab3d", s.id), { recursive: true }); fs.copyFileSync(mp, path.join(R, "out/cab3d", s.id, "map.npz")); } }
  fs.writeFileSync("out/din3d/regions.jsonl", regions.map((r) => JSON.stringify(r)).join("\n") + "\n");
}
if (arg("--geom")) fs.writeFileSync("out/din3d/geom.json", JSON.stringify(geomOut));
{ const CAMS = JSON.parse(fs.readFileSync("src/craft/dinner3d/cams.json", "utf8")), dirOf = (id) => { const P = CAMS[id][0][2], l = Math.hypot(P[0], P[1], P[2]); return [P[0] / l, P[1] / l, P[2] / l]; };
  // (and the loop's seam, the last shot to the first: a cut like the others (the cloud session, 25 Nov); the same camera there was a jump cut)
  for (let i = 1; i <= SHOTS.length; i++) { const a = SHOTS[i - 1].id, b = SHOTS[i % SHOTS.length].id, both = Object.keys(CUT15[a] ?? {}).filter((nm) => (CUT15[b] ?? {})[nm]); if (!both.length) continue;
    const da = dirOf(a), db = dirOf(b), ang = (Math.acos(Math.min(1, da[0] * db[0] + da[1] * db[1] + da[2] * db[2])) * 180) / Math.PI, sz = Math.min(...both.map((nm) => Math.max(CUT15[a][nm], CUT15[b][nm]) / Math.min(CUT15[a][nm], CUT15[b][nm])));
    CUTS.push(`${a}->${b} ${both.join(",")}: ${ang.toFixed(0)} deg, ${sz.toFixed(2)}x`); if (ang < 30 || sz < 1.3) faults.push(`15 cut ${a}->${b} (${both.join(", ")}): ${ang.toFixed(0)} degrees, ${sz.toFixed(2)}x`); } }
console.log("15 cuts: " + CUTS.join("; "));
for (const [k, set] of Object.entries(STATE8)) if (set.size > 1) faults.push(`8 ${k}: seen and hidden in one shot (it must keep one state)`);
console.log("8 (note) background heads wholly behind a nearer figure: " + (Object.keys(NOTE8).join(", ") || "none"));
console.log("6 (note) words over a body where the shot had no free place (faces and hands kept clear): " + (Object.keys(NOTE6).join(", ") || "none"));
const seen = new Set(), shown = [];
for (const f of faults) { const k = f.replace(/frame \d+/, "").replace(/-?[\d.]+ (px|cm)/g, "").replace(/\(\d+-\d+\)/, ""); if (!seen.has(k)) { seen.add(k); shown.push(f); } }
for (const f of shown.slice(0, 40)) console.log("  " + f);
if (process.env.ALL_FAULTS) fs.writeFileSync(process.env.ALL_FAULTS, faults.join(String.fromCharCode(10)) + String.fromCharCode(10));      // (every fault, one per line, for the planted-fault lists)
const by = {}; for (const f of faults) { const k = f.split(" ").slice(0, 2).join(" "); by[k] = (by[k] ?? 0) + 1; } console.log(JSON.stringify(by));
console.log("arms seen (far arms only, least share of the arm/of its hand, medium and close shots): " + Object.entries(armStat).filter(([k]) => k.endsWith("far")).map(([k, v]) => `${k} ${(v.arm * 100).toFixed(0)}/${(v.hand * 100).toFixed(0)}%`).join(", "));
// (a sliver's hand at the edge passes only if it holds still in the shot: one ending at the edge mid-movement fails, the reviewer)
for (const k of Object.keys(NOTES5)) { const P = HPOS[k] ?? [], xs = P.map((q) => q[0]), ys = P.map((q) => q[1]); if (P.length && (Math.max(...xs) - Math.min(...xs) > 15 || Math.max(...ys) - Math.min(...ys) > 15)) { faults.push(`5 ${k}: a sliver's hand moving at the picture's edge`); delete NOTES5[k]; } }
console.log("5 (note) hands at the edge of a figure seen only as a sliver: " + (Object.keys(NOTES5).join(", ") || "none"));
console.log("18 (note) blink frames over a cut, not judged: " + (Object.entries(NOTE18).map(([k, v]) => `${k} ${v.join(",")}`).join("; ") || "none"));
console.log("13 (note) heads cut by the edge, the most of each in the picture: " + (Object.entries(NOTES13).map(([k, v]) => `${k} ${(v * 100).toFixed(0)}%`).join(", ") || "none"));
console.log(`worst: seat ${(worst.seat * 100).toFixed(2)} cm from the chest, the pudding's base ${(worst.grip * 100).toFixed(2)} cm off the plate, hands on the table ${(worst.table[0] * 100).toFixed(1)} to ${(worst.table[1] * 100).toFixed(1)} cm over its top, a hand at most ${(worst.place ?? 0).toFixed(1)} cm from its place`);
console.log(`DINNER CHECK ${plant ? "(planted: " + plant + ") " : ""}${faults.length ? "FAILED: " + faults.length + " faults" : "OK"} (${frames} frames)`);
// (a planted run counts only the faults of its rule that the clean run (its list kept in out/din3d/faults-clean.json) does not have: v5 fails
//  rules 9 and 10 by itself, and a plant must show it is caught on its own)
const CLEAN = "out/din3d/faults-clean.json";
if (!plant) { fs.mkdirSync("out/din3d", { recursive: true }); fs.writeFileSync(CLEAN, JSON.stringify(faults)); }
if (plant) { const r = RULE_OF[plant], base = new Set(fs.existsSync(CLEAN) ? JSON.parse(fs.readFileSync(CLEAN, "utf8")) : []), hit = faults.filter((f) => f.startsWith(r + " ") && !base.has(f)).length; console.log(`PLANTED ${plant}: rule ${r} ${hit ? "FIRED (" + hit + " new faults)" : "DID NOT FIRE"}`); for (const f of faults.filter((f) => f.startsWith(r + " ") && !base.has(f)).slice(0, 3)) console.log("    " + f); process.exit(hit ? 1 : 0); }
process.exit(faults.length ? 1 : 0);

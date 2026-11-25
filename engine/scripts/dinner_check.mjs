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
// Planted faults (each must fail, and on its own rule: the run exits 1 only when that rule fired): --plant seatHigh (the seat 5 cm over the
// stool, rule 1), pudOff (the grip 3 cm off the pudding, 3), handIn (the hands 4 cm into the table top, 4), float (a figure 12 px over the
// floor, 2), capLow (the words in the bottom 15 %, 6), missing (the boy left out of the first shot that sees him, 7), faceHide (the boy put
// 0.5 m behind the crewman as shot 3d's lens sees them, 8), mouthHand (each speaker's near hand moved onto his mouth, 9), oneArm (the
// crewman's far arm raised up behind his head, as v5's 8c, in every medium and close shot, 10).
//   node scripts/dinner_check.mjs [--plant seatHigh|pudOff|handIn|float|capLow|missing|faceHide|mouthHand|oneArm]
import * as esbuild from "esbuild"; import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const arg = (k) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : null), plant = arg("--plant");
const out = "out/_din_check.mjs";
// (flat.ts keeps its design's body sizes (A_SPEC) to itself: the bundle alone exports them to this check, the file is not changed)
const exportSpec = { name: "spec", setup(b) { b.onLoad({ filter: /designs[\\/]flat\.ts$/ }, (a) => ({ contents: fs.readFileSync(a.path, "utf8") + "\nexport { A_SPEC };\n", loader: "ts" })); } };
await esbuild.build({ plugins: [exportSpec], stdin: { contents: 'export * from "./src/craft/dinner3d/core"; export * from "./src/craft/dinner3d/figures"; export { captionAt, CAP_TOPS } from "./src/craft/dinner3d/Dinner3D"; export { thighUnder, scaleOf, D, FM, jointPx, footY, heightOf } from "./src/craft/clips/clipKit"; export * as BG from "./src/craft/checks/bodyGeom"; export { kitOf, kitBody } from "./src/craft/wardrobe/kit"; export { A_SPEC } from "./src/craft/designs/flat";', resolveDir: ".", loader: "tsx" }, bundle: true, format: "esm", platform: "node", outfile: out, logLevel: "error", loader: { ".json": "json" }, external: ["remotion", "react"] });
const M = await import(pathToFileURL(out).href); fs.rmSync(out);
const { SHOTS, WHO, PLANT, placeOf, toScreen, feetOf, project, jointPx, handPx, FM, cardToWorld, thighUnder, scaleOf, D, captionAt, PUD_UP, TABLE_TOP } = M;
const CHECK_PLANTS = { capLow: 6, missing: 7, faceHide: 8, mouthHand: 9, oneArm: 10 }, RULE_OF = { seatHigh: 1, pudOff: 3, handIn: 4, float: 2, ...CHECK_PLANTS };
if (plant && !(plant in CHECK_PLANTS)) { if (!(plant in PLANT)) throw new Error("no such planted fault: " + plant); PLANT[plant] = true; }
const { BG, A_SPEC, footY, VOICES, kitOf, kitBody } = M; if (D.id !== "flatA") throw new Error("the checks' body sizes are A's: the design is " + D.id); const BODY = A_SPEC.sir.B;
// (an arm hidden by a named thing in the set, so it is no one-armed look: "shot:figure:L|R" -> the thing. None in v5)
const HIDDEN_BY = {};
// (who speaks when: each take from its place to its end)
const SPEAKS = VOICES.filter((v) => v.who !== "narrator").map((v) => ({ who: v.who, t0: v.at, t1: v.at + v.p.env30.length / FM.FPS }));
if (plant === "faceHide") { const v = M.viewOf("3d"), d = Math.hypot(v.d[0], v.d[1]); M.FIGS.boy = [M.FIGS.crew[0] + (0.5 * v.d[0]) / d, M.FIGS.crew[1] + (0.5 * v.d[1]) / d]; }
let missingDone = false; const armStat = {}, geomOut = [];
const SEAT = JSON.parse(fs.readFileSync("src/craft/dinner3d/props/seat.json", "utf8")).things[0].frames[0], STOOL_TOP = SEAT[2];
const faults = [], dump = {}, regions = [], fig0 = {}; let frames = 0, F0 = 0;
const hull = (P) => { const p = [...P].sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); } return [...lo.slice(0, -1), ...up.slice(0, -1)]; };
const worst = { seat: 0, grip: 0, table: [9, -9] };
for (const S of SHOTS) {
  const n = Math.round((S.t1 - S.t0) * FM.FPS); let whos = WHO[S.id](); dump[S.id] = [];
  if (plant === "missing" && !missingDone && whos.some((w) => w.name === "boy")) { whos = whos.filter((w) => w.name !== "boy"); missingDone = true; }
  const PUD = JSON.parse(fs.readFileSync(`src/craft/dinner3d/props/${S.id}.json`, "utf8")).things[0].frames;
  for (let fr = 0; fr < n; fr++) { frames++; const row = [], T = S.t0 + fr / FM.FPS;
    const placed = whos.map((w) => ({ w, pl: placeOf(S.id, fr, w) })), heads = [], hands = [];
    for (const { w, pl } of placed) {
      const f = pl.f, scr = (j) => toScreen(pl, jointPx(f, j)), key = S.id + ":" + w.name;
      { const P = (j) => scr(j).map((v) => Math.round(v)), s0 = scr("skull"), c0 = scr("crown"), hr = Math.hypot(c0[0] - s0[0], c0[1] - s0[1]) / 2, lw = Math.round(0.17 * hr);
        heads.push([(s0[0] + c0[0]) / 2, (s0[1] + c0[1]) / 2, hr * 1.1]);
        const limbs = ["L", "R"].flatMap((d) => [[P("sh" + d), P("el" + d)], [P("el" + d), P("wr" + d)], [P("wr" + d), P("tip" + d)], [P("hip" + d), P("kn" + d)], [P("kn" + d), P("an" + d)], [P("an" + d), P("toe" + d)], [P("heel" + d), P("toe" + d)]]);
        // (each joint's own depth: the figure's floor point's depth less how far the joint stands toward the lens in the rig (sk.z), in metres)
        const kz = (scaleOf("sir") / FM.PPM) * (w.h / M.heightOf("sir")), jd = (j) => +(project(S.id, fr, cardToWorld(w, pl, jointPx(f, j)))[2] - ((f.sk.z[j] ?? 0) - f.sk.z.pelvis) * kz).toFixed(3);      /* (the joint's own point on his card, at its height: under a tilted lens a hand at 35 cm is 12 cm nearer than the floor point) */      /* (from the pelvis: the card stands on his pelvis's floor point) */
        const limbD = ["L", "R"].flatMap((d) => [["sh" + d, "el" + d], ["el" + d, "wr" + d], ["wr" + d, "tip" + d], ["hip" + d, "kn" + d], ["kn" + d, "an" + d], ["an" + d, "toe" + d], ["heel" + d, "toe" + d]]).map(([a, b]) => Math.min(jd(a), jd(b)));
        row.push({ name: key, sil: false, depth: pl.depth, limbDepth: limbD, headDepth: jd("skull"), head: [Math.round((s0[0] + c0[0]) / 2), Math.round((s0[1] + c0[1]) / 2), Math.round(hr * 1.1)], headF: [+((s0[0] + c0[0]) / 2).toFixed(2), +((s0[1] + c0[1]) / 2).toFixed(2)],
          trunk: hull(["neck", "shL", "shR", "hipL", "hipR"].map((j) => scr(j))).map((q) => q.map((v) => Math.round(v))), limbs, lw });
        fig0[key] = w.at; }
      // 1 the seat
      if (w.name === "captain") { const TH = D.props("sir").thigh * scaleOf("sir"), px0 = jointPx(f, "pelvis")[0], under = thighUnder(f).filter(([x]) => Math.abs(x - px0) < 0.33 * TH), low = under.reduce((a, b) => (b[1] > a[1] ? b : a)), h = cardToWorld(w, pl, low)[2];
        worst.seat = Math.max(worst.seat, Math.abs(h - STOOL_TOP)); if (Math.abs(h - STOOL_TOP) > 0.01) faults.push(`1 ${S.id} frame ${fr}: the captain's seat ${((h - STOOL_TOP) * 100).toFixed(1)} cm ${h > STOOL_TOP ? "over" : "into"} the stool`); }
      // 2 the feet
      for (const ft of feetOf(S.id, fr, w, pl)) for (const [pt, px, nm] of [[ft.heel, ft.heelPx, "heel"], [ft.toe, ft.toePx, "toe"]]) {
        if (pt[2] < -0.005) faults.push(`2 ${S.id} frame ${fr} ${w.name} ${ft.side} ${nm}: ${(-pt[2] * 100).toFixed(1)} cm into the floor`);
        if (pt[2] <= 0.005) { const fl = project(S.id, fr, [pt[0], pt[1], Math.max(0, pt[2])]), dv = px[1] - fl[1]; if (Math.abs(dv) > 3 && px[1] > 0 && px[1] < FM.H) faults.push(`2 ${S.id} frame ${fr} ${w.name} ${ft.side} ${nm}: drawn ${Math.abs(dv).toFixed(1)} px ${dv > 0 ? "into" : "above"} the floor`); } }
      // 3 the pudding in the crewman's hand
      if (w.name === "crew" && PUD[0][3]) { const q = PUD[Math.min(fr, PUD.length - 1)], nn = f.sk.near, W = jointPx(f, "wr" + nn), Tp = jointPx(f, "tip" + nn), g = cardToWorld(w, pl, [W[0] + 0.45 * (Tp[0] - W[0]), W[1] + 0.45 * (Tp[1] - W[1])]);
        const d = Math.hypot(g[0] - q[0], g[1] - q[1], g[2] - (q[2] - PUD_UP)); worst.grip = Math.max(worst.grip, d); if (d > 0.01) faults.push(`3 ${S.id} frame ${fr}: the crewman's grip ${(d * 100).toFixed(1)} cm from the pudding`); }
      // 4 the hands on the table (shot 7)
      if (w.name === "captain" && S.id === "7") for (const sd of ["L", "R"]) for (const j of ["wr" + sd, "tip" + sd]) { const p = cardToWorld(w, pl, jointPx(f, j)), dz = p[2] - TABLE_TOP;
        worst.table = [Math.min(worst.table[0], dz), Math.max(worst.table[1], dz)];
        if (p[0] < -0.6 && (dz < -0.005 || dz > 0.03)) faults.push(`4 ${S.id} frame ${fr}: the captain's ${j} ${(dz * 100).toFixed(1)} cm ${dz < 0 ? "into" : "over"} the table top`); }
      // 5 the edges
      for (const sd of ["L", "R"]) { const wr = scr("wr" + sd), tp = scr("tip" + sd), r = handPx(pl) * 0.45,      /* (half a hand round the line from wrist to fingertips: the open hand is about as wide as half its length) */ xs = [wr[0], tp[0]], ys = [wr[1], tp[1]];
        hands.push([Math.min(...xs) - r, Math.min(...ys) - r, Math.max(...xs) + r, Math.max(...ys) + r]);
        const inside = Math.min(...xs) - r > 40 && Math.max(...xs) + r < FM.W - 40 && Math.min(...ys) - r > 40 && Math.max(...ys) + r < FM.H - 40, gone = Math.max(...xs) + r < 0 || Math.min(...xs) - r > FM.W || Math.max(...ys) + r < 0 || Math.min(...ys) - r > FM.H;
        if (!inside && !gone) faults.push(`5 ${S.id} frame ${fr} ${w.name}: his ${sd} hand cut by the picture's edge`); }
    }
    // 9 and 10: the drawn parts of each figure (skeleton units, then the picture)
    { const sil = placed.map(({ w, pl }) => { const f = pl.f, s = scaleOf(f.who), scr = (p) => toScreen(pl, [f.x + p[0] * s, footY(f.who) + p[1] * s]);
        let sk = f.sk; const kinds = { L: f.o.handL ?? "relaxed", R: f.o.handR ?? "relaxed" };
        const ft = project(S.id, fr, [pl.at[0], pl.at[1], 0]), hd = project(S.id, fr, [pl.at[0], pl.at[1], w.h]), tall = (ft[1] - hd[1]) / FM.H;
        if (plant === "oneArm" && w.name === "crew") { const fa = sk.far, sh = sk.j["sh" + fa], j = { ...sk.j }; j["el" + fa] = [sh[0], sh[1] - 74]; j["wr" + fa] = [sh[0] + 4, sh[1] - 142]; j["tip" + fa] = [sh[0] + 6, sh[1] - 202]; sk = { ...sk, j }; }
        const kit = kitOf(f.o.look), B = kitBody(BODY, kit);      // (a wardrobe figure: its own body, coat and hat)
        const parts = { L: BG.armParts(sk, "L", kinds.L, B), R: BG.armParts(sk, "R", kinds.R, B) };
        const all = [BG.torsoPoly(sk, B), ...BG.headPolys(sk, kit), ...parts.L.all, ...parts.R.all, ...BG.legPolys(sk, B, kit)].map((P) => P.map(scr));
        return { w, pl, f, sk, s, scr, kinds, parts, tall, all, kit, B }; });
      for (const g of sil) {
        // (--geom shot:frame writes the parts as the checks see them, in the picture, for an overlay on the rendered frame)
        if (arg("--geom") === `${S.id}:${fr}`) { const G = (P) => P.map((q) => g.scr(q).map((v) => +v.toFixed(1))); geomOut.push({ who: g.w.name, near: g.sk.near, mouth: G(BG.mouthPts(g.sk, g.f.o.face ?? {})),
          handL: g.parts.L.hand.map(G), handR: g.parts.R.hand.map(G), armL: g.parts.L.all.map(G), armR: g.parts.R.all.map(G), occ: BG.occluders(g.sk, g.B, g.sk.far, g.kinds[g.sk.near], g.kit).map(G) }); }
        // 9 the own hand over the mouth while he speaks
        if (SPEAKS.some((v) => v.who === g.w.name && T >= v.t0 && T < v.t1)) { const mp = BG.mouthPts(g.sk, g.f.o.face ?? {});
          for (const sd of ["L", "R"]) { if (Math.abs(g.sk.sin) > 0.5 && sd !== g.sk.near) continue;
            let hp = g.parts[sd].hand; if (plant === "mouthHand" && sd === g.sk.near) { const c = hp.flat().reduce((a, q, _, A) => [a[0] + q[0] / A.length, a[1] + q[1] / A.length], [0, 0]), mc = mp[Math.floor(mp.length / 2)]; hp = hp.map((P) => P.map((q) => [q[0] + mc[0] - c[0], q[1] + mc[1] - c[1]])); }
            const grown = hp.map((P) => BG.grow(P, 4.5)), hit = mp.filter((q) => grown.some((P) => BG.inPoly(q, P))).length;
            if (hit) faults.push(`9 ${S.id} frame ${fr} ${g.w.name}: his ${sd === g.sk.near ? "near" : "far"} hand over his mouth while he speaks (${hit} of ${mp.length} mouth points)`); } }
        // 10 a one-armed look (in a medium or close shot: its tallest figure 50 % of the picture or more; every figure whose head is in it)
        const shotTall = Math.max(...sil.map((o) => o.tall)), hc = g.scr(BG.headPt(g.sk, [0, -128]));
        if (shotTall >= 0.5 && hc[0] > 0 && hc[0] < FM.W && hc[1] > 0 && hc[1] < FM.H) { const share = {};
          for (const sd of ["L", "R"]) { const own = BG.occluders(g.sk, g.B, sd, g.kinds[g.sk.near], g.kit), seenOf = (polys) => { const pts = BG.fillPts(polys, 5); let inside = 0, seen = 0;
              for (const q of pts) { const p = g.scr(q); if (p[0] < 0 || p[0] > FM.W || p[1] < 0 || p[1] > FM.H) continue; inside++;
                if (own.some((P) => BG.inPoly(q, P))) continue; if (sil.some((o) => o !== g && o.pl.depth < g.pl.depth && o.all.some((P) => BG.inPoly(p, P)))) continue; seen++; }
              return { n: pts.length, inside, seen }; };
            share[sd] = { arm: seenOf(g.parts[sd].all), hand: seenOf(g.parts[sd].hand) }; }
          for (const sd of ["L", "R"]) { const a = share[sd].arm, h = share[sd].hand, k = `${S.id}:${g.w.name}:${sd === g.sk.near ? "near" : "far"}`;
            if (a.inside < 0.3 * a.n) continue;      // (an arm mostly out of the picture is framing, not a missing arm)
            const fa = a.seen / a.n, fh = h.seen / h.n, st = (armStat[k] ??= { arm: 9, hand: 9 }); st.arm = Math.min(st.arm, fa); st.hand = Math.min(st.hand, fh);
            // (an arm reads as there when 15 % of its drawn area shows, or a quarter of its hand: shot 7's far hand on the table, behind the near one)
            if (fa < 0.15 && fh < 0.25 && !HIDDEN_BY[k]) faults.push(`10 ${S.id} frame ${fr} ${g.w.name}: his ${sd === g.sk.near ? "near" : "far"} arm hidden, ${(fa * 100).toFixed(0)} % of it and ${(fh * 100).toFixed(0)} % of its hand seen (one-armed look)`); } } } }
    // 8 no face covered: a farther figure's face (the head's circle below its cap, 0.8 of its radius) is not under a nearer figure's body (the
    //  hull of its joints and the head's circle) in any frame
    { const geo = placed.map(({ w, pl }) => { const J = (j) => toScreen(pl, jointPx(pl.f, j)), s0 = J("skull"), c0 = J("crown"), hr = Math.hypot(c0[0] - s0[0], c0[1] - s0[1]) / 2;
        const body = hull(["neck", "shL", "shR", "elL", "elR", "wrL", "wrR", "tipL", "tipR", "hipL", "hipR", "knL", "knR", "anL", "anR"].map(J));
        return { name: w.name, depth: pl.depth, hc: [(s0[0] + c0[0]) / 2, (s0[1] + c0[1]) / 2], r: hr * 1.1, body }; });
      const inPoly = (pt, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) if ((P[i][1] > pt[1]) !== (P[j][1] > pt[1]) && pt[0] < ((P[j][0] - P[i][0]) * (pt[1] - P[i][1])) / (P[j][1] - P[i][1]) + P[i][0]) c = !c; return c; };
      for (const far of geo) for (const near of geo) { if (near === far || near.depth >= far.depth) continue;
        const pts = []; for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2; for (const rr of [0, 0.4, 0.8]) pts.push([far.hc[0] + Math.cos(a) * rr * far.r, far.hc[1] + 0.25 * far.r + Math.sin(a) * rr * far.r * 0.75]); }
        const hit = pts.filter((q) => inPoly(q, near.body) || Math.hypot(q[0] - near.hc[0], q[1] - near.hc[1]) < near.r).length;
        if (hit > 2) faults.push(`8 ${S.id} frame ${fr}: the ${far.name}'s face is under the ${near.name} (${hit} of ${pts.length} points)`); } }
    // 7 nobody missing: a figure of the room that is not drawn in a shot must be wholly out of its picture (his head and feet projected)
    if (fr === 0) for (const nm of ["captain", "crew", "boy"]) { if (whos.some((w) => w.name === nm)) continue; const at = M.FIGS[nm], hh = nm === "boy" ? 1.5 : 1.75;
      for (const [dx, z] of [[0, 0], [0, hh * 0.5], [0, hh], [-0.35, hh * 0.6], [0.35, hh * 0.6], [-0.3, 0.3], [0.3, 0.3]]) { const q = project(S.id, 0, [at[0] + dx, at[1], z]); if (q[2] > 0 && q[0] > -20 && q[0] < FM.W + 20 && q[1] > -20 && q[1] < FM.H + 20) { faults.push(`7 ${S.id}: the ${nm} stands in the picture but is not drawn`); break; } } }
    // 6 the words
    const c = captionAt(T); if (c) { const b = [...c.box]; if (plant === "capLow") { b[1] += 300; b[3] += 300; }
      if (b[1] < 0.15 * FM.H || b[3] > 0.85 * FM.H) faults.push(`6 ${S.id} frame ${fr}: "${c.text}" outside 15-85 % (${Math.round(b[1])}-${Math.round(b[3])})`);
      for (const h of heads) { const cx = Math.max(b[0], Math.min(h[0], b[2])), cy = Math.max(b[1], Math.min(h[1], b[3])); if (Math.hypot(cx - h[0], cy - h[1]) < h[2] && b[3] > h[1] - 0.45 * h[2]) {      /* (the face: the head's circle below its cap, which covers its top 0.55) */ faults.push(`6 ${S.id} frame ${fr}: "${c.text}" over a face`); break; } }
      for (const hb of hands) if (hb[0] < b[2] && hb[2] > b[0] && hb[1] < b[3] && hb[3] > b[1] && hb[2] > 0 && hb[0] < FM.W) { faults.push(`6 ${S.id} frame ${fr}: "${c.text}" over a hand`); break; } }
    regions.push({ F: F0 + fr, shot: S.id, eyes: placed.map((p) => { const J = (j) => toScreen(p.pl, jointPx(p.pl.f, j)), a = J("skull"), b = J("crown"), r = Math.hypot(b[0] - a[0], b[1] - a[1]) / 2, yaw = (p.pl.f.sk.faceYaw * Math.PI) / 180;
      return [Math.round((a[0] + b[0]) / 2 + 0.5 * r * Math.sin(yaw)), Math.round((a[1] + b[1]) / 2 + 0.05 * r), Math.round(0.5 * r)]; }), text: c ? [[Math.round(c.box[0] - 10), Math.round(c.box[1] - 6), Math.round(c.box[2] + 10), Math.round(c.box[3] + 6)]] : [] });
    dump[S.id].push(row); }
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
const seen = new Set(), shown = [];
for (const f of faults) { const k = f.replace(/frame \d+/, "").replace(/-?[\d.]+ (px|cm)/g, "").replace(/\(\d+-\d+\)/, ""); if (!seen.has(k)) { seen.add(k); shown.push(f); } }
for (const f of shown.slice(0, 40)) console.log("  " + f);
const by = {}; for (const f of faults) { const k = f.split(" ").slice(0, 2).join(" "); by[k] = (by[k] ?? 0) + 1; } console.log(JSON.stringify(by));
console.log("arms seen (far arms only, least share of the arm/of its hand, medium and close shots): " + Object.entries(armStat).filter(([k]) => k.endsWith("far")).map(([k, v]) => `${k} ${(v.arm * 100).toFixed(0)}/${(v.hand * 100).toFixed(0)}%`).join(", "));
console.log(`worst: seat ${(worst.seat * 100).toFixed(2)} cm from the stool, grip ${(worst.grip * 100).toFixed(2)} cm from the pudding, hands on the table ${(worst.table[0] * 100).toFixed(1)} to ${(worst.table[1] * 100).toFixed(1)} cm over its top`);
console.log(`DINNER CHECK ${plant ? "(planted: " + plant + ") " : ""}${faults.length ? "FAILED: " + faults.length + " faults" : "OK"} (${frames} frames)`);
// (a planted run counts only the faults of its rule that the clean run (its list kept in out/din3d/faults-clean.json) does not have: v5 fails
//  rules 9 and 10 by itself, and a plant must show it is caught on its own)
const CLEAN = "out/din3d/faults-clean.json";
if (!plant) { fs.mkdirSync("out/din3d", { recursive: true }); fs.writeFileSync(CLEAN, JSON.stringify(faults)); }
if (plant) { const r = RULE_OF[plant], base = new Set(fs.existsSync(CLEAN) ? JSON.parse(fs.readFileSync(CLEAN, "utf8")) : []), hit = faults.filter((f) => f.startsWith(r + " ") && !base.has(f)).length; console.log(`PLANTED ${plant}: rule ${r} ${hit ? "FIRED (" + hit + " new faults)" : "DID NOT FIRE"}`); for (const f of faults.filter((f) => f.startsWith(r + " ") && !base.has(f)).slice(0, 3)) console.log("    " + f); process.exit(hit ? 1 : 0); }
process.exit(faults.length ? 1 : 0);

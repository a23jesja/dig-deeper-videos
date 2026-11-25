// The Short "The captain's dinner" v6 (25 Nov): writes src/craft/dinner3d/shots.json from the shot list (granskning/kaptenens-middag/
// bildlista-v6.md, with fallbacks 1-5): each shot's camera from its intent (where it looks from: az, degrees off the room's +y, positive
// from the left; el, degrees down; the lens; what must be in the picture), its distance fitted so those points lie inside the frame's
// margins. Prints each figure's heading in each shot and, for each cut between shots of the same figure, the change of angle and size.
//   node scripts/dinner_v6_shots.mjs
import fs from "node:fs";
const P = "src/craft/dinner3d/shots.json", OLD = JSON.parse(fs.readFileSync(P, "utf8"));
const W = 1080, H = 1920;
// ---- the room (world metres; z up): the table (-1.447..-0.583 x 0.823..1.397, top 0.488) as step 1 has it
const FIGS = { captain: [-0.36, 0.88], crew: [-1.45, 0.56],      /* (the captain 11 cm nearer the table: his far hand reaches it; the plate between them both, the first check) */ boy: [-2.3, 0.34] };      /* (v6 second layout: the three 1.1 and 0.85 m apart, so a single can keep a neighbour's face clearly in or out, the tuner) */      // (0.9 m from the sailor: at 0.6 his head came into every single of the sailor, cut at an edge)
/** which way each faces on the floor: the captain toward the table's front and the lens (3/4 in the front views), the two toward him */
const FACING = { captain: [-0.75, -0.66], crew: [0.7, -0.71], boy: [0.7, -0.71] };
const HEIGHTS = { captain: 1.75, crew: 1.9, boy: 1.42 };
const PLATE = [-0.98, 0.88], BOOK = [-1.25, 0.93], TOP = 0.488;      /* (the book at the table's front edge: 46 cm behind him its place on his card lay past his reach, the check) */      // (the book within reach of the sailor's left hand, on the table's side of him)
const SEAT_TOP = 1.95;      // (the seated captain's tricorn: Knopp's short legs lower him only about 16 cm, the hat stands 20 cm over his head)      // (the seated captain's hat top, about)
// ---- what each shot frames: point sets
const fig = (nm, z0, z1, wide = 0.44) =>      // (Knopp's head is 0.7 m across at 1.9 m: the half-width with the hat's brim)
  { const [x, y] = FIGS[nm]; return [[x - wide, y, z0], [x + wide, y, z0], [x, y, z1], [x - wide, y, z1], [x + wide, y, z1]]; };
const cap = (z0, z1 = SEAT_TOP) => [...fig("captain", z0, z1, 0.5), [-0.7, 1.02, TOP]];      // (with his hands on the table)
const crew = (z0, z1 = 2.1) => fig("crew", z0, z1, 0.44);
const boy = (z0, z1 = 1.58) => fig("boy", z0, z1, 0.36);
const S = [
  { id: "1", t0: 0, t1: 1.6, az: -4, el: 12, lens: 24, pts: [...cap(0), ...crew(0.35), [PLATE[0], PLATE[1], TOP]], what: "two-shot at the table: the sailor's hand already round the pudding on the captain's plate lifts it (0.10-0.90, the ting as it leaves the plate 0.35); the captain's eyes follow it, his hands by the empty plate", focus: "crew" },
  { id: "2", t0: 1.6, t1: 2.7, az: 22, el: -6, lens: 34, pts: cap(0.78), what: "the captain, half close, low, 3/4: eyes wide (1.60), the fist up (1.95), \"Hey!\" (2.04)", focus: "captain" },
  { id: "3", t0: 2.7, t1: 4.7, az: -32, el: 10, lens: 28, pts: [...crew(0.42), [BOOK[0], BOOK[1], TOP]], what: "the sailor, medium, 3/4, the book on the table beside him: his free hand slaps flat on it (2.77, the thump), stays; the pudding on his other palm; he lifts it and sniffs (3.60); brows up, a crooked grin (4.20)", focus: "crew" },
  { id: "4", t0: 4.7, t1: 6.4, az: 0, el: 10, lens: 20, pts: [...cap(0), ...crew(0), ...boy(0)], what: "all three: the sailor takes a bite (4.80, chewing at 5.00); the captain's brows down (5.30); the boy leans in, eager (5.60)", focus: "crew" },
  { id: "5", t0: 6.4, t1: 8.7, az: -34, el: 8, lens: 25, pts: [...boy(0.75), ...crew(1.0)], what: "the boy and the sailor: the boy leans forward (6.50), licks his lips while silent (7.20-7.80), smiles (8.30)", focus: "boy" },
  // (shot 6 of the list is one with 7: two three-shots in a row cannot turn 30 degrees with the captain and the sailor both in 3/4)
  { id: "7", t0: 8.7, t1: 12.1, az: -8, el: 2, avoid: ["boy", "captain"], lens: 30, pts: crew(0.0), what: "the sailor, medium: raises the pudding high (9.90), a big bite (10.60, chewing), swings it away to his side (11.50)", focus: "crew" },
  { id: "8", t0: 12.1, t1: 13.3, az: -40, el: 12, avoid: ["boy", "captain"], lens: 40, pts: fig("crew", 1.0, 2.1, 0.42), what: "the sailor, half: the pudding up on his palm beside his face, as a toast (12.15); \"Thank you, Captain.\" with a crooked smile (12.20); a nod (12.90)", focus: "crew" },
  { id: "9", t0: 13.3, t1: 15.3, az: 8, el: 10, avoid: ["crew", "boy"], lens: 33, pts: [...cap(0.3), [-0.9, 0.9, TOP]], what: "the captain, seated, 3/4, both hands on the table: opens his mouth (13.40), presses his lips (14.00), the red rises, fists on the table (14.50), begins to rise (15.00)", focus: "captain" },
  { id: "10a", t0: 15.3, t1: 15.6, az: 45, el: -6, lens: 24, pts: cap(0.0), what: "the captain, whole, at the table: half up, feet on the floor (15.30-15.45); his right fist down on the table (15.45, the thump on the contact frame); \"That\"", focus: "captain" },
  { id: "10b", t0: 15.6, t1: 16.7, az: 36, el: -4, lens: 42, pts: fig("captain", 1.0, 1.6, 0.3), what: "the captain, close, his head 60 % of the picture or more, red, sweating: \"...was MY pudding!\" (the cut on the word boundary before \"was\", 15.60); sinks back (16.40)", focus: "captain" },
  { id: "11", t0: 16.7, t1: 18.7, az: 8, el: 12, lens: 20, pts: [...cap(0), ...crew(0), ...boy(0)], what: "all three: the captain beats his chest and raises his fist (16.90); the sailor and the boy lean back, a hand up by the ear (17.40); the captain pleased (18.20)", focus: "captain" },
  { id: "12", t0: 18.7, t1: 20.5, az: -40, el: 4, lens: 27, pts: [...boy(0.35), ...crew(0.6)], what: "the sailor and the boy: they look at each other (19.20); the boy nods (19.80); a crooked grin (20.20)", focus: "boy" },
  { id: "13", t0: 20.5, t1: 22.0, az: 12, el: 8, avoid: ["boy", "captain"], lens: 38, pts: crew(0.9), what: "the sailor, half, 3/4: nods (20.90), chin up (21.50)", focus: "crew" },
  { id: "14", t0: 22.0, t1: 23.2, az: -36, el: 2, lens: 27, pts: [...boy(0.55), ...crew(0.95)], what: "close: the boy and the sailor, each with a hand up at the ear, palms to the lens; \"All in favour?\" (22.05); the boy grins (22.80)", focus: "boy" },
  { id: "15", t0: 23.2, t1: 24.0, az: -4, el: 12, lens: 24, pts: [...cap(0), ...crew(0.35), [PLATE[0], PLATE[1], TOP]], what: "as shot 1: the captain's shoulders sink (23.30), his hand on the empty plate (23.60), the swish into the loop (23.90)", focus: "captain" },
];
// ---- the camera from an intent: looking along (sin az cos el, cos az cos el, -sin el), at the points' middle, as far as fits them inside the margins
const R = Math.PI / 180, norm = (v) => { const l = Math.hypot(...v); return v.map((q) => q / l); }, cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const proj = (C, at, lens, p) => { const f = norm([at[0] - C[0], at[1] - C[1], at[2] - C[2]]), r = norm(cross(f, [0, 0, 1])), u = cross(r, f), v = [p[0] - C[0], p[1] - C[1], p[2] - C[2]], z = dot(v, f), F = (lens / 24) * H;
  return [W / 2 + (F * dot(v, r)) / z, H / 2 - (F * dot(v, u)) / z, z]; };
const MX = 0.07, MY = 0.06;
/** inside the cabin (walls at x +-2.4, y -3.2 and 3.2, the ceiling's beams from 2.29): a camera outside sees the walls' backs, the first draft */
const inRoom = (C) => C[0] > -2.1 && C[0] < 2.1 && C[1] > -2.7 && C[1] < 2.9 && C[2] > 0.25 && C[2] < 1.95;      // (well inside: near the front end of the room the ceiling's edge showed black, the first stills)
/** every head whole in the picture or wholly out of it (a face cut by the edge read as a mistake, the first stills; v4's review): the head as
 *  its circle (0.82 of the height up, 0.36 of the height across with the hat) */
const headsOk = (s, c, only = null, full = false) => (only ?? Object.keys(FIGS)).every((nm) => { const [x, y] = FIGS[nm], hh = HEIGHTS[nm] * (nm === "captain" ? 0.9 : 1), r = nm === "captain" ? 0.46 : 0.2 * HEIGHTS[nm], zc = 0.8 * hh;      // (the captain's with his tricorn's brim)
  // (a sliver of a neighbour's head at an edge, a tenth of it or less, is a shot's framing; a third of a face at the edge is not, the stills)
  const pts = [[0, 0], ...Array.from({ length: 12 }, (_, i) => [Math.cos((i / 12) * 2 * Math.PI) * r, Math.sin((i / 12) * 2 * Math.PI) * r * 1.05])];
  const inside = pts.map(([dx, dz]) => proj(c.C, c.at, s.lens, [x + dx, y, zc + dz])).filter((p) => p[2] > 0 && p[0] > 8 && p[0] < W - 8 && p[1] > 8 && p[1] < H - 8).length / pts.length;
  return full ? inside === 1 : inside === 1 || inside <= 0.1; });
/** the camera for a shot: the nearest angle to its intent (up to 20 degrees away, half-degree steps) with every head whole in or out; if none,
 *  the figure whose head is cut is taken whole into the picture (his head and feet among its points) and the search runs again */
const cutHeads = (s, c) => Object.keys(FIGS).filter((nm) => !headsOk({ ...s, lens: c.lens }, c, [nm]));
let PREV = null;      // (the shot before: a cut to the same figure needs 30 degrees)
const angOK = (c) => { if (!PREV) return true; const da = norm(PREV.at.map((v, k) => v - PREV.C[k])), db = norm(c.at.map((v, k) => v - c.C[k])); return (Math.acos(Math.min(1, dot(da, db))) * 180) / Math.PI >= 31; };
/** every figure whose head is whole in the picture is turned at most 62 degrees from the lens (3/4: the captain never in profile, the list) */
const facesOK = (s, c) => Object.keys(FIGS).every((nm) => { if (!headsOk({ ...s, lens: c.lens }, c, [nm], true)) return true; const d = norm([c.at[0] - c.C[0], c.at[1] - c.C[1], 0]), right = [d[1], -d[0]], f = norm(FACING[nm]);
  return Math.abs((Math.atan2(f[0] * right[0] + f[1] * right[1], -(f[0] * d[0] + f[1] * d[1])) * 180) / Math.PI) <= 62; });
const camOf = (s) => { const az0 = s.az;
  for (let round = 0; round < 3; round++) {
    for (let k = 0; k <= 140; k++) { const az = az0 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.5, c = camL({ ...s, az }); if (inRoom(c.C) && headsOk({ ...s, lens: c.lens }, c) && facesOK(s, c) && (s.noPrev || angOK(c))) { s.az = az; s.lens = c.lens; PREV = c; return c; } }
    const c0 = camL(s), cut = cutHeads(s, c0); if (!cut.length) break;
    for (const nm of cut) { const [x, y] = FIGS[nm], hh = HEIGHTS[nm]; s.pts = [...s.pts, [x - 0.4, y, hh * 0.55], [x + 0.4, y, hh * 0.55], [x, y, hh * 1.1], [x, y, hh * 0.35]]; s.what += ` (the ${nm} whole in the picture)`; } }
  console.log("  (no angle keeps every head whole in or out: " + s.id + ")"); const c = camL(s); PREV = c; return c; };
const camL = (s) => { for (let lens = s.lens; lens >= 12; lens -= 1) { const c = camAt({ ...s, lens }); if (inRoom(c.C) || lens <= 12) return { ...c, lens }; } };
const camAt = (s) => { const d = [Math.sin(s.az * R) * Math.cos(s.el * R), Math.cos(s.az * R) * Math.cos(s.el * R), -Math.sin(s.el * R)];
  const lo = [0, 1, 2].map((i) => Math.min(...s.pts.map((p) => p[i]))), hi = [0, 1, 2].map((i) => Math.max(...s.pts.map((p) => p[i]))), at = lo.map((v, i) => (v + hi[i]) / 2);
  const fits = (dist) => { const C = at.map((v, i) => v - d[i] * dist); return s.pts.every((p) => { const q = proj(C, at, s.lens, p); return q[2] > 0.2 && q[0] > MX * W && q[0] < (1 - MX) * W && q[1] > MY * H && q[1] < (1 - MY) * H; }); };
  let a = 0.4, b = 12; for (let k = 0; k < 50; k++) { const m = (a + b) / 2; if (fits(m)) b = m; else a = m; }
  const C = at.map((v, i) => +(v - d[i] * b).toFixed(3)); return { C, at: at.map((v) => +v.toFixed(3)), dist: b }; };
const S0 = S.map((s) => ({ ...s }));
const shots = S.map((s) => { const c = camOf(s), fp = s.focus === "captain" ? [FIGS.captain[0], FIGS.captain[1], 1.15] : [FIGS[s.focus][0], FIGS[s.focus][1], 0.85 * HEIGHTS[s.focus]];
  return { id: s.id, t0: s.t0, t1: s.t1, what: s.what, static: true, cam: { from: [c.C, c.C], at: c.at, lens: c.lens, fstop: 2.8, focus: s.focus, focusPoint: fp }, _c: c }; });
// ---- report: headings (0 = facing the lens; |sin| over 0.5 = the rig's side order) and the cuts
const heading = (s, nm) => { const c = s._c, d = norm([c.at[0] - c.C[0], c.at[1] - c.C[1], 0]), right = [d[1], -d[0]], f = norm(FACING[nm]);
  return (Math.atan2(f[0] * right[0] + f[1] * right[1], -(f[0] * d[0] + f[1] * d[1])) * 180) / Math.PI; };
const inPic = (s, nm) => { const [x, y] = FIGS[nm], c = s._c; return [[0, 0.1], [0, HEIGHTS[nm] * 0.5], [0, HEIGHTS[nm]], [-0.45, HEIGHTS[nm] * 0.75], [0.45, HEIGHTS[nm] * 0.75]].some(([dx, z]) => { const q = proj(c.C, c.at, s.cam.lens, [x + dx, y, z]); return q[2] > 0 && q[0] > -20 && q[0] < W + 20 && q[1] > -20 && q[1] < H + 20; }); };
for (const s of shots) { const who = Object.keys(FIGS).filter((nm) => inPic(s, nm));
  console.log(`${s.id.padStart(2)} az ${S.find((q) => q.id === s.id).az} ${s.t0.toFixed(2)}-${s.t1.toFixed(2)} cam ${s._c.C.join(",")} dist ${s._c.dist.toFixed(2)}  ` + who.map((nm) => { const h = heading(s, nm), [x, y] = FIGS[nm], q0 = proj(s._c.C, s._c.at, s.cam.lens, [x, y, 0]), q1 = proj(s._c.C, s._c.at, s.cam.lens, [x, y, HEIGHTS[nm]]);
    return `${nm} ${h.toFixed(0)}deg${Math.abs(Math.sin(h * R)) > 0.5 ? "(side)" : "(front)"} ${Math.round(((q0[1] - q1[1]) / H) * 100)}%`; }).join("  ")); }
for (let i = 1; i < shots.length; i++) { const a = shots[i - 1], b = shots[i], both = Object.keys(FIGS).filter((nm) => inPic(a, nm) && inPic(b, nm)); if (!both.length) continue;
  const da = norm(a._c.at.map((v, k) => v - a._c.C[k])), db = norm(b._c.at.map((v, k) => v - b._c.C[k])), ang = (Math.acos(Math.min(1, dot(da, db))) * 180) / Math.PI;
  const size = (s, nm) => { const [x, y] = FIGS[nm], q0 = proj(s._c.C, s._c.at, s.cam.lens, [x, y, 0.5]), q1 = proj(s._c.C, s._c.at, s.cam.lens, [x, y, 1.2]); return q0[1] - q1[1]; };
  const sz = Math.max(...both.map((nm) => Math.max(size(a, nm), size(b, nm)) / Math.min(size(a, nm), size(b, nm))));
  console.log(`cut ${a.id}->${b.id} (${both.join(",")}): ${ang.toFixed(0)} deg, ${sz.toFixed(2)}x ${ang >= 30 && sz >= 1.3 ? "" : "  << UNDER 30 deg OR 1.3x"}`); }
const out = { ...OLD, note: "The Short 'The captain's dinner' v6 (25 Nov): the wardrobe's people in the step-1 cabin; written by scripts/dinner_v6_shots.mjs from bildlista-v6.md. figs: each figure's pelvis floor point (the captain's over his chest); facing: each figure's floor direction; every camera holds still.",
  heights: HEIGHTS, plate: PLATE, book: BOOK, figs: FIGS, facing: FACING, shots: shots.map(({ _c, ...s }) => s) };
fs.writeFileSync(P, JSON.stringify(out, null, 1));
fs.mkdirSync("out/din3d", { recursive: true }); fs.writeFileSync("out/din3d/intents.json", JSON.stringify(S0.map((s) => ({ id: s.id, az: s.az, el: s.el, lens: s.lens, what: s.what, focus: s.focus }))));

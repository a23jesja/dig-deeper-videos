
## The figure kit (2026-11-15)
Jesper's six sheets in `../Figurblad/` are cut once into named transparent parts and reused by every video.
- Cut: copy the sheets to `out/kit/src/s0..s5.png` (s0 plain figure, s1 wardrobe, s2 Sir Digsworth main sheet, s3 effects,
  s4 faces and mouths, s5 Sir Digsworth parts), enlarge the small ones with `python scripts/comfy_upscale.py` (Real-ESRGAN
  anime 6B, BSD-3-Clause, runs in ComfyUI; s0, s1, s3, s4 are then halved to `*x2.png`, s5 stays `s5x4.png`), then
  `python scripts/kit_cut.py`. It writes `public/kit/<sir|base|wardrobe|fx>/<name>.png` and `src/videos/kit/parts.json`.
  `python scripts/kit_sheet.py` makes labelled overviews in `out/kit/`.
- Puppets: `src/videos/kit/puppet.tsx`. `Look` = who (Sir Digsworth, or the plain figure + garment, tint, hat, moustache,
  beard, hair); `Pose` = ground point, hand and foot targets, hand picture, head picture (`talk_*` mouth shapes,
  `face_*` / `expr_*` expressions, `head_side`). Sir Digsworth's front heads are mirrored so the monocle sits on the eye
  to the left of the picture, as on the main sheet. `mouthOf(word, u)` picks the mouth shape while a word is spoken.
- Check pictures: compositions `KitTest` (all garments, hats, heads, hands) and `KitTrio` (Sir Digsworth, guard, thief).
- Missing from the kit, drawn in code or worked around (for Jesper to add to the sheets later): side and back views of
  every garment and hat; sleeves as separate pieces (drawn as strokes in the garment's colour); trousers and shoes;
  the headscarf needs an open face hole; the long hair's fill is lost in the cut; Sir Digsworth's parts sheet came at
  512 px and was enlarged four times (a full-size copy would be sharper; his "holding" hand turned blue and is not used).

## The locked style and the environment kit (2026-11-15)
Jesper locked the style: flat drawn figures as cards in a detailed 3D world, as in the emu short. Figures are whole
pose drawings from his sheets (`scripts/kit2_cut.py` -> `public/kit/cards/`, `src/videos/kit/cards.json`), placed with
`kitFig` (`src/videos/emu/kitcards.ts`): one picture per pose, pose changes as a short hop, and on top only a mouth
shape while he talks (`scripts/kit2_mouths.py`), a blink, pipe smoke and a slow sway. Nothing is bent or redrawn.
- Environment kit: `src/videos/emu/env/` (every piece returns `{ obj, update(t) }`):
  `foliage.ts` trees with thousands of separate leaves and grass of separate blades (wind in the vertex shader),
  `surfaces.ts` road, cobbles, planked deck, soil (colour + bump textures with lines and wear), `sky.ts` day, dusk and
  night (clouds in three layers, stars, moon), `water.ts` waves and reflections, `particles.ts` rain, snow, dust,
  debris, sparks, smoke, `lights.ts` lantern, bulb sign, lit window, fire, distress rocket and the one shadow-casting
  key light, `models.ts` CC0 models (Poly Haven, licence read 2026-11-15; `python scripts/get_models.py`).
  Check pictures: composition `EnvKit`, frames 0-9.
- The Titanic deck (`deckset.ts`, zone `deck`, light `night`) is built from the kit. A rocket takes over as the scene's
  one light while it burns (`deckFlare`, used in `world.ts`).
- Test film: `titanic3Test.ts` + `KitWorld.tsx` (composition `KitWorld`). Run `node scripts/kit_check.mjs` before
  rendering: it must print "LAYOUT OK" (5 % margin, faces clear of the top and bottom 15 %, the caption band and the
  hook text, biggest figure at least half the height in medium shots, air between figures, the lady in the boat not
  covered, no set piece over or between figures, wide shots 2 s at most, close-ups with the whole face inside).
- Found on the pose sheets (for Jesper): every new Sir Digsworth pose has the monocle on the eye to the RIGHT of the
  picture (the main sheet has it on the left); the cane is in the other hand in the cheering and shrugging poses;
  walk frames 5 and 6 have no cane; the second pose sheet and the walk cycle have a body about 15 % shorter for the
  same head. The dressed side figures have no lady standing (only seated in a boat).

## Look locked on 2026-11-16: code-drawn cast, no figure sheets in videos
DAILY-RULES "The look: the emu Short". Characters are drawn in code by `src/videos/emu/toon.ts` and placed with
`person()`; the Flow sheets (`Figurblad/`, `public/kit/`, `src/videos/kit/`, `kitcards.ts`) are never loaded by a video.
- `node scripts/no_sheets_check.mjs` walks everything `src/index.ts` imports and fails if a video uses the sheets.
  `scripts/stills.mjs` runs it first; `node scripts/render.mjs <Comp> <out.mp4> [layoutCheck.mjs]` runs it and the
  layout check and renders only if both pass.
- Test film: composition `Titanic3Test` (`Titanic3Test.tsx`, `titanic3Scenes.ts`, set in `deckset.ts`), layout check
  `scripts/kit_check.mjs` (a standing figure measures 1.7 m to the top of the head, face centre at 1.42 m).
- toon.ts fixes for Sir Digsworth: monocle on the eye to the left as the viewer sees him, cap peak as wide as the cap.

## Painted images: where they may be used (Jesper's decision, 19 November 2026)
After the painted-cabin test (granskning/malad-kajuta/), Jesper chose 3D for the films. Locally painted images may be used in three places only:
- opening shots where the camera only glides in;
- thumbnails;
- sky and sea outside windows and openings.

The images come from SDXL base 1.0 (CreativeML Open RAIL++-M) in the local ComfyUI. The depth layers come from Depth Anything V2 **Small** (Apache-2.0). Base and Large are CC-BY-NC and are never used.

The rules for making them:
- everything runs locally, with no credits and no cloud;
- read the licence before any download;
- record the prompt, seed and settings beside each picture (`scripts/comfy_paint.py` writes them);
- no text and no figures in a painting.

The tools:
- `scripts/comfy_paint.py`: paints from a job file in `scripts/paint-jobs/`.
- `scripts/depth_layers.py`: splits a painting into three depth layers.
- `world/painted.ts`: places the layers in front of the lens.

**Zero tolerance covers every technique** (Jesper, 19 November, after Blackbeard stood inside the painted sofa; DAILY-RULES "Impossible things: zero tolerance"). A painted or generated background counts as solid wherever it shows furniture, walls, rails or props.
- No figure may stand in front of a painting until a solid map has been built for it. The map comes from the depth map, plus hand-marked shapes where needed.
- The same body and feet checks then run against that map on every frame. Feet may stand on painted floor only where the map says it is floor.
- Without a solid map, a painting is used only where nobody stands on or near painted objects: windows, sky, far views and empty openings.
- Every new technique is first shown on a sheet where the checks catch a deliberately planted error.

`world/painted.ts` has no solid map yet, so no figure may stand in front of it in a video.

## No footsteps (Jesper's decision, 19 November 2026)
"Ta bort ljudet som görs när personer går i videosen och shortsen helt, det låter inte bra."

There are no foot sounds in any film, Short or long video. That means no steps when walking or running, no scuff of a shoe, and no foot sound when someone steps or lands.
- The mixer (`audio/craft_sfx.py`) refuses the kinds `step` and `scuff`.
- The film check fails on any shot that schedules one.
- The delivered films that still have them are listed in granskning/stegljud/stegljud-i-levererade-filmer.md. They are remade only on Jesper's word.

## The light standard and dust over faces (Jesper's decisions, 19 November 2026)
The night cabin's light (granskning/malad-kajuta/kajuta-3d-v5.mp4, approved) is the standard for every new scene. It must work just as well in daylight and outdoors, with the sun as the light source and the sky as fill.

What every new scene has:
- **On the figures:** the scene's light (`CardLight`, film.light / shot.light). Warm from the light's side, as dark as the room where the light does not reach, and a thin cool edge from the other side.
- **The light source:** a real light with a glow.
- **In the air:** visible beams with dust in them (`world/air.ts`).

**Dust and light never cross a face.** The body check fails if a dust mote, or a patch of added light (a glow, rays, a shaft, a gleam), lies nearer the lens than a face and is drawn over it, on any frame. A glow is measured as drawn: a round out to three quarters of its half-size.

## The gesture library is approved (Jesper, 19 November 2026: "Ja till gestbladet")
`stage/gestures.ts` and the sheet (`shorts/gestureSheet.ts`, granskning/gestblad, commit df9573f) are approved. Films use these gestures.

The limits written on the sheet hold:
- the hand over the eyes is shown only from the side or obliquely from the side, 65 degrees or more;
- the flex is shown from the front or obliquely, 55 degrees, never straight side-on;
- kneeling, kneeling with a hand on the ground, and getting up read best three-quarter from the front;
- the stick on the shoulder is shown only from the front; from the side the stick points down;
- the handshake, pulling someone up and the hand on a shoulder are avoided. When the story is that action, it is shown as a close-up of the hands or as its result (lessons from the reference Shorts, 1).

## THE QUALITY GATE (Jesper, 19 November 2026; DAILY-RULES, at the top)
Nothing is built or sent that does not pass all six gates:
1. **Topic:** Jesper approves the topic. A 12-year-old must understand in one sentence why it is surprising, using known words. No specialist words in the title, the hook or the first ten seconds.
2. **Shot library:** a film uses only shot types that Jesper has approved as a 3-5 s test clip. Sitting is not approved until its clip is.
3. **Proof:** three deliberate faults are made, and the checks must stop every one: a figure sitting in the air above a seat, an arm locked straight out, and a foot inside a sofa. This is repeated whenever a check or a set changes.
4. **Risk sheet:** before the full render, Jesper sees one image of every moment where a figure touches something.
5. **Voice:** the voice chosen in the voice test.
6. **Review:** the review approves only what it can prove for each shot: every figure, every contact and the check result.

No new Short is built until gates 2, 3 and 5 exist.

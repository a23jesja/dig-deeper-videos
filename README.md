# Sir Digsworth videos

Rendered videos and the video engine for the YouTube channel **Sir Digsworth** (@SirDigsworth): forgotten and strange history, told by Sir Digsworth, an English gentleman (tweed cap, monocle, pipe, handlebar moustache, tweed jacket, waistcoat, bow tie, cane; voice: Kokoro `bm_george`).

Videos in `videos/` are public so Metricool can fetch them by raw URL:
`https://raw.githubusercontent.com/a23jesja/dig-deeper-videos/main/videos/<file>.mp4`

## Status 2026-11-16, night: the big build, step by step

The big build (DAILY-RULES.md "One big build, then the look is frozen") runs in steps A to G. This list is kept current.

| Step | State |
|---|---|
| A. Own character design | **Chosen by Jesper 2026-11-16** (his words, passed on by the review session: "Kör på det du sa men mustaschen kanske inte behöver vara så stor lite mindre bara", about the proposal "Sprattelgubben, men ge den Långskankens långa ben och breda mustasch"): direction 4, the jointed card puppet, with the long legs of direction 5 and a moustache of direction 5's shape but smaller. To solve in step B (review, `granskning/svar-A.md`): a silhouette that is ours in black, a face that reads at phone size, one clear accent colour, feet that hold, exaggerated poses. Sheet: `granskning/A/`. |
| B. Skeleton and views | **Approved by the review session 2026-11-16** (version 2). The chosen figure is one drawing that turns: every part of face, hat and clothes sits at an angle round the head or body and is projected by the view angle (`engine/src/craft/cast.ts`). Sir Digsworth and nine side characters from different eras, ages and builds are `Look`s on that one base (`looks.ts`); four-legged animals have their own skeleton in the same card-and-pin language (`beast.ts`). Sheets: `granskning/B/`, composition `CastViews`. Open: the dog's front and back views must be fixed before an animal is used in step D or F. |
| C. Motion, hands and mouth | **Approved by the review session 2026-11-16** (version 3, third round; Jesper has the clip and can still object; `granskning/C/testklipp.mp4`, `rorelseblad.jpg`, note in `granskning/klar-C.md`). `engine/src/craft/motion.ts`: footsteps planned in world space so feet cannot slide; stand, walk, run (with a moment in the air), stop, turn, step, stumble, fall (the hat flies off), get up by hands and knees, climb; moves carry on into each other without a rest pose (`keep`, `stumble({ fall })`, `getup({ into })`); acting layers with wind-up and overshoot (point, recoil, duck, carry, wind-up and release of a throw, sit, kneel, pull, pour) and `actAt` for gestures on spoken words; idle weight shift so nobody stands frozen; trailing sway for hem, skirt and chain; blink; mouth from the caption word timings. The skin is mirrored when a figure with a monocle faces left, so the monocle shows both ways. Checks before rendering: `node scripts/craft_check.mjs <clip>` (`src/craft/checks.ts`). Compositions `SirTest` and `SirMoves` (`engine/src/craft/SirMotion.tsx`, script in `sirTest.ts`). Not built: mouth shapes per sound. |
| **D. The world** | **In work.** The kit: `engine/src/craft/world/kit.ts` (toon material in three tones, black contour as an inverted hull, one sun with crisp shadows, figures as cards that cast shadows), `props.ts`, `people.ts` (the cast and animals as cards drawn for the angle they are seen from). The three daylight stills are of the Roman street (`pompeii.ts`, composition `PompeiiStills`), which is the first world of the new format; they have the cast in place but are not yet good enough to send. Also in the engine, for the ship world later: a wharf with a moored three-master (`boston.ts`, composition `BostonStills`, with a night light); known fault: the top of the ship's deck does not show from above. |
| E. Sound | Built: `engine/audio/craft_sfx.py` synthesises every effect and bed from sines and noise (step, scuff, thud, smash, coin, coin roll, blast, rumble, crack, tear, creak, whoosh, bark; wind, crowd, panic, fire) and places each on its frame; footsteps come from the motion itself (`Mover.cues()`), so sound and picture share one source. `node scripts/cues.mjs <name> <out.json>` writes a clip's cues (`engine/src/craft/cueList.ts`), `python audio/craft_sfx.py <cues.json> <out.wav>` mixes them with the voice to -14 LUFS. Camera shake on impacts: `shake()` in `motion.ts`. Source and licence of every sound: `engine/audio/SOUNDS.md` (all our own synthesis, nothing downloaded). Example: `granskning/E/ljudklipp.mp4` (the step C clip with its sound). No STOP on this step; it is reviewed with the film in step F. |
| F. The first Short in the new format | Not started. Jesper's new direction (2026-11-16 night, `DAILY-RULES.md` "The format: Why did they do that?"): every Short answers one strange-but-true question as a small scene of 25-40 s, in one place with two or three figures; eight per world (Roman street, sailing ship, medieval castle or town). Pompeii is not rebuilt (Jesper uploaded the existing Pompeii film himself, 2026-11-16) and the Boston Tea Party choice is withdrawn. Order: (1) twenty questions over the three worlds with answer, TRUE / MYTH / UNCERTAIN, two solid sources, first-second picture and tone, in `granskning/fragor.md`: STOP, Jesper chooses; (2) script and rough sketch for the first Roman question, reviewed; (3) full build, review at two frames per second, three thumbnails, Jesper's yes before publishing; (4) the other Roman questions one at a time; after eight, a proposal for joining them into a long video. |
| G. Freeze | **Jesper chose A on 2026-11-16, with a head about 25 % larger, larger eyes and mouth, and a side view that is the same man** ("Jag väljer A, sprattelgubben, med en ändring lånad från B"). The change is built (`looks.ts`: every head a quarter larger; `cast.ts`: larger eyes and mouth, `faceTurn` keeps the head turned 56 degrees toward the lens in side views) and the sheet `granskning/G-jamforelse/valblad-A.jpg` waits for the review session's approval; after it the look is frozen and B is removed. Background: before the freeze he asked to compare two figures (2026-11-16). Before the freeze he asked to compare a second skin on the same skeleton: the stick gentleman from his sheet (round white head, dot eyes, tweed cap, monocle with a thin chain, moustache, pipe, tweed jacket, mustard waistcoat, red bow tie, white gloves, thin black legs, cane), drawn in code in `engine/src/craft/gent.ts` on the unchanged `rig.ts` and `motion.ts`. Material: `granskning/G-jamforelse/jamforelse.mp4` (the test clip played by both skins side by side, composition `SirCompare`) and `vyblad-B.jpg` (composition `GentViews`), note in `granskning/klar-G-jamforelse.md`. The test clip is now one panel that any skin can play (`TestPanel` in `SirMotion.tsx`). Nothing is frozen until he has chosen. |

### Step A: where things are
- `engine/src/craft/rig.ts`: the skeleton, separate from every drawing. A pose holds joint angles and foot targets and no sizes, so the
  same pose fits every design; planted feet are solved from where the sole lands (the base for "feet never slide"). The skeleton is
  solved in 3D and turned by the view angle, so every view is equally tall and wide. Poses so far: stand, standSide, run, runCap,
  recoil, point, skid, stumble, throw, lunge.
- `engine/src/craft/ink.ts`: the pen (shapes with an ink line, a second flat tone, cut hatching, a tweed weave that moves with its
  part, eyes with lids, gaze and shine, hands as relaxed / open / fist / point / grip, the monocle and its thin chain).
- `engine/src/craft/designs/`: one file per direction (`mole`, `woodcut`, `pear`, `puppet`, `lanky`, `bighead`), `common.ts` (torso
  frame, limbs, shoes from every side, draw order) and `soft.ts` (a body set by numbers). After the choice the five others are removed.
- `engine/src/craft/SirDesigns.tsx`: the sheet. `PROPS='{"audio":false}' node scripts/stills.mjs SirDesigns out/craft/designs_ 0 0.5 jpeg`
  (all six) and `... SirDesign out/craft/design_ 0-5 1 jpeg` (one per picture).
- The work on the old figure in `engine/src/craft/toon.ts` is not used by any of this; the old films still build from it.

### Reviews
At each STOP the material is put in `granskning/<step>/` with `granskning/klar-<step>.md` (first line `VERSION: n`) and committed.
By Jesper's order of 2026-11-16 the review itself is done by the local review session `dig-deeper-videos-11` (it gets step, version
and file paths by message and answers GODKÄND or GÖR OM, three rounds at most); this replaces waiting for answer files on the branch
`claude/emu-short-cloud`. Only Jesper decides the character design in step A and whether a finished video is published.

## Status 2026-11-16, evening: what was built before the big build

Work was stopped here on Jesper's order ("Committa och pusha allt arbete till main nu, även det som inte är klart ... Bygg inget mer").
Read `DAILY-RULES.md` first, above all "One big build, then the look is frozen", "Our own character design", "Series paused,
stand-alone history Shorts now", "The world look" and "The craft kit".

### Decisions that now apply
- **One big build, about a week, then the look is frozen.** After it: one small improvement per video, no new style.
- **Own character design.** The figures used so far (round head, bean body, stick limbs) are retired: no new video is built with
  them until Jesper has picked a new design. Nothing below that draws the old figure is to be continued.
- **The series is paused.** Stand-alone history Shorts only; Pompeii becomes one stand-alone Short (no "Part 1", no "Part 2").
- Nothing is published without Jesper's yes on that exact video. Nothing is scheduled anywhere right now.

### Built, and where it is
| What | Where | State |
|---|---|---|
| The drawn cast (the OLD figure design), moved to shared code | `engine/src/craft/toon.ts` (`engine/src/videos/emu/toon.ts` only re-exports it) | Works; every existing film still passes its layout check. |
| Four views of the old figure: front, three-quarter, side, back, one entry `figure(pen, outfit, { view, dir, mode })` | `engine/src/craft/toon.ts` | Done and approved by Jesper as a sheet, but drawn on the retired design. The view logic (what turns, what is foreshortened, where the monocle, pipe, cane and chain sit) is the part worth carrying over. |
| The thin monocle chain (fixed to the frame's lower outer edge, arc outside the cheek, loop in the lapel's buttonhole, hidden by blanket and water) | `sirChain`, `chainBody` in `engine/src/craft/toon.ts` | Done, in the Titanic film that is uploaded. |
| Check sheets for the views | composition `SirViews` (`engine/src/craft/SirViews.tsx`); `PROPS='{"audio":false}' node scripts/stills.mjs SirViews out/craft/views_ 0,1,2 1 png` | Done. |
| Layout check with the rules of "Staging checks" and "Action, not portraits" | `engine/scripts/kit_check.mjs` (`node scripts/kit_check.mjs <film>`, `--selftest`) | Done. The block on Sir Digsworth's side view is lifted. |
| Pompeii, second build (26 shots, runs, falling awnings, cart, pots, grey pine-shaped column, dark at the end) | `engine/src/videos/emu/pompeii1b.ts`, `pompeiiset.ts`, `Pompeii1Film.tsx`, voice `engine/voice/pompeii-1v2/`, mix `engine/audio/pompeii1b_audio.py` | Withdrawn, never uploaded. Kept as working code: the shot helpers `frame()`, `runner()`, `town()` and the set's moving parts can be reused. The rendered file is on Jesper's PC only (`videos/shorts/2026-11-16-pompeii-part-1-short-v2.mp4`, 58 MB, not in git). |
| Titanic part 3 with the feet on top of the deck and the new chain | `engine/src/videos/emu/titanic3.ts`; file `videos/shorts/2026-11-16-titanic-part-3-short-v3.mp4` | Done; Jesper uploaded this file by hand. |
| Test sentence for a lip-sync clip ("I say! That mountain was not smoking yesterday.") | `engine/voice/kit-test.json`, `engine/voice/kit-test/` (voice.wav, words.json) | Voice and word timings made; not used yet. |

### Started, not finished (in `engine/src/craft/toon.ts`, type-checks, NOT looked at in a rendered picture)
- Mouth shapes for speech (`Viseme`, `viseme()`): drawn for front and side faces, but no option sets them yet and nothing turns
  word timings into shapes.
- Hand shapes (`HandShape`, `hand()`: fist, open, point, grip, hold): the function exists, no arm calls it yet.
- Eyes that look at things (`GAZE`) and a hat that lags behind the head (`CAPV`, plus the hair under a lifted hat): read by the
  drawing code, but no option sets them yet.
- Side characters' hats turned in the three-quarter view (peaked caps, shako, helmet, baker's cap, bowler ribbon): coded, not
  rendered or checked.
- Not started: the motion library, the test clip, the new world, the sounds on the picture.

All of the above sits on the old figure and mixes pose and drawing in one file. The new rule is a skeleton separate from the
drawing, so treat this code as a source of ideas for step B and C, not as the base to extend.

### What remains (Jesper's steps; stop and wait for his yes where it says STOP)
- **A. Own character design (sheet sent, see the table at the top).** Six clearly different directions for Sir Digsworth, drawn in code on one sheet: front, side, an
  action pose with weight, and next to a side character. Among them a mole or badger in tweed, people in woodcut style, a human
  with an own body shape, and three more. Limbs with shape and real hands and feet, eyes that can act, monocle, tweed cap,
  moustache and pipe kept, rim light in one picture, no model from any other channel or studio. One sentence per direction. STOP.
- **B. Skeleton and views.** A rig separate from the drawing; the chosen figure from the front, three-quarter, side and back; a
  shared base for side characters and animals with hats and clothes that turn right. View sheet. STOP.
- **C. Motion, hands and mouth.** Walk, run, stop, turn, stumble, fall, get up, duck, carry, throw, point, recoil, climb, sit,
  pour, pull; wind-up, overshoot, late follow-through, feet that never slide; hand shapes; mouth from the word timings; eyes
  that look and blink. A 15-second test clip. STOP.
- **D. The world** per "The world look": three daylight stills of a street in Pompeii. STOP.
- **E. Sound** on the picture, own synthesized or CC0 with the licence noted in the repo; camera shake on impacts.
- **F. Pompeii as one stand-alone Short:** script and rough sketch first. STOP. Then the full build, the review at two frames
  per second, three thumbnails.
- **G. Freeze:** write here which character design, skeleton and world apply; then ten proposals for stand-alone stories.

### Not in git (were on Jesper's PC before this work; left alone)
`.agents/`, `Figurblad/`, `engine/public/kit/`, `engine/public/three3d/`, `engine/public/mona/mix-long.wav` (112 MB, over
GitHub's limit), `engine/voice/` folders of other Shorts (deck-test, friday13, gta, mona-long, outage), `thumbnails/emu/`.

## The engine (from 2026-11-12)
`engine/` is a Remotion + three.js project: flat ink-outlined cartoon characters in a painted 3D world, with ink lines, lens blur, gliding cameras, word-by-word captions, a synthesized score and sound effects. It is built on the MIT-licensed [claude-animated-shorts](https://github.com/mromidev/claude-animated-shorts) engine (see `engine/LICENSE-claude-animated-shorts`). Everything renders locally and free: no AI video generator, no paid service. The earlier Python engine and its episode files are in the git history only.

```bash
cd engine
npm install                                         # once
pip install kokoro-onnx soundfile faster-whisper    # once; put kokoro-v1.0.onnx + voices-v1.0.bin in voice/models/
python voice/make_voice.py voice/emu-short.json voice/emu-short   # narration + word timings
python audio/emu_audio.py                           # music + sound effects + mix -> public/emu/mix.wav
node scripts/stills.mjs EmuShort out/emu/a_ 20,400,900 0.5        # look at stills first
npx remotion render src/index.ts EmuShort out/emu/final.mp4 --gl=angle --codec h264 --crf 20 --scale 1.3333
python scripts/review.py out/emu/final.mp4 out/emu/review 10      # every 10th frame on contact sheets
```

On Windows keep the project in a short path (long paths break the browser Remotion starts), pass
`--browser-executable "C:/Program Files/Google/Chrome/Application/chrome.exe"` and point `TEMP`/`TMP` at a scratch folder.
A 55 s short renders in about 3 minutes on a Radeon RX 9070 XT.

### Where things live (`engine/src/videos/<name>/`)
| File | What it holds |
|---|---|
| `story.ts` | frame of every spoken word, the shots, every camera move, depth of field |
| `scenes.ts` | what happens in each shot, frame by frame: who stands where, what lands on which word |
| `world.ts`, `props.ts` | the places and the 3D props (guns, truck, crates, farm, dam, scoreboard) |
| `toon.ts`, `emutoon.ts` | the drawn cast: Sir Digsworth, soldiers, farmer, emus |
| `Emu.tsx` | the composition: post effects, captions, sound |
| `voice/`, `audio/` | narration script and the sound track generator |

## Films made with the new engine

| Date (Stockholm) | Film | Composition | File |
|---|---|---|---|
| Thu 12 Nov 22:26 | The Great Emu War (short) | `EmuShort` | `videos/shorts/2026-11-12-great-emu-war-short.mp4` |
| Fri 13 Nov 00:00 | The Army That Lost a War to Birds (3:08) | `EmuLong` | `videos/2026-11-13-army-that-lost-a-war-to-birds.mp4` |
| Fri 13 Nov 12:00 | The Bear Who Joined the Army (short) | `WojtekShort` | `videos/shorts/2026-11-13-wojtek-bear-soldier-short.mp4` |
| Fri 13 Nov 17:00 | The Bear Who Joined the Army (3:07) | `WojtekLong` | `videos/2026-11-13-bear-who-joined-the-army.mp4` |
| Sat 14 Nov 17:00 | The Pig War (short) | `PigShort` | `videos/shorts/2026-11-14-pig-war-short.mp4` |
| Sat 14 Nov 23:00 | The Pig War (3:03) | `PigLong` | `videos/2026-11-14-the-pig-war.mp4` |
| Sun 15 Nov 18:00 | The Man Who Sold the Eiffel Tower (short) | `LustigShort` | `videos/shorts/2026-11-15-eiffel-tower-con-short.mp4` |
| Sun 15 Nov 21:00 | The Man Who Sold the Eiffel Tower (3:03) | `LustigLong` | `videos/2026-11-15-man-who-sold-the-eiffel-tower.mp4` |
| not published yet | The Man Who Stole the Mona Lisa (10:10) | `MonaLong` | rendered locally to `engine/out/mona/final.mp4`, waiting for approval |

Every film is timed from its narration: shots start on spoken words (`at(line, word)` in `engine/src/videos/emu/story*.ts`),
so the picture, the captions and the sound cues all follow the voice. Checked facts are in `engine/SCRIPT-*.md` and `engine/FACTS-*.md`.

### Long films from a shot list (from the Mona Lisa film, 2026-11-13)
A 10-15 minute film has over a hundred shots, so each shot is one entry in a list: the word it starts on, the place,
the camera and what happens (`engine/src/videos/emu/monaShots1.ts, 2, 3, 3b, 4, 4b`, with `monaProps*.ts` for the
drawings only one part needs). `monaKit.ts` holds the helpers (people, walks, cards, bubbles that point at their
speaker, things held in hands, camera presets), `monaSets.ts` the places and what hangs on their walls, `storyM.ts`
turns the list into the engine's tables, `monacast.ts` and `monatoon.ts` hold the cast and the shared drawings. The
interiors and the countryside are the zone `louvre` in `world.ts`, one place every 60 m.

Before a render: `node scripts/card_check.mjs` must come back clean (cards inside the frame, clear of the captions, of
faces and of each other), and every shot is looked at in full size, not on a contact sheet. `MonaFlat` draws the same
shot list as a flat 2D cartoon in about a second a frame (`flat2d.tsx`): a quick preview of where everything stands.

```bash
cd engine
python voice/make_voice.py voice/mona-long.json voice/mona-long            # narration + word timings
python scripts/talk.py voice/mona-long/voice.wav <frames> src/videos/emu/talkM.json
python scripts/mona_shots.py voice/mona-long/words.json <frames> out/mona/shots.json src/videos/emu/monaShots*.ts   # checks every word reference
node scripts/shot_stills.mjs MonaLong out/mona/shots.json out/mona/st 1 132 0.25 3 && python scripts/shot_sheet.py out/mona/st out/mona/sheet_ 9
python audio/mona_long_audio.py                                            # music + effects -> public/mona/mix-long.wav
node scripts/card_check.mjs                                                # layout check, must be clean
python scripts/render_film.py MonaLong out/mona <frames> public/mona/mix-long.wav 1500   # chunks of 1500 frames, then joined with the sound
python scripts/render_film.py MonaLong out/mona <frames> public/mona/mix-long.wav 1500 3,7   # after a fix: only chunks 3 and 7 again
```
Set `REMOTION_TMP` (for the stills scripts) and `TEMP`/`TMP` (for the render) to a scratch folder first.
Thumbnails: `MonaThumb` (three variants on frames 0-2; frames 3-13 are previews of the sets) rendered with
`PROPS='{"audio":false,"captions":false}'`, then `scripts/thumb2.py` (dark letters on a cream card, the film's own card style).
Checked facts and the approved script: `engine/FACTS-mona-lisa.md`, `engine/SCRIPT-mona-lisa.md`.

## The rules (Jesper)
1. **Quality first.** Reference level is the short https://youtube.com/shorts/SRV3V6seY38. Rather fewer videos than a bad one.
2. **Everything that is said is shown**, with the exact count: "one major, two soldiers, two machine guns" means exactly that on screen.
3. Nothing off-frame, colliding, lagging, shaking or misplaced. Captions never cover a face or the thing being talked about.
4. Every scene has its own built place with light and depth; the camera alternates wide, close and insert.
5. Movement looks natural (feet planted, real gaits, real pecking).
6. Funny and entertaining, simple to follow, no unnecessary information. The thumbnail and the first 3-5 seconds decide everything.
7. Every fact is checked against sources before the script is locked (see `engine/SCRIPT-*.md`).
8. Low background music that fits the topic.

## Workflow
10 ideas -> Jesper picks -> script -> video. Shorts under 60 s, long videos 3-4 minutes.
Before anything is shown: render the whole video and review at least every 10th frame of every scene, and check every sentence against the picture.
**Nothing is published or scheduled until Jesper has approved that exact video.**

## Publishing (after approval)
Push the mp4 (under 100 MB) to `videos/`, use the raw URL as media in Metricool (blogId 8016995, Europe/Stockholm, free plan: 20 posts a month).
The description contains `https://www.youtube.com/@SirDigsworth?sub_confirmation=1`.

## Growth log
`GROWTH.md`: one line per video; read it before choosing a new topic.

## The 2D stick-figure films (approved look, 2026-11-14)
`engine/src/videos/style2d/`: `fig.tsx` draws the stick figure as SVG, `scenes.tsx` holds every scene as data (what is
on screen at each frame), `Mona2D.tsx` draws it in three parallax layers with captions, `check.ts` checks the layout
on the same data. Backgrounds are painted locally in ComfyUI over our own layouts (`scripts/bg_layouts.py`,
`scripts/comfy_img2img.py`). This part has its own entry point, so it builds without the older 3D files:

```bash
cd engine
python voice/make_voice.py voice/mona-short.json voice/mona-short     # narration + word timings
python audio/mona_short_audio.py                                      # public/mona/mix-short.wav
npx esbuild src/videos/style2d/check.ts --bundle --platform=node --outfile=out/2d/check.cjs --loader:.json=json && node out/2d/check.cjs   # must print LAYOUT OK
npx remotion render src/index2d.ts Mona2D out/2d/mona-2d.mp4 --concurrency=8
```

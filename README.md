# Sir Digsworth videos

Rendered videos and the video engine for the YouTube channel **Sir Digsworth** (@SirDigsworth): forgotten and strange history, told by Sir Digsworth, an English gentleman (tweed cap, monocle, pipe, handlebar moustache, tweed jacket, waistcoat, bow tie, cane; voice: Kokoro `bm_george`).

Videos in `videos/` are public so Metricool can fetch them by raw URL:
`https://raw.githubusercontent.com/a23jesja/dig-deeper-videos/main/videos/<file>.mp4`

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

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

Every film is timed from its narration: shots start on spoken words (`at(line, word)` in `engine/src/videos/emu/story*.ts`),
so the picture, the captions and the sound cues all follow the voice. Checked facts are in `engine/SCRIPT-*.md` and `engine/FACTS-*.md`.

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

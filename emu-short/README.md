# The Great Emu War – short (built in a cloud session, 2026-11-12)

Remotion + three.js project based on the `claude-animated-shorts` skill (MIT). Not rendered in full yet.

- `src/videos/emu/` – the short: `story.ts` (15 shots, cameras, lens), `cast.ts` (staging of every shot, prop poses),
  `world.ts` (wheat field, fence, farm, dam, road, lorry, Lewis guns, brass heap, scoreboard), `critters.ts` (emus),
  `toon.ts` (people, Sir Digsworth, slouch hats), `Emu.tsx` (composition + post chain), `talk.ts` (narrator lip-sync).
- `src/videos/bridge/` – the skill's original bridge short, kept as reference.
- `src/kick.tsx` – forces a render after the post composer mounts (stills were blank without it).
- `voice/` – script, Kokoro `bm_george` voice (58.5 s), line and estimated word timings (`gen.py` needs the Kokoro model files in `voice/models/`).
- `audio/make.py` – synthesised music + SFX + voice -> `audio/mix.wav` (48 kHz, 59.0 s). Not listened to by anyone yet.
- `scripts/stills.mjs` – `node scripts/stills.mjs EmuShort out/e_ 40,300,540 0.5`
- `scripts/chunks.mjs` – full render in 30-frame chunks to `out/chunks/` (run with parity 0 and 1 in two processes).
- `scripts/sheet.mjs` + `src/sheet.tsx` – 2D test sheets of the cast.

Setup: `npm install`, then edit the browser path / `gl` option in `scripts/*.mjs` for your machine
(they are set for a GPU-less Linux container: `/opt/pw-browsers/chromium`, `gl: "swangle"`; on a GPU use `gl: "angle"`).
Composition: `EmuShort`, 1080x1920, 30 fps, 1770 frames. Mux: `ffmpeg -i video.mp4 -i audio/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k final.mp4`.

Known open points: only stills of every shot were reviewed, plus the first 2 s in motion; facts were checked against
search snippets only (Wikipedia was unreachable); Kenney GLB props are not included (loader tolerates that).

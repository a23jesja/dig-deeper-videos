# Sir Digsworth videos

Rendered videos and the video engine for the YouTube channel **Sir Digsworth** (@SirDigsworth, renamed from "Dig Deeper" on 2026-11-12). Earlier episodes used Chloe the Mole.
Videos in `videos/` are public so Metricool can fetch them by raw URL and publish them to YouTube.

## Make a video

```bash
bash engine/setup.sh                       # once per machine: pip packages + Kokoro voice model
python3 engine/render.py episodes/<file>.json videos/<file>.mp4 --preview   # stills only, fast
python3 engine/render.py episodes/<file>.json videos/<file>.mp4             # full render (~2 min)
```

Raw URL for Metricool: `https://raw.githubusercontent.com/a23jesja/dig-deeper-videos/main/videos/<file>.mp4`

## Episode format (`episodes/YYYY-MM-DD-slug.json`)

See `episodes/2026-11-11-how-do-plants-drink.json` for a complete example.

- `host` – `"stick"` = **Sir Digsworth**, the channel's stickman English gentleman (use for all new videos, voice `bm_george`) or `"chloe"` (old mole mascot).
- `mascot` – `true` (default) shows the host; `false` = no mascot (documentary/explainer style). Pick per topic.
- `intro_bg` / `intro_emoji` – background and big emoji for intro/outro (emoji used when `mascot` is false). `outro_text` – optional.
- `thumbnail` – `{text (2–4 punchy words), emoji, bg, color, mascot}`; render with `--thumb out.jpg`.
- `audience` – `"kids"` or `"general"` (decides YouTube madeForKids).
- `title` – shown on the intro card. `voice` – `af_heart` for Chloe/kids; for documentary style `bm_george` (British male) or `am_michael`. `speed` – 0.95. `seed` – any int (varies the music).
- `youtube` – `title` (under 60 chars + " | Chloe the Mole" is fine), `description`, `tags` (10).
- `scenes` – 12–15 scenes, about 300–360 words total (~1:40–2:10 at speed 1.12). Follow "Keep it SIMPLE" below.

Scene fields:
- `style` – defaults to `sketch` for the stickman (since 2026-11-11): bright warm hand-drawn look like the big viral stick-figure explainers — cream paper tone, ink outlines on everything, peach/pastel skies, warm wooden rooms, big expressive head, mitten hands, emoji props with ink outlines. `noir` (dark, desaturated) still exists but don't use it. Prefer backgrounds that have warm sketch versions: `room`, `corridor`, `meadow`, `forest`, `desert`, `night` (others work but are less on-style).
- `bg`: `corridor` (empty mall/hall interior), `room` (interior with tables), `desert`, `volcano`, `city`, `snow`, `lab`, `mystery`, `meadow`, `split` (sky top, soil cross-section below the grass at y=0.42), `underground` (tunnel), `sky`, `space`, `ocean`, `forest`, `night`.
- `narration`: what Chloe says (lip-synced, also shown as subtitles).
- `chloe` (the host's settings, also used for the stickman; ignored when `mascot` is false; `hide: true` hides her in one scene): `action` one of `idle, walk, run, dig, jump, wow, think, wipe, wave, dizzy, swim, sleep, shiver` (stickman also: `point, shrug`);
  `x` (0–1), optional `to` (0–1, for walk/run/dig/swim), `facing` (1 right / -1 left), `size` (default 0.85),
  `ground` (0–1, override where her feet are; use 0.72 to put her under the soil in `split`),
  `say` (short bubble text, 1–3 words), `say_at` (0–1 of scene), `thought` (true = thought bubble).
- `fact`: `{label, text, at}` – big "Did you know?" card at the top. Use 2–3 per episode.
- `props`: list of
  - emoji: `{emoji, x, y, size, anim, at, count, to, move_time, layer}`
  - big text: `{text, x, y, size, color, anim, at}`
  - `{kind: "roots", x, top, length, seed}` – plant roots with root hairs; `{kind: "stem", x, y0, y1}`.
  - `anim` combine with `+`: `pop, fade, grow, float, bounce, spin, wobble, shake, pulse, move (needs to), drop`.
  - `at` = start time as fraction of the scene. `layer: "back"` draws behind Chloe.
  Keep props away from the subtitle strip (y > 0.85) and the fact card (y < 0.3 when a fact is showing).

## Thumbnail
`python3 engine/render.py episodes/<file>.json videos/<file>.jpg --thumb`

## Growth log
`GROWTH.md` – after every run, append the video, topic, and what the analytics showed for earlier videos. Read it before choosing a new topic.

## Keep animations clean (no glitches)
- Only pick topics that can be told with the built-in backgrounds, Chloe's actions and emoji props. Skip topics that need specific people, maps, machines, logos or detailed diagrams.
- Max 3 props per scene, and at most 1 moving prop (`move`) per scene. Never stack props on top of each other or on Chloe (keep ≥0.15 apart in x or y).
- Props stay inside x 0.1–0.9 and y 0.2–0.8; nothing behind the fact card (y < 0.32) while it shows, nothing in the subtitle strip (y > 0.82).
- Short speech bubbles only (1–3 words). One fact card per scene at most.
- Don't edit engine/render.py during a run — only write the episode JSON. If something looks broken in the preview, simplify the scene instead.

## Emoji to avoid (they render as square picture tiles)
🌠 🌉 🏙️ 🌃 🌆 🌇 🎆 🎇 🏞️ 🌄 🌅 🗾 🎑 — use ⭐ ✨ ☄️ 🔩 🔦 etc. instead. Check every emoji in the preview.

## Video size
The engine caps bitrate (~2.5 Mbps) so a 2–2.5 min video is ~25–50 MB. GitHub rejects files over 100 MB — check with `ls -lh` before committing.

## The first 3–5 seconds (most important part of the video)
- No logo intro: the video opens directly on scene 1 (`intro` defaults to false). Never set `intro: true`.
- Scene 1 = the hook. Its first sentence states the shocking question or claim in under ~5 seconds. No greetings first.
- Scene 1 gets a big hook text prop visible from frame 0: `{"text": "EVERYONE GONE?", "x": 0.5, "y": 0.24, "size": 88, "anim": "pulse", "at": 0.0, "color": "#ffd23f"}` (2–3 words), plus Sir Digsworth reacting (`wow`/`shiver`/`dizzy`) and at most one object prop.
- Scene 2 introduces "I'm Sir Digsworth" and opens a curiosity loop.
- Every scene has a slow camera push-in automatically; scene 1 also snaps in.

## Thumbnails (as important as the title)
- `thumbnail`: `{text, emoji, bg, color, color2}` – 2–3 huge words (line 1 white, line 2 yellow), ONE big object emoji that IS the subject (glowing, red circle around it), Sir Digsworth large on the right with a shocked face (drawn automatically).
- Text must add curiosity to the title, not repeat it word for word (title: "What If Every Human Vanished Tomorrow?" → thumbnail: "EVERYONE GONE?!").
- After rendering, downscale the thumbnail to 320x180 and look at it: the words and the object must still be readable at that size.

## Shorts (vertical 1080x1920)
Add to the episode JSON:
`"shorts": [{"title": "EVERYONE GONE?!", "start_scene": 0, "max": 52, "yt_title": "What If Every Human Vanished? #Shorts"}]`
Render: `python3 engine/render.py episodes/<file>.json videos/shorts/<name>-short1.mp4 --short --index 0` (add `--preview` for stills).
The Short = the episode's scenes from `start_scene` up to ~`max` seconds (cut at a scene boundary), shown in the middle with a big hook title on top, big subtitles below and a 3 s "Want the full story?" end card. Scene 1 must hook within the first second. Check frames at 0 s, 1 s, 20 s and the end.

## Viral story recipe (learned from cartoon explainer Shorts with 18M+ views)
1. An impossible-sounding opening claim (true!).
2. Escalating scenes – each one raises the stakes or the weirdness.
3. A laugh beat (Sir Digsworth's dry reaction, slapstick).
4. A "You see…" explanation that makes it click.
5. A closing line that flips or pays off the opening claim.
- Fast narration: `speed` 1.12 (~200+ words per minute). Long video ≈ 300–360 words (see "Keep it SIMPLE"); the Short (first scenes) should hit ~60–65 s.
- Captions are automatic kinetic 2–3-word pops (yellow when a word has numbers or is in CAPS — use CAPS for one key word per scene).
- Camera is always moving; every cut has a punch-in and whoosh; big text slams with a thud.

## Keep it SIMPLE (most important writing rule, from 2026-11-12)
Most viewers click on videos that are easy to understand and don't waste time. Explain everything so a 10-year-old gets it on the first listen.
- **One question, one clear answer.** The whole video answers exactly one question. Cut every side fact, extra date, name or number that does not help answer it.
- **Max 4–5 key facts** in a long video, **2–3 in a Short**. Better to explain one fact well than mention five.
- **Short sentences** (about 12 words or fewer) and **everyday words**. No jargon; if a science word is truly needed, explain it right away in a few plain words ("ablation — the rock melting away").
- **One idea per scene**, and the picture shows exactly what is being said.
- **Everyday comparisons** instead of raw numbers: "smaller than a grain of sand", "as fast as 200 race cars". Max one number per scene, rounded ("about 70 km per second", not "71.3").
- **The "You see…" explanation is 2–3 simple sentences** with one comparison.
- **Repeat the key idea once** near the end in one sentence, so nobody leaves confused.
- Shorter is fine: long videos ~300–360 words (≈1:40–2:10 at speed 1.12), Shorts answer one thing in ~45–60 s.
- Test before rendering: read the script aloud — if any sentence needs a second read to understand, rewrite it simpler.

## Background music (generated in code, royalty-free)
- Every video gets low background music that ducks under Sir Digsworth's voice. It is synthesised by the engine, so there is no copyright risk.
- Mood is picked automatically from the scene backgrounds (space/sky/night → `space`, mystery/underground/corridor/lab → `mystery`, volcano/desert/ocean → `epic`, meadow/forest/snow → `calm`, room/city/split → `playful`).
- Override with `"music": "playful" | "mystery" | "space" | "epic" | "calm" | "none"` and `"music_volume": 1.0` (e.g. 0.7 = quieter). Pick the mood that fits the topic.


## 3D look (default since 2026-11-12)
- The stickman host is rendered in a **3D cel-shaded world** with three.js (vendored in `engine/three/`), driven frame by frame in headless Chrome by `engine/three3d.py`. Captions, big text, fact cards, speech bubbles and effects are 2D overlays on top. `style` defaults to `3d` for `host: "stick"` (`sketch` = old flat look, don't use).
- Every background has its own 3D world: `meadow`, `forest`, `desert`, `night`, `space`, `sky` (cloud platform), `ocean` (beach island), `snow`, `volcano`, `city`, `lab`, `room`, `corridor`, `mystery`, `underground` (`split` = meadow).
- Emoji props become 3D billboard sprites at the same x/y as before (use `"layer": "back"` to push one deeper into the scene). The camera pushes in, orbits slowly, whips on cuts and shakes on text slams automatically.
- Sir Digsworth stands where `chloe.x` says (0–1 across the screen); `chloe.size` is ignored below 1.3 (he is always full size in 3D). Keep props at x ≥ 0.55 when he stands at x ≈ 0.3.
- Rendering is slower than 2D (~0.25 s per frame): a long video takes ~20 min, a Short ~10 min. Run renders in the background (`nohup … &`) and poll the log instead of one long blocking command.
- Branding: channel name is **Sir Digsworth**; YouTube titles end with ` | Sir Digsworth`; descriptions/Short texts say "Full investigation on the Sir Digsworth channel."

## MOTTO (Jesper, 2026-11-12): FUNNY and ENTERTAINING first, with exciting explanations
Every video and Short must make people smile within the first 10 seconds and keep them curious to the end. This outranks cramming in facts.
- **A joke or funny moment in at least every second scene**: Sir Digsworth's dry British one-liners, overreactions (wow/jump/dizzy), a silly prop (a rubber duck, a sandwich, a cow), an absurd comparison ("that's 40 million double-decker buses"), or things going slightly wrong for him.
- **A running gag per video** that pays off at the end (he keeps losing his hat, a pigeon keeps following him, his tea goes cold…).
- **Explanations as mini-stories with stakes** ("here's where it gets strange…", "and then it gets worse") instead of textbook sentences.
- Speech bubbles are for punchlines ("Oh dear.", "Splendid!", "Not again."), not for facts.
- Professional edit: calm steady camera, he stands still and gestures gently while talking (the engine handles this — never use `shiver`), one prop at a time appearing exactly when it is mentioned (`at` matched to the word), nothing overlapping, and a punchy cut every 6–10 seconds.


## THE STANDARD (from 2026-11-12): cartoon "toon" style + SHOW what is said
This replaces every earlier look. `style` defaults to `toon` for `host: "stick"`: flat ink-outlined cartoon characters (drawn with the character
library in `engine/toon/toon.ts`, adapted from the MIT-licensed claude-animated-shorts skill) standing in the colourful 3D worlds.
Reference episodes: `episodes/2026-11-13-emu-war.json` (long) and `episodes/2026-11-12-short-emu-war.json` (Short). Copy their structure.

**Rule number one (Jesper): everything Sir Digsworth says must be SEEN.** Each sentence gets its own visual beat, timed with `at`/`until`:
if he says the emus ate the wheat, an emu pecks and the wheat disappears; if the gun jams, it fires, stops and smokes; if the army goes home, soldiers march off screen.
Never leave a static line-up of characters while the narration describes action. Sir Digsworth is the narrator: show him in about half the scenes
as the commentator (reaction + 1–3 word speech bubble), and hide him (`"chloe": {"hide": true}`) in pure action scenes so the action has the stage.

### Scene format additions
`"cast": [ {...}, ... ]` — cartoon characters and drawn props, each:
- `kind`: `sir` is automatic (from `chloe`). People: `soldier`, `officer`, `farmer`, `farmer2`, `minister`. Animal: `emu` (`mode`: stand / run / eat; `opts.helmet`).
  Drawn things: `gun` (`fire: [from, to]` fractions of the scene, `jam_at`), `wheat` (`anim: {"eaten": [0, 1, from, to]}`), `fence` (`opts.broken`), `rabbit`, `truck` (`bumpy`), `crate` (`opts.label`).
- `x` (0–1 across the 16:9 frame; the Short maps it automatically), `gy` (0.9 = front, 0.8 = further back and smaller), `h` (height in metres), `flip` (face left).
- `count`, `spacing`, `rows` (crowds), `at` / `until` (fractions of the scene when it appears / disappears), `to` + `move_time` (+ `linear`) to walk/run/drive across,
  `expr` (neutral, stern, smile, smile_closed, grin, laugh, shock, nervous, relief, dazed, pained), `act` (cheer, shrug, point, bounce).
- To change a pose mid-scene, use two entries: one with `until: 0.5`, one with `at: 0.5`.
- `chloe.action` for Sir Digsworth: idle, point, wow, jump, shrug, think, wave, wipe, dizzy, laugh, stern, walk/run with `to`; `chloe.expr` overrides the face.
- Emoji props still work for small extras, but prefer drawn `cast` kinds for anything important.

### New topics need new drawings
Every topic needs its own cast and props. You MAY add new `kind`s: people are a new entry in `OUTFITS`, animals and things are a small `drawXxx(p, o, t)`
function using the `Pen` API (poly, ell, stroke, dot, arc — see `drawEmu`, `drawTruck`, `drawWheat` in `engine/three/scene.html`) plus one line in `drawCard`.
Draw on the 600x1000 canvas with the feet at y = 975, thick dark outlines (9–12 px), flat colours. Render a test sheet and LOOK at it before using it.
Do not change anything else in the engine.

### Staging rules
- Portrait Shorts fit about 3 characters across: front row at x 0.1 / 0.4 / 0.7, extras further back (`gy` 0.8) and smaller.
- Sir Digsworth stands at x ≈ 0.12–0.2 when present; action happens at x 0.4–0.9.
- Big words (`props` with `text`) at y 0.2–0.4; never more than two at once.
- Preview every scene at two moments (35 % and 92 %) and check that the picture alone tells the story.

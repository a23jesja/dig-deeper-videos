# Dig Deeper videos

Rendered videos and the video engine for the YouTube channel **Dig Deeper** (Chloe the Mole).
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
- `scenes` – 11–14 scenes. Chloe narrates in first person to "friends"/"diggers". About 280–330 words total gives ~1:45–2:00.

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
- Fast narration: `speed` 1.12 (~200+ words per minute). Long video ≈ 380–430 words; the Short (first scenes) should hit ~60–65 s.
- Captions are automatic kinetic 2–3-word pops (yellow when a word has numbers or is in CAPS — use CAPS for one key word per scene).
- Camera is always moving; every cut has a punch-in and whoosh; big text slams with a thud.

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

- `title` – shown on the intro card. `voice` – always `af_heart` (Chloe). `speed` – 0.95. `seed` – any int (varies the music).
- `youtube` – `title` (under 60 chars + " | Chloe the Mole" is fine), `description`, `tags` (10).
- `scenes` – 11–14 scenes. Chloe narrates in first person to "friends"/"diggers". About 280–330 words total gives ~1:45–2:00.

Scene fields:
- `bg`: `meadow`, `split` (sky top, soil cross-section below the grass at y=0.42), `underground` (tunnel), `sky`, `space`, `ocean`, `forest`, `night`.
- `narration`: what Chloe says (lip-synced, also shown as subtitles).
- `chloe`: `action` one of `idle, walk, run, dig, jump, wow, think, wipe, wave, dizzy, swim, sleep, shiver`;
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

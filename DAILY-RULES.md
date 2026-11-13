# Daily rules (Jesper, 2026-11-13)

Applies to every production session for the Sir Digsworth channel, on top of README.md and GROWTH.md.

## Every day
1. **Search the day's news first.** Find what happened today, in any field (tech, business, sport, science, politics, entertainment).
   If something big, funny or important happened, make **one Short about it the same day**.
2. **Search what is trending.** Find the topics, videos, Shorts and events that are trending today (live charts, not memory)
   and make our own version of the topic for this channel, told by Sir Digsworth with our own script, pictures and jokes.
3. **Output target: 2 Shorts per day** (changed by Jesper 2026-11-13 from "4 Shorts and 1 long video"):
   one about the day's news when something big, funny or important happened, one on a trending topic.
   Long videos are not part of the daily quota; make them when Jesper asks for one.

## Always
- Sir Digsworth narrates everything; our own touch, never a copy of someone else's script, footage, music or thumbnail.
- Every fact is checked against at least two named sources before the script is locked. News about real people is
  reported as what named outlets say ("the New York Times reported"), never stated as our own claim.
- Nothing is published or scheduled until Jesper has approved that exact video.

## Thumbnail (as important as the video, Jesper 2026-11-13)
Every video and Short gets its own thumbnail, made and checked before the video is sent for approval.
- **Three variants** are rendered and sent to Jesper together with the video; he picks one. Nothing is published
  with a thumbnail he has not approved.
- **One idea, readable in one second:** one big subject that IS the story, Sir Digsworth large with a clear reaction
  (shock, glee, suspicion), and 2-3 huge words at most. The words add curiosity to the title, never repeat it.
- **Rendered by our engine** at 1280x720 for long videos and 1080x1920 for Shorts, from the same world and characters
  as the video. No photos, logos, screenshots or other channels' images. Real people only as our own cartoon.
- **Honest:** the thumbnail shows something that is actually in the video. No fake arrows to nothing, no invented
  events, no shock imagery.
- **Checks before sending:** look at each variant shrunk to 320x180 and to 168x94; the words and the subject must
  still read. Check contrast on both dark and light backgrounds, nothing important in the bottom-right corner
  (the duration badge covers it), and for Shorts nothing important in the top and bottom 15 % (interface covers it).
- **Compare:** look up the current top results for the same topic and make sure ours does not look like any of them
  and stands out next to them.
- For Shorts the first frame of the video must work as a thumbnail too: no black, blank or mid-transition frame.

## No strikes (hard rule, Jesper 2026-11-13)
"Recreate a trend" means our own version of the TOPIC. Before a video is sent to Jesper, check every point:
- **Footage:** every frame is rendered by our own engine. No clips, screenshots, logos or thumbnails from other
  channels, TV, news sites or social media.
- **Script:** written from scratch from the facts. Never transcribe, translate or paraphrase another video line by line,
  and never copy its shot order, title or thumbnail layout.
- **Sound:** only our own synthesised music and effects and the Kokoro voice. No commercial songs, no "trending sounds",
  no audio lifted from other videos.
- **Real people:** drawn in our own cartoon style, never photos or real footage. No voice imitation of a real person.
  Claims about them are attributed to named outlets.
- **Trademarks:** company names may be said; their logos and product artwork are not reproduced.
- **Not allowed as topics:** fresh tragedies, graphic violence, medical or financial advice, anything aimed at a
  private individual.
- If any point is uncertain, the video is not sent for approval; say what was uncertain instead.

## Tools worth trying (found by search 2026-11-13, not yet installed or tested)
- `npx skills add remotion-dev/skills` – Remotion's official agent skills. Install locally on each machine; do not commit
  them (their repository has no licence file).
- `digitalsamba/claude-code-video-toolkit` – Remotion/Manim, FFmpeg post-processing, YouTube clipping skills.
- faster-whisper or whisper.cpp – real word timings from the voice track (the cloud build had to estimate them).
- Live trend charts: kabo.sh/trending/youtube, shortstrends.com, veedio.co/trending/youtube-shorts, youtube.trends24.in/shorts.
- `sasharun/awesome-faceless` (tool list) and `Dark2C/Viral-Faceless-Shorts-Generator` (trend -> script pipeline, as reference).

## Licences (checked 2026-11-13)
- **Remotion:** free licence covers individuals and for-profit organisations with up to 3 employees, commercial videos
  included. A company with more than 3 employees needs a paid company licence.
- **claude-animated-shorts (engine base):** MIT. Keep the licence file next to the code. Its reference frames are
  "for style study only": never commit or publish them.
- **claude-code-video-toolkit skills:** MIT, licence file in `.claude/skills/`.
- **three.js, React, react-three-fiber, postprocessing, TypeScript, kokoro-onnx, faster-whisper, moviepy:** MIT / Zlib / Apache-2.0.
- **Kokoro-82M voice model:** Apache-2.0 per its model card (seen via search, not read directly).
- **Not allowed for this channel:** anything marked non-commercial (for example the Qwen-Image-2.1 option in `qwen-edit`),
  stock music or sound libraries, and the paid services (ElevenLabs, RunPod).

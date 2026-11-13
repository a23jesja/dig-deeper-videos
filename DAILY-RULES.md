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
- `npx skills add remotion-dev/skills` – Remotion's official agent skills (`remotion-best-practices`).
- `digitalsamba/claude-code-video-toolkit` – Remotion/Manim, FFmpeg post-processing, YouTube clipping skills.
- faster-whisper or whisper.cpp – real word timings from the voice track (the cloud build had to estimate them).
- Live trend charts: kabo.sh/trending/youtube, shortstrends.com, veedio.co/trending/youtube-shorts, youtube.trends24.in/shorts.
- `sasharun/awesome-faceless` (tool list) and `Dark2C/Viral-Faceless-Shorts-Generator` (trend -> script pipeline, as reference).

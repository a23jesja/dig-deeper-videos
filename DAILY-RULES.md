# Channel plan and rules (Jesper, rewritten 2026-11-13)

Applies to every production session for the Sir Digsworth channel, on top of README.md and GROWTH.md.
This replaces the earlier "2 Shorts per day about news and trends" rule.

## Goal
Within one year: about 1 million long-video views a month, enough for at least 50,000 SEK a month from ads and
memberships. (Estimate: 0.6-1.6 million views at 3-8 USD per 1,000. Shorts alone would need 60-150 million.)

## One niche
Bizarre and forgotten history, told by Sir Digsworth. Every video, long or short.
- **News and trends only choose WHICH history we tell.** Each working day, search the day's news and what is trending
  on YouTube, then look for the historical story that mirrors it ("this has happened before"). A scandal becomes a
  forgotten scandal of the same kind; a trending build video becomes history's strangest building.
- Never make a pure news video, and never comment on today's allegations about living people.
- Mix narrow oddities with broad topics many people search for (the whole story of a war, an empire, an invention).
- Prefer angles advertisers accept: avoid war crimes, Nazi imagery and graphic violence in titles and thumbnails.

## Long videos are the product
- **Length: 10-15 minutes, never under 8** (mid-roll ads need 8 minutes).
- **Pace: two a month to start, one a week once the pipeline is fast.** Never trade quality for pace.
- Workflow: 10 ideas -> Jesper picks -> sources -> script -> Jesper approves the script -> voice -> scenes -> render ->
  review -> Jesper approves the video and thumbnail -> publish.
- The script decides everything: hook in the first 15 seconds, a question that stays open, a turn every 60-90 seconds,
  a payoff at the end. Simple words, short sentences, one idea per scene.
- Reuse and extend the built worlds, props and cast between videos so each new video gets cheaper to make.
- Look: strong light with a clear source, one colour mood per scene, exaggerated faces, deep backgrounds.

## Shorts are advertising for the long videos
- **3-5 a week.** Each one is a self-contained hook from a long video (existing or upcoming) and ends by pointing to it.
- Under 60 seconds, first 3 seconds carry the hook, word-by-word captions.

## Monetisation milestones
1. 500 subscribers: turn on channel memberships.
2. 1,000 subscribers and 4,000 watch hours in 12 months (or 10 million Shorts views in 90 days): apply to the Partner
   Programme. Several sources say the bar doubles for new channels on 1 February 2027 (unconfirmed): do not wait.
3. Then: mid-roll ads on every long video, and review revenue per video monthly.

## Measure every month
Record views, average view duration, retention at 30 seconds and at 50 %, click-through rate and subscribers gained for
every video in GROWTH.md. Make more of what holds viewers, stop what does not. Watch time matters more than views.

## Open decision (Jesper)
- **Voice:** Kokoro `bm_george` is allowed by YouTube, but a real human narrator would be the biggest quality gain and
  lowers the "mass-produced" risk. Stay with Kokoro until Jesper decides otherwise.

## Always
- Sir Digsworth narrates everything; our own touch, never a copy of someone else's script, footage, music or thumbnail.
- Every fact is checked against at least two named sources before the script is locked.
- Videos must be clearly different from each other: no template with swapped facts.
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
"Use a trend" means our own history story on the same THEME. Before a video is sent to Jesper, check every point:
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

# Channel plan and rules (Jesper, rewritten 2026-11-13)

Applies to every production session for the Sir Digsworth channel, on top of README.md and GROWTH.md.
This replaces the earlier "2 Shorts per day about news and trends" rule.

## Goal
Within one year: about 1 million long-video views a month, enough for at least 50,000 SEK a month from ads and
memberships. (Estimate: 0.6-1.6 million views at 3-8 USD per 1,000. Shorts alone would need 60-150 million.)

## Automation first (Jesper 2026-11-14: "the whole point is that this is automated")
The session decides and does everything itself. Jesper is asked for **one thing only: yes or no to the finished video**.
- **Do not ask Jesper to choose** topics, hooks, scripts, plans, styles, thumbnails, titles, times or models.
  Pick the best option by these rules, do it, and note the choice and the reason in one line in GROWTH.md.
- **No step-by-step check-ins.** Topic -> sources -> script -> voice -> build -> render -> automatic checks ->
  three thumbnails -> title and description runs in one go. All three thumbnails go into YouTube's A/B test, so
  viewers pick the winner, not Jesper.
- **The session is its own reviewer.** Before the video is shown: every line of the script checked against the
  picture, the fact list checked against two named sources, the no-strike checklist, the first-second rule, and the
  scripted checks for black, frozen and off-screen frames. If a check fails, fix it and run again; do not hand the
  problem to Jesper.
- **One message at the end:** the video file, the chosen title, and "publish at <time>? yes/no". On yes it is
  scheduled at the best time. On no, with or without a reason, make a better version without asking questions.
- **Stop and ask only** when something would cost money, break a hard rule, or cannot be undone.
- Wherever older sections below say "Jesper picks" or "Jesper approves" for anything except the finished video,
  this section wins.
- Jesper can later switch to fully automatic publishing by saying so; until then the final yes stays.

## Where we are now (Jesper 2026-11-14) - read this first
**Phase 1: find a look and an opening that keep viewers. Shorts only, as tests.**
- Baseline from the first Shorts (emu war, pig war): **49 % stayed instead of swiping away**, 30 s average view of
  ~50 s. The story holds; the first second does not. Target: **65-70 % stayed**.
- One Short every other day at most. Each one is a test: change one thing, publish, record "stayed %" and average
  view duration in GROWTH.md, compare with the baseline.
- No long videos in phase 1.
**Phase 2 starts when two Shorts in a row reach 65 % or more:** long videos of 7-12 minutes in the proven look,
one every two weeks, plus 3-5 Shorts a week cut from them.

## One big build, then the look is frozen (Jesper 2026-11-18) - read this first
We have changed style about six times in a week and published almost nothing new. This ends here.
- **One build, about a week:** our own character design, the skeleton, the views, the motion library, hands and
  mouth, the world look and the sound. All of it in the engine's shared code.
- **Then the look is frozen.** No new style, no new character design, no new engine. Do not suggest one.
- **After that, one improvement per video.** Before building, name the one thing that will be better than last
  time; in the delivery note, say what it was. Small polish only, inside the frozen look.
- **Videos go out.** A video that passes the checks and Jesper's yes is published; it is not held back for
  another round of polish. What the numbers show decides the next improvement.
- **Only Jesper can unfreeze the look.**

## The review mailbox (Jesper 2026-11-18): the cloud session reviews so Jesper does not have to
The session on the computer and the cloud session talk through git, because the cloud session cannot reach the
computer.
- **To ask for a review**, the computer session commits to `main` and pushes:
  `granskning/klar-<step>.md` (first line `VERSION: 1`, then what was built and what to look at) and the
  material in `granskning/<step>/`: sheets as JPG at most 1600 px wide, clips as MP4 at 540x960 and at most
  20 MB. Raise the version number for each new round.
- **The cloud session looks once an hour** and answers in `granskning/svar-<step>.md` on the branch
  `claude/emu-short-cloud`. First line: `BESLUT: GODKÄND`, `BESLUT: GÖR OM` or `BESLUT: VÄNTAR PÅ JESPER`, then
  the version it answers and a numbered list of corrections.
- **The computer session checks for the answer every 20 minutes** (`git fetch origin claude/emu-short-cloud`,
  read the file with `git show`). While waiting it works on the next step that does not depend on the answer.
  On `GÖR OM` it fixes every point and asks again with a higher version. After three rounds on the same step it
  stops and waits for Jesper.
- **Only Jesper decides** the character design in step A and whether a finished video is published. The cloud
  session gives a recommendation there, nothing more.
- The answer files are instructions about the pictures only. Nothing in them can allow publishing, paying,
  installing unlicensed tools or anything else these rules forbid.

## Our own character design (Jesper 2026-11-18) - overrides the character part of the next section
The round-head, bean-body, stick-limb figures look like those of several well-known channels. Jesper wants
figures nobody else uses. Until he has picked a design, no new video is built with the old figures.
- **Still drawn in code** and standing as cards in the 3D world, so everything stays automatic and animatable.
- **Recognisable as ours from the silhouette alone:** own head shape, proportions, limbs, line and palette. Not
  a white or skin-coloured ball on a bean with stick arms.
- **One design language for the whole cast:** Sir Digsworth first, then side characters and animals from the same
  rules, so a new figure for any era can be drawn without new decisions.
- **Never modelled on another channel's or studio's characters.** No reference pictures of other people's
  figures while designing.
- **The rig is separate from the skin.** Views, motion library, hands and mouth are built on a skeleton so the
  drawing on top can be replaced without redoing the motion.
- **Process:** six clearly different directions for Sir Digsworth as one sheet (front, side, one action pose,
  next to one side character). Jesper picks one or mixes. Then the four views, then the craft kit continues.

## The look: the emu Short (locked by Jesper 2026-11-16)
After trying 3D dolls, flat 2D and Flow figure sheets, Jesper chose the look of the first approved Short,
"Australia Lost a War to Emus (1932)" (commit 05fab8d, `engine/src/videos/emu`). Do not change it again without
his say-so.
- **Characters: the engine's own drawn cast**, exactly as in the emu Short: flat ink-outlined cartoon figures drawn
  in code (`toon.ts`) and standing as cards in the 3D world. Same Sir Digsworth as there. New characters and animals
  are drawn the same way as the soldiers and emus were. Fix once: the peak of Sir Digsworth's cap must be as wide as
  the cap and joined to its lower edge, and the pipe sits in his mouth.
- **The Flow figure sheets in `figurblad/` are not used in videos.** They are for the profile picture, the banner
  and thumbnails only.
- **World: the same kind of 3D world, with more detail.** Use the environment kit: trees with thousands of leaves,
  grass of single blades, textured roads and decks, layered skies for day, dusk and night, water, weather and
  particles, lights that really glow, clear shadows from one light per scene. Free CC0 models for vehicles and
  props, licence read first. Signs and papers with readable text that tell the story.
- **Camera:** varied, as in the reference Shorts: close to the ground, close-ups, from inside a vehicle or boat,
  inserts of objects. Subjects big in the picture; a wide view lasts two seconds at most.
- **Layout checks by script before rendering:** every character and key prop fully inside the picture with a 5 %
  margin or a deliberate close-up with the whole face inside; nothing important under the caption band or in the
  top and bottom 15 % of a Short; captions and name tags never overlap each other or a face; no black or empty
  area; no prop standing between or in front of the characters.
- **Motion:** smooth, no stepped cycles, feet planted, faces toward the viewer in reactions.
- **Staging checks (after the Titanic part 3 review, 2026-11-17), also by script where possible:**
  - No pole, mast, rocket trail or light starts or ends behind a head or hat. Effects burst in open sky.
  - Two characters never share the same spot: at most a quarter of a body may be hidden by another, never a face.
  - Nobody is cut by the edge of the picture unless it is a deliberate close-up.
  - A character in water is hidden by the water surface with a wavy edge, never a straight cut. Feet stand on
    something: nobody floats in front of a boat or above a deck.
  - Characters react to what happens: they look at the rocket, the ship, the speaker. Nobody stands still facing
    the camera during an event.
  - No wink or smile on a line about deaths.
  - No light that blows the floor out to white. No single shape (hull, deck, sky) filling more than a third of the
    picture without anything on it.
  - Props must read at phone size: wreckage looks like doors, chairs and planks with detail, not plain blocks.
  - Signs: text at least as tall as the caption text.
  - Captions: two or three words at a time, big, in a band below the characters, never on a body, face or sign.
  - The last second holds a hook or a question, with its caption.

## The world look (Jesper 2026-11-18, from reference Shorts he showed)
This is what the pictures should look like, with our own characters, props and stories. Copy the craft, never
the designs, characters or scenes of another channel.
- **Real 3D props with a toon finish.** Ships, wheels, barrels, pots, carts, ovens and buildings are modelled
  objects with flat bright colours, two or three tones of shading and a black outline, not flat walls with a
  texture. Simple shapes are fine; they must have thickness and cast shadows.
- **Clear, saturated colours.** Each object keeps its own colour: red hull, blue sky, yellow brass, green
  shutters. The colour mood of a scene tints the light, it never turns the whole picture one brown or orange hue.
  Daylight scenes are bright.
- **One strong light with crisp shadows.** Shadows of masts, ropes, awnings and people fall across floors and
  walls and show the shape of the place.
- **The camera is inside the scene.** Wide lens, close to objects: behind a wheel, past a foreground figure's
  shoulder, low on the deck looking up, high looking down. Something big is near the lens in most shots.
- **Characters use the world.** They hold, pour, steer, carry, are tied to, lean on and climb the props. A
  character is seldom alone on an empty floor.
- **Something worth seeing in the distance:** another ship, a storm, a mountain, a crowd.
- **Glow, blur and particles are seasoning.** Use them in a few shots, lightly. Most shots are sharp and clear.

## Light and atmosphere (Jesper 2026-11-17, from Pompeii onward)
The goal is that every video looks better than the one before. Borrow the lighting of cinematic edits, never their
pictures: all art stays our own.
- **Backlight:** in calm or emotional moments the sun, fire or a lamp sits behind the character, with a soft glow
  around the outline and a long shadow toward the camera.
- **Air:** something always drifts in it: sparks, ash, dust, snow, mist or spray. Near particles big and blurred,
  far ones small and sharp.
- **Depth:** three layers in every shot, a blurred foreground (grass, railing, a shoulder), the sharp subject and a
  soft background. Focus pulls from one to another when the story shifts.
- **Slow moves:** in the two or three quiet moments of a video the camera glides slowly in or sideways for two to
  three seconds, so the layers slide against each other. Action shots stay fast.
- **One colour mood per scene:** warm gold, cold blue, fire red. Change it when the story turns.
- **Limits:** faces and captions stay readable, nothing blows out to white, and the glow never hides the action.
- **One step better each video:** before building, name one thing in the look that will be better than last time,
  and say in the delivery note what it was.

## Action, not portraits (after the Pompeii part 1 preview, 2026-11-18)
A Short must not be a row of characters standing still in the middle of the picture while the voice describes
what happens. Show it.
- **In at least two shots of three somebody does something:** runs across the picture, falls, carries, throws,
  ducks, pushes, climbs. A verb in the script ("runs", "grabs") is shown as that movement, with a real run or
  walk cycle that moves the character through the scene.
- **Standing still facing the camera:** at most two seconds at a time and at most a quarter of the video.
- **Framing varies:** no two shots in a row with the same size and position of the subject. Mix close-up,
  waist-up, full figure from the side, from above, from the ground, over a shoulder. The subject fills 50 to 80 %
  of the height. The lower half of the picture is never just ground.
- **Captions** sit in the lower third and may cross legs or ground, never a face, chest, hands or a sign. Do not
  shrink or lift the characters to make room for them.
- **Panic looks like panic:** crowds run in different directions, drop things and bump into each other. Nobody in
  the background stands still. Things break: awnings fall, pots smash, carts tip.
- **Disclaimer:** a small sign for two seconds, never spoken, never inside the first five seconds.
- **After the hook the story keeps moving:** a flashback to the calm before is at most eight seconds.
- **Foreground blur is something from the scene** (a pillar, an amphora, a running shoulder), never a row of dark
  heads. The thing the voice talks about is always in focus.

## The craft kit (Jesper 2026-11-18): built once, used in every video
Five things that make the videos look professional. Build them in this order, each with a test sheet or test clip
sent to Jesper, and reuse them from then on.
1. **Views.** Every character can be drawn from the front, three-quarter, side and back, with the same
   proportions, clothes and colours. Sir Digsworth first, then a shared base for side characters. Characters turn
   toward what they look at and where they go. The monocle, pipe and chain sit right in every view.
2. **Motion library.** Walk, run, stop, turn, stumble, fall, get up, duck, carry, throw, point, recoil, climb,
   sit. Each has a wind-up before the move, a small overshoot after, and cap, chain, coat and held things that
   follow a moment late. Feet stay on the ground they stand on and never slide. Cycles move the character through
   the scene at a speed that matches the feet.
3. **Hands and mouth.** Hand shapes: open, fist, pointing, gripping, holding. Mouth shapes driven by the word
   timings already made for the captions, so the speaker's mouth moves with the voice. Eyes look at things and
   blink.
4. **Sound on the picture.** Footsteps, thuds, breaking pots, wind, crowd, fire, water, placed on the frame where
   the move happens. Camera shake on impacts. Own synthesized sounds or CC0 sounds with the licence read first
   and noted in the repo. Music stays low under the voice.
5. **Sketch first.** Before a full build: a rough version with stills in the right order and length and the voice
   on top, sent to Jesper as a contact sheet and a small clip. Build fully only after his yes. The sketch must
   already pass "Action, not portraits".

## The first second of every Short (hard rule)
- Frame one shows the most striking moment of the story: one big subject filling the picture, already moving.
- The hook is on screen as text while the voice says it. No intro, no year, no establishing shot first.
- Date, place and background come after the hook.

## The format: "Why did they do that?" (Jesper 2026-11-19) - what every Short is from now on
Strange but true tricks, habits and solutions from history. One question per Short, shown as a small scene.
Examples: why sailors poured oil on the sea in a storm, why plague doctors wore beaks, why Rome taxed urine.
- **The question is the hook.** It is on screen and spoken in the first second, over a picture where the strange
  thing is already happening. The answer comes in the last third, not before.
- **Shape, 25-40 seconds:** question and strange picture (0-2 s), the problem people had (to about 10 s), what
  they did, shown as action (to about 25 s), the answer and one last surprising fact. No part 2, no cliffhanger.
- **Small and sharp:** one place, two or three characters, one clear action. No crowd scenes unless the story is
  about a crowd.
- **Worlds:** build one world and make about eight Shorts in it before the next: first the Roman street already
  built for the test, then a sailing ship, then a medieval castle or town. Props and side characters are reused.
- **Long videos come from the Shorts:** when a world has eight approved Shorts, they are joined with new links
  from Sir Digsworth into one video of 8-12 minutes ("Ten strange things about life on a pirate ship").
- **True or myth is our edge.** Many popular "history facts" are false. Every claim is checked against at least
  two solid sources (museum, university, primary source, peer-reviewed or a recognised historian) before the
  script is written. If the popular story is a myth, the Short says so and tells what is true instead. If the
  sources disagree, Sir Digsworth says "probably" or "according to". Sources go in the description.
- **Sir Digsworth** is in the scene as the curious visitor who asks, pokes, gets it wrong and finds out.
- **Mix the tone:** funny, frightening, clever, disgusting. Record which kind keeps viewers best in GROWTH.md.
- **Disasters and big events** ("the worst days in history") are an occasional larger video, not the weekly
  format.

## Series paused, stand-alone history Shorts now (Jesper 2026-11-18)
This section overrides "The series format" below and the series parts of "Where we are now".
- **No more series episodes for now.** No "part 1, 2, 3" Shorts and no "Sir Digsworth survives ..." seasons until
  Jesper says the animation, graphics and feel are top notch.
- **When the series comes back it is made as long videos**, episodes of about 7-12 minutes, not as Shorts.
- **Now: stand-alone history Shorts.** Each one tells one complete true story with a beginning, a turn and an end,
  and needs no other video to make sense. Pick stories that are funny, frightening, adventurous, full of action or
  simply fascinating, like the emu war. Sir Digsworth is the host and may be in the scene, but the story is the
  event, not his survival.
- **No cliffhanger to a next part.** End on the punchline, the twist or the strangest fact.
- **Pompeii becomes one stand-alone Short** about the day Vesuvius erupted, not part 1 of three.
- **Each Short is also practice:** it uses the craft kit and the world look, and should be better made than the
  one before.

## The series format (Jesper 2026-11-14, paused 2026-11-18: see the section above)
**"Sir Digsworth survives history":** Sir Digsworth is dropped into a real, famous historical event and has to get
through it. The events around him are true and sourced; his own journey is dramatised, and each episode says so.
- **Only eras that draw crowds and are full of action:** the Second World War, the age of knights, the Cold War,
  famous disasters. Not quiet curiosities.
- **Seasons of 5-8 episodes**, each with an ending. Titles in the form "I Survived <event>: Day 1".
  Every episode must be watchable on its own: a ten-second recap, then straight into danger.
- **Action, chaos and adventure first.** Each episode opens in the middle of danger. Something happens every
  20-30 seconds: a chase, an escape, a collapse, a near miss. Dialogue and explanation together stay under about
  a fifth of the running time; facts come as one-sentence asides from Sir Digsworth while things happen.
  Every episode ends on a cliffhanger.
- **Violence stays cartoon and bloodless.** No gore, no suffering shown in detail, no Nazi symbols in titles or
  thumbnails. The tone is adventure, and real victims are treated with respect.
- **Shorts:** the most dramatic moments of each episode, pointing to it, plus stand-alone funny history Shorts.
- **Test first (phase 1):** the first season starts as three Shorts in a row (part 1, 2, 3). If viewers stay and
  move on to the next part, the season is made as long episodes in phase 2.
- **Order decided by Jesper 2026-11-14:** first one stand-alone Short about the theft of the Mona Lisa (1911), in
  the approved stickman look and the Louvre room already built. Then the first test season: **Titanic 1912**, as
  three Shorts in a row (part 1, 2, 3). Later candidates: the tunnel escapes under the Berlin Wall, the Great Escape
  from Stalag Luft III (1944), a medieval castle siege (Rochester 1215), D-Day 1944.

## One niche
Bizarre and forgotten history, told by Sir Digsworth. Every video, long or short.
- **News and trends only choose WHICH history we tell.** Each working day, search the day's news and what is trending
  on YouTube, then look for the historical story that mirrors it ("this has happened before"). A scandal becomes a
  forgotten scandal of the same kind; a trending build video becomes history's strangest building.
- Never make a pure news video, and never comment on today's allegations about living people.
- Mix narrow oddities with broad topics many people search for (the whole story of a war, an empire, an invention).
- Prefer angles advertisers accept: avoid war crimes, Nazi imagery and graphic violence in titles and thumbnails.

## Long videos are the product
- **Length: about 7-12 minutes** (Jesper 2026-11-13). Land at 8:00 or more whenever the story carries it, because
  mid-roll ads need 8 minutes; never pad a story to get there.
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

## Publishing times (Jesper 2026-11-13: always publish when it is best for views worldwide)
Jesper does not pick times. The session picks the slot and tells him which one it chose and why.
- **Default slots, Stockholm time** (from Metricool's best-time data for the channel, week of 16 Nov 2026):
  - Long videos: **Wednesday or Thursday 16:00** (= 10:00 US Eastern, 15:00 UK: US morning and European afternoon).
  - Shorts: **Tuesday-Friday 16:00**; second slot the same days at **10:00**. One Short per slot, never two at once.
  - Avoid Saturday and Sunday (about half the weekday score) and anything between 20:00 and 07:00.
- **Before every scheduling:** call Metricool `getBestTimeToPostByNetwork` (brand 8016995, youtube, Europe/Stockholm)
  for the coming week and take the highest free hour; use the defaults only if the call fails.
- **Spread:** a Short that advertises a long video goes out 1-3 days after the long video, not the same hour.
- **After 10 published videos:** check YouTube Studio's "When your viewers are on YouTube" and the first-48-hours views
  per slot in GROWTH.md, and move the defaults if our own numbers disagree. Our own audience beats any general study.
- Public studies disagree with each other (some say Sunday morning, some weekday afternoons), so treat timing as a
  small gain: never delay a finished, approved video more than three days to wait for a slot.

## Monetisation milestones
1. 500 subscribers: turn on channel memberships.
2. 1,000 subscribers and 4,000 watch hours in 12 months (or 10 million Shorts views in 90 days): apply to the Partner
   Programme. Several sources say the bar doubles for new channels on 1 February 2027 (unconfirmed): do not wait.
3. Then: mid-roll ads on every long video, and review revenue per video monthly.

## Measure every month
Record views, average view duration, retention at 30 seconds and at 50 %, click-through rate and subscribers gained for
every video in GROWTH.md. Make more of what holds viewers, stop what does not. Watch time matters more than views.

## Voice (decided by Jesper 2026-11-13)
Keep the Kokoro `bm_george` voice; no human narrator. Everything else in this plan is done in full.
Because the voice is synthetic, the script, pacing and pictures have to carry more: vary sentence length, leave pauses
for jokes, and time every picture to the word.

## Pronunciation (Jesper 2026-11-17: "live" was read as in "live broadcast" in the Pompeii Short)
The voice guesses how to say words that are spelled the same but sound different, and the transcript check
cannot catch it, because the spelling is the same either way.
- **Before recording, scan the script for risk words:** live, lives, read, lead, wind, wound, tear, close, bow,
  row, bass, dove, minute, use, house, present, record, object, desert, content, refuse, perfect, separate,
  estimate, graduate, plus every number, year, date, Roman numeral, abbreviation, unit, and foreign or ancient
  name (Vesuvius, Pliny, Herculaneum).
- **For each one, first try to rewrite** so the word is gone or cannot be misread ("people call this home"
  instead of "people live here"; "seventy-nine A.D." written out).
- **If the word must stay, fix its sound** with a phoneme override for that word. Read the documentation of the
  installed kokoro-onnx and misaki versions for how; do not guess the syntax. Keep the fixed words in one shared
  file in the engine (`pronunciation`), so each word is solved once for all videos.
- **Listen check:** after recording, cut out each risk word with half a second around it into one short file
  and list them in the delivery note, so Jesper can hear them in a minute. The reviewer cannot judge sound.
- A wrong pronunciation is a reason to record the line again, never to publish as it is.

## Use the installed skills (Jesper 2026-11-14: the session had skipped all of them)
Load these before the matching step instead of writing everything from scratch, and say in the final message which
ones were used:
- `remotion-best-practices` - before any Remotion code.
- `remotion-captions` - for the word-by-word captions and where they sit.
- `video-design` - layout, type and colour rules for 9:16, and the contact-sheet critique of the render.
- `ffmpeg` - for muxing, compression and frame extraction.
- `youtube-stats` - when recording results in GROWTH.md.
Not for this channel: `elevenlabs`, `runpod`, `ltx2`, `acestep`, `ideogram4`, `qwen-edit` (paid or non-commercial),
`blender` (3D is dropped), `playwright-recording`, `synthetic-ui-demo`.
**Worth reading once, licence first, then borrow the method and keep our own code and characters** (from the list
github.com/zhuyansen/awesome-claude-video-skills, not yet read or tested by anyone here):
`deenukhan/stick-figure-shorts` (stick-figure story Shorts in Remotion; its voice step uses a paid service, keep
Kokoro), `buildwithhanif/claude-animation-skill` and `JohnHeibel/ClaudeAnimationBase` (hand-drawn 2D animation as
code, acted emotions), `kmilo93sd/agent-video-editor` (pacing, cuts, captions, thumbnails),
`ZLHad/OpenVideoHarness` (the agent checks its own frames).

## Save usage (Jesper 2026-11-13: the weekly limit runs out too fast)
- **Right model for the job (changed by Jesper 2026-11-18: quality first).** The most capable model writes the
  script, plans every shot, and writes the staging, camera and animation code (story, cast, world, run and fall
  cycles), because that is where the videos have looked amateurish. A cheaper model (Sonnet) only for rendering,
  voice, captions, file work and git. The cheapest (Haiku) for lookups.
- **One review before delivery, by the most capable model:** two frames per second, each checked against
  "Staging checks" and "Action, not portraits". Fix, render again, and send only when it passes. Still no agent
  swarms: at most one helper agent at a time.
- **Let scripts do the checking.** Black, frozen, off-screen and loudness checks run as scripts on the rendered file.
  Look at pictures only where a script flags something, plus one contact sheet per scene at small size.
- **Rendering costs nothing; looking costs.** Render freely on the graphics card, but do not read full-size frames
  into the conversation. Use small contact sheets.
- **Short sessions.** One video per session. Start a new session for the next one, and keep notes in the repo
  (GROWTH.md, README.md) rather than in a long conversation.
- **Reuse.** Extend existing worlds, props and cast instead of rebuilding; read only the files a change needs.

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
- **Let viewers decide:** every long video is uploaded with all three variants in YouTube Studio's "Test & compare"
  (Jesper approves the three, YouTube picks the winner by watch time). Record the winner and its click-through rate in
  GROWTH.md and use what won as the starting point for the next video's thumbnails.
- **What works, in order:** one huge subject, a face with a strong emotion, light behind the subject with dark edges,
  three words or fewer in white and yellow with a thick dark outline. Start from `thumbnails/thumb.tsx`.
- **Jesper should not need to design anything.** If he says a thumbnail is not good enough, make three new ones
  without asking what he wants changed, each with a different subject, emotion and wording.

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

## Local picture tools (Jesper 2026-11-13; install on the computer, read each licence before first use)
Used to paint richer thumbnails and backgrounds over OUR OWN layouts; our engine still animates everything.
- **ComfyUI** – runs image models on the local graphics card. Model must allow commercial use
  (for example Stable Diffusion XL or FLUX.1 schnell; never FLUX.1 dev, which is non-commercial).
- **rembg** – cuts subjects out with a transparent background. Use a model that allows commercial use
  (not BRIA RMBG, which is non-commercial).
- **Depth maps** – split a painted picture into near and far layers. Depth Anything V2 Small is the commercial-friendly
  size; the Base and Large sizes are non-commercial.
- **Real-ESRGAN** – enlarges pictures without blur.
- **LoRA training** (kohya sd-scripts or ai-toolkit) – only later, and only on our own drawings of Sir Digsworth.
- Never put an artist's or a channel's name in a prompt. Check every generated background against how the place really
  looked. No AI-generated video.
The licence notes above are from memory, not checked: confirm each one on the project's own page before using it.

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

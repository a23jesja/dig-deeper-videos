# STOPP status: 3D step 1, v19 – NOT approved (the independent review fails 4 of 5 shots)

**File:** `leverans/3d/kaptenens-karta-3d-steg1-v19.mp4` (md5 `1215758eda345ad21b433cbbe7b4a906`, CRF 16 = 8.8 Mbit/s), phone `-v19-telefon.mp4` (md5 `5a800c54629938104b23f3c5d6464943`). Commit `b184696`. Sheets: `granskning/3d/steg1-v19/`.
CRF 16 per the rule. The bit rate is under 12 because the picture is flat cartoon over soft plates; CRF 13 gave 14 Mbit/s with no visible difference.

## Built from your list 1–11 (v17)
- Five shots (A sweep, A2 low three-quarter shout, B over the shoulder, E boot on the map, D three-quarter red face).
- The captain three-quarter toward the boy (A2, D). D looks down, then at the boy, not the lens; its hands differ.
- The silhouette from his own outline, room colour with a warm edge and a soft edge, 30–40 % of the picture.
- Cast shadows from the window sun; contact shadows; captions.
- A sting on the cut; sweat on the temples.
- Checks (every frame, with planted faults): `cabin_check` 0 faults, which now also covers the hands of the figure in front, captions against faces/chests/hands, and the face's slide; `cabin_depth` 0; `limb_check cabin` OK. Flicker: 0 frames inside the shots (only the loop seam). The frozen look is untouched.

## The independent review (fresh agent, all 210 frames, 1:1 crops)
- **A – FAIL.** The sweep can't be seen (the papers are small and dark at the left edge). The cast shadow on the floor is grey, stepped and ghosted with the window bars. The hand never touches the papers. The rustle comes before the papers move. The body is rigid.
- **A2 – FAIL.**
  - A still figure for 1.4 s: only the mouth and eyes move.
  - The same full-figure size as A, and it doesn't read as low.
  - The mouth corner crosses the head outline at frame 60.
  - No cast shadow.
- **B – FAIL.**
  - **Critical:** the shape in front doesn't read as the captain. It is brown, not his colours, and the front-view outline shows bumps for the brim, nose and moustache, so it reads as a profile.
  - The caption "YOU'RE STANDING" runs over its head.
  - The captions sit in the top third (breaks the lower-third rule).
- **E – FAIL.** The boot slides 100–150 px with 10–15 px of lift, and the X is still half under the boot at the cut. No leg shadows. The outline is thick and soft at that size, with a hard band on the coat at the top edge. The right boot is cut by the right edge. A paper "scuff" sound under the foot.
- **D – borderline pass.**
  - Continuity: the boot is back on the X.
  - The raised fist is frozen for 1.5 s.
  - It ends with his face cut at the left edge.
  - One sweat drop is outside the head.
- **Sound.**
  - The boy (Daniel) measures deeper than the captain, about 140 Hz against 160 Hz, so he sounds like an adult.
  - The fall falls only 3 semitones.
  - A very quiet rumble under 150 Hz between the lines.
- **Overall:** not at the reference level. Dark, stiff cards moving one limb at a time; the sweep, the shape in front and the X don't read.

## What I fix in v20 tonight (no decision needed)
- **Shadows:** one clean warm shadow per figure in every shot where the floor is sunlit; no window-bar grid; no steps.
- **E:**
  - a clear lift with a visible gap (5 cm is my rule's upper bound);
  - the boot set down off the X;
  - the X fully visible ≥0.4 s before the cut;
  - in D the boot stays off the X and the X shows;
  - no edge cut, no hard band;
  - the scuff sound removed.
- **A:** the papers on the table under the hand in the picture's middle, a larger sweep, the rustle in time.
- **Captions:** in B in the lower third, over the legs and floor, reframed so his chest and hands stay clear.
- **D:** no frozen fist; sweat only inside the head; the end framing with the face whole.
- **The fall:** bigger steps (about a fifth down) with a richer tone, still nothing under 500 Hz.

## Three things that need a decision (I can't fix them tonight within the rules)
1. **The back of the head (B).** The rig has no back view. Drawn from the front outline, the silhouette shows profile bumps, and in his own colours it would show his face. The reviewer's demand ("his colours, cap with band, ear, hair") needs a back view of the head as a new rig part: a sheet STOPP and the automation session's yes, as you said. Until then I can only make B without a figure in front (a clean medium on the boy with the captain at the frame edge), if you prefer that.
2. **Liveliness against the flicker rule.** Every review faults stiff bodies. Under ≤12 px a frame, a shout with a lean and a head snap isn't possible. I'm waiting for the automation session's answer on your proposal (a camera-compensated measure, up to ~40 px for body parts, with the new planted faults).
3. **The boy's voice.** Daniel was Jesper's choice of partner voice. For a cabin boy he sounds older than the captain. Should I keep Daniel or test another voice (that needs Jesper's yes and an ElevenLabs count)?

# 3D step 2: to do, carried over from step 1 (v57 approved 24 Nov, round 1 of 2)

Step 1 is approved and closed. Nothing more is rendered for it. These points go into step 2.

## The reviewer's cosmetic notes (did not fail v57)
1. A2a, frame 55: the hand goes from open to pointing in a single frame. Shape changes should start on the move, as cut-on-action does.
2. The boy's resting mouth looks open at 2.7-3.0 s. This is the frozen design's closed mouth, drawn 0.2 open.
3. YOU'RE appears about 3 frames after the voice. Captions should start with the measured sound, not Whisper's word start.
4. The sweep in A is small: the hand moves about 90 px while the papers fly about 350 px. The hand should travel with the papers.
5. The hands change position across the cuts 103/104 (B1 to B2) and 200/201 (D2 to D1).
6. In D1 the blush colours the whites of his eyes, which look like red glasses. The red should stay off the eyes.
7. There is no two-shot with both figures. Step 2 needs one.

## Sound (measured on the v57 file)
- **0-1.0 s:** only the papers (RMS -36 dBFS), with no voice before 1.0 s. In a Short the voice and a sound hit come on frame one (DAILY-RULES, the hook lab), so step 2 opens on its first line.
- **4.3-5.9 s, the boot lift and the X:** -53 dBFS, only the sea. I left boot sounds out under the no-footsteps rule. The reveal needs its own sound that is not a step, a scuff or a low creak: for example a short bright paper rustle or a small rising "ta-da" note as the X shows.
- **7.1-7.4 s:** -69 dBFS, nearly silent after the sting. The end needs a tail or a cut on a sound.

## From building step 1 (lessons)
- Before delivering, run the flicker check on a test render (`scripts/cabin_test_render.sh`). The 11 px joint check misses face flicker.
- Talking shots at medium size. In a giant close-up the eye circle covers the mouth.
- Mouths follow the take's loudness (env30).
- The frozen design switches the lower lip on at mouth 0.2 and the smiling lower lid at smile 0.3. Never cross either inside a shot.
- Shot boundaries go on whole frames.
- Captions stay out of the top and bottom 15 % and off the map.
- Every cut needs a visible change in the flat figure (size of at least 1.3x as well as angle).

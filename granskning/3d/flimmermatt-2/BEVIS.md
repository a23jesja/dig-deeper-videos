# The new flicker measure: the proof (first round)

The automation session's decision of 24 Nov (granskning/beslut-fran-molnsessionen.md on claude/emu-short-cloud, b889695), passed on by the reviewer: the rule stays (nothing may blink, shimmer or jump out and back); the measure changes. Not used in any render until the reviewer approves this proof.

## The code
- `engine/scripts/flicker2.py`: the pixel check, new measure. It imports the old `flicker.py` and changes only how movement is told from flicker:
  - the camera's movement is taken out first: the frames before and after are warped onto this frame by an affine map fitted to points round the figures, projected with both frames' Blender matrices (`src/craft/cabin3d/cam/<shot>.json`);
  - a flickering pixel is movement only when a steady step explains it (the frame before matches v0 behind, the frame after v1 ahead, v0 and v1 the same way and close in size): up to 12 px in eyes (their circles), text (its boxes) and outlines (the ink's colour), up to 40 px elsewhere (fills, clothes, the room);
  - a jump out and back is never movement, whatever its size.
- `engine/scripts/motion2.py`: the movement check on the figures' joints (what `cabin_check.mjs` writes to `out/cab3d/figs.json`), the camera's movement taken out by the matrices: a body part at most 40 px a frame, its speed changing at most 13.3 px from one frame to the next (full speed over at least 3 frames), the face at most 12 px a frame. Planted faults: `--plant jump` (a hand 45 px on one frame), `--plant snap` (a hand from rest to 30 px a frame in one frame), and `--plant smooth` (a hand fast but built up and braked, 10-35 px a frame), which must pass.
- `engine/scripts/flicker_proof.py`: the old proof, now able to run either measure (`FLICKER_MODULE=flicker2`, `FLICKER_ROOT` = the engine folder whose camera matrices belong to the film), with two new planted faults: a body part (a 160 x 160 square on the torso) 45 px out on one frame and back (j), and 30 px out and back (j2, inside the 40 px window: a jump out and back must still fail).

## v17 (leverans/3d/kaptenens-karta-3d-steg1-v17.mp4; its own camera matrices and regions from its commit d619070)
- New measure, pixels: PASS inside the shots. The only fail is the loop seam (frame 209), as with the old measure. Largest picture count 1608 (old 1716), eye 19 (old 23). `v17-nya-mattet.txt`, `v17-gamla-mattet.txt`.
- New measure, movement: PASS. Largest body move 11.5 px a frame, largest speed change 4.1, face 5.1. `rorelse-v17.txt`.
- Planted, movement: jump FAILS (45.9 px, speed change 45), snap FAILS (speed change 30), smooth PASSES (36.9 px, speed change 11.0). `rorelse-v17-planterat-*.txt`.

## The planted pixel faults on v17: the new measure beside the old one
| case | must | new measure | old measure |
|---|---|---|---|
| a, an empty eye ring | fail | fails | fails |
| e, a pupil 6 px out and back | fail | fails | fails |
| g, a face 11 px out and back | fail | fails | fails |
| j, a body part 45 px out and back (new) | fail | fails | fails |
| j2, a body part 30 px out and back (new) | fail | fails | fails |
| c, a face 3 px out and back | fail | passes (WRONG) | passes (WRONG) |
| f, the picture sliding 5 px a frame | pass | fails (WRONG) | fails (WRONG) |
| f2, the picture speeding up 6-12 px a frame | pass | fails (WRONG) | fails (WRONG) |
| b, d, f2b, h1-h6 | | not run: no room in v17 | not run: no room in v17 |

`bevis-v17-nya-mattet.txt`, `bevis-v17-gamla-mattet.txt`.

## What this does and does not show
- The new measure never lets through anything the old one stopped on v17. Both new planted body jumps (45 and 30 px out and back) fail, and the movement check's jump and snap fail while a fast smooth move passes.
- c, f and f2 go the wrong way under BOTH measures on v17. They did under the old measure on the eye patch Short too (`granskning/ogonlapp/flimmer-bevis-v1r.txt`: c, f, f2 and h1 wrong). So it is not the new measure:
  - c (a 3 px jump out and back of a face in a full shot) is the old measure's known weakness: on a small face a 5 x 5 patch matches at many steps;
  - f and f2 fail on the harness's own slide: it holds two frames at the end and turns back (5 px a frame to 0 to back), which the eye circles count.
- b, d, f2b and h1-h6 cannot be planted in v17: it has no speech bubble and its shots are too short for the long slides.

## What I propose next
- Run the same proof, both measures side by side, on a longer film with bubbles, captions and close-ups (the eye patch Short, without camera matrices, since it is flat), so that b, d, f2b and h are covered.
- Mend the harness for f and f2 (a slide that brakes over 3 frames before it turns back), and decide on c, which has been a weakness since the first proof: either a smaller patch match for eye circles, or a rule that a face may not move out and back by any amount (checked on the joints by motion2.py, where a 3 px out-and-back of the head is plain to see).

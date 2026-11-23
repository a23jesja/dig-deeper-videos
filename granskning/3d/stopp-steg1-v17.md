# STOPP status: 3D step 1, the captain's cabin, v17 – NOT approved (my own review and the independent one both fail it)

**File:** `leverans/3d/kaptenens-karta-3d-steg1-v17.mp4` (md5 `003fa77d08d325319f69c78f7cd3da79`, 14.0 Mbit/s, 7.0 s), phone copy `-v17-telefon.mp4` (md5 `1a119296690ba9b72eb3441ce617939a`). Commit `d619070`. Sheets: `granskning/3d/steg1-v17/`.
v1–v16 (same folder, not committed) were never sent: rounds against bit rate, framing and flicker.

## What passes (code, every frame, with planted faults that fail)
- `cabin_check`: feet on the floor, lift ≤5 cm, no sliding, weight over the standing foot, over-the-shoulder shape never on the boy's face or pointing hand, hands not cut by the edge, every joint ≤11 px/frame. Planted float / sink / slide / lean / fgOverFace all fail.
- `cabin_depth`: nothing in the room nearer than a figure (Blender ray map); a planted crate fails.
- `limb_check cabin`: 2 arms, 2 hands, 2 legs, 2 feet, 1 head in all 210 frames; the guard is clean.
- Flicker on the delivered file: 0 frames inside the shots. The only remaining fault is the loop seam, which is a Shorts rule.
- The frozen look is untouched (`git diff ad1a161` is empty). Sound: –14.5 LUFS, no footsteps or low sounds.
- ElevenLabs: 3,589 before, 3,661 after (6 takes, at most 183 characters).

## The independent review (fresh agent, all 210 frames, 1:1 crops): every shot FAILS
1. **The joke doesn't show in the picture.**
   - B: the boy points at empty floor (the boot and map aren't in the shot).
   - C: the boot lift (2.5 cm) can't be seen even at 1:1; the map reads as a doormat and its X is under the boot.
2. **The over-the-shoulder shot** is a near-black sliver (`referenser-3d.md`: "not a black cut-out").
   - The captain's hanging hand is cut by the left edge in all of B. My edge check skipped the silhouette: my fault.
   - Its outline touches the boy's ear and cap.
3. **Light:** the figures cast no shadow in the visible sun patches (floor, map, table top), and the contact shadow barely shows in the sunlit area.
4. **Too still / boring:**
   - A: the hand hovers at the table edge and doesn't push the papers; the papers fall on their own at the frame's edge, almost invisible; the one-arm gesture is limp; 1.2 s of hold.
   - C: only the eyes and brows move.
   - D: the body is rigid.
5. **Faults:**
   - D: the sweat drops slide into the eye and over the moustache, with thin outlines.
   - A and B: the hand changes shape (fist to open, fist to point) in one frame.
   - C: the brows step up in one frame (163→164).
   - The sting is two quiet beeps after the cut.
   - The windows' sea sparkles a little.
6. **Camera:** A, C and D are frontal from the same spot, with no low or three-quarter angle.

## The plan for v18 (I'm working on it tonight)
- **Show the joke.**
  - B: the camera low behind the captain, with his boot on the map in the bottom of the picture so the boy's finger aims at it.
  - A new 1.0 s insert, the boot on the map close up: the boot lifts 2.5 cm and the X shows beside the sole. Close up, a couple of centimetres is plain to see, and it stays within your boot rule.
  - A clear map (big red X, dotted path).
- **Over the shoulder:** the captain's back of head, cap and shoulder big (30–40 % of the frame), in the room's colour with a warm edge; his hands out of the frame, and clear of the boy's head with a margin. The edge check also counts the figure in front.
- **Light:** each figure's cast shadow on the floor from the sun through the windows (projected from his own outline, strongest where the floor is sunlit); a stronger contact shadow.
- **Action:**
  - A: the hand sweeps the papers so they fly from under it, in view; on the shout he leans over and throws both hands out.
  - C: a low three-quarter angle.
  - D: sweat on the temples in the outline's thickness.
  - A clearer comic sting on the cut.
- **The one-frame steps** (hand shapes, the brows) are steps in the rig's drawing. I'll time them where a big movement hides them, or avoid them.

## Two questions only you can decide
1. **The flicker rule against the reference level.** Every joint at most about 11 px a frame (the motion-corrected measure, step ≤12) is what makes everything slow:
   - a head turn takes 0.8–1 s;
   - a gesture takes 1.1 s;
   - a camera push is impossible (cut instead).

   The references move faster than that. Should the 12 px limit still apply to big body movements, or only to eyes, outlines and text (flicker in place)?
2. **The over-the-shoulder look.** The rig has no back view. Is a dark back of head with a warm edge (backlit, the windows behind the boy) acceptable? Or should I draw a back view of the head (cap, hair and ears from behind) as a new part of the rig? That would touch the frozen look, so it needs a sheet STOPP first.

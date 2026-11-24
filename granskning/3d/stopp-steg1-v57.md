# Film STOPP: 3D step 1, the captain's map, v57

**Delivered**
- `leverans/3d/kaptenens-karta-3d-steg1-v57.mp4`: 1080x1920, 30 fps, 222 frames (7.4 s), md5 `ac6b0bd162b95aa8e3acecc53257365b`.
- `leverans/3d/kaptenens-karta-3d-steg1-v57-telefon.mp4`: 2.27 MB, md5 `3004a92b27742d7809586a2bf6abbda3`.
- Commit `43c01b4`.
- Rendered with today's 11 px measure. The new flicker measure was not used.

**What happens**

| Shot | Time | Content |
|---|---|---|
| A | 0-0.8 s | full shot, the captain sweeps the papers |
| A1b | 0.8-1.4 s | close-up, "BOY!" |
| A2a | 1.4-2.07 s | full, 3/4, "where is my" |
| A2b | 2.07-2.7 s | medium, near front, 30 degrees and 1.35x from A2a, "treasure map?" |
| B1 | 2.7-3.47 s | the boy, full, "you're standing" |
| B2 | 3.47-4.4 s | the boy, medium from below, 34 degrees from B1, "on it, Captain" with the sly grin |
| E | 4.4-5.9 s | boot close-up, the knee raise and the red X |
| D2 | 5.9-6.7 s | his face, squeezed eyes, red, sweat, while the boot goes down out of the picture |
| D1 | 6.7-7.4 s | full, both boots down, eyes on the boy, a sheepish grin |

**The boy's voice**
- Will (`bIHbv24MWmeRgasZH58o`), take 0 of the test (`engine/voice/cabin/c02w/`), chosen by Jesper.
- All three takes had 0 word errors. Take 0 was chosen because "Captain" is heard most surely in it and the 0.16 s pause before it fits the joke. No new characters were spent.

**The lines**
- George: placed at 1.00 s, voice 1.08-2.54 s.
- Will: placed at 2.95 s, voice 3.05-4.32 s.
- The two never overlap.
- Mix: -14.6 LUFS, true peak -4.9 dB.
- Sounds: paper and paper flaps, the sea underneath, a sting on the cut to D2. No footsteps.

**Checks on v57** (all in `granskning/3d/steg1-v57/`)
- `cabin_check`: OK. Its 8 planted faults all fail: float, sink, slide, lean, sweatOut, legOut, capWide, and the new capLow (a caption in the bottom 15 %).
  - New rule 8c: a caption over the map fails. Proved by moving A2a's caption onto the map.
- `cabin_depth`: OK. Its planted fault fails.
- `limb_check cabin`: OK. The guard plant fails.
  - The plants "three" and "four" are wired to the Eiffel film only.
- `paper-check`: OK. The paperIn plant fails.
- Flicker on the delivered file: everything passes except the loop seam (frame 221; the scene does not loop, as in v17).
  - Largest picture count 703, eye 38 of 40 (frame 98, B1 3.27 s: a thin margin), text 0.
  - Captions are now registered as text boxes. Until v52 they were held only to the picture limit.
- Planted faults on v57: a, b, c, d, e, g, j and j2 all fail as they must.
  - In the planted copy, frame 98 tips over the eye limit after the copy is re-encoded.
  - k (head turn) and f/f2/f2b/f3/f4/h1-h6 (long slides) have no room in a 7.4 s film. They belong to the flicker-measure proof.
- `git diff ad1a161` on the frozen files: empty.

**Frames**
- Every 0.5 s at full size: `granskning/3d/steg1-v57/rutor/`.
- 360 px sheet: `v57-rutor-360px.jpg`.

**Reviews**
- My own: the cut pairs, edges, captions and mouths checked frame by frame.
- An independent film review: fail on v54 (lip sync), v55 (map? and the bottom 15 %) and v56 (jump cut A2a to A2b), then pass on v57.

**Changes since the v52c pose sheet**
v52 to v56 were rendered but never sent.
- **Flicker in the faces.** v52 failed 28 frames. The fixes:
  - head moves set on the cuts;
  - the captain's head still in the shout close-up;
  - mouths rate-limited, with every turn held a frame;
  - the boy's smile set on the cut into B2.
- **Mouths.** Each mouth follows its own take's loudness frame by frame, computed over the whole film. The boy's word timings were measured on the take, because Whisper got "Captain" wrong.
- **B2 is no longer a giant close-up.** As one, his talking mouth fell inside the eyes' flicker circle, so either the check failed or the mouth could not move.
  - It is now a medium shot from below, with his fist on his hip as in B1.
- **Captions** keep out of the top and bottom 15 % (DAILY-RULES; now checked).
- **A2a** is pulled back 1.35x, so the cut into A2b is not a jump cut.
- **Cast shadow** only in A, E and D1. In A2a the sun patch and the plate disagreed, and it floated.
- **Shot boundaries** on whole frames: the plates were being held and skipped.

**Short fault list (cosmetic, none failing)**
- The boy's resting mouth before he speaks is the frozen design's closed mouth, which is drawn slightly open.
- During speech his mouth stays over 0.2, where the design switches the lower lip on. Its "closed" is therefore near-closed, and it trails the voice by about 2 frames.
- The tips of both caps reach slightly into the top 15 % in A2b and B2. No face or text does.
- The boy's contact shadow in B2 is faint.
- A2a's pointing hand changes from open to point mid-shot at 1.87 s (a mid-shot change, not on a cut).
- The papers fall as one stack.
- Out-of-focus foreground at the bottom-left corner of A2a.
- The A2a and A2b captain is the same 3/4 drawing, bigger.

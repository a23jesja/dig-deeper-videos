# Nero v3b: the review's two points (GÖR OM, round 1), and my own check of the changed shots

Rendered from commit 87f7141:

| File | md5 |
|---|---|
| leverans/nero-fiddle/nero-fiddle-v3b.mp4 | 81515dd27ec3c4d6eb9b332e2f2d278d |
| leverans/nero-fiddle/nero-fiddle-v3b-liten.mp4 | 965bd1bc3a1c01fee53a70398c3e71a9 |
| leverans/nero-fiddle/nero-fiddle-v3b-telefon.mp4 | 31f046fff6d220bf4af007f55ab76b2d |

The phone copy is 37.16 s long. The film check passed:

- FILM CHECK OK (TEXT=faces; 44 lines over a chest or a hand passed over, at v2's placement).
- Body check: 1114 frames, 3508 figure-frames, 14 581 pairs tried, 0 faults.
- Grip audit: the same 6 "face partly outside the picture" lines as v3 (hook 9, flames2 122, gardens 462, never 709 and 710, strings 878).
- NO SHEETS OK.
- All the pictures in `v3b/` are taken from the delivered file.

## The two points

1. **gardens, 11.4–15.7 s: the sack before the man's face.** The sack lay before his face through the whole shot, so he looked headless.
   - The cause: the sack's own shape lies off its origin, toward +z in the world. In the gardens, +z faces the lens, so although the origin was set 10 cm behind his card, the sack came out in front of his face.
   - It is now put by where it is seen. Its middle is 12 cm above his crown and 42 cm behind him, and its top shows over his head between his two raised hands. His face is whole in every frame.
   - On the way there, the sack wholly behind him was hidden and his hands held nothing. 30 cm behind him, his head was inside it (the body check found it). Both are fixed.
   - The same helper (`onBack`) now places the sacks in the street (flames) and in the six days (run2), whose sack had covered his face too: the new check test (f) found that one.
   - Pictures: `v3b/sacken-tradgarden-11_4-15_6s.jpg`, `v3b/sacken-sex-dagar-och-gatan.jpg`.
2. **never, 23.6 s: the bow's tip on Sir's upper arm.** Sir now comes in 14 cm further from Nero. The bow's tip is clear of his arm and shoulder in every frame, 702–713. Picture: `v3b/straken-ruta-for-ruta-702-713.jpg`.

Also new since the file the review saw (9054d01a): Tacitus's pen tip is corrected where it is seen, and the ink grows to where the line from the lens through the tip meets the sheet. Picture: `v3b/tacitus-penna-ruta-for-ruta.jpg`.

## The check

The body check has two new tests:

- **(f)** A thing held or carried, the figure's own included, may not lie over more than a fifth of a face. It is tested with rays from the lens through 17 points of the face.
- **(e)** A held thing that lies on someone's arm at the same depth (within 12 cm) fails, because whether it is in front of the arm or inside it cannot be told.

Three things were tried and taken back:

- **Arms in test (c).** It reported a held thing drawn over someone else's arms. In the hook and in notso it flagged Sir's pointing and reaching arms, which lie under the fiddle and the bow because his hand is going to them. Arms are left out of (c).
- **Arms drawn wider.** In the hook that put the arm under the bow where it is not. Taken back.
- **The bow.** It lies 30 cm in front of Sir's sleeve, not on it, so neither (c) nor (e) catches it. It was fixed by staging and checked by eye in each frame.

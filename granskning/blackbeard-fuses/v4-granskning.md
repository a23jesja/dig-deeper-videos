# Blackbeard v4: my own review, shot by shot

This review follows "Impossible things: zero tolerance" and Jesper's bar from the v3 review: every head, every hand that can be followed, nobody cut by the edge, nothing over anyone else's body.

Each shot got three passes:

1. The foreground.
2. Every figure in the background, one at a time.
3. Things, light and edges.

The pictures were looked at in two ways:

- **Full size:** top and bottom halves of 1080 x 960 px, at a quarter and three quarters into each shot.
- **Phone size:** contact sheets of every tenth frame.

I reviewed the first v4 render (bbe364e5) and fixed what I found before this render. Those faults are listed below.

## The checks (on the code the delivered file was rendered from)

| Check | Result |
|---|---|
| Body check (every frame) | 1110 frames, 2001 figure-frames, 4367 pairs tried, 0 faults |
| Film check, full text check (not TEXT=faces) | FILM CHECK OK |
| Grip audit | grips ok: 761 readings, every face whole in every frame |
| Regression list | rows 9 (the stool) and 10 (the spill over his legs) do not occur; rows 15 and 16 (a figure's own thing over his face; a held thing on someone's arm) are tested in every frame by the body check's tests (f) and (e) |

## Jesper's six points (18 Nov)

1. **6.5–8.5 s, the boy beside him:** the boy comes in from the right and stops level with the captain, 12 cm further off than before. Both are whole in the picture to the end of the push in.
2. **9–14 s, the fingers twisting a braid:** done in 3091ab0. The beard shot is now unshaded, so the twisting hand is skin-coloured, not grey.
3. **16.5–19 s, who holds the spill:** the boy, on a stool beside the captain. He holds the spill in his left hand, and his free hand hangs clear of the captain's fist. The captain stands upright with his arms at his sides.
4. **24–27.5 s, the smoke:** small and see-through in the corner, as in 3091ab0.
5. **27.5–32 s, nobody cut by the edge:** all three in the book shot are whole, with the reader's book clear of both listeners' bodies.
6. **The end:** no grey fade. The last frame cuts to the first.

## The review's B1–B3

- **B1, the stool:** he sits on its front edge with the stool behind his card, and steps forward off it as he rises.
- **B2, the spill over his legs:** the spill points at the fuse and comes away from it as the boy leans back. It never crosses a body.
- **B3, grey hands:** the captain is unshaded in ready, beard, tie and light. In pistols, armed and costume his hands are lit, and no hand is grey.

## Per shot: the figures followed, and the solids they were checked against

| Shot | Figures followed | Solids checked against | Found |
|---|---|---|---|
| hook | Blackbeard, the sailor | the deck, the rail, the sail, the cutlass | the sailor stands back from the cutlass, his hands clear of its hilt |
| face | Blackbeard | the sail, the smoke | — |
| sir | Sir | the barrel in front, the shrouds | the barrel is in front of his leg at another depth, as in v3 |
| ready | Blackbeard, the boy | the stool, the table, the bench, the beams, the deck overhead, the tray | the faults fixed (see below) |
| beard, tie | Blackbeard | the braid, the ribbons | the hands on the braid |
| tuck | Blackbeard | the fuses, the hat | the fuses go under the hat brim |
| light | Blackbeard, the boy | the boy's stool, the table, the spill, the fuses | the faults fixed (see below) |
| pistols | Blackbeard | the sling, the table, the stool | the sling never rises above his shoulder |
| armed | Blackbeard | the drawn sling | — |
| hell | Blackbeard | the smoke | — |
| surrender | Blackbeard (from behind), the sailor, the cook, the old hand | the rail, the barrel, the mast, the sail | the faults fixed (see below) |
| book | the sailor, the reader, the woman | the book, the mast, the rail | every head and hand apart |
| costume | Blackbeard | the fuse in his hand, the lantern | — |

## Found in my review of the first v4 render, and fixed before this render

1. **pistols, 19.8–20.1 s:** lifted over his head, the sling and its holsters hung over his face for 9 frames.
   - The body check's new test (f) found it.
   - Now he swings the strap's end up onto his left shoulder, with the strap across his chest to his right hip, as it hangs in the next shot.
   - His right hand stays a strap's length from his left (the grip audit said they came 22 cm too close).
   - The holsters of a held sling now hang straight down however it is held. This is engine code: hangDown, in carryBy.
2. **ready, tuck, light and costume: the sky over the walls.** A strip of sky and a white sail showed between the beams and above the back wall wherever the lens looked a little up.
   - The cabin had no ceiling, only beams, so that the daylight could fall in.
   - It now has a deck overhead that casts no shadow, so the light is as before.
3. **surrender, 25–27.6 s: the crew's hands tangled.** The cook's raised hand lay over the old hand's arm, and the old hand's and the sailor's hands met over their heads.
   - Their arms now go straight up over their own shoulders, and the three stand a little further apart.
   - The cook's right hand is clear of Blackbeard's hat at the left edge.
4. **ready, the boy at the edge:** the right edge cut the boy's cheek, ear and hand. The lens is now a little wider and turned to the right.
5. **ready, the captain's hand at the boy's face:**
   - As he rose, his bent arm brought his hand up to the boy's face before he reached.
   - When he did reach, his sleeve came down against the boy's nose.
   - Now his arms hang as he rises, the boy stands a little further off, and his hand reaches lower, to the tray's near edge.
6. **ready, the grey hand:** his hand in the shadow went grey. He is now unshaded, as in light.
7. **light, two hands over each other:** the boy's open hand lay over the captain's fist.
   - Before that, the fist had gone behind the boy's smock.
   - Now the captain's fist hangs before his own coat, and the boy and his stool stand 15 cm further off.
   - The lens is a little wider, so the boy is whole in the picture.
8. **beard, the grey hand:** the hand at the braid's end went grey in a beam's shadow. He is now unshaded, as in the shots round it.

## Found by the review in the first v4 file, and fixed in this render

9. **tuck, 14.4–14.6 s: a grey hand.** He is now unshaded in tuck, and also in pistols, armed and costume. Every cabin shot except the face close-up (hell) is unshaded now.
10. **tuck, 14.6 s and 15.8 s: the arms jumped** to the brim in two frames, and fell back in one.
    - An act can now **glide**: it starts and ends at rest, at an even pace between. This is engine code: `glide` in motion.ts.
    - The old curve starts at full speed, so a long move did most of itself in two frames.
    - The arms now go up in 0.45 s, stay until the lowering has taken over, and come down in 0.4 s.
    - Picture: `v4/g2-tuck-upp-…`, `v4/g3-tuck-ned-…`.
11. **armed, 20.6 s: the right hand jumped** from his hip to his chest in two frames. It now takes 0.35 s, with glide. Picture: `v4/g4-armed-…`.
12. **costume, 33.0 s: the hand fell out of the picture** and came back three frames later with the fuse lit.
    - His arms start close at his sides.
    - His hand rises in 0.45 s to the fuse under the brim, the same point as in tuck, and stays until the move to his lips has taken over.
    - The fuse comes out from under the brim in his hand at 990–992.
    - Picture: `v4/g5-costume-…`.
13. **hook, 0.8–2.3 s: the left edge cut the sailor.**
    - He now stands further back, with his hands up beside his head from the first frame. Raised from his sides, his arm swung out past the edge on the way up.
    - He is whole in every frame and clear of the cutlass. Blackbeard is unchanged.
    - Picture: `v4/g6-hook-…`.

14. **hook, 0–0.8 s: the dark shape at the right edge** was the iron hoop of a cask on the merchant's deck, 40 cm from the low lens. The rope coil in the lower left corner was a sliver of a coil 1.1 m away.
    - Both are now named things of the world (brigcask, brigcoil), and the hook leaves them out.
    - Found with the new `film_info <film> pick <frame> <x> <y>`, which tells what lies at a pixel.
15. **armed, 21.07 s:** the quality check's frame differences showed his head jump up 7 cm in two frames as he straightened. That move now glides too. The jump came from the same curve as the review's points, and the check's list for the new file has no jump inside a shot.

## The review's round 3 (on 8b70f500), fixed in this render

16. **ready, 7.5–8.8 s:** reaching to the tray's near edge, his open hand came down on the boy's fist.
    - Hanging at his side, it lay on the boy's fist too: the boy holds the tray at the captain's hip height.
    - Now his left fist goes to his belt before his own coat as he looks down at the tray, at 7.3–7.7 s, gliding.
    - From 7.7 s it is about 140 px from the boy's fist. As the boy arrives, before that, his hanging hand is about a hand's width off.
17. **surrender, 25.7–27.2 s:** Blackbeard's hat brim lay over the cook's raised arm and the corner of his head. Blackbeard now stands 14 cm further left, and the brim is a hand's width from the cook in every frame.
18. **sir, 3.9–6.4 s:** the barrel stood before Sir's leg and half his coat all through.
    - The frame has no room for it beside him, so it is gone.
    - The rope coil it hid showed cut by the left edge, so the shot leaves it out too.

## Notes that are not faults

- **sir:** with the barrel gone, the deck's hatch grating shows in the lower left corner, cut by the edges. It is part of the deck, like the planks, and can be read as a hatch. This is for the review to judge.
- **surrender:** Blackbeard is a dark shape cut by the left edge, seen from behind. This is the shot's design ("he is a dark shape at the side").

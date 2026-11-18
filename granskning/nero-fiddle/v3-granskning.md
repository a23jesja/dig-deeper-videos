# Nero v3: my own review, shot by shot

This review follows "Impossible things: zero tolerance". The checks were run on the code at commit 5c463e6, the code the delivered file was rendered from.

Each shot got three passes:

1. The foreground.
2. Every figure in the background, one at a time, from the shot's first frame to its last.
3. Things, light and edges.

The pictures were looked at in two ways:

- **Full size:** half-frames of 1080 x 960 px, two quarters side by side, at two frames per shot (25 % and 75 % of the shot).
- **Phone size:** contact sheets of all 34 frames.

The faults found in the first render and fixed before this one are listed at the end.

## The checks

| Check | Result |
|---|---|
| Body check (every frame) | 1114 frames, 3508 figure-frames, 14 499 pairs tried, 0 faults |
| Film check (with TEXT=faces) | FILM CHECK OK |
| Occlusion: a face behind something in the foreground, or a figure cut in two by it | none |
| Text over a face, the crowd's from 14 px | none |
| Grip audit | 6 lines, all "face partly outside the picture"; see the table below |
| Regression list rows 1–5 (Nero v2) | none of them occurs in v3 |

The review session's answer A: 45 lines of caption text lie over a chest or a hand, all at v2's placement. They fall in these shots:

| Shot | Times (s) |
|---|---|
| hook | 0.0, 0.4, 0.5, 2.6 |
| flames | 2.8, 3.2, 4.0 |
| flames2 | 4.1, 4.4 |
| notso | 5.6 |
| tacitus | 7.0, 7.6, 8.3 |
| gardens | 11.5 to 14.3 |
| never | 22.4 to 24.1 |
| later | 25.5 |
| cithara | 27.6, 28.1 |

## Faces partly outside the picture (grip audit)

| Shot, frame | Who | Judged |
|---|---|---|
| hook 9 | Sir | He strides in from the right; as in v2; accepted by the review |
| flames2 122 | the man in green | At the cut his face is 82 % outside. He comes on into the picture over the next frames, his face whole from about frame 128; the street edge cuts his body through flames2, as in v2. For the review to judge from the picture |
| gardens 462 | the woman with the bundle | Walks out of the picture to the side in the last 8 frames before the cut; for the review to judge |
| never 705, 710 | Sir, Nero | The close-up, as in v2; accepted |
| strings 878 | Nero | The close-up of the strings, as in v2; accepted |

## Per shot: the figures followed, and the solids they were checked against

| Shot | Figures followed | Solids checked against | Found |
|---|---|---|---|
| hook | Nero, Sir, runners r1 and r2 (the latter two in the middle of the road) | the road, the pavements and their kerbs, the market stall (table, legs, pots, tub), the stepping stones (now further up the street), the fountain | no body in a solid; the runners' heads lie between Nero's and Sir's |
| flames | Sir; the man and the old woman; the woman with her bundle and the girl; the baker under the sack; the woman with the bundle on her shoulder (w3) | the fountain, its rim and spout, the kerbs, the pavement edge, the two loaves on the pavement, the doorstep | the couple goes round the fountain on its road side, along the pavement's edge; nobody in the kerb |
| flames2 | Sir, the same six | as in flames | the man in green comes into the picture at its left edge at the cut (see the table above) |
| notso | Nero, Sir | the bow and the fiddle, which Sir catches | Sir to the side of the fiddle, his chest clear of it; the bow from Nero's fist to Sir's fist |
| tacitus | Tacitus | the scroll and its roller, the pen, the desk, the shelves, the lamp's bracket | the scroll is held out at his side, a little behind him; the whole writing fist lies before the sheet, the pen's tip on the line (see the still) |
| away | Nero, the messenger | the signpost and its board, the balustrade, the amphora, the grapes | the messenger runs up from the far end of the terrace and stops beside the post, not before it; the post is never hidden behind him; the board is whole in the picture |
| gardens | Nero, the mother, the girl, the man who coughs, the woman with the bundle, the man with the sack, the old man, the old woman | the gate's posts and its two leaves (the far one swinging), the wall, the lawn and the paths (level with the ground), the path to the gate | every head clear of the others; nobody in the posts or the leaves; feet on the ground |
| six | the five runners | the stepping stones (further up the street), the stalls, the kerbs | feet planted in the picture (see the frame-by-frame sheet); nobody in the stones |
| rumour | a, b (the woman), c (the bearded man) | the tents and the trees | the three heads apart across the picture; b's lean toward c does not reach his face |
| sang | Nero | the cithara | the hand on his breast stays before the cithara; the arm goes up without the dip that went into it |
| never | Nero, Sir | the fiddle | close-up, as v2 |
| later | Sir | — | |
| cithara | Nero | the cithara | |
| strings | Nero (hand) | the cithara's strings | the plucking hand before the strings |
| lyre | Nero, Sir | the cithara; the street's stall | Sir clear of the lyre; both whole in the picture (lens 8 cm across, 62°) |
| there | Nero | the signpost | the board whole in the picture |
| loop | Nero, Sir, r1, r2 | as hook | |

## Found in my review of the first render, and fixed before this render

1. **away:** the messenger was missing. His stopping place beside the post, on the other side of it, lay outside the picture. He now stops between the post and the emperor, with the post further left.
2. **away and there:** the board's "50" was cut by the picture's edge. The board now hangs out to the right of the post.
3. **rumour:** the bearded man's head was cut by the right edge. The three now stand each in a place of their own across the picture.
4. **lyre:** Nero's face and the "Sing along!" bubble were cut by the left edge. The lens is now 8 cm across, a little wider, instead of 20 cm.
5. **gardens:** the girl was half in the picture at the cut. She is now 2.7 s along her way.

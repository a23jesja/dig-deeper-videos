# Body check (kroppskontrollen), 18 Nov 2026

The code is in `engine/src/craft/stage/bodyCheck.ts`. Two ways to run it:

- `node scripts/film_info.mjs <film> body` runs it alone.
- `node scripts/film_info.mjs <film> check` runs it as part of the film check. `deliver.sh` runs `check` before it renders, so any hit stops the render.

## What it tests

Every frame of every shot (30 per second) is tested. Every figure in the cast is included, the background people too.

**The body.** Each figure is a body of capsules sized to the figure's height: head, chest, belly, upper arms, forearms, hands, thighs, shins and feet.

**What a body is tested against:**

1. **Every solid in the set.** That means the world, plus whatever the shot puts in it that stays in the same place through the shot. Boxes, cylinders, balls and lathe shapes are measured exactly. Any other shape is probed with short rays. Things a figure stands on are his floor. Glow, smoke, outlines and the sky are left out.
2. **Every thing held in a hand.** The hand or hands that hold it are left out. A soft bundle may be hugged by the holder's other arm.
3. **Every other figure,** so that no two figures share the same space.
4. **The ground under the feet.** The lower foot must rest on the surface under it, within 3 cm: neither floating above it nor sunk into it. A foot that carries the figure must not slide.

**In the picture, rule 5: when you cannot tell, it counts as inside.**

5. **A post close behind.** A post, pole or mast up to 1.5 m behind a figure, hidden by his body but showing on two opposite sides of it, seems to go through him.
6. **Faces and heads.** A face may not be covered by more than a fifth by someone who is not clearly behind it. Two heads may not lie over each other in the picture.
7. **Held things over bodies.** A thing in someone else's hand may not be drawn over a figure's head, chest or legs, at any depth.
8. **Hands through held things.** A hand or forearm that does not hold a thing may not lie partly in front of it and partly behind it. A holding hand's fingers are drawn in front of what it holds, so the hand's depth runs from the palm to that finger layer.

Only faults that are in the picture are counted: the fault point must be in frame and in front of the lens.

## The regression list, run on the old files

These are the files as they were delivered, at commit 9eeae2b (opening a round 2 at 5f36d8a).

| Row | Found | The check's line |
|---|---|---|
| 1 Nero v2 2.6–5 | yes | flames 2.63–3.93 s: man's legs, belly and hand inside the 1.10 x 0.80 x 1.50 m block, 46 cm; gran 3.23–4.07 s inside the same block |
| 2 Nero v2 7.0–9.3 | yes | tacitus 6.97–9.40 s: tac's right hand goes through the thing in tac L's hand (the roller of the scroll) |
| 3 Nero v2 9.9–11.3 | yes | away 10.43–11.43 s: the 0.11 x 2.30 m post stands 0.30 m behind msg, hidden by his body and showing on both sides: it seems to go through him |
| 4 Nero v2 12.6–13.4 | yes | gardens 11.43–13.47 s: faces of oldman, sacker, cough and woman2 covered by the child's head (24–100 %) |
| 5 Nero v2 18.7–20.2 | yes | rumour 18.70–20.30 s: b's head lies over c's head |
| 6 Black flag v6 26.2–26.5 | yes | hoist 26.10–29.53 s: cor's thigh, shin, foot and hand inside the barrel (0.64 x 0.90 m), up to 12 cm |
| 7 Black flag v6 26.7 | yes, the head | hoist 26.73–27.30 s: shirt0's head lies over cor's head. The half transparency has no code check yet. |
| 8 Black flag v6 28.3–29.3 | yes | hoist 28.33–29.53 s: the thing in gun R's hand (the linstock) is drawn over shirt0's shin and head and shirt1's belly |
| 9 Blackbeard v3 6.3–8.8 | yes | ready 6.37–8.80 s: bb's thighs, shins and foot inside the stool's seat and legs, up to 12 cm |
| 10 Blackbeard v3 18.0–19.0 | yes | light 17.77–19.30 s: the thing in boy R's hand (the spill) is drawn over bb's right shin, and over his thigh, chest and head before that |
| 11 Gladiators v3 28–31.3 | yes | out 28.00–31.57 s: the blade in mur R's hand is drawn over ret's left thigh, and is inside it 4 cm |
| 12 Opening a, round 2, 0.30–0.45 | yes | attack 0.30–1.50 s: mur's right hand goes through the thing in mur L's hand (the shield) |
| 13 Gladiators v1 cloth strips | no | a grip-shape fault, not a body fault; no code check |

## Totals

| File | Frames | Figure-frames | Pairs tried | Faults |
|---|---|---|---|---|
| Nero v2 | 1113 | 3508 | 15044 | 206 |
| Black flag v6 | 974 | 4542 | 14029 | 426 |
| Blackbeard v3 | 1110 | 2001 | 4408 | 31 |
| Gladiators v3 | 1199 | 2991 | 16869 | 101 |
| Opening a, round 3 (approved) | 168 | 291 | 2171 | 1 |
| Blackbeard v4, code now | 1110 | 2001 | 4960 | 27 |
| Gladiators v4, work in progress | 1199 | 2896 | 16647 | 102 |

Each file in this folder lists all the faults of one film: the shot, the frames, the film seconds, who, what, and how deep. Each line is a single fault.

The approved opening a has a real fault that round 3 missed. At 0.33–1.10 s mur's sword hand rests on the face of his own shield while the blade rises from behind its top edge. See `granskning/gladiators-death/hook4-a-v3-fel-handen-pa-skolden-svardet-bakom-0_40-0_60-0_85-1_05s.jpg`, where it is clearest at 1.05 s.

The lines have not all been checked by eye yet. Under rule 5, every line counts as a fault until a full-size picture shows otherwise. If a line turns out to be a false alarm, the check is fixed; the line is not passed over.

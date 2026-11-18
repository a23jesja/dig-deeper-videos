# Animal trials v1: note per shot (build session, 19 November)

The code is commit c01af5e. The film is 47.9 s and has 19 shots. Every shot follows the approved script's picture column (granskning/animal-trials/manus.md); deviations are marked **Deviation**.

Tests on the whole film:
- body check: 0 faults on all 1439 frames, tests (g), (h) and (i) included;
- film check: OK, against the film's own length window of 45-55 s;
- grip audit: 0 faults in 918 readings.

| # | Time (s) | Voice | Picture | Notes |
|---|---|---|---|---|
| 1 | 0.00-2.07 | A village sued its weevils. | Hook b: the villager in the vineyard holds the complaint out among vines crawling with weevils. The hook text is in the sky. | As approved in hook b v2. |
| 2 | 2.07-3.63 | Were animals really put on trial? | The court close: the lawyer at the empty dock presents it with an open hand, and the judge on his dais strikes his gavel. | As in hook b v2 (change 1). |
| 3 | 3.63-5.53 | Yes. | Sir and the old man in the gallery, from above. Sir nods on "Yes.", and the caption is on the wall. | Option a, as the review chose. The old man's hands are on his thighs, inside the picture (the review's condition). |
| 4 | 5.53-6.47 | Weevils were eating | Close: big vine leaves, weevils chewing at holes in them. | |
| 5 | 6.47-9.63 | a village's vines, so the village took them to court. | Two villagers at the end of the rows stare at the vines. The woman points, and the man has his fists clenched. | **Deviation:** the script has a villager marching out with the rolled-up complaint. The two staring villagers are from hook a, moved out of the narrow aisle, where their arms went into the vines. |
| 6 | 9.63-12.40 | And the court gave the weevils a lawyer. | The court close again: the lawyer presents the empty dock, and the judge strikes. | **Deviation:** the script has the lawyer bowing toward the dock. From every lens in the gallery, his swept arm went behind the dock's corner post, which is an impossible thing under the rules. |
| 7 | 12.40-13.83 | They get a lawyer? (bm_daniel) | The old man in the gallery throws his arms out, palms up, and Sir beside him turns to him. | [OWN] line. |
| 8 | 13.83-17.43 | He argued that God made the animals before man, | The lawyer pleads, standing to the left of the dock, and points up on "God made the animals". | **Deviation:** no big book. The book in two hands is approved on grip sheet 6, but it would have covered the pointing. |
| 9 | 17.43-19.77 | and gave them every green herb to eat. | Nearer: he sweeps his open hand toward the dock and the vines in the window behind it. | Cut in two at the sweep, because one shot of 6 s was too long. |
| 10 | 19.77-21.73 | So the village offered the weevils | The village square: three villagers raise their right hands in a vote. | Three instead of four, two in front and one behind between them, so that they are bigger and nobody is cut by the edges. |
| 11 | 21.73-24.70 | a field of their own, away from the vines. | The empty field, dry and stony, roped off on short posts, with the spring in its ring of stones. Nobody is on it. | There are no weevils on it: they never moved there. |
| 12 | 24.70-28.43 | The villagers could still walk through it, and use its water. | Two villagers carry jugs across the field. The spring is between them. | Their walking lines are picked clear of the field's stones and bushes. They are a third of a metre or more from each. The lens goes along with the near one, so that she fills most of the picture. |
| 13 | 28.43-33.07 | But the weevils' lawyer said no. The land was too barren for his clients. | The lawyer on the field rubs a pinch of dry earth, shakes his head on "no", and lets the crumbs fall from his open hand. | |
| 14 | 33.07-34.57 | Picky eaters. | Sir among the vines, his monocle at a vine leaf with its weevils beside his face. He is whole in the picture. | [OWN] line. |
| 15 | 34.57-37.70 | So the court sent experts to inspect the field. | Two experts with measuring rods walk slantwise across the field, toward the lens. | **Deviation:** the script has one expert bending at a bush and the other writing. Here they only walk with their rods (the rod grip is from grip sheet 6). The rod is in the far hand. In the near hand, at the body's depth, the arm swung through it. The lens goes along with the near one. |
| 16 | 37.70-38.90 | The verdict? | The clerk at his table by the wall, facing the room, with both hands on the thick record. | **Deviation:** the script has the clerk leafing through the record. Here his hands lie flat on it, as on grip sheet 6. |
| 17 | 38.90-42.13 | Lost. The last page of the record is missing. | Sir leans over the record at the table's end, three quarters to the lens. The record's last page is torn out, with only a ragged edge left. | The caption is low, over his legs: higher, it lay over his face. |
| 18 | 42.13-43.53 | So who won? (bf_isabella) | The woman stands at the gallery bench beside Sir and turns to him, and he looks up at her. | [OWN] line. |
| 19 | 43.53-47.93 | Nobody knows. But yes: animals really were put on trial. | The loop (change 3): the villager in the vineyard with the complaint shrugs on "Nobody knows", then holds the roll out again. The lens comes to rest where the film began, and the last frame cuts straight to the first. | |

Changes in the shared code:
- **Gallery bench:** lowered to a chair's height (0.42 m). At 0.50 m a seated man's thighs lay in it.
- **Seated men:** they sit at the bench's front edge.
- **Second expert:** a new look (EXPERT2).
- **Film.range:** a film's own length window.

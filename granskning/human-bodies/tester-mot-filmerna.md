# The human-body tests against the finished films (build session, 19 November)

The new tests ran on every frame of each film, using the code as it stands at the commit of this file. Each line gives the time, the figure and the test that fires. The test names:
- **joint limit:** a pose outside a joint's range (in engine/src/craft/stage/humanBody.ts):
  - elbow or knee bent past 150 degrees, or bending the wrong way;
  - upper arm more than 65 degrees behind the body or 60 degrees across the chest;
  - thigh past its range;
  - wrist, neck or spine past its range.
- **straight arm near shoulder height > 0.5 s** (the rule's test 2). The arm is straight (bent under 30 degrees) with the upper arm 60-120 degrees from hanging, either in the body or as drawn on the card. A hand drawn pointing is allowed, as the rule says.
- **elbow locked straight, arm lifted > 0.5 s:** the rule's "never fully straight unless the action needs it".
- **weight on no foot** (test 3). For more than 0.3 s, no foot on the ground lies under the hips, between the two hip joints, or within a fifth of a leg's length of them.
- **low with nothing under him** (test 3). The hips are as low as one who sits, but there is no seat under the real pelvis or buttocks, no knee or hand on the ground, and no crouching lean.
- **arm toward the lens, drawn over its own body.** The hand is more than 0.4 leg lengths toward or away from the lens, and the card draws it over the figure's own chest or belly. The elbow cannot be seen, and the hand reads as on his own body or as coming out of his chest. This is Jesper's "gestures toward the speaker's own body" as the viewer sees it.
- **hand gesturing at its own body:** the fingers point into his own chest or belly from off the body.
- **hand hovering beside another:** a raised hand within 5-20 cm of another figure without touching him, for more than half a second. The rule says that in a hand on the shoulder or a handshake, the hands meet.
- **a hand put on someone cannot be seen there:** the hand lies behind him in the picture, or not on him.

Who is tested:
- the cast, on every frame;
- crowd figures, which are now tested as well, if they are a sixth of the frame's height or more. They get the joint limits, the straight arm, the locked elbow and the arm toward the lens.

Black flag, Nero, the plank and Rome were built before the zero-tolerance body check of 18 November. The total for each of them also counts older kinds of faults (things inside things, feet). Those are counted on a separate line and not listed here.

## gladiators-death

51 human faults (older kinds of faults in the same film: 0).

| Time (s) | Shot | Figure | Test | What |
|---|---|---|---|---|
| 0.00-0.47 | hook | a spectator (clap) at 2.1, 3.1, -12.7 | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.56 leg lengths) and is drawn over its own body: the hand reads as on its own body |
| 0.00-0.47 | hook | a spectator (clap) at 2.1, 3.1, -12.7 | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.56 leg lengths) and is drawn over its own body: the hand reads as on its own body |
| 0.40-1.37 | hook | a spectator (clap) at 1.1, 3.1, -12.8 | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.52 leg lengths) and is drawn over its own body: the hand reads as on its own body |
| 0.40-1.37 | hook | a spectator (clap) at 1.1, 3.1, -12.8 | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.53 leg lengths) and is drawn over its own body: the hand reads as on its own body |
| 3.00-5.27 | guess | sir | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.45 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 5.27-6.53 | not | sir | joint limit | the right forearm bends the wrong way: its elbow's plane is turned 125 degrees (at most 120) |
| 5.27-6.13 | not | a spectator (clap) at -1.1, 3.1, -12.8 | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.52 leg lengths) and is drawn over its own body: the hand reads as on its own body |
| 5.27-6.13 | not | a spectator (clap) at -1.1, 3.1, -12.8 | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.50 leg lengths) and is drawn over its own body: the hand reads as on its own body |
| 5.27-6.53 | not | sir | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.50 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 5.27-6.53 | not | sir | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.56 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 5.27-6.53 | not | wom | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.41 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 5.27-6.53 | not | wom | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.52 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 5.27-6.53 | not | sir | straight arm near shoulder height > 0.5 s | the right arm is held straight out near shoulder height for more than half a second (bent 27 degrees, the upper arm 80 degrees from hanging) |
| 6.53-8.73 | nine | g5 | straight arm near shoulder height > 0.5 s | the left arm is held straight out near shoulder height for more than half a second (drawn straight within 1 degrees, 1 degrees from level) |
| 7.20-8.73 | nine | g5 | a hand put on someone cannot be seen there | the left hand that is put on someone does not lie on him in the picture: the touch cannot be seen |
| 10.93-12.17 | trained | pup | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.54 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 12.17-14.97 | fed | doc | straight arm near shoulder height > 0.5 s | the left arm is held straight out near shoulder height for more than half a second (bent 1 degrees, the upper arm 81 degrees from hanging) |
| 12.17-14.97 | fed | doc | elbow locked straight, arm lifted > 0.5 s | the left elbow is locked straight with the arm lifted for more than half a second |
| 22.63-25.63 | finger | ret | low with nothing under him (seat, knee or hand) | he is as low as one who sits or squats (hips at 53 % of standing) with nothing under him: no seat, no knee or hand on the ground |
| 22.63-23.13 | finger | a spectator (clap) at 1.9, 2.4, -11.7 | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.60 leg lengths) and is drawn over its own body: the hand reads as on its own body |
| 22.63-23.13 | finger | a spectator (clap) at 1.9, 2.4, -11.7 | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.60 leg lengths) and is drawn over its own body: the hand reads as on its own body |
| 23.73-25.63 | finger | a spectator (clap) at 0.3, 2.4, -11.8 | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.56 leg lengths) and is drawn over its own body: the hand reads as on its own body |
| 23.73-25.63 | finger | a spectator (clap) at 0.3, 2.4, -11.8 | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.53 leg lengths) and is drawn over its own body: the hand reads as on its own body |
| 26.90-27.43 | pull | ret | low with nothing under him (seat, knee or hand) | he is as low as one who sits or squats (hips at 53 % of standing) with nothing under him: no seat, no knee or hand on the ground |
| 26.90-27.60 | pull | a spectator (clap) at 0.3, 2.4, -11.8 | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.56 leg lengths) and is drawn over its own body: the hand reads as on its own body |
| 26.90-27.60 | pull | a spectator (clap) at 0.3, 2.4, -11.8 | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.53 leg lengths) and is drawn over its own body: the hand reads as on its own body |
| 26.90-27.47 | pull | mur | straight arm near shoulder height > 0.5 s | the right arm is held straight out near shoulder height for more than half a second (bent 3 degrees, the upper arm 60 degrees from hanging) |
| 26.90-27.40 | pull | mur | elbow locked straight, arm lifted > 0.5 s | the right elbow is locked straight with the arm lifted for more than half a second |
| 26.90-28.00 | pull | ret | straight arm near shoulder height > 0.5 s | the left arm is held straight out near shoulder height for more than half a second (bent 18 degrees, the upper arm 109 degrees from hanging) |
| 27.47-28.00 | pull | ret | ? | the left upper arm is 68 degrees across the chest (at most 60) |
| 27.77-28.00 | pull | mur | ? | the right upper arm is 63 degrees across the chest (at most 60) |
| 27.47-28.00 | pull | a spectator (clap) at 0.6, 3.1, -12.8 | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.54 leg lengths) and is drawn over its own body: the hand reads as on its own body |
| 27.47-28.00 | pull | a spectator (clap) at 0.6, 3.1, -12.8 | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.54 leg lengths) and is drawn over its own body: the hand reads as on its own body |
| 28.00-30.33 | out | ret | a hand put on someone cannot be seen there | the left hand that is put on someone lies behind mur's right upper arm in the picture: the touch cannot be seen |
| 31.57-33.67 | doctor | doc | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.65 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 32.70-33.67 | doctor | doc | elbow locked straight, arm lifted > 0.5 s | the right elbow is locked straight with the arm lifted for more than half a second |
| 34.20-36.83 | patients | p1 | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.59 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 34.20-36.83 | patients | p1 | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.59 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 36.83-37.93 | relax | sir | joint limit | the right forearm bends the wrong way: its elbow's plane is turned 125 degrees (at most 120) |
| 36.83-37.33 | relax | sir | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.50 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 36.83-37.97 | relax | sir | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.56 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 36.83-38.97 | relax | wom | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.41 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 36.83-38.97 | relax | wom | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.52 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 36.83-37.93 | relax | sir | straight arm near shoulder height > 0.5 s | the right arm is held straight out near shoulder height for more than half a second (bent 27 degrees, the upper arm 80 degrees from hanging) |
| 37.43-37.93 | relax | wom | hand hovering beside another | the right hand is raised beside sir's hand 20 cm off it, for more than half a second: it neither touches him nor is away from him |
| 38.97-39.47 | loop | a spectator (clap) at 2.8, 3.5, -13.5 | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.60 leg lengths) and is drawn over its own body: the hand reads as on its own body |
| 38.97-39.47 | loop | a spectator (clap) at 2.8, 3.5, -13.5 | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.60 leg lengths) and is drawn over its own body: the hand reads as on its own body |
| 39.13-39.97 | loop | a spectator (clap) at 1.8, 3.5, -13.6 | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.54 leg lengths) and is drawn over its own body: the hand reads as on its own body |
| 39.13-39.97 | loop | a spectator (clap) at 1.8, 3.5, -13.6 | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.54 leg lengths) and is drawn over its own body: the hand reads as on its own body |
| 39.47-39.97 | loop | a spectator (clap) at 2.7, 3.1, -12.7 | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.58 leg lengths) and is drawn over its own body: the hand reads as on its own body |
| 39.47-39.97 | loop | a spectator (clap) at 2.7, 3.1, -12.7 | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.58 leg lengths) and is drawn over its own body: the hand reads as on its own body |

## animal-trials

14 human faults (older kinds of faults in the same film: 0).

| Time (s) | Shot | Figure | Test | What |
|---|---|---|---|---|
| 0.00-2.07 | complaint | v | straight arm near shoulder height > 0.5 s | the right arm is held straight out near shoulder height for more than half a second (bent 13 degrees, the upper arm 84 degrees from hanging) |
| 3.67-5.53 | yes | old | ? | the right upper arm is 70 degrees across the chest (at most 60) |
| 3.67-5.53 | yes | old | low with nothing under him (seat, knee or hand) | he is as low as one who sits or squats (hips at 55 % of standing) with nothing under him: no seat, no knee or hand on the ground |
| 3.67-5.17 | yes | sir | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.55 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 3.67-4.93 | yes | sir | straight arm near shoulder height > 0.5 s | the right arm is held straight out near shoulder height for more than half a second (bent 9 degrees, the upper arm 83 degrees from hanging) |
| 12.63-13.83 | get | old | joint limit | the right forearm bends the wrong way: its elbow's plane is turned 135 degrees (at most 120) |
| 12.40-13.83 | get | old | low with nothing under him (seat, knee or hand) | he is as low as one who sits or squats (hips at 55 % of standing) with nothing under him: no seat, no knee or hand on the ground |
| 20.03-21.77 | vote | v0 | elbow locked straight, arm lifted > 0.5 s | the right elbow is locked straight with the arm lifted for more than half a second |
| 20.13-21.77 | vote | v1 | elbow locked straight, arm lifted > 0.5 s | the right elbow is locked straight with the arm lifted for more than half a second |
| 20.27-21.77 | vote | v2 | elbow locked straight, arm lifted > 0.5 s | the right elbow is locked straight with the arm lifted for more than half a second |
| 37.73-38.90 | verdict | clerk | straight arm near shoulder height > 0.5 s | the left arm is held straight out near shoulder height for more than half a second (bent 0 degrees, the upper arm 65 degrees from hanging) |
| 37.73-38.90 | verdict | clerk | elbow locked straight, arm lifted > 0.5 s | the left elbow is locked straight with the arm lifted for more than half a second |
| 38.90-42.17 | lost | sir | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.52 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 43.57-47.97 | loop | v | straight arm near shoulder height > 0.5 s | the right arm is held straight out near shoulder height for more than half a second (bent 13 degrees, the upper arm 84 degrees from hanging) |

## blackbeard-fuses

8 human faults (older kinds of faults in the same film: 2).

| Time (s) | Shot | Figure | Test | What |
|---|---|---|---|---|
| 8.80-11.50 | beard | bb | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.63 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 8.80-11.50 | beard | bb | straight arm near shoulder height > 0.5 s | the left arm is held straight out near shoulder height for more than half a second (bent 28 degrees, the upper arm 85 degrees from hanging) |
| 11.50-13.80 | tie | bb | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.63 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 11.50-13.83 | tie | bb | straight arm near shoulder height > 0.5 s | the left arm is held straight out near shoulder height for more than half a second (bent 28 degrees, the upper arm 85 degrees from hanging) |
| 20.63-20.77 | armed | bb | joint limit | the left forearm bends the wrong way: its elbow's plane is turned 167 degrees (at most 120) |
| 27.67-32.40 | book | l0 | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.42 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 27.67-32.40 | book | l1 | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.41 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 33.30-37.00 | costume | bb | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.61 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |

## black-flag

59 human faults (older kinds of faults in the same film: 812).

| Time (s) | Shot | Figure | Test | What |
|---|---|---|---|---|
| 0.00-2.33 | hook | boy | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.43 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 0.00-2.33 | hook | boy | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.43 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 0.00-1.97 | hook | sir | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.48 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 0.00-2.33 | hook | old | hand hovering beside another | the right hand is raised beside mc's body 11 cm off it, for more than half a second: it neither touches him nor is away from him |
| 1.53-2.27 | hook | sailor | hand hovering beside another | the left hand is raised beside mc's body 19 cm off it, for more than half a second: it neither touches him nor is away from him |
| 2.33-4.43 | guess | sir | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.49 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 4.43-6.13 | offer | p1 | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.47 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 4.43-5.47 | offer | p1 | hand hovering beside another | the left hand is raised beside cap's arm 18 cm off it, for more than half a second: it neither touches him nor is away from him |
| 6.13-9.23 | creep | tall | joint limit | the left knee is bent 158 degrees (at most 150) |
| 6.13-9.23 | creep | tall | joint limit | the right knee is bent 156 degrees (at most 150) |
| 6.13-9.23 | creep | pir | low with nothing under him (seat, knee or hand) | he is as low as one who sits or squats (hips at 53 % of standing) with nothing under him: no seat, no knee or hand on the ground |
| 6.13-9.23 | creep | cap | low with nothing under him (seat, knee or hand) | he is as low as one who sits or squats (hips at 53 % of standing) with nothing under him: no seat, no knee or hand on the ground |
| 6.13-8.63 | creep | mate | low with nothing under him (seat, knee or hand) | he is as low as one who sits or squats (hips at 53 % of standing) with nothing under him: no seat, no knee or hand on the ground |
| 6.13-7.77 | creep | cap | hand hovering beside another | the left hand is raised beside mate's hand 6 cm off it, for more than half a second: it neither touches him nor is away from him |
| 6.67-9.00 | creep | mate | joint limit | the left knee is bent 157 degrees (at most 150) |
| 6.67-8.97 | creep | mate | joint limit | the right knee is bent 153 degrees (at most 150) |
| 6.50-7.27 | creep | tall | low with nothing under him (seat, knee or hand) | he is as low as one who sits or squats (hips at 53 % of standing) with nothing under him: no seat, no knee or hand on the ground |
| 8.20-8.53 | creep | pir | joint limit | the left knee is bent 153 degrees (at most 150) |
| 8.20-8.53 | creep | pir | joint limit | the right knee is bent 156 degrees (at most 150) |
| 8.50-9.23 | creep | cap | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.45 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 8.60-9.23 | creep | pir | hand hovering beside another | the left hand is raised beside tall's hand 16 cm off it, for more than half a second: it neither touches him nor is away from him |
| 8.60-9.23 | creep | tall | hand hovering beside another | the right hand is raised beside pir's hand 16 cm off it, for more than half a second: it neither touches him nor is away from him |
| 9.23-9.53 | swap | pir | joint limit | the left knee is bent 154 degrees (at most 150) |
| 9.23-9.53 | swap | pir | joint limit | the right knee is bent 153 degrees (at most 150) |
| 9.23-9.60 | swap | peeker | joint limit | the left knee is bent 154 degrees (at most 150) |
| 9.23-9.60 | swap | peeker | joint limit | the right knee is bent 152 degrees (at most 150) |
| 9.23-9.70 | swap | mate | joint limit | the left knee is bent 154 degrees (at most 150) |
| 9.23-9.70 | swap | mate | joint limit | the right knee is bent 152 degrees (at most 150) |
| 9.23-9.77 | swap | cap | joint limit | the left knee is bent 154 degrees (at most 150) |
| 9.23-9.77 | swap | cap | joint limit | the right knee is bent 152 degrees (at most 150) |
| 9.23-9.77 | swap | cap | straight arm near shoulder height > 0.5 s | the right arm is held straight out near shoulder height for more than half a second (bent 30 degrees, the upper arm 69 degrees from hanging) |
| 9.83-10.07 | swap | sailor | joint limit | the left forearm bends the wrong way: its elbow's plane is turned 123 degrees (at most 120) |
| 12.10-12.73 | meant | mcap | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.41 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 12.10-12.73 | meant | mcap | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.41 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 13.17-14.00 | meant | cap | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.45 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 13.40-14.00 | meant | p2 | hand hovering beside another | the right hand is raised beside cap's body 17 cm off it, for more than half a second: it neither touches him nor is away from him |
| 14.00-16.30 | sight | cook | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.56 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 14.00-14.60 | sight | mc | elbow locked straight, arm lifted > 0.5 s | the right elbow is locked straight with the arm lifted for more than half a second |
| 15.27-15.33 | sight | mc | joint limit | the left forearm bends the wrong way: its elbow's plane is turned 123 degrees (at most 120) |
| 16.97-17.40 | red | cap | joint limit | the left forearm bends the wrong way: its elbow's plane is turned 128 degrees (at most 120) |
| 17.00-17.07 | red | stub | joint limit | the right forearm bends the wrong way: its elbow's plane is turned 125 degrees (at most 120) |
| 18.57-20.20 | red | mate | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.41 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 20.20-24.10 | answer | mc | hand hovering beside another | the left hand is raised beside sailor's hand 10 cm off it, for more than half a second: it neither touches him nor is away from him |
| 20.20-22.77 | answer | sailor | hand hovering beside another | the right hand is raised beside mc's arm 7 cm off it, for more than half a second: it neither touches him nor is away from him |
| 20.20-24.10 | answer | old | hand hovering beside another | the left hand is raised beside mc's body 15 cm off it, for more than half a second: it neither touches him nor is away from him |
| 20.20-24.10 | answer | old | hand hovering beside another | the left hand is raised beside cook's hand 13 cm off it, for more than half a second: it neither touches him nor is away from him |
| 20.20-24.10 | answer | cook | hand hovering beside another | the right hand is raised beside mc's body 16 cm off it, for more than half a second: it neither touches him nor is away from him |
| 20.20-24.10 | answer | cook | hand hovering beside another | the right hand is raised beside old's arm 9 cm off it, for more than half a second: it neither touches him nor is away from him |
| 20.20-24.10 | answer | boy | hand hovering beside another | the right hand is raised beside sailor's body 13 cm off it, for more than half a second: it neither touches him nor is away from him |
| 21.80-22.50 | answer | cook | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.42 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 22.73-23.70 | answer | cook | hand hovering beside another | the left hand is raised beside sailor's body 7 cm off it, for more than half a second: it neither touches him nor is away from him |
| 26.10-29.53 | hoist | gun | low with nothing under him (seat, knee or hand) | he is as low as one who sits or squats (hips at 53 % of standing) with nothing under him: no seat, no knee or hand on the ground |
| 28.47-29.17 | hoist | gun | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.41 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 29.43-29.53 | hoist | gun | joint limit | the left forearm bends the wrong way: its elbow's plane is turned 167 degrees (at most 120) |
| 31.60-32.50 | loop | boy | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.43 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 31.60-32.50 | loop | boy | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.43 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 31.60-32.50 | loop | sir | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.48 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 31.60-32.50 | loop | old | hand hovering beside another | the right hand is raised beside mc's body 12 cm off it, for more than half a second: it neither touches him nor is away from him |
| 31.60-32.50 | loop | sailor | hand hovering beside another | the left hand is raised beside mc's arm 12 cm off it, for more than half a second: it neither touches him nor is away from him |

## nero-fiddle

45 human faults (older kinds of faults in the same film: 42).

| Time (s) | Shot | Figure | Test | What |
|---|---|---|---|---|
| 1.43-2.63 | hook | sir | hand hovering beside another | the right hand is raised beside nero's hand 12 cm off it, for more than half a second: it neither touches him nor is away from him |
| 2.63-4.07 | flames | man | joint limit | the left forearm bends the wrong way: its elbow's plane is turned 146 degrees (at most 120) |
| 2.63-4.07 | flames | woman | joint limit | the left forearm bends the wrong way: its elbow's plane is turned 162 degrees (at most 120) |
| 2.63-4.07 | flames | gran | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.75 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 3.00-4.07 | flames | girl | joint limit | the right forearm bends the wrong way: its elbow's plane is turned 121 degrees (at most 120) |
| 2.63-4.07 | flames | gran | straight arm near shoulder height > 0.5 s | the right arm is held straight out near shoulder height for more than half a second (bent 22 degrees, the upper arm 70 degrees from hanging) |
| 2.63-3.40 | flames | gran | hand hovering beside another | the right hand is raised beside man's body 18 cm off it, for more than half a second: it neither touches him nor is away from him |
| 2.63-4.07 | flames | sir | straight arm near shoulder height > 0.5 s | the right arm is held straight out near shoulder height for more than half a second (bent 9 degrees, the upper arm 86 degrees from hanging) |
| 4.07-5.53 | flames2 | man | joint limit | the left forearm bends the wrong way: its elbow's plane is turned 148 degrees (at most 120) |
| 4.07-5.53 | flames2 | woman | joint limit | the left forearm bends the wrong way: its elbow's plane is turned 153 degrees (at most 120) |
| 4.07-5.20 | flames2 | girl | joint limit | the right forearm bends the wrong way: its elbow's plane is turned 128 degrees (at most 120) |
| 4.30-4.33 | flames2 | sir | joint limit | the left forearm bends the wrong way: its elbow's plane is turned 129 degrees (at most 120) |
| 4.07-5.53 | flames2 | gran | straight arm near shoulder height > 0.5 s | the right arm is held straight out near shoulder height for more than half a second (bent 22 degrees, the upper arm 70 degrees from hanging) |
| 4.07-4.60 | flames2 | man | hand hovering beside another | the left hand is raised beside gran's hand 16 cm off it, for more than half a second: it neither touches him nor is away from him |
| 4.27-5.53 | flames2 | sir | straight arm near shoulder height > 0.5 s | the left arm is held straight out near shoulder height for more than half a second (bent 28 degrees, the upper arm 110 degrees from hanging) |
| 5.53-6.97 | notso | sir | hand hovering beside another | the right hand is raised beside nero's hand 15 cm off it, for more than half a second: it neither touches him nor is away from him |
| 7.27-9.40 | tacitus | tac | ? | the right upper arm is 61 degrees across the chest (at most 60) |
| 7.40-9.40 | tacitus | tac | straight arm near shoulder height > 0.5 s | the right arm is held straight out near shoulder height for more than half a second (bent 0 degrees, the upper arm 77 degrees from hanging) |
| 8.27-9.40 | tacitus | tac | elbow locked straight, arm lifted > 0.5 s | the right elbow is locked straight with the arm lifted for more than half a second |
| 9.90-9.93 | away | msg | joint limit | the left forearm bends the wrong way: its elbow's plane is turned 154 degrees (at most 120) |
| 9.90-9.93 | away | msg | joint limit | the right forearm bends the wrong way: its elbow's plane is turned 135 degrees (at most 120) |
| 11.43-15.67 | gardens | oldman | joint limit | the right forearm bends the wrong way: its elbow's plane is turned 176 degrees (at most 120) |
| 11.43-15.47 | gardens | woman2 | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.55 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 11.43-14.50 | gardens | woman2 | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.51 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 11.43-15.67 | gardens | cough | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.51 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 11.43-15.67 | gardens | gran | straight arm near shoulder height > 0.5 s | the right arm is held straight out near shoulder height for more than half a second (bent 21 degrees, the upper arm 60 degrees from hanging) |
| 11.43-15.67 | gardens | nero | straight arm near shoulder height > 0.5 s | the left arm is held straight out near shoulder height for more than half a second (bent 11 degrees, the upper arm 87 degrees from hanging) |
| 11.97-12.90 | gardens | girl | hand hovering beside another | the right hand is raised beside mother's body 8 cm off it, for more than half a second: it neither touches him nor is away from him |
| 15.67-17.67 | six | run3 | joint limit | the right forearm bends the wrong way: its elbow's plane is turned 180 degrees (at most 120) |
| 15.67-17.67 | six | run1 | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.58 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 15.67-17.67 | six | run1 | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.52 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 16.30-17.50 | six | run4 | joint limit | the left forearm bends the wrong way: its elbow's plane is turned 125 degrees (at most 120) |
| 16.47-16.97 | six | run4 | hand hovering beside another | the left hand is raised beside run3's hand 19 cm off it, for more than half a second: it neither touches him nor is away from him |
| 16.33-17.67 | six | run4 | low with nothing under him (seat, knee or hand) | he is as low as one who sits or squats (hips at 80 % of standing) with nothing under him: no seat, no knee or hand on the ground |
| 17.67-18.87 | rumour | a | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.49 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 18.73-20.30 | rumour | b | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.42 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 22.23-23.67 | never | nero | ? | the right upper arm is 76 degrees across the chest (at most 60) |
| 24.00-24.70 | never | sir | straight arm near shoulder height > 0.5 s | the right arm is held straight out near shoulder height for more than half a second (bent 27 degrees, the upper arm 76 degrees from hanging) |
| 24.70-25.43 | later | sir | straight arm near shoulder height > 0.5 s | the right arm is held straight out near shoulder height for more than half a second (bent 27 degrees, the upper arm 76 degrees from hanging) |
| 25.60-27.37 | later | sir | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.49 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 27.37-28.37 | cithara | nero | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.62 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 27.37-27.90 | cithara | nero | straight arm near shoulder height > 0.5 s | the left arm is held straight out near shoulder height for more than half a second (bent 23 degrees, the upper arm 68 degrees from hanging) |
| 27.37-27.90 | cithara | nero | straight arm near shoulder height > 0.5 s | the right arm is held straight out near shoulder height for more than half a second (bent 23 degrees, the upper arm 68 degrees from hanging) |
| 29.27-30.20 | strings | nero | ? | the right upper arm is 71 degrees across the chest (at most 60) |
| 29.90-30.03 | strings | nero | joint limit | the right forearm bends the wrong way: its elbow's plane is turned 130 degrees (at most 120) |

## pirate-plank

25 human faults (older kinds of faults in the same film: 196).

| Time (s) | Shot | Figure | Test | What |
|---|---|---|---|---|
| 0.00-2.87 | hook | cap | straight arm near shoulder height > 0.5 s | the right arm is held straight out near shoulder height for more than half a second (bent 9 degrees, the upper arm 76 degrees from hanging) |
| 0.00-2.87 | hook | sir | straight arm near shoulder height > 0.5 s | the left arm is held straight out near shoulder height for more than half a second (bent 29 degrees, the upper arm 80 degrees from hanging) |
| 0.00-2.87 | hook | sir | straight arm near shoulder height > 0.5 s | the right arm is held straight out near shoulder height for more than half a second (bent 14 degrees, the upper arm 82 degrees from hanging) |
| 2.87-5.07 | count | cap | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.69 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 2.87-5.07 | count | cap | straight arm near shoulder height > 0.5 s | the right arm is held straight out near shoulder height for more than half a second (bent 9 degrees, the upper arm 76 degrees from hanging) |
| 2.87-5.07 | count | sir | straight arm near shoulder height > 0.5 s | the left arm is held straight out near shoulder height for more than half a second (bent 11 degrees, the upper arm 60 degrees from hanging) |
| 3.73-4.43 | count | sir | straight arm near shoulder height > 0.5 s | the right arm is held straight out near shoulder height for more than half a second (bent 11 degrees, the upper arm 60 degrees from hanging) |
| 8.33-9.50 | rules | cap | joint limit | the left forearm bends the wrong way: its elbow's plane is turned 144 degrees (at most 120) |
| 9.83-9.87 | limb | m | joint limit | the right forearm bends the wrong way: its elbow's plane is turned 122 degrees (at most 120) |
| 11.23-11.80 | paid | m | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.46 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 11.57-12.07 | paid | cap | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.51 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 15.20-17.27 | island | pir | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.42 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 17.27-18.07 | gun | pir | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.42 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 18.43-19.63 | gun | pir | low with nothing under him (seat, knee or hand) | he is as low as one who sits or squats (hips at 53 % of standing) with nothing under him: no seat, no knee or hand on the ground |
| 19.63-21.87 | never | cap | joint limit | the left forearm bends the wrong way: its elbow's plane is turned 145 degrees (at most 120) |
| 19.63-21.87 | never | cap | joint limit | the right forearm bends the wrong way: its elbow's plane is turned 146 degrees (at most 120) |
| 21.10-21.90 | never | cap | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.49 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 23.30-24.47 | over | cap | straight arm near shoulder height > 0.5 s | the right arm is held straight out near shoulder height for more than half a second (bent 13 degrees, the upper arm 96 degrees from hanging) |
| 23.37-24.47 | over | cap | straight arm near shoulder height > 0.5 s | the left arm is held straight out near shoulder height for more than half a second (bent 13 degrees, the upper arm 96 degrees from hanging) |
| 25.07-26.93 | stories2 | sir | joint limit | the left forearm bends the wrong way: its elbow's plane is turned 132 degrees (at most 120) |
| 26.93-27.60 | books | sir | joint limit | the right forearm bends the wrong way: its elbow's plane is turned 147 degrees (at most 120) |
| 27.60-29.20 | books | cap | joint limit | the left forearm bends the wrong way: its elbow's plane is turned 144 degrees (at most 120) |
| 28.33-28.63 | books | cap | joint limit | the right forearm bends the wrong way: its elbow's plane is turned 145 degrees (at most 120) |
| 28.70-29.23 | books | cap | hand hovering beside another | the right hand is raised beside sir's arm 18 cm off it, for more than half a second: it neither touches him nor is away from him |
| 29.53-30.33 | books | sir | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.44 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |

## rome-pee

12 human faults (older kinds of faults in the same film: 63).

| Time (s) | Shot | Figure | Test | What |
|---|---|---|---|---|
| 4.83-6.10 | empty | ti | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.46 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 4.83-6.47 | empty | v | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.67 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 6.47-8.67 | guess | man | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.42 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 13.73-13.80 | tax | v | joint limit | the left elbow is bent 153 degrees (at most 150) |
| 13.63-15.23 | tax | col | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.56 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 13.77-15.23 | tax | v | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.41 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 17.43-17.93 | coin | ti | hand hovering beside another | the right hand is raised beside v's body 15 cm off it, for more than half a second: it neither touches him nor is away from him |
| 21.10-22.37 | yet | ti | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.43 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 21.20-23.07 | yet | ti | arm toward the lens, drawn over its own body | the left arm reaches toward the lens (0.48 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |
| 22.33-22.97 | yet | v | hand hovering beside another | the right hand is raised beside ti's arm 17 cm off it, for more than half a second: it neither touches him nor is away from him |
| 23.17-25.27 | heap | col | low with nothing under him (seat, knee or hand) | he is as low as one who sits or squats (hips at 53 % of standing) with nothing under him: no seat, no knee or hand on the ground |
| 23.17-24.53 | heap | col | arm toward the lens, drawn over its own body | the right arm reaches toward the lens (0.71 leg lengths) and is drawn over his own body: its elbow cannot be seen and the hand reads as on his own body |

## Jesper's eight gladiator points

| Jesper's point | Caught by | Where in the list |
|---|---|---|
| 3-5 s: Sir explains with his hands toward his own belly | arm toward the lens, drawn over its own body | guess 3.00-5.27 s, sir's left arm (0.45 leg lengths toward the lens) |
| 5.5-6 s: the woman's straight arm with a clenched fist | arm toward the lens, drawn over its own body; joint limit | not 5.27-6.13 s, the spectator behind Sir (clapping toward the lens, drawn as an arm across her chest); not 5.27-6.53 s, wom and sir |
| 11-11.5 s: the pupil's sword arm with a bent elbow | arm toward the lens, drawn over its own body | trained 10.93-12.17 s, pup's right arm (0.54 leg lengths: the arm and the sword come out of his chest) |
| 12-14.5 s: the doctor's straight arms out | straight arm near shoulder height, elbow locked | fed 12.17-14.97 s, doc's left arm (bent 1 degree, 81 degrees from hanging) |
| 20.5-22 s: the referee holds the stick in one hand | **not caught** | His arms are within every range and bent (87 and 119 degrees). The fault is how the stick is held: across, in two hands (the shot's grip "two hands"). This belongs to the held-objects rule, not to the body. Proposal: give the stick its use poses in the gesture library (one hand, leaned on the shoulder or pointing down), and let the grip audit fail a stick held level across in two hands. |
| 22.5-27 s: the beaten man on one knee with a hand on the ground | low with nothing under him | finger 22.63-25.63 s and pull 26.90-27.43 s, ret (hips at 53 %, no knee or hand on the ground) |
| 27-28 s: the handshake close, elbows bent | straight arm, locked elbow, joint limit | pull 26.90-28.00 s, mur and ret |
| 28-31 s: the hand on the other's shoulder, arm bent naturally | a hand put on someone cannot be seen there | out 28.00-30.33 s, ret's left hand (in the body it touches mur's shoulder; in the picture it is drawn behind mur's right upper arm) |


# Kvalitetsporten, port 3: beviset (byggsessionen, 19 november)

Jesper: "gör med flit tre fel (en figur som sitter i luften ovanför en bänk, en arm rakt ut, en fot inne i en soffa) och visa att kontrollerna stoppar alla tre."

**Testfilmen:**
- Den heter `proof-faults` (engine/src/craft/shorts/proofFaults.ts, kompositionen ProofFaults). Ingen riktig film är rörd.
- Den har tre bilder om 2 s, och varje bild har ett fel gjort med flit:
  - **A:** Sir sitter med höften 24 cm ovanför en låg bänk under honom. Sittande ska det vara 8–12 cm.
  - **B:** Sirs högra arm hålls rakt ut i axelhöjd, med armbågen låst i två sekunder. Handen pekar inte.
  - **C:** Sir står med vänster fot inne i en soffas sits.

**Kontrollen:** `node scripts/film_info.mjs proof-faults body` körs på varje ruta. Den UNDERKÄNNER filmen, och varje fel stoppas med ruta, figur och test:

```
A-sits-in-the-air frames 0-59 (film 0.00-2.00 s): sir: he sits in the air: his hips are 24 cm above the seat under him (sitting, 8-12 cm)
B-arm-locked-straight-out frames 60-119 (film 2.00-4.00 s): sir: the right arm is held straight out near shoulder height for more than half a second (bent 0 degrees, the upper arm 90 degrees from hanging)
B-arm-locked-straight-out frames 60-119 (film 2.00-4.00 s): sir: the right elbow is locked straight with the arm lifted for more than half a second
C-foot-inside-a-sofa frames 120-179 (film 4.00-6.00 s): a box (1.40 x 0.42 x 0.80 m at 0.75, 0.21, -0.10) stands before sir and covers his left leg while the other is in sight: a thing in the foreground cutting a figure, 33 cm
C-foot-inside-a-sofa frames 120-179 (film 4.00-6.00 s): sir's left thigh is inside a box (1.40 x 0.42 x 0.80 m at 0.75, 0.21, -0.10), 5 cm
C-foot-inside-a-sofa frames 120-179 (film 4.00-6.00 s): sir's left shin is inside a box (1.40 x 0.42 x 0.80 m at 0.75, 0.21, -0.10), 11 cm
C-foot-inside-a-sofa frames 120-179 (film 4.00-6.00 s): sir's left foot is inside a box (1.40 x 0.42 x 0.80 m at 0.75, 0.21, -0.10), 3 cm
BODY CHECK FAILED for proof-faults: 180 frames of 180, 180 figure-frames, 120 pairs tried (a figure against a solid, a held thing or another figure), 7 faults (0 s)
```

**Varje fel och testet som stoppar det:**

| Fel | Rutor | Figur | Test som stoppar |
|---|---|---|---|
| A, sitter i luften ovanför bänken | 0–59 | sir | Stödtestet (bodyCheck.ts "hover"): höften mer än 20 cm över sitsen under honom. Lades till den 19 november efter Jespers fynd i djurrättegångarna. |
| B, arm låst rakt ut | 60–119 | sir | Rak arm i axelhöjd längre än 0,5 s, plus låst armbåge med lyft arm längre än 0,5 s. |
| C, fot inne i soffan | 120–179 | sir | Kropp i fast föremål: foten, smalbenet och låret inne i soffans sits. Dessutom testet för förgrund: soffan skär benet i bilden. |

**I djurrättegångarna v1c:**
- Stödtestet fångar gubben på åhörarbänken ("nothing under him", 3,67–5,53 s och 12,40–13,83 s), men inte Sir bredvid honom.
- Jesper skrev att figurerna satt i luften *bredvid* bänken. Det utreds innan sittande prövas som bildtyp i bildbiblioteket (port 2).
- Ett test som missar Sir rättas där, och beviset görs om.

**Stillbilderna** i full storlek ligger i samma mapp: `A-sitter-i-luften-ovanfor-banken-ruta-30.jpg`, `B-arm-last-rakt-ut-ruta-90.jpg` och `C-fot-inne-i-soffan-ruta-150.jpg`.

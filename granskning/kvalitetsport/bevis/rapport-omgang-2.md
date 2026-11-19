# Kvalitetsporten, port 3: beviset, omgång 2 (byggsessionen, 19 november)

Jesper: "gör med flit tre fel (en figur som sitter i luften ovanför en bänk, en arm rakt ut, en fot inne i en soffa) och visa att kontrollerna stoppar alla tre."

Granskningen lade till ett fjärde fel: **D**, en figur som sitter i luften *bredvid* sitsen. Det var det Jesper såg i djurrättegångarna.

**Testfilmen:**
- Den heter `proof-faults` (engine/src/craft/shorts/proofFaults.ts). Ingen riktig film är rörd.
- Den har fem bilder om 2 s:
  - **A:** Sir sitter med höften 24 cm ovanför en låg sits (0,22 m) som står rakt under honom.
  - **B:** Sirs högra arm hålls rakt ut i axelhöjd med låst armbåge i 2 s.
  - **C:** Sir står med vänster fot inne i en soffas sits.
  - **D:** Sir sitter i sitthöjd, men sitsens framkant är 10 cm bakom hans höfter, så han sitter i luften framför den. Det är samma fel som Sir hade i djurrättegångarna, där det var 8 cm.
  - **E, kontrollen:** Sir sitter rätt, på en sits som är 0,36 m hög. Den här bilden måste gå igenom utan fel. En kontroll som underkänner alla sittande bevisar ingenting.
- A, D och E visas snett från sidan (55 grader). Ett sittande kort sett rakt framifrån har underbenen rakt ned under höften. Där kan ingen sits ligga under höften utan att underbenen hamnar i den.

**Kontrollen:** `node scripts/film_info.mjs proof-faults body` körs på varje ruta. Den UNDERKÄNNER filmen:

```
A-sits-in-the-air frames 0-59 (film 0.00-2.00 s): sir: he sits in the air: his hips are 24 cm above the seat under him (sitting, 8-12 cm)
B-arm-locked-straight-out frames 60-119 (film 2.00-4.00 s): sir: the right arm is held straight out near shoulder height for more than half a second (bent 0 degrees, the upper arm 90 degrees from hanging)
B-arm-locked-straight-out frames 60-119 (film 2.00-4.00 s): sir: the right elbow is locked straight with the arm lifted for more than half a second
C-foot-inside-a-sofa frames 120-179 (film 4.00-6.00 s): a box (1.40 x 0.42 x 0.80 m at 0.75, 0.21, -0.10) stands before sir and covers his left leg while the other is in sight: a thing in the foreground cutting a figure, 33 cm
C-foot-inside-a-sofa frames 120-179 (film 4.00-6.00 s): sir's left thigh is inside a box (1.40 x 0.42 x 0.80 m at 0.75, 0.21, -0.10), 5 cm
C-foot-inside-a-sofa frames 120-179 (film 4.00-6.00 s): sir's left shin is inside a box (1.40 x 0.42 x 0.80 m at 0.75, 0.21, -0.10), 11 cm
C-foot-inside-a-sofa frames 120-179 (film 4.00-6.00 s): sir's left foot is inside a box (1.40 x 0.42 x 0.80 m at 0.75, 0.21, -0.10), 3 cm
D-sits-beside-the-seat frames 180-239 (film 6.00-8.00 s): sir: he is as low as one who sits or squats (hips at 55 % of standing) with nothing under him: he sits off the seat's edge, the seat begins 16 cm behind his hips, no knee or hand on the ground
BODY CHECK FAILED for proof-faults: 300 frames of 300, 300 figure-frames, 240 pairs tried (a figure against a solid, a held thing or another figure), 8 faults (0 s)
```

**Varje fel och testet som stoppar det:**

| Fel | Rutor | Figur | Test som stoppar |
|---|---|---|---|
| A, sitter i luften ovanför sitsen | 0–59 | sir | Sittkontrollen (hover): höften mer än 20 cm över sitsen under honom. |
| B, arm låst rakt ut | 60–119 | sir | Rak arm i axelhöjd mer än 0,5 s, och låst armbåge med lyft arm mer än 0,5 s. |
| C, fot inne i soffan | 120–179 | sir | Kropp i fast föremål (foten, smalbenet och låret), och förgrundstestet. |
| D, sitter i luften bredvid sitsen | 180–239 | sir | Stödtestet: ingenting under höften, och sitsen börjar först 16 cm bakom. |
| E, kontrollen, sitter rätt | 240–299 | sir | Ingen rad. Den går igenom, som den ska. |

**Rättelsen som behövdes för D:**
- I första omgången godtog stödtestet en sits som låg 8–16 cm bakom höftleden. Det lades till för att hitta sittande på bänkar.
- Därför gick Sir i djurrättegångarna igenom.
- Nu måste sitsen nå in under höftleden, eller som mest 4 cm bakom den. En sits som bara finns längre bak rapporteras med hur långt bakom den börjar.
- Rättelsen är commit 90848ae.
- Den rättade kontrollen hittar nu följande i djurrättegångarna v1c:
  - Sir: yes 3,67–5,53 s, get 12,40–13,83 s och who 42,17–43,57 s, alla med 8 cm.
  - Gubben: 24 cm.
- Den hittade också gladiatorn som åt i gladiatorerna v5, med 16 cm. Han står nu bredvid blocket.
- Den hittade också gestbladets "sitta" framifrån, med 8 cm. Därför är sitta nu bara tillåtet snett från sidan eller i profil.

**Stillbilderna** är i full storlek, 1080x1920, och ligger i samma mapp:
- A2-sitter-i-luften-ovanfor-sitsen-omgang-2-ruta-30.jpg (ny, snett från sidan; omgång 1:s A-bild är orörd);
- B-arm-last-rakt-ut-ruta-90.jpg;
- C-fot-inne-i-soffan-ruta-150.jpg;
- D-sitter-i-luften-bredvid-sitsen-ruta-210.jpg;
- E-kontroll-sitter-ratt-ruta-270.jpg.

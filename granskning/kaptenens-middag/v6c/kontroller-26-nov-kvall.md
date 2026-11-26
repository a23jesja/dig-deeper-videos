# Kontrollerna för v6c: v6 som planterat fel (26 nov kväll)

Varje kontroll är körd på v6, alltså `leverans/kaptenens-middag/kaptenens-middag-v6.mp4` (md5 837784f4) och dess kod. Den ska fälla de rutor som den oberoende granskningen hittade. Loggarna ligger i samma mapp.

dinner_check körs på dagens kod. Den skiljer sig från v6 bara i bild 4, där v6b ändrade ögonlocket. Ingen av rutorna nedan ligger i bild 4.

## Punkt 2: skägget har kilar och fläckar (ny kontroll, `scripts/seam_check.py`)

**Hur den mäter:** varje gräns mellan två ritade delar har en tuschlinje. Kontrollen letar efter skäggets brunt (64, 31, 18) och ärmens rött (101, 19, 29) inom 6 px från varandra, utan tusch (R under 48) inom 4 px. Det betyder att en del har skurits in i en annan.

**Resultat på v6:** FAIL på alla 264 skäggrutor (`seam-check-pa-v6.txt`).
- Granskningens rutor 515, 518, 522, 525, 550, 553 och 560 fäller alla.
- Kontrollen hittade dessutom samma fel i bild 1, 2, 9 och 15b. Skäggets tuschlinje saknas där rocken möter skäggets underkant, till exempel ruta 0 och 50 (störst i ruta 65).
- Den gamla beard_check fällde aldrig, eftersom den uteslöt hela bålen.

**Var den körs:** seam_check ingår nu i `scripts/dinner_render.sh` och körs på varje rendering.

## Punkt 3: regel 8, ett huvud över en kind, ett öra eller en tinning

**Varför den missade:** regel 8 räknade bara en inre ansiktsellips (0,8 av radien och 0,6 på höjden). Den tillät dessutom 2 träffar. Kind, öra och tinning låg utanför ellipsen.

**Rättat:** kontrollen räknar nu hela huvudet med öronen (1,12 av radien i x och 96 punkter), och 0 träffar tillåts. Det gäller alla figurer.

**Resultat på v6:**

| Bild | v6-rutor som fäller | Kommentar |
|---|---|---|
| 9 | 399–468 | kaptenen under sjömannen; innehåller granskningens 441–462 |
| 12 | 561–614 | pojkens huvud under sjömannen |
| 11 | 501–521 | ny träff: kaptenen under sjömannen |

## Punkt 5: händer utan arm och pojken enarmad

**Varför den missade:**
1. Regel 10 godkände en arm så snart 25 % av handen syntes. En hand utan ärm räknades alltså som en arm.
2. Kontrollen trodde att den bortre armen ritas framför kroppen upp till |sin| 0,5. Riggen ritar den bakom redan från 0,15 (ARM_WIPE).
3. En ärm som ligger över rocken eller skjortan i samma färg räknades som synlig, men den läses inte.
4. limb_check räknar händer och kontrollerar att varje hand sitter vid sin arm. Den bedömer inte om armen syns, och därför släppte den felen.

**Rättat:**
- En arm syns bara genom sin ärm, och minst 25 % av ärmen måste synas.
- En hand som syns (minst 10 %) utan det fäller som "hand utan arm".
- Är handen dold krävs halva ärmen.
- För rock och skjorta räknas ärmen bara där den ligger utanför bålen.
- Regeln gäller från 30 % figurhöjd. Tidigare gällde den från 50 %.

**Resultat på v6** (`dinner-check-pa-v6-sammanfattning.txt`):

| Fel | Bild | v6-rutor |
|---|---|---|
| Kaptenens hand ur rocken | 2 | 48–80 |
| | 15b | 705–725 |
| Kaptenens fingrar bakom västen | 1 | 0–47 |
| | 11 | 501–560 |
| Pojken enarmad (alla tre kvartsbilderna) | 1 | 0–47 |
| | 7 | 261–362 |
| | 15a | 684–704 |

**Mer än granskningen listade:** ingen av de här träffarna stod i granskningen, och du avgör om de ska gälla:
- Kaptenens närmre hand fäller i 1, 2, 9, 11 och 15b. Ärmen ligger över rocken.
- Pojkens närmre hand fäller i 1, 7 och 15a. Armarna ligger i kors över skjortan, och det är "knäppta händer".
- Sjömannens bortre hand fäller i 1 och 9.

## Fyllnaden i tunern

**Varför 15a gick igenom på 37 och 47 %:** en midjebild räknade golvet under figuren ner till bildens nederkant.

**Rättat:** varje egen figur mäts nu från huvudet till sina egna fötter, eller till bildens nederkant.

**Granskning av v6:s kameror** (`tuner-audit-v6.txt`, `node scripts/dinner_v6_tune.mjs --audit`):

| Bild | Fyllnad | Med i granskningen |
|---|---|---|
| 1 | sjömannen 40 % | ja |
| 3 | sjömannen 56 % | **nej** |
| 7 | sjömannen 51 % | **nej** |
| 9 | kaptenen 42 % | **nej** |
| 11 | kaptenen 42 % | **nej** |
| 14 | pojken 51 % | ja |
| 15a | pojken 39 % | ja |

Bild 3, 7, 9 och 11 fyller alltså också under 60 % med det här måttet. Kaptenen sitter, och fyllnaden räknas till hans fötter. Ska 60 % gälla även för dem i v6c?

## Kvar

- **De gamla planterade felen i dinner_check** (headPeek, hide40, oneArm, frontArm och de andra) fäller fortfarande. Det bevisar inget förrän filmen själv klarar kontrollen, så de körs igen på v6c.
- **Punkt 4, ärmränderna som korsas,** och **punkt 9, ögonlocket över pupillen,** har ännu ingen kontroll. Det görs i morgon före rättelserna.

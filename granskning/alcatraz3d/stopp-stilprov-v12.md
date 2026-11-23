# STOPP: stilprovet v12, Alcatraz i ny stil (de första 9,5 s), omgång 4 (den sista), 23 november 2026 kl. 08:20

## Fil

`leverans/alcatraz3d/stilprov-alcatraz-v12.mp4`
- 1080×1920, 30 fps, 9,5 s, 285 rutor, med ljud (v9b:s mix, oförändrad).
- 11 496 138 B, md5 1ee1314a5cd8864c6ae5f0d37cb57e79 (`md5-v12.txt`).

**Före och efter:** `granskning/alcatraz3d/fore-efter-v12/`, med det gamla överst och v12 under, på samma rutor. Bladen:
- p0: bild 1 mot den platta v4;
- p1: bild 3, attrappen;
- p2: bild 5, rutorna 223–241 där huvudet hoppade i v11;
- p3: bild 2, konen;
- p4: bild 4, plus en ruta i 360 px;
- p5: bild 5, fläcken;
- p6: bild 2, handen och attrappen i full storlek.

**Plattorna:**
- 64 sampel, och 48 för våningarna, med brusreducering och samma brus i varje ruta.
- 9,7–14,6 s per ruta på grafikkortet.
- Varje bild renderades för sig, ett Blender-jobb i taget.

## Vägen: attrappen är det godkända platta v4-huvudet

Fakehuvudet i 3D är borta. Attrappen är nu den platta v4:ns egen ritning (`fakeHead`, kopierad oförändrad till `src/craft/alcatraz3d/flatprops.ts`; `src/craft/alcatraz/` är orörd).
- **Bild 2 och 4:** ritningen står som ett kort på kudden, vänt mot kameran. Gallret framför skymmer det rätt, och lampornas ljus ligger på kudden runt det.
- **Bild 1 och 3:** där står inget framför huvudet, så den platta ritningen läggs exakt över kortet. Färgerna och bläcket blir då v4:ns egna; genom Blenders färghantering blev kortets ansikte gråbeige.
- **Handen och ficklampan i bild 1 och 3:** v4:ns godkända ritning (`heldTorch`) med hela konen till huvudet.
- **Vaktens hand i bild 2:** samma ritning, ovanpå riggens knytnäve.

## Punkterna

| # | Punkt | Rättning |
|---|---|---|
| 1 | attrappen hel och fri i bild 3 medan den nämns | **Bild 3 är nu en närbild på attrappen** på kudden, utan vakt (enklare). Kameran står precis framför gallret mellan stav 3 och 4, och ovanför mittbandet, så inget galler och ingen lampa når in i bilden. Huvudet är helt och fritt i alla 42 rutor (blad p1). |
| 2 | huvudet hoppar i bild 5 | Huvudet stannar i riggens tre kvarts ritning hela bilden. Vridningen är 40–46°, och ansiktets vinkel är −50 till −44; ritningen byter till sidovyn vid −58. I v11 korsade 26–34° den gränsen. Ögonen gör tittandet (enklare). Blad p2 visar rutorna 223–241: samma ritning i varje ruta. |
| 3 | ett upplyst galler som en pinne, och konen som slocknar | **Ficklampan i Blender varken lyser på eller skyms av gallret** (ljuslänkning i `set.py`), så inget galler lyser upp till en pinne. **Konen är v4:ns kon och hel från linsen till fläcken på attrappen** i varje ruta. Den slutar inte vid gallret. Lampan svänger inte längre utan hålls still på attrappen (enklare), och kameran står till vänster, så att konen löper fritt från lampan till attrappen (blad p3). |
| 4 | handflatan bakom lampan | v4:ns godkända grepp: handflatan och tummen bakom, skaftet över handflatan och fyra fingrar runt det framtill (blad p6). **Riggen är inte ändrad.** |
| A1 | attrappen och alla ansikten i platt Knopp-stil | Attrapperna är v4:ns platta huvud i alla bilder. Vakten och fången är det frysta utseendet. Inga 3D-ansikten finns kvar. |
| A2 | bild 1 minst lika tydlig som v4, med synlig kudde och nattljus | Samma uppställning som v4: huvudet stort på den vita kudden, handen med ficklampan nere till höger och konen på huvudet från ruta 1. Natten är kall och mörk (gångens lampor på 25 %) med ett varmt sken runt huvudet. Blad p0 visar v4 och v12 sida vid sida. |
| A3 | en hel ljuskon från lampan | I bild 1, 2 och 3 är konen hel från lampans lins till fläcken. |
| A4 | bild 3 och 5 enklare | Bild 3 är en närbild på attrappen utan figur. I bild 5 står huvudet i en ritning, och ögonen tittar. |
| B1 | bild 4: nedre och mellersta attrappen läsbara i telefonstorlek | Korten är 1,5 gånger större, gallret är tunnare och utan mittband (det låg över den mellersta), räcket är glesare och kameran står längre bak, så att golvbjälklaget inte skär den nedre. **Ansiktena är cirka 58–71 px** breda, räknat ur kamerans projektion (förut 45–50 px), och alla tre är hela (blad p4 och rutan i 360 px). **De tänds en i taget**, och kortets ljusstyrka följer dess egen lampa (`attrapperna-ljus-v12.txt`, medelvärdet av 40 × 40 px på huvudet): den nedre 140 → 163 vid 0,4–0,7 s, den mellersta 143 → 166 vid 1,0–1,3 s och den övre 132 → 171 vid 1,6 s. |
| B2 | fläcken i bild 5 har en hård trappkant (rutorna 265–285) | Ficklampans kant är helt mjuk (blend 1,0, kon 11°). Blad p5. |

## Avvikelser att ta ställning till

1. **Bild 2:** attrappen ligger bakom gallret i cellen, och en stav går över dess ansikte (ansiktet är cirka 55 px, och glipan mellan stavarna cirka 45 px). I bild 1 och 3, där attrappen nämns och syns stor, är den helt fri.
2. **Önskan om ögonbrynen under skärmen** är fortfarande inte gjord.

## Kontroller (på v12)

- **a3d_check** (`a3d-check-v12.txt`): OK för bild 2 och 5. Fötterna ligger 0,00 px från golvpunkten, skuggan högst 3,76 px från den och lederna rör sig högst 5,6 px per ruta. Ingen fast sak står framför en figur, och hela figuren ligger i bild.
- **Planterade fel** (`planterade-fel-a3d-v12.txt`): alla fyra fälls (float, sink, behind och noShadow).
- **Flimmer** (`flimmer-v12.txt`): **0 fällda rutor inne i filmen**, och 0 även utan rörelsekorrigering. Största ruta 299 px (v11: 1 268). Sista rutan fälls som loop, men provet är filmens början.
- **Ingång** (`ingangskontroller-v12.txt`): första ljudet på 0,000 s, toppen i ruta 1 är 0,34, texten 1,5 s per rad och rösterna 0,27 s isär eller mer.
- **Det frysta utseendet:**
  - `git diff ad1a161` ger **0 rader** i designs, rig, clips, ink, stage och alcatraz/.
  - Riggen är inte ändrad, eftersom handen ritas ovanpå i `src/craft/alcatraz3d/`.
  - De åtta bildtyperna är därmed oförändrade. Jämförelsen med 0 px från STOPP v3 gäller.
- **En oberoende granskare** (ett nytt agentfönster utan mina slutsatser) har fått filen och kraven. Dess svar skickas separat.

# STOPP: stilprovet v11, Alcatraz i ny stil (de första 9,5 s), omgång 3 av 3, 23 november 2026 kl. 03:12

## Fil

`leverans/alcatraz3d/stilprov-alcatraz-v11.mp4`: 1080×1920, 30 fps, 9,5 s, med ljud (v9b:s mix). 11 574 310 B, md5 a17fb45abe97579c51581e17dca95f63 (`md5-v11.txt`).

**v10 (b9ac90ea) skickades aldrig.** I den pekade lampan uppåt igen i slutet av bild 2, och attrappen skymdes. Det fällde jag själv i bladen.

**Skickad kl. 03:12** i stället för 02:30. Orsaken: när jag stoppade en tidigare bakgrundsrendering startade dess slinga nya Blender-jobb, så två jobb gick samtidigt 01:40–02:10. Sedan kom två omtag av bild 2–3 för lampans vinkel.

**Före och efter:** `fore-efter-v11/`, med v9b överst och v11 under, på samma rutor. Bladen:
- p1-8: lampan, konen och vaktens rörelse;
- p2-3-4-9: fångens mössa, ljusfläcken och ögonvitorna;
- p5: bild 1;
- p6: bild 4.

**Plattorna** är renderade med 64 sampel (40 för de tre våningarna) i stället för 96 för att hinna. Brusreduceringen gör att skillnaden knappt syns.

## Punkterna

| # | Punkt | Rättning |
|---|---|---|
| 1 | staven och lampans vinkel | **Den lodräta staven är struken.** Kameran i bild 2–3 står lägre (1,3 m) och till vänster om vakten. Då ligger attrappen till vänster om honom, i höjd med eller under lampan, och syns fritt. I bild 2 sveper han lampan från golvet framför sig upp på attrappen. Lampans vinkel räknas varje ruta ur samma mål som Blenders ficklampa (`torchTarget`, med samma kurva som set.py), så att lampan, konen och fläcken på kudden sammanfaller. Konen är mjuk, löper längs lampans egen axel och slutar vid gallret. I bild 3 pekar lampan på samma huvud, nästan vågrätt åt vänster i båda bilderna, så vinkeln fortsätter över klippet 96→97 (bladet p1-8). |
| 2 | mössan genomskinlig med söm | Det var mitt fel. Konturerna återställdes inom en ruta kring figuren, och mössans kant låg utanför den. Dessutom togs den mörka mössan för bläck. Nu behandlas hela bilden, och konturen känns igen på bläckets färg, inte på mörker. Mössan får samma ljus som resten. |
| 3 | mössan sitter inte fast | Huvudet vrids högst 34° (förut 56° tillsammans med en lutning). Riggen håller mössan på huvudet. |
| 4 | fläcken bakom honom | Ficklampans fläck är smal (8°) och går från väggen till höger om honom ner till ventilen. Den nuddar aldrig hans siluett. |
| 5 | bild 1 | Kameran ser ner på dockan ovanifrån. Bakom den syns bara kudden och sängen, inga varma gångväggar. Ficklampans fläck (11°) sveper in från kuddens kant till huvudet, och huvudet kastar skugga på kudden. Ljuset är samma kalla natt som i bild 2–4, och kudden är vit. |
| 6 | bild 4 | (Se också B nedan.) **Kupolen:** de sovande har filten över hela kropp och huvud, en lång puckel, och ingen rund kupol ligger på kudden. **Kuddarna** är fyrkantiga, så runda kuddar med en boll i mitten finns inte längre (kontrollerat i 360 px, se bladet). **Attrapperna tänds en i taget**, se B. Huvudena är 45–50 px. |
| 7 | rosa skära under munnen | Det är det frysta utseendets öppna mun: tungan och underläppen när han pratar. Samma ritning finns i den godkända bildtypen 01 stå och prata (v6, ruta 41), som visas bredvid i `punkt7-munnen-godkand-bildtyp.jpg`. |
| 8 | stelheten | I bild 2 sveper han lampan ner på sängen, och blicken följer med. I bild 3 vänder han huvudet och blicken mot kameran på "The head on it was fake". |
| 9 | gråa ögonvitor | De ljusaste pixlarna, ögonvitorna, får tillbaka sin ofärgade färg efter ljuset, precis som konturerna. Blekningen ligger bara på huden. |

## Förgranskningens A och B

**A, bild 1:** filten går upp till hakan med en ljus nedvikt kant. Bara huvudet syns på kudden, och inget rör går ner från hakan.

**B, bild 4:** varje attrapp får en egen stark, smal lampa i tur och ordning (på 0,25, 0,80 och 1,35 s in i bilden). När nästa tänds sjunker den förra till 35 %. Ljusstyrkan är mätt i den levererade filen, som medelvärdet av en ruta på 40 × 40 px på varje huvud (`attrapperna-ljus-v11.txt`):

| tid i bild 4 | nedre | mellersta | övre |
|---|---|---|---|
| 0,00 s | 98 | 85 | 44 |
| 0,60 s | **125** | 85 | 46 |
| 1,20 s | 114 | **107** | 44 |
| 1,70 s | 117 | 98 | **107** |
| 2,20 s | 117 | 99 | 115 |

Den nedre stiger 98 → 125 vid 0,3–0,6 s. Den mellersta stiger 85 → 108 vid 0,9–1,2 s. Den övre stiger 45 → 108 vid 1,4–1,7 s. Varje steg kommer medan de andra står still.

**Önskan om ögonbrynen under skärmen** hann jag inte göra.

## Kontroller (på v11)

**a3d_check** (`a3d-check-v10.txt`, körd på v11:s kod och plattor): OK för bild 2, 3 och 5. Fötterna ligger 0,00 px från golvpunkten, och ingen fast sak står framför en figur.

**Planterade fel** (`planterade-fel-a3d-v11.txt`): alla fyra fälls (float, sink, behind och noShadow).

**Helfigurskontrollen** ingår i a3d_check, och hela figuren ska ligga i bild i varje ruta: OK. Kontrollen fångade två fel på vägen, en kamera som stod inne i väggen och vakten skuren i bild 3, och båda är rättade.

**Flimmer** (`flimmer-v11.txt`): 0 fällda rutor inne i filmen, och 0 även utan rörelsekorrigering. Största ruta 1 268 px. Sista rutan fälls som loop, men provet är filmens början.

**Ingång** (`ingangskontroller-v11.txt`): första ljudet på 0,000 s, toppen i ruta 1 är 0,34, texten 1,5 s per rad.

**Det frysta utseendet:** `git diff ad1a161` ger 0 rader i designs, rig, clips, ink och stage.

## Det som återstår

- Önskan om ögonbrynen under skärmen.
- Plattorna har 64 sampel, och 40 för de tre våningarna.
- Huvudena i bild 4 är 45–50 px. Villkoret var att de skulle bli läsbara genom ljuset i tur och ordning, se B.

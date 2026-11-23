# STOPP: stilprovet v12h, Alcatraz i ny stil (de första 9,5 s), omgång 4 (den sista), 23 november 2026 kl. 10:40

## Fil

`leverans/alcatraz3d/stilprov-alcatraz-v12h.mp4`
- 1080×1920, 30 fps, 9,5 s, 285 rutor, med ljud (v9b:s mix, oförändrad).
- 9 790 756 B, md5 a23ef0dd5baa78a0efc8ca153981d13b (`md5-v12h.txt`).

**v12 (01ce182) skickades aldrig.** En oberoende granskare fällde den, och felen är rättade i v12b:
- **Bild 1 och 3:** konen låg över attrappens ansikte, så hakan och munnen blev gråa.
- **Bild 1:** kudden gick inte att läsa, och huvudet svävade.
- **Bild 2:** konen tonade ut före attrappen och var ritad ovanpå gallret bortom gallrets plan.
- **Bild 4:** kuddens framkant täckte hakorna.
- **Bild 5:** hyllan kastade en hård trappskugga i fläcken, och ögonbrynen gled in under kepsen.
- **Bild 2 och 4:** de lästes inte som natt.

**v12b skickades inte heller.** En andra oberoende granskare godkände punkterna 1–8, men fällde:
- **Natten:** bild 2 och 4 lästes som en upplyst gång i skymning.
- **Bild 4:** den översta attrappen satt på sängens huvudgavel.
- **Bild 5:** ögonbrynen gled fortfarande in under kepsen.
- **Bild 3:** handen skars av högerkanten.
- **Bild 2:** de tillbakaritade stavarna syntes som bruna fläckar bredvid strålen.

Allt är rättat i v12d:
- **Natten:** en kall nattton läggs över plattan under figurerna i bild 2, 4 och 5, så att alla fem bilderna är samma natt (blad p7).
- **Den översta attrappen** ligger kvar på sin kudde.
- **Ögonbrynen** lyfts bara lite och syns under brättet.
- **Handen** i bild 3 ligger hel i bild.
- **Stavarna** ritas bara inom strålens egen bredd.

**v12c skickades inte.** Nattonen gjorde attrapperna i bild 4 för mörka. Nu lyfter varje attrapps egen lampa dess huvud med ett mjukt sken som följer lampan.

**v12d och v12e skickades inte heller.** En tredje oberoende granskare (av v12c) fällde två saker till:
- **Bild 4:** den översta attrappens haka skymdes av sängens gavel. Kortet sitter nu 7 cm högre.
- **Bild 2:** de tillbakaritade stavarna syntes som bruna bitar bredvid strålen. De har nu plattans nattfärg och klipps exakt till konens form.

Bild 2 är också omramad, med mindre tomt golv och en större vakt och attrapp. I v12e skar den nya ramen vaktens kropp vid högerkanten. Helfigurskontrollen fällde det, och i v12f är kameran riktad om.

**v12f skickades inte heller.** En fjärde oberoende granskare fann att fångens ögonbryn hoppade upp på en ruta (242→243) och sedan låg halvt under kepsen. Orsaken är att riggen lyfter ögonbrynen 8 px i ett steg när "wide" passerar 0,3 (`flat.ts`). I v12g står "wide" på 0,28, och skräcken bärs av pupillerna, munnen, den bleka huden och svetten. Riggen är inte ändrad. Ögonbrynen syns hela och står still (blad p8).

Kroken är också starkare: det ritade huvudet är 12 % större (det växer uppåt från hakan och täcker fortfarande kortet), och både konen och ficklampan pekar på ansiktets mitt.

**v12g skickades inte heller.** En femte, kortare oberoende granskning godkände ögonbrynen, attrappen i bild 3, strålen och vakten i bild 2, attrapperna i bild 4 och hela filmen utan hopp och flimmer. Den fällde att ljuset i kroken inte nådde ansiktet. I v12h lyser ficklampans ljus upp ansiktet som i v4: ett starkt varmt ljus innanför ansiktets kontur. Dragen och hårfästet ritas om ovanpå, så att bläcket förblir mörkt.

**Före och efter:** `granskning/alcatraz3d/fore-efter-v12h/`, med det gamla överst och v12 under, på samma rutor. Bladen:
- p0: bild 1 mot den platta v4;
- p1: bild 3, attrappen;
- p2: bild 5, rutorna 223–241 där huvudet hoppade i v11;
- p3: bild 2, konen;
- p4: bild 4, plus en ruta i 360 px;
- p5: bild 5, fläcken;
- p6: bild 2, handen, konen och gallret i full storlek (ruta 76);
- p7: samma natt i alla fem bilderna (rutorna 11, 77, 118, 191 och 251);
- p8: ögonbrynen i bild 5, rutorna 237–248.

**Plattorna:**
- 64 sampel, och 48 för våningarna, med brusreducering och samma brus i varje ruta.
- 10,0–14,4 s per ruta på grafikkortet.
- Varje bild renderades för sig, ett Blender-jobb i taget.

## Vägen: attrappen är det godkända platta v4-huvudet

Fakehuvudet i 3D är borta. Attrappen är nu den platta v4:ns egen ritning (`fakeHead`, kopierad oförändrad till `src/craft/alcatraz3d/flatprops.ts`; `src/craft/alcatraz/` är orörd).
- **Bild 2 och 4:** ritningen står som ett kort på kudden, vänt mot kameran. Gallret framför skymmer det rätt, och lampornas ljus ligger på kudden runt det.
- **Bild 1 och 3:** där står inget framför huvudet, så den platta ritningen läggs exakt över kortet. Färgerna och bläcket blir då v4:ns egna; genom Blenders färghantering blev kortets ansikte gråbeige. Konen och dess sken ritas först och huvudet ovanpå, så bläcket och munnen är hela. En mjuk kontaktskugga ligger under hakan på kudden.
- **Handen och ficklampan i bild 1 och 3:** v4:ns godkända ritning (`heldTorch`) med hela konen till huvudet.
- **Vaktens hand i bild 2:** samma ritning, ovanpå riggens knytnäve.

## Punkterna

| # | Punkt | Rättning |
|---|---|---|
| 1 | attrappen hel och fri i bild 3 medan den nämns | **Bild 3 är nu en närbild på attrappen** på kudden, utan vakt (enklare). Kameran står precis framför gallret mellan stav 3 och 4, och ovanför mittbandet, så inget galler och ingen lampa når in i bilden. Konen ligger under huvudet. Huvudet är helt och fritt i alla 42 rutor (blad p1). |
| 2 | huvudet hoppar i bild 5 | Huvudet stannar i riggens tre kvarts ritning hela bilden. Vridningen är 40–46°, och ansiktets vinkel är −50 till −44; ritningen byter till sidovyn vid −58. I v11 korsade 26–34° den gränsen. Ögonen gör tittandet (enklare). Blad p2 visar rutorna 223–241: samma ritning i varje ruta. |
| 3 | ett upplyst galler som en pinne, och konen som slocknar | **Ficklampan i Blender varken lyser på eller skyms av gallret** (ljuslänkning i `set.py`), så inget galler lyser upp till en pinne. **Konen är v4:ns kon, starkare, och hel från linsen till skenet på attrappen** i varje ruta. Den slutar inte vid gallret. **Bortom gallrets plan står gallret framför strålen:** stavarna och banden projiceras ur samma geometri som plattan och ritas tillbaka över strålen där (blad p6). Lampan svänger inte längre utan hålls still på attrappen (enklare), och kameran står till vänster, så att konen löper fritt från lampan till attrappen (blad p3). |
| 4 | handflatan bakom lampan | v4:ns godkända grepp: handflatan och tummen bakom, skaftet över handflatan och fyra fingrar runt det framtill (blad p6). **Riggen är inte ändrad.** |
| A1 | attrappen och alla ansikten i platt Knopp-stil | Attrapperna är v4:ns platta huvud i alla bilder. Vakten och fången är det frysta utseendet. Inga 3D-ansikten finns kvar. |
| A2 | bild 1 minst lika tydlig som v4, med synlig kudde och nattljus | Samma uppställning som v4: huvudet stort på den vita kudden, handen med ficklampan nere till höger och konen på huvudet från ruta 1. Ett vidare objektiv (19 mm, precis vid gallret) visar kuddens kanter, filten och sängramen. Huvudet vilar på kudden med en kontaktskugga. Natten är kall och mörk (gångens lampor på 25 %) med ett varmt sken runt huvudet. Blad p0 visar v4 och v12b sida vid sida. |
| A3 | en hel ljuskon från lampan | I bild 1, 2 och 3 är konen hel från lampans lins till fläcken. |
| A4 | bild 3 och 5 enklare | Bild 3 är en närbild på attrappen utan figur. I bild 5 står huvudet i en ritning, och ögonen tittar. |
| B1 | bild 4: nedre och mellersta attrappen läsbara i telefonstorlek | Korten är 1,5 gånger större och står vid kuddens framkant, så kudden inte täcker hakorna. Gallret är tunnare och utan mittband (det låg över den mellersta), räcket är glesare och kameran står längre bak, så att golvbjälklaget inte skär den nedre. Gångens lampor står på 50 % (natt). **Ansiktena är cirka 58–71 px** breda, räknat ur kamerans projektion (förut 45–50 px), och alla tre är hela (blad p4 och rutan i 360 px). **De tänds en i taget**, och kortets ljusstyrka följer dess egen lampa (`attrapperna-ljus-v12h.txt`, medelvärdet av 40 × 40 px på huvudet): den nedre 85 → 147 vid 0,4–0,7 s, den mellersta 85 → 147 vid 1,0–1,3 s och den övre 79 → 147 vid 1,6 s. Den översta ligger på sin egen kudde. |
| B2 | fläcken i bild 5 har en hård trappkant (rutorna 265–285) | Ficklampans kant är helt mjuk (blend 1,0, kon 11°), och dess skuggor är mjuka (ljuskällan 0,25 m), så att hyllans hårda trappskugga är borta. Ögonbrynen går upp högst 0,1, så de syns under kepsens brätte. Blad p5 och rutan 276. |

## Avvikelser att ta ställning till

1. **Bild 2 och 4:** attrapperna ligger bakom gallret i cellerna, och stavar går över deras ansikten (i bild 2 är ansiktet cirka 55 px och glipan mellan stavarna cirka 45 px). I bild 1 och 3, där attrappen nämns och syns stor, är den helt fri.
2. **Bild 3:** i närbilden syns inget särskilt tecken på att huvudet är falskt. Det är samma platta ritning, närmare. Den oberoende granskaren noterade det som en svaghet, inte som ett fel.
3. **Bild 4 i telefonstorlek:** ansiktena är cirka 25–28 px. Tända läses de som huvuden med ansikte, men ögonen går inte att se. Den översta attrappens haka ligger i höjd med sängens gavel; den sista granskaren kallade det en risk att den kan läsas som att den sitter på gaveln.
5. **Bild 2:** attrappen ligger cirka 12 px från vänsterkanten och är mjuk och dämpad i skenet. Den syns som ett sovande huvud, men den är inte skarp.
6. **Bild 1:** v4:s gröna filt över kroppen syns inte. Bakom huvudet syns sängen och den mörka filten.
4. **Önskan om ögonbrynen under skärmen** är nu uppfylld i bild 5: de syns under brättet.

## Kontroller (på v12)

- **a3d_check** (`a3d-check-v12h.txt`): OK för bild 2 och 5. Fötterna ligger 0,00 px från golvpunkten, skuggan högst 3,76 px från den och lederna rör sig högst 5,6 px per ruta. Ingen fast sak står framför en figur, och hela figuren ligger i bild.
- **Planterade fel** (`planterade-fel-a3d-v12h.txt`): alla fyra fälls (float, sink, behind och noShadow).
- **Flimmer** (`flimmer-v12h.txt`): **0 fällda rutor inne i filmen**, och 0 även utan rörelsekorrigering. Största ruta 295 px (v11: 1 268). Sista rutan fälls som loop, men provet är filmens början.
- **Ingång** (`ingangskontroller-v12h.txt`): första ljudet på 0,000 s, toppen i ruta 1 är 0,34, texten 1,5 s per rad och rösterna 0,27 s isär eller mer.
- **Det frysta utseendet:**
  - `git diff ad1a161` ger **0 rader** i designs, rig, clips, ink, stage och alcatraz/.
  - Riggen är inte ändrad, eftersom handen ritas ovanpå i `src/craft/alcatraz3d/`.
  - De åtta bildtyperna är därmed oförändrade. Jämförelsen med 0 px från STOPP v3 gäller.
- **Oberoende granskare:** fem nya agentfönster utan mina slutsatser har granskat v12, v12b, v12c, v12f och v12g, och deras fel är rättade enligt ovan. Ändringen i v12h (ljuset på ansiktet i bild 1 och 3) har jag själv granskat i full storlek. Ingen oberoende granskare har sett v12h.

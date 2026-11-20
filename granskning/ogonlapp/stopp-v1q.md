# STOPP: The Pirate Eye Patch Trick, v1q (20 november 2026), omgång 3 av 3

**Kod:** commits 350e429, 8ee6168, 0e99f6c, 5a274d4, 2c49cab, cd0fa03, 5e22576, 14171ed, 27713bc, a3d20d1, cdb80d8, ddbf309, 3bc10e4, 31d5867 och 98ee489 (`engine/src/craft/shorts/eyePatch.ts` med flera).

**v1e–v1p skickades inte.** En ny oberoende granskare sa FAIL om v1m, v1n, v1o och v1p (se nedan). v1l stoppade jag själv efter min genomgång i full storlek: ett mörkt block vid hans huvud på däck, ett rep längs kamratens huvud i nobody, relingen framför hans fötter i real och en mörk platta under träsnittet. v1m rättar dem. (v1k låg som utkast i `stopp-v1k.md`, som du läste. Rättningarna efter v1k står under "v1k" nedan.)
- **v1e:** i videon satt resten av förra radens sista bokstav kvar i några rutor (punkt 7).
- **v1h:** i min egen genomgång gick flaggstången rakt ner i hans huvud i däcksnärbilden (vinkeln från v1g-rättningen). v1i filmar närbilden från 50°, med seglen bakom honom.
- **v1j:** i min egen genomgång stack armbågen ut i trick, eftersom den nya vinkeln från v1i-rättningen gav en ny vinkel på armen. v1k vrider honom 30°. Det här är tredje gången samma fel kommer tillbaka, så det finns nu ett test för det (se nedan).
- **v1f, v1g och v1i:** den oberoende granskaren (en ny agent för varje version, som bara fick videon och kraven) sa FAIL alla tre gångerna. Fynden och vad jag gjorde med dem finns under "De oberoende granskningarna" nedan.

Båda versionernas filer ligger kvar orörda.

## Filer (`C:\Users\sweje\dig-deeper-videos\leverans\eye-patch\`)

| Fil | Storlek | md5 |
|---|---|---|
| eye-patch-v1q.mp4 (36,16 s) | 24,2 MB | 546ba7af34b43c01c11b6b1ef1d4ad7f |
| eye-patch-v1q-telefon.mp4 (1080x1920, 10,1 MB, under 29 MB) | 10,1 MB | f9ab58a05df8c326a6e51eb0e3342781 |
| eye-patch-v1q-liten.mp4 (540x960) | 3,3 MB | 2c8c78ed2bb5e1e6654e5dc1737562b1 |
| thumbnail-v1q-1.png / -2.png / -3.png | | 28ffb37a56a8acb925455a99016e3ddc / 89669988afebad87079519369e5c7d66 / 72d9b5c44335840efc7928aef398f0b4 |

Jag har själv kontrollerat md5-summorna.

Granskningsmaterial (`C:\Users\sweje\dig-deeper-videos\granskning\ogonlapp\`):
- `v1q-sek0-5-10fps.jpg`: sek. 0–5 i 10 bilder/s, mobilstorlek;
- `v1q-4fps.jpg`: hela filmen i 4 bilder/s.

## De elva punkterna från granskningen av v1d

1. **Tummarna.** Tummens del i ritningen är kortad. Boken hålls 4 cm utanför kanterna, och händerna står lika långt isär som bokens grepp. Därför syns nävarna vid bokens sidor i varje bild. I v1g stod händerna 8 cm närmare varandra än greppen, och vid vissa linser gömde sig nävarna bakom boken. I v1l är boken vänd med omslaget mot oss: fingrarna ligger på omslaget och tummarna inne på sidorna, där de inte syns. Därför ritas inga tummar.
2. **Han läser.** Boken är vänd med sidorna mot honom och omslaget mot oss (se v1k nedan), och den är tippad så att sidorna vänds upp mot hans ansikte. Läsbilderna under däck är den första bilden efter "Flip the patch", alltså 596–661 ("In 2007…"), och 348–393 ("thirty minutes"):
   - Huvudet är vänt mot boken och sänkt.
   - Blicken går långsamt längs en rad från vänster till höger och sedan snabbt tillbaka till nästa rad, ungefär 1,15 s per rad. Huvudet följer med.

   Öppningen och slutet läser på samma sätt från ruta 1.
3. **Inte samma helbild tre gånger.** Bilderna skiljer sig nu åt:
   - calm, från hans vänstra sida;
   - myth, från hans högra sida och närmare;
   - verdict, ensam och längre bort, där han tittar upp mot oss;
   - trick, en halvbild rakt framifrån.

   Det nya testet för samma komposition (se nedan) ger 0 fel.
4. **Inte samma närbild två gånger.** "A very clever trick" (980–1031) är nu en halvbild med hela överkroppen och boken i stället för en närbild. Närbilden på lappen under däck finns bara i flip.
5. **Kamraten famlar.**
   - **Ny bild 73–157** ("One idea: so they never fought blind"). Han står vid bordet. Hans högra näve ligger på bordskanten och flyttas längs den i fyra steg. Pallen som skar hans fot är dold i den bilden. Den vänstra handen söker lågt i luften, huvudet vrids från sida till sida och blicken söker.
   - Ansiktet är oroligt: höjda ögonbryn, öppna ögon och en öppen, nedåtböjd mun. Det kisande ansiktet med låga lock läste som ett nöjt flin.
   - **Inga handflator upp.** Händerna hänger lågt och löst, lite ut från kroppen. Längre ut eller fram ritades handen med handflatan upp, och det såg ut som att han presenterade. Varje bild har sin egen pose, och han snubblar till i öppningen, i below och i test. I test är pallen dold, så att händerna inte svävar över den.
   - **"Who blew out the sun?!"**: han skriker med uppspärrade ögon, höjda bryn och vid mun. Huvudet ligger högre i bilden.
   - Flaskan och spegeln på bordet är dolda i alla hyttbilder, så ingen hand svävar över något.
6. **Stången på kamraten** var hans hårpiska, som ritades fram över kragen. Kamraten har nu kort hår (`MATE_SHORT_D`), utan piska.
7. **Bokstavsresterna.** Orsaken var undertextens tjocka kontur (text-stroke). Den sträcker sig utanför det som webbläsaren räknar som textens yta, så när orden byttes målades inte den delen om. Därför hängde konturen av förra radens sista bokstav kvar i några rutor, bara i den renderade videon.
   - Varken ett nytt element per rad (v1e) eller ett band som målas om varje ruta räckte.
   - Nu ligger varje rad på ett eget lager (`will-change`), som kastas helt när orden byts.
   - **Kontrollerat i video:** jag har renderat rutorna 180–200 och 495–512 och läst rutorna i full storlek. "K" bredvid "THE SUN" och "Y" bredvid "USED TO IT" är borta. I v1e fanns de kvar i 1–6 rutor.
8. **Stillastående bilder:**
   - Kamraten rör sig hela tiden: huvud, blick, händer och vikt, med en period som aldrig stannar.
   - Piraten läser rad för rad.
   - Det nya testet för 1 s med under 0,6 % rörelse ger 0 fel på v1q.
9. **Klippet på "Flip".** Den mörka närbilden börjar på första ordtiden för "Flip" i röstens tidsfil, minus 0,03 s (ruta 530, 17,67 s), och svischet ligger på samma ruta.
10. **Öppningen rör sig från ruta 1.** Piraten läser med ögon och huvud som går längs raderna, och kamraten famlar. Vid 0,35 s snubblar han till framåt (lutning och vikt, inga steg) och tar sig igen. Ett knarr hörs på ruta 1 och en duns vid 0,4 s.
11. **Väggbilden:**
    - Varje hatt är en enda svart form, som en tricorn ser ut framifrån: en låg kulle, brättets två sidhörn uppvikta och framhörnet ner mot pannan, med en ljus linje där brättet viks upp. Kullen och brättet ritades tidigare som två delar, som svävade och sedan såg ut som horn.
    - Varje sabel hålls av en ärm med en knuten hand runt fästet, och den andra armen hänger med en knytnäve.
    - Skeppet är mindre och står längst till höger, fritt från den tredje piraten.
    - En skeppslykta hänger på en järnarm bredvid bilden: lysande glas mellan fyra mörka hörnstolpar, mörk botten, en fyrsidig hätta och en ring. Glöden på väggen kommer från den.

**Det mindre:**
- Kamratens närbild har huvudet högre i bilden.
- Den lysande guldramen var spegeln i hytten. Den är dold i alla hyttbilder nu.
- Det blå föremålet i hörnet (below, 230–297) syns inte längre, eftersom linsen har flyttats lite närmare.

## De sex missarna i testerna

| Miss | Förklaring | Nu |
|---|---|---|
| 1. tummarna mitt på sidan | Grepptestet läser handflatans punkt mot bokens greppunkt. Tummens ritade längd ingår inte i figurens kropp, så en för lång tumme syns inte i testet. | Rättat vid källan: tummen är kortad i ritningen (cast.ts). Inget nytt test, eftersom tummens längd nu är fast för alla filmer. |
| 2. bokstavsresterna | Ett fel i webbläsarens återgivning, som bara syns i den renderade videon. Testerna läser scenen, inte bildpunkterna, och stillbilderna renderas en och en, så felet syns inte där. | Rättat vid källan (eget lager per rad). Kontrollerat genom rendering av videorutor runt två radbyten. |
| 3. stången framför kragen | Hårpiskan är en del av ritningen, inte en kroppsdel, så kroppstesterna ser den inte. | Kamraten har kort hår. |
| 4. handen som svävar | Inget test fanns. | **Nytt test (hover):** en hand som ligger över en liten sak i bilden, på ungefär samma djup (inom 30 cm), utan att hålla den, i 0,3 s. Planterat fall BC (handen över en kopp) fälls. Kontrollen BD (samma kopp, händerna nere) klarar sig. |
| 5. samma närbild igen | Testet "twice" krävde samma linsläge inom 35 cm och 12°. Två närbilder från olika ställen med samma komposition gick igenom. | **Twice läser nu också kompositionen:** samma figurer, lika stora (inom 15 %), med huvudet på samma ställe i bilden (inom en tiondel), linsen vriden under 30° och på samma plats. Det hittade genast fyra par i mitt första v1e-bygge, och alla fyra är rättade. |
| 6. stilla bilder under 2 % | Fönstret var 2,5 s med 2 %, och v1d stod helt stilla 0,7–0,8 s i taget. | **Ett andra fönster:** 1 s med under 0,6 % av höjden. I `proof-cuts` fälls exakt de fyra planterade felen (C1-b hoppklipp, C3 stilla 2,5 s och 1 s, C5-z samma bild igen). Kontrollerna rör nu huvudet lite, så att bara C3 står stilla. |

**Utskrifter** (`C:\Users\sweje\dig-deeper-videos\granskning\ogonlapp\`):
- `proof-cuts-motion-v1h.txt`;
- `proof-motion-v1h.txt` och `proof-body-v1h.txt`: alla planterade fall fälls, och kontrollerna AJ, AO, AX, AZ, BB och BD klarar sig;
- `check-v1q.txt`.

Biblioteksfilmen `shot-library` ger fortfarande 0 fel med de nya testerna.

## Testerna på v1q (hela filmen, varje ruta)

| Test | Resultat |
|---|---|
| film check (text, bubblor, klipplängd, kropp och rörelse med alla nya tester) | OK, 19 bilder, 36,1 s |
| motion | 0 fel |
| body | 0 fel |
| grips | OK, 680 avläsningar |
| QA (short_qa) | EMPTY i bild 12, 13, 16, 18 och 19: det mörka golvet i nedre tredjedelen, som i tidigare hyttfilmer. BIGFLAT i bild 2: den mörka väggen bakom kamraten vid bordet täcker 44 % sedan pallen dolts. |

## De oberoende granskningarna

### v1f

Granskaren extraherade alla rutor i full storlek, gjorde kontaktark i 4 och 10 bilder/s och läste ungefär 40 rutor i full storlek. Undertexterna mätte den vid alla 49 radbyten: inga rester. Bilderna ligger i `C:\Users\sweje\AppData\Local\Temp\claude\499ae2b6b7d0911d\becf1467-c80d-4c82-af69-a7ba375e67f6\scratchpad\indep-v1f\faults\`.

**Rättat:**
- **Hoppklipp 839→840** (real → nobody): samma figur, storlek och pose; bara bakgrunden vred sig. Mitt hopptest missade det, eftersom kameran vred sig 63°. En kortfigur vänder sig alltid mot linsen, så en ny vinkel ger samma bild av honom. Testet läser nu också hur ansiktet är ritat: inom 12° och samma spegling räknas som samma bild. Med v1f-koden fäller testet just 840. "nobody" är nu en närbild mot himlen. Lappens avsiktliga matchklipp (flip) är märkt `matchCut` med skälet, och testet släpper bara det.
- **Tummarna** som klumpar på sidan (punkt 1 ovan).
- **Kamratens handflator upp** i test och slutet, och en hand som svävade över kistan i mins: händerna är lägre och lösare.
- **Pallen skar hans fot** i sek. 2–5: den är dold i bordsbilden.
- **Kamraten i profil på ruta 0:** i öppningen är han vriden 48° i stället för 65°, och huvudet svänger bara hälften så mycket.
- **Armbågen som stack ut** i calm (370): calm och verdict är vridna åt andra hållet, så att den bortre armbågen ligger nere.
- **Lyktan** gick inte att läsa som en lykta och nuddade texten: ny lykta bredvid bilden.
- **Ansiktet på "Arr. Which eye was it?"** var det nöjda läsleendet. Nu tittar han upp med höjda, sneda bryn: han undrar.
- **Ingen reaktion på "can see":** hans öppna öga spärras upp på "can".

**Inte ändrat, och varför:**
- **"Lappbytet visas aldrig, det ser ut som ett kontinuitetsfel."** Att lappen bara byter öga i ett klipp är beslutat: ingen hand till ansiktet. Det är de två närbilderna med svisch som du godkände i v1d. Säg till om Jesper vill se det annorlunda.
- **"Undertexterna blinkar för fort"** (0,2–0,3 s för vissa rader). Undertexterna följer rösten två eller tre ord i taget, som i alla våra Shorts. Regeln om 1,5 s per rad gäller frågan på skärmen, och den står 2,4 s.
- **"Det syns bra i hytten fast det sägs att man inte ser någonting."** Det är medvetet: mörkt men läsbart på mobilen, som du skrev om v1d.
- **"Fakta visas inte: ingen strid, inget MythBusters-test."** Vi bygger bara med godkända bildtyper. Det som sägs visas med det de har: kamraten famlar och snubblar, solen bländar, och träsnittet visar pirater utan lapp.
- **Bubblans spets pekar mot pannbandet** i närbilden. Bubblan står ovanför huvudet, så spetsen når huvudets överkant. I en närbild där huvudet fyller bredden finns ingen plats vid munnen.

### v1g (rättat i v1h och v1i)

En ny granskare, som också fick våra fasta beslut (lappen byter öga i ett klipp, undertexter två eller tre ord, bara godkända bildtyper), läste ungefär 70 rutor i full storlek. Bilderna ligger i `C:\Users\sweje\AppData\Local\Temp\claude\499ae2b6b7d0911d\becf1467-c80d-4c82-af69-a7ba375e67f6\scratchpad\indep-v1g\`.

**Rent enligt granskaren:**
- undertexterna vid varje radbyte;
- inga hoppklipp utom lappens matchklipp;
- inget huvud i ren profil;
- ingen kropp genom något fast;
- lyktan på sin ring och arm;
- mörkret går att läsa;
- loopen.

**Rättat i v1h och v1i:**
- **Tummar utan näve** i öppningen, slutet, real och nobody: händerna står nu lika långt isär som greppen (se punkt 1).
- **Flaggan satt på hans huvud** i däcksnärbilden (se v1i nedan).
- **Svärdet genom grannens hatt** i träsnittet: mittenpiratens klinga böjer sig nu bakåt över hans eget huvud.
- **Calm och trick var samma bild:** calm visas längre bort, med mer av rummet, och trick från en annan vinkel (se v1i nedan).
- **Nästan stilla i cirka 1,1 s** efter att han tittat upp (verdict och trick): han nickar lätt och svajar.
- **Bubblornas spets** gick in i pannbandet och håret: den pekar nu mot huvudets topp och slutar före den.
- **Kamratens hand på bordet** blev en öppen C-form, som en handflata uppåt, när armen vreds (ruta 150, min egen granskning av v1g): den är en knuten näve hela bilden.

**Inte ändrat:**
- **Halsen** är en mörk stav i närbilderna. Det är figurens frysta utseende.
- **Linjerna i träsnittet** liknar persienner. Det är träsnittets skuggning, och himlen ritades så i v1d.
- **Bild 2 är 2,83 s** i öppningens 0–5 s. Den rör sig hela tiden: näven går längs bordskanten och huvudet vrids.
- **Kontaktskuggan** under kamratens näve syns vid 2,4 s men inte vid 5,2 s. Näven ligger på bordets framkant, och där faller skuggan över kanten.

### v1i (rättat i v1j)

En tredje ny granskare läste 15 rutor i full storlek och över 20 utsnitt i 2–4 gånger förstoring. Bilderna ligger i `C:\Users\sweje\AppData\Local\Temp\claude\499ae2b6b7d0911d\becf1467-c80d-4c82-af69-a7ba375e67f6\scratchpad\indep-v1i\crops\`.

**Rent enligt granskaren:**
- första rutan och loopen;
- alla 54 radbyten i undertexterna;
- bubblornas spetsar;
- inget huvud i profil;
- bokgreppen;
- träsnittets svärd;
- lyktan;
- lappens klipp;
- uttrycken;
- mörkret.

**Rättat i v1j:**
- **Stången, flaggan och tågen mot hans huvud** i fyra däcksbilder (sun, deck2, patch och real): flaggstången står nu en bit åt sidan, där den inte syns bakom honom i någon bild. Däcksnärbilden filmas från 90° på 1,68 m höjd, med hav mellan huvudet och bommen. Jag har prövat sju vinklar och höjder och läst var och en.
- **Kamratens näve sjönk in i bordskanten** (bild 2): den ligger nu på bordsskivan, strax innanför kanten. Hans andra hand hänger en bit ut från höften i stället för framför den.
- **Armbågen stack ut igen i verdict:** den kom tillbaka när händerna fick bokens bredd. Verdict är nu vriden −34°, och armbågen ligger nere hela bilden.
- **Myth och trick var lika:** trick filmas nu från −15°, och han är vriden 30°.
- **Den blå skärvan i hörnet** i calm: linsen har flyttats in, som i below.

**Inte ändrat:**
- **Lappen sitter på olika öga på däck och under däck.** Det är filmens idé, med vänster öga under däck och höger på däck, och beslutat sedan v1b. Granskaren bad om bekräftelse, så jag tar upp det här.
- **Bild 2 visar inte "fought blind".** Det är bildtyperna (ingen strid).
- **Bild 2 är 2,83 s.**

## v1k (rättat i v1l och v1m): din granskning, din oberoende granskare och min

**Boken.** Han läste på bokens baksida, eftersom sidorna var vända mot linsen.
- Boken är nu vänd med omslaget mot oss och sidorna mot honom.
- Omslaget är ett läderband med en guldlinje längs kanten, en kompassros och guldband på ryggen.
- Ögonen och huvudet följer fortfarande raderna.
- Hans fingrar ligger på omslaget, och inga tummar ritas på sidorna.
- Armarna och 04:ans grepp är oförändrade.

**Fyra lika hyttbilder** (calm, myth, verdict och trick), och real lik deck2.
- calm är liten och vid, med rummet runt honom.
- myth är en halvbild där han läser.
- verdict visar honom med kamraten bakom vid bordet, där han känner längs bordskanten.
- trick står åt sidan i bilden.
- real är vid på däck.
- nobody är nu kamraten på däck som kisar och skakar på huvudet ("Nobody knows"). Han filmas från en högre lins mot havet, med bommen högt ovanför och utan flaggstången framför linsen. Piratens närbild där var samma bild som patch, vilken storlek den än fick.

**Testet för samma bild två gånger är skärpt.** En kortfigur ritas likadant från alla håll, så linsens vridning räknas inte längre. Samma figurer, inom 30 % i storlek och inom 0,18 av bildens bredd och höjd, räknas som samma bild.
- Med v1k-koden fälls alla fyra hyttbilderna, real–deck2 och nobody–patch.
- I `proof-cuts` står kontrollerna nu på egna platser, och exakt de planterade felen fälls: hoppklippet C1-b, C3 som står stilla och samma bild igen i C5-z (`proof-cuts-motion-v1l.txt`).

**Stillastående figur.** Ett nytt test fäller en sekund där ingen led rör sig mer än 1,2 cm och huvudet vrids mindre än 3°, även om kameran glider. Det hittade två fel i min egen kod:
- **Nicken efter att han tittat upp** syntes aldrig. Den låg före tittposen, och den senare posen höll honom stilla bilden ut.
- **Kamraten frös efter snubblet** av samma skäl.

Båda är rättade, och testet ger 0 fel på v1q.

**Nästan profil i verdict, och drag som skärs av konturen** (verdict, trick och slutet): när han tittar upp mot oss vrids huvudet nu mot linsen.

**Däck:**
- **Bommen genom huvudhöjd** i första däcksbilden: linsen står högre, och bommen ligger fritt ovanför båda huvudena.
- **Lyktan vid käken** i deck2: linsen står lägre, så lyktan döljs bakom honom.

**Träsnittet:** bilden har marginal i alla rutor (kanten flimrade i v1k), och den vänstra piraten skärs inte längre genom ansiktet i närbilden.

**Hörnen:**
- **Handfliken i närbilderna:** nävarna ligger dolda bakom boken, med händerna tätare.
- **Den mörka plattan under träsnittet:** linsen tippas lite uppåt.

**Underarmstestet,** smalnat av som du sa: det fäller en fri hand vars underarm ritas kortare än 30 % av överarmen i 0,3 s. En hand som håller en sak fälls inte. Utfall på biblioteksfilmen (`library-motion-v1o-tests.txt`):
- **01** fälls, rutorna 24–103 (17 %);
- **06** fälls, ruta 689 (29 %);
- **04:ans bokgrepp** klarar sig;
- **08 (handen på bröstet)** fälls i rutorna 890–911 (8 %). Det är Jespers sak att avgöra. Filen 08 är orörd.

Armbågstestet gäller alla filmer, som du sa, och fäller 04 (86°). Filen 04 är orörd.

## v1m (rättat i v1n): en ny oberoende granskare

Bilderna ligger i `C:\Users\sweje\AppData\Local\Temp\claude\499ae2b6b7d0911d\becf1467-c80d-4c82-af69-a7ba375e67f6\scratchpad\indep-v1m\crops\`.

**Rättat:**
- **Ett brunt block som svävade över havet** i två däcksbilder: det var hyttens rum, som står 42 m bort i samma värld. Det heter nu "cabin room" och är dolt i alla däcksbilder.
- **Kamratens arm över piratens näve,** och en näve utan underarm, i verdict: kamraten står bakom och famlar med händerna lågt i stället för att sträcka sig till bordet.
- **Hoppklipp från trick till slutet:** trick står på andra sidan bilden.
- **Kamratens bortre öga skars av huvudkonturen:** huvudet svänger mindre.
- **Lyktan under hakan i deck2:** linsen står lägre.
- **Piraten stod stilla 1,8 s i real:** han läser rad för rad.
- **En tom platta längst ned i real:** real filmas från en högre lins som ser ner på honom på däck, utan tunnan och repet som skars av kanten.

**Inte ändrat:**
- **Kamratens näve på bordet i bild 2 saknar kontaktskugga.** Den ligger 1 cm ovanför skivan och sjönk in i kanten när den låg lägre.
- **Små skärvor vid kanterna:** seglet uppe, en lucka nere i real och en låda nere i deck2. Det är däckets egna saker.
- **Sista bilden är den första igen.** Det är loopen.

## v1n (rättat i v1o): en ny oberoende granskare

Granskaren hittade ett verkligt fel och några mindre saker. Den fann ingenting fysiskt omöjligt, inga flytande saker, inga svävande händer, inga utstickande armbågar och inga ansiktsdrag som skars av. Bilderna ligger i `C:\Users\sweje\AppData\Local\Temp\claude\499ae2b6b7d0911d\becf1467-c80d-4c82-af69-a7ba375e67f6\scratchpad\indep-v1n\`.

**Rättat:**
- **Samma bild två gånger: kamraten i below (bild 4) och i mins (bild 7).** Testet släppte igenom det, eftersom det bara jämförde bilder där linserna stod inom 4 m från varandra, och här stod de 4,4 m isär. Nu jämförs bilder där figurerna står inom 3 m från där de stod i den andra bilden. Det fäller mins–below och test–dark.
  - mins och test filmas nu så att kamraten står åt sidan i bilden.
  - `proof-cuts` fäller fortfarande exakt de planterade felen (`proof-cuts-motion-v1o.txt`).

**Inte ändrat:**
- **Flaggstångens gula knopp syns i undertextbandet i deck2.** Tippar jag linsen hamnar hans ansikte under texten, och det fäller testet. Knoppen är långt från huvudet.
- **Den bruna fyrkanten i undertextbandet i sun** är en lapp som är sydd på seglet. Den sitter på seglet och svävar inte.
- **Piratens högra näve i real når bara hörnet av boken** i en vid bild där han är liten.
- **Bild 2 är 2,83 s.**

## v1o (rättat i v1p): en ny oberoende granskare

Bilderna ligger i `C:\Users\sweje\AppData\Local\Temp\claude\499ae2b6b7d0911d\becf1467-c80d-4c82-af69-a7ba375e67f6\scratchpad\indep-v1o\`.

**Rättat:**
- **Kamratens näve svävade över bordet** i bild 2. Den låg 10 cm upp från skivan. Lägre gick den in i skivan, eftersom armen inte nådde längs hela kanten. Nu ligger den 7 cm upp och glider en kortare sträcka längs kanten, och bodytestet ger 0 fel.
- **Hans händer såg ut som handflator upp** i test: armarna hänger nu ner.
- **Hans bortre öga låg mot huvudkonturen** i närbilden: huvudet är mindre vridet.

**Inte ändrat:**
- **verdict liknar öppningen.** Det är två figurer i samma rum, men piraten står en fjärdedel längre åt höger och bakgrunden är fönstren i stället för lyktan. Testet för samma bild två gånger släpper bilden.
- **Loopens skarv:** i sista rutan undrar piraten, i första läser han lugnt.
- **Den beige skivan med röd rand på akterdäck** i deck2 och real är skeppets egen.

## v1p (rättat i v1q): en ny oberoende granskare, och ditt beslut

Granskaren hittade två fel: kamratens bortre öga, mun och mustasch skars av huvudkonturen (öppningen från ruta 0, below och test), och piratens högra näve gled från bokkanten i verdict. Allt annat var rent. Bilderna ligger i `C:\Users\sweje\AppData\Local\Temp\claude\499ae2b6b7d0911d\becf1467-c80d-4c82-af69-a7ba375e67f6\scratchpad\indep-v1p\full\`.

**1. Ett nytt test för ansiktsdrag utanför huvudkonturen** (motionCheck, alla figurer i alla filmer).
- **Vad det fäller:** ett öga som ligger närmare än 4,5 % av figurens höjd från huvudets kontur, i 0,2 s. Konturen mäts med huvudbandet eller hattbrättet.
- **Kalibrering:** de klippta ögonen i v1p mätte 3,9–4,2 %. Kamratens ansikte vänt mot linsen mäter cirka 5 %, och ett öga som nuddar konturen inifrån 5,2 %.
- **Planterat fall:** kamraten vriden som i v1p. Testet fäller sex bilder: öppningen, below, mins, test, verdict och slutet. Kontrollen är v1q: 0 fel.
- **Sir:** han klarar testet i alla biblioteksklipp, också i det renderade 04 och 08 (shot-library-r3d). Piraten klarar det i ögonlappen.
- Utskrift: `face-test-v1q.txt`.

**2. Kamratens vridningar** är sänkta i en enda punkt i koden. Kroppen vrids hälften och huvudet en tredjedel så långt som förut. Bordsbildens huvudvridningar är halverade, och han står 30 cm längre från bordet i mins. Testet ger 0 fel. Öppningen rör sig från ruta 1: han söker med händerna och snubblar till vid 0,35 s.

**3. Greppet i verdict.** Boken vikt med omslaget mot oss har kanterna längre bak än ryggen. Därför stod nävarna utanför kanterna. Boken är nu vikt plattare (0,12 rad i stället för 0,25), så att kanterna kommer fram till nävarna. Nävarna ligger över bokkanterna i hela verdict och i alla bokbilder. Rutor i full storlek från början, mitten och slutet av verdict (720, 750 och 775): `v1q-verdict-greppet-ruta-720.jpg`, `-750.jpg` och `-775.jpg`, tagna ur v1q-videon.

## v1q: den oberoende granskaren säger FAIL, och det här återstår

Granskaren gick igenom 61 rutor i full storlek, 2–3x utsnitt, alla 18 klipp och undertextbandet vid varje radbyte. Bilderna ligger i `C:\Users\sweje\AppData\Local\Temp\claude\499ae2b6b7d0911d\becf1467-c80d-4c82-af69-a7ba375e67f6\scratchpad\indep-v1q\`.

**Det verkliga felet:**
- **Kamratens näve sjunker ner i bordsskivan** i bild 2, ruta 84–125 (2,8–4,2 s). Nävens underkant skärs av rakt, och i ruta 74–80 svävar den precis innan. Bevis: `g_fist.png`, `g_fist_all.png`.
  - Bodytestet missade det. Det mäter handens volym i 3D, men den ritade näven är större än den volymen.
  - **Rättning vid källan:** testet ska räkna med den ritade nävens storlek, och näven ska höjas så att den ligger på skivan genom hela bilden. Det tar ungefär 30 minuter med en ny render.

**Rent enligt granskaren:**
- klippen och sek. 0–5;
- undertexterna;
- bubblorna;
- kamratens huvud i alla bilder (ögat, näsan och mustaschen ligger innanför konturen; det nya ansiktstestet håller);
- stänger och rep;
- inga upprepade bilder;
- ingen stillastående figur;
- lyktan;
- träsnittet.

**På gränsen enligt granskaren:**
- **Piratens nävar täcker bara 20–28 % av sig själva över bokkanten.** Mest syns det i ruta 0 och 1082, där näven nästan ligger bredvid boken.
- **Piratens högra manschett i öppningen och slutet** sticker ut bredvid näven och slutar 5 px från kamratens ärm.
- **Bubblan tonas bort grått över de tre sista rutorna,** så loopens skarv är inte helt ren.
- **Huvudet vrids på 3 rutor i bild 9,** ruta 505–509.

**Smak:**
- tunna ljusa kortkanter på ett par ställen;
- lyktglaset utan låga;
- bild 7 är mörk.

## Nytt test: armbågen som sticker ut (wing)

Armbågen kom tillbaka i calm, verdict och trick, varje gång en vinkel ändrades. Testet fäller en figur som håller en sak, där överarmen i bilden står 50° eller mer upp från lodrätt och underarmen faller tillbaka till handen, i 0,4 s.
- **Fälls:** trick med vridningen från v1j (52°) och verdict med vridningen från v1i (89°).
- **Klarar:** v1k (det närmaste är 47°, armbågen nere i full storlek).

Marginalen är liten. Utskrift: `wing-test-v1k.txt`.

Testet gäller alla filmer (ditt beslut). Biblioteksklippet 04 fälls, med överarmen 86° upp. Filen är orörd.

## Min egen granskning

För varje version har jag gått igenom filmen i 4 bilder/s och bilderna i full storlek eller förstoring. Jag har särskilt läst:
- bokgreppet;
- kamratens händer;
- bordet;
- stänger, rep och bommar vid huvudena;
- hörnen;
- undertextbandet, som video, vid radbytena.

I v1l och v1h hittade jag fel som jag själv stoppade, se ovan. v1q har jag läst i de ändrade bilderna i full storlek: alla bokbilder, verdict i början, mitten och slutet, och kamraten i alla hans bilder.

Jag såg inte den sjunkande näven i min granskning. Jag läste bordsnäven i ruta 80, 115 och 150, och den sjunker mellan 84 och 125. Mitt omdöme är därför inte GODKÄND förrän näven är rättad. Du sa att v1q ska skickas som STOPP med det som återstår, och att Jesper avgör.

## Titelförslag (inga frågor, granskade med title.py)

1. **The Pirate Eye Patch Trick** (80/100, 26 tecken)
2. **MythBusters Tested the Pirate Eye Patch Trick** (66/100, 45 tecken)
3. **The Real Reason Pirates Might Have Worn Eye Patches** (66/100, 51 tecken)

title.py anmärker på alla tre att det inte finns något tal, datum eller namn (utom MythBusters i förslag 2), och att miniatyrtexten "WHO BLEW OUT THE SUN?" har fem ord, där tre är taket. Utskrift: `titlar-v1q.txt`.

## Kvar att veta

- QA flaggar en tom nedre tredjedel i fem hyttbilder (det mörka golvet) och en stor slät yta i bild 2 (den mörka väggen bakom kamraten vid bordet).
- Bild 2 är 2,83 s i öppningens 0–5 s.

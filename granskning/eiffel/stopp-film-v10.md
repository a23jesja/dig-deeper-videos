# STOPP: Who Sold the Eiffel Tower in 1925, filmen v10 (platt 2D A Knopp), 23 november 2026

## Filer

- `leverans/eiffel/who-sold-the-eiffel-tower-in-1925-v10.mp4`: 1080×1920, 30 fps, 33,16 s, med ljud, 10 621 277 B, md5 578f4d592d024bc78228040b82477281 (`md5-v10.txt`).
- `leverans/eiffel/who-sold-the-eiffel-tower-in-1925-v10-telefon.mp4`: telefonkopia, 4,4 MB, md5 d25780c24c51a2f40e56dc73cc1427a7.
- **Krokklipp på 5 s**, öppningarna (d) och (b): `leverans/eiffel/krok-d-v10.mp4` (md5 ff54cd1ae8e71f60b5856eefd17afac8) och `krok-b-v10.mp4` (md5 c5edf45b9823ced1603e26d69a45ee1b).
- **(c) och (d) sida vid sida i 360 px bredd:** `granskning/eiffel/film-v10/krok-c-overst-mot-d-under-360px.jpg`: (c) överst och (d) under, rutorna 1, 16, 31, 46, 61, 76, 91 och 106.
- **Kontaktark med två rutor per sekund:** `granskning/eiffel/film-v10/kontaktark-2-rutor-per-sekund.jpg`.

**Manuset** är låst vid v4c (2da8da6). Rösterna är 5fa38d8 och omtagningen 5e992de; "Or so, the story goes." är g15b, take 2. Ingen text är ändrad.

**Byggt efter Jespers regel** "Flawless but boring is also a fail" (DAILY-RULES på claude/emu-short-cloud, rad 51–61) och granskarens tio punkter. Det frysta utseendet är orört: `git diff ad1a161` ger 0 rader i designs, rig, clips, ink, stage och alcatraz/. Koden ligger i `src/craft/eiffel/`.

**v1–v9 skickades aldrig.** Den sjunde granskaren kontrollerade stämpelbilden i v9. Ärmen låg fritt från texten (minst 26 px i (d) och 96 px i filmen), och greppet höll. Men stämpelns fot täckte cirka 10 px av SOLD:s röda ram i slutet. **I v10 lyfts stämpeln 20 px högre**, och underarmen ligger mer vågrätt (0,95π). Den röda ramen syns nu hel, och ärmen ligger 34 px under texten i (d). Stämpeln rör sig högst 10,7 px per ruta. Flimmer i krokklippen: största 715 px i (d) och 703 px i (b).

**v9:** Den sjätte granskaren godkände huvudfilmen v8 men fällde krokklippet (d): där står texten i 3 s över stämpelbilden, och ärmen gick bakom "TOWER" på ruta 37–47. **I v9 lyfts stämpeln uppåt och åt höger** (85 px åt höger och 115 px uppåt i stället för 165 px rakt upp). Ärmen ligger då cirka 30 px under texten även i (d), och SOLD syns helt. Stämpeln rör sig högst 9,5 px per ruta (`eiffel_check`). Flimmer i krokklippen: största 755 px i (d) och 703 px i (b), alltså 0 fällda rutor.

Tidigare versioner: Fyra oberoende granskare fällde v1, v2, v3 och v6, och flimmermåttet fällde v4 och v5 på en ruta i bild 6. Den femte granskaren fällde inget av punkterna 1–6 på v7 men ville ha stämpelärmen bort från texten först.

**Rättningarna efter v7:**
- **Stämpelns ärm** gick in i textens radslut ("THE" och "TOWER") på ruta 88–96. Underarmen ligger nu nästan vågrätt och går ut genom högra kanten långt under texten.
- **Dörröppningen i bild 13** var svart, och hans svarta kostym försvann mot den i telefonstorlek. Nu syns en upplyst korridor bakom.

**Rättningarna efter v6:**
- **Bild 16, ruta 849:** den grå handlarens huvud hoppade mellan två ritningar. Orsaken var mitt eget fel: en kommentar hade svalt hans stand() och lugna ansikten. Det är rättat.
- **Polisen:** han läste inte som chockad. Nu står han nästan rakt fram, så att chockens öppna mun syns hel (mun 0,8).
- **Den grå handlaren vid disken:** grimasen läste som belåten i tre kvart. Han tittar nu allvarligt upp på polisen.
- **Förtjust:** i den förtjusta minen öppnade riggen en D-formad grin med tungan synlig, och två granskare läste den som tal. Nu är det leende 0,3 med höjda bryn, så att munnen är lika liten som i belåten och lugn. Detta är en avvikelse att ta ställning till.
- **Bild 13:** ingen dörrskiva. Han gick över den; nu syns bara den mörka öppningen i bakväggen.
- **Bild 14:** nya slag. Han vänder bort huvudet (0,5 s), grimaserar (1,2 s) och sänker huvudet och brevet 16 px (1,9–2,0 s).
- **Bild 18:** han håller det stämplade SOLD-papperet med ett litet lyft (0,95 s), så att papperet inte dyker upp vid klippet in i loopen.

**Rättningarna efter v3:**
- **Rekvisita som dök upp vid nästan likadana klipp:** bild 6 är nu en helbild i tre kvart, och bild 10 visar bänken med de två förlorarnas grimaser.
- **Ruta 1 i (c):** bedragaren håller upp det stämplade papperet med SOLD på tornet medan han nickar, så att påståendet syns med hans ansikte. Granskaren av v3 tyckte att (d) var tydligare i 360 px.
- **Betalningen i bild 11:** handlaren lyfter checken mot bedragaren, som flinar.
- **Brevet i bild 15–16:** det stannar hos den grå handlaren till höger.
- **Bild 18:** kvällen, utan att tiden går baklänges in i loopen.
- **Bild 4:** rosten ligger bara på järnet.
- **Lyften:** de blandas mellan två funna armar, så att inget hackar.
- **Det burna papperet:** det fick sin plats från en ruta som berodde på i vilken ordning rutorna ritades, och hoppade; nu räknas platsen från ruta 1.
- **Bild 6:** bedragaren är vänd 36°, så att huvudet inte byter ritning.

**Från v1 och v2:** Två oberoende granskare fällde dem, och alla deras fel är rättade i v3:
- **Pengarna i bild 13:** checken svävade bredvid näven och bytte hand. Nu sticker checken och kuvertet upp ur bröstfickan, och han går ut ur bilden.
- **Papper över ansikten:** papperen är kortare och sitter lägre, så de ligger under hakan.
- **Öppna munnar:** de som inte talar har stängd mun.
- **Polisen:** han läste inte som chockad. Nu rycker han tillbaka med den öppna chockmunnen.
- **Krumelur och SOLD:** en lös krumelur över disken är borta. SOLD:s bläck ligger nu över teckningen.
- **Tåren** satt bredvid näsan och är utbytt mot grimasen.
- **Bild 11 och 12:** de var nästan likadana bilder, så checken försvann och kuvertet dök upp på en ruta. Nu är bild 12 en halvbild på bedragaren ensam.
- **Stilla bilder:** bild 14–16 stod stilla, och nu har de fler slag. Små figurer i tvåbilderna står tätare.
- **Hopp före loopen:** bild 18 är nu tre kvart, halvbild, i natt.
- **Text och flimmer:** kroktexten i (b) låg nära kanten. Flimmer fanns i bild 8, 9 och 13. Båda är rättade.

## Bild för bild: vem som är i fokus, ansikte, handling, varje nytt slag och sekunder utan figur

Tiderna gäller filmen (s), som börjar med öppning (c).

| # | Tid | Replik | I fokus, ansikte | Handling (bildtyp) | Nya slag (s) | Utan figur (s) |
|---|---|---|---|---|---|---|
| 2 | 0–2,17 | This man sold the Eiffel Tower. | bedragaren, belåten → förtjust | håller upp det stämplade papperet med SOLD (04) framför tornet och nickar; nicken är redan på väg i ruta 1 | 0, 0,5, 1,05 (flinet) | 0 |
| 1 | 2,17–3,67 | It was never his. | bedragarens hand | stämpeln slår, lyfts och lyfts av, och SOLD syns | 2,17 (kontakten), 2,27, 2,67, cirka 3,0 (SOLD läsbart) | 1,50 |
| 3 | 3,67–5,23 | A newspaper said… | bedragaren, belåten → förtjust | läser tidningen (04), sänker den och flinar | 3,67, 4,17, 4,47 | 0 |
| 4 | 5,23–6,68 | …cost too much to fix. | ingen (tidningens bild) | rostiga tornet i närbild | 5,23 | 1,45 |
| 5 | 6,68–8,23 | He was a con man. | bedragaren, belåten → förtjust | står (01), lutar huvudet och flinar mot oss | 6,68, 6,98, 7,53 | 0 |
| 6 | 8,23–10,23 | He pretended to be a government official. | bedragaren, belåten → förtjust, helbild i tre kvart | håller upp brevet med sigillet (04) och flinar | 8,23, 9,18 | 0 |
| 7 | 10,23–11,73 | He told scrap dealers… | tre handlare: den unga förtjust, två lugna | sitter på bänken (07) och nickar i tur och ordning | 10,23, 10,53, 10,83, 11,13 | 0 |
| 8 | 11,73–13,23 | …to bid for the tower's iron. | bedragaren, belåten | pekar på tornet i fönstret (05) | 11,88 (blicken), 11,93 (armen upp), 12,35 (fingret), 12,71 (armen ned) | 0 |
| 9 | 13,23–14,73 | Do you deliver? (Daniel) | den unga handlaren, förtjust | säger repliken med läppsynk, sittande | 13,23, 13,38 (repliken) | 0 |
| 10 | 14,73–16,23 | One dealer won. | den unga handlaren (förtjust) och de två andra (lugna → grimas) | på bänken lyfter han budet (04 sittande); de två andra vänder sig mot honom med grimas | 14,73, 14,93, 15,08, 15,38 | 0 |
| 11 | 16,23–17,83 | The dealer paid for the tower. | handlaren (förtjust) och bedragaren (belåten) | handlaren lyfter checken (04) mot bedragaren, som flinar mot den | 16,23, 16,58, 16,73, 17,18 | 0 |
| 12 | 17,83–19,73 | The con man got a bribe too. | bedragaren, belåten → förtjust, halvbild | håller upp kuvertet med sedlarna (04), tittar åt sidan och flinar | 17,83, 18,33, 18,43, 19,03 | 0 |
| 13 | 19,73–21,53 | Then he vanished with the money. | bedragaren, belåten | går ut åt höger (02) förbi den öppna dörröppningen i bakväggen och ut ur bilden; checken och kuvertet sticker upp ur bröstfickan | 19,73, gången hela tiden, ut cirka 21,0 | cirka 0,5 i slutet (rummet han lämnat) |
| 14 | 21,53–24,13 | The dealer was too embarrassed… | den unga handlaren, hård grimas med hopknipna ögon → grimas | håller brevet med baksidan ut (04), vänder bort huvudet, grimaserar, sänker huvudet och brevet | 21,53, 22,03, 22,73, 23,43, 23,53 | 0 |
| 15 | 24,13–26,33 | Later, the con man tried again. | bedragaren (belåten → förtjust) och den grå handlaren (lugn → grimas) | det andra hotellet: den grå handlaren till höger har fått brevet och lyfter det (04); bedragaren nickar och flinar; den grå tvivlar | 24,13, 24,53, 24,63, 25,23, 25,73 | 0 |
| 16 | 26,33–28,73 | This time, another dealer told the police. | den grå handlaren (lugn → allvarlig, till höger) och polisen (lugn → chock med öppen mun, nästan rakt fram, till vänster) | handlaren håller upp brevet för polisen (04), polisen rycker tillbaka i chock (06:s ryck), och handlaren tittar upp på honom | 26,33, 26,83, 27,43, 28,03 | 0 |
| 17 | 28,73–30,73 | The con man fled to America. | bedragaren, belåten → förtjust | stor på ångarens däck (01), vänder sig mot oss | 28,73, 29,13, 29,78 | 0 |
| 18 | 30,73–32,43 | Or so, the story goes. | bedragaren, belåten | tre kvart, halvbild, framför tornet i kvällsljus, håller SOLD-papperet (04), tittar upp mot tornet, lyfter papperet och ler mot oss | 30,73, 31,03, 31,68 | 0 |
| 2 (loop) | 32,43–33,16 | Any offers? | bedragaren, belåten | bild 2:s uppställning just före ruta 1; nicken börjar, och texten tonar in | 32,43, 32,96 | 0 |

**Summan:**
- **En figur i fokus:** 33,16 − 2,95 = 30,2 s, alltså **91 %**. Utan figur är stämpelns närbild (1,50 s) och tidningens bild (1,45 s); rummet efter att han gått i bild 13 (cirka 0,5 s) tillkommer.
- **Den längsta tiden utan något nytt:** cirka 1,3 s (bild 18, mellan 31,68 och loopen på 32,43, och bild 14).
- **Bara rösten:** högst 1,5 s åt gången.

## De bindande byggkraven (v4-domen och reglerna)

| Krav | Så här |
|---|---|
| Kroktexten 3,0 s för två rader | THIS MAN SOLD THE / EIFFEL TOWER ligger i full styrka 0–3,03 s och tonar ut 3,0–3,2 s (`eiffel_check`). |
| Stämpeln lyfts cirka 40 px under 12 rutor, högst 12 px per ruta | Lyftet är 40 px i världen (62 px på skärmen vid zoomen 1,56) under rutorna 4–16, sedan av märket. Högst 10,7 px per ruta på skärmen (`eiffel_check`). |
| SOLD under stämpeln vid kontakten | Märket är lika stort som stämpelns siluett och ligger där den står. |
| Bänkfigurerna minst 40 px isär | minst 44 px, kontrollerat med kod på varje ruta |
| Pengarna i bild 13 | Checken och kuvertet sticker upp ur hans bröstficka och följer honom; han går ut ur bilden. |
| Loopen | Sista bilden är bild 2:s uppställning, spelad från −0,73 s till −0,03 s, och ruta 1 är samma uppställning vid 0 s. |
| Ansikten bara ur de sex godkända | belåten, förtjust, chock och hård grimas med hopknipna ögon; övriga lugna |
| Inga gester utanför de åtta bildtyperna | 01, 02, 04, 05 och 07, plus stämpelns närbild på bara handen |
| Krumelurer utan siffror | på budet, checken, brevet och sigillet; MAI 1925 bara som datum på tidningen |
| Polisen 01 med chockansiktet | ja, med en liten huvudrörelse |
| Pekbilden: tornet i fönstret i brösthöjd | ja (05:s egen uppställning, 355 px ut, i höjd med y 1237) |
| Bara en läppsynk | Daniel i bild 9 |
| Inga fotsteg och inga låga ljud | Ljuden är stämpelns smäll, träknackningen i ruta 1, papper, gata, hav och vind; `eiffel_check` söker efter thud, step, scuff, creak, rumble och blast. |

## Kontroller (på v3)

- **Kroppskontrollen** (`scripts/clip_check.mjs eiffel`): OK för alla 19 bilder.
- **Eiffeltornets egna kontroller** (`scripts/eiffel_check.mjs`): OK.
  - Bänkens avstånd är 44 px.
  - Stämpeln rör sig högst 10,7 px per ruta.
  - Loopen möts, och texten står 3,03 s.
  - Inga låga ljud.
- **Flimmer** (`film-v10/flimmer-v10.txt`): **0 fällda rutor inne i filmen** (största 1 897 px av högst 2 000).
  - Utan rörelsekorrigering fälls 33 rutor. Det är gången, pekningen och läppsynken, och den rörelsekorrigerade gränsen gäller (Jespers val 20 november).
- **Ingång** (`film-v10/ingangskontroller-v10.txt`):
  - Första ljudet kommer på 0,000 s, och toppen i ruta 1 är 0,38.
  - Texten har 6 ord, 1,5 s per rad.
  - Bilderna i sekund 0–10 är 1,4–2,2 s långa.
  - Loopen: 1,4 % av bilden ändras mellan sista och första rutan.
- **Krokklippen (d) och (b):** ljud i ruta 1, med toppen 0,69 och 0,38.
- **ElevenLabs-räknaren** (`film-v10/elevenlabs-raknaren.txt`): 3 589 av 40 000. Före Eiffeltornet var den 2 842, alltså +747. Skickat enligt min räkning är 1 881 tecken (inom godkända 2 428); räknaren släpar.
- **Lyssna efter:** "Or so, the story goes." (bild 18, 30,83 s, g15b take 2) och riskorden i `engine/voice/eiffel/lyssna-riskord.wav`.
- **Det frysta utseendet:** `git diff ad1a161` ger 0 rader i designs, rig, clips, ink, stage och alcatraz/.
- **Oberoende granskning:** den femte granskaren fällde inget av punkterna 1–6 på v7 (rapporten nedan). **Den sjätte granskaren** godkände huvudfilmen v8 på alla tre punkter: stämpeln mot texten, gången förbi dörren och hela filmen. Den sjunde granskaren godkände v9:s stämpelbild på text och grepp. **Den åttonde granskaren godkände stämpelbilden i v10 på alla tre punkter**, både i filmen och i (d):
- **Texten:** ärmen ligger minst 137 px under texten i filmen medan texten står i full styrka. I (d) är avståndet 33 px lodrätt, vid sidan av texten, och 61 px under textens bredd.
- **Greppet:** handen följer stämpeln inom 2,3 px.
- **Den röda ramen** är hel från ruta 102 i filmen och ruta 37 i (d), och den ligger 22–23 px fri från stämpeln.
- **Rörelsen:** högst 12,0 px per ruta, alltså precis vid gränsen.

Granskaren noterar också:
- SOLD med hel ram syns cirka 0,3 s före klippet. Bokstäverna syns tidigare, och papperet med SOLD syns igen i bild 2 och 18.
- Tornspetsen på papperet sticker 6 px upp bakom stämpelns knopp i stämpelbildens första ruta.
- **Ordningen i (c):** han håller det stämplade papperet i ruta 1, och stämpelns närbild börjar med stämpeln vilande på papperet och lyfter den, så att SOLD visas. Den fjärde granskaren läste det som omvänd ordning; (d) har stämpeln först.

## Att ta ställning till (från den femte granskaren, inte rättat)

1. **Klippet 972→973, 0,67 s före loopen:** samma man med samma SOLD-papper i samma kvällsljus. Uppställningen byter från en halvbild i tre kvart till en helbild rakt fram (storleken ändras cirka 1,6 gånger). Granskaren kallar det "inte ett strikt hopp, men nära". Papperet i hans händer gör att loopen hänger ihop.
2. **Den hårda grimasen i bild 14** visar tänder och lite rött. Det är den godkända "hård grimas med hopknipna ögon", och han talar inte.
3. **Tunna ställen** där mest blinkningar bär bilden: bänken i bild 7, budet i bild 10, brevet i bild 6 och skeppet i bild 17. Alla ligger inom kraven: något nytt minst var 1,5 s och högst cirka 1,0 s utan synlig förändring.
4. **Förtjust med leende 0,3:** munnen är stängd som i belåten och lugn, och de höjda brynen bär glädjen (se rättningarna efter v6).
5. **De sittande handlarnas grimas** (bänken, ruta 330 och 470) visar tänderna i en liten mun. Det är den godkända grimasen; de talar inte.
6. **Gångens början i bild 13** (ruta 584–605): kroppen kommer långsamt i gång under de första stegen. Kroppskontrollen visar 0 px glidning för foten.

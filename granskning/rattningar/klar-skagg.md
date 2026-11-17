# Rättning inom det frysta utseendet: skäggen

## Version 2 (svar på granskningens tre punkter)
1. Två munnar på Sir Digsworth när munnen är öppen: en öppen mun är nu bara öppningen. Ingen munlinje ritas tvärs över eller under den; minen ligger i öppningens form: dess överkant och underläppen (käkkortets topp) böjer upp i mungiporna i ett leende och ned i ilska och rädsla.
2. Det lilla strecket som hänger under munnen på de skäggiga figurerna i snett och profil, arga och förskräckta: det var spetsen på skäggets egen mustasch vänd nedåt bredvid munnen, tillsammans med munlinjen. Munlinjen är borta när munnen är öppen och spetsarna hänger inte längre under läppen.
3. Sir Digsworth arg från sidan: en smal arg mun visar nu sammanbitna tänder (en båge på en plan underläpp med tandlinjer), även på de skäggiga figurerna; se `skagg-mobilstorlek.jpg`, sista raden.

I koden: `engine/src/craft/cast.ts`, flaggan `mouth2` på ett utseende (bredvid `beard2`), påslagen bara för bladets utseenden i `engine/src/craft/FaceSheet.tsx`. Inget utseende i `looks.ts` har den, så de två filmerna är oförändrade. Alla fyra blad är ändrade (munrättelsen syns på varje figur), plus den nya mobilstorleksremsan.

Jespers krav (ordagrant via granskningssessionen 2026-11-17): kaptenen, mannen med kroken och tvättaren har ett skägg som är en hel platta över nedre halvan av ansiktet; munnen syns inte, minerna försvinner och det ser ut som en mask, särskilt i profil där skägget blir en rak fyrkant. Hans fem punkter, och hur var och en är löst:

1. **Munnen syns alltid.** Skägget har en öppning runt munnen. Munnen där är samma mun som på figurer utan skägg: en linje som böjer sig efter minen när den är stängd, en mörk öppning med tunga, och tänder i ett skratt. Den följer rösten på samma sätt som förut (käkkortet sjunker).
2. **Mustaschen är en egen del** över munnen, i skäggets färg. Spetsarna går upp i ett leende och ned i en arg eller ledsen min.
3. **Skägget har form:** det börjar vid polisongerna framför örat, följer käklinjen och slutar i en rundad nederkant med fem tofsar. Ingen rak fyrkant, varken framifrån eller från sidan.
4. **Hakpartiet går ned med käken:** allt i skägget som ligger under käkleden flyttas lika långt som käken när munnen öppnas.
5. **Skägg och hår har samma färg** på samma figur (kaptenen #1f1a18, krokmannen #6a4424, tvättaren #3a2418; så var det redan).

Sir Digsworths mustasch är inte rörd. Bladet visar hans mun under den i samma vyer och miner.

## Blad (2600 x 2400 vardera: tre vyer nedåt, fem miner i bredd, stort; samma femton i mobilstorlek nederst)
- `granskning/rattningar/skagg-kaptenen.jpg`
- `granskning/rattningar/skagg-krokmannen.jpg`
- `granskning/rattningar/skagg-tvattaren.jpg`
- `granskning/rattningar/skagg-sir-digsworth.jpg` (mustaschen oförändrad; munnen under den)
- `granskning/rattningar/skagg-mobilstorlek.jpg` (mobilremsorna för alla fyra i sann storlek)

Vyer: framifrån, snett framifrån (45 grader) och i profil. "I profil" är sidvyn så som figuren ritas i dag: kroppen från sidan och huvudet vridet mot linsen enligt den frysta regeln (aldrig ren profil). Miner: neutral, glad, arg, förskräckt, pratar.

## Var det ligger i koden
- `engine/src/craft/cast.ts`, `drawHead`: det rättade skägget ritas när utseendet har `beard2: true`; mustaschen i `mousHalf` (ett skäggs mustasch har ingen vaxad spets framför ansiktet i sidvy). Samma linje, samma skugga under delarna, samma färger som förut.
- Bladen ritas av kompositionen `FaceSheet` (`engine/src/craft/FaceSheet.tsx`), bildruta 1-4: `PROPS='{"audio":false}' node scripts/stills.mjs FaceSheet out/craft/face_ 1-4 1 jpeg`.

## Inte använt ännu
Inget utseende i `looks.ts` har `beard2`: de två färdiga filmerna har skäggen som de var och byggs inte om för detta (Jespers ord). När bladet är GODKÄNT sätts `beard2: true` på alla skäggiga utseenden, och den gamla skäggformen tas bort ur `cast.ts`.

## Samma princip för annat som täcker ansiktet
Jesper: hjälmar, huvor och halsdukar får aldrig dölja munnen på en figur som pratar eller reagerar. Inget sådant finns i de två filmerna. Hjälmen i `cast.ts` (soldaten, riddaren) går inte ned över munnen; det kontrolleras när en sådan figur används nästa gång.

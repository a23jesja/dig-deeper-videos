VERSION: 2

# Den valda figuren: A med större huvud (före frysningen)

Jesper valde den 16 november (via granskningssessionen): "Jag väljer A, sprattelgubben, med en ändring lånad från B: huvudet cirka 25 % större, med större ögon och mun, så att minerna syns lika tydligt som på B i mobilstorlek. Kepsen följer med i storlek. Sidovyn: ansiktet ska kännas igen som samma person som framifrån, med samma mustaschform. Allt annat på A är kvar."

Material i `granskning/G-jamforelse/`:

- `valblad-A.jpg` (2600x1900): fem vyer mellan samma hjälplinjer (framifrån, snett framifrån, sidan åt båda håll, bakifrån) och till höger A FÖRE ändringen i samma skala; sex miner i stor storlek; samma sex miner i mobilstorlek med B:s miner under; sidovyn i två miner (skrattar, chockad); bagaren och soldaten med samma större huvud bredvid Sir Digsworth.
- `rorelser-A-efter.jpg` (2600x1900): hela rörelsebladet från steg C spelat med det större huvudet.

## Vad som är ändrat

1. **Huvudet är 25 % större** i bredd, djup och höjd (`engine/src/craft/looks.ts`), och kepsen, mustaschen, pipan och monokeln följer med i samma skala.
2. **Större ögon:** ögonen är ytterligare cirka 10 % större i förhållande till huvudet, sitter lite lägre så att ögonbrynen går fria från kepsen, och ögonbrynen är tjockare. Stängda ögon blir glada bågar när han ler (förtjust, skrattar).
3. **Större mun som syns under mustaschen:** mustaschen sitter lite högre och munnen lite lägre, munlinjen är bredare och tjockare och böjer sig tydligare med humöret, käken fälls 60 % längre ned, och i skratt syns en rad tänder över tungan.
4. **Sidovyn är samma man.** Huvudet ritas aldrig i ren profil: när kroppen ses rakt från sidan är huvudet vridet 56 grader, så att båda ögonen, näsan och hela mustaschen med sina snurrade spetsar syns, som i vyn snett framifrån. Förbi sidovyn svänger huvudet över till rätt vinkel, så nacken är nacken (`faceTurn` i `engine/src/craft/cast.ts`). Monokeln syns åt båda håll som förut (skinnet speglas åt vänster).

## Svar på granskningens punkter

- **Skelettets mått:** `rig.ts` och `motion.ts` är orörda. Det enda måttet som ändrats är huvudbenets längd i varje figurs egna siffror (Sir Digsworth 200 till 250), så att hjässan, kepsen som flyger av och kortens höjd följer det större huvudet. Halsfästet ligger kvar; halsen blir lite tjockare eftersom den ritas i förhållande till huvudet.
- **Rörelserna:** inga rörelser behövde justeras. Testklippet går igenom `node scripts/craft_check.mjs sirTest` (monokeln i varje sidovy, ingen vändning utan mellanvy, ingen figur som täcker en annan), kepsen flyger av och plockas upp som förut, och den liggande figuren vilar på marken (se `rorelser-A-efter.jpg`, rutorna FALLA och RESA SIG).
- **Tyngdpunkten:** figuren är 5 % längre. I världen anges en figurs längd i meter med huvudet inräknat, så kroppen blir där cirka 5 % mindre vid samma längd.
- **Bifigurerna:** alla sexton utseenden har fått samma 25 % större huvud och samma vridning av huvudet i sidovy, eftersom de ritas av samma kod. Bagaren och soldaten visas på bladet.
- **Skillnad mot B i mobilstorlek:** B:s huvud är fortfarande större i förhållande till kroppen än A:s (ett klot utan hals). A har i gengäld ögonvitor, ögonbryn som egna delar och en käke som fälls.

## Efter GODKÄND

Då skriver jag det frysta utseendet i README.md med commit, tar bort B ur koden (`gent.ts`, `GentViews.tsx`, kompositionen `SirCompare`), flyttar bladet med de sex minerna till `CastViews`, renderar om vybladen från steg B och C med det större huvudet, och fortsätter med steg D version 2 och frågelistan.

## Version 1 (jämförelsen A mot B)


Jesper bad om detta den 16 november (via granskningssessionen): rita figuren från hans bild som ett andra utseende i kod ovanpå skelettet och rörelserna som redan finns, kör samma testklipp med båda och lägg dem bredvid varandra. Han väljer, sedan fryser vi.

Material i `granskning/G-jamforelse/`:

- `jamforelse.mp4` (1092x960, cirka 13 s, med ljud): samma testklipp, samma kamera och samma tidpunkter. Vänster **A Sprattelgubben** (den nuvarande), höger **B Streckherren** (den nya). Han går in, vänder sig, pekar, pratar, rycker till, springer, snubblar, faller, reser sig och springer ut.
- `vyblad-B.jpg` (2600x1900): B framifrån, snett framifrån, från sidan åt båda håll, axelryckningen med öppna händer och käppen i luften, bakifrån; de sex minerna (neutral, förtjust, chockad, misstänksam, arg, skrattar); A och B bredvid varandra i samma skala och en bifigur (bagaren) i B:s form.

## Vad som är byggt

- `engine/src/craft/gent.ts`: B som ett eget skinn på samma skelett (`rig.ts`) och samma rörelser (`motion.ts`). Inget i de två filerna är ändrat. Runt vitt huvud utan näsa och öron, prickögon, tweedkeps med knapp och sex våder, guldmonokel med tunn kedja som hänger rakt ned, yvig mustasch, böjd pipa, tweedkavaj med slag, senapsgul väst med knappar, röd fluga, vita handskar, svarta streckben med små skor, mörk käpp med krok.
- Allt är ritat i kod. Bildfilen är inte med i motorn och används inte i någon video; `node scripts/no_sheets_check.mjs` går igenom.
- Liksom A är B EN teckning som vrids: ögon, monokel, mustasch, pipa och keps sitter på vinklar runt huvudets klot och projiceras efter vyn, så alla vyer kommer ur samma teckning utan hopp.
- Minerna drivs av samma ansiktsvärden som A använder (blick, ögonlock, ögonbryn, mun, leende), så rörelsebibliotekets miner fungerar direkt: stängda ögon blir glada bågar när han ler, ögonbrynen syns bara när ansiktet gör något, munnen öppnas under mustaschen när han pratar.
- Testklippet är samma kod för båda (`SirMotion.tsx`, panelen `TestPanel`); kompositionen `SirCompare` lägger dem sida vid sida. Vybladet är `GentViews`.

## Att veta när du jämför

1. **Monokeln sitter på bildens högra sida** (figurens vänstra öga), som på förlagan. På A sitter den på andra ögat. B spegelvänds i sidovy åt höger så att monokel och pipa syns åt båda håll, samma regel som A har åt andra hållet.
2. **Proportionerna är skelettets, inte förlagans.** Förlagan har kortare ben och större huvud i förhållande till kroppen. Eftersom skelettet inte fick röras har B samma långa ben och samma armlängd som A; huvudet har jag gjort så stort som skelettet tål. Vill du ha förlagans proportioner krävs en ändring av skelettets mått (benlängd, bål), vilket påverkar steglängd och alla rörelser lite grann.
3. **Käppen är inte med i testklippet.** På vybladet håller han den (stående) och lyfter den (axelryckningen). Att gå med käpp, sätta ned den i takt med stegen och ha den kvar i handen i fall och löpning kräver nya rörelser för armen, och rörelserna skulle inte röras. Det går att bygga om du väljer B.
4. **Bifigurerna.** I klippets högra halva flyr bagaren i B:s form (runt vitt huvud, pannband, tunika, förkläde, streckben) så att du ser hur en bifigur skulle se ut. Väljer du B måste alla bifigurer ritas om i den formen (ett utseende per figur, som nu).
5. **Det som skiljer i rörelse:** B:s ben är streck utan knäled som syns, så knäböj, fall och uppresning läses med tunnare linjer; A:s kortdelar med nitar visar lederna tydligare. B:s huvud är större och ansiktet enklare, så minerna läses på längre håll. Jag rangordnar inte; valet är ditt.
6. Kontrollskriptet för monokeln (`craft_check.mjs`) är skrivet för A:s utseenden. Väljer du B flyttar jag över de tre kontrollerna till B innan något renderas.

## Kod

`PROPS='{"audio":false}' node scripts/stills.mjs GentViews out/craft/gent_ 0 1 jpeg`
`npx remotion render src/index.ts SirCompare out/craft/jamforelse.mp4 --gl=angle --codec h264 --crf 20 --scale 0.5`

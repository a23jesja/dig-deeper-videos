VERSION: 1

# Jämförelse före frysningen: två figurer på samma skelett

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

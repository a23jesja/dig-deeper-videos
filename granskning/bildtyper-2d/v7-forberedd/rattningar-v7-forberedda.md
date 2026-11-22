# Bildtyperna i platt 2D: rättningar efter granskningen av v6, förberedda i koden (22 november 2026)

Jesper får frågorna efter omgång 3. Ingenting är renderat. Rättningarna är bara prövade med kontrollerna och med geometrin i modellen, inte med bilder. 01 är godkänd enligt granskningen, och 05 väntar på Jespers val.

**De godkända klippen:** 01, 02, 04, 07 och 08 ändras inte. Mustaschen, örat, pupillen och kedjan gäller bara tre-kvart, och de klippen visar aldrig tre-kvart. Kortningen av mustaschen framifrån gäller först när huvudet är vridet mer än 6 enheter; 01 och 04 når som mest 1,78. Rättningarna i klippkoden gäller bara 03 och 06.

## 03

1. **Den svarta halvmånen vid huvudets kant** (tre-kvart åt vänster, och samma i 06):
   - Det var det bortre örat, inte mustaschen. I tre-kvart ritas det bakom huvudet, och bara cirka 11 enheter stack ut, nästan bara kontur.
   - Nu är örat större och ligger längre ut (126, 17 × 25), så att huden syns och det läses som ett öra.
   - **Ny regel i `face_order.mjs`:** ögonvitor, mustasch, ögonbryn och mun ska ligga inne i huvudets kontur. Det gäller framifrån (även vriden till gränsen åt båda hållen) och i tre-kvart åt båda hållen; i profil gäller det bara ögat. Öron, näsa och pipa når konturen avsiktligt och räknas inte.
   - Utfall: högst 0,3 enheter utanför. Planterat fel: v5:s mustasch fälls (15,3 utanför).
   - Regeln hittade också mustaschspetsen framifrån när huvudet är vridet nära tre-kvart (6,4 utanför, i 03:s vändningar). Den halva som ligger på den sida han vrider sig åt kortas nu precis så mycket som behövs.
2. **Hacket och hårlinjen vid manschetten** (91–93):
   - Undantaget för handen var en cirkel, och den skar över ärmen ovanför manschetten.
   - Nu är det en fyrhörning som börjar där manschetten slutar, vinkelrätt mot underarmen. Ärmen visas hel fram till manschetten.
   - Inte prövat i bild.
3. **Kedjan framför pipskaftet** (tre-kvart åt vänster): pipan ritas nu en gång till efter kedjan, bara delen under mustaschen. Kedjan hänger därför bakom skaftet, och mustaschen och munnen ser ut som förut.

## 06

1. **Det tomma bortre ögat:**
   - Näsan, som ritas överst, täckte pupillen när han tittade nedåt åt höger.
   - Nu flyttas den bortre pupillen bort från nosens mitt, bara så långt som behövs. Den stannar på samma sida som den närmre pupillen (77–82 mot ögats mitt 76), lite högre. Förut hamnade den på andra sidan om mitten, och han såg skelögd ut.
   - **Ny regel i `clip_check`:** i tre-kvart får ingen del av den bortre pupillen ligga under nosen. Planterat fel: utan undanflyttningen fälls 86 rutor.
2. **Halvmånen:** samma rättning av örat som i 03.
3. **Pipan och tummen:**
   - Regelns marginal motsvarar nu cirka 40 px fri bakgrund mellan konturerna.
   - Handen når inte längre ner. Därför hänger den fastklämda pipan nu 0,3 i stället för 0,5, och pipans huvud ligger cirka 97 enheter ovanför handleden.
   - Planterat fel: v5:s handläge fälls (44 rutor).
4. **Krabbans klo över ögat:**
   - Ögonen sitter 5 närmare mitten och 2 lägre. Klorna står 0,3 utåt i vila och vinkar bara utåt.
   - Räknat i klons koordinater är det fritt med 1,25 eller mer i vila och mer när klon vinkar. Förut var värdet 0,05–0,14, där över 1 betyder fritt.

## Kontroller på koden

- **clip_check:** alla åtta OK (`clip-check-v7-forberedd.txt`).
- **flat_check, flat_views och face_order:** OK (`flat-och-ansikte-v7-forberedd.txt`).
- **Planterade fel:** 38 av 38 fälls (`planterade-fel-v7-forberedd.txt`).
- **Flimmer- och bytes-kontrollen:** kräver rendering och är inte körda.

## 05: svar på frågan

- **Var 70 % kommer ifrån:** granskningen av v1 sa: "Stå och prata, hålla, peka och reagera i halvbild eller närmare. Gå, vända sig, sitta och öppna dörr i helbild, där figuren fyller minst halva höjden." Siffran 70 % för halvbild satte jag själv i kontrollen i v2. Den står inte i Jespers regler.
- **DAILY-RULES:** "The subject fills 50 to 80 % of the height. The lower half of the picture is never just ground."
- **Går b) att göra inom reglerna?** Ja. En bild där figuren fyller cirka 55 % ryms i DAILY-RULES. Med den bredare bilden kan skeppet vara större och ligga i brösthöjd till höger, och han kan peka rakt ut med en nästan sträckt arm och gott om luft till skeppet.
- **Det enda b) bryter mot** är granskningen av v1:s önskan om halvbild för pekningen. 06 (reagera) är redan en helbild på 50 % av samma skäl (krabban står på marken).
- Jag gör ingenting med 05 förrän Jesper har svarat.

VERSION: 1

# Steg D: världen

Material i `granskning/D/` (JPG, 1080x1920, stående bild som i en Short):

- `bild-1-bageriet.jpg`: bakom bagarens disk. Bröden ligger nära linsen, Sir Digsworth kommer gående på trottoaren utanför och pekar redan på ett av dem.
- `bild-2-soldaten.jpg`: lågt från marken förbi kärrans hjul. Soldaten lutar sig mot en kolonn med armarna i kors och ena foten över den andra; stadsporten och Vesuvius i fjärran.
- `bild-3-kopmannen.jpg`: ovanifrån. Köpmannen sitter vid sitt bord och räknar mynt; hunden drar i sin kedja, som är en riktig kedja från ringen i väggen till halsbandet.

## Vilken miljö

Den romerska gatan, som är den första världen i det nya formatet ("The format: Why did they do that?"). Under kvällen byggde jag också en kaj i Boston med ett tremastat skepp, eftersom ämnet för shorten då var ett annat; det arbetet ligger kvar i motorn (`engine/src/craft/world/boston.ts`) till fartygsvärlden och är inte med i det här steget.

## Hur världen är byggd ("The world look")

- **Riktiga 3D-föremål med tecknad yta.** Bröd, amforor, krukor, korgar, säckar, kärra med ekerhjul, kolonner, bord, pall, mynt, markiser, disk, ugn, kvarn, fontän, kedja och hus är modellerade föremål med tjocklek (`engine/src/craft/world/props.ts`), inte platta väggar med textur.
- **Klara platta färger i tre toner** (ljus, halvton, skugga) och **svart kontur** runt varje föremål, lika bred på skärmen oavsett avstånd (`kit.ts`).
- **Ett starkt ljus med skarpa skuggor.** Solen står högt till vänster; skuggor av markiser, kolonner, hjul och figurer faller över golv och gata. Himmelsljuset är så starkt att det som ligger i skugga behåller sin egen färg.
- **Varje föremål har sin egen färg:** röda sockelband, ockra disk, grå marmor, gula bröd, blå himmel, grön bergssida.
- **Kameran är inne i scenen** med vidvinkel: bröden, kärrhjulet och bordet ligger nära linsen; i fjärran finns stadsporten och Vesuvius (en enda grön topp, som berget såg ut före år 79).
- **Figurerna använder världen.** De är kort som står på marken, ritas för den vinkel de ses från och kastar egen skugga (`people.ts`). Glöd, oskärpa och partiklar används inte alls i de här tre bilderna.
- Ingen står stilla i bakgrunden: en kvinna går i portiken, en pojke springer mot porten.

## Att titta på

1. Läses föremålen som föremål med tjocklek, kontur och egen skugga?
2. Är färgerna klara och dagsljuset ljust, utan att allt blir en brun eller orange ton?
3. Finns något stort nära linsen och något värt att se i fjärran i varje bild?
4. Håller figurerna i, lutar sig mot eller använder föremålen?

## Kända svagheter

- Bröden ligger i markisens skugga i bild 1 och är därför mattare än jag vill; solen kan inte lysa in under markisen utan att hela gatan hamnar i skugga i bild 2.
- Sir Digsworth syns från midjan och uppåt i bild 1, eftersom disken står mellan honom och kameran.
- Husväggarna är enfärgade ytor; fönsterluckor, dörrar, sockelband och tak är föremål, men väggmålningar, skyltar och klotter saknas ännu.
- Stadsportens öppning visar den gröna bergssidan bakom och kan läsas som en grön dörr.
- Hundens fram- och bakvy (öppen punkt från steg B) är inte rättad; i bild 3 ses hunden snett framifrån från sidan.
- Figurkorten belyses inte av solen (de har sin ritade ljussättning); de kastar skugga men tar inte emot skugga från markiser.

## Kod

`engine/src/craft/world/kit.ts` (material, kontur, ljus, kort), `props.ts` (föremålen), `pompeii.ts` (gatan och de tre kamerorna), `people.ts` (figurer och djur som kort), `PompeiiStills.tsx` (kompositionen):
`PROPS='{"audio":false}' node scripts/stills.mjs PompeiiStills out/craft/pomp_ 0-2 1 jpeg`

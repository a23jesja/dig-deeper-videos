# Flimmermåttet, bevis omgång 2

Det nya måttet är inte använt i någon rendering. Film v57 är renderad och kontrollerad med dagens mått.

## Baserna
| bas | fil | md5 |
|---|---|---|
| v17 | leverans/3d/kaptenens-karta-3d-steg1-v17.mp4 (3D, Blenders kameramatriser) | 003fa77d08d325319f69c78f7cd3da79 |
| v1y | leverans/eye-patch/eye-patch-v1y.mp4 (platt, bubblor och texter, närbilder) | d33a2b6b0c49524dfe5f770dcd068f34 |
| still | ruta 298 ur v1y (närbild, inga texter) hållen i 600 rutor | 51d3ecfcdb273a7959722e971892faa8 |

Still-basen behövs för de mjuka glidningarna. Varken v17 eller v1y har ett fönster där filmens egna ansikten står stilla och texterna är oförändrade genom hela glidningen. Ruta 298 ligger här som stillbild-ruta298.png och dess regioner i stillbild-regions.json. Basen byggs om med `ffmpeg -loop 1 -framerate 30 -i f298.png -frames:v 600 -crf 17`.

## Tabellen
"–" betyder att felet inte går att plantera i den basen (ingen plats). Den gamla planteringen hittade inget fönster, och "ej testbart" räknas aldrig som godkänt. Skälen står i varje bevis-fil.

| fel | vad | ska | gamla v17 | gamla v1y | gamla still | nya v17 | nya v1y | nya still |
|---|---|---|---|---|---|---|---|---|
| a | tom ögonring en ruta | fäll | fäller | fäller | fäller | fäller | fäller | fäller |
| b | pratbubbla/text 3 px ut och tillbaka | fäll | – | fäller | – | – | fäller | – |
| c | ansikte 3 px ut och tillbaka | fäll | går igenom **FEL** | går igenom **FEL** | fäller | fäller | fäller | fäller |
| d | en bokstav byts en ruta | fäll | – | fäller | – | – | fäller | – |
| e | pupill 6 px ut och tillbaka | fäll | fäller | fäller | fäller | fäller | fäller | fäller |
| g | ansikte 11 px ut och tillbaka | fäll | fäller | fäller | fäller | fäller | fäller | fäller |
| j | kroppsdel 45 px ut och tillbaka (ny) | fäll | fäller | fäller | (går igenom, se nedan) | fäller | fäller | (går igenom, se nedan) |
| j2 | kroppsdel 30 px ut och tillbaka (ny) | fäll | fäller | fäller | (går igenom, se nedan) | fäller | fäller | (går igenom, se nedan) |
| f | glidning 5 px/ruta, uppbyggd och inbromsad | igenom | – | – | går igenom | – | – | går igenom |
| f2 | glidning upp till 12 px/ruta, uppbyggd och inbromsad | igenom | – | – | fäller **FEL** | – | – | går igenom |
| f2b | glidning upp till 14 px/ruta (över 12) | fäll | – | – | fäller | – | – | fäller |
| f3 | gamla glidningen: 5 px direkt, tvärstopp, vänder (ryck) | fäll | – | fäller | går igenom **FEL** | – | fäller | fäller |
| f4 | gamla accelererande glidningen utan inbromsning (ryck) | fäll | fäller | – | fäller | fäller | – | fäller |
| h1 | ansikte 2 px ut/tillbaka ovanpå glidning 3 px | fäll | – | går igenom **FEL** | går igenom **FEL** | – | fäller | fäller |
| h2 | 3 px ovanpå 3 px | fäll | – | går igenom **FEL** | går igenom **FEL** | – | fäller | fäller |
| h3 | 2 px ovanpå 6 px | fäll | – | fäller | går igenom **FEL** | – | fäller | fäller |
| h4 | 3 px ovanpå 6 px | fäll | – | fäller | går igenom **FEL** | – | fäller | fäller |
| h5 | 2 px ovanpå 9 px | fäll | – | fäller | fäller | – | fäller | fäller |
| h6 | 3 px ovanpå 9 px | fäll | – | fäller | fäller | – | – | fäller |
| k | snabb mjuk huvudvridning 1..6..1 px/ruta | igenom | går igenom | – | går igenom | går igenom | – | går igenom |

### j och j2 på still-basen
Planteringen flyttar en ruta på 160 × 160 px på bålen. I still-basens närbild hamnar den på rockens enfärgade yta, så ingenting i bilden ändras. Det råa måttet är inte över gränsen i någon ruta, och detsamma gäller båda måtten. Planteringen är alltså ogiltig där. Den fäller med båda måtten på v17 och v1y.

## Lederna (motion2.py, det nya rörelsemåttet)
Kört på v17:s figurfil.

| fall | ska | utfall |
|---|---|---|
| ingen plantering | igenom | igenom |
| jump: hand 45 px en ruta | fäll | fäller |
| snap: 0 till 30 px/ruta utan uppbyggnad | fäll | fäller |
| smooth: snabb, uppbyggd och inbromsad (10..35 px) | igenom | igenom |
| c: huvudet 3 px ut och tillbaka | fäll | fäller |
| headturn: mjuk snabb huvudvridning | igenom | igenom |

Film v57:s leder går också igenom (leder-v57.txt).

## Filmerna själva
| film | gamla måttet | nya måttet |
|---|---|---|
| v17 | 1 ruta, loopsömmen | 1 ruta, loopsömmen |
| v1y | 6 rutor: ögonflimmer 36, 384, 506, 632, 1046, 1071 | 7 rutor, se nedan |

v1y:s sju rutor med det nya måttet:
- ögonflimmer: 36, 384, 632, 1046 och 1071 fäller med båda måtten;
- ruta 506 fäller bara med det gamla;
- text 1000 (198 av 150) fäller bara med det nya;
- ansiktsspåret: ryck på 4,6-5,0 px vid 70 och 384, där båda ögonen visar samma ryck. Det har ögonlappsfilmen verkligen.

## Det som ändrats i det nya måttet i omgång 2
Allt finns i engine/scripts/flicker2.py.

1. **Ansiktsspåret.** Runt varje öga matchas bilden mot rutan före med faskorrelation, med en tiondels pixels noggrannhet och kameran borttagen.
   - Högst 12 px per ruta.
   - Farten får ändras högst 4,5 px per ruta, alltså 12 px uppbyggt på ungefär 3 rutor.
   - Aldrig ut och tillbaka: fartändringen byter tecken två gånger inom 3 rutor, där de yttre ändringarna är över 1 px och den mittersta över 2,5 px. Felet anges på rutan som gick ut.
   - Matchningar med konfidens under 15 litas inte på. Blinkningar gav falska skift på 15-25 px.
   - Det här fångar c, h och g, även när lederna står still.
2. **Platta filmer utan kameramatriser.** Hela bildens egen panorering mäts med faskorrelation och tas bort, på samma sätt som kameran tas bort i 3D. Två skydd:
   - den tas bara bort när den är stadig, alltså åt samma håll och med en fartändring inom ryckgränsen, så att en hel bild som hoppar ut och tillbaka aldrig tas bort;
   - den tas bara bort om flimret då minskar.

   Panoreringen får vara högst 12 px per ruta (f2b fäller) och får inte rycka mer än 4,5 px (f3 och f4 fäller).

   Grundorsaken till att f2 föll med båda måtten var färgkanter med samma ljushet, till exempel blå rock mot brunt skägg. Flimmerkartan arbetar i färg, men förklaringen görs i grått, och där är rutan platt. Färgkanalerna gick inte att använda, eftersom de är halvupplösta i videon (4:2:0).
3. **Lederna.** motion2.py fäller huvudet om det går ut och tillbaka, oavsett belopp. Kontrollen läser nu oavrundade huvudpositioner (headF), eftersom avrundningen ensam gav +1, -2, +1.

## Planteringen (flicker_proof.py)
- f och f2 byggs upp och bromsas in över minst 3 rutor och går tillbaka på samma sätt.
- De gamla glidningarna finns kvar som f3 och f4 och ska fälla.
- Glidningarna läggs bara där filmens egna ansikten står nästan still och texterna är oförändrade. I omgång 2 började f och f2 just när en text poppade in.
- k (mjuk huvudvridning) är ny.
- Ögon som bara delvis är i bild väljs inte.
- Rutorna närmast varje planterat fel (±3) räknas till planteringen.

## Vad som återstår
- b och d testas bara på v1y, eftersom v17 och still-basen saknar bubblor och texter.
- h6 och k saknar plats i v1y men är testade på still-basen, och k även på v17.
- Inget fall är fel med det nya måttet där planteringen faktiskt landar. Det gamla måttet har kvar fem kända svagheter: c, f2, f3, h1-h4 och j på still-basen (den sista är en ogiltig plantering, se ovan).

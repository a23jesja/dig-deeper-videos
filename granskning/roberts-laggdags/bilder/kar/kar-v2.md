# Kärlen i Roberts läggdags, ark v2 (28 nov)

Granskarens beslut den 28 nov: inget kärl rör en mun. Tre ark, varje med sitt planterade fel. Alla i full storlek (2400 x 1500) och i 360 px (800 x 500, en tredjedel).

| Ark | Rätt | Planterat fel |
|---|---|---|
| Hooken, bild 1 | krok-v2.png | krok-fel-v2.png: muggen vid munnen |
| Hällningen, bild 8 | hall-v2.png | hall-fel-v2.png: halsen genom muggens vägg |
| Doppet, bild 14 | dopp-v2.png | dopp-fel-v2.png: kaggens vägg genom muggen |

Kontrollen är `engine/scripts/prop_check.mjs`, och utskriften ligger i prop_check-v2.txt. Den mäter samma geometri som arket ritar (engine/src/craft/roberts3d/props.ts), i arkets px.
- Rätta bilder godkända: 9 av 9.
- Planterade fel fångade: 9 av 9.

## Hooken (bild 1)
- Rompiraten har muggen bredvid skägget i hakans höjd, i 45°, −45° och 15°.
- Avstånd i px från muggen:
  - till skägget: 56 (15°: 36);
  - till munnen: minst 166;
  - till ögonen: minst 171;
  - till näsan: minst 130.
- Rörelsen upp mot hakan och den mjuka stoppen vid frysningen görs i filmen och prövas där med motion2.

## Hällningen (bild 8)
- Unga piraten håller fram muggen. Rompiraten står mitt emot på hans ansiktssida och häller med flaskhalsen nere i muggen.
- Halsens spets ligger 14 enheter under kanten, bakom muggens framvägg. Flaskan korsar kantlinjen inne i öppningen.
- Avstånd i px från flaskan och handen:
  - till rompiratens skägg: minst 53;
  - till hans mun, ögon och näsa: minst 123;
  - till unga piratens ansikte: minst 128.
- Rompiratens kropp är vriden 15° mot unga piraten, oavsett kameran. Vrids han 45° hamnar hans närmaste arm bakom skägget, och handen sticker då fram under skägget. Därför används inte 45° för honom här.
- Han håller flaskan nära botten. Då syns flaskan mellan handen och muggen, också i 360 px.
- Att bedöma: vid 45° försvinner hans överarm in under skäggets nederkant, och underarmen syns därifrån till handen. Det är armen framför bröstet med skägget hängande över, inte en arm genom skägget. Säg till om du vill ha det annorlunda.
- Bildlistan sa att han "plonks onto a barrel and pours". Här står han i stället, så att handen når. Säg till om han ska sitta.

## Doppet (bild 14)
- Knopps axel sitter på halva kroppshöjden, och armen når 137 enheter. En tunna i verklig storlek når upp till hans axel, så han kan inte doppa i den.
- Därför används en kagge vars kant sitter strax över höften. Muggens botten går 56–58 px ner under kanten, och den nedre halvan skyms av kaggens framvägg.
- I plattan måste kaggen vara ett eget mindre föremål, ett ritat eller ett nedskalat Blender-fat. Dagens vinfat i plattan är i verklig storlek.
- Planterat fel: kaggen flyttad så att dess vägg går genom den nedsänkta muggen, ritad framför.

## Vinklar
- Hällningen och doppet visas i 45°, −45° och 25°.
- Vid 15° stiger den lyfta närmaste armens ärmkapa upp i hakan. Det är den frysta riggens ritning, och jag ändrar den inte.
- Förslag till regel i film_check: en lyft närmaste arm (armbågen högre än 20 enheter under axeln) vid en vinkel under 20° fälls, med ett planterat fel vid 15°.
- Krokmuggen klarar 15°, eftersom den armen inte är lyft på det sättet.

# Rättning inom det frysta utseendet: det stängda ögat

Jespers ord (via granskningssessionen 2026-11-17): "Det stängda ögat ritas som en båge utan ring. Frysningen gäller stilen: figurens former, proportioner, färger och linje. Att rätta något som ser fel ut inom den stilen är tillåtet, i den gemensamma koden och efter ditt godkännande."

## Vad som är ändrat
- `engine/src/craft/cast.ts`, funktionen `eye` i `drawHead` (den gemensamma teckningen för Sir Digsworth och alla bifigurer): när locket är stängt (lock över 0,86) ritas ögat som en enda båge och ingenting annat. Ögats kontur ritas inte, och den vita ytan fylls inte. Bågen går nedåt i en neutral eller ledsen min och uppåt i ett leende (leende över 0,4).
- Öppet och halvt öga är oförändrade: samma form, samma kontur, samma lock.
- Monokelns ring är kvar, eftersom den är monokeln och inte ögat; det stängda ögat syns som en båge i glaset.
- Ingen annan form, proportion, färg eller linjebredd är rörd.

## Blad
- `granskning/rattningar/ogon.jpg` (2600 x 2400): öppet, halvt, stängt och glatt stängt, framifrån och i trekvart, för Sir Digsworth, kaptenen och Titus; stort överst och i mobilstorlek (en tredjedel av filmens storlek) nederst.
- `granskning/rattningar/ogon-mobilstorlek.jpg`: bara den nedre delen, för sig.
- Bladet ritas av kompositionen `FaceSheet` (`engine/src/craft/FaceSheet.tsx`), bildruta 0: `PROPS='{"audio":false}' node scripts/stills.mjs FaceSheet out/craft/face_ 0 1 jpeg`.

## Tills bladet är godkänt
I filmerna stänger ingen figur ögonen helt: `play()` i `engine/src/craft/stage/film.ts` håller locket vid högst 0,7. Den gränsen tas bort när bladet är GODKÄNT.

## Skäggen
Görs som eget blad efter version 2 av de två filmerna, enligt Jespers fem punkter (kaptenen, mannen med kroken och tvättaren; framifrån, snett framifrån och i profil; neutral, glad, arg, förskräckt och pratande). De två filmerna byggs inte om för skäggen. Ett första försök (munnen ovanpå skägget) ligger i `cast.ts` bakom `beardMouth` och är avstängt för alla figurer.

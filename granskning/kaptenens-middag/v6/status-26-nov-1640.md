# Middag v6: läget 26 nov kl. 16:40 (till granskaren och molnsessionen)

Granskarens session gick inte att nå kl. 16:40, och ListAgents visade inga sessioner. Därför står läget här.

## STOPP-tid: i morgon 27 nov kl. 12:00

I dag hinns det inte. Ribban ligger kvar.

## Gjort sedan 16:00

**cheat_check.mjs**
- Vid varje klipp och vid loopsömmen jämförs avståndet mellan figur och föremål, för de föremål som syns i båda bilderna (bordet, tallriken, boken, kistan).
- Ordningen över bilden jämförs också.
- Pojkens gångväg kontrolleras i de bilder där han går.
- Båda planterade felen fäller: kaptenen 30 cm i bild 2, och två figurer som byter plats.

**Fusk per bild** (shots.json, nyckeln "cheat")
- Kaptenen flyttas 0,8 m i bild 4 och 8 och 1,5 m i bild 12 och 13. Kistan flyttas med honom i Blender.
- Sjömannen flyttas 0,6 m i bild 11, 12 och 13, för kontinuiteten 11→12.
- Pojken flyttas ut ur bild 8.
- Puddingen och rörelserna följer figurens plats i varje bild.

**Pojkens gång**
- Gången går i bild 8–11 (12,1–18,7 s, 6,6 s). Där tittar kamerorna mot kaptenens sida. I sjömannens ensambilder 12–13 syntes gångvägen alltid bakom honom.
- Pojken står vid bordsänden (-1,65; 1,15) från bild 12. Före det står han på (-2,3; 0,34).

**Kameror finns för** bild 1, 2, 3, 5, 7, 10b, 12, 13, 14, 15a och 15b.

## Kvar

**Bild 4, 8, 9 och 11.** Varje handrättning flyttar felet till en granne:
- I bild 11 täcker sjömannen kaptenens ansikte.
- I bild 9 är sjömannens huvud till 93 % i bild.
- I bild 8 syns pojkens platser.
- I bild 4 är pojkens huvud till 71 % i bild.

**I kväll:** ett sökskript som prövar fuskförskjutningar (kaptenen, sjömannen och pojken ut ur bild eller undan) tillsammans med kameravinklar för de fyra bilderna. Skriptet kör cheat_check automatiskt och skriver en kort sammanfattning.

**I morgon**
- Plattor och alla kontroller, med beard_check och planterat fel.
- En provrendering och egen granskning med 2 rutor per sekund.
- Leverans och STOPP kl. 12:00, med granskarens oberoende granskning.

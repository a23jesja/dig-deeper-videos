# Rörelseprovet A: rättningar efter den oberoende granskningen av v4, förberedda i koden (21 november 2026)

Ingenting är renderat. Jesper avgör v4, och det här renderas först om han säger till. Därför är rättningarna kontrollerade med modellens kontroller men inte sedda i bild. Det som bara syns i bild står under "Ej sett i bild".

## Rättningarna

1. **Mustaschen över ögonen och monokeln:**
   - Framifrån, i tre-kvart och i profil ritas nu munnen, pipan och mustaschen först. Sedan kommer ögonen och monokeln, därefter näsan, och snöret ovanpå som förut.
   - Mustaschens uppåtsvängda spetsar hamnar alltså under ögonvitorna, inte över.
2. **Ada utanför högra kanten:**
   - Kameran är utdragen från PPM 720 till 620, så figurerna är 14 % mindre.
   - Ada står på 0,60 m och ormen på 0,16 m.
   - Ny kontroll i flat_check: huvudet, 140 ritenheter runt skallen med knut och hår, ska vara innanför bilden. Sir räknas inte när han går in eller springer ut.
   - Planterat fel, kameran som i v4 (FLAT_PPM=720): kantfel i 41 av de 40 listade felen, och totalt 257 fel. v5 ger 0.
3. **Svävande fot (Sir 180, Ada 190):**
   - När hälen var lite upp stod skons rundade tå 5–11 px över linjen.
   - Nu sänks en sko vars tå eller häl rör marken tills skon vilar på linjen (shoeDrawn).
   - Ny kontroll: båda de ritade skorna mer än 2 px över linjen utanför löpningen. Den fångade exakt granskarens två rutor (Sir 180: 10,6 px, Ada 190: 5,1 px). v5 ger 0.
4. **Ormen platt bredvid hålet (151):** S-böjen växer med höjden. Låg ormen var den full bredd och låg därför ner.
5. **Löpningen:**
   - Granskaren mätte det första klivet. Från stående är det ett halvt kliv, 170 px i v4, och han var ute ur bild efter ett och ett halvt kliv. Mina 340 px gällde kliven utanför bild.
   - Nu:
     - Han räknas som ute först när hela figuren har lämnat bilden. Förut räknades han ute när mitten var 1 m till vänster.
     - Kameran är utdragen, så mer av löpningen syns: ett halvt kliv (147 px) och sedan hela kliv om 293 px, på en figur som är 620 px hög.
     - Varje lager som höll armarna (pekningen, sänkningen och skräcken, 30 s vardera) slutar när löpningen börjar. Då pumpar armarna i löpningens egen takt: handlederna går omväxlande fram och tillbaka cirka 185 px. Förut höll han båda nävarna mot bröstet.
   - Slut 8,40 s.
6. **Adas pupiller i halvblinkningarna:** en blinkning går nu öppen, stängd, öppen, utan halvlock emellan.
7. **Tvivlen:**
   - Munnen i vila i tre-kvart är nu den lilla mörka munnen som framifrån (0,13, utan tunga), 14 längre ner under mustaschkanten. Framifrån gäller fortfarande Jespers godkända blad: en liten mörk mun i vila.
   - Ada pekar med den närmre armen (vänster, när hon vänder sig åt vänster), riktad framåt. Fingertoppen sitter 140 px framför henne och armbågen syns. Med den bortre armen ritades armen bakom kroppen.

## Kontroller (v5-koden)

| Kontroll | Resultat |
|---|---|
| flat_check (`flat-check-v5.txt`) | FLAT CHECK OK. Skor 0,0 px, sjunkning 0, glidning 0, pupiller minst 50 %, hopp högst 15 % per ruta, närmaste hand mot ormen 50 px, inga svävande skor, huvudet innanför bilden. |
| Vyerna (`vyer-v5.txt`) | VIEWS OK. |
| Löpningen (`lopningen-steg-v5.txt`) | Kliv 147, 293, 293 … px. |

## Ej sett i bild

Det här kan bara bekräftas i en rendering:
- ritordningen för mustasch, ögon och monokel
- den vilande munnen i tre-kvart
- ormens början
- blinkningen
- Adas pekarm
- armarna i löpningen
- hur bilden ser ut med den utdragna kameran

## Inte rättat

- **Skon över skon** (granskarens bild 10, rutorna 55–58): den lyfta skon ritas över den som står kvar när han kliver in i vändningen. Den togs inte upp i listan.
- **Gången som dippar** (bild 09): den togs inte heller upp i listan.

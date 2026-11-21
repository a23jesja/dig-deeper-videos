# STOPP: rörelseprov, platt 2D A Knopp, v3 (21 november 2026), omgång 2 av 3

v3 rättar de elva punkterna från granskningen av v2. v1- och v2-filerna ligger orörda.

## Filer (leverans/rorelseprov/)

| Fil | Storlek | md5 |
|---|---|---|
| rorelseprov-a-v3.mp4 | 2 853 692 B | ef48451a2e9fd10051cec2c776be5fcf |
| rorelseprov-a-v3-telefon.mp4 | 1 177 713 B (under 29 MB) | e8e089b090c9292e0208f10970f4948b |

- **ffprobe:** 1080×1920, 30/1, 264 rutor (8,85 s), yuv420p, tv, bt709, AAC 48 kHz.
- **Rendering:** dubbel storlek, en rendering i förgrunden som jag körde själv, med minnesspärren (15,4 GB fritt). Efter renderingen fanns 0 kvarlämnade processer. CRF 16, telefonkopian CRF 23.

## Händelserna (s)

| Händelse | Tid |
|---|---|
| Gång in (i bild från första rutan) | 0–1,6 |
| Vändning mot kameran | 1,76–2,36 |
| Pekning mot platsen vid Ada, huvud och blick dit | från 2,46 |
| Repliken | 3,10–5,15 |
| Ormen kommer upp där han pekade | 5,20 |
| Rädd | 5,50 |
| Vänder sig | 6,20 |
| Springer | 6,70 |
| Ur bild | 7,80 |
| Slut | 8,85 |

## Punkterna

1. **Vändningarna via en tre-kvartsteckning.** Huvudet har nu tre teckningar: framifrån, tre-kvart och profil, för både Sir och Ada. Det byter vid 0,45 och 0,85 av vridningen.
   - Varje tre-kvartsteckning står 4 rutor eller mer (`vyer-v3.txt`, scripts/flat_views.mjs, som fäller en tre-kvart under 2 rutor och ett direkt byte mellan profil och framifrån):
     - Sir: profil 0–61, tre-kvart 62–65, framifrån 66–80, tre-kvart (tittar mot Ada) 81–166, framifrån 167–193, tre-kvart åt vänster 194–197, profil åt vänster 198–263
     - Ada: framifrån 0–108, tre-kvart (tittar mot Sir) 109–167, framifrån 168–201, tre-kvart 202–208, profil 209–263
   - Före varje vändning dippar huvudet lite åt andra hållet.
   - Kroppen vrider sig mjukt med skelettet.
   - Bilder: `v3-vandning1-sir-58-68.jpg`, `v3-vandning2-sir-188-200.jpg` och `v3-vandning-ada-200-212.jpg`, en ruta i taget.
2. **Skorna under marklinjen.**
   - Skon ritas aldrig under linjen (designs/flat.ts shoeDrawn).
   - flat_check mäter nu skons hela kontur. Den fäller v2:s skor (FLAT_V2=1) med 22 fel, högst 14,7 px (`flat-check-v2-skoregeln.txt`). v3 ger 0,0 px.
   - Bilder: `v3-skor-vid-marken-59-66-191-197.jpg`.
3. **Tomma ögon vid rädslan.**
   - Orsak: minen som tonades in angav en pupillstorlek, men minen före hade ingen. Tonningen gick då genom pupillstorlek 0.
   - Nu anger varje min sin pupill. Pupillerna krymper jämnt över 3 rutor, hos Sir 167–169 och hos Ada 168–170, och blir aldrig mindre än slutstorleken.
   - Bild: `v3-pupiller-162-172.jpg`.
4. **Handbytena.** Varje byte av handform ligger mitt i en snabb rörelse med den armen:
   - Sir: näve till lös hand mitt i vändningen, lös till pekhand mitt i pekrörelsen, peka till lös medan armen sänks, lös till öppen mitt i ryckningen, öppen till näve mitt i den andra vändningen
   - Ada: lös till öppen mitt i ryckningen, öppen till pekhand mitt i pekrörelsen
   - Bild: `v3-handbyten.jpg` (77–82, 155–160, 166–171 och 213–218).
5. **Monokeln** sitter alltid på hans högra öga:
   - framifrån på ögat till vänster i bild
   - i tre-kvart åt höger på det närmre ögat, och åt vänster på det bortre
   - i profil åt höger synlig, och åt vänster dold bakom huvudet tillsammans med kedjan
   - Bilder: `v3-monokeln.jpg` (30, 64, 75, 120, 195 och 205).
6. **Adas fötter** följer vändningen. Hon vänder sig med motionsbibliotekets steg (vridning med två steg) innan hon pekar.
7. **Munnen i profil** ritas nu efter pipskaftet och syns medan han går in (`v3-ruta-30.png`).
8. **Hakan:** mustasch, mun och näsa sitter 8 högre, så en smal haka syns under den öppna munnen (`v3-ruta-120.png`).
9. **Pipan** tippar ner i mungipan när han blir rädd (52°) och hänger så i löpningen (`v3-ruta-165.png` och `v3-ruta-215.png`).
10. **Pekningen:** huvudet vrids 38° mot Ada och blicken går dit. Han står i tre-kvart medan han pekar (`v3-ruta-120.png`).
11. **Tempot och orsaken:**
    - Han syns i första rutan (`v3-ruta-30.png` visar honom på väg in).
    - Filmen slutar 1,0 s efter att han har sprungit ut, och är 8,85 s mot 10 s.
    - En orm reser sig ur sanden där han pekade ("the treasure is buried right there"), och det skrämmer dem båda. Ormen har platt grön kropp, stora ögon och en tunga som fladdrar. Inget ljud.

## Kontroller

| Kontroll | Resultat |
|---|---|
| Fötterna och skorna (`flat-check-v3.txt`) | FLAT CHECK OK. Skornas kontur 0,0 px under linjen, sjunkning 0,0 px, glidning 0,0 px. |
| Vyerna (`vyer-v3.txt`) | VIEWS OK. |
| Flimmermåttet (`flimmer-v3.txt`, upplysning) | 56 rutor, alla i rörelse. Mest fälls ruta 218 i löpningen (19 038 px). |

Flimmermåttets rutor fördelar sig så här:
- gången (15–37)
- vändningarna (59–66 och 191–197)
- pekningens början (80)
- ormen som reser sig på 0,2 s (157–159)
- ryckningen (167–169)
- Adas vändning och löpningen (200–221)

**Tvivlen:**
- Örat i profil har jag låtit vara.
- Mustaschen är liten i profil jämfört med framifrån. Den har jag inte ändrat.

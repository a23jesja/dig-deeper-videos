# STOPP: bildtyperna i platt 2D A Knopp, v3 (21 november 2026), omgång 3 av 3

v3 rättar granskningen av v2. Det är sista omgången, och därefter avgör Jesper. Filerna för v1 och v2 ligger orörda.

## Filer (leverans/bildtyper-2d/)

Alla klipp är 1080×1920 i 30 fps. Jag renderade själv, ett jobb i taget, i dubbel storlek med CRF 10 och sedan till CRF 16. Telefonkopiorna har CRF 23. Efteråt fanns 0 processer kvar. md5 står i `md5-v3.txt`.

| Fil | Längd | Storlek | md5 | Telefon | md5 |
|---|---|---|---|---|---|
| 01-sta-och-prata-v3.mp4 | 4,60 s | 1 587 088 B | 913b6dabb8672977d01e841745929dde | 681 964 B | 229ff9d67514be5dd1d93eab5a62ebd1 |
| 02-ga-v3.mp4 | 4,70 s | 1 117 768 B | 4304db378bee1cdba524d0d30031b77d | 376 662 B | 34b88a3f2041cb98044542ff903acf7a |
| 03-vanda-sig-v3.mp4 | 4,20 s | 1 104 327 B | 41a0ac26bbc1d3531380f69503ead45b | 380 734 B | 894ea256905e520f44783249deded093 |
| 04-halla-med-bada-handerna-v3.mp4 | 4,40 s | 1 287 809 B | 2160e8a835d756fc30deee166f8d6a39 | 556 933 B | 1357ec0121d84b5e6c1670cee2c35e78 |
| 05-peka-v3.mp4 | 4,00 s | 1 118 173 B | 06ef3648ca6e22fd28c5b89140baacd1 | 379 362 B | 791f33cabc4c98d05b32016a70233470 |
| 06-reagera-v3.mp4 | 4,00 s | 1 126 304 B | 80e11db8f8dca80c59e6c238d3f3a94a | 385 971 B | 9a1432a825c01383c94bc3d78214ef42 |
| 07-sitta-v3.mp4 | 4,40 s | 846 527 B | fe6219a48e053ff037672b090d25e654 | 275 848 B | 1522e771df410a750a5dd6b501ac0c02 |
| 08-oppna-en-dorr-v3.mp4 | 4,40 s | 727 300 B | fa1d8a5fc012cbfa718d9b9559d28d0b | 298 614 B | 19e3ed805dbfbe10888cdf8c94eb39c9 |

**Ljud:** 01 har Georges replik (−13,9 LUFS, topp −2,8 dBFS). 02–08 är tysta (−91 dB). Inga nya ElevenLabs-anrop är gjorda.

## Gemensamt

**Bildkanten:**
- Varje kamera passas nu in automatiskt (`fitCam`), så att hela figuren ryms i varje ruta: mössan, öronen, pipan, händerna, armbågarna och fötterna, med 4 % marginal.
- Kontrollen kräver hela figuren inom bilden med 3 % marginal (tidigare bara huvudet).
- 01 och 04 är medium med figuren cirka 75–80 % av höjden. 05 ligger på 70 % med skeppet i bild.

**Föremål på samma marklinje:**
- 05: pollaren är borttagen.
- 07: lådan står bakom honom, med framkanten under låren och fötterna framför den.
- 08: husväggen står 60 px högre upp i bilden än hans marklinje, med en trottoar emellan, så han står tydligt framför. Dörren öppnas inåt, innanför öppningen.
- Kontrollen fäller en sko som överlappar ett föremål på samma linje.

## Per klipp

**01**
- Han ryms helt i bild, händerna under gesten och mössan.
- Monokelkedjan slutar i en liten guldknapp på rocken, i alla vyer.

**02**
- Han börjar med näsan vid bildkanten.
- Stegen är 0,72, längre än skon (0,69), och tar 0,6 s, så kroppen inte gungar 10 px per ruta.
- Han bromsar in med två kortare steg (0,45). Det sista steget kliver lite förbi den andra foten och landar strax framför den, så fötterna står nästan ihop.
- Armpendlingen räknas nu mot det steg som faktiskt tas och tonas bort när han stannar. Han landar med armarna nere, inte frusen mitt i ett kliv.
- Det stängande steget lyfts sent och snabbt, så foten varken svävar eller går från tå till platt på en ruta.

**03**
- Fötterna står ihop. Den förskjutna ställningen gav den frusna klivposen och att han steg 40 px.
- Pipan stannar i hans vänstra mungipa, även i tre-kvart åt vänster.
- Mustaschens bortre halva är 0,6 av den närmre, i stället för 0,34. Det bortre örat skymtar, så skillnaden mot framifrån dämpas.

**04**
- Den bruna formen var ärmen. IK:n lyfte armbågen över handleden. Nu hålls armbågarna under handlederna, och ingenting reser sig mot hakan.

**05**
- Skeppet ligger på horisonten (1265) under pipan och är större (1,5).
- Blicken går ner mot skeppet.
- Armbågen är böjd minst 35° (`bend`).
- Fingret är ute 28 rutor.

**06**
- Han står 25° från kameran, så huvudet behåller samma tre-kvartsvy genom ryckningen.
- Krabban stannar 0,22 m till höger om mitten, helt inne i bild.

**07**
- Rockfållen kortas när låren böjs, så låren syns.
- Lådan står i knähöjd bakom honom, med toppen mot lårens undersida.
- Låren ligger vågrätt fram förbi lådans framkant till knäna. Smalbenen går ner till fötterna framför lådan.
- Han sätter sig under 1,2 s utan dipp och sitter kvar.

**08**
- Husväggen står bakom honom.
- Dörren öppnas inåt på tre ritade gångjärn, och toppen och botten vrids lika (snett perspektiv).
- Handtaget är en lodrät mässingsstång i midjehöjd, och handen tar den där.
- Han tar inget steg utan lutar sig in i tryckningen. Dörren öppnas till 48°, och handen sitter på handtaget med högst 0,3 px fel.
- Den andra handen hänger som en lös näve vid sidan.

**Tvivlet om profilvyn i 03:** jag har behållit den, eftersom den finns i det frysta A Knopp-bladet.

## Kontroller: `clip_check.mjs all`

Resultatet ligger i `clip-check-v3.txt`. Alla åtta: CLIP CHECK OK.

| Ny regel | Planterat fel | Fälls som |
|---|---|---|
| Hela figuren inom bilden | zoom ×1,25 (`planterat-v3-tight-c01.txt`) | "the figure N px past the picture's margin" |
| Sko över föremål på samma linje | en pollare vid fötterna (`ground-prop-c05`) | "overlaps the bollard on the same ground line" |
| Fot som svävar | en fot 15 px upp i 10 rutor (`hover-c03`) | "hangs 15 px off the ground, still, for 4 frames" |
| Häl som slår ner med tån i marken | 22 px på en ruta (`heel-snap-c03`) | "heel drops 22 px in one frame with the toe down" |
| Kroppen stiger eller sjunker | 12 px per ruta (`rise-c04`) | "the body rises" |
| Vy som slår tillbaka | vyn ändras och tillbaka (`flip-flop-c06`) | "the view turns back" |
| Krabban stannar vid kanten | (`crab-edge-c06`) | "comes to rest at the picture's edge" |
| Pipan byter sida och monokeln försvinner | v1:s vändning till profil åt vänster (`turn-v1-c03`) | "the pipe changes side", "the monocle vanishes" |
| Sko på sko | foten ställd på den andra skon (`shoe-on-shoe-c02`) | "the lifted L shoe rests on the R shoe" |

De tidigare reglerna har planterade fel som fälls också med v3-koden:
- blinkning;
- handbyte i stillhet;
- led som hoppar;
- föremål genom föremål;
- dörrens höjd;
- inramning;
- pekmålets avstånd;
- pekning över 1 s;
- det som dyker upp;
- grepp i 04 och 08.

flat_check och flat_views för rörelseprovet: OK.

## Riggen

- **motion.ts:**
  - Armpendlingen räknas mot det steg som tas, och värdet gäller från varje gåendes start.
  - Pendlingen tonas bort över 0,3 s när han stannar.
  - Det stängande steget lyfts sent och snabbt.
- **flat.ts:**
  - Rockfållen kortas när låret böjs.
  - Pipan sitter kvar i vänstra mungipan i tre-kvart.
  - Mustaschens bortre halva är 0,6.
  - Det bortre örat skymtar.
  - Kedjan slutar i en knapp.
- **clipKit.ts:**
  - `fitCam`.
  - `reach` med `bend` och `elbowBelow`.
  - `figBox`.

## Bilder (granskning/bildtyper-2d/)

- `NN-...-v3-blad.jpg`: varannan halv sekund per klipp.
- `NN-...-v3-ruta-N.png`: två rutor i full storlek per klipp.

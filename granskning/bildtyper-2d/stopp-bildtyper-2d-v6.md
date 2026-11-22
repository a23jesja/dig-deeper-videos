# STOPP: bildtyperna i platt 2D A Knopp, v6 (22 november 2026)

v6 rättar granskningen av v5. 02 och 07 är godkända i v5 och 08 i v4, och de står kvar. 04 står kvar som v4. v6 gäller 01, 03, 05 och 06. Inga äldre filer är ändrade.

## Filer (leverans/bildtyper-2d/)

Alla klipp är 1080×1920 i 30 fps. Jag renderade själv, ett jobb i taget, i dubbel storlek med CRF 10 och sedan till CRF 16. Telefonkopiorna har CRF 23. Efteråt fanns 0 processer kvar. md5 står i `md5-v6.txt`, och `md5sum -c` stämmer.

| Fil | Rutor | Storlek | md5 | Telefon | md5 |
|---|---|---|---|---|---|
| 01-sta-och-prata-v6.mp4 | 138 | 1 602 467 B | f271eaf71be75cdedf0f2293fd8c76b3 | 679 396 B | 85b7a038dc023f58a757ebd78c535329 |
| 03-vanda-sig-v6.mp4 | 138 | 1 187 828 B | b9cf9bba287a50e3d6e6682a22e05255 | 401 802 B | f1d60d3f8b7144c30f29ab1d385a0c36 |
| 05-peka-v6.mp4 | 120 | 1 275 292 B | 287cecc489cd9d0d840449502a55a658 | 461 881 B | b2371c9e2375a62a08f9e665352ecca7 |
| 06-reagera-v6.mp4 | 120 | 1 123 018 B | fb5a5da69412ebad0684a74dc706c663 | 367 981 B | 8d0dbcfa1fbe4505c4a721bb73ba7385 |

**Ljud:** 01 har samma tagning som förut (−13,9 LUFS, topp −2,8 dBFS). 03, 05 och 06 är tysta. Inga nya ElevenLabs-anrop är gjorda.

**Vad som påverkar de godkända klippen:**
- Den nya mustaschen gäller bara tre-kvart. Klippen visar huvudet så här: 02 i profil åt höger, 04 framifrån, 07 i profil åt vänster och 08 i profil åt höger. Ingen av dem visar tre-kvart, så mustaschen ändrar dem inte (`clip-check-v6.txt`, raden "views").
- Rättningarna i 01, 03 och 06 sitter i klippens egen kod och i armsvepet. Armsvepet gäller bara under en vändning, och de fyra klippen har ingen.

## 01: handen upp och ner

- Handen går nu upp i en båge ut åt sidan under 12–13 rutor, med högst 72 px per ruta, och ner samma väg.
- Förut böjdes armbågen framåt mot kameran. Underarmen passerade då över armbågen i bild, och handen såg ut att hoppa från magen till hakan på en ruta.
- Toppen nås vid samma tid som förut (3,04 s), på "dig it up".
- Bild: `v6/01-handen-upp-och-ner.jpg`.

## 03

**1. Handen i armsvepet.**
- Handen ingår inte längre i svepet. Ärmen sveper som förut, med rockens kontur. Handen byter lager hel, och ingen linje ritas över den.
- Handen överlappar rockens kontur med 16–25 % genom hela vändningen, så bytet syns lite var det än läggs. Jag har lagt det där handen ligger minst under rocken, vid |sin| 0,35, med cirka 16 % överlapp. Det är granskningens reservväg.
- I den andra vändningen sker bytet mellan ruta 88 och 90. Vid 90 syns ett litet hack vid manschetten.
- Bild: `v6/03-handen-i-vandningarna.jpg`.

**2. Mustaschen i tre-kvart.**
- Mustaschen ligger mer åt vänster, med mitten på 52 i stället för 78. Den bortre halvan är bredare och högre (0,55 × 1,2), båda halvorna ligger 6 lägre, och den närmre halvan är 0,82.
- Den bortre halvan visar nu 63 % av den närmres synliga yta förbi nosen, mot 18 % i v5. Båda halvorna ligger inne i huvudets kontur.
- **Ny regel i `face_order.mjs`:** den bortre halvans synliga yta ska vara minst 58 % av den närmres, och högst 2 % av någon halva får ligga utanför huvudet. Planterat fel: v5:s mustasch fälls med 18 % och 49 % utanför.
- Bild: `v6/03-mustaschen-i-tre-kvart.jpg`.

## 05 peka

- Horisonten ligger lågt, och skeppet är litet och långt ut till höger. Han pekar snett nedåt framåt med nästan sträckt arm. Överarmen går ut från axeln utanför rockens kontur, och armbågen är lätt böjd.
- **Armbågen är böjd cirka 34° i bild, inte 20–30°.** Riggen når inte rakare i den här riktningen från hans vinkel, och granskaren bad om 20–30°.
- Avståndet från fingret till skeppet är minst 157 px. Fingret pekar inom 14° från skeppet och är ute 30 rutor.
- **Horisonten ligger på 1450, i knähöjd.** I höfthöjd, cirka 1330, blir avståndet bara cirka 117 px, eftersom bilden inte kan bli bredare utan att figuren går under 70 % av höjden.
- Blicken: pupillerna går från mitten, där han ser på oss, till ögonens nedre högra del mot skeppet (0,55 s) och tillbaka efter pekningen (2,85 s). Huvudet böjs lite nedåt.
- Bild: `v6/05-peka-v6.jpg`.

## 06 reagera

- Den bortre handens skydd ligger lägre, vid bröstets sida, även under lyftet. Det är fri luft till pipans huvud i varje ruta.
- **Ny regel:**
  - pipans huvud ska hålla avstånd till båda händerna med huvudets storlek, handens storlek och 22 enheter luft;
  - pipans läge läses från ritningen, där `pipeAt` markerar det;
  - planterat fel: v5:s handläge fälls i 45 rutor;
  - marginalen är satt så att v5 fälls från ruta 77, där granskaren såg att de rörde vid varandra.
- Krabbans ögon ritas före klorna, så att en klo som sluts ligger över ögonstjälken.
- Närmaste hand ligger 78 px utöver marginalerna från klorna.
- Bilder: `v6/06-pipan-och-handen.jpg` och `v6/06-krabbans-ogon-och-klor.jpg`.

## Kontroller (utskrifterna i granskning/bildtyper-2d/v6/)

**Kroppskontrollen** (`clip-check-v6.txt`):
- alla åtta CLIP CHECK OK;
- `flat_check`, `flat_views` och `face_order` OK, inklusive mustaschen (`flat-och-ansikte-v6.txt`).

**Planterade fel:** 37 av 37 fälls (`planterade-fel-v6.txt`), inklusive `pipe-hand` och mustaschen från v5.

**Flimmermåttet** (`flimmer-v6.txt`):
- det fäller alla fyra, eftersom figurerna rör sig mer än måttets 12 px per ruta;
- sorterat efter plats (`flimmer-efter-plats-v6.txt`) klarar sig 01, 05 och 06;
- i 03 återstår vybytena (32–33, 42–43, 76 och 91);
- planterat tomt öga i 05, ruta 47: fälls med 108 424 px.

**Bytes-kontrollen** (`part-diff-v6.txt`): 01 och 05 OK.
- **03:** svepet över ärmen (88–95) och handens byte (90). Benet i 90, 7,5 och 9,9. Små utslag i 49 och 103.
- **06:** huvudet vrids neråt (69–78), som i v4 och v5.
- Planterad fläck i 05, ruta 60: fälls.

## Bilder (granskning/bildtyper-2d/)

- `NN-...-v6-blad.jpg` och `NN-...-v6-ruta-N.png` för 01, 03, 05 och 06.
- I `v6/`: alla bilder som nämns ovan.

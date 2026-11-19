# Bildbiblioteket, omgång 2 (20 november): åtta klipp

Kod: `engine/src/craft/shorts/shotLibrary.ts`, commit bf9ad61. Riggen är 60a93d3 och testerna 031c7b9.
- Varje klipp är 4 s, 1080 x 1920 och 120 rutor, utan ljud, i hyttljuset v5 (`cabinV5()`).
- Alla är skurna ur en och samma rendering, `out/craft/shot-library-r2.mp4`, med `V=-r2 bash scripts/shot_library.sh`.
- Klippen från omgång 1 ligger orörda i mappen ovanför.

## Klippen

| Klipp | md5 |
|---|---|
| 01-stand-and-talk-r2.mp4 | ad7810b1ecb8239557042ed983c5f572 |
| 02-walk-across-r2.mp4 | c4ba8a38e062fec562254c38b9ce286f |
| 03-turn-and-look-r2.mp4 | 008ddb805073e51c369a4c24cce4fb83 |
| 04-hold-with-both-hands-r2.mp4 | 61cdc6f6911199cadbc4fe3d5148bbd8 |
| 05-point-r2.mp4 | 9bb3dffedcf3912557bcaf1afe6fe071 |
| 06-react-r2.mp4 | dfc7b81e9cd10f95657c507129c8472d |
| 07-open-a-door-r2.mp4 | 7698670718fdb19a0106c85fa0fb88de |
| 08-sit-r2.mp4 | 2523f42e69edc353e94b0e01603c4560 |

## 1. Munnen: en ruta i full storlek per klipp där munnen är som mest öppen (omgang-2/)

Rutorna är tagna ur de renderade klippen. Mest öppen mun är uppmätt med `film_info shot-library pose`.

| Fil | md5 | Vad som syns |
|---|---|---|
| 01-munnen-mest-oppen-ruta-87.png | 4d89bea469d3730cdb790ec60a61c182 | munnen öppnas på vänster sida; mungipan vid pipan är stängd runt skaftet |
| 05-munnen-mest-oppen-ruta-117.png | feea1a001b6b0cd657cd27ef3c4e5553 | pipan sitter på bortre sidan och syns från sidan; munnen öppnas på den nära sidan |
| 06-munnen-mest-oppen-ruta-72.png | 1c4c7fdf989003eb5c8a9a496494726d | gapande mun på andra sidan; pipan i den stängda mungipan |
| 08-munnen-mest-oppen-ruta-45.png | d7d8f21c96da9be252b08de79d1e2c67 | han sitter och pratar; pipan på bortre sidan |

I 04 pratar han inte längre: han visar boken med stängd mun och ler.

## 2. Kontrollerna på filmen `shot-library`, alla på 0

- `body check: 960 frames, 960 figure-frames, 360 pairs tried, 0 faults`
- `motion check: 0 faults`
- `FILM CHECK OK for shot-library: 8 shots, 32.0 s, no figure seen from more than 35 degrees above, none standing in another or in a solid, none jumping, no face covered and no figure cut by a thing in the foreground`
- `grips ok: 159 readings of a thing in a hand, every grip in the hand, a hand on every held thing and every working end where its use allows; every face whole in every frame (...)`
- `NO SHEETS OK`

## 3. Diff ruta för ruta (YAVG)

Filerna ligger bredvid klippen som `<klipp>-yavg.txt`, med 119 värden per klipp: ffmpeg tblend difference och signalstats. "Ensam topp" betyder en ruta som är mer än dubbelt så hög som båda grannarna, och sådana söktes i varje fil.

| Fil | md5 | Max (ruta) | Median | Ensamma toppar | Vad maxet är |
|---|---|---|---|---|---|
| 01-…-yavg.txt | d1d3d6bba638756220573db7a29e429f | 2,45 (48) | 1,29 | inga | händerna öppnas, 1,6 s |
| 02-…-yavg.txt | 3d3bd7e21f5c963dfe4bcd09fef92a59 | 3,62 (63) | 2,55 | inga | gången mitt i bild |
| 03-…-yavg.txt | fcaf85c5028d075aaf955f38e45bd533 | 1,53 (19) | 0,88 | inga | huvudet vänder sig |
| 04-…-yavg.txt | 0c142b9f7c76d122053774d72441120d | 3,62 (15) | 1,17 | inga | boken lyfts, från 0,5 s |
| 05-…-yavg.txt | 1a34aa5fc825fb7099a8d490815485eb | 1,54 (35) | 0,72 | inga | armen förs upp |
| 06-…-yavg.txt | 5948a2c8ab4f6e6df13251023b547e2e | 3,86 (33) | 0,94 | inga | ryckningen, 1,1 s |
| 07-…-yavg.txt | e9c251020340eb4997424597a5606037 | 2,51 (39) | 0,84 | inga | dörren svänger upp efter släppet |
| 08-…-yavg.txt | 0f1ec217575d854f979867c87e487a6a | 1,20 (36) | 0,66 | inga | handen lyfts |

## 4. Det jag prövat för hand

- **01, stel arm:** händerna ändras vid 0,35 s (ut från sidorna), 1,05 s (öppnas), 1,6 s (sjunker), 2,3 s (en hand upp, utåt) och 3,2 s (ned). Ingen pose står längre än 0,7 s. Händerna hålls ut från kroppen: framför midjan låg den nära handen på magen sett tre kvart, så den gesten är borttagen.
- **02, vanlig gång ut ur bild:** han går in genom vänsterkanten (0,3–0,9 s) och ut genom högerkanten (3,5–4,0 s), med gångens egen armpendling och lösa händer. Ingen akt läggs över gången. Linsen står still. Ingen kantskärning från första rutan: han är helt utanför bild där.
- **04, fingrarna och sidorna:** jag valde ditt andra alternativ. Han visar boken för oss, med sidorna mot oss och blicken på oss, lyfter den lite och nickar. Fingrarna är hudfärgade nävar runt bokens kanter, se `04-handerna-och-boken-ruta-60.png` (md5 88f3ced7b1cbbf07acd8237b351a86da). Händerna var grå därför att de låg lågt under lyktan i bara det kalla grundljuset, och fingerlagrets ljus räknades där lagret ritades, framför boken. Nu står han under lyktan, och ljuset räknas där handen är (kit.ts `lookBack`). Tummen är inte ritad: handen är en sluten näve om kanten.
- **07, dörren öppen så att gången syns:** han trycker dörren ifrån sig. Vid 1,3 s, efter 20 grader, släpper han den, och den svänger vidare till 95 grader. Den mörka gången bakom, ett ihåligt rum av plankor, syns från 1,7 s och är helt öppen från 2,5 s, se `07-dorren-oppen-gangen-ruta-90.png` (md5 3d9862fc846e51a1aefea3fa2903b218). Handen är på ringen så länge han trycker: grepptestet håller handflatan inom 5 cm, och armen prövas mot bladet. Att dra dörren mot sig gick inte. Ett blad som dras mot någon som står bredvid måste passera hans arm.
- **Inga ljusstrimmor över något ansikte:** kroppskontrollens test för ljus över ansiktet ger 0 på alla 960 rutor. Jag har också sett efter i kontaktarken i 4 bilder/s: strimmorna går ner från lyktan ovanför huvudena. I dörrklippet är lyktans strålar avstängda, eftersom de från den vinkeln låg över ansiktet.

## 5. Sitta (08)

Sir i rock sitter på en låg träsits i hytten, tre kvart (55 grader), med rocken över knät (knädrapét). Han pratar, och höger hand lyfts från låret utåt med handflatan upp och går tillbaka. Han sitter från första rutan. Att sätta sig och resa sig är inte byggt: rörelsen från stående till sittande går genom en vinkel där drapét byter form, och det skulle synas som ett hopp i rocken. Det byggs med eget blad om du vill.

## Ändrat mot omgång 1, punkt för punkt mot granskning-omgang-1.md

- **01:** gesterna varierar och händerna hålls ut från kroppen. B (pipan i öppen mun) och D (monokeln) är rättade i riggen.
- **02:** han går hela vägen genom bild med vanlig gång. Ingen keps vid kanten, ingen flik bakom rockskörtet, ingen vägg i ansiktet och ingen stelhet i slutet: han är ute ur bild.
- **03:** målet är en flaska på pallen, och den syns i bild (`Shot.look`). Huvudet vänds över en halv sekund, sedan vänder kroppen på fötterna under 1,3 s. Blicken går till flaskan, och testet håller huvud och pupiller mot den.
- **04:** se punkt 4 ovan.
- **05:** den nära armen, med uppsving i 0,25 s och upp på 0,65 s. Armen ligger längs linjen från axeln till flaskan, med armbågen lite böjd och pekfingret ut, och rör sig lite medan han håller. Blicken är på flaskan.
- **06:** händerna kommer upp på en halv sekund, utan förberedande pose och utan skakning. Den nära handen far till bröstet och den andra upp med handflatan ut. Pipan ligger inte över någon hand.
- **07:** se punkt 4 ovan.

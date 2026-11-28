# Roberts läggdags: söndagens STOPP (stillbilder), 28 nov kväll

Alla filer ligger i granskning/roberts-laggdags/. Varje stillbild finns i full storlek (1080 x 1920) och som -360.png (360 x 640, telefonstorlek).

## 1. Bild 1–4 och bild 8 (stopp-sondag/)
| Fil | Bild, tid | Vad som syns |
|---|---|---|
| bild1-blasning-v2 | 1, 1,27 s | Roberts med tekoppen blåser mot lyktan på fatet; puffen går från munnen till lyktan. Bakom honom till höger skålar rompiraten, med muggen på väg upp och ett stänk över kanten. Hooktexten ONE PIRATE CREW / HAD A BEDTIME. |
| bild1-morkret-v2 | 1, 2,0 s | Lyktan har slocknat (plattan med lyktan släckt tonas in på 4 bildrutor från 1,45 s). Rompiratens mugg stannar mjukt när det mörknar och han fryser. |
| bild2-klockan-v2 | 2, 2,8 s | Unga piraten drar i klockrepet. Repet ritas av oss genom hans grepp, mellan handflatan och fingrarna, och klockan ringer. Fatlyktan är släckt sedan bild 1. |
| bild2-sista-lyktan-v2 | 2, 3,93 s | Lyktorna längs babords reling har slocknat en i taget, från den bortersta och inåt. |
| bild3-start-v2 / bild3-morkt-v2 | 3, 4,2 s / 5,73 s | Högt från fören: de tre lyktorna längs styrbord slocknar från vänster till höger, och kanonjären och unga piraten stönar för varje lykta. Figurerna dämpas med ljuset. |
| bild4-kisar-v2 | 4, 8,0 s | I mörkret håller rompiraten muggen bredvid skägget och kisar ner i den: "Oi! I can't see my rum!" |
| bild8-hallning-v2 | 8, 17,33 s | Fill-provet för hällningen: unga piraten håller fram muggen vid midjan, och rompiraten häller bredvid honom på samma djup med flaskhalsen nere i muggen. Kanonjären står bakom till höger. Alla huvuden är fria. |

Fill-provet för hooken är bild1-blasning och bild1-morkret, i filmens storlek.

## 2. Kärlarken v4 (bilder/kar/)
- Hooken, hällningen och doppet, var och ett med sitt planterade fel, i full storlek och 360 px.
- prop_check: 8 av 8 rätt, 8 av 8 planterade fel fångade.
- v4 har det nya kitet: den lösa randtriangeln vid hookens armbåge är borta och innervecket är rundat.

## 3. Bild 18 (bilder/bild18-kamera-v2.jpg)
Kameran står inte längre i masten. Den tittar lågt från däckets mitt, 0,45 m upp, mot Roberts vid babords reling, med gryningshimmeln och vanterna bakom honom.

## 4. Kitändringen a och b (arm-sweep/)
- **Bevisvideor:** svep-v1.mp4, där armen böjs 0 → 120 → 0° på 4 s, och svep-planterat-steg-v1.mp4.
- **sleeve_check.txt, ren:** PASS. Radien ändras högst 3,98 enheter per bildruta (högst en tredjedel av full radie, 4,2). En randbits opacitet ändras högst 0,32 per bildruta (högst 0,35).
- **Planterade fel:** noFade fångas av 17b, noFillet av 17c och stepFillet av hoppregeln.
- **flicker2:** PASS på svepet.
  - Det planterade steget passerar också flicker2, eftersom flicker2 mäter flimmer som går ut och tillbaka och inte ett steg åt ett håll. Steget ändrar dessutom högst 27 px i någon bildruta, eftersom vecket nästan helt döljs av kapslarnas överlapp mellan 20 och 40°.
  - Steget fälls av sleeve_checks hoppregel.
- **motion2:** körs inte på svepet. Det läser figs.json från en film med kameramatriser. Svepet är en sinusvåg, som byggs upp och bromsar per definition.
- **Den frysta diffen mot ad1a161:** 0 rader.
- **dinner_check på källan:** DINNER CHECK OK (732 bildrutor) både före och efter. Utskrifterna är identiska, diffen är 0 rader.
- **Middagens pixeldiffar:** se middag-pixeldiff.md.
- **Att bedöma:** vid en stillastående böjning kring 110–120° syns en randbit på ungefär 17 enheter, tonad till cirka 20 %, som en svag ljusröd fläck i armbågens yttre hörn (se arm-sweep/svep-v1.mp4, bildruta 60). Kring 60° är den nästan osynlig (5 %). Tonningsbandet (från 1 till 3,5 gånger randens bredd) är så brett för att opaciteten inte ska ändras mer än 0,35 per bildruta när armen rör sig. Ett smalare band tar bort fläcken i en stilla pose men ger hopp i rörelse. Säg vilket du föredrar.

## 5. Svartskägg (stopp-sondag/blackbeard-timmar.md)
Ungefär 70 h med full ribba, eller ungefär 59 h med fyra förenklingar som behöver ditt ja.

## 6. Bildlistan: ändringar i shots.json
- **Bild 1:** kameran inne på däck vid 18 mm. Fatet med Roberts lykta flyttat till (−0,34, −1,74) i set.py. Rompiraten skålar i stället för att hälla.
- **Bild 2:** kameran akterut längs babords reling, så att lyktorna slocknar bakom unga piraten. Klockrepet döljs i plattan (hide) och ritas av oss.
- **Bild 3:** kameran högt från fören mot styrbord.
- **Bild 4:** alla lyktor släckta (dark).
- **Bild 8:** 16 mm. Paret står på samma djup och rompiraten står upp. Kanonjären står bakom till höger.
- **Bild 14:** kanonjären bär in kaggen och rompiraten slår in locket med en koffernagel. Alla tre doppar.
- **Bild 18:** se punkt 3.

## 7. Öppet
- Bildtexten visar siffran "8" för "eight", eftersom whisper skriver siffran. Ska den bli EIGHT?
- Arket för kanonjärens bärande i bild 14 är inte gjort än.
- Plattorna är utkast (DRAFT). De slutliga renderas före film-STOPP:et.

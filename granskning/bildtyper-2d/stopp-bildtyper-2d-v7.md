# STOPP: bildtyperna i platt 2D A Knopp, v7 (22 november 2026)

Detta är omgång 4 för 03 och 06. 05 är byggd efter Jespers val b ("Då kör vi så", som svar på "1 ja, 2 ja, 3 b").

01 (v6), 02 (v5), 04 (v4), 07 (v5) och 08 (v4) är godkända och oförändrade. Inga äldre filer är ändrade.

## Filer (leverans/bildtyper-2d/)

- Alla klipp är 1080×1920 i 30 fps.
- Jag renderade dem själv, ett jobb i taget under mem_guard: dubbel storlek med CRF 10, ner med lanczos till CRF 16 och aq-mode 3. Telefonkopiorna har CRF 23.
- Efteråt fanns 0 processer kvar.
- md5 står i `md5-v7.txt`, och `md5sum -c` stämmer.

| Fil | Rutor | Storlek | md5 | Telefon | md5 |
|---|---|---|---|---|---|
| 03-vanda-sig-v7.mp4 | 138 | 1 371 962 B | 999aa66d5c21cdebbf494e4d2c228f97 | 590 212 B | bedf91bc3aaacb11f3cb6837df71765a |
| 05-peka-v7.mp4 | 120 | 1 214 775 B | b8a4dc9075aa589d5021c6e71c7f443b | 475 221 B | b7eb7cd876430fd64136a089481bf8f9 |
| 06-reagera-v7.mp4 | 120 | 1 295 179 B | e47c3bfb024a45e0a79b622c9164d3d8 | 522 937 B | 0613d44cdd2e7a9e1c242c275f44fdbf |

**Ljud:** alla tre är tysta (−91 dB). Inga ElevenLabs-anrop är gjorda.

**De godkända klippen är oförändrade.** Jag renderade 01, 02, 04, 07 och 08 med v7-koden på samma sätt och jämförde ruta för ruta med de godkända filerna. 0 pixlar skiljer, och den största skillnaden i någon pixel är 0. Utskriften står i `v7/jamforelse-godkanda-v7-kod.txt` och skriptet i `engine/scripts/frame_cmp.py`.

## 03 vända sig

**1. Hacket och hårstrecket vid manschetten.**

Rättningen från d68bb23 räckte inte. I den första v7-renderingen syntes båda fortfarande: ett streck tvärs över handen i ruta 87–93 och ett hack i 90–93. Det fanns tre orsaker. Alla är rättade och kontrollerade i full storlek i den slutliga filen.

- **Hacket:** handen bytte lager vid en fast vinkel (|sin| 0,35).
  - Då låg ärmen strax ovanför manschetten fortfarande över rocken, medan rocken täckte handen nedanför. Rockens kant tog slut i ett trappsteg.
  - Nu byter underarmens nedre del (från 0,7 av vägen från armbågen) och handen lager tillsammans. Det sker åt det håll som ger minst steg där ärmen möter rockens kant. Rockens kontur räknas med, eftersom halva strecket ligger utanför rockens form.
- **Hårstrecket:** armen ritades bit för bit genom en mjuk klippkant, och den mörka konturen under fyllningen slog igenom i kanten.
  - Nu ritas armen hel på en egen bild och läggs på genom klippet.
  - När handen ligger framför går ärmen och handen genom ett enda klipp, så ingen kant korsar handen.
- **Snittets linje:** rockens kantlinje gick in över handens topp. Nu hålls den borta från handen.
- **Kvar:** i 1–2 rutor per vändning (ruta 41 och 92–93) syns ett litet hörn på cirka 5–8 px där rockens kant möter ärmen. Så litet kan steget bli med ett rakt svep. Det syns på bilderna nedan.
- **Ny regel i `clip_check`:**
  - Underarmens nedre del ska ligga på den sida av rocken som ger minst steg vid gränsen (högst det minsta svepet tillåter plus 2 enheter).
  - Planterat fel `cuff-notch` (v6/v7-utkastets byte vid 0,35): fälls i 3 rutor (43, 90, 91).
  - Hårstrecket är en pixelsak som modellkontrollen inte ser. Det är granskat i bild.
- **Bilder** (förstorade 2 gånger):
  - `v7/03-handen-andra-vandningen-ruta-87-94.png` och `v7/03-handen-forsta-vandningen-ruta-39-46.png`;
  - jämförelse med v6: `v7/03-handen-v6-ruta-87-94-jamforelse.png`.

**2. Det bortre örat i tre-kvart** visar hud och kontur och läses som ett öra, åt båda hållen. Bild: `v7/03-bortre-orat-ruta-36-93-120.jpg`.

**3. Kedjan** hänger bakom pipskaftet (ruta 92 och framåt), som förberett.

## 05 peka (väg b)

- **Bilden:** en helbild där figuren fyller **52 %** av höjden.
  - Jag siktade på 55 %. Bredden avgör: skeppet ska ligga minst 150 px från handen och hela skeppet ska rymmas till höger.
  - 52 % ligger inom DAILY-RULES 50–80 %. Fötterna och kajen syns, och den nedre halvan av bilden är hav och figur, inte bara mark.
- **Skeppet:** större (1,4 mot 0,55 i v6, cirka 2,5 gånger så stort) och står på horisonten.
  - Horisonten ligger i brösthöjd, på 1265. Axeln är på 1180 och höften på 1324, så horisonten ligger på mitten av bröstet.
  - En högre horisont fick handen att nudda pipans huvud (regeln fällde det). På 1265 klarar sig pipan och handen.
- **Pekningen:**
  - Han pekar rakt ut. Överarmen står vågrätt ut från axeln, utanför rockens kontur, och armbågen är böjd cirka 22° i bild.
  - Fingret pekar inom 9° från skeppet och är ute 27 rutor (0,9 s).
  - Handen ligger minst 154 px från skeppet i bild.
  - Fingret knyts när armen börjar sänkas. Förut pekade det ner i vattnet på vägen ner.
- **Blicken:** pupillerna går till skeppet strax före lyftet (0,55 s), lite åt höger och nedåt, och tillbaka efter pekningen (2,85 s).
- **Bilder:** `05-peka-v7-blad.jpg` och `v7/05-peka-v7-ruta-30-45-55-70.jpg`.

## 06 reagera

- **Pupillerna:** den bortre pupillen flyttas bort från nosen, och båda ser åt samma håll, nedåt höger mot krabban. Han ser inte skelögd ut.
- **Pipan och tummen:** det är fri bakgrund mellan pipans huvud och den upplyfta handen i alla rutor. Regelns marginal motsvarar cirka 40 px mellan konturerna.
- **Bild:** `v7/06-pupiller-och-pipan-ruta-50-77-100.jpg`. Det bortre örat syns i `v7/06-bortre-orat-ruta-30-60.jpg`.
- **Krabban:** ögonen ligger fria från klorna.
- **Nytt i v7, hittat av flimmerkontrollen:**
  - Klon vinkade utåt som |sin|, som vänder i en spets. Rutan i spetsen skilde sig från både rutan före och efter, medan de två var lika: flimmer var 21:a ruta (60, 81 och 102).
  - Nu vinkar den som sin², som vänder mjukt. Sorterat efter plats klarar sig 06 nu.

## Kontroller (utskrifterna i granskning/bildtyper-2d/v7/)

**Kroppskontrollen** (`clip-check-v7.txt`):
- alla åtta CLIP CHECK OK;
- 03: figuren 55 % av höjden;
- 05: 52 %, pekningen enligt ovan;
- 06: 50 %, närmaste hand 78 px från krabban, krabbans fötter glider 0,00 px.

**flat_check, flat_views och face_order:** OK (`flat-och-ansikte-v7.txt`). Mustaschens bortre halva visar 63 %, och ansiktet ligger inne i huvudet med högst 0,3 enheter utanför.

**Planterade fel:** 39 av 39 fälls (`planterade-fel-v7.txt`), inklusive det nya `cuff-notch`. De sex för 05 fälls också med den nya bilden.

**Flimmermåttet** (`flimmer-v7.txt`):
- det fäller alla tre, som tidigare, eftersom figurerna rör sig mer än måttets 12 px per ruta;
- sorterat efter plats (`flimmer-efter-plats-v7.txt`) klarar sig 05 och 06;
- i 03 återstår vybytena (32–33, 42–43, 76, 91), samma rutor som i v5 och v6;
- planterat tomt öga i 05: fälls med 54 900 px i ögat (`flimmer-planterad-c05.txt`).

**Bytes-kontrollen** (`part-diff-v7.txt`): 05 OK.
- **03:** armen i 88–95 är rockens kant som glider över ärmen, och den fälls av konstruktion. Övriga utslag: 49, 78 och 92 (benet) och 103, samma slags rutor som i v6.
- **06:** huvudet vrids neråt (69–79), som i v4–v6.
- **Planterad fläck i 05, ruta 60:** fälls (`part-diff-planterad-c05-ruta60.txt`).

## Bilder (granskning/bildtyper-2d/)

- `NN-...-v7-blad.jpg` och `NN-...-v7-ruta-N.png` för 03, 05 och 06.
- I `v7/`: alla bilder som nämns ovan.

Koden: 203c415 (05) och STOPP-commiten (03, 06 och kontrollerna).

# STOPP: Who Sold the Eiffel Tower in 1925, filmen v11 (platt 2D A Knopp), 23 november 2026

## Filer

- **Filmen:** `leverans/eiffel/who-sold-the-eiffel-tower-in-1925-v11.mp4`
  - 1080×1920, 30 fps, 33,16 s, med ljud, 54 228 417 B.
  - md5 5d8675d15a6b5822638175bb5cc5485e (`md5-v11.txt`).
  - **Bithastigheten är 12,9 Mbit/s**, mätt med ffprobe på videoströmmen.
- **Telefonkopian:** `leverans/eiffel/who-sold-the-eiffel-tower-in-1925-v11-telefon.mp4`, 4,4 MB, md5 b51aa06ef6569d658e329503a2edd3d5.
- **Krokklippen:**
  - `krok-d-v11.mp4`: md5 d47405d73dae395c09ed195bbb9f3bad, 14,8 Mbit/s.
  - `krok-b-v11.mp4`: md5 c2e75b1342329f6a826a41d16d674fe7, 14,6 Mbit/s.
- **Arken**, alla i `granskning/eiffel/film-v11/`:
  - `kontaktark-2-rutor-per-sekund.jpg`;
  - `ark-360px-en-ruta-per-sekund.jpg`;
  - `krok-c-overst-mot-d-under-360px.jpg`;
  - `bild-7-i-360px.jpg` (rutorna 308–350);
  - `mossorna-bild-11-och-15.jpg`.
- **Före och efter**, med v10 överst och v11 under: `film-v11/fore-efter/`, för punkterna 3, 4, 5, 6, 7 och 9.

**Manus och röster** är oförändrade: v4c, 5fa38d8 och 5e992de, och "Or so, the story goes." är g15b, take 2. Inga nya röster behövdes, och ElevenLabs-räknaren står kvar på 3 589 av 40 000.

**Koden** ligger i `src/craft/eiffel/eiffel.ts`.

**Det frysta utseendet** är orört: `git diff ad1a161` ger 0 rader i designs, rig, clips, ink, stage och alcatraz/.

**Granskningen av v11 har skett i två omgångar.** Den första oberoende granskningen av v11 (md5 df4b…) fällde den. Felen:
- mössor nuddade varandra i bild 11 och 15;
- öppningsbilden hade 1,7 s utan synlig kroppshandling;
- slipsen försvann på en ruta i bild 5:s vändning.

Alla tre är rättade i filen ovan.

**Orsaken till de två första felen:**
- Min kontroll räknade inte med mössans skärm, som sticker ut framför huvudet.
- "Luta sig" syns knappt på en figur som är vänd mot oss.

## Punkterna från domen på v10

| # | Punkt | Rättning |
|---|---|---|
| 1 | Kroppshandling i varje bild, högst 1,5 s utan ny | Se tabellen nedan. Det längsta uppehållet är **1,4 s** (bild 9, under läppsynken). **Öppningen:** jag behöll (c), eftersom ansiktet och påståendet syns i ruta 1. Kroppshandlingen kommer nu också före 1,0 s: han lyfter SOLD-papperet mot oss på 0–0,5 s och gungar belåtet åt sidan vid 1,05 s. **Figurer vända mot oss** gungar åt sidan, lyfter eller sänker det de håller, i stället för att luta sig. |
| 2 | Storlek | Ensamma figurer ligger på 53–76 %, och tvåbilder på 36–37 %. Kontrollen kräver minst 40 px mellan figurerna, nu också mellan mössornas skärmar. Fötterna står på cirka 80 % av höjden. Bild 7 är nu två klipp med stora figurer, så undantaget för den behövs inte längre. |
| 3 | Bild 10: mannen på bänken tittade bort | Förloraren sitter på vinnarens högra sida, vänd mot honom. Han rycker till och grimaserar (0,6 s) och lutar sig fram och tittar (1,05 s). Vinnaren lyfter budet högt och sätter sig stolt upprätt (0,9 s). |
| 4 | Bild 13: kuvertet svävade | Kuvertet sitter i en bröstficka lågt på bröstet, i profil. |
| 5 | Bild 17: skorstenen | Skorstenen står på ett vitt däckshus på däcket, framför relingen. |
| 6 | Bild 9 → 10: papperet | Den unga handlaren håller budet redan i bild 9 och lyfter det när han frågar. |
| 7 | Blinkningarna | **Orsak:** blinken sätter locket till det största av vilolocket och blinkens värde, och clipKit ritar varje lock mellan 0,3 och 0,75 som 0,42. Belåten (0,55) och grimasen (0,32) såg därför likadana ut i vila och i halvblink. **Rättning:** vilolocket är nu 0,2 för belåten och 0,16 för grimasen, och clipKit är orört. Varje blink går öppet, halvt, halvt, stängt, stängt, halvt, halvt, öppet (`punkt7-…`, rutorna 14–22). |
| 8 | Bithastigheten | Filmen ligger på 12,9 Mbit/s vid CRF 4; de platta teckningarna gav 2,6 Mbit/s vid CRF 16. Krokklippen ligger på 14,8 och 14,6 Mbit/s. Flimret är mätt på den nya filen. |
| 9 | Tidningens rubrik | Rubriken är krumelurer i stället för en svart rand. |

## Storlekar och undantag

- **Tvåbilderna 10, 11, 15 och 16 ligger på 36–37 %** (godkänt: 37–40 %). Det är någon procent under, eftersom mössornas skärmar nu ligger minst 40 px isär.
- **Bild 7** är två klipp inom sina 1,5 s:
  - **7a (10,23–10,98):** bedragaren ensam, 63 %, lyfter sigillbrevet mot handlarna.
  - **7b (10,98–11,73):** de två sittande handlarna, 37 %, som rycker till.

  Båda syns i `bild-7-i-360px.jpg`. **Undantaget på 25 % behövs därför inte.**
- **Pekbilden 8** ligger på 53 % (godkänt).
- **Gångbilderna 13 och 17 ligger på 31 %. Detta är nytt och inte godkänt än.** Vid 60 % flyttar sig en gående figur 23 px per ruta, vilket är över gränsen på 12 px, och flimmermåttet fällde båda bilderna. Jag har därför tagit v10:s gång på 31 %, med stilla kamera.

## Bild för bild

Tiderna gäller filmen i sekunder. Varje kroppshandling står med sin starttid. Kolumnen "Längst utan" är den längsta tiden i bilden utan att en ny kroppshandling börjar, räknat från bildens start till klippet. Höjden är den minsta figurens höjd enligt kroppskontrollen.

| # | Tid | Replik | I fokus, ansikte | Kroppshandlingar (start, s) | Höjd | Längst utan (s) | Utan figur (s) |
|---|---|---|---|---|---|---|---|
| 2 | 0–2,17 | This man sold the Eiffel Tower. | bedragaren, belåten → förtjust | lyfter SOLD-papperet mot oss (04) **0,00**; gungar belåtet åt sidan 1,05 | 60 % | 1,1 | 0 |
| 1 | 2,17–3,67 | It was never his. | bedragarens hand | stämpeln lyfts 2,27 och lyfts sedan uppåt och åt höger 2,67, så att SOLD syns | (handen) | 1,0 | 1,50 (handen) |
| 3 | 3,67–5,23 | A newspaper said… | bedragaren, belåten → förtjust | sänker tidningen 40 px (04) 3,87 | 76 % | 1,4 | 0 |
| 4 | 5,23–6,68 | …cost too much to fix. | ingen (tidningens bild) | (det rostiga tornet) | – | – | 1,45 |
| 5 | 6,68–8,23 | He was a con man. | bedragaren, belåten → förtjust | gungar åt ena sidan 6,83 och åt andra sidan med ett flin 7,53 | 73 % | 0,7 | 0 |
| 6 | 8,23–10,23 | He pretended to be a government official. | bedragaren, belåten → förtjust | lyfter sigillbrevet (04) 8,38; bockar som en ämbetsman 9,18; rätar på sig 9,73 | 62 % | 0,8 | 0 |
| 7a | 10,23–10,98 | He told scrap dealers… | bedragaren, belåten → förtjust | lyfter sigillbrevet mot handlarna (04) 10,23 | 63 % | 0,75 | 0 |
| 7b | 10,98–11,73 | (forts.) | två handlare, lugn och förtjust → höga bryn | rycker till (06) 11,03 och 11,15 | 37 % | 0,6 | 0 |
| 8 | 11,73–13,23 | …to bid for the tower's iron. | bedragaren, belåten | armen upp (05) 11,93; fingret ut 12,35; armen ned 12,71 | 53 % | 0,5 | 0 |
| 9 | 13,23–14,73 | Do you deliver? (Daniel) | den unga handlaren, förtjust | lyfter budet sittande (04/07) 13,33; läppsynk | 73 % | 1,4 | 0 |
| 10 | 14,73–16,23 | One dealer won. | vinnaren (förtjust) och förloraren (lugn → grimas) | vinnaren lyfter budet 14,88; förloraren rycker till (06) 15,33; vinnaren sätter sig stolt upp 15,63; förloraren lutar sig fram 15,78 | 36 % | 0,5 | 0 |
| 11 | 16,23–17,83 | The dealer paid for the tower. | handlaren (förtjust) och bedragaren (belåten → förtjust) | handlaren lutar sig fram och håller fram checken (04) 16,38; bedragaren rycker till med ett flin (06) 16,93 och lutar sig mot checken 17,38 | 36 % | 0,6 | 0 |
| 12 | 17,83–19,73 | The con man got a bribe too. | bedragaren, belåten → förtjust | lyfter mutans kuvert (04) 18,03; gungar belåtet åt sidan 18,93 | 76 % | 0,9 | 0 |
| 13 | 19,73–21,53 | Then he vanished with the money. | bedragaren, belåten | går ut ur bilden (02) förbi dörröppningen, med kuvertet i bröstfickan | 31 % (ny) | 0 (går hela tiden) | cirka 0,3 i slutet |
| 14 | 21,53–24,13 | The dealer was too embarrassed… | den unga handlaren, hård grimas med hopknipna ögon → grimas | sänker brevet, baksidan ut (04) 21,78; vänder bort kroppen (03) 22,48; sjunker ihop och lutar sig 23,43 | 76 % | 1,0 | 0 |
| 15 | 24,13–26,33 | Later, the con man tried again. | bedragaren (belåten → förtjust) och den grå (lugn → grimas) | bedragaren lutar sig fram 24,28; den grå lyfter brevet (04) 24,83 och rycker till av tvivel (06) 25,58; bedragaren rätar på sig 25,88 | 37 % | 0,8 | 0 |
| 16 | 26,33–28,73 | This time, another dealer told the police. | den grå (lugn → allvarlig) och polisen (lugn → chock med öppen mun) | den grå lyfter brevet (04) 26,53; **polisen rycker till med händerna upp (hela 06)** 27,43; den grå lutar sig fram mot polisen 27,93 | 36 % | 0,9 | 0 |
| 17 | 28,73–30,73 | The con man fled to America. | bedragaren, belåten → förtjust | går längs relingen (02) hela bilden; tittar bakåt med ögonen 29,63 | 31 % (ny) | 0 (går hela tiden) | 0 |
| 18 | 30,73–32,43 | Or so, the story goes. | bedragaren, belåten → förtjust | lyfter SOLD-papperet (04) 30,88; gungar belåtet åt sidan 31,68 | 76 % | 0,8 | 0 |
| 2 (loop) | 32,43–33,16 | Any offers? | bedragaren, belåten | bild 2:s uppställning; i ruta 1 börjar lyftet | 60 % | 0,7 | 0 |

**Summan:**
- **En figur i fokus:** 33,16 − 1,50 − 1,45 − 0,3 = 29,9 s, alltså **cirka 90 %**.
- **Längsta tid utan en ny kroppshandling:** 1,4 s (bild 3 och 9).
- **Bara rösten:** högst 1,5 s åt gången.

## Kontroller (på filen ovan)

- **Kroppskontrollen** (`scripts/clip_check.mjs eiffel`): OK för alla 20 bilder.
- **Eiffeltornets kontroller** (`scripts/eiffel_check.mjs`): OK.
  - **Bredvid varandra:** kontrollen räknar figurens låda plus mössans skärm åt det håll han tittar. Skärmen mättes till 175–187 enheter i en ruta ur bild 11, och kontrollen räknar 195.
    - Minsta avstånd: 7b 58 px, bild 10 43 px, bild 11 57 px, bild 15 59 px och bild 16 66 px.
    - Bladet `mossorna-bild-11-och-15.jpg` visar fyra rutor ur bild 11 och 15, med mössorna fria från varandra.
  - Stämpeln rör sig högst 10,7 px per ruta.
  - Texten står 3,03 s, och loopen möts.
  - Inga låga ljud och inga fotsteg.
- **Flimmer** (`film-v11/flimmer-v11-med-klippen.txt`): **0 fällda rutor** (största 1 936 px av högst 2 000).
  - Verktyget har fått veta var klippen ligger (`regions-shots.jsonl`, från tidslinjen).
  - Utan klippen (`flimmer-v11.txt`) fälls bara ruta 307 och 921. Båda sitter vid ett klipp, där rutan före och efter tillhör olika bilder.
- **Flimmer i krokklippen:** 1 159 px i (d) och 920 px i (b), alltså 0 fällda rutor.
- **Ingång** (`ingangskontroller-v11.txt`):
  - ljud i ruta 1;
  - texten har 6 ord på 3,0 s, alltså 1,5 s per rad;
  - bilderna i sekund 0–10 är 1,4–2,2 s långa;
  - loopen ändrar 2,0 % av bilden.
- **ElevenLabs:** 3 589 av 40 000, oförändrad.
- **En andra oberoende granskare** granskar den här filen. Svaret skickas separat.

## Att ta ställning till

1. **Gångbilderna 13 och 17 på 31 %** (se Storlekar).
2. **Tvåbilderna på 36–37 %** i stället för 37–40 %, eftersom mössornas skärmar räknas.
3. **Belåtens vilolock är 0,2** i stället för 0,55 (punkt 7), så blicken är lite mindre sömnig.
4. **Bild 5 vänder sig inte längre.** Vid vändningen bytte bålen ritning och slipsen försvann på en ruta; nu gungar han åt sidorna.
5. **Förtjust har fortfarande leende 0,3**, med stängd mun.

# STOPP: Who Sold the Eiffel Tower in 1925, filmen v11 (platt 2D A Knopp), 23 november 2026

## Filer

- `leverans/eiffel/who-sold-the-eiffel-tower-in-1925-v11.mp4`
  - 1080×1920, 30 fps, 33,16 s, med ljud.
  - 55 091 084 B, md5 df4b435461d5d3a187c9074d0adbf17d (`md5-v11.txt`).
  - **Bithastigheten är 13,1 Mbit/s.** Den mäts med ffprobe på videoströmmen; kravet är 12–16.
- `leverans/eiffel/who-sold-the-eiffel-tower-in-1925-v11-telefon.mp4`: telefonkopia, 4,5 MB, md5 21fdd1f25d970d1854d3aa38a488a1b4.
- **Krokklippen:**
  - `krok-d-v11.mp4`: md5 36db4255b5aeda60b50bb4fa0c2970dd, 14,9 Mbit/s.
  - `krok-b-v11.mp4`: md5 6913086df9cac39b31ee0d2d90976168, 15,3 Mbit/s.
- **Arken** i `granskning/eiffel/film-v11/`:
  - kontaktark med två rutor per sekund: `kontaktark-2-rutor-per-sekund.jpg`;
  - ark i 360 px med en ruta per sekund: `ark-360px-en-ruta-per-sekund.jpg`;
  - (c) överst mot (d) under i 360 px: `krok-c-overst-mot-d-under-360px.jpg`;
  - **bild 7 i 360 px:** `bild-7-i-360px.jpg`.
- **Före och efter** (v10 överst, v11 under) i `film-v11/fore-efter/`, för punkterna 3, 4, 5, 6, 7 och 9.

**Manus och röster** är oförändrade: v4c, 5fa38d8 och 5e992de, och g15b take 2. Inga nya röster behövdes, och ElevenLabs-räknaren står kvar på 3 589.

Koden ligger i `src/craft/eiffel/eiffel.ts`. Det frysta utseendet är orört: `git diff ad1a161` ger 0 rader i designs, rig, clips, ink, stage och alcatraz/.

## Punkterna från domen på v10

| # | Punkt | Rättning |
|---|---|---|
| 1 | En kroppshandling i varje bild, och högst 1,5 s utan en ny | Se tabellen nedan. Den längsta tiden utan en ny kroppshandling är **1,4 s** (bild 9). Alla handlingar är godkända bildtyper: lyft (04), vändning (03), gång (02), ryck (06), sittande (07) och pekning (05), plus att luta sig fram eller bakåt och bocka. **(c)** får en kroppshandling från ruta 1: han lyfter SOLD-papperet mot oss under 0–0,5 s och lutar sig belåtet bakåt vid 1,05 s. Jag behöll (c), eftersom den har ansiktet och påståendet i ruta 1, och den har nu kroppshandlingen före 1,0 s. |
| 2 | Storlek | Se tabellen och undantagen nedan, som du och automatiseringssessionen har godkänt. **Ensamma figurer:** 53–76 %. **Tvåbilder:** 37–40 %, med minst 40 px mellan figurerna, kontrollerat med kod på varje ruta i bild 7, 10, 11, 15 och 16. Vid 45 % gick mössorna i varandra. **Fötterna** står på cirka 80 % av höjden i alla två- och trebilder. |
| 3 | Bild 10: mannen på bänken tittar bort | Nu sitter förloraren på vinnarens högra sida och vänd mot honom. Han rycker till med en grimas (0,6 s) och lutar sig fram för att titta (1,05 s). Vinnaren lyfter budet. Två figurer på 37 %. Bladet heter `punkt3-…`. |
| 4 | Bild 13: kuvertet svävade vid hakan | Kuvertet sitter nu i en bröstficka lågt på bröstet, i profil, med fickans kant och sedlarna synliga. Checken är borta ur bilden, eftersom pengarna är kuvertet. Bladet heter `punkt4-…`. |
| 5 | Bild 17: skorstenen stod i havet | Skorstenen står på ett vitt däckshus med runda fönster, på däcket och framför relingen. Bladet heter `punkt5-…`. |
| 6 | Bild 9 → 10: papperet | Den unga handlaren håller budet redan i bild 9 och lyfter det när han frågar (0,1 s). Bladet heter `punkt6-…`. |
| 7 | Blinkningarna | **Orsaken i koden:** blinkningen sätter ögonlocket till det största av vilolocket och blinken, och clipKit ritar varje lock mellan 0,3 och 0,75 som 0,42. Belåten hade vilolocket 0,55 och grimasen 0,32, så det halva locket såg ut som vilan, och ögat gick rakt till stängt. **Rättningen:** vilolocket är nu 0,2 för belåten och 0,16 för grimasen, och clipKit är orört. Varje blink går öppet, halvt, halvt, stängt, stängt, halvt, halvt, öppet. Bladet `punkt7-blinkning-rutor-14-22.jpg` visar rutorna 14–22. |
| 8 | Bithastigheten | Huvudfilen är 13,1 Mbit/s, kodad med CRF 4. De platta teckningarna gav bara 2,6 Mbit/s vid CRF 16, så jag valde den CRF som ger 12–16. Krokklippen är 14,9 och 15,3 Mbit/s (CRF 6 och 7). Telefonkopian är fortfarande CRF 23. Flimret är mätt på den nya filen (se Kontroller). |
| 9 | Tidningens rubrik | Den svarta randen är ersatt med tjocka krumelurer, både på bordet och i hans händer. Bladet heter `punkt9-…`. |

## Undantag (godkända av dig och automatiseringssessionen)

- **BILD 7 PÅ 25 % AV HÖJDEN, UNDANTAG.** Bedragaren och två sittande handlare, eftersom rösten säger "dealers" i plural. Med 40 px mellan alla tre får de inte plats större. Bilden är 1,5 s lång.
  - **Handlingarna:** han lyfter sigillbrevet mot dem (0,1 s), och de rycker till upprätt med huvudet upp och bryna högt (0,6 och 0,75 s).
  - **I 360 px:** se `bild-7-i-360px.jpg`.
  - **Två ändringar efter att du godkände 26 %:**
    - Bedragarens mössa nuddade den första handlarens mössa, eftersom han inte var med i min kontroll. Nu är han med, och alla tre har minst 41 px mellan sig.
    - Han står mer vänd mot dem (48°, fortfarande tre kvart) och är därför smalare.
- **Tvåbilderna 10, 11, 15 och 16 på 37–40 %:** godkänt. 40 px mellan figurerna går före 45 %.
- **Pekbilden 8 på 53 %:** godkänt.
- **Gångbilderna 13 och 17 på 31 %. DETTA ÄR NYTT OCH INTE GODKÄNT ÄN.**
  - Vid 60 % flyttade sig en gående figur 23 px per ruta, och däcket under kameran i bild 17 lika mycket. Det är över gränsen på 12 px, och flimmermåttet fällde båda.
  - Gången på 31 % är v10:s, som klarade måttet. Kameran står still i båda bilderna, och han går genom bilden.
  - **Bild 17 tittar inte bakåt med huvudet.** När huvudet vände sig bytte det ritning och flimrade, så han tittar bakåt med ögonen och flinar medan han går.

## Bild för bild

Tiderna gäller filmen i sekunder, och filmen börjar med öppning (c). Varje kroppshandling har sin starttid i filmen. Kolumnen "längst utan" är den längsta tiden i bilden utan en ny kroppshandling, räknat från bildens start, mellan handlingarnas starter och fram till klippet. Höjden är den minsta figurens höjd enligt kroppskontrollen.

| # | Tid | Replik | I fokus, ansikte | Kroppshandlingar (start, s) | Höjd | Längst utan (s) | Utan figur (s) |
|---|---|---|---|---|---|---|---|
| 2 | 0–2,17 | This man sold the Eiffel Tower. | bedragaren, belåten → förtjust | lyfter SOLD-papperet mot oss (04) **0,00**, lutar sig belåtet bakåt 1,05 | 60 % | 1,1 | 0 |
| 1 | 2,17–3,67 | It was never his. | bedragarens hand | stämpeln lyfts 2,27 och lyfts av uppåt-höger 2,67, och SOLD syns | (bara handen) | 1,0 | 1,50 (handen) |
| 3 | 3,67–5,23 | A newspaper said… | bedragaren, belåten → förtjust | sänker tidningen 40 px (04) 3,87, lutar sig bakåt 3,97 | 76 % | 1,3 | 0 |
| 4 | 5,23–6,68 | …cost too much to fix. | ingen (tidningens bild) | (rostiga tornet i närbild) | – | – | 1,45 |
| 5 | 6,68–8,23 | He was a con man. | bedragaren, belåten → förtjust | vänder sig mot oss (03, 56° → 30°) 6,78, lutar sig bakåt 7,68 | 75 % | 0,9 | 0 |
| 6 | 8,23–10,23 | He pretended to be a government official. | bedragaren, belåten → förtjust | lyfter sigillbrevet (04) 8,38, bockar som en ämbetsman 9,18, rätar på sig 9,73 | 62 % | 0,8 | 0 |
| 7 | 10,23–11,73 | He told scrap dealers… | bedragaren (belåten → förtjust) och två handlare (lugn och förtjust → förvånade) | **UNDANTAG 25 %.** Lyfter brevet mot dem (04) 10,33; handlarna rycker till (06) 10,83 och 10,98 | 25 % | 0,8 | 0 |
| 8 | 11,73–13,23 | …to bid for the tower's iron. | bedragaren, belåten | armen upp (05) 11,93, fingret ut 12,35, armen ned 12,71 | 53 % | 0,5 | 0 |
| 9 | 13,23–14,73 | Do you deliver? (Daniel) | den unga handlaren, förtjust | lyfter budet sittande (04/07) 13,33, säger repliken med läppsynk | 73 % | 1,4 | 0 |
| 10 | 14,73–16,23 | One dealer won. | vinnaren (förtjust) och förloraren (lugn → grimas) | vinnaren lyfter budet 14,88; förloraren rycker till (06) 15,33 och lutar sig fram 15,78 | 37 % | 0,5 | 0 |
| 11 | 16,23–17,83 | The dealer paid for the tower. | handlaren (förtjust) och bedragaren (belåten → förtjust) | handlaren lutar sig fram och håller fram checken (04) 16,38; bedragaren rycker till med ett flin (06) 16,93 och lutar sig mot checken 17,38 | 39 % | 0,6 | 0 |
| 12 | 17,83–19,73 | The con man got a bribe too. | bedragaren, belåten → förtjust | lyfter mutans kuvert (04) 18,03, lutar sig belåtet bakåt 18,93 | 76 % | 0,9 | 0 |
| 13 | 19,73–21,53 | Then he vanished with the money. | bedragaren, belåten | går ut ur bilden (02) 19,73–21,0 förbi dörröppningen, med kuvertet i bröstfickan | 31 % (ny) | 0 (går hela tiden) | cirka 0,4 i slutet |
| 14 | 21,53–24,13 | The dealer was too embarrassed… | den unga handlaren, hård grimas med hopknipna ögon → grimas | sänker brevet med baksidan ut (04) 21,78, vänder bort kroppen (03) 22,48, sjunker ihop 23,43 | 76 % | 1,0 | 0 |
| 15 | 24,13–26,33 | Later, the con man tried again. | bedragaren (belåten → förtjust) och den grå handlaren (lugn → grimas) | bedragaren lutar sig fram mot honom 24,28; den grå lyfter brevet för att läsa (04) 24,83 och rycker till av tvivel (06) 25,58; bedragaren rätar på sig 25,88 | 40 % | 0,8 | 0 |
| 16 | 26,33–28,73 | This time, another dealer told the police. | den grå handlaren (lugn → allvarlig) och polisen (lugn → chock med öppen mun) | den grå lyfter brevet (04) 26,53; polisen rycker tillbaka (06) 27,43; den grå lutar sig fram mot polisen 27,93 | 40 % | 0,9 | 0 |
| 17 | 28,73–30,73 | The con man fled to America. | bedragaren, belåten → förtjust | går längs relingen (02) hela bilden; tittar bakåt med ögonen 29,63 | 31 % (ny) | 0 (går hela tiden) | 0 |
| 18 | 30,73–32,43 | Or so, the story goes. | bedragaren, belåten → förtjust | lyfter SOLD-papperet (04) 30,88, lutar sig belåtet bakåt 31,68 | 76 % | 0,8 | 0 |
| 2 (loop) | 32,43–33,16 | Any offers? | bedragaren, belåten | bild 2:s uppställning före ruta 1; i ruta 1 börjar lyftet | 60 % | 0,7 | 0 |

**Summan:**
- **En figur i fokus:** 33,16 − 1,50 − 1,45 − 0,4 = 29,8 s, alltså **cirka 90 %**. Utan figur är stämpelns närbild (där bara handen syns), tidningens bild och slutet av bild 13.
- **Den längsta tiden utan en ny kroppshandling:** 1,4 s (bild 9, där läppsynken pågår under tiden).
- **Bara rösten:** högst 1,5 s åt gången.

## Kontroller (på v11)

- **Kroppskontrollen** (`scripts/clip_check.mjs eiffel`): OK för alla 19 bilder.
- **Eiffeltornets kontroller** (`scripts/eiffel_check.mjs`): OK.
  - Bredvid varandra ligger minst 41 px mellan figurernas lådor i bild 7, 10, 11, 15 och 16 (det nya testet).
  - Stämpeln rör sig högst 10,7 px per ruta.
  - Texten står 3,03 s, och loopen möts.
  - Inga låga ljud och inga fotsteg.
- **Flimmer** (`film-v11/flimmer-v11-med-klippen.txt`): **0 fällda rutor inne i filmen** (största 1 928 px av högst 2 000).
  - Den körningen har fått veta var klippen ligger (`regions-shots.jsonl`, från tidslinjen), så som verktyget är byggt för.
  - Utan klippen (`flimmer-v11.txt`) fälls bara ruta 921. Det är den sista rutan i bild 17 före klippet till bild 18. Rutan före (920) och efter (922) har samma kvällshimmel upptill, så de liknar varandra över klippet.
- **Flimmer i krokklippen:** 952 px i (d) och 1 136 px i (b), alltså 0 fällda rutor.
- **Ingång** (`ingangskontroller-v11.txt`):
  - ljud i ruta 1 (toppen 0,38);
  - texten THIS MAN SOLD THE / EIFFEL TOWER har 6 ord och står i 3,0 s, alltså 1,5 s per rad;
  - bilderna i sekund 0–10 är 1,4–2,2 s långa;
  - loopen ändrar 2,0 % av bilden.
- **ElevenLabs-räknaren** (`film-v11/elevenlabs-raknaren.txt`): 3 589 av 40 000, oförändrad. Inga nya anrop.
- **Det frysta utseendet:** `git diff ad1a161` ger 0 rader.
- **En oberoende granskare** granskar v11 (ett nytt agentfönster utan mina slutsatser). Svaret skickas separat.

## Att ta ställning till

1. **Gångbilderna 13 och 17 på 31 %** (se Undantag). Det är det enda storleksundantaget som du inte har godkänt.
2. **Belåtens vilolock är 0,2 i stället för 0,55** (punkt 7). Blicken är lite mindre sömnig. Leendet i mungipan och bryna bär fortfarande den belåtna minen.
3. **Förtjust har fortfarande leende 0,3**, med stängd mun, sedan v6.

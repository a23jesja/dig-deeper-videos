# STOPP: bildtyperna i platt 2D, 03 vända sig v8 (22 november 2026)

Detta är en extra omgång för 03 efter Jespers val b ("Då kör vi på b"). Den andra vändningen är den första, rena vändningen baklänges: han vänder från framifrån tillbaka till profil åt höger på samma 1,3 s, och klippet slutar i profil åt höger.

Bara 03 är renderad. 01, 02 och 04–08 är godkända och oförändrade. Inga äldre filer är ändrade.

## Filer (leverans/bildtyper-2d/)

- Klippet är 1080×1920 i 30 fps.
- Jag renderade det själv under mem_guard: dubbel storlek med CRF 10, ner med lanczos till CRF 16 och aq-mode 3. Telefonkopian har CRF 23.
- Efteråt fanns 0 processer kvar.
- md5 står i `md5-v8.txt`, och `md5sum -c` stämmer.

| Fil | Rutor | Storlek | md5 | Telefon | md5 |
|---|---|---|---|---|---|
| 03-vanda-sig-v8.mp4 | 138 | 1 339 271 B | 484b09eaa9e8dce070d8abbe713e9969 | 584 548 B | b5c9fffb5be55023f12af65b54c809a8 |

**Ljud:** tyst (−91 dB). Inga ElevenLabs-anrop är gjorda.

**De godkända klippen är oförändrade.** Jag renderade 01, 02, 04, 05, 06, 07 och 08 med v8-koden och jämförde ruta för ruta med de godkända filerna (01 v6, 02 v5, 04 v4, 05 v7, 06 v7, 07 v5, 08 v4). 0 pixlar skiljer, och den största skillnaden i någon pixel är 0 (`v8/jamforelse-godkanda-v8-kod.txt`).

## Vad som är ändrat

Bara 03:s egen kod i `clips.ts`. Ritningen i `flat.ts` är densamma som i v7.

- Den andra vändningen går +90° på 1,3 s, i stället för −52° på 1,0 s.
- Blicken åt vänster före den andra vändningen är borttagen.
- Huvudet går till [8, 3, 0] under vändningens sista 0,4 s. Det är spegelbilden av hur det lämnar [8, 3, 0] i början av den första.

Ruta f i den första vändningen och ruta 132 − f i den andra står i exakt samma kroppsvinkel.

## Den andra vändningen mot den första

**Modellen** (`v8/vandningarna-modell-v8.txt`, skriptet `engine/scripts/turn_mirror_model.mjs`), par för par från 16/116 till 60/72:

- **Kroppsvinkeln** (|sin|), som armens svep styrs av, är identisk i varje par.
- **Svepet** gäller samma rutor: 34–48 i den första och 98–84 i den andra.
- **Den bortre armens form** (handled och armbåge räknat från axeln) skiljer högst 2 px.
- **Steget där ärmen möter rockens kant** är lika stort eller mindre i den andra vändningen:

  | Par | Första | Andra |
  |---|---|---|
  | 40/92 | 5 | 0 |
  | 41/91 | 11 | 7 |
  | 42/90 | 18 | 14 |
  | 43/89 | 11 | 11 |
  | 44/88 | 5 | 5 |

  Siffrorna är enheter tvärs över armen. I övriga par är steget 0.

**Pixlarna** (`v8/vandningarna-pixlar-v8.txt`, skriptet `engine/scripts/turn_mirror_cmp.py`), i rutan för bål, armar, klocka och kedja:

- Paren är inte pixellika: 13 000–45 000 px skiljer, även efter bästa sidoförskjutning. Figuren står 2–14 px förskjuten mellan vändningarna.
- Två orsaker:
  - överkroppens vridning leder vändningen åt båda hållen, och baklänges blir ett försprång en eftersläpning (ansiktet står cirka 4° lägre);
  - tyngden sätter sig under stoppet framifrån.
- Fötterna tar sina vridsteg i omvänd ordning, så benen skiljer också.
- Ritningarna är ändå desamma steg för steg. Det syns i parbilderna:
  - `v8/03-forsta-och-andra-vandningen-par-ruta-33-45.jpg`: bål, klocka och kedja, första vändningen överst och den andra under;
  - `v8/03-forsta-och-andra-vandningen-par-ruta-34-48-armen.jpg`: underarmen, handen och rockkanten.

**Jag har själv gått igenom vändningen ruta för ruta i full storlek** (`v8/03-andra-vandningen-ruta-84-101.jpg`):

- **Inga dubbla konturer och inget steg i axeln:** felen 1 och 2 från v7 fanns där svepet gick över klockan och kedjan. Det gör det inte längre.
- **En hel guldklocka:** klockan och kedjan står i varje ruta som i den första vändningen.
- **Haken vid manschetten från v7 (cirka 14×16 px) är borta.**
- **Små steg som finns kvar** där rockens kant möter ärmen, i båda vändningarna lika:
  - i ruta 89–91 i den andra och 43–41 i den första;
  - cirka 17 px breda och 10–15 px höga i full storlek;
  - de syns sida vid sida i `v8/03-andra-vandningen-zoom-ruta-88-95.png` och `v8/03-forsta-vandningen-zoom-ruta-44-37.png` (förstorade 2 gånger).
- **Ärmen som smal kil:** i 93–100 syns ärmen som en smal kil bakom rocken, precis som i 39–32 i den första vändningen. Det är armen bakom kroppen i tre-kvart.
- **Riktningsbytet:** han står framifrån från ruta 56 till 76, och den andra vändningen börjar från vila. Inget hopp.
- **Slutet:** profilen står still från ruta 116 till 137 med andning och blinkningar, utan att poppa. Bild: `v8/03-vandningsbytet-och-slutet-ruta-0-137.png`.

## Bakgrundsflisan vid pipskaftet (ruta 16–23)

Inte rättad.

- Flisan är riktig bakgrund mellan pipskaftet och mustaschen, utanför huvudets kontur, och den ändras med huvudets vridning.
- Den ritas av profilens pipa och mustasch. En ändring där ändrar också 02, 07 och 08, som visar profil, och då skulle de inte längre vara 0 pixlar lika.
- Jag föreslår att den rättas i riggen före Alcatraz, tillsammans med fogen i pipans skål.

## Kontroller (utskrifterna i granskning/bildtyper-2d/v8/)

**Kroppskontrollen** (`clip-check-v8.txt`):
- alla åtta CLIP CHECK OK;
- 03: vyerna går profil höger 0–32, tre-kvart 33–42, framifrån 43–90, tre-kvart 91–100 och profil höger 101–137.

**flat_check, flat_views och face_order:** OK (`flat-och-ansikte-v8.txt`).

**Planterade fel:** 39 av 39 fälls (`planterade-fel-v8.txt`), bland dem `cuff-notch` i 03 (2 rutor) och 03:s egna fel för fötter och skor.

**Flimmermåttet** (`flimmer-v8.txt`):
- det fäller 03 i 13 rutor, som tidigare, eftersom figuren rör sig mer än måttets 12 px per ruta;
- sorterat efter plats (`flimmer-efter-plats-v8.txt`) återstår bara vybytena, och de speglar varandra: 32, 33, 42 och 43 i den första vändningen och 90, 100 och 101 i den andra;
- planterat tomt öga i 03, ruta 21: fälls med 35 433 px i ögat (`flimmer-planterad-c03.txt`).

**Bytes-kontrollen** (`part-diff-v8.txt`): 03 OK, för första gången. I v7 fälldes armen i 88–95.
- Planterad fläck i ruta 125, där han står still i profil: fälls (`part-diff-planterad-c03-ruta125.txt`).
- Samma fläck i ruta 90 fälls inte (`part-diff-planterad-c03-ruta90.txt`). Där rör sig armens leder mer än 4 px, och kontrollen bedömer bara delar som står nästan stilla.

## Bilder (granskning/bildtyper-2d/)

- `03-vanda-sig-v8-blad.jpg` och `03-vanda-sig-v8-ruta-40.png`, `-92.png` och `-125.png`.
- I `v8/`: alla bilder som nämns ovan.

# STOPP 1b: Alcatraz 1962, rättningar efter granskningen av STOPP 1 (22 november 2026)

- **Utkast:** `utkast-1c.mp4` (ligger i engine/out/craft/alcatraz/; samma bilder och rutor som filen här). Rutnummer räknas från 1 i 30 fps.
- **Före och efter:** varje punkt har ett blad i `fore-efter/`. Övre raden är utkast 1, md5 4cb53077, som du granskade. Nedre raden är utkast 1c, på samma rutor.
- **Andra filer i mappen:** `utkast-1b.mp4` och bladen p1–p12 är ett mellansteg före den oberoende granskarens punkter och kan hoppas över. Att två mappar finns beror på att jag inte raderar något i granskning/.

## Nya kontroller med planterade fel (alla fälls)

`node scripts/clip_check.mjs alcatraz` läser nu vad varje bildruta ritar: ärmar, filtar, galler och ben, saker som kommer in, och tryck. Resultat utan planterade fel: alla 17 bilderna OK.

| Fel | Planterat (CLIP_PLANT) | Fälls i |
|---|---|---|
| (a) en arm som slutar inne i bilden | `arm-short` (ärmen 260 i stället för att gå ut genom kanten) | bild 4, 5, 6, 7, 8 och 13 |
| (b) en sak genom en annan: filten genom sängbrädan | `cloth-through` (filten hänger 220 ner) | bild 1, 3, 7, 13 och 17 |
| filten under sängkanten | `cloth-drop` | bild 1, 3, 7, 13 och 17 |
| (c) en sak som poppar in utan hand | `pop-in` (regnrockarna på plats utan hand) | bild 6 |
| (d) en pose eller ett ansikte som hoppar på en ruta | `pose-snap` (vaktens rädsla på 0,03 s) | bild 14, 14 rutor |
| (e) text eller tryck som visas spegelvänt | `mirror-print` | bild 16 |
| (f) ett galler eller ben som slutar i luften | `short-bars` (gallret 120 px för kort) | bild 14* |

\* I bild 1 och 17 går gallret ut genom bildens nederkant, så ett kortare galler syns inte där. Regeln gäller bara det som syns i bilden.

**Ljudet i ruta 1 (punkt 30):** du har rätt. Remotions mp4 är tyst de första 41 ms, mätt i mp4:an. I leveransen läggs ljudet därför in direkt från wav-filen med ffmpeg. Mätt i den mp4:an ligger första provet på 0,000 s och toppen i ruta 1 är 0,36. Kontrollen i STOPP 2 görs på den färdiga mp4:an.

## Punkt för punkt

| # | Punkt | Rättning | Rutor (blad) |
|---|---|---|---|
| 1 | underarmar som svävar | Varje arm utan kropp går ut genom bildkanten, regel (a). | 201–701 (p01) |
| 2 | filten vid soluppgången | Filten viks undan längs sängen och ligger kvar på den. Fingrarna är framför kanten och tummen bakom. Under filten syns en ihoprullad skjorta där kroppen borde vara. | 685–715 (p02) |
| 3 | taket | Tre hela män med luft mellan sig, hukande, med fötterna på taket och synliga ansikten i månljus. Kameran följer gruppen, och strålkastarens svep syns tydligt och missar dem. **Bilden är en vidbild där männen fyller 30 % av höjden** (se nedan). | 509–551 (p03, p23) |
| 4 | röret | Varje skugga håller i röret med båda händerna och klättrar ner hand under hand. | 557–596 (p04, p24) |
| 5 | flotten | Tre män sitter i flotten. Huvuden, mössor och ögon syns tydligt i månljuset. | 603–646 (p05) |
| 6 | kroken i ruta 1 | Huvudet och kudden fyller bilden: huvudet tar cirka 55 % av bredden. Handen med ficklampan syns nere till höger. Ljuset rör sig från ruta 1 och är på huvudet inom 0,3 s. Käglan tonar ut och slutar i en mjuk ljusfläck. | 1–28 (p06) |
| 7 | texten över mössmärket | Ögonen ligger lägre i bilden, och märket hamnar under texten. | 57–97 (p07) |
| 8 | kartan | Ön har fängelse och fyr, vattnet har vågor och staden har hus med fönster. Etiketterna ALCATRAZ och SAN FRANCISCO är stora. Handen flyttar en pappersbåt från ön mot staden, och den lämnar ett prickat spår. | 191–246 (p08, p26) |
| 9 | regnrockarna | Rockarna har krage, ärmar och knappar. Var och en bärs in från nederkanten av en hand och läggs ner, och flottens kant sluter sig runt dem. | 363–426 (p09) |
| 10 | affischen över bukten | Den börjar liten vid staden och växer när vinden bär den mot oss. Vänd visar den sin tomma baksida. | 826–883 (p10-p20) |
| 11 | den vänstra affischen | Alla tre ligger inne i bilden. | 768–819 (p11-p19) |
| 12 | rörelse i varje bild | Bild 1: ljuset sveper och kameran glider in. Bild 2: kameran trycker in mot ögonen. Bild 3: snabbare åk och ficklampans ljus över sängarna. Bild 5: gallret lossnar och dras ut. | p12 |
| 13 | gallret i luften | Gallret står på golvet och går upp förbi bildens överkant, regel (f). | p13 |
| 14 | sängen utan ben | Sängarna har ben ner till golvet, eller ut genom nederkanten. | p14 |
| 15 | rockarna poppar in | Se 9, regel (c). | p09 |
| 16 | en tredje arm och filten genom brädan | Handen som drar filten kommer ner från överkanten. Filten ligger på sängen, regel (b). | 434–453 (p16-p29) |
| 17 | armen vid luckan | Armen går ut genom nederkanten. Fingrarna ligger över luckans kant hela tiden. | 485–505 (p17) |
| 18 | vakten hoppar | Rädslan kommer under 0,4 s, och händerna byter inte form, regel (d). | 725–736 (p18) |
| 19 | affischen glider in själv | Den kommer in utifrån tillsammans med handen. | p11-p19 |
| 20 | spegelvänd affisch | Baksidan visas, och affischen växer med avståndet, regel (e). | p10-p20 |
| 21 | flotten i klippan | Flotten börjar i vattnet till höger om klipporna. | 599–617 (p21) |
| 22 | ljuset i bild 12 | Strålkastaren sveper mjukt över vattnet bakom huvudet. Ansiktet och pupillerna lämnas orörda. Det är fångens Look (blå skjorta och mörk mössa). | 651–669 (p22) |
| 23 | taket: klossarna och kilen | Klossarna är borta. Ljusstrålen kommer från en lampa vid bildens vänstra kant och tonar ut. | 514–552 (p23) |
| 24 | teglet flimrar, skuggorna glider | Kameran åker hälften så fort (högst cirka 10 px per ruta), och teglet har lägre kontrast. Lemmarna rör sig. | p24 |
| 25 | verktyget skrapar golvet | Spetsen arbetar längs gallrets nederkant, och dammet faller från spetsen. | 263–331 (p25) |
| 26 | kartan: stump, spår och ljus | Armen går ut genom kanten, båten lämnar ett spår, och ljuset är borttaget. | p26 |
| 27 | lampan och den klonade fången | Varje cell har ett eget huvud med egen hårfärg. Lampans sken ligger på lampan. | p27 |
| 28 | ficklampan genom handleden | Ficklampans bakre del ligger bakom ärmen och handflatan, huvudet framför handflatan och fingrarna runt. | p28 |
| 29 | händerna över dockans ögon | Händerna håller huvudet lågt vid sidorna, vid käken. | p16-p29 |

## Förenklat, och varför

- **Bild 9 (taket)** är en vidbild. Tre hela män med luft mellan sig ryms bara på cirka 30 % av höjden i 9:16, eftersom tre huvuden bredvid varandra är bredare än bilden vid 50 %.
  - `clip_check` har därför fått bildtypen "wide" med kravet 30 %, bara för den här bilden. Kameran följer gruppen.
  - DAILY-RULES säger 50–80 %. **Det här är en avvikelse som du måste godkänna.**
  - Annars får bilden bli närmare och visa två män och en på väg in.
- **Bild 14 (vakten)** behåller händerna som de är under rädslan, i stället för att öppna dem till handflator. Den rörelse som syns är ansiktet, ryggen och armarna.
- **Bild 4 (kartan)** har inget ljus längre.
- Inga bilder är bortskurna. Filmen är fortfarande 32,0 s.

## Kontroller

- clip_check på alla 17 bilderna: OK. Alla planterade fel ovan fälls.
- Biblioteket (de åtta bildtyperna) är oförändrat: 0 pixlar skiljer (`granskning/alcatraz/stopp2/bildtyperna-oforandrade.txt`). Ritningen i flat.ts är inte ändrad sedan dess.
- Den oberoende granskarens mapp `granskning/alcatraz/stopp1-granskare/` ingår i den här commiten.

Nästa steg efter ditt svar: den slutliga renderingen i dubbel storlek och STOPP 2.

# Steg 1 efter bildbibliotekets omgång 2 (20 november): huvudbladet, riggfelen och de lagade testerna

Underlag: `granskning/kvalitetsport/bildbibliotek/granskning-omgang-2.md`, punkterna 1–5 och "Tester som missade". Bilderna ligger i den här mappen.
- Riggen och huvudbladet finns i commit bcbc154.
- Den sista pipritningen och testerna finns i commiten efter den.

## 1. Huvudbladet: `huvudbladet-var-10-grad-sparrade-vinklar.jpg`

- **Vad bladet visar:** Sir var 10:e grad hela varvet runt, 0–350 grader från linsen. De tre övre raderna har stängd mun, de tre nedre pratande mun.
- **Hur det är gjort:** varje huvud är en egen bild i filmen `head-sheet`, så att spegelvändningen bestäms som i en riktig film. Kommandot är `bash scripts/head_sheet.sh <ut.jpg>`.
- **Hur markeringarna sätts:** de kommer från rörelsetestet, inte för hand. Skriptet kör `film_info head-sheet motion` och markerar varje vinkel som testet stoppar.
  - **SPÄRRAD (rött), 100–260 grader:** huvudet är ritat mer än 60 grader från linsen, alltså ren profil eller bakifrån. Testet `barred` (motionCheck.ts) stoppar varje sådan ruta. Undantaget är en figur som bilden uttryckligen visar gå bort från oss (`Shot.away`, med skäl).
  - **BARA I VRIDNING (orange), 70–80 och 280–290 grader:** här sitter pipan på ansiktets bortre sida och tonas ut när huvudet vrids förbi. Om huvudet hålls i den vinkeln i 4 rutor eller mer stoppar testet `pipefade` det: en halvgenomskinlig pipa får bara synas medan huvudet vrids igenom.
- **Konsekvens för film:** en figur som står eller går i profil vrider huvudet mot oss, inom 60 grader. Klipp 02 byggs om så.
- **Pipan, ny ritning:** skaftet böjer ner från läpparna och upp i pipans huvud. Pipans huvud är runt i botten, har en mörk öppning upptill och en ljusreflex. Pipan ritas efter mustaschen, så att mustaschen inte döljer skaftet. Skaftet är minst ett halvt huvud brett i bild.

## 2. Riggfelen 2–5, före (e69306a) och efter, utsnitt i full storlek

| Bild | Fel | Rättelse (fil) |
|---|---|---|
| R1-pipan-tre-kvart-03-ruta-90.jpg | pipan som en tand eller kloss under mustaschen | ny pipa, ritad efter mustaschen (cast.ts) |
| R2-pipan-nastan-profil-05-ruta-60.jpg | pipans huvud svävar utanför ansiktet | pipan på bortre sidan tonas ut nära profil (cast.ts) |
| R3-vilohanden-01-ruta-87.jpg | vilohanden visar handflatan mot linsen med utspärrade fingrar | en hängande hand i vila ritas från sidan, med handflatan mot låret och fingrarna lätt böjda (ink.ts) |
| R4a-gra-hand-06-ruta-110.jpg, R4b-navarna-04-ruta-60.jpg | grå händer i skugga | ljuset på figurkortet räknas nära kortets mittlinje och med höjden hoptryckt, så att hela figuren får nästan samma ljus som under en lampa. Sidoskuggan är begränsad (kit.ts) |
| R5a-munnen-01-ruta-87.jpg | öppningen går ända fram till skaftet | öppningen är hälften så bred och slutar en tredjedels mun före skaftet (cast.ts) |
| R5b-grimasen-06-ruta-90.jpg | gallret | en linje mellan tandraderna i stället för fyra lodräta (cast.ts) |
| R5c-kaken-08-ruta-45.jpg | käken sticker ut | käkbiten är huvudets egen kontur där bara hakan sänks (cast.ts) |
| — (02, ruta 79–80) | huvudet ritas om | går inte längre att rita: vinkeln är SPÄRRAD, se punkt 1 |

Ljusändringen gäller alla figurkort. Ansiktet blir lite jämnare och ljusare än i hyttljuset v5, vilket syns i R5c. Säg till om det ska justeras.

## 3. De lagade testerna mot de rutor i e69306a som de missade

Varje test körs mot bildbibliotekets egen kod från e69306a (shotLibrary.ts är oförändrad sedan bf9ad61). Hela utskriften finns i `motion-shot-library-e69306a.txt` (12 fel).

| Granskningens miss | Varför testet missade | Lagat test | Utskrift | Bild |
|---|---|---|---|---|
| 02, ruta 79–80: huvudet ritas om, sedan ren profil | Ritad vridning hoppade bara 56→63 grader. Det låg under gränsen på 12 grader, men vid 60 grader byts detaljer | `barred`: ritat mer än 60 grader från linsen | walk-across 200–239 (klipp 80–119): "head is drawn 63 degrees turned from the lens … an angle the rig must not draw" | T1 |
| 08, ruta 45: handen i luften | Inget test fanns för en hand som inte vilar på något | `float`: hand stilla i 0,7 s, öppen, håller inget. Sittande: mer än 8 cm från låren och ovanför sitsen. Stående: underarmen hänger från en utstickande armbåge | sit 884–920 (klipp 44–80): "right hand rests on nothing … 15 cm off his thighs, above the seat" | T2 |
| 07, 0–1,3 s: rak arm, tittar inte på den | T-pose-testet gäller bara en armbåge låst över en halv sekund. Rörelsetestet såg inte blicken | `stiff`: armen böjd mindre än 40 grader, 40–140 grader upp från hängande och stilla en halv sekund, medan pupillerna inte ligger mot handen | open-a-door 720–749 (klipp 0–29): "right arm is held straight out … while he does not look at his hand" | T3 |
| 04, ruta 15–16: boken rycker 4 grader | Pose-hoppet gällde bara leder, inte saker | `jerk` för saker i handen: vridningen per ruta ändras mer än 2,5 grader, eller steget mer än 2,5 cm | hold-with-both-hands 376–377 (klipp 16–17): "the chest in the hand jerks: its turn changes by 5.5 degrees in one frame" ("chest" är bokens rekvisitanamn) | T4 |
| 06, ruta 33–34: hela figuren rycks | Hoppet var under hoppgränsen. Felet är att rörelsen börjar med full fart | `jerk` för kroppen: bäcken, nacke och huvud. Hastigheten ändras mer än 2,5 % av höjden på en ruta, eller mer än 0,35 % från eller till stillastående. För händerna gäller 10 % och 1,2 %. En gångs gungning står aldrig still, så den går igenom | react 634 (klipp 34): "body jerks: his neck's movement changes by 0.4 % … from a standstill" | T5 |
| 03 och 05: blicken rakt ut fast målet ligger lågt | Test 7 prövade bara sidled | `gazeY`: målet ligger 15 grader eller mer över eller under ögonen, men pupillerna är inte sänkta eller höjda mot det | turn-and-look 309–359 (klipp 69–119): "31 degrees below his eyes". Point 504–599 (klipp 24–119): "30 degrees below" | T6a, T6b |

Testerna hittar också fel som granskningen inte listade, i klipp som ändå byggs om:
- **01:** den vänstra armen står rak ut en halv sekund (0,57–1,23 s), och händerna startar och stannar utan mjuk in- och utgång (0,37–3,27 s).
- **04:** den vänstra handen rycker på samma ruta som boken.
- **02 och 05:** pipan står halvgenomskinlig, eftersom huvudet hålls där den tonas ut.

## 4. Planterade fel i proof-faults, fall Y–AF

Kommandot är `film_info proof-faults motion`, med 32 fel. Hela utskriften finns i `motion-proof-faults.txt`.

| Fall | Fel med flit | Stoppas av | Bild |
|---|---|---|---|
| Y | står vriden 100 grader, huvudet i profil | barred: "drawn 83 degrees" | Y-huvudet-i-ren-profil.jpg |
| Z | sitter, höger hand öppen bredvid höften, 15 cm ovanför sitsen (armen i 08) | float | Z-handen-i-luften.jpg |
| AA | armen rak ut åt sidan, ögonen i linsen | stiff (och kroppskontrollens låsta armbåge) | AA-armen-ut-blicken-i-linsen.jpg |
| AB | träsvärdet vrids 5 grader i handen på en ruta | jerk för saker: "turn changes by 5.0 degrees" | AB-svardet-rycker-i-handen.jpg |
| AC | båda händerna upp och kroppen bakåt med full fart från stillastående, rak blandning på 0,4 s som i 06 | jerk: fångas där rörelsen tvärstannar, 2,1 % | AC-start-utan-mjuk-ingang.jpg |
| AD | ska titta på en låda på golvet framför sig, men tittar rakt ut | gazeY: "51 degrees below his eyes" | AD-tittar-rakt-ut-inte-ner.jpg |
| AE | står vriden 70 grader, pipan halvt uttonad | pipefade | AE-pipan-halvt-genomskinlig.jpg |
| AF, kontroll | samma arm som AA, men blicken på handen | inget fel | AF-kontroll-armen-ut-tittar-pa-handen.jpg |

Kontrollerna klarar fortfarande alla tester:
- **Fall E, H, L, N, O, P och AF:** klarar rörelse-, kropps- och grepptestet.
- **N och O, sittande i profil:** sanna 90 grader ritas som 56, så de spärras inte.
- **Grepptestet:** stoppar samma planterade fel som förut, J, V, W och X. AC är markerat som ny scen, så svärdet från AB följer inte med.
- **Kroppstestet:** stoppar A, B, C, D, F, G, K, M, W och AA.

Fall A–X stoppas som förut. B fångas nu också av `stiff`, och S av `jerk`.

## Vad som inte är gjort

- Klippen i omgång 3 är inte byggda. Det blir steg 2 när du har godkänt detta.
- Ingen oberoende granskare har sett bladet ännu. Klippen i steg 2 går till både dig och en oberoende granskare.

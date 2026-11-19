# Beviset, omgång 4 (20 november): riggfelen A–D och de åtta nya testerna

Granskningen av bildbiblioteket, omgång 1 (`granskning/kvalitetsport/bildbibliotek/granskning-omgang-1.md`), krävde detta: först riggfelen A–D, sedan åtta nya tester, vart och ett med ett planterat fel som stoppas. Testerna skulle köras mot klippen i 577ef12.

## Riggfelen (cast.ts, commit 60a93d3)

- **A. Pipan som en tand.** Skaftet går nu ut åt sidan, 80 grader från rakt fram. Förut var vinkeln 43 grader, och då syntes skaftet från änden när huvudet var vridet så långt. Figurens huvud ritas aldrig mer än 56 grader vridet, så skaftet syns alltid från sidan.
- **B. Pipan i öppen mun.** Pipans mungipa förblir stängd runt skaftet och följer inte käken. Munnen öppnas på andra sidan och är smalare. En kort läpplinje går från öppningen till skaftet. Det gamla beteendet finns kvar som planterat fel (`pipeHold: false`), och ritningen märker det med `pipeOpen`.
- **C. Huvudet byter ritning på en ruta.** Jag mätte posen ruta för ruta (`film_info <film> pose`). Felet satt i mina klipp, inte i riggen: huvudet vreds 18–19 grader på en ruta (03: rutorna 263–264; 07: 792–793), eftersom vridningen blandades in på 0,1–0,25 s. Det rättas i klippen och fångas av test 4. Dessutom låses nu varje figurs spegelvändning för hela bilden (`film.ts castOf`), så att en figur som vänder sig förbi spegelvinkeln inte ritas om åt andra hållet mitt i bilden. Alla som läser en bilds rollista går genom den.
- **D. Monokeln.** Den ritas nu efter näsan och klipps till huvudets kontur.

Ansikten efter rättelsen, ur bildbiblioteket (01, 03, 05, 06, 07): pipan syns från sidan, munnen öppnas på andra sidan och mungipan vid pipan är stängd, och glaset ligger över näsan.

## De åtta testerna

Testerna finns i `src/craft/stage/motionCheck.ts`, som körs i `film_info <film> check` och ensamt med `motion`. Test 1 ligger i grips.ts och bodyCheck.ts.

| # | Test | Regel |
|---|---|---|
| 1 | Hand genom rörligt föremål | En dörr eller ett lock som hålls (`use` pull/push/open/shut/lift) ska ange sitt handtag (`grip`). Handflatan ska ligga högst 5 cm från handtaget i bilden. Hållarens arm och kropp prövas mot föremålet (`arm`), bara handen får ligga i det. |
| 2 | Sak som dyker upp eller försvinner | (a) En namngiven sak finns på en ruta och inte på nästa, eller tvärtom, utan att någon lägger dit den eller tar den (`down`, `landed`, `falling`, `vanish`). (b) "pop": en liten sak över en figurs arm ligger framför armen på en ruta och bakom den på nästa, eller tvärtom. |
| 3 | Pose-hopp | En led går iväg och kommer tillbaka på nästa ruta, alltså en pose som står i en ruta. Eller så hoppar leden längre på en ruta än en kropp rör sig: 6 % av höjden, för fot och knä 8,5 %, för hand 10 %. |
| 4 | Huvudbyte | Huvudets ritade vridning ändras mer än 12 grader på en ruta, eller så ändras spegelvändningen. |
| 5 | Skakning | Huvudet byter riktning minst 4 gånger på 10 rutor, mer än 1,5 px varje gång. |
| 6 | Pipan i öppen mun | Ritningen märker en pipa i öppen mun (`pipeOpen`). |
| 7 | Blicken mot målet | En bild som anger var någon tittar (`Shot.look`): huvudet får vara högst 25 grader fel. När målet ligger åt sidan i bild ska pupillerna ligga åt det hållet. |
| 8 | Kant | En figur, med det ritade huvudet och hatten, ska ha 20 px kvar till bildkanten eller vara helt utanför. Annars ska den vara på väg in eller ut, minst 2 px per ruta i sidled. Det prövas från första rutan. |

## Planterade fel i proof-faults (fall Q–X)

Alla stoppas: `film_info proof-faults motion`, `grips` och `body`.

| Fall | Fel som görs med flit | Utskrift |
|---|---|---|
| Q | armarna mot bröstet på en enda ruta (990) | "sir's wrL goes 256 px and comes back the next frame: a pose that stands for one frame" |
| R | huvudet vrids 40 grader på en ruta (1050) | "sir's head is drawn 40 degrees turned from one frame to the next" |
| S | kroppen lutar ±2 grader varannan ruta | "sir shakes: his head goes back and forth every frame or two (4 turns in ten frames)" |
| T | pipan som förut i vidöppen mun | "sir's pipe hangs in an open mouth" |
| U | bilden säger att han tittar bakåt vänster, men han tittar in i linsen | "sir looks 146 degrees away from what he looks at" och "sir's eyes do not turn toward what he looks at ... straight out, at the lens" |
| V | halva figuren utanför bild, stilla | "sir is cut by the picture's edge on the shot's first frame" |
| W | ett dörrblad genom underarmen, handen 20 cm från ringen | grips: "sir R's hand is 22 cm from the door's handle"; body: "sir's right forearm is inside the thing in sir R's hand, door ... 6 cm" |
| X | en lykta som är borta från ruta 1410 | "the lantern is there on one frame and gone on the next, with nobody taking it" |

## Testerna mot bildbiblioteket (klippen i 577ef12)

Klippens kod är densamma som i 577ef12, med tre tillägg för att testerna ska kunna köras:
- dörrens handtag och `arm` är angivna i klipp 07;
- titta-målet, fönstret, är angivet i 03 och 05;
- riggfelen A–D är rättade, så pipan i öppen mun visas med det planterade fallet T.

| Granskningens fel | Fångas av | Utskrift (bildbibliotekets rutor) |
|---|---|---|
| 02: kepsen skärs av vänsterkanten 0,0–0,5 s | 8 | walk-across 120–137: "cut by the picture's edge ... on the shot's first frame" |
| 03: huvudet hoppar, ruta 23–24 (C) | 4 | turn-and-look 263–264: "head is drawn 17 degrees turned from one frame to the next" |
| 03: ögonen in i kameran, inte mot fönstret | 7 | turn-and-look 289–359: "looks 111 degrees away from ... the stern window" |
| 05: armen från hängande till vågrät på 4 rutor | 3 | point 504–506: "tipR leaps 135 px in one frame (12 %)" |
| 05: pekar på väggen, tittar in i kameran | 7 | point 523–599: "looks 133 degrees away", "eyes ... straight out, at the lens" |
| 05: huvudet hoppar, ruta 22–23 | inte fångat | Huvudets pose ändras mindre än 1 grad på de rutorna (`film_info pose`). Det som hoppar där är armen, två rutor senare (se raden ovan). |
| 06: pose som står i en ruta (ruta 34–36) | 3 | react 635–636: hand och armbåge "leaps 280 / 440 px in one frame" |
| 06: skakar varannan ruta 1,45–3,7 s | 5 | react 650–714: "shakes ... 4 turns in ten frames" |
| 06 m.fl.: pipan i gapande mun (B) | 6 | rättat i riggen; visas med fall T |
| 07: dörrbladet genom underarmen 1,7–1,95 s | 1 | body: "right forearm is inside ... door", 25,57–26,13 s, alltså 1,57–2,13 s i klippet |
| 07: handen aldrig på handtaget | 1 | grips: "hand is 5–8 cm from the door's handle", hela draget |
| 07: handtaget dyker upp från ingenstans vid 1,63 s | 2 (pop) | open-a-door 771 (1,70 s): "a small thing over sir's arm goes from in front of it to behind it" |
| 07: huvudet hoppar vid 2,4 s | 4 | open-a-door 793: "18 degrees turned from one frame to the next" |

Granskningens övriga punkter rättas i klippen och prövas av mig för hand. De gäller inte de åtta testerna: stel arm i 01, hukande gång i 02, boken mot oss och grå nävar i 04, dörren öppnas bara på glänt, ljusstrimmor över kroppen.

## Bilder (helstorlek, omgang-4/)

| Fil | md5 |
|---|---|
| Q-ruta-989-fore.jpg | f9a714a64fa6f9104c025c14c542bb9f |
| Q-ruta-990-posen-en-ruta.jpg | 552b9366871ba1ddbf75637fdbecfed5 |
| Q-ruta-991-efter.jpg | f9a714a64fa6f9104c025c14c542bb9f |
| R-ruta-1049-fore.jpg | f9a714a64fa6f9104c025c14c542bb9f |
| R-ruta-1050-huvudet-vant.jpg | 10d89c18e1c00e9c38c3c8090f24b582 |
| S-ruta-1110.jpg | e53002b1731e8b3598fb3d27fbfc8d2e |
| S-ruta-1111.jpg | e53002b1731e8b3598fb3d27fbfc8d2e |
| S-ruta-1112.jpg | 94314fa59717e8cd096dead9f5e87089 |
| T-pipan-i-oppen-mun-ruta-1170.jpg | 0463ded02816572b566ed9575efcc19f |
| U-tittar-i-linsen-ruta-1230.jpg | f9a714a64fa6f9104c025c14c542bb9f |
| V-skuren-av-kanten-ruta-1290.jpg | 1416a239fc625fe3519ac96667ec907c |
| W-handen-genom-dorren-ruta-1350.jpg | 60dc2c1858a5415a0560272668375beb |
| X-ruta-1409-lyktan-finns.jpg | f0313194a20d85d0e38f480c9638a7e4 |
| X-ruta-1410-lyktan-borta.jpg | b890bcce55a43ab9e3bcfd4c728025c7 |

Q-989, Q-991, R-1049 och U-1230 har samma md5. Det är samma ruta, Sir i vila: felen ligger i det som ändras mellan rutorna. S-1110 och S-1111 är samma halva av skakningen, och S-1112 är den andra.

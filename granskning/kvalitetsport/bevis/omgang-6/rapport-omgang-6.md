# Steg 1, omgång 2 (20 november): punkt 1–4 ur granskning-steg-1.md

Underlag: `granskning/kvalitetsport/bildbibliotek/granskning-steg-1.md` (md5 827f3ce450bcdc647f025c287332aedf). Bilderna ligger i den här mappen. Omgång 5 ligger orörd bredvid.

## 1. Pipan i varje vinkel riggen får hålla

**Varför pipan försvann eller svävade.** Pipan sattes förut i 3D: skaftet pekade 80 grader åt sidan från mungipan. Satt pipan i den bortre mungipan nära profil, pekade skaftet in bakom huvudet.
- I e69306a blev resultatet att pipans huvud hängde bredvid kinden utan skaft.
- I steg 1 tonades pipan ut, och vid 80–90 grader var den helt borta.

**Ny regel (cast.ts, pipe).** Skaftet ritas som det syns i bilden. Det går alltid ut från mungipan, bort från ansiktets mitt, och är minst 0,55 huvudbredd långt.
- I den bortre mungipan nära profil sticker pipan därför fram framför hakan.
- Pipan ritas ovanpå, efter mustaschen, och sitter i samma mungipa hela varvet.
- Uttoningen är borttagen.

**Bladet.** `huvudbladet-var-10-grad-sparrade-vinklar.jpg`: pipan sitter fast i munnen vid alla vinklar 0–90 och 270–350 grader.
- Under varje huvud står både den sanna och den ritade vinkeln, till exempel "90° (ritad 56°)".
- Inga vinklar markeras "pipan fel", eftersom testet inte stoppar någon vinkel där ansiktet ritas.
- Spärren 100–260 grader är oförändrad.

**Före och efter (05 ruta 60 och 08 ruta 45).**
- `R2-pipan-nastan-profil-05-ruta-60.jpg`: i v5 sitter pipan under mustaschen. Nu går skaftet från mungipan och pipan sitter framför hakan.
- `R5c-kaken-08-ruta-45.jpg`: i v5 sitter pipans huvud bredvid kinden utan skaft. Nu sitter den i mungipan med skaft.

**Nytt test `pipe-held` (motionCheck.ts).** Det ersätter `pipefade` och gäller varje ruta där ansiktet ritas, alltså högst 60 grader. Det stoppar:
- en pipa som saknas;
- pipans huvud utan skaft till mungipan;
- skaft som inte börjar i mungipan;
- ett skaft som syns från änden (kortare än 2,5 % av höjden);
- en halvgenomskinlig pipa.

Ritningen märker `pipeOn` vid mungipan, `pipeRoot` där skaftet börjar och `pipeTip` vid pipans huvud.

**Planterade fall.** De görs med ett eget alternativ, `pipeFault`, som bara bevisfallen använder.

| Fall | Fel med flit | Utskrift |
|---|---|---|
| AG | Står vriden 90 grader (ritad 56, det mesta riggen får hålla). Pipan är inte ritad, som i steg 1 | "sir's pipe is gone from his mouth" |
| AH | Tre kvart. Pipans huvud bredvid kinden, inget skaft, som i e69306a | "sir's pipe has its bowl beside his face with no stem to the corner of his mouth" |
| AE | Pipan halvgenomskinlig (nu med `pipeFault: "fade"`) | "sir's pipe stands half see-through" |

Testet kan inte köras på e69306a:s rigg, eftersom den riggen inte satte märkena. Därför bevisar AG och AH felen från steg 1 och e69306a. Med den nya riggen ger `pipe-held` 0 fel på alla åtta bildbiblioteksklippen. Pipan syns också i pekningen i 05, rutorna 504–599.

## 2. Monokeln och pipan över en vridning

`vridningen-0-80-0-280-280-0-spegellas.jpg` visar tre obrutna vridningar i filmen `head-turn`, en grad per ruta. Bladet tar var tionde ruta, och spegellåset är på som i en film (film.ts castOf).

- **A, 0 till 80 grader, spegling av:** monokeln sitter på samma öga och pipan i samma mungipa hela vägen.
- **B, 0 till 280 grader, spegling av:** samma öga och samma mungipa hela vägen. Vid 280–320 grader sitter monokeln på det bortre ögat, sett genom glaset, och pipan går ut på kindsidan.
- **C, 280 till 0 grader, spegling på:** en bild som börjar vänd 280 grader låses som spegelvänd. Då sitter monokeln på det andra ögat och pipan i den andra mungipan hela bilden, också när han har vänt sig mot oss.

**Varför sidorna bytte mellan 300 och 310 grader på huvudbladet.** Bladet ritar varje vinkel som en egen bild, och spegelvändningen bestäms där en bild börjar. Den slås på när figuren börjar vänd 232–308 grader (cast.ts `mirrored`). Inom en bild byts sida aldrig. Det fångas också av test 4, som stoppar en ändrad spegling.

**Över ett klipp med flera bilder.** En bild där Sir börjar vänd åt vänster (232–308 grader) får monokeln på hans andra öga. En bild där han börjar mot oss eller åt höger får det vanliga ögat. Klipper man mellan sådana bilder byter monokeln öga.

**Detta är Jespers beslut, eftersom det gäller den frysta looken.** Ett förslag: B visar att riggen kan rita honom utan spegling hela vägen till 280 grader. Stängs speglingen av för Sir sitter monokeln alltid på samma öga, i varje bild och varje vridning. Det kräver en rad i SIR_D (mirrorAt aldrig). Jag har inte ändrat det.

## 3. Ansiktet behåller tonen från v5, händerna lyfts

**Varför ansiktet blev blekt och gult i steg 1.** Lampans höjd trycktes ihop för hela kortet. Då fick ansiktet mer ljus, och färgkanalerna slog i taket, så att tonen gick mot gult.

**Ny regel (kit.ts, kortljuset).** Hela figuren tar lampornas ljus så som det faller vid ansiktet, lågt i ansiktet (people.ts `lightRef`). Varje pixel vrids ändå efter sin plats tvärs över kortet, så att formen behålls. Kantljuset räknas som i v5.
- Ansiktet får samma ljus som i v5.
- Händerna, som hålls ut eller lågt, får samma ljus som ansiktet.
- Figurer utan ansikte, alltså saker och djur, ritas som förut.

**Mätning.** Medelfärgen (RGB) är mätt i full storlek på hudfärgade pixlar. Ansiktsrutan går mellan huvudets kanter, från ögonen till hakan. Handrutan går från handled till fingertopp med 3,5 % av höjden runt. Samma rutor används i alla tre versionerna. Siffrorna står också under varje R-bild.

| Ruta | Version | Ansiktet | Vänster hand | Höger hand |
|---|---|---|---|---|
| 01 ruta 87 | v5 (e69306a) | (194, 119, 78) | (114, 72, 54) | (128, 76, 51) |
| | steg 1 | (210, 161, 96) | (168, 96, 56) | (200, 117, 66) |
| | nu | (193, 118, 76) | (166, 95, 55) | (187, 107, 61) |
| 03 ruta 90 | v5 | (187, 112, 75) | (132, 78, 53) | (150, 87, 54) |
| | steg 1 | (194, 120, 78) | (167, 93, 51) | (191, 108, 59) |
| | nu | (187, 113, 75) | (165, 91, 51) | (187, 105, 58) |
| 04 ruta 60 | v5 | (206, 126, 79) | (193, 122, 70) | (199, 127, 74) |
| | steg 1 | (207, 135, 84) | (220, 137, 77) | (226, 145, 83) |
| | nu | (207, 126, 79) | (217, 135, 76) | (225, 142, 81) |
| 05 ruta 60 | v5 | — | (169, 99, 59) | (147, 85, 52) |
| | nu | — | (206, 120, 67) | (182, 102, 55) |
| 06 ruta 90 | v5 | (191, 117, 76) | (168, 108, 76) | (159, 90, 50) |
| | steg 1 | (207, 159, 95) | (187, 110, 70) | (203, 130, 64) |
| | nu | (191, 117, 76) | (177, 105, 67) | (189, 105, 55) |
| 06 ruta 110 | v5 | (192, 117, 76) | (161, 104, 75) | (159, 90, 50) |
| | steg 1 | (207, 160, 95) | (188, 111, 70) | (203, 131, 64) |
| | nu | (192, 117, 76) | (178, 105, 68) | (190, 106, 55) |
| 08 ruta 45 | v5 | (186, 112, 69) | (116, 70, 60) | (132, 78, 50) |
| | steg 1 | (218, 157, 89) | (155, 89, 45) | (197, 120, 63) |
| | nu | (181, 110, 68) | (136, 79, 41) | (165, 94, 53) |

**Vad siffrorna visar.**
- Ansiktet ligger nu inom 1–5 enheter från v5 i varje kanal, och förhållandet mellan kanalerna är detsamma. I steg 1 var grönt 0,77 av rött, i v5 och nu 0,61.
- Händerna ligger nu nära ansiktets ton.
- Två undantag: den vänstra handen i 01 och den vänstra handen i 08. Den sitter i knät mot rockens skugga.
- I 05 hittar mätningen inget ansikte, eftersom ansiktet är nästan i profil och huden ligger under monokeln och mustaschen.

**En sidoeffekt.** Byxor och skor är också något ljusare än i v5. De fick förut mindre ljus än ansiktet, eftersom de sitter längre från lampan. Det syns i R-bilderna med hela figuren.

## 4. AC2: tvär start, mjukt stopp

Fallet: han står still. Från ruta 30 i bilden går båda händerna upp och kroppen bakåt, snabbast på första rutan, och rörelsen saktar sedan in under 0,6 s. Han är sedd i tre kvart.

Stoppas på startrutan: "AC2-hard-start-soft-stop frames 2071-2071: sir's body jerks: his skull's movement changes by 0.4 % … from a standstill". Ruta 2070 är den sista stilla rutan och 2071 den första rörelsen. Bild: `AC2-tvar-start-mjukt-stopp.jpg`.

**Varför AC bara fångades där rörelsen stannade.** AC är sedd rakt framifrån. Händer som lyfts framåt och en kropp som lutar bakåt rör sig då mot linsen och nästan inte alls i bilden. Bildtestet ser det som syns, så starten mot linsen gav ett litet utslag. Från tre kvart syns starten.

Testet är byggt så: en start rakt mot linsen fångas inte, och det är inte heller något som syns som ett ryck. Det är en begränsning jag skriver ut.

## Mindre

- Texten under bilderna bryts nu efter bildens bredd, också rubriken (T2, T3, AE med flera).
- Den ritade vinkeln står bredvid den sanna under varje huvud på huvudbladet.

## Testerna efter ändringarna

**Bevisfilmen `proof-faults`, rörelsetestet: 36 fel** (`motion-proof-faults.txt`).
- Stoppade fall: B, Q, R, S, T, U, V, X, Y, Z, AA, AB, AC, AC2, AD, AE, AG och AH.
- Kontrollerna E, H, L, N, O, P och AF klarar alla tester.

**Övriga tester på bevisfilmen.**
- Kroppstestet stoppar A, B, C, D, F, G, K, M, W och AA.
- Grepptestet stoppar J, V, W och X.

**Bildbiblioteket (e69306a:s klipp, ny rigg): 10 fel** (`motion-shot-library-e69306a-ny-rigg.txt`). Det är samma fel som i T1–T6b och samma fel som granskningen inte listade:
- i 01 en rak arm och en ryckig hand;
- i 04 en ryckig hand.

Pipfelen i 02 och 05 är borta, eftersom pipan nu sitter i munnen.

**Nya filer.**
- `engine/scripts/head_turn.sh` gör vridningsbladet.
- `film_info <film> pics <rutor>` skriver ut lederna i bildpunkter. Det används för färgmätningen.

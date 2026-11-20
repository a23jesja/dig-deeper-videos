# Bildbiblioteket, omgång 3 (20 november): åtta klipp, sista omgången

- **Kod:** `engine/src/craft/shorts/shotLibrary.ts`, commit 8327cfe. Riggen och testerna kommer från steg 1 (0870b6d, godkänd).
- **Klippen:** vart och ett är 4 s, 1080 x 1920 och 120 rutor, utan ljud, i hyttljuset v5. Alla är skurna ur samma rendering med `V=-r3d bash scripts/shot_library.sh`.
- **Om r3, r3b och r3c:** alla tre versionerna har jag själv underkänt, se "Egen granskning" nedan.
  - r3 (2d516c8)
  - r3b (9c2c3cc)
  - r3c (1a4c533)

  De ligger kvar orörda i mappen ovanför. Skickas gör bara `*-r3d.mp4`.

## Klippen

| Klipp | md5 |
|---|---|
| 01-stand-and-talk-r3d.mp4 | a073a50a65dca1f7063bc5052380e60b |
| 02-walk-across-r3d.mp4 | 2b192d5cc14dcd0834badc0b2da585db |
| 03-turn-and-look-r3d.mp4 | 0f29839548ce75e2e8b60456eed4a10d |
| 04-hold-with-both-hands-r3d.mp4 | ff778fabddbffdde8afa6c77da824c50 |
| 05-point-r3d.mp4 | ee759aaf77b72ec39c620ec4518085ca |
| 06-react-r3d.mp4 | d41d6866a79102472ef6450c432cb665 |
| 07-open-a-door-r3d.mp4 | 22f42f930ce0ddf4e463950714f53ff1 |
| 08-sit-r3d.mp4 | 3826f8e56444d36e1e5ecf1403a868f1 |

Alla klipp är 1080 x 1920 och 120 rutor (`ffprobe -count_frames`). Klipp 02–08 är byte för byte identiska med samma klipp i r3b och r3c: i de två sista varven ändrades bara klipp 01.

## Kontrollerna på filmen `shot-library` (8327cfe), alla på 0

Utskrifterna finns i den här mappen: `motion-check-r3d.txt`, `grips-check-r3d.txt` och `body-check-r3d.txt`.
- `body check: 960 frames, 960 figure-frames, 1628 pairs tried, 0 faults`
- `motion check: 0 faults`. Det täcker också testerna från steg 1: barred, pipe-held, float, stiff, jerk och gazeY.
- `FILM CHECK OK for shot-library: 8 shots, 32.0 s, …`
- `grips ok: 150 readings of a thing in a hand, every grip in the hand, …`

## Diff ruta för ruta (YAVG)

Filerna ligger bredvid klippen som `<klipp>-yavg.txt`, med 119 värden per klipp: ffmpeg tblend difference och signalstats. En "ensam topp" är en ruta som är mer än dubbelt så hög som båda grannarna.

| Fil | md5 | Max (ruta) | Median | Ensamma toppar |
|---|---|---|---|---|
| 01 | b5a496213cfb345a6f9a7194a3c9f925 | 3,19 (56) | 1,32 | inga |
| 02 | bae00237d6320e64a740dcb2aeebcf47 | 7,20 (33) | 5,63 | inga |
| 03 | 77342ccf48129ce8128556c956b8f8fc | 1,42 (24) | 0,95 | inga |
| 04 | 36981ecc80773b09de7304081d5de697 | 2,83 (23) | 1,40 | inga |
| 05 | ed7f709a024276b2c5cf6bedf958808e | 1,52 (35) | 0,84 | inga |
| 06 | 247327247ad292f531c98acd53b77532 | 2,34 (33) | 0,69 | inga |
| 07 | 2b88ea4e5894a170166fe6c99ad6dc3d | 1,32 (56) | 0,71 | inga |
| 08 | 509f8e4262357a8503fad119eefd2ccf | 1,19 (35) | 0,72 | inga |

- **02:** medianen är hög eftersom linsen åker med honom genom hela klippet, så hela bilden ändras varje ruta.
- **01:** maxet vid ruta 56 är när båda händerna öppnas.
- **06:** maxet vid ruta 33 är när flaskan tippar.

## Munnen: mest öppen mun per pratande klipp (full storlek)

Rutorna är tagna ur klippen och sparade i den här mappen. Mest öppen mun är uppmätt med `film_info shot-library pose`.

| Fil | md5 | Vad som syns |
|---|---|---|
| 01-munnen-mest-oppen-ruta-87-r3d.png | c1d339f85ef37e884eb2c26671512726 | Munnen öppnas på andra sidan. En stängd bit läpp sitter runt skaftet. Handen är ute åt sidan, inte på magen. |
| 06-munnen-mest-oppen-ruta-18-r3c.png | 4db1fc86ac70559fe06d1219fc8dc13f | Han nynnar före flaskan. Klippet är identiskt i r3d. |
| 08-munnen-mest-oppen-ruta-108-r3c.png | 5299b694b3b5ec1672ad0f97b9374077 | Han sitter och pratar. Pipan sitter i mungipan. Klippet är identiskt i r3d. |

Rutor som visar rättelserna:

| Fil | md5 |
|---|---|
| 01-forsta-gesten-ruta-24-r3d.png | 599b1e061232a534f72278b3702d9d30 |
| 01-handen-ruta-60-r3d.png | a4c6035393bf3971774dd1100cd7bc41 |
| 04-tummarna-ruta-60-r3c.png | 1183899693a5c39dd4209bd1ee33234f |
| 05-pekar-ner-mot-flaskan-ruta-80-r3c.png | 2db68313a35b6aed00436f351222a9df |
| 06-flaskan-tippar-ruta-33-r3c.png | 67e5375cbcb4fba43169493913f01fa7 |
| 06-flaskan-faller-fritt-ruta-36-r3c.png | a08b0106587c9b9fb14e26a2075beb85 |
| 07-handen-pa-ringen-ruta-20-r3c.png | 5c85a8d286bbe4a25007544ec05e9c69 |
| 08-handerna-pa-laren-ruta-20-r3c.png | 962670c65823fde8bf2b5178001a84c4 |

Rutorna märkta r3c kommer från klipp som är byte för byte samma i r3d. Rutorna märkta r3b i mappen hör till den underkända versionen.

## Per klipp, mot tabellen i granskning-omgang-2.md

| Klipp | Granskningens fel | Ändrat |
|---|---|---|
| 01 stå och prata | Handflatorna är framåt i vila. Samma symmetriska gest upprepas. Benen är låsta. Kontaktskuggan vid ruta 12 | **Vila:** händerna hänger löst, sedda från sidan med handflatan mot låret (riggen). **Gester:** fyra olika. Höger hand förklarar. Båda händerna öppnas olika långt. Vänster hand räknar två, uppe och ut bredvid honom. Höger hand kommer upp med handflatan ner. **Vikten:** flyttas två gånger, med höften och axlarna (`px`, `hipTilt`, `roll`). **Rörelserna:** varje rörelse har mjuk start och mjukt stopp (`ease`). **Kontaktskuggan:** börjar vid sulorna i ruta 12. |
| 02 gå genom bild | Huvudet ritas om och står i ren profil. Raka armar med nävar. Han lutar bakåt och hasar. Tån dinglar. Rummet tomt 0–0,6 s | **Huvudet:** vänt mot oss, ritat högst 60 grader (testet `barred` ger 0). **Gången:** är i gång från första rutan. Armpendlingen är större, med lätt böjd armbåge och lösa händer (motion.ts, gäller all gång). Han lutar lätt framåt. **Linsen:** åker med honom i 0,3 m/s, långsammare än han går, så att han korsar bilden under hela klippet och går ut till höger på slutet. Därav YAVG-medianen 5,6. |
| 03 vända sig och titta | Vändningen rycker. Örat dyker upp. Ögonen tittar rakt ut. A-ställning med raka armar. Mörk kil vid foten | **Rörelsen:** huvudet vrids med mjuk start och mjukt stopp över 0,6 s, och kroppen vänder efter det (−40 grader på 1,4 s). **Ögonen:** går ner mot flaskan (`gaze`, testet `gazeY`). **Ställningen:** fötterna står närmare varandra och armarna är lätt böjda. **Foten:** vändningen är kortare, så foten lyfts mindre. Ruta 50 är kontrollerad i full storlek. |
| 04 hålla med båda händerna | Nävarna ligger framför boken. Boken rycker på ruta 15–16. Grå nävar. Nästan ingen rörelse | **Greppet:** tummarna ligger över bokens framsida från nävarna vid kanterna, och fingrarna är bakom (handen `thumb` och `carryBy`-visning). **Rörelserna:** fyra, alla med mjuk start och mjukt stopp: han lyfter boken mot oss, lutar huvudet, sänker boken och lyfter den igen med en nick. **Färgen:** hudton som ansiktet (ljuset från steg 1). **Ryck:** testet för saker i handen ger 0. |
| 05 peka | Pipan svävar. Han petar på muggen. Blicken rakt ut. Armen är låst rak. Vilohanden har handflatan framåt | **Pipan:** sitter i munnen (riggen). **Pekningen:** han står bakom pallen och pekar ner mot flaskan med böjd armbåge, och handen ligger under bordsskivan i bild. **Blicken:** ögonen går ner till flaskan. **Armen:** rör sig lite under pekningen (`wag`). **Andra handen:** hänger löst. |
| 06 reagera | 0–1,1 s händer inget. Ryck utan förberedelse. Gallergrin. Grå hand. Inget mål för blicken | **Före:** han nynnar med en liten viktförskjutning. **Händelsen:** flaskan välter av pallen vid 1,0 s och landar på golvet. **Reaktionen:** först en förberedelse, där han spänner sig och drar upp axlarna, sedan en mjuk men snabb rekyl med händerna upp. **Blicken:** går till flaskan på golvet (`Shot.look`, `gazeY`). **Grimasen och handen:** enklare grimas och hudton från riggen och ljuset. |
| 07 öppna en dörr | Rak arm i 1,3 s medan dörren står still. Dörren börjar röra sig när handen släpper. Han tittar i kameran. Ljusstrimmor utan källa. Svart dörröppning | **Valet:** granskningens reservförslag. Med linsen i gången hamnar bladet mellan linsen och hans hand. **Ställningen:** han står längs väggen, ett steg från dörren, där ringen ligger högst 100 grader från linsen. Det gör att ansiktet kan vända sig mot ringen inom spärren. **Händerna och dörren:** handen går till ringen (0–0,45 s), och dörren rör sig från första rutan handen är på den. Han släpper vid 1,4 s. **Blicken:** han tittar på ringen (`Shot.look`, testet ger 0). **Ljuset:** strimmorna kom från månens strålkastare genom akterfönstren bakom linsen. Månen och dess strålar är avstängda i just detta klipp (`Shot.hide`). **Gången:** en lykta på bortre väggen, och den väggen är plankad och upplyst. |
| 08 sitta | Handen hänger i luften. Höften sitter på bakre kanten. Släta brun kub. Käken | **Sitsen:** en sjökista med järnband, lock och ringar. Låren ligger på den och knäna går strax förbi främre hörnet. **Händerna:** vilar på låren (testet `float` ger 0). **Gesten:** höger hand kommer upp, vänds och går tillbaka utan att stå still i luften. **Käken:** riggen från steg 1. |

## Egen granskning

- **Hur jag gick igenom:** kontaktark i 5 bilder/s ur de renderade r3-klippen, och 16 rutor i full storlek. Jag tittade på kontaktpunkter: fötter, händer på bok, ring och lår, flaskan och pallen.
- **Fyra fel hittade i tre varv.** Jag tittade på varje version i 5 bilder/s, innan något skickades:
  1. **06, ruta 35 i r3** (rättat i r3b, 9c2c3cc): flaskan gick genom pallens kant när den föll. Kroppstestet prövar figurer, inte saker mot saker. Nu tippar flaskan över kanten först och faller sedan fritt.
  2. **01, ruta 60 i r3** (rättat i r3b):  den räknande handen låg på magen sett tre kvart. Nu hålls den uppe och ut bredvid honom, och den andra gesten är bredare, så att handen inte stryker över magen när den går ner.
  3. **01, ruta 60 och 87 i r3b:** den nära handen låg utspärrad på höften och magen, både på väg ner och i den sista gesten, där handflatan är nedåt. Nu hålls handen ut åt sidan i båda lägena (r3c, 1a4c533).
  4. **01, ruta 18–30 i r3c:** den första gesten korsade magen. Nu går den också ut åt sidan (r3d, 8327cfe).
- **Kvar, som jag ser det:**
  - Byxor och skor är något ljusare än i v5 (ljuset från steg 1).
  - I 02 är pallen till vänster skuren av bildkanten när linsen åker. Pallen är en sak, inte en figur.

## Speglingen

Jag har inte ändrat den. Det är Jespers fråga. Startvinklarna är uppmätta med `film_info shot-library pose`.

**Spegelvänd: 07.** Han börjar vänd 72 grader åt vänster mot dörren, alltså inom 232–308 grader. Därför sitter monokeln på hans andra öga och pipan i andra mungipan genom hela klippet. Bilden låser speglingen, så sidan byts aldrig inom klippet.

**Inte spegelvända:** de övriga sju.
- 03 börjar mot oss och vänder sig 40 grader.
- 05 börjar vänd 45 grader åt vänster, vilket ligger utanför spegelvinkeln.

Om Jesper bestämmer att speglingen ska stängas av för Sir, gäller det bara 07.

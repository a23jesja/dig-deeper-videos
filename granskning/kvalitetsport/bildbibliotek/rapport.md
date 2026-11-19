# Bildbiblioteket, kvalitetsporten del 2 (19 november): sju bildtyper

Varje bildtyp är ett eget klipp i hyttljuset v5. Klippen är 4 s långa, 1080 x 1920 och 30 bilder per sekund, utan ljud.
- Kod: `engine/src/craft/shorts/shotLibrary.ts`, i commit 3b0f1d9 med skriptfixen därefter.
- Ljuset och luften kommer från `cabinV5()` i cabinTest.ts. Det är samma ljuskort och samma luft som det godkända cabin v5: lyktans glöd och strålar, damm i lyktljuset och i månens strimmor, månen på golvet och en bjälke över linsen.
- Klippen är skurna ur en och samma rendering med `scripts/shot_library.sh`.

Kontroller på filmen `shot-library`, varje ruta:
- `FILM CHECK OK for shot-library: 7 shots, 28.0 s ...`
- `body check: 840 frames, 840 figure-frames, 728 pairs tried, 0 faults`
- `grips ok: 240 readings of a thing in a hand, every grip in the hand, a hand on every held thing ...`
- `NO SHEETS OK`

Varje bild anger `newScene` med skälet "ett eget klipp i biblioteket". Därför kräver kontinuitetstestet inte att boken eller dörren följer med till nästa klipp.

| Klipp | md5 | Så byggs typen |
|---|---|---|
| 01-stand-and-talk.mp4 | 52e38273726d8c14d3cb1d5e103e5aeb | Sir står vänd 40 grader från linsen och pratar med bibliotekets explain. Handflatorna är uppåt och armbågarna böjda, och händerna öppnas på betonade ord. Munnen följer stavelser (0,2–0,3 s, en paus i mitten), och han nickar ibland. Rakt framifrån såg de framåtböjda underarmarna ut som raka armar ut åt sidorna, och därför är han vriden 40 grader. |
| 02-walk-across.mp4 | 22c0c45fdb2427f55cdd12a726709854 | Han går 1,9 m från vänster till höger framför bordet. Linsen åker med i 60 % av hans fart, så han korsar bilden och rummet glider förbi bakom honom. Inga stegljud. |
| 03-turn-and-look.mp4 | 546f40fe9352527610c35776192617db | Han står vänd mot linsen. Huvudet vänder sig först (0,7 s), sedan axlarna från höften (30 grader) mot akterfönstret, och han håller blicken där. Fötterna står kvar. Vänd på fötterna gled kortets ritade fot 2–5 px per ruta, och glidtestet underkände det. |
| 04-hold-with-both-hands.mp4 | 4e85b0f05b51f63d73f0cbcb34a3f6e3 | En uppslagen bok hålls med båda händerna i ytterkanterna (`carryBy`, samma grepp som läsaren i Blackbeard), framför magen. Han läser, och huvudet rör sig längs raderna. Framför bröstet kom bokens överkant upp över hakan och pipan. |
| 05-point.mp4 | 406a073bcacd065ed45758fbf75f2d7b | Han står till höger i bilden och lyfter armen till bibliotekets point (armbågen lite böjd, pekfingret ut) tvärs över bilden mot fönstret till vänster. Ögonen följer. Stod han i mitten gick armen ut genom bildkanten. |
| 06-react.mp4 | f644e99750dd65662c6fd7ddd6c59a98 | Han står i vila. Vid 1,1 s far händerna upp vid huvudet (bibliotekets "head", oh no), ögonen blir stora och kroppen rycker lite bakåt och darrar. |
| 07-open-a-door.mp4 | c3ad07b5454c84713d1278f41d30e1eb | Linsen inne i hytten ser snett på högra väggen, där det nu finns en dörröppning med karm och en mörk gång bakom. Han står bredvid dörren, vänd mot oss, och drar dörren 38 grader in i rummet med högerhanden. Handen är på dörren hela vägen: grepptestet registrerar dörren som hållen, och kroppstestet prövar resten av honom mot det svängande bladet. Därefter håller han den öppen och tittar in. |

## Det du bör titta extra på

1. **Dörren är ny i hytten** (`cabin({ door })`, `cabinDoor` i cabin.ts):
   - Dörren är gångjärnshängd i bakkanten.
   - I de andra sex klippen står den stängd, så att öppningen aldrig är ett tomt hål.
   - Bredvid dörren har väggen inga panellister, eftersom en list bakom honom såg ut att gå genom honom.
   - I dörrklippet stänger ett plankskott hyttens öppna framsida, eftersom natten syntes i högerkanten.
   - Lyktans strålar är bortplockade i just det klippet, eftersom de låg över hans ansikte från den vinkeln. Glöden och dammet är kvar.
2. **Handen på dörren** greppar bladets kant 6 cm innanför ringen, mot gångjärnet. Med knogarnas mitt på ringen låg den ritade handen bredvid ringen.
3. **Pipan när huvudet är vridet mot oss** (03, 07): skaftet pekar mot linsen och syns som en brun rektangel under mustaschen. Det kan se ut som en tunga. Det kommer ur figurens frysta ritning och inte ur klippen. Säg till om du vill ha ett blad för det.
4. **Vända sig och titta** sker från höften utan steg, med skälet ovan. En helvändning på fötterna kräver en fotplantering som inte glider på kortet. Den är inte byggd.
5. **Sitta på bänk eller pall saknas med avsikt.** Den byggs efter knädrapébladet. Knädrapét är påbörjat: plagget nedanför midjan följer låren när figuren sitter.

Med i biblioteket finns också `scripts/shot_library.sh`, som renderar och skär klippen och aldrig skriver över.

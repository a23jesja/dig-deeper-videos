# STOPP: stilprovet v9, Alcatraz i ny stil (de första 9,5 s), omgång 2 av 3, 23 november 2026 kl. 01:20

## Fil

`leverans/alcatraz3d/stilprov-alcatraz-v9.mp4`
- 1080×1920, 30 fps, 9,5 s, 285 rutor, med ljud.
- 10 840 651 B, md5 409a560db2a8d892b8bdaa3e50978088 (`md5-v9.txt`).

v4–v8 skickades aldrig. Jag fällde dem själv:
- **v4:** bild 4 var svart, eftersom platsen saknades i planen.
- **v5:** bara två våningar syntes.
- **v6:** en svettdroppe hamnade på näsan.
- **v7:** flimmermåttet fällde sju rutor, från gångens armsving och en för snabb blekning.
- **v8:** vaktens mössa nuddade texten.

**Före och efter:** `fore-efter-v9/`, med v3 överst och v9 under, på samma rutor. Det finns ett blad per grupp av punkter:
- p01-04-17;
- p05-07-15-16;
- p08-09-22;
- p10-13-18-19;
- p14-20-23;
- p21.

## Punkterna

| # | Punkt | Rättning |
|---|---|---|
| 1 | bakhuvudet över axeln | **Vyn bakifrån är struken.** Vakten står i tre kvarts vy vid gallret, framför det, med ficklampan i handen riktad mot huvudet i sängen. Båda syns i samma bild, och ingen ny ritning används. |
| 2 | ingen hand håller lampan | Lampan sitter i hans högra hand enligt greppregeln: handflata och tumme bakom skaftet, fyra fingrar över det framtill. Strålen börjar vid linsen. |
| 3 | vita block | Borta. Sängarna är vända och ficklampan svagare, så inget är överexponerat. |
| 4 | filten som ett badkar | Filten hänger över madrassens kanter och har en ljus nedvikt kant vid huvudet. Den läses som en bäddad säng. |
| 5 | greppet i bild 3 | Samma lampa, samma hand och samma grepp som i bild 2. Bälteslampan är borttagen. |
| 6 | mössan skärs av | Kameran åker inte längre in nämnvärt (7 cm). Ny kontroll i a3d_check: hela figuren, med mössa, öron, händer och skor, ska ligga inne i bilden med 1 % marginal i varje ruta. OK. |
| 7 | munnen öppen | Leendet är satt till 0 och munnen till 0. **Det frysta utseendet ritar en stängd mun som en liten mörk mun**, alltid minst 0,2 öppen (`flat.ts:376`, Jesper valde A 21 november: "the mouth always shows under the moustache, closed a small dark mouth"). Mindre än så går inte utan att ändra det frysta utseendet. Det är alltså den stängda munnen som syns. |
| 8 | huvudena syns inte | **Bara de tre har en attrapp**, en per våning i samma cellkolumn, upplysta av gallerilampor. Kameran ser in i alla tre cellerna. **Huvudena är cirka 45–50 px, inte 60.** Tre våningar på höjden i 9:16 tillåter inte mer. Går jag närmare faller en våning bort, och då syns bara två. Det är en avvikelse som du får ta ställning till. |
| 9 | bländande fält | Borta. Ficklampan är borttagen ur bild 4. |
| 10 | ljuset lyfter konturerna | Varje pixel som är mörkare än luminans 75 i den oupplysta figuren får tillbaka sin ofärgade färg efter ljuset. Konturerna behåller alltså det frysta utseendets bläck, och ljuset ligger bara på fyllningen. |
| 11 | färgskiftet slutar vid cirkeln | Blekningen läggs bara på hudfärgade pixlar ovanför hakan. Öronen och näsan följer med, och inget annat färgas, varken under hakan eller utanför huvudet. |
| 12 | ventilen dold | Han står till vänster om ventilen. Ventilen och ljusfläcken syns fritt till höger om honom. |
| 13 | stel, ett porträtt | Han lyssnar vid ventilen med huvudet vridet bakåt mot den. Ljuset kommer, huvudet svänger runt mot det, och han rycker bakåt med axlarna upp och stora ögon (bildtypen *reagera*), mjukt över 0,5–0,6 s med huvudet efter kroppen. **Han sitter inte och läser:** att sitta kräver en sittyta som passar lårens undersida, och det byggde jag inte i natt. **Två steg bakåt (bildtypen *gå*) provade jag:** i den här storleken svängde armarna 30 px per ruta, och flimmermåttet fällde rutorna. |
| 14 | dockans mörka band | Huvudet ligger nedsjunket i kudden med filten upp till hakan och ny kamera. Ingen hård kant. |
| 15 | skorna skärs av | Se punkt 6. Hela figuren ligger i bild i varje ruta. |
| 16 | lampan byter hand | Höger hand i både bild 2 och bild 3, tänd i båda. |
| 17 | strålen bakom gallret | Strålen börjar vid linsen framför gallret och slutar vid gallrets plan. Därefter bär plattans eget ljus den. Blenders ficklampa står där den ritade linsen är (`scripts/a3d_lens.mjs`, räknad ur riggen), så att fläcken hamnar där strålen pekar. |
| 18 | droppen lämnar huvudet | Dropparna föds på kinden under ögat, rinner 0,3 av huvudets radie nedåt och tonar bort innan de når konturen. |
| 19 | dropparna överlappar | En droppe i taget, född på samma ställe på den bortre kinden (han vänder sig åt vänster, och en droppe på den närmre sidan rann över näsan). Två droppar, 0,7 s isär, var och en 0,62 s lång. De ligger aldrig på varandra. |
| 20 | ögonlocken sticker ut | De är målade platt: tunna mörka linjer satta i ytan, innanför ansiktet. |
| 21 | ljuset mellan bild 1 och 2 | Ficklampan kommer från gången till höger i båda bilderna: i bild 1 från x 0,22–0,28, y −0,55, och i bild 2 från linsen på x 0,38, y −0,47. |
| 22 | alla är likadana dockor | Bara de tre har ett falskt huvud. Alla andra sängar har en sovande med filten över huvudet och är mörkare. |
| 23 | texten nuddar håret | Kameran i bild 1 är omlagd, så att håret ligger långt under texten. Vaktens mössa i bild 2 ligger också under texten (v9). |

## Kontroller (alla på v9)

**a3d_check** (`a3d-check-v9.txt`): **OK** för alla tre figurbilderna.
- Fötterna ligger 0,00 px från golvpunkten.
- Skuggan ligger högst 6,1 px från den.
- Lederna rör sig högst 8,2 px per ruta.
- Ingen fast sak står framför en figur.
- Hela figuren ligger i bild.

**Planterade fel** (`planterade-fel-a3d-v8.txt`, samma kod): alla fyra fälls.
- float;
- sink;
- behind: vakten i cellen bakom gallret, fången bakom sängen;
- noShadow.

**Flimmer** (`flimmer-v9.txt`): **0 fällda rutor inne i filmen**, och 0 även utan rörelsekorrigering. Största ruta 793 px. Sista rutan fälls som loop, men provet är filmens början och ingen loop.

**Ingång** (`ingangskontroller-v9.txt`):
- första ljudet på 0,000 s, och toppen i ruta 1 är 0,34;
- texten 1,5 s per rad;
- rösterna ligger 0,27 s isär eller mer.

**Vaktens replik** i bild 2 är läppsynkad efter Daniels tagning, ruta för ruta (`src/craft/alcatraz3d/mouth-g01.json`). Ändringen är högst 0,28 per ruta.

**Det frysta utseendet:** `git diff ad1a161` ger 0 rader i designs, rig, clips, ink och stage. Jämförelsen av de åtta bildtyperna (0 px) från STOPP v3 gäller därför oförändrat.

**Nyckelkontrollens formulering** är rättad: den räknar nu förekomster och skriver 0, inte "False".

## Det som återstår eller avviker

1. **Punkt 8:** huvudena är 45–50 px, inte 60 px.
2. **Punkt 7:** den stängda munnen är det frysta utseendets minsta mun.
3. **Punkt 13:** han reagerar i stället för att sitta och läsa.
4. **Fångens skugga:** han kastar ingen skugga i ficklampans fläck. Den oberoende granskaren tog upp det, men det räknades inte som fel.

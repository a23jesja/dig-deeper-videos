# STOPP: rörelseprov, platt 2D A Knopp, v4 (21 november 2026), omgång 3 av 3

v4 rättar de nio punkterna från granskningen av v3. Filerna för v1–v3 ligger orörda.

## Filer (leverans/rorelseprov/)

| Fil | Storlek | md5 |
|---|---|---|
| rorelseprov-a-v4.mp4 | 2 649 010 B | 3b7231c50df359d973f4500fe1331c87 |
| rorelseprov-a-v4-telefon.mp4 | 1 084 856 B | c478e10345b2e078107a1bc22576348e |

- **ffprobe:** 1080×1920, 30/1, 245 rutor (8,21 s), yuv420p, tv, bt709.
- **Rendering:** jag körde själv, i förgrunden, ett jobb, med minnesspärren (14,2 GB fritt). Därefter fanns 0 renderingsprocesser kvar.

## Händelserna (s)

| Händelse | Tid |
|---|---|
| Repliken | 3,10–5,15 |
| Han sänker armen | 4,80 |
| Ormen börjar resa sig | 5,00 |
| Rädd | 5,45 |
| Vänder sig | 5,93 |
| Springer | 6,33 |
| Ute | 7,16 |
| Slut | 8,21 |

## Punkterna

1. **Adas hand på ormen.**
   - Hon drar sig bakåt med händerna upp mot bröstet och ansiktet, och pekar sedan efter honom.
   - Ormen reser sig mitt emellan dem, och Ada står 0,08 m längre åt höger.
   - Sir sänker pekarmen innan ormen kommer upp. I en förhandsversion kom hans näve ner på dess huvud.
   - flat_check har en ny regel: handen (handleden, handens mitt och fingertoppen, med en halv hands bredd) får aldrig komma närmare än 40 px ormens kropp eller huvud. Den mäter samma form som ritas (snakeAt).
     - v4: närmast 52 px.
     - Planterat fel, ormen vid Adas fötter (FLAT_PLANT_SNAKE=1): 92 fel (`flat-check-v4-planterad-orm-vid-ada.txt`).
   - Bild: `v4-handerna-mot-ormen-168-225.jpg`.
2. **Det tomma ögat i ruta 47.**
   - Orsaken satt i motorn: en minnyckel som saknades i minen under fick värdet 0, och för pupillen ska det vara 1. motion.ts tar nu pupillens vilostorlek 1.
   - Ny pupillkontroll i flat_check: den fäller en pupill under 30 % utan rädd min, och ett hopp större än en tredjedel på en ruta.
     - På v3-koden (`pupillkontroll-v3-koden.txt`, körd i en ren kopia av a069bbd): FAILED, ruta 47 1 % och hopp 99 %, ruta 48 18 %.
     - v4: minst 50 % (bara rädd), största hopp 15 % per ruta.
   - Bilder: `v4-pupiller-40-55.jpg` och `v4-pupiller-162-172.jpg`.
3. **Skorna i linjen.**
   - Figurerna står nu så att skons kontur, inklusive dess svarta kant, vilar på linjens överkant.
   - flat_check mäter mot linjens överkant.
     - v3:s placering (FLAT_V3=1): 877 fel, högst 15,7 px (`flat-check-v3-skon-mot-linjen.txt`).
     - v4: 0,0 px.
   - Bild: `v4-skon-mot-linjen.jpg`.
4. **Den öppna munnen i tre-kvart.**
   - Munnen sitter närmare huvudets mitt (x 62 i stället för 84) och 6 högre, med 0,8 av höjden framifrån.
   - Den klipps mot huvudets kontur, så munnen och underläppen ligger alltid innanför, med en haka under. Samma sak gäller Adas mun.
   - Bild: `v4-munnen-tre-kvart-bredast-94.jpg`, där ruta 94 är den bredaste öppningen.
5. **Blicken vid pekningen.**
   - Ett huvud i tre-kvart tittar åt det håll det vänder sig: pupillerna börjar 0,45 åt det hållet och blicken läggs till. Pekningens blick ger 0,97, så pupillerna ligger i ögats högra kant, mot Ada.
   - Ett speglat huvud (åt vänster) vänder nu också blicken. Tidigare tittade det åt fel håll.
   - Bild: `v4-blicken-vid-pekningen.jpg`.
6. **Ormen.**
   - Hålet finns från första rutan.
   - Ormen reser sig under 12 rutor (148–160).
   - Den har en tydlig S-böj, mörka band över ryggen, ett ovalt huvud bredare än halsen med ögonen ovanpå, en munlinje och en kluven tunga.
   - Bild: `v4-ormen-reser-sig-148-163.jpg`.
7. **Den stängda munnen i tre-kvart** sänks 10 under mustaschkanten när den sluter sig och behåller en liten öppen form, så den syns (`v4-blicken-vid-pekningen.jpg`, rutorna 155 och 163).
8. **Uttrycken vid rädslan.**
   - Ingen blinkning och inga halvslutna lock så länge minen är rädd (lid 0).
   - Ögonbrynen i profil har sin inre ände mot näsan. Åt andra hållet läste ett rädd ögonbryn som argt.
   - Bild: `v4-skracken-minerna.jpg`.
9. **Löpningen.**
   - Kliven är nu 340 px (förut 100–130) på en figur som är 720 px hög. Varje steg tar 0,36 s, med 19 svävrutor (`lopningen-steg-v4.txt`).
   - Han står still 0,4 s i stället för 0,55 s, och vändningen tar 0,4 s.
   - Bild: `v4-lopningen-180-215.jpg`.

## Kontroller

| Kontroll | v3 | v4 |
|---|---|---|
| flat_check (skor mot överkant, sjunkning, glidning, pupiller, händer mot ormen) | FLAT_V3: 877 fel, pupillkontrollen på v3-koden: 3 fel | FLAT CHECK OK (`flat-check-v4.txt`) |
| Vyerna | OK | VIEWS OK (`vyer-v4.txt`) |
| Flimmermåttet (upplysning) | 56 rutor | 61 rutor, alla i rörelse; mest i ruta 167, ryckningen (14 660 px) |

**Vyerna i v4:**
- Sir: tre-kvart 62–65, 81–164 och 184–186. Den sista är 3 rutor, eftersom vändningen inför löpningen nu är snabbare.
- Ada: tre-kvart 109–166 och 191–197.

**Inte ändrat:**
- Örat i profil.
- Mustaschens storlek i profil.
- Vändningarnas tre ritningssteg (stilfrågan till Jesper).

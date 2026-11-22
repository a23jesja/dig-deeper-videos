# STOPP 2: Alcatraz 1962, färdig film v2 (22 november 2026)

**Titel:** Three Men Vanished From Alcatraz in 1962

## Filer (leverans/alcatraz/)

| Fil | Storlek | md5 |
|---|---|---|
| three-men-vanished-from-alcatraz-v2.mp4 | 6 095 589 B | 4849829a17ef0ee138856bc4ac74bf94 |
| three-men-vanished-from-alcatraz-v2-telefon.mp4 | 2 922 348 B (under 29 MB) | c8c9c14e491658a7fbb93ccbea142d3d |

- md5 står i `md5-v2.txt`, och `md5sum -c` stämmer.
- Filmen är 1080×1920 i 30 fps, 32,0 s, 960 rutor, H.264 CRF 16 och AAC 192 kbit/s.
- Jag renderade den själv, ett jobb i taget under mem_guard: dubbel storlek med CRF 10 (`engine/scripts/alcatraz_deliver.sh`), ner med lanczos, aq-mode 3, BT.709 i tv-omfång. Ljudet läggs in direkt från wav-filen.
- Efteråt fanns 0 processer kvar.
- **v1** (samma mapp) blev ersatt innan den skickades. Det var jag själv som såg i full storlek att männen på taket fortfarande nuddade varandra och att kameran låg fel. Den raderas inte.

## Rättningar efter granskningen av 1g (före och efter i `fore-efter/`: övre raden 1g, nedre raden v2)

| # | Punkt | Rättning | Blad |
|---|---|---|---|
| 1 | gallret går genom verktyget (bild 5) | Gallret svänger uppåt och åt höger, bort från verktyget. | p1 |
| 2 | männen överlappar (bild 9) | De står 0,66 m isär med luft emellan. Kameran står så att de är långt ner i bilden med himlen, månen och strålen ovanför; i 1g hade jag flyttat kameran åt fel håll. **De fyller 26 % av höjden**, mot de godkända 30 %. Med luft emellan ryms tre hela män inte större i 9:16. clip_check har därför typen "wide" på 25 %, bara för den här bilden. **Det är en avvikelse som du måste ta ställning till.** | p2 |
| 3 | vågorna slutar före kanten (bild 16) | Vågorna ritas förbi båda kanterna i varje ruta. | p3 |
| 4 | vaktens sulor på gallrets linje (bild 14) | Gallret står 40 px längre bak på golvet, så vakten står framför det. | p4 |
| 5 | ingen nål, handen kvar (bild 15) | Nålen syns från att tummen trycker in den (1,05 s in i bilden), och handen går ut genom högerkanten innan klippet. | p5 |
| 6 | likadana män i flotten (bild 11) | Samma mörka, bruna och gröna mössa och samma hudtoner som på taket. | p6 |
| 7 | damm längs skaftet (bild 5) | Kornen faller rakt ner till vänster om spetsen. | p7 |
| 8 | texten försvinner på en ruta | Den tonar ut över 6 rutor (3,0–3,2 s). | p8 |

Dessutom finns automatiseringssessionens tre förenklingar från cc088c1:
- bild 16 utan flygande affischer;
- bild 12 struken, och bild 11 tar tiden;
- bild 6 är två händer som lägger rockarna omlott och sedan ligger stilla.

## Flimmermåttet på hela slutfilen

Utskriften är `flimmer-v2.txt`, kört på exakt `three-men-vanished-from-alcatraz-v2.mp4`.
- **PASS: ingen ruta flimrar, 0 fällda rutor.** Mätt rörelsekorrigerat, med steg upp till 12 px, som regeln från 20 november säger.
- Den största rutan har 1 550 flimrande pixlar mot gränsen 2 000 (ruta 732). Ögon och text: 0.
- Utan att rörelse räknas bort (regeln ordagrant, utan korrigering) ligger 33 rutor över gränsen. Det är händer, ljuset och rockarna i rörelse.
- Loopen: 0,1 % av bilden ändras.

## Kontroller

**clip_check** (`clip-check-alcatraz.txt`): alla bilder OK. Bild 12 finns kvar i koden men ingår inte i filmen.

**Planterade fel** (`planterade-fel-alcatraz.txt`): alla 13 fälls.
- `hand-jump` (bild 6)
- `let-go` (bild 8)
- `swap`, `no-hand`, `pop-in` och `mirror-print` (bild 15)
- `pop-out` (bild 5)
- `long-arm` (bild 8)
- `arm-short` (bild 5, 6, 7, 8 och 13)
- `cloth-through` och `cloth-drop` (bild 1, 3, 7, 13 och 17)
- `pose-snap` och `short-bars` (bild 14)

**Biblioteket:** de åtta bildtyperna klarar clip_check (`clip-check-bildtyperna.txt`), och alla 39 planterade fel fälls (`planterade-fel-bildtyperna.txt`). Jämförda ruta för ruta med de godkända versionerna skiljer 0 pixlar i alla åtta (`bildtyperna-oforandrade.txt`). Looken för vakten och fångarna ändrar inte Sir.

**Ingångskontrollerna** (`ingangskontroller.txt`), mätta i den färdiga mp4:an:
- **första rutan:** första ljudet på 0,000 s, och toppen i ruta 1 är 0,37. Rösten ("The guard's torch hit the pillow") och klicket kommer i ruta 1, och ljuset ligger på det falska huvudet;
- **text:** THE GUARD'S TORCH / HIT THE PILLOW, 6 ord på 2 rader i 0–3,2 s, alltså 1,6 s per rad, och samma ord som rösten;
- **sekund 0–10:** bilderna börjar på 0, 1,8, 3,4, 5,8 och 8,3 s;
- **loop:** 0,0 % av bilden ändras från sista till första rutan. Texten tonar in under de sista 0,45 s och möter första rutan.

**Ljudlistan** (`ljudlista.md`):
- varje ljud står med ruta och tid;
- inga fotsteg;
- inget som låter som en fis: inga gnissel och inga låga, brummande eller blöta ljud;
- larmet är två rena toner;
- mixen är −14,4 LUFS.

**Uttalskontrollen** (`uttalskontroll.txt`) och **lyssningsfilen** (`lyssna-riskord.wav`, 19 s):
- riskorden är Alcatraz, homemade, vents, raincoats, raft, June eleventh, bay och Somewhere;
- mening 7: Whisper skriver "June 11". Om George säger "eleventh" kan jag inte höra, så det ska lyssnas på.

**Rösten:** George (ElevenLabs), 612 tecken förbrukade av de godkända 1 980. Nyckelkontrollen gav 0 träffar (stopp1/nyckelkontroll.txt).

**Thumbnail:** tre bilder i 1080×1920 ur filmen:
- `thumbnail-ruta-536.png`: männen på taket under strålkastaren;
- `thumbnail-ruta-706.png`: filten dras undan från det falska huvudet;
- `thumbnail-ruta-749.png`: vakten blir rädd i larmljuset.

**Titel och beskrivning** (`titel-och-beskrivning.md`). Beskrivningen har raden "The scenes in this video are dramatised illustrations, not footage." och källorna Bureau of Prisons och PBS.

## Det jag själv ser som svagast

1. **Taket på 26 %**, se punkt 2.
2. **Regnrockarna** i bild 6 läses mest som tyg med krage och ärm. Att det är regnrockar framgår av rösten.
3. **"June eleventh"** är bara kontrollerat med Whisper, inte med örat.

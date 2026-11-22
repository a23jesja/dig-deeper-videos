# STOPP 3: Alcatraz 1962, färdig film v3 (22 november 2026)

## Filer (leverans/alcatraz/)

| Fil | Storlek | md5 |
|---|---|---|
| three-men-vanished-from-alcatraz-v3.mp4 | 6 055 399 B | ddf75749872d2ee7aa1a426fc01f3ff0 |
| three-men-vanished-from-alcatraz-v3-telefon.mp4 | 2 911 346 B (under 29 MB) | fa31e992c8ff7d37947e9d7c975a47e8 |

- md5 står i `md5-v3.txt`, och `md5sum -c` stämmer.
- Filmen är 1080×1920 i 30 fps, 32,0 s och 960 rutor. Den är renderad i dubbel storlek med ett jobb i taget, och ljudet är inlagt direkt från wav-filen.
- **Ljudet är detsamma som i v2b.** Det avkodade ljudets md5 är f3203cf4b5d288a226e2bf36a5a55cb0 i båda filerna, och bild 16 har inga ljud.
- v3-filen renderades två gånger under samma namn, eftersom den inte hade skickats. I den första versionen såg jag själv att listen under ventilen hoppade 51 px vid klippet 249 → 250. Den här filen är den rättade.

## Rättningar (före och efter i `fore-efter/`: övre raden v2b, nedre raden v3)

| # | Punkt | Rättning | Blad |
|---|---|---|---|
| 1 | sängen flyter vid soluppgången (bild 13) | Två ben står i bild och går ut genom bildens nederkant. | p1 |
| 2 | hörnnålen (bild 15) | Nålen sitter mitt upptill, som på de andra två. Handen håller affischen där från höger, trycker in nålen och går sedan ut genom högerkanten. | p2 |
| 3 | hoppet vid 249 → 250 | Bild 5:s kamera står så att gallret ligger exakt där bild 4:s galler ligger i bilden (x 120–960, y 640–1280). Listen under ventilen finns i båda bilderna på samma ställe. Vid klippet kommer bara händerna och verktyget in. | p3 |
| 4 | sängbenen i bild 3 | Benen slutar på 1365, alltså längre bak än gallrets fötter på 1400. | p4 |
| 5 | dammet (bild 5) | Ett korn i taget föds vid spetsen, ett var 0,3 s. Det faller rakt ner för sig och blir liggande på listen. Ingen kedja. | p5 |

## Kontroller

**Flimmermåttet** på hela v3 (`flimmer-v3.txt`):
- **PASS: ingen ruta flimrar, 0 fällda rutor.** Mätt rörelsekorrigerat, med steg upp till 12 px.
- Den största rutan har 1 550 flimrande pixlar mot gränsen 2 000 (ruta 732). Ögon och text: 0.
- Utan rörelsekorrigering ligger 30 rutor över gränsen. Det är rörelse.
- Loopen: 0,1 %.

**clip_check:** alla bilder OK (`clip-check-alcatraz.txt`). Biblioteket: alla åtta OK (`clip-check-bildtyperna.txt`).

**Planterade fel:** alla 13 fälls (`planterade-fel-alcatraz.txt`).

**Ingångskontrollerna** (`ingangskontroller-v3.txt`), mätta i mp4:an:
- första ljudet på 0,000 s, och toppen i ruta 1 är 0,36;
- texten är 6 ord, 1,6 s per rad;
- bilderna i sekund 0–10 börjar på 0, 1,8, 3,4, 5,8 och 8,3 s;
- loopen: 0,0 %.

**Thumbnail:** `thumbnail-ruta-536.png`, `-706.png` och `-749.png` är tagna ur v3. Ruta 706 visar nu sängen med ben.

**Ljudlistan:** `ljudlista.md`, samma ljud som i v2b.

Uttalskontrollen, lyssningsfilen, titeln och beskrivningen är oförändrade från STOPP 2 (`granskning/alcatraz/stopp2/`).

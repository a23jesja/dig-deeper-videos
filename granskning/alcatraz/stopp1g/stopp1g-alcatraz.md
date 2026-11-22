# Utkast 1g: Alcatraz 1962, rättningar efter granskningen av STOPP 1c (22 november 2026)

**Utkast:** `utkast-1g.mp4`, 32,0 s och 960 rutor. Ljudet är inlagt direkt från wav-filen, som i leveransen. md5 står i meddelandet. Rutnummer räknas från 1.

- **Före och efter:** `fore-efter/`. Övre raden är utkast 1f (122b0398), nedre raden 1g, på samma rutor.
- **Utskrifter:**
  - `clip-check-1g.txt`;
  - `planterade-fel-1g.txt`;
  - `ingangskontroller-1g.txt`;
  - `flimmer-1g.txt`, flimmermåttet på just den här filen.

## Dina punkter

| # | Punkt | Rättning | Blad |
|---|---|---|---|
| 1 | syhanden hoppar | Handen rör sig mjukt mellan stygnen. Två stygn på 1,05 s var, och nålen går ut och tillbaka över cirka 15 rutor åt varje håll. Nålen går in vid sömmen i början av varje varv, och stygnet syns först från det ögonblicket. Tråden går från nålen till det senaste stygnet. Ny kontroll (a) **hand som hoppar**: högst 60 px per ruta. | p01 |
| 2 | luckan glider utan hand | Handen trycker upp luckan 40 % under 1,2 s och håller den där till klippet. Luckan rör sig aldrig utan handen. Ny kontroll (b): luckan räknas som något som bara får röra sig med handen vid sig. | p02 |
| 3 | filthanden | Filthanden är borttagen. Filten ligger redan uppe och är orörd. Två händer sänker långsamt huvudet till kudden och håller kvar det till klippet. | p03 |
| 4 | nålen och knytnäven | Ingen nål sitter i affischen medan den bärs. Handen håller affischens övre högra hörn, långt från det tryckta ansiktet, och tummen trycker in nålen där när affischen når tavlan (1,3 s in i bilden). | p04 |
| 5 | flotten utan axlar | Männen sitter högre, så axlarna syns över kanten även i den lilla storleken. | p05 |
| 6 | väggen byter färg | Bild 5 har samma blå cellvägg som bild 4. | p06 |
| 7 | fyra sovande | Tre celler i en stilla bild, med ett huvud i varje säng (tre olika hårfärger). Ficklampans mjuka sken glider över dem. Sängarna står på ben på golvet. | p07 |
| 8 | kloner och tomt tak | Männen har var sin mössa, hårfärg och hudton. Kameran ligger lägre, så de står längre ner i bilden med himlen och strålen ovanför. | p08 |
| 9 | tyget läses inte som regnrockar | Den högra rocken har en synlig krage, och den vänstra en hel ärm med manschett som går ut genom vänsterkanten. | p09 |
| 10 | litet galler | Kameran är närmare (zoom 2,0), och gallret fyller bildens mitt. | p10 |

**Kontrollerna (a)–(c):** alla planterade fel fälls (`planterade-fel-1g.txt`).

| Planterat fel | Vad det är | Fälls i |
|---|---|---|
| `hand-jump` | syhanden med det gamla hoppet | bild 6 |
| `let-go` | luckan fortsätter upp när handen gått | bild 8 |
| `swap` | en sak som ritas om på en ruta medan den hålls | bild 15 |
| `pop-out` | handen försvinner | bild 5 |
| `no-hand` | affischen utan hand | bild 15 |
| `long-arm` | handen följer luckan till 85 % | bild 8 |
| `arm-short` | armen slutar inne i bilden | bild 5–8 och 13 |
| `cloth-through` och `cloth-drop` | filten genom eller under sängen | bild 1, 3, 7, 13 och 17 |
| `pop-in` | affischen poppar in | bild 15 |
| `pose-snap` | vaktens ansikte hoppar | bild 14 |
| `mirror-print` | spegelvänt tryck | bild 16 |
| `short-bars` | gallret slutar i luften | bild 14 |

**Pop-out är skärpt.** Hela handen räknas, inte bara handleden, så en hand som försvinner strax innanför kanten fälls.

## Flimmermåttet: hastigheterna

Regeln är ett steg på högst 12 px per ruta, rörelsekorrigerat. Hastigheterna nedan är de största i bilden, i pixlar per ruta.

| Bild | Rörelse | Största steg |
|---|---|---|
| 1 | Ljuset ligger på huvudet från ruta 1 och glider 50 px över det på 1,8 s. Handen står still, och kameran kryper in 2,6 → 2,72. | ljuset cirka 6 px; vid bildkanten cirka 1 px |
| 3 | Ingen panorering längre: en stilla bild där bara ljuset glider. | mjukt sken, 0 px för kanter |
| 4 | Ljuset in från 240 och ut till 860, ett mjukt sken. | — |
| 5 | Skrapet är 110 px på 1 s, dammet driver ner cirka 4 px per ruta, och gallret dras ut 120 px på 1,1 s. | cirka 10 px |
| 6 | Två stygn på 1,05 s var, nålen 50 px ut och tillbaka. | cirka 4 px |
| 8 | Luckan 40 % på 1,2 s. | cirka 12 px |
| 10 | Kameran 100 px på 1,5 s, och teglet har två nyanser utan tunna fogar. | under 4 px |
| 13 | Filten viks 150 px på 1,15 s. | cirka 12 px |
| 15 | Affischen glider 65 px. | cirka 3 px |
| 16 | Affischen flyger kortare och vänder långsammare. | under 12 px |
| 17 | Ljuset och handen kommer in på 2,2 s. | cirka 8 px |

**Loopen:** texten tonar in under filmens sista 0,45 s, så att sista rutan möter den första, som har texten. Mätt i mp4:an ändras 0,0 % av bilden från sista till första rutan.

**Flimmerutskriften på 1g** (`flimmer-1g.txt`), på exakt den här filen:
- **PASS: ingen ruta flimrar.** Mätt rörelsekorrigerat, med steg upp till 12 px, som regeln från 20 november säger.
- Den största rutan har 1 766 flimrande pixlar mot gränsen 2 000 (ruta 361). Ögon och text: 0.
- Utan att rörelse räknas bort (regeln ordagrant, utan korrigering) ligger 42 rutor över gränsen. Det är rörelse: händer, nålen och ljuset.
- Loopen: 0,1 % av bilden ändras.
- Första varvet på 1g gav 15 fällda rutor, mot 291 på 1f. De låg i syhandens vändningar, i rörets ruta 579 och i loopen, och alla tre är rättade här.

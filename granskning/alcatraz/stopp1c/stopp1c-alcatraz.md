# STOPP 1c: Alcatraz 1962, sista utkastomgången (22 november 2026)

**Utkast:** `utkast-1f.mp4`, md5 122b0398b2570772b4e12f7760ba8d2a, 32,0 s och 960 rutor. Rutnummer räknas från 1.

- **Före och efter:** `fore-efter-1f/`. Övre raden är utkast 1c (d1e88fe5), nedre raden 1f, på samma rutor.
- **Greppet om ficklampan:** `ficklampans-grepp-1f-ruta-1-25-50.png`.
- **Mellanstegen** `utkast-1d.mp4`, `utkast-1e.mp4`, `fore-efter/` och `ficklampans-grepp-ruta-1-25-50.png` kan hoppas över, och det är bara 1f som gäller. De ligger kvar eftersom jag inte raderar något i granskning/.

## Förenklat enligt automatiseringssessionen

| Bild | Nu | Bildtyp |
|---|---|---|
| 4 | **Kartan är borttagen.** Ficklampans ljus sveper längs cellväggen, stannar ett ögonblick på ventilgallret och går vidare. Det hör till "If the guards found the holes". Inga händer. | rekvisita och ljus |
| 6 | **Närbild av händer som syr ihop två regnrockar.** Den ena handen håller tyget, den andra drar nål och tråd genom sömmen, stygn för stygn, och stygnen ligger kvar. | 04, händer |
| 9 | **Tre män står stilla och hukar** medan strålkastaren sveper över dem från utanför bildens vänstra kant. Ingen gång, och därför ingen gång på stället. Ventiler och en skorsten står på taket. | 01 stå, vidbild 30 % (godkänd) |
| 10 | **Bara kameran** som åker ner längs röret mot vattnet. Inga figurer. | kameraåk |
| 11 | **Flotten på avstånd**, liten, en stel sak på vågor som rör sig. Ingen arm som knuffar. | stel sak |

## Dina punkter

| # | Punkt | Rättning | Blad (fore-efter-1f) |
|---|---|---|---|
| 1 | armar som försvinner på en ruta | Varje hand lämnar bilden genom kanten. Verktygshanden går ut nere till höger när den är klar, händerna vid huvudet ut åt sidorna, filthanden ut åt höger och handen vid luckan ut nedåt. Ny kontroll **pop-out**. | p01 |
| 2 | affischen utan hand | Handen håller affischens vänstra kant och kommer in före den. Kontrollerna "sak som poppar in" och "sak som rör sig utan hand" visar att handen alltid är där. | p02 |
| 3 | regnrockarna | Ersatta av sömmen i närbild (se ovan). Ingen rock byter ritning, flyger eller tonar fram. | p03 |
| 4 | dammet | Varje korn faller rakt ner från där spetsen var och ligger kvar på listen under ventilen. | p04 |
| 5 | taket | Männen står stilla och hukar. Mössbrättena är kortare (en Look-inställning; Sirs är oförändrad), så de inte går in i nästa mans huvud. Strålen kommer från utanför bildkanten, och taket är ljusare än skorna. | p05 |
| 6 | röret | Kameran åker ner längs röret, inga figurer. | p06 |
| 7 | flotten | Den syns på avstånd, liten och stel. | p07 |
| 8 | armarnas längd | Varje synlig arm går ut genom bildkanten inom **3,5 handlängder**, mätt i varje ruta. Kameran är närmare i bild 5, 7, 8, 13 och 15, och luckan trycks upp en femtedel och slår sedan upp av sig själv medan handen går ner. Ny kontroll **lång arm**. | p08 |
| 9 | vaktens ansikte | Inget ögonlock i vila, så inget lock försvinner när ögonen spärras upp. Rädslan kommer under 0,4 s. Munnen är 0,32 öppen och syns under mustaschen. | p09 |
| 10 | ficklampans grepp | Handflatan ligger bakom, ficklampans korta skaft ovanpå den (det slutar på handflatan, inte över manschetten), fingrarna runt skaftet framför och lamphuvudet framför fingrarna. Närbilden visar ruta 1, 25 och 50. | ficklampans-grepp-1f |
| 11 | sängbenen i bild 3 | Golvet ligger högre, så sängarna har vanlig höjd (benen 150 px). | p11 |
| 12 | kartans etiketter | Kartan är borttagen (se bild 4). | p12 |
| 13 | röret under filten | Borttaget. Kameran är närmare på sängens huvudände, och handen kommer kort ner från överkanten. | p13 |
| 14 | bandet bakom fångens närbild | Ersatt av ett mjukt runt sken som glider jämnt över vattnet bakom honom. | p14 |
| 15 | loopen står stilla | Kameran glider långsamt in. Ljuset kommer in från höger redan efter 0,3 s och kryper upp längs filten mot huvudet, och slutar där bild 1 börjar. | p15 |

## Kontroller

**`node scripts/clip_check.mjs alcatraz`:** alla 17 bilderna OK.

**Planterade fel**, alla fälls:

| Planterat fel | Vad det är | Fälls i |
|---|---|---|
| `pop-out` | verktygshanden försvinner på en ruta | bild 5 |
| `no-hand` | affischen rör sig utan hand | bild 15 |
| `swap` | affischen byter ritning på en ruta | bild 15 |
| `long-arm` | handen följer luckan hela vägen upp | bild 8 |
| `arm-short` | armen slutar inne i bilden | bild 5, 6, 7, 8, 13 och 15 |
| `cloth-through` | filten genom brädan | bild 1, 3, 7, 13 och 17 |
| `cloth-drop` | filten under sängkanten | bild 1, 3, 7, 13 och 17 |
| `pop-in` | affischen poppar in | bild 15 |
| `pose-snap` | vaktens ansikte hoppar | bild 14 |
| `mirror-print` | spegelvänt tryck | bild 16 |
| `short-bars` | gallret slutar i luften | bild 14 |

Regeln mot gång på stället finns kvar i clip_check, men den har inget att pröva nu när taket står stilla.

**Biblioteket:** de åtta bildtyperna är kontrollerade med clip_check (alla OK), och alla 39 planterade fel fälls. Mössans brätte är en Look-inställning med Sirs värde 52 som standard. Jämförelsen pixel för pixel görs om i STOPP 2.

**Ljudet i ruta 1** mäts i den färdiga mp4:an i STOPP 2, där wav-filen läggs in direkt.

## Det jag själv ser som svagast

**Regnrockarna i närbilden** är två stora gula tygstycken med knappar och en söm. Att det är regnrockar framgår av rösten mer än av bilden. Vill du ha något annat där kan jag göra det till en närbild av en enda rock med krage och ärm medan sömmen sys.

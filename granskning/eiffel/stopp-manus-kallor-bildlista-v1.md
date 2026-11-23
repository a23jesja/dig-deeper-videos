# STOPP: Eiffeltornet 1925 (Victor Lustig), manus, källor, krok, bildlista och förhandsräkning (v1, 23 november 2026 kl. 06:35), omgång 1 av 3

Ingenting är byggt eller renderat, och inga ElevenLabs-anrop är gjorda. Berättaren är George. Daniel spelar skrothandlaren. Sir Digsworth syns inte i bild.

**Stilen** bestäms kl. 13:00. Om stilprovet v12 är godkänt då byggs filmen i den nya stilen, annars i platt 2D A Knopp. Manuset och bildlistan fungerar i båda.

## Källor (alla lästa i dag, HTTP 200)

Alla citat står ordagrant, punkt för punkt, i `engine/FACTS-lustig-eiffel-23nov.md`.

1. **MF:** Bill DeMain, *Mental Floss*, 21 augusti 2020.
2. **TIFO:** Matt Blitz, *Today I Found Out*, 14 januari 2015.
3. **F:** Ben Carlson, *Fortune*, 14 januari 2020.

Wikipedia lästes i går (`engine/FACTS-lustig-wikipedia-22nov.md`). Den räknas inte som källa, men den stämmer med punkterna i manus.

**Gick inte att läsa:**
- Smithsonian (Gilbert King 2012) och Eiffeltornets egen sida (toureiffel.paris) gav båda 403. Jag tog mig inte förbi spärren.
- ISRI:s artikel gav 404.

**Avvikelse att ta ställning till:** de tre lästa källorna är populärhistoria från tre olika utgivare, inte museum eller historiker. Varje mening i manus bärs av minst två av dem, och det som bara en bär är struket. De källor som är tyngre (Smithsonian och tornets egen sida) gick inte att läsa.

## Titel

**A Con Man Sold the Eiffel Tower in 1925**: title.py ger 100, 39 tecken.

Alternativ: "He Sold the Eiffel Tower in 1925" (100, 32 tecken).

Beskrivningen säger att bilderna är dramatiseringar. Det står inte i bilden.

## Krok

| Krav | Så här |
|---|---|
| Fråga på skärmen, högst sex ord | **WHO SOLD THE EIFFEL TOWER?** (5 ord), samma ord som rösten, 1,5 s per rad |
| Rösten i ruta 1 | George: "Who sold the Eiffel Tower?" från 0,00 s |
| Ljudträff i ruta 1 | en stämpel som slår i papper (inget lågt, inget fisliknande) |
| Inget uppbyggande i s 2–10 | svaret kommer på 1,6 s ("A con man did."), och bluffen börjar på 6 s |
| Loop | den sista repliken "Any offers?" leder tillbaka till frågan i ruta 1 |

## Manus (engelska, cirka 40 s)

Sjutton repliker och 117 ord: George har 16 repliker med 582 tecken, och Daniel har en med 15 tecken. George talar 3,3 ord per sekund (mätt på Alcatraz-tagningarna), så rösten tar cirka 36 s. Med pauserna blir det cirka 40 s, vilket är taket. Inga inskjutna bisatser. [OWN]-raderna bär inga fakta och inga namn.

| # | Röst | Replik | Märkning | Källa 1 | Källa 2 (3) |
|---|---|---|---|---|---|
| 1 | G | Who sold the Eiffel Tower? | krok | — | — |
| 2 | G | A con man did. | [SOURCE] | MF, TIFO och F | |
| 3 | G | In 1925, the tower cost Paris a fortune to repair. | [SOURCE] | 1925: MF "In May 1925", TIFO "May of 1925" | kostnaden: F "costing the city a fortune in maintenance and upkeep", TIFO "high cost of maintenance and repairs" |
| 4 | G | He posed as a government official, with fake letterheads. | [SOURCE] | MF "Deputy Director General of the Ministère…", "a counterfeiter make him official government stationery" | F "Deputy Director General of the Ministry of Posts and Telegraphs", "stationery … with an official French seal"; TIFO "letterheads" |
| 5 | G | Very official. | [OWN] | ingen fakta | |
| 6 | G | He invited scrap metal dealers to a grand hotel. | [SOURCE] | MF "scrap iron dealers", "the suite of a fancy hotel" | F "scrap metal dealers … summoned to the luxurious hotel"; TIFO "Hotel de Crillon" |
| 7 | G | He said the tower was coming down. The metal was for sale. | [SOURCE] | MF "the government's decision to tear it down", "metal would be for sale to the highest bidder" | F "the biggest scrap metal project in the country's history" |
| 8 | G | One dealer was new in town. | [SOURCE] | TIFO "who was new in town" | F "relatively new to the area" |
| 9 | **D** | Do you deliver? | [OWN] | ingen fakta; skämtet är att han vill ha tornet hemkört | |
| 10 | G | Then the con man hinted that officials were paid very little. | [SOURCE] | MF "they made a meager salary" | TIFO "hardly making enough to pay his bills" |
| 11 | G | So the dealer paid a bribe too. | [SOURCE] | MF "asked for a bribe … and he obliged" | TIFO "giving the Count fifty grand to make sure Poisson would win the bid" |
| 12 | G | The con man vanished with the money. | [SOURCE] | MF "with Poisson's money in hand, fled" | TIFO "Within an hour of receiving the money, the Count left Paris"; F "had already fled the country" |
| 13 | G | The dealer was too embarrassed to tell the police. | [SOURCE] | MF "too embarrassed … to go to the authorities" | F "Poisson was so embarrassed" |
| 14 | G | So the con man came back and tried again. | [SOURCE] | MF "Six months later, Lustig returned to Paris and pulled the exact same stunt" | F "a second time"; TIFO "returned to Paris with the same letterheads" |
| 15 | G | This time, a dealer went to the police. | [SOURCE] | MF "his mark went to the police" | F "The potential buyer went to the police"; TIFO "He contacted the police." |
| 16 | G | He fled to America. | [SOURCE] | MF "fled Europe for the United States" | TIFO "fled in a hurry to the United States" |
| 17 | G | Any offers? | [OWN] | ingen fakta; leder till ruta 1 | |

**Strukna detaljer, eftersom källorna är oense eller bara en bär dem:**
- Summan: 70 000 franc, 70 000 dollar eller ett bud på 250 000 franc.
- Antalet handlare: fem eller sex.
- Österrike: bara MF.
- 7 000 ton metall: bara MF.
- Att han "sålde det två gånger": det andra försöket misslyckades.
- Namnen Lustig och Poisson sägs inte. De står i beskrivningen.
- Tornet var byggt för 1889 och bara tänkt att stå i 20 år. Det bärs av TIFO och F, men det ströks för att filmen inte ska bli längre än 40 s. Det kan läggas tillbaka om något annat stryks.

**Huvudperson och motspelare:**
- **Huvudperson:** bedragaren. Han är stum och spelar med kropp och min; berättaren säger vad han säger.
- **Motspelare:** skrothandlaren, med Daniels replik "Do you deliver?".
- **Skämten:** "Very official.", "Do you deliver?" och "Any offers?".
- Våld visas inte.

## Bildlista (cirka 40 s, en ny bild var 1,5–3,5 s, bara godkända bildtyper)

| # | Tid | Replik | Bild | Bildtyp | Rörelse | Föremål |
|---|---|---|---|---|---|---|
| 1 | 0–1,6 | 1 | En stämpel slår "SOLD" på ett papper med tornet, ruta 1. Frågan står på skärmen. | föremål i närbild | stämpeln slår | papper, stämpel |
| 2 | 1,6–2,9 | 2 | Bedragaren i helbild på en gata i Paris, tornet bakom honom. Han lyfter hatten och ler. | 01 stå och prata | hatten lyfts | hatt, tornet |
| 3 | 2,9–6,1 | 3 | Han läser tidningen på ett kafé. Rubriken är en bild av tornet med ett rött kostnadspris och en rostfläck. Han sänker tidningen, och ögonen smalnar. | 07 sitta | tidningen sänks | tidning, bord, kopp |
| 4 | 6,1–9,3 | 4 | Han stämplar brevpapper med ett sigill och håller upp ett brev. | 04 hålla med båda händerna | stämpla, hålla upp | brevpapper, sigill |
| 5 | 9,3–10,2 | 5 | Närbild på brevet med ett stort sigill. Han putsar det med ärmen. | föremål i närbild | putsar | brev |
| 6 | 10,2–13,2 | 6 | En hotellsvit med kristallkrona. Handlarna kommer in och tar av sig hattarna (tre figurer i bild). | 08 öppna en dörr, sedan 02 gå (små, långt bort) | en i taget | dörr, ljuskrona |
| 7 | 13,2–17,1 | 7 | Han pekar på en modell av tornet på bordet och lyfter av toppen, och handlarna lutar sig fram. | 05 peka | peka, lyfta | tornmodell, bord |
| 8 | 17,1–19,2 | 8 | Skrothandlaren (yngre, rund, ny kostym) längst ut, ivrig, och kameran glider in. | 06 reagera | ivrig nick | — |
| 9 | 19,2–20,5 | 9 | Över bedragarens axel: handlaren frågar "Do you deliver?". Bedragaren blinkar två gånger. | över axeln (01 stå och prata på handlaren) | läppsynk, blink | — |
| 10 | 20,5–24,1 | 10 | Bedragaren suckar, vänder ut fickan (tom) och ser sorgsen ut. | 06 reagera | fickan ut | ficka |
| 11 | 24,1–26,5 | 11 | Handlaren håller fram ett tjockt kuvert med båda händerna. Klipp till kuvertet i bedragarens innerficka. Ingen överlämning i bild, eftersom ge och ta inte är en godkänd bildtyp. | 04 hålla med båda händerna | kuvertet hålls fram | kuvert |
| 12 | 26,5–28,9 | 12 | Hotelldörren slår igen. Bara hans hatt snurrar kvar på hatthyllan och stannar. | föremål i närbild | hatten snurrar | dörr, hatthylla |
| 13 | 28,9–31,9 | 13 | Handlaren under tornet blir röd i ansiktet och drar ner hatten över ögonen. En polis står i bakgrunden, och han vänder sig bort (03 vända). | 06 reagera + tecknad överdrift (färg och ånga) | rodnad, hatten ner | hatt |
| 14 | 31,9–34,9 | 14 | Bedragaren kommer tillbaka in i sviten med samma brev, och nya handlare sitter vid bordet. | 08 öppna en dörr | in genom dörren | brev |
| 15 | 34,9–37,6 | 15 | En handlare pekar ut honom för en polis i dörren, och bedragaren svettas (tecknad överdrift). | 05 peka + 06 reagera med svett | peka, svett | — |
| 16 | 37,6–39,1 | 16 | Ett ångbåtsdäck: bedragaren lyfter hatten mot tornet som blir mindre, och röken bolmar. | 01 stå och prata | hatten lyfts | båt, rök |
| 17 | 39,1–40,0 | 17 | Tornet med en "FOR SALE"-skylt som gungar i vinden, och stämpeln från bild 1 slår ner. | föremål i närbild | skylten gungar | skylt |

- **Bildtyperna:** bara de åtta godkända typerna: 01 stå och prata, 02 gå, 03 vända, 04 hålla med båda händerna, 05 peka, 06 reagera, 07 sitta, 08 öppna en dörr. Därtill kommer föremål i närbild och bilden över axeln från stilprovet. Gång används bara på små figurer långt bort, eftersom armarna annars flimrar.
- **Händer och föremål:** gå efter greppregeln (handflatan bakom, fingrarna framför) i bild 4, 7, 11 och 16.
- **Platser i den nya stilen:** en gata med tornet, ett kafé, en hotellsvit och ett ångbåtsdäck. Hotellsviten bär bild 6–11 och 14–15, så den byggs först.
- **Ljud:** inga fotsteg och inga fisliknande ljud. En stämpel, en dörr som slår och en ångbåtsvissla (hög, inte låg).
- **Text på skärmen:** bara krokfrågan, och "FOR SALE" på skylten. Ingen dramatiseringsruta.

**Saknas i rekvisitan:** stämpel, sigill, brevpapper, tidning, tornmodell, kuvert, hatthylla, skylt och ångbåt.

**Nya figurer:** bedragaren (smal, mustasch, mörk kostym, hög hatt), skrothandlaren (yngre, rund, ljus kostym) och två andra handlare. De byggs som Looks på det frysta utseendet, utan att riggen ändras.

## Förhandsräkning för ElevenLabs (inget anrop förrän du godkänner)

| Röst | Tecken | Tre tagningar | Marginal (en omtagning av allt) | Högst |
|---|---|---|---|---|
| George (JBFqnCBsd6RMkjVDRZzb) | 582 | 1 746 | 582 | **2 328** |
| Daniel (onwK4e9ZLuTAKqWW03F9) | 15 | 45 | 15 | **60** |
| **Summa** | 597 | 1 791 | 597 | **2 388** |

- Nyckeln läses bara ur miljövariabeln.
- Kontots teckenräknare läses före och efter.
- Nyckelkontrollen körs efteråt.

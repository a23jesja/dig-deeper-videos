# Kaptenens middag v6d: stillbilds-STOPP för skeden (punkt 1), 28 nov

Ingen rendering är gjord. Bilderna ligger i `granskning/kaptenens-middag/v6d/sked-stillbilder/`, i full storlek och i 360 px (`-360`).

## Det som fungerar

**Bettet i bild 4.** Ruta 141 är bildens början, och bilden slutar på ruta 191.

| Tid | Ruta | Vad som händer |
|---|---|---|
| 4,70–5,00 s | 141–150 | Vänsterhanden kommer upp till skaftets topp. Skeden står i puddingen. |
| 5,00 s | 150 | Han tar skeden. Toppen flyttar 0,7 px på greppet. |
| 5,00–5,83 s | 150–175 | Skeden dras ut ur grädden åt sidan med en sked grädde och förs mjukt upp till munnen. |
| 5,83–6,00 s | 175–180 | Kontakten. Tuggljudet ligger på ruta 175 (lokalt ljud, inget betalt anrop). |
| 6,00–6,37 s | 180–191 | Handen går ner, och skeden hålls upprätt vid puddingen. |

- Högerhanden håller puddingen still hela bilden.
- Sjömannen säger inget i bild 4.

**Mått vid kontakten (regel 3c, ny):**
- Skedbladets kant ligger 0 px från munnens främre mungipa (gränsen är 8). Den främre mungipan är den som ligger närmast näsan.
- Bladet täcker inget av munnen bortom de första 35 % av munnens bredd från den mungipan. Det mäts mot den ritade munnen med underläppen.
- Pudding, båda händerna och hela skeden ligger utanför näsan i alla rutor.
- Bladet ligger aldrig över ett öga.

**Planterade fel, alla tre fäller:**
- spoonNose (bladet på näsan): 863 punkter över näsan.
- spoonFar (bladet 30 px ut från mungipan): mätt 29 px.
- spoonGone (skeden borta i bild 7): regel 22 fäller 102 rutor.

**Regel 22 (ny):** överallt där puddingen syns i bild finns skeden, antingen i puddingen eller i handen.

**Kontroller:** regel 10, 16 och 21 samt limb_check gäller båda armarna, och alla passerar. Skedens rörelse i bild 4 är som mest 30 px per ruta, och fartändringen är som mest 10.

**Övriga kontroller:**
- motion2: 0 fel.
- Djupkontrollen: OK.
- Övriga planterade fel fäller fortfarande: fistTurn, capFlash och oldBlink.

**Kameran i bild 4** är dragen 10 % bakåt. Fyllnaden är 79 % (gränsen är 60).
- Skälet: med puddingen lägre fanns ingen fri plats för texten.
- Plattan är renderad om, och djupkontrollen är OK.

**Hooken:**
- Skeden lutar 15° från lodrätt, bort från hans huvud.
- Skaftet ligger 38 px från hans huvud och 475 px inne i bilden. Det går inte över tröjan.
- Regel 8 räknar skeden som något som kan skymma, och den fäller inget.
- Ruta 0 före lampflytten är `v6c/slut/bilder/hook-ruta0.png`. Ruta 0 efter är `sked-stillbilder/hook-ruta0-efter.png`.

## Problemet: skeden blir lång och når hakan

- **Varför skeden måste vara lång:** vänsterhanden kan inte komma närmare puddingen i högerhanden än cirka 2,5 puddingradier, inom regel 16 (armbåge högst 150°, överarmen högst 30° in över kroppen). Skeden som står i puddingen måste nå dit handen kan ta den. Den blir därför cirka 3,3 puddingradier lång, ungefär som en 20 cm lång glasssked i en 12 cm bred skål.
- **Varför den lutar:** den lutar cirka 45° in mot kroppen, eftersom handen tar den från det hållet.

**Bild 3 (ruta 81 och 140):** samma sked måste stå likadant som i början av bild 4. Skaftets topp når där upp till hakan.

**Bild 7 och 15a:** efter att han lagt tillbaka den (i bild 5, där han inte syns) lutar jag den 70° utåt, bort från huvudet. Där puddingens grädde ligger vid hakan når skaftets fot ändå huvudets kontur.

**Min nya regel om skeden i puddingen fäller därför.** Regeln säger att den del av skaftet som sticker upp ur grädden ska ligga minst 10 px från huvudet.

| Bild | Fel | Minsta avstånd |
|---|---|---|
| 3 | 60 rutor | −12 px (skaftet inne i huvudets kontur) |
| 7 | 28 rutor | 3 px |
| 15a | 2 rutor | 3 px |

Bilderna `bild3-ruta81`, `bild3-ruta140-fore-klipp`, `bild7-ruta300`, `bild7-ruta311` och `bild15a-ruta700` visar det.

## Val (ditt beslut)

**A. Skeden står i puddingen överallt, som du beslutat.**
- Bild 3: puddingen hålls lägre, i samma höjd som i bild 4. Bild 3 förlorar då lyftet mot hakan (3,2–3,9 s).
- Bild 7: puddingen hålls en bit från hakan. Det ändrar v6c:s godkända poser i bild 7 något.
- Skeden förblir cirka 3,3 radier lång och kan läsas som ett spett.

**B. (Min rekommendation.) Skeden har vanlig längd, cirka 2 radier.**
- Hooken: skeden står i puddingen.
- Bild 3: han har skeden i vänsterhanden. Han tog den ur puddingen i bild 2, där han inte syns, på samma sätt som han lägger tillbaka den i bild 5.
- Bild 4: han doppar skeden i grädden, får en sked grädde och äter. Doppet är mer handling.
- Bild 7 och framåt: skeden står i puddingen igen, kort, och når inte hakan.
- Avsteget från ditt beslut: i bild 3 står skeden inte i puddingen. Den är i hans hand. Den dyker aldrig upp eller försvinner mellan två bilder av honom.

Enligt entimmesregeln bygger jag B på prov om inget svar kommit inom en timme. Jag renderar inte filmen före ditt ja på stillbilderna.

## Kvar efter skeden

- Punkt 6: fyllnaden mätt på den ritade bilden.
- Sedan rendering av v6d med alla kontroller.
- Punkt 2–5 är klara och fäller sina planterade fel. Det gäller lampan, regel 21 med fistTurn, 6d med capFlash och 18b med oldBlink.

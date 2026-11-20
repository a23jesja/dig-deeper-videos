# Ögonlappen: manus, krokprov och riskblad (STOPP före rendering, 20 november 2026)

Rösten är Sir Digsworth (Kokoro bm_george, speed 1,06), och han syns inte i bild. Rösten är redan gjord (`engine/voice/eye-patch`), och Whisper hittade alla 89 ord. Filmen är 35,6 s lång. Koden ligger i `engine/src/craft/shorts/eyePatch.ts`.

**Vinkel:** skrönan berättas som en skröna och fakta som fakta: idén kan fungera, men ingen vet om pirater gjorde så.

## Titel (ingen fråga, körd genom title.py)

| Förslag | title.py |
|---|---|
| **The Pirate Eye Patch Trick** (förslag) | 90/100, 26 tecken |
| Pirate Eye Patches: The Dark Trick | 90/100, 34 tecken |
| The Pirate Eye Patch Trick Nobody Can Prove | 76/100, 43 tecken (mobilen kortar av efter "...Nobody Can") |

title.py ger bara en anmärkning, "no-number", för alla tre. Frågan på skärmen i öppningen står kvar: "WHY DID PIRATES / WEAR EYE PATCHES?"

## Manus

Varje rad är märkt [SOURCE] med källa, eller [OWN]. Källorna med URL och ordagranna citat står i `fakta.md` och nedan.

| # | Bild | Rösten (bm_george) | Märkning |
|---|---|---|---|
| 1 | Piraten på det soliga däcket, lappen på hans **högra** öga | "Why did pirates wear eye patches?" | frågan (ingen fakta) |
| 2 | Under däck, mörkt: kamraten utan lapp famlar | "One idea: to see in the dark." | [SOURCE] att idén finns: IFLScience, Mental Floss |
| 3 | Båda på däck, kamraten kisar mot solen | "Up on deck, the sun is blinding." | [OWN] scenbeskrivning, ingen fakta |
| 4 | Kamraten under däck i mörkret | "Go below, and you can't see a thing." | [SOURCE] Scientific American (mörkeranpassning) |
| 4b | Pratbubbla, kamraten | "Who blew out the sun?!" | **[OWN]** |
| 5 | Kamraten famlar vidare | "Eyes need twenty to thirty minutes to get used to the dark." | [SOURCE] Scientific American: "typically takes between 20 and 30 minutes to reach its maximum"; Mental Floss: "up to 25 minutes" |
| 6 | Däck, närmare, på lappen | "But an eye under a patch is already used to it." | [SOURCE] Mental Floss: "there's no question that keeping one eye dark-adapted works" |
| 7 | KLIPP. Under däck har lappen flyttats till hans **vänstra** öga, och han läser loggboken med båda händerna. Kamraten famlar bakom. | "Flip the patch, and you can see." | [SOURCE] samma; detta är skrönans idé och sägs som idé |
| 8 | Han sitter på en kista under däck (bildtyp 08) | "In 2007, MythBusters tested the idea." | [SOURCE] Mental Floss: "MythBusters tested this hypothesis in their pirate special in 2007"; IFLScience: "Mythbusters looked at the idea in a 2007 pirate special" |
| 9 | Samma, en annan vinkel | "Their verdict: plausible." | [SOURCE] Mental Floss: "determined that it was plausible"; IFLScience: "ruled the myth plausible" |
| 10 | Däck, lappen på hans högra öga | "But did real pirates do it?" / "Nobody knows." | [SOURCE] nästa rad |
| 11 | Hyttens bord, ingen där | "No picture or record from their time says so." | [SOURCE] IFLScience (Dr Rebecca Simon): "There are no images, woodcuts, or any mentions of them in any primary sources from the 17th and 18th centuries"; Benerson Little: "none of the several eyewitness images of buccaneers or flibustiers from the 1680s show any with any of the usual Hollywood characteristics" |
| 12 | Däck, samma bild som den första | "Still. A very clever trick." | **[OWN]** omdöme, ingen fakta |
| 12b | Pratbubbla, piraten (leder tillbaka till början) | "Arr. Which eye was it?" | **[OWN]** |

Egna repliker: 3. Ingen av dem bär ett påstående om fakta.

**Struket, eftersom det inte håller med två lästa källor:**
- "riktiga ögonlappar täckte skadade ögon", som bara har en full källa (Little);
- detaljerna i MythBusters-testet;
- Treasure Island;
- Nelson.

**Säg inte:**
- att pirater gjorde så som fakta;
- att MythBusters "bevisade" något;
- "exakt 25 minuter".

## Källorna, lästa på sidan i dag

Citaten är kontrollerade ord för ord med en egen hämtning av sidorna kl. 09.20.
- Scientific American, Rafael Caruso (National Eye Institute): https://www.scientificamerican.com/article/experts-eyes-adjust-to-darkness/
- Mental Floss: https://www.mentalfloss.com/science/body/why-did-pirates-wear-eye-patches
- IFLScience, Dr Rebecca Simon: https://www.iflscience.com/you-probably-believe-the-myth-about-why-pirates-wore-eye-patches-70246
- Benerson Little: https://benersonlittle.com/tag/eye-patches/
- Children's Museum of Indianapolis (tredje källa för "no recorded historical precedent"): https://www.childrensmuseum.org/stories/why-pirates-wear-eye-patch

## Krokprov: tre öppningar (`krokprov-tre-oppningar.jpg`)

Bilderna i b och c är montage: texterna överst är deras senare plats i filmen, och i öppningen står bara frågan.

| | Öppningstyp | Ruta 1 | Klipp sek. 0–5 | Ljudträff ruta 1 |
|---|---|---|---|---|
| **a** (byggd) | b: frågan över handling | piraten med lapp på solens däck | 2,42 s → mörkret, 4,78 s → däck | plask (splash) |
| **b** | a: det konstiga pågår redan | piraten läser i mörkret, kamraten famlar | 2,4 s → solens däck | knarr (creak) |
| **c** | c: någon i trubbel | kamraten i mörkret, "Who blew out the sun?!" | 2,4 s → piraten på däck | knarr (creak) |

För alla tre gäller:
- det första ordet ("Why") kommer i ruta 1;
- texten på skärmen är samma sex ord som rösten och står i 2,4 s;
- ingen intoning.

**Slutet leder tillbaka till början:** sista bilden är samma inramning som den första, och bubblan "Which eye was it?" leder in i frågan igen.

Jag föreslår a. Lappen syns direkt, och frågan och bilden är samma sak.

## Riskblad

1. **`riskblad-1-varje-bild-med-lappen.jpg`:** en stillbild per bild med en röd pil vid lappen och vilket av piratens egna ögon den sitter på, mot manuset. På däck sitter den på höger öga och under däck på vänster, och alla bilder är OK.
2. **`riskblad-2-lappen-planterade-fel-och-vridning.jpg`:** ögonlappen är ny teknik, och tre planterade fel fälls:
   - AP: lappen bredvid ögat (patch-off);
   - AQ: lappen byter öga mitt i bilden (patch-swap);
   - AR: lappen på fel öga mot manuset (patch-eye).

   Tre kontroller klarar alla tester:
   - AS: speglad figur, lappen står kvar på hans högra öga;
   - AT och AU: vridning 0 till ±79°, och lappen sitter på samma öga hela vägen.

**Speglingen:** lappens öga är låst till piratens kropp. Den speglade ritningen byter tillbaka lappen, och märkena följer med. Piratens look har dessutom ingen monokel och speglas aldrig. Testet `patch-eye` läser i bilden på vilken sida om ansiktets mitt lappen ligger, jämfört med var hans högra axel är, och fäller en bild där det inte stämmer med manuset (Shot.patchEye).

**Kontakter och kroppar:**
- **Bild 7:** han håller loggboken med båda händerna på samma sätt som i det godkända 04, med tummarna framför och fingrarna bakom. Loggboken är en egen rekvisita, utan text och med en skeppsskiss.
- **Bild 8–9:** han sitter på en sjökista som i det godkända 08, med händerna på låren. Flaskan på bordet är dold i de bilderna.
- **Kamraten famlar** med armbågarna böjda och händerna i rörelse, så inga stela armar.
- **Allmänt:** ingen går, inga dörrar och ingen hand mot ansiktet. Lappen flyttas bara i ett klipp.

## Testerna (alla på hela filmen, varje ruta)

| Test | Resultat |
|---|---|
| film_info eye-patch check (text, bubblor, klipplängd, kropp och rörelse) | OK, 12 bilder, 35,6 s |
| motion (inklusive öra, jerk för alla saker, släpp, underarm och de tre lapptesterna) | 0 fel |
| body (inklusive sak mot fast sak) | 0 fel |
| grips | OK |

Inga stegljud: det enda ljudet i ruta 1 är plasket, och filmen har inga steg.

## Kvar till v1

- Ljud och mix: plask, knarr, vind på däck och ett tyst mörker under däck.
- Rendering, telefonkopia under 29 MB, md5.
- Min granskning i 5 bilder/s och i full storlek.
- En oberoende granskare.

# Nya kodkontroller före bit 8, och utfallet mot middagen v5

Molnsessionens beslut (DAILY-RULES ac7036c, "Hands and the body"). Koden:
- `engine/src/craft/checks/bodyGeom.ts`: figurens delar som polygoner. Formerna kommer från den frysta riggens egna funktioner: `limb`, `torsoPts` och `hand`, där handen ritas av på en duk som bara sparar former. Huvudets ellips och munnens plats är desamma som i flat.ts. Inget ritas, och looken ändras inte.
- `engine/scripts/dinner_check.mjs`: de nya reglerna 9 och 10, planterade fel för regel 7 och 8, och `--geom` för överlägg.
- `engine/scripts/limb_check.mjs`: vakten släpper igenom src/craft/checks, men bara så länge ingen filmkod importerar därifrån. Det har ett eget planterat fel, `--plant-import`.

## Reglerna
- **9. Egen hand över munnen medan figuren talar.** Ingen punkt av den ritade munnen med underläppen får ligga under figurens egen hand, tummen inräknad. Handen räknas växt med en halv bläcklinje. Handen som räknas är den som ritas över huvudet: i profil den närmre, framifrån båda.
- **10. Enarmad.** Gäller medium- och närbilder, alltså bilder där den största figuren är minst 50 % av bildhöjden, och varje figur vars huvud syns i bilden.
  - En arm räknas som synlig om minst 15 % av dess ritade yta syns, eller minst en fjärdedel av handen.
  - Armen räknas som dold där den ligger under figurens egna ben, bål, huvud och mössa eller närmre arm, i den ordning riggen ritar dem. Den räknas också som dold under en närmre figur.
  - En arm som till största delen är utanför bildkanten räknas som beskärning, inte som en saknad arm.
  - En arm som döljs av ett namngivet föremål skrivs in i `HIDDEN_BY`. Listan är tom för v5.

## Utfall mot v5 (filmrutor, 30 fps, oförändrad kod och oförändrade tagningar)
| regel | bild | figur | rutor | fälld av granskningen? |
|---|---|---|---|---|
| 9 | 6 | sjömannen, närmre handen (tummen) | 365-401 (37 rutor) | ja, punkt 4 |
| 10 | 8c | sjömannen, bortre armen (1 % syns) | 692-719 (28) | ja, punkt 3 (rutorna 696, 706, 718) |
| 10 | 8c | pojken, bortre armen (1 %) | 686-719 (34) | ja, som punkt 2 (omröstningen syns inte) |
| 10 | 1b | kaptenen, bortre armen (8 %, handen 4 %) | 36-59 (24) | delvis, punkt 5 ("mörka klumpar") |
| 10 | 2 | kaptenen, bortre näven | 60-80 (21) | nej |
| 10 | 3b | kaptenen, bortre armen (0 %) | 129-176 (48) | nej |
| 10 | 5 | kaptenen, bortre armen (1 %) | 402-458 (57) | nej |
| 10 | 8b | kaptenen, bortre armen (3 %) | 567-656 (90) | nej |

**Kontrollerna fäller v5 på tummen i bild 6 och på den enarmade sjömannen i 8c.**

Regel 10 hittar dessutom den sittande kaptenen i profil. Hans bortre hand ligger på det bortre låret, bakom det närmre benet och bålen. Jag har tittat på stillbilder från 3b, 5, 8b, 2 och 1b, och han ser enarmad ut i alla fem. Det räknar jag som verkliga fel, och v6 måste rätta dem.

Bild 7 passerar. Där syns den bortre handen bakom den närmre på bordet (31 % av handen), och i stillbilden syns två händer.

Överlägget `overlay-v5-rutor-375-696-153.jpg` visar rutorna 375 (bild 6), 696 (8c) och 153 (3b). Färgerna:
- gult: munnens punkter;
- grönt: den närmre handen;
- lila: den bortre armen;
- blått: det som döljer armen.

Kontrollens former ligger på de ritade formerna.

## Planterade fel
En plant räknas bara om dess egen regel ger fel som den rena körningen inte har. Alla fälls, och körningen avslutas med kod 1:
- seatHigh (regel 1): 438 nya fel
- float (regel 2): 4 944
- pudOff (regel 3): 438
- handIn (regel 4): 84
- capLow (regel 6): 609
- **missing (regel 7):** pojken utelämnad i 3a. 1 nytt fel.
- **faceHide (regel 8):** pojken placerad 0,5 m bakom sjömannen, sett från bild 3d:s lins. 438 nya fel.
- **mouthHand (regel 9):** varje talares närmre hand flyttad till munnen. 132 nya fel, i bild 2, 7 och 8c.
- **oneArm (regel 10):** sjömannens bortre arm upplyft bakom huvudet, som i v5:s 8c. 257 nya fel i bilder som annars passerar (1a, 3a och 4, med flera).

Två planterade fel i limb_check fälls också: `--plant-guard` och `--plant-import`. limb_check dinner, cabin och clips är OK.

## Gränser (sagt rakt ut)
- Föremål räknas inte som skymmande. Ett föremål kan bara ursäkta en dold arm via `HIDDEN_BY`. En arm bakom bordet blir alltså inte fälld av regel 10, men den är heller inte godkänd av den.
- Mössan är en ungefärlig låda: -128 till 112 i bredd och -312 till -206 i höjd i huvudets ram.
- Framifrån (|sin| ≤ 0,5) räknas båda armarna som ritade över kroppen, vilket är snällt. Riggens svep för den bortre armen i vändningar är inte uträknat.
- Regel 9 gäller bara figurens egen hand. En annan figurs hand över ansiktet hör till regel 8.

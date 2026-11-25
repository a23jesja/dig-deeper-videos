# Figurark-STOPP: garderoben för middagens tre (v6)

**Bilder:**
- `figurark-1-fyra-siluetter-sittande.png`: Sir och de tre i 3/4, samma fyra som svarta siluetter, och kaptenen sittande med båda händerna synliga.
- `figurark-2-vinklar-tal.png`: varje nytt huvud genom en vändning (0, 15, 28, 40, 50 och 60°) och talande med öppen mun i 3/4 och vid 60°.
- Telefonstorlek, 360 px bredd: `telefon-360-fyra.png`, `telefon-360-siluetter.png` och `telefon-360-bada.png`.

## Figurerna
| | huvud | ansikte | kropp | kläder | längd |
|---|---|---|---|---|---|
| Kaptenen | trekantig hatt med guldkant | helskägg, mun alltid ritad över skägget | bred (bål 1,24x, armar och ben tjockare) | lång röd rock, guldknappar, rockskört över låren, krämfärgad väst | 1,75 m |
| Sjömannen | röd sjal med vita prickar, knut och snibbar i nacken | stubb (lätt skugga på käke och haka) | lång och smal (bål 0,8x, 1,9 m) | blåvit randig tröja, även på ärmarna, öppen krage | 1,90 m |
| Pojken | barhuvad, rufsigt brunt hår, luggen slutar ovanför ögonbrynen | barnansikte med 1,22x större ögon, lite lägre | liten (1,42 m) | för stor vit skjorta som hänger långt ner, vida ärmar | 1,42 m |

Kepsen, monokeln, mustaschen och pipan finns bara hos Sir. Alla tre bifigurerna har dem avstängda.

## Hur det är byggt
- `engine/src/craft/wardrobe/kit.ts` är en kopia av den frysta A-ritningen (`designs/flat.ts`) med garderobens delar. Riggen och skinnet är åtskilda: samma skelett, samma poser och samma leder, så att alla kontroller läser samma punkter.
- En figur ritas med garderoben när dess Look bär ett `kit`. Utseendena står i `wardrobe/cast.ts`.
- Sir ritas aldrig härifrån. `git diff ad1a161` på `designs/`, `rig.ts`, `clips/`, `ink.ts`, `stage/` och `alcatraz/` är **tom**.
- Trekantshatten är en brätte i 3D med tre uppvikta hörn, sedd från vyns vinkel. Därför håller den formen genom vändningen. Brättets lägsta punkt ligger på -206 i huvudets ram, och ögonbrynen ligger som högst på -192, så brättet går aldrig över ögonen (se arket, 0–60°).
- Skägg och stubb ritas före munnen. **Munnen ritas alltid över skägget**, och talande syns den öppna munnen i 3/4 och vid 60° (ark 2, högra kolumnerna).
- Rockskörten ligger längs låren. Sittande ligger de på knät och aldrig genom pallen.

## Kontrollerna på de nya kropparna
- `checks/bodyGeom.ts` läser figurens egen kropp (`kitBody`), rockskörten och hattens eller hårets kontur (`hatOutline`), inte kepsens låda.
- limb_check dinner med de nya figurerna: **OK**, med 2 armar, 2 händer, 2 ben och 1 huvud per figur i alla 720 rutor.
- Vakten räknar `wardrobe/` som rigg, eftersom det är riggens egen ritning av armen och handen. Dess planterade fel, `--plant-guard` och `--plant-import`, fäller fortfarande.
- **Planterade fel 7–10 fäller på de nya kropparna:**
  - missing (regel 7): 1 nytt fel;
  - faceHide (regel 8): 438 nya;
  - mouthHand (regel 9): 132 nya;
  - oneArm (regel 10): 243 nya.

  De fem äldre fäller också, alla på sin egen regel.
- **Sittande kapten, båda händerna:** den närmre handen ligger på det närmre knät, och den bortre på det bortre knät, där 86 % av handen syns enligt regel 10:s geometri. I v6 sitter han alltid i 3/4 så, eller med händerna på bordet.
- **Obs:** v5:s scen med de nya figurerna fäller nu regel 3 (greppet) och regel 5 (kanterna), eftersom sjömannen är längre och puddingens plats är skriven för den gamla kroppen. v6 bygger om scenen.

## Det jag själv ser som svagt
- Kaptenens skägg är stort och täcker käken upp till örat. Det läses som helskägg, men det är mycket mörk yta i närbild.
- I sidovyn vid 60° sitter skägget framåt, men munnen syns.
- Sir och kaptenen har båda stora mörka huvudbonader. Som siluett skiljs de åt av hattens spetsar, kaptenens bredd och skägget, och Sir av pipan.
- Pojkens hår är en enkel tofsig kalott och inget mer detaljerat.

## Rättat efter granskningen (villkor 1–8)
1. **Kepsresterna.**
   - Pojkens hår följer huvudets kontur på sidorna, med tofsar bara över hjässan och luggen ovanför brynen.
   - Sjalen ligger tätt på huvudet, högst 1 över konturen, utan spets framåt.
   - I siluetten har bara kaptenen ett brätte (ark 1 och telefon-360-siluetter).
2. och 5. **Munnen.**
   - Kitets mun (`kitMouth`) sitter närmare huvudets mitt och är mindre. Hela den öppna munnen med läppen ligger minst en bläcklinje innanför konturen.
   - Det är provat i varje vinkel från -60 till 60° i steg om 5°, med öppning 0–1, leende och snedhet: 0 punkter utanför.
   - **Ny regel 11 i dinner_check:** munnen ligger innanför huvudets kontur. Planterat fel `mouthOut`: 1 299 nya fel.
3. **Sitsen.**
   - På arket sitter kaptenen på en bänk som är bredare än höfterna.
   - I v6 blir det en 3D-kista eller -bänk, och dinner_check mäter att hela bäckenbredden vilar på sitsen (byggs i v6).
4. **Bredd och höjd.** Båda fanns redan som parametrar:
   - kaptenens bål är 1,24x bredare;
   - sjömannen är 1,90 m mot 1,75 m, alltså 8,6 % längre i ben och bål.

   Ingen ny riggkod behövdes.
6. **Hatten.** Ingen vändning i v6 korsar 15–28° eller 50–60°.
   - **Ny regel 12 i dinner_check:** ansiktets vridning korsar aldrig de banden inom en bild. Planterat fel `turnCross`: det fäller.
   - Ark 3 visar hatten 0–60° i steg om 5°. Formen byts vid vyskiftena 27° och 58° och är stilla däremellan.
7. **Skägget.** Det ritas efter armarna, över ärmarnas överdel men aldrig över en underarm eller en hand framför huvudet. Munnen ritas över skägget. Ljusare hårstrån ger skägget tre streck.
8. **Telefonutsnitten** är gjorda om. Ingen figur är avskuren, och ingen bit av arket syns vid kanten.

Kaptenen sittande på ark 1 har kroppen vriden 28°, med huvudet i 3/4. Under 30° ritar riggen båda armarna över kroppen, så båda händerna syns hela på knäna. Vid 40° låg den bortre bakom benet.

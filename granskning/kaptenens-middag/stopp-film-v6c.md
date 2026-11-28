# Kaptenens middag v6c: film-STOPP, 28 nov kl. 01:45

## Leveransen

| | Sökväg | Storlek | md5 |
|---|---|---|---|
| Film | `leverans/kaptenens-middag/kaptenens-middag-v6c.mp4` | 13,6 MB, 24,4 s, 1080 x 1920, 30 fps | c47069e861e8da14728da5ec4cd99609 |
| Telefonkopia | `leverans/kaptenens-middag/kaptenens-middag-v6c-telefon.mp4` | 5,7 MB (under 29 MB) | 7d647bd34988488598f782526f9b4887 |

- sha256 för båda filerna står i `leverans/kaptenens-middag/md5-v6c.txt`.
- Filmen är renderingen v6c-r4, gjord från commit 85cf3c2. Loggar och bilder ligger i `granskning/kaptenens-middag/v6c/slut/`.
- **Byggtid:** från figurarket (c01aaf4, 25 nov kl. 07:47) till detta STOPP cirka 66 h. Arbetet med v6c tog 27 nov kl. 06 till 28 nov kl. 01:45.
- **Renderingar:** fyra hela. r1, r2 och r3 fälldes av kontrollerna och levererades inte. Fyndet från varje rendering rättades vid källan och prövades med en kort rendering av samma ställe.

## Kontrollerna på slutfilen (r4)

| Kontroll | Resultat |
|---|---|
| dinner_check (regel 1–19, 8b, 13b, 3b) | OK, 732 rutor, 0 fel |
| limb_check | OK |
| motion2 | PASS, 0 fel. Kroppsdel som mest 38,3 px per ruta (gräns 40), hastighetsändring 13,0 (gräns 13,3), ansikte 4,4 (gräns 12) |
| flicker2 (film och plattlager) | Bara loopskarven 731→0, som är ett klipp enligt beslutet. Bild som mest 1994 px (ruta 346, gräns 2000), öga som mest 36 (gräns 40), text 0 |
| seam_check | PASS, största 0 px på 266 skäggrutor |
| djupkontrollen | OK, 732 rutor. Båda planterade fel fäller |
| cheat_check | OK. Planterat shift fäller (kaptenen 29 cm i 1→2). Planterat swap fäller inte, se nedan |
| Tunerns fyllnad (alla rutor) | 15/15. Lägsta värden: 1: 60,4 %, 2: 60,5, 3: 60,1, 7: 60,5, 9: 61,0, 12: 60,2, 14: 60,3, 15a: 60,5, 15b: 60,4 |
| Snitt (regel 15) | 1→2 och 15b→1: 36°, 1,40x. 3→4: 32°, 7→8: 38°, 12→13: 31° |

**Planterade fel** (`slut/planterade.txt`): 27 av 30 fäller.
- pudBeard 48, pudLift 48, headTouch 48, capOutD5 56, noFore 162, cuffOnly 108, sleeveNoInk.
- crownBrim 31, crownFace 93, lidCut, stripeNet och de gamla.
- NO_STANDINS fäller 11 bilder. NO_LEGS fäller bild 1 (89).
- seam_check: v6:s egna rutor 515–560 fäller (494–1137 px), med v6:s kod. Hacket på 10 px fäller 234 rutor. Hacket på 7 px under munrutan, som du bad om, fäller 233 av 266.

**Fäller inte, med förklaring:**
- frontArm: fångas av regel 16, inte av regel 10. Godtaget.
- pudOff: puddingen står aldrig på tallriken i filmen. Godtaget.
- hookHi: greppet som det låg i 262fe44. Det låg cirka 30 px från skägget, vilket du bekräftat, så det finns inget att fälla. Att regel 8 räknar skägget visar pudBeard.
- cheat_check swap: inget klipp i v6c delar två figurer. Sjömannen är fuskad ut ur 2 och 15b, och bild 11 har bara kaptenen (se cheat-check.txt). Ordningsprovet har därför inget att jämföra. Avståndsprovet (shift) fäller.

## Det du bad om i STOPP:et

1. **Resningsbilden** är bild 9, med fyllnaden 50 % och hela rörelsen i bild. Uppmätt lägsta fyllnad är 61,0 %.
2. **Skuggorna** bakas per ruta i bild 9 och 11 (70 + 60 plattor) och per bild i övriga bilder. Varje figur har en kropp, ett huvud och nu två benfigurer i plattan, så att skuggan följer figuren. Golvutsnitt av bild 3, 4, 7, 8, 12 och 15a ligger i `slut/bilder/golv-*.png`. Ingen solstrimma löper från en tå mot kameran. I bild 3 och 7 syns små ljusa streck bakom fötterna, som går bort från kameran.
3. **kit.ts mot v6:** 55 rader tillagda och 8 borttagna (`slut/kit-ts-diff-mot-v6.txt`). Allt är godkänt:
   - tricornTrim, för texten i 10b;
   - pupillens halverade steg förbi näsan;
   - skäggöverlägget med manschett;
   - manschetten och farForeOver;
   - ärmränderna.
4. **Blinkningar över klipp** (de enda blinkningarna, ruta för ruta):
   - kaptenen 81, 192 och 363;
   - sjömannen 48 och 469;
   - pojken 141, 501 och 660.

   Sjömannens blinkningar vid 261 och 615 och kaptenens vid 561 är borttagna, eftersom de flimrade.
5. **15a:** grädden och skålen överlappar käkens kontur med cirka 20 px när sjömannen säger "Aye!". De ligger alltså inte helt utanför huvudets silhuett.
6. **Pupillen närmast näsan** är bild 4, ruta 180. Avståndet är 5,9 enheter i huvudets mått från pupillens kant till näsans tuschlinje, med en tydlig glipa. Bild: `v6c/bilder/pupill-bild4-ruta180-narmast-nasan.png`.
7. **Bild 9, lägsta ärmandel:** ruta 450 (bild 9, ruta 51), där 25 % av den bortre ärmen syns. Full storlek: `slut/bilder/bild9-armen-lagst-ruta450.png`, också i 360 px.
8. **Bild 11, sekund för sekund** (16,70–18,70 s):
   - **16,70–18,40:** kaptenen sjunker tillbaka ner på kistan efter den halva resningen. Övergången mjukas mot benlängden.
   - **16,72–17,40:** vänster näve slår ner mot bröstet.
   - **16,8–17,2:** höger näve går ut över bordet och tillbaka.
   - **17,50–18,25:** vänster näve går tillbaka till knät.
   - **18,20–18,55:** han blir nöjd med sig själv i ansiktet, med leende, ögonlock och blick.

   Längsta stillhet är cirka 0,15 s. Lyftet av näven mot axeln är borttaget med ditt ja.
9. **De två ställena nära gränsen klarar sig i hela filmen:** ruta 346 får 1994 (gräns 2000), och bild 11:s öga får högst 36 (gräns 40).

## Ändrat sedan v6 (0fd5dd8), i ordning

**Kontroller:**
- seam_check (ny), regel 16–19, 2b, 3 (grepp, bredd och bakgrund i hooken), 3b, 8 med hela huvudet (skägg och hatt) och 8b mot tangenter.
- 13b, hela hatten i hooken.
- Undantaget för 10b i regel 6.
- Regel 10 med ärmkontur och manschett (a)–(c).
- flicker2 med --start för korta renderingar.
- Djupkartan för hållna kameror räknas till kontrollens antal rutor.

**Sjömannens ätande:**
- Bettet sker vid munnens hörn.
- Armen är mänsklig enligt regel 16.
- Puddingen är en pudding i skål.
- Ränderna korsar inte varandra.

**Kaptenen:**
- Manschetter med guldkant.
- Den bortre underarmen över rocken i bild 11.
- Händerna i 2 och 15b vilar på knäna (ny kamera, 48°).
- Bild 9 är vriden 5° och näven ligger längs underarmen på bordet.
- Sätet mjukas mot benlängden.
- Skorna står inte på kistans lock.

**Hooken (H2, väg A2):**
- Sjömannen bär puddingen på vänster hand vid midjan, mot bordet.
- Kaptenen har händerna i knät, huvudet vänt mot kameran och blicken uppåt åt höger, och han nynnar.
- Sjömannen är fuskad 25 cm åt sidan och vriden 30°.

**Röstningen:**
- Pojken pekar ut åt dem han frågar, vevar upp med armbågen öppen och slår näven upp på ruta 690.
- Sjömannen säger "Aye!" med puddingen ute vid hakan.
- Bild 15b är kaptenen.

**Kameror:**
- Bild 2, 3, 7, 9, 11, 12, 13, 14, 15a och 15b är flyttade framåt till 60 % fyllnad.
- 10b är backad 1,5x, med texten på hattens kulle.
- Bild 2 och 15b har ny vinkel för loopen.

**Liv i stillastående bilder:**
- Pojken gnuggar händerna i bild 5.
- Sjömannen gungar när han tuggar i bild 4.
- Kaptenens läpp darrar i bild 15b.

**Ljud:**
- "aye-crew" ligger på 23,05 s.
- Ingen ting och ingen tugga på ruta 318.
- Ett sus på ruta 688.

**Flimmerrättelser efter r1–r3:**
- Pupillsteget i kit.ts.
- Bryn som inte passerar 0 inom en bild (2 och 7).
- Långsammare blickbyte i bild 7.
- Tre blinkningar borttagna.
- Knuffen i bild 2 är 3 % över 0,75 s.
- Ingen tom ruta mellan två ord.
- Pojkens pekande arm sjunker längs sidan.

## Bilder i `granskning/kaptenens-middag/v6c/slut/bilder/` (full storlek och -360)

- **Hooken:** ruta 0, 10, 30, 47 och loopens sista ruta 731.
- **Manschetten:** bild 2 (53, 65) och 15b (716, 728).
- **10b:** 470, 485 och 499.
- **Bild 11:** 505, 520, 535 och 550.
- **Röstningen:** 684, 689, 690 och 695.
- **Bild 14:** 662, 672 och 680.
- **Bild 9:s lägsta ärmandel:** ruta 450.
- **Golvutsnitt:** bild 3, 4, 7, 8, 12 och 15a.

## PSNR per bild mot v6 (`slut/psnr-mot-v6.txt`)

Medelvärdena ligger på 10,8–18,2 dB, utom bild 5 som ligger på 28,6 dB. Det betyder stora förändringar i alla bilder utom bild 5. Där är kameran och handlingen desamma, och det nya är att pojken gnuggar händerna.

## Min egen granskning

Jag har gått igenom filmen med 2 bilder per sekund (49 rutor). Jag hittade inget fel:
- hooken läses med puddingen först och den nynnande kaptenen sedan;
- "Hey!" i bild 2;
- ätandet vid munnens hörn i bild 4;
- resningen och slaget i bild 9;
- orden på hatten i 10b;
- bröstslaget i bild 11;
- röstningen i bild 14 och 15a;
- den sjunkande kaptenen i 15b och loopskarven.

# v6c, 27 nov: att göra (STOPP kl. 16:00, lägesrapport kl. 12:00)

Start kl. 07. Ett tungt jobb i taget. Varje kontroll ska ha v6:s rutor som planterat fel.

## 0. Sjömannens ätrörelse: först av allt

Jesper har sett v6: "Handrörelserna på han som äter kaptenens pudding ser konstiga och onormala ut." Punkten hör till regeln "Human bodies move like humans".

**Felen i v6:**
- **Bild 4 (cirka 4,0–6,0 s):** underarmen går diagonalt upp över bröstet utan synlig armbåge, som en vriden slang. Ränderna bildar ett nät, handen ser ut som en klo och armen ser ut att börja mitt på bröstet.
- **Cirka 11–13 s:** den andra armen sträcks över magen som en gummislang.

**Kontrollen kommer före rättelsen.** Den ska fälla v6:s rutor i bild 4 och vid 11–13 s som planterat fel.
- Armbågens vinkel och överarmens vinkel mot bålen ska ligga inom ledgränserna i Human bodies-regeln.
- Underarmen får inte korsa bålens mittlinje utan att armbågen syns.
- Ränderna får inte korsa sig själva.

**Rättelsen:**
- Han för puddingen till munnen med armen på samma sida.
- Armbågen syns och pekar nedåt eller utåt, och underarmen korsar inte bröstet.
- Ränderna följer ärmens riktning.
- Fingrarna syns runt puddingen.
- Huvudet lutar fram mot tuggan och käken rör sig.
- Ingen arm sträcks över kroppen om det inte är en verklig handling med synlig armbåge.

**STOPP:** stillbildsutsnitt av den nya ätrörelsen i full storlek och 360 px går till granskaren **innan** något renderas.

## 1. Kontroller som saknas

- **Punkt 4, ärmränderna som korsas:** v6 ruta 141–191 och 405 ska fälla. Kontrollen tas troligen samtidigt med punkt 0.
- **Punkt 9, ögonlocket som skär pupillen:** sjömannen på ruta 0 och 616–658, och pojken på 693–704.

## 2. Rättelserna i granskarens ordning

1. **Röstningen i 15a:**
   - Puddingen hålls framåt och utåt, bort från munnen och örat, och skålen eller formen ska synas.
   - Pojken tar sats över 6–8 rutor och slår på ruta 690.
   - Båda fyller minst 60 % av höjden.
2. **Bild 1, hooken:** tvåbild med sjömannen och kaptenen, och pojken fuskas ut. Greppet om puddingen ska läsas i 360 px. Loopsömmen ska ha minst 30° och 1,3x.
3. **Skägget:** seam_check ska ge 0, och skäggets tuschlinje ska vara hel mot rocken.
4. **Regel 8:** bild 9, 11 och 12.
5. **Ärmränderna:** bild 4 och 9.
6. **Händer utan arm** (regel 10):
   - kaptenen i bild 1, 2, 11 och 15b;
   - pojken i bild 1, 7 och 15a;
   - sjömannen i bild 1 och 9.
7. **Kaptenens säte i bild 2 och 15b:** skorna ska stå på golvet, inte på kistans lock.
8. **Puddingen och handleden:** "fågeln" i bild 4, "klumpen" i bild 13 och handleden i bild 6.
9. **Liv i stillastående bilder:** bild 5 (värst), bild 4 och bild 15b.
10. **Ögonlocken.**
11. **Bild 14:** pojken fyller minst 60 % och står mitt i eller på tredjedelslinjen, och gesten ska läsas.
12. **Texten:** fritt från huvuden, inom 15–85 % av höjden.
13. **Fyllnaden:**

    | Bild | Fyllnad i v6 | Krav |
    |---|---|---|
    | 1 | 40 % | 60 % |
    | 3 | 56 % | 60 % |
    | 7 | 51 % | 60 % |
    | 9 (resningsbilden) | 42 % | 50 %, hela rörelsen i bild |
    | 11 | 42 % | 60 % |
    | 14 | 51 % | 60 % |
    | 15a | 39 % | 60 % |

    Kontrolleras med `node scripts/dinner_v6_tune.mjs --audit`.

Bild 4 utgår från v6b (2b9c245), där flimret i ruta 177 är rättat.

## 3. Leveransen

- En rendering och alla kontroller, inklusive seam_check.
- De planterade felen, både de gamla och de nya.
- Min egen granskning med 2 bilder per sekund.
- Leveransen:
  - `kaptenens-middag-v6c.mp4` och `kaptenens-middag-v6c-telefon.mp4` (telefonkopian under 29 MB);
  - md5 och sha;
  - PSNR per bild mot v6;
  - utsnitt av 15a (ruta 684, 689, 690 och 695) och av bild 14, i full storlek och 360 px.
- STOPP:en ska namnge resningsbilden (bild 9, 50 %).

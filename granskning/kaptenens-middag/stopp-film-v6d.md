# Kaptenens middag v6d: film-STOPP, 29 nov

## Leveransen

| | Sökväg | Storlek | md5 |
|---|---|---|---|
| Film | `leverans/kaptenens-middag/kaptenens-middag-v6d.mp4` | 13,9 MB, 24,4 s, 1080 × 1920, 30 fps | 19add98a7b5518331a45e1024f11bda2 |
| Telefonkopia | `leverans/kaptenens-middag/kaptenens-middag-v6d-telefon.mp4` | 5,8 MB (under 29 MB) | 4d6f9b9816870d0cb8f78e5604a55722 |

- sha256 för båda filerna står i `leverans/kaptenens-middag/md5-v6d.txt`.
- Filmen är renderingen v6d-r2, gjord från commit 295c3d4. Loggarna heter `engine/out/din3d/v6d-r2-*.txt`.
- v6d-r1 levererades inte, eftersom flicker2 fällde den (skeden, se punkt 1). Varje fynd prövades med en kort rendering av samma ställe innan r2 gjordes.

## Kontrollerna på slutfilen (r2)

| Kontroll | Resultat |
|---|---|
| dinner_check (alla regler, även de nya 3c, 3d, 13c, 22, 22b och 23) | OK, 732 rutor |
| limb_check | OK |
| motion2 | PASS, 0 fel. Kroppsdel som mest 35,4 px per ruta, hastighetsändring 12,0, ansikte 4,3 |
| flicker2 | Bara loopskarven 731 → 0, som är ett klipp enligt beslutet. Bild som mest 1853 (gräns 2000), öga 35 (gräns 40), text 0 |
| seam_check | PASS, 0 |
| Djupkontrollen | OK. Båda planterade fel fäller |
| cheat_check | OK |
| Skedens egen rörelse i bild 4 | Som mest 29 px per ruta, fartändring som mest 8 |

**Planterade fel som fäller:**
- spoonNose: över näsan.
- spoonFar: mätt 30 px från mungipan.
- spoonGone: regel 22 i 102 rutor.
- spoonSwap: regel 22b. Ny: skeden står i puddingen i två rutor av bild 7.
- fistTurn: regel 21.
- capFlash: regel 6d.
- oldBlink: regel 18b.
- pudBeard och headTouch: regel 8.
- capOutD5: regel 10.

## Din v6c-lista, punkt för punkt (utsnitt i `granskning/kaptenens-middag/v6d/slut/utsnitt/`)

### 1. Bettet i bild 4: skeden (B′, godkänd som stillbilder i 2585c36)

- **Utsnitt:** `punkt1-bettet-v6c160-v6d179.png`, med v6c ruta 160 till vänster och v6d ruta 179 till höger.
- **Var skeden är:**
  - Hooken: den står i puddingen.
  - Bild 3: han håller den upp i vänsterhanden.
  - Bild 4: han doppar den i grädden på ruta 158–161 och biter på ruta 179. Tuggljudet ligger på 179. Sedan håller han den vid mungipan och tuggar till klippet.
  - Bild 7: han pekar med den.
  - Bild 8–15a: han har den i vänsterhanden.
  - Den byter plats bara i bild 2 och i loopen 15b → 1, där han inte syns.
- **Ändrat efter stillbilderna,** för att flicker2 fällde den långa skeden när den vreds snabbt i r1:
  - Den pekar mot grädden redan från klippet in i bild 4. I bild 3 vilar hans hand på boken, så handen byter ändå plats vid klippet.
  - Vägen till munnen tar 18 rutor.
  - Ingen sväng tillbaka efter bettet.
  - Tuschen är 2,2.
- **Mått:**
  - Bladet ligger högst 7 px från den främre mungipans tusch.
  - 0 punkter av bladet täcker munnen bortom den främre 35 %-delen.
  - 0 punkter av skeden ligger över ansiktet ovanför munnen, över näsan eller över ögonen.
  - Hela huvudet ligger minst 93 px inne i bilden.
- **Skedens längd per bild (puddingradier):**

  | Bild | Längd |
  |---|---|
  | 1 (hooken) | 3,00 synligt ovanför grädden. Under grädden ligger bladet, 0,84, och cirka 0,6 av skaftet |
  | 3, 4, 7, 8, 10b, 12, 13, 15a | 4,47 |

### 2. Körsbärsstjälken: oljelampans cylinder bakom puddingen i bild 1

- **Utsnitt:** `punkt2-hooken-ruta0-v6c-v6d.png`, med v6c till vänster och v6d till höger.
- Lampan är flyttad 22 cm i bild 1 (LAMP_CHEAT). Ingen svart pinne står längre över körsbäret.
- Det som nu står upp ur puddingen i hooken är skedens skaft, som granskaren redan har godkänt.

### 3. Pojkens näve 665 → 666

- **Utsnitt:** `punkt3-naven-v6c-665-666.png` (före) och `punkt3-naven-v6d-665-666.png` (efter). I v6d är näven densamma i båda rutorna.
- Rättat med BOY_HANDR 20.
- Ny regel 21: en ritad hand får flytta sig högst 40 px per ruta och högst 20 px mer än handleden. Det planterade felet fistTurn fäller.

### 4. Ord som visas en enda ruta vid ett klipp

- **Utsnitt:** `punkt4-orden-klipp-140-141`, `-468-469`, `-659-660` och `-614-615`, alla `-v6c-v6d-360.png`, med v6c två rutor och v6d två rutor. De övre delarna av v6d-rutorna finns också i full storlek, `punkt4-v6d-ruta*-ovre.png`.
- Ett ord som slutar inom 6 rutor efter ett klipp slutar nu vid klippet, och ett ord som börjar inom 6 rutor före ett klipp börjar vid klippet.
- Regel 6d: inget ord visas kortare än 6 rutor. Den kortaste visningen är 6 rutor, och det planterade felet capFlash fäller.
- "BAD JOB" vid 600 → 615 är granskad. I v6c stod ordet kvar en ruta på ett nytt ställe i bild 13 (ruta 615). I v6d står det i bild 12 och slutar vid klippet: ruta 614 har ordet och ruta 615 har det inte.

### 5. Bild 14 öppnar med stängda ögon

- **Utsnitt:** `punkt5-ogonen-v6c660-v6d660-662.png`. v6c på ruta 660 har stängda ögon. v6d har halvt lock (0,5) på 660–661 och öppna ögon från 662.
- Ny regel 18b: inget lock får vara mer än halvt stängt i en bilds tre första rutor. Det planterade felet oldBlink fäller.

### 6. Fyllnaden mätt på den ritade bilden

- **Tabell:** `granskning/kaptenens-middag/v6d/slut/fyllnad-ritad.md`. **Utsnitt:** `punkt6-fyllnad-bild12-ruta581.png`, med tuschens topp och botten markerade.
- **Så mäts det:** varje bilds egen figur ritas ensam, utan platta, text och rekvisita, varannan ruta. Toppen läses i huvudets egna kolumner. Botten är den lägsta raden med tusch.
- **Varför tunern och bilden skilde sig:**
  - Tunerns modell satte bandanans topp vid kronleden minus 40 enheter, vilket blev 64 px över den ritade bandanan.
  - Den satte fötterna vid tå och häl plus 4 enheter, vilket blev 21–31 px ovanför den ritade sulan.
  - För sjömannen gav det 2,2–2,8 procentenheter för högt. Kaptenens tricorne ritas högre än modellen.
- **Efter (minst i bilden, ritad):**

  | Bild | Fyllnad | Bild | Fyllnad |
  |---|---|---|---|
  | 1 | 60,2 % | 9 | 58,9 % (undantaget 50 % för resningen) |
  | 2 | 60,9 % | 11 | 69,2 % |
  | 3 | 60,7 % | 12 | 61,1 % (var 58,0) |
  | 4 | 79,5 % | 13 | 78,2 % |
  | 5 | 68,1 % | 14 | 61,4 % |
  | 7 | 60,4 % | 15a | 60,7 % |
  | 8 | 83,3 % | 15b | 60,5 % |

- **Kamerorna är flyttade framåt längs sin siktlinje.**
  - Bild 1 är också vriden 2° så att båda figurerna får plats.
  - Bild 2 och 15b har fortfarande samma kamera.
  - Bild 4 står 0,954 av sin skedplats, så att klippet 3 → 4 får 1,32x.
  - Klippen: 1 → 2 och 15b → 1 är 34° och 1,42x. 3 → 4 är 32° och 1,32x. 7 → 8 är 38° och 1,37x. 12 → 13 är 31° och 1,36x.
  - Plattorna är renderade om, och djupkontrollen är OK.
  - Pekarmen i bild 7 sänks nu över 1,3 s, eftersom motion2 fällde den efter den närmare kameran.

## 7. Kaptenens fötter: öppen fråga till Jesper

Fötterna hänger över golvet i bild 2, 9, 11 och 15b. De är lämnade som i v6c, och regel 2 är oförändrad. Frågan till Jesper: ska kaptenen sitta så att fötterna når golvet, med lägre säte eller längre ben, eller ska de få hänga som nu?

## Min egen granskning

- Jag har gått igenom filmen med 2 rutor per sekund (49 rutor) och hittade inget fel.
- Hooken visar puddingen med skeden och den nynnande kaptenen.
- Det jag gick igenom:
  - "Hey!" i bild 2;
  - skeden i handen i bild 3;
  - doppet och bettet vid mungipan i bild 4;
  - pekningen med skeden i bild 7;
  - resningen i bild 9;
  - orden på hatten i 10b;
  - bröstslaget i bild 11;
  - röstningen i bild 14 och 15a;
  - kaptenen i 15b och loopskarven.

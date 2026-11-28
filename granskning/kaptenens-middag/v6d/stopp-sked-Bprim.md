# Kaptenens middag v6d: stillbilds-STOPP för skeden B′, 28 nov

Ingen rendering är gjord. Bilderna ligger i `granskning/kaptenens-middag/v6d/sked-Bprim-stillbilder/`, i full storlek och i 360 px (`-360`). Där finns också `oversikt-360.png` och grepparket (`greppark-nara.png` med rutorna 160, 174 och 191, och `greppark-360.png`).

## Skeden, bild för bild

| Bild | Skeden |
|---|---|
| 1 (hooken) | Står i puddingen, 15° bort från hans huvud. |
| 2 | Han syns inte. Han tar skeden i vänsterhanden här. |
| 3 | Han håller den upp i vänsterhanden, 15° utåt. |
| 4 | Se tiderna nedan. |
| 5 | Han syns inte. Skeden stannar i handen. |
| 7 | Han pekar med den på "AT HIM", och skeden följer underarmens linje. |
| 8, 10b, 12, 13 och 15a | Han håller den upp i vänsterhanden, även vid "Aye!" i 15a. |
| 15b → 1 (loopen) | Han syns inte. Skeden går tillbaka i puddingen. |

**Tiderna i bild 4:**

| Rutor | Vad som händer |
|---|---|
| 141–158 | Handen kommer upp från sidan. Skeden vrids ner mot grädden. |
| 158–162 | Bladet är i grädden. |
| 162–174 | Bladet förs med en sked grädde till munnen. |
| 174 | Kontakten. Tuggljudet ligger på ruta 174. Det är lokalt ljud och har gjorts om. |
| 174–178 | Bladet hålls vid mungipan. |
| 178–191 | Skeden förs ner från munnen och tippas tillbaka mot puddingen, redo för nästa sked. |

Kontakten flyttades från 175 till 174 för att rörelsen skulle hinna inom gränserna. Ruta 175 finns ändå med bland bilderna.

## Dina villkor

1. **Huvudet i bild 4 vid bettet:** han lutar sig fram 5° och nickar 10°. Hela huvudet med bandanan ligger minst 116 px inne i bilden (ny regel 13c, minst 20 px). Kameran är oförändrad, med fyllnaden 79 %.
2. **Bladet vid munnen:**
   - Kanten ligger högst 8 px från den främre mungipans tusch.
   - Det täcker 0 punkter av munnen bortom den främre 35 %-delen.
   - Inget av skeden ligger ovanför munnen, varken över kind, öga eller näsa (ny regel 3d, 0 punkter).
   - Ingen del av pudding, händer eller sked ligger över näsan.
3. **Regel 16, regel 21 och limb_check:** 0 i bild 4.
   - Mellanposerna mellan nyckelposerna dopp, bett och vila tas i den leddordning som håller varje mellanpose inom regel 16.
   - motion2 ger 0 fel. Vänsterhanden rör sig som mest 39,0 px per ruta (gränsen är 40).
   - Skedens egen rörelse är som mest 39 px per ruta, och fartändringen som mest 12.
   - Planterade fel:
     - spoonNose: 984 punkter över näsan.
     - spoonFar: mätt 30 px.
     - spoonGone: regel 22, 102 rutor.
     - **spoonSwap (ny):** skeden står i puddingen i två rutor av bild 7. Regel 22b fäller, eftersom skeden byter plats i bilden.
   - De gamla fäller också: fistTurn, capFlash och oldBlink.
4. **Kanten och andra huvuden (ny regel 23):**
   - Skeden är hel i bild, utom i bild 7 där bara bladet får gå utanför kanten när han pekar.
   - Den ligger aldrig över någon annans huvud, inte heller pojkens i bild 3: 0 fel.
   - I 10b är sjömannen och skeden helt utanför bild.
5. **Samma sked överallt:**
   - I handen är skeden 4,47 radier, från skaftets ände till bladets spets, i bild 3, 4, 7, 8, 10b, 12, 13 och 15a.
   - I hooken syns 3,00 radier av skaftet ovanför grädden. Resten ligger under grädden: bladet, som är 0,84, och cirka 0,6 av skaftet.
   - Formen är densamma i alla bilder: ett platt skaft som vidgas mot en rundad ände och ett blad som är 0,84 × 0,56 radier.
6. **Rutorna:** 0, 81, 140, 141, 160, 174 (kontakten), 175, 191, 290 (pekningen), 600 och 700.

## Kontrollerna nu

| Kontroll | Resultat |
|---|---|
| dinner_check | OK, 732 rutor |
| limb_check | OK |
| motion2 | 0 fel |

Kvar före rendering: punkt 6 (fyllnaden på den ritade bilden).

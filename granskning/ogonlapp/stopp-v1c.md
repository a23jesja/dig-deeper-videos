# STOPP: The Pirate Eye Patch Trick, v1c (20 november 2026)

**Kod:** commit 68381e9 (`engine/src/craft/shorts/eyePatch.ts`). Rösten (bm_george) och manuset är oförändrade.

## Filer (`C:\Users\sweje\dig-deeper-videos\leverans\eye-patch\`)

FILER

Granskningsmaterial (`C:\Users\sweje\dig-deeper-videos\granskning\ogonlapp\`):
- `v1c-sek0-5-10fps.jpg` (sek. 0–5 i 10 bilder/s, mobilstorlek);
- `v1c-4fps.jpg` (hela filmen i 4 bilder/s).

## De elva punkterna

1. **Mörkt under däck.** Fönsterluckorna är stängda i alla hyttbilder, och det enda ljuset är lyktan på bordet.
   - En mörk ton ligger över bilden.
   - Figurerna får varmt nyckelljus från lyktans sida, ett tunt kantljus och en svag kall fyllning från rummets öppna sida, så att ansiktena går att läsa på mobilen.
   - Öppningen och slutet är något ljusare än resten.
2. **Lappbytet visas med två närbilder.**
   - Närbild på däck (15,6–17,1 s): lappen på hans högra öga.
   - Ett svisch (whoosh) och en närbild i mörkret (17,1–19,4 s): lappen på hans vänstra öga och en stor pupill i det högra (ny parameter, `face.pupil`).
   - "Flip the patch, and you can see" ligger på den mörka närbilden.
   - Ingen hand rör lappen.
3. **Boken.**
   - Det är en riktig uppslagen bok: två sidhalvor i ett V, ryggen i mitten, en tjocklek av blad och läderpärm.
   - Greppet är 04:s, med tummarna över sidorna och fingrarna bakom. Det är samma bok i alla bilder, också på däck, där han läser i solen.
   - Kistan är borta, och sittbilden också. Boken försvinner aldrig mellan två bilder.
4. **Kamraten famlar.**
   - Han kisar, rynkar ögonbrynen, har en nedåtböjd mun och blicken söker åt sidorna.
   - Huvudet vrids, ena handen känner framåt i brösthöjd och den andra är nära bröstet, med avslappnade fingrar. Han står vriden mot profil, så inga handflator är mot linsen.
   - Han syns i fem bilder med fem olika vinklar och storlekar, varav en är närbilden med bubblan.
5. **Ingen bild över 2,5 s.** Filmen har nu 19 bilder och växlar mellan piraten som läser, kamraten och däcket. Det nya still-testet ger 0 fel.
6. **Inga hoppklipp.** Varje klipp byter person, plats, storlek eller vinkel. Det nya jump-testet ger 0 fel, och boken försvinner inte längre.
7. **Pallen bakom ryggen** finns inte längre, eftersom han inte sitter. Det nya testet för en platt sak nära bakom kroppen ger 0 fel.
8. **Skon i kanten.** Edge-testet byggde figurens låda av lederna, och den slutade vid fotleden, så tån räknades inte. Nu räknas hälar och tår. Testet hittade genast två skor i kanten i v1c-bygget, och båda är rättade.
9. **Väggbilden** är ritad som träsnitt:
   - tre pirater med tricornhattar, långa rockar, bälten, skägg eller mustasch och upplyfta sablar;
   - båda ögonen syns på alla tre;
   - i bakgrunden ett skepp under segel, ett streckat hav och en himmel;
   - ingen text.

   Den hänger i mörkret och lyses av lyktan. Skuggbandet kom av dagsljuset, som nu är stängt ute. Lyktblocket i hörnet är borta, eftersom kameran står rakt framför bilden.
10. **Loopen.** Sista bilden är samma mörka hyttbild som den första, med bubblan "Arr. Which eye was it?".
11. **Kroken.** I första rutan läser piraten lugnt i mörkret medan kamraten famlar bakom honom, och ett knarr ligger på ruta 1. Förslag på insatsord finns i ett separat meddelande. hookscore ger 36 för nuvarande rad och 40 för "One idea: so they never fought blind."

**Det mindre:**
- Flaggan sitter lägre på sin stång, så att den flyger hel under texten.
- Luckan längst ner till höger på däck syns inte längre: däckbilden är tippad 4° uppåt och figurerna står ett halvt steg längre bort.

## De fem missade testerna, nu byggda och bevisade

| Test | Vad det fäller | Planterat fall som fälls | Kontroll som klarar |
|---|---|---|---|
| fötter i edge-testet | en sko utanför bildkanten | BA, ett långt kliv där bara främre skon går över kanten | BB |
| through2 (bodyCheck) | en platt eller liggande sak högst 35 cm bakom kroppen i höft- eller brösthöjd, synlig på båda sidor | AY, en bräda 25 cm bakom höfterna | AZ, samma bräda 1,2 m bakom |
| jumpcut | samma figur före och efter ett klipp, lika stor (inom 20 %), på samma plats och med linsen vriden under 15° | C1-b i filmen proof-cuts | C2-b, närbild efter vid bild |
| still | 2,5 s där ingen led eller öga rör sig mer än 2 % av höjden och linsen nästan står still | C3 (3 s, ingenting rör sig) | C4, huvudet vrids. Testet läser därför också ögonen: ett huvud som vrids flyttar ögonen men inte lederna. |
| twice | två bilder som inte ligger intill varandra, med samma figurer på samma platser och linsen inom 35 cm och 12°. Sista bilden får vara den första igen, för loopens skull. | C5-z | C6 |

Testfilmer med fristående fall (beviset, biblioteket och huvudbladen) är märkta `cases`, så att tester som läser över klipp lämnar dem i fred.

Utskrifter (`C:\Users\sweje\dig-deeper-videos\granskning\ogonlapp\`):
- `proof-cuts-motion.txt`: exakt de tre planterade felen.
- `proof-motion-v1c.txt` och `proof-body-v1c.txt`: alla planterade fall A–BA fälls, och kontrollerna klarar sig.

## Testerna på v1c (hela filmen, varje ruta)

| Test | Resultat |
|---|---|
| film check | OK, 19 bilder, 35,6 s (`check-v1c.txt`) |
| motion, med alla nya tester | 0 fel |
| body, med sak mot fast sak och platt sak bakom | 0 fel |
| grips | OK, 679 avläsningar |
| QA | QA |

## Min egen granskning

Jag har gått igenom stillbilder av alla 19 bilder och närbilderna i full storlek:
- ansiktena i mörkret;
- pupillen och lappen i flip;
- boken;
- kamratens händer;
- väggbilden;
- att luckan är borta.

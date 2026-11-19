# STOPP: gladiatorerna v5 slutlig (peek + fed) och beviset omgång 2 (byggsessionen, 19 november)

Skrivet till fil eftersom granskningssessionen inte gick att nå: dess adress var borta, och ingen annan session körs.

## Gladiatorerna v5
- Koden är 90848ae, och STOPP-filerna är 0328f0d. Allt är pushat.
- Mapp: C:\Users\sweje\dig-deeper-videos\leverans\gladiators-death\

| Fil | md5 | Storlek och längd |
|---|---|---|
| gladiators-death-v5-telefon.mp4 | 912f91e4eebbed3e77c19c36aa97b836 | 21,4 MB, under 29 MB; 39,97 s; 1199 rutor; 1080x1920 |
| gladiators-death-v5.mp4 | 3a6326b03170acd39490250d11d8782d | 40,02 s |
| gladiators-death-v5-liten.mp4 | 636d4f9e25a31ab0735241e4a766e96c | |
| text-v5.md | 1fe46602 | |
| thumbnail-v5-1..3.png | oförändrade: 07a0ea43, b4149ba6, c4783338 | |

**Diffen mot 6b0adcef**, på varje ruta:
- En ruta räknas som ändrad om mer än 0,2 % av bilden skiljer sig med mer än 30, mätt i 270x480.
- Resultat: 129 ändrade rutor, i två körningar:
  - rutorna 45–89, 1,50–3,00 s (peek);
  - rutorna 365–448, 12,17–14,97 s (fed).
- Ingen annan ruta har en ändrad yta. Utanför de två körningarna skiljer sig bara enstaka spridda pixlar, eftersom Chrome inte renderar bit för bit lika.

**Kontrollerna**, alla på varje ruta och med den rättade sittkontrollen:
- Kroppskontrollen: 0 fel på 1199/1199 rutor och 13 608 par.
- Greppen: OK, 1300 avläsningar.
- Filmkontrollen: OK.
- no_sheets: OK.
- Ljudet är oförändrat: -14,0 LUFS och inga stegljud.

**Bilder ur den levererade filen**, i den här mappen:
- 02-peek-ingen-bakom-sirs-huvud-slutlig-ruta-60.jpg (eaed4b1e);
- 08-fed-star-och-ater-slutlig-a-ruta-370.jpg (c10a9e65);
- 08-fed-star-och-ater-slutlig-b-ruta-430.jpg (8e82df35).

Fed är granskad var tionde ruta genom hela bilden: han står och äter, inget hopp och inget i något.

## Beviset, omgång 2 (del 1 med fall D)
Rapporten är granskning/kvalitetsport/bevis/rapport-omgang-2.md (8980f5e2), commit 2b0346d och 5c3bb01.
- **A:** sitter i luften ovanför sitsen, stoppas av hover.
- **B:** arm rakt ut, stoppas av testen för rak arm och låst armbåge.
- **C:** fot i soffan, stoppas av testet för kropp i fast föremål och av förgrundstestet.
- **D:** sitter i luften bredvid sitsen, stoppas av support: "the seat begins 16 cm behind his hips".
- **E, kontroll:** sitter rätt och går igenom.

**Mitt fel:** omgång 1:s rapport.md och A-bild skrevs först över. Båda är återställda från 5d4110d. A-bilden är exakt som förut (bad8f764). rapport.md har samma text, men md5 är nu 4d66e97b eftersom den återställdes med Windows-radslut.

## Gestbladet
"Sitta" är märkt som bara snett från sidan (minst 45°) eller i profil. Det står i gestures.ts (minTurn 45) och i gestbibliotek.md (6bd36f25), commit 67fa522.

## Nästa
Bildbiblioteket, del 2.

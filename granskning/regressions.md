# Regressions: impossible things found after a review

Enligt "Impossible things: zero tolerance" i DAILY-RULES.md (Jesper 18 november 2026). Här står varje fel som Jesper eller en session har hittat efter en granskning, med video, tid och vad som var fel. Listan växer och krymper aldrig. Varje ny video kontrolleras mot hela listan innan den skickas, och varje rad som går att kontrollera med kod får en kodkontroll.

| # | Video | Tid (s) | Vad som var fel | Hittat av | Typ (listan i regeln) | Kodkontroll |
|---|---|---|---|---|---|---|
| 1 | Nero v2 | 2,6–5 | En gammal kvinna och en skäggig man står inne i det grå stenblocket, mannen går rakt igenom det. | Jesper | 1 | kropp mot fast föremål, varje ruta |
| 2 | Nero v2 | 7,0–9,3 | Tacitus skriver, och hans skrivhand går igenom pappret: knytnävens överdel ligger bakom rullens stav och nederdelen framför arket. | Jesper | 1, 4 | hand mot rulle/ark, varje ruta |
| 3 | Nero v2 | 9,9–11,3 | Budbäraren går fram och ställer sig mitt i skylstolpen. Stolpen går upp genom huvudet och ned mellan benen. | granskaren (efter Jesper) | 1 | kropp mot stolpe, varje ruta |
| 4 | Nero v2 | 12,6–13,4 | Pojkens huvud ligger över ansiktet på mannen bakom honom. | granskaren | 5, 6 | ansikte bakom annan figur |
| 5 | Nero v2 | 18,7–20,2 | Kvinnan viskar, och hennes huvud ligger över och i den skäggiges ansikte. | granskaren | 5 | två figurer i samma rum |
| 6 | Svarta flaggan v6 | 26,2–26,5 | Mannen i gul rock står inne i en tunna. | granskaren | 1 | kropp mot tunna |
| 7 | Svarta flaggan v6 | 26,7 | Samma man blir halvgenomskinlig, och den skäggiges huvud går in i hans ansikte. | granskaren | 3, 5 | genomskinlighet, två figurer i samma rum |
| 8 | Svarta flaggan v6 | 28,3–29,3 | Luntstången går tvärs över männen i vita skjortor. | granskaren | 1 | hållen sak mot annan kropp |
| 9 | Blackbeard v3 | 6,3–8,8 | Blackbeard står inne i pallen, med benen mellan pallens ben. | granskaren | 1 | kropp mot pall |
| 10 | Blackbeard v3 | 18,0–19,0 | Stickan som pojken sänker går över Blackbeards ben. | granskaren | 1 | hållen sak mot annan kropp |
| 11 | Gladiatorerna v3 | 28–31,3 | Klingan i handen mellan de två som går ut ligger över nätkämpens ben och höft. | granskaren | 1 | hållen sak mot annan kropp |
| 12 | Gladiatorerna v4, öppning a omgång 2 | 0,30–0,45 | Murmillons svärdshand sitter framför skölden med armen bakom, alltså genom skölden. Rättat i omgång 3. | granskaren | 1 | arm mot sköld |
| 13 | Gladiatorerna v1 | 25,6–26,9 | Givarens duk var lösa remsor som hängde bredvid handen. Rättat i v3. | granskaren | 4 | hållen sak sitter i handen |

## Kodkontrollen mot listan (18 november, kroppskontrollen `film_info.mjs <film> body`)
Kontrollen körd på de levererade filernas kod (9eeae2b; öppning a omgång 2 på 5f36d8a). Utskriften rad för rad finns i `granskning/body-check/`, med en tabell i README.md där.
- Hittas av koden: rad 1, 2, 3, 4, 5, 6, 7 (huvudet i ansiktet; genomskinligheten har ännu ingen kodkontroll), 8, 9, 10, 11 och 12.
- Har ingen kodkontroll: rad 13 (duken som lösa remsor), som är ett fel i hur saken ser ut i handen och inte ett kroppsfel.

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
| 14 | Gladiatorerna v4, öppning a omgång 3 (212709ce, godkänd av granskaren) | 0,33–1,10 | Murmillons svärdshand ligger på sköldens framsida, men klingan reser sig bakom sköldens överkant. Svärdet går alltså igenom skölden, tydligast vid 1,05 s. Granskaren såg bara 0–0,6 s ruta för ruta. | byggsessionens kroppskontroll | 1 | hand framför och klinga bakom samma sköld |
| 15 | Nero v3 (9054d01a) | 11,4–15,4 | Mannen i vit tunika håller säcken framför ansiktet genom hela bilden, så att huvudet aldrig syns. | granskaren | 6 | egen hållen sak över eget ansikte |
| 16 | Nero v3 (9054d01a) | 23,6 | Stråkens spets ligger inne i Sirs överarm när han tar fiolen. Det går inte att avgöra framför eller inne, så det underkänns. | granskaren | 1, 5 | hållen sak mot annans arm |
| 17 | Blackbeard v4 (8b70f500) | 7,5–8,8 | Blackbeards öppna hand kommer ned på pojkens knytnäve vid brickans hörn. Näven ligger över hans handflata, två händer på samma ställe. | granskaren | 5 | två händer från olika figurer över varandra |
| 18 | Blackbeard v4 (8b70f500) | 25,7–27,2 | Blackbeards hattbrätte i förgrunden täcker kockens upplyfta arm och hörnet av hans huvud. | granskaren | 6 | förgrund över en bakgrundsfigurs arm eller huvud |
| 19 | Blackbeard v1–v4 | 3,9–6,4 | Tunnan i förgrunden täcker Sirs högra ben och halva rocken, inom de första fem sekunderna (Jespers regel 1, 18 november). | granskaren | 6 | föremål i förgrunden över en figur |
| 20 | Blackbeard v4 (90620c7e) | 27,7–32,4 | Sjömannens vänstra hand gömd bakom läsarens knytnäve vid bokens kant; hans ärm slutar i läsarens näve, en näve för två armar | byggsessionens test (g) | 5 | två händer från olika figurer över varandra |

## Kodkontrollen mot listan (18 november, kroppskontrollen `film_info.mjs <film> body`)
Kontrollen körd på de levererade filernas kod (9eeae2b; öppning a omgång 2 på 5f36d8a). Utskriften rad för rad finns i `granskning/body-check/`, med en tabell i README.md där.
- Hittas av koden: rad 1, 2, 3, 4, 5, 6, 7 (huvudet i ansiktet; genomskinligheten har ännu ingen kodkontroll), 8, 9, 10, 11 och 12.
- Har ingen kodkontroll: rad 13 (duken som lösa remsor), som är ett fel i hur saken ser ut i handen och inte ett kroppsfel.

# Knädrapét: bladet (20 november)

Granskaren skrev 19 november: "Visa Sir i rock och en figur i dräkt som sitter, både framifrån och från sidan. E ska gå igenom, och ett planterat fel med dräkten genom sitsen ska stoppas."

## Vad som är byggt

**Ritningen** (designs/common.ts `frame`, cast.ts):
- När figuren sitter läggs plagget nedanför midjan över knät:
  - En punkt under bäckenet läggs längs låren, lika förkortad som låren ritas, och efter knät nedför smalbenen.
  - Tidigare hängde punkten längs ryggraden.
- Tyget på knät är lika tjockt som låret, med tyget ovanpå knät och på sitsen under.
- Hur mycket figuren sitter mäts på det lägre av de två låren. Raden går från 0 vid 35 graders lyft till 1 vid 75 grader.
- Därför ändras inte stående, gående och knästående figurer. Vid knästående står ett lår rakt ner.
- `drape: false` ritar som förut. Det används bara för de planterade felen.

**Dräkttestet** i kroppskontrollen (bodyCheck.ts) lägger dräkten på samma sätt:
- längs de verkliga låren och smalbenen;
- med tyget lårtjockt;
- inblandat i samma grad som ritningen.

## Utfall i proof-faults

Kod i commiten efter 577ef12. Körning: `film_info proof-faults body`.

| Fall | Vad | Utfall |
|---|---|---|
| E | Sir i rock sitter rätt, tre kvart (55 grader), drapé på | **går igenom**. I omgång 2 och 3 underkändes den med "robe 6 cm in". |
| K | samma som E med drapé av: rockskörten rakt ner genom sitsen | **STOPPAS**: "sir's robe (the garment below his waist, down to its hem) goes through a box ... 6 cm in" |
| L | läkarens långa dräkt, sitter rätt, tre kvart, drapé på | **går igenom** |
| M | samma som L med drapé av: dräkten rakt ner genom sitsen, läkaren i gladiatorerna v5 | **STOPPAS**: "doc's robe ... goes through a box ... 19 cm in" |
| N | Sir i rock i profil, drapé på | **går igenom** |
| O | läkarens dräkt i profil, drapé på | **går igenom** |

Fall A–D och F–J är oförändrade. D stoppas nu bara av stödtestet ("the seat begins 16 cm behind his hips"). Dräkttestets rad på D föll bort, eftersom rocken nu ligger på knät.

## Bilder (helstorlek)

| Fil | md5 |
|---|---|
| E-kontroll-sir-rock-tre-kvart-ruta-270.jpg | 5d67cf993d7022803bd13b1c5170f52d |
| K-planterat-fel-rocken-genom-sitsen-ruta-630.jpg | 8802ba4f4ea6340f9b5086d10b3a5c96 |
| L-kontroll-lakarens-drakt-tre-kvart-ruta-690.jpg | c03d55e5f103da9dd8fa131592163164 |
| M-planterat-fel-drakten-genom-sitsen-ruta-750.jpg | 2edb52f4bfa134deb5519a79076b1b0a |
| N-kontroll-sir-rock-profil-ruta-810.jpg | 01edbaefbbf3f5f052c54994536f6f56 |
| O-kontroll-drakt-profil-ruta-870.jpg | 7910855da04b610a37b1f24f19ee41ef |
| blad-E-K-L-M-N-O.jpg (alla sex bredvid varandra) | 159e6dcd0f7461bee2b4e4791246b853 |

## Framifrån

Bladet visar tre kvart (55 grader) och profil, inte rakt framifrån. Ett kort som sitter och ses rakt framifrån har smalbenen hängande rakt under höfterna. Ingen sits får då plats under höfterna utan att smalbenen går in i den. Det var granskarens egen slutsats 19 november, och sedan dess får sitta bara visas från 45 grader och mer (gestures.ts `minTurn`). 55 grader är alltså det mest framifrån som en sittande figur får visas.

## Att titta på

- **L:** dräkten ligger över låren och faller över knät ner mot vaden. Säg om fallet framför smalbenen ser ut som tyg.
- **E och N:** Sirs kavaj är kort. Skörtet ligger bara som en kant över låren och stjärten.

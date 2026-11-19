# Gladiatorerna v5: anteckning per bild (byggsessionen, 19 november)

**Koden** är commit 948170e. Rösten, berättelsen, tiderna och texterna är desamma som i v4c. Ändringarna följer Jespers lista: gestbiblioteket, inga tvåkroppshandlingar, dagsljuset på figurerna och inga stegljud.

**Kontrollerna**, på varje ruta (1199 av 1199):

| Kontroll | Resultat |
|---|---|
| Kroppskontrollen: ledgränserna, människotesten, damm och ljus över ansikten, sitta i luften | 0 fel |
| Greppgranskningen (1300 avläsningar) | 0 fel |
| Filmkontrollen, inklusive att inga stegljud är schemalagda | OK |

| # | Tid (s) | Bild | Det som ändrades i v5 |
|---|---|---|---|
| 1 | 0–1,5 | hook | Oförändrad. Publiken klappar nu med armbågarna nere: förut ritades klappet som en näve tvärs över bröstet. |
| 2 | 1,5–3,0 | peek | Oförändrad. |
| 3 | 3,0–5,3 | guess | Sir förklarar med öppna händer, bibliotekets förklara. Förut gick handen mot hans mage. |
| 4 | 5,3–6,5 | not | Kvinnan står med armarna i kors och svarar sedan med en lugn öppen hand i brösthöjd. Sir lyssnar med armarna i kors. Oliverna är borta. De nämns varken i rösten eller i texterna. |
| 5 | 6,5–8,7 | nine | Ingen hand på någons axel. Den trötte går bredvid den andre med huvudet nere. |
| 6 | 8,7–10,9 | carried | Oförändrad. Bärningen är en sak, inte två kroppar som ska passa ihop. |
| 7 | 10,9–12,2 | trained | Eleven håller övningssvärdet nedåt med böjd armbåge, och tränaren pekar. Övningssvärdet har fått gladiussvärdets sänkta grepp. |
| 8 | 12,2–15,0 | fed | Bandaget sitter redan på armen, som resultat. Gladiatorn äter med skålen nära munnen, och den bandagerade armen vilar på knät. Läkaren sitter på sin pall och rullar sitt bandage tätt intill kroppen. |
| 9 | 15,0–17,4 | coins | Oförändrad. |
| 10 | 17,4–20,4 | owner | Oförändrad. |
| 11 | 20,4–22,6 | rules | Domaren håller staven i en hand mot axeln, bibliotekets stav mot axeln. |
| 12 | 22,6–25,6 | finger | Den besegrade är nere på ett knä med ena handen i marken och höjer fingret. Förut satt han på huk på ingenting. |
| 13 | 25,6–26,9 | sponsor | Oförändrad. |
| 14 | 26,9–28,0 | pull | Han reser sig själv från knät, och murmillon står bredvid med tomma händer och nickar. Ingen drar upp honom. |
| 15 | 28,0–31,6 | out | De två går ut sida vid sida med fria händer. Ingen hand på axeln. |
| 16 | 31,6–33,7 | doctor | Läkaren står nöjd bakom sitt bord med armarna i kors. Förut sträckte han armarna över bordet mot linsen. |
| 17 | 33,7–36,8 | patients | Mannen i mitten står stolt med armarna i kors, och de två yttre spänner musklerna utåt. |
| 18 | 36,8–39,0 | relax | Hon rycker på axlarna, och han lyssnar med armarna i kors. Vid smällen far hans händer upp bredvid huvudet. |
| 19 | 39,0–40,0 | loop | Som hook. |

**Ändringar i den gemensamma koden:**
- gestures.ts: `upper()` och knäböjningen för filmer. En Mover tar de ben en handling nämner som fria ben.
- Arenapubliken klappar med armbågarna nere.
- Övningssvärdet har ett sänkt grepp.
- Kroppskontrollen: den som sitter mer än 20 cm ovanför sitsen sitter i luften.

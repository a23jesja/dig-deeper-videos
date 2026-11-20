# Ögonlappen v1r: inte rent efter tre varv (20 november 2026)

Granskaren sa: "Om det inte är rent efter tre varv: stoppa och skriv till mig." Det här är det meddelandet. Granskarsessionen var inte igång när jag skulle skicka det, så det ligger här.

Inget har gått till `leverans/` eller till Jesper. Allt är pushat (ba849c6).

## Regeln som den körs nu (`engine/scripts/flicker.py`)

- **Flimmer:** en pixel räknas om den skiljer sig med mer än 40 från både rutan före och rutan efter, medan de två skiljer sig med mindre än 16.
- **Rörelse som tas bort:** det finns steg v0 och v1 på högst 12 px där 5×5-rutan stämmer, med medelskillnad under 14 gråtoner.
  - v0 och v1 pekar åt samma håll (v0·v1 > 0).
  - Skillnaden mellan dem är högst 0,25 av det längre steget, eller 2 px.
  - Rutan får inte vara jämn: gråtonerna ska variera med minst 10.
- **Klipp:** rutor intill ett klipp jämförs inte över klippet.
- **Gränser:** 2000 pixlar i bilden, 40 i ett öga (fast) och 150 i en text.

## Animationen, tre varv

- **Varv 1, 28 rutor kvar:**
  - Blinkningen håller varje steg i två rutor: halvt, halvt, stängt, stängt, halvt, halvt. Med en enda halvrutt låg närbildens stängda båge där pupillen varit, och rutan skilde sig från båda grannarna.
  - Vridningarna är lugnare.
- **Varv 2, 11 rutor kvar:**
  - Jag hade blandat ihop läslagren, så att svepet längs raden blev det korta. Det är rättat.
  - Kamratens snubbel är mindre.
- **Varv 3, 13 rutor kvar:**
  - Snubblet och återhämtningen är långsammare, uppblicken i närbild tar 1,0 s och kamratens svep är 0,16.
  - Loopen tonas över 0,8 s.

Efter varv 3:
- De kvarvarande rutorna ligger på 41–133 pixlar, alla i ögon: 1,3–1,9 s, 9,6 s, 16,9 s, 21,7 s, 23,6 s och 35,6–35,7 s.
- Hela bilden, undertexterna och bubblorna är rena.
- Skarven: 3,5 %, mot 4,6 % för vanliga rutbyten.
- Filmkontrollen (kropp, rörelse, stillhet och skarv) ger 0 fel.

Rapporten ligger i `flimmer-v1r-kandidat.txt`.

## v1q

- 136 rutor fälls med korrigerat mått och 262 med det råa.
- Skarven: 10,3 %.

Rapporten ligger i `flimmer-v1q.txt`.

## Bevisfallen på v1r (`flimmer-bevis-v1r.txt`)

Inte alla blev rätt.

**Rätt:**
- (a), (b), (d), (e) och (g) fälls.
- (h2)–(h6) fälls:
  - 3 px på en rörelse om 3 px;
  - 2 och 3 px på 6 px;
  - 2 och 3 px på 9 px.
- (f2b), en vridning från 7 till 14 px, fälls. Det ska den, eftersom 13 och 14 px går över 12 px-steget.

**Fel:**
- **(c), 3 px i närbild, godkänns.** På den rutan (10,23 s, kamratens mörka närbild) ser inte ens det råa måttet något. Det är mitt planterade fall som hamnade på en jämn, mörk yta, inte regeln som släppte igenom det.
- **(h1), 2 px på en rörelse om 3 px, godkänns.** Det råa måttet fäller det. Här släpper regeln igenom ett riktigt fel: hoppet ger stegen 5 och 1, och skillnaden 4 är för liten jämfört med gränsen.
- **(f), jämn glidning 5 px, och (f2), 6→12 px, fälls**, fast de ska godkännas. En del beror på mitt bevis: glidningen ligger över en undertext som byter ord, och över figurer som själva rör sig. Men åtstramningen till 0,25 gör också regeln stramare än vanlig rörelse tål.

## Min bedömning

En regel som tittar på tre rutor åt gången kan inte både godkänna en vridning där ögat ändrar form och fälla ett hopp på 2 px ovanpå en rörelse.

Det jag ser i full storlek i v1r:s 13 rutor är jämn rörelse, inte flimmer. Det är ändå inte jag som ska avgöra det.

## Det Jesper kan välja mellan

1. **Jespers ögon och kroppskontrollen avgör v1r-kandidaten.** Jag gör telefonkopian och lägger alla flaggade rutor som utsnitt i full storlek i STOPP:en. Granskaren och den oberoende granskaren tittar på dem.
2. **En strängare film.** Nästan inga huvudvridningar i bild, alltså stelare figurer. Det krockar med stillhetstestet och med regeln om action i stället för porträtt.
3. **Det råa måttet**, utan rörelsekorrigering, men med de lugnade rörelserna. Då fälls v1r på cirka 200 rutor, mest vanlig rörelse.

Jag rör ingenting förrän granskaren eller Jesper svarar.

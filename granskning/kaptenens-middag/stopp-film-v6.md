# Kaptenens middag v6: film-STOPP, 26 nov kl. 19:55

## Leveransen

| | Sökväg | Storlek | md5 |
|---|---|---|---|
| Film | `leverans/kaptenens-middag/kaptenens-middag-v6.mp4` | 13,3 MB, 24,2 s | 837784f4b075a57348ecbfa5bfec3447 |
| Telefonkopia | `leverans/kaptenens-middag/kaptenens-middag-v6-telefon.mp4` | 5,0 MB | 8796c905e3a94afd26754737aaa7a176 |

Mätloggar ligger i `granskning/kaptenens-middag/v6/kaptenens-middag-v6-final-*.txt`. Commit-sha står i meddelandet till granskaren.

- **Byggtid:** från figurarket (c01aaf4, 25 nov 07:47) till denna STOPP cirka 36 h.
- **Granskningsrundor:** en oberoende granskning, av t13, som fällde. Därefter provrenderingar t14–t20, alla mätta. Den oberoende granskningen av den här versionen gör granskaren.

## Mätningarna på slutfilen (t20)

**Klarar sig:**
- dinner_check: OK på 726 rutor. Regel 8 gäller varje ansikte. Regel 13: en grannes flisa är högst 25 % av huvudet.
- limb_check: OK.
- motion2: 0 fel.
- Djupkontrollen: OK, och båda planterade fel fäller.
- cheat_check: OK. Båda planterade fel fäller (kaptenen 30 cm i bild 2, två figurer som byter sida).

**flicker2: FAIL på 1 ruta.**
- Ruta 177 (5,90 s, bild 4): 54 px i ett öga, mot gränsen 40.
- Övriga rutor: störst 1775 px i bilden och högst 40 px i ögonen.
- Loopsömmen 15b→1 är ett klipp och undantagen enligt beslutet. Den ligger på 36°.
- **Ruta 177 klarar alltså inte ribban.** Rättelsen kräver en provrendering till, cirka 25 min.

**beard_check: inte giltig.**
- Det planterade felet (de gamla hålen) fäller inte, eftersom skäggmasken mäter fel.
- Skägget är rättat i koden: det ritas helt, och underarmen och handen ritas ovanpå med armens egen teckning.
- Det måste prövas för hand. Granskaren och den oberoende granskaren går igenom rutorna:

| Bild | Rutor där armen eller handen är inom cirka en handbredd från skägget |
|---|---|
| 1 | 0–47 |
| 2 | 48–80 |
| 9 | 399–468 |
| 10b | 469–500 |
| 11 | 501–560 |
| 15b | 705–725 |

Det är alla rutor där kaptenen syns.

## Ändrat sedan t13

**Kompositionen:**
- Figurerna fyller minst 60 % av höjden.
- Gruppbilder är byggda av ensambilder och tvåbilder.

**Fusk per bild** (shots.json "cheat"). Kaptenens kista flyttas med honom i Blender.
- Kaptenen flyttas ut ur bild:
  - 0,8 m i bild 4, 7 och 8;
  - 1,5 m i bild 12, 13 och 15a.
- Pojken flyttas ut ur bild i bild 4, 8 och 13.
- cheat_check jämför figurernas avstånd till föremål som syns i båda bilderna (högst 5 cm) och ordningen över bilden vid varje klipp. Inget fusk syns.

**Pojkens plats:** (-2,3; 0,34) i varje bild där han syns:
- han syns i bild 1, 3, 5, 7, 9, 12, 14 och 15a;
- i övriga bilder är han inte i bild.

Han går ingenstans.

**Röstningen:**
- **Bild 14:** pojken pekar vid "All in favour?".
- **Bild 15a (22,8–23,5 s, ruta 684–705), tvåbild:**
  - Pojkens högra näve slår i hans öppna vänstra handflata på ruta 690, med dunk.
  - Sjömannen lyfter puddingen framför bröstet med samma grepp som i bild 13.
  - "Aye!" ligger på 22,94 och 22,96 och slutar 23,49 och 23,50, inne i 15a.
  - Boken används inte i 15a. Från varje kamera som ser sjömannens ansikte ligger hans vänstra arm och boken bakom honom (godkänt av molnsessionen).
- **Bild 15b (23,5–24,2 s, 0,7 s):** kaptenen sjunker ihop.

**Övrigt:**
- Klippet till 10b ligger på ruta 469, efter "That", som slutar 15,630 i tagningen.
- Blinkningar finns bara över klipp:
  - kaptenen: 81, 192, 363, 561;
  - sjömannen: 48, 261, 469, 615;
  - pojken: 141, 501, 660.
- Huvudena rör sig bara vid klipp. Även små nickar flimrade.

## ElevenLabs

- Två "Aye!"-tagningar med Daniel och Will, tre tagningar var. Förräkning: 24 tecken.
- Kontot: 4237 före anropen och 4249 som slutvärde (+12). Räknaren släpar.
- Nyckelkontrollen: 0 filer med nyckeln och 0 träffar i diffen.

## Min bedömning

**Inte helt klar.** Ruta 177 (54 px i ett öga) fäller flicker2, och beard_check är inte giltigt. Allt annat är mätt OK.

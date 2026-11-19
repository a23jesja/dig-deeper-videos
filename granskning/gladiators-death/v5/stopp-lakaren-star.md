# STOPP: gladiatorerna v5, med peek och fed där båda står (byggsessionen, 19 november, sent)

Skrivet till fil eftersom granskningssessionen inte gick att nå, varken med namn eller med sin senaste adress.

**Koden** är a3d113f, och STOPP-filerna är f514e7a. Allt är pushat. Mapp: C:\Users\sweje\dig-deeper-videos\leverans\gladiators-death\

| Fil | md5 | Storlek och längd |
|---|---|---|
| gladiators-death-v5-telefon.mp4 | 8df48f8eb0b7f800267b45cb5c950c1d | 21,4 MB, under 29 MB; 39,97 s; 1199 rutor; 1080x1920; H.264 High; AAC 320 kbit/s |
| gladiators-death-v5.mp4 | 217081af4b8653d359746e97bedec55e | 40,02 s |
| gladiators-death-v5-liten.mp4 | 303dfa2a8be9b206190515f62897a887 | |
| text-v5.md | 74abe917 | |
| thumbnail-v5-1..3.png | oförändrade: 07a0ea43, b4149ba6, c4783338 | |

**Den här filen ersätter två tidigare renderingar, som inte levereras:**
- 912f91e4, där läkaren satt på pallen;
- 97b6b2d9, där bara peek var rättad.

## Diffen mot 6b0adcef
En ruta räknas som ändrad om mer än 0,2 % av bilden skiljer sig med mer än 30, mätt i 270x480. Resultat: 139 ändrade rutor.
- **Rutorna 45–89, 1,50–3,00 s:** peek.
- **Rutorna 365–448, 12,17–14,97 s:** fed.
- **Rutorna 952–968, 31,73–32,30 s, i doctor:** bara texten "ONE ARENA" skiljer sig. Den är några pixlar mindre medan den poppar in.
  - Bilden är exakt densamma: 2639 ändrade pixlar, alla inom textens ruta högst upp.
  - Fed-ändringen rör inte texterna, så troligen är det tidsbrus i textens popp-animation. Orsaken är inte bevisad.
  - Godkänns det inte renderar jag om och mäter igen.
- Inga andra rutor har en ändrad yta.

## Kontrollerna (varje ruta)
- Kroppskontrollen: 0 fel på 1199/1199 rutor och 13 440 par.
- Greppen: OK.
- Filmkontrollen: OK.
- no_sheets: OK.
- Ljudet är oförändrat: -14,0 LUFS och inga stegljud.
- Den nya dräktkontrollen ger också 0 fel på den här filmen.

**Bilder ur den levererade filen** i full storlek, i den här mappen:
- 02-peek-leverans-8df48f8e-ruta-60.jpg (3ba0d76d);
- 08-fed-bada-star-leverans-8df48f8e-a-ruta-370.jpg (6014d4d4);
- 08-fed-bada-star-leverans-8df48f8e-b-ruta-430.jpg (0981237a).

Fed är granskad var åttonde ruta: båda står hela bilden igenom, och inget hopp.

## Läkaren och dräkten: varför kontrollerna missade (inte committat än)
**Varför:** kroppskontrollen hade ingen dräkt alls. En figur var bara kapslar: huvud, bröst, mage, armar och ben. Kortet ritar dräkten efter figurens bålrader, rakt ned längs ryggen till fållen, också när figuren sitter. Därför gick läkarens dräkt ned genom pallen utan att någon kontroll såg den.

**Ny dräktkontroll:** fållraderna under midjan hänger längs ryggen, precis som kortet ritar dem. Varje punkt prövas mot fasta föremål. Tyg får ligga på en sits och ge efter 4 cm, men inte mer.
- Den fångar advokatens dräkt i en låda i djurrättegångarna (bow, 9,8 s, 5 cm).
- Den ger 0 fel på gladiatorerna nu.

**Men den visar något större.** Den fäller kontrollfallet E, där Sir sitter rätt, eftersom hans rockskört hänger 6 cm ned i sitsen.
- Ett sittande kort ritar alla plagg under midjan rakt ned genom sitsen: rock, dräkt och klänning. Ett riktigt plagg skulle ligga över låren.
- Sitta kan alltså inte bli en godkänd bildtyp med de här korten förrän figurritningen lägger plagget över knät när låren lyfts. Det är en ändring i cast.ts som behöver ett eget blad till Jesper.
- Tills dess: inga sittande figurer i lång rock eller dräkt. Sittande går bara med kort tunika eller bar överkropp.

**Fall F**, läkaren som han var, går inte att återskapa exakt i testfilmen än. En stillastående figur får fötterna satta i golvet, så hans kropp hamnar i pallen i stället. F byggs som en rörlig figur, som i filmen.

## Förslag på ordning
1. Regressionsrad 22.
2. Dräktkontrollen och fall F, med beviset omgång 3.
3. Bildbiblioteket utan "sitta", tills ritningen av plagg över knät finns och Jesper har godkänt den på ett blad.

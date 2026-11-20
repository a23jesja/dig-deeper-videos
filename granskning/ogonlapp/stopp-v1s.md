# STOPP: The Pirate Eye Patch Trick, v1s (20 november 2026, sent kväll)

v1s ersätter v1r. Min oberoende granskare fällde v1r, och v1s rättar det som gick att rätta.
- Två av hans fel finns kvar. Båda fanns redan i v1q, och orsaken är inte hittad (se nedan).
- Jesper har bestämt att granskarnas ögon avgör ("Granskarnas ögon", `jesper-beslut-v1r-20nov.md`). Flimmermåttet står med som upplysning.
- Ingenting har gått till Jesper.

## Filer (leverans/eye-patch/)

| Fil | Storlek | md5 |
|---|---|---|
| eye-patch-v1s.mp4 | 15,95 MB | 9b8ba9c7b64744187d233c83a075d5ec |
| eye-patch-v1s-telefon.mp4 | 7,03 MB (under 29 MB) | 657129b7499ec49db13eaeebf16730e4 |
| eye-patch-v1s-liten.mp4 | 3,05 MB | 8d6a9846dd8d6269bcd97e4f5bcdd053 |
| thumbnail-v1s-1/2/3.png | | 4b40ba47…, 0769b01b…, 23460209… |

v1r-filerna ligger orörda. Det är dem den oberoende granskaren såg (md5 b46c821c…).

**Export** (ffprobe):
- 1080×1920, r_frame_rate och avg_frame_rate 30/1, 1083 rutor, 36,10 s.
- yuv420p, color_range tv, color_space bt709.
- Bithastigheten är 3,2 Mbit/s vid CRF 16 med aq-mode 3. Det är under regelns "cirka 12–16 Mbit/s": den rena bilden från dubbel storlek trycks ihop bra vid den CRF som regeln anger.
- Primärfärger och överföring står som okända i ffprobe trots flaggorna.

**Rendering:** dubbel storlek (2160×3840) i fyra delar i förgrunden, concurrency 1 och minnesspärr. Efter varje del fanns 0 kvarlämnade processer.

## Rättat sedan v1q

**Dina fyra v1q-fel:**
- **Näven ligger på bordet** och sjunker inte in. Det nya testet för den ritade handen i kortets plan fäller v1q på rutorna 83–121.
- **Loopen:** både figurerna och linsen tonas in i ruta 0. Skarvtestet fäller det planterade felet. Skarven är 3,5 %, mot 10,3 % i v1q.
- **Det blå blocket** och **mastknoppen** är borta ur bilden.

**Jespers flimmerorder:**
- Blinkningen är halvt, halvt, stängt, stängt, halvt, halvt.
- Bubblorna tonas in över 6 rutor och står still.
- Kortkanterna har alpha-to-coverage, texturerna mipmaps och filtrering, och linjerna är minst 3,2 px.
- Renderingen sker i dubbel storlek och skalas ned.
- Export enligt ovan.

**De 13 rutorna** (`v1r-13-rutor.md`, rättningarna A–E):
- Mustaschhalvan krymper med vridningen.
- Locklinjen tonas in.
- Ansiktet blandas i loopen.
- Kamratens ansikte tonas efter snubblet.
- Läslagren ger inga ryck.

**Min egen granskning i full storlek:**
- En vridning på exakt 30° satt på gränsen för sidoritning. Kamratens bortre arm och piratens axelknapp kom och gick ruta för ruta (288–292 och 632).
- Gränsen är flyttad från det jämna värdet (SIDE_ON 0,513).
- Ett nytt test fäller en ritordning som byts en ruta och tillbaka. Det planterade fallet fälls (`order-test-v1r.txt`).

## Den oberoende granskarens fel i v1r och läget i v1s

1. **Örat byter teckning på en ruta och står som en mörk pinne eller ring vid huvudet** (15,2 s, 19,2 s, 24,4 s, 33,3–33,9 s, 35,2–35,4 s och kamraten vid 28,7 s). **Rättat.**
   - Delen ovanpå växer nu fram med sin kontur och tonas in, i stället för att ritas med full kontur från första strimman.
   - Kamratens huvudskakning är lugnare: 6° på 1,0 s i stället för 9° på 0,8 s.
   - Jag har gått igenom alla de rutorna i full storlek i v1s, och örat är jämnt i alla.
2. **Ljuset på ett bordsben flimrar** (bland annat 5, 16, 253–257, 268, 292–296, 600–607, 1035–1076). **Finns kvar.**
   - Det fanns redan i v1q, till exempel rutorna 262–263.
   - Att låta solens skuggområde flytta sig i hela texlar (rättat i motorn) räckte inte, så orsaken är något annat. Troligen figurkortens skuggor på benet. Jag har inte bevisat det.
3. **Kamratens näve ser ut att sväva** (2,5–5,2 s). Det saknas en kontaktskugga under den. **Bedömning, inte rättat.**
   - Den ligger 1–1,5 cm ovanför skivan enligt testerna. Lägre sjönk den in.
4. **Kanten på däckspanelen vid ratten** (26,2–27,8 s): en röd strimma på panelens vänstra kant i enstaka rutor. **Finns kvar**, troligen djupkrock. Den fanns också i v1q.
5. **Ringar i lyktans sken** (29,4–31,1 s). Rättat med CRF 16 och aq-mode 3. Med förstärkt kontrast syns inga ringar i v1s.
6. **Bokgreppet:** knutna nävar mot bokens kanter. Det är det godkända greppet från 04. **Bedömning.**
7. **Träsnittets vänstra pirat skärs av bildkanten** i inzoomningen (31,1–32,7 s). **Bedömning**, det är avsiktligt.
8. **Utanför de nio punkterna:**
   - Undertextraderna står 0,4–1,1 s, inte 1,5 s.
   - "CAN SEE" utelämnar "and you".
   - Själva lappbytet visas inte, bara över klippet.
   - Inget av detta är ändrat.

## Flimmermåttet (upplysning)

Filen är `flimmer-v1s.txt`, med båda måtten per ruta.

**Det korrigerade måttet fäller 7 rutor**, alla i ögon på 41–104 pixlar:

| Ruta | Tid |
|---|---|
| 36 | 1,20 s |
| 384 | 12,80 s |
| 506 | 16,87 s |
| 632 | 21,07 s |
| 1046 | 34,87 s |
| 1070 | 35,67 s |
| 1071 | 35,70 s |

- I full storlek är det pupiller och lock som rör sig jämnt. Utsnitten ligger i `v1r-flaggad-ruta-*.png`; det är samma rutor i v1s.
- Hela bilden ligger på högst 1211 pixlar och texten på högst 16.
- **Det råa måttet fäller 111 rutor.**

**Bevisfallen** (`flimmer-bevis-v1r.txt` och `-v1q.txt`) är oförändrade sedan förra rapporten:
- (h1), 2 px på en rörelse om 3 px, slinker igenom på v1r.
- (c) hamnade på en jämn yta.
- (f) och (f2) fälls fast de ska godkännas.

## Tester

- Filmkontrollen ger 0 fel: kropp, rörelse, stillhet, skarv och ritordning.
- Body check är OK.

Det som återstår ligger hos dig och din oberoende granskare: bordsbenet, panelkanten och bedömningsfrågorna.

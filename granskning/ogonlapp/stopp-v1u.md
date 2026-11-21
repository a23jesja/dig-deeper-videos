# STOPP: The Pirate Eye Patch Trick, v1u (21 november 2026), fjärde omgången

Jesper sa ja till en fjärde omgång ("Ja", "Kör en omgång till"). v1u innehåller allt i 02068f7 (bänken) och 6066a04 (v1t-listan). Ingen ny funktion har lagts till.

## Filer (leverans/eye-patch/)

| Fil | Storlek | md5 |
|---|---|---|
| eye-patch-v1u.mp4 | 15 866 593 B | 7b67056f3169a53200e3fcbd3753e567 |
| eye-patch-v1u-telefon.mp4 | 7 014 804 B (under 29 MB) | 9a90f521b87e3c41b979ed25540bd6ef |
| eye-patch-v1u-liten.mp4 | 3 029 609 B | e267aa2b4026e149b3204c7a31d3e119 |

**ffprobe:** 1080×1920, r_frame_rate och avg_frame_rate 30/1, 1083 rutor, yuv420p, color_range tv, color_space bt709, 3,19 Mbit/s.

**Rendering:**
- Dubbel storlek i fyra delar plus ljudet, i förgrunden, ett jobb i taget.
- Minnesspärren startade med 14,6–14,8 GB fritt. Efter varje del fanns 0 kvarlämnade processer.
- Filmkontrollen före renderingen: kropp 0 fel på 1084 rutor, rörelse 0 fel, FILM CHECK OK.
- v1t-filerna är orörda.

## De sex ytorna över hela klippen (`lyktytor-v1t-v1u.txt`)

Mätt som rött (R), medel över ytan per ruta. En växling är två rutbyten i rad åt motsatt håll, båda minst 1,0.

| Yta | Rutor | v1t växlingar / störst | v1u växlingar / störst |
|---|---|---|---|
| A öppningen | 0–72 | 25 / 12,6 | **0** / 0,6 |
| B slutbilden | 1031–1082 | 22 / 12,9 | **0** / 0,4 |
| C below | 233–297 | 14 / 15,3 | **0** / 3,5 |
| D myth | 599–651 | 17 / 10,6 | **0** / 0,4 |
| E verdict | 718–777 | 12 / 4,3 | **0** / 4,0 |
| F dark | 77–149 | 27 / 5,0 | **0** / 0,5 |

Värdena per ruta står i filen. I C och E ändras värdet jämnt åt ett håll medan linsen glider; det byter aldrig fram och tillbaka.

## Flimmermåtten (`flimmer-v1u.txt`; v1t i `flimmer-v1t.txt`)

| | v1t | v1u |
|---|---|---|
| Rutor som fälls, korrigerat mått | 6 | 7 |
| Rutor som fälls, råa måttet | 109 | 106 |
| Hela bilden, högst (pixlar) | 1053 | 1063 |
| Skarven | 3,6 % | 3,6 % |

- v1u fälls i ögonrutorna 36, 384, 506, 631, 632, 1046 och 1071, alla mot gränsen 40 i ett ögas cirkel. Värst är 632 med 95 pixlar.
- 36, 384, 506, 632, 1046 och 1071 är samma ögonrutor som i v1s och v1t, som ni godkände som jämn rörelse.
- 631 är ny. Den sitter bredvid 632, med 44 pixlar.
- Måttet är en upplysning (FLICKER_INFO), enligt Jespers "Granskarnas ögon".

## Ordningstestet

- **`order-test-v1u.txt`:** v1u:s kod ger MOTION CHECK OK, 0 fel.
- **`order-test-v1u-planterat.txt`:** samma test på v1t:s utjämning (ORDER_MODE=v1t) fäller 25 ställen. Bland dem finns alla som du och din granskare pekade ut: 16, 19, 46 och 50 (hook), 88, 89, 113 och 136 (dark), 258, 270 och 294 (below), 420 och 422 (myth), och slutet vid 1046, 1049, 1071 och 1075.

## Coplanar-listan (`coplanar-v1u.txt`)

- 224 par ytor ligger i samma plan inom 2 mm. Ingen lins ser något av dem.
- **Par som syns och slåss om djupet: 0.** Resultatet är OK.
- 41 nära par med 2–6 mm mellanrum står som upplysning, med plats och ruta.

## Rutorna i full storlek

Varje fil är sex rutor bredvid varandra i 1080×1920:
`v1u-rutor-16-21`, `-43-48`, `-86-91`, `-133-138`, `-255-260`, `-291-296`, `-417-422`, `-1046-1051` och `-1068-1073-fullstorlek.jpg`.

Närbilden: `v1u-narbild-ruta-486.png`, `-505.png` och `-528.png`.
- Vänster näve ligger över bokens kant.
- Höger näve syns bara som ett hörn nere i bildkanten.

## Kvar från förra listan (inte ändrat)

- Bubblan och undertexten står samtidigt i 324–346. Bubblan måste stå minst 1,2 s, men luckan är 1,03 s. Det är en fråga till Jesper.
- Jespers frågor står kvar: lappbytet visas inte i bild, och solen står bakom figurerna på däck.

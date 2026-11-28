# Middagen före och efter kitändringen a och b (28 nov)

v6e renderas inte om. Den levererade filen (md5 4ac065d5) är den godkända. Det här är information inför film3d.

**dinner_check på källan:** DINNER CHECK OK (732 bildrutor) med kit.ts före (1f39c4b) och efter (33bdb60). Utskrifterna är identiska, diffen är 0 rader. Utskrifterna ligger i engine/out/rob/dinner_check-before.txt och -after.txt.

**Pixeldiff:** stillbilder var 30:e bildruta (0–720), renderade med gammalt och nytt kit. Räknat är antalet pixlar som skiljer mer än 8 i någon kanal. Jämförelsearket middag-pixeldiff.png visar de 11 bildrutor där minst 400 px skiljer, som gammalt | nytt | diff runt den ändrade rutan.

| Bildruta | Bild | Px som skiljer | Vad |
|---|---|---|---|
| 0 | 1 | 7 | kanten på ett rundat veck |
| 30 | 1 | 11 | kanten på ett rundat veck |
| 60 | 2 | 71 | kaptenens veck |
| 90 | 3 | 458 | besättningsmannens randiga ärm: en lös randbit tonad |
| 120 | 3 | 2032 | pojkens armar vid magen: innervecken rundade |
| 150 | 4 | 1734 | besättningsmannens armbåge med skeden: randbitar tonade, vecket rundat |
| 180 | 4 | 92 | samma, mindre |
| 210 | 5 | 1603 | kaptenens båda händer vid magen: båda innervecken rundade |
| 240 | 5 | 1599 | samma |
| 270, 300, 330, 360 | 7 | 955–1127 | besättningsmannens böjda randiga arm med puddingen: randbitar tonade, vecket rundat |
| 390 | 8 | 965 | samma |
| 420, 450 | 9 | 25, 154 | små veck |
| 480 | 10b | 0 | |
| 510, 540 | 11 | 46, 145 | kaptenens böjda armar: små veck |
| 570, 600 | 12 | 3, 0 | |
| 630 | 13 | 492 | besättningsmannens arm: en randbit |
| 660, 690 | 14 | 215, 0 | ett veck |
| 720 | 15b | 0 | |

Ingenting utanför armarna ändras. Rakare armar (böjda under 20°) ritas pixel för pixel som förut.

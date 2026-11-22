# STOPP 4: Alcatraz 1962, färdig film v4 (22 november 2026)

## Filer (leverans/alcatraz/)

| Fil | Storlek | md5 |
|---|---|---|
| three-men-vanished-from-alcatraz-v4.mp4 | 6 049 263 B | 3d3b348c75619099d772dc76bd760940 |
| three-men-vanished-from-alcatraz-v4-telefon.mp4 | 2 912 764 B (under 29 MB) | 98dd3a34aea1d946fd3fce9a8f40eb13 |

- md5 står i `md5-v4.txt`, och `md5sum -c` stämmer.
- Filmen är 1080×1920 i 30 fps, 32,0 s och 960 rutor, renderad med ett jobb i taget.
- **Ljudet är detsamma som i v2b och v3.** Det avkodade ljudets md5 är f3203cf4b5d288a226e2bf36a5a55cb0 i alla tre.

## De två ändringarna (före och efter i `fore-efter/`: övre raden v3, nedre raden v4)

| # | Punkt | Ändring | Blad |
|---|---|---|---|
| 1 | samma högerhand två gånger (bild 6, rutor 361–426) | Den nedre handen är speglad lodrätt (`flip` i handritningen), så att tummen pekar uppåt. De två tummarna pekar nu mot varandra, som en mans två händer med handflatorna nedåt. | p1 |
| 2 | nålen poppar fram (bild 15, ruta 794 → 795) | Handen ligger 22 px längre till vänster tills den går, så att nålen kommer under fingertopparna och är helt dold i rutorna 794–798. Den syns först när fingrarna glider av den (från ruta 801), alltså aldrig på tomt papper. | p2 |

## Rutorna utanför de två bilderna

**Den ritade bilden.** `identiska-rutor-2x-v3-v4.txt` jämför v3 och v4 renderade i dubbel storlek, alltså steget före den slutliga nedskalningen.
- 818 av de 834 rutorna utanför 361–426 och 763–822 är pixelidentiska.
- De 16 rutor som inte är det ligger direkt intill de ändrade bilderna: 355–360, 758–762, 825–826 och 828–830.
- Skillnaden är som mest 13 av 255. Det är kodarens B-rutor, som lånar från grannrutorna i den ändrade bilden. Ingenting i dem är ritat annorlunda.

**Den färdiga filen.** `identiska-rutor-v3-v4.txt` jämför de levererade mp4:orna.
- 669 av 834 rutor är pixelidentiska.
- Bild 14 (732–762) skiljer sig med upp till 47 av 255 i det mjuka larmljuset, fast den ritade bilden där är identisk (0 vid ruta 732, 741 och 756 i 2x-renderingen).
- Orsaken är att x264 planerar kvantiseringen cirka 40 rutor framåt (mbtree). Eftersom bild 15 ändrades kodas också bild 14 lite annorlunda.
- **Kravet "pixelidentiska" är alltså uppfyllt för den ritade bilden men inte för den kodade filen.** Därför har jag kört flimmermåttet på hela v4 i stället.

## Kontroller

**Flimmermåttet** på hela v4 (`flimmer-v4.txt`): 
- **PASS: ingen ruta flimrar, 0 fällda rutor.** Mätt rörelsekorrigerat, med steg upp till 12 px.
- Den största rutan har 1 562 flimrande pixlar mot gränsen 2 000 (ruta 732). Ögon och text: 0.
- Utan rörelsekorrigering ligger 30 rutor över gränsen.
- Loopen: 0,1 %.

**clip_check:** alla bilder OK.

**Ingångskontrollerna** (`ingangskontroller-v4.txt`), mätta i mp4:an:
- första ljudet på 0,000 s, och **toppen i ruta 1 är 0,36**;
- texten 1,6 s per rad;
- loopen 0,0 %.

**Thumbnail:** rutorna 536, 706 och 749 ligger utanför de ändrade bilderna och är oförändrade i den ritade bilden. Bilderna i stopp3 gäller därför.

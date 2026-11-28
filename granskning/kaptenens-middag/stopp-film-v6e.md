# Kaptenens middag v6e: STOPP enbart för fötterna (villkor 1–4 från e677407), 28 nov

## Leveransen

| | Sökväg | Storlek | md5 |
|---|---|---|---|
| Film | `leverans/kaptenens-middag/kaptenens-middag-v6e.mp4` | 18,4 MB, 24,4 s, 1080 × 1920 | 4ac065d5c59d5a516ee3e63b3f8506d9 |
| Telefonkopia | `leverans/kaptenens-middag/kaptenens-middag-v6e-telefon.mp4` | 5,8 MB (under 29 MB) | 134ebf43fc6558862755110b7f805faa |

- sha256 står i `md5-v6e.txt`.
- Filmen är renderingen v6e-r2.

**Kodningen:** slutkodningen har CRF 14 i stället för 16.
- I v6e-r1 med CRF 16 mätte flicker2 42 pixlar i ett öga på ruta 523 i bild 11 (gräns 40).
- Källbilden där är pixelidentisk med v6d: stillbilden med och utan skuggorna skiljer bara inom skuggorna, som mest 12 nivåer.
- Ögat låg redan på 35–36 i v6c och v6d. Med de nya skuggorna fördelar kodaren bitarna annorlunda.
- Kort rendering av bild 11: ögat 35 med CRF 16 och 32 med CRF 14.
- I hela filmen med CRF 14 ligger ögat som mest på 33.

## Ändrat (bara core.ts, dinner_check.mjs och CRF-inställningen i renderskriptet)

**Fotskuggan:**
- I bild 2, 9, 11 och 15b ligger kaptenens fotskugga på golvet direkt under kistans siluett, under varje sko.
- Den ligger aldrig på kistans framsida eller på en fot: den ritas under figuren och är klippt bort från kistan.
- I bild 11, där skorna står på golvet bredvid kistan, ligger den strax under sulan.

**Sätets kontaktskugga:** en mjuk ellips på locket kring bäckenet, 0,13 m åt varje håll, klippt till lockets yta.

**Färgen:** båda skuggorna har golvskuggans färg (14, 7, 5) och en mjuk gradient. De är som mest 15 nivåer mörkare och aldrig svarta.

**De följer foten:** skuggorna räknas ut från skorna och bäckenet i varje ruta. När foten står still står skuggan still.

**Ny regel 2c:**
- Fotskuggan ligger på golvet, utanför kistan, vid eller under sulan och under skon.
- Sätets skugga ligger på locket.
- Det planterade felet shadowOff (30 px fel) fäller.

**Regel 2 för den sittande kaptenen beskriver nu det som syns:**
- Kortet står upprätt genom bäckenet och ställde därför fötterna på golvet inne i kistan.
- Regel 2b (ingen sko över locket) och 2c dömer nu fötterna.
- Sulans höjd över golvlinjen framför kistan noteras: som mest 77 px i bild 2 och 15b och 65 px i bild 9.

## Villkoren 1–4 (utsnitt i `granskning/kaptenens-middag/v6e/fotter/`)

Rutorna är desamma som i mätningen: 48, 64 och 80 (bild 2), 399, 434 och 468 (bild 9), 501, 531 och 560 (bild 11), 710, 720 och 731 (bild 15b). För varje ruta finns två utsnitt:
- `bildX-rutaN-fore-efter-ljusad.png`: v6d till vänster och v6e till höger, ljusade och i full storlek.
- `bildX-rutaN-fore-efter-360.png`: samma ruta i 360 px.

**1. Sätet syns på locket, med kontakt och skugga: HÅLLER NU.**
- Sätet ligger på locket inom 1 cm i varje ruta (regel 1).
- Kontaktskuggan syns där locket inte täcks av ben och rock: mellan benen i bild 2 och 15b, och vid rockens kant i bild 11.
- I bild 9 täcks locket nästan helt (137 synliga skuggpixlar på ruta 434).

**2. Knäna böjs vid kistans kant och smalbenen hänger ner: HÅLLER (oförändrat).**
- Smalbenen hänger 3–16° från lodrätt.
- Knäna ritas på lockets topp.

**3. Mjuk skugga på golvet under fötterna: HÅLLER NU**, med en anmärkning nedan.
- Synliga skuggpixlar på golvet (mer än 12 nivåer mörkare) per ruta: bild 2 cirka 3 700, bild 9 cirka 4 800 och bild 15b cirka 3 700.
- I bild 11 står skorna på golvet i bordets skugga, och fotskuggan där är svag.
- **Ärligt om 360 px:** golvet under kistan ligger redan i kaptenens kroppsskugga från plattan. Fotskuggan syns tydligt i full storlek och ljusad, men i 360 px är den bara en svag mörkare fläck.
- Om du vill ha den tydligare på telefonen kan kärnan bli upp till cirka 25 nivåer mörkare, fortfarande inte svart. Det kräver en ny rendering.

**4. Ingen fot under locket eller inne i kistan: HÅLLER (oförändrat).**
- Skorna ritas framför kistans framsida (bild 2, 9 och 15b) eller bredvid den (bild 11).
- Inga skor ritas över locket (regel 2b ger 0).

## Pixeldiff mot v6d: ingenting annat har ändrats

**Källbilden:** samma ruta renderad med och utan de nya skuggorna. Utan dem är koden exakt v6d:s.
- Tabellen ligger i `v6e/fotter/pixeldiff-kalla.md`.
- Den omfattar en ruta per bild, alla 15 bilderna, och de 12 mätrutorna: 23 rutor.
- Det blir **0 ändrade pixlar utanför skuggzonerna** (lockets yta och fotskuggornas område).
- Bild 1, 3, 4, 5, 7, 8, 10b, 12, 13, 14 och 15a har 0 ändrade pixlar.

**Filmen:** v6d (CRF 16) och v6e (CRF 14) skiljer sig i alla bilder med kodningsbrus, några hundra pixlar per ruta vid kanterna.
- Det visar diffen mellan de två filerna (`engine/out/probe/vdiff20.json`).
- Diffen på filmnivå kan därför inte i sig visa var bilden har ändrats. Diffen på källbilden ovan visar det.

## Kontrollerna på v6e-r2

| Kontroll | Resultat |
|---|---|
| dinner_check | OK, 732 rutor |
| limb_check | OK |
| motion2 | 0 fel |
| flicker2 | Bara loopskarven. Bilden som mest 1840, ögat 33 |
| seam_check | 0 |
| Djupkontrollen | OK. De planterade felen fäller |
| cheat_check | OK |
| Planterade fel | 35 av 36 fäller. pudOff fäller inte, som tidigare godtaget. Det nya shadowOff fäller |
| Den frysta diffen mot ad1a161 | 0 rader |

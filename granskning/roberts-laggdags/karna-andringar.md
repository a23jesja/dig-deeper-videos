# Ändringar i kärnan i roberts3d (följer med när film3d byggs, granskarens villkor 28 nov)

roberts3d/core.ts är en kopia av dinner3d/core.ts vid 1c99a4b. Varje rättelse här som gäller kärnan, och inte bara Roberts, listas nedan med commit.

| # | Ändring | Gäller kärnan? | Commit |
|---|---|---|---|
| 1 | Solen genom akterfönstren (castShadow, PANES, bordets skugga) är borttagen. Ljuset kommer från plattan | Nej, salongens ljus. I film3d blir det en parameter per film | (denna) |
| 2 | Kistan och kaptenens säte och fotskuggor (CAP_SEATED, chestHull, seatShadow) är borttagna | Nej, middagens kista. I film3d blir det en hook "under figuren" | (denna) |
| 3 | Figurernas färgning och kantljus per bilds ljus (GRADE och RIMC för night och dawn) i stället för salongens fasta varma | **Ja.** I film3d blir det en parameter per bild | (denna) |
| 4 | PLANT och CUT_BLINKS är tomma eller Roberts-egna | Ja (per film) | (denna) |

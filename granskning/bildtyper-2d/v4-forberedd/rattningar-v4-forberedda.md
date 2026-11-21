# Bildtyperna i platt 2D: rättningar efter den oberoende granskningen av v3, förberedda i koden (21 november 2026)

Jesper avgör v3. Ingenting är renderat, och rättningarna renderas först om han säger till. Kontrollerna i modellen klarar den nya koden. Pixelkontrollen kräver en rendering, så den är prövad på de befintliga v3-filerna och med ett planterat fel.

## Rättningar

**Gemensamt (riggen och ritningen):**
- **Framifrån ritas armarna alltid efter kroppen och huvudet.** En arm vars handled kom fram bytte förut lager på en ruta, så handen poppade fram (01, 89→90). Kedjans spänne hamnade då över underarmen (01, 88–106). Nu ligger spännet under armen. Det tar också bort armarnas lagerbyte i vändningarna i 03.
- **Närmaste sida följer åt vilket håll han vänder sig** (rig.ts). I profil står axlarna på nästan samma djup. När vridningen passerade noll bytte armarna ritordning, och kroppen såg ut att byta teckning (02, 96→97).
- **Arm-IK:n:**
  - Sökningen går ner från alla startlägen och väljer bästa slutpunkt med hela felmåttet. Förut gällde villkoren bara valet av startläge, och två lika bra armar vann om vartannat (07, 125 och 130; 04; 08).
  - Ett läge för näven sätter handens mitt på målet (08).
  - Villkor: `abdFix` gör armen tvådelad i bildplanet med entydigt svar (08), och `elbowDown`.
- **Det slutna ögat** är alltid en båge nedåt (04 hade "^").
- **I profil slutar kedjan på västens framsida** (02).
- **Mustaschens bortre halva är 0,5**, centrerad 6 närmare mitten, och kommer inte nära huvudets kontur (03).
- **Gropen i ökenbakgrunden** (den mörka "7:an" vid nedre vänstra kanten) är bortvald i klippen.

**Per klipp:**
- **01:** munspåret är gjort om ur den sparade tagningen, utan nytt anrop. Munnen rör sig bara mellan första och sista ordet, och ingen munform står en enda ruta (kortaste formen 2 rutor, första öppna rutan 16).
- **03:** vändningarna tar 1,3 och 1,0 s, så varje tre-kvartssteg står längre.
- **04:** se det slutna ögat. Underarmarna: jag prövade att hålla armbågarna utanför lådan, men då nådde handlederna inte kanterna (25 px fel). Därför är armarna som i v3.
- **05:** blinkfrö 7 ger blinkningar vid 0,47 och 3,37 s, aldrig i pekningen. Skeppet är mindre (1,05).
- **06:**
  - Krabban syns från 0,25 s, innan han ser den vid 0,95 s.
  - Den är något mindre (1,7) och stannar 0,32 m till höger.
  - Han håller händerna framför bröstet både i ryckningen och efteråt.
  - Kontrollen mäter klornas spetsar: närmaste hand 45 px eller mer.
- **07:**
  - Han flyttar bakåt först och sätter sig sedan, så låret inte går under lådans topp på vägen.
  - Lådans topp ligger vid lårens lägsta undersida över lådan.
  - IK-hoppet i 125–130 är borta.
- **08:** näven sätts med sin mitt på mässingsstången, så den syns ta handtaget innan dörren öppnas. Armen ligger i bildplanet (`abdFix`), handbytena sker mitt i rörelsen, och greppet är högst 0,5 px fel.

## Kontroller

**`clip_check.mjs all` på den nya koden:** alla åtta CLIP CHECK OK (`../clip-check-v4-forberedd.txt`). flat_check och flat_views för rörelseprovet: OK.

Nya regler:

| Regel | Planterat fel | Fälls som |
|---|---|---|
| Led som rycker (hoppar på en ruta medan rutorna runt omkring står still, eller hoppar och tillbaka) | armen flyttad 25 px på en ruta (`planterat-arm-snap-c01.txt`) | "the elL jumps … and back", "the tipL snaps" |
| Lår in i sätet | sätet 18 px högre (`planterat-thigh-in-seat-c07.txt`) | "a thigh 18 px into the seat" |
| Hand mot klo | en klo vid handen (`planterat-claw-c06.txt`) | "the R hand … from the crab (claws counted)" |

**Den nya kontrollen på v3-koden** (`nya-kontrollen-pa-v3-koden.txt`) fäller IK-hoppen i 04, 07 och 08.

**Pixelkontrollen** (`scripts/clip_parts.mjs` och `scripts/part_diff.py`):
- **Vad den gör:** för varje kroppsdel (huvud, kropp, armar, ben) räknar den hur mycket bilden ändras mellan två rutor inom delens ruta. Den fäller där bilden ändras mer än 3 gånger delens vanliga ändring och mer än 6, medan delens leder och alla överlappande delars leder rörde sig under 4 px. En mun som pratar räknas som rörelse; en blinkning räknas bara för huvudet.
- **På v3-filerna med v3-koden** (`part-diff-pa-v3-filerna.txt`):
  - 03: armen byter lager i vändningarna (43–44, 77–79);
  - 06: han reagerar i ruta 17;
  - 06: armen i ruta 67;
  - 08: huvudet i rutorna 15 och 19.
- **Planterat fel:** en mörk fläck på armen i en ruta. Den fälls (`part-diff-planterad-c04.txt`).
- **Det den inte ser:** ett lagerbyte som sker medan armen rör sig snabbt, som 01 89→90. Det fallet rättas i stället i koden (armarna ritas alltid sist framifrån).

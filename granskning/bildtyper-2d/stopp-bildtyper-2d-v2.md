# STOPP: bildtyperna i platt 2D A Knopp, v2 (21 november 2026), omgång 2 av 3

v2 rättar granskningen av v1, både de gemensamma punkterna A–C och punkterna per klipp. Klippkontrollen är strängare, och varje ny regel har ett planterat fel. v1-filerna ligger orörda.

## Filer (leverans/bildtyper-2d/)

Alla klipp är 1080×1920 i 30 fps. Jag renderade själv, ett jobb i taget, i dubbel storlek med CRF 10 och sedan till CRF 16. Telefonkopiorna har CRF 23. Efteråt fanns 0 processer kvar. md5 står i `md5-v2.txt`.

| Fil | Längd | Bild (zoom) | Storlek | md5 | Telefon | md5 |
|---|---|---|---|---|---|---|
| 01-sta-och-prata-v2.mp4 | 4,60 s | medium 2,7 | 1 774 928 B | 9c215b127e57ded2ce035da81e050155 | 818 915 B | 24692c0d9920ec4a69f3faa3d2e33f39 |
| 02-ga-v2.mp4 | 4,57 s | hel 1,7 | 1 017 580 B | ed7f057e9b5cb707c0503848fb14a775 | 339 715 B | c2376391e26bbbe37250d584d5f825f2 |
| 03-vanda-sig-v2.mp4 | 4,20 s | hel 1,7 | 1 159 181 B | 38df0e8470c4baa4a5551a94de3e1019 | 403 752 B | 15c8455aeae41c903a2a49931dfed8c5 |
| 04-halla-med-bada-handerna-v2.mp4 | 4,40 s | medium 2,7 | 1 342 924 B | 9d59b27e99c01d47d8c3b1a8fe7408ee | 582 003 B | 83cf63bca702c4c29c37f9fbbb40fe82 |
| 05-peka-v2.mp4 | 4,00 s | medium 2,25 | 1 132 193 B | a1e24e6ea933def6f1a436b1e8b90bfd | 396 724 B | 24c5138212568c732248a75a37334139 |
| 06-reagera-v2.mp4 | 4,00 s | hel 1,75 | 1 214 508 B | 3686557f6dcae06c06069dea6e7aa546 | 428 843 B | bd14482af69f22bc747ea8dae9238232 |
| 07-sitta-v2.mp4 | 4,40 s | hel 1,7 | 905 508 B | 8f3b727183f86738daacb84e69ef8abc | 290 667 B | 69a7897de27f61f232ff69db9b307e5a |
| 08-oppna-en-dorr-v2.mp4 | 4,40 s | hel 1,7 | 836 531 B | e74552c16ac96bfa170631a96ee52cb9 | 380 637 B | a9f5e88442b50ec13986f159c7232b14 |

**Ljud:** 01 har bara Georges replik, −13,9 LUFS med topp −2,8 dBFS. 02–08 är tysta (−91 dB). Inga nya ElevenLabs-anrop är gjorda.

## Gemensamt

**A. Blinkningen** går öppen, halv, stängd, halv, öppen, med varje steg i två rutor.
- Halvlocket ligger på 0,42, så pupillen syns under det (`01-sta-och-prata-v2-blinkning-56-71.jpg`: halv 61–62, stängd 63–64, halv 65–66).
- Det gäller också Ada i rörelseprovet (flatMotionModel.ts).
- Kontrollen fäller en stängd ruta utan halvlock före eller efter. Den fäller också ett halvlock över 0,45, som täcker pupillen.

**B. Inramningen:** varje klipp har en kamera.
- **Medium** (zoom 2,7, figuren cirka 87 % av höjden): 01 stå och prata och 04 hålla.
- **05 peka** har zoom 2,25 (72 %), så att skeppet vid horisonten ryms bredvid honom.
- **Helbild** (zoom 1,7–1,75, figuren minst 55 % av höjden och fötterna i bild): 02 gå, 03 vända sig, 06 reagera, 07 sitta och 08 öppna dörr.
- Halvbild från midjan och uppåt går inte med Knopp i 9:16: huvudet är halva figuren och skulle fylla hela bredden. Medium här är figuren från mössan till skorna, stor i bild.
- **06 reagera** är helbild med en dubbelt så stor krabba, eftersom krabban går på marken och försvinner ur en närmare bild.
- Kontrollen fäller en mediumbild under 70 % av höjden och en helbild under 50 % eller utan fötterna i bild.

**C. Spaden:** i ökenbakgrunden sitter den nu nerstucken i en sandhög (FlatStyle BGS[0]). I klippen är den bortvald (`spade: false`).

## Per klipp

**01 stå och prata**
- Den stängda munnen är 0,2 öppen, framifrån och i tre-kvart, och syns i telefonstorlek.
- Pipan följer mungipan nedåt när munnen öppnas.
- Lockens språng vid leendet (106→107) är borta: det nedre locket växer nu jämnt med leendet.
- Ada är borttagen, eftersom en mediumbild i 9:16 fylls av en figur. Hennes nick är därmed också borta.
- Handbytena ligger mitt i armens rörelse.

**02 gå**
- Han går in helt utifrån vänstra bildkanten.
- Händerna är lösa nävar hela vägen, så ingen öppen handflata och inget handbyte i gången.
- Stegen är 0,6. Vid 0,85 slog armpendlingen i taket och flög sedan 46 px per ruta.
- Det stängande steget landar 0,6 benlängder bakom, inte på den andra skon.

**03 vända sig**
- Fötterna står förskjutna (0,8) och vrider sig lågt på trampdynorna (lyft 0,03). Ingen fot ligger på den andra.
- Vändningarna tar 1,0 och 0,8 s. Tre-kvart åt höger syns i rutorna 30–36.
- Han slutar i tre-kvart åt vänster, så monokeln syns på det bortre ögat hela tiden och aldrig försvinner.
- Monokelns ring ritas över näsan.

**04 hålla**
- Figurens egna händer ligger bakom lådan.
- Över lådans sidokant ritas varje hand med handloven och handryggen runt kanten, knogveck och tummen över framsidan. Fingrarna går bakom lådan.
- Handlederna sitter mot lådans sidor med högst 0,4 px fel.

**05 peka**
- Ett litet skepp ute vid horisonten. Horisonten ligger under hans axel, så handen inte hamnar under pipan.
- Blicken går dit först. Armen sträcks till 0,82 av sin längd, så armbågen syns böjd.
- Pekfingret sitter alltid på handens ovansida.
- Fingret är ute 0,95 s (`finger out 29 frames`), och pekningen hålls 0,75 s.
- Handbytena ligger mitt i rörelsen upp och ner. Efteråt är handen en lös näve.

**06 reagera**
- Krabban är dubbelt så stor och kommer in utanför högra kanten. Ingen spade står i vägen.
- Ryckningen tar 0,24 s.
- Därefter tittar han ner på krabban: huvudet nedåt och blicken på den.

**07 sitta**
- Bäckenet sänks 0,52 och flyttas bakåt 0,5. Låren ligger vågrätt, knäna sticker fram och smalbenen står upprätt.
- Han lutar sig framåt när han sätter sig.
- Lådans topp ligger mot lårens undersida (högst 0,0 px fel).
- Han sitter kvar till slutet. Lagret håller nu, så han reser sig inte på en ruta.
- Händerna är lösa nävar på knäna.

**08 öppna dörr**
- Dörren är 940 px hög, 1,52 gånger hans höjd. Gångjärnen sitter till höger.
- Han står till vänster om dörren, så handen på handtaget och dörrens sväng syns båda.
- Han tar ett steg efter dörren och står aldrig i dörröppningen.
- Den andra handen hänger som en lös näve vid sidan.
- Dörrpanelerna ritas genom interpolation, så ingen linje hoppar.
- Handen sitter på handtaget med högst 0,3 px fel.

## Kontroller: `clip_check.mjs all`

Resultatet ligger i `clip-check-v2.txt`. Alla åtta: CLIP CHECK OK.

| Regel | Planterat fel | Fälls som |
|---|---|---|
| Blinkning utan halvlock | halvlocken borttagna (`planterat-v2-blink-snap-c01.txt`) | "shut with no half lid before/after it" |
| Handform byts i stillhet | öppen hand vid 3,5 s i vila (`hand-snap-c01`) | "changes from relaxed-hanging to open in one frame while it hardly moves" |
| Pose eller led som hoppar | figuren flyttas 60 px på en ruta (`jump-c02`) | "jumps 60 px in one frame" |
| Sko på sko och monokeln som försvinner | v1:s vändning, lyft 0,18, slut i profil (`turn-v1-c03`) | "the lifted R shoe rests on the L shoe", "the monocle vanishes" |
| Föremål genom föremål | spaden tillbaka i krabbans väg (`solid-c06`) | "crab: passes through the spade" |
| Dörrens höjd | dörren 430 px (`door-small-c08`) | "under one and a half times his height" |
| Inramning | zoom 1 (`framing-c01`) | "a medium shot with the figure 32 %" |
| Pekmålets avstånd | målet 130 px från honom (`point-near-c05`) | "only N px away and not on the horizon" |
| Pekningen över 1 s | 1,5 s (`point-long-c05`) | "held 1,50 s, over one second" |
| Det som dyker upp | krabban startar i bild (`enter-inside-c06`) | "starts inside the picture" |
| Grepp | det hållna 20 px från handen (`hand-off-c04`, `hand-off-c08`) | "the wrist 20 px off" |

Två regler har en gräns som jag satte själv:
- **Sko på sko** fäller en lyft sko som vilar på den andra i 2 rutor eller mer och knappt rör sig i sidled (högst 4 px per ruta). En sko som passerar i ett steg räknas inte. Felet i v1 varade i 6 rutor.
- **Pekmålets avstånd:** målet ska vara minst 350 px bort, eller ligga på horisonten. Ett skepp vid horisonten är långt bort i djupled, även om det är nära i bilden.

flat_check och flat_views för rörelseprovet: OK, även efter riggändringarna (andningen och blinkningen).

## Riggen (gäller alla klipp)

- **motion.ts:**
  - Andningen och huvudets rörelse läggs på efter lagren. Andningen sänker bara bäckenet och lyfter bröstet med en lutning, och den som sitter andas med huvudet och bröstet.
  - `Mover.stance(d)` och `walk({ stagger })`: fötterna står förskjutna, och det stängande steget landar bredvid den andra foten, inte på den.
- **ink.ts:** pekfingret sitter på handens ovansida.
- **flat.ts:**
  - Det nedre locket vid leende växer jämnt.
  - Den stängda munnen är 0,2.
  - Pipan följer munnen.
  - Monokelns ring i tre-kvart ritas över näsan.

## Bilder (granskning/bildtyper-2d/)

- `NN-...-v2-blad.jpg`: varannan halv sekund per klipp.
- `NN-...-v2-ruta-N.png`: två rutor i full storlek per klipp.
- `01-sta-och-prata-v2-blinkning-56-71.jpg`: blinkningen ruta för ruta.

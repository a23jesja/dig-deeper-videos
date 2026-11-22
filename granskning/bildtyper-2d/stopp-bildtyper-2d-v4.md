# STOPP: bildtyperna i platt 2D A Knopp, v4 (22 november 2026)

Jesper godkände 01–04 och bad om alla åtta renderade med rättningarna, särskilt 05, 06, 07 och 08. Filerna för v1–v3 ligger orörda.

## Filer (leverans/bildtyper-2d/)

Alla klipp är 1080×1920 i 30 fps. Jag renderade själv, ett jobb i taget, i dubbel storlek med CRF 10 och sedan till CRF 16. Telefonkopiorna har CRF 23. Efteråt fanns 0 processer kvar. md5 står i `md5-v4.txt`, och `md5sum -c` stämmer.

| Fil | Rutor | Storlek | md5 | Telefon | md5 |
|---|---|---|---|---|---|
| 01-sta-och-prata-v4.mp4 | 138 | 1 575 978 B | d0371da5fce071711b56be57c3e3901b | 667 324 B | 2c201f1406c722bfc504ad63b978254d |
| 02-ga-v4.mp4 | 141 | 1 118 104 B | ab41c08b39dcb686c1bfd5036e9e8e0b | 373 452 B | 0ea74487c7d39715440e9556f120ffdd |
| 03-vanda-sig-v4.mp4 | 126 | 1 099 827 B | 2c7455b36b3bc19f6d1bde2e5d5b8964 | 381 747 B | 48d3e007d03f63bf7288c2ec130f3c7a |
| 04-halla-med-bada-handerna-v4.mp4 | 132 | 1 271 751 B | 4f2e316d81880da09995a02032d5e4c4 | 550 932 B | 4d4294592ddba4dace09ab5ebe95ab94 |
| 05-peka-v4.mp4 | 120 | 1 273 384 B | a765e7c0dc7a0b15acfc331e8dec3c62 | 457 077 B | 4a035102dab0e32f3af369ee7eec7379 |
| 06-reagera-v4.mp4 | 120 | 1 153 799 B | 9ea48b19a95fd18f8e7692d0fec5e756 | 372 839 B | a9dab4be5d285c1ceb146709a42d251e |
| 07-sitta-v4.mp4 | 132 | 1 052 241 B | 45705683b7c057059157f3f64ed900b5 | 379 763 B | ce9ba538f17876353ace8c7c0509048c |
| 08-oppna-en-dorr-v4.mp4 | 132 | 748 404 B | 42b5dee62636c98dfec8160ab23789fb | 309 635 B | 963ca6838173231024ca611a07751810 |

**Ljud:** 01 har Georges replik från samma tagning som i v3 (−13,9 LUFS, topp −2,8 dBFS). 02–08 är tysta (−91 dB). Inga nya ElevenLabs-anrop är gjorda.

## Jespers fyra punkter

**05 peka: överarmen får inte bli en klump framför bröstet.**
- Han pekar nu med vänster arm, som sitter på den sida av kroppen som vetter mot skeppet. Han står 25° från kameran i stället för 60°. Armbågen hålls ut från kroppen (`elbowOut`) och är böjd minst 35°.
- Höger arm pekade i profil över bröstet, och därför låg överarmen som en klump framför det.
- Handen stannar en bit före skeppet, så att fingret pekar på det och inte ligger på det.
- Armens läge räknas en gång och hålls under pekningen (se "Fel som hittades under rundan").
- Bild: `05-peka-v4-ruta-50.png`.

**06 reagera: rädd, inte förtjust, och händerna en bit från klorna.**
- Han är rädd hela vägen. Han rycker till bakåt och lutar sig bort. Händerna kommer upp vid axlarna med handflatorna utåt, och han hukar sig lite.
- Minen är vidöppna ögon med små pupiller, ledsna ögonbryn och en grimas med sammanbitna tänder och mungiporna nedåt.
- Han stannar i rädslan när han tittar ner på krabban. Händerna darrar lite (3 Hz) och minen ändras inte.
- I v3 låg händerna vid ansiktet med öppen mun, och det kunde läsas som förtjust.
- Krabban är något mindre (1,5) och Sir står 0,22 m till vänster. Närmaste hand ligger 42 px utöver regelns marginaler, som är 100 px från krabbans mitt och 30 px från klospetsarna. I bild betyder det att händerna är uppe vid axlarna och klorna nere vid marken.
- Bilder: `06-reagera-v4-ruta-20.png` (krabban syns innan han ser den), `-60.png` och `-110.png`.

**07 sitta: lådan i knähöjd, låren ovanpå, fötterna framför, inte på huk.**
- **Rocken:** när han sitter lyfts rockens fåll över låren och framstycket faller bakåt från knät. Byxornas säte ritas bakom höfterna ner till lådan.
- **Varför:** rocken täckte låren ända fram till knäna, så han såg ut att sitta på huk.
- **Händerna:** de vilar på låren bakom knäna, så att knäts böj syns.
- **Kameran:** den är närmare (2,2 i stället för 1,7).
- **Lådan:** dess topp ligger vid lårens undersida, i knähöjd. Smalbenen går lodrätt ner till fötterna framför lådan.
- Bild i mobilstorlek: `v4/07-sitta-i-mobilstorlek.jpg`.

**08 öppna en dörr: handen tar handtaget, en kort paus, sedan öppnas dörren.**
- Sir står vid x 440 i stället för 500, så handtaget syns framför honom innan handen tar det. Förut skymde hans kropp handtaget tills dörren hade öppnats.
- **Tidslinje:**
  - handen når handtaget vid 1,07 s;
  - den håller stilla till 1,6 s;
  - han trycker, lutar sig in (14°) och dörren öppnas till 40°;
  - han släpper vid 3,25 s.
- Näven ligger på mässingsstången med högst 0,7 px fel.
- Ruta för ruta: `v4/08-handen-tar-handtaget-ruta-for-ruta.jpg`.

## 01–04, som Jesper har godkänt: var v4 skiljer sig från v3

Jämförelsen ruta för ruta står i `v4/jamforelse-v3-v4-01-04.txt`. Där finns varje ruta, antal pixlar som skiljer och var de ligger. Varje klipp har dessutom ett blad med de sex rutor som skiljer mest, med v3, v4 och skillnaden i magenta: `v4/jamforelse-NN-...-v3-v4.jpg`. Alla rutor skiljer sig, eftersom gropen nere till vänster finns i varje ruta i v3.

Två ändringar som inte är ritordning hade kommit med i 55520a8. De är tillbakatagna, eftersom klippen är godkända:
- **03:s tempo:** vändningarna tar 1,0 och 0,8 s som i v3, inte 1,3 och 1,0 s. Klippet är 4,2 s som i v3.
- **Kedjans fäste framifrån och i tre-kvart:** det hade flyttats 12 uppåt tillsammans med profilrättningen. Det står nu där det stod i v3.

| Klipp | Var bilden skiljer sig | Varför |
|---|---|---|
| alla | gropen nere till vänster (den mörka "7:an") är borta | bortvald i klippen, den oberoende granskningen av v3 |
| 01 | munnen och pipan i nästan varje ruta medan han talar (15–100) | munspåret rör sig bara på orden, och ingen munform står en enda ruta. Pipan följer munnens hörn, så den flyttar med |
| 01 | kedjans nedre del ligger bakom hans högra arm (bildens vänstra) | armarna ritas efter huvudet framifrån, så kedjan och spännet ligger under armen. Det är ritordningsrättningen |
| 02 | kedjan i profil slutar på västens framkant (från ruta 42) | den slutade inne i rockens axel, den oberoende granskningen av v3 |
| 02 | armarna byter inte ritordning vid ruta 96–97 | närmaste sida följer åt vilket håll han vänder sig. Det är ritordningsrättningen |
| 03 | kedjan i profil, som i 02 (0–29) | som ovan |
| 03 | mustaschens bortre halva i tre-kvart är mindre (0,5) och ligger 6 närmare mitten (30–36 och 80–125) | i v3 stack den ut utanför huvudets kontur, synligt i `jamforelse-03-...jpg` |
| 04 | det slutna ögat i blinkningen (63–64) är en båge nedåt, inte "^" | samma blinkning som i de andra klippen, den oberoende granskningen av v3 |
| 04 | händerna och armarna ligger några pixlar annorlunda vid lådans sidor | armberäkningen är rättad. I v3 hoppade armen mellan två lägen. Greppet ligger på lådans kanter med högst 0,5 px fel |

**En rättelse av min förra anteckning:** jag skrev att ritordningsrättningen också tog bort armens lagerbyte i vändningarna i 03. Det gör den inte. Bytes-kontrollen fäller samma rutor som i v3 (43, 77–79). Bytet sker när kroppen passerar 30° från kameran, där ritordningen går över från profil till framifrån. Rättningen gällde bara armen rakt framifrån, alltså 01 89→90. Jag har inte ändrat det i det godkända klippet. Se "Öppna frågor".

## Fel som hittades under rundan, utöver Jespers punkter

Flimmermåttet, bytes-kontrollen och min egen genomgång av rutorna ledde till följande. Allt är rättat i v4.
- **Tomma ögon (06 och 05).** När blicken var riktad snett nedåt hamnade pupillen utanför ögats oval och klipptes bort helt, så att båda ögonen stod tomma i 06 från ruta 70. Nu hålls pupillen inne i ögat (`pupilIn` i flat.ts). Ny regel `pupil-out` med planterat fel.
- **Pekarmen ryckte (05).** Armens läge räknades om varje ruta från den andande posen och växlade mellan två svar, 11 px fram och tillbaka. Nu räknas armen en gång och hålls.
- **Armbågen ryckte (04).** Armbågen hoppade 5 px fram och tillbaka i tre rutor kring 2,5 s. Nu utgår varje rutas beräkning från armarna vid starten. Detta gäller ett godkänt klipp, och det enda som ändras är att rycket försvinner.
- **Starten i full fart (07).** Bakåtrörelsen började med 20 px på första rutan. Nu glider den igång. Ny regel `start-pop`.
- **Darret (06).** Det var först 7 Hz, alltså fram och tillbaka på 2 rutor, och det blir ett ryck. Nu är det 3 Hz.
- **Vybyte utan rörelse (06, ruta 17, fanns i v3).** Vid 25° förde huvudets vilorörelse det över gränsen mellan framifrån och tre-kvart vid 0,57 s, så teckningen bytte utan att något rörde sig. Nu står han i 32° och är i tre-kvart hela klippet. I förra anteckningen kallade jag ruta 17 för "han reagerar". Det var fel.

## Kontroller (utskrifterna i granskning/bildtyper-2d/v4/)

### Kroppskontrollen: `clip_check.mjs all` (`clip-check-v4.txt`) och `flat_check`/`flat_views` (`flat-check-v4.txt`)

```
c01 CLIP CHECK OK      c05 CLIP CHECK OK
c02 CLIP CHECK FAILED: 1   (103 sir: the knL jitters, turning back 2 times in 6 frames (moves 7.9, 5.2, 9.8, 8.3, 6.6, 13.6 px))
c03 CLIP CHECK OK      c06 CLIP CHECK OK
c04 CLIP CHECK OK      c07 CLIP CHECK OK
                       c08 CLIP CHECK OK
FLAT CHECK OK: feet on the ground line, none sunk, none sliding, never both off the ground except in the run
VIEWS OK: every turn goes through a three-quarter drawing held 2 frames or more
```

**02:** den nya regeln för ryck hittar ett knä som går 6,6 px bakåt och sedan 13,6 px framåt i det stängande steget (ruta 101–103). Det finns redan i v3, som Jesper godkände. Jag har inte rört gången i ett godkänt klipp. Se "Öppna frågor".

**Nya regler med planterade fel.** Alla 26 planterade fel fälls med v4-koden (`planterade-fel-v4.txt`). Nya i v4:

| Regel | Planterat fel | Fälls som |
|---|---|---|
| Pupillen ritad inne i ögat | pupillen utan spärren (`pupil-out`, 06) | "the pupil drawn 17 % past the eye's inner edge (an empty eye)" |
| Led som rycker fram och tillbaka (minst 2 vändningar bland rörelser över 2 px inom 6 rutor) | armbågen ±4° varannan ruta (`jitter`, 05). Fäller också det tidigare utkastet av 05 i ruta 48 | "the wrL jitters, turning back 2 times in 6 frames" |
| Start i full fart (stilla, sedan över 5 px på en ruta) | 07:s bakåtrörelse utan `glide` (`start-pop`) | "the pelvis starts at full speed, still and then 9.3 px in one frame" |

Planteringen `crab-edge` slutade fälla sitt fel när regeln började mäta klospetsarna, eftersom den bara flyttade krabbans kropp. Nu flyttar den spetsarna också, och felet fälls igen.

### Flimmermåttet: `flicker.py` (`flimmer-v4.txt`)

Med ansiktets cirkel per ruta som ögonområde fäller måttet alla åtta:

```
c01 FAIL 26 rutor   c02 FAIL 68   c03 FAIL 15   c04 FAIL 7
c05 FAIL 15         c06 FAIL 36   c07 FAIL 36   c08 FAIL 10
```

**Vad det fäller.** Måttet räknar en pixel som skiljer sig från både rutan före och rutan efter, och förklarar bort jämn rörelse upp till 12 px per ruta. I klippen är figuren stor i bild:
- handen i "dig it up" (01) rör sig 100 px per ruta;
- huvudet i gången (02) och i sättningen (07) rör sig 11–13 px per ruta;
- ryckningen i 06 och krabbans ben går fortare än så;
- blinkningarna i 04 och 05 räknas också.

För att skilja rörelse från flimmer sorterade jag varje räknad pixel efter vad som finns på platsen (`flimmer-efter-plats-v4.txt`, verktyget `scripts/flicker_parts.py`):
- **snabb del:** en kroppsdel som rör sig mer än 12 px den rutan, eller krabban medan den går;
- **ansikte:** ansiktet medan det ändras (blinkning, mun, blick);
- **övrigt:** allt annat, där bilden ändras på en ruta utan att något rör sig.

```
c01 övrigt högst 480 px i bilden, 5 i ögat      OK
c04 övrigt högst 93, 7                          OK
c05 övrigt högst 322, 11                        OK
c06 övrigt högst 460, 12                        OK
c02 övrigt högst 4599, 2663   FAIL 45 rutor: gången, huvudet 11–13 px per ruta med stegets gung, precis vid måttets gräns
c03 övrigt högst 4377, 3026   FAIL 9 rutor: vybytena i vändningarna (29–30, 36–39, 79–80), som hör till det godkända utseendet
c07 övrigt högst 1925, 442    FAIL 19 rutor: huvudet 9–13 px per ruta när han går från bakåt till nedåt; farten sjunker till 5 och tar fart igen
c08 övrigt högst 330, 140     FAIL 5 rutor (14–18): tunna konturer när han lutar sig 2–4 px per ruta, under en pixels förflyttning mellan rutorna
```

Jag har tittat på de fällda rutorna i full storlek. Det som återstår är rörelse och vybytena i 03, inte något som blinkar till.

Måttet ledde till fyra verkliga fel, som är rättade: pekarmen i 05, darret i 06, starten i 07 och de tomma ögonen.

Planterat fel: ett tomt öga i 05, ruta 44. Det fälls med 111 475 px (`flimmer-planterad-c05.txt` och `-kontroll.txt`). `flicker.py --plant` planterar nu bara ögat när bilden saknar text.

### Bytes-kontrollen: `clip_parts.mjs` och `part_diff.py` (`part-diff-v4.txt`)

```
c01 OK   c02 OK   c05 OK   c07 OK
c03 FAILED 4: armR 43, 77, 78, 79
c04 FAILED 13: armL 49–53, armR 49–50, 88–94
c06 FAILED 3: head 73, 78, torso 73
c08 FAILED 6: armL, head, torso 15 och 19
```

- **03:** armens lagerbyte i vändningarna. Samma rutor som i v3 (se rättelsen ovan).
- **04:** lådan lyfts (49–53) och sänks (88–94) i armarnas ruta. Lådan är ingen kroppsdel, så kontrollen räknar inte dess rörelse. Händerna och armarna står still på lådans sidor. Ingenting byts.
- **06:** huvudet vrids neråt mot krabban. Alla konturer flyttar sig, och mössans kant flyttar sig mer än de två leder kontrollen mäter (2–2,6 px).
- **08:** han lutar sig (2–4 px). Samma rutor som i v3.

Planterat fel: en fläck på armen i en ruta, ljus på mörkt och mörk på ljust. Den fälls i 04 (ruta 66–67) och i 08 (66–67), se `part-diff-planterad-c04.txt` och `-c08.txt`. I 04 fälldes inte den mörka fläcken, eftersom den hamnade på lådans mörka del.

## Öppna frågor

1. **02, ruta 101–103:** knät går 6,6 px bakåt och sedan 13,6 px framåt i det stängande steget. Det finns redan i v3. Vill du att jag rättar det i `motion.ts`? Det ändrar gången i ett godkänt klipp.
2. **03, rutorna 43 och 77–79:** armen byter lager när kroppen passerar 30° i vändningarna. Det finns redan i v3. Att rätta det kräver att armbytet läggs där armen inte ligger över kroppen, och det ändrar ett godkänt klipp.
3. **De långsammare vändningarna i 03** (1,3 och 1,0 s) finns kvar som förslag, men inte i v4.

## Bilder (granskning/bildtyper-2d/)

- `NN-...-v4-blad.jpg`: varannan halv sekund per klipp.
- `NN-...-v4-ruta-N.png`: rutor i full storlek. 05: 30 och 50. 06: 20, 60 och 110. 07: 20 och 125. 08: 20, 40, 80 och 120.
- `v4/07-sitta-i-mobilstorlek.jpg` och `v4/08-handen-tar-handtaget-ruta-for-ruta.jpg`.
- `v4/jamforelse-NN-...-v3-v4.jpg` för 01–04.

Koden: 827e52e, 209153d, 2f0c0ea, 5c90cdd, 9a9fa39, 7889479, 99b2e26 och b146233.

# STOPP: bildtyperna i platt 2D A Knopp, v5 (22 november 2026)

v5 rättar granskningen av v4 (05, 06 och 07 GÖR OM) och Jespers fyra ja ("Ja på alla fyra då"): näsan, knät i 02, armens lagerbyte i 03 och de långsammare vändningarna. Ingen v1–v4-fil är ändrad.

## Filer (leverans/bildtyper-2d/)

Alla klipp är 1080×1920 i 30 fps. Jag renderade själv, ett jobb i taget, i dubbel storlek med CRF 10 och sedan till CRF 16. Telefonkopiorna har CRF 23. Efteråt fanns 0 processer kvar. md5 står i `md5-v5.txt`, och `md5sum -c` stämmer.

| Fil | Rutor | Storlek | md5 | Telefon | md5 |
|---|---|---|---|---|---|
| 01-sta-och-prata-v5.mp4 | 138 | 1 575 276 B | 527be516cde6c1311604a2ebbe132c5e | 667 611 B | 2e71233620fdfeadb29e69725588da62 |
| 02-ga-v5.mp4 | 141 | 1 116 747 B | 80a8c568f81b3dde81987fb13764474b | 376 768 B | e1f8336aaf266142309d480e9666951f |
| 03-vanda-sig-v5.mp4 | 138 | 1 191 879 B | 72b39bede2597fb46b1379a886790c01 | 409 314 B | 0ff29b248125291b4abef0d3a80f4573 |
| 05-peka-v5.mp4 | 120 | 1 244 310 B | db7998e954673b11c09cc8986da314ee | 438 737 B | b15f04d0f96c119a2d090491bbd3ea3a |
| 06-reagera-v5.mp4 | 120 | 1 149 791 B | 9af9ede12ac554f5f03670ff148dd64e | 373 895 B | f2ac5f08db3049e52f47e9ff5b38bff1 |
| 07-sitta-v5.mp4 | 132 | 1 066 017 B | 496e2557eb357f9a5def568b1441af4c | 377 885 B | 504a6eaddf52e41d6ca31c7ccef94a65 |

**04 och 08 står kvar som v4.** Koden för v5 ger samma bild som v4 i alla 132 rutor för båda, 0 pixlar skiljer (`v5/jamforelse-v4-v5-01-04-08.txt`). 08 är godkänd av granskningen.

**Ljud:** 01 har samma tagning som förut (−13,9 LUFS, topp −2,8 dBFS). 02–07 är tysta (−91 dB). Inga nya ElevenLabs-anrop är gjorda.

## Granskningens punkter

**05 peka**
- Skeppet är litet (0,55) och ligger långt bort, längst till höger på horisonten (1200). Mellan fingertoppen och skeppet syns minst 162 px himmel under hela armens rörelse, och handen passerar aldrig framför skeppet.
- **Ny regel:** från den ritade fingertoppen (1,2 gånger handen räknat från handleden), handens mitt och handleden ska det vara minst 150 px i bilden till skeppets ruta, från att armen lyfts tills den är nere.
- Blicken är mot oss först, går till skeppet strax innan armen lyfts (0,55 s), stannar där under pekningen och kommer tillbaka till oss efter (2,85 s). Bild: `v5/05-peka-v5.jpg`.
- **Armen är ändrad, fast granskningen bad mig låta den vara.**
  - Med v4-armen nådde fingret nästan fram till seglet. Bilden kan inte göras bredare, eftersom figuren då hamnar under 70 % av höjden i en mellanbild.
  - Med en kortare sträckt arm i samma vinkel gick underarmen över pipan och hakan.
  - Nu pekar han med böjd armbåge: överarmen intill sidan och underarmen ut mot skeppet under pipan. Överarm och underarm syns som två delar, och armen korsar inte bröstet.
  - Regeln för riktningen mäter nu längs fingret, från handleden till fingertoppen, i stället för från axeln. Fingret pekar inom 2° från skeppet, och fingret är ute 30 rutor.
  - Nytt planterat fel för fel riktning.

**06 reagera**
1. **Krabban går.** Varje fot står still på marken medan kroppen rör sig över den och tar sedan ett steg framåt, tre ben i taget. Stegen är anpassade så att alla fötter står på marken när krabban stannar. **Ny regel:** en fot som står på marken både rutan före och rutan efter får inte flytta sig mer än 1 px. Utfall: 0,00 px. Bild: `v5/06-krabbans-gang-ruta-12-40.jpg`.
2. **Pipan sitter i mungipan.** När mungiporna dras nedåt följer pipan nu med ner till mungipan vid tänderna. Förut stod den kvar vid mustaschen. Med sammanbitna tänder hänger pipan hälften så mycket. Huvudet hålls fritt från handen, och pipans huvud har en lucka till den bortre handen. Närmaste hand ligger 81 px utöver marginalerna från klorna. **Ny regel:** ingen hand eller underarm inne i huvudets cirkel.
3. **Tummarna.** En upplyft öppen hand har nu tummen mot kroppens mitt, även när kroppen vrids. Förut avgjordes det bara av kroppens vridning, och båda händerna fick samma teckning. **Ny regel.** I 06 har den nya skyddsställningen redan tummarna inåt även med den gamla regeln, så där bevisar inte det planterade felet något. Det fälls däremot i 01 (16 rutor).
4. **Händerna går rakt upp.** Händerna knyts och dras först upp intill sidorna till brösthöjd, sedan en kort bit ut till skydd med handflatorna utåt. De öppnas först mot slutet, så ingen öppen handflata sveper mot krabban. Huvudet är halva hans längd, så händer vid axlarna låg mot hakan. Därför står skyddet i brösthöjd, ut åt sidorna. Bild: `v5/06-hander-pipa-ruta-38-115.jpg`.

**07 sitta**
- Lårets undersida ligger nu på lådans överkant. Felet var mitt: benets mått (27) är halva bredden, men lådans placering och regeln räknade med hälften av det. Låret sjönk därför 15 px in i lådan.
- Kroppen sänks 0,43 i stället för 0,52, så lådan står kvar i knähöjd och låren ligger vågrätt på den.
- **Regeln** använder nu den ritade undersidan. Den fäller v4:s låda (planterat fel `seat-v4`).
- Bild: `v5/07-laret-pa-ladan.jpg`.

## Jespers fyra ja

**a. Näsan över ögonen och monokelns ring i alla vyer.**
- I tre-kvart ritades ringen efter nosen, så vid den bortre monokeln (tre-kvart åt vänster) låg ringen över nosen. Den ordningen kom från granskningen av v1. Nu ritas nosen sist i alla vyer.
- **Ny kontroll:** `scripts/face_order.mjs` spelar in ritordningen i varje vy och kräver att nosen ritas efter ögonvitorna och ringen. Planterat fel: v4:s ordning fälls i tre-kvart åt vänster.
- Bild: `v5/03-nasan-v4-v5.jpg`.

**b. Knät i 02.**
- I gångens stängande steg sjönk hälen fortare än det låga steget lyfte foten. Ankeln gick ner, upp 3 px och ner igen, och knät följde med.
- Nu sänks hälen i stegets takt, och foten landar flatare (−8° i stället för −14°). Det gäller bara det stängande steget.
- Bytes-regeln för ryck klarar 02. Bild: `v5/02-knat-v4-v5-ruta-98-106.jpg`.

**c. Armens lagerbyte i 03.**
- Den bortre armen överlappar kroppen i alla vinklar (3 700–6 300 enheter), så ett byte syns var det än läggs.
- Nu glider rockens kant gradvis över ärmen när han vrider sig, under cirka 8 rutor, med en konturlinje längs snittet. Det sker mellan |sin| 0,15 och 0,8. I ändlägena är ordningen exakt som profil respektive framifrån.
- Bild: `v5/03-armen-i-vandningarna.jpg`.
- I 05 och 06, där han står vriden utan att vrida sig, används vanlig ritordning.

**d. De långsammare vändningarna** i 03: 1,3 och 1,0 s. Klippet är 4,6 s.

## Granskarens två obekräftade punkter

**Skon i 03, ruta 29–33: stämmer.**
- Vändningens fotvridningar lyfte hälen 30°, som ett gångsteg. Hälen stod 50 px upp medan foten vreds på trampdynan, och skon, sedd förkortad, ritades 35° snett på ett hörn.
- Nu lyfts hälen 5° före en vridning och landar platt. Skons lutning tonas in mellan 0,15 och 0,4 synlig fotlängd i stället för att slå om vid en fjärdedel.
- **Nya regler, var och en med ett planterat fel:**
  - en förkortad sko på marken får inte luta mer än 15°;
  - benets ände ska ligga i skon.
- Mina första två försök gav en sko som svävade 100 px upp på skenbenet, respektive glapp mellan sko och ben. Båda är borta.
- Bild: `v5/03-skon-v4-v5.jpg`.

**Tummen i 01, ruta 90–103: stämmer.**
- Den vinkande handen hade tummen på utsidan. Nu sitter den mot kroppens mitt (regeln ovan).
- 01 är därför renderad som v5. Rutorna 89–104 skiljer sig från v4. Övriga skillnader är enstaka pixlar med högst 47 nivåers skillnad, alltså kodarbrus.
- Bilder: `v5/01-tummen-v4-v5.jpg` och `v5/jamforelse-01-sta-och-prata-v4-v5.jpg`.

## Kontroller (utskrifterna i granskning/bildtyper-2d/v5/)

**Kroppskontrollen** (`clip-check-v5.txt`):
- alla åtta CLIP CHECK OK;
- `flat_check` OK, `flat_views` OK och `face_order` OK (`flat-och-ansikte-v5.txt`).

**Planterade fel** (`planterade-fel-v5.txt`):
- 35 av 36 fälls;
- det som inte fälls är tummen i 06 (se ovan), medan samma plantering fälls i 01.

**Flimmermåttet** (`flimmer-v5.txt`):
- det fäller alla sex, som i v4, eftersom figurerna rör sig mer än måttets 12 px per ruta;
- sorterat efter plats (`flimmer-efter-plats-v5.txt`) klarar sig 01, 05 och 06;
- i 02 och 07 är det som återstår huvudet vid måttets gräns (11–13 px per ruta);
- i 03 är det vybytena i vändningarna (32–33, 42–43, 76, 91);
- planterat tomt öga i 05, ruta 45: fälls med 107 113 px.

**Bytes-kontrollen** (`part-diff-v5.txt`): 01, 02, 05 och 07 OK.
- **03:** armen i 88–95 är rockens kant som glider över ärmen. Den ändrar bilden utan att lederna rör sig, så kontrollen fäller den av konstruktion. Toppvärdet är 14,9; v4:s byte var 9,4 på en ruta. Övriga: 49, 78 (benet, 7,5) och 103 (små). Jag har tittat på rutorna i `v5/03-armen-i-vandningarna.jpg`.
- **06:** huvudet i 69–79 vrids neråt. Konturerna flyttar sig mer än de två leder kontrollen mäter. Samma slags rutor som i v4.
- **Planterad fläck:**
  - en fläck på en fjärdedel av armens ruta fälls i 07, ruta 120, och i 05, ruta 60 (`part-diff-planterad-c07-ruta120.txt` och `-c05-ruta60.txt`);
  - en fläck på 60 px i en stor del fälls inte, eftersom den ändrar delens medelvärde bara 2,5 mot kontrollens krav på 6. Så små saker i så stora delar ser kontrollen inte;
  - filerna `part-diff-planterad-c07.txt` och `-c05.txt` visar de fläckar på 60 px som inte fälldes.

## Bilder (granskning/bildtyper-2d/)

- `NN-...-v5-blad.jpg` och `NN-...-v5-ruta-N.png` för 01, 02, 03, 05, 06 och 07.
- I `v5/`: alla bilder som nämns ovan.

Koden: 35cf6bc, 6652865, c5281b1, fba815b, ee73293, 368903e och följande commits fram till STOPP-commiten.

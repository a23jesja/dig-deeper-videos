# STOPP: bildtyperna i platt 2D A Knopp, v1 (21 november 2026)

Åtta klipp, ett per bildtyp. Jesper godkänner dem ett och ett.

## Filer (leverans/bildtyper-2d/)

Alla klipp är 1080×1920 i 30 fps, yuv420p, tv och bt709. Jag renderade själv, i förgrunden och ett jobb i taget, med minnesspärren. Det var dubbel storlek med CRF 10, sedan nerskalat med lanczos till CRF 16. Telefonkopiorna har CRF 23. Efteråt fanns 0 renderingsprocesser kvar. md5 för alla filer står i `md5-v1.txt`.

| Fil | Längd | Storlek | md5 | Telefonkopia | md5 |
|---|---|---|---|---|---|
| 01-sta-och-prata-v1.mp4 | 4,60 s | 1 240 855 B | 03e51a3ea39d0836a6d3f3e93b792d1d | 413 099 B | 7e27dea1a4c624e030d52056963b05ac |
| 02-ga-v1.mp4 | 5,00 s | 890 229 B | e1d74d5af12f5b06a136b66a608e4471 | 271 557 B | 84fca09f97ebff6bb530c017a643b368 |
| 03-vanda-sig-v1.mp4 | 4,00 s | 648 298 B | cde10dee0c8787495e48e5481c33a628 | 195 084 B | 20f992d9621739783bbc6e366c9af73a |
| 04-halla-med-bada-handerna-v1.mp4 | 4,40 s | 714 175 B | d17b24a1d5c49986226139452ff17d8c | 194 696 B | 18bc62047ba0c1d7a9cc53641cb9a626 |
| 05-peka-v1.mp4 | 4,00 s | 582 359 B | 61dc8d1f14ebece92720d4b25d5c0530 | 161 608 B | 91b5ef19beb9125a23c52f3d26045834 |
| 06-reagera-v1.mp4 | 4,00 s | 792 159 B | 5c9badbbecf5b0ee7926a0cabe67a750 | 221 709 B | 84b800284c5a6d6f4e9fcb82c2b06f8f |
| 07-sitta-v1.mp4 | 4,40 s | 523 180 B | f09f0706406d7113f468b349d78db55c | 151 733 B | e19a7fffbed8eda79237c9cdda3c6250 |
| 08-oppna-en-dorr-v1.mp4 | 4,40 s | 452 925 B | 306527ab3aaa0053fc9c682e44b6541e | 181 521 B | 0092537966c297411c59e68e883265f1 |

**Ljud:**
- Bara 01 har ljud: Georges replik "Every legend has a grain of truth. Let us dig it up." ([OWN], ingen fakta). Det mäter −13,9 LUFS integrerat med topp −2,8 dBFS.
- 02–08 är tysta (max −91 dB).
- Inga ljudeffekter och inga fotsteg.

**ElevenLabs:**
- 52 tecken × 3 tagningar = 156 tecken. Godkänt var högst 208.
- Alla tre tagningarna hade 0 ordfel enligt faster-whisper, och tagning 0 valdes.
- character_count är 2 176 nu. Värdet före kapades i min egen utskrift. Senast antecknade värde var 2 065, efter rörelseprovet, men räknaren släpar.
- Nyckeln lästes bara ur miljövariabeln (`engine/voice/el_line.py`).

## De åtta klippen

| # | Bildtyp | Vad som händer | Bakgrund |
|---|---|---|---|
| 01 | Stå och prata | Sir mot kameran säger repliken. Förklarande händer på "grain of truth" och en lyft hand på "dig it up"; munnen följer rösten. Ada står bredvid, tittar på honom och nickar på slutet. Båda står i vila. | öken |
| 02 | Gå | Sir går in från vänster i profil, korsar mitten och stannar. I vila tittar han mot kameran. | öken |
| 03 | Vända sig | Från profil åt höger, via tre-kvart, till framifrån. Han håller kvar och fortsätter via tre-kvart till profil åt vänster. Före varje vändning dippar huvudet åt andra hållet, och fötterna stegar runt. | öken |
| 04 | Hålla med båda händerna | Sir framifrån håller en liten trälåda vid midjan och lyfter den 16 px för att titta på den. Lådans överkant är alltid under hakan. | öken |
| 05 | Peka | Sir ser skeppet långt ute på havet. Blicken går dit först. Armen lyfts med armbågen lite böjd, pekningen hålls 0,90 s och armen sänks. Ingen annan finns i bild. | hamn |
| 06 | Reagera | En krabba kommer in från högra bildkanten. Han rycker till med armarna upp, stora ögon och hängande pipa, och förblir vaksam när den stannar och viftar med en klo. | öken |
| 07 | Sitta | Sir står framför en låda och sätter sig bakåt på den. Lådans topp tar emot sätet, fötterna står kvar på marken och händerna går till knäna. | öken |
| 08 | Öppna en dörr | Sir står till höger om ett husets dörr. Den närmre handen tar handtaget, och dörren vrids mot oss på gångjärnen: den fria kanten går runt och blir lite större när den kommer närmare. Han tar ett steg efter och släpper när dörren står öppen. | gata |

## Jespers tre punkter, i gestbiblioteket

1. **Peka:**
   - `acting.ts pointAt` håller pekningen högst 1 s.
   - `gestures.ts` har punkten i pekgestens beskrivning och i `LIBRARY_RULES`.
   - Klippkontrollen fäller:
     - en pekning som hålls över 1 s;
     - ett mål inom 150 px från en annan figur;
     - ett finger som siktar mer än 20° fel;
     - ett ansikte som inte är vänt mot målet.
2. **Djur och saker som dyker upp:** de kommer in utanför bilden eller ur ett hål som syns från första rutan. Kontrollen fäller en start inne i bilden, och ingen hand får komma inom 40 px av djuret.
3. **Vila:**
   - Den som står still flyttar vikten, andas och rör huvudet lite (motion.ts).
   - Andningen och huvudets rörelse läggs nu på efter rörelselagren, så att ett lager som håller huvudet eller bäckenet inte stoppar dem.
   - Andningen sänker bara bäckenet och lyfter bröstet med en lutning på 0,9°, så att den syns i profil.
   - Den som sitter andas med huvudet och bröstet, inte med bäckenet.
   - Kontrollen fäller en figur som är helt still en sekund. Den fångade 07 och 08 under bygget.

## Kontroller: `node scripts/clip_check.mjs all`, varje ruta

Resultatet ligger i `clip-check-v1.txt`. Alla åtta: CLIP CHECK OK.
- **Fötterna:** skon vilar på linjens överkant (0,0 px in i den), ingen glidning (0,0 px) och inga svävande skor.
- **Vyerna:** varje vändning går via tre-kvart i minst 2 rutor. I 03 gäller det rutorna 25–28 och 69–72.
- **Pupillerna:** aldrig under 30 % utan rädsla, och aldrig ett hopp större än en tredjedel. I 06 är minsta värdet 50 % (rädd) och största steget 15 %.
- **Huvudet:** inom bilden. I 02 är undantaget att han går in, till 1,25 s.
- **Grepp och kontakter:**
  - 04: handlederna mot lådans sidor, högst 0,4 px fel.
  - 08: handen på handtaget, högst 0,3 px fel.
- **Sätet** i 07: högst 0,0 px från lådans topp.
- **Pekningen** i 05: hålls 0,90 s, med målet långt från alla andra figurer.
- **Krabban** i 06: startar utanför högra kanten. Närmaste hand ligger 232 px bort.

## Planterade fel: varje ny regel fälls

| Fil | Planterat | Fälls som |
|---|---|---|
| `planterat-point-long-c05.txt` | pekningen hålls 1,5 s | "held 1,50 s, over one second" och fingret ur sikte |
| `planterat-point-near-c05.txt` | målet på en figur (Ada intill) | "the target is within 150 px of ada" (27 rutor), inte vänd mot målet |
| `planterat-enter-inside-c06.txt` | krabban startar i bild | "enters from the right but starts inside the picture" |
| `planterat-hand-off-c04.txt` och `-c08.txt` | det hållna 20 px från handen | "the wrist 20 px off" i varje ruta |

**Under bygget fångade kontrollerna riktiga fel:**
- 08: handtaget kom utom räckhåll (upp till 91 px). Sir flyttades närmare och tar ett längre steg tidigare, och arm-IK:n prövar flera startlägen.
- 07 och 08: figuren var helt still. Andningen gjordes om.
- 02: huvudet var utanför kanten för länge.
- 07: sätet var 3,3 px fel.

**Min egen granskning i full storlek rättade:**
- 04: lådan täckte munnen och mustaschen. Den hålls nu vid midjan.
- 05: pekarmen gick över ansiktet och pipan, när målet var seglen. Den siktar nu på skrovet.
- 05: jag hade ritat ett eget skepp, men hamnbakgrunden har redan ett.
- 07: sätet var för lågt och han hukade. Sätet är nu i knähöjd, med händerna på knäna.

## Bilder (granskning/bildtyper-2d/)

- Ett blad per klipp med varannan halv sekund: `NN-...-v1-blad.jpg`.
- Två rutor i full storlek per klipp: `NN-...-v1-ruta-N.png`.

## Kod

- `engine/src/craft/clips/clipKit.ts`: figurernas uppspelning med riggens v5-rättningar och arm-IK genom sökning, samt säten, kontakter, pekningar och det som dyker upp.
- `clips.ts`: de åtta klippen.
- `FlatClip.tsx`: ritkomponenten. Kompositionerna heter `Bildtyp-c01` till `c08`.
- `engine/scripts/clip_check.mjs`: klippkontrollen.
- `engine/audio/voice_clip.py`: ljud och munspår.
- `engine/voice/el_line.py`: George.

## Att känna till

- **03:** örat i profil sitter som i det frysta utseendet.
- **08:** Sirs huvud skymmer en del av husets dörrkarm, men handtaget, handen och dörrens vridning syns.
- **07:** lådan är låg (cirka 85 px), eftersom Knopps ben är korta.

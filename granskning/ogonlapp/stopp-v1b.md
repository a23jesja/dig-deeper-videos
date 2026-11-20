# STOPP: The Pirate Eye Patch Trick, v1b (20 november 2026)

**Kod:** commit bb2e631, `engine/src/craft/shorts/eyePatch.ts`.
**Ljud:** rösten är bm_george (Sir Digsworth, syns inte), musiken är shantyn. På däck hörs hav, vind, måsar och flaggan, och under däck vattnet mot skrovet och knarr. Ljudet har inga stegljud.

**v1 skickades inte.** I min egen granskning i full storlek såg jag att kistans ringhandtag stack ut utanför nävarna. v1b håller kistan nära kroppen så att nävarna sitter på handtagen. v1-filerna ligger kvar orörda.

## Filer (`C:\Users\sweje\dig-deeper-videos\leverans\eye-patch\`)

| Fil | Storlek | md5 |
|---|---|---|
| eye-patch-v1b.mp4 | 21,5 MB | 663c69b75985ec4abb317bd25e064308 |
| eye-patch-v1b-telefon.mp4 (1080x1920, under 29 MB) | 7,9 MB | f0cfea0ad1c2ba51152429335fe32c25 |
| eye-patch-v1b-liten.mp4 (540x960) | 3,2 MB | 53ec6bab061c2b9c3d9a84f52eaba79b |
| thumbnail-v1b-1.png / -2.png / -3.png | | 1d376ed4dd7f5576d2afef331e05d507 / 47073fbd53974ab4a4f53522f8d65f4e / c81437a5e0a5a740b6d915764fd75bfd |

Granskningsmaterialet ligger i `C:\Users\sweje\dig-deeper-videos\granskning\ogonlapp\`:
- `v1b-sek0-5-10fps.jpg`: sek. 0–5 i 10 bilder/s i mobilstorlek, i en kontaktkarta, plus de 50 rutorna i mappen `v1b-sek0-5-10fps\`;
- `v1b-2fps.jpg`: hela filmen i 2 bilder/s.

## De sex punkterna från granskningen

1. **Öppning b.** I ruta 1 läser piraten loggboken i mörkret medan kamraten famlar bakom honom. Öppningen är ljusare än resten av hytten: tonen är nästan neutral i mitten.
   - Rösten börjar i ruta 1 och ett knarr ligger på ruta 1.
   - Klippen kommer vid 2,42 s (kamraten i mörkret) och 4,78 s (däck i solen).
   - **hookscore** för "Why did pirates wear eye patches? One idea: to see in the dark." blir 36/100, **WEAK**. Det svagaste är STAKES (22). Frågan i sig får 34.
   - Frågeformen ligger fast i formatet, och frågan på skärmen ska stå kvar. Därför har jag inte skrivit om den.
2. **Frågan på skärmen** står nu överst, med texttopp vid 150 px. Undertexterna ligger också överst (capsTop 160).
3. **Däcksbilderna:**
   - **sun:** han håller en liten kista med båda händerna i handtagen och förflyttar vikten. Kamraten kisar.
   - **patch, 14,2–17,1 s:** en närbild på lappen. Huvudet är helt med luft ovanför, kroppen skärs vid bröstet och armarna hänger.
   - **nobody, 25,5–28,9 s:** en annan inramning, lågt från hans sida mot seglet. Han förflyttar vikten och vrider huvudet.
   - **end:** samma inramning som däcksbilderna. Bubblan "Arr. Which eye was it?" leder in i öppningen igen.
   - **Vinden** rör den svarta flaggan på stången bakom honom i alla däcksbilder. Kläderna rör sig inte, eftersom figurerna är kort (godtaget).
   - **Rörelse:** sun och nobody rör sig hela vägen. I patch rör sig huvudet och ansiktet. end är lugnare, för loopens skull.
4. **Han läser** (17,1–19,4 s och i öppningen). Boken är vänd mot honom, så vi ser omslaget: läder med guldkant och kompassros. Hans fingrar ligger på omslaget och tummarna på sidorna bakom. Han håller den lätt bakåtlutad, och blicken och ögonlocken är sänkta mot boken (Shot.look och blicktesterna). Greppet är 04:s, sett från andra hållet.
5. **"No picture or record from their time says so"** (28,9–32,2 s). På väggen mellan fönstren hänger en gammal bild av pirater, ritad av oss i träsnittsstil: tre pirater, båda ögonen synliga och ingen lapp. Kameran åker in mot bilden.
6. **Kamratens händer** är i brösthöjd med avslappnade fingrar, och de varierar mellan bilderna:
   - båda händerna framför bröstet;
   - en framåt och en vid bältet;
   - båda tätt intill bröstet, den ena högre.

   Han är vriden mot profil, så att armarna inte sträcks mot linsen.

## Testerna (hela filmen, varje ruta)

| Test | Resultat |
|---|---|
| film check (text, bubblor, klipplängd, kropp och rörelse) | OK, 12 bilder, 35,6 s |
| motion (inklusive öra, jerk för alla saker, släpp, underarm, de tre lapptesterna och närbildsregeln) | 0 fel |
| body (inklusive sak mot fast sak) | 0 fel |
| grips | OK |
| QA (short_qa) | 6 x "EMPTY" (det mörka golvet i hyttbilderna, se nedan) och 1 x "WHITE" i bild 10 (nobody): 24 rutor med 3,2 % vitt i nedre halvan, gränsen är 3 %. I v1 var det 59 rutor. Däcket är solbelyst trä, och i ruta 830 i full storlek är det inte vitt. |

**Närbildsregeln i edge-testet:**
- huvudet ska vara helt med luft ovanför;
- kroppen får bara skäras av nederkanten, mellan axlarna och bröstet;
- ingen arm får skäras halvvägs av en sidokant.

Planterade fall:
- AV, närbild som skär huvudet: fälls.
- AW, närbild som skär en arm: fälls.
- AX, kontroll: klarar testet.

Utskrift: `C:\Users\sweje\dig-deeper-videos\granskning\ogonlapp\proof-motion-med-lapptester.txt`.

## Min egen granskning

Jag har gått igenom filmen i 2 bilder/s, öppningen i 10 bilder/s och kontaktpunkterna i full storlek:
- greppet om boken;
- kistan och handtagen;
- kamratens händer;
- sittande på kistan, med händerna på låren;
- närbilden;
- lappen i varje bild.

Lappen sitter på hans högra öga på däck och på hans vänstra under däck, i alla bilder.

**Kvar att veta:**
- QA flaggar en tom nedre tredjedel i hyttbilderna. Det är golvet i mörkret, och samma flagga har funnits i tidigare hyttfilmer.
- Hyttbilderna med bara kamraten (2,4–14,2 s) är tre bilder i rad med honom i mörkret. Vinklarna och händerna varierar, men det är samma person i nästan 12 s, uppdelat av däcksbilden 4,8–7,2 s.

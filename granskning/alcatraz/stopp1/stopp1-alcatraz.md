# STOPP 1: Alcatraz 1962, bildlista, riskblad, kroklabb och rekvisita (22 november 2026)

Filmen är byggd som utkast i platt 2D A Knopp och renderad i vanlig storlek för det här bladet. Den slutliga renderingen i dubbel storlek görs efter ditt svar.

Manus och källor är oförändrade från stopp-manus-kallor-bildlista-v2.md (GODKÄND). Titeln är "Three Men Vanished From Alcatraz in 1962".

## Rösten (George)

- **Tolv meningar, tre tagningar var.** Ingen mening gick över sin del, och inget anrop gjordes utöver förhandsräkningen.
- **character_count:** 2 176 före och 2 788 efter (läst två gånger, senast 17:50), alltså 612 förbrukade. Det är under de godkända 1 980.
- **Att ha med sig:** varje rad skickades med ett osynligt radslut (\r) i slutet, eftersom skriptet läste raderna med Windows radslut. Det blir ett tecken till per tagning, högst 36 tecken totalt. Förbrukningen enligt kontot ligger ändå långt under gränsen.
- **Valda tagningar:** alla har 0 ordfel enligt faster-whisper utom mening 7. Där skriver Whisper "June 11" för "June eleventh". Om George säger "eleventh" eller "eleven" kan jag inte höra. Ordet står först på lyssningslistan.
- **Nyckelkontrollen** (`nyckelkontroll.txt`) söker efter nyckelns värde, läst ur miljövariabeln och aldrig utskrivet, och efter nyckelformade strängar (sk_ följt av 30 tecken eller fler). Den visar **0 träffar** överallt:
  - repots spårade (792) och ospårade (419) filer, utom video, ljud och bilder;
  - de senaste 30 commiterna på alla grenar;
  - scratchpad och Remotions temp, de filer som ändrats de senaste 8 timmarna, alltså sedan nyckeln användes i dag;
  - loggarna i engine/out/craft/alcatraz;
  - rösten i engine/voice/alcatraz.
  En genomsökning av hela arbetskatalogen med alla bildrutor hann inte klart på 10 minuter, och därför är den avgränsningen gjord.

## Ändrad bildlista (godkända bildtyper; tiderna efter rösten)

Rösten börjar i ruta 0, och meningarna ligger på 0,00, 2,01, 3,57, 5,99, 8,50, 12,06, 15,13, 18,13, 22,65, 25,00, 27,21 och 29,22 s. Filmen är 32,0 s.

| # | Tid (s) | Bild | Bildtyp | Mening |
|---|---|---|---|---|
| 1 | 0,0–1,8 | Cellen i natt. Vaktens hand håller ficklampan, och ljuset ligger på det falska huvudet redan i ruta 0. | rekvisita, hand (04-grepp) | 1 |
| 2 | 1,8–3,4 | Vaktens ögon smalnar, extrem närbild. | ansiktet (01) | 2 |
| 3 | 3,4–5,8 | Tre celler i rad, kameran glider längs gallret, och i varje säng ligger ett huvud under en filt. | rekvisita, kameraåk | 3 |
| 4 | 5,8–8,3 | Kartan: en hand flyttar markören från ön mot staden, och ett ljus brinner bredvid. | hand (04) | 4 |
| 5 | 8,3–12,0 | Händer: verktyget skrapar längs ventilgallret, den andra handen håller gallrets hörn, damm faller. | händer (04) | 5 |
| 6 | 12,0–14,2 | Regnrockar läggs omlott, och flotten växer. Två händer trycker på en söm. | händer (04) | 6 |
| 7 | 14,2–15,4 | Två händer lägger det falska huvudet på kudden, och en hand drar upp filten. | händer (04) | 6–7 |
| 8 | 15,4–16,8 | Takluckan öppnas inifrån, sedd nerifrån. Handen tar luckans kant först, sedan öppnas den mot natthimlen. | 08 öppna en dörr | 7 |
| 9 | 16,8–18,4 | Taket i månsken. Tre män går hukande i rad, in från vänster kant, och strålkastaren sveper förbi. | 02 gå | 7 |
| 10 | 18,4–19,9 | Kameran åker ner längs röret och visar bara deras skuggor på väg ner. | skuggor (inga kroppar) | 8 |
| 11 | 19,9–21,6 | Nere vid vattnet: flotten vid klipporna med de tre i, sedan glider den ut som en stel sak. Ingen paddel syns. | stel sak | 8 |
| 12 | 21,6–22,7 | Extrem närbild på en av männens ögon på vattnet, och strålkastarens ljus sveper över. | ansiktet (01) | – |
| 13 | 22,7–23,9 | Soluppgång. Vaktens hand tar filtens kant och drar undan den, och det falska huvudet syns. | hand (04) | 9 |
| 14 | 23,9–25,4 | Vakten blir rädd, och larmljuset blinkar rött. | 06 reagera | 9–10 |
| 15 | 25,4–27,4 | En hand sätter upp den tredje efterlysningen. Tummen trycker på nålen. | hand (04) | 10 |
| 16 | 27,4–29,5 | Den tomma bukten i morgonljus. Kameran glider mot staden, och vinden lyfter en affisch. | kameraåk | 11 |
| 17 | 29,5–32,0 | Loopen: huvudet på kudden i mörkret. Ficklampan sveper in och träffar huvudet, som i ruta 0. | rekvisita, hand | 12 |

**Mening 8 och villkoret:** bild 10 visar tydligt tre skuggor på väg ner längs röret, och bild 11 visar dem nere vid vattnet med flotten. Rösten och bilden säger samma sak.

**Vakten:** samma rigg i Knopp-stil med en egen Look. Han har marinblå uniform och mössa med svart band och guldmärke, grå mustasch, ingen monokel och ingen pipa. **Männen:** blå fångskjorta, mörka byxor och mörk mössa, slätrakade. På taket är de en enda mörk färg mot månen. Looken ändrar inte Sir: med Looken avstängd ritas allt som förut. Det kontrolleras med en jämförelse av de godkända klippen i STOPP 2.

## Riskbladet (`riskblad-kontakter.jpg`)

Varje ställe där en hand rör vid något, tre rutor var: ficklampan (1 och 17), markören (4), verktyget och gallret (5), regnrockarna (6), huvudet och filten (7), takluckan (8), filten vid soluppgången (13) och nålen (15). Dessutom varje fot mot tak och golv: taket (9) och golvet (14).

**Greppet:** handflatan och tummen ligger bakom föremålet och fingrarna framför (regeln från 17 november).

**Bladet hittade fem fel i mitt första utkast, och alla är rättade:**
- handen släpade 60–90 px efter markören;
- den andra handen nådde inte gallret;
- handen låg 100 px under takluckan innan den öppnades;
- fötterna syntes inte mot det mörka taket;
- tummen satt inte på nålen.

## Kroklabbet (`kroklabb-A.mp4`, `-B.mp4` och `-C.mp4`, 0–5 s, och `kroklabb-blad.jpg`)

Alla tre har texten "THE GUARD'S TORCH / HIT THE PILLOW", sex ord på två rader i 3,2 s (1,6 s per rad). Det är samma ord som rösten. Rösten och ljudträffen (ficklampans klick och en dov knack) börjar i ruta 0: mätt i ljudfilen ligger första ljudet på 0,000 s.

- **A:** ficklampans ljus ligger på det falska huvudet redan i ruta 0, och sedan kommer vaktens ögon. Det uppfyller villkor 2.
- **B:** vaktens ögon smalnar först, sedan ljuset på huvudet.
- **C:** den mörka cellen, och ljuset sveper in och träffar huvudet inom 0,4 s.
- **Fel jag hittade och rättade:** i B blinkade vakten i ruta 3. Blinkfröet för ögonbilderna är nu valt så att ingen blinkning sker där.
- **Min rekommendation är A.** Handlingen pågår från första rutan, och ljuset på det falska huvudet är filmens fråga.

## Rekvisita (`rekvisita.jpg`)

Allt är ritat i koden i Knopp-stil med svarta konturer och platta färger, i `engine/src/craft/alcatraz/alcatraz.ts`:
- cell, galler, säng, kudde, det falska huvudet med målade, slutna ögon och riktigt hår, och filt;
- ficklampa med ljuskägla;
- cellrad med lampor;
- karta, markör och ljus;
- hemgjort verktyg, ventilgaller och damm;
- regnrockar och flotte;
- takluckan, månen och stjärnor;
- tak och strålkastare;
- rör och tegelvägg;
- klippor och vågor;
- larmljus;
- efterlysningar och anslagstavla;
- bukten och staden i fjärran.

## Kontroller hittills

**clip_check på alla 17 bilderna:** OK. Kontrollen läser nu filmens bilder (`node scripts/clip_check.mjs alcatraz`).
- Den fällde mitt första takutkast: männen fyllde 29 % av höjden (helbild kräver 50 %), en sko vilade på den andra, och knäna skakade.
- Nu fyller de 52 %, med godkänd gång från 02 och gående knutna händer.

**Ljudet:**
- inga fotsteg och inga gnissel eller låga brummande ljud;
- larmet är två rena toner (640 och 860 Hz);
- hela listan med varje ljud och dess ruta kommer i STOPP 2.

**Mixen:** −14,4 LUFS, topp −5,2 dBTP.

## Nästa steg efter ditt svar

1. Slutlig rendering i dubbel storlek, ett jobb i taget.
2. Telefonkopia under 29 MB, md5 och alla kontroller med planterade fel.
3. Ingångskontrollerna (första rutan, s 2–10, text 1,5 s per rad, loop), ljudlistan, uttalskontrollen med lyssningsfilen och tre bilder för thumbnail.
4. Beskrivning med notisen om dramatisering.

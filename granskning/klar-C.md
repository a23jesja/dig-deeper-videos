VERSION: 2

# Steg C: rörelser, händer och mun

Material i `granskning/C/`:

- `testklipp.mp4` (540x960, 13,4 sekunder, med röst och ljud): Sir Digsworth går in från sidan, stannar, vänder sig mot oss, pekar på bergets topp, säger "I say! That mountain was not smoking yesterday." med en gest på varje betonat ord, rycker till när berget smäller, vänder sig, springer, snubblar, faller, reser sig och springer ut ur bild. Bagaren flyr genom samma bild.
- `rorelseblad.jpg` (1560 px): en ruta per rörelse med tre ögonblick: gå, springa, stanna, vända sig, snubbla, falla, resa sig, ducka, bära, kasta, peka, rygga tillbaka, klättra, sitta, hälla, dra, en bifigur vars kjol följer med, och handformerna.

## Ändrat i version 2 (efter granskningens GÖR OM, omgång 1)

Fotplantering, vändning, ryggning, snubbling, fåll, undertexter och rörelsebladet var godkända och är orörda.

1. **Mustaschen blinkar inte längre i profil.** Orsaken var att huvudets små vridningar i gången fick ansiktsdelarna att växla till "sedd bakifrån" precis vid profilen; gränsen ligger nu långt förbi profilen.
2. **Kroppen rör sig när han talar.** En gest på varje betonat ord: finger upp på "I say!", pekar på toppen på "mountain", slår ut med armarna på "not", rycker på axlarna med öppna händer på "yesterday". Dessutom gäller nu för alla figurer: när fötterna står stilla vandrar vikten mellan fötterna och huvud och armar rör sig lite, så ingen pose står fryst.
3. **Slutet lever.** Efter snubblingen faller han, reser sig och springer ut ur bild; kameran stannar så att han lämnar bilden och sista bildrutan är mitt i språnget.
4. **Rädslan sitter kvar** i ansiktet från smällen till slutet, och i första språnget ser han sig om mot berget.
5. **Pekningen träffar toppen** där röken kommer, med blicken åt samma håll och marginal till bildkanten. Han står i vänstra tredjedelen medan han talar.
6. **Röken ligger i öppen himmel** bredvid honom, inte bakom huvud och keps. Röken är platta grå skivor: en platshållare tills världen byggs i steg D.
7. **Första bildrutan:** han är redan på väg in i bild.
8. **Markplattorna** var jämna och fasta i världen; det som såg ut som en söm som hoppade var figurens hårda markskugga över plattkanterna. Skuggan är nu mjuk.
9. **En bifigur på samma rörelser:** bagaren flyr genom bilden åt samma håll, med armarna i luften, på samma språng ur biblioteket och med sina egna mått.

Klippet har nu också ljud från steg E (fotsteg på bildrutan där foten landar, smäll, muller, vind).

## Hur rörelserna är byggda

Allt ligger i skelettet (`engine/src/craft/motion.ts` på `rig.ts`) och gäller därför varje figur i grunden, inte bara Sir Digsworth.

- **Fötterna kan inte glida.** Varje fotsteg planeras först på marken i världen: en fot står antingen på en fast punkt eller är i luften mellan två punkter, och bäckenet färdas över de fötter som står. Figuren förflyttar sig därför exakt så långt som stegen bär. I klippet är markplattorna, milstenen och krukan fasta i världen, så en fot som gled skulle synas mot dem. Hälen sätts i först, foten rullar över tån innan den lyfter.
- **Ansats och översläng.** Varje spelad pose läggs på som ett lager vars vikt först går åt fel håll (ansatsen) och sedan skjuter lite förbi (överslängen). Vid stopp lutar kroppen bakåt förbi lodlinjen och går tillbaka.
- **Eftersläng.** Kavajfållen, kjolen och monokelkedjan släpar efter i rörelsen, släpar mer när den börjar och svänger fram när den stannar. Kepsen lyfter i språng.
- **Armar, axlar och gung följer fötterna**, så de startar, stannar och byter gångart tillsammans med stegen.
- **Vändning** sker med två små steg per kvarts varv; figuren vrids steglöst genom vyerna utan hopp.
- **Händer:** öppen, knuten, pekande, greppande, hållande (vila).
- **Mun:** käken fälls ned i takt med rösten, styrd av ordtiderna som också ger undertexterna (`engine/voice/kit-test/words.json`).
- **Ögon:** blicken riktas mot det han tittar på (berget) och han blinkar av sig själv.
- **Undertexter** i klippet: två till tre ord, i nedre tredjedelen över skenbenen, fria från ansikte, bröst och händer och från de nedersta 15 % som Shorts-gränssnittet täcker. Figuren fyller cirka 63 % av bildhöjden.

## Att titta på

1. Glider någon fot mot markplattorna, särskilt i gången in och i språnget ut?
2. Syns ansats och översläng (pekningen, rycket, stoppet)?
3. Följer fåll, kedja och keps med en aning sent?
4. Vänder han sig utan hopp?
5. Följer munnen rösten, och går förvåning och rädsla att skilja åt i mobilstorlek?

## Kända svagheter

- Munnen öppnas ord för ord, inte ljud för ljud. Det räcker i helfigur; närbilder på tal behöver munformer per ljud (inte byggt).
- Klättra, sitta, hälla, dra och bära är poser med ansats och översläng; rekvisitan på bladet är bara ritad i rutan. Att figuren verkligen håller i världens föremål byggs i steg D.
- I ren vänsterprofil (språnget ut) syns pipan men inte monokeln; kortet kan speglas när regin vill visa den.
- Sir Digsworths mun ligger under mustaschen, så hans glädje syns mest i ögon och ögonbryn. Från granskningen av steg B: "glad" på bifigurer ska ha uppåtböjd mun och öppna ögon; munlinjen kan nu böjas tydligare, men uttrycken är inte visade på ett eget blad.
- Hunden är fortfarande öppen punkt från steg B (fram- och bakvy).

## Kod

`engine/src/craft/motion.ts` (rörelsebiblioteket), `SirMotion.tsx` (kompositionerna `SirTest` och `SirMoves`):
`npx remotion render src/index.ts SirTest out/craft/sir-test.mp4 --gl=angle --codec h264 --crf 20 --scale 0.5`
`PROPS='{"audio":false}' node scripts/stills.mjs SirMoves out/craft/moves_ 0 0.6 jpeg`

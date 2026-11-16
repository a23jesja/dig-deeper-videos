VERSION: 3

# Steg C: rörelser, händer och mun

Material i `granskning/C/`:

- `testklipp.mp4` (540x960, 13,0 sekunder, med röst och ljud): Sir Digsworth går in från sidan, stannar, vänder sig mot oss, pekar på bergets topp, säger "I say! That mountain was not smoking yesterday." med en gest på varje betonat ord, rycker till när berget smäller, vänder sig, springer, snubblar, faller, reser sig och springer ut ur bild. Bagaren flyr genom samma bild.
- `rorelseblad.jpg` (1560 px): en ruta per rörelse med tre ögonblick: gå, springa, stanna, vända sig, snubbla, falla, resa sig, ducka, bära, kasta, peka, rygga tillbaka, klättra, sitta, hälla, dra, en bifigur vars kjol följer med, och handformerna.

## Ändrat i version 3

Version 3 svarar på tre listor: granskningssessionens fyra punkter (omgång 2), Jespers två egna punkter och molnsessionens sju.

### Jespers punkter
- **Monokeln syns åt båda håll, alltid.** När figuren är vänd åt vänster i sidvy ritas skinnet spegelvänt: posen är den sanna (vänster och höger lem byts före speglingen), bara utseendet vänds, så monokel, kedja, pipa och mustasch ser likadana ut åt vänster som åt höger. Det är en regel i figuren (`mirrored` i `engine/src/craft/cast.ts`), inte ett val per bild. Snett framifrån åt vänster ritas sant (monokeln sitter på hans högra öga och syns).
- **Samma man i profil.** Hårlinjen ligger längre bak, så kind och tinning syns; mustaschen är lika kraftig från sidan som framifrån (den närmaste halvan sveper bakåt över kinden till sin uppåtböjda spets, den bortre sticker fram som en vaxad spets framför ansiktet); monokeln är en rund, tydlig guldram också i profil. **Vybladen i `granskning/B/` är omritade** med det nya huvudet.

### Molnsessionens punkter
1. Vänstervänd sidvy: se ovan.
2. **Gång:** armarna pendlar mot benen (vänster arm fram med höger fot), hänger nästan raka med lös hand, ingen utsträckt hand; kroppen höjs över den stående foten och sjunker när fötterna är isär, en gång per steg.
3. **Vändning:** figuren vrids steglöst, och en kvarts vändning tar nu 0,56 s, så vyn snett framifrån syns i flera bildrutor (största vridning per bildruta i klippet: 8 grader).
4. **Löpning:** längre steg (1,22 benlängder mot 0,95), foten är i marken under mindre än ett halvt steg, så mellan två fötter är båda i luften, och kroppen lyfter i svävfasen.
5. **Fall:** hela figuren är inom bild (kameran drar sig bakåt och centrerar på kroppen); kepsen flyger av, landar framför honom, och han tar den på sig när han reser sig.
6. **Bifiguren** springer inte igenom honom: bagaren har ett eget spår längre bort och passerar bakom medan Sir Digsworth ligger; som mest är 17 % av bagaren dold och inget ansikte täcks.
7. **Resa sig:** från liggande dras knäna in under kroppen (händer och knän), sedan huk, sedan upp, på samma plats. Benen går nu steglöst mellan fria och planterade (ingen växling som hackar).

### Kontroller i skript, för alla videor
`node scripts/craft_check.mjs <klipp>` (från `engine/`; klippen listas i `src/craft/cueList.ts`, reglerna står i `src/craft/checks.ts`) räknar på skeletten före rendering och stoppar med fel om:
- monokeln inte syns i någon sidvy, åt vänster eller höger,
- en figur vrids mer än 22,5 grader på en bildruta (en vändning utan mellanvy),
- en figur döljer mer än en fjärdedel av en annan, eller något av dess ansikte.
För testklippet: `node scripts/craft_check.mjs sirTest` ger "CRAFT CHECK OK". Självtest gjort: en dubbelgångare på samma plats och en vändning på en bildruta ger utslag.

### Granskningssessionens punkter (omgång 2)
1. **Rörelser går över i varandra utan viloläge.** Det här är ändrat i biblioteket, inte bara i klippet. En gång eller ett språng kan hållas igång (`keep`): då sätts inget avslutande steg och kroppen rätar inte upp sig, och nästa rörelse fortsätter i samma steg. Snubblingen växer ur språnget; ska han falla hålls också snubblingen igång och dess framåtlutning ligger kvar tills fallet tar den ända ned. Uppresningen går direkt in i nästa rörelse ur huk (`getup({ into: true })`). Även ryggningen tonar ut medan han redan vänder sig.
2. **Bagaren:** se molnsessionens punkt 6.
3. **Hela figuren är inom bilden.** Under talet står han ett steg längre in och gesterna på "not" och "yesterday" är snävare, så båda händerna har marginal. I fallet: se molnsessionens punkt 5. Skelettet kan nu vila en liggande figur på sin lägsta punkt.
4. **Pekningen hålls mot toppen** så länge "that mountain" varar, utan ansats åt fel håll.

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
- Sir Digsworths mun ligger under mustaschen, så hans glädje syns mest i ögon och ögonbryn. Från granskningen av steg B: "glad" på bifigurer ska ha uppåtböjd mun och öppna ögon; munlinjen kan nu böjas tydligare, men uttrycken är inte visade på ett eget blad.
- Hunden är fortfarande öppen punkt från steg B (fram- och bakvy).

## Kod

`engine/src/craft/motion.ts` (rörelsebiblioteket), `SirMotion.tsx` (kompositionerna `SirTest` och `SirMoves`):
`npx remotion render src/index.ts SirTest out/craft/sir-test.mp4 --gl=angle --codec h264 --crf 20 --scale 0.5`
`PROPS='{"audio":false}' node scripts/stills.mjs SirMoves out/craft/moves_ 0 0.6 jpeg`

VERSION: 1

# Steg B: skelett och vyer för den valda figuren

Material (JPG, 1560 px breda) i `granskning/B/`:

- `vyblad-1.jpg`: Sir Digsworth framifrån, snett framifrån, från sidan och bakifrån mellan samma hjälplinjer (hjässa, axlar, höfter, mark), och en närbild av kedjan.
- `vyblad-2.jpg`: samma figur vriden ett helt varv i steg om 30 grader, och i rörelse: går (snett, sidan, bort), åt vänster, speglad, pekar, ryggar, springer.
- `vyblad-3.jpg`: den gemensamma grunden: åtta bifigurer från olika epoker och en hund, var och en i fyra vyer.
- `vyblad-4.jpg`: Sir Digsworth bland bifigurerna, i färg och som svarta siluetter.

## Vad som valdes och vad som ändrats

Jespers val (via granskningssessionen): riktning 4, sprattelgubben, med långskankens långa ben och en mustasch i långskankens form men mindre. Hans prioritet: "Jag vill ha den som blir bäst i animation."

- **Ben:** längre än sprattelgubbens (benen är 49 % av höjden mot 42 %), kortare än långskankens (54 %). Skäl: längre ben än så avslöjar minsta fotglidning och kräver ett huvud som blir för litet i mobilen.
- **Huvud:** 20 % av höjden (långskankens var 12 %), så att ögon, ögonbryn och käke går att läsa i mobilstorlek.
- **Mustasch:** långskankens tunna vaxade form med uppåtböjda spetsar, men spännvidden är 1,24 huvudbredder mot långskankens 2,9. Den är smalare än axlarna och sticker ut på båda sidor om huvudet i varje vy, också bakifrån.
- **Egen siluett:** kavaj som vidgar sig nedåt över långa smala ben, keps med lång skärm, mustaschspetsarna och pipan. Ingen bifigur har platt keps (hamnarbetaren är barhuvad av det skälet).
- **Accentfärg:** blågrön (teal) väst, fluga och kepsband, vita damasker över skorna. Färgen finns inte i en romersk gata (tegelrött, ockra, grönt, blått) och inte hos någon bifigur.
- **Ögonbryn** är egna delar (upp vid förvåning, ned mot näsan vid misstro), **käken** är en egen del som fälls ned när han talar.

## Hur vyerna är byggda

Figuren är inte fyra teckningar. Varje del av ansikte, hatt och kläder sitter på en vinkel runt huvudet eller kroppen och projiceras med vyvinkeln (`engine/src/craft/cast.ts`), på skelettet i `engine/src/craft/rig.ts`. Därför är figuren lika lång och bred i alla vyer, och den kan vridas steglöst utan hopp mellan vyerna (se varvet på vyblad 2). Rörelserna ligger i skelettet och behöver inte göras om när utseendet ändras.

- **Monokelkedjan:** en tredjedel så tjock som ramen, fäst i ramens nedre ytterkant, mjuk båge utanför kinden, slutar i kavajslaget med en liten nit, ingen lös kula. Den ritas bara när monokeln syns. Att den döljs av vatten och filt sköts av scenen, som klipper kortet (byggs i steg D).
- **Skorna:** båda syns hela och står på marken i alla vyer; damaskerna gör fötterna lätta att följa.
- **Åt vänster:** vrids figuren på riktigt hamnar monokeln på bortre sidan i ren vänsterprofil (pipan syns då). Vill man visa monokeln speglas kortet ("VÄNSTER, SPEGLAD" på vyblad 2). Båda finns; regin väljer per bild.

## Den gemensamma grunden för bifigurer

Jespers krav: alla sidokaraktärer ska ha samma form som Sir Digsworth, och variera kraftigt. Varje bifigur är en uppsättning mått och val (`Look` i `engine/src/craft/looks.ts`) på samma delar, samma nitar, samma ögon, händer och käke. Ingen ny ritkod per figur. På bladet: romersk bagare, romersk soldat, romersk köpman, riddare från 1200-talet, soldat från 1916, dam från 1890-talet, hamnarbetare från 1930-talet, barn.

Det som varierar genom parametrar: skelettets mått (lång, kort, bred, barn), huvudets mått, hudton, hår (kort, flint med krans, knut, bara i nacken), skägg, mustasch, ögonfransar och läppar, huvudbonad (keps, romersk hjälm med kam, tunnhjälm, stålhjälm, halmhatt, cylinder, pannband, ingen), överdel (kavaj med slag och väst, uniform eller arbetsjacka knäppt till halsen, tunika vars längd är fri: kort tunika, lång dräkt, klänning till marken), rustning, förkläde, mantel, bälte, emblem, bara ben eller byxor, sandaler, skor eller stövlar. Hattar och kläder vrids rätt eftersom de är byggda på samma vinklar som huvudet och kroppen.

## Djur

Samma formspråk: kartongdelar som skuggar varandra, nitar i lederna, samma pappersögon, huvud vars delar sitter på vinklar. Fyrbenta djur har ett eget skelett (`engine/src/craft/beast.ts`) som löses i 3D och vrids med vyvinkeln som människornas. Ett djur är en uppsättning mått och färger (`Beast`): hunden på bladet är byggd så. Gris, björn och häst blir nya mått på samma skelett (kroppslängd, benlängd, hals, nos, öron, svans). Fåglar som emun är tvåbenta och byggs på människoskelettet med fågelmått (korta lår, långa skenben, lång hals, ingen arm) och ett eget huvud med näbb; det är inte ritat ännu och görs när en historia behöver det.

## Att titta på

1. Är figuren lika lång och bred i de fyra vyerna, och håller den ihop när den vrids?
2. Känns Sir Digsworth igen i svart bland bifigurerna (vyblad 4)?
3. Läser man ansiktet i mobilstorlek (vyblad 2 är ungefär den storleken)?
4. Sitter kedjan, pipan, monokeln och kepsen rätt i varje vy?
5. Vrids bifigurernas hattar och kläder rätt, och har de samma form som Sir Digsworth?

## Kända svagheter

- Huvudet är en rundad rektangel också i profil: ansiktets profil bärs av näsa, mustasch, pipa och skärm, inte av hakan.
- Bakifrån är huvudet en hårfyllnad utan nacke; räcker för kort tid i bild.
- Hundens bakben lyfter något i dragposen; rättas när kedjebilden byggs i steg D.
- Damens kjol är stel när hon går; den får eftersläng i steg C.
- Poserna på vyblad 2 är stillbilder ur rörelsebiblioteket; själva rörelsen granskas i testklippet i steg C.

## Kod

`engine/src/craft/cast.ts` (figuren som vrids), `looks.ts` (Sir Digsworth och bifigurerna), `beast.ts` (fyrbenta djur), `rig.ts` (skelettet), `CastViews.tsx` (bladen):
`PROPS='{"audio":false}' node scripts/stills.mjs CastViews out/craft/cast_ 0-3 0.6 jpeg`

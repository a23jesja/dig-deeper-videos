# v1r-kandidaten: vad som faktiskt ändras i de 13 flaggade rutorna (20 november 2026)

Kandidaten är `engine/out/craft/qa-eye-patch/eye-patch-v1r.mp4`, md5 c4cb2e67…. Ingenting är ändrat eller byggt; det här är genomgången och den förberedda rättningen.

## Hur genomgången gjordes

För varje ruta t jämförde jag rutorna t−1, t och t+1 i full storlek. Jag tog ögat med flest flaggade pixlar och vilken figur det sitter på (från motorns ögonmärken), och motorns värden för den figuren i de tre rutorna:
- ritad vridning: kroppens yaw plus huvudets vridning, och |sin| av den;
- locket (lid, där blinkningen ingår);
- ögats storlek (wide);
- blicken (gaze).

Utsnitten ligger i granskarens `v1r-kandidat-fel-*.jpg` och i mitt arbetsark. Granskaren har rätt: det här är inte bara jämn rörelse. Flera saker dyker upp eller försvinner på en ruta (punkt 3).

## Ruta för ruta

| Ruta (tid) | Bild, figur | Vad som ändras | Orsak |
|---|---|---|---|
| 38, 39, 40 (1,27–1,33 s) | hook, kamraten | Locklinjerna dyker upp. Ögonen krymper (wide 0,65 → 0,37 på 5 rutor) medan pupillerna sveper (gaze 0,4 → −0,5). Vid 40→41 försvinner den bortre mustaschhalvan. | **A, B, D** |
| 56 (1,87 s) | hook, piraten | Huvudet går 4,1° → 4,4° → 4,0°, ett litet ryck fram och tillbaka. Pupill och lock följer med. | **E** |
| 287, 288, 289 (9,57–9,63 s) | below, kamraten | Samma som i hook: locklinjen dyker upp vid lid 0,01 → 0,02, ögonen krymper och blicken sveper 0,4 → −0,45 på 4 rutor. Vridningen är redan över 0,45, så mustaschen är borta här. | **B, D** |
| 506 (16,87 s) | patch (närbild), piraten | Locket lyfts när han tittar upp (lid 0,28 → 0,21) och locklinjen glider över pupillen och ljuspricken. Ingen tydlig hoppande del i utsnitten: det ser ut som en sammansatt rörelse (locklinje, pupill och ljusprick). | troligen **B** (locklinjens tjocklek); kontrolleras efter rättningen |
| 652 (21,73 s) | myth, piraten | Samma lilla ryck som ruta 56: vridningen 5,0° → 5,3° → 4,9°. | **E** |
| 708, 709 (23,60–23,63 s) | test, kamraten | Den bortre mustaschhalvan dyker upp på en ruta (vridningen −29,1° → −25,6° går under \|sin\| 0,45). Locklinjerna dyker upp (lid 0,03 → 0,10). Ögonen krymper och blicken sveper. | **A, B, D** |
| 1069 (35,63 s) | end, kamraten | Samma som hook: locklinje, ögonstorlek och blicken efter snubblet. | **B, D** |
| 1072 (35,73 s) | end, piraten | Hela ansiktet byter på en ruta: från det undrande (vida ögon, lid 0, rynkad mun) till läsansiktet (lid 0,55, leende). | **C** |

## Orsakerna

- **A. Mustaschens bortre halva slås av och på.**
  - En helskäggig figurs bortre mustaschhalva ritas helt eller inte alls. Den slås av när vridningen går över |sin| 0,45, ungefär 27°.
  - Platsen är `cast.ts`, `mousHalf`: `if (!L.mous && !nearHalf && Math.abs(h.sin) > 0.45) return`.
- **B. Locklinjen slås på i full tjocklek.**
  - Locket ritas först när lid > 0,01, och då genast med locklinjen i full bredd (4,6 enheter).
  - Värdet för locket glider (0,01 → 0,12 på 6 rutor). Det är ritningen som hoppar.
- **C. Ansiktet byts i loopens tonande.**
  - Loopens tonande blandar ställning och plats, men figurens alternativ, där ansiktet ligger, byts vid halva vägen (k = 0,5).
  - Platsen är `film.ts`, castOf (loopInto). Det är mitt fel från i kväll.
- **D. Kamratens ansikte byts på 6 rutor efter snubblet.**
  - `ease` tonar ansiktet över hela sin tid, 0,8 s. Men hans sökande sving startar redan 1,0 s efter snubblet, innan återhämtningen är klar.
  - Svingens snabbare ingång tar över ansiktet: vida ögon och lid 0 blir sökande ögon och lid 0,12 på cirka 6 rutor, samtidigt som blicken sveper 0,9.
- **E. Ett litet ryck där två läslager möts.**
  - Läsningen är två lager per rad (återgång och svep). Där det ena lagrets utgång och nästa lagers ingång möts går huvudet en ruta fram och sedan tillbaka, 0,3–0,4°.

## Den förberedda rättningen (inte byggd)

**I motorns gemensamma kod:**
1. **A.** Den bortre mustaschhalvan krymper med vridningen i stället för att slås av:
   - Mellan |sin| 0,35 och 0,55 dras dess punkter mot roten och dess bredd skalas ned jämnt mot noll.
   - Under 0,35 är den hel, över 0,55 borta.
   - Det gäller i båda riktningarna, så den växer fram på samma sätt.
2. **B.** Locket tonas in:
   - Locklinjens bredd och skuggbandets styrka går från noll vid lid 0,01 till full vid lid 0,10, mjukt.
   - Över 0,10 är det som nu, och blinkningen är oförändrad.
3. **C.** Loopens tonande blandar också ansiktet (alla tal, och blicken) med samma k. Bara de alternativ som inte är tal byts vid halva vägen.

**I ögonlappens filmkod:**

4. **D.** Kamratens sökande sving efter snubblet startar först när återhämtningen är klar, cirka 1,5 s efter snubblet i stället för 1,0 s. Då tonar ansiktet över hela återhämtningen.
   - Stillhetstestet kontrolleras: återhämtningen är själv en rörelse fram till dess.
5. **E.** Läsningens två lager per rad ersätts av en jämn sving mellan radens början och slut, utan överlappande lager och därmed utan ryck.

**Kontroll efter rättningen:**
- Filmkontrollen (kropp, rörelse, stillhet och skarv).
- Flimmerkontrollen på hela filmen.
- De planterade fallen.
- De 13 rutorna och deras grannar i full storlek, med motorns värden ruta för ruta, så att inget längre dyker upp eller försvinner på en ruta.

Ett nytt test vore värt att ha: en ritad del (mustaschhalva, locklinje, öra) som slås av eller på mellan två rutor utan att ha krympt eller vuxit fram. Det skulle fånga A, B och C i motorn, före rendering.

## Bevisfallen

Bevisfallen påverkas inte av detta.
- (c) hamnade på en jämn, mörk yta, där inte ens det råa måttet ser något. Den behöver placeras om.
- (h1) är regelns verkliga svaghet: 2 px fram och tillbaka på en rörelse om 3 px släpps igenom.
- (f) och (f2) fälls delvis för att glidningen går över ett textbyte och figurer som själva rör sig.

Allt det väntar på Jespers val bland de tre vägarna i `status-v1r-tre-varv.md`.

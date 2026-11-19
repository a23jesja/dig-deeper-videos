# Den nya 3D-kajutan på natten, punkt för punkt mot Jespers fem (byggsessionen, 19 november)

**Klippet:** kajuta-test-v4.mp4, 10 s i 1080x1920.
- 0–5 s är den målade versionen, 5–10 s den nya 3D-kajutan.
- Samma inåkning (0,30 m på 5 s) och samma två figurer på samma ställen.

**Sida vid sida:** kajuta-test-v4-sida-vid-sida.mp4, 2160x1920 och 5 s. Den målade ligger till vänster och den nya 3D-kajutan till höger.

**Koden:** commit 06c4e6c och 04e2186. Allt ligger i motorns gemensamma kod:
- world/kit.ts: figurernas ljus;
- world/air.ts: strålar, damm, glans och förgrund;
- world/cabin.ts: den rika kajutan och nattkajutan;
- shorts/cabinTest.ts: själva testet.

**Bara för den här kajutan:** den rika kajutan slås på med `cabin({ rich: true })`. Blackbeard-filmens kajuta är oförändrad tills ljuset är godkänt som standard.

## 1. Lyktan är en riktig ljuskälla

- **Ljuset:** lyktan hänger i ett rep från takbalken närmast linsen, ovanför de två figurernas huvuden, högst upp i bilden. Den är ett riktigt punktljus, varmt orange (#ffa354), som faller av över rummet och kastar skuggor.
  - Ljuset faller på väggarna, takbjälkarna, golvet och figurerna.
  - Figurernas ansikten och bröst får lyktans varma ljus framifrån.
  - Lyktan hängde först bakom dem. Då lyste den bara upp deras ryggar.
- **Lyktan själv:** järnram, glas som lyser, en låga inuti, en järnkon som lock och en ring att hänga i.
  - Runt den finns ett mjukt sken i två lager.
  - Strålar sprider sig nedåt och utåt i den dammiga luften, över de mörka bjälkarna och väggen.
  - Strålarna ligger på ett lager bakom figurerna, men så att de fortfarande utgår från lyktan i bilden.
  - I v3 låg de framför figurerna, och det tillagda ljuset gjorde Blackbeards mörka hatt grå. Därför finns v3 kvar men skickas inte.

## 2. Fönstret: blått månljus, stjärnor och hav

- **Utanför:** den målade natthavsbilden. SDXL, lokalt, seed 5207, jobbet i engine/scripts/paint-jobs/night-sea.json: fullmåne, stjärnor, moln och hav, ingenting annat. Det är Jespers beslut om himmel och hav utanför fönster.
- **Månen** är ett kallt blått spotljus (#9bb8ff) högt över aktern, något åt vänster. Det faller in genom de tre fönstren, och fönsterspröjsarna kastar sina skuggor.
- **Synliga strålar** går från varje fönster ned mot golvet och slutar vid bordets framkant, bakom figurerna. Månens ljus ligger som en blå glans på golvet bakom deras fötter.
- **Vägen dit:**
  - Rakt in föll strålarna precis bakom de två figurerna, sett från linsen. Därför står månen lite åt vänster.
  - Lägre la de ett blått dis över figurerna, och högre dolde bordet dem.
  - Mot det ljusa blå fönstret syns en ljusstråle inte. Därför är det lyktans strålar som bär "ljusstrålar" i bilden, och månens strålar syns svagare vid sidorna.

## 3. Trä med struktur och färgskiftningar, blanka ytor

- **Trä:** alla träytor har fått plankor med ådring, kvistar och lite olika ljusa bräder. Strukturen multipliceras med varje sak egen färg, så träet behåller färgen och får mönster.
- **Blanka ytor:** golvet, bordet och kistan är polerade (Phong, glans 70). De fångar lyktans ljus som blanka fläckar, och golvet har månens glans.

## 4. Figurerna får scenens ljus

Ett nytt ljuslager på varje figurkort (kit.ts, CardLight) går genom figurens egen kontur.

- **Första lagret** multiplicerar kortet med det ljus som når det:
  - ett mörkt grundljus;
  - lyktan, varm, från dess sida;
  - fönstren, kalla, från deras sidor.
  - Kortet läses som rundat över sin bredd, så sidan som vänder sig mot ett ljus blir ljusare.
  - Det kan bara mörka och tona. Figuren blir aldrig ljusare än sin teckning, och därmed aldrig ljusare än rummet.
- **Andra lagret** lägger en tunn ljuskant längs konturen på den sida som vetter mot varje ljus: varm mot lyktan och kall mot fönstren.
- **Samma i den målade versionen:** figurerna får målningens eget ljus. Lyktan sitter högt till vänster och månfönstret bakom till höger.

## 5. Damm i ljusstrålen och mjuk oskärpa i förgrunden

- **Damm:** 55 dammkorn svävar i lyktans ljus ovanför huvudena. De stiger sakta och vajar, och de tänds och slocknar när de vänder sig i ljuset.
  - Kornen hänger ovanför huvudena, så inget korn ligger över ett ansikte.
  - Ett par små moln av kalla korn finns vid varje fönster.
  - Fem stora mjuka korn ligger nära linsen. Nära korn är stora och suddiga, långt bort små och skarpa.
- **Oskärpa:** en mörk bjälke ligger tätt framför linsen som ett tunt band längst upp, med mjuka kanter. Den ligger aldrig över en figur.
  - I v3 var bandet för brett. Lyktan steg in i det när linsen gick in och blev mörk.

## Kontroller

- Kroppskontrollen ger 0 fel på 3D-delen, med de nya människotesten. Den målade delen ger också 0 fel.
- Greppen är OK.
- Jag gick igenom ljusets lager själv i full storlek: inga strålar, inget damm och inget dis över ansiktena.

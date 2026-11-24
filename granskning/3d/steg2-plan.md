# 3D steg 2: plan för rörelsearket (till granskaren innan något byggs)

**Ramen**
- Samma stil, ljus och miljönivå som v57: platta Knopp-figurer (den frysta riggen, oförändrad) över Blender-plåtar. `git diff ad1a161` på designs, rig.ts, clips, ink.ts, stage och alcatraz ska vara tomt.
- Ny kod läggs i `src/craft/moves3d/` och `blender/moves/`. cabin3d och v57 rörs inte.
- Arket är en film på ca 22 s: sju bitar på ca 3 s, en tagning per rörelse.
  - Varje rörelse visas hel och minst två cykler, så att den kan bedömas i rörelse. Klipp inuti en bit skulle dölja fel.
  - Mellan bitarna är det raka klipp. Varje klipp byter miljö eller vinkel med minst 30°.

## De sju bitarna
| # | rörelse | vem, var | vad som rör sig och mot vad |
|---|---|---|---|
| 1 | smyga | pojken över kajutgolvet, halvprofil, 4 steg | låg höft, tåspetsar först, armarna upp, huvudet vrids mot dörren. Fötterna står still på golvet medan de bär. Inga stegljud. |
| 2 | bära (**tvåbilden**) | kaptenen och pojken bär kistan mellan sig, 4 steg | Kistan (3D, i plåten) följer deras händer. Båda huvudena syns och de står isär (regeln om bärare). Vikten syns i knän och lutning. |
| 3 | skrapa | pojken på knä, skrapar tjära av golvet, 3 drag | Knäna mot golvet, skrapan (platt) mot golvplankorna, spånen faller. |
| 4 | sy | kaptenen på pallen, syr i ett segel i knät, 2 stygn | Sittbenen på sitsen, nålen mellan fingrarna, tråden dras ut med en lång arm och in igen. |
| 5 | måla | pojken målar skeppets namn på en planka mot väggen, 3 drag | Penselspetsen mot plankan. Färgen blir kvar på plankan (ritad på plankans plan, så den sitter fast när kameran rör sig). |
| 6 | klättra | pojken uppför stegen till luckan i taket, 4 grepp | Hand på pinne, fot på pinne, växelvis. Stegens närmaste vange ligger framför honom. |
| 7 | paddla | kaptenen i jollen vid aktern i solnedgången, 2 tag | Bladet går ner i vattnet och upp, med plask och ringar. Relingen ligger framför hans ben. |

## Ny teknik (var och en får planterade fel som ska fälla innan en bit använder den)
1. **Figur som går i rummet** (1, 2): figurens golvpunkt flyttas med riggens egen gång, och den stödjande foten står kvar på samma golvpunkt.
2. **Handverktyg** (3, 4, 5, 7): skrapa, nål och tråd, pensel och paddel ritas platt i figurens bläck, som den frysta käppen. Händerna har två lager, med handflatan bakom verktyget och fingrarna framför. Verktyget sitter i handen varje ruta.
3. **3D-föremål som följer händer** (2): handens väg räknas ut i figurens kod och skrivs till Blender, som flyttar kistan efter den (som pappren i v57). Kontrollen projicerar kistans handtag mot händerna varje ruta.
4. **Främre lager** (6, 7): Blender renderar det som ska ligga framför figuren (vangen, relingen) som ett eget lager med alfa, och det läggs över figuren.
   - cabin_depth ändras så att något närmare än figuren är tillåtet bara om det finns i det främre lagret. Allt annat fäller som förut.
5. **Färg som sitter på en yta** (5): penseldragen ritas genom plåtens projektion på plankans plan och växer bara där penselspetsen har varit.
6. **Ny miljö för paddlingen**: jollen vid skeppets akter till havs, med samma sol, himmel och ljusstandard som kajutan. En egen byggd skrovform och ett hav med havsmodifierare. Det är den enda nya miljön. Allt annat sker i kajutan, som får en stege upp till en lucka och en planka att måla på.

## Kontrollerna
- **Kroppsdelar**: limb_check moves3d, alla rutor: två armar, två händer, två ben, två fötter och ett huvud per figur, och varje verktygshand sitter på sin egen arm.
  - Planterat: en tredje hand på paddeln.
- **Inget i något**: kropp och verktyg är aldrig inne i ett fast föremål. Bara verktygsspetsen får nå sin yta (skrapan i golvet, penseln på plankan) och då högst 1 cm. Kistan och figurerna går aldrig in i varandra.
  - Planterat: penseln 4 cm genom plankan.
  - Planterat: ett knä genom golvet.
  - Planterat: en fot genom en stegpinne.
  - Planterat: kistan 6 cm utanför händerna.
  - Planterat: paddelbladet synligt under vattenytan.
  - Planterat: vangen i det vanliga lagret i stället för det främre.
- **Fötter**: en stödjande fot rör sig mindre än 1 cm. Fötter och knän ligger på golvet, och en fot på en pinne står på pinnens överkant (inom 1 cm). Den som sitter har sätet på sitsen (inom 1 cm, ingen som sitter i luften). Vikten ligger över den bärande foten.
  - Planterat: en fot som glider.
  - Planterat: en fot 3 cm ovanför pinnen.
  - Planterat: sätet 5 cm ovanför pallen.
  - Planterat: höften utanför bärfoten.
- **Flimmer och leder**: flicker2 och motion2 körs på provrenderingarna och på den levererade filen. Villkor 3 gäller: du granskar panoreringar och glidningar i full storlek.
- Varje kontroll körs ensam, aldrig bredvid en rendering.

## Från steg 1 som tas med
- Formbyten börjar i rörelsen.
- Handen följer med det den flyttar.
- Händerna är desamma över ett klipp.
- Rodnad hålls borta från ögonvitorna.
- Tvåbilden finns i bit 2.

## Ljud
- Bara ljud från kontakterna: skrapdrag, tråden som dras, penseldrag, paddelplask och kistan som sätts ner. Inga steg, inget skrap av skor och inga knarr.
- Ingen replik i arket. Ljudpunkterna från v57 (röst och smäll på första rutan, ljud vid avslöjandet, en svans i slutet) gäller nästa riktiga film.

## Ordning
Bitarna byggs i ordningen 1, 2, 3, 4, 5, 6, 7, så att varje ny teknik är bevisad innan den används.
- En tung körning åt gången.
- Ett STOPP när allt är klart: en sida, med hela fellistan i första omgången.
- Granskning av dig och en oberoende granskare, i rörelse.

**Att besluta:**
- **A.** Handverktyg platta i figurens bläck och stora föremål i 3D. Mitt förslag är ja.
- **B.** Paddlingen i en ny miljö (jollen till havs). Mitt förslag är ja, eftersom det inte går att paddla i kajutan.
- **C.** Ingen replik i arket. Mitt förslag är ja.

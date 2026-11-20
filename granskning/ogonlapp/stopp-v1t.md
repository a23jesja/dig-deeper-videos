# STOPP: The Pirate Eye Patch Trick, v1t (21 november 2026), omgång 3 av 3

Det här är sista omgången. Ett fel från din lista är kvar, ljusfläckarna under bordet (punkt 2). Orsaken är inte hittad. Allt jag har prövat står nedan, så att Jesper kan välja väg.

## Filer (leverans/eye-patch/)

| Fil | Storlek | md5 |
|---|---|---|
| eye-patch-v1t.mp4 | 15,85 MB | 9ca2a0a1ba01aa2cef2d85e51613a6ca |
| eye-patch-v1t-telefon.mp4 | 7,00 MB (under 29 MB) | 094f65299a1b90cfe08f5629fffc4dab |
| eye-patch-v1t-liten.mp4 | 3,03 MB | 1b7b383d64465b46f471b075e791e9de |

**ffprobe:** 1080×1920, r_frame_rate och avg_frame_rate 30/1, 1083 rutor, yuv420p, color_range tv, color_space bt709, 3,19 Mbit/s (CRF 16, aq-mode 3).

**Rendering:** dubbel storlek i fyra delar i förgrunden, concurrency 1. Minnesspärren startade vid 8,3–10 GB fritt, och efter varje del fanns 0 kvarlämnade processer.

## Din lista

1. **Armbågens ritordning: rättad.**
   - Underarmens ordning bestäms nu för hela klippet, och ett val som skulle vara kortare än 15 rutor behåller valet före.
   - Ordningstestet fäller nu varje byte som går tillbaka inom 15 rutor. Det planterade felet (utan utjämning) fälls på tre ställen: 8,6 s (ditt), 23,2 s och 24,9 s. Med utjämningen fälls inget. Utskriften ligger i `order-test-v1t.txt`.
   - Rutorna 250–266 i full storlek ligger i `v1t-armbagen-rutor-250-266-fullstorlek.png`. Överarmen med knappen ligger över underarmen i alla 17 rutorna.
2. **Ljusfläckarna under bordet: inte rättade.** Se avsnittet nedan.
3. **Röda randens kant: rättad.** Randen är 6 mm kortare än panelen, så dess ändytor ligger inne i den.
4. **Bokgreppet: rättat.**
   - Boken är 0,62 m bred i stället för 0,54, så dess kanter ligger inne i nävarna. Nävarna sitter 0,31 m ut som förut. Närmare händer gav armbågsfelet igen (deck2 och verdict).
   - I alla fem klippen ligger höger näve nu över pärmens kant: `v1t-bokgreppet-ruta-800/190/370/460/1005.png`. I ruta 800 är överlappet minst, men kanten går in i handen.
   - Greppet är detsamma som i 04.
5. **Undertexter under 0,4 s: rättade i motorns gemensamma kod.**
   - En rad som fortfarande är kortare än 0,4 s slås ihop med grannraden. Nu står det "THE SUN IS BLINDING" och "AND YOU CAN SEE".
   - Den kortaste raden är nu 0,43 s ("FROM THEIR").
6. **Kamratens näve: kontaktskugga.**
   - En mjuk mörk oval ligger på bordsskivan, där skivan syns vid nävens nederkant, en liten bit mot linsen. Mitt under handen låg den 20 px under näven i bilden och syntes inte.
   - Bevis: `v1t-naven-kontaktskugga-ruta-120.png`. Skuggan är svag. Linsen står bara cirka 9° över skivan, så ovalen syns som ett smalt band.
   - Den är ett nytt motordel, kit.contactShadow. Kontrollerna räknar den inte som en sak.

## Anmärkningarna

7. **Ny rörelse strax före klippet: rättad.** Piratens nickning håller nu sitt sista slag till klippet (wag fick `lastBeat`). Huvudet står still i rutorna 774–777 och 1027–1030.
8. **Ringar i lyktskenet: rättat med dithering.** Det är three:s fasta skärmmönster, samma i varje ruta, på toon-materialen och skenet.
9. **Bubblan och undertexterna samtidigt (324–345): inte rättat.**
   - Motorns egen regel kräver minst 1,2 s för en bubbla, och mellan undertexterna "SEE A THING" och "EYES NEED" finns bara 1,03 s.
   - Jag prövade att avsluta bubblan vid nästa undertext. Då stod den bara 0,77 s, och filmkontrollen fällde den. Jag lade tillbaka den som den var.

## Punkt 2: ljusfläckarna under bordet

**Mätning.** Rött (R) per ruta, som medel över dina sex ytor, i v1s och v1t. Värdena per ruta står i `lyktytor-v1s-v1t.txt`.
- **A, öppningen:** 25 växlingar på 73 rutor i båda versionerna.
- **B, slutbilden:** 23 och 22.
- **C, below:** 14 och 14.
- **D, myth:** 16 och 17.
- **E, verdict:** 14 och 12.
- **F, dark:** 28 och 27.

Det är i stort sett oförändrat. Ändringen av lyktans sken var alltså inte orsaken.

**Lågan nu:** lyktans sken andas långsamt, med högst cirka 0,2 radianer ändring per ruta. Det hoppar inte längre från ruta till ruta. Ljusfläckarna gör det ändå.

**Vad som ändras:** hela den nedre delen av ett bordsben strax under bordskanten är jämnt belyst i en ruta och mörk i nästa. Ibland är den randig, som skuggfransar. Skillnadsbild för ruta 1040 mot 1041 i slutbilden: en hel rektangel byter.

**Vad jag har uteslutit**, med stillbilder av rutorna 1040–1046 och samma yta:
- **Figurernas skuggor:** avstängda gav exakt samma värden.
- **Boken:** borttagen gav samma värden.
- **Lyktans sken:** långsamt och vänt en gång per klipp gav samma värden.
- **Solens skugga:** avstängd varierade ytan fortfarande.
- **Konturerna:** med skalet tryckt bakåt i djup gav det samma värden.
- **Månen och dess ljusstrimmor:** dolda gav samma värden.

**Det som avgör:** med linsen helt stilla är ytan konstant, 40,4 i alla rutor. Det är alltså linsens lilla glidning genom klippen som gör att fläcken byter. Varför vet jag inte. Ingen av ljusets eller skuggornas delar som jag har prövat förklarar det.

**Det Jesper kan välja mellan:**
1. **Stilla lins** i de hyttbilder där bordet syns: öppningen och slutet, below, myth, verdict och dark. Det är prövat på slutbilden, där det gör ytan konstant. Men det går emot "kameran bär rörelsen".
2. **Fortsatt felsökning** av vad i linsens glidning som byter belysning på bordsbenet. Det tar okänd tid.
3. **v1t som den är**, med fläckarna kvar.

## Flimmermåtten

| | v1s | v1t |
|---|---|---|
| Rutor som fälls, korrigerat mått | 7 | 6 |
| Rutor som fälls, råa måttet | 111 | 109 |
| Hela bilden, högst (pixlar) | 1211 | 1053 |
| Skarven | 3,5 % | 3,6 % |

- De rutor som fälls i v1t är ögonrutorna 36, 384, 506, 632, 1070 och 1071. Du och din granskare har godkänt dem som jämn rörelse.
- Rapporterna ligger i `flimmer-v1s.txt` och `flimmer-v1t.txt`.

## Tester

- Filmkontrollen ger 0 fel: kropp, rörelse, stillhet, skarv och ritordning.

**Frågorna till Jesper** står som du skrev dem:
- Lappbytet visas inte i bild.
- Solen står bakom figurerna på däck.

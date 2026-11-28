# Short 2, Svartskägg (Charleston 1718): ärlig timuppskattning

Underlaget är manus v3 (31c97a8, avsnitt 2): 20 bilder, 40,8 s, rösterna George, Daniel och Will. Uppskattningen gäller med samma ribba som Roberts: varje ny teknik får ett eget ark med ett planterat fel och två granskare.

## Vad som återanvänds från Roberts
- **Däcket:** blender/deck/set.py, med kameror per bild, solid map, lyktor som släcks (lamps/dark/hide) och plattor som tonas in.
- **Figurkedjan:** roberts3d core och figures. Efter Roberts lyfts den ut som film3d, ungefär 4 h, en gång. Dit hör placeringar, figurer som dämpas med ljuset, munnar på repliker och bildtexter från tidslinjen.
- **Unga piraten:** rigg och look finns. Manus v3 vill ha röd stickad mössa och fräknar, vilket blir en ny Look med en ny huvudbonad (ungefär 1 h med ark). Det kan också bli samma unga pirat som i Roberts.
- **Rekvisita och kontroller:** mugg, flaska och kagge (props och propsDraw), reachPose för händer på föremål, prop_check, sleeve_check, limb_check, flicker2 och motion2.
- **Röstkedjan:** el_line.py och env30.py.

## Vad som är nytt
| Del | Innehåll | Timmar |
|---|---|---|
| Ljus | Däcket i dagsljus: sol och himmel enligt ljusstandarden, i dag finns bara natt och gryning | 2 |
| Hamnen | Charleston i vidbild: staden på stranden, fyra skepp i linje (dutch_ship_medium), kajen och långbåten | 5 |
| Bild 4 | Solen i en båge över skeppen, ner och upp igen: 57 plattor, en per bildruta | 3 |
| Bild 5 | Handelsskeppet som försöker smita, slupen som skär framför, varningsskottets plask och seglen som faller: rörliga skepp i Blender, 57 plattor | 5 |
| Guvernörens kontor | Kajutans set (cabin3d) som kontor: skrivbord, papper och fönster mot staden | 2 |
| Kartan, bild 2 | Sjökort på bordet med fyra brickor som glider, ritat i 2D på bordsskivans platta | 2 |
| Tre nya figurer | Svartskägg (skägg i flätor med band, rykande lunta under hatten, lång rock, skärp med pistoler), guvernören (vit pudrad peruk, lång näsa) och passageraren (rund, brun allongeperuk). Nya hår- och skäggtyper i kit.ts, alltså ditt ja och ett ark. | 6 |
| Rök från luntorna | Ritad i 2D, med flicker2 på röken | 2 |
| Tio nya rörelser, var och en med ark och planterat fel | Gåspenna och sigill (händer), krita ett streck, knäböja och öppna en kista, vinka av någon, prova en hatt och vrida sig, sätta sig hårt, lyfta kikaren, halvdra sabeln, kistan som hissas i rep och landar, säckar och kista som bärs över en planka (små figurer) | 15 |
| Övrig rekvisita | Kikare, sigill och vax, medicinkista med flaskor, hatt med plym, säckar och liten kassakista, streckbräde, pung | 4 |
| Bilderna | 20 bilder à ungefär 0,75 h: kamera, platser, handling och stillbilder | 15 |
| Röst | Förräkning 1 686 tecken, saldo, tre tagningar per replik och val | 1 |
| Kontroller, rendering och två granskningsrundor | | 8 |
| **Summa** | | **ungefär 70 h** |

Med film3d (4 h) blir det ungefär 74 h. Det motsvarar 4–5 dagar i min takt, inte en Short om dagen.

## Hur det kan kortas utan att sänka ribban
1. **Bild 4 och 5 som en enda vidbild (sparar ungefär 6 h):** skeppen ligger stilla i plattan. Ett 2D-plask och fallande segel ritas ovanpå, och solens båge blir ett ljusskifte i tre plattor som tonas in, med samma teknik som lyktorna.
2. **Kontoret i kajutan (redan medräknat):** inget nytt rum.
3. **Svartskäggs skägg (sparar ungefär 2 h):** befintligt helskägg med band på, i stället för nya flätor. Det kräver ett ja.
4. **Bild 16 och 18 (sparar ungefär 3 h):** kistan som hissas och säckarna som bärs ersätts av en enda bild där kistan landar på däck.
5. **Rörelsebibliotek (sparar 3–4 h per Short framåt):** de tio nya rörelserna blir allmänna funktioner i props.ts och figures.ts, som reachPose och hookMugPose nu. Nästa Short får dem gratis.

Med punkterna 1–4 blir det ungefär 59 h, eller ungefär 3,5 dagar. Det som förlänger mest är de nya rörelserna och de nya figurerna. Båda blir billigare för varje Short, eftersom de hamnar i biblioteket.

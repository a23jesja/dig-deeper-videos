# Varför testerna inte fångade fyra fel i omgång 3 (r3d, koden 8327cfe)

Svar på granskning-omgang-3.md. Inga klipp är byggda, ingen kod är ändrad, och allt nedan är läst i koden.

## 1. Örat i 03 som dyker upp fullt i ruta 31

**Vad som händer i ritningen.** cast.ts ritar varje öra på ett av två ställen. Vilket det blir beror på hur djupt örat ligger, `e.e.d`:
- **Under huvudet** (rad 212): om djupet är mindre än 0,55 av huvudets halvbredd ritas örat före huvudet, och huvudet täcker det.
- **Ovanpå** (rad 368): om djupet är minst 0,55 och örat ligger åt linsen ritas det efter huvudet.

När huvudet vrids passerar örat gränsen 0,55, och då byter det plats på en enda ruta. Örat är dolt på ena rutan och syns helt på nästa.

**Varför testet inte reagerade.** Huvudet vreds bara 1,5 grader mellan ruta 270 och 271 (film 30,8 och 30,9 s), uppmätt med `film_info pose`. Test 4 reagerar först när den ritade vridningen ändras mer än 12 grader på en ruta, eller när speglingen byts. Det mäter vinkeln, inte vilka delar av ansiktet som syns. Örat märks inte i ritningen, så inget test vet att det finns.

**Hur det kan fångas:** ritningen märker öronen (som ögonen). Ett test fäller ett öra som växlar mellan dolt och synligt från en ruta till nästa medan vridningen ändras mindre än 12 grader. Det riktiga botemedlet sitter i riggen: örat ska glida fram bakom huvudets kontur, klippt mot den, i stället för att byta plats.

## 2. Dörrringen i 07: dörren startar i full fart, och ringen glider ut under näven

**Full fart.** Dörrens vinkel (shotLibrary.ts, `ang`) har två delar:
- **Puffen, 0,45–1,4 s:** vinkeln går från 0 till −20 grader med mjuk start och mjukt stopp. Hastigheten är alltså 0 vid 1,4 s.
- **Svängen efter släppet:** `−(20 + 75·(1 − e^(−(t−1,4)/0,5)))` börjar med 150 grader i sekunden.

Mellan ruta 42 och 43 hoppar dörren alltså från stillastående till full fart. Granskningens YAVG för dörrens yta, 0,11 → 1,43, visar just det. Puffen, 20 grader på en sekund, är så liten att dörren ser ut att stå stilla medan armen är ute.

**Varför testet inte reagerade på farten.** Jerk-testet för saker gäller bara saker som någon håller. Från 1,4 s står dörren som `down` i greppraderna (släppt), så ingen rörelse provas efter det.

**Varför ringen glider ut under näven.** Handen släpper vid 1,4 s och förs sedan tillbaka till sidan under 0,7 s med mjuk start. Under de första rutorna står näven alltså nästan kvar där ringen var, medan dörren svänger bort med full fart.

Grepptestet håller handflatan inom 5 cm från ringen bara så länge dörren hålls. Efter släppet finns inget test som ser en hand som blir kvar i en sak som rör sig, eller i den öppning saken lämnar. Kroppstestet prövar armen mot dörren bara medan raden har `arm` satt, alltså medan han håller.

**Hur det kan fångas:**
- jerk för alla saker som rör sig, inte bara hållna;
- ett test för en hand som släppt en sak: inom ett par rutor efter släppet ska handen vara minst några centimeter från saken, eller saken ska stå still;
- kroppstestet ska pröva armen mot dörren också efter släppet.

## 3. Flaskan i 06 vars hörn sjunker in i pallens kant (32–34)

**Varför testet inte reagerade.** Kroppstestet prövar figurer mot fasta saker, mot hållna saker och mot andra figurer, alltså "a figure against a solid, a held thing or another figure". Två saker mot varandra provas inte. Flaskan hålls inte och är ingen figur, så när den passerar pallen provar ingen kod det.

Rörelsetestets saksdel, gone/came och pop, ser bara om en sak finns eller hur den ligger mot en arm.

**Varför felet fanns kvar.** I r3 gick flaskan genom pallens överkant. Jag såg det och ändrade banan så att flaskan först tippar över kanten. Flaskans hörn, nu snett lutad, gick ändå in i kanten. Det såg jag inte i 5 bilder/s.

**Hur det kan fångas:** saker som rör sig provas mot fasta saker på samma sätt som kroppsdelar, med flaskans och pallens lådor från scenen. Varje ruta där de skär varandra mer än 1 cm fälls.

## 4. Den bortre underarmen i 06 som ligger dold bakom överarmen (44–119)

**Varför testet inte reagerade.** Inget test ser hur en figurs egna lemmar ligger mot varandra i bild:
- `stiff` mäter armens böjning och höjd;
- kroppstestets armbågstest mäter böjning och åt vilket håll armbågen vrids;
- `pop` gäller små saker över en arm.

I UP-posen är den bortre armens underarm böjd 128 grader framåt. Från tre kvart ligger den rakt bakom överarmen, och handen ser ut att sitta direkt på axeln. Leden är tillåten och inget skär genom något. Felet är bara att underarmen inte syns.

**Hur det kan fångas:** i bild ska underarmen ligga minst en viss del av sin längd utanför överarmens kontur. Om nästan hela underarmen, från armbåge till handled, ligger inom överarmens bredd i bild i mer än några rutor, fälls det: "the forearm hides behind the upper arm: the hand seems to grow out of the shoulder". Det går att räkna ut med `pic`-lederna som motionCheck redan har.

## Sammanfattning

Ingen av de fyra var en gräns som var för lös. Alla fyra var fel som inget test alls letade efter:
- ett öra som byter plats i ritningen;
- en sak som rör sig när ingen håller den;
- en sak mot en annan sak;
- en lem som döljs av en annan del av samma figur.

Jag bygger inget förrän Jesper har svarat. Om han vill att testerna läggs till görs de med planterade fall som stoppas, på samma sätt som Y–AH.

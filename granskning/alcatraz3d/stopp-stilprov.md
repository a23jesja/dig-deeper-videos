# STOPP: stilprovet, Alcatraz i ny stil (de första 9,5 s), 22 november 2026

**Filer** (leverans/alcatraz3d/):
- `stilprov-alcatraz-v3.mp4`: 1080×1920, 30 fps, 9,5 s, 285 rutor, med ljud. 10 155 515 B, md5 5c029b22c383ca384de37f53cc969a3e.
- v1 och v2 i samma mapp skickades aldrig. Jag ersatte dem själv efter min granskning med två rutor per sekund:
  - i n05 täckte den bleka tonen hela kroppen och linjerna, så att han såg genomskinlig ut, och en svettdroppe hängde i luften;
  - i n04 syntes bara galler och inga huvuden, och en glödlampa hängde i luften;
  - i n03 såg vakten sur ut och hade tomma händer.
- `jamforelse-platt-mot-ny-v3.mp4`: den platta v4 (vänster) bredvid den nya stilen (höger), samma 9,5 s, md5 46bd4fb97430bdd4b25fa485db881069.
- Rutor i full storlek ligger i `granskning/alcatraz3d/rutor-v3/` (1, 45, 75, 110, 160, 215 och 270), och kontaktarket med två rutor per sekund i `kontaktark-v3-2-rutor-per-sekund.jpg`.

## Vägen jag valde, och varför

**Blender 5.2**, som redan var installerat. Cycles renderar på grafikkortet (HIP, RX 9070 XT).
- **Varför:** riktiga skuggor, ljus som studsar, skärpedjup och struktur i betong och tyg. Det är vad Jesper pekade på i referenserna.
- **three.js-kajutan behövdes inte som reserv.**
- **Cellgången är byggd procedurellt** i `engine/blender/alcatraz3d/set.py`: väggar, golv, galler, sängar, kuddar, filtar, de falska huvudena, bord, mugg, bok och ventiler. Allt är gjort av grundformer med procedurella material (brus i färg, ojämnhet och bump).
- **Ingen modell och ingen textur är nedladdad**, så det finns inga licenser att hålla reda på.
- **Ljuset följer cabin v5**:
  - varma lampor (#ffa95e) som faller av med avståndet;
  - en kall kant från månens fönster (#8fb0ff);
  - ett mörkt grundljus (#3f3a45);
  - ficklampan är det varma ljuset som rör sig.
- **Inga filer är tagna tillbaka ur fore-platt-2d.** Bara ljusvärdena ur `cabinTest.ts` (cabinV5) är inskrivna i skriptet.

**Renderingstid per platta**, full kvalitet (1080×1920, 96 sampel med brusreducering, samma brus i varje ruta så att stilla bild inte kryper):

| Bild | Rutor | Tid | Per ruta |
|---|---|---|---|
| n01 | 57 | 547 s | 9,6 s |
| n02 | 39 | 366 s | 9,4 s |
| n03 | 42 | 400 s | 9,5 s |
| n04 | 69 | 979 s | 14,2 s (tre våningar, 64 sampel) |
| n05 | 78 | 706 s | 9,0 s |

**Figurerna** är den frysta riggen, oförändrad (flat.ts). De placeras så här:
- En figurs fot är en punkt på Blenders golv. Varje rutas projektion (`src/craft/alcatraz3d/cam/<bild>.json`, skriven av Blender) ger var foten och huvudets topp hamnar i bilden.
- Han står därför på golvet i rätt storlek och rör sig med plattan när kameran glider (parallax).
- Under fötterna ligger en kontaktskugga: en cirkel på golvet, projicerad och mjuk.
- Över honom ligger plattans ljus: kallt och mörkt överallt, varmt från lampans sida och från ficklampan där den passerar.
- Koden ligger i en egen mapp, `src/craft/alcatraz3d/`, med en egen komposition, `Alcatraz3D-prov`. Det frysta utseendet är orört (se nedan).

## Bildlista

| # | Tid | Bild | Röst |
|---|---|---|---|
| n01 | 0–1,9 | Det falska huvudet på kudden. Ficklampan ligger på det från ruta 1, och kameran glider långsamt in. | George 1: "The guard's torch hit the pillow." (0,00) |
| n02 | 1,9–3,2 | **Över vaktens axel** (hans rygg och mössa mörka och oskarpa i högerkanten): ficklampans stråle genom gallret på huvudet. Han säger god natt till dockan. | **Daniel [OWN]: "Goodnight, sunshine."** (2,05–3,03) |
| n03 | 3,2–4,6 | Vakten i helbild i gången, nöjd: ett litet leende och en nick. Gallret står bakom honom, och den släckta ficklampan hänger i bältet. | George 2: "The head on it was fake." (3,30) |
| n04 | 4,6–6,9 | Tvärs över cellhuset: tre våningar med celler och ett falskt huvud i varje säng. Ljuset från vakten (utanför högerkanten) ligger på mittencellen, och kameran glider. | George 3: "Three men were gone from Alcatraz." (4,80) |
| n05 | 6,9–9,5 | Före natten, i cellen: fången i helbild. Ficklampan sveper över väggen och stannar en hand från ventilen. Han fryser till: ögonen stora, ansiktet bleknar, svetten rinner. | George 4 [OWN]: "If the guards found the holes, it was over." (7,05) |

**Rösterna ligger aldrig ovanpå varandra.** Mixen stoppar om två repliker ligger närmare än 0,25 s. Tiderna står i `src/craft/alcatraz3d/shots.json` (voice) och i `out/alc3d/sounds.json`.

**Huvudpersonen och motspelaren:**
- **Fången** är huvudpersonen. Han syns i n05 och resten av filmen.
- **Det falska huvudet** står i hans ställe i n01–n04, och det är skämtet: vakten säger god natt till en docka.
- **Vakten** är motspelaren och har sin egen replik med Daniels röst.

**Krokens regler:**
- Georges röst och ljudträffen (klick och knack) kommer i ruta 1.
- Texten "THE GUARD'S TORCH / HIT THE PILLOW" har samma ord som rösten och ligger 0–3,0 s, 1,5 s per rad.
- Den första vaktrepliken kommer först på 2,05 s.

**Den nya tecknade överdriften** (n05):
- Ansiktet bleknar, och färgen ligger bara på huvudet.
- Tre svettdroppar föds vid tinningarna och rinner ner.
- Ett rent tvåtonsstick i ljudet (1 320 och 1 760 Hz, inget lågt).

Bilden över axeln (vaktens rygg och mössa bakifrån, oskarp) är en ny ritning utanför riggen. Den ska godkännas som en del av provet.

## Kontroller

**`scripts/a3d_check.py`**, ruta för ruta. Figurerna kontrolleras mot Blenders golv- och fastkarta: en stråle per 10×10 pixlar, som anger vilken sak den träffar först och hur långt bort. Kontrollen ser:
- **fötterna:** varje fot som står på golvet ritas på golvpunkten (2 px), och kartan ser golv där på figurens avstånd;
- **djupet:** ingenting utom golv ligger närmare kameran än figuren någonstans på hans kontur eller leder;
- **kontaktskuggan:** den finns, golvpunkten ligger inuti den, mitten ligger högst 12 px från golvpunkten (perspektivet), och den ligger på golv;
- **rörelsen:** ingen led hoppar mer än 45 px på en ruta, inget ansiktsvärde mer än 0,3, och ingen hand byter ritning (bytekontrollen);
- **huvudet** ligger inne i bilden.

Utskrift: `a3d-check.txt`. Resultat: ****A3D CHECK OK** för båda figurbilderna (n03 vakten: 42 rutor, n05 fången: 78 rutor). Fötterna ligger högst 0,00 px från golvpunkten, skuggans mitt högst 8,1 px från den, lederna rör sig högst 2,3 px per ruta, och ingen fast sak står framför en figur.**

**Planterade fel**, alla fällda (`planterade-fel-a3d.txt`):
- `float`: en fot 10 px ovanför golvet ("the L shoe 10.0 px above the floor (floating)");
- `sink`: en fot 10 px genom golvet ("the L shoe 10.0 px into the floor");
- `behind`: figuren bakom en sak men ritad framför den. Vakten står inne i cellen bakom gallret, och fången bakom sängen; båda fälls ("bars stands 0.53 m in front of him … but he is drawn over it");
- `noShadow`: ingen kontaktskugga.

**Kontrollen hittade två riktiga fel före den slutliga renderingen.** Båda är rättade:
- I n05 låg den oskarpa sängen i förgrunden över fångens högra fot. Kameran är flyttad.
- I n05 blinkade fången mitt i skräcken, från stängda ögon till öppna på en ruta. Blinkfrövet är bytt, så att han inte blinkar där.

**Flimmermåttet** på hela filen: `flimmer-v3.txt`. **0 fällda rutor inne i filmen**, och 0 även utan rörelsekorrigering. Den största rutan har 864 flimrande pixlar mot gränsen 2 000 (ruta 138). Ögon och text: 0. Mätningen fäller sista rutan som loop (93,7 %), men stilprovet är filmens första 9,5 s och ingen loop. Loopen mäts på hela filmen.

**Ingångskontrollerna** på mp4:an: `ingangskontroller-v3.txt`.
- Första ljudet på 0,000 s, och toppen i ruta 1 är 0,34.
- Texten är 6 ord på 0–3,0 s, 1,5 s per rad, och samma ord som rösten.
- Bilderna i sekund 0–10 är 1,3–2,6 s långa.
- Rösterna ligger 0,27 s isär eller mer.
- Mixen är −14,4 LUFS och toppen −5,4 dBTP. Inga fotsteg och inga gnissel.

**Det frysta utseendet är oförändrat.**
- `git diff ad1a161` visar 0 ändrade rader i designs/, rig, clips/, ink, stage/ och alcatraz/.
- De åtta bildtyperna jämförda ruta för ruta med de godkända filerna: **0 px skiljer i alla åtta** (`bildtyperna-oforandrade.txt`).

**Röster:**
- Daniel (onwK4e9ZLuTAKqWW03F9), två egna repliker, tre tagningar var:
  - "Goodnight, sunshine." (20 tecken)
  - "Rise and shine, sunshine." (25 tecken; den används i soluppgången senare)
- Godkänt var högst 200 tecken. Räknat var 135.
- Kontots character_count gick från 2 788 till 2 842, alltså 54. Räknaren släpar; jag läser den igen i morgon.
- Nyckeln lästes bara ur miljövariabeln. Nyckelkontrollen efteråt gav 0 träffar (`nyckelkontroll-daniel.txt`).
- Raden om commits säger "False times", vilket är ett formuleringsfel i skriptet och betyder 0.
- George använder bara den befintliga inspelningen.

## Det jag själv ser som svagast

1. **Det falska huvudet är 3D.** Det är rundare och mjukare än de platta figurerna. Det är meningen (en docka av gips och tvål), men stilarna möts tydligast där.
2. **Bilden över axeln** visar vaktens rygg och mössa bakifrån, oskarpa. Det är en ny ritning utanför riggen, för att riggen inte har någon vy bakifrån. Den läses som en mörk gestalt och behöver ditt ja eller nej.
3. **I n04** är översta våningen mörk, och vaktens ljus på mittencellen är svagt.
4. **Vaktens leende i n03** ser lite öppet ut, fast munnen är satt till stängd (riggens leende-form).
5. **Figurernas ljus är en tonad yta** (kallt överallt, varmt från lampan), inte riktig skuggning. De förblir platta, som det frysta utseendet kräver.
6. **Renderingstiden:** cirka 9,5 s per ruta (14 s för de tre våningarna). Hela filmen tar cirka 2 h i Blender.

## Planen för resten av filmen

Se `plan-hela-filmen.md`.

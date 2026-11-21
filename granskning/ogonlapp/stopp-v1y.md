# STOPP: The Pirate Eye Patch Trick, v1y (21 november 2026)

v1y innehåller v1x (mustaschen, kisningen, axeln och lappen) och Jespers tre rättningar av v1w: pruttljuden, lyktan och kamratens hand. Den ersätter v1x, som renderades men hade ett armbågsryck vid 4,5 s (se nedan). v1x-filerna ligger orörda.

## Filer (leverans/eye-patch/)

| Fil | Storlek | md5 |
|---|---|---|
| eye-patch-v1y.mp4 | 15 727 661 B | d33a2b6b0c49524dfe5f770dcd068f34 |
| eye-patch-v1y-telefon.mp4 | 6 963 707 B (under 29 MB) | b9295b86d706dc455e1ab2847b2fb1cd |
| eye-patch-v1y-liten.mp4 | 3 018 303 B | 227d1837760e07cafecc8d1daaa8190c |

- **ffprobe:** 1080×1920, r_frame_rate och avg_frame_rate 30/1, 1083 rutor, yuv420p, color_range tv, color_space bt709, 3,16 Mbit/s.
- **Rendering:** fyra delar plus ljud. Minnesspärren startade med 13,7–13,9 GB fritt, och efter varje del fanns 0 kvarlämnade processer.
- **Avvikelse:** hjälpagenten skickade återigen del 4 och ljudet i samma meddelande, så de kördes samtidigt, trots att instruktionen förbjöd det. Båda blev rena. Nästa gång renderar jag själv eller ger hjälpagenten bara ett steg i taget.
- **Filmkontrollen:** kropp 0 fel, rörelse 0 fel, FILM CHECK OK. Mustaschkontrollen är på med alla regler, både 60 % och spetsen, och kontrollen av ett öga ritat på två sätt är också på.

## 1. Pruttljuden (vid 7 och 29 s)

**Borttagna:**
- creak vid 7,7 s (below), en sågtand på 190–260 Hz som vobblar i 0,7 s
- duns vid 8,7 s (below), 52–68 Hz med lågt brus
- duns vid 22,7 s (test)
- creak vid 29,6 s (record)
- creak och duns i början, borta sedan v1v

Mixen är gjord om. regressions.md, rad 44, gäller nu hela filmen.

**Ljudeffekterna som finns kvar:**

| Tid | Namn | Vad | Frekvensområde |
|---|---|---|---|
| 9,97 s | tap (bubblan) | en fingertopp knackar, 0,14 s | ton 380–520 Hz med en snabb klick på 900–3 500 Hz |
| 17,67 s | whoosh (lappbytet) | något som far förbi, 0,4 s | brus som sveper 500–3 000 Hz |
| 34,70 s | tap (bubblan) | som ovan | 380–520 Hz plus klick |

**Bakgrundsljuden (hela klipp):**

| Tid | Namn | Frekvensområde |
|---|---|---|
| Under däck: 0–5,2, 7,7–14,6, 17,7–25,9, 29,4–36,1 s | lap: vattenskvalp, korta våta smäll och klunkar | brus 500–1 800 Hz med korta toner på 250–900 Hz, 0,06–0,16 s |
| På däck: 5,2–7,7, 14,6–17,7, 25,9–29,4 s | sea: vågor mot skrovet | brus 120–1 100 Hz som andas långsamt, skum över 2 500 Hz, och korta plask under 500 Hz (0,15–0,3 s, cirka ett i sekunden) |
| På däck | wind | 180–900 Hz plus 900–3 000 Hz i byarna |
| På däck | birds: småfåglar | 2 800–4 200 Hz |
| På däck | flap: tyg som smäller i vinden | brus 300–2 000 Hz och 700–4 800 Hz |
| Hela filmen | music: shanty | under rösten |

**Att fråga Jesper om:** havets korta plask under 500 Hz och skvalpets korta klunkar på 250–900 Hz är det som ligger närmast "korta, låga ljud". De är brus och korta toner, inte en surrande eller vobblande ton. Jag har inte ändrat dem, och han kan avgöra.

## 2. Lyktan på bordet

- **Orsak:** bordsskivans ovansida ligger på 0,795 m (skivan är 7 cm tjock, centrerad på 0,76). Lyktans bottenplatta låg på 0,76–0,78, alltså 1,5 cm ner i skivan, och glaset började vid 0,78. Flaskan stod 3,5 cm ner, och sjökortet låg inne i skivan.
- **Nu (cabin.ts, gemensam kod):**
  - Lyktan har en fot på 4 cm (20×20 cm, bredare än glaset) från 0,795 till 0,835, med glaset ovanpå.
  - En kontaktskugga ligger runt foten.
  - Flaskan och sjökortet står också på skivan.
- **Kontroll:** coplanar-kontrollen ger OK, 0 par som syns och slåss om djupet (`coplanar-v1x.txt`; ingen ändring efter det).
- **Bild:** `v1y-ruta-30.png` (foten syns, en bit av skivan framför den) och `v1y-ruta-1050.png`.

## 3. Kamratens hand på bordet (73–157)

**Orsak:**
- Näven gled längs bordskanten, eftersom den var lagd på fyra olika punkter (0,30–0,39 av kanten).
- Kroppen lutade växelvis 8° och 9°.
- Kamratens viktförskjutning i stående vaggade ryggen ±1,3° i sidled och flyttade bäckenet 20 mm.

**Nu:**
- Näven ligger på en punkt hela klippet.
- Lutningen är fast på 8°, och viktförskjutningen är stilla i det här klippet.
- Armen behåller sina vilovinklar. Huvudet, blicken och den fria armen rör sig som förut.

**Kontaktpunkten ruta för ruta** (`kamratens-nave-kontakt-v1y.txt`, film_info contact):
- **v1y:** högst 1,6 mm i världen och **1,2 px mot bordspunkten under den**. 9,5 px i bild kommer av att linsen åker framåt.
- **v1w** (`kamratens-nave-kontakt-v1w.txt`): 31,8 mm och 23,9 px mot bordet.
- **Armbågen** rör sig högst 1,0 px mellan rutorna och handleden högst 1,4 px.

**v1x:s fel:** jag räknade om armen i varje ruta för att hålla näven fast. Sökningen hittade då ett annat armbågsläge i en enda ruta, och armbågen hoppade 10 px vid 4,5 s. Det var flimmermåttets 3 744 pixlar i ruta 135. Det är borta i v1y.

**Bilder:** `v1y-ruta-73.png`, `-90.png`, `-110.png`, `-130.png` och `-150.png` i full storlek. Näven ligger på samma ställe på skivan i alla fem.

## Från v1x (kvar)

- Mustaschen: `v1y-ruta-270.png` och `v1y-ruta-750.png`.
- Kisningen: `v1y-ruta-190.png`.
- Axeln och lappen är som i de godkända stillbilderna.

## Flimmer (upplysning, `flimmer-v1y.txt`)

- **Korrigerat mått:** 6 ögonrutor mot gränsen 40: 36, 384, 506, 632, 1046 och 1071. Samma som tidigare versioner; värst är 632 med 109 pixlar.
- **Hela bilden:** högst 1 034 pixlar. Ruta 135 fälls inte längre.
- **Råa måttet:** 108 rutor.

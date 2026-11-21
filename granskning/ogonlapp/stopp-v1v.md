# STOPP: The Pirate Eye Patch Trick, v1v (21 november 2026)

v1v innehåller Jespers tre rättningar av v1u och inget annat (commit cea4c0d). Flaggstången är orörd.

## Filer (leverans/eye-patch/)

| Fil | Storlek | md5 |
|---|---|---|
| eye-patch-v1v.mp4 | 15 873 031 B | 9384049611a06f483dd59f64bc36e2f2 |
| eye-patch-v1v-telefon.mp4 | 7 010 725 B (under 29 MB) | bff6f1dbf74298e6f9f2db747ad44d93 |
| eye-patch-v1v-liten.mp4 | 3 028 632 B | a39d6306b158e051b423787dc10a0bbc |

- **ffprobe:** 1080×1920, r_frame_rate och avg_frame_rate 30/1, 1083 rutor, yuv420p, color_range tv, color_space bt709, 3,19 Mbit/s.
- **Rendering:** fyra delar plus ljud i förgrunden. Minnesspärren startade med 14,9–15,1 GB fritt, och efter varje del fanns 0 kvarlämnade processer.
- **Filmkontrollen:** kropp 0 fel på 1084 rutor, rörelse 0 fel, FILM CHECK OK.
- **Ordningstestet** (`order-test-v1v.txt`): MOTION CHECK OK, 0 fel.

## 1. Prutt-ljudet i början

**Vad det var:**
- Två ljud i mixen (public/craft/eye-patch.wav), ur öppningsklippets ljudlista i eyePatch.ts:
  - "creak" i ruta 0 (0,00 s), styrka 0,8. Det är craft_sfx.creak: en sågtandston på 190–260 Hz som stiger och vobblar 7 gånger i sekunden i 0,7 s.
  - "thud" i ruta 12 (0,40 s), styrka 0,3: ett lågt dunk på 52–68 Hz.
- Den korta, låga, surrande tonen i början kan låta som en fis.

**Vad som nu ligger på 0–0,5 s:**
- Bara rösten, som börjar som förut, vattenskvalpet ("lap") som hela öppningen har, och musiken (shanty) under rösten.
- Ingen ljudeffekt. Ljudlistan för ruta 0–40 är tom.
- Mixen är gjord om (audio/film_audio.py). Slutklippet använder samma funktion, så creak och dunk är borttagna där också.

**regressions.md, rad 44:** inget ljud i början av en film får kunna låta som en fis. Inga korta, låga, brummande eller surrande ljud i början.

Fler "creak" finns kvar längre in: below vid 7,7 s och record vid 29,6 s. Jesper har inte nämnt dem, och jag har inte rört dem.

## 2. Kamratens mustasch

- **Ändringen:** den bortre halvan är aldrig kortare än 60 % av den främre, mätt längs den ritade linjen (cast.ts MOUS_MIN). Bredden behåller också minst den andelen. Det gäller alla figurer med mustasch.
- **Rutorna:**
  - `v1v-rutor-262-284-fullstorlek.jpg`: 23 rutor, sex i bredd.
  - `v1v-rutor-744-764-fullstorlek.jpg`: 21 rutor.
- **Resultat:** båda halvorna syns i alla rutor. Vid den största vridningen (270–284) når den bortre halvans spets fram till kindens kant och sticker ut cirka 4 px som en spets. Den klipps inte av, och den försvinner inte.
- **Piratens mustasch:** den är oförändrad. I närbilden ruta 505 skiljer 0 pixlar i mustaschens område mot v1u.

## 3. Kamratens arm i början

- **Ändringen:** Shot.armOrder (film.ts) låser hans vänstra arm bakom huvudet för hela öppningen och slutet. Ordningen byter inte inom klippet.
- **Rutorna:** `v1v-ruta-0.png`, `-20.png`, `-40.png` och `-60.png`. Armen hänger från axeln vid sidan av skägget, och axelkåpan ligger inte ovanpå skägget.

## Flimmermåttet (upplysning, `flimmer-v1v.txt`)

- **Korrigerat mått:** 8 ögonrutor, alla mot gränsen 40: 36, 384, 506, 631, 632, 1046, 1070 och 1071. Värst är 632 med 95 pixlar. v1u hade 7.
- **Råa måttet:** 103 rutor (v1u 106).
- **Hela bilden:** högst 990 pixlar.

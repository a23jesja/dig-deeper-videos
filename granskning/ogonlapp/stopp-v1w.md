# STOPP: The Pirate Eye Patch Trick, v1w (21 november 2026)

v1w innehåller rättning 1 och 2 av kamratens mustasch (commit e8b3a61). Inget annat i filmen är ändrat: ljudet i början, armen, flaggstången, undertexterna och det råa flimmermåttet är som i v1v.

## Filer (leverans/eye-patch/)

| Fil | Storlek | md5 |
|---|---|---|
| eye-patch-v1w.mp4 | 15 870 578 B | 22ec27ad2d3798b34c65ad73ea6f5caa |
| eye-patch-v1w-telefon.mp4 | 7 010 221 B (under 29 MB) | 1b348e27e52fdec20fbdc0149de9be3c |
| eye-patch-v1w-liten.mp4 | 3 030 270 B | e2629d460ca3099053f6f5f4409fb709 |

- **ffprobe:** 1080×1920, r_frame_rate och avg_frame_rate 30/1, 1083 rutor, yuv420p, color_range tv, color_space bt709, 3,19 Mbit/s.
- **Rendering:** fyra delar plus ljud. Minnesspärren startade med 13,1–13,9 GB fritt, och efter varje del fanns 0 kvarlämnade processer.
- **Avvikelse:** hjälpagenten startade del 4 och ljudet samtidigt i stället för ett jobb i taget. Båda blev klara utan fel och utan kvarlämnade processer. Regeln gäller fortfarande; det var ett misstag i körningen.
- **Filmkontrollen:** kropp 0 fel på 1084 rutor, rörelse 0 fel, FILM CHECK OK. Mustaschkontrollens 60-procentsregel är på i den.

## Rättningarna

1. **Stumpen vid näsan:** näskortet ritades efter mustaschen och täckte den bortre halvan när huvudet vreds. Nu ritas en skäggmustasch efter näsan (cast.ts, mousLate). En mustasch med vaxade spetsar, som piratens, ritas som förut.
   - Följd: mustaschen ligger över näsans nederkant.
   - Bedöm i `v1w-ruta-750.png` och `v1w-ruta-756.png`.
2. **54–57 %:** förlängningen av den bortre halvan hade taket 1,6. Nu är taket 2,5, så halvan når alltid 60 % av den främre.

## Mustaschkontrollen (motionCheck, i filmkontrollen)

- **60-procentsregeln:** den bortre halvans synliga längd, med näsan avdragen där den täcker bandets övre halva, ska vara minst 60 % av den främre halvans.
  - **v1w:** 0 fel (`mustasch-kontroll-v1w.txt`).
  - **v1v** (MOUS_V1V=1, v1v:s ritordning och tak): 2 fel (`mustasch-kontroll-v1v.txt`):
    - below 230–253 (7,67–8,47 s), 56 %
    - verdict 750–757 (25,00–25,27 s), 59 %
  - Rutorna 745–749 och 758–761, som granskaren också såg, fälls inte. Där är halvan 60 % eller mer enligt mätningen, och täckningen av näsan räknas med bandets övre halva. Mätningen är alltså inte skarp nog i början och slutet av stumpen.
- **Spetsregeln** (spetsen utanför skallen plus skägget, med en marginal av spetsens bredd och kantlinjen) är **avstängd för leveransen** enligt ditt beslut. Med MOUS_TIP=1 fäller den v1w i tio klipp (`mustasch-spetsregel-v1w.txt`):
  - hook 0–72 (0,00–2,43 s)
  - dark 73–82 (2,43–2,77 s)
  - sun 192–229 (6,40–7,67 s)
  - below 230–297 (7,67–9,93 s), det tydligaste stället: spetsen ut genom kantlinjen vid 268–278
  - mins 394–417 (13,13–13,93 s)
  - test 688–717 (22,93–23,93 s)
  - verdict 747–761 (24,90–25,40 s)
  - nobody 846–859 (28,20–28,67 s)
  - trick 981–984 (32,70–32,83 s), piraten
  - end 1031–1083 (34,37–36,13 s)

  Listan går till Jesper som känt fel. Spetsen har legat vid kanten i alla versioner.
- **v1x, skriven men inte renderad:** den bortre halvan böjs ner längs kinden och behåller sin längd. Med MOUS_BEND=1 fäller spetsregeln bara tre korta ställen: sun 198, test 692–706 och piraten i trick 981–984 (`mustasch-kontroll-v1x-bojd.txt`).
- **regressions.md** rad 47.

## Rutorna i full storlek (granskning/ogonlapp/)

- `v1w-rutor-126-146-fullstorlek.jpg`, `-230-253`, `-262-284` och `-741-769`: var fjärde ruta, sex i bredd.
- `v1w-ruta-750.png` och `v1w-ruta-756.png`: mustaschen över näsans nederkant.
- `v1w-ruta-0.png` och `v1w-ruta-40.png`: armen.

## Flimmer (upplysning, `flimmer-v1w.txt`)

- **Korrigerat mått:** 7 ögonrutor mot gränsen 40: 36, 384, 506, 631, 632, 1046 och 1071. Värst är 632 med 95 pixlar.
- **Råa måttet:** 106 rutor.

## Krediter för rösten George (Starter, 40 000 tecken i månaden)

**Antaganden:** cirka 2,5 ord i sekunden och cirka 6 tecken per ord med mellanslag.

| | Text | Tre tagningar per mening | Med marginal (en omtagning till) |
|---|---:|---:|---:|
| Short 30–50 s (75–125 ord) | 450–750 tecken | 1 350–2 250 | 1 800–3 000 |
| Lång video 8–10 min (1 200–1 500 ord) | 7 200–9 000 tecken | 21 600–27 000 | 28 800–36 000 |

**Vad det räcker till i månaden:**
- Bara Shorts: cirka 13–22 Shorts med tre tagningar.
- En lång video med tre tagningar tar nästan hela månaden.
- **Förslag för långa videor:** en tagning per mening och om bara de meningar som Whisper hör fel på. Det ger cirka 8 000–11 000 tecken per lång video. Då räcker en månad till en lång video plus cirka 10 Shorts.

Förhandsräkningen görs före varje anrop som förut.

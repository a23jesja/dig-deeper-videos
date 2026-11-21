# STOPP: ögonlappen v1y med nytt ljud (ljud2), 21 november 2026

Jesper (ordagrant): "Ta bort alla ljud förutom berättar rösten och när han byter ögonpatchen till andra ögat", sedan "Musiken i bakgrunden kan få va kvar".

**Bilden är inte renderad om.** Videoströmmen är kopierad med `-c:v copy` från v1y och är identisk med den. Strömmens md5 (`ffmpeg -map 0:v -c copy -f md5`) är densamma före och efter:

| Ström | md5 |
|---|---|
| eye-patch-v1y.mp4 och eye-patch-v1y-ljud2.mp4 | d20059f256adb31270f2706f8b87bc37 |
| eye-patch-v1y-telefon.mp4 och eye-patch-v1y-ljud2-telefon.mp4 | 8a36e1e84297e077367cb3145d598279 |

## Filer (leverans/eye-patch/)

| Fil | Storlek | md5 |
|---|---|---|
| eye-patch-v1y-ljud2.mp4 | 15 740 633 B | a14f84ab9cbf21c6fd927e2c6745d4f0 |
| eye-patch-v1y-ljud2-telefon.mp4 | 6 976 679 B (under 29 MB) | 48d8efa1c3a13967f2f322ea8d4fda25 |

**ffprobe, båda filerna:**
- video: h264, 1080×1920, 30/1, yuv420p, 36,10 s (3,16 Mbit/s respektive 1,22 Mbit/s i telefonkopian)
- ljud: AAC, 48 kHz, stereo, 320 kbit/s, 36,10 s

## Ljudet

**Mixen:**
- Mixen är gjord med samma kod som v1y (`engine/audio/eye_patch_ljud2.py`, som bygger på film_audio.py).
- Skriptet bygger först om v1y:s hela mix och jämför med v1y:s ljudfil: största skillnaden är 1.4e-07, alltså samma mix.
- Därefter tar det bort allt utom tre spår och använder exakt v1y:s förstärkning. Rösten, musiken och whooshen ligger därför på samma nivå och samma tider som i v1y.

**Spår som ingår:**

| Spår | Tid | Nivå i mixen |
|---|---|---|
| Berättarrösten (13 meningar) | 0,00–34,60 s, samma tider som i v1y | -13.7 LUFS integrerat (v1y: −13,7) |
| Bakgrundsmusiken (shanty) | hela filmen, samma duckning | -29.9 LUFS (v1y: −29,9), 18.0 dB under rösten medan han talar (v1y: 18,0), +5 dB i pauserna |
| Whoosh vid lappbytet | ruta 530, 17,67 s, klippet in i mörkret | samma nivå som i v1y |

**Borttaget:**
- alla 34 bäddar: birds, flap, lap, sea, wind (vind, hav, skvalp, fåglar, flagga)
- de två tap: ruta 299 (9,97 s) och ruta 1041 (34,70 s)
- inga stötar fanns

**Helheten:**
- Integrerat -14.06 LUFS (v1y −14,02); ebur128 på den färdiga AAC-filen ger −14,1 LUFS.
- Toppen ligger på -2.61 dBTP, alltså under −1.
- Nivån höjdes inte till exakt −14,0, eftersom rösten och musiken ska ha samma nivå som i v1y. Skillnaden är 0,04 dB.

**Loopen:** en toning in och ut på 3 ms i början och slutet, så det blir inget klick.

## Kontroll: nivå per avsnitt

Mixen och spåren är RMS i dBFS. "Rest" är toppen av det som finns i mixen utöver de tre spåren, alltså det som ett fjärde spår skulle visa sig i. Ett "—" betyder under −60 dBFS.

| Tid (s) | Vad | Mix | Röst | Musik | Whoosh | Rest (topp) |
|---|---|---|---|---|---|---|
| 0.00–2.27 | voice: Why did pirates wear eye patches? | -16.1 | -15.7 | -30.6 | — | -12.5 |
| 2.27–2.57 | lucka (bara musik) | -33.0 | — | -33.0 | — | -68.5 |
| 2.57–5.12 | voice: One idea: so they never fought blind. | -16.2 | -15.8 | -33.3 | — | -13.4 |
| 5.12–5.37 | lucka (bara musik) | -33.4 | — | -33.4 | — | -74.6 |
| 5.37–7.56 | voice: Up on deck, the sun is blinding. | -16.3 | -15.9 | -34.4 | — | -13.2 |
| 7.56–7.76 | lucka (bara musik) | -32.5 | — | -32.5 | — | -72.8 |
| 7.76–9.91 | voice: Go below, and you can't see a thing. | -15.9 | -15.5 | -34.1 | — | -11.3 |
| 9.91–10.81 | lucka (bara musik) | -28.7 | — | -28.7 | — | -52.6 |
| 10.81–14.48 | voice: Eyes need twenty to thirty minutes to get used to the dark. | -16.4 | -16.0 | -33.9 | — | -13.3 |
| 14.48–14.73 | lucka (bara musik) | -34.1 | — | -34.1 | — | -79.0 |
| 14.73–17.48 | voice: But an eye under a patch is already used to it. | -16.1 | -15.8 | -34.1 | — | -12.6 |
| 17.48–17.67 | lucka (bara musik) | -32.6 | — | -32.6 | — | -71.0 |
| 17.67–18.12 | whoosh | -13.4 | -15.4 | -33.4 | -15.3 | -5.5 |
| 17.68–19.69 | voice: Flip the patch, and you can see. | -15.1 | -15.3 | -33.6 | -21.8 | -5.5 |
| 19.69–20.04 | lucka (bara musik) | -36.3 | — | -36.3 | — | -80.8 |
| 20.04–23.83 | voice: In 2007, MythBusters tested the idea. | -16.6 | -16.2 | -33.9 | — | -14.3 |
| 23.83–24.03 | lucka (bara musik) | -32.3 | — | -32.3 | — | -70.9 |
| 24.03–25.74 | voice: Their verdict: plausible. | -16.1 | -15.7 | -34.2 | — | -16.4 |
| 25.74–26.09 | lucka (bara musik) | -34.4 | — | -34.4 | — | -78.7 |
| 26.09–27.84 | voice: But did real pirates do it? | -15.8 | -15.4 | -34.0 | — | -12.6 |
| 27.84–28.09 | lucka (bara musik) | -34.1 | — | -34.1 | — | -74.6 |
| 28.09–29.28 | voice: Nobody knows. | -15.3 | -14.9 | -33.6 | — | -13.5 |
| 29.28–29.48 | lucka (bara musik) | -35.3 | — | -35.3 | — | -73.3 |
| 29.48–32.52 | voice: No picture or record from their time says so. | -16.3 | -15.9 | -34.1 | — | -13.6 |
| 32.52–32.82 | lucka (bara musik) | -32.8 | — | -32.8 | — | -69.5 |
| 32.82–34.60 | voice: Still. A very clever trick. | -15.8 | -15.3 | -35.1 | — | -16.1 |
| 34.60–36.10 | lucka (bara musik) | -24.2 | — | -24.1 | — | -29.0 |

**Läsning av tabellen:**
- I varje lucka mellan meningarna är mixen lika med musiken, till exempel −33,0 mot −33,0, och rösten och whooshen ligger under −60. Resten i luckorna är −52 dBFS eller lägre, utom i den sista. Där är resten uttoningen på 3 ms, eftersom spåren själva inte är tonade.
- Resten under meningarna (−11 till −16 dBFS i topp) och vid lappbytet (−5,5) är mjukgränsen (tanh), som rundar av rösten och whooshen på samma sätt som i v1y. Den finns bara där rösten eller whooshen ligger, inte i luckorna. Det finns alltså inget annat spår.
- Whooshen finns bara vid 17,67–18,1 s.

Miniatyrerna och beskrivningen gäller som de är. Inga ElevenLabs-anrop är gjorda.

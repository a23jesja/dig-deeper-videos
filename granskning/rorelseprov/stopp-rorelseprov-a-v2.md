# STOPP: rörelseprov, platt 2D A Knopp, v2 (21 november 2026)

Jesper: "ett rörelseprov med bara A, cirka 10 sekunder, på en platt målad bakgrund med marklinje: Sir går in från sidan, vänder sig mot kameran, pekar, säger en mening (munnen följer rösten), blir rädd, springer ut. Ada står bredvid, reagerar och pekar."

v1 renderades först, men där bytte händerna teckning i gången (se nedan). v2 är den som granskas; v1-filerna ligger orörda.

## Filer (leverans/rorelseprov/)

| Fil | Storlek | md5 |
|---|---|---|
| rorelseprov-a-v2.mp4 | 2 862 302 B | e0d0ac6e1ed62619e7c94085bb14c32a |
| rorelseprov-a-v2-telefon.mp4 | 1 176 168 B (under 29 MB) | d5483108051d6e70689df8b0b396a94c |

- **ffprobe:** 1080×1920, r_frame_rate och avg_frame_rate 30/1, 300 rutor (10,0 s), yuv420p, color_range tv, color_space bt709, ljud AAC 48 kHz.
- **Rendering:** dubbel storlek (2160×3840), concurrency 1, en rendering i förgrunden med minnesspärren (15,5 GB fritt vid start). Nedskalad med lanczos, CRF 16 och aq-mode 3. Telefonkopian har CRF 23. Efter renderingen fanns 0 kvarlämnade Remotion- eller headless Chrome-processer.

## Momenten (sekunder), med en helbildsruta per moment (granskning/rorelseprov/)

| Moment | Tid | Ruta |
|---|---|---|
| Gång in från vänster, i profil | 0,1–2,66 | v2-ruta-40-gang.png |
| Vändning mot kameran | 2,66–3,26 | v2-ruta-88-vandning.png |
| Pekning mot Ada, med gesten point ur biblioteket spegelvänd till vänster arm | från 3,36 | v2-ruta-112-pekning.png |
| Tal: "Look! The treasure is buried right there!", munnen följer rösten | 3,10–5,15 | v2-ruta-135-tal.png |
| Rädd: minen rädd ur bladet, ett ryck bakåt, armarna upp | från 5,55 | v2-ruta-172-radd.png |
| Vänder sig och springer ut åt vänster: löpposen med 30° lutning och dammpuffar | 6,10–7,3 | v2-ruta-205-lopning.png |

**Ada** står till höger, vänd lite mot Sir.
- Från 3,3: ett leende och blicken mot honom.
- Vid 5,6: rädd med samma ryck.
- Från 6,7: pekar åt det håll han springer, med point ur biblioteket.

## Rösten

- George (ElevenLabs, JBFqnCBsd6RMkjVDRZzb), eleven_multilingual_v2.
- 3 tagningar på 41 tecken var, alla hörda rätt av faster-whisper. Tagning 0 valdes.
- 123 tecken skickades (godkänt högst 164). character_count visade 2 065 efteråt, men räknaren släpar.
- Repliken är putsad från tystnad, satt till −16 LUFS och lagd vid 3,10 s. Den är 2,05 s lång.

**Munnen följer rösten** så här:
- Ljudstyrkan per ruta väljer bland de tre talmunnarna: stängd under 8 % av rösttoppen, halvöppen under 45 %, annars öppen.
- Varje form hålls minst två rutor. Det ger 32 rutor öppen och 14 halvöppen.
- Munspåret är engine/src/craft/rorelseprov-mouth.json.

Inga ljudeffekter och inga fotsteg; filmen har bara repliken.

## Kontroller

**Fötterna (flat_check.mjs, utskrift i `flat-check-v2.txt`):**
- Alla 300 rutor är kontrollerade, för båda figurerna.
- Kontrollen fäller en fot under marklinjen, en fot som glider medan den står (mätt där foten rör marken: tån, hälen, eller trampdynan när hela foten står), och båda fötterna i luften utanför löpningen.
- **Resultat: FLAT CHECK OK.** Största sjunkning 0,0 px, största glidning 0,0 px.

**Ett fel hittat och rättat på vägen:** motionsbiblioteket anger fotens läge i sidled från bäckenets mitt, och skelettet lägger till höftbredden. Knopp har breda höfter för sina korta ben (0,30 benlängder), så en stående fot gled upp till 8 px per ruta när han vände sig. Höftbredden dras nu av i provets modell. Samma sak finns i de gamla 3D-filmernas figurer i mindre skala; dem har jag inte rört.

**Flimmermåttet (`flimmer-v2.txt`, upplysning):**
- Måttet fäller 54 rutor, alla i rörelse:
  - gången (1,0–2,2 s): fötter och händer i sving rör sig mer än 12 px per ruta, vilket är mer än måttet kan räkna bort som rörelse
  - vändningen (2,87–2,97 s)
  - ryckningen när han blir rädd (5,33–5,70 s)
  - vändningen och löpningen (6,27–7,20 s): han springer cirka 40 px per ruta
  - sista rutan (loopen)
- Mest fälls ruta 215 i löpningen, med 16 004 pixlar.
- Det finns inga ögon- eller textrutor, eftersom 2D-riggen inte märker ut ögonen.
- I full storlek ser jag ingen del som byter fram och tillbaka.

**v1:s fel:** den lösa handen ritades hängande från sidan under 50° från lodrätt och öppen över, och armen svängde förbi gränsen i varje steg. När Sir går och springer är händerna nu lösa nävar.

**Kroppskontrollen och mustasch- och ögonkontrollerna** hör till 3D-kortriggen (film_info) och går inte att köra på 2D-riggen. Fotkontrollen ovan är 2D-riggens kroppskontroll.

**Det som är kvar att bedöma:**
- **Vändningen** byter från huvudet i profil till huvudet framifrån en gång per vändning, vid 45°. Det är en teckning i profil och en framifrån, som i tecknad film. Däremellan finns ingen tredje teckning.
- **Dammpuffarna** tonas ut över 0,5 s.

## Kod

- engine/src/craft/flatMotionModel.ts: modellen, med Mover, gesterna och munspåret.
- engine/src/craft/FlatMotion.tsx: ritningen.
- engine/scripts/flat_check.mjs: fotkontrollen.
- motion.ts: `turn` har fått en valfri lyfthöjd. Standardvärdet är oförändrat, så inga gamla filmer ändras.

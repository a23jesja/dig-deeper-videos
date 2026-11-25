# Kaptenens middag v6: att göra (uppdaterat 25 nov kl. 18:45)

Bild 15 hann inte lösas före beslutspunkten kl. 18:00. Därför flyttas STOPP:en till i morgon, med samma ribba (förhandsgodkänt av molnsessionen). Föreslagen tid för STOPP: 26 nov kl. 12:00.

Underlag: oberoende-granskning-v6-t13.md och granskarens villkor 12–13, samt meddelandena om texten, bild 12, pojkens plats och loopen.

## Klart i koden (delstation, commit 25 nov kväll)

**Skägget och puddingen**
- Skägget ritas helt först. Underarm och hand ritas ovanpå med armens egen teckning, och munnen före armen.
- beard_check.py är ett pixelmått inne i skäggets kontur.
  - Det planterade felet `PROPS={"plant":"beardHoles"}` ritar de gamla hålen.
  - Måttet har ännu inte körts.
- Puddingen ritas framför greppande hand i bild 1, med fingrarna över. Vid överlämningen glider den mellan händerna på 0,2 s.

**Sjömannen**
- Den fria armen hänger vid låret (CREW_REST), och kaptenens hand ligger vid hans egen bordsände. Det tar bort handslaget.
- Sniffen sker vid näsan, med leendet 0,32.
- Pekningen stannar före skägget.

**Kaptenen**
- Han reser sig 6 cm med lutning 20, långsamt från 14,4.
- Regel 1 tillåter 15 cm under resningen.

**Pojken**
- Han står bakom bordet på (-0,72; 1,68) och vetter mot (0,35; -0,94).
- Armarna är korslagda (BOY_FOLD).
- Leendet är högst 0,55 i bild 5.

**Röstningen**
- Daniels och Wills "Aye!" ligger på 23,20 och 23,25, märkta [OWN].
- Teckenräkning: 24 tecken. Kontot visade 4237 före och efter. Läs av igen före STOPP:en och kör nyckelkontrollen.
- Sjömannens näve slår i boken och pojkens i bordet på ruta 696, med dunk.
- Mixern tillåter att Aye-tagningarna överlappar.

**Texten**
- Den hamnar aldrig över en arm, en hand, boken eller ett ansikte.
- I första hand läggs den fritt från kroppar och provas i full storlek, 80 % och 65 %.
- I sista hand får den ligga över en stillastående bål. Det noteras i STOPP:en med ett utsnitt i 360 px.

**Tunern**
- Figurerna fyller minst 60 % av höjden, och tomrummet överst är högst 40 %.
- Regel 8: inget eget ansikte under en närmare figur.
- Loopen 15→1 ska vara minst 31°.
- Gruppbilder byggs av ensambilder och tvåbilder (DAILY-RULES).

## Kvar

**1. Röstningen delas i två bilder** (godkänt av molnsessionen):
- 15a, 22,9–23,3: sjömannen och pojken i tvåbild. Båda nävarna och Aye ligger på ruta 696, regel 8 gäller och fyllnaden ska vara minst 60 %.
- 15b, 23,3–24,0: kaptenens reaktion, minst 0,7 s, med tydlig rörelse (svetten, blicken, käken).
- Loopen 15b→1 är ett klipp till en annan figur, men ställningarna ska stämma med ruta 0.
- Över axeln kommer bara i fråga om riggen redan har en godkänd vinkel bakifrån.

**2. Tuna 15a och 15b.** Kameror finns redan för alla andra bilder:

| Bild | Kamera |
|---|---|
| 1 | trebild |
| 2 | kaptenen |
| 3 | sjömannen och boken |
| 4 | sjömannen |
| 5 | pojken |
| 7 | sjömannen |
| 8 | sjömannen |
| 9 | kaptenen, näven och bordet |
| 10b | närbild |
| 11 | kaptenen |
| 12 | sjömannen |
| 13 | sjömannen |
| 14 | pojken |

**3. Kör kontroller och mått:** plattor, dinner_check, limb_check, beard_check (klar och med planterat fel), motion2, flicker2 och djup.

**4. Liv i sjömannens ensambilder:** något nytt var 1–2 s.

**5. Bild 14:** pojkens hand går upp vid sidan av huvudet. Kontrollera med limb_check och ett utsnitt i 360 px. Annars pekar han eller slår näven i bordet.

**6. Provrendering:**
- Egen granskning med två rutor per sekund.
- Ny oberoende granskning, med t13-granskningen bifogad.
- Utsnitt: puddingen vid 1,30, 9,90, 10,60 och 11,50, samt nävarna i röstningen.
- Sömmen: sista rutan och ruta 0 sida vid sida, med största förskjutningen per figur.

**7. STOPP-sidan ska ta upp:**
- byggtid och antal granskningsrundor;
- klippet på ruta 469, där "That" slutar 15,630;
- huvudet i 10b i procent;
- noterna för regel 5 och 13;
- bilden med frontArm-beviset;
- projektionsbeviset för förlängningen;
- pojkens fotpunkt per bild (densamma i alla);
- blinkningarna per figur;
- vad som rör sig i varje bild.

**8. Leverans:**
- Filerna kaptenens-middag-v6.mp4 och kaptenens-middag-v6-telefon.mp4 (under 29 MB), md5 och commit.
- Kontrollera att `git diff ad1a161` på de frysta filerna är tom.

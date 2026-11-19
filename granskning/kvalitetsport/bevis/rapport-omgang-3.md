# Beviset, omgång 3 (19 november, efter den oberoende granskningen av Gladiatorerna v5)

Testfilmen `proof-faults` (engine/src/craft/shorts/proofFaults.ts, kod b167f1e) har nu tio bilder om 2 s, A–J. Den levereras aldrig.
Körning: `node scripts/film_info.mjs proof-faults body` och `node scripts/film_info.mjs proof-faults grips`.

## Nytt i den här omgången

| Fall | Fel som görs med flit | Kontroll | Utfall |
|---|---|---|---|
| G | Den besegrades knästående som i v5: bäckenet rakt ner över den planterade foten, höger knä i marken. Vänster knä hänger 22 cm upp, smalbenet lutar bakåt till en fot bakom knät | kroppskontrollen, nytt test (s2): ett upplyft knä ska ha sin fot under sig | **STOPPAS**: "sir: the left knee hangs 22 cm above the ground with no foot under it: its shin slants back to a foot 34 cm behind the knee" |
| H | KONTROLL, inget fel: knästående som filmen nu har den (`kneeling("kneelhand")`). Främre foten under sitt knä, andra knät i sanden, handen platt i marken | samma | **går igenom**, ingen rad |
| I | Sir håller ett träsvärd i höger hand | – | (inget fel i I) |
| J | Bilden efter I: händerna tomma, svärdet inte nedlagt | grepp, nytt test: samma saker i samma händer från bild till bild om inte bilden säger att en ny scen börjar (`Shot.newScene`, med skäl) | **STOPPAS**: "J-sword-gone-next-shot (film 18.00 s, frame 540): sir's wooden sword, in his right hand at the end of the shot I-holds-a-sword, is gone (not set down in either shot)" |

Kontinuitetstestet släpper igenom en sak som ligger på marken i nästa bild (nedlagd eller tappad, `setDown`), som tridenten på sanden i rules. Det upptäckte i Gladiatorerna också myntet (coins → owner) och läkarens bandagerulle (fed → doctor). De två bilderna har nu `newScene` med skäl:
- doctor: "at his table in the school on another day, not at the bench where he rolled the bandage"
- owner: "a later moment by the gate with his gladiator: the coin he held up while counting is put away". Granskaren får bedöma det. Kistan finns inte heller i den bilden.

## Fall A–F, som i omgång 2 (oförändrat utfall)

- A sitter i luften ovanför sitsen: STOPPAS (hover, 24 cm).
- B arm låst rakt ut: STOPPAS (tpose och locked).
- C fot i soffan: STOPPAS (lår, smalben, fot inne i lådan, och lådan skär benet).
- D sitter bredvid sitsen: STOPPAS (support: "the seat begins 16 cm behind his hips", och dräkten 4 cm in).
- E kontrollen sitter rätt: **underkänns fortfarande** av dräkttestet ("robe ... 6 cm in"). Det öppna fyndet från omgång 2 står kvar: ett kort som sitter ritar varje plagg rakt ner genom sitsen. Sitta blir inte en bildtyp förrän ett knädrapé i cast.ts finns och har godkänts på ett blad.
- F läkaren som han var: stoppas (mage och lår i pallen), men fallet är ingen trogen kopia (en stillastående figur ställs på sina fötter).

## Stillbilder (helstorlek, ur testfilmen)

| Fil | md5 |
|---|---|
| G-knat-hanger-i-luften-ruta-390.jpg | bf026401765fbbc43a2c576a22f50fe4 |
| H-kontroll-knastaende-ratt-ruta-450.jpg | ae7e50f1ff9b1a9e24d01f187a461e30 |
| I-haller-svardet-ruta-510.jpg | e82de6753c6825bd0cd5ac2077f25dd6 |
| J-svardet-borta-nasta-bild-ruta-570.jpg | e3cc42b46be5730d055decd437dd9b08 |

I H ligger högerhanden i marken bakom knät (fingertopparna 1 cm över sanden, uppmätt med `film_info proof-faults joints 450`). Den vänstra handen är fri framför honom.

## Namnen mot granskarens

Granskaren kallar kontrollerna "fall G och H". Här heter de:
- knästående: G (felet) och H (kontrollen som ska gå igenom);
- kontinuitet: I och J, eftersom felet kräver två bilder efter varandra.

## Gladiatorerna

Jesper har publicerat v5 (8df48f8e), och filmen rättas inte mer. Rättelserna för de sex punkterna ligger i koden (b167f1e) men renderas aldrig.

På den koden: `node scripts/film_info.mjs gladiators-death check` ger FILM CHECK OK, body check 1199 rutor, 0 fel. `grips` ger ok, 1473 avläsningar.

Delade ändringar som gäller kommande filmer:
- Sirs pipskaft börjar i mungipan (cast.ts).
- Bibliotekets kneelhand lutar 44 grader, så att handen når marken.
- Knästående i film har foten under det upplyfta knät (gestures.ts KNEEL_PLANTED och KNEEL_LOW).

VERSION: 1

# Steg A: sex riktningar för Sir Digsworth

Material: `granskning/A/blad.jpg` (alla sex på ett blad, 1600 px) och `granskning/A/riktning-1.jpg` till `riktning-6.jpg` (en riktning per bild, 1600 px).

Varje ruta visar: framifrån, från sidan, en pose i rörelse med tyngd i kantljus (varmt från vänster, kallt från höger), Sir Digsworth bredvid en bifigur (romersk bagare) i samma stil, tre ansikten där ögonen spelar (blick åt sidan, misstänksam, förskräckt), tre siluetter och figuren i mobilstorlek.

Allt är ritat i kod. Alla sex är skinn på samma skelett (`engine/src/craft/rig.ts`): poserna innehåller inga mått, så samma pose passar varje riktning och rörelserna behöver inte göras om när utseendet byts. Monokel, tweedkeps, mustasch och pipa finns i alla. Ingen förlaga från andra kanaler eller studior har använts.

## En mening per riktning: vad som gör den egen, och hur lätt den är att animera

1. **Mullvaden.** Egen: en mullvad i tweed (namnet betyder "gräver") känns igen på en sekund på det enda ögat som monokeln förstorar bredvid ett litet pepparkornsöga, på grävtassarna och den långa nosen; bifigurerna blir andra grävare (här en grävling). Animering: lätt i kroppen (en styv päronkropp, tassar som ger tydliga gester), svår i benen, som är så korta att spring och fall blir små, och nosen behöver en egen trekvartsvy.
2. **Träsnittet.** Egen: människor skurna i trä, raka kanter, skuggor som parallella snitt bredvid en svart kant, dämpad färg på papper, och en mustasch som en kil. Animering: lätt, eftersom varje del är stel och bara vrids i leden; svår på två sätt: de täta snitten syns knappt i mobilstorlek, och den dämpade färgen går emot de klara färgerna i "The world look".
3. **Päronet i plus-fours.** Egen: päronformad skalle med hängkinder under en liten hjässa, klockformad kavaj och plus-fours över smala vader, en klocka på två pinnar. Animering: medelsvår; plus-fours döljer knäet och förlåter mycket, men kavajens klocka måste svänga med, och av de sex är den minst särpräglad på avstånd.
4. **Sprattelgubben.** Egen: figuren är ett kort i en 3D-värld och visar det, med lösa kartongdelar som skuggar varandra, mässingsnitar i lederna, en käke som fälls ned när han talar och en mustasch som sitter på en nit. Animering: lättast av alla, varje del vrids kring sin nit och inget behöver formas om; svår i vridningen till trekvart och rygg, som kräver egna utskurna delar, och den blir stel om poserna inte överdrivs.
5. **Långskanken.** Egen: lång och smal som en stående bild, litet huvud på lång hals, keps som en pannkaka och en vaxad mustasch bredare än axlarna, ett T på två mycket långa ben. Animering: de långa lemmarna ger de tydligaste poserna av alla, och rockskört och käpp ger eftersläng nästan gratis; svår i ansiktet, som är så litet att ögon och mun kräver närbilder, och långa ben avslöjar genast fötter som glider.
6. **Storskallen.** Egen: viktoriansk karikatyr, en hög limpformad skalle med polisonger som går ihop med mustaschen, på en liten prydlig kropp. Animering: ansiktet är lättast av alla att spela med och läsa i mobilen; svår i kroppen, där korta armar och ben ger svag action och händerna inte når huvudet, och den ligger närmast det vi lämnar (stort huvud på liten kropp).

## Att titta på

- Känns var och en igen på siluetten, och skiljer de sex sig tydligt från varandra?
- Liknar någon en känd figur?
- Håller händer, fötter och leder i rörelseposen?
- Läser man ögonen i mobilstorlek?

## Byggsessionens egen rekommendation (Jesper väljer)

Mullvaden först: den är den enda som ingen annan historiekanal kan förväxlas med, och den bär namnet. Därefter Sprattelgubben, som är lättast att animera felfritt. De går att blanda: mullvaden kan få sprattelgubbens fällbara käke och nitar.

## Kod

- `engine/src/craft/rig.ts`: skelettet och poserna.
- `engine/src/craft/ink.ts`: pennan (former, skuggton, snitt, tweed, ögon, händer, monokel och kedja).
- `engine/src/craft/designs/`: en fil per riktning (`mole`, `woodcut`, `pear`, `puppet`, `lanky`, `bighead`), plus `common.ts` och `soft.ts`.
- `engine/src/craft/SirDesigns.tsx`: bladet. Rendera med
  `PROPS='{"audio":false}' node scripts/stills.mjs SirDesigns out/craft/designs_ 0 0.5 jpeg` och
  `PROPS='{"audio":false}' node scripts/stills.mjs SirDesign out/craft/design_ 0-5 1 jpeg`.

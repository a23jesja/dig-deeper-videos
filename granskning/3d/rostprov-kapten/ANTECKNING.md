# Röstprov: Clyde som kapten i v57 (inte en leverans)

**Filen**
- `granskning/3d/rostprov-kapten/kaptenens-karta-v57-rostprov-clyde-telefon.mp4`: md5 `59f80f31b07dc9b6b37b780a25499d19`, 2 274 098 byte, 222 rutor, 7,4 s.
- Bildspåret är kopierat oförändrat från v57-telefon (`-c:v copy`). Bildspårets md5 är `bed7f1326c08e644de3b7cb90b42caef` i båda filerna. Bara ljudet är bytt.

**Rösten**
- Clyde (`wyWA56cQNU2KqUW4eCsI`), eleven_multilingual_v2. Rösten användes via sitt id; den är inte klonad och inte tillagd på kontot.
- Repliken: "Boy! Where is my treasure map?", 30 tecken, 3 tagningar.
- Teckenmätaren:
  - före: 3 733;
  - efter: 3 769 (36 räknade av 90 skickade; mätaren släpar, som vid Will-provet);
  - gräns: högst 3 823.
- Nyckeln lästes bara ur miljövariabeln. Nyckelkontrollen efteråt sökte igenom 1 694 textfiler i repot och de nya filerna. Nyckeln fanns i 0 av dem.

**Tagningarna**
Alla tre har 0 ordfel i faster-whisper. Rösten är uppmätt på ljudstyrkan, och tiderna nedan gäller med rösten lagd på 1,00 s.

| tagning | röstens längd | jämfört med Georges 1,46 s | slutar | "Boy!": topp / starkare än resten |
|---|---|---|---|---|
| 0 | 1,95 s | +0,49 s | 3,04 s, efter att Will börjar 2,95: ryms inte | -9,1 dB / +2,5 dB |
| 1 | 1,74 s | +0,28 s | 2,83 s | -11,4 dB / +2,6 dB |
| 2 | 1,79 s | +0,33 s | 2,88 s | -6,6 dB / +3,1 dB |

**Vald: tagning 2.** Den har 0 ordfel och det tydligaste "BOY!" (högst topp och störst skillnad mot resten), och den ryms utan tidssträckning.

**Mixen**
- Clyde ligger på 1,00 s, samma starttid som George. Han hörs till ca 2,80 s, och Will hörs från 3,05 s.
- -14,7 LUFS (v57: -14,6), true peak -5,2 dB. Samma ljud i övrigt som v57: papper, hav och sting, inga fotsteg.
- Byggd med en kopia av ljudskriptet: `engine/out/_cabin3d_audio_clyde.py`, som läser `engine/voice/cabin/c01clyde/`.

**Detta stämmer inte i provet**
Munnar och texter följer fortfarande Georges tajming (1,08-2,54 s), men Clydes röst är 0,33 s längre. Kaptenens mun och "MAP?" kommer därför före Clydes sista ord. Väljer Jesper Clyde gör jag om munnar och texter efter hans tagning, med samma ljudstyrkespår som nu.

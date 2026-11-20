# STOPP: rösttest för granskning (19 november 2026, avslutat av byggsessionen)

**Jesper väljer med örat.** Det här är ett lyssningstest, inte ett beslut som byggsessionen eller granskaren fattar.

## Vad som jämförs

| Bokstav | Röst | Modell |
|---|---|---|
| A | Kokoro **bm_george** | Kokoro v1.0 (kokoro-onnx), redan i alla filmer |
| B | **Qwen3-TTS** VoiceDesign | Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign, rösten beskriven med text |
| C | **Chatterbox** | ResembleAI/chatterbox (originalet, engelska, 500M), med inbyggd röst |

Beskrivningen som gav Qwen sin röst (plan.json): "A warm, dry, slightly smug English gentleman in his fifties, telling a strange true story to a friend. Clear, unhurried, natural pauses, a hint of amusement."

## Samma text för alla tre

A, B och C läser exakt de elva meningarna i plan.json (kontrollerat mot picks.json: meningstexten är identisk i alla tre, tre tagningar per mening, bästa vald):

1. Why did pirates fly black flags?
2. To say: we will kill you all?
3. No.
4. It was an offer.
5. Pirates often crept close under a friendly flag, then ran up the black one.
6. It meant: give up now, and we show mercy.
7. Some ships gave up at the very sight.
8. Fight back, and a red flag might follow: no mercy.
9. The black flag was meant to win the treasure without a fight.
10. One crew had no black flag, so they hoisted a dirty tarpaulin and fired a gun.
11. It worked.

Skillnaden i längd kommer från tempot, inte från texten. Ordfel (Whisper small.en mot texten, bästa tagningen): A snitt 0,011 (högst 0,125), B 0,000, C snitt 0,006 (högst 0,071). Allt är alltså begripligt för maskinen. Hur det låter avgör örat.

## Filer

Alla i `C:\Users\sweje\dig-deeper-videos\granskning\rost\`.

| Fil | Längd | md5 |
|---|---:|---|
| A.wav (Kokoro bm_george, hela texten) | 34,04 s | 91412041866ab3bf94d7ac9a238af327 |
| B.wav (Qwen3-TTS, hela texten) | 35,03 s | 2ce319b97a62c1697ecc8e2a598518e2 |
| C.wav (Chatterbox, hela texten) | 26,53 s | fc4a2fb3936da295cb7170f2813b3f91 |
| rosttest-A-kokoro-10s.mp4 (1080x1920, med ljud) | 10,00 s | cb5283e24ee7ae32e27a7ef17c22dde7 |
| rosttest-B-qwen-10s.mp4 (1080x1920, med ljud) | 10,00 s | 815c391dddc0c2bfa6fa4317cac069a1 |
| rosttest-C-chatterbox-10s.mp4 (1080x1920, med ljud) | 10,00 s | 8663d6f58d26952aba5e58a898947409 |
| rosttest-A-kokoro_B-qwen_C-chatterbox.wav (A, B, C efter varandra) | 98,61 s | 0f1ab6733bc89c7b6d102d296144eb57 |

Stödfiler: plan.json (texten och rollbeskrivningen), picks.json (valda tagningar, vad Whisper hörde), licenser-19-nov.md (licenser och exakt vad som laddades ned, med SHA-256).

De tre 10-sekundersklippen är 1080x1920 med ljud, för att höra öppningen i telefonformat. De tre långa wav-filerna läser hela texten. Den sammanlagda wav-filen är bekvämast att lyssna på: A först, sedan B, sedan C.

## Licenser (lästa före nedladdning, 19 november)

- **A, Kokoro:** Apache-2.0 (vikterna, https://huggingface.co/hexgrad/Kokoro-82M) och MIT (körprogrammet kokoro-onnx, https://github.com/thewh1teagle/kokoro-onnx). Kommersiellt bruk tillåtet. Redan på disken.
- **B, Qwen3-TTS VoiceDesign:** Apache-2.0 för både koden (https://github.com/QwenLM/Qwen3-TTS) och vikterna (https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign). Kommersiellt bruk tillåtet.
- **C, Chatterbox:** MIT för både koden (https://github.com/resemble-ai/chatterbox) och vikterna (https://huggingface.co/ResembleAI/chatterbox). Kommersiellt bruk tillåtet. Obs: allt ljud bär Resemble AI:s osynliga Perth-vattenmärke, och repot är arkiverat (ingen support eller uppdatering).

Fullständiga citat och exakt vad som laddades ned (filer, storlekar, SHA-256): `C:\Users\sweje\dig-deeper-videos\granskning\rost\licenser-19-nov.md`.

## Beslutsläge

Jesper behöll bm_george på gehör den 17 november i ett tidigare test ("den passar sir digsworth"). Det här testet är **grind 3 i kvalitetsgrinden** (en vald röst). Om Jesper hör något bättre i B eller C är det hans val om något ändras. Annars står bm_george kvar. Byggsessionen ändrar inget i filmerna före hans svar.

**Jesper väljer med örat.**

# STOPP: rösttest med ElevenLabs för berättaren (21 november 2026). Jesper väljer med örat

**Lyssna här:** `rosttest-elevenlabs-21nov.mp3`, som har samma innehåll som wav-filen och spelar på telefonen.

Alla röster läser samma elva meningar som i rösttestet 19 november (plan.json): "Why did pirates fly black flags? … It worked."
- Varje mening är putsad från tystnad i ändarna och följs av 0,3 s paus.
- Varje röst ligger på −16 LUFS.
- Mellan rösterna är det 1 s tystnad.

## Ordningen i filen

| # | Röst | Start | Längd | Egen fil | md5 |
|---|---|---:|---:|---|---|
| 1 | ElevenLabs **George** (JBFqnCBsd6RMkjVDRZzb, färdig röst) | 0:00,0 | 26,9 s | el-george.wav | 8ea866ae4bcde054b7f0bf19f76be5fc |
| 2 | ElevenLabs **Daniel** (onwK4e9ZLuTAKqWW03F9, färdig röst) | 0:27,9 | 30,9 s | el-daniel.wav | f3deae9166806684988d522b267d9bb5 |
| 3 | ElevenLabs **Oliver** (L1aJrPa7pLJEyYlh3Ilq, röstbiblioteket) | 0:59,8 | 32,7 s | el-oliver.wav | 60c2a2c038dd2e63207185779ffc491a |
| 4 | ElevenLabs **Clyde** (wyWA56cQNU2KqUW4eCsI, röstbiblioteket) | 1:33,5 | 31,0 s | el-clyde.wav | 0a4fcbf27ce7fbfd7d6f1ebb268e31f7 |
| 5 | Qwen3-TTS (19 nov, B) | 2:05,5 | 35,0 s | B.wav | 2ce319b97a62c1697ecc8e2a598518e2 |
| 6 | Chatterbox (19 nov, C) | 2:41,5 | 26,5 s | C.wav | fc4a2fb3936da295cb7170f2813b3f91 |
| 7 | Chatterbox 10 % långsammare (tempoändring av C) | 3:09,0 | 29,5 s | chatterbox-10pct-langsammare.wav | 1e513435d240a2017389fd5d64062eec |
| 8 | Kokoro **bm_george, nuvarande** | 3:39,5 | 34,0 s | A.wav | 91412041866ab3bf94d7ac9a238af327 |

**Hela filen:**

| Fil | md5 |
|---|---|
| rosttest-elevenlabs-21nov.wav (4:13,5) | fc1280ed22959e6a8bf96a0999af0e25 |
| rosttest-elevenlabs-21nov.mp3 | f8936379fe7770665cc5de756853a667 |

## Hur det gjordes

**Generering och val av tagning:**
- Modell eleven_multilingual_v2, utan klonade röster.
- Tre tagningar per mening och röst. Den tagning som faster-whisper (small.en) hörde med minst ordfel valdes.
- **Ordfel för de valda tagningarna:**
  - George 0 och Clyde 0.
  - Daniel och Oliver: 0 utom "sight", som Whisper skrev "site". Det är samma ord i uttal.
- Sammansättningen gjordes med el_assemble.py, och tagningarna ligger i engine/voice/el-test/.

**Krediterna:**
- 5 187 tecken skickade: 4 röster × 11 meningar × 3 tagningar = 5 184, plus 3 i ett prov ("No."). Godkänt var högst 6 912.
- **character_count:**
  - före 0
  - direkt efter 1 549
  - några minuter senare 2 065 av 40 000
- Kontots räknare uppdateras med fördröjning. Jag läser den igen och meddelar slutsiffran.

**Rösterna på kontot:**
- Oliver och Clyde gick **inte** att lägga till: POST /v1/voices/add gav HTTP 401. API-nyckeln saknar troligen rätten att ändra rösterna på kontot.
- Biblioteksrösterna gick ändå att använda direkt i talsyntesen med sitt röst-id.
- **Inga nya röster finns alltså på kontot.** Kontot har samma 21 röster som före testet.
- Vill Jesper ha Oliver eller Clyde sparad måste han lägga till den i ElevenLabs webbgränssnitt (Voice Library), eller ge nyckeln rätten "Voices: Write".

**Nyckeln** lästes bara ur miljövariabeln. Bara HTTP-status och character_count skrevs ut.

## Vad Jesper väljer

- Rösten för berättaren, Sir Digsworth.
- Kokoro bm_george står sist som nuvarande. Byggsessionen ändrar ingenting i någon film förrän Jesper har valt.

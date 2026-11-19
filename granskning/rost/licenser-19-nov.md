# Rösttestet: licenserna (byggsessionen, 19 november 2026)

Jesper: "Läs licensen på de officiella sidorna (GitHub och Hugging Face) ... Ladda inte ner något som inte uttryckligen tillåter kommersiellt bruk."

Varje licens nedan lästes den 19 november 2026, **före** nedladdningen. Det gäller både koden och varje vikt- eller modellfil. Licenstexten hämtades från den officiella sidan, och licensfältet lästes ur Hugging Face- och PyPI-API:erna.

## B. Qwen3-TTS VoiceDesign (Alibaba Qwen)

| Del | Officiell sida | Licens |
|---|---|---|
| Koden | https://github.com/QwenLM/Qwen3-TTS | Apache-2.0 (GitHub-API:t: `Apache-2.0`; LICENSE i repot) |
| Modellen (vikterna) | https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign | `license: apache-2.0` i modellkortet |
| Python-paketet | https://pypi.org/project/qwen-tts/ (0.1.1) | Apache-2.0 |

**Meningen som tillåter kommersiellt bruk** står i Apache License 2.0, avsnitt 2:
> "Subject to the terms and conditions of this License, each Contributor hereby grants to You a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable copyright license to reproduce, prepare Derivative Works of, publicly display, publicly perform, sublicense, and distribute the Work and such Derivative Works in Source or Object form."

Licensen har ingen klausul mot kommersiellt bruk, och modellkortet lägger inte till några egna villkor.

## C. Chatterbox (Resemble AI)

| Del | Officiell sida | Licens |
|---|---|---|
| Koden | https://github.com/resemble-ai/chatterbox | MIT (GitHub-API:t: `MIT`; LICENSE i repot, "Copyright (c) 2025 Resemble AI") |
| Modellen (vikterna) | https://huggingface.co/ResembleAI/chatterbox | `license: mit` i modellkortet |
| Python-paketet | https://pypi.org/project/chatterbox-tts/ (0.1.7) | MIT |
| Vattenmärket | https://pypi.org/project/resemble-perth/ (1.0.1) | MIT |

**Meningen som tillåter kommersiellt bruk** står i MIT-licensen:
> "Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software ..."

**Bra att veta:** enligt modellkortet bär varje ljudfil från Chatterbox Resemble AI:s Perth-vattenmärke. Det hörs inte och överlever MP3-komprimering. Det är en egenskap hos ljudet, inte ett licensvillkor.

## A. Kokoro bm_george

Kokoro används redan i filmerna (Apache-2.0, enligt tidigare genomgång), och ingenting nytt laddades ned för den.

## Det som inte laddades ned

- Qwen3-TTS Base och CustomVoice behövdes inte, och inte heller den separata Tokenizer-repot: VoiceDesign-repot har sin egen speech_tokenizer.
- Chatterbox flerspråkiga modeller, turbo och onnx.
- Ingenting med licens som inte tillåter kommersiellt bruk: varken F5-TTS, XTTS-v2, Voxtral eller Fish Speech.

## Exakt vad som laddades ned

Se avsnittet längst ned. Det fylls i när testet har körts, med filer, storlekar och SHA-256.

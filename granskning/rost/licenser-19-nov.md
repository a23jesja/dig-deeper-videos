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

Ifyllt 20 november 2026 efter testet, genom att läsa av disken. Storlekar i byte, SHA-256 beräknad med sha256sum. Ingenting nedladdat eller installerat i samband med ifyllnaden.

### B. Qwen3-TTS-12Hz-1.7B-VoiceDesign (Hugging Face: Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign)

Modellen ligger **utanför repot**, i en lokal mapp (inte i Hugging Face-cachen): `C:\Users\sweje\tts-test\models\Qwen3-TTS-12Hz-1.7B-VoiceDesign\` (filtider 19 nov 19:47-19:48). I Hugging Face-cachen (`C:\Users\sweje\.cache\huggingface\hub\models--Qwen--Qwen3-TTS-12Hz-1.7B-VoiceDesign\`) finns bara `refs/main` med revisionen `5ecdb67327fd37bb2e042aab12ff7391903235d3`, ingen snapshot och inga vikter. HF_HOME är inte satt.

| Fil (relativt modellmappen) | Byte | SHA-256 |
|---|---:|---|
| model.safetensors | 3833402552 | 391e8db219f292c515297cdceeb43e4eae67cdde35fa57e79a6a8a532fca0522 |
| speech_tokenizer/model.safetensors | 682293092 | 836b7b357f5ea43e889936a3709af68dfe3751881acefe4ecf0dbd30ba571258 |
| speech_tokenizer/config.json | 2336 | ee65bb901c876664ab8707c487157aa1a6ee57c65969b28fb5ec9dc211e68167 |
| speech_tokenizer/configuration.json | 76 | 6bc26d64eb5024b4d1dab5a52371958b429256d6c9d59787f1f5294a54e0cebd |
| speech_tokenizer/preprocessor_config.json | 234 | fcb3805e597e786d4067706e602f6688524640f8d3396790e2e09b5942fcbdfb |
| config.json | 4421 | aecd2cc4c1fe9edef1cb7ca7c401685a43879ad43f3f9e883f1c6760b61731e0 |
| generation_config.json | 245 | f1b90b4513f3b34c62851049e2492d7b4c5940daf1276f89c82b8ef04127f3aa |
| preprocessor_config.json | 127 | efdde1022ea9d76928bf7a9cd53139138f5ba2e466e837f08f6105ab1af1c119 |
| tokenizer_config.json | 7344 | dc3c31c3bdaedd5016382bb3cbe07323026775ad51f5a4fb564505992ae4a670 |
| vocab.json | 2776833 | ca10d7e9fb3ed18575dd1e277a2579c16d108e32f27439684afa0e10b1440910 |
| merges.txt | 1671839 | 599bab54075088774b1733fde865d5bd747cbcc7a547c5bc12610e874e26f5e3 |
| README.md | 3214 | acfaf6c0d433866cb5e2bb73e7915ea3767f5a2e3abca413b485635a2c72b5e6 |
| .gitattributes | 1519 | 11ad7efa24975ee4b0c3c3a38ed18737f0658a5f75a0a96787b576a78a023361 |

Hugging Face-klientens egna bokföringsfiler (`.cache\huggingface\download\*.metadata` och `.gitignore`, 14 små filer) ligger också i mappen. De är inte modellfiler och är inte listade med hash. Totalt cirka 4,52 GB modellfiler.

### C. Chatterbox (Hugging Face: ResembleAI/chatterbox)

Hugging Face-cachen: `C:\Users\sweje\.cache\huggingface\hub\models--ResembleAI--chatterbox\snapshots\5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18\` (revision 5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18, enligt `refs/main`). Filerna ligger utanför repot. SHA-256 är beräknad på den upplösta blobben.

| Fil | Byte | SHA-256 |
|---|---:|---|
| t3_cfg.safetensors | 2129653744 | 914cb1696f47527fe8852ca8f1fe1fa63cb34f76f9c715e84e067b744dd0da81 |
| s3gen.safetensors | 1056484620 | 2b78103c654207393955e4900aac14a12de8ef25f4b09424f1ef91941f161d4e |
| ve.safetensors | 5695784 | f0921cab452fa278bc25cd23ffd59d36f816d7dc5181dd1bef9751a7fb61f63c |
| conds.pt | 107374 | 6552d70568833628ba019c6b03459e77fe71ca197d5c560cef9411bee9d87f4e |
| tokenizer.json | 25470 | d71e3a44eabb1784df9a68e9f95b251ecbf1a7af6a9f50835856b2ca9d8c14a5 |

Det är de fem filerna som licensgenomgången från 17 november nämner. Inga andra Chatterbox-filer finns i cachen.

I samma cache finns också `models--Systran--faster-whisper-small.en` (Whisper, för att transkribera testet och mäta ordfel). Den hör inte till de tre rösterna och omfattas inte av licensgenomgången ovan. Den lästes inte här, och dess licens är därför inte kontrollerad i det här dokumentet.

### Python-paket

Två separata virtuella miljöer (Python 3.13.5, i `C:\Users\sweje\tts-test\`, utanför repot). Ingen hash tagen.

| Paket | Version | Miljö och plats |
|---|---|---|
| qwen-tts | 0.1.1 | `C:\Users\sweje\tts-test\qwen\Lib\site-packages` (torch 2.13.0+rocm10.0.0, transformers 4.57.3) |
| chatterbox-tts | 0.1.7 | `C:\Users\sweje\tts-test\chatterbox\Lib\site-packages` (torch 2.13.0+rocm10.0.0, transformers 5.2.0) |
| resemble-perth | 1.0.1 | `C:\Users\sweje\tts-test\chatterbox\Lib\site-packages` |

Versionerna stämmer med dem som licensavsnitten ovan läste (0.1.1, 0.1.7, 1.0.1). Beroendepaketen (torch och så vidare) är inte genomgångna här.

### A. Kokoro bm_george (redan på disken före testet)

Ingenting laddades ned för Kokoro i testet. Filerna kom på disken den 13 november 2026, före testet, och ligger i repot i `engine\voice\models\`:

| Fil | Byte | SHA-256 |
|---|---:|---|
| engine\voice\models\kokoro-v1.0.onnx | 325532387 | 7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5 |
| engine\voice\models\voices-v1.0.bin | 28214398 | bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d |

bm_george är ett röstpaket inuti voices-v1.0.bin.

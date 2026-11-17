# Facts per candidate (measured 2026-11-17 on this PC: Ryzen 7 9800X3D, RX 9070 XT, 32 GB)

All files: 48 kHz mono 16-bit, normalised to -14 LUFS integrated (gain + limiter, loop until within 0.15 LU), true peak between -1.9 and -0.6 dBFS. Same sentence list for every voice, 0.25-0.3 s gaps added between sentences. Kokoro speed 1.06 (as black-flag.json) for both Kokoro voices.

| | kokoro-bm_george (reference) | kokoro-bm_fable | chatterbox-default | chatterbox-prompted-george |
|---|---|---|---|---|
| Model / voice | Kokoro-82M, kokoro-onnx 0.4.7, voice bm_george | same, voice bm_fable | Chatterbox 500M English (ResembleAI/chatterbox), built-in conds.pt voice | same model, conditioned on our own 10.6 s bm_george clip (exaggeration 0.5, cfg 0.5, temp 0.8, seed 1234) |
| Device | CPU (onnxruntime, no GPU provider) | CPU | GPU (torch 2.13 ROCm, RX 9070 XT) | GPU |
| Seconds to make 1 min of speech (piece B) | 3.49 s for 22.31 s -> 9.4 s | 6.73 s for 21.24 s -> 19.0 s | 26.4 s for 18.2 s -> 87 s | 33.9 s for 24.0 s -> 85 s |
| Word timings with our faster-whisper alignment (make_voice.py DP, small.en, piece B) | aligned 67/67 | 67/67 | 67/67, but the free transcript shows misheard words (see below), so those timings are interpolated | 67/67 |
| engine/voice/pronunciation.json | Yes: phoneme locks (used here: Vespasian, cithara) | Yes | No: respelling only | No: respelling only |
| Odd things | None. Free transcript of C: "Cythara" (whisper spelling of the locked word) | Whisper heard A as "Now it was an offer" instead of "No." (may be a whisper error, listen). C "cithera" without lock influence | Mispronounces: B opens "You wait before dawn, and a hammock" (wrong words, "wake" and "in" lost), C "The Spatian taxed" (Vespasian), "Sothara" (cithara), "the tarpaulin" (script: "a tarpaulin"). Natural sentence silences 0.5-0.6 s (we added 0.3 s). No cut-offs, no long (>1 s) silences. | "sithara" in C (cithara), otherwise transcript matches. Sentence silences 0.6-0.8 s (we added 0.3 s). No cut-offs, no long silences. Slower, more deliberate delivery: A is 8.5 s against 6.0 s for Kokoro george |

Notes
- Silence detector (ffmpeg silencedetect, -40 dB, >= 0.5 s): no silences at all in the Kokoro files (gaps are only 0.25-0.3 s). Chatterbox leaves its own 0.2-0.5 s of silence at the end/start of each sentence, so every gap there is 0.5-0.8 s; to tighten it, trim each sentence the way make_voice.py trim() does before joining.
- Reproducibility: Chatterbox with a fixed seed; without one the delivery changes from run to run.
- Whisper alignment used the script as initial_prompt (as make_voice.py does), which flatters the match; the free transcripts in ~/voicetrial/raw/analysis.json are the better judge of intelligibility.
- Watermark: Chatterbox files carry the Perth watermark (detector 1.0). Kokoro files do not (0.0).
- Orpheus: dropped, gated download (see licenser.md).
- Install: ~/voicetrial/venv (Python 3.13.5, torch 2.13.0+rocm10.0.0 from stable.repo.amd.com/rocm/whl-next, Chatterbox used from source with --no-deps, then its pinned dependencies except torch). ComfyUI's venv, engine/voice/models and every film's voice folder untouched. Weights: ~/voicetrial/models/chatterbox (3.3 GB).

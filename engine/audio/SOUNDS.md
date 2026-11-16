# Sounds: source and licence

Every sound effect and background sound of the films built with the craft kit is **synthesised by our own code** in
`audio/craft_sfx.py` (sines, filtered noise and decaying modes, with the helpers in `audio/lib/dsp.py`). Nothing is
downloaded, sampled or taken from a sound library, so there is no third-party licence to keep track of.

| Sound | Kind | Source | Licence |
|---|---|---|---|
| step, scuff, thud | footsteps on paving, a sliding shoe, a body or heavy thing hitting the ground | synthesised in `craft_sfx.py` | our own work |
| smash, crack, tear, creak | a clay pot breaking, wood or stone giving way, cloth ripping, a cart leaning | synthesised in `craft_sfx.py` | our own work |
| coin, coinroll | a coin landing, a coin rolling away and settling | synthesised in `craft_sfx.py` | our own work |
| blast, rumble, whoosh | the mountain going off, its rumble, something passing fast | synthesised in `craft_sfx.py` | our own work |
| bark | a dog | synthesised in `craft_sfx.py` | our own work |
| wind, crowd, panic, fire | beds: wind, voices without words, a crowd in panic, a fire | synthesised in `craft_sfx.py` | our own work |
| narration | Sir Digsworth's voice | Kokoro-82M, voice `bm_george`, run locally (`voice/make_voice.py`) | Apache-2.0 (model card) |

If a downloaded sound is ever added: read its licence first, use only CC0, and add a row here with the file name, the
page it came from, the author, the licence and the date it was read. Sounds with any other licence are not used.

## How a film gets its sound
1. The film's cue list names every sound with the frame it happens on. Footsteps come straight from the motion library
   (`Mover.cues()` in `src/craft/motion.ts`: one step for every foot that lands), so they cannot drift from the picture.
2. `node scripts/cues.mjs <name> out/craft/<name>-cues.json` writes the list (`src/craft/cueList.ts`).
3. `python audio/craft_sfx.py out/craft/<name>-cues.json public/craft/<name>.wav` makes every sound, places it on its
   frame (left or right as on the screen), adds the beds and the voice, and brings the mix to -14 LUFS.

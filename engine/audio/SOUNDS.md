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
| splash, bubble, spray, drip, pour | water: something going in (takes `big`), bubbles breaking, a burst of drops, one drop, liquid pouring (takes `dur`) | synthesised in `craft_sfx.py` | our own work |
| snap, shing, thunk, flap, rope | a shark's jaws clacking shut, a blade ringing, a dull knock on wood, a cloth snapping in wind, a short rope creak | synthesised in `craft_sfx.py` | our own work |
| rattle, paper, tap, ting, sack, book | a box shaken (takes `dur`), paper slid out, a fingertip knock, a small bright metal ring, a heavy cloth bag with coins, a soft thwap | synthesised in `craft_sfx.py` | our own work |
| fall, squelch, scratch, sniff | a comic falling whistle going down in pitch (takes `dur`), a foot in wet cloth, a stylus in wax, a breath in through the nose | synthesised in `craft_sfx.py` | our own work |
| step (surface `sand`, `wood`), thud (ignores `surface`) | the same footstep on soft sand (no click) and on a deck (hollow knock) | synthesised in `craft_sfx.py` | our own work |
| sea, surf, lap, flap, flies, street | beds: waves against a hull, small waves on a beach, water lapping close by, a flag in the wind, a few flies, a quiet town street | synthesised in `craft_sfx.py` | our own work |
| music "roman", "shanty" | a light comic piece (plucked strings, fife, hand drum, D mixolydian, about 104 bpm) and a rolling 6/8 piece (plucked bass, whistle, brushes, A dorian, about 96 dotted-quarter bpm); both our own tunes | synthesised in `film_music.py` from `lib/instruments.py` | our own work |
| narration | Sir Digsworth's voice | Kokoro-82M, voice `bm_george`, run locally (`voice/make_voice.py`) | Apache-2.0 (model card) |

If a downloaded sound is ever added: read its licence first, use only CC0, and add a row here with the file name, the
page it came from, the author, the licence and the date it was read. Sounds with any other licence are not used.

## How a film gets its sound
1. The film's cue list names every sound with the frame it happens on. Footsteps come straight from the motion library
   (`Mover.cues()` in `src/craft/motion.ts`: one step for every foot that lands), so they cannot drift from the picture.
2. `node scripts/cues.mjs <name> out/craft/<name>-cues.json` writes the list (`src/craft/cueList.ts`).
3. `python audio/craft_sfx.py out/craft/<name>-cues.json public/craft/<name>.wav` makes every sound, places it on its
   frame (left or right as on the screen), adds the beds and the voice, and brings the mix to -14 LUFS.
4. `python audio/film_audio.py <film>` (run from `engine/`) does steps 2 and 3 and the whole mix in one go, from the film file itself:
   it runs `node scripts/film_info.mjs <film> audio` (the `sounds` and `beds` of every shot on their frames, the film's `beds`,
   its `hits` and its `music`), makes the effects with `craft_sfx.effects()` (a cue that names a sound that does not exist stops
   the run with a message; `dur`, `big`, `run` and `surface` go only to the sounds that take them), adds a low thump for every hit,
   and makes the music with `film_music.music(name, seconds, lines)`. The voice is set to -16 LUFS; the music sits 18 dB under it
   while the voice speaks and comes up 5 dB in pauses longer than 0.4 s (read from the lines file); the effects sit 11 dB under it
   (integrated); the whole is brought to -14 LUFS integrated with a soft ceiling and a true peak at or under -1 dB. It writes
   `public/craft/<film>.wav` and `out/craft/<film>-audio.json` (integrated LUFS, true peak, the loudness of voice, music and effects
   in the final mix, the number of cues and beds). The voice reads slightly above -16 in the final mix (about -13.8) because the
   music and effects add to the sum and the whole is then set to -14.

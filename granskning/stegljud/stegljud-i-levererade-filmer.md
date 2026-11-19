# Foot sounds in the delivered films (build session, 19 November)

Jesper's decision of 19 November: "Ta bort ljudet som görs när personer går i videosen och shortsen helt, det låter inte bra".

## How it is removed

- **The mixer** (engine/audio/craft_sfx.py) no longer has the kinds `step` (footsteps when walking or running) and `scuff` (a shoe sliding in a skid or stumble). A cue of either kind stops the sound build, with the frame and the shot named.
- **The film check** (`film_info <film> check`, which deliver.sh runs) fails if any shot schedules one.
- **No other source:** footsteps came only from the shots' own sound lists. Nothing adds them from the walkers' steps by itself.

## Where they are in the delivered films

The times come from the films' code as it stands today. Each row is one span: the film's seconds, the shot, how many sounds, and which kinds. The delivered files are untouched; Jesper chooses whether any film is remade.


### gladiators-death: 25 foot sounds

| Seconds | Shot | Count | Kinds |
|---|---|---|---|
| 0.62-1.10 s | hook | 2 | scuff, step |
| 6.96-8.46 s | nine | 4 | step |
| 9.14-10.64 s | carried | 4 | step |
| 20.45-20.75 s | rules | 2 | step |
| 27.18-27.18 s | pull | 1 | scuff |
| 28.46-32.06 s | out | 9 | step |
| 33.93-34.29 s | patients | 3 | scuff |

### animal-trials: 9 foot sounds

| Seconds | Shot | Count | Kinds |
|---|---|---|---|
| 6.53-6.53 s | vines | 1 | step |
| 12.48-12.48 s | get | 1 | scuff |
| 19.98-19.98 s | vote | 1 | scuff |
| 25.11-26.61 s | water | 4 | step |
| 31.32-31.32 s | barren | 1 | scuff |
| 34.67-34.67 s | experts | 1 | step |

### blackbeard-fuses: 8 foot sounds

| Seconds | Shot | Count | Kinds |
|---|---|---|---|
| 0.38-1.73 s | hook | 4 | step |
| 4.04-4.04 s | sir | 1 | scuff |
| 6.54-6.98 s | ready | 3 | step |

### black-flag: 30 foot sounds

| Seconds | Shot | Count | Kinds |
|---|---|---|---|
| 1.90-1.90 s | hook | 1 | scuff |
| 6.61-7.71 s | creep | 3 | scuff |
| 17.16-17.16 s | red | 1 | scuff |
| 19.02-19.02 s | red | 1 | scuff |
| 20.58-23.87 s | answer | 16 | step |
| 26.45-28.71 s | hoist | 7 | step, scuff |
| 32.08-32.08 s | loop | 1 | scuff |

### nero-fiddle: 48 foot sounds

| Seconds | Shot | Count | Kinds |
|---|---|---|---|
| 0.26-1.23 s | hook | 7 | step |
| 2.94-3.93 s | flames | 7 | step |
| 4.15-5.25 s | flames2 | 6 | step |
| 9.73-9.79 s | away | 2 | step, scuff |
| 11.76-15.66 s | gardens | 26 | step, scuff |

### pirate-plank: 16 foot sounds

| Seconds | Shot | Count | Kinds |
|---|---|---|---|
| 7.55-7.55 s | rules | 1 | step |
| 8.97-8.97 s | rules | 1 | scuff |
| 12.49-12.49 s | paid | 1 | step |
| 15.26-15.70 s | island | 3 | step |
| 17.46-17.86 s | gun | 2 | step |
| 21.10-21.10 s | never | 1 | scuff |
| 22.43-22.73 s | over | 2 | step |
| 29.44-30.09 s | books | 5 | step |

### rome-pee: 56 foot sounds

| Seconds | Shot | Count | Kinds |
|---|---|---|---|
| 0.02-0.48 s | hook | 3 | scuff, step |
| 2.44-4.44 s | street | 10 | step |
| 6.89-9.76 s | guess | 11 | step, scuff |
| 10.65-10.65 s | pour | 1 | scuff |
| 15.55-16.25 s | titus | 2 | step |
| 17.98-18.91 s | coin | 2 | scuff |
| 21.12-23.12 s | yet | 10 | step |
| 27.27-29.77 s | walk | 6 | step |
| 30.27-32.53 s | card | 11 | step, scuff |

# Gladiators v4b (6adfa603) against v4 (1d12351b): per-frame PSNR of the decoded pictures

The table shows, per shot, the lowest and the median PSNR (dB), comparing every frame of v4b with the same frame of v4. "inf" means the frames are identical.

| Shot | Frames | Lowest | Median |
|---|---|---|---|
| hook | 0-44 | 45.4 | 49.3 |
| peek | 45-89 | 45.8 | 47.0 |
| **guess** | 90-156 | 24.1 | 24.9 |
| **not** | 157-195 | 24.1 | 25.5 |
| nine | 196-260 | 43.3 | 45.5 |
| carried | 261-326 | 42.9 | inf |
| trained | 327-363 | 46.5 | 48.6 |
| **fed** | 364-447 | 16.2 | 16.3 |
| coins | 448-495 | 16.2 | 49.3 |
| **owner** | 496-609 | 13.1 | 13.2 |
| rules | 610-678 | 13.2 | 49.9 |
| finger | 679-767 | 46.8 | 48.9 |
| **sponsor** | 768-805 | 22.9 | 23.0 |
| pull | 806-838 | 22.9 | 51.4 |
| out | 839-946 | 46.5 | 50.2 |
| doctor | 947-1008 | inf | inf |
| patients | 1009-1104 | 46.1 | 48.7 |
| **relax** | 1105-1168 | 23.8 | 24.4 |
| loop | 1169-1198 | 42.4 | 44.0 |

**Changed:** only the six shots in bold (13-25 dB in every frame).
- Guess, not and relax use the two-shot crowd, which no longer has a spectator right behind Sir.
- Fed is the bench, owner is the owner shot, and sponsor is the sponsor shot.

**Single low frames elsewhere.** The lowest values in coins (448), rules (610), pull (806) and carried (261) each come from one frame, which shares a boundary with a changed shot.

**Encoder noise in the parade (nine) and the loop.** These shots have dense crowds, and their code did not change. They stay at 42-46 dB, which is the codec's variance between two renders of the same picture.

The evidence for that comes from rules and finger. In the first v4b render (31498cb) they had medians of 42.9 and 43.1 dB. In this render (98676e5) they are at 49.9 and 48.9 dB, and neither shot's code changed between the two renders.

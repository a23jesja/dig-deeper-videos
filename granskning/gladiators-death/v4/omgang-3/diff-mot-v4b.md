# Gladiators v4c (df71aa3b) against v4b (6adfa603): per-frame PSNR of the decoded pictures

| Shot | Frames | Lowest | Median |
|---|---|---|---|
| hook | 0-44 | 45.4 | 49.3 |
| peek | 45-89 | 46.3 | 47.3 |
| guess | 90-156 | 21.4 | 27.4 |
| not | 157-195 | 21.6 | 45.9 |
| nine | 196-260 | 43.5 | 48.1 |
| carried | 261-326 | 43.1 | inf |
| trained | 327-363 | 49.0 | 51.4 |
| fed | 364-447 | 47.4 | 49.1 |
| coins | 448-495 | 46.8 | 100.3 |
| owner | 496-609 | 45.3 | 46.6 |
| rules | 610-678 | 41.1 | 42.9 |
| finger | 679-767 | 42.2 | 43.1 |
| sponsor | 768-805 | 41.3 | inf |
| pull | 806-838 | 47.5 | 51.6 |
| out | 839-946 | 46.7 | 48.5 |
| doctor | 947-1008 | inf | inf |
| patients | 1009-1104 | 46.1 | 47.8 |
| relax | 1105-1168 | 45.0 | 46.7 |
| loop | 1169-1198 | 42.5 | 43.8 |

- **Changed:** guess only, at 21-27 dB.
- **Not:** its low value is the cut frame at 157, against the guess.
- **Rules, finger, the parade and the loop:** 41-44 dB, the codec's noise in the crowd shots. Their code is unchanged, and the same shots read 49-50 dB in the v4b render.

# Animal trials v1b (92f4ae0d) against v1 (3f7f8da6): per-frame PSNR of the decoded pictures

| Shot | Frames | Lowest | Median |
|---|---|---|---|
| complaint | 0-61 | inf | inf |
| court | 62-108 | 47.4 | 55.1 |
| yes | 109-165 | 46.3 | inf |
| eating | 166-193 | 46.4 | 48.6 |
| vines | 194-288 | 45.9 | 47.9 |
| bow | 289-371 | 49.4 | 53.1 |
| get | 372-414 | 46.5 | 56.1 |
| argued | 415-522 | 53.6 | 55.6 |
| herb | 523-592 | 48.5 | 49.7 |
| vote | 593-651 | 46.8 | 48.4 |
| field | 652-740 | 46.3 | inf |
| water | 741-852 | 46.3 | 50.2 |
| barren | 853-991 | 14.6 | 14.6 |
| picky | 992-1036 | 14.6 | 21.9 |
| experts | 1037-1130 | 12.9 | 13.1 |
| verdict | 1131-1166 | 13.0 | 49.1 |
| lost | 1167-1263 | 12.8 | 12.9 |
| who | 1264-1305 | 13.7 | 54.0 |
| loop | 1306-1437 | 44.6 | inf |

- Changed: the four shots of the review's list, barren, picky, experts and lost, each at 13-22 dB.
- The single low frames in verdict (1131) and who (1264) are the cuts next to them.
- The loop's two frames at 44.6 dB are codec noise. Its code is unchanged.

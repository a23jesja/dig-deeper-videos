# Shorts batch 1, version 2: six scripts checked against the source pages


> **The cloud session's decisions on v2 (2026-11-26):**
> - **Short 6, line 12 (the dogs) is cut.** The runner chased, Len Taunyane, was brought to the 1904 World's Fair as part of
>   an exhibit; the Short must not risk playing his ordeal for laughs. Its shot goes to a longer Carvajal or Hicks beat.
>   Pre-count falls by 52 x 3 = 156 characters.
> - Every other fact, change and cut in v2 is accepted. The three named single-source lines (Short 1 line 7, Short 4
>   line 12, Short 5 line 5) are accepted by the cloud session and go to the reviewer for his explicit approval.
> - Johnson (1724) is re-opened when gutenberg.org is back, before Short 1 is voiced.

Draft for the script STOPP, 2026-11-26. Nothing is committed or pushed, nothing is built, and no ElevenLabs or other paid
call has been made. Narrator George (ElevenLabs); side lines Daniel (adult men) and Will (young figures), short [OWN]
lines only; Sir Digsworth appears only in Short 4 (his lines are George).

## How this version was checked

- Every page was downloaded with curl through the session proxy (TLS checks on) on 26 November and turned into plain text
  with a small script. Each quote below was found in that text, unless the row says otherwise. Quotes are copied as they
  appear, apart from joined line breaks.
- **Status words:** VERIFIED = two independent publishers, both read today, say it (the quotes are given). CHANGED = a page
  says something different, and the line now matches the pages. CUT = no two read sources; the line is gone or replaced.
  ONE SOURCE, NAMED = the single allowed line per Short, with its source named in the voice.
- **Pages I still could not open** (the hosts are allowed, but the sites refused):
  - www.britannica.com: every page returns a Cloudflare "Just a moment..." bot challenge (HTTP 403) to curl.
  - www.smithsonianmag.com: the same Cloudflare challenge (HTTP 403).
  - www.olympics.com: the connection is reset ("HTTP/2 stream was not closed cleanly: INTERNAL_ERROR"; HTTP/1.1 gives no
    response either), retried after 30 s.
  - www.gutenberg.org: "Temporarily Down for Maintenance" (HTTP 503), retried after 30 s. That covers Johnson's *General
    History of the Pyrates* and Ashton's *History of Bread*.
  - www.english-heritage.org.uk, "The history of football in England": the page loads, but its text sits in an embedded
    story on english-heritage.shorthandstories.com, which is not on the allowlist. The English Heritage *Medieval Law
    quiz* did open and is used instead.
  - WebFetch cannot be used as a fallback: it resolves hosts outside the proxy and fails on all of these.
- **Johnson (1724) in Short 1:** not re-opened today (Gutenberg was down). The Johnson quotes are the ones an earlier
  session read verbatim on 17 November (`granskning/pirate-day/manus.md` on main). In Short 1 every claim also rests on
  Royal Museums Greenwich, read today; Johnson is the second publisher, as read on 17 November. Re-check Johnson when
  Gutenberg is back.
- **New sources found today on allowed hosts and used:** History.com (four more articles), Olympedia's Fred Lorz page, the
  San Francisco Chronicle on the closure, the South Carolina Encyclopedia's "Piracy" entry, and two more British History
  Online texts (Riley's *Memorials* for 1409 with its 1314 footnote).

## Summary

Length estimated at 2.5 spoken words per second. Pre-count = characters of the spoken text as written, spaces and
punctuation included, times 3 takes.

| # | Topic | Words | Length, est. | Sets | New motions | Characters | Pre-count (x3) | Changes in v2 |
|---|---|---|---|---|---|---|---|---|
| 1 | Pirates: Roberts' lights-out rule | 115 | ~46 s | ship's deck | 9 | 3 | 1 827 | 2 lines changed, safer ending |
| 2 | Pirates: Blackbeard's Charleston blockade | 102 | ~41 s | ship's deck, wooden room | 6 | 4 | 1 686 | 3 cut, 4 changed, 1 new |
| 3 | Alcatraz: Scott's swim, Dec 1962 | 122 | ~49 s | prison cell (kitchen), sea plate, open field (shore) | 8 | 4 | 1 935 | 1 changed |
| 4 | 1300s: the bakers' trapdoor table, 1327 | 123 | ~49 s | wooden room, street | 7 | 4 + Sir | 1 935 | 1 changed, picture fixed |
| 5 | 1300s: England's football bans | 97 | ~39 s | street, open field | 7 | 3 | 1 596 | 2 cut, 5 changed, new one-source line |
| 6 | 1904 Olympic marathon | 121 | ~48 s | open field | 10 + a dog | 6 + a dog | 1 995 | 4 cut, 4 changed, 1 new |
| | **Total** | **680** | **~4 min 32 s** | | | **24 + Sir + a dog** | **10 974** | |

**Pre-count by voice:** George 3 413 characters x 3 = **10 239** (Sir Digsworth's 75 included); Daniel 112 x 3 = **336**;
Will 133 x 3 = **399**. **Total 3 658 x 3 = 10 974** (v1 was 11 193).

**One-source lines (one per Short at most, source named):** Short 1 line 7 (Johnson, "A book from 1724 says"), Short 4
line 12 ("The city's record adds", Riley's translation of the City's Letter-Book E), Short 5 line 5 ("English Heritage
says"). Shorts 2, 3 and 6 have none.

**The four flagged items, decided:**
1. Short 1 ending after Roberts' death: the safer ending, "[OWN] Lights out at eight. Remember?"
2. Short 2 last line: the sources say the pirates plundered the ships for "supplies and specie" (SCE) and took the
   captives' "valuables" (QAR). New line 12: "He had also plundered the ships for supplies and valuables." Last line: "But
   the ransom? One chest of medicine." "Gold and silver" is not said: the only source with those words is Johnson, which
   could not be opened today (SCE says "specie", meaning coin, which QAR does not repeat).
3. Short 5 "on pain of prison": VERIFIED in the 1363 writ as printed by Noorthouck ("under pain of imprisonment"). The line
   is now general ("Play anyway, and you could end up in prison."), so it is backed by three read sources: the 1363 writ
   (Noorthouck), the 1388 law (English Heritage quiz: "Six days imprisonment") and the 1409 proclamation (Riley: "on pain
   of imprisonment").
4. Short 2 "the chest took days to arrive": CUT. Neither the South Carolina Encyclopedia nor the QAR pages say so (the v1
   search summary was wrong). Blackbeard's "[OWN] Any day now..." went with it.

---

## 1. The Pirate Captain Who Gave His Crew a Bedtime

- **Title:** The Pirate Captain Who Gave His Crew a Bedtime (46 characters)
- **Hook:** "One pirate crew had a bedtime." On screen: ONE PIRATE CREW HAD A BEDTIME.
- **Set:** ship's deck, night to dawn. **Tone:** funny, turning serious.

### Narration
| # | Voice | Line | Mark | Chars |
|---|---|---|---|---|
| 1 | G | One pirate crew had a bedtime. | [SOURCE] | 30 |
| 2 | G | At eight o'clock, every light and candle went out. | [SOURCE] | 50 |
| 3 | D (rum pirate) | Oi! I can't see my rum! | [OWN] | 23 |
| 4 | G | It was a rule on Bartholomew Roberts' ship. | [SOURCE] | 43 |
| 5 | G | Roberts himself preferred tea. | [SOURCE] | 30 |
| 6 | G | Anyone who still wanted a drink had to take it up on the open deck. | [SOURCE] | 67 |
| 7 | G | A book from 1724 says Roberts hoped this would curb the drinking. | [SOURCE], one source, named | 65 |
| 8 | G | It didn't. | [SOURCE] | 10 |
| 9 | D (rum pirate) | To the captain! | [OWN] | 15 |
| 10 | G | One night in February 1722, the crew celebrated a captured ship by drinking through the liquor on board. | [SOURCE] | 104 |
| 11 | G | Next morning, a navy warship found them. | [SOURCE] **CHANGED** | 40 |
| 12 | G | Many of the men were still drunk. | [SOURCE] | 33 |
| 13 | W (young pirate) | Wake up! Warship! | [OWN] | 17 |
| 14 | G | Roberts went into the fight anyway. It was his last. | [SOURCE] | 52 |
| 15 | G | Lights out at eight. Remember? | [OWN] **CHANGED** (safer ending) | 30 |

### Verification
R1 = RMG "Pirate myths debunked" (read today). RG = RMG "History of pirates" (read today; same publisher as R1).
J = Johnson 1724 (read verbatim 17 November, not re-opened today: Gutenberg 503).

| Line | Claim | Status | Quotes |
|---|---|---|---|
| 1, 2, 4 | Roberts' ship had a lights-out rule at eight | VERIFIED (R1 today; J 17 Nov) | R1: "The pirate Bartholomew Roberts for example had 11 articles, including the seemingly quaint command that 'lights and candles [should] be put out at eight o'clock at night." J: "The Lights and Candles to be put out at eight o'Clock at Night" |
| 5 | Roberts preferred tea | VERIFIED (R1; J) | R1: "Some pirates, like Bartholomew Roberts, preferred to celebrate with a cup of tea instead." J: "(for it may be noted that Roberts drank his Tea constantly)" |
| 6 | Drinkers had to go to the open deck | VERIFIED (R1; J) | R1: "If any of the crew wants to continuing drinking after that hour, they must do it on the open deck.'" J: "they were to do it on the open Deck" |
| 7 | Roberts hoped it would curb the drinking | ONE SOURCE, NAMED (J) | J: "which Roberts believed would give a Check to their Debauches, for he was a sober Man himself" |
| 8 | It didn't work | VERIFIED (J explicit; R1 shows it) | J: "found at length, that all his Endeavours to put an End to this Debauch, proved ineffectual." R1: the crew "reportedly celebrated the capture of a prize by drinking through the ship's stocks of liquor." |
| 10 | Feb 1722, drinking after a captured prize | VERIFIED (R1; J) | R1: "On 9 February 1722 the crew of Roberts's ship the Royal Fortune reportedly celebrated the capture of a prize by drinking through the ship's stocks of liquor." J: "the Temptation of Liquor, and Plunder, they might find in this their new Prize, would make the Pyrates very confused; and so it happened." |
| 11 | Next morning a navy warship came | **CHANGED** | v1 said "came round the cape", which only Johnson says. Now "found them". R1: "The following day, Royal Navy warship the Swallow, led by Captain Chaloner Ogle, tracked them down." RG: "On 10 February 1722 however, his ship was intercepted by Captain Chaloner Ogle of the Royal Navy." J: "the Man of War bore away to round the Cape" |
| 12 | Many men still drunk | VERIFIED (R1; J) | R1: "'Although his crew was decidedly under the weather, with many of the men still drunk or heavily hungover, Roberts chose to fight,'" J: "the greatest Part of his Men were drunk, passively Couragious, unfit for Service." |
| 14 | He fought and was killed | VERIFIED (R1, RG; J) | R1: "Roberts chose to fight"; "Some of this struck Roberts in the neck and tore out his throat, killing him at once." RG: "Bartholemew Roberts was killed during the battle". J: "Roberts himself made a gallant Figure" (the battle in which he died). |

### Shot list
Unchanged from v1 except shot 15 and the ending. No death is shown; Roberts' teacup trembling stands for line 14.

| # | Time (s) | What visibly happens | In frame | Set | Props |
|---|---|---|---|---|---|
| 1 | 0.0-2.4 | **Frame 1.** Roberts (teacup in hand) leans in and blows out a lantern on a barrel; behind him the rum pirate freezes mid-swig as his face drops into the dark. Bell stroke on frame 1 (bell rope swings at frame edge). Hook text. | Roberts, rum pirate | ship's deck | lantern, barrel, teacup, mug, bell rope |
| 2 | 2.4-4.1 | The young pirate hauls the bell rope; lanterns along the rail go out one by one behind him. | young pirate | ship's deck | bell, lanterns |
| 3 | 4.1-5.8 | Wide from the mast: candles snuff out left to right; small figures groan; moonlight takes over. | small figures | ship's deck | candles, moon |
| 4 | 5.8-8.7 | Close: the rum pirate squints into his mug in the dark: "Oi! I can't see my rum!" | rum pirate | ship's deck | mug |
| 5 | 8.7-11.7 | Roberts taps the line LIGHTS AND CANDLES OUT AT 8 on the articles nailed to the mast, then pours tea (steam in moonlight). | Roberts | ship's deck | articles, teapot |
| 6 | 11.7-13.4 | Close: Roberts sips, little finger out, eyes shut. | Roberts | ship's deck | teacup |
| 7 | 13.4-15.9 | Over Roberts' shoulder: the rum pirate rises through the hatch with a bottle. | Roberts (back), rum pirate | ship's deck | hatch, bottle |
| 8 | 15.9-18.8 | Moonlit open deck: the rum pirate plonks onto a barrel and pours; the young pirate holds out a cup. | rum pirate, young pirate | ship's deck | barrel, bottle, mugs |
| 9 | 18.8-20.7 | Object, under 2 s: a book opens by a candle stub, title page A GENERAL HISTORY OF THE PYRATES, 1724. | none | ship's deck | book |
| 10 | 20.7-23.2 | Roberts looks down at the deck, hopeful, lifts his teacup and nods. | Roberts | ship's deck | teacup |
| 11 | 23.2-24.2 | Whip pan: a cork shoots out of the rum pirate's bottle past the lens. | rum pirate | ship's deck | bottle, cork |
| 12 | 24.2-25.7 | The rum pirate raises his mug: "To the captain!" The young pirate raises his cup behind him. | rum pirate, young pirate | ship's deck | mugs |
| 13 | 25.7-28.5 | Wide, moonlit sea: Roberts' ship beside a captured ship; barrels swing across on a rope; small figures cheer. | small figures | ship's deck (wide) | captured ship, barrels |
| 14 | 28.5-32.3 | The two pirates roll a barrel, knock out the bung; drink spurts into mugs; bottles roll; the sky greys. | rum pirate, young pirate | ship's deck | barrel, mallet, bottles |
| 15 | 32.3-35.1 | Dawn, wide from the bow: a navy warship looms out of the grey light; its gunports open one after another. | none (ship) | ship's deck (wide) | warship |
| 16 | 35.1-37.8 | The rum pirate snores against a barrel; the bottle slips and rolls away. | rum pirate | ship's deck | barrel, bottle |
| 17 | 37.8-39.6 | The young pirate drops his telescope, clangs the bell: "Wake up! Warship!" The rum pirate jolts awake behind. | young pirate, rum pirate | ship's deck | telescope, bell |
| 18 | 39.6-41.6 | Low angle: Roberts claps on his red-feathered hat, sets his teacup on the rail, draws his cutlass. | Roberts | ship's deck | hat, cutlass, teacup |
| 19 | 41.6-42.7 | Wide: the warship fires a broadside, a line of smoke; camera shake. No hit shown. | none | ship's deck (wide) | warship, smoke |
| 20 | 42.7-43.7 | Close: the teacup alone on the rail trembles; the tea ripples. | none | ship's deck | teacup |
| 21 | 43.7-46.0 | The night before: Roberts' hand with the teacup reaches into frame towards the lantern ("Lights out at eight. Remember?"). Cuts to frame 1. | Roberts (hand) | ship's deck | lantern, teacup |

### Characters and new motions
Unchanged from v1. Roberts (tall, slim, clean-shaven, long dark hair tied back, black tricorn with red feather, crimson
waistcoat, gold chain, teacup); the rum pirate, Daniel (short, wide, bald under a red spotted bandana, ginger beard,
striped shirt); the young pirate, Will (small teen, bare-headed, messy straw-blond hair, freckles, oversized blue shirt).
New motions: blow out a lantern, pour from a teapot, sip, rise through a hatch, roll a barrel, pull a bell rope, snore
slumped, jolt awake, clap a hat on.

### Pre-count
George 554 x 3 = 1 662; Daniel 38 x 3 = 114; Will 17 x 3 = 51. **Sum 1 827.**

### Sources
- **[R1]** Royal Museums Greenwich, "Pirate myths debunked": https://www.rmg.co.uk/stories/maritime-history/pirates-fact-or-fiction
  (the old URL https://www.rmg.co.uk/stories/topics/what-do-pirates-do serves the same page). Read 26 Nov.
- **[RG]** Royal Museums Greenwich, "History of pirates: the 'Golden Age of Piracy'":
  https://www.rmg.co.uk/stories/maritime-history/pirates-history-golden-age-piracy . Read 26 Nov.
- **[J]** Charles Johnson, *A General History of the Pyrates* (1724), Project Gutenberg no. 40580:
  https://www.gutenberg.org/files/40580/40580-h/40580-h.htm . Read verbatim 17 Nov by an earlier session; HTTP 503 today.

---

## 2. Blackbeard Blockaded a City. His Ransom? Medicine.

- **Title:** Blackbeard Blockaded a City. His Ransom? Medicine. (50 characters)
- **Hook:** "Blackbeard blockaded a city. His ransom? Medicine." On screen: BLACKBEARD BLOCKADED A CITY.
- **Sets:** ship's deck; wooden room as the governor's office (two shots). **Tone:** clever, a little frightening.

### Narration
| # | Voice | Line | Mark | Chars |
|---|---|---|---|---|
| 1 | G | Blackbeard blockaded a city. His ransom? Medicine. | [SOURCE] | 50 |
| 2 | G | In May 1718, his pirate ships sat outside the harbour of Charleston for about a week. | [SOURCE] | 85 |
| 3 | G | Ships trying to come in or get out were seized. | [SOURCE] | 47 |
| 4 | W (young pirate) | Another one, Captain! | [OWN] | 21 |
| 5 | G | He took hostages, and held them for ransom. | [SOURCE] **CHANGED** | 43 |
| 6 | G | Then he sent his demand ashore. | [SOURCE] | 31 |
| 7 | G | His price for the hostages: one chest of medicine. | [SOURCE] | 50 |
| 8 | D (governor) | ...Medicine? | [OWN] | 12 |
| 9 | G | If it didn't come, he threatened to kill them. | [SOURCE] | 46 |
| 10 | G | The town gave in, and sent the medicine. | [SOURCE] **CHANGED** | 40 |
| 11 | G | Then he let the hostages go. | [SOURCE] **CHANGED** | 28 |
| 12 | G | He had also plundered the ships for supplies and valuables. | [SOURCE] **NEW** | 59 |
| 13 | W (young pirate, in a plumed hat from the plunder) | Fits nicely. | [OWN] | 12 |
| 14 | G | But the ransom? One chest of medicine. | [SOURCE] **CHANGED** | 38 |

Cut from v1: "But the chest took days to arrive." (no read source), "[OWN] Any day now..." (it implied the delay), "At last, it
came aboard." (merged into line 10).

### Verification
SCE = South Carolina Encyclopedia, "Blackbeard"; SCE-P = its "Piracy" entry (same publisher). QAR = Queen Anne's Revenge
Project (NC Dept. of Natural and Cultural Resources), "Blackbeard: History of the Dreaded Pirate"; QAR-B = its blog "On This
Day, Charleston was Besieged" (same publisher). HCP = History.com, "8 Famous Pirates From History". All read today.

| Line | Claim | Status | Quotes |
|---|---|---|---|
| 1 | Blackbeard blockaded the city; the ransom was medicine | VERIFIED (SCE, QAR, HCP) | SCE: "he blockaded the port for a week, seizing prizes and hostages for ransom." / "a reluctant Governor Robert Johnson agreed to a ransom of a valuable chest of medicine." QAR: "Blackbeard blockaded the port of Charleston for nearly a week." / "As ransom for the hostages, Blackbeard demanded a chest of medicine." HCP: "he then blockaded the port of Charleston, South Carolina, until the town's residents met his demands for a large chest of medicine." |
| 2 | May 1718, about a week, several ships | VERIFIED (SCE, QAR) | SCE: "Arriving off Charleston, South Carolina, in mid-May 1718, he blockaded the port for a week"; "a four-ship flotilla". QAR: "In May 1718, the pirates arrived off Charleston, South Carolina, with Queen Anne's Revenge and three smaller sloops." / "for nearly a week." |
| 3 | Ships coming in or going out were seized | VERIFIED (QAR, SCE) | QAR: "The pirates seized several ships attempting to enter or leave the port". QAR-B: "They immediately took two outbound and two inbound ships from England". SCE: "seizing prizes"; "Plundering eight or nine ships for supplies and specie". |
| 5 | Hostages held for ransom | **CHANGED** | v1 said "among them a member of the colony's council". Only SCE names the councilman ("held hostages, including Samuel Wragg, a councilman"), so it is cut. Kept: SCE: "seizing prizes and hostages for ransom." QAR: "detained the crew and passengers of one ship, the Crowley, as prisoners." / "As ransom for the hostages". |
| 6 | He sent his demand ashore | VERIFIED (QAR, HCP; SCE implies) | QAR-B: "Richards ... and another pirate took a passenger from one of the captured ships to deliver a message to the governor." QAR (quoting Johnson): "resolves to demand a Chest from the Government of the Province". HCP: "until the town's residents met his demands". |
| 7 | One chest of medicine | VERIFIED | as line 1. |
| 9 | Threat to kill the hostages | VERIFIED (SCE, QAR) | SCE: "Under the threat of the hostages being murdered". QAR (quoting Johnson): "they would murder all their Prisoners". QAR-B: "or they would kill all their captives, burn the ships, and sack the town." |
| 10 | The town gave in and sent the medicine | **CHANGED** (delay cut) | SCE: "a reluctant Governor Robert Johnson agreed to a ransom of a valuable chest of medicine." QAR-B: "As the town was in no condition to defend itself, the governor sent the demanded medicine". SCE-P: "hostages were ransomed for valuable medicines." "Took days" is in neither publisher's pages: **CUT**. |
| 11 | The hostages were let go | **CHANGED** ("unhurt, but without most of their clothes" cut) | QAR: "Once delivered, the captives were released". QAR-B: "Blackbeard's crew set the prisoners free". SCE-P: "hostages were ransomed". The clothing is in QAR-B only ("not before they took any valuables and clothing from them"); SCE says nothing about clothes (the v1 search summary was wrong), and Smithsonian could not be opened. "Unhurt" is in no page read. |
| 12 | Ships plundered for supplies and valuables | **NEW**, VERIFIED (SCE, QAR-B) | SCE: "Plundering eight or nine ships for supplies and specie". SCE-P: "numerous ships were plundered of goods and specie". QAR-B: "they took any valuables and clothing from them, gathered up any useful supplies, and 'distroy'd most of their cargoes etc. all for pure mischief sake'". |
| 14 | The ransom was one chest of medicine | VERIFIED | as line 1. The line no longer says "all that, for", because the pirates also took plunder (line 12). |

### Shot list
| # | Time (s) | What visibly happens | In frame | Set | Props |
|---|---|---|---|---|---|
| 1 | 0.0-3.3 | **Frame 1.** Behind Blackbeard (back and hat as a dark foreground shape): his ships in a line across the harbour mouth, the town beyond; he flings an arm at the town; the cannon beside him runs out with a thump. Hook text. | Blackbeard (back) | ship's deck | cannon, ships, town backdrop |
| 2 | 3.3-5.3 | Map, once, 2 s: Blackbeard's hand slides four ship tokens across a harbour labelled CHARLES TOWN; the chart corner reads MAY 1718. | hand | ship's deck (table top) | chart, tokens |
| 3 | 5.3-7.2 | Close: Blackbeard lifts a telescope, other eye narrowed, grin spreading; smoke curls from under his hat. | Blackbeard | ship's deck | telescope |
| 4 | 7.2-9.1 | Wide: the sun arcs over the blockading ships, sets and rises again. | none (ships) | ship's deck (wide) | ships, sun |
| 5 | 9.1-11.0 | Wide: a merchant ship tries to slip out; a pirate sloop cuts across its bow, a warning shot splashes ahead, its sails drop. | none (ships) | ship's deck (wide) | merchant ship, sloop, splash |
| 6 | 11.0-12.7 | The young pirate chalks another tally mark by the rail as a captured hull bumps alongside. | young pirate | ship's deck | chalk, tally board |
| 7 | 12.7-14.4 | Close: he spins round, beaming: "Another one, Captain!" | young pirate | ship's deck | chalk |
| 8 | 14.4-16.0 | Two-shot: a plump passenger in a brown wig stands stiffly; Blackbeard leans in and looks him up and down. | Blackbeard, passenger | ship's deck | — |
| 9 | 16.0-17.5 | The passenger sits down hard on a rope coil; his wig slides over one eye; he pushes it back, sweating. | passenger | ship's deck | rope coil, wig |
| 10 | 17.5-19.8 | Hands: Blackbeard writes a note with a quill, presses a seal into wax, rolls it; a longboat waits below. | hand | ship's deck (table top) | quill, wax, seal |
| 11 | 19.8-21.6 | Governor's office: the governor unrolls the note as the camera pushes in; it reads ONE CHEST OF MEDICINES. | governor | wooden room | note, desk |
| 12 | 21.6-23.3 | Wide: the longboat (seen earlier leaving) waits at the town quay; small figures. | small figures | ship's deck (wide, harbour) | longboat |
| 13 | 23.3-24.1 | Close: the governor's eyebrow shoots up: "...Medicine?" | governor | wooden room | note |
| 14 | 24.1-27.5 | Deck, low angle: Blackbeard half-draws his cutlass and glares at the town; the passenger behind him gulps. No violence. | Blackbeard, passenger | ship's deck | cutlass |
| 15 | 27.5-29.2 | Governor's office: the governor thumps the desk, slumps, then points at the door. | governor | wooden room | desk |
| 16 | 29.2-30.7 | Wide: a wooden chest is hoisted up the ship's side on a rope and lands on deck with a thud. | small figures | ship's deck | chest, rope |
| 17 | 30.7-33.0 | The passenger steps down the gangway into the longboat, clutching an empty purse; Blackbeard waves him off. | Blackbeard, passenger | ship's deck | gangway, purse |
| 18 | 33.0-36.7 | Wide: pirates carry sacks, barrels and a small strongbox across a plank from a captured ship. | small figures | ship's deck (wide) | sacks, barrels, strongbox |
| 19 | 36.7-37.8 | The young pirate tries on a plumed hat from an opened crate and turns side to side: "Fits nicely." | young pirate | ship's deck | crate, plumed hat |
| 20 | 37.8-40.8 | Close: Blackbeard kneels and opens the medicine chest: bottles and jars; he lifts one and sniffs. The camera rises to the harbour mouth and cuts to frame 1. | Blackbeard | ship's deck | medicine chest, bottles |

### Characters and new motions
Blackbeard, no line now (very big, black beard twisted into tails with ribbons, black tricorn with
smoking slow matches, long coat, sash with pistols; reuse the blackbeard-fuses look if it exists); the governor, Daniel
(tall, thin, white powdered tie-wig, clean-shaven, long nose, blue coat with gold buttons); **the passenger** (was "the
councilman"; no line; plump, red cheeks, brown full-bottomed wig, brown velvet coat); the young pirate, Will (skinny,
red knitted cap, freckles, gap tooth, striped shirt). No red cross on the chest. New motions (6): quill and seal (hands),
chalk a tally, kneel and open a chest, wave someone off, try on a hat and turn side to side, sit down hard. (Drumming
fingers and turning an hourglass are no longer needed.)

### Pre-count
George 517 x 3 = 1 551; Daniel 12 x 3 = 36; Will 33 x 3 = 99. **Sum 1 686.**

### Sources
- **[SCE]** South Carolina Encyclopedia (University of South Carolina), "Blackbeard": https://www.scencyclopedia.org/sce/entries/blackbeard/ . Read 26 Nov.
- **[SCE-P]** South Carolina Encyclopedia, "Piracy": https://www.scencyclopedia.org/sce/entries/piracy/ . Read 26 Nov.
- **[QAR]** Queen Anne's Revenge Project, "Blackbeard: History of the Dreaded Pirate": https://www.qaronline.org/history/blackbeard-history-dreaded-pirate . Read 26 Nov.
- **[QAR-B]** Queen Anne's Revenge Project blog, "On This Day, Charleston was Besieged": https://www.qaronline.org/blog/2018-05-18/day-charleston-was-besieged . Read 26 Nov.
- **[HCP]** History.com, "8 Famous Pirates From History": https://www.history.com/articles/8-real-life-pirates-who-roved-the-high-seas . Read 26 Nov.
- Not opened: Britannica "Queen Anne's Revenge" (Cloudflare 403); Smithsonian "The Last Days of Blackbeard" (Cloudflare 403);
  Johnson ch. III (Gutenberg 503). No claim rests on them now.

---

## 3. He Swam From Alcatraz on Rubber Gloves

- **Title:** He Swam From Alcatraz on Rubber Gloves (38 characters)
- **Hook:** "He swam from Alcatraz on rubber gloves." On screen: SWAM FROM ALCATRAZ ON RUBBER GLOVES.
- **Sets:** prison cell set dressed as the basement kitchen; the ship's deck set's sea plate (no ship); open field dressed
  as the rocky shore and fort below the bridge. **Tone:** tense, admiring; no joke about his condition.

### Narration
| # | Voice | Line | Mark | Chars |
|---|---|---|---|---|
| 1 | G | He swam from Alcatraz on rubber gloves. | [SOURCE] | 39 |
| 2 | G | Blown up, like balloons. | [SOURCE] | 24 |
| 3 | G | December 1962. Two prisoners, John Paul Scott and Darl Parker, got through the bars of a kitchen window. | [SOURCE] **CHANGED** | 104 |
| 4 | G | They climbed out, down to the water. | [SOURCE] | 36 |
| 5 | D (Parker) | Go! Go! | [OWN] | 7 |
| 6 | G | Parker only made it to a rock just off the island. | [SOURCE] | 50 |
| 7 | G | Scott kept swimming. But the current dragged him away from the city, out towards the Golden Gate. | [SOURCE] | 97 |
| 8 | G | Teenagers found him on the rocks below the Golden Gate Bridge. | [SOURCE] | 62 |
| 9 | W (teen) | Hey, mister! Can you hear me? | [OWN] | 29 |
| 10 | G | He was in shock, and dangerously cold. But he had made it to shore. | [SOURCE] | 67 |
| 11 | G | Then they took him back to Alcatraz. | [SOURCE] | 36 |
| 12 | G | Three months later, Alcatraz closed. It cost too much to run. | [SOURCE] | 61 |
| 13 | G | Not bad, for a few rubber gloves. | [OWN] | 33 |

### Verification
BOP = Federal Bureau of Prisons, "Alcatraz". HC14 = History.com, "Alcatraz Escapes: 14 Breakout Attempts"; HC10 =
History.com, "10 Things You May Not Know About Alcatraz"; HCA = History.com, "Alcatraz" (one publisher, three articles).
SFC = San Francisco Chronicle, "Trump said 'nobody's ever escaped from Alcatraz.' Oh really?"; SFC2 = Chronicle, "Why
Attorney General Robert F. Kennedy ordered Alcatraz to close". NPS = National Park Service, "The Voices of Fort Point"
(1977 interview with the two men who found Scott). All read today.

| Line | Claim | Status | Quotes |
|---|---|---|---|
| 1, 2 | He swam on inflated rubber gloves | VERIFIED (SFC, NPS) | SFC: "Scott had made "water wings" by stuffing inflated rubber surgical gloves inside the sleeves of his denim shirt, which he tied around his waist." NPS: "He had surgical gloves- / Around his- / inflated around his waist for water wings." |
| 3 | Dec 1962, Scott and Parker, the kitchen window bars | **CHANGED** ("bent the bars" became "got through the bars") | BOP: "December 16, 1962 -- John Paul Scott and Darl Parker bent the bars of a kitchen window in the cellhouse basement". HC14: "After bending the kitchen window bars in the jailhouse basement". SFC disagrees on the method: "Scott and another man, Darl Lee Parker, sawed through window bars using household cleaner". The line now says only what all agree on. |
| 4 | They climbed out to the water | VERIFIED (BOP, HC14) | BOP: "climbed out, and made their way down to the water." HC14: "Scott and Parker clambered out and made for the bay". |
| 6 | Parker only reached a rock near the island | VERIFIED (BOP, SFC, NPS) | BOP: "Parker was discovered on a small outcropping of rock a short distance from the island." SFC: "Parker was found not far from the island, clinging to a cluster of rocks 100 yards away." NPS: "he just made it out to Little Alcatraz". |
| 7 | The current pulled Scott away from the city, out towards the Golden Gate | VERIFIED (BOP, HC14) | BOP: "Scott attempted to swim towards San Francisco, but the currents began pulling him out to sea." HC14: "Strong currents forced both activists to abandon their plans." Where he came ashore: line 8. |
| 8 | Teenagers found him on the rocks below the bridge | VERIFIED (BOP, SFC, NPS); disputed by HC10 | BOP: "He was found by several teenagers on the rocks near Fort Point (beneath the Golden Gate Bridge)". SFC: "teenagers found clinging to the rocks off Fort Point on Dec. 17, 1962." NPS: "We were underneath the Golden Gate Bridge, I guess it's called Fort Point"; "we were about 15 years old." HC10 says "police discovered him"; the voice follows the three. |
| 10 | In shock and dangerously cold; he had made it ashore | VERIFIED (BOP, HC14, HC10, SFC) | BOP: "suffering from shock and hypothermia". HC14: "John Paul Scott came ashore on the mainland exhausted and hypothermic at the foot of the Golden Gate Bridge". HC10: "swam to shore ... lying unconscious in hypothermic shock." SFC: "proved that a person could swim from Alcatraz to the mainland and survive". |
| 11 | Taken back to Alcatraz | VERIFIED (BOP, SFC, NPS) | BOP: "before being returned to Alcatraz." SFC: "Both were taken back to Alcatraz." NPS: "he got a standing ovation when he went back to Alcatraz." |
| 12 | Closed three months later, because of cost | VERIFIED (BOP, HCA); note SFC2 | BOP: "On March 21, 1963, USP Alcatraz closed after 29 years of operation. It did not close because of the disappearance of Morris and the Anglins ... but because the institution was too expensive to continue operating." HCA: "The federal penitentiary at Alcatraz was shut down in 1963 because its operating expenses were much higher than those of other federal facilities at the time." SFC2 adds that the prison "was deemed vulnerable to future escape attempts" and that the June 1962 escape "accelerated the closure decision". The line gives cost only, which all three name; it does not say the escape caused the closure. |

**Picture fixes from the pages:** the NPS finders say he was found at night, in rain and moonlight, below a 10-foot slippery
ledge, wearing nothing but the gloves; the Chronicle says the gloves were in his shirt sleeves tied round his waist. The
picture shows bare shoulders and a denim shirt knotted round his waist with glove fingers poking out (fits both), the find
at night in rain, and how the bars opened left unclear (hands working at the bars, cut, the gap is open).

### Shot list
| # | Time (s) | What visibly happens | In frame | Set | Props |
|---|---|---|---|---|---|
| 1 | 0.0-2.7 | **Frame 1.** Night water: Scott's bare shoulders, a denim shirt knotted round his waist with inflated glove fingers poking out; he strokes towards the lens; the lit cellhouse behind; a splash hits the lens. Hook text. | Scott | sea plate | shirt, gloves, island |
| 2 | 2.7-4.5 | Hands only: a glove is puffed up finger by finger and knotted at the cuff. | hands | prison cell (kitchen) | glove |
| 3 | 4.5-7.0 | Basement kitchen at night: Scott at the barred window glances left and right; a wall calendar reads DECEMBER 1962. | Scott | prison cell (kitchen) | barred window, pots, calendar |
| 4 | 7.0-9.2 | Two-shot: Scott and Parker work at the bars, faces straining and red, sweat flying. | Scott, Parker | prison cell (kitchen) | bars |
| 5 | 9.2-11.4 | Close: a pot on the sill topples and clangs; the camera tilts to the gap now open in the bars. | none (object) | prison cell (kitchen) | bars, pot |
| 6 | 11.4-12.9 | Outside, low angle: Scott squeezes through feet first and drops onto the rocks; Parker's head appears above. | Scott, Parker | open field (island edge) | window, rocks |
| 7 | 12.9-14.3 | Wide: two small figures scramble down the rocks to the black water. | small figures | open field (wide) | rocks |
| 8 | 14.3-15.8 | Water's edge: Parker waves Scott on with both arms: "Go! Go!" Scott wades in. | Parker, Scott | open field (water edge) | gloves |
| 9 | 15.8-17.8 | Wide on the bay: two small heads swim away; one veers to a small black rock. | small figures | sea plate | rock |
| 10 | 17.8-19.8 | Parker hauls himself onto the rock and sits hugging his knees, shivering; the lighthouse beam passes. | Parker | sea plate | rock, beam |
| 11 | 19.8-21.8 | Close: Scott swims hard towards the city lights; breath puffs. | Scott | sea plate | city lights |
| 12 | 21.8-24.0 | Aerial, once, 2 s: current streaks curve from the island towards the bridge; a tiny wake bends with them. | tiny figure | sea plate (aerial) | island, city, bridge |
| 13 | 24.0-26.3 | Scott strokes but drifts backwards; the city slides away; the bridge looms. Eyes wide. | Scott | sea plate | bridge |
| 14 | 26.3-28.3 | Night, rain, moonlight: a wave carries Scott onto the rocks below the brick fort and the bridge. | Scott | open field (rocky shore) | rocks, fort, bridge |
| 15 | 28.3-30.4 | Two-shot on the wet ledge above: two teenagers with a torch stop dead; the beam lands on Scott below. | teen 1, teen 2 | open field (shore) | torch |
| 16 | 30.4-33.3 | Close: teen 1 crouches at the ledge and calls: "Hey, mister! Can you hear me?" | teen 1 | open field (shore) | torch |
| 17 | 33.3-35.9 | Small military police figures lower a ladder down the ledge; Scott, wrapped in a grey blanket, shivers, lips blue. | Scott, small figures | open field (shore) | ladder, blanket |
| 18 | 35.9-38.8 | Close: Scott in the blanket looks back across the water at the island; a tired half-smile. | Scott | open field (shore) | blanket |
| 19 | 38.8-41.5 | Wide: a prison launch carries one small figure back to the island; the dock gate swings shut. | small figure | sea plate | launch, gate |
| 20 | 41.5-43.8 | Hands only: a guard chains and padlocks the cellhouse gate; a notice reads CLOSED, MARCH 1963. | hands | prison cell (gate) | chain, padlock, notice |
| 21 | 43.8-46.0 | Wide: the empty island by day; gulls land in the yard; a supply barge chugs away. | none | sea plate | barge, gulls |
| 22 | 46.0-48.8 | Night water: one inflated glove bobs past; Scott's head pops up beside it and he swims. Cuts to frame 1. | Scott | sea plate | glove |

### Characters and new motions
Unchanged: Scott (lean, mid-thirties, short dark slicked hair, clean-shaven, narrow face; denim shirt, bare shoulders in
the water); Parker, Daniel (big, fair crew cut, stubble, square jaw, denim jacket); teen 1, Will (skinny, dark quiff, zip
jacket); teen 2, no line (shorter, round glasses, buzz cut, striped sweater). New motions: swim (cut at the waterline),
drift limp, inflate a glove, work at bars, squeeze through a window, climb onto a rock and sit shivering, crouch and call,
padlock (hands).

### Pre-count
George 609 x 3 = 1 827; Daniel 7 x 3 = 21; Will 29 x 3 = 87. **Sum 1 935.**

### Sources (all read 26 Nov)
- **[BOP]** https://www.bop.gov/about/history/alcatraz.jsp
- **[HC14]** https://www.history.com/articles/alcatraz-prison-escape-attempts
- **[HC10]** https://www.history.com/articles/10-things-you-may-not-know-about-alcatraz
- **[HCA]** https://www.history.com/articles/alcatraz
- **[SFC]** https://www.sfchronicle.com/sf/article/alcatraz-escapes-trump-20311304.php
- **[SFC2]** https://www.sfchronicle.com/bayarea/article/alcatraz-why-closed-20309740.php
- **[NPS]** https://www.nps.gov/goga/learn/historyculture/the-voices-of-fort-point.htm
- Not opened: Britannica "Why did Alcatraz close?" and "Alcatraz" (Cloudflare 403). Replaced by HCA.

---

## 4. London Bakers Hid a Trapdoor in Their Tables (1327)

- **Title:** London Bakers Hid a Trapdoor in Their Tables (1327) (51 characters)
- **Hook:** "This baker's table had a trapdoor." On screen: THIS BAKER'S TABLE HAD A TRAPDOOR.
- **Sets:** wooden room as the bakehouse; street with the pillory and St Paul's spire. **Tone:** funny.

### Narration
| # | Voice | Line | Mark | Chars |
|---|---|---|---|---|
| 1 | G | This baker's table had a trapdoor. | [SOURCE] | 34 |
| 2 | G | London, 1327. People brought their own dough to the baker's oven. | [SOURCE] | 65 |
| 3 | GS (Sir Digsworth) | One loaf, please. My own dough. | [OWN] | 31 |
| 4 | G | The baker set it on his table, over a hidden hole. | [SOURCE] | 50 |
| 5 | G | Underneath sat a servant, in secret. | [SOURCE] | 36 |
| 6 | G | He opened a little door and pulled the dough away, bit by bit. | [SOURCE] | 62 |
| 7 | W (servant boy) | ...Bit more. | [OWN] | 12 |
| 8 | GS (Sir Digsworth) | Has my loaf shrunk? | [OWN] | 19 |
| 9 | G | Then the trick was found out. Nine more bakers had the same table. | [SOURCE] | 66 |
| 10 | G | The men caught with dough under the table stood in the pillory, with the dough hung round their necks. | [SOURCE] **CHANGED** ("Those" became "The men") | 102 |
| 11 | D (baker) | It's not mine. | [OWN] | 14 |
| 12 | G | The city's record adds: do it again, and you'd stand there a whole day, then leave London for good. | [SOURCE], one source, named | 99 |
| 13 | G | So if your loaf looks small... | [OWN] | 30 |
| 14 | GS (Sir Digsworth) | ...check under the table. | [OWN] | 25 |

### Verification
RIL = H. T. Riley (ed.), *Memorials of London and London Life* (1868), 1327 entry, from the City's Letter-Book E (British
History Online). UNW = George Unwin, "London tradesmen and their creditors", *Finance and Trade under Edward III* (Manchester
University Press, 1918; British History Online). Both read today. Unwin quotes the same record, but is a separately
published study by a historian. Ashton (Gutenberg) is no longer cited.

| Line | Claim | Status | Quotes |
|---|---|---|---|
| 1, 4, 6 | A hole in the moulding table with a small door, like a mousetrap | VERIFIED (RIL, UNW) | RIL: "did skilfully and artfully cause a certain hole to be made upon a table of his, called a "moldingborde," pertaining to his bakehouse, after the manner of a mouse-trap, in which mice are caught; there being a certain wicket warily provided for closing and opening such hole." UNW: "a certain hole to be made upon a table of his called a moulding-board pertaining to his bakehouse after the manner of a mouse-trap, there being a certain wicket warily provided for closing and opening such hole" |
| 2 | 1327; people brought their own dough to the baker's oven | VERIFIED (RIL, UNW) | RIL: "4th day of June, A.D. 1327"; "when his neighbours and others, who were wont to bake their bread at his oven, came with their dough or material for making bread". UNW: "In 1327 John Brid, baker"; "his neighbours and others who were wont to bake their bread at his oven came with their dough". |
| 4 | Set over the hole | VERIFIED (RIL, UNW) | RIL: "the said John used to put such dough or other material upon the said table ... and over the hole before-mentioned". UNW: "such dough having been placed on the aforesaid table". |
| 5, 6 | A hidden servant pulled the dough away bit by bit | VERIFIED (RIL, UNW) | RIL: "the same John had one of his household, ready provided for the same, sitting in secret beneath such table; which servant of his, so seated beneath the hole, and carefully opening it, piecemeal and bit by bit craftily withdrew some of the dough aforesaid". UNW: "the said John had one of his household sitting in secret beneath the table who carefully opened the hole and bit by bit craftily withdrew some of the dough aforesaid". |
| 9 | Found out; nine more bakers with the same table | VERIFIED (RIL, UNW) | RIL names seven bakers ("William atte Sele, John atte Barnette, Robert de Bertone, John de Polberowe, Robert de Brokesbourne, Roger de Miltone, and Richard de Honesdone") and two bakeresses, "in whose houses also, like tables, called "moldingbordes," were found, with like holes". UNW: "The Serjeant-at-mace and the Sheriff's Clerk who discovered this atrocity, having made a raid on the public bakehouses of the city, found no less than nine others provided with fraudulent tables". |
| 10 | The men caught with dough stood in the pillory with it round their necks | **CHANGED** | RIL: "all those of the bakers aforesaid, beneath whose tables with holes dough had been found, should be put upon the pillory, with a certain quantity of such dough hung from their necks". UNW: "those under whose tables dough was found were to have a quantity of dough suspended from their necks". **But the two women were not pilloried:** RIL: "it was agreed and ordained that they should be sent back to the Prison of Neugate"; UNW: "Two women bakers were reprieved for a time". So "Those caught" became "The men caught", and the woman in the pillory is gone from the picture. |
| 12 | Do it again: a whole day in the pillory, then banished | ONE SOURCE, NAMED (RIL) | RIL: "if any one of the said bakers should in future be found acting with such deceit, falsehood, and malice, he should stand upon the pillory for one whole day, and afterwards abjure the City, so as at no future time to return thereto." |

Also verified, not voiced: "until Vespers" is now in both (RIL "until Vespers at St. Paul's in London should be ended";
UNW "to stand till vespers in the pillory"), so it could be added if wanted. Whether Brid himself was pilloried stays out
(RIL: "save and except John Brid and Robert de Brokesbourne, with whom no such dough was found").

### Shot list
Unchanged from v1 except shot 15 (no woman in the pillory) and timing.

| # | Time (s) | What visibly happens | In frame | Set | Props |
|---|---|---|---|---|---|
| 1 | 0.0-2.4 | **Frame 1.** Under the table, in the dark: a small door in the tabletop slides open; a small hand reaches up, pinches dough and pulls it down. Hook text. | servant boy | wooden room (bakehouse) | trapdoor table, dough |
| 2 | 2.4-4.6 | Street: Sir Digsworth strides in under the bakery sign carrying a cloth-covered bowl of dough like a trophy. | Sir Digsworth | street | bowl, sign |
| 3 | 4.6-6.8 | Wide: small figures queue with bowls; the baker pulls loaves from the glowing oven on a peel. | baker, small figures | wooden room | oven, peel |
| 4 | 6.8-9.8 | Over the table: Sir sets his dough down: "One loaf, please. My own dough." The baker grins too widely. | Sir, baker | wooden room | dough |
| 5 | 9.8-12.0 | Hands: the baker slaps the dough exactly over a faint square seam in the wood. | hands | wooden room | dough, seam |
| 6 | 12.0-14.0 | The baker shapes the dough, whistling, eyes sliding to Sir. | baker | wooden room | dough |
| 7 | 14.0-16.5 | Tablecloth lifts: the servant boy cross-legged by a half-full basket of dough, finger to his lips at us. | servant boy | wooden room | basket |
| 8 | 16.5-18.9 | Close: the boy slides the little door open and pinches dough, piece after piece. | servant boy | wooden room | trapdoor, basket |
| 9 | 18.9-21.3 | Above: the dough visibly shrinks between pats; the baker keeps whistling. | baker | wooden room | dough |
| 10 | 21.3-22.5 | Under the table: "...Bit more." | servant boy | wooden room | dough |
| 11 | 22.5-24.4 | Street: Sir holds up a tiny loaf; his monocle drops on its chain: "Has my loaf shrunk?" | Sir | street | tiny loaf |
| 12 | 24.4-26.5 | The door bursts open; the serjeant-at-mace steps in; the baker freezes mid-whistle. | serjeant, baker | wooden room | mace, door |
| 13 | 26.5-28.0 | The serjeant whips up the tablecloth: the boy caught with the basket, eyes huge. | serjeant (arm), boy | wooden room | tablecloth |
| 14 | 28.0-29.4 | Street, wide: trapdoor tables thrown onto a cart one after another, nine of them. | small figures | street | cart, tables |
| 15 | 29.4-32.2 | The baker in the pillory, head and hands through the boards, dough on a string round his neck; beside him a second baker in the same state. St Paul's spire behind. | baker, second baker | street | two pillories, dough |
| 16 | 32.2-34.2 | Close: the dough swings under his chin; a pigeon lands on it and pecks. | baker | street | dough, pigeon |
| 17 | 34.2-36.3 | Sir walks past, holds his tiny loaf up beside the dough on the baker's neck, nods gravely. | Sir, baker | street | tiny loaf |
| 18 | 36.3-37.8 | Close on the baker, sweating: "It's not mine." | baker | street | dough |
| 19 | 37.8-40.2 | Hands: a clerk's finger runs down an entry in a big bound record book; 1327 in the margin. | hand | street (desk) | record book |
| 20 | 40.2-42.6 | Time-lapse: the sun crosses the sky, the pillory's shadow swings round, the baker sags. | baker | street | pillory |
| 21 | 42.6-45.0 | Wide: a small figure with a bundle walks out through the city gate, which shuts behind him. | small figure | street (gate) | gate |
| 22 | 45.0-47.3 | Sir at his own table with his tiny loaf, looking at us. | Sir | wooden room | loaf |
| 23 | 47.3-49.2 | Sir bends to peer under his table: "...check under the table." Cuts to frame 1. | Sir | wooden room | table |

### Characters and new motions
The baker, Daniel (big, round, thick black eyebrows, clean-shaven double chin, white linen coif, floury apron); the
servant boy, Will (small, ginger bowl cut, gap tooth, patched green tunic); **the second baker** (replaces the woman baker;
no line; thin, bald crown with a grey fringe, long grey beard, brown hood); the serjeant-at-mace (no line; tall, grey
pointed beard, red hood with a long tail, mace); Sir Digsworth (exists). New motions: slap and pat dough, slide a
trapdoor and pinch (hands), stand in a pillory, bend to look under a table, whip up a cloth, burst a door open, hold an
object up to compare.

### Pre-count
George 544 x 3 = 1 632; George as Sir 75 x 3 = 225; Daniel 14 x 3 = 42; Will 12 x 3 = 36. **Sum 1 935.**

### Sources (read 26 Nov)
- **[RIL]** https://www.british-history.ac.uk/no-series/memorials-london-life/pp153-169 (pp. 162-165)
- **[UNW]** https://www.british-history.ac.uk/manchester-uni/london-lay-subsidy/1332/pp19-34
- Dropped: Ashton, *The History of Bread* (Gutenberg 503; not needed).

---

## 5. England Banned Football. It Didn't Work.

- **Title:** England Banned Football. It Didn't Work. (40 characters)
- **Hook:** "England banned football. It didn't work." On screen: ENGLAND BANNED FOOTBALL.
- **Sets:** street; open field as the archery green. **Tone:** funny, a chain of failed bans.

### Narration
| # | Voice | Line | Mark | Chars |
|---|---|---|---|---|
| 1 | G | England banned football. | [SOURCE] | 24 |
| 2 | G | It didn't work. | [SOURCE] | 15 |
| 3 | D (footballer) | Mine! Mine! | [OWN] | 11 |
| 4 | G | In 1314, a proclamation banned it in London. | [SOURCE] **CHANGED** | 44 |
| 5 | G | English Heritage says the king wanted peace and order while he was away fighting the Scots. | [SOURCE], one source, named **NEW** | 91 |
| 6 | W (boy) | ...One more game? | [OWN] | 17 |
| 7 | G | They kept playing. | [SOURCE] | 18 |
| 8 | G | In 1363, King Edward the Third tried again. | [SOURCE] | 43 |
| 9 | G | On holidays, men were to practise with bows and arrows, not football or cock-fighting. | [SOURCE] **CHANGED** | 86 |
| 10 | G | The king needed archers for his wars, and football got in the way. | [SOURCE] | 66 |
| 11 | D (footballer, now an archer) | ...Just one kick. | [OWN] | 17 |
| 12 | G | Play anyway, and you could end up in prison. | [SOURCE] **CHANGED** | 44 |
| 13 | G | And they kept on banning it. | [SOURCE] **CHANGED** | 28 |
| 14 | G | And the ball? Still rolling. | [OWN] | 28 |

Cut from v1: "Medieval football had hardly any rules. Whole crowds chased one ball through the streets, sometimes for hours." (its
only sources were Britannica and the English Heritage football article, neither of which opened) and "Too much disorder."
(English Heritage only, now folded into the named line 5).

### Verification
EHQ = English Heritage, "Medieval Law quiz". RIL09 = Riley, *Memorials*, 1409 entry and its footnote 2 (British History
Online). LBG = R. R. Sharpe (ed.), *Calendar of Letter-Books of the City of London: G* (1905). NOO = John Noorthouck, *A New
History of London* (1773), which prints the 1363 writ. RA = Royal Armouries, "The Hundred Years' War 1337-1453". All read
today. (RIL09, LBG and NOO are all hosted by British History Online but are three separate works from 1868, 1905 and 1773.)

| Line | Claim | Status | Quotes |
|---|---|---|---|
| 1 | England banned football | VERIFIED (EHQ, RIL09, NOO, RA) | EHQ: "In what year was football first banned in London? Answer: (As far as we know) 1314, following a proclamation of Edward II". RIL09: "Proclamation had been made against playing at football in the fields near the City so early as the times of Nicholas de Farndone, Mayor, in 1314". RA: "in 1363, Edward III ordered that all able bodied men should own and practise with the bow on Sundays and other holidays rather than play football." |
| 2, 7, 13 | It didn't work: they kept playing, and the bans kept coming | VERIFIED (EHQ, RIL09, NOO) | Bans in 1314 (EHQ, RIL09), 1363 (LBG, NOO, RA), 1388 (EHQ: "Following legislation in 1388, what was the punishment for playing football rather than practicing archery?") and 1409 (RIL09: "no person shall levy money, or cause it to be levied, for the games called 'foteballe' and 'cokthresshyng'"). NOO: "the citizens neglecting archery for unprofitable sports". EHQ: "In the fourteenth and fifteenth centuries, it was feared that football was getting in the way of what activity? Answer: Archery practice." |
| 4 | 1314: a proclamation banned it in London | **CHANGED** ("London banned it" became "a proclamation banned it in London") | EHQ (above: "following a proclamation of Edward II"). RIL09 (above: "Proclamation had been made ... in 1314"). |
| 5 | The reason: peace while the king fought the Scots | ONE SOURCE, NAMED (EHQ) | EHQ: "1314, following a proclamation of Edward II, who wanted to maintain peace and good order while he was away fighting the Scots." |
| 8, 9 | 1363: archery on holidays, not football or cock-fighting | VERIFIED (LBG, NOO, RA); **CHANGED** (cock-fighting added) | LBG: "Writ to the Sheriffs to make proclamation encouraging the practice of archery by way of a pastime in place of football, cock-fighting, &c. Witness the King at Westminster, 1 June, 37 Edward III. [A.D. 1363]." NOO: "that every one of the said city, strong in body, at leisure times on holidays, use in their recreations bows and arrows ... forbidding ... hand-ball, foot-ball, bandy-ball, cambuck, or cock-fighting". RA: as line 1. |
| 10 | The king needed archers; football got in the way | VERIFIED (RA, EHQ, NOO) | RA: "Mass archery helped the English to victory at the Battles of Crécy (1346) and Poitiers (1356). After these victories, in 1363, Edward III ordered ...". EHQ: as lines 2, 7, 13 ("Archery practice."). NOO: "The English archers were famous all over Europe; but the citizens neglecting archery for unprofitable sports, the king wrote to the sheriffs". |
| 12 | Playing could mean prison | **CHANGED** (v1 "on pain of prison" tied to 1363 only); VERIFIED (NOO, EHQ, RIL09) | NOO (1363 writ): "under pain of imprisonment." EHQ (1388): "Answer: Six days imprisonment." RIL09 (1409): "on pain of imprisonment, and of making fine at the discretion of the Mayor and Aldermen." |

**Picture note:** the crowd chasing the ball in the street (shots 2-3) is dramatisation; since the description line was cut,
no read source now describes how the game looked. Riley's footnote puts the 1314 game "in the fields near the City",
so shot 4 moves the game outside the city wall.

### Shot list
| # | Time (s) | What visibly happens | In frame | Set | Props |
|---|---|---|---|---|---|
| 1 | 0.0-1.3 | **Frame 1.** The herald unrolls a proclamation; a muddy ball punches through it; his startled face appears through the hole. Hook text. | herald | street | scroll, ball |
| 2 | 1.3-2.6 | Reverse, wide: a group of small players thunders past after the ball and spins the herald round. | herald, small figures | street | ball |
| 3 | 2.6-4.1 | The footballer runs at the lens, arms out at his sides: "Mine! Mine!" | footballer | street | — |
| 4 | 4.1-7.2 | The herald hammers a notice reading 1314 to the city gate; beyond the wall, small figures chase a ball across the fields. | herald, small figures | street (city gate) | notice, hammer |
| 5 | 7.2-10.2 | Wide: a column of small soldiers marches out of the gate under banners, heading north. | small figures | street (gate) | banners |
| 6 | 10.2-12.9 | Map, once, 2 s: an arrow moves from LONDON up to SCOTLAND on a painted map; the herald's finger taps London. | hand | stone hall (table top) | map |
| 7 | 12.9-14.4 | Two-shot: the boy, holding the ball, looks at the herald's back, then at the footballer: "...One more game?" | boy, footballer | street | ball |
| 8 | 14.4-15.7 | The herald walks off; the boy drops the ball and kicks it; the game erupts again. | boy, herald | street | ball |
| 9 | 15.7-18.9 | Hands only: a ringed royal hand presses the great seal into wax on a writ dated 1363. | hand | stone hall (table top) | writ, seal |
| 10 | 18.9-21.5 | The green: the footballer holds a longbow awkwardly and nocks an arrow, squinting. | footballer | open field (archery green) | bow, arrow, target |
| 11 | 21.5-24.4 | The herald shoos two puffed-up cockerels off the green (no fighting); behind him small figures shoot at the butts. | herald, small figures | open field | cockerels, butts |
| 12 | 24.4-27.0 | Wide battle tableau: a line of small archers looses a volley; arrows arc across the sky. | small figures | open field (battlefield) | arrows |
| 13 | 27.0-29.2 | The footballer draws and looses; the arrow thuds near the centre; he looks pleased. | footballer | open field | bow, target |
| 14 | 29.2-30.7 | The ball rolls up and stops against his foot; he looks down, then left, then right: "...Just one kick." | footballer | open field | ball |
| 15 | 30.7-32.5 | He kicks; the ball arcs over the butts; the herald spins round and points. | footballer, herald | open field | ball |
| 16 | 32.5-34.2 | The footballer behind the barred window of a small lock-up, holding the ball, sulking. | footballer | open field (lock-up) | bars, ball |
| 17 | 34.2-36.5 | On a door, new notices are nailed over each other, 1388, then 1409; the ball punches through each. | none | street (door) | notices, ball |
| 18 | 36.5-38.8 | The ball bounces down the street towards the herald unrolling his scroll. Cuts to frame 1. | herald | street | ball, scroll |

### Characters and new motions
The herald (no line; tall, lean, clean-shaven, long nose, red-and-gold tabard, floppy feathered hat); the footballer and
archer, Daniel (broad, short black curly hair, big black beard, muddy green tunic); the boy, Will (small, round face,
brown hood, oversized tunic, barefoot). Royal hand only. New motions: kick a ball, draw and loose a longbow, spin round,
hammer a notice, run at the lens arms out, sneaky look left and right, shoo (arms flapping low). Cockerels: two simple
animal figures (new).

### Pre-count
George 487 x 3 = 1 461; Daniel 28 x 3 = 84; Will 17 x 3 = 51. **Sum 1 596.**

### Sources (read 26 Nov)
- **[EHQ]** English Heritage, "Medieval Law quiz": https://www.english-heritage.org.uk/members-area/members-magazine/quizzes/medieval-law/
- **[RIL09]** Riley, *Memorials*, 1409: https://www.british-history.ac.uk/no-series/memorials-london-life/pp570-576
- **[LBG]** Letter-Book G calendar: https://www.british-history.ac.uk/london-letter-books/volg/pp154-165
- **[NOO]** Noorthouck, *A New History of London*: https://www.british-history.ac.uk/no-series/new-history-london/pp57-74
- **[RA]** Royal Armouries: https://royalarmouries.org/objects-and-stories/stories/the-hundred-years-war-1337-1453
- Not opened: English Heritage "The history of football in England" (text on english-heritage.shorthandstories.com, not
  allowed); Britannica "Football" and "Folk football" (Cloudflare 403). Nothing rests on them now.

---

## 6. 1904 Olympic Marathon: The First Finisher Came by Car

- **Title:** 1904 Olympic Marathon: The First Finisher Came by Car (53 characters)
- **Hook:** "The first finisher came by car." On screen: THE FIRST FINISHER CAME BY CAR.
- **Set:** open field as a dusty road, orchard, mile posts, finish with tape and grandstand (no Olympic rings).

### Narration
| # | Voice | Line | Mark | Chars |
|---|---|---|---|---|
| 1 | G | The first finisher came by car. | [SOURCE] | 31 |
| 2 | G | The 1904 Olympic marathon. | [SOURCE] | 26 |
| 3 | G | After nine miles, Fred Lorz got a lift in a car. | [SOURCE] | 48 |
| 4 | D (driver) | Going my way? | [OWN] | 13 |
| 5 | G | Ten miles later, the car broke down. He ran the rest, and crossed the line first. | [SOURCE] **CHANGED** | 81 |
| 6 | G | Then the truth came out. Disqualified. | [SOURCE] **CHANGED** | 38 |
| 7 | G | Thomas Hicks was fading. His trainers gave him strychnine, a poison, in egg whites. | [SOURCE] **CHANGED** | 83 |
| 8 | G | Back then, it was used as a medicine. | [SOURCE] **CHANGED** | 37 |
| 9 | G | Then another dose, with brandy. | [SOURCE] | 31 |
| 10 | G | Cuba's Felix Carvajal stopped to eat apples. Stomach cramps. | [SOURCE] **CHANGED** | 60 |
| 11 | W (boy spectator) | Mister, you're in a race! | [OWN] | 25 |
| 12 | G | Dogs chased another runner nearly a mile off course. | [SOURCE] **NEW** | 52 |
| 13 | G | Hicks crossed the line barely able to stand. He won. | [SOURCE] **CHANGED** | 52 |
| 14 | G | Lorz? Banned for life. Briefly. Next year, he won the Boston Marathon. | [SOURCE] | 70 |
| 15 | G | Hopefully on foot. | [OWN] | 18 |

Cut from v1: "Lorz said it was a joke." (History.com only, of the pages read), "So he took a nap." (Popular Science only), "He
still came fourth." (Olympedia only).

### Verification
OLY = Olympedia, 1904 marathon results; OLYL = Olympedia, Fred Lorz (same publisher). PS = Popular Science. HCM =
History.com, "The Olympic Marathon's Outlandish Early History"; HC8 = History.com, "8 Unusual Facts About the 1904 St.
Louis Olympics"; HCC = History.com, "Shortcuts to Gold: 9 Cheaters in Olympic History" (one publisher). All read today.
Smithsonian, Olympics.com and Britannica could not be opened, so no claim rests on them.

| Line | Claim | Status | Quotes |
|---|---|---|---|
| 1, 2 | The first man over the line had ridden in a car | VERIFIED (OLY, PS, HCM) | OLY: "Lorz entered the stadium first and received the crowd's plaudits, as they were oblivious to his scheme." / "refreshed after having ridden in an automobile most of the race." PS: "Technically Lorz crossed the finish line first". HCM: "Fred Lorz was the first runner to cross the finish line. Little did the crowd know, however, that Lorz had ridden 10 miles of the marathon course in an automobile". |
| 3 | After nine miles he took a car | VERIFIED (OLY, PS, HC8) | OLY: "Fred Lorz had the early lead but dropped out at nine miles." PS: "gave up at mile nine and took a car back to the stadium." HC8: "until the race's nine-mile mark when he developed severe cramps and had to drop out from exhaustion. He hitched a car ride back to the stadium". |
| 5 | Ten miles later the car broke down; he ran the rest and finished first | **CHANGED** (v1 "Eleven miles later, he hopped out") | PS: "When it broke down at the 19th mile, he jogged the rest of the way." HC8: "after 10 miles, the vehicle suddenly broke down." HCM: "When his car broke down, a rejuvenated Lorz ran the final 5 miles." The 11-mile figure was Smithsonian's (unread); every page read gives 10. |
| 6 | Found out and disqualified | VERIFIED (OLY, PS, HCM); joke claim **CUT** | OLY: "Lorz was soon found out". PS: "organizers stripped him of the gold medal when they discovered his vehicular ruse." HCM: "The hoax, however, was quickly exposed, and Lorz was disqualified." The joke claim is in HC8 only ("Lorz claimed it was all an elaborate joke"); HCC says instead "Lorz readily admitted to his automotive assistance". |
| 7 | Hicks fading; strychnine in egg whites; a poison | **CHANGED** ("a rat poison" became "a poison") | OLY: "Hicks began to flag badly. His handlers helped him, administering strychnine sulfate in an egg white". PS: "his trainers gave him approximately a milligram of strychnine sulphate and an egg white." HCM: "Seeing Hicks flagging, the runner's assistants administered him ... a dose of strychnine, sulfate in egg whites". Poison: PS "A few grains (50 to 100 milligrams) of the substance is enough to kill an adult within 30 minutes."; HC8 "doses of toxic strychnine". "Rat poison" is in PS only ("perhaps best known as rat poison today"). |
| 8 | Back then it was used as a medicine | **CHANGED** (v1 "that was allowed") | PS: "At the time, the substance was popularly marketed as "a tonic for fatigue, a digestive aid, a respiratory stimulant, and a treatment for paralysis and rheumatism,"". OLY: "The early sports medicine seemed to work". "Allowed" is in HCM only ("Potentially lethal, but perfectly within the rules at the time"). |
| 9 | A second dose, with brandy | VERIFIED (OLY, PS, HCM) | OLY: "he was given the same potions, along with sips of brandy." PS: "they gave him a second dose, along with two more egg whites and a slug of brandy." HCM: "and a swig of brandy." |
| 10 | Carvajal of Cuba ate apples and got stomach cramps | **CHANGED** (nap cut) | OLY: "a 5-foot tall Cuban named Félix Carvajal"; "Carvajal would stop to eat some green apples, which caused stomach cramps". HCM: "stomach cramps did in Cuban runner Felix Carvajal after he snacked on green apples picked from an orchard along the course." HC8: "Cuban runner Felix Carbajal stopped along the course to snack on some apples only to be bowled over by stomach cramps". The nap is in PS only ("stopped in an apple orchard midway through the course for a snack and a nap"). His fourth place is in OLY only. |
| 12 | Dogs chased a runner nearly a mile off course | **NEW**, VERIFIED (PS, HCM) | PS: "Aggressive dogs chased South Africa's Len Taunyane, one of the first Black athletes to ever compete in the games, almost a mile off course." HCM: "Wild dogs chased him nearly a mile off the course." HC8: "chased off the course by a pack of wild dogs." |
| 13 | Hicks barely standing at the line; he won | **CHANGED** ("half-carried" became "barely able to stand") | OLY: "Hicks came shortly after, almost dead on his feet. He had finished the race by slow jogging interspersed with periods of walking." PS: "who was so weak by the time he reached the finish line, he had to be held up by two men just to cross it." HC8: "His assistants practically carried him over the finish line". Won: OLY (Gold); PS ("awarded it instead to the second-place finisher, American Thomas Hicks"). The carrying is disputed, so the line and picture keep to "barely standing". |
| 14 | Banned for life, soon lifted; won Boston next year | VERIFIED (OLY, HC8) | OLY: "Lorz was soon found out and was banned from amateur competition for life, only to see it rescinded in time for him to win the 1905 Boston Marathon." OLYL: "this ban was quickly commuted and Lorz competed in the 1905 Boston Marathon, and won the race." HC8: "promptly slapped him with a lifetime ban. Lorz would later have the punishment rescinded ... He went on to win the 1905 Boston Marathon." |

**Picture fixes from the pages:** frame 1 is now Lorz waving from the car (the car broke down before the stadium, so he
did not arrive by car at the line); the costume is sourced (OLY: "heavy street shoes, long trousers, a beret, and a
long-sleeved shirt"); the rat gag, the blank "rules" card and the nap are gone.

### Shot list
| # | Time (s) | What visibly happens | In frame | Set | Props |
|---|---|---|---|---|---|
| 1 | 0.0-2.3 | **Frame 1.** Lorz lounges in the back seat of an open 1904 car, waving, as it overtakes sweating runners in the dust. Hook text. | Lorz | open field (road) | car, dust |
| 2 | 2.3-3.9 | Wide: under the ST. LOUIS 1904 MARATHON banner a starter's pistol puffs; small runners set off; a blazing sun. | small figures | open field | banner, pistol |
| 3 | 3.9-6.0 | Lorz running, clutches his side and slows to a hobble. | Lorz | open field | — |
| 4 | 6.0-8.0 | Two-shot: the car draws alongside; the goggled driver leans out; Lorz eyes the car, then the road. | Lorz, driver | open field | car |
| 5 | 8.0-9.5 | Close: the driver grins: "Going my way?" | driver | open field | car |
| 6 | 9.5-11.5 | Mile posts whip past, 10, 14, 19; Lorz has his feet up. | Lorz | open field | mile posts, car |
| 7 | 11.5-13.2 | The car coughs smoke and stops; driver and Lorz look at each other; Lorz hops out and runs. | Lorz, driver | open field | car, smoke |
| 8 | 13.2-15.6 | The finish: Lorz breaks the tape, fists pumping at chest height; small spectators cheer. | Lorz | open field (finish) | tape, grandstand |
| 9 | 15.6-17.0 | The boy spectator points from Lorz to the dusty car being towed past the gate. | boy, Lorz | open field (finish) | car |
| 10 | 17.0-18.2 | A hand from off screen lifts the laurel wreath off Lorz's head; his grin collapses. | Lorz | open field (finish) | wreath |
| 11 | 18.2-20.2 | The road: Hicks staggers, sweat pouring; the trainer jogs beside him with a sponge. | Hicks, trainer | open field | sponge |
| 12 | 20.2-22.0 | Hands only: the trainer cracks an egg into a cup and tips in a pinch from a bottle labelled STRYCHNINE. | hands | open field | egg, cup, bottle |
| 13 | 22.0-23.6 | Hicks gulps it; his eyes go wide; he lurches forward faster (speed lines). | Hicks, trainer | open field | cup |
| 14 | 23.6-26.7 | The trainer holds the bottle up like a doctor, measures one drop onto a spoon and nods gravely. | trainer | open field | bottle, spoon |
| 15 | 26.7-28.8 | Close: brandy splashes into the cup; Hicks drinks and wobbles. | Hicks, trainer | open field | brandy, cup |
| 16 | 28.8-30.5 | Orchard: Carvajal (beret, long-sleeved shirt, cut-off trousers, street shoes) picks an apple at shoulder height and bites. | Carvajal | open field (orchard) | apple tree |
| 17 | 30.5-32.3 | His face turns green; he clutches his stomach and sinks onto his heels under the tree. | Carvajal | open field | apple |
| 18 | 32.3-34.6 | Two-shot: the boy in a straw boater shouts: "Mister, you're in a race!" Carvajal looks up, miserable. | boy, Carvajal | open field | boater |
| 19 | 34.6-37.9 | Wide: across a field, small dogs chase a small runner far from the road, past a lone mile post. | small figures, dogs | open field | mile post |
| 20 | 37.9-40.2 | The finish: Hicks wobbles over the line, trainers hovering on both sides with hands out, ready to catch. | Hicks, trainer | open field (finish) | tape |
| 21 | 40.2-41.8 | A laurel wreath settles on Hicks' head from off screen; a dazed half-smile. | Hicks | open field (finish) | wreath |
| 22 | 41.8-44.4 | Lorz on a bench reads a newspaper: LORZ BANNED FOR LIFE; he flips it over to a later paper: LORZ WINS BOSTON MARATHON, 1905; he pumps a fist. | Lorz | open field (bench) | newspapers |
| 23 | 44.4-47.1 | A BOSTON 1905 banner: Lorz breaks the tape on foot. | Lorz | open field (finish) | banner, tape |
| 24 | 47.1-48.4 | A car horn honks; Lorz glances back at a passing car and raises an eyebrow. Cuts to frame 1. | Lorz | open field | car |

### Characters and new motions
Unchanged: Lorz (tall, thin, curly dark hair, numbered white vest); the driver, Daniel (stocky, full brown beard,
leather driving helmet, goggles, tan duster); Hicks (short, wiry, receding hair, pale, grey vest); the trainer (no line;
big, bald, bow tie, waistcoat); Carvajal (short, slim, black hair, beret, long-sleeved shirt, cut-off trousers, street
shoes); the boy spectator, Will (straw boater, braces, freckles); small dogs (wide shot only). New motions: hop out of a
car, sit in a car and wave, clutch the side and hobble, stagger and wobble, pick an apple and bite, sink onto the heels
clutching the stomach, fist pump at chest height, gulp and lurch, measure a drop (hands), dog run cycle. (Lie down and
sleep is no longer needed.)

### Pre-count
George 627 x 3 = 1 881; Daniel 13 x 3 = 39; Will 25 x 3 = 75. **Sum 1 995.**

### Sources (read 26 Nov)
- **[OLY]** https://www.olympedia.org/results/56131 ; **[OLYL]** https://www.olympedia.org/athletes/78716
- **[PS]** https://www.popsci.com/health/olympic-runner-rat-poison-thomas-hicks/
- **[HCM]** https://www.history.com/articles/the-olympic-marathons-outlandish-early-history
- **[HC8]** https://www.history.com/articles/8-unusual-facts-about-the-1904-st-louis-olympics
- **[HCC]** https://www.history.com/news/shortcuts-to-the-gold-9-cheaters-in-olympic-history
- Not opened: Smithsonian (Cloudflare 403), Olympics.com (connection reset), Britannica "Felix Carvajal" (Cloudflare 403).

---

## Every claim that changed or was cut in v2

| Short | v1 | v2 | Why |
|---|---|---|---|
| 1 | "Next morning, a navy warship came round the cape." | "Next morning, a navy warship found them." | "Round the cape" is Johnson only. |
| 1 | "Lights out at eight. Maybe he had a point." | "Lights out at eight. Remember?" | Safer ending after Roberts' death (decided). |
| 2 | "...among them a member of the colony's council." | "He took hostages, and held them for ransom." | The councilman is SCE only. |
| 2 | "But the chest took days to arrive." + "[OWN] Any day now..." | cut | In no page read. |
| 2 | "At last, it came aboard." | merged into "The town gave in, and sent the medicine." | Shorter; the same two sources. |
| 2 | "Blackbeard let the hostages go, unhurt, but without most of their clothes." | "Then he let the hostages go." | Clothes: QAR blog only; "unhurt": no page read; SCE does not say it (the v1 summary was wrong). |
| 2 | "All that, for one chest of medicine." | new "He had also plundered the ships for supplies and valuables." + "But the ransom? One chest of medicine." | True to the sources (plunder of "supplies and specie"). "Gold and silver" stays out: Johnson unread. |
| 3 | "...bent the bars of a kitchen window." | "...got through the bars of a kitchen window." | The Chronicle says they sawed through. |
| 4 | "Those caught with dough ... stood in the pillory" | "The men caught with dough ... stood in the pillory" | The two women were sent back to Newgate, not pilloried; the woman is out of the pillory shot. |
| 5 | "Medieval football had hardly any rules. Whole crowds chased one ball through the streets, sometimes for hours." | cut | Only Britannica and the English Heritage article said it; neither opened. |
| 5 | "In 1314, London banned it. Too much disorder." | "In 1314, a proclamation banned it in London." + named line "English Heritage says the king wanted peace and order while he was away fighting the Scots." | The reason is English Heritage only, so it is the named one-source line. |
| 5 | "...practise with bows and arrows. Football was forbidden, on pain of prison." | "...practise with bows and arrows, not football or cock-fighting." + "Play anyway, and you could end up in prison." | Prison verified in the 1363 writ (Noorthouck); the general line is backed by 1363, 1388 and 1409. |
| 5 | "Kings kept banning it, for centuries." | "And they kept on banning it." | Read sources cover 1314-1409 only, and not all bans were royal. |
| 6 | "Eleven miles later, he hopped out, ran on, and crossed the line first." | "Ten miles later, the car broke down. He ran the rest, and crossed the line first." | All pages read say 10 miles and a breakdown. |
| 6 | "Then the truth came out. Lorz said it was a joke. Disqualified." | "Then the truth came out. Disqualified." | The joke claim: one read source (History.com), and another History.com article says he admitted it. |
| 6 | "...strychnine, a rat poison, in egg whites." | "...strychnine, a poison, in egg whites." | "Rat poison": Popular Science only. |
| 6 | "Back then, that was allowed." | "Back then, it was used as a medicine." | "Within the rules": History.com only. |
| 6 | "...stopped to eat apples. Cramps. So he took a nap." | "...stopped to eat apples. Stomach cramps." | The nap: Popular Science only. |
| 6 | "He still came fourth." | cut | Olympedia only. |
| 6 | "His trainers half-carried him over the line. He won." | "Hicks crossed the line barely able to stand. He won." | Sources disagree on the carrying. |
| 6 | (none) | "Dogs chased another runner nearly a mile off course." | Now in two read sources. |

## Updated pre-count

| Short | George | George as Sir | Daniel | Will | Characters | x 3 |
|---|---|---|---|---|---|---|
| 1 | 554 | — | 38 | 17 | 609 | 1 827 |
| 2 | 517 | — | 12 | 33 | 562 | 1 686 |
| 3 | 609 | — | 7 | 29 | 645 | 1 935 |
| 4 | 544 | 75 | 14 | 12 | 645 | 1 935 |
| 5 | 487 | — | 28 | 17 | 532 | 1 596 |
| 6 | 627 | — | 13 | 25 | 665 | 1 995 |
| **Total** | **3 338** | **75** | **112** | **133** | **3 658** | **10 974** |

By voice x 3: George (narrator and Sir) 3 413 x 3 = 10 239; Daniel 112 x 3 = 336; Will 133 x 3 = 399.

## Still open
1. Johnson (Short 1's second publisher) to be re-opened when Gutenberg is back up; until then it rests on the 17 November
   reading.
2. Britannica, Smithsonian and Olympics.com refuse automated requests from this session; a person with a browser could
   check them, but no line depends on them now.
3. The English Heritage football article needs english-heritage.shorthandstories.com allowed if the cut description line
   is wanted back.

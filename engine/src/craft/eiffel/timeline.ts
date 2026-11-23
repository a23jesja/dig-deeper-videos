// The Eiffel Tower film's timeline: where each shot starts (s) and where each line of the narration starts (its speech onset), the opening's
// text. Shared by the picture (EiffelFilm.tsx) and the sound (audio/eiffel_audio.py through scripts/eiffel_info.mjs). The lines' times are set
// on the recorded takes' lengths (voice/eiffel/spans.json), at least 0.25 s between two voices, each line in the shot that shows it.
export const CUTS: [string, number][] = [["e01", 0], ["e02", 1.6], ["e03", 3.2], ["e04", 4.7], ["e05", 6.2], ["e06", 7.7], ["e07", 9.7], ["e08", 11.2], ["e09", 12.7],
  ["e10", 14.2], ["e11", 15.7], ["e12", 17.3], ["e13", 19.2], ["e14", 21.0], ["e15", 23.6], ["e16", 25.8], ["e17", 28.2], ["e18", 30.2], ["e19", 31.9]];
export const FILM_S = 32.63;
/** the lines: the take (voice/eiffel/<id>) and its speech onset in the film (s) */
export const LINES: [string, number][] = [["g01", 0.0], ["g02", 1.7], ["g03", 3.3], ["g04", 6.3], ["g05", 7.8], ["g06", 9.85], ["d01", 12.85], ["g07", 14.3], ["g08", 15.8],
  ["g09", 17.4], ["g10", 19.3], ["g11", 21.1], ["g12", 23.7], ["g13", 25.9], ["g14", 28.3], ["g15b", 30.3], ["g16", 31.95]];
/** the opening's text: the voice's own words, two lines, on screen 0-3.0 s at full strength (1.5 s a line), fading out 3.0-3.2 s; and fading
 *  in over the film's last loopIn s, so the last frame meets the first (the loop) */
export const TEXT: { t0: number; t1: number; fade: number; lines: string[]; loopIn: number } = { t0: 0, t1: 3.0, fade: 0.2, lines: ["HE SOLD THE", "EIFFEL TOWER"], loopIn: 0.45 };

/** the hook lab's three openings (STOPP v4c): (d) is the film; (b) and (c) are 5 s clips with their own first lines, picture and hit, the rest
 *  as (d) from shot 3. A cut is [shot, start in the clip, start inside the shot] */
export type Cut = [string, number] | [string, number, number];
export const OPENINGS: Record<string, { cuts: Cut[]; lines: [string, number][]; text: string[] }> = {
  D: { cuts: CUTS, lines: LINES, text: ["HE SOLD THE", "EIFFEL TOWER"] },
  // (b) the dealer's hand pushing the cheque in frame 1 (shot 11's set-up, its paper slap the hit), "Somebody bought the Eiffel Tower." /
  //     "The seller didn't own it." over the con man (shot 2); the newspaper from 3.73 s
  B: { cuts: [["e11", 0, 0], ["e02", 1.87, 0], ["e03", 3.73, 0]], lines: [["g17", 0.0], ["g18", 1.97], ["g03", 3.83]], text: ["SOMEBODY BOUGHT THE", "EIFFEL TOWER"] },
  // (c) the con man in the foreground, his smug nod already under way and the slow push-in (shot 2's set-up), "This man sold the Eiffel Tower."
  //     and a short high wood knock in frame 1; at 2.17 s the stamp's close-up with its contact for "It was never his."; the newspaper from 3.73 s
  C: { cuts: [["e02", 0, 0], ["e01", 2.17, 0], ["e03", 3.73, 0]], lines: [["g19", 0.0], ["g02", 2.27], ["g03", 3.83]], text: ["THIS MAN SOLD THE", "EIFFEL TOWER"] },
};

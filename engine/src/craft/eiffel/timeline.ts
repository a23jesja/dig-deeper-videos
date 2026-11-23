// The Eiffel Tower film's timeline: where each shot starts (s) and where each line of the narration starts (its speech onset), the opening's
// text. Shared by the picture (EiffelFilm.tsx) and the sound (audio/eiffel_audio.py through scripts/eiffel_info.mjs). The lines' times are set
// on the recorded takes' lengths (voice/eiffel/spans.json), at least 0.25 s between two voices, each line in the shot that shows it.
// The film opens with (c) (the review's recommendation, approved by the automation session if at least as clear as (d) at phone size): the con
// man's smug nod already under way in frame 1, "This man sold the Eiffel Tower."; at 2.17 s the stamp's contact for "It was never his.".
// It ends on the same set-up just before frame 1 (shot 2 played from -0.73 s), so the loop meets it.
/** a cut: [shot, start in the film, start inside the shot] */
export type Cut = [string, number] | [string, number, number];
export const CUTS: Cut[] = [["e02", 0], ["e01", 2.17], ["e03", 3.67], ["e04", 5.23], ["e05", 6.68], ["e06", 8.23], ["e07", 10.23], ["e08", 11.73], ["e09", 13.23],
  ["e10", 14.73], ["e11", 16.23], ["e12", 17.83], ["e13", 19.73], ["e14", 21.53], ["e15", 24.13], ["e16", 26.33], ["e17", 28.73], ["e18", 30.73], ["e02", 32.43, -0.73]];
export const FILM_S = 33.16;
/** the lines: the take (voice/eiffel/<id>) and its speech onset in the film (s) */
export const LINES: [string, number][] = [["g19", 0.0], ["g02", 2.27], ["g03", 3.83], ["g04", 6.83], ["g05", 8.33], ["g06", 10.38], ["d01", 13.38], ["g07", 14.83], ["g08", 16.33],
  ["g09", 17.93], ["g10", 19.83], ["g11", 21.63], ["g12", 24.23], ["g13", 26.43], ["g14", 28.83], ["g15b", 30.83], ["g16", 32.48]];
/** the opening's text: the voice's own words, two lines, on screen 0-3.0 s at full strength (1.5 s a line), fading out 3.0-3.2 s; and fading
 *  in over the film's last loopIn s, so the last frame meets the first (the loop) */
export const TEXT: { t0: number; t1: number; fade: number; lines: string[]; loopIn: number } = { t0: 0, t1: 3.0, fade: 0.2, lines: ["THIS MAN SOLD THE", "EIFFEL TOWER"], loopIn: 0.45 };
/** the hook lab's other two openings as 5 s clips: (d) the stamp's contact in frame 1; (b) the dealer holding up the cheque in frame 1 */
export const OPENINGS: Record<string, { cuts: Cut[]; lines: [string, number][]; text: string[] }> = {
  C: { cuts: CUTS, lines: LINES, text: TEXT.lines },
  D: { cuts: [["e01", 0, 0], ["e02", 1.6, 0], ["e03", 3.2, 0]], lines: [["g01", 0.0], ["g02", 1.7], ["g03", 3.3]], text: ["HE SOLD THE", "EIFFEL TOWER"] },
  B: { cuts: [["e11", 0, 0], ["e02", 1.87, 0], ["e03", 3.73, 0]], lines: [["g17", 0.0], ["g18", 1.97], ["g03", 3.83]], text: ["SOMEBODY BOUGHT THE", "EIFFEL TOWER"] },
};

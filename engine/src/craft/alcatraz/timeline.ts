// The film's timeline: where each shot starts (s), the openings of the hook lab, the opening's text. Shared by the picture (AlcatrazFilm.tsx)
// and the sound (audio/alcatraz_audio.py reads it through scripts/alcatraz_info.mjs), so the two cannot drift apart.
/** where each shot starts in the film (s): set by the narration (voice/alcatraz/spans.json and the gaps in audio/alcatraz_audio.py) */
export const CUTS: [string, number][] = [["a01", 0], ["a02", 1.8], ["a03", 3.4], ["a04", 5.8], ["a05", 8.3], ["a06", 12.0], ["a07", 14.2], ["a08", 15.4], ["a09", 16.8],
  ["a10", 18.4], ["a11", 19.9], ["a13", 22.7], ["a14", 23.9], ["a15", 25.4], ["a16", 27.4], ["a17", 29.5]];
export const FILM_S = 32.0;
/** the openings of the hook lab: the first shots of each (the rest of the film as A) */
/** (a third number: the shot starts that far into itself) A: the torch's light already on the fake head in frame 1; B: the guard's eyes
 *  narrowing first, then the light on the head; C: the dark cell with the light sweeping in and hitting the head in the first 0.4 s */
export const OPENINGS: Record<string, ([string, number] | [string, number, number])[]> = {
  A: CUTS,
  B: [["a02", 0, 0.3], ["a01", 1.0], ["a03", 3.4], ...CUTS.slice(3)],
  C: [["a17", 0, 1.9], ["a01", 0.6], ["a02", 1.9], ...CUTS.slice(2)],
};
/** loopIn: the text fades in over the film's last loopIn s, so the last frame meets the first (which has the text) and the loop does not jump: without
 *  it 5.4 % of the picture changed at the loop, over the film's own 95th percentile (the flicker measure on 1g) */
export const TEXT: { t0: number; t1: number; lines: string[]; loopIn: number } = { t0: 0, t1: 3.2, lines: ["THE GUARD'S TORCH", "HIT THE PILLOW"], loopIn: 0.45 };

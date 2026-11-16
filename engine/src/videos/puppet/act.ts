// The five-second action shared by the puppet and today's drawing (150 frames at 30 fps, 1920 x 1080).
//  0-58   walks in from the left (two steps a second), front view
//  58-64  settles
//  66-100 right arm up: tips the cap (puppet) / waves (today's drawing has no cap tip)
//  98-140 talks; 112-140 lifts the cane a little
//  blinks at frames 38 and 104
export const FRAMES = 150, FPS = 30, W = 1920, H = 1080;
const cl = (x: number) => Math.max(0, Math.min(1, x));
const sm = (x: number) => { const t = cl(x); return t * t * (3 - 2 * t); };
export const act = (f: number) => {
  const walk = 1 - sm((f - 50) / 10);                        // 1 while walking, 0 when standing
  const x = -260 + (1220 + 260) * sm(f / 58);                // feet centre, px from the left edge
  const phase = (f / 15) % 1;                                // gait cycle
  const arm = sm((f - 66) / 10) * (1 - sm((f - 92) / 10));   // right arm raised 0..1
  const tip = sm((f - 74) / 6) * (1 - sm((f - 88) / 6));     // cap lifted 0..1
  const talkOn = f >= 98 && f <= 140;
  const talk = talkOn ? 0.15 + 0.85 * Math.abs(Math.sin((f - 98) * 0.9) * Math.sin((f - 98) * 0.23 + 1)) : 0;
  const cane = sm((f - 112) / 10) * (1 - sm((f - 134) / 8)); // cane lifted 0..1
  const blink = cl(Math.max(1 - Math.abs(f - 38) / 3, 1 - Math.abs(f - 104) / 3));
  return { walk, x, phase, arm, tip, talk, cane, blink };
};

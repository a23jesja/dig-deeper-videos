// Every clip of the craft kit by name: its sound cues (scripts/cues.mjs -> audio/craft_sfx.py) and what stands where on each of
// its frames (scripts/craft_check.mjs -> checks.ts).
import { sirTestCues, sirTestFrames } from "./sirTest";
import type { Frame } from "./checks";
export { check } from "./checks";
export const CUES: Record<string, () => unknown> = { sirTest: sirTestCues };
export const FRAMES: Record<string, () => Frame[]> = { sirTest: sirTestFrames };

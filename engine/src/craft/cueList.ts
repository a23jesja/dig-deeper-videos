// Every clip that has sound cues, by name: scripts/cues.mjs writes one of them out as JSON for audio/craft_sfx.py.
import { sirTestCues } from "./sirTest";
export const CUES: Record<string, () => unknown> = { sirTest: sirTestCues };

// The design directions of step A, in the order they stand on the sheet.
import type { Direction } from "../SirDesigns";
import { MOLE } from "./mole";
import { WOODCUT } from "./woodcut";
import { PEAR } from "./pear";
import { PUPPET } from "./puppet";
import { LANKY } from "./lanky";
import { BIGHEAD } from "./bighead";

const shock = { wide: 1, lid: 0, brow: 1, mouth: 0.7 };
export const DIRECTIONS: Direction[] = [
  { D: MOLE, line: "Mullvad i tweed: grävtassar, lång nos, ett öga förstorat av monokeln.", action: "skid", ao: { handL: "open", handR: "open", face: shock } },
  { D: WOODCUT, line: "Människor i träsnitt: kantiga, skurna skuggor, dämpad färg på papper.", action: "point", ao: { handR: "point", handL: "fist", face: { brow: -0.7, lid: 0.1 } } },
  { D: PEAR, line: "Människa med egen kroppsform: päronskalle, klockformad kavaj, plus-fours över smala vader.", action: "throw", ao: { handL: "open", handR: "fist", face: { brow: -0.8, lid: 0.1, gaze: [0.7, -0.2] } } },
  { D: PUPPET, line: "Sprattelgubbe av kartong: lösa delar med mässingsnitar i lederna, käke som fälls ned.", action: "recoil", ao: { handL: "open", handR: "open", face: shock } },
  { D: LANKY, line: "Lång och smal för stående bild: litet huvud, pannkakskeps, mustasch bredare än axlarna.", action: "run", ao: { capLift: 0.35, handR: "fist", handL: "fist", face: { ...shock, mouth: 0.4 } }, so: { prop: "cane", handR: "grip" } },
  { D: BIGHEAD, line: "Viktoriansk karikatyr: stort ansikte som spelar, polisonger, liten prydlig kropp.", action: "stumble", ao: { capLift: 0.6, handL: "open", handR: "open", face: shock } },
];

// The cast of "The Man Who Stole the Mona Lisa". One face per number (i): the same number in another outfit is the
// same person in other clothes.
import { Outfit, INK } from "./toon";
import { Who } from "./castbase";

const W = (i: number, okey: string, o: Outfit): Who => ({ i, o, okey });
const P_FACE = { skin: "#f0c39a", moustache: "#2b2026" };
/** Vincenzo Peruggia: in his own jacket, in the white smock, and in uniform */
export const PER = W(61, "per", { jacket: "#6a5340", pants: "#3f3a36", boots: INK, hat: "cap", cap: "#4a4038", buttons: "#c9a94a", ...P_FACE });
export const PER_SMOCK = W(61, "perSmock", { jacket: "#f4f1ea", pants: "#3f3a36", boots: INK, hat: "cap", cap: "#4a4038", buttons: "#c9c4b6", ...P_FACE });
export const PER_SOLDIER = W(61, "perSoldier", { jacket: "#6f7a62", pants: "#66705a", boots: INK, hat: "peaked", cap: "#6f7a62", buttons: "#c9ccd2", sam: "#5e3d24", ...P_FACE });
export const PER_SUIT = W(61, "perSuit", { jacket: "#6a5340", pants: "#3f3a36", boots: INK, hat: "cap", cap: "#4a4038", buttons: "#c9a94a", tie: "#8a2f2f", ...P_FACE }); // Florence: his own brown jacket and cap, with a tie (a bowler and black coat made him look like the detective)
/** museum staff */
const GUARD_O: Outfit = { jacket: "#22304f", pants: "#22304f", boots: INK, hat: "peaked", cap: "#22304f", buttons: "#e2bb4c", moustache: "#5b3a22" };
export const GUARD1 = W(62, "guard1", GUARD_O), GUARD2 = W(63, "guard2", { ...GUARD_O, skin: "#f5c9a0", moustache: "#b9b9c0", build: "stout" });
export const PORTER = W(64, "porter", { ...GUARD_O, cap: "#3a3d48", jacket: "#3a3d48", pants: "#3a3d48", skin: "#ecd0b6" });
export const DIRECTOR = W(65, "director", { jacket: "#2e3142", pants: "#3a3d48", boots: INK, hat: "hair", hair: "#d0d0d6", bald: true, beard: "#d0d0d6", moustache: "#d0d0d6", build: "stout", buttons: "#c9a94a", tie: "#8a2f2f" });
const SMOCK_O: Outfit = { jacket: "#f4f1ea", pants: "#55504a", boots: INK, hat: "cap", cap: "#6a6f78", buttons: "#c9c4b6" };
export const WORK1 = W(66, "work1", SMOCK_O), WORK2 = W(67, "work2", { ...SMOCK_O, skin: "#f5c9a0", moustache: "#8a6a44", cap: "#5a4a3c" }), WORK3 = W(68, "work3", { ...SMOCK_O, skin: "#ecd0b6", cap: "#3f4a3a", build: "stout" });
export const PLUMBER = W(69, "plumber", { jacket: "#b0763a", pants: "#6a5a48", boots: "#4a3324", hat: "cap", cap: "#8a6a44", moustache: "#c9772e", build: "stout", buttons: "#5a4a3a", belt: "#4a3324", skin: "#ffe2c2" });
export const BEROUD = W(70, "beroud", { jacket: "#b9a682", pants: "#4a4038", boots: INK, hat: "beret", cap: "#3a3d48", moustache: "#5b3a22", buttons: "#8a7a5a" });
export const PHOTOG = W(71, "photog", { jacket: "#7a5a8a", pants: "#3a3540", boots: INK, hat: "hair", hair: "#c9772e", glasses: true, buttons: "#e9dfc8", tie: "#2b2026", skin: "#ffe2c2" });
/** the old masters and the crowned heads */
export const LEONARDO = W(72, "leonardo", { jacket: "#8a3f4a", pants: "#6a2f38", boots: "#4a3324", hat: "beret", cap: "#5a2f6a", hair: "#e6e6ec", beard: "#dcdce4", beardLong: 0.5, moustache: "#dcdce4", buttons: "#8a3f4a" });
export const KING = W(73, "king", { jacket: "#7a2f6a", pants: "#e9dfc8", boots: INK, hat: "crown", moustache: "#5b3a22", build: "stout", buttons: "#e2bb4c", sash: "#e2bb4c" });
export const NAPOLEON = W(74, "napoleon", { jacket: "#2f6a4a", pants: "#f4efe0", boots: INK, hat: "bicorne", build: "stout", buttons: "#e2bb4c", belt: "#f4efe0", skin: "#ffe2c2" });
/** the police */
const COP_O: Outfit = { jacket: "#22304f", pants: "#22304f", boots: INK, hat: "cap", cap: "#1c2740", buttons: "#c9ccd2", sash: "#f4efe0" };
export const COPS: Who[] = [W(75, "cop1", { ...COP_O, moustache: "#2b2026" }), W(76, "cop2", { ...COP_O, skin: "#f5c9a0" }), W(77, "cop3", { ...COP_O, skin: "#ecd0b6", moustache: "#8a6a44", build: "stout" })];
export const DETECTIVE = W(78, "detective", { jacket: "#5a5648", pants: "#3f3a36", boots: INK, hat: "bowler", cap: "#3a3530", moustache: "#5b3a22", buttons: "#8a7a5a" });
export const JUDGE = W(79, "judge", { jacket: "#8a2f2f", pants: "#8a2f2f", boots: INK, hat: "hair", hair: "#ececf0", build: "stout", buttons: "#f4efe0", sash: "#f4efe0", moustache: "#ececf0", skin: "#f3ddc6" });
const CARAB_O: Outfit = { jacket: "#1c2740", pants: "#1c2740", boots: INK, hat: "bicorne", cap: "#16171b", buttons: "#c9ccd2", sash: "#f4efe0", moustache: "#2b2026", cockade: ["#c8312b", "#f4efe0", "#3f8a4a"] };
export const CARAB1 = W(80, "carab1", CARAB_O), CARAB2 = W(81, "carab2", { ...CARAB_O, skin: "#f5c9a0", moustache: "#5b3a22" });
/** the wrong suspects */
export const PIERET = W(82, "pieret", { jacket: "#4f8a6a", pants: "#4a4038", boots: INK, hat: "hair", hair: "#d9b24a", buttons: "#e9dfc8", skin: "#ffe2c2", tie: "#c8312b" });
export const EDITOR = W(83, "editor", { jacket: "#3f4a3a", pants: "#33352e", boots: INK, hat: "hair", hair: "#8a8a90", bald: true, moustache: "#8a8a90", glasses: true, build: "stout", buttons: "#c9a94a", tie: "#2b2026" });
export const APOLLINAIRE = W(84, "apollinaire", { jacket: "#5a6a8a", pants: "#3a3540", boots: INK, hat: "hair", hair: "#7a4a2a", moustache: "#7a4a2a", build: "stout", buttons: "#e2bb4c", skin: "#ffe2c2", tie: "#c8312b" });
export const PICASSO = W(85, "picasso", { jacket: "#c8553a", pants: "#3f4a6a", boots: INK, hat: "hair", hair: "#1c1a1a", buttons: "#e9dfc8", skin: "#e2b488" });
export const KAFKA = W(86, "kafka", { jacket: "#2b2b30", pants: "#2b2b30", boots: INK, hat: "hair", hair: "#16161a", buttons: "#8a8f9c", skin: "#f3ddc6", tie: "#f4efe0" });
export const BROD = W(87, "brod", { jacket: "#8a8f9c", pants: "#55585f", boots: INK, hat: "tophat", glasses: true, buttons: "#2b2b30", skin: "#f3ddc6", tie: "#2a4f9a" });
/** Florence */
export const GERI = W(88, "geri", { jacket: "#b08a3a", pants: "#4a4038", boots: "#4a3324", hat: "hair", hair: "#6a4a2a", moustache: "#6a4a2a", glasses: true, build: "stout", buttons: "#e2bb4c", tie: "#3f6f4a", skin: "#f0c8a0" });
export const POGGI = W(89, "poggi", { jacket: "#4a3a5a", pants: "#2e2a36", boots: INK, hat: "hair", hair: "#8a8580", moustache: "#8a8580", build: "stout", buttons: "#c9a94a", skin: "#f5c9a0", tie: "#3f8a4a" });
/** the story that was never proved */
export const MARQUIS = W(90, "marquis", { jacket: "#3a2040", pants: "#2b2030", boots: INK, hat: "tophat", moustache: "#2b2026", buttons: "#e2bb4c", sash: "#c8312b" });
export const RICH: Who[] = [0, 1, 2, 3, 4, 5].map((k) => W(91 + k, "rich" + k, { jacket: ["#2e3142", "#3f4a3a", "#4a3a30", "#3a3540", "#2f3a44", "#4a4458"][k], pants: "#2e2a36", boots: INK, hat: "tophat", build: "stout", buttons: "#e2bb4c", moustache: k % 2 ? "#d0d0d6" : "#5b3a22", skin: ["#ffe2c2", "#f5c9a0", "#ecd0b6"][k % 3] }));
/** people in the street and in the galleries: men in top hats, women in bonnets */
const FOLK_O: Outfit[] = [
  { jacket: "#3f6fb5", pants: "#3b3f52", boots: "#4a3426", hat: "tophat" }, { jacket: "#8c3b4a", pants: "#3b3f52", boots: "#4a3426", hat: "bonnet", dress: "#c25a7a" },
  { jacket: "#5d7a3a", pants: "#4a4038", boots: INK, hat: "bowler", cap: "#4a3a2a", moustache: "#5b3a22", skin: "#f5c9a0" }, { jacket: "#b5653f", pants: "#3b3f52", boots: "#4a3426", hat: "bonnet", dress: "#d9a441", skin: "#cfa27e" },
  { jacket: "#2f5f6a", pants: "#2e3142", boots: INK, hat: "tophat", moustache: "#d0d0d6", hair: "#8a8a90", build: "stout", skin: "#ecd0b6" }, { jacket: "#7b5ac9", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#8a4a2a", dress: "#5a8fc2", skin: "#ffe2c2" },
  { jacket: "#a84a3a", pants: "#55504a", boots: INK, hat: "cap", cap: "#6a5a40", skin: "#cfa27e" }, { jacket: "#4a6a8a", pants: "#3b3f52", boots: "#4a3426", hat: "bonnet", dress: "#8a5aa8", skin: "#f5c9a0" },
  { jacket: "#6a5a2a", pants: "#3f3a36", boots: INK, hat: "hair", hair: "#2b2026", moustache: "#2b2026", tie: "#c8312b" }, { jacket: "#3f8a7a", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#d9b24a", dress: "#3f8a7a" },
  { jacket: "#55504a", pants: "#2e2a36", boots: INK, hat: "tophat", glasses: true, skin: "#f3ddc6" }, { jacket: "#b0763a", pants: "#3b3f52", boots: "#4a3426", hat: "bonnet", dress: "#b03a44", skin: "#ecd0b6" },
  { jacket: "#8a6a9a", pants: "#4a4038", boots: INK, hat: "beret", cap: "#2e3142", beard: "#5b3a22", moustache: "#5b3a22" }, { jacket: "#c9a25a", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#3a2a1e", dress: "#6a9a5a", skin: "#cfa27e" },
  { jacket: "#3a4a3a", pants: "#3a3540", boots: INK, hat: "bowler", cap: "#2b2b30", build: "stout", moustache: "#8a8a90", skin: "#ffe2c2" }, { jacket: "#9a4a6a", pants: "#3b3f52", boots: "#4a3426", hat: "bonnet", dress: "#e08a5a" },
];
/** sixteen different people: no two share a coat, a hat and a face */
export const FOLK: Who[] = FOLK_O.map((o, k) => W(100 + k, "folk" + k, o));

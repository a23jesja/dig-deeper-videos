// Written by out/three-ways/scripts/cut_guard.py: do not edit by hand.
// Part boxes and joints of the guard puppet, in the 768 x 1280 pixel space of the sheet cells.
export const FIG_W = 768, FIG_H = 1280, LEG_COL = "#2b282d", ARM_COL = "#b1a99e", LEG_W = 18.0;
export const PARTS = {
 "torso": {
  "file": "torso.png",
  "x": 254.0,
  "y": 434.0,
  "w": 258.0,
  "h": 432.0
 },
 "armL_upper": {
  "file": "armL_upper.png",
  "x": 177.3,
  "y": 449.4,
  "w": 94.9,
  "h": 127.4
 },
 "armL_lower": {
  "file": "armL_lower.png",
  "x": 156.5,
  "y": 357.1,
  "w": 76.7,
  "h": 123.5
 },
 "handL": {
  "file": "handL.png",
  "x": 145.8,
  "y": 306.4,
  "w": 55,
  "h": 64
 },
 "armR_upper": {
  "file": "armR_upper.png",
  "x": 490.6,
  "y": 449.4,
  "w": 98.8,
  "h": 127.4
 },
 "armR_lower": {
  "file": "armR_lower.png",
  "x": 536.1,
  "y": 354.5,
  "w": 75.4,
  "h": 126.1
 },
 "handR": {
  "file": "handR.png",
  "x": 568.6,
  "y": 306.4,
  "w": 54.6,
  "h": 63.7
 },
 "legL_upper": {
  "file": "legL_upper.png",
  "x": 310.0,
  "y": 858.0,
  "w": 37.0,
  "h": 209.0
 },
 "legL_lower": {
  "file": "legL_lower.png",
  "x": 305.0,
  "y": 1041.0,
  "w": 30.0,
  "h": 179.0
 },
 "footL": {
  "file": "footL.png",
  "x": 263.0,
  "y": 1200.0,
  "w": 80.0,
  "h": 52.0
 },
 "legR_upper": {
  "file": "legR_upper.png",
  "x": 422.0,
  "y": 860.0,
  "w": 36.0,
  "h": 208.0
 },
 "legR_lower": {
  "file": "legR_lower.png",
  "x": 433.0,
  "y": 1042.0,
  "w": 30.0,
  "h": 178.0
 },
 "footR": {
  "file": "footR.png",
  "x": 425.0,
  "y": 1200.0,
  "w": 81.0,
  "h": 52.0
 },
 "head_neutral": {
  "file": "head_neutral.png",
  "x": 200.5,
  "y": 207.5,
  "w": 335.2,
  "h": 317.0
 },
 "head_shock": {
  "file": "head_shock.png",
  "x": 200.5,
  "y": 207.5,
  "w": 335.6,
  "h": 317.0
 },
 "head_look": {
  "file": "head_look.png",
  "x": 222.7,
  "y": 207.5,
  "w": 326.7,
  "h": 317.0
 },
 "head_side": {
  "file": "head_side.png",
  "x": 240.0,
  "y": 212.0,
  "w": 379.0,
  "h": 330.0
 },
 "torso_side": {
  "file": "torso_side.png",
  "x": 289.0,
  "y": 518.0,
  "w": 214.0,
  "h": 352.0
 },
 "back": {
  "file": "back.png",
  "x": 198.0,
  "y": 207.0,
  "w": 361.0,
  "h": 1045.0
 }
} as const;
export const J = {
 "shL": [
  271.2,
  564.6
 ],
 "elL": [
  203.8,
  464.4
 ],
 "wrL": [
  173.3,
  333.1
 ],
 "shR": [
  496.8,
  564.7
 ],
 "elR": [
  563.4,
  464.4
 ],
 "wrR": [
  594.7,
  333.2
 ],
 "hipL": [
  334.0,
  851.5
 ],
 "knL": [
  322.0,
  1053.5
 ],
 "anL": [
  317.5,
  1208.5
 ],
 "sole": 1248.0,
 "hipR": [
  434.2,
  853.4
 ],
 "knR": [
  445.2,
  1054.4
 ],
 "anR": [
  450.5,
  1208.5
 ],
 "hip": [
  384.1,
  851.5
 ],
 "neck": [
  370,
  504
 ],
 "s_neck": [
  396.0,
  531.0
 ],
 "s_hip": [
  393.9,
  840.0
 ],
 "b_sole": 1248.0,
 "b_cx": 383.1
} as unknown as Record<string, [number, number]> & { sole: number; b_sole: number; b_cx: number };

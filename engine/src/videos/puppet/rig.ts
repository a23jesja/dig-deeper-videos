// Written by out/figures-ai/scripts/cut_parts.py: do not edit by hand.
// Part boxes and joints in the pixel space of the drawing the parts were cut from.
export const FIG_W = 768, FIG_H = 1280, SKIN = "#fbd9bc", INK = "#271924";
export const PARTS = {
 "head": {
  "file": "head.png",
  "x": 202.0,
  "y": 227.0,
  "w": 334.0,
  "h": 301.0
 },
 "cap": {
  "file": "cap.png",
  "x": 227.0,
  "y": 228.0,
  "w": 288.0,
  "h": 119.0
 },
 "torso": {
  "file": "torso.png",
  "x": 252.0,
  "y": 434.0,
  "w": 261.0,
  "h": 430.0
 },
 "armL_upper": {
  "file": "armL_upper.png",
  "x": 180.0,
  "y": 454.6,
  "w": 92.3,
  "h": 122.2
 },
 "armL_lower": {
  "file": "armL_lower.png",
  "x": 156.6,
  "y": 357.1,
  "w": 72.8,
  "h": 118.3
 },
 "handL": {
  "file": "handL.png",
  "x": 148.3,
  "y": 308.6,
  "w": 52,
  "h": 64
 },
 "armR_upper": {
  "file": "armR_upper.png",
  "x": 490.2,
  "y": 453.8,
  "w": 96.2,
  "h": 120.9
 },
 "armR_lower": {
  "file": "armR_lower.png",
  "x": 538.3,
  "y": 355.0,
  "w": 72.8,
  "h": 119.6
 },
 "handR": {
  "file": "handR.png",
  "x": 569.5,
  "y": 306.9,
  "w": 52.0,
  "h": 63.7
 },
 "legL_upper": {
  "file": "legL_upper.png",
  "x": 309.0,
  "y": 858.0,
  "w": 37.0,
  "h": 205.0
 },
 "legL_lower": {
  "file": "legL_lower.png",
  "x": 306.0,
  "y": 1045.0,
  "w": 29.0,
  "h": 173.0
 },
 "footL": {
  "file": "footL.png",
  "x": 264.0,
  "y": 1202.0,
  "w": 77.0,
  "h": 50.0
 },
 "legR_upper": {
  "file": "legR_upper.png",
  "x": 421.0,
  "y": 858.0,
  "w": 38.0,
  "h": 205.0
 },
 "legR_lower": {
  "file": "legR_lower.png",
  "x": 433.0,
  "y": 1045.0,
  "w": 30.0,
  "h": 173.0
 },
 "footR": {
  "file": "footR.png",
  "x": 426.0,
  "y": 1202.0,
  "w": 78.0,
  "h": 50.0
 },
 "cane": {
  "file": "cane.png",
  "x": -137.7,
  "y": 301.0,
  "w": 356,
  "h": 470
 }
} as const;
export const J = {
 "shL": [
  270.9,
  564.7
 ],
 "elL": [
  204.1,
  464.3
 ],
 "wrL": [
  174.3,
  335.0
 ],
 "shR": [
  497.9,
  563.0
 ],
 "elR": [
  562.0,
  463.5
 ],
 "wrR": [
  594.5,
  333.2
 ],
 "hipL": [
  333.5,
  851.5
 ],
 "knL": [
  322.0,
  1053.5
 ],
 "anL": [
  318.0,
  1208.5
 ],
 "sole": 1248.0,
 "hipR": [
  433.1,
  851.5
 ],
 "knR": [
  445.2,
  1053.5
 ],
 "anR": [
  449.5,
  1208.5
 ],
 "hip": [
  383.3,
  851.5
 ],
 "neck": [
  370,
  504
 ],
 "capHinge": [
  228,
  309
 ],
 "capGrip": [
  512,
  301
 ],
 "mouth": [
  350,
  488
 ],
 "eye": [
  356,
  386
 ],
 "restL": [
  222.9,
  814.7
 ],
 "restR": [
  545.9,
  813.0
 ]
} as unknown as Record<string, [number, number]> & { sole: number };

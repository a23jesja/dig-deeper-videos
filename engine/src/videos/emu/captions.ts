// Caption chunks for the new caption style (2-3 words at a time, one line, in a band below the characters). Pure: used by Emu.tsx (drawing)
// and by scripts/kit_check.mjs (CAPTION / ENDHOOK rules).
export type CapWord = { w: string; a: number; b: number; line: string };
export type Chunk = { a: number; b: number; text: string; words: number; size: number };
/** caption text 104 px in a condensed bold face (Impact), shrinking only if a chunk is wider than 1000 px; signs use the same 104 px */
export const CAP = { size: 120, minSize: 96, maxW: 1000, centerY: 0.78, charW: 0.5, maxChars: 14, font: "Impact, 'Arial Narrow Bold', 'Haettenschweiler', sans-serif" };
const hasDigit = (w: string) => /\d/.test(w);
const WEAK = new Set(["the", "a", "an", "of", "to", "and", "in", "at", "on", "is", "am", "are", "for", "it", "i", "up"]);
const endsPhrase = (w: string) => /[.,:;!?]$/.test(w);
const fit = (t: string) => Math.max(CAP.minSize, Math.min(CAP.size, CAP.maxW / (t.length * CAP.charW)));
/** Splits words into chunks of two or three: never across a sentence end or a comma / colon, a number keeps the word after it,
 *  and a chunk does not end on a weak word. `explicit` is an optional list of the exact chunks (a film may pass one). */
export const chunkWords = (words: CapWord[], explicit?: string[]): Chunk[] => {
  const out: Chunk[] = [];
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (explicit) {
    let i = 0;
    for (const e of explicit) {
      const toks = e.split(/\s+/).filter(Boolean);
      const ws = words.slice(i, i + toks.length);
      if (ws.length < toks.length || ws.some((w, k) => norm(w.w) !== norm(toks[k]))) throw new Error(`caption chunk "${e}" does not match the words at ${i}: ${words.slice(i, i + toks.length).map((w) => w.w).join(" ")}`);
      out.push({ a: ws[0].a - 0.03, b: ws[ws.length - 1].b, text: ws.map((w) => w.w).join(" "), words: ws.length, size: fit(ws.map((w) => w.w).join(" ")) });
      i += toks.length;
    }
  } else {
    // segments end at a sentence end or a comma / colon
    const segs: CapWord[][] = []; let cur: CapWord[] = [];
    for (const w of words) { cur.push(w); if (endsPhrase(w.w)) { segs.push(cur); cur = []; } }
    if (cur.length) segs.push(cur);
    for (const L of segs) {
      const n = L.length, txt = (i: number, k: number) => L.slice(i, i + k).map((w) => w.w).join(" ");
      const best: { c: number; cut: number }[] = Array.from({ length: n + 1 }, () => ({ c: 1e9, cut: 0 }));
      best[n] = { c: 0, cut: 0 };
      for (let i = n - 1; i >= 0; i--) for (const k of n - i <= 3 ? [n - i] : [2, 3]) {
        if (k > 3 || (k < 2 && n > 1) || i + k > n || (n - i - k === 1)) continue;
        const last = L[i + k - 1], t = txt(i, k);
        if (i + k < n && (hasDigit(last.w) || WEAK.has(norm(last.w)))) continue;
        const over = Math.max(0, t.length - CAP.maxChars), c = over * over * 4 + (k === 3 ? 1 : 0) + best[i + k].c;
        if (c < best[i].c) best[i] = { c, cut: k };
      }
      if (best[0].c >= 1e9) { for (let i = 0; i < n; i += 2) { const k = Math.min(2, n - i), ws = L.slice(i, i + k); out.push({ a: ws[0].a - 0.03, b: ws[k - 1].b, text: txt(i, k), words: k, size: fit(txt(i, k)) }); } continue; }
      for (let i = 0; i < n; i += best[i].cut) { const k = best[i].cut, ws = L.slice(i, i + k); out.push({ a: ws[0].a - 0.03, b: ws[k - 1].b, text: txt(i, k), words: k, size: fit(txt(i, k)) }); }
    }
  }
  out.sort((x, y) => x.a - y.a);
  for (let k = 0; k < out.length; k++) { const nx = out[k + 1]; out[k].b = nx && nx.a - out[k].b < 0.45 ? nx.a : out[k].b + 0.25; }
  return out;
};
export const chunkAt = (chunks: Chunk[], t: number): Chunk | null => chunks.find((c) => t >= c.a && t < c.b) ?? null;

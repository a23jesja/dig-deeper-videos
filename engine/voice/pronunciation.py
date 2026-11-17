# Shared pronunciation locks. Kokoro-onnx 0.4.7 (no misaki installed) has no inline [word](/ph/) syntax;
# the only supported hook is Kokoro.create(phonemes, is_phonemes=True) (kokoro_onnx/__init__.py, create()).
# So a line that contains a locked word is phonemized piece by piece: text before and after the word goes through
# espeak as usual (k.tokenizer.phonemize), the locked word is inserted as its fixed phonemes, and the joined
# phoneme string is passed with is_phonemes=True. Lines without a locked word are untouched (plain text path).
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
PATH = os.path.join(HERE, "pronunciation.json")

def load():
    d = json.load(open(PATH, encoding="utf-8"))["words"]
    return {w.lower(): v["ph"] for w, v in d.items()}

def locked_words_in(text, table=None):
    table = table if table is not None else load()
    return [m.group(1).lower() for m in _pat(table).finditer(text)] if table else []

def _pat(table):
    ws = sorted(table, key=len, reverse=True)
    return re.compile(r"(?<![\w'])(" + "|".join(re.escape(w) for w in ws) + r")(?![\w'])", re.I)

def phonemize_line(k, text, lang="en-gb", table=None):
    """Return the phoneme string for the line, or None when the line has no locked word."""
    table = table if table is not None else load()
    if not table:
        return None
    ms = list(_pat(table).finditer(text))
    if not ms:
        return None
    vocab = k.tokenizer.vocab
    for m in ms:
        bad = [c for c in table[m.group(1).lower()] if c not in vocab]
        if bad:
            raise ValueError("pronunciation.json: symbols not in Kokoro vocab for %r: %r" % (m.group(1), bad))
    out, pos, carry = [], 0, ""
    for i, m in enumerate(ms):
        piece = carry + text[pos:m.start()]
        carry = ""
        if re.search(r"\w", piece):
            out.append(k.tokenizer.phonemize(piece.strip(), lang))
        # punctuation straight after the word stays attached to it
        nxt = text[m.end():ms[i + 1].start() if i + 1 < len(ms) else len(text)]
        p = re.match(r"[.,!?;:]+", nxt)
        punct = p.group(0) if p else ""
        out.append(table[m.group(1).lower()] + punct)
        pos = m.end() + len(punct)
    tail = text[pos:]
    if re.search(r"\w", tail):
        out.append(k.tokenizer.phonemize(tail.strip(), lang))
    return " ".join(x for x in out if x)

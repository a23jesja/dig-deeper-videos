# One line in George's voice (ElevenLabs, engine/voice/narrator.json): three takes, the best one picked by faster-whisper small.en.
#   python voice/el_line.py <out_dir> "<the line>" <max_chars>      (from engine/)
# The key is read from the environment variable ELEVENLABS_API_KEY only; it is never printed, logged or written to a file.
# The characters are counted first (len(line) x 3 must be within max_chars), and the account's character_count is read before and after.
import json, os, re, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
N = json.load(open(os.path.join(HERE, os.environ.get("VOICE_FILE", "narrator.json")), encoding="utf-8"))      # (VOICE_FILE=partner.json: Daniel, the partner)
API = "https://api.elevenlabs.io/v1"


def req(path, body=None):
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key: raise SystemExit("ELEVENLABS_API_KEY is not set in the environment")
    r = urllib.request.Request(API + path, data=None if body is None else json.dumps(body).encode(), method="GET" if body is None else "POST",
                               headers={"xi-api-key": key, "Content-Type": "application/json", "Accept": "*/*"})
    with urllib.request.urlopen(r, timeout=120) as f: return f.read()


def used():
    s = json.loads(req("/user/subscription")); return s["character_count"], s["character_limit"]


def words(t): return re.findall(r"[a-z']+", t.lower())


def wer(ref, hyp):
    a, b = words(ref), words(hyp); d = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        p, d[0] = d[0], i
        for j in range(1, len(b) + 1): p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (a[i - 1] != b[j - 1]))
    return d[len(b)] / max(1, len(a))


def load16k(path):
    """the take as 16 kHz mono floats, decoded by ffmpeg (faster-whisper's own decoder clashes with the installed PyAV)"""
    import subprocess, numpy as np
    raw = subprocess.run(["ffmpeg", "-v", "error", "-nostdin", "-i", path, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)


def pick(out, line, takes, c0=None, c1=None):
    from faster_whisper import WhisperModel
    m = WhisperModel("small.en", device="cpu", compute_type="int8"); best = None
    for k in range(takes):
        segs, _ = m.transcribe(load16k(os.path.join(out, f"take{k}.mp3")), language="en", word_timestamps=True)
        segs = list(segs); hyp = " ".join(s.text for s in segs); e = wer(line, hyp)
        print(f"take{k}: {hyp.strip()!r} word errors {e:.2f}")
        if best is None or e < best[0]: best = (e, k, [{"w": w.word.strip(), "a": round(w.start, 3), "b": round(w.end, 3)} for s in segs for w in s.words])
    json.dump({"line": line, "take": best[1], "word_errors": best[0], "words": best[2], "character_count_before": c0, "character_count_after": c1}, open(os.path.join(out, "pick.json"), "w", encoding="utf-8"), indent=1)
    print(f"picked take{best[1]}")


def main():
    if sys.argv[1] == "--pick-only":      # (the takes are there already: pick again without any call)
        out, line = sys.argv[2], sys.argv[3]; c0 = int(sys.argv[4]) if len(sys.argv) > 4 else None; c1 = int(sys.argv[5]) if len(sys.argv) > 5 else None
        return pick(out, line, N["takes_per_sentence"], c0, c1)
    out, line, cap = sys.argv[1], sys.argv[2], int(sys.argv[3]); takes = N["takes_per_sentence"]
    need = len(line) * takes
    print(f"pre-count: {len(line)} characters x {takes} takes = {need} (cap {cap})")
    if need > cap: raise SystemExit("over the cap: nothing sent")
    os.makedirs(out, exist_ok=True)
    c0, lim = used(); print(f"character_count before: {c0} of {lim}")
    for k in range(takes):
        audio = req(f"/text-to-speech/{N['voice_id']}?output_format={N['output_format']}", {"text": line, "model_id": N["model_id"]})
        open(os.path.join(out, f"take{k}.mp3"), "wb").write(audio)
    c1, _ = used(); print(f"character_count after: {c1} (used {c1 - c0})")
    pick(out, line, takes, c0, c1)


if __name__ == "__main__":
    main()

# The picked take's loudness at 30 frames a second (RMS per frame, the loudest frame 1.0), written into its pick.json as "env30" for the mouths.
#   python voice/env30.py voice/roberts/*/pick.json      (from engine/)
import json, subprocess, sys
import numpy as np
for p in sys.argv[1:]:
    d = json.load(open(p, encoding="utf-8")); take = p.replace("pick.json", f"take{d['take']}.mp3")
    raw = subprocess.run(["ffmpeg", "-v", "error", "-nostdin", "-i", take, "-f", "f32le", "-ac", "1", "-ar", "48000", "-"], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.float32); n = 1600; k = int(np.ceil(len(a) / n)); a = np.pad(a, (0, k * n - len(a)))
    rms = np.sqrt((a.reshape(k, n) ** 2).mean(axis=1)); rms = rms / (rms.max() or 1)
    d["env30"] = [round(float(x), 3) for x in rms]; json.dump(d, open(p, "w", encoding="utf-8"), indent=1); print(p, len(d["env30"]))

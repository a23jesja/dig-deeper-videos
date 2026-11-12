# Lip-sync envelope: how far the narrator's mouth is open on every frame (0..1), from the voice track.
# usage: python scripts/talk.py <voice.wav> <frames> <out.json>
import json, sys
import numpy as np, soundfile as sf

v, sr = sf.read(sys.argv[1]); v = v if v.ndim == 1 else v[:, 0]
N = int(sys.argv[2]); hop = sr / 30; env = []
for i in range(N):
    seg = v[int(i * hop): int((i + 1) * hop)]
    env.append(float(np.sqrt(np.mean(seg ** 2))) if len(seg) else 0.0)
env = np.array(env); ref = np.percentile(env[env > 0.005], 80) if (env > 0.005).any() else 1
talk = np.clip(env / ref, 0, 1); talk[env < 0.012] = 0
talk = np.maximum(talk, np.r_[0, talk[:-1]] * 0.5)
json.dump([round(float(x), 2) for x in talk], open(sys.argv[3], "w"))
print("talk", len(talk), round(float(talk.mean()), 3))
